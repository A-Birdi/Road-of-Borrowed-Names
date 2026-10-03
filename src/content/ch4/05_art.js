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

  // ---- art-resolution versions (draw2; rules and helpers: src/engine/26–28_*.js) ----
  (function () {
    const A = RB.propArt && RB.propArt.art, K = RB.propKit;
    if (!A) return;
    const kit = RB.propArt.kit, { R, ell, poly, line, cyl, cylCol, streaks, mix, ramp, hh } = K;
    const IR = K.FIX.iron, BR = K.FIX.brass, PP = K.FIX.paper, GL = K.FIX.glow;
    const ICE = ['#4a7aa0', '#7aaed0', '#a8d0ec', '#d0e8f8', '#f4fbff'];
    const SNOW = ['#8898b0', '#b8c8d8', '#d8e4ee', '#eef4f8', '#ffffff'];
    const shadeBall = kit.shadeBall, cxy = (o) => hh(o.cx | 0, o.cy | 0, 5);
    // Sunken hearth: a timber frame round an ash bed, charcoal and a live fire
    // (o.low: failing embers), a kettle on the pot-hook, a thread of steam.
    A('sb_irori', {
      box: [-4, -34, 72, 100],
      v: (o) => (o.low ? 1 : 0),
      f: (t, o) => K.frame(t, 110, 4, o.still),
      draw(g, M, v, f) {
        const w5 = M.wood, ash = ramp('#8a8078', 0.45, 0.35);
        R(g, 2, 4, 60, 56, w5[1]); R(g, 2, 4, 60, 2, w5[4]); R(g, 2, 58, 60, 2, w5[0]);
        R(g, 6, 8, 52, 48, w5[3]); R(g, 6, 8, 52, 1, w5[4]);
        R(g, 10, 12, 44, 40, ash[2]); R(g, 10, 12, 44, 3, ash[0]); R(g, 10, 15, 44, 2, ash[1]);
        streaks(g, 12, 20, 40, 30, ash[3], 5, 10, 5);
        for (let i = 0; i < 5; i++) { R(g, 18 + i * 6, 38 + (i % 2), 5, 8, K.FIX.char[2]); R(g, 18 + i * 6, 38 + (i % 2), 5, 1, K.FIX.char[4]); }
        if (!v) kit.fire(g, 32, 42, 16, 16, f, 3);
        else { R(g, 22, 38, 20, 5, K.FIX.ember[1]); R(g, 26, 38, 3, 2, K.FIX.ember[3]); R(g, 34, 39, 2, 2, K.FIX.ember[2]); }
        // pot-hook and kettle
        R(g, 31, -30, 2, 42, '#2a2420'); R(g, 28, -10, 8, 3, w5[2]);
        shadeBall(g, 32, 12, 9, 6, IR, 2); R(g, 26, 5, 12, 2, IR[3]); R(g, 30, 3, 4, 2, IR[4]);
        line(g, 41, 10, 47, 6, IR[2], 2);
      },
      over(g, M, v, f) {
        if (!v) K.halo(g, 32, 38, 18, '#ff9a40', 0.12);
        if (!v) for (let i = 0; i < 2; i++) { const k = (f + i * 2) % 4; R(g, 48 + k, 2 - k * 4, 2, 2, 'rgba(240,240,240,' + (0.45 - k * 0.1) + ')'); }
      },
    });
    // Bell-post (interactable): a tall post, a hooded bronze bell and a
    // signal board (o.blank: nothing written on it yet).
    A('sb_bellpost', {
      box: [-2, -78, 36, 112], ink: true,
      v: (o) => (o.blank ? 1 : 0),
      draw(g, M, v) {
        const w5 = M.wood, b5 = ramp('#8a7a4a', 0.5, 0.45);
        kit.post(g, 13, -60, 6, 90, w5);
        kit.plank(g, 2, -68, 28, 6, w5, 1); R(g, 4, -72, 24, 4, '#ffffff'); R(g, 4, -72, 24, 1, '#ffffff'); R(g, 4, -69, 24, 1, SNOW[2]);
        poly(g, [10, -60, 22, -60, 26, -40, 6, -40], b5[2]); poly(g, [10, -60, 14, -60, 12, -40, 6, -40], b5[3]); poly(g, [19, -60, 22, -60, 26, -40, 21, -40], b5[1]);
        R(g, 6, -41, 20, 2, b5[0]); R(g, 14, -40, 4, 4, '#5a4a2a');
        R(g, 15, -36, 1, 24, '#c8b890');
        kit.board(g, 3, -8, 26, 16, w5, v ? ramp('#ece8e0', 0.3, 0.2) : kit.signFace(M), 3, v ? 0 : 2);
      },
      shadow: () => [16, 30, 12, 3, 0.3],
    });
    // Pigeonhole shelves, some holes holding letters waiting for the thaw.
    A('sb_mailshelf', {
      box: [-2, -32, 68, 66],
      v: (o) => ((o.cx | 0) % 3 + 3) % 3,
      draw(g, M, v) {
        const w5 = M.wood;
        R(g, 2, -28, 60, 58, w5[1]); R(g, 2, -28, 60, 1, w5[4]);
        for (let r = 0; r < 4; r++) for (let k = 0; k < 5; k++) {
          const x = 5 + k * 11.4, y = -25 + r * 12;
          R(g, Math.round(x), y, 10, 10, '#2a2018'); R(g, Math.round(x), y + 9, 10, 1, w5[3]);
          if ((r * 5 + k + v) % 3) { const pc = (r + k) % 4 ? PP : ramp('#d8c8e0', 0.3, 0.2); R(g, Math.round(x) + 1, y + 3, 8, 6, pc[3]); R(g, Math.round(x) + 1, y + 3, 8, 1, pc[4]); R(g, Math.round(x) + 2, y + 5, 5, 1, pc[1]); if ((r + k) % 5 === 0) R(g, Math.round(x) + 6, y + 4, 2, 2, '#b84a3a'); }
        }
        R(g, 2, 24, 60, 6, w5[2]); R(g, 2, 24, 60, 1, w5[3]);
      },
      shadow: () => [32, 30, 30, 2.5, 0.3],
    });
    // Snow drift across a road.
    A('sb_drift', {
      box: [-4, -2, 40, 36],
      draw(g) {
        shadeBall(g, 17, 22, 17, 10, SNOW, 1);
        shadeBall(g, 12, 17, 11, 8, SNOW, 2);
        R(g, 6, 10, 8, 1, '#ffffff');
      },
      shadow: () => [17, 29, 16, 3, 0.18],
    });
    // A wall of clear ice with facets and a glint (o.cracked: thin, crazed).
    A('sb_icewall', {
      box: [0, -20, 32, 54],
      v: (o) => (o.cracked ? 1 : 0),
      f: (t, o) => K.frame(t, 180, 6, o.still, (o.cx | 0) * 0.7),
      draw(g, M, v) {
        const ic = v ? ICE.map((c) => mix(c, '#ffffff', 0.25)) : ICE;
        K.shade(g, 0, -16, 32, 48, ic, (fx, fy) => {
          const facet = Math.floor((fx + fy * 0.4) / 7) % 3;
          return 0.35 + (facet === 0 ? 0.25 : facet === 1 ? -0.1 : 0.05) - (fy + 16) / 48 * 0.35 + (fx < 3 ? 0.3 : fx > 29 ? -0.3 : 0);
        }, 4, 0.12, 6, 5);
        R(g, 0, -16, 32, 2, ic[4]); R(g, 5, -12, 2, 26, 'rgba(255,255,255,0.7)'); R(g, 18, -6, 1, 18, 'rgba(255,255,255,0.5)');
        if (v) { line(g, 12, -2, 16, 8, ICE[0], 1); line(g, 16, 8, 13, 16, ICE[0], 1); line(g, 16, 8, 22, 12, ICE[0], 1); line(g, 12, -2, 9, -8, ICE[0], 1); }
      },
      over(g, M, v, f) { const a = [0.2, 0.35, 0.5, 0.35, 0.2, 0.1][f]; R(g, 22, -12, 3, 3, 'rgba(255,255,255,' + a + ')'); R(g, 23, -14, 1, 7, 'rgba(255,255,255,' + a * 0.8 + ')'); },
      shadow: () => [16, 31, 16, 2, 0.2],
    });
    // Icicles hanging from a beam above the path (walk-through).
    A('sb_icicles', {
      box: [0, -36, 32, 30],
      v: (o) => cxy(o) % 3,
      draw(g, M, v) {
        for (let i = 0; i < 6; i++) {
          const x = 2 + i * 5, L = 8 + ((i * 7 + v * 5) % 12);
          for (let k = 0; k < L; k++) { const w = k < L * 0.4 ? 3 : k < L * 0.8 ? 2 : 1; R(g, x + (3 - w >> 1), -32 + k, w, 1, k < 2 ? ICE[4] : ICE[3]); }
          R(g, x, -32, 1, Math.round(L * 0.6), '#ffffff');
        }
      },
    });
    // Star chart on a slanted table (o.frost: the chart iced over).
    A('sb_starchart', {
      box: [-2, -14, 68, 48],
      v: (o) => (o.frost ? 1 : 0),
      draw(g, M, v) {
        const w5 = M.wood;
        kit.legs(g, [5, 56], 16, 30, w5);
        R(g, 2, -8, 60, 26, w5[1]); R(g, 2, -8, 60, 1, w5[4]); R(g, 2, 17, 60, 1, w5[0]);
        R(g, 5, -6, 54, 21, v ? '#c8dcec' : '#1e2848');
        if (!v) {
          const st = [[10, 0], [18, 6], [28, 2], [36, 10], [44, 4], [50, 12], [22, 12], [14, 8], [40, 16], [8, 14]];
          line(g, 17, 1, 25, 7, '#5a70a0', 1); line(g, 25, 7, 35, 3, '#5a70a0', 1); line(g, 35, 3, 41, 11, '#5a70a0', 1);
          for (const [sx, sy] of st) { R(g, 5 + sx, -6 + sy, 2, 2, '#f4f0d0'); R(g, 5 + sx, -6 + sy, 1, 1, '#ffffff'); }
          R(g, 6, 12, 10, 2, '#b89a58');
        } else for (let i = 0; i < 9; i++) { const x = 8 + i * 6, y = -3 + (i % 3) * 5; R(g, x, y, 3, 1, '#ffffff'); R(g, x + 1, y - 1, 1, 3, '#ffffff'); }
      },
      shadow: () => [32, 30, 30, 3, 0.3],
    });
    // Brass direction dial on a stone pedestal (o.point, o.frost).
    A('sb_dial', {
      box: [0, -20, 32, 54], ink: true,
      v: (o) => (o.point || 'up') + (o.frost ? 'f' : ''),
      draw(g, M, v) {
        const s5 = M.stone;
        cyl(g, 8, 4, 16, 24, s5); R(g, 8, 4, 16, 1, s5[4]); R(g, 5, 26, 22, 4, s5[2]); R(g, 5, 26, 22, 1, s5[4]);
        ell(g, 16, -4, 12, 12, BR[1]); ell(g, 16, -4, 11, 11, BR[2]); ell(g, 15, -5, 8, 8, BR[3]); ell(g, 14, -7, 3, 3, BR[4]);
        for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4; R(g, Math.round(16 + Math.cos(a) * 9.5), Math.round(-4 + Math.sin(a) * 9.5), 1, 1, BR[0]); }
        const dir = String(v).replace('f', ''), a = { up: -Math.PI / 2, down: Math.PI / 2, left: Math.PI, right: 0 }[dir] || -Math.PI / 2;
        line(g, 16, -4, 16 + Math.cos(a) * 8, -4 + Math.sin(a) * 8, '#5a3a1a', 2);
        R(g, 15, -5, 2, 2, BR[0]);
      },
      over(g, M, v) { if (String(v).indexOf('f') >= 0) { ell(g, 16, -4, 12, 12, 'rgba(220,240,255,0.55)'); R(g, 10, -10, 5, 1, '#ffffff'); R(g, 19, 0, 4, 1, '#ffffff'); } },
      shadow: () => [16, 30, 12, 3, 0.3],
    });
    // Hatch crank: a spoked iron wheel on a post (o.turned, o.frost).
    A('sb_crank', {
      box: [0, -24, 32, 58], ink: true,
      v: (o) => (o.turned ? 't' : '') + (o.frost ? 'f' : ''),
      draw(g, M, v) {
        const frost = String(v).indexOf('f') >= 0, r5 = frost ? ICE : ramp('#8a6a3a', 0.45, 0.4);
        cyl(g, 14, -8, 4, 38, IR);
        kit.spokeWheel(g, 16, -8, 12, 4, String(v).indexOf('t') >= 0 ? 0.8 : 0, r5, 3);
        R(g, 26, -10, 3, 5, r5[1]);
      },
      shadow: () => [16, 30, 8, 2.5, 0.3],
    });
    // The great observatory lamp (o.lit, o.frozen): a columned stand, a tall
    // glass shade with the name on it and a flame.
    A('sb_greatlamp', {
      box: [-4, -56, 72, 124], ink: true,
      v: (o) => (o.lit ? 'l' : o.frozen ? 'z' : 'd'),
      f: (t, o) => (o.lit ? kit.flickLively(t, o, 140) : 0), // the chapter's flame: lively (props balance pass)
      draw(g, M, v, f) {
        const s5 = ramp('#3a3440', 0.4, 0.45);
        R(g, 10, 48, 44, 12, s5[2]); R(g, 10, 48, 44, 2, s5[4]);
        cyl(g, 26, 12, 12, 36, s5);
        R(g, 6, -48, 52, 6, s5[2]); R(g, 6, -48, 52, 1, s5[4]); R(g, 8, 10, 48, 4, s5[2]); R(g, 8, 10, 48, 1, s5[4]);
        if (v === 'l') {
          kit.lamp(g, 12, -42, 40, 52, [0, 1, 0, 2][f]);
          kit.fire(g, 32, 4, 12, 26, f, 2);
          R(g, 18, -32, 2, 14, '#3a2a20'); R(g, 44, -32, 2, 14, '#3a2a20');
        } else {
          const gl = v === 'z' ? ICE : ['#4a4a58', '#6a6a78', '#8a8a98', '#a4a4b0', '#c0c0cc'];
          R(g, 12, -42, 40, 52, gl[2]); R(g, 12, -42, 4, 52, gl[3]); R(g, 48, -42, 4, 52, gl[1]); R(g, 12, -42, 40, 2, gl[4]);
          if (v === 'z') { for (let i = 0; i < 7; i++) R(g, 14 + i * 5, 10, 2, 5 + (i % 3) * 3, ICE[4]); R(g, 20, -30, 16, 1, '#ffffff'); R(g, 16, -20, 24, 1, 'rgba(255,255,255,0.6)'); }
        }
        for (const x of [12, 31, 51]) R(g, x, -42, 1, 52, s5[1]);
        R(g, 4, -52, 56, 4, s5[1]); R(g, 26, -56, 12, 4, s5[2]);
        K.snowTops(g, -4, -60, 72, 14, SNOW, 3, 2);
      },
      over(g, M, v, f) { if (v === 'l') K.halo(g, 32, -14, 30, '#ffd27a', 0.16 + (f === 1 ? 0.03 : 0)); },
      shadow: () => [32, 60, 26, 4, 0.34],
    });
    // Invisible footprint blocker: nothing to draw.
    if (RB.props.P.sb_blocker) RB.props.P.sb_blocker.draw2 = () => {};
    // The observatory (7×5): a coursed stone drum under a snow-dusted dome
    // with an open slit, the lamp in it (o.lit), a door and two windows,
    // snow on the ledge and icicles while it is dark.
    A('sb_observatory', {
      box: [-10, -44, 244, 216],
      v: (o) => (o.lit ? 1 : 0),
      f: (t, o) => (o.lit ? kit.flick(t, o, 160) : 0),
      draw(g, M, v, f) {
        const s5 = M.stone, W = 224;
        // drum
        for (let i = 0; i < W - 24; i++) R(g, 12 + i, 64, 1, 96, cylCol(i, W - 24, s5));
        for (let r = 0; r < 8; r++) { R(g, 12, 70 + r * 12, W - 24, 1, s5[1]); for (let k = 0; k < 14; k++) { const x = 14 + k * 15 + (r % 2) * 7; if (x < W - 14) { R(g, x, 71 + r * 12, 1, 11, s5[1]); R(g, x + 1, 71 + r * 12, 3, 1, s5[4]); } } }
        R(g, 4, 56, W - 8, 10, s5[3]); R(g, 4, 56, W - 8, 2, s5[4]); R(g, 4, 65, W - 8, 1, s5[0]);
        // dome
        const d5 = v ? ['#6a7888', '#8a98a8', '#b8c4d0', '#d8e0ea', '#f4f8fc'] : ['#7a8898', '#9aa8b8', '#c8d6e2', '#e4ecf4', '#ffffff'];
        K.shade(g, 24, -32, 176, 92, d5, (fx, fy) => {
          const nx = (fx - 112) / 88, ny = (fy - 60) / 88;
          if (fy > 58 || nx * nx + ny * ny > 1) return null;
          const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
          let I = -0.55 * nx - 0.5 * ny + 0.5 * nz - 0.1;
          if (Math.abs(Math.atan2(ny, nx) + Math.PI / 2) % 0.6 < 0.03) I -= 0.3;
          return I;
        }, 9, 0.06, 8, 4);
        // slit and lamp
        R(g, 100, -24, 24, 82, '#1a2030'); R(g, 100, -24, 2, 82, '#2a3448');
        if (v) { kit.lamp(g, 104, 10, 16, 34, [0, 1, 0, 2][f]); kit.fire(g, 112, 40, 8, 18, f, 1); }
        else { R(g, 104, 14, 16, 30, '#6a88a8'); R(g, 104, 14, 16, 2, '#8aa8c8'); }
        // door and windows
        R(g, 97, 122, 30, 38, '#231a20'); R(g, 100, 125, 24, 35, M.wood[2]);
        for (let i = 0; i < 24; i += 6) R(g, 100 + i, 125, 1, 35, M.wood[1]); R(g, 115, 142, 2, 3, BR[3]);
        R(g, 94, 116, 36, 6, s5[2]); R(g, 94, 116, 36, 1, s5[4]);
        for (const wx of [40, 164]) { R(g, wx - 1, 87, 22, 30, '#231a20'); if (v) kit.lamp(g, wx, 88, 20, 28, 0); else { R(g, wx, 88, 20, 28, '#6a88a8'); R(g, wx, 88, 20, 4, '#8aa8c8'); } R(g, wx + 9, 88, 2, 28, '#231a20'); }
        K.snowTops(g, -10, -44, 244, 130, SNOW, 5, 4);
        if (!v) for (let i = 0; i < 22; i++) { const L = 4 + ((i * 5) % 9); R(g, 12 + i * 9, 66, 2, Math.ceil(L / 2), ICE[3]); R(g, 12 + i * 9, 66 + Math.ceil(L / 2), 1, L >> 1, ICE[2]); }
      },
      over(g, M, v, f) { if (v) { K.halo(g, 112, 26, 34, '#ffd27a', 0.14 + (f === 1 ? 0.03 : 0)); } },
      ground(g) { R(g, 8, 158, 216, 6, 'rgba(22,16,40,0.26)'); },
    });
    // Futon on tatami (o.col: the quilt's colour).
    A('sb_futon', {
      box: [-2, -2, 36, 68],
      v: (o) => o.col || '#6a7aa8',
      draw(g, M, v) {
        const q = ramp(v, 0.45, 0.35);
        R(g, 2, 2, 28, 60, PP[3]); R(g, 2, 2, 28, 1, PP[4]); R(g, 29, 2, 1, 60, PP[1]);
        R(g, 5, 4, 22, 10, PP[4]); R(g, 5, 13, 22, 1, PP[1]); R(g, 7, 5, 4, 7, '#ffffff');
        R(g, 2, 18, 28, 44, q[2]); R(g, 2, 18, 28, 3, q[4]); R(g, 2, 21, 28, 1, q[1]); R(g, 2, 18, 2, 44, q[3]); R(g, 28, 18, 2, 44, q[1]);
        for (let i = 0; i < 3; i++) { R(g, 7 + i * 8, 26 + i * 10, 4, 4, q[3]); R(g, 8 + i * 8, 27 + i * 10, 2, 2, q[4]); }
        R(g, 2, 44, 28, 1, q[1]);
      },
      shadow: () => [16, 62, 15, 2, 0.2],
    });
    // Stacked firewood, end grain out (snow on top outdoors).
    A('sb_woodpile', {
      box: [-2, -20, 68, 54],
      v: (o) => (o.indoor ? 1 : 0),
      draw(g, M, v) {
        const w5 = M.wood;
        for (let r = 0; r < 3; r++) for (let k = 0; k < 5 - (r % 2); k++) {
          const cx = 7 + k * 12 + (r % 2) * 6, cy = 22 - r * 10;
          ell(g, cx, cy, 6, 5, w5[1]); ell(g, cx - 0.5, cy - 0.5, 5, 4, w5[3]); ell(g, cx - 1, cy - 1, 2.6, 2, w5[4]); R(g, cx - 1, cy - 1, 1, 1, w5[2]);
        }
        if (!v) K.snowTops(g, -2, -20, 68, 30, SNOW, 3, 3);
      },
      shadow: () => [32, 29, 30, 3, 0.3],
    });
    // Snow sculptures for the children's contest.
    A('sb_snowgoat', {
      box: [-6, -16, 44, 50],
      v: (o) => (o.oneHorn ? 1 : 0),
      draw(g, M, v) {
        shadeBall(g, 17, 18, 13, 9, SNOW, 1);
        shadeBall(g, 7, 6, 7, 6, SNOW, 2);
        line(g, 3, 1, 1, -7, '#8a7a6a', 2); if (!v) line(g, 8, 0, 9, -8, '#8a7a6a', 2);
        R(g, 4, 5, 2, 2, '#2a2a2a'); R(g, 5, 11, 4, 3, '#e8e0d0');
        for (const x of [9, 14, 21, 26]) R(g, x, 25, 3, 4, SNOW[2]);
      },
      shadow: () => [17, 29, 14, 3, 0.25],
    });
    A('sb_snowobs', {
      box: [0, -20, 32, 54],
      draw(g) {
        R(g, 6, 4, 20, 24, SNOW[3]); R(g, 6, 4, 3, 24, SNOW[4]); R(g, 23, 4, 3, 24, SNOW[1]);
        shadeBall(g, 16, 4, 10, 9, SNOW, 3); R(g, 6, 4, 20, 1, SNOW[2]);
        R(g, 14, 14, 4, 14, '#9ab0c0'); R(g, 15, -4, 2, 8, '#6a88a8');
        ell(g, 16, -8, 3.5, 3.5, '#c83a3a'); R(g, 15, -10, 1, 1, '#f08a7a');
      },
      shadow: () => [16, 29, 12, 3, 0.25],
    });
    A('sb_snowfox', {
      box: [-4, -12, 40, 46],
      v: (o) => (o.bigTail ? 1 : 0),
      draw(g, M, v) {
        shadeBall(g, 26, 12, 7, v ? 9 : 5, SNOW, 4);
        shadeBall(g, 14, 18, 12, 8, SNOW, 1);
        shadeBall(g, 8, 6, 7, 6, SNOW, 2);
        poly(g, [3, 2, 4, -6, 8, 0], SNOW[3]); poly(g, [9, 0, 12, -7, 14, 1], SNOW[2]);
        R(g, 5, 5, 2, 2, '#3a2a2a'); R(g, 2, 8, 2, 1, '#3a2a2a');
      },
      shadow: () => [16, 29, 14, 3, 0.25],
    });
  })();

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

  // ---- battle art ----------------------------------------------------------------------------
  // The Lamp That Waited (sb_frostlamp) and the Snow Fox (sb_snowfox) are drawn by
  // src/ui/78n_lanterns.js and src/ui/78q_foxes.js (battle addendum, Creatures B): rigs with
  // authored action poses and their own deliveries.
})();
