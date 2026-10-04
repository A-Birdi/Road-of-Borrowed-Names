// The world's own comings and goings step round people (the staging worker's finding of 2026-10-03):
// someone walking in to say a line, walking off, or moved by the story to a new place on the same map
// used to path straight through whoever stood in the way (the see-off in Reedwake; Sōta moving down the
// harbour through the companion). Now:
// 1. Sōta's move to his new place walks round the companion and the player standing on his old line;
// 2. people who walk in to speak never share a tile with anyone on their way (several places in the
//    square, with the companion beside you), and the case is really exercised: for some of them the
//    old, people-blind route crossed someone;
// 3. someone leaving steps round another villager who steps onto their way after they set off;
// 4. when there is no way round (you stand in the one doorway they need) they wait for you, then go
//    on anyway: nothing stalls;
// 5. two people called to speak one after the other, the first still on the way, are given places of their own
//    (2026-10-04; the Lanternfall epilogue gave both the place in front of you);
// 6. a scene's own walk of you (!move pc) brings your companion along, with staging on or off: they follow a step
//    behind, or step aside when you walk back onto them; one the scene directs is walked back to your side after it
//    (2026-10-04; sa.kasane_meet, lf.water_returns).
// In every case the walk ends where it should and only on open ground.
// Usage: node tests/e2e/walk_round.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let fail = 0;
const assert = (c, m) => { if (!c) { fail++; console.log('FAIL ' + m); } else console.log('ok   ' + m); };
const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });

async function start(map, x, y, opts) {
  await p.evaluate(async ([map, x, y, opts]) => {
    RB.game.debugStart(map, x, y, opts);
    RB.game.settings.textSpeed = 'instant';
    // past the map's settling-in moment (game time: on a loaded machine it runs behind the clock)
    const W = RB.world.W, t0 = performance.now();
    while (W.time - W.enteredAt < 1100 && performance.now() - t0 < 30000) await new Promise((r) => setTimeout(r, 50));
  }, [map, x, y, opts]);
}
// Watch one walker (found by `pick`) until it stops: every tile it stands on or steps onto, and every
// moment it shares a tile with someone else (you, the companion, anyone placed or walking here).
const WATCH = `
  async function watch(pick, ms) {
    const W = RB.world.W, t0 = performance.now(), steps = [], hits = [];
    let a = null, waited = 0, last = performance.now();
    while (performance.now() - t0 < ms) {
      a = pick();
      if (!a) break;
      const here = a.x + ',' + a.y;
      if (steps[steps.length - 1] !== here) steps.push(here);
      const tiles = [[a.x, a.y]].concat(a.mv ? [[a.mv.tx, a.mv.ty]] : []);
      for (const [x, y] of tiles) {
        const k = x + ',' + y;
        const who = RB.world.personAt(x, y, a);
        if (who && (a.alpha == null || a.alpha > 0.05)) hits.push((who.id || (who === W.player ? 'player' : 'comp')) + '@' + k + ' t' + Math.round(performance.now() - t0));
      }
      const now = performance.now();
      if (a.route && a.route.length && !a.mv) waited += now - last;
      last = now;
      if (!a.route && !a.mv && !a.fading && !W.leavers.includes(a)) break;
      await new Promise((r) => setTimeout(r, 30));
    }
    const W2 = RB.world.W;
    const bad = steps.filter((k) => { const [x, y] = k.split(',').map(Number); return RB.maps.blockedStatic(W2.map, x, y) && !RB.maps.exitAt(W2.map, x, y) && !(W2.map.shut || []).some((d) => d.x === x && d.y === y); });
    return { steps, hits, bad, gone: !pick(), end: a ? [a.x, a.y] : null, ms: Math.round(performance.now() - t0), waited: Math.round(waited) };
  }`;
const run = (body, arg) => p.evaluate(new Function('arg', WATCH + '\nreturn (async () => {' + body + '})();'), arg);

