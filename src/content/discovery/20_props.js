/* Field puzzle props (addendum §14.2-14.7, §18.1): art at art resolution in
 * the same kit and rules as src/engine/27_propart.js (light from the upper
 * left, 5-step ramps, an ink outline on things you can use). Each prop reads
 * its puzzle's displayed state (RB.fieldweave.view: the committed state, held
 * back during a field action until the effect's beat), so map art, collision
 * (conditions on the same state) and inspection always agree.
 *
 * Map entries: { p: 'fw_…', x, y, o: { pz: 'f1', part: 'screen' }, scene } */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const K = RB.propKit, P = RB.props.P, art = RB.propArt.art, kit = RB.propArt.kit;
  const { R, ell, poly, line, mix, ramp } = K;
  const PP = K.FIX.paper, INK = K.FIX.ink, IR = K.FIX.iron, BR = K.FIX.brass, GLS = K.FIX.glass;
  const st = (o) => (RB.game && RB.game.s && RB.fieldweave ? RB.fieldweave.view(RB.game.s, o.pz) : {});
  const done = (o) => !!(RB.game && RB.game.s && RB.fieldweave && RB.fieldweave.peek(RB.game.s, o.pz).done);
  // register a prop id (the legacy 16-px draw is a plain placeholder: every
  // one of these has art at art resolution)
  function prop(id, d) {
    P[id] = Object.assign({ id, w: 1, h: 1, block: true, draw(c, x, y) { c.fillStyle = '#6a5a48'; c.fillRect(x + 3, y + 3, 10, 10); } }, d || {});
  }
  // slips of paper with lines of brush dashes (never letter shapes)
  function slip(g, x, y, w, h, seed, pin) {
    R(g, x, y, w, h, PP[3]); R(g, x, y, w, 1, PP[4]); R(g, x + w - 1, y + 1, 1, h - 1, PP[1]); R(g, x, y + h - 1, w, 1, PP[1]);
    for (let k = 0; k < (h - 3) / 2; k++) R(g, x + 1, y + 2 + k * 2, Math.max(1, w - 3 - ((K.hh(seed, k, 5) >>> 2) % 2)), 1, INK[3]);
    if (pin) R(g, x + (w >> 1), y, 1, 1, '#c83a3a');
  }

  // ---- F1: the slip screen and its clamp (Reedwake, by the river warehouse) ---------------------------
  prop('fw_slipscreen');
  prop('fw_clamppost');
  // the screen's swing: panel width and how far its free edge drops toward you
  const SWING = [[24, 0], [21, 2], [15, 4], [21, 2]];
  art('fw_slipscreen', {
    box: [-4, -34, 42, 68], ink: true,
    v: (o) => { const s = st(o); return s.screen === 'closed' || s.held || s.clamp === 'set' ? (s.clamp === 'set' ? 'c' : 's') : 'w'; },
    f: (t, o) => { const s = st(o); if (s.screen === 'closed' || s.held || s.clamp === 'set') return 0; return o.still ? 1 : K.frame(t, 260, 4, false, 0.3); },
    draw(g, M, v, f) {
      const w5 = M.wood, reed = ramp(mix(PP[2], '#c8b27a', 0.35), 0.35, 0.25);
      // a small shingled eave from the warehouse wall
      poly(g, [-4, -26, 38, -26, 34, -32, -2, -32], M.roof[2]);
      for (let x = -2; x < 36; x += 4) R(g, x, -27, 3, 2, M.roof[1]);
      R(g, -2, -32, 36, 1, M.roof[4]);
      kit.post(g, 0, -26, 4, 56, w5);
      R(g, 4, -24, 28, 2, w5[1]); // the rail the hinges hang from
      const [pw, dy] = SWING[f];
      const x0 = 5, top = -20, bot = 14;
      // the panel as a hinged parallelogram (free edge swinging toward you)
      for (let i = 0; i < pw; i++) {
        const d = Math.round((dy * i) / pw), edge = i < 2 || i >= pw - 2;
        R(g, x0 + i, top + d, 1, bot - top, edge ? w5[i < 2 ? 3 : 1] : reed[(i % 3 === 0) ? 1 : 2]);
        R(g, x0 + i, top + d, 1, 2, w5[3]); R(g, x0 + i, bot + d - 2, 1, 2, w5[1]);
      }
      for (let y = top + 6; y < bot - 2; y += 6) for (let i = 2; i < pw - 2; i++) R(g, x0 + i, y + Math.round((dy * i) / pw), 1, 1, reed[1]);
      // the name slips pinned on it (foreshortened with the panel)
      const sc = pw / 24;
      [[3, -16, 8, 9], [13, -15, 8, 8], [3, -4, 8, 9], [13, -3, 8, 10]].forEach(([sx, sy, w, h], i) => {
        const x = x0 + Math.round(sx * sc), ww = Math.max(2, Math.round(w * sc));
        slip(g, x, sy + Math.round((dy * (sx + w / 2)) / 24), ww, h, 40 + i, true);
      });
      // hinges
      R(g, x0 - 1, top + 2, 3, 3, IR[2]); R(g, x0 - 1, bot - 6, 3, 3, IR[2]);
      if (v === 'w') {
        // motion marks at the free edge, so the swing reads even when still
        for (let k = 0; k < 3; k++) R(g, x0 + pw + 2 + k, top + 6 + k * 5 + dy, 2, 1, PP[4]);
      }
    },
    shadow: () => [16, 30, 14, 3, 0.3],
  });
  art('fw_clamppost', {
    box: [-8, -30, 40, 64], ink: true,
    v: (o) => { const s = st(o); return s.clamp === 'set' ? 'set' : 'open'; },
    draw(g, M, v) {
      const w5 = M.wood, cl = ramp(mix(w5[3], '#b88a4a', 0.4), 0.45, 0.35);
      kit.post(g, 0, -24, 5, 54, w5);
      R(g, -1, -26, 7, 2, w5[4]);
      if (v === 'open') {
        // a wooden screw clamp hanging open on a peg
        R(g, 6, -12, 4, 2, w5[1]);
        R(g, 12, -14, 3, 20, cl[2]); R(g, 12, -14, 1, 20, cl[3]);
        R(g, 12, -14, 10, 3, cl[2]); R(g, 12, -14, 10, 1, cl[4]);
        R(g, 12, 3, 10, 3, cl[1]);
        R(g, 21, -11, 2, 6, IR[2]); R(g, 21, 0, 2, 3, IR[2]); // jaws, well apart
        R(g, 23, -10, 6, 2, cl[3]); R(g, 28, -12, 2, 6, cl[1]); // the screw handle
      } else {
        // closed on the screen's edge and the post
        R(g, -8, -8, 3, 14, cl[2]); R(g, -8, -8, 1, 14, cl[3]);
        R(g, -8, -8, 15, 3, cl[2]); R(g, -8, -8, 15, 1, cl[4]);
        R(g, -8, 3, 15, 3, cl[1]);
        R(g, 6, -9, 3, 16, cl[1]);
        R(g, 9, -3, 7, 2, cl[3]); R(g, 15, -6, 2, 8, cl[1]);
        R(g, -5, -5, 2, 2, BR[3]);
      }
    },
    // the draught off the river, drawn crossing toward the screen while it swings
    live(c, x, y, pal, t, o) {
      const s = st(o);
      if (s.screen === 'closed' || s.held || s.clamp === 'set') return;
      c.fillStyle = 'rgba(240,244,236,0.8)';
      for (let k = 0; k < 3; k++) {
        const ph = o.still ? 0.4 + k * 0.2 : ((t / 900 + k * 0.33) % 1);
        const xx = Math.round(x + 44 - ph * 70), yy = y - 16 + k * 10 + Math.round(Math.sin(ph * 6 + k) * 2);
        c.fillRect(xx, yy, 8, 1); c.fillRect(xx + 8, yy - 1, 3, 1);
      }
    },
    shadow: () => [4, 30, 5, 2, 0.3],
  });

  RB.fwProps = { prop, slip, st, done };
})();
