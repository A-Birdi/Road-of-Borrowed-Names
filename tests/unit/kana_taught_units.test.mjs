// A two-character kana unit asked bare (no word around it) is not single, and in Foundations a taught unit is asked
// whole (RBN-QA-198; Agnes 6805563739 (a) and 6806661624; Local CL-775; Cloud CC-556). The yōon lessons teach きゃ, しゃ,
// キャ … as units and never ゃ ゅ ょ / ャ ュ ョ alone, so with only the first change Foundations cut every yōon unit
// down to its first kana (ゃ supplied, the unit only exposure), on every journey and for good. Now prepare() leaves a
// kana task alone when its one item is exactly k: and the whole answer and that unit is taught; nothing else changes.
// In node, the real task builder, with taught maps made by the lessons themselves (RB.lessons.run('kana'), the auto
// path, which marks each group's kana through groupChars):
//  1. every two-character unit the lessons teach (83), after every lesson, for Foundations with no script known and
//     with hiragana known: asked bare and prepared, the whole unit is the answer, the one accepted answer and the item,
//     not single, nothing supplied, no exposure-only credit, no copy; with both scripts known and outside Foundations
//     (controls): the same, and prepare leaves the step as it was;
//  2. the guard is no broader than that: a unit not yet taught with one of its kana known is cut down as before (the
//     known kana asked, the unit exposure); with none known, copied; a known whole unit whose small kana alone is not
//     taught is kept whole; a k: item that is not the whole answer (shorter, longer, another kana), an item list (one
//     or two items), no item, a reading step, a vocabulary item and a longer answer holding a taught unit: each
//     adapted exactly as before (the result compared with prepare's own adaptation of the same step);
//  3. the callers: the next task from an item pool of taught units and its fallback, a lamp's task (RB.lanterns
//     .stepFor), and the lessons' and exams' own bare tasks (not prepared: not single, the whole unit); prepare
//     changes nothing it is given, and preparing twice is preparing once; one-character kana, the cue and homophone
//     tasks stay single; a word task is as before; grading: the half unit and the full-size small kana are wrong, the
//     unit right.
// On screen (typing and the pad, the bare unit, Step away and the task again) is tests/e2e/kana_units.mjs.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const J = JSON.stringify, T = RB.tasks;
  // a journey whose taught map is made by the lessons: `lessons` of them (all by default), each as the game runs it
  const journey = async (o = {}) => {
    const s = RB.state.newCampaign({ edition: 2 });
    s.learn.profile = o.profile || 'F'; s.learn.kanaKnown = o.known || 'none';
    s.learn.taught = Object.assign({}, o.taught || {});
    RB.game.G.s = s; RB.game.s = s;
    // the test harness's auto mode, as the game's own test runs use it (src/engine/99_test.js): a lesson marks its kana
    RB.test.enable();
    try { for (let i = 0; i < (o.lessons == null ? 99 : o.lessons) && RB.lessons.nextGroup(s); i++) await RB.lessons.run('kana'); } finally { RB.test.disable(); }
    return s;
  };
  const units = [];
  for (const g of RB.lessons.groups()) for (const c of RB.lessons.groupChars(g)) if (c.ch.length === 2 && !units.includes(c.ch)) units.push(c.ch);
  const kata = units.filter((u) => RB.kana.isKata(u[0]));
  // a step asked whole: as kanaStep built it, unit and all
  const whole = (st, u) => st.answer === u && J(st.accept) === J([u]) && st.item === 'k:' + u && st.single === false && st.mode === 'kana' && !st.fullAnswer && !st.exposure && !st.copy && !st.template;

  // ---- 1. every unit, after every lesson
  t.eq([units.length, kata.length], [83, 50], '1 the lessons teach 83 two-character units (33 hiragana yōon, 33 katakana yōon, 17 extended katakana)');
  for (const [label, o] of [['Foundations, no script known', { known: 'none' }], ['Foundations, hiragana known', { known: 'hira' }],
    ['Foundations, both scripts known (control)', { known: 'both' }], ['outside Foundations (control)', { profile: 'E', known: 'none' }]]) {
    const s = await journey(o);
    const bad = [];
    for (const u of units) {
      const raw = T.kanaStep(u, { bare: true }), st = T.prepare(raw);
      if (!(whole(raw, u) && whole(st, u) && RB.learn.kanaKnown(u))) bad.push(u + ' ' + J({ a: st.answer, item: st.item, single: st.single, full: st.fullAnswer, exp: st.exposure, copy: st.copy }));
    }
    const taughtSmall = ['ゃ', 'ゅ', 'ょ', 'ャ', 'ュ', 'ョ'].filter((c) => s.learn.taught[c]);
    t.ok(!bad.length, '1 ' + label + ': all 83 units asked bare and prepared are asked whole, not single, credited to the unit ' + J({ bad: bad.slice(0, 3), taughtSmall }));
  }

  // ---- 2. no broader than that
  {
    // a step adapted as before: what prepare gives with the guard's condition made false only by the item (an item
    // list of the same one item is the same task for the adaptation, and the guard never applies to it)
    const asBefore = (st) => T.prepare(Object.assign({}, st, { item: [].concat(st.item == null ? [] : st.item) }));
    const strip = (st) => J(Object.assign({}, st, { item: undefined, exposure: undefined }));
    const cases = [];
    await journey({ known: 'none', lessons: 0, taught: { き: true } });
    const a = T.prepare(T.kanaStep('きゃ', { bare: true }));
    cases.push(['a unit not yet taught, one of its kana known: cut down as before (き asked, ゃ supplied, the unit exposure)',
      a.answer === 'き' && J(a.item) === J(['k:き']) && a.fullAnswer === 'きゃ' && J(a.exposure) === J(['k:きゃ']) && a.single === true, a]);
    await journey({ known: 'none', lessons: 0 });
    const b = T.prepare(T.kanaStep('きゃ', { bare: true }));
    cases.push(['a unit not yet taught, none of its kana known: copied, as before', b.copy === true && b.answer === 'きゃ', b]);
    await journey({ known: 'none', lessons: 0, taught: { きゃ: true } });
    const c = T.prepare(T.kanaStep('きゃ', { bare: true }));
    cases.push(['a known whole unit whose kana alone are not taught (not き, not ゃ): kept whole', whole(c, 'きゃ'), c]);
    await journey({ known: 'kata', lessons: 0, taught: { パ: true, ー: true, テ: true, ティ: true } });
    const d = T.prepare(T.kanaStep('ティ'));
    cases.push(['ティ taught whole, ィ alone not (kana_units\' old partial fixture): kept whole', whole(d, 'ティ'), d]);
    // every other shape, on a journey with every lesson done, against the adaptation as before
    await journey({ known: 'none' });
    const base = { kind: 'write', mode: 'kana', script: 'hira', prompt: { en: 'x' } };
    const shapes = [
      ['a k: item shorter than the answer (k:き for きゃ)', Object.assign({}, base, { answer: 'きゃ', accept: ['きゃ'], item: 'k:き' })],
      ['a k: item longer than the answer (k:きゃく for きゃ)', Object.assign({}, base, { answer: 'きゃ', accept: ['きゃ'], item: 'k:きゃく' })],
      ['a k: item of another unit (k:しゃ for きゃ)', Object.assign({}, base, { answer: 'きゃ', accept: ['きゃ'], item: 'k:しゃ' })],
      ['an item list of the unit alone', Object.assign({}, base, { answer: 'きゃ', accept: ['きゃ'], item: ['k:きゃ'] })],
      ['an item list of two', Object.assign({}, base, { answer: 'きゃ', accept: ['きゃ'], item: ['k:きゃ', 'k:き'] })],
      ['no item at all (the answer known, nothing else)', Object.assign({}, base, { answer: 'きゃ', accept: ['きゃ'] })],
      ['a longer answer holding a taught unit (きゃく, k:きゃく)', Object.assign({}, base, { answer: 'きゃく', accept: ['きゃく'], item: 'k:きゃく' })],
      ['a vocabulary item (きゃく, v:きゃく)', Object.assign({}, base, { answer: 'きゃく', accept: ['きゃく'], item: 'v:きゃく' })],
      ['a reading step (きゃ, k:きゃ, mode reading)', Object.assign({}, base, { mode: 'reading', answer: 'きゃ', accept: ['きゃ'], item: 'k:きゃ' })],
    ];
    for (const [what, st] of shapes) {
      const got = T.prepare(st);
      const before = st.mode === 'reading' || typeof st.item !== 'string' ? null : asBefore(st);
      // adapted (not asked whole), and the same adaptation as before (the item apart, which the guard never reads beyond)
      const adapted = got.fullAnswer || got.copy;
      cases.push([what + ': adapted as before', adapted && (!before || strip(got) === strip(before)), got]);
    }
    for (const [what, ok, st] of cases) t.ok(ok, '2 ' + what + ' ' + J({ a: st.answer, item: st.item, single: st.single, full: st.fullAnswer, exp: st.exposure, copy: st.copy }));
  }

  // ---- 3. the callers; prepare itself; the controls
  {
    const s = await journey({ known: 'none' });
    // the next task from a pool of taught units only (RB.tasks.next picks from the taught map's k: items)
    const seen = new Set();
    let bad = [];
    for (let i = 0; i < 400; i++) {
      const st = T.next({});
      const u = st.item && String(st.item).slice(2);
      if (typeof st.item === 'string' && u.length === 2 && units.includes(u)) { seen.add(u); if (!whole(st, u) && !(st.template && st.answer === u)) bad.push(u); }
    }
    t.ok(seen.size >= 20 && !bad.length, '3 the next task from the taught pool: each two-character unit asked whole (' + seen.size + ' seen) ' + J(bad.slice(0, 3)));
    // its fallback (a bare task for a taught kana): one unit, as the fallback builds it
    const fb = T.prepare(T.kanaStep('しゅ', { bare: true }));
    t.ok(whole(fb, 'しゅ'), '3 the fallback\'s bare task, prepared: しゅ asked whole');
    // a lamp's task
    // (a yōon unit has no word in Foundations, its small kana never taught alone; ファ has ソファ, every kana of it taught)
    const lamp = RB.lanterns.stepFor(s, 'k:キョ', 1), lamp2 = RB.lanterns.stepFor(s, 'k:しゃ', 2), lamp3 = RB.lanterns.stepFor(s, 'k:ファ', 2);
    t.ok(whole(lamp, 'キョ') && whole(lamp2, 'しゃ') && lamp3.template && lamp3.answer === 'ファ' && lamp3.item === 'k:ファ' && lamp3.single === false && !lamp3.fullAnswer,
      '3 a lamp\'s task (RB.lanterns.stepFor): キョ and しゃ asked whole; ファ in its word, whole, as before ' + J([lamp.answer, lamp.item, lamp2.answer, lamp3.word && lamp3.word.r]));
    // the lessons' practice and the exams build a bare task without prepare: not single, the unit whole
    t.ok(['きゃ', 'ジュ', 'ティ'].every((u) => whole(T.kanaStep(u, { bare: true }), u)), '3 a lesson\'s or exam\'s own bare task (not prepared): not single, the unit whole');
    // prepare changes nothing it is given; twice is once
    const raw = T.kanaStep('りょ', { bare: true }), copy = J(raw), once = T.prepare(raw), twice = T.prepare(once);
    t.ok(J(raw) === copy && J(once) === J(twice), '3 prepare changes nothing it is given, and preparing twice is preparing once');
    // one-character kana, the cue and homophone tasks: single, as before
    const one = ['き', 'ア', 'ん'].map((c) => T.prepare(T.kanaStep(c, { bare: true })));
    const cue = T.prepare(T.kanaStep('っ')), hom = T.prepare(T.kanaStep('ぢ'));
    t.ok(one.every((x) => x.single === true) && cue.single === true && hom.single === true, '3 one-character kana, the small tsu cue and a homophone task: single, as before ' + J([cue.prompt.en, hom.prompt.en]));
    // a word task: as before (every kana of the word known, the unit whole in it)
    await journey({ known: 'both', profile: 'F' });
    const w = T.prepare(T.kanaStep('ティ'));
    t.ok(w.template && w.answer === 'ティ' && w.template.before + 'ティ' + w.template.after === w.word.r && w.single === false, '3 a word task, as before: ティ whole in ' + (w.word && w.word.r));
    // grading the unit: the half unit and the full-size small kana wrong, the unit right
    const chk = (got, want) => RB.answers.check(got, { answer: want, accept: [want], mode: 'kana', input: 'ime', single: false });
    t.ok(!chk('き', 'きゃ').ok && !chk('きや', 'きゃ').ok && chk('きゃ', 'きゃ').ok && !chk('テ', 'ティ').ok && !chk('テイ', 'ティ').ok && chk('ティ', 'ティ').ok,
      '3 grading: き and きや wrong for きゃ, テ and テイ wrong for ティ; the units right');
  }
};
