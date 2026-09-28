// Playtest fixes in the world (2026-09-28 report), each checked in the real
// game: a lit lantern shows as lit; a house with no inside keeps its door
// shut and says so; going into a building puts you on its mat; people who
// speak in the Lantern Hall are there when they speak; Reedwake's night keeps
// you in the village until morning; someone leaving walks to a door or exit
// and fades instead of vanishing (and someone arriving walks in); people and
// trees move a little when idle; the route chart puts Saltglass west of
// Reedwake, as the story and the roads do.
// Usage: node tests/e2e/world_fixes.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let fail = 0;
const innerHeightOf = (h) => h;
const assert = (c, m) => { if (!c) { fail++; console.log('FAIL ' + m); } else console.log('ok   ' + m); };
const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
const start = (m, x, y, flags) => p.evaluate(async ([m, x, y, flags]) => {
  RB.game.debugStart(m, x, y, { comp: 'mio', flags });
  RB.game.settings.textSpeed = 'instant';
  await new Promise((r) => setTimeout(r, 250));
  for (let i = 0; i < 40 && RB.ui.dialogue.isOpen(); i++) { RB.ui.dialogue.advance(true); await new Promise((r) => setTimeout(r, 40)); }
}, [m, x, y, flags || {}]);
const drain = () => p.evaluate(async () => { for (let i = 0; i < 60 && RB.ui.dialogue.isOpen(); i++) { RB.ui.dialogue.advance(true); await new Promise((r) => setTimeout(r, 40)); } });
const said = () => p.evaluate(() => (document.querySelector('.dlg .main') || {}).textContent || '');

// lanterns: once lit, the opening road's lantern is drawn lit
await start('rw.road', 14, 10, { rw_arrived: true });
const dark = await p.evaluate(() => RB.world.W.map.props.filter((q) => q.x === 14 && q.y === 8 && (!q.if || RB.state.test(RB.game.s, q.if))).map((q) => q.p));
await p.evaluate(() => { RB.game.s.flags.rw_road_lit = true; RB.world.refreshActors(); });
const lit = await p.evaluate(() => RB.world.W.map.props.filter((q) => q.x === 14 && q.y === 8 && (!q.if || RB.state.test(RB.game.s, q.if))).map((q) => q.p));
assert(dark.join() === 'deadlantern' && lit.join() === 'lantern', `the Ashinose lantern shows lit once lit (${dark} → ${lit})`);

// a house with no inside: its door is solid and says it is shut
await start('rw.village', 7, 30, { rw_arrived: true, rw_road_lit: true });
const door = await p.evaluate(async () => {
  const W = RB.world.W;
  Object.assign(W.player, { x: 7, y: 29, fx: 7, fy: 29, dir: 'up', mv: null });
  RB.game.s.x = 7; RB.game.s.y = 29;
  const solid = RB.world.blocked(7, 28, { except: W.player, ignorePlayer: true });
  const label = (RB.world.frontAction() || {}).label;
  RB.world.interact();
  await new Promise((r) => setTimeout(r, 200));
  return { solid, label };
});
const shutLine = await said();
await drain();
assert(door.solid && door.label === 'Look' && /shut/i.test(shutLine), `a door with no inside is solid and says it is shut ("${shutLine.slice(0, 40)}")`);

// going into Nao's warehouse (and every other building) lands on the entry mat
await start('rw.village', 29, 27, { rw_arrived: true, rw_road_lit: true });
await p.evaluate(async () => { await RB.game.transition('rw.warehouse', 5, 7, 'up'); });
await p.waitForTimeout(400);
const onMat = await p.evaluate(() => { const W = RB.world.W, mat = W.map.props.find((q) => q.p === 'exitmat'); const ex = W.map.def && RB.content.maps['rw.village'].structs.find((s) => s.to === 'rw.warehouse'); return { mat: [mat.x, mat.y].join(), spawn: ex.spawn.join() }; });
assert(onMat.mat === onMat.spawn, `the warehouse door spawns on its mat (${onMat.spawn} = ${onMat.mat})`);

