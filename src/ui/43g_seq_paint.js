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
 *   RB.seqPaint.grass(L, top, y1, M, o) / clouds(g, w, o) / crown(L, cx, cy, rw, rh, M, o)   outdoor materials
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
  const lerp = (a, b, k) => a + (b - a) * k;
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
  // a pool of light in four soft bands, their edges dithered (no gradients, no visible dot mesh); cached per radius,
  // colour and strength (a quantised to 1/20)
  function glow(c, x, y, r, rgb, a) {
    r = Math.round(r);
    if (r <= 0 || a <= 0) return;
    const aq = Math.round(clamp(a, 0, 1) * 20) / 20;
    if (aq <= 0) return;
    const sp = RB.seqKit.small('glow|' + r + '|' + (rgb || '') + '|' + aq, () => {
      const cv = RB.seqKit.mk(r * 2 + 1, r * 2 + 1), g = cv.getContext('2d'), p = P();
      const st = [1, 2, 3, 4].map((l) => 'rgba(' + (rgb || '255,200,120') + ',' + ((aq * l) / 4).toFixed(3) + ')');
      for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) {
        const d = Math.hypot(i, j) / r;
        if (d >= 1) continue;
        const f = (1 - d) * (1 - d) * 4 + (p.bayer(i + r, j + r) - 0.5) * 0.9;
        const l = Math.max(0, Math.min(4, Math.floor(f)));
        if (!l) continue;
        g.fillStyle = st[l - 1];
        g.fillRect(i + r, j + r, 1, 1);
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

  // Grass into a layer between a top edge top(x) and the bottom: a quiet base that darkens toward us, tufts of short
  // blades (lighter tips, darker roots) in clusters, a few flowers where o.flowers; no uniform speckle.
  function grass(L, top, y1, M, o) {
    o = o || {};
    const p = P(), rnd = p.rnd(o.seed || 17), w = L.w;
    L.fill(0, 0, w, y1, (x, y) => y >= top(x), M, (x, y) => clamp((o.base == null ? 0.5 : o.base) - (y - top(x)) / Math.max(1, y1 - top(x)) * 0.25 + (p.bayer(x, y) - 0.5) * 0.06, 0.02, 0.999));
    // tufts gather in clumps (a few dozen centres), thinning out between them, more of them toward us
    const n = Math.round((w * (y1 - top(w / 2))) / (o.density || 320)), centres = [];
    for (let i = 0; i < Math.max(4, Math.round(n / 7)); i++) { const x = rnd() * w; centres.push([x, top(x) + Math.pow(rnd(), 0.7) * (y1 - top(x))]); }
    for (let i = 0; i < n; i++) {
      const c0 = centres[Math.floor(rnd() * centres.length)], spread = 4 + (c0[1] - top(c0[0])) * 0.12;
      const x = Math.round(c0[0] + (rnd() - 0.5) * spread * 4), t0 = top(x), y = Math.round(clamp(c0[1] + (rnd() - 0.5) * spread, t0, y1));
      const near = (y - t0) / Math.max(1, y1 - t0), hgt = Math.max(1, Math.round((1 + near * 4) * (o.blade || 1)));
      for (let b = -1; b <= 1; b++) {
        if (rnd() < 0.3) continue;
        L.line(x + b * Math.max(1, Math.round(near * 2)), y, x + b * Math.max(1, Math.round(near * 2)) + (b === 0 ? 0 : b), y - hgt, M, Math.min(M.n - 1, Math.round((0.5 + rnd() * 0.22) * M.n)));
        L.dot(x + b * Math.max(1, Math.round(near * 2)), y, M, 1);
      }
      if (o.flowers && rnd() < 0.04) L.dot(x, y - hgt, o.flowers, Math.min(o.flowers.n - 1, 2 + Math.floor(rnd() * 2)));
    }
  }
  // Clouds straight onto a canvas: clustered soft masses, lit from above-left (a light top, a shaded underside), edges
  // dithered; o: { n, seed, y0, y1, light, shade, scale }
  function clouds(g, w, o) {
    o = o || {};
    const p = P(), rnd = p.rnd(o.seed || 31), sc = o.scale || 1;
    for (let i = 0; i < (o.n || 4); i++) {
      const cx = rnd() * w, cy = lerp(o.y0 || 10, o.y1 || 60, rnd()), parts = 4 + Math.floor(rnd() * 4), rw = (20 + rnd() * 30) * sc;
      const blobs = [];
      for (let j = 0; j < parts; j++) blobs.push([cx + (j - parts / 2) * rw * 0.5 + (rnd() - 0.5) * rw * 0.3, cy - Math.sin((j / Math.max(1, parts - 1)) * Math.PI) * rw * 0.35, rw * (0.45 + rnd() * 0.25)]);
      const x0 = Math.floor(cx - rw * parts * 0.4), x1 = Math.ceil(cx + rw * parts * 0.4), y0 = Math.floor(cy - rw), y1 = Math.ceil(cy + rw * 0.4);
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
        let inside = 0, top = 0;
        for (const [bx, by, r] of blobs) { const d = Math.hypot(x - bx, (y - by) * 1.6) / r; if (d < 1) { inside = Math.max(inside, 1 - d); top = Math.max(top, (by - y) / r); } }
        if (inside <= 0 || y > cy + rw * 0.25) continue;
        if (inside < 0.18 && p.bayer(x, y) > inside * 5) continue;
        g.fillStyle = top > 0.15 ? (o.light || '#ffffff') : y > cy ? (o.shade || '#c8d0e0') : (o.mid || '#e8ecf4');
        g.fillRect(x, y, 1, 1);
      }
    }
  }
  // A tree's crown as leaf masses round branches: dark inner pockets, lit clusters on the upper left, a few sky gaps
  function crown(L, cx, cy, rw, rh, M, o) {
    o = o || {};
    const p = P(), rnd = p.rnd(o.seed || 47), masses = [];
    const n = o.n || 9, size = o.size || (n > 12 ? 0.16 : 0.3);
    for (let i = 0; i < n; i++) { const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd()); masses.push([cx + Math.cos(a) * r * rw * 0.75, cy + Math.sin(a) * r * rh * 0.7, rw * (size + rnd() * size * 0.8)]); }
    masses.sort((a, b) => a[1] - b[1]);
    for (const [mx, my, r] of masses) L.ell(mx, my, r, r * 0.78, M, (x, y) => {
      const lit = ((cx - x) / rw + (cy - y) / rh) * 0.35 + ((mx - x) / r + (my - y) / r) * 0.22;
      const clump = (((Math.round(x * 0.5) * 7 + Math.round(y * 0.5) * 13) % 11) < 3) ? 0.1 : 0;
      return clamp(0.42 + lit + clump + (p.bayer(x, y) - 0.5) * 0.08, 0.02, 0.999);
    });
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

  return { stars, water, glints, rings, glow, lantern, planks, roof, slip, marks, cam, layer, grass, clouds, crown };
})();
