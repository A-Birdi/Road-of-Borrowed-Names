// The Hall of a Hundred Tales and its first wing, The Lamp at the Crossroads (expansion P15; plan 04_DUNGEONS.md D9;
// docs/future/work/P15_POSTGAME.md), with synthetic campaigns only, the scenes played through the real scene runner
// with the dialogue stubbed (lines collected, choices picked by the test, language tasks answered by the test). What
// this covers:
//  - the manifest: the wing's ten deliberate trials (ids unique, every kind the plan asks for, three floors), each
//    with a scene that sets its floor's flag and tells the Hall;
//  - the way in: Tsuru's key ledger after the story (twelve-chapter journeys with the Keepers' Road done), the
//    Shuttered Hall's door opening with it, the foyer's ten alcoves;
//  - the rules (src/engine/98h_hall.js): the three choices (the profile always the campaign's; Consolidate or Grow;
//    the tactical setting, in force only inside the wing); a floor counted once every trial on it is done, then kept;
//    defeat restarting the current floor only; the retreat; the reprieve holding a floor exactly; walking a finished
//    tale again changing no record; the variation fixed per journey; the honest note (route, tactics, help used);
//    the suspend point (one per slot, replaced, removed with the slot);
//  - every trial end to end in both patterns, right and wrong (nothing escalates; a wrong answer leaves the trial
//    open), the encounters' ends, Grow lifting a task one level as stretch, the tale's end and its stamp;
//  - reachability: every floor walked from its entry with the rope up and with it down.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state, H = RB.hall, X = RB.expedition;

  // ---- a minimal stage ----------------------------------------------------------------------------------------------
  let lines = [], menus = [], chooser = () => 0, answer = () => true, asked = [], encs = [], encRes = () => ({ result: 'win', outcome: null }), warps = [];
  RB.ui.dialogue.say = async (l) => { lines.push({ who: l.who, jp: l.jp || '', en: l.en || '' }); };
  RB.ui.dialogue.choose = async (opts) => { menus.push(opts.map((o) => o.en)); const i = chooser(opts); return i < 0 ? 0 : i; };
  RB.ui.dialogue.hide = () => {};
  RB.ui.toast = async () => {};
  RB.ui.notice = () => {};
  RB.ui.confirm = async (q, opts) => opts.length - 1; // (the sheets' last answer: stay)
  RB.ui.shake = () => {};
  RB.ui.fade = async () => {};
  for (const k of ['ensureSpeaker', 'dismissExtras', 'refreshActors']) RB.world[k] = () => {};
  RB.world.whenArrived = async () => {};
  RB.world.emote = () => {};
  RB.game.afterScene = () => {};
  RB.world.W = RB.world.W || {};
  RB.game.transition = async (map, x, y) => { warps.push(map); RB.game.G.s.map = map; RB.world.W.map = { id: map }; RB.bus.emit('map:enter', { id: map }); };
  RB.game.rest = async () => {};
  RB.game.inBattle = () => false;
  RB.game.startEncounter = async (id) => { encs.push(id); return encRes(id); };
  RB.save.autosave = async () => {};
  let lastCtx = null;
  RB.challenge.run = async (id, ctx) => { asked.push(id); lastCtx = ctx || null; return { ok: answer(id) }; };
  if (RB.lessons) RB.lessons.grammarCard = async () => {};
  const fresh = (o = {}) => {
    const s = S.newCampaign({ edition: o.edition == null ? 2 : o.edition });
    s.id = o.id || 'hall-test'; s.map = o.map || 'hall.foyer'; s.comp = o.comp === undefined ? 'ren' : o.comp;
    s.player.name = 'Haru'; s.player.nameJp = 'ハル';
    s.learn.profile = o.profile || 'E';
    Object.assign(s.flags, { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_done: true, cr_done: true, yn_done: true, postgame: true, ch6_done: true, hall_ledger: true });
    for (const f of o.flags || []) s.flags[f] = true;
    s.vars = Object.assign({}, o.vars || {});
    RB.game.G.s = s;
    RB.world.W.map = { id: s.map };
    return s;
  };
  const run = async (id, o = {}) => { lines = []; menus = []; asked = []; encs = []; chooser = o.pick || (() => 0); answer = o.answer || (() => true); if (o.enc) encRes = o.enc; await RB.script.run(id); return lines; };
  const has = (re) => lines.some((l) => re.test(l.en) || re.test(l.jp));
  const test = (s, cond) => S.test(s, cond);
  const cmds = (id) => (C.scenes[id] ? C.scenes[id].cmds : []);
  const ops = (id) => cmds(id).map((c) => c.op + ':' + (c.args || []).join(' '));
  const enterW1 = async (s, o = {}) => { if (o.pat != null) H.wrec(s, 'w1').pat = o.pat; if (o.route || o.tactics) H.setChoice(s, 'w1', o); RB.hooks.hall_card = async () => { s.vars._res = o.held ? 2 : 1; }; await run('hall.door_w1'); return H.visitOf(s); };

  // ---- the manifest ---------------------------------------------------------------------------------------------------
  const w1 = H.get('w1');
  const man = H.manifest().filter((x) => x.wing === 'w1');
  t.eq(man.length, 10, 'wing 1 has ten trials');
  t.eq(new Set(man.map((x) => x.id)).size, 10, 'their ids are unique');
  t.ok(['story', 'counterexample', 'infogap', 'riddle', 'encounter', 'social', 'capstone', 'mechanism'].every((k) => man.some((x) => x.kind === k)), 'every kind of trial the plan asks for: a story room, a counterexample hall, an information gap, a riddle, two encounters (conditions and social), mechanisms and a capstone');
  t.ok([0, 1, 2].every((k) => man.filter((x) => x.floor === k).length >= 3) && w1.floors.length === 3, 'three floors, each with at least three trials');
  t.ok(man.filter((x) => x.reprieve).length === 1 && man.find((x) => x.reprieve).kind === 'riddle', 'the riddle earns the wing\'s reprieve');
  const allOps = Object.keys(C.scenes).filter((id) => id.startsWith('hall.w1.')).flatMap((id) => ops(id));
  for (const x of man) {
    const k = man.find((y) => y.trial === x.trial).floor;
    t.ok(allOps.includes('hook:hall_trial w1 ' + x.trial) && allOps.some((o) => o.startsWith('set:') && o.split(' ').concat(o.slice(4).split(' ')).includes('xp_hall_w1_f' + k + '_' + x.trial)), x.id + ': a scene sets its floor\'s flag and tells the Hall');
  }
  t.ok(X.get('hall_w1') && X.get('hall_w1').kind === 'hall' && X.get('hall_w1').rules.restart === 'floor' && X.get('hall_w1').rules.persistent, 'the wing is an expedition of kind hall: persistent condition, the floor restarted on defeat');
  t.ok(['hall.foyer', 'hall.w1f1', 'hall.w1f2', 'hall.w1f3'].every((id) => C.maps[id] && C.maps[id].edition === 2), 'the foyer and the three floors belong to the twelve-chapter edition');
  t.eq((C.scriptErrors || []).filter((e) => /hall/.test(e)), [], 'the Hall\'s scenes parse');

  // ---- the way in --------------------------------------------------------------------------------------------------------
  {
    const s = fresh({ comp: 'nao' });
    delete s.flags.hall_ledger;
    const tsuru = C.maps['rw.hall'].npcs.find((n) => n.id === 'tsuru');
    const first = (st) => tsuru.talk.find((x) => !x.if || test(st, x.if)).scene;
    s.seen['rw.atlas_intro'] = true;
    t.eq(first(s), 'hall.tsuru_ledger', 'after the story Tsuru has the key ledger for you');
    await run('hall.tsuru_ledger');
    t.ok(s.flags.hall_ledger && s.inv.hall_ledger && has(/teacher's teacher sat the Hundred/), 'she hands it over: her teacher\'s teacher sat the Hundred');
    t.eq(first(s), 'rw.tsuru_post', 'and afterwards she talks as before');
    const six = fresh({ edition: 1 }); delete six.flags.hall_ledger; six.seen['rw.atlas_intro'] = true;
    t.ok(first(six) !== 'hall.tsuru_ledger', 'a six-chapter journey has no Hall');
    const s2 = fresh(); delete s2.flags.hall_ledger;
    await run('kr.hall_door');
    t.ok(has(/won't move/) && !warps.includes('hall.foyer'), 'without the ledger the door stays shut');
    s2.flags.hall_ledger = true; warps = [];
    await run('kr.hall_door');
    t.ok(has(/unties itself/) && warps.includes('hall.foyer'), 'with it, the rope unties itself and the door opens into the Hall');
    const foy = C.maps['hall.foyer'];
    t.ok(['w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7', 'w8', 'w9', 'w10'].every((w) => foy.props.some((p) => p.scene === 'hall.door_' + w) && foy.props.some((p) => p.scene === 'hall.hearth_' + w)), 'the foyer\'s ten alcoves, each with its screen and its hearth');
    await run('hall.door_w10');
    t.ok(has(/not told until the nine lights are back/), 'the tenth stays cold until nine are relit');
  }

  // ---- the rules -----------------------------------------------------------------------------------------------------------
  {
    const s = fresh({ profile: 'E' });
    s.learn.difficulty = 'normal';
    t.eq(H.choice(s, 'w1'), { route: 'consolidate', tactics: 'normal' }, 'the choices start as Consolidate and the campaign\'s tactical setting');
    const v = await enterW1(s, { pat: 0, route: 'grow', tactics: 'hard' });
    t.ok(v && v.wing === 'w1' && v.floor === 0 && warps.includes('hall.w1f1') && X.of(s) && X.of(s).id === 'hall_w1', 'going in: the first floor, the expedition begun');
    t.ok(H.peek(s, 'w1').lit, 'the wing\'s hearth is relit for good the first time you reach it');
    t.eq(H.tactics(s), 'hard', 'inside the wing its own tactical setting is in force');
    t.eq(s.learn.difficulty, 'normal', 'the campaign\'s setting is not changed');
    RB.world.W.map = { id: 'hall.foyer' };
    t.eq(H.tactics(s), 'normal', 'outside it, the campaign\'s');
    RB.world.W.map = { id: 'hall.w1f1' };
    t.eq(s.learn.profile, 'E', 'the profile is always the journey\'s (Grow never changes it)');
    // a floor counts once every trial on it is done
    H.markTrial(s, 'w1', 't1'); H.markTrial(s, 'w1', 't2');
    t.ok(H.trialDone(s, 'w1', 't1') && !H.peek(s, 'w1').trials.t1 && !test(s, 'hall.w1.f0.clear'), 'two of the first floor\'s trials done: not yet counted');
    const r = H.markTrial(s, 'w1', 't3');
    t.ok(r.floorCleared && H.peek(s, 'w1').floors[0] && ['t1', 't2', 't3'].every((x) => H.peek(s, 'w1').trials[x]) && test(s, 'hall.w1.f0.clear'), 'the third: the floor is cleared and its trials counted');
    t.eq(H.peek(s, 'w1').trials.t1.route, 'grow', 'each counted trial records the route it was done on');
    // defeat on the second floor: that floor starts again, the first stays
    await RB.game.transition('hall.w1f2');
    t.eq(H.visitOf(s).floor, 1, 'up the steps: the second floor');
    H.markTrial(s, 'w1', 't4'); s.flags.xp_hall_w1_f1_lamp_w13 = true; s.flags.xp_hall_w1_f1_t4 = true; s.flags['foe:hall.w1f2:b1'] = true;
    s.resolve.pc = 3; X.useStation(s, 'w1_b2'); s.resolve.pc = 3;
    const left = X.stationLeft(s, 'w1_b2');
    const wake = X.onDefeat(s);
    t.ok(wake && wake.map === 'hall.w1f2' && /floor starts again/.test(wake.note), 'defeat: you wake at the second floor\'s entry, told that only this floor starts again');
    t.ok(!H.trialDone(s, 'w1', 't4') && !s.flags.xp_hall_w1_f1_t4 && !s.flags.xp_hall_w1_f1_lamp_w13 && !s.flags['foe:hall.w1f2:b1'] && X.stationLeft(s, 'w1_b2') === 2 && left === 1, 'the floor\'s trial, its lantern, its creature and its bench are all as they were');
    t.ok(H.trialDone(s, 'w1', 't1') && test(s, 'hall.w1.f0.clear'), 'the first floor stays counted');
    t.eq(s.resolve.pc, s.resolve.max, 'and you are at full resolve');
    // retreat: the visit ends, this floor resets, the next visit starts on it
    H.markTrial(s, 'w1', 't5'); s.flags.xp_hall_w1_f1_t5 = true;
    await RB.hooks.hall_return();
    t.ok(H.visitOf(s), 'the return lantern asks first (staying is the default answer here)');
    await RB.ui.hall.leave(false);
    t.ok(!H.visitOf(s) && !X.of(s) && !s.flags.xp_hall_w1_f1_t5 && warps[warps.length - 1] === 'hall.foyer' && s.checkpoint.map === 'hall.foyer', 'leaving: back at the hearth, the floor\'s progress gone, the expedition over');
    const v2 = await enterW1(s);
    t.ok(v2.floor === 1 && warps[warps.length - 1] === 'hall.w1f2' && !H.trialDone(s, 'w1', 't5') && H.trialDone(s, 'w1', 't3'), 'the next visit starts on the second floor, fresh; the first stays done');
    // the reprieve: the riddle, then leave keeping the floor exactly
    H.markTrial(s, 'w1', 't6'); s.flags.xp_hall_w1_f1_t6 = true; s.flags.xp_hall_w1_f1_asked = true;
    const rr = H.markTrial(s, 'w1', 't7'); s.flags.xp_hall_w1_f1_t7 = true;
    t.ok(rr.reprieve && H.visitOf(s).reprieve === 1, 'the riddle earns a reprieve');
    RB.world.W.player = { x: 12, y: 4, dir: 'left' }; RB.world.W.map = { id: 'hall.w1f2' };
    s.resolve.pc = 7;
    await RB.ui.hall.leave(true);
    const held = H.peek(s, 'w1').held;
    t.ok(held && held.floor === 1 && held.map === 'hall.w1f2' && held.x === 12 && held.flags.xp_hall_w1_f1_t6 && held.done.t6 && held.done.t7 && held.resolve.pc === 7 && held.reprieve === 0, 'leaving with it: the floor held exactly (its flags, where you stood, your resolve), the reprieve spent');
    t.ok(!s.flags.xp_hall_w1_f1_t6 && test(s, 'hall.w1.held'), 'while you are out the floor\'s flags are put away, and the hearth knows a floor is waiting');
    const v3 = await enterW1(s, { held: true });
    t.ok(v3.floor === 1 && warps[warps.length - 1] === 'hall.w1f2' && s.flags.xp_hall_w1_f1_t6 && s.flags.xp_hall_w1_f1_asked && H.trialDone(s, 'w1', 't7') && s.resolve.pc === 7 && v3.reprieve === 0 && !H.peek(s, 'w1').held, 'going back: exactly where you left off');
    // the honest note
    H.watchAnswers();
    RB.learn.record('v:道', { ok: true, help: 'supplied' });
    RB.learn.record('v:道', { ok: true });
    t.ok(H.visitOf(s).help.answers >= 2 && H.visitOf(s).help.supplied >= 1, 'answers in the wing are counted with their help category (L2), for the optional note');
    for (const x of ['t4', 't5']) H.markTrial(s, 'w1', x);
    await RB.game.transition('hall.w1f3');
    for (const x of ['t8', 't9']) H.markTrial(s, 'w1', x);
    const fin = H.markTrial(s, 'w1', 't10');
    t.ok(fin.wingDone && H.wingDone(s, 'w1') && test(s, 'hall.w1') && H.litCount(s) === 1, 'the last trial: the tale is done, its lantern relit');
    const nt = H.note(s, 'w1');
    t.ok(nt && nt.route === 'grow' && nt.tactics === 'hard' && nt.answers >= 2 && nt.help.supplied >= 1, 'the note: route, tactics and help used, truthfully (and never a gate)');
    // walking it again
    await RB.hooks.hall_finish();
    const before = JSON.stringify(H.peek(s, 'w1').trials);
    const v4 = await enterW1(s);
    t.ok(v4.practice && v4.floor === 0 && !H.trialDone(s, 'w1', 't1') && test(s, 'hall.w1.practice'), 'a finished tale can be walked again from the start, its trials fresh for practice');
    H.markTrial(s, 'w1', 't1');
    t.eq(JSON.stringify(H.peek(s, 'w1').trials), before, 'and walking it again changes no record');
    await RB.ui.hall.leave(false);
  }
  {
    // the variation: fixed per journey, both patterns reachable
    const a = fresh({ id: 'journey-a' }), pa = H.patternOf(a, 'w1');
    t.eq(H.patternOf(a, 'w1'), pa, 'the pattern is fixed once chosen');
    const seen = new Set();
    for (let i = 0; i < 40; i++) seen.add(H.patternOf(fresh({ id: 'journey-' + i }), 'w1'));
    t.eq([...seen].sort(), [0, 1], 'across journeys both patterns occur');
  }
  {
    // the suspend point: one per slot, replaced, removed with the slot (a recovery record, never a seventh save)
    await RB.save.detect();
    const s = fresh();
    RB.save.setCurrent(4, 0);
    await RB.save.writeSlot(4, s);
    await RB.save.writeRecovery(4, s, 'suspend');
    s.x = 9;
    await RB.save.writeRecovery(4, s, 'suspend');
    let ls = await RB.save.list();
    t.ok(ls[3].suspend && ls[3].suspendNewer && ls.length === RB.save.SLOTS && RB.save.SLOTS === 20, 'a suspend point is listed with its slot; still every slot (twenty)');
    const rd = await RB.save.read(4, 'suspend');
    t.eq(rd.state.x, 9, 'one suspend point per slot: the newest replaces the last');
    await RB.save.dropSuspend(4);
    ls = await RB.save.list();
    t.ok(!ls[3].suspend, 'resuming uses it up');
    await RB.save.writeRecovery(4, s, 'suspend');
    await RB.save.del(4);
    ls = await RB.save.list();
    t.ok(!ls[3].suspend && ls[3].empty, 'deleting the slot removes it too');
  }

  // ---- the trials, end to end -----------------------------------------------------------------------------------------
  for (const pat of [0, 1]) {
    const s = fresh({ comp: 'mio', profile: 'E' });
    await enterW1(s, { pat });
    const tag = ' (pattern ' + pat + ')';
    // t1
    await run('hall.w1.t1', { answer: () => false });
    t.ok(!H.trialDone(s, 'w1', 't1') && asked[0] === 'hall.w1.story' && has(/put the pictures in order later/), 'the story room: out of order is not a failure, the trial waits' + tag);
    await run('hall.w1.t1');
    t.ok(H.trialDone(s, 'w1', 't1') && has(/say it again/) && asked.includes('hall.w1.story_q'), 'the four pictures read and put back; the optional question asked after the trial counts' + tag);
    // t2
    await run('hall.w1.t2', { answer: () => false });
    t.ok(!H.trialDone(s, 'w1', 't2') && asked[0] === 'hall.w1.sign' + pat, 'the traveller asks for ' + (pat ? 'the village' : 'the temple') + '; a wrong way leaves the traveller waiting' + tag);
    await run('hall.w1.t2');
    t.ok(H.trialDone(s, 'w1', 't2') && has(pat ? /west road/ : /east road/), 'the right way, and off they go' + tag);
    // t3: the plaques show the task's own sentences
    await run('hall.w1.plaque3');
    t.ok(has(pat ? /ring the bell|Reach the temple|Please turn right/ : /Please turn the left|Turn right and please stop/), 'a plaque shows its sentence in this pattern' + tag);
    await run('hall.w1.t3');
    t.ok(H.trialDone(s, 'w1', 't3') && asked[0] === 'hall.w1.counter' + pat && test(s, 'hall.w1.f0.clear'), 'the odd plaque found: the first floor cleared' + tag);
    // t4
    await RB.game.transition('hall.w1f2');
    const target = pat ? 'e20' : 'w13', other = pat ? 'w13' : 'e20';
    await run('hall.w1.l4_' + other);
    t.ok(!H.trialDone(s, 'w1', 't4') && has(/won't take/), 'the wrong lantern will not take a flame (nothing else happens)' + tag);
    await run('hall.w1.l4_' + target);
    t.ok(H.trialDone(s, 'w1', 't4') && s.flags['xp_hall_w1_f1_lamp_' + target], 'the card\'s lantern lit' + tag);
    // t5
    await run('hall.w1.t5');
    t.ok(H.trialDone(s, 'w1', 't5'), 'the stray lanterns settled' + tag);
    // t6
    const right = pat ? 'sw' : 'ne', wrong = pat ? 'ne' : 'sw';
    await run('hall.w1.t6_' + right);
    t.ok(!H.trialDone(s, 'w1', 't6') && has(/mossy stone/), 'before asking, the spring\'s stone is just a stone' + tag);
    await run('hall.w1.t6');
    t.ok(asked[0] === 'hall.w1.ask' && s.flags.xp_hall_w1_f1_asked && has(pat ? /bottom left/ : /top right/), 'you ask; Mio holds the map and tells you where' + tag);
    await run('hall.w1.t6_' + wrong);
    t.ok(!H.trialDone(s, 'w1', 't6') && has(/dry earth/), 'the wrong hollow: dry earth, and an offer to say it again' + tag);
    await run('hall.w1.t6_' + right);
    t.ok(H.trialDone(s, 'w1', 't6') && has(/Read it, walked it, found it/), 'the right one: the spring' + tag);
    // t7
    await run('hall.w1.t7');
    t.ok(H.trialDone(s, 'w1', 't7') && H.visitOf(s).reprieve === 1 && test(s, 'hall.w1.f1.clear'), 'the riddle: a reprieve, and the second floor cleared' + tag);
    // t8: the lamps in Otami's order
    await RB.game.transition('hall.w1f3');
    const order = pat ? ['W', 'E', 'S', 'N'] : ['N', 'E', 'S', 'W'];
    await run('hall.w1.l8_' + order[0]);
    await run('hall.w1.l8_' + order[2]);
    t.ok(has(/goes out with it/) && !s.flags['xp_hall_w1_f2_lit_' + order[0]] && !H.trialDone(s, 'w1', 't8'), 'out of order: every lamp goes out, and you can start again' + tag);
    for (const d of order) await run('hall.w1.l8_' + d);
    t.ok(H.trialDone(s, 'w1', 't8') && order.every((d) => s.flags['xp_hall_w1_f2_lit_' + d]), 'in order: the four lamps lit' + tag);
    // t10 waits for the pilgrim
    await run('hall.w1.t10');
    t.ok(!encs.length && has(/pilgrim on the west road/), 'the great lamp waits for the pilgrim' + tag);
    // t9
    await run('hall.w1.t9', { enc: () => ({ result: 'end', outcome: 'walked' }) });
    t.ok(encs[0] === 'hall.w1.pilgrim' && !H.trialDone(s, 'w1', 't9'), 'told bluntly, Genza strides off; he will be back' + tag);
    await run('hall.w1.t9', { enc: () => ({ result: 'win', outcome: 'together' }) });
    t.ok(H.trialDone(s, 'w1', 't9') && has(/Walk to the lamp together/), 'offered company, he walks with you' + tag);
    // t10 and the end
    warps = [];
    await run('hall.w1.t10', { enc: () => ({ result: 'win', outcome: 'done' }) });
    t.ok(encs[0] === 'hall.w1.great' && H.wingDone(s, 'w1') && s.flags.hall_w1_done && has(/I heard you/) && has(/voice my wife spoke of/) && !H.visitOf(s) && warps.includes('hall.foyer'), 'the lamp relit for the travellers: the tale\'s end, Genza hears the voice, back at the hearth' + tag);
    t.ok(RB.stampBook.earned(s, 'hall.w1'), 'the tale\'s stamp is earned' + tag);
  }
  {
    // Grow: the wing's tasks run a level up, recorded as stretch
    const s = fresh({ profile: 'F' });
    await enterW1(s, { pat: 0, route: 'grow' });
    await run('hall.w1.t2');
    t.ok(lastCtx && lastCtx.stretch && Array.isArray(lastCtx.steps) && lastCtx.steps.length > 0, 'on the Grow route the signpost\'s task comes a level up, as stretch');
    const s2 = fresh({ profile: 'A' });
    await enterW1(s2, { pat: 0, route: 'grow' });
    await run('hall.w1.t3');
    t.ok(lastCtx && lastCtx.stretch && lastCtx.steps.length === 1, 'at Advanced, Grow is the task\'s own stretch (nuance, never an invented level)');
    const s3 = fresh({ profile: 'E' });
    await enterW1(s3, { pat: 1 });
    await run('hall.w1.t2');
    t.ok(!lastCtx || !lastCtx.stretch, 'on Consolidate, the journey\'s own level');
  }
  {
    // each companion's voice, and alone
    for (const comp of ['nao', 'mio', 'ren', 'suzu', null]) {
      const s = fresh({ comp });
      await enterW1(s, { pat: 0 });
      await run('hall.w1.f1_first');
      const said = lines.filter((l) => l.who === comp).length;
      t.ok(comp ? said === 1 : said === 0 && lines.length >= 2, (comp || 'alone') + ': the first floor\'s arrival');
      await run('hall.w1.t6');
      t.ok(comp ? lines.some((l) => l.who === comp) : lines.some((l) => l.who === 'hall_lamp'), (comp || 'alone') + ': ' + (comp ? 'the companion holds the map' : 'the lamp holds the map'));
      await RB.ui.hall.leave(false);
    }
  }

  // ---- reachability -----------------------------------------------------------------------------------------------------
  {
    const D4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    const walk = (s, id) => {
      RB.game.s = s; RB.maps.invalidate();
      const m = RB.maps.compile(id), sp = C.maps[id].spawn.default;
      const seen = new Set([sp[0] + ',' + sp[1]]), st = [[sp[0], sp[1]]];
      while (st.length) { const [x, y] = st.pop(); for (const [dx, dy] of D4) { const nx = x + dx, ny = y + dy, k = nx + ',' + ny; if (seen.has(k) || RB.maps.blockedStatic(m, nx, ny)) continue; seen.add(k); st.push([nx, ny]); } }
      const near = (x, y, w, h) => { for (let yy = y - 1; yy <= y + h; yy++) for (let xx = x - 1; xx <= x + w; xx++) if (seen.has(xx + ',' + yy)) return true; return false; };
      const open = (c) => !c || S.test(s, c), out = [];
      for (const ex of m.exits) if (open(ex.if) && !near(ex.x, ex.y, ex.w || 1, ex.h || 1)) out.push('exit ' + ex.to);
      for (const p of C.maps[id].props || []) { const pd = RB.props.P[p.p] || {}; if (p.scene && open(p.if) && !near(p.x, p.y, p.w || pd.w || 1, p.h || pd.h || 1)) out.push(p.scene + '@' + p.x + ',' + p.y); }
      for (const n of C.maps[id].npcs || []) if (open(n.if) && !near(n.x, n.y, 1, 1)) out.push(n.id);
      for (const f of C.maps[id].foes || []) if (open(f.if) && !near(f.x, f.y, 1, 1)) out.push('foe ' + f.id);
      return out;
    };
    for (const pat of [0, 1]) {
      const s = fresh();
      H.wrec(s, 'w1').pat = pat;
      t.eq(['hall.foyer', 'hall.w1f1', 'hall.w1f2', 'hall.w1f3'].flatMap((id) => walk(s, id)), [], 'every floor walked from its entry with the ropes up: everything on it reachable (pattern ' + pat + ')');
      for (const k of [0, 1, 2]) H.wrec(s, 'w1').floors[k] = true;
      for (const x of man) H.wrec(s, 'w1').trials[x.trial] = { t: 1 };
      t.eq(['hall.w1f1', 'hall.w1f2', 'hall.w1f3'].flatMap((id) => walk(s, id)), [], 'with every floor cleared: the ways on open and reachable (pattern ' + pat + ')');
      t.ok(!S.test(fresh(), C.maps['hall.w1f1'].exits[0].if), 'and before a floor is cleared its way on is shut');
    }
  }
};
