/* The stamp stand (expansion P06, K1): a small wooden lectern with an ink pad, a stamp on its cord and a paper
 * notice, where a traveller presses a stamp into their book. Art at art resolution in the props' own kit
 * (src/engine/27_propart.js rules: light from the upper left, ink outline and a warm accent on something you use). */
var RB = (globalThis.RB = globalThis.RB || {});
(function () {
  'use strict';
  const P = RB.props && RB.props.P;
  if (!P || P.rb_stampstand) return;
  P.rb_stampstand = {
    id: 'rb_stampstand', w: 1, h: 1, block: true,
    draw(c, x, y) { // the 16-px fallback
      c.fillStyle = '#6a4a2c'; c.fillRect(x + 4, y + 6, 8, 9); c.fillStyle = '#8a6a44'; c.fillRect(x + 3, y + 4, 10, 3);
      c.fillStyle = '#f2ead8'; c.fillRect(x + 5, y + 8, 6, 4); c.fillStyle = '#b8322a'; c.fillRect(x + 10, y + 2, 2, 3);
    },
  };
  if (!RB.propArt || !RB.propKit) return;
  const K = RB.propKit, { R, ell, ramp } = K;
  RB.propArt.art('rb_stampstand', {
    box: [-2, -16, 36, 48], ink: true,
    draw(g, M) {
      const w = M.wood || ramp('#8a6a44', 0.45, 0.35);
      // the post and its feet
      R(g, 13, 8, 6, 22, w[1]); R(g, 13, 8, 2, 22, w[2]); R(g, 9, 28, 14, 3, w[0]);
      // the slanted top with its lip
      R(g, 4, 0, 24, 9, w[2]); R(g, 4, 0, 24, 2, w[3]); R(g, 4, 8, 24, 2, w[0]);
      // the notice pinned under it (paper, brush dashes, never letters)
      R(g, 9, 12, 14, 10, '#f2ead8'); R(g, 9, 12, 14, 1, '#fffaf0');
      for (let i = 0; i < 3; i++) R(g, 11, 14 + i * 3, 10 - (i % 2) * 3, 1, '#4a4038');
      R(g, 15, 11, 2, 2, '#b8322a');
      // the ink pad and the stamp on its cord (the warm focal accent)
      R(g, 7, -3, 8, 4, '#3a2a2a'); R(g, 8, -3, 6, 2, '#a83a32');
      R(g, 19, -7, 4, 6, '#5a3a24'); R(g, 19, -7, 4, 1, '#7a5a3c'); R(g, 18, -2, 6, 2, '#b8322a');
      ell(g, 25, 2, 2, 1.2, '#c8a868');
    },
    shadow: () => [16, 30, 12, 3, 0.3],
  });
})();
