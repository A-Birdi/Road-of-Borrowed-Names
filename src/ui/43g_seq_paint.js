/* Shared painting helpers for the travel volume's later pages (expansion P16: the six new chapters, the old
 * guardians, the Hall's tales, the settlement's festival; shots in 43h_seq_mb1.js … 43n_seq_post.js). They sit on
 * the sequence kit (RB.seqKit) and the pixel kit (RB.pxkit) and follow the same rules: drawn at art resolution, light
 * from the upper left unless a shot says otherwise, materials as hue-shifted ramps with clustered shading, an ink
 * outline on what can be looked at, nothing random (every variation from a seeded stream), nothing written to state.
 * Static layers are cached by the caller (RB.seqKit.cached); the live things here are a few pixels a frame.
 *
 *   RB.seqPaint.stars(g, x, y, w, h, n, seed, warmEvery)     a field of single-pixel stars
 *   RB.seqPaint.water(L, x0, y0, x1, y1, M, o)               a body of water into a pxkit layer (darker with depth,
 *                                                            long ripple bands, a lit band where the light lies)
 *   RB.seqPaint.glints(c, x0, y0, w, h, t, n, seed, rgb, still)  reflections that come and go on water
 *   RB.seqPaint.rings(c, x, y, rx, k, rgb, n)                rings spreading on water (k 0..1)
 *   RB.seqPaint.glow(c, x, y, r, rgb, a, steps)              a stepped, warm pool of light (no gradients)
 *   RB.seqPaint.lantern(c, x, y, R0, H0, lit, t, still)      a hanging chōchin with its glow (from the prologue kit)
 *   RB.seqPaint.planks(L, x, y, w, h, M, o)                  boards side by side with joints and a lit edge
 *   RB.seqPaint.roof(L, x0, x1, y, h, M, o)                  a tiled roof seen from below its eave: courses, a thick
 *                                                            eave line and the dark under it
 *   RB.seqPaint.slip(c, x, y, w, h, o)                       a paper slip with brush marks (never letters)
 *   RB.seqPaint.marks(c, x, y, h, n, k, col, seed)           a column of brush marks written down to k (0..1)
 *   RB.seqPaint.layer(w, h)                                  a pxkit layer that takes constant shades as 0..1 too
 *   RB.seqPaint.cam(w, vb, o)                                a pinhole camera for a shot built as a small place: the
 *                                                            water or ground is Y = 0, the camera at (0, o.ch, 0)
 *                                                            looking along +Z; o.F (focal length, × w), o.hy (the
 *                                                            horizon, × vb), o.cx (× w). cam.p(X, Y, Z) → [x, y, px a
 *                                                            unit]; cam.poly(L, [[X, Y, Z]…], M, sh) fills a face
 *                                                            (points closer than o.near are dropped) */
var RB = (globalThis.RB = globalThis.RB || {});

