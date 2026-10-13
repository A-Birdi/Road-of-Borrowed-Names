/* The rest of a person below their portrait, for the illustrated scenes (AR-1; Robin, 2026-10-13: "The bodies look a
 * bit odd in a lot of the illustrations, seemingly being painted downwards"). A shot that shows someone standing used
 * to continue the 96-px portrait by repeating its bottom row down to where the feet would be
 * (src/ui/43_sequence_kit.js, bust's ext): every seam and fold became a long stripe, with no arms, hands, waist or
 * feet, and a hard edge where the column stopped. This draws the rest of the person in the portrait's own manner and
 * colours (hard-edged clusters, light from the upper left, the selective outline): the arms in their sleeves and the
 * hands, the garment by its kind (tunic and trousers, a coat, a robe or yukata with its obi, an apron, a dress), what
 * they carry that the bust begins (a satchel's strap and bag, a sash, a scarf's tail, a cloak, a held book, basket or
 * lantern), and the feet, len rows below the portrait's frame. The portraits themselves are unchanged: every other
 * screen shows the same 96 × 96.
 *
 *   RB.portraitBody.below(p, look, len, o) → { back, front, pad, w, h }
 *     p      the portrait's parameters (RB.portraits.subject(...).p), look the road look (shape, pants, boots, yukata)
 *     len    rows from the frame's bottom to the soles
 *     o.arms { l, r }, l the arm on our left: 'side' (hanging, the hand by the thigh), 'clasp' (both hands together in
 *            front at the waist; give it to both), { hold: [x, y] } (the forearm raised to a hand the shot draws at
 *            x, y in frame coordinates), 'none' (the shot draws that arm itself)
 *     back   a P.Buf (w × h, frame x + pad, frame y) drawn under the portrait: rows from the frame's bottom down;
 *     front  a P.Buf drawn over it, or null: raised forearms and clasped hands
 * Frame coordinates are the portrait's own (0..96 across, the chin near y 69, the frame's bottom at 96). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.portraitBody = (function () {
  'use strict';
  const P = RB.pix, S = 96, PAD = 10;
  const shade = P.shade;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, k) => a + (b - a) * k;
  const r = Math.round;
  const IVORY = ['#b8ab94', '#d8ccb4', '#ece4d4', '#f8f2e6'];
  const TABI = ['#c8c0b0', '#e4ded2', '#f6f2ea'];

  function kindOf(p, look) {
    const sh = look && look.shape;
    if ((look && look.yukata) || p.collar === 'robe' || sh === 'robe') return 'robe';
    if (sh === 'dress' || p.collar === 'dress') return 'dress';
    if (sh === 'coat' || p.collar === 'coat') return 'coat';
    if (sh === 'apron' || p.collar === 'apron') return 'apron';
    return 'tunic';
  }

  // a drawing surface in frame coordinates over a P.Buf (x shifted by PAD)
  function surface(w, h, pad) {
    const b = new P.Buf(w, h), m = new P.Buf(w, h);
    const X = (x) => x + pad;
    const map = (pts) => pts.map((v, i) => (i % 2 ? v : X(v)));
    return {
      b,
      // a polygon whose pixels take ramp[f(x, y)] (frame coordinates), or one colour
      poly(pts, ramp, f) {
        const q = map(pts);
        if (typeof ramp === 'string') { b.poly(q, ramp); return; }
        // only the polygon's own box is cleared and visited
        let x0 = w, y0 = h, x1 = 0, y1 = 0;
        for (let i = 0; i < q.length; i += 2) { x0 = Math.min(x0, Math.floor(q[i])); x1 = Math.max(x1, Math.ceil(q[i])); y0 = Math.min(y0, Math.floor(q[i + 1])); y1 = Math.max(y1, Math.ceil(q[i + 1])); }
        x0 = Math.max(0, x0 - 1); y0 = Math.max(0, y0 - 1); x1 = Math.min(w - 1, x1 + 1); y1 = Math.min(h - 1, y1 + 1);
        for (let y = y0; y <= y1; y++) m.d.fill(0, (y * w + x0) * 4, (y * w + x1 + 1) * 4);
        m.poly(q, '#fff');
        for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
          if (!m.d[(y * w + x) * 4 + 3]) continue;
          b.px(x, y, ramp[clamp(f(x - pad, y), 0, ramp.length - 1)]);
        }
      },
      rect(x, y, ww, hh, c) { b.rect(X(r(x)), r(y), r(ww), r(hh), c); },
      line(x0, y0, x1, y1, c, t) { b.line(X(r(x0)), r(y0), X(r(x1)), r(y1), c, t); },
      px(x, y, c) { b.px(X(r(x)), r(y), c); },
      oval(x0, y0, x1, y1, c) { b.oval(X(r(x0)), r(y0), X(r(x1)), r(y1), c); },
      // a thick straight limb from a to b (width wd), shaded across its width: lit on its upper-left edge
      limb(ax, ay, bx, by, wd, ramp, lit) {
        const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, hw = wd / 2;
        const pts = [ax + nx * hw, ay + ny * hw, bx + nx * hw, by + ny * hw, bx - nx * hw, by - ny * hw, ax - nx * hw, ay - ny * hw];
        // which side of the limb faces the light (up-left in the frame)
        const s = nx * -0.62 + ny * -0.78 > 0 ? 1 : -1;
        this.poly(pts, ramp, (x, y) => {
          const t = ((x - ax) * nx + (y - ay) * ny) / hw * s; // +1 on the lit edge, -1 on the far one
          return lit + (t > 0.45 ? 1 : t < -0.55 ? -1 : 0);
        });
      },
    };
  }

  // A hand hanging (fingers down), seen from the front: palm toward the thigh, the thumb toward us. side -1: on our
  // left (lit), +1 on our right. (x, y): the wrist's centre; L the hand's length.
  function handDown(g, x, y, L, C, side) {
    const W = Math.max(7, r(L * 0.68)), x0 = r(x - W / 2), lit = side < 0 ? 3 : 2;
    const sk = C.sk;
    g.poly([x0 + 1, y, x0 + W - 1, y, x0 + W, y + r(L * 0.55), x0 + W - 1, y + L - 1, x0 + 2, y + L, x0, y + r(L * 0.5)], sk, (xx) => (xx < x0 + W * 0.35 ? lit : lit - 1));
    // the thumb on the side toward the body's middle, the finger gaps below the knuckles
    const tx = side < 0 ? x0 + W - 1 : x0 - 1;
    g.poly([tx - 1, y + 2, tx + 2, y + 3, tx + 2, y + r(L * 0.55), tx, y + r(L * 0.6)], sk, () => lit - 1);
    for (let i = 1; i <= 2; i++) g.line(x0 + r(W * i / 3), y + r(L * 0.5), x0 + r(W * i / 3), y + L - 2, sk[Math.max(0, lit - 2)]);
  }

  function below(p, look, len, o) {
    o = o || {};
    look = look || {};
    const C = RB.portraits.palette(p);
    const L = C.cl, ac = C.ac;
    const kind = kindOf(p, look);
    const pantsR = P.ramp(look.pants || shade(p.cloth[1] || p.cloth[0], -1));
    const bootR = P.ramp(look.boots || '#3a2a22');
    len = Math.max(40, r(len));
    const arms0 = Object.assign({ l: 'side', r: 'side' }, o.arms || {});
    // room at the sides for a hand held out (the canvas stays centred on the portrait)
    let pad = PAD;
    for (const a of [arms0.l, arms0.r]) if (a && a.hold) pad = Math.max(pad, Math.ceil(Math.abs(a.hold[0] - 48) - 48 + 16));
    const F = S + len, W = S + pad * 2, H = F + 1;
    // landmarks (the chin at 69): a figure of about five heads, as the shots stage them
    const chin = 69, B = F - chin;
    const yW = r(chin + 0.31 * B), yC = r(chin + 0.43 * B), yWr = r(chin + 0.41 * B), yK = r(chin + 0.7 * B);
    const yE = yW - 3, hand = clamp(r(0.07 * B), 9, 16), yA = F - Math.max(5, r(0.035 * B));
    const arms = arms0;
    const acc = p.acc || [];
    if (acc.includes('book') && arms.l === 'side') arms.l = { hold: [12, 97] };
    if ((acc.includes('basket') || acc.includes('lamp') || acc.includes('atlas_lamplet')) && arms.r === 'side') arms.r = { hold: [86, 97] };

    const g = surface(W, H, pad);
    // the bust's own shading, carried down: the lit arm (ours left), the torso, the arm in shade
    const tone = (x) => (x < 14 ? 4 : x < 22 ? 3 : x > 84 ? 0 : x > 70 ? 1 : 2);
    const tl = (y) => (y <= 100 ? 20 : y <= yW ? lerp(20, 26, (y - 100) / (yW - 100)) : lerp(26, 24, clamp((y - yW) / (yC - yW), 0, 1)));
    const tr = (y) => S - tl(y);

    // ---- behind everything: a cloak hanging from the shoulders ------------------------------------------------
    if (acc.includes('cape')) {
      const R4 = P.ramp(p.capeCol || '#6a3a4a');
      g.poly([-4, 94, 100, 94, 104, yK, -8, yK], R4, (x, y) => (x < 10 ? 3 : x > 86 ? 0 : 1) - (y > yK - 4 ? 1 : 0));
    }

    // ---- legs and feet (under the garment) --------------------------------------------------------------------
    const legsFrom = kind === 'robe' ? null : kind === 'dress' ? yK : kind === 'coat' ? yK - 8 : yC;
    if (legsFrom != null) {
      const narrow = kind === 'dress';
      const lo = narrow ? [33, 45] : [26, 47], ro = narrow ? [51, 63] : [49, 70];
      const leg = (a, b2, c2, d2, lit) => g.poly([a, legsFrom - 2, b2, legsFrom - 2, d2, yA, c2, yA], narrow ? pantsR : pantsR, (x) => lit + (x < (a + b2) / 2 ? 0 : -1));
      leg(lo[0], lo[1], narrow ? 34 : 30, narrow ? 44 : 45, 3);
      leg(ro[0], ro[1], narrow ? 52 : 51, narrow ? 62 : 66, 2);
      if (!narrow) { g.line(36, legsFrom + 6, 37, yA - 2, pantsR[1]); g.line(60, legsFrom + 6, 59, yA - 2, pantsR[0]); } // creases
      // shoes: a little wider than the ankle, the toes toward us, the sole dark
      for (const [x0, x1, lit] of [[narrow ? 32 : 28, narrow ? 45 : 46, 3], [narrow ? 51 : 50, narrow ? 64 : 68, 2]]) {
        g.poly([x0 + 1, yA - 1, x1 - 1, yA - 1, x1, F - 2, x1, F, x0, F, x0, F - 2], bootR, (x, y) => (y >= F - 1 ? 0 : x < (x0 + x1) / 2 ? lit : lit - 1));
        g.line(x0 + 2, yA, x1 - 3, yA, bootR[Math.min(4, lit + 1)]);
      }
    }

    // ---- the garment ------------------------------------------------------------------------------------------------
    const cloth = (x, y) => tone(x) - (y > yK ? 1 : 0);
    if (kind === 'robe') {
      // shoulders to the ankles: the torso narrows to the obi, then the robe falls straight and a little in
      const hemY = F - 4;
      const hl = (y) => (y <= yW ? tl(y) : lerp(25, 28, clamp((y - yW) / (hemY - yW), 0, 1)));
      const pts = [];
      for (let y = 94; y <= hemY; y += 4) pts.push(hl(y), y);
      pts.push(hl(hemY), hemY);
      for (let y = hemY; y >= 94; y -= 4) pts.push(S - hl(y), y);
      pts.push(S - hl(94), 94);
      g.poly(pts, L, (x, y) => (x < 30 ? 3 : x > 66 ? 1 : 2) - (y > yK + 10 && x > 60 ? 1 : 0));
      // the overlap: the front edge continues from the collar's crossing to the obi, then down to the hem
      g.line(39, 96, 35, yW - 6, L[0]);
      g.line(36, 96, 33, yW - 6, L[3]);
      g.line(39, yW + 7, 43, hemY, L[0]);
      g.line(38, yW + 7, 42, hemY, L[3]);
      // folds falling from the obi
      g.line(55, yW + 10, 58, hemY - 2, L[1]); g.line(30, yW + 14, 31, hemY - 6, L[1]);
      // the obi: a wide band, its top and bottom edges, the cord across it
      const obi = [shade(ac[0], -1), ac[0], ac[1], ac[2], shade(ac[2], 1)];
      g.poly([tl(yW - 6) - 1, yW - 6, tr(yW - 6) + 1, yW - 6, tr(yW + 6) + 1, yW + 6, tl(yW + 6) - 1, yW + 6], obi, (x) => (x < 32 ? 3 : x > 66 ? 1 : 2));
      g.line(tl(yW - 6), yW - 6, tr(yW - 6), yW - 6, obi[4]);
      g.line(tl(yW + 6), yW + 6, tr(yW + 6), yW + 6, obi[0]);
      g.line(tl(yW), yW, tr(yW), yW, look.yukata ? obi[4] : obi[1]);
      // the hem, then the feet: tabi and the thongs of sandals
      g.line(hl(hemY), hemY, S - hl(hemY), hemY, L[1]);
      for (const [x0, x1] of [[32, 44], [52, 64]]) {
        g.poly([x0 + 1, hemY + 1, x1 - 1, hemY + 1, x1, F - 1, x0, F - 1], TABI, (x) => (x < (x0 + x1) / 2 ? 2 : 1));
        g.rect(x0, F - 1, x1 - x0 + 1, 2, bootR[1]);
        g.px((x0 + x1) / 2, hemY + 2, bootR[0]);
      }
    } else {
      // tunic, apron and coat share a torso; the coat runs on to the knees, the dress opens into a skirt
      const hemY = kind === 'coat' ? yK - 6 : kind === 'dress' ? yW + 1 : yC + 8;
      const hemX = kind === 'coat' ? 18 : kind === 'dress' ? 26 : 23;
      const hl = (y) => (y <= yW ? tl(y) : lerp(tl(yW), hemX, clamp((y - yW) / Math.max(1, hemY - yW), 0, 1)));
      const pts = [];
      for (let y = 94; y <= hemY; y += 4) pts.push(hl(y), y);
      pts.push(hl(hemY), hemY);
      for (let y = hemY; y >= 94; y -= 4) pts.push(S - hl(y), y);
      pts.push(S - hl(94), 94);
      g.poly(pts, L, cloth);
      // the cloth drawn in from the armpits toward the waist
      g.line(23, 102, 29, yW - 5, L[2]); g.line(24, 103, 30, yW - 4, L[1]);
      g.line(73, 102, 67, yW - 5, L[1]); g.line(72, 103, 66, yW - 4, L[0]);
      if (kind === 'dress') {
        const skirtY = r(yK + (F - yK) * 0.38);
        g.poly([26, yW, 70, yW, 82, skirtY, 14, skirtY], L, (x, y) => (x < 28 ? 3 : x > 64 ? 1 : 2) - (y > skirtY - 3 ? 1 : 0));
        for (const x of [34, 48, 62]) g.line(x, yW + 4, x + (x - 48) * 0.35, skirtY - 2, L[1]);
        g.rect(14, skirtY - 2, 69, 2, ac[1]);
        g.line(26, yW, 70, yW, ac[1]); g.line(27, yW + 1, 69, yW + 1, ac[0]);
      } else {
        // the hem (and the coat's opening) a shade darker; the belt at the waist
        g.line(hl(hemY), hemY, S - hl(hemY), hemY, L[1]);
        if (kind === 'coat') {
          g.line(48, 92, 48, hemY, L[0]); g.line(49, 92, 49, hemY, L[3]);
          for (let y = 100; y <= yW + 14; y += 12) { g.rect(44, y, 2, 2, ac[2]); g.px(44, y + 1, ac[1]); }
          g.line(26, yC - 2, 36, yC - 2, L[1]); g.line(60, yC - 2, 70, yC - 2, L[0]); // pocket flaps
        } else {
          g.rect(tl(yW) - 1, yW - 1, tr(yW) - tl(yW) + 3, 3, ac[1]);
          g.line(tl(yW), yW - 1, tr(yW), yW - 1, ac[2]);
          g.rect(40, yW - 2, 5, 5, ac[2]); g.rect(41, yW - 1, 3, 3, ac[0]);
          // the shirt's opening below the collar, and a fold at each side
          if (p.collar === 'high') { g.line(48, 92, 48, yW - 2, ac[1]); for (let y = 100; y < yW - 4; y += 9) g.rect(47, y, 3, 2, ac[2]); }
          g.line(30, yW + 3, 28, hemY - 2, L[1]); g.line(64, yW + 3, 67, hemY - 2, L[0]);
        }
      }
      if (kind === 'apron') {
        // the bib down to the waist, the ties, the apron to the knee with its folds
        g.poly([33, 94, 63, 94, 65, yW, 31, yW], IVORY, (x) => (x < 40 ? 3 : x > 58 ? 1 : 2));
        g.rect(tl(yW), yW, tr(yW) - tl(yW) + 1, 2, IVORY[1]);
        g.poly([29, yW + 2, 67, yW + 2, 70, yK - 2, 26, yK - 2], IVORY, (x) => (x < 36 ? 3 : x > 60 ? 1 : 2));
        for (const x of [38, 48, 58]) g.line(x, yW + 6, x + (x - 48) * 0.2, yK - 4, IVORY[1]);
        g.line(26, yK - 2, 70, yK - 2, IVORY[0]);
      }
    }

    // ---- things the bust begins ------------------------------------------------------------------------------------
    if (acc.includes('satchel')) {
      // the strap from the shoulder down across the chest to the bag at the hip on our right
      g.line(62, 94, 76, yW - 4, '#6a4a2a', 5); g.line(62, 94, 76, yW - 4, '#8a6a3a', 3);
      const bag = ['#4a321e', '#6a4a2a', '#8a6a3a', '#a8865a', '#c8a870'];
      g.poly([66, yW - 6, 90, yW - 6, 91, yW + 14, 65, yW + 14], bag, (x) => (x < 72 ? 3 : x > 84 ? 1 : 2));
      g.poly([65, yW - 7, 91, yW - 7, 90, yW + 3, 66, yW + 3], bag, (x) => (x < 72 ? 4 : 2));
      g.rect(76, yW + 1, 4, 3, '#c8a050');
    }
    if (acc.includes('atlas_sash')) { const c = p.sashCol || '#d8c89a'; g.line(64, 94, 74, yW, c, 5); g.line(64, 98, 73, yW + 2, shade(c, -1)); }
    if (acc.includes('scarf') && kind !== 'robe') {
      const R = P.ramp(p.scarfCol || '#c8962e');
      g.poly([60, 94, 74, 94, 75, 116, 61, 116], R, (x) => (x < 63 ? 3 : x > 70 ? 1 : 2));
      for (let x = 61; x < 75; x += 3) g.rect(x, 116, 1, 3, R[1]);
    }
    if (acc.includes('book')) { g.rect(4, 94, 16, 4, '#6a3a3a'); g.rect(18, 94, 2, 3, '#e8e0c8'); g.line(4, 97, 19, 97, '#4a2a2a'); }
    if (acc.includes('basket')) { g.rect(76, 94, 20, 6, '#b08a4a'); for (let x = 77; x < 96; x += 3) g.rect(x, 94, 1, 5, '#7a5a2e'); g.line(76, 99, 95, 99, '#7a5a2e'); }

    // ---- arms: hanging ones behind the hands that hold or clasp --------------------------------------------------------
    const fg = surface(W, H, pad), front = fg.b;
    const sleeveR = L;
    const wide = kind === 'robe';
    const drawArm = (side, pose) => {
      const m = side < 0 ? (x) => x : (x) => S - x; // mirror for the arm on our right
      const lit = side < 0 ? 3 : 1;
      if (pose === 'none') return;
      if (pose === 'side') {
        // the upper arm narrowing under the shoulder to the elbow, the forearm to the wrist; a robe's wide sleeve
        // hangs below the wrist instead. Shaded round its width, as a cylinder: a lit edge, the core, the shaded edge.
        const pts = wide
          ? [-1, 94, -2, 104, -3, yE, -3, yWr + 6, 0, yWr + 10, 14, yWr + 10, 21, yWr + 4, 20, 104, 21, 94]
          : [-1, 94, 0, 102, 2, yE, 4, yWr, 14, yWr, 16, yE, 18, 104, 20, 96, 21, 94];
        const ax = (y) => (y < yE ? lerp(9, 9.5, (y - 94) / (yE - 94)) : lerp(9.5, 9, (y - yE) / Math.max(1, yWr - yE)));
        g.poly(pts.map((v, i) => (i % 2 ? v : m(v))), sleeveR, (x, y) => {
          const u = (side < 0 ? x : S - x) - ax(y); // across the arm: negative toward its outer edge
          return lit + (u < -5 ? (side < 0 ? 1 : -1) : u > 5 ? (side < 0 ? -1 : 0) : 0);
        });
        g.line(m(4), yE - 1, m(11), yE + 1, sleeveR[Math.max(0, lit - 2)]); // the crease inside the elbow
        if (!wide) g.rect(Math.min(m(4), m(14)), yWr - 2, 11, 2, ac[side < 0 ? 1 : 0]);
        handDown(g, m(wide ? 13 : 9), wide ? yWr + 3 : yWr, hand, C, side);
      } else if (pose === 'clasp') {
        // the upper arm down to the elbow, the forearm across to the middle of the waist; the hands drawn once, over both
        g.poly([-1, 94, -2, 104, -1, yE, 15, yE, 20, 104, 21, 94].map((v, i) => (i % 2 ? v : m(v))), sleeveR, (x, y) => lit + (y > yE - 8 ? 0 : 1));
        fg.limb(m(6), yE - 4, m(40), yW + 6, wide ? 15 : 12, sleeveR, side < 0 ? 2 : 1);
      } else if (pose && pose.hold) {
        // shoulder → elbow → the wrist of the hand the shot draws: the elbow from the two lengths; a hand further than the arm can reach stretches the forearm rather than float free of it
        const tx = pose.hold[0], ty = Math.max(2, pose.hold[1]);
        const sx = m(10), sy = 97, Lu = yE - 96 + 4, Lf = yWr - yE + 10;
        const d = Math.hypot(tx - sx, ty - sy) || 1;
        let E;
        if (d <= (Lu + Lf) * 0.75) {
          // a hand near the body (something held at the chest or the waist): the elbow comes forward, so from the front
          // the upper arm looks shorter; the elbow sits by the ribs, under the hand and a little outside it
          E = [lerp(sx, tx, 0.3) + (side < 0 ? -2 : 2), Math.min(sy + Lu, Math.max(ty, sy) + Lf * 0.8)];
        } else {
          // a hand held out: the elbow from the two lengths, the one under the line of the reach
          const dd = clamp(d, Math.abs(Lu - Lf) + 1, Lu + Lf - 1);
          const a = Math.acos(clamp((Lu * Lu + dd * dd - Lf * Lf) / (2 * Lu * dd), -1, 1)), base = Math.atan2(ty - sy, tx - sx);
          const e1 = [sx + Lu * Math.cos(base + a), sy + Lu * Math.sin(base + a)], e2 = [sx + Lu * Math.cos(base - a), sy + Lu * Math.sin(base - a)];
          E = e1[1] >= e2[1] ? e1 : e2;
        }
        fg.limb(sx, sy, E[0], E[1], wide ? 16 : 14, sleeveR, side < 0 ? 3 : 1);
        if (wide) fg.poly([E[0] - 6, E[1], (E[0] + tx) / 2, (E[1] + ty) / 2, (E[0] + tx) / 2, (E[1] + ty) / 2 + 14, E[0] - 4, E[1] + 16], sleeveR, () => (side < 0 ? 2 : 0)); // the sleeve hanging from the forearm
        fg.limb(E[0], E[1], tx, ty, wide ? 13 : 11, sleeveR, side < 0 ? 3 : 1);
        fg.oval(E[0] - 6, E[1] - 6, E[0] + 6, E[1] + 6, sleeveR[side < 0 ? 2 : 1]);
      }
    };
    drawArm(-1, arms.l);
    drawArm(1, arms.r);
    if (arms.l === 'clasp' || arms.r === 'clasp') {
      // the hands one over the other at the middle of the waist
      const sk = C.sk, cy = yW + 4;
      fg.poly([37, cy, 52, cy - 1, 55, cy + 6, 50, cy + 11, 38, cy + 10, 35, cy + 5], sk, (x) => (x < 44 ? 3 : 2));
      fg.poly([45, cy + 2, 59, cy + 1, 61, cy + 7, 57, cy + 12, 46, cy + 11], sk, (x) => (x < 52 ? 2 : 1));
      fg.line(47, cy + 5, 57, cy + 5, sk[1]); fg.line(47, cy + 8, 56, cy + 8, sk[1]);
    }

    // the portrait sits over everything above its bottom edge; outlines as the portrait's own (finish)
    g.b.threshold(110); g.b.outline('#1a141c', { minA: 1 });
    for (let y = 0; y < S && y < H; y++) for (let x = 0; x < W; x++) g.b.clear(x, y);
    let any = false;
    for (let i = 3; i < front.d.length; i += 4) if (front.d[i]) { any = true; break; }
    if (any) { front.threshold(110); front.outline('#1a141c', { minA: 1 }); }
    return { back: g.b, front: any ? front : null, pad, w: W, h: H };
  }

  return { below, kindOf, PAD };
})();
