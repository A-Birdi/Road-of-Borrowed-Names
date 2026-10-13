// VA-1 audition tooling, with no real provider and no network beyond this machine.
// (1) Request validation for every configuration, every corpus case and both take kinds: the spoken channel is the
//     canonical Japanese once the provider's documented markup is removed (ElevenLabs' reviewed audio tags); markup
//     never in a neutral control; the direction only in non-spoken fields; no English, context or credential value.
// (2) Refusals: no run without its authorisation, credential mode, approved authorization file, covered kind, current
//     prices, the proxy (proxy mode) or the variable (env mode); the matrix not before the smoke check.
// (3) A mock Gemini endpoint on localhost: proxy mode sends no credential; env mode sends it and it is written nowhere;
//     every HTTP attempt (retries, failures, reruns) is in the append-only ledger and counted; the dollar allowance
//     stops a run before it could be exceeded and holds across output folders; a refused credential stops the run.
// (4) A mock VOICEVOX engine: smoke, a matrix slice, one repair (and no second), the reading flag, records that keep
//     request validation, provider acceptance, measurements, words and listening apart.
// (5) The gallery keys scores, the listened mark and picks by attempt and audio hash.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { spawn, spawnSync } from 'node:child_process';
import { root } from '../lib/load.mjs';

const tool = (f) => import(path.join(root, 'tools/voice', f));
function runAsync(args, env) {
  return new Promise((resolve) => {
    const p = spawn(process.execPath, ['tools/voice/audition.mjs', ...args], { cwd: root, env: env || process.env });
    let out = '', err = '';
    p.stdout.on('data', (d) => (out += d));
    p.stderr.on('data', (d) => (err += d));
    p.on('close', (code) => resolve({ status: code, stdout: out, stderr: err }));
  });
}
function wav(seconds, rate = 24000) {
  const n = Math.round(seconds * rate), b = Buffer.alloc(44 + n * 2);
  b.write('RIFF', 0); b.writeUInt32LE(36 + n * 2, 4); b.write('WAVE', 8); b.write('fmt ', 12); b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(rate, 24); b.writeUInt32LE(rate * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34);
  b.write('data', 36); b.writeUInt32LE(n * 2, 40);
  const pad = Math.round(0.1 * rate);
  for (let i = pad; i < n - pad; i++) b.writeInt16LE(Math.round(8000 * Math.sin(2 * Math.PI * 220 * i / rate)), 44 + i * 2);
  return b;
}
const listen = (srv) => new Promise((ok) => srv.listen(0, '127.0.0.1', () => ok('http://127.0.0.1:' + srv.address().port)));

