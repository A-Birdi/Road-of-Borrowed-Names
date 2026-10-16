// The Hall of a Hundred Tales, wing 7, The House That Remembers (expansion P15; plan 04_DUNGEONS.md D9;
// docs/future/work/P15_POSTGAME.md), with synthetic campaigns only, the scenes played through the real scene runner
// with the dialogue stubbed (lines collected, language tasks answered by the test, encounters' ends chosen by the
// test). The Hall's rules themselves are covered by hall_w1.test.mjs and hold for every wing; this covers what wing 7
// adds:
//  - the manifest: ten deliberate trials over three floors, every kind the plan asks for, each with a scene that sets
//    its floor's flag and tells the Hall;
//  - every trial end to end in both patterns, right and wrong: the things left behind, each hung under the note that
//    means it without naming it (the odd one out fits no note), the kitchen memo that names nothing, done in its
//    order (a step out of order waits; a thing the memo doesn't mean is left alone), the letter read by your companion
//    (alone, by Owan) and the one keepsake it means, the bowls fetched as the house asks for "the one" (a wrong bowl
//    or a bowl out of turn is not taken), Magoroku and Owan (he storms out, and comes back), leaving the house, the
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
    s.id = o.id || 'hall-w7-test'; s.map = 'hall.foyer'; s.comp = o.comp === undefined ? 'ren' : o.comp;
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
  const enterW7 = async (s, o = {}) => { if (o.pat != null) H.wrec(s, 'w7').pat = o.pat; if (o.route || o.tactics) H.setChoice(s, 'w7', o); RB.hooks.hall_card = async () => { s.vars._res = 1; }; await run('hall.door_w7'); return H.visitOf(s); };

  // ---- the manifest ---------------------------------------------------------------------------------------------------
  const w7 = H.get('w7');
  const man = H.manifest().filter((x) => x.wing === 'w7');
  t.eq(man.length, 10, 'wing 7 has ten trials');
  t.eq(new Set(man.map((x) => x.id)).size, 10, 'their ids are unique');
  t.ok(['story', 'counterexample', 'infogap', 'riddle', 'encounter', 'social', 'capstone', 'mechanism'].every((k) => man.some((x) => x.kind === k)), 'every kind of trial the plan asks for');
  t.ok([0, 1, 2].every((k) => man.filter((x) => x.floor === k).length >= 3) && w7.floors.length === 3, 'three floors, each with at least three trials');
  t.ok(man.filter((x) => x.reprieve).length === 1 && man.find((x) => x.reprieve).kind === 'riddle', 'the riddle earns the wing\'s reprieve');
  const allOps = Object.keys(C.scenes).filter((id) => id.startsWith('hall.w7.')).flatMap((id) => ops(id));
  for (const x of man) t.ok(allOps.includes('hook:hall_trial w7 ' + x.trial) && allOps.some((o) => o.startsWith('set:') && o.slice(4).split(' ').includes('xp_hall_w7_f' + x.floor + '_' + x.trial)), x.id + ': a scene sets its floor\'s flag and tells the Hall');
  t.ok(X.get('hall_w7') && X.get('hall_w7').kind === 'hall' && X.get('hall_w7').rules.restart === 'floor', 'the wing is an expedition of kind hall, the floor restarted on defeat');
  t.ok(['hall.w7f1', 'hall.w7f2', 'hall.w7f3'].every((id) => C.maps[id] && C.maps[id].edition === 2 && C.maps[id].music === 'hall_w7' && C.maps[id].region === 'hall_w7'), 'three floors in the twelve-chapter edition, with the wing\'s own region and music');
  t.ok(RB.audio && RB.audio._ && RB.audio._.songDefs.hall_w7, 'the wing\'s song exists');
  t.eq((C.scriptErrors || []).filter((e) => /hall/.test(e)), [], 'the Hall\'s scenes parse');
  t.ok(C.stamps['hall.w7'] && C.stamps['hall.w7'].hidden, 'its stamp, hidden until the tale is told');
  t.ok(ops('hall.door_w7').includes('hook:hall_card w7') && w7.trials.length === 10, 'the seventh alcove opens onto a told tale');
  t.ok(['no_pronoun', 'omission', 'rei_no', 'kosoado'].every((g) => RB.grammar.get(g)), 'what it practices is grammar the game teaches');

  // ---- the trials, end to end -----------------------------------------------------------------------------------------
  const HOOKN = { 0: { h1: 'book', h2: 'umbrella', h3: 'lantern', h4: 'jacket' }, 1: { h1: 'lantern', h2: 'teacup', h3: 'jacket', h4: 'book' } };
  const DECOY = { 0: 'teacup', 1: 'umbrella' };
  const NOTE_EN = { book: /finished reading it/, umbrella: /stopped raining/, lantern: /Once it's dark/, jacket: /If you're cold/, teacup: /finished drinking/ };
  const STEPS = { 0: ['kettle', 'hearth', 'teapot', 'tray'], 1: ['shutters', 'lamp', 'brazier', 'door'] };
  const KEEP = { 0: 'comb', 1: 'flute' };
  const REQ = { 0: ['rl', 'rs', 'bl'], 1: ['bs', 'rs', 'bl'] }, SPARE = { 0: 'bs', 1: 'rl' };
  const REQ_EN = { 0: [/big red one/, /small one, the same colour/, /big one of the other colour/], 1: [/small black one/, /red one, the same size/, /colour of the first/] };
  for (const pat of [0, 1]) {
    const s = fresh({ comp: 'mio', profile: 'E' });
    const v = await enterW7(s, { pat });
    const tag = ' (pattern ' + pat + ')';
    t.ok(v && v.wing === 'w7' && v.floor === 0 && warps.includes('hall.w7f1') && X.of(s) && X.of(s).id === 'hall_w7', 'going in: the first floor' + tag);
    // t1
    await run('hall.w7.t1', { answer: () => false });
    t.ok(!H.trialDone(s, 'w7', 't1') && asked[0] === 'hall.w7.story' && has(/put the pictures in order later/), 'the story room: out of order, the trial waits' + tag);
    await run('hall.w7.t1');
    t.ok(H.trialDone(s, 'w7', 't1') && asked.includes('hall.w7.story_q') && has(/nobody was there/) && has(/floating down the river/), 'the four pictures read and put back; the optional question after' + tag);
    // t2: the things left behind
    await run('hall.w7.owan');
    t.ok(lines.some((l) => l.who === 'hall_owan') && has(/Hang each one under its note/), 'Owan asks for the things to be hung under their notes' + tag);
    await run('hall.w7.h1');
    t.ok(has(NOTE_EN[HOOKN[pat].h1]), 'the first note read, naming nothing' + tag);
    await run('hall.w7.i_' + DECOY[pat]);
    await run('hall.w7.h1');
    t.ok(has(/doesn't seem to mean that/) && !s.flags.xp_hall_w7_f0_hook_h1, 'the odd one out fits no note' + tag);
    await run('hall.w7.i_' + HOOKN[pat].h2);
    await run('hall.w7.h1');
    t.ok(has(/doesn't seem to mean that/) && !s.flags.xp_hall_w7_f0_hook_h1, 'nor another note\'s thing' + tag);
    for (const h of ['h1', 'h2', 'h3', 'h4']) { await run('hall.w7.i_' + HOOKN[pat][h]); await run('hall.w7.' + h); }
    t.ok(H.trialDone(s, 'w7', 't2') && ['h1', 'h2', 'h3', 'h4'].every((h) => s.flags['xp_hall_w7_f0_hung_' + HOOKN[pat][h]]) && has(/Everything left behind is back on its hook/), 'each thing hung under the note that means it' + tag);
    // t3
    await run('hall.w7.card2');
    t.ok(lines.length === 2, 'a garden stone shows its saying in this pattern' + tag);
    await run('hall.w7.t3', { answer: () => false });
    t.ok(!H.trialDone(s, 'w7', 't3') && asked[0] === 'hall.w7.counter' + pat, 'the wrong saying not found: the stone waits' + tag);
    await run('hall.w7.t3');
    t.ok(H.trialDone(s, 'w7', 't3') && test(s, 'hall.w7.f0.clear'), 'the wrong saying found: the first floor cleared' + tag);
    // t4: the kitchen memo
    await RB.game.transition('hall.w7f2');
    t.eq(H.visitOf(s).floor, 1, 'into the house: the Rooms Within' + tag);
    await run('hall.w7.c_' + STEPS[pat][0]);
    t.ok(has(/Read it first/) && !s.flags['xp_hall_w7_f1_did_' + STEPS[pat][0]], 'before the memo is read, nothing is done' + tag);
    await run('hall.w7.memo');
    t.ok(has(pat ? /Before dark, shut \(them\)/ : /Put \(it\) on the fire/), 'the memo read: it names nothing' + tag);
    await run('hall.w7.c_' + STEPS[1 - pat][0]);
    t.ok(has(/doesn't seem to mean this/) && !s.flags['xp_hall_w7_f1_did_' + STEPS[1 - pat][0]], 'a thing the memo does not mean is left alone' + tag);
    await run('hall.w7.c_' + STEPS[pat][2]);
    t.ok(has(/that comes later/) && !s.flags['xp_hall_w7_f1_did_' + STEPS[pat][2]], 'a step out of order waits' + tag);
    for (const c of STEPS[pat]) await run('hall.w7.c_' + c);
    t.ok(H.trialDone(s, 'w7', 't4') && STEPS[pat].every((c) => s.flags['xp_hall_w7_f1_did_' + c]) && has(/Everything on the memo is done/), 'the memo done in its order, each unnamed thing found' + tag);
    // t5
    await run('hall.w7.t5');
    t.ok(H.trialDone(s, 'w7', 't5'), 'the lantern settled' + tag);
    // t6: the letter
    await run('hall.w7.m_' + KEEP[pat]);
    t.ok(!H.trialDone(s, 'w7', 't6') && has(/Have it read first/), 'before the letter is read, a keepsake is a guess' + tag);
    await run('hall.w7.t6');
    t.ok(asked[0] === 'hall.w7.ask' && s.flags.xp_hall_w7_f1_asked && lines.some((l) => l.who === 'mio') && has(/one of them is to go before the family altar/), 'you ask; Mio reads the letter' + tag);
    await run('hall.w7.m_mirror');
    t.ok(!H.trialDone(s, 'w7', 't6') && has(/doesn't seem to mean this one/) && has(/say what the letter said again/), 'the mirror: not what the letter means, and an offer to say it again' + tag);
    await run('hall.w7.m_' + KEEP[1 - pat]);
    t.ok(!H.trialDone(s, 'w7', 't6') && has(/doesn't seem to mean this one/), 'the other pattern\'s keepsake is not this one\'s' + tag);
    await run('hall.w7.m_' + KEEP[pat]);
    t.ok(H.trialDone(s, 'w7', 't6') && has(/gently before the family altar/), 'the keepsake the letter means, before the altar' + tag);
    // t7
    await run('hall.w7.t7');
    t.ok(H.trialDone(s, 'w7', 't7') && H.visitOf(s).reprieve === 1 && test(s, 'hall.w7.f1.clear'), 'the riddle: a reprieve, and the second floor cleared' + tag);
    // t10 waits
    await RB.game.transition('hall.w7f3');
    await run('hall.w7.t10');
    t.ok(!encs.length && has(/still seems to be waiting/) && has(/aren't gathered yet/) && has(/clutching a gold sake cup/), 'the house waits: the bowls first, and Magoroku' + tag);
    // t8: the bowls by the stream
    await run('hall.w7.owan3');
    t.ok(has(REQ_EN[pat][0]), 'Owan asks for the first bowl' + tag);
    await run('hall.w7.b_' + SPARE[pat]);
    t.ok(has(/Not that one/) && has(REQ_EN[pat][0]) && !s.flags['xp_hall_w7_f2_got_' + SPARE[pat]], 'the wrong bowl: Owan says it again' + tag);
    await run('hall.w7.b_' + REQ[pat][0]);
    t.ok(s.flags['xp_hall_w7_f2_got_' + REQ[pat][0]] && has(REQ_EN[pat][1]), 'the first bowl taken; the next asked for by reference to it' + tag);
    await run('hall.w7.b_' + REQ[pat][2]);
    t.ok(has(/Not that one/) && !s.flags['xp_hall_w7_f2_got_' + REQ[pat][2]], 'a bowl out of turn is not taken' + tag);
    await run('hall.w7.b_' + REQ[pat][1]); await run('hall.w7.b_' + REQ[pat][2]);
    t.ok(H.trialDone(s, 'w7', 't8') && REQ[pat].every((b) => s.flags['xp_hall_w7_f2_got_' + b]) && has(/That's all of them/), 'the three bowls fetched as the house asked' + tag);
    // t9: Magoroku and Owan
    await run('hall.w7.t9', { enc: () => ({ result: 'end', outcome: 'left' }) });
    t.ok(encs[0] === 'hall.w7.greed' && !H.trialDone(s, 'w7', 't9') && has(/he will be back/), 'Magoroku storms out into the snow; it can be tried again' + tag);
    await run('hall.w7.t9', { enc: () => ({ result: 'win', outcome: 'asked' }) });
    t.ok(H.trialDone(s, 'w7', 't9') && has(/Since I've been asked/), 'asked instead of taking: the house will think about it' + tag);
    // t10 and the end
    warps = [];
    await run('hall.w7.t10', { enc: () => ({ result: 'win', outcome: 'done' }) });
    t.ok(encs[0] === 'hall.w7.leave' && H.wingDone(s, 'w7') && s.flags.hall_w7_done && has(/never ran low/) && !H.visitOf(s) && warps.includes('hall.foyer'), 'the house left as it hoped, and the bowl gone where it was meant: the tale\'s end, back at the hearth' + tag);
    t.ok(RB.stampBook.earned(s, 'hall.w7'), 'the tale\'s stamp is earned' + tag);
  }
  {
    // Grow: the wing's tasks a level up, as stretch
    const s = fresh({ profile: 'F' });
    await enterW7(s, { pat: 0, route: 'grow' });
    await run('hall.w7.t1');
    const g = ctxOf['hall.w7.story'];
    t.ok(g && g.stretch && Array.isArray(g.steps) && g.steps.length > 0, 'on the Grow route the story room\'s task comes a level up, as stretch');
    await run('hall.w7.h1');
    t.ok(has(/\{返\|かえ\}します/), 'and the notes are a level up (with their kanji for a Foundations journey)');
    const s2 = fresh({ profile: 'E' });
    await enterW7(s2, { pat: 1 });
    await run('hall.w7.t1');
    t.ok(!(ctxOf['hall.w7.story'] || {}).stretch, 'on Consolidate, the journey\'s own level');
    await RB.ui.hall.leave(false);
  }
  {
    // each companion's voice, and alone (Owan reads the letter)
    for (const comp of ['nao', 'mio', 'ren', 'suzu', null]) {
      const s = fresh({ comp });
      await enterW7(s, { pat: 0 });
      await run('hall.w7.f1_first');
      const said = lines.filter((l) => l.who === comp).length;
      t.ok(comp ? said === 1 : said === 0 && lines.length >= 2, (comp || 'alone') + ': the first floor\'s arrival');
      await RB.game.transition('hall.w7f2');
      await run('hall.w7.t6');
      t.ok(comp ? lines.some((l) => l.who === comp) : lines.some((l) => l.who === 'hall_owan'), (comp || 'alone') + ': ' + (comp ? 'the companion reads the letter' : 'Owan reads the letter'));
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
      H.wrec(s, 'w7').pat = pat;
      t.eq(['hall.w7f1', 'hall.w7f2', 'hall.w7f3'].flatMap((id) => walk(s, id).out), [], 'every floor walked from its entry with the ropes up: everything on it reachable (pattern ' + pat + ')');
      for (const id of ['hall.w7f1', 'hall.w7f2']) {
        const m = C.maps[id], st = m.props.find((p) => p.p === 'stairs'), r = walk(s, id);
        t.ok(![[0, 1], [1, 0], [-1, 0], [0, -1]].some(([dx, dy]) => r.seen.has((st.x + dx) + ',' + (st.y + dy))), id + ': with the rope up, the stairs cannot be reached (no way round it)');
      }
      // with every floor cleared (and the people the trials bring out standing where they wait)
      for (const k of [0, 1, 2]) H.wrec(s, 'w7').floors[k] = true;
      for (const x of man) H.wrec(s, 'w7').trials[x.trial] = { t: 1 };
      t.eq(['hall.w7f1', 'hall.w7f2', 'hall.w7f3'].flatMap((id) => walk(s, id).out), [], 'with every floor cleared: the ways on open and everything reachable (pattern ' + pat + ')');
    }
    t.ok(!S.test(fresh(), C.maps['hall.w7f1'].exits[0].if), 'before a floor is cleared its way on is shut');
  }
};