// someone leaving walks to a way out and fades; nobody vanishes on the spot
await start('rw.warehouse', 5, 7, { rw_arrived: true, rw_road_lit: true });
await p.waitForTimeout(1200);
const leaving = await p.evaluate(async () => {
  const W = RB.world.W;
  const had = W.npcs.some((n) => n.id === 'nao');
  RB.game.s.flags.rw_letters_done = true;
  RB.world.refreshActors();
  const l = W.leavers.find((n) => n.id === 'nao');
  const r = { had, gone: !W.npcs.some((n) => n.id === 'nao'), walking: !!l, steps: l ? l.route.length : 0, from: l ? [l.x, l.y].join() : null };
  const t0 = performance.now();
  while (W.leavers.length && performance.now() - t0 < 9000) await new Promise((res) => setTimeout(res, 100));
  r.done = !W.leavers.length; r.ms = Math.round(performance.now() - t0);
  return r;
});
assert(leaving.had && leaving.gone && leaving.walking && leaving.steps > 0 && leaving.done, `Nao walks out (${leaving.steps} steps from ${leaving.from}) and is gone after ${leaving.ms} ms`);
// ... and someone arriving walks in from the door
const arriving = await p.evaluate(async () => {
  const W = RB.world.W;
  delete RB.game.s.flags.rw_letters_done;
  RB.world.refreshActors();
  const n = W.npcs.find((q) => q.id === 'nao');
  const r = { routed: !!(n && n.route && n.route.length), from: n ? [n.x, n.y].join() : null };
  const t0 = performance.now();
  while (n && (n.route || n.mv) && performance.now() - t0 < 9000) await new Promise((res) => setTimeout(res, 100));
  r.at = n ? [n.x, n.y].join() : null;
  return r;
});
assert(arriving.routed && arriving.at === '5,4', `Nao walks in from ${arriving.from} to his place (${arriving.at})`);

// the Lantern Hall: the four are there when they speak
await start('rw.village', 21, 10, { rw_arrived: true, rw_road_lit: true, rw_mill_open: true, rw_echo_done: true, rw_koji_back: true, rw_night: true, rw_evening: true });
await p.evaluate(() => { window.__heard = []; const say = RB.ui.dialogue.say; RB.ui.dialogue.__say = say; });
await p.evaluate(async () => { RB.test.enable({ auto: 'correct' }); RB.test.absentSpeakers = []; await RB.game.transition('rw.hall', 5, 8, 'up'); });
await p.waitForTimeout(600);
await drain();
const hall = await p.evaluate(() => ({ absent: (RB.test.absentSpeakers || []).map((x) => x.who), present: RB.world.W.npcs.map((n) => n.id).sort().join() }));
await p.evaluate(() => RB.test.disable());
assert(!hall.absent.length && /nao/.test(hall.present), `Lantern Hall: nobody speaks without being there (${hall.absent.join() || 'none'}; present ${hall.present})`);

// Reedwake's night: the roads out wait for morning, with a reason
await start('rw.village', 2, 30, { rw_arrived: true, rw_road_lit: true, rw_mill_open: true, rw_echo_done: true, rw_night: true, rw_evening: true });
const held = await p.evaluate(async () => {
  const W = RB.world.W;
  Object.assign(W.player, { x: 1, y: 30, fx: 1, fy: 30, dir: 'left', mv: null });
  RB.game.s.x = 1; RB.game.s.y = 30;
  RB.world._tryMove('left');
  const t0 = performance.now();
  while (performance.now() - t0 < 1500 && !RB.ui.dialogue.isOpen()) await new Promise((r) => setTimeout(r, 30));
  return { map: W.map.id, x: W.player.x, open: RB.ui.dialogue.isOpen() };
});
const holdLine = await said();
await drain();
assert(held.map === 'rw.village' && held.x === 1 && held.open && /Lantern Hall/.test(holdLine), `at night the road out holds you in Reedwake ("${holdLine.slice(0, 50)}")`);

