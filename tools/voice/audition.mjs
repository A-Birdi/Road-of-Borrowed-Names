// VA-1 audition runner: one script for every configuration, the same takes and the same result records wherever it
// runs (here, or on Robin's machine next to a local engine). Nothing is sent unless the configuration is explicitly
// authorised on the command line and its access is present; by default it only plans.
//
//   node tools/voice/audition.mjs plan   --config <id> [--kind smoke|screen|matrix] [--cast <file>] [--out <dir>]
//   node tools/voice/audition.mjs voices --config <id> [--engine-url <url>]            (local engines: /speakers)
//   node tools/voice/audition.mjs run    --config <id> --kind smoke|screen|matrix --authorised "<who, when, scope>"
//                                        [--max-chars N (required for hosted)] [--cases N01,N02] [--engine-url <url>]
//   node tools/voice/audition.mjs repair --config <id> --take <takeId> --reason "<documented cause>" --authorised "…"
//   node tools/voice/audition.mjs export-job --config qwen --kind …   (the job file for tools/voice/qwen_local_job.py)
//   node tools/voice/audition.mjs ingest --config qwen --kind …       (checks and records what that job produced)
//   node tools/voice/audition.mjs status [--out <dir>]
//
// Output (never committed; .gitignore has voice-audition/): voice-audition/VA1/<corpus revision>/
//   requests/<config>/<case>/<take>.json   the request as built and as submitted, credentials as <env NAME> only
//   audio/masters/<config>/<case>/<take>.<ext>   the provider's output, untouched
//   results.json   one rbn-voice-result-1 record per take; runlog.jsonl   one line per HTTP exchange (no secrets)
// States are kept apart: the cell's status (blocked_access, blocked_rights, not_started, generated_unreviewed,
// qa_failed…), technicalCheck (measured, not listened), lexicalCheck (not run: no recogniser here) and
// listeningReview (only a person sets it). A request or file count is never a listening result.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { PROVIDERS, ORDER, readingCheck } from './providers.mjs';
import { checkTake } from './audio_check.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const CORPUS = path.join(ROOT, 'docs/future/voice/corpus/audition_corpus.json');
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
      for (const v of cands) for (const c of anchorsOf(corpus, p)) out.push({ c, take: 'directed', kind, voice: v, voiceLabel: v.label, takeId: 'screen.' + p + '.' + v.label + '.' + c.caseId });
    }
  } else {
    const cases = kind === 'smoke' ? corpus.cases.filter((x) => (only ? only.includes(x.caseId) : x.caseId === 'N02')) : corpus.cases.filter((x) => !only || only.includes(x.caseId));
    for (const c of cases) {
      const r = roleOf(c.castingProfile);
      // the smoke check comes before casting (§04), so it uses the role's first candidate when none is selected yet
      const v = r && r.selected ? pick(c.castingProfile, r.selected) : (kind === 'smoke' && r && (r.candidates || [])[0]) || null;
      const label = v ? v.label : 'C?';
      const why = v ? null : (r ? (kind === 'smoke' ? 'no candidate listed for ' : 'no voice selected for ') + c.castingProfile + (kind === 'smoke' ? '' : ' (the casting screen comes first)') : 'no casting file entry for ' + c.castingProfile);
      // the smoke check is one line twice, with and without its direction, so a direction read aloud shows as a
      // duration difference before anything else is generated
      const takes = kind === 'smoke' ? ['directed', 'neutral_control'] : ['directed'].concat(c.neutralControl ? ['neutral_control'] : []);
      for (const t of takes) out.push({ c, take: t, kind, voice: v, voiceLabel: label, takeId: (kind === 'smoke' ? 'smoke.' : '') + c.caseId + '.' + (t === 'directed' ? 'd' : 'n') + '.' + label, why });
    }
  }
  return out;
}

