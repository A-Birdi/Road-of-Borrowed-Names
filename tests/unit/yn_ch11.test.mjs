// Steamhollow, Chapter 11 (expansion P13; docs/future/work/P13_STEAMHOLLOW.md), with synthetic campaigns only, the
// scenes played through the real scene runner with the dialogue stubbed (lines collected, choices picked by the test,
// language tasks answered by the test). What this covers:
//  - the frame: twelve-chapter maps, the main story's eight steps, the place and the roads on the chart, the palettes,
//    the battle backdrops, the call that opens the Pass's way down and the north road that opens at the end;
//  - the baths (src/engine/58y_baths.js): the pron condition, she/he with no question, they/them and custom choosing
//    once and kept, each companion's own side, the partition when apart, the comfort setting (Summarised: the bath in
//    a sentence, the conversation the same), a soak that restores a little;
//  - the arrangements: the front desk's reservations and Tama's recipe card (procedures: one right action a step, a
//    wrong one put right on the spot), both inns' house rules (different), the complaint and the tonic seller (every
//    end reachable, none by Unravel), Mio's honest refusal;
//  - the Steam Vents: one valve at a time, the steam moving to the other passage, the handle, the shutter; the hot
//    pools restoring a little and running cool; the float; the Kettle Below settled, never defeated, every end
//    reachable;
//  - the mediation: every end reachable and none a defeat, the disagreement kept in the best; the agreement written;
//    全体 taught in a story scene (C-74);
//  - the main story end to end for each companion: the evening (Mio's and Suzu's crossroads and nights apart, Nao's
//    and Ren's quarrels made up the same evening, each a Bond event once), the walk with its romance choice (Bond the
//    same either way), the vow and yn_done;
//  - the five side stories end to end; the records.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state, E = RB.encounter;
  const OK = { ok: true, firstTry: true, mistakes: 0 };

  // ---- a minimal stage: the real runner, with dialogue collected, choices picked and tasks answered ----------------
  let lines = [], menus = [], chooser = () => 0, answer = () => true, asked = [], encs = [], encRes = () => ({ result: 'win', outcome: null });
  RB.ui.dialogue.say = async (l) => { lines.push({ who: l.who, jp: l.jp || '', en: l.en || '' }); };
  RB.ui.dialogue.choose = async (opts) => { menus.push(opts.map((o) => o.en)); const i = chooser(opts); return i < 0 ? 0 : i; };
  RB.ui.dialogue.hide = () => {};
  RB.ui.toast = async () => {};
  RB.ui.shake = () => {};
  RB.ui.fade = async () => {};
  for (const k of ['ensureSpeaker', 'dismissExtras', 'refreshActors']) RB.world[k] = () => {};
  RB.world.whenArrived = async () => {};
  RB.world.emote = () => {};
  RB.game.afterScene = () => {};
  RB.game.transition = async (map) => { RB.game.G.s.map = map; };
  RB.game.rest = async () => {};
  RB.game.startEncounter = async (id) => { encs.push(id); return encRes(id); };
  RB.save.autosave = async () => {};
  RB.challenge.run = async (id) => { asked.push(id); return { ok: answer(id) }; };
  if (RB.lessons) RB.lessons.grammarCard = async () => {};
  const pickEn = (...words) => (opts) => { for (const w of words) { const i = opts.findIndex((o) => (o.en || '').indexOf(w) >= 0); if (i >= 0) return i; } return 0; };
  const fresh = (o = {}) => {
    const s = S.newCampaign({ edition: o.edition == null ? 2 : o.edition });
    s.id = 'yn-test'; s.map = o.map || 'yn.upper'; s.comp = o.comp === undefined ? 'ren' : o.comp;
    s.player.name = 'Haru'; s.player.nameJp = 'ハル';
    if (o.pron) s.player.pronouns = o.pron;
    s.words = ['mamoru', 'mizu', 'hikari', 'kaze', 'nawa', 'iyasu', 'ishi', 'tsuchi', 'koori', 'honoo', 'suzu', 'koe'];
    Object.assign(s.flags, { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_done: true, cr_done: true, yn_called: true });
    for (const f of o.flags || []) s.flags[f] = true;
    s.quests.yn_main = { stage: o.main == null ? 1 : o.main, done: false };
    Object.assign(s.quests, o.quests || {});
    Object.assign(s.inv, o.inv || {});
    s.vars = Object.assign({}, o.vars || {});
    RB.game.G.s = s;
    return s;
  };
  const run = async (id, o = {}) => { lines = []; menus = []; asked = []; encs = []; chooser = o.pick || (() => 0); answer = o.answer || (() => true); if (o.enc) encRes = o.enc; await RB.script.run(id); return lines; };
  const has = (re) => lines.some((l) => re.test(l.en) || re.test(l.jp));
  const test = (s, cond) => S.test(s, cond);
  const qs = (s, id) => (s.quests[id] ? (s.quests[id].done ? 'done' : s.quests[id].stage) : null);
  const npc = (map, id) => (C.maps[map].npcs || []).find((n) => n.id === id);
  const talkTo = (s, map, id) => { const n = npc(map, id); const tk = typeof n.talk === 'string' ? [{ scene: n.talk }] : n.talk; const e = tk.find((x) => !x.if || test(s, x.if)); return e && e.scene; };
  const cmds = (id) => (C.scenes[id] ? C.scenes[id].cmds : []);
  const ops = (id) => cmds(id).map((c) => c.op + ':' + (c.args || []).join(' '));
  const wordsOf = (s) => s.words.map((w) => C.words[w]).filter(Boolean);
  const bondOf = (s, k) => (s.company && s.company.bond && s.company.bond[k]) || 0;
  const propsAt = (s, map, p) => (C.maps[map].props || []).filter((x) => x.p === p && (!x.if || test(s, x.if)));
  const enc = (outcome, result) => () => ({ result: result || 'win', outcome });

  // ---- the frame ---------------------------------------------------------------------------------------------------
  const ynMaps = Object.keys(C.maps).filter((id) => /^yn\./.test(id));
  t.ok(ynMaps.length >= 16 && ynMaps.every((id) => C.maps[id].edition === 2), 'Chapter 11\'s ' + ynMaps.length + ' maps are all the twelve-chapter edition\'s');
  t.eq(C.quests.yn_main.stages.length, 8, 'the main story has eight steps');
  t.ok(C.places.steamhollow.edition === 2 && C.roads.some((r) => r[1] === 'steamhollow' && r[2] && r[2].if === 'yn_called') && C.roads.some((r) => r[0] === 'steamhollow' && r[1] === 'sa_hut' && r[2].if === 'yn_done'), 'Steamhollow on the chart: down from the Pass once called, up to the Last Lamp Hut once done');
  t.ok(RB.tiles.PAL.steamhollow && RB.tiles.PAL.yn_vents, 'the valley\'s two palettes: the town and the vents');
  t.eq((C.scriptErrors || []).filter((e) => /yn\/|yn\./.test(e)), [], 'Steamhollow\'s scenes parse');
  t.ok(ops('yn.end').includes('set:yn_done') && ops('yn.end').includes('quest:yn_main done'), 'the chapter ends with yn_done');
  {
    const s = fresh({ flags: [] });
    delete s.flags.yn_called;
    const sum = C.maps['cr.summit'];
    const down = sum.exits.find((x) => x.to === 'yn.descent');
    t.ok(down && !test(s, down.if) && sum.triggers.some((x) => x.scene === 'cr.summit_east' && test(s, x.if)), 'before the letter the way down is under snow');
    s.flags.yn_called = true;
    t.ok(test(s, down.if) && !sum.triggers.some((x) => x.scene === 'cr.summit_east' && test(s, x.if)), 'after it, the Pass opens to the north-east');
    const north = C.maps['yn.north'].exits.find((x) => x.to === 'sa.road');
    t.ok(north.sp === 'from_prev' && !test(s, north.if) && test(fresh({ flags: ['yn_done'] }), north.if), 'the north road reaches the foot of the Archive road only once the valley has agreed');
    t.ok(C.maps['sa.road'].onEnter.some((x) => x.scene === 'sa.arrive'), 'and the last chapter\'s opening plays there, as it always has');
  }
  {
    // the call, wherever the party is next on the Cloudroad
    const s = fresh({ comp: 'suzu', flags: [] });
    delete s.flags.yn_called; delete s.quests.yn_main;
    t.ok(C.cloudroad.STATIONS.concat(['cr.summit', 'lf.town']).every((id) => C.maps[id].onEnter.some((x) => x.scene === 'yn.call' && test(s, x.if))), 'the relay\'s letter reaches the party at any station, at the Pass or in Lanternfall');
    await run('yn.call');
    t.ok(s.flags.yn_called && s.chapterKey === 'yn' && s.inv.yn_letter && qs(s, 'yn_main') === 0 && s.travel.cr_summit, 'the call: the letter, Chapter 11, the Pass as a place to travel to');
    t.ok(has(/troupe/), 'and word of a troupe gone down to the valley');
  }

  // ---- the baths ---------------------------------------------------------------------------------------------------
  {
    t.ok(test(fresh({ pron: 'she' }), 'pron=she') && test(fresh({ pron: 'he' }), 'pron=he') && test(fresh({ pron: 'they' }), 'pron=they') && test(fresh({ pron: { they: 'xe', them: 'xem' } }), 'pron=custom'), 'the pron condition reads the pronouns as set, an object being custom');
    const side = async (o, pick) => { const s = fresh(o); await run('yn.bath_side', { pick: pick || (() => 0) }); return s; };
    let s = await side({ pron: 'she', comp: 'mio' });
    t.ok(s.vars.bath_side === 2 && !s.flags.yn_bath_apart && !menus.length, 'she/her: the women\'s bath, with no question; Mio there too');
    s = await side({ pron: 'he', comp: 'mio' });
    t.ok(s.vars.bath_side === 1 && s.flags.yn_bath_apart && !menus.length, 'he/him: the men\'s bath, with no question; Mio on the other side of the partition');
    s = await side({ pron: 'they', comp: 'nao' }, pickEn('reserved'));
    t.ok(s.vars.bath_side === 3 && !s.flags.yn_bath_apart && menus.length === 1 && menus[0].length === 3, 'they/them: asked once, the three baths offered; Nao uses the reserved bath, always');
    await run('yn.bath_side', { pick: pickEn('men') });
    t.ok(s.vars.bath_side === 3 && !menus.length, 'and the choice is kept: not asked again');
    s = await side({ pron: { they: 'ze', them: 'zir' }, comp: 'ren' }, pickEn('women'));
    t.ok(s.vars.bath_side === 2 && s.flags.yn_bath_apart, 'custom pronouns choose too; Ren\'s own side is the reserved bath, so they talk over the partition');
    for (const [comp, sideOf] of [['mio', 2], ['suzu', 2], ['nao', 3], ['ren', 3]]) {
      const s2 = await side({ pron: 'they', comp }, pickEn(sideOf === 2 ? 'women' : 'reserved'));
      t.ok(!s2.flags.yn_bath_apart, comp + ' is in the same bath when you choose theirs');
    }
    t.ok(['yn.bath_kami', 'yn.bath_shimo'].every((id) => ops(id).includes('call:yn.bath_scene')) && !['yn.kami_bath', 'yn.shimo_bath'].some((id) => (C.maps[id].onEnter || []).some((x) => x.scene === 'yn.bath_scene')), 'the curtain\'s scene plays the bath as you step in (no enter event to repeat it after every scene)');
    t.ok(C.maps['yn.kami_bath'].noCompanion === '!yn_apart&!yn_bath_apart' && C.maps['yn.shimo_bath'].noCompanion === '!yn_apart&!yn_bath_apart', 'apart, the companion is not drawn in your bath');
    // the comfort setting: the bath itself told in a sentence, the conversation the same
    // (settings live on the game's G; RB.game.settings is a getter)
    const st0 = RB.game.G.settings;
    for (const view of ['shown', 'summarised']) {
      RB.game.G.settings = Object.assign({}, st0 || {}, { bathScenes: view });
      const s3 = fresh({ comp: 'suzu', pron: 'she' });
      await run('yn.bath_scene');
      const long = has(/stool at the washing place/), short = has(/You rinse off, then soak/);
      t.ok(view === 'shown' ? long && !short : short && !long, 'bathing scenes ' + view + ': the bath ' + (view === 'shown' ? 'described' : 'in a sentence'));
      t.ok(has(/Ginnojō/) && s3.flags.yn_bathed, 'and Suzu\'s bath talk is there either way (' + view + ')');
    }
    RB.game.G.settings = st0;
    const s4 = fresh();
    s4.resolve.pc = 2; s4.resolve.comp = 3;
    RB.hooks.bath_soak(['4']);
    t.ok(s4.resolve.pc === 6 && s4.resolve.comp === 7, 'a hot pool restores a little, not all');
  }

  // ---- the arrangements: the front desk and the recipe card --------------------------------------------------------
  const playProc = (id, s, wrongFirst) => {
    const st = E.begin(id, s);
    let wrongs = 0, steps = 0;
    for (let i = 0; i < 40 && !st.over; i++) {
      const cards = E.cards(st, s, wordsOf(s)).filter((c) => c.kind === 'proc');
      const step = st.enc.proc.step;
      const good = cards.find((c) => c.action.ok), bad = cards.find((c) => !c.action.ok);
      const card = wrongFirst && bad && wrongs <= steps ? bad : good;
      E.exchange(st, { card, res: OK, comp: null }, {});
      if (card === bad) { wrongs++; t.ok(st.enc.proc.step === step, id + ': a wrong ' + bad.action.id + ' is put right on the spot (still step ' + step + ')'); } else steps++;
    }
    return st;
  };
  for (const id of ['yn.rooms', 'yn.cook', 'yn.buns']) {
    const P = C.encounters[id].procedure;
    t.ok(P.steps.every((st) => st.actions.filter((a) => a.ok).length === 1 && st.actions.some((a) => !a.ok) && st.stable), id + ': one right action a step, at least one wrong one, every step a stable point');
    t.ok(P.steps.every((st) => ['F', 'E', 'I', 'A'].every((p) => st.task[p] && st.task[p].options.filter((o) => o.ok).length === 1)), id + ': a language step at every profile, one right answer each');
    const s = fresh();
    const st = playProc(id, s, true);
    t.ok(st.over && st.enc.outcome === 'done', id + ': done, wrong turns and all');
  }
  {
    const P = C.encounters['yn.rooms'].procedure;
    t.ok(P.steps.map((x) => x.id).join() === 'oshige,village,yasuke,change,refuse', 'the desk: conflicting needs, a change of booking, and a guest told no politely');
    const s = fresh({ main: 2 });
    await run('yn.rooms_start', { enc: enc('done') });
    t.ok(s.flags.yn_rooms_done && s.inv.yn_towel && s.inv.yn_yukata && qs(s, 'yn_main') === 3, 'the newcomers have rooms; you have the room under the stairs, a towel and a yukata');
    t.ok(has(/Left side over right|left side over right/), 'and how a yukata is worn (a real custom)');
  }
  {
    const k = C.challenges['yn.rules_kami'], sh = C.challenges['yn.rules_shimo'];
    t.ok(k && sh && ['F', 'E', 'I', 'A'].every((p) => k.tiers[p] && sh.tiers[p]), 'both inns\' house rules, read at every profile');
    const s = fresh();
    await run('yn.kami_rules');
    t.ok(has(/real customs at most hot springs/) && has(/this inn's own/) && s.flags.yn_rules_kami, 'the Upper House\'s: the real customs labelled, the house\'s own labelled');
    await run('yn.shimo_rules');
    t.ok(has(/open all night/) && has(/Every inn is different/) && s.flags.yn_rules_shimo, 'the Lower House\'s are different, and the game says so');
  }

  // ---- conversations: every end reachable, none by Unravel ---------------------------------------------------------
  const reachAll = (id, s0, maxDepth) => {
    const d = C.encounters[id];
    const reached = new Set(), seen = new Set();
    const explore = (plan, depth) => {
      const s2 = s0();
      const x = E.begin(id, s2);
      for (const [cid, ca] of plan) { if (x.over) break; const card = E.cards(x, s2, wordsOf(s2)).find((c) => c.id === cid); if (!card) return; E.exchange(x, { card, res: OK, comp: ca ? { act: ca } : null, target: x.cur }, { enemy: x.foes[0] && x.foes[0].def }); }
      if (x.over) { reached.add(x.enc.outcome); return; }
      const key = E.stateKey(x) + x.round + JSON.stringify(x.compUses || {});
      if (seen.has(key) || depth > maxDepth) return;
      seen.add(key);
      const acts = [null].concat(((d.social.companion || {})[s2.comp] || []).filter((a) => !(x.compUses || {})[a.id]).map((a) => a.id));
      for (const c of E.cards(x, s2, wordsOf(s2))) if (!c.disabled && c.kind !== 'unravel') for (const ca of acts) explore(plan.concat([[c.id, ca]]), depth + 1);
    };
    explore([], 0);
    return reached;
  };
  for (const [id, mk, depth] of [['yn.complaint', () => fresh({ comp: 'suzu' }), 8], ['yn.salesman', () => fresh({ comp: 'ren' }), 7], ['yn.kettle', () => fresh({ comp: 'nao', flags: ['yn_float_found'] }), 10]]) {
    const d = C.encounters[id];
    t.ok(d.kind === 'social' && d.social.unravelTip, id + ': a conversation, not a fight');
    const reached = reachAll(id, mk, depth);
    t.eq(d.conclusions.map((c) => c.id).filter((c) => !reached.has(c)), [], id + ': every end reachable (' + [...reached].join(', ') + ')');
    t.ok(d.conclusions.every((c) => c.result !== 'lose'), id + ': no end is a defeat');
    t.ok(d.social.actions.every((a) => ['F', 'E', 'I', 'A'].every((p) => a.task[p] && a.task[p].options.filter((o) => o.ok).length === 1)), id + ': one right line at every profile');
    const s = mk();
    const st = E.begin(id, s);
    for (let i = 0; i < 9 && !st.over; i++) E.exchange(st, { card: E.cards(st, s, wordsOf(s)).find((c) => c.kind === 'unravel'), res: OK, comp: null, target: st.cur }, { enemy: st.foes[0] && st.foes[0].def });
    t.ok(!st.over || ['heard', 'tired', 'dozes'].includes(st.enc.outcome), id + ': Unravel alone never settles it well (C-09)');
  }
  {
    // the Kettle: settled, never beaten; without the float found, the channel can't be told cleared
    const d = C.encounters['yn.kettle'];
    t.ok(d.conclusions.every((c) => c.result === 'win') && C.enemies['yn.kettle'].boss, 'the Kettle Below: every end settles it; none defeats it');
    const s = fresh({ comp: 'mio' });
    const st = E.begin('yn.kettle', s);
    t.ok(!E.cards(st, s, wordsOf(s)).some((c) => c.id === 's:cleared' && !c.disabled), 'the cleared channel can be told only once the float is found');
    // Mio's honest rejection of a fraud (S4)
    const sal = C.encounters['yn.salesman'];
    t.ok(sal.social.companion.mio[0].effect.flag === 'honest' && sal.conclusions[0].id === 'honest', 'with Mio, her honest refusal turns Tokube\'s banner honest');
    t.ok(sal.social.actions[0].task.E.item === 'g:yn_wa_chotto', 'declining politely is the ちょっと… lesson');
  }

  // ---- the Steam Vents ----------------------------------------------------------------------------------------------
  {
    const s = fresh({ main: 5, flags: ['yn_vents_open'] });
    const steam = (map) => propsAt(s, map, 'yn_steamwall').map((p) => p.x + ',' + p.y).sort().join(' ');
    t.eq(steam('yn.vents1'), '15,7 21,14', 'at first the steam fills the nook\'s passage and the stair down; the pool\'s passage is clear');
    await run('yn.valve1');
    t.ok(s.flags.yn_vent1 && steam('yn.vents1') === '15,7 9,10', 'the near valve open: the nook clears, and the steam moves into the pool\'s passage');
    await run('yn.valve2');
    t.ok(!s.flags.yn_vent2 && has(/no handle/), 'the far valve has no handle yet');
    await run('yn.handle');
    await run('yn.valve2');
    t.ok(s.flags.yn_vent2 && !s.flags.yn_vent1 && steam('yn.vents1') === '21,14 9,10', 'with the handle the far valve opens the stair down, and the near one closes: one at a time');
    await run('yn.valve2');
    t.ok(!s.flags.yn_vent2, 'and every valve turns back from where you stand');
    await run('yn.shutter');
    t.ok(s.flags.yn_shutter && propsAt(s, 'yn.vents2', 'yn_steamwall').map((p) => p.y).join() === '19', 'the shutter sends the steam into the lower corridor and clears the upper');
    s.resolve.pc = 1; s.resolve.comp = 1;
    await run('yn.pool1');
    t.ok(s.flags.yn_pool1_used && s.resolve.pc === 5 && propsAt(s, 'yn.vents1', 'yn_pool').every((p) => p.o && p.o.cool), 'a hot pool restores a little, then runs cool');
    await run('yn.pool2');
    t.ok(cmds('yn.pool2').some((c) => c.op === 'checkpoint'), 'the second pool keeps your place');
    await run('yn.float');
    t.ok(s.flags.yn_float_found && has(/water clock/), 'the water clock\'s float, jammed in silt');
    s.flags.yn_aki_met = true;
    await run('yn.kettle', { enc: enc('settled') });
    t.ok(s.flags.yn_kettle_settled && s.flags.yn_evening && qs(s, 'yn_main') === 6, 'the Kettle settled; dusk; the meeting is tomorrow');
    t.ok(encs.includes('yn.kettle') && has(/Kettle/), 'by its own encounter');
  }

  // ---- the main story, with each companion --------------------------------------------------------------------------
  for (const comp of ['mio', 'suzu', 'nao', 'ren']) {
    const s = fresh({ comp, main: 1, map: 'yn.upper', pron: 'they' });
    await run('yn.arrive');
    t.ok(s.flags.yn_arrived && s.flags.yn_rokubei_met && qs(s, 'yn_main') === 2, comp + ': arriving, Rokubei tells the quarrel in short');
    await run('yn.rooms_start', { enc: enc('done') });
    await run('yn.tahei_first');
    t.ok(s.flags.yn_shimo_heard, comp + ': the Lower House\'s side heard');
    const bridge = C.maps['yn.lower'].triggers.find((x) => x.scene === 'yn.bridge_quarrel');
    t.ok(test(s, bridge.if), comp + ': both sides heard, the bridge');
    await run('yn.bridge_quarrel');
    t.ok(s.flags.yn_quarrel && qs(s, 'yn_main') === 4 && has(/ground lurches/), comp + ': the quarrel on the bridge shakes the ground');
    await run('yn.guild_after_quarrel');
    t.ok(qs(s, 'yn_main') === 5, comp + ': the guild sends you down');
    t.eq(talkTo(s, 'yn.lower', 'yn_aki'), 'yn.aki_ready', comp + ': Aki opens the grille');
    await run('yn.aki_ready');
    t.ok(s.flags.yn_vents_open, comp + ': the vents open');
    s.flags.yn_float_found = true;
    await run('yn.kettle', { enc: enc('settled') });
    t.eq(talkTo(s, 'yn.guild', 'yn_rokubei'), 'yn.rokubei_tomorrow', comp + ': the meeting waits for the morning');
    // the evening
    const b0 = Object.assign({}, (s.company && s.company.bond) || {});
    await run('yn.evening', { pick: () => 0 });
    if (comp === 'mio') {
      t.ok(s.flags.yn_mio_night && s.flags.yn_apart && s.comp === null && s.vars._away === 'mio', 'mio: Kikue\'s offer, and the night apart ("I\'m fine. Go to bed.")');
      t.ok(has(/take it on/) && bondOf(s, 'yn:crossroads') > (b0['yn:crossroads'] || 0), 'mio: the crossroads, a Bond event');
      t.eq(talkTo(s, 'yn.guild', 'yn_rokubei'), 'yn.rokubei_tomorrow', 'mio: no meeting while she is away');
      await run('yn.kami_room');
      t.ok(s.comp === 'mio' && !s.flags.yn_apart && s.flags.yn_mio_back && s.flags.yn_eve_done, 'mio: at dawn by the terrace footbath she is back');
      t.ok(has(/oldest scrap/) && has(/Not to stay/) && bondOf(s, 'yn:night') > 0, 'mio: the oldest scrap in the jar answered at last; a Bond event');
    } else if (comp === 'suzu') {
      t.ok(s.flags.yn_suzu_crossroads && s.flags.yn_suzu_night && s.comp === null, 'suzu: Koume offers the old act; she goes out alone');
      await run('yn.kami_room');
      t.ok(s.comp === 'suzu' && s.flags.yn_suzu_back && s.flags.yn_eve_done && has(/investment/), 'suzu: in the inn\'s garden she explains, and chooses the next act\'s partner');
      t.ok(C.maps['yn.lower'].onEnter.some((x) => x.scene === 'yn.suzu_books' && test(s, x.if)), 'suzu: in the morning, the books');
      await run('yn.suzu_books');
      t.ok(s.flags.yn_suzu_books && has(/Pfft/) && bondOf(s, 'yn:settled') > 0, 'suzu: the books shown openly; Koume laughs first');
    } else if (comp === 'nao') {
      t.ok(s.flags.yn_nao_quarrel && s.comp === null && has(/Saying yes to everyone isn't helping/), 'nao: a short quarrel over the mediation');
      t.eq((C.maps['yn.upper'].props.find((p) => p.p === 'yn_footbath') || {}).scene, 'yn.footbath', 'nao: found at the town footbath');
      await run('yn.footbath');
      t.ok(s.comp === 'nao' && s.flags.yn_nao_madeup && s.flags.yn_eve_done && has(/went too far/), 'nao: made up the same evening, apologies both ways');
      t.ok(bondOf(s, 'yn:makeup') > 0 && Object.keys(s.company.bond).every((k) => (s.company.bond[k] || 0) >= (b0[k] || 0)), 'nao: making up is a Bond event; the quarrel lowered nothing');
    } else {
      t.ok(s.flags.yn_ren_quarrel && s.comp === null, 'ren: a short quarrel over the old agreement');
      t.eq(talkTo(s, 'yn.upper', 'yn_toki'), 'yn.ren_lanterns', 'ren: found among the lanterns with Toki');
      await run('yn.ren_lanterns');
      t.ok(s.comp === 'ren' && s.flags.yn_ren_madeup && s.flags.yn_eve_done && bondOf(s, 'yn:makeup') > 0, 'ren: made up the same evening, a Bond event');
    }
    // the mediation, the agreement, 全体
    t.eq(talkTo(s, 'yn.guild', 'yn_rokubei'), 'yn.mediation_start', comp + ': in the morning, the meeting');
    await run('yn.mediation_start', { enc: enc('together') });
    t.ok(s.flags.yn_mediated && s.flags.yn_med_together && s.inv.yn_agreement && asked.includes('yn.agreement'), comp + ': the agreement written, in words you help choose');
    t.ok(s.flags.mod_zentai && qs(s, 'yn_main') === 7 && has(/as a whole/), comp + ': 全体 taught from the agreement\'s last line');
    t.ok(has(/not reconciled to the open-air bath/), comp + ': and the disagreement kept, in writing');
    // the walk, the romance choice, the vow
    const bw = bondOf(s, 'yn:walk');
    await run('yn.walk', { pick: pickEn('Take their hand') });
    t.ok(s.flags.yn_hand && s.flags.yn_done && qs(s, 'yn_main') === 'done' && bondOf(s, 'yn:walk') === bw + 1, comp + ': the walk, their hand taken, the vow, the chapter done');
  }
  {
    // the romance moment answered as the closest of friends: Bond the same (C-67)
    const a = fresh({ comp: 'mio', main: 7, flags: ['yn_mediated'] });
    await run('yn.walk', { pick: pickEn('closest of friends') });
    const b = fresh({ comp: 'mio', main: 7, flags: ['yn_mediated'] });
    await run('yn.walk', { pick: pickEn('Take their hand') });
    t.ok(a.flags.yn_side && b.flags.yn_hand && bondOf(a, 'yn:walk') === bondOf(b, 'yn:walk'), 'holding hands or walking on as the closest of friends: both warm, Bond the same (C-67)');
    t.ok(cmds('yn.walk').filter((c) => c.op === 'choice').length === 1, 'the romance moment is one choice, the player\'s');
  }
  {
    // the mediation itself: every end reachable, none a defeat, the best keeps the disagreement
    const d = C.encounters['yn.mediation'];
    const reached = reachAll('yn.mediation', () => fresh({ comp: 'suzu', inv: { yn_ledger: 1 }, flags: ['yn_float_found'] }), 9);
    t.eq(d.conclusions.map((c) => c.id).filter((c) => !reached.has(c)), [], 'the mediation: every end reachable (' + [...reached].join(', ') + ')');
    t.ok(d.conclusions.every((c) => c.result === 'win'), 'the mediation: no end is a defeat');
    t.ok(/argued once a month/.test(d.conclusions.find((c) => c.id === 'together').text.en), 'the best end keeps the disagreement honest, to be argued monthly (S4)');
    const s = fresh({ comp: 'nao' });
    const st = E.begin('yn.mediation', s);
    t.ok(!E.cards(st, s, wordsOf(s)).some((c) => (c.id === 's:ledger' || c.id === 's:float') && !c.disabled), 'the ledger and the float can be shown only once you have them');
  }

  // ---- the side stories ----------------------------------------------------------------------------------------------
  {
    const s = fresh({ comp: 'suzu', flags: ['yn_rooms_done'] });
    await run('yn.bunkichi');
    t.eq(qs(s, 'yn_masseur'), 0, 'the masseur\'s lost words');
    t.eq([talkTo(s, 'yn.kami', 'yn_okiyo'), talkTo(s, 'yn.upper', 'yn_kihachi'), talkTo(s, 'yn.kami', 'yn_oshige')], ['yn.verse_okiyo', 'yn.verse_kihachi', 'yn.verse_oshige'], 'three people remember a line each');
    await run('yn.verse_okiyo'); await run('yn.verse_kihachi'); await run('yn.verse_oshige');
    t.eq(qs(s, 'yn_masseur'), 1, 'three lines gathered');
    await run('yn.bunkichi');
    t.ok(qs(s, 'yn_masseur') === 'done' && asked.includes('yn.masseur_song'), 'put back in order, the song is his again');
    await run('yn.kume');
    await run('yn.yoshimatsu');
    t.eq(talkTo(s, 'yn.upper', 'yn_kume'), 'yn.kume_plan', 'the groom heard, Kume waits for a plan');
    await run('yn.kume_plan');
    t.ok(qs(s, 'yn_wedding') === 'done' && has(/neither inn|belongs to neither/), 'the feast on neutral ground, each inn cooking half');
    await run('yn.ginnojo');
    t.ok(qs(s, 'yn_actor') === 0 && has(/Ginnojō/) && has(/It's yours/), 'the retired actor, Suzu\'s old idol, who knows her timing');
    await run('yn.onatsu_line');
    await run('yn.troupe_baskets');
    t.eq(qs(s, 'yn_actor'), 2, 'Onatsu has it wrong; the old playbill has it right');
    await run('yn.ginnojo');
    t.ok(qs(s, 'yn_actor') === 'done' && asked.includes('yn.actor_line') && has(/prompter/), 'his punchline back; Suzu to prompt him from the wings');
    await run('yn.tama', { enc: enc('done') });
    t.ok(s.flags.yn_eggs_cooked && s.inv.yn_eggs === 3 && qs(s, 'yn_eggs') === 0, 'three spring eggs, and three people to give them to');
    for (const [map, who] of [['yn.descent', 'yn_yasuke'], ['yn.lower', 'yn_tsuneji'], ['yn.kami', 'yn_oshige']]) await run(talkTo(s, map, who));
    t.ok(qs(s, 'yn_eggs') === 'done' && !s.inv.yn_eggs, 'eggs for everyone');
    t.eq(talkTo(s, 'yn.upper', 'yn_tama'), 'yn.tama_buns', 'then Tama\'s second card: spring buns');
    await run('yn.tama_buns', { pick: pickEn('Another time') });
    t.ok(!s.flags.yn_buns_cooked && encs.length === 0, 'another time: nothing made, nothing lost');
    await run('yn.tama_buns', { pick: pickEn('Give it a try'), enc: enc('done') });
    t.ok(s.flags.yn_buns_cooked && s.inv.yn_buns === 1 && encs.includes('yn.buns') && talkTo(s, 'yn.upper', 'yn_tama') === 'yn.tama_idle', 'the buns steamed over the vent, a box to take on the road');
    await run('yn.kanae', { pick: pickEn('Read') });
    t.ok(qs(s, 'yn_poet') === 'done' && asked.includes('yn.story_order') && has(/The Spring That Went Cold/), 'the footbath poet\'s story room, read and put in order');
  }

  // ---- creatures and records ---------------------------------------------------------------------------------------------
  {
    const ids = ['yn.steamwisp', 'yn.pebbles', 'yn.toad', 'yn.lostguest', 'yn.towelthief', 'yn.chochin', 'yn.kettle'];
    t.ok(ids.every((id) => C.enemies[id] && C.enemies[id].edition === 2 && C.reviewEnemies[id] === 'yn'), 'the valley\'s six creatures and the Kettle, twelve chapters only, each in the review');
    const placed = ynMaps.flatMap((m) => (C.maps[m].foes || []).map((f) => f.enemy));
    t.ok(ids.slice(0, 6).every((id) => placed.includes(id)), 'every creature is met in the valley');
    const tw = C.encounters['yn.towel'];
    t.ok(tw.objective.kind === 'protect' && tw.conclusions.find((c) => c.id === 'taken').result === 'end', 'the Towel Thief: the towel lost comes back muddy, an end, never a defeat');
    t.ok(C.encounters['yn.wander_aki'].actors[0].agenda.wants === 'help', 'the bath-keeper joins against the toad muddying the water');
    t.ok(['ch.yn', 'side.yn', 'yn.rules', 'yn.agreement'].every((id) => C.stamps[id]) && C.stampStands.steamhollow, 'the chapter\'s stamps and stand');
    t.ok(['yn:bath', 'yn:crossroads', 'yn:night', 'yn:settled', 'yn:makeup', 'yn:walk'].every((k) => C.company.bondEvents[k]), 'the Bond events are the table\'s');
  }
};
