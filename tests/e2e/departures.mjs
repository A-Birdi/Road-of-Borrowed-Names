// People leave for where they are going (player report of 2026-09-28,
// second round), in the real game from a fresh campaign:
// - the original sequence: everyone in Reedwake has been talked to, the
//   player tells Tsuru (the real conversation, by pressing Z at her), she opens
//   the north road — Nao, Ren and Suzu head for the north road to the mill
//   (where the story puts them next), not for the nearest door, although
//   doors are much closer to them; they walk on open ground, one after
//   another, and fade at the road;
// - a different destination: after the mill, the same people go to the
//   Lantern Hall through its door; Hana goes back into her tea house;
// - somebody in the way is walked round;
// - changing maps mid-walk and saving/loading leave nobody doubled or
//   stranded: the four are on the mill road exactly once, and gone from the
//   village; the conversation that follows is still there.
// Usage: node tests/e2e/departures.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let fail = 0;
const assert = (c, m) => { if (!c) { fail++; console.log('FAIL ' + m); } else console.log('ok   ' + m); };
const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });

const ALL = { rw_arrived: true, rw_road_lit: true, rw_met_tsuru: true, rw_met_ren: true, rw_letters_done: true, rw_bottles_done: true, rw_lanterns_done: true, rw_suzu_told: true, rw_hana_cups: true };
async function start(map, x, y, flags, dir) {
  await p.evaluate(async ([map, x, y, flags, dir]) => {
    const s = RB.game.debugStart(map, x, y, { dir: dir || 'up', flags });
    RB.game.settings.textSpeed = 'instant';
    s.quests.rw_labels = { stage: 1, done: false, t: Date.now() };
    await new Promise((r) => setTimeout(r, 1200)); // past the map's settling-in moment
  }, [map, x, y, flags, dir]);
}
async function drain() {
  await p.evaluate(async () => {
    for (let i = 0; i < 400; i++) {
      if (RB.ui.dialogue.isOpen()) RB.ui.dialogue.advance(true);
      const c = document.querySelector('.choices:not(.hidden) .choice'); if (c) c.click();
      // the kana lesson at the end of Tsuru's report: page through it, then skip the practice
      const nx = document.querySelector('[data-a=next][data-ok]'); if (nx) nx.click();
      const skip = [...document.querySelectorAll('.chal button')].find((x) => /skip practice/i.test(x.textContent)); if (skip) skip.click();
      await new Promise((r) => setTimeout(r, 40));
      if (!RB.ui.dialogue.isOpen() && RB.game.mode() === 'world' && !document.querySelector('.choices:not(.hidden), .lsheet, .chal')) break;
    }
  });
}
// the way out nearest to a tile, by walking distance, and the one the person took
const nearestWay = (x, y) => p.evaluate(([x, y]) => {
  const W = RB.world.W, st = RB.game.s, goals = new Set();
  for (const e of W.map.exits) if (!e.if || RB.state.test(st, e.if)) for (let j = e.y; j < e.y + e.h; j++) for (let i = e.x; i < e.x + e.w; i++) goals.add(i + ',' + j);
  for (const d of W.map.shut || []) goals.add(d.x + ',' + d.y);
  const seen = new Map([[x + ',' + y, 0]]); let q = [[x, y]];
  for (let d = 0; d < 200 && q.length; d++) {
    const n = [];
    for (const [cx, cy] of q) {
      if (goals.has(cx + ',' + cy) && d > 0) return { at: cx + ',' + cy, d };
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = cx + dx, ny = cy + dy, k = nx + ',' + ny; if (seen.has(k) || nx < 0 || ny < 0 || nx >= W.map.w || ny >= W.map.h) continue; if (!goals.has(k) && RB.maps.blockedStatic(W.map, nx, ny)) continue; seen.set(k, d + 1); n.push([nx, ny]); }
    }
    q = n;
  }
  return null;
}, [x, y]);

// ---- 1. the original sequence: Tsuru opens the north road ------------------------
await start('rw.village', 21, 16, ALL, 'up');
const here = await p.evaluate(() => RB.world.W.npcs.map((n) => n.id + '@' + n.x + ',' + n.y).join(' '));
assert(/nao@/.test(here) && /ren@/.test(here) && /suzu@/.test(here), 'Nao, Ren and Suzu are in the square before: ' + here);
const near = {};
for (const id of ['nao', 'ren', 'suzu']) { const n = await p.evaluate((id) => { const a = RB.world.W.npcs.find((q) => q.id === id); return [a.x, a.y]; }, id); near[id] = await nearestWay(n[0], n[1]); }
// talk to Tsuru for real: face her and press Z; her report opens the north road
await p.keyboard.press('ArrowUp'); await p.waitForTimeout(80);
await p.keyboard.press('z');
await p.waitForFunction(() => RB.ui.dialogue.isOpen(), null, { timeout: 8000 });
await drain();
const opened = await p.evaluate(() => RB.game.s.flags.rw_mill_open === true);
assert(opened, 'talking to Tsuru opened the north road (rw_mill_open)');
await p.waitForTimeout(300);
const deps = await p.evaluate(() => RB.world.W.departures.filter((d) => !d.arriving && d.map === 'rw.village'));
const by = Object.fromEntries(deps.map((d) => [d.id, d]));
for (const id of ['nao', 'ren', 'suzu']) {
  const d = by[id];
  assert(d && d.to === 'rw.millroad' && d.reason === 'destination' && /^2[23],0$/.test(d.exit || ''), id + ' heads for the north road to the mill (' + JSON.stringify(d) + ')');
}
const wrongCloser = ['nao', 'ren', 'suzu'].filter((id) => near[id] && !/^2[23],0$/.test(near[id].at));
assert(wrongCloser.length >= 2, 'for ' + wrongCloser.join(', ') + ' a different way out was nearer (' + wrongCloser.map((id) => near[id].at + ' at ' + near[id].d + ' steps').join('; ') + ') — and was not taken');
// they walk it: every step onto open ground, one after another, fading at the road
const walk = await p.evaluate(async () => {
  const W = RB.world.W, seen = {}, bad = [];
  const t0 = performance.now();
  while (W.leavers.length && performance.now() - t0 < 20000) {
    for (const a of W.leavers) {
      const k = a.x + ',' + a.y;
      (seen[a.id] = seen[a.id] || []);
      if (seen[a.id][seen[a.id].length - 1] !== k) seen[a.id].push(k);
      if (RB.maps.blockedStatic(W.map, a.x, a.y) && !RB.maps.exitAt(W.map, a.x, a.y)) bad.push(a.id + '@' + k);
    }
    await new Promise((r) => setTimeout(r, 50));
  }
  return { seen, bad, left: W.leavers.length, ms: Math.round(performance.now() - t0) };
});
const lastYs = Object.fromEntries(Object.entries(walk.seen).map(([id, path]) => [id, path[path.length - 1]]));
assert(!walk.bad.length && !walk.left, 'they walked only on open ground and are gone (' + walk.ms + ' ms; ends ' + JSON.stringify(lastYs) + ')');
const starts = await p.evaluate(() => RB.world.W.departures.filter((d) => !d.arriving).map((d) => d.id));
assert(starts.length >= 3, 'three set off (' + starts.join(', ') + ')');

