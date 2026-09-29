// RB.answers and kanji: a word's kanji spelling is accepted with a note on how
// it was written ("水 (みず) — written in kanji"), handwritten one-shape
// characters (ロ/口, へ/ヘ…) count as one only for handwriting, kanji in a
// kana answer get a specific explanation, and every note is valid mixed text
// (each kanji in ruby). Also checks the game's write steps: every listed
// kanji spelling is accepted, and a step's own kanji spelling is listed.
import { load } from '../lib/load.mjs';

const RB = load(['core', 'lang', 'recog']);
const A = RB.answers;
const check = (inp, task) => A.check(inp, task);
const codes = (inp, task) => check(inp, task).feedback.map((f) => f.code);
const mixedOk = (s) => RB.jp.validateMixed(s).length === 0 && !/[一-鿿]/.test(s.replace(/\{[^|}]+\|[^}]+\}/g, ''));

export default async (t) => {
  // ---- the kanji spelling of the word is accepted, with a note
  const mizu = { accept: ['みず', '水'], mode: 'kana' }; // src/content/ch5/30_learning.js drill 07
  const r1 = check('水', mizu);
  t.ok(r1.ok && r1.form === '水', 'kana task accepts the listed kanji spelling 水');
  t.eq(r1.notes.map((n) => n.en), ['{水|みず} (みず) — written in kanji.'], 'note: 水 (みず) — written in kanji');
  t.ok(check('みず', mizu).ok && !check('みず', mizu).notes.length, 'kana answer: accepted, no note');
  const r2 = check('出ません', { accept: ['でません', '出ません'], mode: 'kana' });
  t.eq(r2.notes.map((n) => n.en), ['{出|で}ません (でません) — written with kanji.'], 'mixed kanji/kana spelling: written with kanji, okurigana in ruby');
  const r3 = check('鍵', { accept: ['{鍵|かぎ}'], mode: 'reading' });
  t.ok(r3.ok && r3.notes[0].jp === '{鍵|かぎ}', 'reading from the accepted markup');
  const r4 = check('船', { accept: ['ふね', '舟', '船'], mode: 'kana' });
  t.ok(r4.ok && /\{船\|ふね\}/.test(r4.notes[0].en), 'second kanji spelling: reading from the kana answer');
  t.ok(check('三十本', { accept: ['さんじゅっぽん', 'さんじっぽん', '三十本', '30本'], mode: 'reading' }).ok, 'counter written in kanji accepted');

  // ---- one shape, two characters: folded for handwriting only
  const iri = { accept: ['いりぐち', '入り口'], mode: 'reading' };
  const h1 = check('入りロ', Object.assign({ handwritten: true }, iri));
  t.ok(h1.ok && h1.form === '入り口', 'handwritten 入りロ counts as 入り口');
  t.ok(h1.notes.some((n) => n.code === 'same_shape' && n.got === 'ロ' && n.want === '口'), 'same_shape note names ロ and 口');
  t.ok(!check('入りロ', iri).ok, 'typed 入りロ is not folded');
  t.eq(codes('入りロ', iri), ['wrong_char'], 'typed 入りロ: wrong character explained');
  t.ok(check('ロ', { accept: ['くち', '口'], mode: 'kana', handwritten: true }).ok, 'handwritten ロ for 口 (くち)');
  t.ok(check('ニ回', { accept: ['にかい', '二回', '2回'], mode: 'kana', handwritten: true }).ok, 'handwritten ニ回 for 二回');
  t.ok(check('ー本', { accept: ['いっぽん', '一本'], mode: 'reading', handwritten: true }).ok, 'handwritten ー本 for 一本');
  t.ok(check('力', { accept: ['カ'], mode: 'kana', handwritten: true }).ok, 'handwritten 力 for カ');
  t.ok(check('ヘや', { accept: ['へや'], mode: 'kana', handwritten: true }).ok, 'handwritten ヘ for へ (identical in handwriting)');
  t.ok(!check('ヘや', { accept: ['へや'], mode: 'kana' }).ok, 'typed ヘや is still a script mistake');
  t.ok(!check('ろ', { accept: ['くち', '口'], mode: 'kana', handwritten: true }).ok, 'handwriting folds only one-shape pairs (ろ is not 口)');
  t.ok(!check('ぺ', { accept: ['べ'], mode: 'kana', handwritten: true }).ok, 'handwriting keeps the べ/ぺ contrast');
  // the one-shape groups are exactly the recognizer's
  const recogGroups = RB.recog._internal.SAME_SHAPE.map((g) => g.join('')).sort();
  t.eq(A.HAND_SAME.slice().sort(), recogGroups, 'RB.answers one-shape groups match RB.recog identical shapes');

  // ---- kanji in a wrong answer
  t.eq(codes('田', { accept: ['た'], mode: 'kana' }), ['needs_kana'], '田 for the kana blank た: right reading, written in kana here');
  t.ok(/\{田\|た\}/.test(check('田', { accept: ['た'], mode: 'kana' }).feedback[0].en), '...naming {田|た} with its reading');
  t.eq(codes('日', { accept: ['ひ', '火'], mode: 'reading' }), ['other_word'], '日 for 火 (both ひ): a different word');
  t.eq(codes('食べる', { accept: ['{食|た}べる'], mode: 'kana' }), ['needs_kana'], 'kana task, accepted kanji spelling of the answer: needs kana (unchanged)');
  const wc = check('木', { accept: ['みず'], mode: 'kana' }).feedback;
  t.ok(wc.length && wc.every((f) => !/\(木\)|\(水\)/.test(f.en)), 'no "romaji" of a kanji: ' + wc.map((f) => f.en).join(' | '));

  // ---- every message is valid mixed text: kanji only inside ruby
  const all = [r1, r2, r3, r4, h1, check('ロ', { accept: ['くち', '口'], mode: 'kana', handwritten: true }), check('ー本', { accept: ['いっぽん', '一本'], mode: 'reading', handwritten: true })]
    .flatMap((r) => (r.notes || []).map((n) => n.en))
    .concat(['田', '日', '木', '山'].flatMap((k) => check(k, { accept: ['た', 'ひ', '火'], mode: 'reading' }).feedback.map((f) => f.en)))
    .concat(check('入りロ', iri).feedback.map((f) => f.en));
  const badText = all.filter((s) => !mixedOk(s));
  t.eq(badText, [], 'feedback and notes keep every kanji in ruby (' + all.length + ' messages)');

  // ---- readings for the kanji the pad knows; the player's own text in ruby
  // every kanji the pad can read (all the game displays) has a reading; 々, the
  // repeat mark, has none of its own: it takes the reading of the kanji before it
  const K33 = R => R.supported({ kanji: true }).filter((c) => RB.kana.isKanji(c) && c !== '々');
  const noRead = K33(RB.recog).filter((c) => !A.kanjiReading(c) || !RB.kana.isKanaString(A.kanjiReading(c)));
  t.eq(noRead, [], `every kanji the pad can read has a kana reading for furigana (${K33(RB.recog).length} kanji)`);
  t.ok(A.kanjiReading('守') === 'まも', "守: the reading the game's words use most (まも, as in 守る): " + A.kanjiReading('守'));
  t.eq(A.rubyText('み水'), 'み{水|みず}', "rubyText puts each kanji's reading in ruby");
  t.ok(mixedOk(A.rubyText(K33(RB.recog).join(''))), 'rubyText of every kanji the pad can read is valid mixed text');
  t.eq(A.rubyText('人々'), '{人|ひと}{々|ひと}', 'rubyText: 々 takes the reading of the kanji before it');
  t.ok(mixedOk(A.rubyText('人々')), 'rubyText of 人々 is valid mixed text');

  // ---- the game's write steps
  globalThis.__RB_TEST__ = true;
  const G = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = G.content;
  const steps = [];
  const add = (s, where) => { if (!s) return; if (Array.isArray(s)) { s.forEach((x, i) => add(x, where + '[' + i + ']')); return; } if (s.kind) steps.push([s, where]); else for (const k of ['F', 'E', 'I', 'A']) if (s[k]) add(s[k], where + '.' + k); };
  for (const id in C.challenges) { const ch = C.challenges[id]; if (ch.tiers) for (const k in ch.tiers) add(ch.tiers[k], id + '.' + k); else add(ch.steps, id); }
  (C.drills || []).forEach((d) => add(d, 'drill ' + d.id));
  for (const id in C.enemies) for (const k in C.enemies[id].intents || {}) { const it = C.enemies[id].intents[k]; add(it.answer, id + ' ' + k); add(it.truth, id + ' ' + k); }
  for (const id in C.activities) if (C.activities[id].question) add(C.activities[id].question, 'activity ' + id);
  const writes = steps.filter(([s]) => s.kind === 'write');
  const K = G.kana, J = G.jp;
  const missing = [], rejected = [], badNotes = [];
  let kanjiForms = 0, handForms = 0;
  const handable = new Set(K33(G.recog).concat(['ー']));
  for (const [s, where] of writes) {
    const accept = (s.accept && s.accept.length ? s.accept : [s.answer]).map(String);
    const task = { accept, mode: s.mode || 'kana', scriptFree: !!s.scriptFree };
    const plains = accept.map((a) => J.plain(a));
    // a step's explained kanji spelling of the same word is accepted (not for kana practice)
    const kanaPractice = [].concat(s.item || []).some((i) => String(i).startsWith('k:'));
    const ex = s.explain && s.explain.jp ? J.plain(s.explain.jp) : '';
    if (!kanaPractice && K.hasKanji(ex) && J.reading(s.explain.jp).replace(/\s/g, '') === J.reading(s.answer).replace(/\s/g, '') && !plains.includes(ex)) missing.push(where + ' ' + ex);
    for (const p of plains) {
      if (!K.hasKanji(p)) continue;
      kanjiForms++;
      const r = G.answers.check(p, task);
      if (!r.ok) rejected.push(where + ' ' + p);
      (r.notes || []).forEach((n) => { if (!mixedOk(n.en)) badNotes.push(where + ': ' + n.en); });
      // spellings the pad can write: also accepted as handwriting
      if (Array.from(p).every((c) => !K.isKanji(c) || handable.has(c))) {
        handForms++;
        if (!G.answers.check(p, Object.assign({ handwritten: true }, task)).ok) rejected.push(where + ' (hand) ' + p);
      }
    }
  }
  // combat inscriptions (src/ui/80_combat.js stepFor: accept [w.r, plain(w.jpK || w.jp)], mode 'reading')
  const insc = [];
  for (const id in C.words) {
    const w = C.words[id];
    const task = { accept: [w.r, J.plain(w.jpK || w.jp)], mode: 'reading' };
    const k = J.plain(w.jpK || w.jp);
    if (!K.hasKanji(k)) continue;
    const r = G.answers.check(k, task), rh = G.answers.check(k, Object.assign({ handwritten: true }, task));
    if (!r.ok || !rh.ok || !(r.notes || []).some((n) => n.code === 'kanji' && mixedOk(n.en))) insc.push(id + ' ' + k);
  }
  t.eq(insc, [], 'combat inscriptions accept their kanji spelling, with a valid "written with kanji" note');
  t.log(`write steps: ${writes.length}; kanji spellings listed ${kanjiForms}, of which writable with the pad's 33 kanji ${handForms}`);
  t.eq(missing, [], "a step's explained kanji spelling of the answer word is in its accept list");
  t.eq(rejected, [], 'every listed kanji spelling is accepted (typed and handwritten)');
  t.eq(badNotes, [], 'every acceptance note is valid mixed text');
  t.ok(writes.length > 150 && handForms >= 10, 'the survey covered the game');
};
