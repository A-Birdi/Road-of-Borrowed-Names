// RBN-QA-058 and RBN-QA-059: what the battle screen evaluates without acting leaves the battle as it was. The cards'
// "Here:" previews (combatLogic.previewAct), Point, the companion's menu and each standing plan (encounter.ranked,
// through combatSim.look) all run the rules on a copy; the copy now has its own lasting-effects record (`mods`) and its
// own encounter record (a procedure's machine, what is coming), so nothing they try reaches the live state.
//  - Agnes's probes (6311703100): a look ahead and Press against the party ward and a Strike, the wind and a Gust;
//    and each other lasting effect already up, with the move that would use it;
//  - each modifier previewed after one real use (the record exists): the state unchanged;
//  - the real thing still happens: 全体 chosen raises the ward and a Strike spends it; a procedure's action chosen
//    with a plan set applies once, at its own step; a rope or a bell chosen with a plan set turns back what was
//    coming, each once, and says so;
//  - the sweep (Local CL-088): every encounter with a creature in it, and every creature's ordinary battle under the
//    twelve-chapter rules, with each companion, a few real rounds; at each choice the whole state (as JSON, functions
//    aside) is the same after the previews, Point, the menu and each plan (twice) for every card the screen could
//    pass; each plan chooses the same both times; and each encounter record is plain data (what the copy is made
//    from).
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, L = RB.combatLogic, E = RB.encounter, M = RB.modifiers, S = RB.combatSim;
  const OK = { ok: true, firstTry: true, mistakes: 0 };
  const ALL = ['mamoru', 'mizu', 'hikari', 'kaze', 'nawa', 'ishi', 'iyasu', 'suzu', 'koe', 'honoo'];
  const PLANS = ['protect', 'reveal', 'press'];
  const camp = (comp) => { const s = RB.state.newCampaign({ difficulty: 'normal' }); s.id = 'purity'; s.comp = comp === undefined ? 'ren' : comp; s.words = ALL.slice(); return s; };
  const wordsOf = (s) => s.words.map((w) => C.words[w]).filter(Boolean);
  const J = (o) => JSON.stringify(o, (k, v) => (typeof v === 'function' ? undefined : v));
  const parts = (st) => { const o = {}; for (const k of Object.keys(st)) { if (k === 'enc' && st.enc) { for (const e of Object.keys(st.enc)) if (e !== 'def') o['enc.' + e] = J(st.enc[e]); } else o[k] = J(st[k]); } return o; };
  const changed = (a, b) => [...new Set([...Object.keys(a), ...Object.keys(b)])].filter((k) => a[k] !== b[k]);
  const base = (st, s, resp) => E.cards(st, s, wordsOf(s)).find((c) => c.kind === 'word' && c.word.id === resp && (!c.target || c.target === 'pc'));
  const allIntents = (st, key) => st.foes.forEach((f) => { const it = L.intentDef(f.def, key); if (it.target === 'rand' || it.target === 'both') it.target = 'pc'; f.intent = it; f.intent2 = null; });
  // everything the screen evaluates without acting, for one card
  const evaluate = (st, s, card) => {
    const words = wordsOf(s), T = st.cur;
    try { L.previewAct(st, card); } catch (e) { /* as the screen: no line */ }
    S.look(st, card, T, null, null);
    E.compMenu(st, s, card, words, T);
    for (const plan of PLANS) E.planned(st, s, card, plan, words, T);
    L.target(st, T);
  };

  // ---- Agnes's probes, and each lasting effect already up ---------------------------------------------------------
  const up = [
    ['the party ward (全体) against a Strike', { shield: true }, 'strike'],
    ['the wind (永遠に) against a Gust', { wind: true }, 'gust'],
    ['a ward against any blow (あらゆる) against a Strike', { any: { pc: true } }, 'strike'],
    ['a small ward before every blow this round (ごとに) against a Strike', (st) => ({ perBlow: st.round }), 'strike'],
    ['every Strike blocked this round (無限に) against a Strike', (st) => ({ unlimited: st.round }), 'strike'],
    ['soaked (たくさん) against Heat', (st) => ({ soaked: { [st.cur]: st.round + 1 } }), 'heat'],
  ];
  for (const [what, m, key] of up) {
    const s = camp();
    const st = E.begin('fx.mods', s);
    st.mods = typeof m === 'function' ? m(st) : JSON.parse(JSON.stringify(m));
    allIntents(st, key);
    const before = parts(st), mods0 = J(st.mods);
    for (const card of E.cards(st, s, wordsOf(s)).filter((c) => !c.disabled)) evaluate(st, s, card);
    const diff = changed(before, parts(st));
    t.ok(!diff.length, what + ': previews, a look ahead, the menu and each plan leave the battle as it was (' + mods0 + ' -> ' + J(st.mods) + '; changed: ' + diff.join(', ') + ')');
  }
  {
    // the probe exactly: Press with the ward up, a Strike at you
    const s = camp();
    const st = E.begin('fx.mods', s);
    st.mods = { shield: true };
    allIntents(st, 'strike');
    E.planned(st, s, base(st, s, 'hikari'), 'press', wordsOf(s), st.cur);
    t.eq(st.mods, { shield: true }, 'Press planned with the party ward up and a Strike coming: the ward is still up');
  }

  // ---- each modifier previewed after one real use -----------------------------------------------------------------
  for (const fam of Object.keys(C.modifiers.families)) {
    const s = camp();
    const st = E.begin('fx.mods', s);
    L.playerAct(st, M.extend(base(st, s, 'mamoru'), 'subete'), OK);
    const cards = E.cards(st, s, wordsOf(s)).map((c) => (!c.disabled && (c.kind === 'word' || c.kind === 'unravel') ? M.extend(c, fam, null) : null)).filter(Boolean);
    const before = parts(st);
    for (const c of cards) { try { L.previewAct(st, c); } catch (e) { /* no line */ } }
    const diff = changed(before, parts(st));
    t.ok(cards.length && !diff.length, fam + ': after one real modifier, its "Here:" previews (' + cards.length + ') leave the battle as it was (changed: ' + diff.join(', ') + '; mods ' + J(st.mods) + ')');
  }

  // ---- the real thing still happens -------------------------------------------------------------------------------
  {
    const s = camp();
    const st = E.begin('fx.mods', s);
    L.playerAct(st, M.extend(base(st, s, 'mamoru'), 'subete'), OK);
    const zen = M.extend(base(st, s, 'mamoru'), 'zentai');
    L.previewAct(st, zen);
    t.ok(!st.mods.shield, '全体 previewed: no ward (' + J(st.mods) + ')');
    L.playerAct(st, zen, OK);
    t.ok(st.mods.shield === true, '全体 chosen: the ward is up');
    allIntents(st, 'strike');
    const efx = E.foes(st, { answered: st.foes.map(() => false) }).efx;
    t.ok(st.mods.shield === false && efx.some((f) => f.t === 'block' && f.mod === 'zentai'), 'and the first Strike that lands spends it (' + J(efx.filter((f) => f.t === 'block')) + ')');
  }
  for (const id of ['kr.moss_steps', 'gd.rw', 'gd.ko', 'mb.boss', 'mp.boss']) {
    for (const comp of ['ren', 'nao', 'mio', 'suzu']) {
      const s = camp(comp);
      const st = E.begin(id, s);
      const card = E.cards(st, s, wordsOf(s)).find((c) => (c.kind === 'proc' || c.kind === 'resolve') && !c.disabled && c.action && c.action.ok);
      if (!card) { t.ok(false, id + ': a procedure action that is right now'); continue; }
      const p = st.enc.proc, step0 = p.step, id0 = p.steps[step0].id, before = parts(st);
      let threw = null, done = null;
      try {
        for (const plan of PLANS) E.planned(st, s, card, plan, wordsOf(s), st.cur);
      } catch (e) { threw = 'a plan: ' + e.message; }
      const diff = changed(before, parts(st));
      try { done = E.player(st, card, OK).fx.find((f) => f.t === 'proc'); } catch (e) { threw = threw || 'the action: ' + e.message; }
      t.ok(!threw && !diff.length && st.enc.proc.step === step0 + 1 && done && done.ok && done.step === id0, id + ' with ' + comp + ': each plan considered, then "' + card.action.id + '" chosen: applied once, at its own step (' + J({ threw, changed: diff, step: [step0, st.enc.proc.step], fx: done && { ok: done.ok, step: done.step } }) + ')');
    }
  }
  {
    // the Cloud Ox Elder: a rope turns back the herd coming up the path (from the start, as authored)
    const s = camp();
    const st = E.begin('gd.cr', s);
    const rope = base(st, s, 'nawa');
    const near = E.coming(st).length;
    for (const plan of PLANS) E.planned(st, s, rope, plan, wordsOf(s), st.cur);
    const waiting = st.enc.arrivals.filter((a) => a.state === 'waiting').length;
    const P = E.player(st, rope, OK);
    const turned = st.enc.arrivals.filter((a) => a.state === 'prevented').length, said = P.fx.filter((f) => f.t === 'prevent').length;
    t.ok(near && waiting === st.enc.arrivals.length && turned >= 1 && st.enc.prevented === turned && said === turned, 'the Cloud Ox Elder: each plan considered with the rope, nothing turned back; then the rope chosen turns back what was coming, each once, and says so for each (' + J({ near, waiting, turned, prevented: st.enc.prevented, said }) + ')');
  }
  {
    // the Sister Star: a bell calls back the little lights, once she is low enough for them to come
    const s = camp();
    const st = E.begin('gd.sb', s);
    st.foes[0].knots = 4;
    const bell = base(st, s, 'suzu');
    const near = E.coming(st).length;
    for (const plan of PLANS) E.planned(st, s, bell, plan, wordsOf(s), st.cur);
    const waiting = st.enc.arrivals.filter((a) => a.state === 'waiting').length;
    const P = E.player(st, bell, OK);
    const turned = st.enc.arrivals.filter((a) => a.state === 'prevented').length, said = P.fx.filter((f) => f.t === 'prevent').length;
    t.ok(near && waiting === st.enc.arrivals.length && turned >= 1 && st.enc.prevented === turned && said === turned, 'the Sister Star: each plan considered with the bell, nothing called back; then the bell chosen calls back what was coming, each once, and says so for each (' + J({ near, waiting, turned, prevented: st.enc.prevented, said }) + ')');
  }

  // ---- the sweep --------------------------------------------------------------------------------------------------
  const plain = (v, path, out) => {
    // (an undefined field is left out of the copy, and reads the same: undefined)
    if (typeof v === 'function' || (typeof v === 'number' && !Number.isFinite(v))) out.push(path);
    else if (v && typeof v === 'object') {
      // (made in the game's own context: its Object is not this file's, so the kind is read from the tag)
      const tag = Object.prototype.toString.call(v);
      if (tag !== '[object Array]' && tag !== '[object Object]') out.push(path + ' (' + tag + ')');
      else for (const k of Object.keys(v)) plain(v[k], path + '.' + k, out);
    }
    return out;
  };
  const defs = Object.keys(C.encounters).filter((id) => C.encounters[id].lead).map((id) => C.encounters[id]);
  for (const e of Object.keys(C.enemies)) defs.push({ id: 'purity.' + e, lead: e, rules: { modifiers: true, conditions: true, doubles: true } });
  let states = 0;
  const dirty = {}, notPlain = {}, twice = {};
  for (const def of defs) for (const comp of ['ren', 'nao', 'mio', 'suzu']) {
    const s = camp(comp);
    for (const f of Object.keys(C.modifiers.families)) s.flags['mod_' + f] = true;
    const words = wordsOf(s);
    const st = E.begin(def, s);
    for (let round = 0; round < 6 && !st.over; round++) {
      const T = st.cur;
      const cards = E.cards(st, s, words).filter((c) => !c.disabled);
      const mods = M.offered(st, s).filter((m) => !m.hushed);
      if (mods.length && !st.mods) st.mods = {};
      const chosen = cards.slice();
      for (const c of cards) for (const m of mods) { const x = (c.kind === 'word' || c.kind === 'unravel') && M.extend(c, m.id, null); if (x) chosen.push(x); }
      states++;
      const np = [];
      for (const k of Object.keys(st.enc)) if (k !== 'def') plain(st.enc[k], 'enc.' + k, np);
      if (np.length) notPlain[def.id] = np;
      const before = parts(st);
      for (const c of chosen) { try { L.previewAct(st, c); } catch (e) { /* no line */ } }
      E.pointCards(st, s, words);
      // each plan's choice, evaluated twice: the same both times
      if (st.compId && st.comp > 0) for (const c of chosen) {
        E.compMenu(st, s, c, words, T);
        for (const plan of PLANS) {
          const a = E.planned(st, s, c, plan, words, T), b = E.planned(st, s, c, plan, words, T);
          if ((a && a.def.id) !== (b && b.def.id)) (twice[def.id] = twice[def.id] || []).push(comp + ' r' + round + ' ' + c.id + ' ' + plan);
        }
        L.target(st, T);
      }
      const diff = changed(before, parts(st));
      if (diff.length) (dirty[def.id] = dirty[def.id] || new Set()).add(comp + ' r' + round + ': ' + diff.join(','));
      const c = S.choose(st, words, s, { policy: 'smart' });
      if (!c || !c.card) break;
      try { E.exchange(st, { card: c.card, res: OK, comp: c.act ? { act: c.act, target: c.actTarget } : null, target: c.target }, { impl: S.core }); } catch (e) { break; }
    }
  }
  t.ok(states > 1500, 'the sweep reached ' + states + ' choices in ' + defs.length + ' encounters with four companions');
  t.eq(Object.keys(dirty).map((id) => id + ' ' + [...dirty[id]].slice(0, 2).join(' | ')), [], 'no preview, Point, menu or plan changed the battle at any of them');
  t.eq(twice, {}, 'each plan, evaluated twice at the same choice, chose the same both times');
  t.eq(notPlain, {}, 'every encounter record is plain data (the look ahead\'s copy is made from it)');
};
