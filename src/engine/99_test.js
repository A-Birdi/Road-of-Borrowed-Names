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
    } else if (step.kind === 'choose') {
      if (!step.options || !step.options.some((o) => o.ok)) T.problems.push({ where, msg: 'no correct option' });
    } else if (step.kind === 'order') {
      if (!step.answer || step.answer.length !== step.tiles.length) T.problems.push({ where, msg: 'order mismatch' });
    } else T.problems.push({ where, msg: 'unknown step kind ' + step.kind });
    if (step.item) RB.learn.record(step.item, { ok: true, mode: 'choice', assisted: false });
    return { ok: true, firstTry: true, mistakes: 0, assisted: false, mode: 'choice' };
  }
  // Simulate an Inkweaving encounter with perfect answers.
  function battle(enemyId) {
    const s = RB.game.s;
    const enemy = Object.assign({ id: enemyId }, RB.content.enemies[enemyId] || {});
    if (!RB.content.enemies[enemyId]) { T.problems.push({ where: 'battle ' + enemyId, msg: 'missing enemy' }); return 'win'; }
    const L = RB.combatLogic;
    const st = L.init(enemy, s, {});
    const words = s.words.map((w) => RB.content.words[w]).filter(Boolean);
    let rounds = 0;
    while (!st.over && rounds < 120) {
      rounds++;
      const cards = L.responses(st, words);
      let card = cards.find((c) => c.kind === 'unravel');
      if (T.auto.battle === 'smart') {
        const it = st.intent;
        const counter = cards.find((c) => c.kind === 'word' && c.word.tags.some((t) => it.counters.indexOf(t) >= 0) && (!c.target || c.target === it.target));
        if (it.kind === 'plea') card = cards.find((c) => c.kind === 'answer') || card;
        else if (it.kind === 'lie' || it.kind === 'mirror') card = cards.find((c) => c.kind === 'truth') || card;
        else if (counter && it.kind !== 'rest') card = counter;
        if (st.harmony >= st.harmonyMax && cards.find((c) => c.kind === 'tech')) card = cards.find((c) => c.kind === 'tech');
      }
      // Unravel is disabled while shrouded: clear it the way the telegraph says (light or wind)
      if (card.disabled) card = cards.find((c) => c.kind === 'word' && !c.disabled && c.word.tags.some((t) => t === 'light' || t === 'wind')) || cards.find((c) => c.kind === 'word' && !c.disabled) || card;
      // validate authored answer/truth steps when present
      if (card.kind === 'answer' && st.intent.answer) solveStep(RB.activities.tier(st.intent.answer) || st.intent.answer, 'battle ' + enemyId + ' answer');
      if (card.kind === 'truth' && st.intent.truth) solveStep(RB.activities.tier(st.intent.truth) || st.intent.truth, 'battle ' + enemyId + ' truth');
      const { countered } = L.playerAct(st, card, { ok: true, firstTry: true, mistakes: 0 }, enemy);
      if (st.knots <= 0) { st.over = 'win'; break; }
      L.enemyAct(st, countered);
      L.endRound(st, enemy);
    }
    T.log.push({ t: 'battle', enemy: enemyId, result: st.over, rounds, pc: st.pc, comp: st.comp });
    if (st.over !== 'win') T.problems.push({ where: 'battle ' + enemyId, msg: 'not won with policy ' + T.auto.battle + ' (' + st.over + ' after ' + rounds + ' rounds)' });
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
    const f = freeAround(x, y);
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
