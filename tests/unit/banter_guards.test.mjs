// Late revisits and the banters that look ahead (Agnes 6558574216, 6558734019, 6558899693; Local CL-615, CL-616, CL-617;
// Cloud CC-452, CC-454). Eight banter offers gain a guard; no line, scene or key changes:
//  - Saltglass: Nao's and Suzu's "Cinder Orchard next" (sg.b_nao_after, sg.b_suzu_after) from the boss until you arrive
//    in Cinder Orchard, and in a twelve-chapter journey only once Manybridge is behind you (mb2_done); Nao's house talk
//    (sg.b_nao_isamu) only before the chapter's end, which tells the house;
//  - Cinder Orchard: Nao's and Ren's fifth (co.b_nao5, co.b_ren5) until you arrive in Snowbell; Mio's and Suzu's as before;
//  - Snowbell: Nao's and Suzu's fifth (sb.bn_nao5, sb.bn_suzu5) until you arrive in Lanternfall; Nao's bench
//    (sb.bn_nao4) until Akari is met.
// On the real runner, the screen stood in for, talking to the companion the game's own way (RB.game.companionTalk),
// every other banter there already heard, so the one asked about comes first whenever it is offered:
//  1. each offer's condition as agreed;
//  2. Saltglass, editions absent, 1 and 2: before the boss; after it; in the twelve before and after mb2_done; arrived in
//     Cinder Orchard, with mb2_done too; after the story; Suzu's the same; the house talk before and after the chapter's
//     end, and never with the house visited;
//  3. Cinder Orchard: Nao's and Ren's fifth before and after arriving in Snowbell, and after the story; Mio's and Suzu's
//     still offered after;
//  4. Snowbell, both editions: Nao's and Suzu's fifth before and after arriving in Lanternfall; the bench unseen, seen,
//     seen with Lanternfall arrived but Akari not met, Akari introduced, her quest done, after the story;
//  5. every other banter's registration as before, and these eight scenes' lines and keys as before (fingerprints of
//     both before this change);
//  6. a save's round trip keeps each answer;
//  every talk went to the banter list (after the story, its ending conversation already had); no scene ended on an
//  error from the runner.
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

  // the runner, with the screen stood in for (as tests/unit/nao_banter.test.mjs); every scene started recorded
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

  // before this change (computed on its parent): the other registrations, and these eight scenes' lines and keys
  const OTHERS_N = 99, OTHERS_FP = '976ebcbab2bdb628', LINES_FP = '19c6e12951cf0b65';
  const AGREED = {
    'sg.b_nao_after': 'sg_boss_done&!co_arrived&!ed>=2|sg_boss_done&!co_arrived&mb2_done',
    'sg.b_suzu_after': 'sg_boss_done&!co_arrived&!ed>=2|sg_boss_done&!co_arrived&mb2_done',
    'sg.b_nao_isamu': '!sg_nao_isamu&!ch2_done&quest.sg_main>=1',
    'co.b_nao5': 'ch3_done&!sb_arrived',
    'co.b_ren5': 'ch3_done&!sb_arrived',
    'sb.bn_nao5': 'sb_lamp_lit&!lf_arrived',
    'sb.bn_suzu5': 'sb_lamp_lit&!lf_arrived',
    'sb.bn_nao4': 'seen.sb.path_bench&!quest.lf_akari',
  };
  const STORY = ['departed', 'ch1_done', 'sg_boss_done', 'ch2_done', 'mb1_done', 'mb2_done', 'co_arrived', 'ch3_done', 'sb_arrived', 'sb_lamp_lit', 'ch4_done', 'kr_done', 'lf_arrived', 'ch5_done', 'ko_done', 'cr_done', 'yn_done', 'ch6_done', 'postgame'];
  // a journey with `comp` on `map`, edition `ed` (null: a save with none), flags, seen and quests as given
  const journey = (comp, map, ed, o = {}) => {
    const s = S.newCampaign(ed == null ? {} : { edition: ed });
    if (ed == null) delete s.edition;
    s.comp = comp; s.map = map; s.x = 10; s.y = 10;
    s.flags.departed = true;
    for (const f of o.flags || []) s.flags[f] = true;
    for (const k of o.seen || []) s.seen[k] = true;
    for (const [q, v] of Object.entries(o.quests || {})) S.setQuest(s, q, v);
    // after the story, its ending conversation already had (src/content/pages/10_pages.js needRetro), as a finished
    // journey has, so the Pages' waiting talks don't take the companion's talk
    if (s.flags.postgame) RB.company.memory(s, { id: 'ending:' + comp, kind: 'reflections', title: { jp: '{橋|はし}', en: 'x' }, pq: true, comp });
    // every other banter of this companion already heard, so the one asked about is picked whenever it is offered
    for (const b of C.banter) if (b.comp === comp && b.scene !== o.ask) s.seen[b.scene] = true;
    RB.game.G.s = s; RB.game.s = s;
    return s;
  };
  const taken = []; // talks that went anywhere but the banter list (a waiting conversation): there should be none
  const banterScenes = new Set(C.banter.map((b) => b.scene));
  const picked = async () => { runs = []; RB.game.companionTalk(); await settle(); if (runs[0] && !banterScenes.has(runs[0])) taken.push(runs[0]); return runs[0] || null; };
  const offered = async (comp, map, ed, ask, o = {}) => { journey(comp, map, ed, Object.assign({ ask }, o)); return (await picked()) === ask; };

  // 1. each offer's condition
  const reg = Object.keys(AGREED).map((sc) => C.banter.filter((b) => b.scene === sc));
  t.ok(reg.every((r) => r.length === 1) && Object.keys(AGREED).every((sc, i) => reg[i][0].if === AGREED[sc]), '1 the eight offers, one each, with the agreed conditions ' + flat(reg.map((r) => r.map((b) => b.if))));

  // 2. Saltglass
  for (const [comp, ask] of [['nao', 'sg.b_nao_after'], ['suzu', 'sg.b_suzu_after']]) {
    const row = [];
    for (const [ed, flags, want, what] of [
      [null, [], false, 'no edition, before the boss'],
      [null, ['sg_boss_done'], true, 'no edition, after the boss'],
      [1, ['sg_boss_done'], true, 'six chapters, after the boss'],
      [1, ['sg_boss_done', 'ch2_done'], true, 'six chapters, the chapter ended, not yet arrived'],
      [2, ['sg_boss_done'], false, 'twelve chapters, after the boss, Manybridge ahead'],
      [2, ['sg_boss_done', 'ch2_done', 'mb1_done'], false, 'twelve chapters, Manybridge half done'],
      [2, ['sg_boss_done', 'ch2_done', 'mb1_done', 'mb2_done'], true, 'twelve chapters, Manybridge behind you'],
      [1, ['sg_boss_done', 'ch2_done', 'co_arrived'], false, 'six chapters, arrived in Cinder Orchard'],
      [2, ['sg_boss_done', 'ch2_done', 'mb1_done', 'mb2_done', 'co_arrived'], false, 'twelve chapters, mb2_done and arrived'],
      [2, STORY, false, 'after the story'],
    ]) row.push([what, (await offered(comp, 'sg.harbor', ed, ask, { flags })) === want]);
    t.ok(row.every((x) => x[1]), '2 ' + ask + ': offered only from the boss until Cinder Orchard, and in the twelve only after mb2_done ' + flat(row.filter((x) => !x[1])));
  }
  {
    const row = [];
    for (const [flags, quests, want, what] of [
      [[], { sg_main: 1 }, true, 'the harbour, the quest begun, the house not visited'],
      [['ch2_done'], { sg_main: 1 }, false, 'after the chapter\'s end'],
      [['sg_nao_isamu'], { sg_main: 1 }, false, 'the house visited'],
      [[], {}, false, 'the quest not begun'],
    ]) row.push([what, (await offered('nao', 'sg.harbor', 2, 'sg.b_nao_isamu', { flags, quests })) === want]);
    t.ok(row.every((x) => x[1]), '2 sg.b_nao_isamu: only before the chapter\'s end, never with the house visited ' + flat(row.filter((x) => !x[1])));
  }

  // 3. Cinder Orchard: Nao's and Ren's fifth guarded, Mio's and Suzu's as before
  for (const [comp, ask, guarded] of [['nao', 'co.b_nao5', true], ['ren', 'co.b_ren5', true], ['mio', 'co.b_mio5', false], ['suzu', 'co.b_suzu5', false]]) {
    const row = [];
    for (const [ed, flags, wantGuarded, wantBefore, what] of [
      [1, ['co_arrived', 'ch3_done'], true, true, 'six chapters, the chapter ended'],
      [2, ['co_arrived', 'ch3_done'], true, true, 'twelve chapters, the chapter ended'],
      [1, ['co_arrived'], false, false, 'before the chapter\'s end'],
      [2, ['co_arrived', 'ch3_done', 'sb_arrived'], false, true, 'arrived in Snowbell'],
      [2, STORY, false, true, 'after the story'],
    ]) row.push([what, (await offered(comp, 'co.village', ed, ask, { flags })) === (guarded ? wantGuarded : wantBefore)]);
    t.ok(row.every((x) => x[1]), '3 ' + ask + ': ' + (guarded ? 'offered after the chapter until Snowbell' : 'as before, after the chapter, Snowbell or not') + ' ' + flat(row.filter((x) => !x[1])));
  }

  // 4. Snowbell
  for (const [comp, ask] of [['nao', 'sb.bn_nao5'], ['suzu', 'sb.bn_suzu5']]) {
    const row = [];
    for (const ed of [1, 2]) {
      for (const [flags, want, what] of [
        [['sb_arrived'], false, 'before the lamp'],
        [['sb_arrived', 'sb_lamp_lit'], true, 'the lamp lit'],
        [['sb_arrived', 'sb_lamp_lit', 'ch4_done'], true, 'the chapter ended'],
        [['sb_arrived', 'sb_lamp_lit', 'ch4_done', 'kr_done'], true, 'the Keepers\' Road behind (twelve) or not'],
        [['sb_arrived', 'sb_lamp_lit', 'ch4_done', 'lf_arrived'], false, 'arrived in Lanternfall'],
        [STORY, false, 'after the story'],
      ]) row.push([ed + ' ' + what, (await offered(comp, 'sb.road', ed, ask, { flags })) === want]);
    }
    t.ok(row.every((x) => x[1]), '4 ' + ask + ': offered after the lamp until Lanternfall, in both editions ' + flat(row.filter((x) => !x[1])));
  }
  {
    const row = [];
    for (const [flags, seen, quests, want, what] of [
      [['sb_arrived'], [], {}, false, 'the bench unseen'],
      [['sb_arrived'], ['sb.path_bench'], {}, true, 'the bench seen'],
      [['sb_arrived', 'sb_lamp_lit', 'ch4_done', 'lf_arrived'], ['sb.path_bench'], {}, true, 'Lanternfall arrived, Akari not met'],
      [['sb_arrived', 'sb_lamp_lit', 'ch4_done', 'lf_arrived'], ['sb.path_bench'], { lf_akari: 0 }, false, 'Akari introduced'],
      [['sb_arrived', 'sb_lamp_lit', 'ch4_done', 'lf_arrived'], ['sb.path_bench'], { lf_akari: 'done' }, false, 'her quest done'],
      [STORY, ['sb.path_bench'], { lf_akari: 'done' }, false, 'after the story'],
    ]) row.push([what, (await offered('nao', 'sb.road', 2, 'sb.bn_nao4', { flags, seen, quests })) === want]);
    t.ok(row.every((x) => x[1]), '4 sb.bn_nao4: after the bench, until Akari is met ' + flat(row.filter((x) => !x[1])));
  }

  // 5. every other registration, and these scenes' lines and keys
  const others = C.banter.filter((b) => !AGREED[b.scene]).map((b) => [b.comp, b.map || null, b.if || null, b.scene]);
  const lines = Object.keys(AGREED).sort().map((sc) => C.scenes[sc].cmds.filter((c) => c.op === 'say').map((c) => [c.who || null, c.expr || null, keyOf(sc, c.jp), c.en, c.if || null]));
  t.ok(others.length === OTHERS_N && fp(others) === OTHERS_FP && fp(lines) === LINES_FP, '5 every other banter\'s registration, and these eight scenes\' lines and keys, as before ' + flat({ n: others.length, others: fp(others), lines: fp(lines) }));

  // 6. a save's round trip
  {
    const row = [];
    for (const [comp, map, ed, ask, flags, want] of [
      ['nao', 'sg.harbor', 2, 'sg.b_nao_after', ['sg_boss_done', 'ch2_done', 'mb1_done', 'mb2_done'], true],
      ['nao', 'sg.harbor', 2, 'sg.b_nao_after', ['sg_boss_done'], false],
      ['ren', 'co.village', 2, 'co.b_ren5', ['co_arrived', 'ch3_done', 'sb_arrived'], false],
      ['suzu', 'sb.road', 1, 'sb.bn_suzu5', ['sb_arrived', 'sb_lamp_lit'], true],
    ]) {
      const s = journey(comp, map, ed, { ask, flags });
      const st = RB.save.migrate(JSON.parse(JSON.stringify(s)));
      RB.game.G.s = st; RB.game.s = st;
      row.push([ask + ' ' + flags.join('+'), ((await picked()) === ask) === want]);
    }
    t.ok(row.every((x) => x[1]), '6 a save\'s round trip keeps each answer ' + flat(row.filter((x) => !x[1])));
  }

  t.ok(!taken.length, 'every talk went to the banter list: no waiting conversation took one ' + flat(taken.slice(0, 3)));
  t.ok(!errors.length, 'no scene ended on an error from the runner ' + errors.slice(0, 3).join(' | '));
  console.error = cerr;
};
