// The Hall of a Hundred Tales, wing 8, Three Witnesses at the Inn (expansion P15; plan 04_DUNGEONS.md D9;
// docs/future/work/P15_POSTGAME.md), with synthetic campaigns only, the scenes played through the real scene runner
// with the dialogue stubbed (lines collected, language tasks answered by the test, choices and encounters' ends chosen
// by the test). The Hall's rules themselves are covered by hall_w1.test.mjs and hold for every wing; this covers what
// wing 8 adds:
//  - the manifest: ten deliberate trials over three floors, every kind the plan asks for, each with a scene that sets
//    its floor's flag and tells the Hall;
//  - every trial end to end in both patterns, right and wrong: the witnesses' words sorted by how each one knows (a
//    slip in the wrong tray stays out), the witnesses' places (an account judged wrongly is looked at again), Hisa's
//    note read by your companion (alone, by Omatsu) and the one road it points to, the footprints named from the
//    evidence (a tag on the wrong prints is not set down), Saki and Gonroku (he goes off in a huff, and comes back),
//    the record of the night, the tale's end and its stamp;
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
    s.id = o.id || 'hall-w8-test'; s.map = 'hall.foyer'; s.comp = o.comp === undefined ? 'ren' : o.comp;
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
  const enterW8 = async (s, o = {}) => { if (o.pat != null) H.wrec(s, 'w8').pat = o.pat; if (o.route || o.tactics) H.setChoice(s, 'w8', o); RB.hooks.hall_card = async () => { s.vars._res = 1; }; await run('hall.door_w8'); return H.visitOf(s); };

  // ---- the manifest ---------------------------------------------------------------------------------------------------
  const w8 = H.get('w8');
  const man = H.manifest().filter((x) => x.wing === 'w8');
  t.eq(man.length, 10, 'wing 8 has ten trials');
  t.eq(new Set(man.map((x) => x.id)).size, 10, 'their ids are unique');
  t.ok(['story', 'counterexample', 'infogap', 'riddle', 'encounter', 'social', 'capstone', 'mechanism'].every((k) => man.some((x) => x.kind === k)), 'every kind of trial the plan asks for');
  t.ok([0, 1, 2].every((k) => man.filter((x) => x.floor === k).length >= 3) && w8.floors.length === 3, 'three floors, each with at least three trials');
  t.ok(man.filter((x) => x.reprieve).length === 1 && man.find((x) => x.reprieve).kind === 'riddle', 'the riddle earns the wing\'s reprieve');
  const allOps = Object.keys(C.scenes).filter((id) => id.startsWith('hall.w8.')).flatMap((id) => ops(id));
  for (const x of man) t.ok(allOps.includes('hook:hall_trial w8 ' + x.trial) && allOps.some((o) => o.startsWith('set:') && o.slice(4).split(' ').includes('xp_hall_w8_f' + x.floor + '_' + x.trial)), x.id + ': a scene sets its floor\'s flag and tells the Hall');
  t.ok(X.get('hall_w8') && X.get('hall_w8').kind === 'hall' && X.get('hall_w8').rules.restart === 'floor', 'the wing is an expedition of kind hall, the floor restarted on defeat');
  t.ok(['hall.w8f1', 'hall.w8f2', 'hall.w8f3'].every((id) => C.maps[id] && C.maps[id].edition === 2 && C.maps[id].music === 'hall_w8' && C.maps[id].region === 'hall_w8'), 'three floors in the twelve-chapter edition, with the wing\'s own region and music');
  t.ok(RB.audio && RB.audio._ && RB.audio._.songDefs.hall_w8, 'the wing\'s song exists');
  t.eq((C.scriptErrors || []).filter((e) => /hall/.test(e)), [], 'the Hall\'s scenes parse');
  t.ok(C.stamps['hall.w8'] && C.stamps['hall.w8'].hidden, 'its stamp, hidden until the tale is told');
  t.ok(ops('hall.door_w8').includes('hook:hall_card w8') && w8.trials.length === 10, 'the eighth alcove opens onto a told tale');
  t.ok(['sou_hear', 'sou_look', 'rashii', 'you_mitai', 'hazu', 'kamo', 'ni_chigainai', 'to_no_koto'].every((g) => RB.grammar.get(g)), 'what it practises is grammar the game teaches');

  // ---- the trials, end to end -----------------------------------------------------------------------------------------
  const SLIPCAT = { 0: { s1: 'seen', s2: 'heard', s3: 'told', s4: 'guess', s5: 'seen' }, 1: { s1: 'heard', s2: 'seen', s3: 'told', s4: 'told', s5: 'guess' } };
  const HOLDSUP = { 0: { kitchen: true, stairs: true, backdoor: false }, 1: { kitchen: true, stairs: false, backdoor: true } };
  const ROAD = { 0: 'east', 1: 'west' };
  const WEAR = { tosuke: 'boots', gonroku: 'geta', saki: 'zori', hisa: 'sandals' };
  const PRINTK = { 0: { pr1: 'boots', pr2: 'geta', pr3: 'sandals', pr4: 'zori' }, 1: { pr1: 'zori', pr2: 'sandals', pr3: 'boots', pr4: 'geta' } };
  const judge = async (spot, holds) => { RB.ui.dialogue.choose = async () => (holds ? 0 : 1); await run('hall.w8.p_' + spot); RB.ui.dialogue.choose = async () => 0; };
  for (const pat of [0, 1]) {
    const s = fresh({ comp: 'mio', profile: 'E' });
    const v = await enterW8(s, { pat });
    const tag = ' (pattern ' + pat + ')';
    t.ok(v && v.wing === 'w8' && v.floor === 0 && warps.includes('hall.w8f1') && X.of(s) && X.of(s).id === 'hall_w8', 'going in: the first floor' + tag);
    // t1
    await run('hall.w8.t1', { answer: () => false });
    t.ok(!H.trialDone(s, 'w8', 't1') && asked[0] === 'hall.w8.story' && has(/put the pictures in order later/), 'the story room: out of order, the trial waits' + tag);
    await run('hall.w8.t1');
    t.ok(H.trialDone(s, 'w8', 't1') && asked.includes('hall.w8.story_q') && has(/box left in safekeeping vanished/) && has(/small footprints came into view/), 'the four pictures read and put back; the optional question after' + tag);
    // t2: the slips sorted by how each one knows
    await run('hall.w8.omatsu');
    t.ok(lines.some((l) => l.who === 'hall_omatsu') && has(/Would you sort them/), 'Omatsu asks for the accounts to be sorted' + tag);
    await run('hall.w8.s1');
    t.ok(has(pat ? /heard the back door open/ : /saw a small shadow/), 'the first slip read' + tag);
    const wrongTray = ['seen', 'heard', 'told', 'guess'].find((k) => k !== SLIPCAT[pat].s1);
    await run('hall.w8.to_' + wrongTray);
    t.ok(has(/doesn't fit this tray/) && !s.flags.xp_hall_w8_f0_put_s1, 'a slip in the wrong tray stays out' + tag);
    for (const sl of ['s1', 's2', 's3', 's4', 's5']) { await run('hall.w8.' + sl); await run('hall.w8.to_' + SLIPCAT[pat][sl]); }
    t.ok(H.trialDone(s, 'w8', 't2') && ['s1', 's2', 's3', 's4', 's5'].every((sl) => s.flags['xp_hall_w8_f0_put_' + sl]) && has(/sorted into the four trays/), 'every slip sorted by how its witness knows' + tag);
    // t3
    await run('hall.w8.card2');
    t.ok(lines.length === 2, 'a scroll shows its saying in this pattern' + tag);
    await run('hall.w8.t3', { answer: () => false });
    t.ok(!H.trialDone(s, 'w8', 't3') && asked[0] === 'hall.w8.counter' + pat, 'the wrong saying not found: the scroll waits' + tag);
    await run('hall.w8.t3');
    t.ok(H.trialDone(s, 'w8', 't3') && test(s, 'hall.w8.f0.clear'), 'the wrong saying found: the first floor cleared' + tag);
    // t4: the witnesses' places
    await RB.game.transition('hall.w8f2');
    t.eq(H.visitOf(s).floor, 1, 'out into the snowy yard' + tag);
    await judge('backdoor', !HOLDSUP[pat].backdoor);
    t.ok(has(pat ? /can only be lifted from inside/ : /bar is broken/) && has(/Check once more/) && !s.flags.xp_hall_w8_f1_judged_backdoor, 'the back door judged wrongly: look again' + tag);
    for (const sp of ['kitchen', 'stairs', 'backdoor']) await judge(sp, HOLDSUP[pat][sp]);
    t.ok(H.trialDone(s, 'w8', 't4') && has(/All three accounts are checked/), 'each account weighed against its place' + tag);
    // t5
    await run('hall.w8.t5');
    t.ok(H.trialDone(s, 'w8', 't5') && has(/not a fox's/), 'the snow fox leaves no prints' + tag);
    // t6: Hisa's note
    await run('hall.w8.r_' + ROAD[pat]);
    t.ok(!H.trialDone(s, 'w8', 't6') && has(/Read the note first/), 'before the note is read, a road is a guess' + tag);
    await run('hall.w8.t6');
    t.ok(asked[0] === 'hall.w8.ask' && s.flags.xp_hall_w8_f1_asked && lines.some((l) => l.who === 'mio') && has(pat ? /teahouse on the pass/ : /in the next village/), 'you ask; Mio reads the note' + tag);
    await run('hall.w8.r_shrine');
    t.ok(!H.trialDone(s, 'w8', 't6') && has(/doesn't seem to point this way/) && has(/say what the note said again/), 'the shrine path: not the note\'s, and an offer to say it again' + tag);
    await run('hall.w8.r_' + ROAD[1 - pat]);
    t.ok(!H.trialDone(s, 'w8', 't6') && has(/doesn't seem to point this way/), 'the other pattern\'s road is not this one\'s' + tag);
    await run('hall.w8.r_' + ROAD[pat]);
    t.ok(H.trialDone(s, 'w8', 't6') && has(/hang a lantern at the head of the road/), 'the road the note points to, a lantern hung for the way back' + tag);
    // t7
    await run('hall.w8.t7');
    t.ok(H.trialDone(s, 'w8', 't7') && H.visitOf(s).reprieve === 1 && test(s, 'hall.w8.f1.clear'), 'the riddle: a reprieve, and the second floor cleared' + tag);
    // t10 waits
    await RB.game.transition('hall.w8f3');
    await run('hall.w8.t10');
    t.ok(!encs.length && has(/too soon to write/) && has(/Nobody yet knows whose prints/) && has(/still glaring/), 'the record waits: the prints first, and Saki and Gonroku' + tag);
    // t8: the footprints
    await run('hall.w8.t8_board');
    t.ok(has(/Saki saw him/) && has(/clattered in the corridor/), 'the evidence board read' + tag);
    const wrongPr = ['pr1', 'pr2', 'pr3', 'pr4'].find((pr) => PRINTK[pat][pr] !== WEAR.hisa);
    await run('hall.w8.tag_hisa'); await run('hall.w8.' + wrongPr);
    t.ok(has(/don't match what the board says/) && !s.flags['xp_hall_w8_f2_print_' + wrongPr], 'a name by the wrong prints is not set down' + tag);
    for (const pr of ['pr1', 'pr2', 'pr3', 'pr4']) { const w = Object.keys(WEAR).find((x) => WEAR[x] === PRINTK[pat][pr]); await run('hall.w8.tag_' + w); await run('hall.w8.' + pr); }
    t.ok(H.trialDone(s, 'w8', 't8') && Object.keys(WEAR).every((w) => s.flags['xp_hall_w8_f2_named_' + w]) && has(/Four sets of prints, four names/), 'each set of prints named from the evidence' + tag);
    // t9: Saki and Gonroku
    await run('hall.w8.t9', { enc: () => ({ result: 'end', outcome: 'left' }) });
    t.ok(encs[0] === 'hall.w8.quarrel' && !H.trialDone(s, 'w8', 't9') && has(/rakes the brazier ash/), 'Gonroku goes off in a huff; it can be tried again' + tag);
    await run('hall.w8.t9', { enc: () => ({ result: 'win', outcome: 'agreed' }) });
    t.ok(H.trialDone(s, 'w8', 't9') && has(/sorry I raised my voice/), 'it may have been Hisa: they make it up' + tag);
    // t10 and the end
    warps = [];
    await run('hall.w8.t10', { enc: () => ({ result: 'win', outcome: 'done' }) });
    t.ok(encs[0] === 'hall.w8.record' && H.wingDone(s, 'w8') && s.flags.hall_w8_done && has(/This child brought me the box/) && !H.visitOf(s) && warps.includes('hall.foyer'), 'the night written down, and Hisa back with the box\'s owner: the tale\'s end, back at the hearth' + tag);
    t.ok(RB.stampBook.earned(s, 'hall.w8'), 'the tale\'s stamp is earned' + tag);
  }
  {
    // Grow: the wing's tasks a level up, as stretch
    const s = fresh({ profile: 'F' });
    await enterW8(s, { pat: 0, route: 'grow' });
    await run('hall.w8.t1');
    const g = ctxOf['hall.w8.story'];
    t.ok(g && g.stretch && Array.isArray(g.steps) && g.steps.length > 0, 'on the Grow route the story room\'s task comes a level up, as stretch');
    await run('hall.w8.s1');
    t.ok(has(/\{台所\|だいどころ\}/), 'and the slips are a level up (with their kanji for a Foundations journey)');
    const s2 = fresh({ profile: 'E' });
    await enterW8(s2, { pat: 1 });
    await run('hall.w8.t1');
    t.ok(!(ctxOf['hall.w8.story'] || {}).stretch, 'on Consolidate, the journey\'s own level');
    await RB.ui.hall.leave(false);
  }
  {
    // each companion's voice, and alone (Omatsu has the note read with you)
    for (const comp of ['nao', 'mio', 'ren', 'suzu', null]) {
      const s = fresh({ comp });
      await enterW8(s, { pat: 0 });
      await run('hall.w8.f1_first');
      const said = lines.filter((l) => l.who === comp).length;
      t.ok(comp ? said === 1 : said === 0 && lines.length >= 2, (comp || 'alone') + ': the first floor\'s arrival');
      await RB.game.transition('hall.w8f2');
      await run('hall.w8.t6');
      t.ok(comp ? lines.some((l) => l.who === comp) : lines.some((l) => l.who === 'hall_omatsu'), (comp || 'alone') + ': ' + (comp ? 'the companion reads the note' : 'Omatsu reads the note with you'));
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
      H.wrec(s, 'w8').pat = pat;
      t.eq(['hall.w8f1', 'hall.w8f2', 'hall.w8f3'].flatMap((id) => walk(s, id).out), [], 'every floor walked from its entry with the ropes up: everything on it reachable (pattern ' + pat + ')');
      for (const id of ['hall.w8f1', 'hall.w8f2']) {
        const m = C.maps[id], st = m.props.find((p) => p.p === 'stairs'), r = walk(s, id);
        t.ok(![[0, 1], [1, 0], [-1, 0], [0, -1]].some(([dx, dy]) => r.seen.has((st.x + dx) + ',' + (st.y + dy))), id + ': with the rope up, the stairs cannot be reached (no way round it)');
      }
      // with every floor cleared (and the people the trials bring out standing where they wait)
      for (const k of [0, 1, 2]) H.wrec(s, 'w8').floors[k] = true;
      for (const x of man) H.wrec(s, 'w8').trials[x.trial] = { t: 1 };
      t.eq(['hall.w8f1', 'hall.w8f2', 'hall.w8f3'].flatMap((id) => walk(s, id).out), [], 'with every floor cleared: the ways on open and everything reachable (pattern ' + pat + ')');
    }
    t.ok(!S.test(fresh(), C.maps['hall.w8f1'].exits[0].if), 'before a floor is cleared its way on is shut');
  }
};
