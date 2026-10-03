/* Interludes: a scene's moment drawn as a picture in place of the map while
 * its lines go on in the dialogue (the wait at the tide-watcher's window, …).
 * A scene shows one with `!interlude <id> [stage]`, moves it on with another
 * stage, and ends it with `!interlude -` (usually between `!fade out` and
 * `!fade in`); one still showing when the scene ends is cleared then. The
 * pictures are drawn at art resolution with RB.pxkit, in the prologue's
 * manner (src/ui/41_prologue_art.js; its kit and caches are shared), and keep
 * what matters above the dialogue sheet: `vb` is the highest the sheet has
 * reached during this interlude (in steps, so the picture is laid out once
 * or twice, not per line). Reduced motion holds each stage still.
 *
 *   RB.interlude.ART[id] = { stages: [...], draw(c, w, h, t, st) }
 *     st: { stage, since: ms in this stage, vb, still }
 *   RB.interlude.show(id, stage)   start one, or move it to a stage
 *   RB.interlude.clear()           back to the map (drops the cached layers)
 *   RB.interlude.state()           { id, stage, since } or null (tests) */
var RB = (globalThis.RB = globalThis.RB || {});

RB.interlude = (function () {
  'use strict';
  const ART = {};
  let cur = null;
  let lastTop = 0.64; // the sheet's top (fraction of the screen) when last seen
  const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

  function visBottom(h) {
    const cv = document.getElementById('world'), box = document.querySelector('#ui > .dlg:not(.hidden)');
    if (cv && box) {
      const a = cv.getBoundingClientRect(), b = box.getBoundingClientRect();
      const f = a.height && b.height ? (b.top - a.top) / a.height : 0;
      if (f > 0.3 && f < 0.98) { // docked at the bottom (a sheet docked at the top leaves the bottom in view)
        const q = Math.floor(f * 25) / 25;
        lastTop = q;
        if (!cur.measured || q < cur.top) { cur.top = q; cur.measured = true; }
      }
    }
    if (cur.top == null) cur.top = lastTop;
    return Math.round(cur.top * h);
  }
  function frame(c, w, h, t) {
    if (!cur) return;
    c.imageSmoothingEnabled = false;
    const st = { stage: cur.stage, since: now() - cur.at, vb: visBottom(h), still: !!(RB.game && RB.game.reducedMotion && RB.game.reducedMotion()) };
    try {
      ART[cur.id].draw(c, w, h, t, st);
    } catch (err) {
      c.fillStyle = '#07080d'; c.fillRect(0, 0, w, h);
      if (!cur.failed) { cur.failed = true; console.error('interlude', cur.id, err); }
    }
  }
  frame.art = true;

  function show(id, stage) {
    const A = ART[id];
    if (!A) { console.warn('missing interlude', id); return; }
    stage = stage || A.stages[0];
    if (cur && cur.id === id) {
      if (cur.stage !== stage) { cur.stage = stage; cur.at = now(); }
      return;
    }
    cur = { id, stage, at: now(), top: null };
    RB.render.setOverride(frame);
  }
  function clear() {
    if (!cur) return;
    cur = null;
    RB.render.setOverride(null);
    if (RB.prologueArt) RB.prologueArt.release();
  }
  const state = () => (cur ? { id: cur.id, stage: cur.stage, since: Math.round(now() - cur.at) } : null);

  return { ART, show, clear, state, active: () => !!cur };
})();
