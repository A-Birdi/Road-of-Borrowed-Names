/* Chapter 5: the submerged bell tower (沈んだ鐘楼) and Lanternfall's custom
 * props, overworld creature sprites and battle art.
 * The tower is entered from the top (the belfry loft sits just above the
 * lake) and explored downwards; reading each gate plate correctly drains the
 * next level until the drowned bell can be reached and rung. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C, K) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  const TS = 16;
  const px = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };

  // ---- custom props ---------------------------------------------------------------------------
  const P = RB.props.P;
  const def = (id, props, draw) => { P[id] = Object.assign({ id, w: 1, h: 1, block: true }, props, { draw }); };

  // Iron grate in the canal embankment: something hums underneath, going uphill.
  def('lf_grate', { block: false, light: 10 }, (c, x, y, p, t, o) => {
    px(c, x + 2, y + 4, 12, 9, '#2a2838');
    for (let i = 0; i < 5; i++) px(c, x + 3 + i * 2 + (i > 2 ? 1 : 0), y + 5, 1, 7, '#6a6880');
    px(c, x + 2, y + 4, 12, 1, '#8a88a0');
    const a = o.still ? 0.4 : (Math.sin(t / 500 + x) + 1) / 2;
    c.fillStyle = `rgba(150,170,240,${0.15 + a * 0.3})`;
    c.fillRect(x + 4, y + 7 - ((t / 300) % 3 | 0), 8, 2);
  });
  // A sluice wheel on a post. o.shut draws the wheel turned.
  def('lf_wheel', {}, (c, x, y, p, t, o) => {
    RB.props.shadow(c, x, y, 16);
    px(c, x + 7, y + 4, 2, 11, p.wood[2]);
    c.strokeStyle = o.shut ? '#b89a58' : '#7a6a4a'; c.lineWidth = 2;
    c.beginPath(); c.arc(x + 8, y + 2, 6, 0, Math.PI * 2); c.stroke();
    const a = (o.shut ? Math.PI / 4 : 0);
    c.lineWidth = 1;
    for (let i = 0; i < 4; i++) { const an = a + i * Math.PI / 2; c.beginPath(); c.moveTo(x + 8, y + 2); c.lineTo(x + 8 + Math.cos(an) * 6, y + 2 + Math.sin(an) * 6); c.stroke(); }
    px(c, x + 7, y + 1, 2, 2, '#3a3440');
  });
  // A lever / plug handle set into the floor. o.pulled tips it over.
  def('lf_lever', {}, (c, x, y, p, t, o) => {
    RB.props.shadow(c, x, y, 16);
    px(c, x + 3, y + 10, 10, 5, p.stone[2]);
    px(c, x + 4, y + 10, 8, 1, p.stone[1]);
    c.save(); c.translate(x + 8, y + 11); c.rotate(o.pulled ? 0.9 : -0.2);
    px(c, -1, -12, 2, 12, '#6a5a4a');
    px(c, -3, -15, 6, 4, o.col || '#a8784a');
    c.restore();
  });
  // A bronze instruction plate fixed to a wall or post.
  def('lf_plate', {}, (c, x, y, p) => {
    px(c, x + 7, y + 8, 2, 7, p.stone[2]);
    px(c, x + 1, y - 1, 14, 10, '#6a5a2a');
    px(c, x + 2, y, 12, 8, '#b8984a');
    for (let r = 0; r < 3; r++) px(c, x + 4, y + 2 + r * 2, 8 - (r === 2 ? 3 : 0), 1, '#6a5020');
  });
  // Dynamic floodwater laid over a tile; blocks while present.
  def('lf_flood', { light: 0 }, (c, x, y, p, t, o) => {
    px(c, x, y, TS, TS, p.water[0]);
    const k = o.still ? 0 : ((t / 700 + (o.cx * 3 + o.cy * 5)) % 4);
    px(c, x + ((o.cx * 5 + (k | 0) * 3) % 11), y + 4 + (o.cy % 3) * 3, 4, 1, p.water[1]);
    px(c, x + ((o.cy * 7 + 3) % 12), y + 11, 3, 1, p.water[2]);
  });
  // The hush conduit: an old pipe; faint motes travel up it.
  def('lf_conduit', { light: 14 }, (c, x, y, p, t, o) => {
    px(c, x + 4, y - 8, 8, 24, '#3a3850');
    px(c, x + 4, y - 8, 2, 24, '#5a5878');
    px(c, x + 3, y - 8, 10, 2, '#6a6888');
    px(c, x + 3, y + 12, 10, 2, '#2a2838');
    if (!o.still) for (let i = 0; i < 3; i++) {
      const ph = ((t / 900 + i / 3 + o.cy * 0.13) % 1);
      c.fillStyle = `rgba(190,200,255,${0.7 - ph * 0.6})`;
      c.fillRect(x + 7, y + 10 - ph * 20, 2, 2);
    }
  });
  // Sluice gate boards across the outlet channel (5 tiles wide).
  def('lf_sluicegate', { w: 5 }, (c, x, y, p) => {
    px(c, x, y + 1, 80, 13, p.wood[2]);
    for (let i = 0; i < 80; i += 8) px(c, x + i, y + 2, 7, 11, p.wood[1]);
    px(c, x, y + 1, 80, 1, p.wood[3]);
    for (const i of [0, 38, 76]) px(c, x + i, y - 6, 4, 22, p.stone[2]);
    px(c, x, y + 13, 80, 2, 'rgba(0,0,0,0.25)');
  });
  // The drowned bell tower, seen from the shore: only its belfry clears the lake.
  def('lf_sunktower', { w: 3, h: 3 }, (c, x, y, p, t, o) => {
    const W = 48;
    px(c, x + 4, y - 18, W - 8, 62, p.stone[0]);
    px(c, x + 4, y - 18, 3, 62, p.stone[1]);
    px(c, x + W - 7, y - 18, 3, 62, p.stone[2]);
    for (let r = 0; r < 8; r++) px(c, x + 4, y - 14 + r * 7, W - 8, 1, p.stone[2]);
    // belfry arch with the bell's shadow inside
    px(c, x + 14, y - 10, 20, 22, '#141828');
    c.fillStyle = '#141828'; c.beginPath(); c.arc(x + 24, y - 10, 10, Math.PI, 0); c.fill();
    c.fillStyle = o.rung ? '#b8984a' : '#4a5a4a';
    c.beginPath(); c.moveTo(x + 20, y - 8); c.lineTo(x + 28, y - 8); c.lineTo(x + 31, y + 6); c.lineTo(x + 17, y + 6); c.closePath(); c.fill();
    // roof
    c.fillStyle = '#2a2848';
    c.beginPath(); c.moveTo(x, y - 18); c.lineTo(x + 24, y - 38); c.lineTo(x + W, y - 18); c.fill();
    px(c, x, y - 19, W, 2, '#4c4a78');
    // water line and ripples
    px(c, x, y + 30, W, 18, p.water[0]);
    const k = o.still ? 0 : Math.sin(t / 600) * 2;
    px(c, x + 2 + k, y + 30, W - 4, 1, p.water[3]);
    px(c, x + 8 - k, y + 34, W - 16, 1, p.water[2]);
  });
  // An old padlock hanging open on its chain, the key rusted in place.
  def('lf_padlock', {}, (c, x, y, p) => {
    px(c, x + 7, y - 6, 2, 14, p.stone[2]);
    for (let i = 0; i < 4; i++) px(c, x + 6 + (i % 2) * 2, y - 2 + i * 3, 3, 2, '#6a6a72');
    px(c, x + 4, y + 9, 8, 6, '#7a5a3a');
    px(c, x + 5, y + 6, 1, 4, '#6a6a72'); px(c, x + 10, y + 7, 1, 3, '#6a6a72');
    px(c, x + 7, y + 11, 2, 2, '#2a2020');
    px(c, x + 8, y + 12, 5, 1, '#8a6a4a'); px(c, x + 12, y + 11, 2, 3, '#8a6a4a');
  });
  // The drowned bell itself (2×2), hanging from a charred beam.
  def('lf_bigbell', { w: 2, h: 2 }, (c, x, y, p, t, o) => {
    px(c, x - 2, y - 12, 36, 4, '#3a2e2a');
    px(c, x + 15, y - 8, 2, 6, '#3a2e2a');
    const sw = o.rung && !o.still ? Math.sin(t / 300) * 1.5 : 0;
    const body = o.rung ? '#b8984a' : '#5a6a52';
    c.fillStyle = body;
    c.beginPath(); c.moveTo(x + 8 + sw, y - 2); c.lineTo(x + 24 + sw, y - 2); c.lineTo(x + 30 + sw, y + 22); c.lineTo(x + 2 + sw, y + 22); c.closePath(); c.fill();
    px(c, x + 2 + sw, y + 20, 28, 3, o.rung ? '#d8b860' : '#6a7a5a');
    px(c, x + 10 + sw, y + 2, 2, 16, o.rung ? '#e8d890' : '#7a8a6a');
    if (!o.rung) { px(c, x + 5, y + 12, 3, 5, '#3a6a4a'); px(c, x + 22, y + 6, 4, 3, '#3a6a4a'); }
    px(c, x + 14 + sw, y + 23, 4, 4, '#3a3020');
  });

  // ---- art-resolution versions (draw2; rules and helpers: src/engine/26–28_*.js) ----
  (function () {
    const A = RB.propArt && RB.propArt.art, Kt = RB.propKit;
    if (!A) return;
    const kit = RB.propArt.kit, { R, ell, poly, line, cyl, cylCol, mix, ramp, hh } = Kt;
    const IR = Kt.FIX.iron, BR = Kt.FIX.brass, PIPE = ramp('#3a3850', 0.45, 0.45);
    const BRONZE = ramp('#b8984a', 0.5, 0.4), PATINA = ramp('#5a6a52', 0.45, 0.4);
    // Iron grate in the embankment; a faint light hums behind the bars.
    A('lf_grate', {
      box: [0, 0, 32, 34], outline: false,
      f: (t, o) => Kt.frame(t, 300, 3, o.still),
      draw(g, M, v, f) {
        const s5 = M.stone;
        R(g, 2, 6, 28, 22, s5[1]); R(g, 2, 6, 28, 1, s5[3]);
        R(g, 4, 8, 24, 18, '#1a1828');
        R(g, 6, 18 - f * 2, 20, 3, 'rgba(150,170,240,0.35)'); R(g, 8, 19 - f * 2, 16, 1, 'rgba(190,205,255,0.5)');
        for (let i = 0; i < 6; i++) { cyl(g, 5 + i * 4, 8, 2, 18, IR); }
        R(g, 4, 8, 24, 2, IR[3]); R(g, 4, 24, 24, 2, IR[1]);
        R(g, 2, 27, 28, 2, s5[0]);
      },
    });
    // Sluice wheel on a post (o.shut: turned closed, brass handles bright).
    A('lf_wheel', {
      box: [0, -20, 32, 54], ink: true,
      v: (o) => (o.shut ? 1 : 0),
      draw(g, M, v) {
        kit.post(g, 14, 6, 4, 24, M.wood);
        kit.spokeWheel(g, 16, 4, 12, 4, v ? Math.PI / 4 : 0, v ? BR : ramp('#7a6a4a', 0.45, 0.35), 3);
        for (let i = 0; i < 4; i++) { const a = (v ? Math.PI / 4 : 0) + (i * Math.PI) / 2; R(g, Math.round(16 + Math.cos(a) * 13) - 1, Math.round(4 + Math.sin(a) * 13) - 1, 3, 3, v ? BR[3] : '#5a4a3a'); }
      },
      shadow: () => [16, 30, 10, 2.5, 0.3],
    });
    // Floor lever on a stone base (o.pulled: thrown over; o.col: grip colour).
    A('lf_lever', {
      box: [-6, -26, 44, 60], ink: true,
      v: (o) => (o.pulled ? 'p' : 'u') + (o.col || '#a8784a'),
      draw(g, M, v) {
        const s5 = M.stone, pulled = v[0] === 'p', grip = ramp(v.slice(1), 0.45, 0.35);
        R(g, 5, 20, 22, 10, s5[2]); R(g, 5, 20, 22, 2, s5[4]); R(g, 26, 20, 1, 10, s5[1]); R(g, 11, 22, 10, 3, '#1a1418');
        const a = (pulled ? 0.9 : -0.2) - Math.PI / 2, ex = 16 + Math.cos(a) * 24, ey = 22 + Math.sin(a) * 24;
        line(g, 16, 22, ex, ey, '#6a5a4a', 3); line(g, 15, 22, ex - 1, ey, '#8a7a6a', 1);
        ell(g, ex, ey, 5, 4, grip[2]); R(g, Math.round(ex) - 3, Math.round(ey) - 3, 3, 1, grip[4]); R(g, Math.round(ex) - 1, Math.round(ey) + 2, 4, 1, grip[1]);
        ell(g, 16, 22, 3, 2, IR[3]);
      },
      shadow: () => [16, 30, 12, 2.5, 0.3],
    });
    // Bronze instruction plate on a post (interactable).
    A('lf_plate', {
      box: [0, -6, 32, 40], ink: true,
      draw(g, M) {
        kit.post(g, 14, 16, 4, 14, M.stone);
        R(g, 2, -2, 28, 20, BRONZE[0]); R(g, 3, -1, 26, 18, BRONZE[2]); R(g, 3, -1, 26, 1, BRONZE[4]); R(g, 3, -1, 1, 18, BRONZE[3]); R(g, 28, 0, 1, 17, BRONZE[1]);
        for (let i = 0; i < 4; i++) kit.glyph(g, 6 + i * 5, 3, hh(i, 2, 3), BRONZE[0]);
        for (let i = 0; i < 3; i++) kit.glyph(g, 6 + i * 5, 10, hh(i, 5, 3), BRONZE[0]);
        for (const [x, y] of [[4, 0], [26, 0], [4, 15], [26, 15]]) R(g, x, y, 1, 1, BRONZE[4]);
      },
      shadow: () => [16, 30, 7, 2, 0.3],
    });
    // Floodwater over a tile: flat water with slow ripples that line up
    // across neighbouring tiles (four cached frames per layout).
    A('lf_flood', {
      box: [0, 0, 32, 32], outline: false,
      v: (o) => hh(o.cx | 0, o.cy | 0, 9) % 4,
      f: (t, o) => (o.still ? 0 : Math.floor(t / 700 + ((o.cx | 0) * 3 + (o.cy | 0) * 5)) % 4),
      draw(g, M, v, f, info, pal) {
        const w = pal.water;
        R(g, 0, 0, 32, 32, w[0]);
        const y1 = 6 + (v % 3) * 6, x1 = (v * 9 + f * 6) % 24;
        R(g, x1, y1, 8, 1, w[1]); R(g, x1 + 2, y1 + 1, 4, 1, w[1]);
        R(g, (x1 + 13) % 26, 24 - v, 6, 1, w[1]);
        if (f === v) R(g, (v * 7 + 5) % 26, 16, 3, 1, w[2]);
      },
    });
    // The hush conduit: an old flanged pipe with pale motes drifting up it.
    A('lf_conduit', {
      box: [0, -20, 32, 54],
      f: (t, o) => Kt.frame(t, 150, 6, o.still, (o.cy | 0) * 0.8),
      draw(g) {
        for (let i = 0; i < 16; i++) R(g, 8 + i, -16, 1, 46, cylCol(i, 16, PIPE));
        for (const y of [-16, 8, 24]) { for (let i = 0; i < 20; i++) R(g, 6 + i, y, 1, 4, cylCol(i, 20, PIPE)); R(g, 6, y, 20, 1, PIPE[4]); }
        for (const [x, y] of [[8, -15], [22, -15], [8, 9], [22, 9]]) R(g, x, y, 2, 2, IR[4]);
      },
      over(g, M, v, f) {
        for (let i = 0; i < 3; i++) { const ph = ((f / 6 + i / 3) % 1); R(g, 15, Math.round(22 - ph * 40), 2, 2, 'rgba(190,200,255,' + (0.8 - ph * 0.6).toFixed(2) + ')'); }
      },
      shadow: () => [16, 30, 10, 2.5, 0.3],
    });
    // Sluice gate: stacked boards between three stone piers.
    A('lf_sluicegate', {
      box: [-2, -16, 164, 50],
      draw(g, M) {
        const w5 = M.wood, s5 = M.stone;
        for (let r = 0; r < 3; r++) kit.plank(g, 0, 2 + r * 8, 160, 8, w5, r + 3);
        for (let x = 20; x < 160; x += 40) { R(g, x, 3, 2, 22, IR[2]); R(g, x, 3, 1, 22, IR[3]); }
        for (const x of [0, 76, 152]) { for (let i = 0; i < 8; i++) R(g, x + i, -12, 1, 44, cylCol(i, 8, s5)); R(g, x - 1, -14, 10, 3, s5[3]); R(g, x - 1, -14, 10, 1, s5[4]); }
      },
      ground(g, M, v, f, info, pal) { R(g, 0, 26, 160, 4, Kt.rgba(pal.water[0], 0.7)); },
    });
    // The drowned bell tower: only the belfry clears the lake (o.rung).
    A('lf_sunktower', {
      box: [-6, -84, 108, 184],
      v: (o) => (o.rung ? 1 : 0),
      f: (t, o) => Kt.frame(t, 300, 4, o.still),
      draw(g, M, v) {
        const s5 = M.stone, W = 96, r5 = ramp('#2a2848', 0.4, 0.45);
        for (let i = 0; i < W - 16; i++) R(g, 8 + i, -36, 1, 100, cylCol(i, W - 16, s5));
        for (let r = 0; r < 14; r++) { R(g, 8, -32 + r * 7, W - 16, 1, s5[1]); for (let k = 0; k < 7; k++) { const x = 10 + k * 12 + (r % 2) * 6; if (x < W - 10) R(g, x, -31 + r * 7, 1, 6, s5[1]); } }
        // belfry arch with the bell inside
        R(g, 28, -20, 40, 44, '#141828'); ell(g, 48, -20, 20, 14, '#141828');
        const b5 = v ? BRONZE : PATINA;
        poly(g, [40, -16, 56, -16, 62, 12, 34, 12], b5[2]); poly(g, [40, -16, 45, -16, 41, 12, 34, 12], b5[3]); poly(g, [52, -16, 56, -16, 62, 12, 55, 12], b5[1]);
        R(g, 34, 11, 28, 2, b5[0]); R(g, 46, -20, 4, 4, '#3a3020');
        if (!v) { R(g, 38, 0, 4, 5, '#3a6a4a'); R(g, 52, -8, 5, 3, '#3a6a4a'); }
        // roof
        poly(g, [-2, -36, 48, -76, 98, -36], r5[2]); poly(g, [-2, -36, 48, -76, 40, -36], r5[3]);
        for (let y = -70; y < -36; y += 6) R(g, 48 - (y + 76) * 1.25, y, (y + 76) * 2.5, 1, r5[1]);
        R(g, -2, -38, 100, 3, r5[4]); R(g, -2, -35, 100, 1, r5[0]); R(g, 47, -82, 2, 8, IR[3]);
      },
      over(g, M, v, f, info, pal) {
        const w = pal.water;
        R(g, 0, 60, 96, 36, w[0]);
        R(g, 2 + f * 2, 60, 92 - f * 2, 1, w[3]); R(g, 16 - f, 68, 64, 1, w[2]); R(g, 30 + f * 2, 78, 36, 1, w[1]);
        R(g, 8, 62, 80, 3, Kt.rgba(w[2], 0.35));
      },
    });
    // Open padlock on a chain, the key rusted into it.
    A('lf_padlock', {
      box: [0, -16, 32, 50], ink: true,
      draw(g, M) {
        kit.post(g, 14, -12, 4, 42, M.stone);
        for (let i = 0; i < 5; i++) { R(g, 12 + (i % 2) * 4, -4 + i * 5, 4, 3, IR[3]); R(g, 13 + (i % 2) * 4, -3 + i * 5, 2, 1, IR[1]); }
        const ru = ramp('#7a5a3a', 0.45, 0.35);
        R(g, 8, 18, 16, 12, ru[2]); R(g, 8, 18, 16, 2, ru[4]); R(g, 22, 19, 2, 11, ru[1]);
        line(g, 10, 18, 10, 11, IR[2], 2); line(g, 21, 15, 21, 11, IR[2], 2);
        R(g, 14, 22, 3, 4, '#2a2020'); R(g, 16, 24, 9, 2, '#8a6a4a'); R(g, 24, 22, 3, 5, '#8a6a4a');
      },
      shadow: () => [16, 30, 8, 2, 0.3],
    });
    // The drowned bell (o.rung: bright bronze, swaying).
    A('lf_bigbell', {
      box: [-8, -30, 80, 98],
      v: (o) => (o.rung ? 1 : 0),
      f: (t, o) => (o.rung && !o.still ? Math.round(Math.sin(t / 300) * 2) + 2 : 2),
      draw(g, M, v, f) {
        const b5 = v ? BRONZE : PATINA, sw = (f - 2) * 1.5;
        R(g, -4, -24, 72, 8, '#3a2e2a'); R(g, -4, -24, 72, 1, '#5a4a40'); R(g, 10, -22, 20, 2, '#241c1a');
        R(g, 30, -16, 4, 12, '#3a2e2a');
        Kt.shade(g, 0, -6, 64, 56, b5, (fx, fy) => {
          const t = (fy + 4) / 48;
          if (t < 0 || t > 1) return null;
          const hw = t < 0.15 ? 16 * Math.sqrt(t / 0.15) : 16 + (t > 0.85 ? (t - 0.85) * 40 : t * 4);
          const dx = fx - 32 - sw;
          if (Math.abs(dx) > hw) return null;
          let I = (-dx / hw) * 0.6 + 0.25 - t * 0.2;
          if (Math.abs(fy - 18) < 1 || Math.abs(fy - 34) < 1) I -= 0.5;
          if (!v && ((Math.floor(fx / 3) * 7 + Math.floor(fy / 3) * 3) % 11 === 0)) I -= 0.45;
          return I;
        }, 7, 0.08, 3, 2);
        R(g, Math.round(28 + sw), 46, 8, 8, '#3a3020');
      },
      over(g, M, v) { if (v) Kt.halo(g, 32, 20, 28, '#ffe39c', 0.08); },
      shadow: () => [32, 62, 24, 3, 0.25],
    });
  })();

  // ---- overworld creature sprites (16×24) ---------------------------------------------------------------
  const SP = RB.sprites.custom;
  const R = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  SP.lf_bell = (c, look, d, f) => {
    const col = look.col || '#3c5c8a';
    const b = f === 1 ? 1 : 0;
    R(c, 5, 6 + b, 6, 2, col); R(c, 4, 8 + b, 8, 6, col); R(c, 3, 14 + b, 10, 2, col);
    R(c, 7, 16 + b, 2, 2, '#1a2030');
    R(c, 5, 10 + b, 1, 2, '#e8ecff'); R(c, 10, 10 + b, 1, 2, '#e8ecff');
    c.fillStyle = col + '70'; c.fillRect(4, 18 + b, 2, 4); c.fillRect(10, 19 - b, 2, 3);
  };
  SP.lf_stamp = (c, look, d, f) => {
    const col = look.col || '#4c4a78';
    R(c, 6, 3, 4, 6, '#6a4a3a'); R(c, 5, 2, 6, 2, '#8a6a4a');
    R(c, 3, 9, 10, 9, col); R(c, 3, 9, 10, 1, '#8a88c0');
    R(c, 2, 18, 12, 3, '#c85a4a');
    R(c, 5, 12, 2, 2, '#f0f0ff'); R(c, 9, 12, 2, 2, '#f0f0ff');
    R(c, 4 + (f === 1 ? 1 : 0), 21, 2, 2, col); R(c, 10 - (f === 1 ? 1 : 0), 21, 2, 2, col);
  };
  SP.lf_pipe = (c, look, d, f) => {
    const col = look.col || '#8a90c8';
    R(c, 6, 4, 4, 18, '#3a3850'); R(c, 6, 4, 1, 18, '#5a5878');
    for (let i = 0; i < 3; i++) { c.fillStyle = col; c.fillRect(7, 18 - i * 6 - (f === 1 ? 2 : 0), 2, 2); }
    R(c, 3, 8, 3, 2, '#3a3850'); R(c, 10, 13, 3, 2, '#3a3850');
    R(c, 6, 6, 1, 1, '#f0f0ff'); R(c, 9, 6, 1, 1, '#f0f0ff');
  };

  // ---- battle art --------------------------------------------------------------------------------------
  // The Conduit Spirit (lf_conduit) and the Drowned Bell's Keeper (lf_keeper) are drawn by
  // src/ui/78p_conduit.js and src/ui/78o_bells.js (battle addendum, Creatures B): rigs with
  // authored action poses and their own deliveries.

  // ---- tower maps ---------------------------------------------------------------------------------------
  const TOWER = { region: 'lanternfall', music: 'belltower', noTravel: true, travelKind: 'dungeon', travelPlace: { en: 'the bell tower' } };
  const flood = (cells, cond) => cells.map(([x, y]) => ({ p: 'lf_flood', x, y, if: cond }));
  const rect = (x0, y0, w, h) => { const out = []; for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) out.push([x, y]); return out; };

  C.maps['lf.tower_top'] = Object.assign({}, TOWER, {
    name: T('Belfry Loft', '{鐘楼|しょうろう} の {屋根裏|やねうら}'),
    ambient: { dark: 0.45, playerLight: 52, tint: 'rgba(40,60,120,0.12)' },
    terrain: K.build(16, 12, '#', (k) => {
      k.rect(1, 2, 14, 8, '_');
      k.rect(2, 8, 3, 2, 'w');
      k.set(7, 10, '_').set(7, 11, '_').set(8, 10, '_');
    }),
    props: [
      { p: 'noticeboard', x: 2, y: 2, scene: 'lf.roster' },
      { p: 'stairs', x: 12, y: 3 },
      { p: 'ladder', x: 5, y: 3, scene: 'lf.trapdoor', if: '!lf_shortcut' },
      { p: 'ladder', x: 5, y: 3, if: 'lf_shortcut' },
      { p: 'hole', x: 9, y: 6 }, { p: 'crate', x: 13, y: 8 }, { p: 'barrel', x: 1, y: 5 },
      { p: 'lantern', x: 10, y: 2, o: { lit: true } },
      { p: 'lf_plate', x: 8, y: 2, scene: 'lf.top_plate' },
    ],
    exits: [
      { x: 7, y: 11, to: 'lf.sluice', sp: 'from_tower', dir: 'down' },
      { x: 12, y: 3, to: 'lf.tower_upper', tx: 16, ty: 3, dir: 'down' },
      { x: 5, y: 3, to: 'lf.tower_mid', tx: 3, ty: 4, dir: 'down', if: 'lf_shortcut' },
    ],
    onEnter: [{ scene: 'lf.tower_arrive', if: '!lf_tower_entered' }],
    spawn: { default: [7, 9, 'up'] },
  });

  C.maps['lf.tower_upper'] = Object.assign({}, TOWER, {
    name: T('Upper Floor', '{上|うえ} の {階|かい}'),
    ambient: { dark: 0.5, playerLight: 50, tint: 'rgba(40,60,120,0.12)' },
    terrain: K.build(20, 16, '#', (k) => {
      k.rect(1, 2, 18, 13, '+');
      k.rect(6, 6, 8, 5, 'w');
      k.rect(8, 7, 4, 3, '~');
      k.rect(8, 11, 5, 4, 'w');
      k.set(10, 15, 'w');
      k.rect(1, 12, 3, 3, 'w');
    }),
    props: [
      { p: 'stairs', x: 16, y: 2 },
      { p: 'lf_plate', x: 5, y: 2, scene: 'lf.plate_a' },
      { p: 'lf_wheel', x: 2, y: 5, scene: 'lf.wheel_upper', if: '!lf_up_closed' },
      { p: 'lf_wheel', x: 2, y: 5, scene: 'lf.wheel_upper', o: { shut: true }, if: 'lf_up_closed' },
      { p: 'lf_wheel', x: 17, y: 9, scene: 'lf.wheel_lower', if: '!lf_gate_a' },
      { p: 'lf_wheel', x: 17, y: 9, scene: 'lf.wheel_lower', o: { shut: true }, if: 'lf_gate_a' },
      { p: 'pillar', x: 4, y: 9 }, { p: 'pillar', x: 15, y: 12 },
      { p: 'bookpile', x: 17, y: 13, scene: 'lf.upper_logs' },
      { p: 'crate', x: 1, y: 2 },
    ].concat(flood(rect(8, 11, 5, 4).concat([[10, 15]]), '!lf_gate_a')),
    foes: [
      { id: 'tu1', enemy: 'lf.blot', x: 14, y: 5, patrol: 2, aggro: true },
      { id: 'tu2', enemy: 'lf.mote', x: 4, y: 12, patrol: 1, aggro: true },
    ],
    exits: [
      { x: 16, y: 1, to: 'lf.tower_top', tx: 12, ty: 4, dir: 'up' },
      { x: 10, y: 15, to: 'lf.tower_mid', tx: 10, ty: 2, dir: 'down', if: 'lf_gate_a' },
    ],
    spawn: { default: [16, 3, 'down'] },
  });
  // the stairwell up is a gap in the top wall
  C.maps['lf.tower_upper'].terrain = C.maps['lf.tower_upper'].terrain.map((row, y) => (y === 1 ? row.slice(0, 16) + '+' + row.slice(17) : row));

  C.maps['lf.tower_mid'] = Object.assign({}, TOWER, {
    name: T('Gate Works', '{水門|すいもん} の {機械室|きかいしつ}'),
    ambient: { dark: 0.5, playerLight: 50, tint: 'rgba(40,60,120,0.14)' },
    terrain: K.build(22, 18, '#', (k) => {
      k.rect(1, 2, 20, 15, '+');
      k.set(10, 1, '+');
      k.rect(1, 10, 20, 6, '+');
      k.scatter('w', 16, 91, [1, 10, 20, 6], '+');
      k.rect(9, 14, 4, 2, 'w');
      k.rect(10, 16, 2, 1, 'w');
      k.set(10, 17, 'w');
    }),
    props: [
      { p: 'gears', x: 6, y: 2, scene: 'lf.gears' }, { p: 'gears', x: 13, y: 2 },
      { p: 'lf_plate', x: 9, y: 3, scene: 'lf.plate_b' },
      { p: 'ladder', x: 3, y: 3, scene: 'lf.ladder_mid' },
      { p: 'lf_conduit', x: 19, y: 3, scene: 'lf.junction' }, { p: 'lf_conduit', x: 19, y: 4, scene: 'lf.junction' }, { p: 'lf_conduit', x: 19, y: 5, scene: 'lf.junction' },
      { p: 'lf_conduit', x: 18, y: 5, scene: 'lf.junction' },
      { p: 'lf_lever', x: 20, y: 8, scene: 'lf.east_door', o: { col: '#6a8ab8' }, if: '!lf_east_open' },
      { p: 'lf_lever', x: 20, y: 8, scene: 'lf.east_door', o: { col: '#6a8ab8', pulled: true }, if: 'lf_east_open' },
      { p: 'lf_lever', x: 1, y: 8, scene: 'lf.west_plug', o: { col: '#a8784a' }, if: '!lf_mid_drained' },
      { p: 'lf_lever', x: 1, y: 8, scene: 'lf.west_plug', o: { col: '#a8784a', pulled: true }, if: 'lf_mid_drained' },
      { p: 'pillar', x: 5, y: 7 }, { p: 'pillar', x: 16, y: 7 },
      { p: 'echo', x: 17, y: 4, if: '!lf_koe' },
    ].concat(flood(rect(1, 10, 20, 6).concat([[10, 16], [11, 16], [10, 17]]), '!lf_mid_drained')),
    foes: [
      { id: 'tm1', enemy: 'lf.conduit', x: 14, y: 6, patrol: 1, aggro: true },
      { id: 'tm2', enemy: 'lf.conduit', x: 7, y: 8, patrol: 1, aggro: true },
    ],
    exits: [
      { x: 10, y: 1, to: 'lf.tower_upper', tx: 10, ty: 14, dir: 'up' },
      { x: 10, y: 17, to: 'lf.tower_low', tx: 10, ty: 2, dir: 'down', if: 'lf_gate_b' },
      { x: 3, y: 3, to: 'lf.tower_top', tx: 5, ty: 4, dir: 'up', if: 'lf_shortcut' },
    ],
    triggers: [
      { x: 1, y: 10, w: 20, h: 1, scene: 'lf.water_returns', if: 'lf_mid_drained&!lf_gate_b' },
    ],
    onEnter: [{ scene: 'lf.mid_enter', if: '!lf_mid_seen' }],
    spawn: { default: [10, 2, 'down'] },
  });

  C.maps['lf.tower_low'] = Object.assign({}, TOWER, {
    name: T('Drowned Stair', '{沈|しず}んだ {階段|かいだん}'),
    ambient: { dark: 0.58, playerLight: 48, tint: 'rgba(30,50,110,0.16)' },
    terrain: K.build(20, 18, '#', (k) => {
      k.rect(1, 2, 18, 15, '+');
      k.set(10, 1, '+');
      k.rect(6, 8, 8, 9, '~');
      k.rect(9, 8, 2, 9, 'w');
      k.set(10, 17, 'w');
      k.rect(1, 12, 4, 4, 'w');
      k.rect(15, 12, 4, 4, 'w');
    }),
    props: [
      { p: 'lf_plate', x: 3, y: 2, scene: 'lf.plate_c' },
      { p: 'lf_lever', x: 2, y: 14, scene: 'lf.south_plug', o: { col: '#a8784a' }, if: '!lf_south_pulled' },
      { p: 'lf_lever', x: 2, y: 14, scene: 'lf.south_plug', o: { col: '#a8784a', pulled: true }, if: 'lf_south_pulled' },
      { p: 'lf_lever', x: 16, y: 3, scene: 'lf.north_plug', o: { col: '#6a8ab8' }, if: '!lf_gate_c' },
      { p: 'lf_lever', x: 16, y: 3, scene: 'lf.north_plug', o: { col: '#6a8ab8', pulled: true }, if: 'lf_gate_c' },
      { p: 'pillar', x: 14, y: 5, scene: 'lf.waterline' }, { p: 'pillar', x: 5, y: 5 },
      { p: 'deadlantern', x: 17, y: 9 },
    ].concat(flood(rect(9, 8, 2, 9).concat([[10, 17]]), '!lf_gate_c')),
    foes: [
      { id: 'tl1', enemy: 'lf.wraith', x: 4, y: 8, patrol: 1, aggro: true },
      { id: 'tl2', enemy: 'lf.wraith', x: 16, y: 11, patrol: 1, aggro: true },
    ],
    exits: [
      { x: 10, y: 1, to: 'lf.tower_mid', tx: 10, ty: 16, dir: 'up' },
      { x: 10, y: 17, to: 'lf.bellhall', tx: 8, ty: 2, dir: 'down', if: 'lf_gate_c' },
    ],
    onEnter: [{ scene: 'lf.low_enter', if: '!lf_low_seen' }],
    spawn: { default: [10, 2, 'down'] },
  });

  C.maps['lf.bellhall'] = Object.assign({}, TOWER, {
    name: T('Bell Chamber', '{鐘|かね} の {間|ま}'),
    music: [{ if: 'lf_bell_rung', id: 'lf_bell' }, { id: 'hush' }],
    ambient: { dark: 0.5, playerLight: 50, tint: 'rgba(30,50,110,0.16)' },
    terrain: K.build(16, 14, '#', (k) => {
      k.rect(1, 2, 14, 11, 'w');
      k.set(8, 1, '+');
      k.rect(5, 6, 6, 5, '+');
      k.rect(1, 2, 14, 2, '+');
    }),
    props: [
      { p: 'lf_bigbell', x: 7, y: 7, scene: 'lf.bell_touch', if: '!lf_bell_rung' },
      { p: 'lf_bigbell', x: 7, y: 7, o: { rung: true }, scene: 'lf.bell_after', if: 'lf_bell_rung' },
      { p: 'pillar', x: 3, y: 5 }, { p: 'pillar', x: 12, y: 5 }, { p: 'pillar', x: 3, y: 10 }, { p: 'pillar', x: 12, y: 10 },
      { p: 'lf_conduit', x: 1, y: 7 }, { p: 'lf_conduit', x: 14, y: 7 },
      { p: 'lf_plate', x: 10, y: 6, scene: 'lf.bell_plate' },
      { p: 'lf_padlock', x: 9, y: 2, scene: 'lf.tower_key' },
    ],
    exits: [{ x: 8, y: 1, to: 'lf.tower_low', tx: 10, ty: 16, dir: 'up' }],
    triggers: [{ x: 1, y: 5, w: 14, h: 1, scene: 'lf.boss_intro', if: '!lf_boss_done' }],
    spawn: { default: [8, 2, 'down'] },
  });
})(RB.content, RB.mapkit);
