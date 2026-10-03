/* Cosmetic pets in the world: the selected animal follows the two of you
 * (addendum §3.4–3.5). Presentation only:
 * - it walks the tiles the player actually walked (the trail), one step
 *   behind your companion (or behind you, travelling alone), so a ground
 *   animal only ever uses floor you crossed — never water or walls; the bird
 *   hops the same route and flies (low) when it has to catch up;
 * - it is never solid and never an actor: nothing tests against it, it is
 *   not in the party, it never writes the collision grid, it cannot trigger
 *   an exit, a trigger, a foe or a conversation, and people walk through it
 *   (it steps aside for them);
 * - it never makes you wait: when it falls far behind, or the route breaks
 *   (a door, a scene cut, a warp), it catches up discreetly — a short fade at
 *   the tile behind your companion;
 * - when you stop it settles near you on a free tile (not a door, exit,
 *   trigger, person or the tile in front of you), sits, and after a while lies
 *   down; small idle movements are timed from its own random stream, never
 *   the game's; at rest it breathes and its tail keeps moving, on its own beat
 *   (so do the animals not yet met, between the moments their scenes author);
 * - hidden before it has joined you, when "Show pet in exploration" is off,
 *   on maps that hide the companion, and in scenes that ask (!hook pet_hide /
 *   pet_show; restored when the scene ends).
 *
 *   RB.petWorld.update(dt)                     (from RB.world.update)
 *   RB.petWorld.push(list, c, ax, ay, t)       (from the renderer's y-sorted list)
 *   RB.petWorld.state() -> { shown, x, y, … }  (tests)
 *   RB.petWorld.act(anim, ms) -> Promise       (scene staging: a short authored movement)
 *   RB.petWorld.come(who) -> Promise           (scene staging: to a free tile beside someone) */
var RB = (globalThis.RB = globalThis.RB || {});

