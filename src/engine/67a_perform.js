/* The performance library (expansion P05; playbook V5 "Occupation, personality and interruption"). A catalogue of
 * complete actions — anticipation, the purposeful motion, contact, follow-through and a return — that any person can
 * be given by content (an NPC placement's `perform: 'sweep'` or `{ act, traits }`), built on the pose layer
 * (src/engine/32g_spritepose.js: named key poses and held objects) and the world proof's method
 * (src/engine/67_worldacts.js, whose three bespoke actions are listed here as `external`).
 *
 * A contract:
 *   { label, kind: 'work' | 'social', once (a one-shot gesture: plays once, then the person rests),
 *     anchor: { kinds: [prop kinds], at: 'front' | 'any' } (where the work is: checked on the map),
 *     facing: dir (else the placement's own), round(n, h) → [[phase, ms], …] (h(i, k): a hash of the round, never a
 *     random stream), pose: { phase: pose | [poseA, poseB, ms] | null (the ordinary stance) },
 *     prop: { phase: held object }, dir: { phase: dir } (a turn within the action), contact: { phase: what the held
 *     object meets }, still: { pose, prop } (reduced motion: one readable pose), world(ctx) (drawn beside the person:
 *     a stack that grows at the touch, dust at the broom) }
 * Interruption: the action yields at once to the game — a conversation, a scene that stages the person, walking, the
 * world not in play — and begins again from its anticipation afterwards (never a frozen half-gesture). One-shots
 * (social gestures) play during a scene too, cued with `!hook perform <npc> <act>`.
 * Personality (TRAITS): tempo, a gaze, and a mannerism of the person's own inserted now and then (a thoughtful
 * keeper adjusts their glasses; someone vain tends their hair; a performer acknowledges an imagined spotlight),
 * from the placement's `traits` or the person's mannerism class (src/engine/51_mannerisms.js). Timing offsets come
 * from the person, so neighbours never move in step.
 * Checks: validate(contract) (poses and objects exist, every phase drawn, deterministic rounds, lengths in range,
 * contact phases hold something); check(mapId) (every performer's anchor is where the contract says, and the person
 * can be reached to talk to: findable and interruptible). No current content uses it: a six-chapter journey looks as
 * it always has. */
var RB = (globalThis.RB = globalThis.RB || {});
RB.hooks = RB.hooks || {};

