// The Cloudroad, Chapter 10 (expansion P12; docs/future/work/P12_CLOUDROAD.md), with synthetic campaigns only, the
// scenes played through the real scene runner with the dialogue stubbed (lines collected, choices picked by the test,
// language tasks answered by the test). What this covers:
//  - the frame: twelve-chapter maps, the main story's nine steps, the road's places and palettes, battle backdrops;
//  - staying behind (src/engine/58s_surety.js): the companion away and back, the `away` condition, no stand-in;
//  - the relay: every message has one faithful way to say each part; saying it faithfully keeps it, overstating it
//    raises the side consequence the story puts right; the route plans: every source has a reading task;
//  - the legs' closures by phase (the washed-out bridge, the ledge's rockfall, the fog bank) and their reopening;
//  - ごとに taught in a story scene (C-74), from the relay's own rule;
//  - the creatures: the road's six, the Fog Porter's papers kept or lost (never stranded), the Courier Who Never
//    Arrived ended only by answering his versions with what the hut shows, every end reachable, never by Unravel;
//  - the High Pass: the slide cleared from above, the bridge's notice, the shelter's three bundles of firewood (and a
//    checkpoint whatever the woodpile holds), the drift; the hut's evidence, the letter box, the delivery and the end;
//  - the side stories end to end (the seals, the guest book, Rin's map, the pilgrim, the courier's family and its three
//    lasting ends, Ginji's favour), the companions' beats on the restored relay (once each, one Bond each), the records.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state, E = RB.encounter;
  const OK = { ok: true, firstTry: true, mistakes: 0 };

  // ---- a minimal stage: the real runner, with dialogue collected, choices picked and tasks answered ----------------
  let lines = [], menus = [], chooser = () => 0, answer = () => true, asked = [];
  RB.ui.dialogue.say = async (l) => { lines.push({ who: l.who, jp: l.jp || '', en: l.en || '' }); };
  RB.ui.dialogue.choose = async (opts) => { menus.push(opts.map((o) => o.en)); const i = chooser(opts); return i < 0 ? 0 : i; };
  RB.ui.dialogue.hide = () => {};
  RB.ui.toast = async () => {};
  for (const k of ['ensureSpeaker', 'dismissExtras', 'refreshActors']) RB.world[k] = () => {};
  RB.world.whenArrived = async () => {};
  RB.game.afterScene = () => {};
  RB.save.autosave = async () => {};
  RB.challenge.run = async (id) => { asked.push(id); return { ok: answer(id) }; };
  if (RB.lessons) RB.lessons.grammarCard = async () => {};
  const pickEn = (...words) => (opts) => { for (const w of words) { const i = opts.findIndex((o) => (o.en || '').indexOf(w) >= 0); if (i >= 0) return i; } return 0; };
  const seq = (...fns) => { let k = 0; return (opts) => (fns[Math.min(k++, fns.length - 1)])(opts); };
  const fresh = (o = {}) => {
    const s = S.newCampaign({ edition: o.edition == null ? 2 : o.edition });
    s.id = 'cr-test'; s.map = o.map || 'cr.oiwake'; s.comp = o.comp === undefined ? 'ren' : o.comp;
    s.player.name = 'Haru'; s.player.nameJp = 'ハル';
    s.words = ['mamoru', 'mizu', 'hikari', 'kaze', 'nawa', 'iyasu', 'ishi', 'tsuchi', 'koori', 'honoo', 'suzu', 'koe'];
    Object.assign(s.flags, { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_done: true, cr_called: true });
    for (const f of o.flags || []) s.flags[f] = true;
    s.quests.cr_main = { stage: o.main == null ? 2 : o.main, done: false };
    Object.assign(s.quests, o.quests || {});
    Object.assign(s.inv, o.inv || {});
    s.vars = Object.assign({}, o.vars || {});
    RB.game.G.s = s;
    return s;
  };
  const run = async (id, o = {}) => { lines = []; menus = []; asked = []; chooser = o.pick || (() => 0); answer = o.answer || (() => true); await RB.script.run(id); return lines; };
  const has = (re) => lines.some((l) => re.test(l.en) || re.test(l.jp));
  const test = (s, cond) => S.test(s, cond);
  const qs = (s, id) => (s.quests[id] ? (s.quests[id].done ? 'done' : s.quests[id].stage) : null);
  const npc = (map, id) => (C.maps[map].npcs || []).find((n) => n.id === id);
  const talkTo = (s, map, id) => { const n = npc(map, id); const tk = typeof n.talk === 'string' ? [{ scene: n.talk }] : n.talk; const e = tk.find((x) => !x.if || test(s, x.if)); return e && e.scene; };
  const shown = (s, map, id) => { const n = npc(map, id); return !!n && (!n.if || test(s, n.if)); };
  const cmds = (id) => (C.scenes[id] ? C.scenes[id].cmds : []);
  const ops = (id) => cmds(id).map((c) => c.op + ':' + (c.args || []).join(' '));
  const wordsOf = (s) => s.words.map((w) => C.words[w]).filter(Boolean);
  const bonds = (s) => Object.keys((s.company && s.company.bond) || {}).filter((k) => /^cr:/.test(k));
  const propsAt = (s, map, p) => (C.maps[map].props || []).filter((x) => x.p === p && (!x.if || test(s, x.if)));

  // ---- the frame ---------------------------------------------------------------------------------------------------
  const crMaps = Object.keys(C.maps).filter((id) => /^cr\./.test(id));
  t.ok(crMaps.length >= 20 && crMaps.every((id) => C.maps[id].edition === 2), 'Chapter 10\'s ' + crMaps.length + ' maps are all the twelve-chapter edition\'s');
  t.eq(C.quests.cr_main.stages.length, 9, 'the main story has nine steps');
  t.ok(C.places.cloudroad.edition === 2 && C.roads.some((r) => r[1] === 'cloudroad' && r[2] && r[2].if === 'ko_done'), 'the Cloudroad is on the twelve-chapter chart, after Kotonoha');
  t.ok(RB.tiles.PAL.cloudroad && RB.tiles.PAL.cloudtop, 'the road\'s two palettes: below and above the cloud');
  // RBN-QA-104: the cloud sea is drawn from the cloud top's own pale water, not the river ramp it copied from the road below
  const ownWater = RB.tiles.addRamps({ water: RB.tiles.PAL.cloudtop.water }).waterR;
  t.eq(RB.tiles.PAL.cloudtop.waterR, ownWater, 'the cloud top\'s water ramp is made from its own water colours');
  t.ok(JSON.stringify(RB.tiles.PAL.cloudtop.waterR) !== JSON.stringify(RB.tiles.PAL.cloudroad.waterR), 'and it is not the Cloudroad\'s river ramp');
  t.eq(RB.tiles.PAL.cloudroad.waterR, RB.tiles.addRamps({ water: RB.tiles.PAL.cloudroad.water }).waterR, 'the Cloudroad\'s rivers keep their own ramp');
  t.eq((C.scriptErrors || []).filter((e) => /cr\/|cr\./.test(e)), [], 'the Cloudroad\'s scenes parse');
  t.ok(ops('cr.end').includes('set:cr_done') && ops('cr.end').includes('quest:cr_main done'), 'the chapter ends with cr_done');

  // ---- staying behind ----------------------------------------------------------------------------------------------
  {
    const s = fresh({ comp: 'suzu' });
    RB.hooks.comp_away(['surety']);
    t.ok(s.comp === null && s.vars._away === 'suzu' && s.vars._away_why === 'surety', 'the companion stays behind: no one takes their place');
    t.ok(test(s, 'away') && test(s, 'away=suzu') && !test(s, 'away=nao'), 'a scene can speak of the one waiting (away, away=suzu)');
    RB.hooks.comp_away(['again']);
    t.eq(s.vars._away, 'suzu', 'going away twice changes nothing');
    RB.hooks.comp_back();
    t.ok(s.comp === 'suzu' && !s.vars._away && !test(s, 'away'), 'and the same companion comes back');
    const s2 = fresh({ comp: null });
    RB.hooks.comp_away(['x']); RB.hooks.comp_back();
    t.ok(s2.comp === null && !s2.vars._away, 'alone already: nothing to do');
    t.ok(ops('cr.barrier_back').includes('hook:comp_back') && C.scenes['cr.ujie'] && ops('cr.ujie').some((o) => o.indexOf('hook:comp_away') === 0), 'the Barrier\'s surety goes away at Ujie\'s and comes back with the guarantee');
  }

  // ---- the relay and the plans --------------------------------------------------------------------------------------
  {
    t.eq(RB.relay.check().filter((x) => /cr\./.test(x)), [], 'every relay message: one faithful way to say each part at each tier, every other option explained');
    const ids = Object.keys(C.relay).filter((id) => /^cr\.r/.test(id));
    t.eq(ids.length, 5, 'five messages carried up the road');
    for (const P of ['F', 'E', 'I', 'A']) {
      const s = fresh();
      for (const id of ids) {
        const d = C.relay[id];
        const r = RB.relay.judge(d, RB.relay.autoSaid(d, s, P), s, P);
        if (!r.ok) t.ok(false, id + ' at ' + P + ': said faithfully, it is not judged faithful');
      }
    }
    t.ok(true, 'said faithfully, every message is kept as given at every profile');
    // overstating a part raises its side consequence, which the story puts right
    const s = fresh();
    for (const id of ids) {
      const d = C.relay[id];
      if (!d.acts || !d.acts.over) continue;
      const said = RB.relay.autoSaid(d, s, 'E');
      for (const pid in d.acts.over) {
        const p = RB.relay.parts(d, s).find((x) => x.id === pid);
        if (!p) continue;
        const over = RB.relay.optsAt(p, 'E').find((o) => o.over);
        if (!over) continue;
        const r = RB.relay.judge(d, Object.assign({}, said, { [pid]: over.id }), s, 'E');
        RB.relay.keep(s, d, Object.assign({}, said, { [pid]: over.id }), r, 'E');
        t.ok(r.verdict === 'over' && s.flags[d.acts.over[pid]], id + ': a rumour passed on as fact raises ' + d.acts.over[pid]);
      }
    }
    for (const n of [1, 2, 3, 4, 5]) {
      const pl = C.tellings['cr.plan' + n];
      t.ok(pl && pl.sources.length >= 2 && pl.sources.every((src) => src.read || (src.tasks && src.tasks.read) || C.challenges[src.read]) !== false, 'plan ' + n + ': the reports weighed before leaving');
      t.ok(ops('cr.depart' + n).includes('hook:tellings cr.plan' + n), 'leaving station ' + n + ' the first time asks for the plan');
    }
  }

  // ---- the legs' closures by phase ----------------------------------------------------------------------------------
  {
    const shut = (s, map, which) => (C.maps[map].props || []).filter((p) => p.y === (which === 'main' ? 11 : 3) && p.x === 17 && (!p.if || test(s, p.if))).length > 0;
    const s = fresh({ flags: ['cr_bridge_washed'] });
    t.ok(shut(s, 'cr.leg3', 'main') && !shut(fresh(), 'cr.leg3', 'main'), 'the stream: the main road\'s bridge is out once the rain has washed it away, not before');
    t.ok(shut(fresh(), 'cr.leg4', 'old'), 'the ledge: the old road shut by the rockfall');
    t.ok(shut(fresh({ vars: { cr_phase: 4 } }), 'cr.leg5', 'old') && !shut(fresh({ vars: { cr_phase: 5 } }), 'cr.leg5', 'old'), 'the fog slope: the old road\'s edge hidden in fog, clear once it lifts');
    const after = fresh({ flags: ['cr_bridge_washed', 'cr_bridge_mended', 'cr_ledge_cleared'] });
    t.ok(!shut(after, 'cr.leg3', 'main') && !shut(after, 'cr.leg4', 'old'), 'after the chapter the bridge is mended and the ledge cleared');
    t.ok(ops('cr.end').includes('set:cr_bridge_mended') && ops('cr.end').includes('set:cr_ledge_cleared'), 'by the stations\' people, at the chapter\'s end');
  }

  // ---- ごとに, taught by Ine from the relay's own rule (C-74) ----------------------------------------------------------
  {
    t.ok(ops('cr.relay1').includes('call:cr.goto') && ops('cr.goto').includes('set:mod_goto') && ops('cr.goto').includes('teach:mod_goto'), 'ごとに taught in a story scene, after the first message is heard');
    for (const comp of ['nao', 'mio', 'ren', 'suzu', null]) {
      const s = fresh({ comp });
      await run('cr.goto');
      t.ok(s.flags.mod_goto && lines.some((l) => /ごと に/.test(l.jp)), 'ごとに learned (' + (comp || 'alone') + ')');
    }
  }

  // ---- the creatures --------------------------------------------------------------------------------------------------
  {
    const ids = ['cr.waystone', 'cr.echo', 'cr.ox', 'cr.fogporter', 'cr.packlantern', 'cr.moth', 'cr.courier'];
    t.ok(ids.every((id) => C.enemies[id] && C.enemies[id].edition === 2 && C.reviewEnemies[id] === 'cr'), 'the road\'s six creatures and its boss, twelve chapters only, each in the review');
    const moth = C.enemies['cr.moth'];
    t.ok(moth.pattern[0] === 'silence:mods' && moth.intents['silence:mods'].family === 'modifiers', 'the Blankpage Moth hushes the modifiers (E26)');
    const placed = crMaps.flatMap((m) => (C.maps[m].foes || []).map((f) => f.enemy));
    t.ok(['cr.waystone', 'cr.echo', 'cr.ox', 'cr.fogporter', 'cr.packlantern', 'cr.moth'].every((id) => placed.includes(id)), 'every creature is met on the road');
    // the Fog Porter goes for your papers: kept or lost, the road goes on
    const fp = C.encounters['cr.fog_papers'];
    t.ok(fp.objective.kind === 'protect' && fp.conclusions.find((c) => c.id === 'taken').result === 'end', 'the papers lost are dropped further up the slope: an end, never a defeat');
    // the Courier: never ended by Unravel; every end reachable by answering his versions
    const enc = C.encounters['cr.courier'];
    t.ok(enc.kind === 'social' && enc.social.unravelTip, 'the Courier is a social and folklore encounter');
    const s = fresh();
    const st = E.begin('cr.courier', s);
    for (let i = 0; i < 8 && !st.over; i++) E.exchange(st, { card: E.cards(st, s, wordsOf(s)).find((c) => c.kind === 'unravel'), res: OK, comp: null, target: st.cur }, { enemy: st.foes[0] && st.foes[0].def });
    t.ok(!st.over || st.enc.outcome === 'fades', 'Unravel, again and again, never ends him well (C-09)');
    const reached = new Set(), seen = new Set();
    const explore = (plan, depth) => {
      const s2 = fresh();
      const x = E.begin('cr.courier', s2);
      for (const [id, ca] of plan) { if (x.over) break; E.exchange(x, { card: E.cards(x, s2, wordsOf(s2)).find((c) => c.id === id), res: OK, comp: ca ? { act: ca } : null, target: x.cur }, { enemy: x.foes[0] && x.foes[0].def }); }
      if (x.over) { reached.add(x.enc.outcome); return; }
      const key = E.stateKey(x) + x.round + JSON.stringify(x.compUses || {});
      if (seen.has(key) || depth > 11) return;
      seen.add(key);
      const acts = [null].concat((enc.social.companion[s2.comp] || []).filter((a) => !(x.compUses || {})[a.id]).map((a) => a.id));
      for (const c of E.cards(x, s2, wordsOf(s2))) if (!c.disabled && c.kind !== 'unravel') for (const ca of acts) explore(plan.concat([[c.id, ca]]), depth + 1);
    };
    explore([], 0);
    t.eq(enc.conclusions.map((c) => c.id).filter((id) => !reached.has(id)), [], 'every end at the hut is reachable (' + [...reached].join(', ') + ')');
    // the versions come in order: the seal answers the money, the sandals the gorge, the note the fox
    const acts = enc.social.actions;
    t.eq(acts.map((a) => a.when && a.when.claims), ['ran', 'fell', 'fox', 'stayed'], 'each version is answered in turn, the next told only when the last is answered');
    t.ok(['F', 'E', 'I', 'A'].every((P) => acts.every((a) => a.task[P] && a.task[P].options.filter((o) => o.ok).length === 1)), 'one right answer to each, at every profile');
  }

  // ---- Nao's night apart: the way up from Kumoi to the pass waits for the porch at Kirishita ------------------------
  {
    const s = fresh({ comp: 'nao', main: 6, map: 'cr.kumoi', flags: ['cr_passed', 'cr_nao_night'] });
    const km = C.maps['cr.kumoi'], ex = (km.exits || []).concat(km.east ? [km.east] : []).find((x) => x.to === 'cr.pass1');
    const tr = (km.triggers || []).find((x) => x.scene === 'cr.kumoi_east');
    t.ok(ex && tr && !test(s, ex.if) && test(s, tr.if), 'while Nao waits at Kirishita, the way east to the pass is shut and the edge says so');
    await run('cr.kumoi_east');
    t.ok(has(/Nao is waiting at the inn at Kirishita/) && !has(/Not until you're through/), 'the reason given is Nao, not the Barrier');
    s.vars._away = 'nao';
    const g = RB.questGuide.targets('cr_main', s);
    t.ok(g.targets.length === 1 && g.targets[0].map === 'cr.kirishita' && /Nao/.test(RB.questGuide.nextLines(g)[0].en), 'the quest guide points to Nao on the porch, not the pass (' + JSON.stringify(RB.questGuide.nextLines(g)) + ')');
    delete s.flags.cr_nao_night; s.flags.cr_nao_back = true;
    t.ok(test(s, ex.if) && !test(s, tr.if), 'after the night on the porch, the way is open');
    delete s.flags.cr_passed; delete s.flags.cr_nao_back;
    await run('cr.kumoi_east');
    t.ok(!test(s, ex.if) && has(/Not until you're through/) && !has(/Nao is waiting/), 'before the Barrier: the Barrier is the reason');
  }

  // ---- the High Pass -------------------------------------------------------------------------------------------------
  {
    const s = fresh({ main: 6, flags: ['cr_passed'], map: 'cr.pass1' });
    await run('cr.pass1_enter');
    t.ok(s.flags.cr_pass1_seen, 'the switchbacks');
    t.ok(propsAt(s, 'cr.pass1', 'cr_slide').length === 1, 'a slide takes a turn');
    s.flags.cr_slide_seen = true;
    const clear = C.maps['cr.pass1'].triggers.find((x) => x.scene === 'cr.pass1_clear');
    t.ok(clear && test(s, clear.if), 'the goat path brings you out above it');
    await run('cr.pass1_clear', { pick: pickEn('Lever') });
    t.ok(s.flags.cr_turn_cleared && propsAt(s, 'cr.pass1', 'cr_slide').length === 0 && !test(s, clear.if), 'levered free from above, the turn is open for good');
    await run('cr.pass2_enter');
    t.eq(s.vars.cr_wood, 3, 'three bundles of firewood at the shelter');
    await run('cr.bridge', { answer: () => true });
    t.ok(asked.includes('cr.bridge_sign') && s.flags.cr_bridge_crossed, 'the bridge\'s notice read, one at a time across');
    let healed = 0, saved = 0;
    const hk = RB.hooks;
    const heal0 = RB.party && RB.party.heal;
    RB.game.heal = () => { healed++; };
    const cp0 = RB.save.checkpoint;
    RB.save.checkpoint = async () => { saved++; };
    for (let i = 0; i < 4; i++) await run('cr.shelter', { pick: pickEn('Rest') });
    t.eq(s.vars.cr_wood, 0, 'three rests burn the three bundles');
    t.ok(lines.some((l) => /firewood's gone/.test(l.en)), 'the fourth time the hearth is cold');
    t.ok(cmds('cr.shelter')[0].op === 'checkpoint', 'the road keeps your place at the shelter whatever the woodpile holds');
    s.flags.cr_done = true;
    await run('cr.shelter');
    t.ok(lines.some((l) => /Kumoi have carried firewood/.test(l.en)), 'after the chapter the people of Kumoi restock it');
    delete s.flags.cr_done;
    RB.save.checkpoint = cp0;
    await run('cr.drift', { pick: pickEn('Dig') });
    t.ok(s.flags.cr_drift_cleared, 'the drift dug through');
    await run('cr.hut_enter');
    t.ok(qs(s, 'cr_main') === 7 && has(/seal/) && has(/sandals/) && has(/Waiting for the clear/), 'the hut shows the seal, the sandals and the note before the courier speaks');
    t.ok(ops('cr.courier').includes('encounter:cr.courier') && ops('cr.courier').includes('set:cr_courier_done'), 'then the courier');
    s.flags.cr_courier_done = true;
    t.ok(propsAt(s, 'cr.hut', 'cr_satchel').length === 1 && C.maps['cr.hut'].exits.some((x) => x.to === 'cr.summit' && test(s, x.if)), 'his letter box is left by the door, and the way on to the pass opens');
    await run('cr.satchel');
    t.ok(s.inv.cr_message && s.flags.cr_message_taken && qs(s, 'cr_main') === 8, 'the last post taken up');
    t.eq(talkTo(s, 'cr.sakashita', 'cr_heisuke'), 'cr.deliver', 'Heisuke at Sakashita is who it goes to');
    await run('cr.summit_first');
    t.ok(has(/steam/), 'from the pass, a valley of steam far below');
    await run('cr.summit_east');
    t.ok(has(/needs delivering/) && !s.flags.cr_done, 'the way down north-east waits for the letter');
  }

  // ---- the delivery, the end, and the companions on the restored relay ----------------------------------------------
  for (const comp of ['nao', 'mio', 'ren', 'suzu']) {
    const s = fresh({ comp, main: 8, flags: ['cr_passed', 'cr_courier_done', 'cr_message_taken', 'cr_bridge_washed'], inv: { cr_message: 1 } });
    await run('cr.deliver');
    t.ok(s.flags.cr_done && qs(s, 'cr_main') === 'done' && !s.inv.cr_message && s.flags.cr_delivered, comp + ': the letter delivered to Heisuke, and the chapter ends');
    t.ok(has(/medicine money/) && has(/Genta didn't run/), comp + ': the money his father blamed Genta for was in the letter');
    const beat = { mio: 'cr_mio_kikue', ren: 'cr_ren_lit', suzu: 'cr_suzu_reply' }[comp];
    if (beat) {
      t.ok(s.flags[beat] && bonds(s).includes('cr:beat'), comp + ': their beat on the restored relay, with one Bond');
      const n = (s.company.bond['cr:beat'] || 0);
      await run({ mio: 'cr.mio_kikue', ren: 'cr.ren_lit', suzu: 'cr.suzu_reply' }[comp]);
      t.eq(s.company.bond['cr:beat'] || 0, n, comp + ': once only');
    }
    t.ok(propsAt(s, 'cr.leg3', 'cr_bridge_out').length === 0, comp + ': the bridge is mended');
  }

  // ---- the side stories ------------------------------------------------------------------------------------------------
  {
    // The Seven Seals
    const s = fresh({ comp: 'suzu', flags: ['cr_st1'] });
    t.eq(talkTo(s, 'cr.oiwake', 'cr_tome'), 'cr.tome', 'Tome first');
    await run('cr.tome');
    t.ok(s.inv.cr_sealbook && s.flags.cr_seal1 && qs(s, 'cr_seals') === 0, 'Tome gives the seal book with Oiwake\'s seal on the first page');
    const keepers = [[2, 'cr.suginoki', 'cr_ine'], [3, 'cr.sakashita', 'cr_heisuke'], [4, 'cr.nakayama', 'cr_otaki'], [5, 'cr.umagaeshi', 'cr_genji'], [6, 'cr.kirishita', 'cr_sue'], [7, 'cr.kumoi', 'cr_shizu']];
    s.flags.cr_fetching = true;
    t.ok(talkTo(s, 'cr.kumoi', 'cr_shizu') !== 'cr.seal7', 'Shizu writes the guarantee first while your companion waits at the Barrier');
    delete s.flags.cr_fetching;
    for (const [n, map, who] of keepers) {
      t.eq(talkTo(s, map, who), 'cr.seal' + n, 'station ' + n + ': ' + who + ' keeps the seal');
      await run('cr.seal' + n);
      t.ok(s.flags['cr_seal' + n], 'station ' + n + ': pressed');
    }
    t.ok(qs(s, 'cr_seals') === 1 && talkTo(s, 'cr.oiwake', 'cr_tome') === 'cr.seals_done', 'all seven: back to Tome');
    await run('cr.seals_done');
    t.ok(qs(s, 'cr_seals') === 'done' && RB.state.test(s, C.stamps['cr.seals'].when), 'the book is yours, and the records keep the Seven Seals');
    s.flags.cr_done = true;
    delete s.flags.cr_seal3;
    t.eq(talkTo(s, 'cr.sakashita', 'cr_heisuke'), 'cr.seal3', 'a seal can still be pressed after the chapter');
  }
  {
    // The Inn That Lost Its Guest Book
    const s = fresh({ flags: ['cr_st3', 'cr_st4'] });
    await run('cr.guestbook');
    t.ok(s.flags.cr_guestbook_seen && !s.inv.cr_guestbook, 'seen at Sakashita before anyone has lost it: a pine-needle crest');
    t.eq(talkTo(s, 'cr.nakayama', 'cr_otaki'), 'cr.guest_start', 'at Nakayama, Otaki\'s guest book is missing');
    await run('cr.guest_start');
    t.ok(qs(s, 'cr_guest') === 0 && has(/pine-needle crest/), 'and you remember where you saw it');
    await run('cr.guestbook');
    t.ok(s.inv.cr_guestbook && qs(s, 'cr_guest') === 1, 'Sono hands it over');
    t.eq(talkTo(s, 'cr.nakayama', 'cr_otaki'), 'cr.guest_settle', 'back to Otaki');
    await run('cr.guest_settle', { answer: () => true });
    t.ok(asked.includes('cr.guest_book') && qs(s, 'cr_guest') === 'done' && !s.inv.cr_guestbook && !shown(s, 'cr.nakayama', 'cr_tatsu'), 'by dusk (までに), and both inns were right');
  }
  {
    // The Mapmaker's Wrong Map
    const s = fresh({ flags: ['cr_st4'] });
    await run('cr.rin');
    t.ok(s.flags.cr_map_started && qs(s, 'cr_map') === 0, 'Rin asks what you saw and what you were told');
    t.eq(talkTo(s, 'cr.nakayama', 'cr_rin'), 'cr.map_wait', 'until Kirishita she waits');
    const enter = C.maps['cr.kirishita'].onEnter.find((x) => x.scene === 'cr.map_kirishita');
    t.ok(enter && test(s, enter.if), 'reaching Kirishita moves it on');
    await run('cr.map_kirishita');
    s.flags.cr_st6 = true;
    t.ok(qs(s, 'cr_map') === 1 && talkTo(s, 'cr.nakayama', 'cr_rin') === 'cr.map_report', 'then back to Rin');
    await run('cr.map_report', { answer: () => true });
    t.ok(asked.includes('cr.map_check') && qs(s, 'cr_map') === 'done', 'black for walked, red for told');
    t.ok(RB.atlasCommissions.offers(s).some((o) => o.id === 'themed:wrongmap'), 'and Rin\'s commission waits on the Atlas\'s board');
  }
  {
    // The Pilgrim's Errand
    const s = fresh({ comp: 'nao', flags: ['cr_oshika_met'] });
    t.ok(shown(s, 'cr.suginoki', 'cr_oshika') && talkTo(s, 'cr.suginoki', 'cr_oshika') === 'cr.oshika', 'Oshika waits under the great cedar after the shrine path');
    await run('cr.oshika');
    t.ok(s.inv.cr_pilgrimbook && qs(s, 'cr_pilgrim') === 0 && has(/Not wishes/), 'her book to take up the pass; Nao answers her island story');
    await run('cr.summit_stone');
    t.ok(s.flags.cr_pilgrim_rubbed && has(/rubbing/), 'a rubbing of the pass\'s carved seal (a real custom)');
    await run('cr.summit_stone');
    t.eq(lines.filter((l) => /rubbing/.test(l.en)).length, 0, 'only once');
    t.eq(talkTo(s, 'cr.suginoki', 'cr_oshika'), 'cr.pilgrim_done', 'back to Oshika');
    await run('cr.pilgrim_done');
    t.ok(qs(s, 'cr_pilgrim') === 'done' && !s.inv.cr_pilgrimbook && talkTo(s, 'cr.suginoki', 'cr_oshika') === 'cr.oshika_after', 'sixty years of seals, finished');
  }
  {
    // The Last Courier's Family: three lasting ends, each shown before it is chosen
    const base = { flags: ['cr_st3', 'cr_done', 'cr_delivered'], quests: { cr_main: { stage: 8, done: true } } };
    const s0 = fresh(base);
    await run('cr.sono');
    t.ok(s0.flags.cr_sono_met && qs(s0, 'cr_family') === 0 && has(/fell into the gorge/), 'Sono, Genta\'s granddaughter, and the family\'s version');
    t.ok(shown(s0, 'cr.saka_inn', 'cr_heisuke') && talkTo(s0, 'cr.saka_inn', 'cr_sono') === 'cr.family_sono', 'after the letter, Heisuke comes to her inn');
    await run('cr.family', { pick: pickEn('Not now') });
    t.ok(qs(s0, 'cr_family') === 0 && !s0.flags.cr_family_inn && !s0.flags.cr_family_relay && !s0.flags.cr_family_stone, '"not now" decides nothing');
    await run('cr.family', { pick: seq(pickEn('Sono\'s inn'), pickEn('Think again'), pickEn('Not now')) });
    t.ok(qs(s0, 'cr_family') === 0 && !s0.flags.cr_family_inn && lines.some((l) => /Courier's Inn, Genta/.test(l.en)), 'an end shown, then thought again: nothing decided');
    for (const [pick, flag, world] of [['Sono\'s inn', 'cr_family_inn', (s) => /curtain made new/.test(lines.map((l) => l.en).join(' '))],
      ['the relay', 'cr_family_relay', () => true], ['Raise a stone', 'cr_family_stone', (s) => propsAt(s, 'cr.hut', 'stone_marker').length === 1]]) {
      const s = fresh({ flags: ['cr_st3', 'cr_done', 'cr_delivered', 'cr_sono_met'], quests: { cr_main: { stage: 8, done: true }, cr_family: { stage: 0, done: false } } });
      await run('cr.family', { pick: seq(pickEn(pick), pickEn('Do that')) });
      t.ok(s.flags[flag] && qs(s, 'cr_family') === 'done' && !shown(s, 'cr.saka_inn', 'cr_heisuke'), 'the coins: ' + pick + ', for good');
      await run('cr.sono_after');
      t.ok(lines.length === 1, pick + ': Sono speaks of it afterwards');
      t.ok(world(s), pick + ': the world shows it');
    }
    const sR = fresh({ flags: ['cr_done', 'cr_family_relay'] });
    await run('cr.kanbe_after');
    t.ok(has(/Genta's mark/), 'Kanbe\'s runners carry Genta\'s mark');
  }
  {
    // Ginji's favour
    const s = fresh({ comp: 'mio', flags: ['cr_ginji_met', 'cr_passed'] });
    t.ok(shown(s, 'cr.kumoi', 'cr_ginji'), 'Ginji at Kumoi after the moths');
    await run('cr.ginji', { pick: pickEn('Take it on') });
    t.ok(s.inv.cr_parcel && has(/no papers/), 'the man without papers asks you to carry it openly');
    t.eq(talkTo(s, 'cr.umagaeshi', 'cr_chika'), 'cr.parcel', 'to Chika');
    await run('cr.parcel');
    t.ok(!s.inv.cr_parcel && s.flags.cr_parcel_done && has(/every six hours/), 'delivered; Mio writes the label (ごとに)');
    const s2 = fresh({ flags: ['cr_ginji_met', 'cr_passed'] });
    await run('cr.ginji', { pick: pickEn('Say no') });
    t.ok(!s2.inv.cr_parcel && s2.flags.cr_ginji_gone && !shown(s2, 'cr.kumoi', 'cr_ginji'), 'or you can say no, and he goes the long way round');
  }
  {
    // nothing in a side story moves the main story; the records
    const side = ['cr_seals', 'cr_guest', 'cr_map', 'cr_pilgrim', 'cr_family'];
    t.ok(side.every((q) => C.quests[q] && C.quests[q].chapter === 'cr' && !C.quests[q].main), 'five side stories on the Cloudroad');
    const sideScenes = Object.keys(C.scenes).filter((id) => /^cr\.(seal|seals_|guest|map_|oshika|pilgrim|family|sono|ginji|parcel|genta_stone)/.test(id));
    t.ok(sideScenes.length >= 20 && sideScenes.every((id) => cmds(id).every((c) => !(c.op === 'quest' && c.args[0] === 'cr_main'))), 'no side story moves the main story (' + sideScenes.length + ' scenes)');
    t.ok(C.stamps['ch.cr'] && C.stamps['side.cr'] && C.stamps['cr.relay'] && C.stampStands.cloudroad, 'the chapter\'s stamps and its stand at Oiwake');
    const s = fresh({ flags: ['cr_done'] });
    t.ok(test(s, C.stamps['ch.cr'].when) && !test(fresh({ edition: 1, flags: ['cr_done'] }), C.stamps['ch.cr'].when), 'the chapter stamp, twelve chapters only');
    for (const q of side) s.quests[q] = { stage: 0, done: true };
    t.ok(C.stamps['side.cr'].when(s), 'everyone helped, once every side story is done');
    t.ok(C.company.bondEvents['cr:beat'] && C.company.bondEvents['cr:surety'] && C.company.bondEvents['cr:night'] && C.company.mem.cr_porch, 'Bond events and Nao\'s kept memory are registered');
  }
};
