// HX68 (docs/expressive/CONTRACT.md): staged scenes under the conditions of play, in the BUILT game, headless Chromium.
// One performed interaction per chapter (a scene with movement and a listener) and the major beat of each personal
// questline, each started THROUGH THE WORLD — you walk up on foot (the world's own movement, RB.world._tryMove, with
// your companion and pet following your trail) and talk or look (RB.world.interact, the game's own talk path) — from
// a synthetic fixture of the moment (the flags, quests and items of tests/e2e/staging_ch*_cases.mjs), never a story
// state that cannot happen: a companion only after the departure, a pet only one the story lets you have met by then,
// an actor absent only where the content has a version without them. Variants per scene:
//   approach   from the fixture's side, and from other sides of the person or object (other free tiles beside them,
//              across a counter where that is how they are talked to) or along another path (your companion then
//              stands elsewhere);
//   occupied   a tile the scene wants (where it walks you, your companion or someone else: its !walkto targets) is
//              already taken — by your companion, who followed you there, or by your pet settled on it;
//   absent     the version of the scene without one of its actors: no companion yet (Chapter 1), the questline's
//              companion not travelling with you (the cameo versions), Ren not with you at Ushio's grave;
//   interrupted the scene starts the moment you arrive, while your companion (and pet) are still stepping after you,
//              or (with nobody following) while a person on their round is mid-step;
//   held key   a direction key is pressed and held as the scene starts and let go during it;
//   repeat     afterwards you walk up and talk again (whatever the story says now plays: a repeat, or the follow-up);
//   revisit    afterwards you leave by a way out and come back.
// Checks per run (staging_runner.mjs's per-frame rules; b.forced, the world's fallback after waiting with no way
// round, is recorded apart): the intended scene ran (through the world) and played to its end; every cue names
// somebody who is there; every authored position is reached; nobody shares a tile or stands on furniture at any
// frame; afterwards the people on the map are exactly those the story places there in the final state, each at
// their place (or on their round) and not left walking, your companion beside you, the pet shown when it should be
// and not on anyone's tile; no page errors; no stuck input (the game is back in the world, no scene running, and a
// real key press turns or moves you, and nothing moves on its own after).
// Usage: node tests/e2e/staging_variants.mjs [--quick] [--only <label prefix>,…]
//   --quick: the fixture's approach (+ repeat and revisit), one other side, one occupied, interrupted and the absent
//   version (the default suite); without it every variant
import { serve, launch, page } from './lib.mjs';
import { CH12 } from './staging_ch12_cases.mjs';
import { CH34 } from './staging_ch34_cases.mjs';
import { CH56 } from './staging_ch56_cases.mjs';

const ARGS = process.argv.slice(2);
const QUICK = ARGS.includes('--quick');
const oi = ARGS.indexOf('--only'), ONLY = oi >= 0 ? ARGS[oi + 1].split(',') : null;
const F = (...o) => Object.assign({}, ...o);
const ALL4 = ['nao', 'mio', 'ren', 'suzu'];
const ALLC = CH12.concat(CH34, CH56);
// a staged scene's fixture (one of its listed variants by name), as staging_runner.mjs merges them
function fixture(scene, vname, over) {
  const c = ALLC.find((x) => x.scene === scene);
  if (!c) throw new Error('no fixture for ' + scene);
  const v = vname ? (c.variants || []).find((x) => x.name === vname) : {};
  if (!v) throw new Error('no variant ' + vname + ' of ' + scene);
  const o = over || {};
  return {
    scene, map: o.map || v.map || c.map, at: o.at || v.at || c.at, talk: o.talk !== undefined ? o.talk : v.talk !== undefined ? v.talk : c.talk,
    flags: F(c.flags, v.flags, o.flags), quests: F(c.quests, v.quests, o.quests), items: F(c.items, v.items, o.items), vars: F(c.vars, v.vars, o.vars),
    player: F(c.player, v.player, o.player), words: (c.words || []).concat(v.words || [], o.words || []), seen: (c.seen || []).concat(v.seen || [], o.seen || []),
    picks: o.picks || v.picks || c.picks || [], fail: !!(o.fail || v.fail || c.fail), minLines: o.minLines || v.minLines || c.minLines || 1, prov: o.prov || v.prov || c.prov || null,
    settle: o.settle || v.settle || c.settle || 5000, prop: o.prop || null,
  };
}
const C5 = { departed: true, ch1_done: true, ch2_done: true, ch3_done: true, ch4_done: true, lf_town_intro: true };
const CO_SUZU = { rw_arrived: true, rw_road_lit: true, departed: true, ch1_done: true, ch2_done: true, co_arrived: true, co_met_sayo: true, co_suspect: true, co_chronicle_read: true, co_suzu_told: true, co_suzu_asked: true, co_kiln_done: true };
const SA_REN = { rw_arrived: true, rw_road_lit: true, departed: true, ch1_done: true, ch2_done: true, ch3_done: true, ch4_done: true, ch5_done: true, sb_hoshino_goes: true, sa_arrived: true, sa_met_kasane: true, sa_kasane_left: true, sa_promise_done: true };

