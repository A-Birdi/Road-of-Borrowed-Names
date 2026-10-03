/* Harmony portrait busts — hair. Every supported hairstyle (and the wrap) in
 * the busts' three-quarter view turned to the right, as coherent masses:
 *
 *   back   behind the head and neck (long falls, tails, the back of a bob)
 *   cap    the crown over the cranium, clipped to the hairline so the face
 *          and the near ear show (drawn over the head)
 *   front  fringe clumps and side locks in front of the face and ear
 *
 * A mass is shaded as a lit sphere in a few flat steps, then carved by a few
 * seams that run from the crown (a dark line with a lit edge beside it, so
 * the cap reads as locks without striping). Clumps — fringe, side locks,
 * tails — are tapered, curved strands with a lit flank on the light's side,
 * a shaded flank and a dark parting where they overlap. One highlight band
 * crosses the crown and the clumps' roots where the head turns to the light.
 * Positions are head space (RB.harmonyKit.HEAD). `c.s` is a settle offset in
 * px for loose ends (0 at the hold; tails trail a little as the bust
 * arrives). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.harmonyKit = RB.harmonyKit || {};
(function (HK) {
  'use strict';
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const put = (...a) => HK.put(...a);
  const LIGHT = [-0.62, -0.78];

  // ---- primitives --------------------------------------------------------------------------------
  function nearest(pts, x, y) {
    let best = null, acc = 0, total = 0;
    const lens = [];
    for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); lens.push(l); total += l; }
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i], dx = b[0] - a[0], dy = b[1] - a[1], L2 = dx * dx + dy * dy || 1e-6;
      const u = clamp(((x - a[0]) * dx + (y - a[1]) * dy) / L2, 0, 1);
      const px = a[0] + dx * u, py = a[1] + dy * u;
      const d = Math.hypot(x - px, y - py);
      if (!best || d < best.d) {
        const l = Math.sqrt(L2), nx = -dy / l, ny = dx / l;
        const wa = a[2] == null ? 2 : a[2], wb = b[2] == null ? 2 : b[2];
        best = { d, t: (acc + lens[i - 1] * u) / (total || 1), s: (x - px) * nx + (y - py) * ny, seg: i - 1, u, nx, ny, dx: dx / l, dy: dy / l, w: wa + (wb - wa) * u };
      }
      acc += lens[i - 1];
    }
    return best;
  }
  // Catmull-Rom through control points [[x, y, w], ...] → a denser polyline (so clumps curve smoothly).
  function smooth(pts, n) {
    if (pts.length < 3) return pts;
    n = n || 4;
    const out = [];
    const P = (i) => pts[clamp(i, 0, pts.length - 1)];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
      for (let k = 0; k < n; k++) {
        const t = k / n, t2 = t * t, t3 = t2 * t;
        const f = (j) => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3);
        out.push([f(0), f(1), (p1[2] == null ? 2 : p1[2]) + ((p2[2] == null ? 2 : p2[2]) - (p1[2] == null ? 2 : p1[2])) * t]);
      }
    }
    out.push(pts[pts.length - 1]);
    return out;
  }
  // A tapered clump along control points [[X, Y, halfWidth], ...] (buffer px). o: { base, lit (steps added on
  // the lit flank), tipDark (fraction of the length darkened at the tip), seam (a dark parting on the shaded
  // edge), wave (+1 where the clump's surface turns up toward the light), band (X, Y) → bool for the
  // highlight band, only (X, Y) → bool, shade (X, Y, q) → extra steps }.
  function strand(L, ctrl, Mt, o) {
    o = o || {};
    const pts = o.raw ? ctrl : smooth(ctrl, 5);
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const p of pts) { const w = p[2] == null ? 2 : p[2]; x0 = Math.min(x0, p[0] - w); y0 = Math.min(y0, p[1] - w); x1 = Math.max(x1, p[0] + w); y1 = Math.max(y1, p[1] + w); }
    const base = o.base == null ? 3 : o.base;
    const out = [];
    for (let Y = Math.floor(y0) - 1; Y <= Math.ceil(y1) + 1; Y++) for (let X = Math.floor(x0) - 1; X <= Math.ceil(x1) + 1; X++) {
      const q = nearest(pts, X + 0.5, Y + 0.5);
      if (!q || q.d > q.w || q.w < 0.4) continue;
      if (o.only && !o.only(X, Y)) continue;
      const u = q.s / Math.max(0.6, q.w);
      const litSide = Math.sign(q.nx * LIGHT[0] + q.ny * LIGHT[1]) || -1;
      const ul = u * litSide;
      let k = base;
      if (ul > 0.2) k += o.lit == null ? 1 : o.lit;
      else if (ul < -0.5) k -= 1;
      if (o.seam !== false && ul < -0.8 && q.w > 1.5) k = base - 2;
      if (q.t > 1 - (o.tipDark == null ? 0.2 : o.tipDark)) k -= 1;
      if (o.wave && q.dx < -0.12 && ul > -0.5) k += 1;
      if (o.wave && q.dx > 0.3 && ul < 0.2) k -= 1;
      if (o.band && ul > -0.2 && o.band(X, Y)) k = Math.max(k, Mt.n - 1 - (ul > 0.35 ? 0 : 1));
      if (o.shade) k += o.shade(X, Y, q) || 0;
      put(L, X, Y, Mt, clamp(k, 0, Mt.n - 1));
    }
    return out;
  }
  // A mass (polygon, buffer px) shaded as a sphere lit from the upper left in flat steps.
  function mass(L, pts, Mt, o) {
    o = o || {};
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const [x, y] of pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
    const cx = o.cx == null ? (x0 + x1) / 2 : o.cx, cy = o.cy == null ? (y0 + y1) / 2 : o.cy;
    const rx = o.rx || (x1 - x0) / 2, ry = o.ry || (y1 - y0) / 2;
    const base = o.base == null ? 3 : o.base;
    for (let Y = Math.floor(y0); Y <= Math.ceil(y1); Y++) for (let X = Math.floor(x0); X <= Math.ceil(x1); X++) {
      if (!HK.inPoly(pts, X + 0.5, Y + 0.5)) continue;
      if (o.only && !o.only(X, Y)) continue;
      const nx = (X + 0.5 - cx) / rx, ny = (Y + 0.5 - cy) / ry;
      const v = -nx * 0.62 - ny * 0.78;
      let k = base + (v > 0.5 ? 1 : v < -0.55 ? -1 : 0);
      if (v < -1.05) k -= 1;
      if (o.band && v > -0.2 && o.band(X, Y)) k = Mt.n - 1;
      if (o.shade) k += o.shade(X, Y) || 0;
      put(L, X, Y, Mt, clamp(k, 0, Mt.n - 1));
    }
  }
  // A seam: a dark curve (quadratic through a, b, c in buffer px) over existing hair, with a lit line beside it.
  function seam(L, Mt, a, b, c, o) {
    o = o || {};
    const n = 40;
    let last = '';
    for (let i = 0; i <= n; i++) {
      const t = i / n, u = 1 - t;
      const x = u * u * a[0] + 2 * u * t * b[0] + t * t * c[0], y = u * u * a[1] + 2 * u * t * b[1] + t * t * c[1];
      const X = Math.floor(x), Y = Math.floor(y);
      const key = X + ',' + Y;
      if (key === last) continue;
      last = key;
      if (t < (o.from || 0.12)) continue;
      const i0 = Y * L.w + X;
      if (X < 0 || Y < 0 || X >= L.w || Y >= L.h || !L.px[i0] || L.mt[i0] !== Mt.id) continue;
      const k0 = Mt.c.indexOf(L.px[i0]);
      put(L, X, Y, Mt, Math.max(0, Math.min(k0, 3) - 2 + (t > 0.85 ? 0 : 0)));
      const lx = X + (o.litDx == null ? -1 : o.litDx), ly = Y + (o.litDy == null ? 0 : o.litDy);
      const i1 = ly * L.w + lx;
      if (lx >= 0 && ly >= 0 && lx < L.w && ly < L.h && L.px[i1] && L.mt[i1] === Mt.id) { const k1 = Mt.c.indexOf(L.px[i1]); if (k1 >= 0 && k1 < Mt.n - 1 && t < 0.8) put(L, lx, ly, Mt, Math.min(Mt.n - 2, k1 + 1)); }
    }
  }
  HK.strand = strand; HK.mass = mass; HK.seam = seam; HK.nearest = nearest; HK.smooth = smooth;

  function cut(L, test, x0, y0, x1, y1) {
    for (let Y = Math.max(0, y0); Y <= Math.min(L.h - 1, y1); Y++) for (let X = Math.max(0, x0); X <= Math.min(L.w - 1, x1); X++) {
      if (test(X, Y)) { const i = Y * L.w + X; L.px[i] = 0; L.mt[i] = 0; }
    }
  }
  HK.cut = cut;

  // ---- the hairline ------------------------------------------------------------------------------
  // The face opening the cap leaves (head space): from the far temple across the forehead to the near
  // temple, down in front of the ear and round under the jaw. EAR_ZONE: the near ear, kept clear of the cap.
  const OPENING = [[19, -8], [12, -12.5], [4, -14], [-5, -13.4], [-11.4, -10.6], [-13.4, -6], [-12.8, 0], [-12.2, 6], [-16, 13], [-8, 26], [12, 26], [20, 12], [20.4, 0]];
  const EAR_ZONE = [[-20, -1.6], [-12.4, -2.4], [-12, 11], [-17, 12.4], [-20.6, 6]];
  HK.OPENING = OPENING; HK.EAR_ZONE = EAR_ZONE;

  // ---- shared pieces ------------------------------------------------------------------------------
  const S = {};
  const T = (c, pts) => pts.map((p) => [c.hx + p[0], c.hy + p[1], p[2]]);
  const P2 = (c, pts) => pts.map((p) => [c.hx + p[0], c.hy + p[1]]);
  // the highlight band: a ring round the crown on its lit side (head space centre (-2, -8))
  function bandOf(c, r0, r1) {
    r0 = r0 || 14.6; r1 = r1 || 17.2;
    return (X, Y) => {
      const x = X + 0.5 - c.hx + 2, y = (Y + 0.5 - c.hy + 8) * 1.12;
      const r = Math.hypot(x, y), a = Math.atan2(y, x) * 180 / Math.PI;
      return r >= r0 && r < r1 && a > -168 && a < -48;
    };
  }
  // The standard cap: the cranium with hair's volume, shaded, carved by seams from the crown point.
  const CAP = [[-20.6, 4], [-21.4, -6], [-20, -16], [-14, -24.4], [-5, -28.2], [5, -27.8], [13.6, -23.6], [19.4, -15.6], [21, -6], [20.6, 2], [16, 2], [12, -6], [3, -10], [-6, -10], [-12, -6], [-13, 0], [-15, 8], [-20, 8]];
  function cap(c, o) {
    o = o || {};
    const L = c.L, Mt = c.M;
    mass(L, P2(c, o.pts || CAP), Mt, { cx: c.hx - 3, cy: c.hy - 12, rx: 22, ry: 19, base: 3, band: o.band === false ? null : bandOf(c) });
    const C = o.crown || [-3, -26];
    const cx = c.hx + C[0], cy = c.hy + C[1];
    for (const [ex, ey, bx, by, litDx] of o.seams || [[-19, 2, -19, -14, 1], [-12, -6, -12, -19, -1], [-4, -12, -6, -20, -1], [5, -12, 3, -21, -1], [13, -9, 11, -19, -1], [19, -2, 18, -15, -1]]) {
      seam(L, Mt, [cx, cy], [c.hx + bx, c.hy + by], [c.hx + ex, c.hy + ey], { litDx });
    }
  }
  // fringe clumps: [[x, y, w], ...] control points each (head space), root first
  function clumps(c, list, o) {
    o = o || {};
    const band = o.band === false ? null : bandOf(c);
    for (const pts of list) strand(c.L, T(c, pts), c.M, { base: o.base == null ? 3 : o.base, tipDark: o.tipDark == null ? 0.22 : o.tipDark, band, wave: o.wave });
  }
  HK.capHair = cap; HK.clumps = clumps; HK.bandOf = bandOf;

  // Fringes (control points: root → tip, half-widths)
  const FR = {
    soft: [
      [[16, -16, 2.2], [17.6, -9, 2.2], [18.6, -2, 0.4]],
      [[11, -19, 3], [12.4, -11, 3.2], [14.6, -4.6, 0.5]],
      [[-11, -16, 2.4], [-13, -9, 2.2], [-14.6, -3, 0.4]],
      [[-5, -20, 3.4], [-7, -11, 3.6], [-8.6, -3.4, 0.5]],
      [[4, -21, 3.4], [5, -12, 3.4], [6.6, -5.4, 0.5]],
      [[-0.6, -21, 3.6], [-0.4, -11, 3.8], [0.8, -2, 0.5]],
    ],
    long: [
      [[16, -16, 2.4], [18, -8, 2.4], [19, 0, 0.4]],
      [[10.6, -19, 3.2], [12.6, -10, 3.4], [14.4, -2.4, 0.5]],
      [[-11, -16, 2.6], [-13.4, -8, 2.6], [-14.8, 0, 0.4]],
      [[-5, -20, 3.6], [-7.4, -10, 3.8], [-8, -0.6, 0.5]],
      [[4.2, -21, 3.4], [5.6, -11, 3.4], [7.6, -3.6, 0.5]],
      [[-0.4, -21, 3.6], [-0.8, -10, 3.8], [1, 1, 0.5]],
    ],
    blunt: [
      [[16, -16, 2.6], [17.6, -10, 2.6], [18.4, -4, 1.2]],
      [[-11, -16, 2.6], [-12.6, -10, 2.8], [-13.4, -4, 1.2]],
      [[10.6, -19, 3.2], [11.6, -11, 3.4], [12.2, -4.4, 1.6]],
      [[-5, -20, 3.4], [-6, -11, 3.6], [-6.2, -3.6, 1.6]],
      [[4.4, -21, 3.4], [4.8, -11, 3.6], [5.2, -4, 1.6]],
      [[-0.4, -21, 3.4], [-0.6, -11, 3.6], [-0.4, -3.4, 1.6]],
    ],
    // parted toward the far side: one broad sweep over the near brow, a short one to the far temple
    parted: [
      [[8, -21, 2], [12.6, -16, 2.8], [16.6, -8, 2.6], [18.4, -1, 0.4]],
      [[6.6, -21, 2.4], [1, -17, 3.8], [-6, -11, 4.2], [-11.6, -6, 3], [-14.8, 0, 0.4]],
      [[5, -21, 2], [-1, -15, 3], [-5.6, -8, 2.2], [-6.6, -4, 0.4]],
    ],
    spiky: [
      [[15, -17, 2.6], [18, -10, 2.2], [20.4, -3, 0.3]],
      [[9, -19, 3.4], [12, -12, 2.8], [15.6, -5, 0.3]],
      [[2, -21, 3.6], [4, -13, 3], [7, -4.6, 0.3]],
      [[-4, -21, 3.6], [-4, -13, 3], [-2, -3, 0.3]],
      [[-9, -18, 3], [-11.6, -11, 2.6], [-12.6, -4, 0.3]],
      [[-13, -14, 2.4], [-16, -8, 2], [-18.6, -3, 0.3]],
    ],
  };
  HK.FRINGES = FR;
  // a lock in front of the near ear (sideburn) and one along the far temple
  const SIDEBURN = [[-13, -9, 2.2], [-13.8, -2, 2.2], [-13.4, 5, 0.5]];

  // ---- styles -----------------------------------------------------------------------------------
  // short: a cropped cap, the soft fringe, sideburns, two tufts at the nape
  S.short = {
    back(c) { clumps(c, [[[-18, -4, 3], [-20.4, 3, 2.6], [-19.6, 9, 0.4]], [[-13, -2, 3], [-15.6, 5, 2.6], [-14.6, 10.6, 0.4]]], { base: 2, band: false }); },
    cap(c) { cap(c); },
    front(c) { clumps(c, [SIDEBURN]); clumps(c, FR.soft); },
  };
  // bob: chin length all round, a blunt fringe, the ends turned in; covers the ears
  S.bob = {
    ear: false,
    back(c) {
      mass(c.L, P2(c, [[-21, -10], [-23.6, 2], [-23.6, 14], [-20, 20.6], [-10, 21], [-4, 18], [8, 18], [18, 20], [22.6, 14], [22.6, 0], [20, -10]]), c.M, { base: 2, cx: c.hx - 4, cy: c.hy, rx: 24, ry: 22 });
      clumps(c, [[[-17, -6, 3.4], [-22, 6, 3.6], [-19, 19.6, 1.8]], [[-11, -4, 3.2], [-15, 8, 3.4], [-12, 20, 1.6]]], { base: 2, band: false, tipDark: 0.15 });
    },
    cap(c) { cap(c, { pts: CAP.map((p) => (p[1] > 0 ? [p[0], p[1] + 2] : p)) }); },
    front(c) {
      const s = c.s || 0;
      clumps(c, [[[-12, -12, 3], [-15, -2, 3.4], [-15.6 + s * 0.5, 9, 3.2], [-12.4 + s * 0.5, 17.6, 1]], [[17, -12, 2.6], [19.4, -2, 2.8], [19.6, 8, 2.6], [16.6 + s * 0.3, 16.6, 0.8]]], { tipDark: 0.3 });
      clumps(c, FR.blunt);
    },
  };
  // long: straight, past the shoulders behind; a lock falls in front of the near shoulder
  S.long = {
    ear: false,
    back(c) {
      const s = c.s || 0;
      mass(c.L, P2(c, [[-21, -12], [-24.4, 2], [-26, 20], [-27 + s, 44], [-12, 48], [8, 48], [24 + s * 0.5, 46], [24, 24], [22, 4], [20, -10]]), c.M, { base: 2, cx: c.hx - 6, cy: c.hy + 6, rx: 26, ry: 34 });
      clumps(c, [
        [[-20, -4, 3.6], [-24, 14, 3.8], [-25 + s, 32, 3.4], [-25 + s, 47, 0.6]],
        [[-14, 0, 3.4], [-18, 16, 3.6], [-19 + s, 34, 3.2], [-18 + s, 48, 0.6]],
        [[18, 0, 3.2], [21.4, 16, 3.4], [22.4 + s * 0.5, 32, 3], [21.6 + s * 0.5, 46, 0.6]],
      ], { base: 2, band: false, tipDark: 0.18 });
    },
    cap(c) { cap(c); },
    front(c) {
      const s = c.s || 0;
      clumps(c, [[[-12.6, -12, 3], [-15.6, 0, 3.4], [-16.6 + s, 16, 3.4], [-17.6 + s, 32, 2.6], [-17 + s, 40, 0.5]], [[17, -12, 2.6], [19.8, 0, 2.8], [20.4 + s * 0.4, 12, 2.4], [20.6 + s * 0.4, 20, 0.5]]], { tipDark: 0.16 });
      clumps(c, FR.long);
    },
  };
  // wavy: a long fall in loose S-curves, side locks framing the face in waves
  S.wavy = {
    ear: false,
    back(c) {
      const s = c.s || 0;
      mass(c.L, P2(c, [[-21, -12], [-25.6, 2], [-28, 18], [-29 + s, 36], [-24 + s, 50], [-8, 50], [8, 50], [22 + s * 0.5, 50], [26, 34], [25, 16], [22, 2], [20, -12]]), c.M, { base: 2, cx: c.hx - 6, cy: c.hy + 8, rx: 28, ry: 36 });
      clumps(c, [
        [[-19, -6, 3.8], [-25, 8, 4.2], [-22.6, 20, 4.2], [-27 + s, 32, 4], [-24 + s, 43, 3], [-27 + s, 50, 0.6]],
        [[-13, 0, 3.6], [-18.6, 12, 4], [-15.6, 24, 4], [-20 + s, 36, 3.6], [-16.6 + s, 46, 0.6]],
        [[18, 0, 3.4], [23.6, 12, 3.8], [21, 24, 3.6], [25 + s * 0.5, 36, 3.2], [22.4 + s * 0.5, 47, 0.6]],
      ], { base: 2, band: false, tipDark: 0.16, wave: true });
    },
    cap(c) { cap(c); },
    front(c) {
      const s = c.s || 0;
      clumps(c, [
        [[-12.6, -12, 3], [-16.4, 0, 3.6], [-13.6, 10, 3.6], [-17.6 + s, 21, 3.4], [-15 + s, 31, 2.6], [-17.6 + s, 39, 0.5]],
        [[17, -12, 2.6], [20.6, -1, 3], [18.4, 9, 2.8], [21 + s * 0.4, 18, 2.2], [19.6 + s * 0.4, 25, 0.5]],
      ], { tipDark: 0.16, wave: true });
      clumps(c, FR.long, { wave: true });
    },
  };
  // ponytail: pulled back to a tie at the back of the crown; the tail hangs behind the near shoulder
  S.ponytail = {
    back(c) {
      const s = c.s || 0;
      clumps(c, [[[-17, -14, 4], [-25, -8, 4.6], [-28 + s * 0.6, 4, 4.4], [-27 + s, 18, 3.6], [-23.6 + s, 30, 0.6]]], { base: 2, tipDark: 0.2, band: false });
      clumps(c, [[[-18, -12, 2.6], [-22.4, -2, 3], [-21.6 + s, 12, 2.4], [-19 + s, 22, 0.5]]], { base: 3, tipDark: 0.25, band: false });
    },
    cap(c) { cap(c, { crown: [-16, -14], seams: [[-12, -6, -14, -12, -1], [-4, -12, -9, -18, -1], [5, -12, -4, -22, -1], [13, -9, 4, -24, -1], [19, -2, 12, -20, -1]] }); },
    front(c, d) {
      clumps(c, [SIDEBURN]);
      clumps(c, c.traits && c.traits.parted ? FR.parted : FR.soft);
      tie(c, -18, -14, 3.4);
    },
  };
  // bun: gathered up into a bun at the back of the crown (Mio: with pins)
  S.bun = {
    back(c) { clumps(c, [[[-16, -2, 2.4], [-18.6, 5, 2], [-18, 10, 0.4]]], { base: 2, band: false }); },
    cap(c) {
      cap(c, { crown: [-8, -26], seams: [[-19, 2, -19, -14, 1], [-12, -6, -14, -19, -1], [-4, -12, -8, -20, -1], [5, -12, 0, -22, -1], [13, -9, 8, -22, -1], [19, -2, 16, -16, -1]] });
    },
    front(c) {
      clumps(c, [SIDEBURN, [[16, -14, 1.8], [18.6, -6, 1.6], [19, 1, 0.4]]]);
      clumps(c, FR.soft.slice(1));
      bun(c, -9, -29, 7.6);
      if (c.traits && c.traits.pins) pins(c, -9, -29);
    },
  };
  // curly: a full mass of curls round the head, curls for a fringe; covers the ears
  S.curly = {
    ear: false,
    back(c) {
      mass(c.L, P2(c, [[-22, -16], [-27, -2], [-27, 12], [-21, 19], [-8, 18], [10, 18], [22, 19], [26, 8], [26, -6], [21, -16]]), c.M, { base: 2, cx: c.hx - 2, cy: c.hy - 2, rx: 27, ry: 22 });
      curls(c, -27, -16, 27, 20, 1);
    },
    cap(c) {
      mass(c.L, P2(c, [[-24, 6], [-26, -8], [-22, -22], [-12, -31], [2, -32.6], [15, -28], [23, -18], [25, -6], [24, 6], [17, 4], [12, -6], [3, -10], [-6, -10], [-12, -6], [-13, 0], [-16, 8]]), c.M, { cx: c.hx - 4, cy: c.hy - 14, rx: 25, ry: 20, base: 3 });
      curls(c, -27, -34, 27, 8, 2);
    },
    front(c) {
      for (const [x, y, r] of [[-11, -10, 3.6], [-5, -12, 3.8], [2, -13, 3.8], [9, -12, 3.6], [15, -9, 3.2], [-14.6, -3, 3], [19, -2, 2.8], [-15.4, 4, 2.8]]) curl(c, x, y, r, 3);
    },
  };
  // spiky: spikes thrown up and back from the crown, a fringe of points
  S.spiky = {
    back(c) {
      clumps(c, [[[-14, -12, 4], [-22, -12, 3], [-28, -14, 0.3]], [[-16, -4, 3.6], [-23, -1, 2.8], [-28.6, 1, 0.3]], [[-15, 3, 3], [-20, 8, 2.2], [-24, 12, 0.3]]], { base: 2, band: false, tipDark: 0.3 });
    },
    cap(c) {
      cap(c, { seams: [[-12, -6, -12, -19, -1], [-4, -12, -6, -20, -1], [5, -12, 3, -21, -1], [13, -9, 11, -19, -1]] });
      clumps(c, [
        [[-10, -20, 4], [-16, -26, 3], [-22, -31, 0.3]],
        [[-4, -23, 4.2], [-6, -31, 3], [-8.6, -37, 0.3]],
        [[3, -24, 4.2], [5, -32, 3], [6, -38, 0.3]],
        [[10, -21, 3.8], [15, -28, 2.6], [19, -32, 0.3]],
        [[15, -16, 3.4], [21, -20, 2.4], [26, -22, 0.3]],
        [[-15, -14, 3.6], [-22, -18, 2.6], [-27, -21, 0.3]],
      ], { tipDark: 0.28 });
    },
    front(c) { clumps(c, [SIDEBURN]); clumps(c, FR.spiky, { tipDark: 0.3 }); },
  };
  // braid: the cap pulled back, one braid over the far (left) shoulder
  S.braid = {
    back(c) { clumps(c, [[[-17, -4, 3], [-20, 3, 2.6], [-19, 9, 0.4]]], { base: 2, band: false }); },
    cap(c) { cap(c, { crown: [-3, -26] }); },
    front(c) {
      clumps(c, [SIDEBURN]);
      clumps(c, FR.soft);
      braid(c, [[15, 2], [16.6, 12], [17.6 + (c.s || 0) * 0.3, 22], [18 + (c.s || 0) * 0.6, 32], [17.6 + (c.s || 0), 41]]);
    },
  };
  // twintails: two tails tied high at the sides; the near one falls behind the near shoulder
  S.twintails = {
    back(c) {
      const s = c.s || 0;
      clumps(c, [[[-17, -12, 4], [-24, -4, 4.4], [-26 + s * 0.6, 10, 4], [-25 + s, 24, 3], [-22 + s, 34, 0.5]]], { base: 2, tipDark: 0.2, band: false });
      clumps(c, [[[17, -14, 3.6], [22, -6, 3.8], [24 + s * 0.4, 8, 3.4], [23.6 + s * 0.6, 22, 2.4], [21 + s * 0.6, 30, 0.5]]], { base: 2, tipDark: 0.2, band: false });
    },
    cap(c) { cap(c); },
    front(c) { clumps(c, [SIDEBURN]); clumps(c, FR.soft); tie(c, -17.4, -12.6, 3); tie(c, 17, -14, 2.6); },
  };
  // shaved: close stubble over the cranium, a crisp hairline
  S.shaved = {
    cap(c) {
      const L = c.L, Mt = c.Mstub || c.M;
      mass(L, P2(c, [[-18.6, 4], [-19, -8], [-15, -20], [-6, -25], [5, -25], [14, -20], [18.6, -10], [19, -4], [15, -4], [11, -9], [3, -12], [-6, -12], [-12, -7], [-13, 0], [-15, 6]]), Mt, { cx: c.hx - 3, cy: c.hy - 12, rx: 20, ry: 16, base: 2 });
      // the hairline's edge dissolves in a sparse ordered pattern, the skull's light shows through
      for (let Y = c.hy - 26; Y < c.hy + 8; Y++) for (let X = c.hx - 21; X < c.hx + 21; X++) {
        const i = Y * L.w + X;
        if (!L.px[i] || L.mt[i] !== Mt.id) continue;
        const edge = !HK.get(L, X, Y + 1) || !HK.get(L, X + 1, Y + 1) || !HK.get(L, X - 1, Y + 1);
        if (edge && (X + Y) % 2) { L.px[i] = 0; L.mt[i] = 0; }
      }
    },
  };
  // wrap: a cloth wrap over the hair, the knot and its tail at the back; a little hair at the temples
  S.wrap = {
    back(c) {
      const W = c.Mwrap;
      const s = c.s || 0;
      HK.strand(c.L, T(c, [[-18, -16, 3.4], [-25, -12, 3.6], [-28 + s, -4, 2.8], [-27 + s, 4, 0.6]]), W, { base: 3, tipDark: 0.2 });
    },
    cap(c) {
      const W = c.Mwrap;
      clumps(c, [SIDEBURN, [[16, -10, 2], [18.4, -3, 1.8], [18.6, 2, 0.4]]], { band: false });
      mass(c.L, P2(c, [[-20.6, -2], [-21.6, -12], [-16, -24], [-5, -29], [6, -28.6], [15, -24], [20.6, -14], [21, -7], [12, -11], [3, -13], [-6, -12.6], [-12.6, -9], [-14, -2]]), W, { cx: c.hx - 3, cy: c.hy - 16, rx: 22, ry: 16, base: 3, shade: (X, Y) => ((Y - c.hy + (X - c.hx) * 0.3 + 60) % 5 < 1.2 ? -1 : 0) });
      seam(c.L, W, [c.hx - 20, c.hy - 6], [c.hx - 2, c.hy - 16], [c.hx + 20, c.hy - 9], { from: 0, litDx: 0, litDy: -1 });
      // the knot at the back
      for (let Y = -24; Y <= -12; Y++) for (let X = -24; X <= -12; X++) if (HK.inEll(X + 0.5, Y + 0.5, -18.6, -17.6, 5, 4.6)) put(c.L, c.hx + X, c.hy + Y, W, X + Y < -38 ? 4 : X + Y > -32 ? 2 : 3);
    },
  };
  HK.HAIR = S;

  // ---- pieces ------------------------------------------------------------------------------------
  function tie(c, x, y, r) {
    const A = HK.clothMat(c.d ? c.d.cloth[2] : '#c85a6a', { step: 0.09 });
    for (let Y = -r; Y <= r; Y++) for (let X = -r; X <= r; X++) if (X * X + Y * Y <= r * r + 0.5) put(c.L, Math.round(c.hx + x + X), Math.round(c.hy + y + Y), A, X + Y < -1 ? 4 : X + Y > 1 ? 2 : 3);
  }
  function bun(c, x, y, r) {
    const L = c.L, Mt = c.M;
    const cx = c.hx + x, cy = c.hy + y;
    for (let Y = Math.floor(cy - r - 1); Y <= cy + r + 1; Y++) for (let X = Math.floor(cx - r - 1); X <= cx + r + 1; X++) {
      const dx = X + 0.5 - cx, dy = (Y + 0.5 - cy) * 1.08, d = Math.hypot(dx, dy);
      if (d > r) continue;
      const v = (-dx * 0.62 - dy * 0.78) / r;
      // hair wound round the bun: spiral partings
      const a = Math.atan2(dy, dx) + d * 0.32;
      const sp = ((a / (Math.PI * 2)) * 4 + 8) % 1;
      let k = v > 0.4 ? 4 : v > -0.3 ? 3 : 2;
      if (sp < 0.16 && d > 2) k -= 1;
      if (sp > 0.84 && d > 2 && k < 5) k += 1;
      if (d > r - 1.2 && v < -0.2) k = Math.min(k, 2);
      put(L, X, Y, Mt, clamp(k, 0, 5));
    }
  }
  function pins(c, x, y) {
    const G = HK.metalMat('#e0c070');
    const Mr = HK.M('pinbead', '#c85a6a', { n: 4, at: 2, step: 0.12 });
    const cx = c.hx + x, cy = c.hy + y;
    HK.line(c.L, cx, cy, -10, 3, 9, -3, G, 3); HK.line(c.L, cx, cy, -10, 4, 9, -2, G, 1);
    HK.line(c.L, cx, cy, -6, -6, 6, 4, G, 3);
    put(c.L, cx + 9, cy - 4, Mr, 3); put(c.L, cx + 10, cy - 4, Mr, 2); put(c.L, cx + 9, cy - 5, Mr, 3);
    put(c.L, cx - 7, cy - 7, G, 4);
  }
  function braid(c, path) {
    const L = c.L, Mt = c.M;
    const pts = path.map((p) => [c.hx + p[0], c.hy + p[1]]);
    // alternating plaits, each a short lit lobe tilted to its side, overlapping down the braid
    const n = 9;
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      const seg = Math.min(pts.length - 2, Math.floor(t * (pts.length - 1)));
      const u = t * (pts.length - 1) - seg;
      const x = pts[seg][0] + (pts[seg + 1][0] - pts[seg][0]) * u, y = pts[seg][1] + (pts[seg + 1][1] - pts[seg][1]) * u;
      const side = i % 2 ? 1 : -1, w = 3.4 - t * 1.2;
      HK.strand(L, [[x - side * w * 0.7, y - 2.4, w * 0.8], [x + side * w * 0.4, y + 2.6, w * 0.7]], Mt, { raw: true, base: 3, tipDark: 0.3, lit: 1 });
    }
    const end = pts[pts.length - 1];
    tie({ L, hx: end[0], hy: end[1], d: c.d }, 0, 0, 2);
    HK.strand(L, [[end[0], end[1] + 1, 2.2], [end[0] + 1, end[1] + 5, 2], [end[0] - 0.4, end[1] + 8, 0.4]], Mt, { raw: true, base: 3, tipDark: 0.3 });
  }
  // curls: overlapping shaded discs, laid bottom-up so upper curls overlap the lower ones
  function curl(c, x, y, r, base) {
    const L = c.L, Mt = c.M, cx = c.hx + x, cy = c.hy + y;
    for (let Y = Math.floor(cy - r); Y <= cy + r; Y++) for (let X = Math.floor(cx - r); X <= cx + r; X++) {
      const dx = X + 0.5 - cx, dy = Y + 0.5 - cy, d = Math.hypot(dx, dy);
      if (d > r) continue;
      const t = (dx * 0.62 + dy * 0.78) / r;
      let k = base + (t < -0.35 ? 1 : t > 0.45 ? -1 : 0);
      if (d < r * 0.4 && t < -0.1) k = base + 1;
      if (d > r - 0.9 && t > 0.2) k = base - 2;
      put(L, X, Y, Mt, clamp(k, 0, 5));
    }
  }
  function curls(c, x0, y0, x1, y1, base) {
    const L = c.L;
    const cells = [];
    for (let y = y1, row = 0; y >= y0; y -= 5, row++) for (let x = x0 + (row % 2) * 3; x <= x1; x += 6) cells.push([x + ((x * 7 + y * 3) % 3) - 1, y]);
    for (const [x, y] of cells) {
      const X = Math.round(c.hx + x), Y = Math.round(c.hy + y);
      if (!HK.get(L, X, Y)) continue;
      curl(c, x, y, 3.6, base + 1);
    }
  }
  HK.tie = tie; HK.bun = bun; HK.braid = braid; HK.curl = curl;

  // The cast shadow of the hair on the face: skin under a fringe's edge drops a step.
  function shadowOnFace(head, hair, sk, x0, y0, x1, y1) {
    for (let Y = y0; Y <= y1; Y++) for (let X = x0; X <= x1; X++) {
      const i = Y * head.w + X;
      if (!head.px[i] || head.mt[i] !== sk.id || HK.get(hair, X, Y)) continue;
      let under = false;
      for (let k = 1; k <= 2 && !under; k++) if (HK.get(hair, X - 1, Y - k) || HK.get(hair, X, Y - k)) under = true;
      if (!under) continue;
      const kk = sk.c.indexOf(head.px[i]);
      if (kk > 3) put(head, X, Y, sk, 3);
    }
  }
  HK.hairShadow = shadowOnFace;

  // Draw a hair part ('back' | 'cap' | 'front') of a style; the cap is clipped to the face and the ear.
  function hairPart(part, style, c) {
    const st = S[style] || S.short;
    if (style === 'wrap') c.Mwrap = c.Mwrap || HK.clothMat(c.look && c.look.wrapCol ? c.look.wrapCol : c.d ? c.d.cloth[2] : '#c8962e');
    if (style === 'shaved') { const P = RB.pxkit; c.Mstub = HK.M('stubble', P.hex(P.mix(c.M.rgba[2], c.d.F.skin.rgba[3], 0.42)), { n: 4, at: 2, step: 0.06, lineCol: '#2a1416' }); }
    if (!st[part]) return;
    st[part](c);
    if (part === 'cap') {
      const open = (c.opening || OPENING).map((p) => [c.hx + p[0], c.hy + p[1]]);
      const ear = EAR_ZONE.map((p) => [c.hx + p[0], c.hy + p[1]]);
      const keepEar = st.ear !== false;
      cut(c.L, (X, Y) => HK.inPoly(open, X + 0.5, Y + 0.5) || (keepEar && HK.inPoly(ear, X + 0.5, Y + 0.5)), c.hx - 34, c.hy - 44, c.hx + 34, c.hy + 34);
    }
  }
  HK.hairPart = hairPart;
  HK.hairCoversEar = (style) => (S[style] || S.short).ear === false;
})(RB.harmonyKit);
