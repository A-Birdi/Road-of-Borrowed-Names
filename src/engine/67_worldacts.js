/* The world proof's purposeful actions (expansion P01, W03; docs/future/work/P01_WORLD.md "W03"; playbook V5):
 * complete actions with anticipation, the purposeful motion, contact, follow-through and a return, performed by
 * people who already stand where the work is. Drawn only by the proof (src/engine/65_worldlook.js, ?dev=world),
 * only on the slice's maps; nothing moves anyone from their tile, nothing is saved, nothing changes the story.
 *
 *   fish     Yasu on the pier: ready, the rod drawn back, the cast, the line flying out and the float landing
 *            with a ring, the wait (the float bobbing), a nibble, the bite, the strike (the rod bending), the
 *            reel (the float coming in), then a catch (the fish lifted off, unhooked, into the basket) or a
 *            miss (an empty hook, a small shake of the head), and baiting again.
 *   fold     Tomo by the washing line, folding the dry washing: bending to the basket in front of her for a cloth,
 *            shaking it out (a lift and a snap down), folding it in half and again, laying it on the stack (the stack
 *            grows at the touch), stepping back; every fifth round she lifts the folded stack into the basket.
 *            (A first version pegged cloths on the line, but from where she stands her hands fall well short of it:
 *            the line gained a cloth with no hand there. Replaced rather than sliding her a tile.)
 *
 *   sell     Kiyo at her fish stall in Saltglass (W05, the method reused): bending to the counter for a fish, holding
 *            it up to the square, cleaning it (knife strokes), wrapping it in paper, laying the parcel on the counter's
 *            end (the stack grows at the touch); every fourth round she hands the stack across to a customer, and now
 *            and then she calls out to the square. A front view, where the other two are side views.
 *
 * Every action yields at once to the game: while anyone talks, a scene stages the person, they walk, or the
 * world isn't in play, the person is the game's own (their rod rests against the post, the cloth is in the
 * basket) and the action starts again from its beginning afterwards. With reduced motion each holds one still,
 * readable pose (the float resting on the water, a cloth held). Timing comes from the frame's time and each
 * person's own offset; which rounds end in a catch comes from a hash of the round, never a random stream. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.worldActs = (function () {
  'use strict';
  const K = RB.propKit;
  const { R, ell, line, ramp } = K;
  const hh = (x, y, k) => RB.tiles.hh(x, y, k);
  const CAST = { 'rw.village': { yasu: 'fish', tomo: 'fold' }, 'sg.harbor': { kiyo: 'sell' } };

  // the pose layer's keys the actions use (added to POSES only when the proof first draws an action)
  const NEW_POSES = {
    rodready: { G: 'forward', O: 'low', eyes: null },
    castback: { G: 'up', O: 'chest', lean: -1, hx: -1, eyes: 'u' },
    castfwd: { G: 'reach', O: 'forward', lean: 1, hx: 1 },
    rodhold: { G: 'forward', O: 'low', hy: 1, eyes: 'd' },
    strike: { G: 'raise', O: 'chest', lean: -1, eyes: 'u' },
    reel1: { G: 'forward', O: 'rub', hy: 1, eyes: 'd' },
    reel2: { G: 'forward', O: 'in', hy: 1, eyes: 'd' },
    unhook: { G: 'chest', O: 'chest', hy: 1, eyes: 'd' },
    stoop: { G: 'low', O: 'low', lean: 3, hx: 2, hy: 2, drop: 1, eyes: 'd' },
    shakeout1: { G: 'out', O: 'out', eyes: 'u', drop: -1 },
    shakeout2: { G: 'low', O: 'low', hy: 1, eyes: 'd' },
    fold1: { G: 'forward', O: 'forward', hy: 1, eyes: 'd' },
    fold2: { G: 'chest', O: 'chest', hy: 1, eyes: 'd' },
    placeit: { G: 'low', O: 'low', lean: 2, hx: 1, hy: 2, drop: 1, eyes: 'd' },
    lookback: { G: 'clasp', O: 'clasp', lean: -1, eyes: 'd' },
    pickup: { G: 'low', O: 'low', hy: 2, drop: 1, eyes: 'd' },
    showfish: { G: 'up', O: 'low', eyes: null, mouth: 'w' },
    clean1: { G: 'in', O: 'forward', hy: 1, eyes: 'd' },
    clean2: { G: 'chest', O: 'forward', hy: 1, eyes: 'd' },
    wrap1: { G: 'forward', O: 'forward', hy: 1, eyes: 'd' },
    wrap2: { G: 'in', O: 'in', hy: 1, eyes: 'd' },
    setdown: { G: 'low', hy: 2, drop: 1, eyes: 'd' },
    callout: { G: 'palm', mouth: 'o' },
    handacross: { G: 'reach', O: 'low', lean: 1 },
  };
  let posesReady = false;
  function readyPoses() {
    if (posesReady) return;
    const P = RB.sprites._pose && RB.sprites._pose.POSES;
    if (!P) return;
    for (const k in NEW_POSES) if (!P[k]) P[k] = NEW_POSES[k];
    posesReady = true;
  }

  // ---- timelines --------------------------------------------------------------------------------------------
  // a round is a list of [phase, ms]; the round's length and outcome come from a hash of (actor, round)
  function fishRound(n) {
    const wait = 2600 + (hh(n, 1, 901) % 3200), catchIt = hh(n, 2, 902) % 3 !== 0;
    return [['ready', 700], ['back', 420], ['cast', 260], ['fly', 420], ['settle', 500], ['wait', wait], ['nibble', 700], ['wait2', 500 + (hh(n, 3, 903) % 900)], ['bite', 320], ['strike', 260], ['reel', 1500]]
      .concat(catchIt ? [['lift', 380], ['unhook', 1100], ['basket', 800], ['rebait', 1000]] : [['empty', 420], ['headshake', 700], ['rebait', 1100]]);
  }
  // the folded stack holds 0..4 cloths: four rounds each add one, the fifth lifts the stack into the basket
  function stackCount(n) { return ((n % 5) + 5) % 5; }
  function foldRound(n) {
    return stackCount(n) < 4
      ? [['stoop', 620], ['lift', 300], ['snap1', 260], ['snap2', 200], ['snap1', 240], ['snap2', 220], ['fold1', 520], ['fold2', 520], ['place', 560], ['back', 300], ['look', 900], ['rest', 2400 + (hh(n, 4, 904) % 2400)]]
      : [['stoop', 640], ['gather', 700], ['lower', 620], ['back', 300], ['rest', 3200 + (hh(n, 5, 905) % 2400)]];
  }
  // the parcels on the counter: three rounds each add one, the fourth hands them across
  function parcelCount(n) { return ((n % 4) + 4) % 4; }
  function sellRound(n) {
    const call = hh(n, 6, 907) % 3 === 0 ? [['call', 900]] : [];
    return parcelCount(n) < 3
      ? [['pickup', 520], ['show', 760], ['clean', 1440], ['wrap', 960], ['set', 560]].concat(call, [['rest', 2200 + (hh(n, 7, 908) % 2400)]])
      : [['pickup', 520], ['across', 900], ['back', 400]].concat(call, [['rest', 2600 + (hh(n, 8, 909) % 2400)]]);
  }
  const ROUND = { fish: fishRound, fold: foldRound, sell: sellRound };
  const total = (r) => r.reduce((a, p) => a + p[1], 0);

  // where an actor is in their action at time t: { round n, phase, u (0..1 through the phase), into (ms) }
  function where(a, kind, t) {
    const st = a._act || (a._act = { kind, t0: t - (hh((a.id || '').length, 7, 906) % 4000), n: 0 });
    if (st.kind !== kind) { st.kind = kind; st.t0 = t; st.n = 0; }
    let el = t - st.t0, r = ROUND[kind](st.n), len = total(r);
    let guard = 0;
    while (el >= len && guard++ < 50) { st.t0 += len; st.n++; el -= len; r = ROUND[kind](st.n); len = total(r); }
    if (el < 0) { st.t0 = t; el = 0; }
    let acc = 0;
    for (const [ph, ms] of r) { if (el < acc + ms) return { n: st.n, phase: ph, u: (el - acc) / ms, ms, into: el - acc }; acc += ms; }
    return { n: st.n, phase: r[r.length - 1][0], u: 1, ms: 1, into: 0 };
  }
  // the person is free to work: the world in play, not walking, not staged, not talking
  function free(a) {
    if (!RB.game || RB.game.mode() !== 'world') return false;
    if (a.mv || a.route) return false;
    if (a.stg && a.stg.run && !a.stg.run.done) return false;
    return true;
  }
  function kindOf(a, m) {
    const c = m && CAST[m.id];
    return c && a && a.id ? c[a.id] || null : null;
  }
  // the proof's action is this person's idle life: the game's own habits (src/engine/52_staging.js) leave them
  // to it, or every habit would interrupt the round and start it again. Scenes and conversations still take over.
  function working(a) {
    const m = RB.world && RB.world.W && RB.world.W.map;
    if (!kindOf(a, m) || !a.look || a.look.custom) return false;
    return !!(RB.worldLook && RB.worldLook.active(m) && RB.worldLook.opts.kit);
  }

  // ---- the person's frame: a pose key and a drawn facing (the renderer's artFor asks this first) -------------
  const P = () => RB.sprites._pose;
  function frameOf(a, t, still) {
    const m = RB.world && RB.world.W && RB.world.W.map, kind = kindOf(a, m);
    if (!kind || !a.look || a.look.custom) return null;
    if (!free(a)) { if (a._act) a._act.t0 = t; return null; } // yields; begins again afterwards
    readyPoses();
    let pose, dir, prop = null, ox = 0, oy = 0;
    if (kind === 'fish') {
      dir = 'right';
      if (still) pose = 'rodhold';
      else {
        const w = where(a, 'fish', t);
        pose = { ready: 'rodready', back: 'castback', cast: 'castfwd', fly: 'castfwd', settle: 'rodhold', wait: 'rodhold', nibble: 'rodhold', wait2: 'rodhold', bite: 'rodhold', strike: 'strike', reel: (Math.floor(w.into / 180) % 2 ? 'reel2' : 'reel1'), lift: 'strike', unhook: 'unhook', basket: 'stoop', empty: 'strike', headshake: (Math.floor(w.into / 170) % 2 ? 'shakeL' : 'shakeR'), rebait: 'unhook' }[w.phase] || 'rodhold';
      }
    } else if (kind === 'fold') {
      dir = 'left';
      if (still) pose = 'fold2';
      else {
        const w = where(a, 'fold', t);
        pose = { stoop: 'stoop', lift: 'hold', snap1: 'shakeout1', snap2: 'shakeout2', fold1: 'fold1', fold2: 'fold2', place: 'placeit', back: 'lookback', look: 'lookback', gather: 'placeit', lower: 'stoop', rest: null }[w.phase];
        if (w.phase === 'back' || w.phase === 'look') ox = 1;
        if (!pose) dir = 'down';
      }
    }
    else if (kind === 'sell') {
      dir = 'down';
      if (still) pose = 'showfish';
      else {
        const w = where(a, 'sell', t);
        pose = { pickup: 'pickup', show: 'showfish', clean: Math.floor(w.into / 180) % 2 ? 'clean2' : 'clean1', wrap: w.u < 0.5 ? 'wrap1' : 'wrap2', set: 'setdown', across: 'handacross', back: null, call: 'callout', rest: null }[w.phase];
      }
    }
    if (!pose) return { dir, key: null, ox, oy };
    const key = P().key(pose, { prop, breath: 0, blink: false });
    return { dir, key, ox, oy };
  }

  // ---- what the actions put in the world: drawn in the y-sort, beside the person -----------------------------
  // hand positions in the side view (art px from the frame's top-left, facing right) for the rod's butt
  const HAND = { rodready: [28, 33], castback: [25, 12], castfwd: [31, 32], rodhold: [28, 34], strike: [25, 15], reel1: [28, 34], reel2: [28, 34], unhook: [25, 31], stoop: [29, 38] };
  // the rod's angle (radians from pointing right; negative is up) per pose
  const ANGLE = { rodready: -0.45, castback: -2.3, castfwd: -0.15, rodhold: -0.55, strike: -1.2, reel1: -0.7, reel2: -0.75, unhook: -0.25, stoop: 0.15 };
  const WOOD = ramp('#8a6a44', 0.45, 0.35), LINE = 'rgba(236,236,228,0.75)';
  function fishFloat(c, x, y, sink) {
    R(c, x - 1, y - 2 + sink, 3, 2, '#e04848'); R(c, x - 1, y + sink, 3, 1, '#fff4f0'); R(c, x, y - 3 + sink, 1, 1, '#2a2024');
  }
  function ring(c, x, y, k, a) {
    if (a <= 0) return;
    c.strokeStyle = 'rgba(230,244,255,' + a.toFixed(3) + ')';
    c.lineWidth = 1;
    c.beginPath(); c.ellipse(x + 0.5, y + 0.5, 3 + k * 9, 1.5 + k * 3.5, 0, 0, Math.PI * 2); c.stroke();
  }
  function fishArt(f) {
    return K.cached('wa-fish|' + f, () => K.make(12, 8, (g) => {
      const s = ramp('#8aa8c0', 0.45, 0.4);
      ell(g, 5, 4, 4, 2, s[2]); ell(g, 4.6, 3.4, 3, 1, s[3]); R(g, 8, f ? 2 : 3, 1, 3, s[1]); R(g, 9, f ? 1 : 2, 2, 2, s[1]); R(g, 9, f ? 5 : 4, 2, 2, s[1]);
      R(g, 2, 3, 1, 1, '#1a1420');
      K.outline(g, 12, 8, 'sel');
    }));
  }
  function basketArt() {
    return K.cached('wa-basket', () => K.make(14, 11, (g) => {
      const w = ramp('#b0884a', 0.45, 0.35);
      R(g, 1, 3, 12, 7, w[2]); R(g, 1, 3, 12, 1, w[3]); R(g, 2, 9, 10, 1, w[0]);
      for (let x = 2; x < 12; x += 2) R(g, x, 4, 1, 5, w[1]);
      R(g, 3, 1, 8, 1, w[1]); R(g, 2, 2, 1, 1, w[1]); R(g, 11, 2, 1, 1, w[1]);
      K.outline(g, 14, 11, 'sel');
      g.globalCompositeOperation = 'destination-over'; K.shadow(g, 7, 10, 6, 1.5, 0.3); g.globalCompositeOperation = 'source-over';
    }));
  }
  // a fish lying across the hands, inked round so it reads against an apron
  function fishFlat(c, x, y) {
    const s5 = ramp('#7a9ab8', 0.45, 0.4);
    ell(c, x + 6, y + 2, 6, 2.8, '#22283a');
    ell(c, x + 6, y + 2, 5, 1.8, s5[2]); R(c, x + 2, y + 1, 7, 1, s5[4]); R(c, x + 3, y + 3, 6, 1, s5[1]);
    R(c, x + 11, y - 1, 2, 2, '#22283a'); R(c, x + 11, y + 3, 2, 2, '#22283a'); R(c, x + 11, y, 1, 4, s5[1]);
    R(c, x + 2, y + 1, 1, 1, '#0e0c14');
  }
  // the catch held up by the tail, head down
  function fishHang(c, x, y) {
    const s5 = ramp('#7a9ab8', 0.45, 0.4);
    ell(c, x + 2, y + 7, 2.8, 6, '#22283a');
    ell(c, x + 2, y + 7, 1.8, 5, s5[2]); R(c, x + 1, y + 3, 1, 8, s5[4]);
    R(c, x, y, 2, 2, '#22283a'); R(c, x + 3, y, 2, 2, '#22283a');
    R(c, x + 2, y + 11, 1, 1, '#0e0c14');
  }
  // a parcel in kraft paper tied with red string
  function parcel(c, x, y) {
    R(c, x - 1, y - 1, 11, 6, '#3a2a1c');
    R(c, x, y, 9, 4, '#c49a62'); R(c, x, y, 9, 1, '#dcb680'); R(c, x, y + 3, 9, 1, '#9a7448'); R(c, x + 4, y, 1, 4, '#c0303a'); R(c, x, y + 2, 9, 1, '#c0303a');
  }
  const CLOTH = ['#e8dcc4', '#c86a5a', '#5a7ab0', '#d8b860', '#8aa86a'];
  function clothHang(c, hx, hy, col, len, wave) {
    const c5 = ramp(col, 0.45, 0.35);
    for (let i = 0; i < 9; i++) {
      const x = hx - 6 + i, l = len + ((i + wave) % 3 === 0 ? 1 : 0);
      R(c, x, hy, 1, l, c5[i < 2 ? 3 : i > 6 ? 1 : 2]);
    }
    R(c, hx - 6, hy, 9, 1, c5[4]);
  }
  function clothFlick(c, hx, hy, col, u) {
    // snapped down and out: the cloth stands out from the hands, its far edge whipping
    const c5 = ramp(col, 0.45, 0.35), reach = 8 + Math.round(Math.sin(u * Math.PI) * 4);
    for (let i = 0; i < reach; i++) R(c, hx - 2 - i, hy - 1 + Math.round(Math.sin(i * 0.9 + u * 6) * 1), 1, 6, c5[i % 3 === 0 ? 1 : 2]);
    R(c, hx - 2 - reach, hy, 1, 4, c5[3]);
  }
  function clothHalf(c, hx, hy, col) {
    const c5 = ramp(col, 0.45, 0.35);
    R(c, hx - 5, hy - 1, 7, 6, c5[2]); R(c, hx - 5, hy - 1, 7, 1, c5[4]); R(c, hx + 1, hy, 1, 5, c5[1]); R(c, hx - 5, hy + 4, 7, 1, c5[1]);
  }
  function foldedCloth(c, x, y, k) {
    const c5 = ramp(CLOTH[k % CLOTH.length], 0.45, 0.35);
    R(c, x, y, 8, 3, c5[2]); R(c, x, y, 8, 1, c5[4]); R(c, x + 7, y, 1, 3, c5[1]); R(c, x, y + 2, 8, 1, c5[0]);
  }
  function push(list, c, m, env, t) {
    const W = RB.world.W, cast = CAST[m.id];
    if (!cast) return;
    const A = RB.sprites.ANCHOR;
    for (const a of W.npcs) {
      const kind = cast[a.id];
      if (!kind) continue;
      const fx = env.ax(a.fx * 16) + 16, fy = env.ay(a.fy * 16) + 30, z = a.fy * 16 + 16;
      if (fx < -80 || fy < -80 || fx > env.bw + 120 || fy > env.bh + 80) continue;
      const working = free(a), still = env.still;
      if (kind === 'fish') {
        list.push({ z: z - 0.3, draw: () => c.drawImage(basketArt(), fx - 22, fy - 9) });
        if (!working) {
          // the rod rests against the pier's post, its line wound
          list.push({ z: z - 0.2, draw: () => { line(c, fx + 10, fy - 2, fx + 4, fy - 30, WOOD[1], 1); R(c, fx + 4, fy - 31, 1, 2, WOOD[3]); } });
          continue;
        }
        const w = still ? { phase: 'wait', u: 0.5, into: 0, n: 0 } : where(a, 'fish', t);
        const pose = still ? 'rodhold' : (frameOf(a, t, still) || {}).key ? (/^p:([a-z0-9_]+)/.exec(frameOf(a, t, still).key) || [])[1] : 'rodhold';
        const hand = HAND[pose] || HAND.rodhold, ang = ANGLE[pose] != null ? ANGLE[pose] : null;
        const hx = fx - A.x + hand[0], hy = fy - A.y + hand[1];
        // the float's resting place out on the water, and where it is now
        const rx = fx + 94, ry = fy - 5;
        let bx = rx, by = ry, sink = 0, rings = null, flying = false, fishAt = null;
        const ph = w.phase, u = w.u;
        if (ph === 'ready' || ph === 'back' || ph === 'cast' || ph === 'rebait' || ph === 'unhook' || ph === 'basket' || ph === 'headshake' || ph === 'empty' || ph === 'lift') bx = null; // the float is in hand
        if (ph === 'fly') { flying = true; bx = hx + (rx - hx) * u; by = hy - 20 + (ry - hy + 20) * u - Math.sin(u * Math.PI) * 22; }
        if (ph === 'settle') rings = u;
        if (ph === 'wait' || ph === 'wait2') sink = still ? 0 : Math.round(Math.sin(t / 420 + w.n) * 0.6);
        if (ph === 'nibble') { sink = Math.floor(u * 6) % 2; rings = (u * 2) % 1; }
        if (ph === 'bite') { sink = 2; rings = u; }
        if (ph === 'strike') { sink = 2; }
        if (ph === 'reel') { bx = rx + (fx + 14 - rx) * u; by = ry + (fy - 2 - ry) * u; sink = 1; rings = (u * 3) % 1; if (w.n !== undefined && hh(w.n, 2, 902) % 3 !== 0) fishAt = [bx, by + 1]; }
        list.push({ z: z + 0.2, draw: () => {
          // the rod: from the hands, bending under a fish while it's struck and reeled
          const L = 34, bend = ph === 'strike' || ph === 'reel' ? 0.35 : ph === 'bite' ? 0.15 : 0;
          const a0 = ang != null ? ang : -0.6;
          let px0 = hx, py0 = hy, tipX = hx, tipY = hy;
          for (let i = 1; i <= L; i++) {
            const k = i / L, aa = a0 + bend * k * k;
            const x = hx + Math.cos(aa) * i, y = hy + Math.sin(aa) * i;
            R(c, Math.round(x), Math.round(y) + 1, 1, 1, WOOD[0]);
            R(c, Math.round(x), Math.round(y), 1, 1, i < 8 ? WOOD[1] : WOOD[2]);
            if (i % 3 === 0 && i < L - 2) R(c, Math.round(x), Math.round(y) - 1, 1, 1, WOOD[3]);
            px0 = x; py0 = y; tipX = x; tipY = y;
          }
          // the line: from the tip to the float (or a short dangle with the hook when the float is in hand)
          if (bx == null) {
            const caught = hh(w.n, 2, 902) % 3 !== 0;
            if (ph === 'unhook' && caught) {
              // the fish in his hands, the hook being worked free; the line runs from the tip to it
              line(c, Math.round(tipX), Math.round(tipY), hx - 3, hy - 1, LINE, 1);
              c.drawImage(fishArt(still ? 0 : Math.floor(t / 160) % 2), hx - 9, hy - 5);
              return;
            }
            line(c, Math.round(tipX), Math.round(tipY), Math.round(tipX), Math.round(tipY) + 8, LINE, 1);
            if (ph === 'lift' && caught) c.drawImage(fishArt(Math.floor(t / 140) % 2), Math.round(tipX) - 6, Math.round(tipY) + 6);
            // into the basket: the fish drops from his hands as he stoops
            if (ph === 'basket' && caught && u < 0.6) c.drawImage(fishArt(0), fx - 22 + Math.round(u * 4), fy - 22 + Math.round(u * 16));
            return;
          }
          const sag = flying ? 0 : ph === 'reel' || ph === 'strike' || ph === 'bite' ? 2 : 7;
          c.strokeStyle = LINE; c.lineWidth = 1;
          c.beginPath(); c.moveTo(Math.round(tipX) + 0.5, Math.round(tipY) + 0.5);
          c.quadraticCurveTo((tipX + bx) / 2, Math.max(tipY, by) + sag, Math.round(bx) + 0.5, Math.round(by) - 2.5 + sink); c.stroke();
          if (rings != null) { ring(c, Math.round(bx), Math.round(by), rings, 0.6 * (1 - rings)); }
          if (fishAt && !still) c.drawImage(fishArt(Math.floor(t / 120) % 2), Math.round(fishAt[0]) - 6, Math.round(fishAt[1]) - 3);
          fishFloat(c, Math.round(bx), Math.round(by), sink);
        } });
      } else if (kind === 'sell') {
        // the fish and the knife in her hands, the paper parcel, the parcels at the counter's end (drawn over the
        // counter, which stands in front of her)
        const w = !working || still ? null : where(a, 'sell', t);
        const n = w ? w.n : 0, ph = w ? w.phase : 'rest', u = w ? w.u : 0;
        let stack = parcelCount(n);
        if (w && parcelCount(n) < 3 && (ph === 'rest' || ph === 'call' || (ph === 'set' && u >= 0.6))) stack++;
        // the handover: the parcels leave the counter as she lifts them (the end of the pickup) and stay in her hands
        if (w && parcelCount(n) === 3 && (ph === 'across' || ph === 'back' || ph === 'call' || ph === 'rest' || (ph === 'pickup' && u > 0.55))) stack = 0;
        const sx = fx + 22, sy = fy + 6;
        list.push({ z: 19 * 16 + 0.1 + (a.fy - 17) * 16, draw: () => { for (let i = 0; i < stack; i++) parcel(c, sx + (i % 2) * 3, sy - i * 3); } });
        if (!w && !still) continue;
        const hx = fx, hy = fy - 22; // between her hands, in front of her
        list.push({ z: z + 0.2, draw: () => {
          if (still) { fishFlat(c, hx - 6, hy - 2); return; }
          if (ph === 'pickup' && u > 0.55) {
            if (parcelCount(n) === 3) { for (let i = 0; i < 3; i++) parcel(c, hx - 4, hy + 2 - i * 3); } else fishFlat(c, hx - 6, hy + 2);
          }
          else if (ph === 'show') fishHang(c, fx - A.x + 4, fy - A.y + 12);
          else if (ph === 'clean') {
            fishFlat(c, hx - 6, hy);
            const k = Math.floor(w.into / 180) % 2; // the knife, in her right hand (screen left), stroking along the fish
            R(c, hx - 5 + k * 5, hy - 2, 5, 1, '#d8dce4'); R(c, hx - 5 + k * 5, hy - 1, 5, 1, '#7a808c'); R(c, hx - 7 + k * 5, hy - 2, 2, 2, '#5a3a24');
            if (k) R(c, hx + 2, hy - 3, 1, 1, '#ffffff');
          } else if (ph === 'wrap') {
            fishFlat(c, hx - 6, hy);
            const cover = u < 0.5 ? u * 2 : 1;
            R(c, hx - 7, hy - 1, Math.round(14 * cover), 5, '#c49a62'); R(c, hx - 7, hy - 1, Math.round(14 * cover), 1, '#dcb680');
            if (u >= 0.5) { R(c, hx - 1, hy - 1, 1, 5, '#c0303a'); R(c, hx - 7, hy + 1, 14, 1, '#c0303a'); }
          } else if (ph === 'set' && u < 0.6) parcel(c, hx - 4 + Math.round(u * 30), hy + Math.round(u * 40));
          else if (ph === 'across' && u < 0.6) { for (let i = 0; i < 3; i++) parcel(c, hx - 18 - Math.round(u * 8), hy - 2 - i * 3); }
        } });
      } else if (kind === 'fold') {
        // the basket in front of her (she faces left), the folded stack on its lid, the cloth between her hands
        const bx0 = fx - 28, by0 = fy - 9;
        const w = !working || still ? null : where(a, 'fold', t);
        const n = w ? w.n : 0, ph = w ? w.phase : 'rest', u = w ? w.u : 0;
        let stack = stackCount(n);
        if (w && stackCount(n) < 4 && ['place', 'back', 'look', 'rest'].includes(ph) && (ph !== 'place' || u >= 0.55)) stack = stackCount(n) + 1;
        if (w && stackCount(n) === 4 && (ph === 'gather' || ph === 'lower' || ph === 'back' || ph === 'rest')) stack = 0; // in her hands, then in the basket
        list.push({ z: z - 0.3, draw: () => {
          c.drawImage(basketArt(), bx0, by0);
          for (let i = 0; i < stack; i++) foldedCloth(c, bx0 + 3, by0 + 1 - i * 2, i);
        } });
        if (!w) continue;
        // hand positions in the side view facing left (the right-facing table mirrored across the 40-px frame)
        const HL = { hold: [15, 31], shakeout1: [11, 29], shakeout2: [13, 35], fold1: [12, 33], fold2: [15, 31], placeit: [11, 37], stoop: [11, 38] };
        const pose = (/^p:([a-z0-9_]+)/.exec((frameOf(a, t, false) || {}).key || '') || [])[1];
        const h = HL[pose];
        if (!h) continue;
        const hx = fx - A.x + h[0], hy = fy - A.y + h[1];
        const col = CLOTH[n % CLOTH.length];
        list.push({ z: z + 0.2, draw: () => {
          if (ph === 'stoop' && u < 0.6) return; // still in the basket
          if (ph === 'lift') clothHang(c, hx, hy, col, 8, 0);
          else if (ph === 'snap1') clothHang(c, hx, hy, col, 11, Math.round(Math.sin(u * Math.PI) * 2));
          else if (ph === 'snap2') clothFlick(c, hx, hy, col, u);
          else if (ph === 'fold1') clothHalf(c, hx, hy, col);
          else if (ph === 'fold2' || (ph === 'place' && u < 0.55)) foldedCloth(c, hx - 4, hy - 2, n);
          else if (ph === 'gather') { for (let i = 0; i < 4; i++) foldedCloth(c, hx - 4, hy - 2 - i * 2, i); }
        } });
      }
    }
  }
  return { frameOf, push, where, free, working, CAST, NEW_POSES, stackCount, parcelCount, fishRound, foldRound, sellRound };
})();
