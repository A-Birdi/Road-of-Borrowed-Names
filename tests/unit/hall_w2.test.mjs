// The Hall of a Hundred Tales, wing 2, The Fox's Wedding (expansion P15; plan 04_DUNGEONS.md D9;
// docs/future/work/P15_POSTGAME.md), with synthetic campaigns only, the scenes played through the real scene runner
// with the dialogue stubbed (lines collected, language tasks answered by the test, encounters' ends chosen by the
// test). The Hall's rules themselves (floors, defeat, retreat, reprieve, practice, the note, suspend) are covered by
// hall_w1.test.mjs and hold for every wing; this covers what wing 2 adds:
//  - the manifest: ten deliberate trials over three floors, every kind the plan asks for, each with a scene that sets
//    its floor's flag and tells the Hall; the wing built with the kit (src/content/hall/05_kit.js);
//  - every trial end to end in both patterns, right and wrong: the gifts carried to the trays their tags name, the
//    procession called out in the card's order (out of order, everyone drifts back), Sayo's seat from the seating
//    list read by your companion (alone, by Toku), the borrowed things returned to whoever lent them, Konta's
//    umbrella (he hides, and comes back), the cup passed round, the tale's end and its stamp;
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
    s.id = o.id || 'hall-w2-test'; s.map = 'hall.foyer'; s.comp = o.comp === undefined ? 'ren' : o.comp;
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
  const enterW2 = async (s, o = {}) => { if (o.pat != null) H.wrec(s, 'w2').pat = o.pat; if (o.route || o.tactics) H.setChoice(s, 'w2', o); RB.hooks.hall_card = async () => { s.vars._res = 1; }; await run('hall.door_w2'); return H.visitOf(s); };

  // ---- the manifest ---------------------------------------------------------------------------------------------------
  const w2 = H.get('w2');
  const man = H.manifest().filter((x) => x.wing === 'w2');
  t.eq(man.length, 10, 'wing 2 has ten trials');
  t.eq(new Set(man.map((x) => x.id)).size, 10, 'their ids are unique');
  t.ok(['story', 'counterexample', 'infogap', 'riddle', 'encounter', 'social', 'capstone', 'mechanism'].every((k) => man.some((x) => x.kind === k)), 'every kind of trial the plan asks for');
  t.ok([0, 1, 2].every((k) => man.filter((x) => x.floor === k).length >= 3) && w2.floors.length === 3, 'three floors, each with at least three trials');
  t.ok(man.filter((x) => x.reprieve).length === 1 && man.find((x) => x.reprieve).kind === 'riddle', 'the riddle earns the wing\'s reprieve');
  const allOps = Object.keys(C.scenes).filter((id) => id.startsWith('hall.w2.')).flatMap((id) => ops(id));
  for (const x of man) t.ok(allOps.includes('hook:hall_trial w2 ' + x.trial) && allOps.some((o) => o.startsWith('set:') && o.slice(4).split(' ').includes('xp_hall_w2_f' + x.floor + '_' + x.trial)), x.id + ': a scene sets its floor\'s flag and tells the Hall');
  t.ok(X.get('hall_w2') && X.get('hall_w2').kind === 'hall' && X.get('hall_w2').rules.restart === 'floor', 'the wing is an expedition of kind hall, the floor restarted on defeat');
  t.ok(['hall.w2f1', 'hall.w2f2', 'hall.w2f3'].every((id) => C.maps[id] && C.maps[id].edition === 2 && C.maps[id].music === 'hall_w2' && C.maps[id].region === 'hall_w2'), 'three floors in the twelve-chapter edition, with the wing\'s own region and music');
  t.ok(RB.audio && RB.audio._ && RB.audio._.songDefs.hall_w2, 'the wing\'s song exists');
  t.eq((C.scriptErrors || []).filter((e) => /hall/.test(e)), [], 'the Hall\'s scenes parse');
  t.ok(C.stamps['hall.w2'] && C.stamps['hall.w2'].hidden, 'its stamp, hidden until the tale is told');
  t.ok(ops('hall.door_w2').includes('hook:hall_card w2') && w2.trials.length === 10, 'the second alcove opens onto a told tale (its card, not "not ready yet")');

  // ---- the trials, end to end -----------------------------------------------------------------------------------------
  const ORD = { 0: ['bearer', 'toku', 'kozue', 'gin', 'porter'], 1: ['toku', 'bearer', 'gin', 'kozue', 'porter'] };
  const TRAY = { 0: { red: 'groom', white: 'mother', chestnut: 'toku' }, 1: { red: 'toku', white: 'groom', chestnut: 'mother' } };
  const OWNER = { 0: { umbrella: 'sayo', lantern: 'toku', cup: 'konta' }, 1: { umbrella: 'konta', lantern: 'sayo', cup: 'toku' } };
  for (const pat of [0, 1]) {
    const s = fresh({ comp: 'mio', profile: 'E' });
    const v = await enterW2(s, { pat });
    const tag = ' (pattern ' + pat + ')';
    t.ok(v && v.wing === 'w2' && v.floor === 0 && warps.includes('hall.w2f1') && X.of(s) && X.of(s).id === 'hall_w2', 'going in: the first floor' + tag);
    // t1: the tale in four pictures
    await run('hall.w2.t1', { answer: () => false });
    t.ok(!H.trialDone(s, 'w2', 't1') && asked[0] === 'hall.w2.story' && has(/put the pictures in order later/), 'the story room: out of order, the trial waits' + tag);
    await run('hall.w2.t1');
    t.ok(H.trialDone(s, 'w2', 't1') && asked.includes('hall.w2.story_q') && has(/Only Sayo lent the bride her umbrella/), 'the four pictures read and put back; the optional question after' + tag);
    // t2: the gifts carried to the trays their tags name
    const wrongTray = (g) => ['groom', 'mother', 'toku'].find((x) => x !== TRAY[pat][g]);
    await run('hall.w2.g_red');
    t.ok(s.flags.xp_hall_w2_f0_hold_red && has(pat ? /From the groom, to the go-between/ : /From the bride, to the groom/), 'the red bundle\'s tag read, the bundle picked up' + tag);
    await run('hall.w2.tray_' + wrongTray('red'));
    t.ok(has(/doesn't seem to belong here/) && s.flags.xp_hall_w2_f0_hold_red && !s.flags.xp_hall_w2_f0_put_red, 'the wrong tray: read the tag again (you still hold it)' + tag);
    await run('hall.w2.g_white');
    t.ok(s.flags.xp_hall_w2_f0_hold_white && !s.flags.xp_hall_w2_f0_hold_red, 'picking up another gift puts the first down' + tag);
    for (const g of ['red', 'white', 'chestnut']) { await run('hall.w2.g_' + g); await run('hall.w2.tray_' + TRAY[pat][g]); }
    t.ok(H.trialDone(s, 'w2', 't2') && ['red', 'white', 'chestnut'].every((g) => s.flags['xp_hall_w2_f0_put_' + g]) && has(/each on the right tray/), 'each gift on the tray its tag names' + tag);
    // t3: the go-between's cards
    await run('hall.w2.card2');
    t.ok(lines.length === 2, 'a practice card shows its sentence in this pattern' + tag);
    await run('hall.w2.t3', { answer: () => false });
    t.ok(!H.trialDone(s, 'w2', 't3') && asked[0] === 'hall.w2.counter' + pat, 'the wrong card not found: the stone waits' + tag);
    await run('hall.w2.t3');
    t.ok(H.trialDone(s, 'w2', 't3') && test(s, 'hall.w2.f0.clear'), 'the wrong card found: the first floor cleared' + tag);
    // t4: the procession in the card's order
    await RB.game.transition('hall.w2f2');
    t.eq(H.visitOf(s).floor, 1, 'up the steps: the Procession Road' + tag);
    await run('hall.w2.t4_card');
    t.ok(has(pat ? /At the front, the go-between/ : /At the front, the lantern-bearer/), 'the card gives the order' + tag);
    await run('hall.w2.l4_' + ORD[pat][0]);
    await run('hall.w2.l4_' + ORD[pat][2]);
    t.ok(has(/That's not the order/) && !s.flags['xp_hall_w2_f1_sent_' + ORD[pat][0]] && !H.trialDone(s, 'w2', 't4'), 'out of order: everyone drifts back, and you can start again' + tag);
    for (const r of ORD[pat]) await run('hall.w2.l4_' + r);
    t.ok(H.trialDone(s, 'w2', 't4') && ORD[pat].every((r, i) => s.flags['xp_hall_w2_f1_at_' + r + '_' + (i + 1)]) && has(/procession stands complete/), 'in order: each in their place on the road' + tag);
    await run('hall.w2.l4_' + ORD[pat][0]);
    t.ok(has(/wait in their place/), 'afterwards they wait in their places' + tag);
    // t5: the foxfire
    await run('hall.w2.t5');
    t.ok(H.trialDone(s, 'w2', 't5'), 'the foxfire settled' + tag);
    // t6: Sayo's seat
    const right = pat ? 'groom' : 'bride', wrong = pat ? 'bride' : 'groom';
    await run('hall.w2.t6_' + right);
    t.ok(!H.trialDone(s, 'w2', 't6') && has(/No name card/), 'before the list is read, the seat is just a seat' + tag);
    await run('hall.w2.t6');
    t.ok(asked[0] === 'hall.w2.ask' && s.flags.xp_hall_w2_f1_asked && lines.some((l) => l.who === 'mio') && has(pat ? /opposite the groom/ : /next to the bride/), 'you ask; Mio reads the list and tells you' + tag);
    await run('hall.w2.t6_' + wrong);
    t.ok(!H.trialDone(s, 'w2', 't6') && has(/doesn't seem to be the place/), 'the wrong seat: not where the list said, and an offer to say it again' + tag);
    await run('hall.w2.t6_' + right);
    t.ok(H.trialDone(s, 'w2', 't6') && has(/set Sayo's name card/), 'the right seat' + tag);
    // t7: the riddle
    await run('hall.w2.t7');
    t.ok(H.trialDone(s, 'w2', 't7') && H.visitOf(s).reprieve === 1 && test(s, 'hall.w2.f1.clear'), 'the riddle: a reprieve, and the second floor cleared' + tag);
    // t10 waits
    await RB.game.transition('hall.w2f3');
    await run('hall.w2.t10');
    t.ok(!encs.length && has(/Nobody is at the table yet/), 'the cup waits for the borrowed things and for Konta' + tag);
    // t8: the borrowed things, back to whoever lent them
    await run('hall.w2.t8_notes');
    t.ok(has(pat ? /Toku borrowed a lantern from Sayo/ : /Sayo lent the bride an umbrella/), 'the shrine\'s ledger says who lent what' + tag);
    const otherDoor = (x) => ['sayo', 'konta', 'toku'].find((d) => d !== OWNER[pat][x]);
    await run('hall.w2.th_umbrella');
    await run('hall.w2.door_' + otherDoor('umbrella'));
    t.ok(has(/doesn't belong here/) && !s.flags.xp_hall_w2_f2_back_umbrella, 'the wrong door: read the ledger again' + tag);
    for (const x of ['umbrella', 'lantern', 'cup']) { await run('hall.w2.th_' + x); await run('hall.w2.door_' + OWNER[pat][x]); }
    t.ok(H.trialDone(s, 'w2', 't8') && has(/Every borrowed thing is back/), 'each thing back with whoever lent it' + tag);
    // t9: Konta
    await run('hall.w2.t9', { enc: () => ({ result: 'end', outcome: 'ran' }) });
    t.ok(encs[0] === 'hall.w2.konta' && !H.trialDone(s, 'w2', 't9') && has(/wish the rain would never stop/), 'Konta hides; he will come back out' + tag);
    await run('hall.w2.t9', { enc: () => ({ result: 'win', outcome: 'given' }) });
    t.ok(H.trialDone(s, 'w2', 't9') && has(/give it to my sister/), 'he gives his sister the umbrella' + tag);
    // t10 and the end
    warps = [];
    await run('hall.w2.t10', { enc: () => ({ result: 'win', outcome: 'done' }) });
    t.ok(encs[0] === 'hall.w2.cups' && H.wingDone(s, 'w2') && s.flags.hall_w2_done && has(/small fox's footprint/) && !H.visitOf(s) && warps.includes('hall.foyer'), 'the cup gone round: the tale\'s end, the chestnuts at Sayo\'s door, back at the hearth' + tag);
    t.ok(RB.stampBook.earned(s, 'hall.w2'), 'the tale\'s stamp is earned' + tag);
    t.eq(H.litCount(s), 1, 'one lantern relit (wing 2 alone, in this journey)' + tag);
  }
  {
    // Grow: the wing's tasks a level up, as stretch
    const s = fresh({ profile: 'F' });
    await enterW2(s, { pat: 0, route: 'grow' });
    await run('hall.w2.t1');
    const g = ctxOf['hall.w2.story'];
    t.ok(g && g.stretch && Array.isArray(g.steps) && g.steps.length > 0, 'on the Grow route the story room\'s task comes a level up, as stretch');
    await run('hall.w2.g_red');
    t.ok(has(/「 \{花嫁\|はなよめ\} から/), 'and the tags are written a level up (kanji for a Foundations journey)');
    const s2 = fresh({ profile: 'E' });
    await enterW2(s2, { pat: 1 });
    await run('hall.w2.t1');
    t.ok(!(ctxOf['hall.w2.story'] || {}).stretch, 'on Consolidate, the journey\'s own level');
    await RB.ui.hall.leave(false);
  }
  {
    // each companion's voice, and alone (Toku reads the list)
    for (const comp of ['nao', 'mio', 'ren', 'suzu', null]) {
      const s = fresh({ comp });
      await enterW2(s, { pat: 0 });
      await run('hall.w2.f1_first');
      const said = lines.filter((l) => l.who === comp).length;
      t.ok(comp ? said === 1 : said === 0 && lines.length >= 2, (comp || 'alone') + ': the first floor\'s arrival');
      await RB.game.transition('hall.w2f2');
      await run('hall.w2.t6');
      t.ok(comp ? lines.some((l) => l.who === comp) : lines.some((l) => l.who === 'hall_toku'), (comp || 'alone') + ': ' + (comp ? 'the companion reads the list' : 'Toku reads the list'));
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
      H.wrec(s, 'w2').pat = pat;
      t.eq(['hall.w2f1', 'hall.w2f2', 'hall.w2f3'].flatMap((id) => walk(s, id).out), [], 'every floor walked from its entry with the ropes up: everything on it reachable (pattern ' + pat + ')');
      for (const id of ['hall.w2f1', 'hall.w2f2']) {
        const m = C.maps[id], st = m.props.find((p) => p.p === 'stairs'), r = walk(s, id);
        t.ok(![[0, 1], [1, 0], [-1, 0], [0, -1]].some(([dx, dy]) => r.seen.has((st.x + dx) + ',' + (st.y + dy))), id + ': with the rope up, the stairs cannot be reached (no way round it)');
      }
      // with the procession all sent and every floor cleared
      for (const k of [0, 1, 2]) H.wrec(s, 'w2').floors[k] = true;
      for (const x of man) H.wrec(s, 'w2').trials[x.trial] = { t: 1 };
      ORD[pat].forEach((r, i) => { s.flags['xp_hall_w2_f1_sent_' + r] = true; s.flags['xp_hall_w2_f1_at_' + r + '_' + (i + 1)] = true; });
      t.eq(['hall.w2f1', 'hall.w2f2', 'hall.w2f3'].flatMap((id) => walk(s, id).out), [], 'with every floor cleared and the procession on the road: the ways on open and reachable (pattern ' + pat + ')');
    }
    t.ok(!S.test(fresh(), C.maps['hall.w2f1'].exits[0].if), 'before a floor is cleared its way on is shut');
  }
};
