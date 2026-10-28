// Thirty of What? after Chapter 3 (Agnes 6458259496; Local CL-515; Cloud CC-367 §2, CC-368, CC-370): the counting quest's
// steps belong to Sayo (stage 0), Kotarō (stage 1) and Nobu (the slip, then done), but after the story Sayo's and
// Kotarō's placements had no quest scene at all and Nobu's list put his after-chapter and postgame lines first, so a
// quest left open then could never move. In node:
//  1. the lists: Kotarō's after-story list is the one his two routine places hold; Nobu's, as the game loads it;
//  2. who says what, in Chapter 3, after it and in the postgame, at each stage, never taken and done;
//  3. the guide: Sayo, then Kotarō, then Nobu, in Chapter 3 as before and after it (the clay swallow given);
//  4. with the real runner, after Chapter 3 and in the postgame: Sayo (and not her festival-eve lines), Kotarō, then
//     Nobu's slip: the quest done once, the cup once, then their ordinary talk; in Chapter 3, Sayo goes on as before;
//  5. Kotarō at a routine place, through its own first line (the usual_talk hook): his step;
//  6. the clay swallow not yet given: Nobu gives it first (once), then takes the slip on the next talk.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state, G = RB.questGuide, test = S.test;
  const V = C.maps['co.village'].npcs;
  const sayoB = V.find((n) => n.id === 'co_sayo' && n.if === '!ch3_done'), sayoA = V.find((n) => n.id === 'co_sayo' && n.if === 'ch3_done');
  const kotB = V.find((n) => n.id === 'co_kotaro' && n.if === '!ch3_done'), kotA = V.find((n) => n.id === 'co_kotaro' && /ch3_done&slot/.test(n.if || ''));
  const kotGlass = C.maps['co.glass'].npcs.find((n) => n.id === 'co_kotaro_r3'), kotTerr = C.maps['co.terraces'].npcs.find((n) => n.id === 'co_kotaro_r2');
  const nobu = C.maps['co.pottery'].npcs.find((n) => n.id === 'co_nobu');
  const IN = { departed: true, ch1_done: true, ch2_done: true, co_arrived: true };
  const AFTER = Object.assign({}, IN, { co_restored: true, ch3_done: true, co_kiln_open: true, co_kiln_done: true });
  const POST = Object.assign({}, AFTER, { postgame: true });
  const journey = (flags, quest, o) => {
    o = o || {};
    const s = S.newCampaign({ edition: 2 }); s.comp = 'ren'; s.map = 'co.village'; s.x = 20; s.y = 18;
    Object.assign(s.flags, flags || {});
    if (s.flags.ch3_done) s.quests.co_main = { stage: 9, done: true, t: 1 };
    if (quest) { s.quests.co_count = Object.assign({}, quest); s.seen['co.nobu'] = true; }
    if (quest && quest.done) s.flags.co_count_done = true;
    if (o.swallow !== false && s.flags.ch3_done) { s.discovery = s.discovery || {}; s.discovery.keepsakes = Object.assign(s.discovery.keepsakes || {}, { clay_swallow: { t: 1 } }); }
    s.world = { towns: { cinder: { tick: 1, slots: { co_kotaro: o.slot || 1, co_goro: 1, co_shino: 1 }, leftAt: null, flags: {}, rests: 0 } } };
    RB.game.G.s = s; RB.game.s = s;
    return s;
  };
  const q = (k) => ({ stage: k, done: false, t: 1 }), done = { stage: 2, done: true, t: 2 };
  const pick = (n, s) => (n.talk.find((o) => !o.if || test(s, o.if)) || {}).scene;
  const who = (s) => [s.flags.ch3_done ? pick(sayoA, s) : pick(sayoB, s), s.flags.ch3_done ? pick(kotA, s) : pick(kotB, s), pick(nobu, s)].join(' / ');
  const where = (e) => e.map + ':' + e.kind + ':' + (e.id || e.p);

  // ---- 1. the lists
  t.ok(kotGlass && kotTerr && kotGlass.talk === kotA.talk && kotTerr.talk === kotA.talk, '1 Kotarō\'s glass-workshop and terrace places hold his after-story list itself');
  t.eq(nobu.talk.map((o) => o.scene), ['kr.lw_co_jars_nobu', 'cs.swallow_nobu', 'co.nobu', 'co.nobu_post', 'co.nobu_after', 'co.nobu'],
    '1 Nobu\'s list as loaded: the oil-jar news and the clay swallow (each once), then his quest while it is open, then as before');

  // ---- 2. who says what
  const rows = [];
  for (const [label, flags] of [['in Chapter 3', IN], ['after Chapter 3', AFTER], ['postgame', POST]]) {
    for (const [ql, quest] of [['never taken', null], ['stage 0', q(0)], ['stage 1', q(1)], ['stage 2', q(2)], ['done', done]]) rows.push(label + ', ' + ql + ': ' + who(journey(flags, quest)));
  }
  t.eq(rows, [
    'in Chapter 3, never taken: co.sayo / co.kotaro / co.nobu', 'in Chapter 3, stage 0: co.sayo / co.kotaro / co.nobu', 'in Chapter 3, stage 1: co.sayo / co.kotaro / co.nobu',
    'in Chapter 3, stage 2: co.sayo / co.kotaro / co.nobu', 'in Chapter 3, done: co.sayo / co.kotaro / co.nobu',
    'after Chapter 3, never taken: co.sayo_after / co.kotaro_after / co.nobu_after', 'after Chapter 3, stage 0: co.sayo / co.kotaro_after / co.nobu',
    'after Chapter 3, stage 1: co.sayo_after / co.kotaro / co.nobu', 'after Chapter 3, stage 2: co.sayo_after / co.kotaro_after / co.nobu',
    'after Chapter 3, done: co.sayo_after / co.kotaro_after / co.nobu_after',
    'postgame, never taken: co.sayo_post / co.kotaro_post / co.nobu_post', 'postgame, stage 0: co.sayo / co.kotaro_post / co.nobu',
    'postgame, stage 1: co.sayo_post / co.kotaro / co.nobu', 'postgame, stage 2: co.sayo_post / co.kotaro_post / co.nobu',
    'postgame, done: co.sayo_post / co.kotaro_post / co.nobu_post',
  ], '2 Sayo / Kotarō / Nobu: each takes their step while it is open, in any chapter; otherwise as before');

  // ---- 3. the guide (its cache reset for each state; the clay swallow given)
  const guide = [];
  for (const [label, flags] of [['in Chapter 3', IN], ['after Chapter 3', AFTER], ['postgame', POST]]) {
    for (const k of [0, 1, 2]) { G.reset(); const s = journey(flags, q(k)); s.follow = 'co_count'; guide.push(label + ' ' + k + ': ' + G.targets('co_count', s).targets.map(where).join(', ')); }
  }
  t.eq(guide, ['in Chapter 3 0: co.village:npc:co_sayo', 'in Chapter 3 1: co.village:npc:co_kotaro', 'in Chapter 3 2: co.pottery:npc:co_nobu',
    'after Chapter 3 0: co.village:npc:co_sayo', 'after Chapter 3 1: co.village:npc:co_kotaro', 'after Chapter 3 2: co.pottery:npc:co_nobu',
    'postgame 0: co.village:npc:co_sayo', 'postgame 1: co.village:npc:co_kotaro', 'postgame 2: co.pottery:npc:co_nobu'], '3 the guide: Sayo, then Kotarō, then Nobu, in Chapter 3 and after it');

  // ---- 4. the real runner
  const said = [], toasts = [], asked = [];
  RB.ui.dialogue.say = async (l) => { said.push(l.en); };
  RB.ui.dialogue.choose = async () => 0;
  RB.ui.dialogue.hide = () => {};
  RB.ui.toast = async (o) => { toasts.push(o.kind + ':' + o.en); };
  RB.ui.shake = () => {};
  RB.challenge.run = async (id) => { asked.push(id); return { ok: true }; };
  for (const k of ['dismissExtras', 'refreshActors']) RB.world[k] = () => {};
  RB.game.afterScene = () => {};
  RB.save.autosave = async () => {};
  const DONE = 'quest_done:Thirty of What?';
  const EVE = /calling everyone to the square at dusk|travelling performer wrote|If there's a performer here|The only worry is the lack of rain|fifty-two seats|laying out the seats/;
  for (const [label, flags, after] of [['after Chapter 3', AFTER, ['co.sayo_after', 'co.kotaro_after', 'co.nobu_after']], ['postgame', POST, ['co.sayo_post', 'co.kotaro_post', 'co.nobu_post']]]) {
    const s = journey(flags, q(0));
    said.length = 0; toasts.length = 0; asked.length = 0;
    await RB.script.run(pick(sayoA, s));
    const sayo = said.splice(0), st1 = s.quests.co_count.stage;
    await RB.script.run(pick(kotA, s));
    const kot = said.splice(0), st2 = s.quests.co_count.stage;
    await RB.script.run(pick(nobu, s));
    const nob = said.splice(0);
    const next = [pick(sayoA, s), pick(kotA, s), pick(nobu, s)];
    for (const sc of next) await RB.script.run(sc);
    t.ok(st1 === 1 && sayo.some((l) => /Thirty sake flasks\? I never ordered those!/.test(l)) && !sayo.some((l) => EVE.test(l)),
      '4 ' + label + ': Sayo takes stage 0 and ends there, without her festival-eve lines (' + JSON.stringify(sayo) + ')');
    t.ok(st2 === 2 && kot.some((l) => /Sayo's message\?/.test(l)), '4 ' + label + ': Kotarō takes stage 1 (' + JSON.stringify(kot) + ')');
    t.ok(s.quests.co_count.done && s.flags.co_count_done && asked.join() === 'co.c_count' && (s.inv.co_ash_cup || 0) === 1 && toasts.filter((x) => x === DONE).length === 1 &&
      nob.some((l) => /Clear as day\. Thirty small plates/.test(l)) && next.join() === after.join(),
    '4 ' + label + ': Nobu takes the slip; the quest done once, the cup once; then ' + after.join(', ') + ' (' + JSON.stringify({ q: s.quests.co_count, cup: s.inv.co_ash_cup, toasts, next }) + ')');
  }
  {
    // in Chapter 3: Sayo's step, then she goes on as before (her seating chart, first time)
    const s = journey(IN, q(0));
    said.length = 0;
    await RB.script.run(pick(sayoB, s));
    t.ok(s.quests.co_count.stage === 1 && said.some((l) => /Thirty sake flasks\?/.test(l)) && said.some((l) => /laying out the seats/.test(l)),
      '4 in Chapter 3: Sayo takes stage 0 and goes on to her seating chart, as before (' + JSON.stringify(said) + ')');
  }

  // ---- 5. Kotarō at a routine place: its own line, then his step
  for (const [label, n, sc, line, slot] of [['the terraces', kotTerr, 'co.lw_sl_co_kotaro_r2', /white goat got out again/, 2], ['the glass workshop', kotGlass, 'co.lw_sl_co_kotaro_r3', /Rule two/, 3]]) {
    const s = journey(AFTER, q(1), { slot });
    RB.world.W = { npcs: [{ id: n.id, def: n }] };
    said.length = 0;
    await RB.script.run(sc, { npc: n.id });
    t.ok(s.quests.co_count.stage === 2 && line.test(said[0] || '') && said.some((l) => /Sayo's message\?/.test(l)), '5 ' + label + ': its own line, then his step (' + JSON.stringify(said) + ')');
  }

  // ---- 6. the clay swallow not yet given, stage 2 after Chapter 3: the swallow first (once), then the slip
  {
    const s = journey(AFTER, q(2), { swallow: false });
    said.length = 0; toasts.length = 0;
    const first = pick(nobu, s);
    await RB.script.run(first);
    const kept = test(s, 'keepsake.clay_swallow'), mid = s.quests.co_count.done, second = pick(nobu, s);
    await RB.script.run(second);
    t.ok(first === 'cs.swallow_nobu' && kept && !mid && second === 'co.nobu' && s.quests.co_count.done && (s.inv.co_ash_cup || 0) === 1 && toasts.filter((x) => x === DONE).length === 1,
      '6 the swallow not yet given: Nobu gives it first, then takes the slip (' + JSON.stringify({ first, kept, mid, second, q: s.quests.co_count }) + ')');
  }
};