RB.perform = (function () {
  'use strict';
  const LIB = {};
  const hh = (a, b, k) => (RB.tiles && RB.tiles.hh ? RB.tiles.hh(a, b, k) : ((a * 73856093) ^ (b * 19349663) ^ (k * 83492791)) >>> 0);
  const P = () => RB.sprites && RB.sprites._pose;

  // held objects the library adds to the pose layer (drawn at the hand; additive: nothing else uses these names)
  const NEW_PROPS = {
    crate(b, x, y) { b.rect(x - 4, y - 6, 9, 7, '#8a6a44'); b.rect(x - 4, y - 6, 9, 1, '#a8885a'); b.rect(x - 4, y - 3, 9, 1, '#6a4a2c'); b.rect(x + 4, y - 5, 1, 6, '#5a3c24'); b.rect(x - 4, y, 9, 1, '#4a321e'); },
    rope(b, x, y) { b.rect(x - 2, y - 2, 4, 3, '#c8a868'); b.px(x - 1, y - 1, '#a88848'); b.px(x + 1, y - 2, '#e0c888'); b.line(x + 1, y + 1, x + 3, y + 5, '#c8a868'); },
    mortar(b, x, y) { b.rect(x - 3, y - 2, 6, 3, '#9a9aa2'); b.rect(x - 3, y - 2, 6, 1, '#c0c0c8'); b.rect(x - 2, y + 1, 4, 1, '#6a6a72'); b.line(x, y - 2, x + 2, y - 6, '#7a6a5a'); },
    scissors(b, x, y) { b.line(x, y, x + 3, y - 3, '#a8acb8'); b.line(x + 1, y, x + 3, y - 2, '#7a808c'); b.px(x - 1, y + 1, '#3a3440'); b.px(x, y + 1, '#3a3440'); },
  };
  let ready = false;
  function readyProps() {
    if (ready) return;
    const p = P();
    if (!p || !p.PROPS) return;
    for (const k in NEW_PROPS) if (!p.PROPS[k]) p.PROPS[k] = NEW_PROPS[k];
    ready = true;
  }

  // ---- personality (V5: timing, gaze, a mannerism; never random stereotypes) -------------------------------------
  const TRAITS = {
    thoughtful: { every: 2, insert: ['adjust', 900, 'temple'] },   // adjusts their glasses
    vain: { every: 3, insert: ['preen', 800, 'touchhair'] },       // tends their hair
    showy: { every: 3, insert: ['flourish', 900, 'wave'] },        // acknowledges an imagined spotlight
    brisk: { tempo: 0.8 },
    unhurried: { tempo: 1.25 },
    quiet: { tempo: 1.1, gaze: 'd' },                              // a quiet person stays quiet, not motionless
  };
  // the person's mannerism class gives a default
  const BY_CLASS = { scholar: ['thoughtful'], official: ['brisk'], performer: ['showy'], elder: ['unhurried'], keeper: ['quiet'], child: ['brisk'] };

  // ---- the catalogue -----------------------------------------------------------------------------------------------
  function define(id, c) {
    c.id = id;
    c.kind = c.kind || 'work';
    LIB[id] = c; // (checked by validate(c) once everything has loaded: the prop kinds it names come with content)
    return c;
  }
  const get = (id) => LIB[id] || null;
  const list = (kind) => Object.keys(LIB).map((k) => LIB[k]).filter((c) => !kind || c.kind === kind);

  function validate(c) {
    if (c.external) return [];
    readyProps();
    const e = [], p = P();
    const poses = new Set(), props = new Set(), phases = new Set();
    for (let n = 0; n < 12; n++) {
      const r1 = c.round(n, (i, k) => hh(n, i, k)), r2 = c.round(n, (i, k) => hh(n, i, k));
      if (JSON.stringify(r1) !== JSON.stringify(r2)) e.push('round ' + n + ' is not deterministic');
      let len = 0;
      for (const [ph, ms] of r1) { if (!(ms > 0)) e.push('phase ' + ph + ' has no length'); len += ms; phases.add(ph); }
      if (len < (c.once ? 600 : 1500) || len > (c.once ? 6000 : 30000)) e.push('round ' + n + ' lasts ' + len + ' ms');
    }
    for (const ph of phases) {
      if (!(ph in c.pose)) e.push('phase ' + ph + ' has no pose (null for the ordinary stance)');
      const v = c.pose[ph];
      for (const x of Array.isArray(v) ? v.slice(0, 2) : v ? [v] : []) poses.add(x);
      if (c.prop && c.prop[ph]) props.add(c.prop[ph]);
      if (c.contact && c.contact[ph] && !(c.prop && c.prop[ph]) && !c.anchor && !c.world) e.push('phase ' + ph + ' makes contact with nothing in hand, no anchor and nothing of its own beside it');
    }
    if (!c.still || !c.still.pose) e.push('no still pose (reduced motion)');
    else poses.add(c.still.pose);
    if (c.still && c.still.prop) props.add(c.still.prop);
    if (p) {
      for (const x of poses) if (!p.has(x) && !(RB.worldActs && RB.worldActs.NEW_POSES && RB.worldActs.NEW_POSES[x])) e.push('no pose ' + x);
      for (const x of props) if (!p.hasProp(x)) e.push('no held object ' + x);
    }
    if (c.anchor) for (const k of c.anchor.kinds || []) if (RB.props && RB.props.P && !RB.props.P[k]) e.push('no prop kind ' + k);
    return e;
  }

  // ---- who performs what --------------------------------------------------------------------------------------------
  function actOf(a) {
    if (a && a._pfOnce) return { act: a._pfOnce.act, once: true, traits: traitsOf(a, null) };
    const d = a && a.def && a.def.perform;
    if (!d) return null;
    const o = typeof d === 'string' ? { act: d } : d;
    return LIB[o.act] ? { act: o.act, traits: traitsOf(a, o.traits) } : null;
  }
  function traitsOf(a, given) {
    if (given) return [].concat(given).filter((t) => TRAITS[t]);
    try {
      const pr = RB.mannerisms && RB.mannerisms.forActor ? RB.mannerisms.forActor(a) : null;
      return (pr && BY_CLASS[pr.class]) || [];
    } catch (e) { return []; }
  }
  // a round with the person's tempo and, every few rounds, their own mannerism after the rest
  function roundOf(c, n, traits, seed) {
    let r = c.round(n, (i, k) => hh(n + seed, i, k)).map((x) => x.slice());
    for (const t of traits || []) {
      const T = TRAITS[t];
      if (T.tempo) r = r.map(([ph, ms]) => [ph, Math.round(ms * T.tempo)]);
      if (T.insert && !c.once && (n + seed) % T.every === 0) r.push([T.insert[0], T.insert[1]]);
    }
    return r;
  }
  const total = (r) => r.reduce((a, x) => a + x[1], 0);
  // where an actor is in their action at time t: { n (round), phase, u (0..1), into (ms) }; a person's own offset
  // keeps neighbours out of step
  function where(a, act, t, traits) {
    const c = LIB[act];
    const seed = hh(String(a.id || '').length * 7 + (a.home ? a.home[0] * 3 + a.home[1] : 0), 11, 913) % 97;
    const st = a._pf || (a._pf = { act, t0: t - (c.once ? 0 : hh(seed, 5, 914) % 3000), n: 0 });
    if (st.act !== act) { st.act = act; st.t0 = t; st.n = 0; }
    let el = t - st.t0, r = roundOf(c, st.n, traits, seed), len = total(r), guard = 0;
    while (el >= len && guard++ < 50) {
      if (c.once) return { n: st.n, phase: null, u: 1, into: 0, ended: true };
      st.t0 += len; st.n++; el -= len; r = roundOf(c, st.n, traits, seed); len = total(r);
    }
    if (el < 0) { st.t0 = t; el = 0; }
    let acc = 0;
    for (const [ph, ms] of r) { if (el < acc + ms) return { n: st.n, phase: ph, u: (el - acc) / ms, into: el - acc, ms }; acc += ms; }
    return { n: st.n, phase: r[r.length - 1][0], u: 1, into: 0, ms: 1 };
  }
  // free to work: the world in play, not walking, not staged, not talking (one-shots play in scenes too)
  function free(a, once) {
    if (!RB.game) return false;
    if (a.mv || a.route) return false;
    if (once) return true;
    if (RB.game.mode() !== 'world') return false;
    if (a.stg && a.stg.run && !a.stg.run.done) return false;
    return true;
  }
  // is this person busy with an action (so the idle habits leave them to it)?
  function working(a) { const p = actOf(a); return !!(p && !p.once && free(a)); }

  // ---- the frame: a pose key and a facing (src/engine/60_render.js artFor asks after the idle habits) --------------
  function frameOf(a, t, still) {
    const p = actOf(a);
    if (!p || !a.look || a.look.custom) return null;
    const c = LIB[p.act];
    if (!c || c.external) return null;
    readyProps();
    if (!free(a, p.once)) { if (a._pf) a._pf.held = true; return null; } // yields at once
    if (a._pf && a._pf.held) { a._pf.held = false; a._pf.t0 = t; a._pf.n = 0; } // and begins again from the anticipation
    const dir0 = c.facing || a.dir || 'down';
    if (still) return { dir: dir0, key: P().key(c.still.pose, { prop: c.still.prop || null }), ox: 0, oy: 0 };
    const w = where(a, p.act, t, p.traits);
    if (w.ended) { delete a._pfOnce; a._pf = null; return null; }
    let pose = c.pose[w.phase];
    let gaze = null;
    for (const tr of p.traits) {
      const T = TRAITS[tr];
      if (T.insert && w.phase === T.insert[0]) pose = T.insert[2];
      if (T.gaze && !gaze) gaze = T.gaze;
    }
    if (Array.isArray(pose)) pose = pose[Math.floor(w.into / pose[2]) % 2];
    const dir = (c.dir && c.dir[w.phase]) || dir0;
    if (!pose) return { dir, key: null, ox: 0, oy: 0, phase: w.phase };
    const prop = c.prop ? c.prop[w.phase] || null : null;
    return { dir, key: P().key(pose, { prop, gaze: w.phase === 'rest' ? gaze : null }), ox: 0, oy: 0, phase: w.phase };
  }
  // what the actions put beside the person (a stack, dust), in the y-sorted draw list
  function push(list, cx, ax, ay, t) {
    const W = RB.world && RB.world.W;
    if (!W || !W.npcs) return;
    const still = RB.game && RB.game.reducedMotion && RB.game.reducedMotion();
    for (const a of W.npcs) {
      const p = actOf(a);
      const c = p && LIB[p.act];
      if (!c || !c.world) continue;
      const working0 = free(a, p.once);
      const w = working0 && !still ? where(a, p.act, t, p.traits) : null;
      const fx = ax(a.fx * 16) + 16, fy = ay(a.fy * 16) + 30;
      list.push({ z: a.fy * 16 + 16 + (c.worldZ || -0.3), draw: () => c.world({ c: cx, x: fx, y: fy, w, t, still, working: working0, dir: c.facing || a.dir }) });
    }
  }

  // ---- placement checks (V5: findable and interruptible; anchors reachable) ------------------------------------------
  const DIRV = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  function check(mapId) {
    const def = RB.content.maps[mapId];
    const out = [];
    if (!def) return ['no map ' + mapId];
    let m;
    try { m = RB.maps.compile(mapId); } catch (e) { return ['no map ' + mapId]; }
    const free0 = (x, y) => x >= 0 && y >= 0 && x < m.w && y < m.h && !RB.maps.blockedStatic(m, x, y);
    // the tiles reachable from the map's ways in
    const seen = new Set(), q = [];
    for (const e of m.exits) for (let y = e.y; y < e.y + (e.h || 1); y++) for (let x = e.x; x < e.x + (e.w || 1); x++) if (free0(x, y)) { seen.add(x + ',' + y); q.push([x, y]); }
    while (q.length) { const [x, y] = q.shift(); for (const [dx, dy] of Object.values(DIRV)) { const k = (x + dx) + ',' + (y + dy); if (!seen.has(k) && free0(x + dx, y + dy)) { seen.add(k); q.push([x + dx, y + dy]); } } }
    for (const n of def.npcs || []) {
      if (!n.perform) continue;
      const o = typeof n.perform === 'string' ? { act: n.perform } : n.perform;
      const c = LIB[o.act];
      const who = (n.char || n.id) + ' (' + o.act + ')';
      if (!c) { out.push(who + ': no such action'); continue; }
      if (c.once) out.push(who + ': a one-shot gesture is cued by a scene, not placed');
      // findable: someone can stand beside them to talk
      if (!Object.values(DIRV).some(([dx, dy]) => seen.has((n.x + dx) + ',' + (n.y + dy)))) out.push(who + ': nobody can reach them to talk');
      if (c.anchor && c.anchor.at !== 'any') {
        const d = DIRV[c.facing || n.dir || 'down'];
        const fx = n.x + d[0], fy = n.y + d[1];
        const has = (def.props || []).some((pr) => {
          if ((c.anchor.kinds || []).indexOf(pr.p) < 0) return false;
          const pd = RB.props.P[pr.p] || {}, w = pr.w || pd.w || 1, h = pr.h || pd.h || 1;
          return fx >= pr.x && fx < pr.x + w && fy >= pr.y && fy < pr.y + h;
        });
        if (!has) out.push(who + ': the ' + c.anchor.kinds.join(' or ') + ' it works at is not in front of them');
      }
    }
    return out;
  }

  // a scene's cue for a one-shot gesture: !hook perform <npc id> <act>
  RB.hooks.perform = async (args) => {
    const a = RB.world && RB.world.actorById ? RB.world.actorById(args[0]) : null;
    const c = LIB[args[1]];
    if (!a || !c || !c.once) return;
    a._pfOnce = { act: args[1] };
    a._pf = null;
    const len = total(c.round(0, (i, k) => hh(0, i, k)));
    if (!(RB.game && RB.game.reducedMotion && RB.game.reducedMotion())) await new Promise((r) => setTimeout(r, len));
  };

  return { define, get, list, validate, frameOf, push, working, where, free, check, TRAITS, BY_CLASS, NEW_PROPS, readyProps, actOf, roundOf };
})();

