/* Creatures B — foxes: the Snow Fox (sb.fox, family 'sb_snowfox') and the Name-borrowing Fox
 * (atlas.fox, family 'fox').
 *
 * A grounded animal with a skeleton: a haunch and a chest joined by the body, two front legs
 * (shoulder → elbow → paw, the elbow solved from where the paw is planted), a hind foot under
 * the haunch, a head on the neck (tilt, ears up or laid back, eyes, an opening mouth) and a
 * great tail built from a chain of segments (base angle, curl, length). Its poses are real
 * re-drawings of that skeleton — sitting, crouched with its weight on the haunch, stretched in
 * a leap with the forelegs reaching and the tail streaming, landing on its forepaws, lying down
 * with its head on its paws — so the paws stay on the ground line when it stands, the weight
 * moves from haunch to forepaws, and a recoil pushes it back on its haunch, never sliding.
 *
 * Snow Fox: white, frost-tipped, a breath that smokes in the cold. Strike: it crouches, springs
 * at its one target (travel), bites, and lands back on its forepaws. Chill: it rears, draws in
 * breath and blows frost at its target. The Name-borrowing Fox: a warm fox wearing someone
 * else's name as a scarf (a paper strip with a vermilion seal whose ends trail behind it). Its
 * Sweep is a whirl: it spins its tail round in a wide arc trailing foxfire across the party.
 * Its false promise: it sits up tall with a leaf on its head and sends a pale double of itself
 * — the borrowed face — to its target. */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const CB = RB.creaturesB, K = RB.pxkit, E = CB.E;
  const mixh = (a, b, k) => K.hex(K.mix(a, b, k));
  const GROUND = 84;

  // two-bone limb: from S to P with bone lengths a, b, bending to one side (bend ±1)
  function knee(S, P, a, b, bend) {
    const dx = P[0] - S[0], dy = P[1] - S[1];
    const d = Math.max(1, Math.min(Math.hypot(dx, dy), a + b - 0.5));
    const ang = Math.atan2(dy, dx);
    const cosA = (a * a + d * d - b * b) / (2 * a * d);
    const A = Math.acos(Math.max(-1, Math.min(1, cosA)));
    const k = ang + bend * A;
    return [S[0] + Math.cos(k) * a, S[1] + Math.sin(k) * a];
  }
  // the tail as a chain: base (x, y), first direction ta, curl tc per link, length tl
  function tailPts(q) {
    const n = 8, seg = (q.tl || 104) / n, out = [[q.tx, q.ty]];
    let a = q.ta, x = q.tx, y = q.ty;
    for (let i = 0; i < n; i++) {
      a += (q.tc || 0) * (i === 0 ? 0.5 : 1) + (q.tw2 || 0) * Math.sin(i * 0.9 + (q.tph || 0));
      x += Math.cos(a) * seg; y += Math.sin(a) * seg;
      out.push([x, y]);
    }
    return out;
  }
  function drawFox(L, o, q, H, snow) {
    const col = o.col || (snow ? '#eef4fa' : '#e8eef4');
    const M = K.mat(col, { n: 6, at: 3, step: snow ? 0.075 : 0.085, shift: 1.2 });
    const Mfar = K.mat(K.tone(col, -1.2), { n: 5, at: 2, step: 0.08, shift: 1.2 });
    const ruff = K.mat(mixh(col, '#ffffff', 0.5), { n: 5, at: 3, step: 0.065 });
    const inner = K.mat(mixh(col, '#b86a70', 0.5), { n: 3, at: 1, step: 0.08 });
    const mark = K.mat(snow ? '#7a9ac8' : '#c85a4a', { n: 3, at: 1, line: false });
    const eyeM = K.mat(snow ? '#4a7ab0' : '#3a5a8a', { n: 3, at: 1, line: false });
    const nose = K.mat('#2a2030', { n: 2, at: 0, line: false });
    const mouthM = K.mat('#4a2028', { n: 2, at: 0, line: false });
    const tongue = K.mat('#d8707a', { n: 3, at: 1, line: false });
    const frost = K.solid('#dff0ff', { line: false });
    const back = L.like(), tailL = L.like(), B = L.like(), front = L.like(), fx = L.like();
    const bodyM = M;
    // ---- far legs (in shade), behind the body
    const S2 = [q.sx2, q.sy2], P2 = [q.px2, q.py2], K2 = knee(S2, P2, 17, 23, q.kb2 == null ? -1 : q.kb2);
    back.path([[S2[0], S2[1], 9], [K2[0], K2[1], 7], [P2[0], P2[1] - 3, 6]], 7, Mfar, (x, y) => K.clamp(0.42 - (y - S2[1]) / 120, 0, 0.99));
    back.ell(P2[0] - 1, P2[1] - 2, 6, 3.5, Mfar, 1);
    // ---- the tail (behind, unless it is swung round in front)
    const tp = tailPts(q);
    const TL = q.tfront ? front : tailL;
    const n = tp.length;
    const tw = q.tw || 26;
    TL.path(tp.map(([x, y], i) => [x, y, Math.max(5, tw * (1 - Math.pow(i / (n - 1), 1.6) * 0.75))]), tw, M, (x, y) => K.clamp(0.52 - (x - q.tx) / 160 - (y - q.ty) / 140, 0, 0.99));
    TL.path(tp.slice(n - 3).map(([x, y], i) => [x, y, Math.max(4, tw * 0.42 - i * 2)]), 10, ruff, (x, y) => K.clamp(0.75 - (y - q.ty) / 200, 0, 0.99));
    // fur tufts along the tail's outer edge
    for (let i = 2; i < n - 1; i += 2) {
      const [x0, y0] = tp[i], [x1, y1] = tp[i + 1], a = Math.atan2(y1 - y0, x1 - x0) - Math.PI / 2, w = tw * (1 - Math.pow(i / (n - 1), 1.6) * 0.75) / 2 - 1;
      const bx = x0 + Math.cos(a) * w, by = y0 + Math.sin(a) * w, ta = Math.atan2(y1 - y0, x1 - x0);
      TL.poly([[bx, by], [bx + Math.cos(ta) * 5 + Math.cos(a) * 3, by + Math.sin(ta) * 5 + Math.sin(a) * 3], [bx + Math.cos(ta) * 6, by + Math.sin(ta) * 6]], M, 3);
    }
    // foxfire along the tail (the whirl)
    if (q.fire > 0.05) {
      const ff = K.mat('#9ae0e8', { n: 3, at: 1, step: 0.1, alpha: 200, line: false });
      const ff2 = K.solid('#f0ffff', { line: false });
      for (let i = 3; i < n; i += 2) { const [x, y] = tp[i], r = 3 + q.fire * 4 * (i / n); fx.ell(x, y - r, r, r * 1.6, ff, 1); fx.ell(x, y - r * 0.8, r * 0.4, r * 0.8, ff2, 0); }
    }
    // ---- haunch, body, chest
    B.path([[q.hx, q.hy, q.bw || 40], [q.cx, q.cy, (q.bw || 40) * 0.72]], q.bw || 40, bodyM, (x, y) => K.sphere(q.cx - 6, q.cy - 12, 46, 44, { amb: 0.2 })(x, y));
    B.ell(q.hx, q.hy, q.hrx || 30, q.hry || 28, bodyM, K.sphere(q.hx - 8, q.hy - 10, (q.hrx || 30) + 8, (q.hry || 28) + 10, { amb: 0.18 }));
    // fur tufts on the haunch's back
    for (let i = 0; i < 3; i++) { const a = -0.9 + i * 0.55, rx = (q.hrx || 30), ry = (q.hry || 28); const bx = q.hx + Math.cos(a) * rx, by = q.hy + Math.sin(a) * ry; B.poly([[bx - 2, by - 2], [bx + 6, by - 1 + i], [bx, by + 4]], bodyM, 2); }
    // the near hind foot under the haunch (planted)
    const hf = [q.kx, q.ky];
    const hk = [q.hx + (q.hkx == null ? 14 : q.hkx), q.hy + (q.hky == null ? 14 : q.hky)];
    B.path([[hk[0], hk[1], 9], [hf[0] + 2, hf[1] - 6, 7]], 8, bodyM, (x, y) => K.clamp(0.48 - (y - hk[1]) / 80, 0, 0.99));
    B.ell(hf[0], hf[1] - 3, 9, 4, bodyM, K.sphere(hf[0] - 2, hf[1] - 5, 9, 5));
    for (const dx of [-3, 1, 5]) B.dot(hf[0] + dx, hf[1] - 1, bodyM, 1);
    // chest ruff with a jagged lower edge
    const crx = 17, cry = 18;
    B.ell(q.cx, q.cy, crx, cry, ruff, K.sphere(q.cx - 4, q.cy - 6, crx + 2, cry + 2, { amb: 0.32 }));
    for (let x = -15; x < 13; x += 5) B.poly([[q.cx + x, q.cy + cry - 6], [q.cx + x + 5, q.cy + cry - 6], [q.cx + x + 2, q.cy + cry + 1]], ruff, 2);
    // ---- the near front leg
    const S1 = [q.sx1, q.sy1], P1 = [q.px1, q.py1], K1 = knee(S1, P1, 17, 23, q.kb1 == null ? -1 : q.kb1);
    front.path([[S1[0], S1[1], 10], [K1[0], K1[1], 8], [P1[0], P1[1] - 3, 7]], 8, bodyM, (x, y) => K.clamp(0.62 - (x - S1[0]) / 60 - (y - S1[1]) / 140, 0, 0.99));
    front.ell(P1[0], P1[1] - 2, 7, 4, bodyM, K.sphere(P1[0] - 2, P1[1] - 4, 7, 5));
    for (const dx of [-3, 0, 3]) front.dot(P1[0] + dx, P1[1], bodyM, 1);
    // ---- the head (tilted about its centre)
    const hx = q.hdx, hy = q.hdy, ear = q.ear || 0, turn = q.turn || 0;
    const head = L.like();
    head.save().translate(hx, hy).rotate(q.ht || 0);
    for (const s of [-1, 1]) {
      const tipX = s * 23 + (s > 0 ? 10 : 12) * s * ear * 0.9, tipY = -26 + ear * 18 + (s < 0 ? -turn * 2 : turn * 2);
      const far = s > 0 && turn > 0.3;
      head.poly([[s * 7, -14], [tipX, tipY - 16 * (1 - ear * 0.5)], [s * 25, -10 + ear * 4]], far ? Mfar : bodyM, s < 0 ? 3 : 2);
      head.poly([[s * 11, -14], [tipX * 0.86, (tipY - 16 * (1 - ear * 0.5)) * 0.82 - 2], [s * 21, -12 + ear * 4]], inner, 1);
    }
    head.ell(0, 0, 23, 18, bodyM, K.sphere(-4, -6, 26, 22, { amb: 0.22 }));
    for (const s of [-1, 1]) head.poly([[s * 18, 2], [s * 30, 12], [s * 16, 14]], bodyM, s < 0 ? 3 : 1);
    head.ell(turn * -3, 11, 11, 8, ruff, K.sphere(-2 + turn * -3, 8, 12, 9, { amb: 0.35 }));
    head.restore();
    head.outline();
    head.onto((b) => {
      b.save().translate(hx, hy).rotate(q.ht || 0);
      const fx0 = turn * -3;
      // nose and mouth
      b.rect(fx0 - 2, 7, 5, 3, nose, 1); b.dot(fx0 - 1, 7, H.white, 0);
      const mo = q.mouth || 0;
      if (mo > 0.3) {
        const h = Math.round(2 + mo * 4);
        b.poly([[fx0 - 6, 12], [fx0 + 6, 12], [fx0 + 4, 12 + h], [fx0 - 4, 12 + h]], mouthM, 0);
        b.rect(fx0 - 2, 12 + h - 2, 4, 2, tongue, 1);
        for (const s of [-1, 1]) b.dot(fx0 + s * 4, 13, H.white, 0); // fangs
      } else { b.line(fx0, 10, fx0, 13, nose, 1); b.line(fx0, 13, fx0 - 3, 14, nose, 1); b.line(fx0, 13, fx0 + 3, 14, nose, 1); }
      // eyes and the marks above them
      const eyes = q.eyes || 'open';
      for (const s of [-1, 1]) {
        const ex = s * 9 + fx0;
        if (eyes === 'shut') b.line(ex - 3, -1, ex + 3, 0, nose, 0);
        else if (eyes === 'narrow') { b.poly([[s * 5 + fx0, -3], [s * 13 + fx0, -4], [s * 12 + fx0, -1], [s * 6 + fx0, 0]], eyeM, 1); b.rect(ex - 1, -3, 2, 2, nose, 0); }
        else if (eyes === 'fierce') { b.poly([[s * 5 + fx0, -2], [s * 13 + fx0, -6], [s * 12 + fx0, 0], [s * 6 + fx0, 1]], eyeM, 1); b.rect(ex - 1, -3, 2, 3, nose, 0); b.dot(ex, -4, H.white, 0); }
        else if (eyes === 'wide') { b.ell(ex, -3, 4, 4, eyeM, 1); b.rect(ex - 1, -4, 2, 3, nose, 0); b.dot(ex - 1, -5, H.white, 0); }
        else { b.poly([[s * 5 + fx0, -4], [s * 13 + fx0, -5], [s * 12 + fx0, 0], [s * 6 + fx0, 0]], eyeM, 1); b.rect(ex - 1, -4, 2, 4, nose, 0); b.dot(ex - (s < 0 ? 1 : 0), -4, H.white, 0); }
        b.poly([[s * 6 + fx0, -10], [s * 12 + fx0, -14], [s * 10 + fx0, -9]], mark, 1);
      }
      b.restore();
    });
    // frost on the snow fox's fur tips (ears, cheeks)
    if (snow) {
      head.save().translate(hx, hy).rotate(q.ht || 0);
      for (const [x, y] of [[-20, -30], [22, -30], [-27, 9], [28, 10]]) head.dot(x, y + Math.round(ear * 10), frost, 0);
      head.restore();
    }
    // ---- the borrowed name, worn as a scarf (the Name-borrowing Fox)
    if (o.scarf || (!snow && String(col).toLowerCase() === '#e8d0a0')) {
      const sc = K.mat('#efe4c8', { n: 4, at: 2, step: 0.07, lineCol: '#4a3a30' });
      const seal = K.solid('#c8503a', { line: false });
      const ink = K.solid('#3a2c28', { line: false });
      const nx = (hx + q.cx) / 2, ny = (hy + q.cy) / 2 + 4;
      const a0 = Math.atan2(q.cy - hy, q.cx - hx) + Math.PI / 2;
      const ca = Math.cos(a0), sa = Math.sin(a0);
      front.poly([[nx - ca * 18 - sa * 4, ny - sa * 18 + ca * 4], [nx + ca * 18 - sa * 4, ny + sa * 18 + ca * 4], [nx + ca * 18 + sa * 4, ny + sa * 18 - ca * 4], [nx - ca * 18 + sa * 4, ny - sa * 18 - ca * 4]], sc, 2);
      // the two ends trail behind (right), fluttering
      const fl = q.sfl == null ? 0 : q.sfl, ph = q.sph || 0;
      for (let k = 0; k < 2; k++) {
        const x0 = nx + 12, y0 = ny + 2 + k * 3;
        const pts = [];
        for (let i = 0; i <= 4; i++) pts.push([x0 + i * (6 + fl * 2), y0 + i * (3 - fl * 2) + Math.sin(ph + i * 1.1 + k) * (1 + i * 0.6)]);
        back.path(pts.map(([x, y]) => [x, y, 5]), 5, sc, 2);
        back.rect(Math.round(pts[4][0]) - 1, Math.round(pts[4][1]) - 2, 3, 3, seal, 0);
        back.line(Math.round(pts[1][0]), Math.round(pts[1][1]), Math.round(pts[3][0]), Math.round(pts[3][1]), ink, 0);
      }
      for (let i = 0; i < 4; i++) front.dot(Math.round(nx - ca * 12 + ca * i * 7), Math.round(ny - sa * 12 + sa * i * 7), ink, 0);
      front.rect(Math.round(nx + ca * 12) - 1, Math.round(ny + sa * 12) - 1, 3, 3, seal, 0);
    }
    // a leaf on its head (the fox's trick)
    if (q.leaf > 0.05) {
      const lf = K.mat('#6a9a48', { n: 4, at: 2, step: 0.1 });
      head.save().translate(hx, hy - 20 - Math.round(q.leaf * 2)).rotate(-0.5 + (q.ht || 0));
      head.ell(0, 0, 7, 4, lf, (x, y) => K.clamp(0.7 - (x + y) / 20, 0, 0.99));
      head.line(-7, 0, 7, 0, lf, 1); head.line(7, 0, 10, 2, lf, 1);
      head.restore();
    }
    back.outline(); tailL.outline(); B.outline(); front.outline();
    // the snow fox's breath smoking in the cold (idle) or a draw of frost (q.breath)
    if (snow || q.breath > 0) {
      const puff = K.mat('#e2f0ff', { n: 3, at: 1, step: 0.06, alpha: 160, line: false });
      const b0 = q.breath || 0;
      const mx = hx + Math.round(Math.sin(-(q.ht || 0)) * 14) - 4, my = hy + 14;
      for (let i = 0; i < 2 + Math.round(b0 * 3); i++) {
        const k = (((q.bph || 0) / 4) + i * (b0 > 0 ? 0.25 : 0.5)) % 1;
        fx.ell(mx - 6 - k * (22 + b0 * 20), my - k * 6, 3 + k * 6 + b0 * 3, 2 + k * 4 + b0 * 2, puff, (x, y) => K.clamp(0.9 - k * 0.6 - (y - my) / 30, 0, 0.99));
      }
    }
    return back.over(tailL).over(B).over(front).over(head).over(fx);
  }

  // ---- key poses (the skeleton) -------------------------------------------------------------------
  // SIT matches the old sitting fox; every other key is a re-drawing of the same skeleton.
  const SIT = {
    hx: 10, hy: 58, hrx: 30, hry: 28, cx: -2, cy: 36, bw: 40,
    sx1: -10, sy1: 46, px1: -9, py1: GROUND, kb1: -1, sx2: 6, sy2: 46, px2: 8, py2: GROUND, kb2: -1,
    kx: 28, ky: GROUND, hkx: 14, hky: 14,
    hdx: -2, hdy: 4, ht: 0, ear: 0, turn: 0.3, eyes: 'open', mouth: 0,
    tx: 26, ty: 66, ta: -0.25, tc: -0.42, tl: 104, tw: 26, tw2: 0, tph: 0, tfront: false,
    fire: 0, leaf: 0, breath: 0, bph: 0, sfl: 0, sph: 0,
  };
  const CROUCH = Object.assign({}, SIT, {
    hx: 16, hy: 66, hrx: 32, hry: 21, cx: -14, cy: 54, bw: 36,
    sx1: -22, sy1: 60, px1: -28, py1: GROUND, kb1: 1, sx2: -8, sy2: 60, px2: -14, py2: GROUND, kb2: 1,
    kx: 34, ky: GROUND, hkx: 12, hky: 10,
    hdx: -26, hdy: 40, ht: -0.12, ear: 0.8, eyes: 'fierce', turn: 0.6,
    tx: 34, ty: 70, ta: -0.75, tc: -0.06, tl: 86, tw: 24,
  });
  const LEAP = Object.assign({}, SIT, {
    hx: 22, hy: 38, hrx: 23, hry: 18, cx: -30, cy: 30, bw: 34,
    sx1: -38, sy1: 36, px1: -76, py1: 42, kb1: 1, sx2: -26, sy2: 36, px2: -66, py2: 50, kb2: 1,
    kx: 56, ky: 58, hkx: 14, hky: 6,
    hdx: -52, hdy: 16, ht: -0.25, ear: 1, eyes: 'fierce', mouth: 1, turn: 0.8,
    tx: 40, ty: 34, ta: -0.6, tc: 0.15, tl: 84, tw: 21, tw2: 0.05,
  });
  const BITE = Object.assign({}, LEAP, { px1: -78, py1: 52, px2: -70, py2: 60, hdx: -58, hdy: 22, ht: -0.1, mouth: 1.2, eyes: 'fierce', ta: -0.45, tc: 0.12 });
  const LAND = Object.assign({}, CROUCH, {
    hx: 18, hy: 58, hrx: 28, hry: 24, cx: -18, cy: 46,
    sx1: -26, sy1: 52, px1: -34, py1: GROUND, kb1: 1, sx2: -12, sy2: 52, px2: -20, py2: GROUND, kb2: 1,
    hdx: -30, hdy: 30, ht: -0.08, ear: 0.6, eyes: 'open', mouth: 0.2, tx: 34, ty: 64, ta: -0.7, tc: -0.25, tl: 92,
  });
  const REAR = Object.assign({}, SIT, { cy: 30, sy1: 42, sy2: 42, hdx: 4, hdy: -6, ht: 0.32, ear: 0.2, eyes: 'shut', mouth: 0.4, bw: 42, ta: -0.4, tc: -0.48 });
  const BLOW = Object.assign({}, SIT, { cx: -8, cy: 38, sx1: -16, sy1: 48, sx2: 0, sy2: 48, px1: -18, hdx: -16, hdy: 14, ht: -0.3, ear: 0.6, eyes: 'narrow', mouth: 1.5, turn: 0.7, ta: -0.15, tc: -0.3 });
  const WHIRL1 = Object.assign({}, SIT, { hx: 6, cx: 4, hdx: 10, hdy: 6, ht: 0.2, turn: -0.4, ear: 0.3, eyes: 'narrow', ta: -1.2, tc: -0.25, tl: 110, tx: 24, ty: 60 });
  const WHIRL2 = Object.assign({}, SIT, { hx: 4, cx: -4, hdx: -8, hdy: 4, ht: 0, turn: 0.2, ear: 0.6, eyes: 'narrow', ta: -2.5, tc: -0.12, tl: 112, tx: 6, ty: 52, tfront: true, fire: 1 });
  const WHIRL3 = Object.assign({}, SIT, { hx: 8, cx: -10, hdx: -14, hdy: 6, ht: -0.15, turn: 0.6, ear: 0.4, eyes: 'narrow', ta: 2.85, tc: 0.1, tl: 112, tx: -6, ty: 62, tfront: true, fire: 1 });
  const SLY = Object.assign({}, SIT, { cy: 32, sy1: 42, sy2: 44, px1: -2, py1: 50, kb1: 1, hdx: 0, hdy: 0, ht: 0.22, ear: 0.1, eyes: 'narrow', turn: 0.1, leaf: 1, ta: -0.35, tc: -0.5 });
  const LIE = Object.assign({}, SIT, {
    hx: 22, hy: 70, hrx: 30, hry: 16, cx: -18, cy: 70, bw: 26,
    sx1: -26, sy1: 72, px1: -48, py1: GROUND, kb1: 1, sx2: -14, sy2: 74, px2: -40, py2: GROUND - 2, kb2: 1,
    kx: 40, ky: GROUND, hkx: 10, hky: 6,
    hdx: -40, hdy: 66, ht: 0.12, ear: 0.4, eyes: 'shut', turn: 0.5,
    tx: 40, ty: 70, ta: 2.95 - Math.PI * 2, tc: 0.16, tl: 88, tw: 22, tfront: true,
  });

  const foxIdle = [];
  for (let f = 0; f < 8; f++) {
    const a = (f / 8) * Math.PI * 2;
    foxIdle.push(Object.assign({}, SIT, {
      ta: -0.25 + Math.sin(a) * 0.08, tc: -0.42 + Math.sin(a + 0.8) * 0.05, tph: a,          // the tail sways from its root
      cy: 36 + (f % 4 === 2 ? 1 : 0), hdy: 4 + (f % 4 === 2 ? 1 : 0),                          // a breath
      ear: f === 5 ? 0.25 : 0, ht: f >= 6 ? 0.06 : 0,                                         // an ear flick, a glance
      eyes: f === 3 ? 'shut' : 'open', bph: f, sph: a,
    }));
  }
  const fk = (from, ...st) => CB.keys(Object.assign({}, SIT, from), ...st);
  const foxActs = {
    // Strike: crouch (weight back on the haunch), spring, bite, land on the forepaws, sit back up
    'prep:strike': fk({}, [CROUCH, 2, E.out], [Object.assign({}, CROUCH, { hy: 68, hry: 19, cy: 56, hdy: 43 }), 2, E.io]),
    'exec:strike': fk(CROUCH, [LEAP, 2, E.out], [BITE, 1, E.lin], [Object.assign({}, BITE, { mouth: 0.4, ht: 0, hdy: 24 }), 1, E.lin]),
    'recover:strike': fk(BITE, [LAND, 2, E.in], [Object.assign({}, LAND, { hy: 60, cy: 44, hdy: 26, eyes: 'open', mouth: 0 }), 1, E.out], [SIT, 3, E.io]),
    // Chill: it rears and draws in breath, then thrusts its head down and blows frost
    'prep:chill': fk({}, [REAR, 3, E.io], [Object.assign({}, REAR, { cy: 28, hdy: -8, bw: 44 }), 1, E.lin]),
    'exec:chill': fk(REAR, [BLOW, 1, E.in], [Object.assign({}, BLOW, { breath: 1, bph: 1 }), 1, E.lin], [Object.assign({}, BLOW, { breath: 1, bph: 2 }), 1, E.lin], [Object.assign({}, BLOW, { breath: 1, bph: 3 }), 1, E.lin]),
    'recover:chill': fk(Object.assign({}, BLOW, { breath: 0.6 }), [Object.assign({}, SIT, { breath: 0.2, ear: 0.2 }), 3, E.io], [SIT, 1, E.out]),
    // Sweep (the whirl): it spins its tail round in a wide arc trailing foxfire across the party
    'prep:sweep': fk({}, [Object.assign({}, CROUCH, { eyes: 'narrow', ear: 0.4, ta: -0.8, tc: -0.3 }), 2, E.out], [WHIRL1, 2, E.io]),
    'exec:sweep': fk(WHIRL1, [Object.assign({}, WHIRL2, { fire: 0.6 }), 1, E.in], [WHIRL2, 1, E.lin], [WHIRL3, 1, E.lin], [Object.assign({}, WHIRL3, { ta: 3.0, fire: 0.6 }), 1, E.out]),
    'recover:sweep': fk(Object.assign({}, WHIRL3, { ta: 3.0, fire: 0.6 }), [Object.assign({}, SIT, { ta: 0.3 + Math.PI * 2, tc: -0.2, tl: 96, fire: 0.2, tfront: false }), 2, E.io], [Object.assign({}, SIT, { ta: -0.4 + Math.PI * 2, tc: -0.5 }), 2, E.io], [Object.assign({}, SIT, { ta: SIT.ta + Math.PI * 2 }), 1, E.out]),
    // the false promise (the trick): it sits up tall, a leaf on its head, eyes narrowed; the
    // borrowed face goes out to its target; it drops back down with a grin
    'prep:lie': fk({}, [Object.assign({}, SLY, { leaf: 0.6 }), 2, E.out], [SLY, 2, E.io]),
    'exec:lie': fk(SLY, [Object.assign({}, SLY, { px1: -12, py1: 46, ht: 0.3, mouth: 0.4 }), 2, E.io], [Object.assign({}, SLY, { px1: -16, py1: 50, ht: 0.1, eyes: 'narrow', mouth: 0.6 }), 2, E.io]),
    'recover:lie': fk(Object.assign({}, SLY, { px1: -16, py1: 50, mouth: 0.6 }), [Object.assign({}, SIT, { leaf: 0.3, eyes: 'narrow' }), 2, E.io], [SIT, 2, E.out]),
    // reactions: knocked back onto its haunch (the forepaws stay planted, the head snaps back)
    recoil: fk({}, [Object.assign({}, SIT, { hx: 16, hy: 60, cx: 6, cy: 38, sx1: -2, sx2: 12, hdx: 8, hdy: 6, ht: 0.3, ear: 1, eyes: 'shut', ta: -0.5, tc: -0.3 }), 1, E.out], [Object.assign({}, SIT, { hx: 12, cx: 2, hdx: 2, ht: 0.12, ear: 0.6, eyes: 'wide' }), 1, E.io], [Object.assign({}, SIT, { ear: 0.3 }), 1, E.io], [SIT, 1, E.out]),
    release: fk({}, [Object.assign({}, SIT, { ear: 0.5, eyes: 'shut', ht: -0.1, hdy: 6 }), 1, E.out], [Object.assign({}, SIT, { ear: 0.3, eyes: 'shut', ht: 0.08, tph: 1.5, tw2: 0.06 }), 1, E.io], [Object.assign({}, SIT, { ear: 0.1, eyes: 'open', tph: 3 }), 1, E.io], [SIT, 1, E.out]),
    balk: fk(CROUCH, [Object.assign({}, CROUCH, { hy: 62, cy: 46, hdx: -18, hdy: 30, ht: 0.25, ear: 1, eyes: 'wide', mouth: 0.3 }), 1, E.out], [Object.assign({}, SIT, { hx: 14, cx: 2, hdx: 4, ht: 0.18, ear: 0.7, eyes: 'wide' }), 1, E.io], [Object.assign({}, SIT, { ear: 0.3 }), 1, E.io], [SIT, 1, E.out]),
    settle: fk({}, [Object.assign({}, SIT, { ear: 0.4, eyes: 'shut' }), 1, E.out], [Object.assign({}, LIE, { eyes: 'shut', hdy: 60 }), 2, E.io], [LIE, 1, E.out]),
    rest: fk({}, [Object.assign({}, SIT, { ear: 0.3, eyes: 'shut', hdy: 8, ht: -0.08 }), 1, E.io], [Object.assign({}, SIT, { ear: 0.4, eyes: 'shut', hdy: 10, ht: -0.12, mouth: 0.8 }), 1, E.io], [Object.assign({}, SIT, { ear: 0.3, eyes: 'shut', hdy: 8, ht: -0.08 }), 1, E.io], [Object.assign({}, SIT, { ear: 0.1, eyes: 'narrow' }), 1, E.io]),
  };
  const foxSpec = (snow) => ({
    w: 272, h: 204, ox: 136, oy: 104, ms: 160,
    base: SIT, idle: foxIdle, acts: foxActs,
    keys: { strike: ['exec:strike', 2], chill: ['exec:chill', 2], sweep: ['exec:sweep', 2], lie: ['exec:lie', 2] },
    alias: { prep: 'prep:strike' },
    draw: (L, o, q, H) => drawFox(L, o, q, H, snow),
  });
  CB.rig('fox', foxSpec(false));
  CB.rig('sb_snowfox', foxSpec(true));
  // the mouth (art px), for effects: the head centre plus the muzzle, at a pose
  const mouthOf = (q) => [Math.round(q.hdx - 4 + Math.sin(-(q.ht || 0)) * 12), Math.round(q.hdy + 13)];

  for (const fam of ['fox', 'sb_snowfox']) {
    CB.deliver(fam, ['strike'], (a) => {
      const blk = CB.blocked(a), peak = blk ? 0.42 : 0.62;
      return CB.play(a, {
        key: 'key:strike', contact: 620, end: 1260,
        parts: [
          { at: 0, act: 'prep:strike', d: 300 },
          { at: 300, act: 'exec:strike', d: 340, travel: { to: a.aimed, peak, arc: 22, shape: 'out' } },
          blk ? { at: 640, act: 'balk', d: 300, travel: { to: a.aimed, peak, shape: 'back' } } : null,
          { at: blk ? 940 : 640, act: 'recover:strike', d: blk ? 320 : 620, travel: blk ? null : { to: a.aimed, peak, arc: 8, shape: 'back' } },
        ].filter(Boolean),
        fx: [{ at: 600, name: 'cbBite', d: 360, p: { to: a.aimed, short: blk } }],
      });
    });
    CB.deliver(fam, ['chill'], (a) => {
      const m = mouthOf(foxActs['exec:chill'][1]);
      return CB.play(a, {
        key: 'key:chill', contact: 700, end: 1300,
        parts: [{ at: 0, act: 'prep:chill', d: 360 }, { at: 360, act: 'exec:chill', d: 400, travel: { to: a.aimed, peak: 0.08, arc: 0, shape: 'outback' } }, { at: 760, act: 'recover:chill', d: 540 }],
        fx: [{ at: 400, name: 'cbFrostBreath', d: 620, p: { dx: m[0], dy: m[1], to: a.aimed } }],
      });
    });
    CB.deliver(fam, ['sweep'], (a) => CB.play(a, {
      key: 'key:sweep', contact: 720, end: 1420,
      parts: [{ at: 0, act: 'prep:sweep', d: 340 }, { at: 340, act: 'exec:sweep', d: 440, travel: { to: 'party', peak: 0.16, arc: 6, shape: 'outback' } }, { at: 780, act: 'recover:sweep', d: 640 }],
      fx: [{ at: 480, name: 'cbFoxfire', d: 800, p: { dx: 10, dy: 20, who: CB.targets(a) } }],
    }));
    CB.deliver(fam, ['lie'], (a) => CB.play(a, {
      key: 'key:lie', contact: 760, end: 1340,
      parts: [{ at: 0, act: 'prep:lie', d: 320 }, { at: 320, act: 'exec:lie', d: 460 }, { at: 780, act: 'recover:lie', d: 560 }],
      fx: [{ at: 360, name: 'cbDouble', d: 620, p: { dx: -10, dy: 20, to: a.aimed } }],
    }));
    CB.deliver(fam, ['*'], (a) => CB.play(a, {
      key: 'key:strike', contact: 620, end: 1200,
      parts: [{ at: 0, act: 'prep:strike', d: 300 }, { at: 300, act: 'recover:strike', d: 900 }],
    }));
  }

  CB.family('fox', { anatomy: 'grounded animal (skeleton): haunch, chest, two-bone forelegs with planted paws, hind foot, head with ears and mouth, a segmented tail; the borrowed name worn as a scarf with trailing ends', palette: 'fur from artOpts.col #e8d0a0 (6 steps), ruff and tail tip mixed to white, inner ear #b86a70 mix, blue eyes #3a5a8a, vermilion marks #c85a4a, paper scarf #efe4c8 with a #c8503a seal' });
  CB.family('sb_snowfox', { anatomy: 'grounded animal (the fox skeleton): sits, crouches, springs, bites, lands on its forepaws; breath that smokes in the cold', palette: 'white fur #eef4fa (6 steps, blue-grey shadows), frost tips #dff0ff, blue marks #7a9ac8, eyes #4a7ab0, breath #e2f0ff' });
})();
