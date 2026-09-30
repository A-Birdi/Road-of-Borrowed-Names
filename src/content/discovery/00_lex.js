/* Lexicon for field discovery: the Mill Road repair, the field puzzles F1-F6,
 * field weaving and the Roadside Keepsakes. Format: w|r|pos|lv|meaning|note
 * (see docs/CONTENT.md). */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  RB.lex.add(RB.lex.parseTable(`
# the Mill Road
茎|くき|n|I|stalk, stem
根元|ねもと|n|I|root, base (of a plant or post)
# field weaving (what a response does where nothing answers to it)
重み|おもみ|n|I|weight, heaviness
焦がす|こがす|v5s|I|to scorch, to burn (the surface of)
# F1: the slip screen by the river warehouse
衝立|ついたて|n|I|standing screen, partition
倉|くら|n|I|storehouse, warehouse
茶葉|ちゃば|n|I|tea leaves
平ら|たいら|adj-na|I|flat, level
留め具|とめぐ|n|A|clamp, fastener
ねじ留め|ねじどめ|n|A|screw clamp; fastening with a screw
ねじ||n|I|screw
締める|しめる|v1|I|to tighten, to fasten
自体|じたい|n|I|itself (the thing itself)
放す|はなす|v5s|E|to let go (of), to release
枠|わく|n|I|frame
玉|たま|n|E|ball, bead (玉になる: to bead up)
濡らす|ぬらす|v5s|I|to wet
伝う|つたう|v5u|I|to run along, to go along (e.g. water down a surface)
絡む|からむ|v5m|I|to wind round, to get tangled
引っかける|ひっかける|v1|I|to catch (on something), to snag
ばたばた||adv|I|flapping, clattering
# F2: the signal float
仕組み|しくみ|n|I|mechanism, how something works
滑車|かっしゃ|n|A|pulley
巻き胴|まきどう|n|A|winding drum (of a winch)
胴|どう|n|A|drum, barrel (of a winch); trunk (of a body)
止め爪|とめづめ|n|A|catch, pawl (it stops a wheel turning back)
漏斗|じょうご|n|A|funnel
水槽|すいそう|n|I|tank (of water)
コルク||n|I|cork
泡|あわ|n|I|bubble(s), foam
留まる|とどまる|v5r|A|to stay, to remain (in place)
見落とす|みおとす|v5s|I|to overlook, to miss
出演料|しゅつえんりょう|n|A|performance fee
脇役|わきやく|n|I|supporting role
# F3: the maker's mark
見本|みほん|n|I|sample, model
楔|くさび|n|A|wedge
据わり|すわり|n|A|steadiness (how firmly a thing sits)
据わる|すわる|v5r|A|to sit steady (of a thing)
据える|すえる|v1|A|to set (something) steadily in place
作|さく|n|I|a work; (a piece) made by
仕上がる|しあがる|v5r|I|to be finished (of something made)
がたがた||adv|I|rattling, wobbling
ぶれる||v1|I|to blur, to shake (out of true)
関節|かんせつ|n|I|joint
先代|せんだい|n|A|the previous master (of a house or workshop)
棒|ぼう|n|I|rod, stick
手堅い|てがたい|adj-i|A|solid, reliable
満足|まんぞく|n|I|satisfaction (満足する: to be satisfied)
裏方|うらかた|n|A|backstage crew, stagehand
葉っぱ|はっぱ|n|E|leaf
# F4: the frosted compartments
三角|さんかく|n|E|triangle
灯心|とうしん|n|A|lamp wick
温もり|ぬくもり|n|I|warmth
誇らしい|ほこらしい|adj-i|I|proud
粋|いき|adj-na|A|stylish, chic
# F5: the listening corner
展示|てんじ|n|I|display, exhibition
撞木|しゅもく|n|A|bell striker (a wooden hammer or beam for striking a bell)
鈴蘭|すずらん|n|I|lily of the valley
小箱|こばこ|n|I|small box
大失敗|だいしっぱい|n|I|a complete failure, a disaster
独唱|どくしょう|n|A|(vocal) solo
# F6: the unbound index
索引|さくいん|n|A|index
毛糸|けいと|n|I|wool (yarn)
見出し|みだし|n|I|heading; (index) tab
上向き|うわむき|n|I|pointing up, facing upward
下向き|したむき|n|I|pointing down, facing downward
薄紙|うすがみ|n|I|thin paper, tissue paper
こする||v5r|I|to rub
こすり出す|こすりだす|v5s|A|to bring out (a pressed mark) by rubbing
こすり出し|こすりだし|n|A|a rubbing (of a pressed mark)
ふわり||adv|I|lightly, softly (drifting)
手の平|てのひら|n|I|palm (of the hand)
滑らか|なめらか|adj-na|I|smooth
自己紹介|じこしょうかい|n|I|introducing oneself
くるり||adv|I|(turning) round, with a quick spin
山形|やまがた|n|A|chevron, inverted-V shape
`), 'discovery');
})();
