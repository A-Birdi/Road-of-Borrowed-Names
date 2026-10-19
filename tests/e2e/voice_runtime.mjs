// VR-1/VR-2, the recorded voices in the built game (Chromium; src/audio/52_voicebank.js, 54_voice_route.js), against
// a real voice site built by tools/voice/voice_site.mjs from the current script, with synthetic test tones standing in
// for the recordings (tests/e2e/voice_fixture.mjs). Headless Chromium here has no Japanese system voice, so every
// recording heard proves the voices do not depend on one.
//  - the shipped page reads its voice site from ../Road-of-Borrowed-Names-voices/ja-JP/ (the voices' own Pages
//    repository, same origin), only once a line plays; a site that does not answer costs one quiet request;
//  - a line plays its own recording (speaker, Suzu's Kansai, the player's voice and pitch, or silence for None); the
//    Voice button shows without a device voice; the spoken mark follows the recording's clock;
//  - looking ahead fetches only the next few lines; nothing before play;
//  - a second visit plays from the game's own cache, with no request; a broken cache never stops a line; the cache
//    stays within its limit; clearing it leaves other caches, other storage and the saves alone;
//  - No voice, Mute and a voice level of zero fetch and play nothing;
//  - word help's Say it, a karuta proverb and a kana card play their recordings;
//  - the voiced offline package plays from file: with nothing fetched.
// Usage: node tools/build.mjs && node tests/e2e/voice_runtime.mjs
import fs from 'node:fs';
import os from 'node:os';
import http from 'node:http';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { launch, page, root } from './lib.mjs';
import { makeVoiceSite } from './voice_fixture.mjs';

