// RBN-QA-164 (Agnes 6375619829): in the Hall of a Hundred Tales each floor's way up is a one-tile exit, and the stairs
// drawn for it stood on the tile beside it, so walking onto the stairs did nothing. Every pair of the twenty floors:
//  1. the stairs stand on the exit's own tile, one stairs to each way up, and no stairs anywhere else on the floor;
//  2. the stairs do not block (you walk onto them), and the tile is open ground;
//  3. each way up is as before: where it leads, where you arrive, which way you face, and the floor cleared first.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const C = RB.content;
  const floors = Object.keys(C.maps).filter((id) => /^hall\.w\d+f[12]$/.test(id));
  t.eq(floors.length, 20, 'twenty floors with a way up (ten wings, two floors each)');

  // ---- 1. and 2.
  const bad = [];
  for (const id of floors) {
    const m = C.maps[id], cm = RB.maps.compile(id);
    const up = (m.exits || []).filter((e) => /^hall\.w\d+f\d$/.test(e.to));
    const st = (m.props || []).filter((p) => p.p === 'stairs');
    if (up.length !== 1 || st.length !== 1) { bad.push(id + ': ' + up.length + ' way(s) up, ' + st.length + ' stairs'); continue; }
    const e = up[0], s = st[0];
    if (!(s.x >= e.x && s.x < e.x + e.w && s.y >= e.y && s.y < e.y + e.h)) bad.push(id + ': stairs at ' + s.x + ',' + s.y + ', the way up at ' + e.x + ',' + e.y);
    if (RB.maps.blockedStatic(cm, s.x, s.y)) bad.push(id + ': the stairs\' tile is blocked');
    if (s.if) bad.push(id + ': the stairs come and go (' + s.if + ')');
  }
  t.eq(bad, [], 'each floor\'s stairs stand on its way up, one each, on open ground');
  t.ok(RB.props.P.stairs && RB.props.P.stairs.block === false && !RB.props.P.stairs.scene, 'the stairs are something you walk onto, not something you press');

  // ---- 3. (as on the task head before RBN-QA-164)
  const WAYS = {};
  for (let w = 1; w <= 10; w++) {
    WAYS['hall.w' + w + 'f1'] = (w === 1 ? '18,1' : '16,1') + ' -> hall.w' + w + 'f2 from_below up if hall.w' + w + '.f0.clear';
    WAYS['hall.w' + w + 'f2'] = (w === 1 ? '20,1' : w === 4 ? '30,3' : '17,2') + ' -> hall.w' + w + 'f3 from_below up if hall.w' + w + '.f1.clear';
  }
  const ways = Object.fromEntries(floors.map((id) => [id, C.maps[id].exits.filter((e) => /^hall\.w\d+f\d$/.test(e.to)).map((e) => e.x + ',' + e.y + (e.w !== 1 || e.h !== 1 ? ' ' + e.w + 'x' + e.h : '') + ' -> ' + e.to + ' ' + e.sp + ' ' + e.dir + ' if ' + e.if).join('; ')]));
  t.eq(ways, WAYS, 'each way up as before: its tile, where it leads and you arrive, the way you face, the floor cleared first');
};
