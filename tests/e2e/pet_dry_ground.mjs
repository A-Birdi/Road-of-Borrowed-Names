// RBN-QA-172 (Agnes 6380328608, 6380554586; Local CL-271, CL-273): your pet never settles, rests or is placed on
// water, the walkable shallows included; it still follows your trail through them. In Chromium on the built game,
// with throwaway journeys at Sazanami (the jetty's boards x 20–21, y 17–24; the shallows along y 19; the sea below):
//  1. Local's fixture: down the jetty to (21,21) with Suzu, then 16 s still: wherever it settles is dry, and it never
//     sits or lies on water;
//  2. standing in the shallows with no dry tile free beside it (you above it, the sea below, shallows either side), 15 s:
//     it stays on its feet; on the boards for the same 15 s it sits, then lies down;
//  3. wading along the shallows (x 24–28): it follows through them (its trail is unchanged), then settles on the sand;
//  4. placed at a map's entry on the jetty and after a catch-up, with reduced motion too: on dry ground (both asked for
//     directly here: a fresh start and a forced placement; 9 is the real load and a catch-up the engine makes itself);
// The refinement (Agnes 6381070442):
//  5. nowhere dry and free within three steps of the lead (on Blockprint Row's open street, a patch made shallows for
//     the test: a synthetic fixture): it is placed unseen, then appears on dry ground once you walk to where there is some (as it did not:
//     unseen for good), reduced motion too;
//  6. your companion in the shallows with nowhere dry and free beside them: Greet together is not offered (its reason
//     says why; a rest point's menu leaves it out) and come() is false with the pet left where it was; on dry ground
//     the greeting plays, the pet coming to their side, never sitting or lying on water;
//  7. an authored movement (sit, settle) in water: on its feet; on the boards it sits and lies as authored;
//  8. a handoff (where a vignette's animal was) on water: it starts there, as authored, then steps off onto dry ground
//     once still, never sitting there; the four vignettes' own spots measured (reported);
//  9. a real save and load on the jetty, and the catch-up the engine makes when you are moved at once (a scene's
//     placement): on dry ground;
// 10b. Local's exact jetty walk (zz_pet_jetty2, CL-271, CL-277): from (22,13) with Suzu, down, down, left, then down six
//     times to (21,21): the cat never on water the whole way, nor in the 3 s after (on CC-021's build it stood on the
//     shallows at (22,19) with you at (21,21));
// 10. the dog, the tanuki and the bird as the cat: on their feet in the shallows with nowhere dry, settling on the
//     boards;
// 11. no page errors.
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
    RB.game.debugStart(o.map || 'sz.hamlet', x, y, { edition: RB.edition.forNew(), comp: o.comp === undefined ? 'suzu' : o.comp, flags, dir: o.dir || 'down' });
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
    'placed on the jetty at a fresh start and when placed again (both asked for directly)' + (reduce ? ', reduced motion' : '') + ': always on dry ground (' + J(placed.map((q) => [q.px + ',' + q.py, q.x + ',' + q.y + (q.wet ? '~' : ''), q.alpha])) + ')');
  errorsAll.push(...errors);
  await ctx.close();
}
// ---- 5. nowhere dry near: unseen, then it appears once there is somewhere ---------------------------------------------
// a patch of the map within four steps of you made shallows (floor, water): nothing dry within three steps of Suzu
const soak = (p) => p.evaluate(() => {
  const W = RB.world.W, m = W.map, sh = RB.tiles.T.shallow;
  const c = W.player;
  for (let y = c.y - 4; y <= c.y + 4; y++) for (let x = c.x - 4; x <= c.x + 4; x++) {
    if (Math.abs(x - c.x) + Math.abs(y - c.y) > 4) continue;
    m.tiles[y * m.w + x] = sh; m.block[y * m.w + x] = 0;
  }
  if (RB.render && RB.render.invalidate) RB.render.invalidate();
  if (W.comp) { W.comp.x = c.x; W.comp.y = c.y - 1; W.comp.fx = W.comp.x; W.comp.fy = W.comp.y; W.comp.mv = null; }
  RB.petWorld.place();
  return { at: [c.x, c.y], shallow: !!sh };
});
// an open stretch of ground: every tile within six steps dry floor, no way out, nobody, no prop
const openSand = (p) => p.evaluate(() => {
  const m = RB.world.W.map;
  for (let cy = 6; cy < m.h - 6; cy++) for (let cx = 6; cx < m.w - 6; cx++) {
    let good = true;
    for (let y = cy - 6; y <= cy + 6 && good; y++) for (let x = cx - 6; x <= cx + 6 && good; x++) {
      if (Math.abs(x - cx) + Math.abs(y - cy) > 6) continue;
      const t = RB.maps.tileAt(m, x, y);
      if (!t || t.water || RB.maps.blockedStatic(m, x, y) || RB.maps.exitAt(m, x, y) || m.triggers.some((q) => x >= q.x && x < q.x + q.w && y >= q.y && y < q.y + q.h) || m.props.some((q) => q.x === x && q.y === y) || RB.world.W.npcs.some((n) => n.x === x && n.y === y)) good = false;
    }
    if (good) return [cx, cy];
  }
  return null;
});
for (const reduce of [false, true]) {
  const { p, ctx, errors } = await page(b, url, { viewport: { width: 1188, height: 848 } });
  await begin(p, 31, 14, { dir: 'right', map: 'mp.blockprint' });
  const at = await openSand(p);
  await begin(p, at[0], at[1], { dir: 'right', reduce, map: 'mp.blockprint' });
  const fx = await soak(p);
  await p.waitForTimeout(500);
  const before = await now(p);
  const unseen = await p.evaluate(() => RB.petWorld.state().unseen);
  // walk east until you are out of the patch's middle (six steps), then stop
  await walkTo(p, 'ArrowRight', at[0] + 6, at[1], 6000);
  await p.waitForTimeout(reduce ? 300 : 900);
  const after = await now(p);
  ok(before.alpha === 0 && after.alpha === 1 && !after.wet && after.shown,
    'nowhere dry within three steps of Suzu' + (reduce ? ', reduced motion' : '') + ': placed unseen, then on dry ground and seen once you walk to where there is some (' + J({ fixture: fx, before: [before.x, before.y, before.alpha, unseen], after: [after.px, after.py, after.x + ',' + after.y + (after.wet ? '~' : ''), after.alpha] }) + ')');
  errorsAll.push(...errors);
  await ctx.close();
}
// ---- 6. Greet together, and come() -----------------------------------------------------------------------------------
{
  const { p, ctx, errors } = await page(b, url, { viewport: { width: 1188, height: 848 } });
  await begin(p, 25, 18, { dir: 'down' });
  // Suzu in the shallows below you: either side shallows, the sea below, you above
  const wetC = await p.evaluate(async () => {
    const W = RB.world.W, c = W.comp; c.x = 25; c.y = 19; c.fx = 25; c.fy = 19; c.mv = null;
    const P = RB.petWorld._P; P.x = 22; P.y = 17; P.fx = 22; P.fy = 17; P.mv = null; P.queue = []; P.still = 0; P.alpha = 1; P.fade = 0;
    await new Promise((r) => setTimeout(r, 100));
    const s = RB.game.s, why = RB.pets.canGreet(s), rest = RB.pets.restOption(s);
    const r = await RB.petWorld.come('comp'), st = RB.petWorld.state();
    return { why, rest: rest ? rest.id : null, come: r, pet: [st.x, st.y], beside: RB.petWorld.beside ? RB.petWorld.beside('comp') : 'none on this build' };
  });
  ok(typeof wetC.why === 'string' && /dry ground/.test(wetC.why) && wetC.rest === null && wetC.come === false && wetC.pet[0] === 22 && wetC.pet[1] === 17 && wetC.beside === null,
    'Suzu in the shallows with nowhere dry and free beside her: Greet together is not offered (its reason says why; no rest-point choice), and come() is false with the pet left where it was (' + J(wetC) + ')');
  // on dry ground: the greeting plays
  const dry = await p.evaluate(async () => {
    const W = RB.world.W, c = W.comp; c.x = 23; c.y = 17; c.fx = 23; c.fy = 17; c.mv = null;
    const P = RB.petWorld._P; P.x = 27; P.y = 18; P.fx = 27; P.fy = 18; P.mv = null; P.queue = []; P.still = 0;
    const s = RB.game.s, why = RB.pets.canGreet(s);
    if (why !== true) return { why };
    const S = [];
    let done = false;
    RB.pets.greet(s).then(() => { done = true; });
    const t0 = performance.now();
    while (!done && performance.now() - t0 < 30000) {
      const st = RB.petWorld.state(), t = RB.maps.tileAt(W.map, st.x, st.y), po = st.pose || {};
      S.push({ x: st.x, y: st.y, wet: !!(t && t.water), sit: (po.sit || 0) > 0.5, lie: (po.lie || 0) > 0.5 });
      if (RB.ui.dialogue.isOpen()) RB.ui.dialogue.advance(true);
      await new Promise((r) => setTimeout(r, 120));
    }
    const st = RB.petWorld.state();
    return { why, done, end: [st.x, st.y], comp: [c.x, c.y], wetRest: S.filter((q) => q.wet && (q.sit || q.lie)).length, wet: S.filter((q) => q.wet).length, n: S.length };
  });
  ok(dry.why === true && dry.done && Math.abs(dry.end[0] - dry.comp[0]) + Math.abs(dry.end[1] - dry.comp[1]) === 1 && !dry.wet && !dry.wetRest,
    'Suzu on dry ground: the greeting plays, the pet coming to her side on dry ground, never on water (' + J(dry) + ')');
  errorsAll.push(...errors);
  await ctx.close();
}
// ---- 7. an authored movement in water ----------------------------------------------------------------------------------
{
  const { p, ctx, errors } = await page(b, url, { viewport: { width: 1188, height: 848 } });
  const actAt = async (x, y, px, py) => {
    await begin(p, px, py, { dir: 'up' });
    return p.evaluate(async ([x, y]) => {
      const c = RB.world.W.comp; if (c) { c.x = 22; c.y = 17; c.fx = 22; c.fy = 17; c.mv = null; }
      const P = RB.petWorld._P; P.x = x; P.y = y; P.fx = x; P.fy = y; P.mv = null; P.queue = []; P.still = 0; P.alpha = 1; P.fade = 0;
      const out = {};
      for (const k of ['sit', 'settle']) {
        let done = false, sit = 0, lie = 0;
        RB.petWorld.act(RB.pets.WORLD_ANIM[k]('cat')).then(() => { done = true; });
        const t0 = performance.now();
        while (!done && performance.now() - t0 < 4000) { const po = RB.petWorld.state().pose || {}; if ((po.sit || 0) > 0.5) sit++; if ((po.lie || 0) > 0.5) lie++; await new Promise((r) => setTimeout(r, 50)); }
        const st = RB.petWorld.state();
        out[k] = { done, sit, lie, at: [st.x, st.y] };
      }
      return { auto: !!(RB.test && RB.test.auto), out };
    }, [x, y]);
  };
  const inWater = await actAt(25, 19, 25, 18), onBoards = await actAt(20, 22, 21, 22);
  ok(!inWater.auto && inWater.out.sit.done && inWater.out.settle.done && !inWater.out.sit.sit && !inWater.out.settle.sit && !inWater.out.settle.lie && onBoards.out.sit.sit > 0 && onBoards.out.settle.lie > 0,
    'an authored movement (sit, settle) in the shallows: on its feet throughout; on the boards it sits and lies as authored (' + J({ inWater, onBoards }) + ')');
  errorsAll.push(...errors);
  await ctx.close();
}
// ---- 8. a handoff on water ---------------------------------------------------------------------------------------------
{
  const { p, ctx, errors } = await page(b, url, { viewport: { width: 1188, height: 848 } });
  await begin(p, 22, 17, { dir: 'down' });
  await p.evaluate(() => { const P = RB.petWorld._P; P.handoff = { map: 'sz.hamlet', x: 25, y: 19, dir: 'down' }; RB.petWorld.place(); });
  await p.waitForTimeout(120);
  const first = await now(p);
  const S = await stand(p, 4000);
  const last = S[S.length - 1];
  ok(first.x === 25 && first.y === 19 && first.wet && first.alpha === 1 && !last.wet && !restingWet([first, ...S]).length,
    'a handoff on water (where a vignette\'s animal was): it starts there, as authored, then steps off onto dry ground once still, never sitting there (' + J({ first: [first.x, first.y, first.alpha], last: [last.x, last.y, last.tile] }) + ')');
  // the four vignettes' own spots, as their place() gives them over 20 s (reported, not asserted)
  const spots = await p.evaluate(() => {
    const s = RB.game.s;
    return RB.petWorld.WILD.map((d) => {
      const m = RB.maps.compile(d.map), at = new Set();
      for (let t = 0; t <= 20000; t += 500) { try { const q = d.place(s, t, false); if (q) { const x = Math.round(q.x), y = Math.round(q.y), tt = RB.maps.tileAt(m, x, y); at.add(x + ',' + y + (tt && tt.water ? '~' : '')); } } catch (e) { at.add('throws'); break; } }
      return [d.id, d.map, [...at]];
    });
  });
  console.log('     the vignettes\' own spots over 20 s (~ water): ' + J(spots));
  errorsAll.push(...errors);
  await ctx.close();
}
// ---- 9. a real save and load, and the engine's own catch-up -------------------------------------------------------------
{
  const { p, ctx, errors } = await page(b, url, { viewport: { width: 1188, height: 848 } });
  const loaded = [];
  for (const [x, y, dir] of [[21, 19, 'down'], [20, 19, 'up'], [21, 24, 'down'], [20, 23, 'left']]) {
    await begin(p, x, y, { dir });
    const r = await p.evaluate(async () => { try { await RB.save.manualSave(1); await RB.game.loadCampaign(1, 'manual'); return 'loaded'; } catch (e) { return 'failed: ' + e.message; } });
    await p.waitForTimeout(900);
    for (let i = 0; i < 40 && await p.evaluate(() => RB.ui.dialogue.isOpen()); i++) { await p.evaluate(() => RB.ui.dialogue.advance(true)); await p.waitForTimeout(40); }
    loaded.push(Object.assign({ r }, await now(p)));
  }
  ok(loaded.every((q) => q.r === 'loaded' && !q.wet && q.shown && q.alpha === 1),
    'saved and loaded on the jetty (four places): placed on dry ground (' + J(loaded.map((q) => [q.r, q.px + ',' + q.py, q.x + ',' + q.y + (q.wet ? '~' : ''), q.alpha])) + ')');
  // moved at once down the jetty (the at-once placement a scene uses): the engine's catch-up places it dry
  const caught = [];
  for (const [x, y, dir] of [[21, 24, 'down'], [20, 23, 'left'], [21, 20, 'right']]) {
    await begin(p, 21, 16, { dir: 'down' });
    const before = await p.evaluate(() => RB.petWorld.state().stats.catchups);
    await p.evaluate(async ([x, y, dir]) => { await RB.staging.walkTo('pc', x, y, dir, { now: true }); }, [x, y, dir]);
    await p.waitForTimeout(900);
    const st = await p.evaluate(() => { const q = RB.petWorld.state(); return { catchups: q.stats.catchups, why: q.lastCatchUp }; });
    caught.push(Object.assign({ before }, st, await now(p)));
  }
  ok(caught.every((q) => q.catchups === q.before + 1 && q.why === 'warp' && !q.wet && q.alpha === 1),
    'moved at once down the jetty (a scene\'s placement): the engine catches it up, on dry ground (' + J(caught.map((q) => [q.px + ',' + q.py, q.why, q.x + ',' + q.y + (q.wet ? '~' : ''), q.alpha])) + ')');
  errorsAll.push(...errors);
  await ctx.close();
}
// ---- 10b. Local's exact jetty walk ---------------------------------------------------------------------------------------
{
  const { p, ctx, errors } = await page(b, url, { viewport: { width: 1188, height: 848 } });
  await begin(p, 22, 13, { dir: 'down' });
  const S = [];
  let at = [22, 13];
  // one tap a tile: the key held only until you start to move, then let go, and the step finished before the next
  const moving = () => p.evaluate(() => !!RB.world.W.player.mv);
  for (const [key, dx, dy] of [['ArrowDown', 0, 1], ['ArrowDown', 0, 1], ['ArrowLeft', -1, 0], ...Array(6).fill(['ArrowDown', 0, 1])]) {
    at = [at[0] + dx, at[1] + dy];
    await p.keyboard.down(key);
    for (let i = 0; i < 100 && !(await moving()); i++) await p.waitForTimeout(5);
    await p.keyboard.up(key);
    for (let i = 0; i < 100; i++) { const q = await now(p); S.push(q); if (!(await moving())) break; await p.waitForTimeout(20); }
    for (let i = 0; i < 3; i++) { S.push(await now(p)); await p.waitForTimeout(60); }
  }
  S.push(...await stand(p, 3000));
  const last = S[S.length - 1];
  const wetAt = [...new Set(S.filter((q) => q.wet).map((q) => q.x + ',' + q.y))];
  ok(last.px === 21 && last.py === 21 && !wetAt.length && !last.wet,
    'Local\'s exact jetty walk (from (22,13) with Suzu: down, down, left, down six times to (21,21)): never on water, the whole way nor in the 3 s after (' + J({ you: [last.px, last.py], cat: [last.x, last.y, last.tile], wetAt, tiles: [...new Set(S.map((q) => q.x + ',' + q.y + (q.wet ? '~' : '')))] }) + ')');
  errorsAll.push(...errors);
  await ctx.close();
}
// ---- 10. the other species --------------------------------------------------------------------------------------------
{
  const pages = [];
  for (const sp of ['dog', 'tanuki', 'bird']) {
    const pg = await page(b, url, { viewport: { width: 1188, height: 848 } });
    await begin(pg.p, 25, 18, { dir: 'up' });
    await pg.p.evaluate((sp) => { RB.pets.meet(RB.game.s, sp); RB.pets.select(RB.game.s, sp); RB.petWorld.place(); }, sp);
    await pg.p.waitForTimeout(400);
    await pg.p.evaluate(() => { const c = RB.world.W.comp; if (c) { c.x = 22; c.y = 17; c.fx = 22; c.fy = 17; c.mv = null; } const P = RB.petWorld._P; P.x = 25; P.y = 19; P.fx = 25; P.fy = 19; P.mv = null; P.queue = []; P.still = 0; P.alpha = 1; P.fade = 0; });
    pages.push(Object.assign({ sp }, pg));
  }
  const W = await Promise.all(pages.map((q) => stand(q.p, 15500)));
  for (const q of pages) {
    await begin(q.p, 21, 22, { dir: 'down' });
    await q.p.evaluate((sp) => { RB.pets.meet(RB.game.s, sp); RB.pets.select(RB.game.s, sp); const P = RB.petWorld._P; RB.petWorld.place(); }, q.sp);
    await q.p.waitForTimeout(400);
    await q.p.evaluate(() => { const P = RB.petWorld._P; P.x = 20; P.y = 22; P.fx = 20; P.fy = 22; P.mv = null; P.queue = []; P.still = 0; P.alpha = 1; P.fade = 0; });
  }
  const B = await Promise.all(pages.map((q) => stand(q.p, 15500)));
  const res = pages.map((q, i) => ({ sp: q.sp, sp2: null, wetTiles: W[i].filter((r) => r.wet).length, wetRest: restingWet(W[i]).length, boardsLie: B[i].some((r) => r.lie && !r.wet), boardsSitOrFluff: B[i].some((r) => r.sit), boardsWet: B[i].some((r) => r.wet) }));
  ok(res.every((r) => r.wetTiles > 10 && !r.wetRest && r.boardsLie && !r.boardsWet && (r.sp === 'bird' || r.boardsSitOrFluff)),
    'the dog, the tanuki and the bird: on their feet in the shallows with nowhere dry, 15 s; on the boards they settle (sit, then lie; the bird lies) (' + J(res) + ')');
  for (const q of pages) { errorsAll.push(...q.errors); await q.ctx.close(); }
}
ok(!errorsAll.length, 'no page errors' + (errorsAll.length ? ': ' + errorsAll.slice(0, 3).join(' | ') : ''));
await b.close(); srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
