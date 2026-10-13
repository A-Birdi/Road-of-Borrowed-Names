// VA-1 audition runner: one script for every configuration, the same takes and the same result records wherever it
// runs (here, or on Robin's machine next to a local engine). By default it only plans; nothing is sent unless:
//  - local engines: the run names who authorised it (`--authorised "<who, when, scope>"`) and the engine answers;
//  - hosted providers: an approved authorization file (`--authorization <file>`, rbn-voice-authorization-1: who
//    approved, when, which kinds, the US-dollar allowance, the model, the prices with their source and date) and an
//    explicit credential mode: `--auth proxy` (the environment's proxy injects the provider's header: network
//    secrets; the runner sends no credential and routes through the proxy) or `--auth env` (the runner reads the
//    named environment variable). No credential is ever written, printed or invented.
// Every paid HTTP attempt, transport retries included, goes into the authorization's append-only usage ledger
// (tools/voice/ledger.mjs, docs/future/voice/usage/<id>.jsonl) before it is sent, and is refused when it could take
// the ledger past the allowance.
//
//   node tools/voice/audition.mjs plan   --config <id> [--kind smoke|screen|matrix] [--cast <file>] [--authorization <file>]
//   node tools/voice/audition.mjs voices --config <local id> [--engine-url <url>] [--save <file.json>]
//                                        (--save keeps each voice's styles and its own terms, as the engine bundles them)
//   node tools/voice/audition.mjs run    --config <id> --kind smoke|screen|matrix|samples [--cases N01,N02]
//                                        (local) --authorised "<who, when, scope>" [--engine-url <url>]
//                                        (hosted) --authorization <file> --auth proxy|env
//   node tools/voice/audition.mjs repair --config <id> --take <takeId> --reason "<documented cause>" (+ the run's access)
//   node tools/voice/audition.mjs usage  --authorization <file>          (what the ledger has counted)
//   node tools/voice/audition.mjs export-job | ingest --config qwen --kind …   (tools/voice/qwen_local_job.py)
//   node tools/voice/audition.mjs status [--out <dir>]
//
// Output (never committed; .gitignore has voice-audition/): voice-audition/VA1/<corpus revision>/
//   requests/<config>/<case>/<take>.json   the request as built and as submitted, credentials as placeholders only
//   audio/masters/<config>/<case>/<take>[.a2][.r<n>].<ext>   the provider's output, untouched
//   results.json   append-only rbn-voice-result-1 records (a rerun adds a record; none is overwritten)
// Evidence is kept apart in each record: requestValidation (the built request against the corpus), providerAcceptance
// (what the provider answered), technicalCheck (measurements that can flag anomalies, never prove the words),
// lexicalCheck (not run: no recogniser here) and listeningReview (only a person sets it, per attempt and audio hash).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { PROVIDERS, ORDER, readingCheck, validateRequest } from './providers.mjs';
import { checkTake } from './audio_check.mjs';
import { ledgerFile, readLedger, spentOf, openAttempt, closeAttempt, priceOf } from './ledger.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const CORPUS = path.join(ROOT, 'docs/future/voice/corpus/audition_corpus.json');
const LEDGER_DIR = path.join(ROOT, 'docs/future/voice/usage');
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const canon = (o) => JSON.stringify(o, (k, v) => (v && typeof v === 'object' && !Array.isArray(v) ? Object.fromEntries(Object.keys(v).sort().map((x) => [x, v[x]])) : v));

export function loadCorpus(file = CORPUS) {
  const raw = fs.readFileSync(file);
  const corpus = JSON.parse(raw);
  return { corpus, revision: 'corpus-' + sha(raw).slice(0, 10) };
}
export function loadCast(config, file) {
  const f = file || path.join(ROOT, 'docs/future/voice/casting', config + '.json');
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : null;
}
const chars = (s) => [...s].length;

// the casting screen's two anchor lines per role (§04): the named anchors, else the role's two shortest lines; the
// same rule as tools/voice/corpus.mjs, so the character count matches the corpus's accounting
export function anchorsOf(corpus, role) {
  const named = corpus.cases.filter((x) => x.castingProfile === role && x.screeningCandidate);
  if (named.length) return named;
  return corpus.cases.filter((x) => x.castingProfile === role).slice().sort((a, b) => a.spokenText.length - b.spokenText.length).slice(0, 2);
}

