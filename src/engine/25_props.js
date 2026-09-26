/* Props and structures. Each prop draws relative to the top-left pixel of its
 * footprint and may extend upward (height). Depth sorting uses footprint
 * bottom row. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.props = (function () {
  'use strict';
  const { px, hh } = RB.tiles;
  const P = {};
  // def(id, {w,h,block,light}, draw(c,x,y,pal,t,o))
  function def(id, props, draw) {
    P[id] = Object.assign({ id, w: 1, h: 1, block: true }, props, { draw });
  }
  const shadow = (c, x, y, w) => {
    c.fillStyle = 'rgba(0,0,0,0.22)';
    c.beginPath();
    c.ellipse(x + w / 2, y + 14, w / 2 - 1, 2.5, 0, 0, Math.PI * 2);
    c.fill();
  };

  def('tree', {}, (c, x, y, p, t, o) => {
    const v = hh(o.cx, o.cy) % 3;
    shadow(c, x, y + 1, 16);
    px(c, x + 6, y + 6, 4, 9, p.trunk[0]);
    px(c, x + 6, y + 6, 1, 9, p.trunk[1]);
    // layered canopy (round blobs)
    const blob = (cx, cy, r, col) => { c.fillStyle = col; c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.fill(); };
    blob(x + 8, y - 2, 8, p.leaf[3]);
    blob(x + 7, y - 3, 7, p.leaf[0]);
    blob(x + 5 + v, y - 5, 4, p.leaf[1]);
    blob(x + 10, y - 1, 4, p.leaf[1]);
    px(c, x + 5 + v, y - 7, 2, 1, p.leaf[2]);
    px(c, x + 9, y - 4, 2, 1, p.leaf[2]);
  });
  def('orchard', {}, (c, x, y, p, t, o) => {
    shadow(c, x, y + 1, 16);
    px(c, x + 7, y + 5, 3, 10, p.trunk[0]);
    const blob = (cx, cy, r, col) => { c.fillStyle = col; c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.fill(); };
    blob(x + 8, y, 7, p.leaf[3]);
    blob(x + 8, y - 1, 6, p.leaf[0]);
    blob(x + 6, y - 3, 3, p.leaf[1]);
    const fr = p.flower[3];
    for (let i = 0; i < 4; i++) { const r = hh(o.cx, o.cy, i); px(c, x + 3 + (r % 10), y - 5 + ((r >>> 4) % 9), 2, 2, fr); }
  });
  def('pine', {}, (c, x, y, p) => {
    shadow(c, x, y + 1, 14);
    px(c, x + 7, y + 10, 2, 5, p.trunk[0]);
    const tri = (cy, hw, col) => { for (let i = 0; i < 6; i++) px(c, x + 8 - Math.round(hw * (i + 1) / 6), cy + i, Math.round(hw * (i + 1) / 3), 1, col); };
    tri(y - 8, 4, p.leaf[0]);
    tri(y - 3, 6, p.leaf[0]);
    tri(y + 3, 8, p.leaf[3]);
    px(c, x + 6, y - 4, 2, 1, '#ffffffc0');
    px(c, x + 4, y + 2, 3, 1, '#ffffffa0');
  });
  def('deadtree', {}, (c, x, y, p) => {
    px(c, x + 7, y - 2, 2, 17, '#4a3c34');
    px(c, x + 4, y + 1, 3, 1, '#4a3c34');
    px(c, x + 9, y - 1, 4, 1, '#4a3c34');
    px(c, x + 3, y, 1, 2, '#4a3c34');
  });
  def('bush', {}, (c, x, y, p) => {
    shadow(c, x, y, 16);
    c.fillStyle = p.leaf[3]; c.beginPath(); c.ellipse(x + 8, y + 9, 7, 5, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = p.leaf[0]; c.beginPath(); c.ellipse(x + 8, y + 8, 6, 4, 0, 0, Math.PI * 2); c.fill();
    px(c, x + 5, y + 6, 2, 1, p.leaf[2]);
    px(c, x + 10, y + 7, 1, 1, p.leaf[2]);
  });
  def('reeds', {}, (c, x, y, p, t, o) => {
    const sway = o.still ? 0 : Math.round(Math.sin(t / 700 + o.cx) * 1);
    for (let i = 0; i < 5; i++) {
      const bx = x + 1 + i * 3;
      px(c, bx, y + 3, 1, 12, p.reed[2]);
      px(c, bx + sway, y, 1, 4, p.reed[0]);
      px(c, bx + sway, y - 2 + (i % 2), 1, 3, p.reed[1]);
    }
  });
  def('rock', {}, (c, x, y, p) => {
    shadow(c, x, y, 14);
    px(c, x + 3, y + 7, 10, 7, p.stone[2]);
    px(c, x + 4, y + 6, 8, 7, p.stone[0]);
    px(c, x + 5, y + 7, 3, 2, p.stone[1]);
  });
  def('fence', {}, (c, x, y, p, t, o) => {
    px(c, x, y + 6, 16, 2, p.wood[1]);
    px(c, x, y + 10, 16, 2, p.wood[1]);
    px(c, x + 2, y + 4, 2, 11, p.wood[0]);
    px(c, x + 12, y + 4, 2, 11, p.wood[0]);
    px(c, x, y + 12, 16, 1, p.wood[2]);
  });
  def('shelf', {}, (c, x, y, p, t, o) => {
    px(c, x, y - 8, 16, 23, p.wood[2]);
    px(c, x + 1, y - 7, 14, 21, p.wood[0]);
    for (let r = 0; r < 3; r++) {
      px(c, x + 1, y - 1 + r * 6, 14, 1, p.wood[2]);
      for (let i = 0; i < 5; i++) {
        const k = hh(o.cx * 7 + i, o.cy * 3 + r);
        const col = ['#8a3a3a', '#3a5a8a', '#c8a050', '#4a7a4a', '#e8e0c8'][k % 5];
        px(c, x + 2 + i * 3, y - 6 + r * 6, 2, 5, col);
      }
    }
  });
  def('lamppost', { light: 40 }, (c, x, y, p, t) => {
    px(c, x + 7, y - 6, 2, 20, '#3a3440');
    px(c, x + 5, y - 11, 6, 6, '#3a3440');
    const f = 0.85 + Math.sin(t / 300) * 0.1;
    c.fillStyle = `rgba(255,214,120,${f})`;
    c.fillRect(x + 6, y - 10, 4, 4);
    px(c, x + 5, y + 13, 6, 2, '#00000040');
  });
  def('crystal', { light: 28 }, (c, x, y, p, t) => {
    const g = 0.7 + Math.sin(t / 500) * 0.2;
    c.fillStyle = `rgba(140,220,230,${g})`;
    c.beginPath(); c.moveTo(x + 8, y - 6); c.lineTo(x + 12, y + 6); c.lineTo(x + 8, y + 13); c.lineTo(x + 4, y + 6); c.closePath(); c.fill();
    px(c, x + 7, y - 2, 1, 8, '#e8ffff');
  });
  // ---- placeable props -------------------------------------------------------
  def('barrel', {}, (c, x, y, p) => {
    shadow(c, x, y, 12);
    px(c, x + 3, y + 3, 10, 11, p.wood[0]);
    px(c, x + 4, y + 2, 8, 1, p.wood[3]);
    px(c, x + 3, y + 5, 10, 1, '#3a3a3a');
    px(c, x + 3, y + 11, 10, 1, '#3a3a3a');
    px(c, x + 5, y + 3, 1, 11, p.wood[1]);
  });
  def('crate', {}, (c, x, y, p) => {
    shadow(c, x, y, 14);
    px(c, x + 2, y + 2, 12, 12, p.wood[1]);
    px(c, x + 2, y + 2, 12, 1, p.wood[3]);
    px(c, x + 2, y + 13, 12, 1, p.wood[2]);
    px(c, x + 2, y + 2, 1, 12, p.wood[2]);
    px(c, x + 13, y + 2, 1, 12, p.wood[2]);
    for (let i = 0; i < 10; i++) px(c, x + 3 + i, y + 3 + i, 1, 1, p.wood[2]);
  });
  def('sign', {}, (c, x, y, p) => {
    px(c, x + 7, y + 6, 2, 9, p.wood[2]);
    px(c, x + 2, y + 1, 12, 7, p.wood[1]);
    px(c, x + 2, y + 1, 12, 1, p.wood[3]);
    px(c, x + 4, y + 3, 8, 1, p.wood[2]);
    px(c, x + 4, y + 5, 6, 1, p.wood[2]);
  });
  def('signblank', {}, (c, x, y, p) => {
    px(c, x + 7, y + 6, 2, 9, p.wood[2]);
    px(c, x + 2, y + 1, 12, 7, p.wood[1]);
    px(c, x + 2, y + 1, 12, 1, p.wood[3]);
    px(c, x + 5, y + 3, 1, 3, '#00000030');
  });
  def('noticeboard', { w: 2 }, (c, x, y, p) => {
    px(c, x + 3, y + 8, 2, 7, p.wood[2]);
    px(c, x + 27, y + 8, 2, 7, p.wood[2]);
    px(c, x + 1, y - 6, 30, 15, p.wood[0]);
    px(c, x + 3, y - 4, 26, 11, '#d8cca8');
    px(c, x + 5, y - 3, 7, 5, '#f4efe0');
    px(c, x + 14, y - 2, 6, 6, '#efe6d0');
    px(c, x + 22, y - 3, 5, 4, '#f4efe0');
  });
  def('well', { w: 2 }, (c, x, y, p) => {
    shadow(c, x, y, 28);
    px(c, x + 3, y + 5, 26, 9, p.stone[0]);
    px(c, x + 3, y + 5, 26, 2, p.stone[1]);
    px(c, x + 6, y + 6, 20, 2, '#1a2a3a');
    px(c, x + 4, y - 8, 2, 14, p.wood[2]);
    px(c, x + 26, y - 8, 2, 14, p.wood[2]);
    px(c, x + 2, y - 10, 28, 3, p.roof[1]);
    px(c, x + 15, y - 7, 2, 9, '#6a5a4a');
  });
  def('table', { w: 2 }, (c, x, y, p) => {
    shadow(c, x, y, 30);
    px(c, x + 1, y + 2, 30, 8, p.wood[1]);
    px(c, x + 1, y + 2, 30, 1, p.wood[3]);
    px(c, x + 2, y + 10, 2, 5, p.wood[2]);
    px(c, x + 28, y + 10, 2, 5, p.wood[2]);
  });
  def('smalltable', {}, (c, x, y, p) => {
    shadow(c, x, y, 14);
    px(c, x + 1, y + 3, 14, 7, p.wood[1]);
    px(c, x + 1, y + 3, 14, 1, p.wood[3]);
    px(c, x + 2, y + 10, 2, 5, p.wood[2]);
    px(c, x + 12, y + 10, 2, 5, p.wood[2]);
  });
  def('teaset', { block: true }, (c, x, y, p) => {
    shadow(c, x, y, 14);
    px(c, x + 1, y + 3, 14, 7, p.wood[1]);
    px(c, x + 2, y + 10, 2, 5, p.wood[2]);
    px(c, x + 12, y + 10, 2, 5, p.wood[2]);
    px(c, x + 4, y + 1, 3, 3, '#e8e4d8');
    px(c, x + 9, y + 1, 3, 3, '#e8e4d8');
    px(c, x + 5, y + 1, 1, 1, '#7a9a5a');
  });
  def('chair', { block: true }, (c, x, y, p) => {
    px(c, x + 4, y + 1, 8, 2, p.wood[2]);
    px(c, x + 4, y + 3, 1, 6, p.wood[2]);
    px(c, x + 11, y + 3, 1, 6, p.wood[2]);
    px(c, x + 4, y + 8, 8, 2, p.wood[1]);
    px(c, x + 4, y + 10, 1, 4, p.wood[2]);
    px(c, x + 11, y + 10, 1, 4, p.wood[2]);
  });
  def('bed', { h: 2 }, (c, x, y, p) => {
    px(c, x + 1, y, 14, 30, p.wood[2]);
    px(c, x + 2, y + 1, 12, 6, '#f0ece0');
    px(c, x + 2, y + 7, 12, 22, '#6a8ab0');
    px(c, x + 2, y + 7, 12, 2, '#8aaad0');
  });
  def('counter', { w: 3 }, (c, x, y, p) => {
    px(c, x, y + 1, 48, 14, p.wood[0]);
    px(c, x, y + 1, 48, 3, p.wood[3]);
    px(c, x, y + 14, 48, 1, p.wood[2]);
  });
  def('stove', {}, (c, x, y, p, t) => {
    px(c, x + 1, y - 2, 14, 16, '#5a5250');
    px(c, x + 2, y - 1, 12, 3, '#76706c');
    const f = Math.sin(t / 120) > 0 ? '#f0a040' : '#e07830';
    px(c, x + 4, y + 7, 8, 5, '#2a1a14');
    px(c, x + 5, y + 9, 6, 3, f);
  });
  def('pot', {}, (c, x, y, p) => {
    shadow(c, x, y, 12);
    px(c, x + 4, y + 6, 8, 8, '#9a5a3a');
    px(c, x + 5, y + 5, 6, 1, '#b8744a');
    px(c, x + 3, y + 7, 1, 5, '#7a4a2a');
    px(c, x + 12, y + 7, 1, 5, '#7a4a2a');
  });
  def('bottles', {}, (c, x, y, p, t, o) => {
    px(c, x, y - 8, 16, 23, p.wood[2]);
    px(c, x + 1, y - 7, 14, 21, p.wood[0]);
    for (let r = 0; r < 3; r++) {
      px(c, x + 1, y - 1 + r * 6, 14, 1, p.wood[2]);
      for (let i = 0; i < 4; i++) {
        const col = ['#6ab0a0', '#c8a0d0', '#e0c070', '#90c070'][(i + r + o.cx) % 4];
        px(c, x + 2 + i * 3 + 1, y - 6 + r * 6, 1, 1, '#ddd');
        px(c, x + 2 + i * 3, y - 5 + r * 6, 3, 4, col);
        px(c, x + 2 + i * 3, y - 4 + r * 6, 3, 1, o.labels === false ? col : '#f4f0e4');
      }
    }
  });
  def('chest', {}, (c, x, y, p, t, o) => {
    shadow(c, x, y, 14);
    px(c, x + 2, y + 5, 12, 9, p.wood[1]);
    px(c, x + 2, y + 5, 12, 3, o.open ? '#2a1a14' : p.wood[3]);
    px(c, x + 7, y + 7, 2, 3, '#e0c060');
  });
  def('millwheel', { w: 2, h: 2, light: 0 }, (c, x, y, p, t, o) => {
    const cx = x + 16, cy = y + 12, R = 14;
    const ang = o.still ? 0 : t / 1600;
    c.strokeStyle = p.wood[2]; c.lineWidth = 3;
    c.beginPath(); c.arc(cx, cy, R, 0, Math.PI * 2); c.stroke();
    c.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      const a = ang + (i * Math.PI) / 4;
      c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); c.stroke();
      px(c, Math.round(cx + Math.cos(a) * R) - 2, Math.round(cy + Math.sin(a) * R) - 2, 4, 4, p.wood[1]);
    }
    px(c, cx - 2, cy - 2, 4, 4, '#3a3a3a');
  });
  def('boat', { w: 2 }, (c, x, y, p) => {
    c.fillStyle = p.wood[0];
    c.beginPath(); c.moveTo(x, y + 6); c.lineTo(x + 32, y + 6); c.lineTo(x + 27, y + 14); c.lineTo(x + 5, y + 14); c.closePath(); c.fill();
    px(c, x + 2, y + 6, 28, 2, p.wood[3]);
    px(c, x + 12, y + 8, 8, 2, p.wood[2]);
  });
  def('cart', { w: 2 }, (c, x, y, p) => {
    shadow(c, x, y, 30);
    px(c, x + 2, y + 2, 26, 8, p.wood[1]);
    px(c, x + 2, y + 2, 26, 1, p.wood[3]);
    c.fillStyle = p.wood[2]; c.beginPath(); c.arc(x + 8, y + 12, 3.5, 0, 7); c.fill();
    c.beginPath(); c.arc(x + 22, y + 12, 3.5, 0, 7); c.fill();
    px(c, x + 28, y + 6, 4, 1, p.wood[2]);
  });
  def('lantern', { light: 36 }, (c, x, y, p, t) => {
    px(c, x + 6, y + 4, 4, 10, p.wood[2]);
    px(c, x + 4, y - 2, 8, 7, '#3a2e2a');
    const f = 0.8 + Math.sin(t / 260) * 0.15;
    c.fillStyle = `rgba(255,200,110,${f})`;
    c.fillRect(x + 5, y - 1, 6, 5);
  });
  def('deadlantern', {}, (c, x, y, p) => {
    px(c, x + 6, y + 4, 4, 10, p.wood[2]);
    px(c, x + 4, y - 2, 8, 7, '#3a2e2a');
    px(c, x + 5, y - 1, 6, 5, '#5a5660');
  });
  def('shrine', { w: 2, light: 30 }, (c, x, y, p, t, o) => {
    shadow(c, x, y, 28);
    px(c, x + 4, y - 2, 24, 16, p.stone[0]);
    px(c, x + 2, y - 6, 28, 4, p.roof[1]);
    px(c, x + 6, y - 9, 20, 3, p.roof[0]);
    const lit = o.lit !== false;
    px(c, x + 12, y + 2, 8, 8, lit ? '#ffd27a' : '#4a4650');
  });
  def('bell', { w: 2, h: 2 }, (c, x, y, p) => {
    px(c, x + 2, y - 8, 28, 3, p.wood[2]);
    px(c, x + 3, y - 5, 2, 36, p.wood[2]);
    px(c, x + 27, y - 5, 2, 36, p.wood[2]);
    c.fillStyle = '#8a7a4a';
    c.beginPath(); c.moveTo(x + 10, y); c.lineTo(x + 22, y); c.lineTo(x + 25, y + 18); c.lineTo(x + 7, y + 18); c.closePath(); c.fill();
    px(c, x + 12, y + 2, 2, 12, '#b8a468');
  });
  def('telescope', {}, (c, x, y, p) => {
    px(c, x + 7, y + 6, 2, 9, '#4a4a52');
    px(c, x + 4, y + 13, 8, 2, '#4a4a52');
    c.save(); c.translate(x + 8, y + 5); c.rotate(-0.6);
    c.fillStyle = '#a88a4a'; c.fillRect(-8, -2, 16, 4); c.fillStyle = '#d8c080'; c.fillRect(-8, -2, 3, 4);
    c.restore();
  });
  def('kiln', { w: 3, h: 2 }, (c, x, y, p, t, o) => {
    c.fillStyle = '#7a5a4a';
    c.beginPath(); c.moveTo(x + 2, y + 30); c.lineTo(x + 6, y - 6); c.quadraticCurveTo(x + 24, y - 22, x + 42, y - 6); c.lineTo(x + 46, y + 30); c.closePath(); c.fill();
    px(c, x + 18, y + 14, 12, 16, o.sealed ? '#5a4a42' : '#2a1410');
    if (!o.sealed) px(c, x + 20, y + 20, 8, 8, '#f08a3a');
    if (o.sealed) { px(c, x + 17, y + 12, 14, 2, '#8fb8b0'); px(c, x + 23, y + 12, 2, 18, '#8fb8b0'); }
  });
  def('bookpile', {}, (c, x, y, p) => {
    px(c, x + 3, y + 10, 10, 3, '#8a3a3a');
    px(c, x + 4, y + 7, 9, 3, '#3a5a8a');
    px(c, x + 3, y + 4, 10, 3, '#c8a050');
    px(c, x + 3, y + 10, 10, 1, '#e8e0c8');
  });
  def('desk', { w: 2 }, (c, x, y, p) => {
    shadow(c, x, y, 30);
    px(c, x + 1, y + 1, 30, 9, p.wood[2]);
    px(c, x + 2, y + 2, 28, 7, p.wood[0]);
    px(c, x + 6, y + 3, 8, 5, '#f0ead8');
    px(c, x + 20, y + 2, 2, 5, '#2a2a3a');
    px(c, x + 2, y + 10, 2, 5, p.wood[2]);
    px(c, x + 28, y + 10, 2, 5, p.wood[2]);
  });
  def('pillar', {}, (c, x, y, p) => {
    px(c, x + 3, y - 16, 10, 30, p.stone[0]);
    px(c, x + 3, y - 16, 2, 30, p.stone[1]);
    px(c, x + 11, y - 16, 2, 30, p.stone[2]);
    px(c, x + 1, y - 18, 14, 3, p.stone[1]);
    px(c, x + 1, y + 12, 14, 3, p.stone[2]);
  });
  def('stairs', { block: false }, (c, x, y, p) => {
    for (let i = 0; i < 4; i++) px(c, x + 1, y + i * 4, 14, 3, i % 2 ? p.stone[1] : p.stone[0]);
    px(c, x + 1, y, 14, 16, 'rgba(0,0,0,0.1)');
  });
  def('mat', { block: false }, (c, x, y) => {
    px(c, x + 2, y + 5, 12, 7, '#8a5a3a');
    px(c, x + 3, y + 6, 10, 5, '#a8744a');
  });
  def('bench', { w: 2 }, (c, x, y, p) => {
    px(c, x + 1, y + 6, 30, 3, p.wood[1]);
    px(c, x + 1, y + 6, 30, 1, p.wood[3]);
    px(c, x + 3, y + 9, 2, 5, p.wood[2]);
    px(c, x + 27, y + 9, 2, 5, p.wood[2]);
  });
  def('flowerpot', {}, (c, x, y, p) => {
    px(c, x + 4, y + 8, 8, 6, '#b06a44');
    px(c, x + 5, y + 4, 2, 4, p.leaf[1]);
    px(c, x + 9, y + 3, 2, 5, p.leaf[1]);
    px(c, x + 4, y + 2, 3, 3, p.flower[1]);
    px(c, x + 9, y + 1, 3, 3, p.flower[0]);
  });
  def('laundry', { w: 3, block: false }, (c, x, y, p) => {
    px(c, x + 1, y - 10, 1, 24, p.wood[2]);
    px(c, x + 46, y - 10, 1, 24, p.wood[2]);
    px(c, x + 1, y - 9, 46, 1, '#e8e0d0');
    px(c, x + 6, y - 8, 7, 9, '#c86a5a');
    px(c, x + 18, y - 8, 9, 7, '#e8e4d8');
    px(c, x + 32, y - 8, 8, 10, '#5a7ab0');
  });
  def('anvil', {}, (c, x, y) => {
    px(c, x + 2, y + 5, 12, 3, '#4a4a52');
    px(c, x + 5, y + 8, 6, 3, '#3a3a42');
    px(c, x + 3, y + 11, 10, 3, '#4a4a52');
  });
  def('hay', {}, (c, x, y) => {
    c.fillStyle = '#d8b858'; c.beginPath(); c.ellipse(x + 8, y + 9, 7, 6, 0, 0, 7); c.fill();
    px(c, x + 3, y + 7, 10, 1, '#b89838');
  });
  def('stump', {}, (c, x, y, p) => {
    px(c, x + 3, y + 7, 10, 7, p.trunk[0]);
    c.fillStyle = p.wood[3]; c.beginPath(); c.ellipse(x + 8, y + 7, 5, 2, 0, 0, 7); c.fill();
  });
  def('campfire', { light: 44 }, (c, x, y, p, t) => {
    px(c, x + 3, y + 11, 10, 2, '#5a3a24');
    const f = Math.sin(t / 90);
    c.fillStyle = '#f09a3a'; c.beginPath(); c.moveTo(x + 4, y + 12); c.lineTo(x + 8, y + 2 + f); c.lineTo(x + 12, y + 12); c.fill();
    c.fillStyle = '#ffe07a'; c.beginPath(); c.moveTo(x + 6, y + 12); c.lineTo(x + 8, y + 6 - f); c.lineTo(x + 10, y + 12); c.fill();
  });
  def('tent', { w: 2 }, (c, x, y) => {
    c.fillStyle = '#b8805a'; c.beginPath(); c.moveTo(x + 2, y + 14); c.lineTo(x + 16, y - 6); c.lineTo(x + 30, y + 14); c.fill();
    c.fillStyle = '#3a2a20'; c.beginPath(); c.moveTo(x + 12, y + 14); c.lineTo(x + 16, y + 4); c.lineTo(x + 20, y + 14); c.fill();
  });
  def('statue', {}, (c, x, y, p) => {
    px(c, x + 3, y + 10, 10, 5, p.stone[2]);
    px(c, x + 5, y - 2, 6, 12, p.stone[0]);
    px(c, x + 6, y - 6, 4, 4, p.stone[0]);
    px(c, x + 5, y - 2, 1, 12, p.stone[1]);
  });
  def('glassware', {}, (c, x, y) => {
    px(c, x + 2, y + 8, 12, 6, '#6a4a3a');
    px(c, x + 3, y + 3, 3, 5, '#9fd8d0');
    px(c, x + 7, y + 1, 2, 7, '#c8e8f0');
    px(c, x + 10, y + 4, 3, 4, '#e8c8a0');
  });
  def('loom', { w: 2 }, (c, x, y, p) => {
    px(c, x + 2, y - 6, 2, 20, p.wood[2]);
    px(c, x + 28, y - 6, 2, 20, p.wood[2]);
    px(c, x + 2, y - 6, 28, 2, p.wood[2]);
    for (let i = 0; i < 12; i++) px(c, x + 5 + i * 2, y - 4, 1, 14, i % 3 ? '#c8a0a0' : '#8a5a7a');
  });
  def('mailbox', {}, (c, x, y, p) => {
    px(c, x + 7, y + 6, 2, 9, p.wood[2]);
    px(c, x + 3, y, 10, 7, '#a0443a');
    px(c, x + 5, y + 2, 6, 1, '#2a1a1a');
  });
  def('stone_marker', {}, (c, x, y, p) => {
    px(c, x + 4, y - 2, 8, 16, p.stone[0]);
    px(c, x + 5, y - 4, 6, 2, p.stone[0]);
    px(c, x + 6, y + 1, 4, 1, p.stone[2]);
    px(c, x + 6, y + 4, 4, 1, p.stone[2]);
    px(c, x + 6, y + 7, 3, 1, p.stone[2]);
  });
  def('pier', { block: false }, (c, x, y, p) => {
    px(c, x, y, 16, 16, p.wood[1]);
    for (let i = 0; i < 16; i += 4) px(c, x, y + i, 16, 1, p.wood[2]);
    px(c, x + 1, y + 14, 2, 2, p.wood[2]);
  });
  def('net', { w: 2 }, (c, x, y) => {
    for (let i = 0; i < 8; i++) px(c, x + 2 + i * 4, y + 2, 1, 12, '#8a8070');
    for (let j = 0; j < 4; j++) px(c, x + 2, y + 2 + j * 4, 29, 1, '#8a8070');
  });
  def('snowman', {}, (c, x, y) => {
    c.fillStyle = '#f4f8fc'; c.beginPath(); c.arc(x + 8, y + 10, 5, 0, 7); c.fill();
    c.beginPath(); c.arc(x + 8, y + 2, 3.5, 0, 7); c.fill();
    px(c, x + 7, y + 1, 1, 1, '#222'); px(c, x + 9, y + 1, 1, 1, '#222'); px(c, x + 8, y + 3, 2, 1, '#e08040');
  });
  def('sparkle', { block: false, light: 18 }, (c, x, y, p, t) => {
    const a = (Math.sin(t / 240) + 1) / 2;
    c.fillStyle = `rgba(255,240,180,${0.4 + a * 0.6})`;
    c.fillRect(x + 7, y + 4, 2, 8);
    c.fillRect(x + 4, y + 7, 8, 2);
  });
  def('ink', { block: false }, (c, x, y, p, t) => {
    const a = (Math.sin(t / 400) + 1) / 2;
    c.fillStyle = `rgba(30,24,60,${0.5 + a * 0.3})`;
    c.beginPath(); c.ellipse(x + 8, y + 10, 6, 3, 0, 0, 7); c.fill();
  });
  // Water drawn over another tile (e.g. a gap in a bridge); blocks while present.
  def('water', {}, (c, x, y, p, t) => {
    px(c, x, y, 16, 16, p.water[0]);
    px(c, x + (((t / 200) | 0) % 12), y + 6, 3, 1, p.water[2]);
  });
  def('door', { block: false }, (c, x, y, p) => {
    px(c, x + 3, y, 10, 16, '#3a2a20');
    px(c, x + 4, y + 1, 8, 15, p.wood[0]);
    px(c, x + 10, y + 8, 1, 2, '#e0c060');
  });
  def('exitmat', { block: false }, (c, x, y) => {
    px(c, x + 2, y + 10, 12, 6, '#7a5236');
    px(c, x + 3, y + 11, 10, 4, '#9a6a44');
  });
  def('hole', { block: false }, (c, x, y) => {
    c.fillStyle = '#0a0a10'; c.beginPath(); c.ellipse(x + 8, y + 9, 6, 4, 0, 0, 7); c.fill();
  });

  // ---- Buildings -------------------------------------------------------------
  // House: footprint w×h tiles; bottom row is the wall face; rows above are roof.
  // roof: 'thatch'|'tile'|'slate'|'snow'|'glass'|'indigo'; wall: palette wall or 'wood'|'stone'
  function drawHouse(c, x, y, pal, t, o) {
    const W = o.w * 16, H = o.h * 16;
    const wallH = 20;
    const roofBottom = y + H - wallH;
    const roofCol = o.roofCols || ({
      thatch: ['#b89a58', '#9c7e42', '#7a5f2e', '#d4b872'],
      tile: pal.roof, slate: ['#56606e', '#444c58', '#323842', '#707a88'],
      snow: ['#e8eef4', '#cdd8e2', '#8a96a4', '#ffffff'], indigo: ['#4c4a78', '#3a3860', '#2a2848', '#6e6ca0'],
      ash: ['#6e5a52', '#54443e', '#3c302c', '#8e7870'], glass: ['#8fb8b0', '#6f9890', '#4f7870', '#c8e8e0'],
    }[o.roof || 'tile'] || pal.roof);
    const wallCol = o.wall === 'wood' ? [pal.wood[1], pal.wood[0], pal.wood[2]] : o.wall === 'stone' ? [pal.stone[1], pal.stone[0], pal.stone[2]] : pal.wall;
    // shadow
    c.fillStyle = 'rgba(0,0,0,0.25)';
    c.fillRect(x + 2, y + H - 2, W, 4);
    // wall
    px(c, x + 1, roofBottom, W - 2, wallH, wallCol[0]);
    px(c, x + 1, y + H - 3, W - 2, 3, wallCol[2]);
    if (o.wall === 'wood') for (let i = 0; i < W; i += 6) px(c, x + 1 + i, roofBottom, 1, wallH, wallCol[2]);
    else for (let i = 8; i < W - 4; i += 16) px(c, x + i, roofBottom + 2, 2, wallH - 4, wallCol[1]);
    // roof with bands
    const roofTop = y - 6;
    const rh = roofBottom - roofTop;
    px(c, x - 2, roofTop, W + 4, rh + 2, roofCol[2]);
    for (let r = 0; r < rh; r += 4) px(c, x - 1, roofTop + r + 1, W + 2, 3, r % 8 ? roofCol[0] : roofCol[1]);
    px(c, x - 2, roofTop, W + 4, 2, roofCol[3]);
    px(c, x - 2, roofBottom, W + 4, 2, roofCol[2]);
    if (o.roof === 'thatch') for (let i = 0; i < W + 2; i += 3) px(c, x - 1 + i, roofBottom + 1, 1, 2, roofCol[1]);
    if (o.roof === 'snow') { px(c, x - 2, roofTop, W + 4, 5, '#ffffff'); px(c, x - 2, roofBottom, W + 4, 2, '#ffffff'); }
    if (o.chimney) {
      px(c, x + W - 14, roofTop - 8, 6, 10, '#6a5a52');
      if (!RB.game || !RB.game.reducedMotion()) {
        const s = (t / 900) % 1;
        c.fillStyle = `rgba(230,230,230,${0.5 - s * 0.5})`;
        c.beginPath(); c.arc(x + W - 11 + s * 3, roofTop - 10 - s * 10, 2 + s * 3, 0, 7); c.fill();
      }
    }
    // door
    if (o.door != null) {
      const dx = x + o.door * 16;
      px(c, dx + 3, y + H - 17, 10, 17, '#2a1e18');
      px(c, dx + 4, y + H - 16, 8, 16, o.doorCol || pal.wood[0]);
      px(c, dx + 10, y + H - 9, 1, 2, '#e0c060');
      px(c, dx + 2, y + H - 18, 12, 2, pal.wood[2]);
    }
    // windows
    const night = o.night;
    (o.windows || []).forEach((wx) => {
      const wxp = x + wx * 16 + 3;
      px(c, wxp, roofBottom + 4, 10, 8, '#3a2e28');
      px(c, wxp + 1, roofBottom + 5, 8, 6, night || o.lit ? '#ffd27a' : '#9ab8c8');
      px(c, wxp + 4, roofBottom + 5, 1, 6, '#3a2e28');
      px(c, wxp + 1, roofBottom + 8, 8, 1, '#3a2e28');
    });
    if (o.sign) {
      px(c, x + (o.signX != null ? o.signX : 0) * 16 + 2, roofBottom - 2, 12, 8, pal.wood[1]);
      px(c, x + (o.signX != null ? o.signX : 0) * 16 + 2, roofBottom - 2, 12, 1, pal.wood[3]);
    }
  }
  function drawTower(c, x, y, pal, t, o) {
    const W = o.w * 16, H = o.h * 16;
    px(c, x + 2, y - 20, W - 4, H + 20, pal.stone[0]);
    px(c, x + 2, y - 20, 3, H + 20, pal.stone[1]);
    px(c, x + W - 5, y - 20, 3, H + 20, pal.stone[2]);
    c.fillStyle = (o.roofCols || pal.roof)[1];
    c.beginPath(); c.moveTo(x - 2, y - 18); c.lineTo(x + W / 2, y - 40); c.lineTo(x + W + 2, y - 18); c.fill();
    px(c, x + W / 2 - 4, y - 10, 8, 10, '#ffd27a');
    if (o.door != null) px(c, x + o.door * 16 + 3, y + H - 17, 10, 17, '#2a1e18');
  }
  const STRUCT = { house: drawHouse, tower: drawTower };

  return { P, STRUCT, shadow };
})();
