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

  // ---- art-resolution versions (draw2; rules and helpers: src/engine/26–28_*.js) ----
  (function () {
    const A = RB.propArt && RB.propArt.art, K = RB.propKit;
    if (!A) return;
    const kit = RB.propArt.kit, { R, ell, poly, line, cyl, cylCol, streaks, mix, ramp, hh } = K;
    const IR = K.FIX.iron, BR = K.FIX.brass, PP = K.FIX.paper, CL = K.FIX.clay, ST = K.FIX.straw;
    const BRICK = ramp('#6a5048', 0.5, 0.4), LEATHER = ramp('#8a3a2a', 0.45, 0.35), PERSIMMON = ramp('#c86a2a', 0.45, 0.4);
    const cxy = (o) => hh(o.cx | 0, o.cy | 0, 5);
    function bricks(g, x0, y0, w, h, b5, seed) {
      R(g, x0, y0, w, h, b5[1]);
      for (let y = y0, r = 0; y < y0 + h; y += 5, r++) for (let x = x0 - (r % 2) * 5; x < x0 + w; x += 10) {
        const a = Math.max(x, x0), bw = Math.min(x + 9, x0 + w) - a, v = hh(seed, x * 3 + r, 7) % 5;
        if (bw > 0) { R(g, a, y, bw, 4, b5[v === 0 ? 3 : 2]); R(g, a, y, bw, 1, b5[v === 0 ? 4 : 3]); }
      }
    }
    // Fire lookout: four timber legs with cross braces, a ladder, a planked
    // platform under a little roof, the alarm bell (o.rope: a pull-rope).
    A('co_lookout', {
      box: [-8, -150, 80, 218],
      v: (o) => (o.rope ? 1 : 0),
      f: (t, o) => (o.still ? 1 : Math.round(Math.sin(t / 900) * 1) + 1),
      draw(g, M, v, f) {
        const w5 = M.wood, sw = f - 1;
        for (const x of [18, 42]) cyl(g, x, -80, 4, 140, [w5[0], w5[0], w5[1], w5[2], w5[2]]);
        for (let i = 0; i < 4; i++) { const yy = -60 + i * 32; line(g, 10, yy, 54, yy + 24, w5[2], 2); line(g, 54, yy, 10, yy + 24, w5[1], 2); kit.plank(g, 6, yy, 52, 3, w5, i); }
        for (const x of [6, 53]) kit.post(g, x, -88, 5, 148, w5);
        for (let i = 0; i < 16; i++) R(g, 26, -68 + i * 8, 12, 2, w5[3]);
        R(g, 26, -72, 2, 132, w5[2]); R(g, 36, -72, 2, 132, w5[2]);
        kit.plank(g, 0, -92, 64, 6, w5, 9); R(g, 0, -86, 64, 2, w5[0]);
        for (const x of [8, 52]) kit.post(g, x, -118, 4, 26, w5);
        // bell
        const b5 = ramp('#9a7a3a', 0.5, 0.45);
        R(g, 31, -114, 2, 4, IR[2]);
        poly(g, [27 + sw, -110, 37 + sw, -110, 41 + sw, -96, 23 + sw, -96], b5[2]); poly(g, [27 + sw, -110, 30 + sw, -110, 27 + sw, -96, 23 + sw, -96], b5[3]); R(g, 23 + sw, -97, 18, 2, b5[0]);
        if (v) { R(g, 44, -96, 1, 60, '#c8b088'); R(g, 43, -38, 3, 4, '#a8905a'); line(g, 38 + sw, -100, 44, -96, '#c8b088', 1); }
        // roof
        const r5 = M.roof;
        poly(g, [-6, -116, 32, -142, 70, -116], r5[2]); poly(g, [-6, -116, 32, -142, 28, -116], r5[3]);
        for (let y = -136; y < -116; y += 5) R(g, 32 - (y + 142) * 1.46, y, (y + 142) * 2.92, 1, r5[1]);
        R(g, -6, -117, 76, 2, r5[0]); R(g, 31, -146, 2, 5, IR[3]);
      },
      shadow: () => [32, 60, 30, 4, 0.34],
    });
    // Festival seat: a chair with a folded red cloth; o.named adds a glass
    // lantern and a name slip.
    A('co_seat', {
      box: [0, -16, 34, 50],
      v: (o) => (o.named ? 1 : 0),
      f: (t, o) => (o.named ? kit.flick(t, o, 300) : 0),
      draw(g, M, v, f) {
        const w5 = M.wood, rc = ramp('#c8603a', 0.45, 0.35);
        kit.legs(g, [8, 21], 20, 30, w5);
        kit.post(g, 8, 0, 3, 18, w5); kit.post(g, 21, 0, 3, 18, w5);
        kit.plank(g, 7, 0, 18, 3, w5, 2);
        kit.top(g, 6, 15, 20, 4, 2, w5, 7);
        R(g, 9, 12, 14, 5, rc[2]); R(g, 9, 12, 14, 1, rc[4]); R(g, 9, 16, 14, 1, rc[1]); R(g, 16, 12, 1, 5, rc[1]);
        if (v) {
          R(g, 12, -6, 8, 10, '#6a4a3a'); kit.lamp(g, 13, -5, 6, 8, [0, 1, 0, 2][f]);
          R(g, 25, 4, 6, 12, PP[4]); R(g, 25, 4, 6, 1, '#ffffff'); R(g, 27, 6, 2, 8, K.FIX.ink[2]);
        } else { R(g, 14, 8, 4, 4, '#bfe0dc'); R(g, 14, 8, 4, 1, '#e8fffa'); }
      },
      over(g, M, v, f) { if (v) K.halo(g, 16, -1, 10, '#ffbe5a', 0.14); },
      shadow: () => [16, 29, 11, 3, 0.3],
    });
    // Bunting: pennants in festival colours on a sagging line between poles.
    const FLAGS = ['#c8603a', '#e0b050', '#8a4a5a', '#f0e0c0', '#6a8a4a'].map((c) => ramp(c, 0.4, 0.35));
    A('co_bunting', {
      box: [-2, -42, 100, 74],
      v: (o) => (((o.cx | 0) % 5) + 5) % 5,
      draw(g, M, v) {
        const w5 = M.wood;
        kit.post(g, 1, -36, 3, 64, w5); kit.post(g, 92, -36, 3, 64, w5);
        const sag = (x) => -34 + Math.round(Math.sin(((x - 3) / 90) * Math.PI) * 8);
        for (let x = 3; x < 93; x++) R(g, x, sag(x), 1, 1, '#e8dcc0');
        for (let i = 0; i < 13; i++) {
          const fx = 8 + i * 6.6, fy = sag(Math.round(fx)) + 1, c5 = FLAGS[(i + v) % 5];
          poly(g, [fx - 3, fy, fx + 4, fy, fx + 0.5, fy + 9], c5[2]); poly(g, [fx - 3, fy, fx, fy, fx + 0.5, fy + 9], c5[3]);
          R(g, Math.round(fx - 3), fy, 7, 1, c5[4]);
        }
      },
      shadow: (v) => null,
      ground(g) { K.shadow(g, 2, 29, 4, 1.5, 0.3); K.shadow(g, 93, 29, 4, 1.5, 0.3); },
    });
    // Old leather fire buckets on a rack, each painted with a white crest.
    function bucket(g, x, y) {
      for (let r = 0; r < 12; r++) { const w = 8 - (r > 8 ? 1 : 0); for (let i = 0; i < w; i++) R(g, x + i + (8 - w) / 2, y + r, 1, 1, cylCol(i, w, LEATHER)); }
      R(g, x - 1, y, 10, 2, LEATHER[3]); R(g, x - 1, y, 10, 1, LEATHER[4]);
      ell(g, x + 4, y + 6, 2.2, 2.2, '#e8d8b0'); R(g, x + 3, y + 6, 2, 1, LEATHER[2]);
    }
    A('co_buckets', {
      box: [0, -12, 32, 46],
      draw(g, M) {
        const w5 = M.wood;
        kit.post(g, 1, 4, 3, 26, w5); kit.post(g, 28, 4, 3, 26, w5);
        kit.plank(g, 0, 24, 32, 4, w5, 2);
        for (let i = 0; i < 3; i++) bucket(g, 3 + i * 9, 12);
        kit.plank(g, 2, 10, 28, 3, w5, 3);
        bucket(g, 7, -2); bucket(g, 17, -1);
      },
      shadow: () => [16, 29, 14, 3, 0.3],
    });
    // Channel headgate: stone posts, a planked gate board (raised when
    // o.open) and a winding wheel on the beam.
    A('co_sluice', {
      box: [-4, -48, 72, 82],
      v: (o) => (o.open ? 1 : 0),
      draw(g, M, v) {
        const s5 = M.stone, w5 = M.wood, up = v ? 12 : 0;
        for (let i = 0; i < 3; i++) kit.plank(g, 10, -12 - up + i * 9, 44, 9, w5, i + 4);
        R(g, 10, -12 - up, 2, 27, w5[1]); R(g, 52, -12 - up, 2, 27, w5[1]);
        for (const x of [0, 54]) { for (let i = 0; i < 10; i++) R(g, x + i, -20, 1, 50, cylCol(i, 10, s5)); for (let y = -16; y < 30; y += 8) R(g, x, y, 10, 1, s5[1]); R(g, x - 1, -22, 12, 3, s5[3]); R(g, x - 1, -22, 12, 1, s5[4]); }
        kit.plank(g, 4, -26, 56, 5, w5, 1);
        R(g, 31, -38, 2, 12, IR[2]);
        kit.spokeWheel(g, 32, -36, 10, 4, 0.4, ramp('#4a3a30', 0.4, 0.4), 2);
      },
      shadow: () => [32, 30, 30, 3, 0.3],
    });
    // Charred beam propped against a wall: sound timber at one end, burnt
    // to checked charcoal toward the other.
    A('co_beam', {
      box: [-4, -6, 72, 40],
      draw(g, M) {
        const a = -0.18, c = Math.cos(a), s = Math.sin(a), cx = 32, cy = 12;
        const pt = (u, w) => [cx + u * c - w * s, cy + u * s + w * c];
        const quad = (u0, u1, w0, w1, col) => poly(g, [].concat(pt(u0, w0), pt(u1, w0), pt(u1, w1), pt(u0, w1)), col);
        const w5 = ramp('#5a4232', 0.45, 0.4), ch = K.FIX.char;
        quad(-30, 30, -6, 6, w5[2]); quad(-30, 30, -6, -4, w5[4]); quad(-30, 30, 4, 6, w5[0]);
        quad(-4, 30, -6, 6, ch[1]); quad(-4, 30, -6, -4, ch[3]);
        for (let i = 0; i < 6; i++) { const u = 0 + i * 5, w = ((i % 2) * 5) - 3; quad(u, u + 3, w, w + 2, ch[i % 3 === 0 ? 4 : 2]); }
        quad(10, 12, 1, 2, '#8a3a1a');
        for (let i = 0; i < 4; i++) quad(-26 + i * 6, -22 + i * 6, -1, 0, w5[1]);
      },
      shadow: () => [32, 28, 30, 3, 0.3],
    });
    // Glass furnace: a brick body and chimney, a glowing mouth.
    A('co_furnace', {
      box: [-4, -40, 72, 108],
      f: (t, o) => K.frame(t, 150, 4, o.still),
      draw(g, M, v, f) {
        bricks(g, 4, -12, 56, 72, BRICK, 3);
        for (let i = 0; i < 56; i++) if (i < 3 || i > 52) R(g, 4 + i, -12, 1, 72, i < 3 ? 'rgba(255,240,200,0.12)' : 'rgba(22,16,40,0.25)');
        R(g, 2, -14, 60, 4, BRICK[3]); R(g, 2, -14, 60, 1, BRICK[4]);
        bricks(g, 24, -34, 16, 20, BRICK, 5); R(g, 22, -36, 20, 3, BRICK[3]); R(g, 26, -36, 12, 1, '#1a1210');
        R(g, 16, 18, 32, 26, '#231a20'); ell(g, 32, 18, 16, 6, '#231a20');
        const e = K.FIX.ember, k = [2, 3, 2, 1][f];
        R(g, 19, 22, 26, 20, '#2a1410'); R(g, 22, 25, 20, 14, e[k]); R(g, 25, 28, 14, 8, e[Math.min(4, k + 1)]); R(g, 28, 30, 8, 4, e[4]);
        R(g, 14, 44, 36, 4, BRICK[3]); R(g, 14, 44, 36, 1, BRICK[4]);
      },
      over(g, M, v, f) { K.halo(g, 32, 32, 22, '#ff9a40', 0.12 + (f % 2) * 0.04); },
      shadow: () => [32, 60, 30, 4, 0.34],
    });
    // Potter's wheel with a pot half thrown on it. Its text says the clay is still damp: the wheel head is
    // smeared grey with wet slip and the pot is darker, cooler damp clay with a wet sheen, so the potter's
    // one key prop reads against the warm wood floor instead of melting into it (the props balance pass).
    // It stays still: nobody is at the wheel.
    const SLIP = ['#3e3430', '#5e524c', '#7a6e66', '#958a80', '#b4aaa0'];
    const DAMP = ['#3c2822', '#5a3c30', '#7a5442', '#9a6e58', '#cdb5a0'];
    A('co_wheel', {
      box: [0, -6, 32, 40],
      draw(g, M) {
        const w5 = M.wood;
        cyl(g, 12, 16, 8, 14, w5); R(g, 8, 27, 16, 3, w5[1]); R(g, 8, 27, 16, 1, w5[2]);
        ell(g, 16, 14, 14, 5, w5[0]); ell(g, 16, 13, 13, 4, SLIP[1]); ell(g, 16, 12.5, 10, 2.6, SLIP[2]);
        R(g, 5, 12, 6, 1, SLIP[3]); R(g, 22, 15, 6, 1, w5[1]);
        for (let y = 2; y < 13; y++) { const w = 8 + Math.round(Math.sin(((y - 2) / 11) * Math.PI) * 3); for (let i = 0; i < w; i++) R(g, 16 - w / 2 + i, y, 1, 1, cylCol(i, w, DAMP)); }
        ell(g, 16, 2, 4, 1.5, DAMP[0]); R(g, 13, 1, 6, 1, DAMP[3]);
        R(g, 13, 4, 1, 6, DAMP[4]); R(g, 13, 5, 1, 2, '#efe4d4');
        R(g, 11, 12, 10, 1, SLIP[3]);
      },
      shadow: () => [16, 29, 13, 3, 0.3],
    });
    // Rows of sake flasks on a plank, thirty of them, give or take.
    A('co_flasks', {
      box: [-2, -4, 68, 38],
      draw(g, M) {
        const w5 = M.wood;
        kit.legs(g, [3, 58], 24, 30, w5);
        kit.top(g, 0, 18, 64, 4, 2, w5, 3);
        for (let r = 0; r < 2; r++) for (let i = 0; i < 7; i++) {
          const x = 3 + i * 8 + r * 4, y = 2 + r * 6, c5 = ramp((i + r) % 5 === 2 ? '#5a7a9a' : r ? '#c8b89a' : '#d8c8a8', 0.45, 0.35);
          R(g, x + 2, y, 2, 4, c5[1]); R(g, x + 1, y - 1, 4, 1, c5[2]);
          for (let k = 0; k < 7; k++) { const w = k < 2 ? 4 : 6; for (let j = 0; j < w; j++) R(g, x + (6 - w) / 2 + j, y + 4 + k, 1, 1, cylCol(j, w, c5)); }
          R(g, x, y + 8, 6, 1, '#8a6a4a');
        }
      },
      shadow: () => [32, 29, 30, 2.5, 0.28],
    });
    // A fallen instruction tile from the kiln wall, cracked across.
    A('co_tablet', {
      box: [0, 0, 32, 34],
      draw(g) {
        const t5 = ramp('#8a6a5a', 0.45, 0.35);
        poly(g, [5, 12, 27, 11, 28, 25, 4, 26], t5[1]); poly(g, [5, 12, 27, 11, 27, 23, 5, 24], t5[3]);
        R(g, 5, 12, 22, 1, t5[4]);
        for (let i = 0; i < 3; i++) R(g, 8, 15 + i * 3, 13 - i * 2, 1, '#3a2620');
        line(g, 19, 11, 16, 18, t5[0], 1); line(g, 16, 18, 20, 24, t5[0], 1);
      },
      shadow: () => [16, 27, 13, 2, 0.25],
    });
    // Kiln control wall: two dampers (o.open slides their plates down) and a
    // carved instruction panel (a line missing until o.fixed).
    A('co_kilnwall', {
      box: [-2, -34, 100, 68],
      v: (o) => (o.open ? 1 : 0) + (o.fixed ? 2 : 0),
      draw(g, M, v) {
        bricks(g, 0, -28, 96, 58, BRICK, 9); R(g, 0, -30, 96, 3, BRICK[3]); R(g, 0, -30, 96, 1, BRICK[4]);
        for (const vx of [8, 68]) {
          R(g, vx - 1, -17, 22, 18, '#231a20'); R(g, vx, -16, 20, 16, '#1a0e0a');
          const dy = v & 1 ? 12 : 0;
          R(g, vx, -16 + dy, 20, 6, IR[2]); R(g, vx, -16 + dy, 20, 1, IR[4]); R(g, vx + 9, -15 + dy, 2, 3, IR[0]);
        }
        R(g, 33, -22, 28, 34, '#231a20'); R(g, 34, -21, 26, 32, '#c8b8a0'); R(g, 34, -21, 26, 1, '#e8dcc4');
        for (let i = 0; i < 5; i++) R(g, 38, -16 + i * 6, i === 2 && !(v & 2) ? 6 : 18, 2, '#4a3a30');
      },
      shadow: () => [48, 30, 48, 3, 0.3],
    });
    // Glass seal fused over a doorway, still faintly warm (o.cracked).
    A('co_seal', {
      box: [0, -14, 32, 48],
      v: (o) => (o.cracked ? 1 : 0),
      f: (t, o) => K.frame(t, 350, 4, o.still),
      draw(g, M, v, f) {
        const gl = K.FIX.glass;
        R(g, 3, -9, 26, 40, gl[1]); R(g, 4, -8, 24, 38, gl[2]); R(g, 4, -8, 24, 2, gl[4]); R(g, 26, -6, 2, 36, gl[1]);
        R(g, 8, 4, 16, 16, mix(gl[2], '#ff9650', [0.2, 0.28, 0.34, 0.28][f]));
        R(g, 11, 8, 10, 8, mix(gl[3], '#ffb070', [0.25, 0.35, 0.42, 0.35][f]));
        line(g, 8, 26, 14, -4, gl[4], 1); R(g, 9, -4, 2, 10, 'rgba(255,255,255,0.8)');
        if (v) { line(g, 6, 0, 16, 10, '#f8ffff', 1); line(g, 16, 10, 12, 20, '#f8ffff', 1); line(g, 16, 10, 26, 28, '#f8ffff', 1); line(g, 12, 20, 6, 26, '#f8ffff', 1); }
      },
      shadow: () => [16, 30, 13, 2, 0.28],
    });
    // A block of stored ice packed in straw.
    A('co_iceblock', {
      box: [0, -2, 32, 36],
      draw(g) {
        const ic = ['#6a9ab8', '#9cc0d8', '#bcdcf0', '#dcf0fc', '#f8fdff'];
        ell(g, 16, 25, 15, 5, ST[2]); streaks(g, 3, 22, 26, 6, ST[4], 3, 8, 4); streaks(g, 3, 23, 26, 5, ST[1], 4, 6, 3);
        R(g, 5, 4, 22, 6, ic[4]); R(g, 5, 4, 22, 1, '#ffffff');
        for (let i = 0; i < 22; i++) R(g, 5 + i, 10, 1, 15, cylCol(i, 22, ic));
        R(g, 8, 12, 1, 9, '#ffffff'); R(g, 19, 15, 4, 1, ic[1]); R(g, 5, 10, 22, 1, ic[1]);
        for (const x of [4, 12, 22]) { R(g, x, 23, 4, 2, ST[3]); R(g, x + 1, 22, 2, 1, ST[4]); }
      },
      shadow: () => [16, 29, 15, 3, 0.3],
    });
    // Strings of dried persimmons hung from a pole under the eaves.
    A('co_hoshigaki', {
      box: [-2, -36, 68, 50],
      draw(g, M) {
        kit.plank(g, 0, -30, 64, 3, M.wood, 2);
        for (let s = 0; s < 4; s++) {
          const sx = 8 + s * 16;
          R(g, sx, -27, 1, 32, '#a8905a');
          for (let i = 0; i < 4; i++) {
            const y = -24 + i * 8;
            ell(g, sx + 0.5, y + 3.5, 4, 3.5, PERSIMMON[i % 2 ? 2 : 1]); ell(g, sx - 0.5, y + 2.5, 2.4, 2, PERSIMMON[3]); R(g, sx - 1, y + 1, 1, 1, PERSIMMON[4]);
            R(g, sx - 1, y - 1, 3, 1, '#4a3a20');
          }
        }
      },
    });
    // A cut in a terrace wall: soil layers with one black band of old ash.
    A('co_ashband', {
      box: [0, 0, 32, 32], outline: false,
      draw(g, M) {
        const bands = [[3, 5, '#a18772'], [8, 5, '#8e7462'], [13, 5, '#1e1614'], [18, 14, '#766050']];
        R(g, 0, 0, 32, 32, '#8e7462');
        for (const [y, h, c] of bands) { R(g, 0, y, 32, h, c); R(g, 0, y, 32, 1, mix(c, '#ffffff', 0.12)); }
        for (let x = 0; x < 32; x += 3) R(g, x, 0, 2, 3 + (x % 2), M.grass[x % 6 ? 2 : 3]);
        R(g, 6, 15, 8, 1, '#3a2c28'); R(g, 20, 14, 5, 2, '#2a201c');
        for (const [x, y] of [[4, 22], [14, 26], [24, 21], [9, 10]]) { R(g, x, y, 3, 2, '#a89078'); R(g, x, y, 3, 1, '#c0a890'); }
        R(g, 0, 30, 32, 2, 'rgba(22,16,40,0.3)');
      },
    });
    // Dry thorn scrub: a tangled mass of dead leaves and thorny stems.
    const DRY = ['#3a2a18', '#5a4024', '#7a5a32', '#9a7442', '#c09a58'];
    A('co_scrub', {
      box: [-6, -8, 44, 42],
      v: (o) => cxy(o) % 4,
      draw(g, M, v) {
        const cl = [];
        for (let i = 0; i < 5; i++) { const r = hh(v, i, 31); cl.push({ x: 7 + (i % 3) * 9 + (r % 3), y: (i < 3 ? 15 : 21) + ((r >>> 3) % 3), r: 6 + ((r >>> 6) % 3) }); }
        K.foliage(g, cl.sort((a, b) => a.y - b.y), DRY, 30 + v, { ao: 0.4, lobe: 0.3, tex: 0.5 });
        for (let i = 0; i < 7; i++) { const a = i * 0.9 + v, L = 11 + (i % 3) * 2; line(g, 16, 18, 16 + Math.cos(a) * L, 16 + Math.sin(a) * L * 0.75, DRY[0], 1); R(g, Math.round(16 + Math.cos(a) * L * 0.6), Math.round(16 + Math.sin(a) * L * 0.45) - 1, 1, 1, DRY[1]); }
        for (let i = 0; i < 4; i++) { const r = hh(v, i, 37); R(g, 6 + (r % 20), 8 + ((r >>> 5) % 12), 2, 1, '#d8b060'); }
      },
      shadow: () => [16, 28, 15, 3.5, 0.3],
    });
    // Sheaves of cut grass, tied and stood where a firebreak was cleared.
    A('co_sheaf', {
      box: [0, -6, 32, 40],
      v: (o) => cxy(o) % 3,
      draw(g, M, v) {
        for (let k = 0; k < 3; k++) {
          const x = 5 + k * 8 + (v === k ? 1 : 0), top = 6 + ((k + v) % 3) * 2, s5 = k === 1 ? ST : ramp(k ? '#b89848' : '#c8a858', 0.45, 0.35);
          for (let y = top; y < 29; y++) { const spread = y < top + 5 ? Math.round((top + 5 - y) * 0.6) : 0; for (let i = -spread; i < 6 + spread; i++) R(g, x + i, y, 1, 1, s5[((i + y) % 3 === 0) ? 1 : i < 2 ? 3 : 2]); }
          R(g, x, 18, 6, 2, '#8a6a3a'); R(g, x, 18, 6, 1, '#a8844a');
        }
      },
      shadow: () => [16, 29, 13, 3, 0.28],
    });
    // Glass festival lantern on a short post (o.lit === false: unlit).
    A('co_glasslantern', {
      box: [0, -20, 32, 54], ink: true,
      v: (o) => (o.lit === false ? 0 : 1),
      f: (t, o) => (o.lit === false ? 0 : kit.flick(t, o, 260)),
      draw(g, M, v, f) {
        kit.post(g, 14, 4, 4, 26, M.wood);
        R(g, 10, 28, 12, 2, M.wood[1]);
        if (v) { const E = K.FIX.glow, k = [0, 1, 0, 2][f]; ell(g, 16, -3, 8, 9, E[2]); ell(g, 15, -4, 6, 7, E[3 - (k === 2 ? 1 : 0)]); ell(g, 15, -4, 3, 4, E[4 - (k === 1 ? 1 : 0)]); }
        else { const gl = K.FIX.glass; ell(g, 16, -3, 8, 9, gl[2]); ell(g, 15, -4, 6, 7, gl[3]); }
        R(g, 12, -5, 1, 5, '#fff4d8'); R(g, 11, -13, 10, 3, '#3a2e2a'); R(g, 13, -15, 6, 2, '#5a4a3a'); R(g, 12, 5, 8, 2, '#3a2e2a');
      },
      over(g, M, v, f) { if (v) K.halo(g, 16, -3, 13, '#ffbe5a', 0.15 + (f === 1 ? 0.03 : 0)); },
      shadow: () => [16, 30, 8, 2.5, 0.3],
    });
    // A heavy bar dropped across a gate from the inside.
    A('co_bar', {
      box: [-2, -4, 36, 38], ink: true,
      draw(g, M) {
        const w5 = M.wood;
        kit.post(g, 2, 2, 6, 28, w5); kit.post(g, 24, 2, 6, 28, w5);
        kit.plank(g, 0, 10, 32, 10, w5, 4);
        R(g, 12, 8, 8, 14, IR[2]); R(g, 12, 8, 8, 1, IR[4]); R(g, 14, 12, 4, 6, IR[0]);
        for (const x of [3, 27]) R(g, x, 12, 2, 6, IR[3]);
      },
      shadow: () => [16, 30, 15, 2.5, 0.3],
    });
    // The front edge of the festival stage: a lit deck edge over boards.
    A('co_stage', {
      box: [0, 12, 96, 24],
      draw(g, M) {
        const w5 = M.wood;
        kit.plank(g, 0, 18, 96, 4, w5, 6);
        for (let x = 0; x < 96; x += 6) kit.plank(g, x, 22, 6, 10, w5, x, true);
        for (let x = 0; x < 96; x += 32) { R(g, x, 22, 3, 10, w5[1]); R(g, x, 22, 1, 10, w5[3]); }
      },
    });
  })();
})(RB.props.P);

