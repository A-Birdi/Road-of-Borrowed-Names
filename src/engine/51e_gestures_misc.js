/* Gestures added for the staging of the long quests, the deduction cases, The Pages We Keep and the pet
 * vignettes (docs/expressive/reports/staging_lq_misc.md), in the same shape as the library's own
 * (src/engine/51_gestures.js def(): entry → readable peak → recovery, keys [pose | null, ms, extra]) and drawn
 * only from the pose layer's existing key poses (32g_spritepose.js). The Chapter 1–2 additions are
 * 51e_gestures_ch12.js.
 *
 *   pointup  stretching up into a tree's branches to pick a fruit: the arm raised high (the pose layer's
 *            'pointup'), a lift onto the toes, eyes up; the hand comes down holding the fruit (a held
 *            object named by the cue's prop=, a persimmon by default). Kayo's stronger reaction in
 *            lq.road_home ("Kayo stretches up and picks one fruit"; GESTURES.md §7, her profile's `strong`,
 *            which already named it). A scene gesture: no idle list names it, so the scheduler never picks
 *            it; kind 'habit' (no primitive number), so the development viewer shows it with the others.
 */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const G = RB.gestures && RB.gestures.G;
  if (!G) return;
  const K = (p, ms, x) => [p, ms, x || null];
  const def = (id, o) => { if (!G[id]) G[id] = Object.assign({ id, kind: o.n ? 'primitive' : 'habit' }, o); };
  def('pointup', { label: 'reaching up into the branches to pick (scenes only)', prop: 'persimmon',
    entry: [K('half', 180, { gaze: 'u' }), K('pointup', 260, { gaze: 'u' })], peak: K('pointup', 520, { gaze: 'u', dy: -1 }),
    recover: [K('half', 220, { prop: 1 }), K('hold', 260, { prop: 1 }), K(null, 120)], still: 'pointup', needs: 'free', legible: 'full' });
})();
