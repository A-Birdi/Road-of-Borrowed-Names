// The Pilgrim's Stamp Book (kr_stamps; Cloud CC-391; Local CL-544; Agnes 6542470604): Iwa's list took her after-chapter
// line first, so once the chapter was over her stamp book could not be given back, nor the filled book handed in, and
// the guide had nothing to mark; and the quest can be begun then too (her first meeting, the book and the shrines are
// not tied to the chapter). On the real runner, entering through Iwa's own talk list as talkTo picks it
// (src/engine/50_world.js), with the book and the shrines run as their own scenes on seeded journeys: the route as the
// scripts run it, not as it is walked (tests/e2e/kr_stamps_route.mjs walks it):
//  1. who answers, in the chapter, after it and in the postgame: never begun, the book held, stage 1 with no, one, two
//     or all seals, done;
//  2. in the chapter, the whole route as before: the book, her thanks, the three shrines, her hand-in: done once, the
//     book taken, kr_stamps_done set;
//  3. after the chapter, a stage-0 journey carried over: the same route, done once; then her after-chapter line;
//  4. after the chapter, begun then (Local CL-544): her first meeting, the book, then the same route, done once;
//  5. after the chapter, a stage-1 journey with no seals: her shrines line with none, one and two, done with all three;
//  6. every seal pressed before her thanks, in the chapter and after it: her thanks, then her hand-in on the next talk;
//  7. the postgame, all seals: done; then her after-chapter line;
//  8. done, then asked again (after the chapter and in the postgame), and a shrine again: one completion, the book not
//     given back, the book not offered again, no seal;
//  9. the guide after the chapter: Iwa (the book held), the shrines still to visit (none, one, two pressed), Iwa (all
//     seals), nothing (done);
// 10. and no talk or scene ended on an error from the runner.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state, G = RB.questGuide;
  const iwa = C.maps['kr.fox'].npcs.find((n) => n.id === 'kr_iwa' && Array.isArray(n.talk));
  const foot = C.maps['kr.foot'].npcs.find((n) => n.id === 'kr_iwa');
  const pile = C.maps['kr.steps'].props.find((p) => p.scene === 'kr.iwa_book');
  const flat = (x) => JSON.stringify(x);

  // the runner, with the screen stood in for: what is said and shown (none of these scenes asks a choice)
  let said = [], toasts = [];
  RB.ui.dialogue.say = async (o) => { said.push(o && o.en); };
  RB.ui.dialogue.choose = async (opts) => { throw new Error('a choice was asked: ' + flat(opts.map((o) => o.en))); };
  RB.ui.dialogue.hide = () => {};
  RB.ui.toast = async (o) => { toasts.push(o.kind + ':' + o.en); };
  RB.ui.shake = () => {};
  RB.challenge.run = async () => ({ ok: true });
  for (const k of ['dismissExtras', 'refreshActors']) RB.world[k] = () => {};
  RB.game.afterScene = () => {};
  RB.save.autosave = async () => {};

  const SEALS = ['kr_seal_1', 'kr_seal_2', 'kr_seal_3'];
  const SHRINES = ['kr.shrine_foot', 'kr.shrine_steps', 'kr.fox_shrine'];
  const KR = { kr_done: true }, PG = { kr_done: true, postgame: true };
  // a seeded journey: Iwa met unless said; a stage with the book in hand; some seals; or the quest done
  const camp = (o = {}) => {
    G.reset();
    const s = S.newCampaign({ edition: 2 }); s.comp = 'nao'; s.map = 'kr.fox'; s.x = 5; s.y = 10;
    Object.assign(s.flags, { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_arrived: true }, o.met === false ? {} : { kr_iwa_met: true }, o.flags || {});
    if (o.stage != null) { s.quests.kr_stamps = { stage: o.stage, done: false, t: 1 }; s.flags.kr_iwa_book_found = true; s.inv.kr_stampbook = 1; }
    if (o.done) { s.quests.kr_stamps = { stage: 1, done: true, t: 1 }; Object.assign(s.flags, { kr_iwa_book_found: true, kr_stamps_done: true }); o.seals = 3; }
    for (let i = 0; i < (o.seals || 0); i++) s.flags[SEALS[i]] = true;
    RB.game.G.s = s; RB.game.s = s;
    toasts = [];
    return s;
  };
  const talkScene = (s) => (iwa.talk.find((x) => !x.if || S.test(s, x.if)) || {}).scene;
  const errors = [];
  const run = async (scene, ctx) => {
    said = [];
    try { await RB.script.run(scene, ctx || {}); } catch (e) { errors.push(scene + ': ' + String(e && e.message || e)); }
    return said.slice();
  };
  const talk = async (s) => { const scene = talkScene(s); return { scene, said: await run(scene, { npc: 'kr_iwa' }) }; };
  const shrines = async (from = 0, to = 3) => { for (let i = from; i < to; i++) await run(SHRINES[i]); };
  const DONE = 'quest_done:The Pilgrim\'s Stamp Book';
  const completions = () => toasts.filter((x) => x === DONE).length;
  // done, the book taken back, the reward's flag set
  const settled = (s) => !!(s.quests.kr_stamps && s.quests.kr_stamps.done) && !(s.inv.kr_stampbook > 0) && !!s.flags.kr_stamps_done;
  const AFTER = 'A lit road is kinder on the knees. You can walk it at night.';
  const THREE = 'Three shrines: at the foot, above the steps, and the fox shrine.';

  // ---- 1. who answers
  {
    const states = [{}, { stage: 0 }, { stage: 1 }, { stage: 1, seals: 1 }, { stage: 1, seals: 2 }, { stage: 1, seals: 3 }, { done: true }];
    const at = (flags) => states.map((o) => talkScene(camp(Object.assign({}, o, { flags }))));
    t.eq(at({}), ['kr.iwa_idle', 'kr.iwa_thanks', 'kr.iwa_idle', 'kr.iwa_idle', 'kr.iwa_idle', 'kr.iwa_done', 'kr.iwa_idle'],
      '1 in the chapter, as before: never begun, the book held, stage 1 with no, one, two and all seals, done');
    const after = ['kr.iwa_after', 'kr.iwa_thanks', 'kr.iwa_idle', 'kr.iwa_idle', 'kr.iwa_idle', 'kr.iwa_done', 'kr.iwa_after'];
    t.eq(at(KR), after, '1 after the chapter: the open quest\'s hand-ins and her shrines line first; never begun or done, her after-chapter line');
    t.eq(at(PG), after, '1 in the postgame: the same');
  }

  // ---- 2. in the chapter, the whole route as before
  {
    const s = camp();
    await run('kr.iwa_book');
    const a = await talk(s);
    const stage = s.quests.kr_stamps && s.quests.kr_stamps.stage;
    await shrines();
    const b = await talk(s);
    const c = await talk(s);
    t.ok(a.scene === 'kr.iwa_thanks' && stage === 1 && b.scene === 'kr.iwa_done' && settled(s) && completions() === 1 && c.scene === 'kr.iwa_idle',
      '2 in the chapter: the book, her thanks, the shrines, her hand-in: done once, the book taken (' + flat({ a: a.scene, stage, b: b.scene, c: c.scene, q: s.quests.kr_stamps, toasts }) + ')');
  }

  // ---- 3. after the chapter, a stage-0 journey carried over
  {
    const s = camp({ stage: 0, flags: KR });
    const a = await talk(s);
    const stage = s.quests.kr_stamps.stage;
    await shrines();
    const b = await talk(s);
    const c = await talk(s);
    t.ok(a.scene === 'kr.iwa_thanks' && stage === 1 && b.scene === 'kr.iwa_done' && settled(s) && completions() === 1 && c.scene === 'kr.iwa_after' && c.said.includes(AFTER),
      '3 after the chapter, the book held: her thanks, the shrines, her hand-in, done once; then her after-chapter line (' + flat({ a: a.scene, stage, b: b.scene, c: c.said, toasts }) + ')');
  }

  // ---- 4. after the chapter, begun then
  {
    const s = camp({ met: false, flags: KR });
    const atFoot = S.test(s, foot.if), atBridge0 = S.test(s, iwa.if);
    await run(foot.talk, { npc: 'kr_iwa' });
    const atBridge = S.test(s, iwa.if), shown = S.test(s, pile.if);
    await run(pile.scene);
    const gone = !S.test(s, pile.if), stage0 = s.quests.kr_stamps && s.quests.kr_stamps.stage === 0 && s.inv.kr_stampbook > 0;
    const a = await talk(s);
    await shrines();
    const b = await talk(s);
    t.ok(atFoot && !atBridge0 && atBridge && shown && gone && stage0 && a.scene === 'kr.iwa_thanks' && b.scene === 'kr.iwa_done' && settled(s) && completions() === 1,
      '4 begun after the chapter: her first meeting, the book, her thanks, the shrines, her hand-in: done once (' + flat({ atFoot, atBridge0, atBridge, shown, gone, stage0, a: a.scene, b: b.scene, toasts }) + ')');
  }

  // ---- 5. after the chapter, a stage-1 journey with no seals: her shrines line until all three
  {
    const s = camp({ stage: 1, flags: KR });
    const lines = [];
    for (let i = 0; i < 3; i++) { const r = await talk(s); lines.push(r.scene + (r.said.includes(THREE) ? ': the shrines' : '')); await run(SHRINES[i]); }
    const r = await talk(s);
    t.ok(flat(lines) === flat(['kr.iwa_idle: the shrines', 'kr.iwa_idle: the shrines', 'kr.iwa_idle: the shrines']) && r.scene === 'kr.iwa_done' && settled(s) && completions() === 1,
      '5 after the chapter, stage 1: her shrines line with none, one and two seals; done with all three (' + flat({ lines, last: r.scene, toasts }) + ')');
  }

  // ---- 6. every seal pressed before her thanks
  for (const [label, flags] of [['in the chapter', {}], ['after the chapter', KR]]) {
    const s = camp({ stage: 0, flags });
    await shrines();
    const pressed = SEALS.every((k) => s.flags[k]);
    const a = await talk(s);
    const stage = s.quests.kr_stamps.stage;
    const b = await talk(s);
    t.ok(pressed && a.scene === 'kr.iwa_thanks' && stage === 1 && b.scene === 'kr.iwa_done' && settled(s) && completions() === 1,
      '6 every seal before her thanks (' + label + '): her thanks, then her hand-in on the next talk (' + flat({ pressed, a: a.scene, stage, b: b.scene, toasts }) + ')');
  }

  // ---- 7. the postgame, all seals
  {
    const s = camp({ stage: 1, seals: 3, flags: PG });
    const a = await talk(s);
    const b = await talk(s);
    t.ok(a.scene === 'kr.iwa_done' && settled(s) && completions() === 1 && b.scene === 'kr.iwa_after',
      '7 the postgame, all seals: done; then her after-chapter line (' + flat({ a: a.scene, b: b.scene, toasts }) + ')');
  }

  // ---- 8. done, then asked again, and a shrine again
  {
    const s = camp({ stage: 1, seals: 3, flags: KR });
    await talk(s);
    const again = await talk(s);
    s.flags.postgame = true;
    const post = await talk(s);
    const shrine = await run(SHRINES[0]);
    t.ok(completions() === 1 && settled(s) && again.scene === 'kr.iwa_after' && post.scene === 'kr.iwa_after' && !S.test(s, pile.if) && !shrine.some((l) => /seal/.test(l || '')),
      '8 done, asked again after the chapter and in the postgame, a shrine again: one completion, the book not given back or offered again, no seal (' + flat({ again: again.scene, post: post.scene, shrine, toasts, inv: s.inv.kr_stampbook || 0 }) + ')');
  }

  // ---- 9. the guide after the chapter
  {
    const at = (o) => { const s = camp(Object.assign({ flags: KR }, o)); s.follow = 'kr_stamps'; const r = G.targets('kr_stamps', s); return (r.targets || []).map((x) => x.map + ':' + (x.id || x.p)); };
    const got = { book: at({ stage: 0 }), none: at({ stage: 1 }), one: at({ stage: 1, seals: 1 }), two: at({ stage: 1, seals: 2 }), all: at({ stage: 1, seals: 3 }), done: at({ done: true }) };
    t.eq(got, { book: ['kr.fox:kr_iwa'], none: ['kr.foot:shrine', 'kr.steps:shrine', 'kr.fox:shrine'], one: ['kr.steps:shrine', 'kr.fox:shrine'], two: ['kr.fox:shrine'], all: ['kr.fox:kr_iwa'], done: [] },
      '9 the guide after the chapter: Iwa with the book; the shrines still to visit; Iwa with all seals; nothing once done');
  }

  // ---- 10. no talk or scene ended on an error
  t.ok(!errors.length, '10 no talk or scene ended on an error from the runner (' + errors.length + ': ' + flat(errors.slice(0, 3)) + ')');
};