RB.seqPaint = (function () {
  'use strict';
  const P = () => RB.pxkit;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const R = (c, x, y, w, h, col) => { if (w <= 0 || h <= 0) return; if (col) c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };

  function stars(g, x, y, w, h, n, seed, warmEvery) {
    const rnd = P().rnd(seed || 5);
    for (let i = 0; i < n; i++) {
      const sx = x + Math.round(rnd() * w), sy = y + Math.round(rnd() * rnd() * h); // thicker toward the top
      R(g, sx, sy, 1, 1, warmEvery && i % warmEvery === 0 ? '#fff2cc' : i % 3 ? 'rgba(214,226,255,0.65)' : 'rgba(240,244,255,0.9)');
    }
  }

  // o: { lit: (x, y) → 0..1 extra light (where a lamp or the sky lies on it), band: rows between ripple bands,
  //      deep: how much darker the far edge is (0..1), seed }
  function water(L, x0, y0, x1, y1, M, o) {
    o = o || {};
    const p = P(), H = Math.max(1, y1 - y0), band = Math.max(2, o.band || 5), deep = o.deep == null ? 0.35 : o.deep;
    const rnd = p.rnd(o.seed || 11), off = [];
    for (let i = 0; i < 64; i++) off.push(Math.round(rnd() * 23));
    L.fill(x0, y0, x1, y1, () => true, M, (x, y) => {
      const d = (y - y0) / H;                                   // 0 far … 1 near
      const row = Math.floor((y - y0) / band), ph = ((Math.round(x) + off[row & 63]) % 24) / 24;
      // long ripple bands: a lighter crest over a darker trough, broken along the row
      const crest = (Math.round(y - y0) % band === 0 && ph < 0.55) ? 0.12 : (Math.round(y - y0) % band === 1 && ph > 0.3 && ph < 0.7) ? -0.08 : 0;
      const lit = o.lit ? o.lit(x, y) : 0;
      return clamp(0.42 - deep * (1 - d) * 0.6 + d * 0.08 + crest + lit + (p.bayer(x, y) - 0.5) * 0.06, 0.02, 0.999);
    });
  }
  function glints(c, x0, y0, w, h, t, n, seed, rgb, still) {
    const rnd = P().rnd(seed || 23);
    for (let i = 0; i < n; i++) {
      const x = x0 + rnd() * w, y = y0 + rnd() * h, ph = rnd() * 6.28, sp = 700 + rnd() * 900, len = 1 + Math.round(rnd() * 3);
      const a = still ? 0.45 : 0.15 + 0.6 * Math.max(0, Math.sin(t / sp + ph));
      if (a < 0.2) continue;
      c.fillStyle = 'rgba(' + (rgb || '255,236,190') + ',' + a.toFixed(2) + ')';
      c.fillRect(Math.round(x), Math.round(y), len, 1);
    }
  }
  function rings(c, x, y, rx, k, rgb, n) {
    n = n || 3;
    for (let j = 0; j < n; j++) {
      const kk = clamp(k * 1.3 - j * 0.18, 0, 1);
      if (kk <= 0 || kk >= 1) continue;
      const r = rx * (0.25 + kk), ry = r * 0.28, a = 0.55 * (1 - kk);
      c.fillStyle = 'rgba(' + (rgb || '220,236,240') + ',' + a.toFixed(2) + ')';
      const steps = Math.max(16, Math.round(r * 2));
      for (let i = 0; i < steps; i++) {
        const an = (i / steps) * Math.PI * 2;
        if (Math.sin(an) < -0.2 && i % 2) continue; // the far side of a ring is thinner
        c.fillRect(Math.round(x + Math.cos(an) * r), Math.round(y + Math.sin(an) * ry), 1, 1);
      }
    }
  }
  // a pool of light as ordered dither (a pixel is lit where the falloff beats the Bayer threshold), so it reads as
  // pixel light rather than rings; cached per radius, colour and strength (a quantised to 1/20)
  function glow(c, x, y, r, rgb, a) {
    r = Math.round(r);
    if (r <= 0 || a <= 0) return;
    const aq = Math.round(clamp(a, 0, 1) * 20) / 20;
    if (aq <= 0) return;
    const sp = RB.seqKit.small('glow|' + r + '|' + (rgb || '') + '|' + aq, () => {
      const cv = RB.seqKit.mk(r * 2 + 1, r * 2 + 1), g = cv.getContext('2d'), p = P();
      g.fillStyle = 'rgba(' + (rgb || '255,200,120') + ',0.5)';
      for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) {
        const d = Math.hypot(i, j) / r;
        if (d >= 1) continue;
        const f = (1 - d) * (1 - d) * aq * 2.2;
        if (f > p.bayer(i + r, j + r)) g.fillRect(i + r, j + r, 1, 1);
      }
      return { cv };
    });
    c.drawImage(sp.cv, Math.round(x - r), Math.round(y - r));
  }
  function lantern(c, x, y, R0, H0, lit, t, still) {
    const key = 'chochin|' + R0 + '|' + H0 + '|' + (lit ? 1 : 0);
    const ch = RB.seqKit.small(key, () => RB.seqKit.chochin(R0, H0, lit, Math.max(3, Math.round(H0 / 5))));
    if (!ch) return;
    if (lit) glow(c, x, y + H0 * 0.55, H0 * 2.2, '255,170,90', 0.24 + (still ? 0 : Math.sin(t / 420 + x) * 0.03), 4);
    R(c, x, y - Math.round(H0 * 0.35), 1, Math.round(H0 * 0.35), '#2a2024');
    c.drawImage(ch.cv, Math.round(x - ch.W / 2), Math.round(y));
  }
  // boards side by side (vertical when o.vertical), a dark joint between each, a lit edge on the upper left
  function planks(L, x, y, w, h, M, o) {
    o = o || {};
    const bw = Math.max(2, o.board || 6), p = P(), rnd = p.rnd(o.seed || 7), tone = [];
    for (let i = 0; i < 80; i++) tone.push((rnd() - 0.5) * 0.12);
    L.rect(x, y, w, h, M, (xx, yy) => {
      const u = o.vertical ? xx - x : yy - y, i = Math.floor(u / bw), j = u - i * bw;
      const joint = j === 0 ? -0.3 : j === 1 ? 0.1 : 0;
      const grain = ((Math.round(o.vertical ? yy : xx) + i * 7) % 11 === 0) ? -0.06 : 0;
      return clamp((o.base == null ? 0.55 : o.base) + tone[i % 80] + joint + grain - (o.shade ? o.shade(xx, yy) : 0), 0.02, 0.999);
    });
  }
  // a tiled roof seen from just below its eave: rounded tile courses running down, a thick eave, darkness under it
  function roof(L, x0, x1, y, h, M, o) {
    o = o || {};
    const p = P(), cw = Math.max(2, o.course || 4);
    L.fill(x0, y, x1, y + h, (xx, yy) => yy >= y && yy < y + h, M, (xx, yy) => {
      const ci = ((Math.round(xx) - x0) % cw + cw) % cw;
      const round = ci === 0 ? -0.28 : ci === 1 ? 0.18 : ci === cw - 1 ? -0.1 : 0.04;
      return clamp(0.48 + round - (yy - y) / h * 0.12 + (p.bayer(xx, yy) - 0.5) * 0.04, 0.02, 0.999);
    });
    const eave = Math.max(2, Math.round(h * 0.18));
    L.rect(x0, y + h - eave, x1 - x0, eave, M, (xx, yy) => (yy < y + h - eave + 1 ? 0.75 : 0.3));
    if (o.under) L.rect(x0, y + h, x1 - x0, o.under, P().mat('#1a1418', { n: 3, at: 1 }), 0.5);
  }
  // a slip of paper (white, slightly yellowed), its brush marks a column of short strokes (never letters)
  function slip(c, x, y, w, h, o) {
    o = o || {};
    R(c, x, y, w, h, o.paper || '#ece4cc');
    R(c, x, y + h - 1, w, 1, '#b8ac8e');
    R(c, x + w - 1, y, 1, h, '#cfc4a8');
    if (o.marks !== 0) marks(c, x + Math.round(w / 2) - (w > 4 ? 1 : 0), y + 2, h - 4, o.n || Math.max(2, Math.round(h / 4)), o.k == null ? 1 : o.k, o.ink || '#2a2024', o.seed || x * 7 + y);
  }
  // a column of brush marks: short horizontal and slanted strokes stacked, written top to bottom up to k
  function marks(c, x, y, h, n, k, col, seed) {
    const rnd = P().rnd(seed || 3), step = h / Math.max(1, n);
    c.fillStyle = col || '#2a2024';
    const upTo = Math.floor(n * clamp(k, 0, 1) + 1e-6);
    for (let i = 0; i < upTo; i++) {
      const yy = Math.round(y + i * step), kind = Math.floor(rnd() * 3), wd = 1 + Math.round(rnd() * 2);
      if (kind === 0) c.fillRect(x - wd, yy, wd * 2 + 1, 1);
      else if (kind === 1) { c.fillRect(x, yy, 1, Math.max(1, Math.round(step * 0.7))); c.fillRect(x - 1, yy + 1, 1, 1); }
      else { c.fillRect(x - 1, yy, 1, 1); c.fillRect(x, yy + 1, 1, 1); c.fillRect(x + 1, yy + 1, 1, Math.max(1, Math.round(step * 0.5))); }
    }
  }

  // A pxkit layer that also takes a constant shade as 0..1 (the kit itself reads a plain number as a ramp index):
  // rect/ell/fill/poly/seg/path wrap it in a function, line/dot turn it into the step it means.
  function layer(w, h, ox, oy) {
    const L = P().layer(w, h, ox, oy);
    const frac = (v) => typeof v === 'number' && v > 0 && v < 1;
    for (const [name, idx] of [['rect', 5], ['ell', 5], ['fill', 6], ['poly', 2], ['seg', 6], ['path', 3]]) {
      const f = L[name].bind(L);
      L[name] = function (...a) { if (frac(a[idx])) { const v = a[idx]; a[idx] = () => v; } return f(...a); };
    }
    for (const [name, idx, mi] of [['line', 5, 4], ['dot', 3, 2]]) {
      const f = L[name].bind(L);
      L[name] = function (...a) { if (frac(a[idx]) && a[mi]) a[idx] = Math.min(a[mi].n - 1, Math.floor(a[idx] * a[mi].n)); return f(...a); };
    }
    return L;
  }
  function cam(w, vb, o) {
    const F = (o.F || 0.9) * w, hy = Math.round((o.hy == null ? 0.38 : o.hy) * vb), cx = Math.round((o.cx == null ? 0.5 : o.cx) * w), ch = o.ch == null ? 1.5 : o.ch, near = o.near || 0.3;
    const p = (X, Y, Z) => { const z = Math.max(near, Z); return [cx + (F * X) / z, hy + (F * (ch - Y)) / z, F / z]; };
    // the part of a face in front of the near plane (one plane of Sutherland–Hodgman)
    const clip = (pts) => {
      const out = [];
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i], b = pts[(i + 1) % pts.length], ai = a[2] >= near, bi = b[2] >= near;
        if (ai) out.push(a);
        if (ai !== bi) { const t = (near - a[2]) / (b[2] - a[2]); out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, near]); }
      }
      return out;
    };
    return {
      F, hy, cx, ch, p, clip,
      poly(L, pts3, M, sh) {
        const q = clip(pts3).map((a) => p(a[0], a[1], a[2]).slice(0, 2));
        if (q.length >= 3) L.poly(q, M, sh);
      },
      seg(L, a, b, wd, M, sh) {
        if (a[2] < near && b[2] < near) return;
        if (a[2] < near) { const t = (near - a[2]) / (b[2] - a[2]); a = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, near]; }
        if (b[2] < near) { const t = (near - b[2]) / (a[2] - b[2]); b = [b[0] + (a[0] - b[0]) * t, b[1] + (a[1] - b[1]) * t, near]; }
        const A = p(a[0], a[1], a[2]), B = p(b[0], b[1], b[2]);
        L.seg(A[0], A[1], B[0], B[1], Math.max(1, wd * (A[2] + B[2]) / 2), M, sh);
      },
    };
  }

  return { stars, water, glints, rings, glow, lantern, planks, roof, slip, marks, cam, layer };
})();
