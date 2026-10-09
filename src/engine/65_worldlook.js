/* The world proof (expansion P01): a development-only presentation of a few maps (the slice), to prove the
 * visual method before any of it reaches the game. Not reachable in normal play: nothing here does anything
 * unless the page was opened with ?dev=world (or a test set window.__RB_DEV_WORLD__ before the game started).
 * Nothing is saved, nothing changes a map's tiles, collisions, exits, people or story; it only draws.
 *
 * Three layers, each switchable for comparison (docs/future/work/P01_WORLD.md, the art contract):
 *   base         the materials and forms (the slice's kit: ground, buildings, foliage, water dressing);
 *   illumination authored ambient light, the sun's cast shadows, local lights;
 *   atmosphere   glow on emissive things only, haze, water glints, optional softness at the screen's edges.
 * And the camera: the far view frames a town the way the target plates do (about 45 tiles across at
 * 1440×900), always at a whole number of device pixels per art pixel. Rooms keep the near view.
 *
 *   RB.worldLook.allowed()        -> true only on a dev page (or a test that asked for it)
 *   RB.worldLook.active(m)        -> the proof applies to this map (allowed, switched on, in the slice)
 *   RB.worldLook.opts             -> { on, view: 'far'|'near', kit, light, atmos, soft }
 *   RB.worldLook.set(o)           -> change switches; re-applies the camera; redraws
 *   RB.worldLook.SLICE            -> the maps the proof covers, with their region's settings */
var RB = (globalThis.RB = globalThis.RB || {});

RB.worldLook = (function () {
  'use strict';
  function allowed() {
    try {
      if (typeof window === 'undefined') return false;
      if (window.__RB_DEV_WORLD__ === true) return true;
      return /[?&]dev=world\b/.test(window.location.search || '');
    } catch (e) { return false; }
  }
  const opts = { on: true, view: 'far', kit: true, light: true, atmos: true, soft: true };

  // The slice: the maps the proof draws, and each one's light. Sun: the direction cast shadows fall (art px of
  // shadow per art px of height, x and y), its colour and the shade's colour; ambient grade as data.
  const SLICE = {
    'rw.village': { region: 'reedwake', sun: { dx: 0.62, dy: 0.34, key: '255,214,150', shade: '46,40,92', grade: 0.14, shadow: 0.3 } },
  };
  const cfg = (m) => (m && SLICE[m.id]) || null;
  function active(m) {
    return allowed() && opts.on && !!cfg(m);
  }

  // ---- the camera ------------------------------------------------------------------------------------------------
  // Tiles across by width class, scaled from the near view's 12/17/21 (and 8/12 tall); the renderer then picks a
  // whole number of device pixels per art pixel, so the far view lands where the device allows: 45 tiles across
  // at 1440×900 (one device pixel per art pixel), 40 at 2048×1046 on a 1.25 screen, 17.6 on a 375-px phone.
  const FAR = 1.71;
  function farView(cw, ch) {
    return { w: (cw < 700 ? 12 : cw < 1100 ? 17 : 21) * FAR, h: (ch < 520 ? 8 : 12) * FAR };
  }
  function applyCamera() {
    if (!RB.render || !RB.render.setView) return;
    const m = RB.world && RB.world.W && RB.world.W.map;
    const far = active(m) && opts.view === 'far' && !(RB.render.enclosed && RB.render.enclosed(m));
    RB.render.setView(far ? farView : null);
  }
  function set(o) {
    Object.assign(opts, o || {});
    applyCamera();
    if (RB.render) RB.render.invalidate();
    for (const f of listeners) f(opts);
  }
  const listeners = [];
  function onChange(f) { listeners.push(f); }

  if (typeof window !== 'undefined' && RB.bus && RB.bus.on) RB.bus.on('map:enter', () => { if (allowed()) applyCamera(); });

  return { allowed, active, cfg, opts, set, onChange, SLICE, farView, FAR };
})();
