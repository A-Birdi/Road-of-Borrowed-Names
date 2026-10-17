// AR-1 Mill (the Old Mill's art, F13): what the art pass may touch and what it must leave alone. The stair-well is a
// per-instance variant of the shared stairs (o.well 'down', the mill's ground floor only), baked into the floor, so the
// other forty-odd stairs and the Wheel Pit's are untouched; the waterwheel's jammed instance says it is jammed (o.jammed)
// beside its existing still/condition; the millstone, the scenes, exits and triggers are as they were. The pictures
// themselves are judged from the captures (docs/review/ar1_mill/), not here.
import { load } from '../lib/load.mjs';

export default async (t) => {
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const M = RB.content.maps, P = RB.props.P;

  // ---- the stair-well: one instance, unconditional (it is baked with the floor), the interaction as before ----
  const wells = [];
  for (const [id, m] of Object.entries(M)) for (const p of m.props || []) if (p.p === 'stairs' && p.o && p.o.well) wells.push(id + ' ' + p.x + ',' + p.y + ' ' + p.o.well);
  t.eq(wells, ['rw.mill1 12,9 down'], 'only the mill\'s ground-floor stairs are drawn as the stair-well');
  const st = M['rw.mill1'].props.find((p) => p.p === 'stairs');
  t.ok(st && !st.if && st.scene === 'rw.m1_stairs' && st.block === undefined, 'it is always there (so it can be baked) and keeps its scene and footing');
  t.ok(P.stairs.block === false && typeof P.stairs.bake2 === 'function' && typeof P.stairs.draw2 === 'function', 'stairs stay walkable-over as before; the variant has its floor part');
  const pit = M['rw.mill0'].props.find((p) => p.p === 'stairs');
  t.ok(pit && pit.x === 2 && pit.y === 8 && !pit.o && pit.block === false, 'the Wheel Pit\'s stairs are the shared drawing, unchanged');
  t.eq(M['rw.mill0'].exits, [{ x: 2, y: 9, to: 'rw.mill1', tx: 12, ty: 8, dir: 'down' }], 'the way back up from the pit lands on the landing as before');
  const sc = RB.content.scenes['rw.m1_stairs'];
  const scs = JSON.stringify(sc);
  t.ok(sc && /rw_gears/.test(scs) && /rw\.mill0/.test(scs), 'the stairs still open with the gears and lead to the pit');

  // ---- the waterwheel: the same two instances, the same conditions; the jammed one now says so ----
  const wheels = M['rw.millroad'].props.filter((p) => p.p === 'millwheel');
  t.eq(wheels.map((p) => [p.x, p.y, p.if, p.scene || null, p.o || null]), [
    [14, 2, '!rw_echo_done', 'rw.mr_wheel', { still: true, jammed: true }],
    [14, 2, 'rw_echo_done', null, null],
  ], 'jammed until the echo is put to rest (still, drawn jammed, its look scene), then turning');
  t.ok(P.millwheel.w === 2 && P.millwheel.h === 2 && P.millwheel.block !== false, 'its footprint and collision are as before (the lean-to stands on water and on ground nobody can reach)');
  t.eq(M['rw.millroad'].structs[0], { type: 'house', x: 6, y: 1, w: 7, h: 4, roof: 'thatch', wall: 'wood', door: 3, windows: [1, 5], to: 'rw.mill1', spawn: [7, 10] }, 'the mill itself has not moved');

  // ---- the millstone: reviewed and kept, interaction and encounter as before ----
  const ms = M['rw.mill1'].props.find((p) => p.p === 'millstone');
  t.eq([ms.x, ms.y, ms.scene, ms.o || null, ms.if || null], [6, 4, 'rw.m1_stone', null, null], 'the millstone is where it was, with its scene, unchanged');
  t.eq(M['rw.mill1'].triggers, [{ x: 5, y: 6, w: 4, h: 2, scene: 'rw.m1_boss', if: 'rw_loft_done&!rw_echo_done' }], 'the Mill Echo\'s approach is as before');
  t.eq(M['rw.mill1'].exits, [{ x: 7, y: 11, to: 'rw.millroad', tx: 9, ty: 5, dir: 'down' }], 'the way out of the mill is as before');
};
