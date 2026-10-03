/* Cases: the props at art resolution (draw2), in the world's prop style
 * (src/engine/27_propart.js): light from the upper left, hue-shifted ramps,
 * an ink outline (every one of these is something you can look at), a soft
 * contact shadow, cached sprites. Replaces the first pass's flat 16-px
 * drawings in 05_art.js (kept there as the fallback). The clues the props
 * carry stay legible: the bench's evenly spaced notches, the bell's notch in
 * its right shoulder, the empty bracket at the old landing. */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  if (!RB.propArt || !RB.propKit) return;
  const K = RB.propKit, art = RB.propArt.art;
  const { R, ell, poly, line, cyl, cylCol, streaks, ramp, hh } = K;
  const IR = K.FIX.iron, PP = K.FIX.paper, ST = K.FIX.straw, GL = K.FIX.glass, LQ = K.FIX.lacquer, INK = K.FIX.ink;
  const BRONZE = ramp('#8a7448', 0.5, 0.45), POLISHED = ramp('#b8944a', 0.5, 0.42);

  // ---- helpers (as in 28_propwork.js) ---------------------------------------------------------
  function post(g, x, y, w, h, r5) { cyl(g, x, y, w, h, r5); R(g, x, y, w, 1, r5[4]); if (w > 2) R(g, x + 1, y + 1, w - 2, 1, r5[3]); }
  function plank(g, x, y, w, h, r5, seed) {
    R(g, x, y, w, h, r5[3]); R(g, x, y, w, 1, r5[4]); R(g, x, y + h - 1, w, 1, r5[1]);
    if (h > 2) streaks(g, x + 1, y + 1, w - 2, h - 2, r5[2], seed, Math.max(1, (w / 6) | 0), 5);
  }
  // a tabletop seen from above-front: lit top with plank seams, then the apron
  function top(g, x, y, w, h, apron, r5, seed) {
    R(g, x, y, w, h, r5[3]); R(g, x, y, w, 1, r5[4]);
    for (let k = 4; k < h; k += 4) R(g, x + 1, y + k, w - 2, 1, r5[2]);
    streaks(g, x + 2, y + 1, w - 4, h - 2, r5[2], seed, Math.max(2, (w * h / 60) | 0), 6);
    R(g, x, y + h, w, apron, r5[1]); R(g, x, y + h, w, 1, r5[2]);
  }
  // writing is suggested, never imitated: short brush dashes
  function dashes(g, x, y, w, rows, col, seed) {
    for (let r = 0; r < rows; r++) for (let gx = x; gx < x + w - 2; gx += 4) { const k = hh(seed, r * 31 + gx, 7); R(g, gx, y + r * 3, 2 + (k % 2), 1, col); }
  }
  // a wrapped parcel: paper with a lit top, twine crossing it
  function parcel(g, x, y, w, h, seal) {
    R(g, x, y, w, h, PP[2]); R(g, x, y, w, 1, PP[4]); R(g, x, y + h - 1, w, 1, PP[1]); R(g, x + w - 1, y, 1, h, PP[1]);
    R(g, x + (w >> 1), y, 1, h, ST[1]); R(g, x, y + (h >> 1), w, 1, ST[1]);
    if (seal) { R(g, x + 1, y + 1, 3, 3, LQ[2]); R(g, x + 1, y + 1, 2, 1, LQ[4]); }
  }

  // ---- Saltglass quay: Hama's repair workbench (3×1) -----------------------------------------------
  // A heavy bench on the stone quay: thick planks, the front edge notched at even spacing (the clue),
  // a coil of rope, a cracked glass float in its net, a mallet, a saw and chisels, a vise at the end, a
  // toolbox and a sack on the low shelf. o.label: the old address label pinned to a stake at its left end.
  art('cs_workbench', {
    box: [-4, -20, 106, 56],
    v: (o) => (o.label ? 1 : 0),
    ink: true,
    draw(g, M, v) {
      const w5 = M.wood;
      // o.label: the old address label, pinned to a stake at the bench's left end (clear of whoever works there)
      if (v) { post(g, 3, -14, 2, 18, w5); R(g, 0, -16, 11, 9, PP[3]); R(g, 0, -16, 11, 1, PP[4]); R(g, 10, -16, 1, 9, PP[1]); dashes(g, 1, -13, 9, 2, INK[3], 5); R(g, 4, -17, 2, 2, LQ[3]); }
      // legs: the far pair in shadow, the near pair lit; a stretcher and a low shelf with a toolbox
      R(g, 10, 14, 3, 12, w5[0]); R(g, 83, 14, 3, 12, w5[0]);
      R(g, 8, 23, 80, 3, w5[2]); R(g, 8, 23, 80, 1, w5[3]); R(g, 8, 25, 80, 1, w5[1]);
      R(g, 54, 17, 18, 6, w5[1]); R(g, 54, 17, 18, 1, w5[3]); R(g, 54, 19, 18, 1, w5[0]); R(g, 61, 15, 4, 2, IR[2]); R(g, 61, 15, 4, 1, IR[4]);
      R(g, 18, 19, 8, 4, ST[2]); R(g, 18, 19, 8, 1, ST[3]); R(g, 20, 20, 4, 1, ST[1]);                                // a sack of oakum
      post(g, 4, 14, 4, 16, w5); post(g, 88, 14, 4, 16, w5);
      // the top, thick planks; its apron with the notches, evenly spaced along the front edge
      top(g, 2, 2, 92, 11, 5, w5, 7);
      for (let i = 0; i < 9; i++) { const nx = 7 + i * 10; R(g, nx, 13, 3, 3, w5[0]); R(g, nx, 13, 3, 1, INK[2]); R(g, nx + 3, 14, 1, 2, w5[3]); }
      // a coil of rope
      ell(g, 18, 6, 7, 3.6, ST[1]); ell(g, 18, 5.5, 6, 3, ST[3]); ell(g, 18, 5.5, 4, 2, ST[1]); ell(g, 18, 5.5, 3, 1.4, ST[2]); ell(g, 18, 5.5, 1.5, 0.8, w5[2]);
      R(g, 13, 4, 2, 1, ST[4]); R(g, 16, 3, 3, 1, ST[4]); line(g, 25, 7, 30, 10, ST[2], 1);
      // a mallet and a few shavings
      line(g, 34, 9, 43, 6, w5[4], 2); R(g, 42, 1, 7, 6, w5[1]); R(g, 42, 1, 7, 1, w5[3]); R(g, 42, 1, 1, 6, w5[2]);
      R(g, 51, 8, 2, 1, w5[4]); R(g, 53, 9, 1, 1, w5[4]); R(g, 47, 10, 2, 1, w5[4]);
      // the cracked glass float in its net
      ell(g, 68, 4, 6, 5.5, GL[1]); ell(g, 67, 3.5, 5, 4.5, GL[2]); ell(g, 66, 2.5, 3, 2.5, GL[3]); R(g, 64, 0, 2, 1, GL[4]); R(g, 64, 1, 1, 1, GL[4]);
      line(g, 69, -1, 71, 3, INK[2], 1); line(g, 71, 3, 70, 6, INK[2], 1);
      line(g, 62, 4, 74, 4, ST[1], 1); line(g, 68, -1, 68, 9, ST[1], 1); line(g, 63, 1, 73, 7, ST[1], 1);
      // a saw and two chisels laid by
      poly(g, [52, 2, 62, 2, 62, 5, 53, 7], IR[3]); R(g, 52, 2, 10, 1, IR[4]); R(g, 61, 1, 4, 4, w5[1]); R(g, 61, 1, 4, 1, w5[3]);
      line(g, 74, 9, 79, 7, IR[3], 1); R(g, 72, 9, 3, 2, w5[1]); line(g, 73, 11, 78, 10, IR[3], 1); R(g, 71, 11, 3, 2, w5[2]);
      // the vise at the end
      R(g, 81, -2, 11, 7, IR[2]); R(g, 81, -2, 11, 1, IR[4]); R(g, 81, 4, 11, 1, IR[0]);
      R(g, 79, -5, 4, 9, IR[3]); R(g, 79, -5, 4, 1, IR[4]); R(g, 82, -5, 1, 9, IR[1]);
      line(g, 92, 1, 97, 1, IR[3], 1); R(g, 96, -3, 2, 9, IR[4]); R(g, 96, -3, 1, 9, IR[2]);
    },
    shadow: () => [48, 29, 47, 3.5, 0.3],
  });

  // ---- the ferry's call bell on its post (1×1) ----------------------------------------------------------
  // A squared post on a stone footing with an arm and a brace; the bronze bell hangs from an iron hanger,
  // swinging a pixel, its pull rope below; the notch in its right shoulder (the clue). o.bright: polished.
  const BELL_ROWS = [1.5, 2.5, 3.5, 4.5, 5, 5, 5, 5.5, 5.5, 6, 6.5, 7, 7.5];
  art('cs_bellpost', {
    box: [-6, -46, 48, 82],
    v: (o) => (o.bright ? 1 : 0),
    f: (t, o) => K.frame(t, 520, 4, o.still),
    ink: true,
    draw(g, M, v, f) {
      const w5 = M.wood, s5 = M.stone, b5 = v ? POLISHED : BRONZE, sw = [0, 1, 0, -1][f];
      R(g, 2, 23, 16, 7, s5[2]); R(g, 2, 23, 16, 1, s5[4]); R(g, 2, 29, 16, 1, s5[0]); R(g, 9, 24, 1, 5, s5[1]);
      post(g, 7, -36, 5, 60, w5);
      R(g, 6, -38, 7, 2, w5[4]);
      plank(g, 7, -36, 26, 4, w5, 3);
      line(g, 12, -22, 23, -32, w5[2], 2); line(g, 12, -23, 22, -32, w5[3], 1);
      R(g, 26, -32, 2, 4, IR[2]); R(g, 26, -32, 2, 1, IR[4]);
      // the bell: crown loop, shoulders, waist, flared lip — shaded round, lit from the left
      const bx = 27 + sw, by = -28;
      R(g, bx - 1, by - 1, 2, 2, b5[1]);
      BELL_ROWS.forEach((hw, j) => {
        const a = Math.round(bx - hw), w = Math.round(hw * 2);
        for (let i = 0; i < w; i++) R(g, a + i, by + 1 + j, 1, 1, cylCol(i, w, b5));
      });
      R(g, bx - 7, by + 13, 15, 1, b5[0]);                                // the lip's shadowed rim
      R(g, bx - 4, by + 6, 9, 1, b5[1]); R(g, bx - 5, by + 10, 11, 1, b5[1]); // two cast bands
      R(g, bx + 3, by + 3, 1, 2, INK[1]); R(g, bx + 4, by + 3, 1, 1, b5[0]);  // the notch in its right shoulder
      if (v) { R(g, bx - 3, by + 3, 1, 4, '#fff4c8'); R(g, bx - 2, by + 2, 1, 1, '#fff4c8'); }
      // the clapper and the pull rope with its knot
      R(g, bx - 1 + sw, by + 14, 2, 2, IR[2]);
      line(g, bx + sw, by + 15, bx + sw * 2, -4, ST[2], 1);
      R(g, bx + sw * 2 - 1, -4, 3, 2, ST[3]); R(g, bx + sw * 2 - 1, -3, 3, 1, ST[1]);
    },
    shadow: () => [12, 29, 11, 3, 0.3],
  });

  // ---- River Warehouse: a low shelf of parcels nobody has claimed (o.parcel: one still waits) ---------------
  art('cs_shelf', {
    box: [-2, -14, 36, 48],
    v: (o) => (o.parcel ? 1 : 0),
    ink: true,
    draw(g, M, v) {
      const w5 = M.wood;
      R(g, 4, -9, 24, 38, w5[0]);                                        // the back, in shadow
      post(g, 2, -10, 3, 40, w5); post(g, 27, -10, 3, 40, w5);
      plank(g, 2, -10, 28, 3, w5, 2); plank(g, 2, 5, 28, 3, w5, 4); plank(g, 2, 26, 28, 3, w5, 6);
      parcel(g, 6, -4, 9, 9, false); parcel(g, 17, -1, 8, 6, false);
      parcel(g, 6, 15, 7, 11, false);
      if (v) parcel(g, 15, 18, 10, 8, true); else { R(g, 15, 25, 10, 1, w5[1]); R(g, 16, 24, 6, 1, w5[2]); }  // dust where it stood
    },
    shadow: () => [16, 30, 14, 2.5, 0.3],
  });

  // ---- East beach: the old landing's low stone footing and a post with an empty iron bracket (2×1) ----------
  art('cs_footing', {
    box: [-2, -30, 68, 64],
    ink: true,
    draw(g, M) {
      const s5 = M.stone, w5 = M.wood, sand = ramp('#d8c494', 0.45, 0.35);
      ell(g, 32, 28, 32, 3, sand[1]);
      // dressed stones in a row, mortar between, sand drifted against the foot
      for (let i = 0, x = 1; i < 5; i++) {
        const sw = [12, 11, 13, 10, 12][i];
        R(g, x, 15, sw, 13, s5[2]); R(g, x, 15, sw, 2, s5[4]); R(g, x, 17, sw, 1, s5[3]); R(g, x + sw - 1, 15, 1, 13, s5[1]); R(g, x, 27, sw, 1, s5[0]);
        if (i % 2) R(g, x + 3, 20, 3, 1, s5[1]);
        x += sw + 1;
      }
      R(g, 4, 24, 6, 2, '#5e7a4a'); R(g, 5, 23, 3, 1, '#7a9a5a'); R(g, 40, 25, 5, 2, '#5e7a4a');
      for (let x = 0; x < 64; x += 5) R(g, x + (x % 3), 26 + (x % 2), 4, 2, sand[2]);
      // the post, weathered grey, faded letters, the empty bracket
      const g5 = ramp('#8a8070', 0.45, 0.35);
      post(g, 49, -24, 5, 42, g5);
      streaks(g, 50, -20, 3, 36, g5[1], 9, 5, 6, true);
      dashes(g, 50, -14, 3, 4, g5[1], 3);
      R(g, 54, -22, 7, 2, IR[2]); R(g, 54, -22, 7, 1, IR[3]); R(g, 59, -22, 2, 6, IR[2]); R(g, 59, -17, 1, 1, '#8a5a3a');
    },
    shadow: () => [32, 29, 31, 3, 0.25],
  });

  // ---- Lighthouse window: a sketch on thin paper pinned so the light comes through it (o.gone: taken) -------
  art('cs_sketchwin', {
    box: [-2, -28, 36, 34],
    v: (o) => (o.gone ? 1 : 0),
    ink: true,
    draw(g, M, v) {
      const s5 = M.stone, w5 = M.wood, sky = ramp('#a8c8dc', 0.45, 0.4);
      R(g, 2, -26, 28, 28, s5[1]); R(g, 2, -26, 28, 1, s5[3]);
      R(g, 4, -24, 24, 24, w5[1]); R(g, 4, -24, 24, 1, w5[3]);
      R(g, 6, -22, 20, 20, sky[2]); R(g, 6, -22, 20, 6, sky[3]); R(g, 6, -22, 20, 2, sky[4]); R(g, 6, -6, 20, 4, sky[1]);
      R(g, 15, -22, 2, 20, w5[2]); R(g, 6, -13, 20, 2, w5[2]);
      if (!v) {
        R(g, 8, -20, 16, 14, 'rgba(250,244,226,0.86)');
        R(g, 8, -20, 16, 1, 'rgba(255,252,240,0.9)');
        line(g, 11, -16, 11, -10, '#8a8070', 1); R(g, 14, -13, 3, 3, '#8a8070'); line(g, 20, -17, 21, -9, '#8a8070', 1); line(g, 18, -15, 22, -15, '#8a8070', 1);
        R(g, 15, -21, 2, 2, LQ[3]);
      } else R(g, 15, -21, 2, 2, IR[3]);
      R(g, 2, 0, 28, 3, s5[3]); R(g, 2, 0, 28, 1, s5[4]); R(g, 2, 2, 28, 1, s5[0]);
    },
  });

  // ---- Star Stair: the framed sketch on a short post by the stone seat -----------------------------------------
  art('cs_frame', {
    box: [-2, -26, 36, 60],
    ink: true,
    draw(g, M) {
      const w5 = M.wood;
      post(g, 14, -4, 4, 33, w5);
      R(g, 3, -22, 26, 20, w5[1]); R(g, 3, -22, 26, 1, w5[3]); R(g, 3, -22, 1, 20, w5[2]); R(g, 28, -22, 1, 20, w5[0]);
      R(g, 5, -20, 22, 16, PP[3]); R(g, 5, -20, 22, 1, PP[4]); R(g, 5, -5, 22, 1, PP[1]);
      // the sketch: a lantern on its post, a small shrine, a bare tree
      R(g, 9, -15, 1, 9, '#6a6258'); R(g, 8, -17, 3, 3, '#e0b050'); R(g, 8, -17, 3, 1, '#7a6a50');
      R(g, 14, -11, 6, 5, '#8a6a4a'); poly(g, [13, -11, 21, -11, 17, -14], '#5a4a3a');
      line(g, 23, -18, 23, -6, '#6a6258', 1); line(g, 23, -14, 21, -16, '#6a6258', 1); line(g, 23, -12, 25, -14, '#6a6258', 1);
      R(g, 2, -24, 28, 2, '#e8e8f0'); R(g, 2, -24, 28, 1, '#ffffff');      // snow along the frame's top
    },
    shadow: () => [16, 29, 7, 2.5, 0.3],
  });

  // ---- a flat stone someone keeps clear of snow: a place to stand and look -------------------------------------
  art('cs_viewstone', {
    box: [-2, 2, 36, 32],
    ink: true,
    draw(g, M) {
      const s5 = M.stone, sn = M.snow;
      ell(g, 16, 20, 15, 8, sn[2]); ell(g, 16, 19, 14, 7, sn[3]);
      ell(g, 16, 19, 12, 6, s5[1]); ell(g, 15, 18, 11, 5, s5[2]); ell(g, 14, 17, 8, 3, s5[3]); R(g, 9, 15, 6, 1, s5[4]);
      R(g, 20, 21, 4, 1, s5[0]); R(g, 6, 20, 3, 1, s5[0]);
      R(g, 3, 23, 4, 1, sn[4]); R(g, 25, 15, 4, 1, sn[4]);
    },
    shadow: () => [16, 26, 14, 3, 0.2],
  });
})();
