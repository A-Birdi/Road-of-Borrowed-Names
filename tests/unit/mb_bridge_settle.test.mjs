// The Nameless Bridge: freeing its knots is no win (Agnes 6570338266 and 6570558254; Cloud CC-470, CC-471; Local
// CL-633). With all six of its knots freed and no span laid, the bridge won as 'settled', with no name given: the
// victory said the bridge laid its planks back down, and nothing was restored (no mb_bridge_named; the spirit, the
// gaps and the journal as before). Now mb.boss says settleWins: false (the battle screen's own guard, which plays no
// mid-fight settle there, is in tests/e2e/mb_bridge_settle.mjs). With synthetic campaigns only, the encounter engine
// as the battle screen drives it:
//  1. the census: mb.boss says settleWins: false (and, since their own rows, mp.boss and kr.moss_steps); those that
//     say true, as before;
//  2. the knots all freed by Unravel, no span laid: no win and no conclusion, exchange after exchange; the bridge
//     settled, so it does not act; the procedure's cards still offered; mb_bridge_named not set;
//  3. then the three spans and the name: 'named' wins, with its flag, once;
//  4. the main route, naming with every knot left: as before;
//  5. a span laid, then the fight lost: the span holds on the retry (the procedure's restart: 'stable'), and through a
//     save round-tripped through the save's own migration;
//  6. after the win, the bridge's scene (mb.boss_go) plays mb.bridge_named; without the flag it does not;
//  7. elsewhere as before: an ordinary creature settled alone wins; an encounter that says settleWins: true still wins
//     by settling.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, E = RB.encounter;
  const flat = (x) => JSON.stringify(x);
  const OK = { ok: true, firstTry: true, mistakes: 0 };
  const camp = (o = {}) => {
    const s = RB.state.newCampaign({ edition: 2 });
    s.id = 'mb-bridge-test'; s.comp = o.comp === undefined ? 'mio' : o.comp;
    s.words = ['mamoru', 'mizu', 'hikari', 'kaze', 'nawa', 'iyasu'];
    for (const f of o.flags || []) s.flags[f] = true;
    RB.game.s = s;
    return s;
  };
  const wordsOf = (s) => s.words.map((w) => C.words[w]).filter(Boolean);
  const cards = (st, s) => E.cards(st, s, wordsOf(s));
  const play = (st, s, card) => E.exchange(st, { card, res: OK, comp: null, target: st.cur }, { enemy: st.foes[0] && st.foes[0].def });
  const pick = (st, s, aid) => cards(st, s).find((c) => c.kind === 'proc' && c.action.id === aid);
  const procIds = (st, s) => cards(st, s).filter((c) => c.kind === 'proc').map((c) => c.action.id);
  const unravel = (st, s) => play(st, s, cards(st, s).find((c) => c.kind === 'unravel'));

  // 1. the census
  const explicit = (v) => Object.keys(C.encounters).filter((id) => C.encounters[id].settleWins === v).sort();
  // (since the Understage's row, mp.boss says it too: Agnes 6580371549; Cloud CC-484; Local CL-648. Before it: mb.boss only.
  // Since the Moss Lantern's settling row, kr.moss_steps too: Cloud CC-486; Local CL-648, CL-650)
  t.eq(explicit(false), ['kr.moss_steps', 'mb.boss', 'mp.boss'], '1 the census: kr.moss_steps, mb.boss and mp.boss are the encounters that say settleWins: false');
  t.eq(explicit(true), ['cr.fog_papers', 'fx.protect', 'kr.wick_ridge', 'yn.towel'], '1 and the four that say true (a test fixture among them), as before');

  // 2. the knots all freed, no span laid
  {
    const s = camp();
    const st = E.begin('mb.boss', s);
    const knots = [];
    for (let i = 0; i < 6 && !st.over; i++) { unravel(st, s); knots.push(st.foes[0].knots); }
    const pc0 = st.pc;
    const after = [];
    for (let i = 0; i < 4 && !st.over; i++) { unravel(st, s); after.push({ over: st.over, procs: procIds(st, s).join() }); }
    t.ok(flat(knots) === flat([5, 4, 3, 2, 1, 0]) && !st.over && !st.enc.conclusion && !st.enc.outcome && !s.flags.mb_bridge_named,
      '2 the six knots freed by Unravel, no span laid: no win and no conclusion, mb_bridge_named not set ' + flat({ knots, over: st.over, outcome: st.enc.outcome }));
    t.ok(after.length === 4 && after.every((a) => !a.over && a.procs === 's1_ok,s1_no') && st.pc === pc0,
      '2 four more exchanges: still no win, the procedure\'s cards offered every time, and the settled bridge does not act ' + flat({ after, pc: [pc0, st.pc] }));
    // 3. then the spans and the name
    for (const a of ['s1_ok', 's2_ok', 's3_ok', 'call']) if (!st.over) play(st, s, pick(st, s, a));
    const fin = st.over === 'win' ? E.finishEncounter(st, s, 'win') : null;
    t.ok(st.over === 'win' && st.enc.outcome === 'named' && fin && fin.flags && fin.flags.mb_bridge_named === true,
      '3 then the three spans and the name: \'named\' wins, with mb_bridge_named ' + flat({ over: st.over, outcome: st.enc.outcome, flags: fin && fin.flags }));
  }

  // 4. the main route: naming with every knot left
  {
    const s = camp();
    const st = E.begin('mb.boss', s);
    for (const a of ['s1_ok', 's2_ok', 's3_ok', 'call']) if (!st.over) play(st, s, pick(st, s, a));
    t.ok(st.over === 'win' && st.enc.outcome === 'named' && st.foes[0].knots === 6,
      '4 the main route, naming with all six knots left: \'named\' wins, as before ' + flat({ over: st.over, outcome: st.enc.outcome, knots: st.foes[0].knots }));
  }

  // 5. a span laid, then the fight lost; the retry, and through a save
  {
    const s = camp();
    const st = E.begin('mb.boss', s);
    play(st, s, pick(st, s, 's1_ok'));
    E.finishEncounter(st, s, 'lose');
    const kept = JSON.parse(JSON.stringify(s));
    const s2 = RB.save.migrate(kept);
    RB.game.s = s2;
    const st2 = E.begin('mb.boss', s2);
    t.ok(st2.enc.proc.machine.s1 === 'laid' && flat(procIds(st2, s2)) === flat(['s2_ok', 's2_no']),
      '5 a span laid, the fight lost, a save and load, the retry: the span holds and the next is asked ' + flat({ machine: st2.enc.proc.machine, procs: procIds(st2, s2) }));
  }

  // 6. after the encounter, the bridge's scene
  {
    const goes = C.scenes['mb.boss_go'].cmds.filter((c) => c.op === 'call' && c.args[0] === 'mb.bridge_named');
    t.ok(goes.length === 1 && goes[0].if === 'mb_bridge_named',
      '6 the bridge\'s scene plays mb.bridge_named only once it has its name, as before ' + flat(goes.map((c) => c.if)));
  }

  // 7. elsewhere, as before
  {
    const s = camp();
    const st = E.begin({ id: 'fx.lone', lead: { enemy: 'mb.bridge', knots: 1 }, rules: {} }, s);
    unravel(st, s);
    t.ok(st.over === 'win' && st.enc.outcome === 'settled', '7 an encounter that does not say: its creature settled alone still wins ' + flat({ over: st.over, outcome: st.enc.outcome }));
    const s2 = camp();
    const st2 = E.begin({ id: 'fx.true', lead: { enemy: 'mb.bridge', knots: 1 }, rules: {}, settleWins: true, conclusions: [{ id: 'never', when: { flag: 'never' }, result: 'win' }] }, s2);
    unravel(st2, s2);
    t.ok(st2.over === 'win' && st2.enc.outcome === 'settled', '7 one that says settleWins: true still wins by settling ' + flat({ over: st2.over, outcome: st2.enc.outcome }));
  }
};
