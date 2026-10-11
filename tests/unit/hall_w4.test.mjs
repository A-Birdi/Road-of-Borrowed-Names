// The Hall of a Hundred Tales, wing 4, The Borrowed Umbrella (expansion P15; plan 04_DUNGEONS.md D9;
// docs/future/work/P15_POSTGAME.md), with synthetic campaigns only, the scenes played through the real scene runner
// with the dialogue stubbed (lines collected, language tasks answered by the test, encounters' ends chosen by the
// test). The Hall's rules themselves are covered by hall_w1.test.mjs and hold for every wing; this covers what wing 4
// adds:
//  - the manifest: ten deliberate trials over three floors, every kind the plan asks for, each with a scene that sets
//    its floor's flag and tells the Hall;
//  - every trial end to end in both patterns, right and wrong: the neighbours' requests (each one handed what they
//    asked for, said outright or not; the wrong thing is simply not what they meant), Gosaku's diary followed the way
//    he went rather than the way he meant (a wrong turn starts the diary again), the river notice read by your
//    companion (alone, by Gosaku) and the one crossing it allows, the temple's rules (what you must, may and must not
//    do), the umbrella at the gate (it hops off, and comes back), the umbrella returned, the tale's end and its stamp;
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
    s.id = o.id || 'hall-w4-test'; s.map = 'hall.foyer'; s.comp = o.comp === undefined ? 'ren' : o.comp;
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
  const enterW4 = async (s, o = {}) => { if (o.pat != null) H.wrec(s, 'w4').pat = o.pat; if (o.route || o.tactics) H.setChoice(s, 'w4', o); RB.hooks.hall_card = async () => { s.vars._res = 1; }; await run('hall.door_w4'); return H.visitOf(s); };

  // ---- the manifest ---------------------------------------------------------------------------------------------------
  const w4 = H.get('w4');
  const man = H.manifest().filter((x) => x.wing === 'w4');
  t.eq(man.length, 10, 'wing 4 has ten trials');
  t.eq(new Set(man.map((x) => x.id)).size, 10, 'their ids are unique');
  t.ok(['story', 'counterexample', 'infogap', 'riddle', 'encounter', 'social', 'capstone', 'mechanism'].every((k) => man.some((x) => x.kind === k)), 'every kind of trial the plan asks for');
  t.ok([0, 1, 2].every((k) => man.filter((x) => x.floor === k).length >= 3) && w4.floors.length === 3, 'three floors, each with at least three trials');
  t.ok(man.filter((x) => x.reprieve).length === 1 && man.find((x) => x.reprieve).kind === 'riddle', 'the riddle earns the wing\'s reprieve');
  const allOps = Object.keys(C.scenes).filter((id) => id.startsWith('hall.w4.')).flatMap((id) => ops(id));
  for (const x of man) t.ok(allOps.includes('hook:hall_trial w4 ' + x.trial) && allOps.some((o) => o.startsWith('set:') && o.slice(4).split(' ').includes('xp_hall_w4_f' + x.floor + '_' + x.trial)), x.id + ': a scene sets its floor\'s flag and tells the Hall');
  t.ok(X.get('hall_w4') && X.get('hall_w4').kind === 'hall' && X.get('hall_w4').rules.restart === 'floor', 'the wing is an expedition of kind hall, the floor restarted on defeat');
  t.ok(['hall.w4f1', 'hall.w4f2', 'hall.w4f3'].every((id) => C.maps[id] && C.maps[id].edition === 2 && C.maps[id].music === 'hall_w4' && C.maps[id].region === 'hall_w4'), 'three floors in the twelve-chapter edition, with the wing\'s own region and music');
  t.ok(RB.audio && RB.audio._ && RB.audio._.songDefs.hall_w4, 'the wing\'s song exists');
  t.eq((C.scriptErrors || []).filter((e) => /hall/.test(e)), [], 'the Hall\'s scenes parse');
  t.ok(C.stamps['hall.w4'] && C.stamps['hall.w4'].hidden, 'its stamp, hidden until the tale is told');
  t.ok(ops('hall.door_w4').includes('hook:hall_card w4') && w4.trials.length === 10, 'the fourth alcove opens onto a told tale');

  // ---- the trials, end to end -----------------------------------------------------------------------------------------
  const NEEDS = { 0: { oume: 'mino', otake: 'towel', kyubei: 'lamp', kaede: 'sandals' }, 1: { oume: 'sandals', otake: 'lamp', kyubei: 'towel', kaede: 'mino' } };
  const RIGHT = { 0: { f1: 'bank', f2: 'woods', f3: 'ferry' }, 1: { f1: 'bridge', f2: 'teahouse', f3: 'hut' } };
  const FORK = { f1: ['bridge', 'bank'], f2: ['teahouse', 'woods'], f3: ['ferry', 'hut'] };
  const ALLOW = { 0: 'ford', 1: 'boat' };
  for (const pat of [0, 1]) {
    const s = fresh({ comp: 'mio', profile: 'E' });
    const v = await enterW4(s, { pat });
    const tag = ' (pattern ' + pat + ')';
    t.ok(v && v.wing === 'w4' && v.floor === 0 && warps.includes('hall.w4f1') && X.of(s) && X.of(s).id === 'hall_w4', 'going in: the first floor' + tag);
    // t1
    await run('hall.w4.t1', { answer: () => false });
    t.ok(!H.trialDone(s, 'w4', 't1') && asked[0] === 'hall.w4.story' && has(/put the pictures in order later/), 'the story room: out of order, the trial waits' + tag);
    await run('hall.w4.t1');
    t.ok(H.trialDone(s, 'w4', 't1') && asked.includes('hall.w4.story_q') && has(/borrowed an umbrella/), 'the four pictures read and put back; the optional question after' + tag);
    // t2: the neighbours' requests
    await run('hall.w4.gosaku1');
    t.ok(has(/won't say it straight out/), 'Gosaku warns that some won\'t say what they need outright' + tag);
    const wrongItem = ['mino', 'towel', 'lamp', 'sandals'].find((i) => i !== NEEDS[pat].oume);
    await run('hall.w4.i_' + wrongItem);
    await run('hall.w4.n_oume');
    t.ok(has(/not that/) && !s.flags.xp_hall_w4_f0_served_oume, 'handed the wrong thing: not what she meant (nothing else happens)' + tag);
    for (const w of Object.keys(NEEDS[pat])) { await run('hall.w4.i_' + NEEDS[pat][w]); await run('hall.w4.n_' + w); }
    t.ok(H.trialDone(s, 'w4', 't2') && Object.keys(NEEDS[pat]).every((w) => s.flags['xp_hall_w4_f0_served_' + w]) && has(/all gone home/), 'each neighbour handed what they asked for' + tag);
    // t3
    await run('hall.w4.card2');
    t.ok(lines.length === 2, 'a card shows its sentence in this pattern' + tag);
    await run('hall.w4.t3', { answer: () => false });
    t.ok(!H.trialDone(s, 'w4', 't3') && asked[0] === 'hall.w4.counter' + pat, 'the wrong card not found: the stone waits' + tag);
    await run('hall.w4.t3');
    t.ok(H.trialDone(s, 'w4', 't3') && test(s, 'hall.w4.f0.clear'), 'the wrong card found: the first floor cleared' + tag);
    // t4: the diary
    await RB.game.transition('hall.w4f2');
    t.eq(H.visitOf(s).floor, 1, 'up the road: the Closed River' + tag);
    await run('hall.w4.t4_diary');
    t.ok(has(pat ? /I meant to walk along the bank/ : /I meant to cross the bridge/), 'the diary read' + tag);
    await run('hall.w4.f2_' + RIGHT[pat].f2);
    t.ok(has(/hasn't got this far/) && !s.flags.xp_hall_w4_f1_s2, 'the second fork before the first: the diary hasn\'t got that far' + tag);
    const wrong1 = FORK.f1.find((x) => x !== RIGHT[pat].f1);
    await run('hall.w4.f1_' + wrong1);
    t.ok(has(/don't seem to go this way/) && !s.flags.xp_hall_w4_f1_s1, 'the way he meant, not the way he went: no footprints' + tag);
    for (const f of ['f1', 'f2', 'f3']) await run('hall.w4.' + f + '_' + RIGHT[pat][f]);
    t.ok(H.trialDone(s, 'w4', 't4') && has(/hat half buried/), 'followed the way he really went: his hat in the mud' + tag);
    // t5
    await run('hall.w4.t5');
    t.ok(H.trialDone(s, 'w4', 't5'), 'the reeds quietened' + tag);
    // t6: the river notice
    await run('hall.w4.x_' + ALLOW[pat]);
    t.ok(!H.trialDone(s, 'w4', 't6') && has(/don't know yet whether you may cross/), 'before the notice is read, a crossing is just a crossing' + tag);
    await run('hall.w4.t6');
    t.ok(asked[0] === 'hall.w4.ask' && s.flags.xp_hall_w4_f1_asked && lines.some((l) => l.who === 'mio') && has(pat ? /Crossing by boat is allowed/ : /The ford may be crossed/), 'you ask; Mio reads the notice' + tag);
    await run('hall.w4.x_bridge');
    t.ok(!H.trialDone(s, 'w4', 't6') && has(/may not be crossed today/), 'the bridge: not allowed today, and an offer to say it again' + tag);
    await run('hall.w4.x_' + ALLOW[pat]);
    t.ok(H.trialDone(s, 'w4', 't6') && has(/the crossing the notice allows/), 'the crossing the notice allows: marked for Gosaku' + tag);
    // t7
    await run('hall.w4.t7');
    t.ok(H.trialDone(s, 'w4', 't7') && H.visitOf(s).reprieve === 1 && test(s, 'hall.w4.f1.clear'), 'the riddle: a reprieve, and the second floor cleared' + tag);
    // t10 waits
    await RB.game.transition('hall.w4f3');
    await run('hall.w4.t10');
    t.ok(!encs.length && has(/rules board/) && has(/red umbrella still stands/), 'Myōshin waits: the rules first, and the umbrella still at the gate' + tag);
    // t8: the temple's rules
    await run('hall.w4.t8_rules');
    t.ok(has(pat ? /You may ring the bell, once only/ : /Wash your hands before entering/), 'the rules read' + tag);
    if (pat === 0) {
      await run('hall.w4.r_bell');
      t.ok(has(/not to ring it/) && !s.flags.xp_hall_w4_f2_rang, 'the bell: the rules say not to ring it' + tag);
      await run('hall.w4.r_door');
      t.ok(has(/before washing your hands/) && !H.trialDone(s, 'w4', 't8'), 'the hall before washing: not yet' + tag);
      await run('hall.w4.r_stone');
      t.ok(has(/need not take off your sandals/), 'sandals: you need not' + tag);
      await run('hall.w4.r_basin');
    } else {
      await run('hall.w4.r_basin');
      t.ok(has(/there's no need/) && !s.flags.xp_hall_w4_f2_washed, 'the basin: no need today' + tag);
      await run('hall.w4.r_bell'); await run('hall.w4.r_bell');
      t.ok(s.flags.xp_hall_w4_f2_rang && has(/Once only/), 'the bell rung once; a second time, the rules say no' + tag);
      await run('hall.w4.r_door');
      t.ok(has(/before taking off your sandals/) && !H.trialDone(s, 'w4', 't8'), 'the hall in sandals: not yet' + tag);
      await run('hall.w4.r_stone');
    }
    await run('hall.w4.r_door');
    t.ok(H.trialDone(s, 'w4', 't8') && has(/Keeping the rules/), 'into the hall, keeping the rules' + tag);
    // t9: the umbrella at the gate
    await run('hall.w4.t9', { enc: () => ({ result: 'end', outcome: 'ran' }) });
    t.ok(encs[0] === 'hall.w4.kasa' && !H.trialDone(s, 'w4', 't9') && has(/Only the rain answers/), 'told it has no say, it hops off; it will be back' + tag);
    await run('hall.w4.t9', { enc: () => ({ result: 'win', outcome: 'understood' }) });
    t.ok(H.trialDone(s, 'w4', 't9') && has(/He meant to bring me back/), 'told what he meant and what stopped him, it understands' + tag);
    // t10 and the end
    warps = [];
    await run('hall.w4.t10', { enc: () => ({ result: 'win', outcome: 'done' }) });
    t.ok(encs[0] === 'hall.w4.return' && H.wingDone(s, 'w4') && s.flags.hall_w4_done && has(/open proudly over his head/) && !H.visitOf(s) && warps.includes('hall.foyer'), 'the umbrella returned, and lent again: the tale\'s end, back at the hearth' + tag);
    t.ok(RB.stampBook.earned(s, 'hall.w4'), 'the tale\'s stamp is earned' + tag);
  }
  {
    // Grow: the wing's tasks a level up, as stretch
    const s = fresh({ profile: 'F' });
    await enterW4(s, { pat: 0, route: 'grow' });
    await run('hall.w4.t1');
    const g = ctxOf['hall.w4.story'];
    t.ok(g && g.stretch && Array.isArray(g.steps) && g.steps.length > 0, 'on the Grow route the story room\'s task comes a level up, as stretch');
    await run('hall.w4.n_oume');
    t.ok(has(/\{蓑\|みの\}/) && has(/もらえます か/), 'and the neighbours ask a level up (a polite request with its reason for a Foundations journey)');
    const s2 = fresh({ profile: 'E' });
    await enterW4(s2, { pat: 1 });
    await run('hall.w4.t1');
    t.ok(!(ctxOf['hall.w4.story'] || {}).stretch, 'on Consolidate, the journey\'s own level');
    await RB.ui.hall.leave(false);
  }
  {
    // each companion's voice, and alone (Gosaku reads the notice)
    for (const comp of ['nao', 'mio', 'ren', 'suzu', null]) {
      const s = fresh({ comp });
      await enterW4(s, { pat: 0 });
      await run('hall.w4.f1_first');
      const said = lines.filter((l) => l.who === comp).length;
      t.ok(comp ? said === 1 : said === 0 && lines.length >= 2, (comp || 'alone') + ': the first floor\'s arrival');
      await RB.game.transition('hall.w4f2');
      await run('hall.w4.t6');
      t.ok(comp ? lines.some((l) => l.who === comp) : lines.some((l) => l.who === 'hall_gosaku'), (comp || 'alone') + ': ' + (comp ? 'the companion reads the notice' : 'Gosaku reads the notice'));
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
      H.wrec(s, 'w4').pat = pat;
      t.eq(['hall.w4f1', 'hall.w4f2', 'hall.w4f3'].flatMap((id) => walk(s, id).out), [], 'every floor walked from its entry with the ropes up: everything on it reachable (pattern ' + pat + ')');
      for (const id of ['hall.w4f1', 'hall.w4f2']) {
        const m = C.maps[id], st = m.props.find((p) => p.p === 'stairs'), r = walk(s, id);
        t.ok(![[0, 1], [1, 0], [-1, 0], [0, -1]].some(([dx, dy]) => r.seen.has((st.x + dx) + ',' + (st.y + dy))), id + ': with the rope up, the stairs cannot be reached (no way round it)');
      }
      // with every floor cleared (and the people the trials bring out standing where they wait)
      for (const k of [0, 1, 2]) H.wrec(s, 'w4').floors[k] = true;
      for (const x of man) H.wrec(s, 'w4').trials[x.trial] = { t: 1 };
      t.eq(['hall.w4f1', 'hall.w4f2', 'hall.w4f3'].flatMap((id) => walk(s, id).out), [], 'with every floor cleared: the ways on open and everything reachable (pattern ' + pat + ')');
    }
    t.ok(!S.test(fresh(), C.maps['hall.w4f1'].exits[0].if), 'before a floor is cleared its way on is shut');
  }
};
