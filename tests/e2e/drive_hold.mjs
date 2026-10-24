// The test driver (tests/e2e/drive.mjs) is held where a player is held (a sweep finding; Local CL-320/321, Agnes
// 6387966201/6388624191). The village's night before departure (rw_night) holds its roads out, not its doors
// (map.def.hold). The driver goes through exits by RB.game.transition, not by walking, so it finds its routes by the
// world's own test, RB.world.holdAt, which arrive() uses. In Chromium on the built game, the same exit both ways:
//  1. the world, on the night: a step onto the road north (to the mill road) is stepped back, the path cleared, the
//     scene that says why run, the village kept;
//  2. the driver, from the village on the night: no route to the mill road or the road south; the houses (doors) still
//     routes;
//  3. the driver from inside the hall, the village explored through its door (a map other than the one loaded): the same;
//  4. the night over (rw_night cleared): the roads out are routes again, and the same step north leaves for the mill road;
//  5. no page errors.
// (tests/unit/map_hold.test.mjs holds the rest: exceptions, holds over doors, the first of several holds, release.)
// Usage: node tools/build.mjs && node tests/e2e/drive_hold.mjs
import { serve, launch, page } from './lib.mjs';
import { install } from './drive.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const J = JSON.stringify;
const { p, ctx, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });

// the night before departure in the village, as a journey reaches it: the mill open (its road north an exit), the evening
// gathered at the hall, the night on
await p.evaluate(() => {
  const s = RB.game.debugStart('rw.village', 22, 2, { edition: RB.edition.forNew(), dir: 'up' });
  RB.game.settings.textSpeed = 'instant'; RB.game.applySettings();
  RB.save.autosave = async () => {};
  Object.assign(s.flags, { rw_mill_open: true, rw_evening: true, rw_night: true, rw_hall_gather: true });
  window.__ran = [];
  const run0 = RB.script.run;
  RB.script.run = function (id) { window.__ran.push(id); return run0.apply(this, arguments); };
});
await p.waitForTimeout(400);
const closeAll = () => p.evaluate(async () => { for (let i = 0; i < 40 && RB.ui.dialogue.isOpen(); i++) { RB.ui.dialogue.advance(true); await new Promise((r) => setTimeout(r, 50)); } });
await closeAll();
await p.evaluate(install);
// a step north from the tile below the exit, as the player takes it (the world's move, then arrive())
async function stepNorth() {
  await p.evaluate(() => { const W = RB.world.W; W.player.x = 22; W.player.y = 1; W.player.fx = 22; W.player.fy = 1; W.player.dir = 'up'; W.path = [[22, 0]]; window.__ran.length = 0; RB.world._tryMove('up'); });
  await p.waitForTimeout(700);
  return p.evaluate(() => ({ map: RB.world.W.map.id, at: [RB.world.W.player.x, RB.world.W.player.y], path: RB.world.W.path, ran: window.__ran.slice() }));
}
const routes = () => p.evaluate(() => Object.fromEntries(['rw.millroad', 'rw.road', 'rw.tea', 'rw.apoth', 'rw.village'].map((m) => { const r = RBDrive.route(null, m); return [m, r ? r.length : null]; })));

// ---- 1. the world on the night -----------------------------------------------------------------------------------------
const exitN = await p.evaluate(() => RB.world.W.map.exits.find((e) => e.to === 'rw.millroad'));
ok(exitN && exitN.x === 22 && exitN.y === 0 && !exitN.door, 'the road north to the mill road is an exit, not a door (' + J(exitN) + ')');
const held = await p.evaluate(() => { const W = RB.world.W, ex = W.map.exits.find((e) => e.to === 'rw.millroad'); return RB.world.holdAt(W.map.def, ex, RB.game.s); });
ok(held && held.scene === 'rw.night_hold', 'on the night the world holds it: ' + J(held));
const w1 = await stepNorth();
ok(w1.map === 'rw.village' && w1.at[0] === 22 && w1.at[1] === 1 && !w1.path && w1.ran.includes('rw.night_hold'), 'a step onto it on the night: stepped back, the path cleared, the night\'s scene run, still in the village (' + J(w1) + ')');
await closeAll();

// ---- 2. the driver from the village on the night -------------------------------------------------------------------------
const r2 = await routes();
ok(r2['rw.millroad'] === null && r2['rw.road'] === null, 'the driver from the village on the night: no route out by the mill road or the road south (' + J(r2) + ')');
ok(r2['rw.tea'] !== null && r2['rw.apoth'] !== null, 'and the houses still routes, their doors open (' + J(r2) + ')');

// ---- 3. from inside the hall --------------------------------------------------------------------------------------------
const inHall = await p.evaluate(async () => {
  const ex = RB.world.W.map.exits.find((e) => e.to === 'rw.hall');
  RB.world.enter('rw.hall', ex.tx, ex.ty, 'down');
  await new Promise((r) => setTimeout(r, 300));
  return RB.world.W.map.id;
});
await closeAll();
const r3 = await routes();
ok(inHall === 'rw.hall' && r3['rw.village'] !== null && r3['rw.millroad'] === null && r3['rw.road'] === null && r3['rw.tea'] !== null, 'the driver from inside the hall (the village explored through its door): the village and its houses routes, none out of it (' + J({ inHall, r3 }) + ')');

// ---- 4. the night over --------------------------------------------------------------------------------------------------
await p.evaluate(async () => {
  delete RB.game.s.flags.rw_night;
  const ex = RB.content.maps['rw.hall'] && RB.maps.compile('rw.hall').exits.find((e) => e.to === 'rw.village');
  RB.world.enter('rw.village', 22, 2, 'up');
  await new Promise((r) => setTimeout(r, 300));
  return !!ex;
});
await closeAll();
const r4 = await routes();
ok(r4['rw.millroad'] !== null && r4['rw.road'] !== null, 'the night over: the roads out are routes again (' + J(r4) + ')');
const w4 = await stepNorth();
ok(w4.map === 'rw.millroad' && !w4.ran.includes('rw.night_hold'), 'and the same step north leaves for the mill road (' + J(w4) + ')');

ok(!errors.length, 'no page errors (' + J(errors).slice(0, 300) + ')');
await ctx.close(); await b.close(); srv.close();
console.log(pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
