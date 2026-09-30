/* Lexicon for the Words pages (Kept sentences, Creatures met): the words in
 * their Japanese labels. Format: w|r|pos|lv|meaning|note (see docs/CONTENT.md). */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  RB.lex.add(RB.lex.parseTable(`
観察|かんさつ|vs|I|observation, watching closely
出会う|であう|v5u|E|to meet (by chance), to come across
屋内|おくない|n|I|indoors
屋外|おくがい|n|I|outdoors, out of doors
石碑|せきひ|n|A|stone monument, an inscribed stone
戸棚|とだな|n|I|cupboard, cabinet
ナレーション||n|I|narration (the storyteller's voice, as opposed to what people say)
`));
})();