// The scenes. comps: the companions the variants rotate through (null: nobody travels with you yet). pet: a species
// the story lets you have met by then (none in Chapter 1 before the Mill Echo). absent: the version without one of
// the scene's actors, with the reason the content allows it.
const CASES = [
  { label: 'Ch1 Tsuru at the square (rw.tsuru_first)', fx: fixture('rw.tsuru_first', 'letter · help'), comps: [null], pet: null,
    absentWhy: 'nobody travels with you yet (Chapter 1, before the departure): every run is without a companion' },
  { label: 'Ch1 Mio at the apothecary (rw.mio_first)', fx: fixture('rw.mio_first', 'labels written'), comps: [null], pet: null,
    absentWhy: 'nobody travels with you yet (Chapter 1)' },
  { label: 'Ch2 Tetsu on the quay (sg.tetsu_first)', fx: fixture('sg.tetsu_first'), comps: ALL4, pet: 'cat',
    absent: [{ name: 'no pet (none chosen)', pet: null }] },
  // (Tokiwa walks off to the Hall across the square after the scene: a longer bound for the world to settle)
  { label: 'Ch3 the rope for Gorō (co.bell_ring)', fx: fixture('co.bell_ring', null, { settle: 15000 }), comps: ALL4, pet: 'dog',
    absent: [{ name: 'no pet (none chosen)', pet: null }] },
  { label: 'Ch4 Hoshino\'s promise (sb.hoshino)', fx: fixture('sb.hoshino', 'the promise'), comps: ALL4, pet: 'tanuki',
    absent: [{ name: 'the pet met but hidden (Show pet off)', petHidden: true }] },
  { label: 'Ch5 the ferry timetable (lf.timetable)', fx: fixture('lf.timetable', 'ask for the log', { prop: [7, 2] }), comps: ['mio', 'nao', 'ren', 'suzu'], pet: 'bird',
    absent: [{ name: 'no pet (none chosen)', pet: null }] },
  { label: 'Ch6 Ushio\'s grave (sa.ushio_grave)', fx: fixture('sa.ushio_grave', 'Ren', { prop: [22, 18] }), comps: ['ren'], pet: 'cat',
    absent: [{ name: 'without Ren (Nao with you: the scene\'s version without them)', comp: 'nao', fx: fixture('sa.ushio_grave', 'without Ren', { prop: [22, 18] }) }] },
  // the personal questlines' major beats
  { label: 'Suzu\'s questline: the truth at the glassworks (co.suzu_truth)', personal: 'co_suzu',
    fx: { scene: 'co.suzu_truth', map: 'co.glass', at: [5, 5, 'left'], talk: 'hiro', flags: CO_SUZU, quests: { co_main: 7, co_suzu: 3 }, items: { co_globe: 1 }, vars: {}, player: {}, words: [], seen: [], picks: [1], fail: false, minLines: 20, settle: 5000 },
    comps: ['suzu'], pet: 'tanuki',
    absent: [{ name: 'Suzu not travelling with you: she waits in the glassworks herself (the cameo version)', comp: 'mio',
      fx: { scene: 'co.suzu_truth', map: 'co.glass', at: [6, 7, 'up'], talk: 'suzu', flags: CO_SUZU, quests: { co_main: 7, co_suzu: 3 }, items: { co_globe: 1 }, vars: {}, player: {}, words: [], seen: [], picks: [0], fail: false, minLines: 20, settle: 10000 } }] },
  { label: 'Nao\'s questline: the letter for Umi (lf.nao_deliver)', personal: 'lf_nao', fx: fixture('lf.nao_deliver', 'met before'), comps: ['nao'], pet: 'cat',
    absent: [{ name: 'Nao not travelling with you: Nao in town (lf.naoc, the cameo version)', comp: 'mio', fx: fixture('lf.naoc') }] },
  { label: 'Mio\'s questline: a no, out loud (lf.mio_refuse)', personal: 'lf_mio',
    fx: { scene: 'lf.mio_refuse', map: 'lf.records', at: [7, 5, 'up'], talk: 'lf_tadashi', flags: C5, quests: { lf_mio: 2 }, items: {}, vars: {}, player: {}, words: [], seen: [], picks: [0], fail: false, minLines: 8, settle: 5000 },
    comps: ['mio'], pet: 'dog',
    absent: [{ name: 'Mio not travelling with you: Mio at the inn (lf.mioc, the cameo version)', comp: 'ren', fx: fixture('lf.mioc') }] },
  { label: 'Ren\'s questline: the teacher\'s face (sa.shelf_ren)', personal: 'ren_ushio',
    fx: { scene: 'sa.shelf_ren', map: 'sa.memories', at: [4, 7, 'up'], prop: [4, 6], flags: SA_REN, quests: { sa_main: 4, ren_ushio: 1 }, items: {}, vars: {}, player: {}, words: [], seen: [], picks: [], choose: ['Take it back'], fail: false, minLines: 8, settle: 5000 },
    comps: ['ren'], pet: 'bird',
    absent: [{ name: 'Ren not travelling with you: the folio carried home unopened', comp: 'suzu', choose: ['Don\'t open it'],
      fx: { scene: 'sa.shelf_ren', map: 'sa.memories', at: [4, 7, 'up'], prop: [4, 6], flags: SA_REN, quests: { sa_main: 4, ren_ushio: 1 }, items: {}, vars: {}, player: {}, words: [], seen: [], picks: [], choose: ['Don\'t open it'], fail: false, minLines: 4, settle: 5000 } }] },
];

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const wait = (p, ms) => p.waitForTimeout(ms);

