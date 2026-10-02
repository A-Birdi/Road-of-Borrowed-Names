// A short real-time recording of overworld walking (evidence for the parity pass, battle addendum §20): in the
// tea house with your companion and a cat, the keyboard walks you round the room (turns on the spot, a
// half-turn drawn through its pivot), down over the indigo exit mat and out into Reedwake; there a mouse click
// on the noticeboard walks you to it and reads it. Playwright's recorder; 960×540 WebM from a 1280×720 window.
// Usage: node tests/e2e/overworld_video.mjs [out.webm]
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, root } from './lib.mjs';

const out = path.resolve(process.argv[2] || path.join(root, 'tests/e2e/out/battle_pets_overworld/overworld_walk.webm'));
const { srv, url } = await serve();
const b = await launch();
const dir = path.join(path.dirname(out), 'raw-walk');
fs.mkdirSync(dir, { recursive: true });
const ctx = await b.newContext({ viewport: { width: 1280, height: 720 }, recordVideo: { dir, size: { width: 960, height: 540 } } });
const p = await ctx.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push(e.message));
await p.goto(url);
await p.waitForFunction(() => window.__RB_READY__ === true);
await p.evaluate(async () => {
  RB.game.debugStart('rw.tea', 4, 5, { dir: 'down', comp: 'mio', flags: { rw_arrived: true, rw_road_lit: true, rw_echo_done: true, departed: true, ch1_done: true } });
  RB.game.settings.textSpeed = 'fast';
  await new Promise((r) => setTimeout(r, 300));
  for (let i = 0; i < 60 && RB.ui.dialogue.isOpen(); i++) { RB.ui.dialogue.advance(true); await new Promise((r) => setTimeout(r, 30)); }
  const s = RB.game.s; RB.pets.meet(s, 'cat'); RB.pets.select(s, 'cat');
});
const pause = (ms) => p.waitForTimeout(ms);
const idle = () => p.waitForFunction(() => !RB.world.W.player.mv && !RB.ui.dialogue.isOpen() && RB.game.mode() === 'world', null, { timeout: 8000 }).catch(() => {});
async function tap(k, hold) { await idle(); await p.keyboard.down(k); await pause(hold || 60); await p.keyboard.up(k); await pause(260); }
await pause(900);
// round the room: turn, step, a half-turn on the spot, steps
for (const [k, h] of [['ArrowLeft', 60], ['ArrowLeft', 170], ['ArrowUp', 60], ['ArrowDown', 60], ['ArrowUp', 60], ['ArrowRight', 60], ['ArrowRight', 170], ['ArrowRight', 170], ['ArrowLeft', 60], ['ArrowDown', 60], ['ArrowLeft', 170], ['ArrowDown', 170]]) await tap(k, h);
await pause(500);
// out over the mat
await p.keyboard.down('ArrowDown'); await pause(700); await p.keyboard.up('ArrowDown');
await p.waitForFunction(() => RB.world.W.map && RB.world.W.map.id === 'rw.village', null, { timeout: 10000 }).catch(() => {});
await pause(1200);
await idle();
for (const [k, h] of [['ArrowDown', 170], ['ArrowUp', 60], ['ArrowDown', 60], ['ArrowLeft', 170], ['ArrowLeft', 170]]) await tap(k, h);
// a click on the nearest readable thing on screen (target-aware: walk there, face it, read it once)
const tgt = await p.evaluate(() => {
  const W = RB.world.W, P = W.player; let best = null;
  for (const q of W.map.props) {
    if (!(q.scene || q.text) || (q.if && !RB.state.test(RB.game.s, q.if))) continue;
    const c = RB.render.tileToCss(q.x + 0.5, q.y + 0.5);
    if (c.x < 40 || c.y < 60 || c.x > innerWidth - 40 || c.y > innerHeight - 40) continue;
    const d = Math.abs(q.x - P.x) + Math.abs(q.y - P.y);
    if (!best || d < best.d) best = { d, cx: c.x, cy: c.y, p: q.p };
  }
  return best;
});
if (tgt) {
  await p.mouse.move(tgt.cx, tgt.cy, { steps: 12 }); await pause(250); await p.mouse.click(tgt.cx, tgt.cy);
  await p.waitForFunction(() => RB.ui.dialogue.isOpen(), null, { timeout: 8000 }).catch(() => {});
  await pause(1600);
  for (let i = 0; i < 8 && (await p.evaluate(() => RB.ui.dialogue.isOpen())); i++) { await p.keyboard.press('z'); await pause(700); }
}
await pause(1200);
const video = p.video();
await ctx.close();
const raw = await video.path();
fs.copyFileSync(raw, out);
fs.rmSync(dir, { recursive: true, force: true });
console.log('wrote ' + path.relative(root, out) + ' (' + Math.round(fs.statSync(out).size / 1024) + ' KiB); target ' + (tgt && tgt.p) + (errors.length ? '; page errors: ' + errors.join(' | ') : '; no page errors'));
await b.close(); srv.close();
