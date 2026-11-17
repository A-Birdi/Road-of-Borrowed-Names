// QA-206: Ren's Archive banter about the gravestone ("The gravestone Kasane carved. The lettering was good.", sa.b_ren3)
// was offered as soon as the grave at the gate was read, before Ren had met Kasane or learned who carved it (Agnes
// 6943588129; Local CL-887; Cloud CC-640). The one change: its registration (src/content/ch6/54_scenes_side.js) waits
// for the meeting to be finished, sa_ushio_found&seen.sa.kasane_meet&!sa_hush_down; its lines, keys and every other
// registration unchanged. The meeting's marker (sa_met_kasane) is set on its first line, so a save made during the
// meeting and loaded later holds the marker without the scene seen (Local CL-889); the finished scene is the agreed,
// deliberately conservative completion marker, and nothing here claims more for other partial saves (no migration).
// On the real runner, the screen stood in for, talking to Ren the game's own way (RB.game.companionTalk), at the Archive
// Gate (sa.gate, an sa.* map), on synthetic journeys (flags and scenes seen set directly; the scenes themselves are
// played in tests/e2e/ren_banter_meet.mjs):
//  1. the registration: one, Ren's, on sa.*, with the agreed condition; RB.state.test reads its seen. term;
//  2. each state's Ren banters on offer, by the game's own filter, and whether a talk, every other Ren banter already
//     heard, picks this one: before the grave; the grave read, not met; the meeting under way (its marker set, the scene
//     not finished: the state a mid-meeting save holds), and the same past Kasane's leaving line; the meeting finished;
//     finished with the Stacks entered; finished without the grave (synthetic only, not reachable with Ren); after the
//     Hush;
//  3. with nothing heard yet: the grave read, the first talk is the first banter (sa.b_ren1) and the second the same
//     again (the reported order took the gravestone second); after the meeting, the first talk is this one;
//  4. each state through a save's JSON and the game's own load migration (RB.save.migrate): the same answers;
//  5. unaffected: every banter registration but this one exactly the parent's (315b770), and, in every state of 2, each
//     companion's banters on offer apart from this one exactly the parent's;
//  6. its lines and keys as on the parent;
//  every talk went to the banter list or to nothing; no scene ended on an error from the runner.
import crypto from 'node:crypto';
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state;
  const flat = (x) => JSON.stringify(x);
  const fp = (x) => crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex').slice(0, 16);
  const keyOf = (scene, jp) => scene + '#' + crypto.createHash('sha256').update(String(jp)).digest('hex').slice(0, 10);
  const errors = [];
  const cerr = console.error;
  console.error = (...a) => { if (a[0] === 'scene error') errors.push(a[1] + ': ' + String((a[2] && a[2].message) || a[2])); else cerr(...a); };

  // the runner, with the screen stood in for (as tests/unit/banter_guards.test.mjs); every scene started recorded
  let runs = [];
  RB.ui.dialogue.say = async () => {};
  RB.ui.dialogue.choose = async () => 0;
  RB.ui.dialogue.hide = () => {};
  RB.ui.toast = async () => {};
  RB.ui.fade = async () => {};
  for (const k of ['dismissExtras', 'refreshActors', 'placeCompanion']) RB.world[k] = () => {};
  RB.game.afterScene = () => {};
  RB.save.autosave = async () => {};
  RB.test.enable({});
  if (!RB.game.G.settings) RB.game.G.settings = {};
  const run0 = RB.script.run;
  RB.script.run = function (id) { runs.push(id); return run0.apply(this, arguments); };
  const settle = async () => { for (let i = 0; i < 50 && RB.script.isRunning(); i++) await new Promise((r) => setTimeout(r, 10)); };

  const REN3 = 'sa.b_ren3';
  const COND = 'sa_ushio_found&seen.sa.kasane_meet&!sa_hush_down';
  // on the parent (315b770): every registration but this one; each state's offers apart from this one; its lines
  const PARENT = { rest: [106, 'd323b3fd05e09828'], offers: '3c2eb8dcda84df69', lines: 'ef2daeb6957bad47' };
  const BEFORE = ['departed', 'ch1_done', 'ch2_done', 'ch3_done', 'ch4_done', 'ch5_done', 'sa_arrived'];
  const STATES = [
    { n: 'before the grave', flags: [], seen: [], want: ['sa.b_ren1'] },
    { n: 'the grave read, Kasane not met', flags: ['sa_ushio_found'], seen: ['sa.gate_first'], want: ['sa.b_ren1'] },
    { n: 'the meeting under way: its marker set, the scene not finished (a mid-meeting save)', flags: ['sa_ushio_found', 'sa_met_kasane'], seen: ['sa.gate_first'], want: [] },
    { n: 'the meeting under way, past Kasane\'s leaving line, not finished', flags: ['sa_ushio_found', 'sa_met_kasane', 'sa_kasane_left'], seen: ['sa.gate_first'], want: [] },
    { n: 'the meeting finished', flags: ['sa_ushio_found', 'sa_met_kasane', 'sa_kasane_left'], seen: ['sa.gate_first', 'sa.kasane_meet'], want: [REN3] },
    { n: 'the meeting finished, the Stacks entered', flags: ['sa_ushio_found', 'sa_met_kasane', 'sa_kasane_left'], seen: ['sa.gate_first', 'sa.kasane_meet', 'sa.stacks_enter'], want: ['sa.b_ren2', REN3] },
    { n: 'synthetic: the meeting finished, the grave not read', flags: ['sa_met_kasane', 'sa_kasane_left'], seen: ['sa.kasane_meet'], want: [] },
    { n: 'after the Hush', flags: ['sa_ushio_found', 'sa_met_kasane', 'sa_kasane_left', 'sa_hush_down'], seen: ['sa.gate_first', 'sa.kasane_meet', 'sa.stacks_enter'], want: ['sa.b_ren4'] },
  ];
  // a journey with `comp` at the Archive Gate, the states' flags and scenes seen; `heard`: banters already heard
  const journey = (comp, st, heard) => {
    const s = S.newCampaign({ edition: 2 });
    s.comp = comp; s.map = 'sa.gate'; s.x = 14; s.y = 19;
    for (const f of BEFORE.concat(st.flags)) s.flags[f] = true;
    s.flags['comp_' + comp] = true;
    for (const k of st.seen) s.seen[k] = true;
    for (const k of heard || []) s.seen[k] = true;
    RB.game.G.s = s; RB.game.s = s;
    return s;
  };
  // the game's own filter (src/engine/90_game.js companionTalk)
  const offers = (s) => C.banter.filter((b) => b.comp === s.comp && (!b.map || b.map === s.map || (b.map.endsWith('*') && s.map.startsWith(b.map.slice(0, -1)))) && (!b.if || S.test(s, b.if))).map((b) => b.scene);
  const taken = [];
  const banterScenes = new Set(C.banter.map((b) => b.scene));
  const talk = async () => { runs = []; RB.game.companionTalk(); await settle(); if (runs[0] && !banterScenes.has(runs[0])) taken.push(runs[0]); return runs[0] || null; };
  const othersHeard = C.banter.filter((b) => b.comp === 'ren' && b.scene !== REN3).map((b) => b.scene);
  const roundTrip = (s) => { const c = RB.save.migrate(JSON.parse(JSON.stringify(s))) || JSON.parse(JSON.stringify(s)); RB.game.G.s = c; RB.game.s = c; return c; };

  // 1. the registration
  const reg = C.banter.filter((b) => b.scene === REN3);
  t.ok(reg.length === 1 && reg[0].comp === 'ren' && reg[0].map === 'sa.*' && reg[0].if === COND, '1 sa.b_ren3: one registration, Ren\'s, on sa.*, offered once the meeting is finished ' + flat(reg));
  {
    const a = journey('ren', STATES[2]), b = journey('ren', STATES[4]);
    t.ok(S.test(a, 'seen.sa.kasane_meet') === false && S.test(b, 'seen.sa.kasane_meet') === true && S.test(a, COND) === false && S.test(b, COND) === true, '1 the condition is the game\'s own term: seen.sa.kasane_meet read by RB.state.test');
  }

  // 2. each state: the offers, and a talk with every other Ren banter heard
  for (const st of STATES) {
    const s = journey('ren', st, othersHeard);
    const got = offers(s);
    const pick = await talk();
    const want3 = st.want.includes(REN3);
    t.ok(flat(got) === flat(st.want) && (pick === REN3) === want3 && (want3 || pick === null || st.want.includes(pick)), '2 ' + st.n + ': Ren\'s banters on offer ' + flat(st.want) + ', the gravestone talk ' + (want3 ? 'picked' : 'not picked') + ' ' + flat({ got, pick }));
  }

  // 3. nothing heard yet: the order of talks
  {
    journey('ren', STATES[1], []);
    const a = await talk(), b = await talk();
    t.ok(a === 'sa.b_ren1' && b === 'sa.b_ren1', '3 the grave read, nothing heard: the first talk and the second are the first banter, not the gravestone ' + flat([a, b]));
    journey('ren', STATES[4], ['sa.b_ren1']);
    const c = await talk();
    t.ok(c === REN3, '3 the meeting finished, the first banter heard: the next talk is the gravestone ' + flat(c));
  }

  // 4. a save's JSON and the game's own load migration
  {
    const row = [];
    for (const st of STATES) {
      const s = roundTrip(journey('ren', st, othersHeard));
      const got = offers(s);
      const pick = await talk();
      row.push([st.n, flat(got) === flat(st.want) && (pick === REN3) === st.want.includes(REN3)]);
    }
    t.ok(row.every((x) => x[1]), '4 every state through a save\'s JSON and the load migration: the same answers ' + flat(row.filter((x) => !x[1])));
  }

  // 5. unaffected: every other registration, and every companion's other offers in each state
  {
    const rest = C.banter.filter((b) => b.scene !== REN3).map((b) => [b.comp, b.map || null, b.if || null, b.scene]);
    t.ok(rest.length === PARENT.rest[0] && fp(rest) === PARENT.rest[1], '5 every banter registration but this one, as on the parent ' + flat({ n: rest.length, fp: fp(rest) }));
    const all = [];
    for (const comp of ['nao', 'mio', 'ren', 'suzu']) for (const st of STATES) all.push([comp, st.n, offers(journey(comp, st)).filter((x) => x !== REN3)]);
    t.ok(fp(all) === PARENT.offers, '5 in every state, each companion\'s banters on offer apart from this one, as on the parent ' + flat({ fp: fp(all) }));
  }

  // 6. its lines and keys
  {
    const lines = C.scenes[REN3].cmds.filter((c) => c.op === 'say').map((c) => [c.who || null, c.expr || null, keyOf(REN3, c.jp), c.en, c.if || null]);
    t.ok(lines.length === 3 && fp(lines) === PARENT.lines, '6 its three lines and their keys as on the parent ' + flat({ n: lines.length, fp: fp(lines) }));
  }

  t.ok(!taken.length, 'every talk went to the banter list or to nothing: no waiting conversation took one ' + flat(taken.slice(0, 3)));
  t.ok(!errors.length, 'no scene ended on an error from the runner ' + errors.slice(0, 3).join(' | '));
  console.error = cerr;
};
