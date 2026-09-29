/* Lexicon for the long quest lines (Koharuno, the Reedwake fare book,
 * Chigusa's stall). Format: w|r|pos|lv|meaning|note (see docs/CONTENT.md). */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  RB.lex.add(RB.lex.parseTable(`
# names and places
チグサ||name|F|Chigusa (a name)
カヨ||name|F|Kayo (a name)
ミツ||name|F|Mitsu (a name)
ゲンタ||name|F|Genta (a name)
ハル||name|F|Haru (a name)
トメ||name|F|Tome (a name)
ヨシゾウ||name|F|Yoshizō (a name)
キミ||name|F|Kimi (a name)
サブ||name|F|Sabu (a name)
小春野|こはるの|name|E|Koharuno (a hamlet; fictional)
小春|こはる|n|I|koharu: an old name for the tenth lunar month (about November); in this story also a persimmon named after Koharuno
小春日和|こはるびより|n|I|a mild, sunny day in late autumn or early winter|Not a spring word, despite 春.
野|の|suf|A|field, moor (read の at the end of some place names)
# the ferry and the fare
渡し帳|わたしちょう|n|A|ferry book, a ferryman's record of crossings and fares
渡し賃|わたしちん|n|I|ferry fare
賃|ちん|n|A|fee, charge (short for 渡し賃 and the like)
後払い|あとばらい|n|I|paying afterwards, payment later
前払い|まえばらい|n|I|paying in advance
小銭|こぜに|n|I|small change, coins
借用書|しゃくようしょ|n|A|IOU, written acknowledgement of a loan
質草|しちぐさ|n|A|an article left as a pledge (pawned)
遅配|ちはい|n|A|late delivery
人数|にんずう|n|E|number of people
匙|さじ|n|I|spoon
はがき||n|E|postcard
そこら||pn|I|around there; (〜かそこら) or so, or thereabouts
看病|かんびょう|vs|I|nursing (someone who is ill)
気長|きなが|adj-na|I|patient, easygoing about time
余分|よぶん|adj-na|I|extra, spare
眠気|ねむけ|n|I|sleepiness
冴える|さえる|v1|A|to be clear, sharp; (目が冴える) to be wide awake
貯まる|たまる|v5r|I|(money) to be saved up, accumulate
隙|すき|n|I|an opening, a gap (in someone's guard)
負う|おう|v5u|A|to bear, suffer (傷を負う: be wounded)
相棒|あいぼう|n|I|partner, companion (casual)
今更|いまさら|adv|A|now, after all this time (implies it is too late)
# Koharuno and persimmons
木守|きもり|n|A|tree-keeper (here: the person who tended the hamlet's great tree)
接ぐ|つぐ|v5g|A|to graft (a tree)
接ぎ木|つぎき|vs|A|grafting (trees)
大木|たいぼく|n|I|large tree, great tree
柿渋|かきしぶ|n|A|kakishibu, fermented persimmon tannin used as a dye and waterproofing
手ぬぐい|てぬぐい|n|I|tenugui, a thin cotton hand towel or cloth
沢|さわ|n|I|mountain stream, brook
刃物|はもの|n|I|blade, edged tool
おば||n|E|aunt
故郷|こきょう|n|I|home town, birthplace
背伸び|せのび|vs|I|stretching up (on tiptoe)
手のひら|てのひら|n|E|palm (of the hand)
空っぽ|からっぽ|adj-na|I|empty
こぼれる||v1|I|to spill, overflow
かじる||v5r|I|to bite into, nibble
縫う|ぬう|v5u|I|to sew
生き延びる|いきのびる|v1|I|to survive, live on
物覚え|ものおぼえ|n|I|memory, ability to remember things
念のため|ねんのため|exp|I|just to be sure, for the record
二枚看板|にまいかんばん|n|A|a double bill, two star attractions
出演者|しゅつえんしゃ|n|A|performer, cast member
一覧|いちらん|n|I|list, overview
一列|いちれつ|n|I|a row, a line
四十二|よんじゅうに|n|E|forty-two
# notes
旧暦|きゅうれき|n|A|the old (lunisolar) calendar
別名|べつめい|n|I|another name, alias
晩秋|ばんしゅう|n|A|late autumn
初冬|しょとう|n|A|early winter
液|えき|n|I|liquid, fluid
  `), 'lq');
})();
