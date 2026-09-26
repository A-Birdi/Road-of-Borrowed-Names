/* Prop art at art resolution, part two: wood and stone construction,
 * furniture, interactable things and animated props (see 27_propart.js for
 * the rules and the art() helper). */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const K = RB.propKit, art = RB.propArt.art;
  const { R, ell, poly, line, cyl, cylCol, streaks, mix, ramp, hh } = K;
  const PI = Math.PI;
  const cxy = (o) => hh(o.cx | 0, o.cy | 0, 5);
  const IR = K.FIX.iron, BR = K.FIX.brass, PP = K.FIX.paper, GL = K.FIX.glow, INK = K.FIX.ink;

  // ---- construction helpers ----------------------------------------------------------------
  // Plank with a lit top edge, a dark lower edge and grain streaks.
  function plank(g, x, y, w, h, r5, seed, vertical) {
    R(g, x, y, w, h, r5[3]);
    if (vertical) {
      R(g, x, y, 1, h, r5[4]); R(g, x + w - 1, y, 1, h, r5[1]);
      if (w > 2) streaks(g, x + 1, y + 1, w - 2, h - 2, r5[2], seed, Math.max(1, (h / 5) | 0), 4, true);
    } else {
      R(g, x, y, w, 1, r5[4]); R(g, x, y + h - 1, w, 1, r5[1]);
      if (h > 2) streaks(g, x + 1, y + 1, w - 2, h - 2, r5[2], seed, Math.max(1, (w / 6) | 0), 5);
    }
  }
  const nail = (g, x, y) => R(g, x, y, 1, 1, IR[1]);
  // Squared timber lit on its left face, with an end-grain cap.
  function post(g, x, y, w, h, r5) {
    cyl(g, x, y, w, h, r5);
    R(g, x, y, w, 1, r5[4]);
    if (w > 2) R(g, x + 1, y + 1, w - 2, 1, r5[3]);
  }
  // A tabletop seen from above-front: lit top with plank seams, an apron.
  function top(g, x, y, w, h, apron, r5, seed) {
    R(g, x, y, w, h, r5[3]);
    R(g, x, y, w, 1, r5[4]);
    for (let k = 4; k < h; k += 4) R(g, x + 1, y + k, w - 2, 1, r5[2]);
    streaks(g, x + 2, y + 1, w - 4, h - 2, r5[2], seed, Math.max(2, (w * h / 60) | 0), 6);
    R(g, x, y + h, w, apron, r5[1]);
    R(g, x, y + h, w, 1, r5[2]);
  }
  // Board with a bevelled frame; optional painted lettering in rows.
  function board(g, x, y, w, h, r5, face, seed, rows, faded) {
    R(g, x, y, w, h, r5[1]);
    R(g, x + 1, y + 1, w - 2, h - 2, face[2]);
    R(g, x + 1, y + 1, w - 2, 1, face[4]);
    R(g, x + 1, y + h - 2, w - 2, 1, face[1]);
    R(g, x + 1, y + 1, 1, h - 2, face[3]);
    const ink = faded ? face[1] : INK[2];
    for (let row = 0; row < (rows || 0); row++) {
      let gx = x + 4;
      for (let i = 0; gx < x + w - 6; i++) {
        const r = hh(seed, row * 20 + i, 97);
        if (!faded || r % 3 === 0) glyph(g, gx, y + 3 + row * 6, r, ink);
        gx += 5;
      }
    }
  }
  // Writing on boards is suggested, never imitated: short brush dashes in
  // rows, like lines of text too small to read. (No shapes that could pass
  // for Japanese characters — the brief rules out meaningless characters as
  // ornament; the readable text of a sign is shown in the dialogue layer.)
  function glyph(g, x, y, r, ink) {
    const w = 3 + (r % 2);            // 3–4 px dash
    const dy = 1 + ((r >>> 3) % 3);   // on a slightly uneven baseline
    R(g, x, y + dy, w, 1, ink);
    if ((r >>> 5) % 4 === 0) R(g, x + w - 1, y + dy - 1, 1, 1, ink); // the odd lifted brush end
  }
  const signFace = (M) => ramp(mix(M.wood[4], '#efe2c0', 0.55), 0.4, 0.3);
  // Warm light in a paper or glass window; k = flicker level (0 steady).
  function lamp(g, x, y, w, h, k) {
    R(g, x, y, w, h, GL[3 - (k === 2 ? 1 : 0)]);
    R(g, x + 1, y + 1, w - 2, h - 2, GL[4 - (k === 1 ? 1 : 0)]);
    R(g, x, y + h - 1, w, 1, GL[2]);
  }
  const flick = (t, o, ms) => K.frame(t, ms || 150, 4, o.still, (o.cx | 0) * 0.37 + (o.cy | 0) * 0.21);
  RB.propArt.kit = { plank, nail, post, top, board, signFace, lamp, flick, glyph };

  // ---- fences, shelves, lamps ------------------------------------------------------------------
  // Rail fence: squared posts with chamfered caps and two nailed rails that
  // run to the tile edges so neighbouring fence tiles join up.
  art('fence', {
    box: [0, 0, 32, 34],
    v: (o) => cxy(o) % 4,
    draw(g, M, v, f, info) {
      const w5 = M.wood;
      post(g, 4, 8, 5, 22, w5);
      post(g, 23, 8, 5, 22, w5);
      plank(g, 0, 12, 32, 4, w5, v + 1);
      plank(g, 0, 21, 32, 4, w5, v + 7);
      if (v === 1) R(g, 12, 13, 3, 2, w5[1]);
      for (const px of [6, 25]) { nail(g, px, 13); nail(g, px, 22); }
      if (info.snow) K.snowTops(g, 0, 0, 32, 30, M.snow, v, 2);
    },
    ground(g) { R(g, 0, 29, 32, 2, 'rgba(22,16,40,0.12)'); },
    shadow: () => [16, 30, 15, 2, 0.12],
  });

  // Bookcase: framed carcass, three shelves of books in muted cloth colours
  // (tall and short, leaning, lying flat), the odd jar or scroll.
  const BOOKS = ['#8a3a3a', '#3a5a8a', '#c8a050', '#4a7a4a', '#e0d6bc', '#6a4a7a', '#a8683a', '#3a6a6a'].map((c) => ramp(c, 0.45, 0.35));
  function books(g, x0, x1, yb, hMax, seed) {
    let x = x0, i = 0;
    while (x < x1 - 1) {
      const r = hh(seed, i++, 91), w = 2 + (r % 3), bk = BOOKS[(r >>> 3) % BOOKS.length];
      const kind = (r >>> 7) % 11;
      if (kind === 0 && x1 - x > 6) { // a jar or a scroll
        const jr = (r >>> 11) & 1 ? K.FIX.ceramic : PP;
        R(g, x, yb - 6, 5, 6, jr[2]); R(g, x, yb - 6, 1, 6, jr[3]); R(g, x + 4, yb - 6, 1, 6, jr[1]); R(g, x + 1, yb - 7, 3, 1, jr[1]);
        x += 6; continue;
      }
      if (kind === 1 && x1 - x > 8) { // two lying flat
        const b2 = BOOKS[(r >>> 13) % BOOKS.length];
        R(g, x, yb - 3, 8, 3, bk[2]); R(g, x, yb - 3, 8, 1, bk[3]);
        R(g, x + 1, yb - 5, 6, 2, b2[2]); R(g, x + 1, yb - 5, 6, 1, b2[3]);
        x += 9; continue;
      }
      if (x + w > x1) break;
      const h = hMax - ((r >>> 9) % 4);
      if (kind === 2 && x > x0 && x + w + 2 <= x1) { // leaning on its neighbour
        for (let k = 0; k < h; k++) R(g, x + Math.floor((h - k) / 4), yb - k - 1, w, 1, k === h - 1 ? bk[3] : bk[2]);
        x += w + 2; continue;
      }
      R(g, x, yb - h, w, h, bk[2]);
      R(g, x, yb - h, 1, h, bk[3]);
      if (w > 2) R(g, x + w - 1, yb - h, 1, h, bk[1]);
      R(g, x, yb - h, w, 1, bk[4]);
      if ((r >>> 15) % 3 === 0) R(g, x, yb - h + 2, w, 1, '#d8b860');
      x += w;
    }
  }
  art('shelf', {
    box: [-2, -22, 36, 56],
    v: (o) => cxy(o) % 12,
    draw(g, M, v) {
      const w5 = M.wood;
      R(g, 3, -16, 26, 42, w5[0]);
      for (const [y, h] of [[-16, 14], [0, 10], [12, 10]]) books(g, 4, 28, y + h, h - 1, v * 31 + y + 40);
      post(g, 0, -18, 3, 48, w5);
      post(g, 29, -18, 3, 48, w5);
      for (const y of [-2, 10, 22]) { R(g, 3, y, 26, 2, w5[3]); R(g, 3, y, 26, 1, w5[4]); R(g, 3, y + 2, 26, 1, w5[0]); }
      plank(g, -1, -20, 34, 4, w5, v);
      R(g, 3, 24, 26, 6, w5[2]); R(g, 3, 24, 26, 1, w5[1]);
      R(g, 14, 26, 4, 1, BR[3]);
    },
    shadow: () => [16, 30, 16, 2.5, 0.28],
  });

  // Street lamp: iron post on a plinth and a caged glass head that flickers.
  art('lamppost', {
    box: [2, -36, 28, 70],
    f: (t, o) => flick(t, o),
    draw(g, M, v, f) {
      const ir = IR;
      cyl(g, 14, -10, 4, 36, ir);
      R(g, 12, 2, 8, 2, ir[3]); R(g, 12, 3, 8, 1, ir[1]);
      cyl(g, 11, 24, 10, 6, ir); R(g, 11, 24, 10, 1, ir[4]);
      R(g, 10, -12, 12, 2, ir[2]); R(g, 10, -12, 12, 1, ir[3]);
      lamp(g, 11, -24, 10, 12, [0, 1, 0, 2][f]);
      R(g, 15, -19, 2, 3, K.FIX.ember[3]);
      for (const x of [10, 15, 21]) R(g, x, -24, 1, 12, ir[1]);
      poly(g, [8, -24, 24, -24, 20, -30, 12, -30], ir[2]);
      R(g, 9, -25, 14, 1, ir[3]); R(g, 12, -30, 8, 1, ir[3]);
      R(g, 15, -34, 2, 4, ir[2]);
    },
    over(g, M, v, f) { K.halo(g, 16, -18, 12 - (f === 2 ? 1 : 0), '#ffd27a', 0.14); },
    shadow: () => [16, 29, 8, 2.5, 0.3],
  });

  // Crystal cluster: faceted shards with a slow inner pulse.
  const CRYS = ['#1c4452', '#317e8c', '#62bcc6', '#a4e8ea', '#eeffff'];
  function shard(g, cx, tp, bot, hw, lean) {
    const tx = cx + lean;
    poly(g, [tx, tp, cx + hw, tp + hw * 1.6, cx + hw * 0.8, bot, cx - hw * 0.8, bot, cx - hw, tp + hw * 1.6], CRYS[2]);
    poly(g, [tx, tp, cx - hw, tp + hw * 1.6, cx - hw * 0.8, bot, cx - 1, bot], CRYS[3]);
    poly(g, [tx, tp, cx + hw, tp + hw * 1.6, cx + hw * 0.8, bot, cx + 2, bot], CRYS[1]);
    line(g, tx, tp + 2, cx, bot - 2, CRYS[4], 1);
  }
  art('crystal', {
    box: [-2, -24, 36, 58],
    f: (t, o) => K.frame(t, 170, 6, o.still),
    draw(g) {
      shard(g, 9, 4, 28, 4, -2);
      shard(g, 24, 8, 28, 4, 3);
      shard(g, 16, -16, 28, 6, 0);
      R(g, 5, 26, 24, 3, '#3a4a58');
    },
    over(g, M, v, f) {
      const a = [0.1, 0.18, 0.26, 0.3, 0.24, 0.16][f];
      K.halo(g, 16, 6, 16, '#aef0f0', a);
      R(g, 15, -6 + f * 3, 2, 2, 'rgba(255,255,255,' + (0.5 + a) + ')');
    },
    shadow: () => [16, 29, 12, 3, 0.3],
  });

  // ---- containers ------------------------------------------------------------------------------
  // Barrel: bulging staves on a lit cylinder, iron hoops, a lidded top.
  art('barrel', {
    box: [0, -2, 32, 36],
    draw(g, M) {
      const w5 = M.wood;
      for (let y = 7; y < 30; y++) {
        const b = y < 9 || y > 27 ? 1 : 0;
        for (let i = b; i < 20 - b; i++) R(g, 6 + i, y, 1, 1, cylCol(i - b, 20 - 2 * b, w5));
      }
      for (const u of [-0.8, -0.45, 0, 0.45, 0.8]) R(g, Math.round(16 + u * 10), 9, 1, 19, w5[1]);
      for (const y of [11, 24]) { for (let i = 0; i < 20; i++) R(g, 6 + i, y, 1, 2, cylCol(i, 20, IR)); R(g, 7, y, 18, 1, IR[3]); }
      ell(g, 16, 7, 10, 3.2, w5[1]);
      ell(g, 16, 7, 8.6, 2.4, w5[3]);
      R(g, 10, 5, 12, 1, w5[4]);
      R(g, 12, 7, 8, 1, w5[2]);
    },
    shadow: () => [16, 29, 12, 3.5, 0.34],
  });

  // Crate: planked top and front, a framed face with a diagonal brace.
  art('crate', {
    box: [0, -2, 32, 36],
    v: (o) => cxy(o) % 3,
    draw(g, M, v) {
      const w5 = M.wood;
      for (let i = 0; i < 3; i++) { R(g, 4, 3 + i * 3, 24, 2, w5[i === 1 ? 3 : 4]); R(g, 4, 5 + i * 3, 24, 1, w5[2]); }
      R(g, 4, 11, 24, 18, w5[2]);
      for (let i = 0; i < 3; i++) plank(g, 7, 14 + i * 4, 18, 4, w5, v * 5 + i);
      plank(g, 4, 11, 24, 3, w5, v + 2);
      plank(g, 4, 26, 24, 3, w5, v + 3);
      plank(g, 4, 11, 3, 18, w5, v + 4, true);
      plank(g, 25, 11, 3, 18, w5, v + 5, true);
      line(g, 8, 25, 24, 14, w5[4], 2);
      line(g, 9, 26, 25, 15, w5[1], 1);
      for (const [x, y] of [[5, 12], [26, 12], [5, 27], [26, 27]]) nail(g, x, y);
      if (v === 2) { R(g, 11, 17, 8, 5, PP[3]); R(g, 12, 19, 6, 1, INK[3]); }
    },
    shadow: () => [16, 29, 14, 3, 0.34],
  });

  // ---- signs and boards (interactable: inked) --------------------------------------------------------
  art('sign', {
    box: [0, -2, 32, 36], ink: true,
    v: (o) => cxy(o) % 4,
    draw(g, M, v) {
      post(g, 14, 12, 4, 18, M.wood);
      board(g, 3, 2, 26, 15, M.wood, signFace(M), v, 2);
      nail(g, 15, 14); nail(g, 16, 14);
    },
    shadow: () => [16, 30, 8, 2.5, 0.3],
  });
  // A sign whose words have faded (restored by play into 'sign').
  art('signblank', {
    box: [0, -2, 32, 36], ink: true,
    v: (o) => cxy(o) % 4,
    draw(g, M, v) {
      post(g, 14, 12, 4, 18, M.wood);
      const face = ramp(mix(M.wood[3], '#a8a49a', 0.4), 0.4, 0.25);
      board(g, 3, 2, 26, 15, M.wood, face, v, 2, true);
      line(g, 20, 3, 23, 9, face[0], 1);
      R(g, 6, 12, 5, 2, face[1]);
      nail(g, 15, 14);
    },
    shadow: () => [16, 30, 8, 2.5, 0.3],
  });
  // Notice board: two posts, a plank roof, pinned notices with lettering.
  art('noticeboard', {
    box: [-2, -26, 68, 60], ink: true,
    v: (o) => cxy(o) % 3,
    draw(g, M, v, f, info) {
      const w5 = M.wood;
      post(g, 5, -8, 5, 38, w5);
      post(g, 54, -8, 5, 38, w5);
      R(g, 2, -14, 60, 30, w5[1]);
      R(g, 4, -12, 56, 26, mix(w5[2], '#6a5040', 0.3));
      streaks(g, 4, -12, 56, 26, w5[1], v + 3, 10, 6);
      poly(g, [-1, -14, 65, -14, 60, -22, 4, -22], M.roof[2]);
      for (let x = 0; x < 64; x += 4) R(g, x, -16, 3, 2, M.roof[1]);
      R(g, 4, -22, 56, 1, M.roof[4]);
      R(g, 0, -14, 64, 1, M.roof[0]);
      const notes = [[7, -10, 12, 15], [22, -9, 10, 12], [35, -11, 13, 10], [49, -8, 9, 13], [36, 1, 11, 10]];
      notes.forEach(([x, y, w, h], i) => {
        const r = hh(v, i, 13);
        if (i === 4 && v === 1) return;
        R(g, x, y, w, h, PP[3]); R(g, x, y, w, 1, PP[4]); R(g, x + w - 1, y + 1, 1, h - 1, PP[1]); R(g, x, y + h - 1, w, 1, PP[1]);
        for (let k = 0; k < (h - 4) / 2; k++) R(g, x + 2, y + 3 + k * 2, w - 4 - ((r >>> k) % 3), 1, INK[3]);
        if (r % 3 === 0) R(g, x + w - 4, y + h - 4, 3, 3, '#b84a3a');
        R(g, x + (w >> 1), y, 1, 1, (r >>> 5) & 1 ? '#c83a3a' : BR[3]);
      });
      if (info.snow) K.snowTops(g, -2, -26, 68, 12, M.snow, v, 2);
    },
    shadow: () => [32, 30, 30, 3, 0.3],
  });

  // ---- stone ----------------------------------------------------------------------------------------
  // Well: coursed stone ring with coping, dark water, a windlass under a
  // small shingled roof, rope and bucket.
  art('well', {
    box: [-4, -44, 72, 78],
    draw(g, M, v, f, info) {
      const s5 = M.stone, w5 = M.wood;
      post(g, 5, -30, 5, 44, w5);
      post(g, 54, -30, 5, 44, w5);
      ell(g, 32, 11, 27, 8, s5[3]);
      ell(g, 32, 11, 22, 5, s5[1]);
      ell(g, 32, 12, 20, 4, '#14202c');
      R(g, 22, 12, 6, 1, '#4a6a80');
      // front wall: a curved band of coursed blocks (each course follows the rim)
      const bend = (i) => Math.round(7 * Math.sqrt(Math.max(0, 1 - Math.pow((i - 26.5) / 27, 2))));
      for (let i = 0; i < 54; i++) {
        const b = bend(i), col = cylCol(i, 54, s5);
        R(g, 5 + i, 11 + b, 1, 15, col);
        for (let c = 0; c < 3; c++) {
          const y = 14 + b + c * 4;
          R(g, 5 + i, y, 1, 1, s5[0]);
          const joint = (i + c * 5 + 2) % 10;
          if (joint === 0) R(g, 5 + i, y + 1, 1, 3, s5[0]);
          else if (joint === 1) R(g, 5 + i, y + 1, 1, 1, s5[4]);
        }
        // coping: a lit rim course along the top
        R(g, 5 + i, 10 + b, 1, 3, i % 8 === 7 ? s5[1] : s5[3]);
        R(g, 5 + i, 10 + b, 1, 1, s5[4]);
      }
      for (let i = 0; i < 5; i++) R(g, 8, -24 + i, 48, 1, [w5[4], w5[3], w5[2], w5[1], w5[0]][i]);
      R(g, 22, -25, 10, 7, '#8a7a5a'); R(g, 22, -25, 10, 1, '#b8a47a');
      R(g, 56, -26, 2, 8, w5[1]); R(g, 58, -20, 5, 2, w5[1]);
      R(g, 27, -18, 1, 20, '#9a8a64');
      R(g, 23, 0, 10, 8, w5[2]); R(g, 23, 0, 10, 1, w5[4]); R(g, 23, 3, 10, 1, IR[2]); R(g, 32, 1, 1, 7, w5[1]);
      poly(g, [-2, -28, 66, -28, 58, -40, 6, -40], M.roof[2]);
      for (let r = 0; r < 3; r++) for (let x = r * 2; x < 66; x += 5) R(g, x - 1 + (r % 2) * 2, -38 + r * 4, 4, 3, M.roof[r === 0 ? 3 : 2]);
      R(g, 6, -41, 52, 2, M.roof[1]);
      R(g, -2, -29, 68, 2, M.roof[0]);
      if (info.snow) K.snowTops(g, -4, -44, 72, 60, M.snow, 3, 3);
    },
    shadow: () => [32, 30, 30, 4, 0.34],
  });

  // ---- furniture --------------------------------------------------------------------------------
  function legs(g, xs, y0, y1, r5) { for (const x of xs) post(g, x, y0, 3, y1 - y0, r5); }
  art('table', {
    box: [-2, -4, 68, 40],
    draw(g, M) {
      const w5 = M.wood;
      legs(g, [5, 56], 19, 30, w5);
      R(g, 8, 25, 48, 2, w5[1]);
      top(g, 2, 4, 60, 14, 3, w5, 3);
    },
    shadow: () => [32, 29, 30, 3.5, 0.3],
  });
  art('smalltable', {
    box: [-2, -4, 36, 40],
    draw(g, M) {
      const w5 = M.wood;
      legs(g, [4, 25], 19, 30, w5);
      top(g, 2, 6, 28, 12, 3, w5, 5);
    },
    shadow: () => [16, 29, 14, 3, 0.3],
  });
  // Low table with a glazed teapot and two cups of green tea.
  art('teaset', {
    box: [-2, -8, 36, 44],
    draw(g, M) {
      const w5 = M.wood, cer = K.FIX.ceramic, gz = ramp('#5a7c8e', 0.45, 0.4);
      legs(g, [4, 25], 19, 30, w5);
      top(g, 2, 6, 28, 12, 3, w5, 5);
      R(g, 5, 12, 22, 5, w5[2]); R(g, 5, 12, 22, 1, w5[1]); // tray
      // teapot
      ell(g, 11, 8, 6, 5, gz[2]); ell(g, 10, 7, 4, 3, gz[3]); R(g, 8, 5, 2, 1, gz[4]);
      R(g, 9, 2, 5, 2, gz[1]); R(g, 10, 1, 3, 1, gz[3]);
      line(g, 5, 8, 2, 5, gz[2], 2);
      R(g, 17, 6, 1, 5, gz[1]); R(g, 16, 5, 2, 1, gz[1]);
      R(g, 7, 12, 8, 1, gz[0]);
      // cups
      for (const x of [20, 25]) { R(g, x, 9, 4, 5, cer[3]); R(g, x, 9, 1, 5, cer[4]); R(g, x + 3, 9, 1, 5, cer[1]); R(g, x, 9, 4, 1, '#7a9a5a'); R(g, x, 13, 4, 1, cer[1]); }
    },
    shadow: () => [16, 29, 14, 3, 0.3],
  });
  art('chair', {
    box: [2, -6, 28, 40],
    draw(g, M) {
      const w5 = M.wood;
      legs(g, [8, 21], 20, 30, w5);
      post(g, 8, 0, 3, 18, w5); post(g, 21, 0, 3, 18, w5);
      plank(g, 7, 0, 18, 3, w5, 2);
      for (const x of [13, 16]) R(g, x, 3, 2, 12, w5[2]);
      R(g, 11, 8, 10, 1, w5[1]);
      top(g, 6, 15, 20, 4, 2, w5, 7);
    },
    shadow: () => [16, 29, 11, 3, 0.3],
  });
  // Bed: headboard, pillow, a blue quilt with running-stitch squares and a
  // folded sheet, footboard.
  art('bed', {
    box: [-2, -8, 36, 76],
    draw(g, M) {
      const w5 = M.wood, q = ramp('#6a8ab0', 0.45, 0.35), sh = PP;
      R(g, 1, -2, 30, 64, w5[1]);
      plank(g, 0, -4, 32, 7, w5, 1);
      R(g, 3, 3, 26, 56, w5[0]);
      // pillow
      R(g, 5, 4, 22, 9, sh[3]); R(g, 5, 4, 22, 1, sh[4]); R(g, 5, 12, 22, 1, sh[1]); R(g, 6, 5, 3, 7, sh[4]); R(g, 15, 6, 1, 5, sh[2]);
      // sheet fold and quilt
      R(g, 3, 15, 26, 4, sh[3]); R(g, 3, 15, 26, 1, sh[4]); R(g, 3, 18, 26, 1, sh[1]);
      R(g, 3, 19, 26, 39, q[2]);
      R(g, 3, 19, 2, 39, q[3]); R(g, 27, 19, 2, 39, q[1]);
      for (let yy = 23; yy < 56; yy += 8) for (let xx = 7; xx < 26; xx += 2) R(g, xx, yy, 1, 1, q[4]);
      for (let xx = 10; xx < 26; xx += 8) for (let yy = 21; yy < 56; yy += 2) R(g, xx, yy, 1, 1, q[4]);
      R(g, 3, 40, 26, 1, q[1]); R(g, 3, 41, 26, 1, q[3]); // a crease
      plank(g, 0, 57, 32, 5, w5, 4);
    },
    shadow: () => [16, 61, 16, 3, 0.3],
  });
  // Shop counter: a thick lit top over a panelled front.
  art('counter', {
    box: [-2, -4, 100, 40],
    v: (o) => cxy(o) % 3,
    draw(g, M, v) {
      const w5 = M.wood;
      R(g, 0, 10, 96, 20, w5[2]);
      for (let i = 0; i < 4; i++) {
        const x = 3 + i * 23;
        R(g, x, 13, 21, 13, w5[1]); R(g, x + 1, 14, 19, 11, w5[3]); R(g, x + 1, 14, 19, 1, w5[4]); R(g, x + 1, 24, 19, 1, w5[2]);
        streaks(g, x + 2, 15, 17, 9, w5[2], v * 7 + i, 3, 6);
      }
      R(g, 0, 27, 96, 3, w5[1]);
      top(g, -1, 1, 98, 8, 2, w5, v);
    },
    shadow: () => [48, 29, 48, 3, 0.3],
  });
  // Cooking stove: a stone firebox with an iron top plate and a live fire.
  const STOVE = ramp('#5e5654', 0.5, 0.4);
  function fire(g, cx, by, w, h, f, n) {
    const E = K.FIX.ember;
    for (let i = 0; i < n; i++) {
      const u = n === 1 ? 0 : i / (n - 1) - 0.5, hh2 = h * (1 - Math.abs(u) * 0.8) * (0.8 + 0.25 * ((f + i) % 3) / 2);
      const x = cx + u * w, sway = ((f + i) % 4) - 1.5;
      poly(g, [x - w / (n + 1), by, x + sway * 0.6, by - hh2, x + w / (n + 1), by], E[2]);
      poly(g, [x - w / (n + 2) / 1.6, by, x + sway * 0.4, by - hh2 * 0.6, x + w / (n + 2) / 1.6, by], E[3]);
      R(g, Math.round(x), by - Math.round(hh2 * 0.3), 1, Math.round(hh2 * 0.3), E[4]);
    }
  }
  art('stove', {
    box: [0, -10, 32, 44],
    f: (t, o) => K.frame(t, 110, 4, o.still),
    draw(g, M, v, f) {
      const s5 = STOVE;
      R(g, 3, 0, 26, 29, s5[2]);
      R(g, 3, 0, 2, 29, s5[3]); R(g, 27, 0, 2, 29, s5[1]);
      for (let c = 0; c < 4; c++) { R(g, 3, 8 + c * 5, 26, 1, s5[1]); for (let i = 0; i < 3; i++) R(g, 5 + ((i * 9 + c * 4) % 24), 9 + c * 5, 1, 4, s5[1]); }
      // iron top with a lid ring
      R(g, 1, -4, 30, 5, IR[2]); R(g, 1, -4, 30, 1, IR[3]); R(g, 1, 0, 30, 1, IR[0]);
      ell(g, 16, -2, 8, 1.6, IR[1]); R(g, 12, -3, 8, 1, IR[4]);
      // fire mouth
      R(g, 9, 13, 14, 12, '#1c1210'); R(g, 8, 12, 16, 1, s5[4]); R(g, 9, 13, 14, 1, '#3a2418');
      R(g, 10, 22, 12, 2, K.FIX.char[3]);
      fire(g, 16, 22, 10, 8, f, 3);
    },
    over(g, M, v, f) { K.halo(g, 16, 19, 11, '#ff9a40', 0.1 + (f % 2) * 0.04); },
    shadow: () => [16, 29, 15, 3, 0.34],
  });
  art('pot', {
    box: [0, -2, 32, 36],
    draw(g, M) {
      const c5 = K.FIX.clay;
      shadeBall(g, 16, 20, 9, 9, c5, 3);
      R(g, 7, 20, 18, 1, c5[1]);
      ell(g, 16, 11, 7, 2.2, c5[1]); ell(g, 16, 11, 5.6, 1.5, '#2a1410');
      R(g, 11, 9, 10, 1, c5[4]);
      R(g, 5, 15, 2, 4, c5[1]); R(g, 25, 15, 2, 4, c5[0]);
    },
    shadow: () => [16, 29, 10, 3, 0.34],
  });
  // A ball or jar body lit from the upper left, in banded steps.
  function shadeBall(g, cx, cy, rx, ry, r5, seed) {
    K.shade(g, Math.floor(cx - rx - 1), Math.floor(cy - ry - 1), Math.ceil(rx * 2 + 2), Math.ceil(ry * 2 + 2), r5, (fx, fy) => {
      const nx = (fx - cx) / rx, ny = (fy - cy) / ry, d = nx * nx + ny * ny;
      if (d > 1) return null;
      const nz = Math.sqrt(1 - d);
      return -0.5 * nx - 0.6 * ny + 0.6 * nz - 0.15;
    }, seed, 0.08, 3, 2);
  }
  RB.propArt.kit.shadeBall = shadeBall;
  // Apothecary shelf of bottles (o.labels === false: bare glass).
  const BOTTLE = ['#6ab0a0', '#c8a0d0', '#e0c070', '#90c070'].map((c) => ramp(c, 0.45, 0.4));
  art('bottles', {
    box: [-2, -22, 36, 56],
    v: (o) => (((o.cx | 0) % 4) + 4) % 4 + (o.labels === false ? 'n' : ''),
    draw(g, M, v) {
      const w5 = M.wood, cx = parseInt(v, 10), labels = String(v).indexOf('n') < 0;
      R(g, 3, -16, 26, 42, w5[0]);
      post(g, 0, -18, 3, 48, w5); post(g, 29, -18, 3, 48, w5);
      plank(g, -1, -20, 34, 4, w5, 2);
      for (let r = 0; r < 3; r++) {
        const yb = -2 + r * 12;
        for (let i = 0; i < 4; i++) {
          const b = BOTTLE[(i + r + cx) % 4], x = 4 + i * 6, tall = (i + r) % 3 === 0 ? 2 : 0;
          R(g, x + 1, yb - 12 - tall, 3, 3, b[1]); R(g, x + 1, yb - 13 - tall, 3, 1, w5[1]); // neck and cork
          R(g, x, yb - 9 - tall, 5, 9 + tall, b[2]); R(g, x, yb - 9 - tall, 1, 9 + tall, b[3]); R(g, x + 4, yb - 9 - tall, 1, 9 + tall, b[1]);
          R(g, x + 1, yb - 8 - tall, 1, 3, b[4]);
          if (labels) { R(g, x, yb - 5, 5, 3, PP[3]); R(g, x + 1, yb - 4, 3, 1, INK[3]); }
        }
        R(g, 3, yb, 26, 2, w5[3]); R(g, 3, yb, 26, 1, w5[4]); R(g, 3, yb + 2, 26, 1, w5[0]);
      }
      R(g, 3, 24, 26, 6, w5[2]); R(g, 3, 24, 26, 1, w5[1]);
    },
    shadow: () => [16, 30, 16, 2.5, 0.28],
  });
  // Chest (interactable): planked, iron-banded, a brass lock plate; o.open
  // shows the lid thrown back and the dark, empty inside.
  art('chest', {
    box: [0, -16, 32, 50], ink: true,
    v: (o) => (o.open ? 1 : 0),
    draw(g, M, v) {
      const w5 = M.wood;
      // body
      R(g, 4, 14, 24, 15, w5[2]);
      for (let i = 0; i < 3; i++) plank(g, 4, 14 + i * 5, 24, 5, w5, 3 + i);
      for (const x of [8, 22]) { R(g, x, 14, 2, 15, IR[2]); R(g, x, 14, 1, 15, IR[3]); }
      if (!v) {
        // domed lid
        for (let y = 5; y < 14; y++) {
          const inset = y < 7 ? 2 - (y - 5) : 0, lit = y < 9;
          R(g, 4 + inset, y, 24 - inset * 2, 1, lit ? w5[y === 5 ? 4 : 3] : w5[2]);
        }
        R(g, 4, 13, 24, 1, w5[1]);
        for (const x of [8, 22]) { R(g, x, 5, 2, 9, IR[2]); R(g, x, 5, 1, 9, IR[3]); }
        R(g, 13, 10, 6, 7, BR[2]); R(g, 13, 10, 6, 1, BR[4]); R(g, 13, 10, 1, 7, BR[3]); R(g, 18, 11, 1, 6, BR[1]);
        R(g, 15, 13, 2, 2, BR[0]);
      } else {
        // lid thrown back, inside dark
        R(g, 4, -6, 24, 14, w5[1]); R(g, 5, -5, 22, 12, w5[0]); R(g, 5, -5, 22, 1, w5[2]);
        for (const x of [8, 22]) R(g, x, -6, 2, 14, IR[1]);
        R(g, 4, 8, 24, 6, '#1a1210'); R(g, 4, 8, 24, 1, w5[3]); R(g, 5, 9, 22, 2, '#2c1e18');
        R(g, 13, 14, 6, 4, BR[2]); R(g, 13, 14, 6, 1, BR[4]);
      }
    },
    shadow: () => [16, 29, 14, 3, 0.34],
  });
  // Stack of books lying flat, page edges showing.
  art('bookpile', {
    box: [0, -4, 32, 38],
    v: (o) => cxy(o) % 4,
    draw(g, M, v) {
      let y = 28;
      for (let i = 0; i < 4; i++) {
        const r = hh(v, i, 17), b = BOOKS[r % BOOKS.length], w = 18 + (r >>> 4) % 5, h = 4 + ((r >>> 8) % 2), x = 6 + ((r >>> 10) % 5) - (i === 3 ? 1 : 0);
        y -= h;
        R(g, x, y, w, h, b[2]); R(g, x, y, w, 1, b[4]); R(g, x, y + h - 1, w, 1, b[0]);
        R(g, x + w - 3, y + 1, 3, h - 2, PP[3]); R(g, x + w - 3, y + 2, 3, 1, PP[1]);
        R(g, x + 2, y + 1, 1, h - 2, b[1]);
      }
      if (v % 2) { R(g, 21, y - 3, 3, 3, BR[3]); }
    },
    shadow: () => [16, 28, 12, 3, 0.3],
  });
  // Writing desk: paper, inkstone and brush, a drawer pedestal.
  art('desk', {
    box: [-2, -6, 68, 40],
    draw(g, M) {
      const w5 = M.wood;
      R(g, 4, 18, 18, 12, w5[2]); R(g, 4, 18, 2, 12, w5[3]);
      for (const y of [19, 24]) { R(g, 6, y, 14, 4, w5[3]); R(g, 6, y, 14, 1, w5[4]); R(g, 12, y + 2, 3, 1, BR[3]); }
      legs(g, [57], 18, 30, w5);
      top(g, 2, 2, 60, 13, 3, w5, 9);
      R(g, 12, 4, 17, 10, PP[3]); R(g, 12, 4, 17, 1, PP[4]); R(g, 28, 5, 1, 9, PP[1]);
      for (let k = 0; k < 3; k++) R(g, 14, 6 + k * 2, 11 - k * 2, 1, INK[3]);
      R(g, 38, 5, 7, 6, INK[1]); R(g, 39, 6, 5, 3, INK[3]); R(g, 39, 6, 2, 1, '#6a6a8a');
      line(g, 47, 11, 55, 5, '#c8a870', 1); R(g, 46, 11, 2, 2, INK[2]);
    },
    shadow: () => [32, 29, 30, 3, 0.3],
  });

  // ---- wheels, boats, carts ------------------------------------------------------------------
  // Pixel ring with a bevel: the outer edge lit on the upper left, the inner
  // edge lit on the lower right.
  function ring(g, cx, cy, r0, r1, r5) {
    K.shade(g, Math.floor(cx - r1 - 1), Math.floor(cy - r1 - 1), Math.ceil(2 * r1 + 2), Math.ceil(2 * r1 + 2), r5, (fx, fy) => {
      const dx = fx - cx, dy = fy - cy, d = Math.sqrt(dx * dx + dy * dy);
      if (d < r0 || d > r1) return null;
      const l = (-dx - dy) / (d * 1.41 || 1);
      return d > r1 - 1.2 ? 0.15 + l * 0.6 : d < r0 + 1.2 ? 0.15 - l * 0.5 : 0.2 + l * 0.15;
    }, 3, 0);
  }
  function spokeWheel(g, cx, cy, r, n, a, r5, hub) {
    for (let i = 0; i < n; i++) {
      const an = a + (i * 2 * PI) / n;
      line(g, cx + Math.cos(an) * 2, cy + Math.sin(an) * 2, cx + Math.cos(an) * (r - 1), cy + Math.sin(an) * (r - 1), r5[2], r > 10 ? 2 : 1);
    }
    ring(g, cx, cy, r - (r > 10 ? 3 : 2), r, r5);
    ell(g, cx, cy, hub, hub, IR[2]); R(g, Math.round(cx - hub / 2), Math.round(cy - hub / 2), 2, 1, IR[4]);
  }
  // Water wheel: two rims joined by radial paddles, six spokes, an iron hub;
  // turns through eight cached frames (still with o.still).
  art('millwheel', {
    box: [-6, -10, 76, 76],
    f: (t, o) => (o.still ? 0 : Math.floor(((t / 1600) % (PI / 6)) / (PI / 48)) % 8),
    draw(g, M, v, f) {
      const w5 = M.wood, cx = 32, cy = 24, a = (f * PI) / 48;
      for (let i = 0; i < 12; i++) {
        const an = a + (i * PI) / 6, c = Math.cos(an), s = Math.sin(an), px = -s, py = c;
        const x0 = cx + c * 20, y0 = cy + s * 20, x1 = cx + c * 32, y1 = cy + s * 32;
        poly(g, [x0 + px * 2, y0 + py * 2, x1 + px * 2, y1 + py * 2, x1 - px * 2, y1 - py * 2, x0 - px * 2, y0 - py * 2], s < -0.3 ? w5[3] : s > 0.3 ? w5[1] : w5[2]);
        line(g, x0 + px * 2, y0 + py * 2, x1 + px * 2, y1 + py * 2, w5[c + s < 0 ? 4 : 0], 1);
      }
      ring(g, cx, cy, 25, 29, w5);
      ring(g, cx, cy, 17, 20, w5);
      spokeWheel(g, cx, cy, 17, 6, a, w5, 5);
    },
    shadow: () => [32, 58, 24, 3, 0.2],
  });
  // Rowing boat: planked hull with strakes, thwarts, an oar; sits in water.
  art('boat', {
    box: [-4, -4, 72, 40],
    v: (o) => cxy(o) % 2,
    draw(g, M, v) {
      const w5 = M.wood;
      // hull side
      poly(g, [0, 12, 64, 12, 57, 27, 7, 27], w5[1]);
      for (const [y, c] of [[14, w5[3]], [19, w5[2]], [24, w5[1]]]) poly(g, [1 + (y - 12) * 0.45, y, 63 - (y - 12) * 0.45, y, 63 - (y + 4 - 12) * 0.45, y + 4, 1 + (y + 4 - 12) * 0.45, y + 4], c);
      for (const y of [18, 23]) line(g, 3 + (y - 12) * 0.45, y, 61 - (y - 12) * 0.45, y, w5[0], 1);
      // inside, seen over the gunwale
      ell(g, 32, 11, 30, 6, w5[4]);
      ell(g, 32, 11, 27, 4.4, w5[1]);
      R(g, 8, 11, 48, 3, w5[2]);
      for (const x of [22, 40]) { R(g, x, 7, 4, 9, w5[3]); R(g, x, 7, 4, 1, w5[4]); R(g, x + 3, 8, 1, 8, w5[1]); }
      R(g, 0, 11, 3, 2, w5[3]); R(g, 61, 11, 3, 2, w5[3]);
      if (v) { line(g, 12, 6, 50, 14, w5[3], 2); line(g, 12, 5, 50, 13, w5[4], 1); R(g, 47, 12, 7, 3, w5[3]); }
    },
    over(g, M) {
      const wt = M.water;
      R(g, 6, 28, 10, 1, wt[3]); R(g, 22, 29, 14, 1, wt[2]); R(g, 44, 28, 12, 1, wt[3]); R(g, 58, 26, 6, 1, wt[2]);
    },
    ground(g, M) { ell(g, 32, 26, 32, 5, K.rgba(M.water[0], 0.7)); },
  });
  // Hand cart: planked bed, spoked wheels, shafts.
  art('cart', {
    box: [-4, -10, 76, 46],
    v: (o) => cxy(o) % 2,
    draw(g, M, v) {
      const w5 = M.wood;
      // shafts
      line(g, 50, 12, 70, 10, w5[1], 2); line(g, 50, 11, 70, 9, w5[3], 1);
      // bed: inside then the near side boards
      R(g, 4, 2, 50, 8, w5[1]); R(g, 6, 3, 46, 6, w5[0]);
      if (v) { R(g, 10, -1, 12, 7, K.FIX.straw[3]); R(g, 10, -1, 12, 1, K.FIX.straw[4]); R(g, 24, 0, 10, 6, '#8a5a3a'); R(g, 24, 0, 10, 1, '#a8744a'); }
      for (let i = 0; i < 3; i++) plank(g, 2, 8 + i * 4, 54, 4, w5, 11 + i);
      for (const x of [2, 27, 52]) plank(g, x, 6, 3, 14, w5, x, true);
      R(g, 2, 6, 54, 1, w5[4]);
      spokeWheel(g, 15, 24, 8, 6, 0.3, w5, 2);
      spokeWheel(g, 43, 24, 8, 6, 0.8, w5, 2);
    },
    shadow: () => [30, 31, 30, 3, 0.34],
  });

  // ---- lanterns (interactable: inked) -------------------------------------------------------------
  // Standing lantern: a post and a wooden-framed paper box with a little
  // roof; lit (flickering) unless o.lit === false.
  function lanternBody(g, M, lit, k, torn) {
    const w5 = M.wood, frame = ramp(mix(w5[1], '#2a2226', 0.45), 0.45, 0.3);
    post(g, 13, 6, 6, 24, w5);
    R(g, 10, 27, 12, 3, w5[1]); R(g, 10, 27, 12, 1, w5[3]);
    R(g, 8, 6, 16, 2, frame[2]); R(g, 8, 6, 16, 1, frame[3]);
    // paper box
    if (lit) lamp(g, 9, -10, 14, 16, k);
    else { R(g, 9, -10, 14, 16, PP[1]); R(g, 10, -9, 12, 14, mix(PP[1], '#5a5660', 0.5)); if (torn) { R(g, 17, -6, 3, 4, '#2a2226'); R(g, 16, -5, 1, 2, PP[2]); } }
    for (const x of [8, 15, 23]) R(g, x, -10, 1, 16, frame[1]);
    R(g, 8, -3, 16, 1, frame[1]);
    // cap
    poly(g, [5, -10, 27, -10, 22, -15, 10, -15], frame[2]);
    R(g, 5, -11, 22, 1, frame[3]); R(g, 10, -15, 12, 1, frame[4]);
    R(g, 14, -18, 4, 3, frame[1]);
  }
  art('lantern', {
    box: [0, -22, 32, 56], ink: true,
    v: (o) => (o.lit === false ? 0 : 1),
    f: (t, o) => (o.lit === false ? 0 : flick(t, o)),
    draw(g, M, v, f) { lanternBody(g, M, v === 1, [0, 1, 0, 2][f]); },
    over(g, M, v, f) { if (v) K.halo(g, 16, -2, 14 - (f === 2 ? 1 : 0), '#ffd27a', 0.14); },
    shadow: () => [16, 30, 9, 2.5, 0.3],
  });
  art('deadlantern', {
    box: [0, -22, 32, 56], ink: true,
    draw(g, M) { lanternBody(g, M, false, 0, true); },
    shadow: () => [16, 30, 9, 2.5, 0.3],
  });

  // Wayside shrine: stone plinth, a small timber house with lattice doors
  // and a lamp inside (dark when o.lit === false), a curved roof, a rope
  // with paper streamers.
  art('shrine', {
    box: [-6, -34, 76, 68],
    v: (o) => (o.lit === false ? 0 : 1),
    f: (t, o) => (o.lit === false ? 0 : flick(t, o, 200)),
    draw(g, M, v, f) {
      const s5 = M.stone, w5 = M.wood, r5 = M.roof;
      // plinth in two steps
      R(g, 4, 22, 56, 8, s5[2]); R(g, 4, 22, 56, 2, s5[4]); R(g, 4, 29, 56, 1, s5[0]);
      R(g, 10, 16, 44, 7, s5[2]); R(g, 10, 16, 44, 1, s5[4]); R(g, 53, 16, 1, 7, s5[1]);
      for (const x of [18, 32, 46]) R(g, x, 23, 1, 6, s5[1]);
      // body
      post(g, 14, -4, 4, 21, w5); post(g, 46, -4, 4, 21, w5);
      R(g, 18, -4, 28, 20, w5[1]);
      if (v) lamp(g, 20, -2, 24, 17, [0, 1, 0, 2][f]); else { R(g, 20, -2, 24, 17, '#2a2630'); R(g, 28, 6, 8, 6, '#4a4650'); }
      for (let x = 20; x < 44; x += 4) R(g, x, -2, 1, 17, w5[1]);
      for (let y = 2; y < 15; y += 4) R(g, 20, y, 24, 1, w5[1]);
      R(g, 31, -2, 2, 17, w5[2]);
      // roof: sweeping eaves
      poly(g, [0, -4, 64, -4, 60, -8, 54, -22, 10, -22, 4, -8], r5[2]);
      for (let r = 0; r < 4; r++) R(g, 6 + r, -20 + r * 4, 52 - r * 2, 1, r5[1]);
      R(g, 10, -22, 44, 2, r5[4]); R(g, 8, -24, 48, 2, r5[1]);
      R(g, 0, -5, 64, 2, r5[0]); R(g, 0, -6, 4, 2, r5[3]); R(g, 60, -6, 4, 2, r5[1]);
      // rope and paper streamers
      R(g, 13, -1, 38, 2, K.FIX.straw[3]); R(g, 13, 0, 38, 1, K.FIX.straw[1]);
      for (const x of [20, 31, 42]) { R(g, x, 1, 3, 2, PP[4]); R(g, x + 1, 3, 3, 2, PP[3]); R(g, x, 5, 3, 2, PP[4]); }
    },
    over(g, M, v, f) { if (v) K.halo(g, 32, 6, 14, '#ffd27a', 0.1 + (f === 1 ? 0.03 : 0)); },
    shadow: () => [32, 29, 30, 3, 0.34],
  });

  // Temple bell: a timber frame and a bronze bell with bands and bosses.
  const BRONZE = ramp('#8a7a4a', 0.5, 0.45);
  art('bell', {
    box: [-4, -28, 72, 92],
    draw(g, M) {
      const w5 = M.wood, b5 = BRONZE;
      post(g, 5, -16, 5, 78, w5); post(g, 54, -16, 5, 78, w5);
      plank(g, 0, -20, 64, 5, w5, 3);
      R(g, -2, -24, 68, 4, M.roof[2]); R(g, -2, -24, 68, 1, M.roof[4]); R(g, -2, -21, 68, 1, M.roof[0]);
      R(g, 30, -15, 4, 8, IR[2]);
      K.shade(g, 16, -8, 32, 46, b5, (fx, fy) => {
        const t = (fy + 6) / 40;
        if (t < 0 || t > 1) return null;
        const hw = t < 0.18 ? 11 * Math.sqrt(t / 0.18) : 11 + (t > 0.85 ? (t - 0.85) * 18 : 0);
        const dx = fx - 32;
        if (Math.abs(dx) > hw) return null;
        let I = (-dx / hw) * 0.6 + 0.25 - t * 0.2;
        if (Math.abs(fy - 12) < 1 || Math.abs(fy - 26) < 1) I -= 0.5;
        if (t > 0.18 && t < 0.4 && (Math.round(fx) % 4 === 0) && (Math.round(fy) % 4 === 0)) I += 0.5;
        return I;
      }, 5, 0.06, 3, 2);
      ell(g, 27, 30, 3, 2.5, b5[3]); ell(g, 27, 30, 1.5, 1.2, b5[1]);
      R(g, 22, 34, 20, 1, b5[0]);
    },
    shadow: () => [32, 61, 28, 3, 0.3],
  });
  // Brass telescope on an iron tripod.
  art('telescope', {
    box: [-4, -16, 40, 50],
    draw(g) {
      const b5 = BR;
      line(g, 16, 12, 8, 29, IR[2], 2); line(g, 16, 12, 24, 29, IR[1], 2); line(g, 16, 12, 16, 30, IR[3], 2);
      line(g, 5, 13, 28, -3, b5[1], 5);
      line(g, 5, 12, 28, -4, b5[2], 3);
      line(g, 5, 11, 28, -5, b5[4], 1);
      line(g, 26, -6, 30, 0, b5[1], 3); R(g, 28, -4, 2, 2, '#3a5a7a');
      line(g, 2, 13, 6, 16, b5[0], 2);
      R(g, 14, 9, 5, 4, IR[2]);
    },
    shadow: () => [16, 29, 10, 2.5, 0.3],
  });
  // Pottery kiln: a domed brick kiln with a vent; the mouth glows unless
  // o.sealed, when it is plastered shut and marked with a glass seal.
  const KILN = ramp('#7a5a4a', 0.5, 0.4);
  art('kiln', {
    box: [-6, -52, 108, 116],
    v: (o) => (o.sealed ? 1 : 0),
    draw(g, M, v, f, info) {
      const k5 = KILN;
      const inside = (fx, fy) => { if (fy > 60 || fy < -40) return false; const t = (fy + 40) / 100, hw = 44 * Math.sqrt(Math.min(1, t / 0.55)) + (t > 0.55 ? (t - 0.55) * 8 : 0); return Math.abs(fx - 48) <= hw; };
      K.shade(g, 0, -44, 96, 106, k5, (fx, fy) => {
        if (!inside(fx, fy)) return null;
        const dx = (fx - 48) / 44, t = (fy + 40) / 100;
        let I = -dx * 0.55 + 0.35 - t * 0.35;
        // brick courses that follow the dome
        const row = Math.floor((fy + 40) / 6), off = row % 2 ? 4 : 0;
        if ((fy + 40) % 6 < 1) I -= 0.45;
        else if (((Math.round(fx) + off) % 9) === 0) I -= 0.35;
        return I;
      }, 7, 0.1, 5, 3);
      // vent
      R(g, 42, -48, 12, 10, k5[1]); R(g, 42, -48, 12, 2, k5[3]); R(g, 44, -46, 8, 2, '#1a1210');
      // mouth arch
      R(g, 34, 26, 28, 34, k5[0]);
      ell(g, 48, 28, 14, 6, k5[0]);
      if (!v) {
        R(g, 37, 30, 22, 30, '#2a1410'); ell(g, 48, 30, 11, 4, '#2a1410');
        R(g, 40, 42, 16, 16, '#f08a3a'); R(g, 42, 44, 12, 12, '#ffb45a'); R(g, 45, 47, 6, 6, '#ffe39c');
        R(g, 38, 56, 20, 4, K.FIX.char[3]);
      } else {
        R(g, 37, 30, 22, 30, '#5a4a42'); ell(g, 48, 30, 11, 4, '#5a4a42');
        streaks(g, 38, 32, 20, 26, '#6e5c52', 3, 8, 5);
        R(g, 35, 26, 26, 3, '#8fb8b0'); R(g, 46, 24, 4, 36, '#8fb8b0'); R(g, 46, 24, 1, 36, '#c8e8e0');
      }
      if (info.snow) K.snowTops(g, -6, -52, 108, 80, M.snow, 2, 3);
    },
    over(g, M, v) { if (!v) K.halo(g, 48, 48, 18, '#ff9a40', 0.12); },
    shadow: () => [48, 61, 46, 4, 0.34],
  });

  // ---- stone -------------------------------------------------------------------------------------
  // Column: base and capital mouldings, a fluted, lit shaft.
  art('pillar', {
    box: [-2, -46, 36, 80],
    draw(g, M, v, f, info) {
      const s5 = M.stone;
      for (let i = 0; i < 18; i++) { const c = cylCol(i, 18, s5); R(g, 7 + i, -30, 1, 54, c); }
      for (const x of [10, 14, 18, 22]) R(g, x, -28, 1, 50, s5[x < 13 ? 2 : 1]);
      // capital
      cyl(g, 5, -34, 22, 4, s5); R(g, 5, -34, 22, 1, s5[4]);
      cyl(g, 2, -40, 28, 6, s5); R(g, 2, -40, 28, 1, s5[4]); R(g, 2, -35, 28, 1, s5[0]);
      // base
      cyl(g, 5, 23, 22, 3, s5); R(g, 5, 23, 22, 1, s5[4]);
      cyl(g, 2, 26, 28, 5, s5); R(g, 2, 26, 28, 1, s5[4]);
      R(g, 9, 4, 2, 5, s5[1]); R(g, 20, -12, 3, 2, s5[1]); // wear
      if (info.snow) K.snowTops(g, -2, -46, 36, 20, M.snow, 1, 2);
    },
    shadow: () => [16, 30, 15, 3, 0.34],
  });
  // Stone steps up (interactable way on): treads lit, risers dark, worn in
  // the middle, framed by darker side stones.
  art('stairs', {
    box: [0, 0, 32, 32], outline: false,
    draw(g, M) {
      const s5 = M.stone;
      for (let i = 0; i < 4; i++) {
        const y = i * 8;
        R(g, 0, y, 32, 5, s5[3]); R(g, 0, y, 32, 1, s5[4]);
        R(g, 9, y + 1, 14, 3, s5[4]);
        R(g, 0, y + 5, 32, 3, s5[1]); R(g, 0, y + 7, 32, 1, s5[0]);
      }
      R(g, 0, 0, 3, 32, s5[1]); R(g, 29, 0, 3, 32, s5[0]); R(g, 3, 0, 1, 32, s5[0]); R(g, 28, 0, 1, 32, K.mix(s5[0], '#000000', 0.3));
    },
  });
  // Woven straw mat with a cloth border.
  art('mat', {
    box: [0, 0, 32, 32],
    draw(g) {
      const st = K.FIX.straw, bd = ramp('#3a5a4a', 0.4, 0.3);
      R(g, 3, 9, 26, 16, bd[2]); R(g, 3, 9, 26, 1, bd[3]);
      R(g, 5, 11, 22, 12, st[2]);
      for (let y = 11; y < 23; y++) for (let x = 5 + (y % 2) * 2; x < 27; x += 4) R(g, x, y, 2, 1, st[y % 2 ? 3 : 1]);
    },
    shadow: () => [16, 25, 14, 2, 0.2],
  });

  // ---- outdoor odds and ends ------------------------------------------------------------------------
  art('bench', {
    box: [-2, -2, 68, 36],
    draw(g, M, v, f, info) {
      const w5 = M.wood;
      legs(g, [7, 54], 17, 30, w5);
      R(g, 10, 24, 44, 2, w5[1]);
      top(g, 2, 10, 60, 6, 3, w5, 4);
      R(g, 2, 13, 60, 1, w5[2]);
      if (info.snow) K.snowTops(g, -2, -2, 68, 20, M.snow, 2, 2);
    },
    shadow: () => [32, 29, 30, 3, 0.3],
  });
  // Flowerpot: a tapered terracotta pot, leaves and three flower heads.
  art('flowerpot', {
    box: [0, -10, 32, 44],
    v: (o) => cxy(o) % 3,
    draw(g, M, v, f, info, pal) {
      const c5 = K.FIX.clay, L = M.leaf;
      K.foliage(g, [{ x: 12, y: 8, r: 5 }, { x: 20, y: 7, r: 5 }, { x: 16, y: 12, r: 5.5 }], L, 60 + v, { ao: 0.3, lobe: 0.25 });
      for (let i = 0; i < 3; i++) {
        const fl = ramp(pal.flower[(i + v) % 2 ? 1 : 0], 0.45, 0.3), x = [9, 17, 22][i], y = [4, 1, 7][i] + (v === i ? 1 : 0);
        R(g, x - 1, y, 5, 3, fl[2]); R(g, x, y - 1, 3, 5, fl[2]); R(g, x, y - 1, 2, 1, fl[4]); R(g, x - 1, y, 1, 2, fl[3]);
        R(g, x + 1, y + 1, 1, 1, '#e0b040'); R(g, x + 3, y + 2, 1, 1, fl[1]); R(g, x + 1, y + 3, 2, 1, fl[1]);
      }
      for (let y = 18; y < 30; y++) { const inset = Math.floor((y - 18) / 4); for (let i = 0; i < 16 - inset * 2; i++) R(g, 8 + inset + i, y, 1, 1, cylCol(i, 16 - inset * 2, c5)); }
      R(g, 7, 15, 18, 3, c5[3]); R(g, 7, 15, 18, 1, c5[4]); R(g, 7, 17, 18, 1, c5[1]);
      R(g, 9, 15, 14, 1, '#3a2418');
    },
    shadow: () => [16, 29, 9, 2.5, 0.32],
  });
  // Washing line between two poles, with a shirt, a towel and a blue cloth.
  art('laundry', {
    box: [-2, -26, 100, 60],
    draw(g, M) {
      const w5 = M.wood;
      post(g, 1, -22, 3, 52, w5); post(g, 92, -22, 3, 52, w5);
      for (let x = 3; x < 93; x++) R(g, x, Math.round(-19 + Math.sin(((x - 3) / 90) * PI) * 3), 1, 1, '#e8e0d0');
      const sag = (x) => Math.round(-18 + Math.sin(((x - 3) / 90) * PI) * 3);
      const cloth = (x0, w, h, c5, sleeves) => {
        for (let i = 0; i < w; i++) {
          const y0 = sag(x0 + i), hem = h + (((x0 + i) >> 1) % 2);
          R(g, x0 + i, y0, 1, hem, c5[i < 2 ? 3 : i > w - 3 ? 1 : (i % 5 === 2 ? 1 : 2)]);
          R(g, x0 + i, y0, 1, 1, c5[4]);
        }
        if (sleeves) { R(g, x0 - 4, sag(x0) + 1, 4, 7, c5[3]); R(g, x0 + w, sag(x0 + w) + 1, 4, 7, c5[1]); }
        R(g, x0 + 1, sag(x0) - 1, 2, 3, w5[1]); R(g, x0 + w - 3, sag(x0 + w - 3) - 1, 2, 3, w5[1]);
      };
      cloth(14, 16, 18, ramp('#c86a5a', 0.45, 0.35), true);
      cloth(38, 18, 14, K.FIX.paper, false);
      cloth(64, 16, 21, ramp('#5a7ab0', 0.45, 0.35), false);
    },
    ground(g) { K.shadow(g, 3, 30, 4, 1.5, 0.3); K.shadow(g, 94, 30, 4, 1.5, 0.3); },
  });
  // Anvil on a round wooden block.
  art('anvil', {
    box: [-2, -2, 36, 36],
    draw(g, M) {
      const w5 = M.wood;
      cyl(g, 10, 20, 13, 10, w5); ell(g, 16.5, 20, 6.5, 2, w5[4]);
      R(g, 13, 13, 7, 6, IR[2]); R(g, 13, 13, 2, 6, IR[3]);
      R(g, 9, 17, 15, 4, IR[2]); R(g, 9, 17, 15, 1, IR[3]);
      poly(g, [2, 9, 8, 7, 27, 7, 27, 13, 8, 13], IR[2]);
      R(g, 7, 7, 20, 2, IR[4]); R(g, 3, 9, 5, 1, IR[3]);
      R(g, 8, 12, 19, 1, IR[1]); R(g, 22, 8, 2, 1, IR[0]);
    },
    shadow: () => [16, 29, 12, 3, 0.34],
  });
  // Haystack: a straw mound with combed strands and a binding rope.
  art('hay', {
    box: [-2, -6, 36, 40],
    v: (o) => cxy(o) % 3,
    draw(g, M, v, f, info) {
      const st = K.FIX.straw;
      K.shade(g, 0, -4, 32, 34, st, (fx, fy) => {
        const nx = (fx - 16) / 14, ny = (fy - 17) / 13;
        if (nx * nx + ny * ny > 1 || fy > 29) return null;
        const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
        let I = -0.5 * nx - 0.55 * ny + 0.55 * nz - 0.05;
        if ((Math.round(fx * 1.0 + Math.abs(fy - 17) * 0.4) % 3) === 0) I -= 0.2;
        return I;
      }, 30 + v, 0.24, 2, 4);
      for (let x = 3; x < 30; x++) R(g, x, 19 + Math.round(Math.sin((x - 3) / 27 * PI) * 2), 1, 2, st[x < 12 ? 1 : 0]);
      if (info.snow) K.snowTops(g, -2, -6, 36, 30, M.snow, v, 3);
    },
    shadow: () => [16, 29, 14, 3, 0.34],
  });
  // Tree stump: bark sides, a lit cut face with growth rings, roots.
  art('stump', {
    box: [-2, 0, 36, 34],
    v: (o) => cxy(o) % 3,
    draw(g, M, v, f, info) {
      const tr = M.trunk, w5 = M.wood;
      for (let y = 13; y < 29; y++) { const fl = y > 24 ? y - 24 : 0; for (let i = 0; i < 20 + fl * 2; i++) R(g, 6 - fl + i, y, 1, 1, cylCol(i, 20 + fl * 2, tr)); }
      streaks(g, 8, 16, 16, 10, tr[1], v, 5, 4, true);
      R(g, 2, 28, 5, 2, tr[2]); R(g, 25, 28, 6, 2, tr[1]);
      ell(g, 16, 13, 10, 4, w5[3]);
      ell(g, 16, 13, 7, 2.6, w5[4]);
      ell(g, 16, 13, 4.5, 1.5, w5[3]);
      R(g, 15, 13, 2, 1, w5[2]);
      if (v === 1) { line(g, 18, 11, 24, 14, w5[1], 1); }
      if (info.snow) K.snowTops(g, -2, 0, 36, 20, M.snow, v, 3);
    },
    shadow: () => [16, 29, 13, 3, 0.34],
  });
  // Campfire: a ring of stones, crossed logs, a lively fire and sparks.
  art('campfire', {
    box: [-2, -20, 36, 54],
    f: (t, o) => K.frame(t, 90, 6, o.still),
    draw(g, M, v, f) {
      const s5 = M.stone, w5 = M.wood;
      for (let i = 0; i < 10; i++) { const a = (i / 10) * PI * 2, x = 16 + Math.cos(a) * 12, y = 24 + Math.sin(a) * 5; if (Math.sin(a) < 0) { ell(g, x, y, 3, 2.2, s5[2]); R(g, Math.round(x - 2), Math.round(y - 2), 2, 1, s5[4]); } }
      line(g, 7, 26, 25, 20, w5[1], 3); line(g, 7, 25, 25, 19, w5[3], 1);
      line(g, 8, 20, 25, 26, w5[2], 3); line(g, 8, 19, 25, 25, w5[4], 1);
      R(g, 11, 22, 10, 3, K.FIX.ember[1]);
      fire(g, 16, 23, 12, 20, f, 3);
      for (let i = 0; i < 10; i++) { const a = (i / 10) * PI * 2, x = 16 + Math.cos(a) * 12, y = 24 + Math.sin(a) * 5; if (Math.sin(a) >= 0) { ell(g, x, y, 3, 2.2, s5[2]); R(g, Math.round(x - 2), Math.round(y - 2), 2, 1, s5[4]); R(g, Math.round(x), Math.round(y + 1), 2, 1, s5[0]); } }
    },
    over(g, M, v, f) {
      K.halo(g, 16, 14, 16, '#ffb050', 0.12 + (f % 3) * 0.02);
      for (let i = 0; i < 3; i++) { const y = -2 - ((f * 5 + i * 7) % 18), x = 12 + ((i * 7 + f * 3) % 9); R(g, x, y, 1, 1, K.FIX.ember[4]); }
    },
    shadow: () => [16, 27, 14, 3.5, 0.3],
  });
  // Canvas tent: an A-frame with a tied-back door flap, guy ropes, pegs.
  art('tent', {
    box: [-6, -24, 76, 58],
    draw(g) {
      const c5 = ramp('#b8805a', 0.45, 0.35);
      poly(g, [32, -14, 4, 29, 32, 29], c5[3]);
      poly(g, [32, -14, 60, 29, 32, 29], c5[1]);
      for (const k of [0.33, 0.66]) { line(g, 32, -14, 32 - 28 * k, 29, c5[2], 1); line(g, 32, -14, 32 + 28 * k, 29, c5[0], 1); }
      poly(g, [32, 0, 25, 29, 39, 29], '#2a1e18');
      poly(g, [32, 0, 25, 29, 21, 29, 30, 4], c5[4]);
      R(g, 23, 20, 4, 2, c5[1]);
      R(g, 30, -17, 4, 4, c5[0]);
      line(g, 6, 27, -3, 30, '#d8c8a0', 1); line(g, 58, 27, 67, 30, '#c8b890', 1);
      R(g, -4, 29, 2, 2, '#6a4a30'); R(g, 66, 29, 2, 2, '#6a4a30');
    },
    shadow: () => [32, 29, 30, 3.5, 0.3],
  });
  // Statue: a robed stone figure with folded hands on a stepped plinth.
  art('statue', {
    box: [-2, -34, 36, 68],
    draw(g, M, v, f, info) {
      const s5 = M.stone;
      R(g, 2, 24, 28, 7, s5[2]); R(g, 2, 24, 28, 1, s5[4]); R(g, 29, 24, 1, 7, s5[1]);
      R(g, 5, 19, 22, 5, s5[3]); R(g, 5, 19, 22, 1, s5[4]);
      K.shade(g, 4, -26, 24, 46, s5, (fx, fy) => {
        const dx = fx - 16;
        if (fy >= -20 && fy < -8) { const ny = (fy + 14) / 6, nx = dx / 5.5; if (nx * nx + ny * ny <= 1) return -0.55 * nx - 0.5 * ny + 0.3; }
        if (fy >= -9 && fy < 19) { const t = (fy + 9) / 28, hw = 5 + t * 5; if (Math.abs(dx) <= hw) { let I = -dx / hw * 0.6 + 0.2 - t * 0.2; if (Math.round(fx) % 4 === 1 && fy > 4) I -= 0.3; return I; } }
        return null;
      }, 12, 0.08, 3, 2);
      R(g, 13, 0, 7, 3, s5[3]); R(g, 13, 3, 7, 1, s5[1]);
      R(g, 13, -14, 2, 1, s5[1]); R(g, 17, -14, 2, 1, s5[1]);
      if (info.snow) K.snowTops(g, -2, -34, 36, 58, M.snow, 1, 2);
      else if (info.green) K.snowTops(g, -2, 16, 36, 12, M.grass, 4, 1);
    },
    shadow: () => [16, 30, 15, 3, 0.34],
  });
  // Glassware on a stand: a round flask, a tall bottle, a jar.
  art('glassware', {
    box: [0, -8, 32, 42],
    draw(g, M) {
      const w5 = M.wood;
      R(g, 3, 16, 26, 13, w5[2]); R(g, 3, 16, 26, 2, w5[4]); R(g, 3, 18, 26, 1, w5[1]);
      R(g, 5, 20, 22, 7, w5[1]); R(g, 6, 21, 20, 5, w5[3]);
      const gA = ramp('#9fd8d0', 0.45, 0.45), gB = ramp('#c8e8f0', 0.4, 0.4), gC = ramp('#e8c8a0', 0.45, 0.4);
      shadeBall(g, 9, 12, 4.5, 4.5, gA, 1); R(g, 8, 3, 3, 6, gA[2]); R(g, 8, 3, 1, 6, gA[3]); R(g, 7, 2, 5, 1, gA[1]);
      R(g, 14, -2, 5, 18, gB[2]); R(g, 14, -2, 1, 18, gB[4]); R(g, 18, -2, 1, 18, gB[1]); R(g, 15, -5, 3, 3, gB[1]); R(g, 14, 8, 5, 8, gB[1]);
      R(g, 21, 7, 7, 9, gC[2]); R(g, 21, 7, 2, 9, gC[3]); R(g, 27, 7, 1, 9, gC[1]); R(g, 21, 5, 7, 2, w5[1]);
    },
    over(g) { R(g, 7, 10, 1, 2, '#ffffff'); R(g, 15, 0, 1, 4, 'rgba(255,255,255,0.8)'); R(g, 22, 9, 1, 3, 'rgba(255,255,255,0.7)'); },
    shadow: () => [16, 29, 14, 3, 0.3],
  });
  // Loom: a timber frame, a warp of two-tone threads, a band of patterned
  // cloth and a shuttle.
  art('loom', {
    box: [-2, -22, 68, 56],
    draw(g, M) {
      const w5 = M.wood, a = ramp('#c8a0a0', 0.4, 0.3), b = ramp('#8a5a7a', 0.45, 0.35);
      for (let x = 10; x < 55; x++) R(g, x, -12, 1, 18, (x % 3) ? a[2 + (x % 2)] : b[2]);
      for (let y = 6; y < 17; y++) for (let x = 10; x < 55; x++) R(g, x, y, 1, 1, ((x + (y >> 1) * 2) % 8 < 4) ? (y % 4 < 2 ? b[3] : b[2]) : a[3]);
      R(g, 10, 6, 45, 1, a[4]);
      post(g, 4, -14, 5, 44, w5); post(g, 55, -14, 5, 44, w5);
      plank(g, 2, -17, 60, 5, w5, 1);
      plank(g, 6, 16, 52, 4, w5, 2);
      R(g, 8, 26, 48, 2, w5[1]);
      poly(g, [22, 12, 44, 12, 40, 15, 26, 15], w5[3]); R(g, 30, 12, 6, 1, w5[4]);
    },
    shadow: () => [32, 30, 30, 3, 0.3],
  });
  // Post box (interactable): red lacquer with a little roof, a slot and a
  // brass plate, on a post.
  art('mailbox', {
    box: [0, -8, 32, 42], ink: true,
    draw(g, M, v, f, info) {
      const L = K.FIX.lacquer;
      post(g, 14, 12, 4, 18, M.wood);
      R(g, 7, -1, 18, 15, L[2]); R(g, 7, -1, 2, 15, L[3]); R(g, 23, -1, 2, 15, L[1]); R(g, 7, 13, 18, 1, L[0]);
      poly(g, [5, -1, 27, -1, 24, -5, 8, -5], L[3]); R(g, 8, -5, 16, 1, L[4]); R(g, 5, -1, 22, 1, L[1]);
      R(g, 10, 3, 12, 2, '#1c0e10'); R(g, 10, 5, 12, 1, L[4]);
      R(g, 13, 8, 6, 3, BR[3]); R(g, 13, 8, 6, 1, BR[4]); R(g, 15, 9, 2, 1, BR[1]);
      if (info.snow) K.snowTops(g, 0, -8, 32, 10, M.snow, 1, 2);
    },
    shadow: () => [16, 30, 8, 2.5, 0.3],
  });
  // Waymarker (interactable): a dressed standing stone with carved
  // characters on a base stone; moss or snow on its crown.
  art('stone_marker', {
    box: [0, -20, 32, 54], ink: true,
    v: (o) => cxy(o) % 3,
    draw(g, M, v, f, info) {
      const s5 = M.stone;
      R(g, 5, 24, 22, 7, s5[2]); R(g, 5, 24, 22, 1, s5[4]); R(g, 26, 24, 1, 7, s5[1]);
      K.shade(g, 8, -16, 16, 41, s5, (fx, fy) => {
        const dx = fx - 16;
        if (Math.abs(dx) > 7) return null;
        if (fy < -10 + (dx * dx) / 8) return null;
        let I = -dx / 7 * 0.55 + 0.25 - (fy + 12) / 36 * 0.25;
        if (Math.abs(dx) > 5.5) I += dx < 0 ? 0.25 : -0.3;
        return I;
      }, 20 + v, 0.1, 4, 3);
      // a carved inscription panel: a sunk border and vertical grooves (the words are read in the dialogue layer)
      R(g, 12, -8, 8, 24, s5[1]); R(g, 12, -8, 8, 1, s5[0]); R(g, 12, 15, 8, 1, s5[4]);
      for (let i = 0; i < 2; i++) { const L = 14 + (hh(v, i, 7) % 6); R(g, 14 + i * 3, -5, 1, L, s5[0]); R(g, 15 + i * 3, -5, 1, L, s5[3]); }
      if (info.snow) K.snowTops(g, 0, -20, 32, 16, M.snow, v, 2);
      else if (info.green) K.snowTops(g, 0, -20, 32, 12, M.grass, v, 1);
    },
    shadow: () => [16, 30, 12, 3, 0.34],
  });

  // ---- water's edge ------------------------------------------------------------------------------------
  // Pier decking: planks with staggered butt joints and nails, a pile at the
  // front corner; decks join edge to edge.
  art('pier', {
    box: [0, 0, 32, 36], outline: false,
    v: (o) => cxy(o) % 4,
    draw(g, M, v) {
      const w5 = M.wood;
      for (let i = 0; i < 4; i++) {
        const y = i * 8, j = (hh(v, i, 3) % 20) + 6;
        plank(g, 0, y, 32, 8, w5, v * 4 + i);
        R(g, j, y + 1, 1, 6, w5[0]); R(g, j + 1, y + 1, 1, 6, w5[4]);
        nail(g, j - 2, y + 2); nail(g, j + 3, y + 5);
      }
      cyl(g, 2, 28, 5, 8, w5);
    },
    ground(g, M) { R(g, 0, 32, 32, 3, K.rgba(M.water[0], 0.6)); },
  });
  // Fishing net drying between two poles, with cork floats.
  art('net', {
    box: [-2, -6, 68, 40],
    draw(g, M) {
      const w5 = M.wood, nc = ramp('#8a8070', 0.4, 0.35);
      post(g, 2, -2, 4, 32, w5); post(g, 58, -2, 4, 32, w5);
      const bottom = (x) => 24 + Math.round(Math.sin(((x - 6) / 52) * PI) * 3);
      for (let x = 6; x < 58; x++) for (let y = 2; y < bottom(x); y++) {
        const a = (x + y) % 6, b = (x - y + 60) % 6;
        if (a === 0 || b === 0) R(g, x, y, 1, 1, a === 0 && b === 0 ? nc[4] : nc[a === 0 ? 3 : 1]);
      }
      R(g, 5, 1, 54, 1, nc[2]);
      for (let x = 9; x < 58; x += 8) { R(g, x, 0, 4, 3, '#c8a070'); R(g, x, 0, 4, 1, '#e8c890'); }
    },
    shadow: () => [32, 29, 30, 2.5, 0.2],
  });
  // Snowman: two packed snowballs, coal eyes, a carrot, twig arms, a scarf.
  art('snowman', {
    box: [-4, -18, 40, 52],
    draw(g, M) {
      const s5 = M.snow;
      shadeBall(g, 16, 20, 10, 9, s5, 3);
      shadeBall(g, 16, 3, 7, 6.5, s5, 4);
      line(g, 7, 14, 0, 9, '#5a3a24', 1); line(g, 25, 14, 31, 8, '#5a3a24', 1); R(g, 30, 7, 1, 2, '#5a3a24');
      R(g, 9, 8, 14, 3, '#b84a3a'); R(g, 9, 8, 14, 1, '#d86a4a'); R(g, 19, 10, 3, 6, '#a83a2a');
      R(g, 13, 1, 2, 2, '#22222a'); R(g, 18, 1, 2, 2, '#22222a');
      R(g, 16, 4, 4, 1, '#e08040'); R(g, 16, 5, 2, 1, '#c86a30');
      for (const y of [15, 20, 25]) R(g, 15, y, 2, 2, '#2a2a32');
    },
    shadow: () => [16, 29, 11, 3, 0.3],
  });

  // ---- glints and marks (animated, not outlined) -----------------------------------------------------------
  // Sparkle: something to find — a four-point star that swells and fades.
  art('sparkle', {
    box: [0, -8, 32, 40], outline: false,
    f: (t, o) => K.frame(t, 120, 8, o.still, (o.cx | 0) * 0.5),
    draw(g, M, v, f) {
      const a = [0.55, 0.75, 0.95, 1, 0.9, 0.7, 0.5, 0.4][f], L = Math.round(4 + a * 6);
      const c = (al) => 'rgba(255,240,180,' + al.toFixed(2) + ')';
      R(g, 15, 12 - L, 2, L * 2, c(a * 0.9));
      R(g, 16 - L, 11, L * 2, 2, c(a * 0.9));
      R(g, 14, 9, 4, 6, c(a)); R(g, 13, 10, 6, 4, c(a));
      R(g, 15, 10, 2, 4, 'rgba(255,255,255,' + a.toFixed(2) + ')');
      if (f % 4 < 2) { R(g, 22, 4 + f, 2, 2, c(0.7)); R(g, 8, 17 - f, 2, 2, c(0.6)); }
    },
  });
  // Ink: a pool of dark ink with a slow sheen.
  art('ink', {
    box: [0, 0, 32, 32], outline: false,
    f: (t, o) => K.frame(t, 260, 6, o.still),
    draw(g, M, v, f) {
      const k = K.FIX.ink;
      ell(g, 16, 20, 12, 6, k[1]); ell(g, 14, 19, 8, 4, k[2]);
      ell(g, 6, 16, 2, 1.5, k[1]); ell(g, 27, 24, 1.6, 1.2, k[1]); ell(g, 25, 15, 1.2, 1, k[2]);
      R(g, 9 + f, 17, 5, 1, k[4]); R(g, 10 + f, 18, 3, 1, k[3]);
      if (f === 2 || f === 3) R(g, 18, 22, 3, 1, k[4]);
    },
  });
  // Echo: a remembered voice — rings spreading from one spot.
  art('echo', {
    box: [0, -8, 32, 40], outline: false,
    f: (t, o) => K.frame(t, 150, 8, o.still),
    draw(g, M, v, f) {
      for (let k = 0; k < 2; k++) {
        const ph = ((f + k * 4) % 8) / 8, r = 3 + ph * 11, a = (1 - ph) * 0.8;
        const col = 'rgba(168,200,216,' + a.toFixed(2) + ')';
        for (let i = 0; i < 24; i++) { const an = (i / 24) * PI * 2; if (Math.sin(an) > 0.75) continue; R(g, Math.round(16 + Math.cos(an) * r), Math.round(10 + Math.sin(an) * r * 0.7), 1, 1, col); }
      }
      R(g, 15, 9, 2, 2, 'rgba(210,232,240,0.9)');
    },
  });
  // Water over another tile (a gap in a bridge): ripples drifting across.
  art('water', {
    box: [0, 0, 32, 32], outline: false,
    f: (t, o) => K.frame(t, 200, 8, o.still),
    draw(g, M, v, f) {
      const w = M.water;
      R(g, 0, 0, 32, 32, w[0]);
      for (let r = 0; r < 4; r++) { const y = 3 + r * 8, off = ((f + r * 3) % 8) * 4; for (let x = -32; x < 32; x += 16) R(g, x + off, y + (r % 2), 9, 1, w[1]); }
      R(g, (f * 3) % 24 + 2, 13, 6, 1, w[2]); R(g, (f * 3 + 13) % 26 + 2, 23, 4, 1, w[2]);
      if (f % 4 === 0) R(g, 20, 6, 2, 1, w[3]);
    },
  });

  // ---- doors, mats, holes (interactable ways) -------------------------------------------------------------------
  art('door', {
    box: [0, -2, 32, 36], ink: true,
    draw(g, M) {
      const w5 = M.wood, fr = ramp(mix(w5[1], '#2a1e18', 0.5), 0.4, 0.3);
      R(g, 4, 0, 24, 32, fr[2]); R(g, 4, 0, 24, 3, fr[3]); R(g, 4, 0, 24, 1, fr[4]);
      for (let i = 0; i < 4; i++) plank(g, 7 + i * 5, 3, 5, 29, w5, 30 + i, true);
      for (const y of [8, 24]) { R(g, 7, y, 12, 2, IR[2]); R(g, 7, y, 12, 1, IR[3]); nail(g, 9, y); nail(g, 15, y); }
      ell(g, 22, 17, 2.2, 2.2, BR[2]); R(g, 21, 16, 1, 1, BR[4]); R(g, 22, 17, 1, 1, BR[0]);
      R(g, 3, 30, 26, 2, M.stone[3]); R(g, 3, 30, 26, 1, M.stone[4]);
    },
  });
  // Exit mat (interactable): a straw mat with a dark border and a woven
  // diamond, lying just inside a doorway.
  art('exitmat', {
    box: [0, 0, 32, 32], ink: true,
    draw(g) {
      const b = ramp('#7a5236', 0.45, 0.35), m = ramp('#9a6a44', 0.45, 0.4);
      R(g, 3, 19, 26, 12, b[2]); R(g, 3, 19, 26, 1, b[3]); R(g, 3, 30, 26, 1, b[1]);
      R(g, 5, 21, 22, 8, m[2]);
      for (let y = 21; y < 29; y++) for (let x = 5 + (y % 2); x < 27; x += 2) R(g, x, y, 1, 1, m[3]);
      for (let k = 0; k < 4; k++) { R(g, 16 - k, 22 + k, 1, 1, m[4]); R(g, 15 + k, 22 + k, 1, 1, m[4]); R(g, 16 - k, 28 - k, 1, 1, m[1]); R(g, 15 + k, 28 - k, 1, 1, m[1]); }
      for (let x = 4; x < 28; x += 3) { R(g, x, 18, 1, 1, b[3]); R(g, x, 31, 1, 1, b[1]); }
    },
  });
  // Hole: a pit with a lit far wall and a dark bottom.
  art('hole', {
    box: [0, 0, 32, 32], outline: false,
    draw(g, M) {
      const d = M.stone;
      ell(g, 16, 18, 13, 8.5, K.mix(d[2], '#2a2018', 0.4));
      ell(g, 16, 18, 12, 7.5, K.mix(d[1], '#2a2018', 0.3));
      ell(g, 16, 19.5, 11, 6, '#1a1418');
      ell(g, 16, 20.5, 9, 4.5, '#0a0a10');
      R(g, 7, 12, 6, 1, d[3]); R(g, 19, 12, 4, 1, d[4]);
    },
  });

  // ---- millstone and gears (animated machinery) -----------------------------------------------------------
  // Millstone: a thick bed stone and a turning runner stone with dressed
  // grooves and a wooden handle peg (24 frames; still with o.still).
  art('millstone', {
    box: [-4, -6, 72, 76],
    f: (t, o) => (o.still ? 0 : Math.floor(((t / 900) % (2 * PI)) / (PI / 12)) % 24),
    draw(g, M, v, f) {
      const s5 = M.stone, w5 = M.wood, a = (f * PI) / 12;
      for (let i = 0; i < 58; i++) R(g, 3 + i, 36, 1, 8 + Math.round(Math.sqrt(Math.max(0, 1 - Math.pow((i - 28.5) / 29, 2))) * 17), cylCol(i, 58, s5));
      ell(g, 32, 36, 29, 17, s5[3]);
      ell(g, 32, 35, 27, 15.5, s5[3]);
      for (let i = 0; i < 40; i++) R(g, 12 + i, 28, 1, 8 + Math.round(Math.sqrt(Math.max(0, 1 - Math.pow((i - 19.5) / 20, 2))) * 11), cylCol(i, 40, s5));
      ell(g, 32, 28, 20, 11, s5[4]);
      ell(g, 32, 28, 18, 9.8, s5[3]);
      for (let k = 0; k < 8; k++) { const an = a + (k * PI) / 4; line(g, 32 + Math.cos(an) * 5, 28 + Math.sin(an) * 2.8, 32 + Math.cos(an) * 17, 28 + Math.sin(an) * 9.4, s5[1], 1); }
      ell(g, 32, 28, 4, 2.4, '#2a2420'); R(g, 30, 27, 3, 1, K.FIX.straw[3]);
      const hx = 32 + Math.cos(a) * 13, hy = 28 + Math.sin(a) * 7.2;
      R(g, Math.round(hx) - 1, Math.round(hy) - 12, 3, 12, w5[3]); R(g, Math.round(hx) - 1, Math.round(hy) - 12, 1, 12, w5[4]); R(g, Math.round(hx) + 1, Math.round(hy) - 12, 1, 12, w5[1]);
    },
    shadow: () => [32, 58, 30, 5, 0.34],
  });
  // Gears on a timber backboard; the gears turn (o.jammed holds them).
  function gearSprite(r, teeth, frame, frames) {
    return K.cached('gear|' + r + '|' + teeth + '|' + frame, () => K.make(r * 2 + 8, r * 2 + 8, (g) => {
      const c = r + 4, a = (frame / frames) * (2 * PI / teeth);
      for (let i = 0; i < teeth; i++) {
        const an = a + (i * 2 * PI) / teeth, cs = Math.cos(an), sn = Math.sin(an), px = -sn, py = cs;
        poly(g, [c + cs * (r - 2) + px * 2.2, c + sn * (r - 2) + py * 2.2, c + cs * (r + 3) + px * 1.5, c + sn * (r + 3) + py * 1.5, c + cs * (r + 3) - px * 1.5, c + sn * (r + 3) - py * 1.5, c + cs * (r - 2) - px * 2.2, c + sn * (r - 2) - py * 2.2], cs + sn < -0.4 ? IR[4] : cs + sn > 0.6 ? IR[1] : IR[3]);
      }
      ring(g, c, c, r - 4, r, IR);
      ell(g, c, c, r - 4, r - 4, IR[1]);
      for (let i = 0; i < 4; i++) { const an = a + (i * PI) / 2; line(g, c, c, c + Math.cos(an) * (r - 4), c + Math.sin(an) * (r - 4), IR[2], 2); }
      ell(g, c, c, 3, 3, IR[3]); R(g, c - 1, c - 1, 2, 2, IR[0]);
      g.setTransform(1, 0, 0, 1, 0, 0);
      K.outline(g, r * 2 + 8, r * 2 + 8, 'sel');
    }));
  }
  art('gears', {
    box: [-2, -20, 68, 52],
    draw(g, M) {
      const w5 = M.wood;
      R(g, 0, -16, 64, 44, w5[1]);
      for (let i = 0; i < 4; i++) plank(g, 2, -14 + i * 10, 60, 10, w5, 20 + i);
      post(g, 0, -18, 4, 48, w5); post(g, 60, -18, 4, 48, w5);
    },
    shadow: () => [32, 29, 32, 3, 0.3],
    live(c, x, y, pal, t, o) {
      const a1 = o.jammed ? 0.3 : t / 700, a2 = o.jammed ? 0.3 : (-1.4 * t) / 700;
      const fr = (a) => { const p = (2 * PI) / 8; return Math.floor(((((a % p) + p) % p) / p) * 8) % 8; };
      const g1 = gearSprite(14, 8, o.still && !o.jammed ? 0 : fr(a1), 8), g2 = gearSprite(10, 8, o.still && !o.jammed ? 0 : fr(a2), 8);
      c.drawImage(g1, x + 20 - 18, y + 4 - 18);
      c.drawImage(g2, x + 46 - 14, y + 10 - 14);
    },
  });
  // Ladder (interactable way up): two lit rails and pegged rungs.
  art('ladder', {
    box: [0, -26, 32, 60], ink: true,
    draw(g, M) {
      const w5 = M.wood;
      for (let y = -18; y < 30; y += 7) { R(g, 9, y, 14, 3, w5[3]); R(g, 9, y, 14, 1, w5[4]); R(g, 9, y + 2, 14, 1, w5[1]); }
      post(g, 6, -22, 4, 53, w5); post(g, 22, -22, 4, 53, w5);
    },
    shadow: () => [16, 30, 12, 2, 0.3],
  });

  // helpers shared with the chapter prop art in src/content
  Object.assign(RB.propArt.kit, { legs, fire, ring, spokeWheel, books, lanternBody, BOOKS });
})();
