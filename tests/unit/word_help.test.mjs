// Word help (RB.jp.lookup) on kana the language review found mis-glossed (P17): a name written in katakana no longer
// captures the same sound written as a word in hiragana; an author's `word@lemma` hint names the word outright (a name
// included); the auxiliary かねる conjugates; a kana-only entry does not take every ひ; the interjection いや, かも
// and いけない have their own entries.
import { load } from '../lib/load.mjs';

globalThis.__RB_TEST__ = true;
const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
const word = (s) => { const t = RB.jp.parse(s).filter((x) => !x.punct)[0]; const r = RB.jp.lookup(t); return r.entry ? r.entry.w + ':' + r.entry.pos : r.parts ? r.parts.map((p) => p.entry && p.entry.w).join('+') : '?'; };

export default async (t) => {
  t.eq(['とき', 'とも', 'かね', 'あかり', 'わたる'].map(word), ['時:n', '友:n', '鐘:n', '明かり:n', '渡る:v5r'], 'hiragana words are words, not the katakana names that sound the same');
  t.eq(['トキ', 'トモ', 'カネ'].map(word), ['トキ:name', 'トモ:name', 'カネ:name'], 'the names, written as names, are still names');
  t.eq(word('まめ@マメ'), 'マメ:name', 'a hint that names a person is the person (a child writing her own name)');
  t.eq([word('かめ@甕'), word('せん@栓'), word('つる@鶴'), word('ひ@杼')], ['甕:n', '栓:n', '鶴:n', '杼:n'], 'a hint picks among same-sounding words');
  t.eq(word('かねます'), 'かねる:v1', '〜かねます is かねる, politely: cannot (not the bell)');
  t.eq(word('ひ'), '火:n', 'a bare ひ is no longer the weaving shuttle');
  t.eq([word('いや'), word('いや@嫌'), word('かも'), word('いけない')], ['いや:int', '嫌:adj-na', 'かも:exp', 'いけない:adj-i'], 'いや the interjection (and 嫌 when marked), かも, いけない');
  t.eq([word('たまや'), word('あったかい'), word('しかめてる'), word('よみおわった')], ['たまや:int', 'あったかい:adj-i', 'しかめる:v1', '読み終わる:v5r'], 'words the review found split into nonsense');
};
