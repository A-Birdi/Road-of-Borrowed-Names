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

  // ---- the top of the lighthouse (sg.lighthouse_top) ----------------------------------------
  // The lamp room (3×2): a stone base, glass panes in an iron frame with the
  // great lens inside, a verdigris dome, a small iron door onto the gallery.
  def('sg_lamproom', { w: 3, h: 2 }, (c, x, y, p) => {
    px(c, x + 2, y + 18, 44, 13, p.stone[2]); px(c, x + 2, y + 18, 44, 2, p.stone[1]);
    px(c, x + 6, y - 4, 36, 23, '#4f8a92');
    px(c, x + 17, y - 1, 14, 18, '#e0c070'); px(c, x + 17, y + 6, 14, 3, '#fff4c8');
    for (let i = 0; i < 5; i++) px(c, x + 6 + i * 9, y - 4, 1, 23, '#2c2a36');
    px(c, x + 4, y - 6, 40, 3, '#2c2a36');
    c.fillStyle = '#468670'; c.beginPath(); c.moveTo(x + 4, y - 6); c.quadraticCurveTo(x + 24, y - 26, x + 44, y - 6); c.closePath(); c.fill();
    px(c, x + 22, y - 24, 4, 4, '#2c5a4f'); px(c, x + 23, y - 29, 1, 5, '#2c2a36');
    px(c, x + 20, y + 10, 8, 20, '#2c2a36'); px(c, x + 26, y + 20, 1, 1, '#d6b056');
  });
  // The weather vane on its mast (o.free: turning in the wind; still with o.still).
  def('sg_vane', {}, (c, x, y, p, t, o) => {
    px(c, x + 4, y + 12, 8, 3, p.stone[2]);
    px(c, x + 7, y - 17, 2, 29, '#2c2a36');
    px(c, x + 2, y - 8, 12, 1, '#46444f');
    const a = o.free ? (o.still ? 0.26 : 0.26 + Math.sin(t / 1100) * 0.4) : 0.36, k = Math.cos(a);
    px(c, Math.round(x + 8 - 12 * k), y - 18, Math.round(12 * k), 1, '#2c2a36');
    px(c, x + 8, y - 22, Math.round(12 * k), 9, o.free ? '#57545f' : '#7a5036');
  });
  // The gallery railing, just outside the walkable gallery (o.side: n s w e nw ne sw se;
  // o.worn: the paint rubbed away where a hand has held it for fifty years).
  def('sg_rail', {}, (c, x, y, p, t, o) => {
    const s = o.side || 'n', col = '#33463f', top = o.worn ? '#b4b2bc' : '#4f665a';
    if (s[0] === 'n') { px(c, x, y + 3, 16, 2, top); for (const k of [4, 12]) px(c, x + k, y + 3, 1, 13, col); }
    else if (s[0] === 's') { px(c, x, y - 13, 16, 2, top); for (const k of [4, 12]) px(c, x + k, y - 13, 1, 13, col); px(c, x, y, 16, 4, p.stone[2]); }
    if (s.indexOf('w') >= 0) px(c, x + 14, y - 12, 2, 16, top);
    if (s.indexOf('e') >= 0) px(c, x, y - 12, 2, 16, top);
  });
  // The stairhead: the round well in the gallery floor where the spiral stair comes up.
  def('sg_hatch', { block: false }, (c, x, y, p) => {
    c.fillStyle = p.stone[2]; c.beginPath(); c.ellipse(x + 8, y + 8.5, 7, 5, 0, 0, 7); c.fill();
    c.fillStyle = '#141018'; c.beginPath(); c.ellipse(x + 8, y + 8.5, 6, 4, 0, 0, 7); c.fill();
    px(c, x + 3, y + 9, 5, 2, p.stone[0]); px(c, x + 7, y + 6, 1, 5, '#46444f');
  });

  // ---- art-resolution versions (draw2; rules and helpers: src/engine/26–28_*.js) ----
  (function () {
    const A = RB.propArt && RB.propArt.art, K = RB.propKit;
    if (!A) return;
    const kit = RB.propArt.kit, { R, ell, poly, line, cyl, cylCol, streaks, mix, ramp, hh } = K;
    const IR = K.FIX.iron, BR = K.FIX.brass, PP = K.FIX.paper, ROPE = ramp('#c8b890', 0.45, 0.3);
    const bobF = (t, o, ms) => (o.still ? 1 : Math.round(Math.sin(t / ms)) + 1);
    // Ferry: a planked hull with a lit gunwale, a cabin with a red roof, a
    // mast with stays; it rides the swell (three cached frames).
    A('sg_ferry', {
      box: [-6, -48, 176, 96],
      f: (t, o) => bobF(t, o, 700),
      draw(g, M, v, f) {
        const w5 = M.wood, b = (f - 1) * 2, rf = ramp('#b2573f', 0.45, 0.35);
        line(g, 121, -40 + b, 152, 20 + b, ROPE[1], 1); line(g, 121, -40 + b, 70, -8 + b, ROPE[1], 1);
        cyl(g, 119, -42 + b, 4, 66, w5); R(g, 110, -30 + b, 22, 2, w5[2]);
        // cabin
        for (let i = 0; i < 52; i += 6) kit.plank(g, 52 + i, -4 + b, Math.min(6, 52 - i), 28, w5, i, true);
        for (const wx of [58, 84]) { R(g, wx - 1, 1 + b, 12, 10, '#231a20'); R(g, wx, 2 + b, 10, 8, '#8fb0c4'); R(g, wx, 2 + b, 10, 3, '#b8d0dc'); R(g, wx + 5, 2 + b, 1, 8, '#231a20'); }
        R(g, 72, 6 + b, 9, 18, w5[1]); R(g, 73, 7 + b, 7, 17, w5[2]);
        poly(g, [46, -4 + b, 110, -4 + b, 104, -12 + b, 52, -12 + b], rf[2]); R(g, 52, -12 + b, 52, 2, rf[4]); R(g, 46, -5 + b, 64, 2, rf[0]);
        // hull: strakes narrowing toward the keel
        const hull = [2, 24, 158, 24, 146, 56, 14, 56];
        poly(g, hull.map((v2, i) => (i % 2 ? v2 + b : v2)), w5[1]);
        for (const [y, c] of [[27, w5[3]], [35, w5[2]], [43, w5[2]], [50, w5[1]]]) {
          const k0 = (y - 24) / 32, k1 = (y + 7 - 24) / 32;
          poly(g, [2 + 12 * k0, y + b, 158 - 12 * k0, y + b, 158 - 12 * k1, y + 7 + b, 2 + 12 * k1, y + 7 + b], c);
          line(g, 2 + 12 * k0, y + b, 158 - 12 * k0, y + b, w5[0], 1);
        }
        kit.plank(g, 0, 21 + b, 160, 5, w5, 7);
        for (let x = 10; x < 156; x += 16) R(g, x, 22 + b, 2, 3, w5[1]);
        R(g, 130, 16 + b, 10, 5, ROPE[2]); R(g, 130, 16 + b, 10, 1, ROPE[4]);
      },
      over(g, M, v, f) {
        const b = (f - 1) * 2, w = M.water;
        for (let x = 16; x < 146; x += 9) R(g, x + (f % 2) * 2, 57 + b, 6, 1, w[3]);
        R(g, 6, 60, 16, 1, w[2]); R(g, 140, 59, 18, 1, w[2]);
      },
      ground(g, M) { ell(g, 80, 56, 76, 7, K.rgba(M.water[0], 0.75)); },
    });
    // Tide table (interactable): a slate on posts with a chalked tide curve.
    A('sg_tideboard', {
      box: [-2, -22, 68, 56], ink: true,
      draw(g, M) {
        const w5 = M.wood, sl = ramp('#2e3a3e', 0.4, 0.3);
        kit.post(g, 6, 12, 4, 18, w5); kit.post(g, 54, 12, 4, 18, w5);
        R(g, 2, -16, 60, 34, w5[1]); R(g, 2, -16, 60, 1, w5[4]); R(g, 2, 17, 60, 1, w5[0]);
        R(g, 5, -13, 54, 28, sl[2]); R(g, 5, -13, 54, 2, sl[3]); R(g, 5, 13, 54, 2, sl[1]);
        for (let x = 8; x < 57; x++) R(g, x, Math.round(-1 - Math.sin(((x - 8) / 48) * Math.PI * 2) * 7), 1, 2, '#e8f0f0');
        for (let i = 0; i < 5; i++) R(g, 10 + i * 10, 8, 1, 3, '#c8d8d8');
        R(g, 44, -9, 6, 1, '#c8d8d8'); R(g, 9, -9, 4, 1, '#f0c8a0');
        R(g, 4, 18, 56, 2, w5[3]);
      },
      shadow: () => [32, 30, 28, 2.5, 0.3],
    });
    // Lighthouse lens on its stand: stacked prism rings round a bright core.
    A('sg_lens', {
      box: [-4, -26, 40, 60],
      f: (t, o) => K.frame(t, 160, 6, o.still),
      draw(g, M, v, f) {
        cyl(g, 10, 16, 12, 12, IR); R(g, 7, 27, 18, 3, IR[2]); R(g, 7, 27, 18, 1, IR[4]);
        const L = [0.72, 0.8, 0.9, 1, 0.9, 0.8][f];
        K.shade(g, 4, -14, 24, 32, ['#a88a4a', '#e0c070', '#ffe6a0', '#fff4c8', '#ffffff'], (fx, fy) => {
          const nx = (fx - 16) / 11, ny = (fy - 2) / 15, d = nx * nx + ny * ny;
          if (d > 1) return null;
          let I = L - d * 0.9 + (Math.floor(fy + 20) % 4 === 0 ? -0.35 : 0) - nx * 0.15;
          return I;
        }, 3, 0);
        for (const x of [8, 16, 24]) R(g, x, -12, 1, 28, BR[x === 16 ? 3 : 1]);
        R(g, 6, -14, 20, 2, BR[2]); R(g, 6, 16, 20, 2, BR[1]);
      },
      over(g, M, v, f) { K.halo(g, 16, 2, 18, '#ffe6a0', [0.12, 0.16, 0.2, 0.24, 0.2, 0.16][f]); },
      shadow: () => [16, 30, 10, 2.5, 0.3],
    });
    // Fog bank: soft stepped veils drifting a little (not outlined).
    A('sg_fog', {
      box: [-20, -14, 72, 52], outline: false,
      f: (t, o) => (o.still ? 2 : Math.round(Math.sin(t / 900 + (o.cx | 0) * 1.6) * 2) + 2),
      draw(g, M, v, f) {
        const s = (f - 2) * 3;
        const blob = (cx, cy, rx, ry) => { ell(g, cx, cy, rx, ry, 'rgba(232,236,242,0.2)'); ell(g, cx, cy, rx - 3, ry - 2, 'rgba(236,240,246,0.2)'); ell(g, cx, cy - 1, rx - 7, ry - 4, 'rgba(248,250,255,0.18)'); };
        blob(16 + s, 16, 24, 15);
        blob(8 - s, 8, 16, 10);
        blob(26 - s, 22, 14, 8);
      },
    });
    // Card-catalogue cabinet: sixteen drawers with brass pulls and label slots.
    function catalogue(g, M, x0, y0, w, rows, cols, label) {
      const w5 = M.wood, cw = Math.floor((w - 6) / cols), rh = 10;
      R(g, x0, y0, w, rows * rh + 6, w5[1]);
      for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) {
        const dx = x0 + 3 + k * cw, dy = y0 + 3 + r * rh;
        R(g, dx, dy, cw - 1, rh - 1, w5[3]); R(g, dx, dy, cw - 1, 1, w5[4]); R(g, dx + cw - 2, dy + 1, 1, rh - 2, w5[1]); R(g, dx, dy + rh - 2, cw - 1, 1, w5[2]);
        const lc = label(r, k);
        if (lc) { R(g, dx + 3, dy + 2, cw - 7, 3, lc); R(g, dx + 3, dy + 2, cw - 7, 1, mix(lc, '#ffffff', 0.4)); }
        R(g, dx + (cw >> 1) - 2, dy + 6, 3, 1, BR[3]);
      }
    }
    RB.propArt.kit.catalogue = catalogue;
    A('sg_drawers', {
      box: [-2, -26, 68, 60],
      draw(g, M) {
        catalogue(g, M, 2, -20, 60, 4, 4, () => '#e8e0cc');
        kit.plank(g, 0, -23, 64, 4, M.wood, 2);
        R(g, 2, 26, 60, 4, M.wood[1]); R(g, 2, 26, 60, 1, M.wood[2]);
      },
      shadow: () => [32, 30, 30, 2.5, 0.3],
    });
    // Wreck: a fishing boat heeled over in the sand, ribs showing through
    // broken planks, a nameplate washed blank, weed and a sand drift.
    A('sg_wreck', {
      box: [-8, -10, 112, 80],
      draw(g, M, v, f, info, pal) {
        const w5 = M.wood, sd = ramp(pal.sand[0], 0.4, 0.3);
        poly(g, [4, 18, 90, 8, 82, 52, 14, 56], w5[1]);
        for (let i = 0; i < 4; i++) { const t0 = i / 4, t1 = (i + 1) / 4; poly(g, [4 + 10 * t0, 18 + 38 * t0 - 2, 90 - 8 * t0, 8 + 44 * t0, 90 - 8 * t1, 8 + 44 * t1, 4 + 10 * t1, 18 + 38 * t1 - 2], i % 2 ? w5[2] : w5[3]); }
        // broken strakes: dark gaps with ribs across them
        poly(g, [30, 14, 62, 11, 60, 24, 32, 27], '#2a2018');
        for (let x = 34; x < 62; x += 6) line(g, x, 13 - (x - 30) * 0.1, x - 1, 26 - (x - 30) * 0.1, w5[3], 2);
        R(g, 36, 32, 30, 11, PP[1]); R(g, 37, 33, 28, 9, PP[4]); R(g, 37, 33, 28, 1, '#ffffff');
        line(g, 4, 18, 90, 8, w5[4], 1);
        for (let i = 0; i < 5; i++) line(g, 70 + i * 3, 50, 72 + i * 3 + (i % 2), 40, '#4a6a3a', 1);
        ell(g, 22, 56, 22, 7, sd[2]); ell(g, 20, 54, 16, 4, sd[3]); R(g, 10, 51, 10, 1, sd[4]);
      },
      shadow: () => [48, 58, 46, 5, 0.3],
    });
    // Market stall: panelled counter, striped awning with a scalloped edge,
    // the day's fish (o.empty: an empty counter).
    A('sg_stall', {
      box: [-6, -58, 108, 94],
      v: (o) => (o.empty ? 1 : 0),
      draw(g, M, v) {
        const w5 = M.wood;
        kit.post(g, 4, -40, 4, 44, w5); kit.post(g, 88, -40, 4, 44, w5);
        R(g, 0, 10, 96, 20, w5[2]);
        for (let i = 0; i < 4; i++) { const x = 3 + i * 23; R(g, x, 13, 21, 13, w5[1]); R(g, x + 1, 14, 19, 11, w5[3]); R(g, x + 1, 14, 19, 1, w5[4]); }
        kit.top(g, -1, 2, 98, 7, 2, w5, 3);
        if (!v) for (let i = 0; i < 6; i++) {
          const fx = 10 + i * 14, fr = ramp(i % 2 ? '#a8b8c8' : '#c8a8a0', 0.4, 0.4);
          ell(g, fx + 5, 5, 6, 2.6, fr[2]); R(g, fx + 1, 3, 8, 1, fr[4]); R(g, fx + 2, 7, 7, 1, fr[1]);
          poly(g, [fx - 4, 2, fx, 5, fx - 4, 8], fr[1]); R(g, fx + 8, 4, 1, 1, '#1a1a22');
        }
        // awning
        for (let i = 0; i < 16; i++) {
          const x = -4 + i * 6.5, c = ramp(i % 2 ? '#e8e4dc' : '#4a6a9a', 0.4, 0.3);
          R(g, Math.round(x), -52, 7, 14, c[2]); R(g, Math.round(x), -52, 7, 2, c[4]); R(g, Math.round(x), -40, 7, 2, c[1]);
          ell(g, Math.round(x) + 3.5, -38, 3.5, 2.5, c[2]);
        }
        R(g, -4, -53, 104, 1, '#231a20');
      },
      over(g) { R(g, 2, -34, 92, 3, 'rgba(22,16,40,0.18)'); },
      shadow: () => [48, 30, 48, 3, 0.3],
    });
    // Raft: a catalogue cabinet floated face-up and tied off (walkable).
    A('sg_raft', {
      box: [-30, -6, 100, 144],
      f: (t, o) => bobF(t, o, 600),
      draw(g, M, v, f) {
        const w5 = M.wood, b = f - 1;
        R(g, 4, 4 + b, 56, 120, w5[1]);
        R(g, 7, 7 + b, 50, 114, w5[2]);
        for (let r = 0; r < 7; r++) for (let k = 0; k < 2; k++) { const x = 10 + k * 23, y = 12 + r * 16 + b; R(g, x, y, 21, 13, w5[3]); R(g, x, y, 21, 1, w5[4]); R(g, x + 20, y, 1, 13, w5[1]); R(g, x + 8, y + 6, 5, 1, BR[3]); }
        for (let x = 4; x < 60; x += 1) if (x % 7 === 0) R(g, x, 4 + b, 1, 120, w5[0]);
        for (let i = 0; i < 16; i++) R(g, Math.round(-26 + i * 2), Math.round(132 - Math.sin(i / 16 * Math.PI) * 8 - i * 0.6) + (i > 12 ? b : 0), 2, 1, ROPE[2]);
        R(g, 2, 116 + b, 8, 4, ROPE[3]);
      },
      ground(g, M) { R(g, 4, 124, 58, 3, K.rgba(M.water[0], 0.6)); },
    });
    // Mooring bollard: an iron post with a flared cap and a coil of rope.
    A('sg_bollard', {
      box: [0, -2, 32, 36],
      draw(g) {
        cyl(g, 10, 8, 12, 21, IR);
        cyl(g, 8, 4, 16, 5, IR); R(g, 8, 4, 16, 1, IR[4]);
        for (let i = 0; i < 3; i++) { cyl(g, 9, 13 + i * 3, 14, 2, ROPE); R(g, 9, 15 + i * 3, 14, 1, ROPE[0]); }
        line(g, 22, 18, 30, 26, ROPE[2], 2);
      },
      shadow: () => [16, 29, 9, 2.5, 0.32],
    });

    // ---- the top of the lighthouse -------------------------------------------------------------
    // Painted iron (white, weathered to grey on the shaded side); where a hand
    // has held the rail for fifty years the paint is gone and the bare iron shines.
    const PAINT = ['#5d6570', '#9aa2aa', '#c8cdd0', '#e4e7e6', '#f7f8f4'];
    const BARE = ['#2a2830', '#4a4852', '#7a7884', '#aeacb6', '#dcdae2'];
    const VERD = ['#1f3d38', '#2c5a4f', '#468670', '#6eaf90', '#a2d8bc'];
    const VANE = ['#26242e', '#3a3843', '#55525d', '#75717c', '#a29ea8'];
    const RUST = ramp('#7a5036', 0.45, 0.35);
    const HT = 24; // the railing's height (art px)
    // The railing stands just outside the walkable gallery (its tiles are off
    // the map, so the map's edge is the line you cannot pass). North: its foot
    // on the map's top edge, a stone lip beyond. South: in front of whoever
    // stands at the edge, over the slab's face and its corbels (the drop below).
    // West and east: the top rail seen from above, a bar along the edge raised
    // by the rail's height, with post caps and the posts' feet on the floor.
    function railTop(g, x, y, w, r5) { R(g, x, y, w, 3, r5[2]); R(g, x, y, w, 1, r5[4]); R(g, x, y + 2, w, 1, r5[0]); }
    function railPost(g, x, y0, y1, r5) { cyl(g, x, y0, 3, y1 - y0, r5); R(g, x - 1, y1 - 2, 5, 2, r5[1]); R(g, x - 1, y1 - 2, 5, 1, r5[2]); }
    function railSide(g, x, r5) {
      // the bar (lit on its left face) and two post caps
      R(g, x, -HT, 3, 32, r5[2]); R(g, x, -HT, 1, 32, r5[4]); R(g, x + 2, -HT, 1, 32, r5[0]);
      for (const y of [8 - HT, 24 - HT]) { R(g, x - 1, y - 1, 5, 3, r5[3]); R(g, x - 1, y - 1, 5, 1, r5[4]); R(g, x - 1, y + 1, 5, 1, r5[1]); }
    }
    A('sg_rail', {
      box: [-6, -30, 44, 66], outline: false,
      v: (o) => (o.side || 'n') + (o.worn ? '*' : ''),
      draw(g, M, v) {
        const side = v.replace('*', ''), worn = v.indexOf('*') >= 0, s5 = M.stone, top = worn ? BARE : PAINT;
        if (side[0] === 'n') {
          // tile above the map: the gallery's edge is this tile's bottom (y 32)
          const x0 = side === 'nw' ? 29 : 0, x1 = side === 'ne' ? 3 : 32;
          R(g, x0, 28, x1 - x0, 1, s5[4]); R(g, x0, 29, x1 - x0, 3, s5[2]);
          const posts = side === 'n' ? [7, 23] : side === 'nw' ? [29] : [0];
          for (const px0 of posts) railPost(g, px0, 32 - HT, 32, PAINT);
          if (side === 'n') { R(g, 0, 19, 32, 2, PAINT[2]); R(g, 0, 19, 32, 1, PAINT[3]); R(g, 0, 20, 32, 1, PAINT[0]); }
          railTop(g, x0, 30 - HT, x1 - x0, top);
          if (worn && side === 'n') { R(g, 3, 30 - HT, 10, 1, '#ffffff'); R(g, 18, 31 - HT, 6, 1, BARE[3]); }
        } else if (side[0] === 's') {
          // tile below the map: the gallery's edge is this tile's top (y 0)
          const x0 = side === 'sw' ? 29 : 0, x1 = side === 'se' ? 3 : 32;
          R(g, x0, 0, x1 - x0, 1, s5[4]); R(g, x0, 1, x1 - x0, 5, s5[2]); R(g, x0, 5, x1 - x0, 1, s5[1]); R(g, x0, 6, x1 - x0, 1, s5[0]);
          if (side === 's') for (const cx of [6, 22]) { R(g, cx, 7, 5, 2, s5[1]); R(g, cx + 1, 9, 3, 2, s5[1]); R(g, cx + 2, 11, 1, 1, s5[0]); R(g, cx, 7, 1, 2, s5[2]); }
          const posts = side === 's' ? [7, 23] : side === 'sw' ? [29] : [0];
          for (const px0 of posts) railPost(g, px0, -HT, 0, PAINT);
          if (side === 's') { R(g, 0, -12, 32, 2, PAINT[2]); R(g, 0, -12, 32, 1, PAINT[3]); R(g, 0, -11, 32, 1, PAINT[0]); }
          railTop(g, x0, -2 - HT, x1 - x0, top);
        } else if (side === 'w') {
          // tile left of the map: the edge is this tile's right side (x 32)
          railSide(g, 29, top);
          if (worn) { R(g, 29, 2 - HT, 1, 14, '#ffffff'); }
          for (const y of [8, 24]) { R(g, 32, y - 1, 3, 2, PAINT[1]); R(g, 32, y + 1, 3, 1, 'rgba(22,16,40,0.3)'); }
        } else {
          // tile right of the map: the edge is this tile's left side (x 0)
          railSide(g, 0, top);
          for (const y of [8, 24]) { R(g, -3, y - 1, 3, 2, PAINT[1]); R(g, -3, y + 1, 3, 1, 'rgba(22,16,40,0.3)'); }
        }
      },
    });
    // The stairhead: the round well of the spiral stair cut into the gallery
    // floor — a rim of darker stones, the far inner wall catching the light,
    // the top treads turning down round the newel (each a step lower and
    // darker), a brass handrail along the wall (interactable way on: inked).
    A('sg_hatch', {
      box: [-2, -2, 36, 36], ink: true,
      draw(g, M) {
        const s5 = M.stone, cx = 16, cy = 17, rad = Math.PI / 180;
        ell(g, cx, cy, 15.5, 11, s5[1]); ell(g, cx - 0.5, cy - 0.5, 14.5, 10, s5[2]);
        ell(g, cx, cy, 13, 9, '#100c14');
        // the far inner wall: a band under the far rim, lit on the left
        for (let x = 3; x <= 29; x++) {
          const k = (x + 0.5 - cx) / 13;
          if (k * k >= 1) continue;
          const y0 = Math.round(cy - 9 * Math.sqrt(1 - k * k));
          R(g, x, y0, 1, 3, x < 13 ? s5[2] : s5[1]); R(g, x, y0 + 3, 1, 1, s5[0]);
        }
        // treads: the top one at the near side, each next one a step lower and darker,
        // its lit nosing over a shadowed riser
        const pt = (a, r, ry, d) => [cx + r * Math.cos(a * rad), cy + d + ry * Math.sin(a * rad)];
        [[92, 140, s5[4], s5[3]], [140, 188, s5[3], s5[2]], [188, 236, s5[2], s5[1]], [236, 284, s5[1], s5[0]]].forEach(([a0, a1, lit, col], i) => {
          const d = i * 1.5, P = [];
          for (let a = a0; a <= a1; a += 8) P.push(...pt(a, 11.5, 7.8, d));
          for (let a = a1; a >= a0; a -= 24) P.push(...pt(a, 2.5, 1.8, d));
          poly(g, P, col);
          line(g, ...pt(a0, 2.5, 1.8, d), ...pt(a0, 11.5, 7.8, d), '#100c14', 1);
          line(g, ...pt(a1, 2.5, 1.8, d), ...pt(a1, 11.5, 7.8, d), lit, 1);
        });
        cyl(g, cx - 1, cy - 5, 3, 10, IR);
        for (let a = 125; a <= 245; a += 3) R(g, Math.round(cx + 12.5 * Math.cos(a * rad)), Math.round(cy - 3 + 8.5 * Math.sin(a * rad)), 1, 1, BR[3]);
      },
    });
    // The weather vane: an iron arrow and fin on a mast with a compass cross,
    // the fin carved. Stuck (v 0): rust over the plate and in the grooves,
    // the shape lost. Free (v 1, o.free): the grooves clean-cut, the vane
    // swinging gently through nine angles (o.still: held at rest).
    // The carving is three wind lines swept along the fin, not a character: the
    // name itself (風, かぜ) is said in the dialogue with its reading, and a kanji
    // drawn into the art would have none.
    const kz = (u, w) => u >= 9 && u <= 24 && [3, 0, -3].some((c0) => Math.abs(w - (c0 + Math.sin((u - 9) / 2.4) * 1.1)) < 0.6);
    // half-height of the vane at u (pointer < 0 < fin), or -1 outside it
    function vaneHalf(u) {
      if (u < -24 || u > 29) return -1;
      if (u < -15) return (u + 24) * 0.6; // the pointer
      if (u < 6) return 1;                // the shaft
      return 6 + (u - 6) * 0.2;           // the fin (its swallowtail is cut in draw)
    }
    A('sg_vane', {
      box: [-16, -62, 64, 98], ink: true,
      v: (o) => (o.free ? 1 : 0),
      f: (t, o) => (!o.free ? 0 : o.still ? 4 : Math.max(0, Math.min(8, Math.round(4 + 4 * (0.72 * Math.sin(t / 1100) + 0.28 * Math.sin(t / 430 + 1)))))),
      draw(g, M, v, f) {
        const s5 = M.stone, mx = 16, py = -36;
        // plinth and base plate
        ell(g, 16, 27, 10, 4.5, s5[1]); ell(g, 16, 26, 10, 4, s5[2]); ell(g, 15, 25, 8, 3, s5[3]);
        ell(g, 16, 25, 6, 2.5, IR[1]); ell(g, 16, 24.5, 5, 2, IR[2]); R(g, 12, 24, 1, 1, IR[4]); R(g, 19, 25, 1, 1, IR[3]);
        // mast
        cyl(g, 15, py + 2, 3, 25 - py - 2, IR);
        // compass cross (fixed, a little turned) with ball ends — no letters
        line(g, 3, -19, 29, -15, IR[2], 1); line(g, 3, -20, 29, -16, IR[3], 1);
        line(g, 21, -24, 11, -10, IR[2], 1);
        for (const [bx, by] of [[3, -19], [29, -15], [21, -24], [11, -10]]) { ell(g, bx, by, 2, 2, IR[2]); R(g, bx - 1, by - 1, 1, 1, IR[4]); }
        // pivot cap
        R(g, 14, py + 1, 5, 2, IR[3]); R(g, 15, py - 1, 3, 2, IR[2]);
        // the vane, projected: u along it, w up its height; θ turns it about the mast
        const th = v ? 0.26 + ((f - 4) / 4) * 0.42 : 0.36, cs = Math.cos(th), sn = Math.sin(th);
        const base = th > 0.45 ? 3 : 2, plate = v ? VANE : VANE.map((c, i) => mix(c, RUST[i], 0.45));
        const g0 = Math.floor(mx - 26 * cs) - 1, g1 = Math.ceil(mx + 30 * cs) + 1;
        const groove = (u, w) => kz(u, w) && vaneHalf(u) - 1 > Math.abs(w);
        for (let X = g0; X <= g1; X++) {
          const u = (X + 0.5 - mx) / cs;
          const half = vaneHalf(u);
          if (half < 0) continue;
          const yc = py - u * sn * 0.5; // centre line of the vane at this column
          for (let Y = Math.floor(yc - half - 1); Y <= Math.ceil(yc + half + 1); Y++) {
            const w = yc - (Y + 0.5);
            if (Math.abs(w) > half) continue;
            if (u > 26 && Math.abs(w) < (u - 26) * 2) continue; // swallowtail notch
            let col = plate[Math.abs(w) > half - 1 ? 1 : w > half - 3 && u > 6 ? base + 1 : base];
            if (u < 6 && u > -15) col = plate[w > 0 ? 3 : 1]; // the shaft
            const r = hh(Math.floor(u / 2) + 40, Math.floor(w / 2) + 40, 31);
            if (!v && (r & 7) < 3) col = RUST[1 + (r >>> 4) % 3];
            if (groove(u, w)) {
              if (v) col = '#15131b';
              else col = (r >>> 7) % 5 < 2 ? RUST[0] : (r & 7) < 3 ? RUST[2] : plate[base];
            } else if (v && u > 6 && (groove(u - 1 / cs, w) || groove(u, w + 1))) col = '#c9c5cd'; // the cut's lit far edge
            R(g, X, Y, 1, 1, col);
          }
        }
        // finial on the pivot
        R(g, 15, py - 4, 3, 3, IR[3]); R(g, 15, py - 4, 1, 1, IR[4]);
      },
      shadow: () => [16, 28, 10, 3.5, 0.3],
    });
    // The lamp room: a stone base with a small iron door, glass panes in an
    // iron frame with the great lens inside (it gathers the daylight; nothing
    // burns by day), a ring cornice, a verdigris dome with ribs, a ventilator
    // ball and a finial. Interactable (inked).
    A('sg_lamproom', {
      box: [-8, -62, 112, 132], ink: true,
      draw(g, M) {
        const s5 = M.stone, cx = 48;
        const arc = (x, cy, r, ry) => { const k = (x + 0.5 - cx) / r; return k * k >= 1 ? null : cy + ry * Math.sqrt(1 - k * k); };
        // base: the front face between the top and bottom arcs, then its top ring
        for (let x = 2; x < 94; x++) {
          const a = arc(x, 38, 46, 14), b = arc(x, 50, 46, 14);
          if (a == null) continue;
          R(g, x, Math.round(a), 1, Math.round(b) - Math.round(a), cylCol(x - 2, 92, s5));
        }
        ell(g, cx, 38, 46, 14, s5[3]);
        ell(g, cx - 2, 37, 42, 12, s5[4]);
        ell(g, cx, 38, 39, 11.5, s5[1]);
        // the glass room: the dark interior, the lens on its pedestal
        for (let x = 10; x < 86; x++) {
          const top = arc(x, -8, 38, 11), bot = arc(x, 38, 38, 11);
          if (top == null) continue;
          R(g, x, Math.round(top) - 6, 1, Math.round(bot) - Math.round(top) + 6, x < 30 ? '#24434b' : '#1b3138');
        }
        cyl(g, 42, 30, 12, 12, IR);
        const LENS = ['#6a5a3a', '#a88a4a', '#e0c070', '#ffe6a0', '#fff8dc'];
        for (let y = 4; y < 32; y++) for (let x = 34; x < 62; x++) {
          const band = Math.floor((y - 4) / 3), core = y >= 16 && y < 22;
          let k = LENS.indexOf(cylCol(x - 34, 28, LENS));
          if (band % 2) k = Math.max(0, k - 1);
          if (core) k = Math.min(4, k + 1);
          R(g, x, y, 1, 1, LENS[k]);
        }
        R(g, 33, 2, 30, 3, BR[3]); R(g, 33, 2, 30, 1, BR[4]); R(g, 33, 31, 30, 3, BR[2]); R(g, 33, 33, 30, 1, BR[1]);
        R(g, 44, 17, 8, 4, '#ffffff');
        // panes: a faint sky tint and slanted reflections on the lit side
        for (let x = 10; x < 86; x++) {
          const top = arc(x, -8, 38, 11), bot = arc(x, 38, 38, 11);
          if (top == null) continue;
          for (let y = Math.round(top); y < Math.round(bot); y++) {
            const d = (x + y * 0.7) % 24;
            if (x < 46 && d < 3) R(g, x, y, 1, 1, K.rgba('#e8f8fa', x < 28 ? 0.5 : 0.3));
            else if (d < 1) R(g, x, y, 1, 1, K.rgba('#cdeef2', 0.16));
          }
        }
        // the iron frame: six glazing bars round the drum and a transom
        for (const phi of [-75, -45, -15, 15, 45, 75]) {
          const x = Math.round(cx + 38 * Math.sin((phi * Math.PI) / 180)) - 1;
          const top = arc(x, -8, 38, 11), bot = arc(x, 38, 38, 11);
          R(g, x, Math.round(top), 2, Math.round(bot) - Math.round(top), IR[1]); R(g, x, Math.round(top), 1, Math.round(bot) - Math.round(top), IR[3]);
        }
        for (let x = 10; x < 86; x++) { const y = arc(x, 16, 38, 11); if (y != null) { R(g, x, Math.round(y), 1, 2, IR[1]); R(g, x, Math.round(y), 1, 1, IR[3]); } }
        for (let x = 10; x < 86; x++) { const y = arc(x, 37, 38, 11); if (y != null) R(g, x, Math.round(y), 1, 2, IR[2]); }
        // the door onto the gallery: iron, a step in front, a brass handle
        R(g, 41, 26, 14, 36, IR[1]); R(g, 42, 27, 12, 34, IR[2]); R(g, 43, 28, 10, 15, IR[1]); R(g, 43, 45, 10, 14, IR[1]);
        R(g, 42, 27, 1, 34, IR[3]); R(g, 41, 24, 14, 2, IR[0]); R(g, 51, 44, 2, 3, BR[3]); R(g, 51, 44, 1, 1, BR[4]);
        R(g, 39, 61, 18, 3, s5[3]); R(g, 39, 61, 18, 1, s5[4]); R(g, 39, 63, 18, 1, s5[1]);
        // cornice ring
        ell(g, cx, -10, 43, 13, IR[1]); ell(g, cx, -11, 42, 12, VERD[1]);
        for (let x = 6; x < 91; x++) { const y = arc(x, -9, 43, 13); if (y != null) { R(g, x, Math.round(y) - 1, 1, 2, x < 40 ? VERD[2] : VERD[1]); R(g, x, Math.round(y) + 1, 1, 1, IR[0]); } }
        // the dome, lit from the upper left, with ribs down from the crown
        K.shade(g, 4, -44, 90, 46, VERD, (fx, fy) => {
          const nx = (fx - cx) / 42, ny = (fy + 11) / 31;
          // the profile above the base ring, and the front half of the ring itself
          if (nx * nx >= 1 || (fy > -11 && fy > -11 + 12 * Math.sqrt(1 - nx * nx)) || (fy <= -11 && nx * nx + ny * ny > 1)) return null;
          const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
          return -0.55 * nx - 0.5 * ny + 0.55 * nz - 0.25;
        }, 61, 0.18, 4, 3);
        for (const phi of [-60, -30, 0, 30, 60]) {
          const sp = Math.sin((phi * Math.PI) / 180), cp = Math.cos((phi * Math.PI) / 180);
          for (let a = 0.08; a < 1.5; a += 0.04) {
            const x = Math.round(cx + 42 * Math.sin(a) * sp), y = Math.round(-11 - 31 * Math.cos(a) + 12 * Math.sin(a) * cp);
            R(g, x, y, 1, 1, VERD[0]); R(g, x - 1, y, 1, 1, VERD[3]);
          }
        }
        // ventilator ball and finial
        ell(g, cx, -45, 6, 5.5, VERD[1]); ell(g, cx - 1, -46, 4.5, 4, VERD[2]); R(g, cx - 3, -48, 2, 2, VERD[4]);
        R(g, cx - 3, -41, 7, 2, IR[2]);
        R(g, cx, -58, 1, 9, IR[2]); ell(g, cx + 0.5, -58, 1.6, 1.6, IR[3]);
      },
      shadow: () => [48, 56, 50, 12, 0.3],
    });
  })();

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

  // ---- battle art: the Undelivered Letter (sg_letter) is drawn in src/ui/78e_paper.js (Creatures A,
  // battle addendum §9), with its authored poses and deliveries.
})();
