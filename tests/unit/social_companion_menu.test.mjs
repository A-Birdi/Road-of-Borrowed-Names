// A conversation's companion actions (Agnes 6532997433, 6533320027; Local CL-525, CL-526; Cloud CC-376 §2): in a
// conversation the companion's turn takes only the encounter's own authored actions (socialCompanion), but the battle
// screen's menu, its ranking and the standing plans also offered the companion's ordinary moves, which did nothing
// there; and the dispatch did not check an authored action's own condition or once, so mb.dispute's nao_route (the
// same id as Nao's ordinary Seize the opening) could be applied before its claim, and again. In node, with every
// ordinary move unlocked:
//  1. every conversation, every companion: the menu offers the authored actions only, and no plan picks anything (so
//     the screen opens the menu, where the authored action can be chosen);
//  2. kr.hyakuwa and ko.gardener, Nao: the menu is nao_seal / nao_sort; chosen, its line and its effect, its use counted
//     once; then the menu is empty and a second dispatch does nothing; an ordinary move dispatched there does nothing;
//  3. mb.dispute's nao_route: before its claim, not offered and not applied when dispatched; after it, offered and
//     applied once, then not again;
//  4. the automated player: in a conversation it picks an authored action or none, never an ordinary move, and its
//     choosing leaves the conversation as it was;
//  5. unchanged: a creature battle (Seize the opening) and a procedure (Lend a hand) offer the ordinary moves, the plans
//     pick them as before, and the move chosen takes effect.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, E = RB.encounter, S = RB.state;
  const OK = { ok: true, firstTry: true, mistakes: 0 };
  const PLANS = ['protect', 'reveal', 'press'];
  const camp = (comp) => {
    const s = S.newCampaign({ edition: 2 }); s.comp = comp;
    Object.assign(s.flags, { lq_ally1: true, lq_ally2: true, ch2_done: true, ch3_done: true, ch4_done: true, ch5_done: true });
    for (const q of ['lf_nao', 'lf_mio', 'ren_ushio', 'co_suzu']) s.quests[q] = { stage: 9, done: true, t: 1 };
    s.words = ['mamoru', 'mizu', 'hikari', 'kaze', 'nawa', 'ishi', 'koori', 'honoo', 'suzu', 'koe', 'iyasu'];
    RB.game.s = s; RB.game.G.s = s;
    return s;
  };
  const wordsOf = (s) => s.words.map((w) => C.words[w]).filter(Boolean);
  const begin = (id, comp) => { const s = camp(comp); const st = E.begin(id, s); return { s, st, card: () => E.cards(st, s, wordsOf(s))[0] }; };
  const menu = (x) => { const m = E.compMenu(x.st, x.s, x.card(), wordsOf(x.s), x.st.cur); return m.shown.concat(m.more).map((o) => o.def.id); };
  const plans = (x) => PLANS.map((p) => ((E.planned(x.st, x.s, x.card(), p, wordsOf(x.s), x.st.cur) || {}).def || {}).id || null);
  const play = (x, act) => E.exchange(x.st, { card: x.card(), res: OK, comp: act ? { act } : null }, {});
  const kinds = (ev) => (ev.cfx || []).map((f) => f.t + (f.id ? ':' + f.id : ''));

  // ---- 1. every conversation, every companion
  const social = Object.keys(C.encounters).filter((id) => C.encounters[id].social);
  const wrong = [];
  let n = 0;
  for (const id of social) for (const comp of ['nao', 'mio', 'ren', 'suzu']) {
    const x = begin(id, comp);
    n++;
    const authored = E.companionOptions(x.st, x.s).map((o) => o.def.id);
    const m = menu(x), p = plans(x);
    if (m.join() !== authored.join() || p.some(Boolean)) wrong.push(id + '/' + comp + ': menu ' + m.join(',') + ' (authored ' + authored.join(',') + ') plans ' + p.join(','));
  }
  t.ok(social.length === 29 && n === 116 && !wrong.length, '1 all ' + n + ' conversation/companion pairs: the authored actions only, and no plan picks anything' + (wrong.length ? ': ' + wrong.slice(0, 4).join(' | ') : ''));

  // ---- 2. kr.hyakuwa and ko.gardener, Nao
  for (const [id, act] of [['kr.hyakuwa', 'nao_seal'], ['ko.gardener', 'nao_sort']]) {
    const x = begin(id, 'nao');
    const m0 = menu(x), p0 = plans(x);
    const ev = play(x, act);
    const once = x.st.compUses[act] || 0, m1 = menu(x);
    const ev2 = play(x, act);
    const y = begin(id, 'nao');
    const evo = play(y, 'nao_hand');
    t.ok(m0.join() === act && p0.every((v) => v === null) && kinds(ev).includes('cact:' + act) && once === 1 && !m1.length && !kinds(ev2).length && (x.st.compUses[act] || 0) === 1 &&
      !kinds(evo).length && !y.st.compUses.nao_hand,
    '2 ' + id + ': ' + act + ' offered alone, no plan; chosen once with its line, then gone; an ordinary move does nothing there (' + JSON.stringify({ m0, p0, ev: kinds(ev), once, m1, ev2: kinds(ev2), evo: kinds(evo) }) + ')');
  }

  // ---- 3. mb.dispute's nao_route
  {
    const x = begin('mb.dispute', 'nao');
    const offered0 = E.companionOptions(x.st, x.s).map((o) => o.def.id).join(',');
    const ev0 = play(x, 'nao_route');
    const before = { offered: offered0, cfx: kinds(ev0), uses: x.st.compUses.nao_route || 0, revealed: !!x.st.enc.social.revealed.c4 };
    x.st.enc.social.revealed.c4 = true; // its claim known
    const offered1 = E.companionOptions(x.st, x.s).map((o) => o.def.id).join(',');
    const ev1 = play(x, 'nao_route');
    const uses1 = x.st.compUses.nao_route || 0;
    const ev2 = play(x, 'nao_route');
    t.ok(before.offered === '' && !before.cfx.length && before.uses === 0 && offered1 === 'nao_route' && kinds(ev1).includes('cact:nao_route') && uses1 === 1 && !kinds(ev2).length && (x.st.compUses.nao_route || 0) === 1,
      '3 mb.dispute: nao_route not applied before its claim; after it, applied once, then not again (' + JSON.stringify({ before, offered1, ev1: kinds(ev1), uses1, ev2: kinds(ev2) }) + ')');
  }

  // ---- 4. the automated player
  {
    const out = [];
    for (const id of ['kr.hyakuwa', 'ko.gardener', 'mb.dispute']) {
      const x = begin(id, 'nao');
      const was = JSON.stringify({ social: x.st.enc.social, uses: x.st.compUses });
      const pick = RB.combatSim.choose(x.st, wordsOf(x.s), x.s, {});
      const authored = E.companionOptions(x.st, x.s).map((o) => o.def.id);
      out.push({ id, act: pick.act, ok: (pick.act == null || authored.includes(pick.act)) && JSON.stringify({ social: x.st.enc.social, uses: x.st.compUses }) === was });
    }
    t.ok(out.every((o) => o.ok), '4 the automated player picks an authored action or none, and choosing leaves the conversation as it was (' + JSON.stringify(out) + ')');
  }

  // ---- 5. unchanged outside conversations: Seize the opening in a creature battle, Lend a hand in a procedure (gd.rw,
  // which the battle screen runs; a procedure with no creatures opens on the encounter sheet, which offers no ordinary move)
  const ORD = 'nao_opening,nao_warn,nao_hand,nao_route,nao_mark';
  for (const [id, act, fx] of [['fx.ordinary', 'nao_route', 'stun'], ['gd.rw', 'nao_hand', 'unravel']]) {
    const x = begin(id, 'nao');
    const m = menu(x), p = plans(x);
    const ev = play(x, act);
    t.ok(!C.encounters[id].social && m.join() === ORD && p.join() === 'nao_warn,nao_opening,nao_hand' && kinds(ev).join() === 'cact:' + act + ',' + fx && (x.st.compUses[act] || 0) === 1,
      '5 ' + id + (C.encounters[id].procedure ? ' (a procedure)' : ' (a creature battle)') + ': the ordinary moves and the plans as before; ' + act + ' applied and counted (' + JSON.stringify({ m, p, cfx: kinds(ev) }) + ')');
  }
};
