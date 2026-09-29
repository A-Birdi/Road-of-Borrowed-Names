/* Inkweaving — a player model for the rules (RB.combatLogic), used by the
 * automated story runs (RB.test.battle), the difficulty-curve tests and the
 * Atlas checks. Pure: it never touches the screen or the saved campaign.
 *
 * choose(st, words, s, o) picks the response (and whom it acts on) and the
 * companion's action for this round:
 *   policy 'unravel' — a player who mostly unravels: the creature with the
 *     fewest knots left, clearing mist with light or wind when Unravel is
 *     blocked, and using the technique when Harmony is full;
 *   policy 'smart'   — a player who reads every telegraph: each response on
 *     each creature (and each companion action) is tried on a copy of the
 *     state for one exchange and the best outcome is kept.
 * Both answer with the words they know; neither sees anything the screen
 * does not show (every telegraph is visible before you choose).
 *
 * run(enemy, o) plays a whole encounter with a policy and returns what
 * happened: {win, rounds, lost (resolve lost), minPc, minComp, techs, acts}. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.combatSim = (function () {
  'use strict';
  const L = RB.combatLogic;
  // the rules as defined here (the Atlas may wrap RB.combatLogic during its
  // battles; a look ahead never runs those wrappers or their side effects)
  const core = { playerAct: L.playerAct, compAct: L.compAct, foeAct: L.foeAct, enemyAct: L.enemyAct, endRound: L.endRound, init: L.init, responses: L.responses };
  const OK = { ok: true, firstTry: true, mistakes: 0 };

  function clone(st) {
    const o = L.snapshot(st);
    o.compUses = Object.assign({}, st.compUses || {});
    o.log = [];
    if (st._a) o._a = Object.assign({}, st._a);
    if (st.lastPlayer) o.lastPlayer = Object.assign({}, st.lastPlayer);
    return o;
  }
  const sum = (a, f) => a.reduce((n, x) => n + f(x), 0);
  const usesOf = (st) => sum(Object.keys(st.compUses || {}), (k) => st.compUses[k]);
  // How good a state is for the party (after one exchange, from `st0`).
  function score(x, st0, known) {
    if (L.allSettled(x)) return 1000 + x.pc + x.comp;
    let v = 0;
    v += 3 * (sum(st0.foes, (f) => Math.max(0, f.knots)) - sum(x.foes, (f) => Math.max(0, f.knots)));
    v += 3 * (x.foes.filter((f) => f.knots <= 0).length - st0.foes.filter((f) => f.knots <= 0).length);
    v -= (st0.pc - x.pc) + (st0.comp - x.comp) * 0.8;
    const danger = (r) => (r <= 0 ? 14 : r <= 3 ? (4 - r) * 2 : 0);
    v -= danger(x.pc) * 1.5 + (x.compId ? danger(x.comp) * 0.6 : 0);
    // what blocks progress weighs more than what merely hurts
    for (const i of L.standing(x)) {
      const f = x.foes[i];
      v -= Math.min(2, f.heat || 0) * 1.2 + (f.charged ? 2 : 0);
      if (f.shroud && (known.has('light') || known.has('wind'))) v -= 2.5;
    }
    if (x.silenced && (known.has('bell') || known.has('voice'))) v -= 4;
    v += 0.4 * Math.min(6, (x.ward.pc || 0) + (x.ward.comp || 0));
    v += 0.5 * x.harmony + (x.openingBonus ? 1.5 : 0);
    // a once-per-encounter action is worth keeping for when it matters
    v -= 1.2 * (usesOf(x) - usesOf(st0));
    return v;
  }
  // one exchange on a copy: your response (on creature ti), the companion's action (on aTi), the creatures
  function look(st, card, ti, act, aTi) {
    const x = clone(st);
    L.target(x, ti);
    const P = core.playerAct(x, card, OK);
    if (act) { if (aTi != null) L.target(x, aTi); core.compAct(x, act, P); }
    if (!L.allSettled(x)) core.enemyAct(x, P.answered || [P.countered], core.foeAct);
    return x;
  }
  const knownTags = (words) => new Set(words.flatMap((w) => w.tags || []));
  // The cards the screen would offer for creature i (Unravel blocked while it
  // is shrouded or you are hushed, when you know a word that clears it).
  function cardsFor(st, i, words, known) {
    return L.withFoe(st, i, () => {
      const cards = core.responses(st, words);
      for (const c of cards) {
        if (c.kind === 'unravel' && st.shroud && !(known.has('light') || known.has('wind'))) c.disabled = null;
        if (c.kind === 'unravel' && st.silenced && (known.has('bell') || known.has('voice'))) c.disabled = 'hushed';
      }
      return cards.filter((c) => !c.disabled);
    });
  }
  // companion actions on offer (ids), with what each would aim at
  function compChoices(st, s, card) {
    return L.compOptions(st, s, card).filter((o) => !o.locked && !o.used).map((o) => o.def);
  }
  // The choice for this round: { card, target (creature index), act (companion action id or null), actTarget }
  function choose(st, words, s, o) {
    o = o || {};
    const known = knownTags(words);
    const up = L.standing(st);
    const policy = o.policy || 'smart';
    const tries = [];
    if (policy === 'unravel') {
      // the technique when it is ready; otherwise unravel the creature nearest to settling
      const order = up.slice().sort((a, b) => st.foes[a].knots - st.foes[b].knots || a - b);
      let pick = null;
      for (const i of order) {
        const cards = cardsFor(st, i, words, known);
        const tech = cards.find((c) => c.kind === 'tech');
        const un = cards.find((c) => c.kind === 'unravel');
        if (tech) { pick = { card: tech, target: i }; break; }
        if (un) { pick = { card: un, target: i }; break; }
      }
      if (!pick) {
        // every Unravel is blocked: clear the way (wind reaches every mist; a bell breaks a hush)
        const i = order[0];
        const cards = cardsFor(st, i, words, known);
        const need = st.silenced && (known.has('bell') || known.has('voice')) ? ['bell', 'voice'] : ['wind', 'light'];
        const clear = cards.find((c) => c.kind === 'word' && c.word.tags.some((t) => need.indexOf(t) >= 0)) || cards.find((c) => c.kind === 'word') || cards[0];
        pick = { card: clear, target: i };
      }
      const act = bestAct(st, s, pick.card, pick.target, known);
      return Object.assign(pick, act);
    }
    for (const i of up) {
      for (const card of cardsFor(st, i, words, known)) {
        // a response that does not depend on the target is tried once
        const r = L.withFoe(st, i, () => L.reachOf(st, card));
        if (r.foes.length !== 1 && i !== up[0] && card.kind === 'word') continue;
        tries.push({ card, target: i });
      }
    }
    let best = null;
    for (const tr of tries) {
      const a = bestAct(st, s, tr.card, tr.target, known);
      const x = look(st, tr.card, tr.target, a.act, a.actTarget);
      const v = score(x, st, known) + (tr.card.kind === 'unravel' ? 0.01 : 0);
      if (!best || v > best.v + 1e-9) best = Object.assign({ v }, tr, a);
    }
    return best || { card: cardsFor(st, up[0], words, known)[0], target: up[0], act: null };
  }
  // the companion's best action for a queued card (tried on a copy)
  function bestAct(st, s, card, ti, known) {
    if (!st.compId || st.comp <= 0) return { act: null, actTarget: null };
    const defs = compChoices(st, s, card);
    if (!defs.length) return { act: null, actTarget: null };
    if (defs[0].id === 'join') return { act: 'join', actTarget: null };
    let best = null;
    for (const d of defs) {
      const targets = d.aim === 'foe' || d.aim === 'aimed' ? L.standing(st) : [ti];
      for (const at of targets) {
        const x = look(st, card, ti, d.id, at);
        const v = score(x, st, known);
        if (!best || v > best.v + 1e-9) best = { v, act: d.id, actTarget: at };
      }
    }
    return best || { act: null, actTarget: null };
  }

  // A whole encounter. o: { difficulty, comp, words (ids), group (ids), policy,
  // slips (every n-th answer has one slip, costing its capped −1; 0 = none),
  // flags, quests (for companion unlocks), atlasCtx (unused here) }.
  function run(enemy, o) {
    o = o || {};
    const C = RB.content;
    if (typeof enemy === 'string') enemy = Object.assign({ id: enemy }, C.enemies[enemy] || {});
    const s = {
      learn: { difficulty: o.difficulty || 'normal', assist: o.assist || 'normal', profile: 'E' },
      resolve: { pc: 12, comp: 12, max: 12 }, comp: o.comp || null, equip: {},
      flags: Object.assign({}, o.flags || {}), quests: Object.assign({}, o.quests || {}), vars: {}, words: (o.words || []).slice(), inv: {}, seen: {}, chapter: 6, player: { bg: '' },
    };
    const words = s.words.map((w) => C.words[w]).filter(Boolean);
    const st = core.init(enemy, s, { group: o.group || [] });
    const out = { win: false, rounds: 0, lost: 0, minPc: st.pc, minComp: st.comp, max: st.max, techs: 0, acts: {}, foes: st.foes.map((f) => f.enemyId), knots: st.foes.map((f) => f.maxKnots) };
    let n = 0;
    for (let round = 0; round < (o.maxRounds || 60) && !st.over; round++) {
      const c = choose(st, words, s, o);
      if (!c || !c.card) break;
      L.target(st, c.target);
      n++;
      const slip = o.slips && n % o.slips === 0;
      const before = st.pc + st.comp;
      const P = core.playerAct(st, c.card, slip ? { ok: true, firstTry: false, mistakes: 1 } : OK, enemy);
      if (c.card.kind === 'tech') out.techs++;
      if (c.act) { if (c.actTarget != null) L.target(st, c.actTarget); core.compAct(st, c.act, P); out.acts[c.act] = (out.acts[c.act] || 0) + 1; }
      if (o.trace) o.trace.push('r' + round + ' ' + st.foes.map((f, i) => i + ':' + f.enemyId + ' k' + f.knots + ' ' + (f.intent && f.intent.kind) + (f.heat ? ' h' + f.heat : '') + (f.shroud ? ' mist' : '') + (f.charged ? ' chg' : '')).join(' | ') + ' || ' + (c.card.word ? c.card.word.id : c.card.kind) + '@' + c.target + ' ' + (c.act || '') + ' pc' + st.pc + ' hush' + st.silenced);
      out.rounds++;
      if (L.allSettled(st)) { st.over = 'win'; break; }
      core.enemyAct(st, P.answered, core.foeAct);
      out.lost += Math.max(0, before - (st.pc + st.comp));
      out.minPc = Math.min(out.minPc, st.pc); out.minComp = Math.min(out.minComp, st.comp);
      core.endRound(st, enemy);
      if (st.log.length && st.log[st.log.length - 1].t === 'revive') { st.log.pop(); out.revived = true; }
    }
    out.win = st.over === 'win';
    out.lose = st.over === 'lose';
    return out;
  }
  return { choose, run, score, clone, look, cardsFor, core };
})();
