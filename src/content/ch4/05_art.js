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
  // Futon laid on tatami (1×2).
  def('sb_futon', { w: 1, h: 2 }, (c, x, y, p, t, o) => {
    px(c, x + 1, y + 1, 14, 30, '#e8e0d0');
    px(c, x + 1, y + 1, 14, 6, '#f4f0e8');
    px(c, x + 1, y + 9, 14, 22, o.col || '#6a7aa8');
    for (let i = 0; i < 3; i++) px(c, x + 3 + i * 4, y + 12 + i * 5, 2, 2, '#ffffff50');
  });
  // Stacked firewood (2×1).
  def('sb_woodpile', { w: 2, h: 1 }, (c, x, y, p) => {
    shadow(c, x, y, 30);
    for (let r = 0; r < 3; r++) for (let k = 0; k < 5 - (r % 2); k++) {
      const ox = x + 2 + k * 6 + (r % 2) * 3, oy = y + 8 - r * 5;
      c.fillStyle = p.wood[1]; c.beginPath(); c.arc(ox + 2, oy + 2, 2.6, 0, 7); c.fill();
      c.fillStyle = p.wood[3]; c.fillRect(ox + 1, oy + 1, 2, 2);
    }
    px(c, x + 1, y - 7, 30, 2, '#ffffff');
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

  // ---- battle art ------------------------------------------------------------------------
  const A = RB.enemyArt.A;
  // The lamp that waited: a tall lantern whose flame has gone blue and cold.
  A.sb_frostlamp = (c, t, o) => {
    const b = Math.sin(t / 520) * 3;
    c.fillStyle = '#2a2838'; c.fillRect(-20, -40 + b, 40, 6); c.fillRect(-16, 30 + b, 32, 6); c.fillRect(-3, 36 + b, 6, 10);
    c.fillStyle = o.warm ? '#f8ecc8' : '#d8e8f4'; c.fillRect(-18, -34 + b, 36, 64);
    c.fillStyle = '#ffffff60'; c.fillRect(-16, -32 + b, 4, 60);
    const fl = Math.sin(t / 160) * 3;
    c.fillStyle = o.warm ? '#f8a040c0' : '#8ab8f0c0'; c.beginPath(); c.ellipse(0, 4 + b, 9, 16 + fl, 0, 0, 7); c.fill();
    c.fillStyle = o.warm ? '#fff4b0' : '#e8f4ff'; c.beginPath(); c.ellipse(0, 8 + b, 4, 8 + fl / 2, 0, 0, 7); c.fill();
    c.fillStyle = '#1a1830'; c.fillRect(-9, -18 + b, 4, 5); c.fillRect(5, -18 + b, 4, 5);
    for (let i = 0; i < 7; i++) { const h = 6 + ((i * 5) % 9); c.fillStyle = '#e8f4fc'; c.fillRect(-19 + i * 6, 36 + b, 3, h); }
    for (let i = 0; i < 10; i++) { const a = t / 900 + i * 0.63; const r = 44 + (i % 3) * 6; c.fillStyle = 'rgba(230,244,255,0.7)'; c.fillRect(Math.cos(a) * r, Math.sin(a) * r * 0.6 + b, 2, 2); }
  };
  // A small snow fox for battle (bigger ears, frost breath).
  A.sb_snowfox = (c, t, o) => {
    A.fox(c, t, { col: o.col || '#eef4fa' });
    const s = (t / 600) % 1;
    c.fillStyle = `rgba(220,240,255,${0.6 - s * 0.6})`; c.beginPath(); c.arc(-14 - s * 14, -2, 3 + s * 5, 0, 7); c.fill();
  };
})();