RB.petWorld = (function () {
  'use strict';
  const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const TS = 16;
  // cosmetic randomness: its own stream (never RB.util.rng of the game, never Math.random in play)
  let seed = 0x9e3779b1;
  const rnd = () => { seed = (seed + 0x6d2b79f5) | 0; let t = seed; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const P = {
    map: null, sp: null, look: null, x: 0, y: 0, fx: 0, fy: 0, dir: 'down', mv: null, queue: [],
    leadMv: null, leadAt: null, still: 0, alpha: 0, fade: 0, t: 0, idle: null, act: null, hop: 0,
    placed: false, stats: { catchups: 0, moves: 0, asides: 0 },
  };
  const W = () => RB.world.W;
  const s = () => RB.game && RB.game.s;

  function shown() {
    const st = s(), w = W();
    if (!st || !w || !w.map || !RB.pets.visible(st, 'world')) return false;
    const d = w.map.def;
    // maps that hide your companion (a dream, a room that cannot hold you both) hide the animal too
    if (d.noPet && RB.state.test(st, d.noPet === true ? 'true' : d.noPet)) return false;
    if (d.noCompanion && RB.state.test(st, d.noCompanion === true ? 'true' : d.noCompanion)) return false;
    return true;
  }
  // ---- what counts as a free tile for it to stand on (cosmetic: nothing is blocked by it) ----------
  function occupied(x, y) {
    const w = W();
    const p = w.player;
    if (p && ((p.x === x && p.y === y) || (p.mv && p.mv.tx === x && p.mv.ty === y))) return true;
    const c = w.comp;
    if (c && ((c.x === x && c.y === y) || (c.mv && c.mv.tx === x && c.mv.ty === y))) return true;
    for (const list of [w.npcs, w.foes, w.extras || [], w.leavers || []]) for (const n of list) if ((n.x === x && n.y === y) || (n.mv && n.mv.tx === x && n.mv.ty === y)) return true;
    return false;
  }
  // a tile someone stands on and stays on, or is walking onto (a tile being walked off is free: your
  // companion walks the same trail ahead of it)
  function heldBy(x, y) {
    const w = W();
    const on = (a) => a && (a.mv ? a.mv.tx === x && a.mv.ty === y : a.x === x && a.y === y);
    if (on(w.player) || on(w.comp)) return true;
    for (const list of [w.npcs, w.foes, w.extras || [], w.leavers || []]) for (const n of list) if (on(n)) return true;
    return false;
  }
  function floor(x, y) { const m = W().map; return x >= 0 && y >= 0 && x < m.w && y < m.h && !RB.maps.blockedStatic(m, x, y); }
  // a tile just above someone standing is behind their head and shoulders on screen: it would not be seen there
  function covered(x, y) { return occupied(x, y + 1); }
  // somewhere to settle: floor, nobody there, not a way out, a door, a trigger, a foe's patrol square or the
  // tile in front of you (so it never stands on what you are about to use)
  function restable(x, y) {
    const w = W(), m = w.map;
    if (!floor(x, y) || occupied(x, y) || covered(x, y)) return false;
    if (RB.maps.exitAt(m, x, y) || RB.maps.shutDoorAt(m, x, y) || RB.maps.shutDoorAt(m, x, y - 1)) return false;
    if (m.triggers.some((t) => x >= t.x && x < t.x + t.w && y >= t.y && y < t.y + t.h)) return false;
    const [fx, fy] = RB.world.frontTile();
    if (fx === x && fy === y) return false;
    for (const pr of m.props) if ((pr.scene || pr.text) && Math.abs(pr.x - x) + Math.abs(pr.y - y) === 0) return false;
    return true;
  }
  // ---- placement --------------------------------------------------------------------------------------
  // At a map's entry (a door, a load, a warp): the free tile behind your companion (or behind you),
  // then any free tile near; it fades in there. Nothing is placed where nobody can stand.
  function place() {
    const w = W(), p = w.player;
    P.map = w.map.id; P.queue = []; P.mv = null; P.act = null; P.idle = null; P.still = 0;
    P.leadAt = p.x + ',' + p.y; P.leadMv = p.mv || null;
    const lead = w.comp || p, back = DIRS[{ up: 'down', down: 'up', left: 'right', right: 'left' }[p.dir]] || [0, 1];
    const cand = [[lead.x + back[0], lead.y + back[1]]];
    for (let r = 1; r <= 3; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (Math.abs(dx) + Math.abs(dy) === r) cand.push([lead.x + dx, lead.y + dy]);
    // just met on this map: it starts where it was (the vignette's animal becomes the one that follows)
    const hand = P.handoff && P.handoff.map === w.map.id ? P.handoff : null;
    P.handoff = null;
    const ok = ([x, y]) => floor(x, y) && !occupied(x, y) && !RB.maps.exitAt(w.map, x, y);
    const spot = hand ? [hand.x, hand.y] : cand.find((q) => ok(q) && !covered(q[0], q[1])) || cand.find(ok) || null;
    if (hand) { P.x = spot[0]; P.y = spot[1]; P.alpha = 1; P.fade = 0; P.fx = P.x; P.fy = P.y; P.dir = hand.dir || p.dir; P.placed = true; return; }
    if (spot) { P.x = spot[0]; P.y = spot[1]; P.alpha = 0; P.fade = 1; }
    else { P.x = lead.x; P.y = lead.y; P.alpha = 0; P.fade = 0; } // nowhere yet: it appears after your first step
    P.fx = P.x; P.fy = P.y; P.dir = p.dir; P.placed = true;
    if (RB.game.reducedMotion() && P.fade) { P.alpha = 1; P.fade = 0; }
  }
  // a discreet catch-up: fade out where it is, reappear behind the lead
  function catchUp(why) {
    P.stats.catchups++;
    P.lastCatchUp = why;
    place();
  }
  // ---- motion -------------------------------------------------------------------------------------------
  function startMove(tx, ty, dur, gait) {
    const dx = tx - P.x, dy = ty - P.y;
    P.dir = dx > 0 ? 'right' : dx < 0 ? 'left' : dy > 0 ? 'down' : 'up';
    P.mv = { sx: P.x, sy: P.y, tx, ty, t: 0, dur, gait };
    P.x = tx; P.y = ty; // its tile is where it is going (it never blocks, so this is only for tests and settling)
    P.stats.moves++;
    P.still = 0; P.idle = null;
  }
  function leadDur() {
    const p = W().player;
    return p.mv ? p.mv.dur : 160;
  }
  function update(dt) {
    const w = W(), st = s();
    if (!w || !w.map || !st) return;
    const sp = RB.pets.active(st);
    if (sp !== P.sp) { P.sp = sp; P.placed = false; }
    P.look = sp ? RB.pets.lookOf(st, sp) : null;
    if (!P.placed || P.map !== w.map.id) { if (w.player) place(); }
    const p = w.player;
    P.t += dt;
    // the scene-level hide ends with the scene that asked for it
    if (RB.pets.sceneHidden() && !(RB.script && RB.script.isRunning && RB.script.isRunning())) RB.pets.show();
    // the lead left a tile: it joins the trail
    if (p.mv && p.mv !== P.leadMv) {
      P.leadMv = p.mv;
      const from = [p.mv.sx, p.mv.sy];
      const last = P.queue[P.queue.length - 1];
      if (!last || last[0] !== from[0] || last[1] !== from[1]) P.queue.push(from);
      P.leadAt = p.mv.tx + ',' + p.mv.ty;
      // you walk onto its tile: it gives way at once (to where you came from, unless your companion goes there)
      if (p.mv.tx === P.x && p.mv.ty === P.y && !P.mv) {
        const c = w.comp;
        const to = c && c.mv && c.mv.tx === from[0] && c.mv.ty === from[1] ? null : from;
        if (to) { startMove(to[0], to[1], p.mv.dur, 'walk'); P.queue = P.queue.filter((q) => !(q[0] === to[0] && q[1] === to[1])); }
        else aside(true);
      }
    } else if (!p.mv) {
      const at = p.x + ',' + p.y;
      // a warp or a scene move without walking: the trail is broken, it catches up
      if (P.leadAt && at !== P.leadAt) {
        const [lx, ly] = P.leadAt.split(',').map(Number);
        if (Math.abs(lx - p.x) + Math.abs(ly - p.y) > 1) { P.leadAt = at; catchUp('warp'); }
        else P.leadAt = at;
      }
    }
    if (P.fade) { P.alpha = Math.min(1, P.alpha + dt / 320); if (P.alpha >= 1) P.fade = 0; }
    // someone is walking onto it: it steps aside (people never wait for it)
    if (!P.mv && !P.act) {
      for (const list of [w.npcs, w.foes, w.extras || [], w.leavers || []]) for (const n of list) {
        if (n.mv && n.mv.tx === P.x && n.mv.ty === P.y) { aside(true); break; }
        if (!n.mv && n.x === P.x && n.y === P.y && (n.alpha == null || n.alpha > 0.5)) { aside(true); break; }
      }
    }
    // step along the trail
    if (P.mv) {
      P.mv.t += dt;
      const k = Math.min(1, P.mv.t / P.mv.dur);
      P.fx = P.mv.sx + (P.mv.tx - P.mv.sx) * k;
      P.fy = P.mv.sy + (P.mv.ty - P.mv.sy) * k;
      if (k >= 1) { P.fx = P.x; P.fy = P.y; P.mv = null; }
    }
    if (!P.mv && !P.act) {
      const keep = w.comp ? 1 : 0;
      // drop trail tiles that are its own
      while (P.queue.length && P.queue[0][0] === P.x && P.queue[0][1] === P.y) P.queue.shift();
      // the tile it would stop on, when someone stands there or is walking onto it (you turned back over
      // the trail, or a person stopped on it): it stops short rather than end on a person (passing
      // through on the way, behind your companion, is fine)
      while (P.queue.length - keep === 1 && heldBy(P.queue[0][0], P.queue[0][1])) P.queue.shift();
      if (P.queue.length > keep) {
        const lag = P.queue.length - keep;
        const [tx, ty] = P.queue[0];
        if (lag > 9 || Math.abs(tx - P.x) + Math.abs(ty - P.y) !== 1 || !floor(tx, ty)) {
          // broken or far behind: a discreet catch-up, never a wait
          if (Math.abs(tx - P.x) + Math.abs(ty - P.y) !== 1 && lag <= 9 && routeTo(tx, ty)) { /* walking back onto the trail */ }
          else catchUp(lag > 9 ? 'far' : 'broken');
        } else {
          P.queue.shift();
          const run = lag >= 3;
          startMove(tx, ty, Math.round(leadDur() * (run ? 0.72 : 1)), run ? 'run' : 'walk');
        }
      } else {
        P.still += dt;
        settle();
      }
    }
    if (P.act && P.act.until <= P.t) { const r = P.act.done; P.act = null; if (r) r(); }
    idle(dt);
  }
  // back onto the trail from a side tile (a short route over floor, at most a few steps)
  function routeTo(tx, ty) {
    const prev = new Map([[P.x + ',' + P.y, null]]);
    let q = [[P.x, P.y]];
    for (let d = 0; d < 6 && q.length; d++) {
      const next = [];
      for (const [x, y] of q) {
        if (x === tx && y === ty) {
          const path = [];
          for (let k = x + ',' + y; k; k = prev.get(k)) path.unshift(k.split(',').map(Number));
          path.shift();
          P.queue = path.concat(P.queue.slice(1));
          return true;
        }
        for (const dir in DIRS) {
          const nx = x + DIRS[dir][0], ny = y + DIRS[dir][1], k = nx + ',' + ny;
          if (prev.has(k) || !floor(nx, ny)) continue;
          prev.set(k, x + ',' + y);
          next.push([nx, ny]);
        }
      }
      q = next;
    }
    return false;
  }
  // step off a tile someone needs (or that it should not rest on): a free neighbour, else a catch-up
  function aside(force) {
    const opts = Object.keys(DIRS).map((d) => [P.x + DIRS[d][0], P.y + DIRS[d][1]]).filter(([x, y]) => restable(x, y));
    if (!opts.length) { if (force) catchUp('crowded'); return false; }
    const [x, y] = opts[Math.floor(rnd() * opts.length)];
    // giving way to someone: it rejoins the trail where it was; settling off a tile it should not rest on
    // (yours, the one in front of you, a trigger): it stays off it
    if (force) P.queue.unshift([P.x, P.y]);
    startMove(x, y, 200, 'walk');
    P.stats.asides++;
    return true;
  }
  // when you stop: off anything it should not rest on, then turn toward you
  function settle() {
    const w = W(), p = w.player;
    if (P.still > 300 && !restable(P.x, P.y) && P.still < 5000 && !P.settleTried) { P.settleTried = true; if (aside(false)) return; }
    if (P.still < 300) P.settleTried = false;
    if (P.still > 700 && !P.faced) {
      P.faced = true;
      const dx = p.x - P.x, dy = p.y - P.y;
      if (Math.abs(dx) >= Math.abs(dy) && dx) P.dir = dx > 0 ? 'right' : 'left';
      else if (dy) P.dir = dy > 0 ? 'down' : 'up';
    }
    if (P.still < 700) P.faced = false;
  }
  // ---- idle variants (timed from its own stream) -------------------------------------------------------------
  function idle(dt) {
    if (RB.game.reducedMotion() || P.mv) { P.idle = null; return; }
    if (!P.idle || P.t >= P.idle.until) {
      const kinds = P.sp === 'bird' ? ['blink', 'tilt', 'ruffle', 'look'] : P.sp === 'dog' ? ['blink', 'ear', 'wag', 'look'] : P.sp === 'tanuki' ? ['blink', 'nose', 'shift', 'look'] : ['blink', 'ear', 'tail', 'look'];
      const k = kinds[Math.floor(rnd() * kinds.length)];
      const wait = 1800 + rnd() * 3200;
      P.idle = { kind: null, at: P.t + wait, until: P.t + wait + (k === 'blink' ? 150 : k === 'look' ? 1100 : 420), next: k, side: rnd() < 0.5 ? 1 : -1 };
    }
    if (P.idle && P.t >= P.idle.at && !P.idle.kind) P.idle.kind = P.idle.next;
    void dt;
  }
  // ---- life: a resting animal breathes and its tail keeps moving -------------------------------------------------
  // Like the people, each on its own beat: a breath with their shape (settle, a beat, rise, a beat) and, all
  // the while, the tail — the cat's slow swish (the tip a beat behind; sitting, it lifts as it sweeps), the
  // dog's gentle wag, the tanuki's sway, the bird's flick now and then. One cycle per species (ms, phases):
  // breath and tail step through it together, so a posture has only a handful of frames (the art caches by
  // pose); lying, the cycle is slower. Only at rest (never walking, flying or acting), never over a tail
  // movement a scene authored, and never with reduced motion.
  const LIFE = {
    cat: { cycle: 2800, n: 8, side: [26, 20, 14] },  // side: standing, sitting, lying (degrees)
    tanuki: { cycle: 3000, n: 6, side: [14, 12, 8] },
    dog: { cycle: 1200, n: 6, amp: [0.35, 0.35, 0.2] },
    bird: { cycle: 2200, n: 8 },
  };
  const BREATH = { 6: [0, 0, 0.5, 1, 1, 0.5], 8: [0, 0, 0, 0.5, 1, 1, 1, 0.5] };   // settle, a beat, rise, a beat
  function life(sp, po, t, off) {
    const L = LIFE[sp];
    if (!L || RB.game.reducedMotion() || po.gait || po.hopping || po.flap || (po.wing || 0) > 0.5) return po;
    const lie = (po.lie || 0) > 0.5, sit = !lie && (po.sit || 0) > 0.5, ix = lie ? 2 : sit ? 1 : 0;
    const per = L.cycle * (lie ? 1.4 : 1), q = Math.floor((((t + off) % per) / per) * L.n), a = (2 * Math.PI * q) / L.n;
    if (po.breath == null) po.breath = BREATH[L.n][q];
    if (po.tSide || po.tFlick || po.wag || po.tUp) return po;
    if (sp === 'dog') po.wag = Math.round(L.amp[ix] * Math.sin(a) * 100) / 100;
    else if (sp === 'bird') po.tUp = q === 0 ? 14 : q === 2 ? 10 : 0;
    else {
      po.tSide = Math.round(L.side[ix] * Math.sin(a));
      po.tFlick = Math.round((lie ? 6 : 12) * Math.sin(a - 0.9));
      if (sit) po.tUp = Math.round(6 + 6 * Math.sin(a));
    }
    return po;
  }
  const lifeOff = (id) => { let h = 7; for (const ch of String(id)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h % 5000; };
  // ---- an animal among the people ---------------------------------------------------------------------------
  // An npc whose look is { pet: species, look, rest: [sit ms, lie ms] } (Mochi) is drawn with the pets' rig,
  // the same animal as every other: walking when it moves, and at rest standing, then sitting, then lying
  // (found lying), breathing and moving its tail (life, above); it blinks when the world's blink says so.
  function actorFrame(a, t) {
    const L = a.look, sp = L && L.pet;
    if (!sp || !RB.petArt || !RB.petArt.LOOKS[sp]) return null;
    let po;
    if (a.mv) { po = { gait: 'walk', ph: RB.game.reducedMotion() ? 0 : (t / 380) % 1 }; a.restAt = null; a.walked = true; }
    else {
      // found already at rest (as you arrive, it is lying where it was); after a walk it settles again
      if (a.restAt == null) a.restAt = a.walked ? t : -1e9;
      const r = t - a.restAt, [sitAt, lieAt] = L.rest || [2500, 14000];
      po = r >= lieAt ? { lie: 1 } : r >= sitAt ? { sit: 1 } : {};
      if (a.blinkT != null && a.blinkT < 0) po.blink = 1;
      po = life(sp, po, t, lifeOff(a.id));
    }
    a.pose = po;
    return RB.petArt.frame(sp, L.look, { kind: 'world', dir: a.dir || 'down' }, po);
  }
  // ---- the pose for this moment ------------------------------------------------------------------------------
  function poseNow() {
    const po = {};
    const sp = P.sp;
    if (P.act && P.act.pose) return Object.assign(po, P.act.pose(P.t - P.act.t0, P.act));
    if (P.mv) {
      const k = P.mv.t / P.mv.dur;
      if (sp === 'bird') {
        if (P.mv.gait === 'run') { po.wing = 1; po.flap = (P.t / 170) % 1; }
        else { po.hopping = 1; }
        return po;
      }
      po.gait = P.mv.gait === 'run' ? 'run' : 'walk';
      po.ph = (P.t / (po.gait === 'run' ? 300 : 380)) % 1;
      void k;
      return po;
    }
    const still = RB.game.reducedMotion();
    if (P.still > 2500) {
      if (P.still > 14000 && sp !== 'bird') po.lie = 1;
      else if (P.still > 14000) { po.lie = 1; }
      else if (sp !== 'bird') po.sit = P.still < 2800 ? 0.5 : 1;
      else po.fluff = 0.5;
    }
    const I = P.idle && P.idle.kind && P.t < P.idle.until ? P.idle : null;
    if (I && !still) {
      if (I.kind === 'blink') po.blink = 1;
      if (I.kind === 'ear') po[I.side > 0 ? 'earR' : 'earL'] = 0.8;
      if (I.kind === 'tail') po.tFlick = 26 * I.side;
      if (I.kind === 'wag') po.wag = Math.sin((P.t - I.at) / 70) * 0.7;
      if (I.kind === 'nose') po.nose = 1;
      if (I.kind === 'shift') po.lean = 0.3 * I.side;
      if (I.kind === 'look') po.hy = 26 * I.side;
      if (I.kind === 'tilt') po.hr = 18 * I.side;
      if (I.kind === 'ruffle') po.fluff = 1;
    }
    return life(sp, po, P.t, 1300);
  }
  // ---- animals not yet met (the pet vignettes, src/content/pets/) ------------------------------------------------
  // def: { id, species, look, map, show(s) -> bool, place(s, t, reduce) -> { x, y (tiles, may be fractional),
  // dir, po (pose), up (px), alpha } }. Drawn like the pet (never solid; a vignette's own props make the spot
  // interactable), on its map only, while show() holds.
  const WILD = [];
  function addWild(def) { WILD.push(def); }
  function drawWild(list, c, ax, ay, t) {
    const st = s(), w = W();
    const reduce = RB.game.reducedMotion();
    for (const d of WILD) {
      if (d.map !== w.map.id) continue;
      let q;
      try { if (!d.show(st)) continue; q = d.place(st, t, reduce); } catch (e) { continue; }
      if (!q) continue;
      const po = life(d.species, Object.assign({}, q.po || {}), t, lifeOff(d.id));
      const f = RB.petArt.frame(d.species, d.look || RB.petArt.LOOK_ORDER[d.species][0], { kind: 'world', dir: q.dir || 'down' }, po);
      if (!f) continue;
      const up = q.up || 0, a = q.alpha == null ? 1 : q.alpha;
      list.push({
        z: q.y * TS + TS - 0.3, draw: () => {
          const x = ax(q.x * TS) + 16 + (q.dx || 0), y = ay(q.y * TS) + 30;
          if (a <= 0) return;
          if (a < 1) c.globalAlpha = a;
          c.fillStyle = 'rgba(0,0,0,0.22)';
          c.beginPath(); c.ellipse(x, y - 2, d.species === 'bird' ? 4 : 8, d.species === 'bird' ? 1.5 : 2.5, 0, 0, Math.PI * 2); c.fill();
          c.drawImage(f.cv, Math.round(x - f.ax), Math.round(y - f.ay - up));
          if (a < 1) c.globalAlpha = 1;
          d.drawn = (d.drawn || 0) + 1;
          d.last = { x: q.x, y: q.y, dir: q.dir, po };
        },
      });
    }
  }
  function wild(id) { return WILD.find((d) => d.id === id) || null; }
  // Where a vignette's animal comes to sit by you: a free tile beside you (seen, not under the dialogue box),
  // then the upper diagonals, then the lower ones, then below/above. `from` is where it starts: the straight
  // way there must not cross anything solid (it never walks through a barrel). `own`: its own spot tiles
  // (solid for you, not for it); `avoid`: tiles it keeps off (a prop it would stand on); `leave`: it gets up
  // and comes out (never stays where it was).
  function nearTile(from, o) {
    o = o || {};
    const w = W(), p = w.player, m = w.map;
    if (!p || !m) return o.fallback || from;
    const has = (list, x, y) => (list || []).some((q) => q[0] === x && q[1] === y);
    const open = (x, y) => has(o.own, x, y) || (!RB.maps.blockedStatic(m, x, y) && !RB.maps.exitAt(m, x, y));
    const free = (x, y) => open(x, y) && !(x === p.x && y === p.y) && !(w.comp && w.comp.x === x && w.comp.y === y) && !w.npcs.some((n) => n.x === x && n.y === y) && !has(o.avoid, x, y) && !(o.leave && x === from[0] && y === from[1]);
    const clear = (x, y) => {
      const n = Math.max(Math.abs(x - from[0]), Math.abs(y - from[1])) * 3;
      for (let i = 1; i < n; i++) { const tx = Math.round(from[0] + ((x - from[0]) * i) / n), ty = Math.round(from[1] + ((y - from[1]) * i) / n); if (!open(tx, ty) || (tx === p.x && ty === p.y)) return false; }
      return true;
    };
    const C = [[1, 0], [-1, 0], [1, -1], [-1, -1], [1, 1], [-1, 1], [0, 1], [0, -1]];
    if (from[0] < p.x) { C[0] = [-1, 0]; C[1] = [1, 0]; C[2] = [-1, -1]; C[3] = [1, -1]; C[4] = [-1, 1]; C[5] = [1, 1]; }
    for (const [dx, dy] of C) { const x = p.x + dx, y = p.y + dy; if (free(x, y) && clear(x, y)) return [x, y]; }
    for (const [dx, dy] of C) { const x = p.x + dx, y = p.y + dy; if (free(x, y)) return [x, y]; }
    return o.fallback || from;
  }
  // which way to face you from a tile
  function faceFrom(to) {
    const p = W().player;
    if (!p) return 'down';
    const dx = p.x - to[0], dy = p.y - to[1];
    return Math.abs(dx) >= Math.abs(dy) && dx ? (dx > 0 ? 'right' : 'left') : dy < 0 ? 'up' : 'down';
  }

  // ---- drawing (called from the renderer: pushes into its y-sorted list) ---------------------------------------
  function push(list, c, ax, ay, t) {
    const st = s();
    if (st && W().map && WILD.length) drawWild(list, c, ax, ay, t);
    if (!st || !P.sp || !P.placed || !shown()) return;
    if (P.map !== W().map.id) return;
    const look = P.look;
    const po = poseNow();
    const dir = P.dir;
    const f = RB.petArt.frame(P.sp, look, { kind: 'world', dir }, po);
    if (!f) return;
    // hop / flight height (drawn offset; the shadow stays on the ground)
    let up = 0;
    if (P.mv && P.sp === 'bird') {
      const k = P.mv.t / P.mv.dur;
      up = P.mv.gait === 'run' ? 7 + Math.round(Math.sin(P.t / 140) * 1) : Math.round(Math.sin(Math.PI * Math.min(1, k)) * 4);
    } else if (P.act && P.act.lift) up = P.act.lift(P.t - P.act.t0);
    const z = P.fy * TS + TS - 0.2;
    list.push({
      z, draw: () => {
        const x = ax(P.fx * TS) + 16, y = ay(P.fy * TS) + 30;
        const a = Math.max(0, Math.min(1, P.alpha));
        if (a <= 0) return;
        if (a < 1) c.globalAlpha = a;
        c.fillStyle = 'rgba(0,0,0,0.22)';
        c.beginPath();
        const rw = P.sp === 'bird' ? 4 : P.sp === 'dog' ? 9 : 8;
        c.ellipse(x, y - 2, rw - Math.min(2, up / 4), P.sp === 'bird' ? 1.5 : 2.5, 0, 0, Math.PI * 2);
        c.fill();
        c.drawImage(f.cv, Math.round(x - f.ax), Math.round(y - f.ay - up));
        if (a < 1) c.globalAlpha = 1;
        P.drawn = (P.drawn || 0) + 1;
        P.lastDraw = { x, y: y - up, w: f.w, h: f.h };
      },
    });
  }

  // ---- scene staging (for the pet vignettes and the rest-point greetings) --------------------------------------
  // act(anim): play a short authored pose timeline in place; resolves when it has played. anim:
  // { ms, pose(t, a) -> pose, lift?(t) -> px }. With reduced motion the timeline is held at its key moment.
  function act(anim) {
    return new Promise((res) => {
      if (!P.sp || !shown()) { res(); return; }
      const ms = anim.ms || 800;
      const rd = RB.game.reducedMotion();
      P.act = { t0: P.t, until: P.t + ms, done: res, pose: rd && anim.key ? () => anim.key : anim.pose, lift: rd ? null : anim.lift, hold: anim.hold };
      if (RB.test && RB.test.auto) { P.act = null; res(); }
    });
  }
  // walk to a free tile beside someone ('comp', 'pc' or an npc id), then face them
  function come(who) {
    return new Promise((res) => {
      const w = W();
      const a = RB.world.actorById(who);
      if (!a || !P.sp || !shown()) { res(false); return; }
      const cand = [];
      for (const d of ['left', 'right', 'down', 'up']) cand.push([a.x + DIRS[d][0], a.y + DIRS[d][1]]);
      const spot = cand.find(([x, y]) => floor(x, y) && !occupied(x, y) && !RB.maps.exitAt(w.map, x, y));
      if (!spot) { res(false); return; }
      if (spot[0] === P.x && spot[1] === P.y) { face(a); res(true); return; }
      // a short route over floor; too far or none: it simply appears there (a discreet cut)
      P.queue = [];
      const ok = routeTo(spot[0], spot[1]);
      const walk = () => {
        if (P.mv) { setTimeout(walk, 30); return; }
        if (P.queue.length) { const [tx, ty] = P.queue.shift(); startMove(tx, ty, 220, 'walk'); setTimeout(walk, 30); return; }
        face(a); res(true);
      };
      if (!ok || (RB.test && RB.test.auto)) { P.queue = []; P.x = spot[0]; P.y = spot[1]; P.fx = P.x; P.fy = P.y; P.mv = null; face(a); res(true); return; }
      walk();
    });
  }
  function face(a) {
    const dx = a.x - P.x, dy = a.y - P.y;
    if (Math.abs(dx) >= Math.abs(dy) && dx) P.dir = dx > 0 ? 'right' : 'left';
    else if (dy) P.dir = dy > 0 ? 'down' : 'up';
  }
  function state() {
    const st = s();
    return {
      sp: P.sp, look: P.look, shown: !!(st && P.sp && shown()), x: P.x, y: P.y, fx: P.fx, fy: P.fy, dir: P.dir, moving: !!P.mv, gait: P.mv ? P.mv.gait : null,
      queue: P.queue.length, still: Math.round(P.still), alpha: +P.alpha.toFixed(2), map: P.map, stats: Object.assign({}, P.stats), last: P.lastDraw || null, drawn: P.drawn || 0,
      acting: !!P.act, lastCatchUp: P.lastCatchUp || null, lastField: P.lastField || null, pose: P.sp ? poseNow() : null,
    };
  }

  // A field weave near you (present:action with scope 'field', emitted by the Weave presentation as the word
  // goes out): it turns toward where the word lands and gives its small reaction on its own time — nothing
  // waits for it, and it changes nothing. A finished result gets a small happy hop (the dog: a wag).
  const FIELD = { protect: 'sit', stone: 'sit', light: 'lookup', water: 'back', wind: 'back', fire: 'back', ice: 'back', bind: 'sniff', unravel: 'sniff', heal: 'lookup', bell: 'call', interpret: 'lookup', support: 'lookup', technique: 'lookup' };
  function fieldReact(e) {
    const st = s(), w = W();
    if (!st || !P.sp || !P.placed || !shown() || P.mv || P.act || !w.map || P.map !== w.map.id) return;
    if (e.at && e.at.map && e.at.map !== w.map.id) return;
    if (e.at && e.at.x != null) face({ x: e.at.x, y: e.at.y });
    const key = e.result === 'complete' ? 'hop' : FIELD[e.family] || 'lookup';
    const A = RB.pets.WORLD_ANIM && RB.pets.WORLD_ANIM[key];
    if (A) act(typeof A === 'function' ? A(P.sp) : A);
    P.stats.field = (P.stats.field || 0) + 1;
    P.lastField = { family: e.family || null, key, result: e.result || null };
  }

  if (RB.bus) {
    RB.bus.on('present:action', (e) => { try { if (e && e.scope === 'field') fieldReact(e); } catch (err) { /* cosmetic */ } });
    RB.bus.on('map:enter', () => { try { P.placed = false; } catch (e) { /* cosmetic */ } });
    RB.bus.on('pet:select', (e) => {
      try {
        const w = W(), d = e && e.species && WILD.find((q) => q.species === e.species && q.map === (w.map && w.map.id) && q.last);
        P.handoff = d ? { map: d.map, x: Math.round(d.last.x), y: Math.round(d.last.y), dir: d.last.dir } : null;
        P.placed = false;
      } catch (err) { /* cosmetic */ }
    });
  }
  return { update, push, state, act, come, face: (who) => { const a = RB.world.actorById(who); if (a) face(a); }, place: () => { P.placed = false; }, addWild, wild, nearTile, faceFrom, actorFrame, WILD, _P: P };
})();
