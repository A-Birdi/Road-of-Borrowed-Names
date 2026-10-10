/* The fidelity study's toolkit (development only; docs/future/work/P01_STUDY.md). Robin's C-80 asked how far the
 * world's pixel art can go toward the mockup and Octopath Traveler: crisp, defined pixels rather than shapes, with
 * depth, light and focus. The study draws Suzu at the Mill from scratch with these tools:
 *  - hue-shifted ramps per material, eight or nine steps, shadows toward violet and highlights toward gold;
 *  - an RGBA pixel buffer written pixel by pixel (no antialiased canvas paths), with coverage tests at 4×4
 *    samples so every edge is a deliberate stair, never a blur;
 *  - hashes and value noise for deterministic variation (no random stream; the same picture every time).
 * Nothing here is used by the game unless the study is opened (src/engine/68d_study.js). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.studyKit = (function () {
  'use strict';
  const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const R = (list) => list.map(hex);

  // ---- ramps (darkest first) ---------------------------------------------------------------------------------
  const RAMP = {
    grass: R(['#11221f', '#173329', '#1e4630', '#2a5d33', '#3b7536', '#548d39', '#72a53e', '#97bd4b', '#c2d564', '#e6e99a']),
    leaf: R(['#0c1a1a', '#122722', '#18372a', '#21492f', '#2d5e33', '#3e7536', '#558d3a', '#73a63f', '#9bbf4c', '#c9da6e']),
    dirt: R(['#2a1c1e', '#3f2a27', '#583a30', '#73503b', '#8d6847', '#a88257', '#c09c6d', '#d6b789', '#ead3aa']),
    stone: R(['#201d28', '#2f2b38', '#423c4b', '#58515e', '#706874', '#8b828b', '#a69ea1', '#c3bbb7', '#ded7cd']),
    thatch: R(['#24170f', '#3a2414', '#553418', '#72471c', '#905d22', '#ad772b', '#c79239', '#dcae52', '#ecca78', '#f7e3a8']),
    wood: R(['#1d1316', '#2f1d1f', '#462a25', '#5e3a2c', '#784c35', '#94633f', '#ad7c4f', '#c79a68']),
    plaster: R(['#4a4148', '#62585b', '#7d7271', '#988c86', '#b3a69b', '#cbbfb0', '#e0d5c4', '#f1e9da']),
    water: R(['#0a1730', '#0f2445', '#14345d', '#1b4777', '#245d92', '#3277ac', '#4993c4', '#6cb0d8', '#9ccde8', '#d6eef8']),
    bark: R(['#171114', '#251a1b', '#382723', '#4c352b', '#634635', '#7b5a43', '#957252']),
    reed: R(['#16241c', '#203624', '#2e4a2a', '#405f30', '#567539', '#718c45', '#90a65a', '#b3c078']),
    cattail: R(['#2a1712', '#43241a', '#5e3322', '#7a4630', '#955d3f']),
    // Suzu (the bust reference, docs/future/playbook/mockups/09: copper hair with violet in its shade, deep warm
    // skin, a plum dress with gold trim, a pink bow, gold at her ears, throat and wrists, amber eyes)
    skin: R(['#26120f', '#3d1d17', '#56291f', '#703828', '#894832', '#a15b3f', '#b8714f', '#cc8a63', '#dda67c']),
    hair: R(['#24091d', '#3c0e23', '#5a1524', '#7a2023', '#9a2e1f', '#b8411d', '#d1591f', '#e57629', '#f29a3e', '#f9c068']),
    dress: R(['#1d0819', '#320d2c', '#4a1440', '#641d55', '#7f2869', '#99387c', '#b24f8e', '#c96ea3', '#dc93ba']),
    gold: R(['#3a210d', '#5f3a12', '#8d5d17', '#b98420', '#dcaa31', '#f0cd56', '#fbe68c', '#fff8cf']),
    bow: R(['#4f1a36', '#7a2f53', '#a74a72', '#cf6e95', '#ec97b6', '#f9c1d4', '#fff0f5']),
    iris: R(['#1e0c08', '#4b1f0f', '#843a14', '#bd6119', '#e8912a', '#f8c35a']),
    boot: R(['#1b1210', '#2d1d18', '#432b21', '#5b3c2b', '#765036', '#916949']),
    sky: R(['#7fa8c9', '#9cbcd6', '#b9d0e1', '#d6e2e8', '#efe9dc']),
    flower: { white: R(['#8a8aa0', '#cfd3dc', '#ffffff']), yellow: R(['#8a5a12', '#e0a92a', '#ffe36a']), pink: R(['#7a2c4c', '#d0638e', '#f7a6c4']), blue: R(['#2b3478', '#5465c8', '#9cb2f2']), red: R(['#5c1418', '#b02a2a', '#ec6a50']) },
  };
  const OUTLINE = hex('#140a12');

  // ---- deterministic variation ------------------------------------------------------------------------------
  function hash(x, y, s) {
    let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul((s | 0) + 1, 1442695041)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  }
  const smooth = (t) => t * t * (3 - 2 * t);
  function vnoise(x, y, sc, s) {
    const fx = x / sc, fy = y / sc, ix = Math.floor(fx), iy = Math.floor(fy), tx = smooth(fx - ix), ty = smooth(fy - iy);
    const a = hash(ix, iy, s), b = hash(ix + 1, iy, s), c = hash(ix, iy + 1, s), d = hash(ix + 1, iy + 1, s);
    return a + (b - a) * tx + (c - a) * ty + (a - b - c + d) * tx * ty;
  }
  function fbm(x, y, sc, s, oct) {
    let v = 0, amp = 0.5, tot = 0;
    for (let i = 0; i < (oct || 3); i++) { v += vnoise(x, y, sc, s + i * 17) * amp; tot += amp; sc /= 2; amp /= 2; }
    return v / tot;
  }
  // a 4×4 ordered-dither threshold (0..1), for the rare soft transition that should stay pixel-clean
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
  const bayer = (x, y) => BAYER[(y & 3) * 4 + (x & 3)];

  // ---- the pixel buffer -------------------------------------------------------------------------------------
  function Buf(w, h) {
    this.w = w; this.h = h;
    this.d = new Uint8ClampedArray(w * h * 4);
  }
  Buf.prototype.set = function (x, y, c, a) {
    x |= 0; y |= 0;
    if (x < 0 || y < 0 || x >= this.w || y >= this.h || !c) return;
    const i = (y * this.w + x) * 4, A = a == null ? 255 : a;
    if (A >= 255) { this.d[i] = c[0]; this.d[i + 1] = c[1]; this.d[i + 2] = c[2]; this.d[i + 3] = 255; return; }
    const k = A / 255, ia = this.d[i + 3] / 255, oa = k + ia * (1 - k);
    if (oa <= 0) return;
    for (let j = 0; j < 3; j++) this.d[i + j] = (c[j] * k + this.d[i + j] * ia * (1 - k)) / oa;
    this.d[i + 3] = oa * 255;
  };
  Buf.prototype.get = function (x, y) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return null;
    const i = (y * this.w + x) * 4;
    return this.d[i + 3] ? [this.d[i], this.d[i + 1], this.d[i + 2], this.d[i + 3]] : null;
  };
  Buf.prototype.alpha = function (x, y) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return 0;
    return this.d[(y * this.w + x) * 4 + 3];
  };
  Buf.prototype.clear = function (x, y) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    this.d.fill(0, (y * this.w + x) * 4, (y * this.w + x) * 4 + 4);
  };
  Buf.prototype.canvas = function () {
    const cv = RB.sprites.makeCanvas(this.w, this.h);
    const g = cv.getContext('2d');
    const id = g.createImageData(this.w, this.h);
    id.data.set(this.d);
    g.putImageData(id, 0, 0);
    return cv;
  };
  // Draw buffer b onto this one at (ox, oy), only where b has colour.
  Buf.prototype.blit = function (b, ox, oy) {
    for (let y = 0; y < b.h; y++) for (let x = 0; x < b.w; x++) {
      const i = (y * b.w + x) * 4;
      if (b.d[i + 3]) this.set(ox + x, oy + y, [b.d[i], b.d[i + 1], b.d[i + 2]], b.d[i + 3]);
    }
  };

  // ---- coverage: a pixel is in a shape when at least half its 4×4 samples are ---------------------------------
  function covered(fn, x, y) {
    let n = 0;
    for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) if (fn(x + (i + 0.5) / 4, y + (j + 0.5) / 4)) n++;
    return n >= 8;
  }
  // a mask (Uint8Array w×h) of a shape given as an inside(x, y) test in continuous coordinates
  function mask(w, h, fn) {
    const m = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (covered(fn, x, y)) m[y * w + x] = 1;
    return m;
  }
  // inside tests
  const inEll = (cx, cy, rx, ry) => (x, y) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
  function inPoly(pts) {
    return (x, y) => {
      let c = false;
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        const [xi, yi] = pts[i], [xj, yj] = pts[j];
        if (((yi > y) !== (yj > y)) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
      }
      return c;
    };
  }
  // a thick quadratic Bézier stroke (a lock of hair, a ribbon): width w0 at the start tapering to w1
  function inStroke(p0, p1, p2, w0, w1) {
    const N = 24, pts = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N, u = 1 - t;
      pts.push([u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1], w0 + (w1 - w0) * t, t]);
    }
    const f = (x, y) => {
      for (let i = 0; i < N; i++) {
        const a = pts[i], b = pts[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], L = dx * dx + dy * dy || 1;
        let s = ((x - a[0]) * dx + (y - a[1]) * dy) / L;
        s = s < 0 ? 0 : s > 1 ? 1 : s;
        const px = a[0] + dx * s, py = a[1] + dy * s, w = (a[2] + (b[2] - a[2]) * s) / 2;
        if ((x - px) ** 2 + (y - py) ** 2 <= w * w) return true;
      }
      return false;
    };
    // where along the stroke, and how far across it (−1 left edge … 1 right edge), for shading
    f.at = (x, y) => {
      let best = 1e9, bt = 0, side = 0, bw = 1;
      for (let i = 0; i < N; i++) {
        const a = pts[i], b = pts[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], L = dx * dx + dy * dy || 1;
        let s = ((x - a[0]) * dx + (y - a[1]) * dy) / L;
        s = s < 0 ? 0 : s > 1 ? 1 : s;
        const px = a[0] + dx * s, py = a[1] + dy * s, d2 = (x - px) ** 2 + (y - py) ** 2;
        if (d2 < best) {
          best = d2; bt = a[3] + (b[3] - a[3]) * s; bw = (a[2] + (b[2] - a[2]) * s) / 2;
          side = Math.sign(dx * (y - a[1]) - dy * (x - a[0])) * Math.sqrt(d2);
        }
      }
      return { t: bt, across: side / (bw || 1) };
    };
    return f;
  }

  // a thick Catmull-Rom curve through points (a lock of hair that waves): width w0 at the start tapering to w1;
  // .at(x, y) gives how far along (t, 0..1) and how far across (−1 … 1, negative on the curve's left)
  function inCurve(points, w0, w1) {
    const pts = [], n = points.length, P = (i) => points[Math.max(0, Math.min(n - 1, i))];
    for (let i = 0; i < n - 1; i++) for (let k = 0; k < 8; k++) {
      const u = k / 8, p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2), u2 = u * u, u3 = u2 * u;
      const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u2 + (-a + 3 * b - 3 * c + d) * u3);
      pts.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
    pts.push(points[n - 1].slice());
    const N = pts.length - 1;
    for (let i = 0; i <= N; i++) { pts[i][2] = w0 + (w1 - w0) * Math.pow(i / N, 1.4); pts[i][3] = i / N; }
    const nearest = (x, y) => {
      let best = 1e9, bi = 0, bs = 0;
      for (let i = 0; i < N; i++) {
        const a = pts[i], b = pts[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], L2 = dx * dx + dy * dy || 1;
        let s = ((x - a[0]) * dx + (y - a[1]) * dy) / L2;
        s = s < 0 ? 0 : s > 1 ? 1 : s;
        const d2 = (x - a[0] - dx * s) ** 2 + (y - a[1] - dy * s) ** 2;
        if (d2 < best) { best = d2; bi = i; bs = s; }
      }
      const a = pts[bi], b = pts[bi + 1], dx = b[0] - a[0], dy = b[1] - a[1];
      const w = (a[2] + (b[2] - a[2]) * bs) / 2, t = a[3] + (b[3] - a[3]) * bs;
      const side = Math.sign(dx * (y - a[1]) - dy * (x - a[0]));
      return { d: Math.sqrt(best), w, t, side, dx, dy };
    };
    const f = (x, y) => { const q = nearest(x, y); return q.d <= q.w; };
    f.at = (x, y) => { const q = nearest(x, y); return { t: q.t, across: (q.side * q.d) / (q.w || 1), dx: q.dx, dy: q.dy }; };
    return f;
  }
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  // a ramp colour from a 0..1 value, with optional dithering between the two nearest steps
  function rampAt(ramp, v, x, y, dither) {
    const n = ramp.length - 1, f = clamp(v, 0, 1) * n;
    let i = Math.floor(f);
    if (dither && f - i > bayer(x, y)) i++;
    else if (!dither && f - i >= 0.5) i++;
    return ramp[clamp(i, 0, n)];
  }
  const mixc = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

  return { RAMP, OUTLINE, hex, hash, vnoise, fbm, bayer, Buf, mask, covered, inEll, inPoly, inStroke, inCurve, lerp, clamp, rampAt, mixc, smooth };
})();
