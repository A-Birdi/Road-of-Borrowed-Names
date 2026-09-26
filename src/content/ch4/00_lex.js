/* Chapter 4 lexicon: words used in Snowbell's scenes, letters, challenges
 * and drills. Format: w|r|pos|lv|meaning|note|alt ; alt (see docs/CONTENT.md). */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const T = RB.lex.parseTable;
  RB.lex.add(T(`
# names and places
カンタ||name|F|Kanta (a name)
チヨ||name|F|Chiyo (a name)
ロクタ||name|F|Rokuta (a name)
テツジ||name|F|Tetsuji (a name)
フキ||name|F|Fuki (a name)
ヤエ||name|F|Yae (a name)
ソウスケ||name|F|Sousuke (a name)
サチ||name|F|Sachi (a name)
デンジ||name|F|Denji (a name)
ハヤテ||name|F|Hayate (a name)
ナツメ||name|F|Natsume (a name)
ホシノ||name|F|Hoshino (a family name)
アカリ||name|F|Akari (a name; also the word あかり, "light")
モモ||name|F|Momo (a goat's name)
ウシオ||name|F|Ushio (a name)
レン||name|F|Ren (a name)
ツル||name|F|Tsuru (a name)
ヒロ||name|F|Hiro (a name)
雪見屋|ゆきみや|name|E|Yukimiya (an inn: "snow-viewing house")
オリオン座|おりおんざ|n|I|Orion (the constellation)
# nature, weather, the hamlet
ヤギ||n|E|goat|Animal names are often written in katakana.|山羊
山羊|やぎ|n|I|goat
子ヤギ|こやぎ|n|E|kid (baby goat)
ヤギ小屋|やぎごや|n|E|goat shed
雪ギツネ|ゆきぎつね|n|I|snow fox
炎|ほのお|n|E|flame
灯|ひ|n|I|light, lamp (literary)|Also read あかり ("a light").
明かり|あかり|n|E|a light, lamp
雪明かり|ゆきあかり|n|A|snow-light (light reflected from snow)
初|はつ|pref|E|first (of the season or year): 初雪 first snow
初雪|はつゆき|n|E|first snow of the winter
秋風|あきかぜ|n|I|autumn wind
紅葉|もみじ|n|I|autumn leaves; maple|Also read こうよう (autumn colours).
見頃|みごろ|n|A|best time to see (flowers, leaves)
冷え込み|ひえこみ|n|A|sharp drop in temperature, cold snap
朝晩|あさばん|n|I|mornings and evenings
雪国|ゆきぐに|n|I|snow country
雪解け|ゆきどけ|n|I|thaw, melting of the snow
吹き溜まり|ふきだまり|n|A|snowdrift
雪像|せつぞう|n|I|snow sculpture
雪だるま|ゆきだるま|n|E|snowman
つらら||n|I|icicle|Also written 氷柱.
冷気|れいき|n|I|cold air, chill
凍傷|とうしょう|n|A|frostbite
湯気|ゆげ|n|I|steam
石段|いしだん|n|I|stone steps
坂道|さかみち|n|E|slope, hill road
斜面|しゃめん|n|A|slope, face (of a mountain)
一本道|いっぽんみち|n|I|a single road with no turnings
下り|くだり|n|I|the way down, downhill
上り|のぼり|n|I|the way up, ascent
上り下り|のぼりおり|n|I|going up and down
山々|やまやま|n|I|mountains
段々畑|だんだんばたけ|n|A|terraced fields
祠|ほこら|n|A|small wayside shrine
道標|みちしるべ|n|A|signpost, guidepost
里|さと|n|I|village, hamlet; one's home
家々|いえいえ|n|I|houses, each house
小枝|こえだ|n|I|twig
炭|すみ|n|I|charcoal
薪|まき|n|I|firewood
わら||n|I|straw
羊|ひつじ|n|E|sheep
蛾|が|n|I|moth
羽|はね|n|E|wing; feather
角|つの|n|I|horn (of an animal)
尻尾|しっぽ|n|E|tail
乳|ちち|n|I|milk (of an animal); breast
土星|どせい|n|I|Saturn
地平|ちへい|n|A|horizon
結晶|けっしょう|n|A|crystal (e.g. a snowflake)
# stars and the observatory
鼓星|つづみぼし|n|I|Tsuzumiboshi, a traditional Japanese name for Orion ("drum stars")
望遠鏡|ぼうえんきょう|n|I|telescope
天文学者|てんもんがくしゃ|n|I|astronomer
丸屋根|まるやね|n|I|dome, round roof
回廊|かいろう|n|A|gallery (running round a building)
日誌|にっし|n|I|log, journal
方角|ほうがく|n|I|direction, point of the compass
南東|なんとう|n|E|southeast
北東|ほくとう|n|E|northeast
南西|なんせい|n|E|southwest
北西|ほくせい|n|E|northwest
真南|まみなみ|n|I|due south
真下|ました|n|I|directly below
位置|いち|n|I|position
角度|かくど|n|I|angle
時刻|じこく|n|I|time (a point in time)
零時|れいじ|n|I|twelve o'clock (midnight)
七時|しちじ|n|E|seven o'clock|Also heard as ななじ.
八時|はちじ|n|E|eight o'clock
九時|くじ|n|E|nine o'clock
十時|じゅうじ|n|E|ten o'clock
五時|ごじ|n|E|five o'clock
十二時|じゅうにじ|n|E|twelve o'clock
正午|しょうご|n|I|noon
真夜中|まよなか|n|I|the middle of the night
盤|ばん|n|I|dial, face, board
針|はり|n|E|needle, hand (of a dial)
真鍮|しんちゅう|n|A|brass
筒|つつ|n|I|tube
鉄|てつ|n|I|iron
軸|じく|n|I|shaft, axle
蓋|ふた|n|E|lid, hatch
ハンドル||n|E|handle, crank
格子|こうし|n|I|grille, lattice
錠前|じょうまえ|n|A|padlock, lock
閂|かんぬき|n|A|bar, bolt (across a door)
梯子|はしご|n|I|ladder
天井|てんじょう|n|E|ceiling
柱|はしら|n|E|post, pillar
板|いた|n|E|board, plank
台|だい|n|I|stand, base
巻物|まきもの|n|A|scroll
余白|よはく|n|A|margin (of a page)
似顔絵|にがおえ|n|I|portrait sketch
笠|かさ|n|I|lampshade; conical hat
芯|しん|n|I|wick; core
油|あぶら|n|E|oil
火打ち石|ひうちいし|n|A|flint (for striking sparks)
火花|ひばな|n|I|spark
火鉢|ひばち|n|A|charcoal brazier
懐炉|かいろ|n|A|pocket warmer
覗き口|のぞきぐち|n|A|eyepiece, peephole
宮殿|きゅうでん|n|I|palace
# inn, food, home
囲炉裏|いろり|n|I|irori, a sunken hearth
鉄瓶|てつびん|n|A|iron kettle
甘酒|あまざけ|n|E|amazake (a sweet, usually non-alcoholic rice drink)
しょうが||n|E|ginger|Also written 生姜.
しょうが湯|しょうがゆ|n|E|hot ginger drink
湯|ゆ|n|E|hot water
ミルク||n|E|milk
チーズ||n|E|cheese
焼き餅|やきもち|n|I|grilled rice cake|Also means "jealousy" in another sense.
麹|こうじ|n|A|koji (rice malt)
品書き|しながき|n|A|menu (in a traditional eatery)
盆|ぼん|n|I|tray
お盆|おぼん|n|E|tray
湯呑み|ゆのみ|n|I|teacup (without a handle)
湯たんぽ|ゆたんぽ|n|I|hot-water bottle
奢り|おごり|n|I|a treat ("it's on me / on the house")
一口|ひとくち|n|E|a mouthful, a sip
多め|おおめ|n|I|a bit more (than usual)
ストーブ||n|E|stove, heater
将棋|しょうぎ|n|I|shogi (Japanese chess)
駒|こま|n|I|piece (in shogi)
枕|まくら|n|E|pillow
枕元|まくらもと|n|A|bedside
寝床|ねどこ|n|I|bed, sleeping place
寝間着|ねまき|n|I|nightclothes
寝息|ねいき|n|A|sound of breathing in sleep
毛布|もうふ|n|E|blanket
手袋|てぶくろ|n|E|gloves
マフラー||n|E|scarf (muffler)
手編み|てあみ|n|I|hand-knitted
衣装|いしょう|n|I|costume
外套|がいとう|n|A|overcoat, cloak
継ぎ接ぎ|つぎはぎ|n|A|patches, patchwork
袖|そで|n|I|sleeve
洗濯物|せんたくもの|n|E|laundry, washing
織り機|おりき|n|A|loom
模様|もよう|n|I|pattern
人形|にんぎょう|n|E|doll
お土産|おみやげ|n|E|present, souvenir
土産|みやげ|n|I|present, souvenir
缶|かん|n|E|can, tin
ブリキ||n|A|tinplate
シャベル||n|E|shovel
煙突|えんとつ|n|I|chimney
卓|たく|n|A|table (low)
腰掛け|こしかけ|n|A|seat, bench
# post and letters
宛名|あてな|n|I|address (on a letter)
宛て|あて|suf|I|addressed to (〜宛て)
差出人|さしだしにん|n|I|sender
消印|けしいん|n|A|postmark
集荷|しゅうか|n|A|collection (of mail or goods)
届け先|とどけさき|n|I|destination, delivery address
便り|たより|n|I|news, word (from someone); a letter
礼状|れいじょう|n|A|thank-you letter
申し込み|もうしこみ|n|I|proposal; application
帳面|ちょうめん|n|I|notebook (old-fashioned)
帳簿|ちょうぼ|n|I|account book, ledger
表紙|ひょうし|n|I|cover (of a book)
頁|ぺーじ|n|I|page|The kanji spelling of ページ.
日付|ひづけ|n|I|date
欄|らん|n|A|column, blank (on a form)
仕切り|しきり|n|A|partition, pigeonhole
束|たば|n|I|bundle
紐|ひも|n|I|string, cord
拝啓|はいけい|exp|I|Dear Sir/Madam (formal opening of a letter)|Paired with 敬具 at the end.
候|こう|n|A|season (in formal letters: 〜の候)
寒冷|かんれい|n|A|cold (climate)
折|おり|n|A|occasion, time (〜の折)
厳しき|きびしき|exp|A|severe (literary attributive of 厳しい)
ご自愛|ごじあい|exp|A|taking care of oneself (ご自愛ください: formal "please take care")
ご健勝|ごけんしょう|exp|A|(your) good health (formal)
くれぐれも||adv|A|earnestly, sincerely (in requests and wishes)
貴殿|きでん|pn|A|you (very formal, in letters)
当店|とうてん|n|A|our shop
ご贔屓|ごひいき|n|A|patronage, custom (as a regular)
毎度|まいど|n|I|every time; (毎度ありがとう) thank you as always
恐縮|きょうしゅく|n|A|feeling obliged or apologetic (formal)
次第|しだい|n|A|circumstances; (〜次第です) and so…
例年|れいねん|n|A|usual year; as in other years
仕入れ|しいれ|n|A|buying in stock
値上げ|ねあげ|n|I|price rise
値段|ねだん|n|E|price
代金|だいきん|n|I|payment, price
定価|ていか|n|A|list price, full price
評判|ひょうばん|n|I|reputation
指折り|ゆびおり|n|A|one of the very best
人気|にんき|n|E|popularity
倍|ばい|n|I|double, times
市|いち|n|I|market, fair
出稼ぎ|でかせぎ|n|A|seasonal work away from home
坊主|ぼうず|n|A|boy, lad (casual)
目当て|めあて|n|I|what one is after, aim
給金|きゅうきん|n|A|wages (old-fashioned)
申し訳|もうしわけ|n|I|excuse; (申し訳ありません) I am sorry
# people and roles
者|もの|n|I|person (written, slightly formal)
子|こ|n|E|child, kid
灯守|ひもり|n|I|lantern keeper (a fictional title in this story)
伯父|おじ|n|I|uncle (a parent's older brother)
姪|めい|n|I|niece
父親|ちちおや|n|I|father
母親|ははおや|n|I|mother
母子|ぼし|n|A|mother and child
双子|ふたご|n|I|twins
姉妹|しまい|n|I|sisters
夫婦|ふうふ|n|I|married couple
名字|みょうじ|n|I|family name
老人|ろうじん|n|I|old person
年寄り|としより|n|I|old person
じいちゃん||n|E|grandpa (casual)
じいさん||n|I|old man, grandad (casual)
お嬢ちゃん|おじょうちゃん|n|I|little miss (can sound patronising)
あんた||pn|I|you (casual)
あたし||pn|E|I (casual, mostly feminine)
やつ||n|I|guy, thing (casual)
奴|やつ|n|I|guy, thing (casual)
連中|れんちゅう|n|I|those folks, that lot (casual)
本人|ほんにん|n|I|the person themself
相手|あいて|n|E|the other person, partner
人間|にんげん|n|I|person, human being
人影|ひとかげ|n|I|figure of a person
迷子|まいご|n|E|a lost person (esp. a lost child)
大工|だいく|n|E|carpenter
親方|おやかた|n|I|master (of a craft)
見習い|みならい|n|I|apprentice
書記|しょき|n|A|clerk
薬師|くすし|n|I|apothecary, healer (old word)
審査員|しんさいん|n|I|judge (of a contest)
審査|しんさ|n|I|judging
持ち主|もちぬし|n|I|owner
新入り|しんいり|n|A|newcomer
酔っ払い|よっぱらい|n|I|drunk
鐘撞き|かねつき|n|I|bell-ringer
飼い|かい|suf|I|keeper, raiser (ヤギ飼い: goatherd)
精|せい|n|A|spirit (of nature)
# theatre
舞台|ぶたい|n|I|stage
幕|まく|n|I|curtain (of a stage); act
幕開け|まくあけ|n|A|curtain-up; opening
幕間|まくあい|n|A|interval between acts
終幕|しゅうまく|n|A|final curtain, end of a play
最終幕|さいしゅうまく|n|A|final act
四幕|よんまく|n|A|four acts
客席|きゃくせき|n|I|audience seats; the audience
最前列|さいぜんれつ|n|I|front row
主役|しゅやく|n|I|lead role
悪役|あくやく|n|I|villain's role
役|やく|n|I|role, part
役者|やくしゃ|n|I|actor
台本|だいほん|n|I|script (of a play)
台詞|せりふ|n|I|lines (in a play); a line
筋書き|すじがき|n|A|plot, storyline
場面|ばめん|n|I|scene
見せ場|みせば|n|A|highlight, big moment
出番|でばん|n|I|one's turn on stage, cue
一座|いちざ|n|I|troupe
座長|ざちょう|n|I|head of a troupe
開演|かいえん|n|A|start of a performance
公演|こうえん|n|I|performance
演目|えんもく|n|A|programme item, play performed
初舞台|はつぶたい|n|A|first appearance on stage
巡業|じゅんぎょう|n|A|touring (with performances)
照明|しょうめい|n|I|stage lighting
拍手|はくしゅ|n|E|applause
満員|まんいん|n|I|full (of a house or hall)
御礼|おんれい|n|A|thanks (満員御礼: "full house, thank you")
冥利|みょうり|n|A|blessing (〜冥利に尽きる: the ultimate honour for a …)
芸|げい|n|I|art, act (performing skill)
誇張|こちょう|n|A|exaggeration
お芝居|おしばい|n|I|a play, drama
登場|とうじょう|n|I|entrance (on stage), appearance
コンテスト||n|E|contest
赤字|あかじ|n|I|deficit, being in the red
決算|けっさん|n|A|settlement of accounts
誤差|ごさ|n|A|discrepancy (in figures)
# abstract nouns
先|さき|n|E|ahead; the tip; (先に) first, in advance
数|かず|n|E|number, count
形|かたち|n|E|shape, form
背|せ|n|E|height; back
裏|うら|n|E|back, reverse side; behind
奥|おく|n|I|the back, the inner part
内|うち|n|I|inside, within
内側|うちがわ|n|I|inside
側|がわ|n|I|side (〜側)
脇|わき|n|I|side; beside
隅|すみ|n|I|corner
底|そこ|n|I|bottom
縁|ふち|n|I|rim, edge
縦|たて|n|I|vertical, lengthways
点|てん|n|I|point, dot
輪|わ|n|E|ring, circle
縞|しま|n|I|stripe
跡|あと|n|I|trace, mark
穴|あな|n|E|hole
隙間|すきま|n|I|gap
罅|ひび|n|A|crack
傷|きず|n|E|wound; scratch, notch
一面|いちめん|n|I|the whole surface
中央|ちゅうおう|n|I|centre
真ん中|まんなか|n|E|the middle
半分|はんぶん|n|E|half
一部|いちぶ|n|I|a part, a portion
片方|かたほう|n|I|one of the two
手前|てまえ|n|I|just before, this side of
足元|あしもと|n|I|at one's feet; footing
足音|あしおと|n|E|footsteps
足跡|あしあと|n|I|footprint
辺り|あたり|n|I|vicinity, around
周り|まわり|n|E|around, surroundings
そば||n|E|beside, near
場|ば|n|I|place, spot; occasion
場合|ばあい|n|I|case, situation
範囲|はんい|n|I|range, extent
方法|ほうほう|n|E|way, method
目印|めじるし|n|I|landmark, a mark to go by
近道|ちかみち|n|E|shortcut
合図|あいず|n|I|signal
順番|じゅんばん|n|E|order, turn
番号|ばんごう|n|E|number
種類|しゅるい|n|I|kind, type
例|れい|n|I|example
逆|ぎゃく|n|I|the reverse, the opposite
元|もと|n|I|former; origin
以上|いじょう|n|I|more than; (これ以上) any more
以外|いがい|n|I|except, other than
代わり|かわり|n|E|substitute; instead
予備|よび|n|I|spare
抜き|ぬき|n|I|leaving out, without
用|よう|n|I|business, errand
支度|したく|n|I|preparations
一休み|ひとやすみ|n|I|a short rest
休憩|きゅうけい|n|I|break, rest
後半|こうはん|n|I|second half
一周|いっしゅう|n|I|going all the way round
往復|おうふく|n|I|round trip
割|わり|n|I|rate (割がいい: it pays well)
価値|かち|n|I|value, worth
中身|なかみ|n|I|contents
知恵|ちえ|n|I|wisdom; a clever trick
心得|こころえ|n|A|rules, precepts
主義|しゅぎ|n|I|principle, rule (one lives by)
第一条|だいいちじょう|n|A|article one; rule number one
習慣|しゅうかん|n|I|habit, custom
癖|くせ|n|I|habit
くせ||n|I|(〜くせに) even though (critical); habit
才能|さいのう|n|I|talent
自慢|じまん|n|I|pride, boast
誇り|ほこり|n|I|pride
義理|ぎり|n|A|obligation
説教|せっきょう|n|I|lecture, sermon
解説|かいせつ|n|I|explanation
違反|いはん|n|I|violation, breach
失格|しっかく|n|I|disqualification; failure (as…)
禁止|きんし|n|I|prohibition
事項|じこう|n|A|matter, item
文句|もんく|n|I|complaint
格好|かっこう|n|I|appearance; (格好いい) cool
陰|かげ|n|I|shade; behind, in the shadow of
宝|たから|n|I|treasure
仕業|しわざ|n|A|someone's doing (usually bad)
予感|よかん|n|I|premonition, feeling
心当たり|こころあたり|n|I|an idea (of who or what)
執念|しゅうねん|n|A|tenacity, obsession
証|あかし|n|A|proof, sign
裁き|さばき|n|A|judgement, trial
慶事|けいじ|n|A|happy event (formal)
出産|しゅっさん|n|I|giving birth
作品|さくひん|n|I|work (of art)
現物|げんぶつ|n|A|the actual article
照合|しょうごう|vs|A|checking against, collation
分野|ぶんや|n|I|field, area (of expertise)
基本|きほん|n|I|basics
像|ぞう|n|I|statue, figure
図|ず|n|I|diagram, drawing
身|み|n|I|body; oneself (身にしみる: to go through one)
腰|こし|n|I|lower back, hips
腹|はら|n|I|belly; (腹が立つ) to get angry
膝|ひざ|n|E|knee
唇|くちびる|n|I|lips
指先|ゆびさき|n|I|fingertips
背骨|せぼね|n|I|backbone
脂|あぶら|n|A|grease (from skin)
顔色|かおいろ|n|I|complexion
匂い|におい|n|I|smell
一瞬|いっしゅん|n|I|an instant
一晩|ひとばん|n|E|one night
三晩|みばん|n|I|three nights
半日|はんにち|n|E|half a day
毎月|まいつき|n|E|every month
毎年|まいとし|n|E|every year
毎回|まいかい|n|E|every time
今回|こんかい|n|E|this time
近頃|ちかごろ|n|I|lately, these days
頃|ころ|n|E|time; around (a time)
半ば|なかば|n|I|middle; halfway
本日|ほんじつ|n|I|today (formal)
永遠|えいえん|n|I|eternity (永遠に: forever)
七年前|しちねんまえ|n|E|seven years ago
十日分|とおかぶん|n|I|ten days' worth
問い|とい|n|I|question
名無し|ななし|n|I|nameless
名指し|なざし|n|A|naming (someone specifically)
一字|いちじ|n|I|one character
一句|いっく|n|A|one phrase (一字一句: every word)
一段|いちだん|n|I|one step
段|だん|n|I|step, row, tier
一声|ひとこえ|n|I|one cry, one call
一回|いっかい|n|E|once, one time
二回目|にかいめ|n|E|the second time
一番目|いちばんめ|n|E|first (in order)
二番目|にばんめ|n|E|second (in order)
何番目|なんばんめ|n|E|which (in order)
三十二番目|さんじゅうにばんめ|n|I|thirty-second
一番上|いちばんうえ|n|E|the very top
十二|じゅうに|n|E|twelve
十五|じゅうご|n|E|fifteen
三十一|さんじゅういち|n|E|thirty-one
三十二|さんじゅうに|n|E|thirty-two
八百|はっぴゃく|n|E|eight hundred
何百枚|なんびゃくまい|n|I|hundreds (of sheets)
何十枚|なんじゅうまい|n|I|dozens (of sheets)
二組|ふたくみ|n|E|two pairs, two sets
三組|さんくみ|n|E|three pairs, three sets
第四章|だいよんしょう|n|E|chapter four
甲斐|かい|n|I|worth, point (話した甲斐がある: it was worth telling)
甲斐|がい|suf|I|worth (doing): 笑わせ甲斐 (worth making laugh)
向け|むけ|suf|I|for, aimed at (子ども向け: for children)
付き|つき|suf|I|with, attached (見張り付き: under watch)
気味|ぎみ|suf|I|a touch of (かぜ気味: a bit of a cold)
同士|どうし|suf|I|fellow, among (友達同士: between friends)
どおり||suf|I|as, in accordance with (〜どおり)
ごろ||suf|E|about, around (a point in time)
だらけ||suf|I|covered in, full of (something unwanted)
ぶり||suf|I|for the first time in (a period): 十日ぶり
約|やく|pref|I|about, approximately
# adjectives
真っ白|まっしろ|adj-na|E|pure white; completely blank
真っ白い|まっしろい|adj-i|E|pure white
青白い|あおじろい|adj-i|I|pale, bluish white
黄色|きいろ|n|E|yellow
橙|だいだい|n|A|orange (colour)
真っ直ぐ|まっすぐ|adj-na|E|straight
急|きゅう|adj-na|E|sudden; urgent (急に: suddenly)
無駄|むだ|adj-na|E|useless, a waste
最高|さいこう|adj-na|E|the best; wonderful
最悪|さいあく|adj-na|I|the worst
久しぶり|ひさしぶり|adj-na|E|(for the first time) in a long while
欲張り|よくばり|adj-na|I|greedy
愚か|おろか|adj-na|A|foolish
公平|こうへい|adj-na|I|fair
意地悪|いじわる|adj-na|I|spiteful, mean
勝手|かって|adj-na|I|as one pleases; (勝手に) on its own
粗末|そまつ|adj-na|A|careless (自分を粗末にする: to neglect oneself)
健気|けなげ|adj-na|A|admirable (of the small or weak), brave
貴重|きちょう|adj-na|I|precious
優秀|ゆうしゅう|adj-na|I|excellent
感傷的|かんしょうてき|adj-na|A|sentimental
実用的|じつようてき|adj-na|A|practical
誇らしげ|ほこらしげ|adj-na|A|proud, with a proud air
丈夫|じょうぶ|adj-na|E|strong, sturdy
めちゃくちゃ||adj-na|I|a complete mess
ふかふか||adj-na|I|soft and fluffy
悔しい|くやしい|adj-i|I|frustrating, galling
見苦しい|みぐるしい|adj-i|A|unsightly, unseemly
平たい|ひらたい|adj-i|I|flat
分厚い|ぶあつい|adj-i|I|thick
心強い|こころづよい|adj-i|I|reassuring
おかしい||adj-i|E|strange; funny
うらやましい||adj-i|I|envious; lucky (them)
ありがたい||adj-i|I|grateful, welcome
かっこいい||adj-ii|E|cool, good-looking
無い|ない|adj-i|E|there is no; not
# adverbs and expressions
初めて|はじめて|adv|E|for the first time
特に|とくに|adv|E|especially
結局|けっきょく|adv|I|in the end
本来|ほんらい|adv|I|by nature, originally
改めて|あらためて|adv|I|once more; formally
強いて|しいて|adv|A|if forced (強いて言えば: if I had to say)
とっくに||adv|I|long ago, already
うっすら||adv|I|faintly, thinly
すっぽり||adv|I|completely (covered)
びくとも||adv|I|(not) budge an inch (with a negative)
すっと||adv|I|smoothly; (feel) suddenly lighter
すうっ||adv|I|quietly, smoothly (fading away)
ゆらり||adv|I|swaying gently
ふらふら||adv|I|unsteadily
きっちり||adv|I|properly, precisely
よっぽど||adv|I|much more, a great deal
ぱちぱち||adv|E|crackle (of a fire)
ぱりん||adv|I|snap, crack (of breaking ice or glass)
一斉|いっせい|n|I|all at once (一斉に)
一緒|いっしょ|n|E|together
お互い|おたがい|n|I|each other
互い|たがい|n|I|each other
偶然|ぐうぜん|n|I|chance, coincidence
真似|まね|n|I|imitation
真似事|まねごと|n|A|imitation, playing at
無茶|むちゃ|n|I|unreasonable, absurd
内緒|ないしょ|n|E|secret
馬鹿|ばか|n|E|fool
悪趣味|あくしゅみ|n|A|bad taste
大成功|だいせいこう|n|I|great success
大騒ぎ|おおさわぎ|n|I|uproar
大笑い|おおわらい|n|I|a big laugh
長生き|ながいき|n|I|long life
大水|おおみず|n|I|flood
世間|せけん|n|I|the world, society
優勝|ゆうしょう|n|I|winning (a contest)
募集|ぼしゅう|n|I|recruiting; wanted (募集中)
夜更かし|よふかし|n|I|staying up late
心配性|しんぱいしょう|n|I|a worrier (by nature)
怖がり|こわがり|n|I|a timid person
心遣い|こころづかい|n|A|consideration, thoughtfulness
足止め|あしどめ|n|A|being held up, stranded
好み|このみ|n|I|taste, preference
誕生日|たんじょうび|n|E|birthday
落書き|らくがき|n|I|scribble, doodle
掲示板|けいじばん|n|I|noticeboard
ゴマ||n|E|sesame (開けゴマ: open sesame)
非ず|あらず|exp|A|is not (literary; = ではない)
然り|しかり|exp|A|it is so (literary)
以て|もって|exp|A|by means of (〜を以て)
しかるのち||conj|A|thereafter (formal, literary)
べし||aux|A|should, must (classical; in instructions)
ご覧|ごらん|exp|I|look (見てごらん: have a look)
いかん||exp|I|won't do; (〜ないといかん) must (casual, older speech)
ほか||n|I|other; (〜ほかない) there is no choice but
べき||aux|I|should, ought to (〜べき)
せい||n|I|fault, cause (〜のせい: because of, the fault of)
ころ||n|E|time, around (a time)
なんて||prt|I|such a thing as; (surprise) how…
だろ||aux|E|…, right? (casual だろう)
でしょ||aux|E|…, right? (casual でしょう)
ん||aux|E|(explanatory) contraction of の in 〜んです / 〜んだ
んで||conj|I|so, because (casual ので)
んだろ||exp|I|…, right? (casual, explanatory)
んでしょう||exp|I|…, isn't it? (explanatory ん + でしょう)
んでした||exp|I|it was that… (explanatory, polite past)
さ||prt|I|sentence ending: casual, offhand assertion
ぜ||prt|I|sentence ending: rough emphasis
なあ||prt|E|sentence ending: musing or seeking agreement (casual)
あ||int|F|oh!, ah!
やあ||int|E|hi, hello
あはは||int|E|ha ha
カン||int|E|clang (of a bell)
ごーん||int|E|bong (the toll of a big bell)
ごほっ||int|E|koff (a cough)
ふぁ||int|E|(a yawn)
ぐう||int|E|zzz (snoring)
メェ||int|F|baa (a goat's cry)
さむっ||int|E|brr! (casual, from 寒い)
くっそー||int|I|drat! (rough)
昨夜|ゆうべ|n|E|last night|Also read さくや (more formal).
本物|ほんもの|n|E|the real thing
建物|たてもの|n|E|building
熱|ねつ|n|E|heat; fever
軟膏|なんこう|n|I|ointment, salve
駄洒落|だじゃれ|n|I|pun
席|せき|n|E|seat
全員|ぜんいん|n|E|everyone, all members
具合|ぐあい|n|I|condition, state (of health)
固定|こてい|vs|I|fixing in place
懐|ふところ|n|A|inside the front of one's kimono or coat
訂正|ていせい|vs|I|correction
追加|ついか|vs|I|addition
勘弁|かんべん|n|A|pardon (勘弁して: go easy on me, forgive me)
商売|しょうばい|n|I|business, trade
引退|いんたい|vs|I|retirement
瞬き|まばたき|n|I|blink, twinkle
先回り|さきまわり|n|A|getting there first, anticipating
夕|ゆう|n|I|evening (written)
水たまり|みずたまり|n|E|puddle
これら||pn|I|these
別|べつ|adj-na|E|separate, different
代|だい|n|I|charge, cost (〜代: the cost of…)
# verbs
上る|のぼる|v5r|E|to climb, go up (stairs, a slope); to rise
上り切る|のぼりきる|v5r|I|to climb all the way to the top
下る|くだる|v5r|E|to go down (a slope, a mountain)
下りる|おりる|v1|E|to come down, go down; (of a curtain) to fall
教わる|おそわる|v5r|I|to be taught (by), learn from
温める|あたためる|v1|E|to warm (something) up
温まる|あたたまる|v5r|E|to warm up, get warm
温まる|あったまる|v5r|E|to warm up (colloquial)
折れる|おれる|v1|E|to snap, break
色づく|いろづく|v5k|I|to take on colour (of autumn leaves)
崩す|くずす|v5s|I|to break down, knock down
詰まる|つまる|v5r|I|to be packed, blocked
這う|はう|v5u|I|to crawl, creep
傷つける|きずつける|v1|I|to hurt, injure
寝込む|ねこむ|v5m|I|to be laid up in bed
透かす|すかす|v5s|A|to hold up to the light
透ける|すける|v1|A|to show through
敷く|しく|v5k|I|to lay out (a futon)
書き込む|かきこむ|v5m|I|to write in, fill in
唱える|となえる|v1|A|to recite, chant
伸ばす|のばす|v5s|I|to reach out, stretch
測る|はかる|v5r|I|to measure
外す|はずす|v5s|I|to take off, undo, lift (a bar)
向く|むく|v5k|E|to face, turn toward
向ける|むける|v1|I|to point, turn (something) toward
向け直す|むけなおす|v5s|A|to turn (something) back toward
産む|うむ|v5m|I|to give birth
積もる|つもる|v5r|I|to pile up (of snow)
積もり積もる|つもりつもる|v5r|A|to pile up and up
閉ざす|とざす|v5s|A|to shut, close off
供える|そなえる|v1|A|to offer (at a shrine)
埋もれる|うもれる|v1|A|to be buried
掘る|ほる|v5r|I|to dig
凍える|こごえる|v1|I|to be chilled to the bone
通じる|つうじる|v1|I|to lead to, be open (to)
滑る|すべる|v5r|E|to slip, slide
寄り添う|よりそう|v5u|A|to huddle together
吊るす|つるす|v5s|I|to hang (something) up
割れる|われる|v1|I|to crack, break
現れる|あらわれる|v1|I|to appear
欠かす|かかす|v5s|I|to miss, fail to do (with negative: never miss)
抜ける|ぬける|v1|I|to come out, drop out, slip through
抜け落ちる|ぬけおちる|v1|A|to fall out, drop out
抜く|ぬく|v5k|I|to leave out, skip; to pull out
転がる|ころがる|v5r|I|to roll
通す|とおす|v5s|I|to let through; (風を通す) to air (a room)
吹き込む|ふきこむ|v5m|I|to blow in
回る|まわる|v5r|E|to turn, go round
回り切る|まわりきる|v5r|I|to turn all the way
慌てる|あわてる|v1|I|to panic, be flustered
放る|ほうる|v5r|I|to throw; (放っておく) to leave alone
くっつく||v5k|I|to stick to, cling
食べ損ねる|たべそこねる|v1|A|to miss (a meal)
澄む|すむ|v5m|I|to be clear (of sound, water)
広がる|ひろがる|v5r|I|to spread
広げる|ひろげる|v1|I|to spread out, open out
治る|なおる|v5r|E|to get better, heal
含める|ふくめる|v1|I|to include
織る|おる|v5r|I|to weave
畳む|たたむ|v5m|I|to fold
折り畳む|おりたたむ|v5m|I|to fold up
襲う|おそう|v5u|I|to attack
襲いかかる|おそいかかる|v5r|I|to fall upon, attack
逸らす|そらす|v5s|I|to avert (one's eyes)
解く|ほどく|v5k|I|to untie
奪う|うばう|v5u|I|to take away, rob
急かす|せかす|v5s|A|to hurry (someone)
握る|にぎる|v5r|I|to grip, grasp
束ねる|たばねる|v1|I|to bundle, tie together
載せる|のせる|v1|I|to put on (a tray etc.)
載る|のる|v5r|I|to be placed on
しがみつく||v5k|I|to cling to
足す|たす|v5s|E|to add
すり切れる|すりきれる|v1|A|to wear through
間違う|まちがう|v5u|E|to be mistaken, go wrong
好く|すく|v5k|I|to like (好かれる: to be liked)
散らかる|ちらかる|v5r|I|to be messy
締まる|しまる|v5r|I|to close (帳簿が締まる: the books close)
欠ける|かける|v1|I|to be missing, chipped
折り返す|おりかえす|v5s|A|to turn back, zigzag
化かす|ばかす|v5s|A|to bewitch, trick (as foxes do in stories)
騙す|だます|v5s|I|to deceive
薄れる|うすれる|v1|I|to fade
塞ぐ|ふさぐ|v5g|I|to block
擦り合わせる|こすりあわせる|v1|A|to rub together
慣らす|ならす|v5s|I|to accustom
覆う|おおう|v5u|I|to cover
気取る|きどる|v5r|I|to put on airs
提げる|さげる|v1|I|to carry (hanging from the hand)
細める|ほそめる|v1|I|to narrow (one's eyes)
離す|はなす|v5s|I|to hold away, separate
透き通る|すきとおる|v5r|I|to be clear, transparent
演じる|えんじる|v1|I|to perform, play (a role)
切らす|きらす|v5s|I|to run out of (息を切らす: to be out of breath)
辿る|たどる|v5r|I|to follow (a trail)
滲む|にじむ|v5m|I|to blur, run (of ink)
宿る|やどる|v5r|A|to dwell (in), reside
添える|そえる|v1|A|to add (to), accompany
空ける|あける|v1|I|to leave empty or blank
暮れる|くれる|v1|I|to grow dark (日が暮れる)
尽きる|つきる|v1|A|to run out; (冥利に尽きる) to be the ultimate…
留める|とめる|v1|I|to pin, fasten
寝そべる|ねそべる|v5r|A|to lie sprawled
脅す|おどす|v5s|I|to threaten, scare
見分ける|みわける|v1|I|to tell apart
押さえつける|おさえつける|v1|A|to press down, hold down
凍て付く|いてつく|v5k|A|to freeze solid
凍てつく|いてつく|v5k|A|to freeze solid
抗う|あらがう|v5u|A|to resist
絶やす|たやす|v5s|A|to let (something) die out
込める|こめる|v1|I|to put (feeling, meaning) into
依る|よる|v5r|A|to depend on, rest on
よる||v5r|I|to depend on; (〜によれば) according to
産気づく|さんけづく|v5k|A|to go into labour
告げる|つげる|v1|A|to announce, tell
当たる|あたる|v5r|E|to hit; (火に当たる) to warm oneself at a fire
蹴る|ける|v5r|I|to kick
跳びかかる|とびかかる|v5r|I|to spring at, pounce
走り去る|はしりさる|v5r|I|to run off
立ち上る|たちのぼる|v5r|A|to rise (of smoke, steam)
揺らす|ゆらす|v5s|I|to sway, swing
撒く|まく|v5k|I|to scatter
寄り集まる|よりあつまる|v5r|A|to gather together
外れる|はずれる|v1|I|to come off
待ちくたびれる|まちくたびれる|v1|A|to be worn out from waiting
顧みる|かえりみる|v1|A|to heed, pay regard to
蝕む|むしばむ|v5m|A|to eat away at
成り立つ|なりたつ|v5t|A|to hold, stand (as valid)
報われる|むくわれる|v1|A|to be rewarded, repaid
手放す|てばなす|v5s|A|to let go of, give up
構う|かまう|v5u|I|to mind (構いません: it's no trouble)
搾る|しぼる|v5r|I|to milk, squeeze
勧める|すすめる|v1|I|to recommend, offer
食う|くう|v5u|I|to eat (rough)
名乗り出る|なのりでる|v1|A|to come forward (to claim something)
照れる|てれる|v1|I|to be bashful, embarrassed
堪える|こたえる|v1|A|to hit hard, hurt (emotionally)
役に立つ|やくにたつ|v5t|E|to be useful
かざす||v5s|A|to hold up (a hand) over
`), 'ch4');
  // Fictional place names used in Snowbell's dialogue.
  RB.lex.add([
    { w: '雪鈴', r: 'ゆきすず', pos: 'name', lv: 'E', m: 'Snowbell (a mountain hamlet; fictional place name)', fic: true },
    { w: '灯落', r: 'ひおち', pos: 'name', lv: 'E', m: 'Lanternfall (a town; fictional place name)', fic: true },
    { w: '灰実', r: 'はいみ', pos: 'name', lv: 'E', m: 'Haimi, as in 灰実の里 (Cinder Orchard; fictional place name)', fic: true },
    { w: '葦ノ瀬', r: 'あしのせ', pos: 'name', lv: 'E', m: 'Ashinose (Reedwake; fictional place name)', fic: true },
    { w: '灯り堂', r: 'あかりどう', pos: 'n', lv: 'E', m: 'the Lantern Hall (a building in Reedwake)' },
    { w: '星図蛾', r: 'せいずが', pos: 'n', lv: 'A', m: 'chart moth (a fictional creature: 星図 star chart + 蛾 moth)', fic: true },
  ], 'ch4');
})();
