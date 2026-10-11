/* The sea's props (expansion P11b): the mark off Saltglass point that a sea trial rounds, a float banded red and white
 * with a short pole and a pennant, riding the swell (still with reduced motion). A flat 16-px drawing (the fallback, as
 * every prop) and its art-resolution version in the world's prop style (light from the upper left, an ink outline, a
 * soft ring of disturbed water instead of a contact shadow). Regional assets under AC-1 (C-82), reviewed in the art
 * pass (P16d; implemented provisionally, internally reviewed): kept as drawn. */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const P = RB.props.P;
  const px = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  const still = () => RB.game && RB.game.reducedMotion && RB.game.reducedMotion();
  const RED = ['#6e1c22', '#9a2a30', '#c8404e', '#e0707a'], WHITE = ['#b8c0c4', '#dce2e4', '#f4f6f4'];

  P.sea_buoy = { id: 'sea_buoy', w: 1, h: 1, block: true, draw: (c, x, y, p, t) => {
    const b = still() ? 0 : Math.round(Math.sin((t || 0) / 520));
    px(c, x + 3, y + 12 + b, 10, 3, WHITE[0]);
    px(c, x + 4, y + 6 + b, 8, 7, RED[2]); px(c, x + 4, y + 8 + b, 8, 2, WHITE[2]);
    px(c, x + 7, y - 2 + b, 2, 8, '#3a3a40'); px(c, x + 9, y - 2 + b, 4, 3, RED[3]);
  } };

  if (!RB.propArt || !RB.propKit) return;
  const K = RB.propKit, art = RB.propArt.art;
  const { R, ell, line } = K;
  // the kit's poly takes a flat [x0, y0, x1, y1, …]; the points here are written as pairs
  const poly = (g, pts, c) => K.poly(g, Array.isArray(pts[0]) ? pts.flat() : pts, c);
  art('sea_buoy', {
    box: [-4, -30, 40, 64],
    ink: true,
    f: (t, o) => (o.still || still() ? 0 : Math.floor(t / 260) % 8),
    draw(g, M, v, f) {
      const b = [0, 1, 2, 2, 1, 0, -1, -1][f || 0];
      // the water stirred round it
      ell(g, 16, 26, 14, 4, 'rgba(230,240,240,0.35)'); ell(g, 16, 26, 10, 2, 'rgba(255,255,255,0.35)');
      // the float: red, a white band, red
      ell(g, 16, 20 + b, 11, 5, RED[1]);
      R(g, 6, 6 + b, 20, 14, RED[2]); R(g, 6, 6 + b, 6, 14, RED[3]); R(g, 22, 6 + b, 4, 14, RED[1]);
      R(g, 6, 11 + b, 20, 4, WHITE[1]); R(g, 6, 11 + b, 6, 4, WHITE[2]); R(g, 22, 11 + b, 4, 4, WHITE[0]);
      ell(g, 16, 6 + b, 10, 3, RED[3]);
      // the pole and its pennant
      R(g, 15, -22 + b, 2, 28, '#3a3a40'); R(g, 15, -22 + b, 1, 28, '#5a5a62');
      poly(g, [[17, -22 + b], [29, -18 + b + (f % 2)], [17, -14 + b]], RED[2]);
      line(g, 17, -21 + b, 26, -18 + b, RED[3], 1);
    },
  });
})();
