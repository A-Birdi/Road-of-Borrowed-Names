// The question after each Hall scroll (hall.<w>.story_q, optional), in all ten wings (CC-568, CC-569; Agnes 6848355918;
// Local CL-793, CL-794), with synthetic journeys only: the scenes are played through the real scene runner with the
// dialogue stubbed. The question's stand-in answers as the challenge runner does: an answer (plain, assisted or
// revealed) records chal:<id> in the journey it was asked in; "Come back later" records nothing. In each wing:
//  1. the flow: "Come back later" on the ordering earns nothing; on the question, the trial's credit once, no
//     reflection, and the notice saying where it can be answered (the counted version when this trial counts the
//     floor); an answer, plain, assisted or revealed: the reflection; "Come back later" with an answer already recorded:
//     no reflection, nothing pending;
//  2. the scroll again in the same visit: put off again (nothing credited, no notice, no record changed), answered (the
//     reflection), and once answered the scroll's own line only;
//  3. state: Leave or a defeat before the floor counts (nothing pending; the ordering again, then the question); counted,
//     then Leave (the hearth offers it); a held floor 0 (defensive and synthetic: no wing has a floor-0 reprieve); a save
//     and a load; practice (the ordering replayed; an answer clears it, no record changes); old journeys with and
//     without the answer; empty, unearned and wrong-wing journeys; reading it makes and changes nothing;
//  4. the hearth: "Not now"; "Answer it now", then put off; "Answer it now", then answered (the reflection, then one more
//     autosave); nothing offered once answered, or before the floor counts; the wing's record (credit, floors, notes,
//     help, reprieve) as it was; the routing variable cleared, a stale one never skipping the ordering;
//  5. the content: every Japanese line of the ten scroll scenes and ten hearths, by key and by count, as at 433ae92
//     (keys as tools/voice/lines.mjs makes them: the scene and the line's Japanese).
import crypto from 'node:crypto';
import { load } from '../lib/load.mjs';

