/* Portrait hair (96×96): every hairstyle as a back mass (behind the head and
 * shoulders) and a front layer (crown, fringe, side locks, tails), built as
 * masks from polygons and shaded as locks radiating from the crown: each lock
 * lit on its upper-left edge with a dark seam on the other, a broken
 * highlight band across the crown, and deeper shadow at lock tips. The
 * fringe casts a soft shadow on the face. */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const P = RB.pix, S = 96;
  const shade = P.shade, mix = P.mix;
  const hh = (a, b) => ((a * 73856093) ^ (b * 19349663)) >>> 0;

  function mask(fn) { const m = new P.Buf(S, S); fn(m); return m; }
  const W = '#fff';
  const mirror = (pts) => pts.map((v, i) => (i % 2 ? v : 95 - v));

  // Lock shading of a mask around a parting point.
  function locks(b, m, R, o) {
    const st = o.step || 22, r0 = o.r0 == null ? 8 : o.r0;
    const inM = (x, y) => (y >= S ? o.open : m.alphaAt(x, y) > 0);
    m.each((x, y) => {
      let v = 3;
      const dx = x + 0.5 - o.ox, dy = y + 0.5 - o.oy, r = Math.hypot(dx, dy);
      const th = Math.atan2(dy, dx);
      // lock boundaries wander a little with the radius so locks curve and taper irregularly
      const deg = (th * 180) / Math.PI - (o.phase || 0);
      const k0 = Math.floor(deg / st);
      const wob = ((hh(k0, 11) % 7) - 3) * 0.06 * Math.sin(r / 9 + k0);
      const u = deg / st + wob, k = Math.floor(u), fr = u - k;
      const lit = Math.sin(th) - Math.cos(th) >= 0;
      const q = lit ? fr : 1 - fr;
      const w = st * (Math.PI / 180) * r;
      const seam = r > r0 && w > 4 && q * w < 1.1;
      if (r > r0 && w > 4) {
        if (seam) v = 1;
        else if (q * w < 2.3) v = 2;
        else if ((1 - q) * w < 2.4 && hh(k, 7) % 3 !== 0) v = 4;
        else if (hh(k, 3) % 4 === 0 && q < 0.5) v = 2; // an occasional lock turned away from the light
      }
      if (o.h0 != null && r >= o.h0 && r < o.h1 && dx < (o.hx == null ? 6 : o.hx) && !seam) {
        v = r >= o.h0 + 1.5 && r < o.h1 - 1.5 && (1 - q) * w > 1.2 && q * w > 2.3 ? 5 : 4;
      }
      const eB = !inM(x, y + 1), eB2 = !inM(x, y + 2), eR = !inM(x + 1, y), eL = !inM(x - 1, y), eT = !inM(x, y - 1);
      if (eB) v = Math.min(v, 1);
      else if (eB2) v = Math.min(v, 2);
      else if (eR && dx > 6) v = Math.min(v, 2);
      else if ((eL || eT) && dx < -6 && dy < 30 && v === 3) v = 4;
      b.px(x, y, R[v - 1]);
    });
  }
  // Curls: shaded discs laid bottom-up so upper curls overlap lower ones.
  function curls(b, m, R) {
    const cells = [];
    for (let y = -2, row = 0; y < S + 4; y += 6, row++) for (let x = -2 + (row % 2) * 4; x < S + 4; x += 8) cells.push([x + (hh(x, y) % 3) - 1, y + (hh(y, x) % 3) - 1]);
    cells.sort((a, c) => c[1] - a[1]);
    for (const [cx, cy] of cells) {
      for (let y = cy - 6; y <= cy + 6; y++) for (let x = cx - 6; x <= cx + 6; x++) {
        if (!m.alphaAt(x, y)) continue;
        const dx = x - cx, dy = y - cy, d2 = dx * dx + dy * dy;
        if (d2 > 26) continue;
        const t = dx * 0.7 + dy;
        let v = t < -3 ? 4 : t < 1 ? 3 : t < 3.5 ? 2 : 1;
        if (d2 < 3 && t < -0.5) v = 4;
        if (v === 4 && y < 26 && x < 50 && d2 < 8) v = 5;
        b.px(x, y, R[v - 1]);
      }
    }
  }
  // Wound cloth: broad bands rising to the right, lit along their upper edges.
  function folds(b, m, R) {
    m.each((x, y) => {
      const u = (y + x * 0.28 + 60) / 7, fr = u - Math.floor(u);
      let v = fr < 0.18 ? 2 : fr > 0.72 ? 4 : 3;
      if (!m.alphaAt(x, y + 1) || !m.alphaAt(x, y + 2)) v = 2;
      if (x > 64 && v > 2) v -= 1;
      if (x < 32 && v === 3) v = 4;
      b.px(x, y, R[v - 1]);
    });
  }
  function castShadow(b, face, hair, K) {
    face.each((x, y) => {
      if (hair.alphaAt(x, y)) return;
      for (let k = 1; k <= 3; k++) if (hair.alphaAt(x - 1, y - k)) { b.px(x, y, K[1]); return; }
    });
  }

  // ---- shapes ---------------------------------------------------------------------------------------
  const BANGS = [22, 28, 74, 28, 74, 38, 71, 41, 68, 36, 65, 43, 61, 37, 57, 44, 53, 36, 49, 42, 45, 36, 42, 43, 38, 37, 34, 44, 30, 36, 27, 42, 24, 38, 22, 40];
  const BLUNT = [22, 28, 74, 28, 74, 40, 66, 40, 64, 38, 62, 40, 50, 40, 48, 38, 46, 40, 34, 40, 32, 38, 30, 40, 22, 40];
  const SPIKY_BANGS = [22, 28, 74, 28, 74, 40, 70, 36, 66, 46, 60, 36, 55, 45, 50, 34, 45, 45, 40, 34, 34, 46, 30, 36, 26, 44, 22, 38];
  const PARTED_L = [22, 26, 44, 18, 42, 28, 36, 34, 30, 40, 26, 48, 22, 46];
  const PARTED_R = [44, 18, 74, 26, 74, 44, 70, 48, 66, 38, 58, 32, 50, 28];
  const SIDE_L = [21, 30, 29, 30, 30, 46, 27, 54, 24, 50, 21, 40];
  const cap = (m, top) => { m.oval(21, top == null ? 8 : top, 74, 62, W); for (let y = 36; y < S; y++) for (let x = 0; x < S; x++) m.clear(x, y); };
  const fringe = (m, p, pts) => { if (p.parted) { m.poly(PARTED_L, W); m.poly(PARTED_R, W); } else m.poly(pts || BANGS, W); };
  const sides = (m) => { m.poly(SIDE_L, W); m.poly(mirror(SIDE_L), W); };
  const wavy = (x0, x1, y0, y1, amp, ph) => {
    const pts = [];
    for (let y = y0; y <= y1; y += 2) pts.push(x0 + Math.round(Math.sin(y / 6 + ph) * amp), y);
    for (let y = y1; y >= y0; y -= 2) pts.push(x1 + Math.round(Math.sin(y / 6 + ph + 0.6) * amp), y);
    return pts;
  };
  const BACK_MASS = (m) => m.oval(21, 9, 74, 60, W);

  function front(fn, o) {
    return (b, ctx, face) => {
      const { p, C } = ctx;
      const m = mask((mm) => fn(mm, p));
      castShadow(b, face, m, C.sk);
      locks(b, m, C.hair, Object.assign({ ox: 48, oy: 5, h0: 13, h1: 18, hx: 8, r0: 19 }, o));
    };
  }
  function back(fn, o) {
    return (b, ctx) => {
      const { p, C } = ctx;
      const m = mask((mm) => fn(mm, p));
      const R = C.hair.map((c) => shade(c, -1));
      R[4] = C.hair[3];
      locks(b, m, R, Object.assign({ ox: 48, oy: 6, open: true }, o));
    };
  }
  const tie = (b, C, x, y, w, h) => { b.rect(x, y, w, h, C.ac[1]); b.rect(x, y, w, 1, C.ac[2]); b.rect(x, y + h - 1, w, 1, C.ac[0]); };

  const shortFront = (m, p) => { cap(m); fringe(m, p); sides(m); };
  const H = {};
  H.short = { back: back(BACK_MASS), front: front(shortFront) };
  H.bob = {
    back: back((m) => { m.oval(15, 7, 80, 60, W); m.rect(15, 34, 66, 36, W); m.oval(15, 58, 32, 76, W); m.oval(63, 58, 80, 76, W); }),
    front: front((m, p) => { cap(m); fringe(m, p, BLUNT); const L = [16, 30, 30, 30, 32, 56, 30, 70, 24, 74, 18, 68, 15, 50]; m.poly(L, W); m.poly(mirror(L), W); }),
  };
  H.long = {
    back: back((m) => m.poly([13, 36, 18, 12, 48, 3, 78, 12, 83, 36, 86, 96, 10, 96], W)),
    front: front((m, p) => { cap(m); fringe(m, p); const L = [20, 30, 30, 30, 31, 60, 29, 80, 27, 96, 18, 96, 20, 70, 18, 48]; m.poly(L, W); m.poly(mirror(L), W); }),
  };
  H.wavy = {
    back: back((m) => { m.oval(14, 3, 81, 50, W); m.poly(wavy(11, 84, 30, 96, 3, 0), W); }),
    front: front((m, p) => { cap(m); fringe(m, p); m.poly(wavy(19, 30, 30, 96, 3, 0), W); m.poly(wavy(66, 77, 30, 96, 3, 1.5), W); }),
  };
  H.ponytail = {
    back: back((m) => { BACK_MASS(m); m.oval(64, 20, 88, 56, W); m.poly([68, 50, 86, 50, 82, 70, 78, 80, 72, 66], W); }, { ox: 70, oy: 18 }),
    front: front((m, p) => { shortFront(m, p); m.rect(66, 22, 9, 14, W); }),
  };
  const ptFront = H.ponytail.front;
  H.ponytail.front = (b, ctx, face) => { ptFront(b, ctx, face); tie(b, ctx.C, 67, 20, 8, 5); };
  H.bun = {
    back: back(BACK_MASS),
    front: (b, ctx, face) => {
      const { p, C } = ctx;
      const m = mask((mm) => { cap(mm, 11); fringe(mm, p); sides(mm); });
      castShadow(b, face, m, C.sk);
      locks(b, m, C.hair, { ox: 48, oy: 8, h0: 11, h1: 16, hx: 8, r0: 17 });
      const bun = mask((mm) => mm.oval(35, -3, 60, 17, W));
      locks(b, bun, C.hair, { ox: 44, oy: 3, step: 32, r0: 3, h0: 3, h1: 7, hx: 4 });
      b.line(37, 15, 58, 15, C.hair[0]);
      if (p.pins) {
        b.line(56, 3, 70, -1, '#e0c070', 2); b.px(70, 0, '#fff0a8'); b.rect(69, 2, 1, 4, '#c8a050'); b.rect(68, 6, 3, 2, '#c85a6a');
        b.line(28, 10, 40, 6, '#e0c070', 2); b.px(28, 10, '#fff0a8');
      }
    },
  };
  H.braid = {
    back: back(BACK_MASS),
    front: (b, ctx, face) => {
      front(shortFront)(b, ctx, face);
      const R = ctx.C.hair;
      for (let i = 0; i < 6; i++) {
        const x = 66 + Math.round(i * 0.9) + (i % 2), y = 50 + i * 7;
        const seg = mask((mm) => mm.oval(x, y, x + 8, y + 8, W));
        seg.each((xx, yy) => { const t = (xx - x - 4) * 0.8 + (yy - y - 4); b.px(xx, yy, R[t < -3 ? 3 : t < 2 ? 2 : t < 5 ? 1 : 0]); });
      }
      tie(b, ctx.C, 70, 91, 8, 3);
    },
  };
  H.twintails = {
    back: (b, ctx) => {
      back(BACK_MASS)(b, ctx);
      const TL = [18, 32, 26, 32, 25, 50, 20, 70, 14, 90, 6, 86, 8, 62, 12, 44];
      back((m) => m.poly(TL, W), { ox: 20, oy: 28, step: 25, r0: 3 })(b, ctx);
      back((m) => m.poly(mirror(TL), W), { ox: 76, oy: 28, step: 25, r0: 3 })(b, ctx);
    },
    front: (b, ctx, face) => { front(shortFront)(b, ctx, face); tie(b, ctx.C, 17, 28, 7, 7); tie(b, ctx.C, 72, 28, 7, 7); },
  };
  H.curly = {
    back: (b, ctx) => { const m = mask((mm) => { mm.oval(10, 0, 85, 78, W); }); curls(b, m, ctx.C.hair.map((c) => shade(c, -1))); },
    front: (b, ctx, face) => {
      const m = mask((mm) => { mm.oval(14, 0, 81, 58, W); for (let y = 34; y < S; y++) for (let x = 24; x < 72; x++) mm.clear(x, y); for (let y = 28; y < 34; y++) for (let x = 28; x < 68; x++) if ((x >> 2) % 2 && y > 30) mm.clear(x, y); mm.oval(14, 30, 28, 64, W); mm.oval(67, 30, 81, 64, W); });
      castShadow(b, face, m, ctx.C.sk);
      curls(b, m, ctx.C.hair);
    },
  };
  H.spiky = {
    back: back(BACK_MASS),
    front: front((m, p) => {
      cap(m);
      for (const t of [[24, 22, 26, 2, 36, 16], [34, 14, 40, -3, 47, 12], [46, 12, 54, -4, 58, 12], [56, 14, 66, 0, 68, 18], [66, 18, 78, 6, 75, 26], [23, 36, 11, 26, 24, 26], [72, 36, 85, 28, 72, 26]]) m.poly(t, W);
      m.poly(SPIKY_BANGS, W); sides(m);
    }, { step: 18 }),
  };
  H.shaved = {
    front: (b, ctx, face) => {
      const { C } = ctx;
      const R = C.hair.map((c) => mix(c, C.sk[2], 0.45));
      const m = mask((mm) => { mm.oval(25, 12, 70, 56, W); for (let y = 31; y < S; y++) for (let x = 29; x < 67; x++) mm.clear(x, y); for (let y = 45; y < S; y++) for (let x = 0; x < S; x++) mm.clear(x, y); });
      m.each((x, y) => {
        let v = 2;
        const dx = x - 40, dy = y - 16;
        if (dx * dx + dy * dy < 60 && y < 22) v = 3;
        if (x > 60 || !m.alphaAt(x, y + 1)) v = 1;
        if ((!m.alphaAt(x, y + 2) || !m.alphaAt(x, y + 3)) && (x + y) % 2) v = 1; // dithered hairline
        b.px(x, y, R[v]);
      });
    },
  };
  H.wrap = {
    back: back(BACK_MASS),
    front: (b, ctx, face) => {
      const { p, C } = ctx;
      const hm = mask((mm) => sides(mm));
      locks(b, hm, C.hair, { ox: 48, oy: 5 });
      const c = p.wrapCol || C.ac[1];
      const R = [shade(c, -2), shade(c, -1), c, shade(c, 1), shade(c, 2)];
      const m = mask((mm) => { mm.oval(19, 5, 76, 48, W); for (let y = 34; y < S; y++) for (let x = 0; x < S; x++) mm.clear(x, y); mm.rect(19, 28, 58, 6, W); });
      castShadow(b, face, m, C.sk);
      folds(b, m, R);
      b.rect(19, 31, 58, 1, R[3]); b.rect(19, 33, 58, 1, R[1]);
      const knot = mask((mm) => { mm.oval(64, 6, 78, 18, W); mm.poly([72, 16, 82, 30, 76, 32, 68, 18], W); });
      knot.each((x, y) => b.px(x, y, R[!knot.alphaAt(x + 1, y) || !knot.alphaAt(x, y + 1) ? 1 : x < 70 && y < 12 ? 4 : 3]));
    },
  };
  H.bald = { front: (b, ctx) => { b.oval(34, 16, 44, 22, P.alpha('#ffffff', 0.25)); } };

  RB.portraits.hairStyles = H;
})();