// every cell a kind needs, with the voice it uses; a cell without a usable voice carries why
export function cellsOf(corpus, cast, kind, only) {
  const roles = [...new Set(corpus.cases.map((x) => x.castingProfile))];
  const roleOf = (p) => (cast && cast.roles && cast.roles[p]) || null;
  const pick = (p, label) => { const r = roleOf(p); return r && (r.candidates || []).find((v) => v.label === label) || null; };
  const out = [];
  if (kind === 'screen') {
    for (const p of roles) {
      const cands = ((roleOf(p) || {}).candidates || []).slice(0, 3);
      if (!cands.length) { for (const c of anchorsOf(corpus, p)) out.push({ c, take: 'directed', kind, voice: null, voiceLabel: 'C?', takeId: 'screen.' + p + '.C-.' + c.caseId, why: 'no candidates listed for ' + p }); continue; }
      for (const v of cands) for (const c of anchorsOf(corpus, p)) if (!only || only.includes(c.caseId)) out.push({ c, take: 'directed', kind, voice: v, voiceLabel: v.label, takeId: 'screen.' + p + '.' + v.label + '.' + c.caseId });
    }
  } else {
    // `samples`: a handful of named cases (a paid provider's first look, Robin 2026-10-13), each directed, with the
    // smoke pair's neutral control so a direction read aloud still shows; it uses each role's first candidate
    if (kind === 'samples' && !only) return [];
    const cases = kind === 'smoke' ? corpus.cases.filter((x) => (only ? only.includes(x.caseId) : x.caseId === 'N02')) : corpus.cases.filter((x) => !only || only.includes(x.caseId));
    for (const c of cases) {
      const r = roleOf(c.castingProfile);
      // the smoke check comes before casting (§04), so it uses the role's first candidate when none is selected yet
      const v = r && r.selected ? pick(c.castingProfile, r.selected) : ((kind === 'smoke' || kind === 'samples') && r && (r.candidates || [])[0]) || null;
      const label = v ? v.label : 'C?';
      const early = kind === 'smoke' || kind === 'samples';
      const why = v ? null : (r ? (early ? 'no candidate listed for ' : 'no voice selected for ') + c.castingProfile + (early ? '' : ' (the casting screen comes first)') : 'no casting file entry for ' + c.castingProfile);
      // the smoke check is one line twice, with and without its direction, so a direction read aloud shows as a
      // duration difference before anything else is generated
      const takes = kind === 'smoke' || (kind === 'samples' && c.caseId === 'N02') ? ['directed', 'neutral_control'] : kind === 'samples' ? ['directed'] : ['directed'].concat(c.neutralControl ? ['neutral_control'] : []);
      const prefix = kind === 'smoke' ? 'smoke.' : kind === 'samples' ? 'sample.' : '';
      for (const t of takes) out.push({ c, take: t, kind, voice: v, voiceLabel: label, takeId: prefix + c.caseId + '.' + (t === 'directed' ? 'd' : 'n') + '.' + label, why });
    }
  }
  return out;
}

// the model a request names (the casting file pins it; a change must be recorded in cast.modelChanges)
const modelOf = (plan) => (plan && plan.request && plan.request.body && (plan.request.body.model || plan.request.body.model_id)) || null;

// the provider's request for one cell, validated, with the record fields the result needs
export function planCell(config, cell, ctx = {}) {
  const P = PROVIDERS[config];
  const c = cell.c;
  const cast = ctx.cast || {};
  const base = { caseId: c.caseId, takeId: cell.takeId, takeKind: cell.take, kind: cell.kind, configurationId: config, voiceLabel: cell.voiceLabel, lineId: c.lineId, sourceCommit: c.sourceCommit, spokenTextSha256: sha(c.spokenText), characters: chars(c.spokenText), c };
  if (cell.why) return Object.assign(base, { blocked: cell.why });
  const opts = { modelReview: cast.modelReview, audioTokensPerSecond: ctx.auth && ctx.auth.pricing && ctx.auth.pricing.audioTokensPerSecondBudget };
  const plan = P.build(c, cell.voice.voice, cell.take, opts);
  base.rightsStatus = (cell.voice.rights && cell.voice.rights.status) || 'not_checked';
  // a hosted prebuilt voice's terms are the provider's: covered when the authorization records that they were read
  const rightsOk = /^ok/.test(base.rightsStatus) || (base.rightsStatus === 'covered_by_authorization' && ctx.auth && ctx.auth.termsReviewed);
  if (!rightsOk) return Object.assign(base, { blocked: 'rights not checked for ' + cell.voiceLabel + ' (' + c.castingProfile + ')', blockedKind: 'blocked_rights', plan: plan.blocked ? null : plan });
  if (plan.blocked) return Object.assign(base, { blocked: plan.blocked });
  const model = modelOf(plan);
  const pinned = cast.pinned && cast.pinned.modelId;
  if (model && pinned && model !== pinned && !(cast.modelChanges || []).some((m) => m.to === model)) return Object.assign(base, { blocked: 'model ' + model + ' differs from the pinned ' + pinned + ' and no model change is recorded' });
  const validation = validateRequest(config, plan, c, cell.take);
  if (validation.status !== 'passed') return Object.assign(base, { blocked: 'request validation failed: ' + validation.checks.filter((x) => !x.ok).map((x) => x.name).join('; '), plan, validation });
  const built = plan.request || plan.engine || plan.local;
  return Object.assign(base, { plan, validation, model: model || pinned || null, requestSha256: sha(canon(built)) });
}

