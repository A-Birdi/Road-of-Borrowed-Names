// Inkweaving rules that the battle screen explains (src/engine/95_combat.js):
// Heat scaling and its cap, what a blow will do (the numbers the help text
// shows), Harmony gain and spending, per-companion techniques, and which
// moves each word answers.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const L = RB.combatLogic, C = RB.content;
  const W = (id) => C.words[id];
  const camp = (o) => {
    const s = RB.state.newCampaign({});
    s.learn.difficulty = o.diff || 'normal';
    s.comp = o.comp || null;
    s.words = o.words || ['mamoru', 'mizu', 'hikari', 'iyasu'];
    return s;
  };
  // a foe whose pattern is exactly `pattern`
  const foe = (pattern, knots) => ({ id: 'probe', knots: knots || 9, pattern });
  const ok = { ok: true, firstTry: true, mistakes: 0 };
  const unravel = { kind: 'unravel' };
  const exchange = (st, enemy, card, res) => {
    const { countered } = L.playerAct(st, card, res || ok, enemy);
    const fx = L.enemyAct(st, countered);
    L.endRound(st, enemy);
    return fx;
  };
  const hits = (fx) => fx.filter((f) => f.t === 'hit').reduce((n, f) => n + f.n, 0);

  // ---- Heat: +1 per level, capped; water clears it ------------------------------------
  t.eq([L.HEAT.max, L.HEAT.per], [2, 1], 'Heat is capped at 2 and adds 1 per level');
  {
    const e = foe(['heat', 'strike', 'heat', 'strike', 'heat', 'strike']);
    const st = L.init(e, camp({}), {});
    exchange(st, e, unravel); // heat left unanswered
    t.eq(st.heat, 1, 'an unanswered Heat raises it to 1');
    t.eq(L.blowOf(st, st.intent).per, 3, 'the telegraphed Strike then shows 2 + 1');
    t.eq(hits(exchange(st, e, unravel)), 3, 'and hits for 3 at Heat 1');
    exchange(st, e, unravel);
    t.eq(st.heat, 2, 'a second unanswered Heat raises it to 2');
    t.eq(hits(exchange(st, e, unravel)), 4, 'a Strike hits for 2 + 2 at Heat 2 (levels matter)');
    exchange(st, e, unravel);
    t.eq(st.heat, 2, 'Heat never goes past its cap');
    const water = { kind: 'word', word: W('mizu') };
    const fx = L.playerAct(st, water, ok, e).fx;
    t.ok(st.heat === 0 && fx.some((f) => f.t === 'water'), 'a water word clears all Heat');
  }
  {
    const e = foe(['heat', 'strike']);
    const st = L.init(e, camp({}), {});
    const r = L.playerAct(st, { kind: 'word', word: W('mizu') }, ok, e);
    t.ok(r.countered, 'a water word answers a Heat move before it lands');
    L.enemyAct(st, r.countered);
    t.eq(st.heat, 0, 'an answered Heat move leaves no Heat');
  }

  // ---- what a blow will do: blowOf agrees with enemyAct ----------------------------------
  for (const diff of ['relaxed', 'normal', 'hard']) {
    for (const kind of ['strike', 'sweep', 'flood', 'gust', 'chill', 'lie', 'mirror']) {
      for (const heat of [0, 1, 2]) {
        const e = foe([kind]);
        const st = L.init(e, camp({ diff, comp: 'nao' }), {});
        st.heat = heat;
        const b = L.blowOf(st, st.intent);
        const fx = L.enemyAct(st, false);
        const got = fx.filter((f) => f.t === 'hit').map((f) => f.n);
        const want = b.per > 0 ? b.who.map(() => b.per) : [];
        t.eq(got, want, `${kind} (${diff}, Heat ${heat}): the numbers shown are the ones applied`);
      }
    }
  }
  {
    const e = foe(['sweep']);
    const st = L.init(e, camp({ comp: 'mio' }), {});
    t.eq(L.blowOf(st, st.intent).who, ['pc', 'comp'], 'Sweep is a group attack: it hits both of you');
    const s2 = L.init(foe(['strike']), camp({ comp: 'mio' }), {});
    t.eq(L.blowOf(s2, s2.intent).who.length, 1, 'Strike hits one of you');
    t.eq(L.blowOf(s2, { kind: 'heat', target: 'pc' }), null, 'Heat itself deals no damage');
  }

  // ---- Harmony -----------------------------------------------------------------------------------
  {
    const e = foe(['strike', 'strike', 'strike', 'strike', 'strike']);
    const s = camp({ comp: 'ren' });
    const st = L.init(e, s, {});
    t.eq(st.harmony, 0, 'Harmony starts at 0');
    t.ok(!L.responses(st, s.words.map(W)).some((c) => c.kind === 'tech'), 'no technique before Harmony is full');
    // a clean ward in front of the aimed target cancels the Strike: +1
    const ward = () => ({ kind: 'word', word: W('mamoru'), target: st.intent.target });
    L.playerAct(st, ward(), ok, e); L.enemyAct(st, true); L.endRound(st, e);
    t.eq(st.harmony, 1, 'a clean answer that cancels the move adds 1');
    L.playerAct(st, ward(), { ok: true, firstTry: false, mistakes: 1 }, e); L.enemyAct(st, true); L.endRound(st, e);
    t.eq(st.harmony, 1, 'an answer that needed a retry adds nothing');
    L.playerAct(st, { kind: 'word', word: W('iyasu') }, ok, e); L.enemyAct(st, false); L.endRound(st, e);
    t.eq(st.harmony, 1, 'a response that cancels nothing adds nothing');
    L.playerAct(st, unravel, ok, e); L.enemyAct(st, false); L.endRound(st, e);
    L.playerAct(st, unravel, ok, e); L.enemyAct(st, false); L.endRound(st, e);
    t.eq(st.harmony, 3, 'clean Unravels add 1 each, up to 3');
    const tech = L.responses(st, s.words.map(W)).find((c) => c.kind === 'tech');
    t.ok(tech && tech.en === 'Lantern Ward' && /3-point ward/.test(tech.desc), 'the technique card names this companion\'s technique and its effect: ' + (tech && tech.en));
    const k0 = st.knots, w0 = st.ward.pc;
    const r = L.playerAct(st, tech, ok, e);
    t.ok(r.countered && st.knots === k0 - 1 && st.ward.pc === w0 + 3, 'Lantern Ward: frees 1 knot, a 3-point ward, cancels the move');
    t.eq(st.harmony, 0, 'a technique uses up Harmony (it starts again from 0)');
  }
  for (const [comp, name, knots] of [['nao', 'Read the Opening', 2], ['mio', 'Clearwater Draught', 1], ['ren', 'Lantern Ward', 1], ['suzu', 'Curtain Call', 2]]) {
    const e = foe(['rest']);
    const s = camp({ comp });
    const st = L.init(e, s, {});
    st.harmony = st.harmonyMax; st.heat = 2; st.pc = 3;
    const tech = L.responses(st, s.words.map(W)).find((c) => c.kind === 'tech');
    t.ok(tech && tech.en === name && tech.desc.indexOf(L.TECHS[comp].effect) === 0, comp + ': technique card is ' + name);
    const k0 = st.knots;
    L.playerAct(st, tech, ok, e);
    t.eq(k0 - st.knots, knots, comp + ': ' + name + ' frees ' + knots + ' knot(s), as its text says');
    if (comp === 'mio') t.ok(st.pc === st.max && st.heat === 0, 'Clearwater Draught restores resolve and clears Heat');
  }
  {
    const s = camp({});
    const st = L.init(foe(['strike']), s, {});
    st.harmony = 3;
    t.ok(!L.responses(st, s.words.map(W)).some((c) => c.kind === 'tech'), 'no technique without a companion');
  }

  // ---- which moves a word answers ----------------------------------------------------------------
  t.eq(L.answers(W('mizu')), ['heat'], 'みず answers Heat');
  t.eq(L.answers(W('koori')), ['heat'], 'こおり answers Heat');
  t.eq(L.answers(W('mamoru')), ['strike'], 'まもる cancels a Strike (it only softens Sweep and Flood)');
  t.eq(L.answers(W('hikari')).sort(), ['mend', 'mirror', 'shroud'], 'ひかり answers Shroud, Re-tying and Mirror');
  t.eq(L.answers(W('ishi')).sort(), ['flood', 'gust'], 'いし answers Gust and Flood');
  t.eq(L.answers(W('iyasu')), [], 'いやす answers nothing (it heals)');
  for (const id in C.words) t.ok(typeof C.words[id].effect === 'string' && C.words[id].effect.length > 10, 'word ' + id + ' says what it does');
};
