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
  const CB = RB.creaturesB, K = RB.pxkit, E = CB.E, S = CB.S;
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
  // ---- palettes: hand-picked ramps, shadows leaning violet-blue, lights leaning warm ---------------
  // fur: 6 tones (deep occlusion, core shadow, shadow, lit, light, warm highlight); ruff: the pale
  // chest, cheek and tail-tip fur; far: the far legs and ear (in shade); rim: the cool back light
  const PAL = {
    snow: {
      fur: ['#353f8c', '#5c6cb8', '#97a9e2', '#d2ddf7', '#f4f7ff', '#fffbe4'], bias: 0.2,
      far: ['#28306e', '#3e4a94', '#5d6eb8', '#8597d4', '#aebde8'],
      ruff: ['#55619e', '#91a2d8', '#cdd9f5', '#f3f6ff', '#fffbe6'],
      ear: ['#5a2c6e', '#8e4a90', '#c27ab0', '#eaaccc'],
      mark: ['#18306e', '#2f5cb6', '#5c98e6'],
      eye: ['#0e2458', '#2058ac', '#4aa0ec', '#b4ecff'],
      tip: ['#5a68b0', '#a2b4e6', '#e4eefc', '#ffffff'],
      sock: null, rim: '#a4e0ff', frost: ['#8ccff4', '#d8f6ff', '#ffffff'],
    },
    warm: {
      fur: ['#3c142e', '#782a30', '#b44e2c', '#e2843a', '#f5b65c', '#ffe6a2'], bias: 0.02,
      far: ['#2a0e26', '#4e1a2c', '#7c302c', '#a8502c', '#c87034'],
      ruff: ['#62467a', '#a690b4', '#ddd0d6', '#f8f0e4', '#fffcf2'],
      ear: ['#4a1830', '#7a2a3c', '#b0585c', '#e09488'],
      mark: ['#6e1020', '#bc2c26', '#f0663c'],
      eye: ['#10204a', '#244a8a', '#4686c8', '#a8dcf6'],
      tip: ['#62467a', '#a690b4', '#e8dde0', '#fffcf2'],
      sock: ['#1c0a1e', '#36162a', '#58262e', '#7e3c36'], rim: '#8ab8f4', frost: null,
    },
  };
  function palFor(o, snow) {
    if (snow) return PAL.snow;
    const col = String(o.col || '#e8d0a0').toLowerCase();
    if (col === '#e8d0a0') return PAL.warm;
    // any other coat colour: ramps made from it with the same shape
    return Object.assign({}, PAL.warm, { fur: S.ramp(col, { n: 6, at: 3 }), far: S.ramp(K.tone(col, -1.5), { n: 5, at: 3 }) });
  }
  // fur on a rounded form: the key light quantised into the fur ramp, its band edges broken into
  // pointed strand clusters running along `ang` (the way the fur lies)
  const furSh = (cx, cy, rx, ry, ang, seed, bias, n) => S.sph(cx, cy, rx, ry, n || 6, { bias, jit: S.strands(ang, { w: 5, len: 12, amp: 0.14, seed }) });
  function drawFox(L, o, q, H, snow) {
    const P = palFor(o, snow), bias = P.bias;
    const furM = S.mat(P.fur, { at: 3, rim: P.rim, litk: 0.16 });
    const farM = S.mat(P.far, { at: 3, litk: 0.12 });
    const ruffM = S.mat(P.ruff, { at: 3, rim: P.rim, litk: 0.16 });
    const earM = S.mat(P.ear, { at: 2, line: false });
    const markM = S.mat(P.mark, { at: 1, line: false });
    const eyeM = S.mat(P.eye, { at: 2, line: false });
    const tipM = S.mat(P.tip, { at: 2, rim: P.rim, litk: 0.16 });
    const sockM = P.sock ? S.mat(P.sock, { at: 2, litk: 0.12 }) : null;
    const sockFar = P.sock ? S.mat(P.sock.slice(0, 3), { at: 1, litk: 0.12 }) : null;
    const inkM = S.mat(['#0c081a', '#211a36', '#3c3256'], { at: 1, line: false });
    const mouthM = S.mat(['#22081a', '#46122a'], { at: 0, line: false });
    const tongueM = S.mat(['#962e52', '#d0586e', '#f4949e'], { at: 1, line: false });
    const whiteM = K.solid('#fffdf6', { line: false });
    const tailL = L.like(), farL = L.like(), body = L.like(), tailF = L.like(), headB = L.like(), head = L.like(), fire = L.like(), fx = L.like();
    // stretched out (a leap, a bite, lying down), haunch, barrel and chest are one form with one outline
    const stretched = Math.hypot(q.hx - q.cx, q.hy - q.cy) > 40;
    const haunch = stretched ? body : L.like(), chest = stretched ? body : L.like(), nearL = L.like();
    // ---- the tail: a chain of fur segments, full in the middle and pointed at the tip; each
    // segment shaded across its width in hard bands whose edges break into strand clusters that
    // run along it (the banding of the reference's tail, in fur)
    const tp = tailPts(q), n = tp.length, tw = q.tw || 26;
    const TL = q.tfront ? tailF : tailL;
    const wAt = (i) => { const k = i / (n - 1); return Math.max(3, tw * (0.58 + 0.62 * Math.sin(Math.PI * Math.min(1, k * 0.95 + 0.08)) - 0.55 * Math.pow(k, 2.2))); };
    for (let i = 1; i < n; i++) {
      const [x0, y0] = tp[i - 1], [x1, y1] = tp[i];
      const ang = Math.atan2(y1 - y0, x1 - x0), w0 = wAt(i - 1), w1 = wAt(i);
      const tipPart = i === n - 1;
      const M = tipPart ? tipM : furM, nn = tipPart ? 4 : 6;
      const sh = S.cyl((x0 + x1) / 2, (y0 + y1) / 2, ang, Math.max(w0, w1) / 2, nn, tipPart ? [[-1, 3], [-0.3, 2], [0.45, 1]] : [[-1, 4], [-0.7, 5], [-0.45, 4], [0.05, 3], [0.42, 2], [0.75, 1]], { jit: S.strands(ang, { w: 4, len: 10, amp: 0.24, seed: 11 + i }) });
      if (tipPart) {
        // the tip: tapered to a point a little past the last link
        const px = -Math.sin(ang), py = Math.cos(ang), r0 = w0 / 2, ex = x1 + Math.cos(ang) * 4, ey = y1 + Math.sin(ang) * 4;
        TL.poly([[x0 + px * r0, y0 + py * r0], [x0 + Math.cos(ang) * 6 + px * r0 * 0.9, y0 + Math.sin(ang) * 6 + py * r0 * 0.9], [ex, ey], [x0 + Math.cos(ang) * 6 - px * r0 * 0.9, y0 + Math.sin(ang) * 6 - py * r0 * 0.9], [x0 - px * r0, y0 - py * r0]], M, sh);
      } else {
        TL.seg(x0, y0, x1, y1, (w0 + w1) / 2, M, sh);
        TL.ell(x1, y1, w1 / 2, w1 / 2, M, sh);
      }
    }
    // the tail's edges break into tufts that sweep toward the tip
    for (let i = 1; i < n - 1; i++) {
      const [x0, y0] = tp[i], [x1, y1] = tp[i + 1], a = Math.atan2(y1 - y0, x1 - x0);
      for (const s of [-1, 1]) {
        const r = wAt(i) / 2 - 1.5, bx = x0 + Math.cos(a + s * Math.PI / 2) * r, by = y0 + Math.sin(a + s * Math.PI / 2) * r;
        const lit = Math.cos(a + s * Math.PI / 2) * S.LK[0] + Math.sin(a + s * Math.PI / 2) * S.LK[1] > 0;
        S.tuft(TL, bx, by, a + s * 0.45, 7 + (i % 2) * 3, 4, i >= n - 2 ? tipM : furM, i >= n - 2 ? (lit ? 3 : 1) : lit ? 4 : 2, 0);
      }
    }
    // frost caught on the snow fox's tail tip
    if (P.frost) { const [x, y] = tp[n - 1], [xa, ya] = tp[n - 2]; const fr = S.mat(P.frost, { at: 1, line: false }); const mx = Math.round((x + xa) / 2), my = Math.round((y + ya) / 2); TL.dot(mx - 1, my - 1, fr, 2); TL.dot(mx + 2, my + 1, fr, 1); TL.dot(mx, my + 2, fr, 2); }
    // foxfire along the tail (the whirl): little flames lit from inside
    if (q.fire > 0.05) {
      const ff = S.mat(['#0e5a84', '#1e94b4', '#4cd0d8', '#b4fbf0', '#ffffff'], { at: 2, line: '#0a2a4a', alpha: 235 });
      for (let i = 3; i < n; i += 2) {
        const [x, y] = tp[i], r = Math.round(2 + q.fire * 3 * (i / n)), lean = ((i * 5) % 3) - 1;
        // a teardrop: a round foot and a tongue that leans and splits at its tip
        fire.ell(x, y - r, r, r, ff, (xx, yy) => S.step(Math.hypot(xx - x + 0.5, yy - y + r * 0.8) < r * 0.55 ? 3 : xx < x ? 2 : 1, 5));
        fire.poly([[x - r, y - r], [x + lean - r * 0.3, y - r * 2.6], [x + lean + 1, y - r * 3.4], [x + r * 0.6, y - r * 2], [x + r, y - r]], ff, (xx, yy) => S.step(yy > y - r * 1.8 && Math.abs(xx - x) < r * 0.4 ? 4 : xx < x + lean * 0.5 ? 2 : 1, 5));
      }
    }
    // ---- the far foreleg (in shade, a step back, behind the chest)
    const S1 = [q.sx1, q.sy1], P1 = [q.px1, q.py1], K1 = knee(S1, P1, 17, 23, q.kb1 == null ? -1 : q.kb1);
    limb(farL, S1, K1, P1, 8, 6, farM, sockFar, true);
    paw(farL, P1[0], P1[1], 6, sockFar || farM, snow, true);
    // ---- the body barrel between haunch and chest (its underside in shade)
    const bw = q.bw || 40;
    // (stretched out, haunch, barrel and chest share one light: a long body, not three balls)
    const span = Math.hypot(q.hx - q.cx, q.hy - q.cy) / 2 + 14;
    const one = stretched ? furSh((q.hx + q.cx) / 2 - 8, (q.hy + q.cy) / 2 - 10, span + 8, bw * 0.75, 2.9, 5, bias) : null;
    const arch = stretched ? 5 : 0, mx = (q.hx + q.cx) / 2, my = (q.hy + q.cy) / 2 - 2 - arch;
    body.path([[q.hx, q.hy - 2, bw], [mx, my, bw * 0.92], [q.cx, q.cy, bw * 0.8]], bw, furM, one || furSh((q.hx + q.cx) / 2 - 8, (q.hy + q.cy) / 2 - 10, bw, bw * 0.8, 1.95, 5, bias - 0.08));
    // ---- the near haunch (thigh) with its hind paw planted
    const hrx = q.hrx || 30, hry = q.hry || 28;
    const hk = [q.hx + (q.hkx == null ? 14 : q.hkx), q.hy + (q.hky == null ? 14 : q.hky)], hf = [q.kx, q.ky];
    haunch.path([[hk[0], hk[1], 11], [hf[0] + 1, hf[1] - 5, 8]], 9, furM, S.cyl((hk[0] + hf[0]) / 2, (hk[1] + hf[1]) / 2, Math.atan2(hf[1] - hk[1], hf[0] - hk[0]), 5, 6, [[-1, 4], [-0.4, 3], [0.3, 2]]));
    paw(haunch, hf[0], hf[1], 9, sockM || furM, snow);
    haunch.ell(q.hx, q.hy, hrx, hry, furM, one || furSh(q.hx - 5, q.hy - 8, hrx + 6, hry + 6, 1.75, 7, bias + 0.04));
    // fur tufts breaking the haunch's back and lower edge, and the fold where it meets the belly
    for (let i = 0; i < 5; i++) {
      const a = -1.3 + i * 0.42, bx = q.hx + Math.cos(a) * (hrx - 3), by = q.hy + Math.sin(a) * (hry - 3);
      S.tuft(haunch, bx, by, a + 0.9, 8, 5, furM, i < 2 ? 4 : 2, 1);
    }
    for (let i = 0; i < 3; i++) S.tuft(haunch, q.hx - hrx * 0.7 + i * 2, q.hy - hry * 0.1 + i * 6, 1.25, 7, 4, furM, 2, 0);
    // ---- the chest ruff: pale fur pushed forward, its lower edge and front in points
    const crx = 15, cry = 19;
    chest.ell(q.cx, q.cy, crx, cry, ruffM, stretched ? furSh(q.cx - 4, q.cy - 10, crx + 6, cry + 2, 1.62, 9, bias + 0.06, 5) : furSh(q.cx - 4, q.cy - 8, crx + 4, cry + 4, 1.62, 9, bias + 0.06, 5));
    for (let x = -crx + 2; x < crx - 2; x += 4) S.tuft(chest, q.cx + x + 2, q.cy + cry - 6 - Math.abs(x) * 0.25, 1.5 + x * 0.025, 9, 5, ruffM, x < -2 ? 3 : 2, 0);
    for (let i = 0; i < 3; i++) S.tuft(chest, q.cx - crx + 3, q.cy - 7 + i * 7, 2.55 + i * 0.18, 7, 5, ruffM, 3, 0);
    // ---- the near foreleg (in front)
    const S2 = [q.sx2, q.sy2], P2 = [q.px2, q.py2], K2 = knee(S2, P2, 17, 23, q.kb2 == null ? -1 : q.kb2);
    limb(nearL, S2, K2, P2, 10, 7, furM, sockM, false);
    paw(nearL, P2[0], P2[1], 7, sockM || furM, snow);
    // ---- the head (three-quarter, facing left: the muzzle forward, the near ear behind)
    drawHead(headB, head, q, { furM, farM, ruffM, earM, markM, eyeM, inkM, mouthM, tongueM, whiteM, sockM, P, snow, bias });
    // ---- the borrowed name, worn as a paper scarf (the Name-borrowing Fox)
    if (o.scarf || (!snow && String(o.col || '').toLowerCase() === '#e8d0a0')) scarf(chest, tailL, q);
    // a leaf on its head (the fox's trick)
    if (q.leaf > 0.05) {
      const lf = S.mat(['#1e3a22', '#2e6a32', '#56a03e', '#9ad25a', '#e0f49a'], { at: 2 });
      const leaf = L.like();
      leaf.save().translate(q.hdx + 4, q.hdy - 21 - Math.round(q.leaf * 2)).rotate(-0.45 + (q.ht || 0));
      leaf.poly([[-9, 0], [-4, -4], [4, -4], [9, 0], [4, 3], [-4, 3]], lf, (x, y) => S.step(y < -1 ? (x < 2 ? 4 : 3) : x < -2 ? 2 : 1, 5));
      leaf.line(-8, 0, 8, 0, lf, 1); leaf.line(8, 0, 11, 2, lf, 0);
      leaf.restore();
      leaf.outline();
      head.over(leaf);
    }
    // ---- clusters, coloured outlines, cast shadows from near parts onto far ones, the rim light
    const uniq = (a) => a.filter((x, i) => a.indexOf(x) === i);
    for (const X of uniq([tailL, tailF, body, haunch, chest, nearL, head])) for (const M of [furM, ruffM]) S.clean(X, M);
    for (const X of uniq([tailL, farL, body, haunch, chest, nearL, tailF, headB, head, fire])) X.outline();
    S.cast(body, tailL, 2, 3, 1);
    if (!stretched) { S.cast(haunch, tailL, 2, 3, 1); S.cast(chest, haunch, 2, 2, 1); S.cast(chest, body, 2, 2, 1); }
    for (const X of uniq([chest, haunch])) S.cast(nearL, X, 2, 2, 1);
    S.cast(head, chest, 2, 4, 2); if (!stretched) { S.cast(head, body, 2, 4, 1); S.cast(head, haunch, 2, 4, 1); } S.cast(head, nearL, 2, 4, 1);
    if (q.tfront) { for (const X of uniq([haunch, chest, nearL])) S.cast(tailF, X, 2, 3, 1); }
    let out = tailL.over(farL).over(body);
    if (!stretched) out = out.over(haunch).over(chest);
    out = out.over(nearL).over(tailF).over(headB).over(head);
    S.rim(out, { w: 2 });
    // the snow fox's breath smoking in the cold (idle) or a draw of frost (q.breath)
    if (snow || q.breath > 0) {
      const puff = S.mat(['#a8bcec', '#d8e6fa', '#fbfdff'], { at: 1, alpha: 225, line: '#7486c4' });
      const b0 = q.breath || 0, m = mouthOf(q), pf = L.like();
      for (let i = 0; i < 2 + Math.round(b0 * 3); i++) {
        const k = (((q.bph || 0) / 4) + i * (b0 > 0 ? 0.25 : 0.5)) % 1;
        const x = m[0] - 5 - k * (22 + b0 * 20), y = m[1] - 2 - k * 7, rx = 2 + k * 6 + b0 * 3, ry = 2 + k * 3 + b0 * 2;
        pf.ell(x, y, rx, ry, puff, (xx, yy) => S.step(yy < y - ry * 0.2 && xx < x + rx * 0.2 ? 2 : yy > y + ry * 0.45 ? 0 : 1, 3));
      }
      pf.outline();
      fx.over(pf);
    }
    return out.over(fire).over(fx);
  }
  // a two-bone leg: each bone a fur cylinder lit on its left (hard bands, strand-broken edges);
  // the lower leg in its sock material when the coat has one; a tuft at the back of the elbow
  function limb(Lr, Sh, Kn, Pw, w0, w1, M, sock, far) {
    const top = M.n - 2;
    const bands = far ? [[-1, 3], [-0.35, 2], [0.4, 1]] : [[-1, top], [-0.6, top + 1], [-0.35, top], [0.12, top - 1], [0.62, top - 2]];
    const a1 = Math.atan2(Kn[1] - Sh[1], Kn[0] - Sh[0]), a2 = Math.atan2(Pw[1] - Kn[1], Pw[0] - Kn[0]);
    Lr.seg(Sh[0], Sh[1], Kn[0], Kn[1], w0, M, S.cyl((Sh[0] + Kn[0]) / 2, (Sh[1] + Kn[1]) / 2, a1, w0 / 2, M.n, bands, { jit: S.strands(a1, { w: 3, len: 7, amp: 0.3, seed: far ? 3 : 4 }) }));
    const lowM = sock || M, ln = lowM.n;
    const lb = sock ? [[-1, ln - 2], [-0.2, ln - 3], [0.5, Math.max(0, ln - 4)]] : bands;
    Lr.seg(Kn[0], Kn[1], Pw[0], Pw[1] - 3, w1, lowM, S.cyl((Kn[0] + Pw[0]) / 2, (Kn[1] + Pw[1]) / 2, a2, w1 / 2, ln, lb));
    if (sock) Lr.seg(Kn[0], Kn[1], Kn[0] + (Pw[0] - Kn[0]) * 0.25, Kn[1] + (Pw[1] - Kn[1]) * 0.25, w1 + 1, M, S.cyl(Kn[0], Kn[1], a2, w1 / 2, M.n, bands));
    S.tuft(Lr, Kn[0] + 2, Kn[1] - 2, a2 + 2.0, 6, 4, M, far ? 1 : top - 1, 0);
    S.tuft(Lr, Sh[0] + 3, Sh[1] + 4, a1 + 0.5, 7, 4, M, far ? 2 : top, 0);
  }
  // a planted paw: a flattened pad with toe splits and claw tips
  function paw(Lr, x, y, r, M, snow, far) {
    const n = M.n;
    Lr.ell(x - 1, y - 2, r, Math.max(3, r * 0.55), M, (xx, yy) => S.step(yy < y - 3 && xx < x + 1 ? n - (far ? 2 : 1) : xx > x + r * 0.35 ? n - 4 : n - 3, n));
    for (let k = -1; k <= 1; k++) Lr.line(x - 1 + k * 3, y - 2, x - 1 + k * 3, y - 1, M, 0);
    const claw = K.solid(snow ? '#e8f0ff' : '#f4e8d0', { line: false });
    if (!far) for (let k = -1; k <= 1; k++) Lr.dot(x - 2 + k * 3, y, claw, 0);
  }
  // the head in its own frame (translate hdx, hdy; rotate ht): the far ear peeking past the brow,
  // the near ear (its inner face toward us), cranium, cheek ruff, the muzzle with a lit bridge and a
  // pale underside, an opening jaw, eyes (the near one large, the far one foreshortened), marks, nose
  function drawHead(back, Hd, q, m) {
    const { furM, farM, ruffM, earM, markM, eyeM, inkM, mouthM, tongueM, whiteM } = m;
    const ear = q.ear || 0, mo = q.mouth || 0, eyes = q.eyes || 'open';
    const tf = (Lr) => Lr.save().translate(q.hdx, q.hdy).rotate(q.ht || 0);
    tf(back);
    {
      const tip = [-15 + ear * 16, -35 + ear * 15];
      back.poly([[-15, -9], [-4, -15], tip], farM, (x, y) => S.step((x < tip[0] + 3 && y < -20 ? 3 : 2) + (m.snow ? 1 : 0), 5));
      back.poly([[-12, -12], [-6, -14], [tip[0] + 1, tip[1] + 7]], earM, 0);
    }
    back.restore();
    tf(Hd);
    {
      const tip = [12 + ear * 20, -40 + ear * 18];
      Hd.poly([[0, -12], [20, -7], tip], furM, (x, y) => S.step(x - tip[0] < -3 + (y - tip[1]) * 0.12 ? 4 : x > 13 ? 2 : 3, 6));
      Hd.poly([[5, -12], [16, -10], [tip[0] - 1, tip[1] + 7]], earM, (x, y) => S.step(y < tip[1] + 13 ? 1 : x < 10 ? 3 : 2, 4));
      for (let i = 0; i < 3; i++) S.tuft(Hd, 7 + i * 3, -10, -1.45 - i * 0.12, 7, 3, ruffM, 4 - i, 0);
      if (m.sockM) Hd.poly([[tip[0] - 3, tip[1] + 8], [tip[0] + 3, tip[1] + 7], tip], m.sockM, 1);
    }
    // cranium (and the brow over the far eye)
    Hd.ell(2, -2, 19, 16, furM, furSh(-4, -9, 22, 20, -0.35, 21, m.bias + 0.05));
    // cheek ruff on the near side: points sweeping back and down
    Hd.ell(7, 8, 12, 8, ruffM, furSh(1, 2, 15, 12, 0.7, 23, m.bias + 0.08, 5));
    for (let i = 0; i < 4; i++) S.tuft(Hd, 11 + i * 2, 5 + i * 3, 0.5 + i * 0.28, 10, 6, ruffM, i < 2 ? 3 : 1, 1);
    // the muzzle, forward and a little down: a lit bridge, a side plane, a pale underside
    const jaw = Math.round(mo * 5);
    Hd.poly([[-7, -8], [-29, 1], [-30, 5], [-9, 6], [-1, 2]], furM, (x, y) => S.step(y < -5 - (x + 7) * 0.41 ? 5 : y < 3 ? 4 : 3, 6));
    Hd.poly([[-28, 5], [-9, 6], [-1, 4], [3, 11], [-8, 13 + jaw], [-24, 9 + jaw]], ruffM, (x, y) => S.step(y > 9 + jaw * 0.8 ? 1 : x < -14 ? 3 : 2, 5));
    if (mo > 0.3) {
      Hd.poly([[-26, 6], [-8, 6], [-6, 9 + jaw], [-22, 8 + jaw]], mouthM, 0);
      Hd.rect(-19, 7 + jaw, 6, 2, tongueM, 1);
      for (const fx0 of [-23, -11]) { Hd.dot(fx0, 7, whiteM, 0); Hd.dot(fx0, 8, whiteM, 0); }
    } else { Hd.line(-26, 6, -10, 7, inkM, 1); Hd.line(-10, 7, -7, 6, inkM, 1); }
    // nose
    Hd.rect(-31, 0, 4, 4, inkM, 1); Hd.dot(-30, 0, inkM, 2); Hd.dot(-31, 1, whiteM, 0);
    // eyes: the near one large and slanted, the far one foreshortened beside the bridge
    const eye = (ex, ey, w, far) => {
      if (eyes === 'shut') { Hd.line(ex - w, ey, ex + w - 1, ey - 1, inkM, 0); Hd.line(ex - w + 1, ey + 1, ex + w - 2, ey, furM, 2); return; }
      const hgt = eyes === 'narrow' ? 2 : eyes === 'wide' ? 5 : 4, fierce = eyes === 'fierce';
      Hd.poly([[ex - w, ey + 1], [ex - w + 2, ey - hgt + 1 + (fierce ? 1 : 0)], [ex + w - 1, ey - hgt - (fierce ? 1 : 0)], [ex + w + 1, ey - 1], [ex + 1, ey + 1]], inkM, 0);
      if (far) { Hd.dot(ex - 1, ey - 1, eyeM, 2); Hd.dot(ex, ey - 1, eyeM, 1); return; }
      Hd.poly([[ex - w + 1, ey], [ex - w + 2, ey - hgt + 2], [ex + w - 2, ey - hgt + 1], [ex + w - 1, ey - 1]], eyeM, (x, y) => S.step(y < ey - hgt + 2.5 ? 1 : x < ex - 1 ? 3 : 2, 4));
      Hd.rect(ex, ey - hgt + 1, 2, hgt, inkM, 0); Hd.dot(ex - 2, ey - hgt + 2, whiteM, 0);
    };
    eye(-1, -3, 6, false);
    eye(-13, -4, 3, true);
    // the marks above the eyes (brush strokes)
    Hd.poly([[-6, -10], [2, -13], [8, -11], [1, -9]], markM, (x) => S.step(x < 0 ? 2 : 1, 3));
    Hd.poly([[-16, -9], [-12, -11], [-10, -9]], markM, 1);
    if (m.P.frost) { const fr = S.mat(m.P.frost, { at: 1, line: false }); Hd.dot(13 + ear * 20, -37 + ear * 18, fr, 2); Hd.dot(12 + ear * 20, -35 + ear * 18, fr, 1); Hd.dot(21, 14, fr, 2); }
    Hd.restore();
  }
  // the paper scarf with the borrowed name: a band round the neck, its two ends trailing behind
  function scarf(front, back, q) {
    const sc = S.mat(['#5a3e48', '#a88a7e', '#dccab0', '#f4ead2', '#fffaee'], { at: 3 });
    const seal = S.mat(['#5a0e18', '#b02a24', '#e85a3a'], { at: 1, line: false });
    const ink = S.mat(['#2a1a24'], { at: 0, line: false });
    const nx = (q.hdx + q.cx) / 2 + 2, ny = (q.hdy + q.cy) / 2 + 5;
    const a0 = Math.atan2(q.cy - q.hdy, q.cx - q.hdx) + Math.PI / 2, ca = Math.cos(a0), sa = Math.sin(a0);
    const pts = [[nx - ca * 17 - sa * 4, ny - sa * 17 + ca * 4], [nx + ca * 17 - sa * 4, ny + sa * 17 + ca * 4], [nx + ca * 17 + sa * 4, ny + sa * 17 - ca * 4], [nx - ca * 17 + sa * 4, ny - sa * 17 - ca * 4]];
    // the band: a lit upper edge, a shadowed lower half, folds (creases) every few px as it wraps
    front.poly(pts, sc, (x, y) => { const v = (x - nx) * sa - (y - ny) * ca, u = (x - nx) * ca + (y - ny) * sa; const fold = ((Math.round(u) + 40) % 7) === 0; return S.step(fold ? 1 : v < -1.5 ? 4 : v < 0.5 ? 3 : u > 9 ? 1 : 2, 5); });
    // the borrowed name written on it: short ink strokes
    for (let i = 0; i < 4; i++) { const x = Math.round(nx - ca * 12 + ca * i * 5), y = Math.round(ny - sa * 12 + sa * i * 5); front.dot(x, y - 1, ink, 0); front.dot(x, y, ink, 0); if (i % 2) front.dot(x + 1, y, ink, 0); }
    front.rect(Math.round(nx + ca * 11) - 1, Math.round(ny + sa * 11) - 1, 3, 3, seal, 1);
    const fl = q.sfl == null ? 0 : q.sfl, ph = q.sph || 0;
    for (let k = 0; k < 2; k++) {
      const x0 = nx + 12, y0 = ny + 1 + k * 4, pp = [];
      for (let i = 0; i <= 4; i++) pp.push([x0 + i * (6 + fl * 2), y0 + i * (3 - fl * 2) + Math.sin(ph + i * 1.1 + k) * (1 + i * 0.6)]);
      back.path(pp.map(([x, y]) => [x, y, 5 - k]), 5, sc, () => S.step(k ? 1 : 2, 5));
      back.rect(Math.round(pp[4][0]) - 1, Math.round(pp[4][1]) - 2, 3, 3, seal, 1);
      back.line(Math.round(pp[1][0]), Math.round(pp[1][1]), Math.round(pp[3][0]), Math.round(pp[3][1]), ink, 0);
    }
  }

  // ---- key poses (the skeleton) -------------------------------------------------------------------
  // SIT: sitting three-quarter toward the party (left) — the chest and head forward and left, the
  // near haunch behind on the right, the far foreleg a step back on the left (leg 1), the near one
  // in front (leg 2); every other key is a re-drawing of the same skeleton.
  const SIT = {
    hx: 14, hy: 60, hrx: 27, hry: 25, cx: -8, cy: 38, bw: 38,
    sx1: -16, sy1: 46, px1: -18, py1: GROUND - 2, kb1: -1, sx2: -3, sy2: 48, px2: -3, py2: GROUND, kb2: -1,
    kx: 32, ky: GROUND, hkx: 12, hky: 14,
    hdx: -9, hdy: 2, ht: 0, ear: 0, turn: 0.3, eyes: 'open', mouth: 0,
    tx: 34, ty: 66, ta: -0.25, tc: -0.42, tl: 104, tw: 26, tw2: 0, tph: 0, tfront: false,
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
    hx: 20, hy: 38, hrx: 21, hry: 17, cx: -30, cy: 31, bw: 37,
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
  function mouthOf(q) { const a = q.ht || 0, c = Math.cos(a), s = Math.sin(a); return [Math.round(q.hdx - 28 * c - 7 * s), Math.round(q.hdy - 28 * s + 7 * c)]; }

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
