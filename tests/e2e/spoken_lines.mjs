// Robin, 2026-10-19: "every line in-game should have spoken lines with properly highlightable text as well. This goes
// the same for the Records section"; and "the closed door in Reedwake. The Narrator can effectively read that one".
// Against a real voice site built from the current script by tools/voice/voice_site.mjs, with synthetic test tones
// standing in for the recordings (tests/e2e/voice_fixture.mjs); headless Chromium has no Japanese system voice, so a
// line heard here is its recording:
//  - the prologue's captions are spoken as they appear, from their own recordings (scene 'prologue'); the spoken word
//    is marked as it is said; Voice says a caption again; pointing at a word marks its counterpart; leaving stops it;
//  - a Records replay speaks its lines from the scene's recordings;
//  - a shut door's words are the narrator's recording (scene 'code.door'), through the world's own interact().
// Usage: node tools/build.mjs && node tests/e2e/spoken_lines.mjs
import fs from 'node:fs';
import os from 'node:os';
import http from 'node:http';
import path from 'node:path';
import { launch, page, root } from './lib.mjs';
import { makeVoiceSite } from './voice_fixture.mjs';

let pass = 0, fail = 0;
async function test(name, fn) {
  const t0 = Date.now();
  try { await fn(); pass++; console.log('PASS', name, `(${((Date.now() - t0) / 1000).toFixed(0)} s)`); }
  catch (e) { fail++; console.log('FAIL', name + ':', e.message.split('\n')[0]); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };

const { RB: RBN } = await import('../../tools/voice/lines.mjs');
const REPLAY = 'ch1.bridge';
const replayScene = RBN.sequence.get(REPLAY).scene;
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rbn-spoken-'));
const fx = makeVoiceSite(tmp, { scenes: ['prologue', replayScene, 'code.door', 'code.fw', 'code.history'], refs: [] });
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

async function open() {
  const pg = await page(b, url, { voiceSite: true });
  await pg.p.evaluate(() => {
    RB.voicebank.configure({ base: './voices-test/ja-JP/' });
    const st = RB.game.settings; st.voice.mode = 'prepared'; st.voice.autoRec = true; st.voice.highlight = true; st.prologueSeen = true;
    window.__vb = () => { const S = RB.voicebank._.S; return { plays: S.log.filter((x) => x.k === 'play').map((x) => x.f), playing: !!(S.el && !S.el.paused && S.el.currentTime > 0.03) }; };
  });
  return pg;
}
const vb = (p) => p.evaluate(() => window.__vb());
const played = (p, n) => p.waitForFunction((n) => window.__vb().plays.length >= n && window.__vb().playing, n, { timeout: 8000, polling: 50 });

await test('the prologue speaks each caption from its own recording, marks the spoken word, and stops when left', async () => {
  const pg = await open(), p = pg.p;
  await p.evaluate(() => { RB.ui.create.prologue(); });
  await p.waitForSelector('.seq-view .txt .main .jline[data-src]');
  await played(p, 1);
  let s = await vb(p);
  assert(/^rec\/narrator\//.test(s.plays[0]), 'the first caption is the narrator\'s recording: ' + s.plays.join(','));
  const shape = await p.evaluate(() => ({ jp: !!document.querySelector('.seq-view .txt .main .jline[data-src]'), en: !!document.querySelector('.seq-view .txt .sub .enline'), voice: (() => { const v = document.querySelector('.seq-view [data-a=voice]'); return !!v && !v.hidden; })() }));
  assert(shape.jp && shape.en && shape.voice, 'the caption is a spoken line: Japanese, its English, a Voice button: ' + JSON.stringify(shape));
  await p.waitForSelector('.seq-view .txt .main .jt.spk', { timeout: 4000 });
  // Next: the next caption, its own recording
  await p.evaluate(() => { const n = document.querySelector('.seq-view [data-a=next]'); n.click(); n.click(); });
  await p.waitForFunction(() => window.__vb().plays.length >= 2 && window.__vb().plays[window.__vb().plays.length - 1] !== window.__vb().plays[0], null, { timeout: 8000, polling: 50 });
  s = await vb(p);
  assert(s.plays.length >= 2 && /^rec\/narrator\//.test(s.plays[s.plays.length - 1]) && s.plays[s.plays.length - 1] !== s.plays[0], 'the second caption, another recording: ' + s.plays.join(','));
  // Voice says it again
  const n0 = s.plays.length;
  await p.evaluate(() => { RB.voice.cancel(); document.querySelector('.seq-view [data-a=voice]').click(); });
  await played(p, n0 + 1);
  // pointing at a word marks its counterpart (once the voice is quiet: the spoken mark has the line while it speaks)
  await p.evaluate(() => { RB.voice.cancel(); RB.ui.speechMark.stop(); });
  const tok = await p.evaluate(() => { const t = [...document.querySelectorAll('.seq-view .txt .main .jt[data-i]')].find((e) => /茶屋/.test(e.textContent)); if (!t) return null; t.setAttribute('data-probe', '1'); return t.textContent; });
  assert(tok, 'the caption has the word 茶屋');
  await p.hover('.seq-view [data-probe="1"]');
  await p.waitForSelector('.seq-view .txt .sub .ew.hov', { timeout: 3000 });
  const hov = await p.evaluate(() => [...document.querySelectorAll('.seq-view .txt .sub .ew.hov')].map((e) => e.textContent).join(' '));
  assert(/teahouse/i.test(hov), 'pointing at 茶屋 marks "teahouse": ' + hov);
  // leaving: nothing goes on speaking
  await p.evaluate(() => document.querySelector('.seq-view [data-a=voice]').click());
  await played(p, n0 + 2);
  await p.evaluate(() => document.querySelector('.seq-view [data-a=skip]').click());
  await p.waitForFunction(() => !document.querySelector('.seq-view'), null, { timeout: 5000 });
  await p.waitForTimeout(300);
  s = await vb(p);
  assert(!s.playing && !(await p.evaluate(() => RB.ui.speechMark.active())), 'nothing speaks once the prologue is left');
  assert(!pg.errors.length, pg.errors.join(' | '));
  await p.context().close();
});

await test('a Records replay speaks its lines from the scene\'s recordings', async () => {
  const pg = await open(), p = pg.p;
  const st = await p.evaluate((seq) => {
    const beats = RB.volume.beats(seq, RB.volume.fixtureTest('ren'), 'ren');
    RB.sequence.view({ seq, beats, label: 'Replay', name: 'seq-replay', seen: () => true, skip: { label: 'Close' }, replay: true, speakers: true });
    return { n: beats.length, scene: beats[0] && beats[0].line.sceneId, who: beats[0] && beats[0].line.who };
  }, REPLAY);
  assert(st.n > 0 && st.scene === replayScene, 'the beats name their scene: ' + JSON.stringify(st));
  await played(p, 1);
  const s = await vb(p);
  assert(/^rec\/[a-z0-9_]+\//.test(s.plays[0]), 'the replay\'s first line plays its recording: ' + s.plays.join(','));
  await p.waitForSelector('.seq-view .txt .main .jt.spk', { timeout: 4000 });
  assert(!pg.errors.length, pg.errors.join(' | '));
  await p.context().close();
});

await test('a shut door\'s words are the narrator\'s recording', async () => {
  const pg = await open(), p = pg.p;
  const at = await p.evaluate(() => {
    for (const id of Object.keys(RB.content.maps)) {
      const m = RB.maps.compile(id);
      const d = (m.shut || []).find((x) => !x.if && !x.text && !RB.maps.blockedStatic(m, x.x, x.y + 1));
      if (d) return { id, x: d.x, y: d.y };
    }
    return null;
  });
  assert(at, 'a map with a shut door');
  await p.evaluate((at) => { RB.game.debugStart(at.id, at.x, at.y + 1, {}); RB.game.settings.textSpeed = 'instant'; RB.game.applySettings(); }, at);
  await p.waitForTimeout(300);
  await p.evaluate(() => { RB.world.W.player.dir = 'up'; RB.world.interact(); });
  await played(p, 1);
  const s = await vb(p);
  const line = await p.evaluate(() => { const l = RB.ui.dialogue.shown(); return l ? l.jp : ''; });
  assert(/^rec\/narrator\//.test(s.plays[0]) && /閉/.test(line), 'the door says it is shut, in the narrator\'s recording: ' + s.plays.join(',') + ' / ' + line);
  assert(!pg.errors.length, pg.errors.join(' | '));
  await p.context().close();
});

// Robin, 2026-10-19: "The swinging board between Old Yasu and Ren in Reedwake, along with its clamp - no Narrator
// speaking. Old Yasu's story, when listening, has not begun being spoken."
await test('the swinging screen and its clamp (a field puzzle) say what you see in the narrator\'s recording', async () => {
  for (const key of ['screen', 'clamp']) {
    const pg = await open(), p = pg.p;
    await p.evaluate(() => { RB.game.debugStart('rw.village', 20, 20, {}); RB.game.settings.textSpeed = 'instant'; RB.game.applySettings(); });
    await p.waitForTimeout(300);
    // what the object's inspection scene says first (!hook fw_look f1 <key>: src/content/discovery/30_scenes.js)
    await p.evaluate((key) => { RB.hooks.fw_look(['f1', key]); }, key);
    await played(p, 1);
    const s = await vb(p);
    const line = await p.evaluate(() => { const l = RB.ui.dialogue.shown(); return l ? l.jp : ''; });
    assert(/^rec\/narrator\//.test(s.plays[0]) && /衝|留/.test(line), key + ': the narrator\'s recording of what you see: ' + s.plays.join(',') + ' / ' + line);
    assert(!pg.errors.length, pg.errors.join(' | '));
    await p.context().close();
  }
});

await test('Old Yasu tells his story of Reedwake in his own recordings', async () => {
  const pg = await open(), p = pg.p;
  await p.evaluate(() => { RB.game.debugStart('rw.village', 20, 20, {}); RB.game.settings.textSpeed = 'instant'; RB.game.applySettings(); RB.activities.run('rw.a_history'); });
  await played(p, 1);
  const s = await vb(p);
  const line = await p.evaluate(() => { const l = RB.ui.dialogue.shown(); return l ? { who: l.who, jp: l.jp } : null; });
  assert(/^rec\/yasu\//.test(s.plays[0]) && line && line.who === 'yasu', 'the first fragment is Yasu\'s recording: ' + s.plays.join(',') + ' / ' + JSON.stringify(line));
  assert(!pg.errors.length, pg.errors.join(' | '));
  await p.context().close();
});

await b.close();
srv.close();
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`spoken_lines: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
