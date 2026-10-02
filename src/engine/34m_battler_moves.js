/* The battle figures' pose library (battle addendum §7.2–§7.5): for the player and each companion a
 * stance, idle key poses, a calm (reading/writing) variant, gestures in that person's own movement
 * language, and the reactions every human battler needs. src/engine/34_battlers.js draws whatever pose
 * this returns; nothing here draws, and nothing here reads or changes a battle rule.
 *
 * A pose is a set of numbers on one rig (see restPose): the pelvis and spine, the head, where each
 * foot stands and where each wrist goes (the arms follow by IK), which way each palm faces and each
 * hand's shape, what is held (prop), and the secondary motion of hair and cloth. Coordinates are body
 * units in the body's ground frame: x its right, y up from the ground, z its forward (toward the foe).
 *
 * Actors and their language (§7.4; presentation only — no new equipment or backstory):
 *   pc   attentive and balanced; the folio in the left hand, the right hand free for strip and brush;
 *        a response visibly leaves their gesture and they recover with readable confidence.
 *   nao  compact weight shifts, quick looks, practical positioning (a hand on his satchel); short,
 *        decisive pointing and handing motions; an economical recovery.
 *   mio  composed, hands ready before her apron, attention on the ally; measure / uncork / pour / apply
 *        with the vial from the bottles at her hip; a firm, controlled return.
 *   ren  grounded, wide; the lamp out at his left side, the right hand held precise; he raises, thrusts
 *        or swings the lamp to ward and to reveal, and traces with the free hand.
 *   suzu weight on one leg, a hand on her hip, a restrained rhythm (a heel tap); a clear preparatory
 *        beat, then a purposeful flourish, a beckon, a feint, a bow — never every action a dance.
 *   comp any other figure drawn in the battle style (an NPC): the plain companion stance.
 *
 * Gestures: anticipate (k 0→1: the stance to the anticipation key), act (k 0→1: express, then the
 * release at G.release), recover (k 0→1: back to exactly the stance). A foot that moves between two keys
 * is lifted on the way (no sliding). Reactions: hit (variants soft, held), brace (a ward took it), guard
 * (bracing without a ward; variant wary: subtle, while a blow is prepared at you), soothed (receiving a
 * recovery), afflict (variants hush, gust, chill, slip), down, cheer (settle / victory: each person's
 * own). Every reaction but down and cheer ends exactly in the stance.
 *
 * Idle (§7.3): six to eight key poses per person on their own loop, held, with two in-betweens per
 * transition and one settling frame where hair and cloth arrive a beat late. The calm variant (while you
 * read, write or choose) has four quiet keys. Reduced motion: the first key, still. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.battlerMoves = (function () {
  'use strict';
  const clamp01 = (t) => (t < 0 ? 0 : t > 1 ? 1 : t);
  const ease = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
  const bump = (x, a, b) => (x < a || x > b ? 0 : Math.sin(((x - a) / (b - a)) * Math.PI));
  const lerp = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const ACTORS = ['pc', 'nao', 'mio', 'ren', 'suzu', 'comp'];

  function restPose() {
    return {
      pelvis: [0, 0, 0], pelvisYaw: 0, pelvisRoll: 0,
      spineYaw: 0, spinePitch: 3, spineRoll: 0,
      headYaw: 14, headPitch: 0, headRoll: 0,
      footR: [5.5, 0, 3.6], footL: [-5.2, 0, -3], footRLift: 0, footLLift: 0, footRYaw: 18, footLYaw: 4,
      handR: [10.6, 25.5, 2.5], handL: [-10.4, 25.5, 1.2], elbowR: [1, -0.3, -1], elbowL: [-1, -0.3, -1],
      palmR: [-1, -0.2, 0.15], palmL: [1, -0.2, 0.15], handShapeR: 'fist', handShapeL: 'fist',
      hairLag: 0, hairSway: 0, clothSway: 0, act: 'R', leftFree: 0,
      prop: {},
    };
  }
  // values replace (a key pose written as where things go)
  function over(base, o) {
    const r = clone(base);
    for (const k in o) {
      if (k === 'prop') r.prop = Object.assign({}, r.prop, o.prop);
      else r[k] = typeof o[k] === 'object' ? clone(o[k]) : o[k];
    }
    return r;
  }
  // values add (an idle key written as a change from the stance), scaled by amp
  function plus(base, d, amp) {
    const r = clone(base);
    amp = amp == null ? 1 : amp;
    for (const k in d) {
      const v = d[k];
      if (k === 'prop') { for (const q in v) r.prop[q] = (r.prop[q] || 0) + v[q] * amp; }
      else if (Array.isArray(v)) r[k] = (r[k] || [0, 0, 0]).map((x, i) => x + v[i] * amp);
      else if (typeof v === 'number') r[k] = (r[k] || 0) + v * amp;
      else if (amp > 0.3) r[k] = v; // a shape: only when the motion is not damped to stillness
    }
    return r;
  }
  function blend(A, B, t) {
    // (exactly the end key at either end: no rounding residue that could flip a pixel)
    if (t <= 0) return clone(A);
    if (t >= 1) return clone(B);
    const r = {};
    for (const k of new Set([...Object.keys(A), ...Object.keys(B)])) {
      const a = A[k] == null ? B[k] : A[k], b = B[k] == null ? a : B[k];
      if (Array.isArray(a)) r[k] = a.map((v, i) => v + (b[i] - v) * t);
      else if (typeof a === 'number') r[k] = a + (b - a) * t;
      else if (k === 'prop') {
        r.prop = {};
        for (const q of new Set([...Object.keys(a || {}), ...Object.keys(b || {})])) {
          const va = (a || {})[q], vb = (b || {})[q];
          if (Array.isArray(va) || Array.isArray(vb)) r.prop[q] = !Array.isArray(vb) ? va.slice() : !Array.isArray(va) ? vb.slice() : va.map((v, i) => v + (vb[i] - v) * t);
          else r.prop[q] = va == null ? vb * t : vb == null ? va * (1 - t) : va + (vb - va) * t;
        }
      } else r[k] = t < 0.5 ? a : b;
    }
    return r;
  }
  // a foot that moves between two poses is lifted on the way (a step, not a slide)
  // (one foot at a time: the one that moves is lifted while the other stays planted)
  function stepFeet(r, A, B, t) {
    if (t <= 0 || t >= 1) return r;
    const dR = Math.hypot(B.footR[0] - A.footR[0], B.footR[2] - A.footR[2]), dL = Math.hypot(B.footL[0] - A.footL[0], B.footL[2] - A.footL[2]);
    const [f, l, d, o] = dR >= dL ? ['footR', 'footRLift', dR, dL] : ['footL', 'footLLift', dL, dR];
    if (d > 1 && o < 1) r[l] = (r[l] || 0) + Math.sin(Math.PI * t) * Math.min(3, 0.9 + d * 0.3);
    void f;
    return r;
  }
  const blendStep = (A, B, t) => stepFeet(blend(A, B, t), A, B, t);

  // ---- stances ----------------------------------------------------------------------------------------
  const holdsBook = (look, id) => id === 'pc' || ((look && look.acc) || []).includes('book');
  const holdsLeft = (look) => ((look && look.acc) || []).some((a) => a === 'lamp' || a === 'cane');
  const STANCE = {
    // slightly staggered feet (the near, right foot forward), knees soft, leaning in, turned a little
    // further toward the foe than the body; the folio at the left hip, the right hand free and half open
    pc: {
      pelvis: [0, -1.9, 0], spinePitch: 10, spineYaw: 5, headYaw: 12, headPitch: -5,
      footR: [6.2, 0, 4.8], footRYaw: 24, footL: [-6, 0, -3.8], footLYaw: 8,
      handR: [11.4, 31.5, 5.6], elbowR: [1, -0.6, -1], handShapeR: 'relaxed', palmR: [-1, -0.1, 0.3],
      handL: [-10.4, 29.4, -1.2], elbowL: [-1, -0.2, -0.6],
    },
    // compact and forward: weight on the front foot, a lean, the head up to read the foe; the right hand
    // loose and ready to point, the left resting on the flap of the satchel at his hip
    nao: {
      pelvis: [0.6, -2.8, 0.8], spinePitch: 15, spineYaw: 6, headYaw: 10, headPitch: -9,
      footR: [6.6, 0, 5.4], footRYaw: 20, footL: [-5.4, 0, -3.6], footLYaw: 6,
      handR: [10.4, 31.5, 8.2], elbowR: [1, -0.8, -0.6], handShapeR: 'relaxed', palmR: [-0.8, -0.4, 0.3],
      handL: [-9.2, 28.8, -5.2], elbowL: [-1, 0.3, 0.3], handShapeL: 'open', palmL: [0.3, -0.5, -1],
    },
    // upright and composed, feet closer, turned a little toward the one she looks after; her hands ready
    // together before the apron
    mio: {
      pelvis: [0, -1.2, 0], spinePitch: 6, spineYaw: 8, headYaw: 20, headPitch: 3,
      footR: [5.4, 0, 3.8], footRYaw: 14, footL: [-5, 0, -3], footLYaw: 2,
      handR: [4.6, 30.6, 7.8], elbowR: [1, -0.8, -0.4], handShapeR: 'relaxed', palmR: [-0.8, 0.2, 0.4],
      handL: [-2.4, 30.4, 7.6], elbowL: [-1, -0.8, -0.4], handShapeL: 'relaxed', palmL: [0.8, 0.2, 0.4],
    },
    // grounded and wide; the lamp held out at the left side; the right hand raised, flat and precise
    ren: {
      pelvis: [0.2, -2.6, 0], spinePitch: 9, spineYaw: 2, headYaw: 6, headPitch: 3,
      footR: [7.4, 0, 4.2], footRYaw: 22, footL: [-7.2, 0, -4.4], footLYaw: 10,
      handR: [8.8, 38, 7.6], elbowR: [1, -1, -0.4], handShapeR: 'flat', palmR: [-0.7, -0.5, 0.3],
      handL: [-12.6, 30.2, 1.6], elbowL: [-1, -0.5, -0.6], handShapeL: 'fist',
    },
    // her weight on the left leg (the right hip dropped, the shoulders and head tilted against it), the
    // free right foot forward and turned out; the left hand on her hip, the right open at her side
    suzu: {
      pelvis: [-1.2, -1.6, 0], pelvisRoll: 5, spinePitch: 7, spineRoll: -7, spineYaw: 4, headYaw: 12, headPitch: -3, headRoll: 6,
      footR: [7.4, 0, 5.6], footRYaw: 34, footL: [-4.4, 0, -2.6], footLYaw: 4,
      handR: [12.4, 30, 3.6], elbowR: [1, -0.2, -1], handShapeR: 'open', palmR: [-0.4, -1, 0.2],
      handL: [-9.4, 32.4, -1.8], elbowL: [-1, 0.2, -0.5], handShapeL: 'flat', palmL: [1, 0, 0.2],
    },
    comp: {
      pelvis: [0.5, -2.4, 0.3], spinePitch: 12, spineYaw: 3, headYaw: 8, headPitch: -3,
      footR: [7.8, 0, 3.4], footRYaw: 26, footL: [-7, 0, -4.8], footLYaw: 14,
      handR: [12, 30, 4.6], elbowR: [1, -0.6, -1], handL: [-12.8, 29.6, -2.4], elbowL: [-1, -0.4, -1],
    },
  };
  function readyOf(look, id) {
    const base = over(restPose(), STANCE[id] || STANCE.comp);
    // the folio: held at the left hip, upright, its cover outward
    if (holdsBook(look, id)) { base.prop.book = 1; base.prop.bookTilt = -8; base.prop.bookYaw = -40; base.prop.bookAt = [-1.6, 1.4, -1.4]; base.handL = [-10.6, 29.6, -4.2]; base.elbowL = [-1, 0, -0.2]; base.handShapeL = 'cup'; }
    return base;
  }
  // calm: quieter, attention on the one reading and writing (the player reads the folio)
  const CALM = {
    pc: { handL: [-11.2, 37.6, 2.4], handR: [8.6, 33, 6.4], headPitch: 14, headYaw: -14, headRoll: -4, spinePitch: 8, spineYaw: -4, handShapeR: 'relaxed', prop: { bookOpen: 0.75, bookTilt: -38, bookYaw: -60 } },
    nao: { handR: [10.2, 28.4, 5.4], handShapeR: 'relaxed', headYaw: 2, headPitch: -4, spinePitch: 12, pelvis: [0.3, -2.4, 0.4] },
    mio: { headYaw: 30, headPitch: 6, handR: [4.2, 30, 7.2], handL: [-2.2, 29.8, 7] },
    ren: { handR: [9.6, 32.4, 6.2], handShapeR: 'relaxed', headYaw: -8, headPitch: 9, spinePitch: 8 },
    suzu: { headRoll: 3, spineRoll: -4, handR: [11.6, 28.6, 3.4], headYaw: 18 },
    comp: { handR: [10.8, 27.6, 3.6], handL: [-10, 28, 3.4], spinePitch: 5, headPitch: 2 },
  };
  function calmOf(look, id) {
    const r = readyOf(look, id);
    const c = CALM[id] || CALM.comp;
    const out = over(r, c);
    if (!holdsBook(look, id)) delete out.prop.bookOpen;
    out.pelvis[1] += 0.5;
    return out;
  }

  // ---- idle key poses (§7.3) -----------------------------------------------------------------------------
  // Each key: d (a change from the stance), hold (ms), tr (ms to reach it from the one before). Hair and
  // cloth (hairLag, hairSway, clothSway) arrive late: they keep the last key's values through the
  // in-betweens and overshoot on the settling frame.
  const K = (d, hold, tr) => ({ d, hold, tr: tr == null ? 220 : tr });
  const BREATH = { spinePitch: -1.8, pelvis: [0, 0.4, 0], handR: [0, 0.6, 0], handL: [0, 0.5, 0], headPitch: -1.4, hairLag: -0.8 };
  const IDLE = {
    pc: {
      off: 0,
      ready: [
        K({}, 900),
        K(BREATH, 520, 200),
        K({ pelvis: [-1, -0.3, 0], pelvisRoll: 2.2, spineRoll: -1.6, headYaw: 4, hairSway: 1.2, clothSway: 0.8 }, 760, 260),
        // the characteristic beat: settle the grip on the folio and glance at it
        K({ pelvis: [-0.6, -0.3, 0], pelvisRoll: 1.2, handR: [-6.6, 0.4, -4.8], handShapeR: 'pinch', headPitch: 8, headYaw: -8, prop: { bookTilt: -10 } }, 620, 240),
        K({ headYaw: 2, spinePitch: 0.6, hairLag: 0.6 }, 820, 260),
        K({ spinePitch: -1.4, pelvis: [0, 0.35, 0], handR: [0, 0.5, 0.4] }, 480, 200),
        K({ pelvis: [0.9, -0.2, 0], pelvisRoll: -2, spineRoll: 1.4, headYaw: -3, hairSway: -1.1, clothSway: -0.7 }, 700, 260),
        K({ handShapeR: 'open', handR: [0.4, 0.6, 0.6] }, 420, 160),
      ],
      calm: [K({}, 1600), K({ spinePitch: -1, pelvis: [0, 0.25, 0], hairLag: -0.4 }, 900, 300), K({ headPitch: 2 }, 1400, 300), K({ pelvis: [-0.5, 0, 0], pelvisRoll: 1, hairSway: 0.5 }, 1700, 340)],
    },
    nao: {
      off: 2300,
      ready: [
        K({}, 700),
        K({ headYaw: -8, spineYaw: -2, hairSway: 0.8 }, 500, 140),
        K({ headYaw: 10, spineYaw: 1, hairSway: -1 }, 600, 140),
        K({ pelvis: [0.6, -0.4, 0.7], spinePitch: 2, hairLag: 0.6 }, 600, 200),
        K(BREATH, 450, 180),
        K({ handL: [0, 1.4, 0.4], headPitch: 4 }, 300, 140),
        K({ pelvis: [-0.3, 0, -0.3], headYaw: 3, clothSway: 0.6 }, 700, 220),
        K({ headPitch: 6, headYaw: -2 }, 400, 140),
      ],
      calm: [K({}, 1400), K({ spinePitch: -1, pelvis: [0, 0.3, 0] }, 800, 260), K({ headYaw: 8, headPitch: 2 }, 1600, 300), K({ pelvis: [0.4, 0, 0.2] }, 1200, 260)],
    },
    mio: {
      off: 1700,
      ready: [
        K({}, 1000),
        K(BREATH, 600, 240),
        // she looks to the one she looks after
        K({ headYaw: 10, headPitch: 4, spineYaw: 2, hairSway: -0.6 }, 900, 300),
        K({ handR: [-0.6, 0.3, 0], handL: [0.6, 0.3, 0], headYaw: -2 }, 700, 220),
        // a touch at the bottles on her hip (ready, not taken)
        K({ handR: [4, -2.6, -3.8], palmR: [-0.6, -0.6, -0.2], headPitch: 3 }, 700, 260),
        K({}, 800, 260),
        K({ pelvis: [-0.6, -0.2, 0], pelvisRoll: 1.4, spineRoll: -1, clothSway: 0.7 }, 700, 280),
      ],
      calm: [K({}, 1600), K({ spinePitch: -1, pelvis: [0, 0.25, 0] }, 900, 300), K({ headYaw: 6, headPitch: 3 }, 1600, 320), K({ pelvis: [-0.4, 0, 0], pelvisRoll: 0.8 }, 1500, 320)],
    },
    ren: {
      off: 3100,
      ready: [
        K({}, 1200),
        K(BREATH, 700, 260),
        // a look to the lamp
        K({ headYaw: -16, headPitch: 8, spineYaw: -2 }, 900, 300),
        K({ handR: [0.8, -0.6, 0.8], handShapeR: 'point' }, 500, 220),
        K({ headYaw: 2, hairLag: 0.5 }, 900, 300),
        K({ pelvis: [0, -0.3, 0], spinePitch: 1 }, 800, 260),
        K({ leftFree: 1, handL: [-0.6, 0.5, 0.6], clothSway: 0.5 }, 600, 260),
      ],
      calm: [K({}, 1800), K({ spinePitch: -1, pelvis: [0, 0.25, 0] }, 900, 320), K({ headYaw: -6 }, 1600, 320), K({ pelvis: [0.3, 0, 0] }, 1500, 320)],
    },
    suzu: {
      off: 900,
      ready: [
        K({}, 800),
        // a heel tap, twice: the restrained rhythm
        K({ footRLift: 1.4, footR: [0, 0, 0.4], hairLag: -0.4 }, 160, 120),
        K({}, 380, 100),
        K({ footRLift: 1.4, footR: [0, 0, 0.4] }, 160, 120),
        K({ hairLag: 0.5 }, 600, 100),
        K({ headRoll: -12, pelvis: [0.6, 0, 0], spineRoll: 3, headYaw: 4, hairSway: -1.4, clothSway: -0.8 }, 900, 300),
        K({ handR: [-0.8, 2.4, 1.2], palmR: [0.4, 1.4, 0], handShapeR: 'spread' }, 600, 220),
        K({ hairSway: 0.6 }, 700, 260),
      ],
      calm: [K({}, 1500), K({ spinePitch: -1, pelvis: [0, 0.3, 0] }, 900, 300), K({ headRoll: -4, hairSway: -0.5 }, 1500, 320), K({ footRLift: 0.8 }, 300, 160)],
    },
    comp: {
      off: 1300,
      ready: [K({}, 1000), K(BREATH, 600, 240), K({ pelvis: [-0.8, -0.2, 0], pelvisRoll: 1.6, headYaw: 4, hairSway: 0.8 }, 900, 300), K({ headYaw: -4 }, 800, 260), K({ pelvis: [0.6, 0, 0], pelvisRoll: -1.4, clothSway: -0.5 }, 900, 300), K({}, 700, 240)],
      calm: [K({}, 1600), K({ spinePitch: -1, pelvis: [0, 0.25, 0] }, 900, 300), K({ headYaw: 4 }, 1500, 320), K({}, 1200, 300)],
    },
  };
  const SECONDARY = ['hairLag', 'hairSway', 'clothSway'];
  const SETTLE_MS = 120;
  function loopOf(id, pose) { const seq = (IDLE[id] || IDLE.comp)[pose === 'calm' ? 'calm' : 'ready']; return seq.reduce((m, k) => m + k.hold + k.tr, 0); }
  const LOOP = {};
  for (const id of ACTORS) LOOP[id] = loopOf(id, 'ready');
  LOOP.pc = loopOf('pc', 'ready'); // (kept: LOOP.pc / LOOP.comp as before)
  // where in its idle an actor is at time t: 'i.s' — key i, step s (0 hold, 1 and 2 the in-betweens, 3 settling)
  function idleKey(id, pose, t, reduce) {
    if (reduce) return '0.0';
    const I = IDLE[id] || IDLE.comp, seq = pose === 'calm' ? I.calm : I.ready;
    const L = loopOf(id, pose);
    let u = ((((t || 0) + I.off) % L) + L) % L;
    for (let i = 0; i < seq.length; i++) {
      const k = seq[i];
      if (u < k.tr) return i + '.' + (u < k.tr / 2 ? 1 : 2);
      u -= k.tr;
      if (u < k.hold) return i + '.' + (u < SETTLE_MS && k.hold > SETTLE_MS * 2 ? 3 : 0);
      u -= k.hold;
    }
    return '0.0';
  }
  // the times that cover every distinct idle frame of an actor (for prewarming)
  function idleTimes(id, pose) {
    const I = IDLE[id] || IDLE.comp, seq = pose === 'calm' ? I.calm : I.ready, L = loopOf(id, pose);
    const out = [];
    let t = 0;
    for (const k of seq) { out.push(t + k.tr * 0.25, t + k.tr * 0.75, t + k.tr + 40, t + k.tr + Math.min(k.hold - 1, SETTLE_MS + 40)); t += k.tr + k.hold; }
    return out.map((x) => (((x - I.off) % L) + L) % L);
  }
  function idlePose(look, id, pose, ik, reduce) {
    const I = IDLE[id] || IDLE.comp, seq = pose === 'calm' ? I.calm : I.ready;
    const R = pose === 'calm' ? calmOf(look, id) : readyOf(look, id);
    const amp = reduce ? 0 : pose === 'calm' ? 0.6 : 1;
    const [i, s] = String(ik || '0.0').split('.').map(Number);
    const at = (j) => plus(R, seq[((j % seq.length) + seq.length) % seq.length].d, amp);
    const B = at(i);
    if (!s) return B;
    const A = at(i - 1);
    if (s === 1 || s === 2) {
      const w = s === 1 ? 0.3 : 0.72;
      const r = blendStep(A, B, w);
      // hair and cloth are a beat late
      for (const q of SECONDARY) r[q] = A[q] + (B[q] - A[q]) * (s === 1 ? 0.05 : 0.3);
      return r;
    }
    // settling: the body has arrived; hair and cloth swing past and come back
    const r = clone(B);
    for (const q of SECONDARY) r[q] = B[q] + (B[q] - A[q]) * 0.55;
    r.hairLag += 0.5 * amp;
    return r;
  }

  // ---- gestures ---------------------------------------------------------------------------------------
  // G = { a: the anticipation key, x(k): the action at progress k (express → release), snap: share of the
  // act spent reaching the action, release: k when the effect leaves, act: 'L' when the left hand acts }.
  // Hand targets in the body's ground frame; values replace the stance's.
  const path = (pts, k) => { const f = clamp01(k) * (pts.length - 1), i = Math.min(pts.length - 2, Math.floor(f)); return lerp(pts[i], pts[i + 1], f - i); };
  const FWD = [0.35, 0, 1], UP = [0, 1, 0], DOWN = [0, -1, 0.2];
  const GEST = {
    // a paper strip drawn back to the shoulder, then sent up-right at the foe with the whole arm
    direct: {
      a: { spineYaw: -7, spinePitch: 5, handR: [7.8, 40, -1.6], elbowR: [1, -1, -0.4], headYaw: 16, pelvis: [-0.5, -1.4, -0.8], handShapeR: 'pinch', prop: { strip: 0.45 } },
      x: () => ({ spineYaw: 17, spinePitch: 12, handR: [12.6, 44.5, 17.5], elbowR: [1, -0.4, -0.3], headYaw: 12, headPitch: -7, pelvis: [0.7, -1.8, 1.4], handShapeR: 'pinch', prop: { strip: 1 }, hairSway: -1.4, clothSway: -1 }),
      snap: 0.3, release: 0.3,
    },
    // Unravel: the completed strip lifted up-right, then a controlled thread drawn back from it
    thread: {
      a: { spineYaw: -4, spinePitch: 9, handR: [-1.6, 32.6, 5.4], elbowR: [1, -0.6, 0.2], handShapeR: 'pinch', headYaw: -6, headPitch: 9, pelvis: [-0.3, -2, -0.2], prop: { strip: 0.6 } },
      x: (k) => {
        const lift = clamp01(k / 0.32), pull = ease(clamp01((k - 0.38) / 0.5));
        const h = lift < 1 ? lerp([-1.6, 32.6, 5.4], [13, 47, 15.6], ease(lift)) : lerp([13, 47, 15.6], [15.6, 41, -1.4], pull);
        return { spineYaw: 14 - pull * 10, spinePitch: 10, handR: h, elbowR: [1, -0.5 + pull * 0.3, -0.4 - pull * 0.6], handShapeR: 'pinch', headYaw: 12, headPitch: -6, pelvis: [0.5 - pull * 0.8, -1.8, 1 - pull * 1.4], prop: { strip: 1 - pull * 0.5 }, hairSway: -1 + pull * 1.6, clothSway: -0.6 + pull };
      },
      snap: 0.1, release: 0.4,
    },
    // a brush raised and a mark traced in the air: down-stroke, hook, then a crossing stroke that closes it
    trace: {
      a: { spineYaw: 4, spinePitch: 8, handR: [8.6, 41, 9], elbowR: [1, -0.8, -0.6], headYaw: 14, headPitch: -6, handShapeR: 'pinch', prop: { brush: 1 } },
      x: (k) => ({ spineYaw: 9, spinePitch: 9, handR: path([[8.6, 41, 9], [10.4, 44, 13], [12.2, 37, 13.4], [9.4, 34, 12.6], [13.6, 39.5, 14], [9.8, 40.6, 14.2], [13.4, 35.6, 13.6]], k / 0.9), elbowR: [1, -0.7, -0.5], headYaw: 14, headPitch: -6, handShapeR: 'pinch', prop: { brush: 1 } }),
      snap: 0, release: 0.85,
    },
    // Ice: a crisp, straight stroke and a flick — precise, fast, the feet set
    crystal: {
      a: { spineYaw: -6, spinePitch: 6, handR: [9.6, 50, 3.4], elbowR: [1, 0.2, -0.8], headYaw: 16, headPitch: -8, handShapeR: 'pinch', pelvis: [-0.3, -2.2, -0.4], prop: { brush: 1 } },
      x: (k) => ({ spineYaw: 12, spinePitch: 11, handR: k < 0.22 ? lerp([9.6, 50, 3.4], [13.4, 37, 15.4], k / 0.22) : lerp([13.4, 37, 15.4], [14.2, 41.6, 16.4], clamp01((k - 0.22) / 0.2)), elbowR: [1, -0.6, -0.4], headYaw: 12, headPitch: -6, handShapeR: 'pinch', pelvis: [0.4, -2.4, 0.8], prop: { brush: 1 }, hairSway: -0.6 }),
      snap: 0, release: 0.22,
    },
    // the folio lifted in both hands and opened toward the foe (an answer read out of it)
    book: {
      a: { handL: [-8.6, 40, 5], handR: [4.4, 40, 9], elbowR: [1, -0.8, -0.6], elbowL: [-1, -0.8, -0.3], spinePitch: 6, spineYaw: -6, headPitch: 4, headYaw: -6, handShapeR: 'cup', handShapeL: 'cup', prop: { book: 1, bookOpen: 0.3, bookTilt: -20, bookYaw: -40, bookAt: [2, 1.4, 1.2] } },
      x: (k) => ({ handL: [9.6, 50.5, 15.6], handR: [16.4, 49, 10.4], elbowR: [1, -0.5, -0.6], elbowL: [-1, -0.8, 0], spinePitch: 7, spineYaw: 18, headPitch: -8, headYaw: 8, pelvis: [0.6, -1.6, 0.8], handShapeR: 'cup', handShapeL: 'cup', prop: { book: 1, bookOpen: 1, bookTilt: 24 + 7 * Math.sin(k * Math.PI * 3), bookYaw: 40, bookAt: [3.4, 1.2, 0.2] } }),
      snap: 0.35, release: 0.35,
    },
    // See through: a frame of fingers raised before the eyes, carried toward it, then a sharp sideways cut
    lens: {
      a: { handR: [5.6, 55, 9.6], elbowR: [1, -1, -0.2], handShapeR: 'pinch', palmR: [0, 0, 1], spinePitch: 8, headPitch: -2, headYaw: 8, pelvis: [0, -2.2, 0.2] },
      x: (k) => ({ handR: k < 0.4 ? lerp([5.6, 55, 9.6], [10.4, 54, 15.4], ease(k / 0.4)) : lerp([10.4, 54, 15.4], [16.4, 49.4, 9.6], ease((k - 0.4) / 0.3)), elbowR: [1, -0.8, -0.3], handShapeR: k < 0.4 ? 'pinch' : 'flat', palmR: k < 0.4 ? [0, 0, 1] : [1, 0, 0.2], spinePitch: 10, spineYaw: k < 0.4 ? 6 : 14, headPitch: -4, headYaw: 10, pelvis: [0.4, -2.2, 0.8], hairSway: k > 0.4 ? -1 : 0 }),
      snap: 0, release: 0.45,
    },
    // Protect: a forearm across, a closing stroke round in front, then the palm set against what comes
    ward: {
      a: { handR: [2.4, 42, 7], elbowR: [1, -1.2, 0.2], spinePitch: 10, pelvis: [-0.3, -2.4, -0.4], headPitch: 2, footR: [7, 0, 5], handShapeR: 'fist' },
      x: (k) => ({ handR: k < 0.45 ? path([[2.4, 42, 7], [8.4, 50, 11.6], [15.8, 47.5, 11]], ease(k / 0.45)) : [15.8, 47.5, 11], elbowR: [1, -1.2, -0.4], handL: [-3.8, 38.5, 9.6], spinePitch: 12, spineYaw: 14, pelvis: [0.5, -2.8, 0.6], footR: [7.6, 0, 6], headPitch: -4, hairSway: -1, clothSway: -0.8, handShapeR: k < 0.45 ? 'open' : 'flat', palmR: [0.45, 0.1, 1] }),
      snap: 0.12, release: 0.42,
    },
    // Heal: the folio opened before the chest, the right hand gathering over the page, then rising and
    // opening out over the two of you (a companion without a folio: both hands rising, opening)
    restore: {
      a: { handL: [-4.4, 37.6, 6.6], elbowL: [-1, -0.9, -0.2], handShapeL: 'cup', handR: [2.6, 40.6, 9.2], elbowR: [1, -0.9, -0.2], handShapeR: 'cup', palmR: DOWN, spinePitch: 13, headPitch: 14, headYaw: -2, pelvis: [0, -2.2, 0], prop: { bookOpen: 0.85, bookTilt: -30, bookYaw: -10, bookAt: [1.2, 1.4, 0.8] } },
      x: (k) => ({ handL: [-4.4, 37.6, 6.6], elbowL: [-1, -0.9, -0.2], handShapeL: 'cup', handR: lerp([2.6, 40.6, 9.2], [15, 49, 5.4], ease(k / 0.6)), elbowR: [1, -0.5, -0.8], spinePitch: 4, headPitch: -8, headYaw: 8, pelvis: [0, -0.8, 0], hairLag: -0.8, handShapeR: k > 0.3 ? 'spread' : 'cup', palmR: [0, 1, 0.4], prop: { bookOpen: 1, bookTilt: -30, bookYaw: -10, bookAt: [1.2, 1.4, 0.8] } }),
      snap: 0, release: 0.35,
    },
    // Water: the arm swept back low, then round in a flowing arc up toward the foe
    flow: {
      a: { handR: [3.4, 26.4, -5.6], elbowR: [1, -0.3, -0.6], spineYaw: -13, spinePitch: 8, pelvis: [-0.6, -1.8, -0.5], headYaw: 18, handShapeR: 'open', palmR: [0, -1, -0.2] },
      x: (k) => ({ handR: path([[3.4, 26.4, -5.6], [11.6, 28, 2], [14, 34, 10], [12.8, 41, 15.6]], k / 0.6), elbowR: [1, -0.5, -0.4], spineYaw: -13 + 30 * clamp01(k / 0.6), spinePitch: 10, pelvis: [0.6, -1.8, 0.6], headYaw: 12, hairSway: -1.6 * clamp01(k / 0.6), clothSway: -1.2 * clamp01(k / 0.6), handShapeR: 'open', palmR: [0, -0.6, 1] }),
      snap: 0, release: 0.55,
    },
    // Wind: a wide horizontal sweep, the open hand leading, the body turning through it
    sweep: {
      a: { handR: [-1.6, 35, 7.4], elbowR: [1, -0.6, 0.4], spineYaw: -14, spinePitch: 8, pelvis: [-0.8, -1.8, -0.2], headYaw: 4, handShapeR: 'open', palmR: [-1, 0, 0.2] },
      x: (k) => ({ handR: path([[-1.6, 35, 7.4], [8, 40, 14], [16, 43, 9]], ease(k / 0.7)), elbowR: [1, -0.4, -0.3], spineYaw: -14 + 32 * ease(k / 0.7), spinePitch: 9, pelvis: [0.8, -1.8, 0.4], headYaw: 14, handShapeR: 'open', palmR: [1, 0.1, 0.3], hairSway: -2.2 * ease(k / 0.7), clothSway: -1.6 * ease(k / 0.7) }),
      snap: 0, release: 0.45,
    },
    // Stone: the weight carried down — a step forward, knees bent, the flat hand pressed toward the ground
    plant: {
      a: { handR: [8.4, 42, 6], elbowR: [1, -1, -0.4], handShapeR: 'flat', palmR: DOWN, spinePitch: 6, pelvis: [-0.4, -1.6, -0.8], headPitch: 4 },
      x: (k) => ({ footR: [7.4, 0, 8.6], footRYaw: 18, handR: k < 0.5 ? lerp([8.4, 42, 6], [12.4, 27, 13.6], ease(k / 0.5)) : [12.4, 27, 13.6], elbowR: [1, -0.8, -0.2], handShapeR: 'flat', palmR: DOWN, spinePitch: 18, pelvis: [0.8, -4.6, 1.8], headPitch: 10, hairLag: k < 0.5 ? -1 : 0.8, clothSway: 0.6 }),
      snap: 0.15, release: 0.5,
    },
    // Warmth: the hand cupped close, then opened up and out, releasing it
    open: {
      a: { handR: [3.6, 39, 8.4], elbowR: [1, -1, -0.2], handShapeR: 'cup', palmR: [-0.4, 1, 0.4], spinePitch: 12, headPitch: 10, pelvis: [0, -2.4, 0] },
      x: (k) => ({ handR: lerp([3.6, 39, 8.4], [14.6, 46, 9.4], ease(k / 0.5)), elbowR: [1, -0.6, -0.4], handShapeR: k < 0.25 ? 'cup' : 'spread', palmR: [0.3, 1, 0.6], spinePitch: 4, headPitch: -8, pelvis: [0.2, -1.2, 0.4], hairLag: -0.8 }),
      snap: 0, release: 0.3,
    },
    // Light: the arm lowered, then raised high toward the foe, the palm open to it
    raise: {
      a: { handR: [8.4, 33, 4.2], elbowR: [1, -0.9, -0.8], spinePitch: 9, pelvis: [0, -2.2, 0], headPitch: 6, handShapeR: 'fist' },
      x: () => ({ handR: [12.4, 66, 7.4], elbowR: [1, 0.3, -0.3], spinePitch: -4, spineYaw: 6, spineRoll: -4, pelvis: [0, -0.3, 0.2], headPitch: -14, headYaw: 8, hairLag: 0.8, handShapeR: 'open', palmR: [0.3, 0.2, 1] }),
      snap: 0.3, release: 0.3,
    },
    // Bell: a hand raised beside the head, a short shake, then the fingers flick open — the ring goes out
    ring: {
      a: { handR: [8.6, 50, 2.6], elbowR: [1, -0.4, -0.8], handShapeR: 'fist', spinePitch: 6, headPitch: -2, headYaw: 10 },
      x: (k) => ({ handR: [9.4 + (k < 0.5 ? Math.sin(k * Math.PI * 8) * 1.1 : 1.4), 52 + (k < 0.5 ? 0 : 2), 3 + (k < 0.5 ? Math.sin(k * Math.PI * 8) * 0.6 : 1)], elbowR: [1, -0.3, -0.8], handShapeR: k < 0.5 ? 'fist' : 'spread', palmR: [0.2, 0.2, 1], spinePitch: 4, headPitch: -6, headYaw: 12, hairSway: k < 0.5 ? 0.4 : -0.6 }),
      snap: 0, release: 0.5,
    },
    // Voice: a hand cupped beside the mouth, the chest lifted, the call sent forward
    call: {
      a: { handR: [5.2, 54.6, 8.4], elbowR: [1, -1, -0.2], handShapeR: 'cup', palmR: [-1, 0, 0.2], spinePitch: 2, headPitch: -6, pelvis: [0, -1.4, -0.4] },
      x: (k) => ({ handR: [5.6, 55, 9], elbowR: [1, -1, -0.2], handShapeR: 'cup', palmR: [-1, 0, 0.2], spinePitch: 10 + bump(k, 0, 0.6) * 4, headPitch: -12, pelvis: [0.3, -2, 0.9], hairLag: -0.6 }),
      snap: 0.15, release: 0.25,
    },
    // a companion steps in to help someone up (the existing revive): crouch, reach down, haul up
    help: {
      a: { pelvis: [1.2, -6, 1.4], spinePitch: 26, spineYaw: 16, headYaw: 24, headPitch: 14, handR: [15.4, 22, 7.4], elbowR: [1, -0.4, -0.4], handShapeR: 'open', palmR: [0, 1, 0.2], footR: [9.2, 0, 4.6] },
      x: (k) => ({ pelvis: [1.2, -6 + 4 * ease(k), 1.4], spinePitch: 26 - 16 * ease(k), spineYaw: 16, headYaw: 24, headPitch: 14 - 12 * ease(k), handR: lerp([15.4, 22, 7.4], [11.6, 38, 5.2], ease(k)), elbowR: [1, -0.6, -0.8], handShapeR: 'fist', footR: [9.2, 0, 4.6] }),
      snap: 0, release: 0.5,
    },
    // getting up after being helped (the revive): from the knee to the stance
    rise: {
      a: null, // (the recover stage starts from 'down')
      x: () => DOWN_POSE,
      snap: 0, release: 0,
    },
  };
  // the pose 'down' (resolve spent): on the left knee, a hand on the ground, the head bowed
  const DOWN_POSE = { pelvis: [0.2, -11.6, -1.2], spinePitch: 28, spineYaw: 2, spineRoll: -4, headPitch: 22, headYaw: 4, footR: [6.4, 0, 6.6], footRYaw: 16, footL: [-4.6, -1.8, -9.4], footLYaw: 4, handR: [7.4, 14.6, 8.2], handL: [-9.6, 2.4, 3.4], elbowL: [-1, -0.2, -1], hairLag: 1.5, handShapeR: 'relaxed', handShapeL: 'flat', palmL: [0, -1, 0] };

  // Each companion's own gestures (and their own way of doing a shared one).
  const BY = {
    nao: {
      // directing: drawn back, then the arm out straight at it, finger pointing — short and decisive
      point: {
        a: { handR: [6.2, 42, 1.8], elbowR: [1, -1, -0.4], handShapeR: 'fist', spinePitch: 13, headPitch: -6, pelvis: [0.2, -3, 0.2], spineYaw: -4 },
        x: () => ({ handR: [13.4, 47.6, 17.4], elbowR: [1, -0.3, -0.2], handShapeR: 'point', palmR: [-1, 0, 0], spinePitch: 16, spineYaw: 14, headPitch: -9, headYaw: 10, pelvis: [0.9, -2.8, 1.6], hairSway: -0.8 }),
        snap: 0.25, release: 0.25,
      },
      // Spot the opening: a hand shading the eyes, a sweep of the look, then a finger to the place
      spot: {
        a: { handR: [5.6, 57.6, 8.8], elbowR: [1, -0.6, -0.4], handShapeR: 'flat', palmR: DOWN, spinePitch: 18, headPitch: -6, headYaw: 2, pelvis: [0.6, -3.4, 1] },
        x: (k) => (k < 0.5
          ? { handR: [5.6, 57.6, 8.8], elbowR: [1, -0.6, -0.4], handShapeR: 'flat', palmR: DOWN, spinePitch: 18, headPitch: -6, headYaw: 2 + 14 * ease(k / 0.5), pelvis: [0.6, -3.4, 1] }
          : { handR: [12.6, 37.6, 15.6], elbowR: [1, -0.6, -0.2], handShapeR: 'point', palmR: [-1, 0, 0], spinePitch: 20, spineYaw: 10, headPitch: 2, headYaw: 12, pelvis: [1, -3.6, 1.6] }),
        snap: 0, release: 0.55,
      },
      // Call out its aim: a hand at his mouth, the other still on the satchel, leaning into the shout
      call: {
        a: { handR: [4.6, 55.4, 9], elbowR: [1, -1, -0.2], handShapeR: 'cup', palmR: [-1, 0, 0.2], spinePitch: 10, headPitch: -6, pelvis: [0.2, -2.6, 0.2] },
        x: (k) => ({ handR: [5, 55.6, 9.6], elbowR: [1, -1, -0.2], handShapeR: 'cup', palmR: [-1, 0, 0.2], spinePitch: 18 + bump(k, 0, 0.5) * 3, headPitch: -12, pelvis: [0.8, -3, 1.4], hairLag: -0.5 }),
        snap: 0.15, release: 0.25,
      },
      // Lend a hand: a step in, reaching low for the knot, the fingers closing on it and pulling
      reach: {
        a: { footR: [7.6, 0, 8.4], pelvis: [0.8, -4, 2], spinePitch: 20, handR: [10, 34, 10], elbowR: [1, -0.6, -0.4], handShapeR: 'open', headPitch: 0 },
        x: (k) => ({ footR: [7.6, 0, 8.4], pelvis: [1, -4.4, 2.6], spinePitch: 24, headPitch: 4, handR: k < 0.55 ? lerp([10, 34, 10], [13.2, 34, 19.4], ease(k / 0.55)) : lerp([13.2, 34, 19.4], [11.6, 37, 13], ease((k - 0.55) / 0.45)), elbowR: [1, -0.4, -0.2], handShapeR: k < 0.55 ? 'open' : 'pinch', palmR: DOWN }),
        snap: 0, release: 0.6,
      },
      // Seize the opening: a crouch, then a quick lunge step, the arm out — he moves before the signal
      lunge: {
        a: { pelvis: [-0.4, -4.4, -1.2], spinePitch: 16, handR: [6.4, 38, -2], elbowR: [1, -0.8, -0.4], handShapeR: 'fist', headPitch: -10 },
        x: (k) => ({ footR: [8.2, 0, 10.6], footRYaw: 14, pelvis: [1.4, -4.2, 3.4], spinePitch: 22, spineYaw: 10, handR: [13.6, 43.6, 21], elbowR: [1, -0.3, -0.2], handShapeR: 'point', palmR: [-1, 0, 0], headPitch: -10, hairSway: -1.4, clothSway: -1.2, hairLag: 1 * bump(k, 0, 0.5) }),
        snap: 0.25, release: 0.3,
      },
      // Take half: a step to your side, braced to share what comes, a hand out toward your shoulder
      shoulder: {
        a: { pelvis: [0.4, -3.2, 0], spinePitch: 14, handR: [9.6, 38, 6], handShapeR: 'open', headYaw: 26 },
        x: () => ({ footR: [9.8, 0, 4.4], footRYaw: 30, pelvis: [1.8, -3.6, 0.6], spinePitch: 12, spineYaw: 12, headYaw: 22, headPitch: -2, handR: [15.6, 44, 5.6], elbowR: [1, -0.6, -0.6], handShapeR: 'open', palmR: [1, 0, 0.2], hairSway: -0.6 }),
        snap: 0.3, release: 0.35,
      },
    },
    mio: {
      // Warm draught: the vial out from her hip, the cork drawn, then poured toward the one it is for
      pour: {
        a: { handR: [8.4, 27.6, 4.4], elbowR: [1, -0.6, -0.4], handShapeR: 'cup', headPitch: 10, headYaw: 14, prop: { vial: 1 } },
        x: (k) => (k < 0.32
          ? { handR: lerp([8.4, 27.6, 4.4], [6, 40, 8.2], ease(k / 0.32)), handL: [-0.6, 41, 7.6], handShapeR: 'cup', handShapeL: 'pinch', elbowL: [-1, -0.9, -0.2], headPitch: 8, headYaw: 14, prop: { vial: 1, cork: k > 0.2 ? 1 : 0 } }
          : { handR: [12.2, 42, 11.4], elbowR: [1, -0.7, -0.4], handL: [-2.2, 36.4, 7], handShapeR: 'cup', handShapeL: 'relaxed', spinePitch: 9, spineYaw: 12, headPitch: 2, headYaw: 18, pelvis: [0.4, -1.4, 0.6], prop: { vial: 1, cork: 1, vialTilt: 100 * ease((k - 0.32) / 0.35) } }),
        snap: 0, release: 0.5,
      },
      // Salve: the vial to the one with less resolve; two small, careful dabs
      dab: {
        a: { handR: [8.4, 27.6, 4.4], elbowR: [1, -0.6, -0.4], handShapeR: 'cup', headPitch: 8, headYaw: 20, prop: { vial: 1, cork: 1 } },
        x: (k) => ({ handR: [12.6 + Math.sin(k * Math.PI * 4) * 0.8, 38, 13 + Math.sin(k * Math.PI * 4) * 1.2], elbowR: [1, -0.6, -0.4], handShapeR: 'cup', spinePitch: 14, headPitch: 6, headYaw: 20, pelvis: [0.6, -2, 1], prop: { vial: 1, cork: 1, vialTilt: 60 } }),
        snap: 0.2, release: 0.35,
      },
      // Clearing vapour: the open vial held up toward it, the free hand fanning the vapour on
      waft: {
        a: { handR: [7, 40, 7.8], elbowR: [1, -0.8, -0.4], handShapeR: 'cup', headPitch: -2, prop: { vial: 1, cork: 1 } },
        x: (k) => ({ handR: [11.4, 50.6, 12.2], elbowR: [1, -0.2, -0.4], handShapeR: 'cup', handL: lerp([-2.4, 45.6, 9.4], [4.4, 48.4, 14.6], 0.5 + 0.5 * Math.sin(k * Math.PI * 3)), handShapeL: 'open', palmL: [0.4, 0, 1], elbowL: [-1, -0.8, 0], spinePitch: 6, spineYaw: 10, headPitch: -8, prop: { vial: 1, cork: 1, vialTilt: 30 } }),
        snap: 0.2, release: 0.3,
      },
      // Smelling salts: out before you ask — the open vial held out at shoulder height toward you both
      salts: {
        a: { handR: [8.4, 27.6, 4.4], handShapeR: 'cup', headYaw: 24, prop: { vial: 1 } },
        x: (k) => ({ handR: [14.6, 46, 6.2], elbowR: [1, -0.6, -0.8], handShapeR: 'cup', handL: [-1.6, 40.6, 7.2], handShapeL: 'flat', palmL: [0, 0, -1], spinePitch: 6, spineYaw: 16, headYaw: 26, headPitch: 0, prop: { vial: 1, cork: k > 0.1 ? 1 : 0, vialTilt: 15 } }),
        snap: 0.3, release: 0.3,
      },
      // Right beside you: a step to your side, the tonic held out, a hand reaching for your shoulder
      tonic: {
        a: { handR: [8.4, 27.6, 4.4], handShapeR: 'cup', headYaw: 28, prop: { vial: 1, cork: 1 } },
        x: (k) => ({ footR: [9.8, 0, 4.6], footRYaw: 26, pelvis: [1.8, -1.6, 0.4], spineYaw: 14, spinePitch: 8, headYaw: 26, headPitch: 2, handR: [15.2, 40, 7.6], elbowR: [1, -0.6, -0.6], handShapeR: 'cup', handL: [6.4, 44.6, 6.2], handShapeL: 'open', palmL: [1, 0, 0.2], elbowL: [-1, -0.8, 0], prop: { vial: 1, cork: 1, vialTilt: 55 * ease(k) } }),
        snap: 0.3, release: 0.45,
      },
      // (the technique, and her own way of 'restore': the draught poured)
      restore: null,
      // settle: (her cheer is in CHEER)
    },
    ren: {
      // Lamp ward / the technique's ward: the lamp brought round before him and held out toward it, the
      // free hand tracing the seal closed above it in its light. (The lamp hangs from his left hand: held
      // out forward-right or up at his left side it stands clear of his body, where it can be seen.)
      ward: {
        a: { leftFree: 1, handL: [-4.4, 38, 9.4], elbowL: [-1, -0.8, -0.2], handR: [6, 42, 8], handShapeR: 'flat', palmR: [-0.6, 0, 0.8], spinePitch: 10, headPitch: 6, headYaw: -2, pelvis: [0, -3, 0], act: 'L' },
        x: (k) => ({ leftFree: 1, handL: [7, 45, 14.6], elbowL: [-1, -0.6, -0.4], handR: path([[10.6, 53, 10.4], [15.4, 49, 9.6], [12.6, 45, 11.6]], k / 0.7), handShapeR: 'point', palmR: [-1, 0, 0], spinePitch: 8, spineYaw: 14, headPitch: -4, headYaw: 8, pelvis: [0.4, -2.6, 0.8], act: 'L', prop: { flare: k > 0.35 ? 1 : 0 }, clothSway: -0.6 }),
        snap: 0.2, release: 0.4,
      },
      // Lamp ward on the one it aims at: the lamp lifted toward them, the palm out
      shade: {
        a: { leftFree: 1, handL: [-6.4, 34, 7.6], elbowL: [-1, -0.8, -0.2], spinePitch: 10, headYaw: 18, act: 'L' },
        x: () => ({ leftFree: 1, handL: [6, 44, 14], elbowL: [-1, -0.6, -0.2], handR: [16.4, 46, 6.4], handShapeR: 'flat', palmR: [1, 0, 0.4], spinePitch: 8, spineYaw: 16, headYaw: 22, headPitch: -2, pelvis: [0.6, -2.6, 0.4], act: 'L', prop: { flare: 1 } }),
        snap: 0.3, release: 0.4,
      },
      // Flare the lamp: drawn back low, then thrust out and up at it, the glass flaring
      flare: {
        a: { leftFree: 1, handL: [-12.4, 27, -4.4], elbowL: [-1, -0.2, -0.8], pelvis: [-0.4, -4, -0.8], spinePitch: 14, spineYaw: -8, headPitch: -4, act: 'L' },
        x: (k) => ({ leftFree: 1, handL: [4.2, 52.4, 14.8], elbowL: [-1, 0.2, -0.4], pelvis: [0.8, -1.8, 1.2], spinePitch: 4, spineYaw: 16, headPitch: -12, headYaw: 8, handR: [11.6, 36, 5], handShapeR: 'fist', act: 'L', prop: { flare: k > 0.25 ? 1 : 0 }, hairLag: 1, clothSway: -0.8 }),
        snap: 0.25, release: 0.3,
      },
      // Keep watch: the lamp held up high at his side, over the two of you
      vigil: {
        a: { leftFree: 1, handL: [-10, 38, 3], elbowL: [-1, -0.8, -0.4], spinePitch: 8, act: 'L' },
        x: () => ({ leftFree: 1, handL: [-17, 52, -1.6], elbowL: [-1, 0.2, -0.6], handR: [8.4, 40, 8.4], handShapeR: 'flat', palmR: [-0.6, 0, 0.8], spinePitch: 2, spineRoll: 3, headPitch: -12, headYaw: -4, pelvis: [-0.4, -1.4, 0], act: 'L', prop: { flare: 1 } }),
        snap: 0.35, release: 0.4,
      },
      // Raise the lamps: the lamp raised high at his side and swung across, over every one of them
      lanterns: {
        a: { leftFree: 1, handL: [-12, 44, 2], elbowL: [-1, -0.4, -0.6], spinePitch: 6, spineYaw: -10, headYaw: -4, act: 'L' },
        x: (k) => ({ leftFree: 1, handL: path([[-14.6, 57, 2.6], [-6, 58, 11], [4.6, 51, 15]], ease(k / 0.75)), elbowL: [-1, 0.3, -0.4], spinePitch: 3, spineYaw: -10 + 26 * ease(k / 0.75), headPitch: -12, headYaw: 6, handR: [10.4, 38, 6], handShapeR: 'flat', act: 'L', prop: { flare: 1 }, clothSway: -1 * ease(k), hairSway: -0.8 * ease(k) }),
        snap: 0.2, release: 0.45,
      },
      // Stand in front: a step forward, the lamp held out before you, the free arm out across you
      front: {
        a: { pelvis: [0, -3.4, -0.6], spinePitch: 12, act: 'L' },
        x: () => ({ footR: [9.6, 0, 8.4], footRYaw: 26, pelvis: [1.8, -2.4, 2.4], spinePitch: 6, spineYaw: 16, leftFree: 1, handL: [5.4, 46, 15.4], elbowL: [-1, -0.4, -0.4], handR: [17, 42, 4.4], elbowR: [1, -0.6, -0.6], handShapeR: 'flat', palmR: [1, 0, 0.3], headPitch: -6, headYaw: 14, act: 'L', prop: { flare: 1 }, clothSway: -0.8 }),
        snap: 0.3, release: 0.45,
      },
    },
    suzu: {
      // a flourish: the arm drawn in across, a turn, then the unwinding sweep out and up, fingers spread
      flourish: {
        a: { handR: [2.2, 42, 6.4], elbowR: [1, -0.6, 0.2], handShapeR: 'relaxed', spineYaw: -14, spinePitch: 9, headYaw: 0, pelvis: [-1.4, -2, -0.4], hairSway: 0.8 },
        x: (k) => ({ handR: path([[2.2, 42, 6.4], [10, 47, 13], [16, 50, 8]], ease(k / 0.6)), elbowR: [1, -0.3, -0.4], handShapeR: 'spread', palmR: [0.3, 0.4, 1], spineYaw: -14 + 32 * ease(k / 0.6), spinePitch: 6, headYaw: 14, headPitch: -8, pelvis: [-0.6, -1.4, 0.4], hairSway: -2.2 * ease(k / 0.6), clothSway: -1.6 * ease(k / 0.6) }),
        snap: 0, release: 0.45,
      },
      // Heckle: a hand at her mouth, the other on her hip, leaning in with it
      heckle: {
        a: { handR: [5, 55.6, 8.6], elbowR: [1, -1, -0.2], handShapeR: 'cup', palmR: [-1, 0, 0.2], spinePitch: 3, headPitch: -8, pelvis: [-1.4, -1.4, -0.6] },
        x: (k) => ({ handR: [5.4, 55.4, 9.6], elbowR: [1, -1, -0.2], handShapeR: 'cup', palmR: [-1, 0, 0.2], spinePitch: 16 + bump(k, 0, 0.4) * 3, headPitch: -12, headRoll: 2, pelvis: [-0.6, -2, 1], hairSway: -0.6 }),
        snap: 0.15, release: 0.25,
      },
      // Draw its eye: a step out into the light, the arm up, the hand waving
      beckon: {
        a: { handR: [10.4, 44, 4], handShapeR: 'open', pelvis: [-0.8, -2, 0], spinePitch: 8 },
        x: (k) => ({ footR: [9.4, 0, 6.2], footRYaw: 30, pelvis: [0.6, -1.4, 0.8], pelvisRoll: 2, spineRoll: -3, handR: [13.6 + Math.sin(k * Math.PI * 6) * 1.6, 58.4, 6 + Math.sin(k * Math.PI * 6) * 0.6], elbowR: [1, 0.3, -0.4], handShapeR: 'open', palmR: [0.3, 0, 1], spinePitch: 2, headPitch: -10, headYaw: 14, headRoll: 2, hairSway: Math.sin(k * Math.PI * 6) * 0.6 }),
        snap: 0.2, release: 0.25,
      },
      // Encore: a clap before her, then the hands opened wide
      clap: {
        a: { handR: [10.4, 44, 8.4], handL: [-6, 44, 8.4], elbowL: [-1, -0.8, -0.2], handShapeR: 'open', handShapeL: 'open', palmR: [-1, 0, 0.2], palmL: [1, 0, 0.2], spinePitch: 6, headPitch: -2 },
        x: (k) => (k < 0.3
          ? { handR: lerp([10.4, 44, 8.4], [2.6, 44, 9.8], ease(k / 0.3)), handL: lerp([-6, 44, 8.4], [0.2, 44, 9.8], ease(k / 0.3)), elbowL: [-1, -0.8, -0.2], handShapeR: 'open', handShapeL: 'open', palmR: [-1, 0, 0.2], palmL: [1, 0, 0.2], spinePitch: 8, headPitch: 0 }
          : { handR: [14.6, 48, 8], handL: [-10.2, 46, 6], elbowL: [-1, -0.6, -0.2], handShapeR: 'spread', handShapeL: 'spread', palmR: [0.2, 0.4, 1], palmL: [-0.2, 0.4, 1], spinePitch: 2, headPitch: -12, hairLag: 0.8 }),
        snap: 0, release: 0.3,
      },
      // On her own cue: a dip, a quick step and a mock lunge, then half drawn back with a turn of the hand
      feint: {
        a: { pelvis: [-1.8, -3.8, -0.8], spinePitch: 12, handR: [8, 38, 2], handShapeR: 'relaxed', headPitch: -6 },
        x: (k) => (k < 0.4
          ? { footR: [8.6, 0, 9.4], footRYaw: 20, pelvis: [1.2, -3.6, 2.8], spinePitch: 20, spineYaw: 12, handR: [14.2, 42, 18], handShapeR: 'flat', palmR: [0.3, 0, 1], headPitch: -8, hairSway: -1.4 }
          : { footR: [8.6, 0, 9.4], footRYaw: 20, pelvis: [0.4, -2.6, 1.6], spinePitch: 12, spineYaw: 4, handR: [12.4, 46, 10], handShapeR: 'spread', palmR: [0.2, 1, 0.2], headPitch: -10, headRoll: 4, hairSway: 0.8 }),
        snap: 0.2, release: 0.3,
      },
      // Grand gesture: gathered low, then both arms flung wide and high, chin up — and held
      grand: {
        a: { handR: [3.4, 32, 6.4], handL: [-3, 32, 6.4], elbowL: [-1, -0.8, -0.2], handShapeR: 'relaxed', handShapeL: 'relaxed', spinePitch: 16, headPitch: 14, pelvis: [-0.6, -3, 0] },
        x: () => ({ handR: [16.4, 57.6, 4.4], handL: [-14.2, 53.6, 2.4], elbowR: [1, 0.2, -0.6], elbowL: [-1, 0.2, -0.6], handShapeR: 'spread', handShapeL: 'spread', palmR: [0.3, 0.4, 1], palmL: [-0.3, 0.4, 1], spinePitch: -6, headPitch: -16, headRoll: 0, pelvis: [-0.4, -0.4, 0.4], pelvisRoll: 0, spineRoll: 0, hairLag: 1.2 }),
        snap: 0.35, release: 0.35,
      },
    },
  };
  // a shared gesture name done each person's own way
  BY.nao.direct = BY.nao.point;
  BY.mio.restore = BY.mio.pour;
  BY.suzu.flow = BY.suzu.flourish;
  const GESTURES = [...new Set(Object.keys(GEST).concat(...Object.keys(BY).map((k) => Object.keys(BY[k]).filter((g) => BY[k][g]))))];
  function gestureOf(id, g) { return (BY[id] && BY[id][g]) || GEST[g] || null; }
  function hasGesture(g, id) { return !!(g && gestureOf(id, g)); }
  function gesturePose(look, id, gesture, stage, k) {
    const R = readyOf(look, id), G = gestureOf(id, gesture) || GEST.direct;
    if (gesture === 'rise') {
      // helped up: from the knee (where 'down' left them) back to the stance
      const D = over(R, DOWN_POSE);
      return stage === 'recover' ? blend(D, R, ease(k)) : stage === 'anticipate' ? blend(R, D, ease(k)) : D;
    }
    const A = over(R, G.a || {});
    const X = (q) => over(A, G.x(q, R));
    if (stage === 'anticipate') return blendStep(R, A, ease(k));
    if (stage === 'act') {
      if (G.snap) { const t = clamp01(k / G.snap); return k < G.snap ? blendStep(A, X(k), ease(t)) : X(k); }
      return blendStep(A, X(k), clamp01(k / 0.12));
    }
    return blendStep(X(1), R, ease(k)); // recover
  }

  // ---- reactions (§7.5, §10) ----------------------------------------------------------------------------
  const VARIANTS = { hit: ['soft', 'held'], guard: ['wary'], afflict: ['hush', 'gust', 'chill', 'slip'], brace: [], soothed: [], down: [], cheer: [] };
  const hasVariant = (pose, v) => !!(VARIANTS[pose] && VARIANTS[pose].indexOf(v) >= 0);
  // in → hold → out envelope: reaches the reaction at a, holds, back to the stance by 1
  const env = (k, a, b) => (k < a ? ease(k / a) : k < b ? 1 : 1 - ease((k - b) / (1 - b)));
  // settle / victory: each person's own (warm relief — never an aggressive kill celebration)
  const CHEER = {
    pc: { handR: [10.2, 27.4, 5.2], handShapeR: 'open', palmR: [-0.4, -1, 0.2], spinePitch: 3, headPitch: -12, headYaw: 6, pelvis: [0, -0.6, 0], handL: [-10.4, 27.6, -3], prop: { bookTilt: -2 } },
    nao: { handR: [9.8, 44.6, 8.4], handShapeR: 'fist', elbowR: [1, -0.8, -0.4], spinePitch: 8, headPitch: -4, headYaw: 16, pelvis: [0.4, -1.6, 0.4] },
    mio: { handR: [2.6, 41.2, 8.2], handL: [-0.6, 41, 8], handShapeR: 'relaxed', handShapeL: 'relaxed', elbowR: [1, -1, -0.2], elbowL: [-1, -1, -0.2], headPitch: 12, headYaw: 22, spinePitch: 8 },
    ren: { leftFree: 1, handL: [-9.6, 24.6, -0.6], handR: [5.4, 42, 7.8], handShapeR: 'flat', palmR: [-1, 0, 0.3], headPitch: 14, spinePitch: 10, pelvis: [0, -2, 0] },
    suzu: { footR: [7.2, 0, 7.4], handR: [16, 36, 2.4], handShapeR: 'spread', palmR: [0, 0.4, 1], handL: [-6, 34, 6], handShapeL: 'relaxed', spinePitch: 22, headPitch: 18, headRoll: 0, spineRoll: 0, pelvisRoll: 0, pelvis: [-0.4, -2.6, -0.4] },
    comp: { handR: [12.4, 62.5, 5.4], elbowR: [1, 0.1, -0.6], spinePitch: -3, spineYaw: 4, headPitch: -9, pelvis: [0, 0.2, 0] },
  };
  function reactPose(look, id, pose, v, k) {
    const R = readyOf(look, id);
    if (pose === 'hit') {
      // a directional recoil (the blow comes from up-right): knocked back at the waist, a foot catches
      // the weight, then back to the stance (soft: a smaller, quicker flinch; held: Mio's salts keep
      // them up — the knees go, then catch)
      const s = v === 'soft' ? 0.45 : 1;
      const H = over(R, { pelvis: [-0.8 * s, (v === 'held' ? -6.4 : -2.2) * s, -2.6 * s], spinePitch: R.spinePitch - 22 * s, spineYaw: R.spineYaw - 11 * s, headPitch: R.headPitch - 9 * s, headYaw: R.headYaw - 6 * s, headRoll: -5 * s, handR: [12.6, 33, -1.6], handL: holdsBook(look, id) ? R.handL : [-10.6, 35, 0.4], handShapeR: 'open', footRLift: 1.2 * s, hairLag: 2.4 * s, hairSway: 1.4 * s, clothSway: 1.2 * s });
      if (s < 1) H.handR = lerp(R.handR, H.handR, 0.45);
      const e = k < 0.16 ? ease(k / 0.16) : 1 - ease((k - 0.16) / 0.84);
      return blend(R, H, e);
    }
    if (pose === 'brace') {
      // the ward took it: a small flinch behind a raised forearm, and settle
      const Bp = over(R, { pelvis: [-0.3, -2, -0.8], spinePitch: 13, headPitch: 9, handR: [4.4, 41, 6.4], elbowR: [1, -1.2, 0.2], handShapeR: 'fist', hairLag: 1 });
      return blend(R, Bp, k < 0.22 ? ease(k / 0.22) : 1 - ease((k - 0.22) / 0.78));
    }
    if (pose === 'guard') {
      // braced for a blow (no ward implied): feet set wider, knees down, the forearm up; wary: a little
      const s = v === 'wary' ? 0.4 : 1;
      const Gp = over(R, { pelvis: [R.pelvis[0] - 0.2 * s, R.pelvis[1] - 1.6 * s, R.pelvis[2] - 0.6 * s], spinePitch: R.spinePitch + 4 * s, headPitch: R.headPitch + 5 * s, handR: lerp(R.handR, [5.4, 43, 7.4], s), elbowR: [1, -1.2, 0], handShapeR: s > 0.5 ? 'fist' : R.handShapeR, hairLag: 0.6 * s });
      return blend(R, Gp, env(k, 0.2, 0.8));
    }
    if (pose === 'soothed') {
      // a recovery received: the shoulders let go, the chest lifts, the face turns up a little
      const Sp = over(R, { spinePitch: R.spinePitch - 6, headPitch: R.headPitch - 8, pelvis: [R.pelvis[0], R.pelvis[1] + 0.6, R.pelvis[2]], handR: [R.handR[0] + 0.6, R.handR[1] - 1.4, R.handR[2]], handShapeR: 'open', palmR: [0, 1, 0.3], hairLag: -0.6 });
      return blend(R, Sp, env(k, 0.3, 0.7));
    }
    if (pose === 'afflict') {
      let Ap;
      if (v === 'hush') Ap = over(R, { spinePitch: R.spinePitch + 8, headPitch: R.headPitch + 12, pelvis: [R.pelvis[0], R.pelvis[1] - 1, R.pelvis[2]], handR: [5.2, 46, 7.4], handShapeR: 'relaxed', palmR: [-0.6, 0, -1], elbowR: [1, -1, -0.2] });
      else if (v === 'gust') Ap = over(R, { pelvis: [R.pelvis[0] - 0.6, R.pelvis[1] - 1.8, R.pelvis[2] - 1.4], spineRoll: 6, spinePitch: R.spinePitch + 2, headYaw: R.headYaw - 12, headPitch: R.headPitch + 4, handR: [6, 52, 8], handShapeR: 'open', palmR: [0.3, 0, 1], elbowR: [1, -0.8, -0.2], hairSway: 3, hairLag: 1.6, clothSway: 2.4 });
      else if (v === 'chill') { const sh = Math.sin(k * Math.PI * 10) * 0.45; Ap = over(R, { pelvis: [R.pelvis[0] + sh, R.pelvis[1] - 0.8, R.pelvis[2]], spinePitch: R.spinePitch + 6, headPitch: R.headPitch + 6, handR: [4.4, 40, 5.4], handShapeR: 'fist', elbowR: [1, -1.2, 0], handL: holdsBook(look, id) ? R.handL : [-3.6, 40, 5.4], elbowL: [-1, -1.2, 0] }); }
      else Ap = over(R, { handR: [9.6, 36.6, 7.4], handShapeR: 'open', palmR: [0, 1, 0.3], headPitch: R.headPitch + 10, headYaw: R.headYaw - 8, spinePitch: R.spinePitch + 3, pelvis: [R.pelvis[0], R.pelvis[1] - 0.6, R.pelvis[2]] }); // slip: a look at the hand
      return blend(R, Ap, env(k, 0.2, 0.75));
    }
    if (pose === 'down') return blend(R, over(R, DOWN_POSE), ease(k)); // (the knee goes down; no step)
    // cheer: settle into this person's own relief, with a small rise and an exhale
    const Cp = over(R, CHEER[id] || CHEER.comp);
    const p2 = blendStep(R, Cp, k < 0.3 ? ease(k / 0.3) : 1);
    const b = k > 0.3 ? bump(k, 0.3, 0.7) : 0;
    p2.pelvis[1] -= b * 0.8; p2.hairLag = (p2.hairLag || 0) + b * 1.2;
    return p2;
  }

  // ---- the entry point ------------------------------------------------------------------------------------
  // poseAt(look, pose, gestureOrVariant, k, t, who, reduce, id, idleKey)
  function poseAt(look, pose, g, k, t, who, reduce, id, ik) {
    id = id || (RB.battlers && RB.battlers.actorOf ? RB.battlers.actorOf(look, who) : who === 'comp' ? 'comp' : 'pc');
    let ps;
    if (pose === 'ready' || pose === 'calm') ps = idlePose(look, id, pose, ik || idleKey(id, pose, t, reduce), reduce);
    else if (pose === 'anticipate' || pose === 'act' || pose === 'recover') ps = gesturePose(look, id, g, pose, k);
    else ps = reactPose(look, id, pose, g, k);
    // a lantern or a cane stays out at the side in the left hand, where it can be seen, whatever the
    // right hand does — unless a gesture is about that lamp (leftFree)
    if (holdsLeft(look) && !(ps.leftFree > 0.5)) {
      const R = readyOf(look, id);
      ps.handL = [R.handL[0] + (ps.pelvis[0] - R.pelvis[0]) * 0.4, R.handL[1] + (ps.pelvis[1] - R.pelvis[1]) * 0.7, R.handL[2] + (ps.pelvis[2] - R.pelvis[2]) * 0.4];
      ps.elbowL = R.elbowL; ps.handShapeL = R.handShapeL;
      if (ps.prop.book) ps.prop.bookR = 1; // a book, when one is wanted, goes in the right hand
    }
    return ps;
  }

  // ---- the coverage record (§7.5): each required state → the pose that serves it, per actor ---------------
  // (tests/unit/battle_party.test.mjs draws every entry for every actor)
  const OWN = { pc: ['thread', 'direct', 'trace', 'crystal', 'book', 'lens', 'ward', 'restore', 'flow', 'sweep', 'plant', 'open', 'raise', 'ring', 'call'],
    nao: ['point', 'spot', 'call', 'reach', 'lunge', 'shoulder', 'help'], mio: ['pour', 'dab', 'waft', 'salts', 'tonic', 'help'],
    ren: ['ward', 'shade', 'flare', 'vigil', 'lanterns', 'front', 'help'], suzu: ['flourish', 'heckle', 'beckon', 'clap', 'feint', 'grand', 'help'] };
  const TECH_PARTNER = { nao: 'point', mio: 'pour', ren: 'ward', suzu: 'flourish' };
  function coverage(id) {
    const g0 = (OWN[id] || OWN.pc)[0];
    return {
      quietReady: ['calm', null], anticipate: ['anticipate', g0], express: ['act', g0, 0.2], release: ['act', g0, 1],
      protect: ['guard', null], receiveHealing: ['soothed', null], directHit: ['hit', null], softenedHit: ['hit', 'soft'], blockedHit: ['brace', null],
      condition: ['afflict', 'hush'], recover: ['recover', g0], incapacitated: ['down', null], revive: id === 'pc' ? ['recover', 'rise'] : ['act', 'help'],
      technique: id === 'pc' ? ['act', 'thread'] : ['act', TECH_PARTNER[id]], settle: ['cheer', null], idle: ['ready', null],
    };
  }

  return {
    ACTORS, GESTURES, VARIANTS, LOOP, OWN, TECH_PARTNER, STANCE, IDLE,
    poseAt, idleKey, idleTimes, hasGesture, hasVariant, gestureOf, coverage, readyOf,
    release: (id, g) => { const G = gestureOf(id, g); return G ? G.release : 0.3; },
    actHand: (id, g) => { const G = gestureOf(id, g); return G && G.a && G.a.act === 'L' ? 'L' : 'R'; },
    _: { over, plus, blend, restPose, idlePose, loopOf },
  };
})();
