/* The long quests' landmarks at art resolution (draw2), in the world's prop
 * style (src/engine/26–28_*.js, as the case props in src/content/cases/06_art2.js):
 * light from the upper left, hue-shifted ramps per material, clustered
 * shading, a soft contact shadow, cached sprites. The flat 16-px drawings in
 * 10_data.js stay as the fallback. World review WR-04.
 * What each keeps (the story points at it):
 *  - lq_kaki: the old tree's scale, the fruit nobody picks, and the four
 *    height marks cut into the trunk's lit face (kept clear of bark texture);
 *  - lq_kaki_young: Kayo's young tree — smaller, slender, staked, mostly green;
 *  - lq_namestone: carving in columns that reads as carving (incised dashes,
 *    never letter shapes), no new marks that could pass for a clue;
 *  - lq_teastall: the counter and awning, the kettle, and the row of thick
 *    cups with the one kept upside down (first in the row, as before).
 * Footprints, blocking, placements and scenes are unchanged
 * (tests/e2e/landmarks.mjs checks them against the record made before). */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  if (!RB.propArt || !RB.propKit) return;
  const K = RB.propKit, art = RB.propArt.art;
  const { R, ell, poly, line, cyl, cylCol, streaks, mix, ramp, hh } = K;
  const IR = K.FIX.iron, ST = K.FIX.straw, CL = K.FIX.clay, EM = K.FIX.ember, LQ = K.FIX.lacquer; // (iron, straw, clay, embers, lacquer)
  const BARK = ramp('#5a463e', 0.5, 0.44);          // old persimmon bark: dark, greyed, blocky
  const YBARK = ramp('#7a6656', 0.45, 0.4);         // a young tree's smooth bark
  const AUTUMN = ['#44202a', '#71302c', '#9c4a30', '#c47038', '#e6a256']; // the old tree's leaves, turned red
  const FRUIT = ['#7c2a12', '#c24c16', '#ee7a24', '#ffac4a', '#ffe2a0'];
  const CALYX = '#3e4424';
  const CUT = '#d6c6a2';                            // wood exposed by a blade, greyed with age
  // the campaign's state for the two landmarks that change once their quest is over (same placement, a variant)
  const done = (q) => { const s = RB.game && RB.game.s; return !!(s && RB.state && RB.state.test(s, 'quest.' + q + '=done')); };

  // ---- shared helpers ------------------------------------------------------------------------
  // A limb: a thick line shaded round (lit on its upper-left side).
  function limb(g, x0, y0, x1, y1, w, r5) {
    const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1;
    // the edge facing the light: offset toward the upper left, perpendicular to the limb
    let nx = -dy / L, ny = dx / L;
    if (nx + ny > 0) { nx = -nx; ny = -ny; }
    const o = Math.max(0, (w - 1) / 2);
    line(g, x0, y0, x1, y1, r5[1], w);
    if (w > 2) line(g, x0 + nx * 0.5, y0 + ny * 0.5, x1 + nx * 0.5, y1 + ny * 0.5, r5[2], w - 2);
    line(g, x0 + nx * o, y0 + ny * o, x1 + nx * o, y1 + ny * o, r5[3], 1);
    if (w > 3) line(g, x0 - nx * o, y0 - ny * o, x1 - nx * o, y1 - ny * o, r5[0], 1);
  }
  // A fruit: a squat round with a dark calyx, lit from the upper left; s = 5 (old tree) or 4 (young).
  function fruit(g, x, y, s) {
    const F = FRUIT;
    if (s >= 5) {
      R(g, x + 1, y, 3, 1, F[2]); R(g, x, y + 1, 5, 3, F[2]); R(g, x + 1, y + 4, 3, 1, F[1]);
      R(g, x, y + 3, 1, 1, F[1]); R(g, x + 4, y + 2, 1, 2, F[1]); R(g, x + 3, y + 4, 1, 1, F[0]);
      R(g, x + 1, y + 1, 2, 1, F[3]); R(g, x + 1, y + 2, 1, 1, F[4]);
      R(g, x + 1, y - 1, 3, 1, CALYX); R(g, x + 2, y - 2, 1, 1, '#5a4a2a');
    } else {
      R(g, x, y + 1, 4, 2, F[2]); R(g, x + 1, y, 2, 1, F[2]); R(g, x + 1, y + 3, 2, 1, F[1]); R(g, x + 3, y + 2, 1, 1, F[1]);
      R(g, x + 1, y + 1, 1, 1, F[4]); R(g, x + 1, y - 1, 2, 1, CALYX);
    }
  }
  // Fallen leaves and the odd fallen fruit on the ground (drawn under the sprite).
  function litter(g, r5, seed, n, x0, y0, w, h, fruits) {
    for (let i = 0; i < n; i++) {
      const r = hh(seed, i, 41), x = x0 + (r % w), y = y0 + ((r >>> 6) % h);
      R(g, x, y, 2, 1, r5[2 + ((r >>> 12) % 3)]); R(g, x + ((r >>> 14) & 1 ? 2 : -1), y + 1, 1, 1, r5[1]);
    }
    for (const [x, y] of fruits || []) { R(g, x, y, 3, 2, FRUIT[1]); R(g, x, y, 2, 1, FRUIT[3]); R(g, x + 2, y + 1, 1, 1, FRUIT[0]); }
  }

  // ---- the great persimmon of Koharuno (2×2) -------------------------------------------------------
  // A wide, low, old crown leaning away from the house beside it, thinning: the leaves turned and
  // falling, the fruit glowing along every branch, bare twigs hung with fruit under the crown. The
  // trunk is short and thick, gnarled, with a knot hole and buttress roots; its bark is blocky except
  // on the lit face where a child's height was cut, four times, from low down upward.
  const KAKI_MARKS = [[51, 7], [45, 8], [39, 7], [33, 8]]; // the height marks: y of each cut and its length (four, as in the first drawing)
  const kakiL = (y) => 22.5 + (60 - y) * 0.06 + Math.sin(y / 6.5) * 0.7 - Math.max(0, y - 50) * Math.max(0, y - 50) * 0.06;
  const kakiR = (y) => 40 + (60 - y) * 0.08 + Math.sin(y / 5 + 1) * 0.6 + Math.max(0, y - 50) * Math.max(0, y - 50) * 0.06;
  const KAKI_FRUIT = [
    // along the crown's outer clumps
    [22, -58], [40, -60], [6, -44], [56, -46], [72, -32], [-6, -26], [18, -38], [36, -42], [48, -30], [64, -18],
    [80, -14], [8, -14], [26, -22], [42, -14], [58, -4], [74, -2], [2, -2], [16, 0], [30, -32], [84, -2],
    // hanging from bare twigs under the crown
    [64, 14], [71, 12], [78, 15], [8, 12],
  ];
  // The crown: soft leaf clumps in rows filling a wide, low dome that leans right (away from the
  // house), back to front, as the world's broadleaf trees are built (src/engine/27_propart.js);
  // the middle clump of the lowest row is small and set aside where it has thinned over the fork.
  const CROWN = (function () {
    const cl = [], cx = 39, cy = -22, A = 44, B = 31;
    const rows = [[-0.8, 2, 0.5, 0.06], [-0.45, 4, 0.86, 0.03], [-0.05, 5, 1, 0], [0.35, 4, 0.92, -0.04], [0.72, 3, 0.8, -0.1]];
    let n = 0;
    rows.forEach(([ry, cnt, span, k], ri) => {
      for (let i = 0; i < cnt; i++) {
        const r = hh(77, n++, 21), u = cnt === 1 ? 0 : (i / (cnt - 1)) * 2 - 1;
        const thin = ri === 4 && i === 1;                                   // thinned: the fork shows beside it
        cl.push({ x: cx + u * A * span * 0.78 + ((r % 5) - 2) * 0.7 + (thin ? -9 : 0), y: cy + ry * B + (((r >>> 4) % 5) - 2) * 0.6 + (thin ? -3 : 0), r: thin ? 7 : 11.5 + ((r >>> 8) % 3) * 0.8 - (ri === 4 ? 2.5 : 0), k });
      }
    });
    return cl.sort((a, b) => a.y - b.y);
  })();
  art('lq_kaki', {
    sway: 0.5,
    box: [-24, -76, 120, 146],
    v: () => (done('lq_road') ? 1 : 0),              // after the long road home: one fresh cut above the old ones (lq.kh_tree says so)
    draw(g, M, v) {
      const r5 = BARK;
      // the bole: rows between two edges, shaded as a cylinder; blocky bark plates, except on
      // the lit face where the height marks are (that stays smooth, so the marks read)
      for (let y = 6; y < 61; y++) {
        const a = Math.round(kakiL(y)), b = Math.round(kakiR(y)), w = b - a;
        for (let i = 0; i < w; i++) {
          let k = r5.indexOf(cylCol(i, w, r5));
          const u = (i + 0.5) / w, x = a + i;
          const face = u > 0.1 && u < 0.52 && y > 28 && y < 56;
          // furrows: vertical runs broken by horizontal cracks into plates (darker in the shade)
          const col = Math.floor((x + 1) / 4), row = Math.floor((y + (col % 2) * 3) / 5);
          const fx = (x + 1) % 4 === 0, fy = (y + (col % 2) * 3) % 5 === 0 && hh(col, row, 13) % 3 !== 0;
          if (!face && (fx || fy) && k > 0) k = Math.max(0, k - (k >= 3 ? 1 : 2));
          else if (face && fx && hh(col, row, 17) % 4 === 0) k = Math.max(2, k - 1);
          R(g, x, y, 1, 1, r5[k]);
        }
      }
      // buttress roots: short flares into the ground, shaded round
      poly(g, [23, 47, 26, 63, 11, 64, 14, 61, 20, 56], r5[3]); line(g, 12, 63, 19, 57, r5[4], 1); line(g, 12, 64, 25, 63, r5[1], 1);
      poly(g, [40, 47, 47, 57, 53, 64, 37, 63], r5[1]); line(g, 41, 50, 52, 63, r5[0], 1);
      poly(g, [28, 57, 34, 57, 33, 65, 27, 65], r5[2]); R(g, 28, 57, 2, 7, r5[3]);
      // a knot hole on the shaded side, its lower lip catching light
      ell(g, 37, 20, 2.6, 3.2, r5[0]); R(g, 35.5, 23, 3, 1, r5[3]); R(g, 34, 17, 1, 2, r5[1]);
      // the height marks: a blade cut, the pale wood beneath, a shadow under each; a nick where the blade went in
      for (const [y, n] of KAKI_MARKS) {
        const a = Math.round(kakiL(y)) + 2;
        R(g, a, y, n, 1, CUT); R(g, a + 1, y + 1, n - 1, 1, r5[0]); R(g, a - 1, y, 1, 2, r5[1]);
      }
      if (v) { const y = 27, a = Math.round(kakiL(y)) + 2; R(g, a, y, 8, 1, '#f2e2b8'); R(g, a + 1, y + 1, 7, 1, r5[0]); R(g, a - 1, y, 1, 2, r5[1]); } // the new cut: still pale
      // the main limbs: forking low and spreading wide (mostly hidden in the crown)
      limb(g, 27, 12, 21, 3, 7, r5); limb(g, 21, 3, 12, -8, 5, r5);
      limb(g, 31, 10, 34, 0, 6, r5); limb(g, 34, 0, 32, -16, 4, r5);
      limb(g, 37, 12, 45, 3, 7, r5); limb(g, 45, 3, 56, -8, 5, r5);
      limb(g, 40, 16, 53, 13, 4, r5); limb(g, 53, 13, 66, 9, 3, r5); limb(g, 66, 9, 80, 10, 2, r5);
      limb(g, 24, 16, 15, 13, 4, r5); limb(g, 15, 13, 8, 8, 2, r5);
      // the crown
      K.foliage(g, CROWN, AUTUMN, 777, { ao: 0.5 });
      // where it has thinned: the fork in a gap, and bare twig tips past the leaves
      for (const [x0, y0, x1, y1] of [[26, -60, 23, -68], [46, -60, 50, -70], [70, -42, 78, -48], [-4, -30, -12, -34], [88, -8, 94, -12], [-6, -12, -14, -14]]) line(g, x0, y0, x1, y1, r5[1], 1);
      // bare twigs under the crown, hung with fruit
      for (const [x0, y0, x1, y1] of [[66, 10, 65, 14], [72, 10, 72, 12], [78, 10, 79, 15], [10, 9, 9, 12]]) line(g, x0, y0, x1, y1, r5[2], 1);
      for (const [x, y] of KAKI_FRUIT) fruit(g, x, y, 5);
    },
    ground(g, M) { litter(g, AUTUMN, 41, 16, -8, 56, 84, 12, [[12, 64], [52, 66], [62, 61]]); },
    shadow: () => [36, 61, 40, 9, 0.32],
  });

  // ---- Kayo's young persimmon in the Garden Quarter (1×1) ------------------------------------------
  // Grown from a seed she carried as a child: a slender, straight young trunk tied to a bamboo stake,
  // a few branches reaching up, an open crown of large glossy leaves just starting to turn, and only
  // a little fruit so far. A small bed of turned earth round its foot.
  const YOUNG_LEAF = ['#2c3e2c', '#4c5e34', '#748a40', '#a4a850', '#dccc78'];
  art('lq_kaki_young', {
    sway: 0.5,
    box: [-14, -54, 60, 92],
    draw(g, M) {
      const r5 = YBARK, bam = ramp('#a8a85a', 0.45, 0.4);
      // the stake: bamboo with nodes, behind the trunk
      R(g, 10, -10, 2, 40, bam[2]); R(g, 10, -10, 1, 40, bam[3]); for (const y of [-2, 9, 20]) R(g, 9, y, 4, 1, bam[1]);
      // the trunk: slender, almost straight, smooth young bark
      for (let y = -12; y < 29; y++) {
        const a = Math.round(15 + Math.sin(y / 11) * 0.6 - (y > 24 ? 1 : 0)), w = y < 2 ? 3 : y > 24 ? 6 : 4;
        for (let i = 0; i < w; i++) R(g, a + i, y, 1, 1, cylCol(i, w, r5));
      }
      // ties of straw twine to the stake
      for (const y of [4, 16]) { R(g, 10, y, 8, 2, ST[2]); R(g, 10, y, 8, 1, ST[3]); R(g, 17, y + 1, 1, 2, ST[1]); }
      // branches reaching up and out
      limb(g, 16, 6, 6, -14, 3, r5); limb(g, 17, 0, 27, -18, 3, r5); limb(g, 16, -10, 15, -30, 2, r5);
      limb(g, 17, 10, 26, 0, 2, r5); limb(g, 15, -4, 8, -26, 2, r5);
      // an open crown of separate leaf clusters (each one a few large leaves)
      const cl = [
        { x: 15, y: -38, r: 6 }, { x: 7, y: -30, r: 6 }, { x: 24, y: -30, r: 6.5 },
        { x: 3, y: -18, r: 6, k: -0.04 }, { x: 15, y: -22, r: 5.5 }, { x: 28, y: -18, r: 6.5 },
        { x: 6, y: -8, r: 5, k: -0.08 }, { x: 27, y: -4, r: 5.5, k: -0.08 },
      ];
      K.foliage(g, cl, YOUNG_LEAF, 313, { ao: 0.4, lobe: 0.12, cw: 5, ch: 3 });
      // single large leaves at the clusters' edges (pointed ovals), and a glint where they are glossy
      cl.forEach((c, i) => {
        for (const a of [-2.5, -1.2, 0.3, 2.2]) {
          const r = hh(i, Math.round(a * 10), 5);
          if (r % 3 === 0) continue;
          const lx = Math.round(c.x + Math.cos(a) * (c.r + 0.5)), ly = Math.round(c.y + Math.sin(a) * (c.r + 0.5)), dir = Math.cos(a) < 0 ? -1 : 1;
          const col = a < 0 ? YOUNG_LEAF[3] : YOUNG_LEAF[1];
          R(g, lx, ly, 2, 1, col); R(g, lx + dir, ly + 1, 2, 1, a < 0 ? YOUNG_LEAF[2] : YOUNG_LEAF[0]); R(g, lx + dir * 2, ly + (a < 0 ? -1 : 1), 1, 1, col);
        }
        R(g, Math.round(c.x - c.r * 0.4), Math.round(c.y - c.r * 0.45), 2, 1, YOUNG_LEAF[4]);
      });
      // a leaf or two turning, a little fruit (three, as in the first drawing)
      R(g, 25, -34, 2, 1, AUTUMN[3]); R(g, 1, -21, 2, 1, AUTUMN[3]); R(g, 30, -8, 2, 1, AUTUMN[2]);
      fruit(g, 10, -12, 4); fruit(g, 22, -12, 4); fruit(g, 26, 2, 4);
    },
    ground(g, M) {
      const soil = ramp('#6a5040', 0.45, 0.35);
      ell(g, 16, 29, 12, 4, soil[1]); ell(g, 15, 28.5, 10, 3, soil[2]);
      for (let i = 0; i < 7; i++) { const r = hh(91, i, 3), x = 6 + (r % 20), y = 27 + ((r >>> 5) % 4); R(g, x, y, 2, 1, (r >>> 9) & 1 ? ST[2] : soil[3]); }
      litter(g, YOUNG_LEAF, 17, 3, 2, 30, 26, 3);
    },
    shadow: () => [17, 30, 12, 3.5, 0.3],
  });

  // ---- the stone of names (2×1) ------------------------------------------------------------------------
  // A broad natural slab, dressed flat on its face, standing on a low plinth: its thickness shows along
  // its uneven crown and down its shaded right side; age in the lichen, the moss on its crown and at its
  // foot, a chipped shoulder and a hairline crack. The names are cut in columns, as they would be:
  // incised dashes (a dark groove and its lit edge), a longer heading column on the right, none of it
  // shaped like writing. The words themselves are in the scene.
  const TOP = [7, -16, 10, -27, 19, -33, 30, -33, 37, -29, 45, -27, 52, -21, 55, -12];
  const FACE = TOP.concat([56, 19, 7, 19]);
  const CROWN_BAND = TOP.concat(TOP.slice().reduceRight((acc, v, i, arr) => (i % 2 ? acc.push(arr[i - 1] + 4, v - 8) : 0, acc), []));
  art('lq_namestone', {
    ink: true,
    box: [-6, -52, 78, 88],
    draw(g, M) {
      const s5 = ramp(mix(M.stone[0], '#a49c88', 0.3), 0.5, 0.4), moss = ramp('#5e7a3e', 0.45, 0.4), lich = ramp('#b8b47a', 0.4, 0.3);
      // the plinth: one low course of dressed stone, top lit, front in half-shade, its right end darker
      R(g, 2, 17, 60, 13, s5[1]); R(g, 2, 17, 60, 5, s5[3]); R(g, 2, 17, 60, 1, s5[4]); R(g, 3, 22, 58, 7, s5[2]);
      R(g, 2, 29, 60, 1, s5[0]); R(g, 61, 17, 1, 13, s5[0]); R(g, 58, 22, 3, 7, s5[1]); R(g, 28, 22, 1, 7, s5[1]);
      // the slab's thickness: its crown (lit, following the uneven top) and its right side (in shade)
      K.shade(g, 6, -44, 56, 34, s5, (fx, fy) => (inPoly(CROWN_BAND, fx, fy) ? 0.98 - (fx - 10) * 0.012 : null), 61, 0.2, 3, 2);
      line(g, 14, -35, 23, -41, s5[4], 1); line(g, 23, -41, 34, -41, s5[4], 1);
      poly(g, [55, -12, 59, -20, 62, -12, 62, 15, 56, 19], s5[1]);
      R(g, 61, -9, 1, 24, s5[0]); R(g, 58, 2, 1, 7, s5[0]); R(g, 57, -12, 1, 30, mix(s5[1], s5[2], 0.5));
      // the face, dressed flat but not polished: a gentle swell, the lower part damper and darker
      K.shade(g, 6, -34, 52, 54, s5, (fx, fy) => {
        if (!inPoly(FACE, fx, fy)) return null;
        const u = (fx - 31) / 24, v = (fy + 6) / 26;
        return 0.24 - u * 0.2 - v * 0.06 - Math.max(0, fy - 8) * 0.012;
      }, 59, 0.1, 4, 3);
      // the arris where crown and face meet catches the light
      for (let i = 0; i + 3 < TOP.length; i += 2) line(g, TOP[i], TOP[i + 1], TOP[i + 2], TOP[i + 3], i < 8 ? s5[4] : s5[3], 1);
      // a chip off the right shoulder, a hairline crack from the crown
      poly(g, [45, -27, 52, -21, 47, -22], s5[1]); R(g, 48, -23, 2, 1, s5[0]);
      line(g, 13, -29, 12, -23, s5[0], 1); line(g, 12, -23, 14, -18, s5[0], 1);
      // the inscription: columns of incised dashes, read right to left; the heading column on the right
      const cols = [[45, -21, 8, 3], [39, -23, 9, 2], [34, -24, 6, 2], [29, -25, 10, 2], [24, -25, 5, 2], [19, -22, 8, 2]];
      cols.forEach(([x, y0, n, h0], ci) => {
        let y = y0;
        for (let i = 0; i < n && y < 9; i++) {
          const r = hh(ci, i, 29), h = h0 + (r % 2);
          R(g, x, y, 1, h, s5[0]); R(g, x + 1, y, 1, h, s5[4]);
          y += h + 1 + ((r >>> 7) % 2);
        }
      });
      // lichen, moss on the crown and creeping up from the foot
      for (const [x, y, w] of [[11, -8, 3], [50, 4, 2], [26, 11, 3]]) { R(g, x, y, w, 2, lich[2]); R(g, x, y, w - 1, 1, lich[3]); }
      K.snowTops(g, 6, -44, 58, 16, moss, 7, 2);
      for (let x = 7; x < 56; x++) { const r = hh(x, 3, 61); if (r % 3) R(g, x, 18 - (r % 4), 1, 1 + (r % 4), moss[1 + ((r >>> 4) % 3)]); }
      R(g, 3, 17, 5, 1, moss[2]); R(g, 56, 17, 5, 1, moss[1]);
    },
    ground(g, M) {
      const gr = M.grass;
      for (let i = 0; i < 9; i++) { const r = hh(73, i, 5), x = ((r % 6) * 12) + ((r >>> 4) % 4) - 2, y = 27 + ((r >>> 8) % 3); R(g, x, y, 1, 3, gr[1]); R(g, x + 1, y - 1, 1, 4, gr[3]); R(g, x + 2, y + 1, 1, 2, gr[2]); }
    },
    shadow: () => [34, 29, 32, 4, 0.34],
  });
  function inPoly(pts, x, y) {
    let inside = false;
    for (let i = 0, j = pts.length / 2 - 1; i < pts.length / 2; j = i++) {
      const xi = pts[2 * i], yi = pts[2 * i + 1], xj = pts[2 * j], yj = pts[2 * j + 1];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }

  // ---- Chigusa's tea stall on the Snowbell road (2×1) ------------------------------------------------
  // A short plank counter under a striped cloth awning on squared posts with corner braces, snow on the
  // awning. On the counter (the working surface): a clay brazier with live charcoal and an iron kettle
  // on it (steam rises), a tin tea caddy, a dark tray with the row of thick glazed cups — the first one
  // kept upside down, its unglazed foot on top. A charcoal bucket at the foot of the left post.
  const CUP = ramp('#9cb4a4', 0.5, 0.4);            // a thick celadon-glazed cup
  const FOOT = ramp('#b89a78', 0.45, 0.35);         // the unglazed foot ring
  const CLOTH_R = ramp('#9e4a3a', 0.5, 0.38), CLOTH_W = ramp('#e2d6c0', 0.4, 0.3);
  function cupUp(g, x, y) {                          // upright: a lit rim round the dark tea inside
    for (let i = 0; i < 6; i++) R(g, x + i, y + 2, 1, 6, cylCol(i, 6, CUP));
    R(g, x, y, 6, 3, CUP[4]); R(g, x + 1, y + 1, 4, 2, '#2a1e16'); R(g, x + 1, y + 1, 2, 1, '#4c3a26');
    R(g, x, y + 3, 6, 1, CUP[3]); R(g, x + 1, y + 8, 4, 1, FOOT[1]);
  }
  function cupDown(g, x, y) {                        // upside down: the unglazed foot ring on top, the rim at the bottom
    R(g, x + 1, y + 1, 4, 2, FOOT[2]); R(g, x + 1, y + 1, 4, 1, FOOT[4]); R(g, x + 4, y + 2, 1, 1, FOOT[0]); R(g, x + 2, y + 2, 2, 1, FOOT[1]);
    for (let i = 0; i < 6; i++) R(g, x + i, y + 3, 1, 5, cylCol(i, 6, CUP));
    R(g, x, y + 3, 6, 1, CUP[2]); R(g, x - 1, y + 7, 8, 2, CUP[1]); R(g, x - 1, y + 7, 8, 1, CUP[2]);
  }
  art('lq_teastall', {
    ink: true,
    box: [-12, -62, 88, 98],
    v: () => (done('lq_fare') ? 1 : 0),              // once the old fare is paid, every cup faces up ("They all face up now.")
    f: (t, o) => K.frame(t, 420, 4, o.still),
    draw(g, M, v, f, info) {
      const w5 = M.wood;
      // the back posts (behind the counter) and the front posts with corner braces
      cyl(g, 7, -40, 3, 44, w5); cyl(g, 54, -40, 3, 44, w5);
      for (const x of [1, 60]) { cyl(g, x, -40, 4, 66, w5); R(g, x, -40, 4, 1, w5[4]); }
      line(g, 5, -28, 12, -36, w5[2], 2); line(g, 59, -28, 52, -36, w5[1], 2);
      // the awning: the cloth's sloping top (lit), the striped valance hanging from its front edge
      // (in half-shade, folds lit on the left) with a scalloped hem, a shadow under it
      poly(g, [-4, -42, 68, -42, 64, -54, 0, -54], CLOTH_W[3]);
      for (let i = 0; i < 6; i++) {
        const x0 = -6 + i * 12.7, x1 = x0 + 12.7, C5 = i % 2 ? CLOTH_W : CLOTH_R, a = Math.round(x0), w = Math.round(x1) - a;
        poly(g, [x0 + 2 + (i * 0.3), -54, x1 + 2 - ((6 - i) * 0.3), -54, x1, -43, x0, -43], C5[i % 2 ? 4 : 3]);
        R(g, a, -43, w, 8, C5[2]); R(g, a, -43, 2, 8, C5[3]); R(g, a + w - 2, -43, 2, 8, C5[1]); R(g, a, -43, w, 1, C5[4]);
        for (let k = 0; k < w; k++) { const d = Math.abs(k - w / 2) / (w / 2); R(g, a + k, -35, 1, d < 0.75 ? 2 : 1, C5[d < 0.75 ? 2 : 1]); }
      }
      R(g, -4, -54, 68, 1, CLOTH_W[4]);
      R(g, 5, -33, 50, 1, 'rgba(30,20,30,0.35)');
      // rope ties at the awning's front corners
      for (const x of [-3, 65]) { R(g, x, -44, 2, 4, ST[1]); R(g, x, -44, 1, 4, ST[2]); R(g, x + 1, -40, 1, 3, ST[0]); }
      // the counter: thick planked top (the working surface) over a panelled front
      R(g, 0, 10, 64, 20, w5[1]);
      for (let i = 0; i < 6; i++) { const x = 2 + i * 10; R(g, x, 12, 9, 15, w5[2]); R(g, x, 12, 1, 15, w5[3]); R(g, x + 8, 12, 1, 15, w5[0]); streaks(g, x + 2, 13, 5, 13, w5[1], 40 + i, 2, 5, true); }
      R(g, 0, 27, 64, 3, w5[0]); R(g, 0, 26, 64, 1, w5[2]);
      R(g, -2, 3, 68, 7, w5[3]); R(g, -2, 3, 68, 1, w5[4]); R(g, -2, 9, 68, 1, w5[1]); R(g, -2, 10, 68, 1, w5[0]);
      streaks(g, 0, 4, 64, 4, w5[2], 33, 7, 7);
      // the clay brazier, live charcoal at its mouth, the iron kettle on its trivet
      for (let i = 0; i < 14; i++) R(g, 3 + i, -2, 1, 10, cylCol(i, 14, CL));
      R(g, 3, -3, 14, 1, CL[4]); R(g, 6, 3, 8, 3, '#1c1210'); R(g, 7, 4, 2, 2, EM[2 + (f % 2)]); R(g, 10, 4, 3, 1, EM[3]); R(g, 11, 5, 1, 1, EM[1]);
      for (let y = -12; y < -2; y++) {
        const hw = Math.round(6 * Math.sqrt(Math.max(0, 1 - Math.pow((y + 6.5) / 6, 2)))) + 1;
        for (let i = 0; i < hw * 2; i++) R(g, 10 - hw + i, y, 1, 1, cylCol(i, hw * 2, IR));
      }
      R(g, 7, -13, 6, 1, IR[3]); R(g, 9, -14, 2, 1, IR[4]);                       // lid and knob
      line(g, 16, -7, 20, -10, IR[2], 2); R(g, 20, -11, 1, 1, IR[3]);             // spout
      line(g, 4, -12, 10, -18, IR[1], 1); line(g, 10, -18, 16, -12, IR[1], 1);   // the bail handle
      R(g, 6, -9, 1, 3, IR[4]);
      // a tin tea caddy
      cyl(g, 22, -6, 5, 10, ramp('#8a8c90', 0.45, 0.45)); R(g, 22, -7, 5, 1, '#c8ccd0');
      // the dark tray and the row of thick cups: the first kept upside down
      R(g, 29, 3, 32, 3, LQ[1]); R(g, 29, 3, 32, 1, LQ[3]); R(g, 29, 5, 32, 1, LQ[0]);
      if (v) cupUp(g, 32, -4); else cupDown(g, 31, -4);
      for (const x of [39, 46, 53]) cupUp(g, x, -4);
      // a charcoal bucket at the left post's foot
      for (let i = 0; i < 9; i++) R(g, -9 + i, 20, 1, 9, cylCol(i, 9, w5));
      R(g, -9, 22, 9, 1, IR[2]); R(g, -9, 27, 9, 1, IR[2]); R(g, -8, 19, 7, 2, K.FIX.char[1]); R(g, -6, 19, 2, 1, K.FIX.char[3]);
      if (info.snow) {
        K.snowTops(g, -6, -58, 76, 18, M.snow, 5, 3);
      }
    },
    // steam from the kettle's spout (after the outline: it has none)
    over(g, M, v, f) {
      const a = [0.5, 0.42, 0.34, 0.26][f];
      for (let k = 0; k < 3; k++) { const y = -14 - f * 2 - k * 4, x = 21 + Math.round(Math.sin((f + k) * 1.3) * 1.5) + k; R(g, x, y, 2, 2, 'rgba(240,244,248,' + (a - k * 0.1).toFixed(2) + ')'); }
    },
    ground(g, M, v, f, info) {
      if (!info.snow) return;
      const sn = M.snow;
      ell(g, 32, 30, 34, 3, sn[2]); ell(g, 20, 29.5, 10, 2, sn[3]); ell(g, 50, 29.5, 9, 2, sn[3]);
    },
    shadow: () => [32, 30, 34, 4, 0.32],
  });
})();
