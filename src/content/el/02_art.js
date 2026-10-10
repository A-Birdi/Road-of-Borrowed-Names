/* East Landing's props (expansion P11d): silt banked up in the old channel (a pale sand bar over the water, gone once
 * the channel is dug) and a broken run of jetty planks (blocking, until the jetty is mended). A flat 16-px drawing
 * (the fallback, as every prop) and its art-resolution version in the world's prop style. Interim regional assets
 * under AC-1 (C-82): finished in the art pass (P16). */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const P = RB.props.P;
  const px = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  const def = (id, o, draw) => (P[id] = Object.assign({ id, w: 1, h: 1, block: true }, o, { draw }));
  const SILT = ['#a8987a', '#c2b490', '#d8cca8', '#e8dec0'];

  def('el_silt', { w: 2, block: false }, (c, x, y) => {
    px(c, x + 2, y + 5, 28, 8, SILT[1]); px(c, x + 5, y + 4, 20, 2, SILT[2]); px(c, x + 8, y + 8, 6, 1, SILT[0]); px(c, x + 18, y + 10, 8, 1, SILT[0]);
  });
  def('el_brokenplanks', {}, (c, x, y, p) => {
    px(c, x + 1, y + 3, 6, 3, p.wood[2]); px(c, x + 9, y + 9, 6, 3, p.wood[1]); px(c, x + 3, y + 12, 9, 2, p.wood[0]);
  });

  if (!RB.propArt || !RB.propKit) return;
  const K = RB.propKit, art = RB.propArt.art;
  const { R, ell, line } = K;
  // the kit's poly takes a flat [x0, y0, x1, y1, …]; the points here are written as pairs
  const poly = (g, pts, c) => K.poly(g, Array.isArray(pts[0]) ? pts.flat() : pts, c);
  // silt: a low bar of wet sand breaking the water's surface, ripple lines along its edge, a stranded shell
  art('el_silt', {
    box: [0, 0, 64, 32],
    draw(g) {
      ell(g, 32, 18, 29, 9, 'rgba(60,80,80,0.18)');
      poly(g, [[4, 18], [14, 10], [34, 8], [56, 12], [61, 19], [48, 25], [20, 26]], SILT[1]);
      poly(g, [[12, 14], [30, 10], [50, 13], [40, 17], [18, 18]], SILT[2]);
      for (const [x0, y0, x1, y1] of [[8, 21, 22, 23], [30, 22, 48, 21], [16, 12, 26, 11]]) line(g, x0, y0, x1, y1, SILT[0], 1);
      ell(g, 44, 15, 2, 1, SILT[3]); R(g, 26, 16, 3, 1, '#8a7a5e');
    },
  });
  // broken planks: a gap in the jetty, two planks snapped and hanging, one floating askew
  art('el_brokenplanks', {
    box: [-2, -4, 36, 40],
    ink: true,
    draw(g, M) {
      const W = M.wood;
      R(g, 0, 0, 32, 32, 'rgba(30,60,70,0.35)');
      poly(g, [[2, 2], [14, 4], [12, 10], [1, 8]], W[2]); poly(g, [[2, 2], [14, 4], [14, 5], [2, 3]], W[3]);
      poly(g, [[18, 18], [31, 14], [31, 19], [19, 23]], W[1]); line(g, 19, 20, 30, 16, W[0], 1);
      poly(g, [[6, 24], [20, 26], [19, 29], [5, 27]], W[2]);
      R(g, 0, 0, 3, 32, W[0]); R(g, 29, 0, 3, 32, W[0]);
    },
  });
})();
