/* Kotonoha's props (expansion P11): a drift of written leaves on the sand, a keeper's gathering basket, a stone lantern
 * half-buried in sand (dark or lit), a great conch on its rock, the great camphor's trunk among its roots, an
 * exhibition panel in the keepers' hall (blank, or showing the telling chosen for it), a rack of drying nets, the tide
 * calendar's standing stone, a tangle of roots across a passage in the Root Hollows, a current of drifting leaves, and
 * (P11f) a moon stone from the calendar's ring and Kihei's letter in its frame. Each has a flat 16-px drawing (the
 * fallback, as every prop) and its art-resolution version in the world's prop style (light from the upper left,
 * hue-shifted ramps, an ink outline on what can be looked at, a soft contact shadow). Regional assets under AC-1
 * (C-82), reviewed in the art pass (P16d; implemented provisionally, internally reviewed): kept as drawn. */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const P = RB.props.P;
  const px = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  const def = (id, o, draw) => (P[id] = Object.assign({ id, w: 1, h: 1, block: true }, o, { draw }));
  const still = () => RB.game && RB.game.reducedMotion && RB.game.reducedMotion();
  const GOLD = ['#7a5a1e', '#a8822e', '#d0a844', '#e8c868', '#f6e6a4'];
  const INKS = ['#2a2434', '#3a3048', '#4a4060'];

  // ---- flat fallbacks (16 px a tile) -------------------------------------------------------------------------------
  def('ko_leaves', { w: 2, block: false }, (c, x, y) => {
    for (const [lx, ly] of [[2, 10], [7, 12], [12, 9], [17, 11], [22, 13], [27, 10]]) { px(c, x + lx, y + ly, 4, 2, GOLD[2]); px(c, x + lx + 1, y + ly, 1, 1, INKS[0]); }
  });
  def('ko_basket', {}, (c, x, y, p) => {
    px(c, x + 3, y + 6, 10, 8, p.wood[3]); px(c, x + 3, y + 6, 10, 1, p.wood[2]);
    for (let i = 0; i < 4; i++) px(c, x + 4 + i * 2, y + 3 + (i % 2), 2, 3, GOLD[2 + (i % 2)]);
  });
  def('ko_sandtoro', {}, (c, x, y, p, t, o) => {
    px(c, x + 2, y + 10, 12, 5, p.sand[0]); px(c, x + 4, y + 2, 8, 8, p.stone[1]); px(c, x + 2, y - 1, 12, 3, p.stone[2]);
    px(c, x + 6, y + 4, 4, 3, o && o.lit ? '#ffc870' : '#2a2a2e');
  });
  def('ko_conch', {}, (c, x, y, p) => {
    px(c, x + 1, y + 10, 14, 5, p.stone[2]); px(c, x + 3, y + 3, 10, 7, '#e8d4c0'); px(c, x + 5, y + 4, 6, 4, '#d89a8a'); px(c, x + 11, y + 2, 3, 3, '#e8d4c0');
  });
  def('ko_windstone', { w: 2 }, (c, x, y, p) => {
    px(c, x + 2, y + 5, 28, 8, p.stone[1]); px(c, x + 3, y + 1, 26, 5, p.stone[3]); px(c, x + 4, y + 1, 10, 2, p.stone[4]);
  });
  def('ko_camphor', { w: 4 }, (c, x, y, p) => {
    px(c, x + 14, y - 40, 36, 54, p.trunk[0]); px(c, x + 14, y - 40, 8, 54, p.trunk[1]);
    px(c, x, y + 8, 64, 6, p.trunk[1]); px(c, x + 4, y - 56, 56, 18, p.leaf[0]);
  });
  def('ko_panel', {}, (c, x, y, p, t, o) => {
    px(c, x + 2, y - 8, 12, 18, p.wood[2]); px(c, x + 3, y - 7, 10, 14, '#ebe3ca');
    if (o && o.v) px(c, x + 5, y - 4, 6, 6, ['#6a9a8a', '#c88a5a', '#8a7ab0', '#5a7a9a'][(o.v - 1) % 4]);
    px(c, x + 3, y + 10, 2, 5, p.wood[2]); px(c, x + 11, y + 10, 2, 5, p.wood[2]);
  });
  def('ko_netrack', { w: 2 }, (c, x, y, p) => {
    px(c, x + 2, y - 4, 2, 18, p.wood[2]); px(c, x + 28, y - 4, 2, 18, p.wood[2]); px(c, x + 2, y - 4, 28, 2, p.wood[1]);
    for (let i = 0; i < 6; i++) px(c, x + 5 + i * 4, y - 2, 1, 12, '#8a9a8a');
  });
  def('ko_tidestone', {}, (c, x, y, p) => {
    px(c, x + 4, y - 8, 8, 22, p.stone[1]); px(c, x + 5, y - 4, 6, 6, p.stone[2]); px(c, x + 6, y - 3, 3, 4, '#e8eef0');
  });
  def('ko_rootarch', { w: 2 }, (c, x, y, p) => {
    for (let i = 0; i < 5; i++) px(c, x + 2 + i * 6, y - 6 + (i % 2) * 4, 5, 20, p.trunk[i % 2]);
  });
  def('ko_current', { block: false }, (c, x, y, p, t) => {
    const k = still() ? 0 : Math.floor((t || 0) / 200) % 4;
    for (let i = 0; i < 3; i++) px(c, x + 4 + ((i * 5 + k * 2) % 9), y + 12 - i * 5 - k, 3, 2, GOLD[3]);
  });

  // P11f: a moon stone from the tide calendar's ring (o.phase 1 new, 2 crescent, 3 half, 4 full) and Kihei's letter
  // framed by Mitsu's door
  const MOONCUT = (c, x, y, n, dark, light) => {
    px(c, x, y, 6, 6, dark);
    if (n === 2) px(c, x + 4, y + 1, 2, 4, light);
    if (n === 3) px(c, x + 3, y, 3, 6, light);
    if (n === 4) px(c, x, y, 6, 6, light);
  };
  def('ko_moonstone', {}, (c, x, y, p, t, o) => {
    px(c, x + 2, y + 6, 12, 8, p.stone[1]); px(c, x + 2, y + 6, 12, 2, p.stone[2]);
    MOONCUT(c, x + 5, y + 7, (o && o.phase) || 1, '#2a2a2e', '#e8eef0');
  });
  def('ko_frame', {}, (c, x, y, p) => {
    px(c, x + 3, y - 4, 10, 14, p.wood[1]); px(c, x + 4, y - 3, 8, 12, '#ebe3ca'); px(c, x + 6, y, 4, 2, GOLD[2]);
    px(c, x + 5, y + 10, 2, 4, p.wood[2]); px(c, x + 9, y + 10, 2, 4, p.wood[2]);
  });

  // ---- art resolution (32 px a tile) -------------------------------------------------------------------------------
  if (!RB.propArt || !RB.propKit) return;
  const K = RB.propKit, art = RB.propArt.art;
  const { R, ell, line } = K;
  // the kit's poly takes a flat [x0, y0, x1, y1, …]; the points here are written as pairs
  const poly = (g, pts, c) => K.poly(g, Array.isArray(pts[0]) ? pts.flat() : pts, c);
  const PP = K.FIX.paper, GL = K.FIX.glow, ST = K.FIX.straw, IK = K.FIX.ink;
  const SHELL = ['#7e5a50', '#b88272', '#dcae9a', '#f0d6c4', '#fbefe4'];
  const MOSS = ['#24402e', '#2e5238', '#40684a', '#5a8460', '#78a07a'];
  // one written leaf: a little almond of gold with a stroke of ink along it
  const leaf = (g, x, y, a, shade) => {
    const c = GOLD[shade == null ? 2 : shade];
    if (a) { poly(g, [[x, y + 2], [x + 3, y], [x + 7, y + 1], [x + 4, y + 3]], c); R(g, x + 2, y + 1, 3, 1, IK[2]); }
    else { poly(g, [[x, y + 1], [x + 4, y - 1], [x + 7, y + 1], [x + 3, y + 3]], c); R(g, x + 2, y + 1, 3, 1, IK[3]); }
  };

  // A drift of written leaves (2×1), lying on the sand; nothing to step around.
  art('ko_leaves', {
    box: [0, 0, 64, 32],
    draw(g) {
      const at = [[4, 14, 0, 1], [11, 18, 1, 2], [18, 13, 1, 3], [26, 19, 0, 2], [33, 15, 1, 1], [40, 20, 0, 3], [47, 14, 1, 2], [54, 18, 0, 2], [15, 22, 0, 4], [37, 9, 1, 3]];
      for (const [x, y, a, s] of at) { R(g, x + 1, y + 4, 6, 1, 'rgba(40,30,20,0.18)'); leaf(g, x, y, a, s); }
    },
  });

  // A keeper's gathering basket: woven bamboo heaped with written leaves.
  art('ko_basket', {
    box: [-2, -12, 36, 44],
    ink: true,
    shadow: () => [16, 28, 11, 3, 0.28],
    draw(g, M) {
      const w5 = M.wood;
      poly(g, [[5, 8], [27, 8], [25, 26], [7, 26]], ST[1]);
      for (let y = 10; y < 26; y += 3) R(g, 6, y, 20, 1, ST[0]);
      for (let x = 8; x < 26; x += 4) R(g, x, 9, 1, 16, ST[2]);
      R(g, 5, 7, 22, 2, ST[3]); R(g, 5, 7, 22, 1, ST[4]);
      for (const [x, y, a, s] of [[6, 1, 0, 3], [12, -2, 1, 2], [18, 0, 0, 4], [10, 4, 1, 1], [20, 4, 0, 2]]) leaf(g, x, y, a, s);
      line(g, 6, 8, 16, -6, w5[2], 1); line(g, 16, -6, 26, 8, w5[2], 1);
    },
  });

  // A stone lantern half-buried in sand: the post gone under, the fire box and the hat leaning a little. Dark, or lit
  // once a companion has found its name (the lit instance's `light` gives the glow around it).
  art('ko_sandtoro', {
    box: [-6, -28, 44, 64],
    v: (o) => (o.lit ? 1 : 0),
    f: (t, o) => (o.lit && !(o.still || still()) ? Math.floor(t / 340) % 3 : 0),
    ink: true,
    shadow: () => [16, 28, 13, 3, 0.25],
    draw(g, M, v, f) {
      const S = M.stone;
      // the drift of sand around it
      ell(g, 16, 24, 15, 5, '#cac0a2'); ell(g, 14, 23, 11, 3, '#e2dac2');
      // the fire box, buried to its sill
      R(g, 7, 2, 18, 18, S[2]); R(g, 7, 2, 18, 2, S[3]); R(g, 24, 2, 1, 18, S[0]);
      if (v) { const fl = [GL[3], GL[4], GL[3]][f]; R(g, 11, 6, 10, 9, GL[1]); R(g, 12, 7, 8, 7, GL[2]); R(g, 14, 8, 4, 5, fl); }
      else { R(g, 11, 6, 10, 9, '#1a1a1e'); R(g, 12, 7, 8, 1, '#2a2a30'); }
      // the hat, tilted
      poly(g, [[0, 2], [15, -10], [31, 0], [27, 3], [4, 4]], S[2]); poly(g, [[2, 2], [15, -9], [15, 2]], S[3]);
      ell(g, 16, -12, 3, 3, S[2]);
      // sand on the hat and a written leaf caught in it
      R(g, 5, 1, 8, 2, '#e2dac2'); leaf(g, 19, -4, 1, 3);
      R(g, 6, 18, 5, 2, MOSS[2]);
    },
  });

  // A great conch on a flat rock, its mouth turned to the sea. The shells hold fragments of what was said.
  art('ko_conch', {
    box: [-4, -16, 40, 52],
    ink: true,
    shadow: () => [16, 30, 13, 3, 0.28],
    draw(g, M) {
      const S = M.stone;
      ell(g, 16, 24, 14, 6, S[1]); ell(g, 14, 22, 10, 3, S[3]);
      // the spire and body
      poly(g, [[22, -10], [28, 2], [26, 14], [8, 18], [4, 10], [10, 2]], SHELL[2]);
      for (const [x0, y0, x1, y1] of [[10, 4, 26, 2], [7, 10, 27, 8], [8, 15, 25, 13]]) line(g, x0, y0, x1, y1, SHELL[1], 1);
      poly(g, [[22, -10], [26, -2], [20, -2]], SHELL[3]);
      // the mouth, pink inside
      ell(g, 10, 12, 5, 5, SHELL[4]); ell(g, 11, 12, 3, 3, '#e4a49a'); ell(g, 12, 13, 1, 2, '#c87c78');
      R(g, 15, 0, 6, 1, SHELL[3]);
    },
  });

  // The Wind Stone (2×1, ko.windstone: "a flat stone, with a wind always blowing over it the same way"): a broad, low
  // stone on the village green's paving, its top worn flat for laying a leaf on. The wind comes always from the west:
  // the grass at both its ends is pressed flat eastward, a couple of leaves lie pinned against its western end, and in
  // motion a few pale streaks run east over its top (held still with reduced motion). RBN-QA-075: it had been the
  // generic roofed lantern-shrine, which the scene's own words contradict.
  art('ko_windstone', {
    box: [-6, -12, 80, 48],
    f: (t, o) => (o.still || still() ? 0 : Math.floor(t / 160) % 8),
    ink: true,
    shadow: () => [33, 27, 31, 4, 0.3],
    draw(g, M) {
      const S = M.stone;
      // the front, in shade (darker toward the ground), and the east end, darkest
      poly(g, [[3, 11], [61, 9], [62, 22], [58, 27], [7, 28], [2, 22]], S[1]);
      poly(g, [[2, 22], [62, 22], [58, 27], [7, 28]], S[0]);
      poly(g, [[61, 9], [65, 7], [66, 19], [62, 22]], S[0]);
      // the top, worn flat: one even plane, lit from the upper left, its front lip catching the light
      poly(g, [[7, 0], [59, -2], [65, 7], [61, 9], [3, 11], [1, 5]], S[2]);
      poly(g, [[8, 1], [36, 0], [30, 5], [6, 7]], S[3]);
      line(g, 3, 11, 61, 9, S[4], 1);
      line(g, 61, 9, 65, 7, S[3], 1);
      // a seam along the front and a few flecks of grain
      line(g, 10, 17, 30, 18, S[0], 1); line(g, 36, 16, 54, 15, S[0], 1);
      for (const [x, y] of [[18, 24], [44, 25], [50, 13], [24, 3], [48, 2]]) R(g, x, y, 2, 1, S[0]);
      // moss low on its front, and leaves the wind has pinned against its western end
      R(g, 6, 26, 9, 2, MOSS[2]); R(g, 44, 26, 7, 1, MOSS[1]);
      leaf(g, -4, 12, 0, 3); leaf(g, -3, 18, 1, 2); leaf(g, 0, 24, 0, 4);
    },
    over(g, M, v, f) {
      // grass at both ends, pressed flat to the east
      for (const [x, y, n] of [[-6, 29, 4], [64, 25, 5], [67, 29, 4], [26, 30, 3]]) for (let i = 0; i < n; i++) line(g, x + i * 2, y, x + i * 2 + 5, y - 1 - (i % 2), MOSS[2 + (i % 2)], 1);
      // the wind over the top: short pale streaks running east (drifting in motion, at rest when held still)
      for (const [x0, y, len] of [[4, 1, 10], [22, 5, 13], [40, 0, 9], [14, 8, 8]]) {
        const x = 2 + ((x0 + f * 7) % 54);
        R(g, x, y, Math.min(len, 62 - x), 1, 'rgba(242,248,242,0.75)');
      }
    },
  });

  // The great camphor (4×1, the trunk's foot): a vast fluted trunk going up out of the frame, buttress roots running
  // out over the ground, a sacred rope round it with paper streamers, written leaves caught in the bark.
  art('ko_camphor', {
    box: [-12, -150, 152, 190],
    ink: true,
    shadow: () => [64, 30, 62, 6, 0.32],
    draw(g, M) {
      const tr = M.trunk, lf = M.leaf;
      // canopy shade at the top of the frame
      for (const [x, y, rx, ry, k] of [[20, -136, 34, 16, 1], [70, -142, 44, 18, 2], [114, -132, 30, 14, 1], [46, -122, 30, 12, 3], [96, -120, 28, 12, 3]]) ell(g, x, y, rx, ry, lf[k]);
      // the trunk
      poly(g, [[34, -120], [94, -120], [104, 10], [24, 10]], tr[2]);
      poly(g, [[34, -120], [52, -120], [44, 10], [24, 10]], tr[3]);
      poly(g, [[82, -120], [94, -120], [104, 10], [92, 10]], tr[1]);
      for (const x of [48, 58, 70, 80]) line(g, x, -116, x + (x - 64) / 6, 8, tr[1], 2);
      // buttress roots
      poly(g, [[24, 0], [0, 26], [10, 28], [34, 8]], tr[2]); poly(g, [[104, 0], [128, 24], [118, 28], [94, 8]], tr[1]);
      poly(g, [[50, 6], [42, 30], [54, 30], [60, 8]], tr[2]); poly(g, [[80, 6], [86, 30], [96, 28], [88, 6]], tr[1]);
      for (const [x, y] of [[4, 24], [44, 28], [90, 26], [120, 24]]) R(g, x, y, 8, 2, MOSS[2]);
      // the sacred rope and streamers
      line(g, 26, -48, 102, -44, ST[2], 4); line(g, 26, -47, 102, -43, ST[3], 1);
      for (let i = 0; i < 5; i++) { const x = 36 + i * 14; poly(g, [[x, -45], [x + 4, -45], [x + 2, -38], [x + 5, -38], [x + 2, -31], [x, -31]], PP[4]); }
      // leaves caught in the bark
      for (const [x, y, a, s] of [[40, -90, 0, 3], [72, -70, 1, 2], [60, -20, 0, 4], [86, -100, 1, 3], [46, -10, 1, 2]]) leaf(g, x, y, a, s);
    },
  });

  // An exhibition panel on its stand in the keepers' hall: blank, or painted with the telling chosen for it (o.v 1–4:
  // the keepers', the boatwoman's, the net-mender's, the shell's).
  const PANEL = [null, ['#4e8a7a', '#8ac0a8'], ['#c0703e', '#e8b070'], ['#5a6ab0', '#a0a8e0'], ['#4a6a8a', '#e8d4c0']];
  art('ko_panel', {
    box: [-4, -40, 40, 76],
    v: (o) => Math.max(0, Math.min(4, o.v || 0)),
    ink: true,
    shadow: () => [16, 30, 11, 3, 0.25],
    draw(g, M, v) {
      const w5 = M.wood;
      R(g, 6, 14, 3, 16, w5[1]); R(g, 23, 14, 3, 16, w5[1]);
      R(g, 2, -34, 28, 48, w5[2]); R(g, 4, -32, 24, 44, PP[3]); R(g, 4, -32, 24, 2, PP[4]);
      if (v) {
        const [a, b] = PANEL[v];
        ell(g, 16, -14, 9, 9, b); ell(g, 14, -16, 5, 4, a);
        if (v === 1) { R(g, 15, -10, 2, 10, '#6a5a4a'); ell(g, 16, -16, 7, 4, '#3e6e52'); }
        if (v === 2) { poly(g, [[8, -8], [24, -8], [20, -4], [12, -4]], '#6a5440'); R(g, 15, -22, 1, 14, '#6a5440'); poly(g, [[16, -22], [23, -12], [16, -12]], PP[4]); }
        if (v === 3) { line(g, 8, -6, 14, -14, '#3a4a7a', 2); line(g, 14, -14, 20, -8, '#3a4a7a', 2); line(g, 20, -8, 25, -18, '#3a4a7a', 2); }
        if (v === 4) { poly(g, [[12, -20], [22, -12], [12, -6], [9, -12]], '#e8d4c0'); ell(g, 12, -11, 2, 3, '#d89a8a'); }
        for (let i = 0; i < 3; i++) R(g, 8, 2 + i * 3, 16 - i * 4, 1, IK[3]);
      } else for (let i = 0; i < 3; i++) R(g, 8, -24 + i * 6, 16, 1, PP[1]);
    },
  });

  // A rack of nets drying (2×1): two posts, a pole, the nets hanging with their floats.
  art('ko_netrack', {
    box: [-4, -28, 72, 64],
    ink: true,
    shadow: () => [32, 30, 28, 3, 0.25],
    draw(g, M) {
      const w5 = M.wood;
      R(g, 4, -20, 3, 50, w5[2]); R(g, 57, -20, 3, 50, w5[2]); R(g, 2, -22, 60, 3, w5[3]);
      for (let x = 8; x < 56; x += 3) line(g, x, -19, x + ((x / 3) % 2 ? 1 : -1), 16, '#7a8e86', 1);
      for (let y = -16; y < 16; y += 4) line(g, 8, y, 56, y + 1, '#6a7e76', 1);
      for (const x of [12, 24, 36, 48]) ell(g, x, -16, 2, 2, '#d8a848');
    },
  });

  // The tide calendar's standing stone: a pillar with the moon's phases cut round a disc.
  art('ko_tidestone', {
    box: [-4, -44, 40, 80],
    ink: true,
    shadow: () => [16, 30, 11, 3, 0.28],
    draw(g, M) {
      const S = M.stone;
      R(g, 6, -38, 20, 66, S[2]); R(g, 6, -38, 5, 66, S[3]); R(g, 25, -38, 1, 66, S[0]);
      poly(g, [[6, -38], [16, -44], [26, -38]], S[3]);
      ell(g, 16, -18, 8, 8, S[1]); ell(g, 16, -18, 6, 6, '#e8eef0'); ell(g, 18, -18, 5, 6, S[1]);
      for (const [x, y] of [[16, -30], [26, -18], [16, -6], [6, -18]]) R(g, x - 1, y - 1, 2, 2, S[0]);
      R(g, 8, 24, 8, 2, MOSS[2]);
    },
  });

  // A tangle of roots across a passage in the Root Hollows (2×1). It gives way when the passage's leaf has its word
  // back (the open passage has no prop).
  art('ko_rootarch', {
    box: [-4, -36, 72, 72],
    ink: true,
    draw(g, M) {
      const tr = M.trunk;
      for (const [x0, y0, x1, y1, w, k] of [[2, -30, 30, 28, 6, 2], [62, -30, 34, 28, 6, 1], [16, -34, 48, 26, 5, 3], [44, -32, 14, 26, 5, 2], [0, 4, 64, 8, 4, 1]]) line(g, x0, y0, x1, y1, tr[k], w);
      for (const [x, y] of [[10, -10], [50, -14], [30, 6]]) leaf(g, x, y, 1, 3);
      for (const [x, y] of [[6, 22], [40, 24]]) R(g, x, y, 10, 2, MOSS[2]);
    },
  });

  // A moon stone from the tide calendar's ring: a flat beach stone with the moon's shape cut in it (o.phase: 1 the new
  // moon, a dark disc; 2 a crescent; 3 the half moon; 4 the full moon, white).
  art('ko_moonstone', {
    box: [-2, -4, 36, 40],
    v: (o) => Math.max(1, Math.min(4, o.phase || 1)),
    ink: true,
    shadow: () => [16, 28, 12, 3, 0.26],
    draw(g, M, v) {
      const S = M.stone, n = v || 1;
      ell(g, 16, 22, 13, 7, S[2]); ell(g, 14, 20, 9, 4, S[3]); R(g, 6, 26, 20, 1, S[0]);
      ell(g, 16, 21, 6, 4, '#2c2e34');
      if (n === 2) { ell(g, 19, 21, 3, 4, '#e8eef0'); ell(g, 17, 21, 3, 4, '#2c2e34'); }
      if (n === 3) R(g, 16, 17, 6, 8, '#e8eef0');
      if (n === 4) ell(g, 16, 21, 6, 4, '#e8eef0');
      R(g, 8, 27, 6, 2, MOSS[2]);
    },
  });

  // Kihei's letter, framed by the lodging house's door: a written leaf pressed under glass in a plain wooden frame on a
  // little stand.
  art('ko_frame', {
    box: [0, -20, 32, 52],
    ink: true,
    shadow: () => [16, 30, 9, 2, 0.24],
    draw(g, M) {
      const W = M.wood;
      R(g, 6, -14, 20, 30, W[1]); R(g, 8, -12, 16, 26, PP[3]); R(g, 8, -12, 16, 2, PP[4]);
      leaf(g, 12, -2, 0, 2); R(g, 10, 6, 12, 1, IK[2]); R(g, 10, 9, 9, 1, IK[2]);
      R(g, 9, 16, 3, 12, W[2]); R(g, 20, 16, 3, 12, W[2]);
    },
  });

  // A current of drifting leaves: three written leaves rising and turning in the air (stands still with reduced
  // motion).
  art('ko_current', {
    box: [0, -32, 32, 64],
    f: (t, o) => (o.still || still() ? 0 : Math.floor(t / 180) % 8),
    draw(g, M, v, f) {
      for (let i = 0; i < 3; i++) {
        const k = (f + i * 3) % 8;
        leaf(g, 6 + ((i * 9 + k * 2) % 18), 22 - i * 16 - k * 2, (k + i) % 2, 2 + (i % 3));
      }
    },
  });
})();
