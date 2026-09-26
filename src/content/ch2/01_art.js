/* Chapter 2 art: harbour props, archive props, overworld creatures and
 * battle art for Saltglass. All procedural; no external assets. */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const P = RB.props.P;
  const px = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  const def = (id, o, draw) => (P[id] = Object.assign({ id, w: 1, h: 1, block: true }, o, { draw }));
  const still = () => RB.game && RB.game.reducedMotion && RB.game.reducedMotion();

  // Ferry boat moored at the landing (5×2 tiles, on water).
  def('sg_ferry', { w: 5, h: 2 }, (c, x, y, p, t) => {
    const bob = still() ? 0 : Math.round(Math.sin(t / 700) * 1);
    const yy = y + bob;
    c.fillStyle = p.wood[2];
    c.beginPath(); c.moveTo(x + 2, yy + 12); c.lineTo(x + 78, yy + 12); c.lineTo(x + 70, yy + 28); c.lineTo(x + 8, yy + 28); c.closePath(); c.fill();
    px(c, x + 4, yy + 12, 72, 3, p.wood[3]);
    px(c, x + 8, yy + 16, 64, 2, p.wood[0]);
    px(c, x + 26, yy - 2, 26, 14, p.wood[1]);
    px(c, x + 26, yy - 4, 26, 3, '#b2573f');
    px(c, x + 30, yy + 2, 6, 5, '#9ab8c8'); px(c, x + 42, yy + 2, 6, 5, '#9ab8c8');
    px(c, x + 60, yy - 18, 2, 30, p.wood[2]);
    c.fillStyle = 'rgba(255,255,255,0.35)';
    c.fillRect(x + 6, yy + 29, 66, 1);
  });

  // Tide table board: a slate with painted hours and chalk marks.
  def('sg_tideboard', { w: 2 }, (c, x, y, p) => {
    px(c, x + 3, y + 8, 2, 7, p.wood[2]); px(c, x + 27, y + 8, 2, 7, p.wood[2]);
    px(c, x + 1, y - 8, 30, 17, p.wood[2]);
    px(c, x + 3, y - 6, 26, 13, '#2e3a3e');
    c.strokeStyle = '#e8f0f0'; c.lineWidth = 1;
    c.beginPath(); c.moveTo(x + 4, y); c.quadraticCurveTo(x + 10, y - 7, x + 16, y); c.quadraticCurveTo(x + 22, y + 7, x + 28, y); c.stroke();
    for (let i = 0; i < 5; i++) px(c, x + 5 + i * 5, y + 4, 1, 2, '#c8d8d8');
  });

  // Lighthouse lens on its stand; glows.
  def('sg_lens', { light: 46 }, (c, x, y, p, t) => {
    const a = still() ? 0.8 : 0.65 + Math.sin(t / 500) * 0.25;
    px(c, x + 3, y + 8, 10, 7, '#6a6a72');
    px(c, x + 2, y + 13, 12, 2, '#4a4a52');
    c.fillStyle = `rgba(255,236,170,${a})`;
    c.beginPath(); c.ellipse(x + 8, y + 2, 6, 8, 0, 0, 7); c.fill();
    c.strokeStyle = '#c8d8e0'; c.lineWidth = 1;
    for (let i = -4; i <= 4; i += 4) { c.beginPath(); c.moveTo(x + 8 + i, y - 5); c.lineTo(x + 8 + i, y + 9); c.stroke(); }
  });

  // A bank of unnatural fog over the causeway (non-blocking).
  def('sg_fog', { block: false }, (c, x, y, p, t) => {
    const s = still() ? 0 : Math.sin(t / 900 + x * 0.1) * 3;
    c.fillStyle = 'rgba(232,236,242,0.55)';
    c.beginPath(); c.ellipse(x + 8 + s, y + 8, 12, 8, 0, 0, 7); c.fill();
    c.fillStyle = 'rgba(250,250,255,0.35)';
    c.beginPath(); c.ellipse(x + 4 - s, y + 4, 8, 5, 0, 0, 7); c.fill();
  });

  // Card-catalogue cabinet with rows of small drawers (2×1).
  def('sg_drawers', { w: 2 }, (c, x, y, p) => {
    px(c, x + 1, y - 10, 30, 25, p.wood[2]);
    px(c, x + 2, y - 9, 28, 23, p.wood[0]);
    for (let r = 0; r < 4; r++) for (let i = 0; i < 4; i++) {
      px(c, x + 3 + i * 7, y - 8 + r * 5, 6, 4, p.wood[1]);
      px(c, x + 5 + i * 7, y - 6 + r * 5, 2, 1, '#e8e0cc');
    }
  });

  // Wrecked fishing boat on the sand (3×2), nameplate washed blank.
  def('sg_wreck', { w: 3, h: 2 }, (c, x, y, p) => {
    c.fillStyle = p.wood[2];
    c.beginPath(); c.moveTo(x + 2, y + 8); c.lineTo(x + 44, y + 4); c.lineTo(x + 40, y + 26); c.lineTo(x + 8, y + 28); c.closePath(); c.fill();
    c.fillStyle = p.wood[0];
    for (let i = 0; i < 5; i++) c.fillRect(x + 8 + i * 7, y + 6, 2, 20);
    px(c, x + 16, y + 14, 14, 5, '#e8e0cc');
    px(c, x + 17, y + 15, 12, 3, '#f4f0e6');
    c.fillStyle = 'rgba(0,0,0,0.2)'; c.fillRect(x + 6, y + 28, 36, 2);
  });

  // Market stall: counter with an awning and the day's fish (3×1).
  def('sg_stall', { w: 3 }, (c, x, y, p, t, o) => {
    px(c, x, y + 1, 48, 14, p.wood[0]);
    px(c, x, y + 1, 48, 3, p.wood[3]);
    px(c, x + 2, y - 20, 2, 22, p.wood[2]); px(c, x + 44, y - 20, 2, 22, p.wood[2]);
    for (let i = 0; i < 8; i++) px(c, x - 2 + i * 6.5, y - 24, 7, 6, i % 2 ? '#e8e4dc' : '#4a6a9a');
    px(c, x - 2, y - 18, 52, 1, 'rgba(0,0,0,0.25)');
    if (!o.empty) for (let i = 0; i < 5; i++) {
      const fx = x + 5 + i * 8;
      c.fillStyle = i % 2 ? '#a8b8c8' : '#c8a8a0';
      c.beginPath(); c.ellipse(fx + 3, y + 3, 4, 2, 0, 0, 7); c.fill();
      px(c, fx - 2, y + 2, 2, 3, c.fillStyle);
    }
  });

  // A floating catalogue cabinet tied up as a raft (2×4, walkable).
  def('sg_raft', { w: 2, h: 4, block: false }, (c, x, y, p, t) => {
    const b = still() ? 0 : Math.round(Math.sin(t / 600));
    px(c, x + 2, y + 2 + b, 28, 60, p.wood[2]);
    px(c, x + 4, y + 4 + b, 24, 56, p.wood[0]);
    for (let r = 0; r < 7; r++) px(c, x + 6, y + 8 + r * 8 + b, 20, 1, p.wood[2]);
    c.strokeStyle = '#c8b890'; c.lineWidth = 1;
    c.beginPath(); c.moveTo(x - 12, y + 66); c.quadraticCurveTo(x - 4, y + 60, x + 4, y + 58 + b); c.stroke();
  });

  // Mooring bollard / rope post.
  def('sg_bollard', {}, (c, x, y, p) => {
    px(c, x + 5, y + 4, 6, 10, p.stone[2]);
    px(c, x + 4, y + 2, 8, 3, p.stone[0]);
    px(c, x + 5, y + 7, 6, 2, '#c8b890');
  });

  // ---- overworld creatures ---------------------------------------------------------------
  const S = RB.sprites.custom;
  const R = px;
  S.sg_crab = (c, look, d, f) => {
    const col = look.col || '#c86a4a';
    c.fillStyle = col; c.beginPath(); c.ellipse(8, 17, 6, 4, 0, 0, 7); c.fill();
    R(c, 5, 15, 6, 3, '#f0e8d8'); R(c, 6, 16, 4, 1, '#3a3036');
    const s = f === 1 ? 1 : 0;
    R(c, 0, 12 + s, 3, 3, col); R(c, 13, 12 - s, 3, 3, col);
    R(c, 2, 20, 1, 2, col); R(c, 13, 20, 1, 2, col); R(c, 4, 21, 1, 2, col); R(c, 11, 21, 1, 2, col);
    R(c, 6, 12, 1, 2, '#1a1a1a'); R(c, 9, 12, 1, 2, '#1a1a1a');
  };
  S.sg_letter = (c, look, d, f) => {
    const b = f === 1 ? 1 : 0;
    R(c, 2, 10 + b, 12, 9, '#f4ecd8');
    c.fillStyle = '#d8ccb0'; c.beginPath(); c.moveTo(2, 10 + b); c.lineTo(8, 15 + b); c.lineTo(14, 10 + b); c.fill();
    R(c, 7, 15 + b, 2, 2, '#b84a3a');
    R(c, 5, 12 + b, 1, 1, '#2a2440'); R(c, 10, 12 + b, 1, 1, '#2a2440');
    R(c, 6, 20, 4, 2, '#e8e0cc80');
  };
  S.sg_clerk = (c, look, d, f) => {
    const b = f === 1 ? 1 : 0;
    R(c, 3, 9, 10, 13, '#4a6a8a'); R(c, 3, 9, 1, 13, '#3a5470'); R(c, 12, 9, 1, 13, '#3a5470');
    R(c, 4, 3 + b, 8, 7, '#b8c8d0'); R(c, 3, 2 + b, 10, 3, '#3a5470'); R(c, 3, 2 + b, 1, 8, '#3a5470'); R(c, 12, 2 + b, 1, 8, '#3a5470');
    if (d !== 'up') { R(c, 5, 6 + b, 2, 1, '#7ab0d0'); R(c, 9, 6 + b, 2, 1, '#7ab0d0'); }
    R(c, 12, 12, 3, 5, '#6a4a3a'); R(c, 11, 16, 5, 2, '#c85a4a');
    R(c, 1, 13, 3, 4, '#e8e0cc');
  };

  // ---- battle art ---------------------------------------------------------------------------
  const A = RB.enemyArt.A;
  A.sg_letter = (c, t, o) => {
    const b = Math.sin(t / 420) * 4;
    c.save(); c.rotate(Math.sin(t / 900) * 0.08);
    c.fillStyle = '#f4ecd8'; c.fillRect(-30, -20 + b, 60, 40);
    c.fillStyle = '#d8ccb0'; c.beginPath(); c.moveTo(-30, -20 + b); c.lineTo(0, 4 + b); c.lineTo(30, -20 + b); c.fill();
    c.fillStyle = '#b84a3a'; c.beginPath(); c.arc(0, 6 + b, 6, 0, 7); c.fill();
    c.fillStyle = '#2a2440'; c.fillRect(-12, -6 + b, 3, 4); c.fillRect(9, -6 + b, 3, 4);
    c.fillStyle = '#8a7a6a60'; for (let i = 0; i < 3; i++) c.fillRect(-24, 10 + i * 4 + b, 16, 1);
    c.restore();
    c.strokeStyle = '#e8e0cc80'; c.lineWidth = 2;
    for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-16 + i * 16, 24 + b); c.quadraticCurveTo(-12 + i * 16 + Math.sin(t / 300 + i) * 5, 34, -16 + i * 16, 44); c.stroke(); }
  };
})();