// ---- the catalogue: complete actions (V5's subjects) ----------------------------------------------------------------
(function (F) {
  'use strict';
  // the world proof's three, drawn with their own art there (src/engine/67_worldacts.js)
  if (RB.worldActs) {
    F.define('fish', { label: 'Fish from a pier', external: 'worldActs', round: (n) => RB.worldActs.fishRound(n), pose: {}, still: { pose: 'rodhold' } });
    F.define('fold', { label: 'Fold the dry washing', external: 'worldActs', round: (n) => RB.worldActs.foldRound(n), pose: {}, still: { pose: 'fold2' } });
    F.define('sell', { label: 'Sell fish at a stall', external: 'worldActs', round: (n) => RB.worldActs.sellRound(n), pose: {}, still: { pose: 'showfish' } });
  }
  const R = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };

  // sweep a doorway: grip, strokes toward the side, gather the dust, a look up the street, rest (broom in hand)
  F.define('sweep', {
    label: 'Sweep a doorway', facing: 'down',
    round: (n, h) => [['grip', 380], ['stroke', 1400 + (h(1, 921) % 400)], ['gather', 520], ['look', 640], ['rest', 1800 + (h(2, 922) % 1800)]],
    pose: { grip: 'sweep1', stroke: ['sweep1', 'sweep2', 260], gather: 'sweep2', look: 'check', rest: null },
    prop: { grip: 'broom', stroke: 'broom', gather: 'broom', look: 'broom' },
    contact: { stroke: 'the ground', gather: 'the ground' },
    still: { pose: 'sweep1', prop: 'broom' },
    world: ({ c, x, y, w }) => { if (w && w.phase === 'stroke') { const k = Math.floor(w.into / 260) % 3; R(c, x - 14 - k * 3, y - 2 - k, 2, 1, 'rgba(200,180,140,0.7)'); R(c, x - 18 - k * 4, y - 3 - k, 1, 1, 'rgba(200,180,140,0.5)'); } },
  });
  // sort papers at a desk: take a slip, read it, place it, three times, square the stack, rest; the stack grows
  F.define('sort', {
    label: 'Sort papers', anchor: { kinds: ['desk', 'table', 'smalltable', 'counter'], at: 'front' },
    round: (n, h) => [['take', 420], ['read', 700 + (h(1, 923) % 300)], ['place', 380], ['take', 420], ['read', 600], ['place', 380], ['take', 420], ['place', 380], ['square', 560], ['rest', 1600 + (h(2, 924) % 1600)]],
    pose: { take: 'sort1', read: 'check', place: 'sort2', square: 'tidy2', rest: null },
    prop: { take: 'paper', read: 'paper', place: 'paper' },
    contact: { place: 'the stack on the desk', square: 'the stack' },
    still: { pose: 'check', prop: 'paper' },
  });
  // carry a crate from one stack to the other: stoop, lift, turn, set it down, straighten, rest (alternate ways)
  F.define('carry', {
    label: 'Carry and set down a crate', facing: 'left',
    round: (n, h) => [['stoop', 520], ['lift', 420], ['turn', 360], ['set', 520], ['straighten', 380], ['rest', 2000 + (h(1, 925) % 1600)]],
    pose: { stoop: 'bend', lift: 'holdboth', turn: 'holdboth', set: 'bend', straighten: null, rest: null },
    prop: { lift: 'crate', turn: 'crate' },
    dir: { turn: 'right', set: 'right', straighten: 'right' },
    contact: { stoop: 'the crate on the left stack', set: 'the right stack' },
    still: { pose: 'holdboth', prop: 'crate' },
    world: ({ c, x, y, w, still }) => {
      const n = w ? w.n : 0, ph = w ? w.phase : 'rest';
      // three crates move between two stacks: the left holds 3 - k, the right k
      let k = n % 4; if (k === 3) k = 0;
      const moved = w && (ph === 'set' && w.u > 0.6 || ph === 'straighten' || ph === 'rest');
      const inHand = w && (ph === 'lift' || ph === 'turn' || (ph === 'set' && w.u <= 0.6) || (ph === 'stoop' && w.u > 0.7));
      const left = 3 - k - (inHand || moved ? 1 : 0), right = k + (moved ? 1 : 0);
      const box = (bx, by) => { R(c, bx, by, 12, 9, '#4a321e'); R(c, bx + 1, by + 1, 10, 7, '#8a6a44'); R(c, bx + 1, by + 1, 10, 1, '#a8885a'); R(c, bx + 1, by + 4, 10, 1, '#6a4a2c'); };
      for (let i = 0; i < Math.max(0, left); i++) box(x - 34, y - 10 - i * 8);
      for (let i = 0; i < Math.max(0, right); i++) box(x + 22, y - 10 - i * 8);
      void still;
    },
  });
  // tie a line to a post: bend, loop it, pull it tight, test it, rest
  F.define('tie', {
    label: 'Tie a line', anchor: { kinds: ['lamppost', 'sign', 'signblank', 'fw_clamppost', 'fw_pulleypost', 'pet_post'], at: 'front' },
    round: (n, h) => [['bend', 460], ['loop', 1200 + (h(1, 926) % 300)], ['pull', 520], ['test', 600], ['rest', 2200 + (h(2, 927) % 1600)]],
    pose: { bend: 'bend', loop: ['jiggle1', 'jiggle2', 220], pull: 'fist', test: 'check', rest: null },
    prop: { loop: 'rope', pull: 'rope' },
    contact: { loop: 'the post', pull: 'the post' },
    still: { pose: 'jiggle1', prop: 'rope' },
  });
  // tend a lantern: reach up, open it, trim the wick, close it, step back and look, rest; it burns brighter after
  F.define('tend', {
    label: 'Tend a lantern', anchor: { kinds: ['lantern', 'lamppost', 'deadlantern', 'sa_lamp'], at: 'front' },
    round: (n, h) => [['reach', 420], ['open', 380], ['trim', 1000 + (h(1, 928) % 300)], ['close', 380], ['look', 700], ['rest', 2400 + (h(2, 929) % 1800)]],
    pose: { reach: 'tend1', open: 'tend2', trim: ['trim', 'tend2', 240], close: 'tend1', look: 'observe', rest: null },
    prop: { trim: 'scissors' },
    contact: { open: 'the lantern\'s door', trim: 'the wick', close: 'the lantern\'s door' },
    still: { pose: 'tend1' },
  });
  // read and turn a page: read, turn (the free hand crosses), read on, a glance up, rest
  F.define('read', {
    label: 'Read, turning the pages',
    round: (n, h) => [['read', 1800 + (h(1, 930) % 900)], ['turn', 420], ['read2', 1600 + (h(2, 931) % 900)], ['glance', 600], ['rest', 1400 + (h(3, 932) % 1400)]],
    pose: { read: 'read', turn: 'trace', read2: 'read', glance: 'listen', rest: null },
    prop: { read: 'book', turn: 'book', read2: 'book', glance: 'book' },
    contact: { turn: 'the page' },
    still: { pose: 'read', prop: 'book' },
  });
  // grind and inspect a remedy: pour, grind, hold the vial to the light, rest
  F.define('grind', {
    label: 'Grind and inspect a remedy', anchor: { kinds: ['table', 'smalltable', 'desk', 'counter'], at: 'front' },
    round: (n, h) => [['pour', 640], ['grind', 1400 + (h(1, 933) % 500)], ['inspect', 900], ['rest', 2000 + (h(2, 934) % 1600)]],
    pose: { pour: 'pour', grind: ['stir1', 'stir2', 240], inspect: 'hold', rest: null },
    prop: { pour: 'bottle', grind: 'mortar', inspect: 'bottle' },
    contact: { pour: 'the mortar', grind: 'the mortar' },
    still: { pose: 'hold', prop: 'bottle' },
  });

  // ---- one-shot social gestures (cued by scenes: !hook perform <npc> <act>) -----------------------------------------
  F.define('pointway', { label: 'Point along a route', kind: 'social', once: true, round: () => [['look', 300], ['point', 1100], ['hold', 500], ['back', 300]], pose: { look: 'aside', point: 'point', hold: 'point', back: null }, still: { pose: 'point' } });
  F.define('consider', { label: 'Consider a clue', kind: 'social', once: true, round: () => [['chin', 900], ['temple', 700], ['nod', 400], ['back', 300]], pose: { chin: 'chin', temple: 'temple', nod: 'nod1', back: null }, still: { pose: 'chin' } });
  F.define('laugh', { label: 'Laugh and settle', kind: 'social', once: true, round: () => [['laugh', 500], ['laugh2', 600], ['settle', 500], ['back', 300]], pose: { laugh: 'laugh', laugh2: 'laugh2', settle: 'smile', back: null }, still: { pose: 'smile' } });
  F.define('offer', { label: 'Offer an object', kind: 'social', once: true, round: () => [['take', 400], ['present', 1000], ['back', 300]], pose: { take: 'take', present: 'present', back: null }, prop: { take: 'paper', present: 'paper' }, contact: { present: 'the other person\'s hands' }, still: { pose: 'present', prop: 'paper' } });
  F.define('thanks', { label: 'Accept thanks', kind: 'social', once: true, round: () => [['thanks', 700], ['bow', 600], ['back', 300]], pose: { thanks: 'thanks', bow: 'bow1', back: null }, still: { pose: 'bow1' } });
  F.define('mistake', { label: 'Acknowledge a mistake', kind: 'social', once: true, round: () => [['brow', 600], ['shrug', 600], ['nod', 400], ['back', 300]], pose: { brow: 'brow', shrug: 'shrug', nod: 'nod2', back: null }, still: { pose: 'nod2' } });
})(RB.perform);