let pass = 0, fail = 0;
const only = process.argv[2];
async function test(name, fn) {
  if (only && !name.includes(only)) return;
  const t0 = Date.now();
  try { await fn(); pass++; console.log('PASS', name, `(${((Date.now() - t0) / 1000).toFixed(0)} s)`); }
  catch (e) { fail++; console.log('FAIL', name + ':', e.message.split('\n')[0]); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rbn-voice-'));
const SCENE = 'co.suzu_ask';
const fx = makeVoiceSite(tmp, { scenes: [SCENE], refs: ['word:広場|ひろば', 'kana:あ|あ', 'phrase:いぬもあるけばぼうにあたる'] });
const TYPES = { '.html': 'text/html; charset=utf-8', '.opus': 'audio/ogg', '.json': 'application/json' };
const srv = http.createServer((req, res) => {
  const p = decodeURIComponent(req.url.split('?')[0]);
  const f = p.startsWith('/voices-test/') ? path.join(fx.site, p.slice('/voices-test/'.length)) : path.join(root, p === '/' ? 'index.html' : p);
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream', 'cache-control': 'no-store' });
  fs.createReadStream(f).pipe(res);
});
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const url = `http://127.0.0.1:${srv.address().port}/`;
const b = await launch();
const VOICES = /\/voices-test\//;

// a page in a journey with Suzu, the voices configured (unless told not to), every voice request counted
async function open(o = {}) {
  const context = o.context || (await b.newContext({ viewport: { width: 1280, height: 800 } }));
  if (o.init) await context.addInitScript(o.init);
  const pg = await page(b, url, { context });
  const reqs = [];
  pg.p.on('request', (r) => { if (VOICES.test(r.url())) reqs.push(r.url().replace(/^.*\/voices-test\//, '')); });
  await pg.p.evaluate(([cfg, comp]) => {
    RB.game.debugStart('co.village', 20, 20, { comp });
    const st = RB.game.settings; st.textSpeed = 'instant'; st.secondary = 'always'; RB.game.applySettings();
    if (cfg) RB.voicebank.configure(cfg);
    window.__line = (i) => { const c = RB.content.scenes['co.suzu_ask'].cmds[i]; RB.ui.dialogue.say({ who: c.who, expr: c.expr, jp: c.jp, en: c.en, sceneId: 'co.suzu_ask', line: c.line }); };
    window.__vb = () => { const S = RB.voicebank._.S; return { plays: S.log.filter((x) => x.k === 'play').map((x) => x.f), el: S.el ? { t: S.el.currentTime, paused: S.el.paused, src: S.el.src.slice(0, 5) } : null }; };
  }, [o.noConfig ? null : Object.assign({ base: './voices-test/ja-JP/' }, o.cfg || {}), o.comp || 'suzu']);
  return Object.assign(pg, { reqs, context });
}
const vb = (p) => p.evaluate(() => window.__vb());
const playedOf = (p, n) => p.waitForFunction((n) => window.__vb().plays.length >= n && window.__vb().el && window.__vb().el.t > 0.05, n, { timeout: 8000, polling: 50 });
// the variants the site holds for the scene's lines (speaker, dialect, voice and pitch), and the scene's commands
const shard = JSON.parse(fs.readFileSync(path.join(fx.lang, fx.index.scenes[SCENE]), 'utf8'));
const { RB: RBN } = await import('../../tools/voice/lines.mjs');
const cmds = RBN.content.scenes[SCENE].cmds.map((c, i) => ({ i, who: c.who, jp: c.jp || null, line: c.line || null, if: c.if || null }));
const keyOfCmd = (c) => SCENE + '#' + crypto.createHash('sha256').update(c.jp).digest('hex').slice(0, 10);
const fileFor = (c, pick) => { const vs = shard.lines[keyOfCmd(c)] || []; const v = vs.find(pick); return v ? v.f : null; };
const says = cmds.filter((c) => c.jp);
const hiro = says.find((c) => c.who === 'hiro'), pcLine = says.find((c) => c.who === 'pc');
const suzuK = says.find((c) => c.who === 'comp' && (shard.lines[keyOfCmd(c)] || []).some((v) => v.d === 'k'));

await test('the shipped page asks its own voice site only when a line plays; a missing site costs one quiet request; there is no Japanese voice on this machine', async () => {
  // every request to the hosted voice site, from before the page loads (here that site does not exist: 404)
  const context = await b.newContext({ viewport: { width: 1280, height: 800 } });
  const site = [];
  context.on('request', (r) => { if (/\/Road-of-Borrowed-Names-voices\//.test(r.url())) site.push(r.url().replace(/^https?:\/\/[^/]+/, '')); });
  const p = await open({ noConfig: true, context });
  const st = await p.p.evaluate(() => ({ base: RB.voicebank._.S.base, cfg: RB.voicebank.configured(), voices: RB.voice.japaneseVoices().length, mode: RB.voice.mode(), auto: RB.voice.autoOn() }));
  const before = site.length;
  await p.p.evaluate((i) => window.__line(i), hiro.i);
  await p.p.waitForTimeout(800);
  assert(st.base === '../Road-of-Borrowed-Names-voices/ja-JP/' && st.cfg && st.mode === 'prepared', 'the voice site is the voices\' repository beside the game: ' + JSON.stringify(st));
  assert(before === 0 && p.reqs.length === 0, 'nothing fetched before a line plays: ' + before);
  assert(site.join() === '/Road-of-Borrowed-Names-voices/ja-JP/index.json', 'the line asks the site for its index once, and a missing site is not asked again at once: ' + site.join(','));
  assert(st.voices === 0, 'this machine has a Japanese system voice (' + st.voices + '); the independence checks below would not prove it');
  // the browser's own console line for that 404 is the only one; nothing of the game's
  const miss = p.errors.filter((e) => /Failed to load resource: the server responded with a status of 404/.test(e));
  assert(miss.length === 1 && p.errors.length === 1, p.errors.join(' | '));
  await p.context.close();
});

await test('a line plays its own recording; the Voice button shows without a device voice; the spoken mark follows it; nothing was fetched before play', async () => {
  const p = await open();
  assert(p.reqs.length === 0, 'nothing fetched before a scene: ' + p.reqs.join(','));
  await p.p.evaluate((i) => window.__line(i), hiro.i);
  await playedOf(p.p, 1);
  const s = await vb(p.p);
  const want = fileFor(hiro, (v) => v.sp === 'hiro');
  assert(s.plays[0] === want && s.el.src === 'blob:', 'played ' + s.plays[0] + ', expected ' + want);
  const ui = await p.p.evaluate(() => ({ btn: !document.querySelector('.dlg .b-voice').classList.contains('hidden'), spk: document.querySelectorAll('.dlg .spk').length }));
  assert(ui.btn, 'the Voice button shows');
  await p.p.waitForFunction(() => document.querySelectorAll('.dlg .spk').length > 0, null, { timeout: 4000, polling: 50 });
  assert(!p.errors.length, p.errors.join(' | '));
  await p.context.close();
});

await test('looking ahead fetches the next few lines of the scene only (bounded)', async () => {
  const p = await open();
  await p.p.evaluate(() => RB.voicebank.scene('co.suzu_ask'));
  await p.p.waitForTimeout(1500);
  const rec = p.reqs.filter((r) => /\/rec\//.test(r));
  assert(p.reqs.some((r) => /index\.json$/.test(r)) && p.reqs.some((r) => /idx\/s\/co\.suzu_ask\./.test(r)), 'the index and the scene index: ' + p.reqs.join(','));
  assert(rec.length >= 1 && rec.length <= 3, 'at most three recordings ahead: ' + rec.join(','));
  const first = says.slice(0, 3).map((c) => (shard.lines[keyOfCmd(c)] || []).map((v) => v.f)).flat();
  assert(rec.every((r) => first.some((f) => r.endsWith(f))), 'only recordings of the first lines: ' + rec.join(','));
  await p.context.close();
});

await test('Suzu in Kansai plays her Kansai recording; the player is silent with Voice None, then A High and B Low', async () => {
  const p = await open();
  await p.p.evaluate(() => { RB.game.settings.suzuSpeech = 'kansai'; RB.game.applySettings(); });
  await p.p.evaluate((i) => window.__line(i), suzuK.i);
  await playedOf(p.p, 1);
  let s = await vb(p.p);
  assert(s.plays[0] === fileFor(suzuK, (v) => v.sp === 'suzu' && v.d === 'k'), 'Kansai recording: ' + s.plays[0]);
  const r0 = await p.p.evaluate(async (c) => RB.voice.sayLine({ jp: c.jp, who: 'pc', sceneId: 'co.suzu_ask' }, { jp: c.jp, who: 'pc', sceneId: 'co.suzu_ask', line: c.line }), pcLine);
  assert(r0 === 'silent', 'Voice None: the player is silent (' + r0 + ')');
  for (const [v, pt, pk] of [['A', 'high', 'h'], ['B', 'low', 'l']]) {
    const r = await p.p.evaluate(async ([c, v, pt]) => { RB.game.settings.voice.player = v; RB.game.settings.voice.pitch = pt; return RB.voice.sayLine({ jp: c.jp, who: 'pc', sceneId: 'co.suzu_ask' }, { jp: c.jp, who: 'pc', sceneId: 'co.suzu_ask', line: c.line }); }, [pcLine, v, pt]);
    s = await vb(p.p);
    assert(r === 'recorded' && s.plays[s.plays.length - 1] === fileFor(pcLine, (x) => x.sp === 'pc' && x.v === v && x.p === pk), 'Voice ' + v + ' ' + pt + ': ' + r + ' ' + s.plays[s.plays.length - 1]);
  }
  // a displayed line that is not the recorded one is never played as "close enough"
  const bad = await p.p.evaluate((c) => RB.voicebank._.pick({ lines: { k: [{ sp: 'hiro', d: 's', th: '0000' }] } }, { key: 'k', sp: 'hiro', d: 's', th: '1111' }), hiro);
  assert(bad === null, 'a text-hash mismatch plays nothing');
  await p.context.close();
});

await test('a second visit plays from the game\'s own cache with no request; a broken cache never stops a line; the cache keeps to its limit', async () => {
  const context = await b.newContext();
  let p = await open({ context });
  await p.p.evaluate((i) => window.__line(i), hiro.i);
  await playedOf(p.p, 1);
  await p.p.waitForTimeout(2000); // (the bookkeeping is written a moment later)
  await p.p.close();
  p = await open({ context });
  await p.p.evaluate((i) => window.__line(i), hiro.i);
  await playedOf(p.p, 1);
  const recReq = p.reqs.filter((r) => /\/rec\//.test(r) && r.endsWith(fileFor(hiro, (v) => v.sp === 'hiro')));
  const keys = await p.p.evaluate(async () => caches.keys());
  assert(recReq.length === 0 && keys.includes('rbn-voice-v1'), 'played from the cache: ' + JSON.stringify({ recReq, keys }));
  await context.close();
  // broken: caches.open rejects
  p = await open({ init: () => { const C = window.caches; if (C) C.open = () => Promise.reject(new Error('broken for the test')); } });
  await p.p.evaluate((i) => window.__line(i), hiro.i);
  await playedOf(p.p, 1);
  await p.context.close();
  // bounded: a small limit, several lines
  p = await open({ cfg: { limitBytes: 30000 } });
  for (const c of says.slice(0, 6)) { await p.p.evaluate((i) => window.__line(i), c.i); await p.p.waitForTimeout(500); }
  await p.p.waitForTimeout(800);
  const k = await p.p.evaluate(() => RB.voicebank.kept());
  assert(k.ok && k.bytes <= 30000 && k.files >= 1, 'within the limit: ' + JSON.stringify(k));
  await p.context.close();
});

await test('clearing the kept recordings touches nothing else: other caches, other storage and the saves stay', async () => {
  const p = await open();
  await p.p.evaluate(async () => {
    const c = await caches.open('another-project'); await c.put('/elsewhere/a.txt', new Response('theirs'));
    localStorage.setItem('another-project:key', 'theirs');
    await new Promise((res) => { const r = indexedDB.open('another-project-db', 1); r.onupgradeneeded = () => r.result.createObjectStore('s'); r.onsuccess = () => { r.result.close(); res(); }; });
    RB.save.setCurrent(6, 0); await RB.save.writeSlot(6, RB.game.s, { force: true });
  });
  await p.p.evaluate((i) => window.__line(i), hiro.i);
  await playedOf(p.p, 1);
  const before = await p.p.evaluate(async () => (await RB.save.list()).filter(Boolean).length);
  const r = await p.p.evaluate(async () => {
    const cleared = await RB.voicebank.clearKept();
    const mine = await (await caches.open('rbn-voice-v1')).keys();
    const theirs = await (await caches.open('another-project')).match('/elsewhere/a.txt');
    const dbs = indexedDB.databases ? (await indexedDB.databases()).map((d) => d.name) : null;
    return { cleared, mine: mine.length, theirs: theirs ? await theirs.text() : null, ls: localStorage.getItem('another-project:key'), dbs, saves: (await RB.save.list()).filter(Boolean).length };
  });
  assert(r.cleared && r.mine === 0, 'the game\'s own cache is empty: ' + JSON.stringify(r));
  assert(r.theirs === 'theirs' && r.ls === 'theirs' && (!r.dbs || r.dbs.includes('another-project-db')) && r.saves === before && before >= 1, 'everything else stays: ' + JSON.stringify(r));
  await p.context.close();
});

await test('No voice, Mute and a voice level of zero fetch and play nothing', async () => {
  for (const [name, set] of [['none', (st) => { st.voice.mode = 'none'; }], ['muted', (st) => { st.muted = true; }], ['zero', (st) => { st.vol.voice = 0; }]]) {
    const p = await open();
    await p.p.evaluate((f) => { const st = RB.game.settings; (new Function('st', 'return (' + f + ')(st)'))(st); RB.game.applySettings(); }, set.toString());
    await p.p.evaluate(() => RB.voicebank.scene('co.suzu_ask'));
    await p.p.evaluate((i) => window.__line(i), hiro.i);
    await p.p.waitForTimeout(1200);
    const s = await vb(p.p);
    const btn = await p.p.evaluate(() => !document.querySelector('.dlg .b-voice').classList.contains('hidden'));
    assert(p.reqs.length === 0 && s.plays.length === 0, name + ': nothing fetched or played: ' + p.reqs.join(','));
    if (name === 'none') assert(!btn, 'No voice hides the Voice button');
    await p.context.close();
  }
});

await test('word help\'s Say it, a karuta proverb and a kana card play their recordings without a device voice', async () => {
  const p = await open();
  await p.p.evaluate((i) => window.__line(i), pcLine.i);
  await p.p.waitForTimeout(400);
  await p.p.evaluate(async () => { await RB.voicebank._.refs(); RB.voicebank.stop(); });
  const say = await p.p.evaluate(() => { const ts = [...document.querySelectorAll('.dlg .jline .jt[data-i]')]; const e = ts.find((x) => /広場/.test(x.textContent)); if (!e) return 'no token: ' + ts.map((x) => x.textContent).join('/'); RB.ui.help.showFor(e); return !!document.querySelector('.help [data-a=say]'); });
  assert(say === true, 'Say it shows for 広場 (its recording exists; no device voice): ' + say);
  const n0 = (await vb(p.p)).plays.length;
  await p.p.click('.help [data-a=say]');
  await playedOf(p.p, n0 + 1);
  let s = await vb(p.p);
  assert(/^rec\/ref\//.test(s.plays[s.plays.length - 1]), 'the word\'s recording: ' + s.plays[s.plays.length - 1]);
  for (const [key, text] of [['phrase:いぬもあるけばぼうにあたる', 'いぬもあるけばぼうにあたる'], ['kana:あ|あ', 'あ']]) {
    const r = await p.p.evaluate(([k, t]) => RB.voice.sayRef(k, t), [key, text]);
    s = await vb(p.p);
    assert(r === 'recorded' && /^rec\/ref\//.test(s.plays[s.plays.length - 1]), key + ': ' + r);
  }
  const none = await p.p.evaluate(() => RB.voice.sayRef('word:無い|ない', 'ない'));
  assert(none === 'none', 'a reading with no recording and no device voice says nothing (' + none + ')');
  assert(!p.errors.length, p.errors.join(' | '));
  await p.context.close();
});

await test('the voiced offline package plays its recordings from file: with nothing fetched', async () => {
  const out = path.join(tmp, 'package');
  execFileSync(process.execPath, [path.join(root, 'tools/publish/offline_package.mjs'), '--site', fx.site, '--out', out], { cwd: root, stdio: 'pipe' });
  const context = await b.newContext();
  const pg = await page(b, 'file://' + path.join(out, 'index.html'), { context });
  const net = [];
  pg.p.on('request', (r) => { if (!/^(data|blob):/.test(r.url())) net.push(r.url()); });
  await pg.p.evaluate(() => {
    RB.game.debugStart('co.village', 20, 20, { comp: 'suzu' });
    const st = RB.game.settings; st.textSpeed = 'instant'; RB.game.applySettings();
    window.__vb = () => { const S = RB.voicebank._.S; return { plays: S.log.filter((x) => x.k === 'play').map((x) => x.f), el: S.el ? { t: S.el.currentTime, src: S.el.src.slice(0, 7) } : null }; };
  });
  const st = await pg.p.evaluate(() => ({ active: RB.voicebank.active(), embedded: RB.voicebank._.S.embedded && RB.voicebank._.S.embedded.base }));
  assert(st.active && st.embedded === './voices/ja-JP/', 'the package\'s voices are active: ' + JSON.stringify(st));
  await pg.p.evaluate((c) => { RB.ui.dialogue.say({ who: c.who, jp: c.jp, sceneId: 'co.suzu_ask', line: c.line }); }, hiro);
  await pg.p.waitForFunction(() => window.__vb().el && window.__vb().el.t > 0.05, null, { timeout: 8000, polling: 50 });
  const s = await pg.p.evaluate(() => window.__vb());
  assert(s.el.src === 'file://' && s.plays[0] === fileFor(hiro, (v) => v.sp === 'hiro'), 'played from the folder: ' + JSON.stringify(s));
  const voiceNet = net.filter((u) => /voices\//.test(u) && !/\.opus$/.test(u));
  assert(!voiceNet.length && !pg.errors.length, 'no index fetched, no errors: ' + voiceNet.join(',') + ' ' + pg.errors.join(' | '));
  await context.close();
});

await b.close();
srv.close();
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`voice_runtime: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
