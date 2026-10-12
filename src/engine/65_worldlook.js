/* Light and shadow on the maps. Begun as the world proof (expansion P01: a development view of two maps), made the
 * game's own look on every map by Robin's choice (C-86: "Every exterior, all chapters", and rooms lit by what they
 * hold: "Light sources can come from windows, candles or other light fixtures"). Nothing here changes a map's
 * tiles, collisions, exits, people or story, and nothing is saved; it only draws. Settings → "Light and shadow" turns
 * it off (the game's flat picture, as before).
 *
 * Three layers (docs/future/work/P01_WORLD.md, the art contract, AC-1):
 *   base         the region's materials (src/engine/66_worldkit.js: ground dressing, low growth, birds, rails) outdoors;
 *                indoors the windows a room's building has on its outside, drawn on its walls;
 *   illumination outdoors each region's own sun: cast shadows (one mask per map, cached) and an ambient grade; at night
 *                or in the dark, the lamps cast them; indoors the light that comes in at the windows by day, and the
 *                lamps, candles, hearths and stoves, each casting shadows away from itself, the rest of the room dimmer;
 *   atmosphere   glow on things that give light, a sunlit haze, glints on open water, optional soft view edges.
 * The camera: outdoors the view may sit a little wider than the game's own where the screen allows a whole number of
 * device pixels per art pixel (never as far as the proof's far view, Robin's C-80); rooms and battles keep the game's.
 *
 *   RB.worldLook.allowed()        -> a development page (?dev=world, or a test's switch): the panel, the far view
 *   RB.worldLook.active(m)        -> light and shadow apply to this map now
 *   RB.worldLook.opts             -> { on, view: 'mid'|'far'|'near', kit, light, atmos, soft }
 *   RB.worldLook.set(o)           -> change switches; re-applies the camera; redraws
 *   RB.worldLook.cfg(m)           -> what a map is lit as: { region, sun } outdoors, { indoor: true } in a room
 *   RB.worldLook.SUNS / SLICE     -> each region's sun; the proof's two maps (its development features) */
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
  // the player's setting (on unless turned off; an older record lacks it)
  function enabled() {
    const s = RB.game && RB.game.settings;
    return !(s && s.worldLight === false);
  }
  const dev = allowed();
  const opts = { on: true, view: dev ? 'far' : 'mid', kit: true, light: true, atmos: true, soft: false };
  const opts_ = opts; // (for code where a local is named opts)

  // ---- each region's sun ----------------------------------------------------------------------------------------
  // dx, dy: where a cast shadow falls (art px of shadow per art px of height; the sun stands to the upper left, so
  // shadows fall down and to the right, longer where the sun is low); key: the sunlight's colour; shade, mul: the
  // shade's colour (on a person, on the ground); shadow: how dark a shadow is; grade: how strongly the light colours
  // the view. A region's weather and darkness soften these (stateOf).
  const SUNS = {
    // Reedwake and Saltglass: the proof's own (W01, W05)
    reedwake: { dx: 0.66, dy: 0.3, key: '255,206,128', shade: '52,40,104', mul: '146,128,196', shadow: 0.72, grade: 0.24 },
    saltglass: { dx: 0.7, dy: 0.32, key: '255,198,120', shade: '44,40,104', mul: '140,130,200', shadow: 0.7, grade: 0.24 },
    // the settlement on the old Reedwake plain: the same country, a little later in the day
    ashihara: { dx: 0.72, dy: 0.32, key: '255,200,124', shade: '54,40,102', mul: '148,128,194', shadow: 0.72, grade: 0.25 },
    // the coast and the open sea: a higher sun, paler and bluer shade
    sazanami: { dx: 0.6, dy: 0.28, key: '255,214,150', shade: '40,48,110', mul: '138,140,204', shadow: 0.68, grade: 0.22 },
    sea: { dx: 0.55, dy: 0.26, key: '255,226,170', shade: '36,52,112', mul: '136,146,206', shadow: 0.62, grade: 0.2 },
    // the Cinder Orchard in autumn: a low golden sun, long shadows, plum shade
    cinder: { dx: 0.84, dy: 0.37, key: '255,182,104', shade: '70,36,72', mul: '170,122,168', shadow: 0.72, grade: 0.28 },
    // Snowbell: a low pale winter sun, long blue shadows on the snow
    snowbell: { dx: 0.9, dy: 0.42, key: '255,236,208', shade: '40,62,124', mul: '150,172,218', shadow: 0.62, grade: 0.14 },
    // Lanternfall: a soft lavender afternoon
    lanternfall: { dx: 0.64, dy: 0.3, key: '255,210,168', shade: '56,40,104', mul: '152,136,200', shadow: 0.66, grade: 0.22 },
    // Manybridge's canals: a high midday sun between the houses, short shadows
    manybridge: { dx: 0.52, dy: 0.26, key: '255,214,150', shade: '48,42,100', mul: '146,134,196', shadow: 0.7, grade: 0.22 },
    // the Keepers' Road through the mountain woods
    keepers: { dx: 0.74, dy: 0.34, key: '255,204,140', shade: '44,46,96', mul: '140,138,190', shadow: 0.7, grade: 0.22 },
    // Kotonoha: a high island sun, teal shade
    kotonoha: { dx: 0.48, dy: 0.24, key: '255,232,176', shade: '30,60,104', mul: '130,156,200', shadow: 0.7, grade: 0.22 },
    // the Cloudroad: thin, clear mountain air; above the clouds, colder and brighter still
    cloudroad: { dx: 0.62, dy: 0.3, key: '255,230,190', shade: '44,56,120', mul: '146,156,212', shadow: 0.66, grade: 0.18 },
    cloudtop: { dx: 0.6, dy: 0.3, key: '255,244,222', shade: '50,72,136', mul: '160,178,224', shadow: 0.6, grade: 0.14 },
    // Steamhollow: the valley's steam softens everything
    steamhollow: { dx: 0.58, dy: 0.28, key: '255,208,164', shade: '64,46,90', mul: '166,140,186', shadow: 0.58, grade: 0.2 },
    // the mountain under the Archive, and its still world
    sa_mount: { dx: 0.8, dy: 0.38, key: '244,232,214', shade: '46,52,96', mul: '150,156,196', shadow: 0.56, grade: 0.12 },
    sa_still: { dx: 0.5, dy: 0.3, key: '226,226,255', shade: '40,40,90', mul: '150,150,206', shadow: 0.46, grade: 0.12 },
    // the Hall's tales and anything else: a mild afternoon
    hall: { dx: 0.62, dy: 0.3, key: '255,214,160', shade: '50,44,100', mul: '150,140,196', shadow: 0.6, grade: 0.16 },
  };
  for (const k in SUNS) SUNS[k].id = k;
  const sunFor = (region) => SUNS[region] || (region && /^hall/.test(region) ? SUNS.hall : null) || SUNS.hall;
  // The proof's two maps: its development features (the working people, the visits) stay there
  const SLICE = { 'rw.village': { region: 'reedwake', sun: SUNS.reedwake }, 'sg.harbor': { region: 'saltglass', sun: SUNS.saltglass } };

  // What a map is lit as (cached on the compiled map): a room or a walled place indoors, anything else outdoors under
  // its region's sun. A map may opt out (def.look === false).
  function cfg(m) {
    if (!m) return null;
    if (m.lookCfg !== undefined) return m.lookCfg;
    let c;
    if (m.def && m.def.look === false) c = null;
    else if (RB.render && RB.render.enclosed && RB.render.enclosed(m)) c = { indoor: true, region: m.region };
    else c = SLICE[m.id] || { region: m.region, sun: sunFor(m.region) };
    m.lookCfg = c;
    return c;
  }
  function active(m) {
    return !!(opts.on && enabled() && cfg(m));
  }
  const indoor = (m) => !!(cfg(m) || {}).indoor;
  // the regional kit (ground dressing, low growth, birds, rails): outdoors only
  const kitOn = (m) => !!(opts.kit && RB.worldKit && active(m) && !indoor(m));

  // ---- the camera ------------------------------------------------------------------------------------------------
  // The game's own view is about 12/17/21 tiles across (8–12 tall), at a whole number of device pixels per art pixel.
  // Outdoors the view may widen by about a third, but only where the screen gives a whole-pixel step no more than
  // half as many tiles again (1920×1080: 30 tiles rather than 20; 2560×1440: 27); otherwise, and on phones, it stays
  // the game's own. The proof's far view (about 45 tiles at 1440×900) is kept for the development page only.
  const FAR = 1.71, MID = 1.3;
  const baseView = (cw, ch) => ({ w: cw < 700 ? 12 : cw < 1100 ? 17 : 21, h: ch < 520 ? 8 : 12 });
  function farView(cw, ch) {
    const b = baseView(cw, ch);
    return { w: b.w * FAR, h: b.h * FAR };
  }
  function artPxFor(cw, ch, t) {
    const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
    let a = Math.max(1, Math.round((Math.min(cw / t.w, ch / t.h) * dpr) / 32));
    if (a > 1 && (cw * dpr) / (a * 32) < t.w * 0.8) a--;
    return a;
  }
  function midView(cw, ch) {
    const b = baseView(cw, ch);
    if (cw < 700) return b;
    const want = { w: b.w * MID, h: b.h * MID }, a0 = artPxFor(cw, ch, b), a1 = artPxFor(cw, ch, want);
    return a1 < a0 && a0 / a1 <= 1.5 ? want : b;
  }
  // A battle keeps the game's own framing (Robin, C-80), and so does the fidelity study (src/engine/68d_study.js)
  const inBattle = () => !!(RB.game && RB.game.mode && (RB.game.mode() === 'combat' || RB.game.mode() === 'study'));
  function applyCamera() {
    if (!RB.render || !RB.render.setView) return;
    const m = RB.world && RB.world.W && RB.world.W.map;
    const out = active(m) && !inBattle() && !indoor(m) && !(RB.render.enclosed && RB.render.enclosed(m));
    RB.render.setView(!out || opts.view === 'near' ? null : opts.view === 'far' && dev ? farView : midView);
  }
  function set(o) {
    o = o || {};
    // the static layer is redrawn only when what it holds changes (the look itself, or its kit)
    const restatic = ('on' in o && o.on !== opts.on) || ('kit' in o && o.kit !== opts.kit);
    Object.assign(opts, o);
    applyCamera();
    if (restatic && RB.render) RB.render.invalidate();
    for (const f of listeners) f(opts);
  }
  const listeners = [];
  function onChange(f) { listeners.push(f); }
  // Settings changed: the camera again, and the static layer (it holds the kit) when the setting itself changed
  let lastEnabled = null;
  function applySetting() {
    const e = enabled();
    if (lastEnabled !== null && e !== lastEnabled && RB.render && RB.render.invalidate) RB.render.invalidate();
    lastEnabled = e;
    applyCamera();
  }

  if (typeof window !== 'undefined' && RB.bus && RB.bus.on) {
    RB.bus.on('map:enter', () => applyCamera());
    RB.bus.on('mode:change', () => applyCamera());
  }

  // ---- shared helpers ------------------------------------------------------------------------------------------
  const mk = (w, h) => RB.sprites.makeCanvas(Math.max(1, Math.ceil(w)), Math.max(1, Math.ceil(h)));
  const ctx2 = (cv) => cv.getContext('2d', { willReadFrequently: true });
  const hh = (x, y, k) => RB.tiles.hh(x, y, k);
  const canBlur = (() => { try { return typeof document !== 'undefined' && 'filter' in document.createElement('canvas').getContext('2d'); } catch (e) { return false; } })();
  const OVERCAST = { rain: 1, snow: 1, mist: 1 };
  // The light now: outdoors the region's sun, weakened by weather and by a darkening (at night, or a dark enough
  // place, no sun at all: the lamps cast the shadows then); indoors the room's light by day or by night.
  function stateOf(m, env) {
    const c = cfg(m);
    if (!c) return null;
    const amb = (env && env.amb) || {}, dark = +amb.dark || 0, night = !!(env && env.night);
    // a room is dark by night only (the map's own night, or a scene's): a dim room by day still has daylight at its windows
    if (c.indoor) return { indoor: true, night: !!(env && env.mapNight), dark };
    if (night || !c.sun) return { night: true, dark };
    let k = 1;
    if (dark > 0) k *= 1 - Math.min(1, dark / 0.3) * 0.55;
    if (OVERCAST[amb.weather]) k *= 0.68;
    if (amb.tint) k *= 0.9;
    return { sun: c.sun, k, dark };
  }
  function sunOf(m, env) {
    const st = stateOf(m, env);
    return st && st.sun ? st.sun : null;
  }

  // ---- the things that give light ------------------------------------------------------------------------------
  // A prop that gives light (its own `light`, or one of these, which the darkness did not count but a room does: a
  // stove's fire, a kiln's mouth, an oven, the festival's lanterns, the workshop's lamps); its flame's height above
  // the floor (art px) sets how long the shadows it casts are.
  const SOURCE = { stove: 26, kiln: 30, lf_oven: 26, mp_lanterns: 30, fw_clamppost: 26, fw_armlamp: 26, sg_lamproom: 30, co_kilnwall: 26 };
  const LOWFIRE = { campfire: 1, sb_irori: 1, stove: 1, kiln: 1, lf_oven: 1, co_furnace: 1, lf_grate: 1, co_kilnwall: 1 };
  const TINY = { sparkle: 1, echo: 1 };
  // what is visible now among things shown only in some story states (the cached layers depend on it)
  function visSig(m) {
    if (!m.lookCond) {
      m.lookCond = [];
      for (const st of m.structs) if (st.if) m.lookCond.push(st);
      for (const p of m.props) if (p.if) m.lookCond.push(p);
    }
    const s = RB.game.s;
    let sig = '';
    for (const o of m.lookCond) sig += RB.state.test(s, o.if) ? '1' : '0';
    return sig;
  }
  function emitters(m) {
    const s = RB.game.s, out = [];
    for (const p of m.props) {
      const pd = RB.props.P[p.p];
      if (!pd) continue;
      const r = p.light || pd.light || SOURCE[p.p];
      if (!r) continue;
      if (p.if && !RB.state.test(s, p.if)) continue;
      if (p.o && p.o.lit === false) continue;
      const pw = p.w || pd.w || 1, ph = p.h || pd.h || 1;
      out.push({ p, x: p.x + pw / 2, y: p.y + ph - 0.15, r, he: LOWFIRE[p.p] ? 14 : TINY[p.p] ? 10 : 40, s: TINY[p.p] ? 0.4 : 1, R: Math.max(2.5, (r / 16) * 1.9), extra: !(p.light || pd.light) });
    }
    return out;
  }

  // ---- windows in a room ----------------------------------------------------------------------------------------
  // A room entered from a building outside has that building's windows: the ones on its front, in the room's front
  // wall, and as many at the back, in the back wall (where the daylight falls across the floor). Placed by the same
  // fraction of the wall's length as outside; only on timber walls with their face showing.
  let linkIndex = null;
  function links() {
    if (linkIndex) return linkIndex;
    linkIndex = {};
    const maps = (RB.content && RB.content.maps) || {};
    for (const id in maps) for (const st of maps[id].structs || []) if (st.to && st.windows && st.windows.length && !linkIndex[st.to]) linkIndex[st.to] = { w: st.w, windows: st.windows.slice() };
    return linkIndex;
  }
  const isWall = (m, x, y) => x < 0 || y < 0 || x >= m.w || y >= m.h || m.tiles[y * m.w + x].id === 'wall';
  function windowsOf(m) {
    if (m.lookWin) return m.lookWin;
    const L = links()[m.id], out = [];
    m.lookWin = out;
    if (!L || !RB.render.enclosed(m)) return out;
    // the back wall: in each column the lowest wall with only wall above it and floor below; the front: the
    // bottom row's walls with floor above
    const back = [], front = [];
    for (let x = 0; x < m.w; x++) {
      let y = 0;
      while (y < m.h - 1 && isWall(m, x, y + 1)) y++;
      if (y < m.h / 2 && !isWall(m, x, y + 1)) back.push([x, y]);
      const fy = m.h - 1;
      if (isWall(m, x, fy) && !isWall(m, x, fy - 1)) front.push([x, fy]);
    }
    const timber = () => { const k = RB.tileArt && RB.tileArt.wallStyleOf ? RB.tileArt.wallStyleOf(m) : 'timber'; return k === 'timber'; };
    if (!timber()) return out;
    const place = (row, isBack) => {
      if (row.length < 3) return;
      const x0 = row[0][0], x1 = row[row.length - 1][0], span = x1 - x0 + 1, used = new Set();
      for (const wx of L.windows) {
        const f = (wx + 0.5) / L.w, x = Math.round(x0 + f * span - 0.5);
        const cell = row.find((c) => c[0] === x);
        if (!cell || used.has(x)) continue;
        used.add(x);
        out.push({ x, y: cell[1], back: isBack });
      }
    };
    place(back, true);
    place(front, false);
    return out;
  }

  // ---- illumination: cast shadows ---------------------------------------------------------------------------------
  // Every standing thing casts its own silhouette onto the ground, sheared away from the light: a point h art px above
  // the thing's ground contact lands (dx·k·h, dy·k·h) from it. k is how much of a sprite's drawn height is height
  // (the rest of a roof or a crown is depth, in this view). Under the sun every shadow falls the same way; from a lamp
  // or a window each falls away from it, longer the nearer the thing stands to a low flame. The silhouettes are
  // gathered into one mask per map (cached with the static layer and the story's visible things), softened once and
  // stepped into a core and a penumbra, so shadows stay crisp pixel clusters and overlapping shadows never darken
  // twice. People's shadows are made the same way per frame of art (cached) and joined with the map's.
  const HEIGHT = {
    tree: 0.8, orchard: 0.8, pine: 0.85, deadtree: 0.8, bush: 0.5, reeds: 0.4, rock: 0.45, stump: 0.45,
    lantern: 0.95, deadlantern: 0.95, lamppost: 0.95, well: 0.6, noticeboard: 0.8, sign: 0.85, signblank: 0.85,
    cart: 0.55, hay: 0.55, barrel: 0.65, crate: 0.65, laundry: 0.85, bench: 0.45, flowerpot: 0.55, teaset: 0.4,
    stone_marker: 0.8, fence: 0.7, shelf: 0.9, counter: 0.5, desk: 0.5, chair: 0.6, table: 0.45, bed: 0.3, bookpile: 0.5,
  };
  const NONE = { water: 1, pier: 1, boat: 1, exitmat: 1, sparkle: 1, echo: 1, rug: 1, mat: 1, sb_futon: 1, sb_irori: 1 };
  function heightOf(kind, pd) {
    if (NONE[kind]) return 0;
    if (HEIGHT[kind] != null) return HEIGHT[kind];
    return pd && pd.block === false ? 0 : 0.6;
  }
  const STRUCT_H = { house: 66, tower: 120 };
  const stat = { masks: 0, rooms: 0, maskMs: 0 };
  const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
  // keep only the opaque part of a sprite (its own soft contact shadow and halos are not the thing)
  function solidify(g, w, h) {
    const img = g.getImageData(0, 0, w, h), d = img.data;
    for (let i = 3; i < d.length; i += 4) d[i] = d[i] >= 140 ? 255 : 0;
    g.putImageData(img, 0, 0);
  }
  // soften a mask, then step it: core (full), penumbra (half), nothing
  function stepMask(cv, blur) {
    const w = cv.width, h = cv.height, g = ctx2(cv);
    if (canBlur && blur) {
      const tmp = mk(w, h), tg = ctx2(tmp);
      tg.filter = 'blur(' + blur + 'px)';
      tg.drawImage(cv, 0, 0);
      tg.filter = 'none';
      g.clearRect(0, 0, w, h);
      g.drawImage(tmp, 0, 0);
    }
    const img = g.getImageData(0, 0, w, h), d = img.data;
    for (let i = 3; i < d.length; i += 4) d[i] = d[i] >= 150 ? 255 : d[i] >= 55 ? 128 : 0;
    g.putImageData(img, 0, 0);
    return img;
  }
  // lay the shade colour into a stepped mask (its alpha stays the steps)
  function tintMask(g, w, h, col) {
    g.save();
    g.globalCompositeOperation = 'source-in';
    g.fillStyle = 'rgb(' + col + ')';
    g.fillRect(0, 0, w, h);
    g.restore();
  }
  // project a silhouette (already solid, in the shade colour) from src onto g; baseY is the ground contact's row in
  // src; (gx, gy) is where src's top-left would be drawn upright
  function project(g, src, baseY, k, sun, gx, gy, w) {
    const dx = sun.dx * k, dy = sun.dy * k, sw = w || src.width;
    g.save();
    g.beginPath(); // only what stands above its contact casts
    g.setTransform(1, 0, -dx, -dy, gx + dx * baseY, gy + baseY + dy * baseY);
    g.rect(0, 0, sw, baseY);
    g.clip();
    g.drawImage(src, 0, 0, sw, baseY, 0, 0, sw, baseY);
    g.restore();
  }
  let scratch = null, sg = null;
  function scratchFor(w, h) {
    if (!scratch || scratch.width < w || scratch.height < h) { scratch = mk(Math.max(w, scratch ? scratch.width : 0), Math.max(h, scratch ? scratch.height : 0)); sg = ctx2(scratch); }
    sg.setTransform(1, 0, 0, 1, 0, 0);
    sg.globalCompositeOperation = 'source-over';
    sg.clearRect(0, 0, scratch.width, scratch.height);
    sg.imageSmoothingEnabled = false;
    return sg;
  }
  // draw one thing into the scratch and cast its silhouette into the map's mask. (A sprite's own faint contact shadow
  // comes along: what lies above the contact is at most a faint penumbra at the shadow's root, where it falls
  // anyway, so the per-sprite thresholding the proof did is skipped: it was a quarter of the mask's cost.)
  function castThing(mg, draw, w, h, ox, oy, baseY, k, sun, gx, gy) {
    const g = scratchFor(w, h);
    draw(g, ox, oy);
    g.globalCompositeOperation = 'source-in';
    g.fillStyle = '#000';
    g.fillRect(0, 0, w, h);
    g.globalCompositeOperation = 'source-over';
    project(mg, scratch, baseY, k, sun, gx - ox, gy - oy, w);
  }
  // The light that falls most strongly on a place (tile units), among a set of point lights; null if none reaches.
  // Each light: x, y (its foot on the floor), he (the flame's height, art px), s (strength), R (reach, tiles).
  function strongest(lights, fx, fy) {
    let best = null, bi = 0.2;
    for (const L of lights) {
      const d = Math.hypot(fx - L.x, fy - L.y), I = L.s * (1 - d / L.R);
      if (I > bi) { bi = I; best = L; }
    }
    return best;
  }
  // the direction and length of a shadow cast from a point light (art px per art px of height); null right under it.
  // A window is a broad light high in the wall: its shadows fall into the room, short, leaning a little away from it.
  function castFrom(L, fx, fy) {
    const vx = fx - L.x, vy = fy - L.y, d = Math.hypot(vx, vy);
    if (L.win) return { dx: Math.max(-0.26, Math.min(0.26, vx * 0.09)), dy: 0.42 };
    if (d < 0.35) return null;
    const len = Math.max(0.22, Math.min(0.95, (d * 32) / L.he));
    return { dx: (vx / d) * len, dy: (vy / d) * len };
  }
  // the lights that cast shadows here now: at night or in the dark the lamps; in a room by day, also its back windows
  function castLights(m, st) {
    const out = [];
    for (const e of emitters(m)) if (e.r >= 24 && !TINY[e.p.p]) out.push(e);
    if (st.indoor && !st.night) for (const w of windowsOf(m)) if (w.back) out.push({ x: w.x + 0.5, y: w.y + 1, he: 64, s: 1.05, R: 8.5, win: true });
    return out;
  }
  const ROOM_SHADE = '118,96,112';
  // the map's shadow mask, the size of its static layer (built lazily, dropped with it)
  function shadowsOf(m, env) {
    const st = stateOf(m, env);
    if (!st || !m.staticLayer) return null;
    const sun = st.sun || null;
    const mode = sun ? 'sun:' + sun.id : (st.indoor ? 'room:' : 'lamps:') + (st.night ? 'n' : 'd');
    const key = m.staticLayer, sig = visSig(m);
    if (m.look && m.look.key === key && m.look.mode === mode && m.look.sig === sig) return m.look.empty ? null : m.look;
    const lights = sun ? null : castLights(m, st);
    if (!sun && !lights.length) { m.look = { key, mode, sig, empty: true }; return null; }
    const ATS = 32, gm = m.margin || { x: 0, y: 0 }, t0 = now();
    const W = m.staticLayer.width, H = m.staticLayer.height;
    const cv = mk(W, H), mg = ctx2(cv);
    mg.imageSmoothingEnabled = false;
    const pal = RB.tiles.PAL[m.region] || RB.tiles.PAL.reedwake;
    const s = RB.game.s;
    const at = (x, y) => [(x + gm.x) * ATS, (y + gm.y) * ATS];
    // the direction a thing's shadow falls, standing at (fx, fy): the sun's, or away from the light strongest there
    const dirAt = (fx, fy, self) => {
      if (sun) return sun;
      const L = strongest(lights.filter((l) => l.p !== self), fx, fy);
      return L ? castFrom(L, fx, fy) : null;
    };
    // A building is a box on its footprint (the wall's eaves overhang a little): its shadow is the footprint swept
    // away from the sun by its height, the roof's hips trimming the far corners. (Only under the sun: by lamplight a
    // house's own lit windows are the light.)
    mg.fillStyle = '#000';
    if (sun) for (const stc of m.structs) {
      if (stc.if && !RB.state.test(s, stc.if)) continue;
      const [gx, gy] = at(stc.x, stc.y);
      const Hh = STRUCT_H[stc.type || 'house'] || 64, sx = sun.dx * Hh, sy = sun.dy * Hh, hip = 10;
      const X0 = gx - 6, X1 = gx + stc.w * ATS + 6, Y0 = gy + 6, Y1 = gy + stc.h * ATS - 2;
      mg.beginPath();
      mg.moveTo(X0, Y0); mg.lineTo(X1, Y0);
      mg.lineTo(X1 + sx - hip, Y0 + sy); mg.lineTo(X1 + sx, Y0 + sy + hip);
      mg.lineTo(X1 + sx, Y1 + sy - hip); mg.lineTo(X1 + sx - hip, Y1 + sy);
      mg.lineTo(X0 + sx, Y1 + sy); mg.lineTo(X0, Y1);
      mg.closePath();
      mg.fill();
    }
    const kitArt = kitOn(m) && RB.worldKit;
    const things = m.props.concat(m.apronProps || []);
    for (const p of things) {
      if (p.if && !RB.state.test(s, p.if)) continue;
      const pd = RB.props.P[p.p];
      if (!pd || !pd.draw2) continue;
      const k = heightOf(p.p, pd);
      if (!k) continue;
      const pw = p.w || pd.w || 1, ph = p.h || pd.h || 1;
      const dir = dirAt(p.x + pw / 2, p.y + ph - 0.1, p);
      if (!dir) continue;
      const w = pw * ATS + 96, h = ph * ATS + 120, ox = 48, oy = 96;
      const [gx, gy] = at(p.x, p.y);
      const o = Object.assign({ cx: p.x, cy: p.y, still: true }, p.o || {});
      const d2 = (kitArt && RB.worldKit.propFor(m, p.p)) || pd.draw2;
      castThing(mg, (g, x, y) => d2(g, x, y, pal, 0, o), w, h, ox, oy, oy + ph * ATS - 3, k, dir, gx, gy);
    }
    // the kit's low growth casts too
    if (kitArt) for (const kc of RB.worldKit.casters(m)) {
      const dir = dirAt(kc.x + 0.5, kc.y + 0.9, null);
      if (!dir) continue;
      const [gx, gy] = at(kc.x, kc.y);
      castThing(mg, kc.draw, 96, 120, 48, 96, 96 + ATS - 3, kc.k, dir, gx, gy);
    }
    // in a room, shadows lie on the floor only, never over its walls
    if (st.indoor) {
      mg.save();
      mg.globalCompositeOperation = 'destination-out';
      mg.fillStyle = '#000';
      for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) if (isWall(m, x, y)) mg.fillRect((x + gm.x) * ATS, (y + gm.y) * ATS, ATS, ATS);
      mg.restore();
    }
    const img = stepMask(cv, 2);
    const mul = sun ? sun.mul : ROOM_SHADE;
    tintMask(mg, W, H, mul);
    // the steps at the people's feet, on a 4-px grid, so a person standing in shade is shaded
    const cw = Math.ceil(W / 4), chh = Math.ceil(H / 4), lvl = new Uint8Array(cw * chh);
    for (let y = 0; y < chh; y++) for (let x = 0; x < cw; x++) { const a = img.data[(Math.min(H - 1, y * 4 + 2) * W + Math.min(W - 1, x * 4 + 2)) * 4 + 3]; lvl[y * cw + x] = a >= 255 ? 2 : a ? 1 : 0; }
    m.look = { key, mode, sig, sun, lights, cv, lvl, cw, ch: chh, gm, shade: sun ? sun.shade : ROOM_SHADE, mul };
    stat.masks++;
    stat.maskMs = Math.round(now() - t0);
    stat.maskMs = Math.round(now() - t0);
    return m.look;
  }
  // a person's shadow for one frame of art, from one direction (cached per art canvas and direction)
  const actorCache = new WeakMap();
  function actorShadow(art, dir, mul) {
    let byDir = actorCache.get(art);
    if (!byDir) { byDir = new Map(); actorCache.set(art, byDir); }
    const key = dir.key || dir.id || dir.dx + ',' + dir.dy;
    let e = byDir.get(key);
    if (e) return e;
    const A = RB.sprites.ANCHOR, k = 0.85;
    const w = art.width, h = art.height;
    const dx = dir.dx * k, dy = dir.dy * k;
    const L = Math.floor(Math.min(0, dx * A.y)) - 2, T = Math.floor(Math.min(0, dy * A.y)) - 4;
    const W = Math.ceil(w + Math.abs(dx) * A.y) + 6, H = Math.ceil(Math.abs(dy) * A.y) + 10;
    const cv = mk(W, H), g = ctx2(cv);
    const src = mk(w, h), s2 = ctx2(src);
    s2.drawImage(art, 0, 0);
    s2.globalCompositeOperation = 'source-in'; s2.fillStyle = '#000'; s2.fillRect(0, 0, w, h);
    solidify(s2, w, h);
    project(g, src, A.y, k, dir, -L, -A.y + 2 - T);
    stepMask(cv, 1);
    tintMask(g, W, H, mul);
    e = { cv, ox: -A.x + L, oy: -2 + T };
    if (byDir.size > 24) byDir.clear();
    byDir.set(key, e);
    return e;
  }
  // a person's shadow direction by lamplight or window light, rounded to one of 16 bearings and 3 lengths
  const QDIR = new Map();
  function quantDir(d) {
    const a = Math.round((Math.atan2(d.dy, d.dx) / (Math.PI * 2)) * 16) & 15, l = Math.hypot(d.dx, d.dy), li = l < 0.45 ? 0 : l < 0.8 ? 1 : 2;
    const key = a + '|' + li;
    let q = QDIR.get(key);
    if (!q) { const len = [0.35, 0.62, 0.95][li], ang = (a / 16) * Math.PI * 2; q = { dx: Math.cos(ang) * len, dy: Math.sin(ang) * len, key: 'q' + key }; QDIR.set(key, q); }
    return q;
  }
  // how strongly shadows show now: under the sun its own strength (weather and darkness soften it); in a room by
  // day the windows' soft light; by lamplight a little more
  function shadowAlpha(st, L) {
    if (L.sun) return L.sun.shadow * (st.k == null ? 1 : st.k);
    if (st.indoor) return st.night ? 0.5 : 0.44;
    return 0.5;
  }
  // The ground pass: the map's shade laid once by multiplication (keeps the ground's own hue), then each person's
  // shadow where the map's shade is not already (a person in shade casts no second shadow), through a small patch
  // each, so the frame never pays for a second full-screen composite.
  let patch = null, pg = null;
  function ground(c, m, W, t, env) {
    if (!opts.light) return;
    const L = shadowsOf(m, env);
    if (!L) return;
    const st = stateOf(m, env), X0 = env.ax(-L.gm.x * 16), Y0 = env.ay(-L.gm.y * 16);
    m.lookK = st.k == null ? 1 : st.k; // (for a person standing in shade, drawn after)
    c.save();
    c.globalCompositeOperation = 'multiply';
    c.globalAlpha = shadowAlpha(st, L);
    c.drawImage(L.cv, X0, Y0);
    for (const a of env.actors()) {
      const art = env.artOf(a, t);
      if (!art) continue;
      let dir = L.sun;
      if (!dir) {
        const fx = a.fx + 0.5, fy = a.fy + 0.95, src = strongest(L.lights, fx, fy), d = src && castFrom(src, fx, fy);
        if (!d) continue;
        dir = quantDir(d);
      }
      const sh = actorShadow(art.cv, dir, L.mul), x = art.fx + sh.ox, y = art.fy + sh.oy, w = sh.cv.width, h = sh.cv.height;
      if (x > env.bw || y > env.bh || x + w < 0 || y + h < 0) continue;
      if (!patch || patch.width < w || patch.height < h) { patch = mk(Math.max(w, 96), Math.max(h, 48)); pg = ctx2(patch); }
      pg.globalCompositeOperation = 'source-over';
      pg.clearRect(0, 0, patch.width, patch.height);
      pg.drawImage(sh.cv, 0, 0);
      pg.globalCompositeOperation = 'destination-out';
      pg.drawImage(L.cv, x - X0, y - Y0, w, h, 0, 0, w, h);
      c.drawImage(patch, 0, 0, w, h, x, y, w, h);
    }
    c.restore();
  }
  // how deep in shade a person's feet are (0, 0.5, 1)
  function shadeAt(m, a) {
    if (!opts.light || !m.look || m.look.empty || !m.look.lvl) return 0;
    const L = m.look, gx = ((a.fx + L.gm.x) * 32 + 16) >> 2, gy = ((a.fy + L.gm.y) * 32 + 28) >> 2;
    if (gx < 0 || gy < 0 || gx >= L.cw || gy >= L.ch) return 0;
    return L.lvl[gy * L.cw + gx] / 2;
  }
  let tint = null, tg = null;
  function shaded(m, a, art) {
    const amt = shadeAt(m, a);
    if (!amt || !m.look || !m.look.lvl) return art;
    if (!tint || tint.width < art.width || tint.height < art.height) { tint = mk(Math.max(art.width, 48), Math.max(art.height, 64)); tg = ctx2(tint); }
    tg.globalCompositeOperation = 'source-over';
    tg.clearRect(0, 0, tint.width, tint.height);
    tg.drawImage(art, 0, 0);
    tg.globalCompositeOperation = 'source-atop';
    const strength = m.look.sun ? m.look.sun.shadow * (m.lookK == null ? 1 : m.lookK) : 0.5;
    tg.fillStyle = 'rgba(' + m.look.shade + ',' + (amt * strength * 0.42).toFixed(3) + ')';
    tg.fillRect(0, 0, art.width, art.height);
    return tint;
  }

  // ---- illumination: a room's light ------------------------------------------------------------------------------
  // A room is a little dimmer than the day outside, except where its light falls: daylight through each back window
  // in a shaft across the floor (slanting the way the sun stands), a softer patch inside each front window, a warm
  // pool round each lamp, candle and fire. The floor darkens a little where it meets the walls. One map-sized layer
  // (cached with the static layer), laid over everything by multiplication once a frame. By night the windows give
  // only a faint cool light and the room is darker but for its lamps; in a dark place the darkness itself is the
  // game's, and this only warms the pools.
  function roomOf(m, st) {
    const key = m.staticLayer, mode = (st.night ? 'n' : 'd') + (st.dark >= 0.25 ? 'k' : ''), sig = visSig(m);
    if (m.lookRoom && m.lookRoom.key === key && m.lookRoom.mode === mode && m.lookRoom.sig === sig) return m.lookRoom.cv;
    const ATS = 32, W = m.staticLayer.width, H = m.staticLayer.height, gm = m.margin || { x: 0, y: 0 };
    const cv = mk(W, H), g = cv.getContext('2d');
    const em = emitters(m), wins = windowsOf(m), any = em.length || wins.length;
    // the room's own level: a lit room by day, by night, or a dark place (its darkness is drawn by the game)
    g.fillStyle = 'rgb(' + (st.dark >= 0.25 ? '236,230,226' : st.night ? (any ? '164,162,188' : '190,188,206') : any ? '204,192,180' : '226,218,208') + ')';
    g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = 'lighter';
    const P = (x, y) => [(x + gm.x) * ATS, (y + gm.y) * ATS];
    // the windows' light falls on the floor (and the wall round each window), never across the side walls
    g.save();
    g.beginPath();
    for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) if (!isWall(m, x, y)) { const [X, Y] = P(x, y); g.rect(X, Y, ATS, ATS); }
    for (const w of wins) { const [X, Y] = P(w.x, w.y); g.rect(X - 26, Y - 26, 84, 84); }
    g.clip();
    for (const w of wins) {
      const [X, Y] = P(w.x, w.y);
      if (w.back) {
        // the shaft: from the window's sill down across the floor, widening, slanting down and to the right
        const top = Y + ATS, len = st.night ? 70 : 118, x0 = X + 3, x1 = X + 29, sl = 0.32;
        const gr = g.createLinearGradient(0, top, 0, top + len);
        const col = st.night ? '90,104,150' : '255,236,200';
        gr.addColorStop(0, 'rgba(' + col + ',' + (st.night ? 0.22 : 0.62) + ')');
        gr.addColorStop(0.55, 'rgba(' + col + ',' + (st.night ? 0.1 : 0.3) + ')');
        gr.addColorStop(1, 'rgba(' + col + ',0)');
        g.fillStyle = gr;
        g.beginPath();
        g.moveTo(x0, top); g.lineTo(x1, top);
        g.lineTo(x1 + len * sl + 12, top + len); g.lineTo(x0 + len * sl - 8, top + len);
        g.closePath();
        g.fill();
        // the wall round the window catches its light
        const wr = g.createRadialGradient(X + 16, Y + 14, 2, X + 16, Y + 14, 40);
        wr.addColorStop(0, 'rgba(' + col + ',' + (st.night ? 0.12 : 0.34) + ')');
        wr.addColorStop(1, 'rgba(' + col + ',0)');
        g.fillStyle = wr;
        g.fillRect(X - 26, Y - 26, 84, 84);
      } else {
        // a front window: a soft patch on the floor just inside it
        const cx = X + 16, cy = Y - 6, r = 46;
        const pr = g.createRadialGradient(cx, cy, 2, cx, cy, r);
        const col = st.night ? '80,94,140' : '255,234,198';
        pr.addColorStop(0, 'rgba(' + col + ',' + (st.night ? 0.14 : 0.4) + ')');
        pr.addColorStop(1, 'rgba(' + col + ',0)');
        g.fillStyle = pr;
        g.fillRect(cx - r, cy - r, r * 2, r * 2);
      }
    }
    g.restore();
    for (const e of em) {
      const [X, Y] = P(e.x, e.y - 0.35), R = e.R * ATS;
      const gr = g.createRadialGradient(X, Y, 0, X, Y, R);
      gr.addColorStop(0, 'rgba(255,206,150,' + (0.62 * e.s).toFixed(3) + ')');
      gr.addColorStop(0.45, 'rgba(255,196,140,' + (0.28 * e.s).toFixed(3) + ')');
      gr.addColorStop(1, 'rgba(255,190,130,0)');
      g.fillStyle = gr;
      g.fillRect(X - R, Y - R, R * 2, R * 2);
    }
    // the floor's edge along the walls
    g.globalCompositeOperation = 'multiply';
    const E = 10;
    for (let y = 0; y < m.h; y++)
      for (let x = 0; x < m.w; x++) {
        if (isWall(m, x, y)) continue;
        const [X, Y] = P(x, y);
        const band = (x0, y0, x1, y1, rx, ry, rw, rh) => {
          const gr = g.createLinearGradient(x0, y0, x1, y1);
          gr.addColorStop(0, 'rgb(196,188,196)');
          gr.addColorStop(1, 'rgb(255,255,255)');
          g.fillStyle = gr;
          g.fillRect(rx, ry, rw, rh);
        };
        if (isWall(m, x, y - 1)) band(0, Y, 0, Y + E, X, Y, ATS, E);
        if (isWall(m, x - 1, y)) band(X, 0, X + E, 0, X, Y, E, ATS);
        if (isWall(m, x + 1, y)) band(X + ATS, 0, X + ATS - E, 0, X + ATS - E, Y, E, ATS);
      }
    m.lookRoom = { key, mode, sig, cv };
    stat.rooms++;
    return cv;
  }

  // ---- illumination: the ambient grade --------------------------------------------------------------------------
  // Outdoors the sun's colour laid softly over everything (warm light, cool shade), a little brighter toward the sun's
  // side of the view and a little cooler away from it; at night only a cooling (the game's own darkness runs). Two
  // cheap passes (soft-light cost three times as much, measured). Indoors the room's light, then a faint warmth.
  function illuminate(c, m, W, t, env) {
    if (!opts.light) return;
    const st = stateOf(m, env), bw = env.bw, bh = env.bh;
    if (!st) return;
    c.save();
    if (st.indoor) {
      if (m.staticLayer) {
        const gm = m.margin || { x: 0, y: 0 };
        c.globalCompositeOperation = 'multiply';
        c.drawImage(roomOf(m, st), env.ax(-gm.x * 16), env.ay(-gm.y * 16));
      }
      c.globalCompositeOperation = 'overlay';
      c.fillStyle = st.night ? 'rgba(70,84,150,0.14)' : 'rgba(255,214,170,0.1)';
      c.fillRect(0, 0, bw, bh);
    } else if (st.sun) {
      // from a height (a deck over the ground far below) the grade is half: the far ground keeps its own colours
      const sun = st.sun, k = st.k * (m.def && m.def.surround ? 0.5 : 1);
      c.globalCompositeOperation = 'overlay';
      c.fillStyle = 'rgba(' + sun.key + ',' + (sun.grade * (0.4 + 0.6 * k) * (m.def && m.def.surround ? 0.5 : 1)).toFixed(3) + ')';
      c.fillRect(0, 0, bw, bh);
      c.globalCompositeOperation = 'source-over';
      const g = c.createLinearGradient(0, 0, bw, bh);
      g.addColorStop(0, 'rgba(' + sun.key + ',' + (0.12 * k).toFixed(3) + ')');
      g.addColorStop(0.5, 'rgba(' + sun.key + ',0)');
      g.addColorStop(1, 'rgba(' + sun.mul + ',' + (0.1 * k).toFixed(3) + ')');
      c.fillStyle = g;
      c.fillRect(0, 0, bw, bh);
    } else {
      c.globalCompositeOperation = 'overlay';
      c.fillStyle = 'rgba(70,90,160,0.2)';
      c.fillRect(0, 0, bw, bh);
    }
    c.restore();
  }
  // The darkness's extra openings (src/engine/60_render.js drawLighting): what gives light in a room that the
  // darkness did not count before (a stove's fire, the festival's lanterns), and daylight at a dark room's windows.
  function holes(m, env) {
    if (!opts.light || !active(m)) return [];
    const st = stateOf(m, env), out = [];
    if (!st) return out;
    for (const e of emitters(m)) if (e.extra) out.push({ x: e.p.x * 16 + 8, y: e.p.y * 16 + 2, r: e.r });
    if (st.indoor && !st.night) for (const w of windowsOf(m)) out.push(w.back ? { x: w.x * 16 + 8 + 10, y: (w.y + 2) * 16, r: 30 } : { x: w.x * 16 + 8, y: w.y * 16 - 4, r: 22 });
    return out;
  }

  // ---- base: a room's windows ----------------------------------------------------------------------------------
  // A shoji window in the wall's plaster: a timber frame, the paper's lattice, the paper bright with the day behind
  // it (warm at the top where the sun is), or dim and blue at night. Drawn each frame over the static layer, under
  // everything that stands in the room.
  const winCache = new Map();
  function windowArt(pal, night) {
    const k = (pal.wood || []).join() + '|' + night;
    let cv = winCache.get(k);
    if (cv) return cv;
    cv = mk(26, 19);
    const g = cv.getContext('2d'), wd = pal.woodR || pal.wood;
    const R = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
    R(0, 0, 26, 19, wd[0]);
    R(1, 1, 24, 17, wd[1] || wd[0]);
    for (let y = 2; y < 17; y++) {
      const u = (y - 2) / 15;
      const day = [Math.round(252 - u * 14), Math.round(244 - u * 18), Math.round(222 - u * 26)];
      const nt = [Math.round(82 - u * 14), Math.round(92 - u * 14), Math.round(126 - u * 12)];
      const c3 = night ? nt : day;
      R(2, y, 22, 1, 'rgb(' + c3.join(',') + ')');
    }
    // the lattice (kumiko): three bars down, one across
    const bar = night ? 'rgba(30,26,40,0.85)' : (wd[2] || wd[0]);
    for (const x of [7, 13, 19]) R(x, 2, 1, 15, bar);
    R(2, 9, 22, 1, bar);
    if (!night) { R(3, 3, 3, 1, 'rgba(255,255,255,0.75)'); R(3, 4, 1, 2, 'rgba(255,255,255,0.5)'); }
    R(0, 18, 26, 1, wd[0]);
    winCache.set(k, cv);
    return cv;
  }
  function walls(c, m, t, env) {
    if (!opts.light || !opts.kit) return;
    const st = stateOf(m, env);
    if (!st || !st.indoor) return;
    const wins = windowsOf(m);
    if (!wins.length) return;
    const pal = RB.tiles.PAL[m.region] || RB.tiles.PAL.reedwake, art = windowArt(pal, st.night);
    for (const w of wins) {
      const X = env.ax(w.x * 16) + 3, Y = env.ay(w.y * 16) + 5;
      if (X < -40 || Y < -40 || X > env.bw + 40 || Y > env.bh + 40) continue;
      c.drawImage(art, X, Y);
    }
  }

  // ---- atmosphere ---------------------------------------------------------------------------------------------
  // Glow only on things that give light (lit windows, lanterns, fires), a sunlit haze, glints on open water, and an
  // optional softening of the view's top and bottom edges (off the play space). Nothing here moves with reduced
  // motion; flicker comes from each light's own position, never a random stream.
  const glowCache = new Map();
  function glowSprite(r, col) {
    const k = r + '|' + col;
    let cv = glowCache.get(k);
    if (cv) return cv;
    cv = mk(r * 2, r * 2);
    const g = cv.getContext('2d'), gr = g.createRadialGradient(r, r, 0, r, r, r);
    gr.addColorStop(0, 'rgba(' + col + ',0.9)');
    gr.addColorStop(0.35, 'rgba(' + col + ',0.35)');
    gr.addColorStop(1, 'rgba(' + col + ',0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, r * 2, r * 2);
    glowCache.set(k, cv);
    return cv;
  }
  function glows(c, m, t, env, st) {
    const s = RB.game.s, night = !!env.night, still = env.still;
    const day = night ? 1 : st && st.indoor ? 0.62 : 0.42;
    const flick = (ph) => (still ? 1 : 0.9 + 0.1 * Math.sin(t / 340 + ph) + 0.05 * Math.sin(t / 97 + ph * 3));
    c.save();
    c.globalCompositeOperation = 'screen';
    for (const stc of m.structs) {
      if (stc.if && !RB.state.test(s, stc.if)) continue;
      for (const wx of stc.windows || []) {
        const x = env.ax((stc.x + wx) * 16 + 8), y = env.ay((stc.y + stc.h) * 16 - 11);
        if (x < -40 || y < -40 || x > env.bw + 40 || y > env.bh + 40) continue;
        const a = day * flick(stc.x * 1.3 + wx);
        c.globalAlpha = Math.min(1, a);
        const sp = glowSprite(20, '255,196,110');
        c.drawImage(sp, x - 20, y - 20);
      }
    }
    for (const e of emitters(m)) {
      const p = e.p;
      const x = env.ax(p.x * 16 + 8), y = env.ay(p.y * 16 + (LOWFIRE[p.p] ? 8 : 1));
      if (x < -140 || y < -140 || x > env.bw + 140 || y > env.bh + 140) continue;
      const f = flick(p.x * 1.7 + p.y * 2.3);
      c.globalAlpha = Math.min(1, day * 0.9 * e.s * f);
      const sp = glowSprite(26, '255,206,128');
      c.drawImage(sp, x - 26, y - 26);
      // indoors, and outdoors by night, the light the flame throws round it
      if ((st && st.indoor) || night) {
        const R = Math.round(Math.min(120, e.R * 26)), pool = glowSprite(R, '255,176,96');
        c.globalAlpha = Math.min(1, (night ? 0.3 : 0.22) * e.s * f);
        c.drawImage(pool, x - R, y + 10 - R);
      }
    }
    // a room's windows by day: the paper lit from behind
    if (st && st.indoor && !st.night) {
      c.globalAlpha = 0.5;
      const sp = glowSprite(18, '255,240,210');
      for (const w of windowsOf(m)) {
        const x = env.ax(w.x * 16 + 8), y = env.ay(w.y * 16 + 7);
        if (x < -40 || y < -40 || x > env.bw + 40 || y > env.bh + 40) continue;
        c.drawImage(sp, x - 18, y - 18);
      }
    }
    c.restore();
  }
  function glints(c, m, t, env) {
    if (env.still || env.night) return;
    const x0 = Math.max(0, Math.floor(env.cam.x / 16)), y0 = Math.max(0, Math.floor(env.cam.y / 16));
    const x1 = Math.min(m.w, Math.ceil((env.cam.x + env.bw / 2) / 16) + 1), y1 = Math.min(m.h, Math.ceil((env.cam.y + env.bh / 2) / 16) + 1);
    c.save();
    c.globalCompositeOperation = 'lighter';
    for (let y = y0; y < y1; y++)
      for (let x = x0; x < x1; x++) {
        const tile = m.tiles[y * m.w + x];
        if (!tile.water || tile.id === 'darkwater') continue;
        const r = hh(x, y, 91), per = 1700 + (r % 1300), ph = ((t + (r >>> 7) % per) % per) / per;
        if (ph > 0.22) continue;
        const a = Math.sin((ph / 0.22) * Math.PI);
        const sx = env.ax(x * 16) + 4 + ((r >>> 11) % 22), sy = env.ay(y * 16) + 4 + ((r >>> 17) % 22);
        c.fillStyle = 'rgba(255,246,214,' + (0.75 * a).toFixed(3) + ')';
        c.fillRect(sx, sy, 1, 1);
        if (a > 0.5) { c.fillRect(sx - 1, sy, 3, 1); c.fillRect(sx, sy - 1, 1, 3); c.fillStyle = 'rgba(255,246,214,' + (0.3 * a).toFixed(3) + ')'; c.fillRect(sx - 2, sy, 5, 1); }
      }
    c.restore();
  }
  function haze(c, m, env, st) {
    if (!st || !st.sun) return;
    // not from a height (a deck over the ground far below, src/engine/61_below.js): the ground below already has its
    // own distance, and a sunlit haze there washes the sea out
    if (m.def && m.def.surround) return;
    const sun = st.sun, k = st.k, bw = env.bw, bh = env.bh, R = Math.hypot(bw, bh) * 0.55;
    c.save();
    c.globalCompositeOperation = 'screen';
    const g = c.createRadialGradient(-bw * 0.06, -bh * 0.1, 0, -bw * 0.06, -bh * 0.1, R);
    g.addColorStop(0, 'rgba(' + sun.key + ',' + (0.3 * k).toFixed(3) + ')');
    g.addColorStop(0.45, 'rgba(' + sun.key + ',' + (0.1 * k).toFixed(3) + ')');
    g.addColorStop(1, 'rgba(' + sun.key + ',0)');
    c.fillStyle = g;
    c.fillRect(0, 0, Math.min(bw, R), Math.min(bh, R));
    c.restore();
  }
  // the view's top and bottom bands, softened by a cheap downscale of those bands only (no per-pixel filter)
  let small = null, smg = null, band = null, bandg = null;
  function softEdges(c, buf, env) {
    const bw = env.bw, bh = env.bh;
    if (bw < bh * 1.15) return; // not on portrait screens: their bands are play space and controls
    const B = Math.round(bh * 0.15), q = 4, sw = Math.ceil(bw / q), sb = Math.ceil(B / q);
    if (!small || small.width !== sw || small.height !== sb * 2) { small = mk(sw, sb * 2); smg = small.getContext('2d'); band = mk(bw, B * 2); bandg = band.getContext('2d'); }
    smg.imageSmoothingEnabled = true;
    smg.drawImage(buf, 0, 0, bw, B, 0, 0, sw, sb);
    smg.drawImage(buf, 0, bh - B, bw, B, 0, sb, sw, sb);
    bandg.globalCompositeOperation = 'copy';
    bandg.imageSmoothingEnabled = true;
    bandg.drawImage(small, 0, 0, sw, sb * 2, 0, 0, bw, B * 2);
    bandg.globalCompositeOperation = 'destination-in';
    const g = bandg.createLinearGradient(0, 0, 0, B * 2);
    g.addColorStop(0, 'rgba(0,0,0,0.8)');
    g.addColorStop(0.5, 'rgba(0,0,0,0)');
    g.addColorStop(0.5, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,0.8)');
    bandg.fillStyle = g;
    bandg.fillRect(0, 0, bw, B * 2);
    c.drawImage(band, 0, 0, bw, B, 0, 0, bw, B);
    c.drawImage(band, 0, B, bw, B, 0, bh - B, bw, B);
  }
  function atmosphere(c, m, W, t, env) {
    if (!opts.atmos) return;
    const st = stateOf(m, env);
    if (!st) return;
    if (!st.indoor) glints(c, m, t, env);
    glows(c, m, t, env, st);
    haze(c, m, env, st);
    if (opts.soft && env.buf) softEdges(c, env.buf, env);
  }

  // ---- a battle that starts outdoors ----------------------------------------------------------------------------
  // The region's light carries into the battle's backdrop (composed from the same place by src/ui/76_battle_places.js):
  // the same grade, laid on the backdrop only, before the stage draws anyone, so combatants, faces and every reading
  // surface keep their own colours (V3). Night and story states follow the map's own alternatives.
  function ambOf(m) {
    const s = RB.game && RB.game.s;
    for (const a of (m.def && m.def.alt) || []) if (s && RB.state.test(s, a.if)) return { amb: a.ambient || {}, night: !!a.night };
    return { amb: (m.def && m.def.ambient) || {}, night: !!(m.def && m.def.night) };
  }
  function battleGrade(c, w, h) {
    const m = RB.world && RB.world.W && RB.world.W.map;
    if (!active(m) || !opts.light || indoor(m)) return;
    const a = ambOf(m), night = a.night || (+a.amb.dark || 0) >= 0.3;
    illuminate(c, m, RB.world.W, 0, { bw: w, bh: h, night, amb: a.amb });
  }

  // ---- the development panel (only on a dev page) ---------------------------------------------------------------
  // Switches for each layer and the view, and a visit to the slice in a session that is never saved: offered only
  // while no journey is loaded, so no save slot is current and nothing can be autosaved.
  function panel() {
    if (!allowed() || typeof document === 'undefined') return null;
    let el = document.getElementById('wl-dev');
    if (el) return el;
    el = document.createElement('div');
    el.id = 'wl-dev';
    el.setAttribute('role', 'region');
    el.setAttribute('aria-label', 'World proof (development)');
    el.style.cssText = 'position:fixed;left:8px;top:8px;z-index:99999;background:rgba(28,37,48,0.94);color:#eee;font:13px sans-serif;padding:8px;border:1px solid #567;border-radius:6px;max-width:260px;display:grid;gap:6px';
    const css = document.createElement('style');
    css.textContent = '#wl-dev button{font:13px sans-serif;color:#f4f0e6;background:#34485c;border:1px solid #7a90a6;border-radius:4px;min-height:28px;padding:2px 8px}' +
      '#wl-dev button:hover{background:#40586f}#wl-dev button[aria-pressed="true"]{background:#7a5a2a;border-color:#e0b060}#wl-dev.min>*:not(#wl-toggle){display:none}#wl-dev .row{display:flex;flex-wrap:wrap;gap:4px}#wl-dev [hidden]{display:none!important}';
    document.head.appendChild(css);
    const B = (k, label) => '<button type="button" data-k="' + k + '" aria-pressed="false">' + label + '</button>';
    el.innerHTML = '<button type="button" id="wl-toggle" aria-expanded="true">World proof (dev): hide</button>' +
      '<div class="row">' + B('on', 'The proof') + B('far', 'Far view') + '</div>' +
      '<div class="row">' + B('kit', 'Kit') + B('light', 'Light') + B('atmos', 'Atmosphere') + B('soft', 'Soft edges') + '</div>' +
      '<div class="row" id="wl-visits"><button type="button" data-visit="rw">Visit Reedwake (not saved)</button>' +
      '<button type="button" data-visit="sg">Visit Saltglass (not saved)</button></div>' +
      '<button type="button" id="wl-study">Study: Suzu at the Mill</button>';
    document.body.appendChild(el);
    const sync = () => {
      for (const b of el.querySelectorAll('[data-k]')) {
        const k = b.dataset.k, on = k === 'far' ? opts.view === 'far' : !!opts[k];
        b.setAttribute('aria-pressed', String(on));
      }
      const v = el.querySelector('#wl-visits'), cur = RB.save && RB.save.current && RB.save.current();
      v.hidden = !!(cur && cur.slot != null);
    };
    el.addEventListener('click', (e) => {
      const b = e.target.closest('[data-k]');
      if (!b) return;
      const k = b.dataset.k;
      set(k === 'far' ? { view: opts.view === 'far' ? 'near' : 'far' } : { [k]: !opts[k] });
    });
    const VISITS = {
      rw: ['rw.village', 22, 18, { departed: true }],
      sg: ['sg.harbor', 30, 22, { departed: true, ch1_done: true, sg_arrived: true }],
    };
    el.querySelector('#wl-visits').addEventListener('click', (e) => {
      const b = e.target.closest('[data-visit]');
      if (!b) return;
      const cur = RB.save && RB.save.current && RB.save.current();
      if (cur && cur.slot != null) return; // a journey is loaded: never risk an autosave over it
      const [map, x, y, flags] = VISITS[b.dataset.visit];
      RB.game.debugStart(map, x, y, { comp: 'suzu', flags: Object.assign({}, flags) });
      sync();
    });
    // the fidelity study (src/engine/68d_study.js): its own mode, nothing saved; Escape or its Close returns here
    el.querySelector('#wl-study').addEventListener('click', () => { if (RB.study && RB.study.open) RB.study.open(); });
    const fold = (min) => { el.classList.toggle('min', min); const t = el.querySelector('#wl-toggle'); t.textContent = 'World proof (dev): ' + (min ? 'show' : 'hide'); t.setAttribute('aria-expanded', String(!min)); };
    el.querySelector('#wl-toggle').addEventListener('click', () => fold(!el.classList.contains('min')));
    fold(window.innerHeight < 500 || window.innerWidth < 700);
    onChange(sync);
    if (RB.bus && RB.bus.on) RB.bus.on('map:enter', sync);
    sync();
    return el;
  }
  if (typeof window !== 'undefined' && typeof document !== 'undefined' && allowed()) {
    let tries = 0;
    const open = () => { if (window.__RB_READY__ === true && document.body) panel(); else if (++tries < 300) setTimeout(open, 100); };
    setTimeout(open, 0);
  }

  return {
    allowed, enabled, active, indoor, kitOn, cfg, opts, set, onChange, applySetting, SUNS, SLICE, farView, midView, FAR, MID,
    ground, shaded, shadeAt, illuminate, atmosphere, walls, holes, battleGrade, heightOf, windowsOf, emitters, castLights, stateOf, sunOf, panel,
    stats: () => Object.assign({}, stat),
  };
})();
