/* Lexicon for the cosmetic-pet vignettes and greetings (src/content/pets/).
 * Format: w|r|pos|lv|meaning|note (see docs/CONTENT.md). Pets' own names are
 * the player's plain text and never appear in Japanese lines. */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  RB.lex.add(RB.lex.parseTable(`
# the cat: A Dry Corner
うろうろ||adv|I|hanging about, wandering around aimlessly
茶トラ|ちゃトラ|n|I|ginger tabby (a cat's coat)
すだれ||n|I|reed screen, a hanging or leaning blind of thin reeds
縮める|ちぢめる|v1|I|to shrink, draw in|身を縮める: to shrink back, flinch.
垂れる|たれる|v1|I|to hang down, dangle
平ら|たいら|adj-na|I|flat, level
装置|そうち|n|I|device, apparatus|舞台装置: stage set, scenery.
# the bird: The Ribbon by the Perch
岸壁|がんぺき|n|A|quay, wharf (a harbour's stone edge)
小鳥|ことり|n|E|small bird
着地|ちゃくち|vs|I|landing (on the ground)
着陸|ちゃくりく|vs|I|landing (of something flying)
何回目|なんかいめ|exp|I|which time, how many times (this is)
手のひら|てのひら|n|I|palm of the hand
かしげる||v1|A|to tilt (one's head)|首をかしげる: to tilt one's head (puzzled or curious).
ぴょん||adv|I|with a hop (the sound and look of a small jump)
# the dog: The Gate That Will Not Stay
人懐っこい|ひとなつっこい|adj-i|I|friendly, sociable (with people)
突っ込む|つっこむ|v5m|I|to thrust into, plunge into
しゃがむ||v5m|I|to crouch, squat down
のそのそ||adv|A|slowly, lumberingly
お日様|おひさま|n|I|the sun (familiar)|お日様の匂い: the smell of things dried in the sun.
そいつ||pn|I|that one, that fellow (rough)
押し込む|おしこむ|v5m|I|to push in, press in
戸締まり|とじまり|n|I|locking up, shutting the doors and gates
ぐるり||adv|A|(turning) all the way round
満足|まんぞく|adj-na|I|satisfied, content
# the tanuki: Paper in the Clearing
たぬき||n|E|tanuki, raccoon dog
根元|ねもと|n|I|root, base (of a tree or plant)
くぼみ||n|I|hollow, dip, recess
ぴくぴく||adv|I|twitching
前足|まえあし|n|I|front legs, forepaws
新人|しんじん|n|I|newcomer, new member
入団|にゅうだん|vs|A|joining (a troupe, team or company)
# greeting together
こすりつける||v1|I|to rub (something) against
跳ぶ|とぶ|v5b|I|to jump, hop
つつく||v5k|I|to peck, poke
あご||n|I|chin, jaw
とげ||n|I|thorn, splinter
刺さる|ささる|v5r|I|to stick in, pierce
くしゃみ||n|I|sneeze
不満|ふまん|adj-na|I|dissatisfied, discontented
化ける|ばける|v1|I|to take the form of, change into (as tanuki and foxes do in folk tales)
嘴|くちばし|n|A|beak, bill
ぺこり||adv|A|(bowing) with a quick bob of the head
拍子|ひょうし|n|I|rhythm, beat|拍子をとる: to keep time.
口笛|くちぶえ|n|I|whistle, whistling
節|ふし|n|A|tune, melody; a phrase of music
二重唱|にじゅうしょう|n|A|duet (singing)
決定|けってい|vs|I|decision; settled
見得|みえ|n|A|a kabuki actor's frozen dramatic pose|見得を切る: to strike such a pose.
片足|かたあし|n|I|one leg, one foot
`), 'pets');
})();
