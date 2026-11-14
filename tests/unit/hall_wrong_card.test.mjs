// Batch 3 Row 3, Wings 1 and 4 only (Cloud CC-591; Local CL-824; Agnes 6874584737): when each wing's card trial is passed,
// what its line says happens is made true for the rest of that walk, in Wing 2's way (a flag set as the trial passes,
// for the card the trial had wrong at the floor's pattern and the level it was asked at, under the floor's own prefix).
// Wing 4, "The wrong card melts away in the rain.": that card's prop is gone. Wing 1, "The words on the plaque that
// broke the rule fade away.": that plaque stays and shows only its name. The scenes played through the real scene runner
// (dialogue stubbed; the language task answered by the test):
//  1. every state (both patterns, F/E/I/A, without and with Grow), both wings: the pass sets exactly one flag, for the card
//     the authored data marks wrong at that pattern and level; Wing 4: that prop's own condition hides it and the other
//     three show; Wing 1: that plaque shows only "A stone plaque." and the other three their saying;
//  2. a task left unanswered or got wrong: no flag, nothing hidden, the trial waits;
//  3. a change of level after the pass: the flag and what is hidden stay as they were;
//  4. the lifecycle, both wings: kept through a save's round trip (the state as the save stores it) and by a floor held
//     with a reprieve; cleared by leaving (a counted floor: the card is back, its trial still done), by the expedition's
//     restart and by the floor's reset; a finished tale walked again as practice asks the trial afresh and sets it anew;
//  5. a journey saved before this change (the trial counted, no flag): nothing hidden and nothing invented;
//  6. nothing else changes: every other scene and map as before; in the six scenes changed, every line as before (the
//     plaques' conditions as before but for "and not gone" on every alternative); the Wing 4 floor's props as before but
//     for the four cards' conditions; every voice key as before;
//  no scene ended on an error from the runner.
// Limits: the trial is run through its scene with the task's answer chosen by the test; a save's round trip is the state
// through JSON (as the save stores it), not the save store; the props' visibility is their own condition as the world
// tests it (the browser test covers the world's blocking and interaction).
// The fingerprints were taken on c06a820's exported tree with this file's own code.
import crypto from 'node:crypto';
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state, H = RB.hall, X = RB.expedition;
  const flat = (x) => JSON.stringify(x);
  const fp = (x) => crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex').slice(0, 16);
  const keyOf = (scene, jp) => scene + '#' + crypto.createHash('sha256').update(String(jp)).digest('hex').slice(0, 10);
  const errors = [];
  const cerr = console.error;
  console.error = (...a) => { if (a[0] === 'scene error') errors.push(a[1] + ': ' + String((a[2] && a[2].message) || a[2])); else cerr(...a); };

  // ---- a minimal stage (as the wings' own tests) ----------------------------------------------------------------------
  let lines = [], asked = [], answer = () => true;
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
  RB.game.transition = async (map) => { RB.game.G.s.map = map; RB.world.W.map = { id: map }; RB.bus.emit('map:enter', { id: map }); };
  RB.game.rest = async () => {};
  RB.game.inBattle = () => false;
  RB.game.startEncounter = async () => ({ result: 'win', outcome: null });
  RB.save.autosave = async () => {};
  RB.challenge.run = async (id) => { asked.push(id); return { ok: answer(id) }; };
  if (RB.lessons) RB.lessons.grammarCard = async () => {};
  const fresh = (prof) => {
    const s = S.newCampaign({ edition: 2 });
    s.id = 'hall-wrong-card'; s.map = 'hall.foyer'; s.comp = 'mio';
    s.player.name = 'Haru'; s.player.nameJp = 'ハル';
    s.learn.profile = prof || 'E';
    Object.assign(s.flags, { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_done: true, cr_done: true, yn_done: true, ch6_done: true, postgame: true, hall_ledger: true });
    s.vars = {};
    RB.game.G.s = s;
    RB.world.W.map = { id: s.map };
    return s;
  };
  const run = async (id, o = {}) => { lines = []; asked = []; answer = o.answer || (() => true); await RB.script.run(id); return lines; };
  const enter = async (s, w, o = {}) => { if (o.pat != null) H.wrec(s, w).pat = o.pat; if (o.route) H.setChoice(s, w, { route: o.route }); RB.hooks.hall_card = async () => { s.vars._res = o.held ? 2 : 1; }; await run('hall.door_' + w); return H.visitOf(s); };

  const NEXT = { F: 'E', E: 'I', I: 'A', A: 'A' };
  const shown = (prof, route) => (route === 'grow' ? NEXT[prof] : prof);
  const TABLE = { w1: () => C.hallW1Plaques, w4: () => C.hallW4Cards };
  const odd = (w, pat, tier) => TABLE[w]()[pat][tier].findIndex((r) => r[1] === 1);
  const gone = (s, w) => [1, 2, 3, 4].filter((n) => s.flags['xp_hall_' + w + '_f0_t3_gone' + n]).map((n) => n - 1);
  const cardProps = () => C.maps['hall.w4f1'].props.filter((p) => /^hall\.w4\.card\d$/.test(p.scene || ''));
  const w4shown = (s) => cardProps().map((p) => !p.if || S.test(s, p.if));
  const w1shown = async () => { const out = []; for (let n = 1; n <= 4; n++) { const l = await run('hall.w1.plaque' + n); out.push({ name: l.some((x) => x.en === 'A stone plaque.'), saying: l.filter((x) => /^「/.test(x.jp)).length }); } return out; };
  // what the cards show: true where the card (Wing 4) or its saying (Wing 1) is there
  const showing = async (s, w) => (w === 'w4' ? w4shown(s) : (await w1shown()).map((x) => x.name && x.saying === 1));
  const allShown = (v) => flat(v) === flat([true, true, true, true]);
  const onlyHidden = (v, i) => v.every((x, k) => x === (k !== i));

  // 1. every state, both wings
  for (const w of ['w1', 'w4']) {
    const bad = [];
    let runs = 0;
    for (const pat of [0, 1]) for (const prof of ['F', 'E', 'I', 'A']) for (const route of ['consolidate', 'grow']) {
      const s = fresh(prof);
      await enter(s, w, { pat, route });
      const before = await showing(s, w);
      await run('hall.' + w + '.t3');
      runs++;
      const want = odd(w, pat, shown(prof, route));
      const g = gone(s, w), after = await showing(s, w);
      const name = w === 'w1' ? (await w1shown())[want] : null;
      if (!allShown(before) || flat(g) !== flat([want]) || !onlyHidden(after, want) || !H.trialDone(s, w, 't3') || (name && !(name.name && name.saying === 0))) bad.push({ pat, prof, route, want, g, before, after, name });
    }
    t.ok(runs === 16 && !bad.length, '1 ' + w + ', every state (2 patterns x 4 levels x 2 routes): the pass sets one flag, for the card the data marks wrong at that pattern and level; ' + (w === 'w4' ? 'that prop hidden, the other three shown' : 'that plaque shows only "A stone plaque.", the other three their saying') + ' ' + flat(bad.slice(0, 2)));
  }
  t.ok(flat([0, 1].map((p) => ['F', 'E', 'I', 'A'].map((x) => odd('w4', p, x)))) === flat([[2, 1, 3, 3], [2, 2, 2, 3]]), '1 the wrong card in Wing 4 depends on the level (pattern 0: card 3 at F, 2 at E, 4 at I and A)');

  // 2. a task left unanswered or got wrong
  for (const w of ['w1', 'w4']) for (const pat of [0, 1]) {
    const s = fresh('E');
    await enter(s, w, { pat });
    await run('hall.' + w + '.t3', { answer: () => false });
    const was = asked.slice();
    const v = await showing(s, w);
    t.ok(!gone(s, w).length && allShown(v) && !H.trialDone(s, w, 't3') && was.length === 1, '2 ' + w + ', pattern ' + pat + ': the task not answered: no flag, nothing hidden, the trial waits ' + flat({ g: gone(s, w), v, asked: was }));
  }

  // 3. a change of level after the pass
  for (const w of ['w1', 'w4']) {
    const s = fresh('E');
    await enter(s, w, { pat: 0 });
    await run('hall.' + w + '.t3');
    const g0 = gone(s, w), v0 = await showing(s, w);
    s.learn.profile = 'A';
    const g1 = gone(s, w), v1 = await showing(s, w);
    t.ok(g0.length === 1 && flat(g1) === flat(g0) && onlyHidden(v1, g0[0]) && flat(v1) === flat(v0), '3 ' + w + ': the level changed after the pass (E to A): the same card stays gone, the others show ' + flat({ g0, g1, v1 }));
  }

  // 4. the lifecycle
  const reprieveOf = (w) => H.get(w).trials.find((x) => x.reprieve).id;
  const floor0 = (w) => H.get(w).trials.filter((x) => x.floor === 0).map((x) => x.id);
  for (const w of ['w1', 'w4']) {
    // a save's round trip
    let s = fresh('E');
    await enter(s, w, { pat: 0 });
    await run('hall.' + w + '.t3');
    const g = gone(s, w);
    const s2 = JSON.parse(JSON.stringify(s));
    RB.game.G.s = s2;
    t.ok(g.length === 1 && flat(gone(s2, w)) === flat(g) && onlyHidden(await showing(s2, w), g[0]), '4 ' + w + ': kept through a save\'s round trip ' + flat(gone(s2, w)));
    // a floor held with a reprieve
    s = fresh('E');
    await enter(s, w, { pat: 0 });
    await run('hall.' + w + '.t3');
    await RB.hooks.hall_trial([w, reprieveOf(w)]);
    H.retreat(s, { keep: true });
    const away = gone(s, w);
    await enter(s, w, { held: true });
    t.ok(!away.length && flat(gone(s, w)) === flat(g) && onlyHidden(await showing(s, w), g[0]), '4 ' + w + ': cleared while away, restored with a held floor ' + flat({ away, back: gone(s, w) }));
    // leaving with the floor counted: the card is back, its trial still done
    s = fresh('E');
    await enter(s, w, { pat: 0 });
    for (const x of floor0(w).filter((x) => x !== 't3')) await RB.hooks.hall_trial([w, x]);
    await run('hall.' + w + '.t3');
    const counted = !!(H.peek(s, w) && H.peek(s, w).floors[0]);
    const hidden = gone(s, w).length === 1;
    H.retreat(s);
    const v = await enter(s, w);
    const back = await showing(s, w);
    const again = await run('hall.' + w + '.t3');
    t.ok(counted && hidden && v && v.floor === 1 && !gone(s, w).length && allShown(back) && H.trialDone(s, w, 't3') && !asked.length && again.some((l) => /asks nothing more/.test(l.en)),
      '4 ' + w + ': left with the floor counted; on the next walk the card is back, the trial still done ("The carving asks nothing more.") ' + flat({ counted, floor: v && v.floor, back }));
    // the expedition's restart, and the floor's reset
    s = fresh('E');
    await enter(s, w, { pat: 0 });
    await run('hall.' + w + '.t3');
    X.restart(s);
    const r1 = gone(s, w);
    await run('hall.' + w + '.t3');
    H.resetFloor(s, w, 0);
    const r2 = gone(s, w);
    t.ok(!r1.length && !r2.length && allShown(await showing(s, w)), '4 ' + w + ': cleared by the expedition\'s restart and by the floor\'s reset ' + flat({ r1, r2 }));
    // practice: a finished tale walked again asks the trial afresh, and the pass sets the flag anew
    s = fresh('E');
    const r = H.wrec(s, w);
    r.done = true; H.get(w).floors.forEach((f, i) => { r.floors[i] = true; });
    for (const x of H.get(w).trials) r.trials[x.id] = { t: 1 };
    const pv = await enter(s, w, { pat: 0 });
    const shownBefore = await showing(s, w);
    await run('hall.' + w + '.t3');
    t.ok(pv && pv.practice && allShown(shownBefore) && asked.length === 1 && flat(gone(s, w)) === flat(g) && onlyHidden(await showing(s, w), g[0]), '4 ' + w + ': practice asks the trial afresh and sets the flag anew ' + flat({ practice: pv && pv.practice, g: gone(s, w) }));
  }

  // 5. a journey saved before this change: the trial counted, no flag
  for (const w of ['w1', 'w4']) {
    const s = fresh('E');
    const r = H.wrec(s, w);
    r.pat = 0; r.floors[0] = true;
    for (const x of floor0(w)) r.trials[x] = { t: 1 };
    await enter(s, w);
    const v = await showing(s, w);
    const l = await run('hall.' + w + '.t3');
    t.ok(!gone(s, w).length && allShown(v) && !asked.length && l.some((x) => /asks nothing more/.test(x.en)), '5 ' + w + ': saved before the change with the trial counted: nothing hidden, no card chosen after the fact, the trial still done ' + flat(v));
  }

  // 6. nothing else changes
  const CHANGED = ['hall.w1.t3', 'hall.w1.plaque1', 'hall.w1.plaque2', 'hall.w1.plaque3', 'hall.w1.plaque4', 'hall.w4.t3'];
  // (a scene's lines carry their place in the generated text; the lines added to Wing 1's and Wing 4's trials move the
  // later scenes of those two files down, so the place is set aside: text, speakers, conditions and order are compared)
  const noLine = (c) => { const o = Object.assign({}, c); delete o.line; return o; };
  const others = Object.keys(C.scenes).sort().filter((id) => !CHANGED.includes(id)).map((id) => [id, C.scenes[id].cmds.map(noLine)]);
  t.ok(fp(others) === OTHER_SCENES_FP, '6 every other scene as before (its lines\' place in the generated text set aside) ' + flat({ n: others.length, fp: fp(others) }));
  const unGone = (c) => (c.if ? c.if.split('|').map((x) => x.replace(/&!xp_hall_w1_f0_t3_gone\d$/, '')).join('|') : c.if);
  const plaqueOk = [1, 2, 3, 4].every((n) => C.scenes['hall.w1.plaque' + n].cmds.filter((c) => c.op === 'say' && c.if).every((c) => c.if.split('|').every((x) => x.endsWith('&!xp_hall_w1_f0_t3_gone' + n))));
  const says = CHANGED.map((id) => [id, C.scenes[id].cmds.filter((c) => c.op === 'say').map((c) => ({ who: c.who, jp: c.jp, en: c.en, if: /plaque/.test(id) ? unGone(c) : c.if }))]);
  t.ok(plaqueOk && fp(says) === CHANGED_SAYS_FP, '6 the six scenes changed: every line as before (each plaque saying\'s condition as before but for "and not gone" on every alternative) ' + flat({ plaqueOk, fp: fp(says) }));
  const maps = Object.keys(C.maps).sort().filter((id) => id !== 'hall.w4f1').map((id) => [id, C.maps[id]]);
  t.ok(fp(maps) === OTHER_MAPS_FP, '6 every other map as before ' + flat({ n: maps.length, fp: fp(maps) }));
  const f1 = C.maps['hall.w4f1'].props.map((p) => (/^hall\.w4\.card\d$/.test(p.scene || '') ? Object.assign({}, p, { if: undefined }) : p));
  t.ok(fp(f1) === W4F1_PROPS_FP && cardProps().every((p, i) => p.if === '!xp_hall_w4_f0_t3_gone' + (i + 1) && p.p === 'signblank' && p.y === 3 && p.x === 5 + 2 * i), '6 the Wing 4 floor\'s props as before but for the four cards\' conditions ' + flat({ fp: fp(f1) }));
  const keys = Object.keys(C.scenes).sort().flatMap((id) => C.scenes[id].cmds.filter((c) => c.op === 'say' && c.jp).map((c) => keyOf(id, c.jp)));
  t.ok(fp(keys) === KEYS_FP, '6 every voice key as before ' + flat({ n: keys.length, fp: fp(keys) }));

  t.ok(errors.length === 0, 'no scene ended on an error from the runner ' + flat(errors.slice(0, 3)));
  console.error = cerr;
};

const OTHER_SCENES_FP = '7569a2b138a8a75f', CHANGED_SAYS_FP = 'eebd903b1a4f355d', OTHER_MAPS_FP = 'a63755ae3cdd9259', W4F1_PROPS_FP = '1fb835ae2c9be57d', KEYS_FP = '44673e626955133f';