// the provider's request for one cell, with the record fields the result needs
export function planCell(config, cell) {
  const P = PROVIDERS[config];
  const c = cell.c;
  const base = { caseId: c.caseId, takeId: cell.takeId, takeKind: cell.take, kind: cell.kind, configurationId: config, voiceLabel: cell.voiceLabel, lineId: c.lineId, sourceCommit: c.sourceCommit, spokenTextSha256: sha(c.spokenText), characters: chars(c.spokenText) };
  if (cell.why) return Object.assign(base, { blocked: cell.why });
  base.rightsStatus = (cell.voice.rights && cell.voice.rights.status) || 'not_checked';
  if (!/^ok/.test(base.rightsStatus)) return Object.assign(base, { blocked: 'rights not checked for ' + cell.voiceLabel + ' (' + c.castingProfile + ')', blockedKind: 'blocked_rights', plan: P.build(c, cell.voice.voice, cell.take) });
  const plan = P.build(c, cell.voice.voice, cell.take);
  if (plan.blocked) return Object.assign(base, { blocked: plan.blocked });
  const redacted = plan.request || plan.engine || plan.local;
  return Object.assign(base, { plan, requestSha256: sha(canon(redacted)) });
}

const outDir = (args, revision) => path.resolve(args.out || path.join(ROOT, 'voice-audition', 'VA1', revision));
function readResults(dir) {
  const f = path.join(dir, 'results.json');
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : { schemaVersion: 'rbn-voice-results-1', records: [] };
}
function writeResults(dir, res) {
  fs.mkdirSync(dir, { recursive: true });
  res.records.sort((a, b) => (a.configurationId + a.takeId).localeCompare(b.configurationId + b.takeId));
  fs.writeFileSync(path.join(dir, 'results.json'), JSON.stringify(res, null, 1) + '\n');
}
function upsert(res, rec) {
  const i = res.records.findIndex((r) => r.configurationId === rec.configurationId && r.takeId === rec.takeId && r.attempt === rec.attempt);
  if (i >= 0) res.records[i] = rec; else res.records.push(rec);
}
function record(p, cast, extra) {
  const P = PROVIDERS[p.configurationId];
  const plan = p.plan || {};
  return Object.assign({
    schemaVersion: 'rbn-voice-result-1', status: 'not_started', caseId: p.caseId, takeId: p.takeId, kind: p.kind, configurationId: p.configurationId,
    modelId: (cast && cast.pinned && cast.pinned.modelId) || null, modelVersion: (cast && cast.pinned && cast.pinned.engineVersion) || null,
    voiceId: p.voiceLabel, styleId: plan.engine ? plan.engine.style : null, lineId: p.lineId, sourceCommit: p.sourceCommit,
    spokenTextSha256: p.spokenTextSha256, requestSha256: p.requestSha256 || null, takeKind: p.takeKind, attempt: 1,
    audioOriginalPath: null, audioReviewPath: null, audioSha256: null, actualDurationSeconds: null, generationSeconds: null, cost: null,
    supportedControls: P.controls || [], directionChannel: plan.directionChannel || null, readingChannel: plan.readingChannel || null,
    readingsApplied: plan.readingsApplied || [], readingsNotApplied: plan.readingsNotApplied || [], unsupportedControls: plan.unsupported || [],
    postProcessing: [], blockedReason: p.blocked || null,
    technicalCheck: { status: 'not_checked' }, lexicalCheck: { status: 'not_checked', method: null, issues: [] },
    listeningReview: { status: 'not_listened', reviewer: null, languageQualification: null },
    scores: { pronunciation: null, prosody: null, identityFit: null, delivery: null, cleanliness: null, weightedTotal: null },
    rightsStatus: p.rightsStatus || 'not_checked', repairOf: null, repairReason: null, robinSelection: null,
  }, extra || {});
}

function writeRequest(dir, p, submitted) {
  const f = path.join(dir, 'requests', p.configurationId, p.caseId, p.takeId + '.json');
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, JSON.stringify({ takeId: p.takeId, caseId: p.caseId, takeKind: p.takeKind, configurationId: p.configurationId, voiceLabel: p.voiceLabel, sentText: p.plan.sentText, spokenTextSha256: p.spokenTextSha256, requestSha256: p.requestSha256, directionChannel: p.plan.directionChannel, readingChannel: p.plan.readingChannel, unsupported: p.plan.unsupported, built: p.plan.request || p.plan.engine || p.plan.local, submitted: submitted || null }, null, 1) + '\n');
  return path.relative(dir, f);
}

