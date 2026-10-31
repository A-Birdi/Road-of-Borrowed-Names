// Nao's opening and Nao's Lend a hand, told once (Agnes 6543444529, 6543603576; Local CL-547, CL-548, CL-549; Cloud
// CC-394, CC-395): an Unravel with Nao's opening ready said "Nao saw the opening — two knots come loose." and then its
// own release beat said "Two knots come loose." again, and "two" whatever came loose; Lend a hand said "another knot
// comes loose" before its own release beat said it. The rules and their events are as they were (the
// choreography keys on them); Nao's lines now name the move, not the count, and the count is the release beat's own,
// from what came loose (src/ui/80_combat.js; tests/e2e/opening_log.mjs). On the engine:
//  1. a plain Unravel: one release event, n 1, and no line of Nao's; 3 knots → 2;
//  2. the opening ready: Nao's event first ('comp', who nao, on the creature), "Nao saw the opening.", then the
//     release, n 2; the opening spent; 3 → 1;
//  3. the opening ready, one knot left: the same events, n 2 (what was asked), 1 → 0;
//  4. the opening ready, the creature weakened: n 3, 4 → 1, the weakening spent;
//  5. Nao's and Suzu's techniques: their own lines and releases, as before (Suzu's, in a group, a knot each for the
//     others);
//  6. a modifier's Unravel on two creatures, one weakened: n 2 and n 1, as before;
//  7. Nao's Lend a hand (Agnes 6543913898): on a clean answer, "Nao lends a hand.", then its release, n 1, by Nao, with
//     several knots left (3 → 2) and with one (1 → 0); the support event keeps its type, id, who and creature; answered
//     right but not first time, or with no knot left, "Nao reaches in, but the knot holds." as before, and nothing comes
//     loose; in a group, aimed at another creature, on that one;
//  8. no line of Nao's says that knots come loose (the release beat says it, once).
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, L = RB.combatLogic, E = RB.encounter, M = RB.modifiers;
  const W = (id) => C.words[id];
  const OK = { ok: true, firstTry: true, mistakes: 0 };
  const flat = (x) => JSON.stringify(x);
  const camp = (comp) => {
    const s = RB.state.newCampaign({}); s.learn.difficulty = 'normal'; s.learn.assist = 'normal'; s.comp = comp;
    s.words = ['mamoru', 'mizu', 'hikari', 'kaze', 'nawa', 'ishi', 'iyasu', 'suzu'];
    return s;
  };
  // the events that tell a release, as (type, who, foe, n, line)
  const told = (fx) => fx.filter((f) => f.t === 'unravel' || f.t === 'comp' || f.t === 'tech' || f.t === 'cact')
    .map((f) => [f.t, f.who || f.by || null, f.foe == null ? null : f.foe, f.n == null ? null : f.n, f.en == null ? null : f.en]);
  const lines = [];
  // a creature as combat_rules' opening test has it; Nao's opening spotted on a clean answer, then the Unravel
  const opening = (knots, loose) => {
    const e = { id: 'probe', knots, pattern: ['heat', 'strike', 'rest', 'rest'] };
    const st = L.init(e, camp('nao'), {});
    const P = L.playerAct(st, { kind: 'word', word: W('mizu') }, OK, e);
    L.compAct(st, 'nao_opening', P);
    L.enemyAct(st, P.answered); L.endRound(st, e);
    const ready = st.openingBonus;
    if (loose) st.foes[st.cur].loose = loose;
    const k0 = st.knots;
    const R = L.playerAct(st, { kind: 'unravel' }, OK, e);
    for (const f of R.fx || []) if (f.who === 'nao' && f.en) lines.push(f.en);
    return { ready, k0, k1: st.knots, spent: !st.openingBonus, loose: st.foes[st.cur].loose || 0, told: told(R.fx || []) };
  };
  const SAW = 'Nao saw the opening.';

  // ---- 1. a plain Unravel
  {
    const e = { id: 'probe', knots: 3, pattern: ['heat', 'strike', 'rest', 'rest'] };
    const st = L.init(e, camp('nao'), {});
    const R = L.playerAct(st, { kind: 'unravel' }, OK, e);
    t.eq([st.knots, told(R.fx || [])], [2, [['unravel', null, 0, 1, null]]], '1 a plain Unravel: one release, n 1, no line of Nao\'s; 3 knots → 2');
  }
  // ---- 2-4. the opening ready
  {
    const r = opening(3);
    t.eq([r.ready, r.k0, r.k1, r.spent, r.told], [true, 3, 1, true, [['comp', 'nao', 0, null, SAW], ['unravel', null, 0, 2, null]]],
      '2 the opening ready: Nao\'s event first, "' + SAW + '", then the release, n 2; the opening spent; 3 → 1');
    const one = opening(1);
    t.eq([one.k0, one.k1, one.told], [1, 0, [['comp', 'nao', 0, null, SAW], ['unravel', null, 0, 2, null]]], '3 one knot left: the same events, n 2 (what was asked); 1 → 0');
    const weak = opening(4, 1);
    t.eq([weak.k0, weak.k1, weak.loose, weak.told], [4, 1, 0, [['comp', 'nao', 0, null, SAW], ['unravel', null, 0, 3, null]]], '4 weakened: n 3; 4 → 1; the weakening spent');
  }
  // ---- 5. the techniques, as before
  {
    const e = { id: 'probe', knots: 4, pattern: ['heat', 'strike', 'rest', 'rest'] };
    const st = L.init(e, camp('nao'), {});
    const R = L.playerAct(st, { id: 'tech', kind: 'tech', jp: 'あわせ', en: 'Technique', tech: 'nao' }, OK, e);
    for (const f of R.fx || []) if (f.who === 'nao' && f.en) lines.push(f.en);
    t.eq([st.knots, told(R.fx || [])], [2, [['unravel', null, 0, 2, null], ['tech', 'nao', 0, null, 'Read the Opening: you strike where it was about to move.']]], '5 Nao\'s technique: its release, n 2, and its own line, as before; 4 → 2');
    const s = camp('suzu');
    const g = E.begin('fx.mods', s);
    const k = g.foes.map((f) => f.knots);
    const G = L.playerAct(g, { id: 'tech', kind: 'tech', jp: 'あわせ', en: 'Technique', tech: 'suzu' }, OK);
    const others = g.foes.map((f, i) => i).filter((i) => i !== g.cur);
    const want = [['unravel', null, g.cur, 2, null], ['tech', 'suzu', g.cur, null, 'Curtain Call: every move turns back on the one who made it.']].concat(others.map((i) => ['unravel', 'suzu', i, 1, null]));
    t.eq([g.foes.map((f, i) => k[i] - f.knots), told(G.fx || [])], [g.foes.map((f, i) => (i === g.cur ? 2 : 1)), want], '5 Suzu\'s technique in a group: two from the one aimed at, a knot each from the others, as before');
  }
  // ---- 6. a modifier's Unravel on two creatures, one weakened
  {
    const s = camp('ren');
    const st = E.begin('fx.mods', s);
    st.foes[2].loose = 1;
    const k = st.foes.map((f) => f.knots);
    const card = M.extend(E.cards(st, s, s.words.map(W).filter(Boolean)).find((c) => c.kind === 'unravel'), 'ikutsuka', [0, 2]);
    const R = L.playerAct(st, card, OK);
    t.eq([st.foes.map((f, i) => k[i] - f.knots), told(R.fx || []).map((x) => [x[0], x[2], x[3]])], [[1, 0, 2], [['unravel', 0, 1], ['unravel', 2, 2]]], '6 a modifier\'s Unravel on two, one weakened: n 1 and n 2, as before');
  }
  // ---- 7. Nao's Lend a hand
  {
    // the support event as the screen and the choreography read it, and the release after it
    const hand = (fx) => fx.map((f) => (f.t === 'cact' ? ['cact', f.id, f.who, f.foe, f.en, !!f.none] : [f.t, f.by || null, f.foe, f.n]));
    const lend = (knots, res, zero) => {
      const e = { id: 'probe', knots, pattern: ['heat', 'strike', 'rest', 'rest'] };
      const st = L.init(e, camp('nao'), {});
      const P = L.playerAct(st, { kind: 'word', word: W('mizu') }, res || OK, e);
      if (zero) { st.foes[st.cur].knots = 0; st.knots = 0; }
      const k0 = st.knots;
      const fx = L.compAct(st, 'nao_hand', P).fx;
      for (const f of fx) if (f.who === 'nao' && f.en) lines.push(f.en);
      return { k0, k1: st.knots, fx: hand(fx) };
    };
    const HAND = 'Nao lends a hand.', HOLDS = 'Nao reaches in, but the knot holds.';
    const many = lend(3), one = lend(1);
    t.eq([many.k0, many.k1, many.fx], [3, 2, [['cact', 'nao_hand', 'nao', 0, HAND, false], ['unravel', 'nao', 0, 1]]], '7 Lend a hand on a clean answer, several left: "' + HAND + '", then its release, n 1, by Nao; 3 → 2');
    t.eq([one.k0, one.k1, one.fx], [1, 0, [['cact', 'nao_hand', 'nao', 0, HAND, false], ['unravel', 'nao', 0, 1]]], '7 … one left: the same; 1 → 0');
    const late = lend(3, { ok: true, firstTry: false, mistakes: 1 }), none = lend(3, OK, true);
    t.eq([late.k1, late.fx, none.k1, none.fx], [3, [['cact', 'nao_hand', 'nao', 0, HOLDS, true]], 0, [['cact', 'nao_hand', 'nao', 0, HOLDS, true]]],
      '7 answered right but not first time, or no knot left: "' + HOLDS + '" as before, and nothing comes loose');
    const s = camp('nao');
    const st = E.begin('fx.mods', s);
    st.cur = 2;
    const k = st.foes.map((f) => f.knots);
    const P = L.playerAct(st, { kind: 'word', word: W('mizu') }, OK);
    const fx = L.compAct(st, 'nao_hand', P).fx;
    t.eq([st.foes.map((f, i) => k[i] - f.knots), hand(fx)], [[0, 0, 1], [['cact', 'nao_hand', 'nao', 2, HAND, false], ['unravel', 'nao', 2, 1]]], '7 in a group, aimed at the third creature: on that one only');
  }
  // ---- 8. no line of Nao's says that knots come loose
  t.ok(lines.length >= 8 && lines.every((l) => !/knots? comes? loose/i.test(l)), '8 no line of Nao\'s says that knots come loose (' + flat(lines) + ')');
};
