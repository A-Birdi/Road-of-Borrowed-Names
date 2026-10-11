// The Hall of a Hundred Tales, wing 10, The Hundredth Tale, and the rewards for all ten (expansion P15; plan
// 04_DUNGEONS.md D9; docs/future/work/P15_POSTGAME.md), with synthetic campaigns only, the scenes played through the
// real scene runner with the dialogue stubbed (lines collected, language tasks answered by the test, choices and
// encounters' ends chosen by the test). The Hall's rules themselves are covered by hall_w1.test.mjs; this covers:
//  - the tenth door sealed until nine lanterns are relit, then the manifest: ten trials over three floors, every kind
//    the plan asks for, each with a scene that sets its floor's flag and tells the Hall;
//  - every trial end to end in both patterns, right and wrong: your journey's places set on the waystones in order (a
//    place on the wrong stone is not set down), the sayings set by the lantern of the tale that taught them, the
//    keepers' note read by your companion (alone, by Kohaku) and the wick where it says, the hundredth tale's pages
//    each given its word, in order, Sōan and Kohaku (he goes off alone, and comes back), the hundredth tale told;
//  - all ten: Keeper Tsuru's last conversation and the keepsake she gives (once), the travel volume's pages of the ten
//    tales (revealable by confirmation: viewable, never witnessed), the wing's truthful note on its card;
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
    s.id = o.id || 'hall-w10-test'; s.map = 'hall.foyer'; s.comp = o.comp === undefined ? 'ren' : o.comp;
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
  const nine = (s, n = 9) => { for (let k = 1; k <= n; k++) H.wrec(s, 'w' + k).done = true; return s; };
  const enterW10 = async (s, o = {}) => { if (o.pat != null) H.wrec(s, 'w10').pat = o.pat; if (o.route || o.tactics) H.setChoice(s, 'w10', o); RB.hooks.hall_card = async () => { s.vars._res = 1; }; await run('hall.door_w10'); return H.visitOf(s); };

  // ---- the sealed door, and the manifest ------------------------------------------------------------------------------
  {
    const s = nine(fresh(), 8);
    let carded = false;
    RB.hooks.hall_card = async () => { carded = true; s.vars._res = 0; };
    await run('hall.door_w10');
    t.ok(!carded && has(/not told until the nine lights are back/), 'with eight lanterns relit, the tenth door is sealed');
    nine(s);
    await run('hall.door_w10');
    t.ok(carded, 'with nine, it opens onto the card');
  }
  const w10 = H.get('w10');
  const man = H.manifest().filter((x) => x.wing === 'w10');
  t.eq(man.length, 10, 'wing 10 has ten trials');
  t.eq(H.manifest().length, 100, 'the Hall\'s manifest: one hundred trials');
  t.eq(new Set(H.manifest().map((x) => x.id)).size, 100, 'one hundred distinct trial ids');
  t.ok(['story', 'counterexample', 'infogap', 'riddle', 'encounter', 'social', 'capstone', 'mechanism'].every((k) => man.some((x) => x.kind === k)), 'every kind of trial the plan asks for');
  t.ok([0, 1, 2].every((k) => man.filter((x) => x.floor === k).length >= 3) && w10.floors.length === 3, 'three floors, each with at least three trials');
  t.ok(man.filter((x) => x.reprieve).length === 1 && man.find((x) => x.reprieve).kind === 'riddle', 'the riddle earns the wing\'s reprieve');
  const allOps = Object.keys(C.scenes).filter((id) => id.startsWith('hall.w10.')).flatMap((id) => ops(id));
  for (const x of man) t.ok(allOps.includes('hook:hall_trial w10 ' + x.trial) && allOps.some((o) => o.startsWith('set:') && o.slice(4).split(' ').includes('xp_hall_w10_f' + x.floor + '_' + x.trial)), x.id + ': a scene sets its floor\'s flag and tells the Hall');
  t.ok(X.get('hall_w10') && X.get('hall_w10').kind === 'hall' && X.get('hall_w10').rules.restart === 'floor', 'the wing is an expedition of kind hall, the floor restarted on defeat');
  t.ok(['hall.w10f1', 'hall.w10f2', 'hall.w10f3'].every((id) => C.maps[id] && C.maps[id].edition === 2 && C.maps[id].music === 'hall_w10' && C.maps[id].region === 'hall_w10'), 'three floors in the twelve-chapter edition, with the wing\'s own region and music');
  t.ok(RB.audio && RB.audio._ && RB.audio._.songDefs.hall_w10, 'the wing\'s song exists');
  t.eq((C.scriptErrors || []).filter((e) => /hall/.test(e)), [], 'the Hall\'s scenes parse');
  t.ok(C.stamps['hall.w10'] && C.stamps['hall.w10'].hidden, 'its stamp, hidden until the tale is told');
  t.ok(/real/.test(w10.folklore.en) && /百物語/.test(w10.folklore.en) && /own journey/.test(w10.folklore.en), 'the folklore note: your own journey, and the real custom behind the Hall');
  const tl = C.encounters['hall.w10.tale'];
  t.ok(tl && tl.procedure.steps.length === 4 && tl.procedure.steps.every((st) => st.actions.filter((a) => a.ok).length === 1 && st.actions.some((a) => !a.ok && a.wrong)), 'the hundredth tale: four questions, each with one fitting answer and one that is not');
  // every wing's card text: its title, theme and trial titles valid Japanese with furigana, and its English notes
  // (the folklore label, the Grow note) carrying any Japanese word with its reading ({漢字|かんじ})
  {
    const bad = [];
    const bare = (en) => /[\u4e00-\u9fff\u3005]/.test(String(en || '').replace(/\{[^|}]+\|[^}]+\}/g, ''));
    for (const d of H.list()) {
      for (const [k, jp] of [['title', d.title.jp], ['theme', d.theme.jp]].concat(d.trials.map((x) => [x.id, x.title.jp]))) if (jp && RB.jp.validate(jp).length) bad.push(d.id + ' ' + k + ': ' + jp);
      for (const [k, en] of [['folklore', d.folklore && d.folklore.en], ['grow', d.grow && d.grow.en]]) if (bare(en)) bad.push(d.id + ' ' + k + ' has kanji without a reading');
    }
    t.eq(bad, [], 'every wing\'s card: furigana on every kanji, in its Japanese and in the Japanese inside its English notes');
  }
  t.ok(C.items.hall_lantern && C.items.hall_lantern.slot === 'cosmetic' && C.items.hall_lantern.acc === 'lamp', 'the keepsake is a cosmetic: a hand lantern that changes only how you look');

  // ---- the trials, end to end -----------------------------------------------------------------------------------------
  const WAY = { 0: ['rw', 'mb1', 'co', 'kr', 'ko', 'yn'], 1: ['sg', 'mb2', 'sb', 'lf', 'cr', 'sa'] };
  const SAYW = { 0: { s1: 'w1', s2: 'w6', s3: 'w8', s4: 'w9', s5: 'w3' }, 1: { s1: 'w2', s2: 'w4', s3: 'w5', s4: 'w7', s5: 'w8' } };
  const WICK = { 0: 'box', 1: 'shelf' };
  const SPOTR = { pg1: 1, pg2: 0, pg3: 2, pg4: 1 };
  let lastOpts = [];
  const pick = async (scene, to) => { RB.ui.dialogue.choose = async (opts) => { lastOpts = opts; const i = opts.findIndex((o) => o.to === to); return i < 0 ? 0 : i; }; await run(scene); RB.ui.dialogue.choose = async () => 0; };
  for (const pat of [0, 1]) {
    const s = nine(fresh({ comp: 'mio', profile: 'E' }));
    const v = await enterW10(s, { pat });
    const tag = ' (pattern ' + pat + ')';
    t.ok(v && v.wing === 'w10' && v.floor === 0 && warps.includes('hall.w10f1') && X.of(s) && X.of(s).id === 'hall_w10', 'going in: the first floor' + tag);
    // t1
    await run('hall.w10.t1', { answer: () => false });
    t.ok(!H.trialDone(s, 'w10', 't1') && asked[0] === 'hall.w10.story' && has(/put the pictures in order later/) && has(/looks a great deal like \$name/) && RB.script.enVars('like $name.') === 'like Haru.', 'the story room: the traveller is you; out of order, the trial waits' + tag);
    await run('hall.w10.t1');
    t.ok(H.trialDone(s, 'w10', 't1') && asked.includes('hall.w10.story_q') && has(/set out from Reedwake/) && has(/ninety-nine lights are burning/), 'your journey in four pictures, put back; the optional question after' + tag);
    // t2: the waystones
    await run('hall.w10.kohaku');
    t.ok(lines.some((l) => l.who === 'hall_kohaku') && has(/order you passed them/), 'Kohaku asks for the places in the order you passed them' + tag);
    await run('hall.w10.t2_board');
    t.ok(has(pat ? /From the sea at Saltglass/ : /Out of Reedwake to Manybridge/), 'the road record read' + tag);
    const tabs = C.maps['hall.w10f1'].props.filter((p) => /^hall\.w10\.tab_/.test(p.scene || '') && S.test(s, p.if));
    t.eq(tabs.map((p) => p.scene.slice('hall.w10.tab_'.length)).sort(), WAY[pat].slice().sort(), 'the tablets laid out are this road\'s six places' + tag);
    await run('hall.w10.tab_' + WAY[pat][1]); await run('hall.w10.st1');
    t.ok(has(/not the place that comes here/) && !s.flags['xp_hall_w10_f0_stone_st1'], 'a place on the wrong waystone is not set down' + tag);
    for (let n = 0; n < 6; n++) { await run('hall.w10.tab_' + WAY[pat][n]); await run('hall.w10.st' + (n + 1)); }
    t.ok(H.trialDone(s, 'w10', 't2') && WAY[pat].every((k) => s.flags['xp_hall_w10_f0_set_' + k]) && has(/Six waystones, six names/), 'every place on its waystone, in the order you came' + tag);
    // t3
    await run('hall.w10.card2');
    t.ok(lines.length === 2, 'a slate shows its saying in this pattern' + tag);
    await run('hall.w10.t3', { answer: () => false });
    t.ok(!H.trialDone(s, 'w10', 't3') && asked[0] === 'hall.w10.counter' + pat, 'the wrong saying not found: the slates wait' + tag);
    await run('hall.w10.t3');
    t.ok(H.trialDone(s, 'w10', 't3') && test(s, 'hall.w10.f0.clear'), 'the wrong saying found: the first floor cleared' + tag);
    // t4: the nine lanterns
    await RB.game.transition('hall.w10f2');
    t.eq(H.visitOf(s).floor, 1, 'into the lantern gallery' + tag);
    await run('hall.w10.s1');
    t.ok(has(pat ? /gave me an umbrella/ : /second corner/), 'the first saying read' + tag);
    const wrongLamp = ['w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7', 'w8', 'w9'].find((w) => w !== SAYW[pat].s1);
    await run('hall.w10.to_' + wrongLamp);
    t.ok(has(/didn't teach it/) && !s.flags.xp_hall_w10_f1_put_s1, 'a saying set by the wrong tale\'s light is not taken' + tag);
    for (const sl of ['s1', 's2', 's3', 's4', 's5']) { await run('hall.w10.' + sl); await run('hall.w10.to_' + SAYW[pat][sl]); }
    t.ok(H.trialDone(s, 'w10', 't4') && has(/five sayings are each in place/), 'each saying by the light of the tale that taught it' + tag);
    // t5
    await run('hall.w10.t5');
    t.ok(H.trialDone(s, 'w10', 't5') && has(/waiting here a long time/), 'the moss lantern lit' + tag);
    // t6: the keepers' note and the wick
    await run('hall.w10.k_' + WICK[pat]);
    t.ok(!H.trialDone(s, 'w10', 't6') && has(/Read the note first/), 'before the note is read, nothing is found' + tag);
    await run('hall.w10.t6');
    t.ok(asked[0] === 'hall.w10.ask' && s.flags.xp_hall_w10_f1_asked && lines.some((l) => l.who === 'mio') && has(pat ? /shelf on the north wall/ : /lacquer box by the hearth/), 'you ask; Mio reads the note' + tag);
    await run('hall.w10.k_altar');
    t.ok(!H.trialDone(s, 'w10', 't6') && has(/doesn't seem to be here/) && has(/say what the note said again/), 'the little shrine: not there, and an offer to say it again' + tag);
    await run('hall.w10.k_' + WICK[1 - pat]);
    t.ok(!H.trialDone(s, 'w10', 't6') && has(/doesn't seem to be here/), 'the other pattern\'s place is not this one\'s' + tag);
    await run('hall.w10.k_' + WICK[pat]);
    t.ok(H.trialDone(s, 'w10', 't6') && has(/For the next one/), 'the wick, where the note said, left for the next teller' + tag);
    // t7
    await run('hall.w10.t7');
    t.ok(H.trialDone(s, 'w10', 't7') && H.visitOf(s).reprieve === 1 && test(s, 'hall.w10.f1.clear'), 'the riddle: a reprieve, and the second floor cleared' + tag);
    // t9 and t10 wait for the pages
    await RB.game.transition('hall.w10f3');
    await run('hall.w10.t10');
    t.ok(!encs.length && has(/still dark/) && has(/pages are still blank/) && has(/not made up their minds/), 'the hundredth lantern waits: the pages first, and the keepers' + tag);
    await run('hall.w10.t9');
    t.ok(!encs.length && has(/waiting for the hundredth tale's pages/), 'Sōan and Kohaku wait for the pages' + tag);
    // t8: the unwritten pages, in order
    await pick('hall.w10.pg2', 'right');
    t.ok(has(/Write the tale in order/) && !s.flags.xp_hall_w10_f2_page_pg2, 'the pages are written in order' + tag);
    await pick('hall.w10.pg1', 'wrong');
    t.ok(lastOpts.length === 3 && lastOpts.findIndex((o) => o.to === 'right') === SPOTR.pg1 && has(/won't take that word/) && !s.flags.xp_hall_w10_f2_page_pg1, 'three words at the journey\'s level; the wrong one is not taken' + tag);
    for (const pg of ['pg1', 'pg2', 'pg3', 'pg4']) { await pick('hall.w10.' + pg, 'right'); t.ok(s.flags['xp_hall_w10_f2_page_' + pg] && lastOpts.findIndex((o) => o.to === 'right') === SPOTR[pg], pg + ': its word, never always in the same place' + tag); }
    t.ok(H.trialDone(s, 'w10', 't8') && has(/Four pages make one tale/), 'the four pages written' + tag);
    // t9: Sōan and Kohaku
    await run('hall.w10.t9', { enc: () => ({ result: 'end', outcome: 'left' }) });
    t.ok(encs[0] === 'hall.w10.vigil' && !H.trialDone(s, 'w10', 't9') && has(/far end of the corridor/), 'Sōan goes off alone; it can be tried again' + tag);
    await run('hall.w10.t9', { enc: () => ({ result: 'win', outcome: 'together' }) });
    t.ok(H.trialDone(s, 'w10', 't9') && has(/walk home the same way/), 'they will tell it together' + tag);
    // t10, the end, and Tsuru
    warps = [];
    RB.ui.dialogue.choose = async (opts) => opts.findIndex((o) => o.to === 'shadow');
    await run('hall.w10.t10', { enc: () => ({ result: 'win', outcome: 'done' }) });
    RB.ui.dialogue.choose = async () => 0;
    t.ok(encs[0] === 'hall.w10.tale' && H.wingDone(s, 'w10') && s.flags.hall_w10_done && has(/hundredth lantern flames up/) && has(/the shadow of \$name, the teller/) && !H.visitOf(s) && warps.includes('hall.foyer'), 'the hundredth tale told: what appears is the teller; back at the hearth' + tag);
    t.ok(lines.some((l) => l.who === 'tsuru') && has(/tired of waiting/) && has(/teacher said the same/) && has(/ninth tale was the crane/) && s.inv.hall_lantern === 1 && s.flags.hall_tsuru_final, 'Keeper Tsuru is waiting: her last conversation, and the keepsake' + tag);
    t.ok(RB.stampBook.earned(s, 'hall.w10') && H.litCount(s) === 10, 'the tale\'s stamp, and all ten lanterns relit' + tag);
    const tsu = C.maps['hall.foyer'].npcs.find((n) => n.char === 'tsuru');
    t.ok(tsu && S.test(s, tsu.if) && !S.test(nine(S.newCampaign({ edition: 2 })), tsu.if), 'Tsuru stands by the tenth hearth once the Hundred is told, and not before' + tag);
    await run('hall.tsuru_final');
    t.ok(has(/looks young again/) && s.inv.hall_lantern === 1, 'talked to again, she has a word, and the keepsake is not given twice' + tag);
    t.ok(/Consolidate route/.test(RB.ui.hall.noteText(H.note(s, 'w10'))) && /answers; help used/.test(RB.ui.hall.noteText(H.note(s, 'w10'))), 'the wing\'s truthful note, shown on its card' + tag);
  }
  {
    // the travel volume: a page per tale, witnessed when told, revealable by confirmation (viewable, never witnessed)
    const s = nine(fresh(), 0);
    const pg = RB.volume.page('hall.w9');
    t.ok(pg && pg.special && pg.plate && !RB.volume.viewable(s, pg) && !RB.volume.witnessed(s, pg), 'the ninth tale\'s page: veiled before it is told');
    RB.volume.revealSpecial(s, 'hall.w9');
    t.ok(RB.volume.viewable(s, pg) && !RB.volume.witnessed(s, pg), 'revealed by confirmation: viewable, never witnessed');
    s.flags.hall_w9_done = true;
    t.ok(RB.volume.witnessed(s, pg), 'told: witnessed');
    t.eq([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter((n) => RB.volume.page('hall.w' + n)).length, 10, 'ten pages, one per tale');
  }
  {
    // Grow: the wing's tasks a level up, as stretch
    const s = nine(fresh({ profile: 'F' }));
    await enterW10(s, { pat: 0, route: 'grow' });
    await run('hall.w10.t1');
    const g = ctxOf['hall.w10.story'];
    t.ok(g && g.stretch && Array.isArray(g.steps) && g.steps.length > 0, 'on the Grow route the story room\'s task comes a level up, as stretch');
    await run('hall.w10.s1');
    t.ok(has(/\{右\|みぎ\}/), 'and the sayings are a level up (with their kanji for a Foundations journey)');
    const s2 = nine(fresh({ profile: 'E' }));
    await enterW10(s2, { pat: 1 });
    await run('hall.w10.t1');
    t.ok(!(ctxOf['hall.w10.story'] || {}).stretch, 'on Consolidate, the journey\'s own level');
    await RB.ui.hall.leave(false);
  }
  {
    // each companion's voice, and alone (Kohaku reads the note)
    for (const comp of ['nao', 'mio', 'ren', 'suzu', null]) {
      const s = nine(fresh({ comp }));
      await enterW10(s, { pat: 0 });
      await run('hall.w10.f1_first');
      const said = lines.filter((l) => l.who === comp).length;
      t.ok(comp ? said === 1 : said === 0 && lines.length >= 2, (comp || 'alone') + ': the first floor\'s arrival');
      await RB.game.transition('hall.w10f2');
      await run('hall.w10.t6');
      t.ok(comp ? lines.some((l) => l.who === comp) : lines.some((l) => l.who === 'hall_kohaku'), (comp || 'alone') + ': ' + (comp ? 'the companion reads the note' : 'Kohaku reads the note'));
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
      const s = nine(fresh());
      H.wrec(s, 'w10').pat = pat;
      t.eq(['hall.w10f1', 'hall.w10f2', 'hall.w10f3'].flatMap((id) => walk(s, id).out), [], 'every floor walked from its entry with the ropes up: everything on it reachable (pattern ' + pat + ')');
      for (const id of ['hall.w10f1', 'hall.w10f2']) {
        const m = C.maps[id], st = m.props.find((p) => p.p === 'stairs'), r = walk(s, id);
        t.ok(![[0, 1], [1, 0], [-1, 0], [0, -1]].some(([dx, dy]) => r.seen.has((st.x + dx) + ',' + (st.y + dy))), id + ': with the rope up, the stairs cannot be reached (no way round it)');
      }
      // with every floor cleared (and the people the trials bring out standing where they wait)
      for (const k of [0, 1, 2]) H.wrec(s, 'w10').floors[k] = true;
      for (const x of man) H.wrec(s, 'w10').trials[x.trial] = { t: 1 };
      t.eq(['hall.w10f1', 'hall.w10f2', 'hall.w10f3'].flatMap((id) => walk(s, id).out), [], 'with every floor cleared: the ways on open and everything reachable (pattern ' + pat + ')');
    }
    t.ok(!S.test(fresh(), C.maps['hall.w10f1'].exits[0].if), 'before a floor is cleared its way on is shut');
  }
};
