/* Hair for the overworld figures (40×56; see 32_spriteart.js). Masks are authored for an
 * adult head (face rows 8-24, x 11-28, the figure's centre line between x 19 and 20) and
 * moved with the head. Each style has, per view, a 'back' layer (behind the body) and a
 * 'front' layer (over the face or the back of the head). Tails worn on one side of the head
 * (a side ponytail, a single braid) name that side, so the side views put them in front of
 * the head when that side faces the camera and behind it otherwise; the front view shows the
 * body's left side on screen right, the back view on screen left. */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const A = RB.sprites._art, P = RB.pix, shade = P.shade;
  const { sp, mir, stamp, newMask, shadeMask, curlShade, foldShade } = A;

  // ---- shared parts (adult rows) ------------------------------------------------------------------
  const CAP_D = sp(4, '15-24|13-26|11-28|10-29|9-30*6');
  const CAP_TIGHT_D = sp(5, '14-25|12-27|11-28|10-29|10-29*5');
  const BANGS_D = sp(14, '9-17,19-30|9-12,14-17,19-23,26-30|9-11,17-18,21-22,28-30|9-10,21,29-30');
  const SIDES_D = sp(17, '9-10,29-30*3|10,29*2');
  const NAPE_U = sp(14, '9-30*4|10-29*2|11-28|12-27|13-26|15-24');
  const SIDE_CAP = sp(4, '15-23|13-25|11-27|10-28|9-29|9-30*3');
  const SIDE_BACK = sp(13, '9-19|9-18*6|10-18|10-17|11-17|12-16');
  const SIDE_BANGS = sp(12, '9-30|19-23,25-30|20-22,26-29|20-21,27-28|20-21,27|20-21|20-21|21');
  const TIE = (look, p) => look.tieCol || p.ac[1];
  const braid = (x, y, n, w3) => {
    const rows = [];
    for (let i = 0; i < n; i++) rows.push(...(w3 ? ['43.', '332', '221'] : ['.43.', '4332', '3221']));
    return [[x, y, rows]];
  };
  // a tail: rows of [x0, x1] spans from y0, with per-row sway applied by the drawer
  const tail = (y0, spans) => spans.map(([a, b], i) => [a, y0 + i, ['#'.repeat(b - a + 1)]]);

  // Side ponytail (worn on the body's left) in each view.
  const PONY_D = tail(10, [[29, 32], [29, 33], [30, 33], [30, 34], [30, 34], [31, 34], [31, 34], [31, 35], [31, 35], [31, 35], [31, 35], [31, 34], [31, 34], [31, 34], [31, 34], [32, 34], [32, 34], [32, 33], [32, 33], [33, 33]]);
  const PONY_U = mir(PONY_D);
  const PONY_NEAR = tail(9, [[14, 18], [13, 18], [13, 17], [13, 17], [12, 17], [12, 16], [12, 16], [12, 16], [12, 16], [12, 16], [12, 16], [12, 15], [12, 15], [12, 15], [12, 15], [12, 15], [13, 15], [13, 15], [13, 14], [13, 14], [13, 14]]);
  const PONY_FAR = tail(18, [[10, 13], [10, 13], [9, 13], [9, 13], [9, 12], [9, 12], [9, 12], [9, 12], [9, 12], [10, 12], [10, 12], [10, 11], [10, 11]]);

  const HAIR = {
    short: {
      down: { front: [{ parts: [...CAP_D, ...BANGS_D, ...SIDES_D] }] },
      up: { front: [{ parts: [...CAP_D, ...NAPE_U] }] },
      side: { front: [{ parts: [...SIDE_CAP, ...SIDE_BACK, ...SIDE_BANGS] }] },
    },
    bob: {
      down: { front: [{ parts: [...CAP_D, ...sp(8, '8-31*6'), ...sp(14, '8-31|8-31|8-12,14-17,19-23,25-31|8-12,27-31*5|8-12,27-31|8-12,27-31|9-11,28-30')] }] },
      up: { front: [{ parts: [...CAP_D, ...sp(8, '8-31*16|9-30')] }] },
      side: { front: [{ parts: [...SIDE_CAP, ...sp(8, '8-9*5'), ...sp(13, '8-30|8-20,23-30|8-20,26-29|8-20,28|8-20*5|9-20|10-19')] }] },
    },
    long: {
      down: {
        back: [{ parts: sp(12, '8-31*22|9-30*3|10-29*2|12-27'), o: [20, 6], lag: 1 }],
        front: [{ parts: [...CAP_D, ...BANGS_D, ...sp(17, '8-10,29-31*12|8-10,29-31*3|9-10,29-30*2|9,30')] }],
      },
      up: { front: [{ parts: [...CAP_D, ...sp(8, '8-31*6'), ...sp(14, '8-31*22|8-31*2|9-30|9-14,16-23,25-30|10-13,17-22,26-29|18-21')], lag: 1 }] },
      side: {
        back: [{ parts: sp(12, '8-17*20|8-16*5|9-16|9-15|10-15|11-14'), o: [14, 5], lag: 1 }],
        front: [{ parts: [...SIDE_CAP, ...SIDE_BACK, ...sp(13, '19-30|20-24,26-30|20-22,27-29|20-21,28|20-22|20-21*3')], blend: true }],
      },
    },
    wavy: {
      down: {
        back: [{ parts: sp(12, '8-31*3|7-32*3|8-31*3|7-32*3|8-31*3|7-32*3|8-31*3|8-31|9-30*2|10-29|12-27'), o: [20, 6], lag: 1 }],
        front: [{ parts: [...CAP_D, ...BANGS_D, ...sp(17, '8-10,29-31*2|7-9,30-32*3|8-10,29-31*3|7-9,30-32*3|8-10,29-31*2|8-9,30-31|8,31')] }],
      },
      up: { front: [{ parts: [...CAP_D, ...sp(8, '8-31*6'), ...sp(14, '8-31|7-32*3|8-31*3|7-32*3|8-31*3|7-32*3|8-31*3|8-31|8-31|9-30|10-29|12-27')], lag: 1 }] },
      side: {
        back: [{ parts: sp(12, '8-17*3|7-16*3|8-17*3|7-16*3|8-17*3|7-16*3|8-16*2|9-16|9-15|10-14'), o: [14, 5], lag: 1 }],
        front: [{ parts: [...SIDE_CAP, ...SIDE_BACK, ...sp(13, '19-30|20-24,26-30|20-22,27-29|20-21,28|20-22|20-21*3')], blend: true }],
      },
    },
    ponytail: {
      down: { front: [{ parts: [...CAP_D, ...BANGS_D, ...SIDES_D] }, { parts: PONY_D, o: [31, 8], sway: 1, lag: 1, tie: [29, 8, 3, 3], side: 'L' }] },
      up: { front: [{ parts: [...CAP_D, ...NAPE_U] }, { parts: PONY_U, o: [8, 8], sway: -1, lag: 1, tie: [8, 8, 3, 3], side: 'L' }] },
      side: {
        far: [{ parts: PONY_FAR, o: [12, 14], sway: -1, lag: 1, side: 'L' }],
        front: [{ parts: [...SIDE_CAP, ...SIDE_BACK, ...SIDE_BANGS] }],
        near: [{ parts: PONY_NEAR, o: [16, 8], sway: -1, lag: 1, tie: [14, 8, 4, 3], side: 'L' }],
      },
    },
    bun: {
      down: { front: [{ parts: [...CAP_TIGHT_D, ...BANGS_D, ...SIDES_D] }, { parts: sp(0, '17-22|16-23|15-24*3|16-23'), o: [18, 0], h: [1, 3.4] }] },
      up: { front: [{ parts: [...CAP_TIGHT_D, ...NAPE_U] }, { parts: sp(3, '17-22|16-23|15-24*4|16-23|17-22'), o: [18, 3], h: [1, 3.4] }] },
      side: { front: [{ parts: [...SIDE_CAP, ...SIDE_BACK, ...SIDE_BANGS] }, { parts: sp(2, '9-13|8-14|7-14*3|8-14|9-13'), o: [9, 2], h: [1, 3.4] }] },
    },
    braid: {
      down: { front: [{ parts: [...CAP_D, ...BANGS_D, ...SIDES_D] }, { parts: [...braid(28, 18, 5), [29, 33, ['23', '.2']]], raw: true, tie: [28, 33, 4, 1], sway: 1, lag: 1, side: 'L' }] },
      up: { front: [{ parts: [...CAP_D, ...NAPE_U] }, { parts: [...braid(8, 18, 3), [9, 27, ['23']]], raw: true, sway: -1, lag: 1, side: 'L' }] },
      side: {
        far: [{ parts: braid(10, 18, 3, true), raw: true, sway: -1, lag: 1, side: 'L' }],
        front: [{ parts: [...SIDE_CAP, ...SIDE_BACK, ...SIDE_BANGS] }],
        near: [{ parts: [...braid(17, 19, 5, true), [17, 34, ['23', '2.']]], raw: true, tie: [17, 34, 3, 1], sway: 1, lag: 1, side: 'L' }],
      },
    },
    twintails: {
      down: {
        back: [
          { parts: sp(12, '5-9|4-9*3|4-8*11|4-7*3|5-7|5-6'), o: [8, 10], sway: -1, lag: 1 },
          { parts: sp(12, '30-34|30-35*3|31-35*11|32-35*3|32-34|33-34'), o: [31, 10], sway: 1, lag: 1 },
        ],
        front: [{ parts: [...CAP_D, ...BANGS_D, ...SIDES_D], ties: [[7, 10, 3, 3], [30, 10, 3, 3]] }],
      },
      up: {
        front: [
          { parts: [...CAP_D, ...NAPE_U], ties: [[7, 10, 3, 3], [30, 10, 3, 3]] },
          { parts: sp(13, '4-9*3|4-8*11|4-7*3|5-7|5-6'), o: [8, 10], sway: -1, lag: 1 },
          { parts: sp(13, '30-35*3|31-35*11|32-35*3|32-34|33-34'), o: [31, 10], sway: 1, lag: 1 },
        ],
      },
      side: {
        back: [{ parts: sp(13, '10-13*3|9-13*11|9-12*3|10-12|10-11'), o: [12, 11], sway: -1, lag: 1 }],
        front: [{ parts: [...SIDE_CAP, ...SIDE_BACK, ...SIDE_BANGS], ties: [[13, 10, 3, 3]] }],
      },
    },
    curly: {
      down: { front: [{ parts: sp(2, '15-17,21-23|12-26|10-28|9-30|8-31|7-32*7|7-12,14-17,20-23,26-32|7-11,15-16,21-22,27-32|7-10,29-32*4|7-10,29-32|8-10,29-31|8-9,30-31'), mode: 'curl' }] },
      up: { front: [{ parts: sp(2, '15-17,21-23|12-26|10-28|9-30|8-31|7-32*15|8-31|9-30|11-28|13-26'), mode: 'curl' }] },
      side: { front: [{ parts: sp(2, '14-16,20-22|11-25|9-27|8-28|7-29|7-30*6|7-18,20-24,26-30|7-18,21-23,28-29|7-18|7-17*2|8-17|8-16|9-16|10-15'), mode: 'curl' }] },
    },
    spiky: {
      down: { front: [{ parts: [...sp(1, '13,19,26|13-14,18-20,25-26|13-15,17-21,24-26'), ...sp(4, '12-27|11-28|10-29|9-30*6'), ...sp(9, '7-8,31-32|8,31'), ...sp(14, '9-14,16-19,21-24,26-30|9-11,13-14,17-19,22-24,27-30|9-10,13,18-19,23,29-30|9,29-30'), ...SIDES_D] }] },
      up: { front: [{ parts: [...sp(1, '13,19,26|13-14,18-20,25-26|13-15,17-21,24-26'), ...sp(4, '12-27|11-28|10-29|9-30*6'), ...sp(9, '7-8,31-32|8,31'), ...sp(14, '9-30*3|10-29*2|11-28|12-27|13-26|14-16,18-21,23-25')] }] },
      side: { front: [{ parts: [...sp(1, '12,18,24|12-13,17-19,23-25|12-14,16-20,22-26'), ...sp(4, '11-27|10-28|9-29'), ...sp(7, '5-8|6-8'), ...sp(7, '9-29*2|9-30*4'), ...sp(13, '8-19|9-18,20-24,26-30|9-18,20-22,27-29|8-18,20-21,28|10-18,20-21|10-17,21|11-17|12-16')] }] },
    },
    shaved: {
      down: { front: [{ parts: sp(5, '14-25|12-27|11-28|10-29*5|10-11,28-29|10,29'), ramp: 'stubble' }] },
      up: { front: [{ parts: sp(5, '14-25|12-27|11-28|10-29*12|11-28|12-27|14-25'), ramp: 'stubble' }] },
      side: { front: [{ parts: sp(5, '14-23|12-25|11-27|10-28*4|10-18,21-26|10-17|10-17*3|11-17|11-16|12-16'), ramp: 'stubble' }] },
    },
    wrap: {
      down: { front: [{ parts: [...sp(3, '14-25|12-27|11-28|10-29*7|9-30:4|9-30:2'), ...sp(15, '9-11,28-30*3|10-11,28-29*2')], ramp: 'wrap', mode: 'fold' }, { parts: sp(2, '25-28|24-29|25-28'), ramp: 'wrap', mode: 'knot' }] },
      up: { front: [{ parts: sp(3, '14-25|12-27|11-28|10-29*7|9-30*3|10-29|11-28|12-27|13-26'), ramp: 'wrap', mode: 'fold' }, { parts: sp(18, '17-22|18-21|17-22|17-18,21-22*2|17,22'), ramp: 'wrap', mode: 'knot' }] },
      side: {
        back: [{ parts: sp(12, '7-11*2|6-10*2|7-10*2|7-9*2|8'), ramp: 'wrap', mode: 'fold', sway: -1, lag: 1 }],
        front: [{ parts: [...sp(3, '14-23|12-25|11-27|10-28|9-29*6|9-30:4|9-29:2'), ...sp(15, '10-17*3|11-17')], ramp: 'wrap', mode: 'fold' }, { parts: sp(4, '9-12|8-13|9-12'), ramp: 'wrap', mode: 'knot' }],
      },
    },
  };
  HAIR.bald = { down: {}, up: {}, side: {} };
  const ORIGIN = { down: [18, 2], up: [20, 5], side: [22, 3] };
  const BAND = { down: [4.2, 6.8, 2], up: [5.6, 8.2, 2], side: [4.4, 7, 0] };

  // layer: 'back' | 'front' ; in the side views also 'far' (behind everything) and 'near' (over the face)
  function drawHair(b, look, p, g, view, layer, near) {
    const st = HAIR[look.hair] || HAIR.short;
    const V = st[view];
    if (!V) return;
    let groups = V[layer] || [];
    if (view === 'side') {
      // a tail worn on one side draws in front when that side faces the camera, behind when not
      if (layer === 'back') groups = groups.concat((V.far || []).filter((G) => G.side !== near), (V.near || []).filter((G) => G.side && G.side !== near && !V.far));
      if (layer === 'front') groups = groups.concat((V.near || []).filter((G) => !G.side || G.side === near));
    }
    if (!groups.length) return;
    const pose = g.pose;
    for (const G of groups) {
      // follow-through: tails and long hair move a frame after the head
      const dy = G.lag ? g.tl : g.hy;
      const sw = G.sway ? (pose.step ? G.sway * (view === 'side' ? 1 : pose.sway || 0) : 0) : 0;
      const m = stamp(newMask(), G.parts, sw, dy);
      const R = G.ramp === 'wrap' ? p.wrap : G.ramp === 'stubble' ? p.stubble : p.hair;
      if (G.raw) {
        for (const [key, ch] of m.px) { const c = key.indexOf(','); b.put(+key.slice(0, c), +key.slice(c + 1), P.rgba(R[(ch >= '1' && ch <= '5' ? +ch : 3) - 1])); }
      } else if (G.mode === 'curl') curlShade(b, m, R, 11 + dy);
      else if (G.mode === 'fold' || G.mode === 'knot') foldShade(b, m, R, G.mode === 'knot');
      else {
        const o = G.o || ORIGIN[view];
        const band = G.h ? [G.h[0], G.h[1], 1] : G.o ? null : BAND[view];
        shadeMask(b, m, R, { blend: G.blend, ox: o[0] + sw, oy: o[1] + dy, h0: band ? band[0] : null, h1: band ? band[1] : null, hx: band ? band[2] : 1, r0: G.ramp === 'stubble' ? 99 : 5 });
      }
      const tieC = TIE(look, p);
      const tie = (t) => { b.rect(t[0] + sw, t[1] + dy, t[2], t[3], tieC); b.rect(t[0] + sw, t[1] + dy + t[3] - 1, t[2], 1, shade(tieC, -1)); b.px(t[0] + sw, t[1] + dy, shade(tieC, 1)); };
      if (G.tie) tie(G.tie);
      if (G.ties) G.ties.forEach(tie);
    }
  }
  A.HAIR = HAIR;
  A.drawHair = drawHair;
})();