// ---- 1. Sōta moves down the harbour: round the companion and you on his old line --------------------
await start('sg.harbor', 16, 30, { comp: 'nao', dir: 'right', flags: { sg_arrived: true } });
const sota = await run(`
  const W = RB.world.W, st = RB.game.s;
  const a0 = W.npcs.find((n) => n.id === 'sota');
  if (!a0) return { skipped: 'no sota here: ' + W.npcs.map((n) => n.id).join(',') };
  const blind = RB.world.routeOut(a0.x, a0.y, 160, new Set([a0.x + 1 + ',' + (a0.y + 5)]));
  if (!blind || blind.length < 3) return { skipped: 'no old line', blind };
  // the companion on his first step, you a step further on, both on the line he used to walk
  const [cx, cy] = blind[0], [px, py] = blind[2];
  Object.assign(W.comp, { x: cx, y: cy, fx: cx, fy: cy, mv: null });
  Object.assign(W.player, { x: px, y: py, fx: px, fy: py, mv: null });
  W.trail = [];
  st.quests.sg_cove = { stage: 9, done: true, t: Date.now() };
  RB.world.refreshActors();
  const b0 = W.npcs.find((n) => n.id === 'sota2');
  const planned = b0 && b0.route ? b0.route.map((q) => q.join(',')) : [];
  const r = await watch(() => W.npcs.find((n) => n.id === 'sota2'), 30000);
  return Object.assign(r, { planned, blind: blind.map((q) => q.join(',')), comp: cx + ',' + cy, player: px + ',' + py, shifted: !!(W.npcs.find((n) => n.id === 'sota2') || {}).shifted });
`);
if (sota.skipped) assert(false, 'Sōta case set up: ' + JSON.stringify(sota));
else {
  assert(sota.blind.includes(sota.comp) && sota.blind.includes(sota.player), 'the old people-blind line crosses the companion (' + sota.comp + ') and you (' + sota.player + '): ' + sota.blind.join(' '));
  assert(sota.shifted, 'the same figure walks to his new place (no second Sōta)');
  assert(sota.planned.length && !sota.planned.includes(sota.comp) && !sota.planned.includes(sota.player), 'his way is planned round them from the start, not discovered on bumping into them (' + sota.planned.join(' ') + ')');
  assert(!sota.hits.length, 'Sōta never shares a tile with anyone on his way (' + sota.steps.join(' ') + (sota.hits.length ? '; hits ' + sota.hits.join(' ') : '') + ')');
  assert(sota.end && sota.end.join(',') === '19,33' && !sota.bad.length, 'he ends at his new place (19,33) on open ground (' + JSON.stringify(sota.end) + ', ' + sota.ms + ' ms)');
}

// ---- 2. walk-ins to speak: never through anyone; the old route would have crossed someone ------------
await start('rw.village', 21, 16, { comp: 'nao', dir: 'up', flags: { rw_arrived: true } });
const ins = await run(`
  const W = RB.world.W, out = [];
  const who = Object.keys(RB.content.chars).filter((id) => { const c = RB.content.chars[id]; return c.look && !c.bodiless && !W.npcs.some((n) => (n.def && (n.def.char || n.def.id)) === id || n.id === id) && id !== 'nao' && id !== W.comp.id; });
  const places = [[21, 16, 'up'], [18, 14, 'left'], [24, 18, 'down'], [16, 20, 'right'], [26, 13, 'up'], [12, 17, 'left']];
  for (let i = 0; i < places.length; i++) {
    const [x, y, dir] = places[i], id = who[i % who.length];
    if (RB.maps.blockedStatic(W.map, x, y)) { out.push({ id, skipped: 'blocked ' + x + ',' + y }); continue; }
    RB.world.dismissExtras(); W.leavers = []; W.extras = [];
    Object.assign(W.player, { x, y, fx: x, fy: y, mv: null, dir });
    // the companion just behind you, as when you walk
    const back = { up: [0, 1], down: [0, -1], left: [1, 0], right: [-1, 0] }[dir];
    const cx = RB.maps.blockedStatic(W.map, x + back[0], y + back[1]) ? x + 1 : x + back[0], cy = RB.maps.blockedStatic(W.map, x + back[0], y + back[1]) ? y : y + back[1];
    Object.assign(W.comp, { x: cx, y: cy, fx: cx, fy: cy, mv: null });
    W.trail = [];
    RB.world.ensureSpeaker(id, 'walk_round');
    const a = W.extras.find((n) => n.id === id);
    if (!a || !a.route || !a.route.length) { out.push({ id, at: x + ',' + y, skipped: 'appeared in place' }); continue; }
    const spot = a.route[a.route.length - 1], startAt = [a.x, a.y];
    const dep = W.departures.filter((d) => d.id === id && d.arriving).pop();
    const blind = dep && dep.exit ? RB.world.routeOut(spot[0], spot[1], 160, new Set([dep.exit])) : null;
    const taken = (bx, by) => (bx === W.player.x && by === W.player.y) || (bx === W.comp.x && by === W.comp.y) || W.npcs.some((n) => n.x === bx && n.y === by);
    const crossed = !!blind && blind.slice(0, -1).some(([bx, by]) => taken(bx, by));
    const plannedClear = !a.route.some(([bx, by]) => taken(bx, by));
    const r = await watch(() => W.extras.find((n) => n.id === id), 30000);
    out.push(Object.assign({ id, at: x + ',' + y, from: startAt.join(','), spot: spot.join(','), crossed, plannedClear }, r));
  }
  return out;
`);
const walked = ins.filter((r) => !r.skipped);
assert(walked.length >= 4, 'at least four walk-ins were watched (' + ins.map((r) => r.id + (r.skipped ? ' skipped: ' + r.skipped : '')).join('; ') + ')');
assert(walked.some((r) => r.crossed), 'the case is exercised: for ' + walked.filter((r) => r.crossed).map((r) => r.id + ' at ' + r.at).join(', ') + ' the old people-blind route crossed someone');
assert(walked.every((r) => r.plannedClear), 'every walk-in is planned round the people standing there from the start (' + walked.filter((r) => !r.plannedClear).map((r) => r.id).join(', ') + ')');
for (const r of walked) assert(!r.hits.length && !r.bad.length && r.end && r.end.join(',') === r.spot, r.id + ' walks in (' + r.from + ' → ' + r.spot + ', you at ' + r.at + ') without passing through anyone, on open ground' + (r.hits.length ? ': hits ' + r.hits.join(' ') : '') + (r.bad.length ? ': off ground ' + r.bad.join(' ') : ''));

