// The Light Above Snowbell, the morning after the storm (Agnes 6458558475; Local CL-519; Cloud CC-371): once the night
// upstairs is over (sb_morning), the step is Hoshino downstairs with the observatory key, and the guide already marks
// him; but the objective still said to wait out the storm in the room upstairs. In node:
//  1. stage 5's objective: at night its own words; in the morning, before the key, "The storm has passed. Talk to
//     Hoshino downstairs at Yukimiya.", with readings; the stages are as before (nine), and no other stage gains a textIf;
//  2. the guide, its cache reset for each state: at night the room upstairs; in the morning Hoshino in the inn; after the
//     key (stage 6) the ice on the Star Stair, with stage 6's own words;
//  3. with the real runner, in the morning: Hoshino's scene gives the key and moves the quest to stage 6, whose words
//     are unchanged.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state, G = RB.questGuide, test = S.test;
  const st = C.quests.sb_lamp.stages;
  const BASE = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, sb_hamlet_seen: true, sb_letters_done: true, sb_storm: true, sb_hearth_done: true };
  const MORNING = { sb_morning: true, sb_quiet_done: true };
  const journey = (flags, stage) => {
    const s = S.newCampaign({ edition: 2 }); s.comp = 'ren'; s.map = 'sb.inn'; s.x = 6; s.y = 6;
    Object.assign(s.flags, BASE, flags || {});
    s.quests.sb_lamp = { stage, done: false, t: 1 };
    RB.game.G.s = s; RB.game.s = s;
    return s;
  };
  const objective = (s) => { const x = st[s.quests.sb_lamp.stage]; return ((x.textIf || []).find((o) => test(s, o.if)) || x).en; };
  const where = (e) => e.map + ':' + e.kind + ':' + (e.id || e.p) + (e.kind === 'prop' ? '@' + e.x + ',' + e.y : '');
  const NIGHT = 'Wait out the storm at Yukimiya. When you are ready to rest, your room is upstairs.';
  const DOWN = 'The storm has passed. Talk to Hoshino downstairs at Yukimiya.';
  const STAIR = 'The storm has passed. Climb the Star Stair, past Hoshino\'s house, to the observatory.';

  // ---- 1. the objective
  t.eq([objective(journey({}, 5)), objective(journey(MORNING, 5))], [NIGHT, DOWN], '1 stage 5: at night its own words; in the morning, Hoshino downstairs');
  t.ok(st.length === 9 && (st[5].textIf || []).length === 1 && st[5].textIf[0].if === 'sb_morning' &&
    st[5].textIf[0].jp === '{吹雪|ふぶき} が やんだ 。 {雪見屋|ゆきみや} の {一階|いっかい} で 、 ホシノ と {話|はな}そう 。' &&
    st.every((x, i) => i === 5 || !x.textIf), '1 nine stages as before; only stage 5 has the morning text, its Japanese with a reading on every kanji');

  // ---- 2. the guide
  const rows = [];
  for (const [label, flags, stage] of [['night, stage 5', {}, 5], ['morning before the key, stage 5', MORNING, 5], ['after the key, stage 6', Object.assign({ sb_obs_open: true }, MORNING), 6]]) {
    G.reset();
    const s = journey(flags, stage);
    if (stage === 6) s.inv.sb_obs_key = 1;
    s.follow = 'sb_lamp';
    const r = G.targets('sb_lamp', s);
    rows.push(label + ': ' + r.how + ' ' + r.targets.map(where).join(', ') + ' | ' + objective(s));
  }
  t.eq(rows, ['night, stage 5: needs sb.inn_room:enter:undefined | ' + NIGHT, 'morning before the key, stage 5: direct sb.inn:npc:hoshino | ' + DOWN,
    'after the key, stage 6: authored sb.hamlet:prop:sb_icewall@30,1 | ' + STAIR], '2 the guide and the objective: the room at night, Hoshino in the morning, the Star Stair after the key');

  // ---- 3. the real runner: Hoshino's morning scene gives the key and moves the quest on
  RB.ui.dialogue.say = async () => {};
  RB.ui.dialogue.choose = async () => 0;
  RB.ui.dialogue.hide = () => {};
  RB.ui.toast = async () => {};
  RB.ui.shake = () => {};
  for (const k of ['dismissExtras', 'refreshActors']) RB.world[k] = () => {};
  RB.game.afterScene = () => {};
  RB.save.autosave = async () => {};
  const s = journey(MORNING, 5);
  const before = objective(s);
  await RB.script.run('sb.morning_hoshino');
  t.ok(before === DOWN && s.quests.sb_lamp.stage === 6 && (s.inv.sb_obs_key || 0) === 1 && s.flags.sb_obs_open && objective(s) === STAIR,
    '3 Hoshino in the morning: the key, stage 6, and stage 6\'s own words (' + JSON.stringify({ q: s.quests.sb_lamp, key: s.inv.sb_obs_key, now: objective(s) }) + ')');
};
