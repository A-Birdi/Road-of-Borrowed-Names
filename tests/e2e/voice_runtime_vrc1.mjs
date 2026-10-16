// VR-C1 (Astra's voice runtime audit), in the built game in Chromium, against a real voice site built by
// tools/voice/voice_site.mjs with synthetic test tones standing in for the recordings (tests/e2e/voice_fixture.mjs).
// The server logs every voice request, how many recordings it is sending at once, and can be slowed or made to fail.
//  - looking ahead follows the scene the runner is in: through a choice only once it is made, never past an end, never
//    a line whose condition is false; at most one transfer ahead at a time; a new scene drops the old one's queue;
//  - a passing failure of the site's index recovers on the page, with no reload;
//  - a kept copy of the right size but the wrong bytes is not played: it is fetched again and replaced;
//  - a write to the cache that never finishes, and a slow cache, cost a line nothing;
//  - an ordinary update (a new index, the same recordings) plays the kept copies with no request;
//  - two tabs keep one bookkeeping between them; with it gone, the next visit rebuilds it from what is kept.
// Usage: node tools/build.mjs && node tests/e2e/voice_runtime_vrc1.mjs
import fs from 'node:fs';
import os from 'node:os';
import http from 'node:http';
import path from 'node:path';
import crypto from 'node:crypto';
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
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rbn-vrc1-'));
const SCENES = ['co.suzu_ask', 'cr.drift', 'lf.west_plug'];
const fx = makeVoiceSite(tmp, { scenes: SCENES, refs: ['kana:あ|あ'] });
// an ordinary update: a new voice build over the same recordings (only the index changes)
const site2 = path.join(tmp, 'site2');
fs.cpSync(fx.site, site2, { recursive: true });
const ix2 = JSON.parse(fs.readFileSync(path.join(site2, 'ja-JP/index.json'), 'utf8'));
ix2.voiceBuild = 'test-2';
fs.writeFileSync(path.join(site2, 'ja-JP/index.json'), JSON.stringify(ix2));

const SRV = { site: fx.site, slow: 0, failIndex: false, active: 0, maxActive: 0 };
const TYPES = { '.html': 'text/html; charset=utf-8', '.opus': 'audio/ogg', '.json': 'application/json' };
const srv = http.createServer(async (req, res) => {
  const p = decodeURIComponent(req.url.split('?')[0]);
  const voice = p.startsWith('/voices-test/');
  const f = voice ? path.join(SRV.site, p.slice('/voices-test/'.length)) : path.join(root, p === '/' ? 'index.html' : p);
  if (voice && SRV.failIndex && p.endsWith('/index.json')) { res.writeHead(503); res.end(); return; }
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  const rec = voice && /\/rec\//.test(p);
  if (rec) { SRV.active++; SRV.maxActive = Math.max(SRV.maxActive, SRV.active); }
  let done = false;
  const end = () => { if (rec && !done) { done = true; SRV.active--; } };
  res.on('close', end);
  if (rec && SRV.slow) await wait(SRV.slow);
  res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream', 'cache-control': 'no-store' });
  fs.createReadStream(f).on('end', end).pipe(res);
});
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const url = `http://127.0.0.1:${srv.address().port}/`;
const b = await launch();