// ---- 3. someone leaving steps round a villager who steps onto their way ------------------------------
const EVE = { rw_arrived: true, rw_road_lit: true, rw_met_tsuru: true, rw_met_ren: true, rw_letters_done: true, rw_bottles_done: true, rw_lanterns_done: true, rw_suzu_told: true, rw_hana_cups: true, rw_mill_open: true, rw_echo_done: true };
await start('rw.village', 22, 12, { dir: 'up', flags: EVE });
const leaving = await run(`
  const W = RB.world.W, st = RB.game.s;
  st.flags.rw_hall_gather = true; RB.world.refreshActors();
  const a = W.leavers.find((q) => q.id === 'suzu');
  if (!a || !a.route || a.route.length < 4) return { skipped: true, route: a && a.route };
  // someone who stays (not leaving) steps onto her way, two tiles ahead
  const other = W.npcs.find((n) => !n.route && !n.mv);
  if (!other) return { skipped: 'nobody to step in' };
  const [ox, oy] = a.route[1];
  Object.assign(other, { x: ox, y: oy, fx: ox, fy: oy, mv: null });
  const r = await watch(() => W.leavers.includes(a) ? a : null, 40000);
  return Object.assign(r, { other: other.id + '@' + ox + ',' + oy });
`);
if (leaving.skipped) assert(false, 'leaving case set up: ' + JSON.stringify(leaving));
else assert(!leaving.hits.length && leaving.gone && !leaving.bad.length, 'Suzu, leaving for the Hall, steps round ' + leaving.other + ' and is gone (' + leaving.steps.join(' ') + (leaving.hits.length ? '; hits ' + leaving.hits.join(' ') : '') + ', ' + leaving.ms + ' ms)');

// ---- 4. no way round: they wait for you, then go on (nothing stalls) ---------------------------------
await start('rw.village', 22, 12, { dir: 'up', flags: EVE });
const door = await run(`
  const W = RB.world.W, st = RB.game.s;
  // Hana goes back into her tea house through its one door (30,15): stand in that doorway
  st.flags.rw_koji_back = true;
  Object.assign(W.player, { x: 30, y: 15, fx: 30, fy: 15, mv: null, dir: 'down' });
  RB.world.refreshActors();
  const a = W.leavers.find((q) => ((q.def && (q.def.char || q.def.id)) || q.id) === 'hana');
  if (!a) return { skipped: 'Hana did not set off: ' + JSON.stringify(W.departures.slice(-3)) };
  const r = await watch(() => W.leavers.includes(a) ? a : null, 40000);
  return Object.assign(r, { exit: (W.departures.filter((d) => d.id === 'hana').pop() || {}).exit });
`);
if (door.skipped) assert(false, 'doorway case set up: ' + JSON.stringify(door));
else {
  const firstHit = door.hits.length ? +door.hits[0].split(' t')[1] : null;
  assert(door.gone && door.exit === '30,15', 'Hana still goes in through the door you stand in (' + door.ms + ' ms, exit ' + door.exit + ')');
  assert(door.waited >= 1500 && (firstHit == null || firstHit >= 1500), 'she waits for you first (' + door.waited + ' ms waiting; first shared tile at ' + firstHit + ' ms)');
}

