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
りす||n|F|squirrel
象|ぞう|n|E|elephant
虎|とら|n|E|tiger
わに||n|I|crocodile
鯉|こい|n|I|carp
鳩|はと|n|I|pigeon
からす||n|I|crow
すずめ||n|I|sparrow
つばめ||n|I|swallow (bird)
ふくろう||n|I|owl
鶏|にわとり|n|I|chicken
ひよこ||n|I|chick
あひる||n|I|duck
蝶|ちょう|n|I|butterfly
蜂|はち|n|I|bee
あり||n|I|ant
せみ||n|E|cicada
とんぼ||n|I|dragonfly
蜘蛛|くも|n|F|spider
いるか||n|I|dolphin
鯨|くじら|n|I|whale
ゴリラ||n|E|gorilla
パンダ||n|I|panda
ライオン||n|I|lion
きりん||n|I|giraffe
ペンギン||n|I|penguin
ざりがに||n|I|crayfish
いちご||n|E|strawberry
ぶどう||n|I|grapes
すいか||n|I|watermelon
バナナ||n|E|banana
梅|うめ|n|I|ume plum
なす||n|I|aubergine, eggplant
ねぎ||n|I|spring onion
きゅうり||n|I|cucumber
かぼちゃ||n|I|pumpkin
じゃがいも||n|I|potato
芋|いも|n|I|potato, yam
きのこ||n|I|mushroom
寿司|すし|n|F|sushi
うどん||n|I|udon noodles
豆腐|とうふ|n|I|tofu
味噌|みそ|n|I|miso
海苔|のり|n|F|nori seaweed
牛乳|ぎゅうにゅう|n|E|milk
ジュース||n|I|juice
ラーメン||n|I|ramen
芽|め|n|F|bud, sprout
爪|つめ|n|I|fingernail, claw
おなか||n|I|belly
舌|した|n|I|tongue
沼|ぬま|n|I|marsh, swamp
ばら||n|I|rose
ゆり||n|I|lily
ひまわり||n|I|sunflower
もみじ||n|I|maple (autumn leaves)
どんぐり||n|F|acorn
寺|てら|n|I|temple
城|しろ|n|I|castle
銀行|ぎんこう|n|E|bank
ビル||n|E|building
プール||n|I|swimming pool
かばん||n|E|bag
畳|たたみ|n|I|tatami mat
ほうき||n|I|broom
バケツ||n|I|bucket
せっけん||n|I|soap
タオル||n|I|towel
歯ブラシ|はぶらし|n|I|toothbrush
やかん||n|I|kettle
カーテン||n|I|curtain
電話|でんわ|n|I|telephone
電気|でんき|n|I|electric light, electricity
電池|でんち|n|I|battery
ラジオ||n|F|radio
テレビ||n|I|television
冷蔵庫|れいぞうこ|n|I|refrigerator
ごみ||n|E|rubbish
包帯|ほうたい|n|I|bandage
指輪|ゆびわ|n|I|ring (finger)
ふすま||n|I|sliding door (paper)
ズボン||n|I|trousers
スカート||n|I|skirt
セーター||n|I|jumper, sweater
コート||n|I|coat
電車|でんしゃ|n|E|train
バス||n|E|bus
自転車|じてんしゃ|n|I|bicycle
飛行機|ひこうき|n|I|aeroplane
タクシー||n|I|taxi
ヨット||n|I|yacht
トラック||n|I|lorry, truck
消しゴム|けしごむ|n|I|eraser, rubber
葉書|はがき|n|I|postcard
図形|ずけい|n|I|geometric figure, shape
太鼓|たいこ|n|I|drum
ギター||n|I|guitar
琴|こと|n|I|koto (zither)
折り紙|おりがみ|n|I|origami paper
こま||n|I|spinning top
ボール||n|E|ball
ビー玉|びーだま|n|I|glass marble
おもちゃ||n|I|toy
ルビー||n|E|ruby (gem)
ルーレット||n|I|roulette wheel
リュック||n|I|rucksack
ゼリー||n|I|jelly (dessert)
`), 'shiritori');
})();
