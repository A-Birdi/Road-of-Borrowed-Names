/* World renderer. The world keeps its 16-px logical grid (movement, collision,
 * triggers, saves), but is drawn into a buffer at ART = 2 art pixels per
 * logical pixel: 32×32-art-pixel tiles and ~32×48 characters. The buffer is
 * then scaled by an integer number of device pixels (artPx) so pixel art stays
 * crisp. Art authored at art resolution provides draw2/getArt; older 16-px art
 * is drawn through a ×2 transform until it is redrawn (legacy adapter). Text
 * is never drawn here — the DOM text layer handles Japanese (spec §16). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.render = (function () {
  'use strict';
  const TS = 16;            // logical tile (game pixels)
  const ART = 2;            // art pixels per logical pixel
  const ATS = TS * ART;     // art pixels per tile
  let canvas = null, ctx = null;
  let buf = null, bctx = null;
  let light = null, lctx = null;
  let artPx = 2, cssW = 0, cssH = 0, dpr = 1;
  let bw = 0, bh = 0;       // buffer size in art pixels
  const cam = { x: 0, y: 0 }; // logical pixels (multiples of 1/ART)
  let particles = [];
  let staticDirty = true;
  let override = null; // function(ctx, w, h, t) for full-screen modes (combat, title, creation)

  function init(cv) {
    canvas = cv;
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
    if (window.visualViewport) window.visualViewport.addEventListener('resize', resize);
    canvas.addEventListener('pointerdown', onPointer);
  }
  // Field of view: about 12 tiles across on phones, 17 on tablets, 21 on
  // desktops (8–12 tall). A tile is 32 art pixels, each artPx device pixels.
  function resize() {
    cssW = window.innerWidth;
    cssH = window.innerHeight;
    dpr = window.devicePixelRatio || 1;
    const targetW = cssW < 700 ? 12 : cssW < 1100 ? 17 : 21;
    const targetH = cssH < 520 ? 8 : 12;
    const tileDev = Math.min(cssW / targetW, cssH / targetH) * dpr;
    artPx = Math.max(1, Math.round(tileDev / ATS));
    // never show much less than the intended view: step down if rounding up cost > 20 %
    if (artPx > 1 && (cssW * dpr) / (artPx * ATS) < targetW * 0.8) artPx--;
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    bw = Math.ceil(canvas.width / artPx);
    bh = Math.ceil(canvas.height / artPx);
    buf = RB.sprites.makeCanvas(bw, bh);
    bctx = buf.getContext('2d');
    bctx.imageSmoothingEnabled = false;
    light = RB.sprites.makeCanvas(bw, bh);
    lctx = light.getContext('2d');
    RB.bus.emit('resize', { cssW, cssH, scale: (artPx * ART) / dpr });
  }
  // Logical view size (game pixels) and CSS px per game pixel.
  function viewSize() {
    return { w: bw / ART, h: bh / ART, scale: (artPx * ART) / dpr };
  }
  function invalidate() {
    staticDirty = true;
    particles = [];
  }
  function palOf(m) {
    return RB.tiles.PAL[m.region] || RB.tiles.PAL.reedwake;
  }
  // Draw older 16-px art through a ×ART transform (logical coordinates).
  function legacy(c, fn) {
    c.save();
    c.scale(ART, ART);
    fn();
    c.restore();
  }

  // Static layer of a map at art resolution. Only the current and previous
  // maps keep one (a large map is a few megabytes at this resolution).
  let staticMaps = [];
  function buildStatic(m) {
    const cv = RB.sprites.makeCanvas(m.w * ATS, m.h * ATS);
    const c = cv.getContext('2d');
    c.imageSmoothingEnabled = false;
    const pal = palOf(m);
    for (let y = 0; y < m.h; y++)
      for (let x = 0; x < m.w; x++) {
        const t = m.tiles[y * m.w + x];
        const nb = (dx, dy) => RB.maps.tileAt(m, x + dx, y + dy);
        if (t.draw2) t.draw2(c, x * ATS, y * ATS, pal, RB.tiles.hh(x, y), nb, x, y);
        else legacy(c, () => t.draw(c, x * TS, y * TS, pal, RB.tiles.hh(x, y), nb));
      }
    if (RB.tileArt && RB.tileArt.flush) RB.tileArt.flush(); // tile art batches its output per row
    m.staticLayer = cv;
    staticDirty = false;
    staticMaps = staticMaps.filter((o) => o !== m);
    staticMaps.push(m);
    while (staticMaps.length > 2) { const old = staticMaps.shift(); old.staticLayer = null; }
  }

  // Screen area covered by interface (CSS px): the dialogue sheet or the touch
  // controls at the bottom. The camera composes the map in the space that is
  // left, so the player and nearby interactions are never under a panel and a
  // small map sits in the visible area instead of floating in an empty band.
  let insets = { top: 0, bottom: 0 };
  let camMap = null, camY = 0, camX = 0;
  function setInsets(o) {
    insets = { top: Math.max(0, (o && o.top) || 0), bottom: Math.max(0, (o && o.bottom) || 0) };
  }
  function updateCamera(W) {
    const p = W.player;
    const m = W.map;
    const vw = bw / ART, vh = bh / ART; // logical view
    const k = dpr / (artPx * ART);     // CSS px -> logical px
    const ft = Math.min(vh * 0.3, insets.top * k);
    const fb = Math.max(ft + vh * 0.4, vh - insets.bottom * k);
    const fh = fb - ft;
    const mw = m.w * TS, mh = m.h * TS;
    let cx = (p.fx + 0.5) * TS - vw / 2;
    cx = mw <= vw ? (mw - vw) / 2 : Math.max(0, Math.min(mw - vw, cx));
    let cy;
    if (mh <= fh) cy = -(ft + (fh - mh) / 2);
    else cy = Math.max(-ft, Math.min(mh - fb, (p.fy + 0.5) * TS - (ft + fh / 2) - 4));
    // follow the walking player exactly; ease only the larger jumps that come
    // from a panel opening or closing (snap on a new map or with reduced motion)
    if (camMap !== m || RB.game.reducedMotion()) { camMap = m; camX = cx; camY = cy; }
    else {
      camX = Math.abs(cx - camX) > 12 ? camX + (cx - camX) * 0.2 : cx;
      camY = Math.abs(cy - camY) > 12 ? camY + (cy - camY) * 0.2 : cy;
    }
    // snap to whole art pixels so nothing shimmers
    cam.x = Math.round(camX * ART) / ART;
    cam.y = Math.round(camY * ART) / ART;
  }
  // logical -> buffer (art) pixel
  const ax = (lx) => Math.round((lx - cam.x) * ART);
  const ay = (ly) => Math.round((ly - cam.y) * ART);

  // Outside a small map: a quiet surround in the region's darkest colour —
  // timber for interiors, a faint weave outdoors — and a soft edge shadow, so
  // the map reads as a lit room or stage rather than an empty band. Nothing
  // here looks walkable. Patterns are cached per palette.
  const surroundCache = new Map();
  function mix(hex, to, a) {
    const n = parseInt(hex.slice(1), 16), m2 = parseInt(to.slice(1), 16);
    const ch = (v, w) => Math.round(v + (w - v) * a);
    const r = ch(n >> 16, m2 >> 16), g = ch((n >> 8) & 255, (m2 >> 8) & 255), b = ch(n & 255, m2 & 255);
    return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
  }
  function surroundPattern(c, pal, indoor) {
    const key = pal.dark + (indoor ? 'i' : 'o');
    let pat = surroundCache.get(key);
    if (pat) return pat;
    const cv = RB.sprites.makeCanvas(64, 64);
    const g = cv.getContext('2d');
    g.fillStyle = pal.dark;
    g.fillRect(0, 0, 64, 64);
    if (indoor) {
      // dark timber: 16-px boards with a lit edge and a shadowed seam, staggered joints, the odd knot
      const seam = mix(pal.dark, '#000000', 0.4), lit = mix(pal.dark, '#ffffff', 0.06), grain = mix(pal.dark, '#000000', 0.18);
      for (let x = 0; x < 64; x += 16) {
        g.fillStyle = seam; g.fillRect(x, 0, 1, 64);
        g.fillStyle = lit; g.fillRect(x + 1, 0, 1, 64);
        g.fillStyle = grain; g.fillRect(x + 6, 0, 1, 64); g.fillRect(x + 11, 0, 1, 64);
      }
      g.fillStyle = seam;
      g.fillRect(2, 18, 13, 1); g.fillRect(18, 50, 13, 1); g.fillRect(34, 8, 13, 1); g.fillRect(50, 36, 13, 1);
      g.fillStyle = grain; g.fillRect(40, 26, 3, 2); g.fillRect(9, 44, 2, 2);
    } else {
      // a faint two-way weave, like the folio's cloth
      const hi = mix(pal.dark, '#ffffff', 0.05), lo = mix(pal.dark, '#000000', 0.3);
      for (let j = 0; j < 64; j += 4) for (let i = 0; i < 64; i += 4) {
        g.fillStyle = hi; g.fillRect((i + j) % 64, j, 2, 1);
        g.fillStyle = lo; g.fillRect((i + 66 - j) % 64, j + 2, 2, 1);
      }
    }
    pat = c.createPattern(cv, 'repeat');
    surroundCache.set(key, pat);
    return pat;
  }
  function drawSurround(c, m, pal) {
    const mx = ax(0), my = ay(0), mw = m.w * ATS, mh = m.h * ATS;
    c.fillStyle = pal.dark;
    if (mx <= 0 && my <= 0 && mx + mw >= bw && my + mh >= bh) { c.fillRect(0, 0, bw, bh); return; }
    // plain ground under the map itself; the patterned surround only in the
    // strips around it (painting the whole buffer twice a frame cost about
    // a third of a small interior's frame time)
    c.fillRect(mx, my, mw, mh);
    const indoor = m.region === 'interior' || (m.def && m.def.indoor) || (m.w <= 17 && m.h <= 12);
    c.save();
    c.translate(mx & 63, my & 63); // the pattern stays put relative to the map
    c.fillStyle = surroundPattern(c, pal, indoor);
    const ox = mx & 63, oy = my & 63, top = Math.max(0, my), bot = Math.min(bh, my + mh);
    if (my > 0) c.fillRect(-ox, -oy, bw, my);
    if (my + mh < bh) c.fillRect(-ox, my + mh - oy, bw, bh - my - mh);
    if (mx > 0 && bot > top) c.fillRect(-ox, top - oy, mx, bot - top);
    if (mx + mw < bw && bot > top) c.fillRect(mx + mw - ox, top - oy, bw - mx - mw, bot - top);
    c.restore();
    // soft shadow just outside the map edge
    const sh = 20;
    const edge = (x0, y0, x1, y1, x, y, w, h) => {
      const gr = c.createLinearGradient(x0, y0, x1, y1);
      gr.addColorStop(0, 'rgba(0,0,0,0.55)');
      gr.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = gr;
      c.fillRect(x, y, w, h);
    };
    edge(0, my, 0, my - sh, mx - sh, my - sh, mw + 2 * sh, sh);
    edge(0, my + mh, 0, my + mh + sh, mx - sh, my + mh, mw + 2 * sh, sh);
    edge(mx, 0, mx - sh, 0, mx - sh, my, sh, mh);
    edge(mx + mw, 0, mx + mw + sh, 0, mx + mw, my, sh, mh);
  }

  function drawActor(c, a, t, isFoe) {
    const x = ax(a.fx * TS), y = ay(a.fy * TS);
    // contact shadow
    c.fillStyle = 'rgba(0,0,0,0.25)';
    c.beginPath();
    c.ellipse(x + 16, y + 28, 10, 4, 0, 0, Math.PI * 2);
    c.fill();
    let frame = a.frame;
    if (!a.mv && a.blinkT != null && a.blinkT < 0) frame = 3;
    const bob = isFoe && !RB.game.reducedMotion() ? Math.round(Math.sin(t / 300 + a.x) * 3) : 0;
    const art = RB.sprites.getArt && RB.sprites.getArt(a.look, a.dir, frame);
    if (art) c.drawImage(art, x, y - 16 + bob);
    else c.drawImage(RB.sprites.get(a.look, a.dir, frame), x, y - 16 + bob, 32, 48);
  }

  // Emote bubbles at art resolution: an inked paper bubble with a tail and a
  // small drawn mark. Cached per kind.
  const emoteCache = new Map();
  const EMOTE = {
    '!': [[9, 3, 3, 7, 'i'], [9, 12, 3, 3, 'i']],
    '?': [[7, 3, 6, 2, 'i'], [12, 4, 2, 3, 'i'], [10, 7, 3, 2, 'i'], [9, 8, 2, 2, 'i'], [9, 12, 3, 3, 'i']],
    '...': [[4, 9, 3, 3, 'i'], [9, 9, 3, 3, 'i'], [14, 9, 3, 3, 'i']],
    note: [[11, 3, 2, 9, 'i'], [13, 3, 4, 2, 'i'], [15, 5, 2, 2, 'i'], [7, 10, 5, 4, 'i'], [8, 9, 3, 1, 'i']],
    heart: [[5, 5, 4, 3, 'r'], [12, 5, 4, 3, 'r'], [4, 7, 13, 3, 'r'], [6, 10, 9, 2, 'r'], [8, 12, 5, 2, 'r'], [10, 14, 1, 1, 'r'], [6, 6, 2, 1, 'w']],
    sweat: [[10, 3, 2, 2, 'b'], [9, 5, 4, 3, 'b'], [8, 8, 6, 5, 'b'], [9, 13, 4, 1, 'b'], [9, 8, 1, 2, 'w']],
    anger: [[5, 4, 3, 3, 'r'], [13, 4, 3, 3, 'r'], [5, 11, 3, 3, 'r'], [13, 11, 3, 3, 'r'], [8, 6, 2, 1, 'r'], [11, 6, 2, 1, 'r'], [8, 12, 2, 1, 'r'], [11, 12, 2, 1, 'r']],
  };
  const EMOTE_COL = { i: '#2a2024', r: '#c8404e', b: '#4a8ad0', w: '#ffffff' };
  function emoteArt(kind) {
    let cv = emoteCache.get(kind);
    if (cv) return cv;
    cv = RB.sprites.makeCanvas(22, 24);
    const g = cv.getContext('2d');
    const R = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
    // outline, paper, a lit top edge and a shaded bottom edge, and the tail
    R(1, 0, 20, 19, '#2a2024'); R(0, 1, 22, 17, '#2a2024');
    R(2, 1, 18, 17, '#fffaf0'); R(1, 2, 20, 15, '#fffaf0');
    R(2, 16, 18, 1, '#e3d7bf'); R(2, 1, 18, 1, '#ffffff');
    R(8, 19, 6, 2, '#2a2024'); R(9, 18, 4, 2, '#fffaf0'); R(10, 21, 2, 2, '#2a2024'); R(10, 20, 2, 1, '#e3d7bf');
    for (const [x, y, w, h, k] of EMOTE[kind] || EMOTE['...']) R(x, y, w, h, EMOTE_COL[k]);
    emoteCache.set(kind, cv);
    return cv;
  }
  function drawEmote(c, a, kind) {
    c.drawImage(emoteArt(kind), ax(a.fx * TS) + 5, ay(a.fy * TS) - 44);
  }

  function interactMarker(c, W, t) {
    if (RB.game.mode() !== 'world' || W.player.mv) return;
    const [fx, fy] = RB.world.frontTile();
    let show = false;
    for (const n of W.npcs) if (n.x === fx && n.y === fy && n.def.talk) show = true;
    for (const f of W.foes) if (f.x === fx && f.y === fy) show = true;
    const s = RB.game.s;
    for (const p of W.map.props) {
      if (!(p.text || p.scene) || (p.if && !RB.state.test(s, p.if))) continue;
      const pd = RB.props.P[p.p];
      const pw = p.w || (pd && pd.w) || 1, ph = p.h || (pd && pd.h) || 1;
      if (fx >= p.x && fx < p.x + pw && fy >= p.y && fy < p.y + ph) show = true;
    }
    if (!show) return;
    // a small inked chevron over the thing you can act on
    const x = ax(fx * TS) + 12;
    const y = ay(fy * TS) - 28 + (RB.game.reducedMotion() ? 0 : Math.round(Math.sin(t / 200) * 3));
    c.fillStyle = '#2a2024';
    c.fillRect(x - 1, y - 1, 10, 3); c.fillRect(x + 1, y + 2, 6, 2); c.fillRect(x + 3, y + 4, 2, 2);
    c.fillStyle = '#fff4c8';
    c.fillRect(x, y, 8, 1); c.fillRect(x + 1, y + 1, 6, 1); c.fillRect(x + 2, y + 2, 4, 1); c.fillRect(x + 3, y + 3, 2, 1);
  }

  function drawWorld(t) {
    const W = RB.world.W;
    const m = W.map;
    if (!m) return;
    if (staticDirty || !m.staticLayer) buildStatic(m);
    updateCamera(W);
    const c = bctx;
    const pal = palOf(m);
    drawSurround(c, m, pal);
    c.drawImage(m.staticLayer, ax(0), ay(0));
    // animated water
    const x0 = Math.max(0, Math.floor(cam.x / TS)), y0 = Math.max(0, Math.floor(cam.y / TS));
    const x1 = Math.min(m.w, Math.ceil((cam.x + bw / ART) / TS) + 1), y1 = Math.min(m.h, Math.ceil((cam.y + bh / ART) / TS) + 1);
    const still = RB.game.reducedMotion();
    for (let y = y0; y < y1; y++)
      for (let x = x0; x < x1; x++) {
        const tile = m.tiles[y * m.w + x];
        if (!tile.anim) continue;
        const sx = ax(x * TS), sy = ay(y * TS);
        if (tile.anim2) { tile.anim2(c, sx, sy, pal, t, x, y, still); continue; }
        const ph = (t / 900 + RB.tiles.hh(x, y) % 7) % 4;
        c.fillStyle = pal.water[2];
        const o = still ? 0 : Math.floor(ph * 2);
        c.fillRect(sx + ((RB.tiles.hh(x, y, 3) + o) % 12) * ART, sy + (5 + (RB.tiles.hh(x, y, 4) % 6)) * ART, 3 * ART, ART);
        if (ph < 1) { c.fillStyle = pal.water[3] + '90'; c.fillRect(sx + (RB.tiles.hh(x, y, 5) % 13) * ART, sy + 11 * ART, 2 * ART, ART); }
      }
    // y-sorted drawables
    const s = RB.game.s;
    const list = [];
    const night = ambientOf(m).night;
    for (const st of m.structs) {
      if (st.if && !RB.state.test(s, st.if)) continue;
      const kind = st.type || 'house';
      const o = Object.assign({ night }, st);
      const d2 = RB.props.STRUCT2 && RB.props.STRUCT2[kind];
      list.push({
        z: (st.y + st.h) * TS,
        draw: d2 ? () => d2(c, ax(st.x * TS), ay(st.y * TS), pal, t, o)
          : () => legacy(c, () => RB.props.STRUCT[kind](c, st.x * TS - cam.x, st.y * TS - cam.y, pal, t, o)),
      });
    }
    for (const p of m.props) {
      if (p.if && !RB.state.test(s, p.if)) continue;
      const pd = RB.props.P[p.p];
      if (!pd) continue;
      const ph = p.h || pd.h;
      const lx = p.x * TS - cam.x, ly = p.y * TS - cam.y;
      if (lx < -64 || ly < -64 || lx > bw / ART + 64 || ly > bh / ART + 80) continue;
      const opts = Object.assign({ cx: p.x, cy: p.y, still }, p.o || {});
      list.push({
        z: (p.y + ph) * TS - (pd.block === false ? 12 : 0) - 0.5,
        draw: pd.draw2 ? () => pd.draw2(c, ax(p.x * TS), ay(p.y * TS), pal, t, opts) : () => legacy(c, () => pd.draw(c, lx, ly, pal, t, opts)),
      });
    }
    for (const n of W.npcs) list.push({ z: n.fy * TS + TS, draw: () => drawActor(c, n, t) });
    for (const f of W.foes) list.push({ z: f.fy * TS + TS, draw: () => drawActor(c, f, t, true) });
    if (W.comp) list.push({ z: W.comp.fy * TS + TS - 0.1, draw: () => drawActor(c, W.comp, t) });
    list.push({ z: W.player.fy * TS + TS, draw: () => drawActor(c, W.player, t) });
    list.sort((a, b) => a.z - b.z);
    for (const d of list) d.draw();
    interactMarker(c, W, t);
    drawLighting(c, m, W, t);
    drawWeather(c, m, t);
    for (const e of W.emotes) {
      const a = RB.world.actorById(e.who);
      if (a) drawEmote(c, a, e.kind);
    }
  }

  // Effective ambience: a map may define alt: [{if, ambient, night}] for story states.
  function ambientOf(m) {
    const s = RB.game.s;
    for (const a of m.def.alt || []) if (s && RB.state.test(s, a.if)) return a;
    return { ambient: m.def.ambient || {}, night: m.def.night };
  }
  function drawLighting(c, m, W, t) {
    const amb = ambientOf(m).ambient || {};
    const dark = amb.dark || 0;
    if (amb.tint) {
      c.fillStyle = amb.tint;
      c.fillRect(0, 0, bw, bh);
    }
    if (!dark) return;
    lctx.globalCompositeOperation = 'source-over';
    lctx.clearRect(0, 0, bw, bh);
    lctx.fillStyle = `rgba(${amb.darkCol || '8,10,24'},${dark})`;
    lctx.fillRect(0, 0, bw, bh);
    lctx.globalCompositeOperation = 'destination-out';
    const hole = (lx, ly, r) => {
      const x = ax(lx), y = ay(ly), R = r * ART;
      const g = lctx.createRadialGradient(x, y, 0, x, y, R);
      g.addColorStop(0, 'rgba(0,0,0,1)');
      g.addColorStop(0.6, 'rgba(0,0,0,0.7)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      lctx.fillStyle = g;
      lctx.beginPath();
      lctx.arc(x, y, R, 0, Math.PI * 2);
      lctx.fill();
    };
    const flick = RB.game.reducedMotion() ? 0 : Math.sin(t / 180) * 1.5;
    const pr = amb.playerLight == null ? 44 : amb.playerLight;
    if (pr) hole(W.player.fx * TS + 8, W.player.fy * TS + 4, pr + flick);
    if (W.comp && W.comp.id === 'ren') hole(W.comp.fx * TS + 8, W.comp.fy * TS + 6, 34 + flick);
    const s = RB.game.s;
    for (const p of m.props) {
      const pd = RB.props.P[p.p];
      if (!pd || !(pd.light || p.light)) continue;
      if (p.if && !RB.state.test(s, p.if)) continue;
      if (p.o && p.o.lit === false) continue;
      hole(p.x * TS + 8, p.y * TS + 2, (p.light || pd.light) + flick);
    }
    for (const st of m.structs) if (st.lit || ambientOf(m).night) (st.windows || []).forEach((wx) => hole((st.x + wx) * TS + 8, (st.y + st.h) * TS - 10, 18));
    lctx.globalCompositeOperation = 'source-over';
    c.drawImage(light, 0, 0);
  }

  // Weather at art resolution: finer drops, flakes and motes than the tiles.
  function drawWeather(c, m, t) {
    const amb = ambientOf(m).ambient || {};
    const kind = amb.weather;
    if (!kind) return;
    const reduced = RB.game.reducedMotion();
    const target = reduced ? 16 : kind === 'rain' ? 110 : 60;
    while (particles.length < target) particles.push({ x: Math.random() * bw, y: Math.random() * bh, v: 0.5 + Math.random(), p: Math.random() * 6 });
    for (const p of particles) {
      if (kind === 'rain') {
        p.y += (reduced ? 2 : 8) * p.v; p.x -= reduced ? 0.4 : 2;
        c.fillStyle = 'rgba(200,220,255,0.45)';
        c.fillRect(p.x, p.y, 1, 7);
      } else if (kind === 'snow') {
        p.y += 0.7 * p.v; p.x += Math.sin(t / 900 + p.p) * 0.5;
        c.fillStyle = 'rgba(255,255,255,0.85)';
        const sz = p.v > 1.1 ? 3 : 2;
        c.fillRect(p.x, p.y, sz, sz);
      } else if (kind === 'embers') {
        p.y -= 0.6 * p.v; p.x += Math.sin(t / 700 + p.p) * 0.6;
        c.fillStyle = `rgba(255,${150 + (p.p * 15 | 0)},80,0.75)`;
        c.fillRect(p.x, p.y, 2, 2);
      } else if (kind === 'motes' || kind === 'fireflies') {
        p.y += Math.sin(t / 1200 + p.p) * 0.24; p.x += Math.cos(t / 1500 + p.p) * 0.24;
        const a = (Math.sin(t / 500 + p.p * 3) + 1) / 2;
        c.fillStyle = kind === 'fireflies' ? `rgba(220,255,140,${a})` : `rgba(255,248,220,${a * 0.6})`;
        c.fillRect(p.x, p.y, 2, 2);
        if (kind === 'fireflies' && a > 0.7) { c.fillStyle = `rgba(220,255,140,${(a - 0.7) * 0.8})`; c.fillRect(p.x - 1, p.y - 1, 4, 4); }
      } else if (kind === 'leaves') {
        p.y += 0.8 * p.v; p.x += Math.sin(t / 600 + p.p) * 1;
        c.fillStyle = p.p > 3 ? '#e09a48' : '#cc7036';
        c.fillRect(p.x, p.y, 3, 2);
        c.fillStyle = 'rgba(0,0,0,0.15)'; c.fillRect(p.x + 1, p.y + 2, 2, 1);
      } else if (kind === 'pages') {
        p.y += 0.5 * p.v; p.x += Math.sin(t / 800 + p.p) * 0.8;
        c.fillStyle = 'rgba(240,236,220,0.75)';
        c.fillRect(p.x, p.y, 6, 4);
        c.fillStyle = 'rgba(90,80,70,0.35)'; c.fillRect(p.x + 1, p.y + 1, 4, 1);
      }
      if (p.y > bh + 8) { p.y = -8; p.x = Math.random() * bw; }
      if (p.y < -12) { p.y = bh + 4; p.x = Math.random() * bw; }
      if (p.x < -8) p.x = bw + 4;
      if (p.x > bw + 12) p.x = -4;
    }
  }

  function frame(t) {
    if (!ctx) return;
    if (override) {
      // overrides that draw at art resolution say so with fn.art = true;
      // older ones draw in logical pixels through the ×ART transform
      if (override.art) override(bctx, bw, bh, t);
      else legacy(bctx, () => override(bctx, Math.ceil(bw / ART), Math.ceil(bh / ART), t));
    } else if (RB.world.W.map) {
      drawWorld(t);
    } else {
      bctx.fillStyle = '#0e1116';
      bctx.fillRect(0, 0, bw, bh);
    }
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(buf, 0, 0, bw, bh, 0, 0, bw * artPx, bh * artPx);
  }
  function setOverride(fn) {
    override = fn;
  }
  // Draw one frame now, e.g. while a transition is still dark, so the new
  // map's static layer and prop caches are built before it fades in.
  function prewarm() {
    if (!override && RB.world.W.map) frame(typeof performance !== 'undefined' ? performance.now() : 0);
  }

  function onPointer(e) {
    if (!RB.world.W.map || override) return;
    const rect = canvas.getBoundingClientRect();
    const gx = ((e.clientX - rect.left) * dpr) / (artPx * ART) + cam.x;
    const gy = ((e.clientY - rect.top) * dpr) / (artPx * ART) + cam.y;
    RB.world.tapTile(Math.floor(gx / TS), Math.floor(gy / TS));
  }

  // Small thumbnail of the current view for save slots (data URL).
  function thumbnail() {
    try {
      const W = RB.world.W;
      if (!W.map) return null;
      const tw = 96, th = 64;
      const cv = document.createElement('canvas');
      cv.width = tw; cv.height = th;
      const c = cv.getContext('2d');
      c.imageSmoothingEnabled = true;
      const sw = 144 * ART, sh = 96 * ART;
      const sx = Math.max(0, Math.round(bw / 2 - sw / 2)), sy = Math.max(0, Math.round(bh / 2 - sh / 2));
      c.drawImage(buf, sx, sy, sw, sh, 0, 0, tw, th);
      return cv.toDataURL('image/png');
    } catch (err) {
      return null;
    }
  }
  // Screen position (css px) of a tile, for placing DOM bubbles.
  function tileToCss(x, y) {
    const k = (artPx * ART) / dpr;
    return { x: (x * TS - cam.x) * k, y: (y * TS - cam.y) * k };
  }

  return { init, frame, prewarm, invalidate, setOverride, setInsets, viewSize, thumbnail, tileToCss, resize, cam, ART, TS };
})();
