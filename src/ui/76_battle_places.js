/* Battle places (§19 of the battle-art addendum): a battle's backdrop is a
 * glimpse of where it happens, composed in three layers and reproducible from
 * a written origin record.
 *
 *  1. STRUCTURE (never random): indoors or out. A small room is one glancing
 *     view of the whole room: the back wall with its openings, the side walls
 *     receding with theirs, a ladder on its own wall with its hatch open or
 *     shut, stairs keeping their direction (up through a wall or a cliff, down
 *     through the floor, into a side opening), the gear train, shelves, the
 *     millstone. Out of doors and in large halls: the stretch around the
 *     encounter (buildings, the water wheel, water, cliffs, bridges, the
 *     path). Read from the map's props, structures and tiles in their current
 *     state; never moved to another wall or side; a feature may be outside
 *     the crop.
 *  2. LOCAL CONTEXT: the nearest real scenery at the encounter (trees, reeds,
 *     crates, lanterns, rocks…) in its current state: cleared reeds are gone,
 *     a lit lantern is lit, a jammed gear is jammed, a mended bridge whole.
 *  3. DECORATION: a few small themed clusters chosen with the encounter's
 *     cosmetic seed, each given a home on the map (a stretch of back wall, a
 *     floor cell by the wall, a patch of ground) where it is supported, dry,
 *     off the landmarks and not between the party and the creature.
 *
 * ORIGIN RECORD (origin()): the map, the encounter tile, the room or zone,
 * any authored override (a map's `battleView`), the structural anchor ids, the
 * state keys (every conditional thing in view and whether its condition
 * held), the light and the seed. recompose(record) rebuilds the identical
 * composition without the live game state.
 *
 * GEOMETRY is anchored on the actors, never on the overlay's free rectangle:
 * a map column is a fixed number of pixels; out of doors and in halls the
 * encounter's tile lies under the creature; a small room is centred on the
 * formation; floor rows run from the horizon to the party's feet. A larger
 * canvas shows more of the same picture (pixel for pixel where they overlap);
 * panels moving over it change nothing; a resize re-projects the same
 * composition (same seed, same choices, nothing mirrored); a thing that would
 * fall behind a combatant keeps its side and is slid clear, left in shadow,
 * or left out of view.
 *
 * CACHE: the static layer is painted once per (record, actor geometry, size
 * bucket) at the bucket's size; the state keys are part of the record's
 * signature, so a later encounter never shows an old broken version. Ambient
 * motion (dust, snow, glints, turning machinery) is drawn per frame: slow,
 * hushed while you read and at a blow, absent with reduced motion (machinery
 * then rests; its state is drawn either way).
 *
 * Cosmetic randomness uses its own RB.util.rng; nothing here reads or writes
 * battle state or calls Math.random. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.battlePlaces = (function () {
  'use strict';
  const Art = () => RB.battlePlaceArt;
  const hashStr = (s) => RB.util.hashStr(s);
  let counter = 0, forced = null, cur = null, compN = 0, dbg = {};
  const layers = new Map();
  const LAYERS_MAX = 3;
  const costs = { builds: 0, reuse: 0, evicted: 0, lastMs: 0, maxMs: 0 };

  // ---- what each prop is to a backdrop ---------------------------------------------------------
  // landmark: part of the place's structure; context: nearby scenery (a subset,
  // nearest first). tall: stands against the wall and rises; dim: large and
  // quiet enough to stand in shadow behind the creature; wall: hangs on /
  // stands against the back wall; wet: belongs on water.
  const L = (o) => Object.assign({ role: 'landmark' }, o);
  const Cx = (o) => Object.assign({ role: 'context' }, o);
  const ROLE = {
    ladder: L({ paint: 'ladder', wall: 1, tall: 1 }), stairs: L({ paint: 'stairs' }), gears: L({ paint: 'gear', wall: 1, dim: 1 }), hole: L({ paint: 'hole' }),
    millstone: L({ paint: 'prop', dim: 1, big: 1, back: 1 }), millwheel: L({ paint: 'wheel', big: 1 }),
    kiln: L({ paint: 'prop', big: 1, dim: 1 }), co_kilnwall: L({ paint: 'prop', wall: 1, dim: 1 }), co_furnace: L({ paint: 'prop', wall: 1, dim: 1 }),
    bell: L({ paint: 'prop', big: 1, dim: 1 }), lf_bigbell: L({ paint: 'prop', big: 1, dim: 1 }), lf_sunktower: L({ paint: 'prop', big: 1, dim: 1 }),
    telescope: L({ paint: 'prop' }), sb_greatlamp: L({ paint: 'prop', big: 1, dim: 1 }), sb_starchart: L({ paint: 'prop', wall: 1 }),
    shelf: L({ paint: 'prop', wall: 1, tall: 1, dim: 1, row: 1 }), sb_mailshelf: L({ paint: 'prop', wall: 1, dim: 1 }), sg_drawers: L({ paint: 'prop', wall: 1, dim: 1 }), sa_cabinet: L({ paint: 'prop', wall: 1, dim: 1 }),
    pillar: L({ paint: 'prop', tall: 1, dim: 1 }), statue: L({ paint: 'prop' }), sa_statue: L({ paint: 'prop' }), shrine: L({ paint: 'prop', big: 1 }), well: L({ paint: 'prop' }),
    lf_conduit: L({ paint: 'prop', tall: 1, dim: 1 }), sa_pipe: L({ paint: 'prop', wall: 1, tall: 1, dim: 1 }), lf_wheel: L({ paint: 'prop' }), lf_sluicegate: L({ paint: 'prop', big: 1, dim: 1 }), co_sluice: L({ paint: 'prop', big: 1 }),
    sg_lens: L({ paint: 'prop' }), counter: L({ paint: 'prop', wall: 1, dim: 1 }), desk: L({ paint: 'prop' }), noticeboard: L({ paint: 'prop', wall: 1 }), sb_irori: L({ paint: 'prop' }),
    co_stage: L({ paint: 'prop', big: 1 }), sa_gate: L({ paint: 'prop', tall: 1 }), sa_door: L({ paint: 'prop', wall: 1 }), sg_ferry: L({ paint: 'prop', big: 1 }), sg_wreck: L({ paint: 'prop', big: 1 }),
    boat: L({ paint: 'prop', wet: 1 }), tent: L({ paint: 'prop' }), campfire: L({ paint: 'prop' }), co_lookout: L({ paint: 'prop', big: 1 }), sb_icewall: L({ paint: 'prop', wall: 1, dim: 1 }), pier: L({ paint: 'prop' }),
    loom: L({ paint: 'prop' }), stove: L({ paint: 'prop', wall: 1 }), co_beam: L({ paint: 'prop' }), lf_grate: L({ paint: 'prop', wall: 1 }), sb_observatory: L({ paint: 'prop', big: 1 }),
    atlas_waystone: L({ paint: 'prop' }), atlas_stone: L({ paint: 'prop' }), atlas_lamp: L({ paint: 'prop' }), atlas_map: L({ paint: 'prop' }),
    // mechanisms whose state the puzzles change (drawn in their current state)
    door: L({ paint: 'prop', wall: 1 }), lf_lever: L({ paint: 'prop' }), sb_crank: L({ paint: 'prop' }), sb_dial: L({ paint: 'prop' }), lf_padlock: L({ paint: 'prop', wall: 1 }),
    // nearby scenery
    tree: Cx({ group: 'trees' }), orchard: Cx({ group: 'trees' }), pine: Cx({ group: 'trees' }), deadtree: Cx({ group: 'trees' }), bush: Cx({ group: 'bushes' }),
    reeds: Cx({ group: 'reeds' }), rock: Cx({ group: 'rocks' }), fence: Cx({ group: 'fence' }), lamppost: Cx({}), lantern: Cx({}), deadlantern: Cx({}),
    stump: Cx({}), co_scrub: Cx({ group: 'bushes' }), sb_drift: Cx({}), crate: Cx({}), barrel: Cx({}), hay: Cx({}), net: Cx({}), bench: Cx({}), cart: Cx({}),
    bookpile: Cx({}), pot: Cx({}), bottles: Cx({}), glassware: Cx({}), flowerpot: Cx({}), laundry: Cx({}), co_buckets: Cx({}), co_sheaf: Cx({}), co_hoshigaki: Cx({}),
    sb_woodpile: Cx({}), sb_icicles: Cx({ wall: 1 }), stone_marker: Cx({}), crystal: Cx({}), co_ashband: Cx({}), sg_bollard: Cx({}), sg_raft: Cx({ wet: 1 }), co_bunting: Cx({}),
    co_glasslantern: Cx({}), sb_frostlamp: Cx({}), sa_lamp: Cx({}), co_flasks: Cx({}), co_seat: Cx({}), chair: Cx({}), table: Cx({}), smalltable: Cx({}), teaset: Cx({}),
    anvil: Cx({}), snowman: Cx({}), sa_grave: Cx({}), co_tablet: Cx({}), sb_snowobs: Cx({}), co_iceblock: Cx({}), sb_bellpost: Cx({}), sg_stall: Cx({}), co_bar: Cx({}), co_wheel: Cx({}),
    chest: Cx({}), lf_plate: Cx({}),
  };
  const WATER = { water: 1, shallow: 1, darkwater: 1 };
  // props that give light: [height of the light in the sprite (0 top → 1 foot), radius]
  const GLOW = { co_furnace: [0.7, 40], co_kilnwall: [0.65, 38], kiln: [0.7, 44], campfire: [0.6, 30], lantern: [0.4, 26], lamppost: [0.15, 24], co_glasslantern: [0.3, 24], sb_greatlamp: [0.3, 36], sb_frostlamp: [0.3, 20], sa_lamp: [0.25, 22], atlas_lamp: [0.3, 22], stove: [0.6, 22], sb_irori: [0.6, 26] };
  // the ground as a small grid of codes (what each map cell is), for projecting onto the backdrop's ground
  const CELL = { water: 'w', shallow: 'w', darkwater: 'w', bridgeH: 'b', bridgeV: 'b', path: 'p', road: 'p', sand: 's', grass: 'g', flowers: 'g', tallgrass: 'g', field: 'g', snow: 'n', ice: 'n', ash: 'a', paper: 'q', atlas_sketch: 'q', stonefloor: 'o', glass: 'o', wood: 'd', tatami: 'd', carpet: 'd', cliff: 'c', wall: '#', void: '#', atlas_blank: '#' };
  const CODEOF = { meadow: 'g', sand: 's', snow: 'n', ash: 'a', paper: 'q', stone: 'o', earth: 'p', parch: 'q' };
  const GROUNDOF = { grass: 'meadow', flowers: 'meadow', tallgrass: 'meadow', field: 'meadow', sand: 'sand', snow: 'snow', ice: 'snow', ash: 'ash', paper: 'paper', stonefloor: 'stone', path: 'earth', road: 'earth', atlas_sketch: 'parch', wood: 'earth', carpet: 'stone', tatami: 'stone', glass: 'stone' };
  // region of the tile palette for a backdrop family (colours of the same world)
  const FAMREGION = { mill: 'reedwake', kiln: 'cinder', archive: 'archive', observatory: 'snowbell', belltower: 'lanternfall', still: 'sa_still', atlas: 'atlas' };

  // ---- scale (backdrop px, before the actors' whole-number scale) --------------------------------
  const COL = 24;          // a map column at the horizon, out of doors and in halls
  const KL = 1 / 250;      // columns widen toward the viewer (land, halls)
  const KR = 1 / 330;      // … and in rooms
  const WALL_H = 118;      // the back wall from the floor line to the head beam
  const BUCKET = 64;       // layers are painted at the canvas size rounded up to this
  const LOCAL = 10;        // out of doors and in halls: the columns either side of the encounter that are read;
                           // beyond them the view thins into the haze (local context, not every landmark of the map)

  // ---- reading the map ---------------------------------------------------------------------------
  // the condition test: the live campaign by default; recompose() answers from a record
  const liveTest = (cond) => { const s = RB.game && RB.game.s; return !cond || !s || RB.state.test(s, cond); };
  function interiorBounds(m) {
    let xl = m.w, xr = -1, yt = m.h, yb = -1;
    for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
      const t = m.tiles[y * m.w + x];
      if (!t || t.id === 'wall' || t.id === 'void' || t.id === 'atlas_blank') continue;
      if (x < xl) xl = x; if (x > xr) xr = x; if (y < yt) yt = y; if (y > yb) yb = y;
    }
    if (xr < 0) return { xl: 0, xr: m.w - 1, yt: 0, yb: m.h - 1 };
    // a door gap in the outer wall is not part of the room
    if (yb === m.h - 1) yb--;
    if (yt === 0) yt++;
    if (xl === 0) xl++;
    if (xr === m.w - 1) xr--;
    return { xl, xr, yt, yb };
  }
  // The view: which map cells the composition reads, and how. Generous on
  // purpose (a full-viewport canvas may show 13 columns either side); what a
  // frame shows of it is decided by the projection, not here.
  function viewOf(m, where, indoor, bv) {
    const zone = bv && bv.zones ? bv.zones.find((z) => where.x >= z.x0 && where.x <= z.x1 && where.y >= z.y0 && where.y <= z.y1) || null : null;
    const ov = Object.assign({}, bv && bv.view, zone && zone.view);
    let v;
    if (indoor) {
      const b = interiorBounds(m);
      const small = ov.mode ? ov.mode === 'room' : b.xr - b.xl + 1 <= 20 && b.yb - b.yt + 1 <= 16;
      if (small) v = { mode: 'room', x0: b.xl, x1: b.xr, yBack: b.yt, yNear: b.yb, b };
      else {
        // a hall: the part around the encounter, back to the nearest wall ahead
        let yBack = Math.max(b.yt, where.y - 10);
        for (let y = where.y - 1; y >= Math.max(0, where.y - 10); y--) {
          let wall = 0, n = 0;
          for (let x = where.x - 4; x <= where.x + 4; x++) { const t = RB.maps.tileAt(m, x, y); n++; if (!t || t.id === 'wall' || t.id === 'void') wall++; }
          if (wall / n > 0.6) { yBack = y + 1; break; }
        }
        v = { mode: 'hall', x0: where.x - LOCAL, x1: where.x + LOCAL, yBack, yNear: where.y + 4, b };
      }
    } else v = { mode: 'land', x0: where.x - LOCAL, x1: where.x + LOCAL, yBack: where.y - 12, yNear: where.y + 4 };
    for (const k of ['yBack', 'yNear', 'x0', 'x1']) if (ov[k] != null) v[k] = ov[k];
    v.zone = zone ? zone.name : null;
    v.override = ov.mode || ov.yBack != null || ov.x0 != null || ov.x1 != null || ov.yNear != null ? (zone ? 'zone:' + zone.name : 'map') : null;
    return v;
  }
  // depth tier of a thing standing on rows my..my+h-1: 'wall' (against the back wall), 'far', 'mid', 'near'
  function tierOf(v, my, h, where) {
    const yb = my + (h || 1) - 1;
    if (v.mode === 'room' || v.mode === 'hall') {
      if (yb <= v.yBack + (v.mode === 'room' ? 0 : 1)) return 'wall';
      if (yb > v.yNear + 1) return null;
      const t = (my - v.yBack) / Math.max(1, v.yNear - v.yBack);
      return t < 0.62 ? 'mid' : 'near';
    }
    const dy = yb - where.y;
    if (dy <= -4) return dy >= -12 ? 'far' : null;
    if (dy <= 0) return 'mid';
    return dy <= 4 ? 'near' : null;
  }
  const tileId = (m, x, y) => { const t = RB.maps.tileAt(m, x, y); return t ? t.id : 'wall'; };
  const solid = (id) => id === 'wall' || id === 'void' || id === 'atlas_blank';
  // Which way stairs lead: authored (battleView.stairs) where the tiles cannot
  // say; up when they climb through a band of wall or cliff, or into an
  // opening in the back wall right behind them; into a side opening beside
  // them; otherwise down through the floor.
  function stairsDir(m, p, bv, v) {
    const k = p.x + ',' + p.y;
    if (bv && bv.stairs && bv.stairs[k]) return bv.stairs[k];
    const band = (x, y) => { const id = tileId(m, x, y); return id === 'wall' || id === 'cliff' || id === 'void'; };
    const stairsAt = (x, y) => m.props.some((q) => q.p === 'stairs' && q.x === x && q.y === y);
    const side = (dx) => { let x = p.x + dx; while (stairsAt(x, p.y)) x += dx; return band(x, p.y); };
    if (side(-1) && side(1)) return 'up';
    if (v.mode !== 'land' && p.y <= v.yBack && !solid(tileId(m, p.x, p.y - 1))) return 'up';
    if (v.mode === 'room' && v.b && p.x >= v.b.xr && !solid(tileId(m, p.x + 1, p.y))) return 'east';
    if (v.mode === 'room' && v.b && p.x <= v.b.xl && !solid(tileId(m, p.x - 1, p.y))) return 'west';
    return 'down';
  }

  // Survey: everything the composition may use, frame-independent.
  function survey(m, where, setting, test, bv) {
    const indoor = setting ? setting === 'indoor' : RB.render.enclosed(m);
    const v = viewOf(m, where, indoor, bv);
    const land = v.mode === 'land';
    const inView = (x, y, w, h) => x + (w || 1) - 1 >= v.x0 - 1 && x <= v.x1 + 1 && y + (h || 1) - 1 >= v.yBack - (land ? 0 : 1) && y <= v.yNear + 1;
    const items = [], states = [], seen = {};
    // a state key: something in view whose presence or look depends on persistent state
    const st = (key, cond) => { const on = !!test(cond); const k = key + '?' + cond; if (!seen[k]) { seen[k] = 1; states.push({ key, cond, on }); } return on; };
    const push = (it) => { it.tier = it.tier || tierOf(v, it.my, it.h, where); if (it.tier) items.push(it); };
    const wetAt = {};
    for (const p of m.props) {
      if (p.apron) continue;
      const role = ROLE[p.p], wet = p.p === 'lf_flood' || p.p === 'water';
      if (!role && !wet) continue;
      const pd = RB.props.P[p.p];
      const w = p.w || (pd && pd.w) || 1, h = p.h || (pd && pd.h) || 1;
      if (!inView(p.x, p.y, w, h)) continue;
      if (p.if && !st('prop:' + p.p + '@' + p.x + ',' + p.y, p.if)) continue;
      if (wet) { wetAt[p.x + ',' + p.y] = 1; continue; }
      const it = { src: 'prop', id: p.p, kind: role.role, role, mx: p.x, my: p.y, w, h, o: p.o || null, at: p.x + ',' + p.y };
      if (p.p === 'stairs') it.dir = stairsDir(m, p, bv, v);
      if (p.p === 'ladder') {
        const a = (bv && bv.ladders && bv.ladders[it.at]) || {};
        it.ladder = { rope: !!a.rope, hatch: a.hatch ? (st('view:hatch@' + it.at, a.hatch) ? 'open' : 'shut') : 'open' };
      }
      push(it);
    }
    // buildings (out of doors): the south face shows
    for (const s of m.structs || []) {
      if (!inView(s.x, s.y, s.w, s.h)) continue;
      if (s.if && !st('struct:building@' + s.x + ',' + s.y, s.if)) continue;
      push({ src: 'struct', id: 'building', kind: 'landmark', role: { paint: 'facade', big: 1 }, mx: s.x, my: s.y, w: s.w, h: s.h, st: s, at: s.x + ',' + s.y });
    }
    // tiles: ground under and around the encounter, water, cliffs, bridges, the path
    const cols = {}, ground = {};
    const isWater = (x, y) => WATER[tileId(m, x, y)] || wetAt[x + ',' + y];
    for (let y = v.yBack - 1; y <= v.yNear + 1; y++) for (let x = v.x0; x <= v.x1; x++) {
      const t = RB.maps.tileAt(m, x, y);
      if (!t) continue;
      const tier = tierOf(v, y, 1, where) || (y < v.yBack ? 'far' : null);
      if (!tier) continue;
      const c = cols[x] = cols[x] || {};
      if (isWater(x, y)) (c.water = c.water || {})[tier] = (c.water[tier] || 0) + 1;
      if (t.id === 'cliff') (c.cliff = c.cliff || {})[tier] = 1;
      if ((t.id === 'bridgeH' || t.id === 'bridgeV') && !wetAt[x + ',' + y]) (c.bridge = c.bridge || {})[tier] = t.id;
      if (t.id === 'path' || t.id === 'road') (c.path = c.path || {})[tier] = 1;
      if (Math.abs(x - where.x) <= 3 && Math.abs(y - where.y) <= 3 && GROUNDOF[t.id]) ground[GROUNDOF[t.id]] = (ground[GROUNDOF[t.id]] || 0) + 1;
    }
    // the grid of ground codes over the view (rows from behind the back plane to behind the viewer)
    const gy0 = v.yBack - 1, gy1 = v.yNear + 2, rows = [];
    for (let y = gy0; y <= gy1; y++) {
      let row = '';
      for (let x = v.x0; x <= v.x1; x++) { const t = RB.maps.tileAt(m, x, y); row += wetAt[x + ',' + y] ? 'w' : t ? CELL[t.id] || '.' : '#'; }
      rows.push(row);
    }
    const grid = { x0: v.x0, y0: gy0, rows };
    // group columns into runs: water bodies, cliff ridges, bridges, paths
    const runs = (key, tiers) => {
      const out = [];
      let open = null;
      for (let x = v.x0; x <= v.x1 + 1; x++) {
        const c = cols[x], on = c && c[key] && tiers.some((t) => c[key][t]);
        if (on && !open) open = { x0: x, x1: x, tiers: {} };
        if (on) { open.x1 = x; for (const t of tiers) if (c[key][t]) open.tiers[t] = (open.tiers[t] || 0) + 1; }
        if (!on && open) { out.push(open); open = null; }
      }
      return out;
    };
    for (const r of runs('water', ['far', 'mid', 'near', 'wall'])) push({ src: 'tiles', id: 'water', kind: 'landmark', role: { paint: 'water' }, mx: r.x0, my: where.y, w: r.x1 - r.x0 + 1, h: 1, tiers: r.tiers, tier: r.tiers.mid || r.tiers.near ? 'mid' : 'far', at: r.x0 + '-' + r.x1 });
    if (land) for (const r of runs('cliff', ['far'])) if (r.x1 - r.x0 >= 1) push({ src: 'tiles', id: 'cliffs', kind: 'landmark', role: { paint: 'rocks' }, mx: r.x0, my: where.y - 6, w: r.x1 - r.x0 + 1, h: 1, tier: 'far', at: r.x0 + '-' + r.x1 });
    for (const r of runs('bridge', ['far', 'mid', 'near', 'wall'])) push({ src: 'tiles', id: 'bridge', kind: 'landmark', role: { paint: 'bridge' }, mx: r.x0, my: where.y - 3, w: r.x1 - r.x0 + 1, h: 1, tier: 'mid', at: r.x0 + '-' + r.x1 });
    if (land) {
      // a path that leads from the encounter toward the back of the scene
      const pr = runs('path', ['mid']), pf = runs('path', ['far']);
      if (pr.length && pf.length) {
        const near = pr.reduce((a, b) => (Math.abs(b.x0 - where.x) < Math.abs(a.x0 - where.x) ? b : a));
        const far = pf.reduce((a, b) => (Math.abs(b.x0 - near.x0) < Math.abs(a.x0 - near.x0) ? b : a));
        items.push({ src: 'tiles', id: 'path', kind: 'context', role: { paint: 'path' }, mx: near.x0, my: where.y, w: near.x1 - near.x0 + 1, h: 1, mx2: (far.x0 + far.x1 + 1) / 2, tier: 'mid', at: near.x0 + '→' + far.x0 });
      }
    } else {
      // openings in the back wall: exits, or floor running on through the top wall row
      const yw = v.yBack - 1;
      let open = null;
      for (let x = v.x0; x <= v.x1 + 1; x++) {
        const gap = x <= v.x1 && !solid(tileId(m, x, yw));
        if (gap && !open) open = { x0: x, x1: x };
        if (gap) open.x1 = x;
        if (!gap && open) { push({ src: 'tiles', id: 'doorway', kind: 'landmark', role: { paint: 'doorway', wall: 1, tall: 1 }, mx: open.x0, my: v.yBack, w: open.x1 - open.x0 + 1, h: 1, tier: 'wall', at: open.x0 + ',' + yw }); open = null; }
      }
      // a small room's side walls: their openings (doors, passages) at the rows where they are
      if (v.mode === 'room') for (const [side, xw] of [['W', v.x0 - 1], ['E', v.x1 + 1]]) {
        let o2 = null;
        for (let y = v.yBack; y <= v.yNear + 1; y++) {
          const gap = y <= v.yNear && !solid(tileId(m, xw, y));
          if (gap && !o2) o2 = { y0: y, y1: y };
          if (gap) o2.y1 = y;
          if (!gap && o2) { push({ src: 'tiles', id: 'opening', kind: 'landmark', role: { paint: 'side' }, side, mx: xw, my: o2.y0, w: 1, h: o2.y1 - o2.y0 + 1, tier: tierOf(v, o2.y0, 1, where) || 'mid', at: xw + ',' + o2.y0 + '-' + o2.y1 }); o2 = null; }
        }
      }
    }
    // the ground the encounter stands on
    let groundKind = null, best = 0;
    for (const k in ground) if (ground[k] > best) { best = ground[k]; groundKind = k; }
    return { v, indoor, items, ground: groundKind, grid, states, wetAt };
  }

  // Windows: light comes from the building's windows behind the viewer (the
  // front of the building whose door leads into this room).
  function frontOf(mapId) {
    for (const id in RB.content.maps) for (const st of RB.content.maps[id].structs || []) if (st.to === mapId) return Object.assign({ map: id }, st);
    return null;
  }
  // the map's light as the world shows it now (maps may have an evening or night variant): a state key
  function ambientOf(id, def, test, states) {
    const alt = def.alt || [];
    for (let i = 0; i < alt.length; i++) {
      const on = !!test(alt[i].if);
      states.push({ key: 'light:' + id + '#' + i, cond: alt[i].if, on });
      if (on) return { ambient: alt[i].ambient || {}, night: alt[i].night, alt: i };
    }
    return { ambient: def.ambient || {}, night: def.night, alt: null };
  }

  // ---- composing: structure and context (fixed), accessories (seeded) ------------------------------
  // Accessory clusters per family: members are ACC sprites ('a:') or world
  // props ('w:'), with offsets (dx, dy) from the cluster's anchor. zone: base
  // (on the floor by the back wall), hang (on the wall, under the beam), beam
  // (hung from the beam), corner (where wall and beam meet), fore (the near
  // floor or ground), side (the floor beside the creature's line).
  // needs: a condition on the place.
  const CL = {
    sacks: { zone: 'base', w: 30, items: [['a:sack', 0, 0, 0], ['a:sack', 11, -2, 2], ['a:flour', 4, 2, 0]] },
    sacks2: { zone: 'base', w: 34, items: [['a:sackLie', 0, 0, 0], ['a:sack', 16, -1, 1]] },
    lanternCrate: { zone: 'base', w: 30, light: 1, items: [['w:crate', 0, 0, 0], ['a:lamp', 2, -22, 0]] },
    storage: { zone: 'base', w: 44, items: [['w:barrel', 0, 0, 0], ['w:crate', 24, 1, 1]] },
    rope: { zone: 'base', w: 28, items: [['a:rope', 0, 0, 0], ['a:bucket', 15, -1, 0]] },
    tools: { zone: 'hang', w: 30, items: [['a:pegs', 0, 0, 0]] },
    broom: { zone: 'base', w: 12, items: [['a:broom', 0, 0, 0]] },
    scrolls: { zone: 'hang', w: 36, rail: 1, items: [['a:scroll', -12, 0, 0], ['a:scroll', 2, 0, 1], ['a:scroll', 16, 0, 2]] },
    scroll1: { zone: 'hang', w: 14, items: [['a:scroll', 0, 0, 1]] },
    hangLamp: { zone: 'beam', w: 12, light: 1, items: [['a:hangLamp', 0, 0, 0]] },
    baskets: { zone: 'base', w: 28, items: [['a:basket', 0, 0, 0], ['a:jar', 13, -1, 0]] },
    grain: { zone: 'base', w: 30, items: [['a:basket', 0, 0, 0], ['a:sack', 14, -1, 1]] },
    hay: { zone: 'base', w: 40, items: [['w:hay', 0, 0, 0], ['a:sackLie', 20, 2, 0]] },
    cobweb: { zone: 'corner', w: 14, extra: 1, items: [['a:cobweb', 0, 0, 0]] },
    shelf: { zone: 'hang', w: 36, items: [['a:shelfJars', 0, 0, 0]] },
    stool: { zone: 'base', w: 26, items: [['a:stool', 0, 0, 0], ['a:candle', 0, -10, 0]], light: 1 },
    pots: { zone: 'base', w: 30, items: [['a:pots', 0, 0, 0], ['a:jar', 15, 0, 0]] },
    firewood: { zone: 'base', w: 24, items: [['a:firewood', 0, 0, 1]] },
    buckets: { zone: 'base', w: 26, items: [['w:co_buckets', 0, 0, 0]] },
    ash: { zone: 'fore', w: 18, items: [['a:ashpile', 0, 0, 0]] },
    books: { zone: 'base', w: 28, items: [['a:books', 0, 0, 0], ['a:books', 13, 1, 1]] },
    pages: { zone: 'fore', w: 22, items: [['a:pages', 0, 0, 0]] },
    papers: { zone: 'base', w: 30, items: [['a:papers', 0, 0, 0], ['a:inkpot', 14, 0, 0]] },
    candles: { zone: 'base', w: 30, light: 1, items: [['w:crate', 0, 0, 2], ['a:candle', -3, -22, 0], ['a:candle', 5, -21, 0]] },
    puddle: { zone: 'fore', w: 24, needs: 'wet', items: [['a:puddle', 0, 0, 0]] },
    charts: { zone: 'base', w: 30, items: [['a:charts', 0, 0, 0], ['a:books', 16, 0, 1]] },
    // out of doors
    tufts: { zone: 'fore', w: 30, items: [['a:tuft', 0, 0, 0], ['a:tuft', 10, 2, 1], ['a:tuft', 19, 0, 0]] },
    flowers: { zone: 'fore', w: 28, needs: 'green', items: [['a:flowers', 0, 0, 0], ['a:tuft', 12, 1, 0], ['a:flowers', 20, -1, 1]] },
    pebbles: { zone: 'fore', w: 26, items: [['a:pebbles', 0, 0, 0], ['a:stone', 14, -1, 0]] },
    mushrooms: { zone: 'fore', w: 22, needs: 'trees', items: [['a:mushrooms', 0, 0, 0], ['a:tuft', 11, 1, 0]] },
    reedtufts: { zone: 'fore', w: 26, needs: 'water', items: [['a:tuft', 0, 0, 2], ['a:tuft', 9, 1, 2], ['a:tuft', 17, 0, 2]] },
    logs: { zone: 'side', w: 26, items: [['a:logs', 0, 0, 0]] },
    leaves: { zone: 'fore', w: 34, items: [['a:leaves', 0, 0, 0], ['a:leaves', 14, 2, 1]] },
    shells: { zone: 'fore', w: 22, needs: 'sand', items: [['a:shell', 0, 0, 0]] },
    snow: { zone: 'fore', w: 34, items: [['a:snowclump', 0, 0, 0], ['a:twigs', 16, 1, 0]] },
    stone: { zone: 'side', w: 18, items: [['a:stone', 0, 0, 0], ['a:tuft', 9, 1, 0]] },
  };
  const POOLS = {
    mill: ['sacks', 'sacks2', 'lanternCrate', 'storage', 'rope', 'tools', 'broom', 'scrolls', 'scroll1', 'hangLamp', 'baskets', 'grain', 'hay', 'shelf', 'cobweb'],
    interior: ['lanternCrate', 'storage', 'rope', 'scrolls', 'books', 'baskets', 'stool', 'shelf', 'cobweb'],
    kiln: ['pots', 'firewood', 'buckets', 'ash', 'lanternCrate', 'rope', 'sacks2', 'baskets', 'tools', 'shelf'],
    archive: ['books', 'pages', 'papers', 'candles', 'puddle', 'scroll1', 'lanternCrate', 'cobweb', 'stool'],
    observatory: ['charts', 'books', 'papers', 'candles', 'stool', 'scroll1', 'storage', 'cobweb'],
    belltower: ['papers', 'books', 'lanternCrate', 'storage', 'rope', 'candles', 'scroll1', 'pages', 'hangLamp'],
    still: ['pages', 'books', 'papers', 'candles', 'pages'],
    reedwake: ['tufts', 'flowers', 'pebbles', 'mushrooms', 'reedtufts', 'logs', 'stone'],
    saltglass: ['tufts', 'pebbles', 'shells', 'stone', 'reedtufts', 'logs'],
    cinder: ['leaves', 'pebbles', 'tufts', 'stone', 'logs', 'ash'],
    snowbell: ['snow', 'pebbles', 'stone', 'logs'],
    lanternfall: ['flowers', 'pebbles', 'leaves', 'tufts', 'stone'],
    atlas: ['tufts', 'pebbles', 'stone', 'pages'],
    stillOut: ['pages', 'pebbles', 'stone'],
  };
  const ON_WALL = { hang: 1, beam: 1, corner: 1 };

  function familyOf(key, setting) {
    if (key === 'still') return setting === 'indoor' ? 'stillIn' : 'stillOut';
    return key;
  }
  // A home for a decorative cluster, on the map: a stretch of back wall
  // (hang, beam, corner) or a floor / ground cell (base: by the back wall;
  // side: about the creature's line; fore: nearer the viewer), on the
  // cluster's side of the scene, supported (a wall that is wall, a floor that
  // is dry), off every prop and building and a cell clear of the landmarks,
  // and apart from the other clusters. Returns { at, x, y, wall, alts }: the
  // seeded pick, and the alternatives tried in order when a frame puts it
  // behind an actor (the rest of its side by preference, then the other
  // side's) — or null. One rng draw whatever happens.
  function homeFor(k, side, comp, sv, m, rng, used) {
    const cl = CL[k], v = comp.view, room = v.mode !== 'land';
    const draw = rng();
    if (ON_WALL[cl.zone] && !room) return null;
    const ref = v.mode === 'room' ? (v.x0 + v.x1 + 1) / 2 : comp.x + 0.5;
    const occupied = {};
    for (const p of m.props) { if (p.apron || p.auto) continue; const pd = RB.props.P[p.p]; const w = p.w || (pd && pd.w) || 1, h = p.h || (pd && pd.h) || 1; for (let y = p.y; y < p.y + h; y++) for (let x = p.x; x < p.x + w; x++) occupied[x + ',' + y] = 1; }
    for (const s of m.structs || []) for (let y = s.y; y < s.y + s.h; y++) for (let x = s.x; x < s.x + s.w; x++) occupied[x + ',' + y] = 1;
    const near = (x, y, r, fn) => { for (let yy = y - r; yy <= y + r; yy++) for (let xx = x - r; xx <= x + r; xx++) if (fn(xx, yy)) return true; return false; };
    const lmCell = {};
    for (const it of sv.items) if (it.kind === 'landmark' && it.src !== 'tiles') for (let y = it.my; y < it.my + it.h; y++) for (let x = it.mx; x < it.mx + it.w; x++) lmCell[x + ',' + y] = 1;
    const wet = (x, y) => { const id = tileId(m, x, y); return !!WATER[id] || id === 'bridgeH' || id === 'bridgeV' || !!sv.wetAt[x + ',' + y]; };
    const wallLm = sv.items.filter((it) => it.tier === 'wall' && it.kind === 'landmark');
    const candsOn = (sd) => {
      const sideOK = (c) => (sd === 'L' ? c + 0.5 < ref : c + 0.5 > ref);
      const out = [];
      if (ON_WALL[cl.zone]) {
        const yw = v.yBack - 1;
        const xs = cl.zone === 'corner' ? [v.mode === 'room' ? v.x0 : Math.max(v.x0, comp.x - 10)] : [];
        if (cl.zone !== 'corner') for (let x = v.x0 + 1; x <= v.x1 - 1; x++) xs.push(x);
        for (const x of xs) {
          if (!solid(tileId(m, x, yw))) continue; // an opening, not a wall
          if (cl.zone !== 'corner' && !sideOK(x)) continue;
          if (wallLm.some((it) => x >= it.mx - 1 && x <= it.mx + it.w)) continue;
          if (used.some((u) => u.wall && Math.abs(u.x - x) < 3)) continue;
          out.push({ x, y: yw, wall: true, pref: Math.abs(x + 0.5 - ref) });
        }
        out.sort((a, b) => (cl.zone === 'beam' ? a.pref - b.pref : b.pref - a.pref) || a.x - b.x);
        return out;
      }
      let rows;
      if (room) rows = cl.zone === 'base' ? [v.yBack] : cl.zone === 'side' ? [Math.round((v.yBack + v.yNear) / 2), v.yBack + 1] : [v.yNear - 1, v.yNear];
      else rows = cl.zone === 'base' ? [comp.y - 3, comp.y - 2] : cl.zone === 'side' ? [comp.y - 1, comp.y] : [comp.y + 1, comp.y + 2];
      const x0 = v.mode === 'room' ? v.x0 : comp.x - LOCAL + 1, x1 = v.mode === 'room' ? v.x1 : comp.x + LOCAL - 1;
      const cells = [];
      for (const y of rows) for (let x = x0; x <= x1; x++) cells.push([x, y, 0]);
      // in a small room, also the floor along its side walls (after the main rows)
      if (v.mode === 'room') {
        const ya = cl.zone === 'fore' ? Math.round((v.yBack + v.yNear) / 2) : v.yBack + 1, yb = cl.zone === 'base' ? Math.round((v.yBack + v.yNear) / 2) : v.yNear;
        for (let y = ya; y <= yb; y++) for (const x of [v.x0, v.x1]) if (!rows.includes(y)) cells.push([x, y, 40 + Math.abs(y - ya)]);
      }
      for (const [x, y, extra] of cells) {
        const id = tileId(m, x, y);
        if (solid(id) || id === 'cliff' || wet(x, y) || occupied[x + ',' + y] || !sideOK(x)) continue;
        if (near(x, y, 1, (xx, yy) => lmCell[xx + ',' + yy])) continue;
        if (!room && Math.abs(x - comp.x) < 3) continue; // not under the creature
        if (cl.needs === 'water' && !near(x, y, 1, wet)) continue;
        if (cl.needs === 'sand' && id !== 'sand') continue;
        if (cl.needs === 'green' && GROUNDOF[id] !== 'meadow') continue;
        if (cl.needs === 'trees' && !near(x, y, 3, (xx, yy) => m.props.some((q) => q.x === xx && q.y === yy && ROLE[q.p] && ROLE[q.p].group === 'trees'))) continue;
        if (used.some((u) => !u.wall && Math.abs(u.y - y) <= 1 && Math.abs(u.x - x) < 3)) continue;
        // a sweet spot: off to the side of the actors, not at the far edge of the view
        const off = Math.abs(x + 0.5 - ref), pref = room ? Math.abs(off - (v.x1 - v.x0) * 0.32) : Math.abs(off - 6);
        out.push({ x, y, pref: pref + Math.max(0, y - rows[0]) * 0.5 + extra });
      }
      out.sort((a, b) => a.pref - b.pref || a.y - b.y || a.x - b.x);
      return out;
    };
    const mine = candsOn(side);
    if (!mine.length) return null;
    const pick = mine[Math.floor(draw * Math.min(4, mine.length))];
    used.push(pick);
    const others = cl.zone === 'corner' ? [] : candsOn(side === 'L' ? 'R' : 'L');
    const alts = mine.filter((c) => c !== pick).concat(others).slice(0, 16);
    return { at: (pick.wall ? 'wall:' : '') + pick.x + ',' + pick.y, x: pick.x, y: pick.y, wall: !!pick.wall, alts: alts.map((c) => ({ x: c.x, y: c.y })) };
  }

  // Compose the place for an encounter. o.test: the condition test (the live
  // campaign by default). Structure, context and state are seed-independent;
  // only the accessories (which clusters, their variants, their homes) are seeded.
  function compose(enemy, where, seed, o) {
    o = o || {};
    const test = o.test || liveTest;
    const key = enemy.bgKey || enemy.bg || enemy.region || 'reedwake';
    let m = null;
    try { m = where && RB.content.maps[where.map] ? RB.maps.compile(where.map) : null; } catch (e) { m = null; }
    const out = { id: ++compN, key, seed: seed >>> 0, where: where || null, map: where ? where.map : null, x: where ? where.x : null, y: where ? where.y : null, enemy: enemy.id || null, setting: enemy.setting || null };
    if (!m) { out.fallback = 'no map data for this encounter: the region backdrop'; out.states = []; out.sig = 'fallback|' + key; return out; }
    const bv = m.def.battleView || null;
    const sv = survey(m, where, enemy.setting, test, bv);
    const setting = enemy.setting || (sv.indoor ? 'indoor' : 'outdoor');
    out.setting = setting;
    out.fam = familyOf(key, setting);
    out.indoor = setting === 'indoor';
    out.region = m.region === 'interior' ? (FAMREGION[key] || 'reedwake') : m.region;
    out.palRegion = RB.tiles.PAL[out.region] ? out.region : (FAMREGION[key] || 'reedwake');
    out.view = sv.v;
    out.small = sv.v.mode === 'room';
    out.ground = sv.ground;
    out.grid = sv.grid;
    out.note = bv && bv.note || null;
    const states = sv.states;
    // the map's light as the world shows it now
    const amb = ambientOf(m.id, m.def, test, states);
    out.dark = amb.ambient.dark || 0;
    out.tint = amb.ambient.tint || null;
    out.weather = amb.ambient.weather || null;
    out.front = out.indoor ? frontOf(m.id) : null;
    // daylight through the front windows: only when it is not night outside
    const outside = out.front && out.front.map ? RB.content.maps[out.front.map] : null;
    out.night = !!(amb.night || (outside && ambientOf(out.front.map, outside, test, states).night));
    out.light = out.night ? 'night' : out.dark >= 0.35 ? 'dusk' : 'day';
    // structure: every landmark in view; context: the nearest few per kind
    const lm = sv.items.filter((it) => it.kind === 'landmark');
    const ctx = sv.items.filter((it) => it.kind === 'context');
    const dist = (it) => Math.abs(it.mx + (it.w || 1) / 2 - 0.5 - where.x) + Math.abs(it.my + (it.h || 1) - 1 - where.y) * 0.8;
    ctx.sort((a, b) => dist(a) - dist(b) || a.mx - b.mx || a.my - b.my);
    const keep = [], perKind = {};
    // far scenery of a kind (trees, bushes, reeds, rocks, fences) is kept whole: it becomes a line on the horizon
    const LINE = { trees: 1, bushes: 1, reeds: 1, rocks: 1, fence: 1 };
    out.lines = ctx.filter((it) => it.tier === 'far' && LINE[it.role.group]).map((it) => ({ group: it.role.group, mx: it.mx + (it.w || 1) / 2, from: it.src + ':' + it.id + '@' + it.at }));
    for (const it of ctx) {
      if (it.tier === 'far' && LINE[it.role.group]) continue;
      const g = it.role.group || it.id;
      const lim = it.role.group === 'trees' ? 8 : it.role.group ? 6 : 2;
      if ((perKind[g] || 0) >= lim) continue;
      perKind[g] = (perKind[g] || 0) + 1;
      keep.push(it);
      if (keep.length >= 20) break;
    }
    // shelves standing in rows read as one bookcase wall at the back: one per column
    const seenCol = {};
    out.structure = lm.filter((it) => { if (!it.role.row) return true; const k = it.id + '@' + it.mx; if (seenCol[k]) return false; seenCol[k] = 1; return true; });
    out.context = keep;
    // what is here (for the accessories' conditions, the ambient and the record)
    const has = {};
    for (const it of sv.items) { has[it.id] = true; if (it.role && it.role.group) has[it.role.group] = true; }
    has.green = sv.ground === 'meadow' || out.palRegion === 'reedwake' || out.palRegion === 'lanternfall';
    has.wet = !!has.water || out.key === 'archive';
    has.sand = sv.ground === 'sand';
    out.has = has;
    out.zone = zoneName(out, sv);
    // state keys (sorted, so the record does not depend on the order of the map's props)
    out.states = states.slice().sort((a, b) => (a.key + a.cond < b.key + b.cond ? -1 : 1));
    // accessories: seeded, bounded, themed, each with a home on the map
    const rng = RB.util.rng(seed ^ 0x5bd1e995);
    const poolKey = out.fam === 'stillIn' ? 'still' : out.fam === 'stillOut' ? 'stillOut' : POOLS[out.fam] ? out.fam : out.indoor ? 'interior' : 'reedwake';
    const pool = POOLS[poolKey].filter((k, i, a) => a.indexOf(k) === i && (!CL[k].needs || has[CL[k].needs]));
    const onWall = (k) => !!ON_WALL[CL[k].zone];
    const roomish = out.view.mode !== 'land';
    const wallPool = rng.shuffle(pool.filter((k) => onWall(k) && !CL[k].extra)), floorPool = rng.shuffle(pool.filter((k) => !onWall(k)));
    const extras = pool.filter((k) => CL[k].extra && rng() < 0.5);
    // indoors one or two on the wall and two or three on the floor; out of doors three or four on the ground
    const chosen = roomish ? wallPool.slice(0, 1 + rng.int(2)).concat(floorPool.slice(0, 2 + rng.int(2)), extras) : floorPool.slice(0, 3 + rng.int(2));
    let lights = 0;
    const used = [];
    out.accessories = [];
    chosen.forEach((k, i) => {
      if (CL[k].light && ++lights > 1) return;
      const side = (i + (seed & 1)) % 2 ? 'L' : 'R';
      const variant = rng.int(3);
      const home = homeFor(k, side, out, sv, m, rng, used) || homeFor(k, side === 'L' ? 'R' : 'L', out, sv, m, rng, used);
      out.accessories.push({ cluster: k, zone: CL[k].zone, side, order: i, variant, home });
    });
    out.sig = hashStr(JSON.stringify([out.map, out.x, out.y, out.key, out.fam, out.seed, out.view.mode, out.view.x0, out.view.x1, out.view.yBack, out.states.map((s) => s.key + '?' + s.cond + '=' + (s.on ? 1 : 0))])).toString(36);
    return out;
  }
  function zoneName(o, sv) {
    if (o.indoor) return (o.small ? 'room' : 'hall') + ':' + o.key + (sv.v.zone ? ':' + sv.v.zone : '');
    const h = {};
    for (const it of sv.items) h[it.id] = h[it.id] || it.tier;
    const parts = [];
    if (sv.items.some((it) => it.id === 'water' && (it.tiers.mid || it.tiers.near))) parts.push('waterside');
    else if (sv.items.some((it) => it.id === 'water')) parts.push('water-beyond');
    if (sv.items.some((it) => it.id === 'building' && it.tier !== 'far')) parts.push('by-building');
    if (h.millwheel) parts.push('mill');
    if (sv.items.some((it) => it.role && it.role.group === 'trees' && it.tier !== 'far')) parts.push('trees');
    if (h.cliffs) parts.push('cliffs');
    if (sv.ground === 'sand') parts.push('shore');
    return (parts.length ? parts.join('+') : 'open') + ':' + (sv.ground || o.key);
  }

  // ---- the origin record --------------------------------------------------------------------------
  // Everything needed to rebuild the composition, JSON-safe and frame-free.
  function originOf(c) {
    if (!c) return null;
    const v = c.view;
    return {
      v: 1,
      map: c.map, x: c.x, y: c.y, enemy: c.enemy, key: c.key, fam: c.fam || null, setting: c.setting || null,
      fallback: c.fallback || null,
      zone: c.zone || null,
      view: v ? { mode: v.mode, x0: v.x0, x1: v.x1, yBack: v.yBack, yNear: v.yNear, room: v.b && v.mode === 'room' ? v.b : null, zone: v.zone || null } : null,
      facing: 'north',
      override: v ? v.override : null,
      note: c.note || null,
      anchors: (c.structure || []).map((it) => it.src + ':' + it.id + '@' + it.at + (it.dir ? '>' + it.dir : '') + (it.ladder ? '>' + (it.ladder.rope ? 'rope,' : '') + 'hatch-' + it.ladder.hatch : '')),
      context: (c.context || []).map((it) => it.src + ':' + it.id + '@' + it.at),
      lines: (c.lines || []).map((l) => l.from),
      state: (c.states || []).map((s) => s.key + '?' + s.cond + '=' + (s.on ? 1 : 0)),
      light: c.light || null,
      seed: c.seed,
      accessories: (c.accessories || []).map((a) => ({ id: a.cluster, zone: a.zone, side: a.side, variant: a.variant, at: a.home ? a.home.at : null })),
      sig: c.sig,
    };
  }
  // Rebuild a composition from its record alone: the conditions are answered
  // from the record's state keys (a condition not in the record is false).
  function recompose(rec) {
    const ans = {};
    for (const s of rec.state || []) { const m = /^(.*)\?(.*)=([01])$/.exec(s); if (m) ans[m[2]] = m[3] === '1'; }
    const e = Object.assign({ id: rec.enemy }, RB.content.enemies[rec.enemy] || {}, { bgKey: rec.key, setting: rec.setting });
    return compose(e, rec.map ? { map: rec.map, x: rec.x, y: rec.y } : null, rec.seed, { test: (cond) => !cond || !!ans[cond] });
  }

  // ---- the creature's real width -------------------------------------------------------------------------
  // Scanned once per creature from its own frames (every pose), so the keep-out
  // box hugs the drawing instead of its canvas.
  const boxes = new Map();
  function artBox(id, o) {
    const E = RB.enemyArt;
    if (!E || !E.P || !E.P[id] || typeof E.frame !== 'function') return null;
    const key = id + '|' + JSON.stringify(o || {});
    if (boxes.has(key)) return boxes.get(key);
    const spec = E.P[id];
    let x0 = 1e9, x1 = -1e9;
    for (let f = 0; f < (spec.frames || 1); f++) {
      const cv = E.frame(id, f, o || {});
      if (!cv) continue;
      const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
      for (let y = 0; y < cv.height; y += 2) for (let x = 0; x < cv.width; x++) if (d[(y * cv.width + x) * 4 + 3] > 24) { if (x < x0) x0 = x; if (x > x1) x1 = x; }
    }
    const box = x1 < 0 ? null : { l: spec.ox - x0, r: x1 - spec.ox };
    boxes.set(key, box);
    return box;
  }

  // ---- geometry: where the actors are (never the overlay's free rectangle) ---------------------------
  const inter = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
  const rect = (x, y, w, h) => ({ x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h) });
  // F: { ex, ey, ext, scale, ps, px, py, party, creatures, art } from the stage's
  // arrangement (canvas px). F.S (the overlay's free rectangle) is accepted and ignored.
  function geometry(F, w, h, hz, box) {
    const u = Math.max(1, Math.round(F.scale || 1));
    const W = Math.ceil(w / u), H = Math.ceil(h / u);
    const sc = (F.scale || 1) / u, ps = (F.ps || F.scale || 1) / u;
    const ex = F.ex / u, ey = F.ey / u;
    const ab = box || { l: 92, r: 92 };
    const top = F.ext ? F.ext.top : -96, bot = F.ext ? F.ext.bottom : 90;
    // the creature: its drawing, its shadow and its knots, with room to move
    const hl = Math.max(ab.l, 72) * sc + 10, hr = Math.max(ab.r, 72) * sc + 10;
    const cy1 = Math.max(ey + bot * sc, ey + (88 + 26) * sc + 12 / u);
    let C = rect(ex - hl, ey + top * sc - 6, hl + hr, cy1 - (ey + top * sc) + 10);
    let Cs = null;
    if (F.creatures && F.creatures.length > 1) {
      Cs = F.creatures.map((k) => {
        const b = (k.art && artBox(k.art, k.artOpts || {})) || { l: -(k.ext ? k.ext.left : -80), r: k.ext ? k.ext.right : 80 };
        const kx = k.ex / u, ky = k.ey / u, t = k.ext ? k.ext.top : -96, bt = k.ext ? k.ext.bottom : 90;
        const l = Math.max(b.l, 40) * sc + 8, r = Math.max(b.r, 40) * sc + 8;
        const y1 = Math.max(ky + bt * sc, ky + (62 + 22) * sc + 10 / u);
        return rect(kx - l, ky + t * sc - 6, l + r, y1 - (ky + t * sc) + 8);
      });
      const x0 = Math.min(...Cs.map((q) => q.x)), y0 = Math.min(...Cs.map((q) => q.y));
      const x1 = Math.max(...Cs.map((q) => q.x + q.w)), y1 = Math.max(...Cs.map((q) => q.y + q.h));
      C = rect(x0, y0, x1 - x0, y1 - y0);
    }
    // the party: the stage's box round you, your companion and the pet, with room for gestures and seals above
    let P;
    if (F.party) P = rect(F.party.x / u - 6, F.party.y / u - 18, F.party.w / u + 12, F.party.h / u + 26);
    else { const px = F.px / u, py = F.py / u; P = rect(px - 10, py + 48 * ps - 118 * ps, 156 * ps, 118 * ps + 14); }
    const feetP = F.py != null ? Math.round((F.py + 48 * (F.ps || F.scale || 1)) / u) : P.y + P.h - 10;
    const feetC = Math.round(ey + 84 * sc);
    // the written response travels between the party and the creature at chest height: kept clear of decoration
    const lx0 = Math.min(P.x + P.w * 0.45, C.x + C.w * 0.5), lx1 = Math.max(P.x + P.w * 0.45, C.x + C.w * 0.5);
    const ly0 = Math.min(P.y + P.h * 0.12, ey - 36 * sc), ly1 = Math.max(P.y + P.h * 0.62, ey + 30 * sc);
    const R = rect(lx0, ly0, lx1 - lx0, ly1 - ly0);
    const HZ = Math.round(hz / u);
    const key = [u, HZ, C.x, C.y, C.w, C.h, P.x, P.y, P.w, P.h, feetP, feetC, ex | 0].join(',') + (Cs ? '|' + Cs.map((q) => [q.x, q.y, q.w, q.h].join(',')).join(';') : '');
    return { u, W, H, HZ, sc, ps, ex, ey, C, Cs, P, R, feetP, feetC, key, Wb: Math.ceil(W / BUCKET) * BUCKET, Hb: Math.ceil(H / BUCKET) * BUCKET };
  }
  // f(d): px below the horizon of ground row offset d (d = row − the encounter's
  // row; 0.5 is the encounter tile's middle), through (dH, 0), (0.5, a), (1.5, b):
  // a perspective curve K·(1/(z0−d) − 1/(z0−dH)), or a straight line where the
  // actors stand too close in depth for one.
  function depthCurve(dH, a, b) {
    a = Math.max(16, a);
    const lin = (1.5 - dH) / (0.5 - dH);
    b = Math.max(b, a * lin + 2);
    const g = (z0, d) => 1 / (z0 - d) - 1 / (z0 - dH);
    const ratio = (z0) => g(z0, 1.5) / g(z0, 0.5);
    let lo = 1.5 + 1e-3, hi = 1e4;
    if (ratio(hi) >= b / a) { const k = a / (0.5 - dH); return (d) => (d - dH) * k; }
    for (let i = 0; i < 60; i++) { const mid = (lo + hi) / 2; if (ratio(mid) > b / a) lo = mid; else hi = mid; }
    const z0 = (lo + hi) / 2, K = a / g(z0, 0.5);
    return (d) => (d >= z0 - 0.08 ? 1e5 : K * g(z0, d));
  }
  // The projection of map cells into the backdrop: X(c, y) — map column c (a
  // continuous x) at screen row y; Y(r) — the screen row of map row edge r.
  function projector(comp, geo) {
    const v = comp.view, HZ = geo.HZ;
    if (v.mode === 'room') {
      const cols = v.x1 - v.x0 + 1;
      const colPx = Math.max(20, Math.min(32, Math.round(400 / cols)));
      const ax = Math.round((geo.P.x + geo.C.x + geo.C.w) / 2);
      const cMid = (v.x0 + v.x1 + 1) / 2;
      const yN = Math.max(HZ + 40, geo.feetP + 6);
      const n = v.yNear + 1 - v.yBack;
      const Y = (r) => (r <= v.yBack ? HZ - Math.min(4, (v.yBack - r) * 2) : HZ + (yN - HZ) * Math.pow((r - v.yBack) / n, 1.15));
      const sp = (y) => 1 + KR * Math.max(0, y - HZ);
      const X = (c, y) => ax + (c - cMid) * colPx * sp(y == null ? HZ : y);
      return { mode: 'room', X, Y, sp, ax, colPx, cMid, land: false, K: KR, vpy: HZ - 1 / KR, bxL: X(v.x0), bxR: X(v.x1 + 1) };
    }
    const ax = Math.round(geo.ex), wx = comp.x + 0.5;
    const dH = v.mode === 'hall' ? Math.max(-9, Math.min(-1, v.yBack - comp.y)) : -3.5;
    const f = depthCurve(dH, geo.feetC - HZ, geo.feetP - HZ);
    const Y = (r) => { const d = r - comp.y; return d <= dH ? HZ - Math.min(6, dH - d) : HZ + f(d); };
    const sp = (y) => 1 + KL * Math.max(0, y - HZ);
    const X = (c, y) => ax + (c - wx) * COL * sp(y == null ? HZ : y);
    return { mode: v.mode, X, Y, sp, ax, colPx: COL, land: v.mode === 'land', dH, K: KL, vpy: HZ - 1 / KL };
  }

  // ---- layout: the composition in this geometry ---------------------------------------------------------
  const spriteOf = (ref, region, v) => {
    const [t, id] = ref.split(':');
    const A = Art();
    return t === 'w' ? A.worldProp(id, region, { cx: v | 0, cy: 1 }) : A.acc(id, region, v);
  };
  function layout(comp, geo) {
    const A = Art();
    const { C, P, R: lane, HZ, W, H } = geo;
    const PJ = projector(comp, geo);
    const v = comp.view, room = v.mode !== 'land';
    const placed = [], occ = [C, P].concat(geo.Cs || []);
    const region = comp.palRegion;
    const beamY = room ? HZ - WALL_H : null;
    const out = { placed, occ, beamY, lights: [], shaft: null, P: PJ, mach: [] };
    const wm = out.water = waterMask(comp, geo, PJ);
    // is a footing (a line along the ground at y from x0 to x1) on water?
    const wet = (x0, x1, y) => { if (!wm) return false; y = Math.round(y); if (y < 0 || y >= wm.H) return false; for (let x = Math.max(0, Math.round(x0)); x <= Math.min(wm.W - 1, Math.round(x1)); x += 2) if (wm.bytes[y * wm.W + x]) return true; return false; };
    // where a thing standing on map cells (mx..mx+w, bottom row my+h-1) meets the ground here
    const standAt = (it) => { const y = Math.round(PJ.Y(it.my + it.h - 0.35)); return { x: Math.round(PJ.X(it.mx + it.w / 2, y)), y }; };
    const actors = (r) => inter(r, C) || inter(r, P) || (geo.Cs || []).some((q) => inter(r, q));
    const free = (r) => !occ.some((o2) => inter(r, o2)) && !inter(r, lane);
    const cf = C.x + C.w / 2;
    // structure first, west to east
    const lm = comp.structure.slice().sort((a, b) => (a.role.paint === 'side' ? 0 : 1) - (b.role.paint === 'side' ? 0 : 1) || a.mx - b.mx || a.my - b.my);
    for (const it of lm) {
      const rec = { kind: 'landmark', id: it.id, from: it.src + ':' + it.id + '@' + it.at, tier: it.tier, paint: it.role.paint, shown: false, it };
      placed.push(rec);
      const p = it.role.paint;
      if (p === 'water' || p === 'rocks' || p === 'path' || p === 'bridge') {
        rec.shown = true; rec.x0 = PJ.X(it.mx); rec.x1 = PJ.X(it.mx + it.w);
        if (p === 'rocks') { rec.x0 = Math.round(rec.x0); rec.x1 = Math.round(rec.x1); }
        continue;
      }
      if (p === 'facade') {
        // a building front: nearer ones larger; hazed with distance
        const dy = it.my + it.h - 1 - (comp.y || 0);
        const tp = dy >= -3 ? 22 : dy >= -6 ? 16 : 12;
        const by = dy >= -3 ? Math.round(Math.min(PJ.Y(it.my + it.h), HZ + 12)) : HZ;
        const wpx = it.w * tp, x0 = Math.round(PJ.X(it.mx + it.w / 2, by) - wpx / 2);
        Object.assign(rec, { shown: x0 + wpx > -10 && x0 < W + 10, x: x0, y: by - tp * 2.5, w: wpx, h: tp * 2.5, by, tp, haze: dy >= -3 ? 0.12 : dy >= -6 ? 0.25 : 0.4 });
        continue;
      }
      if (p === 'wheel') {
        const dy = it.my + it.h - 1 - (comp.y || 0);
        const r = dy >= -3 ? 26 : dy >= -6 ? 18 : 13;
        const cx = Math.round(PJ.X(it.mx + it.w / 2, HZ)), cy = HZ - r + 4;
        Object.assign(rec, { shown: cx + r > -8 && cx - r < W + 8, x: cx - r - 4, y: cy - r - 4, w: r * 2 + 8, h: r * 2 + 8, cx, cy, r, haze: dy >= -3 ? 0.1 : dy >= -6 ? 0.22 : 0.36, turning: !(it.o && it.o.still) });
        // its turning part is drawn per frame over the static layer: nothing else may stand in front of it
        if (rec.shown) { out.mach.push({ kind: 'wheel', rec }); occ.push(rect(rec.x, rec.y, rec.w, rec.h)); }
        continue;
      }
      if (p === 'gear') {
        const r = Math.max(22, Math.min(38, Math.round(PJ.colPx * 1.2)));
        const cx = Math.round(PJ.X(it.mx + it.w / 2)), cy = HZ - r - 30;
        Object.assign(rec, { shown: true, dimmed: inter(rect(cx - r, cy - r, r * 2, r * 2), C), x: cx - r - 10, y: cy - r * 2 - 30, w: Math.round(r * 2.3) + Math.round(r * 0.66) + 22, h: r * 3 + 46, cx, cy, r, jammed: !!(it.o && it.o.jammed) });
        out.mach.push({ kind: 'gear', rec });
        // the wheels turn per frame over the static layer: nothing may stand in front of them
        occ.push(rect(cx - r - 6, cy - r - 6, Math.round(r * 2.3) + Math.round(r * 0.62) + 12, Math.round(r * 2.14) + 12));
        continue;
      }
      if (p === 'doorway') {
        const w = Math.max(20, Math.min(48, it.w * PJ.colPx)), h = Math.min(64, Math.max(34, (HZ - beamY) * 0.6)), cx = Math.round(PJ.X(it.mx + it.w / 2));
        Object.assign(rec, { shown: true, x: cx - w / 2 - 3, y: HZ - h - 4, w: w + 6, h: h + 4, cx, dw: w, dh: h, dimmed: inter(rect(cx - w / 2, HZ - h, w, h), C) });
        continue;
      }
      if (p === 'side') {
        // an opening in a side wall: drawn by the room's side wall at its rows
        Object.assign(rec, { shown: v.mode === 'room', side: it.side, r0: it.my, r1: it.my + it.h });
        continue;
      }
      if (p === 'hole' || (p === 'stairs' && it.dir === 'down')) {
        // down through the floor: in its place, slid along its row (keeping its side) if a combatant stands there
        const w = Math.round(Math.max(24, PJ.colPx * 1.15 * PJ.sp(PJ.Y(it.my + 1)))), d = Math.round(w * 0.42);
        const y = Math.round(PJ.Y(it.my + 1) - 2);
        let x = Math.round(PJ.X(it.mx + it.w / 2, y));
        const side = x >= cf ? 1 : -1;
        let r = rect(x - w / 2 - 2, y - d - 22, w + 4, d + 26);
        for (let k = 0; k < 40 && actors(r); k++) { x += side * 4; r = rect(x - w / 2 - 2, y - d - 22, w + 4, d + 26); }
        const ok = !actors(r);
        Object.assign(rec, { shown: ok, x: r.x, y: r.y, w: r.w, h: r.h, sx: r.x + 2, sy: y, sw: w, dir: it.dir || 'hole', hole: p === 'hole' });
        if (ok) occ.push(r);
        continue;
      }
      if (p === 'stairs' && (it.dir === 'east' || it.dir === 'west')) {
        // into an opening in a side wall: the side wall draws them, in that opening
        const side = it.dir === 'east' ? 'E' : 'W';
        const op = placed.find((q) => q.paint === 'side' && q.side === side && it.my >= q.r0 && it.my < q.r1);
        if (op) op.stairs = true;
        Object.assign(rec, { shown: !!op && v.mode === 'room', dir: it.dir, inSide: true });
        continue;
      }
      if (p === 'stairs') {
        // up through the back wall / a cliff (or toward a side opening): steps rising into it
        const w = Math.round(Math.max(22, PJ.colPx * it.w * (it.tier === 'far' ? 0.9 : 1.05)));
        const cx = Math.round(PJ.X(it.mx + 0.5 * it.w));
        const base = it.tier === 'wall' || it.tier === 'far' || it.my <= v.yBack ? HZ + 2 : Math.round(PJ.Y(it.my + 1));
        const hgt = it.tier === 'far' ? 14 : Math.round(Math.min(46, (HZ - (beamY == null ? HZ - 60 : beamY)) * 0.4));
        Object.assign(rec, { shown: cx + w > -4 && cx - w < W + 4, x: cx - w / 2 - 2, y: base - hgt - 4, w: w + 4, h: hgt + 6, cx, base, sw: w, sh: hgt, dir: it.dir, far: it.tier === 'far', dimmed: inter(rect(cx - w / 2, base - hgt, w, hgt), C) });
        continue;
      }
      if (p === 'ladder') {
        const cx = Math.round(PJ.X(it.mx + 0.5)), top = (beamY == null ? HZ - 100 : beamY) - 26;
        Object.assign(rec, { shown: cx > -14 && cx < W + 14, x: cx - 13, y: top, w: 26, h: HZ - top + 2, cx, top, ladder: it.ladder || { hatch: 'open' } });
        if (rec.shown) occ.push(rect(cx - 13, top, 26, HZ - top));
        continue;
      }
      // a world prop: stands on the floor line of its depth
      const spr = A.worldProp(it.id, region, { cx: it.mx, cy: it.my, o: it.o });
      if (!spr) continue;
      let y, x = Math.round(PJ.X(it.mx + it.w / 2));
      if (it.tier === 'wall' || it.tier === 'far' || it.role.back || it.role.row) y = HZ + 3;
      else ({ x, y } = standAt(it));
      let r = rect(x - spr.ax, y - spr.ay, spr.w, spr.h);
      const dimOK = it.role.dim || it.role.tall;
      if (inter(r, C) && !dimOK) {
        // slide it out from behind the creature, keeping its side of the scene
        const left = x < cf;
        const nx = left ? C.x - spr.w + spr.ax - 2 : C.x + C.w + spr.ax + 2;
        const r2 = rect(nx - spr.ax, r.y, spr.w, spr.h);
        if (!inter(r2, P)) { x = nx; r = r2; }
      }
      const behindParty = inter(r, P), behindC = inter(r, C) || (geo.Cs || []).some((q) => inter(r, q));
      const onStage = r.x + r.w > -16 && r.x < W + 16;
      const ok = onStage && (!behindC || dimOK) && (!behindParty || it.role.tall || (it.role.wall && r.y < P.y - 12) || it.tier === 'wall');
      Object.assign(rec, { shown: ok, x: r.x, y: r.y, w: r.w, h: r.h, spr, dimmed: behindC || (behindParty && it.tier !== 'wall') });
      if (rec.shown && !behindC) occ.push(r);
    }
    // nearby context: nearest first, only where it does not crowd the actors or the response's lane
    for (const it of comp.context) {
      const rec = { kind: 'context', id: it.id, from: it.src + ':' + it.id + '@' + it.at, tier: it.tier, shown: false, it };
      placed.push(rec);
      if (it.role.paint === 'path') { Object.assign(rec, { shown: true, paint: 'path' }); continue; }
      if (it.tier === 'far') continue;
      const spr = A.worldProp(it.id, region, { cx: it.mx, cy: it.my, o: it.o });
      if (!spr) continue;
      let y, x = Math.round(PJ.X(it.mx + it.w / 2));
      if (it.tier === 'wall') y = HZ + 3;
      else ({ x, y } = standAt(it));
      // where it stands, or a little further out toward its own side if that is taken
      const out1 = x >= cf ? 1 : -1;
      let r = null;
      for (let k = 0; k <= 10 && !r; k++) {
        const q = rect(x - spr.ax + out1 * k * 3, y - spr.ay, spr.w, spr.h);
        if (q.x + q.w < -24 || q.x > W + 24) break;
        if (free(q) && (it.role.wet || !wet(q.x + q.w * 0.2, q.x + q.w * 0.8, y - 1))) r = q;
      }
      if (!r) continue;
      Object.assign(rec, { shown: true, x: r.x, y: r.y, w: r.w, h: r.h, spr });
      occ.push(r);
    }
    // real lights among them glow (indoors, or out of doors after dark)
    if (comp.indoor || comp.night || comp.dark >= 0.35) for (const p of placed) {
      const g = p.shown && p.spr && GLOW[p.id];
      if (!g) continue;
      out.lights.push({ x: p.x + p.w / 2, y: p.y + p.h * g[0], r: g[1], lit: p.id });
    }
    // accessories: each cluster at its home (or the next home on its row) unless an actor or the lane is there
    for (const a of comp.accessories) {
      const cl = CL[a.cluster];
      const rec = { kind: 'accessory', id: a.cluster, zone: a.zone, side: a.side, shown: false, members: [], home: a.home ? a.home.at : null };
      placed.push(rec);
      if (dbg.noAccessories || !a.home) continue;
      const members = (ax, ay) => cl.items.map(([ref, dx, dy, vv]) => {
        const s = spriteOf(ref, region, (vv + a.variant) % 3);
        if (!s) return null;
        return { ref, s, x: Math.round(ax + dx - s.ax), y: Math.round(ay + dy - s.ay), w: s.w, h: s.h, v: (vv + a.variant) % 3 };
      }).filter(Boolean);
      const box = (mem) => { const bx = Math.min(...mem.map((q) => q.x)), by = Math.min(...mem.map((q) => q.y)); return rect(bx, by, Math.max(...mem.map((q) => q.x + q.w)) - bx, Math.max(...mem.map((q) => q.y + q.h)) - by); };
      const spots = [{ x: a.home.x, y: a.home.y }].concat(a.home.alts || []);
      for (const h of spots) {
        let ax, ay;
        if (a.home.wall) {
          ax = Math.round(PJ.X(h.x + 0.5));
          ay = a.zone === 'beam' ? beamY + 9 : a.zone === 'corner' ? beamY + 9 : beamY + 11;
          if (a.zone === 'corner') ax = Math.round(PJ.X(h.x)) + 1;
        } else {
          ay = Math.round(PJ.Y(h.y + (a.zone === 'base' ? 0.55 : 0.7)));
          ax = Math.round(PJ.X(h.x + 0.5, ay));
        }
        const mem = members(ax, ay);
        if (!mem.length) break;
        // the cluster's footprint is centred on its home
        const bb0 = box(mem), sh = Math.round(ax - (bb0.x + bb0.w / 2));
        for (const q of mem) q.x += sh;
        const bb = box(mem);
        if (bb.x + bb.w < -8 || bb.x > W + 8) continue;
        if (!free(rect(bb.x - 3, bb.y - 1, bb.w + 6, bb.h + 2))) continue;
        if (!a.home.wall && wet(bb.x + bb.w * 0.15, bb.x + bb.w * 0.85, ay - 1)) continue;
        Object.assign(rec, { shown: true, x: bb.x, y: bb.y, w: bb.w, h: bb.h, spot: (a.home.wall ? 'wall:' : '') + h.x + ',' + h.y, members: mem, rail: cl.rail ? rect(bb.x - 3, ay - 1, bb.w + 6, 3) : null });
        occ.push(bb);
        for (const q of mem) if (q.s.glow) out.lights.push({ x: q.x + q.s.ax + q.s.glow[0], y: q.y + q.s.ay + q.s.glow[1], r: q.s.glow[2] });
        break;
      }
    }
    void H;
    return out;
  }

  // ---- the ground plane: map cells projected into the backdrop ---------------------------------------------
  const CELLCOL = {
    p: (pal, g) => (g === 'snow' ? ['#c8d0d8', '#b4bec8'] : [pal.dirt[0], pal.dirt[2]]),
    s: (pal) => [pal.sand[0], pal.sand[2]],
    g: (pal) => [pal.grass[1], pal.grass[3]],
    n: () => ['#e6edf3', '#c7d4de'],
    o: (pal) => [pal.stone[1], pal.stone[2]],
    a: () => ['#8a8480', '#6e6864'],
    q: () => ['#e4ddc8', '#c8c0a8'],
    c: (pal) => [pal.stone[0], pal.stone[2]],
  };
  // Helpers over the ground grid: the code at a map cell, a cell's projected
  // corners, whether a row lies on the ground plane, and a row-by-row fill
  // whose sides, where they meet another kind of ground, wander by a couple of
  // pixels in steps of three rows (clustered, never single-pixel noise).
  function cellsOf(comp, geo, P) {
    const G = comp.grid;
    const at = (mx, my) => { const r = G.rows[my - G.y0]; return r ? r[mx - G.x0] || '#' : '#'; };
    const quadPts = (mx, my, w) => {
      const y0 = Math.round(P.Y(my)), y1 = Math.min(geo.Hb + 4, Math.round(P.Y(my + 1)));
      return y1 - y0 < 1 || y0 > geo.Hb ? null : [P.X(mx, y0), y0, P.X(mx + (w || 1), y0), y0, P.X(mx + (w || 1), y1), y1, P.X(mx, y1), y1];
    };
    const near = (my) => (P.land ? my - comp.y > P.dH - 1 : my >= comp.view.yBack);
    const fillCell = (ctx, q, col, jl, jr, seed) => {
      ctx.fillStyle = col;
      const top = q[1], bot = q[5];
      for (let y = top; y < bot; y++) {
        const t = (y + 0.5 - top) / Math.max(1, bot - top);
        let l = q[0] + (q[6] - q[0]) * t, r = q[2] + (q[4] - q[2]) * t;
        const k = Math.floor(y / 3);
        if (jl) l += ((RB.tiles.hh(k, seed, 1) % 5) - 2);
        if (jr) r += ((RB.tiles.hh(k, seed, 2) % 5) - 2);
        const a = Math.round(l), b = Math.round(r);
        if (b > a) ctx.fillRect(a, y, b - a, 1);
      }
    };
    return { G, at, quadPts, near, fillCell, rowsN: G.rows.length, colsN: G.rows[0].length };
  }
  // The water of this geometry as a mask (canvas + a byte per pixel), built
  // once per layout: painted through, and read so that nothing is set down on water.
  function waterMask(comp, geo, P) {
    if (!comp.grid) return null;
    const { at, quadPts, near, fillCell, rowsN, colsN, G } = cellsOf(comp, geo, P), HZ = geo.HZ;
    const Wd = geo.Wb, Hd = geo.Hb;
    const mask = RB.sprites.makeCanvas(Wd, Hd), mg = mask.getContext('2d', { willReadFrequently: true });
    let any = false, y0 = 1e9, y1 = -1e9;
    for (let j = 0; j < rowsN; j++) {
      const my = G.y0 + j;
      for (let i = 0; i < colsN; i++) {
        const mx = G.x0 + i;
        if (at(mx, my) !== 'w' && at(mx, my) !== 'b') continue;
        let q;
        if (near(my)) q = quadPts(mx, my);
        else if (P.land) { const x0 = P.X(mx), x1 = P.X(mx + 1); q = [x0, HZ - 6, x1, HZ - 6, x1, HZ + 1, x0, HZ + 1]; }
        if (!q) continue;
        const wl = at(mx - 1, my) !== 'w' && at(mx - 1, my) !== 'b', wr = at(mx + 1, my) !== 'w' && at(mx + 1, my) !== 'b';
        fillCell(mg, [q[0] - (wl ? 0 : 1), q[1], q[2] + (wr ? 0 : 1), q[3], q[4] + (wr ? 0 : 1), q[5], q[6] - (wl ? 0 : 1), q[7]], '#000', wl && near(my), wr && near(my), mx * 17 + my);
        any = true; y0 = Math.min(y0, q[1]); y1 = Math.max(y1, q[5]);
      }
    }
    if (!any) return null;
    const d = mg.getImageData(0, 0, Wd, Hd).data, bytes = new Uint8Array(Wd * Hd);
    for (let i = 0; i < bytes.length; i++) bytes[i] = d[i * 4 + 3] > 0 ? 1 : 0;
    return { canvas: mask, bytes, y0, y1, W: Wd, H: Hd };
  }
  function groundCells(g, comp, geo, pal, P, wm) {
    if (!comp.grid) return;
    const K = RB.propKit, A = Art(), { HZ } = geo;
    const baseCode = comp.indoor ? null : CODEOF[comp.ground] || 'g';
    const { at, quadPts, near, fillCell, G } = cellsOf(comp, geo, P);
    const rowsN = G.rows.length, colsN = G.rows[0].length;
    // land cells of another kind than the base
    for (let j = 0; j < rowsN; j++) {
      const my = G.y0 + j;
      if (!near(my)) continue;
      for (let i = 0; i < colsN; i++) {
        const mx = G.x0 + i, c = at(mx, my);
        if (c === baseCode || !CELLCOL[c] || (comp.indoor && c !== 'o' && c !== 'd')) continue;
        if (comp.key === 'atlas' && c !== 'p' && c !== 'c') continue; // the Atlas's dressings stay one sheet of parchment
        if (comp.indoor && c === 'd' && comp.floorCode === 'd') continue;
        if (comp.indoor && c === 'o' && comp.floorCode === 'o') continue;
        const q = quadPts(mx, my);
        if (!q) continue;
        let col = c === 'd' ? [pal.floor[1], pal.floor[2]] : CELLCOL[c](pal, comp.ground);
        // indoors the patch is in the room's shade, and a stone patch is laid in flags
        if (comp.indoor) col = col.map((x) => K.mix(x, '#281a1e', 0.42));
        fillCell(g, q, col[0], at(mx - 1, my) !== c, at(mx + 1, my) !== c, mx * 31 + my);
        if (comp.indoor && c === 'o') { for (let y = q[1]; y < q[5]; y++) A.R(g, Math.round(P.X(mx + (my % 2 ? 0.5 : 0), y)), y, 1, 1, col[1]); A.R(g, Math.min(q[0], q[2]), q[1], Math.abs(q[2] - q[0]), 1, col[1]); }
        // a darker edge where it meets the base ground (the edge nearer the horizon)
        if (at(mx, my - 1) !== c) A.R(g, Math.min(q[0], q[2]), q[1], Math.abs(q[2] - q[0]), 1, col[1]);
        if (c === 'c') A.R(g, Math.min(q[0], q[2]), q[1], Math.abs(q[2] - q[0]), 2, pal.stone[1]);
      }
    }
    if (!wm) return;
    A.waterIn(g, wm.canvas, wm.y0, wm.y1, pal, comp.key === 'still' || comp.key === 'archive' || comp.key === 'belltower', Math.round(P.ax), HZ);
    // shore: a lit rim along water cells whose neighbour is land
    const rim = comp.indoor ? 'rgba(10,8,20,0.55)' : pal.sand ? pal.sand[1] : '#e0e0d0';
    const isW = (mx, my) => at(mx, my) === 'w' || at(mx, my) === 'b';
    const banks = [];
    for (let j = 0; j < rowsN; j++) {
      const my = G.y0 + j;
      if (!near(my)) continue;
      for (let i = 0; i < colsN; i++) {
        const mx = G.x0 + i;
        if (!isW(mx, my)) continue;
        const q = quadPts(mx, my);
        if (!q) continue;
        if (!isW(mx, my - 1) && at(mx, my - 1) !== '#') A.R(g, Math.min(q[0], q[2]), q[1] - 1, Math.abs(q[2] - q[0]) + 1, 2, rim);
        for (const [dx, xa, xb] of [[-1, q[0], q[6]], [1, q[2], q[4]]]) {
          if (isW(mx + dx, my) || at(mx + dx, my) === '#') continue;
          banks.push({ x: Math.round((xa + xb) / 2), y: Math.round((q[1] + q[5]) / 2), d: q[5] - q[1] });
        }
      }
    }
    {
      const Wd = wm.W;
      const on = (x, y) => x >= 0 && x < Wd && y >= 0 && y < wm.H && wm.bytes[y * Wd + x] === 1;
      g.fillStyle = rim;
      for (let y = Math.max(HZ + 2, Math.floor(wm.y0)); y < Math.min(wm.H, Math.ceil(wm.y1)); y++) {
        for (let x = 1; x < Wd - 1; x++) {
          const c = on(x, y);
          if (c && !on(x - 1, y)) g.fillRect(x, y, 2, 1);
          else if (c && !on(x + 1, y)) g.fillRect(x - 1, y, 2, 1);
        }
      }
    }
    // reeds on the banks, where this stretch of the map grows reeds
    if (comp.has.reeds && !comp.indoor) for (const b of banks) {
      const r = rect(b.x - 7, b.y - 20, 14, 20);
      if (!inter(r, geo.C) && !inter(r, geo.P) && !inter(r, geo.R)) reedClump(g, b.x, b.y + 2, 10 + Math.round(b.d * 0.5), pal, b.x - Math.round(P.ax));
    }
    // bridges: planks across, a rail on the far side
    const wd = K.mat(pal).wood;
    for (let j = 0; j < rowsN; j++) {
      const my = G.y0 + j;
      if (!near(my)) continue;
      for (let i = 0; i < colsN; i++) {
        const mx = G.x0 + i;
        if (at(mx, my) !== 'b') continue;
        const q = quadPts(mx, my);
        if (!q) continue;
        K.poly(g, q, wd[2]);
        for (let y = q[1] + 1; y < q[5]; y += 3) A.R(g, Math.min(q[0], q[6]), y, Math.abs(q[2] - q[0]) + 2, 1, wd[1]);
        A.R(g, Math.min(q[0], q[2]), q[1], Math.abs(q[2] - q[0]), 1, wd[3]);
        // a broken end: the planks stop over open water
        for (const dx of [-1, 1]) if (at(mx + dx, my) === 'w') { const ex = dx < 0 ? Math.min(q[0], q[6]) : Math.max(q[2], q[4]) - 2; A.R(g, ex, q[1], 2, q[5] - q[1], wd[0]); A.R(g, ex + (dx < 0 ? -2 : 2), q[1] + 1, 2, Math.max(1, q[5] - q[1] - 3), wd[1]); }
      }
    }
  }

  // ---- painting the static layer ----------------------------------------------------------------------
  function paint(comp, geo, lay) {
    const A = Art();
    const { HZ, C } = geo;
    const W = geo.Wb, H = geo.Hb;
    const cv = RB.sprites.makeCanvas(W, H);
    const g = cv.getContext('2d');
    g.imageSmoothingEnabled = false;
    const region = comp.palRegion, pal = A.palOf(region);
    const PJ = lay.P, ox = Math.round(PJ.ax);
    const get = (kind) => lay.placed.filter((p) => p.shown && p.paint === kind);
    const skyKey = comp.fam === 'stillOut' ? 'still' : comp.key === 'atlas' ? 'atlas' : A.LAND[comp.palRegion] ? comp.palRegion : A.LAND[comp.key] ? comp.key : 'reedwake';
    const v = comp.view;
    if (comp.indoor) {
      const R0 = A.ROOMS[comp.key] || A.ROOMS.interior;
      // the floor and walls of this room; the floor's material follows the map
      const floor = comp.ground === 'stone' ? 'flags' : comp.ground === 'paper' ? 'paper' : comp.ground === 'earth' ? 'wood' : R0.floor;
      const wall = comp.key === 'mill' && floor === 'flags' ? 'stone' : R0.wall;
      comp.floorCode = floor === 'flags' ? 'o' : floor === 'wood' ? 'd' : null;
      // floor rows: the map's rows projected (boards and flag courses follow them)
      const rows = [];
      for (let r = v.yBack; r <= v.yNear + 8; r++) { const y = Math.round(PJ.Y(r)); if (y > H + 40) break; rows.push(y); }
      const sp = { region, wall, floor, cool: R0.cool, beamY: lay.beamY, ox, rows, X: PJ.X, sp: PJ.sp, cols: [v.x0, v.x1 + 1], room: v.mode === 'room' };
      A.room(g, W, H, HZ, sp);
      if (wall === 'timber') A.posts(g, postsFor(PJ, v, W), HZ, lay.beamY, region);
      else A.wallDress(g, W, HZ, lay.beamY, comp.key, region, ox);
      if (comp.key !== 'still') A.beam(g, W, lay.beamY, region, wall !== 'timber', ox);
      // openings in the back wall
      for (const d of get('doorway')) A.doorway(g, d.cx, HZ - 5, d.dw, d.dh, region, wall !== 'timber', d.dimmed);
      // stairs up into the back wall
      for (const q of get('stairs')) if (q.dir !== 'down' && !q.inSide) A.stairsUp(g, q.cx, q.base, q.sw, q.sh, region, wall !== 'timber' || q.far, q.dir);
      // the floor's own patches, water across it (a channel, a flooded hall) and bridges
      groundCells(g, comp, geo, pal, PJ, lay.water);
      for (const q of get('stairs')) if (q.dir === 'down' || q.hole) A.stairsDown(g, q.sx, q.sy, q.sw, region, !!q.hole);
      for (const q of get('hole')) A.stairsDown(g, q.sx, q.sy, q.sw, region, true);
      // the side walls of a small room, with their openings
      if (v.mode === 'room') A.sideWalls(g, W, H, HZ, Object.assign({}, sp, { vx: PJ.ax, vpy: PJ.vpy, bxL: PJ.X(v.x0), bxR: PJ.X(v.x1 + 1), openings: get('side').map((q) => ({ side: q.side, y0: PJ.Y(q.r0), y1: PJ.Y(q.r1), stairs: !!q.stairs })), Y: PJ.Y, beamTop: lay.beamY }));
    } else {
      const sky = skyKey;
      const ground = comp.key === 'atlas' ? 'parch' : comp.fam === 'stillOut' ? (comp.ground === 'stone' ? 'stone' : 'paper') : comp.ground || 'meadow';
      A.land(g, W, H, HZ, { sky, region, ground, seed: 1, ox, chimneys: sky === 'cinder' ? [-150, -60, 210] : null });
      // far features on the horizon: ridges of cliffs, tree and bush lines, water
      for (const r of get('rocks')) A.rocks(g, Math.max(0, r.x0), Math.min(W, r.x1), HZ, 22, r.x0 - ox, region);
      const groups = {};
      for (const l of comp.lines || []) (groups[l.group] = groups[l.group] || []).push(Math.round(PJ.X(l.mx)));
      if (groups.trees) spans(groups.trees, 26).forEach(([a, b]) => A.treeline(g, a - 8, b + 8, HZ, 22, 7, region, 1, ox));
      if (groups.bushes) spans(groups.bushes, 24).forEach(([a, b]) => A.treeline(g, a - 6, b + 6, HZ, 10, 17, region, 0, ox));
      if (groups.rocks) for (const x of groups.rocks) A.rocks(g, x - 7, x + 7, HZ, 6, x - ox, region);
      if (groups.reeds) for (const x of groups.reeds) { reedClump(g, x - 3, HZ + 1, 15, pal, x - ox); reedClump(g, x + 4, HZ + 2, 12, pal, x - ox + 7); }
      if (groups.fence) spans(groups.fence, 20).forEach(([a, b]) => fenceLine(g, a - 8, b + 8, HZ, pal));
      groundCells(g, comp, geo, pal, PJ, lay.water);
      // stairs cut into a cliff or a bank (up, away from the viewer)
      for (const q of get('stairs')) if (q.dir !== 'down' && !q.inSide) A.stairsUp(g, q.cx, q.base, q.sw, q.sh, region, true, q.dir);
      for (const q of get('stairs')) if (q.dir === 'down') A.stairsDown(g, q.sx, q.sy, q.sw, region, false);
      // buildings and the wheel, far first; the wheel's turning part is drawn per frame
      const bl = lay.placed.filter((p) => p.shown && (p.paint === 'facade' || p.paint === 'wheel')).sort((a, b) => (b.haze || 0) - (a.haze || 0));
      const haze = (A.LAND[sky] || A.LAND.reedwake).haze;
      for (const b of bl) {
        // drawn on its own small canvas, washed toward the haze with distance
        const bx = Math.round(b.x) - 8, by = Math.round(b.y) - 40, tw = Math.round(b.w) + 16, th = Math.round(b.h) + 56;
        const tmp = RB.sprites.makeCanvas(tw, th), tg = tmp.getContext('2d');
        tg.imageSmoothingEnabled = false;
        tg.translate(-bx, -by);
        if (b.paint === 'facade') A.facade(tg, b.x, b.by, b.it.st, b.tp, region, { lit: comp.night || comp.dark > 0.3 });
        else A.wheelHousing(tg, b.cx, b.cy, b.r, region, b.turning);
        tg.setTransform(1, 0, 0, 1, 0, 0);
        if (b.haze) { tg.globalCompositeOperation = 'source-atop'; tg.globalAlpha = b.haze; tg.fillStyle = haze; tg.fillRect(0, 0, tw, th); }
        g.drawImage(tmp, bx, by);
        b.hazeCol = haze;
      }
    }
    // landmarks with their own painters (the gears' wheels turn per frame: the backboard and the shaft here)
    for (const q of get('gear')) A.gearBoard(g, q.cx, q.cy, q.r, region, q.jammed);
    for (const q of get('ladder')) A.ladder(g, q.cx, q.top, HZ + 2, region, comp.indoor, q.ladder);
    // world-prop landmarks and context, back to front; those behind an actor in shadow, far ones hazed
    const sprites = lay.placed.filter((p) => p.shown && p.spr).sort((a, b) => (a.y + a.h) - (b.y + b.h) || a.x - b.x);
    const haze = comp.indoor ? '#140c1c' : (A.LAND[skyKey] || A.LAND.reedwake).haze;
    for (const p of sprites) {
      let s = p.spr;
      const a = comp.indoor ? (p.dimmed ? 0.5 : p.tier === 'wall' ? 0.22 : p.tier === 'mid' ? 0.1 : 0.04) : p.dimmed ? 0.35 : p.tier === 'wall' || p.tier === 'far' ? 0.25 : p.tier === 'mid' ? 0.06 : 0;
      if (a) s = A.tinted(s, haze, a);
      g.drawImage(s.cv, p.x, p.y);
    }
    // accessories (one step quieter than the landmarks)
    for (const p of lay.placed) {
      if (!p.shown || p.kind !== 'accessory') continue;
      if (p.rail) { const wd = RB.propKit.mat(pal).wood; A.R(g, p.rail.x, p.rail.y, p.rail.w, 2, wd[2]); A.R(g, p.rail.x, p.rail.y, p.rail.w, 1, wd[3]); A.R(g, p.rail.x, p.rail.y + 2, p.rail.w, 1, 'rgba(16,10,24,0.4)'); }
      for (const q of p.members) {
        const s = A.tinted(q.s, comp.indoor ? '#140c1c' : haze, comp.indoor ? 0.14 : 0.08);
        g.drawImage(s.cv, q.x, q.y);
      }
    }
    // out of doors and in halls, beyond the local window the view thins into haze or darkness
    if (v.mode !== 'room') {
      const edge = (side, y) => PJ.X(side < 0 ? v.x0 : v.x1 + 1, y), colW = (y) => PJ.colPx * PJ.sp(y);
      if (comp.indoor) A.periphery(g, W, H, HZ, edge, colW, '20,12,18', 0.62);
      else A.periphery(g, W, H, HZ, edge, colW, A.rgbOf(haze), comp.fam === 'stillOut' ? 0.45 : 0.36);
    }
    // light: rooms in their own shade with a pool where the party stands; windows behind the viewer
    // throw a pale shaft by day; lamps make warm pools; out of doors the map's evening or night
    if (comp.indoor) {
      const d = Math.min(0.62, 0.25 + (comp.dark || 0) * 0.6);
      A.roomLight(g, W, H, HZ, { d, beamY: lay.beamY, P: geo.P, C, feet: geo.feetP, ox, room: v.mode === 'room', bxL: v.mode === 'room' ? PJ.X(v.x0) : null, bxR: v.mode === 'room' ? PJ.X(v.x1 + 1) : null });
      if (comp.front && (comp.front.windows || []).length && !comp.night) {
        // the building's front windows are behind the viewer: their light falls in over the party's shoulders
        const bw = comp.front.w || 7, span = v.mode === 'room' ? [v.x0, v.x1 + 1] : [comp.x - 8, comp.x + 8];
        comp.front.windows.forEach((wx, i) => {
          const c = span[0] + (span[1] - span[0]) * ((wx + 0.5) / bw);
          const yf = Math.round(HZ + (geo.feetP - HZ) * 0.7), y0 = (lay.beamY == null ? HZ - 100 : lay.beamY) - 30;
          const x = Math.round(PJ.X(c, yf)) + Math.round((yf - y0) * 0.42);
          A.shaft(g, x, y0, yf, 12);
          lay.shaft = lay.shaft || []; lay.shaft.push({ x, y0, yf, n: i });
        });
      }
      for (const l of lay.lights) A.pool(g, l.x, l.y, l.r, Math.round(l.r * 0.8), '255,196,110', 0.28);
    } else {
      if (comp.night || comp.dark >= 0.35) {
        // evening or night out of doors: the same place under a dark sky, a few stars
        g.fillStyle = 'rgba(14,16,44,' + (comp.night ? 0.5 : 0.32) + ')'; g.fillRect(0, 0, W, H);
        g.fillStyle = 'rgba(236,240,255,0.8)';
        for (let i = 0; i < 40; i++) { const x = ox + (RB.tiles.hh(i, 81) % 1600) - 800, y = RB.tiles.hh(i, 82) % Math.max(1, HZ - 40); if (x >= 0 && x < W && !inter(rect(x, y, 1, 1), C)) g.fillRect(x, y, 1, 1); }
      }
      if (comp.tint) { g.fillStyle = comp.tint; g.fillRect(0, 0, W, H); }
      for (const l of lay.lights) A.pool(g, l.x, l.y, l.r, Math.round(l.r * 0.8), '255,196,110', 0.24);
      // depth: the near ground in a slightly deeper tone (the far ground keeps the light)
      A.nearShade(g, W, H, HZ, geo.feetP);
    }
    if (comp.key === 'atlas') { g.globalCompositeOperation = 'color'; g.fillStyle = 'rgba(150,120,80,0.28)'; g.fillRect(0, HZ, W, H - HZ); g.globalCompositeOperation = 'source-over'; }
    return cv;
  }
  function spans(xs, gap) {
    xs = xs.slice().sort((a, b) => a - b);
    const out = [];
    for (const x of xs) { const l = out[out.length - 1]; if (l && x - l[1] <= gap) l[1] = x; else out.push([x, x]); }
    return out;
  }
  // timber posts on the back wall: at every fourth column of the room (or of the hall around the encounter)
  function postsFor(PJ, v, W) {
    const out = [];
    const c0 = v.mode === 'room' ? v.x0 : v.x0 - 8, c1 = v.mode === 'room' ? v.x1 + 1 : v.x1 + 8;
    for (let c = c0; c <= c1; c += 4) { const x = Math.round(PJ.X(c)) - 3; if (x > -8 && x < W + 8) out.push(x); }
    return out;
  }
  function reedClump(g, x, base, hgt, pal, seed) {
    for (let i = 0; i < 6; i++) {
      const xx = Math.round(x - 6 + i * 2.4), h = Math.round(hgt * (0.6 + ((RB.tiles.hh(seed, i, 3) % 40) / 100)));
      Art().R(g, xx, base - h, 1, h, i % 2 ? pal.reed[2] : pal.reed[0]);
      if (i % 2 === 0) Art().R(g, xx, base - h - 3, 1, 3, pal.reed[1]);
    }
  }
  function fenceLine(g, x0, x1, base, pal) {
    const wd = RB.propKit.mat(pal).wood;
    Art().R(g, x0, base - 7, x1 - x0, 1, wd[3]); Art().R(g, x0, base - 4, x1 - x0, 1, wd[2]);
    for (let x = x0; x < x1; x += 7) Art().R(g, x, base - 9, 1, 9, wd[1]);
  }

  // ---- ambient life (per frame, bounded, subordinate) -----------------------------------------------------
  const AMB = {
    reedwake: { n: 7, col: 'rgba(250,250,236,0.7)', size: 2, vx: 0.008, vy: -0.003, wob: 6 },
    mill: { n: 12, col: 'rgba(230,220,180,0.4)', size: 1, vx: 0.003, vy: 0.002, wob: 8 },
    archive: { n: 10, col: 'rgba(170,190,240,0.35)', size: 1, vx: 0, vy: -0.003, wob: 5 },
    cinder: { n: 10, col: 'rgba(210,200,196,0.6)', size: 2, vx: -0.006, vy: 0.007, wob: 8 },
    kiln: { n: 12, col: 'rgba(255,170,90,0.75)', size: 2, vx: 0.002, vy: -0.011, wob: 6 },
    snowbell: { n: 20, col: 'rgba(255,255,255,0.85)', size: 2, vx: -0.003, vy: 0.009, wob: 10 },
    observatory: { n: 8, col: 'rgba(210,226,255,0.3)', size: 1, vx: 0.002, vy: 0.002, wob: 6 },
    lanternfall: { n: 6, col: 'rgba(252,224,160,0.6)', size: 2, vx: 0.003, vy: -0.004, wob: 8 },
    belltower: { n: 10, col: 'rgba(200,216,255,0.3)', size: 1, vx: 0.002, vy: 0.003, wob: 8 },
    still: { n: 7, col: 'rgba(236,232,220,0.5)', size: 3, vx: 0.004, vy: -0.004, wob: 10 },
    atlas: { n: 5, col: 'rgba(250,244,226,0.7)', size: 3, vx: 0.007, vy: 0.002, wob: 8 },
    saltglass: { n: 0 },
  };
  // How much the scenery quiets itself now (0 calm … 1 still): while you read,
  // choose and write; and for a moment when a blow lands (a result is placed).
  const hushSt = { beats: -1, at: -1e9 };
  function hushNow(F) {
    if (F && F.hush != null) return Math.max(0, Math.min(1, +F.hush));
    let h = 0;
    const ph = RB.combat && RB.combat.phase ? RB.combat.phase() : null;
    if (ph === 'choose' || ph === 'challenge' || ph === 'companion') h = 0.5;
    const sq = RB.battleSeq && RB.battleSeq.stats ? RB.battleSeq.stats() : null;
    const now = typeof performance !== 'undefined' ? performance.now() : 0;
    if (sq && sq.counters) {
      if (hushSt.beats >= 0 && sq.counters.beats > hushSt.beats) hushSt.at = now;
      hushSt.beats = sq.counters.beats;
    }
    if (now - hushSt.at < 450) h = 1;
    return h;
  }
  function ambient(c, comp, lay, geo, t, still, hush) {
    const u = geo.u, K = RB.propKit, A = Art();
    const hh = (a, b, d) => RB.tiles.hh(a, b, d);
    const ox = Math.round(lay.P.ax);
    // machinery in its state: a mended gear train and a free wheel turn slowly; jammed or still ones rest
    for (const m of lay.mach) {
      const r = m.rec;
      if (m.kind === 'gear') A.gearWheels(c, r.cx, r.cy, r.r, comp.palRegion, still || r.jammed ? 0 : t, r.jammed, u, r.dimmed);
      else if (m.kind === 'wheel') A.wheelSpin(c, r.cx, r.cy, r.r, comp.palRegion, still || !r.turning ? 0 : t, u, r.haze, r.hazeCol);
    }
    if (still) return;
    const k = 1 - hush * 0.7;
    const a = AMB[comp.key] || AMB[comp.palRegion];
    if (a && a.n) {
      c.fillStyle = a.col;
      const n = Math.round(a.n * k), span = Math.max(320, geo.W + 64);
      for (let i = 0; i < n; i++) {
        const sx = hh(i, 5, 1) % 1000 / 1000, sy = hh(i, 5, 2) % 1000 / 1000, ph = (hh(i, 5, 3) % 628) / 100;
        const x = ((ox - span / 2 + sx * span + t * a.vx * (0.6 + sx)) % span + span) % span + Math.sin(t / 1600 + ph) * a.wob * k;
        const y = ((sy * geo.H + t * a.vy * (0.6 + sy)) % geo.H + geo.H) % geo.H;
        if (inter(rect(x - 2, y - 2, 4, 4), lay.occ[0]) && hush > 0) continue;
        c.fillRect(Math.round(x * u), Math.round(y * u), a.size * u, a.size * u);
      }
    }
    // dust turning in the window light
    if (lay.shaft) for (const sh of lay.shaft) {
      c.fillStyle = 'rgba(244,236,200,0.45)';
      for (let i = 0; i < Math.round(5 * k); i++) {
        const q = ((t / 11000 + hh(i, sh.n, 7) % 100 / 100) % 1);
        const y = sh.y0 + 20 + q * (sh.yf - sh.y0 + 30), off = Math.round((y - sh.y0) * 0.42);
        const x = sh.x - off + Math.sin(t / 2100 + i * 1.9) * 5;
        c.fillRect(Math.round(x * u), Math.round(y * u), u, u);
      }
    }
    // lamp flicker: the warm pool breathes by one step now and then
    if (hush < 1) for (const l of lay.lights) {
      const f = Math.sin(t / 330 + l.x * 0.7) + Math.sin(t / 140 + l.y) * 0.5;
      if (f > 1.0) K.ell(c, l.x * u, l.y * u, l.r * 0.55 * u, l.r * 0.45 * u, 'rgba(255,210,130,0.06)');
    }
    // glints on water, where the map has water
    if (lay.water && hush < 1) {
      const wm = lay.water;
      c.fillStyle = 'rgba(236,248,255,0.7)';
      for (let i = 0; i < 14; i++) {
        if (Math.sin(t / 900 + i * 2.3) <= 0.75) continue;
        const x = ox - 400 + (hh(i, 9, 44) % 800), y = Math.round(wm.y0 + (hh(i, 3, 45) % Math.max(1, Math.round(wm.y1 - wm.y0))));
        if (x < 1 || x >= wm.W - 2 || y < 0 || y >= wm.H || !wm.bytes[y * wm.W + x] || !wm.bytes[y * wm.W + x + 1]) continue;
        c.fillRect(Math.round(x * u), Math.round(y * u), 2 * u, u);
      }
    }
  }

  // ---- public ---------------------------------------------------------------------------------------------------
  // begin(enemy, opts): called once at encounter entry (RB.combat placeEnemy).
  function begin(enemy, opts) {
    opts = opts || {};
    counter++;
    const where = enemy.where || opts.where || null;
    const seed = forced != null ? forced : opts.presentSeed != null ? opts.presentSeed | 0 : hashStr((where ? where.map + ':' + where.x + ',' + where.y : enemy.id) + '#' + counter);
    try { cur = compose(enemy, where, seed); } catch (e) { console.warn('battle place', e); cur = { id: ++compN, key: enemy.bgKey, seed, fallback: 'error: ' + e.message, states: [], sig: 'error' }; }
    cur.counter = counter;
    cur.enemy = enemy.id;
    cur.artOpts = enemy.artOpts || {};
    cur.artBox = undefined;
    cur.geo = null; cur.lay = null;
    // a new encounter: the old encounter's layers go (their record is not this one)
    for (const [k, L] of layers) if (L.sig !== cur.sig) { layers.delete(k); costs.evicted++; }
    return cur;
  }
  // draw(c, key, w, h, hz, t, still, frame): the backdrop for this frame; returns
  // false when there is no composed place (the caller then paints the region backdrop).
  function draw(c, key, w, h, hz, t, still, F) {
    if (!cur || cur.fallback || !F || cur.key !== key || dbg.off) return false;
    if (cur.artBox === undefined) cur.artBox = artBox(F.art || 'wisp', cur.artOpts) || null;
    const geo = geometry(F, w, h, hz, cur.artBox);
    const lkey = cur.sig + '|' + geo.key + '|' + geo.Wb + 'x' + geo.Hb + (dbg.noAccessories ? '|bare' : '');
    let Lr = layers.get(lkey);
    if (!Lr) {
      const t0 = performance.now();
      const lay = layout(cur, geo);
      const cv = paint(cur, geo, lay);
      if (lay.water) lay.water.canvas = null; // the mask's pixels are kept as bytes; its canvas goes
      Lr = { cv, lay, geo, sig: cur.sig, ms: performance.now() - t0, bytes: cv.width * cv.height * 4 + (lay.water ? lay.water.bytes.length : 0) };
      layers.set(lkey, Lr);
      while (layers.size > LAYERS_MAX) { layers.delete(layers.keys().next().value); costs.evicted++; }
      costs.builds++; costs.lastMs = Lr.ms; costs.maxMs = Math.max(costs.maxMs, Lr.ms);
      cur.builds = (cur.builds || 0) + 1; cur.buildMs = Lr.ms;
    } else { costs.reuse++; layers.delete(lkey); layers.set(lkey, Lr); }
    cur.geo = Lr.geo; cur.lay = Lr.lay; cur.lkey = lkey;
    const u = Lr.geo.u;
    // the layer is the bucket's size: only the canvas's part of it is drawn
    const sw = Math.min(Lr.cv.width, Math.ceil(w / u)), sh = Math.min(Lr.cv.height, Math.ceil(h / u));
    c.drawImage(Lr.cv, 0, 0, sw, sh, 0, 0, sw * u, sh * u);
    ambient(c, cur, Lr.lay, Lr.geo, t, still, still ? 1 : hushNow(F));
    return true;
  }
  // A JSON-safe record of the current (or last) composition and its frame, for tests and captures.
  function last() {
    if (!cur) return null;
    const r = (p) => (p && p.x != null ? { x: Math.round(p.x), y: Math.round(p.y), w: Math.round(p.w), h: Math.round(p.h) } : null);
    const lay = cur.lay, geo = cur.geo;
    const placed = lay ? lay.placed : [];
    const PJ = lay ? lay.P : null;
    return {
      map: cur.map, x: cur.x, y: cur.y, seed: cur.seed, counter: cur.counter, enemy: cur.enemy, key: cur.key, fam: cur.fam || null,
      setting: cur.setting || null, zone: cur.zone || null, small: !!cur.small, view: cur.view ? { mode: cur.view.mode, x0: cur.view.x0, x1: cur.view.x1, yBack: cur.view.yBack, yNear: cur.view.yNear } : null,
      fallback: cur.fallback || null, ground: cur.ground || null, sig: cur.sig || null,
      origin: originOf(cur),
      structure: (cur.structure || []).map((it) => ({ id: it.id, from: it.src + ':' + it.id + '@' + it.at, tier: it.tier, dir: it.dir || null, ladder: it.ladder || null, tiers: it.tiers || null })),
      landmarks: placed.filter((p) => p.kind === 'landmark').map((p) => ({ id: p.id, from: p.from, tier: p.tier, shown: !!p.shown, dimmed: !!p.dimmed, rect: r(p), dir: p.dir || null, cx: p.cx != null ? Math.round(p.cx) : null })),
      context: placed.filter((p) => p.kind === 'context').map((p) => ({ id: p.id, from: p.from, tier: p.tier, shown: !!p.shown, rect: r(p) })),
      contextSel: (cur.context || []).map((it) => it.src + ':' + it.id + '@' + it.at),
      lines: (cur.lines || []).map((l) => ({ group: l.group, from: l.from })),
      accessories: (cur.accessories || []).map((a) => ({ id: a.cluster, zone: a.zone, side: a.side, variant: a.variant, home: a.home ? a.home.at : null })),
      accessoriesPlaced: placed.filter((p) => p.kind === 'accessory').map((p) => ({ id: p.id, zone: p.zone, home: p.home, spot: p.spot || null, shown: !!p.shown, rect: r(p), members: (p.members || []).map((q) => ({ ref: q.ref, rect: r(q) })) })),
      frame: geo ? { W: geo.W, H: geo.H, Wb: geo.Wb, Hb: geo.Hb, HZ: geo.HZ, u: geo.u, creature: r(geo.C), creatures: geo.Cs ? geo.Cs.map(r) : null, party: r(geo.P), lane: r(geo.R), feetP: geo.feetP, feetC: geo.feetC, beamY: lay ? lay.beamY : null, key: geo.key, colPx: PJ ? PJ.colPx : null, ax: PJ ? Math.round(PJ.ax) : null,
        // the map columns this canvas shows at the horizon (wider canvas → more of them)
        cols: PJ ? [+(cur.view.mode === 'room' ? PJ.cMid + (0 - PJ.ax) / PJ.colPx : cur.x + 0.5 + (0 - PJ.ax) / PJ.colPx).toFixed(2), +(cur.view.mode === 'room' ? PJ.cMid + (geo.W - PJ.ax) / PJ.colPx : cur.x + 0.5 + (geo.W - PJ.ax) / PJ.colPx).toFixed(2)] : null } : null,
      buildMs: cur.buildMs != null ? +cur.buildMs.toFixed(2) : null, builds: cur.builds || 0, layerKey: cur.lkey || null,
    };
  }
  // The origin record of the current composition (or of a composition passed in).
  function origin(c) { return originOf(c || cur); }
  // Resources: the cached static layers (bytes of RGBA pixels and water masks)
  // and the art caches behind them, reported apart from the sprite budget.
  function resources() {
    let layerBytes = 0;
    for (const L of layers.values()) layerBytes += L.bytes;
    const art = Art() && Art().cacheStats ? Art().cacheStats() : null;
    return { layers: layers.size, layerBytes, maxLayers: LAYERS_MAX, art, builds: costs.builds, reuse: costs.reuse, evicted: costs.evicted, lastMs: +costs.lastMs.toFixed(2), maxMs: +costs.maxMs.toFixed(2) };
  }
  // test hooks
  function forceSeed(n) { forced = n == null ? null : n >>> 0; }
  function debug(o) { dbg = Object.assign({}, o || {}); layers.clear(); if (cur) { cur.lay = null; } }
  // checksum of the cached static layer of the current frame, over the canvas's part of it (tests)
  function checksum(o) {
    if (!cur || !cur.lkey) return null;
    const L = layers.get(cur.lkey);
    if (!L) return null;
    const w = o && o.w ? Math.min(o.w, L.cv.width) : L.geo.W, h = o && o.h ? Math.min(o.h, L.cv.height) : L.geo.H;
    const d = L.cv.getContext('2d').getImageData(0, 0, Math.min(w, L.cv.width), Math.min(h, L.cv.height)).data;
    let hs = 2166136261 >>> 0;
    for (let i = 0; i < d.length; i += 4) { hs ^= d[i] | (d[i + 1] << 8) | (d[i + 2] << 16); hs = Math.imul(hs, 16777619) >>> 0; }
    return hs >>> 0;
  }
  // Test hook: the static layer of the current composition in the current
  // geometry (optionally without the accessories themselves; their light
  // stays), as pixels, to check where accessories change the picture.
  function layerPixels(o) {
    if (!cur || !cur.geo) return null;
    const lay = layout(cur, cur.geo);
    if (o && o.noAccessories) for (const p of lay.placed) if (p.kind === 'accessory') p.shown = false;
    const cv = paint(cur, cur.geo, lay);
    return { w: cv.width, h: cv.height, data: cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data };
  }
  // Test hook: paint the current composition for an arbitrary frame (canvas size
  // and actors), off screen, returning its record and its pixels' checksum over
  // a region — to show that the overlay's rectangle is ignored and that a
  // larger canvas only reveals more.
  function probe(F, w, h, hz, region) {
    if (!cur || cur.fallback) return null;
    const box = cur.artBox === undefined ? (cur.artBox = artBox(F.art || 'wisp', cur.artOpts) || null) : cur.artBox;
    const geo = geometry(F, w, h, hz, box);
    const lay = layout(cur, geo);
    const cv = paint(cur, geo, lay);
    const rg = region || { x: 0, y: 0, w: geo.W, h: geo.H };
    const d = cv.getContext('2d').getImageData(rg.x, rg.y, Math.min(rg.w, cv.width - rg.x), Math.min(rg.h, cv.height - rg.y)).data;
    let hs = 2166136261 >>> 0;
    for (let i = 0; i < d.length; i += 4) { hs ^= d[i] | (d[i + 1] << 8) | (d[i + 2] << 16); hs = Math.imul(hs, 16777619) >>> 0; }
    return { key: cur.sig + '|' + geo.key, sum: hs >>> 0, W: geo.W, H: geo.H, Wb: geo.Wb, Hb: geo.Hb, shown: lay.placed.filter((p) => p.shown).map((p) => p.kind + ':' + (p.from || p.id) + (p.x != null ? '@' + Math.round(p.x) + ',' + Math.round(p.y) : '')) };
  }
  return { begin, draw, last, origin, recompose, resources, forceSeed, debug, checksum, layerPixels, probe, compose, survey, geometry, projector, ROLE, CL, POOLS, _count: () => counter };
})();
