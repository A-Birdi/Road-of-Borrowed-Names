// RBN-QA-162 (Agnes 6373739758): Kanta's snow-sculpture contest is judged by talking to him, and after the story his
// news came first in his talk, so a contest left open could never be judged (the three sculptures looked at, no
// judging, the scarf never given). Now an open contest comes first, before and after the story; his news after the
// story follows. In node, with the real script runner:
//  1. his talk (at his usual place and at his two routine places, which share the list), for each state of the contest
//     (none, 0, 1, done), before and after the story, with Hoshino stayed or gone: an open contest goes to Kanta's
//     contest scene; otherwise as before;
//  2. after the story, stage 0 with one sculpture not yet looked at: no judging, the contest stays at 0;
//  3. after the story, all three looked at: the judging; a wrong answer leaves it open (stage 1, nothing given), the
//     next talk judges again; the right answer gives the scarf once and ends it; then his news again;
//  4. the quest guide's next step for stage 1 after the story is Kanta (it was nothing to do);
//  5. Chiyo's and Rokuta's lists are unchanged.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const C = RB.content;
  const kantas = Object.entries(C.maps).flatMap(([m, d]) => (d.npcs || []).filter((n) => (n.char || n.id) === 'kanta' && Array.isArray(n.talk)).map((n) => [m, n]));
  const base = kantas.find(([m, n]) => m === 'sb.hamlet' && n.id === 'kanta')[1];
  t.ok(kantas.length === 3 && kantas.every(([, n]) => n.talk === base.talk), 'his usual place and his two routine places share one talk list (' + kantas.map(([m, n]) => n.id + '@' + m).join(', ') + ')');
  const first = (s) => { const o = base.talk.find((x) => !x.if || RB.state.test(s, x.if)); return o && o.scene; };
  const contest = (stage) => (stage == null ? {} : stage === 'done' ? { sb_snow: { stage: 1, done: true, t: 1 } } : { sb_snow: { stage, done: false, t: 1 } });
  const st = (o) => ({ flags: Object.assign({ sb_lamp_lit: true }, o.flags || {}), seen: {}, vars: {}, quests: contest(o.stage), inv: {}, notebook: [], comp: null });

  // ---- 1.
  const rows = [], want = [];
  for (const post of [false, true]) for (const extra of post ? [{}, { sb_hoshino_goes: true }] : [{}]) {
    for (const stage of [null, 0, 1, 'done']) {
      const tag = (post ? 'post' : 'before') + (Object.keys(extra)[0] ? '+' + Object.keys(extra)[0] : '') + ' ' + stage + ': ';
      rows.push(tag + first(st({ flags: Object.assign({}, extra, post ? { postgame: true } : {}), stage })));
      want.push(tag + (post && (stage === null || stage === 'done') ? 'sb.kanta_post' : 'sb.kanta'));
    }
  }
  t.eq(rows, want, 'an open contest (0, 1) goes to his contest scene, before and after the story; otherwise his news after the story, and before it as before');

  // ---- the runner
  const said = [];
  let right = false;
  RB.ui.dialogue.say = async (l) => { said.push(l); };
  RB.ui.dialogue.choose = async () => 0;
  RB.ui.dialogue.hide = () => {};
  RB.ui.toast = async () => {};
  RB.challenge.run = async () => ({ ok: right });
  for (const k of ['ensureSpeaker', 'dismissExtras', 'refreshActors']) RB.world[k] = () => {};
  RB.world.whenArrived = async () => {};
  RB.game.afterScene = () => {};
  RB.save.autosave = async () => {};
  const POST = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, sb_storm: true, sb_morning: true, sb_lamp_lit: true, kr_done: true, ch5_done: true, ko_done: true, cr_done: true, postgame: true };
  const journey = (o) => {
    const s = RB.state.newCampaign({ edition: 2 });
    s.id = 'qa162'; s.map = 'sb.hamlet'; s.comp = null; s.travel = { snowbell: true };
    Object.assign(s.flags, POST);
    Object.assign(s.seen, o.seen || {});
    Object.assign(s.quests, contest(o.stage));
    RB.game.G.s = s;
    return s;
  };
  const talk = async (s) => { said.length = 0; await RB.script.run(first(s)); return said.map((l) => l.who + ': ' + l.en); };
  const scarf = (s) => s.inv.sb_scarf || 0;
  const ALL3 = { 'sb.sculpt_goat': true, 'sb.sculpt_obs': true, 'sb.sculpt_fox': true };

  // ---- 2.
  {
    const s = journey({ stage: 0, seen: { 'sb.sculpt_goat': true, 'sb.sculpt_obs': true } });
    const L = await talk(s);
    t.ok(s.quests.sb_snow.stage === 0 && !s.quests.sb_snow.done && scarf(s) === 0 && L.some((x) => /Seen all three\?/.test(x)) && !L.some((x) => /Decided\?/.test(x)), 'after the story, one sculpture not looked at: he asks if you have seen all three; no judging (' + JSON.stringify(L) + ')');
  }
  // ---- 3.
  {
    const s = journey({ stage: 0, seen: ALL3 });
    right = false;
    const L1 = await talk(s);
    t.ok(L1.some((x) => /Decided\? Which one wins\?/.test(x)) && L1.some((x) => /Take your time/.test(x)) && s.quests.sb_snow.stage === 1 && !s.quests.sb_snow.done && scarf(s) === 0, 'all three looked at: the judging; a wrong answer leaves it open at 1, nothing given (' + JSON.stringify(L1) + ')');
    t.eq(first(s), 'sb.kanta', 'the next talk is the contest again');
    right = true;
    const L2 = await talk(s);
    t.ok(L2.some((x) => /Chiyo's observatory!/.test(x)) && s.quests.sb_snow.done && scarf(s) === 1, 'the right answer: Chiyo\'s observatory wins, the scarf once, the contest done (' + JSON.stringify(L2.slice(-3)) + ')');
    t.eq(first(s), 'sb.kanta_post', 'and then his news again');
    await talk(s);
    t.ok(scarf(s) === 1 && s.quests.sb_snow.done, 'talked to again: nothing given twice');
  }
  // ---- 4.
  {
    const s = journey({ stage: 1, seen: ALL3 });
    const r = RB.questGuide.analyse('sb_snow', s);
    t.ok(r.how === 'direct' && r.targets.map((x) => x.map + ':' + x.id).join() === 'sb.hamlet:kanta', 'the guide\'s next step for an open judging after the story: Kanta (' + r.how + ' ' + JSON.stringify(r.targets.map((x) => x.map + ':' + x.id)) + ')');
  }
  // ---- 5.
  const lists = ['chiyo', 'rokuta'].map((id) => JSON.stringify(C.maps['sb.hamlet'].npcs.find((n) => n.id === id).talk));
  t.eq(lists, [JSON.stringify([{ if: 'post', scene: 'sb.chiyo_post' }, { scene: 'sb.chiyo' }]), JSON.stringify([{ if: 'ed>=2&mb2_done&!post&!sb2_rokuta_city', scene: 'sb2.rokuta_city' }, { if: 'post', scene: 'sb.rokuta_post' }, { scene: 'sb.rokuta' }])],
    'Chiyo\'s and Rokuta\'s lists are as before');
};
