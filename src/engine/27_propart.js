/* Prop art at art resolution (draw2) for every prop in src/engine/25_props.js.
 * Each prop is prerendered into a cached sprite keyed by palette, variant
 * (deterministic per position or option) and animation frame, then blitted.
 * Coordinates below are art px relative to the top-left of the footprint
 * (a tile is 32×32); art may extend above and around it.
 *
 * Art rules used throughout:
 *  - light from the upper left; 5-step hue-shifted ramps per material;
 *  - decoration gets a selective outline in its own darker colour;
 *    interactable things (signs, boards, chests, doors, lanterns, mats,
 *    stairs, mailboxes, markers) get an ink outline and a warm focal accent
 *    (paper, brass or lamplight) so they read apart from clutter;
 *  - every ground prop sits on a soft contact shadow;
 *  - variation comes from RB.tiles.hh(o.cx, o.cy), never from randomness;
 *  - animated props cache a small set of frames and hold frame 0 when
 *    o.still (reduced motion) is set. */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const K = RB.propKit, P = RB.props.P;
  const { R, ell, poly, line, cyl, cylCol, streaks, mix, ramp, hh } = K;
  const PI = Math.PI;

  // art(id, spec): spec.box = [x, y, w, h] canvas rect relative to the footprint;
  // spec.v(o, info) → variant key (must cover every option the art depends on);
  // spec.f(t, o) → animation frame; spec.draw(g, M, v, f, info, pal);
  // spec.over(...) drawn after the outline (glows, glass); spec.shadow(v) →
  // [cx, cy, rx, ry, alpha]; spec.ground(...) drawn under the sprite, above the
  // shadow; spec.ink for interactables; spec.outline === false to skip it;
  // spec.live(c, x, y, pal, t, o) for cheap per-frame extras.
  function art(id, spec) {
    const pd = P[id];
    if (!pd) return;
    const [bx, by, bw, bh] = spec.box;
    pd.draw2 = function (c, x, y, pal, t, o) {
      o = o || {};
      const info = K.palInfo(pal);
      const v = spec.v ? spec.v(o, info) : 0;
      const f = spec.f ? spec.f(t || 0, o) : 0;
      const key = id + '|' + info.key + '|' + v + '|' + f;
      const cv = K.cached(key, () => K.make(bw, bh, (g) => {
        const M = K.mat(pal);
        g.translate(-bx, -by);
        spec.draw(g, M, v, f, info, pal);
        g.setTransform(1, 0, 0, 1, 0, 0);
        if (spec.outline !== false) K.outline(g, bw, bh, spec.ink ? 'ink' : 'sel');
        g.translate(-bx, -by);
        if (spec.over) spec.over(g, M, v, f, info, pal);
        g.globalCompositeOperation = 'destination-over';
        if (spec.ground) spec.ground(g, M, v, f, info, pal);
        if (spec.shadow) { const s = spec.shadow(v, info); if (s) K.shadow(g, s[0], s[1], s[2], s[3], s[4]); }
        g.globalCompositeOperation = 'source-over';
      }));
      // wind: the crown (the top `sway` fraction of the sprite) leans one art
      // pixel with a slow wave that travels across the map, with calm spells
      const k = spec.sway && t && !o.still ? Math.round(Math.sin(t / 1500 + (o.cx || 0) * 0.45 + (o.cy || 0) * 0.3) * (0.7 + 0.6 * Math.max(0, Math.sin(t / 5200 + (o.cx || 0) * 0.08)))) : 0;
      if (k) {
        const cut = Math.round(bh * spec.sway);
        c.drawImage(cv, 0, cut, bw, bh - cut, x + bx, y + by + cut, bw, bh - cut);
        c.drawImage(cv, 0, 0, bw, cut, x + bx + k, y + by, bw, cut);
      } else c.drawImage(cv, x + bx, y + by);
      if (spec.live) spec.live(c, x, y, pal, t || 0, o);
    };
  }
  RB.propArt = { art };
  const cxy = (o) => hh(o.cx | 0, o.cy | 0, 5);

  // Per-pixel shape shader: fn(fx, fy) returns an intensity (about -1..1) or
  // null outside the shape; intensities are quantized onto the ramp with a
  // clustered (cw×ch cell) texture offset.
  // A value above 50 selects the alternative ramp alt (value − 100).
  function shade(g, x, y, w, h, r5, fn, seed, tex, cw, ch, alt) {
    const tf = g.getTransform(), ox = Math.round(tf.e), oy = Math.round(tf.f);
    const X0 = Math.max(0, x + ox), Y0 = Math.max(0, y + oy);
    const X1 = Math.min(g.canvas.width, x + w + ox), Y1 = Math.min(g.canvas.height, y + h + oy);
    const W = X1 - X0, H = Y1 - Y0;
    if (W <= 0 || H <= 0) return;
    const img = g.getImageData(X0, Y0, W, H), d = img.data;
    const C = r5.map(K.rgb), C2 = alt ? alt.map(K.rgb) : C;
    cw = cw || 4; ch = ch || 3; tex = tex == null ? 0.3 : tex;
    for (let py = 0; py < H; py++) for (let px = 0; px < W; px++) {
      const fx = X0 + px - ox + 0.5, fy = Y0 + py - oy + 0.5;
      let I = fn(fx, fy);
      if (I == null) continue;
      let CC = C;
      if (I > 50) { I -= 100; CC = C2; }
      if (tex) {
        const cy = Math.floor((fy + 256) / ch), cx = Math.floor((fx + 256 + (cy & 1) * (cw >> 1)) / cw);
        I += (((hh(cx, cy, seed) & 255) / 255) - 0.5) * tex;
      }
      const k = I > 0.7 ? 4 : I > 0.4 ? 3 : I > 0.1 ? 2 : I > -0.22 ? 1 : 0;
      const o4 = (py * W + px) * 4, col = CC[k];
      d[o4] = col[0]; d[o4 + 1] = col[1]; d[o4 + 2] = col[2]; d[o4 + 3] = 255;
    }
    g.putImageData(img, X0, Y0);
  }
  K.shade = shade;

  // A trunk as stacked rows between left/right edge functions, shaded as a
  // cylinder, with vertical bark marks.
  function trunk(g, y0, y1, xl, xr, r5, seed, darkTop) {
    for (let y = y0; y < y1; y++) {
      const a = Math.round(xl(y)), b = Math.round(xr(y)), w = b - a;
      for (let i = 0; i < w; i++) {
        let k = r5.indexOf(cylCol(i, w, r5));
        if (darkTop && y < y0 + darkTop) k = Math.max(0, k - 2);
        R(g, a + i, y, 1, 1, r5[k]);
      }
    }
    // bark: short vertical clusters in the dark tone
    for (let i = 0; i < 6; i++) {
      const r = hh(seed, i, 31), y = y0 + (darkTop || 0) + (r % Math.max(1, y1 - y0 - 6 - (darkTop || 0)));
      const a = Math.round(xl(y)), b = Math.round(xr(y));
      if (b - a < 4) continue;
      R(g, a + 2 + ((r >>> 5) % (b - a - 3)), y, 1, 2 + ((r >>> 9) % 3), r5[1]);
    }
  }
  function roots(g, r5, cx, y, spread) {
    line(g, cx - 3, y - 2, cx - spread, y + 1, r5[2], 2);
    line(g, cx - 4, y - 1, cx - spread - 1, y + 1, r5[3], 1);
    line(g, cx + 3, y - 2, cx + spread, y + 1, r5[1], 2);
    R(g, cx - 1, y, 3, 1, r5[1]);
  }
  // Fallen leaves on the ground (drawn under the sprite).
  function fallen(g, r5, seed, n, x0, y0, w, h) {
    for (let i = 0; i < n; i++) {
      const r = hh(seed, i, 41), x = x0 + (r % w), y = y0 + ((r >>> 6) % h), c = r5[2 + ((r >>> 12) % 3)];
      R(g, x, y, 2, 1, c);
      R(g, x + ((r >>> 14) & 1 ? 2 : -1), y + 1, 1, 1, r5[1]);
    }
  }

  // ---- trees ----------------------------------------------------------------------------------
  // A broadleaf tree: 7–10 leaf clumps arranged in a dome from one of eight
  // deterministic layouts (size, lean, spread), a flared trunk with roots.
  // Cinder trees are autumnal and drop leaves; snowy regions carry snow caps.
  function canopy(v, cx, cy, A, B) {
    const cl = [];
    const rows = [[-0.72, 1, 0.62], [-0.38, 3, 0.95], [0.02, 3, 1], [0.4, 2, 0.8]];
    let n = 0;
    rows.forEach(([ry, cnt, span], ri) => {
      for (let i = 0; i < cnt; i++) {
        const r = hh(v, n++, 21);
        const u = cnt === 1 ? 0 : (i / (cnt - 1)) * 2 - 1;
        const jx = ((r % 7) - 3) * 0.5, jy = (((r >>> 4) % 5) - 2) * 0.6;
        cl.push({ x: cx + u * A * span * 0.62 + jx, y: cy + ry * B + jy, r: (ri === 0 ? 8 : 9.5) + ((r >>> 8) % 3) - (ri === 3 ? 1 : 0), k: ri === 0 ? 0.04 : ri === 3 ? 0.06 : 0 });
      }
    });
    return cl.sort((a, b) => a.y - b.y);
  }
  art('tree', {
    sway: 0.42,
    box: [-10, -36, 52, 72],
    v: (o) => cxy(o) % 12,
    draw(g, M, v, f, info) {
      const s = [1, 0.92, 1.06, 0.97, 1.03, 0.9, 1.08, 1, 0.95, 1.05, 0.93, 1.02][v];
      const lean = ((hh(v, 1, 3) % 7) - 3) * 0.8;
      const tr = M.trunk, seed = 900 + v * 17;
      // trunk with a fork into the canopy
      trunk(g, 6, 30, (y) => 12.5 + lean * (1 - y / 30) - Math.max(0, y - 22) * 0.45, (y) => 19.5 + lean * (1 - y / 30) + Math.max(0, y - 22) * 0.5, tr, seed, 10);
      line(g, 14 + lean, 8, 7 + lean, -2, tr[1], 3);
      line(g, 18 + lean, 8, 25 + lean, -1, tr[1], 3);
      roots(g, tr, 16, 29, 9);
      const A = 19 * s, B = 15 * s;
      const L = info.autumn ? [M.leaf[0], M.leaf[1], M.leaf[2], M.leaf[3], mix(M.leaf[4], '#fff2a0', 0.2)] : v % 3 === 1 ? M.leaf.map((c) => mix(c, '#c8d060', 0.08)) : v % 3 === 2 ? M.leaf.map((c) => mix(c, '#306070', 0.07)) : M.leaf;
      // crowns sit a little off the grid: shifted and raised per layout
      const cl = canopy(v, 16 + lean * 1.4, -3 - (s - 1) * 10 - (hh(v, 9, 2) % 4), A * (0.94 + (v % 4) * 0.03), B);
      // low side boughs that hang past the trunk on one or both sides
      cl.push({ x: 5 + lean + (v % 2), y: 8, r: 6.5, k: -0.05 });
      if (v % 3) cl.push({ x: 27 + lean - (v % 2), y: 7, r: 6, k: -0.05 });
      K.foliage(g, cl.sort((a, b) => a.y - b.y), L, seed);
      if (info.snow) K.snowTops(g, -10, -36, 52, 46, M.snow, v, 3);
    },
    ground(g, M, v, f, info) { if (info.autumn) fallen(g, M.leaf, v, 7, 0, 25, 32, 8); },
    shadow: () => [17, 28, 15, 5, 0.34],
  });

  // Fruit tree: a lower, rounder crown on a crooked trunk, hung with fruit.
  art('orchard', {
    sway: 0.4,
    box: [-8, -28, 48, 64],
    v: (o) => cxy(o) % 6,
    draw(g, M, v, f, info, pal) {
      const tr = M.trunk, seed = 700 + v * 13, bend = (v % 3) - 1;
      trunk(g, 6, 30, (y) => 13 + bend * Math.sin(y / 9) - Math.max(0, y - 23) * 0.4, (y) => 19 + bend * Math.sin(y / 9) + Math.max(0, y - 23) * 0.45, tr, seed, 6);
      line(g, 15, 8, 9, 0, tr[1], 2);
      line(g, 18, 8, 23, 1, tr[1], 2);
      roots(g, tr, 16, 29, 7);
      const cl = [];
      for (let i = 0; i < 7; i++) {
        const r = hh(v, i, 23), a = (i / 7) * PI * 2 + v;
        cl.push({ x: 16 + Math.cos(a) * 9 + ((r % 3) - 1), y: 2 + Math.sin(a) * 5.5 + (((r >>> 3) % 3) - 1), r: 8 + ((r >>> 6) % 2) });
      }
      cl.push({ x: 16, y: 0, r: 9 });
      cl.sort((a, b) => a.y - b.y);
      K.foliage(g, cl, M.leaf, seed, { ao: 0.45 });
      // fruit: 3×3 rounds with a warm highlight and a cool underside
      const fr = ramp(pal.flower[3], 0.45, 0.4);
      for (let i = 0; i < 9; i++) {
        const r = hh(v, i, 29), a = (r % 628) / 100, d = 3 + ((r >>> 10) % 9);
        const x = Math.round(16 + Math.cos(a) * d * 1.3), y = Math.round(4 + Math.sin(a) * d * 0.75);
        R(g, x - 1, y, 3, 2, fr[2]); R(g, x, y - 1, 1, 1, fr[2]);
        R(g, x - 1, y - 1 + 1, 1, 1, fr[3]); R(g, x, y - 1, 1, 1, fr[4]);
        R(g, x, y + 2, 2, 1, fr[1]); R(g, x + 1, y + 1, 1, 1, fr[1]);
      }
      if (info.snow) K.snowTops(g, -8, -28, 48, 36, M.snow, v, 3);
    },
    ground(g, M, v, f, info, pal) { if (v % 2 === 0) { const fr = ramp(pal.flower[3]); R(g, 24, 29, 2, 2, fr[2]); R(g, 24, 29, 1, 1, fr[3]); } if (info.autumn) fallen(g, M.leaf, v, 4, 2, 26, 28, 6); },
    shadow: () => [17, 28, 14, 4.5, 0.32],
  });

  // Conifer: four drooping tiers of boughs over a short trunk; in snowy
  // regions every exposed upper surface carries snow.
  art('pine', {
    sway: 0.38,
    box: [-8, -46, 48, 82],
    v: (o) => cxy(o) % 6,
    draw(g, M, v, f, info) {
      const s = [1, 0.9, 1.06, 0.95, 1.02, 0.88][v], seed = 500 + v * 7, cx = 16 + (((hh(v, 2, 4) % 3) - 1) * 0.5);
      const tr = M.trunk;
      trunk(g, 14, 30, (y) => 14 - Math.max(0, y - 25) * 0.4, (y) => 19 + Math.max(0, y - 25) * 0.4, tr, seed, 5);
      roots(g, tr, 16.5, 29, 6);
      const base = 22;
      const T = [[-40, -17, 8.5], [-29, -5, 12.5], [-17, 8, 16], [-5, 21, 18.5]].map(([a, b, w]) => [base + (a - base) * s, base + (b - base) * s, w * (0.94 + s * 0.06)]);
      const ph = (hh(v, 5, 6) % 10) / 3;
      // boughs spread out as they droop (a concave profile); heavier with snow
      const pw = info.snow ? 1.7 : 1.3;
      const inTier = (i, fx, fy) => {
        const [a, b, hw] = T[i], dx = fx - cx;
        if (fy < a || fy > b + 2) return false;
        const t = Math.min(1, (fy - a) / (b - a)), half = hw * (0.1 + 0.9 * Math.pow(t, pw));
        if (Math.abs(dx) > half) return false;
        const e = Math.abs(dx) / hw, scal = (2 + 2.5 * e) * Math.abs(Math.sin(dx * 0.5 + ph + i * 1.7));
        return fy <= b - scal + 3.5 * e;
      };
      shade(g, -8, -46, 48, 72, M.leaf, (fx, fy) => {
        for (let i = 0; i < 4; i++) {
          if (!inTier(i, fx, fy)) continue;
          const [a, b, hw] = T[i], dx = fx - cx, t = (fy - a) / (b - a);
          let I = (-dx / hw) * 0.6 + 0.3 - t * 0.2;
          let below = 99;
          if (i > 0) for (let k = 1; k <= 5; k++) if (inTier(i - 1, fx, fy - k)) { below = k; break; }
          // snow loads the shoulders of each tier (and the crown) in snowy regions
          if (info.snow && Math.abs(dx) > 2 && (i === 0 ? t < 0.3 + (hh(Math.floor(fx / 3), 0, seed) % 3) * 0.06 : below <= 3 + (hh(Math.floor(fx / 3), i, seed) % 3)))
            return 100 + (-dx / hw) * 0.5 + 0.55 - (i === 0 ? t : below * 0.08);
          // the tier above shades the top of this one
          if (below <= 4) I -= 0.75;
          // bough tips catch the light along the drooping edge
          else if (!inTier(i, fx, fy + 2) && dx < 4) I += 0.3;
          // needles: slanted strokes down and out from the axis
          if (((Math.floor(fy - Math.abs(dx) * 0.7) % 4) + 4) % 4 === 0) I -= 0.18;
          return I;
        }
        return null;
      }, seed, 0.16, 3, 2, M.snow);
      if (info.snow) K.snowTops(g, -8, -46, 48, 72, M.snow, v, 3);
    },
    shadow: () => [17, 28, 13, 4.5, 0.32],
  });

  // Bare tree: a charred or weathered trunk that forks into limbs and twigs.
  function limb(g, x, y, ang, len, w, depth, seed, r5) {
    const x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len;
    line(g, x, y, x2, y2, r5[w >= 3 ? 2 : 1], w);
    if (w >= 2) line(g, x - 1, y, x2 - 1, y2, r5[3], 1);
    if (depth <= 0) return;
    const r = hh(seed, depth, Math.round(ang * 100));
    const sp = 0.38 + (r % 5) * 0.06;
    limb(g, x2, y2, ang - sp, len * (0.62 + (r >>> 4) % 3 * 0.05), Math.max(1, w - 1), depth - 1, seed + 1, r5);
    if ((r >>> 8) % 4) limb(g, x2, y2, ang + sp * 0.9, len * 0.58, Math.max(1, w - 1), depth - 1, seed + 2, r5);
  }
  art('deadtree', {
    sway: 0.35,
    box: [-12, -40, 56, 76],
    v: (o) => cxy(o) % 6,
    draw(g, M, v, f, info) {
      const r5 = info.still ? ramp('#6a6670', 0.5, 0.35) : info.paper ? ramp('#7a6a58') : ramp('#4c3e36', 0.5, 0.5);
      const lean = ((v % 3) - 1) * 0.08;
      trunk(g, -6, 30, (y) => 14 - Math.max(0, y - 22) * 0.45 + (30 - y) * lean, (y) => 19 + Math.max(0, y - 22) * 0.5 + (30 - y) * lean, r5, 300 + v, 0);
      roots(g, r5, 16.5, 29, 8);
      const tx = 16.5 + 36 * lean;
      limb(g, tx - 1, -4, -PI / 2 - 0.5 - (v % 2) * 0.1, 13, 3, 3, v * 11 + 1, r5);
      limb(g, tx + 1, -4, -PI / 2 + 0.45, 12, 3, 3, v * 11 + 5, r5);
      limb(g, 15 + 20 * lean, 10, -PI / 2 - 1.05, 9, 2, 2, v * 11 + 9, r5);
      if (v % 2) limb(g, 18 + 18 * lean, 6, -PI / 2 + 1.0, 8, 2, 1, v * 11 + 13, r5);
      if (info.snow) K.snowTops(g, -12, -40, 56, 70, M.snow, v, 2);
    },
    shadow: () => [17, 29, 11, 3.5, 0.3],
  });

  // Shrub: a low mass of leaf clumps; some are in flower.
  art('bush', {
    sway: 0.45,
    box: [-6, -4, 44, 40],
    v: (o) => cxy(o) % 6,
    draw(g, M, v, f, info, pal) {
      const cl = [];
      for (let i = 0; i < 6; i++) {
        const r = hh(v, i, 51), row = i < 3 ? 0 : 1;
        cl.push({ x: 7 + (i % 3) * 9 + (row ? 4 : 0) + ((r % 3) - 1), y: (row ? 22 : 16) + ((r >>> 3) % 3) - (i === 1 ? 3 : 0), r: 7 + ((r >>> 6) % 3) - (row ? 1 : 0) });
      }
      cl.sort((a, b) => a.y - b.y);
      K.foliage(g, cl, M.leaf, 40 + v, { ao: 0.55 });
      if (v % 3 === 0 && !info.snow) {
        const fr = ramp(pal.flower[v % 2 ? 1 : 0], 0.4, 0.3);
        for (let i = 0; i < 6; i++) {
          const r = hh(v, i, 53), x = 6 + (r % 20), y = 12 + ((r >>> 5) % 10);
          R(g, x, y, 2, 2, fr[3]); R(g, x, y, 1, 1, fr[4]); R(g, x + 1, y + 1, 1, 1, fr[1]);
        }
      }
      if (info.snow) K.snowTops(g, -6, -4, 44, 36, M.snow, v, 2);
    },
    ground(g, M, v, f, info) { if (info.autumn) fallen(g, M.leaf, v + 9, 3, 2, 27, 28, 5); },
    shadow: () => [16, 28, 15, 4, 0.3],
  });

  // Reeds and bulrushes, swaying as a group (five cached lean frames).
  art('reeds', {
    box: [-4, -12, 40, 46],
    v: (o) => cxy(o) % 3,
    f: (t, o) => (o.still ? 2 : Math.round(Math.sin(t / 700 + (o.cx | 0)) * 2) + 2),
    draw(g, M, v, f, info, pal) {
      const sway = f - 2, r5 = M.reed, head = ramp(mix(pal.trunk[0], '#8a5a30', 0.5), 0.45, 0.3);
      for (let i = 0; i < 8; i++) {
        const r = hh(v, i, 61), bx = 2 + i * 4 + (r % 2), top = -4 + ((r >>> 3) % 12), col = r5[1 + ((r >>> 7) % 3)];
        const lean = sway * (0.6 + ((r >>> 9) % 3) * 0.25);
        for (let y = top; y < 31; y++) {
          const t = (31 - y) / (31 - top), x = Math.round(bx + lean * t * t);
          R(g, x, y, 1, 1, y < top + 3 ? r5[3] : col);
        }
        if ((r >>> 11) % 3 === 0) {
          const x = Math.round(bx + lean * 0.8);
          R(g, x - 1, top + 2, 3, 6, head[2]); R(g, x - 1, top + 2, 1, 5, head[3]); R(g, x + 1, top + 3, 1, 5, head[1]);
        }
        // a blade curving away from the stalk
        if (i % 2 === 0) {
          const dir = (r >>> 13) & 1 ? 1 : -1;
          for (let k = 0; k < 7; k++) R(g, Math.round(bx + dir * (k * 0.6 + k * k * 0.06) + lean * 0.5), 26 - k * 2, 1, 2, r5[2]);
        }
      }
      if (info.snow) K.snowTops(g, -4, -12, 40, 42, M.snow, v, 1);
    },
    shadow: () => [16, 30, 14, 3, 0.22],
  });

  // Boulder: two or three faceted lumps; moss on its top in green regions,
  // snow in snowy ones, a crack or two.
  art('rock', {
    box: [-4, -6, 40, 40],
    v: (o) => cxy(o) % 6,
    draw(g, M, v, f, info, pal) {
      const r5 = M.stone, main = [16 + ((v % 3) - 1), 22, 12 + (v % 2), 10 + ((v >> 1) % 2)];
      const lumps = [main, v % 3 === 0 ? [8, 26, 7, 6] : [25, 25, 7, 7]];
      if (v >= 4) lumps.push([9, 27, 6, 5]);
      const L = [-0.5, -0.66, 0.56];
      shade(g, -4, -6, 40, 40, r5, (fx, fy) => {
        for (let i = lumps.length - 1; i >= 0; i--) {
          const [x, y, rx, ry] = lumps[i], nx = (fx - x) / rx, ny = (fy - y) / ry, dd = nx * nx + ny * ny;
          if (dd > 1 || fy > y + ry * 0.62) continue;
          // quantize the normal into facets
          const a = Math.round(Math.atan2(ny, nx) / (PI / 3.5) + i * 0.3) * (PI / 3.5);
          const m = dd < 0.3 ? 0.35 : 0.85, fz = Math.sqrt(1 - m * m);
          let I = Math.cos(a) * m * L[0] + Math.sin(a) * m * L[1] + fz * L[2] - 0.05;
          if (fy > y + ry * 0.3) I -= 0.25;
          return I;
        }
        return null;
      }, 80 + v, 0.12, 5, 3);
      // cracks
      const [x, y] = main;
      line(g, x + 2, y - 2, x + 4, y + 3, r5[0], 1);
      line(g, x + 4, y + 3, x + 3, y + 5, r5[0], 1);
      R(g, x + 3, y - 2, 1, 1, r5[4]);
      if (info.snow) K.snowTops(g, -4, -6, 40, 32, M.snow, v, 3);
      else if (info.green && v % 2 === 0) K.snowTops(g, -4, -6, 40, 32, M.grass, v + 3, 2);
    },
    shadow: (v) => [17, 29, 15, 4, 0.34],
  });
})();
