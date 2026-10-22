// RBN-QA-117 (Agnes 6345492041, 6345823982, 6345967079; Cloud CC-123 §9, CC-124 §6): Steamhollow's guidance, at two
// steps where the Journey or the guide pointed where the quest could not go on:
//  1. stage 3: once Tahei has been heard (yn_shimo_heard), the Journey's "What to do now" names the red bridge in the
//     lower town (textIf, the first that holds), not "Hear the Lower House's side too"; before, as it was; the guide
//     still marks the bridge's trigger;
//  2. stage 5: while the grille under the spring house is shut (!yn_vents_open), the guide points to Aki in the lower
//     town (atIf), and its second nudge is that entry's own hint (Aki has the key); once the grille is open, the
//     guide derives the way on as before and the hint is gone;
//  3. the hint is the one of the SAME first atIf entry that chose the place, else the stage's own: every other stage
//     in the game with atIf (none of them has an entry hint) gives the same nudges as before;
//  4. stage 6 is unchanged (no authored place: the hall is not targeted while the evening is pending);
//  5. asking changes nothing in the journey.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const C = RB.content, G = RB.questGuide;
  const Q = C.quests.yn_main;
  const BEFORE = ['departed', 'ch1_done', 'ch2_done', 'mb1_done', 'mb2_done', 'ch3_done', 'ch4_done', 'kr_done', 'ch5_done', 'ko_done', 'cr_called', 'cr_done', 'cr_delivered', 'yn_called', 'yn_kami_seen', 'yn_rooms_done'];
  function camp(stage, flags) {
    const s = RB.state.newCampaign({ edition: 2 });
    s.id = 'qa117'; s.comp = 'mio';
    for (const f of BEFORE) s.flags[f] = true;
    Object.assign(s.flags, flags || {});
    s.quests.yn_main = { stage, done: false, t: 1 };
    s.map = 'yn.lower'; s.x = 10; s.y = 16;
    RB.game.s = s;
    return s;
  }
  const lines = (n) => [].concat(...n.lines).map((l) => l.en).join(' | ');
  // the Journey's objective: the first textIf entry that holds, else the stage (src/ui/50_menu.js stageOf)
  const objective = (stage, s) => ((stage.textIf || []).find((x) => RB.state.test(s, x.if)) || stage).en;
  // 1. stage 3
  const st3 = Q.stages[3];
  t.ok(objective(st3, camp(3)) === st3.en && /Hear the Lower House/.test(st3.en), 'stage 3 before Tahei: "' + objective(st3, camp(3)) + '"');
  const heard = camp(3, { yn_shimo_heard: true });
  t.ok(/red bridge in the lower town/.test(objective(st3, heard)) && !/Hear the Lower House/.test(objective(st3, heard)), 'stage 3 once Tahei is heard: "' + objective(st3, heard) + '"');
  t.ok(st3.textIf[0].jp.includes('{赤|あか}い {橋|はし}') && st3.textIf.length === 1, 'its Japanese names the red bridge, with readings');
  const r3 = G.targets('yn_main', heard);
  t.ok(r3.targets.some((e) => e.map === 'yn.lower' && e.kind === 'trigger'), 'the guide still marks the bridge (' + r3.targets.map((e) => e.map + ':' + e.kind).join(', ') + ')');
  // 2. stage 5
  const shut = camp(5, { yn_shimo_heard: true, yn_quarrel: true, yn_guild_told: true });
  const r5 = G.targets('yn_main', shut);
  t.ok(r5.targets.length === 1 && r5.targets[0].map === 'yn.lower' && r5.targets[0].kind === 'npc' && r5.targets[0].id === 'yn_aki', 'stage 5, the grille shut: the guide points to Aki in the lower town (' + r5.targets.map((e) => e.map + ':' + e.kind + ':' + e.id).join(', ') + ')');
  const n5 = lines(G.nudges('yn_main', shut));
  t.ok(/Aki has the key to the grille at the spring house/.test(n5) && /Aki/.test(n5), 'its nudges name Aki, with the entry\'s hint: ' + n5.slice(0, 200));
  const open = camp(5, { yn_shimo_heard: true, yn_quarrel: true, yn_guild_told: true, yn_vents_open: true });
  const r5o = G.targets('yn_main', open);
  const n5o = lines(G.nudges('yn_main', open));
  t.ok(!r5o.targets.some((e) => e.id === 'yn_aki') && !/has the key to the grille/.test(n5o), 'the grille open: back to the derived way on, the hint gone (' + r5o.targets.map((e) => e.map + ':' + e.kind).join(', ') + ')');
  // 3. every other stage with atIf: the stage's own hint (or none), as before
  const others = [];
  for (const [qid, q] of Object.entries(C.quests)) (q.stages || []).forEach((stg, k) => { if (stg.atIf && !(qid === 'yn_main' && k === 5)) others.push([qid, k, stg]); });
  t.ok(others.length >= 3 && others.every(([, , stg]) => stg.atIf.every((x) => !x.hint)), 'the other atIf stages (' + others.map(([q, k]) => q + ':' + k).join(', ') + ') have no entry hint, so their nudges use the stage\'s own as before');
  // 4. stage 6 unchanged
  t.ok(!Q.stages[6].atIf && !Q.stages[6].at && !Q.stages[6].textIf, 'stage 6 has no authored place or wording');
  // 5. pure
  const s = camp(5, { yn_shimo_heard: true, yn_quarrel: true, yn_guild_told: true });
  const before = JSON.stringify(s);
  G.targets('yn_main', s); G.nudges('yn_main', s); G.nextLines(G.targets('yn_main', s));
  t.ok(JSON.stringify(s) === before, 'asking changes nothing in the journey');
};
