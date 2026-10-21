// RBN-QA-065 (Agnes 6313145958/6313579108; Local CL-099/CL-100; Cloud CC-055/CC-056): Rokusuke's leaking oil cask on the
// Lantern Road was drawn as an ordinary upright barrel. Now the event's own cask (lf_road's unique.at.props, (21,15))
// lies tipped and leaking while the request stands, and is set upright at the line that says so; the cart's barrel at
// (19,15) and barrels elsewhere are untouched. In Chromium on the built game:
//  1. the event standing: the cask at (21,15) tipped, the cart's barrel at (19,15) upright, one cask on that tile;
//     the cask is the event's own thing (examining it runs the event); its tile is as solid as before;
//  2. answered right: on "You tighten the plug as the card says, and the two of you stand the cask upright" the cask is
//     upright; when the scene ends the event's things go (seen through), as before;
//  3. "come back later" (a known-wrong answer, seen marked wrong, then "Come back later"): the cask stays tipped,
//     the event still stands;
//  4. the drawing: the tipped cask differs from the upright one; with motion a drop runs down its head (two moments
//     differ), with reduced motion the same picture at every moment (the pool and the wet run still there);
//  5. no page errors (desktop and phone).
// Usage: node tools/build.mjs && node tests/e2e/road_oil.mjs   (EVIDENCE=dir for captures)
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const ev = process.env.EVIDENCE;
if (ev) fs.mkdirSync(ev, { recursive: true });
const FL = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, lf_arrived: true };

async function start(o = {}) {
  const { p, errors } = await page(b, url, { viewport: o.vp || { width: 1180, height: 757 } });
  await p.evaluate(([o, FL]) => {
    const s = RB.game.debugStart('lf.road', 23, 14, { comp: 'suzu', dir: 'left', edition: RB.edition.forNew(), flags: FL });
    s.learn.profile = 'E'; s.learn.kanaKnown = 'both';
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.input = 'choice'; RB.game.settings.lightbulb = false; RB.game.settings.reducedMotion = !!o.reduced; RB.game.applySettings();
    const R = RB.town.rec(s); R.roads.lf_road = { unique: null, solved: {}, offered: 1, here: { id: 'oil' }, visit: R.moves, lastMap: 'lf.road' };
    s.flags['roadev.lf_road.oil'] = true;
    RB.world.refreshActors();
  }, [o, FL]);
  await p.waitForTimeout(900);
  return { p, errors };
}
// what stands on the cask's tile and the cart's barrel's, as drawn now
const casks = (p) => p.evaluate(() => {
  const W = RB.world.W, s = RB.game.s;
  const at = (x, y) => W.map.props.filter((q) => q.p === 'barrel' && q.x === x && q.y === y && (!q.if || RB.state.test(s, q.if))).map((q) => ({ tipped: !!(q.o && q.o.tipped), scene: q.scene || null }));
  return { cask: at(21, 15), cart: at(19, 15), solid: RB.maps.blockedStatic(W.map, 21, 15) || !!RB.world.blocked(21, 15, { ignorePlayer: true }), standing: RB.state.test(s, 'roadev.lf_road.oil'), done: !!s.flags.lw_lf_oil_done, upright: !!s.flags.lw_lf_oil_upright };
});
// talk to Rokusuke and read the scene through, answering right or leaving after a wrong answer; the casks at each line
async function play(p, answer, shot) {
  const beats = [];
  let n = 0, wrong = null;
  await p.evaluate(() => RB.world.interact());
  for (let i = 0; i < 200; i++) {
    const st = await p.evaluate(() => { const d = RB.ui.dialogue.isOpen() && RB.ui.dialogue.shown(); return { d: d ? String(d.en || '').slice(0, 200) : null, mode: RB.game.mode(), run: RB.script.isRunning(), chal: !!document.querySelector('.chal .mc .btn') }; });
    if (st.d) {
      if (!beats.length || beats[beats.length - 1].d !== st.d) { await p.waitForTimeout(200); beats.push({ d: st.d, ...(await casks(p)) }); if (ev && shot) await p.screenshot({ path: path.join(ev, shot + '_' + (++n) + '.png') }); }
      await p.click('.dlg .b-next').catch(() => {});
      await p.waitForTimeout(150);
      continue;
    }
    if (st.chal) {
      if (answer === 'right') {
        const k = await p.evaluate(() => document.querySelectorAll('.chal .mc .btn').length);
        for (let j = 0; j < k; j++) {
          await p.evaluate((j) => { const x = [...document.querySelectorAll('.chal .mc .btn')][j]; if (x && !x.disabled) x.click(); }, j);
          await p.waitForTimeout(150);
          if (await p.evaluate(() => !!document.querySelector('.fbwrap[data-fb=ok] .fb-go'))) break;
          await p.evaluate(() => { const g = document.querySelector('.fbwrap:not([data-fb=ok]) [data-a=retry], .fbwrap:not([data-fb=ok]) .fb-go'); if (g) g.click(); });
          await p.waitForTimeout(150);
        }
        await p.evaluate(() => { const g = document.querySelector('.fbwrap[data-fb=ok] .fb-go'); if (g) g.click(); });
      } else {
        // a known-wrong answer (the E card's 「栓を抜く」, "pull the plug out": the answers are shuffled, so by its
        // words, not its place), seen marked wrong, then "Come back later" (Agnes 6315806927)
        const picked = await p.evaluate(() => { const x = [...document.querySelectorAll('.chal .mc .btn')].find((b) => /抜/.test(b.textContent)); if (x) x.click(); return x ? x.textContent.replace(/\s+/g, '') : null; });
        await p.waitForTimeout(300);
        const mark = await p.evaluate(() => { const w = document.querySelector('.fbwrap[data-fb]'); return w ? w.getAttribute('data-fb') : null; });
        const left = await p.evaluate(() => { const bt = [...document.querySelectorAll('[data-a=leave]')].find((x) => x.offsetParent && /Come back later/.test(x.textContent)); if (bt) { bt.click(); return true; } return false; });
        wrong = { picked, mark, left };
      }
      await p.waitForTimeout(400);
      continue;
    }
    const cont = await p.evaluate(() => { const bt = [...document.querySelectorAll('button')].find((x) => x.offsetParent && /^\s*(Continue|Next|OK)\b/.test(x.textContent)); if (bt) { bt.click(); return true; } return false; });
    if (cont) { await p.waitForTimeout(300); continue; }
    if (!st.run && st.mode === 'world' && beats.length) break;
    await p.waitForTimeout(150);
  }
  await p.waitForTimeout(600);
  return { beats, wrong, end: await casks(p) };
}
// the barrel drawn on its own (the game's own art), tipped or not, at two moments
const drawn = (p) => p.evaluate(() => {
  // (the road's own palette, as the renderer takes it: RB.tiles.PAL by the map's region)
  const pd = RB.props.P.barrel, m = RB.world.W.map.def, pal = RB.tiles.PAL[m.region] || RB.tiles.PAL.reedwake;
  const shot = (o, t) => { const c = document.createElement('canvas'); c.width = 96; c.height = 96; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; pd.draw2(g, 32, 32, pal, t, Object.assign({ cx: 21, cy: 15 }, o)); return c.toDataURL(); };
  return { up: shot({}, 100), tipA: shot({ tipped: true }, 100), tipB: shot({ tipped: true }, 600) };
});

