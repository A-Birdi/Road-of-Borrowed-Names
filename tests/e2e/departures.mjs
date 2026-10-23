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
//   village; the conversation that follows is still there;
// - one person, one figure: in the bridge scene after the Mill, Tsuru is
//   there once for every line and walks to the Hall at nightfall; a person
//   whose place on the map changes walks there (no second figure); someone
//   who walked in to speak and whose place here a scene began (Jinpachi when
//   the Cloudroad is done) walks from where they spoke to that place; and when
//   the valley's letter ends that place, he runs up to you with it and then
//   goes on down the road by his own way out (RBN-QA-108).
// Usage: node tests/e2e/departures.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let fail = 0;
const assert = (c, m) => { if (!c) { fail++; console.log('FAIL ' + m); } else console.log('ok   ' + m); };
let { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });

const ALL = { rw_arrived: true, rw_road_lit: true, rw_met_tsuru: true, rw_met_ren: true, rw_letters_done: true, rw_bottles_done: true, rw_lanterns_done: true, rw_suzu_told: true, rw_hana_cups: true };
async function start(map, x, y, flags, dir, comp) {
  await p.evaluate(async ([map, x, y, flags, dir, comp]) => {
    // the journey takes the edition a new one has in this build (it is saved and loaded below; a six-chapter save
    // would be offered New Game+ instead, as tests/e2e/old_saves.mjs checks)
    const s = RB.game.debugStart(map, x, y, Object.assign({ dir: dir || 'up', flags, edition: RB.edition.forNew() }, comp ? { comp } : {}));
    RB.game.settings.textSpeed = 'instant';
    s.quests.rw_labels = { stage: 1, done: false, t: Date.now() };
    { const W = RB.world.W, t0 = performance.now(); while (W.time - W.enteredAt < 1100 && performance.now() - t0 < 30000) await new Promise((r) => setTimeout(r, 50)); } // past the map's settling-in moment (game time: a big map's first frame, which builds its light, or a loaded machine, puts it behind the clock)
  }, [map, x, y, flags, dir, comp]);
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

// ---- 5. one person, one figure: the bridge scene after the Mill (player report, 2026-09-29) ----
// Tsuru speaks after Kōji and Hana go in; she must be there once (never a second Tsuru walking
// in while the first walks off), and at nightfall she walks to the Lantern Hall.
const AFTER = Object.assign({}, ALL, { rw_mill_open: true, rw_echo_done: true, bridge_fixed: true });
// a fresh page: nothing left running from the sections above
({ p } = await page(b, url, { viewport: { width: 1280, height: 800 } }));
await start('rw.village', 31, 17, AFTER, 'right');
const bridge = await p.evaluate(async () => {
  const W = RB.world.W, seen = { most: 0, spoke: [], at: [] };
  const who = (a) => (a.def && (a.def.char || a.def.id)) || a.id;
  let done = false;
  RB.script.run('rw.bridge_scene').then(() => { done = true; });
  for (let i = 0; i < 1200 && !done; i++) {
    const figs = W.npcs.concat(W.extras, W.leavers).filter((a) => who(a) === 'tsuru');
    seen.most = Math.max(seen.most, figs.length);
    if (i % 20 === 0) (seen.log = seen.log || []).push('[' + RB.game.mode() + ' dlg=' + RB.ui.dialogue.isOpen() + ' ' + ((document.querySelector('.dlg:not(.hidden) .main') || {}).textContent || '').slice(0, 30) + ']');
    if (RB.ui.dialogue.isOpen()) {
      const d = document.querySelector('.dlg .who .nm');
      if (d && /Tsuru/.test(d.textContent)) { seen.spoke.push(figs.length); seen.at.push(figs.map((a) => a.x + ',' + a.y).join('|')); }
      RB.ui.dialogue.advance(true);
    }
    const nx = document.querySelector('[data-a=next][data-ok]'); if (nx) nx.click();
    const skip = [...document.querySelectorAll('.chal button')].find((x) => /skip practice/i.test(x.textContent)); if (skip) skip.click();
    await new Promise((r) => setTimeout(r, 50));
  }
  // after nightfall: she heads for the Hall
  const deps = W.departures.filter((d) => d.id === 'tsuru');
  await new Promise((r) => setTimeout(r, 400));
  return { most: seen.most, spoke: seen.spoke, at: [...new Set(seen.at)], deps, done, evening: !!RB.game.s.flags.rw_evening, log: [...new Set(seen.log || [])].slice(0, 12) };
});
assert(bridge.done && bridge.evening, 'the bridge scene played to nightfall' + (bridge.done ? '' : ' ' + JSON.stringify(bridge.log)));
assert(bridge.most === 1, 'Tsuru is never on screen twice during the bridge scene (most at once: ' + bridge.most + ')');
assert(bridge.spoke.length >= 3 && bridge.spoke.every((n) => n === 1), 'every line Tsuru says, she is there — once (' + JSON.stringify(bridge.spoke) + ' at ' + bridge.at.join(' / ') + ')');
const toHall = bridge.deps.find((d) => !d.arriving && d.to === 'rw.hall');
assert(toHall && toHall.exit === '21,8', 'at nightfall she walks to the Lantern Hall door (' + JSON.stringify(bridge.deps) + ')');
// the audit test runs use: nobody drawn twice
const twice = await p.evaluate(() => { RB.test.auto = true; RB.world.update && RB.world.update(16); const t = RB.test.twice || []; RB.test.auto = false; return t; });
assert(!twice.length, 'no one drawn twice in the village (' + twice.join(', ') + ')');

// ---- 6. the same person moving to a new place on this map walks there (no second figure) ----
await start('rw.village', 22, 16, ALL, 'up');
const shift = await p.evaluate(async () => {
  const W = RB.world.W;
  // Tsuru stops being the square's Tsuru and becomes the evening Tsuru at 27,17, on this map
  const t = W.npcs.find((n) => n.id === 'tsuru');
  const from = t && [t.x, t.y];
  Object.assign(RB.game.s.flags, { rw_echo_done: true, rw_mill_open: true });
  RB.world.refreshActors();
  const figs = () => W.npcs.concat(W.extras, W.leavers).filter((a) => ((a.def && (a.def.char || a.def.id)) || a.id) === 'tsuru');
  const n0 = figs().length, start = figs().map((a) => a.x + ',' + a.y);
  let most = n0;
  for (let i = 0; i < 160; i++) { most = Math.max(most, figs().length); if (!figs()[0].route && !figs()[0].mv) break; await new Promise((r) => setTimeout(r, 50)); }
  const end = figs().map((a) => a.id + '@' + a.x + ',' + a.y + ' a' + (figs()[0].alpha));
  return { from, n0, start, most, end, dep: W.departures.filter((d) => d.id === 'tsuru').pop() };
});
assert(shift.most === 1 && shift.start[0] === shift.from.join(',') && /^tsuru_out@27,17 a1$/.test(shift.end[0]), 'one Tsuru walks from her old place (' + shift.from + ') to her new one, fully visible (' + JSON.stringify(shift) + ')');

// ---- 7. one figure from speaking to its place: the Cloudroad's last post delivered (twelve-chapter edition) ----
// Heisuke reads the letter at his door in Sakashita, the chapter ends, and Jinpachi brings Mio Kikue's message: he
// walks in to speak, and since the chapter's end his place is this station's (5,14). At the scene's end that same
// figure sets out for it (it used to vanish beside you while a second Jinpachi walked in from the road), and Heisuke,
// whose place is now Sono's inn until the coins are decided, walks off to the inn's door (no longer at his door too).
// Then the valley's letter (yn.call), played through: his place ends with it, so he runs up to you with it (the approach:
// _walked 1, every line of his within 2 of you), and at its end goes on down the road by his own way out, the station's
// west exit to the leg below (the departure: a record naming cr.leg2, not a fallback), and is gone; one Jinpachi
// throughout (RBN-QA-108; Agnes 6372889134, Local CL-240, Cloud CC-149 §4).
const CR = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_done: true,
  cr_called: true, cr_kanbe_met: true, cr_passed: true, cr_courier_done: true, cr_message_taken: true };
