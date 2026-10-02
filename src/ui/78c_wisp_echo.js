/* Creatures A — the wisp (Reedling, Ember Wisp, Hush Mote, Harbour Fog, Frost Wisp, Stray Name)
 * and the echo (The Mill Echo, Shelved Echo, Road Echo). Spirit / abstract anatomy (§9.2):
 * coherent expansion, separation, distortion and return of recognizable forms — a wisp's head
 * squashes and leads, its tail streams and coils; an echo's rings, shards and core gather,
 * fling and come back — never arbitrary scaling noise.
 *
 * Wisp: native 176 × 200, origin (88, 70) (was 132 × 200 → 132 × 180): room for the tail to
 * stream sideways in a dart and for the heat crown. Pose q: hx, hy head offset; rx, ry head
 * radii; point (0 … 1, the head leads toward the party as a comet); tlen, tw, tamp, tcurl,
 * tlean tail; ph tail phase; glow (aura), core (inner light), eye, look, mouth, crown (flames
 * on its head), droop (a pleading tilt of the eyes).
 * Echo: native 208 × 208, origin (104, 104) (was 184 × 184): shards can gather to one side and
 * fling outward. Pose q: rph ring phase, rint ring strength, rsp ring spacing, shR shard orbit,
 * rot, aim (shards gathered toward the party), out (flung along the aim), pane (assembled into a
 * pane), coreS, mouth, eye, look, warm (ember tint for Heat), dim. */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const A = RB.creaturesA, K = RB.pxkit;
  const mixh = (a, b, k) => K.hex(K.mix(a, b, k));
  const cl = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const AIM = [-0.74, 0.67];
  const TAU = Math.PI * 2;

  // =============================================================================================
  // WISP
  // =============================================================================================
  function wispRig(L, q, o, H) {
    const col = o.col || '#9fb8e8';
    const M = K.mat(col, { n: 5, at: 3, step: 0.1 });
    const Mt = K.mat(col, { n: 4, at: 2, step: 0.1, alpha: 205, line: false });
    const Mf = K.mat(col, { n: 3, at: 1, step: 0.1, alpha: 130, line: false });
    const hot = K.solid(K.mix(K.parse(col), [255, 252, 236, 255], 0.75), { line: false });
    const aura = L.like(), body = L.like();
    const hx = q.hx, hy = q.hy, rx = q.rx, ry = q.ry;
    H.glow(aura, hx, hy + 4, 46 * q.glow, 44 * q.glow, col, Math.min(0.5, 0.32 * q.glow), 3);
    // the tail: one tapering ribbon from under the head, streaming, coiling or hanging
    H.tail(body, hx + q.tlean * 4, hy + 12, q.tlen, q.tw, q.ph, [[0, q.tlen * 0.57, M], [q.tlen * 0.57, q.tlen * 0.8, Mt], [q.tlen * 0.8, 400, Mf]], { amp: q.tamp, curl: q.tcurl, lean: q.tlean });
    // the head: a sphere, or (point) an egg drawn out along its flight toward the party — the
    // round front leading, the back tapering into the streaming tail
    const p = q.point, ax = AIM[0], ay = AIM[1];
    const fr = Math.max(rx, ry) * (1 + 0.12 * p), br = Math.max(rx, ry) * (1 + 0.55 * p), side = Math.min(rx, ry) * (1 - 0.1 * p);
    body.fill(hx - rx - 30, hy - ry - 30, hx + rx + 30, hy + ry + 30, (x, y) => {
      if (p <= 0) { const a = (x - hx) / rx, b = (y - hy) / ry; return a * a + b * b <= 1; }
      const u = (x - hx) * ax + (y - hy) * ay, v = -(x - hx) * ay + (y - hy) * ax; // along / across the flight
      const a = u / (u >= 0 ? fr : br), b = v / side;
      return a * a + b * b <= 1;
    }, M, K.sphere(hx - 2 + ax * 3 * p, hy - 2 + ay * 3 * p, rx + 2, ry + 2, { amb: 0.2, rim: 0.12 }));
    if (q.crown > 0) {
      // the Ember Wisp's flare: flame tongues standing up from the head
      const fl = K.mat(mixh(col, '#ffd27a', 0.5), { n: 4, at: 2, step: 0.12 });
      const fy = K.mat('#fff0b8', { n: 3, at: 1, step: 0.1, line: false });
      for (let i = 0; i < 5; i++) {
        const x = hx - 18 + i * 9, h = (10 + ((i * 7) % 5) * 3 + (i === 2 ? 6 : 0)) * q.crown, sw = Math.sin(q.ph + i * 1.3) * 3 * q.crown;
        body.poly([[x - 6, hy - ry + 6], [x + sw, hy - ry - h], [x + 6, hy - ry + 6]], fl, 2);
        body.poly([[x - 3, hy - ry + 6], [x + sw * 1.2, hy - ry - h * 0.6], [x + 3, hy - ry + 6]], fy, 1);
      }
    }
    A.outline(body);
    // inner light: a warm core cluster up-left of centre
    body.onto((b) => {
      b.ell(hx - 8, hy - 9, 9 * (0.8 + 0.3 * q.core), 7 * (0.8 + 0.3 * q.core), M, 4);
      b.ell(hx - 11, hy - 12, 4 + q.core * 2, 3 + q.core, hot, 0);
    });
    // eyes (narrowed, shut, or pleading), and a mouth when it breathes out
    const lx = q.look > 0.5 ? -2 : 0, ly = q.look > 0.5 ? 1 : 0;
    if (q.eye < 0.25) for (const s of [-1, 1]) { body.line(hx + s * 10 - 3, hy + 3, hx + s * 10 + 3, hy + 3, H.ink, 1); body.dot(hx + s * 10 + (s < 0 ? -3 : 3), hy + 2, H.ink, 1); }
    else {
      H.eyes(body, hx + 1 + lx, hy + 2 + ly, 10, { rx: 3.5, ry: 6 * Math.max(0.35, q.eye) });
      if (q.droop > 0) for (const s of [-1, 1]) body.line(hx + s * 10 - 4 + lx, hy - 5 + (s < 0 ? 2 : -0) * q.droop + ly, hx + s * 10 + 4 + lx, hy - 5 + (s < 0 ? 0 : 2) * q.droop + ly, M, 1);
    }
    if (q.mouth > 0) body.ell(hx + lx, hy + 13 + ly, 2 + q.mouth * 3, 1.5 + q.mouth * 3, H.ink, 0);
    return body.under(aura);
  }
  const wBase = { hx: 0, hy: 0, rx: 30, ry: 29, point: 0, tlen: 70, tw: 25, tamp: 11, tcurl: 11, tlean: 0, ph: 0, glow: 1, core: 0.5, eye: 1, look: 0, mouth: 0, crown: 0, droop: 0 };
  const PH = (f, n) => (f / n) * Math.PI * 2;
  const wIdle = [0, 1, 2, 3, 4, 5, 6, 7].map((f) => ({ ph: PH(f, 8), rx: 30 + [0, 0.5, 1, 0.5, 0, -0.5, -1, -0.5][f], ry: 29 - [0, 0.5, 1, 0.5, 0, -0.5, -1, -0.5][f], core: 0.4 + 0.25 * Math.sin(PH(f, 8)), glow: 1 + 0.06 * Math.sin(PH(f, 8) + 1), tlean: 0.04 * Math.sin(PH(f, 8)) }));
  const wTable = {
    'prep.strike': [
      { rx: 32, ry: 27, tamp: 14, tcurl: 9, tlean: -0.15, glow: 1.15, core: 0.8, look: 1, hx: 2, hy: -1, ph: 1 },
      { rx: 34, ry: 25, tamp: 16, tcurl: 8, tlean: -0.25, glow: 1.25, core: 1, look: 1, hx: 4, hy: -2, eye: 0.8, ph: 2 },
      { rx: 35, ry: 24, tamp: 17, tcurl: 8, tlean: -0.3, glow: 1.3, core: 1, look: 1, hx: 5, hy: -3, eye: 0.7, ph: 2.6 },
    ],
    'exec.strike': [
      { rx: 27, ry: 30, point: 0.5, tlen: 78, tamp: 6, tlean: 0.5, glow: 1.3, core: 1, look: 1, eye: 0.7, ph: 3.4 },
      { rx: 25, ry: 31, point: 1, tlen: 84, tamp: 4, tlean: 0.75, glow: 1.35, core: 1, look: 1, eye: 0.7, ph: 4.2 },
      { rx: 26, ry: 30, point: 0.8, tlen: 82, tamp: 5, tlean: 0.7, glow: 1.4, core: 1, look: 1, eye: 0.6, ph: 5 },
    ],
    'exec.impact': [
      { rx: 35, ry: 24, tlen: 72, tamp: 10, tlean: 0.55, glow: 1.6, core: 1, look: 1, eye: 0.5, hx: -2, hy: 2, ph: 5.6 },
      { rx: 29, ry: 30, tlen: 70, tamp: 12, tlean: 0.3, glow: 1.3, core: 0.8, look: 1, eye: 0.8, ph: 6.2 },
    ],
    'exec.push': [
      { rx: 36, ry: 23, tamp: 12, tlean: 0.4, glow: 1.4, eye: 0.4, look: 1, hx: 3, ph: 5.4 },
      { rx: 26, ry: 30, point: 0.6, tlen: 80, tamp: 6, tlean: 0.6, glow: 1.4, eye: 0.6, look: 1, ph: 6 },
    ],
    'exec.miss': [{ rx: 24, ry: 32, point: 0.9, tlen: 88, tamp: 3, tlean: 0.9, glow: 1.1, eye: 0.6, hx: -4, hy: 3, ph: 5.2 }],
    'recover.strike': [
      { rx: 28, ry: 31, tamp: 15, tlean: -0.35, glow: 1.2, core: 0.8, ph: 0.4 },
      { rx: 31, ry: 28, tamp: 13, tlean: -0.2, glow: 1.1, core: 0.6, ph: 1.2 },
      { rx: 30, ry: 29, tamp: 11, tlean: -0.05, glow: 1, core: 0.5, ph: 2 },
    ],
    'recover.hover': [{ rx: 30.5, ry: 28.5, tamp: 11, ph: 2.6 }],
    'recover.deflect': [
      { rx: 37, ry: 22, tamp: 16, tlean: -0.5, glow: 1.5, eye: 0.3, hx: 5, hy: -3, ph: 0.2 },
      { rx: 27, ry: 31, tamp: 14, tlean: -0.3, glow: 1.2, eye: 0.7, hx: 2, ph: 1 },
      { rx: 30, ry: 29, tamp: 12, tlean: -0.1, glow: 1, ph: 1.8 },
    ],
    // Sweep (the Reedling): it rises, coils, and whirls round over both of you, tail flung wide
    'prep.sweep': [
      { rx: 31, ry: 28, tamp: 15, tcurl: 8, tlean: -0.4, hy: -3, glow: 1.15, look: 1, ph: 1 },
      { rx: 32, ry: 27, tamp: 18, tcurl: 7, tlean: -0.55, hy: -5, glow: 1.25, look: 1, ph: 2 },
    ],
    'exec.sweep': [
      { rx: 34, ry: 26, tamp: 14, tlean: 0.85, tlen: 80, glow: 1.3, look: 1, ph: 3 },
      { rx: 32, ry: 27, tamp: 16, tlean: 0.5, tlen: 84, glow: 1.35, look: 1, ph: 4 },
      { rx: 30, ry: 29, tamp: 18, tlean: -0.2, tlen: 84, glow: 1.35, look: 1, ph: 5 },
      { rx: 29, ry: 30, tamp: 16, tlean: -0.6, tlen: 80, glow: 1.25, look: 1, ph: 6 },
    ],
    'recover.sweep': [
      { rx: 31, ry: 28, tamp: 14, tlean: -0.4, glow: 1.15, ph: 0.6 },
      { rx: 30, ry: 29, tamp: 12, tlean: -0.1, glow: 1.05, ph: 1.6 },
    ],
    // Heat (the Ember Wisp): it draws in, then flares — a crown of flame, the aura swelling
    'prep.heat': [
      { rx: 28, ry: 28, glow: 0.9, core: 0.9, crown: 0.2, tamp: 8, eye: 0.8, ph: 1 },
      { rx: 27, ry: 27, glow: 0.85, core: 1, crown: 0.35, tamp: 6, eye: 0.6, ph: 1.6 },
    ],
    'cast.heat': [
      { rx: 32, ry: 31, glow: 1.5, core: 1, crown: 0.8, tamp: 12, mouth: 0.4, look: 1, ph: 2.4 },
      { rx: 33, ry: 32, glow: 1.75, core: 1, crown: 1, tamp: 13, mouth: 0.6, look: 1, ph: 3.2 },
      { rx: 32, ry: 32, glow: 1.7, core: 1, crown: 0.9, tamp: 12, mouth: 0.5, look: 1, ph: 4 },
      { rx: 33, ry: 31, glow: 1.6, core: 0.9, crown: 1, tamp: 12, mouth: 0.4, look: 1, ph: 4.8 },
    ],
    'recover.heat': [
      { rx: 31, ry: 30, glow: 1.3, core: 0.8, crown: 0.5, tamp: 11, ph: 5.6 },
      { rx: 30, ry: 29, glow: 1.1, core: 0.6, crown: 0.15, tamp: 11, ph: 0.2 },
    ],
    // Shroud (the Hush Mote, the Harbour Fog): it breathes in, swelling, then breathes its fog out
    'prep.shroud': [
      { rx: 32, ry: 31, glow: 1.05, eye: 0.6, tamp: 9, tcurl: 9, ph: 1 },
      { rx: 34, ry: 33, glow: 1.1, eye: 0.2, tamp: 8, tcurl: 8, tlean: -0.2, ph: 1.6 },
    ],
    'cast.shroud': [
      { rx: 33, ry: 32, mouth: 1, eye: 0.5, glow: 1.1, tamp: 12, ph: 2.4 },
      { rx: 31, ry: 31, mouth: 1, eye: 0.5, glow: 1, tamp: 14, tlean: 0.2, ph: 3.2 },
      { rx: 29, ry: 30, mouth: 0.8, eye: 0.6, glow: 0.95, tamp: 15, tlean: 0.1, ph: 4 },
      { rx: 28, ry: 29, mouth: 0.6, eye: 0.7, glow: 0.9, tamp: 14, tlean: -0.1, ph: 4.8 },
      { rx: 29, ry: 29, mouth: 0.3, eye: 0.8, glow: 0.9, tamp: 12, ph: 5.6 },
    ],
    'recover.shroud': [
      { rx: 29.5, ry: 29, eye: 0.9, glow: 0.95, tamp: 11, ph: 0.2 },
      { rx: 30, ry: 29, glow: 1, tamp: 11, ph: 1 },
    ],
    // Chill (the Frost Wisp): it breathes in, then breathes cold at the one it aims at
    'prep.chill': [
      { rx: 32, ry: 31, glow: 1.05, eye: 0.6, hx: 2, look: 1, ph: 1 },
      { rx: 34, ry: 32, glow: 1.1, eye: 0.4, hx: 3, look: 1, ph: 1.6 },
    ],
    'exec.chill': [
      { rx: 29, ry: 30, point: 0.3, mouth: 1, eye: 0.6, look: 1, tlean: 0.4, glow: 1.2, ph: 2.4 },
      { rx: 28, ry: 30, point: 0.35, mouth: 1, eye: 0.6, look: 1, tlean: 0.5, glow: 1.25, ph: 3.2 },
      { rx: 29, ry: 29, point: 0.2, mouth: 0.6, eye: 0.7, look: 1, tlean: 0.3, glow: 1.1, ph: 4 },
    ],
    'recover.chill': [
      { rx: 30, ry: 29, tlean: 0.1, glow: 1.05, ph: 4.8 },
      { rx: 30, ry: 29, ph: 5.6 },
    ],
    // Re-tying (the Frost Wisp): its head bows and the tail-tip curls down to the loose knot
    'cast.mend': [
      { hy: 3, eye: 0.5, tlean: -0.4, tlen: 82, tamp: 8, tcurl: 9, glow: 0.95, ph: 1 },
      { hy: 4, eye: 0.3, tlean: -0.55, tlen: 88, tamp: 6, tcurl: 8, glow: 1, core: 0.8, ph: 2 },
      { hy: 4, eye: 0.3, tlean: -0.6, tlen: 90, tamp: 7, tcurl: 7, glow: 1.05, core: 1, ph: 3 },
      { hy: 3, eye: 0.5, tlean: -0.45, tlen: 84, tamp: 9, tcurl: 9, glow: 1, ph: 4 },
    ],
    // Plea (the Stray Name): it dims and drifts nearer, eyes pleading
    'prep.plea': [
      { glow: 0.8, core: 0.3, droop: 1, eye: 0.8, hy: 1, tamp: 8, ph: 1 },
      { glow: 0.7, core: 0.25, droop: 1.5, eye: 0.8, hy: 2, tamp: 7, ph: 1.6 },
    ],
    'cast.plea': [
      { glow: 0.75, core: 0.35, droop: 1.5, eye: 0.9, look: 1, hy: 2, tamp: 9, tlean: 0.2, ph: 2.4 },
      { glow: 0.8, core: 0.45, droop: 1.5, eye: 0.9, look: 1, hy: 1, tamp: 10, tlean: 0.3, ph: 3.2 },
      { glow: 0.78, core: 0.4, droop: 1.5, eye: 0.85, look: 1, hy: 2, tamp: 9, tlean: 0.25, ph: 4 },
      { glow: 0.8, core: 0.5, droop: 1, eye: 0.9, look: 1, hy: 1, tamp: 10, tlean: 0.2, ph: 4.8 },
    ],
    'recover.plea': [
      { glow: 0.9, core: 0.45, droop: 0.5, tamp: 10, ph: 5.6 },
      { glow: 1, core: 0.5, tamp: 11, ph: 0.2 },
    ],
    rest: [
      { glow: 0.85, core: 0.35, eye: 0.5, hy: 3, tamp: 8, tlean: -0.2, ph: 0.6 },
      { glow: 0.75, core: 0.3, eye: 0.25, hy: 5, tamp: 6, tlean: -0.35, tcurl: 8, ph: 1.2 },
      { glow: 0.75, core: 0.35, eye: 0.2, hy: 6, tamp: 6, tlean: -0.4, tcurl: 8, ph: 1.8 },
      { glow: 0.85, core: 0.4, eye: 0.5, hy: 4, tamp: 8, tlean: -0.2, ph: 2.4 },
    ],
    recoil: [
      { rx: 26, ry: 32, hx: 4, hy: -2, tamp: 16, tlean: -0.6, glow: 1.4, eye: 0.35, ph: 3 },
      { rx: 29, ry: 30, hx: 2, tamp: 13, tlean: -0.3, glow: 1.15, eye: 0.7, ph: 3.8 },
    ],
    // a knot loosens: the light flickers bright and a thread of it lifts free
    release: [
      { glow: 1.5, core: 1, eye: 1.1, rx: 31, ry: 30, ph: 1 },
      { glow: 0.85, core: 0.3, eye: 0.6, rx: 29.5, ry: 29, tamp: 13, ph: 1.8 },
      { glow: 1.2, core: 0.7, eye: 0.9, ph: 2.6 },
    ],
    // interrupted: it sputters — the light gutters, the head shrinks, the tail droops
    balk: [
      { glow: 0.6, core: 0.15, rx: 27, ry: 26, tamp: 4, tlean: -0.2, eye: 0.5, ph: 0.4 },
      { glow: 0.75, core: 0.3, rx: 28, ry: 27, tamp: 6, eye: 0.6, ph: 1 },
      { glow: 0.95, core: 0.45, rx: 29.5, ry: 28.5, tamp: 9, eye: 0.85, ph: 1.6 },
    ],
    settle: [
      { glow: 1.2, core: 0.7, eye: 0.6, tamp: 9, ph: 1 },
      { glow: 1.1, core: 0.6, eye: 0.3, tamp: 8, tlean: -0.15, ph: 2 },
      { glow: 1.05, core: 0.6, eye: 0, tamp: 7, tlean: -0.2, ph: 3 },
    ],
  };
  A.family('wisp', {
    spec: { w: 176, h: 200, ox: 88, oy: 70, ms: 140, bob: (t) => Math.sin(t / 420) * 5 },
    base: wBase, idle: wIdle, poseTable: wTable, rig: wispRig, recoil: { push: 7 },
    alias: { 'prep.mend': 'prep.plea', 'recover.mend': 'recover.plea' },
    veil: (o) => ({ kind: 'fog', cols: [mixh(o.col || '#9fb8e8', '#ffffff', 0.55), mixh(o.col || '#9fb8e8', '#ffffff', 0.3), mixh(o.col || '#9fb8e8', '#8a94a8', 0.3)] }),
  });

  // ---- wisp deliveries ----------------------------------------------------------------------------
  // Strike: it draws in, darts at its target as a comet (the head leading, the tail streaming), bumps
  // and rebounds, then drifts back — ~1,060 ms, contact 520
  A.deliver('wisp', 'strike', (a) => {
    const c = A.kit(a), oc = A.outcome(a), to = a.aimed;
    if (c.rd) { c.F(0, 'prep', 260, 'strike@2').F(260, 'exec', 260, 'strike@1').F(520, 'recover', 480, oc === 'ward' || oc === 'block' ? 'deflect@0' : 'strike@0'); return c.done(520, 1000); }
    const peak = oc === 'ward' || oc === 'block' ? 0.5 : 0.58;
    c.F(0, 'prep', 240, 'strike');
    c.F(240, 'exec', 280, 'strike', { to, peak, arc: 12, shape: 'out' });
    c.X(250, 'wispTrail', 300, { to });
    if (oc === 'ward' || oc === 'block') { c.F(520, 'recover', 420, 'deflect', { to, peak, shape: 'back' }); c.F(940, 'recover', 120, 'hover'); return c.done(520, 1060); }
    c.F(520, 'exec', 100, oc === 'soft' ? 'push' : oc === 'miss' ? 'miss' : 'impact', { to, peak, shape: 'hold' });
    c.F(620, 'recover', 360, 'strike', { to, peak, arc: -6, shape: 'back' });
    c.F(980, 'recover', 80, 'hover');
    return c.done(520, 1060);
  });
  // Sweep (the Reedling): coils, then whirls over both of you; first contact at 580, the next 120 later
  A.deliver('wisp', 'sweep', (a) => {
    const c = A.kit(a), who = a.comp ? ['pc', 'comp'] : ['pc'];
    if (c.rd) { c.F(0, 'prep', 280, 'sweep@1').F(280, 'exec', 480, 'sweep@1').F(760, 'recover', 400, 'sweep@1'); c.X(300, 'arc', 560, { who, col: a.ctx.foeCol }); return c.done(580, 1200); }
    c.F(0, 'prep', 280, 'sweep');
    c.F(280, 'exec', 360, 'sweep', { to: 'party', peak: 0.42, arc: 22, shape: 'out' });
    c.X(300, 'arc', 560, { who, col: a.ctx.foeCol });
    c.X(300, 'wispTrail', 460, { to: 'party' });
    c.F(640, 'exec', 120, 'sweep@3', { to: 'party', peak: 0.42, shape: 'hold' });
    c.F(760, 'recover', 380, 'sweep', { to: 'party', peak: 0.42, shape: 'back' });
    c.F(1140, 'recover', 60, 'hover');
    return c.done(580, 1200);
  });
  // Heat (the Ember Wisp): draws in, flares a crown of flame; Heat applies at 640 (embers shown then)
  A.deliver('wisp', 'heat', (a) => {
    const c = A.kit(a);
    if (c.rd) { c.F(0, 'prep', 260, 'heat@1').F(260, 'cast', 640, 'heat@1').F(900, 'recover', 200, 'heat@1'); return c.done(640, 1100); }
    c.F(0, 'prep', 260, 'heat').F(260, 'cast', 640, 'heat').F(900, 'recover', 200, 'heat');
    c.X(280, 'gather', 380, {});
    return c.done(640, 1100);
  });
  // Shroud (the Hush Mote, the Harbour Fog): breathes in, then breathes its fog out; applies at 760
  A.deliver('wisp', 'shroud', (a) => {
    const c = A.kit(a);
    if (c.rd) { c.F(0, 'prep', 300, 'shroud@1').F(300, 'cast', 600, 'shroud@0').F(900, 'recover', 450, 'shroud@1'); c.X(340, 'veilRelease', 700, {}).X(700, 'mistRoll', 560, {}); return c.done(760, 1350); }
    c.F(0, 'prep', 300, 'shroud').F(300, 'cast', 600, 'shroud').F(900, 'recover', 450, 'shroud');
    c.X(340, 'veilRelease', 760, {});
    c.X(700, 'mistRoll', 560, {});
    return c.done(760, 1350);
  });
  // Chill (the Frost Wisp): breathes cold at one target; contact 580
  A.deliver('wisp', 'chill', (a) => {
    const c = A.kit(a), to = a.aimed;
    if (c.rd) { c.F(0, 'prep', 260, 'chill@1').F(260, 'exec', 340, 'chill@1').F(600, 'recover', 440, 'chill@1'); c.X(280, 'frostDust', 320, { to }); return c.done(580, 1050); }
    c.F(0, 'prep', 260, 'chill');
    c.F(260, 'exec', 340, 'chill', { to, peak: 0.1, shape: 'out' });
    c.X(280, 'frostDust', 320, { to, seal: A.outcome(a) === 'ward' || A.outcome(a) === 'block' });
    c.F(600, 'recover', 400, 'chill', { to, peak: 0.1, shape: 'back' });
    return c.done(580, 1050);
  });
  // Re-tying (the Frost Wisp): its tail-tip curls down and draws the knot tight; applies at 760
  A.deliver('wisp', 'mend', (a) => {
    const c = A.kit(a), fv = a.fv || {}, i = Math.min((fv.maxKnots || 1) - 1, fv.knots || 0);
    if (c.rd) { c.F(0, 'cast', 900, 'mend@2').F(900, 'recover', 300, 'plea@1'); c.X(220, 'mendThread', 600, { i }); return c.done(760, 1200); }
    c.F(0, 'prep', 220, 'plea').F(220, 'cast', 680, 'mend').F(900, 'recover', 300, 'plea');
    c.X(220, 'mendThread', 620, { i });
    return c.done(760, 1200);
  });
  // Plea (the Stray Name): dims and drifts nearer; an unanswered note reaches you at 640
  A.deliver('wisp', 'plea', (a) => {
    const c = A.kit(a);
    if (c.rd) { c.F(0, 'prep', 260, 'plea@1').F(260, 'cast', 640, 'plea@1').F(900, 'recover', 300, 'plea@0'); c.X(300, 'note', 760, { from: 'foe', to: 'party', fade: true }); return c.done(640, 1250); }
    c.F(0, 'prep', 260, 'plea');
    c.F(260, 'cast', 640, 'plea', { to: 'party', peak: 0.14, arc: 4, shape: 'out' });
    c.X(300, 'note', 760, { from: 'foe', to: 'party', fade: true });
    c.F(900, 'recover', 350, 'plea', { to: 'party', peak: 0.14, shape: 'back' });
    return c.done(640, 1250);
  });
  A.auditFamily('wisp', {
    anatomy: 'spirit / hovering', frame: [176, 200], anchor: [88, 70], was: [132, 180],
    idle: '8 drawings × 140 ms (tail wave, a breathing squash, inner light pulse) + the float bob',
    materials: 'glowing body with a lit inner core, translucent tapering tail, stepped aura; flame crown (Heat)',
    moves: { strike: 'draw in, comet dart (head leads, tail streams), bump, rebound', sweep: 'coil, whirl over both', heat: 'flare: crown of flame', shroud: 'inhale, breathe fog', chill: 'breath of frost at one', mend: 'tail-tip draws the knot', plea: 'dims, drifts nearer, a note' },
    reactions: 'recoil (squashed back, tail flung), release (flicker, light lifts), balk (gutters), settle (eyes closed, soft glow)',
    overlays: 'Shroud veil as fog in its own colour; Heat pips; Gathering motes',
  });

  // =============================================================================================
  // ECHO
  // =============================================================================================
  function echoRig(L, q, o, H) {
    const col0 = o.col || '#a8c8d8';
    const col = q.warm > 0 ? mixh(col0, '#f0a060', 0.55 * q.warm) : col0;
    const lightAng = Math.atan2(-0.66, -0.56);
    const ra = Math.round(235 * q.rint), rb = Math.round(150 * q.rint), rc = Math.round(80 * q.rint);
    const R = [K.mat(col, { n: 4, at: 2, step: 0.1, alpha: Math.max(20, ra) }), K.mat(col, { n: 4, at: 2, step: 0.1, alpha: Math.max(14, rb), line: false }), K.mat(col, { n: 4, at: 2, step: 0.1, alpha: Math.max(8, rc), line: false })];
    const shard = K.mat(col, { n: 5, at: 3, step: 0.1 });
    const coreM = K.mat(q.warm > 0 ? mixh('#1c2a34', '#3a1a10', q.warm) : '#1c2a34', { n: 4, at: 1, step: 0.07 });
    const rings = L.like(), shards = L.like(), core = L.like();
    // rings spreading out of it (spacing, phase and strength)
    for (let i = 0; i < 3; i++) {
      const r = (28 + ((i * 18 + q.rph * 54) % 54)) * q.rsp * q.coreS;
      const M = R[r < 46 ? 0 : r < 66 ? 1 : 2];
      const th = r < 46 ? 2 : 1.5;
      rings.fill(-r - 3, -r - 3, r + 3, r + 3, (x, y) => { const d = Math.hypot(x, y); return d <= r + th && d >= r - th; }, M,
        (x, y) => K.clamp(0.5 + 0.45 * Math.cos(Math.atan2(y, x) - lightAng), 0, 0.99));
    }
    // shards: orbiting, gathered toward the party, flung along the aim, or locked into a pane
    const aimA = Math.atan2(AIM[1], AIM[0]);
    for (let i = 0; i < 8; i++) {
      let a = (i * Math.PI) / 4 + q.rot + (i % 2 ? 0.2 : 0);
      let r0 = (i % 2 ? 50 : 40) * q.shR;
      if (q.aim > 0) { const tgt = aimA + (i - 3.5) * 0.18, d = ((((tgt - a) % TAU) + TAU * 1.5) % TAU) - Math.PI; a += d * q.aim; r0 *= 1 - 0.15 * q.aim; }
      let cx = Math.cos(a) * r0, cy = Math.sin(a) * r0;
      if (q.out > 0) { const fl = q.out * (22 + (i % 3) * 14); cx += AIM[0] * fl; cy += AIM[1] * fl; }
      if (q.pane > 0) {
        // a pane in front of it, toward the party: shards tile a tilted square
        const px = -46 + (i % 3) * 9 - Math.floor(i / 3) * 3, py = 14 + Math.floor(i / 3) * 10 - (i % 3) * 2;
        cx = cx + (px - cx) * q.pane; cy = cy + (py - cy) * q.pane;
        a = a + ((-0.4 - a) % (Math.PI * 2)) * q.pane;
      }
      shards.save().translate(cx, cy).rotate(a);
      shards.stone([[-6, -3], [10, -5], [16, 0], [9, 5], [-5, 3]], shard, { bevel: 2, face: 2 });
      shards.restore();
    }
    if (q.pane > 0.6) shards.line(-50, 4, -30, 30, K.solid('#ffffff', { line: false }), 0); // its glint
    const cs = q.coreS;
    core.ell(0, 0, 21 * cs, 21 * cs, coreM, K.sphere(0, 0, 21 * cs, 21 * cs, { amb: 0.1, rim: 0.25 }));
    core.fill(-24 * cs, -24 * cs, 24 * cs, 24 * cs, (x, y) => { const d = Math.hypot(x, y); return d <= 23 * cs && d > 21 * cs; }, shard, (x, y) => K.clamp(0.45 + 0.5 * Math.cos(Math.atan2(y, x) - lightAng), 0, 0.99));
    const lx = q.look > 0.5 ? -2 : 0, ly = q.look > 0.5 ? 1 : 0;
    if (q.eye < 0.25) for (const s of [-1, 1]) core.line(s * 7 - 2 + lx, -4, s * 7 + 2 + lx, -4, shard, 4);
    else H.eyes(core, lx, -5 + ly, 7, { col: mixh(col, '#ffffff', 0.4), rx: 2.5, ry: 3.5 * Math.max(0.4, q.eye), shine: false });
    const mo = q.mouth;
    core.ell(lx, 9 + ly, 3 + mo * 3, 2.5 + mo * 4, K.mat('#0a1016', { n: 2, at: 0, line: false }), 0);
    core.fill(-8, 4, 8, 18, (x, y) => { const d = Math.hypot((x - lx) / (5 + mo * 3), (y - 9 - ly) / (4.5 + mo * 4)); return d <= 1 && d > 0.72 && y < 9 + ly; }, shard, 1);
    A.outline(rings); A.outline(shards); A.outline(core);
    const out = rings.over(shards).over(core);
    if (q.dim < 1) out.fade(q.dim);
    return out;
  }
  const eBase = { rph: 0, rint: 1, rsp: 1, shR: 1, rot: 0, aim: 0, out: 0, pane: 0, coreS: 1, mouth: 0, eye: 1, look: 0, warm: 0, dim: 1 };
  const eIdle = [0, 1, 2, 3, 4, 5, 6, 7].map((f) => ({ rph: f / 8, rot: (f * Math.PI) / 32, mouth: f % 4 === 0 ? 0.25 : 0, coreS: 1 + 0.02 * Math.sin(PH(f, 8)) }));
  const eTable = {
    // Strike: the shards gather on the side facing its target, the core draws in — then it shouts
    // them out in a burst of rings
    'prep.strike': [
      { aim: 0.5, coreS: 0.94, rph: 0.1, rot: 0.2, mouth: 0, look: 1 },
      { aim: 0.9, coreS: 0.88, rph: 0.15, rot: 0.3, rint: 0.8, rsp: 0.9, eye: 0.7, look: 1 },
      { aim: 1, coreS: 0.86, rph: 0.18, rot: 0.35, rint: 0.7, rsp: 0.85, eye: 0.6, look: 1 },
    ],
    'exec.strike': [
      { aim: 1, out: 0.4, coreS: 1.08, rph: 0.3, rsp: 1.1, rint: 1.2, mouth: 1, look: 1 },
      { aim: 1, out: 0.9, coreS: 1.12, rph: 0.45, rsp: 1.2, rint: 1.25, mouth: 1, look: 1 },
      { aim: 0.9, out: 1, coreS: 1.06, rph: 0.6, rsp: 1.15, rint: 1.1, mouth: 0.7, look: 1, eye: 0.8 },
    ],
    'exec.impact': [{ aim: 0.7, out: 0.8, coreS: 1.02, rph: 0.7, rsp: 1.1, mouth: 0.4, look: 1 }],
    'exec.push': [{ aim: 1, out: 0.6, coreS: 0.96, rph: 0.68, rsp: 0.9, rint: 0.9, mouth: 0.5, eye: 0.5, look: 1 }],
    'exec.miss': [{ aim: 0.6, out: 1, coreS: 1, rph: 0.7, mouth: 0.3, eye: 0.6 }],
    'recover.strike': [
      { aim: 0.5, out: 0.4, coreS: 1, rph: 0.8, rot: 0.4, mouth: 0.2 },
      { aim: 0.2, out: 0.1, rph: 0.9, rot: 0.45 },
      { rph: 0, rot: 0.5 },
    ],
    'recover.hover': [{ rph: 0.1, rot: 0.55 }],
    'recover.deflect': [
      { aim: 0.6, out: 0.2, coreS: 0.9, rint: 0.6, rsp: 0.8, rph: 0.7, eye: 0.3, mouth: 0.2 },
      { aim: 0.3, coreS: 0.96, rint: 0.8, rph: 0.85, eye: 0.7 },
      { rph: 0, rot: 0.3 },
    ],
    // Mirror (and Lie): the shards drift forward and lock into a pane that turns its words back
    'prep.mirror': [
      { aim: 0.5, pane: 0.3, rph: 0.2, coreS: 0.96, look: 1 },
      { aim: 0.6, pane: 0.7, rph: 0.3, coreS: 0.94, look: 1, eye: 0.8 },
    ],
    'exec.mirror': [
      { pane: 1, rph: 0.4, coreS: 0.96, rint: 1.1, look: 1, mouth: 0.4 },
      { pane: 1, rph: 0.5, coreS: 1, rint: 1.2, look: 1, mouth: 0.6 },
      { pane: 0.8, aim: 0.5, rph: 0.6, coreS: 1, rint: 1.1, look: 1, mouth: 0.3 },
    ],
    'recover.mirror': [
      { pane: 0.4, aim: 0.4, rph: 0.75, rot: 0.3 },
      { rph: 0.9, rot: 0.4 },
    ],
    // Heat (the Mill Echo): its rings warm and quicken, the core swells with the noise
    'prep.heat': [
      { warm: 0.3, coreS: 0.95, rsp: 0.9, rph: 0.1, eye: 0.7 },
      { warm: 0.5, coreS: 0.92, rsp: 0.85, rph: 0.2, eye: 0.6 },
    ],
    'cast.heat': [
      { warm: 0.8, coreS: 1.06, rsp: 1.1, rint: 1.25, rph: 0.35, mouth: 0.8, rot: 0.3 },
      { warm: 1, coreS: 1.1, rsp: 1.15, rint: 1.3, rph: 0.55, mouth: 1, rot: 0.6 },
      { warm: 1, coreS: 1.08, rsp: 1.15, rint: 1.3, rph: 0.75, mouth: 0.8, rot: 0.9 },
      { warm: 0.9, coreS: 1.05, rsp: 1.1, rint: 1.2, rph: 0.95, mouth: 0.6, rot: 1.2 },
    ],
    'recover.heat': [
      { warm: 0.5, coreS: 1.02, rph: 0.1, rot: 1.3 },
      { warm: 0.15, rph: 0.25, rot: 1.35 },
    ],
    // Plea: the rings slow and soften, the shards draw close, the voice small
    'prep.plea': [
      { shR: 0.85, rint: 0.75, rsp: 0.9, coreS: 0.96, eye: 0.8, rph: 0.05 },
      { shR: 0.75, rint: 0.6, rsp: 0.85, coreS: 0.92, eye: 0.7, rph: 0.1 },
    ],
    'cast.plea': [
      { shR: 0.72, rint: 0.6, rsp: 0.85, coreS: 0.92, mouth: 0.3, eye: 0.8, look: 1, rph: 0.15 },
      { shR: 0.7, rint: 0.65, rsp: 0.88, coreS: 0.92, mouth: 0.5, eye: 0.8, look: 1, rph: 0.22 },
      { shR: 0.72, rint: 0.6, rsp: 0.86, coreS: 0.92, mouth: 0.3, eye: 0.75, look: 1, rph: 0.3 },
      { shR: 0.74, rint: 0.62, rsp: 0.88, coreS: 0.93, mouth: 0.2, eye: 0.8, look: 1, rph: 0.38 },
    ],
    'recover.plea': [
      { shR: 0.86, rint: 0.8, rph: 0.5 },
      { rph: 0.6 },
    ],
    // Re-tying (the Shelved Echo): its shards come back and lock into their ring
    'cast.mend': [
      { shR: 1.3, rot: 0.6, rint: 0.8, eye: 0.6, rph: 0.1 },
      { shR: 1.15, rot: 0.4, rint: 0.9, eye: 0.5, rph: 0.2 },
      { shR: 1.0, rot: 0.2, rint: 1.1, eye: 0.6, rph: 0.3, coreS: 1.03 },
      { shR: 0.92, rot: 0.05, rint: 1.2, eye: 0.8, rph: 0.4, coreS: 1.05 },
    ],
    rest: [
      { rint: 0.7, rsp: 0.9, rph: 0.05, eye: 0.5, shR: 0.95 },
      { rint: 0.55, rsp: 0.85, rph: 0.1, eye: 0.2, shR: 0.9 },
      { rint: 0.5, rsp: 0.85, rph: 0.15, eye: 0.2, shR: 0.9 },
      { rint: 0.65, rsp: 0.9, rph: 0.2, eye: 0.5, shR: 0.95 },
    ],
    recoil: [
      { coreS: 0.86, rsp: 1.3, rint: 0.6, shR: 1.25, rot: -0.3, eye: 0.3, mouth: 0.6 },
      { coreS: 0.94, rsp: 1.1, rint: 0.85, shR: 1.1, rot: -0.15, eye: 0.7, mouth: 0.2 },
    ],
    // a knot loosens: one ring breaks wide, the shards loosen and turn
    release: [
      { rsp: 1.25, rint: 1.2, shR: 1.15, rot: 0.3, eye: 1, mouth: 0.4 },
      { rsp: 1.1, rint: 0.9, shR: 1.08, rot: 0.6, eye: 0.7 },
      { rsp: 1.0, rint: 1, shR: 1, rot: 0.8 },
    ],
    // interrupted: the rings collapse in on the core and the shards scatter loosely
    balk: [
      { rsp: 0.7, rint: 0.5, shR: 1.2, rot: 0.6, coreS: 0.9, eye: 0.5, mouth: 0.2 },
      { rsp: 0.85, rint: 0.7, shR: 1.1, rot: 0.4, coreS: 0.95, eye: 0.7 },
      { rsp: 0.95, rint: 0.9, shR: 1.02, rot: 0.2 },
    ],
    settle: [
      { rint: 0.9, rsp: 1.05, rph: 0.2, eye: 0.7 },
      { rint: 0.7, rsp: 1.1, rph: 0.4, eye: 0.3, shR: 1.05 },
      { rint: 0.5, rsp: 1.15, rph: 0.6, eye: 0, shR: 1.1 },
    ],
  };
  A.family('echo', {
    spec: { w: 208, h: 208, ox: 104, oy: 104, ms: 125, bob: (t) => Math.sin(t / 650) * 3 },
    base: eBase, idle: eIdle, poseTable: eTable, rig: echoRig, recoil: { push: 4 },
    alias: { 'prep.lie': 'prep.mirror', 'exec.lie': 'exec.mirror', 'recover.lie': 'recover.mirror', 'prep.mend': 'prep.plea', 'recover.mend': 'recover.plea' },
  });

  // ---- echo deliveries ----------------------------------------------------------------------------
  // Strike: shards gathered to its target's side, then shouted out (a volley) — contact 600, ~1,150
  A.deliver('echo', 'strike', (a) => {
    const c = A.kit(a), oc = A.outcome(a), to = a.aimed;
    if (c.rd) { c.F(0, 'prep', 300, 'strike@2').F(300, 'exec', 320, 'strike@2').F(620, 'recover', 480, 'strike@0'); c.X(320, 'shardVolley', 300, { to, col: a.ctx.foeCol }); return c.done(600, 1150); }
    c.F(0, 'prep', 300, 'strike');
    c.F(300, 'exec', 320, 'strike', { to, peak: 0.16, shape: 'out' });
    c.X(330, 'shardVolley', 300, { to, col: a.ctx.foeCol, seal: oc === 'ward' || oc === 'block' });
    c.F(620, 'exec', 100, oc === 'ward' || oc === 'block' ? 'push' : oc === 'soft' ? 'push' : oc === 'miss' ? 'miss' : 'impact', { to, peak: 0.16, shape: 'hold' });
    c.F(720, 'recover', 360, oc === 'ward' || oc === 'block' ? 'deflect' : 'strike', { to, peak: 0.16, shape: 'back' });
    c.F(1080, 'recover', 70, 'hover');
    return c.done(600, 1150);
  });
  // Mirror and Lie: a pane assembles from its shards and slides to its target — contact 620
  for (const kind of ['mirror', 'lie']) A.deliver('echo', kind, (a) => {
    const c = A.kit(a), to = a.aimed;
    if (c.rd) { c.F(0, 'prep', 300, 'mirror@1').F(300, 'exec', 340, 'mirror@1').F(640, 'recover', 460, 'mirror@0'); c.X(340, 'pane', 300, { to }); return c.done(620, 1150); }
    c.F(0, 'prep', 300, 'mirror');
    c.F(300, 'exec', 340, 'mirror', { to, peak: 0.08, shape: 'out' });
    c.X(340, 'pane', 300, { to });
    c.F(640, 'recover', 460, 'mirror', { to, peak: 0.08, shape: 'back' });
    return c.done(620, 1150);
  });
  // Heat (the Mill Echo): its rings warm and quicken; Heat applies at 680
  A.deliver('echo', 'heat', (a) => {
    const c = A.kit(a);
    if (c.rd) { c.F(0, 'prep', 280, 'heat@1').F(280, 'cast', 620, 'heat@1').F(900, 'recover', 250, 'heat@0'); return c.done(680, 1150); }
    c.F(0, 'prep', 280, 'heat').F(280, 'cast', 620, 'heat').F(900, 'recover', 250, 'heat');
    c.X(300, 'echoRings', 600, { warm: true });
    return c.done(680, 1150);
  });
  // Plea: soft rings and a small voice; the note reaches you at 640
  A.deliver('echo', 'plea', (a) => {
    const c = A.kit(a);
    if (c.rd) { c.F(0, 'prep', 260, 'plea@1').F(260, 'cast', 640, 'plea@1').F(900, 'recover', 300, 'plea@0'); c.X(300, 'note', 760, { from: 'foe', to: 'party', fade: true }); return c.done(640, 1200); }
    c.F(0, 'prep', 260, 'plea').F(260, 'cast', 640, 'plea').F(900, 'recover', 300, 'plea');
    c.X(280, 'echoRings', 700, {});
    c.X(300, 'note', 760, { from: 'foe', to: 'party', fade: true });
    return c.done(640, 1200);
  });
  // Re-tying (the Shelved Echo): shards return and lock; the knot is tied at 760
  A.deliver('echo', 'mend', (a) => {
    const c = A.kit(a), fv = a.fv || {}, i = Math.min((fv.maxKnots || 1) - 1, fv.knots || 0);
    if (c.rd) { c.F(0, 'cast', 900, 'mend@3').F(900, 'recover', 300, 'plea@1'); c.X(220, 'mendThread', 600, { i }); return c.done(760, 1200); }
    c.F(0, 'prep', 220, 'plea').F(220, 'cast', 680, 'mend').F(900, 'recover', 300, 'plea');
    c.X(220, 'mendThread', 620, { i });
    return c.done(760, 1200);
  });
  A.auditFamily('echo', {
    anatomy: 'echo / abstract', frame: [208, 208], anchor: [104, 104], was: [184, 184],
    idle: '8 drawings × 125 ms (rings spreading, shards turning, the mouth catching a breath) + bob',
    materials: 'translucent rings lit on the light side, bevelled stone shards, a dark glassy core with a rim',
    moves: { strike: 'shards gathered to the target\'s side, shouted out as a volley', mirror: 'shards lock into a pane that slides to its target (also Lie)', heat: 'rings warm and quicken', plea: 'rings soften, shards draw close, a note', mend: 'shards return and lock' },
    reactions: 'recoil (rings blown wide), release (a ring breaks wide), balk (rings collapse), settle (rings fade, eyes closed)',
    overlays: 'Heat pips; Gathering motes',
  });
})();
