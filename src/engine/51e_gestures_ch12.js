/* Gestures added for the staging of Chapters 1 and 2 (docs/expressive/reports/staging_ch1_ch2.md), in the
 * same shape as the library's own (src/engine/51_gestures.js def(): entry → readable peak → recovery, keys
 * [pose | null, ms, extra]) and drawn only from the pose layer's existing key poses (32g_spritepose.js).
 *
 *   wave   a raised hand moved twice, hello or goodbye (the 'wave' key pose: the arm up, a smile). Written
 *          for lines that say someone waves or sees someone off (Mame waving from the square when the
 *          signpost is mended, the see-off on the lantern road). A scene gesture: no profile lists it, so the
 *          idle scheduler never picks it on its own; it is kind 'habit' (no primitive number) so the
 *          development viewer (?dev=actors, the habits sheet) shows it with the others.
 */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const G = RB.gestures && RB.gestures.G;
  if (!G) return;
  const K = (p, ms, x) => [p, ms, x || null];
  const def = (id, o) => { if (!G[id]) G[id] = Object.assign({ id, kind: o.n ? 'primitive' : 'habit' }, o); };
  def('wave', { label: 'a wave, hello or goodbye (scenes only)', entry: [K('half', 160, { turn: 1, gaze: 'target' })], peak: K('wave', 280, { gaze: 'target' }),
    recover: [K('half', 150, { gaze: 'target' }), K('wave', 240, { gaze: 'target' }), K('half', 140), K(null, 100)], still: 'wave', needs: 'free', legible: 'full' });
})();
