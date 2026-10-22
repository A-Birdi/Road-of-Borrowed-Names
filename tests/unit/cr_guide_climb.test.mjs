// RBN-QA-099 (Agnes 6337095228, 6337348871; Local CL-181; Cloud CC-106, CC-109): on the Cloudroad, while you climb
// station by station (cr_main stage 2), the Journey's next step named Kirishita throughout: the stage has no authored
// place, and the guide derived the stage's own end (arriving at Kirishita), past every station's work. Now the stage
// names the furthest station's own work, in order: Kanbe while there is no ledger; that station's person while the
// message from below is undelivered; its lamp while it has no name; its person while they have no message for you;
// the way east (34,12) until the road on is planned; then the next station. Checked against the guide itself (the
// same analysis the markers and the Journey's "Next" lines use):
//  1. each step of all five stations in turn, and each target real: the person on that map, the unlit lamp at that
//     tile, the departure's trigger at (34,12), the next station's map; the "Next" line names it;
//  2. lamp and message in either order: whichever is left is the step;
//  3. a message passed on with more certainty than you had and put right (or not) in talk: never a step;
//  4. a cancelled plan: the way east again; the fog wait at Umagaeshi (planned, then the night): Kirishita;
//  5. ridden back down by palanquin: the step stays the furthest station's, wherever you stand;
//  6. reading is pure: asking for the step, the "Next" lines and the nudges changes nothing in the journey;
//  7. stage 3 onward as before (no new authored places there; Nao's night at Kirishita unchanged).
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const C = RB.content, G = RB.questGuide;
  const ST = ['', 'cr.oiwake', 'cr.suginoki', 'cr.sakashita', 'cr.nakayama', 'cr.umagaeshi', 'cr.kirishita'];
  const WHO = ['', 'cr_kanbe', 'cr_ine', 'cr_heisuke', 'cr_otaki', 'cr_genji'];
  const WHOMAP = ['', 'cr.oiwake_post', 'cr.suginoki', 'cr.sakashita', 'cr.nakayama', 'cr.umagaeshi'];
  const BEFORE = ['departed', 'ch1_done', 'ch2_done', 'mb1_done', 'mb2_done', 'ch3_done', 'ch4_done', 'kr_done', 'ch5_done', 'ko_done', 'cr_called', 'cr_kanbe_met'];
  // a journey on the Cloudroad at stage 2: `upTo` stations' work all done below the furthest station n, and at n the
  // flags given
  function camp(n, at, extra) {
    const s = RB.state.newCampaign({ edition: 2 });
    s.id = 'qa099'; s.comp = 'mio';
    for (const f of BEFORE) s.flags[f] = true;
    s.inv.cr_ledger = 1; s.inv.cr_papers = 1;
    for (let k = 1; k < n; k++) {
      Object.assign(s.flags, { ['cr_st' + k]: true, ['cr_lamp' + k]: true, ['cr_given' + k]: true, ['cr_plan' + k]: true });
      if (k > 1) s.flags['relay_cr_r' + (k - 1) + '_done'] = true;
    }
    s.flags['cr_st' + n] = true;
    for (const f of at || []) s.flags[f] = true;
    Object.assign(s.flags, extra || {});
    s.quests.cr_main = { stage: 2, done: false, t: 1 };
    s.map = ST[n]; s.x = 17; s.y = 13;
    RB.game.s = s;
    return s;
  }
  const step = (s) => { const r = G.analyse('cr_main', s); return { r, w: r.targets.map((e) => e.map + ':' + e.kind + ':' + (e.id || e.p || '') + (e.x != null ? '@' + e.x + ',' + e.y : '')) }; };
  const one = (s) => step(s).w.join(' | ');
  const lampOf = (n) => { const p = C.maps[ST[n]].props.find((q) => q.p === 'cr_joyato' && q.if === '!cr_lamp' + n); return p ? p.x + ',' + p.y : null; };

  // ---- 1. each station's steps in turn ----------------------------------------------------------------------------
  {
    const s = camp(1, []); delete s.inv.cr_ledger;
    t.eq(one(s), 'cr.oiwake_post:npc:cr_kanbe@4,3', 'Oiwake, no ledger yet: Kanbe in the relay office');
  }
  for (let n = 1; n <= 5; n++) {
    const msgBelow = n > 1 ? ['cr_given' + (n - 1)] : [];
    const relayDone = n > 1 ? ['relay_cr_r' + (n - 1) + '_done'] : [];
    const who = WHOMAP[n] + ':npc:' + WHO[n];
    if (n > 1) t.ok(one(camp(n, msgBelow)).startsWith(who), ST[n] + ': the message from below undelivered: ' + WHO[n] + ' (' + one(camp(n, msgBelow)) + ')');
    const lamp = one(camp(n, msgBelow.concat(relayDone)));
    t.eq(lamp, ST[n] + ':prop:cr_joyato@' + lampOf(n), ST[n] + ': then the lamp, while it has no name');
    const giver = one(camp(n, msgBelow.concat(relayDone, ['cr_lamp' + n])));
    t.ok(giver.startsWith(who), ST[n] + ': then ' + WHO[n] + ', while they have no message for you (' + giver + ')');
    const east = one(camp(n, msgBelow.concat(relayDone, ['cr_lamp' + n, 'cr_given' + n])));
    t.eq(east, ST[n] + ':spot:@34,12', ST[n] + ': then the way east, until the road on is planned');
    const trig = C.maps[ST[n]].triggers.find((x) => x.x === 34 && x.y === 12);
    t.ok(trig && trig.scene === 'cr.depart' + n && trig.if === '!cr_plan' + n, ST[n] + ': (34,12) is the departure (cr.depart' + n + ', while !cr_plan' + n + ')');
    const on = one(camp(n, msgBelow.concat(relayDone, ['cr_lamp' + n, 'cr_given' + n, 'cr_plan' + n])));
    t.eq(on, ST[n + 1] + ':enter:', ST[n] + ': planned: the next station, ' + ST[n + 1]);
    // the "Next" line names it
    const s = camp(n, msgBelow.concat(relayDone));
    const next = G.nextLines(G.analyse('cr_main', s)).map((l) => l.en).join(' / ');
    t.ok(/the everlasting lamp/.test(next) && !/Kirishita/.test(next), ST[n] + ': the Journey\'s Next names the lamp, not Kirishita (' + next + ')');
  }
  // every person named is placed on that map in this state
  for (let n = 1; n <= 5; n++) {
    const s = camp(n, []);
    const p = (C.maps[WHOMAP[n]].npcs || []).find((x) => x.id === WHO[n]);
    t.ok(p && (!p.if || RB.state.test(s, p.if)), WHO[n] + ' stands in ' + WHOMAP[n] + ' while you are at station ' + n);
  }

  // ---- 2. lamp and message in either order ----------------------------------------------------------------------------
  for (let n = 2; n <= 5; n++) {
    const lit = one(camp(n, ['cr_given' + (n - 1), 'cr_lamp' + n]));
    t.ok(lit.startsWith(WHOMAP[n] + ':npc:' + WHO[n]), ST[n] + ': the lamp lit first, the message still to deliver: ' + WHO[n] + ' (' + lit + ')');
  }

  // ---- 3. corrections are never a step ------------------------------------------------------------------------------------
  for (const [n, flag] of [[3, 'cr_r2_crew'], [4, 'cr_r3_rescue'], [5, 'cr_r4_ledge']]) {
    const s = camp(n, ['cr_given' + (n - 1), 'relay_cr_r' + (n - 1) + '_done', 'cr_lamp' + n, 'cr_given' + n, flag]);
    t.eq(one(s), ST[n] + ':spot:@34,12', ST[n] + ': an overstated message (' + flag + ') not yet put right: still the way east');
  }

  // ---- 4. a cancelled plan; the fog wait -------------------------------------------------------------------------------------
  t.eq(one(camp(2, ['cr_given1', 'relay_cr_r1_done', 'cr_lamp2', 'cr_given2'])), 'cr.suginoki:spot:@34,12', 'a plan told and cancelled (cr_plan2 never set): the way east again');
  t.eq(one(camp(5, ['cr_given4', 'relay_cr_r4_done', 'cr_lamp5', 'cr_given5', 'cr_plan5'])), 'cr.kirishita:enter:', 'Umagaeshi, the road planned and the night waited out for the fog: Kirishita');

  // ---- 5. ridden back down by palanquin --------------------------------------------------------------------------------------
  {
    const s = camp(4, ['cr_given3']);
    const top = one(s);
    s.map = 'cr.suginoki'; s.x = 9; s.y = 11;
    t.eq(one(s), top, 'back down at Suginoki by palanquin: the step is still Nakayama\'s (' + top + ')');
  }

  // ---- 6. reading is pure ---------------------------------------------------------------------------------------------
  {
    const s = camp(3, ['cr_given2']);
    const before = JSON.stringify(s);
    for (let i = 0; i < 3; i++) { G.analyse('cr_main', s); G.targets('cr_main', s); G.nextLines(G.analyse('cr_main', s)); G.nudges('cr_main', s); }
    t.ok(JSON.stringify(s) === before, 'asking for the step, the Next lines and the nudges changes nothing in the journey');
  }

  // ---- 7. stage 3 onward as before -------------------------------------------------------------------------------------
  const stages = C.quests.cr_main.stages;
  t.ok(stages.every((stg, k) => k === 2 ? stg.atIf && stg.atIf.length === 1 + 5 * 5 - 1 : k === 6 ? stg.atIf && stg.atIf.length === 1 && stg.atIf[0].if === 'cr_nao_night' : !stg.atIf && !stg.at),
    'only stage 2 names the climb (' + (stages[2].atIf || []).length + ' steps); Nao\'s night at stage 6 as it was; no other stage authored');
  t.ok(stages[2].en === 'Give each station\'s lamp its name back and carry the relay\'s messages, climbing station by station.', 'the stage\'s own words unchanged');
  RB.game.s = null;
};
