/* Lexicon for the ending extensions, The Pages We Keep and the road topics
 * (src/content/pages/). Only words no earlier file defines.
 * Format: w|r|pos|lv|meaning|note (see docs/CONTENT.md). */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  RB.lex.add(RB.lex.parseTable(`
# people, animals, the body
たぬき||n|E|tanuki, raccoon dog|In folklore said to shapeshift (化ける).
あくび||n|E|yawn
くしゃみ||n|E|sneeze
真顔|まがお|n|A|a straight face, a serious look
番犬|ばんけん|n|I|watchdog
相方|あいかた|n|A|partner (in a double act, on stage)
相手役|あいてやく|n|A|the other part in a scene, co-star
名人|めいじん|n|I|master, expert
仲|なか|n|I|terms, relationship (仲がいい: to get on well)
# verbs
覗き込む|のぞきこむ|v5m|I|to peer into
かしげる||v1|A|to tilt (one's head)
言いそびれる|いいそびれる|v1|A|to miss the chance to say something
仕上げる|しあげる|v1|I|to finish (a piece of work)
見落とす|みおとす|v5s|I|to overlook, to miss
焦る|あせる|v5r|I|to be in a hurry, to be impatient
飽きる|あきる|v1|I|to get tired of, to lose interest in
化ける|ばける|v1|I|to take another shape, to disguise oneself (foxes and tanuki in folklore)
横切る|よこぎる|v5r|I|to cross, to cut across
# work, records, the stage
受取|うけとり|n|I|receipt; receiving (a delivery)
分担|ぶんたん|vs|I|dividing up the work; one's share
回数|かいすう|n|I|number of times
公表|こうひょう|vs|A|making public, publishing
記述|きじゅつ|vs|A|written description, account
清書|せいしょ|vs|I|making a fair copy, writing out neatly
候補|こうほ|n|I|candidate
統計|とうけい|n|A|statistics
精度|せいど|n|A|accuracy, precision
確率|かくりつ|n|I|probability
一割|いちわり|n|I|ten percent (one tenth)
五割|ごわり|n|I|fifty percent (five tenths)
九割|きゅうわり|n|I|ninety percent (nine tenths)
品切れ|しなぎれ|n|I|sold out, out of stock
収入|しゅうにゅう|n|I|income
道順|みちじゅん|n|I|route, the way (to somewhere)
出演|しゅつえん|vs|I|appearing (in a play), performing
登場人物|とうじょうじんぶつ|n|A|character (in a story or play)
未確認|みかくにん|n|A|unconfirmed
見回り|みまわり|n|I|rounds, a patrol
大金持ち|おおがねもち|n|I|a very rich person
練習台|れんしゅうだい|n|A|someone or something to practise on
番付|ばんづけ|n|A|programme (of a performance), playbill; ranking list
木戸銭|きどせん|n|A|admission fee (to a show; old-fashioned)
上演|じょうえん|vs|I|staging (a play), putting on a performance
脚色|きゃくしょく|vs|A|dramatizing; embellishing a story
脚本|きゃくほん|n|I|script, screenplay
効果音|こうかおん|n|A|sound effect
出演料|しゅつえんりょう|n|A|performer's fee
任命|にんめい|vs|A|appointment (to a post)
一列目|いちれつめ|n|I|the first row
三杯目|さんばいめ|n|I|the third cup
# time, manner, feelings
後回し|あとまわし|n|I|putting off, leaving till later
未定|みてい|n|I|not yet decided, to be announced
延長|えんちょう|vs|I|extending, extension
最中|さいちゅう|n|I|in the middle of (doing)
普段|ふだん|n|E|usual, everyday
機会|きかい|n|I|opportunity, chance
念|ねん|n|A|care, attention (念のため: just in case)
一理|いちり|n|A|a point, some truth (一理ある: to have a point)
一目|いちもく|n|A|(一目置く) to acknowledge someone's worth, to hold in respect
勘|かん|n|I|intuition, instinct
野営|やえい|vs|I|camping out, bivouac
完全|かんぜん|adj-na|I|complete, perfect
慎重|しんちょう|adj-na|I|careful, cautious
身軽|みがる|adj-na|I|light, unburdened, nimble
誇らしい|ほこらしい|adj-i|I|proud (of something)
歩幅|ほはば|n|A|stride, length of a step
見落とし|みおとし|n|I|oversight, something missed
`), 'pages');
})();
