// RBN-QA-170 (Agnes 6379970213; Local CL-266): a companion's action that depends on your response reads this
// exchange's response, never an earlier one. In a procedure under pressure (the Founder's Voice, gd.rw) the step you
// take is the response: it answers no creature's move, it is right first time only when it is the right step written
// so, and Resolve this step (no writing) is neither right nor right first time. Synthetic campaigns only, through the
// real encounter platform (src/engine/97_encounter.js):
//  - Suzu's Encore: a step right first time raises Harmony by one (capped); a wrong step, a retried one and Resolve
//    this step spend the use for nothing; an earlier ordinary response right first time no longer qualifies a wrong
//    step, and an earlier retried one no longer disqualifies a step right first time (Agnes's case);
//  - Nao's Spot the opening: a step never spots one (it answers no move), whatever came before;
//  - Nao's Lend a hand: a step right first time loosens one more knot (what its text says); a wrong step, a retried
//    one and Resolve this step do not, whatever came before;
//  - Suzu's Heckle: against a False promise, a right step makes it fall flat and a wrong one does not, whatever came
//    before; the blow is softened either way;
//  - ordinary battles: at every companion action, what the action reads from this exchange's response is what the
//    last response's record says (each companion, the simulator's own choices, slips included), and the simulator's
//    battles are unchanged (pinned digest, the same on CC-021's source).
import crypto from 'node:crypto';
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state, E = RB.encounter, L = RB.combatLogic, SIM = RB.combatSim;
  const OK = { ok: true, firstTry: true, mistakes: 0 };
  const RETRY = { ok: true, firstTry: false, mistakes: 1 };
  RB.save.autosave = async () => {};
  const ALL = Object.keys(C.words);
  const fresh = (comp) => {
    const s = S.newCampaign({ edition: 2 });
    s.id = 'companion-response-test'; s.map = 'rw.mill1'; s.comp = comp;
    s.player.name = 'Haru'; s.player.nameJp = 'ハル';
    s.learn.profile = 'E'; s.learn.difficulty = 'normal';
    Object.assign(s.flags, { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_done: true, cr_done: true, yn_done: true, ch6_done: true, postgame: true, ngp_offered: true });
    s.words = ALL.slice();
    s.vars = {};
    RB.game.G.s = s;
    RB.world.W = RB.world.W || {};
    RB.world.W.map = { id: s.map };
    return s;
  };
  const wordsOf = (s) => s.words.map((w) => C.words[w]).filter(Boolean);
  const J = JSON.stringify;

  // the Founder's Voice with a companion; its cards; one exchange, read at the companion's step
  const begin = (comp) => { const s = fresh(comp); const st = E.begin('gd.rw', s); return { s, st }; };
  const cards = (b) => E.cards(b.st, b.s, wordsOf(b.s));
  const step = (b, right) => cards(b).find((c) => c.kind === 'proc' && !!c.action.ok === right);
  const unravel = (b) => cards(b).find((c) => c.kind === 'unravel' && !c.disabled);
  function ex(b, card, res, act) {
    const st = b.st;
    let at = null;
    const before = { harmony: st.harmony, knots: st.knots, step: st.enc.proc.step };
    const ev = E.exchange(st, { card, res, comp: act ? { act } : null, target: st.cur }, {
      enemy: st.foes[0] && st.foes[0].def,
      onStep(name) { if (name === 'companion') at = { harmony: st.harmony, knots: st.knots, opening: !!st.openingBonus, stunned: st.foes[0].stunned || null, soften: st.foes[0].soften || 0, step: st.enc.proc.step }; },
    });
    const said = (ev.cfx || []).filter((f) => f.t === 'cact').map((f) => f.en);
    return { before, at, said, uses: Object.assign({}, st.compUses), ev };
  }
  const exists = (b) => !!(b.st && b.st.enc && b.st.enc.proc && step(b, true) && step(b, false));
  t.ok(['suzu', 'nao'].every((c) => { const b = begin(c); return exists(b) && b.st.compId === c && b.st.harmony === 0; }), 'the Founder\'s Voice begins with its procedure (a right and a wrong step offered), the companion beside you, Harmony at 0');

  // ---- Suzu's Encore ------------------------------------------------------------------------------------------------
  {
    const b = begin('suzu');
    const r = ex(b, step(b, true), OK, 'suzu_encore');
    t.ok(r.at.step === 1 && r.at.harmony === 1 && r.uses.suzu_encore === 1 && r.said.some((l) => /encore/i.test(l)), 'Encore with a step right first time: Harmony rises by one (' + J({ at: r.at, said: r.said }) + ')');
  }
  for (const [label, pick, res] of [['a wrong step', false, OK], ['the right step, retried', true, RETRY]]) {
    const b = begin('suzu');
    const r = ex(b, step(b, pick), res, 'suzu_encore');
    t.ok(r.at.harmony === 0 && r.uses.suzu_encore === 1 && r.said.some((l) => /Not quite in step/.test(l)), 'Encore with ' + label + ': the use is spent, Harmony stays (' + J({ at: r.at, said: r.said }) + ')');
  }
  {
    const b = begin('suzu');
    const p = b.st.enc.proc;
    E.rec(b.s).solved[E.solvedKey(p, p.steps[0])] = true;
    const res = cards(b).find((c) => c.kind === 'resolve');
    const r = res ? ex(b, res, OK, 'suzu_encore') : null;
    t.ok(r && r.at.step === 1 && p.resolved === 1 && r.at.harmony === 0 && r.uses.suzu_encore === 1, 'Encore with Resolve this step (no writing): the step is done, the use is spent, Harmony stays (' + J(r && { at: r.at, said: r.said }) + ')');
  }
  {
    // an earlier ordinary response right first time, then a wrong step: nothing
    const b = begin('suzu');
    const u = unravel(b);
    ex(b, u, OK, null);
    const pre = J(b.st.lastPlayer);
    const r = ex(b, step(b, false), OK, 'suzu_encore');
    t.ok(b.st.lastPlayer && /"perfect":true/.test(pre) && r.at.harmony === r.before.harmony && r.uses.suzu_encore === 1, 'an Unravel right first time, then Encore with a wrong step: Harmony stays (' + J({ pre, before: r.before, at: r.at, said: r.said }) + ')');
  }
  {
    // an earlier ordinary response retried, then a step right first time: Harmony rises (Agnes's case)
    const b = begin('suzu');
    ex(b, unravel(b), RETRY, null);
    const pre = J(b.st.lastPlayer);
    const r = ex(b, step(b, true), OK, 'suzu_encore');
    t.ok(/"perfect":false/.test(pre) && r.at.harmony === Math.min(b.st.harmonyMax, r.before.harmony + 1) && r.at.harmony > r.before.harmony, 'an Unravel retried, then Encore with a step right first time: Harmony rises by one (' + J({ pre, before: r.before, at: r.at, said: r.said }) + ')');
  }
  {
    const b = begin('suzu');
    b.st.harmony = b.st.harmonyMax;
    const r = ex(b, step(b, true), OK, 'suzu_encore');
    t.ok(r.at.harmony === b.st.harmonyMax && r.uses.suzu_encore === 1, 'Encore at full Harmony: it stays full; the use is spent (' + J({ at: r.at, max: b.st.harmonyMax }) + ')');
  }

  // ---- Nao: Spot the opening, Lend a hand ---------------------------------------------------------------------------
  {
    const b = begin('nao');
    const r = ex(b, step(b, true), OK, 'nao_opening');
    const b2 = begin('nao');
    b2.st.lastPlayer = { perfect: true, ok: true, answered: true, kind: 'word', target: 0 }; // what an earlier clean answer leaves
    const r2 = ex(b2, step(b2, true), OK, 'nao_opening');
    t.ok(!r.at.opening && !r2.at.opening, 'Spot the opening with a step right first time: nothing is spotted (a step answers no move), even after a clean answer (' + J({ a: r.said, b: r2.said }) + ')');
  }
  {
    const b = begin('nao');
    const r = ex(b, step(b, true), OK, 'nao_hand');
    t.ok(r.at.knots === r.before.knots - 1 && r.uses.nao_hand === 1, 'Lend a hand with a step right first time: one more knot comes loose (' + J({ before: r.before, at: r.at, said: r.said }) + ')');
  }
  for (const [label, kind, res] of [['a wrong step', 'wrong', OK], ['the right step, retried', 'right', RETRY], ['Resolve this step', 'resolve', OK]]) {
    const b = begin('nao');
    ex(b, unravel(b), OK, null); // an earlier response right first time
    const p = b.st.enc.proc;
    if (kind === 'resolve') E.rec(b.s).solved[E.solvedKey(p, p.steps[p.step])] = true;
    const card = kind === 'resolve' ? cards(b).find((c) => c.kind === 'resolve') : step(b, kind === 'right');
    const r = ex(b, card, res, 'nao_hand');
    t.ok(card && r.at.knots === r.before.knots && r.uses.nao_hand === 1 && r.said.some((l) => /knot holds/.test(l)), 'Lend a hand with ' + label + ', after an Unravel right first time: the knot holds; the use is spent (' + J({ before: r.before, at: r.at, said: r.said }) + ')');
  }

  // ---- Suzu's Heckle against a False promise --------------------------------------------------------------------------
  const lie = (b) => { const f = b.st.foes[0]; f.intent = Object.assign({}, f.intent, { kind: 'lie', counters: ['truth'], power: 1, effect: 'lie' }); };
  {
    const b = begin('suzu'); lie(b);
    const r = ex(b, step(b, true), OK, 'suzu_heckle');
    const b2 = begin('suzu');
    ex(b2, unravel(b2), OK, null); // an earlier response that was right
    lie(b2);
    const r2 = ex(b2, step(b2, false), OK, 'suzu_heckle');
    t.ok(r.at.stunned === 'laugh' && r.at.soften === 1, 'Heckle with a right step: the False promise falls flat (' + J({ at: r.at, said: r.said }) + ')');
    t.ok(r2.at.stunned !== 'laugh' && r2.at.soften === 1, 'Heckle with a wrong step, after a right Unravel: the blow is softer, the promise stands (' + J({ at: r2.at, said: r2.said }) + ')');
  }

  // ---- ordinary battles: the same reading as the last response's record; the simulator's battles unchanged ----------
  {
    const reads = [];
    const impl = Object.assign({}, SIM.core, {
      compAct(st, id, P) {
        const lp = st.lastPlayer || {};
        reads.push({ id, P: { perfect: !!P.perfect, ok: !!P.ok, answered: (P.answered || []).some(Boolean) || (P.answered2 || []).some(Boolean) }, rec: { perfect: !!lp.perfect, ok: !!lp.ok, answered: !!lp.answered } });
        return SIM.core.compAct(st, id, P);
      },
    });
    // the first twelve ordinary creatures (no boss, no guardian), in content order
    const foes = Object.keys(C.enemies).filter((id) => !C.enemies[id].boss && !C.enemies[id].guardian).slice(0, 12);
    const words = ['mamoru', 'mizu', 'hikari', 'kaze', 'nawa', 'ishi', 'iyasu', 'suzu', 'koe', 'honoo'];
    let rounds = 0;
    for (const comp of ['nao', 'mio', 'ren', 'suzu']) for (const id of foes) for (const slips of [0, 3]) {
      const enemy = Object.assign({ id }, C.enemies[id]);
      const s = { learn: { difficulty: 'normal', assist: 'normal', profile: 'E' }, resolve: { pc: 12, comp: 12, max: 12 }, comp, equip: {}, flags: { ch2_done: true, lq_ally1: true, lq_ally2: true }, quests: { lf_nao: 'done', lf_mio: 'done', ren_ushio: 'done', co_suzu: 'done' }, vars: {}, words: words.slice(), inv: {}, seen: {}, chapter: 6, player: { bg: '' } };
      const st = SIM.core.init(enemy, s, { group: [] });
      const ws = words.map((w) => C.words[w]).filter(Boolean);
      let n = 0;
      for (let round = 0; round < 30 && !st.over; round++) {
        const c = SIM.choose(st, ws, s, { stall: 0 });
        if (!c || !c.card) break;
        n++;
        const ev = E.exchange(st, { card: c.card, res: slips && n % slips === 0 ? RETRY : OK, comp: c.act ? { act: c.act, target: c.actTarget } : null, target: c.target }, { enemy, impl });
        rounds++;
        if (ev.over) break;
      }
    }
    const differ = reads.filter((r) => J(r.P) !== J(r.rec));
    const conditional = reads.filter((r) => /opening|hand|heckle|encore/.test(r.id));
    t.ok(reads.length > 50 && conditional.length > 10 && !differ.length, 'ordinary battles (each companion, the simulator\'s choices, slips included): at every companion action, this exchange\'s response reads as the last response\'s record (' + J({ rounds, actions: reads.length, conditional: conditional.length, differ: differ.slice(0, 3) }) + ')');
    const runs = [];
    for (const comp of ['nao', 'mio', 'ren', 'suzu']) for (const id of foes) for (const slips of [0, 3]) {
      runs.push([comp, id, slips, SIM.run(id, { comp, words, slips, flags: { ch2_done: true, lq_ally1: true, lq_ally2: true }, quests: { lf_nao: 'done', lf_mio: 'done', ren_ushio: 'done', co_suzu: 'done' } })]);
    }
    const digest = crypto.createHash('sha256').update(J(runs)).digest('hex').slice(0, 16);
    t.eq(digest, '7dda451b22994346', 'the simulator\'s battles (each companion, slips included) are unchanged: digest ' + digest + ' over ' + runs.length + ' battles, the same on CC-021\'s source');
  }
};