// ── sending (only from `run`) ────────────────────────────────────────────────────────────────────────────────────
const ENV_RE = /<env ([A-Z_]+)>/g;
function fill(s) { return s.replace(ENV_RE, (_, n) => { if (!process.env[n]) throw new Error('missing environment value ' + n); return process.env[n]; }); }
function envNames(obj) { const s = JSON.stringify(obj); return [...new Set([...s.matchAll(ENV_RE)].map((m) => m[1]))]; }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function http(dir, label, method, url, headers, body, accept) {
  // at most three tries for a transport failure, a 429 or a 5xx (2 s, 4 s); every try is logged without headers
  for (let attempt = 1; ; attempt++) {
    const t0 = Date.now();
    let res, err;
    try { res = await fetch(url, { method, headers, body }); } catch (e) { err = e; }
    const line = { at: new Date().toISOString(), label, method, url: url.replace(/key=[^&]+/g, 'key=<redacted>'), try: attempt, status: res ? res.status : null, error: err ? String(err.message || err) : null, ms: Date.now() - t0 };
    fs.appendFileSync(path.join(dir, 'runlog.jsonl'), JSON.stringify(line) + '\n');
    if (res && res.ok) return { buf: Buffer.from(await res.arrayBuffer()), type: res.headers.get('content-type') || accept || '' };
    const retry = !res || res.status === 429 || res.status >= 500;
    if (!retry || attempt >= 3) {
      const text = res ? (await res.text()).slice(0, 400) : '';
      throw Object.assign(new Error((res ? 'HTTP ' + res.status : 'network') + ' ' + (err ? err.message : text)), { status: res ? res.status : null });
    }
    await sleep(2000 * attempt);
  }
}
function findAudio(o) {
  if (!o || typeof o !== 'object') return null;
  if (o.type === 'audio' && typeof o.data === 'string') return o;
  for (const v of Object.values(o)) { const f = findAudio(v); if (f) return f; }
  return null;
}
async function sendLocal(dir, p, engineUrl) {
  const e = p.plan.engine;
  const base = (engineUrl || 'http://127.0.0.1:' + e.port).replace(/\/$/, '');
  const added = [];
  try {
    for (const w of e.userDict) {
      const q = new URLSearchParams({ surface: w.surface, pronunciation: w.pronunciation, accent_type: String(w.accent_type) });
      const r = await http(dir, p.takeId + ' user_dict_word', 'POST', base + '/user_dict_word?' + q, {}, undefined);
      added.push(JSON.parse(r.buf.toString('utf8')));
    }
    const q = await http(dir, p.takeId + ' audio_query', 'POST', base + '/audio_query?' + new URLSearchParams({ speaker: String(e.style), text: e.text }), {}, undefined);
    const query = JSON.parse(q.buf.toString('utf8'));
    const readings = readingCheck(e.kana == null ? query.kana : null, p.plan.readingsApplied.length ? [] : (p.c.pronunciationOverrides || []));
    Object.assign(query, e.adjust);
    if (e.kana != null) query.kana = e.kana;
    const s = await http(dir, p.takeId + ' synthesis', 'POST', base + '/synthesis?speaker=' + e.style, { 'Content-Type': 'application/json' }, JSON.stringify(query), 'audio/wav');
    return { buf: s.buf, type: 'audio/wav', ext: 'wav', submitted: { audioQuery: query, userDict: e.userDict }, readings };
  } finally {
    for (const id of added) { try { await http(dir, p.takeId + ' user_dict_word delete', 'DELETE', base + '/user_dict_word/' + id, {}, undefined); } catch (err) { void err; } }
  }
}
async function sendHosted(dir, p) {
  const r = p.plan.request || (p.plan.hosted);
  const headers = Object.fromEntries(Object.entries(r.headers).map(([k, v]) => [k, fill(v)]));
  const body = typeof r.body === 'string' ? r.body : JSON.stringify(r.body);
  const got = await http(dir, p.takeId, r.method, fill(r.url), headers, body);
  if (p.plan.response === 'audio_bytes') return { buf: got.buf, type: got.type, ext: /wav|riff/i.test(got.type) || got.buf.toString('ascii', 0, 4) === 'RIFF' ? 'wav' : 'mp3', submitted: { request: r } };
  const json = JSON.parse(got.buf.toString('utf8'));
  if (p.plan.response === 'cloud_tts') return { buf: Buffer.from(json.audioContent || '', 'base64'), type: 'audio/wav', ext: 'wav', submitted: { request: r } };
  const a = findAudio(json);
  if (a) return { buf: Buffer.from(a.data, 'base64'), type: a.mime_type || a.mimeType || 'audio/wav', ext: 'wav', submitted: { request: r } };
  const url = json && json.output && json.output.audio && json.output.audio.url; // DashScope returns a link (verify)
  if (url) { const f = await http(dir, p.takeId + ' fetch', 'GET', url, {}, undefined); return { buf: f.buf, type: f.type, ext: 'wav', submitted: { request: r } }; }
  throw new Error('no audio in the response');
}

