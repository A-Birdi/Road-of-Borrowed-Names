// Quest guidance through an encounter (RBN-QA-087; Cloud CC-087, CC-088, CC-089; Agnes 6332919869, 6333031332;
// Local CL-162). The runner (src/engine/70_script.js) ends a scene on an encounter's loss or flight and otherwise
// goes on, with _res 1 for a win, 0 for a conclusion reached another way, and the conclusion's id in _enc. The guide's
// walker (src/engine/56_questguide.js) had no case for it, so a scene that goes on after
// `!encounter … / !if var._res=0 -> again` was read with whatever _res the save happened to hold: "waiting" after a
// miss, the right place after a win. Now the outcome is unknown after an encounter (either way, as after a challenge),
// _enc as well as _res, and a path that goes on as if one outcome held keeps it (it cannot take two conclusions).
// - The main stages that end in an encounter, from realistic states, whatever outcome the save carries in: the
//   Gardener, the Upper House desk, the Kettle Below, the courier at the hut, the guild hall's mediation.
// - Stages next to them unchanged (the satchel after the courier, the letter's addressee, the spring eggs).
// - The pin: a step that needs two different conclusions of one encounter at once is never "direct"; one that needs a
//   single conclusion is.
// - Reading never changes the state.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const C = RB.content, G = RB.questGuide;
  const where = (e) => e.map + ':' + e.kind + ':' + (e.id || e.p || '') + (e.x != null ? '@' + e.x + ',' + e.y : '');
  const mk = (flags, quests, extra, vars, items) => {
    const st = RB.state.newCampaign({ edition: RB.edition.forNew() });
    for (const f of flags) st.flags[f] = true;
    for (const [q, v] of Object.entries(quests)) RB.state.setQuest(st, q, v);
    Object.assign(st.vars, vars || {});
    for (const k in items || {}) st.inv[k] = items[k];
    return Object.assign(st, { comp: 'suzu' }, extra);
  };
  const live = (qid, st) => { const before = JSON.stringify([st.flags, st.quests, st.vars, st.inv]); const r = G.analyse(qid, st, { derive: true }); return { how: r.how, t: r.targets.map(where).sort(), pure: before === JSON.stringify([st.flags, st.quests, st.vars, st.inv]) }; };
  // what a save may carry in from the last challenge or encounter
  const INCOMING = [{}, { _res: 0 }, { _res: 1 }, { _res: 0, _enc: '' }, { _res: 1, _enc: 'stale_outcome' }, { _enc: 'settled' }, { _res: 0, _enc: 'over' }];

  const PRE = ['ch1_done', 'ch2_done', 'mb2_done', 'ch3_done', 'ch4_done', 'kr_done', 'ch5_done', 'departed'];
  const KO = PRE.concat(['ko_ch9', 'ko_arrived', 'ko_otoha_met', 'ko_tell_otoha', 'ko_tell_nami', 'ko_tell_hamaji', 'ko_tell_shell', 'tell_ko.t_hall_ok', 'ko_hollow_open', 'ko_roots_seen', 'ko_root_a', 'ko_tide_in', 'ko_root_b', 'ko_root_c', 'ko_reunited', 'ko_garden_seen']);
  const CR = PRE.concat(['ko_done', 'cr_called', 'cr_arrived', 'cr_drift_cleared', 'cr_hut_seen', 'cr_summit_seen']);
  const YN = PRE.concat(['ko_done', 'cr_done', 'yn_called', 'yn_arrived', 'yn_rokubei_met']);
  const cases = [
    // [label, quest, quests, flags, map, expected how, expected targets, items]
    ['ko_main 6 (the Gardener), from the Tidal Hollow', 'ko_main', { ko_main: 6 }, KO, 'ko.roots2', 'direct', ['ko.garden:prop:ko_rootarch@12,5']],
    ['ko_main 6 (the Gardener), in the garden', 'ko_main', { ko_main: 6 }, KO, 'ko.garden', 'direct', ['ko.garden:prop:ko_rootarch@12,5']],
    ['yn_main 2 (rooms for the newcomers)', 'yn_main', { yn_main: 2 }, YN, 'yn.kami', 'direct', ['yn.kami:npc:yn_tokuzo@10,2']],
    ['yn_main 5 (the Kettle Below)', 'yn_main', { yn_main: 5 }, YN.concat(['yn_rooms_done']), 'yn.kettle', 'direct', ['yn.kettle:trigger:@6,9']],
    ['cr_main 7 (the courier at the hut)', 'cr_main', { cr_main: 7 }, CR, 'cr.hut', 'needs', ['cr.hut:npc:cr_genta@15,11', 'cr.hut:trigger:@13,12']],
    ['yn_main 6 (the guild hall: an encounter whose scene branches on _enc)', 'yn_main', { yn_main: 6 }, YN.concat(['yn_rooms_done', 'yn_kettle_settled', 'yn_eve_done']), 'yn.guild', 'direct', ['yn.guild:npc:yn_rokubei@7,3']],
    // unchanged next to them
    ['cr_main 7 after the courier (the satchel)', 'cr_main', { cr_main: 7 }, CR.concat(['cr_courier_done']), 'cr.hut', 'direct', ['cr.hut:prop:cr_satchel@15,11']],
    ['cr_main 8 (the letter to its addressee)', 'cr_main', { cr_main: 8 }, CR.concat(['cr_courier_done', 'cr_message_taken']), 'cr.hut', 'direct', ['cr.sakashita:npc:cr_heisuke@18,11']],
    ['yn_eggs 0 (three eggs to hand out)', 'yn_eggs', { yn_main: 3, yn_eggs: 0 }, YN.concat(['yn_rooms_done', 'yn_eggs_cooked']), 'yn.upper', 'needs', ['yn.descent:npc:yn_yasuke@9,16', 'yn.kami:npc:yn_oshige@11,6', 'yn.lower:npc:yn_tsuneji@22,18'], { yn_eggs: 3 }],
  ];
  for (const [label, q, qs, flags, map, how, targets, items] of cases) {
    const seen = new Set();
    let ok = true, pure = true, first = null;
    for (const v of INCOMING) {
      const r = live(q, mk(flags, qs, { map, travel: {} }, v, items));
      seen.add(r.how + ' ' + r.t.join(','));
      pure = pure && r.pure;
      if (r.how !== how || JSON.stringify(r.t) !== JSON.stringify(targets.slice().sort())) { ok = false; first = first || { v, r }; }
    }
    t.ok(ok && seen.size === 1 && pure, label + ': ' + how + ' ' + targets.join(', ') + ', whatever outcome the save carries in (' + INCOMING.length + ' incoming states' + (first ? '; first difference ' + JSON.stringify(first) : '') + ')');
  }

  // the pin: one path, one conclusion
  RB.script.add([
    '@scene zz.pin_two', '!encounter yn.kettle', '?(var._enc=alpha) !set zz_alpha', '?(var._enc=beta) !set zz_beta', '?(zz_alpha&zz_beta) !quest zz_pin_two 1',
    '@scene zz.pin_one', '!encounter yn.kettle', '?(var._enc=alpha) !set zz_alpha1', '?(zz_alpha1) !quest zz_pin_one 1',
    '@scene zz.pin_res', '!encounter yn.kettle', '!if var._res=0 -> later', '!quest zz_pin_res 1', '!end', ':later', '!quest zz_pin_res 2',
  ].join('\n'), 'guide_encounter.test');
  for (const id of ['zz_pin_two', 'zz_pin_one', 'zz_pin_res']) C.quests[id] = { title: { jp: 'テスト', en: id }, stages: [0, 1, 2].map((k) => ({ jp: 'テスト', en: id + ' ' + k })) };
  C.maps['yn.guild'].npcs.push({ id: 'zz_two', x: 2, y: 4, talk: 'zz.pin_two' }, { id: 'zz_one', x: 3, y: 4, talk: 'zz.pin_one' }, { id: 'zz_res', x: 4, y: 4, talk: 'zz.pin_res' });
  G.reset();
  // a stale win and a stale conclusion carried in: the pin must come from the walk, not from the save
  const pinned = (q) => live(q, mk(YN.concat(['yn_rooms_done']), { yn_main: 3, [q]: 0 }, { map: 'yn.guild', travel: {} }, { _res: 1, _enc: 'alpha' }));
  const two = pinned('zz_pin_two'), one = pinned('zz_pin_one'), res = pinned('zz_pin_res');
  t.ok(two.how !== 'direct', 'a step that needs two conclusions of one encounter at once is never direct (' + JSON.stringify(two) + ')');
  t.ok(one.how === 'direct' && one.t.join() === 'yn.guild:npc:zz_one@3,4', 'a step that needs one conclusion is direct, even with a stale _enc of that very value carried in (' + JSON.stringify(one) + ')');
  t.ok(res.how === 'direct' && res.t.join() === 'yn.guild:npc:zz_res@4,4', 'after an encounter the win and the other way both go on: the nearest stage is reached either way (' + JSON.stringify(res) + ')');
};
