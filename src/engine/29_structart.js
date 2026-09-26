/* Buildings at art resolution: RB.props.STRUCT2.house and .tower.
 * A house footprint is w×h tiles (32 art px each): the bottom 36 px are the
 * wall face, everything above is roof, and the roof rises 12 px above the
 * footprint. Each building is prerendered once per (palette, layout, lit
 * state) into a cached sprite; only chimney smoke is drawn per frame.
 *
 * Roofs (o.roof): thatch (straw courses, cut-straw eaves, a bound ridge),
 * tile / indigo / ash (kawara columns, round eave caps, ridge ornaments;
 * ash adds soot), slate (staggered slates), snow (snow load over slate
 * with a lumpy lip and icicles), glass (mullioned panes). o.roofCols
 * overrides the colours. Walls (o.wall): plaster with a timber frame and a
 * board dado (default, palette wall colours), 'wood' board-and-batten, or
 * 'stone' coursed blocks with quoins; all on a stone footing. Doors are
 * inked so the way in is always clear; windows glow at night (o.night) or
 * when o.lit. */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const K = RB.propKit;
  const { R, ell, poly, line, mix, ramp, hh, cylCol } = K;
  const PI = Math.PI;
  const IR = K.FIX.iron, BR = K.FIX.brass, GL = K.FIX.glow, INK = '#231a20';
  const ROOFS = {
    thatch: ['#b89a58', '#9c7e42', '#7a5f2e', '#d4b872'],
    slate: ['#56606e', '#444c58', '#323842', '#707a88'],
    snow: ['#e8eef4', '#cdd8e2', '#8a96a4', '#ffffff'],
    indigo: ['#4c4a78', '#3a3860', '#2a2848', '#6e6ca0'],
    ash: ['#6e5a52', '#54443e', '#3c302c', '#8e7870'],
    glass: ['#8fb8b0', '#6f9890', '#4f7870', '#c8e8e0'],
  };
  // 4 anchors [base, dark, darker, light] → 5-step ramp dark → light
  const r5of = (c4) => [mix(c4[2], K.COOL, 0.35), c4[2], c4[1], c4[0], c4[3]];

  // ---- roofs ------------------------------------------------------------------------------------
  // Hipped roof seen from the front: the silhouette narrows a little toward
  // a short ridge; the hip ends at each side are lit on the left and shaded
  // on the right. Each material is drawn as a texture over the whole roof
  // rect, then kept inside the plane it belongs to (crisp masks).
  function roofGeom(W, eY) {
    const hx = Math.round(Math.min(34, 10 + W * 0.13));
    return { hx, S: [0, -7, W, -7, W + 7, eY, -7, eY], L: [0, -7, hx, -7, -7, eY], Rt: [W - hx, -7, W, -7, W + 7, eY] };
  }
  // Tint every pixel inside a triangle toward a colour (hip planes: warm
  // light on the left, cool shade on the right).
  function tintTri(g, tri, col, k) {
    const tf = g.getTransform(), ox = Math.round(tf.e), oy = Math.round(tf.f);
    const xs = [tri[0], tri[2], tri[4]], ys = [tri[1], tri[3], tri[5]];
    const X0 = Math.max(0, Math.floor(Math.min(...xs)) + ox), Y0 = Math.max(0, Math.floor(Math.min(...ys)) + oy);
    const X1 = Math.min(g.canvas.width, Math.ceil(Math.max(...xs)) + ox), Y1 = Math.min(g.canvas.height, Math.ceil(Math.max(...ys)) + oy);
    if (X1 <= X0 || Y1 <= Y0) return;
    const img = g.getImageData(X0, Y0, X1 - X0, Y1 - Y0), d = img.data, C = K.rgb(col);
    const [ax, ay, bx, by, cx, cy] = tri;
    const s = (px, py, x1, y1, x2, y2) => (px - x2) * (y1 - y2) - (x1 - x2) * (py - y2);
    for (let y = Y0; y < Y1; y++) for (let x = X0; x < X1; x++) {
      const px = x - ox + 0.5, py = y - oy + 0.5;
      const d1 = s(px, py, ax, ay, bx, by), d2 = s(px, py, bx, by, cx, cy), d3 = s(px, py, cx, cy, ax, ay);
      if ((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0)) continue;
      const i = ((y - Y0) * (X1 - X0) + (x - X0)) * 4;
      if (d[i + 3] < 128) continue;
      d[i] += (C[0] - d[i]) * k; d[i + 1] += (C[1] - d[i + 1]) * k; d[i + 2] += (C[2] - d[i + 2]) * k;
    }
    g.putImageData(img, X0, Y0);
  }
  function roofPlanes(g, W, eY, r5, tex, noAo) {
    const G = roofGeom(W, eY), RX = -10, RY = -10, RW = W + 20, RH = eY + 12;
    const layer = K.make(RW, RH, (g2) => {
      g2.translate(-RX, -RY);
      tex(g2, r5);
      tintTri(g2, G.L, K.WARM, 0.2);
      tintTri(g2, G.Rt, K.COOL, 0.28);
      // the lower courses sit a little darker (stepped, cool)
      const ao = Math.round((eY + 7) * 0.32);
      if (!noAo) {
        R(g2, -8, eY - ao, W + 16, ao, 'rgba(22,16,40,0.06)');
        R(g2, -8, eY - (ao >> 1), W + 16, ao >> 1, 'rgba(22,16,40,0.06)');
      }
      K.keepPoly(g2, G.S, -10, -10, W + 10, eY + 2);
    });
    g.drawImage(layer, RX, RY);
    // hip ridges
    line(g, G.hx, -7, -6, eY - 1, r5[4], 1); line(g, G.hx + 1, -7, -5, eY - 1, r5[3], 1);
    line(g, W - G.hx, -7, W + 6, eY - 1, r5[2], 1); line(g, W - G.hx - 1, -7, W + 5, eY - 1, r5[1], 1);
    return G;
  }
  // Course boundaries from the ridge down to the eave, a little taller
  // toward the viewer.
  function courses(y0, y1, base) {
    const out = [];
    let y = y0;
    while (y < y1) {
      const h = Math.round(base + (2.5 * (y - y0)) / Math.max(1, y1 - y0));
      out.push([y, Math.min(y1, y + h)]);
      y += h;
    }
    return out;
  }
  // Ridge cap between x0 and x1; tile roofs carry end ornaments.
  function ridge(g, x0, x1, r5, ornaments) {
    const rows = [r5[4], r5[3], r5[3], r5[2], r5[2], r5[1], r5[0]];
    rows.forEach((c, i) => R(g, x0, -13 + i, x1 - x0, 1, c));
    for (let x = x0 + 4; x < x1 - 6; x += 10) R(g, x, -11, 6, 1, r5[4]);
    if (!ornaments) return;
    for (const x of [x0 - 4, x1 - 4]) {
      R(g, x, -19, 8, 12, r5[0]); R(g, x + 1, -18, 6, 10, r5[3]); R(g, x + 1, -18, 6, 1, r5[4]); R(g, x + 6, -17, 1, 9, r5[1]);
      ell(g, x + 4, -13, 2, 2, r5[1]); R(g, x + 3, -14, 1, 1, r5[4]);
    }
  }
  // Kawara: straight columns of round tiles, course shadows, round eave caps.
  function tileRoof(g, W, eY, r5, seed, soot) {
    const G = roofPlanes(g, W, eY, r5, (q, p) => {
      R(q, -8, -8, W + 16, eY + 8, p[1]);
      const rows = courses(-7, eY - 5, 6);
      rows.forEach(([ya, yb], ri) => {
        for (let x = -8, col = 0; x < W + 8; x += 6, col++) {
          let sh = hh(seed, x * 7 + ya, 3) % 14 === 0 ? -1 : 0;
          // ash roofs: soot washed down a few tile columns in streaks
          if (soot) { const r = hh(seed, col, 44); if (r % 5 === 0) { const s0 = (r >>> 4) % Math.max(1, rows.length - 3), L = 2 + ((r >>> 8) % 4); if (ri >= s0 && ri < s0 + L) sh = ri === s0 || ri === s0 + L - 1 ? -1 : -2; } }
          const c = (k) => p[Math.max(0, Math.min(4, k + sh))];
          R(q, x, ya, 1, yb - ya, c(3)); R(q, x + 1, ya, 1, yb - ya, c(4)); R(q, x + 2, ya, 1, yb - ya, c(3));
          R(q, x + 3, ya, 1, yb - ya, c(2)); R(q, x + 4, ya, 2, yb - ya, c(1));
          R(q, x, yb - 2, 4, 1, c(4)); R(q, x, yb - 1, 6, 1, p[0]);
        }
      });
      R(q, -8, eY - 5, W + 16, 5, p[1]);
      for (let x = -8; x < W + 8; x += 6) { ell(q, x + 2.5, eY - 3, 3, 2.6, p[3]); R(q, x + 1, eY - 5, 2, 1, p[4]); R(q, x + 3, eY - 2, 2, 1, p[1]); }
      R(q, -8, eY - 1, W + 16, 1, p[0]);
    });
    ridge(g, G.hx - 3, W - G.hx + 3, r5, true);
  }
  // Thatch: straw courses with lit bundle tops, combed strands and ragged
  // edges, a thick cut-straw eave, a heavy ridge bound with straps.
  function thatchRoof(g, W, eY, r5, seed) {
    const G = roofPlanes(g, W, eY, r5, (q, p) => {
      R(q, -8, -8, W + 16, eY + 8, p[2]);
      for (const [ya, yb] of courses(-7, eY - 7, 8)) {
        R(q, -8, ya, W + 16, yb - ya, p[3]);
        R(q, -8, ya, W + 16, 2, p[4]);
        for (let x = -8; x < W + 8; x++) {
          const r = hh(seed, x, ya);
          if (r % 3 === 0) R(q, x, ya + 2 + ((r >>> 4) % 2), 1, 2 + ((r >>> 6) % 3), p[2]);
          if (r % 7 === 1) R(q, x, yb - 3, 1, 3 + ((r >>> 8) % 2), p[1]);
        }
        R(q, -8, yb - 1, W + 16, 1, p[1]);
      }
      for (let x = -8; x < W + 8; x++) {
        const r = hh(seed, x, 77);
        R(q, x, eY - 7, 1, 7, x % 2 ? p[3] : p[2]);
        R(q, x, eY - 7, 1, 1, p[4]);
        R(q, x, eY - 1 - (r % 2), 1, 1 + (r % 2), p[1]);
      }
      R(q, -8, eY - 8, W + 16, 1, p[1]);
    });
    const x0 = G.hx - 4, x1 = W - G.hx + 4;
    const rows = [r5[3], r5[4], r5[4], r5[3], r5[2], r5[2], r5[1], r5[0]];
    rows.forEach((c, i) => R(g, x0 + (i < 1 ? 2 : 0), -14 + i, x1 - x0 - (i < 1 ? 4 : 0), 1, c));
    for (let x = x0 + 6; x < x1 - 4; x += 14) { R(g, x, -14, 3, 8, mix(r5[1], '#3a2a1a', 0.3)); R(g, x, -14, 1, 8, r5[3]); }
  }
  // Slate: staggered slates, dark overlaps, a lead ridge.
  function slateTex(q, p, W, eY, seed) {
    R(q, -8, -8, W + 16, eY + 8, p[1]);
    let k = 0;
    for (const [ya, yb] of courses(-7, eY - 4, 6)) {
      const off = (k++ % 2) * 5;
      for (let x = -10 - off; x < W + 8; x += 10) {
        const v = hh(seed, x, ya) % 6, c = p[v === 0 ? 2 : 3];
        R(q, x, ya, 9, yb - ya, c); R(q, x, ya + 1, 9, 1, v === 1 ? p[4] : c === p[2] ? p[3] : p[4]); R(q, x + 9, ya, 1, yb - ya, p[1]);
      }
      R(q, -8, ya, W + 16, 1, p[0]);
    }
    R(q, -8, eY - 4, W + 16, 3, p[1]); R(q, -8, eY - 4, W + 16, 1, p[3]); R(q, -8, eY - 1, W + 16, 1, p[0]);
  }
  function slateRoof(g, W, eY, r5, seed) {
    const G = roofPlanes(g, W, eY, r5, (q, p) => slateTex(q, p, W, eY, seed));
    ridge(g, G.hx - 3, W - G.hx + 3, [r5[0], r5[1], r5[2], r5[3], mix(r5[4], '#ffffff', 0.2)], false);
  }
  // Snow: a smooth, drifted snow load over the whole roof, a bulging lip
  // along the eave and icicles below it.
  function snowRoof(g, W, eY, pal, seed) {
    const s5 = K.mat(pal).snow;
    const lip = (x) => eY - 3 + 1.4 * Math.sin(x * 0.31 + seed) + 1.1 * Math.sin(x * 0.11 + seed * 2);
    const G = roofPlanes(g, W, eY, s5, (q, p) => {
      K.shade(q, -8, -8, W + 16, eY + 8, p, (fx, fy) => {
        const t = (fy + 7) / (eY + 7), drift = 0.07 * Math.sin(fx * 0.05 + seed + fy * 0.04) + 0.05 * Math.sin(fx * 0.13 - fy * 0.09 + seed * 3);
        let I = 0.66 - t * 0.22 + drift;
        const l = lip(fx);
        if (fy > l - 4) I -= fy > l - 1 ? 0.75 : 0.35;
        return I;
      }, seed, 0.06, 8, 4);
    }, true);
    // eave lip lumps over the edge, then icicles
    for (let x = -6; x < W + 6; x += 5) { const y = Math.round(lip(x)); ell(g, x + 2.5, y, 3.4, 2.2, s5[2]); R(g, x + 1, y - 2, 3, 1, s5[3]); }
    R(g, -7, eY - 1, W + 14, 1, s5[1]);
    for (let x = -4; x < W + 4; x += 3) {
      const r = hh(seed, x, 51);
      if (r % 3) continue;
      const L = 3 + ((r >>> 3) % 6), y0 = Math.round(lip(x)) + 1;
      R(g, x, y0, 2, Math.ceil(L / 2), '#dcecf8'); R(g, x, y0 + Math.ceil(L / 2), 1, Math.floor(L / 2), '#c4dcee'); R(g, x, y0, 1, 2, '#ffffff');
    }
    const x0 = G.hx - 3, x1 = W - G.hx + 3;
    [s5[4], s5[4], s5[3], s5[3], s5[2], s5[1]].forEach((c, i) => R(g, x0 + (i === 0 ? 3 : 0), -13 + i, x1 - x0 - (i === 0 ? 6 : 0), 1, c));
  }
  // Glass: panes in a metal frame with sky reflections.
  function glassRoof(g, W, eY, r5, seed) {
    const G = roofPlanes(g, W, eY, r5, (q, p) => {
      R(q, -8, -8, W + 16, eY + 8, '#3a5850');
      for (const [ya, yb] of courses(-6, eY - 4, 9)) {
        for (let x = -8; x < W + 8; x += 12) {
          const v = hh(seed, x, ya) % 4;
          R(q, x + 1, ya + 1, 10, yb - ya - 2, p[v === 0 ? 4 : v === 1 ? 2 : 3]);
          R(q, x + 1, ya + 1, 10, 1, p[4]);
          if (v === 2) line(q, x + 3, yb - 3, x + 8, ya + 2, p[4], 1);
        }
      }
      R(q, -8, eY - 4, W + 16, 4, '#3a5850'); R(q, -8, eY - 4, W + 16, 1, '#6a8880');
    });
    ridge(g, G.hx - 3, W - G.hx + 3, ['#1e302c', '#2e4640', '#3a5850', '#557068', '#8aa8a0'], false);
  }

  // ---- walls ------------------------------------------------------------------------------------------
  function woodPlanksV(g, x0, x1, y0, y1, w5, seed) {
    for (let x = x0, i = 0; x < x1; x += 6, i++) {
      const w = Math.min(6, x1 - x), v = hh(seed, i, 61) % 4;
      R(g, x, y0, w, y1 - y0, w5[v === 0 ? 2 : 3]);
      R(g, x, y0, 1, y1 - y0, w5[4]); R(g, x + w - 1, y0, 1, y1 - y0, w5[1]);
      K.streaks(g, x + 1, y0 + 1, Math.max(1, w - 2), y1 - y0 - 2, w5[2], seed + i, 2, 5, true);
    }
  }
  function stoneCourses(g, x0, x1, y0, y1, s5, seed) {
    R(g, x0, y0, x1 - x0, y1 - y0, s5[1]);
    let row = 0;
    for (let y = y0; y < y1; y += 7, row++) {
      let x = x0 - (row % 2 ? 7 : 0);
      for (let i = 0; x < x1; i++) {
        const r = hh(seed, row * 40 + i, 81), w = 10 + (r % 8), c = s5[(r >>> 4) % 3 === 0 ? 2 : 3];
        const a = Math.max(x, x0), b = Math.min(x + w - 1, x1), h = Math.min(6, y1 - y);
        if (b > a) { R(g, a, y, b - a, h, c); R(g, a, y, b - a, 1, s5[4]); R(g, b - 1, y + 1, 1, h - 1, s5[1]); if ((r >>> 8) % 5 === 0 && b - a > 6) R(g, a + 2, y + 2, 3, 2, s5[2]); }
        x += w;
      }
    }
  }
  function wall(g, o, W, H, eY, pal, seed) {
    const M = K.mat(pal), w5 = M.wood, s5 = M.stone;
    const y0 = eY - 2, yF = H - 5;
    if (o.wall === 'stone') {
      stoneCourses(g, 2, W - 2, y0, yF, s5, seed);
      for (const x of [2, W - 10]) for (let y = y0, k = 0; y < yF; y += 7, k++) { const w = k % 2 ? 6 : 8; const xx = x === 2 ? 2 : W - 2 - w; R(g, xx, y, w, 6, s5[3]); R(g, xx, y, w, 1, s5[4]); R(g, xx + w - 1, y, 1, 6, s5[1]); }
    } else if (o.wall === 'wood') {
      woodPlanksV(g, 2, W - 2, y0, yF, w5, seed);
      for (let x = 14; x < W - 6; x += 18) { R(g, x, y0, 2, yF - y0, w5[3]); R(g, x, y0, 1, yF - y0, w5[4]); R(g, x + 2, y0, 1, yF - y0, w5[0]); }
      R(g, 2, yF - 4, W - 4, 4, w5[1]);
      R(g, 2, y0 + 12, W - 4, 2, w5[2]); R(g, 2, y0 + 12, W - 4, 1, w5[3]);
    } else {
      const P5 = M.wall;
      R(g, 2, y0, W - 4, yF - y0, P5[3]);
      R(g, 2, yF - 12, W - 4, 12, P5[2]);
      // board dado
      woodPlanksV(g, 2, W - 2, yF - 10, yF, w5, seed + 5);
      R(g, 2, yF - 11, W - 4, 2, w5[3]); R(g, 2, yF - 11, W - 4, 1, w5[4]);
      // plaster wear: soft clustered stains low on the wall
      for (let i = 0; i < W / 40; i++) { const r = hh(seed, i, 9); R(g, 6 + (r % (W - 16)), yF - 16 + ((r >>> 5) % 4), 4 + (r % 4), 2, P5[2]); }
      // timber frame: posts and a tie beam
      R(g, 2, y0 + 7, W - 4, 3, w5[2]); R(g, 2, y0 + 7, W - 4, 1, w5[3]); R(g, 2, y0 + 9, W - 4, 1, w5[1]);
      const posts = [2, W - 6];
      for (let x = 34; x < W - 30; x += 64) posts.push(x);
      for (const x of posts) { for (let i = 0; i < 4; i++) R(g, x + i, y0, 1, yF - y0, cylCol(i, 4, w5)); }
    }
    // footing
    R(g, 1, yF, W - 2, 5, s5[2]); R(g, 1, yF, W - 2, 1, s5[4]); R(g, 1, H - 1, W - 2, 1, s5[0]);
    for (let x = 9; x < W - 4; x += 12) R(g, x + (hh(seed, x, 2) % 3), yF + 1, 1, 4, s5[1]);
    // shadow under the eaves (stepped, cool)
    R(g, 2, y0, W - 4, 5, 'rgba(22,16,40,0.34)');
    R(g, 2, y0 + 5, W - 4, 2, 'rgba(22,16,40,0.16)');
  }

  // ---- openings ----------------------------------------------------------------------------------------------
  function windowAt(g, x, y, lit, M, snowy) {
    const w5 = M.wood, fr = mix(w5[1], '#2a2024', 0.35);
    R(g, x - 1, y - 1, 22, 20, INK);
    R(g, x, y, 20, 18, fr);
    if (lit) {
      R(g, x + 2, y + 2, 16, 14, GL[2]); R(g, x + 3, y + 3, 14, 11, GL[3]); R(g, x + 5, y + 5, 10, 7, GL[4]);
    } else {
      const s = ramp('#8fb0c4', 0.45, 0.4);
      R(g, x + 2, y + 2, 16, 14, s[2]); R(g, x + 2, y + 2, 16, 4, s[3]); R(g, x + 2, y + 12, 16, 4, s[1]);
      line(g, x + 4, y + 11, x + 9, y + 3, s[4], 2); line(g, x + 12, y + 14, x + 15, y + 9, s[4], 1);
    }
    R(g, x + 9, y + 2, 2, 14, fr); R(g, x + 2, y + 8, 16, 1, fr);
    R(g, x - 2, y + 18, 24, 3, w5[3]); R(g, x - 2, y + 18, 24, 1, w5[4]); R(g, x - 2, y + 20, 24, 1, w5[1]);
    if (snowy) { R(g, x - 2, y + 17, 24, 2, '#f4f8fc'); R(g, x - 2, y + 17, 24, 1, '#ffffff'); }
  }
  function doorAt(g, x, H, o, M, lit) {
    const w5 = M.wood, d5 = o.doorCol ? ramp(o.doorCol, 0.45, 0.35) : w5, s5 = M.stone;
    R(g, x + 2, H - 38, 28, 38, INK);
    R(g, x + 3, H - 37, 26, 4, w5[2]); R(g, x + 3, H - 37, 26, 1, w5[4]);
    for (const px of [x + 3, x + 25]) for (let i = 0; i < 4; i++) R(g, px + i, H - 33, 1, 33, cylCol(i, 4, w5));
    // two sliding leaves of vertical boards with a kick rail
    for (let i = 0; i < 18; i++) R(g, x + 7 + i, H - 33, 1, 32, i % 9 === 0 ? d5[4] : i % 9 === 8 ? d5[1] : (i % 3 === 2 ? d5[2] : d5[3]));
    R(g, x + 7, H - 22, 18, 2, d5[2]); R(g, x + 7, H - 22, 18, 1, d5[4]);
    R(g, x + 7, H - 7, 18, 3, d5[1]);
    R(g, x + 15, H - 33, 2, 32, lit ? GL[2] : d5[0]);
    R(g, x + 13, H - 17, 1, 3, BR[3]); R(g, x + 18, H - 17, 1, 3, BR[3]);
    // step stone
    R(g, x + 4, H - 2, 24, 4, s5[3]); R(g, x + 4, H - 2, 24, 1, s5[4]); R(g, x + 27, H - 1, 1, 3, s5[1]);
  }
  function signAt(g, x, eY, M, seed) {
    const w5 = M.wood, face = ramp(mix(w5[4], '#efe2c0', 0.55), 0.4, 0.3);
    R(g, x + 3, eY - 11, 1, 3, IR[2]); R(g, x + 20, eY - 11, 1, 3, IR[2]);
    R(g, x - 1, eY - 9, 26, 18, INK);
    R(g, x, eY - 8, 24, 16, w5[1]);
    R(g, x + 1, eY - 7, 22, 14, face[2]); R(g, x + 1, eY - 7, 22, 1, face[4]); R(g, x + 1, eY + 6, 22, 1, face[1]);
    const glyph = RB.propArt.kit.glyph;
    for (let i = 0; i < 4; i++) glyph(g, x + 3 + i * 5, eY - 5, hh(seed, i, 5), K.FIX.ink[2]);
    R(g, x + 3, eY + 2, 18, 1, K.FIX.ink[3]);
  }
  function chimneyAt(g, x, pal, snowy) {
    const c5 = ramp('#6e5c54', 0.5, 0.4);
    for (let i = 0; i < 12; i++) R(g, x + i, -28, 1, 26, cylCol(i, 12, c5));
    for (let y = -26, k = 0; y < -2; y += 4, k++) { R(g, x, y, 12, 1, c5[1]); R(g, x + (k % 2 ? 3 : 7), y + 1, 1, 3, c5[1]); }
    R(g, x - 2, -31, 16, 4, c5[3]); R(g, x - 2, -31, 16, 1, c5[4]); R(g, x - 2, -28, 16, 1, c5[1]);
    R(g, x + 2, -31, 8, 1, '#1a1210');
    if (snowy) { R(g, x - 2, -33, 16, 3, '#f4f8fc'); R(g, x - 2, -33, 16, 1, '#ffffff'); R(g, x + 10, -31, 4, 1, '#c8d8e6'); }
  }

  // ---- house ----------------------------------------------------------------------------------------------
  function houseKey(o, info) {
    const lit = !!(o.night || o.lit);
    return ['house', info.key, o.w, o.h, o.roof || 'tile', o.wall || '', o.door == null ? '-' : o.door, (o.windows || []).join('.'),
      lit ? 1 : 0, o.sign ? 's' + (o.signX || 0) : '', o.doorCol || '', o.roofCols ? o.roofCols.join('.') : '', o.chimney ? 'c' : '', o.x | 0, o.y | 0].join('|');
  }
  function buildHouse(pal, o, info) {
    const W = o.w * 32, H = o.h * 32, eY = H - 36, M = K.mat(pal);
    const BX = -12, BY = -38, BW = W + 26, BH = H + 44;
    const seed = hh(o.x | 0, o.y | 0, 17) % 997;
    const lit = !!(o.night || o.lit), roof = o.roof || 'tile';
    const snowy = roof === 'snow' || info.snow;
    return K.make(BW, BH, (g) => {
      g.translate(-BX, -BY);
      wall(g, o, W, H, eY, pal, seed);
      (o.windows || []).forEach((wx) => windowAt(g, wx * 32 + 6, H - 31, lit, M, snowy));
      if (o.door != null) doorAt(g, o.door * 32, H, o, M, lit);
      if (o.chimney) chimneyAt(g, W - 28, pal, snowy);
      const c4 = o.roofCols || ROOFS[roof] || pal.roof;
      if (roof === 'thatch' && !o.roofCols) thatchRoof(g, W, eY, r5of(c4), seed);
      else if (roof === 'slate') slateRoof(g, W, eY, r5of(c4), seed);
      else if (roof === 'snow') snowRoof(g, W, eY, pal, seed);
      else if (roof === 'glass') glassRoof(g, W, eY, r5of(c4), seed);
      else tileRoof(g, W, eY, r5of(roof === 'tile' ? o.roofCols || pal.roof : c4), seed, roof === 'ash');
      if (o.chimney) {
        // the chimney stands in front of the roof's upper courses
        const c5 = ramp('#6e5c54', 0.5, 0.4), x = W - 28;
        for (let i = 0; i < 12; i++) R(g, x + i, -14, 1, 12, cylCol(i, 12, c5));
        for (let y = -14; y < -2; y += 4) R(g, x, y, 12, 1, c5[1]);
        R(g, x - 1, -3, 14, 2, 'rgba(22,16,40,0.35)');
      }
      if (o.sign) signAt(g, (o.signX != null ? o.signX : 0) * 32 + 4, eY, M, seed);
      g.setTransform(1, 0, 0, 1, 0, 0);
      K.outline(g, BW, BH, 'sel');
      g.translate(-BX, -BY);
      if (lit) (o.windows || []).forEach((wx) => { R(g, wx * 32 + 4, H - 10, 24, 3, 'rgba(255,200,110,0.16)'); K.halo(g, wx * 32 + 16, H - 22, 16, '#ffd27a', 0.12); });
      g.globalCompositeOperation = 'destination-over';
      R(g, 0, H - 2, W + 4, 5, 'rgba(22,16,40,0.26)');
      R(g, W, eY - 2, 6, H - eY + 3, 'rgba(22,16,40,0.18)');
      R(g, -2, H - 1, W + 8, 3, 'rgba(22,16,40,0.12)');
      g.globalCompositeOperation = 'source-over';
    });
  }
  function smoke(c, x, y, t) {
    if (K.reduced()) return;
    for (let i = 0; i < 3; i++) {
      const s = ((t / 1400 + i / 3) % 1), r = 2 + s * 4, a = 0.42 * (1 - s);
      const px = Math.round(x + s * 8 + Math.sin(t / 600 + i) * 2), py = Math.round(y - s * 26);
      ell(c, px, py, r, r * 0.85, 'rgba(232,232,236,' + a.toFixed(3) + ')');
      ell(c, px - 1, py - 1, r * 0.55, r * 0.45, 'rgba(255,255,255,' + (a * 0.6).toFixed(3) + ')');
    }
  }
  function drawHouse2(c, x, y, pal, t, o) {
    const info = K.palInfo(pal);
    const cv = K.cached(houseKey(o, info), () => buildHouse(pal, o, info));
    c.drawImage(cv, x - 12, y - 38);
    if (o.chimney) smoke(c, x + o.w * 32 - 22, y - 34, t || 0);
  }

  // ---- tower (a round lighthouse-like stone tower) --------------------------------------------------------
  function buildTower(pal, o, info) {
    const W = o.w * 32, H = o.h * 32, M = K.mat(pal), s5 = M.stone;
    const BX = -8, BY = -100, BW = W + 22, BH = H + 106;
    const r5 = r5of(o.roofCols || pal.roof);
    const seed = hh(o.x | 0, o.y | 0, 19) % 997;
    const lit = true;
    return K.make(BW, BH, (g) => {
      g.translate(-BX, -BY);
      const x0 = 8, x1 = W - 8, bw = x1 - x0;
      // coursed stone cylinder
      for (let i = 0; i < bw; i++) R(g, x0 + i, -44, 1, H + 44, cylCol(i, bw, s5));
      for (let y = -44, k = 0; y < H - 8; y += 7, k++) {
        R(g, x0, y, bw, 1, s5[1]);
        for (let j = 0; j < 7; j++) {
          const u = ((j + (k % 2) * 0.5) / 7) * PI, jx = Math.round(x0 + bw / 2 - Math.cos(u) * (bw / 2));
          if (jx > x0 + 1 && jx < x1 - 1) { R(g, jx, y + 1, 1, 6, s5[1]); R(g, jx + 1, y + 1, 2, 1, s5[4]); }
        }
      }
      // string course and footing
      R(g, x0 - 2, 6, bw + 4, 4, s5[3]); R(g, x0 - 2, 6, bw + 4, 1, s5[4]); R(g, x0 - 2, 9, bw + 4, 1, s5[0]);
      for (let i = 0; i < W - 4; i++) R(g, 2 + i, H - 8, 1, 8, cylCol(i, W - 4, s5));
      R(g, 2, H - 8, W - 4, 1, s5[4]);
      // slit window
      R(g, W / 2 - 3, -24, 6, 14, INK); R(g, W / 2 - 2, -23, 4, 12, '#1a1820');
      // gallery and lantern room
      R(g, x0 - 4, -50, bw + 8, 6, IR[2]); R(g, x0 - 4, -50, bw + 8, 1, IR[4]); R(g, x0 - 4, -45, bw + 8, 1, IR[0]);
      for (let x = x0 - 3; x < x1 + 4; x += 5) R(g, x, -58, 1, 8, IR[3]);
      R(g, x0 - 4, -58, bw + 8, 2, IR[2]);
      const lx = W / 2 - 14;
      R(g, lx - 1, -70, 30, 21, INK);
      R(g, lx, -69, 28, 19, GL[2]); R(g, lx + 3, -67, 22, 15, GL[3]); R(g, lx + 8, -65, 12, 11, GL[4]);
      for (const x of [lx + 7, lx + 14, lx + 21]) R(g, x, -69, 1, 19, IR[1]);
      // conical roof
      K.shade(g, -6, -98, W + 12, 32, r5, (fx, fy) => {
        const t = (fy + 94) / 24;
        if (t < 0 || t > 1) return null;
        const hw = 2 + t * (W / 2 + 3), dx = fx - W / 2;
        if (Math.abs(dx) > hw) return null;
        let I = (-dx / hw) * 0.6 + 0.3;
        if (Math.round(fx + 1000) % 5 === 0) I -= 0.25;
        if (fy > -72) I -= 0.3;
        return I;
      }, seed, 0.08, 3, 2);
      R(g, W / 2 - 1, -100, 2, 7, IR[3]);
      // arched door
      if (o.door != null) {
        const dx = o.door * 32;
        R(g, dx + 5, H - 36, 22, 36, INK); ell(g, dx + 16, H - 34, 11, 6, INK);
        R(g, dx + 7, H - 33, 18, 33, M.wood[2]); ell(g, dx + 16, H - 32, 9, 5, M.wood[2]);
        for (let i = 0; i < 18; i += 4) R(g, dx + 7 + i, H - 34, 1, 34, M.wood[1]);
        R(g, dx + 8, H - 32, 1, 30, M.wood[4]);
        R(g, dx + 21, H - 17, 2, 2, BR[3]);
        R(g, dx + 4, H - 2, 24, 4, s5[3]); R(g, dx + 4, H - 2, 24, 1, s5[4]);
      }
      g.setTransform(1, 0, 0, 1, 0, 0);
      K.outline(g, BW, BH, 'sel');
      g.translate(-BX, -BY);
      if (lit) K.halo(g, W / 2, -60, 22, '#ffd68a', 0.18);
      g.globalCompositeOperation = 'destination-over';
      R(g, 0, H - 2, W + 6, 5, 'rgba(22,16,40,0.26)');
      R(g, W - 4, -40, 8, H + 40, 'rgba(22,16,40,0.14)');
      g.globalCompositeOperation = 'source-over';
    });
  }
  function drawTower2(c, x, y, pal, t, o) {
    const info = K.palInfo(pal);
    const key = ['tower', info.key, o.w, o.h, o.door == null ? '-' : o.door, o.roofCols ? o.roofCols.join('.') : '', o.x | 0, o.y | 0].join('|');
    const cv = K.cached(key, () => buildTower(pal, o, info));
    c.drawImage(cv, x - 8, y - 100);
  }

  RB.props.STRUCT2 = { house: drawHouse2, tower: drawTower2 };
})();
