/* Manybridge, Chapter 4 of the twelve: the travel volume's pages (expansion P16; F-48: the press, the rehearsal, the
 * fireworks; AC-1).
 *
 * mb2.press — the first print that holds (`mp.sobe_printed`, src/content/mp/20_scenes_print.js).
 *   sheet   close: the fresh sheet lifted into the light of the press room's paper window, Sōbē's hands at its top
 *           corners; the brush marks stay sharp (beside it on the drying line, an older print gone faint)
 *   sobe    Sōbē at the window with the press room behind him (the rack of blocks, the press bed, the ink pot): he
 *           breathes out; on Ren's branch he holds out a lantern's name-slip block
 * mb2.fireworks — the Opening of the River (`mp.fireworks`, src/content/mp/22_scenes_fest.js), in yukata.
 *   bloom   from the foot of the Curtain Bridge across the river: the far bank's storehouses and the bridges going off
 *           with their lanterns and their crowds; the first flower climbs and opens, its reflection broken on the
 *           water; on "Tamaya!" more open and the people on the bridges raise their arms
 *   two     the two of you at the rail in yukata: you from behind, your companion turned to you in the light of the
 *           blooms (their look: a smile, then thinking of the Understage, then the smile again after your answer)
 *   sky     the great willow at the end: a gold flower whose trails fall slowly toward the river, the whole city of
 *           bridges lit under it
 * Fireworks are pixel streams from a seeded burst; with reduced motion each holds as an open flower. No letters, kana
 * or kanji are drawn: the print's lines are brush marks. */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const Q = RB.seqKit, { R, mk, clamp, ease, lerp, cached, stage } = Q;
  const SP = RB.seqPaint;
  const P = () => RB.pxkit;
  const look = (id) => (RB.content.chars[id] || {}).look || {};
  const skin = (id) => Q.skinOf(look(id));
  const sub = (k, a, b) => clamp((k - a) / (b - a), 0, 1);

  // ---- light ----------------------------------------------------------------------------------------------
  const WINDOW = { mul: [0.92, 0.9, 0.88], add: [8, 6, 2], rim: { side: 'l', col: '#fff0d0', k: [0.42, 0.2], below: 0.85 } };
  const NIGHT = { mul: [0.8, 0.78, 0.9], add: [6, 4, 16], rim: { side: 't', col: '#ffd8a0', k: [0.45, 0.22] } };

  // ==== mb2.press · the press room, its paper window and the racks of blocks =====================================
  function geomPress(w, h, vb) {
    const S = stage(w, h, vb), narrow = S.lay === 'narrow';
    const wx = Math.round(w * (narrow ? 0.08 : 0.06)), ww = Math.round(w * (narrow ? 0.6 : 0.4)), wy = Math.round(vb * 0.06), wh = Math.round(vb * 0.7);
    return Object.assign(S, { narrow, wx, ww, wy, wh });
  }
  function roomStatic(G) {
    return cached('mb2.room|' + G.w + 'x' + G.h + '|' + G.vb, () => {
      const { w, h, s, wx, ww, wy, wh } = G, p = P();
      const cv = mk(w, h), g = cv.getContext('2d');
      g.imageSmoothingEnabled = false;
      const L = SP.layer(w, h);
      // the back wall: dark timber posts and plaster gone grey with ink and years
      const plaster = p.mat('#8a8070', { n: 7, at: 3, step: 0.07 }), timber = p.mat('#3a2a22', { n: 6, at: 3, step: 0.08 }), paper = p.mat('#f0e6cc', { n: 6, at: 4, step: 0.05 });
      L.rect(0, 0, w, h, plaster, (x, y) => clamp(0.4 - Math.abs(x - wx - ww / 2) / w * 0.4 + (p.bayer(x, y) - 0.5) * 0.06 + (((x * 3 + y * 7) % 41) === 0 ? -0.1 : 0), 0.02, 0.999));
      // the paper window (a shōji with the day behind it), its frame and its sill
      Q.shoji(L, wx, wy, ww, wh, (n) => s(n) * 2.4, paper, timber, 0.9);
      L.rect(wx - s(3), wy + wh, ww + s(6), s(4), timber, 0.7);
      for (const x of [wx - s(10), wx + ww + s(4)]) L.rect(x, 0, s(6), h, timber, (xx) => (xx < x + s(2) ? 0.6 : 0.25));
      // the rack of blocks at the right: shelves of pale cherry blocks standing on edge
      const rx = wx + ww + s(26), rw = w - rx - s(4), cherry = p.mat('#a8805a', { n: 6, at: 3, step: 0.08 });
      if (rw > s(30)) {
        for (let r = 0; r < 5; r++) {
          const y = wy + r * s(26);
          L.rect(rx, y + s(22), rw, s(3), timber, 0.6);
          for (let x = rx + s(2); x < rx + rw - s(5); x += s(6) + ((x * 7 + r) % 3)) L.rect(x, y + s(6) + ((x + r) % 4), s(5), s(16) - ((x + r) % 4), cherry, (xx, yy) => clamp(0.55 - (xx - x) / s(5) * 0.3 + ((r + x) % 5 === 0 ? 0.1 : 0), 0.02, 0.999));
        }
      }
      L.outline();
      g.drawImage(L.canvas(), 0, 0);
      // the window's light in the room: a dithered pool on the floor and the press bed
      SP.glow(g, wx + ww / 2, wy + wh, Math.round(ww * 0.7), '255,240,210', 0.35);
      return { cv };
    });
  }
  const vb0 = (G) => G.vb;
  // a printed sheet: paper with a column or two of firm brush marks; faint for the old one
  function sheetArt(W, H, faint, seed) {
    return Q.small('mb2.sheet|' + W + 'x' + H + '|' + (faint ? 1 : 0) + '|' + seed, () => {
      const cv = mk(W, H), g = cv.getContext('2d');
      g.fillStyle = faint ? '#e4dcc4' : '#f6efdc'; g.fillRect(0, 0, W, H);
      g.fillStyle = faint ? '#cfc6ac' : '#ddd2b4'; g.fillRect(0, H - 1, W, 1); g.fillRect(W - 1, 0, 1, H);
      // columns of firm strokes, right to left, a title column larger (marks, never letters)
      const cols = Math.max(2, Math.min(6, Math.round(W / 11)));
      g.fillStyle = faint ? 'rgba(42,32,36,0.2)' : '#1e1418';
      const rnd = P().rnd(seed);
      for (let i = 0; i < cols; i++) {
        const x = Math.round(W - 6 - i * (W - 12) / Math.max(1, cols - 1)), n = Math.max(3, Math.round((H - 10) / 7)), big = i === 0 ? 2 : 1;
        for (let j = 0; j < n - (i % 3); j++) {
          const y = 5 + j * 7, k = Math.floor(rnd() * 4);
          if (k === 0) g.fillRect(x - 2 * big, y, 4 * big + 1, big);
          else if (k === 1) { g.fillRect(x, y, big, 4 * big); g.fillRect(x - 2, y + 2, 2, big); }
          else if (k === 2) { g.fillRect(x - 2, y, 2, big); g.fillRect(x, y + 1, big, 3 * big); g.fillRect(x + 1, y + 3, 2, big); }
          else { g.fillRect(x - 1, y, 3, big); g.fillRect(x - 2, y + 3, 5, big); }
        }
      }
      return { cv };
    });
  }
  const sheet = {
    phases: [['lift', 1200]],
    safe: { wide: 'the sheet against the window above the sheet', narrow: 'the sheet in the upper half', land: 'the sheet' },
    draw(c, w, h, t, st) {
      const G = geomPress(w, h, st.vb), { s, wx, ww, wy, wh } = G;
      c.drawImage(roomStatic(G).cv, 0, 0);
      // the drying line across the top with older prints, one gone faint
      const ly = wy + s(4);
      c.fillStyle = '#2a2024'; for (let x = 0; x < w; x++) c.fillRect(x, ly + Math.round(Math.sin(x / w * Math.PI) * s(4)), 1, 1);
      for (let i = 0; i < 4; i++) { const x = Math.round(w * (0.62 + i * 0.1)); if (x > w - s(10)) continue; const a = sheetArt(s(18), s(24), i === 1, 30 + i); c.drawImage(a.cv, x, ly + Math.round(Math.sin(x / w * Math.PI) * s(4)) + 1); }
      // the fresh sheet lifted into the window's light, Sōbē's hands at its top corners
      const k = ease(st.at('lift'));
      const SW = Math.round(clamp(ww * 0.62, s(56), s(120))), SH = Math.round(SW * 1.25);
      const sx = Math.round(wx + ww / 2 - SW / 2), sy = Math.round(lerp(st.vb, wy + wh * 0.18, k));
      c.drawImage(sheetArt(SW, SH, false, 7).cv, sx, sy);
      // the light through the paper: the window glows round the sheet's edge
      c.fillStyle = 'rgba(255,248,226,0.28)'; c.fillRect(sx - 1, sy - 1, SW + 2, 1); c.fillRect(sx - 1, sy, 1, SH);
      const sk = skin('mp_sobe'), sl = (look('mp_sobe').cloth || ['#3a3a44'])[0];
      const hl = Q.hand({ size: Math.round(clamp(s(13), 9, 22)), pose: 'pinch', side: 'R', angle: -1.35, skin: sk, sleeve: sl });
      const hr = Q.hand({ size: Math.round(clamp(s(13), 9, 22)), pose: 'pinch', side: 'L', angle: -1.8, skin: sk, sleeve: sl });
      if (hl) c.drawImage(hl.cv, Math.round(sx + s(2) - hl.ax), Math.round(sy + s(10) - hl.ay));
      if (hr) c.drawImage(hr.cv, Math.round(sx + SW - s(2) - hr.ax), Math.round(sy + s(10) - hr.ay));
    },
    focus(w, h, vb) { const G = geomPress(w, h, vb), s = G.s, SW = Math.round(clamp(G.ww * 0.62, s(56), s(120))); const x = Math.round(G.wx + G.ww / 2 - SW / 2), y = Math.round(G.wy + G.wh * 0.18); return { x, y, w: SW, h: Math.max(10, Math.min(vb - 2, y + Math.round(SW * 1.25)) - y) }; },
  };
  const sobe = {
    phases: [['breathe', 900], ['slips', 900]],
    safe: { wide: 'Sōbē\'s face by the window above the sheet', narrow: 'his face in the upper half', land: 'his face' },
    draw(c, w, h, t, st) {
      const G = geomPress(w, h, st.vb), { s } = G;
      c.drawImage(roomStatic(G).cv, 0, 0);
      // the press bed in front of him: a heavy table, the ink pot, a block face-up on it
      const p = P();
      const BED = Q.small('mb2.bed|' + w + 'x' + h + '|' + st.vb, () => {
        const L = SP.layer(w, h), wood = p.mat('#5a4030', { n: 7, at: 3, step: 0.07 }), ink = p.mat('#1e1820', { n: 4, at: 1 }), cherry = p.mat('#b48a5e', { n: 6, at: 3, step: 0.08 });
        const by = Math.round(st.vb - s(8)), bx = Math.round(w * (G.narrow ? 0.1 : 0.3)), bw = Math.round(w * (G.narrow ? 0.8 : 0.56));
        L.rect(bx, by, bw, s(10), wood, (x, y) => (y < by + s(3) ? 0.78 : 0.4));
        L.rect(bx + s(6), by + s(10), s(8), h, wood, 0.3); L.rect(bx + bw - s(14), by + s(10), s(8), h, wood, 0.3);
        L.ell(bx + bw - s(30), by - s(4), s(9), s(5), ink, 0.6); L.ell(bx + bw - s(30), by - s(6), s(7), s(2), p.mat('#0a080c', { n: 2, at: 0 }), 0.5);
        L.rect(bx + s(24), by - s(6), s(34), s(6), cherry, (x, y) => (y < by - s(4) ? 0.8 : 0.45));
        L.outline();
        return { cv: L.canvas() };
      });
      const kb = st.at('breathe'), ks = st.at('slips');
      const fr = kb > 0.4 && kb < 0.9 ? { lids: 'closed' } : { look: [-1, 0] };
      const b = Q.bust('mp_sobe', kb > 0.4 ? 'smile' : 'neutral', fr, WINDOW, false, 200);
      const bx = Math.round(w * (G.narrow ? 0.52 : 0.58)), by = Math.max(Math.round(st.vb + s(10)), 98);
      if (b) c.drawImage(b.cv, bx - b.ax, by - b.ay);
      c.drawImage(BED.cv, 0, 0);
      // on Ren's branch: he holds out a lantern's name-slip block (a small block, the slip's shape cut in it)
      if (ks > 0) {
        const e = ease(ks), BW = Math.round(clamp(s(22), 14, 34)), BH = Math.round(BW * 1.6);
        const x = Math.round(lerp(bx + s(10), bx - s(34), e)), y = Math.round(by - s(30));
        c.fillStyle = '#b48a5e'; c.fillRect(x - BW / 2, y, BW, BH);
        c.fillStyle = '#8a6440'; c.fillRect(x - BW / 2, y + BH - 2, BW, 2); c.fillRect(x + BW / 2 - 1, y, 1, BH);
        c.fillStyle = '#d8b488'; c.fillRect(x - BW / 2 + 2, y + 2, BW - 5, BH - 6);
        SP.marks(c, x, y + 4, BH - 10, 3, 1, '#6a4a30', 51);
        const hd = Q.hand({ size: Math.round(clamp(s(11), 8, 18)), pose: 'offer', side: 'R', angle: -0.2, skin: skin('mp_sobe'), sleeve: (look('mp_sobe').cloth || ['#3a3a44'])[0] });
        if (hd) c.drawImage(hd.cv, Math.round(x + s(4) - hd.ax), Math.round(y + BH - hd.ay));
      }
    },
    focus(w, h, vb) { const G = geomPress(w, h, vb), bx = Math.round(w * (G.narrow ? 0.52 : 0.58)), by = Math.max(Math.round(vb + G.s(10)), 98); return { x: bx - 34, y: by - 92, w: 68, h: Math.min(vb - 2, by - 30) - (by - 92) }; },
  };

  RB.sequence.define('mb2.press', {
    title: { en: 'The print that held', jp: '{残|のこ}った {字|じ}' }, chapter: 'mb2', scene: 'mp.sobe_printed',
    shots: { sheet, sobe },
  });

  // ==== mb2.fireworks ===========================================================================================
  // A burst: n streams from (x, y) out to radius r, each a trail of pixels; k 0..1 opens it, then (once open) it
  // droops and fades over its life. cols: [core, mid, tip]. Seeded, so the same flower every time.
  function burst(c, x, y, r, k, life, cols, n, seed, willow) {
    if (k <= 0) return;
    const rnd = P().rnd(seed), open = ease(Math.min(1, k)), fade = clamp(1 - life, 0, 1);
    if (fade <= 0) return;
    // the flash at the heart as it opens
    if (open < 0.5) SP.glow(c, x, y, Math.round(r * 0.5 * (1 - open)), '255,250,230', 0.5);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + (rnd() - 0.5) * 0.12, rr = r * (0.86 + rnd() * 0.16);
      const two = i % 2 === 0 ? cols : [cols[0], cols[0], cols[1]];
      const tail = willow ? 0.75 : 0.42;  // how much of the radius the trail covers
      const steps = Math.max(4, Math.round(rr * tail * open));
      for (let j = 0; j <= steps; j++) {
        const f = open - (j / steps) * tail * open;
        if (f <= 0.05) break;
        const fall = (willow ? 0.6 : 0.16) * r * life * life + (willow ? (j / steps) * r * 0.12 * life : 0);
        const px = x + Math.cos(a) * rr * f, py = y + Math.sin(a) * rr * f * 0.94 + fall;
        const q = j / steps, al = fade * (1 - q) * (willow ? 0.9 : 1);
        if (al < 0.1) continue;
        c.globalAlpha = Math.min(1, al);
        c.fillStyle = q < 0.08 ? two[2] : q < 0.4 ? two[1] : two[0];
        const sz = j === 0 ? 2 : 1;
        c.fillRect(Math.round(px), Math.round(py), sz, sz);
      }
      // a twinkle at some tips as the flower ages
      if (life > 0.35 && rnd() < 0.35) {
        const tw = (Math.sin(seed * 7 + i * 3 + life * 40) + 1) / 2;
        if (tw > 0.6) { c.globalAlpha = fade; c.fillStyle = '#ffffff'; const f = open; c.fillRect(Math.round(x + Math.cos(a) * rr * f), Math.round(y + Math.sin(a) * rr * f * 0.94 + (willow ? 0.6 : 0.16) * r * life * life), 1, 1); }
      }
    }
    c.globalAlpha = 1;
    if (open > 0.3) SP.glow(c, x, y, Math.round(r * 0.9), cols[1] === '#8ad0ff' ? '160,210,255' : '255,210,150', 0.14 * fade);
  }
  // its reflection: broken vertical streaks on the water under it
  function reflect(c, x, y0, h, k, col, seed, t, still) {
    if (k <= 0) return;
    const rnd = P().rnd(seed);
    c.fillStyle = col;
    for (let i = 0; i < 14; i++) {
      const xx = x + (rnd() - 0.5) * 30 * k, yy = y0 + rnd() * h, ww = 1 + Math.round(rnd() * 3), sh = still ? 0 : Math.round(Math.sin(t / 300 + i) * 1.5);
      c.globalAlpha = 0.25 + rnd() * 0.35;
      c.fillRect(Math.round(xx + sh), Math.round(yy), ww, 1);
    }
    c.globalAlpha = 1;
  }
  const COLS = [['#e04848', '#ff9a6a', '#fff2d0'], ['#3a8ae0', '#8ad0ff', '#f0faff'], ['#d0a020', '#ffd860', '#fffbe0'], ['#3ac070', '#9af0a8', '#f0fff0'], ['#c048c0', '#f0a0f0', '#fff0ff']];
  function geomRiver(w, h, vb) {
    const S = stage(w, h, vb), narrow = S.lay === 'narrow';
    const wl = Math.round(vb * (narrow ? 0.7 : 0.74));   // the far bank's foot on the water
    return Object.assign(S, { narrow, wl });
  }
  function riverStatic(G) {
    return cached('mb2.river|' + G.w + 'x' + G.h + '|' + G.vb, () => {
      const { w, h, s, wl } = G, p = P();
      const cv = mk(w, h), g = cv.getContext('2d');
      g.imageSmoothingEnabled = false;
      Q.bandsIn(g, 0, 0, w, wl, ['#05060f', '#080a1a', '#0c1024', '#12162e', '#1a1e3a', '#262444'], 0.45);
      SP.stars(g, 0, 0, w, Math.round(wl * 0.5), 26, 91, 9);
      const L = SP.layer(w, h);
      // the far bank: storehouses and a temple roof against the sky, lit windows, a lantern line along the quay
      const tile = p.mat('#1e2232', { n: 6, at: 3, step: 0.08 }), plaster = p.mat('#4a4658', { n: 6, at: 3, step: 0.07 }), stone = p.mat('#2e2e3a', { n: 5, at: 2 });
      const rnd = p.rnd(57);
      for (let x = -s(10); x < w; ) {
        const hw = s(40 + rnd() * 34), hh = s(26 + rnd() * 18), top = wl - s(6) - hh;
        L.rect(x, top + Math.round(hh * 0.3), hw, hh - Math.round(hh * 0.3), plaster, (xx, yy) => clamp(0.4 + (p.bayer(xx, yy) - 0.5) * 0.06, 0.02, 0.999));
        SP.roof(L, x - s(3), x + hw + s(3), top, Math.round(hh * 0.3), tile, { course: Math.max(2, s(3)) });
        if (rnd() < 0.7) L.rect(x + Math.round(hw * 0.4), top + Math.round(hh * 0.5), s(6), s(6), p.mat('#ffcf86', { n: 3, at: 1 }), 0.8);
        x += hw + s(2);
      }
      L.rect(0, wl - s(6), w, s(6), stone, (x, y) => (y < wl - s(5) ? 0.8 : 0.4));
      // the water: dark, the city's lights lying on it in long bands
      const wat = p.mat('#141a32', { n: 6, at: 3, step: 0.08 });
      SP.water(L, 0, wl, w, h, wat, { band: Math.max(3, s(4)), deep: 0.2, seed: 77 });
      // the bridges across the river further down, shallow arches against the far bank
      const wood = p.mat('#2a2230', { n: 5, at: 2 });
      for (const [cx, span, y] of [[0.78, 0.36, wl - s(2)], [0.24, 0.3, wl - s(10)]]) {
        const a = Math.round(w * (cx - span / 2)), b = Math.round(w * (cx + span / 2)), rise = s(10);
        L.fill(a, y - rise - s(10), b, y + s(4), (x, yy) => { const u = (x - a) / (b - a); const top = y - Math.sin(Math.PI * u) * rise; return yy >= top - s(6) && yy < top + s(3); }, wood, (x, yy) => { const u = (x - a) / (b - a); const top = y - Math.sin(Math.PI * u) * rise; return yy < top - s(5) ? 0.8 : yy < top ? 0.3 : 0.55; });
      }
      // the rail of the Curtain Bridge at the bottom, close: dark posts and the rail across
      const rail = p.mat('#2e2220', { n: 5, at: 2, step: 0.1 });
      const ry = Math.round(G.vb + s(G.narrow ? 6 : 2));
      L.rect(0, ry, w, s(5), rail, (x, y) => (y < ry + s(2) ? 0.7 : 0.35));
      for (let x = s(12); x < w; x += s(70)) L.rect(x, ry - s(6), s(7), h, rail, (xx) => (xx < x + s(3) ? 0.6 : 0.25));
      L.outline();
      g.drawImage(L.canvas(), 0, 0);
      return { cv };
    });
  }
  // the people on the far bridges: tiny heads in a row along each arch, arms up when they cheer
  function crowds(c, G, cheer, t, still) {
    const { w, s, wl } = G;
    for (const [cx, span, y, n] of [[0.78, 0.36, wl - G.s(2), 22], [0.24, 0.3, wl - G.s(10), 18]]) {
      const a = Math.round(w * (cx - span / 2)), b = Math.round(w * (cx + span / 2)), rise = s(10);
      for (let i = 0; i < n; i++) {
        const u = (i + 0.5) / n, x = Math.round(lerp(a, b, u)), top = Math.round(y - Math.sin(Math.PI * u) * rise - s(6));
        R(c, x, top - s(4), Math.max(1, s(2)), s(4), i % 3 ? '#1a1624' : '#241c2c');
        R(c, x, top - s(5), Math.max(1, s(2)), Math.max(1, s(1.5)), '#2e2638');
        const up = cheer > 0 && (still ? i % 2 === 0 : (Math.floor(t / 400) + i) % 3 === 0);
        if (up) R(c, x + (i % 2 ? -1 : s(2)), top - s(8), 1, s(3), '#2e2638');
      }
      for (let i = 0; i < 6; i++) { const u = (i + 0.5) / 6, x = Math.round(lerp(a, b, u)), top = Math.round(y - Math.sin(Math.PI * u) * rise - s(9)); R(c, x, top, Math.max(1, s(2)), Math.max(1, s(2)), '#ffcf86'); }
    }
  }
  const bloom = {
    phases: [['open', 1500], ['cheer', 1000]],
    safe: { wide: 'the first flower in the sky above the far bank, above the sheet', narrow: 'the flower in the upper third', land: 'the flower' },
    draw(c, w, h, t, st) {
      const G = geomRiver(w, h, st.vb), { s, wl } = G, still = st.still;
      c.drawImage(riverStatic(G).cv, 0, 0);
      const ko = st.at('open'), kc = st.at('cheer');
      // the whistle: a thin rising spark, then the flower
      const fx = Math.round(w * (G.narrow ? 0.5 : 0.52)), fy = Math.round(wl * 0.4), fr = Math.round(Math.min(w * 0.4, wl * 0.5));
      if (ko < 0.3) { const ry = Math.round(lerp(wl, fy, ko / 0.3)); R(c, fx, ry, 1, s(4), '#fff2d0'); R(c, fx, ry + s(4), 1, s(6), 'rgba(255,220,170,0.5)'); }
      const open = sub(ko, 0.28, 1);
      // (once open, each flower fades and opens again on its own cycle; t = 4 s, the volume's thumbnail, is early in it)
      const life0 = still ? 0.15 : open < 1 ? 0 : (((t + 3200) % 5200) / 5200) * 0.85;
      burst(c, fx, fy, fr, open, life0, COLS[0], 48, 11, false);
      reflect(c, fx, wl + s(6), st.vb - wl, open * (1 - life0), 'rgba(255,170,130,1)', 13, t, still);
      // on the cheer, more flowers open over the bridges
      if (kc > 0) {
        const more = [[0.22, 0.42, 1, 21], [0.8, 0.3, 2, 31], [0.66, 0.5, 3, 41]];
        more.forEach(([u, v, ci, sd], i) => {
          const k2 = sub(kc, i * 0.2, 0.6 + i * 0.2);
          const life = still ? 0.2 : k2 < 1 ? 0 : (((t + 2600 + i * 1300) % 5200) / 5200) * 0.85;
          burst(c, Math.round(w * u), Math.round(wl * v), Math.round(fr * 0.66), k2, life, COLS[ci], 36, sd, false);
          reflect(c, Math.round(w * u), wl + s(6), st.vb - wl, k2 * (1 - life), ci === 1 ? 'rgba(140,200,255,1)' : ci === 2 ? 'rgba(255,220,120,1)' : 'rgba(150,240,170,1)', sd + 1, t, still);
        });
      }
      crowds(c, G, kc, t, still);
      SP.glints(c, 0, wl + s(4), w, st.vb - wl, t, 20, 97, '255,200,160', still);
    },
    focus(w, h, vb) { const G = geomRiver(w, h, vb), fx = Math.round(w * (G.narrow ? 0.5 : 0.52)), fy = Math.round(G.wl * 0.4), fr = Math.round(Math.min(w * 0.4, G.wl * 0.5)); return { x: fx - fr, y: Math.max(0, fy - fr), w: fr * 2, h: Math.min(vb - 2, fy + fr) - Math.max(0, fy - fr) }; },
  };
  const two = {
    phases: [['look', 700], ['think', 700], ['smile', 700]],
    safe: { wide: 'your companion\'s face lit by the flowers above the sheet', narrow: 'their face in the upper half', land: 'their face' },
    draw(c, w, h, t, st) {
      const G = geomRiver(w, h, st.vb), { s, wl } = G, still = st.still;
      c.drawImage(riverStatic(G).cv, 0, 0);
      // flowers keep opening behind (ambient), each its own life
      for (let i = 0; i < 3; i++) {
        const life = still ? 0.2 : (((t + 2400 + i * 1700) % 5100) / 5100) * 0.9;
        burst(c, Math.round(w * [0.3, 0.62, 0.86][i]), Math.round(wl * [0.36, 0.22, 0.44][i]), Math.round(Math.min(w * 0.3, wl * 0.36)), 1, life, COLS[(i + 1) % COLS.length], 36, 51 + i, false);
      }
      crowds(c, G, 0, t, still);
      // you from behind at the rail (in yukata), your companion turned to you
      const pcLook = st.cast.pc && RB.festDress ? RB.festDress.look(st.cast.pc, 'pc') : st.cast.pc || {};
      const W = Math.round(clamp(s(118), 80, 160));
      const pb = Q.back(pcLook, W, { light: 'r' });
      const bx = Math.round(w * (G.narrow ? 0.24 : 0.24)), by = Math.round(st.vb + s(G.narrow ? 90 : 80));
      if (pb) c.drawImage(pb.cv, bx - pb.ax, by - pb.ay);
      const comp = st.cast.comp;
      if (comp) {
        const kl = st.at('look'), kt = st.at('think'), ks = st.at('smile');
        const expr = ks > 0.3 ? 'smile' : kt > 0.3 ? 'think' : kl > 0.3 ? 'smile' : 'neutral';
        const fr = kt > 0.3 && ks <= 0.3 ? { look: [1, -1] } : { look: [-1, 0], head: [-1, 0] };
        const b = Q.bust({ id: comp.id, fest: true }, expr, fr, NIGHT, false, 200);
        const cx = Math.round(w * (G.narrow ? 0.7 : 0.64)), cy = Math.max(Math.round(st.vb + s(10)), 98);
        if (b) c.drawImage(b.cv, cx - b.ax, cy - b.ay);
      }
    },
    focus(w, h, vb) { const G = geomRiver(w, h, vb), cx = Math.round(w * (G.narrow ? 0.7 : 0.64)), cy = Math.max(Math.round(vb + G.s(10)), 98); return { x: cx - 34, y: cy - 92, w: 68, h: Math.min(vb - 2, cy - 30) - (cy - 92) }; },
  };
  const sky = {
    phases: [['fall', 1500]],
    safe: { wide: 'the great willow over the river, above the sheet', narrow: 'the willow in the upper half', land: 'the willow' },
    draw(c, w, h, t, st) {
      const G = geomRiver(w, h, st.vb), { s, wl } = G, still = st.still;
      c.drawImage(riverStatic(G).cv, 0, 0);
      // the whole city lit under it: a warm wash over the far bank
      c.fillStyle = 'rgba(255,190,110,0.08)'; c.fillRect(0, Math.round(wl * 0.55), w, Math.round(wl * 0.45));
      const kf = st.at('fall');
      const fx = Math.round(w * 0.5), fy = Math.round(wl * 0.3), fr = Math.round(Math.min(w * 0.46, wl * 0.6));
      const life = still ? 0.45 : clamp(kf * 0.4 + (kf >= 1 ? (((t + 3000) % 7000) / 7000) * 0.5 : 0), 0, 0.95);
      burst(c, fx, fy, fr, Math.min(1, kf * 2 + (kf >= 1 ? 1 : 0)), life, COLS[2], 56, 71, true);
      reflect(c, fx, wl + s(6), st.vb - wl, 1, 'rgba(255,214,120,1)', 73, t, still);
      crowds(c, G, 1, t, still);
      SP.glints(c, 0, wl + s(4), w, st.vb - wl, t, 26, 99, '255,220,150', still);
    },
    focus(w, h, vb) { const G = geomRiver(w, h, vb), fr = Math.round(Math.min(w * 0.46, G.wl * 0.6)), fy = Math.round(G.wl * 0.3); return { x: Math.round(w * 0.5) - fr, y: Math.max(0, fy - fr), w: fr * 2, h: Math.min(vb - 2, fy + fr) - Math.max(0, fy - fr) }; },
  };

  RB.sequence.define('mb2.fireworks', {
    title: { en: 'Fireworks at the Opening of the River', jp: '{川開|かわびら}き の {花火|はなび}' }, chapter: 'mb2', scene: 'mp.fireworks',
    shots: { bloom, two, sky },
  });
})();
