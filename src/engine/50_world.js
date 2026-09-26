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
  };

  function makeActor(x, y, dir, look) {
    return { x, y, fx: x, fy: y, dir: dir || 'down', look, mv: null, frame: 0, stepToggle: 0, blinkT: Math.random() * 4000 };
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
    refreshActors();
    placeCompanion();
    unstick(W.player);
    if (m.def.music && RB.audio) RB.audio.playSong(typeof m.def.music === 'function' ? m.def.music(st) : pickMusic(m.def.music, st));
    RB.render.invalidate();
    RB.bus.emit('map:enter', { id: mapId });
  }
  function pickMusic(music, st) {
    if (typeof music === 'string') return music;
    for (const m of music) if (!m.if || RB.state.test(st, m.if)) return m.id;
    return null;
  }
  function playerLook() {
    const p = s().player;
    const look = Object.assign({}, p.look);
    if (s().equip.cosmetic && RB.content.items[s().equip.cosmetic] && RB.content.items[s().equip.cosmetic].acc) {
      look.acc = (look.acc || []).concat([RB.content.items[s().equip.cosmetic].acc]);
    }
    return look;
  }
  function partyCompanion() {
    const st = s();
    return st.comp || null;
  }
  function placeCompanion() {
    const cid = partyCompanion();
    if (!cid || (W.map.def.noCompanion && !RB.state.test(s(), W.map.def.noCompanion === true ? 'false' : W.map.def.noCompanion))) {
      W.comp = null;
      return;
    }
    const ch = RB.content.chars[cid];
    const p = W.player;
    const back = DIRS[OPP[p.dir]];
    let cx = p.x + back[0], cy = p.y + back[1];
    if (blocked(cx, cy, { ignoreComp: true }) || RB.maps.exitAt(W.map, cx, cy)) { cx = p.x; cy = p.y; }
    W.comp = makeActor(cx, cy, p.dir, ch.look);
    W.comp.id = cid;
    W.trail = [];
  }
  function refreshActors() {
    const st = s();
    const m = W.map;
    const keep = new Map(W.npcs.map((n) => [n.id, n]));
    W.npcs = [];
    for (const n of m.def.npcs || []) {
      if (n.if && !RB.state.test(st, n.if)) continue;
      if (st.comp && n.id === st.comp && !n.alwaysShow) continue; // companion travels with the player
      const ch = RB.content.chars[n.char || n.id] || {};
      const old = keep.get(n.id);
      const a = old && old.map === m.id ? old : makeActor(n.x, n.y, n.dir || 'down', n.look || ch.look || RB.sprites.randomLook(RB.util.hashStr(n.id)));
      a.id = n.id; a.def = n; a.map = m.id; a.home = [n.x, n.y];
      a.look = n.look || ch.look || a.look;
      W.npcs.push(a);
    }
    W.foes = [];
    for (const e of m.def.foes || []) {
      if (e.if && !RB.state.test(st, e.if)) continue;
      if (st.flags['foe:' + m.id + ':' + e.id]) continue;
      const en = RB.content.enemies[e.enemy] || {};
      const a = makeActor(e.x, e.y, 'down', en.look || { custom: 'wisp' });
      a.id = e.id; a.def = e; a.home = [e.x, e.y]; a.foe = true;
      W.foes.push(a);
    }
  }

  // ---- collision -----------------------------------------------------------
  function actorAt(x, y, except) {
    for (const n of W.npcs) if (n !== except && ((n.x === x && n.y === y) || (n.mv && n.mv.tx === x && n.mv.ty === y))) return n;
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
      if (!W.bumpT || W.time - W.bumpT > 300) { RB.audio && RB.audio.sfx('bump'); W.bumpT = W.time; }
      W.path = null;
      return;
    }
    const tool = s().equip.tool && RB.content.items[s().equip.tool];
    const quick = tool && tool.effect && tool.effect.walk ? 0.88 : 1;
    const dur = Math.round((RB.input.running() || (W.path && W.path.length > 4) ? 105 : 160) * quick);
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
    const ex = RB.maps.exitAt(W.map, p.x, p.y);
    if (ex) {
      if (ex.locked && (!ex.unlock || !RB.state.test(st, ex.unlock))) {
        W.path = null;
        // step back and explain
        const back = DIRS[OPP[p.dir]];
        p.x += back[0]; p.y += back[1]; p.fx = p.x; p.fy = p.y;
        st.x = p.x; st.y = p.y;
        if (ex.locked) RB.script.run(ex.locked);
        return;
      }
      W.path = null;
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
        RB.script.run(tr.scene);
        return;
      }
    }
    if (W.path && W.path.length === 0) {
      W.path = null;
      if (W.pathTarget) {
        const t = W.pathTarget;
        W.pathTarget = null;
        faceTo(p, t[0], t[1]);
        interact();
      }
    }
  }
  function faceTo(a, x, y) {
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
    // NPC routines
    for (const n of W.npcs) {
      stepActor(n, dt);
      n.blinkT -= dt;
      if (n.blinkT < -140) n.blinkT = 2500 + Math.random() * 3000;
      const wander = n.def.wander;
      if (!wander || n.mv || RB.game.mode() !== 'world') continue;
      n.wt = (n.wt || 1500 + Math.random() * 2500) - dt;
      if (n.wt > 0) continue;
      n.wt = 1800 + Math.random() * 3500;
      const dirs = Object.keys(DIRS);
      const d = dirs[Math.floor(Math.random() * 4)];
      const [dx, dy] = DIRS[d];
      const nx = n.x + dx, ny = n.y + dy;
      if (Math.abs(nx - n.home[0]) > wander || Math.abs(ny - n.home[1]) > wander) { n.dir = d; continue; }
      if (blocked(nx, ny, { except: n }) || RB.maps.exitAt(W.map, nx, ny) || triggerAt(nx, ny)) { n.dir = d; continue; }
      if (W.comp && ((W.comp.x === nx && W.comp.y === ny) || (W.comp.mv && W.comp.mv.tx === nx && W.comp.mv.ty === ny))) continue;
      if (Math.abs(nx - p.x) + Math.abs(ny - p.y) < 2) continue; // don't crowd the player
      startMove(n, d, 320);
    }
    for (const f of W.foes) {
      stepActor(f, dt);
      const pat = f.def.patrol;
      if (!pat || f.mv || RB.game.mode() !== 'world') continue;
      f.wt = (f.wt || 900) - dt;
      if (f.wt > 0) continue;
      f.wt = 700 + Math.random() * 900;
      const d = Object.keys(DIRS)[Math.floor(Math.random() * 4)];
      const [dx, dy] = DIRS[d];
      const nx = f.x + dx, ny = f.y + dy;
      if (Math.abs(nx - f.home[0]) > pat || Math.abs(ny - f.home[1]) > pat) continue;
      if (blocked(nx, ny, { except: f }) || RB.maps.exitAt(W.map, nx, ny)) continue;
      if (W.comp && W.comp.x === nx && W.comp.y === ny) continue;
      startMove(f, d, 380);
    }
    W.emotes = W.emotes.filter((e) => e.until > W.time);
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
  function propAt(x, y) {
    const st = s();
    let best = null;
    for (const pr of W.map.props) {
      if (pr.auto && !pr.text && !pr.scene) continue;
      if (pr.if && !RB.state.test(st, pr.if)) continue;
      const pd = RB.props.P[pr.p];
      const pw = pr.w || (pd && pd.w) || 1, ph = pr.h || (pd && pd.h) || 1;
      if (x >= pr.x && x < pr.x + pw && y >= pr.y && y < pr.y + ph && (pr.text || pr.scene)) best = pr;
    }
    return best;
  }
  function talkTo(n) {
    const st = s();
    const def = n.def;
    let scene = null;
    if (typeof def.talk === 'string') scene = def.talk;
    else if (Array.isArray(def.talk)) {
      for (const opt of def.talk) if (!opt.if || RB.state.test(st, opt.if)) { scene = opt.scene; break; }
    }
    if (!scene) return false;
    if (!def.noFace) faceTo(n, W.player.x, W.player.y);
    RB.script.run(scene, { npc: n.id });
    return true;
  }
  function interact() {
    if (W.player.mv) return;
    const [fx, fy] = frontTile();
    const n = actorAt(fx, fy);
    if (n && n.foe) { startFoe(n); return; }
    if (n && talkTo(n)) return;
    // talk across a counter
    const pr = propAt(fx, fy);
    if (pr && (pr.p === 'counter' || pr.across)) {
      const [dx, dy] = DIRS[W.player.dir];
      const n2 = actorAt(fx + dx, fy + dy);
      if (n2 && talkTo(n2)) return;
    }
    if (pr) {
      if (pr.scene) RB.script.run(pr.scene, { prop: pr });
      else if (pr.text) RB.script.runInline([{ who: pr.who || 'narr', jp: pr.text.jp, en: pr.text.en }]);
      return;
    }
    // companion: talking to your companion gives contextual banter
    if (W.comp && W.comp.x === fx && W.comp.y === fy) {
      RB.game.companionTalk();
      return;
    }
  }
  function startFoe(f) {
    const st = s();
    const e = f.def;
    RB.game.startBattle(e.enemy, {
      foeKey: 'foe:' + W.map.id + ':' + e.id,
      onWin: e.onWin, scene: e.scene,
    });
  }
  // Foes that walk into the player start a battle too (they are visible and avoidable).
  function checkFoeContact() {
    const p = W.player;
    if (p.mv) return false;
    for (const f of W.foes) {
      if (f.mv) continue;
      if (Math.abs(f.x - p.x) + Math.abs(f.y - p.y) === 1 && f.def.aggro) { startFoe(f); return true; }
    }
    return false;
  }

  // ---- tap to move -------------------------------------------------------------
  function bfs(tx, ty, allowAdjacent) {
    const p = W.player;
    const m = W.map;
    const start = p.x + ',' + p.y;
    const prev = new Map([[start, null]]);
    const q = [[p.x, p.y]];
    let found = null;
    while (q.length) {
      const [x, y] = q.shift();
      if (x === tx && y === ty) { found = [x, y]; break; }
      if (allowAdjacent && Math.abs(x - tx) + Math.abs(y - ty) === 1) { found = [x, y]; break; }
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
  function tapTile(tx, ty) {
    if (!W.map || RB.game.mode() !== 'world') return;
    const p = W.player;
    if (tx === p.x && ty === p.y) return;
    const solid = blocked(tx, ty, { except: p, ignorePlayer: true });
    const target = actorAt(tx, ty) || propAt(tx, ty) || (W.comp && W.comp.x === tx && W.comp.y === ty);
    if (Math.abs(tx - p.x) + Math.abs(ty - p.y) === 1 && (solid || target)) {
      faceTo(p, tx, ty);
      interact();
      return;
    }
    const path = bfs(tx, ty, solid);
    if (!path) return;
    W.path = path;
    W.pathTarget = solid || target ? [tx, ty] : null;
  }

  function emote(who, kind, ms) {
    W.emotes.push({ who, kind, until: W.time + (ms || 1400) });
  }
  function actorById(id) {
    if (id === 'pc' || id === 'player') return W.player;
    if (id === 'comp' || (W.comp && W.comp.id === id)) return W.comp;
    return W.npcs.find((n) => n.id === id) || null;
  }
  // Scripted walking (cutscenes): moves an actor tile by tile, ignoring NPC blocking.
  function scriptMove(id, dir, n, dur) {
    const a = actorById(id);
    if (!a) return Promise.resolve();
    return new Promise((res) => {
      let left = n;
      const go = () => {
        if (left <= 0) { res(); return; }
        left--;
        startMove(a, dir, dur || 220);
        const wait = () => (a.mv ? setTimeout(wait, 16) : go());
        setTimeout(wait, 16);
      };
      go();
    });
  }

  return {
    W, DIRS, enter, update, interact, tapTile, refreshActors, placeCompanion, emote, actorById, scriptMove,
    frontTile, checkFoeContact, faceTo, unstick, blocked,
  };
})();
