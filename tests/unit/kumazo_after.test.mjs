// Kumazō on the Cedar Steps after the vigil (Agnes 6547898553; Local CL-566; Cloud CC-408; Agnes 6548029795): from the
// dawn after the vigil the road's lanterns are lit, but until you left the Keepers' Road Kumazō still said "With the
// lanterns dark, things come down out of the hills…" (kr.kumazo_idle). The talk list now plays the bright-steps line
// (kr.kumazo_after) once the vigil is done and the cedar cleared; no scene, text or key changes. On the real runner,
// the screen stood in for (lines with their voice keys recorded), Kumazō talked to as the talk list picks:
//  1. the talk list as loaded: the second edition's keepsake talk first, then kr_done and
//     kr_vigil_done&kr_cedar_cleared, both to kr.kumazo_after, then the dark warning and the request, as before; the
//     rest of the Cedar Steps and Kumazō's three scenes as before (fingerprints taken before the change);
//  2. before the vigil: the cedar uncleared, the request; cleared, the dark warning; as before;
//  3. after the vigil, before the chapter's end, the cedar cleared: the bright-steps line under its key, twice, never
//     the dark warning; no quest, flag or variable changed, seen written only for the scene played; the steps' dawn
//     lanterns lit;
//  4. a seeded post-vigil case with the cedar uncleared: the request, as before;
//  5. after the chapter's end: the keepsake talk while it is still to come, then the bright-steps line, cleared or not,
//     as before;
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
  const errors = [];
  const cerr = console.error;
  console.error = (...a) => { if (a[0] === 'scene error') errors.push(a[1] + ': ' + String((a[2] && a[2].message) || a[2])); else cerr(...a); };

  let said = [];
  RB.ui.dialogue.say = async (o) => { said.push([o.en || '', o.jp ? keyOf(o.sceneId, o.jp) : null]); };
  RB.ui.dialogue.choose = async () => 0;
  RB.ui.dialogue.hide = () => {};
  RB.ui.toast = async () => {};
  RB.ui.fade = async () => {};
  for (const k of ['dismissExtras', 'refreshActors', 'placeCompanion', 'ensureSpeaker']) RB.world[k] = () => {};
  RB.game.afterScene = () => {};
  RB.save.autosave = async () => {};
  const KR = ['departed', 'ch1_done', 'ch2_done', 'mb1_done', 'mb2_done', 'ch3_done', 'ch4_done', 'kr_arrived'];
  const journey = (flags, keepsake) => {
    const s = S.newCampaign({ edition: 2 });
    if (keepsake) s.discovery.keepsakes.ks_kr_masu = true;
    s.map = 'kr.steps'; s.x = 9; s.y = 24; s.comp = 'ren';
    for (const f of KR.concat(flags || [])) s.flags[f] = true;
    RB.game.G.s = s; RB.game.s = s;
    return s;
  };
  const steps = C.maps['kr.steps'];
  const kumazo = steps.npcs.find((n) => n.id === 'kr_kumazo');
  const pick = (s) => (kumazo.talk.find((x) => !x.if || S.test(s, x.if)) || {}).scene;
  const state = (s) => flat({ q: s.quests, v: s.vars, f: Object.keys(s.flags).filter((k) => !/^(seen|enter):/.test(k)).sort() });
  const talk = async (s) => { said = []; const sc = pick(s); try { await RB.script.run(sc); } catch (e) { errors.push(sc + ': ' + e.message); } return { sc, said: said.slice() }; };
  const line = (sc) => C.scenes[sc].cmds.filter((c) => c.op === 'say').map((c) => [c.en, keyOf(sc, c.jp)]);
  const BRIGHT = line('kr.kumazo_after'), DARK = line('kr.kumazo_idle');
  const FIRST = C.scenes['kr.kumazo_first'], ASK = FIRST.cmds[FIRST.labels.ask];
  const lanterns = (s) => (steps.props || []).filter((p) => p.p === 'kr_toro' && p.if === 'kr_vigil_done').map((p) => [p.x, p.y, S.test(s, p.if) && !!(p.o && p.o.lit)]);

  // 1. the talk list
  t.ok(flat(kumazo.talk) === flat([{ if: 'kr_done&!keepsake.ks_kr_masu', scene: 'kr.ks_kumazo_masu' }, { if: 'kr_done', scene: 'kr.kumazo_after' }, { if: 'kr_vigil_done&kr_cedar_cleared', scene: 'kr.kumazo_after' }, { if: 'kr_cedar_cleared', scene: 'kr.kumazo_idle' }, { scene: 'kr.kumazo_first' }]),
    '1 the talk list as loaded: the keepsake talk and kr_done, then the vigil done with the cedar cleared, to the bright-steps line; then as before ' + flat(kumazo.talk));
  const rest = Object.assign({}, steps, { npcs: steps.npcs.map((n) => (n.id === 'kr_kumazo' ? Object.assign({}, n, { talk: null }) : n)), terrain: null });
  const scenes = ['kr.kumazo_first', 'kr.kumazo_idle', 'kr.kumazo_after'].map((k) => C.scenes[k].cmds);
  t.ok(fp(rest) === STEPS_FP && fp(scenes) === SCENES_FP && BRIGHT.length === 1 && DARK.length === 1,
    '1 the rest of the Cedar Steps and Kumazō\'s three scenes as before ' + flat({ steps: fp(rest), scenes: fp(scenes), bright: BRIGHT, dark: DARK }));

  // 2. before the vigil
  {
    const a = await talk(journey([]));
    const b = await talk(journey(['kr_cedar_cleared']));
    t.ok(a.sc === 'kr.kumazo_first' && a.said[0] && a.said[0][0] === ASK.en && b.sc === 'kr.kumazo_idle' && flat(b.said) === flat(DARK),
      '2 before the vigil: uncleared, the request; cleared, the dark warning; as before ' + flat({ a, b }));
  }

  // 3. after the vigil, before the chapter's end, the cedar cleared
  {
    const s = journey(['kr_cedar_cleared', 'kr_vigil_done']);
    const before = state(s), seen0 = Object.keys(s.seen);
    const r1 = await talk(s);
    const r2 = await talk(s);
    const seen1 = Object.keys(s.seen).filter((k) => !seen0.includes(k));
    t.ok(r1.sc === 'kr.kumazo_after' && flat(r1.said) === flat(BRIGHT) && flat(r2.said) === flat(BRIGHT) && !r1.said.concat(r2.said).some((x) => x[0] === DARK[0][0]),
      '3 after the vigil, cleared: the bright-steps line under its key, twice; never the dark warning ' + flat({ r1, r2 }));
    const lit = lanterns(s);
    t.ok(state(s) === before && flat(seen1) === flat(['kr.kumazo_after']) && lit.length === 2 && lit.every((x) => x[2]),
      '3 no quest, flag or variable changed, seen only for the scene played; the steps\' dawn lanterns lit ' + flat({ same: state(s) === before, seen: seen1, lit }));
  }

  // 4. a seeded post-vigil case with the cedar uncleared
  {
    const r = await talk(journey(['kr_vigil_done']));
    t.ok(r.sc === 'kr.kumazo_first' && r.said[0] && r.said[0][0] === ASK.en, '4 after the vigil, the cedar uncleared (seeded): the request, as before ' + flat(r));
  }

  // 5. after the chapter's end
  {
    const ks = pick(journey(['kr_cedar_cleared', 'kr_vigil_done', 'kr_done']));
    const a = await talk(journey(['kr_cedar_cleared', 'kr_vigil_done', 'kr_done'], true));
    const b = await talk(journey(['kr_vigil_done', 'kr_done'], true));
    t.ok(ks === 'kr.ks_kumazo_masu' && a.sc === 'kr.kumazo_after' && b.sc === 'kr.kumazo_after' && flat(a.said) === flat(BRIGHT) && flat(b.said) === flat(BRIGHT),
      '5 after the chapter\'s end: the keepsake talk first, then the bright-steps line, cleared or not, as before ' + flat({ ks, a: a.sc, b: b.sc }));
  }

  t.ok(!errors.length, 'no scene ended on an error from the runner ' + errors.slice(0, 3).join(' | '));
  console.error = cerr;
};
// before this change (computed on its parent): the Cedar Steps less Kumazō's talk list (and its generated terrain),
// and Kumazō's three scenes
const STEPS_FP = '4c87fc19b9fcff9b', SCENES_FP = '4cdc1ae2d65c1f26';
