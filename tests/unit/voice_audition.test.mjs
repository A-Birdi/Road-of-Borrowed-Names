// VA-1 (VS02 preparation): the audition tooling, with no provider and no network. (1) Every configuration's request,
// for every corpus case and both take kinds, voices exactly the case's spoken Japanese: the direction travels only in
// that provider's non-spoken channel (and not at all in a neutral control); the English, the context and the speaker
// identity are in no request. (2) The runner refuses to send without an authorisation record, a spending bound and
// the credential, and refuses the matrix before the smoke check. (3) Against a mock VOICEVOX engine on localhost: the
// smoke check, a slice of the matrix, one repair (and no second), the reading check, the technical check and result
// records that keep generated, technically checked and listened apart; then the gallery embeds those takes.
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

export default async (t) => {
  const { PROVIDERS, ORDER, spokenChannelOf, kanaNorm, readingCheck } = await tool('providers.mjs');
  const { moraeOf } = await tool('audio_check.mjs');
  const corpus = JSON.parse(fs.readFileSync(path.join(root, 'docs/future/voice/corpus/audition_corpus.json'), 'utf8'));

  // (1) the spoken channel of every request
  const VOICES = { voicevox: { styleId: 3 }, voicevox_nemo: { styleId: 5 }, aivis: { styleId: 7 }, qwen: { speaker: 'Ono_Anna' }, gemini: { voiceName: 'Kore' }, elevenlabs: { voiceId: 'VOICE123' }, azure: { name: 'ja-JP-NanamiNeural', styleFor: { 'Warm welcome': 'cheerful' } } };
  const routes = ORDER.map((id) => [id, VOICES[id]]).concat([['gemini', { voiceName: 'Kore', route: 'cloud_tts', modelName: 'm' }]]);
  const bad = [];
  let n = 0;
  for (const [id, v] of routes) {
    for (const c of corpus.cases) {
      for (const take of ['directed', 'neutral_control']) {
        const plan = PROVIDERS[id].build(c, v, take);
        n++;
        const spoken = [].concat(spokenChannelOf(id, plan));
        if (!spoken.length || spoken.some((s) => s !== c.spokenText) || plan.sentText !== c.spokenText) bad.push(id + ' ' + c.caseId + ' ' + take + ': spoken channel differs');
        const sent = JSON.stringify(plan.request || plan.engine || [plan.local, plan.hosted]);
        const ctx = c.speechLine.context;
        for (const [what, s] of [['English', c.translationEn], ['situation', ctx.situation], ['previous line', ctx.previousLine], ['next line', ctx.nextLine], ['speaker identity', c.speakerIdentity]]) {
          // (a fixture's situation can be its tone label, which its direction also contains: that is the direction)
          if (s && s.length > 3 && !(take === 'directed' && c.direction.includes(s)) && sent.includes(JSON.stringify(s).slice(1, -1))) bad.push(id + ' ' + c.caseId + ' ' + take + ': ' + what + ' in the request');
        }
        const dir = JSON.stringify(c.direction).slice(1, -1);
        // the direction may appear only in the provider's documented non-spoken field, and never in a control
        const strip = (o) => JSON.parse(JSON.stringify(o), (k, val) => (['instruct', 'instructions', 'style', 'prompt', 'annotations'].includes(k) ? undefined : val));
        const outside = JSON.stringify(strip(plan.request || plan.engine || [plan.local, plan.hosted]));
        if (outside.includes(dir)) bad.push(id + ' ' + c.caseId + ' ' + take + ': direction outside its channel');
        if (take === 'neutral_control' && sent.includes(dir)) bad.push(id + ' ' + c.caseId + ': direction in a neutral control');
        if (take === 'directed' && ['qwen', 'gemini'].includes(id) && !sent.includes(dir)) bad.push(id + ' ' + c.caseId + ': direction not carried in its channel');
      }
    }
  }
  t.ok(!bad.length, n + ' requests (8 routes × 83 cases × 2 takes) voice only the spoken Japanese; direction only in its channel: ' + bad.slice(0, 4).join(' | '));
  const az = PROVIDERS.azure.build(corpus.cases.find((c) => c.caseId === 'REN03'), VOICES.azure, 'directed');
  t.ok(/<sub alias="とうだい">灯台<\/sub>/.test(az.request.body) && /<sub alias="あか">灯<\/sub>/.test(az.request.body), 'Azure carries reading overrides as <sub alias>, longest surface first (灯台 before 灯)');
  t.eq([kanaNorm('トウダイ'), kanaNorm('トーダイ'), kanaNorm("ト'オダイ/")], ['トオダイ', 'トオダイ', 'トオダイ'], 'long vowels compare equal in the reading check');
  t.eq(readingCheck("ヤオバ'シ", [{ surface: '八百橋', reading: 'やおばし' }, { surface: '灯', reading: 'ひ' }]).map((r) => r.status), ['found', 'inconclusive'], 'reading check: found, and a one-mora reading is inconclusive');

  // (2) gating
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rbn-va1-'));
  const roles = [...new Set(corpus.cases.map((c) => c.castingProfile))];
  const cast = (id, voice, rights) => {
    const f = path.join(tmp, id + '.json');
    fs.writeFileSync(f, JSON.stringify({ configurationId: id, pinned: { modelId: 'mock' }, roles: Object.fromEntries(roles.map((r) => [r, { candidates: [{ label: 'C01', voice, rights: { status: rights } }], selected: 'C01' }])) }));
    return f;
  };
  const env = Object.assign({}, process.env); delete env.GEMINI_API_KEY;
  const sync = (args) => spawnSync(process.execPath, ['tools/voice/audition.mjs', ...args], { cwd: root, encoding: 'utf8', env });
  const gcast = cast('gemini', { voiceName: 'Kore' }, 'ok_test');
  const out = path.join(tmp, 'out');
  let r = sync(['run', '--config', 'gemini', '--kind', 'smoke', '--cast', gcast, '--out', out]);
  t.ok(r.status === 2 && /--authorised/.test(r.stderr), 'no run without an authorisation record');
  r = sync(['run', '--config', 'gemini', '--kind', 'smoke', '--cast', gcast, '--out', out, '--authorised', 'unit test']);
  t.ok(r.status === 2 && /--max-chars/.test(r.stderr), 'no hosted run without a character (spending) bound');
  r = sync(['run', '--config', 'gemini', '--kind', 'smoke', '--cast', gcast, '--out', out, '--authorised', 'unit test', '--max-chars', '1000']);
  t.ok(r.status === 2 && /missing GEMINI_API_KEY/.test(r.stderr), 'no hosted run without the credential in the environment');
  r = sync(['run', '--config', 'voicevox', '--kind', 'matrix', '--cast', cast('voicevox', { styleId: 1 }, 'ok_test'), '--out', out, '--authorised', 'unit test', '--engine-url', 'http://127.0.0.1:9']);
  t.ok(r.status === 2 && /smoke check/.test(r.stderr), 'no matrix before the smoke check');
  r = sync(['plan', '--config', 'aivis', '--kind', 'matrix', '--cast', cast('aivis', { styleId: 1 }, 'TO-CHECK'), '--out', out]);
  t.ok(r.status === 0 && JSON.parse(r.stdout).reasons && Object.keys(JSON.parse(r.stdout).reasons).every((k) => /rights not checked/.test(k)), 'a voice whose terms were not read stays blocked_rights');
  t.ok(!fs.existsSync(path.join(out, 'audio')), 'nothing generated by any refused run');

  // (3) a mock VOICEVOX engine
  const kanaOf = (c) => {
    let s = c.spokenText;
    for (const tok of c.readingTokens.slice().sort((a, b) => b.surface.length - a.surface.length)) s = s.split(tok.surface).join(c.caseId === 'REN03' && tok.surface === '灯' ? 'ひ' : tok.reading);
    return [...s].filter((ch) => /[ぁ-ー]/.test(ch)).join('').replace(/[ぁ-ゖ]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) + 0x60));
  };
  const byText = new Map(corpus.cases.map((c) => [c.spokenText, c]));
  const seen = { texts: [], synth: [], dict: 0, dictDeleted: 0 };
  const server = http.createServer((req, res) => {
    const u = new URL(req.url, 'http://x');
    let body = '';
    req.on('data', (d) => (body += d));
    req.on('end', () => {
      if (u.pathname === '/version') { res.end('"mock"'); return; }
      if (u.pathname === '/audio_query') {
        const text = u.searchParams.get('text'); seen.texts.push(text);
        const c = byText.get(text);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ accent_phrases: [], speedScale: 1, pitchScale: 0, intonationScale: 1, volumeScale: 1, prePhonemeLength: 0.1, postPhonemeLength: 0.1, outputSamplingRate: 24000, outputStereo: false, kana: c ? kanaOf(c) : '' }));
        return;
      }
      if (u.pathname === '/synthesis') {
        const q = JSON.parse(body); seen.synth.push(q);
        const c = corpus.cases.find((x) => kanaOf(x) === q.kana);
        res.setHeader('Content-Type', 'audio/wav');
        res.end(wav(c ? moraeOf(c).morae / 8 + 0.2 : 1));
        return;
      }
      if (u.pathname === '/user_dict_word' && req.method === 'POST') { seen.dict++; res.end('"uuid-1"'); return; }
      if (u.pathname.startsWith('/user_dict_word/') && req.method === 'DELETE') { seen.dictDeleted++; res.end(); return; }
      res.statusCode = 404; res.end();
    });
  });
  await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
  const url = 'http://127.0.0.1:' + server.address().port;
  try {
    const vcast = cast('voicevox', { styleId: 1, styleFor: { 'Warm welcome': 2 }, userDict: [{ surface: '灯', pronunciation: 'アカ', accent_type: 0 }] }, 'ok_test');
    const base = ['--config', 'voicevox', '--cast', vcast, '--out', out, '--authorised', 'unit test (mock engine)', '--engine-url', url];
    r = await runAsync(['run', '--kind', 'smoke', ...base]);
    t.ok(r.status === 0, 'smoke run against the mock engine: ' + (r.stderr || r.stdout).trim().slice(0, 200));
    const only = 'N01,N05,REN03,SUZU_K01,PCA01,PCB01';
    r = await runAsync(['run', '--kind', 'matrix', '--cases', only, ...base]);
    t.ok(r.status === 0, 'matrix slice against the mock engine: ' + (r.stderr || r.stdout).trim().slice(0, 300));
    const want = corpus.cases.filter((c) => ['N02', ...only.split(',')].includes(c.caseId));
    t.ok(seen.texts.every((s) => want.some((c) => c.spokenText === s)) && want.every((c) => seen.texts.includes(c.spokenText)), 'the engine received exactly the cases\' spoken texts (' + seen.texts.length + ' queries)');
    t.ok(!seen.texts.some((s) => corpus.cases.some((c) => s.includes(c.direction) || s.includes(c.translationEn))), 'no direction or English reached the engine');
    t.ok(seen.dict === seen.dictDeleted && seen.dict > 0, 'user-dictionary entries added for the run are removed after it (' + seen.dict + ')');
    const res = JSON.parse(fs.readFileSync(path.join(out, 'results.json'), 'utf8')).records.filter((x) => x.configurationId === 'voicevox');
    const expected = 2 + 6 + corpus.cases.filter((c) => only.split(',').includes(c.caseId) && c.neutralControl).length;
    t.eq(res.length, expected, 'two smoke takes, six directed takes and the slice\'s neutral controls');
    t.ok(res.every((x) => x.status === 'generated_unreviewed' && x.audioOriginalPath && fs.existsSync(path.join(out, x.audioOriginalPath)) && x.listeningReview.status === 'not_listened' && x.lexicalCheck.status === 'not_checked'), 'every take generated and unreviewed: not listened, no lexical check claimed');
    const ren = res.find((x) => x.takeId === 'REN03.d.C01');
    t.ok(ren && ren.technicalCheck.status === 'flagged' && ren.technicalCheck.readings.some((x) => x.surface === '灯' && x.status === 'not_found') && ren.technicalCheck.readings.some((x) => x.surface === '灯台' && x.status === 'found'), 'the engine\'s misreading of 灯 is flagged; 灯台 found');
    t.ok(res.filter((x) => x.takeId !== 'REN03.d.C01').every((x) => x.technicalCheck.status === 'passed'), 'the other takes pass the technical check (measurement only)');
    const n01 = res.find((x) => x.takeId === 'N01.d.C01');
    const n01q = JSON.parse(fs.readFileSync(path.join(out, 'requests/voicevox/N01/N01.d.C01.json'), 'utf8'));
    t.ok(n01q.built.style === 2 && n01q.submitted && n01q.submitted.audioQuery && n01.styleId === 2, 'a mapped style id is used for its delivery and the submitted query is kept beside the take');
    t.ok(!JSON.stringify(n01q).match(/api[-_]?key|Bearer [A-Za-z0-9]/i), 'no credential in a stored request');
    r = await runAsync(['repair', '--take', 'N05.d.C01', '--reason', 'unit test: documented cause', '--cases', 'N05', ...base]);
    t.ok(r.status === 0, 'one repair of a directed take: ' + (r.stderr || '').trim().slice(0, 200));
    r = await runAsync(['repair', '--take', 'N05.d.C01', '--reason', 'again', '--cases', 'N05', ...base]);
    t.ok(r.status === 2 && /already has its one repair/.test(r.stderr), 'a second repair is refused (§05)');
    const rep = JSON.parse(fs.readFileSync(path.join(out, 'results.json'), 'utf8')).records.filter((x) => x.takeId === 'N05.d.C01');
    t.ok(rep.length === 2 && rep.some((x) => x.attempt === 1) && rep.some((x) => x.attempt === 2 && x.repairOf === 'N05.d.C01' && x.repairReason), 'the first take is kept beside its repair');
    const { writeGallery } = await tool('gallery.mjs');
    const g = writeGallery({ out });
    const html = fs.readFileSync(g.file, 'utf8');
    t.ok(g.withAudio === expected + 1 && /"audio":"audio\/masters\/voicevox\/N01\/N01\.d\.C01\.wav"/.test(html), 'the gallery embeds the takes with relative audio paths (' + g.withAudio + ')');
    t.ok(!/<script[^>]+src=|<link[^>]+href="http/.test(html), 'the gallery loads nothing from the network');
  } finally {
    server.close();
    fs.rmSync(tmp, { recursive: true, force: true });
  }
};
