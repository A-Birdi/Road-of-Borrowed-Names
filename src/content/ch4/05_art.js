/* Chapter 4 art: Snowbell props (hearth, bell-post, mail shelves, snow
 * sculptures, the great lamp…), overworld goats and snow foxes, and the
 * boss art. Registered through RB.props.P / RB.sprites.custom /
 * RB.enemyArt.A so no engine file changes. */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const P = RB.props.P;
  const px = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  const shadow = RB.props.shadow;
  const def = (id, props, draw) => { P[id] = Object.assign({ id, w: 1, h: 1, block: true }, props, { draw }); };

  // Sunken hearth (irori) with a kettle on a hook. o.low: the fire is failing.
  def('sb_irori', { w: 2, h: 2, light: 46 }, (c, x, y, p, t, o) => {
    px(c, x + 1, y + 2, 30, 28, '#4a3226');
    px(c, x + 3, y + 4, 26, 24, '#8a8078');
    px(c, x + 5, y + 6, 22, 20, '#3a3a3a');
    for (let i = 0; i < 5; i++) px(c, x + 8 + i * 4, y + 18 + (i % 2), 3, 5, '#6a4a30');
    const f = o.still ? 0 : Math.sin(t / 110) * 1.5;
    const h = o.low ? 4 : 9;
    px(c, x + 11, y + 20 - h - f, 10, h + f, o.low ? '#a84a2a' : '#e8702a');
    px(c, x + 13, y + 22 - h - f, 6, h - 2 + f, o.low ? '#c86a3a' : '#f8b040');
    if (!o.low) px(c, x + 15, y + 16 - f, 2, 4, '#fff0a0');
    // jizai hook and kettle
    px(c, x + 15, y - 14, 2, 22, '#2a2420');
    px(c, x + 9, y + 2, 14, 8, '#2e2a2a');
    px(c, x + 11, y + 1, 10, 2, '#4a4444');
    px(c, x + 23, y + 4, 3, 2, '#2e2a2a');
    if (!o.still && !o.low) { const s = (t / 700) % 1; c.fillStyle = `rgba(240,240,240,${0.45 - s * 0.45})`; c.fillRect(x + 25 + s * 3, y - s * 10, 2, 2); }
  });
  // Bell-post: a tall wooden post with a hooded bell and a signal board.
  def('sb_bellpost', { w: 1, h: 1 }, (c, x, y, p, t, o) => {
    shadow(c, x, y, 14);
    px(c, x + 6, y - 30, 4, 44, p.wood[2]);
    px(c, x + 7, y - 30, 1, 44, p.wood[1]);
    px(c, x + 1, y - 34, 14, 3, p.wood[0]);
    px(c, x + 2, y - 36, 12, 2, '#ffffff');
    c.fillStyle = '#8a7a4a';
    c.beginPath(); c.moveTo(x + 5, y - 30); c.lineTo(x + 11, y - 30); c.lineTo(x + 13, y - 20); c.lineTo(x + 3, y - 20); c.closePath(); c.fill();
    px(c, x + 5, y - 28, 1, 6, '#b8a468');
    px(c, x + 7, y - 20, 2, 2, '#5a4a2a');
    px(c, x + 7, y - 18, 1, 12, '#c8b890');
    px(c, x + 2, y - 4, 12, 7, o.blank ? '#e8e4dc' : '#d8c8a0');
    if (!o.blank) for (let i = 0; i < 3; i++) px(c, x + 4, y - 3 + i * 2, 8, 1, '#5a4a3a');
  });
  // Pigeonhole shelves for letters waiting for the thaw.
  def('sb_mailshelf', { w: 2, h: 1 }, (c, x, y, p, t, o) => {
    px(c, x + 1, y - 14, 30, 28, p.wood[2]);
    for (let r = 0; r < 4; r++) for (let k = 0; k < 5; k++) {
      px(c, x + 3 + k * 6, y - 12 + r * 6, 5, 5, '#2a2018');
      if ((r * 5 + k + (o.cx || 0)) % 3) px(c, x + 3 + k * 6, y - 11 + r * 6, 5, 3, (r + k) % 4 ? '#efe6d2' : '#d8c8e0');
    }
  });
  // Snow drift blocking a road.
  def('sb_drift', { w: 1, h: 1 }, (c, x, y) => {
    c.fillStyle = '#c8d6e2'; c.beginPath(); c.ellipse(x + 8, y + 12, 9, 6, 0, 0, 7); c.fill();
    c.fillStyle = '#f4f8fc'; c.beginPath(); c.ellipse(x + 7, y + 9, 8, 6, 0, 0, 7); c.fill();
    px(c, x + 4, y + 6, 4, 1, '#ffffff');
  });
  // A wall of clear blue ice. o.cracked: thinner, about to give.
  def('sb_icewall', { w: 1, h: 1 }, (c, x, y, p, t, o) => {
    px(c, x, y - 8, 16, 24, o.cracked ? '#a8d0ec' : '#8cc0e4');
    px(c, x + 1, y - 7, 14, 22, o.cracked ? '#c8e4f4' : '#b0d8f0');
    px(c, x + 3, y - 5, 2, 14, '#ffffffc0');
    px(c, x + 9, y - 2, 1, 10, '#ffffff90');
    if (o.cracked) { px(c, x + 6, y, 1, 6, '#5a8ab0'); px(c, x + 7, y + 5, 3, 1, '#5a8ab0'); }
    const a = o.still ? 0.5 : (Math.sin(t / 600 + x) + 1) / 2;
    c.fillStyle = `rgba(255,255,255,${0.2 + a * 0.3})`; c.fillRect(x + 11, y - 6, 2, 2);
  });
  // Icicles hanging from a beam (decorative, walk-through).
  def('sb_icicles', { w: 1, h: 1, block: false }, (c, x, y) => {
    for (let i = 0; i < 4; i++) { const h = 4 + ((i * 7 + x) % 6); px(c, x + 1 + i * 4, y - 16, 2, h, '#d8ecf8'); px(c, x + 1 + i * 4, y - 16, 1, h, '#ffffff'); }
  });
  // Star chart laid out on a slanted table (2 wide).
  def('sb_starchart', { w: 2, h: 1 }, (c, x, y, p, t, o) => {
    shadow(c, x, y, 30);
    px(c, x + 2, y + 8, 3, 7, p.wood[2]); px(c, x + 27, y + 8, 3, 7, p.wood[2]);
    px(c, x + 1, y - 4, 30, 13, p.wood[1]);
    px(c, x + 3, y - 3, 26, 10, o.frost ? '#c8dcec' : '#1e2848');
    if (!o.frost) {
      const st = [[5, 0], [9, 3], [14, 1], [18, 5], [22, 2], [25, 6], [11, 6], [7, 4]];
      for (const [sx, sy] of st) px(c, x + 3 + sx, y - 3 + sy, 1, 1, '#f4f0d0');
      c.strokeStyle = '#8aa0c880'; c.lineWidth = 1; c.beginPath(); c.moveTo(x + 8.5, y - 2.5); c.lineTo(x + 12.5, y + 0.5); c.lineTo(x + 17.5, y - 1.5); c.stroke();
    } else for (let i = 0; i < 6; i++) px(c, x + 5 + i * 4, y - 1 + (i % 2) * 3, 2, 1, '#ffffff');
  });
  // A brass direction dial on a stone pedestal.
  def('sb_dial', { w: 1, h: 1 }, (c, x, y, p, t, o) => {
    shadow(c, x, y, 14);
    px(c, x + 4, y + 2, 8, 12, p.stone[0]);
    px(c, x + 4, y + 2, 8, 1, p.stone[1]);
    c.fillStyle = '#b8984a'; c.beginPath(); c.arc(x + 8, y - 2, 6, 0, 7); c.fill();
    c.fillStyle = '#e8d08a'; c.beginPath(); c.arc(x + 8, y - 2, 4, 0, 7); c.fill();
    const a = { up: -Math.PI / 2, down: Math.PI / 2, left: Math.PI, right: 0 }[o.point || 'up'];
    c.strokeStyle = '#5a3a1a'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x + 8, y - 2); c.lineTo(x + 8 + Math.cos(a) * 4, y - 2 + Math.sin(a) * 4); c.stroke();
    if (o.frost) { c.fillStyle = 'rgba(220,240,255,0.7)'; c.beginPath(); c.arc(x + 8, y - 2, 6, 0, 7); c.fill(); }
  });
  // Hatch crank: a spoked wheel on a post.
  def('sb_crank', { w: 1, h: 1 }, (c, x, y, p, t, o) => {
    px(c, x + 7, y - 2, 2, 16, '#4a4a52');
    const a = o.turned ? 0.8 : 0;
    c.strokeStyle = o.frost ? '#b8d8ec' : '#8a6a3a'; c.lineWidth = 2;
    c.beginPath(); c.arc(x + 8, y - 4, 6, 0, 7); c.stroke();
    for (let i = 0; i < 4; i++) { const an = a + i * Math.PI / 2; c.beginPath(); c.moveTo(x + 8, y - 4); c.lineTo(x + 8 + Math.cos(an) * 6, y - 4 + Math.sin(an) * 6); c.stroke(); }
  });
  // The great observatory lamp (2×2). o.lit / o.frozen.
  def('sb_greatlamp', { w: 2, h: 2, light: 70 }, (c, x, y, p, t, o) => {
    shadow(c, x, y + 16, 30);
    px(c, x + 6, y + 24, 20, 6, '#3a3440');
    px(c, x + 13, y + 6, 6, 18, '#4a4452');
    px(c, x + 4, y - 22, 24, 4, '#3a3440');
    px(c, x + 6, y - 18, 20, 24, o.lit ? '#f8ecc8' : o.frozen ? '#c8dcec' : '#8a8a98');
    px(c, x + 6, y - 18, 20, 1, '#ffffff80');
    if (o.lit) {
      const f = o.still ? 0 : Math.sin(t / 140) * 2;
      c.fillStyle = '#f8a040c0'; c.beginPath(); c.ellipse(x + 16, y - 4, 5, 9 + f, 0, 0, 7); c.fill();
      c.fillStyle = '#fff4b0'; c.beginPath(); c.ellipse(x + 16, y - 2, 2.5, 5 + f / 2, 0, 0, 7); c.fill();
      // the name on the shade
      px(c, x + 9, y - 14, 1, 7, '#3a2a20'); px(c, x + 22, y - 14, 1, 7, '#3a2a20');
    } else if (o.frozen) {
      for (let i = 0; i < 5; i++) px(c, x + 7 + i * 4, y + 6, 2, 3 + (i % 3) * 2, '#e8f4fc');
      px(c, x + 12, y - 12, 8, 1, '#ffffff'); px(c, x + 10, y - 8, 12, 1, '#ffffffa0');
    }
    px(c, x + 3, y - 24, 26, 2, '#2a2430');
  });
  // Invisible blocker for footprints drawn by a larger prop.
  def('sb_blocker', {}, () => {});
  // The observatory building (7×5): stone drum, dome with a slit, the lamp's
  // window. Blocking comes from the map's wall tiles; this only draws.
  def('sb_observatory', { w: 7, h: 5, block: false, light: 0 }, (c, x, y, p, t, o) => {
    const W = 112;
    c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(x + 4, y + 78, W - 4, 4);
    px(c, x + 6, y + 32, W - 12, 48, p.stone[0]);
    for (let r = 0; r < 4; r++) for (let k = 0; k < 7; k++) px(c, x + 8 + k * 14 + (r % 2) * 7, y + 36 + r * 11, 12, 1, p.stone[2]);
    px(c, x + 6, y + 32, 4, 48, p.stone[1]); px(c, x + W - 10, y + 32, 4, 48, p.stone[2]);
    px(c, x + 2, y + 28, W - 4, 5, p.stone[2]);
    // dome
    c.fillStyle = o.lit ? '#b8c4d0' : '#c8d6e2';
    c.beginPath(); c.arc(x + 56, y + 30, 44, Math.PI, 0); c.fill();
    c.fillStyle = '#ffffff'; c.beginPath(); c.arc(x + 56, y + 30, 44, Math.PI * 1.05, Math.PI * 1.45); c.lineTo(x + 56, y + 30); c.fill();
    c.strokeStyle = '#8a98a8'; c.lineWidth = 1;
    for (let i = 1; i < 4; i++) { c.beginPath(); c.arc(x + 56, y + 30, 44, Math.PI + i * 0.78, Math.PI + i * 0.78 + 0.01); c.lineTo(x + 56, y + 30); c.stroke(); }
    // slit and lamp
    px(c, x + 51, y - 12, 10, 40, '#1a2030');
    if (o.lit) {
      const f = o.still ? 0 : Math.sin(t / 160) * 1.5;
      px(c, x + 52, y + 6, 8, 16, '#f8c060');
      px(c, x + 54, y + 9 - f, 4, 8, '#fff4b0');
    } else px(c, x + 52, y + 8, 8, 14, '#6a88a8');
    // door and windows
    px(c, x + 50, y + 62, 12, 18, '#2a1e18'); px(c, x + 51, y + 63, 10, 17, p.wood[0]); px(c, x + 58, y + 71, 1, 2, '#e0c060');
    px(c, x + 48, y + 59, 16, 3, p.stone[2]);
    for (const wx of [20, 82]) { px(c, x + wx, y + 44, 10, 14, '#2a2430'); px(c, x + wx + 1, y + 45, 8, 12, o.lit ? '#ffd27a' : '#6a88a8'); }
    // snow on the ledge, icicles while frozen
    px(c, x + 2, y + 26, W - 4, 3, '#ffffff');
    if (!o.lit) for (let i = 0; i < 12; i++) px(c, x + 6 + i * 9, y + 33, 2, 3 + ((i * 5) % 6), '#e8f4fc');
  });
  // Futon laid on tatami (1×2).
  def('sb_futon', { w: 1, h: 2 }, (c, x, y, p, t, o) => {
    px(c, x + 1, y + 1, 14, 30, '#e8e0d0');
    px(c, x + 1, y + 1, 14, 6, '#f4f0e8');
    px(c, x + 1, y + 9, 14, 22, o.col || '#6a7aa8');
    for (let i = 0; i < 3; i++) px(c, x + 3 + i * 4, y + 12 + i * 5, 2, 2, '#ffffff50');
  });
  // Stacked firewood (2×1).
  def('sb_woodpile', { w: 2, h: 1 }, (c, x, y, p, t, o) => {
    shadow(c, x, y, 30);
    for (let r = 0; r < 3; r++) for (let k = 0; k < 5 - (r % 2); k++) {
      const ox = x + 2 + k * 6 + (r % 2) * 3, oy = y + 8 - r * 5;
      c.fillStyle = p.wood[1]; c.beginPath(); c.arc(ox + 2, oy + 2, 2.6, 0, 7); c.fill();
      c.fillStyle = p.wood[3]; c.fillRect(ox + 1, oy + 1, 2, 2);
    }
    if (!o.indoor) px(c, x + 1, y - 7, 30, 2, '#ffffff');
  });
  // Snow sculptures for the children's contest.
  def('sb_snowgoat', { w: 1, h: 1 }, (c, x, y, p, t, o) => {
    shadow(c, x, y, 16);
    c.fillStyle = '#f4f8fc'; c.beginPath(); c.ellipse(x + 8, y + 8, 7, 5, 0, 0, 7); c.fill();
    c.beginPath(); c.ellipse(x + 3, y + 2, 3.5, 3, 0, 0, 7); c.fill();
    px(c, x + 1, y - 3, 1, 3, '#8a7a6a');
    if (!o.oneHorn) px(c, x + 4, y - 3, 1, 3, '#8a7a6a');
    px(c, x + 2, y + 2, 1, 1, '#2a2a2a');
    px(c, x + 3, y + 5, 2, 2, '#e8e0d0');
  });
  def('sb_snowobs', { w: 1, h: 1 }, (c, x, y) => {
    shadow(c, x, y, 16);
    px(c, x + 3, y + 2, 10, 12, '#eef4f8');
    c.fillStyle = '#f8fbfd'; c.beginPath(); c.arc(x + 8, y + 2, 5, Math.PI, 0); c.fill();
    px(c, x + 7, y + 8, 2, 6, '#9ab0c0');
    c.fillStyle = '#c83a3a'; c.beginPath(); c.arc(x + 8, y - 4, 1.8, 0, 7); c.fill();
  });
  def('sb_snowfox', { w: 1, h: 1 }, (c, x, y, p, t, o) => {
    shadow(c, x, y, 16);
    c.fillStyle = '#f4f8fc'; c.beginPath(); c.ellipse(x + 7, y + 9, 6, 4, 0, 0, 7); c.fill();
    c.beginPath(); c.ellipse(x + 4, y + 3, 3.5, 3, 0, 0, 7); c.fill();
    px(c, x + 2, y - 2, 2, 3, '#f4f8fc'); px(c, x + 5, y - 2, 2, 3, '#f4f8fc');
    c.beginPath(); c.ellipse(x + 13, y + 6, 3, o.bigTail ? 4 : 2, -0.5, 0, 7); c.fill();
    px(c, x + 3, y + 3, 1, 1, '#3a2a2a');
  });

  // ---- overworld creatures ---------------------------------------------------------------
  const R = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  RB.sprites.custom.goat = (c, look, d, f) => {
    const col = look.col || '#eeeae0', sh = look.col2 || '#c8c0b0';
    const b = f === 1 ? 1 : 0;
    R(c, 3, 13, 10, 6, col); R(c, 3, 18, 10, 1, sh);
    R(c, 4, 19, 1, 4 - b, sh); R(c, 7, 19, 1, 4, sh); R(c, 9, 19, 1, 4 - b, sh); R(c, 12, 19, 1, 4, sh);
    if (d === 'up') { R(c, 6, 9, 4, 5, col); R(c, 6, 7, 1, 2, '#8a7a6a'); R(c, 9, 7, 1, 2, '#8a7a6a'); R(c, 7, 19, 2, 2, col); }
    else if (d === 'down') { R(c, 6, 10, 4, 6, col); R(c, 6, 8, 1, 2, '#8a7a6a'); R(c, 9, 8, 1, 2, '#8a7a6a'); R(c, 6, 12, 1, 1, '#2a2a2a'); R(c, 9, 12, 1, 1, '#2a2a2a'); R(c, 7, 16, 2, 2, sh); R(c, 4, 11, 2, 1, sh); R(c, 10, 11, 2, 1, sh); }
    else { R(c, 11, 9, 4, 5, col); R(c, 12, 7, 1, 2, '#8a7a6a'); R(c, 13, 11, 1, 1, '#2a2a2a'); R(c, 14, 13, 1, 2, sh); R(c, 2, 12, 2, 2, col); }
  };
  RB.sprites.custom.snowfox = (c, look, d, f) => {
    const col = look.col || '#f2f6fa', sh = '#b8c8d8';
    const b = f === 1 ? 1 : 0;
    R(c, 3, 15, 10, 5, col); R(c, 3, 19, 10, 1, sh);
    R(c, 4, 20, 1, 3 - b, sh); R(c, 11, 20, 1, 3, sh);
    if (d === 'side') { R(c, 11, 11, 4, 5, col); R(c, 11, 9, 1, 2, col); R(c, 13, 9, 1, 2, col); R(c, 13, 12, 1, 1, '#3a5a8a'); R(c, 15, 14, 1, 1, '#2a2a2a'); R(c, 0, 12 - b, 4, 4, col); R(c, 0, 12 - b, 1, 1, '#ffffff'); }
    else { R(c, 5, 10, 6, 6, col); R(c, 5, 8, 2, 2, col); R(c, 9, 8, 2, 2, col); if (d === 'down') { R(c, 6, 12, 1, 1, '#3a5a8a'); R(c, 9, 12, 1, 1, '#3a5a8a'); R(c, 7, 14, 2, 1, '#2a2a2a'); } else R(c, 6, 17, 4, 4, col); }
  };

  // ---- battle art (pixel art at art resolution; see src/ui/78_enemy_art.js) --------------
  // The lamp that waited: a tall standing lantern under a snow-capped roof,
  // its paper panels lit by a flame gone cold and blue (warm again with
  // o.warm), icicles on the eaves and foot, frost motes circling it.
  RB.enemyArt.def('sb_frostlamp', {
    w: 184, h: 232, ox: 92, oy: 108, frames: 8, ms: 130,
    bob: (t) => Math.sin(t / 520) * 3,
    build(L, f, o, H) {
      const K = H.K;
      const warm = !!o.warm;
      const wood = K.mat('#2e2c3e', { n: 4, at: 1, step: 0.08 });
      const paper = K.mat(warm ? '#f8ecc8' : '#d8e8f4', { n: 5, at: 3, step: 0.08 });
      const flame = warm ? '#f8a040' : '#8ab8f0';
      const snow = K.mat('#eef4fa', { n: 4, at: 2, step: 0.07 });
      const ice = K.mat('#bcd8ee', { n: 4, at: 2, step: 0.1, alpha: 230 });
      const mote = K.mat('#e6f4ff', { n: 2, at: 1, line: false });
      const flick = [0, 1, 2, 1, 0, 2, 1, 0][f];
      const aura = L.like(), B = L.like(), fx = L.like();
      H.glow(aura, 0, -4, 60 + flick, 72 + flick, flame, 0.26, 3);
      // roof: a wide cap with a ridge, snow along the top
      B.poly([[-54, -76], [-40, -90], [40, -90], [54, -76], [48, -72], [-48, -72]], wood, (x, y) => K.clamp(0.6 - (y + 90) / 30 - x / 200, 0, 0.99));
      B.rect(-10, -96, 20, 6, wood, 2);
      B.fill(-44, -100, 44, -86, (x, y) => y >= -93 - Math.round(Math.sin(x / 6) * 1.5) && y < -87 && Math.abs(x) < 42 - (y + 93) * 0.5, snow, (x, y) => K.clamp(0.8 - (x + 40) / 160 - (y + 93) / 20, 0, 0.99));
      // posts and the lit paper panel with its lattice
      B.rect(-42, -72, 84, 136, paper, (x, y) => {
        const g = 1 - Math.hypot(x / 44, (y + 4) / 70);
        return K.clamp(0.22 + g * (0.72 + flick * 0.05) + (x < 0 ? 0.04 : -0.04), 0, 0.99);
      });
      for (const x of [-42, 36]) B.rect(x, -72, 6, 136, wood, x < 0 ? 2 : 1);
      B.rect(-42, -72, 84, 5, wood, 2);
      B.rect(-42, 56, 84, 8, wood, 1);
      B.onto((b) => {
        for (const y of [-40, -8, 24]) b.line(-36, y, 36, y, wood, 1);
        for (const x of [-12, 12]) b.line(x, -67, x, 56, wood, 1);
      });
      // the cold flame, seen through the paper
      B.ell(0, 10, 10 + flick, 20 + flick * 2, paper, 4);
      B.ell(0, 16, 5, 10 + flick, K.solid(warm ? '#fff4b0' : '#f2f8ff', { line: false }), 0);
      // foot
      B.stone([[-30, 64], [30, 64], [36, 74], [-36, 74]], wood, { bevel: 2, face: 1 });
      B.rect(-6, 74, 12, 12, wood, 1);
      // mournful eyes on the paper
      for (const s of [-1, 1]) {
        B.poly([[s * 7, -30], [s * 19, -34], [s * 19, -26], [s * 8, -24]], H.ink, 1);
        B.rect(s * 12 - 1, -31, 2, 2, H.white, 0);
      }
      // icicles on the eaves and the foot
      const icicle = (x, y, len) => B.poly([[x - 3, y], [x + 3, y], [x, y + len]], ice, (px) => K.clamp(0.7 - (px - x + 3) / 8, 0, 0.99));
      for (let i = 0; i < 9; i++) icicle(-44 + i * 11, -72, 6 + ((i * 5) % 9));
      for (let i = 0; i < 6; i++) icicle(-30 + i * 12, 74, 5 + ((i * 7) % 8));
      B.outline();
      // frost motes circling (small crosses of light)
      for (let i = 0; i < 10; i++) {
        const a = (f / 8) * (Math.PI * 2 / 10) + i * (Math.PI * 2 / 10);
        const r = 70 + (i % 3) * 8;
        const x = Math.round(Math.cos(a) * r), y = Math.round(Math.sin(a) * r * 0.55) - 4;
        fx.rect(x - 1, y, 3, 1, mote, 1); fx.rect(x, y - 1, 1, 3, mote, 1);
        if ((i + f) % 4 === 0) fx.dot(x, y, K.solid('#ffffff', { line: false }), 0);
      }
      return aura.over(B).over(fx);
    },
  });
  // A small snow fox for battle: the fox, paler, with frost breath.
  RB.enemyArt.def('sb_snowfox', Object.assign({}, RB.enemyArt.P.fox, {
    build(L, f, o, H) {
      const K = H.K;
      const base = RB.enemyArt.P.fox.build(L, f, { col: o.col || '#eef4fa' }, H);
      const puff = K.mat('#e2f0ff', { n: 3, at: 1, step: 0.06, alpha: 150, line: false });
      const br = L.like();
      for (let i = 0; i < 2; i++) {
        const k = ((f / 4) + i * 0.5) % 1;
        br.ell(-14 - k * 26, -2 - k * 6, 3 + k * 6, 2 + k * 4, puff, (x, y) => K.clamp(0.9 - k * 0.6 - (y + 2) / 30, 0, 0.99));
      }
      br.fade(0.9);
      return base.over(br);
    },
  }));
})();
