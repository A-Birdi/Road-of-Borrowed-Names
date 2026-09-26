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
  function route(from, to) {
    if (from === to) return [];
    const prev = { [from]: null };
    const q = [from];
    while (q.length) {
      const m = q.shift();
      for (const ex of exitsOf(m)) {
        if (ex.to in prev) continue;
        prev[ex.to] = { m, ex };
        if (ex.to === to) {
          const path = [];
          for (let k = to; prev[k]; k = prev[k].m) path.unshift(prev[k].ex);
          return path;
        }
        q.push(ex.to);
      }
    }
    return null;
  }
  async function walk(path) {
    for (const ex of path) {
      await T.idle(60000);
      if (ex.tx == null) await RB.game.transition(ex.to, null, null, ex.dir || 'down', { sp: ex.sp });
      else await RB.game.transition(ex.to, ex.tx, ex.ty, ex.dir || 'down');
      await T.idle(60000);
    }
  }
  async function fire(st) {
    const W = RB.world.W;
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
      let pick = null, path = null;
      for (const st of all) {
        if (!available(st)) continue;
        const r = route(here, st.map);
        if (r && (!path || r.length < path.length)) { pick = st; path = r; }
      }
      if (!pick && step.optional) { log.push(step.scene + ' (optional, not available)'); continue; }
      if (!pick) {
        return { ok: false, log, fail: 'no available/reachable site for ' + step.scene, map: here,
          sites: all.map((x) => x.kind + '@' + x.map + ' avail=' + available(x) + ' route=' + !!route(here, x.map)) };
      }
      const before = ran.length;
      try {
        await walk(path);
        // arriving may already have run it (onEnter)
        if (ran.indexOf(step.scene, before) < 0) await fire(pick);
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
  window.RBDrive = { run, sites, route, ran };
  return true;
}
