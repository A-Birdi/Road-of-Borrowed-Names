// HX52 (docs/expressive/CONTRACT.md): the illustrated view and the world are the same event. For EVERY registered
// sequence (RB.sequence.ids(), checked by name: a sequence with no run here fails the test), in the BUILT game,
// headless Chromium, from a synthetic fixture of the moment the scene plays (RB.game.debugStart at the scene's
// place with the flags, items and quests its callers leave; the companions and pets the story allows there — a
// companion is absent only where the story has none yet, Chapter 1 before the departure). Challenges, lessons and
// cards are stand-ins that pass; every line and reply is clicked. Per run:
//  - on entry (the `sequence:begin` event) the world is recorded: the map, who is on it and where, your companion,
//    the pet, flags, inventory, quests; on return (`sequence:end`) again, with what each person holds (staging),
//    and once more after the scene has ended and the world has settled;
//  - who is drawn: every person the shots draw (the drawing kit's figures, busts and backs, and the portraits the
//    shots ask for, matched to the cast by their look) is you, the companion actually on the map, someone on the
//    map at entry, a speaker of the sequence's lines, or named in the spec with its reason. A companion who is not
//    travelling with you is never drawn unless the world has them there as a person of the place (Suzu in the
//    Chapter 3 crowd when she is not your companion); with no companion, no companion is drawn; the companion who
//    is here is drawn where the spec says the shots show the two of you; no animal is ever drawn (RB.petArt.frame
//    is never called by a shot) — with a pet met, selected and shown in the world, with one met but hidden by the
//    setting, and with the unmet animals of the place on the map;
//  - who stays and who left: the people the pictures showed going (spec `gone`) are not on the map when the world
//    returns, neither standing nor walking out; the people the pictures left in place (spec `stay`) are there; after
//    the scene, the people on the map are exactly those the story places there in the final state (the map's own
//    conditions), and your companion is beside you;
//  - what was handed over: each inventory change of the sequence happens with the line of the shot (and phase) that
//    shows it (spec `inv`), never in two places at once (the hand that gave it holds nothing afterwards: spec
//    `held` on return), and the whole sequence changes the inventory by exactly that;
//  - where the player can go: from where you stand after the scene, the ways out the pictures promised are
//    reachable on foot (spec `reach`: an exit to a map, or a tile such as the far bank once the bridge reaches it);
//  - branches: the branch's own shot or phase appears exactly when its condition holds (spec per run: `shots`,
//    `phases`, `noPhase`, `flags`);
//  - no future reveal: what each shot depicts is true of the campaign when the shot is first shown (spec `facts`:
//    a condition per shot, or by the sequence's end where the change happens inside it), and every campaign
//    condition a shot reads is recorded;
//  - no page errors.
// The prologue (outside any scene and any campaign) is played through to the creation folio: no companion and no
// animal drawn, no campaign written.
// Usage: node tests/e2e/sequence_world.mjs [--quick] [--only ch2.notice,ch5.bell]
//   --quick: one run per sequence (the default suite); without it every branch and every companion listed
import { serve, launch, page } from './lib.mjs';

const args = process.argv.slice(2);
const QUICK = args.includes('--quick');
const oi = args.indexOf('--only'), ONLY = oi >= 0 ? args[oi + 1].split(',') : null;
const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const wait = (p, ms) => p.waitForTimeout(ms);
const F = (...o) => Object.assign({}, ...o);
const ALL4 = ['nao', 'mio', 'ren', 'suzu'];

// ---- the moments (flags as their callers leave them) ------------------------------------------------------------
const R1 = { rw_arrived: true, rw_road_lit: true, rw_met_tsuru: true, rw_bottles_done: true, rw_letters_done: true, rw_lanterns_done: true, rw_suzu_told: true, rw_hana_cups: true, rw_met_nao: true, rw_met_ren: true, rw_met_suzu: true, rw_lantern_s: true, rw_lantern_b: true, rw_mill_open: true, rw_mr_mio: true, rw_mr_nao: true, rw_mr_ren: true, rw_mr_suzu: true, rw_gears: true, rw_loft_done: true };
const D1 = { rw_arrived: true, rw_road_lit: true, departed: true, ch1_done: true };
const C2 = F(D1, { sg_clue_asahi: true, sg_clue_genzo: true, sg_clue_kiyo: true, sg_wataru_confessed: true });
const C3 = F(D1, { ch2_done: true, co_arrived: true, co_met_sayo: true, co_chronicle_read: true, co_kiln_done: true, co_tokiwa_page: true, co_suzu_done: true });
const C4 = F(D1, { ch2_done: true, ch3_done: true, sb_storm: true, sb_morning: true, sb_quiet_done: true, sb_obs_open: true, sb_boss_done: true });
const C4Q = F(D1, { ch2_done: true, ch3_done: true, sb_storm: true, sb_hearth_done: true });
const C5 = F(D1, { ch2_done: true, ch3_done: true, ch4_done: true, sb_hoshino_goes: true });
const C6 = F(C5, { ch5_done: true, sa_arrived: true });

