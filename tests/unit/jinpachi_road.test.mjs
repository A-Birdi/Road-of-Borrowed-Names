// RBN-QA-108 (Agnes 6372889134; Local CL-240; Cloud CC-147 §3, CC-149 §4): after the valley's letter Jinpachi's place
// at a station (or the Pass, or Lanternfall's street) ends, and he goes on down the road on his round, by his own way
// out, the place's west exit: leave: 'way', so that if it cannot be walked he fades where he stands, recorded, and
// never takes some other exit. In node:
//  1. every place where the letter can be given has his placement with leave 'way' and leaveTo the agreed road;
//  2. each of those roads is an exit of that map, at its west edge, open without conditions;
//  3. his placement is otherwise as it was (where, when, his talk);
//  4. with that exit closed there is no other way to his road (every link open, as far as the world looks: 12 maps), so
//     he can never go round by some other exit: he fades where he stands.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const C = RB.content;
  const WANT = {
    'cr.oiwake': 'lf.road', 'cr.suginoki': 'cr.leg1', 'cr.sakashita': 'cr.leg2', 'cr.nakayama': 'cr.leg3', 'cr.umagaeshi': 'cr.leg4',
    'cr.kirishita': 'cr.leg5', 'cr.kumoi': 'cr.above', 'cr.summit': 'cr.hut', 'lf.town': 'lf.road',
  };
  const places = C.cloudroad.STATIONS.concat(['cr.summit', 'lf.town']);
  t.eq(places.slice().sort(), Object.keys(WANT).sort(), 'the letter is given at the seven stations, the Pass and Lanternfall\'s street');
  const got = {}, bad = [];
  for (const id of places) {
    const m = C.maps[id], j = (m.npcs || []).find((n) => n.id === 'cr_jinpachi' && /!yn_called/.test(n.if || ''));
    got[id] = j ? j.leave + ' ' + j.leaveTo : null;
    const ex = j && (m.exits || []).find((e) => e.to === j.leaveTo);
    if (!ex || ex.x !== 0 || ex.if) bad.push(id + ': ' + JSON.stringify(ex || null));
    if (!j || j.talk !== 'yn.call' || j.if !== 'ed>=2&cr_done&!yn_called') bad.push(id + ' placement: ' + JSON.stringify(j));
  }
  t.eq(got, Object.fromEntries(Object.entries(WANT).map(([k, v]) => [k, 'way ' + v])), 'his placement at each: leave \'way\', down the road');
  t.eq(bad, [], 'each road is an open exit at the west edge of its map, and the placement is otherwise as it was');
  // ---- 4. (the world's search for a way, src/engine/50_world.js towards(): exits with a map, and doors, 12 maps deep)
  const links = (id, shut) => { const d = C.maps[id], o = []; if (!d) return o; for (const e of d.exits || []) if (e.to && e !== shut) o.push(e.to); for (const b of d.structs || []) if (b.door != null && b.to) o.push(b.to); return o; };
  const round = [];
  for (const id of places) {
    const shut = (C.maps[id].exits || []).find((e) => e.to === WANT[id]);
    const seen = new Set([id]);
    let q = [id];
    for (let hops = 0; q.length && hops < 12; hops++) {
      const next = [];
      for (const m of q) for (const to of links(m, m === id ? shut : null)) { if (seen.has(to)) continue; seen.add(to); next.push(to); }
      q = next;
    }
    if (seen.has(WANT[id])) round.push(id);
  }
  t.eq(round, [], 'with his road closed, no other way to it from any of them (he would fade where he stands, not go round)');
};
