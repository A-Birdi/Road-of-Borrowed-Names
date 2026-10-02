/* Creatures A — the blot (Runoff Blot, Smoke Blot, Silence Blot, Runaway Ink, Blotted Line),
 * the crab (Label Crab, Rock-pool Crab) and the golem (Glass Golem, Icicle Warden, Ledger Heap,
 * Mossy Milestone, The Half-road Gatekeeper).
 *
 * Blot — fluid (§9.2: a clear origin, directional pressure and flow, residue): the dome leans
 * and gathers, a tendril of ink lashes out from its flank, the puddle surges; glossy ink with a
 * curved streak and cool sheen. Native 220 × 152, origin (128, 62), feet +30 (was 168 × 136):
 * room on the party's side for the tendril and the surge.
 * Crab — grounded organic (§9.2: visible foot contact, weight transfer, recovery without
 * sliding): legs step as it sidles, the near claw rises, thrusts and snaps; ridged shell, eye
 * stalks, cargo tags. Native 228 × 156, origin (124, 66), feet +26 (was 196 × 140).
 * Golem — large / constructed (§9.2: readable preparation at its scale, local motion): a
 * hammer blow wound up overhead, a planted step, the chest core brightening; dressed stones lit
 * on their bevels, lichen, cracks. Native 256 × 216, origin (136, 112) (was 164 × 180): its
 * arms rise overhead and reach out toward the party.
 * Pose parameters are listed beside each rig. */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const A = RB.creaturesA, K = RB.pxkit;
  const mixh = (a, b, k) => K.hex(K.mix(a, b, k));
  const cl = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const S = A.side;

  // =============================================================================================
  // BLOT — q: w squash (+ wider and lower), lean (+ toward the party, the top most), lift, sp
  // puddle spread, d drip phase, reach tendril (0 … 1), tdir its angle (0: out to the party at
  // chest height, + downward), splat (its tip bursting), eye, look, mouth (0 wavering … 1 open,
  // −1 pressed shut), rip (the edge rippling), dim (gloss)
  // =============================================================================================
  const LOBES = [[-46, 42, 20, 9], [44, 43, 22, 8], [-12, 47, 32, 9], [20, 39, 26, 11], [-30, 38, 20, 10], [58, 47, 8, 4], [-62, 47, 7, 3]];
  // The blot (the restyle): glossy ink in the reference's metal manner — a deep hue-shifted ramp
  // (near-black indigo to a cool violet sheen), the dome in crisp bands with a hard near-white
  // specular streak along its lit shoulder, a dark reflected band and a cool rim on its right edge;
  // its crown pulled into a curling crest that leans toward the party (a tapered extremity that
  // follows the lean); a three-quarter face; the puddle a separate form under it, its lobes lit on
  // their tops, in the dome's cast shadow; drips with a lit side.
  const blotMatCache = new Map();
  function blotMats(col, dim) {
    const dk = Math.round(cl(dim) * 4) / 4, key = col + '|' + dk;
    if (blotMatCache.has(key)) return blotMatCache.get(key);
    const M = {
      ink: A.hmat(col, { n: 6, at: 1, lo: 0.05, hi: 0.66, sat: 1.5, hd: 24, hl: 60, warm: 280, rim: mixh(col, '#b8c8ff', 0.6) }),
      gloss: K.solid(mixh(col, '#f2f4ff', 0.86 * dk), { line: false }),
      gloss2: K.solid(mixh(col, '#c0c8f4', 0.55 * dk), { line: false }),
      pale: A.hmat('#ece8fa', { n: 4, at: 2, lo: 0.5, hi: 0.99, line: false }),
      eye: K.mat(null, { cols: ['#08060e', '#141022', '#221c36'], at: 0, line: false }),
      shine: K.solid('#ffffff', { line: false }),
    };
    blotMatCache.set(key, M);
    if (blotMatCache.size > 16) blotMatCache.delete(blotMatCache.keys().next().value);
    return M;
  }
  function blotRig(L, q, o, H) {
    const col = o.col || '#241f3a';
    const M = blotMats(col, q.dim), Mi = M.ink;
    const w = q.w, P = L.like(), B = L.like();
    const sh = (y) => q.lean * -0.5 * (44 - y);          // shear: + lean leans the top toward the party (left)
    const rip = (y) => (q.rip ? Math.sin(y / 5 + q.d * 1.6) * q.rip : 0);
    // puddle lobes (spreading in a surge), lit along their tops
    for (const [x, y, rx, ry] of LOBES) {
      const xx = x * q.sp + (x > 0 ? w : -w) * 0.5 + (x < 0 ? q.lean * -6 : 0), rr = rx * (0.7 + 0.3 * q.sp);
      P.ell(xx, y, rr, ry, Mi, (px, py) => { const t = (py - (y - ry)) / (2 * ry); return (t < 0.28 ? (px < xx ? 3.5 : 2.5) : t < 0.6 ? 1.5 : 0.5) / 6; });
    }
    // the dome (squash, lean and lift) and its base widening into the puddle
    const rx = 38 + w, ry = 42 - w - q.lift * 0.5, cy = 2 + w - q.lift;
    const domeShade = A.ball(-4, cy - 8, rx + 4, ry + 4, { refl: 0.12, k: 1.15 });
    // a drop of ink: round below, drawn up into a point that leans with it (toward the party when
    // it rears, back when it recoils) — the crown's tip a little off-centre, toward the party
    const tipX = -6 - q.lean * 14, drop = (x, y) => {
      const b = (y - cy) / ry;
      if (b >= -0.15) { const a = (x - sh(y) - rip(y)) / rx; return a * a + b * b <= 1; }
      const t = (-b - 0.15) / 0.95, half = rx * Math.sqrt(Math.max(0, 1 - 0.0225)) * Math.pow(Math.max(0, 1 - t), 0.62);
      const c = sh(y) + rip(y) + tipX * t * t;
      return Math.abs(x - c) <= half && t < 1;
    };
    B.fill(-rx - 50, cy - ry - 4, rx + 50, cy + ry + 2, drop, Mi, (x, y) => domeShade(x - sh(y), y) * 0.86);
    B.fill(-rx - 50, 10, rx + 50, 44, (x, y) => Math.abs(x - sh(y) - rip(y)) <= rx * (0.86 + (y - 10) / 110) && y <= 44, Mi, (x, y) => Math.min(domeShade(x - sh(y), Math.min(y, cy + ry * 0.7)) * 0.86, (y > 30 ? 1.5 : 2.5) / 6));
    // drips on the flanks, with a drop falling
    for (const [side, y0, len, sd] of [[-1, 4, 18, 0], [1, 10, 14, 1], [-1, 20, 10, 2]]) {
      const x = side < 0 ? -rx + 6 + (sd === 2 ? 10 : 0) : rx - 8;
      const L2 = len + ((Math.floor(q.d) + sd) % 4), xs = x + sh(y0), dx = side < 0 ? -2 : 2;
      B.path([[xs, y0], [xs + dx, y0 + L2 * 0.6], [xs + dx, y0 + L2]], 5, Mi, (px) => (px < xs + dx - 0.5 ? 3.5 : 1.5) / 6);
      B.ell(xs + dx, y0 + L2 + 1, 3.5, 3.5, Mi, A.ball(xs + dx - 1, y0 + L2, 4, 4, { k: 1.2 }));
      const fall = ((q.d * 7 + sd * 11) % 28);
      if (fall < 22) B.ell(xs + dx * 1.5, y0 + L2 + 8 + fall, 2, 2.5, Mi, 2);
    }
    // the tendril: from the flank toward the party, tapering to a club that bursts at the tip
    if (q.reach > 0.02) {
      const fx = -rx + 8 + sh(2), fy = 4, ang = q.tdir, r = q.reach;
      const ux = -Math.cos(ang), uy = Math.sin(ang) - 0.25 * Math.cos(ang);
      const n = Math.hypot(ux, uy), dx = ux / n, dy = uy / n, len = 74 * r;
      const bend = Math.sin(r * Math.PI) * 10;
      const pts = [[fx, fy, 13], [fx + dx * len * 0.35, fy + dy * len * 0.35 - bend, 10], [fx + dx * len * 0.7, fy + dy * len * 0.7 - bend * 0.6, 7], [fx + dx * len, fy + dy * len, 5]];
      H.pipe(B, pts, 12, Mi, { collars: false });
      const tx = fx + dx * len, ty = fy + dy * len;
      B.ell(tx, ty, 5 + 3 * r, 4 + 3 * r, Mi, A.ball(tx - 1, ty - 2, 7, 6, { k: 1.2 }));
      if (q.splat > 0) for (let i = 0; i < 6; i++) { const a = -2.4 + i * 0.95; B.ell(tx + Math.cos(a) * (8 + 6 * q.splat), ty + Math.sin(a) * (6 + 5 * q.splat), 2.2, 2, Mi, 3); }
    }
    A.despeckle(B);
    A.rim(B, [Mi.id], { w: 2 });
    // gloss: a hard curved streak and its band on the lit shoulder, window glints, a cool sheen low right
    B.onto((b) => {
      const gy = -22 + w - q.lift;
      b.save().translate(-15 + sh(gy), gy).rotate(-0.7);
      b.ell(0, 1, 13, 4.5, Mi, 4);
      b.ell(-1, -0.5, 10, 2.2, M.gloss2, 0);
      b.ell(-2, -1, 6.5, 1.3, M.gloss, 0);
      b.restore();
      b.rect(-27 + sh(-8), -8 + w - q.lift, 3, 3, M.gloss, 0);
      b.rect(-6 + sh(-34), -34 + w - q.lift, 4, 2, M.gloss2, 0);
    });
    P.onto((b) => { b.ell(-44, 38, 7, 1.5, M.gloss2, 0); b.ell(50, 40, 5, 1.2, M.gloss2, 0); });
    // the three-quarter face: pale eyes turned toward the party (the far eye narrower), pupils
    // on the party, a wavering / open / shut mouth
    const ey = -6 + w - q.lift, lx = q.look > 0.5 ? -2 : 0;
    for (const [ex0, ew] of [[-17, 4.6], [6, 6.2]]) {
      const ex = ex0 + sh(ey);
      if (q.eye < 0.25) { B.line(ex - ew, ey + 1, ex + ew, ey + 1, M.pale, 2); continue; }
      const er = 8 * Math.max(0.35, q.eye);
      B.ell(ex, ey + (8 - er) * 0.5, ew, er, M.pale, (x, y) => (y > ey + er * 0.35 || x > ex + ew * 0.5 ? 1.5 : 3.5) / 4);
      B.ell(ex + 1 + lx, ey + 2 + (8 - er) * 0.4, ew * 0.5, Math.min(4, er * 0.5), M.eye, 0);
      if (ew > 5) B.rect(Math.round(ex - 3), Math.round(ey - er + 3), 2, 2, M.shine, 0);
    }
    const my = 12 + w - q.lift, mx = sh(my) + lx - 6;
    if (q.mouth > 0.3) B.ell(mx, my + 1, 5 + q.mouth * 3, 2 + q.mouth * 4, M.eye, 0);
    else if (q.mouth < -0.3) B.line(mx - 7, my + 1, mx + 7, my + 1, M.pale, 1);
    else { const mw = [[-8, 12], [-4, 14], [0, 12], [4, 14], [8, 12]]; for (let i = 1; i < mw.length; i++) B.line(mx + mw[i - 1][0], mw[i - 1][1] + w - q.lift + (Math.floor(q.d) % 2), mx + mw[i][0], mw[i][1] + w - q.lift, M.pale, 1); }
    A.cast(P, B, 3, 3, 1);
    A.outline(P); A.outline(B);
    return P.over(B);
  }
  const bBase = { w: 0, lean: 0, lift: 0, sp: 1, d: 0, reach: 0, tdir: 0, splat: 0, eye: 1, look: 0, mouth: 0, rip: 0, dim: 1 };
  const bIdle = [0, 1, 2, 3, 4, 5, 6, 7].map((f) => ({ w: [0, 1, 2, 1, 0, -1, -2, -1][f], d: f * 0.5, rip: f % 4 === 1 ? 0.6 : 0, look: 0.3 }));
  const bTable = {
    // Strike: it rears and leans back, then lashes a tendril of ink at its target
    'prep.strike': [
      { w: -3, lift: 3, lean: -0.12, eye: 0.8, look: 1, d: 1 },
      { w: -5, lift: 6, lean: -0.22, eye: 0.6, look: 1, mouth: -1, d: 2, reach: 0.1, tdir: -0.3 },
      { w: -6, lift: 7, lean: -0.26, eye: 0.55, look: 1, mouth: -1, d: 2.5, reach: 0.18, tdir: -0.4 },
    ],
    'exec.strike': [
      { w: -1, lift: 3, lean: 0.12, reach: 0.45, tdir: -0.15, look: 1, eye: 0.7, mouth: 0.5, d: 3 },
      { w: 2, lean: 0.24, reach: 0.85, tdir: 0, look: 1, eye: 0.7, mouth: 0.8, d: 3.5, sp: 1.05 },
      { w: 3, lean: 0.28, reach: 1, tdir: 0.05, look: 1, eye: 0.6, mouth: 0.8, d: 4, sp: 1.1, splat: 0.4 },
    ],
    'exec.impact': [
      { w: 4, lean: 0.26, reach: 1, tdir: 0.08, splat: 1, look: 1, eye: 0.6, mouth: 0.6, d: 4.5, sp: 1.1 },
      { w: 3, lean: 0.18, reach: 0.8, tdir: 0.12, splat: 0.6, look: 1, eye: 0.8, d: 5, sp: 1.05 },
    ],
    'exec.push': [
      { w: 5, lean: 0.06, reach: 0.7, tdir: -0.05, splat: 0.8, look: 1, eye: 0.4, mouth: -1, d: 4.5 },
      { w: 3, lean: 0.26, reach: 1, tdir: 0.05, splat: 0.5, look: 1, eye: 0.6, mouth: 0.6, d: 5 },
    ],
    'exec.miss': [{ w: 2, lean: 0.34, reach: 1, tdir: 0.2, splat: 0.3, eye: 0.6, mouth: 0.4, d: 4.5, sp: 1.15 }],
    'recover.strike': [
      { w: 1, lean: 0.08, reach: 0.5, tdir: 0.2, d: 5.5, eye: 0.9, rip: 1 },
      { w: -1, lean: -0.04, reach: 0.15, tdir: 0.3, d: 6, rip: 0.8 },
      { w: 0, lean: 0, d: 6.5, rip: 0.4 },
    ],
    'recover.hover': [{ w: 0.5, d: 7, rip: 0.3 }],
    'recover.deflect': [
      { w: 6, lean: -0.24, reach: 0.4, tdir: -0.5, splat: 1, eye: 0.3, mouth: 0.5, rip: 1.5, d: 5 },
      { w: 2, lean: -0.1, reach: 0.15, tdir: -0.3, eye: 0.7, rip: 1, d: 5.5 },
      { w: 0, lean: 0, rip: 0.5, d: 6 },
    ],
    // Sweep: it gathers, then surges flat across the ground in a wave toward both of you
    'prep.sweep': [
      { w: -3, lift: 3, sp: 0.85, eye: 0.8, look: 1, d: 1, rip: 0.6 },
      { w: -5, lift: 5, sp: 0.75, eye: 0.6, look: 1, mouth: -1, d: 2, rip: 1 },
    ],
    'exec.sweep': [
      { w: 4, lean: 0.2, sp: 1.3, look: 1, mouth: 0.6, d: 3, rip: 1.6 },
      { w: 8, lean: 0.26, sp: 1.6, look: 1, mouth: 0.8, d: 3.5, rip: 2 },
      { w: 9, lean: 0.2, sp: 1.7, look: 1, mouth: 0.6, d: 4, rip: 1.8 },
      { w: 7, lean: 0.1, sp: 1.5, look: 1, mouth: 0.3, d: 4.5, rip: 1.4 },
    ],
    'recover.sweep': [
      { w: 4, lean: 0.04, sp: 1.25, d: 5, rip: 1 },
      { w: 1, sp: 1.05, d: 5.5, rip: 0.5 },
    ],
    // Re-tying: a strand of it reaches down to the loose knot and draws it tight
    'prep.mend': [
      { w: -2, lift: 2, eye: 0.7, d: 1, reach: 0.15, tdir: 0.9 },
      { w: -3, lift: 3, eye: 0.6, d: 1.5, reach: 0.3, tdir: 1 },
    ],
    'cast.mend': [
      { w: -1, lift: 2, eye: 0.5, d: 2, reach: 0.5, tdir: 1.05, mouth: -1 },
      { w: 0, lift: 1, eye: 0.5, d: 2.5, reach: 0.6, tdir: 1.1, mouth: -1 },
      { w: -1, lift: 2, eye: 0.6, d: 3, reach: 0.55, tdir: 1, mouth: -1 },
      { w: 1, lift: 0, eye: 0.7, d: 3.5, reach: 0.35, tdir: 0.9 },
    ],
    'recover.mend': [
      { w: 1, d: 4, reach: 0.15, tdir: 0.8, rip: 0.6 },
      { w: 0, d: 4.5, rip: 0.3 },
    ],
    // Silence (the Silence Blot): it draws in, presses its mouth shut and flattens — a hush spreads
    'prep.silence': [
      { w: -3, lift: 3, eye: 0.6, mouth: -1, d: 1, dim: 0.8 },
      { w: -4, lift: 4, eye: 0.3, mouth: -1, d: 1.5, dim: 0.7 },
    ],
    'cast.silence': [
      { w: 4, sp: 1.2, eye: 0, mouth: -1, d: 2, dim: 0.6, rip: 1 },
      { w: 7, sp: 1.35, eye: 0, mouth: -1, d: 2.5, dim: 0.5, rip: 1.4 },
      { w: 6, sp: 1.3, eye: 0.3, mouth: -1, d: 3, dim: 0.55, rip: 1 },
      { w: 4, sp: 1.2, eye: 0.5, mouth: -1, d: 3.5, dim: 0.65, rip: 0.6 },
    ],
    'recover.silence': [
      { w: 2, sp: 1.1, eye: 0.7, d: 4, dim: 0.8 },
      { w: 0, d: 4.5 },
    ],
    rest: [
      { w: 3, sp: 1.1, eye: 0.5, d: 0.5, rip: 0.4 },
      { w: 5, sp: 1.2, eye: 0.25, d: 1, mouth: -1 },
      { w: 5, sp: 1.2, eye: 0.2, d: 1.5, mouth: -1 },
      { w: 3, sp: 1.1, eye: 0.5, d: 2, rip: 0.4 },
    ],
    recoil: [
      { w: 5, lean: -0.3, sp: 1.15, eye: 0.3, mouth: 0.6, rip: 2, d: 1 },
      { w: 2, lean: -0.12, eye: 0.7, rip: 1.2, d: 1.5 },
    ],
    // a knot loosens: a shiver, a drop falls free, the gloss catches the light
    release: [
      { w: -2, lift: 2, rip: 1.5, eye: 1, d: 2, dim: 1.2 },
      { w: 2, rip: 1, eye: 0.7, d: 3 },
      { w: 0, rip: 0.4, d: 4 },
    ],
    // interrupted: the dome slumps and its eyes droop
    balk: [
      { w: 6, lean: -0.1, sp: 1.15, eye: 0.4, mouth: 0.4, rip: 1.4, d: 1 },
      { w: 4, sp: 1.08, eye: 0.6, rip: 0.8, d: 1.5 },
      { w: 1, eye: 0.85, rip: 0.3, d: 2 },
    ],
    settle: [
      { w: 2, eye: 0.6, rip: 0.6, d: 1 },
      { w: 3, eye: 0.3, sp: 1.05, d: 2 },
      { w: 4, eye: 0, sp: 1.1, mouth: -1, d: 3 },
    ],
  };
  A.family('blot', {
    spec: { w: 220, h: 168, ox: 128, oy: 78, dy: 30, ms: 160 },
    base: bBase, idle: bIdle, poseTable: bTable, rig: blotRig, recoil: { push: 3 },
  });
  // Strike: rears, lashes a tendril; contact 560, ~1,050 ms
  A.deliver('blot', 'strike', (a) => {
    const c = A.kit(a), oc = A.outcome(a), to = a.aimed;
    if (c.rd) { c.F(0, 'prep', 280, 'strike@2').F(280, 'exec', 280, 'strike@2').F(560, 'recover', 440, oc === 'ward' || oc === 'block' ? 'deflect@0' : 'strike@0'); c.X(560, 'inkLash', 300, { to }); return c.done(560, 1050); }
    const peak = 0.2;
    c.F(0, 'prep', 280, 'strike');
    c.F(280, 'exec', 280, 'strike', { to, peak, shape: 'out' });
    c.X(400, 'inkLash', 340, { to, seal: oc === 'ward' || oc === 'block' || oc === 'soft' });
    if (oc === 'ward' || oc === 'block') { c.F(560, 'recover', 420, 'deflect', { to, peak, shape: 'back' }); c.F(980, 'recover', 70, 'hover'); return c.done(560, 1050); }
    c.F(560, 'exec', 120, oc === 'soft' ? 'push' : oc === 'miss' ? 'miss' : 'impact', { to, peak, shape: 'hold' });
    c.F(680, 'recover', 300, 'strike', { to, peak, shape: 'back' });
    c.F(980, 'recover', 70, 'hover');
    return c.done(560, 1050);
  });
  // Sweep: gathers, surges as a wave along the ground under both; contact 600, ~1,150 ms
  A.deliver('blot', 'sweep', (a) => {
    const c = A.kit(a), who = a.comp ? ['pc', 'comp'] : ['pc'];
    if (c.rd) { c.F(0, 'prep', 300, 'sweep@1').F(300, 'exec', 460, 'sweep@2').F(760, 'recover', 340, 'sweep@0'); c.X(360, 'inkWave', 520, { who }); return c.done(600, 1150); }
    c.F(0, 'prep', 300, 'sweep');
    c.F(300, 'exec', 460, 'sweep', { to: 'party', peak: 0.22, shape: 'out' });
    c.X(330, 'inkWave', 560, { who });
    c.F(760, 'recover', 390, 'sweep', { to: 'party', peak: 0.22, shape: 'back' });
    return c.done(600, 1150);
  });
  // Re-tying: a strand reaches down and the knot is pulled tight at 760
  A.deliver('blot', 'mend', (a) => {
    const c = A.kit(a), fv = a.fv || {}, i = Math.min((fv.maxKnots || 1) - 1, fv.knots || 0);
    if (c.rd) { c.F(0, 'cast', 900, 'mend@1').F(900, 'recover', 300, 'mend@1'); c.X(220, 'mendThread', 620, { i }); return c.done(760, 1200); }
    c.F(0, 'prep', 220, 'mend').F(220, 'cast', 680, 'mend').F(900, 'recover', 300, 'mend');
    c.X(220, 'mendThread', 620, { i });
    return c.done(760, 1200);
  });
  // Silence (the Silence Blot): presses shut and flattens; the hush reaches you at 700
  A.deliver('blot', 'silence', (a) => {
    const c = A.kit(a);
    if (c.rd) { c.F(0, 'prep', 300, 'silence@1').F(300, 'cast', 600, 'silence@1').F(900, 'recover', 250, 'silence@0'); c.X(340, 'hushWave', 520, {}); return c.done(700, 1150); }
    c.F(0, 'prep', 300, 'silence').F(300, 'cast', 600, 'silence').F(900, 'recover', 250, 'silence');
    c.X(360, 'hushWave', 520, {});
    c.X(320, 'inkWave', 520, { who: [], hush: true });
    return c.done(700, 1150);
  });
  A.auditFamily('blot', {
    anatomy: 'fluid (ink)', frame: [220, 152], anchor: [128, 62], was: [168, 136],
    idle: '8 drawings × 160 ms (a breathing squash, drips running and a drop falling, the edge rippling)',
    materials: 'glossy ink: stepped dome shading, a curved gloss streak and glints, a cool low sheen, lobed puddle',
    moves: { strike: 'rears back, lashes a tendril that bursts at its tip', sweep: 'surges flat as a wave along the ground', mend: 'a strand reaches down to the knot', silence: 'presses shut and flattens; a hush spreads' },
    reactions: 'recoil (splashes back), release (shiver, gloss flash), balk (slumps), settle (smooth, eyes closed)',
    overlays: 'Heat pips; Gathering motes',
  });

  // =============================================================================================
  // CRAB — q: bx, by body offset (by + is a crouch), tilt (+ toward the party), lp leg phase
  // (stepping), cN / cF claws { up (raise, rad), out (reach 0 … 1), open (0 … 1) } as arrays
  // [near, far], eyes (stalk lean, + back), eo (eyes open), tags (flutter)
  // =============================================================================================
  // The crab (the restyle): seen three-quarter from the party's side — the near half of the shell
  // (screen left) fuller and lower, the near claw larger and in front of the shell, the far claw and
  // the far legs smaller, a step darker and behind it; glossy chitin in crisp bands (a lit shoulder,
  // a near-white glint, a core shadow, a cool rim on the right), a carapace rim lit along its edge,
  // bumps and pits as clusters, segmented legs lit along their tops with dark claw tips, heavy
  // chelae with a lit ridge, toothed fingers and pale tips; paper tags with a folded corner.
  const crabMatCache = new Map();
  function crabMats(col) {
    if (crabMatCache.has(col)) return crabMatCache.get(col);
    const so = { n: 6, at: 3, lo: 0.1, hi: 0.9, sat: 1.25, hd: 30, hl: 30 };
    const M = {
      shell: A.hmat(col, Object.assign({ rim: mixh(col, '#c8e0ff', 0.55) }, so)),
      far: A.hmat(mixh(col, '#3a2a40', 0.22), Object.assign({}, so, { hi: so.hi - 0.12 })),
      belly: A.hmat(mixh(col, '#f6e8d0', 0.55), { n: 5, at: 3, lo: 0.3, hi: 0.96, sat: 1.1, hd: 40, hl: 14 }),
      tag: A.hmat('#efe6d2', { n: 5, at: 3, lo: 0.36, hi: 0.98, sat: 1, hd: 50, hl: 12 }),
      string: K.solid('#7a5a3a', { line: false }),
      ink: K.mat(null, { cols: ['#0a0812', '#1a1424', '#2e2638'], at: 0, line: false }),
      shine: K.solid('#fffaf2', { line: false }),
      tip: A.hmat(mixh(col, '#2a1820', 0.6), { n: 4, at: 1, lo: 0.08, hi: 0.5 }),
    };
    crabMatCache.set(col, M);
    if (crabMatCache.size > 12) crabMatCache.delete(crabMatCache.keys().next().value);
    return M;
  }
  function crabRig(L, q, o, H) {
    const M = crabMats(o.col || '#c86a4a');
    const legF = L.like(), clawF = L.like(), legN = L.like(), B = L.like(), clawN = L.like();
    const T = (Lr) => Lr.save().translate(q.bx, q.by).translate(0, 20).rotate(-q.tilt).translate(0, -20);
    // legs: the feet stay planted on the ground line (they do not ride the body's lean), the knees
    // follow the body; a stepping phase lifts alternate feet. Near legs (left) heavier, far ones
    // thinner and darker; each segment lit along its top, a dark claw tip at the foot
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) {
      const near = s < 0, Lr = near ? legN : legF, Ml = near ? M.shell : M.far, wd = near ? 7 : 5.5;
      const up = Math.max(0, Math.sin(q.lp + i * 2.1 + (s > 0 ? 1.05 : 0))) * 4;
      const hip = [s * (near ? 30 : 24) + q.bx, 20 + i * 6 + q.by - (near ? 0 : 3)];
      const kx = s * ((near ? 52 : 44) + i * 5) + q.bx * 0.7, ky = 8 + i * 9 - up + q.by * 0.6 - (s < 0 ? q.tilt * 10 : -q.tilt * 10) - (near ? 0 : 4);
      const fx = s * ((near ? 62 : 52) + i * 4) + q.bx * 0.35 + Math.sin(q.lp + i) * 2, fy = 46 + i * 3 - up - (near ? 0 : 3);
      Lr.path([[hip[0], hip[1], wd], [kx, ky, wd], [fx, fy, wd * 0.55]], wd, Ml, (x, y) => { const t = (y - Math.min(ky, hip[1])) / 14; return (t < 0.25 ? 4.5 : t < 0.6 ? 3.5 : 2.5) / 6; });
      Lr.line(hip[0], hip[1] - wd / 2 + 1, kx, ky - wd / 2 + 1, Ml, 5);
      Lr.rect(kx - 2, ky - 3, 4, 2, Ml, 5);
      Lr.path([[fx - s * 1, fy - 3, 3], [fx + s * 1, fy + 2, 1.5]], 3, M.tip, 1);
    }
    // shell: three-quarter — the near (left) half fuller and lower, the far half turned away
    T(B);
    const sx = (x) => (x < 0 ? x * 1.06 : x * 0.9);
    const inShell = (x, y, rx, ry, cy) => { const xx = x < 0 ? x / 1.06 : x / 0.9, a = xx / rx, b = (y - cy - (x < 0 ? -x * 0.02 : x * 0.04)) / ry; return a * a + b * b <= 1; };
    B.fill(-52, -12, 48, 44, (x, y) => inShell(x, y, 46, 26, 16), M.belly, (x, y) => ((y < 22 ? 3.5 : 2.5) + (x < -10 ? 1 : 0)) / 5);
    const shade = A.ball(-14, -2, 54, 32, { refl: 0.12, k: 1.1 });
    B.fill(-52, -18, 48, 38, (x, y) => inShell(x, y, 45, 25, 10), M.shell, shade);
    // the carapace rim: a lit lip along its front edge, the belly's shadow under it
    B.fill(-52, 10, 48, 38, (x, y) => { const xx = x < 0 ? x / 1.06 : x / 0.9, e = (xx / 45) ** 2 + ((y - 10 - (x < 0 ? -x * 0.02 : x * 0.04)) / 25) ** 2; return e <= 1 && e > 0.8 && y > 17; }, M.shell, (x) => (x < -24 ? 5.5 : x < 2 ? 4.5 : x < 24 ? 3.5 : 2.5) / 6);
    // bumps (lit top-left, shadow under) and a few pits
    for (const [x, y] of [[-26, -4], [-14, -10], [2, -12], [16, -8], [28, 0], [-34, 6], [-8, 2]]) {
      const X = sx(x);
      B.rect(X, y, 4, 3, M.shell, 4); B.rect(X + 1, y, 2, 1, M.shell, 5); B.rect(X + 1, y + 3, 4, 1, M.shell, 1);
    }
    for (const [x, y] of [[-20, 8], [10, 4], [22, 10]]) B.rect(sx(x), y, 2, 1, M.shell, 1);
    // a glint on the lit shoulder
    B.rect(-30, -6, 3, 2, M.shine, 0); B.dot(-26, -8, M.shine, 0);
    // eye stalks (leaning back when startled, forward when it aims): the near one taller
    for (const s of [-1, 1]) {
      const near = s < 0, lean = q.eyes * 6, sc = near ? 1.08 : 0.88;
      const bx = s * (near ? 10 : 7), top = -30 * sc + Math.abs(lean) * 0.3;
      B.path([[bx, -10], [bx + s * 3 + lean * 0.5, -22 * sc + Math.abs(lean) * 0.2], [bx + s * 4 + lean, top + 2]], 4, near ? M.shell : M.far, (x) => (x < bx + lean * 0.5 ? 4.5 : 2.5) / 6);
      const ex = bx + s * 4 + lean, ey = top, er = near ? 5.4 : 4.2;
      if (q.eo < 0.3) B.rect(ex - er, ey, er * 2, 2, M.ink, 1);
      else { B.ell(ex, ey, er, er * Math.max(0.5, q.eo), M.ink, (x, y) => (x + y < ex + ey ? 1.5 : 0.5) / 3); B.rect(Math.round(ex - er * 0.55), Math.round(ey - er * 0.6), 2, 2, M.shine, 0); }
    }
    // cargo tags on the shell, each with a string, a folded corner and unreadable lines (they flutter)
    for (const [x, y, r] of [[-20, 2, -0.2], [10, -2, 0.16]]) {
      B.save().translate(sx(x), y).rotate(r + q.tags * (x < 0 ? -0.2 : 0.25));
      A.stone(B, [[-8, -5], [8, -5], [10, 0], [8, 5], [-8, 5]], M.tag, { bevel: 2, face: 3 });
      B.poly([[-8, 5], [-8, 1], [-4, 5]], M.tag, 1);
      B.ell(6, 0, 1.5, 1.5, M.shell, 1);
      B.line(-5, -2, 2, -2, M.ink, 2); B.line(-5, 1, 0, 1, M.ink, 2);
      B.line(7, 0, 12, -6, M.string, 0);
      B.restore();
    }
    B.path([[-8, 26], [4, 26]], 2, M.ink, 1);
    B.restore();
    // claws: a bent arm from the shoulder (raised, reaching), a heavy palm with a lit ridge, two
    // fingers with teeth on their inner edges and pale tips. The near claw larger and in front
    for (const s of [-1, 1]) {
      const i = s < 0 ? 0 : 1, near = s < 0, up = S(q.cup, i), out = S(q.cout, i), open = S(q.copen, i);
      const Lr = near ? clawN : clawF, Mc = near ? M.shell : M.far, k = near ? 1.12 : 0.84;
      const sh = s * (near ? 34 : 28);
      T(Lr).translate(sh, 8).rotate(s * -up).translate(-sh, -8);
      const ex = s * ((near ? 52 : 44) + out * 22), ey = 4 - out * 6, hx = s * ((near ? 57 : 47) + out * 30), hy = -10 - out * 4;
      Lr.path([[sh, 8, 9 * k], [ex, ey, 9 * k], [hx, hy, 8 * k]], 9 * k, Mc, (x, y) => (y < Math.min(ey, hy) + 2 ? 4.5 : y < Math.max(ey, hy) ? 3.5 : 2.5) / 6);
      Lr.save().translate(hx - s * 2, hy - 14).scale(s * k, k).rotate(-0.5 + S(q.cw, i));
      Lr.ell(0, 0, 16, 12, Mc, A.ball(-4, -4, 18, 14, { k: 1.2 }));
      Lr.line(-12, -7, 8, -11, Mc, 5); Lr.line(-10, -6, 6, -9, Mc, 4);
      for (const [bx, by] of [[-6, 2], [2, -2], [6, 5]]) { Lr.rect(bx, by, 2, 2, Mc, 4); Lr.dot(bx + 1, by + 2, Mc, 1); }
      Lr.save().translate(10, -5).rotate(-open * 0.6);
      Lr.poly([[0, -5], [14, -10], [26, -9], [30, -5], [20, -3], [4, 4]], Mc, (x, y) => (y < -6 ? 4.5 : y < -3 ? 3.5 : 2.5) / 6);
      for (let t = 6; t < 22; t += 4) Lr.dot(t, -3 + (t > 14 ? -1 : 0), Mc, 1);
      Lr.poly([[24, -9], [30, -5], [27, -4], [22, -6]], M.tip, 3);
      Lr.restore();
      Lr.save().translate(10, 5).rotate(open * 0.42);
      Lr.poly([[0, -4], [16, -3], [24, 0], [18, 4], [2, 5]], Mc, (x, y) => (y < -1 ? 3.5 : 1.5) / 6);
      for (let t = 5; t < 18; t += 4) Lr.dot(t, -3, Mc, 4);
      Lr.poly([[18, -2], [24, 0], [20, 3]], M.tip, 3);
      Lr.restore();
      Lr.restore();
      Lr.restore();
    }
    A.despeckle(B);
    A.rim(B, [M.shell.id]); A.rim(clawN, [M.shell.id]);
    A.cast(legF, B, 2, 3, 1); A.cast(clawF, B, 2, 3, 1); A.cast(B, clawN, 3, 3, 1); A.cast(legN, B, 2, 3, 1);
    for (const Lr of [legF, clawF, legN, B, clawN]) A.outline(Lr);
    return legF.over(clawF).over(legN).over(B).over(clawN);
  }
  const cBase = { bx: 0, by: 0, tilt: 0, lp: 0, cup: [0, 0], cout: [0, 0], copen: [0.06, 0.06], cw: [0, 0], eyes: 0, eo: 1, tags: 0 };
  const cIdle = [0, 1, 2, 3, 4, 5].map((f) => ({ by: [0, 1, 1, 0, -1, -1][f], lp: (f / 6) * Math.PI * 2 * 0.5, copen: [[0.42, 0.06], [0.42, 0.06], [0.06, 0.06], [0.06, 0.42], [0.06, 0.42], [0.06, 0.06]][f], cup: [[0, 0.04], [0.04, 0], [0.06, 0], [0.04, 0.04], [0, 0.06], [0, 0.04]][f], eyes: [0, 0.2, 0.3, 0.1, -0.2, -0.2][f], tags: [0, 0.4, 0.2, 0, -0.3, -0.2][f] }));
  const cTable = {
    // Strike: a crouch, the near claw rising wide open; it sidles in and the claw thrusts and snaps
    'prep.strike': [
      { by: 2, tilt: 0.04, cup: [0.4, 0.2], copen: [0.6, 0.2], eyes: -0.3, lp: 0.4 },
      { by: 4, tilt: 0.08, cup: [0.8, 0.3], copen: [1, 0.3], cout: [0.1, 0], eyes: -0.5, lp: 0.8 },
      { by: 5, tilt: 0.1, cup: [0.95, 0.35], copen: [1, 0.3], cout: [0.15, 0], eyes: -0.6, lp: 1.1 },
    ],
    'exec.strike': [
      { by: 2, tilt: 0.12, cup: [0.9, 0.3], copen: [1, 0.2], cout: [0.3, 0], eyes: -0.6, lp: 1.8 },
      { by: 0, tilt: 0.14, cup: [0.6, 0.25], copen: [1, 0.2], cout: [0.6, 0], cw: [0.3, 0], eyes: -0.6, lp: 2.8 },
      { by: 1, tilt: 0.16, cup: [0.3, 0.2], copen: [0.9, 0.2], cout: [0.95, 0.1], cw: [0.65, 0], eyes: -0.5, lp: 3.8 },
      { by: 2, tilt: 0.16, cup: [0.2, 0.2], copen: [0.1, 0.2], cout: [1, 0.1], cw: [0.8, 0], eyes: -0.5, lp: 4.4 },
    ],
    'exec.impact': [
      { by: 3, tilt: 0.18, cup: [0.15, 0.25], copen: [0, 0.3], cout: [1, 0.1], cw: [0.85, 0], eyes: -0.4, lp: 4.6, tags: 0.6 },
      { by: 2, tilt: 0.12, cup: [0.25, 0.2], copen: [0.2, 0.2], cout: [0.8, 0.05], cw: [0.6, 0], eyes: -0.2, lp: 4.8, tags: 0.3 },
    ],
    'exec.push': [
      { by: 1, tilt: 0.02, cup: [0.5, 0.3], copen: [0.6, 0.3], cout: [0.7, 0], eyes: 0.4, eo: 0.6, lp: 4.4, tags: 0.5 },
      { by: 3, tilt: 0.16, cup: [0.2, 0.2], copen: [0, 0.2], cout: [1, 0.1], cw: [0.8, 0], eyes: -0.4, lp: 4.6 },
    ],
    'exec.miss': [{ by: 3, tilt: 0.22, cup: [0.05, 0.2], copen: [0, 0.3], cout: [1, 0.2], cw: [0.95, 0], eyes: 0.3, eo: 0.6, lp: 4.6 }],
    'recover.strike': [
      { by: 1, tilt: 0.06, cup: [0.4, 0.2], copen: [0.3, 0.1], cout: [0.5, 0], cw: [0.4, 0], lp: 5.4 },
      { by: 0, tilt: 0.02, cup: [0.2, 0.1], copen: [0.2, 0.06], cout: [0.2, 0], cw: [0.15, 0], lp: 6.2 },
      { by: 0, cup: [0.05, 0.04], copen: [0.1, 0.06], lp: 7 },
    ],
    'recover.hover': [{ by: 0, lp: 7.6, copen: [0.3, 0.06] }],
    'recover.deflect': [
      { by: -2, tilt: -0.14, cup: [0.9, 0.5], copen: [0.8, 0.5], cout: [0.2, 0], eyes: 0.7, eo: 0.5, lp: 5, tags: 0.8 },
      { by: 0, tilt: -0.06, cup: [0.5, 0.3], copen: [0.4, 0.2], eyes: 0.3, eo: 0.8, lp: 5.6 },
      { by: 0, cup: [0.1, 0.05], copen: [0.1, 0.06], lp: 6.4 },
    ],
    // Flood (the Rock-pool Crab): both claws high, then brought down hard — the pool washes over you
    'prep.flood': [
      { by: 3, cup: [0.8, 0.8], copen: [0.6, 0.6], eyes: -0.2, lp: 0.4 },
      { by: -2, cup: [1.2, 1.2], copen: [1, 1], cout: [0.2, 0.2], eyes: -0.4, lp: 0.8, tags: 0.5 },
    ],
    'exec.flood': [
      { by: 0, cup: [0.6, 0.6], copen: [0.8, 0.8], cout: [0.3, 0.3], eyes: -0.4, lp: 1.2 },
      { by: 5, tilt: 0.06, cup: [-0.2, -0.2], copen: [0.2, 0.2], cout: [0.4, 0.4], eyes: -0.3, lp: 1.6, tags: 0.6 },
      { by: 5, tilt: 0.06, cup: [-0.25, -0.25], copen: [0.3, 0.3], cout: [0.4, 0.4], eyes: -0.2, lp: 1.8, tags: 0.3 },
    ],
    'recover.flood': [
      { by: 2, cup: [0.1, 0.1], copen: [0.2, 0.2], cout: [0.2, 0.2], lp: 2.4 },
      { by: 0, lp: 3, copen: [0.1, 0.1] },
    ],
    // Re-tying (the Label Crab): its claws snip and tuck the loose cord in front of it
    'prep.mend': [
      { by: 3, cup: [-0.1, -0.1], copen: [0.6, 0.5], cout: [0.3, 0.3], eyes: -0.4, lp: 0.4 },
      { by: 4, cup: [-0.2, -0.2], copen: [0.8, 0.6], cout: [0.4, 0.4], eyes: -0.5, lp: 0.6 },
    ],
    'cast.mend': [
      { by: 4, cup: [-0.25, -0.15], copen: [0, 0.8], cout: [0.5, 0.4], eyes: -0.5, lp: 0.8 },
      { by: 4, cup: [-0.15, -0.25], copen: [0.8, 0], cout: [0.45, 0.5], eyes: -0.5, lp: 1 },
      { by: 4, cup: [-0.25, -0.15], copen: [0, 0.8], cout: [0.5, 0.4], eyes: -0.5, lp: 1.2 },
      { by: 3, cup: [-0.15, -0.2], copen: [0.1, 0.1], cout: [0.4, 0.45], eyes: -0.4, lp: 1.4 },
    ],
    'recover.mend': [
      { by: 2, cup: [0, 0], copen: [0.3, 0.3], cout: [0.2, 0.2], lp: 1.8 },
      { by: 0, lp: 2.2 },
    ],
    rest: [
      { by: 4, cup: [-0.1, -0.1], copen: [0.05, 0.05], eo: 0.6, eyes: 0.2, lp: 0 },
      { by: 6, cup: [-0.2, -0.2], copen: [0, 0], eo: 0.25, eyes: 0.3, lp: 0 },
      { by: 6, cup: [-0.2, -0.2], copen: [0.1, 0], eo: 0.25, eyes: 0.3, lp: 0 },
      { by: 4, cup: [-0.1, -0.1], copen: [0.05, 0.05], eo: 0.6, eyes: 0.2, lp: 0 },
    ],
    recoil: [
      { by: -3, tilt: -0.16, cup: [0.9, 0.7], copen: [0.9, 0.7], eyes: 0.8, eo: 0.4, tags: 0.8, lp: 1 },
      { by: -1, tilt: -0.06, cup: [0.4, 0.3], copen: [0.4, 0.3], eyes: 0.4, eo: 0.8, tags: 0.3, lp: 1.4 },
    ],
    // a knot loosens: the tags flutter loose and a claw opens in surprise
    release: [
      { by: -1, cup: [0.3, 0.1], copen: [0.9, 0.1], eyes: 0.4, eo: 1, tags: 1, lp: 0.5 },
      { by: 0, cup: [0.1, 0.1], copen: [0.4, 0.2], eyes: 0.2, tags: -0.6, lp: 0.8 },
      { by: 0, copen: [0.1, 0.06], tags: 0.2, lp: 1 },
    ],
    // interrupted: its raised claw drops, the legs splay, it steadies
    balk: [
      { by: 5, tilt: -0.08, cup: [-0.3, 0.1], copen: [0.5, 0.2], eyes: 0.5, eo: 0.6, lp: 2.4 },
      { by: 3, tilt: -0.04, cup: [-0.1, 0], copen: [0.2, 0.1], eyes: 0.2, eo: 0.8, lp: 2 },
      { by: 1, cup: [0, 0], copen: [0.1, 0.06], lp: 1.6 },
    ],
    settle: [
      { by: 2, cup: [0, 0], copen: [0.3, 0.3], eo: 0.7 },
      { by: 4, cup: [-0.15, -0.15], copen: [0.1, 0.1], eo: 0.4 },
      { by: 5, cup: [-0.2, -0.2], copen: [0, 0], eo: 0 },
    ],
  };
  A.family('crab', {
    spec: { w: 244, h: 180, ox: 140, oy: 90, dy: 26, ms: 170 },
    base: cBase, idle: cIdle, poseTable: cTable, rig: crabRig, recoil: { push: 3 },
  });
  // Strike: crouch, near claw up; sidles in on its legs (no arc: along the ground), thrusts and
  // snaps shut at contact (600); backs off — ~1,150 ms
  A.deliver('crab', 'strike', (a) => {
    const c = A.kit(a), oc = A.outcome(a), to = a.aimed;
    if (c.rd) { c.F(0, 'prep', 300, 'strike@2').F(300, 'exec', 300, 'strike@3').F(600, 'recover', 500, oc === 'ward' || oc === 'block' ? 'deflect@0' : 'strike@0'); c.X(600, 'clawSnap', 320, { to }); return c.done(600, 1150); }
    const peak = oc === 'ward' || oc === 'block' ? 0.3 : 0.36;
    c.F(0, 'prep', 300, 'strike');
    c.F(300, 'exec', 300, 'strike', { to, peak, shape: 'out' });
    c.X(585, 'clawSnap', 320, { to, seal: oc === 'ward' || oc === 'block' || oc === 'soft' });
    if (oc === 'ward' || oc === 'block') { c.F(600, 'recover', 480, 'deflect', { to, peak, shape: 'back' }); c.F(1080, 'recover', 70, 'hover'); return c.done(600, 1150); }
    c.F(600, 'exec', 120, oc === 'soft' ? 'push' : oc === 'miss' ? 'miss' : 'impact', { to, peak, shape: 'hold' });
    c.F(720, 'recover', 360, 'strike', { to, peak, shape: 'back' });
    c.F(1080, 'recover', 70, 'hover');
    return c.done(600, 1150);
  });
  // Flood (the Rock-pool Crab): claws high, brought down — a wash over both; contact 620
  A.deliver('crab', 'flood', (a) => {
    const c = A.kit(a), who = a.comp ? ['pc', 'comp'] : ['pc'];
    if (c.rd) { c.F(0, 'prep', 320, 'flood@1').F(320, 'exec', 400, 'flood@2').F(720, 'recover', 430, 'flood@1'); c.X(420, 'tideWash', 560, { who }); return c.done(620, 1150); }
    c.F(0, 'prep', 320, 'flood').F(320, 'exec', 400, 'flood').F(720, 'recover', 430, 'flood');
    c.X(420, 'tideWash', 600, { who });
    return c.done(620, 1150);
  });
  // Re-tying (the Label Crab): snip and tuck; tied at 760
  A.deliver('crab', 'mend', (a) => {
    const c = A.kit(a), fv = a.fv || {}, i = Math.min((fv.maxKnots || 1) - 1, fv.knots || 0);
    if (c.rd) { c.F(0, 'cast', 900, 'mend@3').F(900, 'recover', 300, 'mend@1'); c.X(220, 'mendThread', 620, { i }); return c.done(760, 1200); }
    c.F(0, 'prep', 220, 'mend').F(220, 'cast', 680, 'mend').F(900, 'recover', 300, 'mend');
    c.X(220, 'mendThread', 620, { i });
    return c.done(760, 1200);
  });
  A.auditFamily('crab', {
    anatomy: 'grounded organic', frame: [228, 156], anchor: [124, 66], was: [196, 140],
    idle: '6 drawings × 170 ms (claws opening in turn, eye stalks swaying, tags stirring, a shuffle)',
    materials: 'ridged shell lit as a dome with a pale rim, jointed legs, heavy palms and fingers, paper tags',
    moves: { strike: 'crouch, near claw up; sidle in (legs stepping, feet on the ground), thrust and snap', flood: 'claws raised high, slammed down; a wash over both', mend: 'claws snip and tuck the cord' },
    reactions: 'recoil (tipped back, claws up), release (tags flutter loose), balk (claw drops, legs splay), settle (claws lowered, eyes shut)',
    overlays: 'Heat pips; Gathering motes',
  });

  // =============================================================================================
  // GOLEM — q: lean (+ toward the party, about the hips), crouch (0 … 1), step (near foot forward),
  // aN / aF arm swing at the shoulder (rad, − raised forward/up), eN / eF elbow bend, core
  // (chest glow 0 … 1.5), eye (slit glow), tilt (head), wet (water from its cracks), frost, kneel
  // =============================================================================================
  function golemRig(L, q, o, H) {
    const col = o.col || '#8fb8b0', coreC = o.core || '#f0a060';
    const M = K.mat(col, { n: 5, at: 2, step: 0.1, shift: 1.2 });
    const Md = K.mat(K.tone(col, -1.5), { n: 5, at: 2, step: 0.09 });
    const moss = K.mat(mixh(K.tone(col, -0.5), '#7f9a3e', 0.5), { n: 3, at: 1, step: 0.09, line: false });
    const Mc = K.mat(coreC, { n: 4, at: 2, step: 0.12, line: false });
    const back = L.like(), mid = L.like(), front = L.like(), glow = L.like();
    const St = (Lr, x, y, w, h, Mx, o2) => {
      const c = (o2 && o2.c) || 5;
      const j = (k) => ((K.hh(x + 50, y + 50, k) % 5) - 2);
      A.stone(Lr, [[x + c, y + j(1)], [x + w - c + j(2), y], [x + w, y + c], [x + w + j(3) * 0.5, y + h - c], [x + w - c, y + h], [x + c + j(4), y + h + j(5) * 0.5], [x, y + h - c], [x + j(6) * 0.5, y + c]], Mx, Object.assign({ bevel: 4 }, o2));
      const n = Math.floor((w * h) / 600);
      for (let i = 0; i < n; i++) {
        const px = x + 8 + (K.hh(x, y, 20 + i) % Math.max(1, w - 16)), py = y + 8 + (K.hh(x, y, 40 + i) % Math.max(1, h - 16));
        K.cluster(Lr, px, py, 4 + (K.hh(x, y, 60 + i) % 4), Mx, (i % 3) ? 1 : 3, K.hh(x, y, 80 + i));
      }
      return Lr;
    };
    const cr = q.crouch * 10 + q.kneel * 18;
    // legs: planted; the near one steps forward (and kneels)
    const legN = [-30 - q.step * 8, 50 + cr * 0.4], legF = [6, 50 + cr * 0.4];
    if (q.kneel > 0.5) { St(back, -36, 64, 30, 20, Md); St(back, 4, 54 + cr * 0.3, 24, 20, Md); St(back, 2, 70, 28, 14, Md); }
    else {
      St(back, legN[0], legN[1], 24, 20 - cr * 0.3, Md); St(back, legN[0] - 2, 66, 28, 18, Md);
      St(back, legF[0], legF[1], 24, 20 - cr * 0.3, Md); St(back, legF[0] - 2, 66, 28, 18, Md);
    }
    // the upper body leans about the hips (and sinks with a crouch)
    const T = (Lr) => Lr.save().translate(0, cr).translate(0, 50).rotate(-q.lean).translate(0, -50);
    // arms: pauldron, upper arm, fist — swung about the shoulder, bent at the elbow
    for (const s of [-1, 1]) {
      const i = s < 0 ? 0 : 1, sw = S(s < 0 ? q.aN : q.aF, 0), el = s < 0 ? q.eN : q.eF;
      const Lr = s < 0 ? front : back, px = s * 46, py = -4;
      T(Lr).translate(px, py).rotate(s * -sw).translate(-px, -py);
      St(Lr, px + (s < 0 ? -18 : -6), 10, 24, 30, Md, { c: 4 });
      Lr.save().translate(px + s * 2, 38).rotate(s * el).translate(-(px + s * 2), -38);
      St(Lr, px + (s < 0 ? -20 : -8), 38, 28, 24, M, { c: 6 });
      Lr.line(px + (s < 0 ? -13 : -1), 48, px + (s < 0 ? -13 : -1), 56, M, 0); Lr.line(px + (s < 0 ? -6 : 6), 48, px + (s < 0 ? -6 : 6), 56, M, 0);
      if (q.frost > 0 && s < 0) for (let k = 0; k < 4; k++) Lr.poly([[px - 16 + k * 6, 62], [px - 13 + k * 6, 62 + 6 + (k % 2) * 4 * q.frost], [px - 10 + k * 6, 62]], K.mat('#e8f6ff', { n: 3, at: 2, step: 0.1 }), 2);
      Lr.restore();
      St(Lr, px + (s < 0 ? -22 : -6), -20, 28, 34, M, { c: 8 });
      Lr.restore();
      void i;
    }
    // torso and head
    T(mid);
    St(mid, -26, 22, 52, 32, Md, { c: 7 });
    St(mid, -38, -22, 76, 50, M, { c: 10, bevel: 5 });
    mid.save().translate(0, -40).rotate(-q.tilt).translate(0, 40);
    St(mid, -21, -60, 42, 38, M, { c: 11, bevel: 5 });
    mid.rect(-18, -40, 36, 9, Md, 0); // eye slit
    mid.rect(-18, -41, 36, 1, M, 1);
    mid.rect(-17, -31, 34, 1, M, 3);
    for (const s of [-1, 1]) { mid.rect(s * 8 - 4, -37, 8, 3, Mc, 1 + Math.round(q.eye * 2)); mid.rect(s * 8 - 3, -37, 4, 1, Mc, Math.min(3, 2 + Math.round(q.eye))); }
    mid.restore();
    for (const c2 of [[[-30, -6], [-22, 0], [-25, 10]], [[26, 2], [31, 10], [28, 18]], [[8, -58], [4, -50], [7, -46]]]) {
      for (let k = 1; k < c2.length; k++) { mid.line(c2[k - 1][0], c2[k - 1][1], c2[k][0], c2[k][1], M, 0); mid.line(c2[k - 1][0] + 1, c2[k - 1][1] + 1, c2[k][0] + 1, c2[k][1] + 1, M, 3); }
    }
    for (const [x, y, sz] of [[-26, -20, 9], [-12, -21, 5], [22, -20, 6], [-12, -58, 8], [10, -59, 5], [-20, 24, 6]]) K.cluster(mid, x, y, sz, moss, 1, K.hh(x + 99, y + 99, 3));
    mid.ell(0, 2, 12, 12, Md, 0);
    mid.ell(0, 2, 9, 9, Mc, (x, y) => K.clamp(0.25 + q.core * 0.35 + (-(x + y - 2) / 28), 0, 0.99));
    mid.rect(-3, -3, 3, 3, K.solid(mixh(coreC, '#ffffff', 0.7), { line: false }), 0);
    // water running from its cracks (the Ledger Heap's Flood)
    if (q.wet > 0) {
      const W = K.mat('#6aa8d8', { n: 4, at: 2, step: 0.1, alpha: 220 });
      for (const [x, y] of [[-25, 10], [28, 18], [7, -46]]) mid.path([[x, y], [x + (x < 0 ? -3 : 3), y + 10 * q.wet], [x + (x < 0 ? -4 : 4), y + 22 * q.wet]], 3, W, 2);
    }
    mid.restore();
    A.outline(back); A.outline(mid); A.outline(front);
    const gr = 20 + q.core * 6;
    H.glow(glow, Math.round(-q.lean * 40), 2 + cr, gr, gr, coreC, Math.min(0.5, 0.18 + q.core * 0.16), 3);
    if (q.eye > 0.6) H.glow(glow, Math.round(-q.lean * 80), -36 + cr, 24, 6, coreC, 0.12 + q.eye * 0.08, 2);
    return back.over(mid).over(front).over(glow);
  }
  const gBase = { lean: 0, crouch: 0, step: 0, aN: 0, aF: 0, eN: 0, eF: 0, core: 0.5, eye: 0.5, tilt: 0, wet: 0, frost: 0, kneel: 0 };
  const gIdle = [0, 1, 2, 3, 4, 5].map((f) => ({ core: 0.4 + 0.25 * Math.sin((f / 6) * Math.PI * 2), aN: [0, 0.02, 0.03, 0.02, 0, -0.01][f], aF: [0, -0.01, 0, 0.02, 0.03, 0.02][f], crouch: [0, 0.05, 0.1, 0.05, 0, 0][f], tilt: [0, 0, 0.02, 0.02, 0, -0.02][f], eye: 0.5 + (f === 3 ? 0.2 : 0) }));
  const gTable = {
    // Strike: the near arm wound up overhead, the body leaning back onto its far leg …
    'prep.strike': [
      { lean: -0.04, aN: 1.2, eN: 0.4, aF: -0.1, crouch: 0.1, eye: 0.8, core: 0.7, tilt: -0.04 },
      { lean: -0.1, aN: 2.5, eN: 0.9, aF: -0.2, crouch: 0.15, eye: 1, core: 0.9, tilt: -0.08 },
      { lean: -0.12, aN: 3.1, eN: 1.1, aF: -0.25, crouch: 0.2, eye: 1, core: 1, tilt: -0.1 },
    ],
    // … then a planted step and the hammer blow down onto its target
    'exec.strike': [
      { lean: 0.02, aN: 2.5, eN: 0.6, aF: -0.2, step: 0.5, crouch: 0.15, eye: 1, core: 1 },
      { lean: 0.14, aN: 1.4, eN: 0.2, aF: 0.1, step: 1, crouch: 0.3, eye: 1, core: 1, tilt: 0.06 },
      { lean: 0.22, aN: 0.7, eN: 0, aF: 0.2, step: 1, crouch: 0.45, eye: 1, core: 1, tilt: 0.1 },
    ],
    'exec.impact': [
      { lean: 0.24, aN: 0.5, eN: 0, aF: 0.25, step: 1, crouch: 0.55, eye: 1, core: 1.1, tilt: 0.12 },
      { lean: 0.18, aN: 0.6, eN: 0.1, aF: 0.2, step: 1, crouch: 0.45, eye: 0.9, core: 0.9, tilt: 0.08 },
    ],
    'exec.push': [
      { lean: 0.06, aN: 1.0, eN: 0.3, aF: 0.1, step: 1, crouch: 0.3, eye: 0.7, core: 0.8, tilt: -0.04 },
      { lean: 0.2, aN: 0.5, eN: 0, aF: 0.2, step: 1, crouch: 0.5, eye: 1, core: 1, tilt: 0.1 },
    ],
    'exec.miss': [{ lean: 0.28, aN: 0.2, eN: 0, aF: 0.3, step: 1, crouch: 0.6, eye: 0.6, core: 0.8, tilt: 0.16 }],
    'recover.strike': [
      { lean: 0.12, aN: 0.6, eN: 0.2, aF: 0.1, step: 0.8, crouch: 0.35, eye: 0.8 },
      { lean: 0.04, aN: 0.3, eN: 0.1, step: 0.4, crouch: 0.2, eye: 0.7 },
      { lean: 0, aN: 0.1, step: 0, crouch: 0.05, eye: 0.6 },
    ],
    'recover.hover': [{ crouch: 0.02, eye: 0.55 }],
    'recover.deflect': [
      { lean: -0.12, aN: 1.4, eN: 0.6, aF: -0.2, step: 0.6, crouch: 0.1, eye: 0.4, core: 0.6, tilt: -0.12 },
      { lean: -0.06, aN: 0.8, eN: 0.3, step: 0.3, crouch: 0.1, eye: 0.6, tilt: -0.06 },
      { lean: 0, aN: 0.2, step: 0, eye: 0.6 },
    ],
    // Gathering: arms drawn in about the chest, sinking low while the core brightens
    'prep.charge': [
      { aN: 0.4, eN: 0.9, aF: 0.4, eF: 0.9, crouch: 0.2, core: 0.8, eye: 0.6 },
      { aN: 0.6, eN: 1.4, aF: 0.6, eF: 1.4, crouch: 0.35, core: 1, eye: 0.7 },
    ],
    'cast.charge': [
      { aN: 0.65, eN: 1.6, aF: 0.65, eF: 1.6, crouch: 0.45, core: 1.2, eye: 0.8 },
      { aN: 0.7, eN: 1.65, aF: 0.68, eF: 1.6, crouch: 0.5, core: 1.4, eye: 0.9 },
      { aN: 0.68, eN: 1.6, aF: 0.7, eF: 1.65, crouch: 0.5, core: 1.5, eye: 1 },
      { aN: 0.66, eN: 1.6, aF: 0.66, eF: 1.6, crouch: 0.48, core: 1.5, eye: 1 },
    ],
    'recover.charge': [
      { aN: 0.3, eN: 0.8, aF: 0.3, eF: 0.8, crouch: 0.25, core: 1.2, eye: 0.8 },
      { aN: 0.05, eN: 0.2, aF: 0.05, eF: 0.2, crouch: 0.05, core: 1, eye: 0.7 },
    ],
    // Chill (the Icicle Warden): the core flares white and its near fist, rimed, thrusts at one target
    'prep.chill': [
      { lean: -0.06, aN: 0.5, eN: 1.2, crouch: 0.15, core: 1.2, eye: 1, frost: 0.4 },
      { lean: -0.1, aN: 0.7, eN: 1.5, crouch: 0.2, core: 1.5, eye: 1, frost: 0.8 },
    ],
    'exec.chill': [
      { lean: 0.08, aN: 1.4, eN: 0.2, step: 0.6, crouch: 0.2, core: 1.5, eye: 1, frost: 1 },
      { lean: 0.14, aN: 1.55, eN: 0, step: 1, crouch: 0.25, core: 1.3, eye: 1, frost: 1 },
      { lean: 0.12, aN: 1.5, eN: 0.05, step: 1, crouch: 0.25, core: 1.1, eye: 0.9, frost: 0.8 },
    ],
    'recover.chill': [
      { lean: 0.04, aN: 0.6, eN: 0.3, step: 0.5, crouch: 0.1, core: 0.8, frost: 0.4 },
      { aN: 0.1, step: 0, core: 0.6, frost: 0.1 },
    ],
    // Flood (the Ledger Heap): its cracks open, arms flung wide — the water pours across both of you
    'prep.flood': [
      { aN: 0.8, aF: 0.8, eN: 0.3, eF: 0.3, crouch: 0.2, wet: 0.3, eye: 0.8 },
      { aN: 1.5, aF: 1.5, eN: 0.4, eF: 0.4, crouch: 0.1, wet: 0.6, eye: 1, lean: -0.05 },
    ],
    'exec.flood': [
      { aN: 2.3, aF: 2.3, eN: 0.2, eF: 0.2, wet: 1, eye: 1, lean: 0.05 },
      { aN: 2.0, aF: 2.0, eN: 0.1, eF: 0.1, wet: 1, eye: 1, lean: 0.1, crouch: 0.15 },
      { aN: 1.4, aF: 1.4, eN: 0.2, eF: 0.2, wet: 0.8, eye: 0.9, lean: 0.06, crouch: 0.2 },
    ],
    'recover.flood': [
      { aN: 0.6, aF: 0.6, wet: 0.5, eye: 0.7, crouch: 0.1 },
      { wet: 0.2, eye: 0.6 },
    ],
    // Re-tying: it lifts a fallen stone and presses it back into place on its chest
    'prep.mend': [
      { aN: 0.3, eN: 0.6, crouch: 0.35, lean: 0.06, eye: 0.6 },
      { aN: 0.1, eN: 0.3, crouch: 0.5, lean: 0.1, eye: 0.6 },
    ],
    'cast.mend': [
      { aN: 0.8, eN: 1.2, crouch: 0.3, lean: 0.04, eye: 0.7, core: 0.7 },
      { aN: 1.1, eN: 1.6, crouch: 0.2, eye: 0.7, core: 0.8 },
      { aN: 0.9, eN: 1.8, crouch: 0.15, eye: 0.8, core: 1 },
      { aN: 0.7, eN: 1.7, crouch: 0.1, eye: 0.8, core: 1.1 },
    ],
    'recover.mend': [
      { aN: 0.3, eN: 0.6, core: 0.8 },
      { aN: 0.05, eN: 0.1, core: 0.6 },
    ],
    // Plea (the Gatekeeper): it kneels and holds out an open hand, its core dimmed
    'prep.plea': [
      { crouch: 0.4, lean: 0.06, tilt: 0.06, core: 0.35, eye: 0.4 },
      { kneel: 1, lean: 0.1, tilt: 0.1, core: 0.25, eye: 0.35 },
    ],
    'cast.plea': [
      { kneel: 1, lean: 0.12, aN: 1.2, eN: 0.4, tilt: 0.12, core: 0.25, eye: 0.4 },
      { kneel: 1, lean: 0.12, aN: 1.35, eN: 0.25, tilt: 0.14, core: 0.3, eye: 0.45 },
      { kneel: 1, lean: 0.12, aN: 1.3, eN: 0.3, tilt: 0.12, core: 0.3, eye: 0.4 },
    ],
    'recover.plea': [
      { crouch: 0.5, lean: 0.06, aN: 0.5, eN: 0.3, tilt: 0.06, core: 0.4 },
      { crouch: 0.1, aN: 0.1, core: 0.5 },
    ],
    rest: [
      { crouch: 0.2, aN: -0.02, aF: -0.02, core: 0.3, eye: 0.3 },
      { crouch: 0.3, aN: -0.04, aF: -0.04, core: 0.2, eye: 0.15, tilt: 0.06 },
      { crouch: 0.3, aN: -0.04, aF: -0.04, core: 0.25, eye: 0.15, tilt: 0.06 },
      { crouch: 0.2, core: 0.3, eye: 0.3 },
    ],
    recoil: [
      { lean: -0.16, aN: 0.6, eN: 0.8, aF: 0.4, eF: 0.6, eye: 0.9, core: 0.7, tilt: -0.12 },
      { lean: -0.06, aN: 0.2, eN: 0.3, aF: 0.1, eye: 0.7, tilt: -0.04 },
    ],
    // a knot loosens: a chip of stone shakes free, the core flickers
    release: [
      { lean: -0.03, crouch: 0.1, core: 1.1, eye: 0.9, tilt: -0.05 },
      { lean: 0.02, crouch: 0.05, core: 0.4, eye: 0.5, tilt: 0.04 },
      { core: 0.7, eye: 0.6 },
    ],
    // interrupted: its raised arm drops, it staggers half a step
    balk: [
      { lean: -0.1, aN: 0.6, eN: 0.6, step: 0.4, crouch: 0.3, eye: 0.4, core: 0.4, tilt: -0.1 },
      { lean: -0.04, aN: 0.2, eN: 0.2, step: 0.2, crouch: 0.15, eye: 0.5, tilt: -0.04 },
      { aN: 0.05, crouch: 0.05, eye: 0.55 },
    ],
    settle: [
      { crouch: 0.3, core: 0.7, eye: 0.4 },
      { crouch: 0.6, core: 0.6, eye: 0.2, tilt: 0.06 },
      { kneel: 1, core: 0.5, eye: 0, tilt: 0.1, lean: 0.04 },
    ],
  };
  A.family('golem', {
    spec: { w: 256, h: 216, ox: 136, oy: 112, ms: 230, bob: (t) => Math.sin(t / 520) * 2 },
    base: gBase, idle: gIdle, poseTable: gTable, rig: golemRig, recoil: { push: 2 },
  });
  // Strike: wound up overhead, a planted step and the blow (contact 640), the arm lifts back — ~1,250
  A.deliver('golem', 'strike', (a) => {
    const c = A.kit(a), oc = A.outcome(a), to = a.aimed;
    if (c.rd) { c.F(0, 'prep', 340, 'strike@2').F(340, 'exec', 300, 'strike@2').F(640, 'recover', 560, oc === 'ward' || oc === 'block' ? 'deflect@0' : 'strike@0'); c.X(640, 'stoneDust', 400, { to }); return c.done(640, 1250); }
    const peak = oc === 'ward' || oc === 'block' ? 0.18 : 0.24; // a heavy planted step, not a slide
    c.F(0, 'prep', 360, 'strike');
    c.F(360, 'exec', 280, 'strike', { to, peak, shape: 'out' });
    c.X(640, 'stoneDust', 460, { to, seal: oc === 'ward' || oc === 'block' || oc === 'soft' });
    if (oc === 'ward' || oc === 'block') { c.F(640, 'recover', 520, 'deflect', { to, peak, shape: 'back' }); c.F(1160, 'recover', 90, 'hover'); return c.done(640, 1250); }
    c.F(640, 'exec', 140, oc === 'soft' ? 'push' : oc === 'miss' ? 'miss' : 'impact', { to, peak, shape: 'hold' });
    c.F(780, 'recover', 380, 'strike', { to, peak, shape: 'back' });
    c.F(1160, 'recover', 90, 'hover');
    return c.done(640, 1250);
  });
  // Gathering: arms drawn in, the core brightening; applies at 760
  A.deliver('golem', 'charge', (a) => {
    const c = A.kit(a);
    if (c.rd) { c.F(0, 'prep', 280, 'charge@1').F(280, 'cast', 640, 'charge@3').F(920, 'recover', 300, 'charge@0'); c.X(260, 'gather', 640, {}); return c.done(760, 1220); }
    c.F(0, 'prep', 280, 'charge').F(280, 'cast', 640, 'charge').F(920, 'recover', 300, 'charge');
    c.X(260, 'gather', 660, {});
    return c.done(760, 1220);
  });
  // Chill (the Icicle Warden): the core flares, the rimed fist thrusts; ice reaches its target at 600
  A.deliver('golem', 'chill', (a) => {
    const c = A.kit(a), to = a.aimed;
    if (c.rd) { c.F(0, 'prep', 300, 'chill@1').F(300, 'exec', 320, 'chill@1').F(620, 'recover', 480, 'chill@0'); c.X(340, 'iceShard', 280, { to }); return c.done(600, 1100); }
    c.F(0, 'prep', 300, 'chill');
    c.F(300, 'exec', 320, 'chill', { to, peak: 0.06, shape: 'out' });
    c.X(340, 'iceShard', 280, { to, seal: A.outcome(a) === 'ward' || A.outcome(a) === 'block' });
    c.F(620, 'recover', 480, 'chill', { to, peak: 0.06, shape: 'back' });
    return c.done(600, 1100);
  });
  // Flood (the Ledger Heap): cracks open, arms flung wide; the water crosses both at 620
  A.deliver('golem', 'flood', (a) => {
    const c = A.kit(a), who = a.comp ? ['pc', 'comp'] : ['pc'];
    if (c.rd) { c.F(0, 'prep', 320, 'flood@1').F(320, 'exec', 420, 'flood@1').F(740, 'recover', 460, 'flood@0'); c.X(400, 'tideWash', 560, { who, ink: true }); return c.done(620, 1200); }
    c.F(0, 'prep', 320, 'flood').F(320, 'exec', 420, 'flood').F(740, 'recover', 460, 'flood');
    c.X(400, 'tideWash', 620, { who, ink: true });
    return c.done(620, 1200);
  });
  // Re-tying: a fallen stone set back in place; the knot ties at 760
  A.deliver('golem', 'mend', (a) => {
    const c = A.kit(a), fv = a.fv || {}, i = Math.min((fv.maxKnots || 1) - 1, fv.knots || 0);
    if (c.rd) { c.F(0, 'cast', 900, 'mend@2').F(900, 'recover', 300, 'mend@1'); c.X(240, 'mendThread', 620, { i }); return c.done(760, 1200); }
    c.F(0, 'prep', 240, 'mend').F(240, 'cast', 660, 'mend').F(900, 'recover', 300, 'mend');
    c.X(240, 'mendThread', 620, { i });
    return c.done(760, 1200);
  });
  // Plea (the Gatekeeper): it kneels and holds out its hand; the plea reaches you at 700
  A.deliver('golem', 'plea', (a) => {
    const c = A.kit(a);
    if (c.rd) { c.F(0, 'prep', 320, 'plea@1').F(320, 'cast', 640, 'plea@1').F(960, 'recover', 340, 'plea@0'); c.X(380, 'note', 760, { from: 'foe', to: 'party', fade: true }); return c.done(700, 1300); }
    c.F(0, 'prep', 320, 'plea').F(320, 'cast', 640, 'plea').F(960, 'recover', 340, 'plea');
    c.X(380, 'note', 760, { from: 'foe', to: 'party', fade: true });
    return c.done(700, 1300);
  });
  A.auditFamily('golem', {
    anatomy: 'large / constructed', frame: [256, 216], anchor: [136, 112], was: [164, 180],
    idle: '6 drawings × 230 ms (a slow breath through the core, arms and head settling a pixel) — deliberately few: a held, heavy creature',
    materials: 'dressed field-stones lit on their bevels with worn patches, lichen clusters, cracks with lit lips, a glowing chest core',
    moves: { strike: 'wound up overhead, planted step, hammer blow', charge: 'arms drawn in, core brightening', chill: 'core flares, rimed fist thrusts; ice', flood: 'cracks open, arms wide; water across both', mend: 'a stone set back in place', plea: 'kneels, holds out its hand' },
    reactions: 'recoil (rocks back, arms up), release (core flickers), balk (arm drops, half step), settle (kneels, eye dark)',
    overlays: 'Heat pips; Gathering motes (with its own core glow)',
  });
})();
