/* Chapter 1 scenes: the evening, the Lantern Hall (choosing a companion),
 * departure, and how the others carry on afterwards. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
@scene rw.nao_evening
!faceplayer nao
nao: {今夜|こんや} 、 {灯|あか}り{堂|どう} だって 。 …… {婆|ばあ}さん の {話|はなし} は {長|なが}い ぞ 。 {出口|でぐち} に {近|ちか}い {席|せき} を {取|と}って おけ 。 || Tonight at the Lantern Hall, apparently. …The old woman's talks run long. Grab a seat near the exit.
nao[think]: {西|にし} に {行|い}く なら 、 {潮硝子|しおがらす} まで の {道|みち} は {知|し}ってる 。 {橋|はし} も 、 {近道|ちかみち} も 、 {雨宿|あまやど}り の {場所|ばしょ} も 。 …… {言|い}って みた だけ 。 || If you're heading west, I know the road to Saltglass. The bridges, the shortcuts, where to shelter from rain. …Just saying.

@scene rw.mio_evening
!faceplayer mio
mio: {棚|たな} の {整理|せいり} を して いたら 、 {夜|よる} に なって いました 。 …… {落|お}ち{着|つ}かない とき の {癖|くせ} なん です 。 || I was tidying the shelves and suddenly it was night. …It's a habit when I can't settle.
mio: {灯|あか}り{堂|どう} です よね 。 {行|い}きます 。 {私|わたし} に {何|なに} が できる か は 、 わかりません けど 。 || The Lantern Hall, right? I'll come. I don't know what use I'll be, though.

@scene rw.ren_evening
!faceplayer ren
ren: {橋|はし} の {灯|あか}り が 、 {二|ふた}つ の {名前|なまえ} で ともって いる 。 {記録|きろく} と {一致|いっち} しました 。 …… {気持|きも}ち が いい です ね 。 || The bridge lantern is burning with both names. It matches the records. …Very satisfying.
ren[think]: {西|にし} の {灯|あか}り も 、 {同|おな}じ よう に {消|き}えて いる はず です 。 {灯守|ひもり} と して は 、 {放|ほう}って おけません 。 || The western lanterns must have gone dark the same way. As a keeper, I can't leave that alone.

@scene rw.suzu_evening
!faceplayer suzu
suzu[laugh]: {橋|はし} が {届|とど}いた から 、 {一座|いちざ} を {追|お}いかけられる ！ …… と {思|おも}った ん だ けど ね 。 || The bridge reaches, so I can chase after my troupe! …Or so I thought.
suzu[smile]: {正直|しょうじき} に {言|い}う と 、 {一座|いちざ} より 、 あなた の {話|はなし} の {続|つづ}き の {方|ほう} が {気|き} に なる 。 {悪|わる}い {癖|くせ} ね 。 || Honestly, I'm more curious about how your story continues than about my troupe. Bad habit of mine.

@scene rw.tsuru_evening
!faceplayer tsuru
tsuru: {来|き}た かい 。 {他|ほか} の {連中|れんちゅう} も もう すぐ {来|く}る 。 {座|すわ}って {待|ま}ち な 。 || You came. The others will be here soon. Sit and wait.

@scene rw.hall_gather
!music departure
narr: {灯|あか}り{堂|どう} に 、 {四人|よにん} が {集|あつ}まって いた 。 {壁|かべ} の {棚|たな} に は {古|ふる}い {記録|きろく} 。 {奥|おく} に は 、 {旅|たび} の {灯|あか}り が {一|ひと}つ 。 || The four have gathered in the Lantern Hall. Old records line the shelves; at the back hangs a single travelling lantern.
tsuru: {名前|なまえ} を {持|も}って いった {何|なに} か は 、 {灯|ひ} の {道|みち} を {西|にし} へ {下|くだ}った 。 {潮硝子|しおがらす} に は 、 {海|うみ} に {沈|しず}んだ {書庫|しょこ} が ある と いう {噂|うわさ} が ある 。 {追|お}う なら 、 そこ から だろう ね 。 || Whatever took the names went down the lantern road, west. In Saltglass there's a rumour of an archive sunk under the sea. If you're going after it, that's where to start.
tsuru: {旅|たび} の {灯|あか}り を {貸|か}す 。 ただし 、 {昔|むかし} から の {決|き}まり が ある 。 || I'll lend you the travelling lantern. But there's an old rule.
tsuru: {灯|あか}り が {運|はこ}べる {名前|なまえ} は 、 {二|ふた}つ まで 。 あんた の {名前|なまえ} と 、 もう {一人|ひとり} 。 {三|みっ}つ{目|め} は 、 {乗|の}らない 。 || The lantern can carry two names, no more. Yours, and one other. It won't take a third.
tsuru: ここ で は {好|す}きな だけ {時間|じかん} を かけて いい 。 {話|はな}して 、 {迷|まよ}って 、 {決|き}め{直|なお}して いい 。 でも 、 あの {灯|あか}り が {敷居|しきい} を {越|こ}えたら 、 {旅|たび} の {終|お}わり まで 、 その {二|ふた}つ の {名前|なまえ} を {運|はこ}ぶ 。 {三|みっ}つ{目|め} は {取|と}らない 。 || Take as long as you like in here. Talk, waver, change your mind. But once that lantern crosses the threshold, it carries those two names to the end of the journey. It won't take a third.
nao: …… {要|よう} する に 、 {一人|ひとり} しか {連|つ}れて いけない って こと だろ 。 {回|まわ}りくどい 。 || …In short: you can only take one of us. Why not just say so.
tsuru[smirk]: {年寄|としよ}り は {回|まわ}りくどい もの さ 。 || Old people are allowed to be roundabout.
narr: {四人|よにん} と {話|はな}して 、 {一緒|いっしょ} に {来|き}て ほしい {人|ひと} に {声|こえ} を かけよう 。 {決|き}まったら 、 {奥|おく} の {灯|あか}り の {前|まえ} へ 。 || Talk with the four and ask the one you want to come with you. When you've decided, go to the lantern at the back.
!set rw_hall_gather
!quest rw_depart 0 quiet
!autosave

@scene rw.hall_nao
!faceplayer nao
!if prov=nao -> chosen
nao: {俺|おれ} を {連|つ}れて いく {理由|りゆう} ？ {道|みち} を {知|し}ってる 。 {逃|に}げ{道|みち} も 。 {相手|あいて} が {次|つぎ} に {何|なに} を する か 、 だいたい {読|よ}める 。 || Reasons to take me? I know the roads. The escape routes too. And I can usually read what someone's going to do next.
nao[think]: …… {鞄|かばん} の {底|そこ} に 、 {届|とど}けてない {手紙|てがみ} が {一通|いっつう} ある 。 {届|とど}けない って {決|き}めた {手紙|てがみ} だ 。 {西|にし} へ {行|い}けば 、 いつか その {話|はなし} を する こと に なる かも な 。 || …At the bottom of my satchel there's one letter I haven't delivered. One I decided not to. Go west, and maybe someday I'll tell you about it.
!choice
* ナオ 、 {一緒|いっしょ} に {来|き}て ほしい || Nao, I want you to come with me. -> ask
* もう {少|すこ}し {考|かんが}える || I need to think a bit more. -> end
:ask
!recruit nao
nao[smirk]: …… {了解|りょうかい} 。 {最初|さいしょ} に {言|い}って おく 。 {俺|おれ} は {道|みち} を {選|えら}ぶ 。 あんた は {行|い}き{先|さき} を {選|えら}ぶ 。 {途中|とちゅう} で {降|お}りる {気|き} は ない から 、 {本気|ほんき} で {決|き}めて くれ 。 || …Got it. Let me say this up front: I pick the road, you pick the destination. I'm not getting off halfway, so decide like you mean it.
!end
:chosen
nao: まだ {迷|まよ}ってる なら 、 {迷|まよ}え 。 {扉|とびら} を {出|で}る まで は 、 {誰|だれ} も {文句|もんく} は {言|い}わない 。 || If you're still unsure, be unsure. Until you're out the door, nobody's going to complain.
!choice
* やっぱり {考|かんが}え{直|なお}す || Actually, let me reconsider. -> undo
* {一緒|いっしょ} に {行|い}こう || Let's go together. -> end
:undo
!recruit none
nao: ん 。 {正直|しょうじき} で いい 。 || Mm. Good, you're honest.

@scene rw.hall_mio
!faceplayer mio
!if prov=mio -> chosen
mio: {私|わたし} に できる の は 、 {傷|きず} の {手当|てあ}て と 、 {薬|くすり} の {調合|ちょうごう} と …… {人|ひと} の {話|はなし} を {聞|き}く こと くらい です 。 || What I can do is tend wounds, mix medicines, and… listen to people, I suppose.
mio[think]: {村|むら} の {人|ひと} は 、 {私|わたし} が いなく なったら {困|こま}る と {思|おも}います 。 …… でも 、 {困|こま}らせて みたい 、 と {少|すこ}し {思|おも}う {私|わたし} も います 。 {変|へん} です よね 。 || The village would struggle without me, I think. …But part of me wants to let them struggle, just a little. Strange, isn't it.
!choice
* ミオ 、 {一緒|いっしょ} に {来|き}て ほしい || Mio, I want you to come with me. -> ask
* もう {少|すこ}し {考|かんが}える || I need to think a bit more. -> end
:ask
!recruit mio
mio[shy]: …… はい 。 {行|い}きます 。 {店|みせ} は ツル さん に {鍵|かぎ} を {預|あず}けます 。 {扉|とびら} を {出|で}たら 、 もう {戻|もど}りません 。 {途中|とちゅう} で {迷|まよ}っても 、 {連|つ}れて {帰|かえ}ろう と は しないで ください ね 。 || …Yes. I'll come. I'll leave the shop key with Tsuru. Once I'm through that door, I'm not turning back. Even if I waver on the way, please don't try to take me home.
!end
:chosen
mio: {迷|まよ}う の は {当然|とうぜん} です 。 {薬|くすり} も 、 {決|き}める {前|まえ} に {何度|なんど} も {量|はか}ります から 。 || It's natural to hesitate. Even with medicine, I measure many times before deciding.
!choice
* やっぱり {考|かんが}え{直|なお}す || Actually, let me reconsider. -> undo
* {一緒|いっしょ} に {行|い}こう || Let's go together. -> end
:undo
!recruit none
mio[smile]: {大丈夫|だいじょうぶ} です 。 {気|き} に しないで 。 …… {本当|ほんとう} に 。 || It's fine. Don't worry about it. …Really.

@scene rw.hall_ren
!faceplayer ren
!if prov=ren -> chosen
ren: {灯守|ひもり} と して 、 {西|にし} の {灯|あか}り を {確|たし}かめたい 。 それ が {第一|だいいち} の {理由|りゆう} です 。 {第二|だいに} の {理由|りゆう} は …… {先生|せんせい} が 、 {昔|むかし} 、 {西|にし} へ {行|い}った きり {戻|もど}らなかった 。 || As a keeper, I want to check the western lanterns. That's my first reason. The second… my teacher went west long ago and never came back.
ren[think]: {教|おし}え は {一言|ひとこと} も {忘|わす}れて いない のに 、 {顔|かお} だけ が {思|おも}い{出|だ}せない 。 {西|にし} に {行|い}けば 、 {理由|りゆう} が わかる かも しれません 。 || I haven't forgotten a single word of what they taught me, and yet I can't recall their face. If I go west, I might find out why.
!choice
* レン 、 {一緒|いっしょ} に {来|き}て ほしい || Ren, I want you to come with me. -> ask
* もう {少|すこ}し {考|かんが}える || I need to think a bit more. -> end
:ask
!recruit ren
ren[smile]: {光栄|こうえい} です 。 {一|ひと}つ {約束|やくそく} を 。 {灯|あか}り が {扉|とびら} を {越|こ}えたら 、 {私|わたし} は {旅|たび} の {終|お}わり まで あなた の {隣|となり} に います 。 {道|みち} に {迷|まよ}う の も 、 {隣|となり} で 。 || An honour. One promise: once the lantern crosses the door, I'll be at your side to the end of the journey. Getting lost included — at your side.
!end
:chosen
ren: {決|き}める の は {扉|とびら} の {前|まえ} で 。 それまで は 、 {下書|したが}き です 。 || You decide at the door. Until then, it's a draft.
!choice
* やっぱり {考|かんが}え{直|なお}す || Actually, let me reconsider. -> undo
* {一緒|いっしょ} に {行|い}こう || Let's go together. -> end
:undo
!recruit none
ren: {下書|したが}き は 、 {直|なお}す ため に ある もの です 。 || Drafts exist to be revised.

@scene rw.hall_suzu
!faceplayer suzu
!if prov=suzu -> chosen
suzu[laugh]: {私|わたし} を {選|えら}ぶ と 、 {道中|どうちゅう} ずっと {退屈|たいくつ} しない ！ {歌|うた} も {芝居|しばい} も {手品|てじな} も つく よ 。 || Choose me and you'll never be bored on the road! Songs, plays and conjuring tricks included.
suzu: …… {冗談|じょうだん} は {置|お}いて おいて 。 {嘘|うそ} を つく の は 、 わりと {得意|とくい} なの 。 だから 、 {嘘|うそ} を {見抜|みぬ}く の も 、 たぶん {得意|とくい} 。 {西|にし} で は きっと {役|やく} に {立|た}つ 。 || …Jokes aside. I'm rather good at lying. Which means I'm probably good at seeing through lies too. That'll come in handy out west.
suzu[think]: {昔|むかし} 、 {一|ひと}つ だけ 、 {終|お}わらせて いない {嘘|うそ} が ある の 。 {灰実|はいみ} の {方|ほう} で ね 。 || There's one lie I told long ago that I never finished. Over Cinder Orchard way.
!choice
* スズ 、 {一緒|いっしょ} に {来|き}て ほしい || Suzu, I want you to come with me. -> ask
* もう {少|すこ}し {考|かんが}える || I need to think a bit more. -> end
:ask
!recruit suzu
suzu[smile]: {喜|よろこ}んで 。 …… {真面目|まじめ} に {言|い}う ね 。 {扉|とびら} を {出|で}たら 、 {私|わたし} は {幕|まく} が {下|お}りる まで {降|お}りない 。 {途中|とちゅう} で {逃|に}げ{出|だ}す {役|やく} は 、 もう {演|えん}じない って {決|き}めた の 。 || Gladly. …I'll say this seriously. Once we're out the door, I won't leave the stage until the curtain falls. I've decided I'm done playing the one who runs away halfway.
!end
:chosen
suzu: {迷|まよ}って いい の よ 。 {幕|まく} が {上|あ}がる まで は 、 {配役|はいやく} は {変|か}えられる 。 || You're allowed to waver. Until the curtain rises, the casting can change.
!choice
* やっぱり {考|かんが}え{直|なお}す || Actually, let me reconsider. -> undo
* {一緒|いっしょ} に {行|い}こう || Let's go together. -> end
:undo
!recruit none
suzu[laugh]: {配役|はいやく} {変更|へんこう} ！ …… {平気|へいき} よ 。 {役者|やくしゃ} は {慣|な}れっこ だから 。 || A casting change! …I'm fine. Actors are used to it.

@scene rw.hall_tsuru
!faceplayer tsuru
!if departed -> after
!if prov -> chosen
tsuru: {誰|だれ} と {行|い}く か 、 まだ {決|き}めてない の かい 。 いい よ 。 {四人|よにん} とも 、 {話|はな}す {価値|かち} の ある {連中|れんちゅう} だ 。 || Haven't decided who to go with yet? That's fine. All four are worth talking to.
!end
:chosen
tsuru: …… {決|き}まった みたい だ ね 。 {心|こころ} が {決|き}まったら 、 {奥|おく} の {灯|あか}り の {前|まえ} に {立|た}ち な 。 {扉|とびら} を {出|で}る まで は 、 まだ {変|か}えられる よ 。 || …Looks like you've decided. When your heart's settled, stand before the lantern at the back. Until you walk out that door, you can still change your mind.
!end
:after
tsuru: {灯|あか}り は もう {二|ふた}つ の {名前|なまえ} を {運|はこ}んで いる 。 {三|みっ}つ{目|め} は {乗|の}らない よ 。 {気|き}を つけて {行|い}き な 。 || The lantern already carries two names. There's no room for a third. Go carefully.

@scene rw.hall_shrine
!if departed -> after
!if !rw_hall_gather -> early
!if !prov -> noone
narr: {旅|たび} の {灯|あか}り が 、 {静|しず}か に {揺|ゆ}れて いる 。 || The travelling lantern sways quietly.
tsuru: その {灯|あか}り を {持|も}って {扉|とびら} を {出|で}たら 、 もう {後戻|あともど}り は できない 。 {旅|たび} の {終|お}わり まで 、 あんた と $comp の {二人|ふたり} だ 。 || Once you carry that lantern out the door, there's no going back. You and $comp, the two of you, to the journey's end.
?(prov=nao) nao: {俺|おれ} は {決|き}めた 。 あと は あんた だ 。 || I've decided. The rest is up to you.
?(prov=mio) mio: {私|わたし} は {決|き}めました 。 あなた が {決|き}めて ください 。 || I've made up my mind. Now you decide.
?(prov=ren) ren: {私|わたし} の {名前|なまえ} を {書|か}く {準備|じゅんび} は できて います 。 || I'm ready for my name to be written.
?(prov=suzu) suzu: {幕|まく} を {上|あ}げる の は 、 あなた の {役目|やくめ} よ 。 || Raising the curtain is your job.
!choice
* $comp と {旅|たび} に {出|で}る || Set out with $comp. -> go
* まだ {決|き}めない || Not yet. -> end
:go
!call rw.depart
!end
:noone
tsuru: {灯|あか}り は {二|ふた}つ {目|め} の {名前|なまえ} を {待|ま}って いる 。 {誰|だれ} に {声|こえ} を かける か 、 {先|さき} に {決|き}め な 。 || The lantern is waiting for a second name. Decide who you'll ask first.
!end
:early
narr: {古|ふる}い {旅|たび} の {灯|あか}り 。 {紙|かみ} に は {何|なに} も {書|か}かれて いない 。 || An old travelling lantern. Nothing is written on its paper.
!end
:after
narr: {灯|あか}り は もう {運|はこ}ばれて いった 。 {吊|つ}るして あった {場所|ばしょ} に 、 {丸|まる}い {跡|あと} が {残|のこ}って いる 。 || The lantern has already been carried away. A round mark remains where it hung.

@scene rw.depart
narr: {灯|あか}り の {紙|かみ} に 、 {二|ふた}つ の {名前|なまえ} を {書|か}く 。 $name 。 そして 、 $comp 。 || You write two names on the lantern's paper. $name. And $comp.
!sfx lantern
!depart
narr: {字|じ} は {紙|かみ} に {染|し}み{込|こ}み 、 {灯|あか}り が {柔|やわ}らか く ともった 。 || The ink sinks into the paper, and the lantern glows softly.
?(comp=nao) nao[smirk]: よし 。 {道|みち} は {俺|おれ} に {任|まか}せろ 。 {行|い}き{先|さき} は 、 あんた が {決|き}めろ 。 || Right. Leave the road to me. You decide where we're going.
?(comp=mio) mio[smile]: {店|みせ} の {鍵|かぎ} 、 ツル さん に {渡|わた}して きます 。 …… {不思議|ふしぎ} です 。 {怖|こわ}い のに 、 {少|すこ}し {楽|たの}しい 。 || I'll give the shop key to Tsuru. …How strange. I'm scared, and yet a little excited.
?(comp=ren) ren: {灯|あか}り の {持|も}ち{手|て} は 、 {私|わたし} が {磨|みが}いて おきます 。 {靴|くつ} より {先|さき} に 。 {当然|とうぜん} です 。 || I'll polish the lantern's handle. Before my boots, naturally.
?(comp=suzu) suzu[laugh]: {開幕|かいまく} ！ …… ふふ 、 {一度|いちど} {言|い}って みたかった の 。 || Curtain up! …Heh. I always wanted to say that.
tsuru: {他|ほか} の {三人|さんにん} も 、 {村|むら} で それぞれ の {仕事|しごと} が ある 。 {見送|みおく}り は {朝|あさ} に しよう 。 {今夜|こんや} は よく {寝|ね}る んだ よ 。 || The other three have their own work in the village. We'll see you off in the morning. Sleep well tonight.
!fade out
!unset rw_night
!set ch1_done
!quest rw_depart 1
!warp rw.road 26 9 left
!fade in
!call rw.seeoff

@scene rw.seeoff
!music road
narr: {朝|あさ} 。 {灯|ひ} の {道|みち} の {入口|いりぐち} まで 、 {何人|なんにん} か が {見送|みおく}り に {来|き}て くれた 。 || Morning. A few people have come to see you off at the start of the lantern road.
?(comp!=nao) nao: {潮硝子|しおがらす} の {港|みなと} で は 、 {右|みぎ} の {桟橋|さんばし} に {気|き}を つけろ 。 {板|いた} が {腐|くさ}ってる 。 …… それ だけ 。 || At the Saltglass docks, watch the right-hand pier. The boards are rotten. …That's all.
?(comp!=mio) mio: {傷薬|きずぐすり} です 。 ラベル は {三回|さんかい} {確|たし}かめました 。 …… {気|き}を つけて 。 || Wound salve. I checked the label three times. …Take care.
?(comp!=ren) ren: {西|にし} の {灯|あか}り の {記録|きろく} 、 {写|うつ}して おきました 。 {私|わたし} は {村|むら} の {灯|あか}り を {守|まも}ります 。 {道|みち} に {迷|まよ}わない よう に 。 {私|わたし} が 、 です 。 || I've copied out the records for the western lanterns. I'll look after the village's lanterns — and try not to get lost. Me, I mean.
?(comp!=suzu) suzu: {次|つぎ} に {会|あ}う とき は 、 {新作|しんさく} を {見|み}せて あげる 。 {題名|だいめい} は まだ ない けど 、 {主役|しゅやく} は {決|き}まってる 。 || Next time we meet, I'll show you my new piece. No title yet, but I've already cast the lead.
mame: {帰|かえ}って きたら 、 {西|にし} の {話|はなし} 、 {聞|き}かせて ね ！ || When you come back, tell me all about the west!
tsuru: {行|い}って おいで 。 {名前|なまえ} を {取|と}り{戻|もど}して おいで 。 || Off you go. Bring the names back.
?(comp=nao) nao: …… {振|ふ}り{返|かえ}る と {歩|ある}きにくい ぞ 。 {一回|いっかい} だけ に しとけ 。 || …Looking back makes it hard to walk. Just once, okay?
?(comp=mio) mio: {一回|いっかい} だけ 、 {振|ふ}り{返|かえ}って も いい です か 。 …… はい 。 {行|い}きましょう 。 || May I look back, just once? …Right. Let's go.
?(comp=ren) ren: {葦|あし}ノ{瀬|せ} の {灯|あか}り は 、 {全部|ぜんぶ} ともって います 。 {見送|みおく}り と して は 、 {上等|じょうとう} です 。 || Every lantern in Reedwake is lit. As send-offs go, that's first rate.
?(comp=suzu) suzu: {観客|かんきゃく} が いる うち に 、 {格好|かっこう} よく {退場|たいじょう} しましょ 。 || Let's make a stylish exit while we still have an audience.
!journal {西|にし} へ 。 {潮硝子|しおがらす} を {目指|めざ}す 。 || West along the lantern road, toward Saltglass.
!card {第一章|だいいっしょう} {終|お}わり || End of Chapter One
!autosave

@scene rw.nao_after
!faceplayer nao
nao: {戻|もど}って きた の か 。 {忘|わす}れ{物|もの} ？ …… {鞄|かばん} の {底|そこ} の {手紙|てがみ} の こと は 、 また {今度|こんど} {話|はな}す よ 。 {今度|こんど} が あれば な 。 || Back already? Forget something? …I'll tell you about the letter at the bottom of my bag some other time. If there is another time.
?(ch>=5) nao: {灯落|ひおち} の {方|ほう} まで {配達|はいたつ} に {行|い}って きた 。 {道|みち} が {前|まえ} より {歩|ある}きやすい 。 あんた の おかげ か も な 。 || I've been doing deliveries out as far as Lanternfall. The roads are easier than before. Maybe that's thanks to you.

@scene rw.mio_after
!faceplayer mio
mio: いらっしゃいませ 。 …… あ 、 お{帰|かえ}り なさい 。 {傷薬|きずぐすり} 、 {足|た}りて います か ？ || Welcome… oh, welcome back. Do you have enough wound salve?
mio[think]: {最近|さいきん} 、 {夜|よる} は {店|みせ} を {閉|し}める こと に しました 。 {頼|たの}まれて も 、 です 。 …… {少|すこ}し ずつ 、 {練習|れんしゅう} して います 。 || Lately I've started closing the shop at night. Even if people ask. …I'm practising, bit by bit.

@scene rw.ren_after
!faceplayer ren
ren: {村|むら} の {灯|あか}り は {全部|ぜんぶ} ともって います 。 {毎晩|まいばん} {確|たし}かめて いる ので 、 {間違|まちが}い ありません 。 || Every lantern in the village is lit. I check each night, so there's no doubt.
ren[think]: {先生|せんせい} の {顔|かお} は 、 まだ {思|おも}い{出|だ}せません 。 でも 、 {待|ま}つ こと に しました 。 {灯守|ひもり} は {待|ま}つ の も {仕事|しごと} です から 。 || I still can't remember my teacher's face. But I've decided to wait. Waiting is part of a keeper's work.

@scene rw.suzu_after
!faceplayer suzu
suzu: あら 、 {主役|しゅやく} の お{帰|かえ}り ！ {一座|いちざ} は {先|さき} に {行|い}っちゃった けど 、 {私|わたし} は {村|むら} の {子|こ}ども たち と {新作|しんさく} を {練習中|れんしゅうちゅう} 。 || Oh, the lead returns! My troupe's gone on ahead, but I'm rehearsing a new piece with the village kids.
?(ch>=4) suzu[think]: …… {灰実|はいみ} の {方|ほう} に 、 {一度|いちど} {行|い}って きた の 。 {言|い}う べき こと を 、 やっと {言|い}えた 。 {誰|だれ} に 、 かは {内緒|ないしょ} 。 || …I went over to Cinder Orchard once. I finally said what I should have said. To whom — that's a secret.

@scene rw.tsuru_after
!faceplayer tsuru
tsuru: {帰|かえ}って きた の かい 。 {灯|あか}り は {元気|げんき} か い 。 あんた と $comp の {名前|なまえ} 、 まだ ちゃんと {読|よ}める か い 。 || You're back. Is the lantern holding up? Can you still read your name and $comp's on it?
`, 'ch1/32_depart');