// idle life: with the world held still (no update between frames), drawing
// two moments differs (breathing, swaying crowns); with reduced motion it doesn't
await start('rw.village', 22, 18, { rw_arrived: true, rw_road_lit: true });
const still = await p.evaluate(async () => {
  const cv = document.getElementById('world');
  const at = (t) => { RB.render.frame(t); return cv.toDataURL(); };
  const moments = [1000, 1700, 2300, 3100, 4200];
  const live = new Set(moments.map(at)).size;
  RB.game.settings.reducedMotion = true; RB.game.applySettings();
  const calm = new Set(moments.map(at)).size;
  RB.game.settings.reducedMotion = false; RB.game.applySettings();
  return { live, calm };
});
assert(still.live > 1, `people breathe and trees sway while nothing else happens (${still.live} distinct of 5 moments)`);
assert(still.calm === 1, `with reduced motion they hold still (${still.calm} distinct of 5 moments)`);

// the chart agrees with the roads: Saltglass lies west of Reedwake
const chart = await p.evaluate(() => ({ rw: RB.content.places.reedwake.pos, sg: RB.content.places.saltglass.pos }));
assert(chart.sg[0] < chart.rw[0], `route chart: Saltglass (${chart.sg}) is west of Reedwake (${chart.rw})`);

// chapter cards: a banner at the top that slides in from the left and out to
// the right, not a page over the whole screen; the place name waits for it
const banner = await p.evaluate(async () => {
  document.querySelectorAll('.place').forEach((e) => e.remove()); // a label left from the previous map
  const done = RB.ui.card('{第二章|だいにしょう} ・ {潮硝子|しおがらす}', 'Chapter 2 — Saltglass');
  RB.ui.placeName({ jp: '{海沿|うみぞ}い の {道|みち}', en: 'The Coast Road' });
  const b = document.querySelector('.banner');
  const x0 = new DOMMatrix(getComputedStyle(b).transform).m41;
  await new Promise((r) => setTimeout(r, 900));
  const r = b.getBoundingClientRect(), layerBg = getComputedStyle(document.querySelector('.banner-layer')).backgroundColor;
  const mid = { top: r.top, h: r.height, w: r.width, x: new DOMMatrix(getComputedStyle(b).transform).m41, placeEarly: !!document.querySelector('.place'), bg: layerBg };
  document.querySelector('.banner-layer').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
  await new Promise((r) => setTimeout(r, 120));
  const x2 = new DOMMatrix(getComputedStyle(b).transform).m41;
  await done;
  await new Promise((r) => setTimeout(r, 400));
  return { x0, mid, x2, placeAfter: !!document.querySelector('.place'), gone: !document.querySelector('.banner') };
});
assert(banner.mid.top < innerHeightOf(800) * 0.2 && banner.mid.h < 800 * 0.25 && banner.mid.w < 1280 * 0.8 && /rgba\(0, 0, 0, 0\)|transparent/.test(banner.mid.bg), `chapter banner sits at the top without covering the view (top ${Math.round(banner.mid.top)}, ${Math.round(banner.mid.w)}×${Math.round(banner.mid.h)})`);
assert(banner.x0 < banner.mid.x && banner.x2 > banner.mid.x, `it slides in from the left and out to the right (x ${Math.round(banner.x0)} → ${Math.round(banner.mid.x)} → ${Math.round(banner.x2)})`);
assert(!banner.mid.placeEarly && banner.placeAfter && banner.gone, 'the place name waits for the banner, then shows');

// play time counts talking (and writing, battles, menus), not just walking
await start('rw.village', 22, 18, { rw_arrived: true, rw_road_lit: true });
await p.mouse.move(200, 200); await p.mouse.move(210, 205);
const pt = await p.evaluate(async () => {
  const t0 = RB.game.s.playtime;
  RB.script.runInline([{ who: 'narr', jp: 'しずか だ 。', en: 'It is quiet.' }]);
  await new Promise((r) => setTimeout(r, 2500));
  const inDialogue = RB.ui.dialogue.isOpen();
  RB.ui.dialogue.advance(true);
  return { inDialogue, gained: RB.game.s.playtime - t0 };
});
assert(pt.inDialogue && pt.gained > 1.8, `play time runs during dialogue (+${pt.gained.toFixed(1)} s in 2.5 s)`);

assert(!errors.length, 'no page errors ' + errors.join('; '));
await b.close(); srv.close();
console.log(fail ? fail + ' failed' : 'all ok');
process.exit(fail ? 1 : 0);
