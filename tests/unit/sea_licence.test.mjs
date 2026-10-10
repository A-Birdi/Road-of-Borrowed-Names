// A Licence for the Open Sea (expansion P11b; docs/future/work/P11_SEA.md), played through the real scene runner with
// the dialogue stubbed (lines collected, choices picked by the test, language tasks answered right or wrong by the
// test, the naming sheet answered by the test). Synthetic campaigns only. What this covers:
//  - the deal, put off and taken up; Fuku's choice both ways (her husband's boat once its name is back; until then
//    the pilot boat, or waiting for the name);
//  - the yard: the planking found and carted, the sail's order read, the name chosen (or put off), checked on
//    Sōbē's practice board and painted; the trials only once the festival is over; Tetsu's five words, Shiori's tide
//    book, the trial round the mark (sailed, or the crew taking her round); the examination, with every wrong answer
//    asked again at once and a break that keeps what was passed; the boat yours, the licence, Ōmi's rumour;
//  - the names the sign-writers can paint; a trial voyage draws nothing and puts in nowhere else;
//  - none of it in a six-chapter journey, and none of it moves the main story.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state, SL = RB.sail;

  // ---- a minimal stage: the real runner, with dialogue collected, choices picked and tasks answered ----------------
  let lines = [], menus = [], chooser = () => 0, answer = () => true, asked = [], naming = () => null;
  RB.ui.dialogue.say = async (l) => { lines.push({ who: l.who, jp: l.jp || '', en: l.en || '' }); };
  RB.ui.dialogue.choose = async (opts) => { menus.push(opts.map((o) => o.en)); const i = chooser(opts); return i < 0 ? 0 : i; };
  RB.ui.dialogue.hide = () => {};
  RB.ui.toast = async () => {};
  for (const k of ['ensureSpeaker', 'dismissExtras', 'refreshActors']) RB.world[k] = () => {};
  RB.world.whenArrived = async () => {};
  RB.game.afterScene = () => {};
  RB.ui.fade = async () => {};
  RB.save.autosave = async () => {};
  const warps = [];
  RB.game.transition = async (map, x, y) => { warps.push([map, x, y]); };
  RB.challenge.run = async (id) => { asked.push(id); return { ok: answer(id) }; };
  RB.ui.sail = Object.assign(RB.ui.sail || {}, { nameBoat: async (s, o) => naming(o) });
  const pickEn = (...words) => (opts) => { for (const w of words) { const i = opts.findIndex((o) => (o.en || '').indexOf(w) >= 0); if (i >= 0) return i; } return 0; };
  const fresh = (o = {}) => {
    const s = S.newCampaign({ edition: o.edition || 2 });
    s.id = 'sea-licence'; s.map = 'sg.harbor'; s.comp = o.comp === undefined ? 'mio' : o.comp;
    s.player.name = 'Haru'; s.player.nameJp = 'ハル';
    Object.assign(s.flags, { departed: true, ch1_done: true, ch2_done: true, mb_arrived: true }, o.flags || {});
    s.quests.sg_main = { stage: 0, done: true };
    for (const k in o.quests || {}) s.quests[k] = o.quests[k];
    Object.assign(s.inv, o.inv || {});
    s.vars = Object.assign({}, o.vars || {});
    RB.game.G.s = s;
    return s;
  };
  const run = async (id, o = {}) => { lines = []; menus = []; asked = []; chooser = o.pick || (() => 0); answer = o.answer || (() => true); await RB.script.run(id); return lines; };
  const has = (re) => lines.some((l) => re.test(l.en) || re.test(l.jp));
  const qs = (s, id) => (s.quests[id] ? (s.quests[id].done ? 'done' : s.quests[id].stage) : null);
  const npc = (map, id) => (C.maps[map].npcs || []).find((n) => n.id === id);
  const talkTo = (s, map, id) => { const n = npc(map, id); const tk = typeof n.talk === 'string' ? [{ scene: n.talk }] : n.talk; const e = tk.find((x) => !x.if || S.test(s, x.if)); return e && e.scene; };
  const scenes = Object.keys(C.scenes).filter((id) => /^sea\.(omi_|fuku_|kajiro_|take_|nui_|sobe_|yard_|tetsu_|shiori_|trial_|arrive_)/.test(id));

  // ---- the frame ---------------------------------------------------------------------------------------------------
  const Q = C.quests.sea_licence;
  t.ok(Q && Q.chapter === 'sea' && !Q.main && Q.stages.length === 8, 'A Licence for the Open Sea: eight stages, not the main story');
  t.eq((C.scriptErrors || []).filter((e) => /sea\./.test(e)), [], 'the licence\'s scenes parse');
  t.ok(scenes.length >= 25 && scenes.every((id) => C.scenes[id].cmds.every((c) => !(c.op === 'quest' && /_main$/.test(c.args[0])) && !(c.op === 'set' && /^ch\d_done|_done$/.test(c.args[0]) && !/^sea_/.test(c.args[0])))), 'no licence scene moves a main story or ends a chapter (' + scenes.length + ' scenes)');
  t.ok(['sea.yard_timber', 'sea.nui_sail', 'sea.sign_board', 'sea.words_boat', 'sea.words_wind', 'sea.tide_book', 'sea.licence_form', 'sea.interview_1', 'sea.interview_2', 'sea.interview_3'].every((id) => C.challenges[id] && ['F', 'E', 'I', 'A'].every((p) => (C.challenges[id].tiers[p] || []).length)), 'ten tasks, each at the four profiles');
  const yard = C.maps['mb.pier'].structs.find((s) => s.x === 31 && s.y === 5);
  t.ok(yard && yard.to === 'mb.yard' && yard.locked && yard.unlock === 'ed>=2', 'the shut house by the ferry pier is the yard in twelve-chapter journeys, still shut in six');
  t.ok(C.maps['mb.yard'] && C.maps['mb.yard'].edition === 2 && npc('mb.yard', 'sea_kajiro') && npc('mb.yard', 'sea_nui'), 'the yard: Kajirō and Nui');

  // ---- the names the sign-writers can paint ----------------------------------------------------------------------------
  const ok = (k) => !SL.nameProblem(k);
  t.ok(ok('ちどり') && ok('かもめ') && ok('きゃく') && ok('あ') && ok('はやぶさ'), 'ordinary names paint: ちどり, かもめ, きゃく, あ, はやぶさ');
  t.ok(!ok('') && !ok('あいうえおか') && !ok('カモメ') && !ok('んま') && !ok('ゃあ') && !ok('かゃ') && !ok('まっ') && !ok('っと'), 'not: empty, six kana, katakana, ん or a small kana first, a small ゃ after a kana not ending in i, a small っ last');
  t.ok(/i \(き/.test(SL.nameProblem('かゃ').en) && SL.nameProblem('').jp, 'each refusal says why, in both languages');

  // ---- 0 · the deal ------------------------------------------------------------------------------------------------
  {
    const s = fresh({ edition: 1 });
    t.ok(!/^sea\./.test(talkTo(s, 'sg.office', 'omi') || '') && !/^sea\./.test(talkTo(s, 'sg.harbor', 'fuku') || ''), 'a six-chapter journey: no deal, no boat');
  }
  const s = fresh();
  t.eq(talkTo(s, 'sg.office', 'omi'), 'sea.omi_deal', 'after Chapter 2, Ōmi has a proposition');
  await run('sea.omi_deal', { pick: pickEn('think it over') });
  t.ok(qs(s, 'sea_licence') === null && has(/carry the coast's post/), 'the deal, put off: nothing begins');
  t.eq(talkTo(s, 'sg.office', 'omi'), 'sea.omi_deal_again', 'she asks again');
  await run('sea.omi_deal_again', { pick: pickEn('take it on') });
  t.ok(qs(s, 'sea_licence') === 0 && has(/gone from the harbour's books/) && !has(/Chidori-maru/), 'taken up; the boat\'s name is lost while Fuku\'s nameplate is still to make');

  // ---- Fuku's choice ------------------------------------------------------------------------------------------------
  t.eq(talkTo(s, 'sg.harbor', 'fuku'), 'sea.fuku_hull', 'Fuku, about her husband\'s boat');
  await run('sea.fuku_hull', { pick: pickEn('wait until') });
  t.ok(qs(s, 'sea_licence') === 0 && !s.vars.sea_hull && has(/nameplate/), 'she can\'t hand over a boat whose name she has lost; waiting for the name is a choice');
  await run('sea.fuku_hull', { pick: pickEn('pilot boat') });
  t.ok(qs(s, 'sea_licence') === 1 && s.vars.sea_hull === 'pilot' && has(/in tow/), 'or the harbour\'s pilot boat, towed to Manybridge');
  {
    const s2 = fresh({ quests: { sg_seaglass: { stage: 3, done: true }, sea_licence: { stage: 0, done: false } } });
    t.eq(talkTo(s2, 'sg.harbor', 'fuku'), 'sea.fuku_hull', 'with the nameplate given');
    await run('sea.fuku_hull');
    t.ok(qs(s2, 'sea_licence') === 1 && s2.vars.sea_hull === 'chidori' && has(/name her as you like/), 'Fuku gives the Chidori-maru gladly, to be named as you like');
  }
  RB.game.G.s = s;

  // ---- 1–3 · the yard ---------------------------------------------------------------------------------------------
  t.eq(talkTo(s, 'mb.yard', 'sea_kajiro'), 'sea.kajiro_first', 'Kajirō looks the hull over');
  await run('sea.kajiro_first');
  t.ok(qs(s, 'sea_licence') === 2 && has(/Six planks/), 'six planks rotten, the sail to sew');
  t.eq(talkTo(s, 'mb.yard', 'sea_kajiro'), 'sea.kajiro_timber', 'the planking\'s delivery note');
  await run('sea.kajiro_timber', { answer: () => false });
  t.ok(!s.inv.sea_timber_note && asked[0] === 'sea.yard_timber', 'a wrong reading costs nothing');
  await run('sea.kajiro_timber');
  t.ok(s.inv.sea_timber_note === 1 && talkTo(s, 'mb.yard', 'sea_kajiro') === 'sea.kajiro_take' && talkTo(s, 'mb.pier', 'mb_take') === 'sea.take_timber', 'the note goes to Take on the pier');
  await run('sea.take_timber');
  t.ok(s.flags.sea_f_timber && !s.inv.sea_timber_note && has(/Number three/), 'Take carts it from warehouse three');
  t.eq(talkTo(s, 'mb.yard', 'sea_kajiro'), 'sea.kajiro_nui', 'Kajirō waits on the sail');
  t.eq(talkTo(s, 'mb.yard', 'sea_nui'), 'sea.nui_sail', 'Nui can\'t read his order');
  await run('sea.nui_sail');
  t.ok(s.flags.sea_f_sail && asked[0] === 'sea.nui_sail', 'the measurements read out');
  t.eq(talkTo(s, 'mb.yard', 'sea_kajiro'), 'sea.kajiro_name', 'now the name');
  naming = () => null;
  await run('sea.kajiro_name');
  t.ok(qs(s, 'sea_licence') === 2 && !s.flags.sea_named && has(/A name's for life/), 'the naming put off: nothing lost');
  let offered = null;
  naming = (o) => { offered = o; return 'かもめ'; };
  t.eq(talkTo(s, 'mb.yard', 'sea_kajiro'), 'sea.kajiro_name', 'asked again');
  await run('sea.kajiro_name');
  t.ok(qs(s, 'sea_licence') === 3 && s.flags.sea_named && s.sea.boat.name === 'かもめ' && offered && !offered.keep && SL.boatName(s).en === 'Kamome-maru', 'named かもめ (the pilot boat had no name to keep): the Kamome-maru');
  t.ok(has(/way to Blockprint Row is shut/), 'Blockprint Row waits for the Exchange\'s trouble to be settled');
  t.eq(talkTo(s, 'mb.yard', 'sea_kajiro'), 'sea.kajiro_sobe', 'Sōbē\'s shop paints the names');
  s.flags.mb1_done = true;
  t.eq(talkTo(s, 'mp.workshop', 'mp_sobe'), 'sea.sobe_sign', 'Sōbē checks the letters first');
  await run('sea.sobe_sign', { answer: () => false });
  t.ok(!s.flags.sea_sign_ok, 'the slip not found: look again, nothing lost');
  await run('sea.sobe_sign');
  t.ok(s.flags.sea_sign_ok && asked[0] === 'sea.sign_board' && has(/One stroke wrong/), 'the practice board\'s slip found');
  t.eq(talkTo(s, 'mb.yard', 'sea_kajiro'), 'sea.kajiro_paint', 'painted at the yard');
  await run('sea.kajiro_paint');
  t.ok(qs(s, 'sea_licence') === 4 && has(/Miyo|mine/) && has(/until the festival's over/), 'Sanpei paints, Miyo the last letter; the trials wait for the festival');
  t.ok(!/^sea\./.test(talkTo(s, 'sg.harbor', 'tetsu') || ''), 'Tetsu runs the ferry while the festival lasts');
  {
    const s3 = fresh({ quests: { sea_licence: { stage: 2, done: false } }, flags: { sea_f_timber: true, sea_f_sail: true }, vars: { sea_hull: 'chidori' } });
    naming = (o) => { offered = o; return o.keep; };
    await run('sea.kajiro_name');
    t.ok(offered.keep === 'ちどり' && s3.vars.sea_kept === 1 && s3.sea.boat.name === 'ちどり' && has(/Fuku will be pleased/), 'the Chidori-maru\'s old name can be kept');
    RB.game.G.s = s;
  }

  // ---- 4 · sea trials -----------------------------------------------------------------------------------------------
  s.flags.mb2_done = true;
  t.eq(talkTo(s, 'sg.harbor', 'tetsu'), 'sea.tetsu_words', 'after the festival: Tetsu\'s sea words');
  await run('sea.tetsu_words', { pick: pickEn('the ferry'), answer: () => true });
  t.ok(!s.flags.sea_words && menus.length >= 2, 'the ferry is still his to run: asking for it leaves the lesson for later');
  await run('sea.tetsu_words', { pick: pickEn('sea trials'), answer: (id) => id !== 'sea.words_wind' });
  t.ok(!s.flags.sea_words && s.vars.sea_w === 1 && asked.join() === 'sea.words_boat,sea.words_wind', 'sail, rudder, anchor learned; the tide and the wind to come');
  await run('sea.tetsu_words', { pick: pickEn('sea trials') });
  t.ok(s.flags.sea_words && asked.join() === 'sea.words_wind', 'asked again, only what was left');
  t.eq(talkTo(s, 'sg.tidehut', 'shiori'), 'sea.shiori_tide', 'Shiori\'s tide book');
  await run('sea.shiori_tide');
  t.ok(s.flags.sea_tide && asked[0] === 'sea.tide_book', 'high tide read from the table');
  t.eq(talkTo(s, 'sg.harbor', 'tetsu'), 'sea.tetsu_trial', 'the trial');
  warps.length = 0;
  await run('sea.tetsu_trial', { pick: pickEn('high') });
  const v = s.sea.voyage;
  t.ok(v && v.from === 'saltglass' && v.to === 'saltglass' && v.mode === 'self' && v.wind === 'left' && v.sits.length === 0 && s.vars.sea_trial === 1, 'out round the mark: a west wind, nothing drawn');
  t.ok(warps.length === 1 && warps[0][0] === C.seaMap, 'onto the sea, at Saltglass\'s water');
  const trig = C.maps[C.seaMap].triggers.find((x) => x.scene === 'sea.trial_mark');
  t.ok(trig && (C.maps[C.seaMap].props || []).some((p) => p.p === 'sea_buoy' && p.x >= trig.x && p.x < trig.x + trig.w && p.y >= trig.y && p.y < trig.y + trig.h), 'the buoy lies inside the water that rounds it');
  await run('sea.trial_mark');
  t.ok(s.vars.sea_trial === 2 && v.sights.indexOf('the mark off the point') >= 0, 'rounded, and in the log');
  lines = [];
  await SL.arrive(s, 'saltglass');
  t.ok(qs(s, 'sea_licence') === 5 && s.flags.sea_trial_done && !s.vars.sea_trial && s.sea.log.length === 1 && /Not bad/.test(lines.map((l) => l.en).join(' ')), 'back in: Tetsu\'s verdict, the examination next, the trial in the travel log');
  {
    const s4 = fresh({ quests: { sea_licence: { stage: 4, done: false } }, flags: { mb2_done: true, sea_words: true, sea_tide: true } });
    await run('sea.tetsu_trial', { pick: pickEn('high') });
    lines = [];
    await SL.crew(s4);
    t.ok(qs(s4, 'sea_licence') === 5 && /rounded the buoy/.test(lines.map((l) => l.en).join(' ')), 'let the crew sail the trial: they take her round the mark');
    RB.game.G.s = s;
  }

  // ---- 5 · the licence ----------------------------------------------------------------------------------------------
  t.eq(talkTo(s, 'sg.office', 'omi'), 'sea.omi_licence', 'Ōmi\'s examination');
  await run('sea.omi_licence', { answer: () => false, pick: pickEn('take a break') });
  t.ok(qs(s, 'sea_licence') === 5 && asked.join() === 'sea.licence_form' && has(/carry on another time/), 'the form wrong: a break, nothing lost');
  let k = 0;
  await run('sea.omi_licence', { answer: (id) => !(id === 'sea.interview_2' && k++ === 0), pick: pickEn('Yes') });
  t.eq(asked, ['sea.licence_form', 'sea.interview_1', 'sea.interview_2', 'sea.interview_2', 'sea.interview_3'], 'the form, then three questions; the one answered wrong is asked again at once');
  t.ok(qs(s, 'sea_licence') === 6 && s.flags.sea_boat && s.sea.boat.hull === 'pilot' && s.sea.boat.name === 'かもめ' && s.inv.sea_licence_doc === 1, 'the boat is yours, with the licence');
  t.ok(s.flags.sea_rumour_omi && has(/island out west/) && !has(/Kotonoha/), 'Ōmi\'s version of the rumour: lost post washing up on an island in no ledger');
  s.visited = Object.assign(s.visited || {}, { 'mb.pier': true });
  t.ok(SL.destinations(s, 'saltglass').indexOf('manybridge') >= 0, 'and the chart offers Manybridge, where you have been');
  {
    const s5 = fresh({ quests: { sea_licence: { stage: 5, done: false }, sg_seaglass: { stage: 3, done: true } }, flags: { ko_arrived: true }, vars: { sea_hull: 'chidori', sea_exam: 1, sea_exam_form: 1 } });
    s5.sea = { boat: { name: 'ちどり' } };
    await run('sea.omi_licence');
    t.ok(s5.sea.boat.hull === 'chidori' && asked[0] === 'sea.interview_1' && has(/already been to Kotonoha/), 'a break keeps the form passed; someone who has been to the island by ferry hears that instead');
    t.eq(talkTo(s5, 'sg.harbor', 'fuku'), 'sea.fuku_sails', 'Fuku sees her husband\'s boat at the quay');
    s5.vars.sea_kept = 1;
    await run('sea.fuku_sails');
    t.ok(has(/You kept her name/), 'and is glad the name was kept');
    RB.game.G.s = s;
  }
  t.ok(!s.flags.ch3_done && !s.quests.ko_main, 'none of it moved the main story');
};
