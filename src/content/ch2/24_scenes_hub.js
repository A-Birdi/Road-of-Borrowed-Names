/* Chapter 2 hub: everyday talk with Saltglass's residents (with small
 * routines that change as the story moves), signs and inscriptions, the
 * harbourmaster's final report, and post-story lines. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
@scene sg.omi_final
omi: {窓|まど} から {見|み}てた よ 。 {手紙|てがみ} の {雨|あめ} だ 。 {三十年|さんじゅうねん} {港|みなと} に いて 、 {初|はじ}めて {見|み}た 。 || I watched from the window. A rain of letters. Thirty years in this port and I'd never seen that.
pc: {沈|しず}んだ {書庫|しょこ} で 、 {名前|なまえ} が {集|あつ}められて いました 。 {静寂|しじま} の {書庫|しょこ} と いう {所|ところ} へ {送|おく}られる ため に 。 || In the drowned archive, names were being collected — to be sent on to a place called the Still Archive.
omi[think]: {静寂|しじま} の {書庫|しょこ} 、 か 。 {灯落|ひおち} の {上|うえ} の {山|やま} に 、 {古|ふる}い {書庫|しょこ} が ある と は {聞|き}く 。 {子|こ}ども の {怪談|かいだん} だ と {思|おも}ってた が …… 。 || The Still Archive, eh. I've heard there's an old archive in the mountains above Lanternfall. I took it for a children's ghost story too…
omi: {怪談|かいだん} に しちゃ 、 {字|じ} が {綺麗|きれい} すぎる な 。 || Awfully neat handwriting, for a ghost story.
omi: {港|みなと} は {動|うご}き{出|だ}した 。 {渡|わた}し{船|ぶね} も 、 {明日|あした} から {出|だ}す 。 {礼|れい} を {言|い}う よ 。 {本当|ほんとう} に 。 || The port's moving again. The ferry sails from tomorrow. Thank you. Truly.
?(sg_wataru_self) omi: ワタル は {朝|あさ} から {晩|ばん} まで ラベル を {書|か}いてる 。 {鼻歌|はなうた} {混|ま}じり で な 。 あいつ の {鼻歌|はなうた} なんか 、 {初|はじ}めて {聞|き}いた よ 。 || Wataru's writing labels from dawn to dusk. Humming, if you please. First time I've ever heard that man hum.
?(!sg_wataru_self) omi: ワタル は {朝|あさ} から {晩|ばん} まで ラベル を {書|か}いてる 。 {罰|ばつ} の つもり で やらせた ん だ が 、 {楽|たの}しそう で {困|こま}る 。 || Wataru's writing labels from dawn to dusk. I meant it as punishment, and the man looks happy. Annoying.
omi: {北|きた} の {道|みち} も 、 {通|とお}れる よう に なった そう だ 。 {灰実|はいみ} の {里|さと} へ {行|い}く なら 、 {今夜|こんや} は かもめ{亭|てい} に {泊|と}まって いきな 。 {宿代|やどだい} は {港|みなと} が {持|も}つ 。 || They say the north road's open again. If you're heading for Cinder Orchard, stay the night at the Gull. The harbour's paying.
!quest sg_main done
!note sg_three_kinds
!set sg_evening
!call sg.ch2_end

@scene sg.omi_after
omi: {北|きた} の {道|みち} は {開|ひら}いてる よ 。 {灰実|はいみ} の {里|さと} は 、 {果物|くだもの} と ガラス の {町|まち} だ 。 {気|き}を つけて な 。 || The north road's open. Cinder Orchard's a town of fruit and glass. Take care.
omi: …… {時刻表|じこくひょう} が {正|ただ}しい って の は 、 {退屈|たいくつ} で いい もん だ ね 。 || …A ferry board that tells the truth. Wonderfully dull.

@scene sg.omi_post
omi: {渡|わた}し{船|ぶね} は {毎日|まいにち} {時刻表|じこくひょう} どおり だ 。 {退屈|たいくつ} で {最高|さいこう} だ よ 。 || The ferry runs to the timetable every single day. Gloriously dull.
?(end_kasane_trial) omi: {灯落|ひおち} で {裁|さば}き が ある そう だ な 。 {港|みなと} から も {証人|しょうにん} を {出|だ}す 。 {手紙|てがみ} の {雨|あめ} の {話|はなし} を 、 {全部|ぜんぶ} して やる よ 。 || I hear there's to be a hearing in Lanternfall. The harbour's sending a witness. I'll tell them the whole story of the rain of letters.
?(end_kasane_keeper) omi: {山|やま} の {書庫|しょこ} の {番人|ばんにん} は 、 {見張|みは}り {付|つ}き で {仕事|しごと} を {続|つづ}けてる そう だ な 。 {見張|みは}り が いる なら 、 {港|みなと} も {文句|もんく} は ない 。 {今|いま} の ところ は な 。 || I hear the archive's keeper carries on with a watch set over them. If someone's watching, the harbour has no complaint. For now.

@scene sg.tamae_rest
tamae: いらっしゃい ！ {休|やす}んで く かい ？ あんた たち なら 、 {部屋|へや} は いつでも {空|あ}けとく よ 。 || Welcome! Staying to rest? For you two, there's always a room.
!choice
* {休|やす}みます 。 || We'll rest. -> rest
* また {今度|こんど} 。 || Another time. -> end
:rest
!inn
tamae: よく {寝|ね}た かい ？ {朝|あさ} ご{飯|はん} は {焼|や}き{魚|ざかな} だ よ 。 {他|ほか} に {何|なに} が ある って ん だ 。 || Sleep well? Breakfast is grilled fish. What else would it be?

@scene sg.tamae_after
tamae: {手紙|てがみ} が {空|そら} から {降|ふ}って きた ん だ よ ！ うち の {窓|まど} に も {一通|いっつう} 。 {二十年|にじゅうねん} {前|まえ} の {姉|あね} から の {手紙|てがみ} さ 。 || Letters came down from the sky! One landed on my window — from my sister, twenty years ago.
tamae[laugh]: {返事|へんじ} 、 {今|いま} {書|か}いてる ところ 。 {二十年|にじゅうねん} {分|ぶん} だ から 、 {長|なが}く なる よ 。 || I'm writing a reply now. Twenty years' worth. It's going to be long.
!choice
* {休|やす}んで いきます 。 || We'd like to rest. -> rest
* {頑張|がんば}って ください 。 || Good luck with it. -> end
:rest
!inn

@scene sg.tamae_post
tamae: {昼|ひる} の {波|なみ} は {相変|あいか}わらず だ よ 。 {手伝|てつだ}い に {来|き}た の かい ？ …… {冗談|じょうだん} 。 {座|すわ}りな 。 || The lunch wave's as fierce as ever. Come to help? …Joking. Sit down.
tamae: {姉|あね} から {返事|へんじ} が {来|き}た よ 。 {来年|らいねん} 、 {遊|あそ}びに {来|く}る って さ 。 {部屋|へや} を {一|ひと}つ 、 {空|あ}けて おかない と 。 || My sister wrote back. She's coming to visit next year. I'll have to keep a room free.
!choice
* {休|やす}みます 。 || We'll rest. -> rest
* また {来|き}ます 。 || We'll come again. -> end
:rest
!inn

@scene sg.inn_table
narr: {常連|じょうれん} の {席|せき} らしい 。 {卓|たく} に {傷|きず} で 「ダイゴ」 と {彫|ほ}って ある 。 {誰|だれ} か が その {下|した} に 「{彫|ほ}る な 」 と {彫|ほ}って いる 。 || A regular's seat, by the look of it. "DAIGO" is scratched into the table. Underneath, someone has scratched "DON'T CARVE THE TABLE".

@scene sg.inn_stairs
narr: {二階|にかい} の {客室|きゃくしつ} へ {続|つづ}く {階段|かいだん} 。 {一段|いちだん} {目|め} が {鳴|な}る 。 || Stairs up to the guest rooms. The first step creaks.

@scene sg.inn_menu
narr: {壁|かべ} の {品書|しなが}き 。 「{焼|や}き{魚|ざかな} ・ {味噌汁|みそしる} ・ ご{飯|はん} ・ おにぎり ・ お{茶|ちゃ}」 。 {値段|ねだん} の {所|ところ} だけ 、 {何度|なんど} も {書|か}き{直|なお}した {跡|あと} が ある 。 || The menu on the wall: "Grilled fish, miso soup, rice, rice balls, tea". The prices have been rewritten many times.
?(!sg_boss_done) narr: {値段|ねだん} の {字|じ} が 、 {時々|ときどき} {揺|ゆ}れて いる 。 || The prices waver now and then.

@scene sg.nao_cameo
nao: よう 。 {葦|あし}ノ{瀬|せ} から の {郵便|ゆうびん} 、 {届|とど}けた とこ だ 。 {宛名|あてな} の {読|よ}める {分|ぶん} は な 。 || Hey. Just dropped off the post from Reedwake. The ones with readable addresses, anyway.
nao: {残|のこ}り は タマエ さん の {袋|ふくろ} の {中|なか} 。 {読|よ}めない {宛名|あてな} を {当|あ}てる の は 、 {配達人|はいたつにん} の {仕事|しごと} じゃ ない 。 …… そっち の {仕事|しごと} だろ 。 || The rest are in Tamae's bag. Guessing unreadable addresses isn't a courier's job. …That's your line of work, isn't it.
?(comp=mio) nao: ミオ 、 {干物|ひもの} を {買|か}い{込|こ}む な よ 。 {鞄|かばん} が {魚|さかな} {臭|くさ}く なる 。 || Mio, don't stock up on dried fish. Your bag'll reek.
?(comp=ren) nao: レン 、 {港|みなと} で {迷|まよ}う な よ 。 {海|うみ} が {見|み}える {方|ほう} が {南|みなみ} だ 。 || Ren, don't get lost in the harbour. The side where you can see the sea is south.
?(comp=suzu) nao: スズ 、 {宿代|やどだい} は {先|さき} に {払|はら}え よ 。 {前|まえ} の {分|ぶん} 、 まだ {噂|うわさ} に なってる ぞ 。 || Suzu, pay for your room up front. People are still talking about last time.
nao[closed]: …… じゃ 、 {次|つぎ} の {便|びん} が ある から 。 {右|みぎ} の {桟橋|さんばし} は {歩|ある}く な よ 。 || …Right. Got the next run. Stay off the right-hand pier.

@scene sg.wataru_post
wataru: {港|みなと} の ラベル は 、 {全部|ぜんぶ} {僕|ぼく} の {字|じ} に なりました 。 {時々|ときどき} 、 {自分|じぶん} の {字|じ} に {見張|みは}られて いる {気|き} が します 。 || Every label in the harbour is in my hand now. Sometimes I feel my own handwriting is keeping an eye on me.
wataru: {借金|しゃっきん} は 、 あと {半分|はんぶん} です 。 {母|はは} の {船|ふね} も 、 {春|はる} に は {直|なお}ります 。 || Half the debt left to go. And my mother's boat will be mended by spring.
?(end_archive_library) wataru[smile]: {山|やま} の {書庫|しょこ} が 、 {誰|だれ} でも {入|はい}れる {図書館|としょかん} に なった そう です ね 。 {港|みなと} の {帳簿|ちょうぼ} の {写|うつ}し も 、 {送|おく}る こと に しました 。 {今度|こんど} は 、 {誰|だれ} でも {読|よ}める よう に 。 || I hear the archive in the mountains has become a library anyone can enter. We've decided to send copies of the harbour ledgers there. This time, for anyone to read.
?(end_archive_closed) wataru: {山|やま} の {書庫|しょこ} は {閉|と}じた そう です ね 。 {港|みなと} の {記録|きろく} は 、 {港|みなと} で {守|まも}ります 。 {字|じ} の {綺麗|きれい} な {人|ひと} が いる ので 。 …… {僕|ぼく} です 。 || I hear the archive in the mountains has been closed. The harbour's records, the harbour will keep. We have someone with fine handwriting. …Me.

@scene sg.tetsu_idle
tetsu: …… {潮|しお} が {変|か}わる 。 || …Tide's turning.
?(!sg_ferry_done) tetsu: {時刻表|じこくひょう} を {見|み}た か 。 {見|み}て から {来|こ}い 。 || Seen the board? Look at it, then come back.
?(sg_fog_cleared) tetsu: {岬|みさき} の {風見|かざみ} が {回|まわ}ってる 。 …… {久|ひさ}しぶり に 、 {背中|せなか} で {風|かぜ} を {感|かん}じた 。 || The vane on the point is turning. …First time in a while I've felt the wind on my back.

@scene sg.tetsu_history
tetsu: {沈|しず}んだ {書庫|しょこ} へ {行|い}く の か 。 || Going to the drowned archive, are you.
tetsu: …… {子|こ}ども の {頃|ころ} 、 {親父|おやじ} の {船|ふね} で {島|しま} の {近|ちか}く を {通|とお}った 。 {聞|き}きたい か 。 || …When I was a boy, I passed near the island on my father's boat. Want to hear it?
!choice
* {聞|き}かせて ください 。 || Please tell us. -> tell
* また {今度|こんど} 。 || Another time. -> end
:tell
!activity sg.a_history
!if var._res=0 -> end
tetsu: …… {鐘|かね} が {鳴|な}る と 、 {親父|おやじ} は {必|かなら}ず {船|ふね} を {止|と}めて 、 {帽子|ぼうし} を {取|と}った 。 {理由|りゆう} は {聞|き}かなかった 。 || …Whenever the bell rang, my father always stopped the boat and took off his hat. I never asked why.
tetsu: {今|いま} に なって {思|おも}う 。 {手紙|てがみ} を {送|おく}る {音|おと} に 、 {頭|あたま} を {下|さ}げて いた ん だろう な 。 || I think now he was bowing to the sound of letters being sent on.

@scene sg.tetsu_ferry
tetsu: {船|ふね} は {出|で}る 。 {満|み}ち{潮|しお} で な 。 {板|いた} も 、 もう {嘘|うそ} は つかない 。 || The boat sails. On the high tide. And the board's stopped lying.
?(quest.sg_lighthouse=2&!sg_nagisa_met) tetsu: …… ゲンゾウ の {娘|むすめ} が 、 {次|つぎ} の {便|びん} で {来|く}る そう だ 。 {爺|じい}さん 、 {朝|あさ} から {三回|さんかい} も {時刻表|じこくひょう} を {見|み}に {来|き}た 。 || …Genzō's girl is coming on the next boat, I hear. The old man's been down three times since morning to check the board.

@scene sg.tetsu_post
tetsu: {潮|しお} は {変|か}わらん 。 {人|ひと} は {変|か}わる 。 {悪|わる}く ない 。 || The tide doesn't change. People do. Not a bad thing.
?(end_mem_return) tetsu: {親父|おやじ} の {顔|かお} を 、 {急|きゅう} に {思|おも}い{出|だ}した 。 {帽子|ぼうし} を {取|と}る {時|とき} の {顔|かお} だ 。 …… {持|も}って いかれてた とは な 。 || My father's face came back to me all of a sudden. The face he made taking off his hat. …Didn't know it had been taken.
?(end_mem_choose) tetsu: {山|やま} の {書庫|しょこ} に 、 {自分|じぶん} の {棚|たな} が ある そう だ 。 {船|ふね} が {暇|ひま} な {日|ひ} に でも 、 {見|み}に {行|い}く か 。 || They say there's a shelf of mine in the mountain archive. Might go and look, some day the boat's idle.

@scene sg.daigo_idle
daigo: おう ！ {荷|に} が {重|おも}い と {腰|こし} に {来|く}る が 、 {札|ふだ} が {白|しろ}い と {頭|あたま} に {来|く}る ！ || Ho! Heavy cargo gets you in the back — but blank tags get you in the head!
?(quest.sg_main<=1) daigo: {港長|こうちょう} の {事務所|じむしょ} は {通|とお}り の {西|にし} 。 {石|いし} の {壁|かべ} の {建物|たてもの} だ 。 || The harbourmaster's office is at the west end of the street. The building with stone walls.

@scene sg.daigo_mid
daigo: {二番|にばん}{倉庫|そうこ} の ワタル ？ {真面目|まじめ} な {奴|やつ} だ よ 。 {真面目|まじめ} すぎて 、 {昼飯|ひるめし} も {食|く}わねえ 。 || Wataru at No. 2? Serious fellow. Too serious — doesn't even eat lunch.
?(sg_wataru_resolved) daigo: …… {話|はなし} は {聞|き}いた 。 {俺|おれ} も {昔|むかし} 、 {博打|ばくち} で {借金|しゃっきん} して な 。 {他人事|ひとごと} じゃ ねえ 。 {今度|こんど} 、 {昼飯|ひるめし} を おごって やる さ 。 || …I heard the story. Got into debt gambling myself, back in the day. Can't look down on him. I'll buy him lunch sometime.

@scene sg.daigo_after
daigo: {札|ふだ} が {白|しろ}く ならねえ ！ {荷|に} が {迷|まよ}わねえ ！ {仕事|しごと} が {楽|らく} だ ！ …… {暇|ひま} だ ！ || The tags stay put! The cargo doesn't wander! Work's easy! …Too easy!
?(ch2_done) daigo: {北|きた} へ {行|い}く の か 。 {灰実|はいみ} の {里|さと} の {酒|さけ} は {甘|あま}い ぞ 。 {飲|の}み{過|す}ぎる な よ 。 || Heading north? Cinder Orchard's wine is sweet. Don't overdo it.

@scene sg.daigo_post
daigo: よう 、 {久|ひさ}しぶり ！ {入|い}り{江|え} まで の {道|みち} 、 {今|いま} は {俺|おれ} も {右|みぎ} って {言|い}う よう に した ぜ 。 {陸|おか} から {見|み}て な ！ || Hey, long time! These days even I say "right" for the cove path. Seen from land, mind you!

@scene sg.dir_daigo
daigo: {入|い}り{江|え} ？ {簡単|かんたん} だ 。 {灯台|とうだい} を {右|みぎ} に {見|み}て 、 {崖|がけ} を {左|ひだり} に {回|まわ}り{込|こ}む 。 すぐ だ よ 。 || The cove? Easy. Keep the lighthouse on your right and go round the cliffs to the left. It's right there.
daigo: {船|ふね} で {港|みなと} に {入|はい}る とき は 、 いつも そう {見|み}える ん だ 。 || That's how it always looks coming into harbour by boat.
!set sg_dir_daigo
!var sg_dirs + 1
!call sg.dir_check

@scene sg.dir_tobi
tobi: {入|い}り{江|え} ？ {知|し}ってる ！ {道標|みちしるべ} の {所|ところ} を {右|みぎ} ！ {右|みぎ} に {行|い}って 、 {階段|かいだん} を {下|お}りる の ！ || The cove? I know! Go right at the signpost! Right, and then down the steps!
tobi: {海|うみ} を {見|み}て 、 {右|みぎ} だ よ 。 ダイゴ の おっちゃん は {左|ひだり} って {言|い}う けど 、 {違|ちが}う から ね ！ || Facing the sea — right! Uncle Daigo says left, but he's wrong!
!set sg_dir_tobi
!var sg_dirs + 1
!call sg.dir_check

@scene sg.dir_kiyo
kiyo: {入|い}り{江|え} かい 。 お{日|ひ}さま の {昇|のぼ}る ほう だ よ 。 {朝|あさ} 、 あの {子|こ} は いつも {朝日|あさひ} に {向|む}かって {出|で}て いった 。 || The cove? Where the sun comes up. Mornings, that boy always set off straight into the sunrise.
kiyo[worry]: …… {行|い}く なら 、 {網|あみ} を {持|も}って {帰|かえ}って きて おくれ 。 あの {子|こ} を 、 {崖|がけ} の {道|みち} に は {行|い}かせたく ない ん だ よ 。 || …If you're going, bring back the nets, would you. I don't want that boy on the cliff path.
!set sg_dir_kiyo
!var sg_dirs + 1
!call sg.dir_check

@scene sg.dir_check
!if quest.sg_cove>=1 -> end
!if var.sg_dirs>=3 -> think
?(var.sg_dirs=1) narr: {他|ほか} の {人|ひと} に も {聞|き}いて みよう 。 || Ask someone else too.
?(var.sg_dirs=2) narr: {言|い}う こと が {違|ちが}う 。 もう {一人|ひとり} に {聞|き}いて みよう 。 || They don't agree. Ask one more person.
!end
:think
?(comp=ren) comp[think]: {左|ひだり} 、 {右|みぎ} 、 {日|ひ} の {昇|のぼ}る ほう 。 …… {正直|しょうじき} に {言|い}う と 、 {私|わたし} に は {全部|ぜんぶ} {同|おな}じ に {聞|き}こえます 。 || Left, right, towards the sunrise. …To be honest, they all sound the same to me.
?(comp=ren) pc: レン は {方向|ほうこう} {音痴|おんち} だ もん ね 。 || You're hopeless with directions, Ren.
?(comp=ren) comp[shy]: {灯守|ひもり} に {地図|ちず} は {要|い}りません 。 {道|みち} に {灯|ひ} が ある ので 。 …… {今|いま} は 、 ありません ね 。 || A lantern keeper doesn't need a map. The road has lights. …Which, at the moment, it doesn't.
pc: ダイゴ さん は {船乗|ふなの}り だ 。 {海|うみ} から {港|みなと} を {見|み}て {話|はな}して いる 。 || Daigo's a sailor. He's describing it as if looking at the harbour from the sea.
pc: トビ は {海|うみ} の ほう を {向|む}いて {話|はな}して いた 。 {向|む}き が {逆|ぎゃく} だ から 、 {右|みぎ} と {左|ひだり} も {逆|ぎゃく} に なる 。 || Tobi was facing the sea. They're facing opposite ways, so their right and left are swapped.
pc: キヨ さん の 「{日|ひ} の {昇|のぼ}る ほう 」 は {東|ひがし} 。 {三人|さんにん} とも 、 {同|おな}じ {場所|ばしょ} を {指|さ}して いた ん だ 。 || And Kiyo's "where the sun comes up" is east. All three were pointing at the same place.
?(comp=nao) comp[smirk]: {嘘|うそ} でも {静寂|しじま} でも ない 。 ただ の {勘違|かんちが}い 。 …… これ で {三種類|さんしゅるい} {揃|そろ}った な 。 || Not a lie, not the Hush. Just a plain mix-up. …That's all three kinds collected.
?(comp=mio) comp[smile]: {誰|だれ} も {間違|まちが}って なかった ん だ ね 。 {見|み}て いる ほう が {違|ちが}った だけ 。 || None of them was wrong. They were just looking different ways.
?(comp=suzu) comp[laugh]: {舞台|ぶたい} の {上手|かみて} と {下手|しもて} と {同|おな}じ ね ！ {客席|きゃくせき} から と {舞台|ぶたい} から じゃ 、 {右|みぎ} と {左|ひだり} が {逆|ぎゃく} 。 || Like stage left and stage right! From the audience or from the stage, left and right swap.
?(comp=ren) comp: …… なるほど 。 {正|ただ}しい {言葉|ことば} でも 、 {立|た}つ {場所|ばしょ} が {違|ちが}えば {食|く}い{違|ちが}う 。 {覚|おぼ}えて おきます 。 {迷子|まいご} の {言|い}い{訳|わけ} に 。 || …I see. Correct words can still disagree if people stand in different places. I'll remember that — as an excuse for getting lost.
pc: {道標|みちしるべ} を {直|なお}そう 。 {大通|おおどお}り の {東|ひがし} の {端|はし} 、 {崖|がけ} の {道|みち} の {入|い}り{口|ぐち} だ 。 || Let's put the signpost right. East end of the main street, where the cliff path starts.
!quest sg_cove 1

@scene sg.kiyo_idle
kiyo: {安|やす}い よ 、 {安|やす}い よ ！ …… って {言|い}いたい ん だ けど 、 {魚|さかな} が ない ん だ よ ね 。 {網|あみ} が {入|い}り{江|え} に {置|お}きっぱなし で さ 。 || Cheap, cheap! …Is what I'd like to shout, but there's no fish. The nets are stuck out at the cove.
?(quest.sg_main>=4) kiyo: {塩|しお} の {樽|たる} 、 {返|かえ}した よ 。 ワタル が {頭|あたま} を {下|さ}げに {来|き}て さ 。 …… あの {子|こ} 、 {昔|むかし} から {字|じ} だけ は {上手|うま}かった ねぇ 。 || I gave the salt barrels back. Wataru came round to apologise. …That boy always did have lovely handwriting.

@scene sg.kiyo_fish
kiyo: {安|やす}い よ 、 {安|やす}い よ ！ {今朝|けさ} の {鯵|あじ} だ よ ！ {網|あみ} が {戻|もど}った から ね ！ || Cheap, cheap! This morning's horse mackerel! The nets are back!
kiyo[smile]: ソウタ は {岸|きし} で {釣|つ}ってる 。 {沖|おき} に は まだ {出|だ}さない よ 。 {灯台|とうだい} の {灯|ひ} が {元|もと} に {戻|もど}る まで は ね 。 || Sōta's fishing from the shore. I'm not letting him out to sea yet — not till the lighthouse is burning properly again.

@scene sg.kiyo_post
kiyo: {今日|きょう} の {一番|いちばん} は {鯛|たい} だ よ ！ …… {値段|ねだん} ？ {札|ふだ} を {見|み}な 。 {札|ふだ} は もう {嘘|うそ} を つかない から ね 。 {高|たか}い けど 。 || Today's best is sea bream! …The price? Read the tag. Tags don't lie any more. It's expensive, mind.

@scene sg.stall_kiyo
narr: キヨ の {屋台|やたい} 。 {札|ふだ} が {並|なら}んで いる 。 「{鯵|あじ}」 「{鯖|さば}」 「{烏賊|いか}」 。 || Kiyo's stall. A row of price tags: "Horse mackerel", "Mackerel", "Squid".
?(!quest.sg_cove=done) narr: {札|ふだ} の {上|うえ} に 、 {魚|さかな} は {一匹|いっぴき} も いない 。 || There isn't a single fish above the tags.
?(comp=ren) comp: イカ は いかが 。 …… {失礼|しつれい} しました 。 || "Ika wa ikaga?" — squid, anyone? …My apologies.

@scene sg.stall_empty
narr: {空|から} の {屋台|やたい} 。 {札|ふだ} に 「{休業|きゅうぎょう} ・ {網|あみ} {不在|ふざい} の ため」 。 || An empty stall. A tag reads: "Closed — nets absent."

@scene sg.market_table
narr: {魚|さかな} を {捌|さば}く {台|だい} 。 {包丁|ほうちょう} が {三本|さんぼん} 、 {大|おお}きさ の {順|じゅん} に {並|なら}んで いる 。 || A table for gutting fish. Three knives laid out in order of size.
?(comp=mio) comp[smile]: {大|おお}きさ の {順|じゅん} 。 {分|わ}かってる ね 、 キヨ さん 。 || In order of size. Kiyo knows what she's doing.

@scene sg.quay_crate
narr: {積|つ}み{上|あ}げた {木箱|きばこ} 。 {新|あたら}しい ラベル に 、 {丁寧|ていねい} な {字|じ} 。 || Stacked crates. New labels, in careful handwriting.
?(sg_wataru_resolved) narr: {角|かど} に 、 {小|ちい}さく 「ワ」 と {書|か}いて ある 。 {書|か}いた {人|ひと} の {印|しるし} だ 。 || In the corner, a small ワ. The writer's mark.

@scene sg.sota_early
sota: {網|あみ} が {入|い}り{江|え} に {置|お}きっぱなし で …… 。 あ 、 すみません 、 {独|ひと}り{言|ごと} です 。 || My nets are stuck out at the cove… Oh — sorry, just talking to myself.

@scene sg.sota_start
sota: あ 、 {港長|こうちょう} の {手伝|てつだ}い の {人|ひと} ？ {頼|たの}み が ある ん です けど 。 || Oh — you're helping the harbourmaster? I've got a favour to ask.
sota: {嵐|あらし} の {前|まえ} に 、 {網|あみ} を {入|い}り{江|え} に {干|ほ}して きた ん です 。 {取|と}りに {行|い}きたい のに 、 {崖|がけ} の {道|みち} が おかしくて 。 {歩|ある}いて も {歩|ある}いて も 、 {港|みなと} に {戻|もど}って くる 。 || Before the storm I left my nets drying at the cove. I want to fetch them, but the cliff path's gone wrong. However far you walk, you end up back at the harbour.
sota[worry]: {道標|みちしるべ} は {字|じ} が {消|き}えてる し 、 {人|ひと} に {聞|き}いたら 、 みんな {言|い}う こと が {違|ちが}う ん です よ 。 || The signpost's lost its writing, and when you ask people, everyone tells you something different.
sota: {岩|いわ} に {船|ふね} を {擦|す}った {晩|ばん} から 、 {母|かあ}さん が 「{沖|おき} に {出|で}る な 」 って うるさくて 。 せめて {網|あみ} だけ でも 。 || Ever since I scraped the boat on the rocks, Mum's been on at me not to go out. At least let me have my nets back.
!quest sg_cove start
narr: {入|い}り{江|え} へ の {道|みち} を 、 {港|みなと} の {人|ひと} に {聞|き}いて みよう 。 ダイゴ 、 トビ 、 キヨ …… 。 || Ask around the harbour for the way to the cove. Daigo, Tobi, Kiyo…

@scene sg.sota_wait
sota: {入|い}り{江|え} へ の {道|みち} 、 {分|わ}かりました か ？ || Did you find the way to the cove?
?(quest.sg_cove=0) sota: ダイゴ さん と 、 トビ と 、 {母|かあ}さん に {聞|き}いて みて ください 。 {三人|さんにん} とも 、 {全然|ぜんぜん} {違|ちが}う こと を {言|い}う ので 。 || Try asking Daigo, Tobi, and my mum. All three say completely different things.
?(quest.sg_cove=1) sota: {道標|みちしるべ} を {直|なお}す ？ …… {字|じ} が {消|き}えた {道標|みちしるべ} に 、 {字|じ} を {書|か}く ん です か 。 すごい な 。 || Fix the signpost? …Write the words back onto a blank signpost? Amazing.
?(quest.sg_cove=2) sota: {網|あみ} は {入|い}り{江|え} の {奥|おく} 、 {崖|がけ} の {下|した} の {岩|いわ} に {掛|か}けて あります 。 || The nets are hung on the rocks under the cliff, at the back of the cove.

@scene sg.sota_nets
sota[laugh]: {網|あみ} ！ ありがとう ！ これ で {明日|あした} から {沖|おき} に …… じゃ なくて 、 {岸|きし} から {釣|つ}り が できる ！ || My nets! Thank you! Now from tomorrow I can go out to s— I mean, fish from the shore!
?(sg_wataru_resolved) sota: ワタル さん が {謝|あやま}りに {来|き}ました よ 。 {油|あぶら} の こと 。 …… {岩|いわ} に {擦|す}った の は 、 {僕|ぼく} が {急|いそ}いだ から でも ある ん です けど ね 。 || Wataru came to apologise. About the oil. …Though I scraped the rocks partly because I was in a hurry.
sota: {母|かあ}さん と {相談|そうだん} して 、 これ を 。 ガラス の {浮|う}き{玉|だま} です 。 {沈|しず}まない から 、 {縁起物|えんぎもの} なん です 。 || Mum and I talked it over — here. A glass float. It never sinks, so it's good luck.
!take sg_nets
!quest sg_cove done
?(comp=nao) comp: {網|あみ} の {配達|はいたつ} 、 {完了|かんりょう} 。 {重|おも}かった ぞ 。 || Net delivery, complete. It was heavy.
?(comp=mio) comp[smile]: {浮|う}き{玉|だま} 、 きれい 。 {光|ひかり} に {透|す}かす と 、 {海|うみ} の {色|いろ} が する 。 || The float's beautiful. Hold it to the light and it's the colour of the sea.
?(comp=ren) comp: {沈|しず}まない {縁起物|えんぎもの} 。 …… {私|わたし} の {方向|ほうこう} {感覚|かんかく} も 、 {沈|しず}まなければ いい の です が 。 || A charm that never sinks. …If only my sense of direction would stay afloat too.
?(comp=suzu) comp[smile]: {礼|れい} は {受|う}け{取|と}って おく わ 。 {断|ことわ}る の は 、 {失礼|しつれい} だ もの 。 || We'll accept the thanks. It'd be rude to refuse.

@scene sg.sota_after
sota: {岸|きし} から でも 、 {結構|けっこう} {釣|つ}れる ん です よ 。 {母|かあ}さん の {機嫌|きげん} も {直|なお}りました 。 || You catch a fair bit even from the shore. And Mum's in a better mood.
?(sg_boss_done) sota: {灯台|とうだい} の {灯|ひ} が {明|あか}るく なった から 、 {来週|らいしゅう} は {沖|おき} に {出|で}て いい って 。 やった ！ || The lighthouse is burning bright again, so she says I can go out next week. Yes!

@scene sg.sota_post
sota: {沖|おき} で {大物|おおもの} を {釣|つ}りました ！ …… {嘘|うそ} です 。 {中|ちゅう} くらい です 。 {札|ふだ} に {嘘|うそ} を {書|か}く と 、 {今|いま} は ワタル さん が {怒|おこ}る ので 。 || I caught a big one out at sea! …Not really. Medium. If you write a lie on a tag these days, Wataru gets cross.

@scene sg.tobi_idle
tobi: {海|うみ} ガラス 、 {見|み}る ？ {青|あお} は なかなか ない ん だ よ 。 {緑|みどり} と {白|しろ} は いっぱい ある けど 。 || Want to see my sea glass? Blue is really rare. There's loads of green and white though.
?(sg_boss_done) tobi: {空|そら} から {手紙|てがみ} が {降|ふ}って きた の 、 {見|み}た ？ {一通|いっつう} {拾|ひろ}った ！ {宛名|あてな} を {読|よ}んで 、 {届|とど}けた よ ！ || Did you see the letters falling out of the sky? I caught one! I read the address and delivered it!

@scene sg.tobi_glass
tobi: {青|あお} い {海|うみ} ガラス を {探|さが}してる の ？ {浜|はま} の {古|ふる}い {舟|ふね} の {近|ちか}く と 、 {入|い}り{江|え} に ある よ ！ {光|ひか}ってる から 、 すぐ {分|わ}かる ！ || Looking for blue sea glass? There's some near the old boat on the beach, and in the cove! It sparkles, so you'll spot it straight away!
tobi: {一|ひと}つ {見|み}つけたら 、 {一|ひと}つ {僕|ぼく} に …… いや 、 いい や 。 アサヒ ねえちゃん の ため なら 。 || If you find one, give one to m— no, never mind. If it's for Asahi, fine.

@scene sg.tobi_post
tobi: {大|おお}きく なったら 、 {配達人|はいたつにん} に なる ！ {右|みぎ} と {左|ひだり} を {間違|まちが}えない {配達人|はいたつにん} ！ || When I grow up I'm going to be a courier! A courier who never mixes up right and left!

@scene sg.fuku_idle
fuku: いい お{天気|てんき} ね 。 {風|かぜ} が ない の が 、 ちょっと {寂|さび}しい けど 。 || Lovely weather. It's a little lonely without the wind, though.
?(sg_fog_cleared) fuku: {風|かぜ} が {戻|もど}った わ ね 。 {洗濯物|せんたくもの} が よく {乾|かわ}く 。 || The wind's back. The washing dries nicely.
fuku: {西|にし} の {坂|さか} の イサム さん が いた {頃|ころ} は 、 この ベンチ で よく {将棋|しょうぎ} を {指|さ}した の 。 || When Isamu from up the west lane was still here, we'd play shōgi on this bench.
fuku[worry]: {春|はる} に 、 {具合|ぐあい} が {悪|わる}い のに {荷物|にもつ} を まとめて 、 {灯|ひ} の {道|みち} を {上|のぼ}って いって しまった 。 {手紙|てがみ} は {届|とど}いた か 、 と {何度|なんど} も {聞|き}かれた わ 。 {誰|だれ} に {出|だ}した {手紙|てがみ} か は 、 {言|い}わなかった けど 。 || In spring, sick as he was, he packed a bag and walked off up the lantern road. He kept asking me whether his letter had arrived. He never said who it was to.
?(comp=nao) comp[closed]: …… 。 || ……
?(comp=nao) fuku: あら 、 あなた …… {前|まえ} に イサム さん の {手紙|てがみ} を {取|と}りに {来|き}た {人|ひと} じゃ ない ？ || Oh — aren't you the one who came to collect Isamu's letters once?
?(comp=nao) comp: …… {人違|ひとちが}い だ よ 。 || …Wrong person.

@scene sg.bench_fuku
narr: {古|ふる}い ベンチ 。 {端|はし} に 、 {将棋|しょうぎ} の {駒|こま} が {一|ひと}つ {置|お}き{忘|わす}れられて いる 。 「{歩|ふ}」 。 || An old bench. A single shōgi piece has been left at one end: a pawn.

@scene sg.fuku_boat
fuku: アサヒ ちゃん に 、 {名札|なふだ} を {頼|たの}んだ の 。 {夫|おっと} の {船|ふね} の 。 || I asked little Asahi to make a nameplate. For my husband's boat.
fuku[worry]: {船|ふね} の {名前|なまえ} ？ …… それ が ね 、 {思|おも}い{出|だ}せない の よ 。 {四十年|よんじゅうねん} 、 {毎朝|まいあさ} {見送|みおく}った のに 。 {鳥|とり} の {名前|なまえ} だった と {思|おも}う ん だ けど 。 || The boat's name? …Well, you see, I can't remember it. Forty years I saw it off every morning. I think it was a bird's name.
fuku: {名前|なまえ} だけ が 、 すっぽり {抜|ぬ}けて いる の 。 {顔|かお} も {声|こえ} も {覚|おぼ}えて いる のに 。 {変|へん} ね 。 || Only the name has gone, cleanly. I remember his face, his voice. Isn't it strange.

@scene sg.fuku_plate
fuku: まあ 。 {何|なん} です か 、 {改|あらた}まって 。 || My. What's all this, so formal?
narr: {名札|なふだ} を {渡|わた}した 。 {青|あお}い ガラス で 、 「{千鳥丸|ちどりまる}」 。 || You hand her the nameplate. In blue glass: Chidori-maru.
fuku[surprise]: ちどり …… まる 。 || Chidori… maru.
fuku: …… ああ 。 ああ 、 そう 。 そう でした 。 || …Oh. Oh, yes. That's right.
fuku[sad]: {千鳥丸|ちどりまる} 。 あの {人|ひと} が {最後|さいご} に {乗|の}った {朝|あさ} 、 わたし 、 {喧嘩|けんか} を した ん です よ 。 {鍋|なべ} の {蓋|ふた} の こと で 。 つまらない こと で 。 || Chidori-maru. The morning he last sailed on her, we quarrelled. About a pot lid. Such a silly thing.
fuku[sad]: 「いってらっしゃい 」 も {言|い}わなかった 。 {名前|なまえ} と {一緒|いっしょ} に 、 それ も {忘|わす}れて いた の ね 。 {忘|わす}れて いた から 、 {楽|らく} だった の ね 。 || I didn't even say "take care". I'd forgotten that too, along with the name. And because I'd forgotten, it was easier.
?(comp=mio) comp[worry]: …… ごめんなさい 。 {辛|つら}い こと を {思|おも}い{出|だ}させて しまって 。 || …I'm sorry. We've made you remember something painful.
?(comp=nao) comp: …… {届|とど}け{物|もの} が 、 {重|おも}すぎた か 。 || …Was that delivery too heavy?
?(comp=ren) comp[sad]: {名|な} を {返|かえ}せば 、 {名|な} に {付|つ}いて いた もの も {戻|もど}る 。 …… {分|わ}かって いた はず なのに 。 || Give back a name, and everything attached to it comes back too. …I should have known.
?(comp=suzu) comp[closed]: …… {忘|わす}れた まま の ほう が 、 よかった ？ || …Would you rather have gone on forgetting?
fuku[closed]: いいえ 。 || No.
fuku: {喧嘩|けんか} も 、 あの {人|ひと} の {顔|かお} も 、 {鍋|なべ} の {蓋|ふた} も 、 {全部|ぜんぶ} わたし の もの です 。 {痛|いた}くて も 、 {人|ひと} に {預|あず}けて おく もの じゃ ない わ 。 || The quarrel, his face, the pot lid — all of it is mine. Even if it hurts, it's not something to leave in someone else's keeping.
fuku[smile]: {明日|あした} 、 {祠|ほこら} に {飾|かざ}って 、 {言|い}って きます 。 {四十年|よんじゅうねん} {遅|おく}れ の 「いってらっしゃい 」 を 。 || Tomorrow I'll put it up at the shrine and go and say it. Forty years late: "Take care."
fuku: それ と 、 これ 。 アサヒ ちゃん が 、 わたし が {泣|な}いたら {渡|わた}して って 。 …… {泣|な}きました から ね 。 || And these. Asahi said to give them to you if I cried. …Well, I did.
!take sg_plate
!quest sg_seaglass done

@scene sg.fuku_after
fuku: {祠|ほこら} に {飾|かざ}りました よ 。 {毎朝|まいあさ} 、 「いってらっしゃい 」 って {言|い}って ます 。 {返事|へんじ} は ない けど 、 {鳥|とり} が {鳴|な}く の 。 || I put it up at the shrine. Every morning I say "take care". He doesn't answer, but a bird always sings.

@scene sg.fuku_post
fuku: {今日|きょう} も {言|い}って きました よ 。 「いってらっしゃい 」 。 || I went and said it again today. "Take care."
?(end_mem_return) fuku: {山|やま} から {思|おも}い{出|で}が {帰|かえ}って きた {時|とき} 、 {町|まち} じゅう で {泣|な}き{声|ごえ} が した わ 。 {痛|いた}い けど 、 {自分|じぶん} の もの だ から 。 わたし は {先|さき} に {練習|れんしゅう} して おいて よかった 。 || When the memories came back down from the mountain, the whole town was crying. It hurts, but they're ours. I'm glad I'd had some practice first.
?(end_mem_choose) fuku: {山|やま} の {書庫|しょこ} に は 、 {自分|じぶん} で {取|と}りに {行|い}く ん です って ね 。 わたし は もう {行|い}きました 。 {一|ひと}つ だけ 、 {置|お}いて きた の 。 {内緒|ないしょ} よ 。 || They say you go and fetch your own from the mountain archive now. I've been already. I left one thing behind. Don't tell anyone.

@scene sg.door_fuku
narr: フク の {家|いえ} の {戸|と} 。 {中|なか} から 、 {鼻歌|はなうた} が {聞|き}こえる 。 || Fuku's door. Someone inside is humming.

@scene sg.door_wh1
narr: {一番|いちばん}{倉庫|そうこ} 。 {扉|とびら} に {札|ふだ} 。 「{棚卸|たなおろ}し {中|ちゅう} ・ {港長|こうちょう} の {許可|きょか} {無|な}く {開|あ}ける べからず」 。 || No. 1 warehouse. A notice on the door: "Stocktaking in progress — not to be opened without the harbourmaster's permission."

@scene sg.notice
narr: {港|みなと} の {掲示板|けいじばん} 。 || The harbour noticeboard.
narr: 「{渡|わた}し{船|ぶね} {運休|うんきゅう} ・ {再開|さいかい} は {港長|こうちょう} が {決|き}める」 。 「{落|お}とし{物|もの} ： {猫|ねこ} ・ {茶色|ちゃいろ} ・ {名前|なまえ} は {忘|わす}れた 」 。 || "Ferry suspended — the harbourmaster will decide when it resumes." "Lost: cat. Brown. Forgot its name."
?(sg_boss_done) narr: {新|あたら}しい {紙|かみ} 。 「{猫|ねこ} ・ {見|み}つかりました 。 {名前|なまえ} も {思|おも}い{出|だ}しました 。 タマ です 」 。 || A new notice: "Cat found. Also remembered its name. It's Tama."

@scene sg.sign_office
narr: {看板|かんばん} 。 「{潮硝子|しおがらす} {港|みなと} {事務所|じむしょ}」 。 || A sign: "Saltglass Harbour Office".

@scene sg.sign_inn
narr: {看板|かんばん} 。 「{宿|やど} ・ {食事|しょくじ} かもめ{亭|てい}」 。 {文字|もじ} の {横|よこ} に 、 {下手|へた} な カモメ の {絵|え} 。 || A sign: "Lodging and meals — The Gull". Next to the words, a badly drawn gull.

@scene sg.sign_glass
narr: {看板|かんばん} 。 「ガラス {工房|こうぼう} ・ {朝日|あさひ}」 。 {下|した} に {小|ちい}さく 「{修理|しゅうり} も {承|うけたまわ}ります」 。 || A sign: "Glassworks — Asahi". Beneath, smaller: "Repairs also undertaken."

@scene sg.sign_wh
narr: {看板|かんばん} 。 「{二番|にばん}{倉庫|そうこ} ・ {係|かかり} ワタル」 。 || A sign: "No. 2 Warehouse — Clerk: Wataru".

@scene sg.mailbox
narr: {郵便|ゆうびん} {受|う}け 。 {投函口|とうかんぐち} に 、 {紙|かみ} が {貼|は}って ある 。 「{宛名|あてな} は はっきり {書|か}いて ください 」 。 || A postbox. A paper is stuck over the slot: "Please write addresses clearly."
?(sg_boss_done) narr: {誰|だれ} か が {書|か}き{足|た}して いる 。 「{書|か}いた {字|じ} は 、 {読|よ}んで あげて ください 」 。 || Someone has added a line: "And please read what's written."

@scene sg.beach_boat
narr: {砂|すな} に {引|ひ}き{上|あ}げられた {古|ふる}い {小舟|こぶね} 。 {子|こ}ども の {隠|かく}れ{家|が} に なって いる らしい 。 {中|なか} に {貝殻|かいがら} の {山|やま} 。 || An old dinghy hauled up on the sand. It seems to have become a children's hideout: there's a heap of shells inside.

@scene sg.glass_pick1
!set sg_glass1
!give sg_seaglass
narr: {波打|なみう}ち{際|ぎわ} で 、 {青|あお}い {欠片|かけら} が {光|ひか}って いた 。 {角|かど} の {丸|まる}い 、 {海|うみ} ガラス だ 。 || Something blue glints at the water's edge: a piece of sea glass, its edges worn round.

@scene sg.glass_pick2
!set sg_glass2
!give sg_seaglass
narr: {古|ふる}い {小舟|こぶね} の {陰|かげ} に 、 {青|あお}い {海|うみ} ガラス 。 {誰|だれ} か が {見|み}つけて 、 {隠|かく}して おいた の かも しれない 。 || In the shadow of the old dinghy: a piece of blue sea glass. Maybe someone found it and hid it here.

@scene sg.glass_pick3
!set sg_glass3
!give sg_seaglass
narr: {入|い}り{江|え} の {砂|すな} の {中|なか} に 、 {青|あお}い {光|ひかり} 。 {海|うみ} ガラス だ 。 || A blue gleam in the cove's sand. Sea glass.

@scene sg.glass_pick4
!set sg_glass4
!give sg_seaglass
narr: {潮|しお} だまり の {底|そこ} に 、 {青|あお}い {海|うみ} ガラス が {沈|しず}んで いた 。 || At the bottom of a rock pool lies a piece of blue sea glass.

@scene sg.asahi_early
asahi: いらっしゃい ！ …… って {言|い}いたい ところ だ けど 、 {炉|ろ} が {冷|つめ}たい ん だ よね 。 {注文|ちゅうもん} した {灰|はい} が {届|とど}かなくて 。 || Welcome! …Is what I'd like to say, but the furnace is cold. The ash I ordered never came.
asahi: {嵐|あらし} の せい だ って 。 …… {嵐|あらし} って 、 {便利|べんり} な {言葉|ことば} だ よ ね 。 || The storm's fault, apparently. …"The storm" is a handy word, isn't it.

@scene sg.asahi_order
asahi: ねぇ 、 {今|いま} {暇|ひま} ？ …… {暇|ひま} じゃ ない よ ね 。 でも {聞|き}いて 。 || Hey, got a minute? …You don't, do you. Listen anyway.
asahi: フク さん から {注文|ちゅうもん} が {入|はい}った の 。 {亡|な}くなった {旦那|だんな} さん の {船|ふね} の {名札|なふだ} を 、 {海|うみ} ガラス で {作|つく}って ほしい って 。 {浜|はま} の {祠|ほこら} に {飾|かざ}る ん だ って 。 || I got an order from Fuku. She wants a nameplate for her late husband's boat, made of sea glass, to put up at the little shrine on the beach.
asahi: {海|うみ} ガラス なら 、 {炉|ろ} が {冷|つめ}たくて も {削|けず}って {並|なら}べる だけ だ から 、 できる 。 {問題|もんだい} は {二|ふた}つ 。 || With sea glass I just cut it and set it — I can do that even with the furnace cold. There are two problems.
asahi: {一|ひと}つ 、 {青|あお}い {海|うみ} ガラス が {三|みっ}つ {要|い}る 。 {浜|はま} で {拾|ひろ}える ん だ けど 、 {店番|みせばん} が いない から {離|はな}れられなくて 。 || One: I need three pieces of blue sea glass. You can pick them up on the shore, but there's no one to mind the shop, so I can't leave.
asahi: {二|ふた}つ 、 …… これ は {後|あと} で {話|はな}す 。 まず は ガラス ！ || Two… I'll tell you later. Glass first!
!quest sg_seaglass start

@scene sg.asahi_waitglass
asahi: {青|あお}い の を {三|みっ}つ ね 。 {浜|はま} と 、 {入|い}り{江|え} に ある はず 。 トビ が {詳|くわ}しい よ 。 || Three blue pieces. There should be some on the beach and in the cove. Tobi knows where to look.
?(item.sg_seaglass=1) asahi: {今|いま} {一|ひと}つ か 。 あと {二|ふた}つ ！ || One so far? Two more!
?(item.sg_seaglass=2) asahi: {二|ふた}つ ！ あと {一|ひと}つ ！ || Two! One more!

@scene sg.asahi_glass
asahi: {青|あお} ！ {三|みっ}つ ！ しかも {角|かど} が {丸|まる}い 。 いい {目|め} してる ね 。 || Blue! Three! And the edges are nicely rounded. You've got a good eye.
!take sg_seaglass 3
asahi[worry]: で 、 {二|ふた}つ {目|め} の {問題|もんだい} 。 {船|ふね} の {名前|なまえ} が {分|わ}からない の 。 || Now, problem number two. I don't know the boat's name.
asahi: フク さん {本人|ほんにん} が {思|おも}い{出|だ}せない ん だ って 。 {四十年|よんじゅうねん} {毎朝|まいあさ} {見送|みおく}った {船|ふね} なのに 。 {港|みなと} の {誰|だれ} に {聞|き}いて も 、 {思|おも}い{出|だ}せない 。 || Fuku herself can't remember. A boat she saw off every morning for forty years. And nobody else in the harbour can remember either.
asahi[think]: {変|へん} だ よ ね 。 {名前|なまえ} だけ が 、 すっぽり {抜|ぬ}けてる 。 || Strange, isn't it? Only the name's gone, cleanly.
?(comp=ren) comp: …… {棚|たな} に {上|あ}げられた の かも しれません 。 || …Perhaps it's been shelved.
!if item.sg_registry -> have
!quest sg_seaglass 1
!end
:have
pc: …… もしかして 、 これ ？ || …Could it be this?
!call sg.asahi_name

@scene sg.asahi_waitname
asahi: {船|ふね} の {名前|なまえ} 、 {分|わ}かった ？ …… だよ ね 。 {誰|だれ} に {聞|き}いて も 、 {同|おな}じ {顔|かお} を する の 。 {喉|のど} まで {出|で}てる の に 、 って 。 || Found the boat's name? …Thought not. Everyone makes the same face: it's right on the tip of my tongue.
?(sg_da_seen) asahi[think]: {沈|しず}んだ {書庫|しょこ} に 、 {名前|なまえ} が {集|あつ}められてる って {本当|ほんとう} ？ {船|ふね} の {名前|なまえ} も 、 そこ に ある の かな 。 || Is it true names are being collected in the drowned archive? Maybe the boat's name is there too.

@scene sg.asahi_name
narr: {登録|とうろく} カード を {見|み}せた 。 「{船名|せんめい} ： {千鳥丸|ちどりまる}」 。 || You show her the registry card. "Vessel: Chidori-maru."
asahi[surprise]: ちどり {丸|まる} …… ！ そう だ 、 {千鳥丸|ちどりまる} だ ！ {子|こ}ども の {頃|ころ} 、 {船|ふね} の {横|よこ} に {鳥|とり} の {絵|え} が {描|か}いて あった ！ || Chidori-maru…! That's it — Chidori-maru! When I was little there was a bird painted on its side!
!take sg_registry
asahi: {待|ま}って て 。 {今|いま} {作|つく}る 。 || Wait here. I'll make it now.
!fade out
narr: アサヒ は {黙|だま}って {手|て} を {動|うご}かした 。 {削|けず}る {音|おと} 、 {磨|みが}く {音|おと} 。 {窓|まど} の {外|そと} で 、 カモメ が {鳴|な}いた 。 || Asahi works in silence. The sound of cutting; of polishing. Outside the window, a gull cries.
!fade in
!give sg_plate
asahi[smile]: できた 。 …… {自分|じぶん} で {渡|わた}したい けど 、 {泣|な}く かも しれない から 、 {頼|たの}む 。 フク さん に {届|とど}けて 。 || Done. …I'd hand it over myself, but I might cry, so — please. Take it to Fuku.
!quest sg_seaglass 3

@scene sg.asahi_plate_wait
asahi: {名札|なふだ} 、 フク さん に {渡|わた}して くれた ？ {丘|おか} の {上|うえ} の 、 {煙突|えんとつ} の ある {家|いえ} だ よ 。 || Did you give Fuku the nameplate? She's up the hill — the house with the chimney.

@scene sg.asahi_after
asahi: フク さん 、 {泣|な}いてた ？ …… そっか 。 {泣|な}いて 、 {笑|わら}ってた ？ …… そっか 。 よかった 。 || Did Fuku cry? …I see. Cried, and then laughed? …I see. Good.
asahi[think]: ねぇ 。 {名前|なまえ} って 、 {言|い}わなく なる と {消|き}える の かな 。 フク さん 、 {船|ふね} の {名前|なまえ} を {四十年|よんじゅうねん} {口|くち} に {出|だ}さなかった ん だ って 。 || Hey. Do you think names disappear when people stop saying them? Fuku says she hadn't said the boat's name out loud in forty years.
?(sg_boss_done) asahi[smile]: {灰|はい} も {届|とど}いた し 、 {炉|ろ} も {熱|あつ}い よ ！ {次|つぎ} は {窓|まど} ガラス を {作|つく}る ん だ 。 {港|みなと} じゅう の ！ || And my ash has arrived, and the furnace is hot! Next I'm making window glass. For the whole harbour!

@scene sg.asahi_post
asahi: {新|あたら}しい {作品|さくひん} ！ {海|うみ} ガラス の {風鈴|ふうりん} ！ {風|かぜ} が {吹|ふ}く と 、 {名前|なまえ} を {呼|よ}ぶ みたい な {音|おと} が する の 。 …… {気|き} の せい だ けど 。 || New piece! A sea-glass wind chime! When the wind blows, it sounds like someone calling a name. …My imagination, probably.
?(end_archive_library) asahi: {山|やま} の {図書館|としょかん} の {窓|まど} 、 うち の ガラス なんだ よ 。 {注文|ちゅうもん} が {来|き}た の ！ {名前|なまえ} を {読|よ}む {人|ひと} の ため の 、 {明|あか}るい {窓|まど} ！ || The windows of the library in the mountains are my glass! They ordered them! Bright windows, for people reading names!

@scene sg.glass_kiln
narr: ガラス を {溶|と}かす {炉|ろ} 。 || The furnace for melting glass.
?(!sg_boss_done) narr: {火|ひ} は {落|お}ちて いる 。 {灰|はい} の {匂|にお}い だけ が {残|のこ}って いる 。 || The fire is out. Only the smell of ash remains.
?(sg_boss_done) narr: {炉|ろ} の {中|なか} で 、 {橙色|だいだいいろ} の ガラス が ゆっくり {回|まわ}って いる 。 {熱|あつ}い 。 || Orange glass turns slowly inside the furnace. The heat is fierce.

@scene sg.glass_table
narr: {作業台|さぎょうだい} に {注文|ちゅうもん} の {紙|かみ} が {留|と}めて ある 。 「{浮|う}き{玉|だま} {十個|じっこ} ・ {灯台|とうだい} の ランプ の {火屋|ほや} {一|ひと}つ ・ {名札|なふだ}（フク {様|さま}）」 。 || Order slips are pinned to the workbench: "Floats ×10 — lighthouse lamp chimney ×1 — nameplate (Mrs Fuku)".

@scene sg.genzo_idle
genzo: {灯台|とうだい} に {用|よう} か 。 {階段|かいだん} は {急|きゅう} だ ぞ 。 {俺|おれ} の {膝|ひざ} が {言|い}ってる 。 || Business at the lighthouse? The stairs are steep. My knees say so.
?(sg_boss_done) genzo: {油|あぶら} が {全部|ぜんぶ} {届|とど}いた 。 {灯|ひ} は {太|ふと}い 。 {沖|おき} の {船|ふね} も 、 もう {迷|まよ}わん 。 || All the oil's arrived. The flame's good and fat. No boat out there'll lose its way now.

@scene sg.genzo_grump
genzo: {何|なん} だ 。 {灯台|とうだい} は {見世物|みせもの} じゃ ない ぞ 。 || What is it? The lighthouse isn't a sideshow.
?(comp=mio) genzo: {薬屋|くすりや} か 。 {飴|あめ} でも {売|う}りに {来|き}た の か 。 || An apothecary, eh? Come to sell me sweeties?
?(comp=mio) comp[angry]: {飴|あめ} では ありません 。 {薬|くすり} です 。 {膝|ひざ} が {痛|いた}い のに {平気|へいき} な {顔|かお} で {階段|かいだん} を {上|のぼ}る {意地|いじ}っ{張|ぱ}り に 、 よく {効|き}く の も あります けど 。 || Not sweeties. Medicine. I also have something that works very well on stubborn old men who climb stairs on bad knees and pretend they're fine.
?(comp=mio) genzo[surprise]: …… ふん 。 {言|い}う じゃ ない か 。 || …Hmph. You've got a tongue on you.
genzo: {機嫌|きげん} が {悪|わる}い の は 、 {娘|むすめ} の せい だ 。 {手紙|てがみ} を {寄越|よこ}した と {思|おも}ったら 、 「{迎|むか}え に {来|こ}なくて いい 」 だ と さ 。 || If I'm in a mood, blame my daughter. Finally sends a letter, and it says: "You don't have to come and meet me."
genzo[sad]: {十年|じゅうねん} {帰|かえ}って こない {娘|むすめ} が 、 {来|く}る な と {言|い}う 。 {分|わ}かり{易|やす}い {話|はなし} だ 。 || A daughter who hasn't been home in ten years tells me not to come. Plain enough.
?(comp=nao) comp: （…… {本当|ほんとう} に そう {書|か}いて ある の か ？ {読|よ}み{違|ちが}い は 、 {配達|はいたつ} の {間違|まちが}い より {多|おお}い ぞ 。） || (…Does it really say that? Misreadings happen more often than misdeliveries.)
?(comp=mio) comp: （「{来|こ}なくて いい 」 と 「{来|こ}ないで 」 って 、 {同|おな}じ かな 。） || (Is "you don't have to come" really the same as "don't come"?)
?(comp=ren) comp: （「{来|こ}なくて いい 」 と 「{来|く}る な 」 は 、 {同|おな}じ {意味|いみ} でしょう か 。） || (Do "you needn't come" and "don't come" really mean the same?)
?(comp=suzu) comp: （{台詞|せりふ} は 、 {前後|ぜんご} を {読|よ}まない と {意味|いみ} が {変|か}わる の よ 。） || (Lines change meaning if you don't read what comes before and after.)
!quest sg_lighthouse start

@scene sg.genzo_truth
genzo: {何|なん} だ 。 また {手紙|てがみ} の {話|はなし} か 。 || What? The letter again?
pc: {続|つづ}き が あります 。 {潮|しお} で {滲|にじ}んで いた {所|ところ} です 。 || There's more. The part the salt blurred.
pc: 「{港|みなと} まで は 、 {自分|じぶん} で {行|い}ける から 。 {膝|ひざ} 、 {大事|だいじ} に して 。 {灯台|とうだい} で {待|ま}って て 。」 || "I can make it to the harbour on my own. Look after your knees. Wait for me at the lighthouse."
genzo[surprise]: …… 。 || ……
pc: 「{来|こ}なくて いい 」 は 、 「{来|く}る な 」 では ありません 。 {膝|ひざ} が {悪|わる}い から 、 {坂|さか} を {下|お}りて {来|こ}なくて いい 、 と いう {意味|いみ} です 。 || "You don't have to come" isn't "don't come". It means: your knees are bad, so you needn't come down the hill.
genzo[sad]: …… {十年|じゅうねん} 、 {膝|ひざ} の こと なんか {書|か}いて きた こと は なかった 。 {俺|おれ} の {膝|ひざ} が {悪|わる}い の を 、 {誰|だれ} に {聞|き}いた ん だ 。 || …Ten years, and she never once wrote about my knees. Who told her my knees were bad?
?(comp=nao) comp: {手紙|てがみ} を {運|はこ}ぶ {人間|にんげん} は 、 {口|くち} が {軽|かる}い ん だ よ 。 {悪|わる}い ね 。 || People who carry letters talk. Sorry.
?(comp=suzu) comp[smile]: {港|みなと} の {噂|うわさ} は 、 {船|ふね} より {速|はや}い の よ 。 || Harbour gossip travels faster than boats.
genzo[smile]: ふん 。 …… 「{灯台|とうだい} で {待|ま}って て 」 か 。 {五十年|ごじゅうねん} ずっと {待|ま}ってる {場所|ばしょ} だ 。 {慣|な}れた もん だ 。 || Hmph. …"Wait at the lighthouse," is it. It's where I've waited for fifty years. I'm used to it.
genzo: {渡|わた}し{船|ぶね} が {動|うご}いたら 、 {来|く}る だろう 。 …… {下|した} まで は {行|い}かん ぞ 。 {膝|ひざ} を {大事|だいじ} に しろ と {言|い}われた から な 。 || She'll come once the ferry's running. …I'm not going down there, mind. I've been told to look after my knees.
!quest sg_lighthouse 2

@scene sg.genzo_waiting
genzo: {渡|わた}し{船|ぶね} は まだ か 。 …… {別|べつ} に 、 {待|ま}ってる わけ じゃ ない 。 {灯台守|とうだいもり} は 、 {海|うみ} を {見|み}る の が {仕事|しごと} だ 。 || The ferry's not in yet? …Not that I'm waiting. A lighthouse keeper's job is to watch the sea.
?(!ch2_done) genzo: {港|みなと} の {騒|さわ}ぎ が {片付|かたづ}かん と 、 {船|ふね} は {出|で}ない そう だ 。 …… さっさと {片付|かたづ}けて こい 。 || The ferry won't run till the harbour's mess is sorted out. …So hurry up and sort it.

@scene sg.genzo_family
genzo: {娘|むすめ} が {灯台|とうだい} の {掃除|そうじ} を {始|はじ}めた 。 {俺|おれ} の {物|もの} を {勝手|かって} に {捨|す}てる 。 …… {困|こま}った もん だ 。 || My daughter's started cleaning the lighthouse. Throws out my things without asking. …Terrible.
genzo[smile]: {困|こま}った もん だ 。 || Terrible.

@scene sg.genzo_post
genzo: {娘|むすめ} は {灯落|ひおち} に {戻|もど}った が 、 {月|つき} に {一度|いちど} は {帰|かえ}って くる 。 {手紙|てがみ} も {来|く}る 。 {今度|こんど} は 、 {全部|ぜんぶ} {読|よ}む 。 {最後|さいご} まで な 。 || My daughter went back to Lanternfall, but she comes home once a month. And she writes. This time I read them all. Right to the end.

@scene sg.nagisa_home
nagisa: {父|ちち} が {読|よ}み{違|ちが}えた {手紙|てがみ} 、 {実|じつ} は {書|か}き{方|かた} も {悪|わる}かった ん です 。 {次|つぎ} から は 、 {大事|だいじ} な こと を {先|さき} に {書|か}きます 。 || The letter my father misread — honestly, I wrote it badly too. From now on, I'll put the important part first.
nagisa[smile]: 「{灯台|とうだい} で {待|ま}って て 」 を 、 {一行目|いちぎょうめ} に 。 || "Wait for me at the lighthouse" — on the very first line.

@scene sg.nagisa_post
nagisa: {灯落|ひおち} の {役所|やくしょ} で {働|はたら}いて います 。 {最近|さいきん} 、 {同僚|どうりょう} が 「いいえ 」 を {言|い}える よう に なって 、 {会議|かいぎ} が {長|なが}い ん です 。 …… いい こと です けど ね 。 || I work at the town office in Lanternfall. Lately my colleagues have started being able to say "no", so meetings run long. …It's a good thing, though.

@scene sg.ferry_arrives
!set sg_ferry_seen sg_ferry_scene
narr: {渡|わた}し{場|ば} の ほう で 、 テツ の {怒鳴|どな}り{声|ごえ} が した 。 {船|ふね} が {着|つ}いた らしい 。 || From the landing comes Tetsu's bellow. The ferry is in.
!warp sg.harbor 33 27 right
nagisa: …… お{父|とう}さん ？ なんで {下|した} に いる の 。 {膝|ひざ} は ？ || …Dad? What are you doing down here? What about your knees?
genzo: {膝|ひざ} は {膝|ひざ} だ 。 {足|あし} は {別|べつ} だ 。 || Knees are knees. Legs are another matter.
nagisa[laugh]: {意味|いみ} {分|わ}かんない 。 || That makes no sense.
genzo[closed]: …… おかえり 。 || …Welcome home.
nagisa[smile]: ただいま 。 || I'm home.
nagisa: あの 、 {父|ちち} が お{世話|せわ} に なった みたい で 。 {私|わたし} の {手紙|てがみ} を {読|よ}んで くれた {方|かた} です よ ね 。 || Um — I hear my father's been a bother. You're the one who read my letter?
genzo: {読|よ}み{違|ちが}えた の は {俺|おれ} だ 。 {余計|よけい} な こと は {言|い}う な 。 || I'm the one who misread it. Don't go saying unnecessary things.
nagisa: {来|こ}なくて いい って {書|か}いた のに 、 {来|く}る ん だ から 。 …… {来|き}て くれて 、 ありがとう 。 || I wrote you didn't have to come, and you came anyway. …Thanks for coming.
?(comp=nao) comp: …… {届|とど}いた な 。 {手紙|てがみ} より {先|さき} に 、 {本人|ほんにん} が 。 || …It got there. The person, before the letter.
?(comp=mio) comp[smile]: よかった 。 …… {膝|ひざ} の {薬|くすり} 、 {置|お}いて いきます ね 。 || I'm so glad. …I'll leave some medicine for those knees.
?(comp=ren) comp[smile]: {灯台|とうだい} の {灯|ひ} は 、 {帰|かえ}って くる {人|ひと} の ため に ある 。 {今日|きょう} は 、 それ が よく {分|わ}かります 。 || A lighthouse burns for the people coming home. Today that's very clear.
?(comp=suzu) comp[smile]: {再会|さいかい} の {場面|ばめん} は 、 {台詞|せりふ} が {少|すく}ない ほど いい の 。 {満点|まんてん} ね 。 || Reunion scenes are best with as few lines as possible. Full marks.
genzo: お{前|まえ} さん に は 、 これ を やる 。 {古|ふる}い レンズ の かけら だ 。 {光|ひかり} を {集|あつ}める 。 {人|ひと} も な 。 || This is for you. A chip of the old lens. It gathers light. People too.
!quest sg_lighthouse done
!set sg_nagisa_met
!unset sg_ferry_scene

@scene sg.lh_lens
narr: {灯台|とうだい} の レンズ 。 {何枚|なんまい} も の ガラス が 、 {光|ひかり} を {一|ひと}つ に {集|あつ}めて いる 。 || The lighthouse lens. Many panes of glass gather the light into one beam.
?(!sg_boss_done) narr: {炎|ほのお} が {小|ちい}さい 。 {油|あぶら} を {節約|せつやく} して いる の だ 。 || The flame is small. Oil is being rationed.

@scene sg.lh_stairs
narr: {灯室|とうしつ} へ {続|つづ}く {螺旋|らせん} {階段|かいだん} 。 {手摺|てす}り に 、 {膝|ひざ} の {高|たか}さ で {擦|す}れた {跡|あと} が ある 。 || The spiral stair up to the lamp room. The handrail is worn smooth at knee height.

@scene sg.lh_oil
narr: {灯油|とうゆ} の {樽|たる} 。 {叩|たた}く と 、 {軽|かる}い {音|おと} が した 。 || A barrel of lamp oil. Tap it, and it sounds hollow.
?(sg_wataru_resolved) narr: {隣|となり} に {新|あたら}しい {樽|たる} 。 {札|ふだ} に 、 {丁寧|ていねい} な {字|じ} で 「{灯台|とうだい} {行|ゆ}き ・ {遅|おく}れて すみません 」 。 || Beside it, a new barrel. The tag, in careful handwriting: "For the lighthouse — sorry for the delay."

@scene sg.lh_letter
!if quest.sg_lighthouse>=1 -> read
!if !quest.sg_lighthouse -> plain
narr: ゲンゾウ の {娘|むすめ} の {手紙|てがみ} だ 。 {潮|しお} の {染|し}み で 、 {後半|こうはん} が {滲|にじ}んで いる 。 || Genzō's daughter's letter. Salt stains have blurred the second half.
narr: 「お{父|とう}さん へ 。 {来月|らいげつ} 、 {帰|かえ}ります 。 {迎|むか}え に {来|こ}なくて いい よ 。」 …… {次|つぎ} の {行|ぎょう} は 、 {塩|しお} で {白|しろ}く {曇|くも}って いる 。 || "Dad. I'm coming home next month. You don't have to come and meet me." …The next line is clouded white with salt.
!if word.hikari -> light
narr: レンズ の {光|ひかり} に {透|す}かして みる と 、 {滲|にじ}んだ {字|じ} が {少|すこ}し {浮|う}かんだ 。 || You hold it up to the light of the lens, and the blurred writing surfaces a little.
!goto reveal
:light
narr: 「{光|ひかり}」 と {小|ちい}さく {書|か}いて 、 {手紙|てがみ} に かざす 。 {滲|にじ}んだ {字|じ} が 、 {光|ひかり} の {中|なか} に {浮|う}かび{上|あ}がった 。 || You write hikari — light — small, and hold it over the letter. The blurred words rise into the light.
:reveal
narr: 「{港|みなと} まで は 、 {自分|じぶん} で {行|い}ける から 。 {膝|ひざ} 、 {大事|だいじ} に して 。 {灯台|とうだい} で {待|ま}って て 。」 || "I can make it to the harbour on my own. Look after your knees. Wait for me at the lighthouse."
!note sg_nakute
!challenge sg.c_genzo
!if var._res=0 -> end
!quest sg_lighthouse 1
narr: ゲンゾウ に {伝|つた}えよう 。 || Tell Genzō.
!end
:read
narr: 「{港|みなと} まで は 、 {自分|じぶん} で {行|い}ける から 。 {膝|ひざ} 、 {大事|だいじ} に して 。 {灯台|とうだい} で {待|ま}って て 。」 || "I can make it to the harbour on my own. Look after your knees. Wait for me at the lighthouse."
!end
:plain
narr: {手紙|てがみ} が {一通|いっつう} 。 {何度|なんど} も {読|よ}み{返|かえ}した の だろう 。 {折|お}り{目|め} が {柔|やわ}らかい 。 || A single letter, read so many times the folds have gone soft.

@scene sg.shiori_post
shiori: {潮|しお} は {今日|きょう} も {表|ひょう} どおり です 。 {表|ひょう} が {潮|しお} どおり 、 と {言|い}う べき でしょう か 。 || The tide's keeping to the table again today. Or should I say the table's keeping to the tide?
?(end_archive_library) shiori: {沈|しず}んだ {書庫|しょこ} の {図面|ずめん} を 、 {山|やま} の {図書館|としょかん} に {送|おく}りました 。 {分室|ぶんしつ} の {記録|きろく} と して 。 {今度|こんど} は 、 {読|よ}む ため の {記録|きろく} です 。 || I sent my plans of the drowned archive to the library in the mountains, as the branch's record. A record for reading, this time.
?(end_archive_closed) shiori: {沈|しず}んだ {書庫|しょこ} は 、 もう {誰|だれ} も {使|つか}いません 。 {引|ひ}き{潮|しお} の {日|ひ} に 、 {子|こ}ども たち が {貝|かい} を {拾|ひろ}いに {行|い}く だけ です 。 {平和|へいわ} です よ 。 || No one uses the drowned archive any more. On low-tide days the children just go and collect shells there. It's peaceful.

@scene sg.isamu_nao
narr: {空|から} の {家|いえ} だ 。 {窓|まど} の {前|まえ} に 、 {椅子|いす} が {一脚|いっきゃく} 。 {海|うみ} の ほう を {向|む}いて いる 。 || An empty house. A single chair by the window, facing the sea.
comp: …… 。 || ……
comp: {入|はい}る つもり は なかった 。 || I didn't mean to come in.
pc: ここ 、 {知|し}ってる の ？ || You know this place?
comp[closed]: イサム って {爺|じい}さん の {家|いえ} だ 。 {手紙|てがみ} を {何度|なんど} か {預|あず}かった 。 {字|じ} が {震|ふる}えて て 、 でも {丁寧|ていねい} で …… 。 || An old man called Isamu lived here. I carried letters for him a few times. His hand shook, but his writing was careful…
comp: {最後|さいご} の {一通|いっつう} は 、 {灯落|ひおち} の {娘|むすめ} {宛|あて} だった 。 {十年|じゅうねん} {以上|いじょう} {口|くち} を {聞|き}いて ない {娘|むすめ} に 、 {許|ゆる}して くれ って 。 || The last one was to his daughter in Lanternfall. A daughter he hadn't spoken to in over ten years. Asking her to forgive him.
comp[sad]: {届|とど}けなかった 。 {死|し}に{際|ぎわ} に {許|ゆる}し を {頼|たの}む の は 、 {受|う}け{取|と}る {側|がわ} に {重|おも}すぎる と {思|おも}った 。 {断|ことわ}る {自由|じゆう} の ない {手紙|てがみ} だ 。 || I didn't deliver it. Asking forgiveness on your deathbed puts too much on the one who receives it, I thought. It's a letter she'd have no freedom to refuse.
comp: …… {今|いま} も {鞄|かばん} の {底|そこ} に ある 。 {本人|ほんにん} は もう いない 。 {春|はる} に 、 {灯|ひ} の {道|みち} を {上|のぼ}って いった って 。 || …It's still at the bottom of my bag. And he's gone. Walked off up the lantern road in the spring, they say.
!choice
* {届|とど}ける べき だった と {思|おも}う ？ || Do you think you should have delivered it? -> should
* {何|なに} も {言|い}わない || Say nothing -> quiet
:should
comp[think]: {分|わ}からない 。 それ が {分|わ}からない から 、 {捨|す}てられない ん だ よ 。 || I don't know. That's exactly why I can't throw it away.
!goto after
:quiet
narr: {二人|ふたり} で しばらく 、 {窓|まど} の {外|そと} の {海|うみ} を {見|み}て いた 。 || For a while, the two of you look at the sea through the window.
:after
comp[smirk]: …… {行|い}こう 。 {空|から} の {家|いえ} に {長居|ながい} する と 、 {返事|へんじ} を {待|ま}ってる {気分|きぶん} に なる 。 || …Let's go. Stay too long in an empty house and you start feeling like you're waiting for a reply.
!set sg_nao_isamu

@scene sg.isamu_chair
narr: {海|うみ} を {向|む}いた {椅子|いす} 。 {座布団|ざぶとん} が 、 {人|ひと} の {形|かたち} に {少|すこ}し {凹|へこ}んで いる 。 || A chair facing the sea. The cushion still holds a faint dent in the shape of a person.

@scene sg.isamu_desk
narr: {乾|かわ}いた {硯|すずり} と 、 {書|か}き{損|そん}じ の {紙|かみ} 。 {同|おな}じ {名前|なまえ} が 、 {何度|なんど} も {書|か}かれて は {消|け}されて いる 。 「ウミ」 。 || A dry inkstone and spoiled sheets of paper. The same name, written again and again, then crossed out: "Umi".
?(comp=nao) comp[closed]: …… {見|み}る な よ 。 {人|ひと} の {下書|したが}き だ 。 || …Don't look. That's someone's draft.

@scene sg.isamu_plant
narr: {鉢植|はちう}え 。 {土|つち} が {湿|しめ}って いる 。 {誰|だれ} か が 、 {今|いま} も {水|みず} を やって いる 。 || A potted plant. The soil is damp. Someone is still watering it.
?(comp=mio) comp[smile]: フク さん かな 。 …… {優|やさ}しい お{隣|となり} さん だ ね 。 || Fuku, perhaps. …A kind neighbour.

@scene sg.suzu_cameo
suzu: さあさあ 、 お{立|た}ち{会|あ}い ！ …… {今日|きょう} は {客|きゃく} が {少|すく}ない わ ね 。 {港|みなと} が {静|しず}か すぎる の よ 。 || Roll up, roll up! …Thin crowd today. The harbour's too quiet.
suzu: あら 、 $name ！ {葦|あし}ノ{瀬|せ} {以来|いらい} ね 。 {元気|げんき} そう で {何|なに} より 。 || Oh, $name! Not since Reedwake. Good to see you looking well.
suzu[smirk]: {港|みなと} の {字|じ} が {嘘|うそ} を つく って {噂|うわさ} 、 {聞|き}いた ？ {嘘|うそ} の {専門家|せんもんか} と して は 、 {商売|しょうばい} {敵|がたき} が {増|ふ}えて {困|こま}る わ 。 || Heard the rumour that the harbour's writing tells lies? As a professional, I don't need the competition.
suzu[closed]: …… {冗談|じょうだん} よ 。 {気|き}を つけて ね 。 {嘘|うそ} は 、 {本当|ほんとう} の {顔|かお} を して {来|く}る から 。 || …Joking. Be careful. Lies come wearing the face of the truth.

@scene sg.suzu_cameo2
suzu: {港|みなと} が うるさく なった わ ！ {投|な}げ{銭|せん} も {三倍|さんばい} よ 。 || The harbour's noisy again! Three times the coins in the hat.
suzu[smile]: {前|まえ} に {来|き}た とき の {宿代|やどだい} 、 {利子|りし} を つけて {返|かえ}して きた の 。 タマエ さん 、 {目|め} を {丸|まる}く してた わ 。 {帳尻|ちょうじり} は {合|あ}わせる {主義|しゅぎ} なの 。 || I paid back the inn bill from last time — with interest. Tamae's eyes went round. I believe in balancing the books.

@scene sg.cove_arrive
!set sg_cove_seen
narr: {崖|がけ} に {囲|かこ}まれた 、 {三日月|みかづき} の {形|かたち} の {小|ちい}さな {浜|はま} 。 {波|なみ} の {音|おと} が 、 {岩|いわ} に {反響|はんきょう} して いる 。 || A small crescent of sand, walled in by cliffs. The sound of the waves echoes off the rock.
?(comp=nao) comp: …… いい {所|ところ} だ な 。 {出口|でぐち} が {一|ひと}つ しか ない の は 、 {気|き} に {入|い}らない けど 。 || …Nice spot. Don't like that there's only one way out, though.
?(comp=mio) comp[smile]: {静|しず}か …… 。 {嫌|いや} な {静|しず}か さ じゃ なくて 、 いい {方|ほう} の 。 || Quiet… Not the bad kind of quiet. The good kind.
?(comp=ren) comp[smile]: {着|つ}きました 。 {道標|みちしるべ} の おかげ です 。 …… {私|わたし} の おかげ では なく 。 || We're here. Thanks to the signpost. …Not to me.
?(comp=suzu) comp: {客|きゃく} の いない {舞台|ぶたい} も 、 たまに は いい わ ね 。 {波|なみ} が {拍手|はくしゅ} して くれる 。 || An empty stage is nice now and then. The waves do the applause.

@scene sg.cove_lost
narr: {崖|がけ} の {道|みち} を {進|すす}む 。 {岩|いわ} を {回|まわ}り 、 {坂|さか} を {下|くだ}り …… {気|き} が つく と 、 {港|みなと} の {道標|みちしるべ} の {前|まえ} に いた 。 || You follow the cliff path. Round the rocks, down the slope… and find yourself back at the harbour signpost.
!warp sg.harbor 53 13 left
?(quest.sg_cove=1) narr: {道標|みちしるべ} を {直|なお}さない と 、 {道|みち} は {入|い}り{江|え} を {思|おも}い{出|だ}さない らしい 。 || It seems the path won't remember the cove until the signpost is put right.
?(!quest.sg_cove) narr: {崖|がけ} の {道|みち} も 、 {行|い}き{先|さき} を {忘|わす}れて いる 。 || The cliff path, too, has forgotten where it goes.

@scene sg.cove_sign
!if quest.sg_cove=1 -> fix
narr: {道標|みちしるべ} の {腕|うで} が {三本|さんぼん} 。 どれ も {字|じ} が {消|き}えて 、 {向|む}き も ばらばら だ 。 || A signpost with three arms. The writing on all of them is gone, and they point every which way.
!end
:fix
narr: {道標|みちしるべ} の {腕|うで} を {回|まわ}して 、 {正|ただ}しい {名前|なまえ} を {書|か}き{込|こ}もう 。 || Turn the arms and write the right names back on.
!activity sg.a_signpost
!if var._res=0 -> end
!set sg_sign_fixed sg_cove_open
!sfx discover
narr: {最後|さいご} の {腕|うで} に {名前|なまえ} を {書|か}く と 、 {崖|がけ} の {道|みち} が {急|きゅう} に {近|ちか}く {見|み}えた 。 || As you write the name on the last arm, the cliff path suddenly looks much closer.
!quest sg_cove 2
!autosave

@scene sg.cove_sign_fixed
narr: {道標|みちしるべ} 。 「→ {入|い}り{江|え}」 「↑ {街道|かいどう}」 「← {港|みなと}」 。 {字|じ} は しっかり {立|た}って いる 。 || The signpost: "→ The cove", "↑ The high road", "← The harbour". The letters stand firm.

@scene sg.cove_plaque
narr: {古|ふる}い {立|た}て{札|ふだ} 。 「{漁師|りょうし} の {入|い}り{江|え} ・ {満|み}ち{潮|しお} に {注意|ちゅうい}」 。 || An old notice board: "Fishers' Cove — beware the rising tide."

@scene sg.cove_nets
narr: {岩|いわ} に {網|あみ} が {掛|か}けて ある 。 {嵐|あらし} に も {飛|と}ばされず 、 {待|ま}って いた らしい 。 || The nets are hung on the rocks. They seem to have waited out the storm without blowing away.
!give sg_nets
!quest sg_cove 3
?(comp=nao) comp: {重|おも}い な 。 …… {配達料|はいたつりょう} 、 {魚|さかな} で {払|はら}って もらう か 。 || Heavy. …Maybe we'll take our delivery fee in fish.
?(comp=mio) comp[smile]: {丁寧|ていねい} に {干|ほ}して ある 。 ソウタ さん 、 {几帳面|きちょうめん} な {人|ひと} だ ね 。 || Hung up so neatly. Sōta's a careful one.
?(comp=ren) comp: {網|あみ} も {縄|なわ} の {仲間|なかま} です ね 。 {結|むす}び{目|め} の {数|かず} を {数|かぞ}え{始|はじ}める と 、 {日|ひ} が {暮|く}れます 。 || Nets are relatives of rope. If I start counting the knots, we'll be here till dark.
?(comp=suzu) comp: {網|あみ} の {中|なか} に {小|ちい}さい {蟹|かに} が いる わ 。 …… お{帰|かえ}り なさい 、 {海|うみ} へ 。 || There's a tiny crab in the net. …Off you go, back to the sea.

@scene sg.cove_wreck
narr: {打|う}ち{上|あ}げられた {古|ふる}い {漁船|ぎょせん} 。 {船|ふね} の {名札|なふだ} が 、 {真|ま}っ{白|しろ} に なって いる 。 || An old fishing boat washed up on the sand. Its nameplate has gone blank white.
narr: {舷|げん} に 、 {鳥|とり} の {絵|え} の {跡|あと} が {薄|うす}く {残|のこ}って いる 。 || On the side, the faint trace of a painted bird.
?(quest.sg_seaglass=1&!sg_registry_taken) narr: …… フク の {夫|おっと} の {船|ふね} かも しれない 。 {名前|なまえ} さえ {分|わ}かれば 。 || …This might be Fuku's husband's boat. If only you knew its name.
?(sg_registry_taken) narr: {名札|なふだ} の {溝|みぞ} を よく {見|み}る と 、 「{千鳥丸|ちどりまる}」 の {形|かたち} が {残|のこ}って いる 。 || Look closely at the grooves in the plate: the shape of Chidori-maru is still there.

@scene sg.cove_driftwood
narr: {流木|りゅうぼく} 。 {誰|だれ} か が {小刀|こがたな} で 、 {日|ひ} を {数|かぞ}える {線|せん} を {刻|きざ}んで いる 。 {四本|よんほん} と {斜線|しゃせん} で {五|ご} 。 それ が {八|や}つ 。 || Driftwood. Someone has cut tally marks into it with a knife: four lines and a slash for five, eight times over.
?(comp=suzu) comp[think]: {四十日|よんじゅうにち} 。 {何|なに} を {数|かぞ}えて いた の かしら 。 || Forty days. I wonder what they were counting.
`, 'ch2/24_scenes_hub');
