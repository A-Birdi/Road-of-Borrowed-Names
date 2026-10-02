/* Creatures A — the moth family (the Flour Moth proof, battle addendum §18; also the Margin,
 * Ash, Catalogue, Chart and Postmark Moths). Winged/hovering anatomy (§9.2): wing shape change,
 * body aim, appendage follow-through, a stable hover over its shadow and a controlled arrest
 * of travel.
 *
 * Native frame 224 × 192, origin (112, 100) (it was 188 × 160): the wider canvas holds what the
 * actions add beyond the idle silhouette — wings thrown up to brake, legs reaching out, flour
 * shaken from the wing margins — at the same idle size (wingspan ≈ 176 art px). Detail: a
 * hooked forewing with a costal highlight, veins, ante- and postmedial lines, a pale
 * subterminal row, an eye-spot and a chequered fringe; a lighter hind wing with a scalloped
 * margin; a furred thorax with lit tufts, banded abdomen, bipectinate antennae, jointed legs.
 *
 * Rig pose q (see rig): x, y body offset; roll (+ turns the belly and legs to the party at the
 * lower left); wa [near, far] forewing angle (− raised); wsy stroke foreshortening; wsx span
 * (the near wing narrows as it turns toward the target); hl hind-wing lag; ant antenna sweep
 * (+ back); legs 0 tucked … 1 reaching to the target; grip; abd abdomen swing (follow-through);
 * fur; eye (1 open, 0 shut); dust 0 … 1 material shaken from the wing margins; dk its kind
 * ('flour' the creature's own powder, 'ash', 'frost').
 *
 * Moves (deliveries, Normal ms; contact = when the rules' result shows):
 *   strike  the swoop (§18.2): 0–260 aim (wings draw back, belly to the target), 260–640 an
 *           arcing approach (travel, never a stretched sprite), 640 contact (hit / ward /
 *           softened / met air), 640–760 held contact pose, 760–1150 wings arrest and it returns
 *           (travel back), 1150–1250 settles into its hover. A ward: it meets the seal at 640
 *           and is thrown back. Softened: it meets the seal, then presses through.
 *   shroud  (§18.4) 1,450: wings rise and meet, clap down, shake the powder off the margins;
 *           the veil applies at 760 and settles quietly over its knots (84a veil).
 *   gust, sweep, charge, chill, mend: see deliveries below. */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const A = RB.creaturesA, K = RB.pxkit;
  const mixh = (a, b, k) => K.hex(K.mix(a, b, k));
  const S = A.side;
  const cl = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

  // wing outlines (the right wing in its own coordinates; the left is mirrored)
  const FW = [[4, -8], [13, -21], [25, -33], [41, -44], [58, -51], [74, -53], [84, -48], [87, -39], [84, -27], [78, -14], [69, -3], [57, 6], [42, 11], [26, 12], [12, 8], [5, 3]];
  const HW = [[4, -1], [16, 4], [30, 9], [44, 16], [55, 27], [58, 39], [52, 49], [40, 54], [27, 51], [16, 42], [8, 28], [3, 14]];
  const inset = (pts, k, cx, cy) => pts.map(([x, y]) => [cx + (x - cx) * k, cy + (y - cy) * k]);
  const PFW = A.poly(FW), PFWI = A.poly(inset(FW, 0.86, 20, -18)), PHW = A.poly(HW);
  const hs = (i, j) => { const x = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return x - Math.floor(x); };
  // the direction of the party (lower left), on screen
  const AIM = [-0.74, 0.67];

  const matCache = new Map();
  function mats(o) {
    const col = o.col || '#c8c0e0', col2 = o.col2 || '#9a8ab8', key = col + col2;
    if (matCache.has(key)) return matCache.get(key);
    const dark = K.rgb2hsl(...K.parse(col))[2] < 0.35; // a dark-winged moth (the Chart Moth): pale marks
    const sol = (c, a) => K.solid([...K.parse(c).slice(0, 3), a], { line: false });
    const M = {
      wing: K.mat(col, { n: 5, at: 3, step: 0.09 }),
      mar: K.mat(mixh(col, col2, 0.62), { n: 4, at: 2, step: 0.09 }),
      mark: K.mat(dark ? mixh(col2, '#ffffff', 0.25) : mixh(col2, '#3a3050', 0.4), { n: 3, at: 1, step: 0.1, line: false }),
      pale: K.solid(dark ? mixh(col2, '#ffffff', 0.55) : mixh(col, '#fffaf0', 0.7), { line: false }),
      hind: K.mat(col2, { n: 5, at: 3, step: 0.09 }),
      body: K.mat(mixh('#3a3050', col2, 0.18), { n: 5, at: 2, step: 0.085 }),
      fur: K.mat(mixh(col, '#fff4dc', 0.3), { n: 4, at: 2, step: 0.09 }),
      leg: K.mat(mixh('#2a2238', col2, 0.15), { n: 3, at: 1, step: 0.1 }),
      eye: K.mat('#f0e8ff', { n: 3, at: 1, step: 0.1, line: false }),
      ink: K.mat(null, { cols: ['#120e1c', '#1e1830', '#2c2440'], at: 1, line: false }),
      dust: {
        flour: [sol(mixh(col, '#fffaf0', 0.55), 235), sol(mixh(col, '#ffffff', 0.25), 175), sol(mixh(col, col2, 0.4), 120)],
        ash: [sol('#c8c0b8', 225), sol('#968e88', 175), sol('#605a58', 120)],
        frost: [sol('#f4faff', 235), sol('#c8e4f8', 180), sol('#96c4e8', 120)],
      },
    };
    matCache.set(key, M);
    if (matCache.size > 12) matCache.delete(matCache.keys().next().value);
    return M;
  }
  // a wavy line through points (moth markings)
  function wavy(L, pts, M, k, amp) {
    for (let i = 1; i < pts.length; i++) {
      const x0 = pts[i - 1][0], y0 = pts[i - 1][1], x1 = pts[i][0], y1 = pts[i][1];
      const n = Math.max(2, Math.round(Math.hypot(x1 - x0, y1 - y0) / 3));
      let px = x0, py = y0;
      for (let j = 1; j <= n; j++) {
        const u = j / n, w = j === n ? 0 : Math.sin((i * n + j) * 1.9) * (amp || 1);
        const x = x0 + (x1 - x0) * u + w, y = y0 + (y1 - y0) * u;
        L.line(px, py, x, y, M, k);
        px = x; py = y;
      }
    }
  }
  const VEINS = [[[38, -28], [64, -49]], [[39, -24], [79, -45]], [[40, -19], [83, -31]], [[40, -15], [77, -15]], [[36, -12], [65, -3]], [[30, -9], [51, 7]]];
  function forewing(L, M, lit) {
    // the darker marginal band, then the field: soft concentric light falling from the costa
    PFW.fill(L, M.mar, (x) => cl(0.35 + lit * 0.5 + x / 500));
    PFWI.fill(L, M.wing, (x, y) => cl(0.86 + lit - Math.hypot((x - 38) / 1.3, y + 34) / 62));
    // a lit costal edge just inside the leading edge
    for (let i = 1; i < 6; i++) L.line(FW[i - 1][0] + 2, FW[i - 1][1] + 2, FW[i][0] + 1, FW[i][1] + 2, M.wing, 4);
    // the discal cell and the veins leaving it (stopping short of the margin)
    L.line(14, -12, 38, -28, M.wing, 2); L.line(14, -7, 40, -14, M.wing, 2); L.line(38, -28, 40, -14, M.wing, 2);
    for (const [[x0, y0], [x1, y1]] of VEINS) L.line(x0, y0, x0 + (x1 - x0) * 0.9, y0 + (y1 - y0) * 0.9, M.wing, 2);
    L.line(8, 2, 40, 10, M.wing, 2);
    // antemedial and postmedial lines (the postmedial edged pale outside), pale subterminal dashes
    wavy(L, [[25, -32], [28, -18], [24, -4], [22, 9]], M.mark, 1, 0.8);
    wavy(L, [[60, -50], [66, -35], [64, -20], [57, -6], [47, 8]], M.mark, 0, 1);
    wavy(L, [[62, -50], [68, -35], [66, -20], [59, -6], [49, 8]], M.pale, 0, 1);
    for (const [x, y, x2, y2] of [[76, -45, 79, -40], [80, -32, 81, -27], [77, -19, 75, -14], [69, -8, 66, -4]]) L.line(x, y, x2, y2, M.pale, 0);
    // the eye-spot: a dark ring, a pale iris, a pupil in the hind-wing colour, its catch-light
    L.ell(46, -26, 9, 8, M.mar, 0);
    L.ell(46, -26, 6.5, 5.6, M.wing, 4);
    L.ell(47, -25, 3.6, 3.2, M.hind, 1);
    L.rect(44, -29, 2, 2, M.pale, 0);
  }
  function hindwing(L, M, lit) {
    // darker at the root, lighter toward the scalloped margin
    PHW.fill(L, M.hind, (x, y) => cl(0.22 + lit + Math.hypot(x - 4, y - 2) / 110 - Math.max(0, y - 36) / 90));
    for (const [x1, y1] of [[50, 22], [55, 37], [46, 50], [30, 50]]) L.line(7, 4, 7 + (x1 - 7) * 0.88, 4 + (y1 - 4) * 0.88, M.hind, 2);
    wavy(L, [[47, 19], [52, 32], [47, 44], [34, 47]], M.mark, 0, 0.7);
    L.ell(34, 31, 6, 5, M.hind, 4);
    L.ell(34, 31, 3, 2.4, M.body, 1);
    for (const [cx, cy] of [[57, 34], [53, 46], [42, 53], [30, 51]]) L.eraseEll(cx + 2.4, cy + 2.4, 3.1, 3.1);
  }
  // bipectinate antenna: a curved shaft, a comb of barbs on both sides leaning to the tip
  const SHAFT = [[3, -32], [6, -41], [11, -49], [18, -55], [25, -58], [31, -58]];
  function antenna(L, M, sweep) {
    L.save().translate(3, -32).rotate(sweep).translate(-3, 32);
    L.path(SHAFT, 2, M.body, 2);
    for (let i = 1; i < SHAFT.length; i++) {
      const ax = SHAFT[i - 1][0], ay = SHAFT[i - 1][1], dx = SHAFT[i][0] - ax, dy = SHAFT[i][1] - ay;
      const len = Math.hypot(dx, dy) || 1, ux = dx / len, uy = dy / len, nx = -uy, ny = ux;
      for (const tt of [0.3, 0.8]) {
        const px = ax + dx * tt, py = ay + dy * tt, b = Math.max(1.5, 4.4 - i * 0.6);
        L.line(px, py, px + nx * b + ux * b * 0.7, py + ny * b + uy * b * 0.7, M.body, 1);
        L.line(px, py, px - nx * b + ux * b * 0.7, py - ny * b + uy * b * 0.7, M.body, 3);
      }
    }
    L.restore();
  }
  // legs: tucked stubs under the thorax, or reaching toward the party on screen whatever the
  // body's lean (dir: the aim in this side's own coordinates)
  function legs(L, M, reach, grip, dir, s) {
    const r = cl(reach), g = cl(grip);
    for (let j = 0; j < 3; j++) {
      const hx = 6 - j, hy = -5 + j * 4, len = 30 - j * 5;
      const tx = hx + 7, ty = hy + 6;                       // tucked foot
      const fx = A.lerp(tx, hx + dir[0] * len, r), fy = A.lerp(ty, hy + dir[1] * len, r);
      // the knee bulges away from the body (up and outward)
      const kx = (hx + fx) / 2 + (-dir[1]) * 5 * r * (s < 0 ? 1 : -1) + 3 * (1 - r), ky = (hy + fy) / 2 + dir[0] * 5 * r * (s < 0 ? 1 : -1) - 1;
      L.path([[hx, hy], [kx, ky], [fx, fy]], 2, M.leg, j === 0 ? 2 : 1);
      if (r > 0.3) {
        const cx = dir[0] * 3, cy = dir[1] * 3;
        L.line(fx, fy, fx + cx - dir[1] * (2 - g * 2), fy + cy + dir[0] * (2 - g * 2), M.leg, 0);
        L.line(fx, fy, fx + cx + dir[1] * (2 - g * 2), fy + cy - dir[0] * (2 - g * 2), M.leg, 0);
      }
    }
  }
  function body(L, M, q) {
    // abdomen: six banded segments; the tip swings behind the body (follow-through)
    for (let i = 5; i >= 0; i--) {
      const x = q.abd * Math.pow(i / 5, 1.6), y = 6 + i * 6.4, r = 8.6 - i * 0.95;
      L.ell(x, y, r, 5, M.body, K.sphere(x, y, r, 5, { amb: 0.22 }));
      L.line(x - r + 2, y + 3, x + r - 2, y + 3, M.body, 0);
      L.line(x - r + 3, y - 3, x - 1, y - 3, M.fur, 1); // a band of pale hairs
    }
    L.ell(0, -8, 11, 12, M.body, K.sphere(0, -8, 11, 12, { amb: 0.2 }));
    // the fur collar: two rows of tufts, lit on their tips
    const fz = q.fur || 0;
    L.ell(0, -17 - fz, 13 + fz, 6 + fz, M.fur, K.sphere(0, -17 - fz, 13 + fz, 6 + fz, { amb: 0.3 }));
    for (let x = -12; x <= 10; x += 4) L.poly([[x, -14], [x + 4, -14], [x + 2, -9 + fz]], M.fur, (x + 12) % 8 ? 1 : 2);
    for (let x = -10; x <= 8; x += 4) L.poly([[x, -21 - fz], [x + 4, -21 - fz], [x + 2, -25 - fz * 2]], M.fur, 3);
    // head, palps
    L.ell(0, -27, 8.5, 7, M.body, K.sphere(0, -27, 8.5, 7, { amb: 0.24 }));
    L.rect(-3, -22, 2, 3, M.body, 1); L.rect(1, -22, 2, 3, M.body, 1);
  }
  function eyes(L, M, open, look) {
    const lx = look > 0.5 ? -1 : 0, ly = look > 0.5 ? 1 : 0;
    for (const s of [-1, 1]) {
      const ex = s * 5, ey = -28;
      if (open < 0.3) { L.line(ex - 2, ey + 1, ex + 2, ey + 1, M.eye, 2); L.line(ex - 2, ey, ex + 2, ey, M.body, 0); continue; }
      const ry = 3.2 * Math.max(0.5, open);
      L.ell(ex, ey, 3, ry, M.eye, K.sphere(ex, ey, 3, ry, { amb: 0.4 }));
      L.rect(Math.round(ex) - 1 + lx, Math.round(ey) - 1 + ly, 2, open < 0.8 ? 2 : 3, M.ink, 0);
    }
  }
  // powder (or ash, frost) shaken from the wing margins: soft clusters falling below them
  function dust(L, M, pts, amount, kind, seed) {
    const D = M.dust[kind] || M.dust.flour;
    const n = Math.round(amount * 9);
    pts.forEach(([x, y], k) => {
      for (let i = 0; i < n; i++) {
        const u = hs(seed + k * 13, i), v = hs(i * 7 + k, seed + 3);
        const px = x + (u - 0.5) * 14, py = y + 3 + v * 26 * amount;
        const r = 0.8 + hs(i, k + seed) * 1.6;
        L.ell(px, py, r, r * 0.8, D[i % 3], 0);
      }
      if (amount > 0.5) L.ell(x + (hs(k, seed) - 0.5) * 6, y + 10 * amount, 6 * amount, 4 * amount, D[2], 0);
    });
  }

  function rig(L, q, o, H, act, fi) {
    const M = mats(o);
    const hind = L.like(), fore = L.like(), lg = L.like(), bod = L.like();
    // the body leans by q.roll (+ toward the party) about the thorax
    const T = (Lr) => Lr.save().translate(q.x, q.y).translate(0, -6).rotate(-q.roll).translate(0, 6);
    const ca = Math.cos(q.roll), sa = Math.sin(q.roll);
    const aim = [AIM[0] * ca - AIM[1] * sa, AIM[0] * sa + AIM[1] * ca]; // the party's direction, in the leaning body
    const margin = [];
    for (const s of [-1, 1]) {
      const i = s < 0 ? 0 : 1, lit = s < 0 ? 0.08 : -0.04;
      const ang = S(q.wa, i), sy = S(q.wsy, i), sx = S(q.wsx, i);
      T(hind).scale(s * sx, 1).translate(6, 0).rotate(ang * 0.55 + S(q.hl, i)).scale(1, 0.94 + (sy - 0.94) * 0.5).translate(-6, 0);
      hindwing(hind, M, lit);
      hind.restore();
      T(fore).scale(s * sx, 1).translate(6, -4).rotate(ang).scale(1, sy).translate(-6, 4);
      forewing(fore, M, lit);
      if (q.dust > 0) for (const k of [7, 9, 11]) { const p = fore.fwd(FW[k][0], FW[k][1]); margin.push([p[0] - L.ox, p[1] - L.oy]); }
      fore.restore();
      T(bod).scale(s, 1); antenna(bod, M, S(q.ant, i)); bod.restore();
      T(lg).scale(s, 1); legs(lg, M, q.legs, q.grip, [aim[0] * s, aim[1]], s); lg.restore();
    }
    T(bod); body(bod, M, q); eyes(bod, M, q.eye, q.look); bod.restore();
    A.outline(hind); A.outline(fore); A.outline(lg); A.outline(bod);
    const out = hind.over(fore).over(lg).over(bod);
    if (q.dust > 0) { const dl = L.like(); dust(dl, M, margin, q.dust, q.dk || 'flour', (fi | 0) * 5 + (act ? act.length : 0)); out.over(dl); }
    return out;
  }

  // ---- poses ---------------------------------------------------------------------------------
  const base = { x: 0, y: 0, roll: 0, wa: 0, wsy: 1, wsx: 1, hl: 0, ant: 0, legs: 0, grip: 0, abd: 0, fur: 0, eye: 1, look: 0, dust: 0, dk: 'flour' };
  // idle: a wingbeat whose up- and down-strokes differ (the hind wings lag a beat), antennae and
  // abdomen following through; every second loop a short glide with the wings held high
  const idle = [
    { wa: 0.06, wsy: 1, hl: 0.04, abd: 0, ant: 0.02 },
    { wa: -0.08, wsy: 0.95, hl: 0.09, abd: 0.8, ant: 0.03, y: -1 },
    { wa: -0.26, wsy: 0.85, hl: 0.12, abd: 1.4, ant: 0.04, y: -1 },
    { wa: -0.44, wsy: 0.74, hl: 0.08, abd: 1.6, ant: 0.02, y: -2 },
    { wa: -0.52, wsy: 0.7, hl: -0.03, abd: 1, ant: -0.01, y: -2 },
    { wa: -0.3, wsy: 0.84, hl: -0.14, abd: -0.4, ant: -0.03, y: -1 },
    { wa: -0.06, wsy: 0.96, hl: -0.1, abd: -1.2, ant: -0.03, y: 0 },
    { wa: 0.1, wsy: 1, hl: -0.03, abd: -1, ant: -0.01, y: 1 },
    { wa: -0.22, wsy: 0.9, hl: -0.02, abd: 0.4, ant: 0.05, y: -1 },
    { wa: -0.2, wsy: 0.92, hl: 0.02, abd: 0.8, ant: 0.07, y: -1, roll: 0.02 },
  ];
  const poseTable = {
    // Strike: aim — wings draw back and up, the belly and legs turn to the target
    'prep.strike': [
      { wa: [-0.42, -0.3], wsy: [0.8, 0.84], roll: 0.08, ant: 0.12, legs: 0.15, y: -2, x: 1, abd: 1, look: 1 },
      { wa: [-0.78, -0.52], wsy: [0.64, 0.72], wsx: [0.92, 1], roll: 0.18, ant: 0.26, legs: 0.3, y: -4, x: 3, abd: 2, look: 1, fur: 1 },
      { wa: [-0.95, -0.62], wsy: [0.58, 0.68], wsx: [0.88, 1], roll: 0.26, ant: 0.36, legs: 0.42, y: -5, x: 4, abd: 3, look: 1, fur: 1 },
    ],
    // the arcing approach: a swept glide leaning into it, the legs reaching ahead; at the end the
    // wings flare up to brake as the legs strike
    'exec.strike': [
      { wa: [-0.72, -0.36], wsy: [0.56, 0.64], wsx: [0.84, 0.98], roll: 0.34, ant: 0.5, legs: 0.6, abd: 4, y: -3, look: 1 },
      { wa: [-0.5, -0.16], wsy: [0.5, 0.58], wsx: [0.82, 0.96], roll: 0.42, ant: 0.6, legs: 0.8, abd: 5, y: -2, look: 1 },
      { wa: [-0.2, 0.06], wsy: [0.78, 0.82], wsx: [0.86, 0.98], roll: 0.38, ant: 0.45, legs: 1, abd: 3, look: 1 },
      { wa: [-0.86, -0.56], wsy: [0.96, 0.98], wsx: [0.92, 1], roll: 0.3, ant: 0.2, legs: 1, grip: 0.5, abd: -1, x: -2, y: 1, look: 1 },
    ],
    // contact held: the wings come down around the target, legs gripping, the abdomen swings past
    'exec.impact': [
      { wa: [0.12, 0.28], wsy: [1, 1], wsx: [0.94, 1], roll: 0.28, ant: 0.06, legs: 1, grip: 1, abd: -4, x: -3, y: 2, fur: 1, look: 1 },
      { wa: [-0.2, -0.04], wsy: [0.96, 0.98], wsx: [0.96, 1], roll: 0.2, ant: 0.1, legs: 0.85, grip: 1, abd: -2, x: -1, y: 1, look: 1 },
    ],
    // softened: it meets the seal and is checked, then presses through
    'exec.push': [
      { wa: [-0.9, -0.62], wsy: [0.96, 1], wsx: [0.9, 1], roll: 0.04, ant: -0.12, legs: 0.75, grip: 0, abd: 2, x: 3, y: -1, fur: 1, eye: 0.6, look: 1 },
      { wa: [-0.1, 0.1], wsy: [0.94, 0.96], wsx: [0.9, 1], roll: 0.32, ant: 0.3, legs: 1, grip: 1, abd: -3, x: -3, y: 2, look: 1 },
    ],
    // met empty air (a companion's flourish): it overshoots and tumbles a little
    'exec.miss': [
      { wa: [0.3, -0.62], wsy: [0.9, 0.7], wsx: [0.82, 1], roll: 0.6, ant: 0.6, legs: 0.6, abd: 6, x: -4, y: 3, eye: 0.6 },
    ],
    // the wings arrest the motion (a full braking flare, the body pitched back), it beats home
    'recover.strike': [
      { wa: [-0.74, -0.76], wsy: [1, 1], roll: -0.04, legs: 0.5, ant: -0.12, abd: -3, y: -3, fur: 1 },
      { wa: [0.12, 0.08], wsy: [0.94, 0.96], roll: -0.06, legs: 0.25, abd: -1, y: -1 },
      { wa: [-0.34, -0.38], wsy: [0.78, 0.8], roll: -0.02, legs: 0.1, abd: 1, y: -1 },
      { wa: [-0.04, -0.06], wsy: [0.96, 0.97], legs: 0, abd: 0.5 },
    ],
    // into the hover again: two shallow beats that meet the idle loop
    'recover.hover': [
      { wa: -0.2, wsy: 0.9, abd: 0.4, y: -1 },
      { wa: 0.04, wsy: 1, abd: 0 },
    ],
    // a ward: it strikes the seal and is thrown back (head tipped away, antennae flung forward)
    'recover.deflect': [
      { wa: [-0.8, -0.74], wsy: [0.9, 0.96], wsx: [0.9, 1], roll: -0.26, ant: -0.34, legs: 0.6, grip: 0, abd: -6, x: 5, y: -5, fur: 1, eye: 0.4 },
      { wa: [-0.4, -0.46], wsy: [0.86, 0.9], roll: -0.16, ant: -0.2, legs: 0.4, abd: -4, x: 3, y: -3, eye: 0.7 },
      { wa: [0.08, 0.04], wsy: [0.96, 0.98], roll: -0.06, ant: -0.06, legs: 0.2, abd: -1, y: -1 },
      { wa: [-0.2, -0.22], wsy: [0.88, 0.9], roll: 0, legs: 0, abd: 0.5 },
    ],
    // Shroud: wings rise and meet high over the body
    'prep.shroud': [
      { wa: -0.42, wsy: 0.8, y: -2, abd: 1, ant: -0.04 },
      { wa: -0.76, wsy: 0.62, y: -5, abd: 2, ant: -0.12, fur: 1 },
      { wa: -0.98, wsy: 0.52, wsx: 0.96, y: -6, abd: 3, ant: -0.18, fur: 1 },
    ],
    // … clap down, and shake the powder from the margins (it falls over the knots)
    'cast.shroud': [
      { wa: 0.34, wsy: 1, y: -2, abd: -2, dust: 0.35, fur: 1 },
      { wa: 0.5, wsy: 1, y: 1, abd: -3, dust: 0.75 },
      { wa: [0.22, 0.16], wsy: 0.92, abd: 2, dust: 1, y: 0 },
      { wa: -0.26, wsy: 0.8, abd: -2, dust: 0.9, y: -1 },
      { wa: [0.3, 0.26], wsy: 0.98, abd: 2, dust: 1, y: 1 },
      { wa: 0, wsy: 0.95, abd: 0, dust: 0.6 },
    ],
    'recover.shroud': [
      { wa: -0.3, wsy: 0.84, dust: 0.35, abd: 1, y: -1 },
      { wa: 0.06, wsy: 0.98, dust: 0.15, abd: -1 },
      { wa: -0.22, wsy: 0.88, dust: 0.05, abd: 0.5, y: -1 },
      { wa: 0.02, wsy: 1 },
    ],
    // Gust (the Ash Moth): it rears, then one great fanning downstroke shakes ash at the party
    'prep.gust': [
      { wa: -0.6, wsy: 0.7, y: -4, roll: -0.06, abd: 3, ant: -0.1 },
      { wa: -1.0, wsy: 0.55, wsx: [0.94, 1], y: -7, roll: -0.12, abd: 5, ant: -0.2, fur: 1 },
    ],
    'exec.gust': [
      { wa: -0.4, wsy: 0.86, y: -5, roll: 0.06, abd: 3, dust: 0.3, dk: 'ash' },
      { wa: [0.36, 0.24], wsy: 1, wsx: [1, 0.94], y: -1, roll: 0.14, abd: -2, dust: 0.8, dk: 'ash' },
      { wa: [0.56, 0.44], wsy: 1, wsx: [1, 0.92], y: 1, roll: 0.16, abd: -4, dust: 0.6, dk: 'ash' },
      { wa: [0.4, 0.3], wsy: 0.98, y: 1, roll: 0.1, abd: -2, dust: 0.3, dk: 'ash' },
    ],
    'recover.gust': [
      { wa: -0.3, wsy: 0.82, y: -1, abd: 1, dust: 0.1, dk: 'ash' },
      { wa: 0.02, wsy: 0.98, y: 0 },
    ],
    // Sweep (the Chart Moth): a low, wide pass with the wings spread flat over both of you
    'prep.sweep': [
      { wa: -0.5, wsy: 0.72, y: -3, roll: 0.1, legs: 0.2, abd: -1 },
      { wa: -0.7, wsy: 0.64, wsx: [0.9, 1], y: -5, roll: 0.18, legs: 0.3, abd: -2, ant: 0.3 },
    ],
    'exec.sweep': [
      { wa: [0.06, 0.02], wsy: 1, wsx: [1.04, 1], roll: 0.2, legs: 0.5, ant: 0.5, abd: -4, y: 2 },
      { wa: [0.16, 0.1], wsy: 1, wsx: [1.04, 1], roll: 0.1, legs: 0.6, ant: 0.5, abd: -2, y: 3 },
      { wa: [0.12, 0.16], wsy: 1, wsx: [1, 1.02], roll: -0.04, legs: 0.6, ant: 0.45, abd: 2, y: 3 },
      { wa: [-0.2, -0.3], wsy: 0.9, roll: -0.1, legs: 0.4, ant: 0.3, abd: 4, y: 1 },
    ],
    'recover.sweep': [
      { wa: -0.6, wsy: 0.96, roll: -0.06, legs: 0.2, abd: 2, y: -2 },
      { wa: 0.08, wsy: 0.96, abd: 0 },
      { wa: -0.2, wsy: 0.9, abd: 0.5, y: -1 },
    ],
    // Gathering (Catalogue, Postmark): wings fold down over the body and tremble, gathering
    'prep.charge': [
      { wa: 0.3, wsy: 0.96, y: 1, abd: 0, ant: 0.1 },
      { wa: 0.62, wsy: 0.9, wsx: 0.92, y: 2, ant: 0.18, legs: 0.2 },
    ],
    'cast.charge': [
      { wa: 0.78, wsy: 0.86, wsx: 0.88, y: 2, ant: 0.2, legs: 0.25, fur: 1 },
      { wa: [0.82, 0.76], wsy: 0.84, wsx: 0.86, y: 3, ant: 0.24, legs: 0.25, fur: 1 },
      { wa: [0.76, 0.82], wsy: 0.84, wsx: 0.86, y: 2, ant: 0.2, legs: 0.25, fur: 1 },
      { wa: 0.84, wsy: 0.82, wsx: 0.86, y: 3, ant: 0.26, legs: 0.3, fur: 1, eye: 0.6 },
    ],
    'recover.charge': [
      { wa: 0.36, wsy: 0.94, y: 1, ant: 0.1, legs: 0.1 },
      { wa: -0.1, wsy: 0.96, y: 0 },
    ],
    // Chill (Catalogue): one fanning beat sends cold dust at the one it aims at
    'prep.chill': [
      { wa: -0.5, wsy: 0.74, roll: 0.08, y: -3, abd: -1, ant: 0.1 },
      { wa: -0.84, wsy: 0.6, wsx: [0.9, 1], roll: 0.14, y: -5, abd: -2, ant: 0.18 },
    ],
    'exec.chill': [
      { wa: [0.2, 0.06], wsy: 1, wsx: [0.92, 1], roll: 0.22, y: -2, abd: 2, dust: 0.6, dk: 'frost' },
      { wa: [0.48, 0.32], wsy: 1, wsx: [0.9, 1], roll: 0.24, y: 0, abd: 3, dust: 0.9, dk: 'frost' },
      { wa: [0.3, 0.2], wsy: 0.96, roll: 0.16, y: 0, abd: 1, dust: 0.4, dk: 'frost' },
    ],
    'recover.chill': [
      { wa: -0.3, wsy: 0.84, roll: 0.06, dust: 0.1, dk: 'frost' },
      { wa: 0.02, wsy: 0.98 },
    ],
    // Re-tying (the Chart Moth): it hovers low and its forelegs work the loose thread
    'cast.mend': [
      { wa: -0.2, wsy: 0.9, y: 3, roll: 0.06, legs: 0.6, grip: 0.2, ant: 0.1 },
      { wa: 0.06, wsy: 0.98, y: 4, roll: 0.08, legs: 0.8, grip: 0.8, ant: 0.14 },
      { wa: -0.24, wsy: 0.88, y: 3, roll: 0.06, legs: 0.7, grip: 0.3, ant: 0.1 },
      { wa: 0.04, wsy: 0.98, y: 4, roll: 0.08, legs: 0.85, grip: 1, ant: 0.12 },
    ],
    // Rest: it sinks and spreads its wings flat, antennae lowered
    rest: [
      { wa: 0.12, wsy: 1, y: 2, ant: 0.08, abd: 0.5 },
      { wa: 0.24, wsy: 1, y: 5, ant: 0.16, abd: 1 },
      { wa: 0.22, wsy: 1, y: 5, ant: 0.18, abd: 0.6, eye: 0.7 },
      { wa: 0.06, wsy: 1, y: 3, ant: 0.1, abd: 0 },
    ],
    // reactions to real outcomes
    recoil: [
      { wa: [-0.66, -0.52], wsy: [0.86, 0.9], roll: -0.24, ant: -0.3, abd: -5, x: 3, fur: 1, eye: 0.4 },
      { wa: [-0.24, -0.2], wsy: 0.92, roll: -0.1, ant: -0.1, abd: -2, x: 1, eye: 0.8 },
    ],
    // a knot loosens: a shiver runs through it and a little powder falls
    release: [
      { wa: -0.16, wsy: 0.88, dust: 0.25, abd: 1, fur: 1 },
      { wa: 0.14, wsy: 1, dust: 0.45, abd: -1.5, eye: 0.6 },
      { wa: -0.06, wsy: 0.95, dust: 0.15, abd: 0.5 },
    ],
    // interrupted: the move falters — the wings collapse unevenly, then it catches itself
    balk: [
      { wa: [-0.2, -0.62], wsy: [0.7, 0.8], roll: -0.16, ant: -0.22, legs: 0.2, abd: -3, eye: 0.5 },
      { wa: [0.26, 0.1], wsy: 0.94, roll: -0.08, ant: -0.1, abd: 2, eye: 0.7 },
      { wa: -0.1, wsy: 0.94, roll: -0.02, abd: 0 },
    ],
    // its name comes back: calm beats, and it rests open-winged, eyes closed
    settle: [
      { wa: -0.3, wsy: 0.86, ant: 0.04 },
      { wa: 0.06, wsy: 1, ant: 0.08, eye: 0.5 },
      { wa: 0, wsy: 1, ant: 0.1, eye: 0 },
    ],
  };
  A.family('moth', {
    spec: { w: 224, h: 192, ox: 112, oy: 100, ms: 105, seq: [0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 9, 8], bob: (t) => Math.sin(t / 520) * 4 },
    base, idle, poseTable, rig,
    recoil: { push: 5 },
    veil: (o) => ({ kind: 'flour', cols: [mixh(o.col || '#c8c0e0', '#fffaf0', 0.55), mixh(o.col || '#c8c0e0', '#ffffff', 0.2), mixh(o.col || '#c8c0e0', o.col2 || '#9a8ab8', 0.45)] }),
  });

  // ---- deliveries ----------------------------------------------------------------------------
  // The swoop (§18.2). peak: share of the way to the target's chest at contact; arc: lift (art px).
  A.deliver('moth', 'strike', (a) => {
    const c = A.kit(a), oc = A.outcome(a), to = a.aimed;
    if (c.rd) {
      // reduced motion: held key poses in place — aim, strike, recover — no travel
      c.F(0, 'prep', 300, 'strike@2').F(300, 'exec', 340, oc === 'ward' ? 'push@0' : 'strike@3');
      c.F(640, 'recover', 360, oc === 'ward' ? 'deflect@1' : 'strike@3');
      c.X(640, oc === 'ward' ? 'scaleShed' : 'scaleShed', 360, { to, seal: oc === 'ward' || oc === 'block' || oc === 'soft' });
      return c.done(640, 1000);
    }
    const peak = oc === 'ward' || oc === 'block' ? 0.54 : 0.6;
    const out = { to, peak, arc: 18, shape: 'out' };
    c.F(0, 'prep', 260, 'strike');
    c.F(260, 'exec', 380, 'strike', out);
    c.X(300, 'wingWake', 380, { to });
    if (oc === 'ward' || oc === 'block') {
      // the seal stops it: thrown back at once, then it beats home
      c.F(640, 'recover', 420, 'deflect', { to, peak, shape: 'back' });
      c.X(640, 'scaleShed', 420, { to, seal: true });
      c.F(1060, 'recover', 190, 'hover');
      return c.done(640, 1250);
    }
    if (oc === 'soft') {
      // checked by the seal, then pressing through to the smaller hit (shown 110 ms later)
      c.F(640, 'exec', 120, 'push', { to, peak, shape: 'hold' });
      c.X(640, 'scaleShed', 300, { to, seal: true });
    } else if (oc === 'miss') {
      c.F(640, 'exec', 120, 'miss', { to, peak, shape: 'hold' });
    } else {
      c.F(640, 'exec', 120, 'impact', { to, peak, shape: 'hold' });
      if (oc === 'hit') c.X(640, 'scaleShed', 360, { to });
    }
    c.F(760, 'recover', 390, 'strike', { to, peak, arc: -6, shape: 'back' });
    c.F(1150, 'recover', 100, 'hover');
    return c.done(640, 1250);
  });
  // Shroud (§18.4), 1,450 ms: the condition applies at 760 (the sequencer's beat)
  A.deliver('moth', 'shroud', (a) => {
    const c = A.kit(a);
    if (c.rd) {
      c.F(0, 'prep', 360, 'shroud@2').F(360, 'cast', 560, 'shroud@2');
      c.X(380, 'veilRelease', 700, {}).X(700, 'mistRoll', 560, {});
      c.F(920, 'recover', 420, 'shroud@3');
      return c.done(760, 1450);
    }
    c.F(0, 'prep', 300, 'shroud');
    c.F(300, 'cast', 460, 'shroud');
    c.X(330, 'veilRelease', 820, {});
    c.X(700, 'mistRoll', 560, {});
    c.F(760, 'recover', 690, 'shroud');
    return c.done(760, 1450);
  });
  // Gust (the Ash Moth), ~1,300 ms: it rears, then fans the party (wards torn, then the blow)
  A.deliver('moth', 'gust', (a) => {
    const c = A.kit(a);
    if (c.rd) { c.F(0, 'prep', 320, 'gust@1').F(320, 'exec', 440, 'gust@2').F(760, 'recover', 400, 'gust@1'); c.X(380, 'gust', 520, { col: '#c8c0b8' }); return c.done(600, 1200); }
    c.F(0, 'prep', 320, 'gust');
    c.F(320, 'exec', 440, 'gust', { to: 'party', peak: -0.04, shape: 'out' });
    c.X(380, 'gust', 600, { col: '#c8c0b8' });
    c.X(400, 'ashDrift', 700, {});
    c.F(760, 'recover', 440, 'gust', { to: 'party', peak: -0.04, shape: 'back' });
    return c.done(600, 1300);
  });
  // Sweep (the Chart Moth), ~1,300 ms: a wide low pass over both of you (first target at 620,
  // the second 120 ms later, placed by the sequencer)
  A.deliver('moth', 'sweep', (a) => {
    const c = A.kit(a);
    if (c.rd) { c.F(0, 'prep', 300, 'sweep@1').F(300, 'exec', 460, 'sweep@1').F(760, 'recover', 420, 'sweep@2'); c.X(320, 'arc', 600, { who: a.comp ? ['pc', 'comp'] : ['pc'], col: a.ctx.foeCol }); return c.done(620, 1200); }
    c.F(0, 'prep', 280, 'sweep');
    c.F(280, 'exec', 480, 'sweep', { to: 'party', peak: 0.48, arc: 10, shape: 'out' });
    c.X(330, 'arc', 600, { who: a.comp ? ['pc', 'comp'] : ['pc'], col: a.ctx.foeCol });
    c.F(760, 'recover', 440, 'sweep', { to: 'party', peak: 0.48, shape: 'back' });
    c.F(1200, 'recover', 100, 'hover');
    return c.done(620, 1300);
  });
  // Gathering, ~1,200 ms: wings folded and trembling while the motes draw in (applies at 760)
  A.deliver('moth', 'charge', (a) => {
    const c = A.kit(a);
    if (c.rd) { c.F(0, 'prep', 260, 'charge@1').F(260, 'cast', 640, 'charge@3').F(900, 'recover', 300, 'charge@0'); c.X(240, 'gather', 640, {}); return c.done(760, 1200); }
    c.F(0, 'prep', 260, 'charge');
    c.F(260, 'cast', 640, 'charge');
    c.X(240, 'gather', 640, {});
    c.F(900, 'recover', 300, 'charge');
    return c.done(760, 1200);
  });
  // Chill (the Catalogue Moth), ~1,150 ms: one fanning beat sends cold dust at its target
  A.deliver('moth', 'chill', (a) => {
    const c = A.kit(a), to = a.aimed;
    if (c.rd) { c.F(0, 'prep', 300, 'chill@1').F(300, 'exec', 320, 'chill@1').F(620, 'recover', 420, 'chill@1'); c.X(320, 'frostDust', 320, { to }); return c.done(600, 1100); }
    c.F(0, 'prep', 280, 'chill');
    c.F(280, 'exec', 340, 'chill', { to, peak: 0.12, shape: 'out' });
    c.X(320, 'frostDust', 330, { to, seal: A.outcome(a) === 'ward' || A.outcome(a) === 'block' });
    c.F(620, 'recover', 440, 'chill', { to, peak: 0.12, shape: 'back' });
    c.F(1060, 'recover', 90, 'hover');
    return c.done(600, 1150);
  });
  // Re-tying (the Chart Moth), ~1,200 ms: its forelegs work a loose knot tight again
  A.deliver('moth', 'mend', (a) => {
    const c = A.kit(a), fv = a.fv || {};
    const i = Math.min((fv.maxKnots || 1) - 1, fv.knots || 0);
    if (c.rd) { c.F(0, 'cast', 900, 'mend@3').F(900, 'recover', 300, 'hover@1'); c.X(240, 'mendThread', 600, { i }); return c.done(760, 1200); }
    c.F(0, 'prep', 240, 'charge');
    c.F(240, 'cast', 660, 'mend', { to: 'party', peak: -0.03, shape: 'out' });
    c.X(260, 'mendThread', 600, { i });
    c.F(900, 'recover', 300, 'hover', { to: 'party', peak: -0.03, shape: 'back' });
    return c.done(760, 1200);
  });

  A.auditFamily('moth', {
    anatomy: 'winged / hovering', frame: [224, 192], anchor: [112, 100], was: [188, 160],
    idle: '10 drawings, 20-entry sequence × 105 ms (wingbeat with distinct up/down strokes and a hind-wing lag; a held glide every other loop)',
    materials: 'wing membrane with scale fringe (chequered margin), costal highlight, veins, ante/postmedial lines, eye-spot; furred thorax tufts; banded abdomen; bipectinate antennae; jointed legs',
    moves: { strike: 'swoop (travel out/hold/back, arc 18)', shroud: 'wing clap, powder shaken from the margins', gust: 'rear and fanning downstroke (ash)', sweep: 'low wide pass', charge: 'wings folded, trembling', chill: 'fanning beat, frost dust', mend: 'forelegs knot the thread' },
    reactions: 'recoil (flung back, antennae forward), release (shiver, powder falls), balk (wings collapse unevenly), settle (open wings, eyes closed)',
    overlays: 'Shroud veil in its own powder (84a); Gathering motes; Heat pips (shared)',
  });
})();
