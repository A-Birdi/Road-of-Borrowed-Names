// Lanternfall's side quests: "Come back later" is not the exercise done (Agnes 6639438614, findings 1, 9 and 12; Cloud
// CC-522, CC-525; Local CL-689; Agnes 6639995441). Umi's ferry log (both its paths), Hayato's form and the fence each
// ran their exercise and went on to its ending whatever it returned, so a cancel gave the timetable step, the red pen
// and the quest done, or the settlement and the dried persimmons, with no retry. Now each exercise is followed by
// `?(var._res=0) !end`, and Hayato's scene sends a started quest to his request (`:ask`), its finished one to his
// finished line. With synthetic campaigns only: the real scene runner (the dialogue stubbed), each scene reached by
// its own noticeboard or talk list, the exercises answered or cancelled by the test as the runner returns them
// (src/ui/65_challenge.js: a cancel returns { ok: false, cancelled: true } before its chal: flag is set), saves
// round-tripped through the save's own migration:
//  1. the scenes: a guard straight after each of the four exercises; Hayato's routing;
//  2. Umi, before the bell and after it: a cancel leaves the step at 0 and the noticeboard offers the log again; done,
//     step 1, with Umi's answer once;
//  3. Hayato, before the bell and after it: his greeting and request at the first meeting; a cancel leaves the quest
//     started, no pen, no struck line; then his request only (no second greeting), and done gives the ending once;
//     after it, his finished line;
//  4. the fence, by Kohei and by Kinu: a cancel keeps step 3 and no persimmons; the retry settles it once;
//  5. cancelled twice, a save and load, then done: everything once;
//  6. a result left over from another exercise changes nothing (a stale `_res` of 0 before a success, of 1 before a
//     cancel);
//  7. saves finished before (the quest done without its chal: flag) are left as they are;
//  8. the first-time success paths, line for line as before (fingerprints taken on the parent, 5c93c10), with each
//     companion; no scene ended on an error from the runner.
import crypto from 'node:crypto';
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state;
  const flat = (x) => JSON.stringify(x);
  const fp = (x) => crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex').slice(0, 16);

  // ---- a minimal stage (as tests/unit/mp_rehearsal_cancel.test.mjs) ----------------------------------------------------
  let lines = [], cancel = new Set(), asked = [];
  RB.ui.dialogue.say = async (l) => { lines.push({ who: l.who, jp: l.jp || '', en: l.en || '' }); };
  RB.ui.dialogue.choose = async () => 0;
  RB.ui.dialogue.hide = () => {};
  RB.ui.toast = async () => {};
  RB.ui.notice = () => {};
  RB.ui.shake = () => {};
  RB.ui.fade = async () => {};
  for (const k of ['ensureSpeaker', 'dismissExtras', 'refreshActors']) RB.world[k] = () => {};
  RB.world.whenArrived = async () => {};
  RB.world.emote = () => {};
  RB.game.afterScene = () => {};
  RB.world.W = RB.world.W || {};
  RB.game.inBattle = () => false;
  RB.game.transition = async () => {};
  RB.save.autosave = async () => {};
  if (RB.staging) RB.staging.walkTo = async () => {};
  RB.challenge.run = async (id) => { asked.push(id); if (cancel.has(id)) return { ok: false, cancelled: true }; RB.game.G.s.flags['chal:' + id] = true; return { ok: true }; };
  let s;
  const use = (st) => { s = st; RB.game.G.s = st; RB.game.s = st; RB.world.W.map = { id: st.map, def: C.maps[st.map] }; return st; };
  const fresh = (o = {}) => {
    const st = S.newCampaign({ edition: 2 });
    st.id = 'lf-side-cancel-test'; st.map = o.map || 'lf.town'; st.comp = o.comp === undefined ? 'nao' : o.comp;
    st.player.name = 'Haru'; st.player.nameJp = 'ハル';
    Object.assign(st.flags, { departed: true, ch1_done: true, ch2_done: true, ch3_done: true, ch4_done: true, lf_arrived: true, lf_town_intro: true }, o.flags || {});
    st.quests.lf_main = { stage: 3, done: false, t: 1 };
    for (const [k, v] of Object.entries(o.quests || {})) st.quests[k] = typeof v === 'object' ? v : { stage: v, done: false, t: 1 };
    st.vars = Object.assign({}, o.vars || {});
    return use(st);
  };
  const errors = [];
  const cerr = console.error;
  console.error = (...a) => { if (a[0] === 'scene error') errors.push(a[1] + ': ' + String((a[2] && a[2].message) || a[2])); else cerr(...a); };
  const run = async (id, o = {}) => { lines = []; asked = []; cancel = new Set(o.cancel || []); try { await RB.script.run(id); } catch (e) { errors.push(id + ': ' + String((e && e.message) || e)); } return lines; };
  const talk = (map, id) => { s.map = map; RB.world.W.map = { id: map, def: C.maps[map] }; const n = (C.maps[map].npcs || []).find((x) => x.id === id && (!x.if || S.test(s, x.if))); return n ? ((n.talk || []).find((x) => !x.if || S.test(s, x.if)) || {}).scene : null; };
  const said = (re) => lines.some((l) => re.test(l.en));
  const q = (id) => (s.quests[id] ? (s.quests[id].done ? 'done' : s.quests[id].stage) : '-');
  const item = (id) => (s.inv && s.inv[id]) || 0;
  const saved = () => JSON.stringify(s);
  const loadSave = (text) => use(RB.save.migrate(JSON.parse(text)));
  const B = {
    umiAnswer: /That's my handwriting/, hayatoHello: /it's you from earlier/, hayatoAsk: /could you possibly take a quick look/,
    struck: /You draw one line|strikes the line out/, hayatoDone: /approved it with "of course"|struck out too much/,
    settle: /How about the line runs through the middle/, persimmons: /dried persimmons left from last year/,
  };

  // 1. the scenes
  {
    const guardAfter = (sid, ch) => { const cmds = C.scenes[sid].cmds; return cmds.map((c, i) => (c.op === 'challenge' && c.args[0] === ch ? i : -1)).filter((i) => i >= 0).map((i) => !!cmds[i + 1] && cmds[i + 1].op === 'end' && cmds[i + 1].if === 'var._res=0'); };
    const g = { umi: guardAfter('lf.timetable', 'lf.ch_timetable'), hayato: guardAfter('lf.hayato', 'lf.ch_form2'), fence: guardAfter('lf.fence_talk', 'lf.ch_fence') };
    const hc = C.scenes['lf.hayato'].cmds.slice(0, 3).map((c) => c.op + ' ' + (c.args || []).join(' '));
    t.ok(flat(g) === flat({ umi: [true, true], hayato: [true], fence: [true] }) && C.scenes['lf.hayato'].labels.ask != null && /quest\.lf_form=done/.test(hc[0]) && /again/.test(hc[0]) && /quest\.lf_form/.test(hc[1]) && /ask/.test(hc[1]),
      '1 a guard straight after each of the four exercises; Hayato: a finished quest to his finished line, a started one to his request ' + flat({ g, hc }));
  }

  // 2. Umi, before the bell and after it
  for (const bell of [false, true]) {
    fresh({ map: 'lf.ferry', flags: bell ? { lf_bell_rung: true } : {}, quests: { lf_timetable: 0 } });
    await run('lf.timetable', { cancel: ['lf.ch_timetable'] });
    const a = { asked: asked.slice(), step: q('lf_timetable'), answer: said(B.umiAnswer), journal: (s.journal || []).length };
    await run('lf.timetable');
    const b = { asked: asked.slice(), step: q('lf_timetable'), answer: said(B.umiAnswer) };
    await run('lf.timetable');
    const c = { asked: asked.slice(), step: q('lf_timetable') };
    t.ok(flat(a.asked) === '["lf.ch_timetable"]' && a.step === 0 && !a.answer && a.journal === 0 && flat(b.asked) === '["lf.ch_timetable"]' && b.step === 1 && b.answer === !bell && c.asked.length === 0 && c.step === 1,
      '2 Umi' + (bell ? ' after the bell' : '') + ': a cancel leaves the step at 0 with no answer; the noticeboard offers the log again, and done gives step 1' + (bell ? '' : ' and her answer') + '; then no more ' + flat({ a, b, c }));
  }

  // 3. Hayato, before the bell and after it
  for (const bell of [false, true]) {
    fresh({ map: 'lf.records', flags: bell ? { lf_bell_rung: true } : {} });
    const first = talk('lf.records', 'lf_hayato');
    await run(first, { cancel: ['lf.ch_form2'] });
    const a = { first, hello: said(B.hayatoHello), ask: said(B.hayatoAsk), quest: q('lf_form'), pen: item('lf_red_pen'), struck: said(B.struck) };
    const again = talk('lf.records', 'lf_hayato');
    await run(again);
    const b = { again, hello: said(B.hayatoHello), ask: said(B.hayatoAsk), asked: asked.slice(), quest: q('lf_form'), pen: item('lf_red_pen'), struck: said(B.struck) };
    const later = talk('lf.records', 'lf_hayato');
    await run(later);
    const c = { later, done: said(B.hayatoDone), asked: asked.slice(), pen: item('lf_red_pen') };
    t.ok(first === 'lf.hayato' && a.hello && a.ask && a.quest === 0 && a.pen === 0 && !a.struck && again === 'lf.hayato' && !b.hello && b.ask && flat(b.asked) === '["lf.ch_form2"]' && b.quest === 'done' && b.pen === 1 && b.struck && later === 'lf.hayato_done' && c.done && c.asked.length === 0 && c.pen === 1,
      '3 Hayato' + (bell ? ' after the bell' : '') + ': greeting and request at first; a cancel leaves the quest started, no pen, no struck line; then his request only, and done: the line struck, the pen, the quest done; then his finished line ' + flat({ a, b, c }));
  }

  // 4. the fence, by Kohei and by Kinu
  for (const [who, other] of [['lf_kohei', 'lf_kinu'], ['lf_kinu', 'lf_kohei']]) {
    fresh({ map: 'lf.gardens', flags: { lf_bell_rung: true }, quests: { lf_fence: 2 } });
    const t1 = talk('lf.gardens', who);
    await run(t1, { cancel: ['lf.ch_fence'] });
    const a = { t1, asked: asked.slice(), step: q('lf_fence'), hoshi: item('lf_hoshigaki'), settle: said(B.settle) };
    const t2 = talk('lf.gardens', other);
    await run(t2);
    const b = { t2, asked: asked.slice(), step: q('lf_fence'), hoshi: item('lf_hoshigaki'), settle: said(B.settle), persimmons: said(B.persimmons) };
    t.ok(t1 === 'lf.fence_talk' && flat(a.asked) === '["lf.ch_fence"]' && a.step === 3 && a.hoshi === 0 && !a.settle && t2 === 'lf.fence_talk' && flat(b.asked) === '["lf.ch_fence"]' && b.step === 'done' && b.hoshi === 1 && b.settle && b.persimmons,
      '4 the fence, cancelled with ' + who + ': step 3, no settlement, no persimmons; then ' + other + ' brings the argument back, and done settles it once ' + flat({ a, b }));
  }

  // 5. cancelled twice, a save and load, then done: everything once
  {
    fresh({ map: 'lf.records' });
    await run(talk('lf.records', 'lf_hayato'), { cancel: ['lf.ch_form2'] });
    await run(talk('lf.records', 'lf_hayato'), { cancel: ['lf.ch_form2'] });
    loadSave(saved());
    const a = { quest: q('lf_form'), pen: item('lf_red_pen') };
    await run(talk('lf.records', 'lf_hayato'));
    const b = { quest: q('lf_form'), pen: item('lf_red_pen'), hello: said(B.hayatoHello) };
    fresh({ map: 'lf.gardens', flags: { lf_bell_rung: true }, quests: { lf_fence: 2 } });
    await run(talk('lf.gardens', 'lf_kohei'), { cancel: ['lf.ch_fence'] });
    await run(talk('lf.gardens', 'lf_kohei'), { cancel: ['lf.ch_fence'] });
    loadSave(saved());
    await run(talk('lf.gardens', 'lf_kinu'));
    const c = { step: q('lf_fence'), hoshi: item('lf_hoshigaki') };
    fresh({ map: 'lf.ferry', quests: { lf_timetable: 0 } });
    await run('lf.timetable', { cancel: ['lf.ch_timetable'] });
    await run('lf.timetable', { cancel: ['lf.ch_timetable'] });
    loadSave(saved());
    await run('lf.timetable');
    const d = { step: q('lf_timetable'), answers: lines.filter((l) => B.umiAnswer.test(l.en)).length };
    t.ok(a.quest === 0 && a.pen === 0 && b.quest === 'done' && b.pen === 1 && !b.hello && c.step === 'done' && c.hoshi === 1 && d.step === 1 && d.answers === 1,
      '5 each cancelled twice, a save and load, then done: the pen, the persimmons, the step, each once ' + flat({ a, b, c, d }));
  }

  // 6. a result left over from another exercise changes nothing
  {
    fresh({ map: 'lf.records', vars: { _res: 0 } });
    await run(talk('lf.records', 'lf_hayato'));
    const a = { quest: q('lf_form'), pen: item('lf_red_pen') };
    fresh({ map: 'lf.ferry', quests: { lf_timetable: 0 }, vars: { _res: 1 } });
    await run('lf.timetable', { cancel: ['lf.ch_timetable'] });
    const b = { step: q('lf_timetable'), answer: said(B.umiAnswer) };
    t.ok(a.quest === 'done' && a.pen === 1 && b.step === 0 && !b.answer,
      '6 a stale result of 0 before a success, and of 1 before a cancel, change nothing: each guard reads its own exercise ' + flat({ a, b }));
  }

  // 7. saves finished before, without the chal: flags, are left as they are
  {
    fresh({ map: 'lf.records', quests: { lf_form: { stage: 1, done: true, t: 1 } } });
    const h = talk('lf.records', 'lf_hayato');
    fresh({ map: 'lf.gardens', flags: { lf_bell_rung: true }, quests: { lf_fence: { stage: 3, done: true, t: 1 } } });
    const f = talk('lf.gardens', 'lf_kohei');
    fresh({ map: 'lf.ferry', quests: { lf_timetable: 1 } });
    await run('lf.timetable');
    const u = { asked: asked.slice(), step: q('lf_timetable') };
    t.ok(h === 'lf.hayato_done' && f === 'lf.kohei_done' && u.asked.length === 0 && u.step === 1,
      '7 finished before without chal: flags: Hayato\'s finished line, Kohei\'s, and the noticeboard offers no log ' + flat({ h, f, u }));
  }

  // 8. the first-time success paths, line for line as before
  {
    const got = {};
    for (const comp of ['nao', 'mio', 'ren', 'suzu', null]) for (const bell of [false, true]) {
      fresh({ map: 'lf.records', comp, flags: bell ? { lf_bell_rung: true } : {} });
      await run(talk('lf.records', 'lf_hayato'));
      got['hayato:' + comp + ':' + bell] = fp(lines);
    }
    for (const bell of [false, true]) {
      fresh({ map: 'lf.ferry', flags: bell ? { lf_bell_rung: true } : {}, quests: { lf_timetable: 0 } });
      await run('lf.timetable');
      got['umi:' + bell] = fp(lines);
    }
    for (const comp of ['nao', 'mio', 'ren', 'suzu']) {
      fresh({ map: 'lf.gardens', comp, flags: { lf_bell_rung: true }, quests: { lf_fence: 2 } });
      await run(talk('lf.gardens', 'lf_kohei'));
      got['fence:' + comp] = fp(lines);
    }
    t.ok(fp(got) === FIRST_FP, '8 the first-time success paths, line for line as on the parent: Hayato with each companion and none, before and after the bell; Umi both ways; the fence with each companion ' + flat({ fp: fp(got), n: Object.keys(got).length }));
  }

  t.ok(!errors.length, 'no scene ended on an error from the runner ' + errors.slice(0, 3).join(' | '));
  console.error = cerr;
};
// computed on the parent (5c93c10): the first-time success paths' lines
const FIRST_FP = 'bda05384cdce28e7';
