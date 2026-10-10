/* The Keepers' Road's props (expansion P10): the stone lantern (石灯籠) dark or lit, a fallen cedar across the steps,
 * an inscribed stele, the vigil's ledge of wicks, the etoki teller's scroll on its stand, the oil cache's jar and the
 * shuttered hall's roped door. Each has a flat 16-px drawing (the fallback, as every prop) and its art-resolution
 * version in the world's prop style (light from the upper left, hue-shifted ramps, an ink outline on what can be
 * looked at, a soft contact shadow). A lit lantern gives light through the prop's `light` (set on the lit
 * instance). Interim regional assets under AC-1 (C-82): finished in the art pass (P16). */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const P = RB.props.P;
  const px = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  const def = (id, o, draw) => (P[id] = Object.assign({ id, w: 1, h: 1, block: true }, o, { draw }));
  const still = () => RB.game && RB.game.reducedMotion && RB.game.reducedMotion();

  // ---- flat fallbacks (16 px a tile) -------------------------------------------------------------------------------
  def('kr_toro', {}, (c, x, y, p, t, o) => {
    px(c, x + 5, y + 8, 6, 7, p.stone[1]); px(c, x + 3, y + 13, 10, 3, p.stone[2]);
    px(c, x + 4, y + 1, 8, 7, p.stone[1]); px(c, x + 2, y - 2, 12, 3, p.stone[2]); px(c, x + 6, y - 5, 4, 3, p.stone[0]);
    const lit = o && o.lit;
    px(c, x + 6, y + 3, 4, 3, lit ? '#ffc870' : '#2a2a2e');
    px(c, x + 2, y - 2, 4, 1, '#5e7a46');
  });
  def('kr_cedar', { w: 3 }, (c, x, y, p) => {
    px(c, x, y + 6, 48, 7, p.trunk[0]); px(c, x, y + 6, 48, 2, p.trunk[1]);
    px(c, x + 40, y + 2, 6, 12, '#3e5a34');
  });
  def('kr_stele', {}, (c, x, y, p) => {
    px(c, x + 3, y - 10, 10, 24, p.stone[1]); px(c, x + 3, y - 10, 10, 2, p.stone[2]); px(c, x + 2, y + 13, 12, 3, p.stone[2]);
    for (let i = 0; i < 4; i++) px(c, x + 6, y - 6 + i * 5, 4, 2, p.stone[0]);
  });
  def('kr_wicks', { w: 2, block: true }, (c, x, y, p, t, o) => {
    px(c, x, y + 6, 32, 6, p.stone[2]); px(c, x, y + 6, 32, 1, p.stone[1]);
    const n = o && o.n != null ? o.n : 0;
    for (let i = 0; i < 6; i++) { px(c, x + 2 + i * 5, y + 3, 3, 3, '#3a3434'); if (i < n) px(c, x + 3 + i * 5, y, 1, 3, '#ffc870'); }
  });
  def('kr_scroll', {}, (c, x, y, p) => {
    px(c, x + 2, y - 14, 12, 2, p.wood[2]); px(c, x + 3, y - 12, 10, 20, '#e8dcc0'); px(c, x + 4, y - 10, 8, 7, '#a86a4a');
    px(c, x + 7, y + 8, 2, 7, p.wood[2]);
  });
  def('kr_jar', {}, (c, x, y, p) => {
    px(c, x + 4, y + 4, 8, 10, '#7e402b'); px(c, x + 5, y + 2, 6, 2, '#55291f'); px(c, x + 5, y + 5, 2, 6, '#a45c39');
  });
  def('kr_halldoor', { w: 2 }, (c, x, y, p) => {
    px(c, x + 2, y - 14, 28, 28, p.wood[1]); px(c, x + 15, y - 14, 2, 28, p.wood[2]);
    px(c, x, y - 6, 32, 2, '#c8b07a'); for (let i = 0; i < 4; i++) px(c, x + 4 + i * 7, y - 4, 2, 5, '#f0e8d0');
  });

  // ---- art resolution (32 px a tile) -------------------------------------------------------------------------------
  if (!RB.propArt || !RB.propKit) return;
  const K = RB.propKit, art = RB.propArt.art;
  const { R, ell, poly, line } = K;
  const PP = K.FIX.paper, GL = K.FIX.glow, CL = K.FIX.clay, ST = K.FIX.straw;
  const MOSS = ['#2e3e24', '#3e5230', '#52683c', '#6a8250', '#86a064'];

  // The stone lantern (石灯籠): a base, a post, the fire box with its window, a wide hat with a knob, moss on the hat.
  // Dark: the window is black. Lit: warm light in the window and a little on the hat's underside (the light around
  // it comes from the lit instance's `light`).
  art('kr_toro', {
    box: [-6, -40, 44, 84],
    v: (o) => (o.lit ? 1 : 0),
    f: (t, o) => (o.lit && !(o.still || still()) ? Math.floor(t / 320) % 3 : 0),
    ink: true,
    shadow: () => [16, 30, 12, 3, 0.3],
    draw(g, M, v, f) {
      const S = M.stone;
      // base and post
      R(g, 6, 24, 20, 6, S[1]); R(g, 6, 24, 20, 2, S[3]); R(g, 25, 24, 1, 6, S[0]);
      R(g, 11, 6, 10, 18, S[2]); R(g, 11, 6, 3, 18, S[3]); R(g, 20, 6, 1, 18, S[0]);
      // the fire box
      R(g, 7, -10, 18, 16, S[2]); R(g, 7, -10, 18, 2, S[3]); R(g, 24, -10, 1, 16, S[0]);
      if (v) {
        const fl = [GL[3], GL[4], GL[3]][f];
        R(g, 11, -7, 10, 9, GL[1]); R(g, 12, -6, 8, 7, GL[2]); R(g, 14, -5, 4, 5, fl);
      } else { R(g, 11, -7, 10, 9, '#1a1a1e'); R(g, 12, -6, 8, 1, '#2a2a30'); }
      // the hat and the knob
      poly(g, [[1, -11], [16, -22], [31, -11], [27, -9], [5, -9]], S[2]);
      poly(g, [[3, -11], [16, -21], [16, -11]], S[3]);
      R(g, 4, -10, 24, 1, v ? GL[1] : S[0]);
      ell(g, 16, -24, 3, 3, S[2]); ell(g, 15, -25, 1, 1, S[4]);
      // moss on the hat and the base
      for (const [mx, my, mw] of [[6, -12, 6], [18, -16, 5], [24, -12, 4], [7, 23, 5], [19, 23, 4]]) { R(g, mx, my, mw, 2, MOSS[2]); R(g, mx, my, mw - 2, 1, MOSS[3]); }
    },
  });

  // A fallen cedar (3×1) across the steps: the trunk with its bark, a broken end, and a tuft of needles at the crown.
  art('kr_cedar', {
    box: [-4, -8, 104, 44],
    ink: true,
    shadow: () => [48, 26, 46, 4, 0.3],
    draw(g, M) {
      const tr = M.trunk;
      R(g, 2, 8, 84, 14, tr[1]); R(g, 2, 8, 84, 3, tr[2] || tr[1]); R(g, 2, 20, 84, 2, tr[0]);
      for (let x = 6; x < 84; x += 7) R(g, x, 11, 1, 9, tr[0]);
      ell(g, 4, 15, 4, 7, '#8a6a4a'); ell(g, 4, 15, 2, 4, '#a8865e');
      for (const [x, y] of [[82, 2], [88, 8], [84, 14], [92, 4], [90, 16]]) { ell(g, x, y + 4, 6, 4, MOSS[1]); ell(g, x - 1, y + 3, 4, 2, MOSS[3]); }
    },
  });

  // An inscribed stele (石碑): a tall dressed stone on a plinth, columns of cut characters (strokes, never letters).
  art('kr_stele', {
    box: [-4, -48, 40, 92],
    ink: true,
    shadow: () => [16, 30, 12, 3, 0.3],
    draw(g, M) {
      const S = M.stone;
      R(g, 4, 24, 24, 6, S[1]); R(g, 4, 24, 24, 2, S[3]);
      R(g, 8, -40, 16, 64, S[2]); R(g, 8, -40, 4, 64, S[3]); R(g, 23, -40, 1, 64, S[0]);
      poly(g, [[8, -40], [16, -44], [24, -40]], S[3]);
      for (const cx of [13, 18]) for (let y = -34; y < 18; y += 6) R(g, cx, y, 2, 3, S[0]);
      R(g, 9, 14, 6, 2, MOSS[2]);
    },
  });

  // The vigil's ledge of wicks (2×1): a stone ledge with small oil dishes, the first o.n of them burning.
  art('kr_wicks', {
    box: [-2, -16, 68, 48],
    v: (o) => Math.max(0, Math.min(6, o.n || 0)),
    f: (t, o) => (o.still || still() ? 0 : Math.floor(t / 300) % 2),
    draw(g, M, v, f) {
      const S = M.stone;
      R(g, 0, 14, 64, 12, S[1]); R(g, 0, 14, 64, 3, S[3]); R(g, 0, 25, 64, 1, S[0]);
      for (let i = 0; i < 6; i++) {
        const x = 5 + i * 10;
        ell(g, x + 2, 12, 4, 2, CL[1]); ell(g, x + 2, 11, 3, 1, CL[3]);
        if (i < v) { R(g, x + 2, 4 + ((i + f) % 2), 1, 6, GL[3]); R(g, x + 1, 7, 3, 3, GL[2]); }
      }
    },
  });

  // The etoki teller's scroll on its stand: a hanging painted scroll (a road, lanterns, small figures) on a frame.
  art('kr_scroll', {
    box: [-4, -60, 40, 104],
    ink: true,
    shadow: () => [16, 30, 10, 3, 0.25],
    draw(g, M) {
      const w5 = M.wood;
      R(g, 6, -54, 3, 84, w5[2]); R(g, 23, -54, 3, 84, w5[2]); R(g, 4, -56, 24, 3, w5[3]);
      R(g, 8, -52, 16, 56, PP[3]); R(g, 8, -52, 16, 2, PP[4]); R(g, 8, 2, 16, 2, w5[1]);
      // the painting: a winding road, three lanterns, a red maple, two figures
      line(g, 10, 0, 22, -20, ST[1], 2); line(g, 22, -20, 11, -40, ST[1], 2);
      for (const [lx, ly] of [[14, -8], [19, -26], [13, -44]]) { R(g, lx, ly, 2, 3, '#6e7268'); R(g, lx, ly - 1, 2, 1, GL[2]); }
      ell(g, 20, -44, 3, 3, '#b0482e'); R(g, 11, -18, 1, 3, '#2a2420'); R(g, 15, -32, 1, 3, '#2a2420');
    },
  });

  // The oil cache's jar: an earthenware jar with a wooden lid, half dug out.
  art('kr_jar', {
    box: [-2, -10, 36, 44],
    ink: true,
    shadow: () => [16, 28, 10, 3, 0.28],
    draw(g, M) {
      ell(g, 16, 16, 10, 12, CL[2]); ell(g, 13, 13, 4, 7, CL[3]); R(g, 9, 2, 14, 4, M.wood[2]); R(g, 9, 2, 14, 1, M.wood[3]);
      R(g, 4, 24, 24, 4, M.dirt ? M.dirt[1] : CL[1]);
    },
  });

  // The shuttered hall's door (2×1): heavy boards behind a straw rope with paper streamers; shut.
  art('kr_halldoor', {
    box: [-4, -44, 72, 76],
    ink: true,
    draw(g, M) {
      const w5 = M.wood;
      R(g, 2, -40, 60, 64, w5[1]); R(g, 2, -40, 60, 3, w5[3]); R(g, 31, -40, 2, 64, w5[0]);
      for (let y = -32; y < 22; y += 8) { R(g, 4, y, 26, 1, w5[0]); R(g, 34, y, 26, 1, w5[0]); }
      line(g, 0, -18, 64, -18, ST[2], 3); line(g, 0, -17, 64, -17, ST[3], 1);
      for (let i = 0; i < 5; i++) { const x = 6 + i * 13; poly(g, [[x, -16], [x + 4, -16], [x + 2, -10], [x + 5, -10], [x + 2, -4], [x, -4]], PP[4]); }
    },
  });
})();
