// RBN-QA-129 (Agnes 6348612003, 6348665949, 6348899693; Local CL-217; Cloud CC-131): Eggs for Everyone could not be
// finished once the valley's story was done: Yasuke (the descent) and Tsuneji (the lower town) stood only before
// `yn_done`, the quest needs all three eggs, and the guide, finding no way to finish it, said "You can't take this
// further just yet" even with Oshige still owed. Now nobody owed an egg leaves before getting it:
//  1. placement, in every state of the three deliveries (8), before and after the chapter's end, with the quest under
//     way, done, or never begun: Yasuke stands at (9,16) on the descent before the end as always, and after it only
//     while the quest is under way and his egg is owed; Tsuneji stands at (22,18) in the lower town before the end
//     until his egg (as QA-120 left it), and after it only while the quest is under way and his egg is owed; his place
//     by the Lower House's hearth still ends with the chapter; Oshige is as she was; none of it reads the companion;
//  2. the guide, after the end: the recipients it marks are exactly those still owed, in every state with one or more
//     owed (Oshige included where she is owed); at 3/3 the quest is done and nothing is marked;
//  3. what such a man says, after the end, while owed: his first talk is his egg scene (you always hold an egg while
//     one is owed: Tama gives three and only the three egg scenes take one), so no line of the valley's crisis is
//     replayed; the egg scenes give nothing and set only their own flag, and the third finishes the quest;
//  4. not changed: no `yn_done` rewind, no egg given or quest stage set for you; a quest never begun before the end
//     cannot be begun after it (Tama's talk is then her after-line): a limitation kept, not repaired.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content;
  const npc = (map, id) => (C.maps[map].npcs || []).find((a) => a.id === id);
  const Y = npc('yn.descent', 'yn_yasuke'), T = npc('yn.lower', 'yn_tsuneji'), TH = npc('yn.shimo', 'yn_tsuneji'), O = npc('yn.kami', 'yn_oshige');
  t.ok(Y && T && TH && O, 'the four placements exist');
  t.ok(Y && Y.x === 9 && Y.y === 16 && T && T.x === 22 && T.y === 18 && TH && TH.x === 9 && TH.y === 7, 'at their places: Yasuke (9,16), Tsuneji (22,18), his hearth (9,7)');
  t.ok(T && T.leaveTo === 'yn.shimo' && T.leave === 'way', 'Tsuneji still goes only by the Lower House\'s door (QA-120)');
  t.ok([Y, T, TH, O].every((a) => !/comp|party/.test(a.if || '')), 'no placement reads the companion');
  t.ok(TH && TH.if === 'yn_egg_tsuneji&!yn_done' && O && O.if === 'yn_rooms_done&!yn_mio_night|yn_mio_back', 'the hearth and Oshige are as they were');
  const YN = ['departed', 'ch1_done', 'ch2_done', 'mb1_done', 'mb2_done', 'ch3_done', 'ch4_done', 'kr_done', 'ch5_done', 'ko_done', 'cr_called', 'cr_done', 'cr_delivered', 'yn_called', 'yn_kami_seen', 'yn_rooms_done', 'yn_shimo_seen', 'yn_eggs_cooked'];
  const who = ['yasuke', 'tsuneji', 'oshige'];
  const mk = (done, given, quest) => {
    const s = RB.state.newCampaign(); RB.game.s = s;
    for (const k of YN) s.flags[k] = true;
    if (done) s.flags.yn_done = true;
    for (const w of given) s.flags['yn_egg_' + w] = true;
    if (quest === 'active') { s.quests.yn_eggs = { stage: 0, done: false, t: 1 }; s.inv.yn_eggs = 3 - given.length; }
    if (quest === 'done') s.quests.yn_eggs = { stage: 0, done: true, t: 1 };
    s.map = 'yn.upper'; s.x = 10; s.y = 10;
    return s;
  };
  const subsets = [];
  for (let m = 0; m < 8; m++) subsets.push(who.filter((w, i) => m & (1 << i)));
  // 1. placement
  const bad = [];
  for (const done of [false, true]) for (const quest of ['active', 'done', 'none']) for (const given of subsets) {
    if (quest === 'done' && given.length < 3) continue;
    if (quest === 'none' && given.length) continue;
    const s = mk(done, given, quest);
    const owedY = quest === 'active' && !given.includes('yasuke'), owedT = quest === 'active' && !given.includes('tsuneji');
    const want = {
      yasuke: !done || owedY,
      tsuneji: given.includes('tsuneji') ? false : (!done || owedT),
      hearth: given.includes('tsuneji') && !done,
    };
    const got = { yasuke: RB.state.test(s, Y.if), tsuneji: RB.state.test(s, T.if), hearth: RB.state.test(s, TH.if) };
    for (const k in want) if (want[k] !== got[k]) bad.push((done ? 'after' : 'before') + ' the end, quest ' + quest + ', given [' + given + ']: ' + k + ' ' + got[k] + ', want ' + want[k]);
  }
  t.eq(bad, [], 'placements in every state (before and after the end; the quest under way, done, never begun; each set of deliveries)');
  // 2. the guide after the end
  const MAPOF = { yasuke: 'yn.descent:yn_yasuke', tsuneji: 'yn.lower:yn_tsuneji', oshige: 'yn.kami:yn_oshige' };
  const gbad = [];
  for (const given of subsets) {
    const s = mk(true, given, 'active');
    const r = RB.questGuide.analyse('yn_eggs', s);
    const got = r.targets.map((e) => e.map + ':' + e.id).sort();
    const want = who.filter((w) => !given.includes(w)).map((w) => MAPOF[w]).sort();
    if (given.length === 3) { if (got.length) gbad.push('3/3 under way still marks ' + got); continue; }
    if (JSON.stringify(got) !== JSON.stringify(want) || r.how === 'waiting') gbad.push('[' + given + ']: ' + r.how + ' ' + JSON.stringify(got) + ', want ' + JSON.stringify(want));
  }
  t.eq(gbad, [], 'after the end the guide marks exactly the recipients still owed, in each of the 7 states with one owed');
  const sd = mk(true, who, 'done');
  const rd = RB.questGuide.analyse('yn_eggs', sd);
  t.ok(rd.how === 'done' && !rd.targets.length, 'the quest done: nothing marked (' + rd.how + ')');
  // 3. what they say after the end while owed
  t.ok(Y.talk[0] && Y.talk[0].scene === 'yn.egg_yasuke' && Y.talk[0].if === 'quest.yn_eggs=0&item.yn_eggs&!yn_egg_yasuke', 'Yasuke\'s first talk is his egg scene');
  t.ok(T.talk[0] && T.talk[0].scene === 'yn.egg_tsuneji' && T.talk[0].if === 'quest.yn_eggs=0&item.yn_eggs&!yn_egg_tsuneji', 'Tsuneji\'s first talk is his egg scene');
  const gives = [], takes = [];
  for (const [id, sc] of Object.entries(C.scenes)) for (const c of sc.cmds) {
    const a = (c.args || []).join(' ');
    if (c.op === 'give' && /^yn_eggs\b/.test(a)) gives.push(id + ' ' + a);
    if (c.op === 'take' && /^yn_eggs\b/.test(a)) takes.push(id);
  }
  t.eq(gives, ['yn.tama yn_eggs 3'], 'only Tama gives spring eggs, three');
  t.eq(takes.sort(), ['yn.egg_oshige', 'yn.egg_tsuneji', 'yn.egg_yasuke'], 'only the three egg scenes take one, so you hold one while any is owed');
  for (const w of who) {
    const sc = C.scenes['yn.egg_' + w];
    const ops = sc.cmds.filter((c) => !['say', 'faceplayer', 'refresh'].includes(c.op)).map((c) => c.op + ' ' + (c.args || []).join(' '));
    t.eq(ops, ['take yn_eggs', 'set yn_egg_' + w, 'call yn.egg_check'], 'yn.egg_' + w + ': takes the egg, sets its own flag, checks the quest; nothing else');
  }
  // the third egg after the end finishes it (the check, run as the game runs it)
  {
    const s = mk(true, ['tsuneji', 'oshige'], 'active');
    s.flags.yn_egg_yasuke = true;
    const chk = C.scenes['yn.egg_check'].cmds;
    t.ok(chk[0].op === 'if' && RB.state.test(s, (chk[0].args || []).slice(0, -2).join(' ')), 'with all three given, the check takes its "done" branch');
    t.ok(!RB.state.test(s, Y.if) && !RB.state.test(s, T.if), 'and after the end neither man is placed once the quest is done or his egg given');
  }
  // 4. unchanged
  const setsDone = Object.values(C.scenes).filter((sc) => sc.id.startsWith('yn.egg_') && sc.cmds.some((c) => c.op === 'unset' || (c.op === 'set' && /yn_done/.test((c.args || []).join(' ')))));
  t.eq(setsDone.map((sc) => sc.id), [], 'no egg scene touches yn_done');
  const tama = npc('yn.lower', 'yn_tama') || npc('yn.upper', 'yn_tama') || Object.values(C.maps).flatMap((m) => m.npcs || []).find((a) => a.id === 'yn_tama');
  t.ok(tama && tama.talk[0].if === 'yn_done' && tama.talk[0].scene === 'yn.tama_after', 'a quest never begun cannot be begun after the end: Tama\'s talk is then her after-line (a kept limitation)');
};
