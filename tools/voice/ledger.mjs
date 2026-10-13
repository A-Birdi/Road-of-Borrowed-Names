// VA-1: the usage ledger and the spending allowance. One append-only JSON-lines file per authorization
// (docs/future/voice/usage/<authorization id>.jsonl), kept apart from any corpus revision or output directory so an
// allowance follows its authorization wherever the runner writes. Every HTTP attempt to a paid provider is written
// before it is sent (`attempt`, with its cost bound) and again when it ends (`outcome`); nothing is rewritten or
// removed, so a rerun never replaces earlier usage and an attempt whose outcome was never written counts at its bound.
//
// What an attempt counts against the allowance:
//  - the provider's reported usage priced with the authorization's prices, when the response reports it;
//  - otherwise its bound (the most it could cost: the request's input and its max_output_tokens, or its characters)
//    when it may have been billed: any 2xx, any 5xx, a connection that broke after sending, a timeout;
//  - nothing only when it plainly was not processed: no connection made (the request never left), or a refusal the
//    provider gives before generating (400, 401, 403, 404, 409, 413, 422, 429). That is an assumption about provider
//    billing, written into each outcome as `basis`.
// A character count is not a dollar cap for a token-priced provider: the allowance is in US dollars, from prices the
// authorization names with their source and date.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const NOT_PROCESSED = new Set([400, 401, 403, 404, 409, 413, 422, 429]);
const NOT_SENT = new Set(['ENOTFOUND', 'EAI_AGAIN', 'ECONNREFUSED', 'ERR_INVALID_URL', 'UND_ERR_CONNECT_TIMEOUT', 'ENETUNREACH', 'EHOSTUNREACH']);

export function ledgerFile(dir, authorizationId) {
  if (!/^[A-Za-z0-9._-]{3,80}$/.test(authorizationId || '')) throw new Error('an authorization id of 3–80 letters, digits, dots, dashes or underscores is required');
  return path.join(dir, authorizationId + '.jsonl');
}
export function readLedger(file) {
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
}
function append(file, entry) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const fd = fs.openSync(file, 'a');
  try { fs.writeSync(fd, JSON.stringify(entry) + '\n'); fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
}

// US dollars for a usage or a bound under the authorization's pricing
export function priceOf(pricing, u) {
  if (!pricing || !u) return null;
  if (pricing.unit === 'tokens') return ((u.inputTokens || 0) * pricing.inputUsdPerMTok + (u.outputTokens || 0) * pricing.outputAudioUsdPerMTok) / 1e6;
  if (pricing.unit === 'characters') return ((u.characters || 0) * pricing.usdPerMChars) / 1e6;
  return null;
}

// what the ledger has counted so far, attempt by attempt
export function spentOf(entries) {
  const out = new Map();
  for (const e of entries) {
    if (e.type === 'attempt') out.set(e.id, { attempt: e, outcome: null });
    else if (e.type === 'outcome' && out.has(e.id)) out.get(e.id).outcome = e;
  }
  let usd = 0, attempts = 0, open = 0;
  for (const { attempt, outcome } of out.values()) {
    attempts++;
    if (!outcome) { open++; usd += attempt.boundUsd; } else usd += outcome.countedUsd;
  }
  return { usd, attempts, unfinished: open };
}

// classify how an attempt ended
export function classify({ httpStatus, errorCode }) {
  if (httpStatus == null) return NOT_SENT.has(errorCode) ? { billable: 'not_billed', basis: 'no connection was made (' + errorCode + '): the request never left' } : { billable: 'possibly_billed', basis: 'the connection failed after the request may have been sent (' + (errorCode || 'unknown') + ')' };
  if (httpStatus >= 200 && httpStatus < 300) return { billable: 'billed', basis: 'the provider answered ' + httpStatus };
  if (NOT_PROCESSED.has(httpStatus)) return { billable: 'not_billed', basis: 'refused before generation (' + httpStatus + '): assumed not billed' };
  return { billable: 'possibly_billed', basis: 'the provider failed (' + httpStatus + ') after it may have generated' };
}

// open an attempt: refuses (throws) when the allowance could be exceeded by it; otherwise writes it and returns its id
export function openAttempt(file, auth, info) {
  const entries = readLedger(file);
  const spent = spentOf(entries);
  const boundUsd = priceOf(auth.pricing, info.bound);
  if (boundUsd == null) throw new Error('no price for this request: the authorization\'s pricing does not cover it');
  if (spent.usd + boundUsd > auth.allowanceUsd + 1e-12) {
    throw Object.assign(new Error('allowance reached: US$' + spent.usd.toFixed(4) + ' counted of US$' + auth.allowanceUsd.toFixed(2) + '; this request could cost up to US$' + boundUsd.toFixed(4)), { allowance: true });
  }
  const id = crypto.randomUUID();
  append(file, Object.assign({ type: 'attempt', id, at: new Date().toISOString(), authorizationId: auth.id, boundUsd }, info));
  return { id, boundUsd };
}
export function closeAttempt(file, auth, id, boundUsd, result) {
  const c = classify(result);
  const actualUsd = result.usage ? priceOf(auth.pricing, result.usage) : null;
  const countedUsd = actualUsd != null ? actualUsd : (c.billable === 'not_billed' ? 0 : boundUsd);
  const entry = { type: 'outcome', id, at: new Date().toISOString(), httpStatus: result.httpStatus == null ? null : result.httpStatus, errorCode: result.errorCode || null, billable: c.billable, basis: c.basis, usage: result.usage || null, actualUsd, countedUsd };
  append(file, entry);
  return entry;
}
