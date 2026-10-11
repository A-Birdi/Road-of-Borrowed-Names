// The Hall of a Hundred Tales, wing 5, The Two Wells (expansion P15; plan 04_DUNGEONS.md D9;
// docs/future/work/P15_POSTGAME.md), with synthetic campaigns only, the scenes played through the real scene runner
// with the dialogue stubbed (lines collected, language tasks answered by the test, encounters' ends chosen by the
// test). The Hall's rules themselves are covered by hall_w1.test.mjs and hold for every wing; this covers what wing 5
// adds:
//  - the manifest: ten deliberate trials over three floors, every kind the plan asks for, each with a scene that sets
//    its floor's flag and tells the Hall;
//  - every trial end to end in both patterns, right and wrong: three troubles mended at their cause (mending the wrong
//    thing changes nothing), the four jars sorted by the reason on each label (east is not always sweet), the
//    well-digger's record read by your companion (alone, by Hatsu) and the one remedy its reason points to, the
//    cleaning's three jobs given by the helpers' reasons, Osugi and Mosuke (they walk off, and can be talked round),
//    the well-cleaning, the tale's end and its stamp;
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
    s.id = o.id || 'hall-w5-test'; s.map = 'hall.foyer'; s.comp = o.comp === undefined ? 'ren' : o.comp;
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
  const enterW5 = async (s, o = {}) => { if (o.pat != null) H.wrec(s, 'w5').pat = o.pat; if (o.route || o.tactics) H.setChoice(s, 'w5', o); RB.hooks.hall_card = async () => { s.vars._res = 1; }; await run('hall.door_w5'); return H.visitOf(s); };

  // ---- the manifest ---------------------------------------------------------------------------------------------------
  const w5 = H.get('w5');
  const man = H.manifest().filter((x) => x.wing === 'w5');
  t.eq(man.length, 10, 'wing 5 has ten trials');
  t.eq(new Set(man.map((x) => x.id)).size, 10, 'their ids are unique');
  t.ok(['story', 'counterexample', 'infogap', 'riddle', 'encounter', 'social', 'capstone', 'mechanism'].every((k) => man.some((x) => x.kind === k)), 'every kind of trial the plan asks for');
  t.ok([0, 1, 2].every((k) => man.filter((x) => x.floor === k).length >= 3) && w5.floors.length === 3, 'three floors, each with at least three trials');
  t.ok(man.filter((x) => x.reprieve).length === 1 && man.find((x) => x.reprieve).kind === 'riddle', 'the riddle earns the wing\'s reprieve');
  const allOps = Object.keys(C.scenes).filter((id) => id.startsWith('hall.w5.')).flatMap((id) => ops(id));
  for (const x of man) t.ok(allOps.includes('hook:hall_trial w5 ' + x.trial) && allOps.some((o) => o.startsWith('set:') && o.slice(4).split(' ').includes('xp_hall_w5_f' + x.floor + '_' + x.trial)), x.id + ': a scene sets its floor\'s flag and tells the Hall');
  t.ok(X.get('hall_w5') && X.get('hall_w5').kind === 'hall' && X.get('hall_w5').rules.restart === 'floor', 'the wing is an expedition of kind hall, the floor restarted on defeat');
  t.ok(['hall.w5f1', 'hall.w5f2', 'hall.w5f3'].every((id) => C.maps[id] && C.maps[id].edition === 2 && C.maps[id].music === 'hall_w5' && C.maps[id].region === 'hall_w5'), 'three floors in the twelve-chapter edition, with the wing\'s own region and music');
  t.ok(RB.audio && RB.audio._ && RB.audio._.songDefs.hall_w5, 'the wing\'s song exists');
  t.eq((C.scriptErrors || []).filter((e) => /hall/.test(e)), [], 'the Hall\'s scenes parse');
  t.ok(C.stamps['hall.w5'] && C.stamps['hall.w5'].hidden, 'its stamp, hidden until the tale is told');
  t.ok(ops('hall.door_w5').includes('hook:hall_card w5') && w5.trials.length === 10, 'the fifth alcove opens onto a told tale');
  t.ok(['okage_sei', 'noni', 'conj_kara', 'adv_kara_koso', 'adv_monono'].every((g) => RB.grammar.get(g)), 'the reasons and contrasts it practises are grammar the game teaches');

  // ---- the trials, end to end -----------------------------------------------------------------------------------------
  const RIGHT = { 0: { bucket: 'pulley', field: 'stone', dog: 'feed' }, 1: { bucket: 'beam', field: 'sluice', dog: 'gate' } };
  const CAUSES = { bucket: ['pulley', 'beam'], field: ['stone', 'sluice'], dog: ['feed', 'gate'] };
  const KIND = { 0: { j1: 'fresh', j2: 'spoiled', j3: 'boiled', j4: 'raw' }, 1: { j1: 'spoiled', j2: 'fresh', j3: 'raw', j4: 'boiled' } };
  const DRINK = { fresh: true, boiled: true, spoiled: false, raw: false };
  const REMEDY = { 0: 'willow', 1: 'draw' };
  const ASSIGN = { 0: { kota: 'bucket', hatsu: 'rope', mosuke: 'tally' }, 1: { kota: 'tally', hatsu: 'bucket', mosuke: 'rope' } };
  for (const pat of [0, 1]) {
    const s = fresh({ comp: 'mio', profile: 'E' });
    const v = await enterW5(s, { pat });
    const tag = ' (pattern ' + pat + ')';
    t.ok(v && v.wing === 'w5' && v.floor === 0 && warps.includes('hall.w5f1') && X.of(s) && X.of(s).id === 'hall_w5', 'going in: the first floor' + tag);
    // t1
    await run('hall.w5.t1', { answer: () => false });
    t.ok(!H.trialDone(s, 'w5', 't1') && asked[0] === 'hall.w5.story' && has(/put the pictures in order later/), 'the story room: out of order, the trial waits' + tag);
    await run('hall.w5.t1');
    t.ok(H.trialDone(s, 'w5', 't1') && asked.includes('hall.w5.story_q') && has(/two wells/) && has(/frog at the bottom of the well/), 'the four pictures read and put back; the optional question after' + tag);
    // t2: three troubles mended at their cause
    await run('hall.w5.why_bucket');
    t.ok(has(pat ? /tangled on the beam/ : /pulley's rusted/) && lines.some((l) => l.who === 'hall_kota'), 'Kōta says why the bucket won\'t come up' + tag);
    await run('hall.w5.e_bucket');
    t.ok(has(/won't come up/) && !s.flags.xp_hall_w5_f0_fixed_bucket, 'the bucket itself: where the trouble shows, not where it comes from' + tag);
    const wrongCause = CAUSES.bucket.find((c) => c !== RIGHT[pat].bucket);
    await run('hall.w5.c_' + wrongCause);
    t.ok(has(/That isn't why/) && !s.flags.xp_hall_w5_f0_fixed_bucket, 'mending the wrong thing changes nothing' + tag);
    for (const pr of ['bucket', 'field', 'dog']) await run('hall.w5.c_' + RIGHT[pat][pr]);
    t.ok(H.trialDone(s, 'w5', 't2') && ['bucket', 'field', 'dog'].every((pr) => s.flags['xp_hall_w5_f0_fixed_' + pr]) && has(/each at its reason/), 'each trouble mended at its cause' + tag);
    await run('hall.w5.e_dog');
    t.ok(has(/wags its tail/), 'and the dog, where it showed, is happy' + tag);
    // t3
    await run('hall.w5.card2');
    t.ok(lines.length === 2, 'a stone shows its saying in this pattern' + tag);
    await run('hall.w5.t3', { answer: () => false });
    t.ok(!H.trialDone(s, 'w5', 't3') && asked[0] === 'hall.w5.counter' + pat, 'the wrong saying not found: the stone waits' + tag);
    await run('hall.w5.t3');
    t.ok(H.trialDone(s, 'w5', 't3') && test(s, 'hall.w5.f0.clear'), 'the wrong saying found: the first floor cleared' + tag);
    // t4: the four jars
    await RB.game.transition('hall.w5f2');
    t.eq(H.visitOf(s).floor, 1, 'up the road: the West Well' + tag);
    await run('hall.w5.j1');
    t.ok(s.flags.xp_hall_w5_f1_hold_j1 && has(KIND[pat].j1 === 'fresh' ? /drawn this morning: sweet/ : /three days in the sun/), 'the first jar picked up, its label read' + tag);
    await run(DRINK[KIND[pat].j1] ? 'hall.w5.to_drain' : 'hall.w5.to_drink');
    t.ok(has(/Read the label again/) && !s.flags.xp_hall_w5_f1_put_j1, 'put in the wrong place: read the label again' + tag);
    for (const j of ['j1', 'j2', 'j3', 'j4']) { await run('hall.w5.' + j); await run(DRINK[KIND[pat][j]] ? 'hall.w5.to_drink' : 'hall.w5.to_drain'); }
    t.ok(H.trialDone(s, 'w5', 't4') && has(/four jars are sorted/) && has(/read the reason to the end/), 'every jar where its reason says: east is not always sweet, nor west always bitter' + tag);
    // t5
    await run('hall.w5.t5');
    t.ok(H.trialDone(s, 'w5', 't5'), 'the frogs quietened' + tag);
    // t6: the well-digger's record
    await run('hall.w5.m_' + REMEDY[pat]);
    t.ok(!H.trialDone(s, 'w5', 't6') && has(/don't know yet why the well is bitter/), 'before the record is read, a remedy is a guess' + tag);
    await run('hall.w5.t6');
    t.ok(asked[0] === 'hall.w5.ask' && s.flags.xp_hall_w5_f1_asked && lines.some((l) => l.who === 'mio') && has(pat ? /nobody draws from it/ : /willow's roots grew into it/), 'you ask; Mio reads the record' + tag);
    await run('hall.w5.m_lid');
    t.ok(!H.trialDone(s, 'w5', 't6') && has(/nothing to do with the reason/) && has(/say what the record said again/), 'a lid: nothing to do with the reason, and an offer to say it again' + tag);
    await run('hall.w5.m_' + REMEDY[1 - pat]);
    t.ok(!H.trialDone(s, 'w5', 't6') && has(/nothing to do with the reason/), 'the other pattern\'s remedy is not this one\'s' + tag);
    await run('hall.w5.m_' + REMEDY[pat]);
    t.ok(H.trialDone(s, 'w5', 't6') && has(/Know the reason and you know the remedy/), 'the remedy the record\'s reason points to' + tag);
    // t7
    await run('hall.w5.t7');
    t.ok(H.trialDone(s, 'w5', 't7') && H.visitOf(s).reprieve === 1 && test(s, 'hall.w5.f1.clear'), 'the riddle: a reprieve, and the second floor cleared' + tag);
    // t10 waits
    await RB.game.transition('hall.w5f3');
    await run('hall.w5.t10');
    t.ok(!encs.length && has(/Nobody has gathered/) && has(/job tags haven't been handed/) && has(/backs turned/), 'the well-cleaning waits: the jobs first, and Osugi and Mosuke' + tag);
    // t8: the cleaning's three jobs
    await run('hall.w5.t8_board');
    t.ok(has(/One each/), 'the job board read' + tag);
    const wrongTag = ['bucket', 'rope', 'tally'].find((g) => g !== ASSIGN[pat].kota);
    await run('hall.w5.tag_' + wrongTag);
    await run('hall.w5.h_kota');
    t.ok(has(pat ? /twisted my ankle/ : /no good at counting/) && has(/Didn't I just say/) && !s.flags.xp_hall_w5_f2_job_kota, 'Kōta gives his reason; handed a job it rules out, he says so' + tag);
    for (const h of ['kota', 'hatsu', 'mosuke']) { await run('hall.w5.tag_' + ASSIGN[pat][h]); await run('hall.w5.h_' + h); }
    t.ok(H.trialDone(s, 'w5', 't8') && ['kota', 'hatsu', 'mosuke'].every((h) => s.flags['xp_hall_w5_f2_job_' + h]) && has(/each gone to the one they suit/), 'each helper given the job their reason leaves them' + tag);
    // t9: Osugi and Mosuke
    await run('hall.w5.t9', { enc: () => ({ result: 'end', outcome: 'walked' }) });
    t.ok(encs[0] === 'hall.w5.feud' && !H.trialDone(s, 'w5', 't9') && has(/backs turned/), 'they walk off to opposite ends of the square; it can be tried again' + tag);
    await run('hall.w5.t9', { enc: () => ({ result: 'win', outcome: 'together' }) });
    t.ok(H.trialDone(s, 'w5', 't9') && has(/Both wells, together/), 'talked round: both wells, together' + tag);
    // t10 and the end
    warps = [];
    await run('hall.w5.t10', { enc: () => ({ result: 'win', outcome: 'done' }) });
    t.ok(encs[0] === 'hall.w5.clean' && H.wingDone(s, 'w5') && s.flags.hall_w5_done && has(/one pot/) && !H.visitOf(s) && warps.includes('hall.foyer'), 'the well cleaned, and supper in one pot: the tale\'s end, back at the hearth' + tag);
    t.ok(RB.stampBook.earned(s, 'hall.w5'), 'the tale\'s stamp is earned' + tag);
  }
  {
    // Grow: the wing's tasks a level up, as stretch
    const s = fresh({ profile: 'F' });
    await enterW5(s, { pat: 0, route: 'grow' });
    await run('hall.w5.t1');
    const g = ctxOf['hall.w5.story'];
    t.ok(g && g.stretch && Array.isArray(g.steps) && g.steps.length > 0, 'on the Grow route the story room\'s task comes a level up, as stretch');
    await run('hall.w5.why_bucket');
    t.ok(has(/\{滑車\|かっしゃ\}/) && has(/から 、/), 'and Kōta gives his reason a level up (with its kanji for a Foundations journey)');
    const s2 = fresh({ profile: 'E' });
    await enterW5(s2, { pat: 1 });
    await run('hall.w5.t1');
    t.ok(!(ctxOf['hall.w5.story'] || {}).stretch, 'on Consolidate, the journey\'s own level');
    await RB.ui.hall.leave(false);
  }
  {
    // each companion's voice, and alone (Hatsu reads the record)
    for (const comp of ['nao', 'mio', 'ren', 'suzu', null]) {
      const s = fresh({ comp });
      await enterW5(s, { pat: 0 });
      await run('hall.w5.f1_first');
      const said = lines.filter((l) => l.who === comp).length;
      t.ok(comp ? said === 1 : said === 0 && lines.length >= 2, (comp || 'alone') + ': the first floor\'s arrival');
      await RB.game.transition('hall.w5f2');
      await run('hall.w5.t6');
      t.ok(comp ? lines.some((l) => l.who === comp) : lines.some((l) => l.who === 'hall_hatsu'), (comp || 'alone') + ': ' + (comp ? 'the companion reads the record' : 'Hatsu reads the record'));
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
      H.wrec(s, 'w5').pat = pat;
      t.eq(['hall.w5f1', 'hall.w5f2', 'hall.w5f3'].flatMap((id) => walk(s, id).out), [], 'every floor walked from its entry with the ropes up: everything on it reachable (pattern ' + pat + ')');
      for (const id of ['hall.w5f1', 'hall.w5f2']) {
        const m = C.maps[id], st = m.props.find((p) => p.p === 'stairs'), r = walk(s, id);
        t.ok(![[0, 1], [1, 0], [-1, 0], [0, -1]].some(([dx, dy]) => r.seen.has((st.x + dx) + ',' + (st.y + dy))), id + ': with the rope up, the stairs cannot be reached (no way round it)');
      }
      // with every floor cleared (and the people the trials bring out standing where they wait)
      for (const k of [0, 1, 2]) H.wrec(s, 'w5').floors[k] = true;
      for (const x of man) H.wrec(s, 'w5').trials[x.trial] = { t: 1 };
      t.eq(['hall.w5f1', 'hall.w5f2', 'hall.w5f3'].flatMap((id) => walk(s, id).out), [], 'with every floor cleared: the ways on open and everything reachable (pattern ' + pat + ')');
    }
    t.ok(!S.test(fresh(), C.maps['hall.w5f1'].exits[0].if), 'before a floor is cleared its way on is shut');
  }
};