// 1. the event standing; 4. the drawing
for (const [name, vp] of [['desktop', { width: 1180, height: 757 }], ['phone', { width: 390, height: 844 }]]) {
  const { p, errors } = await start({ vp });
  const c = await casks(p);
  ok(c.standing && c.cask.length === 1 && c.cask[0].tipped && c.cask[0].scene === 'lf.lw_road_oil' && c.cart.length === 1 && !c.cart[0].tipped && c.solid, name + ': the event\'s cask tipped (its own scene), the cart\'s barrel upright, the tile solid as before (' + JSON.stringify(c) + ')');
  if (ev) await p.screenshot({ path: path.join(ev, 'standing_' + name + '.png') });
  if (name === 'desktop') {
    const d = await drawn(p);
    ok(d.tipA !== d.up && d.tipA !== d.tipB, 'with motion: the tipped cask is its own picture, and a drop runs down its head (two moments differ)');
  }
  ok(!errors.length, name + ': no page errors ' + errors.slice(0, 2).join(' | '));
  await p.close();
}
{
  const { p, errors } = await start({ reduced: true });
  const d = await drawn(p);
  ok(d.tipA !== d.up && d.tipA === d.tipB, 'reduced motion: the tipped cask is its own picture, the same at every moment');
  if (ev) await p.screenshot({ path: path.join(ev, 'standing_reduced.png') });
  ok(!errors.length, 'reduced motion: no page errors ' + errors.slice(0, 2).join(' | '));
  await p.close();
}
// 2. answered right
{
  const { p, errors } = await start();
  const r = await play(p, 'right', 'right');
  const before = r.beats.find((x) => /Lend a hand/.test(x.d)), fixed = r.beats.find((x) => /stand the cask upright/.test(x.d));
  ok(before && before.cask.length === 1 && before.cask[0].tipped, 'right: while he asks, the cask is tipped (' + JSON.stringify(before && before.cask) + ')');
  ok(fixed && fixed.cask.length === 1 && !fixed.cask[0].tipped && fixed.cart.length === 1 && !fixed.cart[0].tipped, 'right: on the line that stands it up, the cask is upright; the cart\'s barrel as it was (' + JSON.stringify(fixed && { cask: fixed.cask, cart: fixed.cart }) + ')');
  ok(r.end.done && !r.end.standing && !r.end.cask.length && !r.end.cart.length, 'right: seen through, the event\'s things go as before (' + JSON.stringify(r.end) + ')');
  ok(!errors.length, 'right: no page errors ' + errors.slice(0, 2).join(' | '));
  await p.close();
}
// 3. come back later
{
  const { p, errors } = await start();
  const r = await play(p, 'wrong', 'later');
  const later = r.beats.find((x) => /hold it shut myself/.test(x.d));
  ok(r.wrong && /栓/.test(r.wrong.picked || '') && r.wrong.mark && r.wrong.mark !== 'ok' && r.wrong.left, 'later: a known-wrong answer ("pull the plug out") marked wrong, then "Come back later" (' + JSON.stringify(r.wrong) + ')');
  ok(later && later.cask.length === 1 && later.cask[0].tipped && r.end.standing && !r.end.done && !r.end.upright && r.end.cask.length === 1 && r.end.cask[0].tipped, 'later: the cask stays tipped and the event still stands (' + JSON.stringify({ later: later && later.cask, end: r.end }) + ')');
  ok(!errors.length, 'later: no page errors ' + errors.slice(0, 2).join(' | '));
  await p.close();
}
console.log(`\nroad_oil: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
