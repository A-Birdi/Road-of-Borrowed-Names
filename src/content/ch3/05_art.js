/* Chapter 3 art: props for Cinder Orchard (fire lookout, festival seats and
 * bunting, fire buckets, the channel headgate, kiln fittings, ice blocks…).
 * Registered through RB.props.P so no engine file changes are needed. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (P) {
  'use strict';
  const px = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  const shadow = (c, x, y, w) => { c.fillStyle = 'rgba(0,0,0,0.22)'; c.beginPath(); c.ellipse(x + w / 2, y + 14, w / 2 - 1, 2.5, 0, 0, Math.PI * 2); c.fill(); };
  function def(id, props, draw) { P[id] = Object.assign({ id, w: 1, h: 1, block: true }, props, { draw }); }

  // Fire lookout (火の見櫓): a tall timber tower with a small roof and a bell.
  def('co_lookout', { w: 2, h: 2 }, (c, x, y, p, t, o) => {
    shadow(c, x, y + 16, 32);
    const wd = p.wood;
    // legs and braces
    px(c, x + 3, y - 44, 3, 74, wd[2]); px(c, x + 26, y - 44, 3, 74, wd[2]);
    px(c, x + 9, y - 40, 2, 70, wd[0]); px(c, x + 21, y - 40, 2, 70, wd[0]);
    for (let i = 0; i < 4; i++) {
      const yy = y - 30 + i * 16;
      c.strokeStyle = wd[1]; c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(x + 5, yy); c.lineTo(x + 27, yy + 12); c.moveTo(x + 27, yy); c.lineTo(x + 5, yy + 12); c.stroke();
      px(c, x + 3, yy, 26, 2, wd[1]);
    }
    // ladder
    for (let i = 0; i < 8; i++) px(c, x + 13, y - 34 + i * 8, 6, 1, wd[3]);
    px(c, x + 13, y - 36, 1, 66, wd[2]); px(c, x + 18, y - 36, 1, 66, wd[2]);
    // platform + roof
    px(c, x, y - 46, 32, 4, wd[1]);
    px(c, x, y - 46, 32, 1, wd[3]);
    c.fillStyle = p.roof[1];
    c.beginPath(); c.moveTo(x - 2, y - 58); c.lineTo(x + 16, y - 70); c.lineTo(x + 34, y - 58); c.closePath(); c.fill();
    px(c, x - 2, y - 58, 36, 2, p.roof[2]);
    px(c, x + 4, y - 58, 2, 12, wd[2]); px(c, x + 26, y - 58, 2, 12, wd[2]);
    // bell
    const sw = o.still ? 0 : Math.sin(t / 900) * 0.6;
    c.fillStyle = '#9a7a3a';
    c.beginPath(); c.moveTo(x + 13 + sw, y - 56); c.lineTo(x + 19 + sw, y - 56); c.lineTo(x + 21 + sw, y - 48); c.lineTo(x + 11 + sw, y - 48); c.closePath(); c.fill();
    px(c, x + 14 + sw, y - 55, 1, 5, '#c8a860');
    if (o.rope) { px(c, x + 22, y - 48, 1, 30, '#c8b088'); px(c, x + 21, y - 20, 3, 3, '#a8905a'); }
  });

  // A festival seat: chair with a folded cloth; o.named adds a small glass lantern and a name-slip.
  def('co_seat', {}, (c, x, y, p, t, o) => {
    shadow(c, x, y, 14);
    px(c, x + 4, y + 1, 8, 2, p.wood[2]);
    px(c, x + 4, y + 3, 1, 6, p.wood[2]); px(c, x + 11, y + 3, 1, 6, p.wood[2]);
    px(c, x + 4, y + 8, 8, 2, p.wood[1]);
    px(c, x + 4, y + 10, 1, 4, p.wood[2]); px(c, x + 11, y + 10, 1, 4, p.wood[2]);
    px(c, x + 5, y + 6, 6, 2, '#c8603a'); px(c, x + 5, y + 6, 6, 1, '#e08a5a');
    if (o.named) {
      const f = 0.75 + Math.sin(t / 300) * 0.15;
      px(c, x + 6, y - 2, 4, 6, '#6a4a3a');
      c.fillStyle = `rgba(255,190,90,${f})`; c.fillRect(x + 7, y - 1, 2, 4);
      px(c, x + 12, y + 3, 3, 6, '#f4ecd8'); px(c, x + 13, y + 4, 1, 4, '#3a2a2a');
    } else {
      px(c, x + 7, y + 4, 2, 2, '#bfe0dc');
    }
  });

  // Festival bunting strung between poles (drawn high; never blocks).
  def('co_bunting', { w: 3, block: false }, (c, x, y, p, t, o) => {
    const cols = ['#c8603a', '#e0b050', '#8a4a5a', '#f0e0c0', '#6a8a4a'];
    px(c, x + 1, y - 18, 1, 32, p.wood[2]); px(c, x + 46, y - 18, 1, 32, p.wood[2]);
    c.strokeStyle = '#e8dcc0'; c.lineWidth = 1;
    c.beginPath(); c.moveTo(x + 1, y - 17); c.quadraticCurveTo(x + 24, y - 10, x + 47, y - 17); c.stroke();
    for (let i = 0; i < 7; i++) {
      const fx = x + 5 + i * 6, fy = y - 16 + Math.round(Math.sin((i / 6) * Math.PI) * 4);
      c.fillStyle = cols[(i + (o.cx || 0)) % cols.length];
      c.beginPath(); c.moveTo(fx - 2, fy); c.lineTo(fx + 3, fy); c.lineTo(fx + 0.5, fy + 5); c.closePath(); c.fill();
    }
  });

  // Old leather fire buckets stacked on a rack (the village has forgotten why).
  def('co_buckets', {}, (c, x, y, p) => {
    shadow(c, x, y, 14);
    px(c, x + 1, y + 12, 14, 2, p.wood[2]);
    for (let i = 0; i < 3; i++) {
      const bx = x + 1 + i * 5;
      px(c, bx, y + 5, 4, 7, '#8a3a2a'); px(c, bx, y + 5, 4, 1, '#b85a3a'); px(c, bx + 1, y + 7, 2, 2, '#e8d8b0');
    }
    px(c, x + 3, y - 2, 4, 7, '#7a3424'); px(c, x + 3, y - 2, 4, 1, '#a84a32'); px(c, x + 4, y, 2, 2, '#e8d8b0');
    px(c, x + 9, y - 1, 4, 6, '#7a3424'); px(c, x + 10, y + 1, 2, 2, '#e8d8b0');
  });

  // The channel headgate: stone posts, a wooden gate board and a winding wheel.
  def('co_sluice', { w: 2 }, (c, x, y, p, t, o) => {
    px(c, x, y - 10, 5, 25, p.stone[0]); px(c, x + 27, y - 10, 5, 25, p.stone[0]);
    px(c, x, y - 10, 5, 2, p.stone[1]); px(c, x + 27, y - 10, 5, 2, p.stone[1]);
    px(c, x + 2, y - 12, 28, 3, p.wood[2]);
    const up = o.open ? 6 : 0;
    px(c, x + 5, y - 6 - up, 22, 14, p.wood[1]);
    for (let i = 0; i < 3; i++) px(c, x + 5, y - 3 - up + i * 4, 22, 1, p.wood[2]);
    c.strokeStyle = '#4a3a30'; c.lineWidth = 1.5;
    c.beginPath(); c.arc(x + 16, y - 16, 5, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.moveTo(x + 11, y - 16); c.lineTo(x + 21, y - 16); c.moveTo(x + 16, y - 21); c.lineTo(x + 16, y - 11); c.stroke();
  });

  // Charred roof beam propped against a wall.
  def('co_beam', { w: 2 }, (c, x, y, p) => {
    shadow(c, x, y, 30);
    c.save(); c.translate(x + 16, y + 6); c.rotate(-0.18);
    px(c, -15, -3, 30, 6, '#5a4232');
    px(c, -15, -3, 30, 1, '#7a5a42');
    px(c, -2, -3, 17, 6, '#241814');
    for (let i = 0; i < 5; i++) px(c, 1 + i * 3, -2 + (i % 2), 2, 1, '#3a2a22');
    px(c, 3, 1, 3, 1, '#5a2a1a');
    c.restore();
  });

  // A glass furnace with a glowing mouth.
  def('co_furnace', { w: 2, h: 2, light: 40 }, (c, x, y, p, t) => {
    shadow(c, x, y + 16, 30);
    px(c, x + 2, y - 6, 28, 36, '#6a5048'); px(c, x + 2, y - 6, 28, 3, '#8a6a5a');
    px(c, x + 12, y - 16, 8, 10, '#5a4038');
    const f = 0.8 + Math.sin(t / 150) * 0.2;
    px(c, x + 9, y + 10, 14, 10, '#2a1410');
    c.fillStyle = `rgba(255,${140 + Math.round(Math.sin(t / 90) * 30)},60,${f})`; c.fillRect(x + 11, y + 12, 10, 7);
    px(c, x + 13, y + 14, 6, 3, '#ffe0a0');
  });

  // Potter's wheel.
  def('co_wheel', {}, (c, x, y, p, t, o) => {
    shadow(c, x, y, 14);
    px(c, x + 6, y + 7, 4, 7, p.wood[2]);
    c.fillStyle = p.wood[1]; c.beginPath(); c.ellipse(x + 8, y + 7, 7, 3, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#a8785a'; c.beginPath(); c.ellipse(x + 8, y + 5, 3, 2, 0, 0, Math.PI * 2); c.fill();
    px(c, x + 6, y + 1, 4, 4, '#b8886a');
  });

  // Rows of sake flasks (tokkuri) on a plank — thirty of them, give or take.
  def('co_flasks', { w: 2 }, (c, x, y, p) => {
    px(c, x, y + 10, 32, 3, p.wood[1]); px(c, x + 1, y + 13, 2, 2, p.wood[2]); px(c, x + 29, y + 13, 2, 2, p.wood[2]);
    for (let r = 0; r < 2; r++) for (let i = 0; i < 7; i++) {
      const fx = x + 1 + i * 4 + r * 2, fy = y + 1 + r * 4;
      px(c, fx, fy + 3, 3, 5, r ? '#c8b89a' : '#d8c8a8'); px(c, fx + 1, fy + 1, 1, 2, '#b8a888'); px(c, fx, fy + 4, 3, 1, '#8a6a4a');
    }
  });

  // An instruction tile from the kiln wall, fallen and cracked.
  def('co_tablet', { block: false }, (c, x, y) => {
    px(c, x + 3, y + 6, 10, 8, '#8a6a5a'); px(c, x + 3, y + 6, 10, 1, '#a8887a');
    for (let i = 0; i < 3; i++) px(c, x + 5, y + 8 + i * 2, 6 - i, 1, '#3a2620');
    px(c, x + 9, y + 6, 1, 3, '#4a3028');
  });

  // The kiln's control wall: two dampers (vents) and a carved panel.
  def('co_kilnwall', { w: 3 }, (c, x, y, p, t, o) => {
    px(c, x, y - 14, 48, 29, '#5a4038'); px(c, x, y - 14, 48, 2, '#7a5a4a');
    for (let i = 0; i < 2; i++) {
      const vx = x + 5 + i * 30;
      px(c, vx, y - 8, 10, 8, '#1a0e0a');
      px(c, vx, y - 8 + (o.open ? 6 : 0), 10, 3, '#8a7a6a');
    }
    px(c, x + 17, y - 10, 13, 16, '#c8b8a0');
    for (let i = 0; i < 5; i++) px(c, x + 19, y - 8 + i * 3, i === 2 && !o.fixed ? 3 : 9, 1, '#4a3a30');
  });

  // Glass seal fused over a doorway (still faintly warm).
  def('co_seal', {}, (c, x, y, p, t, o) => {
    const g = 0.5 + Math.sin(t / 700) * 0.15;
    c.fillStyle = `rgba(143,184,176,${0.75})`; c.fillRect(x + 2, y - 4, 12, 19);
    px(c, x + 2, y - 4, 12, 1, '#c8e8e0');
    c.fillStyle = `rgba(255,150,80,${g * 0.35})`; c.fillRect(x + 4, y + 4, 8, 8);
    px(c, x + 5, y - 1, 1, 6, '#f0fffa'); px(c, x + 6, y - 2, 3, 1, '#f0fffa');
    if (o.cracked) { c.strokeStyle = '#f8ffff'; c.lineWidth = 1; c.beginPath(); c.moveTo(x + 3, y); c.lineTo(x + 8, y + 5); c.lineTo(x + 6, y + 10); c.lineTo(x + 13, y + 14); c.stroke(); }
  });

  // A block of stored ice packed in straw.
  def('co_iceblock', { light: 10 }, (c, x, y) => {
    shadow(c, x, y, 14);
    px(c, x + 1, y + 10, 14, 4, '#c8a860');
    px(c, x + 2, y + 1, 12, 11, '#bcdcf0'); px(c, x + 2, y + 1, 12, 2, '#e8f6ff');
    px(c, x + 4, y + 4, 1, 5, '#f4fbff'); px(c, x + 10, y + 6, 2, 1, '#9cc0d8');
    px(c, x + 1, y + 11, 3, 1, '#e0c878'); px(c, x + 11, y + 12, 3, 1, '#e0c878');
  });

  // Strings of dried persimmons (hoshigaki), hung high under the eaves.
  def('co_hoshigaki', { w: 2, block: false }, (c, x, y) => {
    px(c, x + 1, y - 14, 30, 1, '#6a4a3a');
    for (let s = 0; s < 4; s++) {
      const sx = x + 4 + s * 8;
      px(c, sx, y - 13, 1, 16, '#a8905a');
      for (let i = 0; i < 4; i++) { px(c, sx - 2, y - 12 + i * 4, 5, 3, i % 2 ? '#c86a2a' : '#b85a22'); px(c, sx - 1, y - 12 + i * 4, 2, 1, '#e08a4a'); }
    }
  });

  // An exposed cut in a terrace wall: layers of soil with one black band of old ash.
  def('co_ashband', {}, (c, x, y, p) => {
    px(c, x, y, 16, 16, '#8e7462');
    px(c, x, y, 16, 3, p.grass[3]);
    px(c, x, y + 3, 16, 3, '#a18772');
    px(c, x, y + 7, 16, 3, '#1e1614');
    px(c, x + 3, y + 8, 4, 1, '#3a2c28');
    px(c, x, y + 10, 16, 6, '#766050');
    px(c, x + 5, y + 12, 3, 1, '#8e7462');
    px(c, x, y + 15, 16, 1, '#00000050');
  });

  // Dry thorn scrub choking an old firebreak path.
  def('co_scrub', {}, (c, x, y, p, t, o) => {
    shadow(c, x, y, 16);
    c.fillStyle = '#6a4a2a'; c.beginPath(); c.ellipse(x + 8, y + 9, 8, 6, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#9a7040'; c.beginPath(); c.ellipse(x + 7, y + 7, 6, 4, 0, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#4a3020'; c.lineWidth = 1;
    for (let i = 0; i < 6; i++) { const a = i * 1.1 + (o.cx || 0); c.beginPath(); c.moveTo(x + 8, y + 8); c.lineTo(x + 8 + Math.cos(a) * 8, y + 7 + Math.sin(a) * 6); c.stroke(); }
    px(c, x + 3, y + 4, 2, 1, '#c8a060'); px(c, x + 11, y + 6, 2, 1, '#c8a060');
  });

  // Sheaves of cut grass, stacked where a firebreak has been cleared.
  def('co_sheaf', { block: false }, (c, x, y) => {
    px(c, x + 3, y + 5, 3, 9, '#c8a858'); px(c, x + 7, y + 4, 3, 10, '#d8b868'); px(c, x + 11, y + 6, 3, 8, '#b89848');
    px(c, x + 3, y + 9, 11, 1, '#8a6a3a');
  });

  // A glass festival lantern on a short post; o.lit.
  def('co_glasslantern', { light: 30 }, (c, x, y, p, t, o) => {
    px(c, x + 7, y + 3, 2, 12, p.wood[2]);
    px(c, x + 4, y - 6, 8, 2, '#3a2e2a');
    const lit = o.lit !== false;
    const f = 0.8 + Math.sin(t / 260 + (o.cx || 0)) * 0.15;
    c.fillStyle = lit ? `rgba(255,186,90,${f})` : 'rgba(170,200,196,0.8)';
    c.beginPath(); c.ellipse(x + 8, y - 1, 4, 5, 0, 0, Math.PI * 2); c.fill();
    px(c, x + 6, y - 4, 1, 3, '#fff4d8');
  });

  // A heavy bar dropped across a gate from the inside.
  def('co_bar', {}, (c, x, y, p) => {
    px(c, x + 1, y + 1, 3, 14, p.wood[2]); px(c, x + 12, y + 1, 3, 14, p.wood[2]);
    px(c, x, y + 5, 16, 5, p.wood[0]); px(c, x, y + 5, 16, 1, p.wood[3]);
    px(c, x + 6, y + 4, 4, 7, '#4a4a52'); px(c, x + 7, y + 6, 2, 3, '#2a2a30');
  });

  // A plain wooden stage edge / platform front for the festival square.
  def('co_stage', { w: 3, block: false }, (c, x, y, p) => {
    px(c, x, y + 12, 48, 4, p.wood[2]);
    for (let i = 0; i < 48; i += 8) px(c, x + i, y + 12, 1, 4, p.wood[0]);
  });
})(RB.props.P);
