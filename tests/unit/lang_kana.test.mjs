// RB.kana: character classes, conversions, diacritics, small kana, romaji, mora.
import { load } from '../lib/load.mjs';

const RB = load(['core', 'lang']);
const K = RB.kana;

export default async (t) => {
  // ---- classes
  t.ok(K.isHira('あ') && K.isHira('ゔ') && !K.isHira('ア') && !K.isHira('漢'), 'isHira');
  t.ok(K.isKata('ア') && K.isKata('ヴ') && K.isKata('ー') && !K.isKata('あ'), 'isKata');
  t.ok(K.isKana('ゃ') && K.isKana('ッ') && !K.isKana('a'), 'isKana');
  t.ok(K.isKanji('漢') && K.isKanji('々') && !K.isKanji('ー') && !K.isKanji('あ') && !K.isKanji('ア'), 'isKanji incl. 々');
  t.eq(K.script('ランプ'), 'kata', 'script kata');
  t.eq(K.script('ラーメン'), 'kata', 'ー is neutral');
  t.eq(K.script('たべる'), 'hira', 'script hira');
  t.eq(K.script('食べる'), 'mixed', 'script mixed');

  // ---- conversions
  t.eq(K.toKata('きょうはいい'), 'キョウハイイ', 'toKata');
  t.eq(K.toHira('コーヒー'), 'こーひー', 'toHira keeps ー');
  t.eq(K.toHira('ヴァ'), 'ゔぁ', 'toHira ヴ');
  t.eq(K.widen('ｺｰﾋｰ'), 'コーヒー', 'halfwidth → fullwidth');
  t.eq(K.widen('ｶﾞﾗｽ'), 'ガラス', 'halfwidth dakuten combines');
  t.eq(K.widen('ﾊﾟﾝ'), 'パン', 'halfwidth handakuten combines');
  t.eq(K.narrowAscii('ＡＢＣ　１２'), 'ABC 12', 'fullwidth ASCII → ASCII');

  // ---- small kana and diacritics
  t.ok(K.isSmall('っ') && K.isSmall('ゃ') && K.isSmall('ァ') && !K.isSmall('つ'), 'isSmall');
  t.eq(K.toSmall('つ'), 'っ', 'toSmall');
  t.eq(K.toLarge('ョ'), 'ヨ', 'toLarge');
  t.eq(K.toSmall('か'), 'ゕ', 'toSmall か');
  t.eq(K.toSmall('さ'), 'さ', 'toSmall no small form');
  t.eq(K.addDakuten('か'), 'が', 'addDakuten');
  t.eq(K.addDakuten('ぱ'), 'ば', 'addDakuten from handakuten');
  t.eq(K.addDakuten('う'), 'ゔ', 'addDakuten う');
  t.eq(K.addDakuten('ウ'), 'ヴ', 'addDakuten ウ');
  t.eq(K.addDakuten('な'), null, 'addDakuten impossible → null');
  t.eq(K.addHandakuten('ば'), 'ぱ', 'addHandakuten');
  t.eq(K.addHandakuten('か'), null, 'addHandakuten impossible');
  t.eq(K.base('ぽ'), 'ほ', 'base handakuten');
  t.eq(K.base('ヅ'), 'ツ', 'base dakuten');
  t.eq(K.base('あ'), 'あ', 'base plain');
  t.ok(K.hasDakuten('が') && !K.hasDakuten('ぱ') && K.hasHandakuten('ぱ'), 'hasDakuten / hasHandakuten');

  // ---- romaji (modified Hepburn)
  const R = [
    ['しゃしん', 'shashin'], ['ちゃ', 'cha'], ['じゅう', 'juu'], ['つき', 'tsuki'], ['ふね', 'fune'],
    ['きって', 'kitte'], ['まっちゃ', 'matcha'], ['ざっし', 'zasshi'], ['ほんや', "hon'ya"], ['きんえん', "kin'en"],
    ['せんせい', 'sensei'], ['おう', 'ou'], ['おおきい', 'ookii'], ['コーヒー', 'koohii'], ['ランプ', 'ranpu'],
    ['ぢ', 'ji'], ['づ', 'zu'], ['ティー', 'tii'], ['ファン', 'fan'], ['ヴァイオリン', 'vaiorin'], ['を', 'wo'],
    ['は', 'ha'], ['あっ', "a'"], ['しんぶん', 'shinbun'],
  ];
  for (const [k, r] of R) t.eq(K.romaji(k), r, 'romaji ' + k);
  t.eq(K.romaji('は', { particle: true }), 'wa', 'particle は');
  t.eq(K.romaji('を', { particle: true }), 'o', 'particle を');
  t.eq(K.romaji('へ', { particle: true }), 'e', 'particle へ');
  t.eq(K.romaji('とうきょう', { macron: true }), 'tōkyō', 'macron mode');
  t.eq(K.romaji('コーヒー', { macron: true }), 'kōhī', 'macron ー');

  // ---- mora
  t.eq(K.mora('きょう'), ['きょ', 'う'], 'mora yōon');
  t.eq(K.mora('がっこう'), ['が', 'っ', 'こ', 'う'], 'mora small tsu');
  t.eq(K.mora('ほんや'), ['ほ', 'ん', 'や'], 'mora ん');
  t.eq(K.mora('コーヒー'), ['コ', 'ー', 'ヒ', 'ー'], 'mora ー');
  t.eq(K.mora('ティー'), ['ティ', 'ー'], 'mora small vowel');
  t.eq(K.mora('しゃしん。'), ['しゃ', 'し', 'ん'], 'mora skips punctuation');

  // ---- inventories
  const h = K.inventory('hira');
  const k = K.inventory('kata');
  t.eq(h.basic.length, 46, '46 basic hiragana');
  t.eq(k.basic.length, 46, '46 basic katakana');
  t.eq(h.voiced.length, 20, '20 voiced hiragana');
  t.eq(k.voiced.length, 21, '21 voiced katakana (with ヴ)');
  t.eq(h.semivoiced.length, 5, '5 semi-voiced');
  t.ok(k.long.includes('ー'), 'katakana long mark');
};
