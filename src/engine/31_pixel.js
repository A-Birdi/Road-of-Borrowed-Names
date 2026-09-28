/* Pixel-art toolkit for art-resolution characters and portraits.
 * Colour parsing, hue-shifted ramps (shadows lean cool/violet, highlights
 * warm), and a small RGBA pixel buffer with hard-edged rects, ellipses,
 * polygons, masks and ASCII templates, a selective outline and blitting to a
 * canvas. Drawing into a buffer instead of through canvas paths keeps every
 * edge crisp: no antialiased in-between colours. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.pix = (function () {
  'use strict';

  // ---- colour -------------------------------------------------------------------------
  const cc = new Map();
  function rgba(c) {
    if (c == null || c === false) return null;
    if (typeof c !== 'string') return c;
    let v = cc.get(c);
    if (v) return v;
    let h = c[0] === '#' ? c.slice(1) : c;
    if (h.length === 3 || h.length === 4) h = h.split('').map((ch) => ch + ch).join('');
    v = [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), h.length >= 8 ? parseInt(h.slice(6, 8), 16) : 255];
    if (v.some((n) => Number.isNaN(n))) v = [255, 0, 255, 255];
    cc.set(c, v);
    return v;
  }
  const h2 = (n) => (n < 16 ? '0' : '') + Math.max(0, Math.min(255, Math.round(n))).toString(16);
  function hex(v, a) { return '#' + h2(v[0]) + h2(v[1]) + h2(v[2]) + (a != null && a < 255 ? h2(a) : ''); }
  function mix(a, b, t) {
    const A = rgba(a), B = rgba(b);
    return hex([A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t]);
  }
  function alpha(c, a) { const v = rgba(c); return hex(v, Math.round(a * 255)); }
  function toHsl(v) {
    const r = v[0] / 255, g = v[1] / 255, b = v[2] / 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (mx + mn) / 2;
    if (mx !== mn) {
      const d = mx - mn;
      s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
      h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
      h *= 60;
    }
    return [h, s, l];
  }
  function fromHsl(h, s, l) {
    h = (((h % 360) + 360) % 360) / 360;
    s = Math.max(0, Math.min(1, s)); l = Math.max(0, Math.min(1, l));
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
    const f = (t) => { if (t < 0) t += 1; if (t > 1) t -= 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; };
    return [f(h + 1 / 3) * 255, f(h) * 255, f(h - 1 / 3) * 255];
  }
  const toward = (h, target, amt) => { const d = ((target - h + 540) % 360) - 180; return h + Math.sign(d) * Math.min(Math.abs(d), amt); };
  // One ramp step: k < 0 darker and cooler (towards blue-violet), k > 0 lighter and warmer.
  const sc = new Map();
  function shade(c, k) {
    if (!k) return typeof c === 'string' ? c : hex(c);
    const key = (typeof c === 'string' ? c : hex(c)) + '|' + k;
    let out = sc.get(key);
    if (out) return out;
    const [h, s, l] = toHsl(rgba(c));
    if (k < 0) {
      const n = -k;
      const grey = s < 0.1 ? 0.05 : 0;
      out = hex(fromHsl(toward(h, 250, 10 * n), s + (0.05 + grey) * n, l - (l < 0.25 ? 0.055 : l < 0.5 ? 0.09 : 0.11) * n));
    } else {
      const n = k;
      out = hex(fromHsl(toward(h, 48, 7 * n), s * (l > 0.7 ? 0.9 : 1) + (l < 0.6 ? 0.03 : 0) * n, l + (l < 0.25 ? 0.075 : l > 0.8 ? 0.05 : 0.085) * n));
    }
    sc.set(key, out);
    return out;
  }
  // Five-step ramp around a base colour: [deep, shadow, base, light, highlight].
  function ramp(base, dark, light) {
    return [shade(dark || base, dark ? -1 : -2), dark ? mix(dark, shade(base, -1), 0.5) : shade(base, -1), base, light ? mix(light, shade(base, 1), 0.35) : shade(base, 1), shade(light || base, light ? 1 : 2)];
  }
  const lum = (c) => { const v = rgba(c); return (0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]) / 255; };

  // ---- pixel buffer ------------------------------------------------------------------
  // oy: drawing coordinates sit this many rows above the buffer's own (room for an outline or a
  // tall hat above art authored from row 0)
  function Buf(w, h) { this.w = w; this.h = h; this.oy = 0; this.d = new Uint8ClampedArray(w * h * 4); }
  const B = Buf.prototype;
  B.put = function (x, y, v) {
    y += this.oy;
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const o = (y * this.w + x) * 4, d = this.d, a = v[3];
    if (a >= 255 || d[o + 3] === 0) { d[o] = v[0]; d[o + 1] = v[1]; d[o + 2] = v[2]; d[o + 3] = a; return; }
    if (a <= 0) return;
    const sa = a / 255, da = d[o + 3] / 255, oa = sa + da * (1 - sa);
    d[o] = (v[0] * sa + d[o] * da * (1 - sa)) / oa;
    d[o + 1] = (v[1] * sa + d[o + 1] * da * (1 - sa)) / oa;
    d[o + 2] = (v[2] * sa + d[o + 2] * da * (1 - sa)) / oa;
    d[o + 3] = oa * 255;
  };
  B.px = function (x, y, c) { const v = rgba(c); if (v) this.put(x | 0, y | 0, v); return this; };
  B.rect = function (x, y, w, h, c) {
    const v = rgba(c);
    if (!v || w <= 0 || h <= 0) return this;
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.put(i, j, v);
    return this;
  };
  B.alphaAt = function (x, y) { y += this.oy; return x < 0 || y < 0 || x >= this.w || y >= this.h ? 0 : this.d[(y * this.w + x) * 4 + 3]; };
  B.at = function (x, y) { y += this.oy; const o = (y * this.w + x) * 4, d = this.d; return [d[o], d[o + 1], d[o + 2], d[o + 3]]; };
  B.clear = function (x, y) { y += this.oy; if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.d[(y * this.w + x) * 4 + 3] = 0; };
  // Ellipse filling every pixel whose centre lies inside; (x0,y0)-(x1,y1) is the inclusive pixel box.
  B.oval = function (x0, y0, x1, y1, c) {
    const v = rgba(c);
    if (!v) return this;
    const cx = (x0 + x1 + 1) / 2, cy = (y0 + y1 + 1) / 2, rx = (x1 - x0 + 1) / 2, ry = (y1 - y0 + 1) / 2;
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
      if (dx * dx + dy * dy <= 1.0001) this.put(x, y, v);
    }
    return this;
  };
  // Polygon (even-odd) sampled at pixel centres; pts = [x0, y0, x1, y1, ...].
  B.poly = function (pts, c) {
    const v = rgba(c);
    if (!v) return this;
    let y0 = Infinity, y1 = -Infinity;
    for (let i = 1; i < pts.length; i += 2) { y0 = Math.min(y0, pts[i]); y1 = Math.max(y1, pts[i]); }
    const n = pts.length / 2;
    for (let y = Math.max(0, Math.floor(y0)); y <= Math.min(this.h - 1, Math.ceil(y1)); y++) {
      const sy = y + 0.5, xs = [];
      for (let i = 0; i < n; i++) {
        const ax = pts[i * 2], ay = pts[i * 2 + 1], bx = pts[((i + 1) % n) * 2], by = pts[((i + 1) % n) * 2 + 1];
        if ((ay <= sy && by > sy) || (by <= sy && ay > sy)) xs.push(ax + ((sy - ay) / (by - ay)) * (bx - ax));
      }
      xs.sort((a, b) => a - b);
      for (let k = 0; k + 1 < xs.length; k += 2) {
        for (let x = Math.max(0, Math.ceil(xs[k] - 0.5)); x <= Math.min(this.w - 1, Math.floor(xs[k + 1] - 0.5)); x++) this.put(x, y, v);
      }
    }
    return this;
  };
  // Thick line of square pixels (Bresenham).
  B.line = function (x0, y0, x1, y1, c, t) {
    const v = rgba(c);
    if (!v) return this;
    t = t || 1;
    let dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1, err = dx + dy;
    for (let guard = 0; guard < 4096; guard++) {
      for (let j = 0; j < t; j++) for (let i = 0; i < t; i++) this.put(x0 + i, y0 + j, v);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
    return this;
  };
  // ASCII template: rows of characters; map[ch] is a colour (or null to skip). '.' and ' ' are transparent.
  B.tpl = function (x, y, rows, map, flip) {
    for (let j = 0; j < rows.length; j++) {
      const r = rows[j];
      for (let i = 0; i < r.length; i++) {
        const ch = r[i];
        if (ch === '.' || ch === ' ') continue;
        const v = rgba(map[ch]);
        if (v) this.put(flip ? x + r.length - 1 - i : x + i, y + j, v);
      }
    }
    return this;
  };
  // Recolour every opaque pixel for which test(x, y) holds (keeps a shape, changes its shading).
  B.each = function (fn) {
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) if (this.d[(y * this.w + x) * 4 + 3]) fn(x, y);
    return this;
  };
  B.draw = function (src, dx, dy) {
    for (let y = 0; y < src.h; y++) for (let x = 0; x < src.w; x++) {
      const o = (y * src.w + x) * 4;
      if (src.d[o + 3]) this.put(x + dx, y + dy, [src.d[o], src.d[o + 1], src.d[o + 2], src.d[o + 3]]);
    }
    return this;
  };
  B.mirror = function () {
    const m = new Buf(this.w, this.h);
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
      const a = (y * this.w + x) * 4, b = (y * this.w + (this.w - 1 - x)) * 4;
      for (let k = 0; k < 4; k++) m.d[b + k] = this.d[a + k];
    }
    return m;
  };
  // Selective outline: every transparent pixel touching the silhouette (4-neighbour) becomes a
  // dark line tinted by the colour it borders — darkest on the shadow side (below/right), a
  // little lifted where light falls (above/left). Faint pixels (alpha < minA) do not count.
  B.outline = function (col, opt) {
    opt = opt || {};
    const minA = opt.minA == null ? 128 : opt.minA;
    const base = rgba(col || '#241c20');
    const w = this.w, h = this.h, d = this.d;
    const op = (x, y) => x >= 0 && y >= 0 && x < w && y < h && d[(y * w + x) * 4 + 3] >= minA;
    const marks = [];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (op(x, y)) continue;
      const n = [[x, y + 1, 1], [x + 1, y, 1], [x, y - 1, 0], [x - 1, y, 0]].filter((q) => op(q[0], q[1]));
      if (!n.length) continue;
      let r = 0, g = 0, b = 0, lit = 0;
      for (const q of n) { const o = (q[1] * w + q[0]) * 4; r += d[o]; g += d[o + 1]; b += d[o + 2]; lit += q[2]; }
      r /= n.length; g /= n.length; b /= n.length;
      // pixels above/left of the shape (their neighbour is below/right) sit on the lit side
      const t = opt.flat ? 0.78 : lit === n.length ? 0.68 : 0.84;
      marks.push(x, y, base[0] + (r - base[0]) * (1 - t), base[1] + (g - base[1]) * (1 - t), base[2] + (b - base[2]) * (1 - t));
    }
    for (let i = 0; i < marks.length; i += 5) {
      const o = (marks[i + 1] * w + marks[i]) * 4;
      d[o] = marks[i + 2]; d[o + 1] = marks[i + 3]; d[o + 2] = marks[i + 4]; d[o + 3] = 255;
    }
    return this;
  };
  B.toCanvas = function () {
    const cv = RB.sprites.makeCanvas(this.w, this.h);
    const c = cv.getContext('2d');
    c.putImageData(new ImageData(this.d, this.w, this.h), 0, 0);
    return cv;
  };
  B.threshold = function (a) { for (let i = 3; i < this.d.length; i += 4) this.d[i] = this.d[i] < (a || 110) ? 0 : 255; return this; };

  return { rgba, hex, mix, alpha, shade, ramp, lum, toHsl, fromHsl, Buf };
})();
