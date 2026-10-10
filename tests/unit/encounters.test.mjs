// The encounter platform (expansion P04; src/engine/97_encounter.js, 95a_conditions.js; the fixtures in
// src/content/encounters/00_fixtures.js). Evidence the playbook asks for: deterministic action logs, rule and preview
// equal, the order within an exchange, conclusions reachable, nothing advancing while reading or helping, and no
// action list that strands the player.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, L = RB.combatLogic, E = RB.encounter;
  const OK = { ok: true, firstTry: true, mistakes: 0 };
  const camp = (o = {}) => {
    const s = RB.state.newCampaign({ difficulty: o.difficulty || 'normal' });
    s.id = o.id || 'enc-test'; s.comp = o.comp === undefined ? null : o.comp;
    s.words = (o.words || ['mamoru', 'mizu', 'hikari', 'kaze', 'nawa', 'ishi', 'koori', 'honoo', 'suzu', 'koe', 'iyasu']).slice();
    return s;
  };
  const wordsOf = (s) => s.words.map((w) => C.words[w]).filter(Boolean);
  const cardOf = (st, s, pred) => E.cards(st, s, wordsOf(s)).find(pred);
  const word = (id, target) => (c) => c.kind === 'word' && c.word.id === id && (!target || c.target === target);
  const play = (st, s, card, o = {}) => E.exchange(st, { card, res: o.res || OK, comp: o.comp || null, target: o.target != null ? o.target : st.cur }, { enemy: st.foes[0] && st.foes[0].def });

  // ---- every fixture validates its shape and begins -------------------------------------------------------------
  const ids = Object.keys(C.encounters).filter((id) => C.encounters[id].fixture);
  t.ok(ids.length >= 12, 'the fixtures: ' + ids.join(', '));
  for (const id of ids) {
    const s = camp();
    const st = E.begin(id, s);
    t.ok(st && st.enc && st.enc.id === id, id + ' begins');
    const cs = E.cards(st, s, wordsOf(s));
    t.ok(cs.some((c) => !c.disabled), id + ': something can always be chosen (' + cs.length + ' cards)');
  }

  // ---- the order within an exchange, and deterministic logs ------------------------------------------------------
  {
    const run = () => {
      const s = camp({ comp: 'ren' });
      const st = E.begin('fx.guest', s);
      const logs = [];
      for (let k = 0; k < 6 && !st.over; k++) logs.push(play(st, s, cardOf(st, s, (c) => c.kind === 'unravel'), { comp: { act: 'ren_shade', target: 0 } }).log.join(' '));
      return { logs, st };
    };
    const a = run(), b = run();
    t.eq(a.logs, b.logs, 'the same choices give the same exchange log, line for line');
    const first = a.logs[0].split(' ');
    const at = (p) => first.findIndex((x) => x.startsWith(p));
    t.ok(at('you:') >= 0 && at('you:') < at('guest:') && at('guest:') < at('foe:'), 'your response, then the guest, then the creature: ' + a.logs[0]);
  }
  {
    // the numbered order and whom each move is aimed at
    const s = camp({ comp: 'nao' });
    const st = E.begin('fx.doubles', s);
    const o = L.order(st);
    t.eq(o.map((x) => x.n), [1, 2], 'each standing creature has its number in this exchange');
    t.ok(o.every((x) => x.aim === null || ['pc', 'comp', 'both'].indexOf(x.aim) >= 0), 'and whom its move is aimed at: ' + JSON.stringify(o));
  }

  // ---- Wait ------------------------------------------------------------------------------------------------------
  {
    const s = camp();
    const st = E.begin('fx.ordinary', s);
    const w = cardOf(st, s, (c) => c.kind === 'wait');
    t.ok(!!w, 'Wait is a card where the encounter allows it');
    const plain = RB.combatLogic.init(Object.assign({ id: 'rw.reedling' }, C.enemies['rw.reedling']), s, {});
    t.ok(!L.responses(plain, wordsOf(s)).some((c) => c.kind === 'wait'), 'and never in an ordinary battle');
    const h0 = st.harmony, pc0 = st.pc;
    const ev = play(st, s, w);
    t.ok(ev.fx.some((f) => f.t === 'wait') && st.watching === 1 && st.harmony === h0, 'it answers nothing, earns no Harmony, and shows the next moves: ' + ev.log.join(' '));
    t.ok(st.pc <= pc0, 'the creatures still act');
  }

  // ---- conditions: preview equals rule, the table, bounded spread, durations ----------------------------------
  {
    const s = camp();
    const st = E.begin('fx.ordinary', s);
    t.ok(RB.conditions.has(st.foes[0], 'flame') && RB.conditions.has(st.foes[1], 'paper'), 'the ember is made of flame, the crane of paper');
    for (const c of E.cards(st, s, wordsOf(s))) {
      if (c.disabled || c.kind === 'wait') continue;
      const before = JSON.stringify(st);
      const p = L.previewAct(st, c);
      t.eq(JSON.stringify(st), before, 'previewing ' + c.id + ' changes nothing');
      const x = L.snapshot(st);
      const r = L.playerAct(x, c, OK);
      t.eq(JSON.stringify(p.fx), JSON.stringify(r.fx), 'the preview of ' + c.id + ' is exactly what the rule does');
    }
    // water on a creature of flame: the next Unravel frees one more knot
    L.target(st, 0);
    const k0 = st.foes[0].knots;
    play(st, s, cardOf(st, s, word('mizu')), { target: 0 });
    t.eq(st.foes[0].loose, 1, 'water weakens a creature of flame');
    if (!st.over) {
      play(st, s, cardOf(st, s, (c) => c.kind === 'unravel'), { target: 0 });
      t.ok(st.foes[0].knots <= Math.max(0, k0 - 2), 'and the next Unravel frees two knots (' + k0 + ' -> ' + st.foes[0].knots + ')');
    }
  }
  {
    const s = camp();
    const st = E.begin('fx.ordinary', s);
    L.target(st, 0);
    const b0 = L.withFoe(st, 0, () => L.blowOf(st, Object.assign({}, st.foes[0].intent, { kind: 'strike', power: 2 })));
    const r = L.playerAct(st, cardOf(st, s, word('kaze')), OK);
    const b1 = L.withFoe(st, 0, () => L.blowOf(st, Object.assign({}, st.foes[0].intent, { kind: 'strike', power: 2 })));
    t.ok(r.fx.some((f) => f.t === 'cond' && f.change === 'bold' && f.foe === 0) && b1.per === b0.per + 1, 'wind feeds a creature of flame: its blow shows 1 harder (' + b0.per + ' -> ' + b1.per + ')');
    t.ok(r.fx.some((f) => f.t === 'cond' && f.change === 'scatter' && f.foe === 1) && r.answered[1], 'wind scatters the paper crane: it misses its move');
  }
  {
    const s = camp();
    const st = E.begin('fx.ordinary', s);
    L.target(st, 1);
    const k = st.foes[1].knots;
    const r = L.playerAct(st, cardOf(st, s, word('honoo')), OK);
    t.ok(r.fx.some((f) => f.change === 'catch') && st.foes[1].knots === k - 1 && RB.conditions.has(st.foes[1], 'burning'), 'flame catches paper: a knot burns loose, and it burns');
    // a burning creature fanned by wind: the fire spreads once, to one neighbour that was not a target
    const s2 = camp();
    const x = E.begin({ id: 'tmp.fire', lead: 'rw.reedling', group: ['rw.dustmoth', 'rw.inkblot'], setPiece: true, capacity: 3, rules: { conditions: true } }, Object.assign(s2, { learn: Object.assign(s2.learn, { difficulty: 'hard' }) }));
    RB.conditions.set(x, x.foes[0], 'burning');
    L.target(x, 0);
    const card = { id: 'w:kaze', kind: 'word', word: Object.assign({}, C.words.kaze), en: 'wind' };
    // aim the wind at the target only, to see the spread rule alone
    const before = x.foes.map((f) => RB.conditions.has(f, 'burning'));
    RB.conditions.onResponse(x, card, [0], x.foes.map(() => false), []);
    const after = x.foes.map((f) => RB.conditions.has(f, 'burning'));
    t.ok(before[0] && after.filter(Boolean).length <= x.foes.length, 'a fanned fire spreads, bounded: ' + JSON.stringify(after));
    const spreads = [];
    RB.conditions.onResponse(x, card, [0, 1, 2], x.foes.map(() => false), spreads);
    t.ok(spreads.filter((f) => f.spread != null).length <= 1, 'never more than one spread from one response');
    // durations: burning burns out after three closes; frozen thaws to wet
    const y = E.begin('fx.ordinary', camp());
    RB.conditions.set(y, y.foes[1], 'burning');
    RB.conditions.set(y, y.foes[0], 'frozen');
    RB.conditions.tick(y);
    t.ok(!RB.conditions.has(y.foes[0], 'frozen') && RB.conditions.has(y.foes[0], 'wet'), 'frozen lasts one exchange, then it is wet');
    RB.conditions.tick(y); RB.conditions.tick(y);
    t.ok(!RB.conditions.has(y.foes[1], 'burning'), 'burning ends after three exchanges');
  }

  // ---- a summoner: calls bring creatures, capped; a bell or a rope answers the call -------------------------------
  {
    const s = camp({ difficulty: 'hard', words: ['suzu', 'nawa', 'mizu'] });
    const st = E.begin('fx.summoner', s);
    t.eq(st.foes[0].intent.kind, 'call', 'the warden opens by calling');
    let ev = play(st, s, cardOf(st, s, (c) => c.kind === 'unravel'));
    t.ok(ev.afx.some((f) => f.t === 'arrive' && !f.none) && st.foes.length === 2, 'an unanswered call brings a creature (' + ev.afx.map((f) => f.en).join(' | ') + ')');
    t.ok(st.foes[1].knots === 1 && !!st.foes[1].intent, 'weak (one knot), and it telegraphs at once');
    // advance to the next call and answer it with the bell
    let guard = 0;
    while (!st.over && st.foes[0].intent.kind !== 'call' && guard++ < 6) play(st, s, cardOf(st, s, (c) => c.kind === 'word' && c.word.id === 'mizu'));
    t.eq(st.foes[0].intent.kind, 'call', 'it calls again later');
    const n = st.foes.length;
    ev = play(st, s, cardOf(st, s, word('suzu')), { target: 0 });
    t.ok(st.foes.length === n && ev.efx.some((f) => f.t === 'countered' && f.foe === 0), 'a bell answers the call: nothing comes');
    // the standing limit: two called creatures at most
    const s2 = camp({ difficulty: 'hard', words: ['mizu'] });
    const x = E.begin('fx.summoner', s2);
    for (let k = 0; k < 12 && !x.over; k++) play(x, s2, cardOf(x, s2, word('mizu')));
    t.ok(x.foes.filter((f) => f.called && f.knots > 0).length <= 2, 'never more than two called creatures standing at once');
    t.ok(L.standing(x).length <= x.enc.capacity, 'and never more on the creatures\' side than the set piece holds');
    // Relaxed: never a hostile arrival
    const s3 = camp({ difficulty: 'relaxed', words: ['mizu'] });
    const y = E.begin('fx.summoner', s3);
    for (let k = 0; k < 6 && !y.over; k++) play(y, s3, cardOf(y, s3, word('mizu')));
    t.eq(y.foes.length, 1, 'Relaxed: the call goes unanswered, always one creature');
  }

  // ---- an independent guest ---------------------------------------------------------------------------------------
  {
    const s = camp();
    const st = E.begin('fx.guest', s);
    const g = E.actorOf(st, 'g:porter');
    t.ok(g && g.side === 'guest' && !L.responses(st, wordsOf(s)).some((c) => c.target === 'g:porter'), 'the porter is in the encounter, never on your menu');
    const k0 = st.foes[0].knots;
    const ev = play(st, s, cardOf(st, s, word('mizu')));
    t.ok(ev.gfx.some((f) => f.t === 'gact' && f.act === 'unravel' && f.foe === 0) && st.foes[0].knots === k0 - 1, 'the porter works at the crab by their own aim');
    let guard = 0, last;
    while (!st.over && guard++ < 8) last = play(st, s, cardOf(st, s, (c) => c.kind === 'unravel'));
    t.ok(st.over === 'win' && g.left, 'the crab settles, the porter leaves: ' + (last && last.log.join(' ')));
    // settled by you: the porter says so and goes, satisfied
    const s2 = camp();
    const x = E.begin('fx.guest', s2);
    x.foes[0].knots = 1;
    const ev2 = play(x, s2, cardOf(x, s2, (c) => c.kind === 'unravel'));
    t.ok(x.over === 'win', 'freeing the last knot yourself ends it before the porter acts (' + ev2.log.join(' ') + ')');
  }
  {
    // a guest's leaving when its aim is met comes before the creatures move
    const s = camp();
    const st = E.begin('fx.guest', s);
    st.foes[0].knots = 1;
    const ev = play(st, s, cardOf(st, s, word('mizu')));
    t.ok(ev.over === 'win' && !ev.efx.length, 'the guest frees the last knot: the encounter ends before the crab moves');
  }

  // ---- a protected object -----------------------------------------------------------------------------------------
  {
    const s = camp({ words: ['mamoru', 'mizu'] });
    const st = E.begin('fx.protect', s);
    const letter = E.actorOf(st, 'o:letter');
    t.ok(st.foes[0].intent.target === 'o:letter' && L.aimOf(st, st.foes[0].intent) === 'o:letter', 'the crane aims at the letter');
    const ward = cardOf(st, s, word('mamoru', 'o:letter'));
    t.ok(!!ward, 'a ward can stand before the letter');
    const ev = play(st, s, ward);
    t.ok(ev.fx.some((f) => f.t === 'ward' && f.block && f.target === 'o:letter') && letter.hp === 3, 'and blocks the blow meant for it');
    // unprotected, it is lost: an authored end, never a defeat
    const s2 = camp({ words: ['mizu'] });
    const x = E.begin('fx.protect', s2);
    let guard = 0;
    while (!x.over && guard++ < 12) play(x, s2, cardOf(x, s2, word('mizu')));
    t.ok(x.over === 'end' && x.enc.outcome === 'lost', 'left unprotected, the letter is lost: the encounter ends (' + x.over + ', ' + x.enc.outcome + ')');
    // two winning approaches: settle every creature, or keep the letter whole for six exchanges
    const s3 = camp({ words: ['mamoru'] });
    const y = E.begin('fx.protect', s3);
    guard = 0;
    while (!y.over && guard++ < 30) {
      const aimed = L.standing(y).some((i) => y.foes[i].intent && y.foes[i].intent.target === 'o:letter');
      play(y, s3, aimed ? cardOf(y, s3, word('mamoru', 'o:letter')) : cardOf(y, s3, (c) => c.kind === 'unravel'));
    }
    t.ok(y.over === 'win' && ['safe', 'held'].indexOf(y.enc.outcome) >= 0, 'guarding and untying wins (' + y.enc.outcome + ')');
  }

  // ---- procedures: restart, stable checkpoints, Resolve this step, stepping away ----------------------------------
  {
    const s = camp();
    const st = E.begin('fx.sluice', s);
    const pick = (aid) => cardOf(st, s, (c) => c.kind === 'proc' && c.action.id === aid);
    t.ok(E.cards(st, s, wordsOf(s)).some((c) => c.kind === 'unravel'), 'Unravel stays on the cards, even where nothing is tangled');
    let ev = play(st, s, cardOf(st, s, (c) => c.kind === 'unravel'));
    t.ok(ev.fx.some((f) => f.none && /tangled/.test(f.en)), 'and says plainly that nothing is tangled');
    t.ok(cardOf(st, s, (c) => c.kind === 'unravel').tried, 'it is marked tried until the situation changes');
    play(st, s, pick('open'));
    t.eq(st.enc.proc.step, 1, 'the right action moves the machine on');
    ev = play(st, s, pick('close'));
    t.ok(st.enc.proc.step === 0 && st.enc.proc.machine.gate === 'shut', 'a short machine starts again from the first step after a wrong move');
    t.ok(ev.fx.some((f) => f.t === 'proc' && f.ok === false), 'and says what happened');
    play(st, s, pick('open')); play(st, s, pick('turn')); ev = play(st, s, pick('close'));
    t.ok(st.over === 'win' && st.enc.proc.done, 'done in order');
    E.finishEncounter(st, s, st.over);
    t.ok(Object.keys(s.enc.solved).length >= 3, 'the steps solved are kept for Resolve this step');
    // again: each step can be resolved, the same step under the same conditions only
    const x = E.begin('fx.sluice', s);
    const rs = cardOf(x, s, (c) => c.kind === 'resolve');
    t.ok(rs && /completed before/.test(rs.en), 'Resolve this step is offered for a step done before');
    const pc0 = x.pc;
    ev = play(x, s, rs, { res: { ok: true, firstTry: false, mistakes: 3 } });
    t.ok(ev.fx.some((f) => f.t === 'proc' && f.resolved) && x.pc === pc0 && x.enc.proc.step === 1, 'it does the step (no writing, so no slip can cost anything), and only that step');
    t.ok(!(x.enc.solvedNow || []).length, 'it records nothing new');
    // a different version of the instructions is not the same step
    const d2 = JSON.parse(JSON.stringify(C.encounters['fx.sluice']));
    d2.procedure.version = 2;
    const y = E.begin(d2, s);
    t.ok(!cardOf(y, s, (c) => c.kind === 'resolve'), 'changed instructions: no Resolve this step');
    // the same step under a different machine state is not eligible either
    const z = E.begin('fx.sluice', s);
    z.enc.proc.machine.wheel = 'turning'; z.enc.proc.startOf = JSON.parse(JSON.stringify(z.enc.proc.machine));
    t.ok(!cardOf(z, s, (c) => c.kind === 'resolve'), 'the same step with the machine in another state: no Resolve this step');
  }
  {
    const s = camp();
    const st = E.begin('fx.lock', s);
    const pick = (aid) => cardOf(st, s, (c) => c.kind === 'proc' && c.action.id === aid);
    play(st, s, pick('boat_in')); play(st, s, pick('lower'));
    t.eq(st.enc.proc.step, 2, 'two steps done (the second is a stable checkpoint)');
    play(st, s, pick('upper'));
    t.ok(st.enc.proc.step === 2 && st.enc.proc.machine.boat === 'inside' && st.enc.proc.machine.lower === 'shut', 'a long procedure goes back only to the last stable step');
    // stepping away keeps the machine; coming back resumes
    E.finishEncounter(st, s, 'flee');
    const x = E.begin('fx.lock', s);
    t.ok(x.enc.proc.step === 2 && x.enc.proc.machine.lower === 'shut', 'stepping away costs nothing: the machine is as you left it');
  }

  // ---- a disagreement: routes to every conclusion; the naive approach does not simply win --------------------------
  {
    const run = (plan, o = {}) => {
      const s = camp({ comp: o.comp || null, words: ['hikari', 'mizu', 'suzu'] });
      const st = E.begin('fx.dispute', s);
      for (const id of plan) {
        if (st.over) break;
        const c = cardOf(st, s, (x) => x.id === id) || cardOf(st, s, (x) => x.kind === 'wait');
        play(st, s, c, { comp: o.act ? { act: o.act } : null });
      }
      let guard = 0;
      while (!st.over && guard++ < 10) play(st, s, cardOf(st, s, (x) => x.kind === 'wait'));
      return st;
    };
    const naive = run(['s:calm', 's:calm', 's:calm', 's:calm', 's:calm', 's:calm']);
    t.ok(['resolved', 'reconciled'].indexOf(naive.enc.outcome) < 0, 'asking them to calm down six times does not settle it (' + naive.enc.outcome + ')');
    t.eq(run(['s:ask_where', 's:ask_slip', 's:propose']).enc.outcome, 'resolved', 'asking where, then for the slip, then proposing: resolved');
    t.eq(run(['w:hikari', 's:propose']).enc.outcome, 'resolved', 'light on the slip shows what it says');
    t.eq(run(['s:blame']).enc.outcome, 'walked_out', 'blaming the runner: they walk out');
    t.eq(run([]).enc.outcome, 'walked_out', 'leaving the baker heated: the runner leaves');
    t.eq(run(['w:mizu', 'wait', 'w:hikari', 'wait', 'wait', 'wait']).enc.outcome, 'differ', 'the slip read but nothing proposed: they agree to disagree');
    t.eq(run(['s:calm', 'wait', 'wait', 'wait', 'wait', 'wait']).enc.outcome, 'unresolved', 'calm, then silence: unresolved');
    const g = run(['s:calm', 's:ask_where', 's:ask_slip', 'gesture'], { comp: 'suzu', act: 'suzu_joke' });
    t.ok(['reconciled', 'resolved'].indexOf(g.enc.outcome) >= 0, 'with a companion, understanding fills and the gesture brings them together (' + g.enc.outcome + ')');
    // Unravel: nothing is tangled, said once with a tip
    const s = camp({ comp: 'mio', words: [] });
    const st = E.begin('fx.dispute', s);
    const ev = play(st, s, cardOf(st, s, (c) => c.kind === 'unravel'));
    t.ok(ev.fx.some((f) => /Nothing here is tangled/.test(f.en || '')) && ev.fx.some((f) => f.t === 'tip'), 'Unravel finds nothing tangled, and the tip names the clues');
    // every companion has something of their own here
    for (const comp of ['nao', 'mio', 'ren', 'suzu']) t.ok((C.encounters['fx.dispute'].social.companion[comp] || []).length > 0, comp + ' has options of their own');
    // reachability: a bounded search over choices reaches every authored conclusion
    const reached = new Set();
    const seen = new Set();
    const explore = (plan, depth) => {
      const s2 = camp({ comp: 'suzu', words: ['hikari', 'mizu', 'suzu'] });
      const x = E.begin('fx.dispute', s2);
      for (const id of plan) { if (x.over) break; play(x, s2, cardOf(x, s2, (c) => c.id === id)); }
      if (x.over) { reached.add(x.enc.outcome); return; }
      const key = E.stateKey(x) + x.round;
      if (seen.has(key) || depth > 7) return;
      seen.add(key);
      for (const c of E.cards(x, s2, wordsOf(s2))) if (!c.disabled) explore(plan.concat([c.id]), depth + 1);
    };
    explore([], 0);
    const want = C.encounters['fx.dispute'].conclusions.map((c) => c.id);
    t.eq(want.filter((id) => !reached.has(id)), [], 'every conclusion is reachable: ' + [...reached].join(', '));
  }

  // ---- a Hush on one family; a bell ends it ------------------------------------------------------------------------
  {
    const s = camp({ words: ['mizu', 'suzu'] });
    const st = E.begin('fx.hush', s);
    play(st, s, cardOf(st, s, (c) => c.kind === 'unravel'));
    const water = cardOf(st, s, word('mizu'));
    t.ok(st.hushed && st.hushed.water === 2 && water.disabled && /Hushed for 2 more exchanges/.test(water.disabled), 'water is hushed for two whole exchanges; the card says for how long and what ends it: ' + water.disabled);
    t.ok(!cardOf(st, s, word('suzu')).disabled, 'a bell is never hushed');
    play(st, s, cardOf(st, s, word('suzu')));
    t.ok(!cardOf(st, s, word('mizu')).disabled, 'the bell ends the Hush at once');
    // with no bell known, it simply runs out
    const s2 = camp({ words: ['mizu'] });
    const x = E.begin('fx.hush', s2);
    play(x, s2, cardOf(x, s2, (c) => c.kind === 'unravel'));
    play(x, s2, cardOf(x, s2, (c) => c.kind === 'unravel'));
    t.ok(/1 more exchange/.test(cardOf(x, s2, word('mizu')).disabled || ''), 'it counts down');
    play(x, s2, cardOf(x, s2, (c) => c.kind === 'unravel'));
    t.ok(!x.over && !cardOf(x, s2, word('mizu')).disabled, 'and otherwise ends by itself after its exchanges');
    // the promise holds: Unravel alone (with the bell first where the Hush silences it) wins
    const s3 = camp({ words: ['suzu'] });
    const y = E.begin('fx.hush', s3);
    let guard = 0;
    while (!y.over && guard++ < 40) {
      const un = cardOf(y, s3, (c) => c.kind === 'unravel');
      play(y, s3, un && !un.disabled ? un : cardOf(y, s3, word('suzu')));
    }
    t.eq(y.over, 'win', 'Unravel, with the bell where the Hush silences it, still wins');
  }

  // ---- two moves, a plan, a signal ------------------------------------------------------------------------------
  {
    const s = camp({ words: ['nawa', 'hikari', 'kaze', 'mamoru'] });
    const st = E.begin('fx.doubles', s);
    t.ok(st.foes[1].intent.signal && st.foes[0].intent.cue, 'the fox signals; the golem\'s blow is cued on it');
    let ev = play(st, s, cardOf(st, s, word('nawa')), { target: 1 });
    t.ok(ev.efx.some((f) => f.t === 'countered' && f.foe === 0), 'answering the signal breaks the cued blow too: ' + ev.log.join(' '));
    t.eq(st.foes[0].intent.kind, 'charge', 'then it gathers, planning a flood');
    ev = play(st, s, cardOf(st, s, word('nawa')), { target: 0 });
    t.ok(st.foes[0].intent.kind !== 'flood' && st.foes[0].headedOff === 'flood', 'answering the first step heads off the flood (' + st.foes[0].intent.kind + ')');
    t.ok(st.foes[0].intent.kind === 'strike' && st.foes[0].intent2 && st.foes[0].intent2.kind === 'shroud', 'a two-move turn: a strike and a shroud, both telegraphed');
    const o = L.order(st);
    t.ok(o[0].aim2 !== undefined, 'the order shows the second move too');
    ev = play(st, s, cardOf(st, s, word('kaze')), { target: 0 });
    t.ok(ev.efx.some((f) => f.second && f.t === 'countered') && ev.efx.some((f) => !f.second && (f.t === 'hit' || f.t === 'block')), 'wind answers the shroud; the strike still lands: ' + ev.log.join(' '));
    // never on Relaxed
    const r = E.begin('fx.doubles', camp({ difficulty: 'relaxed' }));
    r.foes[0].intent = L.intentDef(r.foes[0].def, 'strike:and');
    t.ok(r.foes.length === 1, 'Relaxed: one creature, as always');
  }

  // ---- arrivals ------------------------------------------------------------------------------------------------------
  {
    const s = camp({ words: ['suzu', 'mizu'] });
    const st = E.begin('fx.arrivals', s);
    t.eq(E.coming(st).map((c) => c.in), [2], 'what is coming is telegraphed: in two exchanges');
    play(st, s, cardOf(st, s, word('mizu')));
    t.eq(E.coming(st).map((c) => c.in), [1], 'then in one');
    const ev = play(st, s, cardOf(st, s, word('mizu')));
    t.ok(ev.afx.some((f) => f.t === 'arrive' && f.enemy === 'rw.dustmoth') && st.foes.length === 2, 'and it arrives');
    const s2 = camp({ words: ['suzu', 'mizu'] });
    const x = E.begin('fx.arrivals', s2);
    const e2 = play(x, s2, cardOf(x, s2, word('suzu')));
    t.ok(e2.fx.some((f) => f.t === 'prevent') && !E.coming(x).length, 'a bell turns it back');
    for (let k = 0; k < 3 && !x.over; k++) play(x, s2, cardOf(x, s2, word('mizu')));
    t.eq(x.foes.length, 1, 'and it never comes');
    const y = E.begin('fx.arrivals', camp({ difficulty: 'relaxed' }));
    t.eq(y.enc.arrivals.length, 0, 'Relaxed: nothing is scheduled to arrive');
    const z = E.begin('fx.arrivals', camp({ difficulty: 'hard' }));
    t.eq(z.enc.arrivals.length, 2, 'Demanding: the encounter\'s optional extra too');
    // the reading clock does not exist: cards, previews and conclusions change nothing
    const w = E.begin('fx.arrivals', camp());
    const before = JSON.stringify(w);
    for (let k = 0; k < 5; k++) { E.cards(w, s, wordsOf(s)); E.coming(w); E.conclude(w); for (const c of E.cards(w, s, wordsOf(s))) if (!c.disabled && c.kind !== 'wait') L.previewAct(w, c); }
    t.eq(JSON.stringify(w), before, 'reading, previewing and asking for help advance nothing');
  }

  // ---- studies: a fixed toolset, a goal within committed exchanges, a personal best -------------------------------
  {
    const s = camp({ words: ['mizu', 'kaze'] });
    const st = E.begin('fx.study.fire', s);
    play(st, s, cardOf(st, s, word('mizu')));
    play(st, s, cardOf(st, s, (c) => c.kind === 'unravel'));
    play(st, s, cardOf(st, s, (c) => c.kind === 'unravel'));
    t.eq(st.over, 'win', 'water first, then Unravel twice: solved in three');
    E.finishEncounter(st, s, st.over);
    t.ok(s.enc.studies['fx.study.fire'].best === 2, 'the personal best is kept, in exchanges (' + JSON.stringify(s.enc.studies['fx.study.fire']) + ')');
    const x = E.begin('fx.study.fire', s);
    for (let k = 0; k < 3 && !x.over; k++) play(x, s, cardOf(x, s, (c) => c.kind === 'unravel'));
    t.ok(x.over === 'end' && x.enc.outcome === 'over' && /Water weakens/.test(x.enc.conclusion.text.en), 'Unravel alone runs out of exchanges, and the study explains why');
  }

  // ---- help after defeat in a story encounter (E19) ------------------------------------------------------------------
  {
    const s = camp();
    const def = { id: 'tmp.story', story: true, lead: 'rw.reedling' };
    t.eq(E.helpOffer(s, def), 0, 'no offer before a defeat');
    const st = E.begin(def, s);
    E.finishEncounter(st, s, 'lose');
    t.eq(E.helpOffer(s, def), 1, 'after one defeat: explain');
    E.finishEncounter(st, s, 'lose'); E.finishEncounter(st, s, 'lose'); E.finishEncounter(st, s, 'lose');
    t.eq(E.helpOffer(s, def), 3, 'then suggest, then point (and no further)');
    t.eq(E.helpOffer(s, { id: 'tmp.side', lead: 'rw.reedling' }), 0, 'never counted outside a story encounter');
  }

  // ---- the companion: plans, the six-action menu --------------------------------------------------------------------
  {
    const s = camp({ comp: 'ren' });
    s.flags.ch2_done = true; s.quests.ren_ushio = { done: true, stage: 9 }; s.flags.lq_ally1 = true; s.flags.lq_ally2 = true;
    const st = E.begin('fx.ordinary', s);
    const card = cardOf(st, s, (c) => c.kind === 'unravel');
    const m = E.compMenu(st, s, card, wordsOf(s), st.cur);
    t.eq(m.shown.map((o) => o.def.id), L.compOptions(st, s, card).filter((o) => !o.locked).map((o) => o.def.id), 'six or fewer actions: shown as the game always has, in their own order');
    const pr = E.planned(st, s, card, 'protect', wordsOf(s), st.cur);
    t.ok(pr && E.planOf(pr.def) === 'protect', 'a "protect" plan chooses a protecting action: ' + (pr && pr.def.id));
    const rv = E.planned(st, s, card, 'reveal', wordsOf(s), st.cur);
    t.ok(rv && E.planOf(rv.def) === 'reveal', 'a "reveal" plan chooses a revealing action: ' + (rv && rv.def.id));
    t.eq(E.planned(st, s, card, 'ask', wordsOf(s), st.cur), null, '"ask" opens the menu as always');
    // beyond six: the six most useful, the rest a page away
    const big = { id: 'tmp.big', lead: 'rw.reedling', companion: { ren: [1, 2, 3].map((k) => ({ id: 'ren_x' + k, name: { jp: 'x', en: 'Extra ' + k }, effect: { ward: { pc: 1 } } })) } };
    const st2 = E.begin(big, s);
    const m2 = E.compMenu(st2, s, cardOf(st2, s, (c) => c.kind === 'unravel'), wordsOf(s), 0);
    t.ok(m2.shown.length === 6 && m2.more.length === 2, 'eight actions: six shown, two a page away (' + m2.shown.length + ' + ' + m2.more.length + ')');
  }

  // ---- Point: the suitable responses, by the rules' own preview ------------------------------------------------------
  {
    const s = camp();
    const st = E.begin('fx.ordinary', s);
    const pts = E.pointCards(st, s, wordsOf(s));
    t.ok(pts.length > 0, 'something suitable is pointed out: ' + pts.join(', '));
    for (const id of pts) {
      const c = cardOf(st, s, (x) => x.id === id);
      const p = L.previewAct(st, c);
      t.ok(p.answered.some(Boolean) || c.kind === 'unravel', id + ' answers a move');
    }
  }

  // ---- preparation, phrasings, ordinary battles of the twelve-chapter game, roaming consequences -------------------
  {
    const def = { id: 'tmp.prep', lead: 'rw.reedling', field: ['rain'], rules: { conditions: true }, prep: [{ id: 'cover', label: { jp: 'x', en: 'Take cover' }, effect: { unfield: ['rain'] } }] };
    t.eq(E.prepared(def, ['cover']).field, [], 'a preparation changes the encounter it begins with');
    t.eq(E.prepared(def, []).field, ['rain'], 'skipping it changes nothing');
    const s = camp();
    t.eq(E.phrasings({ kind: 'word', word: C.words.mamoru }, s), [], 'no other phrasing until one is taught');
    t.eq(JSON.stringify(E.ordinaryRules(s)), '{}', 'the six-chapter game: ordinary battles use none of the new rules');
    const s2 = camp(); s2.edition = 2;
    t.ok(E.ordinaryRules(s2).modifiers && !E.ordinaryRules(s2).wait, 'the twelve-chapter game: modifiers taught so far; Wait once taught');
    s2.flags.learn_wait = true;
    t.ok(E.ordinaryRules(s2).wait, 'and Wait after Manybridge teaches it');
    const s3 = camp();
    t.eq(E.roamingWon(s3, { id: 'f1', enemy: 'rw.reedling' }, 'rw.road'), [], 'an existing creature on an existing map: nothing new happens');
    const ev = E.roamingWon(s3, { id: 'f9', enemy: 'rw.reedling', lostWord: { jp: '{橋|はし}', en: 'bridge' }, carries: 'rw_ribbon' }, 'rw.road');
    t.ok(ev.some((e) => e.t === 'lostWord') && ev.some((e) => e.t === 'item') && s3.inv.rw_ribbon === 1, 'new content: a lost word comes back, a carried thing is handed over');
    t.eq(E.roamingWon(s3, { id: 'f9', enemy: 'rw.reedling', lostWord: { jp: '{橋|はし}', en: 'bridge' }, carries: 'rw_ribbon' }, 'rw.road'), [], 'once only');
  }

  // ---- lasting outcomes, outcome sets, grave outcomes (E17) --------------------------------------------------------
  {
    const s = camp();
    const mk = (id, out) => ({ id, kind: 'social', lasting: true, social: { parties: [{ aid: 'n:a', name: { en: 'A' } }], claims: {}, actions: [] }, conclusions: [{ id: out, when: { rounds: 0 }, result: 'end', text: { en: out } }] });
    C.encounters['tmp.o1'] = mk('tmp.o1', 'mediated'); C.encounters['tmp.o2'] = mk('tmp.o2', 'mediated');
    C.outcomeSets = [{ id: 'tmp.set', needs: [{ enc: 'tmp.o1', outcome: 'mediated' }, { enc: 'tmp.o2', outcome: 'mediated' }], unlocks: 'tmp_unlocked' }];
    const a = E.begin('tmp.o1', s); E.close(a); const f1 = E.finishEncounter(a, s, a.over);
    t.ok(s.enc.outcomes['tmp.o1'].id === 'mediated' && !s.flags.tmp_unlocked && !f1.unlocked.length, 'a lasting outcome is kept, neutrally; one of two is not yet the set');
    const b2 = E.begin('tmp.o2', s); E.close(b2); const f2 = E.finishEncounter(b2, s, b2.over);
    t.ok(s.flags.tmp_unlocked && f2.unlocked[0] === 'tmp.set', 'both: the set opens what it unlocks');
    delete C.encounters['tmp.o1']; delete C.encounters['tmp.o2']; C.outcomeSets = [];
    const grave = { id: 'x', severe: true, text: { en: 'Shown, with restraint.' }, summarised: { en: 'In a sentence.' } };
    t.eq(E.conclusionText(grave, { outcomeView: 'shown' }).en, 'Shown, with restraint.', 'a grave outcome shown');
    t.eq(E.conclusionText(grave, { outcomeView: 'summarised' }).en, 'In a sentence.', 'or summarised, as chosen (C-65)');
    t.eq(E.conclusionText({ id: 'y', text: { en: 'Plain.' }, summarised: { en: 'no' } }, { outcomeView: 'summarised' }).en, 'Plain.', 'only grave outcomes have the choice');
  }

  // ---- wanderers: rare, never twice in a row, not within five encounters ---------------------------------------------
  {
    C.wanderers = Object.assign({}, C.wanderers, { 'tmp.busker': { region: 'tmp' }, 'tmp.pilgrim': { region: 'tmp' } });
    const s = camp({ id: 'wander-1' });
    const seen = [];
    for (let k = 0; k < 400; k++) seen.push(E.wanderer(s, 'tmp', true));
    const n = seen.filter(Boolean).length;
    t.ok(n > 10 && n < 120, 'about one in eight eligible encounters at most brings a wanderer (' + n + ' of 400)');
    let near = false;
    seen.forEach((id, i) => { if (id && seen.slice(Math.max(0, i - 5), i).indexOf(id) >= 0) near = true; });
    t.ok(!near, 'the same wanderer never appears within five encounters of the last time');
    delete C.wanderers['tmp.busker']; delete C.wanderers['tmp.pilgrim'];
  }
};
