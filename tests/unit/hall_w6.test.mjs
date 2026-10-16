// The Hall of a Hundred Tales, wing 6, The Toll That Changed (expansion P15; plan 04_DUNGEONS.md D9;
// docs/future/work/P15_POSTGAME.md), with synthetic campaigns only, the scenes played through the real scene runner
// with the dialogue stubbed (lines collected, language tasks answered by the test, encounters' ends chosen by the
// test). The Hall's rules themselves are covered by hall_w1.test.mjs and hold for every wing; this covers what wing 6
// adds:
//  - the manifest: ten deliberate trials over three floors, every kind the plan asks for, each with a scene that sets
//    its floor's flag and tells the Hall;
//  - every trial end to end in both patterns, right and wrong: four travellers each given the tag the toll board says
//    they owe (a wrong tag is caught by Ibuki), the pass's lanterns lit by the rule and today's sky (the one the rule's
//    exception leaves dark will not light), Kihei's ledger read by your companion (alone, by Ibuki) and the one
//    traveller it lets go on after dark, the help board's cases hung beside what the toll house does (a case that does
//    not fit will not hang), Ibuki and Otsuta (Ibuki shuts themself away, and can be talked round), the night at the
//    gate, the tale's end and its stamp;
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
    s.id = o.id || 'hall-w6-test'; s.map = 'hall.foyer'; s.comp = o.comp === undefined ? 'ren' : o.comp;
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
  const enterW6 = async (s, o = {}) => { if (o.pat != null) H.wrec(s, 'w6').pat = o.pat; if (o.route || o.tactics) H.setChoice(s, 'w6', o); RB.hooks.hall_card = async () => { s.vars._res = 1; }; await run('hall.door_w6'); return H.visitOf(s); };

  // ---- the manifest ---------------------------------------------------------------------------------------------------
  const w6 = H.get('w6');
  const man = H.manifest().filter((x) => x.wing === 'w6');
  t.eq(man.length, 10, 'wing 6 has ten trials');
  t.eq(new Set(man.map((x) => x.id)).size, 10, 'their ids are unique');
  t.ok(['story', 'counterexample', 'infogap', 'riddle', 'encounter', 'social', 'capstone', 'mechanism'].every((k) => man.some((x) => x.kind === k)), 'every kind of trial the plan asks for');
  t.ok([0, 1, 2].every((k) => man.filter((x) => x.floor === k).length >= 3) && w6.floors.length === 3, 'three floors, each with at least three trials');
  t.ok(man.filter((x) => x.reprieve).length === 1 && man.find((x) => x.reprieve).kind === 'riddle', 'the riddle earns the wing\'s reprieve');
  const allOps = Object.keys(C.scenes).filter((id) => id.startsWith('hall.w6.')).flatMap((id) => ops(id));
  for (const x of man) t.ok(allOps.includes('hook:hall_trial w6 ' + x.trial) && allOps.some((o) => o.startsWith('set:') && o.slice(4).split(' ').includes('xp_hall_w6_f' + x.floor + '_' + x.trial)), x.id + ': a scene sets its floor\'s flag and tells the Hall');
  t.ok(X.get('hall_w6') && X.get('hall_w6').kind === 'hall' && X.get('hall_w6').rules.restart === 'floor', 'the wing is an expedition of kind hall, the floor restarted on defeat');
  t.ok(['hall.w6f1', 'hall.w6f2', 'hall.w6f3'].every((id) => C.maps[id] && C.maps[id].edition === 2 && C.maps[id].music === 'hall_w6' && C.maps[id].region === 'hall_w6'), 'three floors in the twelve-chapter edition, with the wing\'s own region and music');
  t.ok(RB.audio && RB.audio._ && RB.audio._.songDefs.hall_w6, 'the wing\'s song exists');
  t.eq((C.scriptErrors || []).filter((e) => /hall/.test(e)), [], 'the Hall\'s scenes parse');
  t.ok(C.stamps['hall.w6'] && C.stamps['hall.w6'].hidden, 'its stamp, hidden until the tale is told');
  t.ok(ops('hall.door_w6').includes('hook:hall_card w6') && w6.trials.length === 10, 'the sixth alcove opens onto a told tale');
  t.ok(['baai', 'igai', 'kagiri', 'cond_nara', 'cond_tara', 'cond_ba', 'cond_to', 'temo', 'prt_sae'].every((g) => RB.grammar.get(g)), 'the conditions and exceptions it practices are grammar the game teaches');

  // ---- the trials, end to end -----------------------------------------------------------------------------------------
  const ANS = { 0: { ofuku: 'two', hanbei: 'free', koun: 'one', momo: 'one' }, 1: { ofuku: 'free', hanbei: 'two', koun: 'two', momo: 'free' } };
  const LAMPS = ['foot', 'bend', 'bridge', 'shrine', 'top'], DARK = { 0: 'bridge', 1: 'shrine' };
  const ALLOW = { 0: 'momo', 1: 'koun' };
  const HOOKR = { 0: { h1: 'dark', h2: 'sick', h3: 'rain', h4: 'lost' }, 1: { h1: 'cold', h2: 'rain', h3: 'sick', h4: 'dark' } };
  const DECOY = { 0: 'cold', 1: 'lost' };
  for (const pat of [0, 1]) {
    const s = fresh({ comp: 'mio', profile: 'E' });
    const v = await enterW6(s, { pat });
    const tag = ' (pattern ' + pat + ')';
    t.ok(v && v.wing === 'w6' && v.floor === 0 && warps.includes('hall.w6f1') && X.of(s) && X.of(s).id === 'hall_w6', 'going in: the first floor' + tag);
    // t1
    await run('hall.w6.t1', { answer: () => false });
    t.ok(!H.trialDone(s, 'w6', 't1') && asked[0] === 'hall.w6.story' && has(/put the pictures in order later/), 'the story room: out of order, the trial waits' + tag);
    await run('hall.w6.t1');
    t.ok(H.trialDone(s, 'w6', 't1') && asked.includes('hall.w6.story_q') && has(/one mon, for anyone/) && has(/written nowhere/), 'the four pictures read and put back; the optional question after' + tag);
    // t2: the toll board and four travellers
    await run('hall.w6.board');
    t.ok(has(/One mon a head/) && has(/even with a load/) && lines.length === 5, 'the toll board read: four rules at the journey\'s level' + tag);
    await run('hall.w6.n_ofuku');
    t.ok(has(pat ? /I live in the pass village/ : /medicine box on my back/) && lines.some((l) => l.who === 'hall_ofuku'), 'Ofuku says how she comes' + tag);
    const wrongTag = ['free', 'one', 'two'].find((g) => g !== ANS[pat].ofuku);
    await run('hall.w6.tag_' + wrongTag);
    await run('hall.w6.n_ofuku');
    t.ok(has(/Read the board again/) && lines.some((l) => l.who === 'hall_ibuki') && !s.flags.xp_hall_w6_f0_served_ofuku, 'the wrong tag: Ibuki catches it' + tag);
    for (const w of ['ofuku', 'hanbei', 'koun', 'momo']) { await run('hall.w6.tag_' + ANS[pat][w]); await run('hall.w6.n_' + w); }
    t.ok(H.trialDone(s, 'w6', 't2') && ['ofuku', 'hanbei', 'koun', 'momo'].every((w) => s.flags['xp_hall_w6_f0_served_' + w]) && has(/All four have paid/), 'each traveller given the tag the board says they owe' + tag);
    // t3
    await run('hall.w6.card2');
    t.ok(lines.length === 2, 'a waymarker shows its saying in this pattern' + tag);
    await run('hall.w6.t3', { answer: () => false });
    t.ok(!H.trialDone(s, 'w6', 't3') && asked[0] === 'hall.w6.counter' + pat, 'the wrong saying not found: the stone waits' + tag);
    await run('hall.w6.t3');
    t.ok(H.trialDone(s, 'w6', 't3') && test(s, 'hall.w6.f0.clear'), 'the wrong saying found: the first floor cleared' + tag);
    // t4: the lanterns of the pass
    await RB.game.transition('hall.w6f2');
    t.eq(H.visitOf(s).floor, 1, 'up the road: the Pass at Dusk' + tag);
    await run('hall.w6.l_foot');
    t.ok(has(/Read the board on the post first/) && !s.flags.xp_hall_w6_f1_lit_foot, 'before the rule is read, a lantern waits' + tag);
    await run('hall.w6.t4_rule');
    t.ok(has(pat ? /shrine lantern only on a festival day/ : /leave the bridge lantern dark/), 'the lighting rule read' + tag);
    await run('hall.w6.sky');
    t.ok(has(/festival is tomorrow/) && has(pat ? /there is no wind/ : /strong wind/), 'today\'s sky, and the festival notice' + tag);
    await run('hall.w6.l_' + DARK[pat]);
    t.ok(has(/Check the rule, and today's sky/) && !s.flags['xp_hall_w6_f1_lit_' + DARK[pat]], 'the lantern the exception leaves dark will not light' + tag);
    for (const l of LAMPS.filter((x) => x !== DARK[pat])) await run('hall.w6.l_' + l);
    t.ok(H.trialDone(s, 'w6', 't4') && has(/just as the rule says/) && s.flags['xp_hall_w6_f1_lit_' + DARK[1 - pat]], 'every other lantern lit (the other pattern\'s exception lit here): the trial done' + tag);
    // t5
    await run('hall.w6.t5');
    t.ok(H.trialDone(s, 'w6', 't5'), 'the mist cleared' + tag);
    // t6: Kihei's ledger
    await run('hall.w6.x_' + ALLOW[pat]);
    t.ok(!H.trialDone(s, 'w6', 't6') && has(/Have Kihei's ledger read first/), 'before the ledger is read, nobody is let on' + tag);
    await run('hall.w6.t6');
    t.ok(asked[0] === 'hall.w6.ask' && s.flags.xp_hall_w6_f1_asked && lines.some((l) => l.who === 'mio') && has(pat ? /nobody goes on alone/ : /nobody goes on without a lantern/), 'you ask; Mio reads the ledger' + tag);
    await run('hall.w6.x_hanbei');
    t.ok(!H.trialDone(s, 'w6', 't6') && has(/can't let them through now/) && has(/say what the ledger said again/), 'Hanbei, alone and with no lantern: not by the ledger, and an offer to say it again' + tag);
    await run('hall.w6.x_' + ALLOW[1 - pat]);
    t.ok(!H.trialDone(s, 'w6', 't6') && has(/can't let them through now/), 'the other pattern\'s traveller is not this one\'s' + tag);
    await run('hall.w6.x_' + ALLOW[pat]);
    t.ok(H.trialDone(s, 'w6', 't6') && has(/As the ledger allows/), 'the one the ledger lets go on after dark' + tag);
    // t7
    await run('hall.w6.t7');
    t.ok(H.trialDone(s, 'w6', 't7') && H.visitOf(s).reprieve === 1 && test(s, 'hall.w6.f1.clear'), 'the riddle: a reprieve, and the second floor cleared' + tag);
    // t10 waits
    await RB.game.transition('hall.w6f3');
    await run('hall.w6.t10');
    t.ok(!encs.length && has(/haven't settled/) && has(/still lying on the ground/) && has(/holding her baby/), 'the night waits: the help board first, and Otsuta at the gate' + tag);
    // t8: the help board
    await run('hall.w6.t8_board');
    t.ok(has(/help board/), 'the help board read' + tag);
    await run('hall.w6.pl_' + DECOY[pat]);
    await run('hall.w6.h1');
    t.ok(has(/doesn't go with this/) && !s.flags.xp_hall_w6_f2_hook_h1, 'a case that fits no hook will not hang' + tag);
    const near = HOOKR[pat].h2;
    await run('hall.w6.pl_' + near);
    await run('hall.w6.h1');
    t.ok(has(/doesn't go with this/) && !s.flags.xp_hall_w6_f2_hook_h1, 'nor a real case on the wrong hook' + tag);
    for (const h of ['h1', 'h2', 'h3', 'h4']) { await run('hall.w6.pl_' + HOOKR[pat][h]); await run('hall.w6.' + h); }
    t.ok(H.trialDone(s, 'w6', 't8') && ['h1', 'h2', 'h3', 'h4'].every((h) => s.flags['xp_hall_w6_f2_hung_' + HOOKR[pat][h]]) && has(/whole again/), 'each case hung beside what the toll house does for it' + tag);
    // t9: Ibuki and Otsuta
    await run('hall.w6.t9', { enc: () => ({ result: 'end', outcome: 'shut' }) });
    t.ok(encs[0] === 'hall.w6.night' && !H.trialDone(s, 'w6', 't9') && has(/Otsuta rocks her baby/), 'Ibuki shuts themself in the guard hut; it can be tried again' + tag);
    await run('hall.w6.t9', { enc: () => ({ result: 'win', outcome: 'through' }) });
    t.ok(H.trialDone(s, 'w6', 't9') && has(/goes down into the dark/) && has(/I was afraid/), 'talked round: the gate opens for Otsuta' + tag);
    // t10 and the end
    warps = [];
    await run('hall.w6.t10', { enc: () => ({ result: 'win', outcome: 'done' }) });
    t.ok(encs[0] === 'hall.w6.watch' && H.wingDone(s, 'w6') && s.flags.hall_w6_done && has(/fever has broken/) && !H.visitOf(s) && warps.includes('hall.foyer'), 'the night kept and the last rule written: the tale\'s end, back at the hearth' + tag);
    t.ok(RB.stampBook.earned(s, 'hall.w6'), 'the tale\'s stamp is earned' + tag);
  }
  {
    // Grow: the wing's tasks a level up, as stretch
    const s = fresh({ profile: 'F' });
    await enterW6(s, { pat: 0, route: 'grow' });
    await run('hall.w6.t1');
    const g = ctxOf['hall.w6.story'];
    t.ok(g && g.stretch && Array.isArray(g.steps) && g.steps.length > 0, 'on the Grow route the story room\'s task comes a level up, as stretch');
    await run('hall.w6.n_ofuku');
    t.ok(has(/\{薬\|くすり\}/) && has(/\{麓\|ふもと\}/), 'and the travellers speak a level up (with their kanji for a Foundations journey)');
    const s2 = fresh({ profile: 'E' });
    await enterW6(s2, { pat: 1 });
    await run('hall.w6.t1');
    t.ok(!(ctxOf['hall.w6.story'] || {}).stretch, 'on Consolidate, the journey\'s own level');
    await RB.ui.hall.leave(false);
  }
  {
    // each companion's voice, and alone (Ibuki reads the ledger)
    for (const comp of ['nao', 'mio', 'ren', 'suzu', null]) {
      const s = fresh({ comp });
      await enterW6(s, { pat: 0 });
      await run('hall.w6.f1_first');
      const said = lines.filter((l) => l.who === comp).length;
      t.ok(comp ? said === 1 : said === 0 && lines.length >= 2, (comp || 'alone') + ': the first floor\'s arrival');
      await RB.game.transition('hall.w6f2');
      await run('hall.w6.t6');
      t.ok(comp ? lines.some((l) => l.who === comp) : lines.some((l) => l.who === 'hall_ibuki'), (comp || 'alone') + ': ' + (comp ? 'the companion reads the ledger' : 'Ibuki reads the ledger'));
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
      H.wrec(s, 'w6').pat = pat;
      t.eq(['hall.w6f1', 'hall.w6f2', 'hall.w6f3'].flatMap((id) => walk(s, id).out), [], 'every floor walked from its entry with the ropes up: everything on it reachable (pattern ' + pat + ')');
      for (const id of ['hall.w6f1', 'hall.w6f2']) {
        const m = C.maps[id], st = m.props.find((p) => p.p === 'stairs'), r = walk(s, id);
        t.ok(![[0, 1], [1, 0], [-1, 0], [0, -1]].some(([dx, dy]) => r.seen.has((st.x + dx) + ',' + (st.y + dy))), id + ': with the rope up, the stairs cannot be reached (no way round it)');
      }
      // with every floor cleared (and the people the trials bring out standing where they wait)
      for (const k of [0, 1, 2]) H.wrec(s, 'w6').floors[k] = true;
      for (const x of man) H.wrec(s, 'w6').trials[x.trial] = { t: 1 };
      t.eq(['hall.w6f1', 'hall.w6f2', 'hall.w6f3'].flatMap((id) => walk(s, id).out), [], 'with every floor cleared: the ways on open and everything reachable (pattern ' + pat + ')');
    }
    t.ok(!S.test(fresh(), C.maps['hall.w6f1'].exits[0].if), 'before a floor is cleared its way on is shut');
  }
};