// ---- 5. two speakers called while the first is still walking in get places of their own (2026-10-04) ----------
// (the place in front of you was given to both — the first still on the way — and the later one, arriving first,
// stood on it, so the first had no way round and went on through them after waiting: sa.epi_lf in Lanternfall)
await start('rw.village', 21, 16, { comp: 'nao', dir: 'up', flags: { rw_arrived: true } });
const two = await run(`
  const W = RB.world.W;
  const who = Object.keys(RB.content.chars).filter((id) => { const c = RB.content.chars[id]; return c.look && !c.bodiless && !W.npcs.some((n) => (n.def && (n.def.char || n.def.id)) === id || n.id === id) && id !== 'nao' && id !== W.comp.id; });
  const out = [];
  for (const id of who) {
    if (out.length >= 2) break;
    RB.world.ensureSpeaker(id, 'walk_round');
    const a = W.extras.find((n) => n.id === id);
    if (!a) continue;
    // (the first must still be on the way when the second is called; one who appeared in place is let go)
    if (!out.length && (!a.route || a.route.length < 3)) { W.extras = W.extras.filter((n) => n !== a); continue; }
    out.push({ id, spot: (a.route && a.route.length ? a.route[a.route.length - 1] : [a.x, a.y]).join(','), walking: !!(a.route && a.route.length) });
  }
  if (out.length < 2) return { skipped: 'two walk-ins not found: ' + JSON.stringify(out) };
  // (both watched at once, from the moment the second is called)
  const rs = await Promise.all(out.map((o) => watch(() => W.extras.find((n) => n.id === o.id), 30000)));
  return { out, rs };
`);
if (two.skipped) assert(false, 'two walk-ins set up: ' + two.skipped);
else {
  assert(two.out[0].walking && two.out[0].spot !== two.out[1].spot, 'the second speaker (' + two.out[1].id + ' → ' + two.out[1].spot + ') is not given the place the first is still walking to (' + two.out[0].id + ' → ' + two.out[0].spot + ')');
  for (let i = 0; i < 2; i++) assert(!two.rs[i].hits.length && two.rs[i].end && two.rs[i].end.join(',') === two.out[i].spot, two.out[i].id + ' reaches their own place without passing through anyone (' + two.rs[i].steps.join(' ') + (two.rs[i].hits.length ? '; hits ' + two.rs[i].hits.join(' ') : '') + ')');
}

