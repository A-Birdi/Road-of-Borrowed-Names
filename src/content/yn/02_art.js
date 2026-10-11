/* Steamhollow's props (expansion P13): steam rising from the rock (it drifts; nothing blocks), a passage choked with
 * steam, a valve wheel on an iron pipe (shut or open), a hot pool (steaming, or run cool once used), a wooden footbath
 * (足湯), a bath's doorway curtain (暖簾) with ゆ on it in the side's colour (indigo for the men's, red for the women's,
 * brown for the reserved bath, 貸切), the egg steam box (蒸し場) with its baskets, the guild's water divider (湯分け)
 * with its old water clock, a bamboo spout (筧) ticking into a stone basin, a bamboo partition between the baths, the
 * valve's lost handle and the water clock's jammed float. Each has a flat 16-px drawing (the fallback, as every prop)
 * and its art-resolution version in the world's prop style (light from the upper left, an ink outline on what can be
 * looked at, a soft contact shadow). Interim regional assets under AC-1 (C-82): finished in the art pass (P16). */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const P = RB.props.P;
  const px = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  const def = (id, o, draw) => (P[id] = Object.assign({ id, w: 1, h: 1, block: true }, o, { draw }));
  const still = () => RB.game && RB.game.reducedMotion && RB.game.reducedMotion();
  const NOREN = { men: ['#1e2a4a', '#2c3e6a', '#4a5e8e'], women: ['#5a1a1e', '#8a2a2c', '#b84a44'], private: ['#3a2a1a', '#5a4026', '#7e5c3a'] };

  // ---- flat fallbacks (16 px a tile) -------------------------------------------------------------------------------
  def('yn_steam', { block: false }, (c, x, y, p, t, o) => {
    const d = still() || (o && o.still) ? 0 : Math.floor((t || 0) / 300) % 4;
    px(c, x + 4, y + 6 - d, 6, 6, 'rgba(244,244,240,0.55)'); px(c, x + 7, y - 2 - d, 5, 6, 'rgba(244,244,240,0.4)');
  });
  def('yn_steamwall', {}, (c, x, y) => {
    px(c, x - 2, y - 4, 20, 20, 'rgba(240,242,240,0.85)'); px(c, x + 2, y - 8, 12, 6, 'rgba(244,246,244,0.7)');
  });
  def('yn_valve', {}, (c, x, y, p, t, o) => {
    px(c, x + 6, y, 4, 16, '#46444f'); px(c, x + 2, y + 2, 12, 12, o && o.open ? '#c8a050' : '#77531f');
    px(c, x + 6, y + 6, 4, 4, '#2c2a36');
  });
  def('yn_pool', { w: 2 }, (c, x, y, p, t, o) => {
    px(c, x + 1, y + 2, 30, 13, p.stone[2]); px(c, x + 3, y + 4, 26, 9, o && o.cool ? '#4a6a6a' : p.water[1]);
    if (!(o && o.cool)) px(c, x + 10, y - 4, 8, 6, 'rgba(244,244,240,0.5)');
  });
  def('yn_footbath', { w: 3 }, (c, x, y, p) => {
    px(c, x + 1, y + 4, 46, 11, p.wood[2]); px(c, x + 3, y + 6, 42, 6, p.water[1]); px(c, x + 1, y + 13, 46, 2, p.wood[0]);
    px(c, x + 18, y - 3, 10, 6, 'rgba(244,244,240,0.45)');
  });
  def('yn_noren', {}, (c, x, y, p, t, o) => {
    const N = NOREN[(o && o.side) || 'men'] || NOREN.men;
    px(c, x, y - 6, 16, 2, p.wood[2]); px(c, x + 1, y - 4, 6, 16, N[1]); px(c, x + 9, y - 4, 6, 16, N[1]);
    px(c, x + 5, y + 2, 6, 4, '#f0ead8');
  });
  def('yn_steambox', { w: 2 }, (c, x, y, p) => {
    px(c, x + 1, y + 2, 30, 13, p.stone[1]); px(c, x + 4, y + 4, 10, 6, p.reed[1]); px(c, x + 18, y + 4, 10, 6, p.reed[1]);
    px(c, x + 8, y - 6, 16, 8, 'rgba(244,244,240,0.5)');
  });
  def('yn_divider', { w: 2 }, (c, x, y, p) => {
    px(c, x, y + 6, 32, 6, p.wood[2]); px(c, x + 14, y + 2, 4, 12, p.wood[1]); px(c, x + 2, y + 8, 12, 2, p.water[2]); px(c, x + 18, y + 8, 12, 2, p.water[2]);
    px(c, x + 12, y - 6, 8, 8, p.wood[3]);
  });
  def('yn_kakehi', {}, (c, x, y, p) => {
    px(c, x + 2, y + 8, 12, 7, p.stone[1]); px(c, x + 4, y + 9, 8, 4, p.water[1]); px(c, x, y + 1, 10, 3, '#8a9a4a'); px(c, x + 1, y + 1, 2, 10, '#6a7a3a');
  });
  def('yn_partition', {}, (c, x, y) => {
    for (let i = 0; i < 4; i++) px(c, x + i * 4, y - 12, 3, 28, i % 2 ? '#8a9a5a' : '#9aaa66');
    px(c, x, y - 4, 16, 2, '#5a4a2a'); px(c, x, y + 8, 16, 2, '#5a4a2a');
  });
  def('yn_handle', { block: false }, (c, x, y) => {
    px(c, x + 3, y + 8, 10, 3, '#77531f'); px(c, x + 6, y + 5, 4, 9, '#77531f'); px(c, x + 7, y + 8, 2, 2, '#2c2a36');
  });
  def('yn_float', { block: false }, (c, x, y) => {
    px(c, x + 4, y + 8, 8, 6, '#ab8434'); px(c, x + 7, y + 2, 2, 7, '#77531f'); px(c, x + 2, y + 12, 12, 3, '#5a4e44');
  });

  // ---- art resolution (32 px a tile) -------------------------------------------------------------------------------
  if (!RB.propArt || !RB.propKit) return;
  const K = RB.propKit, art = RB.propArt.art;
  const { R, ell, line } = K;
  const poly = (g, pts, c) => K.poly(g, Array.isArray(pts[0]) ? pts.flat() : pts, c);
  const I = K.FIX.iron, BR = K.FIX.brass, PP = K.FIX.paper, ST = K.FIX.straw;
  const puff = (g, cx, cy, r, a) => { ell(g, cx, cy, r, r * 0.8, 'rgba(246,246,242,' + a + ')'); ell(g, cx - r * 0.3, cy - r * 0.3, r * 0.55, r * 0.45, 'rgba(255,255,252,' + Math.min(1, a + 0.1) + ')'); };

  // Steam (湯気): soft puffs rising from a crack in the rock and thinning as they go; drifts, never blocks.
  art('yn_steam', {
    box: [-12, -56, 56, 80],
    f: (t, o) => (o.still || still() ? 0 : Math.floor(t / 220) % 6),
    draw(g, M, v, f) {
      line(g, 6, 22, 26, 20, M.stone[0], 2);
      for (let i = 0; i < 4; i++) {
        const k = (i * 6 + f) % 24, yy = 18 - k * 2.6, a = 0.55 - k * 0.02;
        if (a > 0.08) puff(g, 16 + Math.sin((k + i) * 0.6) * 5, yy, 6 + k * 0.35, a);
      }
    },
  });
  // A passage choked with steam: a white wall rolling in place; you can't see a hand in front of you.
  art('yn_steamwall', {
    box: [-16, -32, 64, 72],
    f: (t, o) => (o.still || still() ? 0 : Math.floor(t / 300) % 6),
    draw(g, M, v, f) {
      const d = [0, 1, 2, 3, 2, 1][f];
      for (const [cx, cy, r, a] of [[16, 18, 18, 0.88], [6 + d, 4, 13, 0.82], [26 - d, 2, 14, 0.82], [16, -10 + d, 12, 0.7], [16, 30, 16, 0.8]]) puff(g, cx, cy, r, a);
    },
  });
  // A valve wheel (弁) on an iron pipe coming out of the rock: brass wheel, the pipe's mouth; open, steam jets from it.
  art('yn_valve', {
    box: [-8, -40, 48, 72],
    v: (o) => (o.open ? 1 : 0),
    f: (t, o) => (o.open && !(o.still || still()) ? Math.floor(t / 200) % 3 : 0),
    ink: true,
    shadow: () => [16, 30, 10, 3, 0.3],
    draw(g, M, v, f) {
      R(g, 12, -20, 8, 50, I[2]); R(g, 12, -20, 3, 50, I[3]); R(g, 19, -20, 1, 50, I[0]);
      R(g, 9, -24, 14, 6, I[1]); R(g, 9, -24, 14, 2, I[3]);
      ell(g, 16, 8, 12, 12, BR[1]); ell(g, 16, 8, 9, 9, I[1]); ell(g, 16, 8, 3, 3, BR[3]);
      for (let a = 0; a < 4; a++) { const an = a * Math.PI / 4 + (v ? Math.PI / 8 : 0); line(g, 16, 8, 16 + Math.cos(an) * 9, 8 + Math.sin(an) * 9, BR[2], 2); line(g, 16, 8, 16 - Math.cos(an) * 9, 8 - Math.sin(an) * 9, BR[2], 2); }
      line(g, 5, 3, 10, 0, BR[4], 1);
      if (v) for (let i = 0; i < 3; i++) puff(g, 16 + (i - 1) * 3, -30 - i * 7 - f * 2, 5 + i * 2, 0.6 - i * 0.12);
    },
  });
  // A hot pool (湯溜まり) in the rock: steaming green-blue water in a ring of stones; once used it runs cool and still.
  art('yn_pool', {
    box: [-8, -28, 80, 60],
    v: (o) => (o.cool ? 1 : 0),
    f: (t, o) => (o.cool || o.still || still() ? 0 : Math.floor(t / 260) % 4),
    ink: true,
    draw(g, M, v, f) {
      const S = M.stone, W = M.water;
      ell(g, 32, 16, 30, 13, S[1]); ell(g, 32, 15, 27, 11, S[2]);
      ell(g, 32, 17, 24, 9, v ? '#3e5a5a' : W[1]); ell(g, 28, 15, 16, 5, v ? '#4a6a68' : W[2]);
      if (!v) { line(g, 18 + f * 3, 18, 26 + f * 3, 18, W[3], 1); puff(g, 26, -2 - f, 7, 0.45); puff(g, 40, -6 - f, 6, 0.35); }
      for (const [sx, sy] of [[6, 14], [14, 6], [30, 3], [48, 6], [57, 14], [50, 25], [32, 28], [12, 25]]) { ell(g, sx, sy, 5, 4, S[2]); ell(g, sx - 1, sy - 1, 3, 2, S[3]); }
    },
  });
  // A footbath (足湯): a long cedar trough of spring water with a bench along it, steam lifting off it.
  art('yn_footbath', {
    box: [-6, -28, 108, 64],
    f: (t, o) => (o.still || still() ? 0 : Math.floor(t / 280) % 4),
    ink: true,
    shadow: () => [48, 30, 46, 3, 0.28],
    draw(g, M, v, f) {
      const W = M.wood, WA = M.water;
      R(g, 2, 8, 92, 18, W[2]); R(g, 2, 8, 92, 3, W[3]); R(g, 93, 8, 1, 18, W[0]);
      R(g, 6, 12, 84, 9, WA[1]); R(g, 6, 12, 84, 2, WA[2]);
      for (let i = 0; i < 4; i++) line(g, 12 + i * 20 + f * 2, 16, 18 + i * 20 + f * 2, 16, WA[3], 1);
      R(g, 2, 26, 92, 4, W[1]);
      for (const lx of [6, 46, 86]) R(g, lx, 28, 4, 4, W[0]);
      puff(g, 30, -2 - f, 8, 0.4); puff(g, 64, -6 - f, 7, 0.35);
    },
  });
  // A bath's doorway curtain (暖簾): two panels on a rod with ゆ on them; indigo, red or brown for the three baths.
  art('yn_noren', {
    box: [-6, -36, 44, 64],
    v: (o) => (NOREN[o.side] ? o.side : 'men'),
    ink: true,
    draw(g, M, v) {
      const N = NOREN[v];
      R(g, -2, -24, 36, 4, M.wood[2]); R(g, -2, -24, 36, 1, M.wood[3]);
      R(g, 1, -20, 14, 40, N[1]); R(g, 17, -20, 14, 40, N[1]); R(g, 1, -20, 3, 40, N[2]); R(g, 17, -20, 3, 40, N[2]);
      R(g, 14, -20, 1, 40, N[0]); R(g, 30, -20, 1, 40, N[0]);
      // ゆ in white across the two panels
      ell(g, 16, -2, 8, 8, PP[4]); ell(g, 16, -2, 5, 5, N[1]); R(g, 13, -12, 2, 18, PP[4]); R(g, 18, -10, 2, 16, PP[4]);
    },
  });
  // The steam box (蒸し場): a stone chest over a vent, its wooden lid off and two baskets of eggs in the steam.
  art('yn_steambox', {
    box: [-6, -36, 76, 68],
    f: (t, o) => (o.still || still() ? 0 : Math.floor(t / 240) % 4),
    ink: true,
    shadow: () => [32, 30, 30, 3, 0.3],
    draw(g, M, v, f) {
      const S = M.stone, W = M.wood;
      R(g, 2, 6, 60, 22, S[2]); R(g, 2, 6, 60, 3, S[3]); R(g, 61, 6, 1, 22, S[0]);
      R(g, 6, 9, 52, 8, S[0]);
      for (const bx of [10, 34]) { ell(g, bx + 10, 12, 10, 5, ST[2]); ell(g, bx + 10, 11, 8, 3, ST[1]); for (let e = 0; e < 3; e++) ell(g, bx + 5 + e * 5, 10, 2, 2, PP[4]); }
      R(g, 44, 20, 20, 5, W[2]); R(g, 44, 20, 20, 1, W[3]);
      puff(g, 22, -6 - f, 8, 0.45); puff(g, 42, -10 - f, 7, 0.4);
    },
  });
  // The divider (湯分け): the spring's channel split in two by a cedar weir, one way to each house, and the guild's old
  // water clock on its post (a float in a cylinder, marking the hours).
  art('yn_divider', {
    box: [-6, -44, 76, 76],
    f: (t, o) => (o.still || still() ? 0 : Math.floor(t / 200) % 4),
    ink: true,
    shadow: () => [32, 26, 30, 3, 0.28],
    draw(g, M, v, f) {
      const W = M.wood, WA = M.water;
      R(g, 0, 10, 64, 14, W[2]); R(g, 0, 10, 64, 2, W[3]);
      R(g, 3, 14, 26, 6, WA[1]); R(g, 35, 14, 26, 6, WA[1]);
      line(g, 6 + f * 4, 16, 12 + f * 4, 16, WA[3], 1); line(g, 38 + f * 4, 16, 44 + f * 4, 16, WA[3], 1);
      R(g, 29, 6, 6, 20, W[1]); R(g, 29, 6, 2, 20, W[3]);
      R(g, 26, -30, 12, 34, W[2]); R(g, 28, -28, 8, 30, PP[1]); R(g, 30, -12, 4, 6, BR[2]);
      for (let h = 0; h < 6; h++) line(g, 28, -26 + h * 5, 31, -26 + h * 5, W[0], 1);
      R(g, 24, -34, 16, 4, W[1]);
    },
  });
  // A bamboo spout (筧) dripping into a stone basin; a ladle across it.
  art('yn_kakehi', {
    box: [-6, -24, 44, 56],
    f: (t, o) => (o.still || still() ? 0 : Math.floor(t / 350) % 4),
    ink: true,
    shadow: () => [16, 30, 12, 3, 0.3],
    draw(g, M, v, f) {
      const S = M.stone, WA = M.water, B = ['#4a5a2a', '#6a7a3a', '#8a9a4a', '#aaba6a', '#cad890'];
      ell(g, 18, 20, 13, 8, S[2]); ell(g, 18, 18, 10, 5, WA[1]); ell(g, 16, 17, 6, 2, WA[2]);
      R(g, 0, -8, 4, 30, B[1]); R(g, 0, -8, 1, 30, B[3]);
      R(g, 0, -10, 20, 5, B[2]); R(g, 0, -10, 20, 1, B[4]);
      if (f % 2 === 0) R(g, 19, -5 + f * 3, 2, 3, WA[3]);
      line(g, 8, 14, 30, 10, M.wood[2], 2);
    },
  });
  // A bamboo partition (竹垣) between the baths, taller than anyone, tied with black cord.
  art('yn_partition', {
    box: [-2, -60, 36, 96],
    ink: true,
    draw(g, M) {
      const B = ['#4a5a2a', '#6a7a3a', '#8a9a4a', '#aaba6a', '#cad890'];
      for (let i = 0; i < 4; i++) { R(g, i * 8, -50, 7, 82, B[1 + (i % 2)]); R(g, i * 8, -50, 2, 82, B[3]); for (const ny of [-30, 0]) line(g, i * 8, ny, i * 8 + 6, ny, B[0], 1); }
      for (const cy of [-36, -6, 20]) { R(g, 0, cy, 32, 3, '#3a3022'); R(g, 0, cy, 32, 1, '#5a4a32'); }
    },
  });
  // The valve's handle, dropped among the stones: a brass cross-bar with a square socket.
  art('yn_handle', {
    box: [-4, -4, 40, 40],
    ink: true,
    draw(g) {
      R(g, 4, 18, 24, 5, BR[2]); R(g, 4, 18, 24, 2, BR[3]); R(g, 13, 10, 6, 18, BR[2]); R(g, 13, 10, 2, 18, BR[3]);
      R(g, 14, 18, 4, 4, I[0]);
    },
  });
  // The water clock's float, jammed in silt: a brass float on its rod, grey mud to the brim.
  art('yn_float', {
    box: [-4, -12, 40, 48],
    ink: true,
    draw(g, M) {
      ell(g, 16, 26, 14, 5, M.dirt[1]);
      R(g, 15, -6, 3, 28, BR[1]); ell(g, 16, 20, 7, 5, BR[2]); ell(g, 14, 18, 4, 2, BR[3]);
      ell(g, 16, 27, 12, 3, M.dirt[2]);
    },
  });
})();
