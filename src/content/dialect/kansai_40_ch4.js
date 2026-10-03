/* Suzu's Kansai-ben: Chapter 4 — Snowbell.
 * Format and rules: src/lang/85_dialect.js, docs/dialect/suzu_kansai.md.
 * "=" the standard line as authored (the key: its Japanese); ">" the Kansai version. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.dialect.add('kansai', `
@ ch4/arrive:14 [sb.arrive]
= さあ さあ 、 {雪|ゆき} の {舞台|ぶたい} の {幕開|まくあ}け だよ ！ …… さむっ 。 {客席|きゃくせき} に {火鉢|ひばち} を ください 。 || Roll up, roll up — the curtain rises on the snow stage! …Brr. Braziers for the audience, please.
> さあ さあ 、 {雪|ゆき} の {舞台|ぶたい} の {幕開|まくあ}け や で ！ …… さむっ 。 {客席|きゃくせき} に {火鉢|ひばち} ちょうだい 。 || Roll up, roll up — the curtain rises on the snow stage! …Brr. Braziers for the audience, please.
@ ch4/arrive:15 [sb.arrive]
= {昔|むかし} 、 {一座|いちざ} で {一度|いちど} だけ {来|き}た こと が ある んだ 。 {鐘|かね} の {音|おと} が 、 やけに きれい な {村|むら} だった 。 || I came here once with the troupe, years ago. A village where the bell sounded ridiculously clear.
> {昔|むかし} 、 {一座|いちざ} で いっぺん だけ {来|き}た こと ある ねん 。 {鐘|かね} の {音|おと} が 、 えらい きれい な {村|むら} やった 。 || I came here once with the troupe, years back. A village where the bell sounded awful pretty.
@ ch4/road:9 [sb.road_marker]
= {舞台|ぶたい} でも {同|おな}じ だよ 。 {迷|まよ}ったら 、 {音|おと} の する ほう へ 。 || Same on stage. When you're lost, go toward the sound.
> {舞台|ぶたい} でも {一緒|いっしょ} や で 。 {迷|まよ}ったら 、 {音|おと} の する ほう へ 。 || Same on stage. When you're lost, head for the sound.
@ ch4/road:20 [sb.road_east_locked]
= {幕|まく} が {下|お}りてる ね 。 {次|つぎ} の {幕|まく} は 、 {上|うえ} の {村|むら} から だ 。 || The curtain's down on that one. The next act starts in the village up the hill.
> {幕|まく} が {下|お}りてる な 。 {次|つぎ} の {幕|まく} は 、 {上|うえ} の {村|むら} から や 。 || The curtain's down on that one. The next act starts in the village up the hill.
@ ch4/hamlet:12 [sb.hamlet_first]
= {主役|しゅやく} の いない {舞台|ぶたい} みたい だ ね 。 よし 、 {宿|やど} で {筋書|すじが}き を {聞|き}こう 。 || Like a stage with no lead. Right — let's get the plot at the inn.
> {主役|しゅやく} の いてへん {舞台|ぶたい} みたい や な 。 よっしゃ 、 {宿|やど} で {筋書|すじが}き {聞|き}こ 。 || Like a stage with no lead. Right then — let's go get the plot at the inn.
@ ch4/hamlet:47 [sb.stair_ice]
= {扉|とびら} の {鍵|かぎ} は ホシノ さん が {持|も}って いる はず です 。 {先|さき} に {話|はなし} を {聞|き}きましょう 。 || Hoshino should have the key to the door. Let's talk to him first.
> {扉|とびら} の {鍵|かぎ} は ホシノ さん が {持|も}ってはる はず や 。 {先|さき} に {話|はなし} {聞|き}こ 。 || Hoshino oughta have the key to that door. Let's go talk to him first.
@ ch4/hamlet:60 [sb.stair_ice]
= {拍手|はくしゅ} ！ {氷|こおり} の {幕|まく} が {上|あ}がった よ 。 || Applause! The ice curtain rises.
> {拍手|はくしゅ} ！ {氷|こおり} の {幕|まく} が {上|あ}がった で 。 || Applause! The ice curtain rises.
@ ch4/residents-inn:16 [sb.yae]
= {台本|だいほん} の {数字|すうじ} だけ 、 {誰|だれ} か が {消|け}した みたい 。 || As if someone rubbed out just the numbers in the script.
> {台本|だいほん} の {数字|すうじ} だけ 、 {誰|だれ} か が {消|け}した みたい や 。 || Like somebody rubbed out just the numbers in the script.
@ ch4/residents-inn:69 [sb.inn_menu]
= 「 ツケ は {春|はる} まで 」 。 …… {正直|しょうじき} な {店|みせ} だ 。 {気|き}に {入|い}った 。 あたし は {今|いま} {払|はら}う けど 。 || "Tabs settled in spring." …An honest shop. I like it. I'll pay now, though.
> 「 ツケ は {春|はる} まで 」 。 …… {正直|しょうじき} な {店|みせ} や 。 {気|き}に {入|い}った わ 。 うち は {今|いま} {払|はら}う けど な 。 || "Tabs settled in spring." …An honest shop. I like it. I'll pay now, though.
@ ch4/residents-tetsuji:12 [sb.tetsuji]
= {増|ふ}えた ほう で {困|こま}る って 、 {珍|めずら}しい {悩|なや}み だ ね 。 {帳簿|ちょうぼ} が {合|あ}わない の は 、 あたし も {嫌|きら}い だけど 。 || Troubled because you've got more — that's a rare kind of worry. Mind you, I hate books that don't balance too.
> {増|ふ}えた ほう で {困|こま}る って 、 {珍|めずら}しい {悩|なや}み や な 。 {帳簿|ちょうぼ} が {合|あ}わへん の は 、 うち も {嫌|きら}い や けど 。 || Troubled 'cause you've got more — now that's a rare kind of worry. Mind you, I hate books that don't balance too.
@ ch4/residents-fuki:66 [sb.bellpost]
= {一|ひと}つ は {朝|あさ} の {合図|あいず} だった みたい だ よ 。 {帳面|ちょうめん} を {思|おも}い{出|だ}そう 。 || One stroke seems to have been the morning signal. Let's remember the notebook.
> {一|ひと}つ は {朝|あさ} の {合図|あいず} やった みたい や で 。 {帳面|ちょうめん} を {思|おも}い{出|だ}そ 。 || One stroke was the morning signal, looks like. Let's remember the notebook.
@ ch4/residents-fuki:71 [sb.bellpost]
= {三|みっ}つ は {夕方|ゆうがた} の ヤギ の {合図|あいず} だ ね 。 {今|いま} は {昼|ひる} だ よ 。 || Three is the evening goat signal. It's noon now.
> {三|みっ}つ は {夕方|ゆうがた} の ヤギ の {合図|あいず} や な 。 {今|いま} は {昼|ひる} や で 。 || Three's the evening goat signal. It's noon right now.
@ ch4/residents-fuki:76 [sb.bellpost]
= …… {吹雪|ふぶき} の {合図|あいず} だ よ 、 それ 。 みんな に {謝|あやま}り に {行|い}かない と 。 || …That's the storm signal. We'll have to go round and apologise to everyone.
> …… {吹雪|ふぶき} の {合図|あいず} や で 、 それ 。 みんな に {謝|あやま}り に {行|い}かな あかん わ 。 || …That's the storm signal, that is. We'll have to go round and say sorry to everybody.
@ ch4/residents-fuki:86 [sb.bellpost]
= {開演|かいえん} の {合図|あいず} みたい ！ …… {昼|ひる} ごはん と いう {名|な} の {演目|えんもく} の ね 。 || Like the call to curtain! …For a show called "Lunch".
> {開演|かいえん} の {合図|あいず} みたい ！ …… {昼|ひる} ごはん って いう {名|な} の {演目|えんもく} の な 。 || Like the call to curtain! …For a show called "Lunch".
@ ch4/residents-children:11 [sb.kanta]
= {審査員|しんさいん} ！ いい {響|ひび}き 。 {公平|こうへい} に 、 でも {愛|あい} を もって ね 。 || Judge! Has a nice ring. Fair — but with love.
> {審査員|しんさいん} ！ ええ {響|ひび}き や 。 {公平|こうへい} に 、 せやけど {愛|あい} を もって な 。 || Judge! Has a nice ring to it. Fair — but with love.
@ ch4/residents-children:82 [sb.rokuta]
= ずるく ない よ 。 それ を {世間|せけん} で は 「 {正直|しょうじき} 」 って {言|い}う の 。 || Not cheating. Out in the world, they call that "honesty".
> ずるく ない で 。 それ を {世間|せけん} で は 「 {正直|しょうじき} 」 って {言|い}う ねん 。 || That ain't cheating. Out in the world, folks call that "honesty".
@ ch4/cameo-goats:22 [sb.goat]
= {衣装|いしょう} を {食|た}べる の は やめて ！ {昔|むかし} 、 それ で {幕|まく} を {一枚|いちまい} {失|うしな}った んだ から ！ || Don't eat the costume! I lost a whole curtain to one of you once!
> {衣装|いしょう} {食|た}べる の は やめて ！ {昔|むかし} 、 それ で {幕|まく} を {一枚|いちまい} {失|うしな}ってん から ！ || Quit eating the costume! I lost a whole curtain to one of you once!
@ ch4/main-hoshino:24 [sb.hoshino]
= {返事|へんじ} が {来|こ}ない の と 、 {出|だ}した {手紙|てがみ} が {帰|かえ}って くる の 。 どっち が {堪|こた}える かな 。 …… {後|あと} の ほう だ ね 。 || No reply, or your own letter coming home. Which hurts more? …The second.
> {返事|へんじ} が けえへん の と 、 {出|だ}した {手紙|てがみ} が {帰|かえ}って くる の 。 どっち が {堪|こた}える やろ 。 …… {後|あと} の ほう や な 。 || No reply, or your own letter coming home. Which hurts worse? …The second.
@ ch4/main-hoshino:52 [sb.hoshino]
= {約束|やくそく} を {破|やぶ}る の と 、 {約束|やくそく} を {盗|ぬす}まれる の は 、 ぜんぜん {違|ちが}う よ 。 {客席|きゃくせき} から {見|み}て も 、 ね 。 || Breaking a promise and having one stolen are completely different. Anyone in the audience could tell you.
> {約束|やくそく} を {破|やぶ}る の と 、 {約束|やくそく} を {盗|ぬす}まれる の は 、 ぜんぜん ちゃう で 。 {客席|きゃくせき} から {見|み}て も な 。 || Breaking a promise and having one stolen are two whole different things. Anybody in the audience could tell you that.
@ ch4/main-hoshino:67 [sb.hoshino]
= $name 、 {鐘|かね} の {決|き}まり 、 {覚|おぼ}えてる よね ？ {行|い}こう ！ || $name, you remember the bell rules, right? Let's go!
> $name 、 {鐘|かね} の {決|き}まり 、 {覚|おぼ}えてる やろ ？ {行|い}こ ！ || $name, you remember the bell rules, right? Let's go!
@ ch4/main-hoshino:93 [sb.hoshino]
= {満員|まんいん} {御礼|おんれい} ！ …… って 、 {言|い}ってる {場合|ばあい} じゃ ない か 。 {走|はし}ろう ！ || A full house! …Not really the time, is it. Run!
> {満員|まんいん} {御礼|おんれい} ！ …… って 、 {言|い}うてる {場合|ばあい} ちゃう か 。 {走|はし}ろ ！ || A full house! …Not really the time, huh. Run!
@ ch4/main-post:14 [sb.sousuke]
= {封|ふう} を {切|き}らず に 、 {透|す}けて {見|み}える {文|ぶん} だけ {読|よ}めば …… ？ || What if we just read the lines that show through, without breaking the seals…?
> {封|ふう} {切|き}らんと 、 {透|す}けて {見|み}える {文|ぶん} だけ {読|よ}んだら …… ？ || What if we just read the lines that show through, without breaking the seals…?
@ ch4/main-post:33 [sb.sousuke]
= {四幕|よんまく} の お{芝居|しばい} だ ね 。 {順番|じゅんばん} を {間違|まちが}えたら 、 {話|はなし} が めちゃくちゃ に なる 。 || A play in four acts. Get them out of order and the story's a mess.
> {四幕|よんまく} の お{芝居|しばい} や な 。 {順番|じゅんばん} {間違|まちが}えたら 、 {話|はなし} が めちゃくちゃ に なる で 。 || A play in four acts. Get 'em out of order and the story's a mess.
@ ch4/main-storm:42 [sb.hearth_fails]
= {見|み}せ{場|ば} だよ 、 $name 。 「 ほのお 」 の {字|じ} で 、 この {部屋|へや} を もう {一度|いちど} {明|あか}るく して 。 || Your big moment, $name. Write "honoo" and light this room up again.
> {見|み}せ{場|ば} や で 、 $name 。 「 ほのお 」 の {字|じ} で 、 この {部屋|へや} を もう いっぺん {明|あか}るく して 。 || Your big moment, $name. Write "honoo" and light this room right back up.
@ ch4/main-storm:57 [sb.hearth_fails]
= {大|だい}{成功|せいこう} ！ {明日|あした} の {公演|こうえん} は 、 {山|やま} の {上|うえ} だ ね 。 || A triumph! Tomorrow's performance is up the mountain, then.
> {大|だい}{成功|せいこう} ！ {明日|あした} の {公演|こうえん} は 、 {山|やま} の {上|うえ} や な 。 || A triumph! Tomorrow's performance is up the mountain, then.
@ ch4/quiet-suzu:3 [sb.quiet_suzu]
= ねえ=(hey) 、 {起|お}きてる ？ …… {起|お}きてる よね 。 {息|いき} の {音|おと} で わかる 。 {客席|きゃくせき} の {寝息|ねいき} は 、 {舞台|ぶたい} から よく {聞|き}こえる の 。 || Hey, you awake? …You are. I can tell by your breathing. You can hear the audience snoring very clearly from the stage.
> なあ 、 {起|お}きてる ？ …… {起|お}きてる やろ 。 {息|いき} の {音|おと} で わかる わ 。 {客席|きゃくせき} の {寝息|ねいき} は 、 {舞台|ぶたい} から よう {聞|き}こえる ねん 。 || Hey, you awake? …You are, huh. I can tell by your breathing. You can hear the audience snoring real clear from the stage.
@ ch4/quiet-suzu:9 [sb.quiet_suzu]
= {毎回|まいかい} {一人|ひとり} は いる よ 。 {最前列|さいぜんれつ} に 。 {不思議|ふしぎ} な こと に 、 {同|おな}じ おじいさん の とき も ある 。 {町|まち} が {違|ちが}う のに 。 || Every show has one. Front row. Funnily enough, sometimes it's the same old man. In a different town.
> {毎回|まいかい} {一人|ひとり} は おる ねん 。 {最前列|さいぜんれつ} に 。 {不思議|ふしぎ} な こと に 、 {同|おんな}じ おじいさん の とき も ある 。 {町|まち} が ちゃう のに 。 || Every show's got one. Front row. Funny thing — sometimes it's the same old fella. In a whole different town.
@ ch4/quiet-suzu:12 [sb.quiet_suzu]
= {吹雪|ふぶき} の {音|おと} って 、 {拍手|はくしゅ} に {似|に}て ない ？ {鳴|な}り{止|や}まない {拍手|はくしゅ} 。 …… {嘘|うそ} 。 ぜんぜん {似|に}て ない 。 {怖|こわ}い だけ 。 || Doesn't a storm sound like applause? Applause that won't stop. …Lie. Not the slightest bit. It's just scary.
> {吹雪|ふぶき} の {音|おと} って 、 {拍手|はくしゅ} に {似|に}てへん ？ {鳴|な}り{止|や}まへん {拍手|はくしゅ} 。 …… {嘘|うそ} 。 ぜんぜん {似|に}てへん 。 {怖|こわ}い だけ や 。 || Doesn't a storm sound like applause? Applause that won't quit. …That's a lie. Not one bit. It's just scary.
@ ch4/quiet-suzu:14 [sb.quiet_suzu]
= ヤギ と いえば ね 。 {昔|むかし} 、 {一座|いちざ} に ヤギ が いた の 。 {名前|なまえ} は 「 {座長|ざちょう} 」 。 || Speaking of goats. The troupe used to have a goat. Its name was "Director".
> ヤギ と いえば な 。 {昔|むかし} 、 {一座|いちざ} に ヤギ が おってん 。 {名前|なまえ} は 「 {座長|ざちょう} 」 。 || Speaking of goats. The troupe used to have a goat. Its name was "Director".
@ ch4/quiet-suzu:15 [sb.quiet_suzu]
= {本物|ほんもの} の {座長|ざちょう} が {付|つ}けた の 。 {自分|じぶん} より {言|い}う こと を {聞|き}かない やつ に は 、 {似合|にあ}い の {名前|なまえ} だ って 。 || The real director named it. Said anything that listened to him even less than he did deserved the title.
> ほんま の {座長|ざちょう} が {付|つ}けた ん や 。 {自分|じぶん} より {言|い}う こと {聞|き}かへん やつ に は 、 {似合|にあ}い の {名前|なまえ} や って 。 || The real director named it. Said anything that listened to him even less than he did deserved the title.
@ ch4/quiet-suzu:16 [sb.quiet_suzu]
= ある {晩|ばん} 、 お{芝居|しばい} の いちばん {泣|な}ける {場面|ばめん} で 、 その ヤギ が {舞台|ぶたい} に {上|あ}がって きて 、 {幕|まく} を {食|た}べ{始|はじ}めた の 。 || One night, right in the most tear-jerking scene of the play, that goat walked onstage and started eating the curtain.
> ある {晩|ばん} 、 お{芝居|しばい} の いちばん {泣|な}ける {場面|ばめん} で 、 その ヤギ が {舞台|ぶたい} に {上|あ}がって きて 、 {幕|まく} を {食|た}べ{始|はじ}めてん 。 || One night, smack in the most tear-jerking scene of the play, that goat walked onstage and started eating the curtain.
@ ch4/quiet-suzu:17 [sb.quiet_suzu]
= {客席|きゃくせき} は {大|おお}{笑|わら}い 。 {次|つぎ} の {町|まち} でも 「 ヤギ の {場面|ばめん} は ？ 」 って {聞|き}かれて 、 {結局|けっきょく} その {旅|たび} の {間|あいだ} ずっと 、 ヤギ に {幕|まく} を {食|た}べて もらった 。 || The audience roared. In the next town people asked, "Where's the goat scene?" — so for the rest of that tour, we had the goat eat the curtain every night.
> {客席|きゃくせき} は {大|おお}{笑|わら}い や 。 {次|つぎ} の {町|まち} でも 「 ヤギ の {場面|ばめん} は ？ 」 って {聞|き}かれて 、 {結局|けっきょく} その {旅|たび} の {間|あいだ} ずっと 、 ヤギ に {幕|まく} {食|た}べて もろた ん や 。 || The audience roared. Next town, folks asked, "Where's the goat scene?" — so the whole rest of that tour, we had the goat eat the curtain every night.
@ ch4/quiet-suzu:18 [sb.quiet_suzu]
= {幕|まく} {代|だい}=(cost) で {一座|いちざ} は {赤字|あかじ} に なった けど ね 。 {帳簿|ちょうぼ} は あたし が つけてた から 、 よく {覚|おぼ}えてる 。 {一枚|いちまい} {八百|はっぴゃく} 。 || The curtains put the troupe in the red. I kept the books, so I remember exactly. Eight hundred a curtain.
> {幕|まく} {代|だい}=(cost) で {一座|いちざ} は {赤字|あかじ} に なった けど な 。 {帳簿|ちょうぼ} は うち が つけてた から 、 よう {覚|おぼ}えてる 。 {一枚|いちまい} {八百|はっぴゃく} 。 || The curtains put the troupe in the red, mind. I kept the books, so I remember exactly. Eight hundred a curtain.
@ ch4/quiet-suzu:24 [sb.quiet_suzu]
= {借|か}り と {貸|か}し は 、 {全部|ぜんぶ} {覚|おぼ}えてる の 。 {冗談|じょうだん} は {忘|わす}れて も 、 {数字|すうじ} は {忘|わす}れない 。 {変|へん} でしょ 。 || I remember every debt and every loan. I might forget a joke, but never a figure. Weird, right?
> {借|か}り と {貸|か}し は 、 {全部|ぜんぶ} {覚|おぼ}えてる ねん 。 {冗談|じょうだん} は {忘|わす}れて も 、 {数字|すうじ} は {忘|わす}れへん 。 {変|へん} やろ 。 || I remember every debt and every loan. Might forget a joke, but never a figure. Weird, huh?
@ ch4/quiet-suzu:27 [sb.quiet_suzu]
= {座長|ざちょう} は ね 、 {引退|いんたい} して 、 {灰実|はいみ} の {里|さと} の {果樹園|かじゅえん} で {草|くさ} を {食|た}べてる 。 {幕|まく} より {美味|おい}しい って 。 || The Director retired to an orchard in Cinder Orchard and eats grass now. Says it tastes better than curtains.
> {座長|ざちょう} は な 、 {引退|いんたい} して 、 {灰実|はいみ} の {里|さと} の {果樹園|かじゅえん} で {草|くさ} {食|た}べてる ねん 。 {幕|まく} より {美味|おい}しい って 。 || The Director retired to an orchard in Cinder Orchard and eats grass now. Says it tastes better than curtains.
@ ch4/quiet-suzu:29 [sb.quiet_suzu]
= …… {灰実|はいみ} の {里|さと} で 、 ヒロ に {本当|ほんとう} の こと を {話|はな}して から 、 {時々|ときどき} {考|かんが}える の 。 || …Since I told Hiro the truth back in Cinder Orchard, I sometimes think about it.
> …… {灰実|はいみ} の {里|さと} で 、 ヒロ に ほんま の こと {話|はな}して から 、 {時々|ときどき} {考|かんが}える ねん 。 || …Ever since I told Hiro the truth back in Cinder Orchard, I get to thinking sometimes.
@ ch4/quiet-suzu:30 [sb.quiet_suzu]
= あたし の {口|くち} から は 、 {冗談|じょうだん} が {先|さき} に {出|で}る 。 {本当|ほんとう} の こと は 、 いつも {二番目|にばんめ} 。 || Jokes always come out of my mouth first. The truth is always second.
> うち の {口|くち} から は 、 {冗談|じょうだん} が {先|さき} に {出|で}る 。 ほんま の こと は 、 いつも {二番目|にばんめ} や 。 || Jokes always come out of my mouth first. The truth's always second.
@ ch4/quiet-suzu:31 [sb.quiet_suzu]
= {怖|こわ}い の は ね 。 いつか 、 {二番目|にばんめ} が {来|こ}ない {日|ひ} が {来|く}る こと 。 {冗談|じょうだん} だけ で 、 {幕|まく} が {下|お}りちゃう {日|ひ} 。 || What I'm afraid of is that one day the second one won't come. That the curtain will come down on nothing but jokes.
> {怖|こわ}い の は な 。 いつか 、 {二番目|にばんめ} が けえへん {日|ひ} が {来|く}る こと 。 {冗談|じょうだん} だけ で 、 {幕|まく} が {下|お}りてまう {日|ひ} 。 || What scares me is that one day the second one won't come. That the curtain'll come down on nothing but jokes.
@ ch4/quiet-suzu:38 [sb.quiet_suzu]
= …… {一番目|いちばんめ} だった 。 {今|いま} の が 。 あはは 、 {珍|めずら}しい 。 {本当|ほんとう} の こと が {先|さき} に {出|で}た 。 || …That was the first one. Just now. Ha — how rare. The truth came out first.
> …… {一番目|いちばんめ} やった 。 {今|いま} の が 。 あはは 、 {珍|めずら}しい 。 ほんま の こと が {先|さき} に {出|で}た わ 。 || …That was the first one. Just now. Ha — how rare. The truth came out first.
@ ch4/quiet-suzu:42 [sb.quiet_suzu]
= …… {待|ま}って くれる {客|きゃく} は 、 {貴重|きちょう} だよ 。 {最前列|さいぜんれつ} の おじいさん より も ね 。 || …An audience that waits is precious. More than the old man in the front row.
> …… {待|ま}って くれる {客|きゃく} は 、 {貴重|きちょう} や で 。 {最前列|さいぜんれつ} の おじいさん より も な 。 || …An audience that waits is precious. More than the old fella in the front row.
@ ch4/quiet-suzu:46 [sb.quiet_suzu]
= {本当|ほんとう} ？ …… じゃあ 、 {帳簿|ちょうぼ} に つけて おこう 。 {貸|か}し {一|いち} 。 || Really? …Then I'll put it in the books. One in credit.
> ほんま ？ …… ほな 、 {帳簿|ちょうぼ} に つけとこ 。 {貸|か}し {一|いち} 。 || Really? …Then I'll put it in the books. One in credit.
@ ch4/quiet-suzu:48 [sb.quiet_suzu]
= {誰|だれ} に も {見|み}せた こと が ない の 、 これ 。 || I've never shown anyone this.
> {誰|だれ} に も {見|み}せた こと あらへん ねん 、 これ 。 || I've never shown anybody this.
@ ch4/quiet-suzu:50 [sb.quiet_suzu]
= 「 {返|かえ}せない {借|か}り 」 の {頁|ページ} 。 {雨|あめ} の {日|ひ} に {傘|かさ} を くれた {人|ひと} 。 {初舞台|はつぶたい} で {一人|ひとり} だけ {拍手|はくしゅ} して くれた {子|こ} 。 お{金|かね} じゃ {返|かえ}せない もの 。 || The page for debts I can't repay. The person who gave me an umbrella on a rainy day. The one child who clapped at my first show. Things money can't pay back.
> 「 {返|かえ}されへん {借|か}り 」 の {頁|ページ} 。 {雨|あめ} の {日|ひ} に {傘|かさ} くれた {人|ひと} 。 {初舞台|はつぶたい} で {一人|ひとり} だけ {拍手|はくしゅ} して くれた {子|こ} 。 お{金|かね} で は {返|かえ}されへん もん 。 || The page for debts I can't repay. The person who gave me an umbrella on a rainy day. The one kid who clapped at my first show. Things money can't pay back.
@ ch4/quiet-suzu:51 [sb.quiet_suzu]
= …… あんた の {名前|なまえ} も ある よ 。 {結構|けっこう} {長|なが}く なって きた 。 {困|こま}った もん だ ね 。 || …Your name's in there too. It's getting rather long. What a problem.
> …… あんた の {名前|なまえ} も ある で 。 {結構|けっこう} {長|なが}く なって きた わ 。 {困|こま}った もん や な 。 || …Your name's in there too. It's getting kinda long. What a problem.
@ ch4/quiet-suzu:56 [sb.quiet_suzu]
= お{互|たが}い の {借|か}り ！ {永遠|えいえん} に {締|し}まらない {帳簿|ちょうぼ} だ 。 …… {悪|わる}く ない ね 。 || Debts both ways! Books that'll never balance. …Not bad.
> お{互|たが}い の {借|か}り ！ {永遠|えいえん} に {締|し}まらへん {帳簿|ちょうぼ} や 。 …… {悪|わる}く ない な 。 || Debts both ways! Books that'll never balance. …Not bad at all.
@ ch4/quiet-suzu:59 [sb.quiet_suzu]
= {返|かえ}す よ 。 {返|かえ}し{続|つづ}ける 。 それ が あたし の {芸|げい} だ から 。 || I'll pay it back. I'll keep on paying it back. That's my act.
> {返|かえ}す で 。 {返|かえ}し{続|つづ}ける 。 それ が うち の {芸|げい} や から 。 || I'll pay it back. I'll keep on paying it back. That's my act.
@ ch4/quiet-suzu:61 [sb.quiet_suzu]
= さて 、 {本日|ほんじつ} の {公演|こうえん} は これ にて {終幕|しゅうまく} 。 …… おやすみ 、 $name 。 || And with that, tonight's performance comes to a close. …Good night, $name.
> さて 、 {本日|ほんじつ} の {公演|こうえん} は これ にて {終幕|しゅうまく} 。 …… おやすみ 、 $name 。 || And with that, tonight's performance comes to a close. …Night, $name.
@ ch4/quiet-morning:18 [sb.quiet_morning]
= おはよう ！ {昨夜|ゆうべ} の {客|きゃく} 、 {最後|さいご} まで {起|お}きてた ね 。 {優秀|ゆうしゅう} 。 {特別|とくべつ} {席|せき} に {招待|しょうたい} しよう 。 || Morning! Last night's audience stayed awake to the end. Excellent. You're invited to the special seats.
> おはよう ！ {昨夜|ゆうべ} の {客|きゃく} 、 {最後|さいご} まで {起|お}きてた な 。 {優秀|ゆうしゅう} や 。 {特別|とくべつ} {席|せき} に {招待|しょうたい} したる わ 。 || Morning! Last night's audience stayed awake to the end. Top-notch. You're invited to the special seats.
@ ch4/quiet-morning:19 [sb.quiet_morning]
= おはよう 。 …… {帳簿|ちょうぼ} 、 {今朝|けさ} {一行|いちぎょう} {増|ふ}やした よ 。 {何|なに} を {書|か}いた か は 、 {秘密|ひみつ} 。 || Morning. …I added a line to the books this morning. What I wrote is a secret.
> おはよう 。 …… {帳簿|ちょうぼ} 、 {今朝|けさ} {一行|いちぎょう} {増|ふ}やしてん 。 {何|なに} {書|か}いた か は 、 {秘密|ひみつ} や 。 || Morning. …Added a line to the books this morning. What I wrote is a secret.
@ ch4/dungeon:9 [sb.path_enter]
= {白|しろ}い キツネ 。 {舞台|ぶたい} なら 、 {化|ば}かす {役|やく} だ ね 。 {騙|だま}されない よう に しよう 。 || A white fox. On stage, that's the trickster role. Let's not be fooled.
> {白|しろ}い キツネ 。 {舞台|ぶたい} やったら 、 {化|ば}かす {役|やく} や な 。 {騙|だま}されん よう に しよ 。 || A white fox. On stage, that's the trickster's part. Let's not get fooled.
@ ch4/dungeon:19 [sb.path_bench]
= {柱|はしら} の {傷|きず} は 、 {帳簿|ちょうぼ} より {正直|しょうじき} だ ね 。 || Notches on a post are more honest than any account book.
> {柱|はしら} の {傷|きず} は 、 {帳簿|ちょうぼ} より {正直|しょうじき} や な 。 || Notches on a post are more honest than any account book.
@ ch4/dungeon:27 [sb.path_marker]
= {石|いし} に {刻|きざ}む こと じゃ ない よ 、 それ ！ || That's not something you carve in stone!
> {石|いし} に {刻|きざ}む こと ちゃう で 、 それ ！ || That ain't something you carve in stone!
@ ch4/dungeon:36 [sb.service_door_out]
= デンジ さん の {言|い}って いた 、 {裏|うら} の {階段|かいだん} でしょう か 。 {中|なか} から {開|あ}けられる はず です 。 || That must be the back stair Denji mentioned. It should open from inside.
> デンジ さん が {言|い}わはった 、 {裏|うら} の {階段|かいだん} ちゃう か 。 {中|なか} から {開|あ}けられる はず や で 。 || That's gotta be the back stair Denji mentioned. Should open from inside.
@ ch4/dungeon:45 [sb.hall_enter]
= {氷|こおり} の {宮殿|きゅうでん} だ ね 。 {衣装|いしょう} {代|だい}=(cost) が かからない {舞台|ぶたい} 。 …… {薪|まき} {代|だい}=(cost) は かかる けど 。 || An ice palace. A set that costs nothing in costumes. …Plenty in firewood, though.
> {氷|こおり} の {宮殿|きゅうでん} や な 。 {衣装|いしょう} {代|だい}=(cost) の かからへん {舞台|ぶたい} 。 …… {薪|まき} {代|だい}=(cost) は かかる けど 。 || An ice palace. A set that costs nothing in costumes. …Plenty in firewood, though.
@ ch4/dungeon:70 [sb.hall_dial]
= {開|ひら}け ゴマ 、 じゃ なくて 、 {開|ひら}け {南|みなみ} ！ || Not "open sesame" — "open south"!
> = || Not "open sesame" — "open south"!
@ ch4/dungeon:91 [sb.charts_enter]
= {少|すこ}し {休|やす}もう 。 あの ストーブ 、 {使|つか}える かも しれない 。 || Let's rest a bit. That stove might still work.
> ちょっと {休|やす}も 。 あの ストーブ 、 {使|つか}える かも しれへん で 。 || Let's rest a spell. That stove might still work.
@ ch4/dungeon:113 [sb.charts_stove]
= {幕間|まくあい} の {休憩|きゅうけい} だ ね 。 {客|きゃく} も {役者|やくしゃ} も 、 {温|あたた}まって から {後半|こうはん} へ 。 || Intermission. Audience and players alike warm up before the second half.
> {幕間|まくあい} の {休憩|きゅうけい} や な 。 {客|きゃく} も {役者|やくしゃ} も 、 {温|あたた}まって から {後半|こうはん} へ 。 || Intermission. Audience and players alike warm up before the second half.
@ ch4/dungeon:119 [sb.charts_desk]
= 「 {読|よ}まない お{前|まえ} が {悪|わる}い 」 ！ {最高|さいこう} 。 {台本|だいほん} の {表紙|ひょうし} に {書|か}きたい 。 || "If you don't read it, that's your own fault"! Wonderful. I want that on the cover of every script.
> 「 {読|よ}まない お{前|まえ} が {悪|わる}い 」 ！ {最高|さいこう} や 。 {台本|だいほん} の {表紙|ひょうし} に {書|か}きたい わ 。 || "If you don't read it, that's your own fault"! Wonderful. I want that on the cover of every script.
@ ch4/dungeon:121 [sb.charts_desk]
= {日誌|にっし} は 、 あの {大|おお}きな {机|つくえ} の {上|うえ} だ ね 。 || The log is on that big table.
> {日誌|にっし} は 、 あの {大|おお}きな {机|つくえ} の {上|うえ} や な 。 || The log's on that big table.
@ ch4/dungeon:161 [sb.charts_sketch]
= ウシオ 。 {聞|き}いた こと ある 。 レン の {師匠|ししょう} だ よ ね 。 {似顔絵|にがおえ} って 、 {残|のこ}された {方|ほう} に は {重|おも}い {荷物|にもつ} だ よ 。 {渡|わた}し{方|かた} を {間違|まちが}え ない よう に しない と 。 || Ushio. I've heard that name. Ren's teacher, right? A portrait is a heavy thing to hand to the one left behind. We'll have to be careful how we give it.
> ウシオ 。 {聞|き}いた こと ある わ 。 レン の {師匠|ししょう} やんな 。 {似顔絵|にがおえ} って 、 {残|のこ}された {方|ほう} に は {重|おも}い {荷物|にもつ} や で 。 {渡|わた}し{方|かた} {間違|まちが}えへん よう に せな あかん 。 || Ushio. I've heard that name. Ren's teacher, right? A portrait's a heavy thing to hand the one left behind. We'll have to be careful how we give it.
@ ch4/dungeon:191 [sb.charts_stair_locked]
= {鍵|かぎ} が {要|い}る 。 {机|つくえ} の {上|うえ} の {書|か}き{置|お}き に 、 {何|なに} か {書|か}いて ない ？ || We need a key. Doesn't the note on the desk say something?
> {鍵|かぎ} が {要|い}る わ 。 {机|つくえ} の {上|うえ} の {書|か}き{置|お}き に 、 {何|なに} か {書|か}いてへん ？ || We need a key. Doesn't the note on the desk say something?
@ ch4/dungeon:200 [sb.gallery_enter]
= {天井|てんじょう} {裏|うら} の {主役|しゅやく} が 、 {出番|でばん} を {待|ま}ってる ね 。 || Whoever's in the rafters is waiting for their cue.
> {天井|てんじょう} {裏|うら} の {主役|しゅやく} が 、 {出番|でばん} {待|ま}ってる な 。 || Whoever's up in the rafters is waiting on their cue.
@ ch4/dungeon:204 [sb.gallery_note]
= {名指|なざ}し で {注意|ちゅうい} されてる ！ {四十年|よんじゅうねん} {前|まえ} に {何|なに} を した ん だろう 。 || Called out by name! What did he do forty years ago?
> {名指|なざ}し で {注意|ちゅうい} されてる ！ {四十年|よんじゅうねん} {前|まえ} に {何|なに} した ん やろ 。 || Called out by name! What on earth did he do forty years ago?
@ ch4/dungeon:252 [sb.dome_enter]
= {主役|しゅやく} の {登場|とうじょう} だ 。 …… {台詞|せりふ} を {忘|わす}れた {主役|しゅやく} 。 || Enter the lead. …A lead who's forgotten their lines.
> {主役|しゅやく} の {登場|とうじょう} や 。 …… {台詞|せりふ} {忘|わす}れた {主役|しゅやく} 。 || Enter the lead. …A lead who's forgotten their lines.
@ ch4/end-lamp:10 [sb.boss_pre]
= {最終幕|さいしゅうまく} だ よ 、 $name 。 {相手|あいて} は {悪役|あくやく} じゃ ない 。 {待|ま}ち{続|つづ}けた {役|やく} だ 。 {丁寧|ていねい} に {演|えん}じよう 。 || Final act, $name. It's not a villain. It's the one who kept on waiting. Let's play it with care.
> {最終幕|さいしゅうまく} や で 、 $name 。 {相手|あいて} は {悪役|あくやく} ちゃう 。 {待|ま}ち{続|つづ}けた {役|やく} や 。 {丁寧|ていねい} に {演|えん}じよ 。 || Final act, $name. It ain't a villain. It's the one who kept on waiting. Let's play it with care.
@ ch4/end-lamp:28 [sb.boss_after]
= {主役|しゅやく} の {名前|なまえ} を {呼|よ}ぶ {役|やく} は 、 $name に {譲|ゆず}る よ 。 {一番|いちばん} いい {台詞|せりふ} だ 。 || The part where the lead's name is called — that's yours, $name. It's the best line in the play.
> {主役|しゅやく} の {名前|なまえ} を {呼|よ}ぶ {役|やく} は 、 $name に {譲|ゆず}る わ 。 {一番|いちばん} ええ {台詞|せりふ} や で 。 || The part where the lead's name gets called — that's yours, $name. Best line in the whole play.
@ ch4/end-lamp:71 [sb.lamp_name]
= {客席|きゃくせき} が {空|から} でも {幕|まく} を {上|あ}げる 。 …… {一番|いちばん} {難|むずか}しくて 、 {一番|いちばん} {格好|かっこう} いい やつ だ 。 || Raising the curtain on an empty house. …The hardest thing, and the finest.
> {客席|きゃくせき} が {空|から} でも {幕|まく} を {上|あ}げる 。 …… {一番|いちばん} {難|むずか}しくて 、 {一番|いちばん} {格好|かっこう} ええ やつ や 。 || Raising the curtain on an empty house. …The hardest thing, and the finest.
@ ch4/end-lamp:81 [sb.lamp_name]
= {舞台|ぶたい} を {降|お}りて 、 {客席|きゃくせき} の {娘|むすめ} さん に {会|あ}い に {行|い}く 。 …… {最高|さいこう} の {終幕|しゅうまく} じゃ ない 。 || Stepping down off the stage to meet your daughter in the audience. …What a finale.
> {舞台|ぶたい} を {降|お}りて 、 {客席|きゃくせき} の {娘|むすめ} さん に {会|あ}い に {行|い}く 。 …… {最高|さいこう} の {終幕|しゅうまく} やん 。 || Stepping down off the stage to go meet your daughter in the audience. …Now that's a finale.
@ ch4/end-lamp:91 [sb.lamp_name]
= {巡業|じゅんぎょう} と {同|おな}じ だ ね 。 {行|い}って 、 {帰|かえ}って 、 また {行|い}く 。 {幕|まく} は {何度|なんど} でも {上|あ}がる 。 || Same as touring. You go, you come back, you go again. The curtain can rise as many times as you like.
> {巡業|じゅんぎょう} と {一緒|いっしょ} や な 。 {行|い}って 、 {帰|かえ}って 、 また {行|い}く 。 {幕|まく} は {何度|なんど} でも {上|あ}がる ねん 。 || Same as touring. You go, you come back, you go again. The curtain can rise as many times as you like.
@ ch4/end-lamp:102 [sb.lamp_name]
= {照明|しょうめい} 、 よし ！ …… {拍手|はくしゅ} は 、 {下|した} の {村|むら} から {聞|き}こえて くる はず だ よ 。 || Lights — go! …The applause should come up from the village below.
> {照明|しょうめい} 、 よし ！ …… {拍手|はくしゅ} は 、 {下|した} の {村|むら} から {聞|き}こえて くる はず や で 。 || Lights — go! …The applause oughta come up from the village below.
@ ch4/end-evening:16 [sb.eve_start]
= {満員|まんいん} の {客席|きゃくせき} が 、 {舞台|ぶたい} を {見上|みあ}げてる 。 {役者|やくしゃ} {冥利|みょうり} に {尽|つ}きる ね 。 {灯|あか}り の ほう が 。 || A packed house, all looking up at the stage. What an honour for the performer. The lamp, I mean.
> {満員|まんいん} の {客席|きゃくせき} が 、 {舞台|ぶたい} を {見上|みあ}げてる 。 {役者|やくしゃ} {冥利|みょうり} に {尽|つ}きる な 。 {灯|あか}り の ほう が や けど 。 || A packed house, all looking up at the stage. What an honour for the performer. The lamp, I mean.
@ ch4/end-evening:17 [sb.eve_start]
= {次|つぎ} の {町|まち} は {灯落|ひおち} 。 「 いいえ 」 が {言|い}えない {町|まち} 、 だった っけ 。 …… {台本|だいほん} を {読|よ}み{直|なお}して おこう 。 || Next town's Lanternfall. The town where nobody can say "no", wasn't it. …I'd better reread the script.
> {次|つぎ} の {町|まち} は {灯落|ひおち} 。 「 いいえ 」 が {言|い}われへん {町|まち} 、 やった っけ 。 …… {台本|だいほん} {読|よ}み{直|なお}しとこ 。 || Next town's Lanternfall. The town where nobody can say "no", wasn't it. …I'd better reread the script.
@ ch4/side:16 [sb.goat_note]
= {帳簿|ちょうぼ} の {誤差|ごさ} が 、 {出産|しゅっさん} ！ {最高|さいこう} の {決算|けっさん} だ よ 。 || The discrepancy in the books is a birth! Best balance sheet ever.
> {帳簿|ちょうぼ} の {誤差|ごさ} が 、 {出産|しゅっさん} ！ {最高|さいこう} の {決算|けっさん} や で 。 || The discrepancy in the books is a birth! Best balance sheet there ever was.
@ ch4/side:33 [sb.sculpt_fox]
= {誇張|こちょう} は {芸|げい} の {基本|きほん} だ けど 、 {札|ふだ} に {書|か}く と {証拠|しょうこ} が {残|のこ}る ね 。 || Exaggeration is the basis of all performance — but write it on a card and there's evidence.
> {誇張|こちょう} は {芸|げい} の {基本|きほん} や けど 、 {札|ふだ} に {書|か}く と {証拠|しょうこ} が {残|のこ}る な 。 || Exaggeration's the basis of all performance — but write it on a card and there's evidence.
@ ch4/banter:48 [sb.bn_suzu1]
= {鐘|かね} の {音|おと} が 、 {昔|むかし} と {同|おな}じ だった 。 {一座|いちざ} で {来|き}た とき 、 {開演|かいえん} の {合図|あいず} に {借|か}りた の 。 {三回|さんかい} {鳴|な}らしたら 、 ヤギ が {全部|ぜんぶ} {帰|かえ}って きて {大騒|おおさわ}ぎ 。 …… なるほど ね 、 {今|いま} わかった 。 || The bell sounds just like it used to. When I came with the troupe we borrowed it to announce the show. Rang it three times and every goat in the place came home — uproar. …Ah. Now I understand why.
> {鐘|かね} の {音|おと} が 、 {昔|むかし} と {同|おんな}じ やった 。 {一座|いちざ} で {来|き}た とき 、 {開演|かいえん} の {合図|あいず} に {借|か}りた ん や 。 {三回|さんかい} {鳴|な}らしたら 、 ヤギ が {全部|ぜんぶ} {帰|かえ}って きて {大騒|おおさわ}ぎ 。 …… なるほど な 、 {今|いま} わかった わ 。 || The bell sounds just like it used to. When I came with the troupe we borrowed it to announce the show. Rang it three times and every goat around came home — what a ruckus. …Ah. Now I get why.
@ ch4/banter:51 [sb.bn_suzu2]
= {寒|さむ}い {所|ところ} の お{客|きゃく} は 、 {笑|わら}う の が {遅|おそ}い の 。 {口|くち} が {凍|こお}ってる から 。 でも 、 {笑|わら}ったら {長|なが}い 。 {雪鈴|ゆきすず} は 、 そういう {客席|きゃくせき} 。 || Audiences in cold places laugh late. Their mouths are frozen. But once they laugh, they laugh for ages. Snowbell's that kind of house.
> {寒|さむ}い とこ の お{客|きゃく} は 、 {笑|わら}う の が {遅|おそ}い ねん 。 {口|くち} が {凍|こお}ってる から 。 せやけど 、 {笑|わら}ったら {長|なが}い 。 {雪鈴|ゆきすず} は 、 そういう {客席|きゃくせき} や 。 || Folks in cold places laugh late. Their mouths are froze. But once they laugh, they laugh for ages. Snowbell's that kind of house.
@ ch4/banter:54 [sb.bn_suzu3]
= ヤエ さん の {品書|しなが}き 、 「 ツケ は {春|はる} まで 」 。 {雪鈴|ゆきすず} の {人|ひと} は 、 {春|はる} が {来|く}る って {信|しん}じてる んだ ね 。 {帳簿|ちょうぼ} に {書|か}ける ぐらい に 。 || Yae's menu: "Tabs settled in spring." Snowbell people believe spring will come. Enough to write it in the books.
> ヤエ さん の {品書|しなが}き 、 「 ツケ は {春|はる} まで 」 。 {雪鈴|ゆきすず} の {人|ひと} は 、 {春|はる} が {来|く}る って {信|しん}じてはる ねん な 。 {帳簿|ちょうぼ} に {書|か}ける ぐらい に 。 || Yae's menu: "Tabs settled in spring." Snowbell folks believe spring's coming. Enough to put it in the books.
@ ch4/banter:57 [sb.bn_suzu4]
= ロクタ の キツネ 、 {尻尾|しっぽ} が {大|おお}きかった って {言|い}い{張|は}ってた でしょ 。 あれ 、 {嘘|うそ} じゃ ない よ 。 {昨日|きのう} は {本当|ほんとう} に {大|おお}きかった の 。 {嘘|うそ} と {誇張|こちょう} と {風|かぜ} の せい 。 {見分|みわ}ける の は 、 {難|むずか}しい ね 。 || Rokuta insisted his fox's tail was bigger, remember? He wasn't lying. It really was bigger yesterday. A lie, an exaggeration, or the wind — hard to tell apart.
> ロクタ の キツネ 、 {尻尾|しっぽ} が {大|おお}きかった って {言|い}い{張|は}ってた やろ 。 あれ 、 {嘘|うそ} ちゃう で 。 {昨日|きのう} は ほんま に {大|おお}きかった ん や 。 {嘘|うそ} と {誇張|こちょう} と {風|かぜ} の せい 。 {見分|みわ}ける の は 、 {難|むずか}しい な 。 || Rokuta swore up and down his fox's tail was bigger, remember? He wasn't lying. It really was bigger yesterday. A lie, a stretch, or the wind — hard to tell apart.
@ ch4/banter:60 [sb.bn_suzu5]
= {灯落|ひおち} で は 、 {誰|だれ} も 「 いいえ 」 って {言|い}わない らしい 。 {冗談|じょうだん} の {落|お}ち に も 「 いいえ 」 は {要|い}る のに ね 。 …… {困|こま}った {町|まち} だ 。 {笑|わら}わせ {甲斐|がい} が ありそう 。 || In Lanternfall, apparently nobody says "no". Even a joke needs a "no" for the punchline. …Troublesome town. Should be worth making them laugh.
> {灯落|ひおち} で は 、 {誰|だれ} も 「 いいえ 」 って {言|い}わへん らしい 。 {冗談|じょうだん} の {落|お}ち に も 「 いいえ 」 は {要|い}る のに な 。 …… {困|こま}った {町|まち} や 。 {笑|わら}わせ {甲斐|がい} が ありそう や わ 。 || In Lanternfall, seems nobody says "no". Even a joke needs a "no" for the punchline. …Troublesome town. Oughta be worth making 'em laugh.
`, 'dialect/kansai_40_ch4');