// An old retired stage goat, overworld sprite (16x24).
(function (S) {
  'use strict';
  const R = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  S.co_goat = (c, look, d, f) => {
    const col = look.col || '#e8e0d0', sh = '#b8b0a0';
    const step = f === 1 ? 1 : f === 2 ? -1 : 0;
    if (d === 'side') {
      R(c, 2, 13, 11, 6, col); R(c, 2, 18, 11, 1, sh);
      R(c, 11, 9, 4, 5, col); R(c, 14, 11, 1, 2, '#3a3030'); R(c, 12, 7, 1, 3, '#8a7a5a'); R(c, 13, 10, 1, 1, '#1a1414');
      R(c, 12, 14, 2, 3, '#e8e0d0'); R(c, 12, 16, 1, 2, '#d8c860');
      R(c, 3 + step, 19, 2, 4, sh); R(c, 10 - step, 19, 2, 4, sh);
      R(c, 1, 12, 2, 2, col);
    } else {
      R(c, 4, 12, 8, 8, col); R(c, 4, 19, 8, 1, sh);
      R(c, 5, 7, 6, 6, col); R(c, 4, 6, 1, 2, '#8a7a5a'); R(c, 11, 6, 1, 2, '#8a7a5a');
      if (d === 'down') { R(c, 6, 9, 1, 1, '#1a1414'); R(c, 9, 9, 1, 1, '#1a1414'); R(c, 7, 12, 2, 2, '#e8e0d0'); R(c, 7, 14, 2, 2, '#d8c860'); }
      R(c, 5, 20 + (step > 0 ? -1 : 0), 2, 3, sh); R(c, 9, 20 + (step < 0 ? -1 : 0), 2, 3, sh);
    }
  };
})(RB.sprites.custom);
