// RB.answers: modes, normalisation that preserves meaningful contrasts,
// feedback codes for each error type, distractor safety.
import { load } from '../lib/load.mjs';

const RB = load(['core', 'lang']);
const A = RB.answers;
const codes = (inp, task) => A.check(inp, task).feedback.map((f) => f.code);
const ok = (inp, task) => A.check(inp, task).ok;

export default async (t) => {
  // ---- modes
  const kagi = { accept: ['{鍵|かぎ}'], mode: 'reading' };
  t.ok(ok('かぎ', kagi), 'reading mode accepts hiragana reading');
  t.ok(ok('鍵', kagi), 'reading mode accepts surface');
  t.ok(!ok('カギ', kagi), 'reading mode rejects katakana unless scriptFree');
  t.ok(ok('カギ', Object.assign({ scriptFree: true }, kagi)), 'scriptFree accepts katakana reading');
  t.ok(ok('たべる', { accept: ['{食|た}べる'], mode: 'kana' }), 'kana mode');
  t.ok(!ok('食べる', { accept: ['{食|た}べる'], mode: 'kana' }), 'kana mode needs kana');
  t.eq(codes('食べる', { accept: ['{食|た}べる'], mode: 'kana' }), ['needs_kana'], 'needs_kana feedback');
  t.ok(ok('食べる', { accept: ['{食|た}べる'], mode: 'exact' }), 'exact mode');
  t.eq(codes('たべる', { accept: ['{食|た}べる'], mode: 'exact' }), ['reading_only'], 'exact mode: reading-only feedback');
  t.ok(ok(' み ず ', { accept: ['{水|みず}'], mode: 'kana' }), 'spaces removed');
  t.ok(ok('ﾗﾝﾌﾟ', { accept: ['ランプ'], mode: 'kana' }), 'half-width katakana normalised');
  t.ok(ok('かき\u3099', kagi), 'NFC composes combining dakuten');
  t.ok(ok('みずをください。', { accept: ['{水|みず}を ください'], mode: 'reading' }), 'sentence punctuation ignored');
  t.ok(ok('ナオ', { accept: ['$comp'], mode: 'kana', vars: { comp: 'ナオ' } }), 'vars in accept');
  const r = A.check('かぎ', kagi);
  t.eq([r.matched, r.normalized, r.assisted], ['{鍵|かぎ}', 'かぎ', false], 'result shape');

  // ---- contrasts are never folded
  t.ok(!ok('かき', kagi), 'dakuten not folded');
  t.ok(!ok('きつて', { accept: ['きって'], mode: 'kana' }), 'small/large not folded');
  t.ok(!ok('おばさん', { accept: ['おばあさん'], mode: 'kana' }), 'long vowel not folded');
  t.ok(!ok('わたしわ', { accept: ['わたしは'], mode: 'kana' }), 'は/わ not folded');
  t.ok(!ok('らんぷ', { accept: ['ランプ'], mode: 'kana' }), 'script not folded');

  // ---- meaning mode
  const m = { accept: ['to eat', 'eat'], mode: 'meaning' };
  t.ok(ok('  To Eat. ', m), 'meaning: case, punctuation, to');
  t.ok(ok('ＥＡＴ', m), 'meaning: full-width ASCII');
  t.ok(ok('the bridge', { accept: ['bridge'], mode: 'meaning' }), 'meaning: article dropped');
  t.eq(codes('bridgee', { accept: ['bridge'], mode: 'meaning' }), ['spelling'], 'meaning: near spelling');
  t.eq(codes('river', { accept: ['bridge'], mode: 'meaning' }), ['generic'], 'meaning: wrong');

  // ---- feedback codes
  const K1 = (inp, acc, mode) => codes(inp, { accept: [acc], mode: mode || 'kana' });
  t.ok(K1('かき', 'かぎ').includes('missing_dakuten'), 'missing_dakuten');
  t.ok(K1('かぎ', 'かき').includes('extra_dakuten'), 'extra_dakuten');
  t.ok(K1('ばん', 'ぱん').includes('handakuten_mixup'), 'handakuten_mixup ば/ぱ');
  t.ok(K1('はん', 'ぱん').includes('handakuten_mixup'), 'handakuten_mixup は/ぱ');
  t.ok(K1('きつて', 'きって').includes('small_large'), 'small_large っ/つ');
  t.ok(K1('きやく', 'きゃく').includes('small_large'), 'small_large ゃ/や');
  t.ok(K1('おばさん', 'おばあさん').includes('long_vowel'), 'long_vowel missing');
  t.ok(K1('せんせ', 'せんせい').includes('long_vowel'), 'long_vowel えい');
  t.ok(K1('コヒー', 'コーヒー').includes('long_vowel'), 'long_vowel ー missing');
  t.ok(K1('コオヒイ', 'コーヒー').includes('long_vowel'), 'long_vowel written with vowel kana instead of ー');
  t.ok(K1('とおりい', 'とおり').includes('long_vowel') || K1('とおりい', 'とおり').includes('extra_char'), 'extra long vowel');
  t.eq(K1('らんぷ', 'ランプ'), ['script'], 'script (whole word)');
  t.ok(K1('ランぷ', 'ランプ').includes('script'), 'script (one character)');
  t.ok(codes('わたしわ', { accept: ['{私|わたし}は'], mode: 'reading' }).includes('particle_wa'), 'particle_wa');
  t.ok(codes('みずお', { accept: ['{水|みず}を'], mode: 'reading' }).includes('particle_o'), 'particle_o');
  t.ok(codes('やまえ', { accept: ['{山|やま}へ'], mode: 'reading' }).includes('particle_e'), 'particle_e');
  const pw = A.check('わたしわ', { accept: ['{私|わたし}は'], mode: 'reading' }).feedback.find((f) => f.code === 'particle_wa');
  t.ok(/topic particle/.test(pw.en), 'particle message explains the particle');
  t.ok(K1('シャシ', 'シャツ').includes('confusable'), 'confusable シ/ツ');
  t.ok(K1('ソソ', 'ソン').includes('confusable'), 'confusable ソ/ン');
  t.ok(K1('めこ', 'ぬこ').includes('confusable'), 'confusable ぬ/め');
  t.ok(K1('さかな', 'ちかな').includes('confusable'), 'confusable さ/ち');
  t.ok(K1('ろく', 'るく').includes('confusable'), 'confusable る/ろ');
  t.ok(K1('コ', 'ユ').includes('confusable'), 'confusable コ/ユ');
  t.ok(K1('きて', 'きって').includes('missing_char'), 'missing_char (small っ)');
  const mc = A.check('きて', { accept: ['きって'], mode: 'kana' }).feedback.find((f) => f.code === 'missing_char');
  t.ok(/between き and て/.test(mc.en), 'missing position described by neighbours');
  t.ok(K1('さかなな', 'さかな').includes('extra_char'), 'extra_char');
  t.ok(K1('かさ', 'さか').includes('swapped'), 'swapped');
  t.ok(K1('ねこ', 'いぬ').includes('other_word'), 'other_word');
  const ow = A.check('はし', { accept: ['{箸|はし}ばこ'], mode: 'reading' }).feedback.find((f) => f.code === 'other_word');
  t.ok(ow && RB.jp.validateMixed(ow.en).length === 0, 'other_word message has furigana for kanji');
  t.ok(K1('あいうえおかきく', 'ぬ').includes('generic'), 'generic for unrelated input');
  t.eq(K1('', 'ぬ'), ['empty'], 'empty input');
  // feedback never blames recognition
  const all = [];
  for (const [i, a] of [['かき', 'かぎ'], ['シャシ', 'シャツ'], ['きて', 'きって'], ['らんぷ', 'ランプ'], ['ねこ', 'いぬ']])
    all.push(...A.check(i, { accept: [a], mode: 'kana' }).feedback.map((f) => f.en));
  t.ok(all.every((s) => !/recogni|handwriting|drawing|drew/i.test(s)), 'feedback is about language, not recognition');

  // ---- distractors
  const answers = ['か', 'シ', 'ぬ', 'きゃ', 'っ', 'ぱ', 'ね', 'ソ', '{切手|きって}', '{鍵|かぎ}', 'コーヒー', '{学校|がっこう}', '{先生|せんせい}',
    'ランタン', '{水|みず}を', 'おばあさん', 'しゃしん', 'ガラス', '{約束|やくそく}'];
  let bad = [];
  for (const ans of answers) {
    const kind = RB.kana.isKanaString(RB.jp.reading(ans)) && Array.from(RB.jp.reading(ans)).length <= 2 ? 'kana' : 'word';
    const accept = [ans];
    const ds = A.distractors(ans, { count: 4, kind, accept });
    if (ds.length < 1) bad.push(ans + ': no distractors');
    for (const d of ds) {
      if (A.check(d, { accept, mode: 'reading' }).ok) bad.push(ans + ': distractor ' + d + ' is accepted');
      if (A.check(d, { accept, mode: 'kana' }).ok) bad.push(ans + ': distractor ' + d + ' is accepted (kana)');
    }
    if (new Set(ds).size !== ds.length) bad.push(ans + ': duplicate distractors');
  }
  t.eq(bad, [], 'distractors never include an accepted answer');
  // multiple accepted answers are all excluded
  const ds2 = A.distractors('はし', { count: 10, kind: 'word', accept: ['はし', 'ばし', 'はじ'] });
  t.ok(!ds2.includes('ばし') && !ds2.includes('はじ'), 'all accepted answers excluded');
  t.ok(A.distractors('かぎ', { count: 5, kind: 'word' }).includes('かき'), 'diacritic removal distractor');
  t.ok(A.distractors('きって', { count: 8, kind: 'word' }).some((d) => d === 'きつて' || d === 'きて'), 'small っ distractor');
  t.eq(A.distractors('シ', { count: 4, kind: 'kana', seed: 7 }), A.distractors('シ', { count: 4, kind: 'kana', seed: 7 }), 'deterministic with seed');
  const sd = A.distractors('らんぷ', { count: 10, kind: 'word', accept: ['らんぷ'], scriptFree: true });
  t.ok(!sd.includes('ランプ'), 'scriptFree: script swap of the answer is not offered');
  t.ok(A.distractors('シ', { count: 3, kind: 'kana' }).includes('ツ'), 'shape confusable offered');
};
