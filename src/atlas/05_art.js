/* Unwritten Atlas — procedural art.
 * Blank-page tiles (the edge of the unwritten world), atlas props, overworld
 * sprites for unmoored names and atlas foes, enemy art for the climax, and
 * cosmetic accessories drawn through a small, contained RB.sprites.get patch
 * (only looks that carry an atlas accessory are touched). */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const T = RB.tiles.T, px = RB.tiles.px, hh = RB.tiles.hh;

  // ---- tiles ------------------------------------------------------------------
  // The edge of the world that has not been written yet: graph paper, faint
  // half-strokes, and a pencil line where the drawn world begins.
  T.atlas_blank = {
    id: 'atlas_blank', walk: false, natural: false,
    draw(c, x, y, p, h, nb) {
      px(c, x, y, 16, 16, '#efe7d2');
      px(c, x, y + 15, 16, 1, '#e3d9c0');
      px(c, x + 15, y, 1, 16, '#e3d9c0');
      if (h % 5 === 0) px(c, x + 2 + (h % 7), y + 4 + ((h >>> 3) % 8), 3 + (h % 3), 1, '#d8ccb0');
      if (h % 13 === 0) { px(c, x + 5, y + 8, 1, 4, '#cfc3a6'); px(c, x + 6, y + 8, 3, 1, '#cfc3a6'); }
      const open = (dx, dy) => { const t = nb(dx, dy); return !!(t && t.walk); };
      const col = '#a89a78';
      if (open(0, 1)) for (let i = 0; i < 16; i += 2) px(c, x + i, y + 14 + (hh(h, i) % 2), 2, 1, col);
      if (open(0, -1)) for (let i = 0; i < 16; i += 2) px(c, x + i, y + (hh(h, i, 2) % 2), 2, 1, col);
      if (open(-1, 0)) for (let i = 0; i < 16; i += 2) px(c, x + (hh(h, i, 3) % 2), y + i, 1, 2, col);
      if (open(1, 0)) for (let i = 0; i < 16; i += 2) px(c, x + 14 + (hh(h, i, 4) % 2), y + i, 1, 2, col);
    },
  };
  // Ground that is only half drawn: pencil hatching on paper. Walkable.
  T.atlas_sketch = {
    id: 'atlas_sketch', walk: true, natural: true,
    draw(c, x, y, p, h) {
      px(c, x, y, 16, 16, '#e6dcc0');
      c.fillStyle = '#cdbf9c';
      const o = h % 4;
      for (let i = -16; i < 16; i += 5) for (let j = 0; j < 16; j++) { const xx = i + j + o; if (xx >= 0 && xx < 16 && (j + h) % 3) c.fillRect(x + xx, y + 15 - j, 1, 1); }
      if (h % 6 === 0) px(c, x + 3, y + 3, 4, 1, '#b8aa86');
    },
  };

  // ---- props -----------------------------------------------------------------------
  const P = RB.props.P;
  const def = (id, props, draw) => (P[id] = Object.assign({ id, w: 1, h: 1, block: true }, props, { draw }));
  const shadow = (c, x, y, w) => { c.fillStyle = 'rgba(0,0,0,0.2)'; c.beginPath(); c.ellipse(x + w / 2, y + 14, w / 2 - 1, 2.5, 0, 0, Math.PI * 2); c.fill(); };

  // Hanging strips of blank paper: the road is not written past this point yet.
  def('atlas_veil', {}, (c, x, y, p, t, o) => {
    const still = o.still;
    for (let i = 0; i < 3; i++) {
      const sway = still ? 0 : Math.round(Math.sin(t / 700 + i + o.cx) * 1.2);
      const bx = x + 1 + i * 5;
      c.fillStyle = 'rgba(248,244,232,0.88)';
      c.fillRect(bx + sway, y - 10, 4, 24);
      c.fillStyle = 'rgba(160,150,120,0.55)';
      c.fillRect(bx + sway + 1, y - 6 + i * 3, 2, 1);
      c.fillRect(bx + sway + 1, y + 2 - i, 1, 3);
      c.fillStyle = 'rgba(120,110,90,0.35)';
      c.fillRect(bx + sway, y + 13, 4, 1);
    }
    c.fillStyle = '#8a7a5a';
    c.fillRect(x, y - 11, 16, 1);
  });
  // An inscription stone with a missing line; o.done shows it restored.
  def('atlas_stone', {}, (c, x, y, p, t, o) => {
    shadow(c, x, y, 14);
    px(c, x + 3, y - 3, 10, 17, p.stone[2]);
    px(c, x + 4, y - 4, 8, 17, p.stone[0]);
    px(c, x + 4, y - 4, 8, 1, p.stone[1]);
    const col = o.done ? '#e0b050' : '#5a5448';
    for (let i = 0; i < 4; i++) {
      const gap = !o.done && i === 2;
      if (gap) { px(c, x + 6, y + i * 3, 1, 1, '#8a8478'); px(c, x + 9, y + i * 3, 1, 1, '#8a8478'); }
      else px(c, x + 6, y + i * 3, 4, 1, col);
    }
    if (o.done && !o.still) { const a = (Math.sin(t / 300) + 1) / 2; c.fillStyle = `rgba(255,220,140,${0.2 + a * 0.3})`; c.fillRect(x + 5, y - 3, 6, 14); }
  });
  // A lantern post whose shade is blank until its name is written.
  def('atlas_lamp', { light: 30 }, (c, x, y, p, t, o) => {
    shadow(c, x, y, 10);
    px(c, x + 7, y + 2, 2, 12, p.wood[2]);
    px(c, x + 4, y - 7, 8, 9, '#4a3a2e');
    if (o.lit === false) {
      px(c, x + 5, y - 6, 6, 7, '#f0e8d4');
      px(c, x + 7, y - 5, 2, 1, '#c8bc9c'); px(c, x + 7, y - 3, 1, 3, '#c8bc9c');
    } else {
      const f = o.still ? 0.9 : 0.8 + Math.sin(t / 240 + o.cx) * 0.15;
      c.fillStyle = `rgba(255,206,120,${f})`;
      c.fillRect(x + 5, y - 6, 6, 7);
      px(c, x + 7, y - 5, 2, 5, '#a8602a');
    }
    px(c, x + 3, y - 8, 10, 1, '#3a2e24');
  });
  // Two-armed signpost for a fork in the road.
  def('atlas_sign', {}, (c, x, y, p) => {
    shadow(c, x, y, 10);
    px(c, x + 7, y - 6, 2, 20, p.wood[2]);
    px(c, x + 1, y - 5, 7, 4, p.wood[1]); px(c, x, y - 4, 1, 2, p.wood[1]);
    px(c, x + 9, y - 1, 7, 4, p.wood[1]); px(c, x + 16, y, 1, 2, p.wood[1]);
    px(c, x + 2, y - 4, 4, 1, '#5a4636'); px(c, x + 10, y, 4, 1, '#5a4636');
  });
  // A bundle wrapped in paper and string: something found on the road.
  def('atlas_cache', { light: 14 }, (c, x, y, p, t, o) => {
    shadow(c, x, y, 12);
    px(c, x + 3, y + 3, 10, 9, '#e8dcbc');
    px(c, x + 3, y + 3, 10, 1, '#fff8e8');
    px(c, x + 7, y + 3, 2, 9, '#a0523a');
    px(c, x + 3, y + 7, 10, 1, '#a0523a');
    px(c, x + 6, y + 1, 4, 2, '#a0523a');
    if (!o.still) { const a = (Math.sin(t / 260 + o.cx) + 1) / 2; c.fillStyle = `rgba(255,244,190,${0.3 + a * 0.6})`; c.fillRect(x + 12, y + 1 + Math.round(a * 2), 1, 3); c.fillRect(x + 11, y + 2 + Math.round(a * 2), 3, 1); }
  });
  // The lantern that already carries Reedwake's name: the way home.
  def('atlas_waystone', { light: 44 }, (c, x, y, p, t, o) => {
    shadow(c, x, y, 14);
    px(c, x + 5, y + 2, 6, 12, p.stone[0]);
    px(c, x + 5, y + 2, 6, 1, p.stone[1]);
    px(c, x + 3, y - 12, 10, 14, '#3a2e24');
    const f = o.still ? 0.95 : 0.85 + Math.sin(t / 300) * 0.1;
    c.fillStyle = `rgba(255,214,130,${f})`;
    c.fillRect(x + 4, y - 11, 8, 12);
    px(c, x + 7, y - 9, 2, 1, '#8a4a22'); px(c, x + 6, y - 7, 4, 1, '#8a4a22'); px(c, x + 7, y - 5, 2, 3, '#8a4a22');
    px(c, x + 2, y - 13, 12, 1, '#2a2018');
  });
  // The road behind folds shut like the corner of a page.
  def('atlas_fold', {}, (c, x, y) => {
    c.fillStyle = '#f6f0e0';
    c.beginPath(); c.moveTo(x + 1, y + 15); c.lineTo(x + 15, y + 15); c.lineTo(x + 15, y + 3); c.closePath(); c.fill();
    c.fillStyle = '#d6cab0';
    c.beginPath(); c.moveTo(x + 1, y + 15); c.lineTo(x + 15, y + 3); c.lineTo(x + 9, y + 11); c.closePath(); c.fill();
    c.fillStyle = 'rgba(90,80,60,0.25)'; c.fillRect(x + 1, y + 15, 14, 1);
  });
  // A great blank map spread on the floor (climax room).
  def('atlas_map', { w: 3, h: 2, block: false }, (c, x, y, p, t, o) => {
    px(c, x + 1, y + 2, 46, 28, '#a89c80');
    px(c, x, y + 1, 46, 28, '#f2ead6');
    c.fillStyle = '#c8bc9c';
    for (let i = 0; i < 5; i++) c.fillRect(x + 3 + i * 9, y + 4, 1, 22);
    for (let j = 0; j < 3; j++) c.fillRect(x + 2, y + 6 + j * 8, 42, 1);
    c.fillStyle = o.done ? '#8a5a2a' : '#b8ac8c';
    c.fillRect(x + 6, y + 20, 12, 1); c.fillRect(x + 17, y + 12, 1, 9); c.fillRect(x + 17, y + 12, 16, 1); c.fillRect(x + 32, y + 8, 1, 5);
    if (o.done) { c.fillStyle = '#c85a3a'; c.fillRect(x + 31, y + 7, 3, 3); }
  });

  // ---- art-resolution versions (32×32 tiles, cached prop sprites) --------------------------
  // Same rules as src/engine/27_propart.js: pencil and paper for the unwritten
  // world, ink outlines on the things you can act on.
  (function () {
    const K = RB.propKit, pa = RB.propArt;
    if (!K || !pa) return;
    const { R, ell, poly, line, mix, ramp } = K;
    const art = pa.art, kit = pa.kit;
    const PAPER = ['#b8aa86', '#cfc3a6', '#e3d9c0', '#efe7d2', '#f8f2e2'];
    const LEAD = '#8a7c5e', LEAD2 = '#a89a78';
    // Blank page: cream paper ruled as graph paper (a fine grid every 8 px
    // and a firmer one every tile), a few faint unfinished strokes, and a
    // wobbling pencil line with light hatching where the drawn world begins.
    T.atlas_blank.draw2 = function (c, x, y, p, h, nb, tx, ty) {
      R(c, x, y, 32, 32, PAPER[3]);
      c.fillStyle = '#e9e0c8';
      for (let i = 7; i < 32; i += 8) { c.fillRect(x + i, y, 1, 32); c.fillRect(x, y + i, 32, 1); }
      c.fillStyle = PAPER[2];
      c.fillRect(x + 31, y, 1, 32); c.fillRect(x, y + 31, 32, 1);
      if (h % 5 === 0) R(c, x + 4 + (h % 13), y + 8 + ((h >>> 3) % 14), 5 + (h % 5), 1, '#d8ccb0');
      if (h % 13 === 0) { R(c, x + 10, y + 16, 1, 7, '#cfc3a6'); R(c, x + 11, y + 16, 5, 1, '#cfc3a6'); }
      const open = (dx, dy) => { const t = nb(dx, dy); return !!(t && t.walk); };
      const wob = (i, k) => (hh((tx | 0) * 32 + i, (ty | 0) * 32, k) % 3 === 0 ? 1 : 0);
      if (open(0, 1)) for (let i = 0; i < 32; i++) { const d = wob(i, 1); R(c, x + i, y + 29 + d, 1, 2, LEAD); R(c, x + i, y + 27 + d, 1, 1, LEAD2); if (i % 3 === 0) R(c, x + i, y + 24 + d, 1, 2, '#ddd2b6'); }
      if (open(0, -1)) for (let i = 0; i < 32; i++) { const d = wob(i, 2); R(c, x + i, y + 1 - d, 1, 2, LEAD); R(c, x + i, y + 4 - d, 1, 1, LEAD2); }
      if (open(-1, 0)) for (let i = 0; i < 32; i++) { const d = wob(i, 3); R(c, x + 1 - d, y + i, 2, 1, LEAD); R(c, x + 4 - d, y + i, 1, 1, LEAD2); }
      if (open(1, 0)) for (let i = 0; i < 32; i++) { const d = wob(i, 4); R(c, x + 29 + d, y + i, 2, 1, LEAD); R(c, x + 27 + d, y + i, 1, 1, LEAD2); }
    };
    // Half-drawn ground: warm paper with diagonal pencil hatching that runs
    // on across tiles, broken into hand-drawn strokes.
    T.atlas_sketch.draw2 = function (c, x, y, p, h, nb, tx, ty) {
      R(c, x, y, 32, 32, '#e6dcc0');
      const gx0 = (tx | 0) * 32, gy0 = (ty | 0) * 32;
      for (let j = 0; j < 32; j++) for (let i = 0; i < 32; i++) {
        const gx = gx0 + i, gy = gy0 + j;
        if ((gx + gy) % 7 !== 0) continue;
        const seg = Math.floor((gx - gy + 4096) / 9);
        const s = hh(Math.floor((gx + gy) / 7), seg, 9);
        if (s % 4 === 0) continue;
        R(c, x + i, y + j, 1, 1, s % 5 === 1 ? '#bfb08c' : '#cdbf9c');
      }
      if (h % 6 === 0) R(c, x + 6, y + 6, 8, 1, '#b8aa86');
      if (h % 11 === 0) { R(c, x + 18, y + 20, 5, 1, '#c4b692'); R(c, x + 22, y + 21, 1, 3, '#c4b692'); }
    };
    // Paper strips hanging from a cord (five cached sway frames).
    art('atlas_veil', {
      box: [-2, -28, 36, 62],
      f: (t, o) => (o.still ? 2 : Math.round(Math.sin(t / 700 + (o.cx | 0)) * 2) + 2),
      draw(g, M, v, f) {
        R(g, -1, -23, 34, 2, '#8a7a5a'); R(g, -1, -23, 34, 1, '#a8987a');
        for (let i = 0; i < 3; i++) {
          const sw = (f - 2) * (0.6 + i * 0.25), bx = 2 + i * 10;
          for (let y = -21; y < 28; y++) {
            const k = (y + 21) / 49, dx = Math.round(sw * k * k * 2);
            R(g, bx + dx, y, 8, 1, PAPER[y < -18 ? 2 : 4]);
            R(g, bx + dx, y, 1, 1, PAPER[3]); R(g, bx + dx + 7, y, 1, 1, PAPER[1]);
            if ((y + i * 5) % 9 === 0) R(g, bx + dx + 2, y, 3 + (i % 2), 1, '#b8aa88');
          }
          R(g, bx + Math.round(sw * 2), 27, 8, 1, PAPER[1]);
        }
      },
      shadow: () => [16, 30, 15, 2.5, 0.18],
    });
    // Inscription stone with a missing line; o.done restores it in gold.
    art('atlas_stone', {
      box: [0, -16, 32, 50], ink: true,
      v: (o) => (o.done ? 1 : 0),
      f: (t, o) => (o.done && !o.still ? K.frame(t, 200, 6, false) : 0),
      draw(g, M, v) {
        const s5 = M.stone;
        R(g, 5, 25, 22, 6, s5[2]); R(g, 5, 25, 22, 1, s5[4]);
        K.shade(g, 6, -12, 20, 38, s5, (fx, fy) => {
          const dx = fx - 16;
          if (Math.abs(dx) > 9 || fy < -8 + (Math.abs(dx) > 7 ? 2 : 0)) return null;
          return (-dx / 9) * 0.55 + 0.25 - ((fy + 8) / 34) * 0.25 + (Math.abs(dx) > 7.5 ? (dx < 0 ? 0.25 : -0.3) : 0);
        }, 4, 0.1, 4, 3);
        const col = v ? '#e0b050' : s5[0];
        for (let i = 0; i < 4; i++) {
          const y = -3 + i * 6;
          if (!v && i === 2) { R(g, 11, y, 2, 2, s5[1]); R(g, 19, y, 2, 2, s5[1]); continue; }
          R(g, 10, y, 12 - (i % 2) * 3, 2, col); R(g, 10, y + 2, 12 - (i % 2) * 3, 1, v ? '#8a5a20' : s5[4]);
        }
      },
      over(g, M, v, f) { if (v) K.halo(g, 16, 6, 12, '#ffdc8c', [0.1, 0.16, 0.22, 0.25, 0.2, 0.14][f]); },
      shadow: () => [16, 30, 12, 3, 0.3],
    });
    // Lantern post whose paper shade stays blank until its name is written.
    art('atlas_lamp', {
      box: [0, -24, 32, 58], ink: true,
      v: (o) => (o.lit === false ? 0 : 1),
      f: (t, o) => (o.lit === false ? 0 : kit.flick(t, o, 170)),
      draw(g, M, v, f) {
        const w5 = M.wood;
        kit.post(g, 14, 4, 4, 26, w5);
        R(g, 11, 28, 10, 2, w5[1]);
        R(g, 7, -14, 18, 19, '#4a3a2e');
        if (v) { kit.lamp(g, 9, -12, 14, 15, [0, 1, 0, 2][f]); R(g, 15, -9, 2, 1, '#a8602a'); R(g, 14, -7, 4, 1, '#a8602a'); R(g, 15, -5, 2, 4, '#a8602a'); }
        else { R(g, 9, -12, 14, 15, '#f0e8d4'); R(g, 9, -12, 14, 1, '#fbf6e8'); R(g, 15, -9, 3, 1, '#c8bc9c'); R(g, 15, -7, 1, 4, '#c8bc9c'); }
        poly(g, [4, -14, 28, -14, 23, -19, 9, -19], '#3a2e24'); R(g, 9, -19, 14, 1, '#5a4a3a');
        R(g, 14, -22, 4, 3, '#3a2e24');
      },
      over(g, M, v, f) { if (v) K.halo(g, 16, -5, 13, '#ffd27a', 0.13 + (f === 1 ? 0.02 : 0)); },
      shadow: () => [16, 30, 8, 2.5, 0.3],
    });
    // Two-armed signpost for a fork, arrow boards pointing both ways.
    art('atlas_sign', {
      box: [-4, -22, 40, 56], ink: true,
      draw(g, M) {
        const w5 = M.wood, face = kit.signFace(M);
        kit.post(g, 14, -14, 4, 44, w5);
        poly(g, [2, -6, 15, -6, 15, 2, 2, 2, -2, -2], w5[1]); poly(g, [3, -5, 14, -5, 14, 1, 3, 1, 0, -2], face[3]);
        R(g, 4, -5, 10, 1, face[4]); R(g, 5, -3, 8, 1, K.FIX.ink[3]);
        poly(g, [17, 2, 30, 2, 34, 6, 30, 10, 17, 10], w5[1]); poly(g, [18, 3, 29, 3, 32, 6, 29, 9, 18, 9], face[2]);
        R(g, 18, 3, 11, 1, face[4]); R(g, 19, 5, 8, 1, K.FIX.ink[3]);
        R(g, 15, -4, 2, 1, K.FIX.iron[1]); R(g, 15, 5, 2, 1, K.FIX.iron[1]);
      },
      shadow: () => [16, 30, 9, 2.5, 0.3],
    });
    // A bundle wrapped in paper and tied with red string, catching the light.
    art('atlas_cache', {
      box: [0, -8, 32, 42], ink: true,
      f: (t, o) => K.frame(t, 130, 8, o.still, (o.cx | 0) * 0.3),
      draw(g) {
        const pp = K.FIX.paper, st = ramp('#a0523a', 0.4, 0.35);
        R(g, 6, 8, 20, 18, pp[3]); R(g, 6, 8, 20, 2, pp[4]); R(g, 6, 24, 20, 2, pp[1]); R(g, 24, 10, 2, 14, pp[2]);
        line(g, 7, 12, 12, 9, pp[2], 1); line(g, 20, 25, 25, 21, pp[2], 1);
        R(g, 15, 8, 3, 18, st[2]); R(g, 15, 8, 1, 18, st[3]);
        R(g, 6, 16, 20, 3, st[2]); R(g, 6, 16, 20, 1, st[3]);
        R(g, 12, 4, 4, 4, st[2]); R(g, 17, 4, 4, 4, st[1]); R(g, 15, 6, 3, 3, st[3]);
      },
      over(g, M, v, f) {
        if (f >= 6) return;
        const a = [0.3, 0.6, 0.95, 0.8, 0.5, 0.3][f], s = f < 3 ? f + 1 : 5 - f;
        const col = 'rgba(255,244,190,' + a + ')';
        R(g, 26, 2 - s, 1, 2 * s + 1, col); R(g, 26 - s, 2, 2 * s + 1, 1, col);
      },
      shadow: () => [16, 28, 12, 3, 0.3],
    });
    // The lantern that already carries Reedwake's name: the way home.
    art('atlas_waystone', {
      box: [0, -30, 32, 64], ink: true,
      f: (t, o) => kit.flick(t, o, 200),
      draw(g, M, v, f) {
        const s5 = M.stone;
        R(g, 6, 24, 20, 6, s5[2]); R(g, 6, 24, 20, 1, s5[4]);
        K.cyl(g, 10, 4, 12, 20, s5); R(g, 10, 4, 12, 1, s5[4]);
        R(g, 5, -24, 22, 28, '#3a2e24');
        kit.lamp(g, 7, -22, 18, 24, [0, 1, 0, 2][f]);
        for (const x of [12, 19]) R(g, x, -22, 1, 24, '#3a2e24');
        R(g, 15, -17, 2, 1, '#8a4a22'); R(g, 13, -14, 6, 1, '#8a4a22'); R(g, 15, -11, 2, 5, '#8a4a22');
        poly(g, [2, -24, 30, -24, 25, -29, 7, -29], '#2a2018'); R(g, 7, -29, 18, 1, '#4a3a2a');
      },
      over(g, M, v, f) { K.halo(g, 16, -10, 18, '#ffd68a', 0.16 + (f === 1 ? 0.03 : 0)); },
      shadow: () => [16, 30, 12, 3, 0.32],
    });
    // The road behind folds shut like the corner of a page.
    art('atlas_fold', {
      box: [0, 0, 32, 34],
      draw(g) {
        poly(g, [2, 31, 31, 31, 31, 5], '#f6f0e0');
        poly(g, [2, 31, 31, 5, 18, 22], '#d6cab0');
        line(g, 3, 30, 30, 6, '#fbf8ee', 1);
        poly(g, [5, 29, 18, 22, 14, 27], '#c4b898');
      },
      ground(g) { poly(g, [4, 33, 31, 33, 31, 8], 'rgba(90,80,60,0.25)'); },
    });
    // A great blank map spread on the floor; o.done inks its route.
    art('atlas_map', {
      box: [-4, -2, 104, 72], outline: false,
      v: (o) => (o.done ? 1 : 0),
      draw(g, M, v) {
        const pp = K.FIX.paper;
        R(g, 2, 2, 92, 56, pp[3]);
        R(g, 2, 2, 92, 1, pp[4]); R(g, 2, 57, 92, 1, pp[1]); R(g, 93, 2, 1, 56, pp[1]);
        poly(g, [2, 2, 10, 2, 2, 9], pp[1]); poly(g, [86, 58, 94, 58, 94, 51], pp[2]);
        for (let i = 0; i < 6; i++) R(g, 8 + i * 16, 6, 1, 48, '#d8ccac');
        for (let j = 0; j < 4; j++) R(g, 5, 10 + j * 13, 86, 1, '#d8ccac');
        const rc = v ? '#8a5a2a' : '#c8bc9c';
        R(g, 12, 42, 24, 2, rc); R(g, 34, 26, 2, 18, rc); R(g, 34, 26, 32, 2, rc); R(g, 64, 16, 2, 11, rc);
        if (v) { R(g, 61, 13, 7, 7, '#c85a3a'); R(g, 62, 14, 5, 5, '#e07a52'); R(g, 10, 40, 5, 5, '#3a5a8a'); }
        else for (let i = 0; i < 5; i++) R(g, 40 + i * 10, 44 - i * 3, 3, 1, '#d0c4a4');
      },
      ground(g) { R(g, 4, 5, 92, 56, 'rgba(60,50,40,0.25)'); },
    });
  })();

  // ---- overworld sprites (16×24) -----------------------------------------------------
  const R = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  // An unmoored name: a slip of paper that has forgotten where it belongs.
  RB.sprites.custom.atlas_name = (c, look, d, f) => {
    const b = f === 1 ? -1 : 0;
    const col = look.col || '#f2ead2';
    c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(5, 21, 7, 1);
    R(c, 4, 6 + b, 8, 13, col);
    R(c, 10, 6 + b, 2, 2, '#d8ccac');
    R(c, 4, 18 + b, 8, 1, '#c8bc9c');
    R(c, 6, 11 + b, 1, 1, '#4a4234'); R(c, 9, 11 + b, 1, 1, '#4a4234');
    R(c, 6, 15 + b, 4, 1, '#b8aa88');
    if (d !== 'up') R(c, 5, 8 + b, 3, 1, look.ink || '#8a7a5a');
    R(c, 7 + (f === 2 ? 1 : 0), 20 + b, 2, 2, col);
  };
  RB.sprites.custom.atlas_crab = (c, look) => {
    const col = look.col || '#b89070';
    R(c, 3, 15, 10, 5, col); R(c, 4, 14, 8, 1, col);
    R(c, 1, 12, 3, 3, col); R(c, 12, 12, 3, 3, col);
    R(c, 6, 15, 1, 1, '#1a1a1a'); R(c, 9, 15, 1, 1, '#1a1a1a');
    R(c, 3, 20, 1, 2, col); R(c, 6, 20, 1, 2, col); R(c, 9, 20, 1, 2, col); R(c, 12, 20, 1, 2, col);
  };
  RB.sprites.custom.atlas_bell = (c, look, d, f) => {
    const s = f === 1 ? 1 : 0;
    R(c, 5, 6, 6, 2, '#5a4a2a');
    R(c, 4 + s, 8, 8, 9, look.col || '#9a8a5a');
    R(c, 3 + s, 16, 10, 2, look.col || '#9a8a5a');
    R(c, 6 + s, 9, 1, 6, '#c8b478');
    R(c, 7 + s, 18, 2, 2, '#4a3a1a');
  };
  RB.sprites.custom.atlas_cartographer = (c, look, d, f) => {
    const b = f === 1 ? -1 : 0;
    R(c, 4, 4 + b, 8, 17, '#e8dcc0');
    R(c, 5, 3 + b, 6, 3, '#d4c6a6');
    R(c, 4, 8 + b, 8, 1, '#b4a684'); R(c, 4, 13 + b, 8, 1, '#b4a684'); R(c, 8, 4 + b, 1, 17, '#b4a684');
    if (d !== 'up') { R(c, 6, 6 + b, 1, 1, '#3a5a8a'); R(c, 9, 6 + b, 1, 1, '#3a5a8a'); }
    R(c, 11, 12 + b, 4, 3, '#f6f0e0');
  };
  RB.sprites.custom.atlas_gate = (c, look, d, f) => {
    const b = f === 1 ? 1 : 0;
    R(c, 3, 7, 10, 14, look.col || '#8a8a78');
    R(c, 4, 4, 8, 4, look.col || '#8a8a78');
    R(c, 3, 7, 10, 1, '#ffffff40');
    R(c, 6, 5, 1, 1, '#f0d890'); R(c, 9, 5, 1, 1, '#f0d890');
    R(c, 5, 12 + b, 6, 1, '#5a5a4a');
  };

  // ---- cosmetic accessories (reward items) ----------------------------------------------
  // Drawn over the finished sprite; coordinates follow src/engine/30_sprites.js
  // (head ≈ rows 2–11, torso 12–18, legs 19–23; the side view faces right).
  const ACC = {
    atlas_sash(c, look, d) {
      const col = look.sashCol || '#d8c89a', ln = '#8a7a5a';
      if (d === 'down') { for (let i = 0; i < 7; i++) R(c, 4 + i, 12 + i, 2, 1, col); R(c, 6, 14, 1, 1, ln); R(c, 9, 17, 1, 1, ln); }
      else if (d === 'up') { for (let i = 0; i < 7; i++) R(c, 10 - i, 12 + i, 2, 1, col); R(c, 8, 15, 1, 1, ln); }
      else { R(c, 7, 12, 2, 7, col); R(c, 7, 14, 1, 1, ln); R(c, 8, 17, 1, 1, ln); }
    },
    atlas_pin(c, look, d) {
      if (d === 'up') return;
      const x = d === 'side' ? 9 : 5;
      R(c, x, 13, 3, 3, '#d8b060'); R(c, x + 1, 14, 1, 1, '#3a5a8a'); R(c, x + 1, 13, 1, 1, '#f4e8c0');
    },
    atlas_lamplet(c, look, d) {
      if (d === 'down') { R(c, 3, 15, 1, 2, '#3a3440'); R(c, 2, 17, 3, 3, '#ffd27a'); R(c, 2, 17, 3, 1, '#3a3440'); R(c, 2, 20, 3, 1, '#3a3440'); }
      else if (d === 'side') { R(c, 5, 16, 1, 2, '#3a3440'); R(c, 4, 18, 3, 3, '#ffd27a'); R(c, 4, 18, 3, 1, '#3a3440'); }
      else { R(c, 12, 16, 2, 3, '#ffd27a'); R(c, 12, 16, 2, 1, '#3a3440'); }
    },
    atlas_quill(c, look, d) {
      const col = '#f4f0e0', vane = '#d8d0bc';
      if (d === 'down') { R(c, 12, 1, 1, 6, col); R(c, 13, 0, 1, 4, vane); R(c, 12, 7, 1, 1, '#6a5a3a'); }
      else if (d === 'side') { R(c, 5, 1, 1, 6, col); R(c, 4, 0, 1, 4, vane); R(c, 5, 7, 1, 1, '#6a5a3a'); }
      else { R(c, 11, 1, 1, 6, col); R(c, 12, 0, 1, 4, vane); }
    },
  };
  RB.atlasArt = { ACC };

  const origGet = RB.sprites.get;
  const cache = new Map();
  function getWithAtlasAcc(look, dir, frame) {
    const acc = look && look.acc;
    if (!acc || !acc.some((a) => ACC[a])) return origGet(look, dir, frame);
    const k = JSON.stringify(look) + '|' + dir + '|' + frame;
    const hit = cache.get(k);
    if (hit) return hit;
    const base = origGet(Object.assign({}, look, { acc: acc.filter((a) => !ACC[a]) }), dir, frame);
    const cv = RB.sprites.makeCanvas(16, 24);
    const c = cv.getContext('2d');
    c.drawImage(base, 0, 0);
    const d = dir === 'left' || dir === 'right' ? 'side' : dir;
    if (dir === 'left') { c.save(); c.translate(16, 0); c.scale(-1, 1); }
    for (const a of acc) if (ACC[a]) ACC[a](c, look, d, frame);
    if (dir === 'left') c.restore();
    cache.set(k, cv);
    if (cache.size > 400) cache.delete(cache.keys().next().value);
    return cv;
  }
  RB.sprites.get = getWithAtlasAcc;

  // ---- enemy art (≈64px, centred) --------------------------------------------------------
  const A = RB.enemyArt.A;
  // The Blank Cartographer: a figure folded out of unfinished maps.
  A.atlas_cartographer = (c, t, o) => {
    const b = Math.sin(t / 520) * 3;
    c.fillStyle = '#e8dcc0';
    c.beginPath(); c.moveTo(-24, 38); c.lineTo(-18, -14 + b); c.quadraticCurveTo(0, -36 + b, 18, -14 + b); c.lineTo(24, 38); c.closePath(); c.fill();
    c.fillStyle = '#b4a684';
    for (let i = -18; i <= 18; i += 9) c.fillRect(i, -10 + b, 1, 46);
    for (let j = 0; j < 4; j++) c.fillRect(-20, 2 + j * 9 + b, 40, 1);
    c.fillStyle = '#8a5a3a';
    c.fillRect(-12, 20 + b, 10, 1); c.fillRect(-2, 12 + b, 1, 9); c.fillRect(-2, 12 + b, 12, 1);
    c.fillStyle = '#2a2a3a'; c.beginPath(); c.ellipse(0, -16 + b, 9, 7, 0, 0, 7); c.fill();
    c.fillStyle = '#9ec4f0'; c.fillRect(-5, -17 + b, 3, 2); c.fillRect(3, -17 + b, 3, 2);
    const u = Math.sin(t / 700) * 4;
    c.fillStyle = '#f8f2e2'; c.fillRect(20, -4 + b, 16, 22 + u);
    c.fillStyle = '#d8ccac'; c.fillRect(20, -6 + b, 16, 3); c.fillRect(20, 16 + b + u, 16, 3);
    if (o.pale) { c.fillStyle = 'rgba(255,255,255,0.2)'; c.fillRect(-26, -36, 64, 76); }
  };
})();
