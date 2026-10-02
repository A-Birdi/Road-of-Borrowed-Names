// Battle places (src/ui/76_battle_places.js), §19 of the battle-art addendum:
//  - every encounter setting (every placed foe, the scripted bosses, the rooms
//    of a generated Atlas run) composes a place whose structure and nearby
//    scenery trace back to real props, buildings and tiles; interior
//    backdrops only indoors; a small room's structure is independent of the
//    encounter tile; out of doors the scenery follows the tile;
//  - every composition has an origin record that rebuilds it exactly
//    (recompose(record) → the same record), without the live game state;
//  - state-dependent things follow persistent state: the mill's gears jammed
//    / mended (and the loft hatch shut / open), the reed bed standing /
//    cleared, the village bridge broken / mended, the wheel still / turning,
//    the observatory hatch; the state keys are part of the record's signature;
//  - stairs keep their direction (authored or from the tiles);
//  - accessories: bounded, themed, seeded (same seed, same choice; seeds vary
//    it), each with a home on the map that is dry, supported and off the
//    landmarks; composing never calls Math.random;
//  - the projection depends on the actors only: the overlay's free rectangle
//    and the canvas size do not move anything (a larger canvas reveals more
//    columns of the same picture), and the encounter tile lies under the creature.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, BP = RB.battlePlaces;
  const INDOOR_BG = { mill: 1, archive: 1, kiln: 1, observatory: 1, belltower: 1 };
  const OUTDOOR_BG = { reedwake: 1, saltglass: 1, cinder: 1, snowbell: 1, lanternfall: 1 };
  // the enemy as RB.combat's placeEnemy sets it up for a placed foe
  const placed = (mapId, f) => {
    const m = RB.maps.compile(mapId);
    const e = Object.assign({ id: f.enemy }, C.enemies[f.enemy] || {});
    e.where = { map: mapId, x: f.x, y: f.y };
    e.setting = RB.render.enclosed(m) ? 'indoor' : 'outdoor';
    for (const k of ['intro', 'settle', 'bg']) if (f[k] != null) e[k] = f[k];
    let bg = e.bg || e.region || 'reedwake';
    if (e.setting === 'outdoor' && INDOOR_BG[bg]) bg = OUTDOOR_BG[e.region] ? e.region : 'reedwake';
    e.bgKey = bg;
    return e;
  };
  // a condition test from a set of flags (anything else false), like a campaign at that point
  const flags = (o) => (cond) => {
    if (!cond) return true;
    const s = RB.state.newCampaign({ profile: 'E' });
    Object.assign(s.flags, o || {});
    return RB.state.test(s, cond);
  };
  const traced = (mapId, comp) => {
    const m = RB.maps.compile(mapId), bad = [];
    const tile = (x, y) => (RB.maps.tileAt(m, x, y) || { id: 'wall' }).id;
    for (const it of comp.structure.concat(comp.context)) {
      if (it.src === 'prop' && !m.props.some((q) => q.p === it.id && q.x === it.mx && q.y === it.my)) bad.push(it.id + '@' + it.at);
      if (it.src === 'struct' && !m.structs.some((q) => q.x === it.mx && q.y === it.my)) bad.push('building@' + it.at);
      if (it.src === 'tiles' && it.id === 'water') {
        let ok = false;
        for (let x = it.mx; x < it.mx + it.w; x++) for (let y = 0; y < m.h; y++) if (/water|shallow/.test(m.tiles[y * m.w + x].id)) ok = true;
        if (!ok && !m.props.some((q) => (q.p === 'lf_flood' || q.p === 'water') && q.x >= it.mx && q.x < it.mx + it.w)) bad.push('water@' + it.at);
      }
      if (it.src === 'tiles' && it.id === 'bridge') { let ok = false; for (let x = it.mx; x < it.mx + it.w; x++) for (let y = 0; y < m.h; y++) if (/bridge/.test(tile(x, y))) ok = true; if (!ok) bad.push('bridge@' + it.at); }
      if (it.src === 'tiles' && it.id === 'cliffs') { let ok = false; for (let x = it.mx; x < it.mx + it.w; x++) for (let y = 0; y < m.h; y++) if (tile(x, y) === 'cliff') ok = true; if (!ok) bad.push('cliffs@' + it.at); }
      // an opening in a wall: a gap in the wall row (doorway) or column (side opening) that is not wall
      if (it.src === 'tiles' && it.id === 'doorway') { for (let x = it.mx; x < it.mx + it.w; x++) if (/wall|void/.test(tile(x, it.my - 1))) bad.push('doorway@' + it.at); }
      if (it.src === 'tiles' && it.id === 'opening') { for (let y = it.my; y < it.my + it.h; y++) if (/wall|void/.test(tile(it.mx, y))) bad.push('opening@' + it.at); }
    }
    return bad;
  };
  // the generated rooms of an Atlas run, registered like a run in progress
  const s0 = RB.state.newCampaign({ profile: 'E' });
  s0.flags.postgame = true;
  RB.game.s = s0;
  const run = RB.atlas.newRun(s0, ['mirror'], { seed: 4242 });
  RB.atlas.register(run);
  RB.game.s = null;

  // ---- every encounter setting ---------------------------------------------------------------------
  const BOSSES = [['sg.da_vault', 'sg.tideclerk', 4, 9], ['co.kiln_core', 'co.warden', 7, 8], ['sb.obs_dome', 'sb.boss', 4, 6], ['lf.bellhall', 'lf.keeper', 1, 5], ['sa.heart', 'sa.hush', 11, 11], ['rw.mill1', 'rw.mill_echo', 6, 6]];
  const all = [];
  for (const id in C.maps) for (const f of C.maps[id].foes || []) all.push([id, f]);
  for (const [id, enemy, x, y] of BOSSES) all.push([id, { id: 'boss', enemy, x, y }]);
  let n = 0, rnd = 0, atlas = 0;
  const origRandom = Math.random;
  const sels = new Set();
  Math.random = () => { rnd++; return origRandom(); };
  const test = flags({ rw_mill_open: true, rw_gears: true });
  try {
    for (const [id, f] of all) {
      const e = placed(id, f);
      const a = BP.compose(e, e.where, 11, { test }), a2 = BP.compose(e, e.where, 11, { test }), b = BP.compose(e, e.where, 12, { test });
      n++; if (id.startsWith('atlas.')) atlas++;
      const tag = id + ' ' + f.id;
      t.ok(!a.fallback, tag + ': composes a place (' + a.fallback + ')');
      t.eq(traced(id, a), [], tag + ': every piece is on the map');
      t.ok(!(INDOOR_BG[a.key] && a.setting === 'outdoor'), tag + ': no interior backdrop out of doors (' + a.key + ')');
      t.eq(JSON.stringify(a.accessories), JSON.stringify(a2.accessories), tag + ': the same seed makes the same choice');
      t.eq(JSON.stringify(a.structure.map((s) => s.at + s.id)), JSON.stringify(b.structure.map((s) => s.at + s.id)), tag + ': the seed does not change the structure');
      t.ok(a.accessories.length >= 2 && a.accessories.length <= 7, tag + ': a bounded number of accessory clusters (' + a.accessories.length + ')');
      for (const acc of a.accessories) { const cl = BP.CL[acc.cluster]; t.ok(cl && (!cl.needs || a.has[cl.needs]), tag + ': ' + acc.cluster + ' only where it belongs'); }
      // homes: on the map, dry, off the props
      const m = RB.maps.compile(id);
      for (const acc of a.accessories) {
        if (!acc.home) continue;
        for (const h of [acc.home].concat(acc.home.alts)) {
          const tl = (RB.maps.tileAt(m, h.x, h.y) || { id: 'wall' }).id;
          if (acc.home.wall) { t.ok(/wall|void/.test(tl), tag + ': ' + acc.cluster + ' hangs on wall (' + h.x + ',' + h.y + ' ' + tl + ')'); continue; }
          const wetProp = m.props.some((q) => (q.p === 'water' || q.p === 'lf_flood') && q.x === h.x && q.y === h.y && (!q.if || test(q.if)));
          t.ok(!/water|shallow|wall|void|cliff|bridge/.test(tl) && !wetProp, tag + ': ' + acc.cluster + ' stands on dry ground (' + h.x + ',' + h.y + ' ' + tl + ')');
          t.ok(!m.props.some((q) => !q.apron && !q.auto && q.x === h.x && q.y === h.y), tag + ': ' + acc.cluster + ' is not set on a prop (' + h.x + ',' + h.y + ')');
        }
      }
      // the origin record rebuilds the composition exactly, without the live state
      const rec = BP.origin(a), rec2 = BP.origin(BP.recompose(JSON.parse(JSON.stringify(rec))));
      t.eq(JSON.stringify(rec2), JSON.stringify(rec), tag + ': recompose(origin record) gives the same record');
      t.ok(rec.map === id && rec.x === f.x && rec.y === f.y && rec.seed === 11 && rec.facing === 'north' && Array.isArray(rec.anchors) && Array.isArray(rec.state) && rec.sig, tag + ': the record names the map, the tile, the anchors, the state keys and the seed');
      sels.add(a.accessories.map((q) => q.cluster).join(',')); sels.add(b.accessories.map((q) => q.cluster).join(','));
    }
  } finally { Math.random = origRandom; }
  t.ok(n >= 60 && atlas >= 3, 'every encounter setting composed (' + n + ', of them ' + atlas + ' Atlas rooms)');
  t.eq(rnd, 0, 'composing never calls Math.random');
  t.ok(sels.size >= 20, 'accessory selections vary (' + sels.size + ' different)');

  // ---- small rooms, outdoor locality ------------------------------------------------------------------
  const mill = (x, y, o) => { const e = placed('rw.mill1', { enemy: 'rw.dustmoth', x, y }); return BP.compose(e, e.where, 3, { test: flags(o || { rw_gears: true }) }); };
  const s1 = mill(3, 4), s2 = mill(11, 6), s3 = mill(7, 9);
  t.ok(s1.small && s1.view.mode === 'room', 'the mill\'s ground floor is a small room');
  t.eq(s2.structure.map((s) => s.id + '@' + s.at), s1.structure.map((s) => s.id + '@' + s.at), 'one structure for the room from (3,4) and (11,6)');
  t.eq(s3.structure.map((s) => s.id + '@' + s.at), s1.structure.map((s) => s.id + '@' + s.at), 'and from (7,9)');
  t.ok(['ladder', 'gears', 'millstone', 'stairs'].every((k) => s1.structure.some((s) => s.id === k)), 'with its ladder, gears, millstone and stairs');
  t.eq(s1.structure.filter((s) => s.id === 'gears').length, 1, 'one gear train: the variant for the current state only');
  const road = (x, y) => { const e = placed('rw.millroad', { enemy: 'rw.reedling', x, y }); return BP.compose(e, e.where, 3, { test: flags({ rw_mill_open: true }) }); };
  const bank = road(17, 12), inland = road(6, 21), mill1 = road(11, 7);
  t.ok(bank.structure.some((s) => s.id === 'water' && (s.tiers.mid || s.tiers.near)) && !inland.structure.some((s) => s.id === 'water'), 'the riverbank has the river beside it; inland has no water');
  t.ok(mill1.structure.some((s) => s.id === 'millwheel') && mill1.structure.some((s) => s.id === 'building') && !inland.structure.some((s) => s.id === 'millwheel'), 'by the mill: its front and wheel; inland: neither');
  t.ok(bank.zone !== inland.zone && inland.zone !== mill1.zone, 'three zones: ' + [bank.zone, inland.zone, mill1.zone].join(' / '));

  // ---- persistent state ------------------------------------------------------------------------------
  const st = (c) => c.states.map((s) => s.key + '?' + s.cond + '=' + (s.on ? 1 : 0));
  const jam = mill(3, 4, { rw_gears: false }), fix = mill(3, 4, { rw_gears: true });
  const gj = jam.structure.find((s) => s.id === 'gears'), gf = fix.structure.find((s) => s.id === 'gears');
  t.ok(gj && gj.o && gj.o.jammed && gf && !(gf.o && gf.o.jammed), 'the gears: jammed before they are mended, free after');
  const lj = jam.structure.find((s) => s.id === 'ladder'), lf = fix.structure.find((s) => s.id === 'ladder');
  t.ok(lj.ladder.hatch === 'shut' && lf.ladder.hatch === 'open', 'the loft hatch over the ladder: shut while the gear shaft jams it, open after (' + lj.ladder.hatch + ' / ' + lf.ladder.hatch + ')');
  t.ok(st(jam).includes('prop:gears@10,2?!rw_gears=1') && st(fix).includes('prop:gears@10,2?rw_gears=1') && st(jam).includes('view:hatch@2,2?rw_gears=0'), 'the record\'s state keys say so: ' + st(jam).join(' '));
  t.ok(jam.sig !== fix.sig && JSON.stringify(jam.accessories) === JSON.stringify(fix.accessories), 'the signature (part of every cache key) differs; the seeded choice does not');
  const reeds = (o) => { const e = placed('rw.millroad', { enemy: 'rw.reedling', x: 7, y: 18 }); return BP.compose(e, e.where, 5, { test: flags(Object.assign({ rw_mill_open: true }, o)) }); };
  const rStand = reeds({ rw_mr_nao: false }), rCut = reeds({ rw_mr_nao: true });
  const bed = (c) => c.context.concat(c.lines.map((l) => ({ id: l.group, at: l.from.split('@')[1] }))).filter((i) => /^12,1[4-7]$/.test(i.at)).length;
  t.ok(bed(rStand) >= 1 && bed(rCut) === 0, 'the reed bed across the animal track stands before Nao opens it and is gone after (' + bed(rStand) + ' / ' + bed(rCut) + ')');
  t.ok(rStand.sig !== rCut.sig, 'and the two compositions have different signatures');
  const bridge = (o) => { const e = placed('rw.village', { enemy: 'rw.reedling', x: 33, y: 19 }); return BP.compose(e, e.where, 5, { test: flags(o) }); };
  const bBroken = bridge({ bridge_fixed: false }), bMended = bridge({ bridge_fixed: true });
  const cell = (c, x, y) => c.grid.rows[y - c.grid.y0][x - c.grid.x0];
  t.ok([38, 39, 40].every((x) => cell(bBroken, x, 17) === 'w') && [38, 39, 40].every((x) => cell(bMended, x, 17) === 'b'), 'the village bridge: open water in its gap before it is mended, planks after');
  const wheel = (o) => { const e = placed('rw.millroad', { enemy: 'rw.dustmoth', x: 11, y: 7 }); return BP.compose(e, e.where, 5, { test: flags(Object.assign({ rw_mill_open: true }, o)) }); };
  const ws = wheel({ rw_echo_done: false }).structure.find((s) => s.id === 'millwheel'), wt = wheel({ rw_echo_done: true }).structure.find((s) => s.id === 'millwheel');
  t.ok(ws.o && ws.o.still && !(wt.o && wt.o.still), 'the water wheel: still until the Mill Echo is settled, turning after');
  const gal = (o) => { const e = placed('sb.obs_gallery', { enemy: 'sb.ghost', x: 3, y: 7 }); return BP.compose(e, e.where, 5, { test: flags(o) }); };
  t.ok(gal({ sb_crank: false }).structure.find((s) => s.id === 'ladder').ladder.hatch === 'shut' && gal({ sb_crank: true }).structure.find((s) => s.id === 'ladder').ladder.hatch === 'open', 'the observatory\'s dome hatch: shut until the crank is turned');

  // ---- stairs keep their direction ---------------------------------------------------------------------
  const dirOf = (mapId, x, y, at) => { const e = placed(mapId, { enemy: 'rw.reedling', x, y }); const c = BP.compose(e, e.where, 1, { test: flags({ co_w_tsuchi: true, co_w_ishi: true, lf_stacks_open: true }) }); const s = c.structure.find((q) => q.id === 'stairs' && q.at === at); return s ? s.dir : 'absent'; };
  t.eq([dirOf('rw.mill1', 3, 4, '12,9'), dirOf('rw.mill0', 3, 4, '2,8'), dirOf('co.kiln', 14, 13, '22,9'), dirOf('co.upper', 10, 18, '14,14'), dirOf('lf.stacks', 10, 6, '2,2'), dirOf('lf.tower_upper', 14, 5, '16,2'), dirOf('sb.obs_charts', 5, 8, '14,5')],
    ['down', 'up', 'up', 'up', 'up', 'up', 'east'], 'stairs: down to the wheel pit, up from it, up through the kiln walls and the cinder cliff, up to the records room and the tower top, east to the gallery');

  // ---- the projection depends on the actors only ---------------------------------------------------------
  const F = { ex: 512, ey: 412, ext: { top: -96, bottom: 90, left: -94, right: 94 }, scale: 2, ps: 2, px: 60, py: 434, party: { x: 20, y: 380, w: 420, h: 300 }, art: 'moth' };
  const box = { l: 92, r: 92 };
  const proj = (c, Fx, w, h) => { const g = BP.geometry(Fx, w, h, 484, box); return { g, P: BP.projector(c, g) }; };
  for (const [label, c] of [['out of doors', mill1], ['in a small room', s1]]) {
    const a = proj(c, F, 1280, 800), b = proj(c, Object.assign({}, F, { S: { x: 700, y: 20, w: 300, h: 100 } }), 1280, 800), big = proj(c, F, 3840, 2160);
    const pts = [[c.view.x0, 0], [c.view.x1, 0], [c.x || 5, 1], [(c.x || 5) + 3, 4]].map(([cc, r]) => [a.P.X(cc, a.P.Y(c.y + r)), a.P.Y(c.y + r)]);
    const ptsB = [[c.view.x0, 0], [c.view.x1, 0], [c.x || 5, 1], [(c.x || 5) + 3, 4]].map(([cc, r]) => [b.P.X(cc, b.P.Y(c.y + r)), b.P.Y(c.y + r)]);
    const ptsBig = [[c.view.x0, 0], [c.view.x1, 0], [c.x || 5, 1], [(c.x || 5) + 3, 4]].map(([cc, r]) => [big.P.X(cc, big.P.Y(c.y + r)), big.P.Y(c.y + r)]);
    t.eq(ptsB, pts, label + ': the overlay\'s free rectangle (F.S) moves nothing');
    t.eq(ptsBig, pts, label + ': a canvas three times larger projects every map cell to the same place (it only shows more)');
    t.ok(a.g.key === b.g.key && a.g.key === big.g.key && big.g.Wb > a.g.Wb, label + ': one geometry key for all three; only the size bucket differs');
  }
  const pl = proj(mill1, F, 1280, 800);
  t.ok(Math.abs(pl.P.X(mill1.x + 0.5, pl.g.feetC) - F.ex / 2) < 1 && Math.abs(pl.P.Y(mill1.y + 0.5) - pl.g.feetC) < 1, 'out of doors the encounter tile lies under the creature, at its feet');
  const moved = proj(mill1, Object.assign({}, F, { ex: F.ex + 100 }), 1280, 800);
  t.ok(Math.abs(moved.P.X(mill1.x + 0.5) - pl.P.X(mill1.x + 0.5) - 50) < 1, 'when the arrangement moves the creature, the place moves with it (the same composition, re-projected)');
};
