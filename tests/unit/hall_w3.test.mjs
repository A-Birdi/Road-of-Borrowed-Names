// The Hall of a Hundred Tales, wing 3, The Bell Before Dawn (expansion P15; plan 04_DUNGEONS.md D9;
// docs/future/work/P15_POSTGAME.md), with synthetic campaigns only, the scenes played through the real scene runner
// with the dialogue stubbed (lines collected, language tasks answered by the test, encounters' ends chosen by the
// test). The Hall's rules themselves are covered by hall_w1.test.mjs and hold for every wing; this covers what wing 3
// adds:
//  - the manifest: ten deliberate trials over three floors, every kind the plan asks for, each with a scene that sets
//    its floor's flag and tells the Hall;
//  - every trial end to end in both patterns, right and wrong: Jinbei's note done in the order it means (out of
//    order, everything starts again), the incense clock burned hour by hour with each thing on the slate done at its
//    hour (too early, too late, and a new stick that starts the night again), the almanac read by your companion
//    (alone, by Shino) and Shino's lantern on the right hook, the cub found where it was seen last, Mame's drum (she
//    leaves, and comes back), the dawn bell at the almanac's hour, the tale's end and its stamp;
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
    s.id = o.id || 'hall-w3-test'; s.map = 'hall.foyer'; s.comp = o.comp === undefined ? 'ren' : o.comp;
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
  const enterW3 = async (s, o = {}) => { if (o.pat != null) H.wrec(s, 'w3').pat = o.pat; if (o.route || o.tactics) H.setChoice(s, 'w3', o); RB.hooks.hall_card = async () => { s.vars._res = 1; }; await run('hall.door_w3'); return H.visitOf(s); };

  // ---- the manifest ---------------------------------------------------------------------------------------------------
  const w3 = H.get('w3');
  const man = H.manifest().filter((x) => x.wing === 'w3');
  t.eq(man.length, 10, 'wing 3 has ten trials');
  t.eq(new Set(man.map((x) => x.id)).size, 10, 'their ids are unique');
  t.ok(['story', 'counterexample', 'infogap', 'riddle', 'encounter', 'social', 'capstone', 'mechanism'].every((k) => man.some((x) => x.kind === k)), 'every kind of trial the plan asks for');
  t.ok([0, 1, 2].every((k) => man.filter((x) => x.floor === k).length >= 3) && w3.floors.length === 3, 'three floors, each with at least three trials');
  t.ok(man.filter((x) => x.reprieve).length === 1 && man.find((x) => x.reprieve).kind === 'riddle', 'the riddle earns the wing\'s reprieve');
  const allOps = Object.keys(C.scenes).filter((id) => id.startsWith('hall.w3.')).flatMap((id) => ops(id));
  for (const x of man) t.ok(allOps.includes('hook:hall_trial w3 ' + x.trial) && allOps.some((o) => o.startsWith('set:') && o.slice(4).split(' ').includes('xp_hall_w3_f' + x.floor + '_' + x.trial)), x.id + ': a scene sets its floor\'s flag and tells the Hall');
  t.ok(X.get('hall_w3') && X.get('hall_w3').kind === 'hall' && X.get('hall_w3').rules.restart === 'floor', 'the wing is an expedition of kind hall, the floor restarted on defeat');
  t.ok(['hall.w3f1', 'hall.w3f2', 'hall.w3f3'].every((id) => C.maps[id] && C.maps[id].edition === 2 && C.maps[id].music === 'hall_w3' && C.maps[id].region === 'hall_w3'), 'three floors in the twelve-chapter edition, with the wing\'s own region and music');
  t.ok(RB.audio && RB.audio._ && RB.audio._.songDefs.hall_w3, 'the wing\'s song exists');
  t.eq((C.scriptErrors || []).filter((e) => /hall/.test(e)), [], 'the Hall\'s scenes parse');
  t.ok(C.stamps['hall.w3'] && C.stamps['hall.w3'].hidden, 'its stamp, hidden until the tale is told');
  t.ok(ops('hall.door_w3').includes('hook:hall_card w3') && w3.trials.length === 10, 'the third alcove opens onto a told tale');
  t.ok(RB.grammar.get('uchi_ni') && RB.grammar.get('shidai'), 'the two grammar points the wing introduces (～うちに, ～次第) are in the grammar notes');

  // ---- the trials, end to end -----------------------------------------------------------------------------------------
  const ORDER = { 0: ['water', 'lamp', 'wood', 'priest'], 1: ['lamp', 'water', 'priest', 'wood'] };
  const HIDE = { 0: 'wood', 1: 'well' }, WITNESS = { 0: 'sukezo', 1: 'osho' };
  const HOOK = { 0: 'h1', 1: 'h2' };
  const hour = (s) => [1, 2, 3].find((h) => s.flags['xp_hall_w3_f1_h' + h]) || 0;
  for (const pat of [0, 1]) {
    const s = fresh({ comp: 'mio', profile: 'E' });
    const v = await enterW3(s, { pat });
    const tag = ' (pattern ' + pat + ')';
    t.ok(v && v.wing === 'w3' && v.floor === 0 && warps.includes('hall.w3f1') && X.of(s) && X.of(s).id === 'hall_w3', 'going in: the first floor' + tag);
    // t1
    await run('hall.w3.t1', { answer: () => false });
    t.ok(!H.trialDone(s, 'w3', 't1') && asked[0] === 'hall.w3.story' && has(/put the pictures in order later/), 'the story room: out of order, the trial waits' + tag);
    await run('hall.w3.t1');
    t.ok(H.trialDone(s, 'w3', 't1') && asked.includes('hall.w3.story_q') && has(/fell ill/), 'the four pictures read and put back; the optional question after' + tag);
    // t2: Jinbei's note, done in the order it means
    await run('hall.w3.jinbei');
    t.ok(has(/order it says, not the order it's written/), 'Jinbei says the note means an order of its own' + tag);
    await run('hall.w3.t2_note');
    t.ok(has(pat ? /First light the stone lantern/ : /First draw water/), 'the note read' + tag);
    await run('hall.w3.c_' + ORDER[pat][0]);
    await run('hall.w3.c_' + ORDER[pat][2]);
    t.ok(has(/Not that yet/) && !s.flags['xp_hall_w3_f0_did_' + ORDER[pat][0]] && !H.trialDone(s, 'w3', 't2'), 'out of order: everything starts again (nothing else happens)' + tag);
    for (const c of ORDER[pat]) await run('hall.w3.c_' + c);
    t.ok(H.trialDone(s, 'w3', 't2') && has(/in the order the note means/), 'in the order the note means: done' + tag);
    // t3
    await run('hall.w3.card3');
    t.ok(lines.length === 2, 'a saying shows its sentence in this pattern' + tag);
    await run('hall.w3.t3', { answer: () => false });
    t.ok(!H.trialDone(s, 'w3', 't3') && asked[0] === 'hall.w3.counter' + pat, 'the wrong saying not found: the stone waits' + tag);
    await run('hall.w3.t3');
    t.ok(H.trialDone(s, 'w3', 't3') && test(s, 'hall.w3.f0.clear'), 'the wrong saying found: the first floor cleared' + tag);
    // t4: the incense clock
    await RB.game.transition('hall.w3f2');
    t.eq(H.visitOf(s).floor, 1, 'up the steps: the Night Slope' + tag);
    await run('hall.w3.t4_slate');
    t.ok(has(pat ? /Before the moon goes down, light the bridge light/ : /In the late night, set dumplings/) && has(/it is night/), 'the slate read, and the hour shown' + tag);
    if (pat === 0) {
      for (let i = 0; i < 3; i++) await run('hall.w3.clock');
      t.eq(hour(s), 3, 'the incense burned to its third mark: the first cock-crow' + tag);
      await run('hall.w3.h_gate');
      t.ok(has(/too late/) && !s.flags.xp_hall_w3_f1_d_gate, 'the gate after the cock-crow: too late by the slate' + tag);
      await run('hall.w3.clock');
      t.ok(hour(s) === 0 && has(/new stick/), 'a new stick starts the night again' + tag);
      await run('hall.w3.h_bridge');
      t.ok(has(/too early/) && !s.flags.xp_hall_w3_f1_d_bridge, 'the bridge light before moonset: too early' + tag);
      await run('hall.w3.h_gate');
      await run('hall.w3.clock'); await run('hall.w3.h_jizo');
      await run('hall.w3.clock'); await run('hall.w3.h_bridge');
    } else {
      await run('hall.w3.h_bridge');
      await run('hall.w3.clock'); await run('hall.w3.h_jizo');
      t.ok(has(/too early/) && !s.flags.xp_hall_w3_f1_d_jizo, 'the offering in the late night: too early by this slate' + tag);
      await run('hall.w3.clock'); await run('hall.w3.h_jizo'); await run('hall.w3.h_gate');
      t.ok(has(/too early/) && !s.flags.xp_hall_w3_f1_d_gate, 'the gate before the cock-crow: too early' + tag);
      await run('hall.w3.clock'); await run('hall.w3.h_gate');
    }
    t.ok(H.trialDone(s, 'w3', 't4') && has(/each at its hour/), 'everything on the slate done at its hour' + tag);
    // t5
    await run('hall.w3.t5');
    t.ok(H.trialDone(s, 'w3', 't5'), 'the moths scattered' + tag);
    // t6: the almanac and the hour post
    await run('hall.w3.t6_' + HOOK[pat]);
    t.ok(!H.trialDone(s, 'w3', 't6') && has(/don't know yet which hour/), 'before the almanac is read, a hook is just a hook' + tag);
    await run('hall.w3.t6');
    t.ok(asked[0] === 'hall.w3.ask' && s.flags.xp_hall_w3_f1_asked && lines.some((l) => l.who === 'mio') && has(pat ? /after the first cock-crow and before the second/ : /ring before the first cock-crow/), 'you ask; Mio reads the almanac' + tag);
    await run('hall.w3.t6_h3');
    t.ok(!H.trialDone(s, 'w3', 't6') && has(/isn't the hour the almanac gave/), 'the wrong hook: not the almanac\'s hour, and an offer to say it again' + tag);
    await run('hall.w3.t6_' + HOOK[pat]);
    t.ok(H.trialDone(s, 'w3', 't6') && s.flags['xp_hall_w3_f1_hung_' + HOOK[pat]] && has(/hang Shino's lantern/), 'the right hook: Shino\'s lantern hung' + tag);
    // t7
    await run('hall.w3.t7');
    t.ok(H.trialDone(s, 'w3', 't7') && H.visitOf(s).reprieve === 1 && test(s, 'hall.w3.f1.clear'), 'the riddle: a reprieve, and the second floor cleared' + tag);
    // t10 waits
    await RB.game.transition('hall.w3f3');
    await run('hall.w3.t10');
    t.ok(!encs.length && has(/hangs in silence/) && has(/drumming goes on/) && has(/someone small is lost/), 'the bell waits for the drum to stop and the child to be found' + tag);
    // t8: the cub, where it was seen last
    await run('hall.w3.w_' + WITNESS[pat]);
    t.ok(has(/After the moon went down/), 'the last sighting: after moonset' + tag);
    const wrong = ['steps', 'wood', 'well'].find((p) => p !== HIDE[pat]);
    await run('hall.w3.hide_' + wrong);
    t.ok(!H.trialDone(s, 'w3', 't8') && has(/Who saw it last/), 'the wrong place: who saw it last?' + tag);
    await run('hall.w3.hide_' + HIDE[pat]);
    t.ok(H.trialDone(s, 'w3', 't8') && lines.some((l) => l.who === 'hall_kobu'), 'found where it was seen last' + tag);
    // t9: Mame
    await run('hall.w3.t9', { enc: () => ({ result: 'end', outcome: 'ran' }) });
    t.ok(encs[0] === 'hall.w3.mame' && !H.trialDone(s, 'w3', 't9') && has(/drumming goes on/), 'told to stop, she goes; she will be back' + tag);
    await run('hall.w3.t9', { enc: () => ({ result: 'win', outcome: 'promised' }) });
    t.ok(H.trialDone(s, 'w3', 't9') && has(/By dawn/), 'promised her child by dawn, she stops' + tag);
    // t10 and the end
    warps = [];
    await run('hall.w3.t10', { enc: () => ({ result: 'win', outcome: 'done' }) });
    t.ok(encs[0] === 'hall.w3.bell' + pat && H.wingDone(s, 'w3') && s.flags.hall_w3_done && has(/Jinbei smiles/) && !H.visitOf(s) && warps.includes('hall.foyer'), 'the bell at the almanac\'s hour: the tale\'s end, back at the hearth' + tag);
    t.ok(RB.stampBook.earned(s, 'hall.w3'), 'the tale\'s stamp is earned' + tag);
  }
  {
    // the dawn bell's two versions follow the almanac
    const steps = (p) => C.encounters['hall.w3.bell' + p].procedure.steps.map((x) => x.id);
    t.eq(steps(0), ['b1', 'b2', 'b3', 'b4'], 'before the first cock-crow: ring at the fading stars');
    t.eq(steps(1), ['b1', 'b2', 'b2b', 'b3', 'b4'], 'between the cock-crows: wait for the first, then ring');
  }
  {
    // Grow: the wing's tasks a level up, as stretch
    const s = fresh({ profile: 'F' });
    await enterW3(s, { pat: 0, route: 'grow' });
    await run('hall.w3.t1');
    const g = ctxOf['hall.w3.story'];
    t.ok(g && g.stretch && Array.isArray(g.steps) && g.steps.length > 0, 'on the Grow route the story room\'s task comes a level up, as stretch');
    await run('hall.w3.t2_note');
    t.ok(has(/前\|まえ\} に/), 'and the note is written a level up (前に and てから for a Foundations journey)');
    const s2 = fresh({ profile: 'E' });
    await enterW3(s2, { pat: 1 });
    await run('hall.w3.t1');
    t.ok(!(ctxOf['hall.w3.story'] || {}).stretch, 'on Consolidate, the journey\'s own level');
    await RB.ui.hall.leave(false);
  }
  {
    // each companion's voice, and alone (Shino reads the almanac)
    for (const comp of ['nao', 'mio', 'ren', 'suzu', null]) {
      const s = fresh({ comp });
      await enterW3(s, { pat: 0 });
      await run('hall.w3.f1_first');
      const said = lines.filter((l) => l.who === comp).length;
      t.ok(comp ? said === 1 : said === 0 && lines.length >= 2, (comp || 'alone') + ': the first floor\'s arrival');
      await RB.game.transition('hall.w3f2');
      await run('hall.w3.t6');
      t.ok(comp ? lines.some((l) => l.who === comp) : lines.some((l) => l.who === 'hall_shino'), (comp || 'alone') + ': ' + (comp ? 'the companion reads the almanac' : 'Shino reads the almanac'));
      await RB.ui.hall.leave(false);
    }
  }

  // ---- the old incense clock (W14, src/content/zzz_verbs/11_prod_b.js): a mechanism of the run --------------------------
  // Watched and adjusted in its sheet; its state is the visit's (src/engine/98h_hall.js mechanism): it starts afresh
  // with every visit and when the floor starts again, and is kept with a held floor. Solved, its scene counts the
  // floor's puzzle trial (t7) as the riddle stone does; the riddle stone still counts it alone.
  {
    const FW = RB.fieldweave, id = 'hall_w3_censer';
    const sheet = RB.verbSheets.open;
    let opened = 0;
    RB.verbSheets.open = async () => { opened++; return null; };
    const adj = (s) => FW.stateOf(s, id).adj;
    t.ok(RB.verbs.get(id) && RB.verbs.get(id).kind === 'observe' && w3.floors[1].mechanisms.includes(id) && X.get('hall_w3').mechanisms.includes(id), 'the incense clock is an observation puzzle and a mechanism of the second floor');
    t.ok(C.maps['hall.w3f2'].props.some((p) => p.o && p.o.vb === id && p.scene === 'hall.w3.vb_censer' && p.mech), 'it opens through its own scene, as a mechanism (creatures keep still by it)');
    const s = fresh();
    t.ok(!FW.eligible(s, id), 'outside a visit it is not there');
    await enterW3(s, { pat: 0 });
    await RB.game.transition('hall.w3f2');
    t.ok(FW.eligible(s, id), 'in a visit it is');
    FW.act(s, id, 'adjust:swap');
    t.eq(adj(s), 'swap', 'an adjustment made');
    H.resetFloor(s, 'w3', 1);
    t.eq([adj(s), FW.peek(s, id).virtual], ['', true], 'the floor starts again: the clock as it was found');
    FW.act(s, id, 'adjust:heap');
    t.ok(!FW.peek(s, id).done, 'heaping the powder does not mend it');
    await run('hall.w3.vb_censer');
    t.ok(opened === 1 && !H.trialDone(s, 'w3', 't7') && has(/rings once, at moonset twice/), 'the stand\'s words, the sheet, and nothing counted while it is wrong');
    FW.act(s, id, 'adjust:heap'); FW.act(s, id, 'adjust:fill'); FW.act(s, id, 'adjust:swap');
    t.ok(FW.peek(s, id).done, 'the bells swapped and the break filled: once, twice, three times');
    await run('hall.w3.vb_censer');
    t.ok(H.trialDone(s, 'w3', 't7') && s.flags.xp_hall_w3_f1_t7 && H.visitOf(s).reprieve === 1, 'solved: it counts the floor\'s puzzle trial, with its reprieve, like the riddle');
    t.ok(!has(/rings once, at moonset twice/) && has(/in order/), 'opened again once solved: no stand text, the bell rings in order');
    await RB.ui.hall.leave(false);
    t.ok(!(s.discovery && s.discovery.puzzles[id]), 'leaving the wing: the clock\'s state goes with the visit');
    await enterW3(s, { pat: 0 });
    await RB.game.transition('hall.w3f2');
    t.ok(!FW.peek(s, id).done && adj(s) === '', 'the next visit finds it as it was found');
    // held with a reprieve: kept exactly
    const s3 = fresh();
    await enterW3(s3, { pat: 0 });
    await RB.game.transition('hall.w3f2');
    await run('hall.w3.t7');
    FW.act(s3, id, 'adjust:fill');
    H.retreat(s3, { keep: true });
    t.ok(!(s3.discovery && s3.discovery.puzzles[id]) && H.wrec(s3, 'w3').held.puzzles[id], 'leaving with the reprieve: the clock is held with the floor');
    const back = H.enter(s3, 'w3', { held: true });
    t.ok(back && back.held && adj(s3) === 'fill', 'and comes back exactly as it was');
    H.retreat(s3, {});
    // the riddle stone alone still counts t7
    const s4 = fresh();
    await enterW3(s4, { pat: 1 });
    await RB.game.transition('hall.w3f2');
    await run('hall.w3.t7');
    t.ok(H.trialDone(s4, 'w3', 't7') && !(s4.discovery && s4.discovery.puzzles[id] && s4.discovery.puzzles[id].done), 'the riddle stone still counts the trial without the clock');
    await run('hall.w3.vb_censer');
    t.ok(H.visitOf(s4).reprieve === 1, 'and the clock, opened after, counts nothing twice');
    await RB.ui.hall.leave(false);
    RB.verbSheets.open = sheet;
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
      H.wrec(s, 'w3').pat = pat;
      t.eq(['hall.w3f1', 'hall.w3f2', 'hall.w3f3'].flatMap((id) => walk(s, id).out), [], 'every floor walked from its entry with the ropes up: everything on it reachable (pattern ' + pat + ')');
      for (const id of ['hall.w3f1', 'hall.w3f2']) {
        const m = C.maps[id], st = m.props.find((p) => p.p === 'stairs'), r = walk(s, id);
        t.ok(![[0, 1], [1, 0], [-1, 0], [0, -1]].some(([dx, dy]) => r.seen.has((st.x + dx) + ',' + (st.y + dy))), id + ': with the rope up, the stairs cannot be reached (no way round it)');
      }
      // with every floor cleared (and the people the trials bring out standing where they wait)
      for (const k of [0, 1, 2]) H.wrec(s, 'w3').floors[k] = true;
      for (const x of man) H.wrec(s, 'w3').trials[x.trial] = { t: 1 };
      t.eq(['hall.w3f1', 'hall.w3f2', 'hall.w3f3'].flatMap((id) => walk(s, id).out), [], 'with every floor cleared: the ways on open and everything reachable (pattern ' + pat + ')');
    }
    t.ok(!S.test(fresh(), C.maps['hall.w3f1'].exits[0].if), 'before a floor is cleared its way on is shut');
  }
};