// ---- in the page ------------------------------------------------------------------------------------------------
// Set up the moment (as staging_runner.mjs runBranch does) and report where the scene can be started from: the free
// tiles beside the person (or across their counter) or object, each with the tiles one could come from.
async function prep(p, fx, v) {
  return p.evaluate(async ([fx, v]) => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const comp = v.comp;
    RB.game.settings.textSpeed = 'instant';
    RB.game.settings.reducedMotion = false; RB.game.applySettings();
    RB.game.settings.petWorld = !v.petHidden;
    const s = RB.game.debugStart(fx.map, fx.at[0], fx.at[1], { comp: comp || undefined, flags: Object.assign({}, fx.flags), dir: fx.at[2] || 'up' });
    if (!comp) { s.comp = null; RB.world.placeCompanion(); }
    for (const [k, n] of Object.entries(fx.items || {})) RB.state.give(s, k, n);
    for (const [k, st] of Object.entries(fx.quests || {})) RB.state.setQuest(s, k, st);
    Object.assign(s.vars, fx.vars || {});
    Object.assign(s.player, fx.player || {});
    for (const w of fx.words || []) if (!s.words.includes(w)) s.words.push(w);
    for (const k of fx.seen || []) s.seen[k] = true;
    for (const m in RB.content.maps) for (const f of RB.content.maps[m].foes || []) s.flags['foe:' + m + ':' + f.id] = true;
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
    if (fx.prov) s.provisional = fx.prov;
    if (v.pet) { RB.pets.meet(s, v.pet, fx.map); RB.pets.select(s, v.pet); }
    RB.world.refreshActors();
    if (comp) RB.world.placeCompanion();
    const pass = !fx.fail;
    RB.challenge.run = async () => ({ ok: pass });
    RB.activities.run = async () => ({ ok: pass });
    RB.game.startBattle = async () => 'win';
    if (RB.lessons) { RB.lessons.run = async () => {}; RB.lessons.grammarCard = async () => {}; }
    RB.ui.card = async () => {}; RB.game.rest = async () => {};
    RB.ui.shop = async () => {}; if (RB.ui.menu) RB.ui.menu.open = async () => {};
    RB.save.autosave = async () => {};
    if (RB.hooks) RB.hooks.suzu_speech = async () => {};
    RB.staging.enabled(true); RB.staging.seed(11);
    await sleep(1000); // (the map entered a while ago: comings and goings walk, idle life runs, as in play)
    const W = RB.world.W, m = W.map, D4 = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }, OPP = { up: 'down', down: 'up', left: 'right', right: 'left' };
    const people = () => W.npcs.concat(W.extras || []);
    const trig = new Set();
    for (const t of m.def.triggers || []) if (!t.if || RB.state.test(s, t.if)) for (let y = t.y; y < t.y + (t.h || 1); y++) for (let x = t.x; x < t.x + (t.w || 1); x++) trig.add(x + ',' + y);
    const floor = (x, y) => x >= 0 && y >= 0 && x < m.w && y < m.h && !RB.maps.blockedStatic(m, x, y) && !RB.maps.exitAt(m, x, y) && !trig.has(x + ',' + y);
    const free = (x, y) => floor(x, y) && !people().some((a) => a.x === x && a.y === y);
    // the target: a person (by id) or an object's footprint
    let tiles = [], targetId = null;
    if (fx.talk) {
      const a = RB.staging.actor(fx.talk) || W.npcs.find((n) => n.id === fx.talk);
      if (!a) return { err: 'no ' + fx.talk + ' on ' + m.id };
      targetId = a.id; tiles = [[a.x, a.y]];
    } else if (fx.prop) {
      const pr = m.props.find((q) => q.x === fx.prop[0] && q.y === fx.prop[1]);
      if (!pr) return { err: 'no prop at ' + fx.prop };
      const pd = RB.props.P[pr.p] || {}, w = pr.w || pd.w || 1, h = pr.h || pd.h || 1;
      for (let y = pr.y; y < pr.y + h; y++) for (let x = pr.x; x < pr.x + w; x++) tiles.push([x, y]);
    }
    const inT = (x, y) => tiles.some((t) => t[0] === x && t[1] === y);
    const stands = [];
    for (const [tx, ty] of tiles) for (const [dir, [dx, dy]] of Object.entries(D4)) {
      let sx = tx + dx, sy = ty + dy;
      if (inT(sx, sy)) continue;
      if (!free(sx, sy) && fx.talk) {
        // across a counter (50_world.js interact)
        const pr = m.props.find((q) => { const pd = RB.props.P[q.p] || {}, w = q.w || pd.w || 1, h = q.h || pd.h || 1; return (q.p === 'counter' || q.across) && sx >= q.x && sy >= q.y && sx < q.x + w && sy < q.y + h; });
        if (!pr) continue;
        sx += dx; sy += dy;
      }
      if (!free(sx, sy) || stands.some((q) => q.x === sx && q.y === sy)) continue;
      const froms = [];
      for (const [, [ex, ey]] of Object.entries(D4)) { const fx2 = sx + ex, fy2 = sy + ey; if (free(fx2, fy2) && !inT(fx2, fy2)) froms.push([fx2, fy2]); }
      if (froms.length) stands.push({ x: sx, y: sy, face: OPP[dir], froms });
    }
    // the tiles the scene walks people to (its !walkto targets, in the scene and the scenes it calls)
    const walktos = [];
    const scan = (id, d) => { const sc = RB.content.scenes[id]; if (!sc || d > 3) return; for (const c of sc.cmds) { if (c.op === 'walkto') walktos.push([c.args[0], +c.args[1], +c.args[2]]); if (c.op === 'call') scan(c.args[0], d + 1); } };
    scan(fx.scene, 0);
    window.__V = { targetId, tiles, stands };
    return { map: m.id, targetId, tiles, stands, walktos, at: fx.at, wanderers: W.npcs.filter((n) => n.def && n.def.wander).map((n) => n.id), seen0: !!s.seen[fx.scene] };
  }, [fx, v]);
}
// Walk up: from a start some steps back along the way in, to `from`, then onto the stand tile; face the target.
async function approach(p, st, from, v) {
  return p.evaluate(async ([st, from, v]) => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const W = RB.world.W, m = W.map, s = RB.game.s, V = window.__V;
    const D4 = [[1, 0, 'right'], [-1, 0, 'left'], [0, 1, 'down'], [0, -1, 'up']];
    const trig = new Set();
    for (const t of m.def.triggers || []) if (!t.if || RB.state.test(s, t.if)) for (let y = t.y; y < t.y + (t.h || 1); y++) for (let x = t.x; x < t.x + (t.w || 1); x++) trig.add(x + ',' + y);
    const people = () => W.npcs.concat(W.extras || []);
    const ok = (x, y) => x >= 0 && y >= 0 && x < m.w && y < m.h && !RB.maps.blockedStatic(m, x, y) && !RB.maps.exitAt(m, x, y) && !trig.has(x + ',' + y) && !people().some((a) => a.x === x && a.y === y) && !V.tiles.some((t) => t[0] === x && t[1] === y) && !(x === st.x && y === st.y);
    // a start 4 steps back from `from` (or as far as the floor goes)
    const prev = new Map([[from.join(','), null]]);
    let q = [from], far = from, depth = 0;
    while (q.length && depth < 4) {
      const nq = [];
      for (const [x, y] of q) for (const [dx, dy] of D4) { const k = (x + dx) + ',' + (y + dy); if (prev.has(k) || !ok(x + dx, y + dy)) continue; prev.set(k, [x, y]); nq.push([x + dx, y + dy]); }
      if (!nq.length) break;
      q = nq; far = nq[0]; depth++;
    }
    const path = [];
    for (let t = far; t; t = prev.get(t.join(','))) path.push(t);
    path.push([st.x, st.y]);
    // stand at the start, your companion behind you, the pet settled; then walk
    const [sx, sy] = path[0], [nx, ny] = path[1] || [st.x, st.y];
    const dir0 = nx > sx ? 'right' : nx < sx ? 'left' : ny > sy ? 'down' : 'up';
    RB.test.place(sx, sy, dir0);
    RB.world.placeCompanion();
    if (RB.petWorld.place) RB.petWorld.place();
    await sleep(500);
    const moved = [];
    for (let i = 1; i < path.length; i++) {
      const [x0, y0] = [W.player.x, W.player.y], [x1, y1] = path[i];
      const dir = x1 > x0 ? 'right' : x1 < x0 ? 'left' : y1 > y0 ? 'down' : 'up';
      for (let tries = 0; tries < 30 && (W.player.x !== x1 || W.player.y !== y1); tries++) {
        if (!W.player.mv) { W.player.dir = dir; W.turnHold = 0; RB.world._tryMove(dir); }
        await sleep(60);
        while (W.player.mv) await sleep(16);
      }
      moved.push(W.player.x + ',' + W.player.y);
      if (W.player.x !== x1 || W.player.y !== y1) return { err: 'blocked on the way at ' + W.player.x + ',' + W.player.y + ' → ' + x1 + ',' + y1, path, moved };
    }
    // face the person or object (a press towards them turns you)
    const T = V.tiles.slice().sort((a, b2) => Math.abs(a[0] - st.x) + Math.abs(a[1] - st.y) - (Math.abs(b2[0] - st.x) + Math.abs(b2[1] - st.y)))[0];
    const fdir = st.face;
    if (W.player.dir !== fdir) { RB.world._tryMove(fdir); await sleep(90); }
    if (W.player.dir !== fdir) W.player.dir = fdir;
    // settle (unless the scene is to start at once, while those following you are still stepping)
    if (!v.interrupt) {
      const t0 = performance.now();
      const pet = () => { const ps = RB.petWorld.state && RB.petWorld.state(); return ps && ps.moving; };
      while (performance.now() - t0 < 2500 && ((W.comp && (W.comp.mv || W.comp.route)) || pet())) await sleep(40);
      await sleep(250);
    }
    return { path, moved, face: fdir, target: T, comp: W.comp ? [W.comp.x, W.comp.y] : null };
  }, [st, from, v]);
}
// a tile the scene wants, taken: the pet settled on it
async function petOn(p, tile) {
  return p.evaluate(async (tile) => {
    const P = RB.petWorld._P;
    if (!P || !RB.petWorld.state().shown) return { err: 'no pet shown' };
    Object.assign(P, { x: tile[0], y: tile[1], fx: tile[0], fy: tile[1], mv: null, queue: [], placed: true, map: RB.world.W.map.id, still: 0 });
    await new Promise((r) => setTimeout(r, 120));
    const st = RB.petWorld.state();
    return { at: [st.x, st.y] };
  }, tile);
}
// Start the scene through the world (talk / look), play it as a reader (choices by the fixture's picks or texts), let
// the world settle, and report.
async function go(p, fx, v, o) {
  return p.evaluate(async ([fx, v, o]) => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const W = RB.world.W, s = RB.game.s;
    const name = (ref) => (typeof ref === 'string' ? ref : ref === W.player ? 'pc' : ref === W.comp ? 'comp' : ref && ref.id);
    const lost = [], walks = [], unfit = [];
    const wrap = (fn, kind) => {
      const f0 = RB.staging[fn];
      RB.staging[fn] = function (ref, a1) {
        const here = !!RB.staging.actor(ref);
        if (!here) lost.push(kind + ' ' + name(ref) + ' ' + (a1 == null ? '' : a1));
        const r = f0.apply(this, arguments);
        if (kind === 'gesture' && here && a1 !== '-' && !r) unfit.push(name(ref) + ':' + a1);
        if (kind === 'walkto') {
          // (who stood on the target as the walk was cued, and where a walk that did not arrive ended)
          const tx = +a1, ty = +arguments[2], A = RB.staging.actor(ref);
          const on = (q) => q && q !== A && q.x === tx && q.y === ty;
          const holder = W.npcs.concat(W.extras || [], W.comp ? [W.comp] : [], [W.player]).find(on);
          const ps = RB.petWorld.state && RB.petWorld.state();
          const rec = { who: name(ref), to: tx + ',' + ty, taken: holder ? name(holder) : ps && ps.shown && Math.round(ps.x) === tx && Math.round(ps.y) === ty ? 'pet' : null };
          walks.push(rec);
          return Promise.resolve(r).then((ok) => { rec.ok = ok; if (!ok && A) { rec.at = A.x + ',' + A.y; rec.near = W.npcs.concat(W.extras || [], W.comp ? [W.comp] : [], [W.player]).filter((q) => q !== A && Math.abs(q.x - tx) + Math.abs(q.y - ty) <= 1).map((q) => name(q) + '@' + q.x + ',' + q.y); } return ok; });
        }
        return r;
      };
      return () => { RB.staging[fn] = f0; };
    };
    const unwrap = [wrap('cue', 'gesture'), wrap('look', 'look'), wrap('pose', 'pose'), wrap('prop', 'prop'), wrap('walkTo', 'walkto')];
    // every frame: nobody shares a tile, nobody stands on furniture; the pet's tile against the people's
    const clash = [], walkin = [], furn = [], petOver = new Map();
    const start0 = W.comp && W.comp.x === W.player.x && W.comp.y === W.player.y ? [W.comp.x, W.comp.y] : null;
    let watching = true;
    const watch = () => {
      if (!watching) return;
      const same = W.comp && W.comp.x === W.player.x && W.comp.y === W.player.y;
      const follow = same && (!RB.staging.owned(W.comp) || (start0 && W.comp.x === start0[0] && W.comp.y === start0[1]));
      const all = W.npcs.concat(W.extras || [], W.comp && !follow ? [W.comp] : [], [W.player]);
      const seen = new Map();
      for (const a of all) for (const [x, y] of [[a.x, a.y]].concat(a.mv ? [[a.mv.tx, a.mv.ty]] : [])) {
        const k = W.map.id + '@' + x + ',' + y;
        if (seen.has(k) && seen.get(k) !== a) (a.forced || seen.get(k).forced ? walkin : clash).push(k + ' ' + (a.id || 'pc') + '/' + (seen.get(k).id || 'pc'));
        seen.set(k, a);
        if (RB.maps.blockedStatic(W.map, x, y)) furn.push((a.id || 'pc') + '@' + k);
      }
      const ps = RB.petWorld.state && RB.petWorld.state();
      if (ps && ps.shown && ps.moving === false) { const k = W.map.id + '@' + Math.round(ps.x) + ',' + Math.round(ps.y); if (seen.has(k)) petOver.set(k, (petOver.get(k) || 0) + 1); }
      requestAnimationFrame(watch);
    };
    requestAnimationFrame(watch);
    // which scenes run (the world starts them: talk, look)
    const ran = [];
    const run0 = RB.script.run;
    let done = false, err = null, started = false;
    RB.script.run = function (id) { ran.push(id); const pr = run0.apply(this, arguments); if (!started) { started = true; pr.then(() => { done = true; }, (e) => { err = String(e); done = true; }); } return pr; };
    const before = { x: W.player.x, y: W.player.y, compMv: !!(W.comp && (W.comp.mv || W.comp.route)), petMoving: !!(RB.petWorld.state && RB.petWorld.state() && RB.petWorld.state().moving) };
    // (with nobody following: start while a person on their round is mid-step, when there is one)
    if (v.interrupt && !W.comp && o.wanderers && o.wanderers.length) { const t0 = performance.now(); while (performance.now() - t0 < 4000 && !W.npcs.some((n) => n.def && n.def.wander && n.mv)) await sleep(10); before.wanderMv = W.npcs.filter((n) => n.def && n.def.wander && n.mv).map((n) => n.id); }
    let seenLines = s.backlog.length;
    RB.world.interact();
    await sleep(30);
    RB.script.run = run0;
    if (!started) { watching = false; unwrap.forEach((u) => u()); return { err: 'nothing started (facing ' + W.player.dir + ' at ' + W.player.x + ',' + W.player.y + ')', ran }; }
    const picks = (v.picks || fx.picks || []).slice(), choose = (v.choose || fx.choose || []).slice();
    const lines = [];
    const t0 = performance.now();
    while (!done && performance.now() - t0 < 90000) {
      await sleep(25);
      const bs = [...document.querySelectorAll('.choices:not(.hidden) button')];
      if (bs.length) {
        let k = 0;
        if (choose.length) { const t = choose.shift(); k = Math.max(0, bs.findIndex((x) => x.textContent.includes(t))); } else if (picks.length) k = picks.shift();
        (bs[k] || bs[0]).click();
        await sleep(80);
        continue;
      }
      const sh = RB.ui.dialogue.shown();
      if (!sh || !RB.ui.dialogue.isOpen() || s.backlog.length === seenLines) continue;
      seenLines = s.backlog.length;
      await sleep(o.dwell || 40);
      lines.push((sh.who || '') + ': ' + (sh.en || '').slice(0, 40));
      RB.ui.dialogue.advance(true);
    }
    // afterwards: those moved for the scene walk back; wait until nobody is walking (bounded)
    const walking = (a) => a.route || (a.mv && !(a.def && a.def.wander));
    const busy = () => W.npcs.concat(W.extras || [], W.leavers || [], W.comp ? [W.comp] : []).some(walking) || (W.leavers || []).length;
    await sleep(150);
    const t1 = performance.now();
    for (let calm = 0; calm < 5 && performance.now() - t1 < (fx.settle || 5000); await sleep(60)) calm = busy() ? 0 : calm + 1;
    await sleep(200);
    watching = false;
    unwrap.forEach((u) => u());
    const want = (W.map.def.npcs || []).filter((n) => (!n.if || RB.state.test(s, n.if)) && !(s.comp && n.id === s.comp && !n.alwaysShow)).map((n) => n.id).sort();
    const have = W.npcs.map((n) => n.id).sort();
    const away = W.npcs.filter((a) => a.home && (a.x !== a.home[0] || a.y !== a.home[1]) && !(a.def && a.def.wander)).map((a) => a.id + '@' + a.x + ',' + a.y + '≠' + a.home.join(','));
    const stuck = W.npcs.concat(W.extras || [], W.comp ? [W.comp] : []).filter(walking).map((a) => (a.id || 'comp') + '@' + a.x + ',' + a.y);
    const ps = RB.petWorld.state && RB.petWorld.state();
    const petShould = !!(RB.pets.visible(s, 'world'));
    const occ = W.npcs.concat(W.extras || [], W.comp ? [W.comp] : [], [W.player]);
    const petOn = ps && ps.shown ? occ.filter((a) => a.x === Math.round(ps.x) && a.y === Math.round(ps.y)).map((a) => a.id || 'pc') : [];
    return { ran, done, err, lines, lost, unfit, walks, clash: [...new Set(clash)], walkin: [...new Set(walkin)], furn: [...new Set(furn)], petOver: [...petOver.entries()],
      want, have, extras: (W.extras || []).map((a) => a.id), leavers: (W.leavers || []).map((a) => a.id), away, stuck, before,
      compGap: W.comp ? Math.abs(W.comp.x - W.player.x) + Math.abs(W.comp.y - W.player.y) : 0, comp: W.comp ? W.comp.id : null, sComp: s.comp || null,
      pet: ps ? { shown: !!ps.shown, x: ps.x, y: ps.y } : null, petShould, petOn, seen: !!s.seen[fx.scene], map: W.map.id,
      mode: RB.game.mode(), running: RB.script.isRunning(), open: RB.ui.dialogue.isOpen(), pc: [W.player.x, W.player.y, W.player.dir] };
  }, [fx, v, o]);
}
// After a run: is input stuck? a real key press towards free floor moves you (or towards a wall turns you); nothing
// moves on its own afterwards.
async function inputCheck(p) {
  const pick = await p.evaluate(() => {
    const W = RB.world.W, m = W.map, D = { ArrowUp: [0, -1, 'up'], ArrowDown: [0, 1, 'down'], ArrowLeft: [-1, 0, 'left'], ArrowRight: [1, 0, 'right'] };
    const people = W.npcs.concat(W.extras || [], W.comp ? [W.comp] : []);
    let turn = null;
    for (const [k, [dx, dy, dir]] of Object.entries(D)) {
      const x = W.player.x + dx, y = W.player.y + dy;
      const freeT = !RB.maps.blockedStatic(m, x, y) && !RB.maps.exitAt(m, x, y) && !people.some((a) => a.x === x && a.y === y) && !(m.def.triggers || []).some((t) => x >= t.x && y >= t.y && x < t.x + (t.w || 1) && y < t.y + (t.h || 1));
      if (freeT && dir !== W.player.dir) return { key: k, dir, move: true };
      if (!turn && dir !== W.player.dir) turn = { key: k, dir, move: false };
    }
    return turn;
  });
  const before = await p.evaluate(() => [RB.world.W.player.x, RB.world.W.player.y, RB.world.W.player.dir, RB.game.mode(), RB.script.isRunning()]);
  if (!pick) return { ok: false, why: 'no direction to press' };
  await p.keyboard.down(pick.key); await wait(p, pick.move ? 320 : 120); await p.keyboard.up(pick.key);
  await wait(p, 450);
  const a = await p.evaluate(() => [RB.world.W.player.x, RB.world.W.player.y, RB.world.W.player.dir, !!RB.world.W.player.mv]);
  await wait(p, 500);
  const z = await p.evaluate(() => [RB.world.W.player.x, RB.world.W.player.y, RB.world.W.player.dir, !!RB.world.W.player.mv]);
  const responded = a[2] === pick.dir && (pick.move ? a[0] !== before[0] || a[1] !== before[1] : true);
  const still = z[0] === a[0] && z[1] === a[1] && !z[3];
  return { ok: before[3] === 'world' && !before[4] && responded && still, why: 'mode ' + before[3] + (before[4] ? ', a scene running' : '') + '; pressed ' + pick.key + ' → ' + JSON.stringify(a) + ' then ' + JSON.stringify(z) };
}
// leave by the nearest way out and come back the way the map links them
async function revisit(p) {
  return p.evaluate(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const W = RB.world.W, s = RB.game.s, from = W.map.id;
    const test = (c) => !c || RB.state.test(s, c);
    const usable = (e) => test(e.if) && !(e.locked && !(e.unlock && test(e.unlock))) && RB.content.maps[e.to];
    const exits = (W.map.exits || []).filter(usable);
    const dist = (e) => Math.abs(e.x - W.player.x) + Math.abs(e.y - W.player.y);
    exits.sort((a, b2) => dist(a) - dist(b2));
    // a way out whose map has a way back here
    for (const ex of exits) {
      const back = (RB.maps.compile(ex.to).exits || []).find((e) => e.to === from && usable(e));
      if (!back) continue;
      await RB.test.idle(20000);
      if (ex.tx == null) await RB.game.transition(ex.to, null, null, ex.dir || 'down', { sp: ex.sp }); else await RB.game.transition(ex.to, ex.tx, ex.ty, ex.dir || 'down');
      await RB.test.idle(20000);
      await sleep(600);
      if (back.tx == null) await RB.game.transition(from, null, null, back.dir || 'down', { sp: back.sp }); else await RB.game.transition(from, back.tx, back.ty, back.dir || 'down');
      await RB.test.idle(20000);
      await sleep(1600);
      const want = (W.map.def.npcs || []).filter((n) => (!n.if || RB.state.test(s, n.if)) && !(s.comp && n.id === s.comp && !n.alwaysShow)).map((n) => n.id).sort();
      const have = W.npcs.map((n) => n.id).sort();
      const all = W.npcs.concat(W.extras || [], W.comp ? [W.comp] : [], [W.player]);
      const seen = new Map(), clash = [];
      for (const a of all) { const k = a.x + ',' + a.y; if (seen.has(k) && !(a === W.comp && seen.get(k) === W.player) && !(seen.get(k) === W.comp && a === W.player)) clash.push(k + ' ' + (a.id || 'pc') + '/' + (seen.get(k).id || 'pc')); seen.set(k, a); }
      const away = W.npcs.filter((a) => a.home && (a.x !== a.home[0] || a.y !== a.home[1]) && !(a.def && a.def.wander)).map((a) => a.id + '@' + a.x + ',' + a.y);
      const ps = RB.petWorld.state && RB.petWorld.state();
      const petOn = ps && ps.shown ? all.filter((a) => a.x === Math.round(ps.x) && a.y === Math.round(ps.y)).map((a) => a.id || 'pc') : [];
      return { via: ex.to, map: W.map.id, want, have, clash, away, comp: W.comp ? W.comp.id : null, sComp: s.comp || null, compGap: W.comp ? Math.abs(W.comp.x - W.player.x) + Math.abs(W.comp.y - W.player.y) : 0, pet: ps ? !!ps.shown : null, petShould: RB.pets.visible(s, 'world'), petOn };
    }
    return { err: 'no way out of ' + from + ' with a way back' };
  });
}

