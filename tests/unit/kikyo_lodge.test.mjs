// Kikyō at the lodge after the vigil (Agnes 6547835197; Cloud CC-407; Local CL-565; Agnes 6548029795): once the scroll
// was told, her lodge talk said "I hope the scroll's story is some use in the cave." even after the cave and the vigil
// were behind you, until the chapter's end. Now, after the vigil, :told calls her own reflection on endings
// (kr.vigil_kikyo, "In telling, the ending is the hardest part. Anyone can begin.") instead; no new text or key. On
// the real runner, the screen stood in for (lines with their voice keys, challenges and toasts recorded), Kikyō talked
// to as the lodge's placement picks:
//  1. the scene: in :told, the vigil check first, the cave line as before (its key) and an end, then :ended calling
//     kr.vigil_kikyo; the reflection's own scene, the scroll's path and the Room of Wicks' placement as before (by
//     fingerprints taken before the change);
//  2. the scroll told, the vigil not yet: the cave line, as before;
//  3. after the vigil, before the chapter's end, however the Hundredth Tale ended (closed by you, ended, or finished
//     by Hisae): the reflection under its own key, never the cave line; and the same on a second talk, with no quest,
//     flag or variable changed, and seen written only for her talk and the called scene;
//  4. the scroll not yet told, before and after the vigil: its challenge and its telling, as now;
//  5. after the chapter's end: she is not at the lodge, as before; the Room of Wicks still plays the reflection;
//  no scene ended on an error from the runner.
import crypto from 'node:crypto';
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state;
  const flat = (x) => JSON.stringify(x);
  const fp = (x) => crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex').slice(0, 16);
  const keyOf = (scene, jp) => scene + '#' + crypto.createHash('sha256').update(String(jp)).digest('hex').slice(0, 10);
  const CAVE = 'I hope the scroll\'s story is some use in the cave.';
  const ENDING = 'In telling, the ending is the hardest part. Anyone can begin.';
  const errors = [];
  const cerr = console.error;
  console.error = (...a) => { if (a[0] === 'scene error') errors.push(a[1] + ': ' + String((a[2] && a[2].message) || a[2])); else cerr(...a); };

  // the runner, with the screen stood in for
  let said = [], challenges = [], toasts = [];
  RB.ui.dialogue.say = async (o) => { said.push([o.en || '', o.jp ? keyOf(o.sceneId, o.jp) : null]); };
  RB.ui.dialogue.choose = async () => 0;
  RB.ui.dialogue.hide = () => {};
  RB.ui.toast = async (x) => { toasts.push(typeof x === 'string' ? x : flat(x)); };
  RB.ui.fade = async () => {};
  for (const k of ['dismissExtras', 'refreshActors', 'placeCompanion', 'ensureSpeaker']) RB.world[k] = () => {};
  RB.game.afterScene = () => {};
  RB.save.autosave = async () => {};
  RB.challenge.run = async (id) => { challenges.push(id); return { ok: true }; };
  const KR = ['departed', 'ch1_done', 'ch2_done', 'mb1_done', 'mb2_done', 'ch3_done', 'ch4_done', 'kr_arrived', 'kr_kikyo_met', 'kr_ridge_ghost_done', 'kr_kikyo_lodge'];
  const journey = (o = {}) => {
    const s = S.newCampaign({ edition: 2 });
    s.map = 'kr.lodge'; s.x = 22; s.y = 13; s.comp = o.comp || 'mio';
    for (const f of KR.concat(o.flags || [])) s.flags[f] = true;
    if (o.outcome) { (s.enc = s.enc || {}).outcomes = { 'kr.hyakuwa': { id: o.outcome, t: 1 } }; if (o.outcome !== 'hisae') s.flags.kr_tale_closed = true; }
    RB.game.G.s = s; RB.game.s = s;
    return s;
  };
  const kikyo = (m) => (C.maps[m].npcs || []).filter((n) => n.id === 'kr_kikyo');
  const pick = (s, m) => { const n = kikyo(m || 'kr.lodge').find((x) => !x.if || S.test(s, x.if)); return n ? (typeof n.talk === 'string' ? n.talk : ((n.talk || []).find((x) => !x.if || S.test(s, x.if)) || {}).scene) : null; };
  const state = (s) => flat({ q: s.quests, v: s.vars, f: Object.keys(s.flags).filter((k) => !/^(seen|enter):/.test(k)).sort() });
  const talk = async (s) => { said = []; challenges = []; toasts = []; const sc = pick(s); if (sc) { try { await RB.script.run(sc); } catch (e) { errors.push(sc + ': ' + e.message); } } return { sc, said: said.slice(), challenges: challenges.slice(), toasts: toasts.slice() }; };
  const ENDING_KEY = keyOf('kr.vigil_kikyo', C.scenes['kr.vigil_kikyo'].cmds.find((c) => c.op === 'say').jp);
  const CAVE_KEY = 'kr.kikyo_lodge#' + crypto.createHash('sha256').update(String(C.scenes['kr.kikyo_lodge'].cmds.find((c) => c.en === CAVE).jp)).digest('hex').slice(0, 10);

  // 1. the scene
  {
    const sc = C.scenes['kr.kikyo_lodge'], cmds = sc.cmds, told = sc.labels.told, ended = sc.labels.ended;
    t.ok(cmds[told].op === 'if' && flat(cmds[told].args) === flat(['kr_vigil_done', '->', 'ended']) && cmds[told + 1].en === CAVE && cmds[told + 2].op === 'end' &&
      ended === told + 3 && cmds[ended].op === 'call' && flat(cmds[ended].args) === flat(['kr.vigil_kikyo']) && cmds.length === ended + 1,
      '1 :told checks the vigil first; the cave line, then an end; :ended calls kr.vigil_kikyo ' + flat(cmds.slice(told).map((c) => [c.op, c.args || c.en])));
    const before = cmds.slice(0, told).map((c) => [c.op, c.who, c.jp, c.en, c.if, c.args]);
    t.ok(CAVE_KEY === CAVE_KEY_BEFORE && fp(before) === SCROLL_FP && fp(C.scenes['kr.vigil_kikyo'].cmds) === VIGIL_FP && fp(kikyo('kr.vigil')) === WICKS_FP && fp(kikyo('kr.lodge')) === LODGE_FP,
      '1 the cave line\'s key, the scroll\'s path, the reflection\'s own scene and both placements as before ' + flat({ cave: CAVE_KEY, scroll: fp(before), vigil: fp(C.scenes['kr.vigil_kikyo'].cmds), wicks: fp(kikyo('kr.vigil')), lodge: fp(kikyo('kr.lodge')) }));
  }

  // 2. the scroll told, the vigil not yet
  {
    const s = journey({ flags: ['kr_scroll_done'] });
    const r = await talk(s);
    t.ok(r.sc === 'kr.kikyo_lodge' && flat(r.said) === flat([[CAVE, CAVE_KEY]]) && !r.challenges.length, '2 the scroll told, the vigil not yet: the cave line, as before ' + flat(r));
  }

  // 3. after the vigil, before the chapter's end, however the tale ended
  for (const outcome of ['closed', 'ended', 'hisae']) {
    const s = journey({ flags: ['kr_scroll_done', 'kr_vigil_done'], outcome });
    const before = state(s), seen0 = Object.keys(s.seen);
    const r1 = await talk(s);
    const mid = state(s), seen1 = Object.keys(s.seen).filter((k) => !seen0.includes(k)).sort();
    const r2 = await talk(s);
    const after = state(s);
    t.ok(r1.sc === 'kr.kikyo_lodge' && flat(r1.said) === flat([[ENDING, ENDING_KEY]]) && flat(r2.said) === flat([[ENDING, ENDING_KEY]]) && !r1.challenges.length && !r1.toasts.length && !r2.toasts.length,
      '3 after the vigil (' + outcome + '): the reflection under its own key, twice; never the cave line ' + flat({ r1: r1.said, r2: r2.said }));
    t.ok(mid === before && after === before && flat(seen1) === flat(['kr.kikyo_lodge', 'kr.vigil_kikyo']), '3 (' + outcome + ') no quest, flag or variable changed; seen only for her talk and the called scene ' + flat({ same: mid === before, stable: after === before, seen: seen1 }));
  }

  // 4. the scroll not yet told, before and after the vigil
  for (const vigil of [false, true]) {
    const s = journey({ flags: vigil ? ['kr_vigil_done'] : [], outcome: vigil ? 'closed' : null });
    const r = await talk(s);
    t.ok(r.sc === 'kr.kikyo_lodge' && flat(r.challenges) === flat(['kr.scroll_captions']) && s.flags.kr_scroll_done && /Now, listen/.test(r.said.map((x) => x[0]).join(' ')) && !r.said.some((x) => x[0] === CAVE || x[0] === ENDING),
      '4 the scroll not yet told, ' + (vigil ? 'after' : 'before') + ' the vigil: its challenge and its telling, as now ' + flat({ challenges: r.challenges, n: r.said.length }));
  }

  // 5. after the chapter's end
  {
    const s = journey({ flags: ['kr_scroll_done', 'kr_vigil_done', 'kr_done'], outcome: 'closed' });
    const wicks = (kikyo('kr.vigil')[0] || {}).talk;
    t.ok(pick(s) === null && wicks === 'kr.vigil_kikyo', '5 after the chapter\'s end: not at the lodge, as before; the Room of Wicks plays the reflection ' + flat({ lodge: pick(s), wicks }));
  }

  t.ok(!errors.length, 'no scene ended on an error from the runner ' + errors.slice(0, 3).join(' | '));
  console.error = cerr;
};
// before this change (computed on its parent): the cave line's key, the scroll's path up to :told, the reflection's
// scene, Kikyō's placements in the Room of Wicks and at the lodge
const CAVE_KEY_BEFORE = 'kr.kikyo_lodge#f2f1a1d8a1', SCROLL_FP = 'e07e38c7f5da9418', VIGIL_FP = '747d0d62f507107f', WICKS_FP = '43a7a784b213a033', LODGE_FP = '4baef362aecf911b';