// ---- 6. a scene's own walk of you (!move pc) brings your companion along, staging on or off (2026-10-04) --------
// (sa.kasane_meet's `!move pc up 4` left them five tiles behind; lf.water_returns stepped you back onto them)
await start('rw.village', 21, 16, { comp: 'nao', dir: 'up', flags: { rw_arrived: true } });
const party = await run(`
  const W = RB.world.W, m = W.map, sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  RB.game.settings.textSpeed = 'instant';
  // (no map's arrival scene runs on its own after these little scenes end)
  for (const id in RB.content.maps) for (const ev of RB.content.maps[id].onEnter || []) RB.game.s.flags['enter:' + id + ':' + ev.scene] = true;
  // a column of open ground: you, and five free tiles above you, with your companion below
  const open = (x, y) => !RB.maps.blockedStatic(m, x, y) && !RB.maps.exitAt(m, x, y) && !W.map.triggers.some((t) => x >= t.x && x < t.x + t.w && y >= t.y && y < t.y + t.h) && !RB.world.personAt(x, y, null);
  let at = null;
  for (let y = 24; y >= 12 && !at; y--) for (let x = 12; x <= 32 && !at; x++) { let k = -1; while (k <= 5 && open(x, y - k) && open(x - 1, y - k) && open(x + 1, y - k)) k++; if (k > 5) at = [x, y]; }
  if (!at) return { skipped: 'no open column' };
  const place = (px, py, cx, cy) => { Object.assign(W.player, { x: px, y: py, fx: px, fy: py, mv: null, dir: 'up' }); Object.assign(W.comp, { x: cx, y: cy, fx: cx, fy: cy, mv: null, dir: 'up' }); W.trail = []; };
  const play = async (src, staged) => {
    RB.staging.enabled(staged);
    delete RB.content.scenes['wr.move']; RB.script.add('@scene wr.move\\n' + src, 'walk_round');
    const shared = [];
    let on = true;
    const look = () => { if (!on) return; const p = W.player, c = W.comp; const pt = [[p.x, p.y]].concat(p.mv ? [[p.mv.tx, p.mv.ty]] : []), ct = [[c.x, c.y]].concat(c.mv ? [[c.mv.tx, c.mv.ty]] : []); if (pt.some(([a, b]) => ct.some(([d, e]) => a === d && b === e))) shared.push(p.x + ',' + p.y + '/' + c.x + ',' + c.y); requestAnimationFrame(look); };
    requestAnimationFrame(look);
    let done = false;
    RB.script.run('wr.move').then(() => { done = true; });
    for (let i = 0; i < 400 && !done; i++) { await sleep(25); if (RB.ui.dialogue.isOpen()) RB.ui.dialogue.advance(true); }
    // (still for a moment: a walk back to your side is briefly between steps)
    for (let calm = 0, i = 0; calm < 6 && i < 100; i++, await sleep(60)) calm = W.comp.mv || W.comp.route ? 0 : calm + 1;
    on = false;
    return { done, pc: [W.player.x, W.player.y], comp: [W.comp.x, W.comp.y], gap: Math.abs(W.comp.x - W.player.x) + Math.abs(W.comp.y - W.player.y), shared: [...new Set(shared)] };
  };
  const [x, y] = at, out = { at: at.join(',') };
  for (const staged of [true, false]) {
    place(x, y, x, y + 1);
    out['up4' + (staged ? 'On' : 'Off')] = await play('!move pc up 4\\nnarr: {四歩|よんほ} || Four steps.\\n', staged);
    place(x, y - 1, x, y);
    out['back' + (staged ? 'On' : 'Off')] = await play('!move pc down 1\\nnarr: {一歩|いっぽ} || One step back.\\n', staged);
  }
  // staged, with the companion given a gesture first (the scene directs them): left behind by your walk, then
  // walked back to your side when the scene ends
  place(x, y, x, y + 1);
  out.ownedOn = await play('!gesture comp nod pc\\nnarr: {頷|うなず}く || A nod.\\n!move pc up 4\\nnarr: {四歩|よんほ} || Four steps.\\n', true);
  RB.staging.enabled(true);
  return out;
`);
if (party.skipped) assert(false, 'scripted-walk case set up: ' + party.skipped);
else {
  const [x, y] = party.at.split(',').map(Number);
  for (const k of ['On', 'Off']) {
    const u = party['up4' + k], bk = party['back' + k], tag = 'staging ' + k.toLowerCase();
    assert(u.done && u.pc.join(',') === x + ',' + (y - 4) && u.comp.join(',') === x + ',' + (y - 3) && !u.shared.length, tag + ': a scene\'s !move pc up 4 — your companion follows a step behind (you ' + u.pc + ', companion ' + u.comp + (u.shared.length ? '; shared ' + u.shared.join(' ') : '') + ')');
    assert(bk.done && bk.pc.join(',') === x + ',' + y && bk.gap === 1 && bk.comp[1] === y && !bk.shared.length, tag + ': !move pc down 1 onto your companion — they step aside first, and you never share a tile (you ' + bk.pc + ', companion ' + bk.comp + (bk.shared.length ? '; shared ' + bk.shared.join(' ') : '') + ')');
  }
  const o = party.ownedOn;
  assert(o.done && o.gap <= 1 && !o.shared.length, 'staging on, your companion directed by the scene: left where the scene had them, then walked back to your side at its end (you ' + o.pc + ', companion ' + o.comp + ')');
}

assert(!errors.length, 'no page errors ' + errors.slice(0, 3).join(' | '));
await b.close();
srv.close();
console.log(fail ? fail + ' failed' : 'all passed');
process.exit(fail ? 1 : 0);