export default async (t) => {
  const { PROVIDERS, ORDER, validateRequest, stripMarkup } = await tool('providers.mjs');
  const { moraeOf } = await tool('audio_check.mjs');
  const { authorizationProblem } = await tool('audition.mjs');
  const corpus = JSON.parse(fs.readFileSync(path.join(root, 'docs/future/voice/corpus/audition_corpus.json'), 'utf8'));
  t.ok(corpus.cases.every((c) => !/[[\]<>]/.test(c.spokenText)), 'no canonical line contains [ ] < >, so markup can never be mistaken for the script');

  // (1) request validation everywhere
  const review = { model: 'eleven_v3', reviewedOn: '2026-10-13', source: 'unit test', tags: ['[curious]', '[warmly]'], tagFor: { 'Warm welcome': ['[warmly]'], 'Inquiry and uncertainty': ['[curious]', '[shouting]'] } };
  const VOICES = { voicevox: { styleId: 3 }, voicevox_nemo: { styleId: 5 }, aivis: { styleId: 7 }, qwen: { speaker: 'Ono_Anna' }, gemini: { voiceName: 'Kore' }, elevenlabs: { voiceId: 'VOICE123' }, azure: { name: 'ja-JP-NanamiNeural', styleFor: { 'Warm welcome': 'cheerful' } } };
  const routes = ORDER.map((id) => [id, VOICES[id]]).concat([['gemini', { voiceName: 'Kore', route: 'cloud_tts', modelName: 'm' }]]);
  const bad = [];
  let n = 0, tagged = 0;
  for (const [id, v] of routes) for (const c of corpus.cases) for (const take of ['directed', 'neutral_control']) {
    const plan = PROVIDERS[id].build(c, v, take, { modelReview: review });
    n++;
    const val = validateRequest(id, plan, c, take);
    if (val.status !== 'passed') bad.push(id + ' ' + c.caseId + ' ' + take + ': ' + val.checks.filter((x) => !x.ok).map((x) => x.name).join('; '));
    if (id === 'elevenlabs' && plan.request.body.text !== c.spokenText) tagged++;
  }
  t.ok(!bad.length, n + ' requests (8 routes × 83 cases × 2 takes) pass request validation: ' + bad.slice(0, 3).join(' | '));
  t.ok(tagged > 0 && tagged < corpus.cases.length, 'ElevenLabs directed takes carry reviewed audio tags where the review maps one (' + tagged + ' takes)');
  const n01 = corpus.cases.find((c) => c.caseId === 'N01');
  const el = PROVIDERS.elevenlabs.build(n01, VOICES.elevenlabs, 'directed', { modelReview: review });
  t.ok(el.request.body.text === '[warmly] ' + n01.spokenText && stripMarkup('elevenlabs', el.request.body.text) === n01.spokenText, 'a reviewed tag is performed markup in front of the exact Japanese');
  const n06 = corpus.cases.find((c) => c.deliveryLabel === 'Inquiry and uncertainty');
  t.ok(!/\[shouting\]/.test(PROVIDERS.elevenlabs.build(n06, VOICES.elevenlabs, 'directed', { modelReview: review }).request.body.text), 'a tag outside the reviewed list is never sent');
  t.ok(PROVIDERS.elevenlabs.build(n01, VOICES.elevenlabs, 'neutral_control', { modelReview: review }).request.body.text === n01.spokenText, 'a neutral control carries no tag');
  t.ok(/not reviewed/.test(PROVIDERS.elevenlabs.build(n01, VOICES.elevenlabs, 'directed', {}).blocked || '') && /not the reviewed model/.test(PROVIDERS.elevenlabs.build(n01, { voiceId: 'V', modelId: 'eleven_multilingual_v2' }, 'directed', { modelReview: review }).blocked || ''), 'ElevenLabs is blocked until its model is reviewed, and a different model is not a silent swap');
  const forged = JSON.parse(JSON.stringify(el)); forged.request.body.text = '[warmly] ' + n01.spokenText + '（笑）';
  t.ok(validateRequest('elevenlabs', forged, n01, 'directed').status === 'failed', 'validation fails when the spoken text differs from the canonical line');
  const g = PROVIDERS.gemini.build(n01, VOICES.gemini, 'directed');
  t.ok(g.request.body.store === false && g.request.body.generation_config.max_output_tokens > 0 && !Object.keys(g.request.headers).some((h) => /key/i.test(h)) && g.request.authHeaders['x-goog-api-key'] === '<env GEMINI_API_KEY>', 'Gemini: store:false, a per-request output cap, the credential header apart as a placeholder');

  // (2) refusals
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rbn-va1-'));
  const roles = [...new Set(corpus.cases.map((c) => c.castingProfile))];
  const cast = (id, voice, rights, extra) => {
    const f = path.join(tmp, id + '.json');
    fs.writeFileSync(f, JSON.stringify(Object.assign({ configurationId: id, pinned: { modelId: id === 'gemini' ? 'gemini-3.8-flash-tts' : 'mock' }, roles: Object.fromEntries(roles.map((r) => [r, { candidates: [{ label: 'C01', voice, rights: { status: rights } }], selected: 'C01' }])) }, extra || {})));
    return f;
  };
  const authFile = (name, over) => {
    const a = Object.assign({ schemaVersion: 'rbn-voice-authorization-1', id: name, purpose: 'audition', configurationId: 'gemini', approvedBy: 'unit test', approvedOn: '2026-10-13', kinds: ['smoke', 'screen', 'matrix'], allowanceUsd: 0.05, model: 'gemini-3.8-flash-tts', termsReviewed: { by: 'unit test' },
      pricing: { unit: 'tokens', inputUsdPerMTok: 0.5, outputAudioUsdPerMTok: 9, audioTokensPerSecondBudget: 32, validUntil: '2099-12-31', source: 'unit test', retrievedOn: '2026-10-13' } }, over || {});
    const f = path.join(tmp, name + '.auth.json'); fs.writeFileSync(f, JSON.stringify(a)); return f;
  };
  const gcast = cast('gemini', { voiceName: 'Kore' }, 'covered_by_authorization');
  const ledgerDir = path.join(tmp, 'ledger');
  const out = path.join(tmp, 'out');
  const env = Object.assign({}, process.env); delete env.GEMINI_API_KEY;
  const sync = (args, e) => spawnSync(process.execPath, ['tools/voice/audition.mjs', ...args], { cwd: root, encoding: 'utf8', env: e || env });
  const G = ['--config', 'gemini', '--cast', gcast, '--out', out, '--ledger', ledgerDir];
  let r = sync(['run', '--kind', 'smoke', ...G]);
  t.ok(r.status === 2 && /--auth proxy/.test(r.stderr), 'no hosted run without an explicit credential mode');
  r = sync(['run', '--kind', 'smoke', '--auth', 'env', ...G]);
  t.ok(r.status === 2 && /no --authorization/.test(r.stderr), 'no hosted run without an authorization file');
  r = sync(['run', '--kind', 'smoke', '--auth', 'env', '--authorization', authFile('unapproved', { approvedBy: null }), ...G]);
  t.ok(r.status === 2 && /not approved/.test(r.stderr), 'an unapproved authorization is refused');
  r = sync(['run', '--kind', 'smoke', '--auth', 'env', '--authorization', authFile('production', { purpose: 'production' }), ...G]);
  t.ok(r.status === 2 && /only audition authorizations/.test(r.stderr), 'an authorization for anything but the audition (whole-game production) is refused');
  r = sync(['run', '--kind', 'matrix', '--auth', 'env', '--authorization', authFile('smokeonly', { kinds: ['smoke'] }), ...G]);
  t.ok(r.status === 2 && /does not cover matrix/.test(r.stderr), 'a kind the authorization does not cover is refused');
  t.ok(/valid until 2026-12-31/.test(authorizationProblem({ purpose: 'audition', configurationId: 'gemini', approvedBy: 'x', approvedOn: 'x', allowanceUsd: 1, kinds: ['smoke'], pricing: { unit: 'tokens', inputUsdPerMTok: 0.5, outputAudioUsdPerMTok: 9, audioTokensPerSecondBudget: 32, validUntil: '2026-12-31', source: 's', retrievedOn: 'd' } }, 'gemini', 'smoke', null, '2027-01-01') || ''), 'prices past their date (Gemini doubles on 2027-01-01) stop spending until they are updated');
  t.ok(/pricing is incomplete/.test(authorizationProblem({ purpose: 'audition', configurationId: 'gemini', approvedBy: 'x', approvedOn: 'x', allowanceUsd: 1, kinds: ['smoke'], pricing: { unit: 'characters' } }, 'gemini', 'smoke', null) || ''), 'a character count alone is not accepted as the price of a token-priced model');
  const auth1 = authFile('gemini-test-1');
  r = sync(['run', '--kind', 'smoke', '--auth', 'env', '--authorization', auth1, ...G]);
  t.ok(r.status === 2 && /needs GEMINI_API_KEY/.test(r.stderr), 'env mode refuses without the variable');
  const noProxy = Object.assign({}, env); delete noProxy.HTTPS_PROXY; delete noProxy.https_proxy;
  r = sync(['run', '--kind', 'smoke', '--auth', 'proxy', '--authorization', auth1, ...G], noProxy);
  t.ok(r.status === 2 && /HTTPS_PROXY is not set/.test(r.stderr), 'proxy mode refuses where there is no proxy to inject the credential');
  r = sync(['run', '--kind', 'matrix', '--auth', 'env', '--authorization', auth1, ...G], Object.assign({}, env, { GEMINI_API_KEY: 'x' }));
  t.ok(r.status === 2 && /smoke check/.test(r.stderr), 'no matrix before the smoke check');
  r = sync(['plan', '--config', 'gemini', '--kind', 'smoke', '--cast', gcast, '--out', out, '--authorization', authFile('noterms', { termsReviewed: null })]);
  t.ok(r.status === 0 && Object.keys(JSON.parse(r.stdout).reasons).every((k) => /rights not checked/.test(k)), 'a prebuilt voice stays blocked_rights until the authorization records the terms as read');
  t.ok(!fs.existsSync(path.join(out, 'audio')) && !fs.existsSync(ledgerDir), 'nothing sent and no ledger written by any refused run');

  // (3) a mock Gemini endpoint
  const KEY = 'test-key-' + 'not-a-real-credential-7f3a';
  const seen = [];
  const failures = new Map(); // text → statuses still to return before succeeding
  const gsrv = http.createServer((req, res) => {
    let body = '';
    req.on('data', (d) => (body += d));
    req.on('end', () => {
      const j = JSON.parse(body || '{}');
      const text = j.input && j.input[0] && j.input[0].text;
      seen.push({ key: req.headers['x-goog-api-key'] || null, text, style: j.input && j.input[0] && j.input[0].annotations ? j.input[0].annotations[0].style : null, store: j.store, cap: j.generation_config && j.generation_config.max_output_tokens });
      if (req.headers['x-test-refuse']) { res.statusCode = 403; return res.end('{"error":{"code":403}}'); }
      const queue = failures.get(text) || [];
      if (queue.length) { res.statusCode = queue.shift(); return res.end('{"error":{"code":' + res.statusCode + '}}'); }
      const c = corpus.cases.find((x) => x.spokenText === text);
      const secs = c ? moraeOf(c).morae / 8 + 0.2 : 1;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ id: 'mock', status: 'completed', steps: [{ type: 'model_output', content: [{ type: 'audio', mime_type: 'audio/wav', data: wav(secs).toString('base64') }] }], usage: { total_input_tokens: 40, total_output_tokens: Math.round(secs * 25) } }));
    });
  });
  const gurl = await listen(gsrv);
  try {
    const Gp = ['--config', 'gemini', '--cast', gcast, '--out', out, '--ledger', ledgerDir, '--authorization', auth1, '--endpoint', gurl];
    r = await runAsync(['run', '--kind', 'smoke', '--auth', 'proxy', ...Gp], env);
    t.ok(r.status === 0 && seen.length === 2 && seen.every((s) => s.key === null && s.store === false && s.cap > 0), 'proxy mode: two smoke takes sent with no credential header (the proxy adds it), store:false and an output cap: ' + (r.stderr || '').slice(0, 160));
    const n02 = corpus.cases.find((c) => c.caseId === 'N02');
    t.ok(seen.every((s) => s.text === n02.spokenText) && seen.filter((s) => s.style === n02.direction).length === 1 && seen.filter((s) => s.style === null).length === 1, 'the exact Japanese both times; the direction only in speech_metadata, and only for the directed take');
    const ledger1 = path.join(ledgerDir, 'gemini-test-1.jsonl');
    let L = fs.readFileSync(ledger1, 'utf8').trim().split('\n').map((l) => JSON.parse(l));
    t.ok(L.filter((e) => e.type === 'attempt').length === 2 && L.filter((e) => e.type === 'outcome').every((e) => e.billable === 'billed' && e.actualUsd > 0 && e.countedUsd === e.actualUsd), 'each attempt in the ledger, counted at the usage the provider reported');

    // a transport failure retried, then a take that fails every try and is rerun: nothing is lost
    const slice = ['N01', 'N03'];
    const t1 = corpus.cases.find((c) => c.caseId === 'N01'), t3 = corpus.cases.find((c) => c.caseId === 'N03');
    failures.set(t1.spokenText, [503]);
    failures.set(t3.spokenText, [500, 502, 500]);
    r = await runAsync(['run', '--kind', 'matrix', '--cases', slice.join(','), '--auth', 'env', ...Gp], Object.assign({}, env, { GEMINI_API_KEY: KEY }));
    t.ok(r.status === 0, 'matrix slice with failures: ' + (r.stderr || '').slice(0, 160));
    t.ok(seen.slice(2).every((s) => s.key === KEY), 'env mode sends the key from the environment');
    r = await runAsync(['run', '--kind', 'matrix', '--cases', slice.join(','), '--auth', 'env', ...Gp], Object.assign({}, env, { GEMINI_API_KEY: KEY }));
    L = fs.readFileSync(ledger1, 'utf8').trim().split('\n').map((l) => JSON.parse(l));
    const forTake = (id) => L.filter((e) => e.type === 'attempt' && e.takeId === id).map((a) => L.find((o) => o.type === 'outcome' && o.id === a.id));
    const n1 = forTake('N01.d.C01'), n3 = forTake('N03.d.C01');
    t.ok(n1.length === 2 && n1[0].billable === 'possibly_billed' && n1[0].countedUsd > 0 && n1[1].billable === 'billed', 'a 503 retried: both tries in the ledger, the failed one counted at its bound');
    t.ok(n3.length === 4 && n3.slice(0, 3).every((o) => o.billable === 'possibly_billed' && o.countedUsd > 0) && n3[3].billable === 'billed', 'a take failing all three tries, then rerun: all four attempts kept and counted');
    const res = JSON.parse(fs.readFileSync(path.join(out, 'results.json'), 'utf8')).records;
    const n3recs = res.filter((x) => x.takeId === 'N03.d.C01');
    t.ok(n3recs.length === 2 && n3recs[0].status === 'qa_failed' && n3recs[0].usage.ledgerAttempts.length === 3 && n3recs[1].audioOriginalPath, 'the failed record stays beside the rerun\'s (results are append-only)');
    const okRec = res.find((x) => x.takeId === 'N01.d.C01' && x.audioOriginalPath);
    t.ok(okRec.requestValidation.status === 'passed' && okRec.providerAcceptance.status === 'accepted' && okRec.technicalCheck.status === 'no_anomaly_found' && okRec.lexicalCheck.status === 'not_checked' && okRec.listeningReview.status === 'not_listened', 'request validation, provider acceptance, measurement, words and listening are separate fields');
    const everything = [r.stdout, r.stderr, fs.readFileSync(ledger1, 'utf8'), fs.readFileSync(path.join(out, 'results.json'), 'utf8')].concat(fs.readdirSync(path.join(out, 'requests/gemini'), { recursive: true }).filter((f) => f.endsWith('.json')).map((f) => fs.readFileSync(path.join(out, 'requests/gemini', f), 'utf8'))).join('\n');
    t.ok(!everything.includes(KEY), 'the key appears in no output, ledger, result or stored request');

    // a handful of named samples (Robin, 2026-10-13): the cases come from the authorization, no smoke step first,
    // and the direction-check pair (N02 with its control) is among them
    const sampleAuth = authFile('gemini-samples-test', { kinds: ['samples'], cases: ['N02', 'SUZU01', 'SUZU_K01'] });
    const sout = path.join(tmp, 'sout');
    r = await runAsync(['run', '--kind', 'samples', '--auth', 'proxy', '--config', 'gemini', '--cast', gcast, '--out', sout, '--ledger', ledgerDir, '--authorization', sampleAuth, '--endpoint', gurl], env);
    const srec = fs.existsSync(path.join(sout, 'results.json')) ? JSON.parse(fs.readFileSync(path.join(sout, 'results.json'), 'utf8')).records.filter((x) => x.audioOriginalPath).map((x) => x.takeId).sort() : [];
    t.eq(srec, ['sample.N02.d.C01', 'sample.N02.n.C01', 'sample.SUZU01.d.C01', 'sample.SUZU_K01.d.C01'], 'samples: exactly the authorised cases, with N02\'s neutral control, no smoke step first');
    r = await runAsync(['run', '--kind', 'screen', '--auth', 'proxy', '--config', 'gemini', '--cast', gcast, '--out', sout, '--ledger', ledgerDir, '--authorization', sampleAuth, '--endpoint', gurl], env);
    t.ok(r.status === 2 && /does not cover screen/.test(r.stderr), 'a samples authorization does not stretch to the casting screen');

    // the allowance: counted across output folders, and a run stops before it could be exceeded
    const { spentOf, readLedger } = await tool('ledger.mjs');
    const before = spentOf(readLedger(ledger1)).usd;
    const auth2 = authFile('gemini-test-1', { allowanceUsd: before + 0.0006 });
    // a smoke request's bound (~US$0.005) fits in a fresh allowance of before + 0.0006 but not after what was spent
    // in the first folder: refusing it shows the ledger, not the folder, carries the allowance
    r = await runAsync(['run', '--kind', 'smoke', '--auth', 'proxy', '--config', 'gemini', '--cast', gcast, '--out', path.join(tmp, 'out2'), '--ledger', ledgerDir, '--authorization', auth2, '--endpoint', gurl], env);
    const after = spentOf(readLedger(ledger1)).usd;
    t.ok(/allowance reached/.test(r.stdout) && after <= before + 0.0006 + 1e-12 && !fs.existsSync(path.join(tmp, 'out2', 'audio')), 'in a new output folder the same ledger applies, and the run stops before the allowance could be exceeded (US$' + before.toFixed(5) + ' counted, nothing sent)');
    // a refused credential is not billed and stops the run
    const refuse = http.createServer((req, res) => { req.on('data', () => {}); req.on('end', () => { res.statusCode = 403; res.end('{"error":{"code":403,"message":"unregistered callers"}}'); }); });
    const rurl = await listen(refuse);
    r = await runAsync(['run', '--kind', 'smoke', '--auth', 'proxy', '--config', 'gemini', '--cast', gcast, '--out', path.join(tmp, 'out3'), '--ledger', ledgerDir, '--authorization', authFile('gemini-test-3'), '--endpoint', rurl], env);
    refuse.close();
    const L3 = fs.readFileSync(path.join(ledgerDir, 'gemini-test-3.jsonl'), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
    t.ok(/stopping: the provider refused the credential/.test(r.stdout) && L3.filter((e) => e.type === 'attempt').length === 1 && L3.find((e) => e.type === 'outcome').billable === 'not_billed', 'a 403 stops the run after one attempt, recorded as not billed');
  } finally { gsrv.close(); }

  // (4) a mock VOICEVOX engine
  const kanaOf = (c) => {
    let s = c.spokenText;
    for (const tok of c.readingTokens.slice().sort((a, b) => b.surface.length - a.surface.length)) s = s.split(tok.surface).join(c.caseId === 'REN03' && tok.surface === '灯' ? 'ひ' : tok.reading);
    return [...s].filter((ch) => /[ぁ-ー]/.test(ch)).join('').replace(/[ぁ-ゖ]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) + 0x60));
  };
  const byText = new Map(corpus.cases.map((c) => [c.spokenText, c]));
  const vseen = { texts: [], dict: 0, dictDeleted: 0 };
  const vsrv = http.createServer((req, res) => {
    const u = new URL(req.url, 'http://x');
    let body = '';
    req.on('data', (d) => (body += d));
    req.on('end', () => {
      if (u.pathname === '/version') return res.end('"mock"');
      if (u.pathname === '/speakers') return res.end(JSON.stringify([{ name: 'テスト', speaker_uuid: 'uuid-a', styles: [{ id: 1, name: 'ノーマル' }, { id: 2, name: 'あまあま' }], version: '1.0' }]));
      if (u.pathname === '/speaker_info') return res.end(JSON.stringify({ policy: '# 利用規約\nクレジット表記: テスト', portrait: 'BASE64PORTRAIT', style_infos: [{ id: 1, icon: 'BASE64ICON', voice_samples: ['BASE64WAV'] }] }));
      if (u.pathname === '/audio_query') { const text = u.searchParams.get('text'); vseen.texts.push(text); const c = byText.get(text); res.setHeader('Content-Type', 'application/json'); return res.end(JSON.stringify({ accent_phrases: [], speedScale: 1, intonationScale: 1, kana: c ? kanaOf(c) : '' })); }
      if (u.pathname === '/synthesis') { const q = JSON.parse(body); const c = corpus.cases.find((x) => kanaOf(x) === q.kana); res.setHeader('Content-Type', 'audio/wav'); return res.end(wav(c ? moraeOf(c).morae / 8 + 0.2 : 1)); }
      if (u.pathname === '/user_dict_word' && req.method === 'POST') { vseen.dict++; return res.end('"uuid-1"'); }
      if (u.pathname.startsWith('/user_dict_word/') && req.method === 'DELETE') { vseen.dictDeleted++; return res.end(); }
      res.statusCode = 404; res.end();
    });
  });
  const vurl = await listen(vsrv);
  const vout = path.join(tmp, 'vout');
  try {
    const vcast = cast('voicevox', { styleId: 1, styleFor: { 'Warm welcome': 2 }, userDict: [{ surface: '灯', pronunciation: 'アカ', accent_type: 0 }] }, 'ok_test');
    const base = ['--config', 'voicevox', '--cast', vcast, '--out', vout, '--engine-url', vurl];
    const saved = path.join(tmp, 'speakers.json');
    r = await runAsync(['voices', '--config', 'voicevox', '--engine-url', vurl, '--save', saved]);
    const sv = r.status === 0 ? JSON.parse(fs.readFileSync(saved, 'utf8')) : { speakers: [] };
    t.ok(sv.speakers.length === 1 && /クレジット表記/.test(sv.speakers[0].policy) && sv.speakers[0].styles.length === 2 && !/BASE64/.test(fs.readFileSync(saved, 'utf8')), 'voices --save keeps each voice\'s styles and its own terms from the engine, without its pictures or sample audio');
    r = await runAsync(['run', '--kind', 'smoke', ...base]);
    t.ok(r.status === 2 && /--authorised/.test(r.stderr), 'no local run without naming who authorised it');
    r = await runAsync(['run', '--kind', 'smoke', '--authorised', 'unit test (mock engine)', ...base]);
    t.ok(r.status === 0, 'local smoke: ' + (r.stderr || '').slice(0, 160));
    const only = 'N01,N05,REN03,SUZU_K01,PCA01,PCB01';
    r = await runAsync(['run', '--kind', 'matrix', '--cases', only, '--authorised', 'unit test (mock engine)', ...base]);
    const want = corpus.cases.filter((c) => ['N02', ...only.split(',')].includes(c.caseId));
    t.ok(r.status === 0 && vseen.texts.every((s) => want.some((c) => c.spokenText === s)) && want.every((c) => vseen.texts.includes(c.spokenText)), 'the engine received exactly the cases\' spoken texts');
    t.ok(vseen.dict === vseen.dictDeleted && vseen.dict > 0, 'user-dictionary words added for a run are removed after it');
    const vres = JSON.parse(fs.readFileSync(path.join(vout, 'results.json'), 'utf8')).records;
    const ren = vres.find((x) => x.takeId === 'REN03.d.C01');
    t.ok(ren.technicalCheck.status === 'anomaly_flagged' && ren.technicalCheck.readings.some((x) => x.surface === '灯' && x.status === 'not_found'), 'the engine\'s misreading of 灯 is flagged as an anomaly, not a failure of the words (which are unchecked)');
    t.ok(vres.filter((x) => x.audioOriginalPath).every((x) => x.status === 'generated_unreviewed' && x.listeningReview.status === 'not_listened' && x.requestValidation.status === 'passed'), 'every local take generated and unreviewed, its request validated');
    r = await runAsync(['repair', '--take', 'N05.d.C01', '--reason', 'unit test: documented cause', '--cases', 'N05', '--authorised', 'unit test', ...base]);
    t.ok(r.status === 0, 'one repair of a directed take');
    r = await runAsync(['repair', '--take', 'N05.d.C01', '--reason', 'again', '--cases', 'N05', '--authorised', 'unit test', ...base]);
    t.ok(r.status === 2 && /already has its one repair/.test(r.stderr), 'a second repair is refused (§05)');

    // (5) the gallery's keys
    const { galleryData } = await tool('gallery.mjs');
    const { data } = galleryData({ out: vout });
    const first = data.takes.find((x) => x.take === 'N05.d.C01' && x.attempt === 1), rep = data.takes.find((x) => x.take === 'N05.d.C01' && x.attempt === 2);
    t.ok(first && rep && first.key !== rep.key && /\|a1\|[0-9a-f]{16}$/.test(first.key) && /\|a2\|[0-9a-f]{16}$/.test(rep.key) && first.sha && rep.sha, 'a first take and its repair have their own keys (attempt and audio hash): a repair inherits no score, listened mark or pick');
    const { data: gdata } = galleryData({ out });
    const n3 = gdata.takes.find((x) => x.take === 'N03.d.C01');
    t.ok(n3 && n3.tries === 2 && n3.audio, 'the gallery shows the take that has audio and how many tries it took');
  } finally {
    vsrv.close();
    fs.rmSync(tmp, { recursive: true, force: true });
  }
};