const outDir = (args, revision) => path.resolve(args.out || path.join(ROOT, 'voice-audition', 'VA1', revision));
function readResults(dir) {
  const f = path.join(dir, 'results.json');
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : { schemaVersion: 'rbn-voice-results-2', records: [] };
}
function writeResults(dir, res) {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'results.json'), JSON.stringify(res, null, 1) + '\n');
}
// append-only: a record is never replaced; the latest record of a take attempt is the one in force
const addRecord = (res, rec) => res.records.push(rec);
export const generated = (res, config, takeId, attempt) => res.records.filter((r) => r.configurationId === config && r.takeId === takeId && r.attempt === attempt && r.audioOriginalPath);
function record(p, ctx, extra) {
  const P = PROVIDERS[p.configurationId];
  const plan = p.plan || {};
  return Object.assign({
    schemaVersion: 'rbn-voice-result-2', recordId: crypto.randomUUID(), at: new Date().toISOString(), status: 'not_started',
    caseId: p.caseId, takeId: p.takeId, kind: p.kind, configurationId: p.configurationId, takeKind: p.takeKind, attempt: 1,
    modelId: p.model || (ctx.cast && ctx.cast.pinned && ctx.cast.pinned.modelId) || null, modelVersion: (ctx.cast && ctx.cast.pinned && ctx.cast.pinned.engineVersion) || null,
    authorizationId: (ctx.auth && ctx.auth.id) || null, authorisedBy: ctx.authorised || (ctx.auth && ctx.auth.approvedBy) || null,
    voiceId: p.voiceLabel, styleId: plan.engine ? plan.engine.style : null, lineId: p.lineId, sourceCommit: p.sourceCommit,
    spokenTextSha256: p.spokenTextSha256, requestSha256: p.requestSha256 || null,
    audioOriginalPath: null, audioReviewPath: null, audioSha256: null, actualDurationSeconds: null, generationSeconds: null,
    usage: null, supportedControls: P.controls || [], directionChannel: plan.directionChannel || null, readingChannel: plan.readingChannel || null,
    readingsApplied: plan.readingsApplied || [], readingsNotApplied: plan.readingsNotApplied || [], unsupportedControls: plan.unsupported || [],
    postProcessing: [], blockedReason: p.blocked || null,
    requestValidation: p.validation || { status: 'not_run' },
    providerAcceptance: { status: 'not_sent' },
    technicalCheck: { status: 'not_checked' },
    lexicalCheck: { status: 'not_checked', method: 'no speech recogniser in this tooling', issues: [] },
    listeningReview: { status: 'not_listened', reviewer: null, languageQualification: null, note: 'per attempt and audio hash; set only by a person' },
    scores: { pronunciation: null, prosody: null, identityFit: null, delivery: null, cleanliness: null, weightedTotal: null },
    rightsStatus: p.rightsStatus || 'not_checked', repairOf: null, repairReason: null, robinSelection: null,
  }, extra || {});
}
function writeRequest(dir, p, submitted) {
  const f = path.join(dir, 'requests', p.configurationId, p.caseId, p.takeId + '.json');
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, JSON.stringify({ takeId: p.takeId, caseId: p.caseId, takeKind: p.takeKind, configurationId: p.configurationId, voiceLabel: p.voiceLabel, sentText: p.plan.sentText, spokenTextSha256: p.spokenTextSha256, requestSha256: p.requestSha256, requestValidation: p.validation, directionChannel: p.plan.directionChannel, readingChannel: p.plan.readingChannel, unsupported: p.plan.unsupported, built: p.plan.request || p.plan.engine || p.plan.local, submitted: submitted || null }, null, 1) + '\n');
  return path.relative(dir, f);
}

// ── authorizations ──────────────────────────────────────────────────────────────────────────────────────────────
export function loadAuthorization(file) {
  const a = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (a.schemaVersion !== 'rbn-voice-authorization-1') throw new Error('not an rbn-voice-authorization-1 file');
  return a;
}
// why an authorization does not cover a run (null when it does)
export function authorizationProblem(a, config, kind, cast, today = new Date().toISOString().slice(0, 10)) {
  if (!a) return 'no --authorization file';
  if (a.configurationId !== config) return 'the authorization is for ' + a.configurationId + ', not ' + config;
  // audition approval never covers whole-game production (Robin, 2026-10-13): that needs its own authorization,
  // made after the complete production estimate, and this runner does not take one
  if (a.purpose !== 'audition') return 'this runner takes only audition authorizations (purpose "audition"); whole-game production is approved separately';
  if (!a.approvedBy || !a.approvedOn) return 'the authorization is not approved (approvedBy and approvedOn are empty)';
  if (!(a.allowanceUsd > 0)) return 'the authorization has no US-dollar allowance';
  if (!(a.kinds || []).includes(kind)) return 'the authorization does not cover ' + kind + ' (it covers ' + (a.kinds || []).join(', ') + ')';
  const p = a.pricing || {};
  if (!(p.unit === 'tokens' ? p.inputUsdPerMTok >= 0 && p.outputAudioUsdPerMTok > 0 && p.audioTokensPerSecondBudget > 0 : p.unit === 'characters' && p.usdPerMChars > 0)) return 'the authorization\'s pricing is incomplete';
  if (!p.source || !p.retrievedOn) return 'the authorization\'s pricing names no source or date';
  if (p.validUntil && today > p.validUntil) return 'the prices were valid until ' + p.validUntil + ': update them from the provider before spending';
  const pinned = cast && cast.pinned && cast.pinned.modelId;
  if (a.model && pinned && a.model !== pinned) return 'the authorization is for model ' + a.model + ', the casting file pins ' + pinned;
  return null;
}

