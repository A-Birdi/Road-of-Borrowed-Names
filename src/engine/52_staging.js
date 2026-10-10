/* Staging: one owner for how people move between their steps (docs/expressive/CONTRACT.md §3.4, §3.8).
 *
 * Two clients share one actor model (a.stg on each world actor) and one renderer path
 * (RB.staging.frameOf, asked by 60_render.js drawActor):
 *
 *  1. Scenes. The script ops (!gesture, !look, !pose, !walkto, !prop, !beat, !ambience; 70_script.js)
 *     cue the gesture library (RB.gestures) on the line that follows them. A scene owns the actors it
 *     names from its first cue to its end (a scene token): their idle life stops, a cue's entry → peak →
 *     recovery plays on the world clock, an early advance settles every cue at once (its hold, or its
 *     end), and the scene's end releases them (poses, looks and props cleared; a person moved for the
 *     scene walks back to their place, the companion back to your side). Nothing here touches the
 *     story's state: inventory, flags and quests stay with !give/!take/!set.
 *  2. Idle life (the paired addendum). Outside dialogue every person on screen lives by their mannerism
 *     profile (RB.mannerisms): a resting stance, small habits at their own pace, occupation idles at a
 *     station, pauses on a wanderer's round, a word between neighbours, a glance at someone arriving or
 *     leaving, the companion's presence when you stop, and your own small idles. It yields at once —
 *     to a scene, a battle, a menu, a map change, a puzzle or the player moving — and costs nothing
 *     off screen. Choices are seeded per person (RB.staging.seed), never Math.random, so a test can
 *     repeat them. Reduced motion holds the resting stance, plays no habits, and shows a cue's key
 *     pose without in-betweens.
 *
 * API (scene side): begin(sceneId) → token, end(token), cue(ref, gesture, o), look(ref, target),
 *   pose(ref, name), walkTo(ref, x, y, dir, o), prop(ref, kind, o), beat(id), ambience(preset),
 *   settle(why), owned(actor), actor(ref, ctx), playerMoved() (a scene's !move pc, from 50_world.js)
 * API (world side): tick(dt), frameOf(actor, t, still, frame), wanderPause(n), stepped(n), rand(a, k),
 *   examined(x, y), ambienceNow()
 * Tests and tools: state(), stats(), trace(), seed(n), enabled(v), release() */
var RB = (globalThis.RB = globalThis.RB || {});

