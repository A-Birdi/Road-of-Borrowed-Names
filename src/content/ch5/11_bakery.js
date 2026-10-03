/* Masaru's bakery (lf.bakery): the fittings that make the room read as a
 * bakery at a glance (World review WR-05), at art resolution in the room's
 * own materials (Lanternfall's wood; brick, lime plaster, linen and bread as
 * the warm accents), lit from the upper left like the rest of the world:
 *  - lf_oven (2×1): a domed bread oven where the two cooking stoves stood,
 *    loaves on its hearth, embers glowing, a wooden peel leaning on its side;
 *  - lf_breadrack (1×1): an open rack of the day's bread (rolls in rows, a
 *    basket, round loaves under a cloth) where the bookcase stood;
 *  - lf_kneadbench (2×1): a heavy floured work table — the dough Masaru is
 *    kneading at its right end (his place, in front of it at 3,4, facing
 *    up), shaped rolls proving under linen at its left end, a bowl, a
 *    rolling pin, trays and a flour sack on the shelf below.
 * Nothing here is interactable and no new system comes with it; the order
 * table (lf.bakery_orders) and the way from the door to it are unchanged.
 * The flat drawings below are the fallback for the 16-px renderer. */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const P = RB.props && RB.props.P;
  if (!P) return;
  const px = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  const def = (id, o, draw) => (P[id] = Object.assign({ id, w: 1, h: 1, block: true }, o, { draw }));
  def('lf_oven', { w: 2 }, (c, x, y, p, t, o) => {
    px(c, x + 1, y + 3, 30, 12, '#7a5040'); px(c, x + 3, y - 10, 26, 13, '#c8b8a8');
    px(c, x + 11, y - 4, 10, 9, '#1c1210'); px(c, x + 12, y + 2, 8, 2, '#e8862a'); px(c, x + 13, y + 1, 3, 1, '#c88a4a');
  });
  def('lf_breadrack', {}, (c, x, y, p) => {
    px(c, x + 1, y - 10, 14, 24, p.wood[2]);
    for (let r = 0; r < 3; r++) for (let i = 0; i < 4; i++) px(c, x + 2 + i * 3, y - 8 + r * 7, 2, 2, '#c88a4a');
  });
  def('lf_floursacks', {}, (c, x, y) => {
    px(c, x + 2, y + 4, 12, 10, '#d8d0c0'); px(c, x + 4, y - 2, 9, 7, '#e8e0d0'); px(c, x + 5, y - 3, 7, 2, '#f4f0e6');
  });
  def('lf_kneadbench', { w: 2 }, (c, x, y, p) => {
    px(c, x + 1, y + 2, 30, 7, p.wood[1]); px(c, x + 2, y + 9, 2, 6, p.wood[2]); px(c, x + 28, y + 9, 2, 6, p.wood[2]);
    px(c, x + 20, y, 7, 4, '#efe4cc'); px(c, x + 4, y + 2, 10, 4, '#e2d6c0');
  });

  if (!RB.propArt || !RB.propKit) return;
  const K = RB.propKit, art = RB.propArt.art;
  const { R, ell, poly, line, cyl, cylCol, streaks, mix, ramp, hh } = K;
  const IR = K.FIX.iron, EM = K.FIX.ember, ST = K.FIX.straw, PP = K.FIX.paper, CHAR = K.FIX.char;
  const BRICK = ramp('#8e5a46', 0.5, 0.38), LIME = ramp('#cbbcaa', 0.5, 0.35);
  const CRUST = ['#5a2e16', '#8c4a1e', '#b8742e', '#d89a48', '#f0c878'];   // baked crust, dark → light
  const DOUGH = ['#a8967a', '#cbb898', '#e4d6ba', '#f2e8d2', '#fffaee'];   // raw dough and flour
  const LINEN = ramp('#d8d0c0', 0.45, 0.3);

  // a baked roll seen from above-front: a lit dome of crust with a pale split
  function roll(g, x, y, w, h) {
    for (let i = 0; i < w; i++) {
      const u = (i + 0.5) / w, top = Math.round((1 - Math.sqrt(Math.max(0, 1 - (2 * u - 1) * (2 * u - 1)))) * (h * 0.45));
      R(g, x + i, y + top, 1, h - top, CRUST[u < 0.35 ? 3 : u < 0.7 ? 2 : 1]);
    }
    R(g, x + 1, y + h - 1, w - 2, 1, CRUST[0]);
    R(g, x + Math.round(w * 0.3), y + 1, Math.max(1, Math.round(w * 0.3)), 1, CRUST[4]);
  }
  // a ball of shaped dough (paler, softer, no crust)
  function ball(g, x, y) {
    R(g, x + 1, y, 3, 1, DOUGH[3]); R(g, x, y + 1, 5, 2, DOUGH[2]); R(g, x + 1, y + 1, 2, 1, DOUGH[4]);
    R(g, x + 4, y + 1, 1, 2, DOUGH[1]); R(g, x + 1, y + 3, 3, 1, DOUGH[1]); R(g, x + 3, y + 3, 1, 1, DOUGH[0]);
  }
  function post(g, x, y, w, h, r5) { cyl(g, x, y, w, h, r5); R(g, x, y, w, 1, r5[4]); }

  // ---- the bread oven (2×1) -------------------------------------------------------------------------
  art('lf_oven', {
    box: [-6, -62, 88, 98],
    f: (t, o) => K.frame(t, 130, 4, o.still),
    draw(g, M, v, f) {
      const w5 = M.wood;
      // the flue, against the back wall, and its collar
      for (let i = 0; i < 9; i++) R(g, 40 + i, -58, 1, 40, cylCol(i, 9, BRICK));
      for (let y = -56; y < -20; y += 5) R(g, 40, y, 9, 1, BRICK[1]);
      R(g, 39, -58, 11, 2, BRICK[3]); R(g, 39, -22, 11, 2, LIME[2]);
      // the base: coursed brick under a lit stone hearth ledge
      R(g, 1, 6, 62, 24, BRICK[1]);
      for (let y = 6, r = 0; y < 30; y += 5, r++) for (let x = 1 - (r % 2) * 5; x < 63; x += 10) {
        const a = Math.max(x, 1), bw = Math.min(x + 9, 63) - a, k = hh(x, r, 9) % 4;
        if (bw > 0) { R(g, a, y, bw, 4, BRICK[k === 0 ? 3 : 2]); R(g, a, y, bw, 1, BRICK[k === 0 ? 4 : 3]); }
      }
      R(g, 59, 6, 4, 24, BRICK[0]); R(g, 1, 29, 62, 1, BRICK[0]);
      R(g, -1, 2, 66, 5, LIME[3]); R(g, -1, 2, 66, 1, LIME[4]); R(g, -1, 6, 66, 1, LIME[1]);
      // the ash pit under the hearth, a few split logs stacked in it
      R(g, 7, 13, 18, 12, '#1c1412'); R(g, 6, 12, 20, 1, BRICK[4]);
      for (const [x, y] of [[8, 19], [14, 19], [20, 19], [11, 15], [17, 15]]) { R(g, x, y, 5, 4, w5[2]); R(g, x, y, 5, 1, w5[3]); R(g, x, y + 1, 1, 2, '#c8a878'); R(g, x + 4, y + 1, 1, 3, w5[0]); }
      // the dome: lime plaster over the brick, round and lit from the upper left; soot over the mouth
      K.shade(g, 4, -30, 56, 34, LIME, (fx, fy) => {
        const nx = (fx - 32) / 27, ny = (fy - 3) / 29;
        if (nx * nx + ny * ny > 1 || fy > 3) return null;
        const nz = Math.sqrt(1 - nx * nx - ny * ny);
        let I = -0.55 * nx - 0.5 * ny + 0.55 * nz - 0.2;
        if (Math.abs(fx - 31) < 10 - (fy + 22) * 0.12 && fy > -22) I -= 0.55 * (1 - Math.abs(fx - 31) / 12);
        return I;
      }, 31, 0.12, 4, 3);
      line(g, 16, -20, 19, -14, LIME[1], 1); line(g, 46, -18, 44, -11, LIME[1], 1);
      // the mouth: a brick arch, the dark oven with embers at the back and loaves on the hearth
      for (let a = 0; a <= 8; a++) {
        const t = Math.PI + (a / 8) * Math.PI, x = Math.round(31 + Math.cos(t) * 13), y = Math.round(4 + Math.sin(t) * 16);
        R(g, x - 2, y - 1, 4, 4, BRICK[a % 2 ? 2 : 3]); R(g, x - 2, y - 1, 4, 1, BRICK[4]);
      }
      for (let y = -10; y < 4; y++) {
        const hw = Math.round(10 * Math.sqrt(Math.max(0, 1 - Math.pow((y - 4) / 14, 2))));
        R(g, 31 - hw, y, hw * 2, 1, y > -2 ? '#2a1610' : '#140c0a');
      }
      const glow = [EM[2], EM[3], EM[2], EM[1]][f];
      R(g, 23, -1, 16, 2, EM[1]); R(g, 25, -2, 3, 1, glow); R(g, 33, -2, 4, 1, EM[2]); R(g, 30, -3, 2, 1, EM[3 + (f === 1 ? 1 : 0)]);
      roll(g, 22, 0, 7, 4); roll(g, 30, 0, 8, 4); R(g, 21, 3, 20, 1, CHAR[2]);
      // the iron door, set aside against the base
      R(g, 46, 10, 11, 14, IR[2]); R(g, 46, 10, 11, 1, IR[3]); R(g, 46, 10, 1, 14, IR[3]); R(g, 56, 10, 1, 14, IR[0]);
      R(g, 50, 15, 3, 2, IR[4]); R(g, 47, 23, 9, 1, IR[1]);
      // the peel: a long-handled wooden paddle leaning on the oven's right side
      line(g, 66, 29, 71, 0, w5[1], 2); line(g, 66, 29, 71, 0, w5[3], 1);
      poly(g, [67, 0, 76, 0, 77, -15, 72, -19, 67, -15], w5[3]); poly(g, [72, 0, 76, 0, 77, -15, 72, -19], w5[2]);
      R(g, 68, -15, 3, 1, w5[4]); R(g, 68, -12, 1, 11, w5[4]); R(g, 69, -9, 5, 1, DOUGH[2]); R(g, 70, -5, 3, 1, DOUGH[1]);
    },
    over(g, M, v, f) { K.halo(g, 31, -1, 14 + (f % 2), '#ffa04a', 0.12 + (f === 1 ? 0.04 : 0)); },
    shadow: () => [34, 29, 34, 3.5, 0.32],
  });

  // ---- the bread rack (1×1) ----------------------------------------------------------------------------
  art('lf_breadrack', {
    box: [-4, -30, 40, 66],
    draw(g, M) {
      const w5 = M.wood;
      R(g, 3, -22, 26, 50, mix(w5[0], '#2a2030', 0.2));             // the wall behind it, in its shadow
      post(g, 0, -24, 3, 54, w5); post(g, 29, -24, 3, 54, w5);
      for (const y of [-6, 8, 22]) { R(g, 1, y, 30, 3, w5[3]); R(g, 1, y, 30, 1, w5[4]); R(g, 1, y + 3, 30, 1, w5[0]); }
      R(g, -1, -26, 34, 3, w5[3]); R(g, -1, -26, 34, 1, w5[4]);
      // top shelf: rolls in two rows (the back row darker)
      for (let i = 0; i < 4; i++) roll(g, 4 + i * 6, -14, 6, 5);
      for (let i = 0; i < 4; i++) roll(g, 3 + i * 6, -11, 7, 5);
      // middle shelf: a wicker basket of rolls, a long loaf beside it
      for (let i = 0; i < 4; i++) roll(g, 4 + i * 4, -1, 5, 4);
      R(g, 3, 2, 17, 6, ST[2]); R(g, 3, 2, 17, 1, ST[4]); for (let x = 4; x < 20; x += 3) R(g, x, 3, 1, 5, ST[1]); R(g, 3, 7, 17, 1, ST[0]);
      for (let i = 0; i < 9; i++) { const u = i / 8; R(g, 21 + i, 3 - Math.round(Math.sin(u * Math.PI) * 2), 1, 5, CRUST[u < 0.4 ? 3 : 2]); }
      R(g, 23, 2, 4, 1, CRUST[4]); R(g, 21, 7, 9, 1, CRUST[0]); R(g, 24, 4, 1, 1, CRUST[1]); R(g, 27, 4, 1, 1, CRUST[1]);
      // bottom shelf: two round country loaves, a folded cloth over one
      roll(g, 3, 13, 12, 9); roll(g, 16, 14, 12, 8);
      poly(g, [15, 14, 28, 13, 29, 19, 16, 18], LINEN[3]); R(g, 16, 13, 12, 1, LINEN[4]); line(g, 18, 16, 27, 15, LINEN[1], 1);
    },
    shadow: () => [16, 30, 15, 2.5, 0.28],
  });

  // ---- sacks of flour (1×1), one open with a scoop in it -----------------------------------------------
  art('lf_floursacks', {
    box: [-2, -16, 36, 52],
    draw(g, M) {
      const sack = (cx, cy, rx, ry, open) => {
        K.shade(g, Math.floor(cx - rx - 1), Math.floor(cy - ry - 1), Math.ceil(rx * 2 + 2), Math.ceil(ry * 2 + 2), LINEN, (fx, fy) => {
          const nx = (fx - cx) / rx, ny = (fy - cy) / ry;
          if (nx * nx + ny * ny > 1 || (ny < -0.55 && Math.abs(nx) > 0.6)) return null;
          return -0.5 * nx - 0.55 * ny + 0.45 * Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny)) - 0.15;
        }, 7 + cx, 0.1, 3, 2);
        if (open) { ell(g, cx, cy - ry * 0.62, rx * 0.62, 2.4, LINEN[1]); ell(g, cx, cy - ry * 0.66, rx * 0.5, 1.7, DOUGH[4]); }
        else { R(g, cx - 2, cy - ry + 1, 4, 2, ST[1]); R(g, cx - 1, cy - ry - 1, 2, 2, LINEN[2]); }
      };
      sack(10, 19, 9, 10, false);
      sack(22, 21, 9, 9, true);
      // the scoop standing in the open sack, and a little spilled flour
      line(g, 23, 12, 28, 4, M.wood[3], 1); R(g, 20, 13, 5, 3, IR[3]); R(g, 20, 13, 5, 1, IR[4]);
      R(g, 4, 29, 6, 1, DOUGH[4]); R(g, 22, 30, 8, 1, DOUGH[3]); R(g, 13, 7, 3, 1, LINEN[1]);
      for (const x of [5, 17]) R(g, x - 1, 22, 9, 1, LINEN[1]);
    },
    shadow: () => [16, 29, 14, 3, 0.3],
  });

  // ---- the kneading bench (2×1) --------------------------------------------------------------------------
  art('lf_kneadbench', {
    box: [-4, -16, 72, 52],
    draw(g, M) {
      const w5 = M.wood;
      // legs, stretcher and the low shelf: a flour sack and a stack of baking trays
      for (const x of [4, 57]) post(g, x, 14, 4, 16, w5);
      R(g, 7, 22, 52, 3, w5[2]); R(g, 7, 22, 52, 1, w5[3]); R(g, 7, 24, 52, 1, w5[0]);
      for (let i = 0; i < 3; i++) { R(g, 34, 17 + i * 2, 18, 1, IR[2 + (i % 2)]); R(g, 34, 18 + i * 2, 18, 1, IR[1]); }
      ell(g, 18, 18, 8, 5, LINEN[2]); ell(g, 17, 16, 6, 3.5, LINEN[3]); R(g, 13, 13, 9, 2, LINEN[3]); R(g, 15, 12, 5, 1, LINEN[1]); R(g, 12, 20, 12, 1, LINEN[1]);
      // the top: thick planks with flour worked into them
      R(g, 0, 2, 64, 11, w5[3]); R(g, 0, 2, 64, 1, w5[4]); R(g, 1, 7, 62, 1, w5[2]);
      streaks(g, 2, 3, 60, 8, w5[2], 21, 9, 6);
      R(g, 0, 13, 64, 3, w5[1]); R(g, 0, 13, 64, 1, w5[2]);
      for (let i = 0; i < 12; i++) { const r = hh(5, i, 3), x = 30 + (r % 32), y = 3 + ((r >>> 5) % 9); R(g, x, y, 2 + ((r >>> 9) % 3), 1, DOUGH[3]); }
      // left: a tray of shaped rolls proving, a linen cloth turned back off them
      R(g, 2, 3, 22, 9, IR[2]); R(g, 2, 3, 22, 1, IR[3]); R(g, 2, 11, 22, 1, IR[0]); R(g, 3, 4, 20, 7, IR[1]);
      for (let r = 0; r < 2; r++) for (let i = 0; i < 4; i++) ball(g, 3 + i * 5, 4 + r * 3);
      poly(g, [1, 1, 12, 0, 13, 4, 2, 5], LINEN[3]); R(g, 1, 1, 11, 1, LINEN[4]); line(g, 2, 5, 13, 4, LINEN[1], 1); R(g, 6, 2, 1, 2, LINEN[2]);
      // the middle and right, where Masaru works: the dough mass on a floured patch, a bowl, a rolling pin, a scraper
      ell(g, 38, 8, 12, 4, DOUGH[3]); R(g, 28, 6, 4, 1, DOUGH[4]); R(g, 47, 10, 4, 1, DOUGH[4]);
      ell(g, 38, 6, 8, 4.5, DOUGH[0]); ell(g, 37, 5, 7.5, 3.8, DOUGH[2]); ell(g, 35, 4, 4, 1.8, DOUGH[3]); R(g, 33, 3, 3, 1, DOUGH[4]);
      line(g, 35, 7, 41, 8, DOUGH[0], 1);
      for (let i = 0; i < 10; i++) R(g, 50 + i, -2, 1, 7, cylCol(i, 10, w5)); ell(g, 55, -2, 5, 1.4, w5[1]); ell(g, 55, -2, 3.6, 0.9, DOUGH[2]);
      line(g, 26, 12, 34, 11, w5[4], 2); R(g, 25, 11, 2, 2, w5[2]); R(g, 34, 10, 2, 2, w5[2]);
      R(g, 54, 8, 6, 3, IR[3]); R(g, 54, 8, 6, 1, IR[4]); R(g, 59, 7, 2, 2, w5[2]);
    },
    shadow: () => [32, 29, 32, 3, 0.3],
  });
})();