// the checks of one run
function checks(tag, fx, r, o) {
  ok(!r.err && r.done && r.seen && r.lines.length >= (fx.minLines || 1), tag + ': the scene starts through the world and plays to its end (' + (r.ran || []).join(' → ') + '; ' + (r.lines || []).length + ' lines' + (r.err ? '; ' + r.err : '') + (r.seen ? '' : '; ' + fx.scene + ' did not run') + ')');
  if (r.err) return;
  ok(r.lost.length === 0 && r.unfit.length === 0, tag + ': every cue names somebody who is there and can make it' + (r.lost.length + r.unfit.length ? ' (' + r.lost.concat(r.unfit).slice(0, 4).join('; ') + ')' : ''));
  // a walk whose target someone already stood on stops where it is (52_staging.js walkTo: the authored fallback);
  // any other walk must arrive
  const bad = r.walks.filter((w) => !w.ok && !w.taken), taken = r.walks.filter((w) => !w.ok && w.taken);
  ok(bad.length === 0, tag + ': every authored position is reached (' + r.walks.length + ' walks' + (bad.length ? '; not reached: ' + bad.map((w) => w.who + '→' + w.to + ' (stopped at ' + w.at + '; near: ' + (w.near || []).join(' ') + ')').join(' ') : '') + (taken.length ? '; target already taken, stopped where they stood: ' + taken.map((w) => w.who + '→' + w.to + ' (by ' + w.taken + ', at ' + w.at + ')').join(' ') : '') + ')');
  ok(r.clash.length === 0 && r.furn.length === 0, tag + ': nobody shares a tile or stands on furniture' + (r.clash.length + r.furn.length ? ' (' + r.clash.concat(r.furn).slice(0, 3).join(' ') + ')' : '') + (r.walkin.length ? ' [the world\'s fallback, after waiting with no way round: ' + r.walkin.slice(0, 2).join(' ') + ']' : ''));
  const extra = r.have.filter((x) => !r.want.includes(x)), miss = r.want.filter((x) => !r.have.includes(x));
  ok(extra.length === 0 && miss.length === 0 && !r.leavers.length && !r.extras.length, tag + ': afterwards the people on ' + r.map + ' are those the story places there' + (extra.length + miss.length + r.leavers.length + r.extras.length ? ' (extra ' + extra.join(',') + ' missing ' + miss.join(',') + ' leaving ' + r.leavers.join(',') + ' walked-in ' + r.extras.join(',') + ')' : ''));
  ok(r.away.length === 0 && r.stuck.length === 0, tag + ': afterwards everyone is at their place, nobody left walking' + (r.away.length + r.stuck.length ? ' (' + r.away.concat(r.stuck).join(' ') + ')' : ''));
  ok(r.comp === r.sComp && r.compGap <= 2, tag + ': your companion ' + (r.sComp ? '(' + r.sComp + ') is beside you (' + r.compGap + ' tiles)' : 'absent, as the story has it'));
  if (o.pet !== undefined) ok(!!(r.pet && r.pet.shown) === r.petShould && r.petOn.length === 0, tag + ': the pet ' + (r.petShould ? 'is with you and on nobody\'s tile' + (r.petOn.length ? ' (on ' + r.petOn.join(',') + ')' : '') : 'is not shown (none chosen, or hidden)') + (r.petOver.length ? ' [a person stood over it for a moment: ' + r.petOver.slice(0, 2).map((x) => x[0] + '×' + x[1]).join(' ') + ']' : ''));
}

