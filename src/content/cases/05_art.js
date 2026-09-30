/* Cases and refined sequences: props and keepsake art. All procedural and
 * original (docs/addendum/cases.md). Props draw in logical pixels (a tile is
 * 16×16; the renderer scales them like the chapters' own custom props).
 * Keepsake art draws into a 32×32 pixel grid (artSize 32). */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const P = RB.props.P;
  const px = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  const def = (id, o, draw) => (P[id] = Object.assign({ id, w: 1, h: 1, block: true }, o, { draw }));
  const shadow = (c, x, y, w) => { c.fillStyle = 'rgba(0,0,0,0.2)'; c.beginPath(); c.ellipse(x + w / 2, y + 14, w / 2 - 1, 2.5, 0, 0, Math.PI * 2); c.fill(); };

  // River Warehouse: a low shelf for parcels nobody has claimed (o.parcel: one still waits)
  def('cs_shelf', {}, (c, x, y, p, t, o) => {
    px(c, x + 1, y - 2, 14, 16, p.wood[2]);
    px(c, x + 2, y - 1, 12, 14, p.wood[0]);
    px(c, x + 2, y + 5, 12, 1, p.wood[3]);
    px(c, x + 3, y + 1, 4, 4, '#c8b48a'); px(c, x + 9, y + 8, 4, 4, '#b8a47a');
    if (o && o.parcel) {
      px(c, x + 8, y + 1, 5, 4, '#d8c49a');
      px(c, x + 10, y + 1, 1, 4, '#7a4a2a');
      px(c, x + 8, y + 3, 5, 1, '#7a4a2a');
      px(c, x + 10, y + 3, 1, 1, '#a83e27');
    }
    px(c, x + 1, y + 13, 14, 1, 'rgba(0,0,0,0.25)');
  });

  // Saltglass quay: the repair workbench, its front edge notched at even spacing (3×1).
  // o.label: the old address label pinned above it (after the delivery).
  def('cs_workbench', { w: 3 }, (c, x, y, p, t, o) => {
    shadow(c, x, y, 48);
    px(c, x + 1, y + 2, 46, 8, p.wood[2]);
    px(c, x + 2, y + 3, 44, 6, p.wood[1]);
    for (let i = 0; i < 9; i++) px(c, x + 4 + i * 5, y + 8, 2, 2, '#3a2a1a'); // the notches
    px(c, x + 3, y + 10, 2, 5, p.wood[2]); px(c, x + 43, y + 10, 2, 5, p.wood[2]);
    // a coil of rope and a cracked float
    c.strokeStyle = '#b89a5a'; c.lineWidth = 1.5; c.beginPath(); c.arc(x + 11, y + 4, 3, 0, 7); c.stroke();
    c.fillStyle = '#7fb0c0'; c.beginPath(); c.arc(x + 32, y + 3, 3, 0, 7); c.fill();
    px(c, x + 32, y + 1, 1, 3, '#2e4a58');
    if (o && o.label) { px(c, x + 20, y - 6, 8, 6, '#efe4c8'); px(c, x + 21, y - 4, 6, 1, '#6a5a44'); px(c, x + 21, y - 2, 4, 1, '#6a5a44'); px(c, x + 23, y - 7, 2, 2, '#a83e27'); }
  });
  // the ferry's call bell on its post
  def('cs_bellpost', {}, (c, x, y, p, t, o) => {
    shadow(c, x + 4, y, 8);
    px(c, x + 7, y - 10, 2, 24, p.wood[2]);
    px(c, x + 7, y - 10, 6, 2, p.wood[2]);
    const sw = RB.game && RB.game.reducedMotion && RB.game.reducedMotion() ? 0 : Math.round(Math.sin((t || 0) / 900));
    c.fillStyle = (o && o.bright) ? '#e0b85a' : '#b8903e';
    c.beginPath(); c.moveTo(x + 9 + sw, y - 7); c.lineTo(x + 15 + sw, y - 7); c.lineTo(x + 16 + sw, y - 1); c.lineTo(x + 8 + sw, y - 1); c.closePath(); c.fill();
    px(c, x + 11 + sw, y - 9, 2, 2, '#8a6a2a');
    px(c, x + 14 + sw, y - 6, 1, 1, '#5a3a14'); // the notch in its shoulder
  });
  // East beach: the old landing's low stone footing and one post with an iron bracket (2×1)
  def('cs_footing', { w: 2 }, (c, x, y, p) => {
    px(c, x + 1, y + 7, 30, 6, '#8a8478'); px(c, x + 1, y + 7, 30, 1, '#aaa496'); px(c, x + 1, y + 12, 30, 1, '#5e5a52');
    px(c, x + 10, y + 7, 1, 6, '#6e6a60'); px(c, x + 20, y + 7, 1, 6, '#6e6a60');
    px(c, x + 25, y - 8, 3, 16, '#6a5a44'); px(c, x + 25, y - 8, 1, 16, '#8a7a5e');
    px(c, x + 27, y - 6, 4, 1, '#3a3a40'); px(c, x + 30, y - 6, 1, 3, '#3a3a40');
  });
  // Lighthouse window: a sketch on thin paper pinned so the light comes through it
  def('cs_sketchwin', {}, (c, x, y, p, t, o) => {
    px(c, x + 1, y - 12, 14, 14, '#4a4a52');
    px(c, x + 2, y - 11, 12, 12, '#bcd4e0');
    if (!o || !o.gone) {
      px(c, x + 3, y - 10, 10, 9, 'rgba(250,244,226,0.85)');
      px(c, x + 5, y - 7, 1, 4, '#8a8070'); px(c, x + 8, y - 6, 2, 2, '#8a8070'); px(c, x + 11, y - 8, 1, 5, '#8a8070');
      px(c, x + 7, y - 11, 2, 1, '#a83e27');
    } else px(c, x + 7, y - 11, 1, 1, '#8a8070');
  });
  // Star Stair: the framed sketch on a short post by the stone seat
  def('cs_frame', {}, (c, x, y, p) => {
    shadow(c, x + 3, y, 10);
    px(c, x + 7, y - 2, 2, 16, '#6a5a44');
    px(c, x + 2, y - 10, 12, 10, '#5a4a36');
    px(c, x + 3, y - 9, 10, 8, '#f4efe0');
    px(c, x + 4, y - 7, 1, 4, '#6a6258'); px(c, x + 7, y - 6, 2, 2, '#6a6258'); px(c, x + 11, y - 8, 1, 5, '#6a6258');
    px(c, x + 2, y - 11, 12, 1, '#e8e8f0');
  });
  // a flat stone someone keeps clear of snow: a place to stand and look
  def('cs_viewstone', {}, (c, x, y) => {
    shadow(c, x, y, 16);
    c.fillStyle = '#8c8a90'; c.beginPath(); c.ellipse(x + 8, y + 9, 7, 4, 0, 0, 7); c.fill();
    c.fillStyle = '#a8a6ac'; c.beginPath(); c.ellipse(x + 8, y + 8, 6, 3, 0, 0, 7); c.fill();
    px(c, x + 4, y + 5, 8, 1, '#f4f6fa');
  });

  // ---- keepsake art (32×32 pixel grid; drawn crisp, scaled without smoothing) ------------------------------
  const K = (RB.content.keepsakeArt = RB.content.keepsakeArt || {});
  const dot = (c, x, y, col) => px(c, x, y, 1, 1, col);
  K.shell_button = (c) => {
    c.fillStyle = '#f2e6d6'; c.beginPath(); c.arc(16, 16, 11, 0, 7); c.fill();
    c.strokeStyle = '#b89a7a'; c.lineWidth = 1; c.beginPath(); c.arc(16, 16, 11, 0, 7); c.stroke();
    for (let a = 0; a < 7; a++) { const r = a * 0.9 - 2.7; c.strokeStyle = 'rgba(184,154,122,0.7)'; c.beginPath(); c.moveTo(16, 26); c.lineTo(16 + Math.sin(r) * 10, 16 - Math.cos(r) * 9); c.stroke(); }
    px(c, 13, 14, 2, 2, '#6a5040'); px(c, 17, 14, 2, 2, '#6a5040'); px(c, 13, 18, 2, 2, '#6a5040'); px(c, 17, 18, 2, 2, '#6a5040');
    dot(c, 10, 9, '#ffffff'); dot(c, 11, 8, '#ffffff');
  };
  K.clay_swallow = (c) => {
    c.fillStyle = '#b8683e';
    c.beginPath(); c.moveTo(4, 14); c.lineTo(14, 12); c.lineTo(20, 8); c.lineTo(28, 6); c.lineTo(22, 13); c.lineTo(28, 22); c.lineTo(18, 17); c.lineTo(10, 20); c.closePath(); c.fill();
    c.fillStyle = '#8a4a2a'; c.beginPath(); c.moveTo(14, 12); c.lineTo(22, 13); c.lineTo(18, 17); c.closePath(); c.fill();
    px(c, 7, 13, 2, 2, '#2a1a12'); px(c, 3, 14, 2, 1, '#6a3a1e');
    px(c, 6, 17, 6, 1, '#e8c8a8');
    c.fillStyle = 'rgba(0,0,0,0.18)'; c.beginPath(); c.ellipse(16, 27, 10, 2, 0, 0, 7); c.fill();
  };
  K.star_rosette = (c) => {
    const cols = ['#e8c85a', '#f0e0a0', '#c89a3a', '#f4ecd0', '#d8b04a'];
    for (let i = 0; i < 10; i++) {
      const a = i * Math.PI / 5, r = i % 2 ? 7 : 13;
      c.fillStyle = cols[i % cols.length];
      c.beginPath(); c.moveTo(16, 16); c.lineTo(16 + Math.cos(a) * r, 16 + Math.sin(a) * r); c.lineTo(16 + Math.cos(a + Math.PI / 5) * (i % 2 ? 13 : 7), 16 + Math.sin(a + Math.PI / 5) * (i % 2 ? 13 : 7)); c.closePath(); c.fill();
    }
    c.fillStyle = '#6a7ab8'; c.beginPath(); c.arc(16, 16, 3, 0, 7); c.fill();
    px(c, 15, 28, 2, 3, '#a83e27');
  };
  K.thread_spool = (c) => {
    px(c, 9, 5, 14, 3, '#8a6a44'); px(c, 9, 24, 14, 3, '#8a6a44');
    px(c, 11, 8, 10, 16, '#5a7aa8');
    for (let y = 9; y < 24; y += 2) px(c, 11, y, 10, 1, '#7a9ac8');
    px(c, 9, 5, 14, 1, '#aa8a5e'); px(c, 15, 4, 2, 1, '#3a2a1a');
    c.strokeStyle = '#5a7aa8'; c.lineWidth = 1; c.beginPath(); c.moveTo(21, 20); c.quadraticCurveTo(27, 24, 25, 29); c.stroke();
  };
  K.parcel_seal = (c) => {
    c.fillStyle = '#a83e27'; c.beginPath(); c.arc(16, 16, 11, 0, 7); c.fill();
    c.fillStyle = '#c8543a'; c.beginPath(); c.arc(15, 15, 9, 0, 7); c.fill();
    // the bell, with its notch in the right shoulder
    c.fillStyle = '#7a2414'; c.beginPath(); c.moveTo(12, 12); c.lineTo(20, 12); c.lineTo(22, 21); c.lineTo(10, 21); c.closePath(); c.fill();
    px(c, 15, 9, 2, 3, '#7a2414'); px(c, 19, 13, 2, 2, '#c8543a');
    px(c, 11, 22, 10, 1, '#7a2414');
    dot(c, 9, 9, '#f0a080'); dot(c, 10, 8, '#f0a080');
  };
  K.turning_picture = (c) => {
    px(c, 5, 6, 22, 20, '#6a5a44'); px(c, 6, 7, 20, 18, '#f4efe0');
    px(c, 6, 22, 20, 3, '#e4e8f0');
    px(c, 9, 13, 1, 9, '#7a7060'); px(c, 8, 12, 3, 2, '#e8b858');           // the lantern
    px(c, 14, 15, 5, 4, '#8a6a4a'); px(c, 13, 14, 7, 1, '#5a4a3a');         // the shrine
    px(c, 22, 12, 1, 10, '#6a6258'); px(c, 20, 14, 2, 1, '#6a6258'); px(c, 23, 15, 2, 1, '#6a6258'); // the bare tree
    px(c, 7, 23, 2, 1, '#9a9488'); px(c, 8, 22, 1, 1, '#9a9488');           // the pressed leaf
    c.strokeStyle = '#b8a47a'; c.lineWidth = 1; c.beginPath(); c.moveTo(16, 3); c.quadraticCurveTo(26, 1, 28, 6); c.stroke(); // turning arrow
    px(c, 27, 6, 2, 2, '#b8a47a');
  };
})();