async function open(o = {}) {
  const context = o.context || (await b.newContext({ viewport: { width: 1280, height: 800 } }));
  if (o.init) await context.addInitScript(o.init);
  const pg = await page(b, url, { context });
  const reqs = [];
  pg.p.on('request', (r) => { if (/\/voices-test\//.test(r.url())) reqs.push(r.url().replace(/^.*\/voices-test\/ja-JP\//, '')); });
  await pg.p.evaluate(([comp]) => {
    RB.game.debugStart('co.village', 20, 20, { comp });
    const st = RB.game.settings; st.textSpeed = 'instant'; st.secondary = 'always'; RB.game.applySettings();
    RB.voicebank.configure({ base: './voices-test/ja-JP/' });
    window.__vb = () => { const S = RB.voicebank._.S; return { plays: S.log.filter((x) => x.k === 'play').map((x) => x.f), log: S.log.map((x) => x.k), el: S.el ? { t: S.el.currentTime } : null }; };
  }, [o.comp || 'suzu']);
  return Object.assign(pg, { reqs, context });
}
const recs = (p) => p.reqs.filter((r) => /^rec\//.test(r));
// the recording a scene's command (by index) has for a speaker
const shardOf = (scene) => JSON.parse(fs.readFileSync(path.join(fx.lang, fx.index.scenes[scene]), 'utf8'));
const { RB: RBN } = await import('../../tools/voice/lines.mjs');
const keyOf = (scene, jp) => scene + '#' + crypto.createHash('sha256').update(jp).digest('hex').slice(0, 10);
const fileOf = (scene, i, sp) => { const c = RBN.content.scenes[scene].cmds[i]; const v = (shardOf(scene).lines[keyOf(scene, c.jp)] || []).find((x) => !sp || x.sp === sp); return v ? v.f : null; };
const shown = (p) => p.p.evaluate(() => { const d = document.querySelector('.dlg'); return d && !d.classList.contains('hidden') ? d.querySelector('.main').textContent : null; });
async function next(p) { await p.p.locator('.dlg .b-next').click(); await wait(250); }
async function pick(p, i) { await p.p.waitForSelector('.choices:not(.hidden) .choice', { timeout: 5000 }); await wait(200); await p.p.locator('.choices .choice').nth(i).click(); await wait(300); }
const playing = (p) => p.p.waitForFunction(() => window.__vb().el && window.__vb().el.t > 0.05, null, { timeout: 8000, polling: 50 });

await test('looking ahead follows the scene: nothing past a choice until it is made, nothing past an end, no line whose condition is false; one transfer ahead at a time', async () => {
  // cr.drift: a line, a choice (dig → the branch's lines, or "not now" → the end)
  let p = await open();
  SRV.slow = 150; SRV.maxActive = 0;
  const line0 = fileOf('cr.drift', 0, 'narrator'), dig = fileOf('cr.drift', 2, 'narrator'), suzuDig = fileOf('cr.drift', 6, 'suzu');
  assert(line0 && dig && suzuDig, 'the fixture has the scene\'s recordings');
  await p.p.evaluate(() => { RB.script.run('cr.drift'); });
  await p.p.waitForFunction(() => document.querySelector('.dlg') && !document.querySelector('.dlg').classList.contains('hidden'), null, { timeout: 8000 });
  await wait(1200);
  const atLine0 = recs(p).slice();
  assert(atLine0.every((r) => r === line0) && atLine0.includes(line0), 'before the choice, only the first line: ' + atLine0.join(', '));
  await next(p);
  await pick(p, 1); // "not now": the scene ends
  await wait(900);
  assert(!recs(p).includes(dig) && !recs(p).includes(suzuDig), 'the branch not chosen was never fetched: ' + recs(p).join(', '));
  await p.context.close();
  // the same choice, the other way: the branch's line, then Suzu's (the others' lines are not hers)
  p = await open();
  await p.p.evaluate(() => { RB.script.run('cr.drift'); });
  await p.p.waitForFunction(() => document.querySelector('.dlg') && !document.querySelector('.dlg').classList.contains('hidden'), null, { timeout: 8000 });
  await wait(600);
  await next(p);
  await pick(p, 0); // dig
  await wait(1500);
  assert(recs(p).includes(dig) && recs(p).includes(suzuDig), 'the chosen branch and the line after it: ' + recs(p).join(', '));
  const others = [3, 4, 5].map((i) => fileOf('cr.drift', i)).filter(Boolean);
  assert(!others.some((f) => recs(p).includes(f)), 'no other companion\'s line: ' + recs(p).join(', '));
  await p.context.close();
  // lf.west_plug: !if on a flag, a choice, !if to the "stuck" branch, a line whose condition is false, an end
  p = await open();
  await p.p.evaluate(() => { RB.script.run('lf.west_plug'); });
  await p.p.waitForFunction(() => document.querySelector('.dlg') && !document.querySelector('.dlg').classList.contains('hidden'), null, { timeout: 8000 });
  await wait(1000);
  const pulled = [8, 11, 20].map((i) => fileOf('lf.west_plug', i, 'narrator')), stuck = fileOf('lf.west_plug', 14, 'narrator'), north = fileOf('lf.west_plug', 16, 'narrator'), recalled = fileOf('lf.west_plug', 17, 'narrator');
  const beforeChoice = recs(p).slice();
  assert(![...pulled, stuck, north, recalled].some((f) => beforeChoice.includes(f)), 'before the choice, nothing beyond it: ' + beforeChoice.join(', '));
  await next(p);
  await pick(p, 0); // pull: the east is not open, so it sticks
  await wait(1500);
  const after = recs(p).slice();
  assert(after.includes(stuck) && after.includes(north), 'the stuck branch\'s line and the one its condition allows: ' + after.join(', '));
  assert(!after.includes(recalled) && !pulled.some((f) => after.includes(f)), 'never a line whose condition is false, nor the branch the !if skipped: ' + after.join(', '));
  assert(SRV.maxActive <= 2, 'at most one transfer ahead beside the line playing (' + SRV.maxActive + ' at once)');
  console.log('   requests, lf.west_plug:', after.length, 'recordings', '; most at once:', SRV.maxActive);
  SRV.slow = 0;
  await p.context.close();
});

await test('a new scene or a closed one drops what was queued; at most one transfer ahead runs at any moment', async () => {
  const p = await open();
  SRV.slow = 400; SRV.maxActive = 0;
  await p.p.evaluate(async () => { for (const id of ['co.suzu_ask', 'lf.west_plug', 'cr.drift']) await RB.voicebank._.shard(id); });
  // five scenes begun one after another: only the last one's first line is wanted in the end
  await p.p.evaluate(() => { for (const id of ['co.suzu_ask', 'lf.west_plug', 'co.suzu_ask', 'lf.west_plug', 'cr.drift']) RB.voicebank.scene(id); });
  await wait(2000);
  const line0 = fileOf('cr.drift', 0, 'narrator');
  // (what arrived is read from the page, the recordings it holds; Chromium labels some completed requests ERR_ABORTED)
  const pg1 = await p.p.evaluate(() => { const S = RB.voicebank._.S; return { held: Array.from(S.mem.keys()).map((u) => u.replace(/^.*\/voices-test\/ja-JP\//, '')), aborts: S.log.filter((x) => x.k === 'abort').map((x) => x.why) }; });
  assert(SRV.maxActive <= 1, 'one transfer ahead at a time (' + SRV.maxActive + ')');
  assert(pg1.held.length === 1 && pg1.held[0] === line0, 'only the last scene\'s line arrived: ' + JSON.stringify(pg1));
  const first = { requested: recs(p).length, aborted: pg1.aborts.length };
  // a scene begun and closed at once (the dialogue's cancel): nothing is left queued or running
  await p.p.evaluate(() => { RB.voicebank._.S.mem.clear(); RB.voicebank.scene('co.suzu_ask'); RB.voice.cancel(); });
  await wait(1500);
  const st = await p.p.evaluate(() => RB.voicebank.status());
  assert(st.ahead.queued === 0 && st.ahead.running === 0, 'nothing queued or running after the close: ' + JSON.stringify(st.ahead));
  assert(recs(p).length - first.requested <= 1, 'at most the one transfer already running: ' + (recs(p).length - first.requested));
  console.log('   five scenes in a row: ' + first.requested + ' recording requests, ' + first.aborted + ' aborted by the queue, at most ' + SRV.maxActive + ' at once; begun and closed: ' + (recs(p).length - first.requested) + ' more');
  SRV.slow = 0;
  await p.context.close();
});

await test('a passing failure of the site\'s index recovers on the page, with no reload', async () => {
  SRV.failIndex = true;
  const p = await open();
  const c = RBN.content.scenes['co.suzu_ask'].cmds.find((x) => x.who === 'hiro');
  const say = () => p.p.evaluate((c) => RB.voice.sayLine({ who: 'hiro', jp: c.jp, sceneId: 'co.suzu_ask' }, { who: 'hiro', jp: c.jp, sceneId: 'co.suzu_ask', line: c.line }), c);
  const r1 = await say();
  assert(r1 !== 'recorded', 'with no index, no recording (' + r1 + ')');
  SRV.failIndex = false;
  await wait(1300); // (past the first back-off)
  const r2 = await say();
  assert(r2 === 'recorded', 'the index answered again: the line plays (' + r2 + ')');
  const n = p.reqs.filter((r) => r === 'index.json').length;
  assert(n >= 2 && n <= 4, 'the index was asked again, a few times at most: ' + n);
  await p.context.close();
});

await test('a kept copy of the right size but the wrong bytes is fetched again and replaced', async () => {
  const context = await b.newContext();
  let p = await open({ context });
  const c = RBN.content.scenes['co.suzu_ask'].cmds.find((x) => x.who === 'hiro');
  const f = fileOf('co.suzu_ask', RBN.content.scenes['co.suzu_ask'].cmds.indexOf(c), 'hiro');
  const say = (p) => p.p.evaluate((c) => RB.voice.sayLine({ who: 'hiro', jp: c.jp, sceneId: 'co.suzu_ask' }, { who: 'hiro', jp: c.jp, sceneId: 'co.suzu_ask', line: c.line }), c);
  assert((await say(p)) === 'recorded', 'first play');
  await p.p.evaluate(() => RB.voicebank._.flush());
  await p.p.close();
  // the same size, other bytes, in the game's own cache
  p = await open({ context });
  await p.p.evaluate(async (rel) => {
    const c = await caches.open('rbn-voice-v1');
    const u = new URL('./voices-test/ja-JP/' + rel, location.href).href;
    const n = (await (await c.match(u)).arrayBuffer()).byteLength;
    await c.put(u, new Response(new Uint8Array(n).fill(7), { headers: { 'content-type': 'audio/ogg', 'x-rbn-bytes': String(n) } }));
  }, f);
  const r = await say(p);
  await wait(400);
  const fixed = await p.p.evaluate(async (rel) => {
    const c = await caches.open('rbn-voice-v1');
    const b = await (await c.match(new URL('./voices-test/ja-JP/' + rel, location.href).href)).arrayBuffer();
    return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', b)), (x) => x.toString(16).padStart(2, '0')).join('').slice(0, 12);
  }, f);
  const log = (await p.p.evaluate(() => window.__vb())).log;
  assert(r === 'recorded' && recs(p).includes(f) && log.includes('kept-bad'), 'not played from the bad copy, fetched again: ' + JSON.stringify({ r, fetched: recs(p).includes(f) }));
  assert(f.includes('.' + fixed + '.'), 'the kept copy is the file again (' + fixed + ')');
  await context.close();
});

await test('a cache write that never finishes, and a slow cache, cost a line nothing', async () => {
  for (const [name, init] of [
    ['a write that never finishes', () => { Cache.prototype.put = function () { return new Promise(() => {}); }; }],
    ['a cache that answers after 3 s', () => { const m = Cache.prototype.match; Cache.prototype.match = function (...a) { return new Promise((r) => setTimeout(() => r(m.apply(this, a)), 3000)); }; }],
  ]) {
    const p = await open({ init });
    const c = RBN.content.scenes['co.suzu_ask'].cmds.find((x) => x.who === 'hiro');
    const t0 = Date.now();
    const r = await p.p.evaluate((c) => RB.voice.sayLine({ who: 'hiro', jp: c.jp, sceneId: 'co.suzu_ask' }, { who: 'hiro', jp: c.jp, sceneId: 'co.suzu_ask', line: c.line }), c);
    const ms = Date.now() - t0;
    await playing(p);
    assert(r === 'recorded' && ms < 2000, name + ': the line plays (' + r + ', ' + ms + ' ms)');
    await p.context.close();
  }
});

await test('an ordinary update (a new index, the same recordings) plays the kept copies with no request for them', async () => {
  const context = await b.newContext();
  let p = await open({ context });
  const c = RBN.content.scenes['co.suzu_ask'].cmds.find((x) => x.who === 'hiro');
  const say = (p) => p.p.evaluate((c) => RB.voice.sayLine({ who: 'hiro', jp: c.jp, sceneId: 'co.suzu_ask' }, { who: 'hiro', jp: c.jp, sceneId: 'co.suzu_ask', line: c.line }), c);
  assert((await say(p)) === 'recorded', 'first play');
  await p.p.evaluate(() => RB.voicebank._.flush());
  await p.p.close();
  SRV.site = site2;
  p = await open({ context });
  const r = await say(p);
  const st = await p.p.evaluate(() => RB.voicebank.status());
  SRV.site = fx.site;
  assert(r === 'recorded' && st.voiceBuild === 'test-2', 'the new build, played: ' + JSON.stringify({ r, build: st.voiceBuild }));
  assert(recs(p).length === 0 && p.reqs.includes('index.json'), 'only the index was asked for; the recording came from the cache: ' + p.reqs.join(', '));
  await context.close();
});

await test('two tabs keep one bookkeeping; with it gone, the next visit rebuilds it from what is kept', async () => {
  const context = await b.newContext();
  const p1 = await open({ context }), p2 = await open({ context });
  const lines = RBN.content.scenes['co.suzu_ask'].cmds.filter((x) => x.who === 'hiro').slice(0, 2);
  const say = (p, c) => p.p.evaluate((c) => RB.voice.sayLine({ who: 'hiro', jp: c.jp, sceneId: 'co.suzu_ask' }, { who: 'hiro', jp: c.jp, sceneId: 'co.suzu_ask', line: c.line }), c);
  assert((await say(p1, lines[0])) === 'recorded' && (await say(p2, lines[1])) === 'recorded', 'each tab plays a line');
  await p1.p.evaluate(() => RB.voicebank._.flush());
  await p2.p.evaluate(() => RB.voicebank._.flush());
  await p1.p.evaluate(() => RB.voicebank._.flush());
  const seen = await p1.p.evaluate(async () => {
    const c = await caches.open('rbn-voice-v1');
    const keys = (await c.keys()).map((q) => q.url).filter((u) => !/__rbn_voice_meta__/.test(u));
    const meta = await (await c.match(new URL('./voices-test/ja-JP/__rbn_voice_meta__.json', location.href).href)).json();
    return { keys, listed: keys.filter((u) => meta.e[u]).length };
  });
  assert(seen.keys.length >= 3 && seen.listed === seen.keys.length, 'everything both tabs kept is in the bookkeeping: ' + JSON.stringify({ kept: seen.keys.length, listed: seen.listed }));
  await p1.p.close(); await p2.p.close();
  const p3 = await open({ context });
  const k = await p3.p.evaluate(async () => {
    const c = await caches.open('rbn-voice-v1');
    await c.delete(new URL('./voices-test/ja-JP/__rbn_voice_meta__.json', location.href).href);
    RB.voicebank.configure({ base: './voices-test/ja-JP/' });
    return null;
  });
  void k;
  await p3.p.close();
  const p4 = await open({ context });
  const kept = await p4.p.evaluate(() => RB.voicebank.kept());
  assert(kept.ok && kept.files === seen.keys.length, 'rebuilt from what the cache holds: ' + JSON.stringify(kept) + ' vs ' + seen.keys.length);
  await context.close();
});

await b.close();
srv.close();
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`voice_runtime_vrc1: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
