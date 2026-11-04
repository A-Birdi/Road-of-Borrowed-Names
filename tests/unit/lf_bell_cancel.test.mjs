// Lanternfall's bell: "Come back later" is not the inscription read (Agnes 6639438614, finding 10; Cloud CC-522,
// CC-525; Local CL-689; Agnes 6639995441). The bell's scene ran its reading exercise and went on to the inscription's
// meaning, the companion's line and Ring / Not yet, whatever the exercise returned; and its kana lesson ran on every
// visit, so each return taught a further group. Now the exercise is followed by `?(var._res=0) !end` (ending as Not
// yet does); the lesson comes once (`lf_bell_lesson`); and a return after a reading done goes straight to the meaning
// and the choice (`!if chal:lf.ch_bell -> read`), ringing still a choice. With synthetic campaigns only: the real scene
// runner (the dialogue stubbed), the bell's own scene as its prop runs it, the exercise answered or cancelled by the
// test as the runner returns it, the lesson counted, saves round-tripped through the save's own migration:
//  1. the scene: the shortcut, the one-time lesson, the guard after the exercise, and `:read`;
//  2. a cancel: the lesson once, no meaning, no companion's line, no choice, not rung, the main step as it was;
//  3. then the retry: no second lesson; the reading, its meaning, the line, the choice; Not yet: not rung;
//  4. back again after that: no exercise and no lesson, the meaning and the choice; Ring: rung, step 9, the town's
//     after-the-bell steps;
//  5. cancelled twice, a save and load, then read and rung: the lesson once, rung once;
//  6. a result left over from another exercise changes nothing;
//  7. saves from before: one that read it and chose Not yet goes straight to the choice; one with the bell rung has
//     no bell to touch;
//  8. the first-time path, read and rung, line for line as before with each companion (fingerprints taken on the
//     parent, 8717452); no scene ended on an error from the runner.
import crypto from 'node:crypto';
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state;
  const flat = (x) => JSON.stringify(x);
  const fp = (x) => crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex').slice(0, 16);

  // ---- a minimal stage (as tests/unit/mp_rehearsal_cancel.test.mjs) ----------------------------------------------------
  let lines = [], cancel = new Set(), asked = [], chose = [], pick = 0, lessons = 0;
  RB.ui.dialogue.say = async (l) => { lines.push({ who: l.who, jp: l.jp || '', en: l.en || '' }); };
  RB.ui.dialogue.choose = async (opts) => { chose.push((opts || []).map((o) => (o && (o.en || o.text)) || '')); return pick; };
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
  RB.lessons.run = async () => { lessons++; };
  RB.challenge.run = async (id) => { asked.push(id); if (cancel.has(id)) return { ok: false, cancelled: true }; RB.game.G.s.flags['chal:' + id] = true; return { ok: true }; };
  let s;
  const use = (st) => { s = st; RB.game.G.s = st; RB.game.s = st; RB.world.W.map = { id: st.map, def: C.maps[st.map] }; return st; };
  const fresh = (o = {}) => {
    const st = S.newCampaign({ edition: 2 });
    st.id = 'lf-bell-cancel-test'; st.map = 'lf.bellhall'; st.comp = o.comp === undefined ? 'nao' : o.comp;
    st.player.name = 'Haru'; st.player.nameJp = 'ハル';
    Object.assign(st.flags, { departed: true, ch1_done: true, ch2_done: true, ch3_done: true, ch4_done: true, lf_arrived: true, lf_town_intro: true, lf_boss_done: true }, o.flags || {});
    st.quests.lf_main = { stage: 8, done: false, t: 1 };
    st.quests.lf_akari = { stage: 0, done: false, t: 1 };
    st.vars = Object.assign({}, o.vars || {});
    lessons = 0;
    return use(st);
  };
  const errors = [];
  const cerr = console.error;
  console.error = (...a) => { if (a[0] === 'scene error') errors.push(a[1] + ': ' + String((a[2] && a[2].message) || a[2])); else cerr(...a); };
  const run = async (o = {}) => { lines = []; asked = []; chose = []; pick = o.pick || 0; cancel = new Set(o.cancel || []); try { await RB.script.run('lf.bell_touch'); } catch (e) { errors.push('lf.bell_touch: ' + String((e && e.message) || e)); } return lines; };
  const said = (re) => lines.some((l) => re.test(l.en));
  const count = (re) => lines.filter((l) => re.test(l.en)).length;
  const B = { meaning: /When this bell rings, flee to high ground/, comp: /"Run," huh|A "no" that exists to save people|Lanterns show the way|Not a curtain-up bell/, gong: /^GONNNG/, toya: /It rang\. At last\./ };
  const st = () => ({ rung: !!s.flags.lf_bell_rung, main: s.quests.lf_main.stage, akari: s.quests.lf_akari.stage, lesson: !!s.flags.lf_bell_lesson, chal: !!s.flags['chal:lf.ch_bell'], lessons });
  const saved = () => JSON.stringify(s);
  const loadSave = (text) => use(RB.save.migrate(JSON.parse(text)));

  // 1. the scene
  {
    const cmds = C.scenes['lf.bell_touch'].cmds;
    const i = cmds.findIndex((c) => c.op === 'challenge' && c.args[0] === 'lf.ch_bell');
    const pre = cmds.slice(0, i).map((c) => c.op + (c.if ? '?' + c.if : '') + ' ' + (c.args || []).join(' ')).filter((x) => /chal:lf\.ch_bell|lesson|lf_bell_lesson/.test(x));
    t.ok(i > 0 && cmds[i + 1].op === 'end' && cmds[i + 1].if === 'var._res=0' && C.scenes['lf.bell_touch'].labels.read === i + 2 && flat(pre) === flat(['if chal:lf.ch_bell -> read', 'lesson?!lf_bell_lesson kana', 'set lf_bell_lesson']),
      '1 the scene: a reading done goes to its meaning; the lesson once; a guard after the exercise; then the meaning ' + flat({ pre, next: cmds[i + 1] }));
  }

  // 2 to 4. a cancel; the retry and Not yet; back again and Ring
  {
    fresh();
    await run({ cancel: ['lf.ch_bell'] });
    const a = Object.assign(st(), { asked: asked.slice(), meaning: said(B.meaning), comp: said(B.comp), chose: chose.length });
    await run({ pick: 1 });
    const b = Object.assign(st(), { asked: asked.slice(), meaning: said(B.meaning), comp: said(B.comp), chose: chose.slice(), gong: said(B.gong) });
    await run({ pick: 0 });
    const c = Object.assign(st(), { asked: asked.slice(), meaning: said(B.meaning), chose: chose.length, gong: said(B.gong), toya: said(B.toya) });
    t.ok(flat(a.asked) === '["lf.ch_bell"]' && a.lessons === 1 && a.lesson && !a.meaning && !a.comp && a.chose === 0 && !a.rung && a.main === 8 && !a.chal,
      '2 a cancel: the lesson once, no meaning, no companion\'s line, no choice, not rung, step 8 ' + flat(a));
    t.ok(flat(b.asked) === '["lf.ch_bell"]' && b.lessons === 1 && b.meaning && b.comp && b.chose.length === 1 && /Ring the bell/.test(b.chose[0][0]) && /Not yet/.test(b.chose[0][1]) && !b.gong && !b.rung && b.chal,
      '3 the retry: no second lesson; the reading, its meaning, the line, the choice; Not yet: not rung ' + flat(b));
    t.ok(c.asked.length === 0 && c.lessons === 1 && c.meaning && c.chose === 1 && c.gong && c.toya && c.rung && c.main === 9 && c.akari === 1,
      '4 back again: no exercise and no lesson, the meaning and the choice; Ring: rung, step 9, Akari\'s step 1 ' + flat(c));
  }

  // 5. cancelled twice, a save and load, then read and rung
  {
    fresh();
    await run({ cancel: ['lf.ch_bell'] });
    await run({ cancel: ['lf.ch_bell'] });
    const n = lessons;
    loadSave(saved());
    lessons = n;
    await run({ pick: 0 });
    const a = Object.assign(st(), { gongs: count(B.gong), asked: asked.slice() });
    t.ok(a.lessons === 1 && a.rung && a.main === 9 && a.gongs === 1 && flat(a.asked) === '["lf.ch_bell"]',
      '5 cancelled twice, a save and load, then read and rung: the lesson once, the gong once, step 9 ' + flat(a));
  }

  // 6. a result left over from another exercise changes nothing
  {
    fresh({ vars: { _res: 0 } });
    await run({ pick: 0 });
    const a = st();
    fresh({ vars: { _res: 1 } });
    await run({ cancel: ['lf.ch_bell'] });
    const b = Object.assign(st(), { meaning: said(B.meaning) });
    t.ok(a.rung && a.main === 9 && !b.rung && !b.meaning, '6 a stale result of 0 before a reading, and of 1 before a cancel, change nothing ' + flat({ a, b }));
  }

  // 7. saves from before
  {
    fresh({ flags: { 'chal:lf.ch_bell': true } });
    await run({ pick: 1 });
    const a = Object.assign(st(), { asked: asked.slice(), meaning: said(B.meaning), chose: chose.length });
    fresh({ flags: { lf_bell_rung: true } });
    const prop = (C.maps['lf.bellhall'] && C.maps['lf.bellhall'].props || []).filter((p) => p.scene === 'lf.bell_touch' && (!p.if || S.test(s, p.if)));
    t.ok(a.asked.length === 0 && a.lessons === 0 && a.meaning && a.chose === 1 && !a.rung && prop.length === 0,
      '7 a save that read it before and chose Not yet: straight to the meaning and the choice; one with the bell rung has no bell to touch ' + flat({ a, prop: prop.length }));
  }

  // 8. the first-time path, read and rung, line for line as before
  {
    const got = {};
    for (const comp of ['nao', 'mio', 'ren', 'suzu', null]) {
      fresh({ comp });
      await run({ pick: 0 });
      got[String(comp)] = fp(lines);
    }
    t.ok(fp(got) === FIRST_FP, '8 the first-time path, read and rung, line for line as on the parent with each companion and none ' + flat({ fp: fp(got) }));
  }

  t.ok(!errors.length, 'no scene ended on an error from the runner ' + errors.slice(0, 3).join(' | '));
  console.error = cerr;
};
// computed on the parent (8717452): the first-time path's lines with each companion
const FIRST_FP = 'baed12b0a79be65e';
