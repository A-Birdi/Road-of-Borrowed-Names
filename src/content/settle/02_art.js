/* Ashihara Shinden's own props (P11). The forge's hours tag (RBN-QA-176): once the noise is settled with working hours,
 * a wooden tag hangs on the forge door, as the line says ("A tag hangs on the forge door"): on the wall beside the
 * door (14,7), hung from a nail on the doorway's post so that it overlaps the frame, written in brush strokes (the
 * hours are its scene's line; nothing on it is legible). It is read from in front of it (14,8); the door itself (13,7)
 * keeps its own line. You cannot walk into a wall, so it blocks nothing new; it is drawn on that wall, after the
 * building (onWall), as Sono's noren is (RBN-QA-111). Each has a flat 16-px drawing (the fallback, as every prop) and
 * its art-resolution version; provisional under AC1_ART, for Robin. */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const P = RB.props.P;
  const px = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  const def = (id, o, draw) => (P[id] = Object.assign({ id, w: 1, h: 1, block: true }, o, { draw }));

  // ---- flat fallback (16 px a tile): the door's post is at the tile's left edge, x -2..0 -------------------------------
  def('as_forgetag', { block: false, onWall: true }, (c, x, y) => {
    px(c, x - 1, y + 1, 1, 1, '#3a2a1c');
    px(c, x - 3, y + 2, 5, 7, '#c8a878'); px(c, x - 3, y + 2, 5, 1, '#e0c898'); px(c, x - 3, y + 8, 5, 1, '#8a6a44');
    px(c, x - 1, y + 3, 1, 4, '#2a2024');
  });

  if (!RB.propArt || !RB.propKit) return;
  const K = RB.propKit, art = RB.propArt.art, { R, line } = K;
  // The tag: a plank of pale, unpainted wood (木札) a little taller than wide, hung by a cord from a nail on the doorway's
  // right-hand post (the doorway spans x 4..28 of the door's tile, so that post stands at about x -4 of this one), so it
  // hangs half over the frame; two short columns of dark brush strokes on it, written as the game's signs are. Light
  // from the upper left: the left edge and top lit, the right edge and foot in shade.
  const TAG = ['#6a4e30', '#9a7a52', '#c8a878', '#e2c89c'];
  art('as_forgetag', {
    box: [-12, -4, 32, 40],
    ink: true,
    draw(g) {
      // the nail and the cord
      R(g, -3, 1, 2, 2, '#2a221e'); R(g, -3, 1, 1, 1, '#5a5048');
      line(g, -2, 3, -5, 7, '#5a4630', 1); line(g, -2, 3, 1, 7, '#5a4630', 1);
      // the plank
      R(g, -8, 7, 12, 17, TAG[2]); R(g, -8, 7, 12, 1, TAG[3]); R(g, -8, 7, 1, 17, TAG[3]);
      R(g, 3, 8, 1, 16, TAG[1]); R(g, -8, 23, 12, 1, TAG[0]); R(g, -7, 12, 4, 1, TAG[1]); R(g, -1, 18, 3, 1, TAG[1]);
      // two short columns of brush strokes
      for (let i = 0; i < 3; i++) RB.propArt.kit.glyph(g, -1, 9 + i * 5, K.hh(14, i, 7), '#2a2024');
      for (let i = 0; i < 2; i++) RB.propArt.kit.glyph(g, -6, 9 + i * 5, K.hh(13, i, 7), '#2a2024');
    },
  });
})();
