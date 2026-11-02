// The Moss Lantern: freeing its knots is no win (Cloud CC-486; Local CL-648, CL-650). With its three knots freed by
// ordinary Unravels and no name called, the Moss Lantern won as 'settled': its settle line said "Named, the lantern
// settles back onto its base", but nothing was named (no kr_moss1_named), so the win took the Moss off the Cedar Steps
// and the lit lantern never stood there. Now kr.moss_steps says settleWins: false, as the Nameless Bridge and the Lord
// of the Understage do (the battle screen's own guard, which plays no mid-fight settle there, is in
// tests/e2e/kr_moss_settle.mjs). With synthetic campaigns only, the encounter engine as the battle screen drives it:
//  1. kr.moss_steps says settleWins: false; its one conclusion as before (named, no text of its own);
//  2. the three knots freed by Unravel, no name called: no win and no conclusion, exchange after exchange; the Moss
//     settled, so it does not act; its procedure's cards still offered; kr_moss1_named not set;
//  3. then its name called: 'named' wins, with kr_moss1_named, once;
//  4. the main route, its name called with every knot left: as before;
//  5. pushed past first: its failure, back to the start, not over, as before; then named.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, E = RB.encounter;
  const flat = (x) => JSON.stringify(x);
  const OK = { ok: true, firstTry: true, mistakes: 0 };
  const camp = () => {
    const s = RB.state.newCampaign({ difficulty: 'normal' });
    s.id = 'kr-moss-test'; s.comp = 'mio'; s.map = 'kr.steps'; s.flags.departed = true;
    s.words = ['mamoru', 'mizu', 'hikari', 'kaze', 'nawa', 'iyasu'];
    RB.game.s = s;
    return s;
  };
  const wordsOf = (s) => s.words.map((w) => C.words[w]).filter(Boolean);
  const cards = (st, s) => E.cards(st, s, wordsOf(s));
  const play = (st, s, card) => E.exchange(st, { card, res: OK, comp: null, target: st.cur }, { enemy: st.foes[0] && st.foes[0].def });
  const pick = (st, s, aid) => cards(st, s).find((c) => c.kind === 'proc' && c.action.id === aid);
  const procIds = (st, s) => cards(st, s).filter((c) => c.kind === 'proc').map((c) => c.action.id);
  const unravel = (st, s) => play(st, s, cards(st, s).find((c) => c.kind === 'unravel'));

  // 1. the encounter
  {
    const d = C.encounters['kr.moss_steps'];
    t.ok(d.settleWins === false && flat(d.conclusions.map((c) => [c.id, c.when, c.result, c.flags, c.text])) === flat([['named', { proc: 'done' }, 'win', { kr_moss1_named: true }, undefined]]),
      '1 kr.moss_steps says settleWins: false; its one conclusion as before, with no text of its own ' + flat(d.conclusions.map((c) => c.id)));
  }

  // 2. the knots all freed, no name called
  {
    const s = camp();
    const st = E.begin('kr.moss_steps', s);
    const k0 = st.foes[0].knots;
    const knots = [];
    for (let i = 0; i < k0 && !st.over; i++) { unravel(st, s); knots.push(st.foes[0].knots); }
    const pc0 = st.pc;
    const after = [];
    for (let i = 0; i < 4 && !st.over; i++) { unravel(st, s); after.push({ over: st.over, procs: procIds(st, s).join() }); }
    t.ok(k0 === 3 && flat(knots) === flat([2, 1, 0]) && !st.over && !st.enc.conclusion && !st.enc.outcome && !s.flags.kr_moss1_named,
      '2 the three knots freed by Unravel, no name called: no win and no conclusion, kr_moss1_named not set ' + flat({ k0, knots, over: st.over, outcome: st.enc.outcome }));
    t.ok(after.length === 4 && after.every((a) => !a.over && a.procs === 'call,push') && st.pc === pc0,
      '2 four more exchanges: still no win, its cards offered every time, and the settled Moss does not act ' + flat({ after, pc: [pc0, st.pc] }));
    // 3. then its name
    play(st, s, pick(st, s, 'call'));
    const fin = st.over === 'win' ? E.finishEncounter(st, s, 'win') : null;
    t.ok(st.over === 'win' && st.enc.outcome === 'named' && fin && fin.flags && fin.flags.kr_moss1_named === true,
      '3 then its name called: \'named\' wins, with kr_moss1_named ' + flat({ over: st.over, outcome: st.enc.outcome, flags: fin && fin.flags }));
  }

  // 4. the main route: every knot left
  {
    const s = camp();
    const st = E.begin('kr.moss_steps', s);
    play(st, s, pick(st, s, 'call'));
    t.ok(st.over === 'win' && st.enc.outcome === 'named' && st.foes[0].knots === 3,
      '4 its name called with all three knots left: \'named\' wins, as before ' + flat({ over: st.over, outcome: st.enc.outcome, knots: st.foes[0].knots }));
  }

  // 5. pushed past first
  {
    const s = camp();
    const st = E.begin('kr.moss_steps', s);
    const ev = play(st, s, pick(st, s, 'push'));
    const pushed = { over: st.over, machine: Object.assign({}, st.enc.proc.machine), procs: procIds(st, s).join() };
    play(st, s, pick(st, s, 'call'));
    t.ok(!pushed.over && pushed.machine.named === 'no' && pushed.procs === 'call,push' && !!ev && st.over === 'win' && st.enc.outcome === 'named',
      '5 pushed past first: back to the start, not over, as before; then named ' + flat({ pushed, over: st.over, outcome: st.enc.outcome }));
  }
};
