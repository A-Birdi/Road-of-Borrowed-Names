/* Lexicon for the shiritori word banks (src/content/shiritori/): the bank words the
 * game's lexicon did not have yet, so word help can explain them. Meanings are written
 * for this game (not copied); readings were checked as described in 10_words.js.
 * Format: w|r|pos|lv|meaning (see docs/CONTENT.md). */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  RB.lex.add(RB.lex.parseTable(`
猿|さる|n|E|monkey
蛸|たこ|n|E|octopus
凧|たこ|n|E|kite (toy)
いか||n|F|squid
海老|えび|n|E|shrimp
豚|ぶた|n|E|pig
狸|たぬき|n|F|tanuki (raccoon dog)
うさぎ||n|E|rabbit
ねずみ||n|F|mouse, rat
りす||n|I|squirrel
象|ぞう|n|E|elephant
虎|とら|n|F|tiger
わに||n|E|crocodile
鯉|こい|n|I|carp
鳩|はと|n|I|pigeon
からす||n|I|crow
すずめ||n|I|sparrow
つばめ||n|I|swallow (bird)
ふくろう||n|I|owl
鶏|にわとり|n|I|chicken
ひよこ||n|I|chick
あひる||n|I|duck
蝶|ちょう|n|F|butterfly
蜂|はち|n|I|bee
あり||n|I|ant
せみ||n|I|cicada
とんぼ||n|I|dragonfly
蜘蛛|くも|n|F|spider
いるか||n|I|dolphin
鯨|くじら|n|I|whale
いのしし||n|I|wild boar
ゴリラ||n|F|gorilla
パンダ||n|I|panda
ざりがに||n|I|crayfish
めじろ||n|I|white-eye (small bird)
いちご||n|E|strawberry
ぶどう||n|I|grapes
すいか||n|I|watermelon
バナナ||n|E|banana
梅|うめ|n|I|ume plum
びわ||n|I|loquat
なす||n|I|aubergine, eggplant
ねぎ||n|I|spring onion
にんじん||n|I|carrot
大根|だいこん|n|I|daikon radish
きゅうり||n|I|cucumber
かぼちゃ||n|I|pumpkin
じゃがいも||n|E|potato
芋|いも|n|I|potato, yam
きのこ||n|I|mushroom
かぶ||n|I|turnip
寿司|すし|n|F|sushi
うどん||n|I|udon noodles
豆腐|とうふ|n|I|tofu
味噌|みそ|n|E|miso
こしょう||n|I|pepper (spice)
海苔|のり|n|F|nori seaweed
牛乳|ぎゅうにゅう|n|I|milk
ジュース||n|E|juice
ぎょうざ||n|I|gyoza dumpling
レタス||n|I|lettuce
芽|め|n|F|bud, sprout
爪|つめ|n|I|fingernail, claw
おなか||n|I|belly
舌|した|n|I|tongue
沼|ぬま|n|I|marsh, swamp
ばら||n|I|rose
ひまわり||n|I|sunflower
もみじ||n|I|maple (autumn leaves)
どんぐり||n|F|acorn
たんぽぽ||n|I|dandelion
寺|てら|n|I|temple
城|しろ|n|I|castle
道路|どうろ|n|I|road
病院|びょういん|n|I|hospital
銀行|ぎんこう|n|E|bank
ビル||n|E|building
プール||n|E|swimming pool
かばん||n|E|bag
畳|たたみ|n|I|tatami mat
ほうき||n|I|broom
バケツ||n|I|bucket
せっけん||n|I|soap
タオル||n|I|towel
歯ブラシ|はぶらし|n|I|toothbrush
まないた||n|I|cutting board
やかん||n|I|kettle
カーテン||n|I|curtain
電話|でんわ|n|E|telephone
電気|でんき|n|I|electric light, electricity
ラジオ||n|F|radio
テレビ||n|I|television
冷蔵庫|れいぞうこ|n|I|refrigerator
ごみ||n|E|rubbish
指輪|ゆびわ|n|I|ring (finger)
ズボン||n|I|trousers
スカート||n|I|skirt
セーター||n|E|jumper, sweater
コート||n|I|coat
電車|でんしゃ|n|E|train
バス||n|E|bus
自転車|じてんしゃ|n|I|bicycle
飛行機|ひこうき|n|I|aeroplane
タクシー||n|I|taxi
トラック||n|I|lorry, truck
消しゴム|けしごむ|n|I|eraser, rubber
葉書|はがき|n|I|postcard
新聞|しんぶん|n|I|newspaper
物差し|ものさし|n|I|ruler (for measuring)
図柄|ずがら|n|I|design, pattern
太鼓|たいこ|n|I|drum
ギター||n|E|guitar
琴|こと|n|I|koto (zither)
折り紙|おりがみ|n|I|origami paper
こま||n|I|spinning top
ボール||n|E|ball
ぶらんこ||n|I|swing (playground)
おもちゃ||n|I|toy
ルビー||n|E|ruby (gem)
ルーレット||n|I|roulette wheel
リュック||n|I|rucksack
ゼリー||n|E|jelly (dessert)
`), 'shiritori');
})();
