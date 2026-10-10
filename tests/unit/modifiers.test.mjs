// Modifier words (expansion E27; src/engine/95b_modifiers.js, src/content/encounters/10_modifiers.js): each pairing's
// reach and effect, the preview equal to the rule, the trade each makes, the phrase written by each route (and what
// it records), the Hush on modifiers, and the curve's modifier policy: battles keep their length, no modifier
// dominates, and Unravel alone still wins.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, L = RB.combatLogic, E = RB.encounter, M = RB.modifiers;
  const OK = { ok: true, firstTry: true, mistakes: 0 };
  const ALL = ['mamoru', 'mizu', 'hikari', 'kaze', 'nawa', 'ishi', 'iyasu', 'suzu'];
  const camp = (o = {}) => { const s = RB.state.newCampaign({ difficulty: o.difficulty || 'normal' }); s.id = 'mods'; s.comp = o.comp === undefined ? 'ren' : o.comp; s.words = (o.words || ALL).slice(); return s; };
  const wordsOf = (s) => s.words.map((w) => C.words[w]).filter(Boolean);
  const base = (st, s, resp) => E.cards(st, s, wordsOf(s)).find((c) => (resp === 'unravel' ? c.kind === 'unravel' : c.kind === 'word' && c.word.id === resp && (!c.target || c.target === 'pc')));
  const setIntent = (st, i, key, target) => { const it = L.intentDef(st.foes[i].def, key); if (it.target === 'rand' || target) it.target = target || 'pc'; st.foes[i].intent = it; st.foes[i].intent2 = null; };

  const fams = Object.keys(C.modifiers.families);
  t.eq(fams.length, 11, 'eleven modifier families (C-72): ' + fams.join(', '));
  t.ok(C.modifiers.pairs.length >= 13, 'and their authored pairings: ' + C.modifiers.pairs.length);
  {
    const s = camp();
    const st = E.begin('fx.mods', s);
    t.eq(M.offered(st, s).length, 11, 'the fixture offers every modifier');
    const plain = E.begin('fx.ordinary', s);
    t.eq(M.offered(plain, s).length, 0, 'an encounter that does not allow them offers none');
    // taught by a scene: a campaign that has learned すべて has it where modifiers are allowed
    const def = { id: 'tmp.m', lead: 'rw.reedling', rules: { modifiers: true } };
    const s2 = camp(); s2.flags.mod_subete = true;
    t.eq(M.offered(E.begin(def, s2), s2).map((m) => m.id), ['subete'], 'otherwise, only what the player has been taught');
    // an unnatural pairing is not offered, and says why
    t.ok(!M.extend(base(st, s, 'mizu'), 'subete') && /does not read naturally/.test(M.why(base(st, s, 'mizu'), 'subete')), 'すべて does not pair with water: ' + M.why(base(st, s, 'mizu'), 'subete'));
  }

  // ---- each pairing: the preview is the rule ----------------------------------------------------------------------
  for (const p of C.modifiers.pairs) {
    const s = camp();
    const st = E.begin('fx.mods', s);
    const card = M.extend(base(st, s, p.resp), p.mod, p.option === 'who' ? 'comp' : p.option === 'two' ? [0, 1] : p.option === 'leaveOut' ? 2 : null);
    t.ok(!!card, p.mod + '+' + p.resp + ' extends its response');
    const before = JSON.stringify(st);
    const pv = L.previewAct(st, card);
    t.eq(JSON.stringify(st), before, p.mod + '+' + p.resp + ': previewing changes nothing');
    const x = L.snapshot(st);
    const r = L.playerAct(x, card, OK);
    t.eq(JSON.stringify(pv.fx), JSON.stringify(r.fx), p.mod + '+' + p.resp + ': the preview is exactly what the rule does');
    const st2 = M.step(card);
    t.ok(st2.answer && st2.accept.indexOf(st2.answer) >= 0 && st2.byMode.hand.answer && st2.byMode.hand.template.after, p.mod + '+' + p.resp + ': the phrase to write, and its handwritten span with the rest shown');
    t.ok(st2.item.length > st2.byMode.hand.item.length && st2.byMode.hand.item.every((i) => st2.item.indexOf(i) >= 0), p.mod + '+' + p.resp + ': handwriting records only the written span (' + st2.byMode.hand.item.join(', ') + ')');
  }

  // ---- what each does, and what it trades -------------------------------------------------------------------------
  const fresh = () => { const s = camp(); return { s, st: E.begin('fx.mods', s) }; };
  {
    const { s, st } = fresh();
    setIntent(st, 0, 'strike', 'pc'); setIntent(st, 1, 'heat'); setIntent(st, 2, 'charge');
    const r = L.playerAct(st, M.extend(base(st, s, 'mamoru'), 'subete'), OK);
    t.ok(r.answered[0] && r.fx.some((f) => f.t === 'ward' && f.target === 'comp' && f.n === 1), 'すべてを守る: the Strike at you is blocked, a lighter ward (1) stands before your companion');
  }
  {
    const { s, st } = fresh();
    st.foes.forEach((f) => { f.shroud = true; });
    setIntent(st, 0, 'mend'); setIntent(st, 1, 'shroud'); setIntent(st, 2, 'strike');
    const r = L.playerAct(st, M.extend(base(st, s, 'hikari'), 'subete'), OK);
    t.ok(st.foes.every((f) => !f.shroud) && r.answered[1] && !r.answered[0], '光がすべてを照らす: every mist clears and every Shroud is answered, but no Re-tying');
  }
  {
    const { s, st } = fresh();
    setIntent(st, 0, 'charge'); setIntent(st, 1, 'charge'); setIntent(st, 2, 'mend');
    const r = L.playerAct(st, M.extend(base(st, s, 'nawa'), 'subete'), OK);
    t.ok(r.answered[0] && r.answered[1] && !r.answered[2], '縄ですべてを縛る: every Gathering stops, but no Re-tying');
  }
  {
    const { s, st } = fresh();
    st.pc = 5; st.comp = 4;
    L.playerAct(st, M.extend(base(st, s, 'iyasu'), 'zenbu', 'comp'), OK);
    t.ok(st.comp === st.max && st.pc === 5, '傷を全部癒す: all of your companion\'s resolve, none of yours');
  }
  {
    const { s, st } = fresh();
    L.playerAct(st, M.extend(base(st, s, 'mamoru'), 'arayuru', 'pc'), OK);
    L.withFoe(st, 1, () => { setIntent(st, 1, 'sweep'); });
    const pc0 = st.pc;
    const fx = L.withFoe(st, 1, () => L.foeAct(st, false));
    t.ok(st.pc === pc0 && fx.some((f) => f.t === 'block' && f.mod === 'arayuru'), 'あらゆる技から守る: a Sweep (not only a Strike) is stopped before you');
    st.ward.pc = 0;
    const fx2 = L.withFoe(st, 1, () => L.foeAct(st, false));
    t.ok(st.pc < pc0 && !fx2.some((f) => f.mod === 'arayuru'), 'once: the next blow lands');
  }
  {
    const { s, st } = fresh();
    L.playerAct(st, M.extend(base(st, s, 'mamoru'), 'zentai'), OK);
    setIntent(st, 0, 'strike', 'comp');
    const c0 = st.comp;
    L.withFoe(st, 0, () => L.foeAct(st, false));
    t.ok(st.comp === c0 && !st.mods.shield, '全体を守る: one ward around you both takes the first blow, then it is gone');
  }
  {
    const { s, st } = fresh();
    setIntent(st, 0, 'charge'); setIntent(st, 1, 'strike'); setIntent(st, 2, 'strike');
    st.foes[1].intent.signal = true; st.foes[2].intent.cue = true;
    const r = L.playerAct(st, M.extend(base(st, s, 'nawa'), 'zentai'), OK);
    t.ok(r.answered[1] && r.answered[2] && !r.answered[0], '縄で全体を縛る: what the group does together, and nothing else');
  }
  {
    const { s, st } = fresh();
    setIntent(st, 0, 'strike', 'pc'); setIntent(st, 1, 'chill', 'comp'); setIntent(st, 2, 'strike', 'pc');
    const w0 = JSON.stringify(st.ward);
    const r = L.playerAct(st, M.extend(base(st, s, 'mamoru'), 'sorezore'), OK);
    t.ok(r.answered[0] && r.answered[1] && !r.answered[2] && JSON.stringify(st.ward) === w0, 'それぞれを守る: a ward fitted to the blow at each of you (a Strike, a Chill); soaks nothing later');
  }
  {
    const { s, st } = fresh();
    L.playerAct(st, M.extend(base(st, s, 'mamoru'), 'goto'), OK);
    st.ward.pc = 0;
    setIntent(st, 0, 'strike', 'pc'); setIntent(st, 2, 'strike', 'pc');
    const pc0 = st.pc;
    const p0 = L.withFoe(st, 0, () => L.blowOf(st, st.foes[0].intent)).per;
    L.withFoe(st, 0, () => L.foeAct(st, false)); L.withFoe(st, 2, () => L.foeAct(st, false));
    const p2 = L.withFoe(st, 2, () => L.blowOf(st, st.foes[2].intent)).per;
    t.eq(pc0 - st.pc, (p0 - 1) + (p2 - 1), '一回ごとに守る: every blow this exchange is 1 softer');
  }
  {
    const { s, st } = fresh();
    const k = st.foes.map((f) => f.knots);
    L.playerAct(st, M.extend(base(st, s, 'unravel'), 'ikutsuka', [0, 2]), OK);
    t.ok(st.foes[0].knots === k[0] - 1 && st.foes[2].knots === k[2] - 1 && st.foes[1].knots === k[1], '結び目をいくつかほどく: a knot each on the two you chose');
  }
  {
    const { s, st } = fresh();
    setIntent(st, 0, 'mend'); setIntent(st, 1, 'charge'); setIntent(st, 2, 'charge');
    const r = L.playerAct(st, M.extend(base(st, s, 'nawa'), 'taihan', 2), OK);
    t.ok(r.answered[0] && r.answered[1] && !r.answered[2], '縄で大半を縛る: every creature but the one left out, at full strength (Re-tying too)');
  }
  {
    const { s, st } = fresh();
    st.foes.forEach((f) => { f.heat = 2; });
    L.target(st, 1);
    L.playerAct(st, M.extend(base(st, s, 'mizu'), 'takusan'), OK);
    t.ok(st.foes[1].heat === 0 && st.foes[0].heat === 2, '水をたくさんかける: one creature only');
    L.endRound(st, st.foes[0].def);
    setIntent(st, 1, 'heat');
    const fx = L.withFoe(st, 1, () => L.foeAct(st, false));
    t.ok(fx.some((f) => f.t === 'countered' && f.by === 'mod:soaked') && st.foes[1].heat === 0, 'soaked through, it cannot raise Heat the next exchange');
  }
  {
    const { s, st } = fresh();
    L.playerAct(st, M.extend(base(st, s, 'kaze'), 'eien'), OK);
    setIntent(st, 0, 'shroud');
    let fx = L.withFoe(st, 0, () => L.foeAct(st, false));
    t.ok(fx.some((f) => f.by === 'mod:wind') && !st.foes[0].shroud, '風が永遠に吹く: no creature can raise a Shroud while it blows');
    setIntent(st, 1, 'gust');
    L.withFoe(st, 1, () => L.foeAct(st, false));
    setIntent(st, 0, 'shroud');
    fx = L.withFoe(st, 0, () => L.foeAct(st, false));
    t.ok(st.foes[0].shroud, 'until a Gust breaks it');
  }
  {
    const { s, st } = fresh();
    setIntent(st, 0, 'strike', 'pc'); setIntent(st, 1, 'strike', 'comp'); setIntent(st, 2, 'sweep');
    const r = L.playerAct(st, M.extend(base(st, s, 'mamoru'), 'mugen'), OK);
    t.ok(r.answered[0] && r.answered[1] && !r.answered[2], '無限に守る: every Strike this exchange, at either of you (a Sweep is not a Strike)');
  }

  // ---- the Hush on modifiers --------------------------------------------------------------------------------------
  {
    const s = camp({ words: ['suzu', 'mamoru'] });
    const st = E.begin('fx.mods_hush', s);
    E.exchange(st, { card: base(st, s, 'unravel'), res: OK }, {});
    const o = M.offered(st, s);
    t.ok(o.length && o.every((m) => /Hushed for 2 more exchanges/.test(m.hushed || '')), 'a Hush on the modifiers: each says so, for how long, and what ends it');
    E.exchange(st, { card: base(st, s, 'suzu'), res: OK }, {});
    t.ok(M.offered(st, s).every((m) => !m.hushed), 'a bell ends it');
  }

  // ---- the curve's modifier policy (a model result, not playtesting) ------------------------------------------------
  // Policy: the 'smart' player model (each response on each creature, and each companion action, tried on a copy for
  // one exchange), one slip in four, every word of the fixture, every companion action of Chapter 3. "Before
  // modifiers": the same creatures in an encounter without them; "with": every modifier on every response it pairs
  // with, each option tried, the breath and the two-knot rule in force (F-12). The fixture is a hard set piece (three
  // creatures with every kind of move); it is lost alone on Demanding even before modifiers.
  {
    const Sim = RB.combatSim;
    for (const diff of ['normal', 'hard']) {
      let base = 0, withM = 0;
      const lines = [];
      for (const comp of [null, 'nao', 'mio', 'ren', 'suzu']) {
        const o = { difficulty: diff, comp, words: ALL, slips: 4, flags: { ch2_done: true } };
        const plain = Sim.run(null, Object.assign({ encounter: 'fx.mods_base' }, o));
        const mods = Sim.run(null, Object.assign({ encounter: 'fx.mods', mods: true }, o));
        const unB = Sim.run(null, Object.assign({ encounter: 'fx.mods_base', policy: 'unravel' }, o));
        const unM = Sim.run(null, Object.assign({ encounter: 'fx.mods', policy: 'unravel' }, o));
        base += plain.rounds; withM += mods.rounds;
        lines.push((comp || 'alone') + ' ' + plain.rounds + '->' + mods.rounds + ' ' + JSON.stringify(mods.mods || {}));
        t.ok(!plain.win || mods.win, diff + ' ' + (comp || 'alone') + ': modifiers never turn a won fight into a lost one');
        t.ok(!unB.win || unM.win, diff + ' ' + (comp || 'alone') + ': Unravel alone still wins wherever it won before modifiers');
        const top = Math.max(0, ...Object.values(mods.mods || {}));
        t.ok(top <= Math.ceil(mods.rounds * 0.6), diff + ' ' + (comp || 'alone') + ': no modifier dominates (' + JSON.stringify(mods.mods || {}) + ' in ' + mods.rounds + ')');
      }
      t.ok(withM >= Math.ceil(base * 0.7), diff + ': modifiers keep group fights their length, ' + withM + ' exchanges with them against ' + base + ' before (at least 70%): ' + lines.join('; '));
    }
  }
};
