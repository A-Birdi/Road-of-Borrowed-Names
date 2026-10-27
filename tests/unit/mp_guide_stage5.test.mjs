// Blockprint and Footlights, step 5 (Agnes 6444900108; Cloud CC-354): after Tomi's three plans, mp.tomi_ready moves the
// quest to "Go down into the Understage…", but the Understage is found only when you next talk to Manbē in the Playhouse
// (mp.manbe_under sets mp_under_open), and the step leaves only after the Lord of the Understage, which the live guide
// cannot see through, so it marked nothing anywhere:
//  1. before the discovery: the Journey says to return to the playhouse and help Manbē (textIf), and the guide points to
//     Manbē in the Playhouse (atIf), from the committee room, Playhouse Row and the Playhouse;
//  2. his talk there is the discovery (mp.manbe_under, which sets mp_under_open);
//  3. the lift lowered, before you are below: the step's own words, unchanged, and the guide points to the trap lift;
//  4. once below (mp_under_seen): the guide as it was (the Understage's machines are yours);
//  5. no renumbering: seven steps, steps 4 and 6 as they were, the static target of step 5 as it was;
//  6. asking changes nothing in the journey.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const C = RB.content, G = RB.questGuide, test = RB.state.test;
  const Q = C.quests.mp_main, st5 = Q.stages[5];
  // Manybridge, Chapter 4, after mp.tomi_ready: the notice printed, the rehearsal done, the three plans made
  const BEFORE = ['departed', 'ch1_done', 'ch2_done', 'mb_arrived', 'mb1_done', 'mb_main_done', 'mp_arrived', 'mp_sobe_met', 'mp_press_open',
    'press_printed', 'press_notice', 'mp_theatre_seen', 'mp_rehearsal_done', 'mp_fest_heard', 'mp_prep_met', 'mp_lan_bank', 'mp_prep_lanterns',
    'mp_st_bank', 'mp_prep_stalls', 'mp_proc_drums', 'mp_prep_procession'];
  function camp(map, x, y, flags) {
    const s = RB.state.newCampaign({ edition: 2 });
    s.id = 'mp5'; s.comp = 'ren';
    for (const f of BEFORE) s.flags[f] = true;
    Object.assign(s.flags, flags || {});
    s.quests.mp_main = { stage: 5, done: false, t: 1 };
    s.map = map; s.x = x; s.y = y;
    RB.game.s = s;
    return s;
  }
  // the Journey's objective: the first textIf entry that holds, else the stage (src/ui/50_menu.js stageOf)
  const objective = (s) => ((st5.textIf || []).find((x) => test(s, x.if)) || st5);
  const where = (e) => e.map + ':' + e.kind + ':' + (e.id || e.p) + (e.kind === 'prop' ? '@' + e.x + ',' + e.y : '');
  const lines = (n) => [].concat(...n.lines).map((l) => l.en).join(' | ');
  const STAGE_EN = 'Go down into the Understage beneath the stage and bring the names back.';

  // 1. before the discovery
  for (const [label, map, x, y] of [['the committee room', 'mp.committee', 5, 5], ['Playhouse Row', 'mp.playhouse', 39, 8], ['the Playhouse', 'mp.theatre', 10, 12]]) {
    const s = camp(map, x, y);
    const o = objective(s);
    t.ok(o.en === 'Return to the playhouse and help Manbē recover the missing names.' && o.jp.includes('{芝居小屋|しばいごや}') && o.jp.includes('マンベエ'), '1 ' + label + ': the Journey says to return to the playhouse and help Manbē ("' + o.en + '")');
    const r = G.targets('mp_main', s);
    t.eq([r.how, r.targets.map(where)], ['authored', ['mp.theatre:npc:mp_manbe']], '1 ' + label + ': the guide points to Manbē in the Playhouse');
    const n = G.nudges('mp_main', s), next = G.nextLines(r).map((l) => l.en).join(' | ');
    t.ok(n.markable && /Manbē/.test(lines(n)) && /The Playhouse/.test(lines(n)) && /^Next: Manbē, in The Playhouse/.test(next), '1 ' + label + ': marked, and the nudges name him and the place (' + next + ' / ' + lines(n) + ')');
  }
  t.ok((st5.textIf || []).length === 1 && /\{戻\|もど\}り/.test(st5.textIf[0].jp) && /\{手伝\|てつだ\}って/.test(st5.textIf[0].jp) && /\{消\|き\}えた \{名前\|なまえ\}/.test(st5.textIf[0].jp), '1 its Japanese has readings on every word with kanji');

  // 2. his talk there is the discovery
  {
    const s = camp('mp.theatre', 10, 12);
    const npc = C.maps['mp.theatre'].npcs.find((n) => n.id === 'mp_manbe');
    const scene = (npc.talk.find((o) => !o.if || test(s, o.if)) || {}).scene;
    const sets = C.scenes[scene] && C.scenes[scene].cmds.some((c) => c.op === 'set' && c.args.includes('mp_under_open'));
    t.ok(test(s, npc.if) && scene === 'mp.manbe_under' && sets, '2 Manbē is in the Playhouse, and his talk plays ' + scene + ', which sets mp_under_open');
  }

  // 3. the lift lowered, before you are below
  for (const [label, map, x, y] of [['the Playhouse', 'mp.theatre', 10, 9], ['Playhouse Row', 'mp.playhouse', 23, 12]]) {
    const s = camp(map, x, y, { mp_under_open: true });
    t.eq(objective(s).en, STAGE_EN, '3 ' + label + ', the lift lowered: the step\'s own words, unchanged');
    const r = G.targets('mp_main', s);
    t.eq([r.how, r.targets.map(where)], ['authored', ['mp.theatre:prop:mp_lift@9,3']], '3 ' + label + ': the guide points to the lift');
    const next = G.nextLines(r).map((l) => l.en).join(' | ');
    t.ok(/^Next: the trap lift, in The Playhouse/.test(next) && /trap lift/.test(lines(G.nudges('mp_main', s))), '3 ' + label + ': named "the trap lift" (' + next + ')');
  }
  {
    const s = camp('mp.theatre', 10, 9, { mp_under_open: true });
    const lift = C.maps['mp.theatre'].props.filter((p) => p.p === 'mp_lift' && p.x === 9 && p.y === 3 && (!p.if || test(s, p.if)));
    t.ok(lift.length === 1 && lift[0].scene === 'mp.under_go', '3 the lift there is the lowered one, which takes you down (' + lift.map((p) => p.scene).join(', ') + ')');
  }

  // 4. once below: as it was without the authored places
  {
    const saved = st5.atIf;
    for (const [label, map, x, y, flags] of [['the first level', 'mp.under1', 3, 3, {}], ['the bottom', 'mp.bottom', 13, 14, { mp_bottom_seen: true }], ['back up in the Playhouse', 'mp.theatre', 10, 9, {}]]) {
      const s = camp(map, x, y, Object.assign({ mp_under_open: true, mp_under_seen: true }, flags));
      const now = G.targets('mp_main', s);
      delete st5.atIf;
      const was = G.targets('mp_main', camp(map, x, y, Object.assign({ mp_under_open: true, mp_under_seen: true }, flags)));
      if (saved) st5.atIf = saved;
      t.eq([now.how, now.targets.map(where)], [was.how, was.targets.map(where)], '4 ' + label + ', once below: the guide as it was (' + now.how + ')');
      t.eq(objective(s).en, STAGE_EN, '4 ' + label + ': the step\'s own words');
    }
  }

  // 5. no renumbering
  t.ok(Q.stages.length === 7 && st5.en === STAGE_EN, '5 seven steps; step 5\'s own words unchanged');
  t.ok([4, 6].every((k) => !Q.stages[k].at && !Q.stages[k].atIf && !Q.stages[k].textIf), '5 steps 4 and 6 have no authored place or wording');
  {
    const st = RB.state.newCampaign();
    st.quests.mp_main = { stage: 5, done: false, t: 1 };
    t.eq(G.analyse('mp_main', st, { static: true, derive: true }).targets.map(where), ['mp.bottom:npc:mp_naraku'], '5 the static target of step 5 is as it was: the Lord of the Understage');
  }

  // 6. pure
  {
    const s = camp('mp.committee', 5, 5);
    const before = JSON.stringify(s);
    G.targets('mp_main', s); G.nudges('mp_main', s); G.nextLines(G.targets('mp_main', s));
    t.ok(JSON.stringify(s) === before, '6 asking changes nothing in the journey');
  }
};
