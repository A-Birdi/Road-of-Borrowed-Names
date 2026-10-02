/* Creatures A — the Kiln Warden (Chapter 3 boss). Large / constructed (§9.2): readable
 * preparation at its scale and distinct signature beats, with local motion — a kiln does not
 * travel; it breathes in (the dome stretching, the fire sinking), rocks on its base, and belches
 * fire from its firebox; the chimney answers with smoke, the mortar glows when it gathers, the
 * glazed band shimmers when it turns your words back.
 *
 * Native 220 × 262, origin (110, 150), feet +12 (was 172 × 196): room above the chimney for
 * the smoke it pours out and on the party's side for the flames licking from its mouth.
 * Pose q: lean (+ toward the party, rocking on its base), sq (− breathing in: taller and
 * narrower), fire (flame height), fb (flame heat, toward white), lick (flames leaving the
 * mouth toward the party), eyeW (0 narrowed … 1 wide), eyeG (glow), smoke (0 … 2), sph (its
 * phase), glaze (the band's shimmer), brick (the mortar glowing), droop (a softened brow). */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const A = RB.creaturesA, K = RB.pxkit;
  const mixh = (a, b, k) => K.hex(K.mix(a, b, k));
  const cl = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

  function wardenRig(L, q, o, H) {
    const clay = K.mat(o.col || '#8a5a40', { n: 5, at: 2, step: 0.085 });
    const glazeM = K.mat('#8fb8b0', { n: 5, at: 2, step: 0.1 });
    const soot = K.mat('#2a1a16', { n: 3, at: 1, step: 0.05 });
    const hot = (c) => mixh(c, '#fff4c8', 0.45 * q.fb);
    const fireR = K.mat(hot('#d8502a'), { n: 3, at: 1, step: 0.1, line: false });
    const fireO = K.mat(hot('#f0902e'), { n: 3, at: 1, step: 0.1, line: false });
    const fireY = K.mat(hot('#ffd070'), { n: 3, at: 1, step: 0.1, line: false });
    const eye = K.mat(mixh('#ffd070', '#ffffff', 0.4 * q.eyeG), { n: 3, at: 1, step: 0.1, line: false });
    const smokeM = K.mat('#8a8490', { n: 3, at: 1, step: 0.08, alpha: 150, line: false });
    const mortarHot = K.solid(mixh('#f08a40', '#ffd070', 0.5), { line: false });
    const glowL = L.like(), body = L.like(), fx = L.like(), fire = L.like();
    // the whole kiln rocks on its base and stretches as it breathes
    const sx = 1 + q.sq * 0.6, sy = 1 - q.sq;
    const T = (Lr) => Lr.save().translate(0, 70).rotate(-q.lean).scale(sx, sy).translate(0, -70);
    const hw = (y) => (y >= -18 ? 54 + Math.max(0, y - 40) * 0.2 : 54 * Math.sqrt(Math.max(0, 1 - ((y + 18) / 54) ** 2)));
    T(body);
    A.stone(body, [[-9, -88], [9, -88], [10, -64], [-10, -64]], clay, { bevel: 3, face: 1 });
    body.rect(-11, -90, 22, 4, soot, 1);
    body.fill(-60, -72, 60, 70, (x, y) => y >= -72 && y < 70 && Math.abs(x) <= hw(y), clay, (x, y) => {
      const row = Math.floor((y + 72) / 8), jx = Math.floor((row % 2) * 7 + x + 60) % 14;
      const my = Math.floor(y + 72) % 8;
      const nx = x / (hw(y) || 1);
      const base = 0.46 - nx * 0.28 - (y > 40 ? 0.08 : 0) + (y < -30 ? 0.12 * (1 + nx) : 0);
      const tint = ((K.hh(Math.floor((x + 60 + (row % 2) * 7) / 14), row, 5) % 3) - 1) * 0.07;
      if (my === 7 || jx === 0) return K.clamp(base - 0.28, 0, 0.99);
      if (my === 0 || jx === 1) return K.clamp(base + 0.12 + tint, 0, 0.99);
      return K.clamp(base + tint, 0, 0.99);
    });
    // the glazed band; its shimmer travels along it when it turns your words back
    body.fill(-58, -4, 58, 6, (x, y) => y >= -4 && y < 5 && Math.abs(x) <= hw(y) + 1, glazeM, (x, y) => {
      const sh = q.glaze > 0 ? Math.max(0, 1 - Math.abs(x - (q.glaze * 140 - 70)) / 14) * 0.5 : 0;
      return K.clamp(0.62 - x / 140 - (y + 4) / 18 + sh, 0, 0.99);
    });
    body.rect(-40, -3, 14, 1, glazeM, 4);
    const mouthIn = (x, y) => y >= 14 && y < 60 && Math.abs(x) <= 24 * (y < 26 ? Math.sqrt(Math.max(0, 1 - ((26 - y) / 12) ** 2)) : 1);
    const archIn = (x, y) => y >= 10 && y < 62 && Math.abs(x) <= 29 * (y < 26 ? Math.sqrt(Math.max(0, 1 - ((26 - y) / 16) ** 2)) : 1);
    body.fill(-30, 8, 30, 62, archIn, clay, (x, y) => K.clamp(0.72 - (y - 10) / 90 - x / 120, 0, 0.99));
    body.fill(-24, 14, 24, 60, mouthIn, soot, 0);
    A.outline(body);
    // the mortar glowing as it gathers (on the lit seams of the dome)
    if (q.brick > 0) body.onto((b) => {
      for (let y = -64; y < 60; y += 8) { const w = hw(y) * 0.86; for (let x = -w; x < w; x += 3) if (((x + 60) | 0) % 6 < 2 * q.brick + 0.5 && !(y > 8 && Math.abs(x) < 30)) b.dot(x, y + 7, mortarHot, 0); }
    });
    // flames rolling in the firebox (taller with fire; licking out toward the party with lick)
    const tongues = [[-14, 5], [-4, 9], [7, 6], [16, 4]];
    for (let i = 0; i < tongues.length; i++) {
      const [x, hgt] = tongues[i];
      const h = (hgt + ((Math.round(q.sph * 3) + i * 2) % 3) * 4) * q.fire;
      const top = 60 - h * 3, sway = ((Math.round(q.sph * 3) + i) % 3) - 1;
      fire.poly([[x - 7, 60], [x + sway * 2, top], [x + 7, 60]], fireR, 1);
      fire.poly([[x - 4, 60], [x + sway * 3, top + 8], [x + 4, 60]], fireO, 1);
      fire.poly([[x - 2, 60], [x + sway * 3, top + 18], [x + 2, 60]], fireY, 1);
    }
    fire.erase(-60, -100, 60, 100, (x, y) => !mouthIn(x, y));
    if (q.lick > 0) {
      // tongues of flame leaving the mouth toward the party (lower left once on screen)
      for (let i = 0; i < 3; i++) {
        const len = (18 + i * 8) * q.lick, y0 = 30 + i * 9;
        fire.poly([[-20, y0 - 6], [-20 - len, y0 - 2 + i * 3], [-20, y0 + 6]], fireR, 1);
        fire.poly([[-20, y0 - 3], [-20 - len * 0.7, y0 + i * 2], [-20, y0 + 3]], fireO, 1);
        fire.poly([[-20, y0 - 1], [-20 - len * 0.4, y0 + i], [-20, y0 + 2]], fireY, 1);
      }
    }
    body.over(fire);
    // ember eyes in the dome (narrowed, wide, or softened)
    for (const s of [-1, 1]) {
      const h = 2 + 3 * q.eyeW, dr = q.droop * (s < 0 ? -2 : 2);
      body.poly([[s * 8, -30 - h * 0.6 + dr * 0.3], [s * 22, -34 - h * 0.4 - dr], [s * 20, -28 + h * 0.3], [s * 9, -26 + h * 0.3]], soot, 0);
      body.poly([[s * 10, -30 - h * 0.3 + dr * 0.3], [s * 20, -32 - h * 0.2 - dr], [s * 19, -29 + h * 0.2], [s * 10, -28 + h * 0.2]], eye, 2);
    }
    body.restore();
    // smoke from the chimney (more as it stokes up; a thin line when calm)
    T(fx);
    const nS = 3 + Math.round(q.smoke);
    for (let i = 0; i < nS; i++) {
      const k = ((q.sph / 6) + i / nS) % 1, big = 1 + 0.4 * q.smoke;
      const sy0 = -94 - k * (34 + 8 * q.smoke);
      fx.ell(-2 + Math.sin(k * 6 + i) * 4 + k * 10, sy0, (5 + k * 6) * big, (4 + k * 4) * big, smokeM, (x, y) => K.clamp(0.8 - k * 0.5 - (y - sy0) / 20, 0, 0.99));
    }
    fx.restore();
    T(glowL);
    H.glow(glowL, -6 * q.lick, 58, 44 + 10 * q.fire, 10 + 4 * q.fire, '#f09040', Math.min(0.5, 0.2 + 0.14 * q.fire), 3);
    H.glow(glowL, 0, -30, 26, 8, '#ffb050', 0.08 + 0.08 * q.eyeG, 2);
    if (q.brick > 0) H.glow(glowL, 0, -10, 58, 62, '#f08a40', 0.1 * q.brick, 3);
    glowL.restore();
    return glowL.over(body).over(fx);
  }
  const wBase = { lean: 0, sq: 0, fire: 1, fb: 0, lick: 0, eyeW: 0.5, eyeG: 0.5, smoke: 0, sph: 0, glaze: 0, brick: 0, droop: 0 };
  const wIdle = [0, 1, 2, 3, 4, 5, 6, 7].map((f) => ({ sph: (f / 8) * 6, fire: 1 + 0.08 * Math.sin((f / 8) * Math.PI * 2), sq: 0.012 * Math.sin((f / 8) * Math.PI * 2), eyeG: 0.5 + (f === 5 ? 0.3 : 0), eyeW: f === 6 ? 0.2 : 0.5 }));
  const wTable = {
    // Strike: it breathes in (taller, the fire sinking, eyes narrowing), then belches fire at one of you
    'prep.strike': [
      { sq: -0.03, fire: 0.8, eyeW: 0.4, lean: -0.02, sph: 1 },
      { sq: -0.06, fire: 0.55, eyeW: 0.25, eyeG: 0.8, lean: -0.04, sph: 1.5 },
      { sq: -0.07, fire: 0.45, eyeW: 0.2, eyeG: 1, lean: -0.05, sph: 1.8 },
    ],
    'exec.strike': [
      { sq: 0.02, fire: 1.4, fb: 0.4, lick: 0.5, eyeW: 0.9, eyeG: 1, lean: 0.03, sph: 2.4 },
      { sq: 0.05, fire: 1.7, fb: 0.8, lick: 1, eyeW: 1, eyeG: 1, lean: 0.06, sph: 3 },
      { sq: 0.04, fire: 1.6, fb: 0.6, lick: 1.2, eyeW: 0.9, eyeG: 1, lean: 0.06, sph: 3.6 },
    ],
    'exec.impact': [
      { sq: 0.03, fire: 1.3, fb: 0.4, lick: 0.8, eyeW: 0.8, lean: 0.05, sph: 4.2, smoke: 0.5 },
      { sq: 0.02, fire: 1.1, fb: 0.2, lick: 0.4, eyeW: 0.7, lean: 0.03, sph: 4.8, smoke: 1 },
    ],
    'exec.push': [
      { sq: 0.01, fire: 1.2, lick: 0.6, eyeW: 0.3, lean: -0.02, sph: 4.2 },
      { sq: 0.04, fire: 1.5, fb: 0.5, lick: 1, eyeW: 0.9, lean: 0.05, sph: 4.8 },
    ],
    'exec.miss': [{ sq: 0.04, fire: 1.4, lick: 1.3, eyeW: 0.6, lean: 0.08, sph: 4.4 }],
    'recover.strike': [
      { sq: 0, fire: 1, lick: 0.2, eyeW: 0.6, lean: 0.02, smoke: 1.5, sph: 5.4 },
      { sq: -0.01, fire: 0.9, eyeW: 0.5, lean: -0.01, smoke: 1, sph: 6 },
      { fire: 1, smoke: 0.5, sph: 6.6 },
    ],
    'recover.hover': [{ fire: 1, smoke: 0.2, sph: 7.2 }],
    'recover.deflect': [
      { sq: -0.02, fire: 0.6, lick: 0.3, eyeW: 0.2, lean: -0.06, smoke: 1.5, sph: 4.6 },
      { sq: 0, fire: 0.8, eyeW: 0.4, lean: -0.03, smoke: 1, sph: 5.2 },
      { fire: 1, smoke: 0.4, sph: 5.8 },
    ],
    // Sweep: it rears, the fire building, then rocks forward and breathes a sweep of flame across both
    'prep.sweep': [
      { lean: -0.05, fire: 1.2, sq: -0.02, eyeW: 0.6, sph: 1 },
      { lean: -0.09, fire: 1.4, fb: 0.3, sq: -0.04, eyeW: 0.8, eyeG: 1, sph: 1.6 },
    ],
    'exec.sweep': [
      { lean: 0.02, fire: 1.6, fb: 0.6, lick: 0.8, sq: 0.02, eyeW: 1, sph: 2.2 },
      { lean: 0.08, fire: 1.8, fb: 0.8, lick: 1.4, sq: 0.04, eyeW: 1, sph: 2.8 },
      { lean: 0.1, fire: 1.7, fb: 0.7, lick: 1.4, sq: 0.04, eyeW: 1, sph: 3.4 },
      { lean: 0.06, fire: 1.4, fb: 0.4, lick: 0.9, sq: 0.02, eyeW: 0.8, sph: 4 },
    ],
    'recover.sweep': [
      { lean: 0.02, fire: 1.1, lick: 0.3, smoke: 1.5, sph: 4.6 },
      { fire: 1, smoke: 0.8, sph: 5.2 },
    ],
    // Heat: it stokes itself — the fire roars up, the chimney pours smoke, the eyes flare
    'prep.heat': [
      { sq: -0.03, fire: 0.8, eyeW: 0.4, sph: 1 },
      { sq: -0.05, fire: 0.7, eyeW: 0.3, eyeG: 0.8, sph: 1.6 },
    ],
    'cast.heat': [
      { sq: 0.03, fire: 1.6, fb: 0.5, eyeW: 0.9, eyeG: 1, smoke: 1.2, sph: 2.2 },
      { sq: 0.04, fire: 1.9, fb: 0.8, eyeW: 1, eyeG: 1, smoke: 2, sph: 2.8 },
      { sq: 0.03, fire: 1.8, fb: 0.7, eyeW: 1, eyeG: 1, smoke: 2, sph: 3.4 },
      { sq: 0.02, fire: 1.6, fb: 0.5, eyeW: 0.9, eyeG: 0.9, smoke: 1.6, sph: 4 },
    ],
    'recover.heat': [
      { fire: 1.3, fb: 0.2, smoke: 1, sph: 4.6 },
      { fire: 1.1, smoke: 0.5, sph: 5.2 },
    ],
    // Gathering: a deep breath; the mortar between its bricks glows
    'prep.charge': [
      { sq: -0.04, fire: 0.7, eyeW: 0.3, brick: 0.3, sph: 1 },
      { sq: -0.07, fire: 0.6, eyeW: 0.25, brick: 0.6, sph: 1.6 },
    ],
    'cast.charge': [
      { sq: -0.08, fire: 0.7, eyeW: 0.3, eyeG: 0.9, brick: 0.9, sph: 2.2 },
      { sq: -0.08, fire: 0.75, eyeW: 0.3, eyeG: 1, brick: 1.2, sph: 2.8 },
      { sq: -0.07, fire: 0.8, eyeW: 0.35, eyeG: 1, brick: 1.4, sph: 3.4 },
      { sq: -0.06, fire: 0.85, eyeW: 0.4, eyeG: 1, brick: 1.5, sph: 4 },
    ],
    'recover.charge': [
      { sq: -0.02, fire: 0.95, brick: 0.8, sph: 4.6 },
      { fire: 1, brick: 0.3, sph: 5.2 },
    ],
    // Mirror (its record): the glazed band shimmers end to end and turns your words back
    'prep.mirror': [
      { glaze: 0.1, eyeW: 0.4, fire: 0.9, sph: 1 },
      { glaze: 0.25, eyeW: 0.3, fire: 0.85, sph: 1.6 },
    ],
    'exec.mirror': [
      { glaze: 0.45, eyeW: 0.6, fire: 1, lean: 0.02, sph: 2.2 },
      { glaze: 0.65, eyeW: 0.8, fire: 1.1, lean: 0.04, sph: 2.8 },
      { glaze: 0.85, eyeW: 0.7, fire: 1, lean: 0.03, sph: 3.4 },
    ],
    'recover.mirror': [
      { glaze: 1, eyeW: 0.5, sph: 4 },
      { glaze: 0, sph: 4.6 },
    ],
    // Plea (its children, its forgetting): the fire sinks low, its eyes soften, smoke curls up thin
    'prep.plea': [
      { fire: 0.7, eyeW: 0.6, droop: 1, smoke: 0.5, sph: 1 },
      { fire: 0.5, eyeW: 0.55, droop: 1.6, smoke: 0.8, lean: 0.02, sph: 1.6 },
    ],
    'cast.plea': [
      { fire: 0.4, eyeW: 0.55, eyeG: 0.3, droop: 2, smoke: 1, lean: 0.03, sph: 2.2 },
      { fire: 0.35, eyeW: 0.5, eyeG: 0.3, droop: 2, smoke: 1.1, lean: 0.03, sph: 2.8 },
      { fire: 0.4, eyeW: 0.55, eyeG: 0.35, droop: 2, smoke: 1, lean: 0.03, sph: 3.4 },
    ],
    'recover.plea': [
      { fire: 0.7, eyeW: 0.5, droop: 1, smoke: 0.6, sph: 4 },
      { fire: 1, droop: 0, smoke: 0.2, sph: 4.6 },
    ],
    rest: [
      { fire: 0.75, eyeW: 0.35, smoke: 0.3, sph: 0.6 },
      { fire: 0.6, eyeW: 0.15, smoke: 0.2, sph: 1.2 },
      { fire: 0.6, eyeW: 0.15, smoke: 0.2, sph: 1.8 },
      { fire: 0.75, eyeW: 0.35, smoke: 0.3, sph: 2.4 },
    ],
    recoil: [
      { lean: -0.08, sq: 0.03, fire: 1.4, fb: 0.4, eyeW: 0.15, smoke: 1.5, sph: 1 },
      { lean: -0.03, fire: 1.1, eyeW: 0.4, smoke: 1, sph: 1.6 },
    ],
    // a knot loosens: the fire jumps, a puff of smoke, then it settles
    release: [
      { fire: 1.5, fb: 0.4, eyeW: 0.9, smoke: 1.4, sph: 1 },
      { fire: 0.8, eyeW: 0.6, smoke: 1, sph: 1.6 },
      { fire: 1, smoke: 0.5, sph: 2.2 },
    ],
    // interrupted: the fire chokes and black smoke coughs from the chimney
    balk: [
      { lean: -0.05, fire: 0.35, eyeW: 0.2, smoke: 2, sph: 1 },
      { lean: -0.02, fire: 0.6, eyeW: 0.35, smoke: 1.6, sph: 1.6 },
      { fire: 0.9, eyeW: 0.45, smoke: 0.8, sph: 2.2 },
    ],
    settle: [
      { fire: 0.8, eyeW: 0.4, droop: 0.6, smoke: 0.4 },
      { fire: 0.6, eyeW: 0.15, droop: 1, smoke: 0.2 },
      { fire: 0.5, eyeW: 0, eyeG: 0.2, droop: 1, smoke: 0 },
    ],
  };
  A.family('warden', {
    spec: { w: 220, h: 262, ox: 110, oy: 150, dy: 12, ms: 140 },
    base: wBase, idle: wIdle, poseTable: wTable, rig: wardenRig, recoil: { push: 2 },
  });
  // Strike: breathes in, belches a ball of fire at one of you (contact 620), rocks back — ~1,200
  A.deliver('warden', 'strike', (a) => {
    const c = A.kit(a), oc = A.outcome(a), to = a.aimed;
    if (c.rd) { c.F(0, 'prep', 340, 'strike@2').F(340, 'exec', 280, 'strike@1').F(620, 'recover', 580, oc === 'ward' || oc === 'block' ? 'deflect@0' : 'strike@0'); c.X(360, 'kilnBolt', 280, { to }); return c.done(620, 1200); }
    c.F(0, 'prep', 340, 'strike').F(340, 'exec', 280, 'strike');
    c.X(380, 'kilnBolt', 260, { to, seal: oc === 'ward' || oc === 'block' || oc === 'soft' });
    if (oc === 'ward' || oc === 'block') { c.F(620, 'recover', 520, 'deflect'); c.F(1140, 'recover', 60, 'hover'); return c.done(620, 1200); }
    c.F(620, 'exec', 120, oc === 'soft' ? 'push' : oc === 'miss' ? 'miss' : 'impact');
    c.F(740, 'recover', 400, 'strike').F(1140, 'recover', 60, 'hover');
    return c.done(620, 1200);
  });
  // Sweep: rears, then a sweep of flame across both (first at 640, the next 120 later)
  A.deliver('warden', 'sweep', (a) => {
    const c = A.kit(a), who = a.comp ? ['pc', 'comp'] : ['pc'];
    if (c.rd) { c.F(0, 'prep', 320, 'sweep@1').F(320, 'exec', 480, 'sweep@2').F(800, 'recover', 450, 'sweep@0'); c.X(380, 'kilnBreath', 600, { who }); return c.done(640, 1250); }
    c.F(0, 'prep', 320, 'sweep').F(320, 'exec', 480, 'sweep').F(800, 'recover', 450, 'sweep');
    c.X(380, 'kilnBreath', 620, { who });
    return c.done(640, 1250);
  });
  // Heat: it stokes itself (Heat at 700; the embers show then)
  A.deliver('warden', 'heat', (a) => {
    const c = A.kit(a);
    if (c.rd) { c.F(0, 'prep', 300, 'heat@1').F(300, 'cast', 660, 'heat@1').F(960, 'recover', 300, 'heat@0'); return c.done(700, 1260); }
    c.F(0, 'prep', 300, 'heat').F(300, 'cast', 660, 'heat').F(960, 'recover', 300, 'heat');
    c.X(320, 'kilnStoke', 640, {});
    return c.done(700, 1260);
  });
  A.deliver('warden', 'charge', (a) => {
    const c = A.kit(a);
    if (c.rd) { c.F(0, 'prep', 300, 'charge@1').F(300, 'cast', 640, 'charge@3').F(940, 'recover', 300, 'charge@0'); c.X(280, 'gather', 660, {}); return c.done(760, 1240); }
    c.F(0, 'prep', 300, 'charge').F(300, 'cast', 640, 'charge').F(940, 'recover', 300, 'charge');
    c.X(280, 'gather', 660, {});
    return c.done(760, 1240);
  });
  A.deliver('warden', 'mirror', (a) => {
    const c = A.kit(a), to = a.aimed;
    if (c.rd) { c.F(0, 'prep', 300, 'mirror@1').F(300, 'exec', 340, 'mirror@1').F(640, 'recover', 500, 'mirror@0'); c.X(360, 'pane', 300, { to }); return c.done(640, 1180); }
    c.F(0, 'prep', 300, 'mirror').F(300, 'exec', 340, 'mirror').F(640, 'recover', 500, 'mirror');
    c.X(360, 'pane', 300, { to });
    return c.done(640, 1180);
  });
  A.deliver('warden', 'plea', (a) => {
    const c = A.kit(a);
    if (c.rd) { c.F(0, 'prep', 320, 'plea@1').F(320, 'cast', 640, 'plea@1').F(960, 'recover', 340, 'plea@0'); c.X(380, 'note', 760, { from: 'foe', to: 'party', fade: true }); return c.done(700, 1300); }
    c.F(0, 'prep', 320, 'plea').F(320, 'cast', 640, 'plea').F(960, 'recover', 340, 'plea');
    c.X(380, 'note', 760, { from: 'foe', to: 'party', fade: true });
    return c.done(700, 1300);
  });
  A.auditFamily('warden', {
    anatomy: 'large / constructed (boss)', frame: [220, 262], anchor: [110, 150], was: [172, 196],
    idle: '8 drawings × 140 ms (flames rolling, chimney smoke drifting, a slow breath; a blink and an ember flare once a loop)',
    materials: 'brick dome with mortar seams and lit brick edges, teal glazed band, soot firebox, layered flame tongues, translucent smoke',
    moves: { strike: 'breathes in, belches a ball of fire at one', sweep: 'rears, a sweep of flame across both', heat: 'stokes itself: fire roars, smoke pours', charge: 'a deep breath; the mortar glows', mirror: 'the glazed band shimmers and turns words back', plea: 'the fire sinks, eyes soften, smoke curls thin' },
    reactions: 'recoil (rocks back, fire flares), release (fire jumps, a puff of smoke), balk (fire chokes, black smoke), settle (fire low and warm, eyes closed)',
    overlays: 'Heat pips; Gathering motes (with its mortar glow)',
  });
})();
