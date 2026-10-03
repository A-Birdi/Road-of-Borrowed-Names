/* The River Warehouse's missing floorboard. Nao, at the window, warns you:
 * "If you came in the front, watch your step. The third floorboard is gone."
 * (rw.nao_first; comparison item C07 quotes it). The room now shows it: on
 * the third board row in from the door (5,5), right on the way in, a board
 * missing — the dark under the floor, a joist across it, the broken ends of
 * the boards either side, a bent nail. You cannot step on it (it blocks);
 * Nao is reached round it, from either side or from behind. Art only: no
 * line of text changes. */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const P = RB.props && RB.props.P;
  if (!P) return;
  const px = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  P.rw_floorgap = { id: 'rw_floorgap', w: 1, h: 1, block: true, draw(c, x, y) { px(c, x + 2, y + 4, 12, 4, '#140e0c'); px(c, x + 2, y + 4, 12, 1, '#4a3424'); } };

  if (!RB.propArt || !RB.propKit) return;
  const K = RB.propKit, { R, line, ramp, mix } = K;
  RB.propArt.art('rw_floorgap', {
    box: [0, 0, 32, 32],
    outline: false,
    draw(g, M, v, f, info, pal) {
      const fl = pal.floorR || ramp(pal.floor[0]), VOID = '#120c0c', DEEP = '#1e1614', IR = K.FIX.iron;
      // the dark under the floor where the board was (the board row y 16–23, nearly the tile's width)
      R(g, 2, 16, 28, 8, VOID); R(g, 4, 24, 9, 1, VOID);
      // a joist running across underneath, just catching some light
      R(g, 13, 18, 5, 6, mix(fl[0], DEEP, 0.5)); R(g, 13, 18, 1, 6, mix(fl[1], DEEP, 0.35)); R(g, 13, 18, 5, 1, mix(fl[2], DEEP, 0.3));
      // the edge of the board beyond (the hole's far side faces you), in shadow
      R(g, 2, 16, 28, 2, mix(fl[1], DEEP, 0.45)); R(g, 2, 15, 28, 1, fl[0]);
      // what is left of the missing board at each end: splintered stubs, lit on top
      R(g, 1, 16, 3, 8, fl[2]); R(g, 1, 16, 3, 1, fl[4]); R(g, 4, 17, 2, 1, fl[2]); R(g, 4, 19, 1, 2, fl[1]); R(g, 3, 22, 2, 1, fl[1]);
      R(g, 28, 16, 3, 8, fl[1]); R(g, 28, 16, 3, 1, fl[3]); R(g, 26, 18, 2, 1, fl[1]); R(g, 27, 20, 1, 2, fl[0]); R(g, 26, 23, 2, 1, fl[1]);
      // the near board's edge, lit, chipped where the other one was prised out
      R(g, 2, 24, 28, 1, fl[4]); R(g, 5, 24, 7, 1, VOID); R(g, 5, 25, 6, 1, fl[1]);
      // a bent nail standing up from the left stub, a long splinter lying by the right
      R(g, 2, 13, 1, 3, IR[3]); R(g, 3, 12, 2, 1, IR[4]); R(g, 2, 16, 1, 1, IR[1]);
      line(g, 22, 28, 29, 27, fl[3], 1); R(g, 22, 29, 7, 1, fl[0]);
    },
  });
})();
