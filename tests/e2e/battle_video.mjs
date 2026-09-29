// A short screen recording of real play, as evidence of the battle
// presentation (not part of the default suite): walk up to the Flour Moth on
// the mill road, then two exchanges answered with the real mouse (calm
// readiness → a response on paper → its move → the reaction and states →
// recovery), the finishing response, and the last line clicked away with
// the mouse. Writes a WebM (Playwright's recorder) to the given path.
// Usage: node tests/e2e/battle_video.mjs [out.webm]
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, root } from './lib.mjs';

const out = path.resolve(process.argv[2] || path.join(root, 'tests/e2e/out/battle_video/battle.webm'));
const { srv, url } = await serve();
const b = await launch();
const dir = path.join(path.dirname(out), 'raw');
fs.mkdirSync(dir, { recursive: true });
const ctx = await b.newContext({ viewport: { width: 1280, height: 720 }, recordVideo: { dir, size: { width: 960, height: 540 } } });
const p = await ctx.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push(e.message));
await p.goto(url);
await p.waitForFunction(() => window.__RB_READY__ === true);
await p.evaluate(async () => {
  const s = RB.game.debugStart('rw.millroad', 11, 10, { dir: 'up', comp: 'mio', flags: { rw_mill_open: true } });
  s.learn.kanaKnown = 'both'; s.learn.profile = 'E'; s.words = ['mamoru', 'iyasu', 'hikari'];
  RB.game.settings.input = 'choice'; RB.game.settings.textSpeed = 'fast';
  s.tips = s.tips || {};
  const run = RB.challenge.runStep; RB.challenge.runStep = (step, o) => { window.__step = step; return run(step, o); };
});
const pause = (ms) => p.waitForTimeout(ms);
const center = (sel) => p.evaluate((sel) => { const e = typeof sel === 'string' ? document.querySelector(sel) : null; if (!e) return null; const q = e.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; }, sel);
async function clickAt(pt) { await p.mouse.move(pt.x, pt.y, { steps: 12 }); await pause(150); await p.mouse.click(pt.x, pt.y); }
// walk up to the moth
for (let k = 0; k < 60 && (await p.evaluate(() => RB.game.mode())) !== 'combat'; k++) {
  const st = await p.evaluate(() => { const W = RB.world.W, f = W.foes.find((q) => q.id === 'f3'); return f ? { px: W.player.x, py: W.player.y, fx: f.x, fy: f.y, mv: !!W.player.mv } : null; });
  if (!st) break;
  if (st.mv) { await pause(80); continue; }
  const dx = st.fx - st.px, dy = st.fy - st.py;
  if (Math.abs(dx) + Math.abs(dy) === 1) { await p.keyboard.press(dy < 0 ? 'ArrowUp' : dy > 0 ? 'ArrowDown' : dx < 0 ? 'ArrowLeft' : 'ArrowRight'); await pause(80); await p.keyboard.press('z'); await pause(400); continue; }
  const key = Math.abs(dy) >= Math.abs(dx) && dy !== 0 ? (dy < 0 ? 'ArrowUp' : 'ArrowDown') : (dx < 0 ? 'ArrowLeft' : 'ArrowRight');
  await p.keyboard.down(key); await pause(170); await p.keyboard.up(key); await pause(120);
}
async function nextLines() {
  for (let i = 0; i < 12 && (await p.evaluate(() => RB.ui.dialogue.isOpen())); i++) { await pause(900); const pt = await center('.dlg:not(.hidden) .b-next'); if (pt) await clickAt(pt); await pause(300); }
}
await pause(800);
await nextLines();
// dismiss one-time notes with their own button
async function notes() { const g = await p.evaluate(() => { const b = [...document.querySelectorAll('.cb-coach button')].find((x) => /got it/i.test(x.textContent)); if (!b) return null; const q = b.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; }); if (g) { await clickAt(g); await pause(300); } }
async function exchange() {
  await p.waitForFunction(() => !!document.querySelector('.rcard[data-i]') && RB.combat.phase && RB.combat.phase() === 'choose', null, { timeout: 20000 }).catch(() => {});
  await pause(1200); // calm readiness while choosing
  await notes();
  // Unravel; while it is Shrouded, a light word first (the mist hides the knots)
  const c = await p.evaluate(() => {
    const cards = [...document.querySelectorAll('.rcard')].filter((e) => !e.disabled);
    const x = cards.find((e) => /unravel/i.test(e.textContent)) || cards.find((e) => /光|light/i.test(e.textContent));
    if (!x) return null;
    x.scrollIntoView({ block: 'nearest' });
    const q = x.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 };
  });
  if (!c) return false;
  await clickAt(c);
  await p.waitForSelector('.chal .mc .btn');
  await pause(1200); // reading the task
  const o = await p.evaluate(() => {
    const st = window.__step, bs = [...document.querySelectorAll('.chal .mc .btn')];
    const txt = (h) => { const d = document.createElement('div'); d.innerHTML = h; return d.textContent.replace(/\s+/g, ' ').trim(); };
    const html = (o) => o.text != null ? RB.ui.jhtml(o.text) : (o.jp ? RB.ui.jhtml(o.jp) : '') + (o.en ? '<span class="enline">' + RB.util.esc(o.en) + '</span>' : '');
    const right = RB.challenge.choicesFor(st).filter((o) => o.ok).map((o) => txt(html(o)));
    const q = bs.find((x) => right.includes(x.textContent.replace(/\s+/g, ' ').trim())).getBoundingClientRect();
    return { x: q.left + q.width / 2, y: q.top + q.height / 2 };
  });
  await clickAt(o);
  await p.waitForSelector('.fbwrap[data-fb=ok] .fb-go');
  await pause(900);
  await clickAt(await center('.fbwrap[data-fb=ok] .fb-go'));
  // the exchange plays: the response on paper, its move, the reaction, recovery
  await p.waitForFunction(() => RB.ui.dialogue.isOpen() || (RB.combat.phase && ['choose', 'idle', 'outro'].includes(RB.combat.phase()) && !document.querySelector('.chal')), null, { timeout: 30000 }).catch(() => {});
  await pause(600);
  return true;
}
for (let r = 0; r < 6 && (await p.evaluate(() => RB.game.mode())) === 'combat' && !(await p.evaluate(() => RB.ui.dialogue.isOpen())); r++) await exchange();
await nextLines(); // the last line, clicked away with the mouse
await p.waitForFunction(() => RB.game.mode() === 'world', null, { timeout: 20000 }).catch(() => {});
await pause(1500);
const video = p.video();
await ctx.close();
const raw = await video.path();
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.copyFileSync(raw, out);
fs.rmSync(dir, { recursive: true, force: true });
console.log('wrote ' + path.relative(root, out) + ' (' + Math.round(fs.statSync(out).size / 1024) + ' KiB)' + (errors.length ? '; page errors: ' + errors.join(' | ') : '; no page errors'));
await b.close(); srv.close();
