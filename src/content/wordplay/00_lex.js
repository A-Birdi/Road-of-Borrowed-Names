/* Lexicon for companion shiritori (src/content/wordplay/): the words the table's
 * labels, the companions' lines, the reflections and the thoughts use that the
 * game did not know yet. Format: w|r|pos|lv|meaning (see docs/CONTENT.md). The
 * shiritori word banks themselves are separate (src/content/shiritori/). */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  RB.lex.add(RB.lex.parseTable(`
# the game itself
しりとり||n|F|shiritori (the word-chain game)
一局|いっきょく|n|I|one game (of a board game or a match)
勝負|しょうぶ|vs|E|contest, match; to compete
試合|しあい|n|E|match, game, bout
降参|こうさん|vs|I|surrender, conceding (a game)
手加減|てかげん|vs|I|going easy (on someone), holding back
目標|もくひょう|n|E|goal, target
設定|せってい|vs|I|setting, setup
気楽|きらく|adj-na|I|easygoing, relaxed, carefree
母音|ぼいん|n|I|vowel
区切る|くぎる|v5r|I|to break off, to mark a break (in something)
前回|ぜんかい|n|E|last time, the previous occasion
幕切れ|まくぎれ|n|A|the fall of the curtain, the end (of a scene or a match)
# feelings and manner
必死|ひっし|adj-na|I|desperate, frantic, doing one's utmost
多分|たぶん|adv|E|probably, perhaps
粗|あら|n|A|flaw, fault (粗が見える: flaws show)
`), 'wordplay');
})();