// ---- run --------------------------------------------------------------------------------------------------------
let cur = null, runs = 0;
const fresh = async () => {
  if (cur && runs % 12 === 0) { ok(cur.errors.length === 0, 'pages up to run ' + runs + ': no page errors' + (cur.errors.length ? ' — ' + cur.errors.slice(0, 2).join(' | ') : '')); await cur.ctx.close(); cur = null; }
  if (!cur) cur = await page(b, url, { viewport: { width: 960, height: 640 } });
  runs++;
  return cur.p;
};
const tStart = Date.now();
for (const C of CASES) {
  if (ONLY && !ONLY.some((f) => C.label.startsWith(f))) continue;
  const comps = C.comps;
  let ci = 0;
  const nextComp = () => comps[(ci++) % comps.length];
  // probe the places it can be started from (with the first companion)
  const p0 = await fresh();
  const probe = await prep(p0, C.fx, { comp: comps[0], pet: null });
  if (probe.err || !probe.stands.length) { ok(false, C.label + ': somewhere to start it from (' + (probe.err || 'no free tile beside it') + ')'); continue; }
  const atKey = C.fx.at[0] + ',' + C.fx.at[1];
  const stands = probe.stands.slice().sort((a, b2) => (a.x + ',' + a.y === atKey ? -1 : 0) - (b2.x + ',' + b2.y === atKey ? -1 : 0));
  const A = stands[0];
  // the way in to the fixture's side: from the tile behind you as you face them, else the first
  const back = (st) => { const D = { up: [0, 1], down: [0, -1], left: [1, 0], right: [-1, 0] }[st.face]; const t = st.froms.find((f) => f[0] === st.x + D[0] && f[1] === st.y + D[1]); return t || st.froms[0]; };
  const V = [];
  V.push({ name: 'approach: the fixture\'s side (' + A.x + ',' + A.y + ' facing ' + A.face + ')', st: A, from: back(A), comp: nextComp(), pet: C.pet, chain: true, quick: true });
  const others = stands.slice(1);
  for (const st of others.slice(0, 2)) V.push({ name: 'approach: another side (' + st.x + ',' + st.y + ' facing ' + st.face + ')', st, from: back(st), comp: nextComp(), pet: C.pet, quick: st === others[0] });
  if (!others.length && A.froms.length > 1) { const f2 = A.froms.find((f) => f !== back(A)); V.push({ name: 'approach: the same place along another way (from ' + f2.join(',') + ')', st: A, from: f2, comp: nextComp(), pet: C.pet, quick: true }); }
  // a tile the scene wants, taken by your companion who followed you onto it
  const wantTiles = probe.walktos.filter((w) => w[0] === 'pc' || w[0] === 'comp' || w[0] === 'npc' || w[0] === C.fx.talk).map((w) => [w[1], w[2], w[0]]);
  let compOcc = null;
  if (comps[0]) for (const st of stands) { const f = st.froms.find((fr) => wantTiles.some((w) => w[0] === fr[0] && w[1] === fr[1])); if (f) { compOcc = { st, from: f, w: wantTiles.find((w) => w[0] === f[0] && w[1] === f[1]) }; break; } }
  if (compOcc) V.push({ name: 'occupied: your companion stands where the scene walks ' + compOcc.w[2] + ' (' + compOcc.from.join(',') + ')', st: compOcc.st, from: compOcc.from, comp: nextComp(), pet: null, quick: true });
  // a tile the scene wants, taken by your pet settled on it
  if (C.pet) {
    const tile = wantTiles.find((w) => !(w[0] === A.x && w[1] === A.y)) || null;
    V.push({ name: 'occupied: the pet settled on ' + (tile ? 'the tile the scene walks ' + tile[2] + ' to (' + tile[0] + ',' + tile[1] + ')' : 'the tile beside you'), st: A, from: back(A), comp: nextComp(), pet: C.pet, petTile: tile ? [tile[0], tile[1]] : 'beside', quick: !compOcc });
  }
  V.push({ name: 'interrupted: the scene starts as you arrive' + (comps[0] ? ', your companion' + (C.pet ? ' and pet' : '') + ' still stepping' : ', a person on their round mid-step'), st: A, from: back(A), comp: nextComp(), pet: C.pet, interrupt: true, quick: true });
  V.push({ name: 'held key: a direction held as the scene starts, let go during it', st: A, from: back(A), comp: nextComp(), pet: C.pet, held: true });
  for (const ab of C.absent || []) V.push(Object.assign({ name: 'absent: ' + ab.name, st: null, from: null, comp: ab.comp !== undefined ? ab.comp : nextComp(), pet: ab.pet !== undefined ? ab.pet : C.pet, quick: true, absent: true }, ab));
  if (C.absentWhy) ok(true, C.label + ': absent — ' + C.absentWhy);
  for (const v of V.filter((x) => !QUICK || x.quick)) {
    const tag = C.label + ' · ' + v.name + (v.comp ? ' · ' + v.comp : '') + (v.pet && !v.petHidden ? ' · ' + v.pet : '');
    const p = await fresh();
    const fx = v.fx || C.fx;
    const pr = await prep(p, fx, v);
    if (pr.err) { ok(false, tag + ': set up (' + pr.err + ')'); continue; }
    // an absent version is started from its own fixture's side
    let st = v.st, from = v.from;
    if (!st) { const k = fx.at[0] + ',' + fx.at[1]; st = pr.stands.find((q) => q.x + ',' + q.y === k) || pr.stands[0]; from = st ? back(st) : null; }
    if (!st) { ok(false, tag + ': somewhere to start it from'); continue; }
    const ap = await approach(p, st, from, v);
    if (ap.err) { ok(false, tag + ': walk up (' + ap.err + ')'); continue; }
    if (v.petTile) {
      const tile = v.petTile === 'beside' ? await p.evaluate(() => { const W = RB.world.W; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const x = W.player.x + dx, y = W.player.y + dy; if (!RB.maps.blockedStatic(W.map, x, y) && !W.npcs.concat(W.comp ? [W.comp] : []).some((a) => a.x === x && a.y === y)) return [x, y]; } return null; }) : v.petTile;
      const po = tile ? await petOn(p, tile) : { err: 'no tile' };
      ok(!po.err, tag + ': the pet settled on ' + (tile ? tile.join(',') : '—') + (po.err ? ' (' + po.err + ')' : ''));
    }
    const o = { dwell: 40, wanderers: pr.wanderers };
    let r;
    if (v.held) {
      // the key goes down as the scene starts and comes up during it
      const pk = await p.evaluate(() => { const d = RB.world.W.player.dir; return d === 'up' || d === 'down' ? 'ArrowLeft' : 'ArrowUp'; });
      const pos0 = await p.evaluate(() => [RB.world.W.player.x, RB.world.W.player.y]);
      const run = go(p, fx, v, o);
      await wait(p, 60); await p.keyboard.down(pk); await wait(p, 900);
      const mid = await p.evaluate(() => ({ x: RB.world.W.player.x, y: RB.world.W.player.y, running: RB.script.isRunning() }));
      await p.keyboard.up(pk);
      r = await run;
      // (you stay where you stood, or where the scene itself walks you)
      const mine = [pos0].concat(pr.walktos.filter((w) => w[0] === 'pc').map((w) => [w[1], w[2]]));
      ok(mid.running && mine.some((t) => t[0] === mid.x && t[1] === mid.y), tag + ': the held key does not walk you anywhere during the scene (at ' + mid.x + ',' + mid.y + '; yours: ' + mine.map((t) => t.join(',')).join(' ') + ')');
    } else r = await go(p, fx, v, o);
    if (v.interrupt) ok(r.before && (r.before.compMv || r.before.petMoving || (r.before.wanderMv && r.before.wanderMv.length) || (!pr.wanderers.length && !v.comp)), tag + ': it started while someone was still moving (' + JSON.stringify(r.before || {}) + ')');
    checks(tag, fx, r, { pet: v.pet !== undefined ? v.pet : undefined });
    const ic = await inputCheck(p);
    ok(ic.ok, tag + ': no stuck input (' + ic.why + ')');
    if (v.chain && !r.err) {
      // repeat: walk up and talk (or look) again — whatever the story gives now
      const pr2 = await p.evaluate((fx) => { const V2 = window.__V, W = RB.world.W, s = RB.game.s; if (fx.talk) { const a = W.npcs.find((n) => n.id === V2.targetId); if (!a) return { err: V2.targetId + ' has left' }; V2.tiles = [[a.x, a.y]]; } return { ok: true, seen: Object.keys(s.seen).length }; }, fx);
      if (pr2.err) ok(true, tag + ' · repeat: ' + pr2.err + ' (the story moved them on; nothing to repeat here)');
      else {
        const stands2 = await p.evaluate(() => { const V2 = window.__V, W = RB.world.W, m = W.map; const OPP = { up: 'down', down: 'up', left: 'right', right: 'left' }; const out = []; for (const [tx, ty] of V2.tiles) for (const [dir, dx, dy] of [['up', 0, -1], ['down', 0, 1], ['left', -1, 0], ['right', 1, 0]]) { let x = tx + dx, y = ty + dy; const pr = m.props.find((q) => { const pd = RB.props.P[q.p] || {}, w = q.w || pd.w || 1, h = q.h || pd.h || 1; return (q.p === 'counter' || q.across) && x >= q.x && y >= q.y && x < q.x + w && y < q.y + h; }); if (pr) { x += dx; y += dy; } if (RB.maps.blockedStatic(m, x, y) || RB.maps.exitAt(m, x, y) || W.npcs.some((a) => a.x === x && a.y === y)) continue; const froms = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([ex, ey]) => [x + ex, y + ey]).filter(([a, b2]) => !RB.maps.blockedStatic(m, a, b2) && !RB.maps.exitAt(m, a, b2) && !W.npcs.some((n) => n.x === a && n.y === b2) && !V2.tiles.some((t) => t[0] === a && t[1] === b2)); if (froms.length) out.push({ x, y, face: OPP[dir], froms, d: Math.abs(x - W.player.x) + Math.abs(y - W.player.y) }); } return out.sort((a, b2) => a.d - b2.d); });
        const s2 = stands2[0];
        if (!s2) ok(false, tag + ' · repeat: somewhere to talk again from');
        else {
          const ap2 = await approach(p, s2, back(s2), { comp: v.comp });
          if (ap2.err) ok(false, tag + ' · repeat: walk up again (' + ap2.err + ')');
          else {
            const r2 = await go(p, Object.assign({}, fx, { scene: '__any', minLines: 1 }), { picks: [] }, o);
            const ran2 = (r2.ran || []).join(' → ');
            r2.seen = true;
            checks(tag + ' · repeat (' + (ran2 || 'nothing') + (ran2 === fx.scene ? ', the same scene again' : '') + ')', Object.assign({}, fx, { minLines: 1 }), r2, { pet: v.pet });
            const ic2 = await inputCheck(p);
            ok(ic2.ok, tag + ' · repeat: no stuck input (' + ic2.why + ')');
          }
        }
      }
      // revisit: out by the nearest way and back
      const rv = await revisit(p);
      if (rv.err) ok(false, tag + ' · revisit: ' + rv.err);
      else {
        const extra = rv.have.filter((x) => !rv.want.includes(x)), miss = rv.want.filter((x) => !rv.have.includes(x));
        ok(extra.length === 0 && miss.length === 0 && rv.clash.length === 0 && rv.away.length === 0, tag + ' · revisit (out to ' + rv.via + ' and back): the people the story places on ' + rv.map + ' are there, at their places, nobody on another\'s tile' + (extra.length + miss.length + rv.clash.length + rv.away.length ? ' (extra ' + extra.join(',') + ' missing ' + miss.join(',') + ' ' + rv.clash.concat(rv.away).join(' ') + ')' : ''));
        ok(rv.comp === rv.sComp && rv.compGap <= 2 && rv.pet === rv.petShould && rv.petOn.length === 0, tag + ' · revisit: your companion beside you, the pet as it should be (' + rv.compGap + ' tiles; pet ' + rv.pet + (rv.petOn.length ? ' on ' + rv.petOn.join(',') : '') + ')');
        const ic3 = await inputCheck(p);
        ok(ic3.ok, tag + ' · revisit: no stuck input (' + ic3.why + ')');
      }
    }
  }
}
if (cur) { ok(cur.errors.length === 0, 'pages up to run ' + runs + ': no page errors' + (cur.errors.length ? ' — ' + cur.errors.slice(0, 2).join(' | ') : '')); await cur.ctx.close(); }
console.log('Variants: ' + runs + ' runs in ' + ((Date.now() - tStart) / 1000).toFixed(0) + ' s');
await b.close();
srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