function storage() {
  const m = new Map();
  return {
    get length() { return m.size; }, key: (i) => (i < m.size ? [...m.keys()][i] : null),
    getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => { m.set(k, String(v)); }, removeItem: (k) => { m.delete(k); },
  };
}

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true, localStorage: storage() });
  const C = RB.content, S = RB.state, H = RB.hall, X = RB.expedition;
  const WINGS = Array.from({ length: 10 }, (_, i) => 'w' + (i + 1));

  // ---- a minimal stage ----------------------------------------------------------------------------------------------
  let said = [], notices = [], asked = [], confirms = [], saves = 0, ordering = 'ok', question = 'ok', pick = 1;
  RB.ui.dialogue.say = async (l) => { said.push({ who: l.who, jp: l.jp || '', en: l.en || '' }); };
  RB.ui.dialogue.choose = async () => 0;
  RB.ui.dialogue.hide = () => {};
  RB.ui.toast = async () => {};
  RB.ui.notice = (m) => { notices.push(m); };
  RB.ui.confirm = async (q, opts) => { confirms.push({ q, opts }); return pick; };
  RB.ui.fade = async () => {};
  for (const k of ['ensureSpeaker', 'dismissExtras', 'refreshActors']) RB.world[k] = () => {};
  RB.world.whenArrived = async () => {};
  RB.world.emote = () => {};
  RB.game.afterScene = () => {};
  RB.world.W = RB.world.W || {};
  RB.game.transition = async (map) => { RB.game.G.s.map = map; RB.world.W.map = { id: map }; RB.bus.emit('map:enter', { id: map }); };
  RB.game.inBattle = () => false;
  RB.save.autosave = async () => { saves++; };
  // the challenge runner's stand-in: the ordering (hall_challenge) and the question (!challenge), as the runner answers
  RB.challenge.run = async (id) => {
    asked.push(id);
    if (/\.story_q$/.test(id)) {
      if (question === 'cancel') return { ok: false, cancelled: true };
      const s = RB.game.s;
      s.flags['chal:' + id] = true;
      return { ok: true, results: [{ ok: true, assisted: question !== 'ok', revealed: question === 'revealed', help: question === 'ok' ? null : 'supplied', cancelled: false }] };
    }
    if (/\.story$/.test(id) && ordering === 'cancel') return { ok: false, cancelled: true };
    return { ok: true, results: [] };
  };
  const DONE = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_done: true, cr_done: true, yn_done: true, postgame: true, ch6_done: true, hall_ledger: true };
  const fresh = (o = {}) => {
    const s = S.newCampaign({ edition: 2 });
    s.id = o.id || 'tale-test'; s.map = 'hall.foyer'; s.comp = o.comp === undefined ? 'ren' : o.comp;
    s.player.name = 'Haru'; s.learn.profile = 'E';
    Object.assign(s.flags, DONE, o.flags || {});
    s.vars = {};
    RB.game.G.s = s;
    RB.world.W.map = { id: s.map };
    return s;
  };
  const run = async (id, o = {}) => {
    said = []; notices = []; asked = []; confirms = []; saves = 0;
    ordering = o.ordering || 'ok'; question = o.question || 'ok'; pick = o.pick == null ? 1 : o.pick;
    await RB.script.run(id);
  };
  // (the tenth wing's screen opens once nine lanterns are lit: those wings are marked done for it)
  const enter = async (s, w) => {
    if (w === 'w10') for (let k = 1; k <= 9; k++) H.wrec(s, 'w' + k).done = true;
    RB.hooks.hall_card = async () => { s.vars._res = 1; };
    await run('hall.door_' + w);
    return H.visitOf(s);
  };
  const pending = (s, w) => S.test(s, 'hall.' + w + '.tale');
  const reflection = (w) => C.scenes['hall.' + w + '.t1'].cmds.filter((c) => c.op === 'say' && c.who === 'comp').map((c) => c.en);
  const reflected = (w) => said.some((l) => reflection(w).includes(l.en));
  const others0 = (w) => H.floorTrials(w, 0).filter((x) => x.id !== 't1').map((x) => x.id);
  const bank0 = (s, w) => { for (const id of others0(w)) H.markTrial(s, w, id); };
  const rec = (s, w) => JSON.stringify(H.peek(s, w));
  const PARTIAL = 'You can answer the question later at this scroll. Once this floor is counted, you can also answer it at this wing\'s hearth.';
  const COUNTED = 'You can answer the question later at this wing\'s hearth.';

  for (const w of WINGS) {
    const Q = 'hall.' + w + '.story_q', SC = 'hall.' + w + '.t1', HEARTH = 'hall.hearth_' + w, n = +w.slice(1);
    t.ok(reflection(w).length === 4, w + ': its scroll scene has the four companions\' reflections');

    // ---- 1. the flow ------------------------------------------------------------------------------------------------
    {
      const s = fresh(); await enter(s, w);
      await run(SC, { ordering: 'cancel' });
      t.ok(asked.join() === 'hall.' + w + '.story' && !H.visitOf(s).done.t1 && !pending(s, w) && !notices.length && !s.flags['xp_hall_' + w + '_f0_t1'],
        w + ' 1a: "Come back later" on the ordering: no question, no credit, nothing pending, no notice');
      await run(SC, { question: 'cancel' });
      const v = H.visitOf(s);
      t.ok(asked.join() === 'hall.' + w + '.story,' + Q && v.done.t1 === true && !reflected(w) && pending(s, w) && s.flags['xp_hall_' + w + '_f0_t1'] === true,
        w + ' 1b: the ordering, then "Come back later" on the question: credit, no reflection, pending ' + JSON.stringify({ asked, said: said.length }));
      t.ok(notices.length === 1 && notices[0].endsWith(' ' + PARTIAL) && /^A lantern is lit: /.test(notices[0]),
        w + ' 1c: one notice, the lantern\'s, saying where the question can be answered (the floor not yet counted) ' + JSON.stringify(notices));
      // ---- 2. the scroll again --------------------------------------------------------------------------------------
      const r0 = rec(s, w), d0 = JSON.stringify(v.done), rp0 = v.reprieve;
      await run(SC, { question: 'cancel' });
      t.ok(asked.join() === Q && !reflected(w) && !notices.length && pending(s, w) && rec(s, w) === r0 && JSON.stringify(v.done) === d0 && v.reprieve === rp0,
        w + ' 2a: the scroll again, put off again: the question only; no credit, notice or record change; still pending');
      await run(SC, { question: 'ok' });
      t.ok(asked.join() === Q && reflected(w) && !notices.length && !pending(s, w) && s.flags['chal:' + Q] === true && rec(s, w) === r0 && JSON.stringify(v.done) === d0,
        w + ' 2b: the scroll again, answered: the reflection; nothing pending; no credit, notice or record change');
      await run(SC);
      t.ok(!asked.length && said.length === 1 && !reflected(w) && !notices.length, w + ' 2c: once answered, the scroll\'s own line only');
    }
    for (const how of ['ok', 'assisted', 'revealed']) {
      const s = fresh(); await enter(s, w);
      await run(SC, { question: how });
      t.ok(reflected(w) && H.visitOf(s).done.t1 === true && !pending(s, w) && s.flags['chal:' + Q] === true && notices.length === 1 && !notices[0].includes('answer the question later'),
        w + ' 1d: answered in the flow (' + how + '): the reflection, the credit once, nothing pending, the notice without the question\'s sentence');
    }
    {
      const s = fresh({ flags: { ['chal:' + Q]: true } }); await enter(s, w);
      await run(SC, { question: 'cancel' });
      t.ok(!reflected(w) && H.visitOf(s).done.t1 === true && !pending(s, w) && notices.length === 1 && !notices[0].includes('answer the question later'),
        w + ' 1e: "Come back later" with an answer already recorded: no reflection; credit; nothing pending');
    }
    {
      const s = fresh(); await enter(s, w);
      bank0(s, w);
      t.ok(!H.peek(s, w).floors[0], w + ' 1f: (the other trials on floor 0 done, the floor not yet counted)');
      await run(SC, { question: 'cancel' });
      t.ok(H.peek(s, w).floors[0] === true && notices.length === 1 && notices[0].endsWith(' ' + COUNTED) && notices[0].includes('The floor is cleared'),
        w + ' 1f: the scroll last on its floor, put off: the floor counts, and the notice gives the counted version ' + JSON.stringify(notices));
    }

    // ---- 3. state ---------------------------------------------------------------------------------------------------
    {
      const s = fresh(); await enter(s, w);
      await run(SC, { question: 'cancel' });
      H.retreat(s, {});
      t.ok(!H.visitOf(s) && !pending(s, w) && !(H.peek(s, w).trials.t1), w + ' 3a: Leave before the floor counts: the credit goes, nothing pending');
      await run(HEARTH);
      t.ok(!confirms.length && saves === 1, w + ' 3a: the hearth offers nothing; its own autosave only');
      await enter(s, w);
      await run(SC, { question: 'cancel' });
      t.ok(asked.join() === 'hall.' + w + '.story,' + Q && pending(s, w), w + ' 3a: going in again: the ordering, then the question');
      X.onDefeat(s);
      t.ok(!H.visitOf(s).done.t1 && !pending(s, w), w + ' 3b: a defeat before the floor counts: the credit goes, nothing pending');
      await run(SC, { question: 'cancel' });
      t.ok(asked.join() === 'hall.' + w + '.story,' + Q && pending(s, w), w + ' 3b: the floor again: the ordering, then the question');
    }
    {
      // counted, then Leave: the hearth (section 4)
      const s = fresh(); await enter(s, w);
      bank0(s, w);
      await run(SC, { question: 'cancel' });
      H.retreat(s, {});
      t.ok(!H.visitOf(s) && pending(s, w) && H.peek(s, w).trials.t1, w + ' 3c: counted, then Leave: pending');
      const r0 = rec(s, w), notes0 = JSON.stringify(H.peek(s, w).notes);
      // ---- 4. the hearth ----------------------------------------------------------------------------------------------
      await run(HEARTH, { pick: 1 });
      t.ok(confirms.length === 1 && confirms[0].q === 'The question after the tale is still open.' && JSON.stringify(confirms[0].opts) === '["Answer it now","Not now"]',
        w + ' 4a: the hearth asks, with "Not now" last ' + JSON.stringify(confirms));
      t.ok(!asked.length && saves === 1 && pending(s, w) && !s.vars._tale && rec(s, w) === r0, w + ' 4a: "Not now": no question, its own autosave only, still pending');
      await run(HEARTH, { pick: 0, question: 'cancel' });
      t.ok(asked.join() === Q && !reflected(w) && saves === 1 && pending(s, w) && s.vars._tale === 0 && !notices.length && rec(s, w) === r0,
        w + ' 4b: "Answer it now", then put off: no reflection, no second autosave, still pending, the routing cleared ' + JSON.stringify({ saves, tale: s.vars._tale }));
      const save1 = JSON.stringify(RB.save.migrate(JSON.parse(JSON.stringify(s))).hall);
      t.ok(pending(RB.save.migrate(JSON.parse(JSON.stringify(s))), w), w + ' 3d: pending through a save\'s copy and its migration');
      t.ok(JSON.parse(save1).visit === null, w + ' 3d: (no visit at the hearth)');
      await run(HEARTH, { pick: 0, question: 'revealed' });
      t.ok(asked.join() === Q && reflected(w) && saves === 2 && !pending(s, w) && s.vars._tale === 0 && !notices.length,
        w + ' 4c: "Answer it now", answered (revealed): the reflection, then one more autosave; nothing pending ' + JSON.stringify({ saves }));
      t.ok(rec(s, w) === r0 && JSON.stringify(H.peek(s, w).notes) === notes0, w + ' 4c: the wing\'s record (credit, floors, notes, help) exactly as it was');
      await run(HEARTH, { pick: 0 });
      t.ok(!confirms.length && saves === 1, w + ' 4d: once answered, the hearth offers nothing');
    }
    {
      // the held floor (defensive, synthetic: no wing has a reprieve on floor 0)
      const s = fresh(); await enter(s, w);
      await run(SC, { question: 'cancel' });
      H.visitOf(s).reprieve = 1;
      H.retreat(s, { keep: true });
      t.ok(!H.visitOf(s) && H.peek(s, w).held && H.peek(s, w).held.done.t1 && pending(s, w), w + ' 3e: a held floor 0 (synthetic): the held credit, pending');
      await run(HEARTH, { pick: 0 });
      t.ok(!confirms.length, w + ' 3e: the hearth offers nothing before the floor counts');
      RB.hooks.hall_card = async () => { s.vars._res = 2; };
      await run('hall.door_' + w);
      t.ok(H.visitOf(s) && H.visitOf(s).done.t1 && pending(s, w), w + ' 3e: back to the held floor: the credit restored, pending');
      await run(SC, { question: 'ok' });
      t.ok(asked.join() === Q && reflected(w) && !pending(s, w) && !notices.length, w + ' 3e: the scroll asks it; answered: the reflection');
    }
    {
      // practice: the wing done with the question unanswered (an old journey's state)
      const s = fresh(); await enter(s, w);
      for (const x of H.get(w).trials) H.markTrial(s, w, x.id);
      t.ok(H.peek(s, w).done && pending(s, w), w + ' 3f: (the wing done, the question unanswered: pending)');
      H.retreat(s, {});
      const r0 = rec(s, w);
      await enter(s, w);
      t.ok(H.visitOf(s).practice && H.visitOf(s).floor === 0, w + ' 3f: (a practice walk from floor 0)');
      await run(SC, { question: 'cancel' });
      t.ok(asked.join() === 'hall.' + w + '.story,' + Q && !reflected(w) && pending(s, w) && notices.length === 1 && notices[0].endsWith(' ' + COUNTED),
        w + ' 3f: practice: the ordering replayed, then the question; put off: no reflection, the counted notice ' + JSON.stringify(notices));
      await run(SC, { question: 'ok' });
      t.ok(asked.join() === Q && reflected(w) && !pending(s, w), w + ' 3f: practice, the scroll again, answered: the reflection; nothing pending');
      H.retreat(s, {});
      t.ok(rec(s, w) === r0, w + ' 3f: practice changed no record');
      s.vars._tale = n;
      await enter(s, w);
      await run(SC, { question: 'cancel' });
      t.ok(asked[0] === 'hall.' + w + '.story' && s.vars._tale === 0, w + ' 3f: a stale routing variable in practice: the ordering still replayed, and it is cleared');
    }
    {
      // old journeys, and journeys with nothing to offer
      const s = fresh();
      H.wrec(s, w).trials.t1 = { t: 1, route: 'consolidate', tactics: 'normal' };
      H.wrec(s, w).floors[0] = true;
      t.ok(pending(s, w), w + ' 3g: an old journey, credit and no answer: pending');
      await run(HEARTH, { pick: 1 });
      t.ok(confirms.length === 1, w + ' 3g: its hearth offers the question');
      s.flags['chal:' + Q] = true;
      t.ok(!pending(s, w), w + ' 3g: an old journey with the answer: nothing pending');
      const e = fresh();
      const before = JSON.stringify(e);
      t.ok(!pending(e, w) && !S.test(e, 'hall.' + w + '.tale') && JSON.stringify(e) === before && !(e.hall && e.hall.wings && e.hall.wings[w]),
        w + ' 3h: an empty journey: nothing pending, and reading it made no record');
      const u = fresh(); await enter(u, w);
      const b2 = JSON.stringify(u);
      t.ok(!pending(u, w) && JSON.stringify(u) === b2, w + ' 3h: a visit with nothing earned: nothing pending, nothing changed by reading');
      const other = WINGS[(n % 10)];
      u.hall.visit.done.t1 = true;
      t.ok(pending(u, w) && !pending(u, other), w + ' 3h: a visit\'s credit counts for its own wing only (' + other + ')');
    }
    {
      // the routing variable: stale values never skip the ordering
      const s = fresh(); await enter(s, w);
      s.vars._tale = n;
      await run(SC, { question: 'cancel' });
      t.ok(asked.join() === 'hall.' + w + '.story,' + Q && s.vars._tale === 0, w + ' 4e: a stale routing variable, nothing earned: the ordering, then the question; cleared');
      s.vars._tale = n;
      await run(SC, { question: 'cancel' });
      t.ok(asked.join() === Q && said[0] && /proper order/.test(said[0].en) && s.vars._tale === 0, w + ' 4e: a stale one in a visit, pending: the scroll\'s own line, then the question; cleared');
      s.vars._tale = (n % 10) + 1;
      await run(SC, { question: 'cancel' });
      t.ok(asked.join() === Q && s.vars._tale === (n % 10) + 1, w + ' 4e: another wing\'s value is not this scroll\'s');
    }
  }

  // ---- 3d. a save and a load, through the save layer -------------------------------------------------------------
  {
    const s = fresh({ id: 'tale-save' }); await enter(s, 'w1');
    bank0(s, 'w1');
    await run('hall.w1.t1', { question: 'cancel' });
    H.retreat(s, {});
    await RB.save.writeSlot(1, s);
    const r = (await RB.save.read(1, 'manual')).state;
    t.ok(S.test(r, 'hall.w1.tale') && !r.flags['chal:hall.w1.story_q'], '3d: saved and loaded: pending');
    r.flags['chal:hall.w1.story_q'] = true;
    await RB.save.writeSlot(1, r);
    const r2 = (await RB.save.read(1, 'manual')).state;
    t.ok(!S.test(r2, 'hall.w1.tale') && r2.flags['chal:hall.w1.story_q'] === true, '3d: answered, saved and loaded: answered');
  }
  // ---- 3i. a suspend point in the middle of a visit -----------------------------------------------------------------
  {
    const s = fresh({ id: 'tale-suspend' }); await enter(s, 'w2');
    await run('hall.w2.t1', { question: 'cancel' });
    const copy = RB.save.migrate(JSON.parse(JSON.stringify(s)));
    t.ok(copy.hall.visit && copy.hall.visit.done.t1 && S.test(copy, 'hall.w2.tale'), '3i: a copy of the journey mid-visit (as a suspend point keeps it): the credit and pending');
    RB.game.G.s = copy; RB.world.W.map = { id: copy.map };
    await run('hall.w2.t1', { question: 'ok' });
    t.ok(asked.join() === 'hall.w2.story_q' && reflected('w2') && !S.test(copy, 'hall.w2.tale'), '3i: resumed there, the scroll asks it; answered: the reflection');
  }
  // ---- the real runner (its automatic answers in tests) records the answer itself -----------------------------------
  {
    const real = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
    t.ok(typeof real.challenge.run === 'function', '(a second game, its challenge runner untouched)');
    const s = real.state.newCampaign({ edition: 2 });
    real.game.G.s = s;
    real.test.enable();
    const res = await real.challenge.run('hall.w1.story_q', { scene: 'hall.w1.t1' });
    real.test.disable();
    t.ok(res.ok && s.flags['chal:hall.w1.story_q'] === true, 'the real runner records an answer as chal:hall.w1.story_q (the flag the question\'s state reads)');
  }

  // ---- 5. the content -------------------------------------------------------------------------------------------------
  // the keys (scene + the first 10 hex of sha256 of the Japanese, as tools/voice/lines.mjs) of every line, sorted, with
  // their count, digested; the digests are 433ae92's
  const WANT = {
    'hall.w1.t1': [17, '1e1e2518fcec1c99'], 'hall.hearth_w1': [1, 'f6dd4c6432d09fa4'], 'hall.w2.t1': [17, '04ea7d04e8a59df7'], 'hall.hearth_w2': [1, '991e45a9cdc14168'],
    'hall.w3.t1': [17, 'eda499060dd6d8b4'], 'hall.hearth_w3': [1, '39f4a78a69b81cac'], 'hall.w4.t1': [17, '65f1aa763ccddaec'], 'hall.hearth_w4': [1, '3de76414e4671ff2'],
    'hall.w5.t1': [17, '1a1fdf663e9649ff'], 'hall.hearth_w5': [1, '17fefe6825ad4167'], 'hall.w6.t1': [17, 'eadbadd78fc6a371'], 'hall.hearth_w6': [1, '03fb445328ec5940'],
    'hall.w7.t1': [17, '51b94c9c04ec931f'], 'hall.hearth_w7': [1, '4c67df4106a23f27'], 'hall.w8.t1': [17, '7289ff23753ffd9d'], 'hall.hearth_w8': [1, 'a9340811c6445a8a'],
    'hall.w9.t1': [17, 'e6fb5f2a2c65eb2a'], 'hall.hearth_w9': [1, '260230ab9c45a7a4'], 'hall.w10.t1': [17, '375ad0ca42ad62e9'], 'hall.hearth_w10': [1, 'b200fef8c95a37ba'],
  };
  const keys = (id) => C.scenes[id].cmds.filter((c) => c.jp).map((c) => id + '#' + crypto.createHash('sha256').update(String(c.jp)).digest('hex').slice(0, 10)).sort();
  const digest = (id) => { const k = keys(id); return [k.length, crypto.createHash('sha256').update(k.join('\n')).digest('hex').slice(0, 16)]; };
  for (const id of Object.keys(WANT)) t.eq(digest(id), WANT[id], '5: ' + id + ': its Japanese lines, by key and by count, as at 433ae92');
};
