/* Automated-test support (used only by the browser test scripts; inert
 * unless RB.test.enable() is called). It lets scripted runs play story flows
 * quickly while still exercising the real scene runner, flags, quests, maps,
 * saves, answer checking and combat logic. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.test = (function () {
  'use strict';
  const T = { auto: null, log: [], problems: [] };

  function enable(opts) {
    T.auto = Object.assign({ choose: () => 0, battle: 'unravel' }, opts || {});
    T.log = [];
    T.problems = [];
  }
  function disable() {
    T.auto = null;
  }
  function choose(opts) {
    const i = T.auto.choose(opts) | 0;
    T.log.push({ t: 'choice', opts: opts.map((o) => o.en), pick: i });
    return Math.max(0, Math.min(opts.length - 1, i));
  }
  // Answer a step with its own canonical answer and check that the answer
  // checker accepts it (catches broken accept lists).
  function solveStep(step, where) {
    const plain = (x) => RB.tasks.plain(x || '');
    if (step.kind === 'write') {
      const r = RB.challenge.check(plain(step.answer), step);
      if (!r.ok) T.problems.push({ where, msg: 'canonical answer rejected', answer: step.answer, fb: r.feedback });
      for (const a of step.accept || []) {
        const r2 = RB.challenge.check(plain(a), step);
        if (!r2.ok) T.problems.push({ where, msg: 'accepted form rejected', answer: a });
      }
      // authored choices (before the UI's safety net) must include an accepted answer
      if (step.choices) {
        const acc = new Set((step.accept || [step.answer]).map(plain));
        if (!step.choices.some((c) => acc.has(plain(c)))) T.problems.push({ where, msg: 'no correct choice among authored choices', answer: step.answer, choices: step.choices });
      }
    } else if (step.kind === 'choose') {
      if (!step.options || !step.options.some((o) => o.ok)) T.problems.push({ where, msg: 'no correct option' });
    } else if (step.kind === 'order') {
      if (!step.answer || step.answer.length !== step.tiles.length) T.problems.push({ where, msg: 'order mismatch' });
    } else T.problems.push({ where, msg: 'unknown step kind ' + step.kind });
    if (step.item) RB.learn.record(step.item, { ok: true, mode: 'choice', assisted: false });
    return { ok: true, firstTry: true, mistakes: 0, assisted: false, mode: 'choice' };
  }
  // Simulate an Inkweaving encounter with perfect answers, through the real
  // rules (RB.combatLogic, with the Atlas's wrappers when they are installed)
  // and the player model of RB.combatSim: 'unravel' (the default: unravels the
  // creature nearest to settling, clears mist or a hush that blocks it, uses
  // the technique when Harmony is full) or 'smart' (reads every telegraph).
  // A group (opts.group: the other creatures' ids) is fought creature by
  // creature like any player would; the companion takes its turn each round.
  function battle(enemyId, opts) {
    opts = opts || {};
    const s = RB.game.s;
    const enemy = Object.assign({ id: enemyId }, RB.content.enemies[enemyId] || {});
    if (!RB.content.enemies[enemyId]) { T.problems.push({ where: 'battle ' + enemyId, msg: 'missing enemy' }); return 'win'; }
    const L = RB.combatLogic;
    const group = (opts.group || []).filter((g) => { if (!RB.content.enemies[g]) { T.problems.push({ where: 'battle ' + enemyId, msg: 'missing enemy in group: ' + g }); return false; } return true; });
    const st = L.init(enemy, s, { group });
    const words = s.words.map((w) => RB.content.words[w]).filter(Boolean);
    const policy = T.auto.battle === 'smart' ? 'smart' : 'unravel';
    let rounds = 0, techs = 0;
    const acts = {};
    while (!st.over && rounds < 120) {
      rounds++;
      const c = RB.combatSim.choose(st, words, s, { policy });
      if (!c || !c.card) { T.problems.push({ where: 'battle ' + enemyId, msg: 'no response available' }); break; }
      L.target(st, c.target);
      const card = c.card;
      // validate authored answer/truth steps when present
      if (card.kind === 'answer' && st.intent.answer) solveStep(RB.activities.tier(st.intent.answer) || st.intent.answer, 'battle ' + st.enemyId + ' answer');
      if (card.kind === 'truth' && st.intent.truth) solveStep(RB.activities.tier(st.intent.truth) || st.intent.truth, 'battle ' + st.enemyId + ' truth');
      if (card.kind === 'tech') techs++;
      const P = L.playerAct(st, card, { ok: true, firstTry: true, mistakes: 0 }, enemy);
      if (c.act) { if (c.actTarget != null) L.target(st, c.actTarget); L.compAct(st, c.act, P); acts[c.act] = (acts[c.act] || 0) + 1; }
      if (L.allSettled(st)) { st.over = 'win'; break; }
      L.enemyAct(st, P.answered);
      L.endRound(st, enemy);
    }
    T.log.push({ t: 'battle', enemy: enemyId, group: st.foes.slice(1).map((f) => f.enemyId), result: st.over, rounds, pc: st.pc, comp: st.comp, techs, acts });
    if (st.over !== 'win') T.problems.push({ where: 'battle ' + enemyId + (group.length ? ' +' + group.join('+') : ''), msg: 'not won with policy ' + policy + ' (' + st.over + ' after ' + rounds + ' rounds)' });
    if (st.over === 'win' && enemy.reward) {
      for (const k in enemy.reward.items || {}) RB.state.give(s, k, enemy.reward.items[k]);
      for (const w of enemy.reward.words || []) if (s.words.indexOf(w) < 0) s.words.push(w);
    }
    return st.over || 'lose';
  }

  // Helpers for driving the world from a test page.
  function wait(ms) { return new Promise((r) => setTimeout(r, ms)); }
  async function idle(timeout) {
    const t0 = Date.now();
    await wait(30);
    while (Date.now() - t0 < (timeout || 20000)) {
      if (!RB.script.isRunning() && RB.game.mode() === 'world') return true;
      // a scene the player chose to end on a page of the folio (a case record, say):
      // the automated player reads it and closes it again, as a person would
      if (!RB.script.isRunning() && RB.game.mode() === 'menu' && RB.ui.menu.isOpen()) {
        T.log.push({ t: 'folio', page: RB.ui.menu.current() });
        RB.ui.menu.close();
      }
      await wait(25);
    }
    throw new Error('timeout waiting for idle (mode ' + RB.game.mode() + ')');
  }
  function freeAround(x, y) {
    const W = RB.world.W;
    for (const [dx, dy, dir] of [[0, 1, 'up'], [-1, 0, 'right'], [1, 0, 'left'], [0, -1, 'down']]) {
      const nx = x + dx, ny = y + dy;
      if (!RB.maps.blockedStatic(W.map, nx, ny) && !RB.maps.exitAt(W.map, nx, ny) && !W.npcs.some((n) => n.x === nx && n.y === ny)) return { x: nx, y: ny, dir };
    }
    return null;
  }
  function place(x, y, dir) {
    const W = RB.world.W;
    const p = W.player;
    p.x = p.fx = x; p.y = p.fy = y; p.mv = null; p.dir = dir || p.dir;
    RB.game.s.x = x; RB.game.s.y = y; RB.game.s.dir = p.dir;
    if (W.comp) { W.comp.x = W.comp.fx = x; W.comp.y = W.comp.fy = y; W.comp.mv = null; }
  }
  async function talk(id) {
    await idle();
    const n = RB.world.W.npcs.find((a) => a.id === id);
    if (!n) throw new Error('no NPC ' + id + ' on ' + RB.world.W.map.id);
    const f = freeAround(n.x, n.y);
    if (!f) throw new Error('no free tile next to ' + id);
    place(f.x, f.y, f.dir);
    RB.world.interact();
    await idle();
  }
  async function use(x, y) {
    await idle();
    // a prop may cover several tiles: stand next to any tile of its footprint
    let f = freeAround(x, y);
    const pr = !f && RB.world.W.map.props.find((q) => q.x === x && q.y === y);
    if (pr) {
      const pd = RB.props.P[pr.p] || {};
      const pw = pr.w || pd.w || 1, ph = pr.h || pd.h || 1;
      for (let yy = y; yy < y + ph && !f; yy++) for (let xx = x; xx < x + pw && !f; xx++) f = freeAround(xx, yy);
    }
    if (!f) throw new Error('no free tile next to ' + x + ',' + y);
    place(f.x, f.y, f.dir);
    RB.world.interact();
    await idle();
  }
  async function go(map, x, y, dir) {
    await idle();
    await RB.game.transition(map, x, y, dir || 'down');
    await idle();
  }
  // Walk one tile in a direction through the real movement code (exits, locks, triggers).
  async function step(dir) {
    await idle();
    const p = RB.world.W.player;
    p.dir = dir;
    RB.world._tryMove(dir);
    await wait(260);
    await idle();
  }
  return {
    enable, disable, choose, solveStep, battle, idle, talk, use, go, step, place, wait,
    get auto() { return T.auto; }, get log() { return T.log; }, get problems() { return T.problems; },
  };
})();
