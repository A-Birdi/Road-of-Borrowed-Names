// A short screen recording of real play, as evidence of field weaving (not
// part of the default suite): two different valid solutions of F1 "A Dry
// Place for Names" with different companion feedback (addendum §23.7).
//   1. With Mio: a click on the screen walks up to it and inspects it;
//      "Weave a word on it…" opens the Weave sheet on it; the word card and
//      the real language step are answered with the mouse; the ward is
//      presented at the screen (anticipation, gesture, slip, effect,
//      recovery); then the clamp from its inspection menu: the keepsake line
//      and Mio's reaction to the ward route.
//   2. With Nao: the screen swung shut by hand from its inspection menu, then
//      the clamp: the same keepsake, and Nao's reaction to the ordinary route.
// Movement is the game's own click-to-walk (a real mouse click on the thing).
// Writes a WebM (Playwright's recorder) to the given path.
// Usage: node tests/e2e/fieldweave_video.mjs [out.webm]
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, root } from './lib.mjs';

const out = path.resolve(process.argv[2] || path.join(root, 'tests/e2e/out/fieldweave_video/fieldweave_two_routes.webm'));
const { srv, url } = await serve();
const b = await launch();
const dir = path.join(path.dirname(out), 'raw');
fs.mkdirSync(dir, { recursive: true });
const ctx = await b.newContext({ viewport: { width: 1280, height: 720 }, recordVideo: { dir, size: { width: 960, height: 540 } } });
const p = await ctx.newPage();
const tPage = Date.now(); // the recording starts about here
const errors = [];
p.on('pageerror', (e) => errors.push(e.message));
await p.goto(url);
await p.waitForFunction(() => window.__RB_READY__ === true);
const pause = (ms) => p.waitForTimeout(ms);
const T0 = Date.now(), marks = [];
const tick = (m) => marks.push(m + ' ' + ((Date.now() - T0) / 1000).toFixed(1) + 's');
const center = (sel) => p.evaluate((sel) => { const e = document.querySelector(sel); if (!e) return null; e.scrollIntoView({ block: 'nearest' }); const q = e.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; }, sel);
// (the pointer then rests in a corner, so word help does not open on whatever it lies over)
async function clickAt(pt) { if (!pt) throw new Error('nothing to click'); await p.mouse.move(pt.x, pt.y, { steps: 14 }); await pause(160); await p.mouse.click(pt.x, pt.y); await p.mouse.move(6, 6, { steps: 4 }); }
async function start(comp) {
  await p.evaluate((comp) => {
    // as for a player who has been in Reedwake a while: its arrival scenes are already seen
    const seen = {};
    for (const ev of RB.content.maps['rw.village'].onEnter || []) seen['enter:rw.village:' + ev.scene] = true;
    const s = RB.game.debugStart('rw.village', 33, 25, { dir: 'up', comp, flags: Object.assign({ rw_arrived: true }, seen) });
    s.learn.kanaKnown = 'both'; s.learn.profile = 'E'; s.words = ['mamoru', 'mizu', 'hikari'];
    RB.game.settings.input = 'choice'; RB.game.settings.textSpeed = 'instant';
  }, comp);
  await pause(900);
  await nextLines();
}
// each line stays up long enough to read, then the mouse clicks Next
async function nextLines() {
  const tEnd = Date.now() + 60000;
  while (Date.now() < tEnd) {
    const s = await p.evaluate(() => ({ dlg: RB.ui.dialogue.isOpen(), ch: !!document.querySelector('.choices:not(.hidden) .choice'), busy: RB.weave.busy() && !RB.weave.isOpen() }));
    if (s.ch) return;
    if (!s.dlg) { if (!s.busy) return; await pause(100); continue; }
    await pause(1400); // time to read the line
    const pt = await center('.dlg:not(.hidden) .b-next');
    if (pt) { await p.mouse.move(pt.x, pt.y, { steps: 3 }); await p.mouse.click(pt.x, pt.y); await p.mouse.move(6, 6, { steps: 2 }); }
    await pause(150);
  }
}
// click a thing in the world: the player walks up to it and looks at it (tap-to-move)
const tilePt = (x, y) => p.evaluate(([x, y]) => { const a = RB.render.tileToCss(x, y), c = RB.render.tileToCss(x + 1, y + 1); return { x: (a.x + c.x) / 2, y: (a.y + c.y) / 2 }; }, [x, y]);
async function clickTile(x, y) {
  // the camera eases after a jump: wait until it is still, then aim at the tile
  let a = await tilePt(x, y);
  for (let k = 0; k < 40; k++) { await pause(100); const b2 = await tilePt(x, y); if (Math.abs(b2.x - a.x) + Math.abs(b2.y - a.y) < 1) break; a = b2; }
  await p.mouse.move(a.x, a.y, { steps: 14 });
  await pause(160);
  const pt = await tilePt(x, y);
  await p.mouse.click(pt.x, pt.y);
  await p.mouse.move(6, 6, { steps: 4 });
}
async function inspect(x, y, choiceRe) {
  await clickTile(x, y);
  await p.waitForFunction(() => !!document.querySelector('.choices:not(.hidden) .choice') || RB.ui.dialogue.isOpen(), null, { timeout: 10000 });
  await pause(300);
  await nextLines();
  await p.waitForSelector('.choices:not(.hidden) .choice');
  await pause(900);
  const pt = await p.evaluate((src) => { const re = new RegExp(src); const b2 = [...document.querySelectorAll('.choices .choice')].find((x) => re.test(x.textContent)); if (!b2) return null; const q = b2.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; }, choiceRe.source);
  await clickAt(pt);
  await pause(300);
  await nextLines();
}

