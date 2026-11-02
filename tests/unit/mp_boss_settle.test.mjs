// The Lord of the Understage: freeing its knots is no win (Agnes 6580371549; Cloud CC-484; Local CL-648). With all six
// of its knots freed by ordinary Unravels and no cue worked, the Lord won as 'settled': the victory said the names
// spiral up toward the stage, and nothing was restored (no mp_under_done, so mp.boss_go never played mp.boss_won and the
// Lord still stood at the Bottom). Now mp.boss says settleWins: false, as the Nameless Bridge does (the battle screen's
// own guard, which plays no mid-fight settle there, is in tests/e2e/mp_boss_settle.mjs). With synthetic campaigns only,
// the encounter engine as the battle screen drives it:
//  1. mp.boss says settleWins: false; its procedure (lift, west, roll) and its one conclusion as before;
//  2. the six knots freed by Unravel, no cue worked: no win and no conclusion, exchange after exchange; the Lord
//     settled, so it does not act; the procedure's cards still offered; mp_under_done not set;
//  3. then the lift, the revolve west and the roll: 'roll' wins, with mp_under_done, once;
//  4. the main route with every knot left: as before;
//  5. the last knots freed by the companion's own cue (Nao's "Haul on the cue"): no win either;
//  6. the lift brought up, then the fight lost: the lift holds on the retry (the procedure's restart: 'stable'), and
//     through a save round-tripped through the save's own migration;
//  7. after the encounter, its scene (mp.boss_go) plays mp.boss_won only with mp_under_done; that scene sets it and
//     refreshes the Bottom, where the Lord stands only while it is not set.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, E = RB.encounter;
  const flat = (x) => JSON.stringify(x);
  const OK = { ok: true, firstTry: true, mistakes: 0 };
  const camp = (o = {}) => {
    const s = RB.state.newCampaign({ edition: 2 });
    s.id = 'mp-boss-test'; s.comp = o.comp === undefined ? 'mio' : o.comp;
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
  const ROUTE = ['lift', 'west', 'roll'];

  // 1. the encounter
  {
    const d = C.encounters['mp.boss'];
    t.ok(d.settleWins === false && d.procedure.restart === 'stable' && flat(d.procedure.steps.map((x) => x.id)) === flat(['c1', 'c2', 'c3']) &&
      flat(d.conclusions.map((c) => [c.id, c.when, c.result, c.flags])) === flat([['roll', { proc: 'done' }, 'win', { mp_under_done: true }]]),
      '1 mp.boss says settleWins: false; its procedure and its one conclusion as before ' + flat(d.conclusions.map((c) => c.id)));
  }

  // 2. the knots all freed, no cue worked
  {
    const s = camp();
    const st = E.begin('mp.boss', s);
    const knots = [];
    for (let i = 0; i < 6 && !st.over; i++) { unravel(st, s); knots.push(st.foes[0].knots); }
    const pc0 = st.pc;
    const after = [];
    for (let i = 0; i < 4 && !st.over; i++) { unravel(st, s); after.push({ over: st.over, procs: procIds(st, s).join() }); }
    t.ok(flat(knots) === flat([5, 4, 3, 2, 1, 0]) && !st.over && !st.enc.conclusion && !st.enc.outcome && !s.flags.mp_under_done,
      '2 the six knots freed by Unravel, no cue worked: no win and no conclusion, mp_under_done not set ' + flat({ knots, over: st.over, outcome: st.enc.outcome }));
    t.ok(after.length === 4 && after.every((a) => !a.over && a.procs === 'lift,revolve') && st.pc === pc0,
      '2 four more exchanges: still no win, the procedure\'s cards offered every time, and the settled Lord does not act ' + flat({ after, pc: [pc0, st.pc] }));
    // 3. then the cues
    for (const a of ROUTE) if (!st.over) play(st, s, pick(st, s, a));
    const fin = st.over === 'win' ? E.finishEncounter(st, s, 'win') : null;
    t.ok(st.over === 'win' && st.enc.outcome === 'roll' && fin && fin.flags && fin.flags.mp_under_done === true,
      '3 then the lift, the revolve west and the roll: \'roll\' wins, with mp_under_done ' + flat({ over: st.over, outcome: st.enc.outcome, flags: fin && fin.flags }));
  }

  // 4. the main route: every knot left
  {
    const s = camp();
    const st = E.begin('mp.boss', s);
    for (const a of ROUTE) if (!st.over) play(st, s, pick(st, s, a));
    t.ok(st.over === 'win' && st.enc.outcome === 'roll' && st.foes[0].knots === 6,
      '4 the main route with all six knots left: \'roll\' wins, as before ' + flat({ over: st.over, outcome: st.enc.outcome, knots: st.foes[0].knots }));
  }

  // 5. the last knots freed by the companion's own cue
  {
    const s = camp({ comp: 'nao' });
    const st = E.begin('mp.boss', s);
    st.foes[0].knots = 2;
    const P = play(st, s, pick(st, s, 'lift'));
    const offered = E.companionOptions(st, s).map((o) => o.def.id);
    const cfx = E.companion(st, { act: { id: 'nao_rope' } }, P, st.cur);
    t.ok(offered.includes('nao_rope') && !!cfx && st.foes[0].knots === 0 && E.conclude(st) !== 'win' && !st.enc.outcome && flat(procIds(st, s)) === flat(['west', 'east']),
      '5 the last two knots freed by Nao\'s "Haul on the cue": no win, the next cue asked ' + flat({ offered, knots: st.foes[0].knots, conclude: E.conclude(st), procs: procIds(st, s) }));
  }

  // 6. the lift brought up, then the fight lost; the retry, and through a save
  {
    const s = camp();
    const st = E.begin('mp.boss', s);
    play(st, s, pick(st, s, 'lift'));
    E.finishEncounter(st, s, 'lose');
    const kept = JSON.parse(JSON.stringify(s));
    const s2 = RB.save.migrate(kept);
    RB.game.s = s2;
    const st2 = E.begin('mp.boss', s2);
    t.ok(st2.enc.proc.machine.lift === 'up' && flat(procIds(st2, s2)) === flat(['west', 'east']),
      '6 the lift up, the fight lost, a save and load, the retry: the lift holds and the revolve is asked ' + flat({ machine: st2.enc.proc.machine, procs: procIds(st2, s2) }));
  }

  // 7. after the encounter, its scene
  {
    const go = C.scenes['mp.boss_go'].cmds;
    const enc = go.findIndex((c) => c.op === 'encounter' && c.args[0] === 'mp.boss');
    const calls = go.filter((c) => c.op === 'call' && c.args[0] === 'mp.boss_won');
    const won = C.scenes['mp.boss_won'].cmds;
    const lord = (C.maps['mp.bottom'].npcs || []).filter((n) => n.id === 'mp_naraku');
    t.ok(enc >= 0 && calls.length === 1 && calls[0].if === 'mp_under_done' && go.indexOf(calls[0]) > enc &&
      won[0].op === 'set' && won[0].args[0] === 'mp_under_done' && won[1].op === 'refresh' && lord.length === 1 && lord[0].if === '!mp_under_done',
      '7 mp.boss_go plays mp.boss_won only with mp_under_done; it sets it and refreshes the Bottom, where the Lord stands only without it, as before ' + flat({ calls: calls.map((c) => c.if), lord: lord.map((n) => n.if) }));
  }
};
