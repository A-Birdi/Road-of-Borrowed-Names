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
  const opts = { on: true, view: 'far', kit: true, light: true, atmos: true, soft: false };

  // The slice: the maps the proof draws, and each one's light. Sun: the direction cast shadows fall (art px of
  // shadow per art px of height, x and y), its colour and the shade's colour; ambient grade as data.
  const SLICE = {
    'rw.village': { region: 'reedwake', sun: { dx: 0.66, dy: 0.3, key: '255,206,128', shade: '52,40,104', mul: '146,128,196', shadow: 0.72, grade: 0.3 } },
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
    o = o || {};
    // the static layer is redrawn only when what it holds changes (the proof itself, or its kit)
    const restatic = ('on' in o && o.on !== opts.on) || ('kit' in o && o.kit !== opts.kit);
    Object.assign(opts, o);
    applyCamera();
    if (restatic && RB.render) RB.render.invalidate();
    for (const f of listeners) f(opts);
  }
  const listeners = [];
  function onChange(f) { listeners.push(f); }

  if (typeof window !== 'undefined' && RB.bus && RB.bus.on) RB.bus.on('map:enter', () => { if (allowed()) applyCamera(); });

  // ---- shared helpers ------------------------------------------------------------------------------------------
  const mk = (w, h) => RB.sprites.makeCanvas(Math.max(1, Math.ceil(w)), Math.max(1, Math.ceil(h)));
  const ctx2 = (cv) => cv.getContext('2d', { willReadFrequently: true });
  const hh = (x, y, k) => RB.tiles.hh(x, y, k);
  const canBlur = (() => { try { return typeof document !== 'undefined' && 'filter' in document.createElement('canvas').getContext('2d'); } catch (e) { return false; } })();
  // the sun of this map in its present state (null at night or indoors: no cast shadows then)
  function sunOf(m, env) {
    const c = cfg(m);
    if (!c || !c.sun || (env && env.night)) return null;
    return c.sun;
  }

  // ---- illumination: the sun's cast shadows ---------------------------------------------------------------------
  // Every standing thing casts its own silhouette onto the ground, sheared away from the sun: a point h art px above
  // the thing's ground contact lands (dx·k·h, dy·k·h) from it. k is how much of a sprite's drawn height is height
  // (the rest of a roof or a crown is depth, in this view). The silhouettes are gathered into one mask per map
  // (cached with the static layer), softened once and stepped into a core and a penumbra, so shadows stay crisp
  // pixel clusters and overlapping shadows never darken twice. People's shadows are made the same way per frame
  // of art (cached) and joined with the map's before the mask is laid on the ground.
  const HEIGHT = {
    tree: 0.8, orchard: 0.8, pine: 0.85, deadtree: 0.8, bush: 0.5, reeds: 0.4, rock: 0.45, stump: 0.45,
    lantern: 0.95, deadlantern: 0.95, lamppost: 0.95, well: 0.6, noticeboard: 0.8, sign: 0.85, signblank: 0.85,
    cart: 0.55, hay: 0.55, barrel: 0.65, crate: 0.65, laundry: 0.85, bench: 0.45, flowerpot: 0.55, teaset: 0.4,
    stone_marker: 0.8, fence: 0.7,
  };
  const NONE = { water: 1, pier: 1, boat: 1, exitmat: 1, sparkle: 1, echo: 1 };
  function heightOf(kind, pd) {
    if (NONE[kind]) return 0;
    if (HEIGHT[kind] != null) return HEIGHT[kind];
    return pd && pd.block === false ? 0 : 0.6;
  }
  const STRUCT_H = { house: 66, tower: 120 };
  const stat = { masks: 0 };
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
  function project(g, src, baseY, k, sun, gx, gy) {
    const dx = sun.dx * k, dy = sun.dy * k;
    g.save();
    g.beginPath(); // only what stands above its contact casts
    g.setTransform(1, 0, -dx, -dy, gx + dx * baseY, gy + baseY + dy * baseY);
    g.rect(0, 0, src.width, baseY);
    g.clip();
    g.drawImage(src, 0, 0);
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
  // draw one thing into the scratch, keep its silhouette, cast it into the map's mask
  function castThing(mg, draw, w, h, ox, oy, baseY, k, sun, gx, gy) {
    const g = scratchFor(w, h);
    draw(g, ox, oy);
    g.globalCompositeOperation = 'source-in';
    g.fillStyle = '#000';
    g.fillRect(0, 0, w, h);
    g.globalCompositeOperation = 'source-over';
    solidify(g, w, h);
    const piece = mk(w, h);
    piece.getContext('2d').drawImage(scratch, 0, 0, w, h, 0, 0, w, h);
    project(mg, piece, baseY, k, sun, gx - ox, gy - oy);
  }
  // the map's shadow mask, the size of its static layer (built lazily, dropped with it)
  function shadowsOf(m, env) {
    const sun = sunOf(m, env);
    if (!sun || !m.staticLayer) return null;
    const key = m.staticLayer;
    if (m.look && m.look.key === key && m.look.sun === sun) return m.look;
    const TS = 16, ATS = 32, gm = m.margin || { x: 0, y: 0 };
    const W = m.staticLayer.width, H = m.staticLayer.height;
    const cv = mk(W, H), mg = ctx2(cv);
    mg.imageSmoothingEnabled = false;
    const pal = RB.tiles.PAL[m.region] || RB.tiles.PAL.reedwake;
    const s = RB.game.s;
    const at = (x, y) => [(x + gm.x) * ATS, (y + gm.y) * ATS];
    // A building is a box on its footprint (the wall's eaves overhang a little): its shadow is the footprint swept
    // away from the sun by its height, the roof's hips trimming the far corners.
    mg.fillStyle = '#000';
    for (const st of m.structs) {
      if (st.if && !RB.state.test(s, st.if)) continue;
      const [gx, gy] = at(st.x, st.y);
      const H = STRUCT_H[st.type || 'house'] || 64, sx = sun.dx * H, sy = sun.dy * H, hip = 10;
      const X0 = gx - 6, X1 = gx + st.w * ATS + 6, Y0 = gy + 6, Y1 = gy + st.h * ATS - 2;
      mg.beginPath();
      mg.moveTo(X0, Y0); mg.lineTo(X1, Y0);
      mg.lineTo(X1 + sx - hip, Y0 + sy); mg.lineTo(X1 + sx, Y0 + sy + hip);
      mg.lineTo(X1 + sx, Y1 + sy - hip); mg.lineTo(X1 + sx - hip, Y1 + sy);
      mg.lineTo(X0 + sx, Y1 + sy); mg.lineTo(X0, Y1);
      mg.closePath();
      mg.fill();
    }
    const things = m.props.concat(m.apronProps || []);
    for (const p of things) {
      if (p.if && !RB.state.test(s, p.if)) continue;
      const pd = RB.props.P[p.p];
      if (!pd || !pd.draw2) continue;
      const k = heightOf(p.p, pd);
      if (!k) continue;
      const pw = p.w || pd.w || 1, ph = p.h || pd.h || 1;
      const w = pw * ATS + 96, h = ph * ATS + 120, ox = 48, oy = 96;
      const [gx, gy] = at(p.x, p.y);
      const opts = Object.assign({ cx: p.x, cy: p.y, still: true }, p.o || {});
      castThing(mg, (g, x, y) => pd.draw2(g, x, y, pal, 0, opts), w, h, ox, oy, oy + ph * ATS - 3, k, sun, gx, gy);
    }
    const img = stepMask(cv, 2);
    tintMask(mg, W, H, sun.mul);
    // the steps at the people's feet, on a 4-px grid, so a person standing in shade is shaded
    const cw = Math.ceil(W / 4), chh = Math.ceil(H / 4), lvl = new Uint8Array(cw * chh);
    for (let y = 0; y < chh; y++) for (let x = 0; x < cw; x++) { const a = img.data[(Math.min(H - 1, y * 4 + 2) * W + Math.min(W - 1, x * 4 + 2)) * 4 + 3]; lvl[y * cw + x] = a >= 255 ? 2 : a ? 1 : 0; }
    m.look = { key, sun, cv, lvl, cw, ch: chh, gm };
    stat.masks++;
    return m.look;
  }
  // a person's shadow for one frame of art (cached per art canvas)
  const actorCache = new WeakMap();
  function actorShadow(art, sun) {
    let e = actorCache.get(art);
    if (e && e.sun === sun) return e;
    const A = RB.sprites.ANCHOR, k = 0.85;
    const w = art.width, h = art.height;
    const dx = sun.dx * k, dy = sun.dy * k;
    const W = Math.ceil(w + dx * A.y) + 4, H = Math.ceil(dy * A.y) + 6;
    const cv = mk(W, H), g = ctx2(cv);
    const src = mk(w, h), s2 = ctx2(src);
    s2.drawImage(art, 0, 0);
    s2.globalCompositeOperation = 'source-in'; s2.fillStyle = '#000'; s2.fillRect(0, 0, w, h);
    solidify(s2, w, h);
    project(g, src, A.y, k, sun, 0, -A.y + 2);
    stepMask(cv, 1);
    tintMask(g, W, H, sun.mul);
    e = { cv, sun, ox: -A.x, oy: -2 };
    actorCache.set(art, e);
    return e;
  }
  // The ground pass: the map's shade laid once by multiplication (cool, keeps the ground's own hue), then each
  // person's shadow where the map's shade is not already (a person in shade casts no second shadow), through a
  // small patch each, so the frame never pays for a second full-screen composite.
  let patch = null, pg = null;
  function ground(c, m, W, t, env) {
    if (!opts.light) return;
    const L = shadowsOf(m, env);
    if (!L) return;
    const sun = L.sun, X0 = env.ax(-L.gm.x * 16), Y0 = env.ay(-L.gm.y * 16);
    c.save();
    c.globalCompositeOperation = 'multiply';
    c.globalAlpha = sun.shadow;
    c.drawImage(L.cv, X0, Y0);
    for (const a of env.actors()) {
      const art = env.artOf(a, t);
      if (!art) continue;
      const sh = actorShadow(art.cv, sun), x = art.fx + sh.ox, y = art.fy + sh.oy, w = sh.cv.width, h = sh.cv.height;
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
    if (!opts.light || !m.look) return 0;
    const L = m.look, gx = ((a.fx + L.gm.x) * 32 + 16) >> 2, gy = ((a.fy + L.gm.y) * 32 + 28) >> 2;
    if (gx < 0 || gy < 0 || gx >= L.cw || gy >= L.ch) return 0;
    return L.lvl[gy * L.cw + gx] / 2;
  }
  let tint = null, tg = null;
  function shaded(m, a, art) {
    const amt = shadeAt(m, a);
    if (!amt || !m.look) return art;
    if (!tint || tint.width < art.width || tint.height < art.height) { tint = mk(Math.max(art.width, 48), Math.max(art.height, 64)); tg = ctx2(tint); }
    tg.globalCompositeOperation = 'source-over';
    tg.clearRect(0, 0, tint.width, tint.height);
    tg.drawImage(art, 0, 0);
    tg.globalCompositeOperation = 'source-atop';
    tg.fillStyle = 'rgba(' + m.look.sun.shade + ',' + (amt * m.look.sun.shadow * 0.75).toFixed(3) + ')';
    tg.fillRect(0, 0, art.width, art.height);
    return tint;
  }

  // ---- illumination: the ambient grade --------------------------------------------------------------------------
  // The sun's colour laid softly over everything (warm light, cool shade), a little brighter toward the sun's side
  // of the view and a little cooler away from it. At night the game's own darkness runs; the grade then only cools.
  // Two cheap passes (soft-light cost three times as much, measured): the sun's colour by overlay (warm light,
  // deeper warm shade), then a plain wash toward the sun's side and a cool one away from it.
  function illuminate(c, m, W, t, env) {
    if (!opts.light) return;
    const sun = sunOf(m, env), bw = env.bw, bh = env.bh;
    c.save();
    if (sun) {
      c.globalCompositeOperation = 'overlay';
      c.fillStyle = 'rgba(' + sun.key + ',' + sun.grade + ')';
      c.fillRect(0, 0, bw, bh);
      c.globalCompositeOperation = 'source-over';
      const g = c.createLinearGradient(0, 0, bw, bh);
      g.addColorStop(0, 'rgba(' + sun.key + ',0.12)');
      g.addColorStop(0.5, 'rgba(' + sun.key + ',0)');
      g.addColorStop(1, 'rgba(' + sun.mul + ',0.1)');
      c.fillStyle = g;
      c.fillRect(0, 0, bw, bh);
    } else {
      c.globalCompositeOperation = 'overlay';
      c.fillStyle = 'rgba(70,90,160,0.2)';
      c.fillRect(0, 0, bw, bh);
    }
    c.restore();
  }

  // ---- atmosphere ---------------------------------------------------------------------------------------------
  // Glow only on authored emissive things (lit windows, lanterns), a sunlit haze, glints on open water, and an
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
  function glows(c, m, t, env) {
    const s = RB.game.s, night = !!env.night, still = env.still;
    const day = night ? 1 : 0.42;
    const flick = (ph) => (still ? 1 : 0.9 + 0.1 * Math.sin(t / 340 + ph) + 0.05 * Math.sin(t / 97 + ph * 3));
    c.save();
    c.globalCompositeOperation = 'screen';
    for (const st of m.structs) {
      if (st.if && !RB.state.test(s, st.if)) continue;
      for (const wx of st.windows || []) {
        const x = env.ax((st.x + wx) * 16 + 8), y = env.ay((st.y + st.h) * 16 - 11);
        if (x < -40 || y < -40 || x > env.bw + 40 || y > env.bh + 40) continue;
        const a = day * flick(st.x * 1.3 + wx);
        c.globalAlpha = Math.min(1, a);
        const sp = glowSprite(20, '255,196,110');
        c.drawImage(sp, x - 20, y - 20);
      }
    }
    for (const p of m.props) {
      const pd = RB.props.P[p.p];
      if (!pd || !(pd.light || p.light)) continue;
      if (p.if && !RB.state.test(s, p.if)) continue;
      if (p.o && p.o.lit === false) continue;
      const x = env.ax(p.x * 16 + 8), y = env.ay(p.y * 16 + 1);
      if (x < -60 || y < -60 || x > env.bw + 60 || y > env.bh + 60) continue;
      c.globalAlpha = Math.min(1, day * 0.9 * flick(p.x * 1.7 + p.y * 2.3));
      const sp = glowSprite(26, '255,206,128');
      c.drawImage(sp, x - 26, y - 26);
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
  function haze(c, m, env) {
    const sun = sunOf(m, env);
    if (!sun) return;
    const bw = env.bw, bh = env.bh, R = Math.hypot(bw, bh) * 0.55;
    c.save();
    c.globalCompositeOperation = 'screen';
    const g = c.createRadialGradient(-bw * 0.06, -bh * 0.1, 0, -bw * 0.06, -bh * 0.1, R);
    g.addColorStop(0, 'rgba(' + sun.key + ',0.3)');
    g.addColorStop(0.45, 'rgba(' + sun.key + ',0.1)');
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
    glints(c, m, t, env);
    glows(c, m, t, env);
    haze(c, m, env);
    if (opts.soft && env.buf) softEdges(c, env.buf, env);
  }

  // ---- the development panel (only on a ?dev=world page) ---------------------------------------------------------
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
      '#wl-dev button:hover{background:#40586f}#wl-dev button[aria-pressed="true"]{background:#7a5a2a;border-color:#e0b060}#wl-dev.min>*:not(#wl-toggle){display:none}#wl-dev .row{display:flex;flex-wrap:wrap;gap:4px}';
    document.head.appendChild(css);
    const B = (k, label) => '<button type="button" data-k="' + k + '" aria-pressed="false">' + label + '</button>';
    el.innerHTML = '<button type="button" id="wl-toggle" aria-expanded="true">World proof (dev): hide</button>' +
      '<div class="row">' + B('on', 'The proof') + B('far', 'Far view') + '</div>' +
      '<div class="row">' + B('kit', 'Kit') + B('light', 'Light') + B('atmos', 'Atmosphere') + B('soft', 'Soft edges') + '</div>' +
      '<button type="button" id="wl-visit">Visit Reedwake (not saved)</button>';
    document.body.appendChild(el);
    const sync = () => {
      for (const b of el.querySelectorAll('[data-k]')) {
        const k = b.dataset.k, on = k === 'far' ? opts.view === 'far' : !!opts[k];
        b.setAttribute('aria-pressed', String(on));
      }
      const v = el.querySelector('#wl-visit'), cur = RB.save && RB.save.current && RB.save.current();
      v.hidden = !!(cur && cur.slot != null);
    };
    el.addEventListener('click', (e) => {
      const b = e.target.closest('[data-k]');
      if (!b) return;
      const k = b.dataset.k;
      set(k === 'far' ? { view: opts.view === 'far' ? 'near' : 'far' } : { [k]: !opts[k] });
    });
    el.querySelector('#wl-visit').addEventListener('click', () => {
      const cur = RB.save && RB.save.current && RB.save.current();
      if (cur && cur.slot != null) return; // a journey is loaded: never risk an autosave over it
      RB.game.debugStart('rw.village', 22, 18, { comp: 'suzu', flags: { departed: true } });
      sync();
    });
    const fold = (min) => { el.classList.toggle('min', min); const t = el.querySelector('#wl-toggle'); t.textContent = 'World proof (dev): ' + (min ? 'show' : 'hide'); t.setAttribute('aria-expanded', String(!min)); };
    el.querySelector('#wl-toggle').addEventListener('click', () => fold(!el.classList.contains('min')));
    fold(window.innerHeight < 500 || window.innerWidth < 700);
    onChange(sync);
    if (RB.bus && RB.bus.on) RB.bus.on('map:enter', sync);
    sync();
    return el;
  }
  if (typeof window !== 'undefined' && typeof document !== 'undefined' && /[?&]dev=world\b/.test((window.location && window.location.search) || '')) {
    let tries = 0;
    const open = () => { if (window.__RB_READY__ === true && document.body) panel(); else if (++tries < 300) setTimeout(open, 100); };
    setTimeout(open, 0);
  }

  return { allowed, active, cfg, opts, set, onChange, SLICE, farView, FAR, ground, shaded, shadeAt, illuminate, atmosphere, heightOf, panel, stats: () => Object.assign({}, stat) };
})();