RB.staging = (function () {
  'use strict';
  const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
  const st = {
    seed: 20261003, on: true, token: 0, scene: null, evN: 0, cap: 1, busy: 0, gate: -1e9, pairs: new Map(), lastLeavers: new Set(),
    arrival: null, examine: null, shared: null, sharedNext: 0, lastMove: 0, lastMap: null, socialNext: 0,
    trace: [], stats: null,
  };
  const fresh = () => ({ habits: 0, social: 0, route: 0, react: 0, shared: 0, playerIdle: 0, compIdle: 0, cues: 0, settled: 0, walks: 0, walkFallbacks: 0, maxActive: 0, cap: 0, tickN: 0, tickMs: 0, tickMax: 0, beats: [], released: 0, yields: 0 });
  st.stats = fresh();
  const W = () => RB.world.W;
  const T = () => W().time;

  // ---- seeded choices ---------------------------------------------------------------------------------
  function h32(str) {
    let h = (st.seed ^ 0x811c9dc5) >>> 0;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d) >>> 0; h ^= h >>> 12; h = Math.imul(h, 0x297a2d39) >>> 0; h ^= h >>> 15;
    return (h >>> 0) / 4294967296;
  }
  const keyOf = (a) => (a === W().player ? 'pc' : a === W().comp ? 'comp:' + a.id : a.id || '?') + '@' + (W().map ? W().map.id : '');
  // the k-th draw of a stream for one person on this map (the same sequence however frames fall)
  function rand(a, stream) {
    const s = S(a);
    const n = (s.n[stream] = (s.n[stream] || 0) + 1);
    return h32(keyOf(a) + '|' + stream + '|' + n);
  }
  function S(a) {
    return a.stg || (a.stg = { run: null, pose: null, look: null, gaze: null, held: null, owner: 0, next: null, n: {}, map: null, prof: null, stations: null, hist: [], rest: null });
  }

  // ---- profiles ------------------------------------------------------------------------------------------
  // Restraint by place and story state (the world review's WR-06): Lanternfall before its bell is orderly
  // and constrained (fewer, politer exchanges), the Archive road and the Still Archive are quiet. A mood
  // slows the pace of habits, lowers how readily people turn to each other and narrows what they say.
  const MOODS = [
    { map: /^lf\./, if: '!lf_bell_rung', slower: 1.4, social: 0.4, talk: ['nod', 'palm'] },
    { map: /^(sa|sv)\./, slower: 1.6, social: 0.3, talk: ['nod'] },
    // the inn full of people sheltering from the storm: tending, listening, resting — nobody bouncing
    { map: /^sb\.inn$/, if: 'sb_storm&!sb_morning', slower: 1.3, social: 0.6, talk: ['nod', 'palm'], avoid: ['bounce', 'heeltap', 'hum', 'stretch', 'peek'] },
  ];
  function moodOf(m) {
    const s = RB.game.s;
    for (const md of MOODS) if (md.map.test(m.id) && (!md.if || (s && RB.state.test(s, md.if)))) return md;
    return null;
  }
  function profileOf(a) {
    const s = S(a), m = W().map;
    if (!s.prof || s.map !== (m && m.id)) {
      const r = RB.mannerisms ? RB.mannerisms.forActor(a) : { prof: { class: 'town', idle: [], every: [12, 24], talk: [] }, stations: new Set() };
      const md = m && moodOf(m);
      if (md) r.prof = Object.assign({}, r.prof, { every: (r.prof.every || [12, 24]).map((v) => v * md.slower), social: (r.prof.social || 0) * md.social, moodTalk: md.talk, moodAvoid: md.avoid || null });
      s.prof = r.prof; s.stations = r.stations; s.map = m && m.id;
      s.rest = restFor(a, r.prof);
      s.next = null; s.n = {};
    }
    return s.prof;
  }
  // the resting stance as a pose key part: 'pose' or 'pose.R' (the hand), with a held object (restProp)
  function restFor(a, prof) {
    if (!a.look || a.look.custom || a.look.pet || !prof.rest) return null;
    const [name] = prof.rest.split('.');
    if (!RB.sprites._pose || !RB.sprites._pose.has(name)) return null;
    // a two-handed stance is not for someone with something in hand (a cane, a lamp, a book, a basket)
    const h = RB.sprites._pose.holds(a.look);
    const two = { hips: 1, behind: 1, folded: 1, clasp: 1, sleeves: 1 }[name];
    if (two && (h.L || h.R)) return null;
    return prof.rest;
  }

  // ---- whom a ref names --------------------------------------------------------------------------------
  const personOf = (n) => (n.def && (n.def.char || n.def.id)) || n.id;
  function actor(ref, ctx) {
    const w = W();
    if (!w.map || ref == null) return null;
    if (typeof ref === 'object') return ref;
    if (ref === 'pc' || ref === 'player') return w.player;
    if (ref === 'npc' && ctx && ctx.npc) ref = ctx.npc;
    if (ref === 'comp') return w.comp || null;
    if (w.comp && w.comp.id === ref) return w.comp;
    const all = w.npcs.concat(w.extras || []);
    return all.find((n) => n.id === ref) || all.find((n) => personOf(n) === ref) || null;
  }
  const idOf = (a) => (a === W().player ? 'pc' : a === W().comp ? 'comp' : a.id);

  // ---- targets ---------------------------------------------------------------------------------------------
  // a target: an actor, a tile 'x,y', 'prop:<kind>' (the nearest such prop), a direction word, or null
  function target(ref, from, ctx) {
    if (ref == null || ref === '-' || ref === '') return null;
    if (typeof ref === 'object' && ref.x != null) return ref;
    if (DIRS[ref]) return { x: from.x + DIRS[ref][0] * 6, y: from.y + DIRS[ref][1] * 6, dirOnly: ref };
    const m = /^(-?\d+),(-?\d+)$/.exec(ref);
    if (m) return { x: +m[1], y: +m[2] };
    if (ref.startsWith('prop:')) {
      const kind = ref.slice(5), mp = W().map;
      let best = null, bd = 1e9;
      for (const p of mp.props) {
        if (p.p !== kind && !(p.p || '').includes(kind)) continue;
        if (p.if && !RB.state.test(RB.game.s, p.if)) continue;
        const pd = RB.props.P[p.p] || {};
        const w = p.w || pd.w || 1, h = p.h || pd.h || 1;
        const cx = Math.max(p.x, Math.min(from.x, p.x + w - 1)), cy = Math.max(p.y, Math.min(from.y, p.y + h - 1));
        const d = Math.abs(cx - from.x) + Math.abs(cy - from.y);
        if (d < bd) { bd = d; best = { x: cx, y: cy }; }
      }
      return best;
    }
    return actor(ref, ctx);
  }
  const posOf = (t) => (t ? { x: t.fx != null ? t.fx : t.x, y: t.fy != null ? t.fy : t.y } : null);
  function dirTo(a, t) {
    const p = posOf(t);
    if (!p) return a.dir;
    if (t.dirOnly) return t.dirOnly;
    const dx = p.x - a.x, dy = p.y - a.y;
    if (!dx && !dy) return a.dir;
    if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'right' : 'left';
    if (Math.abs(dx) === Math.abs(dy) && dy < 0) return dx > 0 ? 'right' : 'left'; // a diagonal above: turn sideways (the face stays seen)
    return dy > 0 ? 'down' : 'up';
  }
  // eyes-only: where on the screen the target lies for a person drawn facing `dir`
  function gazeTo(a, t, dir) {
    const p = posOf(t);
    if (!p) return null;
    const dx = p.x - a.x, dy = p.y - a.y;
    if (dir === 'down' || dir === 'up') {
      if (Math.abs(dx) < 0.5) return dir === 'down' && dy < 0 ? 'u' : null;
      return dx < 0 ? 'l' : 'r';
    }
    const ahead = dir === 'right' ? dx : -dx;
    if (ahead < -0.5) return 'b';
    if (dy < -0.5 && Math.abs(dy) >= Math.abs(dx) * 0.6) return 'u';
    if (dy > 0.5 && Math.abs(dy) >= Math.abs(dx) * 0.6) return 'd';
    return null;
  }

  // ---- runs (a gesture or a habit playing) ------------------------------------------------------------
  function mkRun(a, g, o) {
    const keys = RB.gestures.keys(g);
    const peakI = g.entry.length;
    let t0 = T() + (o.delay || 0);
    const run = { ev: o.ev || ++st.evN, id: g.id, g, keys, peakI, t0, owner: o.owner, token: o.token || 0, hold: !!o.hold, holding: false, done: false, target: o.target || null, target2: o.target2 || null, prop: o.prop || null, hand: o.hand || null, dir: null, transfer: o.transfer || null, transferred: false, tag: o.tag || null };
    // a work loop (glassblowing, sweeping …): held in a scene it keeps cycling; idle it plays a few turns
    if (g.loop) {
      const cyc = [g.peak].concat(g.recover);
      if (o.hold) { run.loop = { at: g.entry.reduce((v, k) => v + k[1], 0), keys: cyc, len: cyc.reduce((v, k) => v + k[1], 0) }; run.hold = false; }
      else { run.keys = g.entry.slice(); for (let i = 0; i < (g.cycles || 2); i++) run.keys = run.keys.concat(cyc); }
    }
    run.total = run.keys.reduce((v, k) => v + k[1], 0);
    run.toPeak = run.keys.slice(0, peakI + 1).reduce((v, k) => v + k[1], 0);
    // reduced motion: the key pose, no in-betweens (a cue holds at its peak until the line moves on)
    if (RB.game.reducedMotion()) { run.still = true; if (o.owner === 'scene') run.holding = true; }
    // a gesture that turns to its target turns at once (the facing is drawn; collision facing stays)
    if (keys.some((k) => k[2] && k[2].turn) && run.target) run.dir = dirTo(a, run.target);
    return run;
  }
  function keyAt(run, t) {
    if (run.still) {
      const k = run.keys[run.peakI];
      const still = run.g.still !== undefined ? run.g.still : k[0];
      return [still, 0, k[2]];
    }
    let e = t - run.t0;
    if (e < 0) return null;
    if (run.loop && e >= run.loop.at) {
      let r = (e - run.loop.at) % run.loop.len;
      for (const k of run.loop.keys) { if (r < k[1]) return k; r -= k[1]; }
      return run.loop.keys[0];
    }
    if (run.holding) return run.keys[run.peakI];
    for (let i = 0; i < run.keys.length; i++) {
      const k = run.keys[i];
      if (e < k[1]) return k;
      e -= k[1];
      if (i === run.peakI && run.hold) { run.holding = true; return k; }
    }
    run.done = true;
    return null;
  }
  // pick the hand that points or reaches toward a target in the front and back views
  function handFor(a, run, dir) {
    if (!run.target || !run.g.aim) return run.hand;
    const p = posOf(run.target);
    if (!p || dir === 'left' || dir === 'right') return run.hand;
    const pose = RB.sprites._pose;
    const h = pose.holds(a.look || {});
    const want = (dir === 'down') === (p.x < a.x) ? 'R' : 'L'; // the screen-left arm is the right hand from the front
    if (h[want] === 'cane') return run.hand;
    return want;
  }

  // ---- the renderer's question --------------------------------------------------------------------------
  // { dir, key, ox, oy } for a standing person whose drawing staging changes, else null
  function frameOf(a, t, still, base) {
    const s = a.stg;
    if (!s || !st.on || a.mv || a.route || !a.look || a.look.pet) return null;
    const time = T();
    let pose = null, gaze = s.gaze, prop = s.held ? s.held.kind : null, dir = s.look ? s.look.dir : null, ox = 0, oy = 0, hand = null, transient = false;
    const run = s.run;
    let x = null;
    if (run && !run.done) {
      const k = keyAt(run, time);
      if (run.done) { finish(a, run); }
      else if (k) {
        pose = k[0]; x = k[2]; hand = run.hand; transient = !run.holding && !run.still;
        if (run.dir) dir = run.dir;
        if (x) {
          if (x.gaze === 'target' && run.target) gaze = gazeTo(a, run.target, dir || a.dir);
          else if (x.gaze === 'away') gaze = awayGaze(a, run, dir || a.dir);
          else if (x.gaze) gaze = x.gaze;
          if (x.look && (run.target || run.target2)) { const tg = x.look === 'b' ? run.target2 || run.target : run.target; dir = dirTo(a, tg); gaze = gazeTo(a, tg, dir); }
          if (typeof x.prop === 'string') prop = x.prop; // a key with its own state of the object (a gather turning)
          else if (x.prop && run.prop) prop = run.prop;
          if (x.dx) { const d = DIRS[dir || a.dir]; ox = d[0] * x.dx; oy = d[1] * x.dx * 0.5; }
          if (x.dy) oy += x.dy;
        }
        if (run.transfer && !run.transferred && time - run.t0 >= run.toPeak) doTransfer(a, run);
        hand = handFor(a, run, dir || a.dir) || hand;
      }
    }
    // a person seated or kneeling (a held pose or their resting stance) gestures from there
    const base0 = (s.pose || s.rest || '').split('.')[0];
    const seat = base0 && RB.sprites._pose.POSES[base0] && RB.sprites._pose.POSES[base0].legs ? base0 : null;
    // a pointing arm follows its target: up or down in the front and back views
    if (pose === 'point' && run && run.target) {
      const tp = posOf(run.target), dv = dir || a.dir;
      if (tp && (dv === 'down' || dv === 'up') && Math.abs(tp.y - a.y) > 2 * Math.abs(tp.x - a.x)) pose = (tp.y < a.y) === (dv === 'down') ? 'pointup' : 'pointdown';
    }
    if (!pose) {
      pose = s.pose || (s.prof && s.prof.restScene === false && RB.game.mode() !== 'world' ? null : s.rest);
      if (pose && pose === s.rest && pose.indexOf('.') > 0) { hand = pose.slice(-1); pose = pose.slice(0, -2); }
      if (pose && pose === (s.rest || '').split('.')[0] && !prop && s.prof && s.prof.restProp) prop = s.prof.restProp;
    }
    if (s.look && s.look.target && !gaze && !run) gaze = gazeTo(a, s.look.target, dir || a.dir);
    // a held object needs a hand to hold it: a stance that hides the hands (behind the back, folded, in
    // the sleeves) gives way to holding it
    if (prop && (!pose || /^(behind|folded|sleeves|hips)$/.test(pose)) && !(run && !run.done)) { pose = 'hold'; hand = hand || (s.held && s.held.hand) || null; }
    if (!pose && !gaze && !prop && !dir && !ox && !oy) return null;
    if (a.look.custom) return dir || ox || oy ? { dir: dir || a.dir, key: null, ox, oy } : null;
    const fr = typeof base === 'string' ? base : '';
    const breath = still ? 0 : fr[0] === 'i' && (fr[1] === '1' || fr[1] === '2') ? 1 : 0;
    const blink = !transient && (fr.endsWith('b') || base === 3);
    const P = RB.sprites._pose;
    const key = P.key(pose || 'stiff', { seat: seat && !(P.POSES[pose] && P.POSES[pose].legs) ? seat : null, hand, prop, gaze, breath: transient ? 0 : breath, blink });
    return { dir: dir || a.dir, key, ox: Math.round(ox), oy: Math.round(oy) };
  }
  function awayGaze(a, run, dir) {
    if (dir === 'left' || dir === 'right') return 'd';
    const p = run.target ? posOf(run.target) : null;
    if (p) return p.x < a.x ? 'r' : 'l';
    return (S(a).n.away || 0) % 2 ? 'l' : 'r';
  }
  function doTransfer(a, run) {
    run.transferred = true;
    const to = run.transfer;
    if (!to) return;
    const kind = (a.stg.held && a.stg.held.kind) || run.prop;
    if (!kind) return;
    a.stg.held = null; run.prop = null;
    S(to).held = { kind };
    if (to.stg.run && to.stg.run.id === 'receive') to.stg.run.prop = kind;
  }
  function finish(a, run) {
    const s = S(a);
    if (s.run === run) s.run = null;
    run.done = true;
    if (run.finished) return;
    run.finished = true;
    if (run.chain && run.owner === 'scene' && st.scene && st.scene.token === run.token) { chainNext(a, run, false); return; }
    if (run.owner === 'idle') {
      const prof = profileOf(a);
      const [lo, hi] = prof.every || [12, 24];
      s.next = T() + (lo + (hi - lo) * rand(a, 'next')) * 1000;
    }
  }

  // ---- scenes ------------------------------------------------------------------------------------------
  function begin(id) {
    if (st.scene) { st.scene.depth++; return st.scene.token; }
    st.scene = { token: ++st.token, id, depth: 1, owned: new Set(), beats: [], ambience: null, moved: new Map(), reserved: new Map() };
    yieldIdle('scene');
    return st.scene.token;
  }
  function own(a) {
    const sc = st.scene;
    if (!sc || !a) return;
    const s = S(a);
    if (s.run && s.run.owner === 'idle') s.run = null;
    s.owner = sc.token;
    sc.owned.add(a);
  }
  function owned(a) { return !!(a && a.stg && a.stg.owner && st.scene && a.stg.owner === st.scene.token); }
  function end(token) {
    const sc = st.scene;
    if (!sc || sc.token !== token) return;
    if (--sc.depth > 0) return;
    st.scene = null;
    releaseScene(sc);
  }
  function releaseScene(sc) {
    const w = W();
    for (const a of sc.owned) {
      const s = S(a);
      s.run = null; s.pose = null; s.look = null; s.gaze = null; s.held = null; s.owner = 0;
      s.next = T() + 4000; // a moment before the old habits come back
      st.stats.released++;
    }
    // people moved for the scene go back where they belong (unless the scene left them where it put them)
    // you were moved for the scene: your companion comes back to your side (no jump on your next step)
    if (sc.moved.has(w.player) && w.comp && !sc.moved.has(w.comp)) sc.moved.set(w.comp, { from: [w.comp.x, w.comp.y, w.comp.dir], stay: false });
    for (const [a, m] of sc.moved) {
      if (m.stay) continue;
      if (a === w.player) continue;
      if (a === w.comp) { rejoin(a); continue; }
      if (!w.npcs.includes(a) || !a.home) continue;
      if (a.x === a.home[0] && a.y === a.home[1]) { if (a.def && a.def.dir) a.dir = a.def.dir; continue; }
      const path = bfs(a, a.home[0], a.home[1], { goal: true });
      if (path && path.length) { a.route = path; a.routeT = 0; }
    }
    sc.ambience = null;
  }
  // the scene's own walk moved you (!move pc; 50_world.js scriptMove): as after a staged walk of yours, the scene's
  // end brings your companion back to your side if they are not there (one the scene was directing stayed behind)
  function playerMoved() {
    const sc = st.scene, p = W().player;
    if (!st.on || !sc || !p || sc.moved.has(p)) return;
    sc.moved.set(p, { from: [p.x, p.y, p.dir], stay: false });
  }
  // the companion walks back to your side after a scene moved them
  function rejoin(c) {
    const w = W(), p = w.player;
    if (Math.abs(c.x - p.x) + Math.abs(c.y - p.y) <= 1) return;
    const back = DIRS[{ up: 'down', down: 'up', left: 'right', right: 'left' }[p.dir]];
    const goal = [p.x + back[0], p.y + back[1]];
    // (behind you, if that place is free and can be reached; else any free place beside you)
    const path = (free(goal[0], goal[1], c) && bfs(c, goal[0], goal[1])) || bfs(c, p.x, p.y, { adjacent: true });
    if (path && path.length) walkPath(c, path, null, 4000);
  }
  // an early advance (the reader moved on): every cue of this scene settles at its hold or its end
  function settle(why) {
    const sc = st.scene;
    if (!sc) return;
    for (const a of sc.owned) {
      const s = S(a), run = s.run;
      if (!run || run.owner !== 'scene') continue;
      if (run.transfer && !run.transferred) doTransfer(a, run);
      if (run.chain) { run.finished = true; s.run = null; run.done = true; chainNext(a, run, true); }
      else if (run.loop) { /* work goes on through the next line */ }
      else if (run.hold) { run.holding = true; run.t0 = Math.min(run.t0, T()); }
      else { s.run = null; run.done = true; }
      st.stats.settled++;
    }
    void why;
  }
  // the next gesture of a chain (settled: jump to the chain's last gesture, at its hold or done)
  function chainNext(a, run, settled) {
    const list = run.chain.list.slice();
    let id = list.shift();
    if (settled) { id = list.length ? list[list.length - 1] : id; list.length = 0; }
    const o = Object.assign({}, run.chain.o, { then: list.length ? list : null, wait: false });
    const r = cue(a, id, Object.assign(o, { target: run.target || o.target }));
    if (r && settled && r.chain == null) { if (r.hold) r.holding = true; else { S(a).run = null; r.done = true; } }
    return r;
  }
  function cue(ref, gid, o, ctx) {
    o = o || {};
    if (!st.on) return null;
    const a = actor(ref, ctx);
    if (!a || !RB.gestures) return null;
    own(a);
    if (gid === '-') { S(a).run = null; return null; } // let go of a held gesture
    const want = RB.gestures.get(gid) ? gid : null;
    const id = want && RB.gestures.fit(want, a.look, { prop: o.prop || (a.stg && a.stg.held && a.stg.held.kind) });
    if (!id) return null;
    const g = RB.gestures.get(id);
    const tg = target(o.target, a, ctx);
    const run = mkRun(a, g, { owner: 'scene', token: st.scene ? st.scene.token : 0, hold: !!o.hold && !!g.hold, target: tg, target2: target(o.target2, a, ctx),
      prop: o.prop || (S(a).held && S(a).held.kind) || g.prop || null, hand: o.hand || null,
      // a handover moves the held thing from this hand to the receiver's at the peak (drawing only)
      transfer: g.id === 'handover' && tg && tg.look ? tg : null });
    // gestures chained on the same line (then=): the hold belongs to the last one
    if (o.then && o.then.length) { run.chain = { list: o.then.slice(), o: Object.assign({}, o, { then: null }) }; run.hold = false; }
    S(a).run = run;
    // a turn stays for the rest of the scene (the person keeps facing who or what they turned to)
    if (run.dir && st.scene) S(a).look = { dir: run.dir, target: tg };
    st.stats.cues++;
    if (o.wait) return waitPeak(run, 1200);
    return run;
  }
  function waitPeak(run, max) {
    if (run.still || RB.game.fastForward()) return Promise.resolve(run);
    const t0 = now();
    return new Promise((res) => {
      const tick = () => (run.done || run.holding || T() - run.t0 >= run.toPeak || now() - t0 > max ? res(run) : setTimeout(tick, 30));
      tick();
    });
  }
  function look(ref, tgt, ctx) {
    if (!st.on) return;
    const a = actor(ref, ctx);
    if (!a) return;
    own(a);
    const s = S(a);
    if (tgt == null || tgt === '-') { s.look = null; s.gaze = null; return; }
    const t = target(tgt, a, ctx);
    if (!t) return;
    s.look = { dir: dirTo(a, t), target: t };
  }
  function pose(ref, name, ctx) {
    if (!st.on) return;
    const a = actor(ref, ctx);
    if (!a) return;
    own(a);
    const s = S(a);
    s.pose = name && name !== '-' && RB.sprites._pose.has(name) ? name : null;
    if (s.run && s.run.owner === 'scene' && !s.run.hold) s.run = null;
  }
  function prop(ref, kind, o, ctx) {
    if (!st.on) return;
    const a = actor(ref, ctx);
    if (!a) return;
    own(a);
    S(a).held = kind && kind !== '-' && RB.sprites._pose.hasProp(kind) ? { kind, hand: (o && o.hand) || null } : null;
  }
  function beat(id) {
    const sc = st.scene;
    st.stats.beats.push((sc ? sc.id : '?') + ':' + id);
    if (st.stats.beats.length > 200) st.stats.beats.shift();
    if (RB.bus) RB.bus.emit('stage:beat', { scene: sc ? sc.id : null, id });
  }
  // presentation-only ambience for a scene (the map's own ambience is untouched and returns at its end)
  const AMBIENCE = {
    night: { ambient: { dark: 0.55, darkCol: '12,16,44', playerLight: 52 }, night: true },
    night_in: { ambient: { dark: 0.42, darkCol: '18,16,40', playerLight: 58, tint: 'rgba(40,30,80,0.10)' }, night: true },
    dusk: { ambient: { dark: 0.25, darkCol: '40,24,40', tint: 'rgba(120,60,40,0.10)', playerLight: 48 }, night: false },
  };
  function ambience(preset) {
    const sc = st.scene;
    if (!sc) return;
    sc.ambience = preset && preset !== '-' ? AMBIENCE[preset] || null : null;
  }
  function ambienceNow() { return st.on && st.scene && st.scene.ambience ? st.scene.ambience : null; }

  // ---- walking to a place ---------------------------------------------------------------------------------
  const occupied = (x, y, self) => {
    const w = W();
    if (w.player !== self && w.player.x === x && w.player.y === y) return true;
    if (w.comp && w.comp !== self && w.comp.x === x && w.comp.y === y) return true;
    for (const n of w.npcs.concat(w.extras || [])) if (n !== self && ((n.x === x && n.y === y) || (n.mv && n.mv.tx === x && n.mv.ty === y))) return true;
    return false;
  };
  function free(x, y, self) {
    const w = W(), m = w.map;
    if (x < 0 || y < 0 || x >= m.w || y >= m.h) return false;
    if (RB.maps.blockedStatic(m, x, y)) return false;
    if (RB.maps.exitAt(m, x, y)) return false;
    if (m.triggers.some((t) => x >= t.x && x < t.x + t.w && y >= t.y && y < t.y + t.h)) return false;
    if (occupied(x, y, self)) return false;
    const sc = st.scene;
    if (sc) for (const [o, k] of sc.reserved) if (o !== self && k === x + ',' + y) return false;
    return true;
  }
  // a path of free tiles (no furniture, nobody standing there, no exit or trigger), or null
  function bfs(a, tx, ty, o) {
    o = o || {};
    const w = W(), m = w.map;
    const start = a.x + ',' + a.y, prev = new Map([[start, null]]), q = [[a.x, a.y]];
    let found = null;
    const goal = (x, y) => (o.adjacent ? Math.abs(x - tx) + Math.abs(y - ty) === 1 : x === tx && y === ty);
    if (goal(a.x, a.y)) return [];
    while (q.length) {
      const [x, y] = q.shift();
      if (goal(x, y)) { found = [x, y]; break; }
      for (const d in DIRS) {
        const nx = x + DIRS[d][0], ny = y + DIRS[d][1], k = nx + ',' + ny;
        if (prev.has(k)) continue;
        if (!free(nx, ny, a) && !(o.goal && nx === tx && ny === ty && !RB.maps.blockedStatic(m, nx, ny) && !occupied(nx, ny, a))) continue;
        prev.set(k, [x, y]);
        q.push([nx, ny]);
      }
      if (prev.size > 3000) break;
    }
    if (!found) return null;
    const path = [];
    let cur = found;
    while (cur && !(cur[0] === a.x && cur[1] === a.y)) { path.unshift(cur); cur = prev.get(cur[0] + ',' + cur[1]); }
    return path;
  }
  // Your way blocked only by your companion, who followed you in (behind a counter, the one tile round someone):
  // in free walking they make way (50_world.js: they take your old tile), so here too — unless the scene has put
  // them somewhere of their own. They go on ahead along your way and step off it at the first free tile beside it;
  // returns that walk for them, or null (docs/expressive/CONTRACT.md HX68: approached from another side).
  function makeWay(a, tx, ty) {
    const w = W(), c = w.comp, sc = st.scene;
    if (a !== w.player || !c || c.mv || c.route || (sc && sc.reserved.has(c))) return null;
    const m = w.map, prev = new Map([[a.x + ',' + a.y, null]]), q = [[a.x, a.y]];
    let found = null;
    while (q.length && !found) {
      const [x, y] = q.shift();
      for (const d in DIRS) {
        const nx = x + DIRS[d][0], ny = y + DIRS[d][1], k = nx + ',' + ny;
        if (prev.has(k)) continue;
        if (!free(nx, ny, a) && !(nx === c.x && ny === c.y && !RB.maps.blockedStatic(m, nx, ny))) continue;
        prev.set(k, [x, y]); q.push([nx, ny]);
        if (nx === tx && ny === ty) { found = [nx, ny]; break; }
      }
      if (prev.size > 3000) break;
    }
    if (!found) return null;
    const path = [];
    for (let cur = found; cur && !(cur[0] === a.x && cur[1] === a.y); cur = prev.get(cur[0] + ',' + cur[1])) path.unshift(cur);
    const i = path.findIndex((t) => t[0] === c.x && t[1] === c.y);
    if (i < 0) return null;
    const on = new Set(path.map((t) => t.join(',')).concat([a.x + ',' + a.y]));
    for (let j = i; j < path.length; j++) {
      for (const d in DIRS) {
        const nx = path[j][0] + DIRS[d][0], ny = path[j][1] + DIRS[d][1];
        if (!on.has(nx + ',' + ny) && free(nx, ny, c)) return path.slice(i + 1, j + 1).concat([[nx, ny]]);
      }
    }
    return null;
  }
  function walkPath(a, path, token, max) {
    const id = idOf(a), t0 = now();
    const step = (i) => {
      if (i >= path.length) return Promise.resolve(true);
      if (token && (!st.scene || st.scene.token !== token)) return Promise.resolve(false); // another scene began
      if (now() - t0 > max) return Promise.resolve(false); // bounded: stop where they are
      const [nx, ny] = path[i];
      const dx = nx - a.x, dy = ny - a.y;
      if (Math.abs(dx) + Math.abs(dy) !== 1) return Promise.resolve(false);
      if (occupied(nx, ny, a)) return Promise.resolve(false); // someone stepped in: an authored stance where they are
      const dir = dx > 0 ? 'right' : dx < 0 ? 'left' : dy > 0 ? 'down' : 'up';
      return RB.world.scriptMove(id, dir, 1, a === W().player ? 200 : 240).then(() => step(i + 1));
    };
    return step(0);
  }
  async function walkTo(ref, x, y, dir, o, ctx) {
    o = o || {};
    if (!st.on) return false;
    const a = actor(ref, ctx);
    if (!a) return false;
    own(a);
    const sc = st.scene;
    if (sc && !sc.moved.has(a)) sc.moved.set(a, { from: [a.x, a.y, a.dir], stay: !!o.stay });
    else if (sc && o.stay) sc.moved.get(a).stay = true;
    S(a).look = null;
    if (a.route) { const e = a.route[a.route.length - 1] || [a.x, a.y]; a.x = e[0]; a.y = e[1]; a.fx = a.x; a.fy = a.y; a.route = null; a.alpha = 1; a.fadeIn = false; }
    if (sc) sc.reserved.set(a, x + ',' + y);
    st.stats.walks++;
    let ok = false;
    if (a.x === x && a.y === y) ok = true;
    else if (o.now || RB.game.fastForward()) {
      // in the dark of a fade (or skipping a seen scene): set them there, if the place is free
      if (free(x, y, a)) { a.x = x; a.y = y; a.fx = x; a.fy = y; a.mv = null; if (a === W().player) syncPlayer(); ok = true; }
    } else {
      let path = bfs(a, x, y);
      if (!path) {
        // (only your following companion in the way: they make way first)
        const way = makeWay(a, x, y);
        if (way) { own(W().comp); if (await walkPath(W().comp, way, sc ? sc.token : 0, 3000)) path = bfs(a, x, y); }
      }
      if (path) ok = await walkPath(a, path, sc ? sc.token : 0, o.max || 4000);
    }
    if (!ok) st.stats.walkFallbacks++;
    if (sc && sc.reserved.get(a) === x + ',' + y && !ok) sc.reserved.delete(a);
    if (dir && DIRS[dir] && (!sc || st.scene === sc)) a.dir = dir;
    if (a === W().player) syncPlayer();
    return ok;
  }
  function syncPlayer() { const s = RB.game.s, p = W().player; if (s) { s.x = p.x; s.y = p.y; s.dir = p.dir; } }

  // ---- idle life ----------------------------------------------------------------------------------------------
  function onScreen(a) {
    const v = RB.render.viewSize(), c = RB.render.cam;
    const x = a.fx * 16 - c.x, y = a.fy * 16 - c.y;
    return x > -24 && y > -24 && x < v.w + 8 && y < v.h + 40;
  }
  function yieldIdle(why) {
    const w = W();
    if (!w.map) return;
    let n = 0;
    for (const a of w.npcs.concat(w.extras || [], w.comp ? [w.comp] : [], [w.player])) {
      const s = a && a.stg;
      if (s && s.run && s.run.owner === 'idle') {
        // a tool in hand stays in hand (the brush, the pipe, the teapot) and the task is taken up again
        // once the world is back: the conversation interrupted it, it did not end it
        const r = s.run, k = r.still ? null : keyAt(r, T());
        const kind = k && k[2] ? (typeof k[2].prop === 'string' ? k[2].prop : k[2].prop ? r.prop : null) : null;
        if (kind && RB.sprites._pose.hasProp(kind) && !s.held) { s.held = { kind, auto: true }; s.resume = r.id; }
        if (r.tag === 'idle' && r.g.loop) s.resume = r.id;
        if (s.resume) s.next = T() + 1800 + rand(a, 'resume') * 1200;
        s.run = null; n++;
      }
      if (s && s.social) s.social = null;
    }
    if (st.shared) st.shared = null;
    if (n) st.stats.yields++;
    void why;
  }
  function eligible(a, prof, h) {
    const id = h[0], opts = h[2] || {};
    const g = RB.gestures.get(id);
    if (!g) return false;
    if (!RB.gestures.can(id, a.look, { prop: opts.prop || g.prop })) return false;
    const at = opts.at || g.at;
    if (at && !S(a).stations.has(at)) return false;
    if (g.needs === 'lamp' && !((a.look.acc || []).includes('lamp'))) return false;
    return true;
  }
  function pickHabit(a, prof, list) {
    let pool = (list || []).filter((h) => eligible(a, prof, h) && !(prof.moodAvoid && prof.moodAvoid.includes(h[0])));
    // the weather a person stands in (snow: hands rubbed against the cold)
    const amb = (W().map.def.ambient || {}).weather;
    if (amb === 'snow' && RB.gestures.can('rubhands', a.look)) pool = pool.concat([['rubhands', 1]]);
    if (!pool.length) return null;
    const tot = pool.reduce((v, h) => v + (h[1] || 1), 0);
    let r = rand(a, 'habit') * tot;
    for (const h of pool) { r -= h[1] || 1; if (r < 0) return h; }
    return pool[pool.length - 1];
  }
  // where a habit looks: along the road, at a neighbour, at the player
  function habitTarget(a, id) {
    const w = W();
    if (id === 'glance' || id === 'peek') {
      let best = null, bd = 1e9;
      for (const n of w.npcs) { if (n === a || !onScreen(n)) continue; const d = Math.abs(n.x - a.x) + Math.abs(n.y - a.y); if (d <= 4 && d < bd) { bd = d; best = n; } }
      const pd = Math.abs(w.player.x - a.x) + Math.abs(w.player.y - a.y);
      if (id === 'peek' || (pd <= 4 && (!best || rand(a, 'tg') < 0.5))) return w.player;
      if (best) return best;
    }
    if (id === 'lookroad' || id === 'glance' || id === 'stiff' || id === 'shadeeyes') {
      const side = { down: ['left', 'right'], up: ['left', 'right'], left: ['up', 'down'], right: ['up', 'down'] }[a.dir] || ['left', 'right'];
      const d = rand(a, 'tg') < 0.5 ? side[0] : side[1];
      return { x: a.x + DIRS[d][0] * 6, y: a.y + DIRS[d][1] * 6 + (d === 'up' ? 0 : 0) };
    }
    return null;
  }
  function startIdle(a, h, why) {
    const g = RB.gestures.get(h[0]);
    const opts = h[2] || {};
    if (a.stg && a.stg.held && a.stg.held.auto) a.stg.held = null; // the task's own object takes over
    const tg = habitTarget(a, g.id);
    const run = mkRun(a, g, { owner: 'idle', target: tg, prop: opts.prop || g.prop || null, tag: why });
    if (run.still) return null;
    S(a).run = run;
    const s = S(a);
    s.hist.push(g.id); if (s.hist.length > 16) s.hist.shift();
    st.trace.push({ who: keyOf(a), h: g.id, why, t: Math.round(T()) });
    if (st.trace.length > 600) st.trace.shift();
    st.stats.habits++;
    st.gate = T();
    return run;
  }
  const near = (a, b, r) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y)) <= r;
  function tick(dt) {
    if (!st.on) return;
    const t0 = now();
    const w = W();
    if (!w.map) return;
    const time = T();
    if (st.lastMap !== w.map.id) { st.lastMap = w.map.id; st.lastLeavers = new Set(w.leavers || []); st.pairs.clear(); st.gate = time; st.socialNext = time + 4000; }
    const mode = RB.game.mode(), world = mode === 'world';
    const still = RB.game.reducedMotion();
    // scene-owned runs that ended clear themselves; idle yields to everything that is not the open world
    // everyone's resting stance shows whatever is going on (it is who they are), held with reduced motion
    for (const a of w.npcs) if (!a.foe && (!a.stg || a.stg.map !== w.map.id)) profileOf(a);
    if (w.comp && (!w.comp.stg || w.comp.stg.map !== w.map.id)) profileOf(w.comp);
    if (!world || still || RB.game.inBattle()) {
      yieldIdle(mode);
      record(t0);
      return;
    }
    const people = [];
    for (const a of w.npcs) {
      if (a.foe || a.alpha === 0 || (a.look && a.look.pet) || !onScreen(a)) continue;
      profileOf(a);
      if (RB.worldActs && RB.worldActs.working && RB.worldActs.working(a)) continue; // the world proof's action is their habit (dev only)
      if (RB.perform && RB.perform.working(a)) continue; // a complete action from the performance library is their habit
      people.push(a);
    }
    // the cap counts events, not people: a word between two neighbours, or two people glancing at
    // someone arriving, is one thing happening on screen
    const evs = new Set();
    for (const a of people) {
      const s = a.stg;
      if (s.run && (s.run.done || (s.run.owner === 'idle' && T() - s.run.t0 > s.run.total + 50))) finish(a, s.run);
      if (s.run && s.run.owner === 'idle' && (a.mv || a.route || owned(a))) s.run = null;
      if (s.run && s.run.owner === 'idle') evs.add(s.run.ev);
      if (s.next == null) s.next = time + (1500 + rand(a, 'first') * (((s.prof.every || [12, 24])[0]) * 1000));
    }
    // off screen nothing runs (a person who walked out of view drops what they were doing)
    for (const a of w.npcs) if (a.stg && a.stg.run && a.stg.run.owner === 'idle' && !people.includes(a)) a.stg.run = null;
    let active = evs.size;
    const cap = Math.max(1, Math.min(4, Math.ceil(people.length / 4)));
    st.stats.cap = cap; st.cap = cap; st.busy = active;
    // at most one new habit per tick, none sooner than 650 ms after the last, and never two neighbours in step
    if (active < cap && time - st.gate > 650) {
      for (const a of people) {
        const s = a.stg;
        if (s.run || a.mv || a.route || owned(a) || time < s.next) continue;
        if (a.def && a.def.wander && s.wanderHold && time < s.wanderHold) continue;
        const crowd = people.some((b) => b !== a && b.stg.run && b.stg.run.owner === 'idle' && near(a, b, 3) && time - b.stg.run.t0 < 2500);
        if (crowd) { s.next = time + 1200 + rand(a, 'defer') * 1200; continue; }
        // back to the task a conversation interrupted, else a habit of their own
        const back = s.resume && (s.prof.idle || []).find((x) => x[0] === s.resume && eligible(a, s.prof, x));
        s.resume = null;
        const h = back || pickHabit(a, s.prof, s.prof.idle);
        if (!h) { s.next = time + 8000; continue; }
        if (startIdle(a, h, 'idle')) { active++; break; }
      }
    }
    st.busy = active;
    st.stats.maxActive = Math.max(st.stats.maxActive, active);
    if (st.busy < st.cap || st.forceSocial) social(people, time);
    if (st.busy < st.cap) reactions(people, time);
    companion(time);
    record(t0);
  }
  function record(t0) {
    const ms = now() - t0;
    st.stats.tickN++; st.stats.tickMs += ms; if (ms > st.stats.tickMax) st.stats.tickMax = ms;
  }
  // two people standing near each other turn to each other now and then: one says something with a
  // small gesture, the other nods a beat later, and both go back to what they were doing
  function social(people, time) {
    if (time < st.socialNext) return;
    st.socialNext = time + 1500;
    const idle = people.filter((a) => !a.stg.run && !a.mv && !a.route && !owned(a) && !(a.look && a.look.custom) && (a.stg.prof.social || 0) > 0);
    for (let i = 0; i < idle.length; i++) for (let j = i + 1; j < idle.length; j++) {
      const A = idle[i], B = idle[j];
      if (!near(A, B, 2) || (A.x === B.x && A.y === B.y)) continue;
      const k = [A.id, B.id].sort().join('+');
      const nx = st.pairs.get(k);
      if (nx == null && !st.forceSocial) { st.pairs.set(k, time + 6000 + h32(k + '|first') * 12000); continue; }
      if (nx != null && time < nx) continue;
      const p = Math.min(A.stg.prof.social, B.stg.prof.social);
      const r = h32(k + '|' + Math.floor(nx || 0));
      st.pairs.set(k, time + 30000 + r * 30000);
      if (r > p && !st.forceSocial) continue;
      st.forceSocial = false;
      const [sp, li] = (A.stg.prof.social >= B.stg.prof.social) ? [A, B] : [B, A];
      const allowed = sp.stg.prof.moodTalk || ['palm', 'point', 'size', 'nod', 'laugh', 'shrug', 'count', 'chin'];
      const talk = (sp.stg.prof.talk || [9]).map((n) => RB.gestures.PRIM[n]).filter((g) => g && RB.gestures.can(g.id, sp.look) && allowed.includes(g.id));
      const g = talk.length ? talk[Math.floor(h32(k + '|g') * talk.length)] : RB.gestures.get('nod');
      const ev = ++st.evN;
      st.busy++;
      const r1 = mkRun(sp, g, { owner: 'idle', ev, target: g.id === 'point' ? { x: sp.x + (li.x >= sp.x ? -3 : 3), y: sp.y - 2 } : li, tag: 'social' });
      r1.dir = dirTo(sp, li);
      r1.keys = [[null, 450, null]].concat(r1.keys, [[null, 900, null]]); r1.peakI += 1; r1.total += 1350; r1.toPeak += 450;
      const r2 = mkRun(li, RB.gestures.get('nod'), { owner: 'idle', ev, target: sp, tag: 'social' });
      r2.dir = dirTo(li, sp);
      r2.keys = [[null, 450 + r1.toPeak - 450, { gaze: 'target' }]].concat(r2.keys, [[null, 700, { gaze: 'target' }]]); r2.peakI += 1; r2.total = r2.keys.reduce((v, x) => v + x[1], 0);
      sp.stg.run = r1; li.stg.run = r2;
      st.stats.social++;
      st.trace.push({ who: keyOf(sp) + '+' + keyOf(li), h: 'social:' + g.id, why: 'social', t: Math.round(time) });
      return;
    }
  }
  // what people witness: someone arriving, someone leaving, something examined
  function reactions(people, time) {
    const w = W();
    const glanceAt = (who, tgt, max, why) => {
      if (st.busy >= st.cap) return;
      const cand = people.filter((a) => a !== tgt && !a.stg.run && !a.mv && !owned(a) && near(a, tgt, 6) && !(a.look && a.look.custom))
        .sort((a, b) => (Math.abs(a.x - tgt.x) + Math.abs(a.y - tgt.y)) - (Math.abs(b.x - tgt.x) + Math.abs(b.y - tgt.y)) || (a.id < b.id ? -1 : 1));
      const ev = ++st.evN;
      if (cand.length) st.busy++;
      cand.slice(0, max).forEach((a, i) => {
        const run = mkRun(a, RB.gestures.get('glance'), { owner: 'idle', ev, target: tgt, delay: 200 + i * 380 + rand(a, 'react') * 300, tag: why });
        if (Math.abs(tgt.x - a.x) + Math.abs(tgt.y - a.y) >= 2) run.dir = dirTo(a, tgt);
        a.stg.run = run;
        st.stats.react++;
        st.trace.push({ who: keyOf(a), h: 'glance', why, t: Math.round(time) });
      });
    };
    if (st.arrival && time - st.arrival.t > 350) { const tg = { x: w.player.x, y: w.player.y }; st.arrival = null; glanceAt(null, tg, 2, 'arrival'); }
    for (const l of w.leavers || []) {
      if (st.lastLeavers.has(l)) continue;
      st.lastLeavers.add(l);
      glanceAt(null, l, 2, 'leaving');
    }
    if (st.lastLeavers.size > 40) st.lastLeavers = new Set(w.leavers || []);
    if (st.examine && time - st.examine.t < 4000) {
      const tg = { x: st.examine.x, y: st.examine.y };
      st.examine = null;
      const c = w.comp;
      if (c && !owned(c) && near(c, tg, 5)) { const r = mkRun(c, RB.gestures.get('glance'), { owner: 'idle', target: tg, delay: 300, tag: 'examined' }); r.dir = dirTo(c, tg); S(c).run = r; st.stats.react++; }
      glanceAt(null, tg, 1, 'examined');
    } else if (st.examine && time - st.examine.t >= 4000) st.examine = null;
  }
  // the companion when you stop, your own small idles, and now and then a shared moment
  function companion(time) {
    const w = W(), p = w.player, c = w.comp;
    const moving = !!p.mv || !!(w.path && w.path.length) || !!(RB.input && RB.input.dir && RB.input.dir());
    if (moving) {
      st.lastMove = time;
      if (p.stg && p.stg.run && p.stg.run.owner === 'idle') p.stg.run = null;
      if (c && c.stg && c.stg.run && c.stg.run.owner === 'idle') c.stg.run = null;
      st.shared = null;
      return;
    }
    const stillFor = time - st.lastMove;
    if (c && !c.mv && !owned(c) && stillFor >= 1200) {
      const prof = profileOf(c), s = c.stg;
      if (s.run && (s.run.done || T() - s.run.t0 > s.run.total + 50)) finish(c, s.run);
      if (s.next == null || s.next < time - 60000) s.next = time + 400 + rand(c, 'first') * 1200;
      if (!s.run && time >= s.next) {
        const h = pickHabit(c, prof, prof.idle);
        if (h && startIdle(c, h, 'companion')) { st.stats.compIdle++; }
        else s.next = time + 6000;
      }
    }
    // shared stillness: you stand facing something; a beat later your companion looks at it too
    if (c && !owned(c) && stillFor >= 2000 && !st.shared && time >= st.sharedNext && near(c, p, 2)) {
      const fa = RB.world.frontAction && RB.world.frontAction();
      if (fa && fa.kind !== 'companion') {
        const [fx, fy] = RB.world.frontTile();
        const tg = { x: fx, y: fy };
        st.shared = { t: time };
        st.sharedNext = time + 60000;
        const r = mkRun(c, RB.gestures.get('observe'), { owner: 'idle', target: tg, delay: 600, tag: 'shared' });
        r.dir = dirTo(c, tg); S(c).run = r;
        const rp = mkRun(p, RB.gestures.get('glance'), { owner: 'idle', target: c, delay: 1500 + r.total, tag: 'shared' });
        S(p).run = rp;
        st.stats.shared++;
        st.trace.push({ who: 'shared', h: 'observe', why: 'shared', t: Math.round(time) });
      }
    }
    if (st.shared && time - st.shared.t > 6000) st.shared = null;
    // your own small idles (only things that imply no feeling: the strap, a look at what is in front, a shift)
    if (stillFor >= 3000 && !owned(p)) {
      const s = S(p);
      if (s.map !== w.map.id || !s.prof) profileOf(p);
      if (s.run && (s.run.done || T() - s.run.t0 > s.run.total + 50)) finish(p, s.run);
      if (s.next == null || s.next < time - 60000) s.next = time + 800 + rand(p, 'first') * 2000;
      if (!s.run && time >= s.next) {
        const h = pickHabit(p, s.prof, s.prof.idle);
        if (h && startIdle(p, h, 'player')) st.stats.playerIdle++;
        else s.next = time + 8000;
      }
    }
  }
  // a wanderer's round: after a step, now and then a pause with a habit of their route
  function wanderPause(n) {
    const s = n.stg;
    if (!st.on) return false;
    if (owned(n)) return true;
    if (s && s.run && !s.run.done) return true;
    return false;
  }
  function stepped(n) {
    if (!st.on || RB.game.reducedMotion() || RB.game.mode() !== 'world') return;
    if (!onScreen(n) || st.busy >= st.cap) return; // off screen nothing runs; the cap holds
    const prof = profileOf(n);
    if (rand(n, 'pause') >= 1 / 3) return;
    const h = pickHabit(n, prof, prof.route && prof.route.length ? prof.route : prof.idle);
    if (!h) return;
    const g = RB.gestures.get(h[0]);
    const run = mkRun(n, g, { owner: 'idle', target: habitTarget(n, g.id), delay: 380, tag: 'route' });
    if (run.still) return;
    S(n).run = run;
    st.busy++;
    st.stats.route++;
    st.trace.push({ who: keyOf(n), h: g.id, why: 'route', t: Math.round(T()) });
  }
  function examined(x, y) { st.examine = { x, y, t: T() }; }
  if (RB.bus) {
    RB.bus.on('map:enter', () => { st.arrival = { t: T() }; st.lastMap = null; st.lastMove = T(); st.shared = null; });
    RB.bus.on('campaign:changing', () => { st.scene = null; st.trace = []; st.pairs.clear(); st.stats = fresh(); });
  }

  return {
    begin, end, cue, look, pose, prop, beat, walkTo, settle, ambience, ambienceNow, owned, actor, own, playerMoved,
    tick, frameOf, wanderPause, stepped, rand, examined, profileOf,
    get AMBIENCE() { return AMBIENCE; },
    enabled(v) { if (v != null) { st.on = !!v; if (!st.on) yieldIdle('off'); } return st.on; },
    seed(n) { if (n != null) { st.seed = n >>> 0; const w = W(); for (const a of (w.npcs || []).concat(w.comp ? [w.comp] : [], w.player ? [w.player] : [])) if (a && a.stg) { a.stg.n = {}; a.stg.next = null; a.stg.run = null; a.stg.hist = []; } st.trace = []; st.pairs.clear(); st.gate = -1e9; st.socialNext = 0; st.lastMap = null; st.arrival = null; st.examine = null; st.shared = null; st.sharedNext = 0; st.lastMove = 0; st.lastLeavers = new Set(); } return st.seed; },
    trace: () => st.trace.slice(),
    stats: () => Object.assign({}, st.stats, { busy: st.busy, forceSocial: !!st.forceSocial, socialIn: Math.round(st.socialNext - T()), pose: RB.sprites._pose ? RB.sprites._pose.stats() : null }),
    resetStats() { st.stats = fresh(); if (RB.sprites._pose) { /* the frame cache keeps its own counts */ } },
    state() {
      const w = W(), sc = st.scene;
      const one = (a) => { const s = a.stg || {}; const r = s.run; return { id: idOf(a), x: a.x, y: a.y, dir: a.dir, run: r ? { id: r.id, owner: r.owner, holding: r.holding, tag: r.tag, ev: r.ev, still: !!r.still } : null, pose: s.pose || null, rest: s.rest || null, look: s.look ? s.look.dir : null, held: s.held ? s.held.kind : null, owned: owned(a), cls: s.prof ? s.prof.class : null, tier: s.prof ? s.prof.tier : null, hist: (s.hist || []).slice() }; };
      return { scene: sc ? { id: sc.id, token: sc.token, owned: [...sc.owned].map(idOf), beats: sc.beats.slice(), ambience: !!sc.ambience } : null,
        actors: w.map ? w.npcs.concat(w.extras || []).map(one).concat(w.comp ? [one(w.comp)] : [], [one(w.player)]) : [] };
    },
    // tests: bring the next word between neighbours forward (the pair and the gesture stay seeded choices)
    nudge(o) { o = o || {}; if (o.social) { st.socialNext = 0; for (const k of st.pairs.keys()) st.pairs.set(k, 0); st.forceSocial = true; } },
    release() { const sc = st.scene; if (sc) { st.scene = null; releaseScene(sc); } yieldIdle('release'); },
  };
})();
