/* Suzu's Kansai-ben: Chapter 2 — Saltglass.
 * Format and rules: src/lang/85_dialect.js, docs/dialect/suzu_kansai.md.
 * "=" the standard line as authored (the key: its Japanese); ">" the Kansai version. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.dialect.add('kansai', `
@ ch2/20_scenes_road:22 [sg.arrive]
= さあさあ 、 お{立|た}ち{会|あ}い ！ {潮|しお} と ガラス の {町|まち} 、 {潮硝子|しおがらす} に ご{到着|とうちゃく} ！ || Roll up, roll up! Now arriving: the town of tide and glass, Saltglass!
> さあさあ 、 お{立|た}ち{会|あ}い ！ {潮|しお} と ガラス の {町|まち} 、 {潮硝子|しおがらす} に ご{到着|とうちゃく} や ！ || Roll up, roll up! Now arriving: the town of tide and glass — Saltglass!
@ ch2/20_scenes_road:24 [sg.arrive]
= カモメ に よ 。 {客|きゃく} は {選|えら}べない の 。 …… {前|まえ} に {来|き}た とき 、 {宿代|やどだい} が {銅貨|どうか} {三枚|さんまい} {足|た}りなくて ね 。 {今度|こんど} は ちゃんと {払|はら}う わ 。 || To the gulls. You can't choose your audience. …Last time I was here I was three coppers short on the inn bill. I'll pay properly this time.
> カモメ に や 。 {客|きゃく} は {選|えら}ばれへん もん 。 …… {前|まえ} に {来|き}た とき 、 {宿代|やどだい} が {銅貨|どうか} {三枚|さんまい} {足|た}りひんかって な 。 {今度|こんど} は ちゃんと {払|はら}う で 。 || To the gulls, that is. Can't pick your audience. …Last time I was here I came up three coppers short on the inn bill. I'm paying proper this time.
@ ch2/20_scenes_road:25 [sg.arrive]
= …… {変|へん} ね 。 {市場|いちば} の {声|こえ} が {聞|き}こえない 。 {港|みなと} は 、 もっと うるさい はず よ 。 || …Odd. I can't hear the market. A harbour ought to be noisier than this.
> …… {変|へん} や な 。 {市場|いちば} の {声|こえ} が {聞|き}こえへん 。 {港|みなと} は 、 もっと うるさい はず や で 。 || …That's odd. Can't hear the market. A harbour oughta be a whole lot noisier than this.
@ ch2/20_scenes_road:39 [sg.road_forklantern]
= {早変|はやが}わり の {芸|げい} なら {負|ま}けない けど 、 この {灯籠|とうろう} に は {負|ま}ける わ 。 || I'm good at quick changes, but I concede to this lantern.
> {早変|はやが}わり の {芸|げい} やったら {負|ま}けへん けど 、 この {灯籠|とうろう} に は {負|ま}ける わ 。 || I'm good at quick changes, but this lantern's got me beat.
@ ch2/20_scenes_road:62 [sg.road_bench]
= …… {少|すこ}し だけ 、 {座|すわ}って いこう か 。 {幕|まく} が {上|あ}がる {前|まえ} の 、 {深呼吸|しんこきゅう} 。 || …Let's sit a moment. A deep breath before the curtain goes up.
> …… ちょっと だけ 、 {座|すわ}って いこう か 。 {幕|まく} が {上|あ}がる {前|まえ} の 、 {深呼吸|しんこきゅう} や 。 || …Let's sit a spell. A deep breath before the curtain goes up.
@ ch2/20_scenes_road:70 [sg.road_inland_closed]
= あら 、 {出口|でぐち} が {入口|いりぐち} に なる {手品|てじな} ね 。 …… {笑|わら}えない わ 。 || Oh, the trick where the exit turns into the entrance. …Not funny.
> あら 、 {出口|でぐち} が {入口|いりぐち} に なる {手品|てじな} や な 。 …… {笑|わら}われへん わ 。 || Oh, the trick where the exit turns into the entrance. …Not funny, I'll tell ya.
@ ch2/20_scenes_road:79 [sg.road_open]
= {灰実|はいみ} の {里|さと} 、 か 。 …… {久|ひさ}しぶり ね 。 || Cinder Orchard, huh. …It's been a while.
> {灰実|はいみ} の {里|さと} 、 か 。 …… {久|ひさ}しぶり や な 。 || Cinder Orchard, huh. …Been a while.
@ ch2/20_scenes_road:92 [sg.harbor_first]
= {目|め} の {前|まえ} で {消|き}える なんて 。 {手品|てじな} なら {種|たね} が ある けど …… 。 || Vanishing right in front of us. If it were a magic trick, there'd be a secret to it…
> {目|め} の {前|まえ} で {消|き}える なんて 。 {手品|てじな} やったら {種|たね} が ある ねん けど …… 。 || Vanishing right in front of us. If it were a magic trick, there'd be a secret to it, but…
@ ch2/20_scenes_road:104 [sg.return_harbor]
= {紙吹雪|かみふぶき} ！ {最高|さいこう} の {終幕|しゅうまく} ね ！ || Confetti! What a finale!
> {紙吹雪|かみふぶき} ！ {最高|さいこう} の {終幕|しゅうまく} や ！ || Confetti! Now that's a finale!
@ ch2/20_scenes_road:134 [sg.ch2_end]
= ねぇ 。 ワタル くん の {帳簿|ちょうぼ} 、 {最初|さいしょ} に {見|み}た とき から 、 {嘘|うそ} だって {分|わ}かってた の 。 || Hey. I knew Wataru's books were lying the first time I saw them.
> なあ 。 ワタル くん の {帳簿|ちょうぼ} 、 {最初|さいしょ} に {見|み}た とき から 、 {嘘|うそ} や って {分|わ}かっててん 。 || Hey. I knew Wataru's books were lying the first time I laid eyes on 'em.
@ ch2/20_scenes_road:135 [sg.ch2_end]
= {数字|すうじ} の {嘘|うそ} は {得意|とくい} なの 。 {昔|むかし} 、 {一座|いちざ} の {帳簿|ちょうぼ} を ごまかした こと が ある から 。 {三日|みっか} で バレた けど 。 || I'm good at spotting lies in numbers. I once fudged the troupe's accounts myself. Found out in three days.
> {数字|すうじ} の {嘘|うそ} は {得意|とくい} やねん 。 {昔|むかし} 、 {一座|いちざ} の {帳簿|ちょうぼ} を ごまかした こと ある から 。 {三日|みっか} で バレた けど な 。 || I'm good at spotting lies in numbers. Fudged the troupe's accounts once myself. Got found out in three days, mind.
@ ch2/20_scenes_road:137 [sg.ch2_end]
= …… {入|はい}った わ よ 。 {今|いま} の が {冗談|じょうだん} 。 {本当|ほんとう} の {話|はなし} は 、 ここ から 。 || …I did. That was the joke. The real story starts here.
> …… {入|はい}った で 。 {今|いま} の が {冗談|じょうだん} 。 ほんま の {話|はなし} は 、 ここ から や 。 || …I did, too. That was the joke. The real story starts here.
@ ch2/20_scenes_road:138 [sg.ch2_end]
= {嘘|うそ} に は 、 {帳簿|ちょうぼ} に {書|か}けない {嘘|うそ} も ある の 。 {人|ひと} を {慰|なぐさ}める ため の やつ 。 {利子|りし} が {見|み}えない から 、 {返|かえ}す {日|ひ} が {分|わ}からない 。 || Some lies can't go in a ledger. The ones you tell to comfort someone. You can't see the interest, so you never know when it falls due.
> {嘘|うそ} に は 、 {帳簿|ちょうぼ} に {書|か}かれへん {嘘|うそ} も ある ねん 。 {人|ひと} を {慰|なぐさ}める ため の やつ 。 {利子|りし} が {見|み}えへん から 、 {返|かえ}す {日|ひ} が {分|わ}からへん 。 || Some lies can't go in a ledger. The ones you tell to comfort somebody. You can't see the interest, so you never know when it falls due.
@ ch2/20_scenes_road:139 [sg.ch2_end]
= {灰実|はいみ} の {里|さと} に は 、 {一|ひと}つ …… {返|かえ}さなきゃ いけない もの が ある の 。 || In Cinder Orchard there's something… I have to pay back.
> {灰実|はいみ} の {里|さと} に は 、 {一|ひと}つ …… {返|かえ}さな あかん もん が ある ねん 。 || Out in Cinder Orchard there's something… I've gotta pay back.
@ ch2/20_scenes_road:140 [sg.ch2_end]
= さ 、 {今夜|こんや} は ここ まで ！ {幕|まく} ！ || Right — that's all for tonight! Curtain!
> ほな 、 {今夜|こんや} は ここ まで ！ {幕|まく} や ！ || Right — that's all for tonight! Curtain!
@ ch2/21_scenes_main:12 [sg.omi_intro]
= {字|じ} が {嘘|うそ} を つく 、 か 。 …… {役者|やくしゃ} より {質|たち} が {悪|わる}い わ ね 。 || Writing that lies. …Worse than actors.
> {字|じ} が {嘘|うそ} を つく 、 か 。 …… {役者|やくしゃ} より {質|たち} が {悪|わる}い わ 。 || Writing that tells lies. …That's worse than actors.
@ ch2/21_scenes_main:43 [sg.wataru_first]
= （{帳簿|ちょうぼ} を {閉|と}じる の が 、 ちょっと {早|はや}かった わ ね 。） || (He shut that ledger a little too quickly.)
> （{帳簿|ちょうぼ} {閉|と}じる の 、 ちょっと {早|はや}かった な 。） || (Shut that ledger a mite too quick, didn't he.)
@ ch2/21_scenes_main:58 [sg.crate_blank]
= {種|たね} も {仕掛|しか}け も ない の が 、 {一番|いちばん} {怖|こわ}い わ 。 || No trick, no hidden wire. That's the scariest kind.
> {種|たね} も {仕掛|しか}け も あらへん の が 、 {一番|いちばん} {怖|こわ}い わ 。 || No trick, no hidden wire. That's the scariest kind.
@ ch2/21_scenes_main:70 [sg.crate_glued]
= {壊|こわ}れて ない {荷|に} に 「{破損|はそん}」 の {札|ふだ} 。 {帳簿|ちょうぼ} の {上|うえ} では 、 {消|き}えて {無|な}くなる {荷物|にもつ} ね 。 よく ある {手|て} よ 。 || An undamaged crate tagged "damaged". On the books, it simply disappears. An old trick.
> {壊|こわ}れてへん {荷|に} に 「{破損|はそん}」 の {札|ふだ} 。 {帳簿|ちょうぼ} の {上|うえ} で は 、 {消|き}えて {無|な}くなる {荷物|にもつ} や な 。 よく ある {手|て} や で 。 || A crate that isn't even broken, tagged "damaged". On the books, it just up and disappears. Oldest trick there is.
@ ch2/21_scenes_main:84 [sg.wh_ledger]
= {八|はち} から {四|よん} 。 {嵐|あらし} の {三日後|みっかご} に 。 「{嵐|あらし} の {夜|よる} に {剥|は}がれた 」 って {話|はなし} と 、 {日付|ひづけ} が {合|あ}わない わ 。 || Eight to four. Three days after the storm. That date doesn't fit his story about tags coming off on the night of the storm.
> {八|はち} から {四|よん} 。 {嵐|あらし} の {三日後|みっかご} に 。 「{嵐|あらし} の {夜|よる} に {剥|は}がれた 」 って {話|はなし} と 、 {日付|ひづけ} が {合|あ}わへん わ 。 || Eight to four. Three days after the storm. That date doesn't square with his story about tags coming off on the storm night.
@ ch2/21_scenes_main:106 [sg.crates_check]
= （{台詞|せりふ} の {練習|れんしゅう} を した {顔|かお} ね 。） || (That's the face of someone who rehearsed his lines.)
> （{台詞|せりふ} の {稽古|けいこ} して きた {顔|かお} や な 。） || (That's the face of somebody who rehearsed his lines.)
@ ch2/21_scenes_main:144 [sg.tamae_first]
= {満員|まんいん} {御礼|おんれい} ！ …… {皿|さら} {洗|あら}い は {別料金|べつりょうきん} よ 。 || Full house, thank you! …Washing up costs extra.
> {満員|まんいん} {御礼|おんれい} ！ …… {皿|さら} {洗|あら}い は {別料金|べつりょうきん} や で 。 || Full house, thank ya kindly! …Washing up costs extra.
@ ch2/21_scenes_main:167 [sg.tamae_postbag]
= …… {借金|しゃっきん} の {手紙|てがみ} は 、 {開|あ}けなければ {無|な}い こと に なる 。 そう {思|おも}いたい {気持|きも}ち は 、 {分|わ}かる わ 。 || …A debt letter stays unreal as long as you don't open it. I understand wanting to believe that.
> …… {借金|しゃっきん} の {手紙|てがみ} は 、 {開|あ}けへんかったら {無|な}い こと に なる 。 そう {思|おも}いたい {気持|きも}ち は 、 {分|わ}かる わ 。 || …A debt letter isn't real as long as you don't open it. I get wanting to believe that.
@ ch2/21_scenes_main:190 [sg.tetsu_first]
= {台詞|せりふ} が {短|みじか}い ほど 、 {役者|やくしゃ} は {上手|うま}い の よ 。 || The fewer the lines, the better the actor.
> {台詞|せりふ} が {短|みじか}い ほど 、 {役者|やくしゃ} は {上手|うま}い ねん で 。 || The fewer the lines, the better the actor, y'know.
@ ch2/21_scenes_main:249 [sg.genzo_clue]
= {八|はち} {引|ひ}く {四|よん} は {四|よん} 。 {四缶|よんかん} 、 どこ か で {誰|だれ} か が {売|う}った の ね 。 || Eight minus four is four. Four cans that someone sold somewhere.
> {八|はち} {引|ひ}く {四|よん} は {四|よん} 。 {四缶|よんかん} 、 どこ か で {誰|だれ} か が {売|う}った ん や な 。 || Eight take away four is four. Four cans somebody sold off somewhere.
@ ch2/21_scenes_main:270 [sg.check_clues]
= {帳簿|ちょうぼ} を {合|あ}わせる ため の {嘘|うそ} は 、 {一|ひと}つ では {終|お}わらない の 。 …… {会|あ}いに {行|い}きましょう 。 || A lie told to balance the books never stays just one lie. …Let's go and see him.
> {帳簿|ちょうぼ} {合|あ}わせる ため の {嘘|うそ} は 、 {一|ひと}つ で は {終|お}わらへん ねん 。 …… {会|あ}い に {行|い}こう か 。 || A lie told to balance the books never stays just one lie. …Let's go see him.
@ ch2/21_scenes_main:290 [sg.wataru_confront]
= {帳尻|ちょうじり} は 、 いつか {合|あ}わせなきゃ いけない の よ 。 {嘘|うそ} で {合|あ}わせた {分|ぶん} も 、 {利子|りし} を つけて ね 。 …… {身|み} に {覚|おぼ}え が ある から 、 {言|い}える の 。 || The books have to balance eventually. Including whatever you balanced with lies — with interest. …I say that from experience.
> {帳尻|ちょうじり} は 、 いつか {合|あ}わせな あかん ねん で 。 {嘘|うそ} で {合|あ}わせた {分|ぶん} も 、 {利子|りし} つけて な 。 …… {身|み} に {覚|おぼ}え が ある から 、 {言|い}える ねん 。 || The books gotta balance sooner or later. Whatever you balanced with lies too — with interest. …I can say that 'cause I've been there.
@ ch2/21_scenes_main:324 [sg.omi_wataru]
= （{見事|みごと} な お{裁|さば}き 。 {貸|か}し と {借|か}り が 、 ちゃんと {合|あ}った わ 。） || (Well judged. The debits and credits actually balance.)
> （{見事|みごと} な お{裁|さば}き や 。 {貸|か}し と {借|か}り が 、 ちゃんと {合|あ}った わ 。） || (Well judged. The debits and credits actually balance.)
@ ch2/21_scenes_main:334 [sg.omi_wataru]
= （…… {開|あ}けた わ ね 。 {一番|いちばん} {難|むずか}しい ところ よ 。） || (…He opened it. That's the hardest part.)
> （…… {開|あ}けた な 。 {一番|いちばん} {難|むずか}しい とこ や で 。） || (…He opened it. That's the hardest part, right there.)
@ ch2/21_scenes_main:355 [sg.wataru_letter]
= {消|き}えた {荷|に} に は 、 {行|い}き{先|さき} が あった 。 {消|き}えた {名前|なまえ} に も 、 ある の かも ね 。 || The missing cargo had somewhere it went. Maybe the missing names do too.
> {消|き}えた {荷|に} に は 、 {行|い}き{先|さき} が あった 。 {消|き}えた {名前|なまえ} に も 、 ある ん かも な 。 || The missing cargo had somewhere it went. Maybe the missing names do too.
@ ch2/22_scenes_tide:92 [sg.causeway_marker]
= {大人|おとな} で よかった わ 。 || Lucky we're grown-ups.
> {大人|おとな} で よかった わ 。 || Lucky we're grown-ups, huh.
@ ch2/22_scenes_tide:101 [sg.causeway_fog]
= {舞台|ぶたい} に {上|あ}がった つもり が 、 {楽屋|がくや} に {戻|もど}されてた わ 。 || I thought I was stepping on stage and found myself back in the dressing room.
> {舞台|ぶたい} に {上|あ}がった つもり が 、 {楽屋|がくや} に {戻|もど}されてた わ 。 || Thought I was stepping on stage — turns out I got sent right back to the dressing room.
@ ch2/22_scenes_tide:117 [sg.genzo_wind]
= {役|やく} の {名前|なまえ} を {忘|わす}れた {役者|やくしゃ} は 、 {舞台|ぶたい} に {出|で}られない もの ね 。 || An actor who forgets the name of their part can't go on stage.
> {役|やく} の {名前|なまえ} を {忘|わす}れた {役者|やくしゃ} は 、 {舞台|ぶたい} に {出|で}られへん もん な 。 || An actor who forgets the name of their part can't go on stage, can they.
@ ch2/22_scenes_tide:132 [sg.genzo_wind]
= {拍手|はくしゅ} ！ {今日|きょう} {一番|いちばん} の {見|み}せ{場|ば} ね ！ || Applause! Best moment of the day!
> {拍手|はくしゅ} ！ {今日|きょう} {一番|いちばん} の {見|み}せ{場|ば} や ！ || Applause! Best moment of the day!
@ ch2/22_scenes_tide:145 [sg.causeway_walk]
= {花道|はなみち} ね 。 {客|きゃく} は カモメ と カニ だけ だ けど 。 || A runway to the stage. Though the audience is only gulls and crabs.
> {花道|はなみち} や な 。 {客|きゃく} は カモメ と カニ だけ や けど 。 || A runway to the stage, huh. Though the audience is only gulls and crabs.
@ ch2/23_scenes_archive:11 [sg.da_arrive]
= {客|きゃく} の いない {劇場|げきじょう} で 、 {照明|しょうめい} だけ が ついてる みたい 。 {嫌|いや} な {感|かん}じ 。 || Like an empty theatre with the lights still on. I don't like it.
> {客|きゃく} の いてへん {劇場|げきじょう} で 、 {照明|しょうめい} だけ が ついてる みたい 。 {嫌|いや} な {感|かん}じ や 。 || Like an empty theatre with the lights still on. Don't like it one bit.
@ ch2/23_scenes_archive:23 [sg.da_innersign]
= {関係者|かんけいしゃ} よ 。 {今|いま} から ね 。 || We're staff. As of now.
> {関係者|かんけいしゃ} や で 。 {今|いま} から な 。 || We're staff. As of right now.
@ ch2/23_scenes_archive:32 [sg.da_catalog]
= {楽屋|がくや} の {名札|なふだ} も 、 あいうえお {順|じゅん} だった わ 。 {主役|しゅやく} が いつも {一番|いちばん} {下|した} で 、 {揉|も}めた もの よ 。 || The dressing-room name cards were in a-i-u-e-o order too. The lead always ended up at the bottom. There were fights.
> {楽屋|がくや} の {名札|なふだ} も 、 あいうえお {順|じゅん} やった わ 。 {主役|しゅやく} が いつも {一番|いちばん} {下|した} で 、 {揉|も}めた もん や 。 || The dressing-room name cards were in a-i-u-e-o order too. The lead always wound up at the bottom. Oh, there were fights.
@ ch2/23_scenes_archive:59 [sg.da_stacks_first]
= {舞台|ぶたい} {裏|うら} の {迷路|めいろ} って とこ ね 。 {鶴|つる} に {気|き}を つけて 。 {目|め} が ない くせ に 、 よく {見|み}てる わ 。 || A backstage maze. Watch out for the cranes — no eyes, but they see plenty.
> {舞台|ぶたい} {裏|うら} の {迷路|めいろ} って とこ や な 。 {鶴|つる} に {気|き}ぃ つけて 。 {目|め} も あらへん くせ に 、 よく {見|み}てる で 。 || A backstage maze, more or less. Watch out for the cranes — no eyes, but they see plenty.
@ ch2/23_scenes_archive:88 [sg.da_reading_first]
= {幕間|まくあい} ね 。 {水|みず} を {飲|の}んで 、 {背筋|せすじ} を {伸|の}ばして 。 {後半|こうはん} は {長|なが}い わ よ 。 || Intermission. Drink some water, straighten your back. The second act's a long one.
> {幕間|まくあい} や 。 {水|みず} {飲|の}んで 、 {背筋|せすじ} {伸|の}ばして 。 {後半|こうはん} は {長|なが}い で 。 || Intermission. Drink some water, sit up straight. The second act's a long one.
@ ch2/23_scenes_archive:93 [sg.da_readingsign]
= {私語|しご} を {慎|つつし}め 、 ね 。 {書庫|しょこ} って 、 {昔|むかし} から {静|しず}か な の が {好|す}き なの よ 。 || "Silence, please." Archives have always loved quiet.
> {私語|しご} を {慎|つつし}め 、 やて 。 {書庫|しょこ} って 、 {昔|むかし} から {静|しず}か な ん が {好|す}き やねん 。 || "Silence, please," it says. Archives have always loved their quiet.
@ ch2/23_scenes_archive:109 [sg.da_ledger]
= 「{本庁|ほんちょう} {移管|いかん} {待|ま}ち」 。 この {舞台|ぶたい} の {奥|おく} に 、 もう {一|ひと}つ {舞台|ぶたい} が ある って こと ね 。 || "Awaiting transfer to head office." So there's another stage behind this one.
> 「{本庁|ほんちょう} {移管|いかん} {待|ま}ち」 。 この {舞台|ぶたい} の {奥|おく} に 、 もう {一|ひと}つ {舞台|ぶたい} が ある って こと や な 。 || "Awaiting transfer to head office." So there's another stage behind this one.
@ ch2/23_scenes_archive:162 [sg.da_raft]
= {縄|なわ}{抜|ぬ}け の {逆|ぎゃく} を やる の よ 。 {縄|なわ} で {捕|つか}まえる 、 ね 。 || We do the rope escape in reverse. The rope catches, for once.
> {縄|なわ}{抜|ぬ}け の {逆|ぎゃく} を やる ねん 。 {縄|なわ} で {捕|つか}まえる ん や 。 || We do the rope escape backwards. This time the rope does the catching.
@ ch2/23_scenes_archive:173 [sg.da_raft]
= {大成功|だいせいこう} ！ {縄|なわ} の {芸|げい} で {拍手|はくしゅ} を もらった の は 、 {初|はじ}めて よ 。 || A triumph! First time I've ever been applauded for a rope act.
> {大成功|だいせいこう} ！ {縄|なわ} の {芸|げい} で {拍手|はくしゅ} もろた の は 、 {初|はじ}めて や わ 。 || A triumph! First time I ever got a round of applause for a rope act.
@ ch2/23_scenes_archive:199 [sg.da_boss]
= その {規定|きてい} の {台本|だいほん} 、 ちょっと {古|ふる}い ん じゃ ない ？ {書|か}き{直|なお}して あげる わ よ 。 || That script of regulations is a bit dated, isn't it? We'll rewrite it for you.
> その {規定|きてい} の {台本|だいほん} 、 ちょっと {古|ふる}い ん ちゃう ？ {書|か}き{直|なお}したる わ 。 || That script of regulations is a bit dated, ain't it? We'll rewrite it for ya.
@ ch2/23_scenes_archive:222 [sg.da_boss_after]
= {傷|きず}つけない ため に 、 {黙|だま}らせる 。 …… {優|やさ}しい {嘘|うそ} と 、 {似|に}てる わ ね 。 || Silencing people so they won't be hurt. …It's a lot like a kind lie.
> {傷|きず}つけへん ため に 、 {黙|だま}らせる 。 …… {優|やさ}しい {嘘|うそ} と 、 {似|に}てる な 。 || Hushing folks up so they won't get hurt. …Sounds a lot like a kind lie.
@ ch2/24_scenes_hub:153 [sg.dir_check]
= {舞台|ぶたい} の {上手|かみて} と {下手|しもて} と {同|おな}じ ね ！ {客席|きゃくせき} から と {舞台|ぶたい} から じゃ 、 {右|みぎ} と {左|ひだり} が {逆|ぎゃく} 。 || Like stage left and stage right! From the audience or from the stage, left and right swap.
> {舞台|ぶたい} の {上手|かみて} と {下手|しもて} と {一緒|いっしょ} や ！ {客席|きゃくせき} から と {舞台|ぶたい} から と で は 、 {右|みぎ} と {左|ひだり} が {逆|ぎゃく} やねん 。 || Just like stage left and stage right! From the seats or from the stage, left and right swap.
@ ch2/24_scenes_hub:211 [sg.sota_nets]
= {礼|れい} は {受|う}け{取|と}って おく わ 。 {断|ことわ}る の は 、 {失礼|しつれい} だ もの 。 || We'll accept the thanks. It'd be rude to refuse.
> {礼|れい} は {受|う}け{取|と}っとく わ 。 {断|ことわ}る の は 、 {失礼|しつれい} や もん 。 || We'll take the thanks. Turning 'em down would be rude.
@ ch2/24_scenes_hub:258 [sg.fuku_plate]
= …… {忘|わす}れた まま の ほう が 、 よかった ？ || …Would you rather have gone on forgetting?
> …… {忘|わす}れた まま の ほう が 、 よかった ？ || …Would you rather've gone on forgetting?
@ ch2/24_scenes_hub:406 [sg.genzo_grump]
= （{台詞|せりふ} は 、 {前後|ぜんご} を {読|よ}まない と {意味|いみ} が {変|か}わる の よ 。） || (Lines change meaning if you don't read what comes before and after.)
> （{台詞|せりふ} は 、 {前後|ぜんご} を {読|よ}まへん と {意味|いみ} が {変|か}わる ねん で 。） || (Lines change their meaning if you don't read what comes before and after.)
@ ch2/24_scenes_hub:417 [sg.genzo_truth]
= {港|みなと} の {噂|うわさ} は 、 {船|ふね} より {速|はや}い の よ 。 || Harbour gossip travels faster than boats.
> {港|みなと} の {噂|うわさ} は 、 {船|ふね} より {速|はや}い ねん で 。 || Harbour gossip travels faster than boats, y'know.
@ ch2/24_scenes_hub:457 [sg.ferry_arrives]
= {再会|さいかい} の {場面|ばめん} は 、 {台詞|せりふ} が {少|すく}ない ほど いい の 。 {満点|まんてん} ね 。 || Reunion scenes are best with as few lines as possible. Full marks.
> {再会|さいかい} の {場面|ばめん} は 、 {台詞|せりふ} が {少|すく}ない ほど ええ ねん 。 {満点|まんてん} や な 。 || Reunion scenes are best with as few lines as can be. Full marks.
@ ch2/24_scenes_hub:536 [sg.suzu_cameo]
= さあさあ 、 お{立|た}ち{会|あ}い ！ …… {今日|きょう} は {客|きゃく} が {少|すく}ない わ ね 。 {港|みなと} が {静|しず}か すぎる の よ 。 || Roll up, roll up! …Thin crowd today. The harbour's too quiet.
> さあさあ 、 お{立|た}ち{会|あ}い ！ …… {今日|きょう} は {客|きゃく} が {少|すく}ない な 。 {港|みなと} が {静|しず}か すぎる ねん 。 || Roll up, roll up! …Thin crowd today. The harbour's just too quiet.
@ ch2/24_scenes_hub:537 [sg.suzu_cameo]
= あら 、 $name ！ {葦|あし}ノ{瀬|せ} {以来|いらい} ね 。 {元気|げんき} そう で {何|なに} より 。 || Oh, $name! Not since Reedwake. Good to see you looking well.
> あら 、 $name ！ {葦|あし}ノ{瀬|せ} {以来|いらい} や な 。 {元気|げんき} そう で {何|なに} より や 。 || Well, if it ain't $name! Not since Reedwake. Good to see you looking well.
@ ch2/24_scenes_hub:538 [sg.suzu_cameo]
= {港|みなと} の {字|じ} が {嘘|うそ} を つく って {噂|うわさ} 、 {聞|き}いた ？ {嘘|うそ} の {専門家|せんもんか} と して は 、 {商売|しょうばい} {敵|がたき} が {増|ふ}えて {困|こま}る わ 。 || Heard the rumour that the harbour's writing tells lies? As a professional, I don't need the competition.
> {港|みなと} の {字|じ} が {嘘|うそ} つく って {噂|うわさ} 、 {聞|き}いた ？ {嘘|うそ} の {専門家|せんもんか} と して は 、 {商売|しょうばい} {敵|がたき} が {増|ふ}えて {困|こま}る わ 。 || Heard the rumour the harbour's writing tells lies? Speaking as a professional, I don't need the competition.
@ ch2/24_scenes_hub:539 [sg.suzu_cameo]
= …… {冗談|じょうだん} よ 。 {気|き}を つけて ね 。 {嘘|うそ} は 、 {本当|ほんとう} の {顔|かお} を して {来|く}る から 。 || …Joking. Be careful. Lies come wearing the face of the truth.
> …… {冗談|じょうだん} や 。 {気|き}ぃ つけて な 。 {嘘|うそ} は 、 ほんま の {顔|かお} して {来|く}る から 。 || …Kidding. Take care, now. Lies come wearing the face of the truth.
@ ch2/24_scenes_hub:542 [sg.suzu_cameo2]
= {港|みなと} が うるさく なった わ ！ {投|な}げ{銭|せん} も {三倍|さんばい} よ 。 || The harbour's noisy again! Three times the coins in the hat.
> {港|みなと} が うるさく なった わ ！ {投|な}げ{銭|せん} も {三倍|さんばい} や で 。 || The harbour's noisy again! Three times the coins in the hat!
@ ch2/24_scenes_hub:543 [sg.suzu_cameo2]
= {前|まえ} に {来|き}た とき の {宿代|やどだい} 、 {利子|りし} を つけて {返|かえ}して きた の 。 タマエ さん 、 {目|め} を {丸|まる}く してた わ 。 {帳尻|ちょうじり} は {合|あ}わせる {主義|しゅぎ} なの 。 || I paid back the inn bill from last time — with interest. Tamae's eyes went round. I believe in balancing the books.
> {前|まえ} に {来|き}た とき の {宿代|やどだい} 、 {利子|りし} つけて {返|かえ}して きてん 。 タマエ さん 、 {目|め} {丸|まる}く してはった わ 。 {帳尻|ちょうじり} は {合|あ}わせる {主義|しゅぎ} やねん 。 || I paid back the inn bill from last time — with interest. Tamae's eyes went round as saucers. I believe in balancing the books.
@ ch2/24_scenes_hub:551 [sg.cove_arrive]
= {客|きゃく} の いない {舞台|ぶたい} も 、 たまに は いい わ ね 。 {波|なみ} が {拍手|はくしゅ} して くれる 。 || An empty stage is nice now and then. The waves do the applause.
> {客|きゃく} の いてへん {舞台|ぶたい} も 、 たまに は ええ な 。 {波|なみ} が {拍手|はくしゅ} して くれる わ 。 || An empty stage is nice now and then. The waves do the clapping.
@ ch2/24_scenes_hub:586 [sg.cove_nets]
= {網|あみ} の {中|なか} に {小|ちい}さい {蟹|かに} が いる わ 。 …… お{帰|かえ}り なさい 、 {海|うみ} へ 。 || There's a tiny crab in the net. …Off you go, back to the sea.
> {網|あみ} の {中|なか} に {小|ちい}さい {蟹|かに} が おる わ 。 …… お{帰|かえ}り 、 {海|うみ} へ 。 || There's a teeny crab in the net. …Off you go, back to the sea.
@ ch2/24_scenes_hub:596 [sg.cove_driftwood]
= {四十日|よんじゅうにち} 。 {何|なに} を {数|かぞ}えて いた の かしら 。 || Forty days. I wonder what they were counting.
> {四十日|よんじゅうにち} 。 {何|なに} を {数|かぞ}えてはった ん やろ な 。 || Forty days. I wonder what they were counting.
@ ch2/25_banter:84 [sg.b_suzu_accounts]
= {旅|たび} の {費用|ひよう} 、 {付|つ}けてる ？ {宿代|やどだい} 、 {食事|しょくじ} 、 {渡|わた}し{船|ぶね} 。 || Are you keeping track of our travel costs? Lodging, meals, ferries.
> {旅|たび} の {費用|ひよう} 、 {付|つ}けてる ？ {宿代|やどだい} 、 {食事|しょくじ} 、 {渡|わた}し{船|ぶね} 。 || You keeping track of our travel costs? Lodging, meals, ferries.
@ ch2/25_banter:86 [sg.b_suzu_accounts]
= {信|しん}じられない ！ …… {貸|か}して 。 {今日|きょう} から あたし が {付|つ}ける 。 {銅貨|どうか} {一枚|いちまい} {単位|たんい} で 。 || Unbelievable! …Hand it over. From today I'm keeping the accounts. To the last copper.
> {信|しん}じられへん ！ …… {貸|か}して 。 {今日|きょう} から うち が {付|つ}ける 。 {銅貨|どうか} {一枚|いちまい} {単位|たんい} で な 。 || Unbelievable! …Hand it here. From today I'm keeping the accounts. Down to the last copper.
@ ch2/25_banter:87 [sg.b_suzu_accounts]
= {意外|いがい} ？ {芸人|げいにん} は ね 、 {数字|すうじ} に {強|つよ}く ない と {生|い}きて いけない の よ 。 || Surprised? A performer who's bad with numbers doesn't last.
> {意外|いがい} ？ {芸人|げいにん} は な 、 {数字|すうじ} に {強|つよ}く ない と {生|い}きて いかれへん ねん で 。 || Surprised? A performer who's bad with numbers doesn't last, y'know.
@ ch2/25_banter:90 [sg.b_suzu_debt]
= タマエ さん ！ {三年|さんねん} {前|まえ} の {銅貨|どうか} {三枚|さんまい} 、 {利子|りし} を つけて {返|かえ}しに {来|き}た わ 。 || Tamae! I've come to pay back those three coppers from three years ago. With interest.
> タマエ さん ！ {三年|さんねん} {前|まえ} の {銅貨|どうか} {三枚|さんまい} 、 {利子|りし} つけて {返|かえ}し に {来|き}た で 。 || Tamae! I've come to pay back those three coppers from three years ago. With interest.
@ ch2/25_banter:92 [sg.b_suzu_debt]
= あたし は {忘|わす}れない の 。 {借|か}り は ね 。 || I don't forget. Not debts.
> うち は {忘|わす}れへん ねん 。 {借|か}り は な 。 || I don't forget. Not debts.
@ ch2/25_banter:96 [sg.b_suzu_lies]
= ワタル くん の {嘘|うそ} 、 {悪|わる}い {嘘|うそ} だった と {思|おも}う ？ || Do you think Wataru's lie was a bad lie?
> ワタル くん の {嘘|うそ} 、 {悪|わる}い {嘘|うそ} やった と {思|おも}う ？ || You reckon Wataru's lie was a bad lie?
@ ch2/25_banter:98 [sg.b_suzu_lies]
= そう ね 。 …… じゃあ 、 {誰|だれ} も {危|あぶ}なく ない {嘘|うそ} なら ？ {誰|だれ} か を {笑|わら}わせる ため の 、 {泣|な}かせない ため の {嘘|うそ} なら ？ || Yes. …Then what about a lie that puts no one in danger? One told to make someone smile — to keep them from crying?
> せや な 。 …… ほな 、 {誰|だれ} も {危|あぶ}なく ない {嘘|うそ} やったら ？ {誰|だれ} か を {笑|わら}わせる ため の 、 {泣|な}かせへん ため の {嘘|うそ} やったら ？ || Yeah. …Then what about a lie that puts nobody in danger? One told to make somebody smile — to keep 'em from crying?
@ ch2/25_banter:99 [sg.b_suzu_lies]
= …… {答|こた}え なくて いい わ 。 {今|いま} の は 、 {稽古|けいこ} の {台詞|せりふ} 。 || …You don't have to answer. That was just a line I'm rehearsing.
> …… {答|こた}えん で ええ よ 。 {今|いま} の は 、 {稽古|けいこ} の {台詞|せりふ} や 。 || …You don't have to answer. That was just a line I'm rehearsing.
@ ch2/25_banter:102 [sg.b_suzu_archive]
= {紙|かみ} の {鶴|つる} 、 {折|お}り{方|かた} が {上手|じょうず} ね 。 {一座|いちざ} の {子|こ} たち に {教|おし}えた こと が ある の 。 {千羽|せんば} {折|お}ったら {願|ねが}い が {叶|かな}う って 。 || Those cranes are nicely folded. I taught the troupe's children once. Fold a thousand and your wish comes true, I told them.
> {紙|かみ} の {鶴|つる} 、 {折|お}り{方|かた} が {上手|じょうず} や な 。 {一座|いちざ} の {子|こ}ら に {教|おし}えた こと ある ねん 。 {千羽|せんば} {折|お}ったら {願|ねが}い が {叶|かな}う って 。 || Those cranes are folded real nice. I taught the troupe's young'uns once. Fold a thousand and your wish comes true, I told 'em.
@ ch2/25_banter:103 [sg.b_suzu_archive]
= …… {嘘|うそ} じゃ ない わ よ 。 {叶|かな}う {気|き} が する 、 って いう の は {本当|ほんとう} だ から 。 || …That wasn't a lie. It's true that it feels like it will.
> …… {嘘|うそ} ちゃう で 。 {叶|かな}う {気|き} が する 、 って いう の は ほんま や から 。 || …That wasn't a lie, mind. It's true it feels like it will.
@ ch2/25_banter:106 [sg.b_suzu_after]
= {次|つぎ} は {灰実|はいみ} の {里|さと} ね 。 {祭|まつ}り の {舞台|ぶたい} が ある {町|まち} よ 。 {前|まえ} は {毎年|まいとし} {出|で}てた 。 || Cinder Orchard next. The town with the festival stage. I used to perform there every year.
> {次|つぎ} は {灰実|はいみ} の {里|さと} や な 。 {祭|まつ}り の {舞台|ぶたい} が ある {町|まち} や で 。 {前|まえ} は {毎年|まいとし} {出|で}ててん 。 || Cinder Orchard next. The town with the festival stage. I used to play there every year.
@ ch2/25_banter:108 [sg.b_suzu_after]
= …… {久|ひさ}しぶり に 、 {出|で}て みよう かな 。 {客席|きゃくせき} に 、 {会|あ}わなきゃ いけない {人|ひと} が いる の 。 || …Maybe it's time I did again. There's someone in the audience I need to face.
> …… {久|ひさ}しぶり に 、 {出|で}て みよう か な 。 {客席|きゃくせき} に 、 {会|あ}わな あかん {人|ひと} が いてる ねん 。 || …Maybe it's high time I did again. There's somebody in the audience I need to face.
`, 'dialect/kansai_20_ch2');
