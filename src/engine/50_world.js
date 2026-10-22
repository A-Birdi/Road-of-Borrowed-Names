/* World simulation: player movement with interpolation, companion follow,
 * NPC routines, interaction, exits, triggers and tap-to-move. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.world = (function () {
  'use strict';
  const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const OPP = { up: 'down', down: 'up', left: 'right', right: 'left' };
  const W = {
    map: null,
    player: null,
    comp: null,
    npcs: [],
    foes: [],
    path: null,         // tap-to-move queue [[x,y],...]
    pathTarget: null,
    turnHold: 0,
    time: 0,
    emotes: [],         // {who, kind, until}
    flashes: [],
    leavers: [],        // people walking off to a door or exit before they go (drawn, never solid)
    seenOn: {},         // person id → the map they were last seen on this session (where arrivals come from)
    departures: [],     // the last few comings and goings: who, from where, to which map, by which exit, and why
    extras: [],         // people who walked in to speak in a scene; they walk off when it ends
    enteredAt: 0,
    calm: {},           // creature id → { until }: ones you stepped back from (they do not engage again yet)
    quietUntil: 0,      // W.time before which no creature engages (just after a battle)
  };

  // People's blink timers and creatures' patrols draw from the world's own stream (xorshift), never
  // Math.random: the language tasks pick from Math.random, and life in the world must not change which
  // task comes next.
  let wseed = 0x2545f491;
  function wrand() { wseed ^= wseed << 13; wseed >>>= 0; wseed ^= wseed >>> 17; wseed ^= wseed << 5; wseed >>>= 0; return wseed / 4294967296; }
  function makeActor(x, y, dir, look) {
    return { x, y, fx: x, fy: y, dir: dir || 'down', look, mv: null, frame: 0, stepToggle: 0, blinkT: wrand() * 4000 };
  }

  function s() {
    return RB.game.s;
  }

  // ---- map entry -----------------------------------------------------------
  function enter(mapId, x, y, dir, opts) {
    opts = opts || {};
    const m = RB.maps.compile(mapId);
    W.map = m;
    const st = s();
    st.map = mapId;
    if (x == null || y == null) {
      const sp = (m.def.spawn && ((opts.sp && m.def.spawn[opts.sp]) || m.def.spawn.default)) || [1, 1, 'down'];
      x = sp[0]; y = sp[1]; dir = dir || sp[2];
    }
    st.x = x; st.y = y; st.dir = dir || st.dir || 'down';
    st.visited[mapId] = true;
    if (m.def.travel) st.travel[m.def.travel] = true;
    W.player = makeActor(x, y, st.dir, playerLook());
    W.path = null;
    W.pathTarget = null;
    W.leavers = [];
    W.extras = [];
    W.enteredAt = W.time;
    W.foes = []; // a map entered (or loaded) places its creatures afresh
    W.calm = {};
    refreshActors();
    placeCompanion();
    unstick(W.player);
    // A map without a song of its own keeps whatever the world is playing (a house keeps its village's). Coming into
    // the world (a new journey, a load) or from the title, nothing of the world is playing: then it plays the song of
    // the place it opens onto (Robin, 2026-10-19: "Loading into an area that doesn't set the BGM will retain the
    // currently playing / previous BGM, such as the Title Screen theme when loading into the Lantern Hall")
    if (RB.audio) {
      const now = RB.audio.currentSong ? RB.audio.currentSong() : null;
      const song = musicFor(m.def, st) || (opts.fresh || !now || FRONT_SONGS[now] ? songAround(m, st) : null);
      if (song) RB.audio.playSong(song);
    }
    RB.render.invalidate();
    RB.bus.emit('map:enter', { id: mapId });
  }
  function pickMusic(music, st) {
    if (typeof music === 'string') return music;
    for (const m of music) if (!m.if || RB.state.test(st, m.if)) return m.id;
    return null;
  }
  // the song a map plays now (null for maps that keep whatever is playing)
  function musicFor(def, st) {
    if (!def || !def.music) return null;
    return typeof def.music === 'function' ? def.music(st) : pickMusic(def.music, st);
  }
  // songs that are not the world's (the title's)
  const FRONT_SONGS = { title: 1 };
  // the song of the nearest place a map opens onto (through its ways out, a few steps at most), for a map without one
  function songAround(m, st) {
    const seen = new Set([m.id]);
    let level = [m];
    for (let d = 0; d < 4 && level.length; d++) {
      const next = [];
      for (const cm of level) for (const ex of cm.exits || []) {
        if (!ex.to || seen.has(ex.to) || !RB.content.maps[ex.to]) continue;
        seen.add(ex.to);
        const song = musicFor(RB.content.maps[ex.to], st);
        if (song) return song;
        try { next.push(RB.maps.compile(ex.to)); } catch (e) { /* a way out to a map that cannot be built is passed over */ }
      }
      level = next;
    }
    return null;
  }
  function playerLook() {
    const l = RB.equip.look(s()); // own look + the equipped keepsake (src/engine/07_equip.js)
    // festival dress on the night of the Opening of the River (src/engine/58f_festdress.js)
    return RB.festDress && RB.festDress.on(s()) ? RB.festDress.look(l, 'pc') : l;
  }
  function partyCompanion() {
    const st = s();
    return st.comp || null;
  }
  // Whether the companion walks with you on a map: noCompanion: true never; a string is the condition under which
  // they ARE there ('!cr_apart': with you unless you are apart). The pet follows the same rule (57_petworld.js).
  function companionHere(st, def) {
    return !def || !def.noCompanion || (def.noCompanion !== true && RB.state.test(st, def.noCompanion));
  }
  // A map's followerAway (a condition): while it holds, your companion does not walk with you there, though they are
  // still with you in every other way (the party, battles, the Ledger, the pet's rule above): a quarrel at the
  // Keepers' Lodge (RBN-QA-063, kr/24_scenes_comp.js). A scene's `!refresh comp` reads it again on the same map.
  // Where they stand: behind you, else on your own tile (a map's entry). o.near (`!refresh comp`, someone coming back
  // mid-scene): behind you, else beside you, else ahead, your own tile last, so they are not hidden under you while
  // the scene goes on (Local CL-101). If they are the one just now walking off this map (a scene's !refresh took
  // their placement here away, as on the Ridge Light) or standing here having walked in to speak, that figure is the
  // one who comes with you, from where it stands: never a second of them (RBN-QA-066, Agnes 6315726597, Local CL-107).
  function placeCompanion(o) {
    const cid = partyCompanion(), d = W.map.def;
    if (!cid || !companionHere(s(), d) || (d && d.followerAway && RB.state.test(s(), d.followerAway))) {
      W.comp = null;
      return;
    }
    const ch = RB.content.chars[cid];
    const p = W.player;
    const back = DIRS[OPP[p.dir]], ahead = DIRS[p.dir];
    const going = o && o.near && (W.leavers.find((n) => personOf(n) === cid) || W.extras.find((n) => personOf(n) === cid));
    if (going) { W.leavers = W.leavers.filter((n) => n !== going); W.extras = W.extras.filter((n) => n !== going); }
    const tries = going ? [going.mv ? [going.mv.tx, going.mv.ty] : [going.x, going.y]] : [];
    tries.push([p.x + back[0], p.y + back[1]]);
    if (o && o.near) tries.push([p.x - ahead[1], p.y + ahead[0]], [p.x + ahead[1], p.y - ahead[0]], [p.x + ahead[0], p.y + ahead[1]]);
    const at = tries.find(([x, y]) => !blocked(x, y, { ignoreComp: true }) && !RB.maps.exitAt(W.map, x, y)) || [p.x, p.y];
    const cx = at[0], cy = at[1];
    W.comp = makeActor(cx, cy, going ? going.dir : p.dir, RB.festDress && RB.festDress.on(s()) ? RB.festDress.look(ch.look, cid) : ch.look);
    W.comp.id = cid;
    W.trail = [];
  }
  // o.arrive: a scene's !refresh arrive — the people this brings walk in from the way in even just after the map
  // appeared (by default, people who appear while a map is still appearing were simply already there)
  function refreshActors(o) {
    const st = s();
    const m = W.map;
    const keep = new Map(W.npcs.map((n) => [n.id, n]));
    const before = new Set(W.npcs.map((n) => n.id));
    const renamed = new Set();
    W.npcs = [];
    const moved = []; // the same placement id, now at a new place on this map (LW-09)
    for (const n of m.def.npcs || []) {
      if (n.if && !RB.state.test(st, n.if)) continue;
      if (st.comp && n.id === st.comp && !n.alwaysShow) continue; // companion travels with the player
      const ch = RB.content.chars[n.char || n.id] || {};
      // the same person under a new name (npc.was): keep the figure in place
      let old = keep.get(n.id);
      if (!old && n.was && keep.has(n.was)) { old = keep.get(n.was); renamed.add(n.was); before.add(n.id); }
      const a = old && old.map === m.id ? old : makeActor(n.x, n.y, n.dir || 'down', n.look || ch.look || RB.sprites.randomLook(RB.util.hashStr(n.id)));
      // a figure kept under the same id whose placement now stands elsewhere (one condition ended as another, with
      // the same id, began): it goes to its new place, below, rather than staying where the old one stood
      if (a === old && old.home && (old.home[0] !== n.x || old.home[1] !== n.y)) moved.push(a);
      a.id = n.id; a.def = n; a.map = m.id; a.home = [n.x, n.y];
      a.look = n.look || ch.look || a.look;
      W.npcs.push(a);
    }
    // People who come or go while you are here walk to or from the nearest
    // door or way out instead of popping in and out (not while a map is
    // still appearing: those people were simply already there, or gone).
    // One person is never on screen twice: when the story moves someone to a
    // new place on this map (one placement ends as another begins), or
    // someone who walked in to speak (or was walking away) now has a place
    // here, that same figure walks to the new place.
    // Behind an illustrated sequence's picture (src/ui/43_sequence.js) the shots show the comings and goings, as
    // they show a !move or a !walkto there: people are at once where the story now puts them, so the world the
    // picture dissolves back into already matches it (nobody seen going in twice; docs/expressive/CONTRACT.md HX52).
    const behind = !!(RB.sequence && RB.sequence.hidesWorld && RB.sequence.hidesWorld());
    if (W.time - W.enteredAt > 900 || (o && o.arrive)) {
      const arriving = W.npcs.filter((a) => !before.has(a.id) && !keep.has(a.id));
      const atOnce = (a, arr) => noteDeparture(a, { goals: new Set(), to: arr ? m.id : null, reason: 'behind an illustrated sequence: at once' }, [], arr);
      let k = 0;
      for (const [id, a] of keep) {
        if (W.npcs.some((n) => n.id === id) || id === st.comp || a.map !== m.id || renamed.has(id)) continue;
        const b = arriving.find((n) => !n.shifted && personOf(n) === personOf(a));
        if (b && behind) { b.shifted = true; atOnce(b, true); } else if (b) shiftTo(b, a);
        else if (behind) atOnce(a, false);
        else leave(a, k++);
      }
      let onFoot = 0; // (people walking in together come through the door one after another)
      for (const b of arriving) {
        if (b.shifted) continue;
        const here = W.extras.find((e) => personOf(e) === personOf(b)) || W.leavers.find((e) => personOf(e) === personOf(b));
        if (here) {
          W.extras = W.extras.filter((e) => e !== here);
          W.leavers = W.leavers.filter((e) => e !== here);
          if (behind) atOnce(b, true); else shiftTo(b, here);
        } else if (behind) atOnce(b, true);
        else if (arriveOnFoot(b, onFoot)) onFoot++;
      }
    }
    // LW-09: a person whose placement moved on this map. While the map is appearing (or behind an illustrated
    // sequence) they are simply at the new place; otherwise they walk there, as anyone the story moves does (a
    // scene that is staging them keeps them: it puts them where it wants). Nobody else is touched.
    for (const a of moved) {
      if (a.x === a.home[0] && a.y === a.home[1]) continue;
      if (a.stg && a.stg.run && !a.stg.run.done && a.stg.run.owner !== 'idle') continue;
      const snap = () => { a.x = a.home[0]; a.y = a.home[1]; a.fx = a.x; a.fy = a.y; a.mv = null; a.route = null; a.dir = a.def.dir || a.dir; };
      if (behind || W.time - W.enteredAt <= 900) { snap(); continue; }
      a.mv = null; a.fx = a.x; a.fy = a.y;
      const route = routeRound(a, 160, new Set([a.home[0] + ',' + a.home[1]]));
      if (route && route.length) { a.route = route; a.routeT = 0; } else snap();
    }
    // (a figure dismissExtras kept for its new place and nothing here took: as before, it is simply gone)
    if (W.extras.some((e) => e.adopt)) W.extras = W.extras.filter((e) => !e.adopt);
    for (const a of W.npcs) W.seenOn[personOf(a)] = m.id;
    // Where you last saw people (W3, kept with the twelve-chapter game's save) is no longer every person on a map
    // that was loaded (LW-08): sighted() below records someone when they are actually in view in the world.
    // Creatures still here stay where they are (a scene ending, a battle won nearby): they used
    // to jump back to their places, onto or right beside you. A map entered places them afresh.
    const keepFoes = new Map(W.foes.filter((f) => f.map === m.id).map((f) => [f.id, f]));
    W.foes = [];
    for (const e of m.def.foes || []) {
      if (e.if && !RB.state.test(st, e.if)) continue;
      if (st.flags['foe:' + m.id + ':' + e.id]) continue;
      const old = keepFoes.get(e.id);
      if (old && old.def === e) { W.foes.push(old); continue; }
      const en = RB.content.enemies[e.enemy] || {};
      const a = makeActor(e.x, e.y, 'down', en.look || { custom: 'wisp' });
      a.id = e.id; a.def = e; a.home = [e.x, e.y]; a.foe = true; a.map = m.id;
      W.foes.push(a);
    }
  }

  // ---- coming and going on foot ---------------------------------------------
  // Ways in and out: exits (edges and doors) and the shut doors of homes.
  function waysOut() {
    const st = s(), out = [];
    for (const e of W.map.exits) {
      if (!usable(e, st)) continue;
      for (let y = e.y; y < e.y + e.h; y++) for (let x = e.x; x < e.x + e.w; x++) out.push(x + ',' + y);
    }
    for (const d of W.map.shut || []) if (!d.if || RB.state.test(st, d.if)) out.push(d.x + ',' + d.y);
    return new Set(out);
  }
  // an exit or door that can be used now: its condition holds and it is not locked
  function usable(e, st) { return (!e.if || RB.state.test(st, e.if)) && (!e.locked || (e.unlock && RB.state.test(st, e.unlock))); }
  // Shortest walk (at most `max` steps) from x,y to the nearest of `goals`
  // (a set of "x,y"; default: every way out), through open ground; people are
  // ignored, except tiles listed in `avoid` (routeRound passes everyone's).
  function routeOut(x, y, max, goals, avoid) {
    goals = goals || waysOut();
    if (!goals.size) return null;
    const prev = new Map([[x + ',' + y, null]]);
    let q = [[x, y]];
    for (let d = 0; d <= max && q.length; d++) {
      const next = [];
      for (const [cx, cy] of q) {
        const k = cx + ',' + cy;
        if (goals.has(k) && d > 0) {
          const path = [];
          for (let c = k; c; c = prev.get(c)) path.unshift(c.split(',').map(Number));
          return path.slice(1);
        }
        for (const dir in DIRS) {
          const nx = cx + DIRS[dir][0], ny = cy + DIRS[dir][1], nk = nx + ',' + ny;
          if (prev.has(nk) || nx < 0 || ny < 0 || nx >= W.map.w || ny >= W.map.h) continue;
          if (avoid && avoid.has(nk)) continue;
          if (!goals.has(nk) && RB.maps.blockedStatic(W.map, nx, ny)) continue;
          prev.set(nk, k);
          next.push([nx, ny]);
        }
      }
      q = next;
    }
    return null;
  }
  // The tiles people stand on now, or are stepping onto: you, your companion,
  // everyone placed here, anyone who walked in to speak, anyone walking off,
  // and creatures; never `self`, nor `also` (the figure `self` takes over from).
  function peopleTiles(self, also) {
    const out = new Set();
    const add = (n) => {
      if (!n || n === self || n === also) return;
      out.add(n.x + ',' + n.y);
      if (n.mv) out.add(n.mv.tx + ',' + n.mv.ty);
    };
    add(W.player); add(W.comp);
    for (const list of [W.npcs, W.extras, W.leavers, W.foes]) for (const n of list) add(n);
    return out;
  }
  // Someone standing on x,y (or stepping onto it) other than `self`.
  function personAt(x, y, self) {
    const on = (n) => n && n !== self && ((n.x === x && n.y === y) || (n.mv && n.mv.tx === x && n.mv.ty === y));
    if (on(W.player)) return W.player;
    if (on(W.comp)) return W.comp;
    return actorAt(x, y, self) || W.leavers.find(on) || null;
  }
  // The world's own comings and goings (walking in to speak, walking off, the
  // story moving someone to a new place here) step round everyone standing
  // about. Only when there is no such way (someone in the one doorway, a lane
  // they fill) is the shortest way taken regardless; the walker then waits
  // for them as it goes (followRoute).
  function routeRound(a, max, goals, also) {
    return routeOut(a.x, a.y, max, goals, peopleTiles(a, also)) || routeOut(a.x, a.y, max, goals);
  }

  // ---- where someone is going (or coming from) ---------------------------------
  // A person who leaves heads for where the story now puts them: the maps on
  // which they appear under the current flags. The way out they take is one
  // that starts the shortest journey there through the map links (exits and
  // doors whose conditions hold now, locks respected); distance only chooses
  // between exits that serve that journey. An authored npc.leaveTo (a map id)
  // says it outright. With no known destination they go through the nearest
  // way out, and test runs list those (RB.test.departures) for review.
  // Someone who neither walks off nor walks in — picked up and carried, set
  // down beside someone — says so with npc.leave: 'here' / npc.arrive: 'here':
  // they fade out (or in) where they are.
  const personOf = (n) => (n.def && (n.def.char || n.def.id)) || n.id;
  // the maps where `person` appears now (any: where the story ever puts them)
  function mapsWith(person, except, any) {
    const st = s(), out = [];
    for (const id in RB.content.maps) {
      if (id === except) continue;
      for (const n of RB.content.maps[id].npcs || []) {
        if ((n.char || n.id) !== person || (!any && n.if && !RB.state.test(st, n.if))) continue;
        if (st.comp && n.id === st.comp && !n.alwaysShow) continue;
        out.push(id);
        break;
      }
    }
    return out;
  }
  // links of an authored map: [{ to, tiles: ["x,y"...] }] for exits and doors usable now
  function linksOf(id) {
    const def = RB.content.maps[id], st = s(), out = [];
    if (!def) return out;
    for (const e of def.exits || []) {
      if (!e.to || !usable(e, st)) continue;
      const tiles = [];
      for (let y = e.y; y < e.y + (e.h || 1); y++) for (let x = e.x; x < e.x + (e.w || 1); x++) tiles.push(x + ',' + y);
      out.push({ to: e.to, tiles });
    }
    for (const b of def.structs || []) if (b.door != null && b.to && usable(b, st)) out.push({ to: b.to, tiles: [(b.x + b.door) + ',' + (b.y + b.h - 1)] });
    return out;
  }
  // The first hop from `from` toward the nearest of `dests`: { tiles:Set, via, to, hops } or null.
  function towards(from, dests) {
    if (!dests.length) return null;
    const want = new Set(dests);
    const first = new Map([[from, null]]); // map → the link on `from` that starts the way there
    let q = [from], hops = 0;
    while (q.length && hops < 12) {
      const next = [];
      for (const id of q) {
        for (const l of linksOf(id)) {
          if (first.has(l.to)) continue;
          first.set(l.to, id === from ? l : first.get(id));
          if (want.has(l.to)) {
            const start = first.get(l.to), tiles = new Set();
            // every exit on this map that starts an equally short journey there
            for (const k of linksOf(from)) if (k.to === start.to) k.tiles.forEach((t) => tiles.add(t));
            return { tiles, via: start.to, to: l.to, hops: hops + 1 };
          }
          next.push(l.to);
        }
      }
      q = next;
      hops++;
    }
    return null;
  }
  // The way out (or in) a person uses on this map: { goals:Set, to, reason }.
  function wayFor(a, arriving) {
    const person = personOf(a), m = W.map;
    let dests = [], reason;
    if (arriving) {
      // from where they were last seen; not seen yet this session: from the
      // nearest place the story keeps them (their home, their work)
      const was = W.seenOn[person];
      if (was && was !== m.id) { dests = [was]; reason = 'came from'; }
      else { dests = mapsWith(person, m.id, true); reason = 'from their place'; }
    } else if (a.def && a.def.leaveTo) { dests = [].concat(a.def.leaveTo); reason = 'authored'; }
    else { dests = mapsWith(person, m.id); reason = 'destination'; }
    const hop = towards(m.id, dests);
    if (hop && hop.tiles.size) return { goals: hop.tiles, to: hop.to, via: hop.via, reason };
    return { goals: null, to: dests[0] || null, reason: dests.length ? 'unreachable' : 'unknown' };
  }
  // the last few comings and goings (W.departures; test runs keep them all in RB.test.departures)
  function noteDeparture(a, way, route, arriving) {
    const end = route && route.length ? route[route.length - 1].join(',') : null;
    const rec = { id: personOf(a), map: W.map.id, from: a.x + ',' + a.y, to: way.to, via: way.via || null, exit: end, reason: way.goals ? way.reason : 'nearest (' + way.reason + ')', arriving: !!arriving };
    W.departures.push(rec);
    if (W.departures.length > 40) W.departures.shift();
    if (RB.test && RB.test.auto) (RB.test.departures = RB.test.departures || []).push(rec);
  }
  // The same person takes up a new place on this map: the figure `b` starts
  // where `from` stands and walks to b's own spot (no fade, no second figure).
  function shiftTo(b, from) {
    b.shifted = true;
    b.x = from.x; b.y = from.y; b.fx = from.x; b.fy = from.y; b.dir = from.dir; b.mv = null;
    b.alpha = 1; b.fadeIn = false; b.routeT = 0;
    const home = b.home ? b.home[0] + ',' + b.home[1] : null;
    const route = home && (from.x + ',' + from.y) !== home ? routeRound(b, 160, new Set([home]), from) : null;
    b.route = route && route.length ? route : null;
    if (!b.route && home) { b.x = b.home[0]; b.y = b.home[1]; b.fx = b.x; b.fy = b.y; }
    noteDeparture(b, { goals: new Set(home ? [home] : []), to: W.map.id, via: null, reason: 'moves to a new place here' }, b.route, false);
  }
  // Resolves when the person who is about to speak has reached their place
  // (at most `ms`): a scene's line waits for someone still walking up.
  function whenArrived(who, ms) {
    const a = W.npcs.concat(W.extras).find((n) => n.id === who || personOf(n) === who);
    if (!a || (!a.route && !a.mv) || (RB.test && RB.test.auto)) return Promise.resolve();
    const t0 = performance.now();
    return new Promise((res) => {
      const tick = () => ((!a.route && !a.mv) || performance.now() - t0 > (ms || 3000) || !W.map ? res() : setTimeout(tick, 60));
      tick();
    });
  }
  // LW-08: an eyewitness record only for someone actually in view (inside the screen, fully there, not mid-fade),
  // checked a few times a second while the world is in play: a big map's far side is not "seen" on arrival, a
  // menu or a reload records nothing by itself, and what someone told you stays a note (src/engine/53_town.js).
  let sightT = 0;
  function sighted(dt) {
    sightT -= dt;
    if (sightT > 0) return;
    sightT = 400;
    const st = s();
    if (!st || !RB.town || !RB.edition || RB.edition.of(st) < 2 || RB.game.mode() !== 'world' || !W.map) return;
    const v = RB.render.viewSize(), c = RB.render.cam;
    for (const a of W.npcs) {
      if (a.alpha != null && a.alpha < 0.9) continue;
      const x = a.fx * 16 - c.x, y = a.fy * 16 - c.y;
      if (x < -4 || y < -8 || x > v.w - 12 || y > v.h - 12) continue;
      const who = personOf(a), was = RB.town.rec(st).lastSeen[who];
      if (was && was.map === W.map.id && Date.now() - was.t < 30000) continue; // (seen here a moment ago)
      RB.town.seen(st, who, W.map.id, a.fx, a.fy);
    }
  }
  function onScreen(a) {
    const v = RB.render.viewSize(), c = RB.render.cam;
    const x = a.x * 16 - c.x, y = a.y * 16 - c.y;
    return x > -48 && y > -48 && x < v.w + 48 && y < v.h + 64;
  }
  // i: the order of people leaving at once (each sets off a moment after the last)
  function leave(a, i) {
    if (!onScreen(a)) return;
    if (a.def && a.def.leave === 'here') {
      noteDeparture(a, { goals: new Set(), to: null, reason: 'authored: gone where they were' }, [], false);
      // (passing over seen lines, an authored disappearance is over at once: nothing is left fading under the next
      // line, which a skip shows only for a moment; RBN-QA-093)
      if (RB.game.fastForward()) return;
      W.leavers.push(Object.assign({}, a, { mv: null, route: [], goals: null, alpha: 1, fading: true, wait: 0 }));
      return;
    }
    const way = wayFor(a, false);
    // already standing in the doorway they need: they just go
    const there = way.goals && way.goals.has(a.x + ',' + a.y);
    const route = there ? [] : (way.goals && routeRound(a, 160, way.goals)) || routeRound(a, 18) || [];
    noteDeparture(a, there ? Object.assign({}, way, { reason: way.reason + ', at the way out' }) : route.length && way.goals ? way : Object.assign({}, way, { goals: null }), route, false);
    W.leavers.push(Object.assign({}, a, { mv: null, route, goals: way.goals, alpha: 1, fading: !route.length, wait: (i || 0) * 380 }));
  }
  // i: the order of people arriving at once; each comes through the way in a moment after the last (they would
  // otherwise all stand in the doorway together). True when they walk in.
  function arriveOnFoot(a, i) {
    if (!onScreen(a)) return false;
    if (a.def && a.def.arrive === 'here') {
      noteDeparture(a, { goals: new Set(), to: W.map.id, reason: 'authored: appears where they are' }, [], true);
      a.alpha = 0; a.fadeIn = true;
      return false;
    }
    const way = wayFor(a, true);
    // (planned from where they will stand back to the way in, round everyone here)
    const route = (way.goals && routeRound(a, 160, way.goals)) || routeRound(a, 18);
    noteDeparture(a, route && way.goals ? way : Object.assign({}, way, { goals: null }), route, true);
    if (!route || !route.length) { a.alpha = 0; a.fadeIn = true; return false; }
    const path = route.slice(0, -1).reverse().concat([[a.x, a.y]]);
    const [sx, sy] = route[route.length - 1];
    a.route = path; a.alpha = 0; a.fadeIn = true; a.routeT = 0; a.mv = null; a.arriving = true;
    // the first steps into the way in now; the others wait, unseen at their own places (never two in the doorway),
    // and step into it on their turn once it is clear (updateWalkers)
    if (i) { a.wait = i * 450; a.start = [sx, sy]; } else { a.x = sx; a.y = sy; a.fx = sx; a.fy = sy; }
    return true;
  }
  // Resolves once everyone walking in here has arrived (at most o.ms). o.now, or skipping: they are at their places
  // at once, as if they had walked there.
  function arrivals(o) {
    o = o || {};
    const walking = () => W.npcs.filter((a) => a.arriving && (a.route || a.mv || a.wait > 0 || a.fadeIn));
    const settle = () => {
      for (const a of walking()) {
        if (a.home) { a.x = a.home[0]; a.y = a.home[1]; }
        else if (a.mv) { a.x = a.mv.tx; a.y = a.mv.ty; }
        a.fx = a.x; a.fy = a.y; a.mv = null; a.route = null; a.wait = 0; a.start = null; a.alpha = 1; a.fadeIn = false; a.arriving = false;
        a.dir = (a.def && a.def.dir) || a.dir;
      }
    };
    if (o.now || RB.game.fastForward()) { settle(); return Promise.resolve(); }
    const map = W.map, t0 = performance.now();
    return new Promise((res) => {
      const tick = () => {
        if (W.map !== map) return res();
        if (RB.game.fastForward() || performance.now() - t0 > (o.ms || 8000)) { settle(); return res(); }
        if (!walking().length) return res();
        setTimeout(tick, 60);
      };
      tick();
    });
  }
  // The scene waits until the people a refresh has just sent away (`gone`, their figures in W.leavers) have left: faded
  // where they stood or walked off and faded. The fade runs on the world's frames, which a slow device delivers late,
  // so this waits for the departure itself, not for a time; bounded (o.ms) and at once when skipping, or behind an
  // illustrated sequence (o.now): then whoever is still going is gone at once (`!refresh gone`; RBN-QA-093)
  function departures(gone, o) {
    o = o || {};
    const going = () => gone.filter((a) => W.leavers.includes(a));
    const settle = () => { const g = going(); if (g.length) W.leavers = W.leavers.filter((a) => !g.includes(a)); };
    if (!gone.length) return Promise.resolve();
    if (o.now || RB.game.fastForward()) { settle(); return Promise.resolve(); }
    const map = W.map, t0 = performance.now();
    return new Promise((res) => {
      const tick = () => {
        if (W.map !== map) return res();
        if (RB.game.fastForward() || performance.now() - t0 > (o.ms || 4000)) { settle(); return res(); }
        if (!going().length) return res();
        setTimeout(tick, 40);
      };
      tick();
    });
  }
  // Follow a route one tile at a time; true when it is walked.
  function followRoute(a, dt, dur) {
    if (a.mv || !a.route) return !a.route;
    if (!a.route.length) { a.route = null; return true; }
    const [nx, ny] = a.route[0];
    const dx = nx - a.x, dy = ny - a.y;
    const dir = dx > 0 ? 'right' : dx < 0 ? 'left' : dy > 0 ? 'down' : 'up';
    if (Math.abs(dx) + Math.abs(dy) !== 1) { a.route = null; return true; }
    // someone in the way (you, your companion, anyone standing or walking
    // here): after a beat, step round them if there is another way to the
    // same place (looked for again every so often: they may move), otherwise
    // wait for them; only after a long wait go on regardless, so that a scene
    // never stalls on it
    if (personAt(nx, ny, a)) {
      a.routeT = (a.routeT || 0) + dt;
      a.replanT = (a.replanT || 0) - dt;
      if (a.routeT > 200 && a.replanT <= 0) {
        a.replanT = 500;
        const last = a.route[a.route.length - 1];
        const round = routeOut(a.x, a.y, a.route.length + 10, a.goals || new Set([last.join(',')]), peopleTiles(a));
        if (round && round.length) { a.route = round; a.routeT = 0; a.replanT = 0; return false; }
      }
      if (a.routeT < 2400) return false;
      a.forced = true; // no way round in time: on through them (the staging runner records this apart)
    } else a.forced = false;
    a.routeT = 0;
    a.replanT = 0;
    a.route.shift();
    startMove(a, dir, dur);
    return false;
  }
  function updateWalkers(dt) {
    for (const a of W.leavers) {
      if (a.wait > 0) { a.wait -= dt; continue; } // people leaving together set off one after another
      stepActor(a, dt);
      if (!a.fading && followRoute(a, dt, 260) && !a.mv) a.fading = true;
      if (a.fading) a.alpha -= dt / 260;
    }
    W.leavers = W.leavers.filter((a) => a.alpha > 0);
    if (RB.test && RB.test.auto) {
      const seen = new Set();
      for (const a of W.npcs.concat(W.extras, W.leavers)) {
        const who = personOf(a);
        if (seen.has(who)) { const k = who + ' @ ' + W.map.id; const l = (RB.test.twice = RB.test.twice || []); if (!l.includes(k)) l.push(k); }
        seen.add(who);
      }
    }
    for (const n of W.npcs.concat(W.extras)) {
      if (n.wait > 0) { n.wait -= dt; continue; } // (arriving after the one before: not here yet)
      if (n.start) {
        if (personAt(n.start[0], n.start[1], n)) { n.wait = 60; continue; } // (the doorway is still taken)
        n.x = n.start[0]; n.y = n.start[1]; n.fx = n.x; n.fy = n.y; n.start = null;
      }
      if (n.fadeIn) { n.alpha = Math.min(1, (n.alpha || 0) + dt / 260); if (n.alpha >= 1) n.fadeIn = false; }
      if (n.extra) { stepActor(n, dt); n.blinkT -= dt; if (n.blinkT < -140) n.blinkT = 2500 + wrand() * 3000; }
      if (n.route && !n.mv) {
        if (followRoute(n, dt, 240) && !n.mv) { n.route = null; n.arriving = false; if (n.extra) faceTo(n, W.player.x, W.player.y); else n.dir = (n.def && n.def.dir) || n.dir; }
      }
    }
  }
  // A scene gives a line to someone who is not here: they walk in from the
  // nearest door or way in and stand near you while it lasts. Characters who
  // are only ever a voice (chars[id].bodiless) and lines a scene marks as
  // off-screen (!speakerless) are left alone. Returns the figure who is (or is coming) here, if any.
  function ensureSpeaker(who, sceneId, o) {
    if (!who || who === 'narr' || who === 'pc' || !W.map || !RB.render.worldVisible()) return null;
    if (W.comp && (who === 'comp' || W.comp.id === who)) return W.comp;
    // already here under any of their placements (tsuru_out is Tsuru)
    const here = W.npcs.concat(W.extras).find((n) => n.id === who || personOf(n) === who);
    if (here) return here;
    // walking away just now: they stop, turn back and speak (no second figure)
    const going = W.leavers.find((n) => personOf(n) === who || n.id === who);
    if (going) {
      W.leavers = W.leavers.filter((n) => n !== going);
      Object.assign(going, { route: null, fading: false, alpha: 1, wait: 0, extra: true, goals: null });
      if (going.mv) { going.x = going.mv.tx; going.y = going.mv.ty; }
      W.extras.push(going);
      if (!going.mv) faceTo(going, W.player.x, W.player.y);
      return going;
    }
    // someone about to be known by this name is already standing here
    const was = (W.map.def.npcs || []).find((n) => n.was && n.id === who && W.npcs.some((q) => q.id === n.was));
    if (was) return W.npcs.find((q) => q.id === was.was);
    const ch = RB.content.chars[who];
    if (!ch || !ch.look || ch.bodiless) return null;
    const spot = spotNear(W.player.x, W.player.y, o && o.at);
    if (!spot) return null;
    const a = makeActor(spot[0], spot[1], 'down', ch.look);
    a.id = who; a.def = { id: who }; a.home = spot; a.extra = true; a.map = W.map.id;
    W.extras.push(a);
    // (an entrance the scene stages on purpose, !enter, is not a speaker who was missing)
    if (RB.test && RB.test.auto && !(o && o.staged)) (RB.test.extras = RB.test.extras || []).push(who + ' @ ' + W.map.id + ' (' + (sceneId || '?') + ')');
    arriveOnFoot(a);
    if (!a.route) faceTo(a, W.player.x, W.player.y);
    return a;
  }
  // A free tile near x,y to stand on: facing the player first, then the nearest. Not a tile someone still
  // walking here is going to stand on (an earlier speaker on their way in, someone the story moves): two
  // speakers given the same place met there, and the later one went through the first (sa.epi_lf).
  // at: a place the scene names for them (!enter), taken when it is free; they walk in straight to it.
  function spotNear(x, y, at) {
    const p = W.player, [fx, fy] = frontTile(), st = s();
    const bound = new Set();
    for (const n of W.npcs.concat(W.extras)) if (n.route && n.route.length) bound.add(n.route[n.route.length - 1].join(','));
    const free = (tx, ty) => tx >= 0 && ty >= 0 && tx < W.map.w && ty < W.map.h && !RB.maps.blockedStatic(W.map, tx, ty) && !actorAt(tx, ty) &&
      !(tx === p.x && ty === p.y) && !RB.maps.exitAt(W.map, tx, ty) && !triggerAt(tx, ty) && !bound.has(tx + ',' + ty) && st;
    const ok = (tx, ty) => free(tx, ty) && !(W.comp && W.comp.x === tx && W.comp.y === ty);
    // (the named place: your companion counts as where they are stepping to, so one just stepping off it after you
    // leaves it free; the scene may begin while they are still following you in)
    const c = W.comp, cAt = c && (c.mv ? [c.mv.tx, c.mv.ty] : [c.x, c.y]);
    if (at && free(at[0], at[1]) && !(cAt && cAt[0] === at[0] && cAt[1] === at[1])) return [at[0], at[1]];
    if (ok(fx, fy)) return [fx, fy];
    for (let r = 1; r <= 4; r++) {
      const ring = [];
      for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (Math.max(Math.abs(dx), Math.abs(dy)) === r) ring.push([x + dx, y + dy]);
      ring.sort((a, b) => (Math.abs(a[0] - x) + Math.abs(a[1] - y)) - (Math.abs(b[0] - x) + Math.abs(b[1] - y)));
      for (const [tx, ty] of ring) if (ok(tx, ty)) return [tx, ty];
    }
    return null;
  }
  // The scene is over: those who walked in walk off (unless they live here now).
  // At a scene's end. Someone who walked in to speak and now has a place here that the world has not placed yet (the
  // scene began it: Jinpachi once the Cloudroad is done) is kept for refreshActors, which follows: that same figure
  // walks to the new place (one person is never on screen twice, nor vanishes beside you to walk in again).
  function dismissExtras() {
    const st = s(), adopt = [];
    for (const a of W.extras) {
      const lives = (W.map.def.npcs || []).some((n) => (n.char || n.id) === personOf(a) && (!n.if || RB.state.test(st, n.if)));
      if (!lives) leave(a);
      else if (!W.npcs.some((n) => personOf(n) === personOf(a))) { a.adopt = true; adopt.push(a); }
    }
    W.extras = adopt;
  }

  // ---- collision -----------------------------------------------------------
  function actorAt(x, y, except) {
    for (const n of W.npcs) if (n !== except && ((n.x === x && n.y === y) || (n.mv && n.mv.tx === x && n.mv.ty === y))) return n;
    for (const n of W.extras) if (n !== except && ((n.x === x && n.y === y) || (n.mv && n.mv.tx === x && n.mv.ty === y))) return n;
    for (const n of W.foes) if (n !== except && ((n.x === x && n.y === y) || (n.mv && n.mv.tx === x && n.mv.ty === y))) return n;
    return null;
  }
  function blocked(x, y, o) {
    o = o || {};
    if (RB.maps.blockedStatic(W.map, x, y)) return true;
    if (actorAt(x, y, o.except)) return true;
    if (!o.ignorePlayer && W.player && W.player !== o.except && ((W.player.x === x && W.player.y === y) || (W.player.mv && W.player.mv.tx === x && W.player.mv.ty === y))) return true;
    return false;
  }
  // If an actor is standing somewhere solid (e.g. a prop appeared), move it to the nearest free tile.
  function unstick(a) {
    if (!RB.maps.blockedStatic(W.map, a.x, a.y)) return;
    const seen = new Set();
    const q = [[a.x, a.y]];
    while (q.length) {
      const [x, y] = q.shift();
      const k = x + ',' + y;
      if (seen.has(k)) continue;
      seen.add(k);
      if (x < 0 || y < 0 || x >= W.map.w || y >= W.map.h) continue;
      if (!RB.maps.blockedStatic(W.map, x, y) && !actorAt(x, y)) {
        a.x = a.fx = x; a.y = a.fy = y;
        s().x = W.player.x; s().y = W.player.y;
        return;
      }
      for (const d in DIRS) q.push([x + DIRS[d][0], y + DIRS[d][1]]);
      if (seen.size > 2000) return;
    }
  }

  // ---- movement --------------------------------------------------------------
  function startMove(a, dir, dur) {
    const [dx, dy] = DIRS[dir];
    a.dir = dir;
    a.mv = { sx: a.x, sy: a.y, tx: a.x + dx, ty: a.y + dy, t: 0, dur };
    a.stepToggle ^= 1;
  }
  function stepActor(a, dt) {
    if (!a.mv) { a.fx = a.x; a.fy = a.y; a.frame = 0; return false; }
    a.mv.t += dt;
    const k = Math.min(1, a.mv.t / a.mv.dur);
    a.fx = a.mv.sx + (a.mv.tx - a.mv.sx) * k;
    a.fy = a.mv.sy + (a.mv.ty - a.mv.sy) * k;
    a.frame = k < 0.5 ? (a.stepToggle ? 1 : 2) : 0;
    if (k >= 1) {
      a.x = a.mv.tx; a.y = a.mv.ty; a.fx = a.x; a.fy = a.y;
      a.mv = null;
      return true;
    }
    return false;
  }

  function tryMovePlayer(dir) {
    // Reject non-direction actions before looking up or changing movement.
    if (!Object.prototype.hasOwnProperty.call(DIRS, dir)) return;
    const p = W.player;
    if (p.mv) return;
    const [dx, dy] = DIRS[dir];
    const nx = p.x + dx, ny = p.y + dy;
    if (p.dir !== dir && !W.path) {
      p.dir = dir;
      W.turnHold = 70;
      return;
    }
    if (W.turnHold > 0) return;
    p.dir = dir;
    if (blocked(nx, ny, { except: p, ignorePlayer: true })) {
      // a way on set in a wall (a door in a cliff): walking into it is using it, as stepping onto stairs is
      const wx = RB.maps.exitAt(W.map, nx, ny);
      if (wx && wx.scene) { W.path = null; useExit(wx, false); return; }
      if (!W.bumpT || W.time - W.bumpT > 300) { RB.audio && RB.audio.sfx('bump'); W.bumpT = W.time; }
      W.path = null;
      return;
    }
    const tool = s().equip.tool && RB.content.items[s().equip.tool];
    const quick = tool && tool.effect && tool.effect.walk ? 0.88 : 1;
    // at sea (src/engine/72v_sail.js) a step takes what the wind and the sail make of it
    const dur = W.map.def.sea && RB.sail ? RB.sail.stepDur(dir) : Math.round((RB.input.running() || (W.path && W.path.length > 4) ? 105 : 160) * quick);
    // companion takes the player's old tile
    if (W.comp) {
      const c = W.comp;
      const from = [p.x, p.y];
      if (!(c.x === from[0] && c.y === from[1])) {
        const ddx = from[0] - c.x, ddy = from[1] - c.y;
        const cd = Math.abs(ddx) + Math.abs(ddy);
        if (cd === 1) startMove(c, ddx > 0 ? 'right' : ddx < 0 ? 'left' : ddy > 0 ? 'down' : 'up', dur);
        else { c.x = from[0]; c.y = from[1]; c.fx = c.x; c.fy = c.y; c.mv = null; }
      } else if (nx === c.x && ny === c.y) {
        // swapping places with companion
      }
    }
    startMove(p, dir, dur);
    const t = RB.maps.tileAt(W.map, nx, ny);
    RB.audio && RB.audio.sfx((t && t.step) || 'step', { vol: 0.5 });
  }

  function arrive() {
    const p = W.player;
    const st = s();
    st.x = p.x; st.y = p.y; st.dir = p.dir;
    // a step at sea: the voyage goes on (its situations, the ports' water)
    if (W.map.def.sea && RB.sail) { W.path = W.path && W.path.length ? W.path : null; RB.sail.onStep(); return; }
    const ex = RB.maps.exitAt(W.map, p.x, p.y);
    if (ex) {
      // a map can hold you while a story moment lasts (e.g. a night that only
      // this map has): map.def.hold = [{ if, scene, except: [map ids], doors }]
      const hold = (W.map.def.hold || []).find((h) => RB.state.test(st, h.if) && !(h.except || []).includes(ex.to) && (h.doors || !ex.door));
      if (hold || (ex.locked && (!ex.unlock || !RB.state.test(st, ex.unlock)))) {
        W.path = null;
        // step back and explain
        const back = DIRS[OPP[p.dir]];
        p.x += back[0]; p.y += back[1]; p.fx = p.x; p.fy = p.y;
        st.x = p.x; st.y = p.y;
        RB.script.run(hold ? hold.scene : ex.locked);
        return;
      }
      W.path = null;
      if (ex.scene) { useExit(ex, true); return; }
      RB.game.transition(ex.to, ex.tx, ex.ty, ex.dir || p.dir, { sp: ex.sp });
      return;
    }
    for (const tr of W.map.triggers) {
      if (p.x >= tr.x && p.x < tr.x + tr.w && p.y >= tr.y && p.y < tr.y + tr.h) {
        if (tr.if && !RB.state.test(st, tr.if)) continue;
        const onceKey = 'trig:' + W.map.id + ':' + (tr.id || tr.x + ',' + tr.y);
        if (tr.once && st.flags[onceKey]) continue;
        if (tr.once) st.flags[onceKey] = true;
        W.path = null;
        RB.script.run(tr.scene, { trigger: tr });
        return;
      }
    }
    if (W.path && W.path.length === 0) {
      const pt = W.pathTarget && W.pathTarget.path === W.path ? W.pathTarget : null;
      W.path = null;
      W.pathTarget = null;
      if (pt) arriveAt(pt);
    }
  }
  // An exit that is a scene (MW-1, Robin: a travel tile is walked onto, never only used): stairs, a ladder or a door
  // whose way on asks first, explains why it is shut, or tells you something on the way. Stepping onto it, or walking
  // into it when it is set in a wall, plays the same scene that using the thing plays. You are back off it first, as at
  // a locked door; the scene moves you on (!warp) or leaves you where you stood.
  function useExit(ex, stepped) {
    const p = W.player, st = s();
    if (stepped) {
      const back = DIRS[OPP[p.dir]];
      p.x += back[0]; p.y += back[1]; p.fx = p.x; p.fy = p.y;
      st.x = p.x; st.y = p.y;
    }
    if (ex.locked && (!ex.unlock || !RB.state.test(st, ex.unlock))) { RB.script.run(ex.locked); return; }
    RB.script.run(ex.scene, { exit: ex, prop: propAt(ex.x, ex.y) || undefined });
  }
  function faceTo(a, x, y) {
    a.glanceFrom = null; a.glanceT = 6000 + wrand() * 6000;
    const dx = x - a.x, dy = y - a.y;
    if (Math.abs(dx) > Math.abs(dy)) a.dir = dx > 0 ? 'right' : 'left';
    else if (dy) a.dir = dy > 0 ? 'down' : 'up';
  }

  function update(dt, controllable) {
    W.time += dt;
    if (!W.map) return;
    const p = W.player;
    if (W.turnHold > 0) W.turnHold -= dt;
    if (stepActor(p, dt)) arrive();
    if (W.comp) stepActor(W.comp, dt);
    if (controllable && !p.mv && RB.game.mode() === 'world') {
      const d = RB.input.dir();
      if (d) {
        W.path = null;
        W.pathTarget = null;
        tryMovePlayer(d);
      } else if (W.path && W.path.length) {
        const [nx, ny] = W.path[0];
        const dx = nx - p.x, dy = ny - p.y;
        const dir = dx > 0 ? 'right' : dx < 0 ? 'left' : dy > 0 ? 'down' : 'up';
        if (Math.abs(dx) + Math.abs(dy) !== 1) W.path = null;
        else {
          p.dir = dir;
          W.turnHold = 0;
          W.path.shift();
          tryMovePlayer(dir);
        }
      } else {
        W.turnHold = 0;
      }
    }
    updateWalkers(dt);
    sighted(dt);
    // NPC routines
    for (const n of W.npcs) {
      stepActor(n, dt);
      n.blinkT -= dt;
      if (n.blinkT < -140) n.blinkT = 2500 + wrand() * 3000;
      if (n.route) continue;
      // standing still, people live by their mannerism profile (resting stance, habits, occupation
      // idles, a word with a neighbour, glances at what they witness): RB.staging.tick below, which
      // replaced the random glance to one side; an old glance in progress is put back
      if (n.glanceFrom) { n.dir = n.glanceFrom; n.glanceFrom = null; }
      const wander = n.def.wander;
      if (!wander || n.mv || RB.game.mode() !== 'world') continue;
      // someone at their work stays at it (67_worldacts.js, 67a_perform.js); the round resumes when it ends
      if ((RB.worldActs && RB.worldActs.working(n)) || (RB.perform && RB.perform.working(n))) continue;
      // a wanderer pauses on their round (a route habit playing, or a scene that owns them)
      if (RB.staging && RB.staging.wanderPause(n)) continue;
      const rnd = (k) => (RB.staging ? RB.staging.rand(n, k) : wrand());
      n.wt = (n.wt || 1500 + rnd('wt0') * 2500) - dt;
      if (n.wt > 0) continue;
      n.wt = 1800 + rnd('wt') * 3500;
      const dirs = Object.keys(DIRS);
      const d = dirs[Math.floor(rnd('wd') * 4)];
      const [dx, dy] = DIRS[d];
      const nx = n.x + dx, ny = n.y + dy;
      // (at the edge of their round, or with the way blocked, they turn: and now and then pause there)
      if (Math.abs(nx - n.home[0]) > wander || Math.abs(ny - n.home[1]) > wander) { n.dir = d; if (RB.staging) RB.staging.stepped(n); continue; }
      if (blocked(nx, ny, { except: n }) || RB.maps.exitAt(W.map, nx, ny) || triggerAt(nx, ny)) { n.dir = d; if (RB.staging) RB.staging.stepped(n); continue; }
      if (W.comp && ((W.comp.x === nx && W.comp.y === ny) || (W.comp.mv && W.comp.mv.tx === nx && W.comp.mv.ty === ny))) continue;
      if (Math.abs(nx - p.x) + Math.abs(ny - p.y) < 2) continue; // don't crowd the player
      startMove(n, d, 320);
      if (RB.staging) RB.staging.stepped(n); // now and then a pause after the step (a look round, a stretch)
    }
    if (RB.staging) RB.staging.tick(dt); // idle life, social ambience, reactions, the companion's presence
    const quiet = atMechanism();
    for (const f of W.foes) {
      stepActor(f, dt);
      const calm = calmNow(f);
      const pat = f.def.patrol;
      if (!pat || f.mv || RB.game.mode() !== 'world') continue;
      if (quiet) continue; // working a mechanism: the creatures keep still (W9–W17 "quiet puzzle spaces")
      f.wt = (f.wt || 900) - dt;
      if (f.wt > 0) continue;
      f.wt = 700 + wrand() * 900;
      const d = Object.keys(DIRS)[Math.floor(wrand() * 4)];
      const [dx, dy] = DIRS[d];
      const nx = f.x + dx, ny = f.y + dy;
      if (Math.abs(nx - f.home[0]) > pat || Math.abs(ny - f.home[1]) > pat) continue;
      if (blocked(nx, ny, { except: f }) || RB.maps.exitAt(W.map, nx, ny)) continue;
      if (W.comp && W.comp.x === nx && W.comp.y === ny) continue;
      if (calm && nearPlayer(nx, ny)) continue; // a calm creature keeps its distance
      startMove(f, d, 380);
    }
    W.emotes = W.emotes.filter((e) => e.until > W.time);
    if (RB.petWorld) RB.petWorld.update(dt); // the cosmetic pet follows (src/engine/57_petworld.js; never solid)
  }
  function triggerAt(x, y) {
    return W.map.triggers.some((t) => x >= t.x && x < t.x + t.w && y >= t.y && y < t.y + t.h);
  }

  // ---- interaction -------------------------------------------------------------
  function frontTile() {
    const p = W.player;
    const [dx, dy] = DIRS[p.dir];
    return [p.x + dx, p.y + dy];
  }
  // Interactable prop at a tile (one with a scene or text); with `any`, any
  // visible prop there (used to talk across counters that have no scene).
  function propAt(x, y, any) {
    const st = s();
    let best = null;
    for (const pr of W.map.props) {
      if (pr.auto && !pr.text && !pr.scene && !any) continue;
      if (pr.if && !RB.state.test(st, pr.if)) continue;
      const pd = RB.props.P[pr.p];
      const pw = pr.w || (pd && pd.w) || 1, ph = pr.h || (pd && pd.h) || 1;
      if (x >= pr.x && x < pr.x + pw && y >= pr.y && y < pr.y + ph && (any || pr.text || pr.scene)) best = pr;
    }
    return best;
  }
  function talkTo(n) {
    const st = s();
    const def = n.def;
    let scene = null, chosen = null;
    if (typeof def.talk === 'string') scene = def.talk;
    else if (Array.isArray(def.talk)) {
      for (const opt of def.talk) if (!opt.if || RB.state.test(st, opt.if)) { scene = opt.scene; chosen = opt; break; }
    }
    if (!scene) return false;
    if (!def.noFace) faceTo(n, W.player.x, W.player.y);
    // a routine's place (LW-03): its own first line, once, then what they would say anywhere (the usual_talk hook);
    // talk from before the routine began is replaced there by that line, said again (RB.town.pastTalk)
    const slot = def.slotScene && RB.content.scenes[def.slotScene] ? def.slotScene : null;
    if (slot && !st.seen[slot]) { RB.script.run(slot, { npc: n.id }); return true; }
    if (slot && chosen && RB.town && RB.town.pastTalk(st, def.char || n.id, chosen)) scene = slot;
    // someone who can be asked after others (W3): talk, or "Have you seen…?". Something new to say (a scene not yet
    // heard: the story's next step, a quest's) is said at once, never behind the question (LW-04)
    if (def.asks && RB.town && RB.whereabouts && RB.state.test(st, 'seen.' + scene)) { RB.whereabouts.ask(n, scene); return true; }
    RB.script.run(scene, { npc: n.id });
    return true;
  }
  const SHUT = { jp: '{戸|と} は {閉|し}まって いる 。 {誰|だれ} も {出|で}て こない 。', en: 'The door is shut. Nobody comes to it.' };
  // What a shut door or a marked object says is a narrator's line like any other (Robin, 2026-10-19): shown under its
  // own scene id, so its recording is found, and listed for recording (RB.content.spokenSources, read by
  // tools/voice/lines.mjs)
  const DOOR_SCENE = 'code.door', PROP_SCENE = 'code.prop';
  RB.content.spokenSources = RB.content.spokenSources || [];
  RB.content.spokenSources.push(() => {
    const out = [{ scene: DOOR_SCENE, who: 'narr', jp: SHUT.jp, en: SHUT.en, file: 'engine/50_world' }];
    for (const id in RB.content.maps || {}) {
      const m = RB.maps.compile(id);
      for (const d of m.shut || []) if (d.text && d.text.jp) out.push({ scene: DOOR_SCENE, who: 'narr', jp: d.text.jp, en: d.text.en, file: 'map ' + id });
      for (const p of m.props || []) if (!p.scene && p.text && p.text.jp) out.push({ scene: PROP_SCENE, who: p.who || 'narr', jp: p.text.jp, en: p.text.en, file: 'map ' + id });
    }
    return out;
  });
  function interact() {
    if (W.player.mv) return;
    const [fx, fy] = frontTile();
    const n = actorAt(fx, fy);
    if (n && n.foe) { startFoe(n); return; }
    if (n && talkTo(n)) return;
    // talk across a counter
    const pr = propAt(fx, fy);
    const cpr = pr || propAt(fx, fy, true);
    if (cpr && (cpr.p === 'counter' || cpr.across)) {
      const [dx, dy] = DIRS[W.player.dir];
      const n2 = actorAt(fx + dx, fy + dy);
      if (n2 && talkTo(n2)) return;
    }
    if (pr) {
      if (RB.staging) RB.staging.examined(fx, fy); // those who saw it may look at it afterwards
      if (pr.scene) RB.script.run(pr.scene, { prop: pr });
      else if (pr.text) RB.script.runInline([{ who: pr.who || 'narr', jp: pr.text.jp, en: pr.text.en, sceneId: PROP_SCENE }]);
      return;
    }
    // a building you cannot go into: its door is shut, and says so
    const door = RB.maps.shutDoorAt(W.map, fx, fy);
    if (door && W.player.dir === 'up') {
      const t = door.text || SHUT;
      RB.script.runInline([{ who: 'narr', jp: t.jp, en: t.en, sceneId: DOOR_SCENE }]);
      return;
    }
    // companion: talking to your companion gives contextual banter
    if (W.comp && W.comp.x === fx && W.comp.y === fy) {
      RB.game.companionTalk();
      return;
    }
  }
  // What interact() would do now, without doing it: {kind, label} or null.
  // Used to label the touch Action button; mirrors interact()'s order.
  const READ_PROP = /sign|board|notice|plaque|poster|letter|book|stone|marker|post|shrine|memorial|tablet|scroll|map|page|note/;
  function talkable(n) {
    const def = n.def;
    if (typeof def.talk === 'string') return true;
    if (Array.isArray(def.talk)) return def.talk.some((opt) => !opt.if || RB.state.test(s(), opt.if));
    return false;
  }
  function frontAction() {
    if (!W.map) return null;
    const [fx, fy] = frontTile();
    const n = actorAt(fx, fy);
    if (n && n.foe) return { kind: 'foe', label: 'Face' };
    if (n && talkable(n)) return { kind: 'talk', label: 'Talk' };
    const pr = propAt(fx, fy);
    const cpr = pr || propAt(fx, fy, true);
    if (cpr && (cpr.p === 'counter' || cpr.across)) {
      const [dx, dy] = DIRS[W.player.dir];
      const n2 = actorAt(fx + dx, fy + dy);
      if (n2 && talkable(n2)) return { kind: 'talk', label: 'Talk' };
    }
    if (pr) return { kind: 'prop', label: !pr.scene && READ_PROP.test(pr.p) ? 'Read' : 'Look' };
    if (W.player.dir === 'up' && RB.maps.shutDoorAt(W.map, fx, fy)) return { kind: 'door', label: 'Look' };
    if (W.comp && W.comp.x === fx && W.comp.y === fy) return { kind: 'companion', label: 'Chat' };
    return null;
  }
  // ---- creatures and battles --------------------------------------------------------
  // One battle at a time, and only from free exploration: a creature engages (you face it, or
  // it walks into you) only while nothing else is up — no line, scene, menu, map change, or
  // battle still open or closing — and not in the moment after a battle ends. (Contact used to
  // be checked against the mode from before the frame's step, so a step that opened a scene, a
  // map change or a battle could start a battle under it, or a second one.)
  const HUSH_MS = 1000;       // after any battle, no creature engages for this long
  const CALM_MS = 5000;       // one you stepped back from stays calm at least this long...
  function hush(ms) { W.quietUntil = Math.max(W.quietUntil, W.time + (ms == null ? HUSH_MS : ms)); }
  function canEngage() {
    return !!W.map && RB.game.mode() === 'world' && !RB.game.inBattle() && W.time >= W.quietUntil;
  }
  // within one step of the player (either of you may be mid-step)
  function nearPlayer(x, y) {
    const p = W.player;
    const d = (px, py) => Math.abs(x - px) + Math.abs(y - py) <= 1;
    return d(p.x, p.y) || (p.mv ? d(p.mv.tx, p.mv.ty) : false);
  }
  function touching(f) { return nearPlayer(f.x, f.y) || (f.mv ? nearPlayer(f.mv.tx, f.mv.ty) : false); }
  // ...and for as long as you are still touching it (or standing on it): you can always walk away.
  function calmNow(f) {
    const c = W.calm[f.id];
    if (!c) return false;
    if (W.time < c.until || touching(f)) return true;
    delete W.calm[f.id];
    return false;
  }
  // After you step back from a creature (or wake from a lost battle), while the screen is still
  // dark: it backs off a step if it can, and stays calm — it does not walk into you again.
  function calmFoe(f) {
    if (!W.foes.includes(f)) return;
    W.calm[f.id] = { until: W.time + CALM_MS };
    if (f.mv) { f.x = f.mv.tx; f.y = f.mv.ty; f.mv = null; }
    const p = W.player, far = (x, y) => Math.abs(x - p.x) + Math.abs(y - p.y);
    let best = null, bd = far(f.x, f.y);
    for (const d in DIRS) {
      const nx = f.x + DIRS[d][0], ny = f.y + DIRS[d][1];
      if (nx < 0 || ny < 0 || nx >= W.map.w || ny >= W.map.h) continue;
      if (blocked(nx, ny, { except: f }) || RB.maps.exitAt(W.map, nx, ny) || triggerAt(nx, ny)) continue;
      if (W.comp && W.comp.x === nx && W.comp.y === ny) continue;
      if (far(nx, ny) > bd) { best = [nx, ny]; bd = far(nx, ny); }
    }
    if (best) { f.x = best[0]; f.y = best[1]; }
    f.fx = f.x; f.fy = f.y; f.frame = 0;
    f.wt = 1200 + wrand() * 800;
  }
  function startFoe(f) {
    if (!canEngage()) return false;
    const e = f.def;
    W.path = null; W.pathTarget = null;
    RB.game.startBattle(e.enemy, {
      foeKey: 'foe:' + W.map.id + ':' + e.id,
      onWin: e.onWin, scene: e.scene,
      where: { map: W.map.id, x: f.x, y: f.y }, place: e,
      closing: (res) => { if (res === 'flee' || res === 'lose') calmFoe(f); },
    });
    return true;
  }
  // "Quiet puzzle spaces" (docs/future/plan/06_WORLD.md W9–W17): while you stand at a mechanism (an exploration
  // action's prop or mark, or a prop content marks `mech: true`: the locks' cranks and tablets, the
  // vents' valves, the Understage's machines, the root arches), within two tiles of it, the map's creatures keep
  // still and none walks into you. You can still go to them.
  function atMechanism() {
    const p = W.player, st = s();
    if (!W.map || !st) return false;
    for (const pr of W.map.props) {
      if (!(pr.mech || pr.scene === 'vb.open' || pr.scene === 'vb.mark')) continue;
      if (pr.if && !RB.state.test(st, pr.if)) continue;
      if (Math.max(Math.abs(pr.x - p.x), Math.abs(pr.y - p.y)) <= 2) return true;
    }
    return false;
  }
  // Foes that walk into the player start a battle too (they are visible and avoidable).
  function checkFoeContact() {
    const p = W.player;
    if (!W.map || p.mv || !canEngage()) return false;
    if (atMechanism()) return false;
    for (const f of W.foes) {
      if (f.mv || !f.def.aggro || calmNow(f)) continue;
      if (Math.abs(f.x - p.x) + Math.abs(f.y - p.y) === 1) return startFoe(f);
    }
    return false;
  }

  // ---- tap to move -------------------------------------------------------------
  function bfs(tx, ty, allowAdjacent) {
    return bfsGoal((x, y) => (x === tx && y === ty) || (allowAdjacent && Math.abs(x - tx) + Math.abs(y - ty) === 1), tx, ty);
  }
  function bfsGoal(goal, tx, ty) {
    const p = W.player;
    const m = W.map;
    const start = p.x + ',' + p.y;
    const prev = new Map([[start, null]]);
    const q = [[p.x, p.y]];
    let found = null;
    while (q.length) {
      const [x, y] = q.shift();
      if (goal(x, y)) { found = [x, y]; break; }
      for (const d in DIRS) {
        const nx = x + DIRS[d][0], ny = y + DIRS[d][1];
        const k = nx + ',' + ny;
        if (prev.has(k)) continue;
        if (nx < 0 || ny < 0 || nx >= m.w || ny >= m.h) continue;
        if (blocked(nx, ny, { except: p, ignorePlayer: true })) continue;
        // don't path through exits unless it is the destination
        if (RB.maps.exitAt(m, nx, ny) && !(nx === tx && ny === ty)) continue;
        prev.set(k, [x, y]);
        q.push([nx, ny]);
      }
      if (prev.size > 6000) break;
    }
    if (!found) return null;
    const path = [];
    let cur = found;
    while (cur && !(cur[0] === p.x && cur[1] === p.y)) {
      path.unshift(cur);
      cur = prev.get(cur[0] + ',' + cur[1]);
    }
    return path;
  }
  // A tap on something you can interact with (a person, an interactive prop, your companion)
  // walks to a free tile beside it (any tile of a larger prop), faces it and does what the
  // action key would do there, exactly once. The target is remembered by identity and checked
  // again on arrival: gone, moved away or no longer shown means nothing happens. A tap on an
  // interactive prop you are standing on steps off it first. A new tap, a direction key, a
  // scene, a battle or a map change drops the queued interaction (the path it belonged to ends).
  function tapTargetAt(tx, ty) {
    const n = actorAt(tx, ty);
    if (n) return { kind: 'actor', ref: n };
    const pr = propAt(tx, ty);
    const cpr = pr || propAt(tx, ty, true);
    if (pr || (cpr && (cpr.p === 'counter' || cpr.across))) return { kind: 'prop', ref: pr || cpr };
    if (W.comp && W.comp.x === tx && W.comp.y === ty) return { kind: 'comp', ref: W.comp };
    return null;
  }
  function tilesOf(t) {
    if (t.kind !== 'prop') return [[t.ref.x, t.ref.y]];
    const pd = RB.props.P[t.ref.p];
    const w = t.ref.w || (pd && pd.w) || 1, h = t.ref.h || (pd && pd.h) || 1;
    const out = [];
    for (let x = t.ref.x; x < t.ref.x + w; x++) for (let y = t.ref.y; y < t.ref.y + h; y++) out.push([x, y]);
    return out;
  }
  function stillThere(t) {
    if (!W.map) return false;
    if (t.kind === 'actor') return W.npcs.includes(t.ref) || W.extras.includes(t.ref) || W.foes.includes(t.ref);
    if (t.kind === 'prop') return W.map.props.includes(t.ref) && (!t.ref.if || RB.state.test(s(), t.ref.if));
    return W.comp === t.ref;
  }
  const beside = (tiles, x, y) => tiles.find(([a, b]) => Math.abs(a - x) + Math.abs(b - y) === 1);
  function arriveAt(pt) {
    const p = W.player;
    if (pt.across) { arriveAcross(pt.across); return; }
    if (pt.tile) { faceTo(p, pt.tile[0], pt.tile[1]); interact(); return; }
    if (!stillThere(pt.target)) return;
    const t = beside(tilesOf(pt.target), p.x, p.y);
    if (!t) return; // it moved away while you walked
    if (pt.only && actorAt(t[0], t[1]) !== pt.only) return; // (a retry from across a counter: that person, nobody else)
    faceTo(p, t[0], t[1]);
    interact();
  }
  // a tap inside the drawn top of a tall interactive thing whose footprint is the tile below (a lantern's lamp; its
  // prop's top/topW, 25_props.js): that thing. The rest of the tile, around and above the picture, is ground as before.
  function tallTopAt(tx, ty, at) {
    if (!at) return null;
    const pr = propAt(tx, ty + 1);
    const pd = pr && RB.props.P[pr.p];
    if (!pd || !pd.top || pr.y !== ty + 1) return null;
    const w = pr.w || pd.w || 1, u = (tx - pr.x + at.fx) / w, half = (pd.topW || 1) / 2;
    return u >= 0.5 - half && u <= 0.5 + half && at.fy >= 1 - pd.top ? pr : null;
  }
  function tapTile(tx, ty, at) {
    if (!W.map || RB.game.mode() !== 'world') return;
    const p = W.player;
    W.pathTarget = null;
    let target = tapTargetAt(tx, ty);
    if (!target) { const tall = tallTopAt(tx, ty, at); if (tall) target = { kind: 'prop', ref: tall }; }
    const solid = blocked(tx, ty, { except: p, ignorePlayer: true });
    if (!target) {
      if (tx === p.x && ty === p.y) return;
      // a solid tile next to you (a shut door, a wall): the action key's answer
      if (solid && Math.abs(tx - p.x) + Math.abs(ty - p.y) === 1) { faceTo(p, tx, ty); interact(); return; }
      const path = bfs(tx, ty, solid);
      if (!path) return;
      W.path = path;
      W.pathTarget = solid ? { tile: [tx, ty], path } : null;
      return;
    }
    const tiles = tilesOf(target);
    const on = tiles.some(([x, y]) => x === p.x && y === p.y);
    const near = !on && beside(tiles, p.x, p.y);
    if (near) { faceTo(p, near[0], near[1]); interact(); return; }
    const path = on ? stepOff(tiles) : bfsGoal((x, y) => !tiles.some(([a, b]) => a === x && b === y) && !!beside(tiles, x, y));
    if (!path && target.kind === 'actor') { talkAcross(target, 0); return; }
    if (!path) return;
    W.path = path;
    W.pathTarget = { target, path };
  }
  // Someone behind a counter with no free place beside them (Yae at Yukimiya's counter): go to the place in front of
  // the counter, face it, and talk across it as the action key does (interact); Agnes, RBN-QA-036. The walk remembers
  // whom it is for, where they stood, the counter and the place to stand; on arrival all of that is checked again
  // (arriveAcross), so a person who has gone, moved or been replaced, or a counter that has changed, is never mistaken
  // for the one tapped.
  function talkAcross(target, tries) {
    const p = W.player, n = target.ref, spots = acrossSpots(n);
    const here = spots.find((sp) => sp.at[0] === p.x && sp.at[1] === p.y);
    if (here) { if (actorAt(n.x, n.y) === n) { faceTo(p, here.counter[0], here.counter[1]); interact(); } return; }
    const way = spots.length ? bfsGoal((x, y) => spots.some((sp) => sp.at[0] === x && sp.at[1] === y)) : null;
    if (!way || !way.length) return;
    const end = way[way.length - 1], sp = spots.find((q) => q.at[0] === end[0] && q.at[1] === end[1]);
    W.path = way;
    W.pathTarget = { across: { target, pos: [n.x, n.y], counter: sp.counter, prop: sp.prop, at: sp.at, tries }, path: way };
  }
  function arriveAcross(a) {
    const p = W.player, n = a.target.ref;
    const counter = propAt(a.counter[0], a.counter[1], true);
    const same = stillThere(a.target) && n.x === a.pos[0] && n.y === a.pos[1] && !n.mv && actorAt(a.pos[0], a.pos[1]) === n &&
      counter === a.prop && (counter.p === 'counter' || counter.across) && p.x === a.at[0] && p.y === a.at[1];
    if (same) { faceTo(p, a.counter[0], a.counter[1]); interact(); return; }
    // the one retry (Agnes and Local, REFINE of 9a7bc73): the same person, still here, who has moved while you walked,
    // once more from where they are now. Anything else that changed (the counter replaced or taken away while they
    // stood still, someone else in their place, a retry already spent): nothing happens.
    const moved = stillThere(a.target) && (n.x !== a.pos[0] || n.y !== a.pos[1]);
    if (!moved || a.tries >= 1) return;
    const tiles = tilesOf(a.target), near = beside(tiles, p.x, p.y);
    if (near) { if (actorAt(near[0], near[1]) === n) { faceTo(p, near[0], near[1]); interact(); } return; }
    const path = bfsGoal((x, y) => !tiles.some(([tx, ty]) => tx === x && ty === y) && !!beside(tiles, x, y));
    if (path && path.length) { W.path = path; W.pathTarget = { target: a.target, path, only: n }; return; }
    talkAcross(a.target, a.tries + 1);
  }
  // the places a person can be talked to across a counter: a counter (or an `across` prop) beside them, and its free
  // far side
  function acrossSpots(n) {
    const out = [];
    for (const d in DIRS) {
      const [dx, dy] = DIRS[d];
      const cx = n.x + dx, cy = n.y + dy, c = propAt(cx, cy, true);
      if (!c || !(c.p === 'counter' || c.across)) continue;
      const ax = cx + dx, ay = cy + dy;
      if (ax < 0 || ay < 0 || ax >= W.map.w || ay >= W.map.h || blocked(ax, ay, { except: W.player, ignorePlayer: true })) continue;
      out.push({ at: [ax, ay], counter: [cx, cy], prop: c });
    }
    return out;
  }
  // standing on a nonblocking interactive prop: the nearest free tile beside you that is not
  // part of it (the one behind you first, so you turn round to face it)
  function stepOff(tiles) {
    const p = W.player;
    const order = [OPP[p.dir], p.dir, 'left', 'right', 'up', 'down'];
    for (const d of order) {
      if (!d || !DIRS[d]) continue;
      const nx = p.x + DIRS[d][0], ny = p.y + DIRS[d][1];
      if (tiles.some(([a, b]) => a === nx && b === ny)) continue;
      if (nx < 0 || ny < 0 || nx >= W.map.w || ny >= W.map.h) continue;
      if (blocked(nx, ny, { except: p, ignorePlayer: true }) || RB.maps.exitAt(W.map, nx, ny)) continue;
      return [[nx, ny]];
    }
    return null;
  }

  function emote(who, kind, ms) {
    W.emotes.push({ who, kind, until: W.time + (ms || 1400) });
  }
  function actorById(id) {
    if (id === 'pc' || id === 'player') return W.player;
    if (id === 'comp' || (W.comp && W.comp.id === id)) return W.comp;
    return W.npcs.find((n) => n.id === id) || W.extras.find((n) => n.id === id) || null;
  }
  // Scripted walking (cutscenes): moves an actor tile by tile, ignoring NPC blocking.
  // o.party (a scene's own `!move pc`, 70_script.js): your companion comes along, as on any walk of yours,
  // with staging on or off. If they stand where you are going, they first step aside onto open ground (across
  // the way you walk); then they follow a step behind over the tiles you leave. A companion the scene is
  // directing (staging owns them) stays where the scene put them; the scene's end walks them back to your side
  // (52_staging.js playerMoved). Staging's own walks (!walkto) call this without o.party.
  function scriptMove(id, dir, n, dur, o) {
    const a = actorById(id);
    if (!a) return Promise.resolve();
    // a scripted move takes over from a walk-in: finish it where it was going
    if (a.route) { const end = a.route[a.route.length - 1] || [a.x, a.y]; a.x = end[0]; a.y = end[1]; a.fx = a.x; a.fy = a.y; a.mv = null; a.route = null; a.alpha = 1; a.fadeIn = false; }
    const you = !!(o && o.party && a === W.player);
    if (you && RB.staging && RB.staging.playerMoved) RB.staging.playerMoved();
    const c = you && W.comp && !W.comp.route && DIRS[dir] && !(RB.staging && RB.staging.owned(W.comp)) ? W.comp : null;
    const trail = []; // the tiles you have left, in order (your companion follows over them)
    return (c ? makeRoom(c, a, dir, n, dur) : Promise.resolve(false)).then((aside) => new Promise((res) => {
      let left = n, followed = false;
      const go = () => {
        if (c && follow(c, a, trail, dur)) followed = true;
        if (left <= 0) {
          if (!c) { res(); return; }
          catchUp(c, a, trail, dur).then((m) => { if (aside && !followed && !m) faceTo(c, a.x, a.y); res(); });
          return;
        }
        left--;
        trail.push([a.x, a.y]);
        startMove(a, dir, dur || 220);
        const wait = () => (a.mv ? setTimeout(wait, 16) : go());
        setTimeout(wait, 16);
      };
      go();
    }));
  }
  // (scriptMove, o.party) until the companion's step in progress ends (bounded)
  function stepDone(c) {
    const t0 = performance.now();
    return new Promise((res) => { const w = () => (c.mv && performance.now() - t0 < 2000 ? setTimeout(w, 16) : res()); w(); });
  }
  // (scriptMove, o.party) your companion stands on a tile you are about to walk onto: they step aside first,
  // across the way you walk (above or below a walk left or right, right or left of a walk up or down), onto open
  // ground that is not a way out, a trigger or anyone's place; true if they did. With no room they stay (as before).
  function makeRoom(c, a, dir, n, dur) {
    const [dx, dy] = DIRS[dir];
    const onPath = (x, y) => { for (let i = 1; i <= n; i++) if (a.x + dx * i === x && a.y + dy * i === y) return true; return false; };
    return stepDone(c).then(() => {
      if (!onPath(c.x, c.y)) return false;
      for (const [sx, sy] of dx ? [[0, -1], [0, 1]] : [[1, 0], [-1, 0]]) {
        const tx = c.x + sx, ty = c.y + sy;
        if (tx < 0 || ty < 0 || tx >= W.map.w || ty >= W.map.h || RB.maps.blockedStatic(W.map, tx, ty) || RB.maps.exitAt(W.map, tx, ty) || triggerAt(tx, ty) || personAt(tx, ty, c)) continue;
        startMove(c, sx > 0 ? 'right' : sx < 0 ? 'left' : sy > 0 ? 'down' : 'up', dur || 220);
        return stepDone(c).then(() => true);
      }
      return false;
    });
  }
  // (scriptMove, o.party) your companion steps onto the furthest tile you have left that is next to them (one
  // step; never one you stand on or are stepping onto); true if they set off
  function follow(c, a, trail, dur) {
    if (c.mv) return false;
    for (let i = trail.length - 1; i >= 0; i--) {
      const [tx, ty] = trail[i];
      if (Math.abs(tx - c.x) + Math.abs(ty - c.y) > 1) continue;
      trail.splice(0, i + 1);
      if ((tx === c.x && ty === c.y) || (tx === a.x && ty === a.y) || (a.mv && a.mv.tx === tx && a.mv.ty === ty)) return false;
      startMove(c, tx > c.x ? 'right' : tx < c.x ? 'left' : ty > c.y ? 'down' : 'up', dur || 220);
      return true;
    }
    return false;
  }
  // (scriptMove, o.party) after your last step: your companion finishes following you (true if they stepped)
  function catchUp(c, a, trail, dur) {
    let moved = false;
    const step = () => stepDone(c).then(() => (follow(c, a, trail, dur) ? ((moved = true), step()) : moved));
    return step();
  }

  return {
    W, DIRS, enter, update, interact, tapTile, refreshActors, arrivals, departures, placeCompanion, companionHere, emote, actorById, scriptMove, ensureSpeaker, whenArrived, dismissExtras,
    frontTile, frontAction, checkFoeContact, hush, faceTo, unstick, blocked, _tryMove: tryMovePlayer,
    towards, linksOf, mapsWith, // map-link search (also used by quest guidance, 56_questguide.js)
    musicFor, // the map's song now (also used to restore it after a battle, 80_combat.js)
    routeOut, peopleTiles, personAt, // routes and who is in the way (tests/e2e/walk_round.mjs)
  };
})();
