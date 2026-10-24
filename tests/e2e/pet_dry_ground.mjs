// RBN-QA-172 (Agnes 6380328608, 6380554586; Local CL-271, CL-273): your pet never settles, rests or is placed on
// water, the walkable shallows included; it still follows your trail through them. In Chromium on the built game,
// with throwaway journeys at Sazanami (the jetty's boards x 20–21, y 17–24; the shallows along y 19; the sea below):
//  1. Local's fixture: down the jetty to (21,21) with Suzu, then 16 s still: wherever it settles is dry, and it never
//     sits or lies on water;
//  2. standing in the shallows with no dry tile free beside it (you above it, the sea below, shallows either side), 15 s:
//     it stays on its feet; on the boards for the same 15 s it sits, then lies down;
//  3. wading along the shallows (x 24–28): it follows through them (its trail is unchanged), then settles on the sand;
//  4. placed at a map's entry on the jetty (a load) and after a catch-up, with reduced motion too: on dry ground;
//  5. no page errors.
// Usage: node tools/build.mjs && node tests/e2e/pet_dry_ground.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const J = JSON.stringify;
const errorsAll = [];
const FLAGS = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_done: true, cr_done: true, yn_done: true, ch6_done: true };

async function begin(p, x, y, o) {
  o = o || {};
  await p.evaluate(async ([x, y, o, flags]) => {
    RB.game.debugStart('sz.hamlet', x, y, { edition: RB.edition.forNew(), comp: o.comp === undefined ? 'suzu' : o.comp, flags, dir: o.dir || 'down' });
    RB.game.settings.textSpeed = 'instant';
    RB.game.settings.reducedMotion = !!o.reduce; RB.game.applySettings();
    RB.save.autosave = async () => {};
    await new Promise((r) => setTimeout(r, 250));
    for (let i = 0; i < 60 && RB.ui.dialogue.isOpen(); i++) { RB.ui.dialogue.advance(true); await new Promise((r) => setTimeout(r, 40)); }
    RB.pets.meet(RB.game.s, 'cat'); RB.pets.select(RB.game.s, 'cat');
    RB.petWorld.place();
  }, [x, y, o, FLAGS]);
  await p.waitForTimeout(600);
}
// the pet now: its tile, whether that tile is water, its pose; you and your companion
const now = (p) => p.evaluate(() => {
  const W = RB.world.W, P = RB.petWorld.state(), t = RB.maps.tileAt(W.map, P.x, P.y);
  const po = P.pose || {};
  return { x: P.x, y: P.y, wet: !!(t && t.water), tile: t && t.id, moving: P.moving, sit: (po.sit || 0) > 0.5, lie: (po.lie || 0) > 0.5, shown: P.shown, alpha: P.alpha,
    px: W.player.x, py: W.player.y, cx: W.comp ? W.comp.x : null, cy: W.comp ? W.comp.y : null };
});
// hold a key until you stand on (x, y), or give up after `ms`
async function walkTo(p, key, x, y, ms) {
  await p.keyboard.down(key);
  const t0 = Date.now();
  while (Date.now() - t0 < (ms || 4000)) { const q = await now(p); if (q.px === x && q.py === y) break; await p.waitForTimeout(30); }
  await p.keyboard.up(key);
  await p.waitForTimeout(250);
}
// stand still for `ms`, sampling the pet
async function stand(p, ms) {
  const out = [];
  const t0 = Date.now();
  while (Date.now() - t0 < ms) { out.push(await now(p)); await p.waitForTimeout(250); }
  return out;
}
const restingWet = (S) => S.filter((q) => (q.sit || q.lie) && q.wet);