// ── commands ─────────────────────────────────────────────────────────────────────────────────────────────────────
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
  const kind = args.kind || 'matrix';
  const only = args.cases ? String(args.cases).split(',') : null;
  const cells = cellsOf(corpus, cast, kind, only).map((cell) => Object.assign(planCell(config, cell), { c: cell.c }));
  return { corpus, revision, config, cast, kind, cells };
}
export function summarise(cells) {
  const ready = cells.filter((x) => !x.blocked);
  const blocked = cells.filter((x) => x.blocked);
  const reasons = {};
  for (const b of blocked) reasons[b.blocked] = (reasons[b.blocked] || 0) + 1;
  return { cells: cells.length, ready: ready.length, readyCharacters: ready.reduce((n, x) => n + x.characters, 0), allCharacters: cells.reduce((n, x) => n + x.characters, 0), blocked: blocked.length, reasons };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const cmd = args._[0] || 'help';
  if (cmd === 'help') { console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').filter((l) => l.startsWith('//')).slice(0, 26).map((l) => l.slice(3)).join('\n')); return; }
  if (cmd === 'status') {
    const { revision } = loadCorpus(args.corpus);
    const dir = outDir(args, revision);
    const res = readResults(dir);
    const by = {};
    for (const r of res.records) {
      const k = r.configurationId + ' ' + r.kind;
      by[k] = by[k] || { takes: 0, generated: 0, technical: {}, listened: 0, blocked: 0 };
      by[k].takes++;
      if (r.audioOriginalPath) by[k].generated++;
      if (/^blocked/.test(r.status)) by[k].blocked++;
      by[k].technical[r.technicalCheck.status] = (by[k].technical[r.technicalCheck.status] || 0) + 1;
      if (r.listeningReview.status !== 'not_listened') by[k].listened++;
    }
    console.log(JSON.stringify({ dir: path.relative(ROOT, dir), revision, byConfigurationAndKind: by }, null, 1));
    return;
  }
  if (cmd === 'plan') {
    const P = planAll(args);
    const dir = outDir(args, P.revision);
    for (const p of P.cells) if (!p.blocked || p.blockedKind === 'blocked_rights') { if (p.plan && !p.plan.blocked) writeRequest(dir, p); }
    console.log(JSON.stringify(Object.assign({ config: P.config, kind: P.kind, revision: P.revision, out: path.relative(ROOT, dir), sends: 'nothing (plan only)' }, summarise(P.cells)), null, 1));
    return;
  }
  if (cmd === 'voices') {
    const Pv = PROVIDERS[args.config];
    if (!Pv || Pv.kind !== 'local') throw new Error('voices lists a local engine\'s /speakers; hosted voice lists need the authorised credential (see VS02_SETUP_REQUEST.md)');
    const base = (args['engine-url'] || 'http://127.0.0.1:' + Pv.port).replace(/\/$/, '');
    const r = await fetch(base + '/speakers');
    const sp = await r.json();
    for (const s of sp) console.log(s.name + '  (' + (s.speaker_uuid || '') + ')\n' + s.styles.map((st) => '    ' + st.id + '  ' + st.name).join('\n'));
    return;
  }
  if (cmd === 'run' || cmd === 'repair') {
    if (!args.authorised || args.authorised === true) { console.error('refused: a run needs --authorised "<who authorised this configuration, when, and its scope>"'); process.exit(2); }
    if (cmd === 'repair' && (!args.take || !args.reason || args.reason === true)) { console.error('refused: a repair needs --take <takeId> and --reason "<the documented cause>"'); process.exit(2); }
    const P = planAll(cmd === 'repair' ? Object.assign({}, args, { kind: args.kind || 'matrix' }) : args);
    const Pv = PROVIDERS[P.config];
    if (P.config === 'qwen') { console.error('refused: Qwen runs through tools/voice/qwen_local_job.py (export-job, then ingest); its hosted route needs its fields verified first'); process.exit(2); }
    const dir = outDir(args, P.revision);
    const res = readResults(dir);
    let todo = P.cells.filter((p) => !p.blocked);
    if (cmd === 'repair') {
      const prev = res.records.filter((r) => r.configurationId === P.config && r.takeId === args.take);
      if (!prev.length || !prev.some((r) => r.audioOriginalPath)) { console.error('refused: ' + args.take + ' has no generated first take to repair'); process.exit(2); }
      if (prev.some((r) => r.attempt > 1)) { console.error('refused: ' + args.take + ' already has its one repair (§05); more needs a scoped reason and budget from Robin'); process.exit(2); }
      if (!/\.d\./.test(args.take)) { console.error('refused: repairs are for directed cells'); process.exit(2); }
      todo = todo.filter((p) => p.takeId === args.take);
    } else {
      const done = new Set(res.records.filter((r) => r.configurationId === P.config && r.audioOriginalPath).map((r) => r.takeId));
      todo = todo.filter((p) => !done.has(p.takeId));
      if (P.kind !== 'smoke' && !res.records.some((r) => r.configurationId === P.config && r.kind === 'smoke' && r.audioOriginalPath && r.technicalCheck.status !== 'failed')) { console.error('refused: run the smoke check for ' + P.config + ' first (--kind smoke)'); process.exit(2); }
    }
    if (!todo.length && cmd === 'run' && P.cells.some((p) => !p.blocked)) { console.log('nothing left: every runnable ' + P.kind + ' take of ' + P.config + ' is already generated'); return; }
    if (!todo.length) {
      const s = summarise(P.cells);
      console.error('refused: nothing runnable for ' + P.config + ' ' + P.kind + ' (' + s.blocked + ' of ' + s.cells + ' cells blocked: ' + Object.entries(s.reasons).map(([r, n]) => n + '× ' + r).join('; ') + ')');
      process.exit(2);
    }
    const planned = todo.reduce((n, p) => n + p.characters, 0);
    if (Pv.kind !== 'local') {
      if (!args['max-chars'] || +args['max-chars'] < planned) { console.error('refused: hosted runs need --max-chars at least ' + planned + ' (the characters this run would send); it is the spending bound'); process.exit(2); }
      const need = [...new Set(todo.flatMap((p) => envNames(p.plan.request || p.plan.hosted)))];
      const missing = need.filter((n) => !process.env[n]);
      if (missing.length) { console.error('refused: missing ' + missing.join(', ') + ' in the environment (credentials are read from the environment only)'); process.exit(2); }
    }
    if (Pv.kind === 'local') {
      try { await fetch((args['engine-url'] || 'http://127.0.0.1:' + Pv.port).replace(/\/$/, '') + '/version'); } catch (e) { console.error('refused: no engine answering at ' + (args['engine-url'] || '127.0.0.1:' + Pv.port) + ' (' + e.message + ')'); process.exit(2); }
    }
    fs.mkdirSync(dir, { recursive: true });
    fs.appendFileSync(path.join(dir, 'runlog.jsonl'), JSON.stringify({ at: new Date().toISOString(), run: cmd, config: P.config, kind: P.kind, takes: todo.length, characters: planned, authorised: String(args.authorised) }) + '\n');
    for (const p of P.cells.filter((x) => x.blocked)) if (!res.records.some((r) => r.configurationId === P.config && r.takeId === p.takeId)) upsert(res, record(p, P.cast, { status: p.blockedKind || 'blocked_access' }));
    for (const p of todo) {
      const attempt = cmd === 'repair' ? 2 : 1;
      const reqPath = writeRequest(dir, p);
      const t0 = Date.now();
      let out, err;
      try { out = Pv.kind === 'local' ? await sendLocal(dir, p, args['engine-url']) : await sendHosted(dir, p); } catch (e) { err = e; }
      if (err) {
        upsert(res, record(p, P.cast, { attempt, status: err.status === 401 || err.status === 403 ? 'blocked_access' : 'qa_failed', blockedReason: String(err.message).slice(0, 300), technicalCheck: { status: 'failed', failures: ['generation failed: ' + String(err.message).slice(0, 200)] }, repairOf: cmd === 'repair' ? args.take : null, repairReason: cmd === 'repair' ? args.reason : null }));
        writeResults(dir, res);
        console.log(p.takeId + '  failed: ' + String(err.message).slice(0, 160));
        if (err.status === 401 || err.status === 403) break;
        continue;
      }
      writeRequest(dir, p, out.submitted);
      const rel = path.join('audio', 'masters', P.config, p.caseId, p.takeId + (attempt > 1 ? '.a' + attempt : '') + '.' + out.ext);
      fs.mkdirSync(path.join(dir, path.dirname(rel)), { recursive: true });
      fs.writeFileSync(path.join(dir, rel), out.buf);
      const pairId = p.takeId.includes('.d.') ? p.takeId.replace('.d.', '.n.') : p.takeId.replace('.n.', '.d.');
      const pair = res.records.find((r) => r.configurationId === P.config && r.takeId === pairId && r.actualDurationSeconds);
      const tc = checkTake(out.buf, out.type, p.c, pair ? { seconds: pair.actualDurationSeconds } : null);
      if (out.readings && out.readings.length) {
        tc.readings = out.readings;
        for (const r of out.readings.filter((x) => x.status === 'not_found')) { tc.flags.push('the engine reads ' + r.surface + ' otherwise than ' + r.expected + ' (repair: a user-dictionary entry with a person-chosen accent)'); if (tc.status === 'passed') tc.status = 'flagged'; }
      }
      upsert(res, record(p, P.cast, {
        attempt, status: tc.status === 'failed' ? 'qa_failed' : 'generated_unreviewed', audioOriginalPath: rel, audioSha256: sha(out.buf), requestPath: reqPath,
        actualDurationSeconds: tc.measurements.seconds != null ? +tc.measurements.seconds.toFixed(3) : null, generationSeconds: +((Date.now() - t0) / 1000).toFixed(2),
        cost: Pv.kind === 'local' ? { amount: 0, note: 'local engine' } : { characters: p.characters, note: 'billed per the provider\'s terms; reconcile with its usage page' },
        technicalCheck: tc, repairOf: cmd === 'repair' ? args.take : null, repairReason: cmd === 'repair' ? args.reason : null,
      }));
      writeResults(dir, res);
      console.log(p.takeId + '  ' + tc.status + (tc.flags.length ? ': ' + tc.flags.join('; ') : ''));
    }
    console.log(JSON.stringify({ out: path.relative(ROOT, dir), sent: todo.length, characters: planned }));
    return;
  }
  if (cmd === 'export-job') {
    const P = planAll(args);
    if (P.config !== 'qwen') throw new Error('export-job is for the Qwen local job');
    const dir = outDir(args, P.revision);
    const takes = P.cells.filter((p) => !p.blocked).map((p) => ({ takeId: p.takeId, caseId: p.caseId, takeKind: p.takeKind, kind: p.kind, voiceLabel: p.voiceLabel, spokenTextSha256: p.spokenTextSha256, requestSha256: p.requestSha256, request: p.plan.local, out: path.join('audio', 'masters', 'qwen', p.caseId, p.takeId + '.wav') }));
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
      const f = path.join(dir, d.out);
      const buf = fs.readFileSync(f);
      const pairId = p.takeId.includes('.d.') ? p.takeId.replace('.d.', '.n.') : p.takeId.replace('.n.', '.d.');
      const pair = res.records.find((r) => r.configurationId === P.config && r.takeId === pairId && r.actualDurationSeconds);
      const tc = checkTake(buf, 'audio/wav', p.c, pair ? { seconds: pair.actualDurationSeconds } : null);
      upsert(res, record(p, P.cast, { status: tc.status === 'failed' ? 'qa_failed' : 'generated_unreviewed', audioOriginalPath: d.out, audioSha256: sha(buf), modelVersion: d.modelRevision || null, actualDurationSeconds: tc.measurements.seconds != null ? +tc.measurements.seconds.toFixed(3) : null, generationSeconds: d.seconds, cost: { amount: 0, note: 'local model' }, technicalCheck: tc }));
      n++;
    }
    writeResults(dir, res);
    console.log(JSON.stringify({ ingested: n, of: P.cells.length }));
    return;
  }
  throw new Error('unknown command ' + cmd);
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch((e) => { console.error(e.message); process.exit(1); });
