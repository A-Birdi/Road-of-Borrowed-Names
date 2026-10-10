/* Manybridge's props (expansion P08): a bridge's name plaque, a canal barge, the lock vault under the lock-keeper's
 * house, the noodle stalls, the porters' canal table and a bricked-up door. Each has a flat 16-px drawing (the
 * fallback, as every prop) and its art-resolution version (draw2) in the world's prop style
 * (src/engine/26–28_*.js): light from the upper left, hue-shifted ramps, an ink outline on what can be looked at,
 * a soft contact shadow, cached sprites. Interim regional assets under AC-1 (C-82): the region's material kit is
 * finished in the game-wide art pass (P16). */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const P = RB.props.P;
  const px = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  const def = (id, o, draw) => (P[id] = Object.assign({ id, w: 1, h: 1, block: true }, o, { draw }));
  const still = () => RB.game && RB.game.reducedMotion && RB.game.reducedMotion();
  // a plaque reads once its bridge's name has been read back (flag mb_pl_<bridge>)
  const named = (o) => { const s = RB.game && RB.game.s; return !!(s && o && o.bridge && s.flags && s.flags['mb_pl_' + o.bridge]); };

  // ---- flat fallbacks (16 px a tile) -------------------------------------------------------------------------------
  def('mb_plaque', {}, (c, x, y, p, t, o) => {
    px(c, x + 6, y + 2, 4, 13, p.stone[2]); px(c, x + 6, y + 2, 4, 1, p.stone[1]);
    px(c, x + 3, y - 6, 10, 9, p.wood[2]); px(c, x + 4, y - 5, 8, 7, named(o) ? p.wood[3] : '#d8d0c0');
    if (named(o)) for (let i = 0; i < 3; i++) px(c, x + 7, y - 4 + i * 2, 2, 1, '#2a2024');
  });
  def('mb_barge', { w: 3 }, (c, x, y, p, t) => {
    const b = still() ? 0 : Math.round(Math.sin(t / 800));
    px(c, x + 1, y + 6 + b, 46, 8, p.wood[2]); px(c, x + 3, y + 5 + b, 42, 2, p.wood[3]);
    px(c, x + 12, y - 1 + b, 22, 7, '#c6a150'); px(c, x + 12, y - 1 + b, 22, 1, '#dfc16e');
  });
  def('mb_vault', { w: 3, h: 4 }, (c, x, y, p) => {
    px(c, x, y - 8, 48, 72, p.stone[1]);
    c.fillStyle = '#121418'; c.beginPath(); c.moveTo(x + 6, y + 64); c.lineTo(x + 6, y + 18); c.quadraticCurveTo(x + 24, y - 2, x + 42, y + 18); c.lineTo(x + 42, y + 64); c.closePath(); c.fill();
  });
  def('mb_noodle', { w: 3 }, (c, x, y, p, t, o) => {
    px(c, x, y + 1, 48, 14, p.wood[0]); px(c, x, y + 1, 48, 3, p.wood[3]);
    px(c, x + 2, y - 20, 2, 22, p.wood[2]); px(c, x + 44, y - 20, 2, 22, p.wood[2]);
    const cl = o && o.shop === 'masu' ? '#3a4e8a' : '#8a3a3a';
    for (let i = 0; i < 4; i++) px(c, x + 4 + i * 10, y - 18, 9, 9, cl);
    px(c, x + 34, y - 4, 8, 5, '#46444f');
  });
  def('mb_canaltable', { w: 3, h: 2 }, (c, x, y, p) => {
    px(c, x + 1, y + 2, 46, 24, p.wood[2]); px(c, x + 3, y + 3, 42, 20, '#e8e0c8');
    c.fillStyle = '#467e78'; c.fillRect(x + 4, y + 12, 40, 3); c.fillRect(x + 22, y + 4, 3, 9);
  });
  def('mb_bricked', {}, (c, x, y, p) => {
    px(c, x + 1, y - 10, 14, 25, p.wall[1]); px(c, x + 3, y - 8, 10, 23, '#d4ccb8');
    for (let i = 0; i < 4; i++) px(c, x + 3, y - 6 + i * 5, 10, 1, '#b8ae98');
  });

  // ---- art resolution (32 px a tile) -------------------------------------------------------------------------------
  if (!RB.propArt || !RB.propKit) return;
  const K = RB.propKit, art = RB.propArt.art;
  const { R, ell, poly, line, cyl, streaks, ramp, hh } = K;
  const IR = K.FIX.iron, PP = K.FIX.paper, ST = K.FIX.straw, INK = K.FIX.ink, LQ = K.FIX.lacquer, GL = K.FIX.glow;
  const INDIGO = ramp('#34406a', 0.5, 0.42), MADDER = ramp('#8e3a36', 0.5, 0.42), WEATHERED = ramp('#c8bea8', 0.45, 0.4);
  function post(g, x, y, w, h, r5) { cyl(g, x, y, w, h, r5); R(g, x, y, w, 1, r5[4]); if (w > 2) R(g, x + 1, y + 1, w - 2, 1, r5[3]); }

  // A bridge's name plaque: a squat stone post at the bridge's end carrying a cedar board under a little roof.
  // Named, the board is dark with the name cut in a column (incised dashes, never letter shapes); blank, it is
  // bleached to the grain, a few ghost marks where the name was.
  art('mb_plaque', {
    box: [-2, -30, 36, 64],
    v: (o) => (named(o) ? 1 : 0),
    ink: true,
    shadow: () => [16, 30, 9, 3, 0.3],
    draw(g, M, v) {
      const s5 = M.stone, w5 = M.wood;
      // the post: dressed stone, lit on the left
      R(g, 11, 6, 10, 24, s5[2]); R(g, 11, 6, 3, 24, s5[3]); R(g, 19, 6, 2, 24, s5[1]); R(g, 11, 6, 10, 1, s5[4]);
      R(g, 9, 26, 14, 4, s5[1]); R(g, 9, 26, 14, 1, s5[3]);
      R(g, 13, 14, 6, 1, s5[1]); R(g, 13, 20, 5, 1, s5[1]);
      // the board on two pegs, under its little roof
      R(g, 4, -20, 24, 24, w5[1]); R(g, 4, -20, 24, 1, w5[3]); R(g, 27, -20, 1, 24, w5[0]);
      if (v) {
        R(g, 6, -18, 20, 20, w5[0]); R(g, 6, -18, 20, 1, w5[1]);
        for (let i = 0; i < 4; i++) { R(g, 14, -15 + i * 4, 4, 2, PP[3]); R(g, 14, -15 + i * 4, 4, 1, PP[4]); }
      } else {
        R(g, 6, -18, 20, 20, WEATHERED[3]); R(g, 6, -18, 20, 1, WEATHERED[4]);
        streaks(g, 7, -17, 18, 18, WEATHERED[2], 31, 6, 7);
        R(g, 15, -13, 2, 1, WEATHERED[1]); R(g, 15, -6, 2, 1, WEATHERED[1]);
      }
      poly(g, [1, -21, 16, -29, 31, -21], M.roof[2]); R(g, 1, -22, 30, 2, M.roof[1]); R(g, 1, -22, 30, 1, M.roof[3]);
      R(g, 8, 4, 2, 3, IR[3]); R(g, 22, 4, 2, 3, IR[3]);
    },
  });

  // A canal barge (3 tiles): a long flat-bottomed boat, its load under straw mats, a pole laid along the gunwale.
  art('mb_barge', {
    box: [-4, -14, 104, 44],
    f: (t, o) => (o.still ? 0 : Math.floor(t / 700) % 2),
    v: (o) => (o.empty ? 1 : 0),
    outline: true,
    shadow: () => [48, 26, 46, 4, 0.18],
    draw(g, M, v, f) {
      const w5 = M.wood, b = f ? 1 : 0;
      // the hull: a long low box with a raised bow at the right
      poly(g, [2, 10 + b, 86, 10 + b, 98, 4 + b, 94, 22 + b, 6, 24 + b], w5[1]);
      R(g, 4, 10 + b, 84, 3, w5[3]); R(g, 4, 10 + b, 84, 1, w5[4]); R(g, 6, 20 + b, 86, 3, w5[0]);
      for (let x = 16; x < 86; x += 14) R(g, x, 13 + b, 1, 8, w5[2]);
      // the load under straw mats, roped
      if (!v) {
        R(g, 22, -2 + b, 48, 12, ST[2]); R(g, 22, -2 + b, 48, 2, ST[3]); R(g, 22, 8 + b, 48, 2, ST[1]);
        streaks(g, 23, 0 + b, 46, 8, ST[1], 41, 10, 4);
        for (const x of [30, 46, 62]) { R(g, x, -2 + b, 1, 12, ST[0]); R(g, x + 1, -2 + b, 1, 12, ST[4]); }
      }
      // the pole along the gunwale
      line(g, 8, 8 + b, 90, 2 + b, w5[4], 1);
      // the water against the hull
      R(g, 4, 25, 88, 1, M.water[3]);
    },
  });

  // The lock's vault (3×4): the Long Canal goes into the dark under the lock-keeper's house through a stone arch,
  // an iron grille raised in its slot, a lamp bracket beside it.
  art('mb_vault', {
    box: [-4, -24, 104, 156],
    ink: false,
    draw(g, M) {
      const s5 = M.stone;
      R(g, 0, -16, 96, 144, s5[2]);
      for (let y = -14, k = 0; y < 128; y += 9, k++) for (let x = (k % 2) * 8; x < 96; x += 16) { R(g, x, y, 15, 8, s5[(k + x) % 3 === 0 ? 3 : 2]); R(g, x, y, 15, 1, s5[4]); R(g, x + 14, y, 1, 8, s5[1]); }
      // the arch and the dark under it
      const arch = (x) => 34 - Math.sqrt(Math.max(0, 34 * 34 - (x - 48) * (x - 48))) * 0.9;
      for (let x = 14; x <= 82; x++) { const top = Math.round(arch(x)) + 8; R(g, x, top, 1, 128 - top, '#0e1014'); R(g, x, top - 3, 1, 3, s5[4]); }
      for (let x = 20; x <= 76; x += 2) R(g, x, Math.round(arch(x)) + 12, 1, 2, '#1c2024');
      // the grille, raised: its teeth at the top of the arch
      for (let x = 22; x <= 74; x += 6) { R(g, x, 10, 2, 14, IR[2]); R(g, x, 10, 1, 14, IR[3]); poly(g, [x, 24, x + 2, 24, x + 1, 27], IR[1]); }
      R(g, 18, 9, 60, 2, IR[2]); R(g, 18, 9, 60, 1, IR[4]);
      // the canal running in, catching the last light
      for (let y = 100; y < 128; y += 4) R(g, 18 + ((y * 7) % 9), y, 50 - ((y * 3) % 14), 1, M.water[1]);
      // a lamp bracket
      R(g, 86, 30, 6, 2, IR[2]); R(g, 88, 22, 4, 8, GL[2]); R(g, 88, 22, 4, 1, GL[4]);
    },
  });

  // A noodle stall (3×1): a counter with a short noren of four panels (madder for まさ屋, indigo for ます屋), a
  // steaming pot and a stack of bowls; the shop sign is a little board on a post (strokes, never letters).
  art('mb_noodle', {
    box: [-4, -50, 104, 84],
    v: (o) => (o.shop === 'masu' ? 1 : 0),
    f: (t, o) => (o.still ? 0 : Math.floor(t / 600) % 3),
    ink: true,
    shadow: () => [48, 30, 46, 4, 0.28],
    draw(g, M, v, f) {
      const w5 = M.wood, cl = v ? INDIGO : MADDER;
      // posts and the eave board
      post(g, 4, -40, 4, 70, w5); post(g, 88, -40, 4, 70, w5);
      R(g, 0, -44, 96, 6, w5[1]); R(g, 0, -44, 96, 1, w5[3]); R(g, 0, -39, 96, 1, w5[0]);
      // the noren: four panels with the shop's mark in white (a ring), slits between them
      for (let i = 0; i < 4; i++) {
        const x = 10 + i * 19;
        R(g, x, -38, 17, 18, cl[2]); R(g, x, -38, 17, 1, cl[4]); R(g, x + 16, -38, 1, 18, cl[1]); R(g, x, -21, 17, 1, cl[1]);
        if (i === 1 || i === 2) { ell(g, x + 8.5, -29, 4, 4, PP[4]); ell(g, x + 8.5, -29, 2.5, 2.5, cl[2]); }
      }
      // the counter
      R(g, 0, 2, 96, 24, w5[1]); R(g, 0, 2, 96, 4, w5[3]); R(g, 0, 2, 96, 1, w5[4]); R(g, 0, 25, 96, 2, w5[0]);
      for (let x = 12; x < 96; x += 16) R(g, x, 7, 1, 18, w5[2]);
      // the pot and its steam; bowls
      R(g, 64, -8, 20, 10, IR[2]); R(g, 64, -8, 20, 2, IR[4]); R(g, 62, -9, 24, 2, IR[3]);
      for (let k = 0; k < 3; k++) { const sx = 68 + k * 6 + ((f + k) % 3) - 1; R(g, sx, -16 - k * 3, 2, 4, 'rgba(250,248,240,0.55)'); }
      for (let k = 0; k < 3; k++) { ell(g, 22 + k * 3, -1 - k * 3, 8, 2.5, PP[3]); ell(g, 22 + k * 3, -1.5 - k * 3, 7, 1.6, PP[4]); }
      // the sign on a post at the left end
      post(g, -2, -20, 3, 22, w5); R(g, -6, -30, 12, 14, PP[3]); R(g, -6, -30, 12, 1, PP[4]); R(g, -3, -27, 1, 8, INK[2]); R(g, 1, -27, 1, 8, INK[2]); R(g, -2, -24, 4, 1, INK[2]);
    },
  });

  // The porters' canal table (3×2): a table with the city's canals painted on a board, little barge tokens.
  art('mb_canaltable', {
    box: [-4, -12, 104, 80],
    ink: true,
    shadow: () => [48, 60, 46, 5, 0.3],
    draw(g, M) {
      const w5 = M.wood, wt = M.water;
      post(g, 6, 32, 4, 28, w5); post(g, 86, 32, 4, 28, w5);
      R(g, 0, -4, 96, 40, w5[1]); R(g, 0, -4, 96, 1, w5[4]); R(g, 0, 35, 96, 3, w5[0]);
      R(g, 4, 0, 88, 32, PP[3]); R(g, 4, 0, 88, 1, PP[4]);
      // the canals: the long one across, the cross one down, the back one to the right
      R(g, 6, 16, 84, 4, wt[1]); R(g, 6, 16, 84, 1, wt[2]); R(g, 52, 2, 4, 14, wt[1]); R(g, 6, 26, 84, 2, wt[1]);
      // bridges as little dark bars, tokens as tiny boats
      for (const x of [20, 38, 74]) R(g, x, 15, 3, 6, INK[3]);
      for (const [x, y] of [[12, 17], [62, 17], [30, 26]]) { R(g, x, y, 7, 2, LQ[3]); R(g, x, y, 7, 1, LQ[4]); }
      R(g, 70, 4, 10, 6, PP[2]); R(g, 71, 5, 8, 1, INK[3]); R(g, 71, 7, 6, 1, INK[3]);
    },
  });

  // A door bricked up long ago: newer plaster in the shape of a doorway, a lintel still showing above it.
  art('mb_bricked', {
    box: [-2, -26, 36, 60],
    ink: true,
    draw(g, M) {
      const wl = M.wall, w5 = M.wood;
      R(g, 2, -22, 28, 52, wl[3]); R(g, 2, -22, 28, 1, wl[4]);
      R(g, 4, -16, 24, 44, wl[2]); R(g, 4, -16, 24, 1, wl[1]);
      for (let y = -12, k = 0; y < 28; y += 6, k++) for (let x = 4 + (k % 2) * 6; x < 28; x += 12) R(g, x, y, 1, 5, wl[1]);
      R(g, 2, -20, 28, 4, w5[1]); R(g, 2, -20, 28, 1, w5[3]);
      R(g, 10, 2, 12, 1, wl[1]); R(g, 14, 6, 4, 1, wl[1]);
    },
  });
})();
