/* Lexicon for the companionship content (src/content/company/): the words the
 * companions' new conversations, thoughts and memories use that the game did not
 * know yet. Format: w|r|pos|lv|meaning|note (see docs/CONTENT.md). */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  RB.lex.add(RB.lex.parseTable(`
# talk, stage and accounts
いじる||v5r|I|to fiddle with, to tamper with
前振り|まえふり|n|A|set-up, lead-in (before a punchline or a scene)
経験者|けいけんしゃ|n|I|someone who has experienced it
談|だん|suf|A|talk, account (経験者談: speaking from experience)
即答|そくとう|vs|A|answering at once, an immediate reply
山場|やまば|n|A|climax, high point (of a play or story)
推測|すいそく|vs|A|guess, inference
優先|ゆうせん|vs|I|putting first, priority
言いそびれる|いいそびれる|v1|A|to miss the chance to say
聞きそびれる|ききそびれる|v1|A|to miss the chance to ask
延期|えんき|vs|I|postponement
料金|りょうきん|n|E|fee, charge
経費|けいひ|n|I|expenses
共同|きょうどう|n|I|joint, shared, co- (共同演出: co-directing)
理想|りそう|n|I|ideal
再演|さいえん|vs|A|revival (of a play), putting on again
印象|いんしょう|n|I|impression
感想|かんそう|n|I|impressions, thoughts (about something)
金額|きんがく|n|I|sum of money, amount
監査|かんさ|vs|A|audit (of accounts)
相方|あいかた|n|A|partner (in a double act, a pair)
特等席|とくとうせき|n|A|best seat, special seat
点呼|てんこ|n|A|roll call
共演者|きょうえんしゃ|n|A|co-star, fellow performer
アドリブ||n|I|ad lib, improvisation
月謝|げっしゃ|n|A|monthly fee for lessons
新顔|しんがお|n|A|new face, newcomer
現実的|げんじつてき|adj-na|I|practical, realistic
# Company page labels
絆|きずな|n|I|bond, ties (between people)
謎|なぞ|n|I|mystery, puzzle
手助け|てだすけ|n|I|help, a helping hand
出会い|であい|n|I|meeting, an encounter
# things and places
行灯|あんどん|n|A|paper-shaded lamp stand (traditional indoor lamp)
公文書館|こうぶんしょかん|n|A|public records hall, archives (building)
紙挟み|かみばさみ|n|A|folder, paper holder (a folio)
空き家|あきや|n|I|empty house
四百|よんひゃく|n|E|four hundred
受取|うけとり|n|I|receiving, receipt (受取拒否: delivery refused by the recipient)
仕組み|しくみ|n|I|how something works, mechanism, arrangement
宿題|しゅくだい|n|E|homework
再来年|さらいねん|n|I|the year after next
一息|ひといき|n|I|a breather, a pause (一息つく: to take a breather)
念|ねん|n|A|sense, care (念のため: just in case)
毛並み|けなみ|n|A|coat, fur (of an animal)
小鳥|ことり|n|E|small bird
たぬき||n|E|tanuki, raccoon dog
野宿|のじゅく|vs|I|sleeping out in the open
# verbs and descriptions
ぶつかる||v5r|E|to bump into, to clash
見落とす|みおとす|v5s|I|to overlook, to miss
任す|まかす|v5s|I|to entrust, to leave (something) to someone|Same meaning as 任せる.
失くす|なくす|v5s|E|to lose (something)|Also written 無くす.
浸かる|つかる|v5r|I|to be soaked in, to stand in (water)
頂く|いただく|v5k|E|to receive (humble); to eat or drink (humble)
混ざる|まざる|v5r|I|to be mixed, to blend
傾く|かたむく|v5k|I|to lean, to tilt
凝る|こる|v5r|I|to be stiff (shoulders); to be absorbed in
濡らす|ぬらす|v5s|I|to get (something) wet
化ける|ばける|v1|I|to take another form (as tanuki and foxes do in folk tales)
ぬるい||adj-i|E|lukewarm, tepid
恋しい|こいしい|adj-i|I|missed, longed for
羨ましい|うらやましい|adj-i|I|enviable; envious
豊か|ゆたか|adj-na|I|rich, abundant
不公平|ふこうへい|adj-na|I|unfair
正常|せいじょう|adj-na|I|normal
油断|ゆだん|vs|I|letting one's guard down
# the bond stages (src/engine/06_company.js) and Known Details (src/ui/61_known.js)
歩調|ほちょう|n|A|pace, step (歩調が合う: to keep in step)
道連れ|みちづれ|n|I|travelling companion
疑問|ぎもん|n|I|question, doubt
`), 'company');
})();
