/* Manybridge, Chapter 4's props (expansion P09): the printing press, a theatre banner (のぼり), a type case, the
 * trap lift under the stage (せり), the counterweights, and a festival lantern string. Each has a flat 16-px drawing
 * (the fallback, as every prop) and its art-resolution version (draw2) in the world's prop style (light from the
 * upper left, hue-shifted ramps, an ink outline on what can be looked at, a soft contact shadow). Interim regional
 * assets under AC-1 (C-82): finished in the art pass (P16). */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const P = RB.props.P;
  const px = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  const def = (id, o, draw) => (P[id] = Object.assign({ id, w: 1, h: 1, block: true }, o, { draw }));
  const still = () => RB.game && RB.game.reducedMotion && RB.game.reducedMotion();

  // ---- flat fallbacks (16 px a tile) -------------------------------------------------------------------------------
  def('mp_press', { w: 2, h: 2 }, (c, x, y, p) => {
    px(c, x + 2, y + 2, 28, 28, p.wood[1]); px(c, x + 4, y + 4, 24, 10, '#2a2420');
    px(c, x + 6, y - 8, 4, 16, p.wood[2]); px(c, x + 22, y - 8, 4, 16, p.wood[2]); px(c, x + 4, y - 10, 24, 4, p.wood[3]);
    px(c, x + 8, y + 16, 16, 10, '#efe6cc');
  });
  def('mp_nobori', {}, (c, x, y, p, t, o) => {
    px(c, x + 3, y - 24, 2, 38, p.wood[2]);
    px(c, x + 5, y - 22, 8, 26, o && o.col ? o.col : '#a8462e'); px(c, x + 5, y - 22, 8, 2, '#2a2024');
  });
  def('mp_typecase', {}, (c, x, y, p) => {
    px(c, x + 1, y - 8, 14, 22, p.wood[1]); for (let i = 0; i < 4; i++) px(c, x + 2, y - 6 + i * 5, 12, 3, p.wood[3]);
  });
  def('mp_lift', { w: 2, h: 2, block: false }, (c, x, y, p, t, o) => {
    px(c, x, y, 32, 32, '#1a1614'); px(c, x + 2, y + 2, 28, 28, o && o.raised ? p.wood[3] : p.wood[1]);
    for (let i = 0; i < 4; i++) px(c, x + 2, y + 4 + i * 7, 28, 1, p.wood[0]);
  });
  def('mp_weights', { h: 2 }, (c, x, y, p) => {
    px(c, x + 7, y - 16, 2, 48, '#7a7068'); px(c, x + 3, y + 8, 10, 6, '#4a4a52'); px(c, x + 3, y + 15, 10, 6, '#4a4a52');
  });
  def('mp_lanterns', { w: 3, block: false }, (c, x, y, p, t, o) => {
    px(c, x, y - 14, 48, 1, '#3a2e24');
    for (let i = 0; i < 4; i++) { const lit = !o || o.lit !== false; px(c, x + 3 + i * 12, y - 13, 6, 8, lit ? '#e8823a' : '#c8b898'); }
  });

  // a festival game booth (3×1): a counter under a striped awning, with its game's sign (o.game)
  def('mp_booth', { w: 3 }, (c, x, y, p, t, o) => {
    px(c, x, y + 1, 48, 14, p.wood[1]); px(c, x, y + 1, 48, 3, p.wood[3]);
    px(c, x + 2, y - 20, 2, 22, p.wood[2]); px(c, x + 44, y - 20, 2, 22, p.wood[2]);
    for (let i = 0; i < 6; i++) px(c, x + i * 8, y - 22, 8, 6, i % 2 ? '#efe6cc' : '#a8462e');
    const g = o && o.game;
    const sign = { yoyo: '#4a8ac0', wanage: '#c89a3a', katanuki: '#e8d8a8', kuji: '#c84a4a', taiko: '#6a3a2a' }[g] || '#888';
    px(c, x + 18, y - 12, 12, 10, sign);
  });

  // ---- art resolution (32 px a tile) -------------------------------------------------------------------------------
  if (!RB.propArt || !RB.propKit) return;
  const K = RB.propKit, art = RB.propArt.art;
  const { R, ell, poly, line, cyl, streaks, ramp } = K;
  const IR = K.FIX.iron, PP = K.FIX.paper, INK = K.FIX.ink, GL = K.FIX.glow;
  const MADDER = ramp('#8e3a36', 0.5, 0.42), INDIGO = ramp('#34406a', 0.5, 0.42);
  void cyl; void INK;

  // The printing press (2×2): a heavy wooden frame, the platen hung on a screw, the bed with an inked forme of type
  // and a sheet laid ready beside it.
  art('mp_press', {
    box: [-4, -40, 72, 112],
    ink: true,
    shadow: () => [32, 62, 28, 4, 0.28],
    draw(g, M) {
      const w5 = M.wood;
      // the uprights and the head
      R(g, 6, -30, 8, 90, w5[1]); R(g, 6, -30, 3, 90, w5[3]); R(g, 50, -30, 8, 90, w5[1]); R(g, 50, -30, 3, 90, w5[3]);
      R(g, 2, -36, 60, 9, w5[2]); R(g, 2, -36, 60, 2, w5[4]); R(g, 2, -28, 60, 1, w5[0]);
      // the screw and the bar
      R(g, 30, -27, 4, 18, IR[2]); for (let y = -26; y < -10; y += 3) R(g, 30, y, 4, 1, IR[4]);
      line(g, 14, -14, 52, -18, IR[3], 2);
      // the platen
      R(g, 16, -10, 32, 8, w5[2]); R(g, 16, -10, 32, 1, w5[4]); R(g, 16, -3, 32, 1, w5[0]);
      // the bed with the forme of type, inked
      R(g, 10, 22, 44, 18, w5[1]); R(g, 10, 22, 44, 2, w5[3]);
      R(g, 16, 25, 32, 12, '#1e1a1a'); for (let x = 18; x < 46; x += 3) R(g, x, 26, 1, 10, '#3a3434');
      // the sheet ready on the tympan
      R(g, 18, 44, 28, 14, PP[3]); R(g, 18, 44, 28, 1, PP[4]); for (let y = 47; y < 56; y += 3) R(g, 21, y, 22, 1, PP[1]);
    },
  });

  // A theatre banner (のぼり): a tall cloth on a bamboo pole, a band of colour at the top and a column of strokes
  // (never letters).
  art('mp_nobori', {
    box: [-2, -84, 36, 120],
    v: (o) => (o.col === 'indigo' ? 1 : 0),
    f: (t, o) => (o.still || still() ? 0 : Math.floor(t / 900) % 2),
    ink: true,
    shadow: () => [16, 30, 6, 2, 0.25],
    draw(g, M, v, f) {
      const C5 = v ? INDIGO : MADDER;
      R(g, 7, -78, 3, 108, M.wood[3]); R(g, 7, -78, 1, 108, M.wood[4]);
      R(g, 10, -74, 18, 2, M.wood[2]);
      const sway = f ? 1 : 0;
      R(g, 10, -72, 17 + sway, 86, C5[2]); R(g, 10, -72, 17 + sway, 2, C5[4]); R(g, 26 + sway, -72, 1, 86, C5[0]);
      R(g, 10, -70, 17, 8, PP[3]);
      for (let i = 0; i < 6; i++) R(g, 16, -56 + i * 10, 5, 6, PP[3]);
    },
  });

  // A type case: a cabinet of shallow drawers, each with a brass pull, a few sorts on top.
  art('mp_typecase', {
    box: [-2, -26, 36, 60],
    ink: true,
    shadow: () => [16, 30, 12, 3, 0.25],
    draw(g, M) {
      const w5 = M.wood;
      R(g, 3, -20, 26, 50, w5[1]); R(g, 3, -20, 26, 2, w5[3]); R(g, 28, -20, 1, 50, w5[0]);
      for (let i = 0; i < 6; i++) { R(g, 5, -16 + i * 8, 22, 6, w5[2]); R(g, 5, -16 + i * 8, 22, 1, w5[3]); R(g, 15, -14 + i * 8, 3, 2, GL[3]); }
      for (let x = 8; x < 26; x += 4) R(g, x, -23, 2, 3, IR[2]);
    },
  });

  // The trap lift (せり, 2×2): a square of floorboards in a dark frame, its ropes running to a drum; raised, the
  // boards stand proud, lit; lowered, a dark well.
  art('mp_lift', {
    box: [-2, -6, 68, 72],
    v: (o) => (o.raised ? 1 : 0),
    ink: true,
    draw(g, M, v) {
      const w5 = M.wood;
      R(g, 0, 0, 64, 64, '#141010');
      if (v) { R(g, 4, -4, 56, 60, w5[2]); for (let y = 2; y < 56; y += 9) { R(g, 4, y, 56, 1, w5[0]); R(g, 4, y + 1, 56, 1, w5[4]); } }
      else { R(g, 6, 6, 52, 52, '#0a0808'); for (let y = 12; y < 56; y += 9) R(g, 8, y, 48, 1, '#1e1814'); }
      line(g, 2, 2, 2, 62, IR[2], 2); line(g, 62, 2, 62, 62, IR[2], 2);
    },
  });

  // The counterweights: iron weights on a rope against a post, the rope running up into the dark.
  art('mp_weights', {
    box: [-2, -60, 36, 128],
    ink: true,
    shadow: () => [16, 62, 8, 3, 0.3],
    draw(g, M) {
      R(g, 14, -56, 3, 110, '#8a7e70'); R(g, 14, -56, 1, 110, '#b8ac98');
      for (const y of [20, 32, 44]) { R(g, 6, y, 20, 10, IR[1]); R(g, 6, y, 20, 2, IR[3]); R(g, 25, y, 1, 10, IR[0]); }
      R(g, 4, 58, 24, 4, M.wood[1]);
    },
  });

  // A string of festival lanterns (3 wide, overhead): paper lanterns on a rope, lit at night.
  art('mp_lanterns', {
    box: [-4, -40, 104, 44],
    v: (o) => (o.lit === false ? 0 : 1),
    f: (t, o) => (o.still || still() ? 0 : Math.floor(t / 500) % 2),
    ink: false,
    draw(g, M, v, f) {
      line(g, 0, -30, 96, -30, '#3a2e24', 1);
      for (let i = 0; i < 4; i++) {
        const x = 8 + i * 24, y = -28 + (i % 2 && f ? 1 : 0);
        R(g, x + 6, y, 1, 3, '#3a2e24');
        R(g, x, y + 3, 14, 16, v ? GL[3] : PP[2]); R(g, x, y + 3, 14, 2, v ? GL[4] : PP[3]); R(g, x + 13, y + 3, 1, 16, v ? GL[1] : PP[0]);
        R(g, x + 2, y + 2, 10, 1, '#2a2024'); R(g, x + 2, y + 19, 10, 1, '#2a2024');
      }
    },
  });
  // A festival game booth (3×1): posts, a striped awning (madder and paper), a counter, and on it the game itself in
  // miniature: a tub of water balloons, ring-toss pegs, a tray of candy sheets, a lottery box, a drum on its stand.
  art('mp_booth', {
    box: [-4, -52, 104, 86],
    v: (o) => ['yoyo', 'wanage', 'katanuki', 'kuji', 'taiko'].indexOf(o.game) + 1,
    ink: true,
    shadow: () => [48, 30, 46, 4, 0.28],
    draw(g, M, v) {
      const w5 = M.wood;
      R(g, 4, -40, 4, 70, w5[1]); R(g, 4, -40, 1, 70, w5[3]); R(g, 88, -40, 4, 70, w5[1]); R(g, 88, -40, 1, 70, w5[3]);
      for (let i = 0; i < 8; i++) { const c5 = i % 2 ? PP : MADDER; R(g, i * 12, -46, 12, 12, c5[2]); R(g, i * 12, -46, 12, 1, c5[4]); R(g, i * 12, -35, 12, 2, c5[1]); }
      R(g, 0, 2, 96, 24, w5[1]); R(g, 0, 2, 96, 4, w5[3]); R(g, 0, 2, 96, 1, w5[4]); R(g, 0, 25, 96, 2, w5[0]);
      if (v === 1) { R(g, 26, -8, 44, 10, INDIGO[2]); R(g, 26, -8, 44, 2, INDIGO[4]); for (let k = 0; k < 5; k++) { const cl = [GL[3], MADDER[3], PP[4], INDIGO[4], GL[2]][k]; ell(g, 32 + k * 8, -10, 4, 4, cl); } }
      else if (v === 2) { for (let k = 0; k < 3; k++) { R(g, 30 + k * 16, -14, 3, 16, w5[2]); ell(g, 31.5 + k * 16, -2, 6, 2, GL[2]); } }
      else if (v === 3) { R(g, 24, -4, 48, 6, PP[3]); for (let k = 0; k < 4; k++) { R(g, 28 + k * 11, -3, 8, 4, PP[4]); R(g, 30 + k * 11, -2, 4, 2, PP[1]); } }
      else if (v === 4) { R(g, 34, -20, 28, 22, MADDER[2]); R(g, 34, -20, 28, 2, MADDER[4]); ell(g, 48, -20, 6, 2, '#1a1414'); }
      else if (v === 5) { R(g, 34, -12, 4, 14, w5[2]); R(g, 58, -12, 4, 14, w5[2]); ell(g, 48, -18, 14, 12, w5[2]); ell(g, 48, -18, 11, 10, PP[3]); ell(g, 48, -18, 3, 3, MADDER[3]); }
    },
  });
})();
