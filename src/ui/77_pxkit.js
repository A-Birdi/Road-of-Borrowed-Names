/* Pixel kit: a small software rasteriser for art authored as code at art
 * resolution (battle creatures, battle scenery, the title scene).
 *
 * Shapes are filled pixel by pixel (no canvas antialiasing) into layers that
 * hold one packed RGBA colour and a material id per pixel. A material is a
 * hue-shifted ramp (shadows lean cool/violet, highlights lean warm); a shape
 * picks a ramp step per pixel from a shading function evaluated in the shape's
 * own coordinates, so light stays upper-left even when a part is rotated.
 * Quantising a smooth light term into 4–5 steps gives clustered shading
 * rather than noise. Layers are outlined selectively (a darker ramp tone on
 * lit edges, a near-black tone on shadowed ones) and composited, front over
 * back, so overlapping parts stay separated. Everything built here is meant
 * to be cached by its caller; nothing is regenerated per frame. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.pxkit = (function () {
  'use strict';
  // ---- colour --------------------------------------------------------------------------
  const L3 = (() => { const v = [-0.56, -0.66, 0.74]; const n = Math.hypot(v[0], v[1], v[2]); return v.map((a) => a / n); })();
  function parse(c) {
    if (Array.isArray(c)) return [c[0], c[1], c[2], c[3] == null ? 255 : c[3]];
    let s = String(c).replace('#', '');
    if (s.length === 3 || s.length === 4) s = s.split('').map((ch) => ch + ch).join('');
    const n = parseInt(s.slice(0, 6), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255, s.length >= 8 ? parseInt(s.slice(6, 8), 16) : 255];
  }
  const pack = (c) => (((c[3] & 255) << 24) | ((c[2] & 255) << 16) | ((c[1] & 255) << 8) | (c[0] & 255)) >>> 0;
  const css = (c) => { c = parse(c); return c[3] >= 255 ? 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')' : 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (c[3] / 255).toFixed(3) + ')'; };
  const hex = (c) => '#' + c.slice(0, 3).map((v) => (v | 0).toString(16).padStart(2, '0')).join('');
  function rgb2hsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
    if (mx === mn) return [0, 0, l];
    const d = mx - mn, s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    let h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return [h * 60, s, l];
  }
  function hsl2rgb(h, s, l) {
    h = ((h % 360) + 360) % 360 / 360;
    if (!s) return [l * 255, l * 255, l * 255].map(Math.round);
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
    const f = (t) => { t = (t + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 0.5 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; };
    return [f(h + 1 / 3), f(h), f(h - 1 / 3)].map((v) => Math.round(v * 255));
  }
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  // move hue h toward target by at most `deg` degrees (shortest way round)
  function toward(h, target, deg) {
    const d = ((target - h + 540) % 360) - 180;
    return h + clamp(d, -deg, deg);
  }
  // n colours, dark → light. The base colour sits at index `at`; each shadow
  // step turns a few degrees toward violet-blue, each highlight step toward
  // warm yellow (greys pick up a faint cool/warm tint instead).
  function ramp(base, n, o) {
    n = n || 5; o = o || {};
    const c = parse(base);
    const [h, s, l] = rgb2hsl(c[0], c[1], c[2]);
    const at = o.at != null ? o.at : Math.round((n - 1) * 0.6);
    const step = o.step || 0.12, sh = o.shift == null ? 1 : o.shift;
    const cool = o.cool == null ? 245 : o.cool, warm = o.warm == null ? 50 : o.warm;
    const grey = s < 0.08;
    const out = [];
    for (let i = 0; i < n; i++) {
      const k = i - at;
      let H = h, S = s, Lc = l;
      if (k < 0) {
        Lc = l + k * step * (o.dk || 1);
        if (grey) { H = cool; S = s + 0.035 * -k * sh; } else { H = toward(h, cool, Math.min(30, -k * 8 * sh)); S = Math.min(0.8, s * (1 - 0.04 * -k)); }
      } else if (k > 0) {
        Lc = l + k * step * (o.lt || 1);
        if (grey) { H = warm; S = s + 0.025 * k * sh; } else { H = toward(h, warm, Math.min(20, k * 6 * sh)); S = s * (1 - 0.07 * k); }
      }
      const rgb = hsl2rgb(H, clamp(S, 0, 1), clamp(Lc, 0.03, 0.97));
      out.push([rgb[0], rgb[1], rgb[2], o.alpha != null ? o.alpha : c[3]]);
    }
    return out;
  }
  function mix(a, b, k) { a = parse(a); b = parse(b); return a.map((v, i) => Math.round(v + (b[i] - v) * k)); }
  // a single colour moved along its own ramp (k < 0 darker/cooler, k > 0 lighter/warmer)
  function tone(base, k, o) { const r = ramp(base, 9, Object.assign({ at: 4 }, o)); return hex(r[clamp(Math.round(4 + k), 0, 8)]); }

  // ---- materials -----------------------------------------------------------------------
  // A material is a ramp plus its outline tones. Ids are global and small.
  const MATS = [null], matKeys = new Map();
  function mat(base, o) {
    o = o || {};
    const key = JSON.stringify([base, o]);
    if (matKeys.has(key)) return MATS[matKeys.get(key)];
    const cols = o.cols ? o.cols.map(parse) : ramp(base, o.n || 5, o);
    const dark = parse(o.lineCol || '#140e1c');
    const line = o.line === false ? 0 : pack(o.line ? parse(o.line) : mix(cols[0], dark, 0.62).map((v, i) => (i === 3 ? Math.max(cols[0][3], 200) : v)));
    const lineLit = o.line === false ? 0 : pack(o.lineLit ? parse(o.lineLit) : mix(cols[0], dark, 0.28).map((v, i) => (i === 3 ? Math.max(cols[0][3], 200) : v)));
    const M = { id: MATS.length, n: cols.length, rgba: cols, c: cols.map(pack), line, lineLit, base: o.at != null ? o.at : Math.round((cols.length - 1) * 0.6) };
    if (MATS.length > 60000) { MATS.length = 1; matKeys.clear(); }
    MATS.push(M);
    matKeys.set(key, M.id);
    return M;
  }
  // one flat colour (eyes, marks, glows)
  const solid = (c, o) => mat(null, Object.assign({ cols: [c], at: 0 }, o));

  // ---- shading functions (local coordinates → 0..1) ------------------------------------
  function sphere(cx, cy, rx, ry, o) {
    o = o || {};
    const amb = o.amb == null ? 0.16 : o.amb, rim = o.rim || 0, k = o.k || 1;
    return (x, y) => {
      const nx = (x - cx) / rx, ny = (y - cy) / (ry || rx), d = nx * nx + ny * ny;
      const nz = Math.sqrt(Math.max(0, 1 - d));
      let v = Math.max(0, nx * L3[0] + ny * L3[1] + nz * L3[2]) * k;
      v = amb + (1 - amb) * v;
      if (rim && d > 0.72 && nx + ny > 0.5) v += rim; // bounce light on the shadowed rim
      return clamp(v, 0, 0.999);
    };
  }
  // upright cylinder (lantern, bell, pipe) — light from the left
  function cyl(cx, rx, o) {
    o = o || {};
    const amb = o.amb == null ? 0.18 : o.amb, rim = o.rim || 0, top = o.top || 0;
    return (x, y) => {
      const nx = clamp((x - cx) / rx, -1, 1), nz = Math.sqrt(1 - nx * nx);
      let v = amb + (1 - amb) * Math.max(0, nx * L3[0] * 1.3 + nz * 0.78);
      if (top) v += top * (o.y0 != null ? clamp(1 - (y - o.y0) / (o.h || 40), 0, 1) : 0);
      if (rim && nx > 0.82) v += rim;
      return clamp(v, 0, 0.999);
    };
  }
  // straight ramp between two points (bands across the shape)
  function lin(x0, y0, x1, y1, v0, v1) {
    const dx = x1 - x0, dy = y1 - y0, L2 = dx * dx + dy * dy || 1;
    return (x, y) => clamp(v0 + (v1 - v0) * clamp(((x - x0) * dx + (y - y0) * dy) / L2, 0, 1), 0, 0.999);
  }
  const lvl = (v) => () => v; // constant (0..1)

  // ---- layers --------------------------------------------------------------------------
  function Layer(w, h, ox, oy) {
    this.w = w; this.h = h; this.ox = ox || 0; this.oy = oy || 0;
    this.px = new Uint32Array(w * h);
    this.mt = new Uint16Array(w * h);
    this.T = [1, 0, 0, 1, 0, 0];
    this.stack = [];
  }
  const LP = Layer.prototype;
  LP.save = function () { this.stack.push(this.T.slice()); return this; };
  LP.restore = function () { this.T = this.stack.pop() || [1, 0, 0, 1, 0, 0]; return this; };
  LP.mul = function (a, b, c, d, e, f) {
    const T = this.T;
    this.T = [T[0] * a + T[2] * b, T[1] * a + T[3] * b, T[0] * c + T[2] * d, T[1] * c + T[3] * d, T[0] * e + T[2] * f + T[4], T[1] * e + T[3] * f + T[5]];
    return this;
  };
  LP.translate = function (x, y) { return this.mul(1, 0, 0, 1, x, y); };
  LP.rotate = function (a) { const c = Math.cos(a), s = Math.sin(a); return this.mul(c, s, -s, c, 0, 0); };
  LP.scale = function (sx, sy) { return this.mul(sx, 0, 0, sy == null ? sx : sy, 0, 0); };
  LP.fwd = function (x, y) { const T = this.T; return [T[0] * x + T[2] * y + T[4] + this.ox, T[1] * x + T[3] * y + T[5] + this.oy]; };
  // Visit every buffer pixel whose centre maps inside a local-space test.
  LP.scan = function (bx0, by0, bx1, by1, inside, cb) {
    const T = this.T, det = T[0] * T[3] - T[1] * T[2];
    if (!det) return this;
    const ia = T[3] / det, ib = -T[1] / det, ic = -T[2] / det, id = T[0] / det;
    let X0 = 1e9, Y0 = 1e9, X1 = -1e9, Y1 = -1e9;
    for (const [x, y] of [[bx0, by0], [bx1, by0], [bx0, by1], [bx1, by1]]) {
      const p = this.fwd(x, y);
      X0 = Math.min(X0, p[0]); Y0 = Math.min(Y0, p[1]); X1 = Math.max(X1, p[0]); Y1 = Math.max(Y1, p[1]);
    }
    X0 = Math.max(0, Math.floor(X0) - 1); Y0 = Math.max(0, Math.floor(Y0) - 1);
    X1 = Math.min(this.w - 1, Math.ceil(X1) + 1); Y1 = Math.min(this.h - 1, Math.ceil(Y1) + 1);
    for (let Y = Y0; Y <= Y1; Y++) {
      for (let X = X0; X <= X1; X++) {
        const u = X + 0.5 - this.ox - T[4], v = Y + 0.5 - this.oy - T[5];
        const lx = ia * u + ic * v, ly = ib * u + id * v;
        if (inside(lx, ly)) cb(Y * this.w + X, lx, ly);
      }
    }
    return this;
  };
  // Fill every pixel whose centre is inside (local test); sh picks the ramp
  // step: undefined → the material's base step; an integer → that step; a
  // function → 0..1 (a negative value skips the pixel).
  LP.fill = function (bx0, by0, bx1, by1, inside, M, sh) {
    const fn = typeof sh === 'function' ? sh : null;
    const fixed = fn ? 0 : clamp(sh == null ? M.base : sh | 0, 0, M.n - 1);
    return this.scan(bx0, by0, bx1, by1, inside, (i, lx, ly) => {
      let k = fixed;
      if (fn) { const s = fn(lx, ly); if (s < 0) return; k = clamp(Math.floor(s * M.n), 0, M.n - 1); }
      const col = M.c[k];
      if (!(col >>> 24)) return;
      this.px[i] = col; this.mt[i] = M.id;
    });
  };
  LP.ell = function (cx, cy, rx, ry, M, sh) {
    ry = ry == null ? rx : ry;
    return this.fill(cx - rx, cy - ry, cx + rx, cy + ry, (x, y) => { const a = (x - cx) / rx, b = (y - cy) / ry; return a * a + b * b <= 1; }, M, sh);
  };
  LP.rect = function (x, y, w, h, M, sh) {
    return this.fill(x, y, x + w, y + h, (a, b) => a >= x && a < x + w && b >= y && b < y + h, M, sh);
  };
  function inPoly(pts) {
    return (x, y) => {
      let c = false;
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        const [xi, yi] = pts[i], [xj, yj] = pts[j];
        if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
      }
      return c;
    };
  }
  LP.poly = function (pts, M, sh) {
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const [x, y] of pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
    return this.fill(x0, y0, x1, y1, inPoly(pts), M, sh);
  };
  // A dressed stone (or any chamfered solid): a convex polygon whose rim is
  // shaded by the facing of the nearest edge — edges facing the light
  // (up/left) catch it, the others fall into shadow — around a flat face.
  // o: { face: step, bevel: px, seam: true (1-px dark rim on shadowed edges) }
  LP.stone = function (pts, M, o) {
    o = o || {};
    const face = o.face == null ? 2 : o.face, bev = o.bevel == null ? 3 : o.bevel, n = M.n;
    const E = [];
    let cx = 0, cy = 0;
    for (const p of pts) { cx += p[0] / pts.length; cy += p[1] / pts.length; }
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length];
      let nx = b[1] - a[1], ny = a[0] - b[0];
      const len = Math.hypot(nx, ny) || 1;
      nx /= len; ny /= len;
      if ((a[0] - cx) * nx + (a[1] - cy) * ny < 0) { nx = -nx; ny = -ny; }
      // facing in buffer space, so mirrored or rotated stones stay lit from the upper left
      const T = this.T;
      let wx = T[0] * nx + T[2] * ny, wy = T[1] * nx + T[3] * ny;
      const wl = Math.hypot(wx, wy) || 1;
      wx /= wl; wy /= wl;
      E.push({ a, b, nx, ny, lit: -(wx * 0.62 + wy * 0.78) });
    }
    return this.poly(pts, M, (x, y) => {
      let best = 1e9, e = null;
      for (const ed of E) {
        const dx = ed.b[0] - ed.a[0], dy = ed.b[1] - ed.a[1], L2 = dx * dx + dy * dy || 1;
        const t = clamp(((x - ed.a[0]) * dx + (y - ed.a[1]) * dy) / L2, 0, 1);
        const d = Math.hypot(ed.a[0] + dx * t - x, ed.a[1] + dy * t - y);
        if (d < best) { best = d; e = ed; }
      }
      let k = face;
      if (best < bev && e) k = face + (e.lit > 0.35 ? 2 : e.lit > -0.2 ? 1 : e.lit > -0.7 ? -1 : -2);
      if (o.seam !== false && best < 1.1 && e && e.lit < -0.2) k = 0;
      return (clamp(k, 0, n - 1) + 0.5) / n;
    });
  };
  // thick line (capsule) between local points
  LP.seg = function (xa, ya, xb, yb, wdt, M, sh) {
    const r = wdt / 2, dx = xb - xa, dy = yb - ya, L2 = dx * dx + dy * dy || 1e-6;
    return this.fill(Math.min(xa, xb) - r, Math.min(ya, yb) - r, Math.max(xa, xb) + r, Math.max(ya, yb) + r, (x, y) => {
      const t = clamp(((x - xa) * dx + (y - ya) * dy) / L2, 0, 1), ex = xa + dx * t - x, ey = ya + dy * t - y;
      return ex * ex + ey * ey <= r * r;
    }, M, sh);
  };
  // a path of thick segments with a width that can taper: pts [[x,y,w?],...]
  LP.path = function (pts, wdt, M, sh) {
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i];
      this.seg(a[0], a[1], b[0], b[1], b[2] != null ? b[2] : wdt, M, sh);
    }
    return this;
  };
  // 1-px line in buffer space (crisp, for creases, veins and ink marks)
  LP.line = function (xa, ya, xb, yb, M, k) {
    const p = this.fwd(xa, ya), q = this.fwd(xb, yb);
    let x0 = Math.round(p[0] - 0.5), y0 = Math.round(p[1] - 0.5);
    const x1 = Math.round(q[0] - 0.5), y1 = Math.round(q[1] - 0.5);
    const dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1, dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    const col = M.c[clamp(k == null ? M.base : k, 0, M.n - 1)];
    for (let n = 0; n < 2000; n++) {
      if (x0 >= 0 && y0 >= 0 && x0 < this.w && y0 < this.h) { const i = y0 * this.w + x0; this.px[i] = col; this.mt[i] = M.id; }
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
    return this;
  };
  // a single pixel (local coordinates)
  LP.dot = function (x, y, M, k) {
    const p = this.fwd(x, y), X = Math.floor(p[0]), Y = Math.floor(p[1]);
    if (X < 0 || Y < 0 || X >= this.w || Y >= this.h) return this;
    const i = Y * this.w + X;
    this.px[i] = M.c[clamp(k == null ? M.base : k, 0, M.n - 1)]; this.mt[i] = M.id;
    return this;
  };
  // Restrict later writes: only where the layer already has pixels (paint "on" a shape).
  LP.onto = function (fn) {
    const keep = this.px.slice();
    fn(this);
    for (let i = 0; i < keep.length; i++) if (!keep[i]) { this.px[i] = 0; this.mt[i] = 0; }
    return this;
  };
  // Re-shade existing pixels of one material (or any, when M is null) inside a local test.
  LP.recolor = function (inside, from, to, k) {
    return this.scan(-1e4, -1e4, 1e4, 1e4, inside, (i, lx, ly) => {
      if (!this.px[i] || (from && this.mt[i] !== from.id)) return;
      let kk = k;
      if (typeof k === 'function') { const s = k(lx, ly); if (s < 0) return; kk = Math.floor(s * to.n); }
      this.px[i] = to.c[clamp(kk == null ? to.base : kk, 0, to.n - 1)]; this.mt[i] = to.id;
    });
  };
  LP.erase = function (bx0, by0, bx1, by1, inside) {
    return this.scan(bx0, by0, bx1, by1, inside, (i) => { this.px[i] = 0; this.mt[i] = 0; });
  };
  LP.eraseEll = function (cx, cy, rx, ry) {
    ry = ry == null ? rx : ry;
    return this.erase(cx - rx, cy - ry, cx + rx, cy + ry, (x, y) => { const a = (x - cx) / rx, b = (y - cy) / ry; return a * a + b * b <= 1; });
  };
  LP.erasePoly = function (pts) {
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const [x, y] of pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
    return this.erase(x0, y0, x1, y1, inPoly(pts));
  };
  // Selective outline: every empty pixel touching the shape (4-neighbours)
  // takes the neighbour material's outline tone — the lighter one where the
  // edge faces the light (top/left), the dark one elsewhere.
  LP.outline = function (o) {
    o = o || {};
    const { w, h, px, mt } = this;
    const out = px.slice(), omt = mt.slice();
    const litOnly = o.lit === false ? false : true;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (px[i] >>> 24) continue;
      let dark = 0, lit = 0, m = 0;
      const chk = (j, isLit) => {
        if (!(px[j] >>> 24)) return;
        const M = MATS[mt[j]];
        if (!M || !M.line) return;
        if (isLit && litOnly) { if (!lit) { lit = M.lineLit; m = m || M.id; } } else if (!dark) { dark = M.line; m = M.id; }
      };
      if (x + 1 < w) chk(i + 1, true);
      if (y + 1 < h) chk(i + w, true);
      if (x > 0) chk(i - 1, false);
      if (y > 0) chk(i - w, false);
      const col = dark || lit;
      if (col) { out[i] = col; omt[i] = m; }
    }
    this.px = out; this.mt = omt;
    return this;
  };
  // Composite another layer (same size) over / under this one.
  function blend(dst, src) {
    const sa = src >>> 24;
    if (sa >= 255 || !(dst >>> 24)) return src;
    if (!sa) return dst;
    const k = sa / 255, da = dst >>> 24;
    const r = (src & 255) * k + (dst & 255) * (1 - k), g = ((src >> 8) & 255) * k + ((dst >> 8) & 255) * (1 - k), b = ((src >> 16) & 255) * k + ((dst >> 16) & 255) * (1 - k);
    const a = Math.min(255, sa + da * (1 - k));
    return (((a & 255) << 24) | ((b & 255) << 16) | ((g & 255) << 8) | (r & 255)) >>> 0;
  }
  LP.over = function (top) {
    for (let i = 0; i < this.px.length; i++) if (top.px[i] >>> 24) { this.px[i] = blend(this.px[i], top.px[i]); this.mt[i] = top.mt[i]; }
    return this;
  };
  LP.under = function (back) {
    for (let i = 0; i < this.px.length; i++) {
      if (!(back.px[i] >>> 24)) continue;
      if (!(this.px[i] >>> 24)) { this.px[i] = back.px[i]; this.mt[i] = back.mt[i]; } else if ((this.px[i] >>> 24) < 255) this.px[i] = blend(back.px[i], this.px[i]);
    }
    return this;
  };
  // Multiply the alpha of every pixel (ghost parts, fading frames).
  LP.fade = function (k) {
    for (let i = 0; i < this.px.length; i++) {
      const p = this.px[i];
      if (!p) continue;
      const a = Math.round((p >>> 24) * k);
      this.px[i] = a ? (((a & 255) << 24) | (p & 0xffffff)) >>> 0 : 0;
    }
    return this;
  };
  LP.like = function () { return new Layer(this.w, this.h, this.ox, this.oy); };
  LP.canvas = function () {
    const cv = RB.sprites.makeCanvas(this.w, this.h);
    const g = cv.getContext('2d');
    const img = g.createImageData(this.w, this.h);
    img.data.set(new Uint8ClampedArray(this.px.buffer, this.px.byteOffset, this.px.byteLength));
    g.putImageData(img, 0, 0);
    return cv;
  };

  // ---- deterministic helpers -----------------------------------------------------------
  function hh(x, y, k) {
    let h = (x * 374761393 + y * 668265263 + (k || 0) * 2246822519) >>> 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
    return (h ^ (h >>> 16)) >>> 0;
  }
  const rnd = (seed) => { let s = seed >>> 0 || 1; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; };
  // A small irregular cluster (2–6 px) at a point: a rounded blob whose shape
  // comes from the hash, used for moss, pebbles, snow clumps and scuffs.
  function cluster(L, x, y, size, M, k, seed) {
    const r = rnd(seed || hh(x | 0, y | 0, 7));
    const w = Math.max(2, Math.round(size * (0.7 + r() * 0.6))), h = Math.max(1, Math.round(size * (0.35 + r() * 0.35)));
    L.rect(Math.round(x - w / 2) + 1, Math.round(y - h / 2), w - 2, h, M, k);
    L.rect(Math.round(x - w / 2), Math.round(y - h / 2) + (h > 2 ? 1 : 0), w, Math.max(1, h - (h > 2 ? 2 : 1)), M, k);
    return L;
  }

  // ---- direct canvas helpers (backgrounds, title) --------------------------------------
  // Ordered 4×4 Bayer threshold, for deliberate, sparse transitions only.
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  const bayer = (x, y) => (BAYER[(y & 3) * 4 + (x & 3)] + 0.5) / 16;
  // Banded vertical ramp into ImageData rows y0..y1: each band flat, with a
  // narrow dithered seam (the last `seam` fraction of a band) toward the next.
  function bands(img, W, y0, y1, cols, seam) {
    const d = img.data, n = cols.length;
    seam = seam == null ? 0.35 : seam;
    const cs = cols.map(parse);
    for (let y = y0; y < y1; y++) {
      const f = ((y - y0) / Math.max(1, y1 - y0 - 1)) * (n - 1);
      const i = Math.min(n - 2, Math.floor(f)), fr = f - i;
      const s = seam > 0 ? clamp((fr - (1 - seam)) / seam, 0, 1) : 0;
      for (let x = 0; x < W; x++) {
        const c = s > bayer(x, y) ? cs[i + 1] : cs[i];
        const o = (y * W + x) * 4;
        d[o] = c[0]; d[o + 1] = c[1]; d[o + 2] = c[2]; d[o + 3] = 255;
      }
    }
  }
  // Stepped halo: a few flat rings of falling alpha (a pixel glow, not a blur).
  function halo(c, x, y, r, rgb, a, steps) {
    steps = steps || 3;
    for (let i = steps; i >= 1; i--) {
      const rr = Math.round((r * i) / steps);
      c.fillStyle = 'rgba(' + rgb + ',' + (a / steps).toFixed(3) + ')';
      disc(c, x, y, rr);
    }
  }
  // Filled pixel disc (rows of rects).
  function disc(c, x, y, r, ry) {
    ry = ry == null ? r : ry;
    for (let j = -ry; j <= ry; j++) {
      const k = ry ? j / (ry + 0.5) : 0;
      const hw = Math.round(r * Math.sqrt(Math.max(0, 1 - k * k)));
      c.fillRect(Math.round(x) - hw, Math.round(y) + j, hw * 2 + 1, 1);
    }
  }
  // Pixel ring (midpoint circle), thickness 1–2.
  function ring(c, x, y, r, th) {
    x = Math.round(x); y = Math.round(y); r = Math.round(r);
    let px = r, py = 0, err = 1 - r;
    const P = (a, b) => { c.fillRect(x + a, y + b, th || 1, th || 1); };
    while (px >= py) {
      P(px, py); P(py, px); P(-py, px); P(-px, py); P(-px, -py); P(-py, -px); P(py, -px); P(px, -py);
      py++;
      if (err < 0) err += 2 * py + 1; else { px--; err += 2 * (py - px) + 1; }
    }
  }

  return {
    parse, pack, css, hex, rgb2hsl, hsl2rgb, ramp, mix, tone, mat, solid, MATS, clamp,
    sphere, cyl, lin, lvl, Layer, layer: (w, h, ox, oy) => new Layer(w, h, ox, oy),
    hh, rnd, cluster, bayer, bands, halo, disc, ring, L3,
  };
})();
