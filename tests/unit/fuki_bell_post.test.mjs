// RBN-QA-161 (Agnes 6373640071; Local CL-243; Cloud CC-150 §1): after Chapter 4 Fuki stands by the bell-post in the
// square, and after the story her news came first in her talk, so a Bell-Post rung at noon could never be reported to
// her (stage 2 stuck, the cord never given). Now an open Bell-Post comes first, before and after the story; her news
// after the story follows; at stage 0 she reminds you rather than meeting you again; and the report's first line is
// said where she stands. In node, with the real script runner:
//  1. her talk in the square, for each state of the Bell-Post (none, 0, 1, 2, done), before and after the story, with
//     Hoshino stayed or gone and either ending memory: an open Bell-Post goes to its step; otherwise as before;
//  2. stage 0 in the square: the reminder, not her first meeting (the cold, the offer);
//  3. a journey stuck at stage 2 after the story, her news already heard: the report, its first line where she stands,
//     the cord once, the signals note once, the quest done; then her news again; nothing twice when talked to again;
//  4. in her house before the chapter's end the report is as before ("from my bed");
//  5. her other places (in her house, the evening, the storm) are unchanged;
//  6. the quest guide's next step for that stuck stage 2 is Fuki in the square (it was nothing to do).
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const C = RB.content;
  const fukis = Object.entries(C.maps).flatMap(([m, d]) => (d.npcs || []).filter((n) => n.id === 'fuki').map((n) => [m, n]));
  const sq = fukis.find(([m, n]) => m === 'sb.hamlet' && n.if === 'ch4_done&!sb_evening')[1];
  const first = (s) => { const o = sq.talk.find((x) => !x.if || RB.state.test(s, x.if)); return o && o.scene; };
  const bell = (stage) => (stage == null ? {} : stage === 'done' ? { sb_bell: { stage: 2, done: true, t: 1 } } : { sb_bell: { stage, done: false, t: 1 } });
  const st = (o) => ({ flags: Object.assign({ ch4_done: true }, o.flags || {}), seen: o.seen || {}, vars: {}, quests: bell(o.stage), inv: {}, notebook: [], comp: null });

  // ---- 1.
  const rows = [], want = [];
  for (const post of [false, true]) for (const extra of post ? [{}, { sb_hoshino_goes: true }, { end_mem_return: true }, { end_mem_choose: true }] : [{}]) {
    for (const stage of [null, 0, 1, 2, 'done']) {
      const flags = Object.assign({}, extra, post ? { postgame: true } : {});
      rows.push((post ? 'post' : 'before') + (Object.keys(extra)[0] ? '+' + Object.keys(extra)[0] : '') + ' ' + stage + ': ' + first(st({ flags, stage })));
      want.push((post ? 'post' : 'before') + (Object.keys(extra)[0] ? '+' + Object.keys(extra)[0] : '') + ' ' + stage + ': ' + (stage === null || stage === 'done' ? (post ? 'sb.fuki_post' : 'sb.fuki_after') : 'sb.fuki'));
    }
  }
  t.eq(rows, want, 'in the square: an open Bell-Post (0, 1, 2) goes to its step, before and after the story; otherwise her news after the story, and before it what she said before');

  // ---- the runner
  const said = [];
  RB.ui.dialogue.say = async (l) => { said.push(l); };
  RB.ui.dialogue.choose = async () => 0;
  RB.ui.dialogue.hide = () => {};
  RB.ui.toast = async () => {};
  for (const k of ['ensureSpeaker', 'dismissExtras', 'refreshActors']) RB.world[k] = () => {};
  RB.world.whenArrived = async () => {};
  RB.game.afterScene = () => {};
  RB.save.autosave = async () => {};
  const journey = (o) => {
    const s = RB.state.newCampaign({ edition: 2 });
    s.id = 'qa161'; s.map = o.map || 'sb.hamlet'; s.comp = null;
    Object.assign(s.flags, { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true }, o.flags || {});
    Object.assign(s.seen, o.seen || {});
    Object.assign(s.quests, bell(o.stage));
    RB.game.G.s = s;
    return s;
  };
  const talk = async (s, scene) => { said.length = 0; await RB.script.run(scene || first(s)); return said.filter((l) => l.who === 'fuki').map((l) => l.en); };
  const cord = (s) => s.inv.sb_bell_cord || 0, notes = (s) => s.notebook.filter((e) => e.id === 'sb_bell_signals').length;

  // ---- 2.
  {
    const s = journey({ flags: { ch4_done: true, postgame: true }, stage: 0 });
    const L = await talk(s);
    t.ok(L.length === 1 && /^Managed to read the notebook\?/.test(L[0]) && s.quests.sb_bell.stage === 0, 'stage 0 in the square: her reminder, not her first meeting (' + JSON.stringify(L) + ')');
  }
  // ---- 3.
  {
    const s = journey({ flags: { ch4_done: true, postgame: true }, stage: 2, seen: { 'sb.fuki_post': true } });
    t.eq(first(s), 'sb.fuki', 'stuck at stage 2 after the story, her news already heard: the next talk is the Bell-Post');
    const L = await talk(s);
    t.ok(/^I heard it\. The noon bell\. Two strokes, clean\. Fifty years of ringing it, and the first time I've listened from down here\.$/.test(L[0]) && !L.some((x) => /from my bed/.test(x)), 'the report, its first line where she stands (' + L[0] + ')');
    t.ok(cord(s) === 1 && notes(s) === 1 && s.quests.sb_bell.done, 'the cord once, the signals note once, the Bell-Post done (' + JSON.stringify({ cord: cord(s), notes: notes(s), q: s.quests.sb_bell }) + ')');
    t.eq(first(s), 'sb.fuki_post', 'and then her news again');
    const again = await talk(s);
    t.ok(again.length >= 1 && cord(s) === 1 && notes(s) === 1, 'talked to again: her news, nothing given twice (' + JSON.stringify(again) + ')');
    const replay = await talk(s, 'sb.fuki');
    t.ok(cord(s) === 1 && notes(s) === 1 && /A bell rings as long as there's someone to ring it/.test(replay.join(' ')), 'the Bell-Post\'s own scene once it is done: its closing word, nothing given (' + JSON.stringify(replay) + ')');
  }
  // ---- 4.
  {
    const s = journey({ flags: { sb_morning: true }, stage: 2, map: 'sb.fuki' });
    const L = await talk(s, 'sb.fuki');
    t.ok(/heard the bell from my bed\.$/.test(L[0]) && !L.some((x) => /from down here/.test(x)) && cord(s) === 1, 'in her house before the chapter\'s end: the report as before (' + L[0] + ')');
  }
  // ---- 6. (a journey as Chapter 4 leaves it: the storm and the morning after it, the evening over)
  {
    const s = journey({ flags: { ch4_done: true, sb_storm: true, sb_morning: true, sb_lamp_lit: true, kr_done: true, ch5_done: true, ko_done: true, cr_done: true, postgame: true }, stage: 2 });
    s.travel = { snowbell: true };
    const r = RB.questGuide.analyse('sb_bell', s);
    t.ok(r.how === 'direct' && r.targets.map((x) => x.map + ':' + x.id).join() === 'sb.hamlet:fuki', 'the guide\'s next step: Fuki in the square (' + r.how + ' ' + JSON.stringify(r.targets.map((x) => x.map + ':' + x.id)) + ')');
  }
  // ---- 5.
  const others = fukis.filter(([, n]) => n !== sq).map(([m, n]) => m + ' ' + n.x + ',' + n.y + ' ' + n.if + ' ' + JSON.stringify(n.talk));
  t.eq(others.length, 3, 'her other three places');
  t.ok(others.some((o) => /^sb\.fuki 2,3 !sb_storm&!sb_evening\|sb_morning&!ch4_done "sb\.fuki"$/.test(o)) && others.some((o) => /^sb\.hamlet 24,18 sb_evening&!post "sb\.eve_fuki"$/.test(o)) && others.some((o) => /"sb\.storm_fuki"$/.test(o)),
    'in her house, the evening and the storm: as before (' + others.join(' | ') + ')');
};