// ---- 1. Local's fixture: down the jetty --------------------------------------------------------------------------------
{
  const { p, ctx, errors } = await page(b, url, { viewport: { width: 1188, height: 848 } });
  await begin(p, 21, 16, { dir: 'down' });
  await walkTo(p, 'ArrowDown', 21, 21, 5000);
  const S = await stand(p, 16000);
  const last = S[S.length - 1];
  ok(last.px === 21 && last.py >= 20 && last.py <= 22 && !last.wet && !restingWet(S).length && (last.sit || last.lie),
    'down the jetty (to about (21,21)), 16 s still: it settles on dry ground and sits or lies there, never on water (' + J({ last, wetRest: restingWet(S).slice(0, 2), tiles: [...new Set(S.map((q) => q.x + ',' + q.y + (q.wet ? '~' : '')))] }) + ')');
  errorsAll.push(...errors);
  await ctx.close();
}
// ---- 2. water with nowhere dry, and the boards ------------------------------------------------------------------------
{
  const { p, ctx, errors } = await page(b, url, { viewport: { width: 1188, height: 848 } });
  await begin(p, 25, 18, { dir: 'up' });
  // the pet in the shallows just below you: you on the sand above it, the sea below, shallows either side (Suzu off to
  // one side, on the sand)
  await p.evaluate(() => { const c = RB.world.W.comp; if (c) { c.x = 22; c.y = 17; c.fx = 22; c.fy = 17; c.mv = null; } const P = RB.petWorld._P; P.x = 25; P.y = 19; P.fx = 25; P.fy = 19; P.mv = null; P.queue = []; P.still = 0; P.alpha = 1; P.fade = 0; });
  const S = await stand(p, 15500);
  const at = S.map((q) => q.x + ',' + q.y + (q.wet ? '~' : ''));
  const onWater = S.filter((q) => q.wet);
  ok(S[0].wet && !restingWet(S).length && onWater.length > 10,
    'in the shallows with nowhere dry free beside it, 15 s: it stays on its feet (no sitting or lying on water) (' + J({ tiles: [...new Set(at)], first: S[0], last: S[S.length - 1] }) + ')');
  // the same on the boards
  await begin(p, 21, 22, { dir: 'down' });
  await p.evaluate(() => { const P = RB.petWorld._P; P.x = 20; P.y = 22; P.fx = 20; P.fy = 22; P.mv = null; P.queue = []; P.still = 0; P.alpha = 1; P.fade = 0; });
  const B = await stand(p, 15500);
  const sat = B.findIndex((q) => q.sit), lay = B.findIndex((q) => q.lie);
  ok(!B.some((q) => q.wet) && sat >= 0 && lay > sat,
    'on the boards for the same 15 s: it sits, then lies down (' + J({ sat: sat * 250, lay: lay * 250, last: B[B.length - 1] }) + ')');
  errorsAll.push(...errors);
  await ctx.close();
}
// ---- 3. wading: it follows through the shallows, then settles on the sand ----------------------------------------------
{
  const { p, ctx, errors } = await page(b, url, { viewport: { width: 1188, height: 848 } });
  // (x 24–28: the sand above is clear; further east a crate with its own scene stands on it, which it never rests on)
  await begin(p, 24, 18, { dir: 'down' });
  await walkTo(p, 'ArrowDown', 24, 19, 2000);
  const T = [];
  await p.keyboard.down('ArrowRight');
  const t0 = Date.now();
  while (Date.now() - t0 < 6000) { const q = await now(p); T.push(q); if (q.px >= 28) break; await p.waitForTimeout(60); }
  await p.keyboard.up('ArrowRight');
  const S = await stand(p, 16000);
  const last = S[S.length - 1];
  ok(T.some((q) => q.wet) && last.py === 19 && !last.wet && !restingWet(S).length,
    'wading along the shallows: it follows through them, then settles on dry ground (' + J({ trailWet: [...new Set(T.filter((q) => q.wet).map((q) => q.x + ',' + q.y))], last }) + ')');
  errorsAll.push(...errors);
  await ctx.close();
}
// ---- 4. placed at a map's entry and after a catch-up, on dry ground ----------------------------------------------------
for (const reduce of [false, true]) {
  const { p, ctx, errors } = await page(b, url, { viewport: { width: 1188, height: 848 } });
  const placed = [];
  for (const [x, y, dir] of [[21, 19, 'down'], [20, 19, 'up'], [21, 24, 'down'], [20, 23, 'left']]) {
    await begin(p, x, y, { dir, reduce });
    placed.push(await now(p));
    await p.evaluate(() => { RB.petWorld.place(); });
    await p.waitForTimeout(400);
    placed.push(await now(p));
  }
  ok(placed.every((q) => !q.wet) && (!reduce || placed.every((q) => q.alpha === 1 || !q.shown)),
    'placed on the jetty at a map\'s entry and after a catch-up' + (reduce ? ', reduced motion' : '') + ': always on dry ground (' + J(placed.map((q) => [q.px + ',' + q.py, q.x + ',' + q.y + (q.wet ? '~' : ''), q.alpha])) + ')');
  errorsAll.push(...errors);
  await ctx.close();
}
ok(!errorsAll.length, 'no page errors' + (errorsAll.length ? ': ' + errorsAll.slice(0, 3).join(' | ') : ''));
await b.close(); srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
