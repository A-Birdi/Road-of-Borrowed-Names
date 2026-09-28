/* Battle places: the backdrop of a battle is a glimpse of where it happens.
 *
 * At encounter entry (begin) the map around the encounter is read once:
 *  - STRUCTURE — indoors or out, the room or the stretch of country, the
 *    back wall with its openings, and the landmarks really there (ladder,
 *    stairs, the mill's gears and millstone, shelves, pillars, bells, a
 *    building front, the water wheel, a bridge, the shoreline…). Taken from
 *    the map's props, structures and tiles; never invented, never moved to
 *    another wall; a feature may be left out of view.
 *  - NEARBY CONTEXT — a subset of the real scenery within a few tiles:
 *    water and reeds by a bank, trees at a wood's edge, the barrels and
 *    crates standing near, rocks, fences, lanterns. Outdoors this follows the
 *    encounter's tile, so two places on one map look different.
 *  - ACCESSORIES — a few small themed clusters (sacks, a lantern on a crate,
 *    hanging scrolls, rope, tufts, shells…) chosen with a presentation seed:
 *    bounded in number, placed in valid zones (a hanging thing on the wall
 *    under the beam, sacks on the floor, reeds only by water), never over the
 *    creature, its knots, the party's corner or the text.
 * The view looks north, as the world's camera does: the back of the scene is
 * what lies beyond the encounter on the map, left is west. A small room is
 * one fixed glancing view of its back wall (the same structure wherever in
 * the room the encounter is); a large map is read around the encounter.
 *
 * The seed: default hash(map, tile, an in-memory encounter counter); forced
 * with opts.presentSeed or forceSeed(n). It is not saved. The composition is
 * fixed for the whole encounter; the static layer is cached per (composition,
 * frame) and a new frame (a resize, a new layout of the overlay) reframes the
 * same selection. Cosmetic randomness uses its own RB.util.rng; nothing here
 * reads or writes battle state or calls Math.random. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.battlePlaces = (function () {
  'use strict';
  const Art = () => RB.battlePlaceArt;
  const hashStr = (s) => RB.util.hashStr(s);
  let counter = 0, forced = null, cur = null, compN = 0, dbg = {};
  const layers = new Map();

  // ---- what each prop is to a backdrop ---------------------------------------------------------
  // landmark: part of the place's structure (always shown if it fits the view);
  // context: nearby scenery (a subset, nearest first). tall: stands against the
  // wall and rises (it may show above the party); dim: large and quiet enough
  // to stand in shadow behind the creature; wall: hangs on / stands against the
  // back wall.
  const L = (o) => Object.assign({ role: 'landmark' }, o);
  const Cx = (o) => Object.assign({ role: 'context' }, o);
  const ROLE = {
    ladder: L({ paint: 'ladder', wall: 1, tall: 1 }), stairs: L({ paint: 'stairs' }), gears: L({ paint: 'gear', wall: 1, dim: 1 }),
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
    // nearby scenery
    tree: Cx({ group: 'trees' }), orchard: Cx({ group: 'trees' }), pine: Cx({ group: 'trees' }), deadtree: Cx({ group: 'trees' }), bush: Cx({ group: 'bushes' }),
    reeds: Cx({ group: 'reeds' }), rock: Cx({ group: 'rocks' }), fence: Cx({ group: 'fence' }), lamppost: Cx({}), lantern: Cx({}), deadlantern: Cx({}),
    stump: Cx({}), co_scrub: Cx({ group: 'bushes' }), sb_drift: Cx({}), crate: Cx({}), barrel: Cx({}), hay: Cx({}), net: Cx({}), bench: Cx({}), cart: Cx({}),
    bookpile: Cx({}), pot: Cx({}), bottles: Cx({}), glassware: Cx({}), flowerpot: Cx({}), laundry: Cx({}), co_buckets: Cx({}), co_sheaf: Cx({}), co_hoshigaki: Cx({}),
    sb_woodpile: Cx({}), sb_icicles: Cx({ wall: 1 }), stone_marker: Cx({}), crystal: Cx({}), co_ashband: Cx({}), sg_bollard: Cx({}), sg_raft: Cx({ wet: 1 }), co_bunting: Cx({}),
    co_glasslantern: Cx({}), sb_frostlamp: Cx({}), sa_lamp: Cx({}), co_flasks: Cx({}), co_seat: Cx({}), chair: Cx({}), table: Cx({}), smalltable: Cx({}), teaset: Cx({}),
    anvil: Cx({}), snowman: Cx({}), sa_grave: Cx({}), co_tablet: Cx({}), sb_snowobs: Cx({}), co_iceblock: Cx({}), sb_bellpost: Cx({}), sg_stall: Cx({}), co_bar: Cx({}), co_wheel: Cx({}),
  };
  const WATER = { water: 1, shallow: 1, darkwater: 1 };
  // the ground as a small grid of codes (what each map cell is), for projecting onto the backdrop's ground
  const CELL = { water: 'w', shallow: 'w', darkwater: 'w', bridgeH: 'b', bridgeV: 'b', path: 'p', road: 'p', sand: 's', grass: 'g', flowers: 'g', tallgrass: 'g', field: 'g', snow: 'n', ice: 'n', ash: 'a', paper: 'q', atlas_sketch: 'q', stonefloor: 'o', glass: 'o', wood: 'd', tatami: 'd', carpet: 'd', cliff: 'c', wall: '#', void: '#', atlas_blank: '#' };
  const CODEOF = { meadow: 'g', sand: 's', snow: 'n', ash: 'a', paper: 'q', stone: 'o', earth: 'p', parch: 'q' };
  const GROUNDOF = { grass: 'meadow', flowers: 'meadow', tallgrass: 'meadow', field: 'meadow', sand: 'sand', snow: 'snow', ice: 'snow', ash: 'ash', paper: 'paper', stonefloor: 'stone', path: 'earth', road: 'earth', atlas_sketch: 'parch', wood: 'earth', carpet: 'stone', tatami: 'stone', glass: 'stone' };
  const INDOOR = { mill: 1, kiln: 1, archive: 1, observatory: 1, belltower: 1 };
  // region of the tile palette for a backdrop family (colours of the same world)
  const FAMREGION = { mill: 'reedwake', kiln: 'cinder', archive: 'archive', observatory: 'snowbell', belltower: 'lanternfall', still: 'sa_still', atlas: 'atlas' };

  // ---- reading the map ---------------------------------------------------------------------------
  function stateTest(cond) {
    const s = RB.game && RB.game.s;
    return !cond || !s || RB.state.test(s, cond);
  }
  function interiorBounds(m) {
    let xl = m.w, xr = -1, yt = m.h, yb = -1;
    for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
      const t = m.tiles[y * m.w + x];
      if (!t || t.id === 'wall' || t.id === 'void' || t.id === 'atlas_blank') continue;
      if (x < xl) xl = x; if (x > xr) xr = x; if (y < yt) yt = y; if (y > yb) yb = y;
    }
    if (xr < 0) return { xl: 0, xr: m.w - 1, yt: 0, yb: m.h - 1 };
    // a door gap in the bottom wall is not part of the room
    if (yb === m.h - 1) yb--;
    if (yt === 0) yt++;
    return { xl, xr, yt, yb };
  }
  // The view: which map columns span the stage, where the back plane is, and
  // how a map position maps to a fraction across the stage and a depth.
  function viewOf(m, where, indoor) {
    if (indoor) {
      const b = interiorBounds(m);
      const small = b.xr - b.xl + 1 <= 20 && b.yb - b.yt + 1 <= 16;
      if (small) return { mode: 'room', x0: b.xl, x1: b.xr, yBack: b.yt, yNear: b.yb, b };
      // a hall: the part around the encounter, back to the nearest wall ahead
      let yBack = Math.max(b.yt, where.y - 8);
      for (let y = where.y - 1; y >= Math.max(0, where.y - 8); y--) {
        let wall = 0, n = 0;
        for (let x = where.x - 4; x <= where.x + 4; x++) { const t = RB.maps.tileAt(m, x, y); n++; if (!t || t.id === 'wall' || t.id === 'void') wall++; }
        if (wall / n > 0.6) { yBack = y + 1; break; }
      }
      return { mode: 'hall', x0: where.x - 10, x1: where.x + 6, yBack, yNear: where.y + 2, b };
    }
    return { mode: 'land', x0: where.x - 10, x1: where.x + 6, yBack: where.y - 10, yNear: where.y + 3 };
  }
  const fracX = (v, mx) => 0.02 + 0.96 * ((mx - v.x0) / (v.x1 - v.x0 + 1));
  // depth tier of a map row: 'wall' (against the back wall), 'far', 'mid', 'near'
  function tierOf(v, my, h, where) {
    if (v.mode === 'room' || v.mode === 'hall') {
      if (my + (h || 1) - 1 <= v.yBack + (v.mode === 'room' ? 0 : 1)) return 'wall';
      const t = (my - v.yBack) / Math.max(1, v.yNear - v.yBack);
      return t < 0.62 ? 'mid' : my <= v.yNear + 1 ? 'near' : null;
    }
    const dy = my + (h || 1) - 1 - where.y;
    if (dy <= -4) return dy >= -10 ? 'far' : null;
    if (dy <= 0) return 'mid';
    return dy <= 3 ? 'near' : null;
  }

  function survey(m, where, fam, setting) {
    const indoor = setting ? setting === 'indoor' : RB.render.enclosed(m);
    const v = viewOf(m, where, indoor);
    const inView = (x, y, w, h) => x + (w || 1) - 1 >= v.x0 - 1 && x <= v.x1 + 1 && y + (h || 1) - 1 >= v.yBack - (v.mode === 'land' ? 0 : 1) && y <= v.yNear + 1;
    const items = [];
    const push = (it) => { it.fx = fracX(v, it.mx + (it.w || 1) / 2 - 0.5); it.tier = it.tier || tierOf(v, it.my, it.h, where); if (it.tier) items.push(it); };
    // props in their current state
    for (const p of m.props) {
      if (p.apron || (p.if && !stateTest(p.if))) continue;
      const role = ROLE[p.p];
      if (!role) continue;
      const pd = RB.props.P[p.p];
      const w = p.w || (pd && pd.w) || 1, h = p.h || (pd && pd.h) || 1;
      if (!inView(p.x, p.y, w, h)) continue;
      push({ src: 'prop', id: p.p, kind: role.role, role, mx: p.x, my: p.y, w, h, o: p.o || null, at: p.x + ',' + p.y });
    }
    // buildings (outdoors): the south face shows
    for (const st of m.structs || []) {
      if (st.if && !stateTest(st.if)) continue;
      if (!inView(st.x, st.y, st.w, st.h)) continue;
      push({ src: 'struct', id: 'building', kind: 'landmark', role: { paint: 'facade', big: 1 }, mx: st.x, my: st.y, w: st.w, h: st.h, st, at: st.x + ',' + st.y });
    }
    // tiles: ground under and around the encounter, water, cliffs, bridges, the path, openings in the back wall
    const cols = {};
    const ground = {};
    for (let y = v.yBack - 1; y <= v.yNear + 1; y++) for (let x = v.x0; x <= v.x1; x++) {
      const t = RB.maps.tileAt(m, x, y);
      if (!t) continue;
      const tier = tierOf(v, y, 1, where) || (y < v.yBack ? 'far' : null);
      if (!tier) continue;
      const c = cols[x] = cols[x] || {};
      if (WATER[t.id]) (c.water = c.water || {})[tier] = (c.water[tier] || 0) + 1;
      if (t.id === 'cliff') (c.cliff = c.cliff || {})[tier] = 1;
      if (t.id === 'bridgeH' || t.id === 'bridgeV') (c.bridge = c.bridge || {})[tier] = t.id;
      if (t.id === 'path' || t.id === 'road') (c.path = c.path || {})[tier] = 1;
      if (Math.abs(x - where.x) <= 3 && Math.abs(y - where.y) <= 3 && GROUNDOF[t.id]) ground[GROUNDOF[t.id]] = (ground[GROUNDOF[t.id]] || 0) + 1;
    }
    // flooded floors drawn as props count as water where they stand
    for (const p of m.props) if ((p.p === 'lf_flood' || p.p === 'water') && (!p.if || stateTest(p.if)) && p.x >= v.x0 && p.x <= v.x1) {
      const tier = tierOf(v, p.y, 1, where); if (!tier) continue;
      const c = cols[p.x] = cols[p.x] || {}; (c.water = c.water || {})[tier] = (c.water[tier] || 0) + 1;
    }
    // the grid of ground codes over the view (rows from the back plane to just behind the viewer)
    const gy0 = v.yBack - 1, gy1 = v.yNear + 1, rows = [];
    for (let y = gy0; y <= gy1; y++) {
      let row = '';
      for (let x = v.x0; x <= v.x1; x++) { const t = RB.maps.tileAt(m, x, y); row += t ? CELL[t.id] || '.' : '#'; }
      rows.push(row);
    }
    for (const p of m.props) if ((p.p === 'lf_flood' || p.p === 'water') && (!p.if || stateTest(p.if)) && p.x >= v.x0 && p.x <= v.x1 && p.y >= gy0 && p.y <= gy1) {
      const r = rows[p.y - gy0]; rows[p.y - gy0] = r.slice(0, p.x - v.x0) + 'w' + r.slice(p.x - v.x0 + 1);
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
    if (v.mode === 'land') for (const r of runs('cliff', ['far'])) if (r.x1 - r.x0 >= 1) push({ src: 'tiles', id: 'cliffs', kind: 'landmark', role: { paint: 'rocks' }, mx: r.x0, my: where.y - 6, w: r.x1 - r.x0 + 1, h: 1, tier: 'far', at: r.x0 + '-' + r.x1 });
    for (const r of runs('bridge', ['far', 'mid', 'wall'])) push({ src: 'tiles', id: 'bridge', kind: 'landmark', role: { paint: 'bridge' }, mx: r.x0, my: where.y - 3, w: r.x1 - r.x0 + 1, h: 1, tier: 'mid', at: r.x0 + '-' + r.x1 });
    if (v.mode === 'land') {
      // a path that leads from the encounter toward the back of the scene
      const pr = runs('path', ['mid']), pf = runs('path', ['far']);
      if (pr.length && pf.length) {
        const near = pr.reduce((a, b) => (Math.abs(b.x0 - where.x) < Math.abs(a.x0 - where.x) ? b : a));
        const far = pf.reduce((a, b) => (Math.abs(b.x0 - near.x0) < Math.abs(a.x0 - near.x0) ? b : a));
        items.push({ src: 'tiles', id: 'path', kind: 'context', role: { paint: 'path' }, mx: near.x0, my: where.y, w: near.x1 - near.x0 + 1, h: 1, fx: fracX(v, (near.x0 + near.x1) / 2), fx2: fracX(v, (far.x0 + far.x1) / 2), tier: 'mid', at: near.x0 + '→' + far.x0 });
      }
    }
    if (v.mode !== 'land') {
      // openings in the back wall: exits or floor running on through the top wall row
      const yw = v.yBack - 1;
      let open = null;
      for (let x = v.x0; x <= v.x1 + 1; x++) {
        const t = RB.maps.tileAt(m, x, yw);
        const gap = t && t.id !== 'wall' && t.id !== 'void' && t.id !== 'atlas_blank';
        if (gap && !open) open = { x0: x, x1: x };
        if (gap) open.x1 = x;
        if (!gap && open) { push({ src: 'tiles', id: 'doorway', kind: 'landmark', role: { paint: 'doorway', wall: 1, tall: 1 }, mx: open.x0, my: v.yBack, w: open.x1 - open.x0 + 1, h: 1, tier: 'wall', at: open.x0 + ',' + yw }); open = null; }
      }
    }
    // the ground the encounter stands on
    let groundKind = null, best = 0;
    for (const k in ground) if (ground[k] > best) { best = ground[k]; groundKind = k; }
    return { v, indoor, items, ground: groundKind, grid };
  }

  // Windows: light comes from the building's windows behind the viewer (the
  // front of the building whose door leads into this room).
  function frontOf(mapId) {
    for (const id in RB.content.maps) for (const st of RB.content.maps[id].structs || []) if (st.to === mapId) return Object.assign({ map: id }, st);
    return null;
  }
  function ambientOf(def) {
    const s = RB.game && RB.game.s;
    for (const a of def.alt || []) if (s && RB.state.test(s, a.if)) return { ambient: a.ambient || {}, night: a.night };
    return { ambient: def.ambient || {}, night: def.night };
  }

  // ---- composing: structure and context (fixed), accessories (seeded) ------------------------------
  // Accessory clusters per family: members are ACC sprites ('a:') or world
  // props ('w:'), with offsets (dx, dy) from the cluster's anchor. zone: base
  // (on the floor by the wall or at a side), hang (on the wall, under the
  // beam), fore (the near floor at a side). needs: a condition on the place.
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
  // where a cluster may go when its own zone is full or out of view
  const ZONES = { base: ['base', 'side', 'fore'], side: ['side', 'base', 'fore'], fore: ['fore', 'side', 'base'], hang: ['hang'], beam: ['beam', 'hang'], corner: ['corner'] };
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

  function familyOf(key, setting) {
    if (key === 'still') return setting === 'indoor' ? 'stillIn' : 'stillOut';
    return key;
  }
  // Compose the place for an encounter (seed-independent) and choose its accessories (seeded).
  function compose(enemy, where, seed) {
    const key = enemy.bgKey || enemy.bg || enemy.region || 'reedwake';
    let m = null;
    try { m = where && RB.content.maps[where.map] ? RB.maps.compile(where.map) : null; } catch (e) { m = null; }
    const out = { id: ++compN, key, seed: seed >>> 0, where: where || null, map: where ? where.map : null, x: where ? where.x : null, y: where ? where.y : null };
    if (!m) { out.fallback = 'no map data for this encounter: the region backdrop'; return out; }
    const sv = survey(m, where, key, enemy.setting);
    const setting = enemy.setting || (sv.indoor ? 'indoor' : 'outdoor');
    // an interior backdrop family only indoors (placeEnemy already keeps it so)
    out.setting = setting;
    out.fam = familyOf(key, setting);
    out.indoor = setting === 'indoor';
    out.region = m.region === 'interior' ? (FAMREGION[key] || 'reedwake') : m.region;
    out.palRegion = RB.tiles.PAL[out.region] ? out.region : (FAMREGION[key] || 'reedwake');
    out.view = sv.v;
    out.small = sv.v.mode === 'room';
    out.ground = sv.ground;
    out.grid = sv.grid;
    // the map's light as the world shows it now (maps may have an evening or night variant)
    const amb = ambientOf(m.def);
    out.dark = amb.ambient.dark || 0;
    out.tint = amb.ambient.tint || null;
    out.weather = amb.ambient.weather || null;
    out.front = out.indoor ? frontOf(m.id) : null;
    // daylight through the front windows: only when it is not night outside
    const outside = out.front && out.front.map ? RB.content.maps[out.front.map] : null;
    out.night = !!(amb.night || (outside && ambientOf(outside).night));
    // structure: every landmark in view; context: the nearest few per kind
    const lm = sv.items.filter((it) => it.kind === 'landmark');
    const ctx = sv.items.filter((it) => it.kind === 'context');
    const dist = (it) => Math.abs(it.mx + (it.w || 1) / 2 - 0.5 - where.x) + Math.abs(it.my + (it.h || 1) - 1 - where.y) * 0.8;
    ctx.sort((a, b) => dist(a) - dist(b) || a.mx - b.mx || a.my - b.my);
    const keep = [], perKind = {};
    // far scenery of a kind (trees, bushes, reeds, rocks, fences) is kept whole: it becomes a line on the horizon
    const LINE = { trees: 1, bushes: 1, reeds: 1, rocks: 1, fence: 1 };
    out.lines = ctx.filter((it) => it.tier === 'far' && LINE[it.role.group]).map((it) => ({ group: it.role.group, fx: it.fx, from: it.src + ':' + it.id + '@' + it.at }));
    for (const it of ctx) {
      if (it.tier === 'far' && LINE[it.role.group]) continue;
      const g = it.role.group || it.id;
      const lim = it.role.group === 'trees' ? 8 : it.role.group ? 6 : 2;
      if ((perKind[g] || 0) >= lim) continue;
      perKind[g] = (perKind[g] || 0) + 1;
      keep.push(it);
      if (keep.length >= 18) break;
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
    // accessories: seeded, bounded, themed
    const rng = RB.util.rng(seed ^ 0x5bd1e995);
    const poolKey = out.fam === 'stillIn' ? 'still' : out.fam === 'stillOut' ? 'stillOut' : POOLS[out.fam] ? out.fam : out.indoor ? 'interior' : 'reedwake';
    const pool = POOLS[poolKey].filter((k, i, a) => a.indexOf(k) === i && (!CL[k].needs || has[CL[k].needs]));
    // indoors: one or two things on the wall, two or three on the floor; outdoors: three to five on the ground
    const onWall = (k) => CL[k].zone === 'hang' || CL[k].zone === 'beam' || CL[k].zone === 'corner';
    const wallPool = rng.shuffle(pool.filter((k) => onWall(k) && !CL[k].extra)), floorPool = rng.shuffle(pool.filter((k) => !onWall(k)));
    const extras = pool.filter((k) => CL[k].extra && rng() < 0.5);
    const chosen = out.indoor ? wallPool.slice(0, 2 + rng.int(2)).concat(floorPool.slice(0, 2 + rng.int(2)), extras) : floorPool.slice(0, 3 + rng.int(3));
    // a lit room keeps at most one extra light; sides alternate so clusters spread
    let lights = 0;
    out.accessories = [];
    chosen.forEach((k, i) => {
      if (CL[k].light && ++lights > 1) return;
      out.accessories.push({ cluster: k, zone: CL[k].zone, zones: ZONES[CL[k].zone], side: (i + (seed & 1)) % 2 ? 'L' : 'R', order: i, variant: rng.int(3) });
    });
    return out;
  }
  function zoneName(o, sv) {
    if (o.indoor) return (o.small ? 'room' : 'hall') + ':' + o.key;
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

  // ---- layout: the composition in the current frame ---------------------------------------------------
  const inter = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
  const rect = (x, y, w, h) => ({ x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h) });
  function frameOf(F, W, H, hz, u) {
    const S = { x: F.S.x / u, y: F.S.y / u, w: F.S.w / u, h: F.S.h / u };
    const sc = (F.scale || 1) / u, ps = (F.ps || F.scale || 1) / u;
    const ex = F.ex / u, ey = F.ey / u, px = F.px / u, py = F.py / u;
    const ab = F.box || { l: 92, r: 92 };
    const top = F.ext ? F.ext.top : -96, bot = F.ext ? F.ext.bottom : 90;
    // its drawing, its shadow (58 wide) and its knots (a fan 60 each side), with room to move
    const hl = Math.max(ab.l, 72) * sc + 10, hr = Math.max(ab.r, 72) * sc + 10;
    const cy1 = Math.max(ey + bot * sc, ey + (88 + 26) * sc + 12 / u);
    const C = rect(ex - hl, ey + top * sc - 6, hl + hr, cy1 - (ey + top * sc) + 10);
    // the party's corner: the lower-left third, and wherever the party stands
    // (with room for taller battle sprites)
    const px1 = Math.max(S.x + S.w * 0.42, px + 140 * ps), py0 = Math.min(S.y + S.h * 0.42, py + 48 * ps - 112 * ps);
    const Pt = rect(Math.min(S.x, px - 10), py0, px1 - Math.min(S.x, px - 10), S.y + S.h - py0 + 40);
    return { W, H, HZ: Math.round(hz / u), S, C, P: Pt, u, feet: Math.min(S.y + S.h, ey + 84 * sc), key: [W, H, Math.round(hz / u), Math.round(S.x), Math.round(S.y), Math.round(S.w), Math.round(S.h), C.x, C.y, C.w, C.h, Pt.x, Pt.y, Pt.w].join(',') };
  }
  const spriteOf = (ref, region, v) => {
    const [t, id] = ref.split(':');
    const A = Art();
    return t === 'w' ? A.worldProp(id, region, { cx: v | 0, cy: 1 }) : A.acc(id, region, v);
  };

  function layout(comp, fr) {
    const A = Art();
    const { S, C, P, HZ } = fr;
    const placed = [], occ = [C, P];
    const X = (f) => S.x + f * S.w;
    const region = comp.palRegion;
    const out = { placed, occ, beamY: null, lights: [], shaft: null, wallTop: Math.max(0, S.y - 40) };
    const PJ = out.P = projector(comp, fr);
    const wm = out.water = waterMask(comp, fr, PJ);
    // is a footing (a line along the ground at y from x0 to x1) on water?
    const wet = (x0, x1, y) => { if (!wm) return false; y = Math.round(y); if (y < 0 || y >= wm.H) return false; for (let x = Math.max(0, Math.round(x0)); x <= Math.min(wm.W - 1, Math.round(x1)); x += 2) if (wm.bytes[y * wm.W + x]) return true; return false; };
    // where a thing standing on map cells (mx..mx+w, bottom row my+h-1) meets the ground here
    const standAt = (it) => { const y = Math.round(PJ.Y(it.my + it.h - 0.35)); return { x: Math.round(PJ.X(it.mx + it.w / 2, y)), y }; };
    // occ[0] is the creature, occ[1] the party; landmarks decide about those two themselves
    const free = (r, actorsToo) => !occ.some((o, i) => (!actorsToo && i < 2 ? false : inter(r, o)));
    const inStage = (r) => r.x >= S.x - 2 && r.x + r.w <= S.x + S.w + 2 && r.y >= S.y - 2 && r.y + r.h <= S.y + S.h + 2;
    // structure first, in order across the stage
    const lm = comp.structure.slice().sort((a, b) => a.fx - b.fx);
    const cf = (C.x + C.w / 2 - S.x) / S.w;
    for (const it of lm) {
      const rec = { kind: 'landmark', id: it.id, from: it.src + ':' + it.id + '@' + it.at, tier: it.tier, paint: it.role.paint, shown: false };
      placed.push(rec);
      const p = it.role.paint;
      if (p === 'water' || p === 'rocks' || p === 'path' || p === 'bridge') { rec.shown = true; rec.x0 = X(it.fx - (it.w / 2) / (comp.view.x1 - comp.view.x0 + 1) * 0.96); rec.x1 = X(it.fx + (it.w / 2) / (comp.view.x1 - comp.view.x0 + 1) * 0.96); rec.it = it; continue; }
      if (p === 'facade') {
        // a building front: nearer ones larger; hazed with distance
        const dy = it.my + it.h - 1 - (comp.y || 0);
        const tp = dy >= -3 ? 22 : dy >= -6 ? 16 : 12;
        const by = dy >= -3 ? Math.round(Math.min(PJ.Y(it.my + it.h), HZ + 12)) : HZ;
        const wpx = it.w * tp, x0 = Math.round(PJ.X(it.mx + it.w / 2, by) - wpx / 2);
        Object.assign(rec, { shown: x0 + wpx > S.x - 10 && x0 < S.x + S.w + 10, x: x0, y: by - tp * 2.5, w: wpx, h: tp * 2.5, by, tp, it, haze: dy >= -3 ? 0.12 : dy >= -6 ? 0.25 : 0.4 });
        continue;
      }
      if (p === 'wheel') {
        const dy = it.my + it.h - 1 - (comp.y || 0);
        const r = dy >= -3 ? 26 : dy >= -6 ? 18 : 13;
        const cx = Math.round(PJ.X(it.mx + it.w / 2, HZ)), cy = HZ - r + 4;
        Object.assign(rec, { shown: true, x: cx - r - 4, y: cy - r - 4, w: r * 2 + 8, h: r * 2 + 8, cx, cy, r, it, haze: dy >= -3 ? 0.1 : dy >= -6 ? 0.22 : 0.36 });
        continue;
      }
      if (p === 'gear') {
        const r = Math.max(22, Math.min(40, Math.round((HZ - S.y) * 0.34)));
        const cx = X(it.fx), cy = HZ - r - 12;
        Object.assign(rec, { shown: true, dimmed: inter(rect(cx - r, cy - r, r * 2, r * 2), C), x: cx - r - 4, y: cy - r * 1.9, w: r * 2 + r + 8, h: r * 3.2, cx, cy, r, it });
        continue;
      }
      if (p === 'doorway') {
        const w = Math.max(20, Math.min(40, it.w * 20)), h = Math.min(56, Math.max(34, (HZ - S.y) * 0.55)), cx = X(it.fx);
        Object.assign(rec, { shown: true, x: cx - w / 2 - 3, y: HZ - h - 4, w: w + 6, h: h + 4, cx, dw: w, dh: h, it, dimmed: inter(rect(cx - w / 2, HZ - h, w, h), C) });
        continue;
      }
      if (p === 'stairs' && it.tier !== 'wall') {
        // down through the floor: at its side of the scene, in front
        const w = 30, d = Math.round(w * 0.42);
        let f = it.fx;
        const y = it.tier === 'near' ? S.y + S.h - 6 : HZ + Math.round((fr.feet - HZ) * 0.55);
        let r = rect(X(f) - w / 2 - 2, y - d - 22, w + 4, d + 26);
        if (inter(r, C) || inter(r, P)) {
          const nx = f >= cf ? C.x + C.w + 4 : C.x - w - 8;
          r = rect(nx, r.y, r.w, r.h);
        }
        const ok = !inter(r, C) && !inter(r, P) && r.x >= S.x - 4 && r.x + r.w <= S.x + S.w + 8;
        Object.assign(rec, { shown: ok, x: r.x, y: r.y, w: r.w, h: r.h, sx: r.x + 2, sy: y, sw: w, it });
        if (ok) occ.push(r);
        continue;
      }
      if (p === 'ladder') {
        const cx = X(it.fx), top = Math.max(0, S.y - 30);
        Object.assign(rec, { shown: true, x: cx - 12, y: top, w: 24, h: HZ - top + 2, cx, top, it });
        occ.push(rect(cx - 12, top, 24, HZ - top));
        continue;
      }
      // a world prop: stands on the floor line of its depth
      const spr = A.worldProp(it.id, region, { cx: it.mx, cy: it.my, o: it.o });
      if (!spr) continue;
      let y, x = X(it.fx);
      if (it.tier === 'wall' || it.tier === 'far' || it.role.back || it.role.row) y = HZ + 3;
      else ({ x, y } = standAt(it));
      let r = rect(x - spr.ax, y - spr.ay, spr.w, spr.h);
      const dimOK = it.role.dim || it.role.tall;
      // a big low thing at the back that the party would hide: along the wall, just clear of them
      if (it.role.back && inter(r, P) && it.fx >= (P.x + P.w - S.x) / S.w - 0.25) { x = P.x + P.w + 2 + spr.ax; r = rect(x - spr.ax, r.y, spr.w, spr.h); }
      if (inter(r, C) && !dimOK) {
        // slide it out from behind the creature, keeping its side of the scene
        const left = it.fx < cf;
        const nx = left ? C.x - spr.w + spr.ax - 2 : C.x + C.w + spr.ax + 2;
        const r2 = rect(nx - spr.ax, r.y, spr.w, spr.h);
        if (!inter(r2, P) || it.role.tall) { x = nx; r = r2; }
      }
      const behindParty = inter(r, P), behindC = inter(r, C);
      const ok = (!behindC || dimOK) && (!behindParty || it.role.tall || it.role.wall && r.y < P.y - 12) && free(r);
      Object.assign(rec, { shown: ok || (it.tier === 'wall' && dimOK), x: r.x, y: r.y, w: r.w, h: r.h, spr, dimmed: behindC, it });
      if (rec.shown && !behindC) occ.push(r);
    }
    // nearby context: nearest first, only where it does not crowd the actors
    for (const it of comp.context) {
      const rec = { kind: 'context', id: it.id, from: it.src + ':' + it.id + '@' + it.at, tier: it.tier, shown: false };
      placed.push(rec);
      if (it.role.paint === 'path') { Object.assign(rec, { shown: true, paint: 'path', fx: it.fx, fx2: it.fx2 }); continue; }
      if (it.tier === 'far') continue;
      const spr = A.worldProp(it.id, region, { cx: it.mx, cy: it.my, o: it.o });
      if (!spr) continue;
      let y, x = X(it.fx);
      if (it.tier === 'wall') y = HZ + 3;
      else ({ x, y } = standAt(it));
      // where it stands, or a little further out toward its own edge if that is taken
      const out1 = x >= S.x + cf * S.w ? 1 : -1;
      let r = null;
      for (let k = 0; k <= 10 && !r; k++) {
        const q = rect(x - spr.ax + out1 * k * 3, y - spr.ay, spr.w, spr.h);
        if (!inStage(rect(q.x + q.w * 0.3, q.y + q.h * 0.5, q.w * 0.4, q.h * 0.5))) break;
        if (free(q, true) && (it.role.wet || !wet(q.x + q.w * 0.2, q.x + q.w * 0.8, y - 1))) r = q;
      }
      if (!r) continue;
      Object.assign(rec, { shown: true, x: r.x, y: r.y, w: r.w, h: r.h, spr, it });
      occ.push(r);
    }
    // accessories: each cluster goes to the first free place along a band of
    // its zone (its own side first), packed from the band's outer edge inward
    const bands = zonesOf(fr, comp);
    out.beamY = bands.beamY;
    for (const a of comp.accessories) {
      const cl = CL[a.cluster];
      const rec = { kind: 'accessory', id: a.cluster, zone: a.zone, side: a.side, shown: false, members: [] };
      placed.push(rec);
      if (dbg.noAccessories) continue;
      const zl = a.zones || [a.zone];
      const tries = [];
      zl.forEach((z, zi) => (bands[z] || []).forEach((b) => tries.push(Object.assign({ zi }, b))));
      tries.sort((p, q) => p.zi - q.zi || (p.side === a.side ? 0 : 1) - (q.side === a.side ? 0 : 1));
      const members = (ax, ay) => cl.items.map(([ref, dx, dy, v]) => {
        const s = spriteOf(ref, region, (v + a.variant) % 3);
        if (!s) return null;
        return { ref, s, x: Math.round(ax + dx - s.ax), y: Math.round(ay + dy - s.ay), w: s.w, h: s.h, v: (v + a.variant) % 3 };
      }).filter(Boolean);
      const box = (mem) => { const bx = Math.min(...mem.map((q) => q.x)), by = Math.min(...mem.map((q) => q.y)); return rect(bx, by, Math.max(...mem.map((q) => q.x + q.w)) - bx, Math.max(...mem.map((q) => q.y + q.h)) - by); };
      search: for (const b of tries) {
        // scan the band in 3-px steps from its outer end (or from its middle)
        const probe = members(0, 0);
        if (!probe.length) break;
        const pb = box(probe);
        const x0 = b.x0 - pb.x, x1 = b.x1 - (pb.x + pb.w);
        if (x1 < x0) continue;
        const n = Math.floor((x1 - x0) / 3);
        for (let i = 0; i <= n; i++) {
          const ax = b.from === 'right' ? x1 - i * 3 : b.from === 'mid' ? Math.round((x0 + x1) / 2 + (i % 2 ? -1 : 1) * Math.ceil(i / 2) * 3) : x0 + i * 3;
          const mem = members(ax, b.y);
          const bb = box(mem);
          if (!free(rect(bb.x - 3, bb.y - 1, bb.w + 6, bb.h + 2), true)) continue;
          // nothing set down on water; what grows by water only by it
          if (b.zone !== 'hang' && b.zone !== 'beam' && b.zone !== 'corner' && wet(bb.x + bb.w * 0.15, bb.x + bb.w * 0.85, b.y - 1)) continue;
          if (cl.needs === 'water' && !(wet(bb.x - 24, bb.x + bb.w + 24, b.y - 1) || wet(bb.x - 24, bb.x + bb.w + 24, b.y + 6) || wet(bb.x - 24, bb.x + bb.w + 24, b.y - 8))) continue;
          // at most a third of it past the stage's edge
          if (bb.x + bb.w * 0.66 > b.edge.r || bb.x + bb.w * 0.34 < b.edge.l) continue;
          rec.zone = zl[b.zi];
          Object.assign(rec, { shown: true, x: bb.x, y: bb.y, w: bb.w, h: bb.h, spot: b.name, members: mem, rail: cl.rail ? rect(bb.x - 3, b.y - 1, bb.w + 6, 3) : null });
          occ.push(bb);
          for (const q of mem) if (q.s.glow) out.lights.push({ x: q.x + q.s.ax + q.s.glow[0], y: q.y + q.s.ay + q.s.glow[1], r: q.s.glow[2] });
          break search;
        }
      }
    }
    return out;
  }
  // The free zones of this frame, as bands (x0..x1 along an anchor line y):
  // base — on the floor line by the back wall, at the sides the actors leave;
  // hang — on the wall under the beam (indoors); beam — hung from the beam;
  // fore — the near floor at the right and left edges; side — the floor
  // between the horizon and the creature's feet, beside it; corner — where the
  // wall meets the beam at the stage's top-left. A band may run a little past
  // the stage's outer edge (a thing partly out of view frames the scene).
  function zonesOf(fr, comp) {
    const { S, C, P, HZ } = fr;
    const z = { base: [], hang: [], beam: [], fore: [], side: [], corner: [] };
    const over = 14;
    const right0 = C.x + C.w + 2, right1 = S.x + S.w + over, left0 = S.x - over, left1 = Math.min(C.x - 2, S.x + S.w * 0.5);
    const beamY = Math.round(Math.max(S.y + 2, Math.min(HZ - 60, S.y + 8)));
    z.beamY = comp.indoor ? beamY : null;
    const edge = { l: S.x, r: S.x + S.w };
    const band = (list, side, x0, x1, y, from, name) => { if (x1 - x0 > 8) list.push({ side, x0: Math.round(x0), x1: Math.round(x1), y: Math.round(y), from, name, edge, zone: name.split(':')[0] }); };
    band(z.base, 'R', right0, right1, HZ + 4, 'right', 'base:R');
    band(z.base, 'L', left0, Math.min(P.x, left1), HZ + 4, 'left', 'base:L');
    if (comp.indoor) {
      const hy = beamY + 11, wallBottom = Math.min(HZ - 8, P.y - 4);
      if (wallBottom - hy > 24) band(z.hang, 'L', S.x + 4, left1, hy, 'mid', 'hang:L');
      band(z.hang, 'R', right0, S.x + S.w + 4, hy, 'right', 'hang:R');
      band(z.beam, 'L', S.x + 10, left1, beamY + 9, 'mid', 'beam:L');
      band(z.beam, 'R', right0, S.x + S.w, beamY + 9, 'right', 'beam:R');
      band(z.corner, 'L', S.x + 1, S.x + 16, beamY + 9, 'left', 'corner:L');
    }
    band(z.fore, 'R', right0, right1, S.y + S.h - 5, 'right', 'fore:R');
    band(z.fore, 'L', left0, Math.min(P.x, left1), S.y + S.h - 4, 'left', 'fore:L');
    band(z.side, 'R', right0, right1, Math.round(HZ + (fr.feet - HZ) * 0.5), 'right', 'side:R');
    return z;
  }

  // ---- the ground plane: map cells projected into the backdrop ---------------------------------------------
  // Columns spread from the vanishing line (the creature outdoors, the room's
  // middle indoors) as they come nearer; rows fall from the horizon to below
  // the stage. Outdoors the encounter's own row lands at the creature's feet
  // and the row behind it under the party.
  function projector(comp, fr) {
    const v = comp.view, { S, HZ, H } = fr;
    const span = v.x1 - v.x0 + 1;
    const land = v.mode === 'land';
    const bx = (c) => S.x + S.w * (0.02 + 0.96 * (c - v.x0) / span);
    const cx = land ? fr.C.x + fr.C.w / 2 : S.x + S.w / 2;
    let Y;
    if (land) {
      const A = [[-3.5, HZ], [0.5, fr.feet], [1.5, S.y + S.h - 8], [3.5, H + 30]];
      Y = (row) => {
        const d = row - comp.y;
        if (d <= A[0][0]) return HZ - Math.min(6, (A[0][0] - d) * 1);
        for (let i = 1; i < A.length; i++) if (d <= A[i][0]) { const [a0, y0] = A[i - 1], [a1, y1] = A[i]; return y0 + (y1 - y0) * ((d - a0) / (a1 - a0)); }
        return A[3][1] + (d - 3.5) * 30;
      };
    } else {
      const n = v.yNear + 1 - v.yBack;
      Y = (row) => (row <= v.yBack ? HZ : HZ + (S.y + S.h - 6 - HZ) * Math.pow((row - v.yBack) / n, 1.15));
    }
    const sp = (y) => 1 + (land ? 0.6 : 0.45) * Math.max(0, (y - HZ) / Math.max(1, H - HZ));
    const X = (c, y) => cx + (bx(c) - cx) * sp(y);
    return { X, Y, bx, cx, land };
  }
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
  // Paint the ground cells that differ from the ground's base: paths, sand,
  // grass, snow, stone, cliffs; then water (textured, with a lit shore where
  // it meets land, reeds on this map's banks) and the bridges over it.
  // Helpers over the ground grid in this frame: the code at a map cell, a
  // cell's projected corners, whether a row lies on the ground plane, and a
  // row-by-row fill whose sides, where they meet another kind of ground,
  // wander by a couple of pixels in steps of three rows (clustered, never
  // single-pixel noise), so patches read as ground rather than tiles.
  function cellsOf(comp, fr, P) {
    const G = comp.grid;
    const at = (mx, my) => { const r = G.rows[my - G.y0]; return r ? r[mx - G.x0] || '#' : '#'; };
    const quadPts = (mx, my, w) => {
      const y0 = Math.round(P.Y(my)), y1 = Math.round(P.Y(my + 1));
      return y1 - y0 < 1 ? null : [P.X(mx, y0), y0, P.X(mx + (w || 1), y0), y0, P.X(mx + (w || 1), y1), y1, P.X(mx, y1), y1];
    };
    const near = (my) => (P.land ? my - comp.y >= -3 : my >= comp.view.yBack);
    const fillCell = (ctx, q, col, jl, jr, seed) => {
      ctx.fillStyle = col;
      const top = q[1], bot = q[5];
      for (let y = top; y < bot; y++) {
        const u = (y + 0.5 - top) / Math.max(1, bot - top);
        let l = q[0] + (q[6] - q[0]) * u, r = q[2] + (q[4] - q[2]) * u;
        const k = Math.floor(y / 3);
        if (jl) l += ((RB.tiles.hh(k, seed, 1) % 5) - 2);
        if (jr) r += ((RB.tiles.hh(k, seed, 2) % 5) - 2);
        const a = Math.round(l), b = Math.round(r);
        if (b > a) ctx.fillRect(a, y, b - a, 1);
      }
    };
    return { G, at, quadPts, near, fillCell, rowsN: G.rows.length, colsN: G.rows[0].length };
  }
  // The water of this frame as a mask (canvas + a byte per pixel), built once
  // per layout: painted through, and read so that nothing is set down on water.
  function waterMask(comp, fr, P) {
    if (!comp.grid) return null;
    const { at, quadPts, near, fillCell, rowsN, colsN, G } = cellsOf(comp, fr, P), { HZ } = fr;
    const mask = RB.sprites.makeCanvas(fr.W, fr.H), mg = mask.getContext('2d', { willReadFrequently: true });
    let any = false, y0 = 1e9, y1 = -1e9;
    for (let j = 0; j < rowsN; j++) {
      const my = G.y0 + j;
      for (let i = 0; i < colsN; i++) {
        const mx = G.x0 + i;
        if (at(mx, my) !== 'w' && at(mx, my) !== 'b') continue;
        let q;
        if (near(my)) q = quadPts(mx, my);
        else if (P.land) { const x0 = P.bx(mx), x1 = P.bx(mx + 1); q = [x0, HZ - 6, x1, HZ - 6, x1, HZ + 1, x0, HZ + 1]; }
        if (!q) continue;
        const wl = at(mx - 1, my) !== 'w' && at(mx - 1, my) !== 'b', wr = at(mx + 1, my) !== 'w' && at(mx + 1, my) !== 'b';
        fillCell(mg, [q[0] - (wl ? 0 : 1), q[1], q[2] + (wr ? 0 : 1), q[3], q[4] + (wr ? 0 : 1), q[5], q[6] - (wl ? 0 : 1), q[7]], '#000', wl && near(my), wr && near(my), mx * 17 + my);
        any = true; y0 = Math.min(y0, q[1]); y1 = Math.max(y1, q[5]);
      }
    }
    if (!any) return null;
    const d = mg.getImageData(0, 0, fr.W, fr.H).data, bytes = new Uint8Array(fr.W * fr.H);
    for (let i = 0; i < bytes.length; i++) bytes[i] = d[i * 4 + 3] > 0 ? 1 : 0;
    return { canvas: mask, bytes, y0, y1, W: fr.W, H: fr.H };
  }
  function groundCells(g, comp, fr, pal, P, wm) {
    if (!comp.grid) return;
    const K = RB.propKit, A = Art(), { HZ, H, S } = fr;
    const baseCode = comp.indoor ? null : CODEOF[comp.ground] || 'g';
    const { at, quadPts, near, fillCell, G } = cellsOf(comp, fr, P);
    const rowsN = G.rows.length, colsN = G.rows[0].length;
    // land cells of another kind than the base
    for (let j = 0; j < rowsN; j++) {
      const my = G.y0 + j;
      if (!near(my)) continue;
      for (let i = 0; i < colsN; i++) {
        const mx = G.x0 + i, c = at(mx, my);
        if (c === baseCode || !CELLCOL[c] || (comp.indoor && c !== 'o' && c !== 'd')) continue;
        if (comp.indoor && c === 'd' && comp.floorCode === 'd') continue;
        if (comp.indoor && c === 'o' && comp.floorCode === 'o') continue;
        const q = quadPts(mx, my);
        if (!q) continue;
        const col = c === 'd' ? [pal.floor[1], pal.floor[2]] : CELLCOL[c](pal, comp.ground);
        fillCell(g, q, col[0], at(mx - 1, my) !== c, at(mx + 1, my) !== c, mx * 31 + my);
        // a darker edge where it meets the base ground (the edge nearer the horizon)
        if (at(mx, my - 1) !== c) A.R(g, Math.min(q[0], q[2]), q[1], Math.abs(q[2] - q[0]), 1, col[1]);
        if (c === 'c') A.R(g, Math.min(q[0], q[2]), q[1], Math.abs(q[2] - q[0]), 2, pal.stone[1]);
      }
    }
    // water, through the layout's mask (horizon strips for water further off)
    if (!wm) return;
    const y0 = wm.y0, y1 = wm.y1;
    A.waterIn(g, wm.canvas, y0, y1, pal, comp.key === 'still' || comp.key === 'archive' || comp.key === 'belltower');
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
      const Wd = fr.W;
      const on = (x, y) => x >= 0 && x < Wd && y >= 0 && y < fr.H && wm.bytes[y * Wd + x] === 1;
      g.fillStyle = rim;
      for (let y = Math.max(HZ + 2, Math.floor(y0)); y < Math.min(fr.H, Math.ceil(y1)); y++) {
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
      if (!inter(r, fr.C) && !inter(r, fr.P) && b.x > S.x - 8 && b.x < S.x + S.w + 8) reedClump(g, b.x, b.y + 2, 10 + Math.round(b.d * 0.5), pal, b.x | 0);
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
      }
    }
    void H;
  }

  // ---- painting the static layer ----------------------------------------------------------------------
  function paint(comp, fr, lay) {
    const A = Art(), k = RB.propKit;
    const { W, H, HZ, S, C } = fr;
    const cv = RB.sprites.makeCanvas(W, H);
    const g = cv.getContext('2d');
    g.imageSmoothingEnabled = false;
    const region = comp.palRegion, pal = A.palOf(region);
    const X = (f) => S.x + f * S.w;
    const get = (kind) => lay.placed.filter((p) => p.shown && p.paint === kind);
    const blit = (s, x, y, haze, hazeCol) => { const t = haze ? A.tinted(s, hazeCol, haze, s.cv.width + 'x' + s.cv.height + '|' + x) : s; g.drawImage(t.cv, Math.round(x), Math.round(y)); };
    if (comp.indoor) {
      const R0 = A.ROOMS[comp.key] || A.ROOMS.interior;
      // the floor and walls of this room; the floor's material follows the map
      const floor = comp.ground === 'stone' ? 'flags' : comp.ground === 'paper' ? 'paper' : comp.ground === 'earth' ? 'wood' : R0.floor;
      const wall = comp.key === 'mill' && floor === 'flags' ? 'stone' : R0.wall;
      A.room(g, W, H, HZ, { region, wall, floor, cool: R0.cool, beamY: lay.beamY });
      if (wall === 'timber') A.posts(g, postsFor(S, W, lay), HZ, 0, region);
      else A.wallDress(g, W, HZ, lay.beamY, comp.key, region, Math.round(S.x));
      if (comp.key !== 'still') A.beam(g, W, lay.beamY, region, wall !== 'timber');
      // openings in the back wall
      for (const d of get('doorway')) A.doorway(g, d.cx, HZ - 5, d.dw, d.dh, region, wall !== 'timber');
      // the floor's own patches, water across it (a channel, a flooded hall) and bridges
      comp.floorCode = floor === 'flags' ? 'o' : floor === 'wood' ? 'd' : null;
      groundCells(g, comp, fr, pal, lay.P, lay.water);
      for (const q of get('stairs')) A.stairsDown(g, q.sx, q.sy, q.sw, region);
    } else {
      const sky = comp.fam === 'stillOut' ? 'still' : comp.key === 'atlas' ? 'atlas' : A.LAND[comp.palRegion] ? comp.palRegion : A.LAND[comp.key] ? comp.key : 'reedwake';
      const ground = comp.key === 'atlas' ? 'parch' : comp.fam === 'stillOut' ? (comp.ground === 'stone' ? 'stone' : 'paper') : comp.ground || 'meadow';
      A.land(g, W, H, HZ, { sky, region, ground, seed: 1, chimneys: sky === 'cinder' ? [0.12, 0.3, 0.9] : null });
      // far features on the horizon: ridges of cliffs, tree and bush lines, water
      for (const r of get('rocks')) A.rocks(g, Math.max(0, r.x0), Math.min(W, r.x1), HZ, 18, r.x0 | 0, region);
      const groups = {};
      for (const l of comp.lines || []) (groups[l.group] = groups[l.group] || []).push(X(l.fx));
      if (groups.trees) spans(groups.trees, 26).forEach(([a, b], i) => A.treeline(g, a - 8, b + 8, HZ, 22, 7 + i, region, 1));
      if (groups.bushes) spans(groups.bushes, 24).forEach(([a, b], i) => A.treeline(g, a - 6, b + 6, HZ, 10, 17 + i, region, 0));
      if (groups.rocks) for (const x of groups.rocks) A.rocks(g, x - 7, x + 7, HZ, 6, x | 0, region);
      if (groups.reeds) for (const x of groups.reeds) reedClump(g, x, HZ + 1, 12, pal, x | 0);
      if (groups.fence) spans(groups.fence, 20).forEach(([a, b]) => fenceLine(g, a - 8, b + 8, HZ, pal));
      groundCells(g, comp, fr, pal, lay.P, lay.water);
      // buildings and the wheel, far first
      const bl = lay.placed.filter((p) => p.shown && (p.paint === 'facade' || p.paint === 'wheel')).sort((a, b) => (b.haze || 0) - (a.haze || 0));
      const haze = (A.LAND[sky] || A.LAND.reedwake).haze;
      for (const b of bl) {
        // drawn on its own small canvas, washed toward the haze with distance
        const ox = Math.round(b.x) - 8, oy = Math.round(b.y) - 40, tw = Math.round(b.w) + 16, th = Math.round(b.h) + 56;
        const tmp = RB.sprites.makeCanvas(tw, th), tg = tmp.getContext('2d');
        tg.imageSmoothingEnabled = false;
        tg.translate(-ox, -oy);
        if (b.paint === 'facade') A.facade(tg, b.x, b.by, b.it.st, b.tp, region, { lit: comp.night || comp.dark > 0.3 });
        else A.wheel(tg, b.cx, b.cy, b.r, region, 0);
        tg.setTransform(1, 0, 0, 1, 0, 0);
        if (b.haze) { tg.globalCompositeOperation = 'source-atop'; tg.globalAlpha = b.haze; tg.fillStyle = haze; tg.fillRect(0, 0, tw, th); }
        g.drawImage(tmp, ox, oy);
      }
    }
    // landmarks with their own painters
    for (const q of get('gear')) A.bigGear(g, q.cx, q.cy, q.r, region, false);
    for (const q of get('ladder')) ladderTall(g, q, fr, region, comp);
    // world-prop landmarks and context, back to front; those behind the creature in shadow
    const sprites = lay.placed.filter((p) => p.shown && p.spr).sort((a, b) => (a.y + a.h) - (b.y + b.h));
    const roomShade = comp.indoor ? 'rgba(16,10,26,' : null;
    for (const p of sprites) {
      let s = p.spr;
      const a = comp.indoor ? (p.dimmed ? 0.5 : p.tier === 'wall' ? 0.22 : 0.12) : p.dimmed ? 0.35 : p.tier === 'wall' || p.tier === 'far' ? 0.25 : 0;
      if (a) s = A.tinted(s, comp.indoor ? '#140c1c' : (A.LAND[comp.palRegion] || A.LAND.reedwake).haze, a, p.id + '|' + p.x + '|' + p.y + '|' + comp.id);
      g.drawImage(s.cv, p.x, p.y);
    }
    void roomShade;
    // accessories
    for (const p of lay.placed) {
      if (!p.shown || p.kind !== 'accessory') continue;
      if (p.rail) { const wd = RB.propKit.mat(pal).wood; A.R(g, p.rail.x, p.rail.y, p.rail.w, 2, wd[2]); A.R(g, p.rail.x, p.rail.y, p.rail.w, 1, wd[3]); A.R(g, p.rail.x, p.rail.y + 2, p.rail.w, 1, 'rgba(16,10,24,0.4)'); }
      for (const q of p.members) {
        let s = q.s;
        if (comp.indoor) s = A.tinted(s, '#140c1c', 0.1, q.ref + '|' + q.v + '|' + comp.palRegion);
        g.drawImage(s.cv, q.x, q.y);
      }
    }
    // light: the room is lit by the party's lantern, walls fall into shadow,
    // windows at the front throw a pale shaft; lamps make warm pools
    if (comp.indoor) {
      const d = Math.min(0.62, 0.25 + (comp.dark || 0) * 0.6);
      A.shade(g, 0, 0, W, HZ, '30,18,22', d * 0.9, d * 0.3, 7, true);
      A.shade(g, 0, 0, Math.max(1, S.x + S.w * 0.16), H, '30,18,22', d * 0.5, 0, 5, false);
      A.shade(g, S.x + S.w * 0.86, 0, W - (S.x + S.w * 0.86), H, '30,18,22', 0, d * 0.45, 5, false);
      A.shade(g, 0, HZ, W, H - HZ, '30,18,22', d * 0.5, 0, 6, true);
      A.pool(g, S.x + S.w * 0.5, fr.feet - 6, S.w * 0.42, (H - HZ) * 0.5, '255,214,150', 0.16);
      if (comp.front && (comp.front.windows || []).length && !comp.night) {
        // the building's front windows are behind the viewer: their light falls in over the party's shoulders
        const bw = comp.front.w || 7;
        comp.front.windows.forEach((wx, i) => {
          const f = 0.2 + 0.75 * ((wx + 0.5) / bw);
          const x = X(f), y0 = Math.max(0, S.y - 40), yf = Math.round(HZ + (fr.feet - HZ) * 0.7);
          A.shaft(g, x, y0, yf, H, 12);
          lay.shaft = lay.shaft || []; lay.shaft.push({ x, y0, yf, n: i });
        });
      }
      for (const l of lay.lights) A.pool(g, l.x, l.y, l.r, Math.round(l.r * 0.8), '255,196,110', 0.28);
    } else {
      if (comp.night || comp.dark >= 0.35) {
        // evening or night out of doors: the same place under a dark sky, a few stars
        g.fillStyle = 'rgba(14,16,44,' + (comp.night ? 0.5 : 0.32) + ')'; g.fillRect(0, 0, W, H);
        g.fillStyle = 'rgba(236,240,255,0.8)';
        for (let i = 0; i < 26; i++) { const x = RB.tiles.hh(i, 81) % W, y = RB.tiles.hh(i, 82) % Math.max(1, HZ - 40); if (!inter(rect(x, y, 1, 1), C)) g.fillRect(x, y, 1, 1); }
      }
      if (comp.tint) { g.fillStyle = comp.tint; g.fillRect(0, 0, W, H); }
    }
    if (comp.key === 'atlas') { g.globalCompositeOperation = 'color'; g.fillStyle = 'rgba(150,120,80,0.28)'; g.fillRect(0, HZ, W, H - HZ); g.globalCompositeOperation = 'source-over'; }
    void C; void k;
    return cv;
  }
  function spans(xs, gap) {
    xs = xs.slice().sort((a, b) => a - b);
    const out = [];
    for (const x of xs) { const l = out[out.length - 1]; if (l && x - l[1] <= gap) l[1] = x; else out.push([x, x]); }
    return out;
  }
  function postsFor(S, W, lay) {
    const out = [];
    for (let x = Math.round(S.x + S.w * 0.06); x < W; x += 96) out.push(x);
    for (let x = Math.round(S.x + S.w * 0.06) - 96; x > -8; x -= 96) out.push(x);
    void lay;
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
  // Water outdoors, over the depths the map has it at: far water is a band on
  // the horizon; water beside the encounter runs from the horizon (or from
  // where it begins) toward the viewer, widening with perspective; water only
  // behind the viewer (south of the encounter) is a strip along the bottom.
  // Its shore gets a lit rim, and reeds where this stretch of map has reeds.
  function waterOutdoor(g, w, fr, pal, comp) {
    const A = Art(), { S, HZ, H, W } = fr;
    const t = w.it.tiers, v = comp.view;
    const cfx = fr.C.x + fr.C.w / 2;
    const touchL = w.it.mx <= v.x0, touchR = w.it.mx + w.it.w - 1 >= v.x1;
    const yT = t.far ? HZ - 7 : t.mid ? HZ + 1 : Math.round(S.y + S.h - 12);
    const yB = t.near ? H : t.mid ? Math.round(fr.feet + 4) : HZ + 2;
    const sp = (y) => 1 + 0.55 * Math.max(0, (y - HZ) / Math.max(1, H - HZ));
    const xl = (y) => (touchL ? -4 : Math.round(cfx + (w.x0 - cfx) * sp(y)));
    const xr = (y) => (touchR ? W + 4 : Math.round(cfx + (w.x1 - cfx) * sp(y)));
    if (!t.mid && !t.near) {
      A.water(g, [xl(HZ), HZ - 7, xr(HZ), HZ - 7, xr(HZ), HZ + 2, xl(HZ), HZ + 2], pal);
      A.R(g, xl(HZ), HZ + 2, xr(HZ) - xl(HZ), 1, pal.water[3]);
      return;
    }
    const pts = [xl(yT), yT, xr(yT), yT, xr(yB), yB, xl(yB), yB];
    A.water(g, pts, pal);
    const rim = pal.sand ? pal.sand[1] : pal.water[3];
    // shore rims: the far edge when the water begins in front of the horizon, and the side edges inside the view
    if (yT > HZ + 1) A.R(g, xl(yT), yT - 1, xr(yT) - xl(yT), 2, rim);
    const edges = [];
    if (!touchL) edges.push([xl(yT), yT, xl(yB), yB]);
    if (!touchR) edges.push([xr(yT), yT, xr(yB), yB]);
    for (const [ax, ay, bx, by] of edges) for (let y = ay; y < by; y++) { const u = (y - ay) / Math.max(1, by - ay); A.R(g, Math.round(ax + (bx - ax) * u) - 1, y, 2, 1, rim); }
    if (comp.has.reeds) for (const [ax, ay, bx, by] of edges) for (let i = 0; i < 6; i++) {
      const u = 0.1 + i * 0.15, x = Math.round(ax + (bx - ax) * u), y = Math.round(ay + (by - ay) * u);
      const r = rect(x - 6, y - 18, 12, 18);
      if (!inter(r, fr.C) && !inter(r, fr.P)) reedClump(g, x, y, 10 + Math.round(u * 14), pal, i + 3);
    }
  }

  function waterIndoor(g, w, fr, pal) {
    const A = Art(), { HZ, H, S } = fr;
    const x0 = Math.max(0, w.x0), x1 = Math.min(fr.W, w.x1);
    const k = (x1 - x0) / 2, cx = (x0 + x1) / 2, vx = S.x + S.w * 0.5;
    // a channel running from the back wall toward the viewer, widening
    const bl = cx - k, br = cx + k, nl = vx + (bl - vx) * 1.7, nr = vx + (br - vx) * 1.7;
    A.water(g, [bl, HZ, br, HZ, nr, H, nl, H], pal);
    A.R(g, bl, HZ, br - bl, 1, 'rgba(10,8,20,0.5)');
  }
  function bridgeAt(g, b, fr, pal, indoor) {
    const A = Art(), wd = RB.propKit.mat(pal).wood;
    const y = indoor ? fr.HZ + Math.round((fr.H - fr.HZ) * 0.18) : fr.HZ - 2;
    const x0 = b.x0 - 6, x1 = b.x1 + 6;
    A.R(g, x0, y, x1 - x0, 4, wd[2]); A.R(g, x0, y, x1 - x0, 1, wd[3]); A.R(g, x0, y + 4, x1 - x0, 1, wd[0]);
    for (let x = x0; x < x1; x += 5) A.R(g, x, y + 1, 1, 3, wd[1]);
  }
  function pathWedge(g, xn, xf, fr, pal, ground) {
    const A = Art(), { HZ, H } = fr;
    const c = ground === 'snow' ? ['#c8d0d8', '#d6dde4'] : ground === 'sand' ? [pal.sand[2], pal.sand[0]] : [pal.dirt[2], pal.dirt[0]];
    const pts = [xf - 3, HZ + 1, xf + 3, HZ + 1, xn + 26, H, xn - 26, H];
    RB.propKit.poly(g, pts, c[1]);
    for (let y = HZ + 2; y < H; y += 3) { const u = (y - HZ) / (H - HZ), x = xf + (xn - xf) * u, half = 3 + 23 * u; A.R(g, Math.round(x - half), y, 1 + Math.round(u * 2), 1, c[0]); A.R(g, Math.round(x + half - 1 - u * 2), y, 1 + Math.round(u * 2), 1, c[0]); }
  }
  // The ladder to the floor above: rails from the floor to the top of the wall,
  // rungs, and the dark square of the loft hatch it leads into.
  function ladderTall(g, q, fr, region, comp) {
    const A = Art(), wd = RB.propKit.mat(A.palOf(region)).wood;
    const x = Math.round(q.cx), top = q.top, bot = fr.HZ + 2;
    if (comp.indoor) { A.R(g, x - 16, top, 32, 8, '#0c0810'); A.R(g, x - 16, top + 8, 32, 2, wd[1]); }
    for (let y = bot - 6; y > top + 8; y -= 8) { A.R(g, x - 8, y, 16, 3, wd[3]); A.R(g, x - 8, y, 16, 1, wd[4]); A.R(g, x - 8, y + 2, 16, 1, wd[1]); }
    for (const rx of [x - 11, x + 8]) { A.R(g, rx, top + 4, 3, bot - top - 4, wd[2]); A.R(g, rx, top + 4, 1, bot - top - 4, wd[3]); A.R(g, rx + 2, top + 4, 1, bot - top - 4, wd[0]); }
    A.R(g, x - 12, bot - 1, 24, 2, 'rgba(16,10,24,0.35)');
  }

  // ---- ambient life (per frame, bounded; none with reduced motion) ------------------------------------------
  const AMB = {
    reedwake: { n: 7, col: 'rgba(250,250,236,0.8)', size: 2, vx: 0.012, vy: -0.004, wob: 6 },
    mill: { n: 12, col: 'rgba(230,220,180,0.45)', size: 1, vx: 0.004, vy: 0.003, wob: 8 },
    archive: { n: 10, col: 'rgba(170,190,240,0.4)', size: 1, vx: 0, vy: -0.004, wob: 5 },
    cinder: { n: 10, col: 'rgba(210,200,196,0.7)', size: 2, vx: -0.008, vy: 0.01, wob: 8 },
    kiln: { n: 12, col: 'rgba(255,170,90,0.85)', size: 2, vx: 0.002, vy: -0.016, wob: 6 },
    snowbell: { n: 22, col: 'rgba(255,255,255,0.9)', size: 2, vx: -0.004, vy: 0.012, wob: 10 },
    observatory: { n: 8, col: 'rgba(210,226,255,0.35)', size: 1, vx: 0.002, vy: 0.003, wob: 6 },
    lanternfall: { n: 6, col: 'rgba(252,224,160,0.7)', size: 2, vx: 0.004, vy: -0.006, wob: 8 },
    belltower: { n: 10, col: 'rgba(200,216,255,0.35)', size: 1, vx: 0.003, vy: 0.004, wob: 8 },
    still: { n: 7, col: 'rgba(236,232,220,0.55)', size: 3, vx: 0.006, vy: -0.005, wob: 10 },
    atlas: { n: 5, col: 'rgba(250,244,226,0.8)', size: 3, vx: 0.01, vy: 0.002, wob: 8 },
    saltglass: { n: 0 },
  };
  function ambient(c, comp, lay, fr, t) {
    const u = fr.u, K = RB.propKit;
    const hh = (a, b, d) => RB.tiles.hh(a, b, d);
    const S = fr.S;
    const a = AMB[comp.key] || AMB[comp.palRegion];
    if (a && a.n) {
      c.fillStyle = a.col;
      for (let i = 0; i < a.n; i++) {
        const sx = hh(i, 5, 1) % 1000 / 1000, sy = hh(i, 5, 2) % 1000 / 1000, ph = (hh(i, 5, 3) % 628) / 100;
        const x = S.x + ((sx * S.w + t * a.vx * (0.6 + sx)) % S.w + S.w) % S.w + Math.sin(t / 1400 + ph) * a.wob;
        const y = S.y + ((sy * S.h + t * a.vy * (0.6 + sy)) % S.h + S.h) % S.h;
        c.fillRect(Math.round(x * u), Math.round(y * u), a.size * u, a.size * u);
      }
    }
    // dust turning in the window light
    if (lay.shaft) for (const sh of lay.shaft) {
      c.fillStyle = 'rgba(244,236,200,0.55)';
      for (let i = 0; i < 6; i++) {
        const k = ((t / 9000 + hh(i, sh.n, 7) % 100 / 100) % 1);
        const y = sh.y0 + 20 + k * (fr.H - sh.y0 - 30), off = Math.round((y - sh.y0) * 0.35);
        const x = sh.x - off + Math.sin(t / 1700 + i * 1.9) * 6;
        c.fillRect(Math.round(x * u), Math.round(y * u), u, u);
      }
    }
    // lamp flicker: the warm pool breathes by one step now and then
    for (const l of lay.lights) {
      const f = Math.sin(t / 230 + l.x * 0.7) + Math.sin(t / 97 + l.y) * 0.5;
      if (f > 0.9) { c.fillStyle = 'rgba(255,210,130,0.07)'; K.ell(c, l.x * u, l.y * u, l.r * 0.55 * u, l.r * 0.45 * u, c.fillStyle); }
    }
    // glints on water
    for (const p of lay.placed) if (p.shown && p.paint === 'water') {
      c.fillStyle = 'rgba(236,248,255,0.8)';
      for (let i = 0; i < 5; i++) if (Math.sin(t / 700 + i * 2.3 + p.x0) > 0.7) {
        const x = p.x0 + (hh(i, p.x0 | 0, 44) % Math.max(1, Math.round(p.x1 - p.x0))), y = fr.HZ + 2 + (hh(i, 3, 45) % Math.max(1, Math.round((fr.H - fr.HZ) * 0.5)));
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
    try { cur = compose(enemy, where, seed); } catch (e) { console.warn('battle place', e); cur = { id: ++compN, key: enemy.bgKey, seed, fallback: 'error: ' + e.message }; }
    cur.counter = counter;
    cur.enemy = enemy.id;
    cur.artOpts = enemy.artOpts || {};
    cur.artBox = undefined;
    cur.frame = null; cur.lay = null;
    layers.clear();
    return cur;
  }
  // draw(c, key, w, h, hz, t, still, frame): the backdrop for this frame; returns
  // false when there is no composed place (the caller then paints the region backdrop).
  function draw(c, key, w, h, hz, t, still, F) {
    if (!cur || cur.fallback || !F || !F.S || cur.key !== key || dbg.off) return false;
    const u = Math.max(1, Math.round(F.scale || 1));
    const W = Math.ceil(w / u), H = Math.ceil(h / u);
    if (cur.artBox === undefined) cur.artBox = artBox(F.art || 'wisp', cur.artOpts) || null;
    const fr = frameOf(Object.assign({ box: cur.artBox }, F), W, H, hz, u);
    let L = layers.get(fr.key);
    if (!L) {
      const t0 = performance.now();
      const lay = layout(cur, fr);
      const cv = paint(cur, fr, lay);
      L = { cv, lay, fr, ms: performance.now() - t0 };
      layers.set(fr.key, L);
      while (layers.size > 2) layers.delete(layers.keys().next().value);
      cur.frame = fr; cur.lay = lay; cur.buildMs = L.ms; cur.builds = (cur.builds || 0) + 1;
    }
    c.drawImage(L.cv, 0, 0, L.cv.width * u, L.cv.height * u);
    if (!still) ambient(c, cur, L.lay, L.fr, t);
    return true;
  }
  // A JSON-safe record of the current (or last) composition, for tests and captures.
  function last() {
    if (!cur) return null;
    const r = (p) => (p && p.x != null ? { x: Math.round(p.x), y: Math.round(p.y), w: Math.round(p.w), h: Math.round(p.h) } : null);
    const lay = cur.lay;
    const placed = lay ? lay.placed : [];
    return {
      map: cur.map, x: cur.x, y: cur.y, seed: cur.seed, counter: cur.counter, enemy: cur.enemy, key: cur.key, fam: cur.fam || null,
      setting: cur.setting || null, zone: cur.zone || null, small: !!cur.small, view: cur.view ? { mode: cur.view.mode, x0: cur.view.x0, x1: cur.view.x1, yBack: cur.view.yBack, yNear: cur.view.yNear } : null,
      fallback: cur.fallback || null, ground: cur.ground || null,
      structure: (cur.structure || []).map((it) => ({ id: it.id, from: it.src + ':' + it.id + '@' + it.at, tier: it.tier })),
      landmarks: placed.filter((p) => p.kind === 'landmark').map((p) => ({ id: p.id, from: p.from, tier: p.tier, shown: !!p.shown, dimmed: !!p.dimmed, rect: r(p) })),
      context: placed.filter((p) => p.kind === 'context').map((p) => ({ id: p.id, from: p.from, tier: p.tier, shown: !!p.shown, rect: r(p) })),
      contextSel: (cur.context || []).map((it) => it.src + ':' + it.id + '@' + it.at),
      lines: (cur.lines || []).map((l) => ({ group: l.group, from: l.from })),
      accessories: (cur.accessories || []).map((a) => ({ id: a.cluster, zone: a.zone, side: a.side, variant: a.variant })),
      accessoriesPlaced: placed.filter((p) => p.kind === 'accessory').map((p) => ({ id: p.id, zone: p.zone, spot: p.spot || null, shown: !!p.shown, rect: r(p), members: (p.members || []).map((q) => ({ ref: q.ref, rect: r(q) })) })),
      frame: cur.frame ? { W: cur.frame.W, H: cur.frame.H, HZ: cur.frame.HZ, u: cur.frame.u, stage: r(cur.frame.S), creature: r(cur.frame.C), party: r(cur.frame.P), beamY: lay ? lay.beamY : null, key: cur.frame.key } : null,
      buildMs: cur.buildMs != null ? +cur.buildMs.toFixed(2) : null, builds: cur.builds || 0,
    };
  }
  // test hooks
  function forceSeed(n) { forced = n == null ? null : n >>> 0; }
  function debug(o) { dbg = Object.assign({}, o || {}); layers.clear(); if (cur) { cur.lay = null; } }
  // checksum of the cached static layer of the current frame (tests)
  function checksum() {
    if (!cur || !cur.frame) return null;
    const L = layers.get(cur.frame.key);
    if (!L) return null;
    const d = L.cv.getContext('2d').getImageData(0, 0, L.cv.width, L.cv.height).data;
    let h = 2166136261 >>> 0;
    for (let i = 0; i < d.length; i += 4) { h ^= d[i] | (d[i + 1] << 8) | (d[i + 2] << 16); h = Math.imul(h, 16777619) >>> 0; }
    return h >>> 0;
  }
  // Test hook: build the static layer of the current composition for the
  // current frame (optionally without the accessories themselves; their light
  // stays) and return its pixels, to check where accessories change the picture.
  function layerPixels(o) {
    if (!cur || !cur.frame) return null;
    const lay = layout(cur, Object.assign({}, cur.frame));
    if (o && o.noAccessories) for (const p of lay.placed) if (p.kind === 'accessory') p.shown = false;
    const cv = paint(cur, cur.frame, lay);
    return { w: cv.width, h: cv.height, data: cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data };
  }
  return { begin, draw, last, forceSeed, debug, checksum, layerPixels, compose, survey, ROLE, CL, POOLS, _count: () => counter };
})();
