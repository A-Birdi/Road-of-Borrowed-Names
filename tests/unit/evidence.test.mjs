// The evidence log (expansion L1, L2, L6, L20; src/learn/40_evidence.js): how an answer was given, where, with what
// help, first try or not; independent successes per mode; transfer to a new kind of place; kanji met in words with
// their readings; chart practice; and spacing that notices days. The scheduler's own record is unchanged.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const s = RB.state.newCampaign({ profile: 'E' });
  RB.game.s = s;
  const V = RB.evidence;
  // modes
  t.eq(V.modeOf({ kind: 'order' }, 'order'), 'construct', 'ordering is construction, not recognition');
  t.eq(V.modeOf({ kind: 'write' }, 'hand'), 'hand', 'handwriting');
  t.eq(V.modeOf({ kind: 'write' }, 'ime'), 'typed', 'typing');
  t.eq(V.modeOf({ kind: 'write' }, 'choice'), 'recog', 'a write step answered by choosing is recognition');
  t.eq(V.modeOf({ kind: 'choose', ctx: { jp: '{今日|きょう} は {雨|あめ} が {降|ふ}って いる ので 、 {傘|かさ} を {持|も}って {行|い}きます 。' } }, 'choice'), 'context', 'understanding a passage');
  t.eq(V.modeOf({ kind: 'forge' }, 'ime'), 'typed', 'a forged sentence, typed');
  // a record
  const rec = (id, r) => RB.learn.record(id, Object.assign({ ok: true, mode: 'choice', assisted: false }, r));
  rec('v:水', { ctx: 'battle:x', ev: 'recog' });
  let it = s.learn.items['v:水'];
  t.ok(it.log.length === 1 && it.log[0].m === 'recog' && it.log[0].c === 'battle' && it.log[0].f === 1, 'logged: mode, where, first try');
  t.ok(it.ev.recog === 1 && !it.ev.transfer && it.okIn[0] === 'battle', 'an independent success, its place noted');
  rec('v:水', { ctx: 'battle:y', ev: 'recog' });
  t.ok(!it.ev.transfer, 'the same kind of place again is not transfer');
  rec('v:水', { ctx: 'rw.lantern_s', ev: 'typed', mode: 'ime' });
  t.ok(it.ev.transfer === 1 && it.ev.typed === 1, 'success in a new kind of place is transfer');
  rec('v:水', { ctx: 'atlas', ev: 'hand', mode: 'hand', help: 'constrain', assisted: true });
  t.ok(!it.ev.hand && it.evTry.hand === 1 && it.log[it.log.length - 1].h === 'constrain', 'helped: logged with its help, not counted as independent');
  rec('v:水', { ctx: 'atlas', ev: 'hand', mode: 'hand', exposed: true });
  t.ok(!it.ev.hand && it.log[it.log.length - 1].x === 1, 'copying a shown model is exposure, not independent handwriting');
  rec('v:水', { ctx: 'atlas', ev: 'hand', mode: 'hand', ok: false, repairs: 2 });
  const last = it.log[it.log.length - 1];
  t.ok(last.f === 0 && last.r === 2 && !it.ev.hand, 'a wrong first answer is logged as such; recognition repairs are input data');
  for (let i = 0; i < 20; i++) rec('v:水', { ctx: 'practice', ev: 'recog' });
  t.eq(it.log.length, V.LOG, 'the log keeps the last ' + V.LOG + ' attempts');
  t.ok(it.seen === 26 && it.box >= 1, 'the scheduler\'s record is kept as before (' + it.seen + ' seen)');
  // kanji: met in words, with the word's reading; written only when written
  const K = s.learn.kanji['水'];
  t.ok(K && K.met >= 26 && Object.keys(K.words).some((w) => /^水（みず）$/.test(w)), 'kanji: met in 水 (みず): ' + JSON.stringify(K && K.words));
  t.ok(!Object.keys(K.words).some((w) => w.includes('すい')), 'meeting 水 in みず certifies nothing about すい');
  rec('v:水', { ctx: 'story', ev: 'hand', mode: 'hand', written: '水' });
  t.ok(K.hand === 1 && K.handOk === 1, 'handwriting 水 is recorded on the kanji');
  rec('v:水', { ctx: 'story', ev: 'hand', mode: 'hand', written: 'みず' });
  t.ok(K.hand === 1, 'writing it in kana is not writing the kanji');
  // chart practice
  RB.evidence.chartPractice(s, '水', { traced: true });
  RB.evidence.chartPractice(s, '水', { ok: true });
  t.ok(K.practice.traced === 1 && K.practice.memory === 1 && K.practice.memoryOk === 1, 'the chart\'s practice square: traced vs from memory');
  // a page's profile: denominators, limited evidence
  const pf = RB.evidence.profile(s, 'v:水');
  t.ok(pf.modes.hand.tries >= 3 && pf.modes.typed.independent === 1 && pf.contexts.length >= 3 && typeof pf.recogRecent.of === 'number', 'profile with denominators');
  rec('v:火', { ev: 'recog' });
  t.ok(RB.evidence.profile(s, 'v:火').limited, 'one attempt is "limited evidence"');
  // L6: days
  const today = Math.floor(Date.now() / 86400000);
  const a = RB.learn.rec('v:days_a'), b = RB.learn.rec('v:days_b');
  for (const r of [a, b]) { r.box = 4; r.seen = 5; r.due = RB.learn.clock() + 50; r.last = -99; r.lastOk = -99; r.cool = 0; }
  a.lastDay = today - 30; b.lastDay = today;
  let first = 0;
  for (let i = 0; i < 40; i++) if (RB.learn.pick(['v:days_a', 'v:days_b'], 1, { ignoreCooldown: true })[0] === 'v:days_a') first++;
  t.ok(first >= 36, 'an item last met a month ago comes before one met today (' + first + '/40)');
  t.ok(!JSON.stringify(s.learn).includes('overdue'), 'nothing records an overdue count');
};
