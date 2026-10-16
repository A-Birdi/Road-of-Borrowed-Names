// The Hall of a Hundred Tales, wing 9, The Crane's Return (expansion P15; plan 04_DUNGEONS.md D9;
// docs/future/work/P15_POSTGAME.md), with synthetic campaigns only, the scenes played through the real scene runner
// with the dialogue stubbed (lines collected, language tasks answered by the test, choices and encounters' ends chosen
// by the test). The Hall's rules themselves are covered by hall_w1.test.mjs and hold for every wing; this covers what
// wing 9 adds:
//  - the manifest: ten deliberate trials over three floors, every kind the plan asks for, each with a scene that sets
//    its floor's flag and tells the Hall;
//  - every trial end to end in both patterns, right and wrong: the old man's words given back to whom they were said
//    to (a word given to the wrong person is not taken), the seats at the hearth (a name on the wrong seat is not set
//    down), what the young woman asked, in your companion's ears (alone, Otoku's), and doing it without looking, the
//    lord's order passed down from the gate to the shop to the hearth (in the wrong register, or with the order
//    changed, it is not passed on), Yosaku and Otoku (he goes out to the woodshed, and comes back), the farewell, the
//    tale's end and its stamp;
//  - Grow lifting a task one level as stretch; each companion's voice;
//  - reachability: every floor walked from its entry with the rope up and with it down, both patterns.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state, H = RB.hall, X = RB.expedition;

  // ---- a minimal stage ----------------------------------------------------------------------------------------------
  let lines = [], asked = [], encs = [], encRes = () => ({ result: 'win', outcome: null }), warps = [], answer = () => true;
  RB.ui.dialogue.say = async (l) => { lines.push({ who: l.who, jp: l.jp || '', en: l.en || '' }); };
  RB.ui.dialogue.choose = async () => 0;
  RB.ui.dialogue.hide = () => {};
  RB.ui.toast = async () => {};
  RB.ui.notice = () => {};
  RB.ui.confirm = async (q, opts) => opts.length - 1;
  RB.ui.shake = () => {};
  RB.ui.fade = async () => {};
  for (const k of ['ensureSpeaker', 'dismissExtras', 'refreshActors']) RB.world[k] = () => {};
  RB.world.whenArrived = async () => {};
  RB.world.emote = () => {};
  RB.game.afterScene = () => {};
  RB.world.W = RB.world.W || {};
  RB.game.transition = async (map) => { warps.push(map); RB.game.G.s.map = map; RB.world.W.map = { id: map }; RB.bus.emit('map:enter', { id: map }); };
  RB.game.rest = async () => {};
  RB.game.inBattle = () => false;
  RB.game.startEncounter = async (id) => { encs.push(id); return encRes(id); };
  RB.save.autosave = async () => {};
  let ctxOf = {};
  RB.challenge.run = async (id, ctx) => { asked.push(id); ctxOf[id] = ctx || null; return { ok: answer(id) }; };
  if (RB.lessons) RB.lessons.grammarCard = async () => {};
  const fresh = (o = {}) => {
    const s = S.newCampaign({ edition: 2 });
    s.id = o.id || 'hall-w9-test'; s.map = 'hall.foyer'; s.comp = o.comp === undefined ? 'ren' : o.comp;
    s.player.name = 'Haru'; s.player.nameJp = 'ハル';
    s.learn.profile = o.profile || 'E';
    Object.assign(s.flags, { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_done: true, cr_done: true, yn_done: true, postgame: true, ch6_done: true, hall_ledger: true });
    s.vars = {};
    RB.game.G.s = s;
    RB.world.W.map = { id: s.map };
    return s;
  };
  const run = async (id, o = {}) => { lines = []; asked = []; encs = []; ctxOf = {}; answer = o.answer || (() => true); if (o.enc) encRes = o.enc; await RB.script.run(id); return lines; };
  const has = (re) => lines.some((l) => re.test(l.en) || re.test(l.jp));
  const test = (s, cond) => S.test(s, cond);
  const ops = (id) => (C.scenes[id] ? C.scenes[id].cmds : []).map((c) => c.op + ':' + (c.args || []).join(' '));
  const enterW9 = async (s, o = {}) => { if (o.pat != null) H.wrec(s, 'w9').pat = o.pat; if (o.route || o.tactics) H.setChoice(s, 'w9', o); RB.hooks.hall_card = async () => { s.vars._res = 1; }; await run('hall.door_w9'); return H.visitOf(s); };

  // ---- the manifest ---------------------------------------------------------------------------------------------------
  const w9 = H.get('w9');
  const man = H.manifest().filter((x) => x.wing === 'w9');
  t.eq(man.length, 10, 'wing 9 has ten trials');
  t.eq(new Set(man.map((x) => x.id)).size, 10, 'their ids are unique');
  t.ok(['story', 'counterexample', 'infogap', 'riddle', 'encounter', 'social', 'capstone', 'mechanism'].every((k) => man.some((x) => x.kind === k)), 'every kind of trial the plan asks for');
  t.ok([0, 1, 2].every((k) => man.filter((x) => x.floor === k).length >= 3) && w9.floors.length === 3, 'three floors, each with at least three trials');
  t.ok(man.filter((x) => x.reprieve).length === 1 && man.find((x) => x.reprieve).kind === 'riddle', 'the riddle earns the wing\'s reprieve');
  const allOps = Object.keys(C.scenes).filter((id) => id.startsWith('hall.w9.')).flatMap((id) => ops(id));
  for (const x of man) t.ok(allOps.includes('hook:hall_trial w9 ' + x.trial) && allOps.some((o) => o.startsWith('set:') && o.slice(4).split(' ').includes('xp_hall_w9_f' + x.floor + '_' + x.trial)), x.id + ': a scene sets its floor\'s flag and tells the Hall');
  t.ok(X.get('hall_w9') && X.get('hall_w9').kind === 'hall' && X.get('hall_w9').rules.restart === 'floor', 'the wing is an expedition of kind hall, the floor restarted on defeat');
  t.ok(['hall.w9f1', 'hall.w9f2', 'hall.w9f3'].every((id) => C.maps[id] && C.maps[id].edition === 2 && C.maps[id].music === 'hall_w9' && C.maps[id].region === 'hall_w9'), 'three floors in the twelve-chapter edition, with the wing\'s own region and music');
  t.ok(RB.audio && RB.audio._ && RB.audio._.songDefs.hall_w9, 'the wing\'s song exists');
  t.eq((C.scriptErrors || []).filter((e) => /hall/.test(e)), [], 'the Hall\'s scenes parse');
  t.ok(C.stamps['hall.w9'] && C.stamps['hall.w9'].hidden, 'its stamp, hidden until the tale is told');
  t.ok(ops('hall.door_w9').includes('hook:hall_card w9') && w9.trials.length === 10, 'the ninth alcove opens onto a told tale');
  t.ok(['register_polite_plain', 'address_terms', 'keigo_sonkei', 'keigo_kenjo', 'te_giving', 'te_kudasaru', 'sasete_itadaku', 'indirectness'].every((g) => RB.grammar.get(g)), 'what it practices is grammar the game teaches');
  const fw = C.encounters['hall.w9.farewell'];
  t.ok(fw && fw.procedure.steps.length === 4 && fw.procedure.steps.every((st) => st.actions.filter((a) => a.ok).length === 1 && st.actions.some((a) => !a.ok && a.wrong)), 'the farewell: four people, each with one fitting answer and one that is not');
  t.ok(/\{横座\|よこざ\}/.test(w9.folklore.en) && /real custom/.test(w9.folklore.en) && /\{鶴\|つる\}の\{恩返\|おんがえ\}し/.test(w9.folklore.en) && /real folktale/i.test(w9.folklore.en), 'the folklore note labels the tale and the hearth seats as real');

  // ---- the trials, end to end -----------------------------------------------------------------------------------------
  const SLIPHEAR = { 0: { s1: 'otoku', s2: 'gensuke', s3: 'envoy', s4: 'sabu', s5: 'otoku' }, 1: { s1: 'gensuke', s2: 'envoy', s3: 'sabu', s4: 'otoku', s5: 'sabu' } };
  const SEATOF = { 0: { yosaku: 'yokoza', musume: 'kyakuza', otoku: 'kakaza', sabu: 'kijiri' }, 1: { yosaku: 'yokoza', shoya: 'kyakuza', otoku: 'kakaza', musume: 'kijiri' } };
  const DUTY = { 0: 'meal', 1: 'fire' };
  const ORDEN = ['one more bolt by the new moon', 'two bolts by spring'];
  let lastOpts = [];
  const pick = async (scene, to) => { RB.ui.dialogue.choose = async (opts) => { lastOpts = opts; const i = opts.findIndex((o) => o.to === to); return i < 0 ? 0 : i; }; await run(scene); RB.ui.dialogue.choose = async () => 0; };
  for (const pat of [0, 1]) {
    const s = fresh({ comp: 'mio', profile: 'E' });
    const v = await enterW9(s, { pat });
    const tag = ' (pattern ' + pat + ')';
    t.ok(v && v.wing === 'w9' && v.floor === 0 && warps.includes('hall.w9f1') && X.of(s) && X.of(s).id === 'hall_w9', 'going in: the first floor' + tag);
    // t1
    await run('hall.w9.t1', { answer: () => false });
    t.ok(!H.trialDone(s, 'w9', 't1') && asked[0] === 'hall.w9.story' && has(/put the pictures in order later/), 'the story room: out of order, the trial waits' + tag);
    await run('hall.w9.t1');
    t.ok(H.trialDone(s, 'w9', 't1') && asked.includes('hall.w9.story_q') && has(/crane caught in a trap/) && has(/plucking her own feathers/), 'the four pictures read and put back; the optional question after' + tag);
    // t2: the old man's words, each given back to whom it was said to
    await run('hall.w9.yosaku');
    t.ok(lines.some((l) => l.who === 'hall_yosaku') && has(/give my words back/), 'Yosaku asks for his words to be given back' + tag);
    await run('hall.w9.s1');
    t.ok(has(pat ? /take a look at this cloth/ : /Terrible snow out there/), 'the first saying read' + tag);
    const wrongEar = ['otoku', 'sabu', 'gensuke', 'envoy'].find((h) => h !== SLIPHEAR[pat].s1);
    await run('hall.w9.to_' + wrongEar);
    t.ok(has(/said to me|say that to me|spoke to me like that|not meant for me/) && !s.flags.xp_hall_w9_f0_put_s1, 'words given to the wrong person are not taken' + tag);
    for (const sl of ['s1', 's2', 's3', 's4', 's5']) { await run('hall.w9.' + sl); await run('hall.w9.to_' + SLIPHEAR[pat][sl]); }
    t.ok(H.trialDone(s, 'w9', 't2') && ['s1', 's2', 's3', 's4', 's5'].every((sl) => s.flags['xp_hall_w9_f0_put_' + sl]) && has(/All five of Yosaku's sayings/), 'every saying back with the one it was said to' + tag);
    await run('hall.w9.to_envoy');
    t.ok(has(/knows its manners/), 'afterwards the messenger has a word for the village' + tag);
    // t3
    await run('hall.w9.card2');
    t.ok(lines.length === 2, 'a prayer board shows its saying in this pattern' + tag);
    await run('hall.w9.t3', { answer: () => false });
    t.ok(!H.trialDone(s, 'w9', 't3') && asked[0] === 'hall.w9.counter' + pat, 'the wrong saying not found: the boards wait' + tag);
    await run('hall.w9.t3');
    t.ok(H.trialDone(s, 'w9', 't3') && test(s, 'hall.w9.f0.clear'), 'the wrong saying found: the first floor cleared' + tag);
    // t4: the seats at the hearth
    await RB.game.transition('hall.w9f2');
    t.eq(H.visitOf(s).floor, 1, 'into the old couple\'s house' + tag);
    await run('hall.w9.t4_board');
    t.ok(has(/master of the house's seat/) && has(pat ? /village head has come/ : /young stranger came asking/), 'the board: the rule of the seats, and who is here tonight' + tag);
    const wrongSeat = ['yokoza', 'kyakuza', 'kakaza', 'kijiri'].find((st) => st !== SEATOF[pat].musume);
    await run('hall.w9.tag_musume'); await run('hall.w9.seat_' + wrongSeat);
    t.ok(has(/not their seat/) && !s.flags['xp_hall_w9_f1_seat_' + wrongSeat], 'a name on the wrong seat is not set down' + tag);
    for (const w of Object.keys(SEATOF[pat])) { await run('hall.w9.tag_' + w); await run('hall.w9.seat_' + SEATOF[pat][w]); }
    t.ok(H.trialDone(s, 'w9', 't4') && Object.keys(SEATOF[pat]).every((w) => s.flags['xp_hall_w9_f1_seated_' + w]) && has(/Four seats, four names/) && has(pat ? /become family/ : /still a guest/), 'everyone in their place for the night' + tag);
    const tags = C.maps['hall.w9f2'].props.filter((p) => /^hall\.w9\.tag_/.test(p.scene || ''));
    const shown = (w) => tags.some((p) => p.scene === 'hall.w9.tag_' + w && S.test(fresh2(pat), p.if || ''));
    function fresh2(p) { const x = S.newCampaign({ edition: 2 }); H.wrec(x, 'w9').pat = p; return x; }
    t.ok(shown('yosaku') && shown('otoku') && shown('musume') && (pat ? shown('shoya') && !shown('sabu') : shown('sabu') && !shown('shoya')), 'the night\'s own name tags are laid out' + tag);
    // t5
    await run('hall.w9.t5');
    t.ok(H.trialDone(s, 'w9', 't5') && has(/a crane calls/), 'the frost at the window melted' + tag);
    // t6: what she asked, and doing it without looking
    await run('hall.w9.d_' + DUTY[pat]);
    t.ok(!H.trialDone(s, 'w9', 't6') && has(/Ask first/), 'before you know what she asked, nothing is done' + tag);
    await run('hall.w9.t6');
    t.ok(asked[0] === 'hall.w9.ask' && s.flags.xp_hall_w9_f1_asked && lines.some((l) => l.who === 'mio') && has(pat ? /keep the hearth fire going/ : /leave her meals outside the door/), 'you ask; Mio tells you what she asked' + tag);
    await run('hall.w9.d_peek');
    t.ok(!H.trialDone(s, 'w9', 't6') && has(/You don't look/), 'the torn paper: you do not look' + tag);
    await run('hall.w9.d_' + DUTY[1 - pat]);
    t.ok(!H.trialDone(s, 'w9', 't6') && has(/doesn't seem to be what she asked/) && has(/say what she asked again/), 'the other night\'s request is not this one\'s, and an offer to say it again' + tag);
    await run('hall.w9.d_' + DUTY[pat]);
    t.ok(H.trialDone(s, 'w9', 't6') && has(pat ? /feed the fire up high/ : /set the tray down outside the door/), 'what she asked, done without looking' + tag);
    // t7
    await run('hall.w9.t7');
    t.ok(H.trialDone(s, 'w9', 't7') && H.visitOf(s).reprieve === 1 && test(s, 'hall.w9.f1.clear'), 'the riddle: a reprieve, and the second floor cleared' + tag);
    // t9 and t10 wait for the lord's order
    await RB.game.transition('hall.w9f3');
    await run('hall.w9.t10');
    t.ok(!encs.length && has(/loom is still going/) && has(/lord's order has not reached/) && has(/haven't talked it through/), 'the farewell waits: the order first, and the old couple' + tag);
    await run('hall.w9.t9');
    t.ok(!encs.length && has(/waiting for news from town/), 'the old couple wait for news from town' + tag);
    // t8: the lord's order, passed down
    await run('hall.w9.post_shop');
    t.ok(has(/The gate first/), 'the shop before the gate: Gensuke has not heard yet' + tag);
    await run('hall.w9.post_hearth');
    t.ok(has(/isn't back from town/), 'the hearth before the shop: Yosaku is not back' + tag);
    await pick('hall.w9.post_gate', 'wrong_casual');
    t.ok(lastOpts.length === 3 && has(/as you would to a friend/) && !s.flags.xp_hall_w9_f2_post_gate, 'the gate: three answers at the journey\'s level; a friend\'s answer to the lord\'s man will not do' + tag);
    await pick('hall.w9.post_gate', 'wrong_self');
    t.ok(has(/raises Gensuke himself/) && !s.flags.xp_hall_w9_f2_post_gate, 'nor raising yourself with respectful words' + tag);
    await pick('hall.w9.post_gate', 'right');
    t.ok(s.flags.xp_hall_w9_f2_post_gate && has(/Gensuke bows deep/), 'humbly answered, the order goes on' + tag);
    await pick('hall.w9.post_shop', 'wrong_what');
    t.ok(lastOpts.length === 3 && lastOpts.find((o) => o.to === 'right').en.includes(ORDEN[pat]) && has(/isn't the order/) && !s.flags.xp_hall_w9_f2_post_shop, 'the shop: the order changed on the way is not passed on' + tag);
    await pick('hall.w9.post_shop', 'wrong_rude');
    t.ok(has(/grander than/) && !s.flags.xp_hall_w9_f2_post_shop, 'nor ordering a supplier about' + tag);
    await pick('hall.w9.post_shop', 'right');
    t.ok(s.flags.xp_hall_w9_f2_post_shop, 'politely told, the order goes up the hill' + tag);
    await pick('hall.w9.post_hearth', 'wrong_stiff');
    t.ok(has(/Since when do you talk to me like that/) && !H.trialDone(s, 'w9', 't8'), 'the hearth: Otoku laughs at being spoken to like the lord\'s man' + tag);
    await pick('hall.w9.post_hearth', 'right');
    t.ok(H.trialDone(s, 'w9', 't8') && has(/change their clothes/), 'the same order, said three ways: passed down' + tag);
    // t9: Yosaku and Otoku
    await run('hall.w9.t9', { enc: () => ({ result: 'end', outcome: 'left' }) });
    t.ok(encs[0] === 'hall.w9.quarrel' && !H.trialDone(s, 'w9', 't9') && has(/gone out to the woodshed/), 'Yosaku goes out to the woodshed; it can be tried again' + tag);
    await run('hall.w9.t9', { enc: () => ({ result: 'win', outcome: 'asked' }) });
    t.ok(H.trialDone(s, 'w9', 't9') && has(/ask her together/), 'they will ask her, and let her say no' + tag);
    // t10 and the end
    warps = [];
    await run('hall.w9.t10', { enc: () => ({ result: 'win', outcome: 'done' }) });
    t.ok(encs[0] === 'hall.w9.farewell' && H.wingDone(s, 'w9') && s.flags.hall_w9_done && has(/rises into the morning sky/) && has(/remind you of someone/) && !H.visitOf(s) && warps.includes('hall.foyer'), 'the farewell said, the crane gone into the morning: the tale\'s end, back at the hearth' + tag);
    t.ok(RB.stampBook.earned(s, 'hall.w9'), 'the tale\'s stamp is earned' + tag);
  }
  {
    // Grow: the wing's tasks a level up, as stretch
    const s = fresh({ profile: 'F' });
    await enterW9(s, { pat: 0, route: 'grow' });
    await run('hall.w9.t1');
    const g = ctxOf['hall.w9.story'];
    t.ok(g && g.stretch && Array.isArray(g.steps) && g.steps.length > 0, 'on the Grow route the story room\'s task comes a level up, as stretch');
    await run('hall.w9.s1');
    t.ok(has(/\{今\|いま\}/), 'and the sayings are a level up (with their kanji for a Foundations journey)');
    const s2 = fresh({ profile: 'E' });
    await enterW9(s2, { pat: 1 });
    await run('hall.w9.t1');
    t.ok(!(ctxOf['hall.w9.story'] || {}).stretch, 'on Consolidate, the journey\'s own level');
    await RB.ui.hall.leave(false);
  }
  {
    // each companion's voice, and alone (Otoku heard what the young woman asked)
    for (const comp of ['nao', 'mio', 'ren', 'suzu', null]) {
      const s = fresh({ comp });
      await enterW9(s, { pat: 0 });
      await run('hall.w9.f1_first');
      const said = lines.filter((l) => l.who === comp).length;
      t.ok(comp ? said === 1 : said === 0 && lines.length >= 2, (comp || 'alone') + ': the first floor\'s arrival');
      await RB.game.transition('hall.w9f2');
      await run('hall.w9.t6');
      t.ok(comp ? lines.some((l) => l.who === comp) : lines.some((l) => l.who === 'hall_otoku'), (comp || 'alone') + ': ' + (comp ? 'the companion tells you what she asked' : 'Otoku tells you what she asked'));
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
      return { out, seen };
    };
    for (const pat of [0, 1]) {
      const s = fresh();
      H.wrec(s, 'w9').pat = pat;
      t.eq(['hall.w9f1', 'hall.w9f2', 'hall.w9f3'].flatMap((id) => walk(s, id).out), [], 'every floor walked from its entry with the ropes up: everything on it reachable (pattern ' + pat + ')');
      for (const id of ['hall.w9f1', 'hall.w9f2']) {
        const m = C.maps[id], st = m.props.find((p) => p.p === 'stairs'), r = walk(s, id);
        t.ok(![[0, 1], [1, 0], [-1, 0], [0, -1]].some(([dx, dy]) => r.seen.has((st.x + dx) + ',' + (st.y + dy))), id + ': with the rope up, the stairs cannot be reached (no way round it)');
      }
      // with every floor cleared (and the people the trials bring out standing where they wait)
      for (const k of [0, 1, 2]) H.wrec(s, 'w9').floors[k] = true;
      for (const x of man) H.wrec(s, 'w9').trials[x.trial] = { t: 1 };
      t.eq(['hall.w9f1', 'hall.w9f2', 'hall.w9f3'].flatMap((id) => walk(s, id).out), [], 'with every floor cleared: the ways on open and everything reachable (pattern ' + pat + ')');
    }
    t.ok(!S.test(fresh(), C.maps['hall.w9f1'].exits[0].if), 'before a floor is cleared its way on is shut');
  }
};
