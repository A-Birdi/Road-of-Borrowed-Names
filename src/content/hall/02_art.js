/* The Hall of a Hundred Tales: its props (expansion P15). A sacred rope between two posts that closes a floor's way on
 * until every trial on it is done (しめ縄: it blocks; gone once the floor is cleared); the paper floor lantern (行灯) that
 * each trial lights (dark, or lit); the paper screen at the back of each alcove through which a wing is entered (dark,
 * or glowing once the wing's hearth has been reached); a four-armed wooden signpost (道しるべ); and a closed oiled-paper
 * umbrella (番傘) leaning in a little wooden stand, lent and left behind (wing 2); a small stone Jizō with a red bib by
 * the path, and an incense clock (香時計), a lacquered tray of ash with a line of incense burning along its marked hours,
 * showing how far the night has gone (wing 3). Each has a flat 16-px drawing (the fallback, as every prop) and its
 * art-resolution version in the world's prop style (light from the upper left, an ink outline on what can be looked at,
 * a soft contact shadow). Regional assets under AC-1 (C-82), reviewed in the art pass (P16d; implemented provisionally,
 * internally reviewed): kept as drawn. */
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
  def('hall_umbrella', {}, (c, x, y) => {
    px(c, x + 3, y + 10, 10, 4, '#5a3e2c');
    px(c, x + 6, y - 8, 4, 18, '#9c3834'); px(c, x + 7, y - 8, 1, 18, '#c05a44'); px(c, x + 7, y - 11, 2, 3, '#3a281c');
  });
  def('hall_jizo', {}, (c, x, y) => {
    px(c, x + 4, y + 10, 8, 4, '#5e5a52'); px(c, x + 5, y - 2, 6, 12, '#888c88'); px(c, x + 5, y - 6, 6, 5, '#949890');
    px(c, x + 5, y + 2, 6, 3, '#c8382c');
  });
  def('hall_incense', {}, (c, x, y, p, t, o) => {
    const h = (o && o.h) || 0;
    px(c, x + 1, y + 4, 14, 8, '#3e1418'); px(c, x + 2, y + 5, 12, 6, '#b3a78a');
    for (let i = 0; i < 4; i++) px(c, x + 3 + i * 3, y + 7, 2, 1, i < h ? '#857a66' : '#5a3e2c');
    px(c, x + 3 + Math.min(h, 3) * 3, y + 6, 1, 1, '#ffbf5c');
  });

  // the first wing's companion map (RBN-QA-166 A): a stone table with an old map laid on it, its roads drawn faintly;
  // once the map has been read (the floor's trial, o.trial), a small mark at the spring where the floor's pattern
  // puts it (hall.<wing>.pat: 0 the top right, 1 the bottom left), never before
  const mapMark = (o) => {
    const s = RB.game && RB.game.s;
    if (!s || !o || !o.wing || !o.trial || !RB.state.test(s, 'hall.' + o.wing + '.' + o.trial)) return 0;
    return RB.state.test(s, 'hall.' + o.wing + '.pat=1') ? 2 : 1;
  };
  def('hall_maptable', { w: 2 }, (c, x, y, p, t, o) => {
    px(c, x + 1, y + 2, 30, 8, '#8c8a84'); px(c, x + 1, y + 2, 30, 1, '#b4b2aa');
    px(c, x + 3, y + 10, 5, 5, '#6c6a64'); px(c, x + 24, y + 10, 5, 5, '#6c6a64');
    px(c, x + 6, y + 3, 20, 6, '#e6d8b4'); px(c, x + 15, y + 3, 1, 6, '#a48a62'); px(c, x + 6, y + 5, 20, 1, '#a48a62');
    const m = mapMark(o);
    if (m) px(c, x + (m === 1 ? 23 : 7), y + (m === 1 ? 4 : 7), 2, 1, '#a8322a');
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
  // A closed oiled-paper umbrella (番傘): the folded red paper in long ribs down a bamboo shaft, a black-bound tip, the
  // handle standing in a low wooden stand, as if someone had left it there meaning to come back for it.
  art('hall_umbrella', {
    box: [-4, -44, 40, 80],
    ink: true,
    shadow: () => [16, 30, 9, 3, 0.3],
    draw(g, M) {
      const W = WOOD(M), LQ = K.FIX.lacquer;
      R(g, 6, 22, 20, 8, W[1]); R(g, 6, 22, 20, 1, W[3]); R(g, 8, 24, 16, 2, W[2]);
      R(g, 15, 14, 2, 10, W[2]);
      // the folded canopy: a long narrow spindle of red paper, darker in its folds
      for (let i = 0; i < 36; i++) {
        const y = -32 + i, half = i < 6 ? 1 + (i >> 1) : i > 28 ? Math.max(1, 5 - ((i - 28) >> 1)) : 5;
        R(g, 16 - half, y, half * 2, 1, LQ[2]); R(g, 16 - half, y, 1, 1, LQ[1]); R(g, 15, y, 1, 1, LQ[1]); R(g, 17, y, 1, 1, LQ[3]);
      }
      R(g, 13, -20, 6, 2, '#2a2420'); R(g, 13, -6, 6, 1, LQ[1]);
      R(g, 15, -38, 2, 6, '#2a2420');
    },
  });
  // A wayside Jizō (地蔵): a small round-headed stone figure on a plinth, a red cloth bib, moss at its feet, the kind
  // that stands at village edges looking after travellers and children.
  art('hall_jizo', {
    box: [-4, -32, 40, 68],
    ink: true,
    shadow: () => [16, 30, 9, 3, 0.3],
    draw(g, M) {
      const ST = M.stone || ['#6a6e78', '#82868e', '#52565e'];
      R(g, 7, 22, 18, 8, ST[2]); R(g, 7, 22, 18, 1, ST[1]);
      R(g, 10, 0, 12, 22, ST[0]); R(g, 10, 0, 3, 22, ST[1]); R(g, 20, 0, 2, 22, ST[2]);
      ell(g, 16, -6, 7, 7, ST[0]); ell(g, 14, -8, 3, 3, ST[1]);
      R(g, 13, -6, 2, 1, '#2a2420'); R(g, 17, -6, 2, 1, '#2a2420');
      R(g, 9, 4, 14, 7, '#c8382c'); R(g, 9, 4, 14, 2, '#e05a44'); R(g, 15, 11, 2, 2, '#a02a22');
      R(g, 8, 28, 4, 2, '#3e5a3a'); R(g, 21, 28, 3, 2, '#3e5a3a');
    },
  });
  // The incense clock (香時計): a black lacquered tray of pale ash, a line of incense laid along it with four brass
  // pins for the hours; the burned part grey, the glowing tip at the hour the night has reached (o.h, 0 to 3).
  art('hall_incense', {
    box: [-4, -12, 40, 48],
    v: (o) => Math.max(0, Math.min(3, (o && o.h) || 0)),
    f: (t, o) => (o && (o.still || still()) ? 0 : Math.floor(t / 420) % 2),
    ink: true,
    shadow: () => [16, 28, 13, 3, 0.3],
    draw(g, M, v, f) {
      const LQ = K.FIX.lacquer, BR = K.FIX.brass;
      R(g, 2, 8, 28, 18, LQ[1]); R(g, 2, 8, 28, 2, LQ[3]); R(g, 2, 24, 28, 2, LQ[0]);
      R(g, 4, 11, 24, 12, PP[1]); R(g, 4, 11, 24, 2, PP[0]);
      for (let i = 0; i < 4; i++) { R(g, 6 + i * 6, 15, 4, 2, i < v ? PP[0] : '#5a3e2c'); R(g, 6 + i * 6, 13, 1, 2, BR[3]); }
      const tx = 6 + v * 6;
      R(g, tx, 14, 2, 2, f ? GL[3] : GL[2]); R(g, tx, 10, 1, 4, 'rgba(220,220,230,0.35)');
    },
  });
  // The first wing's companion map (RBN-QA-166 A): the stone table the scene names ("On the stone table, an old map"),
  // a grey slab on two squared stone feet, with a sheet of old paper laid on it, its corners darkened and lifting a
  // little, and the floor's roads drawn on it faintly in brown (the middle road, its three crossings, the two side
  // roads); nothing marks the spring until the map has been read, then a small red mark where the floor's pattern
  // puts it. Same footprint, block and scene as the plain table it replaces; an ink outline, as for anything to look at.
  art('hall_maptable', {
    box: [-2, -4, 68, 40],
    v: (o) => mapMark(o),
    ink: true,
    shadow: () => [32, 29, 30, 3.5, 0.3],
    draw(g, M, v) {
      const S = M.stone, PA = PP, ROAD = '#9a7c54', ROADL = '#b89c70';
      // the feet and the slab
      for (const fx of [6, 48]) { R(g, fx, 18, 10, 12, S[1]); R(g, fx, 18, 2, 12, S[3]); R(g, fx + 9, 18, 1, 12, S[0]); }
      R(g, 0, 4, 64, 14, S[2]); R(g, 0, 4, 64, 1, S[4]); R(g, 0, 17, 64, 2, S[1]); R(g, 0, 18, 64, 1, S[0]);
      R(g, 4, 9, 6, 1, S[1]); R(g, 52, 12, 7, 1, S[1]);
      // the paper
      R(g, 9, 5, 46, 12, PA[3]); R(g, 9, 5, 46, 1, PA[4]); R(g, 9, 16, 46, 1, PA[1]);
      R(g, 9, 5, 2, 2, PA[2]); R(g, 53, 5, 2, 2, PA[2]); R(g, 9, 15, 2, 2, PA[2]); R(g, 53, 15, 2, 2, PA[1]);
      // its roads, faint: the middle road, three crossings, two side roads
      R(g, 31, 6, 2, 10, ROAD);
      for (const ry of [8, 11, 14]) R(g, 12, ry, 40, 1, ROADL);
      R(g, 17, 8, 1, 7, ROADL); R(g, 47, 8, 1, 7, ROADL);
      // read: the spring, marked where the pattern puts it
      if (v === 1) { R(g, 49, 6, 3, 2, '#a8322a'); R(g, 50, 6, 1, 1, '#d4584a'); }
      if (v === 2) { R(g, 12, 14, 3, 2, '#a8322a'); R(g, 13, 14, 1, 1, '#d4584a'); }
    },
  });
})();
