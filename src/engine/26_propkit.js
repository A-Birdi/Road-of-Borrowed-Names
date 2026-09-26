/* Prop art kit. Helpers for props and structures authored at art resolution
 * (2 art px per logical px; a tile is 32×32 art px):
 *  - hue-shifted material ramps (shadows lean cool/purple, highlights warm),
 *    built per region palette from its anchor colours;
 *  - crisp, non-antialiased fills (scanline ellipses and polygons, Bresenham
 *    lines) so nothing is blurred;
 *  - clustered foliage masses, snow on exposed upper surfaces, grain streaks;
 *  - a selective outline (the object's own colour, darker on the shadow side)
 *    for decoration and an inked outline for things you can interact with;
 *  - soft, stepped contact shadows drawn under the finished sprite;
 *  - a capped cache of prerendered sprites keyed by (id, palette, variant,
 *    frame), so drawing a prop each frame is one drawImage.
 * Nothing here touches the DOM until a sprite is first drawn. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.propKit = (function () {
  'use strict';
  const hh = (x, y, k) => RB.tiles.hh(x, y, k);
  const c8 = (v) => (v < 0 ? 0 : v > 255 ? 255 : v | 0);

  // ---- colour ---------------------------------------------------------------------------
  const rgbMemo = new Map();
  function rgb(h) {
    let v = rgbMemo.get(h);
    if (v) return v;
    let s = h.charAt(0) === '#' ? h.slice(1) : h;
    if (s.length <= 4) s = s.split('').map((ch) => ch + ch).join('');
    const n = parseInt(s.slice(0, 6), 16);
    v = [(n >> 16) & 255, (n >> 8) & 255, n & 255, s.length >= 8 ? parseInt(s.slice(6, 8), 16) : 255];
    rgbMemo.set(h, v);
    return v;
  }
  function hex(r, g, b) {
    return '#' + ((1 << 24) | (c8(r) << 16) | (c8(g) << 8) | c8(b)).toString(16).slice(1);
  }
  const mixMemo = new Map();
  function mix(a, b, t) {
    const k = a + b + t;
    let v = mixMemo.get(k);
    if (v) return v;
    const A = rgb(a), B = rgb(b);
    v = hex(A[0] + (B[0] - A[0]) * t + 0.5, A[1] + (B[1] - A[1]) * t + 0.5, A[2] + (B[2] - A[2]) * t + 0.5);
    mixMemo.set(k, v);
    return v;
  }
  function rgba(h, a) {
    const c = rgb(h);
    return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')';
  }
  // Shadows lean toward a cool violet, highlights toward a warm cream.
  const COOL = '#1c1636', WARM = '#fff0c0';
  // Five-step ramp, dark → light, around one base colour.
  function ramp(base, dk, lt) {
    dk = dk == null ? 0.5 : dk;
    lt = lt == null ? 0.42 : lt;
    return [mix(base, COOL, dk), mix(base, COOL, dk * 0.48), base, mix(base, WARM, lt * 0.5), mix(base, WARM, lt)];
  }
  // Fixed material ramps shared by all regions (dark → light).
  const FIX = {
    iron: ['#18161f', '#2c2a36', '#46444f', '#676573', '#9593a0'],
    brass: ['#452c14', '#77531f', '#ab8434', '#d6b056', '#f6e19a'],
    paper: ['#857a66', '#b3a78a', '#d6ccae', '#ebe3ca', '#fbf7e9'],
    glow: ['#a4521f', '#e28a34', '#ffbf5c', '#ffe196', '#fff8dc'],
    straw: ['#6a5022', '#977634', '#c6a150', '#dfc16e', '#f4dfa0'],
    clay: ['#55291f', '#7e402b', '#a45c39', '#c7804c', '#e3a676'],
    lacquer: ['#3e1418', '#6c2226', '#9c3834', '#c05a44', '#e08c6c'],
    ceramic: ['#5c6c80', '#8e9cae', '#c4ccd4', '#e4e8ea', '#fbfbf7'],
    glass: ['#3c6a70', '#5e9496', '#8fc2bc', '#c4e6de', '#f0fff8'],
    ink: ['#0c0a14', '#1a1626', '#2a2438', '#3c3450', '#56506c'],
    char: ['#1c1616', '#2c2424', '#3e3432', '#564a44', '#6e625a'],
    ember: ['#6a1c10', '#b83a18', '#f07828', '#ffb448', '#fff0a8'],
  };

  // ---- palettes and regions --------------------------------------------------------------
  const palMemo = new WeakMap();
  let palN = 0;
  // Stable key and region traits for a palette object.
  function palInfo(pal) {
    let m = palMemo.get(pal);
    if (m) return m;
    let name = '';
    const all = RB.tiles.PAL;
    for (const k in all) if (all[k] === pal && k !== 'interior') { name = k; break; }
    m = {
      key: name || 'p' + ++palN,
      region: name,
      snow: name === 'snowbell' || name === 'sa_mount',
      autumn: name === 'cinder',
      green: name === 'reedwake' || name === 'saltglass' || name === 'lanternfall' || name === '',
      still: name === 'sa_still' || name === 'archive',
      paper: name === 'atlas',
    };
    palMemo.set(pal, m);
    return m;
  }
  // Material ramps (5 steps, dark → light) for a region palette.
  const matMemo = new WeakMap();
  function mat(pal) {
    let m = matMemo.get(pal);
    if (m) return m;
    const w = pal.wood, s = pal.stone, l = pal.leaf, tr = pal.trunk, rf = pal.roof, wl = pal.wall, rd = pal.reed;
    m = {
      wood: [mix(w[2], COOL, 0.4), w[2], w[0], w[1], w[3]],
      stone: [mix(s[2], COOL, 0.4), s[2], s[0], s[1], mix(s[1], WARM, 0.35)],
      leaf: [mix(l[3], COOL, 0.38), l[3], l[0], l[1], mix(l[2], '#f4f0a0', 0.18)],
      trunk: [mix(tr[1], COOL, 0.38), tr[1], tr[0], mix(tr[0], WARM, 0.2), mix(tr[0], WARM, 0.38)],
      roof: [mix(rf[2], COOL, 0.35), rf[2], rf[1], rf[0], rf[3]],
      wall: [mix(wl[2], COOL, 0.32), wl[2], wl[1], wl[0], mix(wl[0], WARM, 0.35)],
      reed: [mix(rd[2], COOL, 0.38), rd[2], rd[0], rd[1], mix(rd[1], WARM, 0.35)],
      snow: [mix(pal.snow[2], COOL, 0.3), pal.snow[2], pal.snow[1], pal.snow[0], '#ffffff'],
      grass: [mix(pal.grass[3], COOL, 0.35), pal.grass[3], pal.grass[0], pal.grass[1], pal.grass[2]],
      water: pal.water,
      flower: pal.flower,
    };
    for (const k in FIX) m[k] = FIX[k];
    matMemo.set(pal, m);
    return m;
  }

  // ---- crisp primitives --------------------------------------------------------------------
  function R(g, x, y, w, h, c) {
    g.fillStyle = c;
    g.fillRect(x, y, w, h);
  }
  // Filled ellipse by scanlines (no antialiasing).
  function ell(g, cx, cy, rx, ry, c) {
    g.fillStyle = c;
    const y0 = Math.floor(cy - ry), y1 = Math.ceil(cy + ry);
    for (let y = y0; y < y1; y++) {
      const t = (y + 0.5 - cy) / ry;
      if (t <= -1 || t >= 1) continue;
      const hw = rx * Math.sqrt(1 - t * t);
      const a = Math.round(cx - hw), b = Math.round(cx + hw);
      if (b > a) g.fillRect(a, y, b - a, 1);
    }
  }
  // Filled polygon by scanlines. pts = [x0, y0, x1, y1, ...].
  function poly(g, pts, c) {
    g.fillStyle = c;
    const n = pts.length >> 1;
    let y0 = Infinity, y1 = -Infinity;
    for (let i = 0; i < n; i++) { y0 = Math.min(y0, pts[2 * i + 1]); y1 = Math.max(y1, pts[2 * i + 1]); }
    const xs = [];
    for (let y = Math.floor(y0); y < Math.ceil(y1); y++) {
      const sy = y + 0.5;
      xs.length = 0;
      for (let i = 0; i < n; i++) {
        const ax = pts[2 * i], ay = pts[2 * i + 1], j = (i + 1) % n, bx = pts[2 * j], by = pts[2 * j + 1];
        if ((ay <= sy && by > sy) || (by <= sy && ay > sy)) xs.push(ax + ((sy - ay) * (bx - ax)) / (by - ay));
      }
      xs.sort((a, b) => a - b);
      for (let k = 0; k + 1 < xs.length; k += 2) {
        const a = Math.round(xs[k]), b = Math.round(xs[k + 1]);
        if (b > a) g.fillRect(a, y, b - a, 1);
      }
    }
  }
  // Keep only what lies inside a polygon within the rect (crisp: clears the
  // spans outside it row by row, so no antialiased clip edge).
  function keepPoly(g, pts, x0, y0, x1, y1) {
    const n = pts.length >> 1, xs = [];
    for (let y = y0; y < y1; y++) {
      const sy = y + 0.5;
      xs.length = 0;
      for (let i = 0; i < n; i++) {
        const ax = pts[2 * i], ay = pts[2 * i + 1], j = (i + 1) % n, bx = pts[2 * j], by = pts[2 * j + 1];
        if ((ay <= sy && by > sy) || (by <= sy && ay > sy)) xs.push(ax + ((sy - ay) * (bx - ax)) / (by - ay));
      }
      xs.sort((a, b) => a - b);
      let cur = x0;
      for (let k = 0; k + 1 < xs.length; k += 2) {
        const a = Math.max(x0, Math.round(xs[k])), b = Math.min(x1, Math.round(xs[k + 1]));
        if (a > cur) g.clearRect(cur, y, a - cur, 1);
        cur = Math.max(cur, b);
      }
      if (x1 > cur) g.clearRect(cur, y, x1 - cur, 1);
    }
  }
  // Bresenham line stamped with a w×w square.
  function line(g, x0, y0, x1, y1, c, w) {
    g.fillStyle = c;
    w = w || 1;
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    const o = (w - 1) >> 1;
    let err = dx + dy;
    for (let guard = 0; guard < 4096; guard++) {
      g.fillRect(x0 - o, y0 - o, w, w);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  }
  // Column colours for a lit cylinder (light from the upper left).
  function cylCol(i, w, r5) {
    const u = (i + 0.5) / w;
    return r5[u < 0.1 ? 3 : u < 0.3 ? 4 : u < 0.42 ? 3 : u < 0.68 ? 2 : u < 0.88 ? 1 : 0];
  }
  function cyl(g, x, y, w, h, r5) {
    for (let i = 0; i < w; i++) R(g, x + i, y, 1, h, cylCol(i, w, r5));
  }
  // Short 1-px streaks (wood grain, straw, bark): clustered marks, never lone pixels.
  function streaks(g, x, y, w, h, col, seed, n, len, vertical) {
    g.fillStyle = col;
    for (let i = 0; i < n; i++) {
      const r = hh(seed, i, 71);
      const L = Math.max(2, len - 1 + (r % 3));
      if (vertical) g.fillRect(x + (r >>> 3) % w, y + ((r >>> 9) % Math.max(1, h - L + 1)), 1, L);
      else g.fillRect(x + ((r >>> 3) % Math.max(1, w - L + 1)), y + ((r >>> 11) % h), L, 1);
    }
  }
  // Soft contact shadow: two stepped ellipses in a cool, dark tint.
  function shadow(g, cx, cy, rx, ry, a) {
    a = a == null ? 0.3 : a;
    ell(g, cx, cy, rx, ry, 'rgba(22,16,40,' + (a * 0.5).toFixed(3) + ')');
    ell(g, cx, cy, Math.max(1, rx - 2), Math.max(1, ry - 1), 'rgba(22,16,40,' + (a * 0.55).toFixed(3) + ')');
  }
  // Stepped glow (concentric rings of low alpha); never blurred.
  function halo(g, cx, cy, r, col, a) {
    for (let i = 3; i >= 1; i--) ell(g, cx, cy, (r * i) / 3, (r * i) / 3, rgba(col, (a * (4 - i)) / 6));
  }

  // ---- pixel passes ---------------------------------------------------------------------------
  function region(g, x, y, w, h) {
    const tf = g.getTransform();
    const X0 = Math.max(0, Math.floor(x + tf.e)), Y0 = Math.max(0, Math.floor(y + tf.f));
    const X1 = Math.min(g.canvas.width, Math.ceil(x + w + tf.e)), Y1 = Math.min(g.canvas.height, Math.ceil(y + h + tf.f));
    return { X0, Y0, W: X1 - X0, H: Y1 - Y0, ox: Math.round(tf.e), oy: Math.round(tf.f) };
  }
  // Clustered foliage: overlapping leaf clumps listed back to front
  // ({x, y, r, k?}). Each clump is lit from the upper left and has a scalloped
  // edge; leaves form 4×3 clusters; a dark crease runs where a clump passes
  // behind a nearer one; leaves low in the mass are darker.
  function foliage(g, clumps, r5, seed, opt) {
    opt = opt || {};
    const lobe = opt.lobe == null ? 0.13 : opt.lobe;
    let bx0 = 1e9, by0 = 1e9, bx1 = -1e9, by1 = -1e9;
    const L = clumps.map((c, i) => {
      bx0 = Math.min(bx0, c.x - c.r * (1 + lobe) - 1); bx1 = Math.max(bx1, c.x + c.r * (1 + lobe) + 1);
      by0 = Math.min(by0, c.y - c.r * (1 + lobe) - 1); by1 = Math.max(by1, c.y + c.r * (1 + lobe) + 1);
      return { x: c.x, y: c.y, r: c.r, k: c.k || 0, n: 4 + (hh(seed, i, 11) % 4), ph: (hh(seed, i, 12) % 628) / 100, a: c.lobe == null ? lobe : c.lobe };
    });
    const top = by0 + 2, bot = by1 - 2;
    const Rg = region(g, bx0, by0, bx1 - bx0, by1 - by0);
    if (Rg.W <= 0 || Rg.H <= 0) return;
    const img = g.getImageData(Rg.X0, Rg.Y0, Rg.W, Rg.H), d = img.data;
    const C = r5.map(rgb);
    const lx = -0.52, ly = -0.6, lz = 0.6;
    const ao = opt.ao == null ? 0.5 : opt.ao, tex = opt.tex == null ? 0.36 : opt.tex, cw = opt.cw || 4, ch = opt.ch || 3;
    const rad = (c, dx, dy) => c.r * (1 + c.a * Math.cos(c.n * Math.atan2(dy, dx) + c.ph));
    for (let py = 0; py < Rg.H; py++) {
      const fy = Rg.Y0 + py - Rg.oy + 0.5;
      for (let px = 0; px < Rg.W; px++) {
        const fx = Rg.X0 + px - Rg.ox + 0.5;
        let own = -1, nx = 0, ny = 0;
        for (let i = L.length - 1; i >= 0; i--) {
          const c = L[i], dx = fx - c.x, dy = fy - c.y, dd = Math.sqrt(dx * dx + dy * dy);
          if (dd > c.r * (1 + c.a) + 0.5) continue;
          const rr = rad(c, dx, dy);
          if (dd <= rr) { own = i; nx = dx / rr; ny = dy / rr; break; }
        }
        if (own < 0) continue;
        const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
        let I = nx * lx + ny * ly + nz * lz + L[own].k;
        I -= (ao * (fy - top)) / Math.max(1, bot - top);
        const cyc = Math.floor((fy + 256) / ch), cxc = Math.floor((fx + 256 + (cyc & 1) * (cw >> 1)) / cw);
        I += (((hh(cxc, cyc, seed) & 255) / 255) - 0.5) * tex;
        let k = I > 0.7 ? 4 : I > 0.4 ? 3 : I > 0.1 ? 2 : I > -0.22 ? 1 : 0;
        for (let j = own + 1; j < L.length; j++) {
          const c = L[j], dx = fx - c.x, dy = fy - c.y;
          if (Math.sqrt(dx * dx + dy * dy) <= rad(c, dx, dy) + 1.6) { k = Math.min(k, dy < 0 ? 1 : 0); break; }
        }
        const o4 = (py * Rg.W + px) * 4, col = C[k];
        d[o4] = col[0]; d[o4 + 1] = col[1]; d[o4 + 2] = col[2]; d[o4 + 3] = 255;
      }
    }
    g.putImageData(img, Rg.X0, Rg.Y0);
  }
  // Snow lying on the exposed upper surfaces inside the rect (what is already
  // drawn there) that are flat enough to hold it — steep sides stay bare:
  // lumpy, 2–4 px deep, bright on top, blue below. The same pass lays moss.
  function snowTops(g, x, y, w, h, s5, seed, depth, filter) {
    const Rg = region(g, x, y, w, h);
    if (Rg.W <= 0 || Rg.H <= 0) return;
    const img = g.getImageData(Rg.X0, Rg.Y0, Rg.W, Rg.H), d = img.data, src = new Uint8ClampedArray(d);
    const C = s5.map(rgb);
    depth = depth || 3;
    const op = (px, py) => px >= 0 && py >= 0 && px < Rg.W && py < Rg.H && src[(py * Rg.W + px) * 4 + 3] >= 160;
    for (let px = 0; px < Rg.W; px++) {
      const gx = Rg.X0 + px;
      const lump = depth + Math.round(Math.sin(gx * 0.9 + seed) * 0.8 + Math.sin(gx * 0.37 + seed * 3) * 0.9);
      for (let py = 0; py < Rg.H; py++) {
        if (!op(px, py) || op(px, py - 1)) continue;
        // flat enough: solid on both sides one row down, and on one side here
        if (!op(px - 1, py + 1) || !op(px + 1, py + 1) || (!op(px - 1, py) && !op(px + 1, py))) continue;
        if (filter && !filter(src, (py * Rg.W + px) * 4)) continue;
        const th = Math.max(1, lump - (op(px - 1, py) && op(px + 1, py) ? 0 : 1));
        for (let k = 0; k < th && py + k < Rg.H; k++) {
          if (!op(px, py + k)) break;
          const rightEdge = !op(px + 1 < Rg.W ? px + 1 : px, py + k) || px + 1 >= Rg.W;
          const col = k === 0 ? C[4] : k === th - 1 ? C[1] : rightEdge ? C[2] : C[3];
          const o4 = ((py + k) * Rg.W + px) * 4;
          d[o4] = col[0]; d[o4 + 1] = col[1]; d[o4 + 2] = col[2]; d[o4 + 3] = 255;
        }
      }
    }
    g.putImageData(img, Rg.X0, Rg.Y0);
  }
  // Outline pass over a whole canvas. 'sel': the neighbour's own colour, darker
  // and cooler (a little lighter on the lit top/left side). 'ink': a strong ink
  // line for interactable things.
  const INK_D = rgb('#1e1620'), INK_L = rgb('#3a2c34'), OUT = rgb('#140f24');
  function outline(g, W, H, mode) {
    const img = g.getImageData(0, 0, W, H), d = img.data, src = new Uint8ClampedArray(d);
    const op = (x, y) => x >= 0 && y >= 0 && x < W && y < H && src[(y * W + x) * 4 + 3] >= 160;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      if (src[i + 3] >= 100) continue;
      let s = -1, lit = false;
      if (op(x + 1, y)) { s = i + 4; lit = true; }
      else if (op(x, y + 1)) { s = i + W * 4; lit = true; }
      else if (op(x - 1, y)) s = i - 4;
      else if (op(x, y - 1)) s = i - W * 4;
      if (s < 0) continue;
      if (mode === 'ink') {
        const c = lit ? INK_L : INK_D;
        d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2];
      } else {
        const k = lit ? 0.5 : 0.68;
        d[i] = src[s] + (OUT[0] - src[s]) * k; d[i + 1] = src[s + 1] + (OUT[1] - src[s + 1]) * k; d[i + 2] = src[s + 2] + (OUT[2] - src[s + 2]) * k;
      }
      d[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
  }

  // ---- canvases and the sprite cache ------------------------------------------------------------
  function mk(w, h) {
    if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(w, h);
    const cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    return cv;
  }
  // Sprites are composed on a scratch canvas made for pixel reads, then
  // copied into a plain canvas that is cheap to draw every frame.
  const scratch = [];
  let depth = 0;
  function make(W, H, draw) {
    let s = scratch[depth];
    if (!s || s.cv.width < W || s.cv.height < H) {
      const cv = mk(Math.max(W, s ? s.cv.width : 0), Math.max(H, s ? s.cv.height : 0));
      s = scratch[depth] = { cv, g: cv.getContext('2d', { willReadFrequently: true }) };
    }
    const g = s.g;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalCompositeOperation = 'source-over';
    g.globalAlpha = 1;
    g.clearRect(0, 0, s.cv.width, s.cv.height);
    depth++;
    try { draw(g, W, H); } finally { depth--; }
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalCompositeOperation = 'source-over';
    const cv = mk(W, H);
    const o = cv.getContext('2d');
    o.drawImage(s.cv, 0, 0, W, H, 0, 0, W, H);
    return cv;
  }
  const CAP = 1400;
  const cache = new Map();
  function cached(key, build) {
    let v = cache.get(key);
    if (v) return v;
    v = build();
    cache.set(key, v);
    if (cache.size > CAP) cache.delete(cache.keys().next().value);
    return v;
  }
  function clear() { cache.clear(); }
  // Animation frame index: steady (0) with reduced motion.
  function frame(t, ms, n, still, phase) {
    if (still) return 0;
    return ((Math.floor(t / ms + (phase || 0)) % n) + n) % n;
  }
  const reduced = () => !!(RB.game && RB.game.reducedMotion && RB.game.reducedMotion());

  return {
    rgb, hex, mix, rgba, ramp, COOL, WARM, FIX, palInfo, mat,
    R, ell, poly, keepPoly, line, cyl, cylCol, streaks, shadow, halo,
    foliage, snowTops, outline, mk, make, cached, clear, frame, reduced, hh,
    cacheSize: () => cache.size,
  };
})();