// ── sending ─────────────────────────────────────────────────────────────────────────────────────────────────────
const ENV_RE = /<env ([A-Z_]+)>/g;
function fillEnv(s) { return s.replace(ENV_RE, (_, n) => { if (!process.env[n]) throw new Error('missing environment value ' + n); return process.env[n]; }); }
const envNames = (obj) => [...new Set([...JSON.stringify(obj || {}).matchAll(ENV_RE)].map((m) => m[1]))];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// a test or local mock may stand in for the provider's origin, on this machine only
function endpointOf(url, override) {
  if (!override) return url;
  const o = new URL(override);
  if (o.protocol !== 'http:' || !['127.0.0.1', 'localhost', '[::1]'].includes(o.hostname)) throw new Error('--endpoint is only for a mock on this machine (http://127.0.0.1:<port>)');
  const u = new URL(url);
  return o.origin + u.pathname + u.search;
}
function findAudio(o) {
  if (!o || typeof o !== 'object') return null;
  if (o.type === 'audio' && typeof o.data === 'string') return o;
  for (const v of Object.values(o)) { const f = findAudio(v); if (f) return f; }
  return null;
}
// the provider's own usage report, where it gives one
function usageOf(json, unit, characters) {
  if (unit === 'characters') return { characters };
  const u = json && json.usage;
  if (!u || u.total_output_tokens == null) return null;
  return { inputTokens: u.total_input_tokens || 0, outputTokens: (u.total_output_tokens || 0) + (u.total_thought_tokens || 0), byModality: u.output_tokens_by_modality || null };
}
// one hosted take: up to three tries for a transport failure, a 429 or a 5xx, each its own ledger attempt
async function sendHosted(p, ctx) {
  const r = p.plan.request;
  const url = endpointOf(ctx.mode === 'env' ? fillEnv(r.url) : r.url, ctx.endpoint);
  if (/<env /.test(url)) throw new Error('the request URL still needs ' + envNames(url).join(', ') + ' (set it in the casting file)');
  const headers = Object.assign({}, r.headers, ctx.mode === 'env' ? Object.fromEntries(Object.entries(r.authHeaders || {}).map(([k, v]) => [k, fillEnv(v)])) : {});
  const body = typeof r.body === 'string' ? r.body : JSON.stringify(r.body);
  const unit = PROVIDERS[p.configurationId].pricingUnit;
  const bound = unit === 'tokens' ? p.plan.costBound : { characters: (p.plan.costBound && p.plan.costBound.characters) || p.characters };
  const attempts = [];
  for (let attempt = 1; ; attempt++) {
    const open = openAttempt(ctx.ledger, ctx.auth, { configurationId: p.configurationId, model: p.model, corpusRevision: ctx.revision, takeId: p.takeId, takeAttempt: p.attempt, try: attempt, kind: p.kind, characters: p.characters, bound, url: url.replace(/key=[^&]+/g, 'key=<redacted>') });
    let res, err, buf, json;
    const t0 = Date.now();
    try { res = await fetch(url, { method: r.method, headers, body, signal: AbortSignal.timeout(120000) }); buf = Buffer.from(await res.arrayBuffer()); } catch (e) { err = e; }
    const httpStatus = res ? res.status : null;
    const errorCode = err ? ((err.cause && (err.cause.code || err.cause.name)) || err.name || 'error') : null;
    if (res && res.ok && p.plan.response !== 'audio_bytes') { try { json = JSON.parse(buf.toString('utf8')); } catch (e) { json = null; } }
    const usage = res && res.ok ? usageOf(json, unit, bound.characters) : null;
    const out = closeAttempt(ctx.ledger, ctx.auth, open.id, open.boundUsd, { httpStatus, errorCode, usage });
    attempts.push({ id: open.id, httpStatus, errorCode, billable: out.billable, countedUsd: out.countedUsd, ms: Date.now() - t0 });
    if (res && res.ok) {
      let audio = null, type = res.headers.get('content-type') || '';
      if (p.plan.response === 'audio_bytes') audio = buf;
      else if (p.plan.response === 'cloud_tts') { audio = json && json.audioContent ? Buffer.from(json.audioContent, 'base64') : null; type = 'audio/wav'; }
      else { const a = findAudio(json); if (a) { audio = Buffer.from(a.data, 'base64'); type = a.mime_type || a.mimeType || 'audio/wav'; } }
      const ext = audio && (audio.toString('ascii', 0, 4) === 'RIFF' || /wav/.test(type)) ? 'wav' : 'mp3';
      return { audio, type, ext, httpStatus, attempts, usage, submitted: { request: { method: r.method, url, headers: Object.assign({}, r.headers), authHeaders: ctx.mode === 'proxy' ? '(injected by the environment\'s proxy; not seen here)' : Object.fromEntries(Object.keys(r.authHeaders || {}).map((k) => [k, '<from the environment>'])), body: r.body } } };
    }
    const retry = !res || httpStatus === 429 || httpStatus >= 500;
    if (!retry || attempt >= 3) {
      const detail = res ? buf.toString('utf8').replace(/\s+/g, ' ').slice(0, 300) : String(err && err.message);
      return { audio: null, httpStatus, errorCode, attempts, detail };
    }
    await sleep(2000 * attempt);
  }
}
async function http(method, url, headers, body) {
  const res = await fetch(url, { method, headers, body, signal: AbortSignal.timeout(120000) });
  const buf = Buffer.from(await res.arrayBuffer());
  if (!res.ok) throw Object.assign(new Error('HTTP ' + res.status + ' ' + buf.toString('utf8').slice(0, 200)), { status: res.status });
  return buf;
}
async function sendLocal(p, engineUrl) {
  const e = p.plan.engine;
  const base = (engineUrl || 'http://127.0.0.1:' + e.port).replace(/\/$/, '');
  const added = [];
  try {
    for (const w of e.userDict) {
      const q = new URLSearchParams({ surface: w.surface, pronunciation: w.pronunciation, accent_type: String(w.accent_type) });
      added.push(JSON.parse((await http('POST', base + '/user_dict_word?' + q, {})).toString('utf8')));
    }
    const query = JSON.parse((await http('POST', base + '/audio_query?' + new URLSearchParams({ speaker: String(e.style), text: e.text }), {})).toString('utf8'));
    const readings = readingCheck(e.kana == null ? query.kana : null, p.plan.readingsApplied.length ? [] : (p.c.pronunciationOverrides || []));
    Object.assign(query, e.adjust);
    if (e.kana != null) query.kana = e.kana;
    const audio = await http('POST', base + '/synthesis?speaker=' + e.style, { 'Content-Type': 'application/json' }, JSON.stringify(query));
    return { audio, type: 'audio/wav', ext: 'wav', httpStatus: 200, submitted: { audioQuery: query, userDict: e.userDict }, readings };
  } catch (err) {
    return { audio: null, httpStatus: err.status || null, errorCode: err.status ? null : ((err.cause && err.cause.code) || err.name), detail: String(err.message).slice(0, 300) };
  } finally {
    for (const id of added) { try { await http('DELETE', base + '/user_dict_word/' + id, {}); } catch (err) { void err; } }
  }
}