for (let n = 1; n <= 7; n++) Object.assign(CR, { ['cr_st' + n]: true, ['cr_lamp' + n]: true }, n <= 5 ? { ['cr_given' + n]: true, ['cr_plan' + n]: true } : {});
({ p } = await page(b, url, { viewport: { width: 1280, height: 800 } }));
await start('cr.sakashita', 18, 12, CR, 'up', 'mio');
const relay = await p.evaluate(async () => {
  const W = RB.world.W, s = RB.game.s, seen = { most: 0, near: null, lines: [] };
  const who = (a) => (a.def && (a.def.char || a.def.id)) || a.id;
  const figs = () => W.npcs.concat(W.extras, W.leavers).filter((a) => who(a) === 'cr_jinpachi');
  s.inv.cr_message = 1; s.quests.cr_main = { stage: 8, done: false, t: Date.now() };
  let done = false;
  RB.script.run('cr.deliver').then(() => { done = true; });
  // the post, the chapter's end, Mio Kikue's message, then the valley's letter, each played to its end
  for (let i = 0; i < 2400 && !(done && s.flags.yn_called && !RB.script.isRunning() && !RB.ui.dialogue.isOpen()); i++) {
    const f = figs();
    seen.most = Math.max(seen.most, f.length);
    if (RB.ui.dialogue.isOpen()) {
      const d = document.querySelector('.dlg .who .nm');
      if (d && /Jinpachi/.test(d.textContent) && f.length) {
        seen.near = f.map((a) => a.x + ',' + a.y).join('|');
        if (s.flags.yn_called) seen.lines.push({ jin: [f[0].x, f[0].y], pc: [W.player.x, W.player.y] });
      }
      RB.ui.dialogue.advance(true);
    }
    const c = document.querySelector('.choices:not(.hidden) .choice'); if (c) c.click();
    await new Promise((r) => setTimeout(r, 40));
  }
  // and then he goes (the world's own walk, after the scene: at most 20 s)
  const after = [];
  for (let i = 0; i < 400; i++) {
    const f = figs();
    seen.most = Math.max(seen.most, f.length);
    after.push(f.map((a) => a.x + ',' + a.y + (a.alpha < 1 ? '~' : '')).join('|'));
    if (!f.length && !W.leavers.some((a) => who(a) === 'cr_heisuke')) break;
    await new Promise((r) => setTimeout(r, 50));
  }
  const trail = after.filter((q, i, A) => q && (!i || q !== A[i - 1]));
  return { done, flags: { cr_done: !!s.flags.cr_done, kikue: !!s.flags.cr_mio_kikue, called: !!s.flags.yn_called, letter: !!(s.inv && s.inv.yn_letter) }, walked: s.vars._walked, most: seen.most, near: seen.near,
    lines: seen.lines, trail: trail.slice(0, 2).concat(trail.slice(-2)), left: figs().length,
    jdep: W.departures.filter((d) => d.id === 'cr_jinpachi').map((d) => ({ arriving: d.arriving, reason: d.reason, to: d.to, exit: d.exit, fallback: d.fallback || null })),
    heisuke: W.npcs.filter((a) => who(a) === 'cr_heisuke').length, hdep: W.departures.filter((d) => d.id === 'cr_heisuke').map((d) => ({ to: d.to, exit: d.exit, arriving: d.arriving })) };
});
assert(relay.done && relay.flags.cr_done && relay.flags.kikue, 'the last post delivered, the chapter ended and Jinpachi brought Mio Kikue\'s message (' + JSON.stringify(relay.flags) + ')');
const rd = relay.jdep, shifted = rd.findIndex((d) => /new place here/.test(d.reason)), gone = rd.filter((d) => !d.arriving && !/new place here/.test(d.reason));
// (his place at (5,14) passes to the figure that spoke, which sets out for it; the letter, which starts at once, ends it)
assert(rd.filter((d) => d.arriving).length === 1 && shifted >= 0 && rd[shifted].exit === '5,14', 'he walks in once, to speak, and from there sets out for his place at (5,14): never in again from the road (' + JSON.stringify(rd) + ')');
const cheb = (l) => Math.max(Math.abs(l.jin[0] - l.pc[0]), Math.abs(l.jin[1] - l.pc[1]));
assert(relay.flags.called && relay.flags.letter && relay.walked === 1 && relay.lines.length >= 3 && relay.lines.every((l) => cheb(l) <= 2), 'the valley\'s letter: he runs up to you with it, every line of his within 2 of you, _walked 1 (' + JSON.stringify({ walked: relay.walked, lines: relay.lines.map((l) => l.jin.join(',') + '/' + l.pc.join(',')) }) + ')');
assert(gone.length === 1 && rd.indexOf(gone[0]) > shifted && gone[0].to === 'cr.leg2' && gone[0].reason === 'authored' && !gone[0].fallback && /^0,\d+$/.test(gone[0].exit || '') && relay.left === 0,
  'then he goes on down the road by his own way out: the west exit to the leg below, not a fallback, and is gone (' + JSON.stringify({ gone, trail: relay.trail, left: relay.left }) + ')');
assert(relay.most === 1, 'one Jinpachi throughout, from the post to his going (' + relay.most + ' at most)');
assert(relay.heisuke === 0 && relay.hdep.some((d) => !d.arriving && d.to === 'cr.saka_inn'), 'Heisuke goes to Sono\'s inn and is no longer at his door (' + JSON.stringify(relay.hdep) + ')');

assert(!errors.length, 'no page errors ' + errors.slice(0, 3).join(' | '));
await b.close(); srv.close();
console.log(fail ? fail + ' FAILED' : 'all ok');
process.exit(fail ? 1 : 0);
