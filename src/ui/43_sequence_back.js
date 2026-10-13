/* A person seen from behind, close to us, for the illustrated scenes (AR-1; Robin, 2026-10-13: "The back-facing
 * sprites are also remarkably simple for what they're meant to convey"). It replaces a ball of hair on a trapezoid
 * cut flat across the floor: the back of the head in its own hair (locks from the crown, the hairline at the nape, the
 * style: a bun, a tail, a braid, twin tails, a bob or long hair, a head wrap), the ears, the collar at the nape (a
 * robe's, a coat's standing one, a tunic's), the shoulders and the shoulder blades, the arms apart from the back with
 * their sleeves and hands, the garment's back (an obi with its bow or knot, a belt, the apron's ties, a coat's half belt
 * and vent, a satchel's strap across the back), and the person continuing down past where the old drawing was cut, or
 * kneeling (the hips on the heels, the soles showing). Drawn with the pixel kit at the size asked for, lit from the side
 * the shot names. Nothing here writes game state; the caller caches.
 *
 *   RB.seqBack.draw(look, W, o) → { cv, ax, ay, w, h, head: { x, y, r }, shoulders: { l: [x, y], r: [x, y] } }
 *     W: the shoulders' width; o: { light: 'l' | 'r', pose: 'stand' | 'kneel', ext: rows below the anchor (× W),
 *     forward: 'l' | 'r' (that arm bent forward, holding something in front: seen to the elbow), raise: 'l' | 'r' (that
 *     arm raised: only its shoulder is drawn; the shot draws the arm from `shoulders`) }
 *     The anchor (ax, ay) is where the old drawing's bottom centre was, so a shot places it as before; w and h are that
 *     old drawing's size (W, 1.05 W); the canvas runs on below it. Points are in the canvas's pixels. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.seqBack = (function () {
  'use strict';
  const K = () => RB.pxkit;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, k) => a + (b - a) * k;
  const IVORY = '#ece4d4';

  function draw(lk, W, o) {
    lk = lk || {}; o = o || {};
    const p = K(), col = RB.sprites.colorsOf(lk), acc = lk.acc || [];
    const kind = lk.yukata || lk.shape === 'robe' ? 'robe' : lk.shape === 'coat' ? 'coat' : lk.shape === 'dress' ? 'dress' : lk.shape === 'apron' ? 'apron' : 'tunic';
    const kneel = o.pose === 'kneel';
    const lit = o.light === 'r' ? -1 : 1;                 // +1: the light from our left
    const H0 = Math.round(W * 1.05), ext = Math.round(W * (o.ext != null ? o.ext : kneel ? 0.58 : 1.25));
    const Wc = Math.round(W * 1.2), Hc = H0 + ext, cx = Wc / 2;
    const L = p.layer(Wc, Hc);
    const step = 0.075;
    const cloth = p.mat(col.cloth[0], { n: 7, at: 4, step }), clothD = p.mat(col.cloth[1] || col.cloth[0], { n: 6, at: 3, step });
    const accent = p.mat(col.cloth[2] || col.cloth[1], { n: 6, at: 3, step: 0.08 });
    const hair = p.mat(col.hair[0], { n: 7, at: 4, step: 0.08 });
    const skin = p.mat(col.skin[0], { n: 6, at: 3, step: 0.07 });
    const pants = p.mat(col.pants || col.cloth[1], { n: 6, at: 3, step });
    const boots = p.mat(col.boots || '#2e2420', { n: 5, at: 2, step: 0.08 });
    const ivory = p.mat(IVORY, { n: 5, at: 3, step: 0.06 });

    // ---- geometry (pixels from the canvas's top) -----------------------------------------------------------------
    const sh = H0 * 0.56;                                 // the shoulders' line, as before
    const hr = W * 0.16, hy = sh - H0 * 0.2, hx = cx;     // the head, as before (callers read it)
    const yNeck = sh - W * 0.02, yArm = sh + W * 0.17, yWaist = sh + W * 0.6, yHip = sh + W * 0.86;
    const yWrist = sh + W * 0.84, yHand = yWrist + W * 0.11, yElb = yWaist - W * 0.03;
    // half-widths: the shoulders round off from the neck; the arms hang outside the torso
    const neckHW = W * 0.085;
    // the shoulders slope from the neck (the trapezius) and round over the joint (narrower than the old drawing, which
    // read as a box); below it each arm is its own tapering shape, hanging a little apart from the waist so the back's
    // outline shows between them, the hand reaching the thigh
    const SH = W * 0.39;
    const armOut = (y) => (y < yElb ? lerp(SH, SH + W * 0.018, (y - yArm) / (yElb - yArm)) : lerp(SH + W * 0.018, SH - W * 0.02, clamp((y - yElb) / (yWrist - yElb), 0, 1)));
    const armW = (y) => (y < yElb ? lerp(W * 0.135, W * 0.1, clamp((y - yArm) / (yElb - yArm), 0, 1)) : lerp(W * 0.1, W * 0.08, clamp((y - yElb) / (yWrist - yElb), 0, 1)));
    const armIn = (y) => armOut(y) - armW(y);
    const outer = (y) => {
      if (y < yNeck) return 0;
      const k = clamp((y - yNeck) / (W * 0.17), 0, 1);
      const cap = neckHW + (SH - neckHW) * Math.sin(k * Math.PI / 2) * (0.55 + 0.45 * k);
      return y < yArm ? cap : armOut(y);
    };
    const torso = (y) => (y < yArm ? outer(y) : y < yWaist ? lerp(W * 0.3, W * 0.225, (y - yArm) / (yWaist - yArm)) : lerp(W * 0.225, W * 0.27, clamp((y - yWaist) / (yHip - yWaist), 0, 1)));
    // cloth shaded round the body: the lit side, the far side, the shoulder blades
    const shadeAt = (x, y, half, base) => {
      // round the body's sides only: over the shoulders the edge is the top, which faces the light
      const u = (x - cx) / Math.max(1, half, W * 0.3), side = y < yArm ? 0 : 1;
      let v = (base == null ? 0.6 : base) - lit * u * 0.24 - Math.pow(Math.abs(u), 6) * 0.3 * side - clamp((y - sh) / (Hc - sh), 0, 1) * 0.12 + (y < yArm ? 0.05 : 0);
      // the blades: a lighter mass each side of the spine, below the shoulders
      for (const s of [-1, 1]) { const bx = cx + s * W * 0.15, by = sh + W * 0.2, d = ((x - bx) / (W * 0.13)) ** 2 + ((y - by) / (W * 0.15)) ** 2; if (d < 1) v += 0.07 * (1 - d) * (s === -lit ? 1.3 : 0.7); }
      return clamp(v, 0.02, 0.999);
    };

    // ---- below the waist: trousers, a robe's or a coat's skirt, a dress; or kneeling --------------------------------
    const bottom = Hc - Math.round(W * 0.02);
    // the shadow on the ground under them (translucent: it darkens whatever floor the shot has drawn)
    const shadowM = p.mat(null, { cols: ['#10081866'], at: 0, line: false });
    L.ell(cx, bottom - W * 0.01, kneel ? W * 0.5 : W * 0.3, W * (kneel ? 0.05 : 0.04), shadowM, 0);
    if (kneel) {
      // sitting on the heels (seiza): below the waist the seat rounds out over the heels and the folded legs spread a
      // little on the floor each side, the garment over them; the soles show under the seat, toes turned in
      const yS = yWaist + W * 0.04;
      const half = (y) => { const k = clamp((y - yS) / (bottom - yS), 0, 1); return W * (0.25 + 0.06 * Math.sin(k * Math.PI * 0.62) + 0.06 * k * k); };
      const M = kind === 'tunic' || kind === 'apron' ? pants : cloth;
      const r0 = W * 0.09;
      const inK = (x, y) => { const d = Math.abs(x - cx), hb = half(y); if (d > hb) return false; if (y > bottom - r0 && d > hb - r0) { const ex = d - (hb - r0), ey = y - (bottom - r0); return ex * ex + ey * ey <= r0 * r0; } return y <= bottom; };
      L.fill(cx - W * 0.5, yS, cx + W * 0.5, bottom, inK, M, (x, y) => shadeAt(x, y, half(y), 0.56) + (y > bottom - W * 0.12 ? -0.05 : 0));
      // the seat's two rounds over the heels, a fold each side where the thigh turns down to the floor
      const ySeat = bottom - W * 0.17;
      L.line(cx, yHip - W * 0.04, cx, bottom - W * 0.1, M, 1);
      for (const s of [-1, 1]) {
        L.line(cx + s * W * 0.2, ySeat - W * 0.02, cx + s * W * 0.26, bottom - W * 0.04, M, 1);
        L.line(cx + s * W * 0.03, ySeat + W * 0.05, cx + s * W * 0.16, ySeat + W * 0.075, M, s === -lit ? 4 : 3);
      }
      const sole = kind === 'robe' ? ivory : p.mat(lk.sockCol || '#3a3036', { n: 5, at: 2, step: 0.09 });
      for (const s of [-1, 1]) {
        const fx = cx + s * W * 0.075, fy = bottom - W * 0.045;
        L.fill(fx - W * 0.1, fy - W * 0.05, fx + W * 0.1, fy + W * 0.05, (x, y) => { const a = (x - fx) / (W * 0.085), b = (y - fy - (x - fx) * s * 0.25) / (W * 0.042); return a * a + b * b <= 1; }, sole, (x, y) => clamp(0.62 - lit * (x - fx) / (W * 0.1) * 0.3 - (y - fy) / (W * 0.05) * 0.12, 0.02, 0.999));
      }
    } else if (kind === 'tunic' || kind === 'apron') {
      for (const s of [-1, 1]) {
        const x0 = cx + s * W * 0.015, x1 = cx + s * W * 0.27, x2 = cx + s * W * 0.05, x3 = cx + s * W * 0.2;
        const lb = bottom - W * 0.05;
        const pts = s < 0 ? [[x1, yHip - W * 0.08], [x0, yHip - W * 0.08], [x2, lb], [x3, lb]] : [[x0, yHip - W * 0.08], [x1, yHip - W * 0.08], [x3, lb], [x2, lb]];
        L.poly(pts, pants, (x, y) => clamp(0.55 - lit * (x - cx) / W * 0.5 - (s === -lit ? 0 : 0.08), 0.02, 0.999));
        L.line((x0 + x1) / 2 + s * W * 0.02, yHip, (x2 + x3) / 2, lb, pants, 1);   // the crease
      }
    } else if (kind === 'dress') {
      const end = bottom - W * 0.22, half = (y) => lerp(W * 0.25, W * 0.4, clamp((y - yWaist) / (end - yWaist), 0, 1));
      L.fill(cx - W * 0.5, yWaist, cx + W * 0.5, end, (x, y) => Math.abs(x - cx) <= half(y), cloth, (x, y) => shadeAt(x, y, half(y), 0.58));
      for (const k of [-0.6, -0.2, 0.25, 0.62]) L.line(cx + k * W * 0.2, yWaist + W * 0.08, cx + k * W * 0.38, end - 2, cloth, 2);
      for (const sg of [-1, 1]) L.rect(cx + sg * W * 0.09 - W * 0.04, end, W * 0.08, bottom - end - W * 0.03, pants, 2);
    } else {
      // robe or coat: one piece to the bottom, a little narrower below the hips (the robe), straight (the coat)
      const end = bottom - W * (kind === 'robe' ? 0.06 : 0.25);
      const half = (y) => (y < yHip ? torso(y) : kind === 'robe' ? lerp(W * 0.28, W * 0.23, clamp((y - yHip) / (end - yHip), 0, 1)) : W * 0.29);
      L.fill(cx - W * 0.5, yWaist, cx + W * 0.5, end, (x, y) => Math.abs(x - cx) <= half(y), cloth, (x, y) => shadeAt(x, y, half(y)));
      if (kind === 'coat') for (const sg of [-1, 1]) L.poly([[cx + sg * W * 0.03, end - 2], [cx + sg * W * 0.24, end - 2], [cx + sg * W * 0.2, bottom - W * 0.05], [cx + sg * W * 0.06, bottom - W * 0.05]], pants, (x) => clamp(0.5 - lit * (x - cx) / W * 0.5, 0.02, 0.999));
    }

    // standing: the heels on the ground at the canvas's bottom (shoes under trousers or a coat, tabi and sandals under a
    // robe's hem, shoes under a dress)
    if (!kneel) {
      const gap = kind === 'robe' ? W * 0.075 : kind === 'dress' ? W * 0.09 : W * 0.12;
      for (const s of [-1, 1]) {
        const fx = cx + s * gap, fy = bottom - W * 0.035, fm = kind === 'robe' ? ivory : boots;
        L.ell(fx, fy, W * (kind === 'robe' ? 0.055 : 0.07), W * 0.035, fm, (x) => clamp(0.6 - lit * (x - fx) / (W * 0.07) * 0.3, 0.02, 0.999));
        if (kind === 'robe') L.rect(fx - W * 0.06, bottom - W * 0.012, W * 0.12, W * 0.012, boots, 1);
      }
      if (kind === 'robe') L.line(cx - W * 0.27, bottom - W * 0.06, cx + W * 0.27, bottom - W * 0.06, cloth, 1); // the hem
    }

    // ---- the torso: shoulders to the waist (the hem lower for a tunic) ------------------------------------------------
    const tEnd = kind === 'tunic' || kind === 'apron' ? Math.min(bottom, yHip + W * 0.02) : kneel ? yHip : yWaist + W * 0.02;
    L.fill(cx - W * 0.5, yNeck, cx + W * 0.5, tEnd, (x, y) => Math.abs(x - cx) <= torso(y), cloth, (x, y) => shadeAt(x, y, torso(y)));
    // the spine's seam (robes and coats) or a shallow fold (a tunic), a coat's vent: both stop at the hem
    const hemY = kneel ? yHip : kind === 'coat' ? bottom - W * 0.25 : bottom - W * 0.06;
    if (kind === 'robe' || kind === 'coat') L.line(cx, yNeck + W * 0.06, cx, hemY - 1, cloth, 1);
    else L.line(cx, sh + W * 0.12, cx, yWaist - W * 0.04, cloth, 2);
    if (kind === 'coat' && !kneel) { L.line(cx + 1, yHip, cx + 1, hemY - 1, clothD, 0); L.line(cx - W * 0.29, yHip - W * 0.02, cx + W * 0.29, yHip - W * 0.02, cloth, 2); }

    // ---- the arms: each its own tapering shape beside the back (a robe's sleeve hangs wide over the side), the cuff and
    // the hand; kneeling, the hands rest in the lap, so the arms show to the elbow --------------------------------------
    const cane = acc.includes('cane');
    for (const s of [-1, 1]) {
      const wide = kind === 'robe';
      // an arm bent forward (holding something in front of them, or the hands in the lap) shows only to the elbow, its
      // sleeve going away from us
      const fwd = kneel || o.forward === (s < 0 ? 'l' : 'r'), raised = o.raise === (s < 0 ? 'l' : 'r');
      const bot = raised ? yArm : fwd ? (kneel ? (wide ? yWaist + W * 0.2 : yWaist + W * 0.03) : yWaist - W * 0.06) : wide ? yWrist + W * 0.08 : yWrist;
      const wIn = (y) => torso(y) - W * 0.025;     // a robe's sleeve: its inner edge over the back
      const isArm = (x, y) => {
        const d = (x - cx) * s;
        if (y < yNeck || y > bot) return false;
        if (y < yArm) return d >= Math.min(torso(y), outer(y)) - W * 0.12 && d <= outer(y);
        if (!wide) return d >= armIn(y) && d <= armOut(y);
        const o2 = y > yWaist ? outer(y) + W * 0.02 : outer(y);
        return d >= wIn(y) && d <= o2 && !(y > yWrist && d < wIn(y) + W * 0.08 && y > bot - (bot - yWrist) * (d - wIn(y)) / (W * 0.18));
      };
      const inE = (y) => (y < yArm ? torso(y) : wide ? wIn(y) : armIn(y));
      L.fill(cx - W * 0.6, yNeck, cx + W * 0.6, bot, (x, y) => (x - cx) * s >= 0 && isArm(x, y), cloth, (x, y) => {
        const d = (x - cx) * s, mid = (outer(y) + inE(y)) / 2, u = y < yArm ? 0 : (d - mid) / Math.max(1, (outer(y) - inE(y)) / 2);
        return clamp(0.6 - lit * s * 0.18 + (s === -lit ? 0.06 : -0.06) - u * u * 0.18 - clamp((y - sh) / W, 0, 1) * 0.08 + (y < yArm ? 0.05 : 0), 0.02, 0.999);
      });
      // the crease where the arm lies over the back (where it hangs apart, the outline draws the gap), the elbow's fold,
      // light along the shoulder's top
      for (let y = yArm; y < bot - 2; y += 1) if (wide || armIn(y) < torso(y) - 1) L.dot(cx + s * Math.ceil(inE(y)), y, cloth, 0);
      if (!wide && !fwd && !raised) L.line(cx + s * (armIn(yElb) + W * 0.02), yElb, cx + s * (armIn(yElb) + W * 0.05), yElb + W * 0.012, cloth, 1);
      for (let y = yNeck + 2; y < yArm - W * 0.04; y += 1) { const xo = outer(y) - W * 0.025; if (xo > neckHW + W * 0.04) L.dot(cx + s * xo, y, cloth, s === -lit ? 5 : 3); }
      if (raised) continue;
      if (fwd) {
        // the elbow's round end, a fold where the sleeve turns away
        const i0 = wide ? wIn(bot) : armIn(bot), ex = cx + s * (i0 + outer(bot)) / 2;
        L.ell(ex, bot, (outer(bot) - i0) / 2 + 1, W * 0.035, cloth, s === -lit ? 3 : 1);
        L.line(ex - W * 0.04, bot - W * 0.02, ex + W * 0.04, bot - W * 0.02, cloth, 1);
        continue;
      }
      // the hand: seen from behind, the back of it, the fingers down toward the thigh (a robe's: only at its sleeve)
      const hxm = wide ? cx + s * (torso(yWrist) + W * 0.04) : cx + s * (armIn(yWrist) + armOut(yWrist)) / 2;
      const hym = wide ? yWrist + W * 0.03 : yWrist;
      // a cane, held on the light's side, from the hand to the floor (drawn under the hand that grips it)
      if (cane && s === lit) L.seg(hxm + s * W * 0.01, hym, hxm + s * W * 0.08, bottom - W * 0.01, Math.max(2, W * 0.022), p.mat('#6a4a2a', { n: 4, at: 2 }), 2);
      if (!wide) {
        L.rect(cx + s * (s < 0 ? armOut(yWrist) : armIn(yWrist)), yWrist - W * 0.03, armW(yWrist), W * 0.03, accent, 2);
        L.fill(hxm - W * 0.06, yWrist, hxm + W * 0.06, yHand, (x, y) => { const a = (x - hxm) / (W * 0.047), b = (y - yWrist) / (yHand - yWrist); return Math.abs(a) <= 1 - b * b * 0.45 && b <= 1; }, skin, (x, y) => clamp(0.56 - lit * (x - hxm) / (W * 0.05) * 0.25 - (y - yWrist) / W * 0.4, 0.02, 0.999));
      } else L.ell(hxm, hym, W * 0.04, W * 0.035, skin, 2);
    }

    // ---- the waist: obi and its bow or knot, a belt, the apron's ties --------------------------------------------------
    if (kind === 'robe') {
      const oy0 = yWaist - W * 0.07, oy1 = yWaist + W * 0.06;
      L.fill(cx - W * 0.4, oy0, cx + W * 0.4, oy1, (x, y) => Math.abs(x - cx) <= torso(y) + 1, accent, (x, y) => clamp(0.6 - lit * (x - cx) / W * 0.5 - (y - oy0) / (oy1 - oy0) * 0.15, 0.02, 0.999));
      L.line(cx - torso(yWaist), yWaist, cx + torso(yWaist), yWaist, accent, 4);  // the cord
      if (lk.yukata) {
        // a butterfly bow at the back: two loops and two falling tails
        for (const s of [-1, 1]) {
          L.poly([[cx, yWaist - W * 0.02], [cx + s * W * 0.2, yWaist - W * 0.12], [cx + s * W * 0.22, yWaist + W * 0.04], [cx, yWaist + W * 0.02]], accent, (x, y) => clamp(0.66 - lit * (x - cx) / W * 0.8 - (y - yWaist) / W * 0.5, 0.02, 0.999));
          L.poly([[cx + s * W * 0.02, yWaist + W * 0.02], [cx + s * W * 0.1, yWaist + W * 0.04], [cx + s * W * 0.07, yWaist + W * 0.24], [cx + s * W * 0.01, yWaist + W * 0.22]], accent, (x) => clamp(0.5 - lit * (x - cx) / W * 0.8, 0.02, 0.999));
        }
        L.rect(cx - W * 0.035, yWaist - W * 0.04, W * 0.07, W * 0.08, accent, 4);
      } else L.rect(cx - W * 0.08, yWaist - W * 0.04, W * 0.16, W * 0.07, accent, 3); // a flat knot
    } else if (kind !== 'dress') {
      L.fill(cx - W * 0.4, yWaist - W * 0.025, cx + W * 0.4, yWaist + W * 0.02, (x, y) => Math.abs(x - cx) <= torso(y) + 1, kind === 'apron' ? ivory : accent, (x) => clamp(0.6 - lit * (x - cx) / W * 0.5, 0.02, 0.999));
      if (kind === 'apron') {
        // the ties crossing the back from the shoulders, and their bow at the waist
        for (const s of [-1, 1]) L.seg(cx + s * W * 0.2, sh + W * 0.02, cx - s * W * 0.03, yWaist - W * 0.02, W * 0.035, ivory, 3);
        for (const s of [-1, 1]) L.ell(cx + s * W * 0.055, yWaist, W * 0.05, W * 0.03, ivory, 3);
        for (const s of [-1, 1]) L.seg(cx + s * W * 0.02, yWaist, cx + s * W * 0.05, yWaist + W * 0.15, W * 0.03, ivory, 2);
      } else if (kind === 'coat') {
        L.rect(cx - W * 0.16, yWaist - W * 0.03, W * 0.32, W * 0.04, cloth, 2); // the half belt, its two buttons
        for (const s of [-1, 1]) L.ell(cx + s * W * 0.13, yWaist - W * 0.01, W * 0.012, W * 0.012, accent, 4);
      }
    }
    if (acc.includes('toolbelt')) for (const s of [-1, 1]) L.rect(cx + s * W * 0.2 - W * 0.05, yWaist, W * 0.1, W * 0.09, p.mat('#6a4a2a', { n: 4, at: 2 }), 2);

    // ---- carried: a satchel's strap across the back to the bag at the hip; a cloak over the back -------------------------
    if (acc.includes('satchel')) {
      const strap = p.mat('#6a4a2a', { n: 5, at: 2, step: 0.08 }), bag = p.mat('#7a5634', { n: 5, at: 2, step: 0.08 });
      L.seg(cx - W * 0.26, sh + W * 0.01, cx + W * 0.3, yHip - W * 0.1, W * 0.045, strap, (x, y) => clamp(0.55 - (y - sh) / W * 0.2, 0, 0.999));
      L.poly([[cx + W * 0.26, yHip - W * 0.14], [cx + W * 0.5, yHip - W * 0.14], [cx + W * 0.52, yHip + W * 0.1], [cx + W * 0.28, yHip + W * 0.1]], bag, (x) => clamp(0.5 - lit * (x - cx - W * 0.4) / W, 0.02, 0.999));
      L.rect(cx + W * 0.26, yHip - W * 0.15, W * 0.25, W * 0.06, bag, 4);
    }
    if (acc.includes('cape')) {
      const cm = p.mat(lk.capeCol || '#6a3a4a', { n: 6, at: 3, step: 0.08 });
      L.fill(cx - W * 0.56, yNeck, cx + W * 0.56, yHip, (x, y) => Math.abs(x - cx) <= outer(Math.min(y, yArm)) + W * 0.03 + (y - yArm) * 0.08, cm, (x, y) => shadeAt(x, y, W * 0.5, 0.58));
      for (const k of [-0.5, -0.15, 0.2, 0.52]) L.line(cx + k * W * 0.4, sh + W * 0.15, cx + k * W * 0.6, yHip - 2, cm, 2);
    }
    if (acc.includes('scarf') && !lk.yukata) {
      const sm = p.mat(lk.scarfCol || '#c8962e', { n: 5, at: 3, step: 0.08 });
      L.fill(cx - W * 0.2, yNeck - W * 0.04, cx + W * 0.2, sh + W * 0.06, (x, y) => Math.abs(x - cx) <= neckHW + W * 0.07 - (y - yNeck) * 0.2, sm, (x) => clamp(0.6 - lit * (x - cx) / W * 0.9, 0.02, 0.999));
      L.seg(cx + lit * W * 0.06, sh + W * 0.02, cx + lit * W * 0.1, sh + W * 0.32, W * 0.07, sm, 2);
    }

    // ---- the collar at the nape, the neck, the ears, the head ------------------------------------------------------------
    const yHair = hy + hr * 0.78;   // where short hair stops at the nape
    L.rect(cx - neckHW, yHair - hr * 0.2, neckHW * 2, yNeck - yHair + hr * 0.4, skin, (x) => clamp(0.5 - lit * (x - cx) / neckHW * 0.3, 0.02, 0.999));
    if (kind === 'robe') {
      // the robe's collar standing off the nape: an inner layer, then the robe's own band
      L.fill(cx - W * 0.2, yNeck - W * 0.035, cx + W * 0.2, yNeck + W * 0.04, (x, y) => { const d = Math.abs(x - cx); return d <= neckHW + W * 0.03 && d >= neckHW - W * 0.005 - (y - yNeck + W * 0.035) * 0.5; }, ivory, 3);
      L.fill(cx - W * 0.22, yNeck - W * 0.02, cx + W * 0.22, yNeck + W * 0.06, (x, y) => { const d = Math.abs(x - cx); return d <= neckHW + W * 0.055 && d >= neckHW + W * 0.025 - (y - yNeck) * 0.3; }, cloth, (x) => clamp(0.62 - lit * (x - cx) / W * 0.8, 0.02, 0.999));
    } else if (kind === 'coat') {
      L.fill(cx - W * 0.16, yNeck - W * 0.08, cx + W * 0.16, yNeck + W * 0.03, (x, y) => Math.abs(x - cx) <= neckHW + W * 0.035, cloth, (x) => clamp(0.48 - lit * (x - cx) / W * 1.2, 0.02, 0.999));
      L.line(cx - neckHW - W * 0.035, yNeck - W * 0.08, cx + neckHW + W * 0.035, yNeck - W * 0.08, cloth, 5);
    } else {
      L.fill(cx - W * 0.16, yNeck - W * 0.015, cx + W * 0.16, yNeck + W * 0.025, (x, y) => Math.abs(x - cx) <= neckHW + W * 0.02, accent, 2);
    }
    const style = lk.hair || 'short';
    const covered = acc.includes('hood') || style === 'wrap';
    // ears: at the sides of the head, under hair that falls past them
    if (!covered && !['long', 'bob', 'wavy', 'curly'].includes(style)) for (const s of [-1, 1]) L.ell(hx + s * hr * 0.98, hy + hr * 0.12, hr * 0.17, hr * 0.27, skin, s === -lit ? 3 : 1);
    // the hair over the head, its locks drawn from the crown, the nape's edge in points
    const crown = [hx + lit * hr * 0.12, hy - hr * 0.42];
    const lockShade = (x, y) => {
      const a = Math.atan2(y - crown[1], x - crown[0]), r = Math.hypot(x - hx, y - hy) / hr, rc = Math.hypot(x - crown[0], y - crown[1]) / hr;
      // the gaps between locks: thin, unevenly spaced, curving as the hair falls, fading out toward the crown (wide even
      // wedges read as a segmented ball)
      const aw = a + Math.sin(rc * 2.4) * 0.22 * Math.sign(x - crown[0]), ph = Math.cos(aw * 11 + Math.sin(aw * 4) * 1.3);
      const fade = clamp((rc - 0.22) / 0.35, 0, 1);
      const band = (ph > 0.84 ? -0.1 : ph < -0.92 ? 0.045 : 0) * fade;
      const shine = r > 0.35 && r < 0.62 && Math.abs(a + Math.PI / 2 + lit * 0.5) < 0.55 ? 0.14 : 0; // the broken highlight band
      return clamp(0.56 - lit * (x - hx) / hr * 0.2 - (y - hy) / hr * 0.12 + band + shine, 0.02, 0.999);
    };
    if (style === 'shaved') {
      L.ell(hx, hy, hr, hr * 1.08, skin, (x, y) => clamp(0.55 - lit * (x - hx) / hr * 0.25 - (y - hy) / hr * 0.1, 0.02, 0.999));
      L.fill(hx - hr, hy - hr * 1.1, hx + hr, hy + hr * 0.7, (x, y) => { const a = (x - hx) / hr, b = (y - hy) / (hr * 1.08); return a * a + b * b <= 1 && ((Math.round(x) + Math.round(y) * 2) % 3 === 0); }, hair, 2);
    } else if (!covered) {
      const nape = (x) => yHair + Math.abs(Math.sin((x - hx) / hr * 4.7)) * hr * 0.14; // the points at the nape
      const longY = style === 'long' || style === 'wavy' || style === 'curly' ? sh + W * 0.32 : style === 'bob' ? hy + hr * 1.18 : 0;
      L.fill(hx - hr * 1.3, hy - hr * 1.2, hx + hr * 1.3, Math.max(nape(hx) + hr * 0.2, longY), (x, y) => {
        const a = (x - hx) / hr, b = (y - hy) / (hr * 1.08);
        if (a * a + b * b <= 1.02 && y <= nape(x)) return true;
        if (longY && Math.abs(x - hx) <= hr * (style === 'bob' ? 1.05 : 1.08 + clamp((y - hy) / W, 0, 0.6) * 0.5) && y <= longY - Math.abs(x - hx) * 0.1 && y >= hy) return true;
        return false;
      }, hair, lockShade);
      if (longY && (style === 'long' || style === 'wavy' || style === 'curly')) {
        // strands down the back, waved for wavy and curly hair
        for (let k = -3; k <= 3; k++) {
          const x0 = hx + k * hr * 0.28;
          let px = x0, py = hy + hr * 0.6;
          for (let y = py; y < longY - 3; y += 2) { const nx = x0 + (style === 'long' ? 0 : Math.sin(y / (hr * 0.35) + k) * hr * 0.1) + k * (y - hy) * 0.05; L.line(px, py, nx, y, hair, k % 2 ? 2 : 1); px = nx; py = y; }
        }
      }
      if (style === 'bun') {
        // the bun on the crown: its shadow on the head first, then the coil, its turns drawn round it
        const by = hy - hr * 0.72;
        L.ell(hx, by + hr * 0.16, hr * 0.48, hr * 0.2, hair, 1);
        L.ell(hx, by, hr * 0.48, hr * 0.4, hair, (x, y) => { const a = Math.atan2(y - by, x - hx), r2 = Math.hypot((x - hx) / 0.48, (y - by) / 0.4) / hr; return clamp(0.68 - lit * (x - hx) / hr * 0.5 - (y - by) / hr * 0.3 + (Math.cos(a * 3 + r2 * 9) > 0.7 ? -0.12 : 0), 0.02, 0.999); });
        if (lk.age === 'old') L.seg(hx - hr * 0.55, by + hr * 0.05, hx - hr * 0.15, by - hr * 0.12, Math.max(1.5, W * 0.012), p.mat('#c8a050', { n: 4, at: 2 }), 3); // a pin through it
      }
      if (style === 'ponytail' || style === 'twintails' || style === 'braid') {
        const tie = p.mat(lk.ribbonCol || lk.bandCol || '#3a2a30', { n: 4, at: 2 });
        const tails = style === 'twintails' ? [-1, 1] : [0];
        for (const s of tails) {
          const tx = hx + s * hr * 0.75, ty = hy + (style === 'twintails' ? -hr * 0.1 : hr * 0.15), len = style === 'braid' ? W * 0.48 : W * 0.36;
          if (style === 'braid') {
            for (let i = 0; i < 9; i++) { const by = ty + hr * 0.3 + i * len / 9; L.ell(tx + (i % 2 ? 1 : -1) * W * 0.008, by, W * 0.04 - i * W * 0.002, len / 14, hair, (x) => clamp(0.6 - lit * (x - tx) / (W * 0.04) * 0.3 - (i % 2) * 0.08, 0.02, 0.999)); }
            L.ell(tx, ty + hr * 0.3 + len + W * 0.01, W * 0.025, W * 0.02, tie, 2);
          } else {
            L.fill(tx - W * 0.12, ty, tx + W * 0.12, ty + len, (x, y) => { const k2 = (y - ty) / len; return Math.abs(x - tx - s * k2 * W * 0.05) <= W * (0.07 - 0.05 * k2) + Math.sin(k2 * 3) * W * 0.01; }, hair, (x, y) => clamp(0.6 - lit * (x - tx) / (W * 0.07) * 0.25 - (y - ty) / len * 0.15, 0.02, 0.999));
          }
          L.ell(tx, ty + hr * 0.05, W * 0.035, W * 0.025, tie, 2);
        }
      }
      if (style === 'spiky') for (let i = 0; i < 7; i++) { const a = -Math.PI * (0.15 + i * 0.12), r0 = hr * 0.95; L.poly([[hx + Math.cos(a - 0.12) * r0, hy + Math.sin(a - 0.12) * r0], [hx + Math.cos(a) * hr * 1.28, hy + Math.sin(a) * hr * 1.28], [hx + Math.cos(a + 0.12) * r0, hy + Math.sin(a + 0.12) * r0]], hair, 3); }
    }
    if (covered) {
      // a hood or a head wrap: cloth over the head, knotted at the back (a wrap) or falling into the collar (a hood)
      const cm = p.mat(acc.includes('hood') ? lk.hoodCol || col.cloth[1] : lk.wrapCol || '#d8d0c0', { n: 6, at: 3, step: 0.08 });
      L.ell(hx, hy - hr * 0.05, hr * 1.1, hr * 1.12, cm, (x, y) => clamp(0.6 - lit * (x - hx) / hr * 0.22 - (y - hy) / hr * 0.12 + (Math.cos(Math.atan2(y - hy, x - hx) * 7) > 0.7 ? -0.06 : 0), 0.02, 0.999));
      if (acc.includes('hood')) L.fill(hx - hr * 1.2, hy, hx + hr * 1.2, yNeck + W * 0.04, (x, y) => Math.abs(x - hx) <= hr * (1.1 - (y - hy) / (yNeck - hy) * 0.2), cm, (x) => clamp(0.5 - lit * (x - hx) / hr * 0.3, 0.02, 0.999));
      else { L.ell(hx, hy + hr * 0.55, hr * 0.28, hr * 0.2, cm, 4); for (const s of [-1, 1]) L.seg(hx, hy + hr * 0.6, hx + s * hr * 0.35, hy + hr * 1.1, hr * 0.16, cm, 3); }
    }
    // things worn on the head
    if (acc.includes('headband')) { const bm = p.mat(lk.bandCol || '#e8e0d0', { n: 4, at: 2 }); L.fill(hx - hr * 1.05, hy - hr * 0.42, hx + hr * 1.05, hy - hr * 0.22, (x, y) => { const a = (x - hx) / hr; return Math.abs(a) <= 1.02 && y >= hy - hr * 0.42 + a * a * hr * 0.12 && y <= hy - hr * 0.24 + a * a * hr * 0.12; }, bm, 2); L.seg(hx + lit * hr * 0.1, hy - hr * 0.3, hx + lit * hr * 0.35, hy + hr * 0.35, hr * 0.12, bm, 1); }
    if (acc.includes('ribbon') && !['ponytail', 'twintails', 'braid'].includes(style)) { const rm = p.mat(lk.ribbonCol || '#c84a5a', { n: 4, at: 2 }); for (const s of [-1, 1]) L.ell(hx + s * hr * 0.24, hy - hr * 0.6, hr * 0.24, hr * 0.15, rm, 2); L.ell(hx, hy - hr * 0.6, hr * 0.08, hr * 0.09, rm, 3); }
    if (acc.includes('flower')) { const fm = p.mat(lk.flowerCol || '#f0a0b8', { n: 4, at: 2 }); L.ell(hx - lit * hr * 0.7, hy - hr * 0.35, hr * 0.17, hr * 0.17, fm, 3); }
    if (acc.includes('glasses')) { const g2 = p.mat('#2a2430', { cols: ['#2a2430'], at: 0 }); for (const s of [-1, 1]) L.line(hx + s * hr * 0.7, hy - hr * 0.08, hx + s * (hr + 2), hy - hr * 0.05, g2, 0); }
    if (acc.includes('pencil')) L.seg(hx + lit * hr * 0.9, hy - hr * 0.2, hx + lit * hr * 1.25, hy - hr * 0.55, Math.max(2, W * 0.012), p.mat('#e8c040', { n: 4, at: 2 }), 2);
    if (acc.includes('hat')) {
      const hm = p.mat(lk.hatCol || '#3a3a44', { n: 6, at: 3, step: 0.08 }), by = hy - hr * 0.35;
      L.ell(hx, by - hr * 0.5, hr * 1.02, hr * 0.68, hm, (x, y) => clamp(0.8 - lit * (x - hx) / W * 0.9 - (y - by) / hr * 0.1, 0.02, 0.999));
      L.ell(hx, by, W * 0.4, H0 * 0.06, hm, (x, y) => clamp((y < by ? 0.78 : 0.42) - lit * (x - hx) / W * 0.4 - ((Math.round(x * 0.6 + y * 1.3) % 4) === 0 ? 0.08 : 0), 0.02, 0.999)); // the brim, its weave
      L.line(hx - hr * 1.0, by - hr * 0.1, hx + hr * 1.0, by - hr * 0.1, hm, 1);  // the band
    }
    L.outline();
    const cv = L.canvas();
    return {
      cv, ax: Math.round(cx), ay: H0, w: W, h: H0,
      head: { x: Math.round(hx), y: Math.round(hy), r: Math.round(hr) },
      shoulders: { l: [Math.round(cx - SH + W * 0.05), Math.round(sh + W * 0.06)], r: [Math.round(cx + SH - W * 0.05), Math.round(sh + W * 0.06)] },
    };
  }
  return { draw };
})();
