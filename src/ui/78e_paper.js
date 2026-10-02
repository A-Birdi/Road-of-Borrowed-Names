/* Creatures A — paper and cloth (§9.2: overlap, bending and follow-through from attached roots
 * or folds; material structure preserved): the crane (Paper Crane, Soggy Paper Crane, Unfolded
 * Crane), the letter (Undelivered Letter) and the clerk (The Tide Clerk, False Gatekeeper,
 * Echoing Gatekeeper, Consent Stamp).
 *
 * Crane: now faces the party (it faced away); flat facets split by crisp creases, the near wing
 * lit, writing along it; the neck draws back into an S and darts, the wings beat from high to
 * low. Native 236 × 196, origin (128, 104) (was 188 × 168): room for the neck's dart and the
 * raised wings. q: wn / wf near and far wing (0 high … 1 low), neckA (+ lowers the head toward
 * the party), neckL (neck length), headA, pitch (+ toward the party), tail, damp (pulp shaken
 * off: the Soggy Crane's Shroud).
 * Letter: native 196 × 200, origin (100, 76) (was 152 × 176, defined in ch2/01_art.js): room for
 * the flap opening and the strips lashing. q: rot, sx (edge-on turn), flap (0 shut … 1 open),
 * note (a folded note rising out), samp / slean strips, eye, look, droop.
 * Clerk: now faces the party, its stamp in its near hand (the stamp was on the far side); a long
 * robe with folds, a paper collar, a tall cap. Native 224 × 212, origin (116, 102), feet +14
 * (was 168 × 188). q: sy stamp height (− raised), reach (the stamping arm out toward the party),
 * lean, hem (robe sway), sheets (spread of its loose papers), sph (their phase), doc (a document
 * held up in the other hand), gloss (a mirror's glint on it), glow (the seal glowing), eye, cap. */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const A = RB.creaturesA, K = RB.pxkit;
  const mixh = (a, b, k) => K.hex(K.mix(a, b, k));
  const cl = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const hs = (i, j) => { const x = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return x - Math.floor(x); };

  // =============================================================================================
  // CRANE (drawn in its own right-facing coordinates, mirrored so it faces the party)
  // =============================================================================================
  // The crane (the restyle): folded paper in hard planes — a 6-tone paper ramp (white with warm
  // highlights, shadows going warm grey to violet), each facet one flat tone chosen by how it faces
  // the key light, every crease a lit ridge beside a dark valley line, paper fibre as sparse
  // clusters on the big planes, ink strokes along the near wing (marks, not letters), a red beak
  // tip with its own ramp, a coloured outline; the near wing casts its shadow on the body, the body
  // on the far wing.
  const craneMatCache = new Map();
  function craneMats(col) {
    if (craneMatCache.has(col)) return craneMatCache.get(col);
    const M = {
      P: A.hmat(col, { n: 6, at: 4, lo: 0.2, hi: 0.985, sat: 0.55, hd: 90, hl: 12, sd: 0.1, rim: mixh(col, '#cfe0ff', 0.6) }),
      red: A.hmat('#c85a4a', { n: 4, at: 2, lo: 0.2, hi: 0.72, sat: 1.2, hd: 26 }),
      writing: K.solid(mixh(col, '#2e2a48', 0.7), { line: false }),
    };
    craneMatCache.set(col, M);
    if (craneMatCache.size > 12) craneMatCache.delete(craneMatCache.keys().next().value);
    return M;
  }
  // a crease from a to b: a lit ridge on one side, the dark valley on the other
  const crease = (Lr, M, a, b, lit) => { Lr.line(a[0], a[1], b[0], b[1], M, lit ? 5 : 1); Lr.line(a[0] + 1, a[1], b[0] + 1, b[1], M, lit ? 2 : 4); };
  const fibre = (Lr, M, pts, k, seed) => Lr.onto((b) => { const [p0, p1, p2] = pts; for (let i = 0; i < 4; i++) { const u = hs(seed, i), v = hs(i, seed) * (1 - u); const x = p0[0] + (p1[0] - p0[0]) * u + (p2[0] - p0[0]) * v, y = p0[1] + (p1[1] - p0[1]) * u + (p2[1] - p0[1]) * v; b.rect(Math.round(x), Math.round(y), 2 + (i % 2), 1, M, k); } });
  function craneRig(L, q, o, H) {
    const col = o.col || '#f4efe0';
    const C = craneMats(col), M = C.P;
    const back = L.like(), mid = L.like(), front = L.like();
    const T = (Lr) => Lr.save().scale(-1, 1).translate(0, 20).rotate(-q.pitch).translate(0, -20);
    // wing tips from the beat (0 high → 1 low), measured round each wing's root
    const nA = A.lerp(-1.92, -3.05, q.wn), nL = A.lerp(81, 72, cl(q.wn * 2)) * q.wl;
    const fA = A.lerp(-1.38, -0.37, q.wf), fL = A.lerp(83, 66, q.wf) * q.wl;
    const tipN = [-2 + Math.cos(nA) * nL, Math.sin(nA) * nL], tipF = [4 + Math.cos(fA) * fL, 2 + Math.sin(fA) * fL];
    const downN = q.wn > 0.7, downF = q.wf > 0.7;
    // far wing (behind the body, in shade)
    T(back);
    A.fpoly(back, [[4, 2], [18, 6], tipF], M, downF ? 1 : 3);
    A.fpoly(back, [[4, 2], [-4, 10], tipF], M, downF ? 1 : 2);
    crease(back, M, [4, 2], tipF, false);
    back.restore();
    // tail, neck and head, body
    T(mid);
    mid.save().translate(-6, 18).rotate(q.tail).translate(6, -18);
    A.fpoly(mid, [[-10, 14], [-4, 22], [-80, -12]], M, 4);
    A.fpoly(mid, [[-4, 22], [-12, 26], [-80, -12]], M, 2);
    crease(mid, M, [-4, 22], [-80, -12], true);
    mid.restore();
    const nb = [12, 18], na = -0.825 + q.neckA, nl = 71 * q.neckL;
    const tip = [nb[0] + Math.cos(na) * nl, nb[1] + Math.sin(na) * nl];
    // the neck: two facets; drawn back it kinks into an S (a fold at its middle)
    const kink = q.neckL < 0.95 ? (0.95 - q.neckL) * 40 : 0;
    const mpt = [(nb[0] + tip[0]) / 2 - kink, (nb[1] + tip[1]) / 2 + kink * 0.4];
    A.fpoly(mid, [[8, 14], [16, 22], mpt], M, 3); A.fpoly(mid, [[16, 22], [22, 18], mpt], M, 2);
    A.fpoly(mid, [[mpt[0] - 3, mpt[1] + 2], [mpt[0] + 3, mpt[1] - 2], tip], M, 4);
    A.fpoly(mid, [[mpt[0] + 3, mpt[1] - 2], [mpt[0] + 6, mpt[1] + 3], tip], M, 2);
    crease(mid, M, [16, 22], mpt, true); crease(mid, M, [mpt[0] + 3, mpt[1] - 2], tip, true);
    // head and beak along the head angle
    const ha = 0.72 + q.headA, ca = Math.cos(ha - 0.72), sa = Math.sin(ha - 0.72);
    const R = (dx, dy) => [tip[0] + dx * ca - dy * sa, tip[1] + dx * sa + dy * ca];
    A.fpoly(mid, [R(-4, 4), R(0, -2), R(16, 12), R(12, 16)], M, 5);
    A.fpoly(mid, [R(-4, 4), R(12, 16), R(6, 14)], M, 3);
    A.fpoly(mid, [R(10, 13), R(16, 12), R(20, 20)], C.red, 2);
    A.fpoly(mid, [R(13, 15), R(20, 20), R(12, 16)], C.red, 1);
    // body: a diamond split by its centre crease (lit on the side toward the light once mirrored)
    A.fpoly(mid, [[0, -6], [-26, 20], [0, 44]], M, 2);
    A.fpoly(mid, [[0, -6], [26, 20], [0, 44]], M, 5);
    A.fpoly(mid, [[26, 20], [0, 44], [10, 22]], M, 3);
    crease(mid, M, [0, -6], [0, 44], false);
    crease(mid, M, [10, 22], [26, 20], true);
    fibre(mid, M, [[2, 0], [24, 20], [2, 40]], 4, 3);
    mid.restore();
    // near wing (in front, lit from above unless lowered), ink strokes along it
    T(front);
    A.fpoly(front, [[-2, 0], [-16, 8], tipN], M, downN ? 3 : 5);
    A.fpoly(front, [[-2, 0], [8, 6], tipN], M, downN ? 2 : 4);
    crease(front, M, [-2, 0], tipN, !downN);
    fibre(front, M, [[-2, 0], [-16, 8], tipN], downN ? 2 : 4, 7);
    front.onto((b) => {
      const ux = tipN[0] + 2, uy = tipN[1], len = Math.hypot(ux, uy) || 1, dx = ux / len, dy = uy / len;
      for (let r = 0; r < 4; r++) for (let s = 0; s < 3; s++) {
        const at = 16 + r * 13 + s * 4, off = -4 - s * 5;
        const x0 = dx * at - dy * off, y0 = dy * at + dx * off, l2 = 3 + ((r * 3 + s * 5) % 4);
        b.line(x0, y0, x0 + dx * l2, y0 + dy * l2, C.writing, 0);
      }
    });
    front.restore();
    A.rim(mid, [M.id]);
    A.cast(back, mid, 2, 3, 1); A.cast(mid, front, 2, 3, 1);
    A.outline(back); A.outline(mid); A.outline(front);
    const out = back.over(mid).over(front);
    if (q.damp > 0) {
      // wet pulp shaken from the wing edges (cached with the frame; the veil itself is 84a's)
      const dl = L.like(), P = K.solid([...K.mix(col, '#8a94a0', 0.4).slice(0, 3), 210], { line: false }), P2 = K.solid([...K.mix(col, '#ffffff', 0.2).slice(0, 3), 170], { line: false });
      const pts = [[-tipN[0], tipN[1]], [-tipF[0], tipF[1]], [10, 30], [-20, 26]];
      pts.forEach(([x, y], k) => { for (let i = 0; i < Math.round(q.damp * 7); i++) dl.ell(x + (hs(k, i) - 0.5) * 16, y + 4 + hs(i, k + 3) * 24 * q.damp, 1.6, 2.2, i % 2 ? P : P2, 0); });
      out.over(dl);
    }
    return out;
  }
  const crBase = { wn: 0.33, wf: 0.33, wl: 1, neckA: 0, neckL: 1, headA: 0, pitch: 0, tail: 0, damp: 0 };
  // idle: a wingbeat (raised → level → a little below → level) with the near and far wings a
  // touch out of step, the neck and tail answering it
  const crIdle = [0, 1, 2, 3, 4, 5, 6, 7].map((f) => {
    const b = [0, 0.2, 0.45, 0.75, 0.9, 0.7, 0.45, 0.2][f];
    return { wn: b, wf: [0.05, 0.15, 0.4, 0.68, 0.88, 0.76, 0.5, 0.25][f], neckA: [0, 0.02, 0.04, 0.03, 0, -0.02, -0.03, -0.01][f], tail: [0, -0.02, -0.04, -0.02, 0.02, 0.04, 0.03, 0.01][f], pitch: [0, 0, 0.01, 0.02, 0.02, 0.01, 0, 0][f] };
  });
  const crTable = {
    // Strike: the neck draws back into an S and the wings rise; it swoops and the beak darts
    'prep.strike': [
      { wn: 0.15, wf: 0.15, neckA: -0.2, neckL: 0.85, headA: 0.2, pitch: -0.05 },
      { wn: 0.02, wf: 0.05, neckA: -0.4, neckL: 0.72, headA: 0.4, pitch: -0.1 },
      { wn: 0, wf: 0, neckA: -0.5, neckL: 0.66, headA: 0.5, pitch: -0.12, tail: 0.06 },
    ],
    'exec.strike': [
      { wn: 0.35, wf: 0.45, neckA: -0.1, neckL: 0.9, headA: 0.3, pitch: 0.06, tail: 0.04 },
      { wn: 0.55, wf: 0.65, neckA: 0.35, neckL: 1.2, headA: 0.1, pitch: 0.14, tail: -0.02 },
      { wn: 0.62, wf: 0.7, neckA: 0.6, neckL: 1.32, headA: 0, pitch: 0.18, tail: -0.06 },
    ],
    'exec.impact': [
      { wn: 0.1, wf: 0.15, neckA: 0.62, neckL: 1.28, headA: -0.1, pitch: 0.16, tail: -0.08 },
      { wn: 0.25, wf: 0.3, neckA: 0.4, neckL: 1.12, headA: 0, pitch: 0.1 },
    ],
    'exec.push': [
      { wn: 0.05, wf: 0.1, neckA: 0.2, neckL: 0.95, headA: 0.3, pitch: -0.02 },
      { wn: 0.4, wf: 0.5, neckA: 0.6, neckL: 1.3, headA: 0, pitch: 0.16 },
    ],
    'exec.miss': [{ wn: 0.8, wf: 0.9, neckA: 0.75, neckL: 1.35, headA: -0.15, pitch: 0.26, tail: -0.1 }],
    'recover.strike': [
      { wn: 0, wf: 0.05, neckA: 0.1, neckL: 0.95, pitch: -0.04 },
      { wn: 0.8, wf: 0.85, neckA: 0, neckL: 1, pitch: 0 },
      { wn: 0.3, wf: 0.35 },
    ],
    'recover.hover': [{ wn: 0.15, wf: 0.2 }],
    'recover.deflect': [
      { wn: 0, wf: 0.05, neckA: -0.45, neckL: 0.75, headA: 0.6, pitch: -0.18, tail: 0.1 },
      { wn: 0.6, wf: 0.7, neckA: -0.2, neckL: 0.88, headA: 0.3, pitch: -0.08 },
      { wn: 0.3, wf: 0.35, neckA: 0, pitch: 0 },
    ],
    // Gust: wings high, then three hard strokes fanning the party
    'prep.gust': [
      { wn: 0.05, wf: 0.05, pitch: -0.08, neckA: -0.15, neckL: 0.9 },
      { wn: -0.12, wf: -0.1, wl: 1.06, pitch: -0.14, neckA: -0.25, neckL: 0.85 },
    ],
    'exec.gust': [
      { wn: 1, wf: 1.05, wl: 1.04, pitch: 0.06, neckA: -0.1 },
      { wn: 0.1, wf: 0.1, pitch: -0.04, neckA: -0.15 },
      { wn: 1.05, wf: 1.1, wl: 1.04, pitch: 0.08, neckA: -0.1 },
      { wn: 0.15, wf: 0.15, pitch: -0.02 },
      { wn: 1, wf: 1.05, pitch: 0.06, neckA: -0.05 },
    ],
    'recover.gust': [
      { wn: 0.5, wf: 0.55, pitch: 0.02 },
      { wn: 0.3, wf: 0.35 },
    ],
    // Sweep (the Unfolded Crane): it slices past low over both of you on a level, open wing
    'prep.sweep': [
      { wn: 0.1, wf: 0.1, pitch: -0.08, neckA: -0.2, neckL: 0.85 },
      { wn: 0, wf: 0, pitch: -0.12, neckA: -0.3, neckL: 0.8 },
    ],
    'exec.sweep': [
      { wn: 0.5, wf: 0.55, wl: 1.08, pitch: 0.12, neckA: 0.3, neckL: 1.15 },
      { wn: 0.55, wf: 0.6, wl: 1.1, pitch: 0.16, neckA: 0.4, neckL: 1.2 },
      { wn: 0.6, wf: 0.62, wl: 1.08, pitch: 0.1, neckA: 0.3, neckL: 1.1 },
    ],
    'recover.sweep': [
      { wn: 0.05, wf: 0.1, pitch: -0.04, neckA: 0.05 },
      { wn: 0.7, wf: 0.75 },
      { wn: 0.3, wf: 0.35 },
    ],
    // Shroud (the Soggy Paper Crane): it shakes its sodden wings; damp pulp falls into a mist
    'prep.shroud': [
      { wn: 0.1, wf: 0.1, neckA: -0.2, neckL: 0.9, pitch: -0.05 },
      { wn: 0, wf: 0, neckA: -0.3, neckL: 0.85, pitch: -0.08, damp: 0.2 },
    ],
    'cast.shroud': [
      { wn: 0.9, wf: 0.95, damp: 0.7, pitch: 0.04 },
      { wn: 0.4, wf: 0.3, damp: 1, neckA: 0.1 },
      { wn: 0.95, wf: 1, damp: 1, pitch: 0.04 },
      { wn: 0.5, wf: 0.4, damp: 0.8, neckA: 0.1 },
      { wn: 0.8, wf: 0.85, damp: 0.5 },
    ],
    'recover.shroud': [
      { wn: 0.4, wf: 0.45, damp: 0.25 },
      { wn: 0.3, wf: 0.35 },
    ],
    rest: [
      { wn: 0.8, wf: 0.85, neckA: 0.2, neckL: 0.9, pitch: 0.04 },
      { wn: 0.95, wf: 1, neckA: 0.35, neckL: 0.85, headA: 0.2, pitch: 0.06 },
      { wn: 0.95, wf: 1, neckA: 0.38, neckL: 0.85, headA: 0.25, pitch: 0.06 },
      { wn: 0.8, wf: 0.85, neckA: 0.2, neckL: 0.9, pitch: 0.04 },
    ],
    recoil: [
      { wn: 0, wf: 0.1, neckA: -0.5, neckL: 0.75, headA: 0.5, pitch: -0.2, tail: 0.12 },
      { wn: 0.5, wf: 0.6, neckA: -0.2, neckL: 0.9, headA: 0.2, pitch: -0.08 },
    ],
    // a knot loosens: a crease springs open — the wings flick, the neck lifts
    release: [
      { wn: 0.1, wf: 0.6, neckA: -0.15, neckL: 1.05, headA: -0.1 },
      { wn: 0.6, wf: 0.1, neckA: -0.05, neckL: 1 },
      { wn: 0.35, wf: 0.35 },
    ],
    // interrupted: a wing buckles and the neck folds, then it rights itself
    balk: [
      { wn: 0.95, wf: 0.2, neckA: 0.3, neckL: 0.8, headA: 0.4, pitch: -0.1, tail: 0.08 },
      { wn: 0.6, wf: 0.4, neckA: 0.1, neckL: 0.9, headA: 0.2, pitch: -0.04 },
      { wn: 0.35, wf: 0.35 },
    ],
    settle: [
      { wn: 0.2, wf: 0.25, neckA: -0.1 },
      { wn: 0.6, wf: 0.65, neckA: 0.15, neckL: 0.95 },
      { wn: 0.9, wf: 0.95, neckA: 0.3, neckL: 0.9, headA: 0.3, pitch: 0.04 },
    ],
  };
  A.family('crane', {
    spec: { w: 244, h: 196, ox: 136, oy: 104, ms: 130, bob: (t) => Math.sin(t / 300) * 3 },
    base: crBase, idle: crIdle, poseTable: crTable, rig: craneRig, recoil: { push: 5 },
    veil: (o) => ({ kind: 'pulp', cols: [mixh(o.col || '#f4efe0', '#c8ccd0', 0.35), mixh(o.col || '#f4efe0', '#ffffff', 0.2), mixh(o.col || '#f4efe0', '#7a8490', 0.4)] }),
  });
  A.deliver('crane', 'strike', (a) => {
    const c = A.kit(a), oc = A.outcome(a), to = a.aimed;
    if (c.rd) { c.F(0, 'prep', 300, 'strike@2').F(300, 'exec', 300, 'strike@2').F(600, 'recover', 500, oc === 'ward' || oc === 'block' ? 'deflect@0' : 'strike@0'); c.X(600, 'paperCut', 300, { to }); return c.done(600, 1150); }
    const peak = oc === 'ward' || oc === 'block' ? 0.4 : 0.46;
    c.F(0, 'prep', 300, 'strike');
    c.F(300, 'exec', 300, 'strike', { to, peak, arc: 14, shape: 'out' });
    c.X(570, 'paperCut', 320, { to, seal: oc === 'ward' || oc === 'block' || oc === 'soft' });
    if (oc === 'ward' || oc === 'block') { c.F(600, 'recover', 480, 'deflect', { to, peak, shape: 'back' }); c.F(1080, 'recover', 70, 'hover'); return c.done(600, 1150); }
    c.F(600, 'exec', 110, oc === 'soft' ? 'push' : oc === 'miss' ? 'miss' : 'impact', { to, peak, shape: 'hold' });
    c.F(710, 'recover', 370, 'strike', { to, peak, arc: -4, shape: 'back' });
    c.F(1080, 'recover', 70, 'hover');
    return c.done(600, 1150);
  });
  A.deliver('crane', 'gust', (a) => {
    const c = A.kit(a);
    if (c.rd) { c.F(0, 'prep', 320, 'gust@1').F(320, 'exec', 440, 'gust@0').F(760, 'recover', 400, 'gust@1'); c.X(380, 'gust', 520, { col: '#f2eee2' }); return c.done(600, 1200); }
    c.F(0, 'prep', 320, 'gust').F(320, 'exec', 440, 'gust').F(760, 'recover', 440, 'gust');
    c.X(360, 'gust', 600, { col: '#f2eee2' });
    c.X(380, 'paperFlurry', 640, {});
    return c.done(600, 1200);
  });
  A.deliver('crane', 'sweep', (a) => {
    const c = A.kit(a), who = a.comp ? ['pc', 'comp'] : ['pc'];
    if (c.rd) { c.F(0, 'prep', 300, 'sweep@1').F(300, 'exec', 460, 'sweep@1').F(760, 'recover', 440, 'sweep@2'); c.X(320, 'arc', 600, { who, col: '#f2ead6' }); return c.done(600, 1200); }
    c.F(0, 'prep', 300, 'sweep');
    c.F(300, 'exec', 360, 'sweep', { to: 'party', peak: 0.44, arc: 8, shape: 'out' });
    c.X(320, 'arc', 600, { who, col: '#f2ead6' });
    c.X(560, 'paperCut', 320, { to: who[0] });
    c.F(660, 'exec', 100, 'sweep@2', { to: 'party', peak: 0.44, shape: 'hold' });
    c.F(760, 'recover', 440, 'sweep', { to: 'party', peak: 0.44, shape: 'back' });
    return c.done(600, 1200);
  });
  A.deliver('crane', 'shroud', (a) => {
    const c = A.kit(a);
    if (c.rd) { c.F(0, 'prep', 300, 'shroud@1').F(300, 'cast', 600, 'shroud@1').F(900, 'recover', 450, 'shroud@0'); c.X(340, 'veilRelease', 700, {}).X(700, 'mistRoll', 560, {}); return c.done(760, 1350); }
    c.F(0, 'prep', 300, 'shroud').F(300, 'cast', 600, 'shroud').F(900, 'recover', 450, 'shroud');
    c.X(340, 'veilRelease', 760, {});
    c.X(700, 'mistRoll', 560, {});
    return c.done(760, 1350);
  });
  A.auditFamily('crane', {
    anatomy: 'paper (folded)', frame: [236, 196], anchor: [128, 104], was: [188, 168],
    idle: '8 drawings × 130 ms (a wingbeat with the near and far wings out of step; neck and tail answering) + bob',
    materials: 'flat paper facets split by crisp creases, a lit near wing with lines of writing, vermilion beak tip',
    moves: { strike: 'neck drawn into an S, a short swoop, the beak darts', gust: 'three hard strokes fanning the party (paper flurry)', sweep: 'a low slicing pass on an open wing', shroud: 'shakes its sodden wings; pulp falls into a mist' },
    reactions: 'recoil (neck folds back), release (a crease springs open), balk (a wing buckles), settle (wings lowered, head bowed)',
    overlays: 'Shroud veil as damp pulp; Heat pips; Gathering motes', note: 'now faces the party (it faced away)',
  });

  // =============================================================================================
  // LETTER (the Undelivered Letter; its definition moved here from content/ch2/01_art.js)
  // =============================================================================================
  // The letter (the restyle): an envelope turned three-quarter toward the party — sheared so its
  // far (right) edge recedes, its thickness showing as a darker edge behind it; paper in a 6-tone
  // ramp with each flap one flat tone by its facing, every fold a lit ridge beside a dark valley,
  // the top flap casting its shadow on the face; a glossy wax seal (a hard highlight, a pressed
  // ring), a stamp with a perforated edge; two paper strips that twist (their faces alternating
  // lit and shaded along their length) and fray into split ends; three-quarter eyes.
  const letterMatCache = new Map();
  function letterMats(pcol) {
    if (letterMatCache.has(pcol)) return letterMatCache.get(pcol);
    const po = { n: 6, at: 4, lo: 0.2, hi: 0.985, sat: 0.75, hd: 70, hl: 12, sd: 0.12 };
    const M = {
      paper: A.hmat(pcol, Object.assign({ rim: mixh(pcol, '#cfe0ff', 0.6) }, po)),
      edge: A.hmat(mixh(pcol, '#8a7a7a', 0.35), Object.assign({}, po, { hi: 0.8 })),
      strip: A.hmat(pcol, po),
      stripF: A.hmat(pcol, Object.assign({ alpha: 140, line: false }, po)),
      seal: A.hmat('#b84a3a', { n: 5, at: 2, lo: 0.14, hi: 0.86, sat: 1.25, hd: 24, hl: 30 }),
      stamp: A.hmat('#7a9ab8', { n: 5, at: 2, lo: 0.2, hi: 0.9, sat: 1.2 }),
      note: A.hmat('#fbf6e8', po),
      ink: K.solid('#4a4058', { line: false }),
      eye: K.mat(null, { cols: ['#0c0a18', '#1c1830', '#302a48'], at: 0, line: false }),
      shine: K.solid('#ffffff', { line: false }),
    };
    letterMatCache.set(pcol, M);
    if (letterMatCache.size > 8) letterMatCache.delete(letterMatCache.keys().next().value);
    return M;
  }
  // a paper strip hanging from (x, y0): a flat ribbon whose face turns as it twists, fraying into
  // two ends
  function strip(Lr, M, x, y0, len, w0, ph, amp, lean) {
    const cx = (y, k) => x + lean * y + Math.sin(ph + y / 7 + (k || 0)) * amp * Math.min(1, y / (len * 0.45));
    const hw = (y) => w0 * Math.pow(Math.max(0, 1 - y / len), 0.6) + 1;
    const split = len * 0.72;
    for (const Mx of [M.strip, M.stripF]) {
      const ext = Math.abs(lean) * len + w0 + amp + 3;
      Lr.fill(x - ext, y0, x + ext, y0 + len + 2, (px, py) => {
        const y = py - y0;
        if (y < 0 || y > len || (y < len * 0.5 ? M.strip : M.stripF) !== Mx) return false;
        if (y < split) return Math.abs(px - cx(y)) <= hw(y);
        const t = (y - split) / (len - split), sw = Math.max(0.8, hw(y) * 0.5);
        return Math.abs(px - (cx(y) - t * 3)) <= sw || (Math.abs(px - (cx(y, 0.7) + t * 3)) <= sw && t < 0.8);
      }, Mx, (px, py) => { const y = py - y0, face = Math.cos(ph * 0.7 + y / 6) > 0; return ((face ? 4 : 2) + ((px - cx(y)) < -hw(y) * 0.4 ? 1 : 0) + 0.5) / 6; });
    }
  }
  function letterRig(L, q, o, H) {
    const pcol = o.col || '#f4ecd8';
    const M = letterMats(pcol), paper = M.paper;
    const tails = L.like(), N = L.like(), D = L.like(), E = L.like(), F = L.like();
    for (let i = 0; i < 2; i++) strip(tails, M, -26 + i * 30, 30, (50 - i * 10) * q.slen, 6, q.ph + i * 1.9, q.samp, q.slean);
    // the three-quarter turn: the far (right) edge recedes — a shear on top of the pose's own turn
    const T = (Lr) => Lr.save().rotate(q.rot).scale(q.sx, 1).mul(0.94, 0.07, 0, 1, 0, 0);
    // a folded note sliding out of its side toward you (behind the front of the envelope)
    if (q.note > 0) {
      T(N);
      const nx = -40 - q.note * 46, ny = -24;
      N.rect(nx, ny, 60, 40, M.note, (x) => (x < nx + 20 ? 5.5 : 4.5) / 6);
      N.line(nx + 20, ny, nx + 20, ny + 40, M.note, 2); N.line(nx + 21, ny, nx + 21, ny + 40, M.note, 5);
      for (let r = 0; r < 3; r++) N.line(nx + 4, ny + 8 + r * 5, nx + 14 - (r % 2) * 4, ny + 8 + r * 5, M.ink, 0);
      N.restore();
    }
    // its thickness: the envelope's edge seen behind it, up and to the right
    T(D); D.rect(-55, -41, 116, 76, M.edge, 2); D.rect(-55, -41, 116, 2, M.edge, 4); D.restore();
    T(E);
    E.rect(-58, -38, 116, 76, paper, 3);
    A.fpoly(E, [[-58, -38], [-58, 38], [-4, 4]], paper, 5);
    A.fpoly(E, [[58, -38], [58, 38], [4, 4]], paper, 3);
    A.fpoly(E, [[-58, 38], [58, 38], [0, 0]], paper, 4);
    // the folds: lit ridge, dark valley
    E.line(-58, 38, -2, 2, paper, 1); E.line(-57, 37, -1, 2, paper, 5);
    E.line(58, 38, 2, 2, paper, 1); E.line(57, 38, 1, 3, paper, 3);
    E.onto((b) => {
      for (let r = 0; r < 3; r++) for (let s = 0; s < 3; s++) { const x = -40 + s * 9 + (r % 2) * 3, y = 20 + r * 5; b.line(x, y, x + 3 + ((r + s * 2) % 4), y, M.ink, 0); }
      A.stone(b, [[32, 16], [48, 16], [48, 30], [32, 30]], M.stamp, { bevel: 2, face: 2 });
      b.rect(36, 20, 8, 6, M.stamp, 4); b.rect(37, 21, 3, 2, M.stamp, 1);
      for (let x = 31; x < 50; x += 2) { b.dot(x, 15, paper, 5); b.dot(x, 30, paper, 5); }
      for (let y = 17; y < 30; y += 2) { b.dot(31, y, paper, 5); b.dot(48, y, paper, 5); }
    });
    E.restore();
    // the top flap: shut it lies down over the face (apex at 12); it lifts and opens upward
    T(F);
    const apex = A.lerp(12, -86, q.flap), inner = q.flap > 0.5;
    A.fpoly(F, [[-58, -38], [58, -38], [0, apex]], paper, inner ? 2 : 4);
    if (!inner) { F.line(-57, -37, 0, apex + 1, paper, 1); F.line(57, -37, 0, apex + 1, paper, 1); F.line(-55, -35, -1, apex + 2, paper, 5); }
    F.rect(-58, -38, 116, 2, paper, 5);
    // the wax seal rides the flap's tip (it lifts with it): glossy, a pressed ring, a hard highlight
    const sy = A.lerp(12, -60, q.flap);
    F.ell(0, sy, 11, 10, M.seal, A.ball(-3, sy - 3, 12, 11, { k: 1.2 }));
    if (q.flap < 0.3) { F.ell(-8, sy + 8, 3, 3, M.seal, 1); F.ell(7, sy + 9, 2.5, 3, M.seal, 1); }
    F.fill(-8, sy - 8, 8, sy + 8, (x, y) => { const d = Math.hypot(x, y - sy); return d <= 6 && d >= 4.5; }, M.seal, (x, y) => (x + y - sy < 0 ? 0.5 : 3.5) / 5);
    F.rect(-6, sy - 7, 3, 2, M.shine, 0);
    F.restore();
    A.rim(E, [paper.id]);
    A.cast(E, F, 1, 3, 1); A.cast(D, E, 1, 2, 1); A.cast(tails, E, 2, 3, 1);
    A.outline(D); A.outline(N); A.outline(E); A.outline(F); A.outline(tails);
    // the eyes sit on the envelope's face, over the flap as they always have (pleading: inner ends
    // raised); turned three-quarter: the far eye narrower
    const EY = L.like();
    EY.save().rotate(q.rot).scale(q.sx, 1).mul(0.94, 0.07, 0, 1, 0, 0);
    const lx = q.look > 0.5 ? -3 : 0;
    for (const [ex, er] of [[-19, 3], [9, 4]]) {
      const x = ex + lx;
      if (q.eye < 0.25) { EY.line(x - 4, -9, x + 4, -9, M.eye, 1); continue; }
      const ery = 5 * Math.max(0.4, q.eye);
      EY.ell(x, -10, er, ery, M.eye, (px, py) => (py > -10 + ery * 0.3 ? 1.5 : 0.5) / 3);
      EY.rect(Math.round(x - er * 0.5), Math.round(-10 - ery * 0.6), er > 3.5 ? 2 : 1, 2, M.shine, 0);
      if (q.droop > 0) EY.line(x - 5, -18 + (ex < 0 ? 2 : -1) * q.droop, x + 5, -18 + (ex < 0 ? -1 : 2) * q.droop, paper, 1);
    }
    EY.restore();
    return tails.over(D).over(N).over(E).over(F).over(EY);
  }
  const lBase = { rot: 0, sx: 1, flap: 0, note: 0, samp: 6, slean: -0.55, slen: 1, ph: 0, eye: 1, look: 0, droop: 0 };
  const lIdle = [0, 1, 2, 3, 4, 5].map((f) => ({ ph: (f / 6) * Math.PI * 2, rot: Math.sin((f / 6) * Math.PI * 2) * 0.07, flap: [0, 0.02, 0.04, 0.02, 0, 0][f], droop: 0.6 }));
  const lTable = {
    // Plea: it tips back and a folded note slides out of its side toward you
    'prep.plea': [
      { rot: 0.06, flap: 0.02, droop: 1.2, eye: 0.9, ph: 1 },
      { rot: 0.1, flap: 0.04, droop: 1.6, eye: 0.85, note: 0.05, ph: 1.8 },
    ],
    'cast.plea': [
      { rot: 0.06, flap: 0.04, note: 0.3, droop: 1.6, look: 1, ph: 2.6 },
      { rot: 0.02, flap: 0.05, note: 0.65, droop: 1.6, look: 1, ph: 3.4 },
      { rot: -0.03, flap: 0.05, note: 0.9, droop: 1.6, look: 1, ph: 4.2 },
      { rot: -0.05, flap: 0.04, note: 0.6, droop: 1.4, look: 1, ph: 5 },
    ],
    'recover.plea': [
      { rot: -0.02, flap: 0.03, note: 0.2, droop: 1.2, ph: 5.8 },
      { rot: 0, flap: 0.05, droop: 0.8, ph: 0.4 },
    ],
    // Sweep: it turns edge-on, then spins forward, its torn strips lashing across both of you
    'prep.sweep': [
      { rot: -0.15, sx: 0.7, samp: 9, slean: -0.8, ph: 1, eye: 0.8, look: 1 },
      { rot: -0.25, sx: 0.4, samp: 11, slean: -1, ph: 1.6, eye: 0.7, look: 1 },
    ],
    'exec.sweep': [
      { rot: 0.2, sx: 0.55, samp: 14, slean: 0.9, slen: 1.3, ph: 2.4, look: 1 },
      { rot: 0.45, sx: 0.9, samp: 16, slean: 1.2, slen: 1.45, ph: 3.4, look: 1 },
      { rot: 0.3, sx: 1, samp: 14, slean: 0.6, slen: 1.35, ph: 4.4, look: 1 },
    ],
    'recover.sweep': [
      { rot: 0.1, sx: 0.85, samp: 10, slean: -0.2, ph: 5.2 },
      { rot: 0, sx: 1, samp: 7, slean: -0.5, ph: 6 },
    ],
    rest: [
      { rot: 0.04, flap: 0, eye: 0.5, droop: 1, samp: 4, ph: 0.6 },
      { rot: 0.08, eye: 0.2, droop: 1, samp: 3, slean: -0.3, ph: 1.2 },
      { rot: 0.08, eye: 0.2, droop: 1, samp: 3, slean: -0.3, ph: 1.8 },
      { rot: 0.04, eye: 0.5, droop: 1, samp: 4, ph: 2.4 },
    ],
    recoil: [
      { rot: -0.22, sx: 0.85, flap: 0.05, eye: 0.35, samp: 12, slean: -1, ph: 1 },
      { rot: -0.1, sx: 0.95, eye: 0.7, samp: 9, slean: -0.8, ph: 1.6 },
    ],
    // a knot loosens: the flap lifts a little, the seal loosens, the strips flutter
    release: [
      { rot: 0.06, flap: 0.05, eye: 1, samp: 10, ph: 2 },
      { rot: -0.04, flap: 0.03, eye: 0.8, samp: 8, ph: 3 },
      { rot: 0, flap: 0.03, samp: 6, ph: 4 },
    ],
    balk: [
      { rot: 0.18, sx: 0.8, eye: 0.5, droop: 1.6, samp: 3, slean: -0.2, ph: 1 },
      { rot: 0.08, sx: 0.92, eye: 0.7, droop: 1.2, samp: 5, ph: 1.6 },
      { rot: 0, eye: 0.9, droop: 0.8, ph: 2.2 },
    ],
    // read at last: the flap opens and the letter rests open, at peace
    settle: [
      { flap: 0.02, eye: 0.6, droop: 0.4 },
      { flap: 0.62, eye: 0.3, droop: 0 },
      { flap: 1, eye: 0, droop: 0, note: 0.3 },
    ],
  };
  A.family('sg_letter', {
    spec: { w: 196, h: 220, ox: 100, oy: 96, ms: 150, bob: (t) => Math.sin(t / 420) * 6 },
    base: lBase, idle: lIdle, poseTable: lTable, rig: letterRig, recoil: { push: 5 },
  });
  A.deliver('sg_letter', 'plea', (a) => {
    const c = A.kit(a);
    if (c.rd) { c.F(0, 'prep', 280, 'plea@1').F(280, 'cast', 640, 'plea@2').F(920, 'recover', 320, 'plea@0'); c.X(420, 'note', 760, { from: 'foe', to: 'party', fade: true }); return c.done(640, 1240); }
    c.F(0, 'prep', 280, 'plea').F(280, 'cast', 640, 'plea').F(920, 'recover', 320, 'plea');
    c.X(480, 'note', 700, { from: 'foe', to: 'party', fade: true });
    return c.done(640, 1240);
  });
  A.deliver('sg_letter', 'sweep', (a) => {
    const c = A.kit(a), who = a.comp ? ['pc', 'comp'] : ['pc'];
    if (c.rd) { c.F(0, 'prep', 300, 'sweep@1').F(300, 'exec', 440, 'sweep@1').F(740, 'recover', 400, 'sweep@0'); c.X(320, 'arc', 600, { who, col: '#f4ecd8' }); return c.done(600, 1150); }
    c.F(0, 'prep', 300, 'sweep');
    c.F(300, 'exec', 440, 'sweep', { to: 'party', peak: 0.34, arc: 12, shape: 'out' });
    c.X(320, 'arc', 600, { who, col: '#f4ecd8' });
    c.X(560, 'paperCut', 320, { to: who[0] });
    c.F(740, 'recover', 410, 'sweep', { to: 'party', peak: 0.34, shape: 'back' });
    return c.done(600, 1150);
  });
  A.auditFamily('sg_letter', {
    anatomy: 'paper (envelope)', frame: [196, 200], anchor: [100, 76], was: [152, 176],
    idle: '6 drawings × 150 ms (a slow tilt, strips trailing, the flap stirring) + bob',
    materials: 'folded envelope flaps with crisp creases, vermilion wax seal, postage square, unreadable lines, translucent torn strips',
    moves: { plea: 'tips back; a folded note slides out of its side to you', sweep: 'turns edge-on, spins forward, strips lashing across both' },
    reactions: 'recoil (knocked back, flap jolts), release (flap lifts, strips flutter), balk (sags), settle (opens and rests open, read at last)',
    overlays: 'Heat pips; Gathering motes', note: 'definition moved from src/content/ch2/01_art.js',
  });

  // =============================================================================================
  // CLERK (drawn in its own right-facing coordinates, mirrored so it faces the party)
  // =============================================================================================
  // The clerk (the restyle): cloth in the reference's manner — a hue-shifted robe ramp, folds as
  // clean vertical shadow shapes with a lit ridge on each (not sine banding), the far side and the
  // hem in shadow, a cool rim down its right edge, the collar casting its shadow on the chest; the
  // cap a felt form in crisp bands with a paper band; the face a void with two pale eye-glints; the
  // stamp a turned wooden handle (grain, a lit edge), a brass ferrule with a specular point and a
  // vermilion seal; loose sheets with a folded corner and a lit edge.
  const clerkMatCache = new Map();
  function clerkMats(col, glow) {
    const gk = Math.round(cl(glow) * 4) / 4, key = col + '|' + gk;
    if (clerkMatCache.has(key)) return clerkMatCache.get(key);
    const M = {
      robe: A.hmat(col, { n: 6, at: 2, lo: 0.08, hi: 0.78, sat: 1.25, hd: 26, hl: 34, rim: mixh(col, '#cfe4ff', 0.55) }),
      paper: A.hmat('#e8e0cc', { n: 5, at: 3, lo: 0.3, hi: 0.98, sat: 1.1, hd: 60, hl: 12, sd: 0.14 }),
      wood: A.hmat('#6a4a3a', { n: 5, at: 2, lo: 0.1, hi: 0.72, sat: 1.25, hd: 24, hl: 24 }),
      brass: A.hmat('#c09a4a', { n: 5, at: 2, lo: 0.16, hi: 0.92, sat: 1.2, hd: 30, hl: 24 }),
      seal: A.hmat(gk > 0 ? mixh('#c85a4a', '#ffb070', gk * 0.5) : '#c85a4a', { n: 5, at: 2, lo: 0.16, hi: 0.86, sat: 1.25, hd: 24, hl: 30 }),
      shade: K.mat(null, { cols: [K.hex(K.mix(K.parse(col), [6, 6, 14, 255], 0.86)), K.hex(K.mix(K.parse(col), [10, 10, 22, 255], 0.74))], at: 0, line: false }),
      skin: A.hmat('#d8c8b8', { n: 4, at: 2, lo: 0.36, hi: 0.94, sat: 0.8, hd: 16 }),
      lines: K.solid('#4a4458', { line: false }),
      eye: K.solid('#eef0ff', { line: false }), eye2: K.solid('#9aa8e0', { line: false }),
      shine: K.solid('#ffffff', { line: false }), gloss: K.solid('#dfe8f4', { line: false }),
    };
    clerkMatCache.set(key, M);
    if (clerkMatCache.size > 16) clerkMatCache.delete(clerkMatCache.keys().next().value);
    return M;
  }
  // a cloth tone: the key light across the form plus clean folds (a lit ridge, a shadow valley)
  const foldTone = (x, y, base, period, ph) => {
    const f = Math.cos((x + ph) / period);
    let k = base + (f > 0.72 ? 1 : f < -0.45 ? -1 : 0);
    return k;
  };
  function sheet(Lr, M, w, h) {
    A.stone(Lr, [[-w, -h], [w, -h], [w, h], [-w, h]], M.paper, { bevel: 2, face: 3 });
    Lr.poly([[w - 5, h], [w, h - 5], [w, h]], M.paper, 1);
    Lr.poly([[w - 5, h], [w, h - 5], [w - 4, h - 4]], M.paper, 4);
    for (let r = 0; r < 3; r++) Lr.line(-w + 4, -h + 5 + r * 3, w - 6 - (r % 2) * 5, -h + 5 + r * 3, M.lines, 0);
  }
  function clerkRig(L, q, o, H) {
    const M = clerkMats(o.col || '#4a6a8a', q.glow), robe = M.robe;
    const back = L.like(), mid = L.like(), front = L.like(), glow = L.like();
    const T = (Lr) => Lr.save().scale(-1, 1).translate(0, 60).rotate(q.lean).translate(0, -60);
    // loose sheets drifting at its side (spread out wide when it calls up a tide or a fog)
    T(back);
    const nS = q.sheets > 0.5 ? 5 : 3;
    for (let i = 0; i < nS; i++) {
      const ph = q.sph + i * 1.7, dy = Math.sin(ph) * 2;
      const sx = -54 - i * 5 - q.sheets * (10 + i * 5), sy = 22 - i * 18 + dy - q.sheets * (i % 2 ? 12 : -6);
      back.save().translate(sx, sy).rotate(-0.28 + i * 0.2 + Math.sin(ph) * 0.06 + q.sheets * (i - 2) * 0.25);
      sheet(back, M, 11, 8);
      back.restore();
    }
    back.restore();
    // robe with folds (light from the left once mirrored: + x is screen left), the hem swaying
    T(mid);
    const hm = (k) => Math.round(Math.sin(q.hem + k) * 2);
    const robeP = [[-20, -26], [20, -26], [30, 16], [35, 66 + hm(0)], [26, 64 + hm(1)], [18, 68 + hm(2)], [8, 64 + hm(3)], [-2, 68 + hm(4)], [-12, 64 + hm(5)], [-22, 68 + hm(6)], [-35, 66 + hm(7)], [-30, 16]];
    // (+ x is screen left, toward the light) — the cone lit on its near side, folds falling from
    // the waist as tapered valleys that widen toward the hem, each with a lit ridge beside it
    const halfW = (y) => (y < 16 ? 20 + (y + 26) * 0.24 : 30 + (y - 16) * 0.1);
    A.poly(robeP).fill(mid, robe, (x, y) => {
      const u = x / halfW(y), t = cl((y - 4) / 62);
      let k = u > 0.38 ? 4 : u > -0.2 ? 3 : u > -0.66 ? 2 : 1;
      if (y < -14 && u > 0.1) k += 1;
      if (y > 4) for (const uk of [-0.62, -0.18, 0.26, 0.66]) {
        const c = uk + Math.sin(q.hem + uk * 3) * 0.04 * t, w = 0.03 + 0.09 * t;
        if (Math.abs(u - c) < w) { k -= t > 0.55 ? 2 : 1; break; }
        if (u > c + w && u < c + w + 0.06 + 0.04 * t) { k += 1; break; }
      }
      if (y > 60) k -= 1;
      return (Math.max(0, Math.min(5, k)) + 0.5) / 6;
    });
    // far sleeve: hanging, or holding up a document (for a false promise, a mirror, a plea)
    const dU = q.doc;
    mid.poly([[-19, -24], [-34, -8 - dU * 12], [-44 + dU * 4, 30 - dU * 44], [-28, 36 - dU * 40], [-22, 2]], robe, (x, y) => ((Math.cos(x / 4) > 0.5 ? 2 : 1) + 0.5) / 6);
    mid.ell(-35 + dU * 2, 34 - dU * 42, 5, 4, M.skin, 1);
    if (dU > 0.2) {
      const dx = -36 + dU * 2, dy = 4 - dU * 46;
      mid.save().translate(dx, dy).rotate(-0.12);
      mid.rect(-14, -20, 26, 32, M.paper, (x, y) => (x < -6 ? 4.5 : 3.5) / 5);
      mid.line(-14, -20, 12, -20, M.paper, 4); mid.poly([[7, 12], [12, 7], [12, 12]], M.paper, 1);
      for (let r = 0; r < 4; r++) mid.line(-10, -14 + r * 6, 6 - (r % 2) * 6, -14 + r * 6, M.lines, 0);
      if (q.gloss > 0) { mid.line(-12, 8, 8, -16, M.shine, 0); mid.line(-9, 10, 10, -12, M.gloss, 0); }
      mid.ell(4, 6, 4, 4, M.seal, 2); mid.dot(3, 4, M.seal, 4);
      mid.restore();
    }
    // collar (its shadow on the chest), cap, face in shadow with pale eyes
    mid.poly([[-13, -26], [13, -26], [0, -6]], M.paper, 3);
    mid.poly([[2, -26], [13, -26], [0, -6]], M.paper, 4);
    mid.line(-12, -25, 0, -7, M.paper, 1);
    mid.poly([[-6, -26], [6, -26], [0, -14]], robe, 0);
    mid.ell(0, -30, 13, 10, M.shade, 0);
    mid.save().translate(0, -40).rotate(q.cap).translate(0, 40);
    mid.poly([[-15, -40], [-14, -58], [-8, -66], [8, -66], [14, -58], [15, -40]], robe, A.ball(6, -60, 20, 18, { k: 1.2, lift: 0.04, mirror: true }));
    mid.rect(-16, -44, 32, 5, M.paper, (x) => (x > 6 ? 4.5 : x > -6 ? 3.5 : 2.5) / 5);
    mid.line(-16, -40, 16, -40, M.paper, 1);
    mid.restore();
    const eo = q.eye;
    for (const s of [-1, 1]) {
      if (eo < 0.3) { mid.rect(s * 5 - 2, -32, 4, 1, M.eye2, 0); continue; }
      mid.rect(s * 5 - 2, -33, s > 0 ? 4 : 3, 2, M.eye, 0); mid.dot(s * 5 + 1, -34, M.eye2, 0);
    }
    mid.restore();
    // the stamping arm (near the party): sleeve, gripping hand, handle, ferrule and the seal
    T(front);
    const sy = q.sy, rx = q.reach * 18;
    front.poly([[18, -24], [32, -16], [44 + rx, sy + 4], [34 + rx, sy + 12], [24, -2]], robe, (x, y) => ((x > 30 + rx * 0.5 && y < sy + 6 ? 4 : 3) + (Math.cos((x + y) / 4) > 0.7 ? 1 : 0) + 0.5) / 6);
    front.rect(36 + rx, sy - 22, 7, 20, M.wood, (x, y) => ((x > 40.5 + rx ? 3 : x > 38 + rx ? 2 : 1) + 0.5) / 5);
    for (let k = 0; k < 3; k++) front.line(37 + rx + k * 2, sy - 20 + k * 5, 37 + rx + k * 2, sy - 17 + k * 5, M.wood, k === 2 ? 4 : 0);
    front.ell(39.5 + rx, sy - 24, 6, 4, M.wood, A.ball(41 + rx, sy - 26, 6, 4, { k: 1.2, mirror: true }));
    front.rect(35 + rx, sy - 4, 9, 4, M.brass, (x) => ((x > 41 + rx ? 4 : x > 38 + rx ? 2 : 1) + 0.5) / 5);
    front.dot(42 + rx, sy - 4, M.shine, 0);
    front.ell(38 + rx, sy - 9, 6, 5, M.skin, A.ball(40 + rx, sy - 11, 6, 5, { k: 1.2, mirror: true }));
    A.stone(front, [[29 + rx, sy], [50 + rx, sy], [50 + rx, sy + 9], [29 + rx, sy + 9]], M.seal, { bevel: 2, face: 2 });
    if (sy > 0) for (const [x1, y1, x2, y2] of [[26, sy + 12, 21, sy + 14], [53, sy + 12, 58, sy + 14], [30, sy + 15, 26, sy + 19], [49, sy + 15, 53, sy + 19]]) front.line(x1 + rx, y1, x2 + rx, y2, M.paper, 4);
    front.restore();
    A.rim(mid, [robe.id], { w: 2 }); A.rim(front, [robe.id]);
    A.cast(back, mid, 2, 3, 1); A.cast(mid, front, 2, 3, 1);
    A.outline(back); A.outline(mid); A.outline(front);
    if (q.glow > 0) { T(glow); H.glow(glow, 40 + rx, sy + 4, 18 + q.glow * 8, 14 + q.glow * 6, '#ffb070', 0.18 + q.glow * 0.14, 2); glow.restore(); }
    return back.over(mid).over(front).over(glow);
  }
  const kBase = { sy: -8, reach: 0, lean: 0, hem: 0, sheets: 0, sph: 0, doc: 0, gloss: 0, glow: 0, eye: 1, cap: 0 };
  // idle: the stamp rises and falls on its own rhythm, the sheets drift, the hem sways
  const kIdle = [0, 1, 2, 3, 4, 5].map((f) => ({ sy: [-24, -17, -8, 2, -3, -13][f], hem: (f / 6) * Math.PI * 2, sph: (f / 6) * Math.PI * 2, cap: [0, 0, 0.02, 0.03, 0.01, 0][f] }));
  const kTable = {
    // Strike: the stamp raised high, it glides in and brings it down on its target
    'prep.strike': [
      { sy: -30, lean: -0.04, cap: -0.04, hem: 0.5 },
      { sy: -40, lean: -0.08, cap: -0.06, hem: 1, reach: 0.1 },
      { sy: -44, lean: -0.1, cap: -0.08, hem: 1.4, reach: 0.15, eye: 0.7 },
    ],
    'exec.strike': [
      { sy: -42, lean: 0.04, reach: 0.4, hem: 2.2, cap: -0.02 },
      { sy: -16, lean: 0.12, reach: 0.8, hem: 3, cap: 0.04 },
      { sy: 6, lean: 0.16, reach: 1, hem: 3.6, cap: 0.06 },
    ],
    'exec.impact': [
      { sy: 8, lean: 0.18, reach: 1, hem: 4, cap: 0.08 },
      { sy: 4, lean: 0.12, reach: 0.9, hem: 4.4, cap: 0.04 },
    ],
    'exec.push': [
      { sy: -6, lean: 0.02, reach: 0.7, hem: 4, eye: 0.5, cap: -0.06 },
      { sy: 7, lean: 0.16, reach: 1, hem: 4.6, cap: 0.06 },
    ],
    'exec.miss': [{ sy: 10, lean: 0.24, reach: 1, hem: 4.2, cap: 0.1, eye: 0.6 }],
    'recover.strike': [
      { sy: -12, lean: 0.06, reach: 0.6, hem: 5 },
      { sy: -20, lean: 0.02, reach: 0.2, hem: 5.6 },
      { sy: -14, hem: 6.2 },
    ],
    'recover.hover': [{ sy: -10, hem: 0.4 }],
    'recover.deflect': [
      { sy: -28, lean: -0.14, reach: 0.4, hem: 4.6, eye: 0.4, cap: -0.12 },
      { sy: -20, lean: -0.06, reach: 0.2, hem: 5.2, eye: 0.7, cap: -0.05 },
      { sy: -12, hem: 5.8 },
    ],
    // A false promise (Lie), a turned word (Mirror): it holds up a document — glossy for a mirror
    'prep.lie': [
      { doc: 0.4, sy: -14, lean: -0.02, hem: 0.6 },
      { doc: 0.8, sy: -16, lean: -0.04, hem: 1.2 },
    ],
    'exec.lie': [
      { doc: 1, sy: -16, lean: 0.06, hem: 1.8, eye: 0.8 },
      { doc: 1, sy: -14, lean: 0.1, hem: 2.4, eye: 0.7 },
      { doc: 0.9, sy: -12, lean: 0.06, hem: 3, eye: 0.8 },
    ],
    'recover.lie': [
      { doc: 0.5, sy: -12, hem: 3.6 },
      { doc: 0.1, sy: -10, hem: 4.2 },
    ],
    'prep.mirror': [
      { doc: 0.4, gloss: 1, sy: -14, lean: -0.02, hem: 0.6 },
      { doc: 0.8, gloss: 1, sy: -16, lean: -0.04, hem: 1.2 },
    ],
    'exec.mirror': [
      { doc: 1, gloss: 1, sy: -16, lean: 0.06, hem: 1.8, eye: 0.8 },
      { doc: 1, gloss: 1, sy: -14, lean: 0.1, hem: 2.4, eye: 0.7 },
      { doc: 0.9, gloss: 1, sy: -12, lean: 0.06, hem: 3, eye: 0.8 },
    ],
    // Gathering: the stamp held up overhead, its seal glowing
    'prep.charge': [
      { sy: -36, lean: -0.04, glow: 0.3, hem: 0.6 },
      { sy: -48, lean: -0.06, glow: 0.6, hem: 1.2, cap: -0.04 },
    ],
    'cast.charge': [
      { sy: -52, glow: 0.9, hem: 1.8, eye: 0.7, cap: -0.05 },
      { sy: -54, glow: 1.2, hem: 2.4, eye: 0.6, cap: -0.05 },
      { sy: -53, glow: 1.4, hem: 3, eye: 0.6, cap: -0.05 },
      { sy: -54, glow: 1.5, hem: 3.6, eye: 0.6, cap: -0.05 },
    ],
    'recover.charge': [
      { sy: -30, glow: 1, hem: 4.2 },
      { sy: -14, glow: 0.6, hem: 4.8 },
    ],
    // Flood and Shroud (the Tide Clerk): its sheets spread wide and wheel, the arm raised
    'prep.flood': [
      { sheets: 0.5, sph: 1, sy: -30, lean: -0.04, hem: 0.6 },
      { sheets: 1, sph: 2, sy: -40, lean: -0.06, hem: 1.2, doc: 0.4 },
    ],
    'exec.flood': [
      { sheets: 1.2, sph: 3, sy: -20, lean: 0.06, hem: 1.8, reach: 0.5, doc: 0.6 },
      { sheets: 1.3, sph: 4, sy: -8, lean: 0.12, hem: 2.4, reach: 0.8, doc: 0.4 },
      { sheets: 1.1, sph: 5, sy: -4, lean: 0.1, hem: 3, reach: 0.7, doc: 0.2 },
    ],
    'recover.flood': [
      { sheets: 0.6, sph: 6, sy: -10, hem: 3.6 },
      { sheets: 0.2, sph: 7, sy: -12, hem: 4.2 },
    ],
    'prep.shroud': [
      { sheets: 0.5, sph: 1, sy: -14, hem: 0.6, eye: 0.7 },
      { sheets: 0.9, sph: 2, sy: -18, hem: 1.2, eye: 0.5, doc: 0.3 },
    ],
    'cast.shroud': [
      { sheets: 1.2, sph: 3, sy: -20, hem: 1.8, eye: 0.4, doc: 0.5 },
      { sheets: 1.4, sph: 4, sy: -22, hem: 2.4, eye: 0.3, doc: 0.6 },
      { sheets: 1.3, sph: 5, sy: -20, hem: 3, eye: 0.4, doc: 0.5 },
      { sheets: 1.1, sph: 6, sy: -18, hem: 3.6, eye: 0.5, doc: 0.3 },
    ],
    'recover.shroud': [
      { sheets: 0.6, sph: 7, sy: -14, hem: 4.2 },
      { sheets: 0.2, sph: 8, sy: -12, hem: 4.8 },
    ],
    // Plea: it bows and offers a letter
    'prep.plea': [
      { lean: 0.08, doc: 0.3, sy: -6, hem: 0.6, cap: 0.08 },
      { lean: 0.16, doc: 0.6, sy: -4, hem: 1.2, cap: 0.14, eye: 0.6 },
    ],
    'cast.plea': [
      { lean: 0.2, doc: 0.75, sy: -2, hem: 1.8, cap: 0.16, eye: 0.5 },
      { lean: 0.22, doc: 0.8, sy: -2, hem: 2.4, cap: 0.18, eye: 0.5 },
      { lean: 0.2, doc: 0.75, sy: -2, hem: 3, cap: 0.16, eye: 0.5 },
    ],
    'recover.plea': [
      { lean: 0.1, doc: 0.4, sy: -8, hem: 3.6, cap: 0.08 },
      { lean: 0, doc: 0, sy: -12, hem: 4.2 },
    ],
    // Re-tying (the Consent Stamp): a small, exact stamp on the loose cord
    'cast.mend': [
      { sy: -26, reach: 0.3, lean: 0.06, hem: 1 },
      { sy: 2, reach: 0.4, lean: 0.1, hem: 1.6 },
      { sy: -18, reach: 0.3, lean: 0.06, hem: 2.2 },
      { sy: 3, reach: 0.4, lean: 0.1, hem: 2.8 },
    ],
    rest: [
      { sy: 0, lean: 0.04, eye: 0.6, hem: 0.5 },
      { sy: 4, lean: 0.08, eye: 0.25, hem: 1, cap: 0.06 },
      { sy: 4, lean: 0.08, eye: 0.25, hem: 1.5, cap: 0.06 },
      { sy: 0, lean: 0.04, eye: 0.6, hem: 2 },
    ],
    recoil: [
      { sy: -30, lean: -0.16, sheets: 0.6, sph: 2, eye: 0.3, cap: -0.14, hem: 3 },
      { sy: -16, lean: -0.06, sheets: 0.2, sph: 2.6, eye: 0.7, cap: -0.05, hem: 3.6 },
    ],
    // a knot loosens: a sheet slips loose and the stamp wavers
    release: [
      { sy: -20, sheets: 0.7, sph: 1, eye: 1, hem: 1 },
      { sy: -6, sheets: 0.4, sph: 2, eye: 0.7, hem: 1.6 },
      { sy: -10, sheets: 0.1, sph: 3, hem: 2.2 },
    ],
    balk: [
      { sy: 2, lean: -0.1, reach: 0.2, eye: 0.4, cap: -0.1, hem: 3 },
      { sy: -6, lean: -0.04, eye: 0.6, cap: -0.04, hem: 3.6 },
      { sy: -10, eye: 0.9, hem: 4.2 },
    ],
    // it signs at last: the stamp laid down, its head bowed, eyes closed
    settle: [
      { sy: -2, lean: 0.04, eye: 0.6 },
      { sy: 4, lean: 0.08, eye: 0.3, cap: 0.06 },
      { sy: 6, lean: 0.1, eye: 0, cap: 0.1 },
    ],
  };
  A.family('clerk', {
    spec: { w: 252, h: 212, ox: 116, oy: 102, dy: 14, ms: 150 },
    base: kBase, idle: kIdle, poseTable: kTable, rig: clerkRig, recoil: { push: 3 },
    alias: { 'recover.mirror': 'recover.lie', 'prep.mend': 'prep.charge', 'recover.mend': 'recover.hover' },
    veil: () => ({ kind: 'scrap', cols: ['#dfe5ee', '#eef2f6', '#e8e0cc'] }),
  });
  A.deliver('clerk', 'strike', (a) => {
    const c = A.kit(a), oc = A.outcome(a), to = a.aimed;
    if (c.rd) { c.F(0, 'prep', 300, 'strike@2').F(300, 'exec', 300, 'strike@2').F(600, 'recover', 500, oc === 'ward' || oc === 'block' ? 'deflect@0' : 'strike@0'); c.X(600, 'stampSeal', 420, { to }); return c.done(600, 1150); }
    const peak = oc === 'ward' || oc === 'block' ? 0.4 : 0.46;
    c.F(0, 'prep', 300, 'strike');
    c.F(300, 'exec', 300, 'strike', { to, peak, arc: 6, shape: 'out' });
    c.X(600, 'stampSeal', 460, { to, seal: oc === 'ward' || oc === 'block' || oc === 'soft' });
    if (oc === 'ward' || oc === 'block') { c.F(600, 'recover', 480, 'deflect', { to, peak, shape: 'back' }); c.F(1080, 'recover', 70, 'hover'); return c.done(600, 1150); }
    c.F(600, 'exec', 120, oc === 'soft' ? 'push' : oc === 'miss' ? 'miss' : 'impact', { to, peak, shape: 'hold' });
    c.F(720, 'recover', 360, 'strike', { to, peak, shape: 'back' });
    c.F(1080, 'recover', 70, 'hover');
    return c.done(600, 1150);
  });
  for (const kind of ['lie', 'mirror']) A.deliver('clerk', kind, (a) => {
    const c = A.kit(a), to = a.aimed;
    if (c.rd) { c.F(0, 'prep', 300, kind + '@1').F(300, 'exec', 340, kind + '@1').F(640, 'recover', 460, 'lie@0'); c.X(340, 'pane', 300, { to }); return c.done(620, 1150); }
    c.F(0, 'prep', 300, kind);
    c.F(300, 'exec', 340, kind, { to, peak: 0.12, shape: 'out' });
    c.X(340, 'pane', 300, { to });
    c.F(640, 'recover', 460, kind, { to, peak: 0.12, shape: 'back' });
    return c.done(620, 1150);
  });
  A.deliver('clerk', 'charge', (a) => {
    const c = A.kit(a);
    if (c.rd) { c.F(0, 'prep', 280, 'charge@1').F(280, 'cast', 640, 'charge@3').F(920, 'recover', 300, 'charge@0'); c.X(260, 'gather', 640, {}); return c.done(760, 1220); }
    c.F(0, 'prep', 280, 'charge').F(280, 'cast', 640, 'charge').F(920, 'recover', 300, 'charge');
    c.X(260, 'gather', 660, {});
    return c.done(760, 1220);
  });
  A.deliver('clerk', 'flood', (a) => {
    const c = A.kit(a), who = a.comp ? ['pc', 'comp'] : ['pc'];
    if (c.rd) { c.F(0, 'prep', 320, 'flood@1').F(320, 'exec', 420, 'flood@1').F(740, 'recover', 460, 'flood@0'); c.X(400, 'tideWash', 560, { who, scraps: true }); return c.done(620, 1200); }
    c.F(0, 'prep', 320, 'flood').F(320, 'exec', 420, 'flood').F(740, 'recover', 460, 'flood');
    c.X(380, 'tideWash', 640, { who, scraps: true });
    return c.done(620, 1200);
  });
  A.deliver('clerk', 'shroud', (a) => {
    const c = A.kit(a);
    if (c.rd) { c.F(0, 'prep', 300, 'shroud@1').F(300, 'cast', 600, 'shroud@1').F(900, 'recover', 450, 'shroud@0'); c.X(340, 'veilRelease', 700, {}).X(700, 'mistRoll', 560, {}); return c.done(760, 1350); }
    c.F(0, 'prep', 300, 'shroud').F(300, 'cast', 600, 'shroud').F(900, 'recover', 450, 'shroud');
    c.X(340, 'veilRelease', 760, {});
    c.X(700, 'mistRoll', 560, {});
    return c.done(760, 1350);
  });
  A.deliver('clerk', 'plea', (a) => {
    const c = A.kit(a);
    if (c.rd) { c.F(0, 'prep', 300, 'plea@1').F(300, 'cast', 640, 'plea@1').F(940, 'recover', 320, 'plea@0'); c.X(380, 'note', 760, { from: 'foe', to: 'party', fade: true }); return c.done(680, 1260); }
    c.F(0, 'prep', 300, 'plea').F(300, 'cast', 640, 'plea').F(940, 'recover', 320, 'plea');
    c.X(380, 'note', 760, { from: 'foe', to: 'party', fade: true });
    return c.done(680, 1260);
  });
  A.deliver('clerk', 'mend', (a) => {
    const c = A.kit(a), fv = a.fv || {}, i = Math.min((fv.maxKnots || 1) - 1, fv.knots || 0);
    if (c.rd) { c.F(0, 'cast', 900, 'mend@3').F(900, 'recover', 300, 'hover@0'); c.X(240, 'mendThread', 620, { i }); return c.done(760, 1200); }
    c.F(0, 'prep', 240, 'charge').F(240, 'cast', 660, 'mend').F(900, 'recover', 300, 'hover');
    c.X(240, 'mendThread', 620, { i });
    c.X(760, 'stampSeal', 300, { knot: i });
    return c.done(760, 1200);
  });
  A.auditFamily('clerk', {
    anatomy: 'cloth (robed official)', frame: [224, 212], anchor: [116, 102], was: [168, 188],
    idle: '6 drawings × 150 ms (the stamp rising and falling, the hem swaying, sheets drifting)',
    materials: 'robe with folds lit from the left and a swaying hem, paper collar and cap band, wooden stamp handle, vermilion seal, loose bevelled sheets',
    moves: { strike: 'stamp raised high, a glide in, the seal brought down on its target', lie: 'holds up a false document (a pane slides to you)', mirror: 'holds up a glossy sheet that turns words back', charge: 'stamp overhead, seal glowing', flood: 'sheets wheel wide; a tide of water and paper across both', shroud: 'sheets fan out; a paper-strewn fog', plea: 'bows and offers a letter', mend: 'a small exact stamp on the cord' },
    reactions: 'recoil (rocks back, cap tips), release (a sheet slips loose), balk (stamp drops), settle (stamp laid down, head bowed)',
    overlays: 'Shroud veil as fog with paper scraps; Heat pips; Gathering motes', note: 'now faces the party with its stamp in its near hand',
  });
})();
