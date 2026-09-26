/* World renderer. Draws at game-pixel resolution into a buffer, then scales
 * by an integer number of device pixels so pixel art stays crisp. Text is
 * never drawn here — the DOM text layer handles Japanese (spec §16). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.render = (function () {
  'use strict';
  const TS = 16;
  let canvas = null, ctx = null;
  let buf = null, bctx = null;
  let light = null, lctx = null;
  let devScale = 2, cssW = 0, cssH = 0, dpr = 1;
  let bw = 0, bh = 0;
  const cam = { x: 0, y: 0 };
  let particles = [];
  let staticDirty = true;
  let override = null; // function(ctx, w, h, t) for full-screen modes (combat, cutscene)

  function init(cv) {
    canvas = cv;
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
    if (window.visualViewport) window.visualViewport.addEventListener('resize', resize);
    canvas.addEventListener('pointerdown', onPointer);
  }
  function resize() {
    cssW = window.innerWidth;
    cssH = window.innerHeight;
    dpr = window.devicePixelRatio || 1;
    const targetW = cssW < 700 ? 12 : cssW < 1100 ? 17 : 21;
    const targetH = cssH < 520 ? 8 : 12;
    const scale = Math.min(cssW / (TS * targetW), cssH / (TS * targetH));
    devScale = Math.max(1, Math.floor(scale * dpr));
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    bw = Math.ceil(canvas.width / devScale);
    bh = Math.ceil(canvas.height / devScale);
    buf = RB.sprites.makeCanvas(bw, bh);
    bctx = buf.getContext('2d');
    light = RB.sprites.makeCanvas(bw, bh);
    lctx = light.getContext('2d');
    RB.bus.emit('resize', { cssW, cssH, scale: devScale / dpr });
  }
  function viewSize() {
    return { w: bw, h: bh, scale: devScale / dpr };
  }
  function invalidate() {
    staticDirty = true;
    particles = [];
  }
  function palOf(m) {
    return RB.tiles.PAL[m.region] || RB.tiles.PAL.reedwake;
  }

  function buildStatic(m) {
    const cv = RB.sprites.makeCanvas(m.w * TS, m.h * TS);
    const c = cv.getContext('2d');
    const pal = palOf(m);
    for (let y = 0; y < m.h; y++)
      for (let x = 0; x < m.w; x++) {
        const t = m.tiles[y * m.w + x];
        const nb = (dx, dy) => RB.maps.tileAt(m, x + dx, y + dy);
        t.draw(c, x * TS, y * TS, pal, RB.tiles.hh(x, y), nb);
      }
    m.staticLayer = cv;
    staticDirty = false;
  }

  function updateCamera(W) {
    const p = W.player;
    const m = W.map;
    let cx = (p.fx + 0.5) * TS - bw / 2;
    let cy = (p.fy + 0.5) * TS - bh / 2 - 4;
    const mw = m.w * TS, mh = m.h * TS;
    cx = mw <= bw ? (mw - bw) / 2 : Math.max(0, Math.min(mw - bw, cx));
    cy = mh <= bh ? (mh - bh) / 2 : Math.max(0, Math.min(mh - bh, cy));
    cam.x = Math.round(cx);
    cam.y = Math.round(cy);
  }

  function drawActor(c, a, t, isFoe) {
    const x = Math.round(a.fx * TS - cam.x);
    const y = Math.round(a.fy * TS - cam.y);
    // shadow
    c.fillStyle = 'rgba(0,0,0,0.25)';
    c.beginPath();
    c.ellipse(x + 8, y + 14, 5, 2, 0, 0, Math.PI * 2);
    c.fill();
    let frame = a.frame;
    if (!a.mv && a.blinkT != null && a.blinkT < 0) frame = 3;
    const bob = isFoe && !RB.game.reducedMotion() ? Math.round(Math.sin(t / 300 + a.x) * 1.5) : 0;
    const img = RB.sprites.get(a.look, a.dir, frame);
    c.drawImage(img, x, y - 8 + bob);
  }

  function drawEmote(c, a, kind) {
    const x = Math.round(a.fx * TS - cam.x) + 8;
    const y = Math.round(a.fy * TS - cam.y) - 12;
    c.fillStyle = '#fffaf0';
    c.fillRect(x - 5, y - 8, 11, 9);
    c.fillRect(x - 1, y + 1, 3, 2);
    c.fillStyle = '#2a2024';
    const P = (px, py, w, h) => c.fillRect(x + px, y + py, w, h);
    if (kind === '!') { P(0, -7, 1, 5); P(0, -1, 1, 1); }
    else if (kind === '?') { P(-1, -7, 3, 1); P(2, -6, 1, 2); P(0, -4, 2, 1); P(0, -3, 1, 1); P(0, -1, 1, 1); }
    else if (kind === '...') { P(-3, -3, 1, 1); P(0, -3, 1, 1); P(3, -3, 1, 1); }
    else if (kind === 'note') { P(1, -7, 1, 6); P(2, -7, 2, 1); P(-1, -2, 2, 2); }
    else if (kind === 'heart') { c.fillStyle = '#d85a6a'; P(-3, -6, 2, 2); P(1, -6, 2, 2); P(-3, -5, 6, 2); P(-2, -3, 4, 1); P(-1, -2, 2, 1); }
    else if (kind === 'sweat') { c.fillStyle = '#6aa8e0'; P(0, -6, 1, 1); P(-1, -5, 3, 3); }
    else if (kind === 'anger') { c.fillStyle = '#d84a3a'; P(-3, -6, 2, 1); P(1, -6, 2, 1); P(-3, -3, 2, 1); P(1, -3, 2, 1); }
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
    const x = fx * TS - cam.x + 6;
    const y = fy * TS - cam.y - 14 + (RB.game.reducedMotion() ? 0 : Math.round(Math.sin(t / 200) * 1.5));
    c.fillStyle = '#fff4c8';
    c.fillRect(x, y, 5, 1); c.fillRect(x + 1, y + 1, 3, 1); c.fillRect(x + 2, y + 2, 1, 1);
  }

  function drawWorld(t) {
    const W = RB.world.W;
    const m = W.map;
    if (!m) return;
    if (staticDirty || !m.staticLayer) buildStatic(m);
    updateCamera(W);
    const c = bctx;
    const pal = palOf(m);
    c.fillStyle = pal.dark;
    c.fillRect(0, 0, bw, bh);
    c.drawImage(m.staticLayer, -cam.x, -cam.y);
    // animated water glints
    const x0 = Math.max(0, Math.floor(cam.x / TS)), y0 = Math.max(0, Math.floor(cam.y / TS));
    const x1 = Math.min(m.w, Math.ceil((cam.x + bw) / TS) + 1), y1 = Math.min(m.h, Math.ceil((cam.y + bh) / TS) + 1);
    const still = RB.game.reducedMotion();
    for (let y = y0; y < y1; y++)
      for (let x = x0; x < x1; x++) {
        const tile = m.tiles[y * m.w + x];
        if (!tile.anim) continue;
        const ph = (t / 900 + RB.tiles.hh(x, y) % 7) % 4;
        const sx = x * TS - cam.x, sy = y * TS - cam.y;
        c.fillStyle = pal.water[2];
        const o = still ? 0 : Math.floor(ph * 2);
        c.fillRect(sx + ((RB.tiles.hh(x, y, 3) + o) % 12), sy + 5 + (RB.tiles.hh(x, y, 4) % 6), 3, 1);
        if (ph < 1) { c.fillStyle = pal.water[3] + '90'; c.fillRect(sx + (RB.tiles.hh(x, y, 5) % 13), sy + 11, 2, 1); }
      }
    // y-sorted drawables
    const s = RB.game.s;
    const list = [];
    for (const st of m.structs) {
      if (st.if && !RB.state.test(s, st.if)) continue;
      list.push({ z: (st.y + st.h) * TS, draw: () => RB.props.STRUCT[st.type || 'house'](c, st.x * TS - cam.x, st.y * TS - cam.y, pal, t, Object.assign({ night: m.def.night }, st)) });
    }
    for (const p of m.props) {
      if (p.if && !RB.state.test(s, p.if)) continue;
      const pd = RB.props.P[p.p];
      if (!pd) continue;
      const ph = p.h || pd.h;
      const px = p.x * TS - cam.x, py = p.y * TS - cam.y;
      if (px < -64 || py < -64 || px > bw + 64 || py > bh + 80) continue;
      const opts = Object.assign({ cx: p.x, cy: p.y, still }, p.o || {});
      list.push({ z: (p.y + ph) * TS - (pd.block === false ? 12 : 0) - 0.5, draw: () => pd.draw(c, px, py, pal, t, opts) });
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

  function drawLighting(c, m, W, t) {
    const amb = m.def.ambient || {};
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
    const hole = (x, y, r) => {
      const g = lctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, 'rgba(0,0,0,1)');
      g.addColorStop(0.6, 'rgba(0,0,0,0.7)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      lctx.fillStyle = g;
      lctx.beginPath();
      lctx.arc(x, y, r, 0, Math.PI * 2);
      lctx.fill();
    };
    const flick = RB.game.reducedMotion() ? 0 : Math.sin(t / 180) * 1.5;
    const pr = amb.playerLight == null ? 44 : amb.playerLight;
    if (pr) hole(W.player.fx * TS - cam.x + 8, W.player.fy * TS - cam.y + 4, pr + flick);
    if (W.comp && W.comp.id === 'ren') hole(W.comp.fx * TS - cam.x + 8, W.comp.fy * TS - cam.y + 6, 34 + flick);
    const s = RB.game.s;
    for (const p of m.props) {
      const pd = RB.props.P[p.p];
      if (!pd || !(pd.light || p.light)) continue;
      if (p.if && !RB.state.test(s, p.if)) continue;
      if (p.o && p.o.lit === false) continue;
      hole(p.x * TS - cam.x + 8, p.y * TS - cam.y + 2, (p.light || pd.light) + flick);
    }
    for (const st of m.structs) if (st.lit || m.def.night) (st.windows || []).forEach((wx) => hole((st.x + wx) * TS - cam.x + 8, (st.y + st.h) * TS - cam.y - 10, 18));
    lctx.globalCompositeOperation = 'source-over';
    c.drawImage(light, 0, 0);
  }

  function drawWeather(c, m, t) {
    const amb = m.def.ambient || {};
    const kind = amb.weather;
    if (!kind) return;
    const reduced = RB.game.reducedMotion();
    const target = reduced ? 12 : kind === 'rain' ? 70 : 40;
    while (particles.length < target) particles.push({ x: Math.random() * bw, y: Math.random() * bh, v: 0.5 + Math.random(), p: Math.random() * 6 });
    const dt = 16;
    for (const p of particles) {
      if (kind === 'rain') {
        p.y += (reduced ? 1 : 4) * p.v; p.x -= reduced ? 0.2 : 1;
        c.fillStyle = 'rgba(200,220,255,0.45)';
        c.fillRect(p.x, p.y, 1, 4);
      } else if (kind === 'snow') {
        p.y += 0.35 * p.v; p.x += Math.sin(t / 900 + p.p) * 0.25;
        c.fillStyle = 'rgba(255,255,255,0.85)';
        c.fillRect(p.x, p.y, p.v > 1 ? 2 : 1, p.v > 1 ? 2 : 1);
      } else if (kind === 'embers') {
        p.y -= 0.3 * p.v; p.x += Math.sin(t / 700 + p.p) * 0.3;
        c.fillStyle = `rgba(255,${150 + (p.p * 15 | 0)},80,0.7)`;
        c.fillRect(p.x, p.y, 1, 1);
      } else if (kind === 'motes' || kind === 'fireflies') {
        p.y += Math.sin(t / 1200 + p.p) * 0.12; p.x += Math.cos(t / 1500 + p.p) * 0.12;
        const a = (Math.sin(t / 500 + p.p * 3) + 1) / 2;
        c.fillStyle = kind === 'fireflies' ? `rgba(220,255,140,${a})` : `rgba(255,248,220,${a * 0.6})`;
        c.fillRect(p.x, p.y, 1, 1);
      } else if (kind === 'leaves') {
        p.y += 0.4 * p.v; p.x += Math.sin(t / 600 + p.p) * 0.5;
        c.fillStyle = p.p > 3 ? '#e09a48' : '#cc7036';
        c.fillRect(p.x, p.y, 2, 1);
      } else if (kind === 'pages') {
        p.y += 0.25 * p.v; p.x += Math.sin(t / 800 + p.p) * 0.4;
        c.fillStyle = 'rgba(240,236,220,0.7)';
        c.fillRect(p.x, p.y, 3, 2);
      }
      if (p.y > bh + 4) { p.y = -4; p.x = Math.random() * bw; }
      if (p.y < -6) { p.y = bh + 2; p.x = Math.random() * bw; }
      if (p.x < -4) p.x = bw + 2;
      if (p.x > bw + 6) p.x = -2;
    }
    void dt;
  }

  function frame(t) {
    if (!ctx) return;
    if (override) {
      override(bctx, bw, bh, t);
    } else if (RB.world.W.map) {
      drawWorld(t);
    } else {
      bctx.fillStyle = '#0e1116';
      bctx.fillRect(0, 0, bw, bh);
    }
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(buf, 0, 0, bw, bh, 0, 0, bw * devScale, bh * devScale);
  }
  function setOverride(fn) {
    override = fn;
  }

  function onPointer(e) {
    if (!RB.world.W.map || override) return;
    const rect = canvas.getBoundingClientRect();
    const gx = ((e.clientX - rect.left) * dpr) / devScale + cam.x;
    const gy = ((e.clientY - rect.top) * dpr) / devScale + cam.y;
    RB.world.tapTile(Math.floor(gx / TS), Math.floor(gy / TS));
  }

  // Small procedural thumbnail of the current view for save slots (data URL).
  function thumbnail() {
    try {
      const W = RB.world.W;
      if (!W.map) return null;
      const tw = 96, th = 64;
      const cv = document.createElement('canvas');
      cv.width = tw; cv.height = th;
      const c = cv.getContext('2d');
      c.imageSmoothingEnabled = false;
      // take the centre of the current buffer
      const sx = Math.max(0, Math.round(bw / 2 - 72)), sy = Math.max(0, Math.round(bh / 2 - 48));
      c.drawImage(buf, sx, sy, 144, 96, 0, 0, tw, th);
      return cv.toDataURL('image/png');
    } catch (err) {
      return null;
    }
  }
  // Screen position (css px) of a tile, for placing DOM bubbles.
  function tileToCss(x, y) {
    return { x: ((x * TS - cam.x) * devScale) / dpr, y: ((y * TS - cam.y) * devScale) / dpr };
  }

  return { init, frame, invalidate, setOverride, viewSize, thumbnail, tileToCss, resize, cam };
})();
