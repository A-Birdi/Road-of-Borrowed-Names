// Goal-directed story driver for browser tests of the built index.html.
// Given a list of scene ids, it finds where each scene is triggered in the
// world (NPC talk option, prop, trigger, foe, map entry, locked exit), walks
// there through map exits that are open in the current state, triggers it the
// way the game does, and checks that the intended scene actually ran.
// Dialogue, answers and battles are handled by RB.test auto mode (canonical
// answers checked against accept lists; battles simulated with the chosen
// policy). Usage (in a test):
//   import { install } from './drive.mjs';
//   await p.evaluate(install);
//   const r = await p.evaluate((steps) => RBDrive.run(steps), steps);

export function install() {
  const T = RB.test, C = RB.content;
  const ran = [];
  if (!RB.script.__driveWrapped) {
    const orig = RB.script.run;
    RB.script.run = function (id, ctx) { ran.push(id); return orig.call(this, id, ctx); };
    RB.script.__driveWrapped = true;
  }
  const S = () => RB.game.s;
  const test = (c) => !c || RB.state.test(S(), c);
  const compiled = {};
  const comp = (id) => compiled[id] || (compiled[id] = RB.maps.compile(id));
  const talkOf = (n) => (Array.isArray(n.talk) ? n.talk : typeof n.talk === 'string' ? [{ scene: n.talk }] : []);

  // every place a scene can be started from
  function sites(scene) {
    const out = [];
    for (const mid in C.maps) {
      const m = C.maps[mid];
      for (const n of m.npcs || []) if (talkOf(n).some((o) => o.scene === scene)) out.push({ kind: 'npc', map: mid, n });
      for (const pr of m.props || []) if (pr.scene === scene) out.push({ kind: 'prop', map: mid, pr });
      for (const tr of m.triggers || []) if (tr.scene === scene) out.push({ kind: 'trig', map: mid, tr });
      for (const f of m.foes || []) if (f.scene === scene) out.push({ kind: 'foe', map: mid, f });
      for (const ev of m.onEnter || []) if (ev.scene === scene) out.push({ kind: 'enter', map: mid, ev });
      for (const ex of m.exits || []) if (ex.locked === scene) out.push({ kind: 'locked', map: mid, ex });
    }
    return out;
  }
  function available(st) {
    const s = S();
    switch (st.kind) {
      case 'npc': {
        if (!test(st.n.if)) return false;
        const first = talkOf(st.n).find((o) => test(o.if));
        return !!first && first.scene === st.scene;
      }
      case 'prop': return test(st.pr.if);
      case 'trig': return test(st.tr.if);
      case 'foe': return test(st.f.if) && !s.flags['foe:' + st.map + ':' + st.f.id];
      case 'enter': return test(st.ev.if) && (st.ev.once === false || !s.flags['enter:' + st.map + ':' + st.ev.scene]);
      case 'locked': return test(st.ex.if) && !(st.ex.unlock && test(st.ex.unlock));
    }
    return false;
  }
  // open exits of a map in the current state
  function exitsOf(mid) {
    return comp(mid).exits.filter((ex) => test(ex.if) && !(ex.locked && !(ex.unlock && test(ex.unlock))) && C.maps[ex.to]);
  }
  // Walking reachability from the player's tile: flood-fill walkable tiles
  // (current conditional props block), take only exits whose tile is reached,
  // arrive at the exit's spawn and continue. Returns per-map reached tiles and
  // the entry (arrival) each tile belongs to, so a path can be rebuilt.
  const DIRS4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  function arrival(ex) {
    if (ex.tx != null) return [ex.tx, ex.ty];
    const sp = (C.maps[ex.to].spawn || {})[ex.sp || 'default'];
    return sp ? [sp[0], sp[1]] : null;
  }
  function explore() {
    const W = RB.world.W;
    const reach = {}; // map -> Map(tileKey -> entry id)
    const entries = [];
    const q = [];
    const add = (map, x, y, prev, ex) => {
      const R = reach[map] || (reach[map] = new Map());
      if (R.has(x + ',' + y)) return;
      const id = entries.length;
      entries.push({ map, x, y, prev, ex });
      const m = comp(map);
      R.set(x + ',' + y, id);
      const st = [[x, y]];
      while (st.length) {
        const [cx, cy] = st.pop();
        for (const [dx, dy] of DIRS4) {
          const nx = cx + dx, ny = cy + dy, k = nx + ',' + ny;
          if (R.has(k) || RB.maps.blockedStatic(m, nx, ny)) continue;
          R.set(k, id); st.push([nx, ny]);
        }
      }
      q.push(id);
    };
    add(W.map.id, W.player.x, W.player.y, null, null);
    while (q.length) {
      const id = q.shift(), e = entries[id], R = reach[e.map];
      for (const ex of exitsOf(e.map)) {
        let ok = false;
        for (let yy = ex.y; yy < ex.y + (ex.h || 1) && !ok; yy++) for (let xx = ex.x; xx < ex.x + (ex.w || 1) && !ok; xx++) {
          if (R.get(xx + ',' + yy) === id) ok = true;
          // an exit on a solid tile (stairs, ladders) is entered from beside it
          else if (RB.maps.blockedStatic(comp(e.map), xx, yy) && DIRS4.some(([dx, dy]) => R.get((xx + dx) + ',' + (yy + dy)) === id)) ok = true;
        }
        if (!ok) continue;
        const a = arrival(ex);
        if (a) add(ex.to, a[0], a[1], id, ex);
      }
    }
    return { reach, entries };
  }
  function pathTo(X, id) {
    const path = [];
    for (let e = X.entries[id]; e && e.prev != null; e = X.entries[e.prev]) path.unshift(e.ex);
    return path;
  }
  // tiles from which a site can be used, and the reachable one (entry id + tile)
  function standTiles(st) {
    const out = [];
    const around = (x, y, w, h) => { for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) for (const [dx, dy] of DIRS4) out.push([xx + dx, yy + dy]); };
    switch (st.kind) {
      case 'npc': {
        const live = RB.world.W.map.id === st.map && RB.world.W.npcs.find((a) => a.id === st.n.id);
        around(live ? live.x : st.n.x, live ? live.y : st.n.y, 1, 1);
        // talking across a counter / desk
        for (const [dx, dy] of DIRS4) out.push([(live ? live.x : st.n.x) + 2 * dx, (live ? live.y : st.n.y) + 2 * dy]);
        break;
      }
      case 'prop': { const pd = RB.props.P[st.pr.p] || {}; around(st.pr.x, st.pr.y, st.pr.w || pd.w || 1, st.pr.h || pd.h || 1); break; }
      case 'trig': for (let yy = st.tr.y; yy < st.tr.y + (st.tr.h || 1); yy++) for (let xx = st.tr.x; xx < st.tr.x + (st.tr.w || 1); xx++) out.push([xx, yy]); break;
      case 'foe': out.push([st.f.x, st.f.y]); around(st.f.x, st.f.y, 1, 1); break;
      case 'locked': around(st.ex.x, st.ex.y, st.ex.w || 1, st.ex.h || 1); break; // stand beside it, facing it
    }
    return out;
  }
  function reachSite(X, st) {
    const R = X.reach[st.map];
    if (!R) return null;
    if (st.kind === 'enter') { const id = X.entries.findIndex((e) => e.map === st.map); return id < 0 ? null : { id, tile: null }; }
    let best = null;
    for (const [x, y] of standTiles(st)) {
      const id = R.get(x + ',' + y);
      if (id == null) continue;
      const len = pathTo(X, id).length;
      if (!best || len < best.len) best = { id, tile: [x, y], len };
    }
    return best;
  }
  // map-level route kept for diagnostics
  function route(from, to) {
    const X = explore();
    const id = X.entries.findIndex((e) => e.map === to);
    return id < 0 ? null : pathTo(X, id);
  }
  async function walk(path) {
    for (const ex of path) {
      await T.idle(60000);
      if (ex.tx == null) await RB.game.transition(ex.to, null, null, ex.dir || 'down', { sp: ex.sp });
      else await RB.game.transition(ex.to, ex.tx, ex.ty, ex.dir || 'down');
      await T.idle(60000);
    }
  }
  async function fire(st, tile) {
    const W = RB.world.W;
    const face = (tx, ty) => { const [x, y] = tile; const dx = Math.sign(tx - x), dy = Math.sign(ty - y); return dx > 0 ? 'right' : dx < 0 ? 'left' : dy > 0 ? 'down' : 'up'; };
    if (tile && st.kind === 'npc') {
      const a = W.npcs.find((n) => n.id === st.n.id);
      if (a) { T.place(tile[0], tile[1], face(a.x, a.y)); RB.world.interact(); return T.idle(60000); }
    }
    if (tile && st.kind === 'locked') {
      // as when walking into it: stand next to the exit, facing it (hooks read the exit in front)
      const ex = st.ex;
      const tx = Math.max(ex.x, Math.min(ex.x + (ex.w || 1) - 1, tile[0])), ty = Math.max(ex.y, Math.min(ex.y + (ex.h || 1) - 1, tile[1]));
      T.place(tile[0], tile[1], face(tx, ty)); RB.script.run(ex.locked); return T.idle(60000);
    }
    if (tile && st.kind === 'prop') {
      // face a footprint tile next to the stand tile
      const pd = RB.props.P[st.pr.p] || {};
      const w = st.pr.w || pd.w || 1, h = st.pr.h || pd.h || 1;
      const tx = Math.max(st.pr.x, Math.min(st.pr.x + w - 1, tile[0])), ty = Math.max(st.pr.y, Math.min(st.pr.y + h - 1, tile[1]));
      T.place(tile[0], tile[1], face(tx, ty)); RB.world.interact(); return T.idle(60000);
    }
    switch (st.kind) {
      case 'npc': return T.talk(st.n.id);
      case 'prop': return T.use(st.pr.x, st.pr.y);
      case 'trig': T.place(st.tr.x, st.tr.y); RB.script.run(st.tr.scene); return T.idle(60000);
      case 'foe': await RB.game.startBattle(st.f.enemy, { foeKey: 'foe:' + W.map.id + ':' + st.f.id, scene: st.f.scene }); return T.idle(60000);
      case 'enter': RB.game.runEnterEvents(); return T.idle(60000);
      case 'locked': RB.script.run(st.ex.locked); return T.idle(60000);
    }
  }
  // Run steps: 'scene.id' | { scene, again, optional } | { flag } | { word } | { questDone }
  // (no eval: the game's CSP forbids it)
  async function run(steps, opts) {
    opts = opts || {};
    const log = [];
    // scenes that ran since install() (e.g. an arrival scene) count for the first step
    let mark = opts.fresh ? ran.length : 0;
    for (const raw of steps) {
      const step = typeof raw === 'string' ? { scene: raw } : raw;
      await T.idle(60000);
      if (step.flag) {
        if (!S().flags[step.flag]) return { ok: false, log, fail: 'flag ' + step.flag + ' not set', ran: ran.slice(mark) };
        log.push('flag ' + step.flag);
        continue;
      }
      if (step.word) {
        if (!S().words.includes(step.word)) return { ok: false, log, fail: 'word ' + step.word + ' not learned' };
        log.push('word ' + step.word);
        continue;
      }
      if (step.questDone) {
        const q = S().quests[step.questDone];
        if (!q || !q.done) return { ok: false, log, fail: 'quest ' + step.questDone + ' not done (' + JSON.stringify(q) + ')' };
        log.push('quest ' + step.questDone + ' done');
        continue;
      }
      const prior = ran.indexOf(step.scene, mark);
      if (prior >= 0 && !step.again) { log.push(step.scene + ' (already ran)'); continue; }
      const all = sites(step.scene).map((x) => Object.assign(x, { scene: step.scene }));
      if (!all.length) return { ok: false, log, fail: 'no site starts ' + step.scene };
      const here = RB.world.W.map.id;
      const X = explore();
      let pick = null, path = null, tile = null;
      for (const st of all) {
        if (!available(st)) continue;
        const r = reachSite(X, st);
        if (!r) continue;
        const pth = pathTo(X, r.id);
        if (!path || pth.length < path.length) { pick = st; path = pth; tile = r.tile; }
      }
      if (!pick && step.optional) { log.push(step.scene + ' (optional, not available)'); continue; }
      if (!pick) {
        return { ok: false, log, fail: 'no available/reachable site for ' + step.scene, map: here,
          sites: all.map((x) => x.kind + '@' + x.map + ' avail=' + available(x) + ' reach=' + !!reachSite(X, x) + ' mapRoute=' + !!X.reach[x.map]) };
      }
      const before = ran.length;
      try {
        await walk(path);
        // arriving may already have run it (onEnter)
        if (ran.indexOf(step.scene, before) < 0) await fire(pick, tile);
      } catch (e) {
        return { ok: false, log, fail: step.scene + ': ' + e.message, map: RB.world.W.map.id, ran: ran.slice(before) };
      }
      if (ran.indexOf(step.scene, before) < 0) return { ok: false, log, fail: step.scene + ' did not run (' + pick.kind + '@' + pick.map + ')', ran: ran.slice(before) };
      log.push(step.scene + ' via ' + pick.kind + '@' + pick.map + (path.length ? ' (' + path.length + ' exits)' : ''));
      // scenes that ran on the way here or chained after this one (onEnter on
      // arrival, after a warp, …) stay visible to the following steps
      mark = step.again ? ran.indexOf(step.scene, before) + 1 : before;
    }
    return { ok: true, log };
  }
  // ---- goal pursuit ---------------------------------------------------------
  // What a scene can change: flags set, quest stages, items given, words
  // taught (following !call). Used to rank sites by the progress they offer.
  const provCache = {};
  function provides(id, depth) {
    if (provCache[id]) return provCache[id];
    const out = { flags: [], quests: [], items: [], words: [], warps: [] };
    const sc = C.scenes[id];
    if (sc && (depth || 0) < 4) {
      for (const c of sc.cmds) {
        const a = c.args || [];
        if (c.op === 'set') out.flags.push(...a);
        else if (c.op === 'quest') out.quests.push([a[0], a[1] || 'start']);
        else if (c.op === 'give') out.items.push(a[0]);
        else if (c.op === 'word') out.words.push(a[0]);
        else if (c.op === 'warp') out.warps.push(a[0]);
        else if (c.op === 'call') { const sub = provides(a[0], (depth || 0) + 1); for (const k in out) out[k].push(...sub[k]); }
      }
    }
    return (provCache[id] = out);
  }
  function gain(id, mainQuest, st) {
    const s = S(), p = provides(id);
    let main = 0, other = 0;
    for (const [q, st] of p.quests) {
      const cur = s.quests[q];
      const newer = !cur || (st === 'done' ? !cur.done : st !== 'start' && +st > cur.stage);
      if (newer) { if (q === mainQuest) main++; else other++; }
    }
    for (const f of p.flags) if (!s.flags[f]) other++;
    for (const it of p.items) if (!s.inv[it]) other++;
    for (const w of p.words) if (!s.words.includes(w)) other++;
    // travel scenes (a boat, a ladder) stay useful: they reach other maps
    // generated Atlas rooms reuse one objective scene and record progress in
    // the run (via hooks), so each of their sites is worth one try per state
    const atlas = st && st.map.startsWith('atlas.');
    return { main, other, unseen: atlas || !s.seen[id] || p.warps.some((m) => m !== RB.world.W.map.id) };
  }
  // all sites on maps with the given prefix
  function allSites(prefix) {
    const out = [];
    const pre = prefix ? prefix.split('|') : null; // several prefixes: 'rw.hall|atlas.'
    for (const mid in C.maps) {
      if (pre && !pre.some((x) => mid.startsWith(x))) continue;
      const m = C.maps[mid];
      for (const n of m.npcs || []) { const first = test(n.if) && talkOf(n).find((o) => test(o.if)); if (first) out.push({ kind: 'npc', map: mid, n, scene: first.scene }); }
      for (const pr of m.props || []) if (pr.scene) out.push({ kind: 'prop', map: mid, pr, scene: pr.scene });
      for (const tr of m.triggers || []) out.push({ kind: 'trig', map: mid, tr, scene: tr.scene });
      for (const f of m.foes || []) if (f.scene) out.push({ kind: 'foe', map: mid, f, scene: f.scene });
      for (const ev of m.onEnter || []) out.push({ kind: 'enter', map: mid, ev, scene: ev.scene });
      for (const ex of comp(mid).exits) if (ex.locked) out.push({ kind: 'locked', map: mid, ex, scene: ex.locked });
    }
    return out.filter((st) => st.scene && available(st));
  }
  // state fingerprint (quest timestamps excluded: they change on every update)
  const sigOf = () => {
    const s = S();
    return Object.keys(s.flags).filter((k) => !/^(enter|named|trig|foe):/.test(k)).sort().join(',') + '|' +
      Object.keys(s.quests).sort().map((k) => k + ':' + (s.quests[k].done ? 'd' : s.quests[k].stage)).join(',') + '|' +
      Object.keys(s.inv).sort().map((k) => k + ':' + s.inv[k]).join(',') + '|' + s.words.join(',') + '|' + s.comp + '/' + s.provisional +
      '|' + Object.keys(s.seen).length + // conditions may test seen.<scene>
      '|' + (s.atlas && s.atlas.run ? JSON.stringify(s.atlas.run).length + ':' + RB.world.W.map.id : '');
  };
  // Pursue a flag: repeatedly do the reachable site offering the most progress
  // (main-quest stage > other new state > unseen scene), nearest first.
  async function pursue(target, opts) {
    opts = opts || {};
    const max = opts.max || 600;
    const tried = new Set();
    const log = [];
    let lastScene = null;
    for (let i = 0; i < max; i++) {
      await T.idle(60000);
      if (S().flags[target]) return { ok: true, steps: i, log: opts.fullLog ? log : log.slice(-25) };
      const here = RB.world.W.map.id;
      const sig = sigOf();
      let best = null;
      const X = explore();
      for (const st of allSites(opts.prefix)) {
        // several sites can share a scene (three doors, one scene): key by place too
        const where = st.n ? st.n.id : st.pr ? st.pr.x + ',' + st.pr.y : st.ex ? st.ex.x + ',' + st.ex.y : st.tr ? st.tr.x + ',' + st.tr.y : st.f ? st.f.id : '';
        const key = sig + '|' + st.kind + '|' + st.map + '|' + st.scene + '|' + where;
        if (tried.has(key)) continue;
        const g = gain(st.scene, opts.main, st);
        const tier = g.main ? 3 : g.other ? 2 : g.unseen ? 1 : 0;
        if (!tier) continue;
        const rs = reachSite(X, st);
        if (!rs) continue;
        const r = pathTo(X, rs.id);
        // don't use the same site twice in a row (e.g. reopening a door you just opened)
        const score = tier * 1000 - r.length - (st.scene === lastScene ? 500 : 0);
        if (!best || score > best.score) best = { st, r, score, key, tile: rs.tile };
      }
      if (!best) return { ok: false, steps: i, log: opts.fullLog ? log : log.slice(-25), fail: 'no site offers progress towards ' + target, map: here, quests: S().quests };
      tried.add(best.key);
      const before = ran.length;
      try {
        await walk(best.r);
        if (ran.indexOf(best.st.scene, before) < 0 && available(best.st)) await fire(best.st, best.tile);
      } catch (e) { log.push('ERR ' + best.st.scene + ': ' + e.message); continue; }
      log.push(best.st.scene + ' (' + best.st.kind + '@' + best.st.map + ')');
      lastScene = best.st.scene;
    }
    return { ok: !!S().flags[target], steps: max, log: log.slice(-25), fail: 'step limit' };
  }

  window.RBDrive = { run, pursue, sites, route, explore, ran, provides };
  return true;
}
