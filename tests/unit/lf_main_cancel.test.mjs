// Lanternfall's main quest (Row A: Agnes 6639438614; Cloud CC-522, CC-525): "Come back later" is not the exercise done.
// Tadashi's request form, the conduit's tag and Tami's minutes each went on, whatever the exercise returned, to the
// slip and the ledger desk, the conduit seen, and the minutes read with step 5. Now each exercise is followed by
// `?(var._res=0) !end` (Tami's after the records music is back). Tadashi's scene sends a form left for later to your
// request (`:form`), not his welcome, and his kana lesson comes once. (Akari's key: tests/unit/lf_akari_cancel.test.mjs.)
// With synthetic campaigns only: the real scene runner (the dialogue stubbed), each scene reached by its own talk list
// or thing, the exercises answered or cancelled by the test as the runner returns them, saves round-tripped through the
// save's own migration:
//  1. the scenes: the guards; Tadashi's `:form` at your request and the lesson once; Tami's music before her guard;
//  2. Tadashi: his welcome, your request, the form left: step 1, no slip, the lesson once; then your request only (no
//     welcome, no second lesson), the form done: the slip, the ledger desk; then his desk line;
//  3. the conduit left: not seen, no note; then done: seen, noted once;
//  4. Tami's minutes left: the records music back, nothing told, step 4; then done: told, step 5, the records music;
//  5. each left twice, a save and load, then done: everything once; a stale result both ways;
//  6. the first-time paths line for line as on the parent, with each companion and none (fingerprints taken on the
//     parent, 49db870); no scene ended on an error from the runner.
import crypto from 'node:crypto';
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state;
  const flat = (x) => JSON.stringify(x);
  const fp = (x) => crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex').slice(0, 16);

  // ---- a minimal stage (as tests/unit/lf_side_cancel.test.mjs) ----------------------------------------------------
  let lines = [], cancel = new Set(), asked = [], lessons = [], music = [];
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
  RB.lessons.run = async (id) => { lessons.push(id); };
  if (RB.audio) { RB.audio.playSong = (id) => { music.push(id); }; RB.audio.stopSong = () => { music.push('-'); }; }
  RB.challenge.run = async (id) => { asked.push(id); if (cancel.has(id)) return { ok: false, cancelled: true }; RB.game.G.s.flags['chal:' + id] = true; return { ok: true }; };
  const DONE = { departed: true, ch1_done: true, ch2_done: true, ch3_done: true, ch4_done: true, lf_arrived: true, lf_town_intro: true };
  let s;
  const use = (st) => { s = st; RB.game.G.s = st; RB.game.s = st; RB.world.W.map = { id: st.map, def: C.maps[st.map] }; return st; };
  const fresh = (o = {}) => {
    const st = S.newCampaign({ edition: 2 });
    st.id = 'lf-main-cancel-test'; st.map = o.map || 'lf.records'; st.comp = o.comp === undefined ? 'nao' : o.comp;
    st.player.name = 'Haru'; st.player.nameJp = 'ハル';
    Object.assign(st.flags, DONE, o.flags || {});
    st.quests.lf_main = { stage: o.main === undefined ? 0 : o.main, done: false, t: 1 };
    st.inv = Object.assign({}, o.inv || {});
    st.vars = Object.assign({}, o.vars || {});
    return use(st);
  };
  const errors = [];
  const cerr = console.error;
  console.error = (...a) => { if (a[0] === 'scene error') errors.push(a[1] + ': ' + String((a[2] && a[2].message) || a[2])); else cerr(...a); };
  const run = async (id, o = {}) => { lines = []; asked = []; lessons = []; music = []; cancel = new Set(o.cancel || []); try { await RB.script.run(id); } catch (e) { errors.push(id + ': ' + String((e && e.message) || e)); } return lines; };
  const talkOf = (map, id) => { const n = (C.maps[map].npcs || []).find((x) => x.id === id && (!x.if || S.test(s, x.if))); return n ? ((Array.isArray(n.talk) ? n.talk : [{ scene: n.talk }]).find((x) => !x.if || S.test(s, x.if)) || {}).scene : null; };
  const talk = async (map, id, o) => { const sc = talkOf(map, id); await run(sc, o); return sc; };
  const thing = async (map, scene, o) => { const p = (C.maps[map].props || []).find((x) => x.scene === scene && (!x.if || S.test(s, x.if))); await run(p ? p.scene : null, o); return p ? p.scene : null; };
  const saved = () => JSON.stringify(s);
  const loadSave = (text) => use(RB.save.migrate(JSON.parse(text)));
  const B = {
    welcome: /Welcome to the Public Records Hall/, ask: /I'd like to look into the bell tower in the lake/, received: /Duly received/, desk: /The ledger is on the desk to your left/,
    tag: /Uphill\. Bound for the Still Archive/, pipe: /A thick pipe runs up the wall/, minutes: /Are those… minutes\?/, tokuji: /If you want to know about the bell, ask Tokuji/,
  };
  const count = (re) => lines.filter((l) => re.test(l.en)).length;
  const said = (re) => count(re) > 0;
  const st = () => ({ main: s.quests.lf_main.stage, slip: (s.inv || {}).lf_request_slip || 0, seen: !!s.flags.lf_conduit_seen, told: !!s.flags.lf_yae_told,
    lesson: !!s.flags.lf_form_lesson, note: (s.notebook || []).some((e) => e.id === 'lf_conduits') });

  // 1. the scenes
  {
    const guard = (id, ch, skip) => { const c = C.scenes[id].cmds, i = c.findIndex((x) => x.op === 'challenge' && x.args[0] === ch); const g = c.slice(i + 1, i + 1 + (skip || 0) + 1).map((x) => ({ op: x.op, args: x.args, if: x.if || null })); return g; };
    const td = C.scenes['lf.tadashi'], tc = td.cmds;
    const form = tc[td.labels.form], lesson = tc.find((x) => x.op === 'lesson');
    const a = { tadashi: guard('lf.tadashi', 'lf.ch_form'), conduit: guard('lf.conduit', 'lf.ch_conduit'), tami: guard('lf.yae_minutes', 'lf.ch_minutes', 1),
      form: form && form.op === 'say' && /I'd like to look into the bell tower/.test(form.en), lesson: lesson && lesson.if };
    t.ok(a.tadashi[0].op === 'end' && a.tadashi[0].if === 'var._res=0' && a.conduit[0].op === 'end' && a.conduit[0].if === 'var._res=0' &&
      a.tami[0].op === 'music' && a.tami[0].args[0] === 'lf_records' && a.tami[0].if === 'var._res=0' && a.tami[1].op === 'end' && a.tami[1].if === 'var._res=0' && a.form && a.lesson === '!lf_form_lesson',
      '1 the scenes: the guards; Tadashi\'s :form at your request, the lesson once; Tami\'s music before her guard ' + flat({ tadashi: a.tadashi, conduit: a.conduit, tami: a.tami, form: a.form, lesson: a.lesson }));
  }

  // 2. Tadashi's form
  {
    fresh();
    const r0 = await talk('lf.records', 'lf_tadashi', { cancel: ['lf.ch_form'] });
    const a = Object.assign(st(), { r0, welcome: said(B.welcome), ask: said(B.ask), received: said(B.received), lessons: lessons.slice(), asked: asked.slice() });
    await talk('lf.records', 'lf_tadashi');
    const b = Object.assign(st(), { welcome: said(B.welcome), ask: count(B.ask), received: count(B.received), lessons: lessons.slice() });
    await talk('lf.records', 'lf_tadashi');
    const c = Object.assign(st(), { desk: said(B.desk), asked: asked.length });
    t.ok(a.r0 === 'lf.tadashi' && a.welcome && a.ask && !a.received && flat(a.lessons) === '["kana"]' && flat(a.asked) === '["lf.ch_form"]' && a.main === 1 && a.slip === 0 && a.lesson,
      '2a his welcome, your request, the form left: step 1, no slip, the lesson once ' + flat(a));
    t.ok(!b.welcome && b.ask === 1 && b.received === 1 && !b.lessons.length && b.slip === 1 && b.main === 1 && c.desk && c.asked === 0,
      '2b then your request only, no second lesson; the form done: the slip; then his desk line ' + flat({ b, c }));
  }

  // 3. the conduit
  {
    fresh({ map: 'lf.stacks', main: 3, inv: { lf_stacks_key: 1 } });
    const r0 = await thing('lf.stacks', 'lf.conduit', { cancel: ['lf.ch_conduit'] });
    const a = Object.assign(st(), { r0, pipe: said(B.pipe), tag: said(B.tag) });
    await thing('lf.stacks', 'lf.conduit');
    const b = Object.assign(st(), { pipe: count(B.pipe), tag: count(B.tag) });
    t.ok(a.r0 === 'lf.conduit' && a.pipe && !a.tag && !a.seen && !a.note && b.pipe === 1 && b.tag === 1 && b.seen && b.note,
      '3 the conduit left: not seen, no note; then done: seen and noted ' + flat({ a, b }));
  }

  // 4. Tami's minutes
  {
    fresh({ map: 'lf.council', main: 4, inv: { lf_minutes: 1 } });
    const r0 = await talk(s.map, 'lf_yae', { cancel: ['lf.ch_minutes'] });
    const a = Object.assign(st(), { r0, music: music.slice(), minutes: said(B.minutes), tokuji: said(B.tokuji) });
    await talk(s.map, 'lf_yae');
    const b = Object.assign(st(), { music: music.slice(), minutes: count(B.minutes), tokuji: count(B.tokuji) });
    t.ok(a.r0 === 'lf.yae_minutes' && flat(a.music) === '["lf_flood","lf_records"]' && a.minutes && !a.tokuji && !a.told && a.main === 4 &&
      flat(b.music) === '["lf_flood","lf_records"]' && b.minutes === 1 && b.tokuji === 1 && b.told && b.main === 5,
      '4 Tami\'s minutes left: the records music back, nothing told, step 4; then done: told, step 5 ' + flat({ a, b }));
  }

  // 5. each left twice, a save and load, then done; a stale result
  {
    fresh();
    let received = 0;
    await talk('lf.records', 'lf_tadashi', { cancel: ['lf.ch_form'] }); received += count(B.received);
    await talk('lf.records', 'lf_tadashi', { cancel: ['lf.ch_form'] }); received += count(B.received);
    loadSave(saved());
    await talk('lf.records', 'lf_tadashi'); received += count(B.received);
    const a = Object.assign(st(), { received });
    fresh({ vars: { _res: 0 } });
    await talk('lf.records', 'lf_tadashi');
    const b = st();
    fresh({ vars: { _res: 1 } });
    await talk('lf.records', 'lf_tadashi', { cancel: ['lf.ch_form'] });
    const c = st();
    fresh({ map: 'lf.council', main: 4, inv: { lf_minutes: 1 } });
    await talk(s.map, 'lf_yae', { cancel: ['lf.ch_minutes'] });
    await talk(s.map, 'lf_yae', { cancel: ['lf.ch_minutes'] });
    loadSave(saved());
    await talk(s.map, 'lf_yae');
    const d = Object.assign(st(), { tokuji: count(B.tokuji) });
    // the conduit, the same way (Agnes 6646720603: section 5 now covers all three)
    fresh({ map: 'lf.stacks', main: 3, inv: { lf_stacks_key: 1 } });
    let tags = 0;
    await thing('lf.stacks', 'lf.conduit', { cancel: ['lf.ch_conduit'] }); tags += count(B.tag);
    await thing('lf.stacks', 'lf.conduit', { cancel: ['lf.ch_conduit'] }); tags += count(B.tag);
    const e0 = st();
    loadSave(saved());
    await thing('lf.stacks', 'lf.conduit'); tags += count(B.tag);
    const e = Object.assign(st(), { tags, before: { seen: e0.seen, note: e0.note }, notes: (s.notebook || []).filter((x) => x.id === 'lf_conduits').length });
    t.ok(a.received === 1 && a.slip === 1 && b.slip === 1 && c.slip === 0 && c.main === 1 && d.told && d.main === 5 && d.tokuji === 1 &&
      !e.before.seen && !e.before.note && e.tags === 1 && e.seen && e.note && e.notes === 1,
      '5 Tadashi, Tami and the conduit each left twice, a save and load, then done: everything once; a stale result of 0 before a success, and of 1 before a cancel, changes nothing ' + flat({ a, b, c, d, e }));
  }

  // 6. the first-time paths, line for line as on the parent
  {
    const got = {};
    for (const comp of ['nao', 'mio', 'ren', 'suzu', null]) {
      fresh({ comp });
      await talk('lf.records', 'lf_tadashi'); const p1 = lines;
      fresh({ comp, map: 'lf.stacks', main: 3, inv: { lf_stacks_key: 1 } });
      await thing('lf.stacks', 'lf.conduit'); const p2 = lines;
      fresh({ comp, map: 'lf.council', main: 4, inv: { lf_minutes: 1 } });
      await talk(s.map, 'lf_yae'); const p3 = lines;
      got[String(comp)] = [fp(p1), fp(p2), fp(p3)];
    }
    t.ok(fp(got) === FIRST_FP, '6 the first-time paths line for line as on the parent, with each companion and none ' + flat({ fp: fp(got) }));
  }

  t.ok(!errors.length, 'no scene ended on an error from the runner ' + errors.slice(0, 3).join(' | '));
  console.error = cerr;
};
// computed on the parent (49db870): Tadashi's first visit, the conduit and Tami's minutes, each done at once, with each
// companion and none
const FIRST_FP = '3a768be81103a72d';
