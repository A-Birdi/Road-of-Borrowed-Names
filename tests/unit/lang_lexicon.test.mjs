// RB.lex: API, integrity, merge/conflict behaviour, furigana in notes.
import { load } from '../lib/load.mjs';

const RB = load(['core', 'lang']);
const X = RB.lex;

export default async (t) => {
  const st = X.stats();
  t.log('lexicon', JSON.stringify(st.byLevel), 'total', st.total);
  t.ok(st.total >= 700, 'at least 700 core entries');
  t.eq(X.conflicts(), [], 'no conflicting duplicates in core');
  t.eq(X.problems(), [], 'no malformed core entries');
  for (const lv of ['F', 'E', 'I', 'A']) t.ok(st.byLevel[lv] > 50, 'level ' + lv + ' populated');

  // every entry well formed; meanings/notes need furigana for any kanji
  let bad = [];
  for (const e of X.all()) {
    if (X.problemsOf(e).length) bad.push(e.w + ': ' + X.problemsOf(e).join(','));
    if (!RB.kana.isKanaString(e.r)) bad.push(e.w + ': reading not kana');
    for (const s of [e.m, e.n].concat(e.alt || [])) if (s && RB.jp.validateMixed(s).length) bad.push(e.w + ': unrubied kanji in ' + s);
    if (!RB.kana.hasKanji(e.w) && RB.kana.toHira(e.w) !== RB.kana.toHira(e.r)) bad.push(e.w + ': kana word with a different reading');
    if (RB.jp.validate(X.markup(e)).length) bad.push(e.w + ': headword markup invalid');
  }
  t.eq(bad, [], 'all entries valid');

  // fictional terms are labelled
  const fic = X.all().filter((e) => e.fic);
  t.ok(fic.length >= 1 && fic.every((e) => /fictional/i.test(e.m) && /fictional/i.test(e.n || '')), 'fictional terms labelled');
  t.ok(!X.bySurface('円').length, 'no real currency 円');

  // required coverage
  const need = ['は', 'が', 'を', 'に', 'で', 'へ', 'と', 'も', 'の', 'から', 'まで', 'や', 'か', 'よ', 'ね', 'よね', 'な', 'ぞ', 'わ', 'って', 'けど', 'し',
    'では', 'には', 'へは', 'とは', 'でも', 'です', 'だ', 'でした', 'だった', 'これ', 'それ', 'あれ', 'どれ', 'ここ', 'そこ', 'あそこ', 'どこ',
    '約束', '忘れる', '覚える', '記録', '記憶', '名前', '灯り', '守る', '壊す', '直す', '届ける', '預かる', '謝る', '許す', '嘘', '本当', '曖昧',
    '遠慮', '気配', '仕方ない', '相変わらず', 'せっかく', 'わざわざ', 'どうせ', 'さすが', 'むしろ', 'かえって', 'いっそ', 'わけではない',
    'ざるを得ない', 'かねない', 'に過ぎない', 'だから', 'それで', 'そして', 'しかし', 'ところが', 'つまり', 'ただし', '橋', '葦', '港', '潮',
    'ガラス', '果樹園', '窯', '鐘', 'ランタン', '道', '星', 'お茶', 'カップ', '靴', '道具', '瓶', 'ラベル', '手紙', 'ドア', '窓', '行く', '来る', 'する'];
  const miss = need.filter((w) => !X.bySurface(w).length);
  t.eq(miss, [], 'required words present');
  const pos = new Set(X.all().map((e) => e.pos));
  for (const p of ['v1', 'v5u', 'v5k', 'v5g', 'v5s', 'v5t', 'v5n', 'v5b', 'v5m', 'v5r', 'v5k-s', 'vs', 'vs-i', 'vk', 'adj-i', 'adj-ii', 'adj-na', 'adv', 'prt', 'conj', 'ctr'])
    t.ok(pos.has(p), 'has pos ' + p);

  // API: get / bySurface / byReading
  t.eq(X.get('食べる', 'たべる').m, 'to eat', 'get');
  t.eq(X.get('何', 'なん').r, 'なん', 'get by reading variant');
  t.ok(X.byReading('はし').length >= 3, 'byReading homophones');
  t.ok(X.byReading('らんぷ').some((e) => e.w === 'ランプ'), 'byReading folds katakana');

  // add: merge identical, record conflicts (in a fresh context)
  const R2 = load(['core', 'lang']);
  const n = R2.lex.add([{ w: '橋', r: 'はし', m: 'bridge (over a river)', pos: 'n', lv: 'F' }], 'test');
  t.eq(n, 0, 'identical w+r merges instead of adding');
  t.ok(R2.lex.get('橋', 'はし').alt.includes('bridge (over a river)') && R2.lex.get('橋', 'はし').src.includes('test'), 'merge keeps new meaning as alt + source');
  R2.lex.add([{ w: '橋', r: 'はし', m: 'to bridge', pos: 'v5r', lv: 'I' }], 'test2');
  t.eq(R2.lex.conflicts().length, 1, 'conflicting pos recorded');
  t.eq(R2.lex.get('橋', 'はし').pos, 'n', 'existing entry kept on conflict');
  t.eq(R2.lex.add([{ w: 'ナオ', m: 'Nao (a name)', pos: 'name', lv: 'F' }], 'content'), 1, 'kana word without r gets r = w');
  t.eq(R2.lex.get('ナオ', 'ナオ').r, 'ナオ', 'r defaulted');
  R2.lex.add([{ w: '謎', m: 'x', pos: 'n', lv: 'E' }], 'bad');
  t.ok(R2.lex.problems().length === 1, 'kanji word without reading reported');
};
