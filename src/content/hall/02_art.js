/* The Hall of a Hundred Tales: its props (expansion P15). A sacred rope between two posts that closes a floor's way on
 * until every trial on it is done (しめ縄: it blocks; gone once the floor is cleared); the paper floor lantern (行灯)
 * that each trial lights (dark, or lit); the paper screen at the back of each alcove through which a wing is entered
 * (dark, or glowing once the wing's hearth has been reached); and a four-armed wooden signpost (道しるべ). Each has a
 * flat 16-px drawing (the fallback, as every prop) and its art-resolution version in the world's prop style (light from
 * the upper left, an ink outline on what can be looked at, a soft contact shadow). Interim assets under AC-1 (C-82):
 * finished in the art pass (P16). */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const P = RB.props.P;
  const px = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  const def = (id, o, draw) => (P[id] = Object.assign({ id, w: 1, h: 1, block: true }, o, { draw }));
  const still = () => RB.game && RB.game.reducedMotion && RB.game.reducedMotion();

  // ---- flat fallbacks (16 px a tile) -------------------------------------------------------------------------------
  def('hall_gate', { w: 2 }, (c, x, y) => {
    px(c, x + 2, y - 6, 3, 20, '#5a3e2c'); px(c, x + 27, y - 6, 3, 20, '#5a3e2c');
    px(c, x + 4, y - 2, 24, 3, '#c8b07a'); for (let i = 0; i < 4; i++) px(c, x + 7 + i * 6, y + 1, 2, 6, '#f0e8d0');
  });
  def('hall_andon', {}, (c, x, y, p, t, o) => {
    const lit = o && o.lit;
    px(c, x + 4, y - 2, 8, 14, '#4a3424'); px(c, x + 5, y - 1, 6, 12, lit ? '#f4d890' : '#8a8274');
    px(c, x + 3, y + 12, 10, 3, '#3a281c');
  });
  def('hall_screen', { w: 2 }, (c, x, y, p, t, o) => {
    const on = o && o.lit;
    px(c, x + 1, y - 14, 30, 28, '#4a3424'); px(c, x + 3, y - 12, 12, 24, on ? '#f0dca0' : '#b8ae98'); px(c, x + 17, y - 12, 12, 24, on ? '#f0dca0' : '#b8ae98');
    for (let i = 0; i < 3; i++) px(c, x + 3, y - 6 + i * 6, 26, 1, '#4a3424');
  });
  def('hall_signpost', {}, (c, x, y) => {
    px(c, x + 7, y - 10, 2, 24, '#6e4c36'); px(c, x + 1, y - 8, 14, 3, '#8a6448'); px(c, x + 2, y - 2, 12, 3, '#8a6448');
  });

  // ---- art resolution (32 px a tile) -------------------------------------------------------------------------------
  if (!RB.propArt || !RB.propKit) return;
  const K = RB.propKit, art = RB.propArt.art;
  const { R, ell, line } = K;
  const PP = K.FIX.paper, GL = K.FIX.glow;
  const WOOD = (M) => M.wood || ['#5a3e2c', '#6e4c36', '#432e22', '#8a6448'];
  const ROPE = ['#7e6a3e', '#a08a52', '#c8b07a', '#e0cc94'];

  // The sacred rope (しめ縄) across the way on: two cedar posts, a thick twisted rope sagging between them, four white
  // paper streamers (紙垂) hanging from it. Nothing passes while it hangs.
  art('hall_gate', {
    box: [-4, -40, 72, 76],
    ink: true,
    shadow: () => [32, 30, 30, 3, 0.25],
    draw(g, M) {
      const W = WOOD(M);
      for (const px0 of [4, 54]) { R(g, px0, -30, 6, 60, W[1]); R(g, px0, -30, 2, 60, W[3]); R(g, px0 + 5, -30, 1, 60, W[2]); R(g, px0 - 1, -32, 8, 3, W[2]); }
      // the rope: a sagging twist from post to post
      for (let i = 0; i <= 44; i++) {
        const x = 10 + i, y = -18 + Math.sin((i / 44) * Math.PI) * 6;
        R(g, x, y, 1, 5, ROPE[(i >> 1) % 2 ? 1 : 0]); R(g, x, y, 1, 2, ROPE[2]);
      }
      // the paper streamers (zigzag)
      for (const sx of [17, 27, 37, 47]) {
        const sy = -12 + Math.sin(((sx - 10) / 44) * Math.PI) * 6;
        R(g, sx, sy, 4, 4, PP[3]); R(g, sx + 2, sy + 4, 4, 4, PP[3]); R(g, sx, sy + 8, 4, 4, PP[2]); R(g, sx + 2, sy + 12, 4, 3, PP[2]);
      }
    },
  });
  // The paper floor lantern (行灯): a square wooden frame on four short legs, paper sides; dark, the paper is grey and
  // cold; lit, it glows warm from inside and a little light falls on the floor (the lit instance's `light`).
  art('hall_andon', {
    box: [-6, -36, 44, 76],
    v: (o) => (o.lit ? 1 : 0),
    f: (t, o) => (o.lit && !(o.still || still()) ? Math.floor(t / 360) % 3 : 0),
    ink: true,
    shadow: () => [16, 30, 10, 3, 0.3],
    draw(g, M, v, f) {
      const W = WOOD(M);
      R(g, 7, 24, 2, 6, W[2]); R(g, 23, 24, 2, 6, W[2]);
      R(g, 6, -14, 20, 38, W[2]);
      if (v) {
        const fl = [GL[3], GL[4], GL[3]][f];
        R(g, 8, -12, 16, 34, GL[1]); R(g, 9, -10, 14, 30, GL[2]); R(g, 12, -2, 8, 12, fl);
      } else { R(g, 8, -12, 16, 34, PP[1]); R(g, 8, -12, 16, 2, PP[2]); R(g, 9, 0, 14, 1, PP[0]); }
      R(g, 6, 4, 20, 2, W[1]); R(g, 6, -16, 20, 3, W[1]); R(g, 6, -16, 20, 1, W[3]);
    },
  });
  // The paper screen at the back of an alcove: a dark frame, paper panels in a lattice; once the wing's hearth has
  // been reached it glows from beyond, as if a lamp stood on the other side.
  art('hall_screen', {
    box: [-4, -48, 72, 84],
    v: (o) => (o.lit ? 1 : 0),
    ink: true,
    draw(g, M, v) {
      const W = WOOD(M);
      R(g, 2, -40, 60, 70, W[2]); R(g, 2, -40, 60, 2, W[3]);
      const pap = v ? [GL[1], GL[2]] : [PP[1], PP[2]];
      for (const x0 of [6, 34]) {
        R(g, x0, -36, 24, 62, pap[0]); R(g, x0 + 2, -34, 20, 58, pap[1]);
        for (let i = 1; i < 4; i++) R(g, x0, -36 + i * 15, 24, 1, W[2]);
        R(g, x0 + 11, -36, 1, 62, W[2]);
      }
      R(g, 31, -40, 2, 70, W[1]);
    },
  });
  // A wooden signpost (道しるべ): a post with four arms pointing four ways, each arm with a word brushed on it (too small
  // to read on the map: you read it by looking).
  art('hall_signpost', {
    box: [-12, -48, 56, 84],
    ink: true,
    shadow: () => [16, 30, 8, 3, 0.3],
    draw(g, M) {
      const W = WOOD(M);
      R(g, 14, -36, 5, 66, W[1]); R(g, 14, -36, 2, 66, W[3]);
      R(g, -4, -32, 22, 6, W[1]); R(g, -4, -32, 22, 1, W[3]); line(g, -2, -29, 14, -29, '#2a2420', 1);
      R(g, 16, -22, 22, 6, W[1]); R(g, 16, -22, 22, 1, W[3]); line(g, 20, -19, 34, -19, '#2a2420', 1);
      R(g, -2, -12, 20, 6, W[0]); R(g, -2, -12, 20, 1, W[3]); line(g, 0, -9, 14, -9, '#2a2420', 1);
      R(g, 16, -2, 20, 6, W[0]); R(g, 16, -2, 20, 1, W[3]); line(g, 19, 1, 32, 1, '#2a2420', 1);
      ell(g, 16, 30, 6, 2, W[2]);
    },
  });
})();