// ---- 1. Mio: the ward, then the clamp ---------------------------------------------------------------------------
await start('mio');
tick('start mio');
// click the screen: walk up to it and look; from its menu, "Weave a word on it…"
await inspect(32, 22, /Weave a word on it/);
tick('weave menu');
await p.waitForSelector('.weave-sheet:not(.hidden) .wv-w').catch(async (e) => { console.log('state: ' + JSON.stringify(await p.evaluate(() => ({ mode: RB.game.mode(), sheet: RB.weave.isOpen(), near: RB.weave.state().targets, pos: [RB.world.W.player.x, RB.world.W.player.y, RB.world.W.player.dir], back: RB.game.s.backlog.slice(-4).map((l) => l.who + ': ' + l.en.slice(0, 50)) })))); throw e; });
await pause(1400);               // the frame, the label, the description
await clickAt(await center('.weave-sheet .wv-w[data-w="mamoru"]'));
await p.waitForSelector('.chal .mc .choice');
await pause(1500);
const right = await p.evaluate(() => { const b2 = [...document.querySelectorAll('.chal .mc .choice')].find((x) => { const c = x.cloneNode(true); c.querySelectorAll('rt').forEach((r) => r.remove()); return c.textContent.replace(/\s+/g, '') === 'まもる'; }); const q = b2.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; });
await clickAt(right);
await p.waitForSelector('.fbwrap[data-fb=ok] [data-a=continue]');
await pause(900);
await clickAt(await center('.fbwrap[data-fb=ok] [data-a=continue]'));
await pause(2200);               // the ward, presented at the screen
tick('after ward');
await nextLines();
await pause(700);
await inspect(33, 22, /Close the clamp/);   // the clamp, from its menu
tick('clamp mio');
await pause(1200);
// ---- 2. Nao: shut it by hand, then the clamp -----------------------------------------------------------------------
await start('nao');
tick('start nao');
await inspect(32, 22, /Swing the screen shut/);
tick('screen nao');
await inspect(33, 22, /Close the clamp/);
await pause(1500);
const said = await p.evaluate(() => RB.game.s.backlog.filter((l) => l.who === 'nao').map((l) => l.en));
const video = p.video();
await ctx.close();
const raw = await video.path();
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.copyFileSync(raw, out);
fs.rmSync(dir, { recursive: true, force: true });
console.log('lead-in before play: ' + ((T0 - tPage) / 1000).toFixed(1) + ' s (trim it when re-encoding); ' + marks.join(' | '));
console.log('wrote ' + path.relative(root, out) + ' (' + Math.round(fs.statSync(out).size / 1024) + ' KiB); Nao said: ' + JSON.stringify(said) + (errors.length ? '; page errors: ' + errors.join(' | ') : '; no page errors'));
await b.close(); srv.close();