// ---- 2. map change and save/load: nobody doubled, nothing stranded ----------------------
await p.evaluate(async () => { await RB.save.writeSlot(5, RB.game.s); });
const onRoad = await p.evaluate(async () => {
  await RB.game.transition('rw.millroad', 10, 22, 'up', {});
  await new Promise((r) => setTimeout(r, 800));
  const ids = RB.world.W.npcs.map((n) => n.id);
  return { ids, leavers: RB.world.W.leavers.length };
});
const count = (ids, id) => ids.filter((x) => x === id).length;
assert(['nao', 'ren', 'suzu', 'mio'].every((id) => count(onRoad.ids, id) === 1) && !onRoad.leavers, 'on the mill road the four are there exactly once, nobody still walking (' + onRoad.ids.join(',') + ')');
const back = await p.evaluate(async () => {
  await RB.game.loadCampaign(5);
  await new Promise((r) => setTimeout(r, 1200));
  return { map: RB.world.W.map.id, ids: RB.world.W.npcs.map((n) => n.id), leavers: RB.world.W.leavers.length, talk: (RB.world.W.npcs.find((n) => n.id === 'tsuru') || {}).id };
});
assert(back.map === 'rw.village' && !['nao', 'ren', 'suzu'].some((id) => back.ids.includes(id)) && !back.leavers && back.talk === 'tsuru', 'after loading the save: back in the village, the three are not here twice or stuck walking, Tsuru is still there to talk to (' + back.ids.join(',') + ')');

// ---- 3. a different destination: to the Lantern Hall after the mill --------------------
const EVE = Object.assign({}, ALL, { rw_mill_open: true, rw_echo_done: true });
await start('rw.village', 22, 12, EVE, 'up');
await p.evaluate(() => { RB.game.s.flags.rw_hall_gather = true; RB.world.refreshActors(); });
await p.waitForTimeout(200);
const hall = await p.evaluate(() => RB.world.W.departures.filter((d) => !d.arriving && d.map === 'rw.village'));
const hallIds = hall.filter((d) => d.to === 'rw.hall' && d.exit === '21,8').map((d) => d.id);
assert(['nao', 'ren', 'suzu'].every((id) => hallIds.includes(id)), 'when the evening gathering starts they head for the Lantern Hall door (21,8): ' + JSON.stringify(hall.map((d) => d.id + '→' + d.to + ' by ' + d.exit)));
// Hana (outside with Kōji) goes back into her tea house when he is home
await p.evaluate(() => { RB.game.s.flags.rw_koji_back = true; RB.world.refreshActors(); });
await p.waitForTimeout(200);
const tea = await p.evaluate(() => RB.world.W.departures.filter((d) => d.id === 'hana').pop());
assert(tea && tea.to === 'rw.tea' && tea.exit === '30,15', 'Hana goes back into the tea house through its door (' + JSON.stringify(tea) + ')');

// ---- 4. somebody in the way is walked round ----------------------------------------------
await start('rw.village', 22, 12, EVE, 'up');
const detour = await p.evaluate(async () => {
  const W = RB.world.W, st = RB.game.s;
  st.flags.rw_hall_gather = true; RB.world.refreshActors();
  const a = W.leavers.find((q) => q.id === 'suzu');
  if (!a || !a.route || a.route.length < 3) return { skipped: true };
  // stand on a tile of Suzu's route, ahead of her
  const [bx, by] = a.route[1];
  Object.assign(W.player, { x: bx, y: by, fx: bx, fy: by, mv: null });
  const t0 = performance.now(); let stood = 0, through = false;
  while (W.leavers.includes(a) && performance.now() - t0 < 12000) {
    if (a.x === W.player.x && a.y === W.player.y) through = true;
    stood = performance.now() - t0;
    await new Promise((r) => setTimeout(r, 40));
  }
  return { through, ms: Math.round(stood) };
});
assert(detour.skipped || !detour.through, 'someone leaving steps round the player standing on their way (' + JSON.stringify(detour) + ')');

assert(!errors.length, 'no page errors ' + errors.slice(0, 3).join(' | '));
await b.close(); srv.close();
console.log(fail ? fail + ' FAILED' : 'all ok');
process.exit(fail ? 1 : 0);
