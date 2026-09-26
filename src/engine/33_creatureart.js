/* Art-resolution creature sprites (32×48) for every `custom` look: the
 * Hush-touched things of each region, animals and the Atlas figures. Each
 * drawer receives a pixel buffer, the look, the view ('down', 'up', 'side'
 * facing right), the walk frame (0-2) and a blink flag, and may return
 * { outline: false } for soft, glowing things. Registered in
 * RB.sprites.customArt; RB.sprites.getArt picks them up. */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const P = RB.pix, S = (RB.sprites.customArt = RB.sprites.customArt || {});
  const shade = P.shade, mix = P.mix, A = P.alpha;
  const R5 = (c) => [shade(c, -2), shade(c, -1), c, shade(c, 1), shade(c, 2)];
  const INK = '#1e1a2a';

  // Ellipse shaded as a lit volume: light from the upper left, a darker rim on the lower right.
  function orb(b, x0, y0, x1, y1, R, o) {
    o = o || {};
    const cx = (x0 + x1 + 1) / 2, cy = (y0 + y1 + 1) / 2, rx = (x1 - x0 + 1) / 2, ry = (y1 - y0 + 1) / 2;
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const nx = (x + 0.5 - cx) / rx, ny = (y + 0.5 - cy) / ry, d = nx * nx + ny * ny;
      if (d > 1.0001) continue;
      const l = -(nx * 0.55 + ny * 0.8);
      let v = l > 0.62 ? 4 : l > 0.12 ? 3 : l > -0.45 ? 2 : 1;
      if (d > 0.72 && nx + ny > 0.3) v = Math.min(v, 1);
      if (o.flat) v = Math.max(v, 2);
      b.px(x, y, R[v]);
    }
  }
  // Eyes: 2×2 or 2×3 dark with a glint, or a closed line when blinking.
  function eye(b, x, y, blink, h, col, glint) {
    if (blink) { b.rect(x, y + (h || 2) - 1, 2, 1, col || INK); return; }
    b.rect(x, y, 2, h || 2, col || INK);
    b.px(x, y, glint || '#ffffff');
  }
  const hover = (f) => (f === 1 ? -1 : 0);
  const soft = (c) => mix(shade(c, -3), '#1c1a2c', 0.55); // outline for pale, glowing things

  // ---- region wanderers -------------------------------------------------------------------------
  S.wisp = (b, look, d, f, blink) => {
    const c = look.col || '#9fb8e8', R = R5(c), y = 25 + hover(f);
    b.oval(4, y - 12, 27, y + 11, A(c, 0.14));
    b.oval(7, y - 9, 24, y + 8, A(c, 0.22));
    // tail flame curling under the body
    const s = f === 1 ? 1 : f === 2 ? -1 : 0;
    b.poly([10, y + 4, 22, y + 4, 18 + s, y + 12, 16 + s * 2, y + 17, 14 + s, y + 11], A(R[3], 0.75));
    b.poly([13, y + 5, 19, y + 5, 16 + s, y + 12], A(R[4], 0.8));
    orb(b, 8, y - 8, 23, y + 7, R);
    b.oval(10, y - 6, 15, y - 3, R[4]);
    b.rect(11, y - 5, 2, 1, '#ffffff');
    if (d !== 'up') {
      const ex = d === 'side' ? 3 : 0;
      eye(b, 11 + ex, y - 1, blink, 3, '#1a1a30');
      eye(b, 18 + ex, y - 1, blink, 3, '#1a1a30');
    }
    return { outline: soft(c) };
  };
  S.moth = (b, look, d, f) => {
    const c = look.col || '#c8c0e0', R = R5(c), y = 24 + hover(f);
    const up = f === 1; // wings pressed down on the beat
    const wing = (sx) => {
      const fx = (x) => (sx < 0 ? 31 - x : x);
      // forewing
      const fy = up ? 4 : 0;
      b.poly([fx(16), y - 3, fx(29), y - 10 + fy, fx(31), y - 4 + fy, fx(27), y + 2, fx(17), y + 2], R[2]);
      b.poly([fx(17), y - 2, fx(28), y - 8 + fy, fx(29), y - 6 + fy, fx(18), y], R[3]);
      b.poly([fx(16), y + 1, fx(26), y + 2, fx(25), y + 9 - (up ? 1 : 0), fx(19), y + 8], R[1]); // hindwing
      b.oval(Math.min(fx(22), fx(25)), y - 5 + (up ? 2 : 0), Math.max(fx(22), fx(25)), y - 2 + (up ? 2 : 0), R[4]); // eye spot
      b.px(sx < 0 ? 31 - 23 : 23, y - 4 + (up ? 2 : 0), shade(c, -3));
      b.rect(Math.min(fx(20), fx(23)), y + 4, 3, 2, R[0]);
    };
    wing(1); wing(-1);
    b.rect(15, y - 6, 2, 15, '#4a4060');
    b.rect(15, y - 6, 1, 15, '#6a6084');
    b.rect(14, y - 4, 4, 5, '#5a5078');
    for (let i = 0; i < 3; i++) b.rect(15, y + 2 + i * 2, 2, 1, '#3a3050');
    b.line(14, y - 7, 12, y - 11, '#4a4060'); b.line(17, y - 7, 19, y - 11, '#4a4060');
    b.px(11, y - 12, R[3]); b.px(20, y - 12, R[3]);
    if (d !== 'up') { b.px(14, y - 5, '#f0e8ff'); b.px(17, y - 5, '#f0e8ff'); }
  };
  S.blot = (b, look, d, f, blink) => {
    const c = look.col || '#2a2440', R = [shade(c, -1), c, shade(c, 1), shade(c, 2), shade(c, 3)];
    const w = f === 1 ? 1 : 0;
    // puddle, then the swelling head; a glossy highlight and drips
    b.oval(2 - w, 34, 29 + w, 45, R[1]);
    b.oval(3 - w, 35, 28 + w, 44, R[1]);
    b.rect(5, 41, 22, 2, R[0]);
    orb(b, 8, 18 + w, 23, 38, R);
    b.oval(10, 21 + w, 14, 25 + w, R[3]);
    b.rect(11, 22 + w, 2, 1, R[4]);
    b.rect(4, 38, 2, 2, R[2]); b.rect(25, 37, 3, 2, R[2]);
    b.oval(0, 42, 3, 44, R[1]); b.oval(27, 41, 31, 44, R[1]);
    if (d !== 'up') {
      const ex = d === 'side' ? 3 : 0;
      if (blink) { b.rect(11 + ex, 28 + w, 3, 1, '#f0f0ff'); b.rect(18 + ex, 28 + w, 3, 1, '#f0f0ff'); }
      else { b.rect(11 + ex, 26 + w, 3, 3, '#f0f0ff'); b.rect(18 + ex, 26 + w, 3, 3, '#f0f0ff'); b.rect(12 + ex, 27 + w, 2, 2, INK); b.rect(19 + ex, 27 + w, 2, 2, INK); }
    }
    return { outline: shade(c, -2) };
  };
  S.crane = (b, look, d, f) => {
    const c = look.col || '#f4efe0', R = R5(c), y = 26 + hover(f);
    const fl = f === 1 ? -5 : f === 2 ? 2 : 0;
    // folded paper: each facet a flat tone, lit facets towards the upper left
    b.poly([1, y - 4 + fl, 15, y + 1, 15, y + 6], R[3]);
    b.poly([1, y - 4 + fl, 15, y + 6, 10, y + 5], R[2]);
    b.poly([30, y - 4 + fl, 17, y + 1, 17, y + 6], R[2]);
    b.poly([30, y - 4 + fl, 17, y + 6, 22, y + 5], R[1]);
    b.poly([11, y + 1, 16, y - 1, 21, y + 1, 16, y + 11], R[3]);
    b.poly([16, y - 1, 21, y + 1, 16, y + 11], R[2]);
    if (d === 'side') {
      b.poly([20, y + 1, 26, y - 10, 27, y - 10, 22, y + 3], R[2]); b.poly([26, y - 10, 30, y - 8, 27, y - 9], R[3]);
      b.rect(26, y - 12, 2, 2, '#c85a4a'); b.poly([10, y + 2, 4, y - 2, 12, y + 5], R[1]);
    } else {
      b.rect(15, y - 9, 2, 9, R[3]); b.rect(16, y - 9, 1, 9, R[2]);
      b.rect(14, y - 11, 4, 3, R[3]); b.rect(15, y - 12, 2, 1, '#c85a4a');
      if (d === 'down') { b.px(15, y - 10, INK); b.px(16, y - 8, '#d8a040'); }
      b.line(16, y + 6, 16, y + 11, R[1]);
    }
    b.line(1, y - 4 + fl, 15, y + 6, R[1]);
    b.line(30, y - 4 + fl, 17, y + 6, R[0]);
  };
  S.golem = (b, look, d, f, blink) => {
    const c = look.col || '#8fb8b0', R = R5(c);
    const lift = [f === 2 ? 2 : 0, f === 1 ? 2 : 0], bob = f ? 1 : 0;
    // feet
    for (let s = 0; s < 2; s++) { const x = s ? 18 : 7, L = lift[s]; b.rect(x, 41 - L, 7, 6, R[1]); b.rect(x, 41 - L, 7, 1, R[2]); b.rect(x, 46 - L, 7, 1, R[0]); }
    // body blocks with seams and a carved rune
    b.rect(5, 18 + bob, 22, 23, R[2]);
    b.rect(5, 18 + bob, 22, 2, R[3]); b.rect(5, 18 + bob, 2, 23, R[3]);
    b.rect(24, 20 + bob, 3, 21, R[1]); b.rect(5, 39 + bob, 22, 2, R[1]);
    b.rect(5, 29 + bob, 22, 1, R[1]); b.rect(15, 20 + bob, 1, 9, R[1]); b.rect(11, 30 + bob, 1, 9, R[1]); b.rect(20, 30 + bob, 1, 9, R[1]);
    b.rect(12, 32 + bob, 6, 1, R[4]); b.rect(14, 31 + bob, 2, 5, R[4]); b.px(13, 35 + bob, R[4]);
    b.px(8, 24 + bob, R[1]); b.px(9, 25 + bob, R[1]); b.px(22, 35 + bob, R[1]);
    // arms
    b.rect(1, 20 + bob, 4, 14, R[2]); b.rect(1, 20 + bob, 1, 14, R[3]); b.rect(1, 33 + bob, 4, 2, R[1]);
    b.rect(27, 20 + bob, 4, 14, R[1]); b.rect(27, 33 + bob, 4, 2, R[0]);
    // head
    b.rect(9, 9 + bob, 14, 10, R[2]); b.rect(9, 9 + bob, 14, 2, R[3]); b.rect(9, 9 + bob, 2, 10, R[3]); b.rect(21, 11 + bob, 2, 8, R[1]);
    b.rect(8, 11 + bob, 1, 5, R[1]); b.rect(23, 11 + bob, 1, 5, R[0]);
    if (d !== 'up') {
      const ex = d === 'side' ? 3 : 0;
      if (blink) { b.rect(12 + ex, 14 + bob, 3, 1, '#1a2a2a'); b.rect(18 + ex, 14 + bob, 3, 1, '#1a2a2a'); }
      else { b.rect(12 + ex, 13 + bob, 3, 2, '#1a2a2a'); b.rect(18 + ex, 13 + bob, 3, 2, '#1a2a2a'); b.px(12 + ex, 13 + bob, R[4]); b.px(18 + ex, 13 + bob, R[4]); }
    }
  };
  S.lanternghost = (b, look, d, f) => {
    const glow = f === 1 ? '#b8d4ff' : '#8aa8e8', G = R5(glow), y = 14 + hover(f);
    // ghostly tail
    b.poly([8, y + 20, 24, y + 20, 19, y + 28, 16 + (f === 1 ? 2 : 0), y + 33, 13, y + 27], A(G[2], 0.5));
    b.poly([11, y + 20, 21, y + 20, 16 + (f === 1 ? 1 : 0), y + 29], A(G[3], 0.55));
    // paper lantern: dark caps, glowing ribbed body
    b.rect(13, y - 3, 6, 2, '#3a2e2a'); b.px(15, y - 5, '#3a2e2a'); b.px(16, y - 4, '#3a2e2a');
    b.rect(10, y - 1, 12, 2, '#3a2e2a');
    orb(b, 8, y + 1, 23, y + 19, G);
    for (let i = 0; i < 4; i++) b.rect(8 + (i ? 0 : 1), y + 4 + i * 4, 16 - (i ? 0 : 2), 1, G[1]);
    b.rect(10, y + 20, 12, 2, '#3a2e2a');
    if (d !== 'up') { b.rect(12, y + 8, 2, 3, '#2a3a6a'); b.rect(18, y + 8, 2, 3, '#2a3a6a'); b.rect(14, y + 13, 4, 1, '#2a3a6a'); }
  };
  S.cat = (b, look, d, f, blink) => {
    const c = look.col || '#e0a060', R = R5(c), st = f === 1 ? 1 : f === 2 ? -1 : 0;
    if (d === 'side') {
      // walking profile, head right, tail up behind
      b.rect(6, 33, 17, 8, R[2]); b.rect(6, 33, 17, 2, R[3]); b.rect(6, 39, 17, 2, R[1]);
      for (const [x, s] of [[7, st], [11, -st], [18, -st], [21, st]]) { b.rect(x + s, 40, 2, 6, s > 0 ? R[1] : R[2]); b.rect(x + s, 46, 3, 1, R[0]); }
      b.line(6, 34, 3, 28, R[2], 2); b.line(3, 28, 4, 22 - (f === 1 ? 1 : 0), R[2], 2); b.px(4, 21 - (f === 1 ? 1 : 0), R[3]);
      orb(b, 19, 24, 29, 34, R);
      b.poly([20, 26, 21, 20, 24, 25], R[2]); b.poly([25, 25, 27, 20, 28, 26], R[1]); b.px(22, 23, '#e8a0a0'); b.px(27, 23, '#c88080');
      eye(b, 25, 28, blink, 2, '#2a2a1a', '#e8f080');
      b.px(29, 30, '#6a3a3a'); b.rect(28, 31, 2, 1, R[1]);
      for (const x of [9, 13, 17]) b.rect(x, 34, 2, 1, R[1]);
      return;
    }
    // front/back: sitting upright, ears up, tail curled round the paws
    b.oval(7, 30, 24, 45, R[2]);
    b.oval(7, 30, 12, 44, R[3]);
    b.rect(20, 32, 4, 12, R[1]);
    b.rect(10, 43, 4, 3, R[3]); b.rect(18, 43, 4, 3, R[2]); b.rect(10, 46, 12, 1, R[0]);
    b.line(24, 44, 28, 40, R[2], 2); b.line(28, 40, 27, 34 + st, R[2], 2); b.px(27, 33 + st, R[3]);
    orb(b, 8, 18, 23, 32, R);
    b.poly([8, 22, 9, 13, 14, 19], R[2]); b.poly([23, 22, 22, 13, 17, 19], R[1]);
    if (d === 'down') {
      b.poly([10, 20, 10, 16, 13, 19], '#e8a0a0'); b.poly([21, 20, 21, 16, 18, 19], '#c88888');
      eye(b, 11, 23, blink, 3, '#2a2a1a', '#e8f080'); eye(b, 18, 23, blink, 3, '#2a2a1a', '#e8f080');
      b.rect(15, 27, 2, 1, '#8a4a4a'); b.px(14, 28, R[1]); b.px(17, 28, R[1]);
      b.rect(12, 33, 8, 7, R[3]); b.rect(13, 34, 6, 5, shade(c, 3));
      b.line(7, 27, 4, 26, R[4]); b.line(24, 27, 27, 26, R[4]);
    } else {
      for (const x of [12, 15, 18]) b.rect(x, 20, 2, 1, R[1]);
      b.rect(15, 33, 2, 9, R[1]);
    }
  };
  S.heron = (b, look, d, f, blink) => {
    const c = look.col || '#dfe6ea', R = R5(c), st = f === 1 ? 1 : f === 2 ? -1 : 0;
    const legs = (x1, x2) => { b.rect(x1, 33, 1, 13, '#6a6a6a'); b.rect(x2 + st, 33, 1, 13 - Math.abs(st), '#5a5a5a'); b.rect(x1 - 1, 46, 3, 1, '#4a4a4a'); b.rect(x2 - 1 + st, 46 - Math.abs(st), 3, 1, '#4a4a4a'); };
    if (d === 'side') {
      legs(15, 18);
      b.oval(9, 22, 23, 34, R[2]); b.oval(9, 22, 20, 28, R[3]);
      b.poly([9, 27, 3, 33, 5, 34, 12, 32], R[1]); // tail
      b.poly([12, 29, 22, 27, 19, 34], R[1]); b.rect(14, 31, 6, 2, '#5a6a7a'); // wing, dark flight feathers
      b.line(20, 23, 22, 14, R[2], 2); b.line(22, 14, 21, 9, R[2], 2);
      b.oval(19, 6, 25, 10, R[3]); b.rect(25, 8, 5, 1, '#d8a040'); b.rect(25, 9, 4, 1, '#b88030');
      b.line(19, 7, 14, 9, '#3a3a4a'); eye(b, 22, 7, blink, 1, '#1a1a1a', '#1a1a1a');
      return;
    }
    legs(13, 18);
    b.oval(9, 21, 22, 35, R[2]); b.oval(9, 21, 16, 30, R[3]); b.rect(20, 25, 3, 8, R[1]);
    b.rect(10, 31, 2, 4, '#5a6a7a'); b.rect(20, 31, 2, 4, '#4a5a6a');
    b.rect(15, 10, 3, 12, R[2]); b.rect(15, 10, 1, 12, R[3]);
    b.oval(13, 5, 19, 11, R[3]);
    if (d === 'down') { eye(b, 14, 7, blink, 1, '#1a1a1a', '#1a1a1a'); eye(b, 17, 7, blink, 1, '#1a1a1a', '#1a1a1a'); b.rect(16, 10, 1, 4, '#d8a040'); b.line(13, 6, 9, 8, '#3a3a4a'); }
    else b.line(16, 6, 11, 9, '#3a3a4a');
  };
  S.spirit = (b, look, d, f, blink) => {
    const c = look.col || '#e8e4ff', R = R5(c), y = 8 + hover(f), w = f === 1 ? 1 : 0;
    const body = [6, 44, 5, y + 14, 9, y + 3, 16, y, 23, y + 3, 27, y + 14, 26, 44, 22 - w, 41, 19, 44, 16 + w, 41, 13, 44, 10 + w, 41];
    b.poly(body, A(R[2], 0.8));
    b.poly([8, 40, 8, y + 14, 11, y + 4, 16, y + 2, 14, y + 10, 12, 40], A(R[3], 0.7));
    b.poly([24, 40, 25, y + 14, 22, y + 5, 21, 40], A(R[1], 0.7));
    if (d !== 'up') {
      const ex = d === 'side' ? 3 : 0;
      eye(b, 11 + ex, y + 10, blink, 3, '#2a2440', '#e8e4ff'); eye(b, 18 + ex, y + 10, blink, 3, '#2a2440', '#e8e4ff');
      b.rect(15 + ex, y + 16, 2, 1, A('#2a2440', 0.6));
    }
    return { outline: soft(c) };
  };

  // ---- Saltglass ---------------------------------------------------------------------------------
  S.sg_crab = (b, look, d, f, blink) => {
    const c = look.col || '#c86a4a', R = R5(c), s = f === 1 ? 2 : 0;
    for (const [x, y, dx] of [[4, 38, -2], [7, 40, -2], [24, 38, 2], [21, 40, 2]]) { b.line(x, y, x + dx, y + 5, R[1]); b.px(x + dx, y + 6, R[0]); }
    b.line(8, 34, 4, 30 - s, R[2], 2); b.line(23, 34, 27, 30 + s - 2, R[2], 2);
    orb(b, 0, 23 - s, 7, 29 - s, R); b.rect(1, 22 - s, 3, 3, R[3]); b.px(4, 23 - s, INK);
    orb(b, 24, 21 + s, 31, 27 + s, R); b.rect(28, 20 + s, 3, 3, R[3]); b.px(27, 21 + s, INK);
    orb(b, 4, 29, 27, 42, R);
    b.rect(10, 34, 12, 5, '#f0e8d8'); b.rect(10, 38, 12, 1, '#d8ccb8'); b.rect(13, 36, 6, 1, '#3a3036');
    b.rect(12, 25, 1, 5, R[1]); b.rect(19, 25, 1, 5, R[1]);
    eye(b, 11, 23, blink, 3, INK); eye(b, 18, 23, blink, 3, INK);
    for (const x of [8, 14, 20]) b.rect(x, 31, 3, 1, R[3]);
  };
  S.sg_letter = (b, look, d, f, blink) => {
    const y = 20 + (f === 1 ? -2 : 0);
    const P0 = ['#b8ac90', '#d8ccb0', '#f4ecd8', '#fffaf0'];
    b.rect(3, y, 26, 18, P0[2]);
    b.rect(3, y, 26, 1, P0[3]); b.rect(3, y, 1, 18, P0[3]); b.rect(28, y, 1, 18, P0[1]); b.rect(3, y + 17, 26, 1, P0[1]);
    b.poly([3, y, 16, y + 11, 29, y], P0[1]);
    b.poly([4, y, 16, y + 9, 28, y], P0[2]);
    b.line(3, y + 17, 12, y + 9, P0[1]); b.line(28, y + 17, 20, y + 9, P0[0]);
    orb(b, 13, y + 9, 19, y + 14, R5('#b84a3a'));
    b.px(15, y + 11, '#e8a090');
    if (d !== 'up') { eye(b, 8, y + 4, blink, 3, '#2a2440'); eye(b, 22, y + 4, blink, 3, '#2a2440'); }
    for (let i = 0; i < 3; i++) b.rect(6, y + 12 + i * 2, 5, 1, A('#8a7a6a', 0.5));
  };
  S.sg_clerk = (b, look, d, f, blink) => {
    const C = R5('#4a6a8a'), H = R5('#3a5470'), st = f === 1 ? 1 : f === 2 ? -1 : 0;
    b.rect(7 + st, 44, 5, 3, '#2a3a4a'); b.rect(20 - st, 44, 5, 3, '#2a3a4a');
    for (let y = 18; y <= 44; y++) { const e = y > 36 ? 1 : 0; b.rect(6 - e, y, 20 + 2 * e, 1, C[2]); b.px(6 - e, y, C[3]); b.rect(24 + e, y, 2, 1, C[1]); }
    b.rect(15, 20, 2, 24, C[1]); b.rect(5, 44, 22, 1, C[0]);
    b.rect(6, 30, 20, 2, '#c85a4a'); b.rect(6, 30, 20, 1, '#e87a6a');
    // hood and pale face with glowing eyes
    b.oval(6, 3 + (f === 1 ? 1 : 0), 25, 22, H[2]); b.rect(6, 12, 3, 9, H[3]);
    b.oval(9, 7, 22, 20, '#b8c8d0'); b.rect(9, 17, 14, 3, '#a0b0bc');
    if (d !== 'up') { if (blink) { b.rect(11, 13, 4, 1, '#7ab0d0'); b.rect(17, 13, 4, 1, '#7ab0d0'); } else { b.rect(11, 12, 4, 2, '#7ab0d0'); b.rect(17, 12, 4, 2, '#7ab0d0'); b.rect(12, 12, 2, 1, '#e8f8ff'); b.rect(18, 12, 2, 1, '#e8f8ff'); } }
    else b.oval(9, 7, 22, 20, H[1]);
    // ledger under one arm, a slip in the other hand
    b.rect(23, 24, 6, 10, '#6a4a3a'); b.rect(23, 24, 6, 1, '#8a6a4a'); b.rect(22, 32, 8, 3, '#c85a4a'); b.rect(28, 25, 1, 8, '#e8e0cc');
    b.rect(1, 26, 5, 7, '#e8e0cc'); b.rect(1, 26, 5, 1, '#fff8e8'); b.rect(2, 28, 3, 1, '#a89a80'); b.rect(2, 30, 3, 1, '#a89a80');
  };

  // ---- Cinder Orchard / Snowbell animals --------------------------------------------------------------
  function goat(b, look, d, f, blink, director) {
    const c = look.col || (director ? '#e8e0d0' : '#eeeae0'), R = [look.col2 ? shade(look.col2, -1) : shade(c, -2), look.col2 || shade(c, -1), c, shade(c, 1), shade(c, 2)];
    const horn = ['#6a5a44', '#8a7a5a', '#b8a882'], st = f === 1 ? 1 : f === 2 ? -1 : 0;
    if (d === 'side') {
      for (const [x, s] of [[5, st], [9, -st], [18, -st], [22, st]]) { b.rect(x + s, 37, 3, 9, s < 0 ? R[1] : R[2]); b.rect(x + s, 45, 3, 2, '#3a3030'); }
      orb(b, 3, 25, 26, 39, R, { flat: true });
      b.rect(5, 25, 16, 3, R[3]); b.rect(3, 34, 23, 3, R[1]);
      for (const x of [7, 12, 17]) b.rect(x, 29, 3, 1, R[1]);
      b.rect(1, 25, 3, 3, R[2]); b.px(1, 24, R[3]); // tail
      orb(b, 21, 16, 29, 27, R);
      b.rect(27, 21, 3, 4, R[3]); b.px(29, 22, '#3a3030'); b.px(29, 24, '#8a5a5a');
      b.line(23, 16, 21, 11, horn[1], 2); b.line(21, 11, 18, 12, horn[1], 1); b.px(22, 12, horn[2]);
      b.rect(20, 18, 3, 2, R[1]); // ear
      eye(b, 25, 19, blink, 2, '#1a1414', '#d8c860');
      b.rect(27, 27, 2, 4, R[3]); b.px(27, 30, R[1]); // beard
      if (director) { b.rect(22, 28, 5, 2, '#a83a3a'); orb(b, 23, 30, 26, 33, R5('#d8c860')); }
      return;
    }
    const lift = [f === 2 ? 2 : 0, f === 1 ? 2 : 0];
    for (let s = 0; s < 2; s++) { const x = s ? 18 : 9, L = lift[s]; b.rect(x, 38 - L, 4, 8, R[1]); b.rect(x, 45 - L, 4, 2, '#3a3030'); }
    orb(b, 6, 23, 25, 41, R, { flat: true });
    b.rect(8, 23, 8, 4, R[3]);
    if (d === 'up') { b.rect(14, 24, 4, 3, R[3]); b.rect(15, 21, 2, 3, R[2]); }
    orb(b, 10, 13 - (d === 'up' ? 1 : 0), 21, 27, R);
    b.poly([9, 15, 4, 18, 9, 18], R[1]); b.poly([22, 15, 27, 18, 22, 18], R[0]); // ears
    b.line(12, 13, 10, 8, horn[1], 2); b.line(19, 13, 21, 8, horn[0], 2); b.px(10, 8, horn[2]); b.px(21, 8, horn[1]);
    if (d === 'down') {
      eye(b, 12, 18, blink, 2, '#1a1414', '#d8c860'); eye(b, 18, 18, blink, 2, '#1a1414', '#d8c860');
      b.rect(13, 23, 6, 3, R[3]); b.rect(15, 24, 2, 1, '#8a5a5a');
      b.rect(14, 27, 4, 4, R[3]); b.px(15, 30, R[1]);
      if (director) { b.rect(11, 29, 10, 2, '#a83a3a'); orb(b, 14, 31, 17, 34, R5('#d8c860')); b.px(15, 34, '#6a5a2a'); }
    }
  }
  S.co_goat = (b, look, d, f, blink) => goat(b, look, d, f, blink, true);
  S.goat = (b, look, d, f, blink) => goat(b, look, d, f, blink, false);
  S.snowfox = (b, look, d, f, blink) => {
    const c = look.col || '#f2f6fa', R = [shade(c, -3), '#b8c8d8', c, shade(c, 1), '#ffffff'], st = f === 1 ? 1 : f === 2 ? -1 : 0;
    const ear = (x0, x1, tip) => { b.poly([x0, 22, tip, 13, x1, 22], R[2]); b.poly([x0 + 2, 21, tip, 16, x1 - 2, 21], '#e8c8d0'); };
    if (d === 'side') {
      for (const [x, s] of [[7, st], [10, -st], [18, -st], [21, st]]) { b.rect(x + s, 38, 2, 8, s < 0 ? R[1] : R[2]); b.rect(x + s, 46, 3, 1, R[0]); }
      orb(b, 5, 30, 25, 40, R, { flat: true }); b.rect(7, 30, 14, 2, R[3]);
      // brush of a tail streaming back
      orb(b, 0, 23 - st, 9, 33 - st, R); b.rect(0, 24 - st, 3, 3, R[4]);
      orb(b, 19, 22, 29, 32, R);
      b.poly([27, 26, 31, 28, 27, 30], R[2]); b.px(30, 28, '#2a2a2a');
      b.poly([20, 24, 21, 16, 24, 23], R[2]); b.poly([23, 23, 25, 16, 27, 24], R[1]);
      eye(b, 24, 25, blink, 2, '#3a5a8a', '#e8f4ff');
      return;
    }
    const lift = [f === 2 ? 2 : 0, f === 1 ? 2 : 0];
    for (let s = 0; s < 2; s++) { const x = s ? 18 : 10, L = lift[s]; b.rect(x, 38 - L, 3, 8, R[1]); b.rect(x, 46 - L, 4, 1, R[0]); }
    orb(b, 7, 28, 24, 42, R, { flat: true });
    if (d === 'up') { orb(b, 13, 30 - st, 22, 44 - st, R); b.rect(15, 40 - st, 5, 3, R[4]); }
    ear(9, 15, 10); ear(17, 23, 22);
    orb(b, 8, 18, 23, 31, R);
    if (d === 'down') {
      eye(b, 11, 23, blink, 2, '#3a5a8a', '#e8f4ff'); eye(b, 19, 23, blink, 2, '#3a5a8a', '#e8f4ff');
      b.rect(14, 26, 4, 3, R[4]); b.rect(15, 27, 2, 1, '#2a2a2a');
      b.oval(11, 31, 20, 38, R[4]);
    }
  };

  // ---- Lanternfall -------------------------------------------------------------------------------
  S.lf_bell = (b, look, d, f, blink) => {
    const c = look.col || '#3c5c8a', R = R5(c), y = 10 + (f === 1 ? 2 : 0);
    // wisps trailing under the rim
    b.poly([8, y + 28, 12, y + 28, 10, y + 36], A(c, 0.45)); b.poly([19, y + 28, 23, y + 28, 22, y + 34 - (f === 1 ? 2 : 0)], A(c, 0.45));
    b.rect(13, y - 2, 6, 3, shade(c, -2)); b.rect(14, y - 3, 4, 1, shade(c, -1));
    for (let yy = y + 1; yy <= y + 24; yy++) {
      const k = (yy - y) / 24, half = Math.round(6 + 5 * k * k + (yy > y + 21 ? 2 : 0));
      b.rect(16 - half, yy, half * 2, 1, R[2]);
      b.rect(16 - half, yy, 2, 1, R[3]); b.rect(16 + half - 3, yy, 3, 1, R[1]);
    }
    b.rect(3, y + 25, 26, 2, R[1]); b.rect(3, y + 25, 26, 1, R[3]);
    b.rect(10, y + 4, 2, 14, R[4]);
    b.line(20, y + 8, 22, y + 15, R[0]); b.line(22, y + 15, 21, y + 19, R[0]); // crack
    orb(b, 14, y + 26, 18, y + 30, R5('#1a2030'));
    if (d !== 'up') { eye(b, 11, y + 12, blink, 3, '#e8ecff', '#ffffff'); eye(b, 19, y + 12, blink, 3, '#e8ecff', '#ffffff'); }
  };
  S.lf_stamp = (b, look, d, f, blink) => {
    const c = look.col || '#4c4a78', R = R5(c), st = f === 1 ? 1 : f === 2 ? -1 : 0;
    const W0 = R5('#8a6a4a');
    b.rect(8 + st, 43, 5, 4, R[1]); b.rect(19 - st, 43, 5, 4, R[1]);
    b.rect(3, 36, 26, 7, '#c85a4a'); b.rect(3, 36, 26, 1, '#e87a6a'); b.rect(3, 41, 26, 2, '#8a3030');
    b.rect(6, 18, 20, 18, R[2]); b.rect(6, 18, 20, 2, R[3]); b.rect(6, 18, 2, 18, R[3]); b.rect(23, 20, 3, 16, R[1]);
    b.rect(11, 5, 10, 13, W0[2]); b.rect(11, 5, 3, 13, W0[3]); b.rect(18, 5, 3, 13, W0[1]);
    orb(b, 9, 0, 22, 7, W0);
    if (d !== 'up') {
      const ex = d === 'side' ? 2 : 0;
      if (blink) { b.rect(10 + ex, 26, 4, 1, '#f0f0ff'); b.rect(18 + ex, 26, 4, 1, '#f0f0ff'); }
      else { b.rect(10 + ex, 24, 4, 4, '#f0f0ff'); b.rect(18 + ex, 24, 4, 4, '#f0f0ff'); b.rect(11 + ex, 25, 2, 2, INK); b.rect(19 + ex, 25, 2, 2, INK); }
      b.rect(14 + ex, 31, 4, 1, R[0]);
    }
  };
  S.lf_pipe = (b, look, d, f, blink) => {
    const c = look.col || '#8a90c8', P0 = R5('#3a3850');
    b.rect(10, 8, 12, 38, P0[2]); b.rect(10, 8, 3, 38, P0[3]); b.rect(19, 8, 3, 38, P0[1]);
    for (const y of [8, 20, 32, 44]) { b.rect(9, y, 14, 3, P0[3]); b.rect(9, y + 2, 14, 1, P0[1]); b.px(11, y + 1, P0[4]); b.px(20, y + 1, P0[4]); }
    b.rect(2, 16, 8, 4, P0[2]); b.rect(2, 16, 8, 1, P0[3]); b.rect(0, 14, 3, 8, P0[3]);
    b.rect(22, 26, 8, 4, P0[1]); b.rect(29, 24, 3, 8, P0[2]);
    // glowing droplets rising through the pipe
    const o = f === 1 ? 4 : f === 2 ? 2 : 0;
    for (let i = 0; i < 3; i++) { const y = 38 - i * 11 - o; b.rect(14, y, 4, 4, c); b.rect(14, y, 2, 2, shade(c, 2)); b.rect(13, y + 1, 1, 2, A(c, 0.5)); b.rect(18, y + 1, 1, 2, A(c, 0.5)); }
    if (d !== 'up') { eye(b, 12, 12, blink, 2, '#f0f0ff', '#ffffff'); eye(b, 18, 12, blink, 2, '#f0f0ff', '#ffffff'); }
  };

  // ---- the Still Archive -------------------------------------------------------------------------
  S.sa_wraith = (b, look, d, f) => {
    const c = look.col || '#e6e4ee', R = R5(c), w = f === 1 ? 1 : 0;
    b.poly([5, 46, 4, 10, 9, 3, 16, 1, 23, 3, 28, 10, 27, 46, 23, 42 - w, 20, 46, 16, 42 + w, 12, 46, 9, 42 - w], A(R[2], 0.85));
    b.poly([7, 42, 7, 11, 11, 5, 16, 3, 13, 12, 11, 42], A(R[3], 0.8));
    b.poly([25, 42, 25, 12, 22, 6, 22, 42], A(R[1], 0.8));
    for (const y of [24, 30, 36]) b.rect(8, y, 16, 1, A(R[1], 0.9));
    if (d !== 'up') {
      const ex = d === 'side' ? 3 : 0;
      for (let a = 0; a < 16; a++) { const t = (a / 16) * Math.PI * 2; b.px(Math.round(16 + ex + Math.cos(t) * 4), Math.round(15 + Math.sin(t) * 4), '#1a1830'); }
      b.oval(13 + ex, 12, 18 + ex, 17, A('#1a1830', 0.35));
    }
    return { outline: soft(c) };
  };
  S.sa_echo = (b, look, d, f) => {
    const c = look.col || '#a8c8d8', y = 24 - (f === 1 ? 2 : 0);
    for (const [r, a] of [[14, 0.35], [11, 0.55]]) for (let k = 0; k < 40; k++) { const t = (k / 40) * Math.PI * 2; b.px(Math.round(16 + Math.cos(t) * r), Math.round(y + Math.sin(t) * r * 0.8), A(c, a)); }
    // open book: two pages with lines of text, a dark spine
    b.poly([4, y - 5, 15, y - 3, 15, y + 7, 4, y + 5], '#f0ece0');
    b.poly([17, y - 3, 28, y - 5, 28, y + 5, 17, y + 7], '#e4ded0');
    b.rect(15, y - 3, 2, 11, '#8a7a6a');
    for (let i = 0; i < 3; i++) { b.rect(6, y - 1 + i * 2, 7, 1, '#6a6a80'); b.rect(19, y - 1 + i * 2, 7, 1, '#6a6a80'); }
    b.line(4, y + 5, 15, y + 7, '#b8b0a0'); b.line(17, y + 7, 28, y + 5, '#a8a090');
    return { outline: '#3a3a50' };
  };
  S.sa_clerk = (b, look, d, f, blink) => {
    const c = look.col || '#ece6d6', R = R5(c), st = f === 1 ? 1 : f === 2 ? -1 : 0;
    b.rect(9, 40, 5, 6 + (st > 0 ? 0 : 1), '#8a8474'); b.rect(18, 40, 5, 6 + (st < 0 ? 0 : 1), '#8a8474');
    b.rect(8, 46, 6, 1, '#5a5448'); b.rect(18, 46, 6, 1, '#5a5448');
    // a body stacked from index cards, each ruled and edged
    for (let i = 0; i < 4; i++) {
      const y = 20 + i * 5, sx = i % 2 ? 1 : 0;
      b.rect(6 + sx, y, 20, 5, R[2]); b.rect(6 + sx, y, 20, 1, R[3]); b.rect(6 + sx, y + 4, 20, 1, R[1]); b.rect(24 + sx, y, 2, 5, R[1]);
      b.rect(9 + sx, y + 2, 12, 1, '#c8c0b0');
    }
    b.rect(6, 23, 21, 2, '#c85a4a'); b.rect(6, 23, 21, 1, '#e07a6a');
    b.rect(2, 22, 4, 12, R[2]); b.rect(2, 22, 1, 12, R[3]); b.rect(26, 22, 4, 12, R[1]);
    b.rect(8, 3, 16, 16, '#f4efe2'); b.rect(8, 3, 16, 2, '#c85a4a'); b.rect(22, 5, 2, 14, R[1]); b.rect(8, 18, 16, 1, R[1]);
    b.rect(10, 7, 12, 1, '#d8d0c0');
    if (d !== 'up') {
      if (d === 'side') eye(b, 17, 10, blink, 4, '#2a2436', '#6a6480');
      else { eye(b, 11, 10, blink, 4, '#2a2436', '#6a6480'); eye(b, 19, 10, blink, 4, '#2a2436', '#6a6480'); }
    }
  };

  // ---- the Unwritten Atlas -----------------------------------------------------------------------
  S.atlas_name = (b, look, d, f, blink) => {
    const c = look.col || '#f2ead2', R = R5(c), y = 12 + (f === 1 ? -2 : 0);
    b.rect(8, y, 16, 26, R[2]); b.rect(8, y, 2, 26, R[3]); b.rect(22, y, 2, 26, R[1]); b.rect(8, y + 25, 16, 1, R[1]);
    b.poly([19, y, 24, y, 24, y + 5], R[1]); b.poly([19, y, 19, y + 5, 24, y + 5], R[3]); // dog-eared corner
    if (d !== 'up') {
      b.rect(11, y + 4, 6, 2, look.ink || '#8a7a5a'); b.px(16, y + 6, look.ink || '#8a7a5a');
      eye(b, 11, y + 10, blink, 2, '#4a4234'); eye(b, 18, y + 10, blink, 2, '#4a4234');
      b.rect(12, y + 17, 8, 1, '#b8aa88'); b.rect(12, y + 20, 6, 1, '#b8aa88');
    }
    b.rect(14 + (f === 2 ? 2 : 0), y + 26, 4, 4, R[2]);
  };
  S.atlas_crab = (b, look, d, f, blink) => {
    const c = look.col || '#b89070', R = R5(c), s = f === 1 ? 2 : 0;
    for (const [x, dx] of [[6, -2], [10, -2], [21, 2], [25, 2]]) { b.line(x, 40, x + dx, 45, R[1]); }
    b.line(8, 33, 4, 28 - s, R[2], 2); b.line(23, 33, 27, 28 + s - 2, R[2], 2);
    orb(b, 0, 22 - s, 7, 28 - s, R); b.rect(1, 21 - s, 3, 2, R[3]);
    orb(b, 24, 20 + s, 31, 26 + s, R); b.rect(28, 19 + s, 3, 2, R[3]);
    orb(b, 5, 29, 26, 41, R);
    b.line(8, 35, 23, 33, R[1]); b.line(15, 30, 16, 40, R[1]); b.line(9, 32, 12, 38, A('#6a4a3a', 0.6)); // map lines
    b.rect(18, 36, 2, 2, '#c85a3a');
    if (d !== 'up') { eye(b, 11, 30, blink, 2, INK); eye(b, 19, 30, blink, 2, INK); }
  };
  S.atlas_bell = (b, look, d, f, blink) => {
    const c = look.col || '#9a8a5a', R = R5(c), s = f === 1 ? 1 : 0;
    b.rect(9, 10, 14, 3, '#5a4a2a'); b.rect(9, 10, 14, 1, '#7a6a4a'); b.rect(15, 8, 2, 2, '#5a4a2a');
    for (let yy = 13; yy <= 36; yy++) {
      const k = (yy - 13) / 23, half = Math.round(5 + 5 * k * k + (yy > 33 ? 2 : 0));
      b.rect(16 - half + s, yy, half * 2, 1, R[2]);
      b.rect(16 - half + s, yy, 2, 1, R[3]); b.rect(16 + half - 3 + s, yy, 3, 1, R[1]);
    }
    b.rect(4 + s, 36, 24, 2, R[1]); b.rect(4 + s, 36, 24, 1, R[3]);
    b.rect(12 + s, 17, 2, 12, R[4]);
    orb(b, 14 + s, 38, 18 + s, 42, R5('#4a3a1a'));
    if (d !== 'up') { eye(b, 12 + s, 23, blink, 2, '#2a2010', '#e8d890'); eye(b, 18 + s, 23, blink, 2, '#2a2010', '#e8d890'); }
  };
  S.atlas_cartographer = (b, look, d, f, blink) => {
    const P0 = ['#9a8c6c', '#b4a684', '#e8dcc0', '#f4ecd8'], y = f === 1 ? -1 : 0;
    b.rect(10, 42, 5, 5, P0[1]); b.rect(18, 42, 5, 5, P0[1]);
    b.poly([7, 42 + y, 9, 8 + y, 16, 4 + y, 23, 8 + y, 25, 42 + y], P0[2]);
    b.poly([9, 8 + y, 16, 4 + y, 16, 42 + y, 7, 42 + y], P0[3]);
    for (const yy of [16, 26, 34]) b.rect(8, yy + y, 17, 1, P0[1]);
    b.rect(16, 4 + y, 1, 38, P0[1]);
    b.rect(11, 30 + y, 6, 1, '#8a5a3a'); b.rect(16, 22 + y, 1, 8, '#8a5a3a');
    b.oval(10, 6 + y, 22, 16 + y, '#2a2a3a');
    if (d !== 'up') { if (blink) { b.rect(12, 11 + y, 3, 1, '#9ec4f0'); b.rect(18, 11 + y, 3, 1, '#9ec4f0'); } else { b.rect(12, 10 + y, 3, 2, '#9ec4f0'); b.rect(18, 10 + y, 3, 2, '#9ec4f0'); } }
    // a sheet held out, still blank
    b.rect(24, 18 + y, 7, 12, '#f8f2e2'); b.rect(24, 18 + y, 7, 2, '#d8ccac'); b.rect(24, 28 + y, 7, 2, '#d8ccac');
  };
  S.atlas_gate = (b, look, d, f, blink) => {
    const c = look.col || '#8a8a78', R = R5(c), bob = f === 1 ? 1 : 0;
    b.rect(3, 6, 26, 5, R[3]); b.rect(3, 6, 26, 1, R[4]); b.rect(3, 10, 26, 1, R[1]); b.rect(1, 7, 2, 3, R[2]); b.rect(29, 7, 2, 3, R[1]);
    b.rect(7, 11, 18, 35, R[2]); b.rect(7, 11, 3, 35, R[3]); b.rect(22, 11, 3, 35, R[1]);
    for (const yy of [20, 30, 40]) { b.rect(7, yy, 18, 1, R[1]); }
    b.rect(16, 21, 1, 9, R[1]); b.rect(12, 31, 1, 9, R[1]); b.rect(7, 46, 18, 1, R[0]);
    if (d !== 'up') {
      if (blink) { b.rect(11, 15, 3, 1, '#f0d890'); b.rect(18, 15, 3, 1, '#f0d890'); }
      else { b.rect(11, 14, 3, 2, '#f0d890'); b.rect(18, 14, 3, 2, '#f0d890'); b.px(11, 14, '#fff8d0'); b.px(18, 14, '#fff8d0'); }
      b.rect(12, 24 + bob, 8, 2, R[0]);
    }
  };
})();