// ── commands ────────────────────────────────────────────────────────────────────────────────────────────────────
function parseArgs(argv) {
  const a = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const m = /^--([\w-]+)$/.exec(argv[i]);
    if (m) { const nx = argv[i + 1]; if (nx == null || nx.startsWith('--')) a[m[1]] = true; else { a[m[1]] = nx; i++; } } else a._.push(argv[i]);
  }
  return a;
}
function planAll(args) {
  const { corpus, revision } = loadCorpus(args.corpus);
  const config = args.config;
  if (!PROVIDERS[config]) throw new Error('unknown configuration ' + config + ' (one of ' + ORDER.join(', ') + ')');
  const cast = loadCast(config, args.cast);
  const auth = args.authorization && args.authorization !== true ? loadAuthorization(args.authorization) : null;
  const kind = args.kind || 'matrix';
  const only = args.cases ? String(args.cases).split(',') : (kind === 'samples' && auth && auth.cases ? auth.cases : null);
  const ctx = { cast, auth };
  const cells = cellsOf(corpus, cast, kind, only).map((cell) => planCell(config, cell, ctx));
  return { corpus, revision, config, cast, auth, kind, cells };
}
export function summarise(cells, auth) {
  const ready = cells.filter((x) => !x.blocked);
  const reasons = {};
  for (const b of cells.filter((x) => x.blocked)) reasons[b.blocked] = (reasons[b.blocked] || 0) + 1;
  const out = { cells: cells.length, ready: ready.length, readyCharacters: ready.reduce((n, x) => n + x.characters, 0), blocked: cells.length - ready.length, reasons };
  if (auth && auth.pricing) {
    const unit = auth.pricing.unit;
    out.boundUsd = +ready.reduce((n, x) => n + (priceOf(auth.pricing, unit === 'tokens' ? x.plan.costBound : { characters: x.characters }) || 0), 0).toFixed(4);
  }
  return out;
}
const refuse = (msg) => { console.error('refused: ' + msg); process.exit(2); };

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const cmd = args._[0] || 'help';
  if (cmd === 'help') { console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').filter((l) => l.startsWith('//')).slice(0, 34).map((l) => l.slice(3)).join('\n')); return; }
  if (cmd === 'status') {
    const { revision } = loadCorpus(args.corpus);
    const dir = outDir(args, revision);
    const res = readResults(dir);
    const by = {};
    for (const r of res.records) {
      const k = r.configurationId + ' ' + r.kind;
      by[k] = by[k] || { records: 0, withAudio: 0, technical: {}, listened: 0, blocked: 0 };
      by[k].records++;
      if (r.audioOriginalPath) by[k].withAudio++;
      if (/^blocked/.test(r.status)) by[k].blocked++;
      by[k].technical[r.technicalCheck.status] = (by[k].technical[r.technicalCheck.status] || 0) + 1;
      if (r.listeningReview.status !== 'not_listened') by[k].listened++;
    }
    console.log(JSON.stringify({ dir: path.relative(ROOT, dir), revision, byConfigurationAndKind: by }, null, 1));
    return;
  }
  if (cmd === 'usage') {
    const auth = loadAuthorization(args.authorization);
    const s = spentOf(readLedger(ledgerFile(args.ledger || LEDGER_DIR, auth.id)));
    console.log(JSON.stringify({ authorization: auth.id, allowanceUsd: auth.allowanceUsd, countedUsd: +s.usd.toFixed(6), attempts: s.attempts, unfinished: s.unfinished }, null, 1));
    return;
  }
  if (cmd === 'plan') {
    const P = planAll(args);
    const dir = outDir(args, P.revision);
    for (const p of P.cells) if (p.plan && !p.blocked) writeRequest(dir, p);
    console.log(JSON.stringify(Object.assign({ config: P.config, kind: P.kind, revision: P.revision, out: path.relative(ROOT, dir), sends: 'nothing (plan only)' }, summarise(P.cells, P.auth)), null, 1));
    return;
  }
  if (cmd === 'voices') {
    const Pv = PROVIDERS[args.config];
    if (!Pv || Pv.kind !== 'local') throw new Error('voices lists a local engine\'s /speakers');
    const base = (args['engine-url'] || 'http://127.0.0.1:' + Pv.port).replace(/\/$/, '');
    const sp = JSON.parse((await http('GET', base + '/speakers', {})).toString('utf8'));
    for (const s of sp) console.log(s.name + '  (' + (s.speaker_uuid || '') + ')\n' + s.styles.map((st) => '    ' + st.id + '  ' + st.name).join('\n'));
    if (args.save && args.save !== true) {
      // each voice's own terms as the engine bundles them (VOICEVOX-compatible /speaker_info), without its pictures
      // and sample audio, so candidates and their rights can be chosen from one file
      let version = null;
      try { version = JSON.parse((await http('GET', base + '/version', {})).toString('utf8')); } catch (e) { void e; }
      const speakers = [];
      for (const s of sp) {
        let policy = null;
        try { policy = JSON.parse((await http('GET', base + '/speaker_info?' + new URLSearchParams({ speaker_uuid: s.speaker_uuid }), {})).toString('utf8')).policy || null; } catch (e) { policy = 'not available from the engine (' + e.message.slice(0, 80) + ')'; }
        speakers.push({ name: s.name, uuid: s.speaker_uuid, version: s.version || null, styles: s.styles.map((st) => ({ id: st.id, name: st.name, type: st.type || null })), policy });
      }
      fs.mkdirSync(path.dirname(path.resolve(args.save)), { recursive: true });
      fs.writeFileSync(path.resolve(args.save), JSON.stringify({ schemaVersion: 'rbn-voice-speakers-1', configurationId: args.config, engineVersion: version, fetchedAt: new Date().toISOString(), speakers }, null, 1) + '\n');
      console.log('saved ' + speakers.length + ' voices with their terms to ' + args.save);
    }
    return;
  }
  if (cmd === 'run' || cmd === 'repair') {
    const Pv = PROVIDERS[args.config];
    if (!Pv) throw new Error('unknown configuration ' + args.config);
    if (args.config === 'qwen') refuse('Qwen runs through tools/voice/qwen_local_job.py (export-job, then ingest); its hosted route needs its fields verified first');
    const hosted = Pv.kind !== 'local';
    if (hosted) {
      if (!['proxy', 'env'].includes(args.auth)) refuse('a hosted run needs --auth proxy (the environment\'s proxy injects the credential) or --auth env (read from the environment)');
      // proxy mode: Node's fetch must go through the proxy for the injection to happen; start again with it on
      if (args.auth === 'proxy' && !args.endpoint) {
        if (!process.env.HTTPS_PROXY && !process.env.https_proxy) refuse('--auth proxy needs the environment\'s proxy (HTTPS_PROXY is not set here); use --auth env on a machine without one');
        if (process.env.NODE_USE_ENV_PROXY !== '1') {
          const r = spawnSync(process.execPath, process.argv.slice(1), { stdio: 'inherit', env: Object.assign({}, process.env, { NODE_USE_ENV_PROXY: '1', NODE_NO_WARNINGS: '1' }) });
          process.exit(r.status == null ? 1 : r.status);
        }
      }
    } else if (!args.authorised || args.authorised === true) refuse('a local run needs --authorised "<who authorised this configuration, when, and its scope>"');
    if (cmd === 'repair' && (!args.take || !args.reason || args.reason === true)) refuse('a repair needs --take <takeId> and --reason "<the documented cause>"');
    const kind = cmd === 'repair' ? (String(args.take).startsWith('screen.') ? 'screen' : String(args.take).startsWith('smoke.') ? 'smoke' : 'matrix') : (args.kind || 'matrix');
    const P = planAll(Object.assign({}, args, { kind }));
    if (hosted) { const why = authorizationProblem(P.auth, P.config, kind, P.cast); if (why) refuse(why); }
    const dir = outDir(args, P.revision);
    const res = readResults(dir);
    const attemptNo = cmd === 'repair' ? 2 : 1;
    let todo = P.cells.filter((p) => !p.blocked);
    if (cmd === 'repair') {
      if (!generated(res, P.config, args.take, 1).length) refuse(args.take + ' has no generated first take to repair');
      if (generated(res, P.config, args.take, 2).length) refuse(args.take + ' already has its one repair (§05); more needs a scoped reason and budget from Robin');
      if (!/\.d\./.test(args.take)) refuse('repairs are for directed takes');
      todo = todo.filter((p) => p.takeId === args.take);
    } else {
      todo = todo.filter((p) => !generated(res, P.config, p.takeId, 1).length);
      if (P.kind !== 'smoke' && P.kind !== 'samples' && !res.records.some((r) => r.configurationId === P.config && r.kind === 'smoke' && r.audioOriginalPath && r.technicalCheck.status !== 'unusable')) refuse('run the smoke check for ' + P.config + ' first (--kind smoke)');
    }
    if (!todo.length) {
      if (cmd === 'run' && P.cells.some((p) => !p.blocked)) { console.log('nothing left: every runnable ' + P.kind + ' take of ' + P.config + ' is already generated'); return; }
      const s = summarise(P.cells);
      refuse('nothing runnable for ' + P.config + ' ' + P.kind + ' (' + s.blocked + ' of ' + s.cells + ' cells blocked: ' + Object.entries(s.reasons).map(([r, n]) => n + '× ' + r).join('; ') + ')');
    }
    let ctx = { cast: P.cast, auth: P.auth, authorised: hosted ? null : String(args.authorised), revision: P.revision };
    if (hosted) {
      const missing = args.auth === 'env' ? [...new Set(todo.flatMap((p) => envNames(p.plan.request.authHeaders).concat(envNames(p.plan.request.url))))].filter((n) => !process.env[n]) : [];
      if (missing.length) refuse('--auth env needs ' + missing.join(', ') + ' in the environment');
      ctx = Object.assign(ctx, { mode: args.auth, endpoint: args.endpoint, ledger: ledgerFile(args.ledger || LEDGER_DIR, P.auth.id) });
      const s = spentOf(readLedger(ctx.ledger));
      console.log('authorization ' + P.auth.id + ': US$' + s.usd.toFixed(4) + ' counted of US$' + P.auth.allowanceUsd.toFixed(2) + '; this run: ' + todo.length + ' takes, at most US$' + summarise(todo, P.auth).boundUsd.toFixed(4) + ' before retries');
    } else {
      try { await http('GET', (args['engine-url'] || 'http://127.0.0.1:' + Pv.port).replace(/\/$/, '') + '/version', {}); } catch (e) { refuse('no engine answering at ' + (args['engine-url'] || '127.0.0.1:' + Pv.port) + ' (' + e.message + ')'); }
    }
    for (const p of P.cells.filter((x) => x.blocked)) if (!res.records.some((r) => r.configurationId === P.config && r.takeId === p.takeId)) addRecord(res, record(p, ctx, { status: p.blockedKind || 'blocked_access' }));
    writeResults(dir, res);
    for (const p0 of todo) {
      const p = Object.assign({}, p0, { attempt: attemptNo });
      const reqPath = writeRequest(dir, p);
      const t0 = Date.now();
      let out;
      try { out = hosted ? await sendHosted(p, ctx) : await sendLocal(p, args['engine-url']); } catch (e) {
        if (e.allowance) { console.log(p.takeId + '  stopped: ' + e.message); break; }
        throw e;
      }
      const acceptance = { status: out.audio && out.audio.length ? 'accepted' : out.httpStatus && out.httpStatus < 300 ? 'no_audio' : out.httpStatus ? 'rejected' : 'transport_error', httpStatus: out.httpStatus || null, errorCode: out.errorCode || null, contentType: out.type || null, bytes: out.audio ? out.audio.length : 0, detail: out.detail || null };
      const usage = hosted ? { ledgerAttempts: out.attempts.map((a) => a.id), countedUsd: +out.attempts.reduce((n, a) => n + a.countedUsd, 0).toFixed(6), reported: out.usage || null } : { local: true };
      const repairFields = cmd === 'repair' ? { repairOf: args.take, repairReason: String(args.reason) } : {};
      if (!out.audio || !out.audio.length) {
        const status = out.httpStatus === 401 || out.httpStatus === 403 ? 'blocked_access' : 'qa_failed';
        addRecord(res, record(p, ctx, Object.assign({ attempt: attemptNo, status, blockedReason: (out.httpStatus ? 'HTTP ' + out.httpStatus + ' ' : '') + (out.detail || out.errorCode || ''), providerAcceptance: acceptance, usage }, repairFields)));
        writeResults(dir, res);
        console.log(p.takeId + '  ' + acceptance.status + ' ' + (out.httpStatus || out.errorCode || '') + ' ' + String(out.detail || '').slice(0, 160));
        if (out.httpStatus === 401 || out.httpStatus === 403) { console.log('stopping: the provider refused the credential (' + out.httpStatus + '); in proxy mode, check the network secret for ' + (Pv.auth && Pv.auth.host)); break; }
        continue;
      }
      writeRequest(dir, p, out.submitted);
      const rel = path.join('audio', 'masters', P.config, p.caseId, p.takeId + (attemptNo > 1 ? '.a' + attemptNo : '') + '.r' + (res.records.filter((r) => r.takeId === p.takeId && r.configurationId === P.config && r.attempt === attemptNo).length + 1) + '.' + out.ext);
      fs.mkdirSync(path.join(dir, path.dirname(rel)), { recursive: true });
      fs.writeFileSync(path.join(dir, rel), out.audio);
      const pairId = p.takeId.includes('.d.') ? p.takeId.replace('.d.', '.n.') : p.takeId.replace('.n.', '.d.');
      const pair = res.records.filter((r) => r.configurationId === P.config && r.takeId === pairId && r.attempt === 1 && r.actualDurationSeconds).pop();
      const tc = checkTake(out.audio, out.type, p.c, pair ? { seconds: pair.actualDurationSeconds } : null);
      if (out.readings && out.readings.length) {
        tc.readings = out.readings;
        for (const r of out.readings.filter((x) => x.status === 'not_found')) { tc.flags.push('the engine reads ' + r.surface + ' otherwise than ' + r.expected + ' (repair: a user-dictionary entry with a person-chosen accent)'); if (tc.status === 'no_anomaly_found') tc.status = 'anomaly_flagged'; }
      }
      addRecord(res, record(p, ctx, Object.assign({
        attempt: attemptNo, status: tc.status === 'unusable' ? 'qa_failed' : 'generated_unreviewed', audioOriginalPath: rel.split(path.sep).join('/'), audioSha256: sha(out.audio), requestPath: reqPath.split(path.sep).join('/'),
        actualDurationSeconds: tc.measurements.seconds != null ? +tc.measurements.seconds.toFixed(3) : null, generationSeconds: +((Date.now() - t0) / 1000).toFixed(2),
        providerAcceptance: acceptance, usage, technicalCheck: tc,
      }, repairFields)));
      writeResults(dir, res);
      console.log(p.takeId + '  accepted; technical check: ' + tc.status + (tc.flags.length ? ' (' + tc.flags.join('; ') + ')' : '') + (hosted ? '; US$' + usage.countedUsd.toFixed(5) : ''));
    }
    if (hosted) { const s = spentOf(readLedger(ctx.ledger)); console.log('authorization ' + P.auth.id + ': US$' + s.usd.toFixed(4) + ' counted of US$' + P.auth.allowanceUsd.toFixed(2) + ' (' + s.attempts + ' attempts in the ledger)'); }
    console.log(JSON.stringify({ out: path.relative(ROOT, dir) }));
    return;
  }
  if (cmd === 'export-job') {
    const P = planAll(args);
    if (P.config !== 'qwen') throw new Error('export-job is for the Qwen local job');
    const dir = outDir(args, P.revision);
    const takes = P.cells.filter((p) => !p.blocked).map((p) => ({ takeId: p.takeId, caseId: p.caseId, takeKind: p.takeKind, kind: p.kind, voiceLabel: p.voiceLabel, spokenTextSha256: p.spokenTextSha256, requestSha256: p.requestSha256, request: p.plan.local, out: ['audio', 'masters', 'qwen', p.caseId, p.takeId + '.wav'].join('/') }));
    for (const p of P.cells.filter((x) => !x.blocked)) writeRequest(dir, p);
    const f = path.join(dir, 'jobs', 'qwen.' + P.kind + '.json');
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(f, JSON.stringify({ schemaVersion: 'rbn-voice-job-1', configurationId: 'qwen', model: 'Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice', revision: P.revision, kind: P.kind, takes, blocked: P.cells.filter((x) => x.blocked).map((x) => ({ takeId: x.takeId, why: x.blocked })) }, null, 1) + '\n');
    console.log(JSON.stringify({ job: path.relative(ROOT, f), takes: takes.length, blocked: P.cells.length - takes.length }));
    return;
  }
  if (cmd === 'ingest') {
    const P = planAll(args);
    const dir = outDir(args, P.revision);
    const res = readResults(dir);
    const logF = path.join(dir, 'jobs', P.config + '.' + P.kind + '.done.jsonl');
    const done = fs.existsSync(logF) ? fs.readFileSync(logF, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l)) : [];
    let n = 0;
    for (const p of P.cells.filter((x) => !x.blocked)) {
      const d = done.find((x) => x.takeId === p.takeId && x.requestSha256 === p.requestSha256);
      if (!d) continue;
      const buf = fs.readFileSync(path.join(dir, d.out));
      if (res.records.some((r) => r.configurationId === P.config && r.takeId === p.takeId && r.audioSha256 === sha(buf))) continue;
      const pairId = p.takeId.includes('.d.') ? p.takeId.replace('.d.', '.n.') : p.takeId.replace('.n.', '.d.');
      const pair = res.records.filter((r) => r.configurationId === P.config && r.takeId === pairId && r.actualDurationSeconds).pop();
      const tc = checkTake(buf, 'audio/wav', p.c, pair ? { seconds: pair.actualDurationSeconds } : null);
      addRecord(res, record(p, { cast: P.cast, authorised: 'local job' }, { status: tc.status === 'unusable' ? 'qa_failed' : 'generated_unreviewed', audioOriginalPath: d.out, audioSha256: sha(buf), modelVersion: d.modelRevision || null, actualDurationSeconds: tc.measurements.seconds != null ? +tc.measurements.seconds.toFixed(3) : null, generationSeconds: d.seconds, usage: { local: true }, providerAcceptance: { status: 'accepted', httpStatus: null, note: 'local model' }, technicalCheck: tc }));
      n++;
    }
    writeResults(dir, res);
    console.log(JSON.stringify({ ingested: n, of: P.cells.length }));
    return;
  }
  throw new Error('unknown command ' + cmd);
}
const isMain = process.argv[1] && (process.platform === 'win32' ? path.resolve(process.argv[1]).toLowerCase() === fileURLToPath(import.meta.url).toLowerCase() : path.resolve(process.argv[1]) === fileURLToPath(import.meta.url));
if (isMain) main().catch((e) => { console.error(e.message); process.exit(1); });