// Each sequence: the scene that carries it, its fixture, what the pictures show of the world (gone / stay / held /
// inv / reach / facts / draws), and its runs (comp, pet, choices, branch expectations). Pets: only one the story lets
// you have met by then (the cat from Reedwake after the Mill Echo, the bird at Saltglass, the dog and the tanuki
// at Cinder Orchard). Reasons for every person a shot draws who is not on the map at entry are given in `extra`.
const SEQ = {
  'ch1.bridge': {
    scene: 'rw.bridge_scene', at: ['rw.village', 31, 17, 'right'], flags: F(R1, { rw_echo_done: true, bridge_fixed: true }), quests: { rw_mill: 4 },
    // the bridge's end settles on the far bank; Kōji crosses with his cup; he and Hana go into the teahouse and the
    // door closes: on return neither is outside, the far bank is reachable over the bridge, Tsuru is in the square
    gone: ['koji', 'hana_out'], stay: ['tsuru_out'], reach: [{ tile: [43, 17], why: 'the far bank, over the bridge' }, { to: 'rw.road' }],
    facts: [{ shot: 'reach', cond: 'bridge_fixed&rw_echo_done', why: 'the bridge reaches the far bank' }, { shot: 'door', cond: 'rw_koji_back', when: 'end', why: 'Kōji is home: the world has him in the teahouse' }],
    // nobody travels with you before the departure; the cat of the village is not met yet (it is there, unmet)
    runs: [{ name: 'no companion yet (Chapter 1); the unmet cat on the map', comp: null, shots: ['reach', 'cup', 'hana', 'close', 'door'] }],
  },
  'ch2.notice': {
    scene: 'sg.omi_wataru', at: ['sg.office', 5, 6, 'up'], flags: C2, give: ['sg_notice'], quests: { sg_main: 4 },
    // Omi at her desk, Wataru with the opened notice in his hands, the notice no longer yours
    stay: ['omi', 'wataru'], held: { wataru: 'notice', pc: null }, inv: [{ item: 'sg_notice', n: -1, shot: 'notice', phase: 'hand' }],
    reach: [{ to: 'sg.harbor' }], drawsComp: true,
    facts: [{ shot: 'faults', cond: 'sg_wataru_confessed', why: 'he has confessed before the office' }, { shot: 'notice', cond: '!item.sg_notice', why: 'the notice changes hands on this shot, once' }],
    runs: [
      { name: 'Wataru speaks for himself · Nao · the cat with you', comp: 'nao', pet: 'cat', flags: { sg_wataru_self: true }, phases: { face: ['soften'] } },
      { name: 'the party opens · Mio', comp: 'mio', noPhase: { face: ['soften'] }, quick: true },
      { name: 'Wataru speaks for himself · Ren · the cat met, hidden by the setting', comp: 'ren', pet: 'cat', petHidden: true, flags: { sg_wataru_self: true }, phases: { face: ['soften'] } },
      { name: 'the party opens · Suzu · the cat with you', comp: 'suzu', pet: 'cat', noPhase: { face: ['soften'] } },
      { name: 'Wataru speaks for himself · Mio', comp: 'mio', flags: { sg_wataru_self: true }, phases: { face: ['soften'] } },
      { name: 'Wataru speaks for himself · Suzu', comp: 'suzu', flags: { sg_wataru_self: true }, phases: { face: ['soften'] } },
      { name: 'the party opens · Nao', comp: 'nao', noPhase: { face: ['soften'] } },
      { name: 'the party opens · Ren', comp: 'ren', noPhase: { face: ['soften'] } },
    ],
  },
  'ch2.plate': {
    scene: 'sg.asahi_name', at: ['sg.glass', 6, 6, 'up'], flags: F(D1, { sg_seaglass_started: true }), give: ['sg_registry'], quests: { sg_main: 2, sg_seaglass: 1 },
    stay: ['asahi'], inv: [{ item: 'sg_registry', n: -1, shot: 'card', phase: 'take' }, { item: 'sg_plate', n: 1, shot: 'done', phase: 'lift' }], reach: [{ to: 'sg.harbor' }],
    facts: [{ shot: 'card', cond: 'item.sg_registry', why: 'the card shown is in your hands' }],
    runs: [
      { name: 'Suzu · the bird with you', comp: 'suzu', pet: 'bird', quick: true },
      { name: 'Nao · before the archive (the furnace cold)', comp: 'nao', pet: 'cat' },
      { name: 'Ren · after the archive (the furnace lit)', comp: 'ren', flags: { sg_boss_done: true }, tested: ['sg_boss_done'] },
    ],
  },
  'ch3.assembly': {
    scene: 'co.assembly', at: ['co.village', 23, 17, 'up'], flags: C3, quests: { co_main: 8 }, settle: 9000,
    // the scene warps to the square at dusk and ends in the festival (its own fade and card): the square's people
    // are the crowd; on return the festival square's people are placed by the story
    stay: [], reach: [{ prop: 'co_lookout', why: 'the fire lookout (the way on from the festival)' }], drawsComp: true, chain: ['ch3.firebreaks'],
    facts: [{ shot: 'dusk', cond: '!co_restored', why: 'the village has not remembered yet' }, { shot: 'night', cond: 'co_asm_names|co_asm_living|co_asm_ume', why: 'the square has decided' }],
    runs: [
      { name: 'the names · Mio · the bell rung · the dog with you', comp: 'mio', pet: 'dog', flags: { co_bell_rung: true }, choose: [/names of the dead/], shots: ['dusk', 'confess', 'voices', 'names', 'hands', 'ink', 'night'], phases: { voices: ['bell'] }, branch: 'co_asm_names', quick: true },
      { name: 'for the living · Nao · no bell', comp: 'nao', pet: 'tanuki', choose: [/firebreaks/], shots: ['dusk', 'confess', 'voices', 'living', 'hands', 'ink', 'night'], noPhase: { voices: ['bell'] }, branch: 'co_asm_living' },
      { name: 'Ume speaks · Suzu (she is with you, so not in the crowd)', comp: 'suzu', choose: [/Grandma Ume/], shots: ['dusk', 'confess', 'voices', 'ume', 'hands', 'ink', 'night'], branch: 'co_asm_ume' },
      { name: 'the names · Ren · Suzu in the crowd as herself', comp: 'ren', pet: 'cat', choose: [/names of the dead/], branch: 'co_asm_names', drawsNpc: ['suzu'] },
    ],
  },
  'ch3.firebreaks': { chained: 'ch3.assembly', scene: 'co.festival_begin', facts: [{ shot: 'climb', cond: 'co_restored', why: 'the morning after the assembly' }, { shot: 'rope', cond: 'co_firebreak_cut&co_hiro_seat_named', when: 'scene', why: 'the firebreaks cut and the seat named, as the festival shows them' }] },
  'ch4.lamp': {
    scene: 'sb.lamp_name', at: ['sb.obs_dome', 7, 9, 'up'], flags: C4, quests: { sb_lamp: 6 }, settle: 9000, chain: ['ch4.reply'],
    // the lamp lit; then the reply sealed and given; then down to the hamlet's square (sb.eve_start)
    stay: [], reach: [{ to: 'sb.road', why: 'the road south to Lanternfall' }], drawsComp: true,
    facts: [{ shot: 'valley', cond: 'sb_lamp_lit', why: 'the light over the valley: the lamp is lit' }, { shot: 'akari', cond: 'sb_name_done', why: 'the name held' }],
    runs: [
      { name: 'stay · Ren · the tanuki with you', comp: 'ren', pet: 'tanuki', choose: [/even when no one/], shots: ['akari', 'ask', 'stay', 'flint', 'valley'], branch: 'sb_hoshino_stays', quick: true },
      { name: 'go · Mio', comp: 'mio', choose: [/waiting for, not the lamp/], shots: ['akari', 'ask', 'go', 'flint', 'valley'], branch: 'sb_hoshino_goes' },
      { name: 'both · Nao · the dog met, hidden by the setting', comp: 'nao', pet: 'dog', petHidden: true, choose: [/leave the lamp/], shots: ['akari', 'ask', 'both', 'flint', 'valley'], branch: 'sb_hoshino_both' },
      { name: 'stay · Suzu', comp: 'suzu', choose: [/even when no one/], branch: 'sb_hoshino_stays' },
    ],
  },
  'ch4.reply': {
    scene: 'sb.lamp_reply', at: ['sb.obs_dome', 7, 9, 'up'], flags: F(C4, { sb_lamp_lit: true, sb_name_done: true, sb_hoshino_goes: true }), quests: { sb_lamp: 7 }, settle: 9000,
    stay: [], inv: [{ item: 'sb_reply_letter', n: 1, shot: 'give', phase: 'take' }], reach: [{ to: 'sb.road' }],
    facts: [{ shot: 'seal', cond: 'sb_lamp_lit', why: 'sealed under the lamp, lit' }, { shot: 'give', cond: '!item.sb_reply_letter', why: 'the envelope is handed over on this shot, once' }],
    runs: [{ name: 'reached later, on its own · Suzu · the cat with you', comp: 'suzu', pet: 'cat', shots: ['seal', 'give'], quick: true }],
  },
  'ch4.inn': {
    scene: 'sb.next_day_inn', at: ['sb.inn', 8, 9, 'up'], flags: F(C4, { sb_evening: true, sb_lamp_lit: true, ch4_done: true }), stay: [], reach: [{ to: 'sb.hamlet' }],
    facts: [{ shot: 'night', cond: 'sb_lamp_lit', why: 'the lamp lit on the mountain' }],
    runs: [{ name: 'Nao · the bird with you', comp: 'nao', pet: 'bird', shots: ['night'], quick: true }, { name: 'Ren', comp: 'ren', shots: ['night'] }],
  },
  'ch4.morning': {
    scene: 'sb.quiet_morning', at: ['sb.inn_room', 6, 5, 'up'], flags: C4Q, stay: [], reach: [{ to: 'sb.inn' }],
    facts: [{ shot: 'snow', cond: '!sb_lamp_lit', why: 'the lamp on the mountain still dark (it is lit later)' }],
    runs: [{ name: 'Mio · the dog with you', comp: 'mio', pet: 'dog', shots: ['snow'], quick: true }, { name: 'Suzu', comp: 'suzu', shots: ['snow'] }],
  },
  'ch5.bell': {
    scene: 'lf.bell_touch', at: ['lf.bellhall', 8, 5, 'down'], flags: F(C5, { lf_tower_entered: true, lf_gate_a: true, lf_gate_b: true, lf_gate_c: true, lf_boss_done: true, lf_tokuji_boat: true }), quests: { lf_main: 8 }, settle: 9000,
    stay: [], drawsComp: true,
    facts: [{ shot: 'bell', cond: '!lf_bell_rung', why: 'the bell green, not yet rung' }, { shot: 'hall', cond: 'lf_bell_rung', when: 'end', why: 'rung: gold in the hall as the world shows it once rung' }],
    runs: [
      { name: 'ring · Nao · the cat with you', comp: 'nao', pet: 'cat', choose: [/Ring the bell/], shots: ['bell', 'gong', 'town', 'hall'], flagsAfter: { lf_bell_rung: true }, reach: [{ to: 'lf.town' }], quick: true },
      { name: 'ring · Mio', comp: 'mio', choose: [/Ring the bell/], shots: ['bell', 'gong', 'town', 'hall'], flagsAfter: { lf_bell_rung: true }, reach: [{ to: 'lf.town' }] },
      { name: 'ring · Ren · the tanuki met, hidden by the setting', comp: 'ren', pet: 'tanuki', petHidden: true, choose: [/Ring the bell/], shots: ['bell', 'gong', 'town', 'hall'], flagsAfter: { lf_bell_rung: true }, reach: [{ to: 'lf.town' }] },
      { name: 'ring · Suzu', comp: 'suzu', choose: [/Ring the bell/], shots: ['bell', 'gong', 'town', 'hall'], flagsAfter: { lf_bell_rung: true }, reach: [{ to: 'lf.town' }] },
      { name: 'Not yet · Mio (nothing rung; the chamber again)', comp: 'mio', choose: [/Not yet/], shots: ['bell'], flagsAfter: { lf_bell_rung: false }, facts: [{ shot: 'bell', cond: '!lf_bell_rung' }], reach: [{ to: 'lf.tower_low' }] },
    ],
  },
  'ch5.boat': {
    scene: 'lf.boat_to_tower', at: ['lf.sluice', 18, 17, 'down'], flags: F(C5, { lf_tokuji_told: true, lf_tokuji_boat: true }), quests: { lf_main: 6 }, stay: [],
    facts: [{ shot: 'cross', cond: '!lf_bell_rung', why: 'the bell green in its belfry, not yet rung' }],
    runs: [{ name: 'row out · Suzu · the dog with you', comp: 'suzu', pet: 'dog', choose: [/Row out/], shots: ['cross'], map: 'lf.tower_top', reach: [{ to: 'lf.tower_upper' }], quick: true },
      { name: 'row out · Nao', comp: 'nao', choose: [/Row out/], shots: ['cross'], map: 'lf.tower_top', reach: [{ to: 'lf.tower_upper' }] }],
  },
  'ch6.toya': {
    scene: 'sa.toya_read', at: ['sa.heart', 12, 9, 'up'], flags: F(C6, { sa_hush_down: true }), give: ['sa_letter_kasane', 'sa_toya_reply', 'sa_notice'], quests: { sa_main: 5 },
    // Kasane holds the folio from the first shot; the inventory step after the sequence shows nothing new
    stay: ['kasane'], invAfter: { sa_letter_kasane: -1 }, reach: [{ to: 'sa.study', why: 'the way down to the Room of Set-Down Memories' }], drawsComp: true,
    facts: [{ shot: 'folio', cond: 'item.sa_letter_kasane', why: 'the folio you carry' }, { shot: 'bell', cond: 'item.lf_toya_bell', why: 'the bell you carry' }],
    runs: [
      { name: 'with Tōya\'s bell · Ren · the cat with you', comp: 'ren', pet: 'cat', bell: true, shots: ['folio', 'floor', 'turned', 'bell', 'decide'], quick: true },
      { name: 'without the bell · Mio', comp: 'mio', shots: ['folio', 'floor', 'turned', 'decide'] },
      { name: 'with the bell · Nao · the bird with you', comp: 'nao', pet: 'bird', bell: true, shots: ['folio', 'floor', 'turned', 'bell', 'decide'] },
      { name: 'without the bell · Suzu', comp: 'suzu', shots: ['folio', 'floor', 'turned', 'decide'] },
    ],
  },
  'ch6.ren': {
    scene: 'sa.shelf_ren', at: ['sa.memories', 4, 7, 'up'], flags: F(C6, { sa_promise_done: true }), quests: { sa_main: 4, ren_ushio: 1 }, stay: [], reach: [{ to: 'sa.study' }, { to: 'sa.conduits' }], drawsComp: true,
    facts: [{ shot: 'open', cond: 'sa_ren_took&comp=ren', why: 'Ren chose to open it' }],
    runs: [
      { name: 'Ren · "Take it back" · the dog with you', comp: 'ren', pet: 'dog', choose: [/Take it back/], shots: ['open', 'face', 'ren'], branch: 'sa_ren_took', quick: true },
      { name: 'Ren · "You decide"', comp: 'ren', choose: [/You decide/], shots: ['open', 'face', 'ren'], branch: 'sa_ren_took' },
      { name: 'Ren · "Leave it" (no sequence)', comp: 'ren', choose: [/Leave it\. You already/], shots: [], branch: 'sa_ren_left' },
      { name: 'Mio (Ren not here: no sequence)', comp: 'mio', choose: [/Don't open it/], shots: [], flagsAfter: { sa_ren_took: false } },
    ],
  },
};

// ---- in the page: the recorders ---------------------------------------------------------------------------------
function install() {
  if (window.__HX) return;
  const H = (window.__HX = { k: new Map(), pets: [], tests: [], lines: [], inv: [], ev: [], entry: null, exit: null, ctx: null, pcKey: null, after: [] });
  const J = (o) => { try { return JSON.stringify(o); } catch (e) { return null; } };
  const byLook = new Map();
  for (const [id, ch] of Object.entries(RB.content.chars)) if (ch && ch.look) { const k = J(ch.look); if (!byLook.has(k)) byLook.set(k, []); byLook.get(k).push(id); }
  const ident = (lk) => { if (!lk) return []; const k = J(lk); if (H.pcKey && k === H.pcKey) return ['pc']; return byLook.get(k) || ['?']; };
  const note = (ids) => { const c = H.ctx; if (!c) return; for (const id of ids) { const key = c.seq + '|' + c.shot + '|' + c.phase + '|' + id; H.k.set(key, (H.k.get(key) || 0) + 1); } };
  const Q = RB.seqKit;
  const f0 = Q.figure, b0 = Q.bust, k0 = Q.back;
  Q.figure = function (look) { note(ident(look)); return f0.apply(this, arguments); };
  Q.bust = function (who) { note(typeof who === 'string' ? [who] : ident(who && who.look)); return b0.apply(this, arguments); };
  Q.back = function (lk) { note(ident(lk)); return k0.apply(this, arguments); };
  const s0 = RB.portraits.subject;
  RB.portraits.subject = function (who, look) { if (H.ctx) note(who === 'pc' ? ['pc'] : [who]); return s0.apply(this, arguments); };
  const pf = RB.petArt.frame;
  RB.petArt.frame = function (sp) { if (H.ctx) H.pets.push((H.ctx.seq || '') + '|' + H.ctx.shot + '|' + sp); return pf.apply(this, arguments); };
  const t0 = RB.state.test;
  RB.state.test = function (s, cond) { const v = t0.apply(this, arguments); if (H.ctx) H.tests.push(H.ctx.seq + '|' + H.ctx.shot + '|' + cond + '=' + !!v); return v; };
  // every shot's draw knows where it is (the prologue too)
  for (const id of RB.sequence.ids()) {
    const def = RB.sequence.get(id);
    for (const [sid, sd] of Object.entries(def.shots)) {
      const d0 = sd.draw;
      sd.draw = function (c, w, h, t, st) { const was = H.ctx; H.ctx = { seq: st.seq || id, shot: sid, phase: st.phase, review: !!st.review }; try { return d0.apply(this, arguments); } finally { H.ctx = was; } };
    }
  }
  // the line shown under which shot and phase; inventory changes in order with the lines
  const say0 = RB.ui.dialogue.say;
  RB.ui.dialogue.say = function (line) {
    const q = RB.sequence.state();
    H.lines.push({ n: H.lines.length, seq: q ? q.id : null, shot: q ? q.shot : null, phase: q ? q.phase : null, who: (line && line.who) || null, en: ((line && line.en) || '').slice(0, 50) });
    return say0.apply(this, arguments);
  };
  for (const op of ['give', 'take']) {
    const o0 = RB.state[op];
    RB.state[op] = function (s, item, n) { const q = RB.sequence.state(); if (s === RB.game.s && H.live) H.inv.push({ op, item, n: n == null ? 1 : n, at: H.lines.length, seq: q ? q.id : null, shot: q ? q.shot : null, phase: q ? q.phase : null }); return o0.apply(this, arguments); };
  }
  const snap = () => {
    const W = RB.world.W, s = RB.game.s;
    // what each person holds: a prop given by !prop, or the one a held gesture carries (prop=…)
    const heldOf = (a) => (a && a.stg && ((a.stg.held && a.stg.held.kind) || (a.stg.run && a.stg.run.prop))) || null;
    const held = { pc: heldOf(W.player) };
    // (by placement id and by person: a placement may have its own id, e.g. wataru_office for Wataru)
    for (const a of W.npcs.concat(W.extras || [])) { held[a.id] = heldOf(a); if (a.def && a.def.char) held[a.def.char] = heldOf(a); }
    if (W.comp) held[W.comp.id] = heldOf(W.comp);
    const q = Object.fromEntries(Object.entries(s.quests).map(([k, v]) => [k, v.done ? 'done' : v.stage]));
    const want = (W.map.def.npcs || []).filter((n) => (!n.if || RB.state.test(s, n.if)) && !(s.comp && n.id === s.comp && !n.alwaysShow)).map((n) => n.id);
    return {
      map: W.map.id, pc: [W.player.x, W.player.y, W.player.dir], comp: W.comp ? { id: W.comp.id, x: W.comp.x, y: W.comp.y } : null,
      npcs: W.npcs.map((n) => ({ id: n.id, char: (n.def && n.def.char) || n.id, x: n.x, y: n.y, home: n.home, walking: !!(n.route || n.mv), wander: !!(n.def && n.def.wander) })),
      leavers: (W.leavers || []).map((n) => n.id).concat((W.leavers || []).map((n) => (n.def && n.def.char) || n.id)), extras: (W.extras || []).map((n) => n.id).concat((W.extras || []).map((n) => (n.def && n.def.char) || n.id)), want,
      flags: Object.keys(s.flags).filter((f) => s.flags[f] && !/^enter:|^named:|^trig:|^foe:/.test(f)).sort(), inv: Object.assign({}, s.inv), q, held,
      pet: RB.petWorld.state ? (() => { const st = RB.petWorld.state(); return st ? { shown: !!st.shown, x: st.x, y: st.y } : null; })() : null,
    };
  };
  H.snap = snap;
  RB.bus.on('sequence:begin', (e) => { H.ev.push(['begin', e.id]); if (!H.entry) H.entry = {}; H.entry[e.id] = snap(); H.pcKey = J(RB.equip.look(RB.game.s)); });
  RB.bus.on('sequence:end', (e) => {
    H.ev.push(['end', e.id, e.why || null]);
    if (!H.exit) H.exit = {};
    H.exit[e.id] = snap();
    // the first world frames after the picture: who is visible on the map (standing, walking in or out)
    const id = e.id, seen = new Set(), t1 = performance.now();
    const look = () => { const W = RB.world.W; for (const a of W.npcs.concat(W.leavers || [], W.extras || [])) { seen.add(a.id); if (a.def && a.def.char) seen.add(a.def.char); } if (performance.now() - t1 < 1200 && W.map) requestAnimationFrame(look); else H.after.push({ id, seen: [...seen], map: W.map && W.map.id }); };
    requestAnimationFrame(look);
  });
}
// where you can go on foot from where you stand: the exits reached (and their maps), and every tile reached
function reach() {
  const W = RB.world.W, s = RB.game.s, m = W.map;
  const test = (c) => !c || RB.state.test(s, c);
  const seen = new Set([W.player.x + ',' + W.player.y]), q = [[W.player.x, W.player.y]];
  const D4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  while (q.length) {
    const [x, y] = q.pop();
    for (const [dx, dy] of D4) { const nx = x + dx, ny = y + dy, k = nx + ',' + ny; if (seen.has(k) || nx < 0 || ny < 0 || nx >= m.w || ny >= m.h || RB.maps.blockedStatic(m, nx, ny)) continue; seen.add(k); q.push([nx, ny]); }
  }
  const to = [];
  for (const e of m.exits || []) {
    if (!test(e.if) || (e.locked && !(e.unlock && test(e.unlock)))) continue;
    let hit = false;
    for (let y = e.y; y < e.y + (e.h || 1) && !hit; y++) for (let x = e.x; x < e.x + (e.w || 1) && !hit; x++) if (seen.has(x + ',' + y) || (RB.maps.blockedStatic(m, x, y) && D4.some(([dx, dy]) => seen.has((x + dx) + ',' + (y + dy))))) hit = true;
    if (hit) to.push(e.to);
  }
  // props that can be used: a reached tile beside their footprint
  const props = [];
  for (const pr of m.props || []) {
    const pd = RB.props.P[pr.p] || {}, w = pr.w || pd.w || 1, h = pr.h || pd.h || 1;
    let hit = false;
    for (let y = pr.y; y < pr.y + h && !hit; y++) for (let x = pr.x; x < pr.x + w && !hit; x++) if (D4.some(([dx, dy]) => seen.has((x + dx) + ',' + (y + dy)))) hit = true;
    if (hit) props.push(pr.p);
  }
  return { to: [...new Set(to)], tiles: [...seen], props: [...new Set(props)] };
}

async function start(p, S, R, o) {
  await p.evaluate(install);
  await p.evaluate(async ([S, R, o]) => {
    const H = window.__HX;
    const s = RB.game.debugStart(S.at[0], S.at[1], S.at[2], { comp: R.comp || undefined, flags: Object.assign({}, S.flags, R.flags || {}), dir: S.at[3] || 'up' });
    if (!R.comp) { s.comp = null; RB.world.placeCompanion(); }
    for (const it of (S.give || []).concat(R.bell ? ['lf_toya_bell'] : [])) RB.state.give(s, it, 1);
    for (const [k, v] of Object.entries(S.quests || {})) RB.state.setQuest(s, k, v);
    // a pet met (and selected) earlier in this campaign; "Show pet in exploration" off for a hidden one
    RB.game.settings.petWorld = !R.petHidden;
    if (R.pet) { RB.pets.meet(s, R.pet, s.map); RB.pets.select(s, R.pet); }
    // no creature or arrival scene interferes with the moment
    for (const m in RB.content.maps) for (const f of RB.content.maps[m].foes || []) s.flags['foe:' + m + ':' + f.id] = true;
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
    RB.world.refreshActors();
    if (R.comp) RB.world.placeCompanion();
    RB.game.settings.textSpeed = 'instant';
    RB.game.settings.reducedMotion = !!o.reduce; RB.game.applySettings();
    // stand-ins (not under test here): the challenges pass, lessons and cards are read, saves are not written
    RB.challenge.run = async () => ({ ok: true });
    RB.lessons.run = async () => {}; RB.lessons.grammarCard = async () => {};
    RB.ui.card = async () => {}; RB.save.autosave = async () => {};
    if (RB.hooks) RB.hooks.suzu_speech = async () => {};
    await new Promise((r) => setTimeout(r, 1100)); // (the map has been entered a while: comings and goings walk, as in play)
    Object.assign(H, { k: new Map(), pets: [], tests: [], lines: [], inv: [], ev: [], entry: null, exit: null, after: [], live: true, wantStart: H.snap() });
    window.__done = false; window.__err = null;
    RB.script.run(S.scene).then(() => { window.__done = true; }, (e) => { window.__err = String(e && e.stack || e); window.__done = true; });
  }, [S, R, o]);
}
const S = (p) => p.evaluate(() => ({ seq: RB.sequence.state(), n: RB.game.s.backlog.length, done: window.__done, open: RB.ui.dialogue.isOpen(), choices: [...document.querySelectorAll('.choices:not(.hidden) .choice')].map((c) => c.textContent), confirm: !!document.querySelector('.csheet') }));
async function play(p, R) {
  const choose = (R.choose || []).slice();
  let picked = 0, stuck = 0, last = null;
  for (let i = 0; i < 900; i++) {
    const s = await S(p);
    if (s.done) break;
    const sig = JSON.stringify([s.n, s.seq && s.seq.shot, s.seq && s.seq.state, s.choices.length, s.open]);
    stuck = sig === last ? stuck + 1 : 0; last = sig;
    if (stuck > 300) return { stuck: sig };
    if (s.confirm) { await p.locator('.csheet button', { hasText: 'Keep watching' }).click().catch(() => {}); continue; }
    if (s.choices.length) {
      const re = choose.length ? choose.shift() : /./;
      const k = Math.max(0, s.choices.findIndex((t) => re.test(t)));
      await p.locator('.choices:not(.hidden) .choice').nth(k).click();
      picked++;
      await wait(p, 120);
      continue;
    }
    if (s.open) {
      await p.waitForFunction(() => { const q = RB.sequence.state(); return !q || q.state !== 'entering'; }, null, { timeout: 4000 }).catch(() => {});
      await p.click('#ui .dlg .b-next', { timeout: 2000 }).catch(() => {});
      await p.waitForFunction((n0) => window.__done || RB.game.s.backlog.length !== n0 || !!document.querySelector('.choices:not(.hidden) .choice'), s.n, { timeout: 4000 }).catch(() => {});
      continue;
    }
    await wait(p, 40);
  }
  return { picked };
}
// after the scene: wait until nobody is walking (bounded), then read the world
async function after(p, bound) {
  return p.evaluate(async (bound) => {
    const H = window.__HX, W = RB.world.W;
    H.live = false;
    const walking = (a) => a.route || (a.mv && !(a.def && a.def.wander));
    const t0 = performance.now();
    await new Promise((r) => setTimeout(r, 200));
    for (let calm = 0; calm < 6 && performance.now() - t0 < bound; await new Promise((r) => setTimeout(r, 80))) calm = W.npcs.concat(W.extras || [], W.leavers || [], W.comp ? [W.comp] : []).some(walking) || (W.leavers || []).length ? 0 : calm + 1;
    await new Promise((r) => setTimeout(r, 300));
    const fin = H.snap();
    return { fin, entry: H.entry, exit: H.exit, after: H.after, ev: H.ev, drawn: [...H.k.keys()], pets: H.pets, tests: [...new Set(H.tests)], lines: H.lines, inv: H.inv, err: window.__err, wantStart: H.wantStart,
      compGap: W.comp ? Math.abs(W.comp.x - W.player.x) + Math.abs(W.comp.y - W.player.y) : 0, live: RB.sequence.active(), seenRec: JSON.parse(JSON.stringify(RB.game.s.seq || {})) };
  }, bound);
}

// ---- the checks of one run ----------------------------------------------------------------------------------------
function check(id, D, R, r) {
  const pre = id + ' · ' + R.name + ': ';
  const begun = r.ev.filter((e) => e[0] === 'begin').map((e) => e[1]);
  const want = R.shots && !R.shots.length ? [] : [id].concat(D.chain || []);
  ok(!r.err && !r.stuck, pre + 'the scene plays to its end' + (r.err ? ' (' + r.err.split('\n')[0] + ')' : '') + (r.stuck ? ' (stuck at ' + r.stuck + ')' : ''));
  ok(JSON.stringify(begun) === JSON.stringify(want) && !r.live, pre + 'begins ' + (want.join(', ') || 'no sequence') + ', each once, and ends it (' + (begun.join(', ') || 'none') + ')');
  if (!want.length) return;
  // the shots shown, in order (from the lines shown under them)
  const order = (seq) => { const o = []; for (const l of r.lines) if (l.seq === seq && l.shot && o[o.length - 1] !== l.shot) o.push(l.shot); return o; };
  if (R.shots) ok(JSON.stringify(order(id)) === JSON.stringify(R.shots), pre + 'shots ' + R.shots.join(' → ') + ' (' + order(id).join(' → ') + ')');
  const phasesOf = (shot) => new Set(r.lines.filter((l) => l.seq === id && l.shot === shot).map((l) => l.phase));
  for (const [shot, ps] of Object.entries(R.phases || {})) ok(ps.every((x) => phasesOf(shot).has(x)), pre + shot + ' shows ' + ps.join(', ') + ' (the branch\'s own phase)');
  for (const [shot, ps] of Object.entries(R.noPhase || {})) ok(!ps.some((x) => phasesOf(shot).has(x)), pre + shot + ' never shows ' + ps.join(', ') + ' (not this branch)');
  if (R.branch) ok(r.fin.flags.includes(R.branch), pre + 'the branch taken is the branch kept (' + R.branch + ')');
  for (const [f, v] of Object.entries(R.flagsAfter || {})) ok(r.fin.flags.includes(f) === v, pre + f + (v ? ' set' : ' not set') + ' afterwards');
  for (const sq of want) {
    const E = r.entry && r.entry[sq], X = r.exit && r.exit[sq];
    if (!E || !X) { ok(false, pre + sq + ': recorded on entry and on return'); continue; }
    const DS = SEQ[sq];
    // who is drawn
    const drawn = new Map();
    for (const k of r.drawn) { const [sid, shot, ph, who] = k.split('|'); if (sid !== sq) continue; if (!drawn.has(who)) drawn.set(who, new Set()); drawn.get(who).add(shot); }
    const onMap = new Set(E.npcs.map((n) => n.char).concat(E.npcs.map((n) => n.id)));
    const speakers = new Set(r.lines.filter((l) => l.seq === sq).map((l) => l.who).filter(Boolean));
    const comp = E.comp ? E.comp.id : null;
    const bad = [];
    for (const [who, shots] of drawn) {
      if (who === '?' || who === 'pc') continue;
      if (ALL4.includes(who)) { if (who !== comp && !onMap.has(who)) bad.push(who + ' (a companion not with you and not here) in ' + [...shots].join(',')); continue; }
      if (!onMap.has(who) && !speakers.has(who) && !((DS.extra || {})[who])) bad.push(who + ' (not on the map at entry) in ' + [...shots].join(','));
    }
    ok(bad.length === 0, pre + sq + ': everyone drawn is here (you' + (comp ? ', ' + comp : '') + ', the people of ' + E.map + ') — ' + ([...drawn.keys()].filter((w) => w !== '?').join(' ') || 'nobody identified') + (bad.length ? ' — NOT HERE: ' + bad.join('; ') : ''));
    if (!comp) ok(!ALL4.some((c) => drawn.has(c) && !onMap.has(c)), pre + sq + ': no companion drawn (none travels with you yet)');
    if (comp && DS.drawsComp) ok(drawn.has(comp), pre + sq + ': your companion (' + comp + ') is drawn with you');
    if (comp) ok(ALL4.filter((c) => c !== comp && drawn.has(c)).every((c) => onMap.has(c)), pre + sq + ': no other companion drawn as yours');
    for (const n of R.drawsNpc || []) if (sq === id) ok(drawn.has(n) && onMap.has(n), pre + sq + ': ' + n + ' drawn as a person of the place (on the map at entry)');
    ok(r.pets.filter((x) => x.startsWith(sq + '|')).length === 0, pre + sq + ': no animal drawn' + (R.pet ? ' (' + R.pet + (R.petHidden ? ' met, hidden by the setting' : ' with you') + ')' : '') + (r.pets.length ? ' — ' + r.pets.slice(0, 3).join(' ') : ''));
    // who stays, who left
    const gone = (DS.gone || []).filter((g) => (r.after.find((a) => a.id === sq) || { seen: [] }).seen.includes(g) || X.npcs.some((n) => n.id === g || n.char === g) || X.leavers.includes(g));
    if ((DS.gone || []).length) ok(gone.length === 0, pre + sq + ': the people the pictures showed leaving are not in the world on return (' + DS.gone.join(', ') + (gone.length ? '; still there: ' + gone.join(', ') : '') + ')');
    const stayMiss = (DS.stay || []).filter((g) => !X.npcs.some((n) => n.id === g || n.char === g) && !X.extras.includes(g));
    if ((DS.stay || []).length) ok(stayMiss.length === 0, pre + sq + ': the people the pictures left in place are there on return (' + DS.stay.join(', ') + (stayMiss.length ? '; missing: ' + stayMiss.join(', ') : '') + ')');
    for (const [who, prop] of Object.entries(DS.held || {})) ok((X.held[who] || null) === prop, pre + sq + ': on return ' + who + ' holds ' + (prop || 'nothing') + ' (' + (X.held[who] || 'nothing') + ')');
    if (comp) ok(X.comp && X.comp.id === comp, pre + sq + ': your companion is on the map on return');
    // what was handed over: each change with the line of the shot that shows it; the sequence's total
    const invHere = r.inv.filter((x) => x.seq === sq);
    const exp = (DS.inv || []).filter((x) => !x.seq || x.seq === sq);
    for (const e of exp) {
      // the shot (and phase) on screen as it changes hands, or the line that follows it in the sequence
      const ch = invHere.find((x) => x.item === e.item);
      const line = ch ? r.lines.find((l) => l.n >= ch.at && l.seq === sq) : null;
      const m = (q) => q && q.shot === e.shot && (!e.phase || q.phase === e.phase);
      ok(!!ch && (m(ch) || m(line)), pre + sq + ': ' + e.item + ' ' + (e.n > 0 ? 'given' : 'taken') + ' as ' + e.shot + (e.phase ? '/' + e.phase : '') + ' shows it' + (ch ? ' (on screen ' + ch.shot + '/' + ch.phase + (line ? ', next line ' + line.shot + '/' + line.phase : '') + ')' : ' (no change)'));
    }
    const dInv = {};
    for (const k of new Set(Object.keys(E.inv).concat(Object.keys(X.inv)))) { const d = (X.inv[k] || 0) - (E.inv[k] || 0); if (d) dInv[k] = d; }
    const wInv = {};
    for (const e of exp) wInv[e.item] = (wInv[e.item] || 0) + e.n;
    ok(JSON.stringify(Object.entries(dInv).sort()) === JSON.stringify(Object.entries(wInv).sort()), pre + sq + ': the inventory changes by exactly what the pictures hand over (' + (JSON.stringify(dInv)) + ')');
    // no future reveal: what each shot depicts holds when it is first shown (or by the sequence's end)
    const facts = (DS.facts || []).concat(sq === id ? R.facts || [] : []);
    const shownAt = (shot) => r.lines.find((l) => l.seq === sq && l.shot === shot);
    for (const f of facts) {
      const l = shownAt(f.shot);
      if (!l) continue; // (a shot of another branch)
      const holds = f.when === 'end' ? r.cond[sq + '|end|' + f.cond] : f.when === 'scene' ? r.condFin[f.cond] : r.cond[sq + '|' + f.shot + '|' + f.cond];
      ok(holds === true, pre + sq + ': ' + f.shot + ' shows only what has happened — ' + f.cond + (f.when === 'end' ? ' by the sequence\'s end' : f.when === 'scene' ? ' by the scene\'s end (set in the dark after the pictures, before the world shows again)' : ' when first shown') + (f.why ? ' (' + f.why + ')' : '') + (holds === true ? '' : ' — ' + holds));
    }
    const tested = r.tests.filter((x) => x.startsWith(sq + '|'));
    if (R.tested && sq === id) ok(R.tested.every((c) => tested.some((x) => x.includes('|' + c + '='))), pre + sq + ': the shots read ' + R.tested.join(', ') + ' from the campaign (' + (tested.join(' ') || 'nothing read') + ')');
  }
  // after the scene: the people placed by the story, your companion beside you, the ways on
  const want2 = new Set(r.fin.want), have = new Set(r.fin.npcs.map((n) => n.id));
  const extra = [...have].filter((x) => !want2.has(x)), miss = [...want2].filter((x) => !have.has(x));
  ok(extra.length === 0 && miss.length === 0 && !r.fin.leavers.length, pre + 'afterwards the people on ' + r.fin.map + ' are those the story places there (' + (extra.length ? 'extra: ' + extra.join(',') + ' ' : '') + (miss.length ? 'missing: ' + miss.join(',') : '') + (r.fin.leavers.length ? ' leaving: ' + r.fin.leavers.join(',') : '') + ')');
  const away = r.fin.npcs.filter((n) => n.home && !n.wander && (n.x !== n.home[0] || n.y !== n.home[1])).map((n) => n.id + '@' + n.x + ',' + n.y);
  ok(away.length === 0, pre + 'afterwards everyone is at their place' + (away.length ? ' (' + away.join(' ') + ')' : ''));
  if (R.comp) ok(r.fin.comp && r.fin.comp.id === R.comp && r.compGap <= 2, pre + 'your companion is beside you afterwards (' + r.compGap + ' tiles)');
  if (R.map) ok(r.fin.map === R.map, pre + 'the world continues on ' + R.map + ' (' + r.fin.map + ')');
  for (const g of R.reach || D.reach || []) {
    if (g.to) ok(r.reach.to.includes(g.to), pre + 'from where you stand on ' + r.fin.map + ' the way to ' + g.to + ' is open on foot (' + r.reach.to.join(', ') + ')');
    if (g.tile) ok(r.reach.tiles.includes(g.tile.join(',')), pre + (g.why || g.tile.join(',')) + ' is reachable on foot');
    if (g.prop) ok(r.reach.props.includes(g.prop), pre + (g.why || g.prop) + ' can be reached on foot (a tile beside it)');
  }
  for (const [k, v] of Object.entries(D.invAfter || {})) { const E = r.entry[id]; const d = (r.fin.inv[k] || 0) - ((E && E.inv[k]) || 0); ok(d === v, pre + 'after the scene ' + k + ' ' + (v < 0 ? 'is no longer yours' : 'is yours') + ' (' + d + ')'); }
  if (R.pet && !R.petHidden && r.fin.pet) ok(r.fin.pet.shown, pre + 'the pet is with you in the world again afterwards');
}

// ---- run ------------------------------------------------------------------------------------------------------------
const ids = await (async () => { const { p, ctx } = await page(b, url); const v = await p.evaluate(() => RB.sequence.ids()); await ctx.close(); return v; })();
for (const id of ids) if (id !== 'prologue') ok(!!SEQ[id] && (SEQ[id].runs || SEQ[id].chained), 'sequence ' + id + ' has runs here (by name)');
for (const id of Object.keys(SEQ)) ok(ids.includes(id), 'sequence ' + id + ' is registered');

for (const [id, D] of Object.entries(SEQ)) {
  if (!D.runs) continue;
  if (ONLY && !ONLY.includes(id) && !(D.chain || []).some((c) => ONLY.includes(c))) continue;
  for (const R of D.runs.filter((x) => !QUICK || x.quick)) {
    const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 720 } });
    // the campaign conditions at each shot's first line (and by the end of each sequence) for the facts
    await start(p, D, R, {});
    const facts = {};
    for (const sq of [id].concat(D.chain || [])) for (const f of (SEQ[sq].facts || []).concat(sq === id ? R.facts || [] : [])) facts[sq + '|' + f.shot + '|' + f.cond] = { sq, shot: f.shot, cond: f.cond, end: f.when === 'end' };
    await p.evaluate((facts) => {
      const H = window.__HX, s0 = RB.ui.dialogue.say;
      H.cond = {};
      RB.ui.dialogue.say = function (line) {
        const q = RB.sequence.state();
        if (q) for (const f of Object.values(facts)) if (!f.end && f.sq === q.id && f.shot === q.shot && !((f.sq + '|' + f.shot + '|' + f.cond) in H.cond)) H.cond[f.sq + '|' + f.shot + '|' + f.cond] = RB.state.test(RB.game.s, f.cond);
        return s0.apply(this, arguments);
      };
      RB.bus.on('sequence:end', (e) => { for (const f of Object.values(facts)) if (f.end && f.sq === e.id) H.cond[f.sq + '|end|' + f.cond] = RB.state.test(RB.game.s, f.cond); });
    }, facts);
    const pl = await play(p, R);
    const r = await after(p, D.settle || 6000);
    r.stuck = pl.stuck || null;
    r.cond = await p.evaluate(() => window.__HX.cond);
    r.condFin = await p.evaluate((cs) => Object.fromEntries(cs.map((c) => [c, RB.state.test(RB.game.s, c)])), Object.values(facts).map((f) => f.cond));
    r.reach = await p.evaluate(reach);
    check(id, D, R, r);
    ok(errors.length === 0, id + ' · ' + R.name + ': no page errors' + (errors.length ? ' — ' + errors.slice(0, 2).join(' | ') : ''));
    await ctx.close();
  }
}

