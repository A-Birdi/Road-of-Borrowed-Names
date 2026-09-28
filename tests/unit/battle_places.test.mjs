// Battle places (src/ui/76_battle_places.js): what the composer reads from
// the map for every placed foe — structure and nearby scenery that trace
// back to real props, buildings and tiles; interior backdrops only indoors;
// a small room's structure independent of the encounter tile; accessories
// bounded, themed, seeded (same seed, same choice; seeds vary it) and
// chosen without Math.random.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
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
  const traced = (mapId, comp) => {
    const m = RB.maps.compile(mapId), bad = [];
    for (const it of comp.structure.concat(comp.context)) {
      if (it.src === 'prop' && !m.props.some((q) => q.p === it.id && q.x === it.mx && q.y === it.my)) bad.push(it.id + '@' + it.at);
      if (it.src === 'struct' && !m.structs.some((q) => q.x === it.mx && q.y === it.my)) bad.push('building@' + it.at);
      if (it.src === 'tiles' && it.id === 'water') {
        let ok = false;
        for (let x = it.mx; x < it.mx + it.w; x++) for (let y = 0; y < m.h; y++) if (/water|shallow/.test(m.tiles[y * m.w + x].id)) ok = true;
        if (!ok && !m.props.some((q) => (q.p === 'lf_flood' || q.p === 'water') && q.x >= it.mx && q.x < it.mx + it.w)) bad.push('water@' + it.at);
      }
    }
    return bad;
  };
  let n = 0, rnd = 0;
  const origRandom = Math.random;
  const sels = new Set();
  Math.random = () => { rnd++; return origRandom(); };
  try {
    for (const id in C.maps) for (const f of C.maps[id].foes || []) {
      const e = placed(id, f);
      const a = BP.compose(e, e.where, 11), a2 = BP.compose(e, e.where, 11), b = BP.compose(e, e.where, 12);
      n++;
      t.ok(!a.fallback, id + ' ' + f.id + ': composes a place (' + a.fallback + ')');
      t.eq(traced(id, a), [], id + ' ' + f.id + ': every piece is on the map');
      t.ok(!(INDOOR_BG[a.key] && a.setting === 'outdoor'), id + ' ' + f.id + ': no interior backdrop out of doors (' + a.key + ')');
      t.eq(JSON.stringify(a.accessories), JSON.stringify(a2.accessories), id + ' ' + f.id + ': the same seed makes the same choice');
      t.eq(JSON.stringify(a.structure.map((s) => s.at + s.id)), JSON.stringify(b.structure.map((s) => s.at + s.id)), id + ' ' + f.id + ': the seed does not change the structure');
      t.ok(a.accessories.length >= 2 && a.accessories.length <= 7, id + ' ' + f.id + ': a bounded number of accessory clusters (' + a.accessories.length + ')');
      for (const acc of a.accessories) { const cl = BP.CL[acc.cluster]; t.ok(cl && (!cl.needs || a.has[cl.needs]), id + ' ' + f.id + ': ' + acc.cluster + ' only where it belongs'); }
      sels.add(a.accessories.map((q) => q.cluster).join(',')); sels.add(b.accessories.map((q) => q.cluster).join(','));
    }
  } finally { Math.random = origRandom; }
  t.ok(n >= 40, 'every placed foe composed (' + n + ')');
  t.eq(rnd, 0, 'composing never calls Math.random');
  t.ok(sels.size >= 20, 'accessory selections vary (' + sels.size + ' different)');
  // a small room: the same structure wherever in the room the battle starts
  const mill = (x, y) => { const e = placed('rw.mill1', { enemy: 'rw.dustmoth', x, y }); return BP.compose(e, e.where, 3); };
  const s1 = mill(3, 4), s2 = mill(11, 6), s3 = mill(7, 9);
  t.ok(s1.small && s1.view.mode === 'room', 'the mill\'s ground floor is a small room');
  t.eq(s2.structure.map((s) => s.id + '@' + s.at), s1.structure.map((s) => s.id + '@' + s.at), 'one structure for the room from (3,4) and (11,6)');
  t.eq(s3.structure.map((s) => s.id + '@' + s.at), s1.structure.map((s) => s.id + '@' + s.at), 'and from (7,9)');
  t.ok(['ladder', 'gears', 'millstone', 'stairs'].every((k) => s1.structure.some((s) => s.id === k)), 'with its ladder, gears, millstone and stairs');
  // out of doors the scenery follows the tile
  const road = (x, y) => { const e = placed('rw.millroad', { enemy: 'rw.reedling', x, y }); return BP.compose(e, e.where, 3); };
  const bank = road(17, 12), inland = road(6, 21), mill1 = road(11, 7);
  t.ok(bank.structure.some((s) => s.id === 'water' && (s.tiers.mid || s.tiers.near)) && !inland.structure.some((s) => s.id === 'water'), 'the riverbank has the river beside it; inland has no water');
  t.ok(mill1.structure.some((s) => s.id === 'millwheel') && mill1.structure.some((s) => s.id === 'building') && !inland.structure.some((s) => s.id === 'millwheel'), 'by the mill: its front and wheel; inland: neither');
  t.ok(bank.zone !== inland.zone && inland.zone !== mill1.zone, 'three zones: ' + [bank.zone, inland.zone, mill1.zone].join(' / '));
};
