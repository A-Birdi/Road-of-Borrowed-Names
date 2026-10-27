// Signposts on the Terraces (Agnes 6449454299; Local CL-509, CL-510; Cloud CC-364): once the signpost's arms have
// their names back (co_signs_done), the quest is finished by Asa's thanks; but its one step still said to write the
// names back, and after Chapter 3 Asa's talk was her after-chapter line, so a quest still open then could never be
// finished (no thanks, no straw hat). In node:
//  1. the objective: before the repair, the step's own words; after it, "The signpost’s names are back. Tell Asa.",
//     with readings;
//  2. the guide, in Chapter 3 and after it: the signpost before the repair, Asa after it;
//  3. Asa's talk: her own scene while the quest is open, in any chapter; otherwise as before (her first meeting, her
//     after-chapter and postgame lines);
//  4. with the real runner, after Chapter 3 and within it: once repaired, her thanks, the straw hat once, the quest done.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state, G = RB.questGuide, test = S.test;
  const st0 = C.quests.co_signs.stages[0];
  const asa = C.maps['co.terraces'].npcs.find((n) => n.id === 'co_asa');
  const BEFORE = { departed: true, ch1_done: true, ch2_done: true, co_arrived: true };
  const journey = (flags, quest) => {
    const s = S.newCampaign({ edition: 2 }); s.comp = 'ren'; s.map = 'co.terraces'; s.x = 22; s.y = 28;
    Object.assign(s.flags, BEFORE, flags || {});
    if (quest) s.quests.co_signs = quest;
    RB.game.G.s = s; RB.game.s = s;
    return s;
  };
  const open = { stage: 0, done: false, t: 1 }, done = { stage: 0, done: true, t: 2 };
  const objective = (s) => ((st0.textIf || []).find((x) => test(s, x.if)) || st0).en;
  const talk = (s) => (asa.talk.find((o) => !o.if || test(s, o.if)) || {}).scene;
  const where = (e) => e.map + ':' + e.kind + ':' + (e.id || e.p) + (e.kind === 'prop' ? '@' + e.x + ',' + e.y : '');
  const OWN = 'The names on Asa\'s terrace signposts have faded away. Look at where each arm points, and write the names back.';
  const BACK = 'The signpost’s names are back. Tell Asa.';

  // ---- 1. the objective
  t.eq([objective(journey({}, open)), objective(journey({ co_signs_done: true }, open))], [OWN, BACK], '1 before the repair, the step\'s own words; after it, "Tell Asa"');
  t.ok((st0.textIf || []).length === 1 && st0.textIf[0].jp === '{道|みち}しるべ の {名前|なまえ} が {戻|もど}った 。 アサ に {伝|つた}えよう 。', '1 its Japanese, with a reading on every kanji');

  // ---- 2. the guide (its cache reset for each state)
  const rows = [];
  for (const [label, flags] of [['in Chapter 3, not repaired', {}], ['in Chapter 3, repaired', { co_signs_done: true }], ['Chapter 3 over, not repaired', { ch3_done: true }], ['Chapter 3 over, repaired', { ch3_done: true, co_signs_done: true }]]) {
    G.reset();
    const s = journey(flags, open);
    const r = G.targets('co_signs', s);
    rows.push(label + ': ' + r.targets.map(where).join(', '));
  }
  t.eq(rows, ['in Chapter 3, not repaired: co.terraces:prop:signblank@18,17', 'in Chapter 3, repaired: co.terraces:npc:co_asa',
    'Chapter 3 over, not repaired: co.terraces:prop:signblank@18,17', 'Chapter 3 over, repaired: co.terraces:npc:co_asa'], '2 the guide: the signpost before the repair, Asa after it, in Chapter 3 and after');

  // ---- 3. Asa's talk
  t.eq([
    talk(journey({}, null)), talk(journey({}, open)), talk(journey({ co_signs_done: true }, open)),
    talk(journey({ ch3_done: true }, open)), talk(journey({ ch3_done: true, co_signs_done: true }, open)), talk(journey({ ch3_done: true, postgame: true, co_signs_done: true }, open)),
    talk(journey({ ch3_done: true }, null)), talk(journey({ ch3_done: true, co_signs_done: true }, done)), talk(journey({ ch3_done: true, postgame: true, co_signs_done: true }, done)), talk(journey({ co_signs_done: true }, done)),
  ], ['co.asa', 'co.asa', 'co.asa', 'co.asa', 'co.asa', 'co.asa', 'co.asa_after', 'co.asa_after', 'co.asa_post', 'co.asa'],
  '3 Asa: her own scene while the quest is open, in any chapter; never taken or done, as before');

  // ---- 4. the real runner: once repaired, her thanks, the straw hat once, the quest done
  const said = [];
  RB.ui.dialogue.say = async (l) => { said.push(l.en); };
  RB.ui.dialogue.choose = async () => 0;
  RB.ui.dialogue.hide = () => {};
  RB.ui.toast = async () => {};
  for (const k of ['dismissExtras', 'refreshActors']) RB.world[k] = () => {};
  RB.game.afterScene = () => {};
  RB.save.autosave = async () => {};
  for (const [label, flags] of [['after Chapter 3', { ch3_done: true, co_signs_done: true }], ['within Chapter 3', { co_signs_done: true }]]) {
    const s = journey(flags, Object.assign({}, open));
    said.length = 0;
    await RB.script.run(talk(s));
    const again = said.length;
    await RB.script.run(talk(s));
    t.ok(s.quests.co_signs.done && (s.inv.co_straw_hat || 0) === 1 && said.slice(0, again).some((l) => /Thanks for the signpost/.test(l)),
      '4 ' + label + ', repaired: her thanks, the straw hat once, the quest done (' + JSON.stringify({ q: s.quests.co_signs, hat: s.inv.co_straw_hat, said: said.slice(0, again) }) + ')');
  }
};
