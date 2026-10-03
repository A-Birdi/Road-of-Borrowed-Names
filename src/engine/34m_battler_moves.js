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
 * release at G.release), recover (k 0→1: back to exactly the stance). A gesture may pass through authored
 * keys on the way in (G.ant) and on the way back (G.rec), and draw its progress more finely (G.qk) — the four
 * Harmony performances (Harmony addendum §9: Nao's opening, Mio's draught, Ren's ward_plane, Suzu's curtain
 * with a full turn of the rig, `turn`) and the player's rally terminals (rally_thread / _release / _seal /
 * _catch). A foot that moves between two keys
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
      // turn: the whole body turned about the foot anchor (degrees, Suzu's twirl: real side, front and
      // back views of the rig, never a mirrored costume); clothFlare: a skirt's hem flaring out as it turns
      turn: 0, clothFlare: 0,
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
    // (the weight on the back, left leg: that hip up, the free right hip dropped, the shoulders set
    // against it — a readable weight shift with the near foot forward)
    pc: {
      pelvis: [-0.6, -1.9, 0], pelvisRoll: 2.6, spineRoll: -2, spinePitch: 10, spineYaw: 5, headYaw: 12, headPitch: -5, headRoll: 1,
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
  // The battle-ready pulse (ready only, never calm or reduced motion): while a key is held, the body keeps
  // a small rhythm — a dip at the knees with the hair settling, back through the key, a breath in with the
  // chest lifting, back — one drawing per step, so the stance stays alive at about 6–9 pose changes a
  // second instead of standing still between keys. Each person's own: Nao quick and springy, Mio a composed
  // breath, Ren grounded and slow, Suzu on her rhythm with a sway of the hip. The keys, their holds and
  // their transitions are unchanged; the pulse only fills the holds.
  const PULSE = {
    pc: { ms: 130, dip: { pelvis: [0, -0.9, 0.1], spinePitch: 1.2, headPitch: 0.8, handR: [0, -0.5, 0], handL: [0, -0.4, 0], hairLag: 0.7, clothSway: 0.2 }, lift: { pelvis: [0, 0.3, 0], spinePitch: -1.6, headPitch: -1, handR: [0, 0.3, 0], hairLag: -0.4 } },
    nao: { ms: 112, dip: { pelvis: [0.2, -1.1, 0.2], spinePitch: 1.6, headPitch: 1, handR: [0, -0.6, 0.2], hairLag: 0.8 }, lift: { pelvis: [0, 0.3, 0], spinePitch: -1.4, headPitch: -1.2, hairLag: -0.5 } },
    mio: { ms: 150, dip: { pelvis: [0, -0.7, 0], spinePitch: 0.8, headPitch: 1, handR: [0, -0.4, 0], handL: [0, -0.4, 0], hairLag: 0.5 }, lift: { pelvis: [0, 0.3, 0], spinePitch: -1.6, headPitch: -1.2, headRoll: 1.2, hairLag: -0.4 } },
    ren: { ms: 160, dip: { pelvis: [0, -0.8, 0], spinePitch: 0.8, headPitch: 0.6, handR: [0, -0.4, 0], hairLag: 0.5 }, lift: { pelvis: [0, 0.2, 0], spinePitch: -1.5, headPitch: -0.8, handR: [0, 0.4, 0], hairLag: -0.3 } },
    suzu: { ms: 124, dip: { pelvis: [-0.5, -0.9, 0], pelvisRoll: 1.2, spineRoll: -1, headRoll: 1, hairSway: 0.6, hairLag: 0.6, clothSway: 0.5 }, lift: { pelvis: [0.4, 0.3, 0], pelvisRoll: -0.6, spinePitch: -1.4, headRoll: -0.6, hairSway: -0.4, hairLag: -0.4, clothSway: -0.3 } },
    comp: { ms: 140, dip: { pelvis: [0, -0.8, 0], spinePitch: 1, headPitch: 0.6, hairLag: 0.5 }, lift: { pelvis: [0, 0.3, 0], spinePitch: -1.4, headPitch: -0.8, hairLag: -0.3 } },
  };
  const PULSE_SEQ = [4, 0, 5, 0]; // dip, the key, the breath in, the key
  const pulseOf = (id) => PULSE[id] || PULSE.comp;
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
      if (u < k.hold) {
        if (u < SETTLE_MS && k.hold > SETTLE_MS * 2) return i + '.3';
        // the pulse fills the rest of a ready hold that has room for it
        if (pose !== 'calm') {
          const Pu = pulseOf(id), u0 = k.hold > SETTLE_MS * 2 ? SETTLE_MS : 0;
          if (k.hold - u0 >= Pu.ms * 2) return i + '.' + PULSE_SEQ[Math.floor((u - u0) / Pu.ms) % PULSE_SEQ.length];
        }
        return i + '.0';
      }
      u -= k.hold;
    }
    return '0.0';
  }
  // the times that cover every distinct idle frame of an actor (for prewarming)
  function idleTimes(id, pose) {
    const I = IDLE[id] || IDLE.comp, seq = pose === 'calm' ? I.calm : I.ready, L = loopOf(id, pose);
    const out = [];
    let t = 0;
    const Pu = pulseOf(id);
    for (const k of seq) {
      out.push(t + k.tr * 0.25, t + k.tr * 0.75, t + k.tr + 40, t + k.tr + Math.min(k.hold - 1, SETTLE_MS + 40));
      // (the pulse's dip and breath, where the hold has them)
      const u0 = k.hold > SETTLE_MS * 2 ? SETTLE_MS : 0;
      if (pose !== 'calm' && k.hold - u0 >= Pu.ms * 2) out.push(t + k.tr + u0 + Pu.ms * 0.5, t + k.tr + u0 + Pu.ms * 2.5);
      t += k.tr + k.hold;
    }
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
    if (s === 4 || s === 5) return plus(B, pulseOf(id)[s === 4 ? 'dip' : 'lift'], amp);
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
  const seg = (k, a, b) => clamp01((k - a) / (b - a));
  // a track through authored keys [[k, values], …] (each key names the same moving values; numbers and
  // [x, y, z] eased between keys, a hand shape switching half way): the Harmony performances are written
  // as their key silhouettes and the in-betweens follow from them
  function track(k, keys) {
    if (k <= keys[0][0]) return clone(keys[0][1]);
    for (let i = 0; i < keys.length - 1; i++) {
      const [ka, A] = keys[i], [kb, B] = keys[i + 1];
      if (k <= kb) return blend(A, B, ease((k - ka) / (kb - ka)));
    }
    return clone(keys[keys.length - 1][1]);
  }
  const W2 = (...os) => Object.assign({}, ...os);
  // the player's shared rally: weight settled low, the writing hand gathered before the chest, the eyes on it;
  // reached through a breath in (the chest lifts, the hand comes in) — Harmony addendum §9.2
  const RALLY_A = { pelvis: [-0.8, -3.0, -0.4], pelvisRoll: 1.4, spineRoll: -1, spinePitch: 13, spineYaw: -2, headYaw: 6, headPitch: 4, handR: [7.2, 41.4, 6.4], elbowR: [1, -0.8, -0.2], handShapeR: 'pinch', palmR: [-0.6, 0, 0.6] };
  const RALLY_BREATH = [{ at: 0.4, o: { pelvis: [-0.6, -1.3, 0], spinePitch: 6, headPitch: -9, hairLag: -0.6, handR: [7.4, 34, 6.6] } }];
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
    // ---- the player's part in a Harmony technique (Harmony addendum §9.2): one shared rally — a grounded
    // breath, the writing hand gathered at the chest — and a terminal gesture that does what the technique
    // does: direct a thread (Nao), support a restorative release (Mio), complete a ward seal (Ren), seize
    // Suzu's opening (Suzu). Each starts and ends in the rear-three-quarter ready stance.
    // Nao: the thread sent out along the line his hand drew, released, then drawn back taut on the second knot
    rally_thread: {
      a: W2(RALLY_A, { prop: { strip: 0.6 } }), ant: RALLY_BREATH,
      x: (k) => {
        const out = ease(seg(k, 0, 0.42)), pull = ease(seg(k, 0.52, 0.9));
        const h = out < 1 ? path([[7.2, 41.4, 6.4], [8.6, 47.4, 11.8], [14.6, 45.6, 17.2]], out) : lerp([14.6, 45.6, 17.2], [12.6, 41.2, 5.8], pull);
        return { handR: h, elbowR: [1, -0.5 + pull * 0.3, -0.4 - pull * 0.5], handShapeR: 'pinch', palmR: [-0.4, 0, 1], spineYaw: -2 + 18 * out - 8 * pull, spinePitch: 11, headYaw: 12, headPitch: -8, pelvis: [-0.8 + 1.4 * out - pull, -2.8, -0.4 + 1.8 * out - 1.4 * pull], prop: { strip: 0.6 + 0.4 * out - 0.4 * pull }, hairSway: -1.2 * out + 1.4 * pull, clothSway: -0.8 * out + pull };
      },
      qk: 16, snap: 0, release: 0.42,
    },
    // Mio: the folio held open to receive the pour, then the hand rises and opens out over the two of you
    rally_release: {
      a: W2(RALLY_A, { handR: [2.6, 41, 9.2], handShapeR: 'cup', palmR: DOWN, headPitch: 12, handL: [-4.6, 37.8, 6.8], elbowL: [-1, -0.9, -0.2], handShapeL: 'cup', prop: { bookOpen: 0.85, bookTilt: -30, bookYaw: -10, bookAt: [1.2, 1.4, 0.8] } }), ant: RALLY_BREATH,
      x: (k) => W2(track(k, [
        [0, { handR: [2.6, 41, 9.2], palmR: DOWN, spinePitch: 13, headPitch: 12, headYaw: 6, pelvis: [-0.8, -3, -0.4] }],
        [0.45, { handR: [10.4, 47.6, 9.6], palmR: [0, 1, 0.4], spinePitch: 6, headPitch: -2, headYaw: 10, pelvis: [-0.4, -1.6, 0] }],
        [0.8, { handR: [15.2, 49.4, 4.4], palmR: [0, 1, 0.4], spinePitch: 3, headPitch: -8, headYaw: 8, pelvis: [0, -1, 0] }],
        [1, { handR: [15.2, 49.4, 4.4], palmR: [0, 1, 0.4], spinePitch: 3, headPitch: -8, headYaw: 8, pelvis: [0, -1, 0] }],
      ]), { handShapeR: k < 0.3 ? 'cup' : k < 0.6 ? 'open' : 'spread', elbowR: [1, -0.5, -0.8], handL: [-4.6, 37.8, 6.8], elbowL: [-1, -0.9, -0.2], handShapeL: 'cup', hairLag: -0.8 * seg(k, 0.4, 0.8), prop: { bookOpen: 1, bookTilt: -30, bookYaw: -10, bookAt: [1.2, 1.4, 0.8] } }),
      qk: 16, snap: 0, release: 0.45,
    },
    // Ren: the brush traces the level line of his plane from its other end, then closes it with a short
    // vertical stroke (not the forearm-across stroke of the ordinary Protect)
    rally_seal: {
      a: W2(RALLY_A, { prop: { brush: 1 } }), ant: RALLY_BREATH,
      x: (k) => W2(track(k, [
        [0, { handR: [7.2, 41.4, 6.4], spineYaw: -2, headYaw: 6, headPitch: 4 }],
        [0.24, { handR: [15.6, 43.4, 13], spineYaw: 14, headYaw: 16, headPitch: -4 }],
        [0.62, { handR: [3.4, 43.4, 13], spineYaw: -2, headYaw: 2, headPitch: -2 }],
        [0.8, { handR: [3.4, 35.4, 12.6], spineYaw: -2, headYaw: 2, headPitch: 4 }],
        [1, { handR: [3.4, 35.4, 12.6], spineYaw: -2, headYaw: 2, headPitch: 4 }],
      ]), { elbowR: [1, -0.7, -0.5], handShapeR: 'pinch', palmR: [0, -0.4, 1], spinePitch: 11, pelvis: [-0.4, -2.8, 0.4], prop: { brush: 1 }, clothSway: -0.6 * bump(k, 0.2, 0.7) }),
      qk: 16, snap: 0, release: 0.78,
    },
    // Suzu: the thread lifted high on her cue, swept out as a curtain's arc that catches the opening, and
    // hooked back — the creature's own move swung round
    rally_catch: {
      a: W2(RALLY_A, { prop: { strip: 0.6 } }), ant: RALLY_BREATH,
      x: (k) => W2(track(k, [
        [0, { handR: [7.2, 41.4, 6.4], spineYaw: -2, spinePitch: 13, headPitch: 4, pelvis: [-0.8, -3, -0.4], prop: { strip: 0.6 } }],
        [0.28, { handR: [6.4, 55, 9.8], spineYaw: -6, spinePitch: 4, headPitch: -12, pelvis: [-0.6, -1.4, -0.4], prop: { strip: 0.9 } }],
        [0.54, { handR: [16.4, 46.4, 15.8], spineYaw: 18, spinePitch: 9, headPitch: -6, pelvis: [0.8, -2.2, 1.2], prop: { strip: 1 } }],
        [0.84, { handR: [12.2, 39.2, 8.8], spineYaw: 6, spinePitch: 11, headPitch: -2, pelvis: [0.2, -2.6, 0.4], prop: { strip: 0.7 } }],
        [1, { handR: [12.2, 39.2, 8.8], spineYaw: 6, spinePitch: 11, headPitch: -2, pelvis: [0.2, -2.6, 0.4], prop: { strip: 0.7 } }],
      ]), { elbowR: [1, -0.4, -0.4], handShapeR: 'pinch', palmR: [-0.3, 0.2, 1], headYaw: 12, hairSway: -1.6 * bump(k, 0.3, 0.7) + 0.8 * bump(k, 0.6, 1), clothSway: -1.2 * bump(k, 0.3, 0.7) }),
      qk: 16, snap: 0, release: 0.52,
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

  // ---- the four Harmony performances (Harmony addendum §9.3–§9.7) -----------------------------------------
  // Each: an anticipation (a), a signature action (x, written as key silhouettes on a track) and a recovery
  // through its own key (rec) back to exactly the stance. They differ in body mechanics, not colour:
  // Nao drops his weight, steps and cuts; Mio measures, uncorks and pours; Ren plants, raises the lamp and
  // draws a level plane; Suzu steps back and turns a full twirl on the spot (the rig's own side, front and
  // back views — `turn` — never a mirrored costume), plants and opens her arm.
  // Nao — Read the Opening: a courier who reads routes. His pencil drawn from behind his ear (the elbow up, the
  // weight dropped); turned sharply side-on to the creature (`turn`: the rig's own side view, read from behind),
  // a step in, the pencil arm out high, the other back for balance — the pencil sketches the route out to it in
  // the air, two small ticks where its two knots will come loose, and stays at its end; then the pencil goes
  // back behind his ear with a glance to you, a short nod, and the stance.
  const NAO_EAR = { turn: 8, pelvis: [0.2, -4.4, 0], spinePitch: 14, spineYaw: 2, spineRoll: 2, headYaw: 4, headPitch: -6, headRoll: -7, handR: [11.6, 60.4, -2.4], elbowR: [1, 0.2, -0.3], handShapeR: 'pinch', palmR: [-1, 0, 0.1], handL: [-9.2, 27.6, -5.4], handShapeL: 'open', palmL: [0.3, -0.5, -1] };
  const NAO_A = { turn: 26, pelvis: [0.2, -5.8, 0], spinePitch: 20, spineYaw: 6, spineRoll: 0, headYaw: 6, headPitch: -12, headRoll: -2, handR: [9.8, 54.8, 12.6], elbowR: [1, -0.2, -0.6], handShapeR: 'pinch', palmR: [-0.6, 0, 0.8], handL: [-9.4, 27.4, -5.6], elbowL: [-1, 0.3, 0.3], handShapeL: 'open', palmL: [0.3, -0.5, -1], hairLag: 0.6, prop: { pencil: 1 } };
  const NAO_K = {
    // side-on, the right foot stepped in, leaning into it; the pencil arm raised to the route's start, the
    // left arm swung back for balance
    out: { turn: 54, footR: [1.2, 0, 9.6], footRYaw: 4, footL: [-0.3, 0, -6.5], footLYaw: -50, pelvis: [1.2, -4.8, 2.6], spinePitch: 18, spineYaw: 0, spineRoll: 0, headYaw: -6, headPitch: -14, headRoll: 0, handR: [6.8, 55.6, 13.4], elbowR: [1, -0.2, -0.6], handShapeR: 'pinch', palmR: [-0.6, 0, 0.8], handL: [-7.4, 33.6, -11.4], elbowL: [-1, -0.4, 0.2], handShapeL: 'open', palmL: [0, -0.6, -1], hairLag: 0.2, prop: { pencil: 1 } },
  };
  // the sketch: the pencil's way out along the route, dipping twice (the ticks on the knots), then the reach to
  // its end — "there"
  const NAO_SKETCH = [[6.8, 55.6, 13.4], [8.0, 57.4, 17.2], [8.6, 52.8, 19.4], [9.0, 56.2, 20.6], [9.6, 52.6, 22.0], [10.0, 56.0, 22.8], [10.6, 59.4, 24.2]];
  NAO_K.end = W2(NAO_K.out, { handR: NAO_SKETCH[6], headPitch: -18, spinePitch: 22, pelvis: [1.6, -4.6, 3.2], handL: [-6.6, 31.6, -12.6] });
  // Mio — Clearwater Draught: the vial from the bottles at her hip raised to eye level, the other hand
  // cupped under it (a check of the measure), turning so the action reads; uncorked with the thumb; then the
  // vial lifted high over her head, side-on, up on her toes, and tipped in one controlled pour — the stream
  // arcs up over the two of you — the free hand open and spread out over you both, guiding where it falls;
  // then the cork back, the vial to her hip and a small satisfied nod. In this technique the vial is drawn
  // larger (vialBig), so its one object reads at play scale.
  const MIO_A = { turn: 26, handR: [8.6, 53.2, 14.2], elbowR: [1, -0.9, -0.4], handShapeR: 'cup', palmR: [-0.8, 0, 0.4], handL: [7.0, 48.6, 14.4], elbowL: [-1, -0.9, -0.3], handShapeL: 'cup', palmL: [0, 1, 0.2], headYaw: 6, headPitch: -8, spinePitch: 4, spineYaw: 6, pelvis: [0, -1.4, 0.2], prop: { vial: 1, vialBig: 1, cork: 0, vialTilt: 0 } };
  const MIO_K = {
    // uncorked: the thumb of the cupping hand at the vial's mouth, the cork drawn
    open: W2(MIO_A, { handR: [8.8, 53.6, 14.0], handL: [8.4, 56.4, 14.4], handShapeL: 'pinch', palmL: [0.2, 1, 0.2], headPitch: -10, prop: { vial: 1, vialBig: 1, cork: 1, vialTilt: 0 } }),
    // raised high: the arm up over her head, side-on, risen onto her toes, leaning back a little to look up
    high: { turn: 40, handR: [8.8, 66.4, 7.6], elbowR: [1, 0.4, -0.4], handShapeR: 'cup', palmR: [-0.6, 0.2, 0.6], handL: [4.2, 48.4, 11.6], elbowL: [-1, -0.8, -0.1], handShapeL: 'open', palmL: [0.2, -0.6, 1], headYaw: 4, headPitch: -18, spinePitch: -2, spineYaw: 4, spineRoll: -2, pelvis: [0.2, 0.2, 0.4], footRLift: 0, prop: { vial: 1, vialBig: 1, cork: 1, vialTilt: 20 } },
  };
  // tipped: the pour — the vial over, the free hand spread out over you both
  MIO_K.pour = W2(MIO_K.high, { handR: [11.2, 65.2, 10.4], elbowR: [1, 0.3, -0.5], handL: [9.4, 50.6, 15.6], elbowL: [-1, -0.6, -0.1], handShapeL: 'spread', palmL: [0.2, -0.8, 0.6], headYaw: 12, headPitch: -12, spineYaw: 10, prop: { vial: 1, vialBig: 1, cork: 1, vialTilt: 112 } });
  // Ren — Lantern Ward: feet planted, knees down, the lamp drawn in before his chest; raised high at his side
  // and shaded (its shutter turned to the creatures, the light thrown back over the pair); the flat right
  // hand drawing a level line at chest height — the plane; then the lamp lowered and a check to either side.
  // (The lamp stays out at his left side throughout, where the rear view can see it: before his chest it
  // would be hidden behind him.)
  const REN_A = { leftFree: 1, act: 'L', pelvis: [0.2, -4.0, -0.2], spinePitch: 11, spineYaw: -2, spineRoll: 0, headYaw: -6, headPitch: 8, handL: [-11.6, 40.6, 4.4], elbowL: [-1, -0.6, -0.4], handR: [4.6, 42.4, 10.2], elbowR: [1, -0.9, -0.2], handShapeR: 'flat', palmR: [-1, 0, 0.2], prop: { flare: 0, lampShade: 0 } };
  const REN_RAISE = { handL: [-17.4, 54.6, -1.6], elbowL: [-1, 0.2, -0.8], handR: [-0.8, 43, 13], elbowR: [1, -0.9, -0.2], palmR: [0, -1, 0.25], spineYaw: -8, spinePitch: 6, spineRoll: 3, headYaw: -10, headPitch: -8, pelvis: [0.2, -4.2, -0.2], prop: { flare: 1, lampShade: 1 } };
  const REN_PLANE = W2(REN_RAISE, { handR: [16.4, 43, 13], elbowR: [1, -0.4, -0.5], spineYaw: 14, spinePitch: 7, spineRoll: 2, headYaw: 14, headPitch: -2, pelvis: [0.4, -4.2, 0.2] });
  // Suzu — Curtain Call: a preparation step back onto the left foot, the arm drawn across; gathered up onto
  // the spot, one compact twirl (dress and hair a beat behind), planted with the right foot forward, the arm
  // opened toward the shared action — the cue — and held; then a half-bow, a hand to her hip, the stance.
  const SUZU_A = { footL: [-5.0, 0, -6.4], footLYaw: 12, pelvis: [-1.8, -3.0, -1.8], pelvisRoll: 3, spinePitch: 4, spineRoll: -3, spineYaw: -18, headYaw: 4, headPitch: -6, headRoll: 2, handR: [-1.2, 41.4, 7.8], elbowR: [1, -0.6, 0.2], handShapeR: 'relaxed', palmR: [-1, 0, 0.3], hairSway: 0.8, clothSway: 0.6 };
  const SUZU_K = {
    a: W2(SUZU_A, { footR: [7.4, 0, 5.6], footRYaw: 34, handL: [-9.4, 32.4, -1.8], elbowL: [-1, 0.2, -0.5], handShapeL: 'flat', palmL: [1, 0, 0.2] }),
    // up on the spot for the turn: feet together under her, upright, both hands drawn in before the chest
    spin: { footL: [-2.6, 0, -1.4], footLYaw: 4, footR: [2.8, 0, 1.6], footRYaw: 10, pelvis: [0, -0.8, 0], pelvisRoll: 0, spinePitch: 2, spineRoll: 0, spineYaw: 0, headYaw: 0, headPitch: -4, headRoll: 0, handR: [4.6, 40.4, 6.6], elbowR: [1, -0.8, -0.3], handShapeR: 'relaxed', palmR: [-0.6, 0, 0.6], handL: [-4.4, 40, 6.2], elbowL: [-1, -0.8, -0.3], handShapeL: 'relaxed', palmL: [0.6, 0, 0.6] },
    // planted: the right foot forward toward the action, the hip set, the chin up, the arm open — the cue
    cue: { footL: [-4.6, 0, -2.8], footLYaw: 4, footR: [8.4, 0, 7.6], footRYaw: 30, pelvis: [-1.0, -1.8, 0.8], pelvisRoll: 4, spinePitch: 4, spineRoll: -5, spineYaw: 14, headYaw: 16, headPitch: -10, headRoll: 5, handR: [16.6, 48.6, 9.6], elbowR: [1, -0.2, -0.5], handShapeR: 'spread', palmR: [0.3, 0.6, 1], handL: [-9.4, 32.4, -1.8], elbowL: [-1, 0.2, -0.5], handShapeL: 'flat', palmL: [1, 0, 0.2] },
  };
  SUZU_K.out = W2(SUZU_K.spin, { footR: [5.2, 0, 4.2], footRYaw: 20, pelvis: [-0.6, -1.2, 0.4], handR: [7.6, 44, 8.6], spineYaw: 6, headYaw: 8, headPitch: -6 });
  SUZU_K.open = W2(SUZU_K.cue, { handR: [11.2, 49.4, 12.2], elbowR: [1, -0.5, -0.4], handShapeR: 'open', palmR: [0, 0.4, 1], headPitch: -8 });
  // where the twirl is at progress u (0..1): the turn itself eased in and out, a full circle that comes back
  // to 0 (360 is drawn as 0: the recovery never spins back round)
  const twirlTurn = (u) => { const t = 360 * ease(seg(u, 0.08, 0.96)); return t >= 359.5 ? 0 : Math.round(t * 10) / 10; };

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
      // Read the Opening (the technique; see NAO_EAR, NAO_A, NAO_K, NAO_SKETCH). Anticipation: the hand up to
      // his ear, the pencil taken (0.42–0.56), brought out before his shoulder as he turns. Signature: 0–0.18
      // side-on and stepped in, the pencil at the route's start; 0.18–0.9 the sketch out along the route (the
      // ticks at 0.42 and 0.66 — the cue at the first); 0.9–1 at its end, held. Recovery: the pencil back behind
      // his ear with a glance to you (0.4–0.5), a short nod (0.76), the stance.
      opening: {
        a: NAO_A,
        ant: [{ at: 0.42, o: NAO_EAR }, { at: 0.56, o: W2(NAO_EAR, { prop: { pencil: 1 } }) }],
        x: (k) => {
          const P = track(k, [[0, NAO_A], [0.18, NAO_K.out], [0.86, NAO_K.out], [1, NAO_K.end]]);
          if (k > 0.18) P.handR = path(NAO_SKETCH, seg(k, 0.18, 0.9));
          return W2(P, {
            footRLift: 1.8 * bump(k, 0.02, 0.2), hairSway: 1.4 * bump(k, 0, 0.3) - 0.6 * bump(k, 0.8, 1), clothSway: 1.0 * bump(k, 0, 0.32), hairLag: 0.5 * bump(k, 0.84, 1),
          });
        },
        rec: [
          { at: 0.4, o: W2(NAO_EAR, { turn: 16, footR: [6.6, 0, 5.4], footRYaw: 20, headYaw: 40, headPitch: -4, headRoll: -4, handL: [-9.2, 28.8, -5.2], elbowL: [-1, 0.3, 0.3], prop: { pencil: 1 } }) },
          { at: 0.5, o: W2(NAO_EAR, { turn: 14, footR: [6.6, 0, 5.4], footRYaw: 20, headYaw: 42, headPitch: -2, headRoll: -3, handL: [-9.2, 28.8, -5.2], elbowL: [-1, 0.3, 0.3], prop: { pencil: 0 } }) },
          { at: 0.76, o: { turn: 0, pelvis: [0.6, -3.4, 0.8], spinePitch: 17, spineYaw: 8, spineRoll: 0, headYaw: 36, headPitch: 10, headRoll: 3, handR: [10.6, 31.2, 8.4], elbowR: [1, -0.8, -0.6], handShapeR: 'relaxed', palmR: [-0.8, -0.4, 0.3], prop: { pencil: 0 } } },
        ],
        qk: 24, snap: 0, release: 0.42,
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
      // Clearwater Draught (the technique; see MIO_A, MIO_K). Anticipation: a hand to the bottles at her hip, the
      // vial raised to eye level and cupped as she turns. Signature: uncorked (0.14); lifted high over her head,
      // side-on (0.38); tipped over — the cue at 0.45, as the stream leaves — and poured, the free hand spread
      // over you both (0.6), held pouring. Recovery: the cork back before her chest (0.3); the vial at her hip
      // and a small satisfied nod (0.5); her head up again (0.72); the stance.
      draught: {
        a: MIO_A,
        ant: [{ at: 0.42, o: { turn: 8, handR: [8.6, 27.4, 3.6], elbowR: [1, -0.6, -0.4], handShapeR: 'cup', headPitch: 12, headYaw: 16, prop: { vial: 1, vialBig: 1 } } }],
        x: (k) => W2(track(k, [[0, MIO_A], [0.14, MIO_K.open], [0.38, MIO_K.high], [0.6, MIO_K.pour], [1, W2(MIO_K.pour, { prop: { vial: 1, vialBig: 1, cork: 1, vialTilt: 122 } })]]), {
          handShapeR: 'cup', handShapeL: k < 0.08 ? 'cup' : k < 0.3 ? 'pinch' : k < 0.5 ? 'open' : 'spread', hairLag: 0.8 * bump(k, 0.14, 0.5) - 0.4 * bump(k, 0.45, 0.8), clothSway: 0.6 * bump(k, 0.14, 0.6),
        }),
        rec: [
          { at: 0.3, o: { turn: 18, pelvis: [0, -1.4, 0.2], spinePitch: 6, spineYaw: 6, spineRoll: 0, handR: [6.6, 45.4, 9.8], elbowR: [1, -0.9, -0.4], handShapeR: 'cup', handL: [5.4, 49.2, 10.2], elbowL: [-1, -0.9, -0.3], handShapeL: 'pinch', palmL: [0.2, 1, 0.2], headYaw: 8, headPitch: 6, prop: { vial: 1, vialBig: 1, cork: 0, vialTilt: 0 } } },
          { at: 0.5, o: { turn: 6, pelvis: [0, -1.6, 0], spinePitch: 9, spineYaw: 8, handR: [8.6, 27.4, 3.6], elbowR: [1, -0.6, -0.4], handShapeR: 'cup', handL: [-2.2, 30.6, 7.8], elbowL: [-1, -0.8, -0.4], handShapeL: 'relaxed', headYaw: 24, headPitch: 18, headRoll: 3, prop: { vial: 1, vialBig: 1, cork: 0, vialTilt: 0 } } },
          { at: 0.72, o: { turn: 0, handR: [8.6, 27.4, 3.6], handShapeR: 'cup', headYaw: 26, headPitch: 0, headRoll: 2, prop: { vial: 1, vialBig: 1, cork: 0, vialTilt: 0 } } },
        ],
        qk: 24, snap: 0, release: 0.45,
      },
      // (her own way of 'restore': the draught poured)
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
        x: () => ({ leftFree: 1, handL: [-18.4, 50, -6.2], elbowL: [-1, 0.2, -0.8], handR: [8.4, 40, 8.4], handShapeR: 'flat', palmR: [-0.6, 0, 0.8], spinePitch: 2, spineRoll: 3, headPitch: -12, headYaw: -4, pelvis: [-0.4, -1.4, 0], act: 'L', prop: { flare: 1 } }),
        snap: 0.35, release: 0.4,
      },
      // Raise the lamps: the lamp raised high at his side and swung across, over every one of them
      lanterns: {
        a: { leftFree: 1, handL: [-12, 44, 2], elbowL: [-1, -0.4, -0.6], spinePitch: 6, spineYaw: -10, headYaw: -4, act: 'L' },
        x: (k) => ({ leftFree: 1, handL: path([[-18, 51, -4.6], [-6, 58, 11], [4.6, 51, 15]], ease(k / 0.75)), elbowL: [-1, 0.3, -0.4], spinePitch: 3, spineYaw: -10 + 26 * ease(k / 0.75), headPitch: -12, headYaw: 6, handR: [10.4, 38, 6], handShapeR: 'flat', act: 'L', prop: { flare: 1 }, clothSway: -1 * ease(k), hairSway: -0.8 * ease(k) }),
        snap: 0.2, release: 0.45,
      },
      // Stand in front: a step forward, the lamp held out before you, the free arm out across you
      front: {
        a: { pelvis: [0, -3.4, -0.6], spinePitch: 12, act: 'L' },
        x: () => ({ footR: [9.6, 0, 8.4], footRYaw: 26, pelvis: [1.8, -2.4, 2.4], spinePitch: 6, spineYaw: 16, leftFree: 1, handL: [5.4, 46, 15.4], elbowL: [-1, -0.4, -0.4], handR: [17, 42, 4.4], elbowR: [1, -0.6, -0.6], handShapeR: 'flat', palmR: [1, 0, 0.3], headPitch: -6, headYaw: 14, act: 'L', prop: { flare: 1 }, clothSway: -0.8 }),
        snap: 0.3, release: 0.45,
      },
      // Lantern Ward (the technique; see REN_A, REN_RAISE, REN_PLANE)
      ward_plane: {
        a: REN_A,
        x: (k) => W2(track(k, [[0, REN_A], [0.34, W2(REN_A, REN_RAISE)], [0.8, W2(REN_A, REN_PLANE)], [1, W2(REN_A, REN_PLANE)]]), { leftFree: 1, act: 'L', handShapeR: 'flat', clothSway: -0.5 * bump(k, 0.34, 0.8) }),
        rec: [
          { at: 0.36, o: { handL: [-11.0, 34.4, 2.6], elbowL: [-1, -0.5, -0.6], handR: [9.6, 40, 8.2], elbowR: [1, -1, -0.4], spineYaw: 6, spineRoll: 0, headYaw: 34, headPitch: 4, prop: { flare: 1, lampShade: 0 } } },
          { at: 0.66, o: { handL: [-12.2, 31.4, 1.8], headYaw: -12, headPitch: 3, spineYaw: 0, prop: { flare: 0, lampShade: 0 } } },
        ],
        qk: 16, snap: 0, release: 0.6,
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
      // Curtain Call (the technique; see SUZU_K): 0–0.48 the twirl, 0.48–0.66 planted and the arm opening
      // (the cue at 0.62), then held while her hair and hem settle a beat late
      curtain: {
        a: SUZU_A,
        x: (k) => {
          if (k < 0.48) {
            const u = seg(k, 0, 0.48), th = twirlTurn(u) * Math.PI / 180;
            const P = track(u, [[0, SUZU_K.a], [0.16, SUZU_K.spin], [0.84, SUZU_K.spin], [1, SUZU_K.out]]);
            // the left foot steps in under her as she rises; the turn on the ball of it, the right foot light
            return W2(P, { turn: twirlTurn(u), footLLift: 1.6 * bump(u, 0, 0.16), footRLift: 1.2 * bump(u, 0.12, 0.9),
              // hem and hair a beat behind the turn: they flare out as it gathers speed and swing past at its end
              clothFlare: Math.round(10 * bump(u, 0.12, 1.25)) / 10, hairLag: -1.1 * bump(u, 0.1, 1.1),
              hairSway: 0.8 * (1 - seg(u, 0, 0.16)) - 2.2 * Math.sin(th) * seg(u, 0.1, 0.3), clothSway: 0.6 * (1 - seg(u, 0, 0.16)) - 1.4 * Math.sin(th) * seg(u, 0.1, 0.3) });
          }
          const P = track(k, [[0.48, SUZU_K.out], [0.56, SUZU_K.open], [0.66, SUZU_K.cue], [1, SUZU_K.cue]]);
          const s = seg(k, 0.48, 0.95);
          return W2(P, { turn: 0, footRLift: 2 * bump(k, 0.48, 0.6),
            // the follow-through: the hem still out as she plants, the hair swinging past, then at rest
            clothFlare: Math.round(10 * 0.55 * (1 - ease(seg(k, 0.48, 0.78)))) / 10, hairLag: 0.9 * bump(k, 0.48, 0.8),
            hairSway: 1.5 * Math.sin(Math.PI * seg(s, 0, 0.3)) * (1 - s) - 0.5 * bump(s, 0.3, 0.8), clothSway: 0.9 * Math.sin(Math.PI * seg(s, 0, 0.3)) * (1 - s) });
        },
        rec: [{ at: 0.5, o: { headPitch: 18, headYaw: 8, headRoll: 2, spinePitch: 14, spineYaw: 6, spineRoll: -3, handR: [11.2, 33.4, 6.2], elbowR: [1, -0.6, -0.6], handShapeR: 'open', palmR: [-0.6, -0.4, 0.4], handL: [-9.4, 32.4, -1.8], handShapeL: 'flat', pelvis: [-1.2, -2.4, 0.2], footR: [7.6, 0, 6.2], hairLag: 0.8, clothSway: 0.4 } }],
        qk: 32, snap: 0, release: 0.62,
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
  // A path through authored keys: P0 at 0, each key { at, o } (o: the values that key changes, laid over the
  // straight blend at that moment), P1 at 1; eased within each segment, a moving foot lifted (the Harmony
  // performances' anticipations and recoveries: a hand to the bottles at the hip before the vial rises, a
  // nod to the player, a half-bow — each still ends exactly where it must).
  function keyed(P0, keys, P1, k) {
    const pts = [{ at: 0, P: P0 }].concat(keys.map((q) => ({ at: q.at, P: over(blend(P0, P1, q.at), q.o) })), [{ at: 1, P: P1 }]);
    if (k <= 0) return clone(P0);
    if (k >= 1) return clone(P1);
    let i = 0;
    while (i < pts.length - 2 && k >= pts[i + 1].at) i++;
    const a = pts[i], b = pts[i + 1];
    return blendStep(a.P, b.P, ease((k - a.at) / (b.at - a.at)));
  }
  function gesturePose(look, id, gesture, stage, k) {
    const R = readyOf(look, id), G = gestureOf(id, gesture) || GEST.direct;
    if (gesture === 'rise') {
      // helped up: from the knee (where 'down' left them) back to the stance
      const D = over(R, DOWN_POSE);
      return stage === 'recover' ? blend(D, R, ease(k)) : stage === 'anticipate' ? blend(R, D, ease(k)) : D;
    }
    const A = over(R, G.a || {});
    const X = (q) => over(A, G.x(q, R));
    if (stage === 'anticipate') return G.ant ? keyed(R, G.ant, A, k) : blendStep(R, A, ease(k));
    if (stage === 'act') {
      if (G.snap) { const t = clamp01(k / G.snap); return k < G.snap ? blendStep(A, X(k), ease(t)) : X(k); }
      if (G.direct) return X(k); // (a path that starts at its own anticipation key: no settling blend)
      return blendStep(A, X(k), clamp01(k / 0.12));
    }
    return G.rec ? keyed(X(1), G.rec, R, k) : blendStep(X(1), R, ease(k)); // recover
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
  const OWN = { pc: ['thread', 'direct', 'trace', 'crystal', 'book', 'lens', 'ward', 'restore', 'flow', 'sweep', 'plant', 'open', 'raise', 'ring', 'call', 'rally_thread', 'rally_release', 'rally_seal', 'rally_catch'],
    nao: ['point', 'spot', 'call', 'reach', 'lunge', 'shoulder', 'help', 'opening'], mio: ['pour', 'dab', 'waft', 'salts', 'tonic', 'help', 'draught'],
    ren: ['ward', 'shade', 'flare', 'vigil', 'lanterns', 'front', 'help', 'ward_plane'], suzu: ['flourish', 'heckle', 'beckon', 'clap', 'feint', 'grand', 'help', 'curtain'] };
  // the Harmony techniques (Harmony addendum §9): the companion's own performance and the player's terminal
  const TECH_PARTNER = { nao: 'opening', mio: 'draught', ren: 'ward_plane', suzu: 'curtain' };
  const TECH_LEAD = { nao: 'rally_thread', mio: 'rally_release', ren: 'rally_seal', suzu: 'rally_catch' };
  function coverage(id) {
    const g0 = (OWN[id] || OWN.pc)[0];
    return {
      quietReady: ['calm', null], anticipate: ['anticipate', g0], express: ['act', g0, 0.2], release: ['act', g0, 1],
      protect: ['guard', null], receiveHealing: ['soothed', null], directHit: ['hit', null], softenedHit: ['hit', 'soft'], blockedHit: ['brace', null],
      condition: ['afflict', 'hush'], recover: ['recover', g0], incapacitated: ['down', null], revive: id === 'pc' ? ['recover', 'rise'] : ['act', 'help'],
      technique: id === 'pc' ? ['act', 'rally_thread'] : ['act', TECH_PARTNER[id]], settle: ['cheer', null], idle: ['ready', null],
    };
  }

  return {
    ACTORS, GESTURES, VARIANTS, LOOP, OWN, TECH_PARTNER, TECH_LEAD, STANCE, IDLE,
    poseAt, idleKey, idleTimes, hasGesture, hasVariant, gestureOf, coverage, readyOf,
    release: (id, g) => { const G = gestureOf(id, g); return G ? G.release : 0.3; },
    // how finely a gesture's progress is drawn (frames per stage; a twirl needs more than a point)
    qkOf: (id, g) => { const G = gestureOf(id, g); return (G && G.qk) || 0; },
    actHand: (id, g) => { const G = gestureOf(id, g); return G && G.a && G.a.act === 'L' ? 'L' : 'R'; },
    PULSE, _: { over, plus, blend, restPose, idlePose, loopOf },
  };
})();
