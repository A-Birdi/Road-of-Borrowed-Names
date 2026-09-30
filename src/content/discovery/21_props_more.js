/* Field puzzle props for F2-F6 (see 20_props.js for the conventions). Every
 * drawn state comes from the puzzle's displayed state; labels and diagrams
 * are pictograms (arrows, shapes, dashes), never imitation writing: their
 * words are in the inspection text. */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const K = RB.propKit, art = RB.propArt.art, kit = RB.propArt.kit;
  const { R, ell, poly, line, mix, ramp } = K;
  const { prop, slip, st, done } = RB.fwProps;
  const PP = K.FIX.paper, INK = K.FIX.ink, IR = K.FIX.iron, BR = K.FIX.brass, GLS = K.FIX.glass, GL = K.FIX.glow;
  const WATER = ['#1e4a72', '#2c6a9a', '#4a8cc0', '#7ab4e0', '#b8dcf4'];
  const cue = (o) => (RB.weave && RB.weave.cue ? RB.weave.cue(o.pz) : null);
  const I = INK[1];
  // pictogram helpers (ink on paper)
  const arrow = (g, x, y, dir, len, c) => {
    c = c || I;
    if (dir === 'up') { R(g, x, y - len, 1, len, c); R(g, x - 1, y - len + 1, 3, 1, c); R(g, x - 2, y - len + 2, 5, 1, c); }
    if (dir === 'down') { R(g, x, y, 1, len, c); R(g, x - 1, y + len - 2, 3, 1, c); R(g, x - 2, y + len - 3, 5, 1, c); }
    if (dir === 'right') { R(g, x, y, len, 1, c); R(g, x + len - 2, y - 1, 1, 3, c); R(g, x + len - 3, y - 2, 1, 5, c); }
    if (dir === 'left') { R(g, x - len, y, len, 1, c); R(g, x - len + 1, y - 1, 1, 3, c); R(g, x - len + 2, y - 2, 1, 5, c); }
  };
  const box = (g, x, y, w, h, c) => { R(g, x, y, w, 1, c); R(g, x, y + h - 1, w, 1, c); R(g, x, y, 1, h, c); R(g, x + w - 1, y, 1, h, c); };
  const circ = (g, cx, cy, r, c) => { for (let a = 0; a < 24; a++) R(g, Math.round(cx + Math.cos(a / 24 * Math.PI * 2) * r), Math.round(cy + Math.sin(a / 24 * Math.PI * 2) * r), 1, 1, c); };
  const tri = (g, cx, cy, r, c) => { for (let i = 0; i <= r * 2; i++) { R(g, cx - r + i, cy + r, 1, 1, c); R(g, Math.round(cx - r + i / 2), Math.round(cy + r - i), 1, 1, c); R(g, Math.round(cx + i / 2), Math.round(cy - r + i), 1, 1, c); } };
  // a paper board on two posts (diagrams, notes)
  function paperBoard(g, M, x, y, w, h, postH) {
    const w5 = M.wood;
    kit.post(g, x + 2, y + 2, 3, h + postH, w5); kit.post(g, x + w - 5, y + 2, 3, h + postH, w5);
    R(g, x, y, w, h, w5[1]); R(g, x + 1, y + 1, w - 2, h - 2, PP[3]); R(g, x + 1, y + 1, w - 2, 1, PP[4]); R(g, x + 1, y + h - 2, w - 2, 1, PP[1]);
  }
  // a bamboo tube segment (horizontal or vertical), with nodes
  const BAM = ['#4a5a28', '#6a7a36', '#8a9a48', '#aabb66', '#ccd890'];
  function tubeH(g, x0, x1, y) { R(g, x0, y, x1 - x0, 5, BAM[2]); R(g, x0, y, x1 - x0, 1, BAM[4]); R(g, x0, y + 1, x1 - x0, 1, BAM[3]); R(g, x0, y + 4, x1 - x0, 1, BAM[0]); for (let x = x0 + 6; x < x1 - 2; x += 11) R(g, x, y, 1, 5, BAM[1]); }
  function tubeV(g, x, y0, y1) { R(g, x, y0, 5, y1 - y0, BAM[2]); R(g, x, y0, 1, y1 - y0, BAM[4]); R(g, x + 1, y0, 1, y1 - y0, BAM[3]); R(g, x + 4, y0, 1, y1 - y0, BAM[0]); for (let y = y0 + 6; y < y1 - 2; y += 11) R(g, x, y, 5, 1, BAM[1]); }

  // ==== F2: the signal float ===================================================================================
  prop('fw_floatdiagram'); prop('fw_pulleypost'); prop('fw_winch'); prop('fw_inlet'); prop('fw_floattank'); prop('fw_ventpipe');
  art('fw_floatdiagram', {
    box: [-2, -24, 36, 58], ink: true,
    draw(g, M) {
      paperBoard(g, M, 1, -20, 30, 24, 26);
      // the tank with a float and a rising arrow; water in at the bottom left, air out at the top right
      box(g, 5, -12, 9, 12, I); R(g, 6, -5, 7, 4, WATER[3]); R(g, 8, -8, 3, 2, '#c8a060');
      arrow(g, 4, -2, 'right', 5, WATER[1]);
      arrow(g, 13, -13, 'up', 5, I);
      // the line over the pulley to the drum with its catch
      R(g, 9, -16, 1, 4, I); circ(g, 12, -16, 2, I); R(g, 14, -16, 7, 1, I); circ(g, 23, -10, 3, I); R(g, 23, -14, 3, 1, '#a83e27');
      // the viewing window (a box) and a vane (a cross)
      box(g, 16, -8, 6, 5, I); R(g, 18, -6, 2, 1, '#c8a060');
      R(g, 26, -19, 1, 5, I); R(g, 24, -17, 5, 1, I);
    },
    shadow: () => [16, 30, 12, 2.5, 0.28],
  });
  art('fw_pulleypost', {
    box: [-6, -56, 54, 90], ink: true,
    v: (o) => { const s = st(o); return s.float || 'cradle'; },
    f: (t, o) => { const c = cue(o); return c && c.family === 'wind' && c.k > 0 && c.k < 900 && !o.still ? 1 + (Math.floor(c.k / 90) % 3) : 0; },
    draw(g, M, v, f) {
      const w5 = M.wood;
      kit.post(g, 13, -44, 5, 74, w5);
      R(g, 12, -46, 7, 2, w5[4]);
      // the pulley wheel and its axle
      ell(g, 16, -40, 5, 5, IR[1]); ell(g, 16, -40, 3, 3, IR[3]); R(g, 16, -41, 1, 2, IR[0]);
      R(g, 18, -41, 7, 2, IR[2]);
      // the vane on the axle's end (four blades; turns while the wind drives it)
      const bl = [[[0, -5], [0, 5], [-5, 0], [5, 0]], [[3, -4], [-3, 4], [-4, -3], [4, 3]], [[4, -2], [-4, 2], [-2, -4], [2, 4]], [[-3, -4], [3, 4], [-4, 3], [4, -3]]][f];
      for (const [dx, dy] of bl) { line(g, 26, -40, 26 + dx, -40 + dy, PP[3], 2); }
      R(g, 25, -41, 3, 3, BR[2]);
      // the line: down into the tank on the left, and across to the drum on the right
      const low = v === 'cradle' ? 32 : 32;
      line(g, 11, -40, 11, low, '#e8e0cc', 1);
      line(g, 21, -38, 42, 12, '#e8e0cc', 1);
    },
    shadow: () => [16, 30, 6, 2, 0.3],
  });
  art('fw_winch', {
    box: [-4, -14, 42, 48], ink: true,
    v: (o) => { const s = st(o); return (s.catch || 'off') + (s.bound ? 'b' : '') + (s.float === 'slot' ? 'u' : ''); },
    f: (t, o) => { const c = cue(o); return c && (c.fx === 'crank' || c.fx === 'vane') && c.k > -200 && c.k < 700 && !o.still ? 1 + (Math.floor((c.k + 200) / 110) % 2) : 0; },
    draw(g, M, v, f) {
      const w5 = M.wood;
      // a low frame with the drum between two uprights
      kit.post(g, 4, 2, 4, 26, w5); kit.post(g, 24, 2, 4, 26, w5);
      R(g, 3, 24, 26, 3, w5[1]);
      R(g, 8, 6, 16, 10, w5[2]); R(g, 8, 6, 16, 2, w5[4]); R(g, 8, 14, 16, 2, w5[0]);
      // rope wound on the drum (more when the float is up)
      const turns = v.indexOf('u') >= 0 ? 4 : 2;
      for (let i = 0; i < turns; i++) R(g, 10 + i * 3, 7, 2, 8, '#e8e0cc');
      // teeth on the drum's rim
      for (let y = 6; y < 16; y += 2) R(g, 7, y, 1, 1, IR[2]);
      // the crank handle on the right (turns while winding)
      const hy = f === 1 ? 4 : f === 2 ? 14 : 9;
      R(g, 28, 10, 4, 2, IR[2]); R(g, 31, hy, 2, 12 - Math.abs(hy - 9), IR[2]); R(g, 31, hy - 2, 4, 3, w5[3]);
      // the catch: down in the teeth (on) or lifted clear (off)
      if (v.indexOf('on') === 0) { line(g, 2, 2, 7, 8, IR[1], 2); R(g, 6, 7, 2, 2, IR[3]); }
      else { line(g, 2, 2, 5, -4, IR[1], 2); R(g, 4, -5, 2, 2, IR[3]); }
    },
    shadow: () => [16, 29, 14, 3, 0.3],
  });
  art('fw_inlet', {
    box: [-2, -20, 40, 54], ink: true,
    v: (o) => (st(o).level === 'high' ? 'h' : 'l'),
    draw(g, M, v) {
      // a funnel on a stand, its pipe running down and into the tank's foot
      kit.post(g, 6, -2, 3, 30, M.wood);
      for (let y = -14; y < -4; y++) { const w = Math.round(16 - (y + 14) * 1.2); R(g, 15 - (w >> 1), y, w, 1, y === -14 ? IR[4] : IR[2]); }
      R(g, 13, -4, 5, 18, IR[2]); R(g, 13, -4, 1, 18, IR[3]);
      R(g, 13, 14, 25, 5, IR[2]); R(g, 13, 14, 25, 1, IR[3]); R(g, 13, 18, 25, 1, IR[0]);
      if (v === 'h') R(g, 11, -13, 9, 1, WATER[3]);
    },
    shadow: () => [16, 30, 10, 2, 0.26],
  });
  art('fw_floattank', {
    box: [-4, -44, 40, 78], ink: true,
    v: (o) => { const s = st(o); return (s.level || 'low') + '|' + (s.float || 'cradle') + (done(o) ? '|d' : ''); },
    f: (t, o) => { const c = cue(o); return c && c.fx === 'gurgle' && c.k > 0 && c.k < 800 && !o.still ? 1 + (Math.floor(c.k / 120) % 3) : 0; },
    draw(g, M, v, f) {
      const [level, fl] = v.split('|');
      const w5 = M.wood;
      // legs and the base
      kit.post(g, 5, 14, 3, 16, w5); kit.post(g, 24, 14, 3, 16, w5);
      R(g, 3, 12, 26, 3, w5[2]); R(g, 3, 12, 26, 1, w5[4]);
      // the viewing slot: a wooden window frame above the tank, on two little posts
      kit.post(g, 4, -38, 2, 16, w5); kit.post(g, 26, -38, 2, 16, w5);
      R(g, 9, -36, 14, 12, w5[1]); R(g, 11, -34, 10, 8, '#1a2a3a');
      R(g, 9, -36, 14, 1, w5[4]);
      // the glass tank
      const top = -22, bot = 12;
      R(g, 5, top, 22, bot - top, mix(GLS[3], '#ffffff', 0.25));
      const wl = level === 'high' ? -14 : 4;
      R(g, 6, wl, 20, bot - wl - 1, WATER[3]); R(g, 6, wl, 20, 1, WATER[4]);
      for (let y = wl + 3; y < bot - 1; y += 4) R(g, 8 + ((y * 7) % 11), y, 4, 1, WATER[2]);
      R(g, 5, top, 1, bot - top, GLS[1]); R(g, 26, top, 1, bot - top, GLS[1]); R(g, 5, bot - 1, 22, 1, GLS[1]);
      R(g, 7, top + 2, 1, 10, '#ffffff'); R(g, 5, top, 22, 2, IR[2]); R(g, 5, top, 22, 1, IR[3]); // the lid
      // the cradle at the bottom
      R(g, 11, 9, 10, 2, w5[1]);
      // the float: a cork with a paper label, where it is now
      const pos = fl === 'slot' ? [12, -32] : fl === 'stop' ? [18, wl - 3] : [12, 5];
      const [fx, fy] = pos;
      R(g, fx, fy, 8, 5, '#b8864a'); R(g, fx, fy, 8, 1, '#d8aa6a'); R(g, fx, fy + 4, 8, 1, '#8a6030');
      R(g, fx + 1, fy + 1, 6, 3, PP[4]); R(g, fx + 2, fy + 2, 4, 1, fl === 'slot' ? INK[2] : PP[1]);
      // its line up to the pulley (slack at the stop)
      if (fl === 'stop') { for (let y = -40; y < fy; y += 2) R(g, 11 + Math.round(Math.sin(y / 5) * 2), y, 1, 1, '#e8e0cc'); }
      else line(g, fx + 4, fy, 11, -44, '#e8e0cc', 1);
      if (fl === 'stop') { R(g, 24, wl - 5, 2, 8, w5[3]); } // the side stop
      // bubbles coming back up (water poured in with the vent shut)
      if (f) for (let i = 0; i < 4; i++) { const by = 10 - ((f * 5 + i * 6) % 16); R(g, 7 + i * 2, by, 2, 2, '#ffffff'); }
    },
    shadow: () => [16, 30, 13, 3, 0.3],
  });
  art('fw_ventpipe', {
    box: [-6, -34, 40, 68], ink: true,
    v: (o) => st(o).vent || 'shut',
    draw(g, M, v) {
      // a pipe from the tank's lid (to the left) turning up to a capped vent
      R(g, -6, -22, 18, 4, IR[2]); R(g, -6, -22, 18, 1, IR[3]);
      R(g, 9, -30, 4, 10, IR[2]); R(g, 9, -30, 1, 10, IR[3]);
      if (v === 'shut') { R(g, 7, -32, 8, 3, BR[2]); R(g, 7, -32, 8, 1, BR[4]); }
      else {
        R(g, 7, -36, 8, 3, BR[2]); R(g, 7, -36, 8, 1, BR[4]); R(g, 10, -33, 2, 3, BR[1]); // cap lifted on its thread
        arrow(g, 18, -30, 'up', 7, '#e8f0f4'); arrow(g, 4, -30, 'up', 5, '#e8f0f4');
      }
      // a small stand
      kit.post(g, 18, -2, 3, 32, M.wood);
      R(g, 12, -4, 12, 2, M.wood[1]);
    },
    shadow: () => [18, 30, 5, 2, 0.24],
  });

  // ==== F3: the maker's mark =====================================================================================
  prop('fw_wedgerack'); prop('fw_tray'); prop('fw_armlamp'); prop('fw_note');
  art('fw_wedgerack', {
    box: [0, -8, 32, 42], ink: true,
    v: (o) => st(o).support || 'none',
    draw(g, M, v) {
      const w5 = M.wood;
      R(g, 4, 10, 24, 14, w5[1]); R(g, 5, 11, 22, 12, w5[0]); R(g, 4, 10, 24, 1, w5[3]);
      const n = v === 'peg' ? 4 : 5;
      for (let i = 0; i < n; i++) { const x = 6 + i * 4; poly(g, [x, 22, x + 3, 22, x + 3, 4], w5[3]); R(g, x + 2, 5, 1, 17, w5[4]); }
    },
    shadow: () => [16, 28, 13, 3, 0.3],
  });
  art('fw_tray', {
    box: [-6, -28, 44, 62], ink: true,
    v: (o) => { const s = st(o); return (s.support || 'none') + '|' + (s.light || 'top') + (done(o) ? '|d' : ''); },
    f: (t, o) => { const s = st(o); return s.support === 'none' && !o.still ? K.frame(t, 420, 2, false, 0.2) : 0; },
    draw(g, M, v, f) {
      const [sup, light] = v.split('|');
      const w5 = M.wood;
      const tilt = sup === 'none' ? (f ? 1 : -1) : 0;
      // the stand: three legs, the front right one short
      kit.post(g, 5, 8, 3, 22, w5); kit.post(g, 24, 8, 3, sup === 'peg' ? 22 : 19, w5); // 'stone': the woven block under it is drawn by the weave marks
      if (sup === 'peg') { poly(g, [22, 30, 29, 30, 29, 27], w5[3]); R(g, 22, 29, 7, 1, w5[1]); }
      // the tray top, rocking a pixel when unsupported
      for (let x = 2; x < 30; x++) R(g, x, 6 + Math.round(((x - 16) / 14) * tilt), 1, 3, x < 4 ? w5[4] : w5[3]);
      R(g, 2, 9 + tilt, 28, 1, w5[0]);
      // the finished globe on it
      const gy = -5 + tilt;
      ell(g, 16, gy, 9, 11, GLS[2]); ell(g, 16, gy, 7, 9, GLS[3]); R(g, 11, gy - 7, 2, 6, '#ffffff'); R(g, 12, gy - 11, 8, 2, GLS[1]);
      // the mark on the rim: a faint scratch, or a clear leaf once steady and lit from the side
      const seen = sup !== 'none' && light !== 'top';
      if (seen) { R(g, 19, gy + 3, 3, 1, GLS[0]); R(g, 18, gy + 4, 5, 1, GLS[0]); R(g, 19, gy + 5, 3, 1, GLS[0]); R(g, 20, gy + 6, 1, 2, GLS[0]); }
      else R(g, 19, gy + 4, 3, 1, GLS[2]);
      // the name card holder, filled once the mark is read
      R(g, 22, 11, 7, 5, w5[1]);
      if (v.indexOf('|d') >= 0) { R(g, 23, 11, 5, 4, PP[4]); R(g, 24, 13, 3, 1, INK[2]); }
    },
    shadow: () => [16, 30, 13, 3, 0.3],
  });
  art('fw_armlamp', {
    box: [-30, -44, 70, 78], ink: true,
    v: (o) => st(o).light || 'top',
    draw(g, M, v) {
      const w5 = M.wood;
      kit.post(g, 18, -30, 4, 60, w5);
      R(g, 16, 26, 8, 4, w5[1]);
      if (v === 'top') {
        // the arm reaching left and down over the tray, the lamp hanging above it
        line(g, 19, -28, -6, -24, IR[2], 2); line(g, -6, -24, -6, -10, IR[2], 1);
        R(g, -11, -10, 10, 6, IR[1]); kit.lamp(g, -10, -9, 8, 4, 0);
      } else {
        // swung down to the side: low, level with the tray
        line(g, 19, -28, 8, 0, IR[2], 2);
        R(g, 2, 0, 10, 7, IR[1]); kit.lamp(g, 2, 1, 7, 5, 0);
      }
      R(g, 16, -32, 8, 3, BR[2]);
    },
    over(g, M, v) {
      // the lamp's light (a soft warm wash where it falls)
      if (v === 'top') { g.fillStyle = 'rgba(255,220,150,0.18)'; g.fillRect(-14, -4, 18, 30); }
      else { g.fillStyle = 'rgba(255,220,150,0.18)'; g.fillRect(-24, 2, 26, 10); }
    },
    shadow: () => [20, 30, 5, 2, 0.26],
  });
  art('fw_note', {
    box: [0, -20, 32, 54], ink: true,
    draw(g, M) {
      kit.post(g, 14, -4, 4, 34, M.wood);
      R(g, 6, -16, 20, 16, M.wood[1]);
      slip(g, 7, -15, 18, 14, 81, true);
      // a row of three little marks under the text: a leaf, three dots, a wave
      R(g, 9, -4, 3, 2, INK[2]); R(g, 15, -4, 1, 1, INK[2]); R(g, 17, -4, 1, 1, INK[2]); R(g, 16, -3, 1, 1, INK[2]);
      R(g, 20, -3, 2, 1, INK[2]); R(g, 22, -4, 2, 1, INK[2]);
    },
    shadow: () => [16, 30, 6, 2, 0.26],
  });

  // ==== F4: the frosted compartments =============================================================================
  prop('fw_postnote'); prop('fw_locker'); prop('fw_warmbox');
  art('fw_postnote', {
    box: [0, -24, 32, 58], ink: true,
    draw(g, M, v, f, info) {
      kit.post(g, 3, -18, 3, 48, M.wood);
      R(g, 5, -18, 22, 20, M.wood[1]);
      slip(g, 6, -17, 20, 18, 91, true);
      // a small drawn box-and-arrow: "the one like Hayate's"
      box(g, 9, -6, 5, 5, INK[2]); circ(g, 11, -4, 1, INK[2]); arrow(g, 15, -4, 'right', 4, INK[2]); box(g, 20, -6, 5, 5, INK[2]);
      if (info.snow) K.snowTops(g, 0, -24, 32, 10, M.snow, 3, 2);
    },
    shadow: () => [8, 30, 6, 2, 0.26],
  });
  // one third of the cabinet: its own door and label, the roof and the glass
  // cover spanning all three; the frost over the labels' lower halves
  const STAMP = { a: 'circle', b: 'tri', c: 'circle' };
  art('fw_locker', {
    box: [-2, -30, 36, 64], ink: true,
    v: (o) => { const s = st(o); return o.part + '|' + (s.frost || 'on') + (s.found && o.part === 'c' ? '|f' : ''); },
    draw(g, M, v, f, info) {
      const [part, frost] = v.split('|');
      const w5 = M.wood, left = part === 'a', right = part === 'c';
      // roof strip
      R(g, left ? -2 : 0, -28, right || left ? 34 : 32, 4, M.roof ? M.roof[2] : w5[1]); R(g, left ? -2 : 0, -28, 34, 1, M.roof ? M.roof[4] : w5[4]);
      // cabinet body
      R(g, 0, -24, 32, 52, w5[1]);
      if (left) R(g, 0, -24, 2, 52, w5[0]);
      if (right) R(g, 30, -24, 2, 52, w5[0]);
      // the door
      R(g, 3, -8, 26, 34, w5[2]); R(g, 3, -8, 26, 1, w5[4]); R(g, 27, 8, 2, 4, BR[2]);
      // the label card behind the cover
      R(g, 5, -21, 22, 11, PP[3]); R(g, 5, -21, 22, 1, PP[4]);
      if (part === 'a') for (let i = 0; i < 3; i++) R(g, 8 + i * 5, -19, 4, 1, INK[2]); // a name (above the frost line)
      const sx = 16, sy = -14;
      if (STAMP[part] === 'circle') circ(g, sx, sy, 2, '#a83e27'); else tri(g, sx, sy, 2, '#a83e27');
      // the glass cover over the label strip
      R(g, 0, -23, 32, 14, 'rgba(210,235,245,0.35)'); R(g, 0, -23, 32, 1, '#e8f6ff');
      if (frost === 'on') {
        // frost over the lower half of the label (where the stamps are) and in patches above
        for (let y = -16; y < -9; y++) for (let x = 1; x < 31; x++) if (((x * 7 + y * 13) % 5) !== 0) R(g, x, y, 1, 1, (x + y) % 3 ? '#f4fbff' : '#dcecf4');
        for (let x = 2; x < 30; x += 3) R(g, x, -18 + ((x * 5) % 3), 2, 1, '#eef8ff');
      }
      // the brass warming plate in the middle of the frame (with its arrow)
      if (part === 'b') { R(g, 12, -27, 8, 4, BR[2]); R(g, 12, -27, 8, 1, BR[4]); R(g, 15, -26, 2, 2, BR[0]); }
      if (v.indexOf('|f') >= 0) R(g, 25, -4, 3, 3, '#c8b890'); // a toggle left on the sill
      if (info.snow) K.snowTops(g, -2, -30, 36, 8, M.snow, part.charCodeAt(0), 2);
    },
    shadow: (v) => [16, 30, 16, 2.5, 0.3],
  });
  art('fw_warmbox', {
    box: [0, -16, 32, 50], ink: true,
    f: (t, o) => (o.still ? 0 : K.frame(t, 600, 3, false, 0.3)),
    draw(g, M, v, f, info) {
      const w5 = M.wood;
      kit.post(g, 6, 12, 3, 18, w5); kit.post(g, 23, 12, 3, 18, w5);
      R(g, 4, 0, 24, 14, w5[2]); R(g, 4, 0, 24, 2, w5[4]); R(g, 4, 12, 24, 2, w5[0]);
      R(g, 3, -3, 26, 3, w5[3]);
      R(g, 12, 4, 8, 5, '#c86a4a'); R(g, 12, 4, 8, 1, '#e89a6a'); // the cloth, folded
      // warmth rising from the lid (steam wisps)
      for (let i = 0; i < 2; i++) { const y = -6 - ((f * 3 + i * 5) % 9); R(g, 10 + i * 9, y, 1, 2, '#f4f0ea'); R(g, 11 + i * 9, y - 2, 1, 2, '#f4f0ea'); }
      if (info.snow) K.snowTops(g, 0, -4, 32, 6, M.snow, 5, 1);
    },
    shadow: () => [16, 30, 12, 2.5, 0.3],
  });

  // ==== F5: the listening corner ==================================================================================
  prop('fw_nook', { block: false }); prop('fw_flap'); prop('fw_mouth'); prop('fw_alcove'); prop('fw_display'); prop('fw_tubemap');
  const CROSS_Y = -32, LOW_Y = -8;
  art('fw_nook', {
    box: [-4, -40, 40, 74],
    draw(g, M) {
      const w5 = M.wood;
      // a little roofed reading seat: back posts, a shingled roof, a bench
      kit.post(g, 2, -26, 3, 50, w5); kit.post(g, 27, -26, 3, 50, w5);
      poly(g, [-4, -26, 36, -26, 32, -34, 0, -34], M.roof[2]); R(g, 0, -34, 32, 1, M.roof[4]);
      R(g, 4, 10, 24, 4, w5[3]); R(g, 4, 14, 24, 2, w5[0]);
      R(g, 22, 6, 5, 4, '#c86a4a'); // a cushion
      // the end of the left tube, opening beside the seat
      tubeH(g, 26, 36, LOW_Y); R(g, 26, LOW_Y, 2, 5, BAM[0]);
    },
    shadow: () => [16, 30, 15, 3, 0.26],
  });
  art('fw_flap', {
    box: [-2, -40, 36, 74], ink: true,
    v: (o) => st(o).B || 'nook',
    draw(g, M, v) {
      tubeH(g, -2, 34, LOW_Y);
      // the branch up into the cross tube, which runs off to the right
      tubeV(g, 12, CROSS_Y, LOW_Y); tubeH(g, 12, 34, CROSS_Y);
      // the flap box at the fork
      R(g, 9, LOW_Y - 4, 11, 12, M.wood[1]); R(g, 10, LOW_Y - 3, 9, 10, M.wood[3]);
      if (v === 'nook') line(g, 18, LOW_Y - 2, 11, LOW_Y + 5, IR[1], 2);   // turned left, toward the nook
      else line(g, 11, LOW_Y - 2, 18, LOW_Y + 5, IR[1], 2);                // turned up, into the cross tube
      R(g, 14, LOW_Y + 7, 2, 18, M.wood[1]); R(g, 12, 24, 6, 5, M.wood[0]);  // its lever post
    },
    shadow: () => [15, 30, 6, 2, 0.24],
  });
  art('fw_mouth', {
    box: [-2, -40, 36, 74], ink: true,
    v: (o) => (o.part || 'mL') + '|' + (st(o)[o.part] || 'open'),
    draw(g, M, v) {
      const [part, state] = v.split('|');
      tubeH(g, -2, 34, LOW_Y);
      tubeH(g, -2, 34, CROSS_Y);
      // the curtain frame at the tube's mouth (the alcove side)
      const mx = part === 'mL' ? 24 : 4;
      R(g, mx, LOW_Y - 8, 4, 2, M.wood[3]);
      if (state === 'drawn') { R(g, mx - 1, LOW_Y - 6, 6, 14, '#6a4a7a'); R(g, mx - 1, LOW_Y - 6, 6, 1, '#8a6a9a'); for (let y = LOW_Y - 4; y < LOW_Y + 7; y += 3) R(g, mx, y, 4, 1, '#5a3a6a'); }
      else { R(g, mx - 1, LOW_Y - 8, 6, 3, '#6a4a7a'); } // rolled up
      R(g, 14, LOW_Y + 5, 2, 20, M.wood[1]); // support
    },
    shadow: () => [16, 30, 5, 2, 0.22],
  });
  art('fw_alcove', {
    box: [-4, -44, 40, 78], ink: true,
    f: (t, o) => { const c = cue(o); return c && c.fx === 'chime' && c.k > -150 && c.k < 700 && !o.still ? 1 + (Math.floor((c.k + 150) / 120) % 2) : 0; },
    draw(g, M, v, f) {
      const s5 = M.stone;
      // a small stone alcove, the cross tube passing over its roof
      tubeH(g, -4, 36, CROSS_Y);
      R(g, 3, -22, 26, 50, s5[2]); R(g, 3, -22, 26, 2, s5[4]); R(g, 3, 26, 26, 2, s5[0]);
      poly(g, [0, -22, 32, -22, 26, -28, 6, -28], s5[1]);
      R(g, 8, -16, 16, 22, '#2a2430');
      // the chime (a small bell) hanging, and the striker on its cord
      const sw = f === 1 ? -1 : f === 2 ? 1 : 0;
      R(g, 15, -16, 1, 5, IR[2]); ell(g, 15 + sw, -7, 4, 4, BR[2]); R(g, 12 + sw, -5, 7, 2, BR[1]); R(g, 13 + sw, -9, 2, 2, BR[4]);
      R(g, 21, -14, 1, 8, '#e8e0cc'); R(g, 19, -6, 5, 3, M.wood[3]);
      // tube stubs out to the left and right
      tubeH(g, -4, 3, LOW_Y); tubeH(g, 29, 36, LOW_Y);
    },
    shadow: () => [16, 30, 14, 3, 0.3],
  });
  art('fw_display', {
    box: [-4, -44, 40, 78], ink: true,
    v: (o) => (done(o) ? 'd' : ''),
    f: (t, o) => { const c = cue(o); const hit = c && c.res && c.res.after && (c.res.after.sent === 'display' || c.res.after.sent === 'both'); return hit && c.k > 150 && c.k < 1100 && !o.still ? 1 + (Math.floor(c.k / 110) % 3) : 0; },
    draw(g, M, v, f) {
      const w5 = M.wood;
      // the right tube arrives from the left; the cross tube comes down into it
      tubeH(g, -4, 8, LOW_Y); tubeH(g, -4, 6, CROSS_Y); tubeV(g, 4, CROSS_Y, LOW_Y);
      // a small niche on a post
      kit.post(g, 14, 6, 4, 24, w5);
      R(g, 6, -22, 20, 28, w5[1]); R(g, 8, -20, 16, 24, '#f4ecd8'); R(g, 6, -22, 20, 1, w5[4]);
      // the paper lily-of-the-valley: a stem, leaves, and little paper bells that turn
      R(g, 16, -14, 1, 16, '#6a8a4a'); poly(g, [16, 2, 11, -6, 16, -4], '#8aaa5a');
      const bells = [[13, -12], [19, -10], [14, -7]];
      bells.forEach(([x, y], i) => { const dx = f ? Math.round(Math.sin((f + i) * 1.7) * 1.5) : 0; R(g, x + dx, y, 3, 3, '#ffffff'); R(g, x + dx, y + 2, 3, 1, '#d8d0c0'); });
    },
    shadow: () => [16, 30, 8, 2, 0.24],
  });
  art('fw_tubemap', {
    box: [-2, -24, 36, 58], ink: true,
    v: (o) => (done(o) ? 'd' : ''),
    draw(g, M, v) {
      paperBoard(g, M, 1, -20, 30, 24, 26);
      // pictogram: nook ← flap ← [alcove] → display; flap ↑ cross → display
      box(g, 3, -8, 4, 5, I); R(g, 7, -6, 5, 1, I); box(g, 12, -8, 3, 4, I); R(g, 15, -6, 3, 1, I);
      box(g, 18, -9, 4, 5, '#a83e27'); R(g, 22, -6, 3, 1, I); box(g, 25, -8, 4, 5, I);
      R(g, 13, -16, 1, 8, I); R(g, 13, -16, 14, 1, I); R(g, 27, -16, 1, 8, I);
      if (v === 'd') { R(g, 5, -2, 22, 1, '#e8e0cc'); R(g, 8, 0, 16, 1, '#e8e0cc'); } // the chalked arrangement
    },
    shadow: () => [16, 30, 12, 2.5, 0.26],
  });

  // ==== F6: the unbound index ======================================================================================
  prop('fw_indexbox'); prop('fw_sliptray');
  const fcol = (i) => ['#4a6a8a', '#8a5a3a', '#6a7a4a'][i];
  art('fw_indexbox', {
    box: [0, -12, 32, 46], ink: true,
    v: (o) => { const s = st(o); return ['s1', 's2', 's3'].map((k) => (s[k] || 'loose')[0]).join('') + (done(o) ? 'd' : ''); },
    draw(g, M, v) {
      const w5 = M.wood;
      // a box on the wall, its lid open, three folders standing in it
      R(g, 3, 4, 26, 22, w5[1]); R(g, 4, 5, 24, 20, w5[0]);
      R(g, 3, -8, 26, 12, w5[3]); R(g, 5, -6, 22, 8, PP[3]); for (let k = 0; k < 3; k++) R(g, 7, -5 + k * 2, 18 - k * 4, 1, INK[3]); // the rule inside the lid
      for (let i = 0; i < 3; i++) {
        const x = 6 + i * 8;
        R(g, x, 8, 6, 16, fcol(i)); R(g, x, 8, 6, 1, mix(fcol(i), '#ffffff', 0.3));
        R(g, x + 1, 5, 4, 3, fcol(i));
        if (i === 2) R(g, x + 2, 5, 1, 1, w5[0]); // the notched tab (Held for collection)
        // slips filed in this folder show as paper edges
        const folder = ['u', 'd', 'h'][i];
        const n = v.slice(0, 3).split('').filter((c) => c === folder).length;
        for (let k = 0; k < n; k++) R(g, x + 1 + k, 7 - k, 4, 1, PP[4]);
      }
      R(g, 3, 25, 26, 2, w5[3]);
    },
    shadow: () => [16, 30, 12, 2, 0.2],
  });
  art('fw_sliptray', {
    box: [0, -8, 32, 42], ink: true,
    v: (o) => { const s = st(o); return ['s1', 's2', 's3'].map((k) => ((s[k] || 'loose') === 'loose' ? '1' : '0')).join('') + (s.marks === 'shown' ? 'm' : '') + (s.how === 'rubbed' ? 'r' : ''); },
    draw(g, M, v) {
      const w5 = M.wood;
      kit.post(g, 5, 12, 3, 18, w5); kit.post(g, 24, 12, 3, 18, w5);
      kit.top(g, 2, 6, 28, 6, 3, w5, 7);
      R(g, 4, 3, 24, 5, w5[1]); // the tray's rim
      const shown = v.indexOf('m') >= 0;
      // the three slips (the second one notched), when not filed
      [0, 1, 2].forEach((i) => {
        if (v[i] !== '1') return;
        const x = 6 + i * 7;
        R(g, x, -2, 6, 9, PP[4]); R(g, x, -2, 6, 1, '#ffffff'); R(g, x, 6, 6, 1, PP[1]);
        if (i === 1) R(g, x + 5, 1, 1, 2, w5[1]);
        R(g, x + 1, 0, 4, 1, INK[3]); R(g, x + 1, 2, 3, 1, INK[3]);
        if (shown) { const up = i !== 0; R(g, x + 2, up ? 4 : 5, 2, 1, INK[1]); R(g, x + 1, up ? 5 : 4, 1, 1, INK[1]); R(g, x + 4, up ? 5 : 4, 1, 1, INK[1]); }
      });
      // charcoal and thin paper
      R(g, 25, 8, 5, 1, '#1a1616'); R(g, 3, 8, 6, 2, v.indexOf('r') >= 0 ? '#cfc8bc' : '#f4f0e8');
    },
    shadow: () => [16, 30, 13, 3, 0.28],
  });
})();
