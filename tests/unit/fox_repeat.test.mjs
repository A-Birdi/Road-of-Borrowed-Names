// Three Tellings of the Fox Bridge, talking to Shōzō again once they are settled (Local CL-560; Cloud CC-402; Agnes
// 6546934577). Before the chapter's end, his idle talk still opened with "…All three say something different." and
// offered "Compare the tellings" again, which then played only the board's line. Now, settled, he turns to you and says
// only the board's line: kr.shozo_idle goes straight to kr.shozo_fox, whose own :done says it. On the real runner, the
// screen stood in for (lines, choices, hooks and toasts recorded), Shōzō talked to as his talk list picks:
//  1. the scene: the guard straight after he turns to you; the settled block after the register's own `!goto clues`, so
//     no other path falls into it; it calls kr.shozo_fox and ends;
//  2. settled, before the chapter's end: only "The board's being painted now."; no opening line, no choice, no tellings
//     hook, no quest toast; the quest, the chosen telling and the board's flag as they were; and again on a second talk;
//  3. not yet settled: as before: the opening, the register asked for; then, read, the comparison offered; settled
//     through the tellings, once;
//  4. after the chapter's end: kr.shozo_after, as before, settled or not;
//  5. a save's round trip keeps the settled talk;
//  no scene ended on an error from the runner.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state;
  const flat = (x) => JSON.stringify(x);
  const errors = [];
  const cerr = console.error;
  console.error = (...a) => { if (a[0] === 'scene error') errors.push(a[1] + ': ' + String((a[2] && a[2].message) || a[2])); else cerr(...a); };

  // the runner, with the screen stood in for; every line, choice, hook and toast recorded
  let said = [], menus = [], hooks = [], toasts = [], want = [];
  RB.ui.dialogue.say = async (o) => { said.push(o && o.en); };
  RB.ui.dialogue.choose = async (opts) => { const en = opts.map((o) => o.en); menus.push(en); const w = want.shift(); const i = en.indexOf(w); return i >= 0 ? i : en.length - 1; };
  RB.ui.dialogue.hide = () => {};
  RB.ui.toast = async (x) => { toasts.push(typeof x === 'string' ? x : flat(x)); };
  RB.ui.fade = async () => {};
  for (const k of ['dismissExtras', 'refreshActors', 'placeCompanion']) RB.world[k] = () => {};
  RB.game.afterScene = () => {};
  RB.save.autosave = async () => {};
  RB.test.enable({});
  if (!RB.game.G.settings) RB.game.G.settings = {};
  const tell = RB.hooks.tellings;
  RB.hooks.tellings = async function (args) { hooks.push(args[0]); RB.game.G.s.vars._tell = 'both'; return undefined; };
  const KR = ['departed', 'ch1_done', 'ch2_done', 'mb1_done', 'mb2_done', 'ch3_done', 'ch4_done', 'kr_arrived', 'kr_fox_seen', 'kr_shozo_met'];
  const journey = (o = {}) => {
    const s = S.newCampaign({ edition: 2 });
    s.map = 'kr.fox'; s.x = 5; s.y = 12; s.comp = null;
    for (const f of KR.concat(o.flags || [])) s.flags[f] = true;
    for (const k of o.seen || []) s.seen[k] = true;
    if (o.quest) s.quests.kr_fox = o.quest;
    Object.assign(s.vars, o.vars || {});
    RB.game.G.s = s; RB.game.s = s;
    return s;
  };
  const shozo = (s) => (C.maps['kr.fox'].npcs || []).find((n) => n.id === 'kr_shozo');
  const pick = (s) => ((shozo(s).talk || []).find((x) => !x.if || S.test(s, x.if)) || {}).scene;
  const talk = async (s, w) => { said = []; menus = []; hooks = []; toasts = []; want = (w || []).slice(); const sc = pick(s); try { await RB.script.run(sc); } catch (e) { errors.push(sc + ': ' + e.message); } return { sc, said: said.slice(), menus: menus.slice(), hooks: hooks.slice(), toasts: toasts.slice() }; };
  const SETTLED = { stage: 99, done: true, t: 1 };
  const BOARD = 'The board\'s being painted now.';
  const OPEN = /All three say something different/;

  // 1. the scene
  {
    const sc = C.scenes['kr.shozo_idle'], cmds = sc.cmds, at = sc.labels.settled;
    t.ok(cmds[0].op === 'faceplayer' && cmds[1].op === 'if' && flat(cmds[1].args) === flat(['quest.kr_fox=done', '->', 'settled']) &&
      at === cmds.length - 2 && cmds[at - 1].op === 'goto' && flat(cmds[at - 1].args) === flat(['clues']) &&
      cmds[at].op === 'call' && flat(cmds[at].args) === flat(['kr.shozo_fox']) && cmds[at + 1].op === 'end',
    '1 the guard after he turns to you; the settled block after the register\'s own goto, calling kr.shozo_fox and ending ' + flat(cmds.map((c) => c.op)));
  }

  // 2. settled, before the chapter's end
  {
    const s = journey({ quest: SETTLED, flags: ['kr_record_read', 'kr_fox_board'], seen: ['kr.kame', 'kr.fox_shrine'], vars: { tell_kr: { t_fox: 'record' } } });
    const before = flat({ q: s.quests.kr_fox, v: s.vars.tell_kr, board: s.flags.kr_fox_board, flags: Object.keys(s.flags).filter((k) => !/^(seen|enter):/.test(k)).sort() });
    const r1 = await talk(s, ['Compare the tellings.']);
    const r2 = await talk(s, ['Compare the tellings.']);
    const after = flat({ q: s.quests.kr_fox, v: s.vars.tell_kr, board: s.flags.kr_fox_board, flags: Object.keys(s.flags).filter((k) => !/^(seen|enter):/.test(k)).sort() });
    t.ok(r1.sc === 'kr.shozo_idle' && flat(r1.said) === flat([BOARD]) && !r1.menus.length && !r1.hooks.length && !r1.toasts.length,
      '2 settled, before the chapter\'s end: only the board\'s line; no opening, choice, tellings or toast ' + flat(r1));
    t.ok(flat(r2.said) === flat([BOARD]) && !r2.menus.length && !r2.hooks.length && before === after,
      '2 and again on a second talk; the quest, the chosen telling, the board and every flag as they were ' + flat({ r2: r2.said, same: before === after }));
  }

  // 3. not yet settled: as before
  {
    const s = journey({ quest: { stage: 0, done: false, t: 1 }, seen: ['kr.kame', 'kr.fox_shrine'] });
    const r = await talk(s, ['Ask to see the hamlet\'s register.', 'Compare the tellings.']);
    t.ok(r.sc === 'kr.shozo_idle' && OPEN.test(r.said[0] || '') && flat(r.menus[0]) === flat(['Ask to see the hamlet\'s register.', 'Later.']) &&
      flat(r.menus[1]) === flat(['Compare the tellings.', 'Later.']) && flat(r.hooks) === flat(['kr.t_fox']) && s.quests.kr_fox.done && !r.said.includes(BOARD),
    '3 not yet settled: the opening, the register asked for and read, the comparison, settled through the tellings once ' + flat({ said0: r.said[0], menus: r.menus, hooks: r.hooks }));
    const s2 = journey({ quest: { stage: 0, done: false, t: 1 }, seen: ['kr.kame'] , flags: ['kr_record_read'] });
    const r2 = await talk(s2, []);
    t.ok(OPEN.test(r2.said[0] || '') && !r2.menus.length && !r2.hooks.length && !s2.quests.kr_fox.done, '3 a clue still missing: the opening, and no comparison yet, as before ' + flat(r2));
  }

  // 4. after the chapter's end
  {
    const a = journey({ quest: SETTLED, flags: ['kr_done', 'kr_record_read', 'kr_fox_board'], vars: { tell_kr: { t_fox: 'both' } } });
    const b = journey({ flags: ['kr_done'] });
    t.ok(pick(a) === 'kr.shozo_after' && pick(b) === 'kr.shozo_after', '4 after the chapter\'s end: kr.shozo_after, settled or never begun, as before ' + flat([pick(a), pick(b)]));
  }

  // 5. a save's round trip
  {
    const s = journey({ quest: SETTLED, flags: ['kr_record_read', 'kr_fox_board'], vars: { tell_kr: { t_fox: 'three' } } });
    const st = RB.save.migrate(JSON.parse(JSON.stringify(s)));
    RB.game.G.s = st; RB.game.s = st;
    const r = await talk(st, ['Compare the tellings.']);
    t.ok(flat(r.said) === flat([BOARD]) && !r.menus.length && !r.hooks.length && st.vars.tell_kr.t_fox === 'three', '5 a save\'s round trip: the settled talk, the telling kept ' + flat(r.said));
  }

  RB.hooks.tellings = tell;
  t.ok(!errors.length, 'no scene ended on an error from the runner ' + errors.slice(0, 3).join(' | '));
  console.error = cerr;
};
