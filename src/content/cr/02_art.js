/* The Cloudroad's props (expansion P12): a station's everlasting lamp (常夜灯) dark or lit, a palanquin (駕籠) for the
 * shortcuts between stations, the great cedar of Suginoki with its sacred rope, a bridge washed out over a stream, a
 * landslide's rocks, a pack horse with its load, a fog bank, the Mist Barrier's roofed gate (shut or open), and the
 * last courier's letter box (状箱) in the snow. Each has a flat 16-px drawing (the fallback, as every prop) and its
 * art-resolution version in the world's prop style (light from the upper left, hue-shifted ramps, an ink outline on
 * what can be looked at, a soft contact shadow). A lit lamp gives light through the lit instance's `light`. Regional
 * assets under AC-1 (C-82), reviewed in the art pass (P16d; implemented provisionally, internally reviewed): the
 * packhorse redrawn (a barrel body, a long head, jointed legs, its pack saddle on a blanket). */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const P = RB.props.P;
  const px = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  const def = (id, o, draw) => (P[id] = Object.assign({ id, w: 1, h: 1, block: true }, o, { draw }));
  const still = () => RB.game && RB.game.reducedMotion && RB.game.reducedMotion();

  // ---- flat fallbacks (16 px a tile) -------------------------------------------------------------------------------
  def('cr_joyato', {}, (c, x, y, p, t, o) => {
    px(c, x + 2, y + 12, 12, 4, p.stone[2]); px(c, x + 4, y + 9, 8, 3, p.stone[1]);
    px(c, x + 6, y - 2, 4, 11, p.stone[1]); px(c, x + 3, y - 10, 10, 8, p.stone[1]);
    px(c, x + 5, y - 8, 6, 4, o && o.lit ? '#ffc870' : '#262628');
    px(c, x + 1, y - 13, 14, 3, p.roof[1]); px(c, x + 6, y - 16, 4, 3, p.stone[0]);
  });
  def('cr_kago', { w: 2 }, (c, x, y, p) => {
    px(c, x, y + 1, 32, 2, p.wood[2]); px(c, x + 9, y + 3, 14, 10, p.reed[1]); px(c, x + 9, y + 3, 14, 2, p.reed[2]);
    px(c, x + 11, y + 6, 10, 5, p.reed[0]); px(c, x + 8, y + 13, 16, 2, p.wood[2]);
  });
  def('cr_bigcedar', { w: 2 }, (c, x, y, p) => {
    px(c, x + 10, y - 20, 12, 36, p.trunk[0]); px(c, x + 10, y - 20, 3, 36, p.trunk[1]);
    px(c, x + 2, y - 40, 28, 22, p.leaf[0]); px(c, x + 6, y - 46, 20, 8, p.leaf[1]);
    px(c, x + 8, y - 6, 16, 2, '#e8dcb0'); px(c, x + 12, y - 4, 2, 4, '#f4f0e0'); px(c, x + 18, y - 4, 2, 4, '#f4f0e0');
  });
  def('cr_bridge_out', { w: 2 }, (c, x, y, p) => {
    px(c, x, y + 2, 8, 12, p.wood[1]); px(c, x + 24, y + 2, 8, 12, p.wood[1]);
    px(c, x + 8, y + 6, 6, 3, p.wood[2]); px(c, x + 19, y + 9, 5, 3, p.wood[2]);
  });
  def('cr_slide', { w: 2 }, (c, x, y, p) => {
    px(c, x + 2, y + 4, 28, 12, p.dirt[2]); px(c, x + 4, y, 10, 8, p.stone[1]); px(c, x + 16, y + 2, 12, 9, p.stone[2]);
    px(c, x + 10, y + 9, 8, 6, p.stone[0]);
  });
  def('cr_horse', {}, (c, x, y, p) => {
    px(c, x + 1, y + 4, 13, 6, '#7a5236'); px(c, x + 12, y, 4, 6, '#7a5236'); px(c, x + 2, y + 10, 2, 6, '#5a3a24');
    px(c, x + 11, y + 10, 2, 6, '#5a3a24'); px(c, x + 3, y + 1, 8, 4, '#c8b080'); px(c, x + 13, y - 1, 2, 3, '#3a2a1e');
  });
  def('cr_fogbank', {}, (c, x, y) => {
    px(c, x - 4, y - 2, 24, 18, 'rgba(236,240,244,0.82)'); px(c, x - 2, y - 6, 18, 6, 'rgba(240,244,248,0.7)');
  });
  def('cr_gate', {}, (c, x, y, p, t, o) => {
    px(c, x - 10, y - 18, 36, 4, p.roof[1]); px(c, x - 8, y - 14, 3, 30, p.wood[2]); px(c, x + 21, y - 14, 3, 30, p.wood[2]);
    if (!(o && o.open)) { px(c, x - 5, y - 12, 26, 28, p.wood[1]); px(c, x + 7, y - 12, 2, 28, p.wood[2]); }
  });
  def('cr_satchel', { block: false }, (c, x, y) => {
    px(c, x + 3, y + 7, 10, 7, '#3e1418'); px(c, x + 3, y + 7, 10, 2, '#6c2226'); px(c, x + 1, y + 5, 14, 1, '#6a5022');
  });

  // ---- art resolution (32 px a tile) -------------------------------------------------------------------------------
  if (!RB.propArt || !RB.propKit) return;
  const K = RB.propKit, art = RB.propArt.art;
  const { R, ell, line } = K;
  // the kit's poly takes a flat [x0, y0, x1, y1, …]; the points here are written as pairs
  const poly = (g, pts, c) => K.poly(g, Array.isArray(pts[0]) ? pts.flat() : pts, c);
  const GL = K.FIX.glow, PP = K.FIX.paper, LQ = K.FIX.lacquer, ST = K.FIX.straw;
  const HORSE = ['#3a2416', '#5a3a24', '#7a5236', '#9a6e4a', '#b88c62'];

  // The everlasting lamp (常夜灯): a stepped stone base, a tall post, a fire box with paper windows under a wide roof,
  // the station's name once written on its face. Dark: grey paper. Lit: warm light through the paper.
  art('cr_joyato', {
    box: [-8, -60, 48, 104],
    v: (o) => (o.lit ? 1 : 0),
    f: (t, o) => (o.lit && !(o.still || still()) ? Math.floor(t / 300) % 3 : 0),
    ink: true,
    shadow: () => [16, 30, 14, 3, 0.32],
    draw(g, M, v, f) {
      const S = M.stone, W = M.wood, RF = M.roof;
      // the steps of the base
      R(g, 2, 24, 28, 6, S[1]); R(g, 2, 24, 28, 2, S[3]); R(g, 29, 24, 1, 6, S[0]);
      R(g, 6, 18, 20, 6, S[2]); R(g, 6, 18, 20, 2, S[3]); R(g, 25, 18, 1, 6, S[0]);
      // the post
      R(g, 12, -6, 8, 24, S[2]); R(g, 12, -6, 3, 24, S[3]); R(g, 19, -6, 1, 24, S[0]);
      // the fire box: a wooden frame, paper windows
      R(g, 5, -30, 22, 24, W[2]); R(g, 5, -30, 22, 2, W[3]); R(g, 26, -30, 1, 24, W[0]);
      if (v) {
        const fl = [GL[3], GL[4], GL[3]][f];
        R(g, 8, -27, 7, 18, GL[2]); R(g, 17, -27, 7, 18, GL[2]); R(g, 10, -24, 3, 12, fl); R(g, 19, -24, 3, 12, fl);
      } else { R(g, 8, -27, 7, 18, PP[1]); R(g, 17, -27, 7, 18, PP[1]); R(g, 8, -27, 7, 2, PP[2]); R(g, 17, -27, 7, 2, PP[2]); }
      R(g, 15, -27, 2, 18, W[1]);
      // the roof, its ridge and the jewel on top
      poly(g, [[-2, -30], [16, -42], [34, -30], [30, -28], [2, -28]], RF[2]);
      poly(g, [[0, -30], [16, -41], [16, -30]], RF[3]);
      R(g, 13, -47, 6, 6, S[2]); R(g, 13, -47, 2, 6, S[3]);
      line(g, -1, -30, 33, -30, RF[0], 1);
    },
  });
  // The palanquin (駕籠): a woven box hung from a long pole, its straw blind rolled up; the bearers wait nearby.
  art('cr_kago', {
    box: [-4, -20, 72, 52],
    ink: true,
    shadow: () => [32, 28, 24, 3, 0.28],
    draw(g, M) {
      const W = M.wood;
      R(g, 0, -10, 64, 4, W[2]); R(g, 0, -10, 64, 1, W[3]);
      R(g, 20, -6, 2, 8, W[1]); R(g, 42, -6, 2, 8, W[1]);
      R(g, 16, 2, 32, 20, ST[2]); R(g, 16, 2, 32, 3, ST[3]); R(g, 47, 2, 1, 20, ST[0]);
      for (let i = 0; i < 6; i++) line(g, 18 + i * 5, 5, 18 + i * 5, 21, ST[1], 1);
      R(g, 22, 6, 20, 11, ST[0]); R(g, 22, 4, 20, 3, ST[3]);
      R(g, 14, 22, 36, 4, W[2]); R(g, 14, 22, 36, 1, W[3]);
    },
  });
  // The great cedar (大杉) at Suginoki: a trunk wider than two people, a sacred rope (しめ縄) with paper streamers, the
  // crown far above.
  art('cr_bigcedar', {
    box: [-16, -96, 96, 128],
    ink: true,
    shadow: () => [32, 30, 30, 5, 0.34],
    draw(g, M) {
      const TR = M.trunk, L = M.leaf;
      // the crown in tiers
      for (const [cx, cy, rx, ry] of [[32, -78, 26, 14], [32, -62, 34, 14], [32, -46, 38, 14]]) { ell(g, cx, cy, rx, ry, L[1]); ell(g, cx - 6, cy - 3, rx - 10, ry - 5, L[2]); ell(g, cx - 10, cy - 5, rx - 18, ry - 8, L[3]); }
      // the trunk
      R(g, 18, -40, 28, 70, TR[2]); R(g, 18, -40, 8, 70, TR[3]); R(g, 44, -40, 2, 70, TR[0]);
      for (let i = 0; i < 6; i++) line(g, 22 + i * 4, -36, 21 + i * 4, 28, TR[1], 1);
      R(g, 12, 26, 40, 4, TR[1]);
      // the sacred rope and its streamers
      R(g, 16, -8, 32, 4, ST[3]); R(g, 16, -8, 32, 1, ST[4]); R(g, 16, -5, 32, 1, ST[1]);
      for (const sx of [22, 31, 40]) { R(g, sx, -4, 3, 3, PP[4]); R(g, sx + 1, -1, 3, 3, PP[3]); R(g, sx, 2, 3, 3, PP[4]); }
    },
  });
  // A bridge washed out (流された橋): the two ends of the planking, snapped; the stream running fast between them.
  art('cr_bridge_out', {
    box: [-4, -8, 72, 72],
    f: (t, o) => (o.still || still() ? 0 : Math.floor(t / 180) % 4),
    ink: true,
    draw(g, M, v, f) {
      const W = M.wood, WA = M.water;
      R(g, 0, 0, 64, 64, WA[1]);
      for (let i = 0; i < 6; i++) line(g, 6 + ((i * 11 + f * 3) % 52), 4 + i * 10, 14 + ((i * 11 + f * 3) % 52), 4 + i * 10, WA[3], 1);
      R(g, 0, 8, 14, 48, W[2]); R(g, 0, 8, 14, 3, W[3]); R(g, 50, 8, 14, 48, W[2]); R(g, 50, 8, 14, 3, W[3]);
      poly(g, [[14, 20], [26, 26], [24, 30], [14, 25]], W[1]); poly(g, [[50, 34], [40, 40], [42, 44], [50, 40]], W[1]);
      for (const y0 of [14, 24, 34, 44]) { line(g, 0, y0, 13, y0, W[1], 1); line(g, 51, y0, 63, y0, W[1], 1); }
    },
  });
  // A landslide (崖崩れ): earth and rocks spilled across the way, a split stone on top.
  art('cr_slide', {
    box: [-6, -16, 76, 84],
    ink: true,
    shadow: () => [32, 60, 30, 4, 0.3],
    draw(g, M) {
      const S = M.stone, D = [M.wood[0], '#6e6252', '#8c8070', '#a89c88', '#c2b8a2'];
      poly(g, [[0, 60], [6, 28], [20, 14], [44, 10], [60, 24], [64, 60]], D[1]);
      poly(g, [[6, 50], [12, 30], [26, 20], [40, 22], [30, 40]], D[2]);
      for (const [x0, y0, w, h] of [[8, 34, 16, 12], [30, 18, 20, 14], [40, 40, 16, 14], [18, 48, 14, 10]]) {
        R(g, x0, y0, w, h, S[2]); R(g, x0, y0, w, 3, S[3]); R(g, x0 + w - 2, y0, 2, h, S[0]);
      }
      line(g, 36, 20, 42, 32, S[0], 1);
    },
  });
  // The pack horse (駄馬): a stocky bay with a straw pack saddle and two bundles; ears and tail move.
  art('cr_horse', {
    box: [-12, -24, 60, 60],
    f: (t, o) => (o.still || still() ? 0 : Math.floor(t / 700) % 4),
    ink: true,
    shadow: () => [16, 30, 18, 3, 0.3],
    draw(g, M, v, f) {
      const H = HORSE, hoof = '#1e1610', step = f === 1 ? 1 : f === 3 ? -1 : 0;
      // the far legs, darker, behind the body
      const leg = (x, top, lean, c) => { poly(g, [[x - 2, top], [x + 3, top], [x + 2 + lean, top + 9], [x + 2 + lean, 27], [x - 1 + lean, 27], [x - 1 + lean, top + 9]], c); R(g, x - 2 + lean, 27, 5, 3, hoof); };
      leg(0, 10, -step, H[0]); leg(25, 10, step, H[0]);
      // the barrel of the body, the haunch and the chest, lit from the upper left
      ell(g, 14, 8, 19, 9, H[2]); ell(g, 2, 7, 9, 9, H[2]); ell(g, 27, 7, 8, 9, H[2]);
      ell(g, 10, 4, 14, 4, H[3]); ell(g, 2, 3, 5, 4, H[3]); ell(g, 12, 15, 16, 2.5, H[1]);
      // the near legs
      leg(4, 11, step, H[1]); leg(29, 11, -step, H[1]);
      // the neck rising forward to the head; the head long, the muzzle darker, an ear up
      poly(g, [[27, 0], [33, -12], [38, -15], [41, -10], [36, 6], [29, 9]], H[2]);
      poly(g, [[33, -12], [37, -16], [40, -12], [35, -6]], H[3]);
      poly(g, [[36, -15], [44, -11], [48, -4], [46, -1], [41, -2], [37, -8]], H[2]);
      poly(g, [[44, -8], [48, -4], [46, -1], [43, -3]], H[1]);
      R(g, 39, -11, 2, 2, hoof); R(g, 39, -11, 1, 1, '#c8b8a0');
      poly(g, [[36, -16], [37, -21 + (f === 2 ? 1 : 0)], [39, -16]], H[1]);
      // the mane along the neck and the tail
      for (let k = 0; k < 5; k++) R(g, 30 + k * 1.4, -1 - k * 2.6, 2, 3, H[0]);
      line(g, -4, 2, -7, 12 + (f === 2 ? 1 : 0), H[0], 3); line(g, -6, 10, -6, 17, H[0], 2);
      // the pack saddle on a blanket, two straw bundles roped either side
      R(g, 4, -2, 22, 4, '#7a3a2e'); R(g, 4, -2, 22, 1, '#9a5a4a');
      R(g, 6, -8, 18, 6, ST[2]); R(g, 6, -8, 18, 2, ST[3]); R(g, 6, -3, 18, 1, ST[0]);
      for (const bx of [-1, 21]) { R(g, bx, -4, 10, 13, ST[2]); R(g, bx, -4, 10, 2, ST[3]); R(g, bx + 9, -4, 1, 13, ST[0]); R(g, bx, 3, 10, 1, ST[0]); }
      line(g, 15, -8, 15, 12, '#5a4a30', 1);
    },
  });
  // A fog bank (霧): a wall of white over the edge of the road, drifting; nothing to see through it.
  art('cr_fogbank', {
    box: [-24, -24, 80, 64],
    f: (t, o) => (o.still || still() ? 0 : Math.floor(t / 400) % 6),
    draw(g, M, v, f) {
      const d = [0, 1, 2, 2, 1, 0][f];
      for (const [cx, cy, rx, ry, a] of [[16, 10, 30, 14, 0.75], [4 + d, -2, 18, 10, 0.65], [28 - d, 0, 20, 11, 0.65], [16, 22, 28, 8, 0.6]]) ell(g, cx, cy, rx, ry, 'rgba(238,242,246,' + a + ')');
    },
  });
  // The Mist Barrier's gate (関所の門): two posts and a tiled roof; heavy doors shut across the road, or open.
  art('cr_gate', {
    box: [-28, -52, 88, 124],
    v: (o) => (o.open ? 1 : 0),
    ink: true,
    shadow: () => [16, 62, 28, 4, 0.3],
    draw(g, M, v) {
      const W = M.wood, RF = M.roof, I = K.FIX.iron;
      // the posts
      R(g, -18, -30, 7, 92, W[2]); R(g, -18, -30, 2, 92, W[3]); R(g, 43, -30, 7, 92, W[2]); R(g, 43, -30, 2, 92, W[3]);
      R(g, -18, -22, 68, 5, W[1]);
      // the roof
      poly(g, [[-26, -32], [-14, -44], [46, -44], [58, -32]], RF[2]); poly(g, [[-26, -32], [-14, -44], [16, -44], [16, -32]], RF[3]);
      line(g, -26, -32, 58, -32, RF[0], 2);
      if (!v) {
        // the doors shut, iron studs
        R(g, -11, -17, 27, 79, W[2]); R(g, 16, -17, 27, 79, W[2]); R(g, -11, -17, 27, 3, W[3]); R(g, 16, -17, 27, 3, W[3]);
        line(g, 16, -17, 16, 62, W[0], 1);
        for (let r = 0; r < 4; r++) for (let k = 0; k < 3; k++) { R(g, -6 + k * 8, -6 + r * 18, 2, 2, I[3]); R(g, 22 + k * 8, -6 + r * 18, 2, 2, I[3]); }
      } else {
        // open: the doors folded back against the posts
        R(g, -11, -17, 6, 79, W[1]); R(g, 37, -17, 6, 79, W[1]);
      }
    },
  });
  // The last courier's letter box (状箱): black lacquer, a red cord, half in the snow.
  art('cr_satchel', {
    box: [-4, -4, 40, 40],
    ink: true,
    draw(g, M) {
      const SN = M.snow;
      ell(g, 16, 26, 14, 4, SN[2]);
      R(g, 6, 12, 20, 13, LQ[0]); R(g, 6, 12, 20, 3, LQ[1]); R(g, 25, 12, 1, 13, '#1a0a0c');
      line(g, 6, 18, 26, 18, LQ[3], 1); line(g, 16, 12, 16, 25, LQ[3], 1);
      R(g, 2, 24, 28, 3, SN[3]);
    },
  });
})();
