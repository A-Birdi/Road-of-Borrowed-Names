/* The Kansai lexicon: the Kansai words and endings Suzu uses in her Kansai-ben lines
 * (docs/dialect/suzu_kansai.md). Kept apart from RB.lex on purpose: these forms
 * explain her lines in word help but never feed the standard vocabulary (kana
 * practice words, the kanji chart's words, the writing desk, reviews). Verb forms
 * (〜へん, 〜はる, 〜たる, 〜てもうた, 言うた, 〜てん …) are explained through their
 * standard form by RB.dialect.lookupIn.
 *   K(w, r, pos, lv, meaning, standard, note, final)
 *   final: only at the end of a sentence (で, わ, な: the same kana are ordinary
 *   particles elsewhere). */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const K = (w, r, pos, lv, m, std, n, final) => Object.assign({ w, r: r || w, pos, lv, m, std }, n ? { n } : {}, final ? { final: true } : {});
  RB.dialect.addLex([
    // ---- the copula and what grows from it --------------------------------------------------------
    K('や', '', 'aux', 'E', 'is; it\'s (the Kansai copula)', 'だ', 'Kansai uses や where standard Japanese uses だ: 本当だ → ほんまや.'),
    K('やった', '', 'aux', 'E', 'was (Kansai past of や)', 'だった'),
    K('やろ', '', 'aux', 'E', 'right?; probably; I bet', 'だろう / でしょう', 'Rising at the end, it asks for agreement: ええやろ？ "Nice, right?"'),
    K('やろか', '', 'exp', 'I', 'I wonder; shall I?', 'だろうか'),
    K('やん', '', 'aux', 'E', 'isn\'t it; you know (a friendly tag)', 'じゃない / じゃん', 'ええやん "That\'s nice, isn\'t it." Not a negative.'),
    K('やんか', '', 'aux', 'I', 'isn\'t it; you know (a little more insistent than やん)', 'じゃないか'),
    K('やんな', '', 'exp', 'I', 'right? (checking with someone)', 'だよね'),
    K('やけど', '', 'conj', 'E', 'but; although (= だけど)', 'だけど'),
    K('やから', '', 'conj', 'E', 'so; because (= だから)', 'だから'),
    K('やし', '', 'conj', 'I', 'and besides; and what\'s more (= だし)', 'だし'),
    K('やのに', '', 'conj', 'I', 'even though (= なのに)', 'なのに'),
    K('やったら', '', 'conj', 'I', 'if it\'s…; in that case (= だったら)', 'だったら / なら'),
    K('やと', '', 'conj', 'I', 'if it\'s…; when it\'s… (= だと)', 'だと'),
    K('やって', '', 'conj', 'I', 'because; even (= だって)', 'だって'),
    K('やねん', '', 'exp', 'E', 'it\'s that…; you see (や + ねん)', 'なんだ / なのよ'),
    // ---- endings ---------------------------------------------------------------------------------------
    K('ねん', '', 'prt', 'E', 'explanatory ending: "you see", "it\'s that…"', 'のだ / んだ / のよ', 'Kansai\'s everyday way of explaining or insisting: 知らんねん "I just don\'t know."'),
    K('で', '', 'prt', 'E', 'sentence ending: "I tell you", firm and friendly', 'よ', 'Only at the end of a sentence; elsewhere で is the ordinary particle (at, by, with).', true),
    K('わ', '', 'prt', 'E', 'sentence ending: assertion', 'よ', 'In Kansai わ is used by men and women alike, not a feminine ending.', true),
    K('な', '', 'prt', 'E', 'sentence ending: shared feeling, agreement', 'ね', 'Kansai often uses な where standard speech has ね.', true),
    K('なあ', '', 'prt', 'E', 'sentence ending: musing, shared feeling', 'ねえ', null, true),
    // ---- yes, no, so ------------------------------------------------------------------------------------
    K('せや', '', 'int', 'E', 'that\'s right; yeah', 'そうだ'),
    K('そや', '', 'int', 'E', 'that\'s right; yeah', 'そうだ'),
    K('せやろ', '', 'exp', 'E', 'I thought so; right?', 'そうだろう'),
    K('せやな', '', 'exp', 'E', 'yeah, that\'s true', 'そうだね'),
    K('せやけど', '', 'conj', 'I', 'but; even so', 'だけど / でも'),
    K('せやから', '', 'conj', 'I', 'that\'s why; so', 'だから'),
    K('ちゃう', '', 'exp', 'E', 'it isn\'t; that\'s wrong; not…', '違う / じゃない', 'うそ ちゃう "It\'s not a lie." ちゃう？ at the end asks "isn\'t it?"'),
    K('ちゃうか', '', 'exp', 'I', 'isn\'t it?; I think…', 'じゃないか'),
    K('ちゃうん', '', 'exp', 'I', 'isn\'t it?', 'じゃないの'),
    K('ちゃうかった', '', 'exp', 'I', 'it wasn\'t; it was different', '違った / じゃなかった'),
    K('ちゃうねん', '', 'exp', 'I', 'no, it\'s not like that', '違うんだ'),
    K('あかん', '', 'exp', 'E', 'no good; mustn\'t; won\'t do', 'だめ / いけない', '〜な あかん = must (行かな あかん "I have to go").'),
    K('あかんかった', '', 'exp', 'I', 'it was no good', 'だめだった'),
    K('しゃあない', '', 'exp', 'E', 'it can\'t be helped', '仕方ない'),
    K('かまへん', '', 'exp', 'E', 'it\'s fine; I don\'t mind', 'かまわない'),
    K('ほな', '', 'conj', 'E', 'well then; right, so', 'じゃあ / それなら'),
    K('よっしゃ', '', 'int', 'E', 'all right!; right then', 'よし'),
    K('ほんなら', '', 'conj', 'I', 'in that case', 'それなら'),
    K('ほんで', '', 'conj', 'I', 'and then; so', 'それで'),
    K('なんや', '', 'exp', 'E', 'what is it; oh, it\'s just…', 'なんだ'),
    K('どない', '', 'adv', 'I', 'how; what (= どう)', 'どう', 'どないしたん？ "What happened?"'),
    K('そない', '', 'adv', 'I', 'that much; like that (= そんなに)', 'そんなに'),
    // ---- words -------------------------------------------------------------------------------------------
    K('ほんま', '', 'adj-na', 'E', 'true; real; really', '本当'),
    K('ほんまに', '', 'adv', 'E', 'really; truly', '本当に'),
    K('ほんまもん', '', 'n', 'I', 'the real thing', '本物'),
    K('めっちゃ', '', 'adv', 'E', 'really; super', 'とても'),
    K('ええ', '', 'adj-i', 'E', 'good; nice; fine', 'いい', 'In standard Japanese ええ is also a soft "yes"; in Kansai it is the everyday word for "good".'),
    K('ええよ', '', 'exp', 'E', 'sure; it\'s fine', 'いいよ'),
    K('おもろい', '', 'adj-i', 'E', 'funny; interesting', 'おもしろい'),
    K('しんどい', '', 'adj-i', 'I', 'tiring; hard going', 'つらい / 疲れる'),
    K('しょうもない', '', 'adj-i', 'I', 'silly; pointless', 'くだらない'),
    K('うち', '', 'pn', 'E', 'I; me (a woman speaking, Kansai)', 'わたし', 'Many Kansai women say うち for "I". (Elsewhere うち also means "home".)'),
    K('うちら', '', 'pn', 'I', 'we; us', 'わたしたち'),
    K('あんた', '', 'pn', 'E', 'you (warm and familiar in Kansai)', 'あなた', 'In Kansai あんた is friendly; elsewhere it can sound blunt.'),
    K('いっぺん', '', 'adv', 'I', 'once; one time', '一度'),
    K('気ぃ', 'きぃ', 'n', 'E', 'feeling; attention (気, drawn out)', '気', '気ぃ つけて "take care". A one-kana word is often lengthened in Kansai speech: 気 → 気ぃ, 目 → 目ぇ.'),
    K('おる', '', 'v5r', 'E', 'to be; to be there (people, animals)', 'いる', 'In Kansai おる is everyday "be"; in standard Japanese it is humble.'),
    K('やて', '', 'exp', 'I', 'they say; it says (quoting: = だって)', 'だって'),
    K('えらい', '', 'adj-i', 'I', 'terrible; awful; (before a word) very', '大変', 'In Kansai えらい often means "awful" or "very" (えらい こと = a disaster), not only "great".'),
    K('なんぼ', '', 'adv', 'I', 'how much; however much', 'いくら'),
    K('はよ', '', 'adv', 'I', 'quickly; hurry', '早く'),
    K('ぎょうさん', '', 'adv', 'A', 'lots; plenty', 'たくさん'),
    K('知らんけど', 'しらんけど', 'exp', 'I', '…not that I\'d know (a playful hedge at the end)', '知らないけど'),
    Object.assign(K('なあ', '', 'int', 'E', 'hey; say (calling someone\'s attention)', 'ねえ'), { initial: true }),
    // ---- casual speech that is not only Kansai (word help says so) -----------------------------
    Object.assign(K('もん', '', 'n', 'E', 'thing; (at the end) because, you see', 'もの'), { casual: true }),
    Object.assign(K('おしまい', '', 'n', 'E', 'the end; that\'s all', '終わり'), { casual: true }),
    Object.assign(K('とこ', '', 'n', 'E', 'place; point; moment', 'ところ'), { casual: true }),
    // ---- ordinary words whose kana spelling the standard lexicon reads as another word -----------
    Object.assign(K('なし', '', 'n', 'E', 'none; without (無し)', '無し'), { plain: true }),
  ], 'kansai');
  // うち before に is usually "while" (〜うちに), not "I"
  for (const e of RB.dialect.lexAll()) if (e.w === 'うち') e.notNext = ['に'];
})();