// ---- the prologue: outside any scene and campaign -------------------------------------------------------------------
if (!ONLY || ONLY.includes('prologue')) {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 720 } });
  await p.evaluate(install);
  await p.click('text=New Game');
  await p.click('.slot[data-slot="1"] [data-a=start]');
  await p.waitForSelector('.cr-prologue .slip');
  const before = await p.evaluate(() => ({ s: !!RB.game.s, map: RB.game.s ? RB.game.s.map : null }));
  for (let i = 0; i < 12; i++) {
    const on = await p.evaluate(() => !!document.querySelector('.cr-prologue .slip'));
    if (!on) break;
    await p.waitForFunction(() => { const v = RB.sequence.viewState && RB.sequence.viewState(); return !v || v.state !== 'entering'; }, null, { timeout: 3000 }).catch(() => {});
    await wait(p, 350);
    await p.click('.cr-prologue [data-a=next]', { timeout: 2000 }).catch(() => {});
    await wait(p, 250);
  }
  const r = await p.evaluate(() => ({ drawn: [...window.__HX.k.keys()].filter((k) => k.startsWith('prologue|')), pets: window.__HX.pets.filter((k) => k.startsWith('prologue|')), slip: !!document.querySelector('.cr-prologue .slip'), s: !!RB.game.s, map: RB.game.s ? RB.game.s.map : null }));
  const comps = r.drawn.filter((k) => ALL4.includes(k.split('|')[3]));
  ok(!r.slip, 'prologue: played through to the creation folio');
  ok(comps.length === 0 && r.pets.length === 0, 'prologue: no companion and no animal drawn (' + (comps.concat(r.pets).join(' ') || 'none') + ')');
  ok(r.s === before.s && r.map === before.map, 'prologue: no campaign written while it plays (' + JSON.stringify(before) + ' → ' + JSON.stringify({ s: r.s, map: r.map }) + ')');
  ok(errors.length === 0, 'prologue: no page errors' + (errors.length ? ' — ' + errors.slice(0, 2).join(' | ') : ''));
  await ctx.close();
}

await b.close();
srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
