/* The companion-specific ending extensions (addendum §10), called from inside
 * each branch of sa.end_comp (src/content/ch6/53_scenes_ending.js), so the
 * ending stays one scene: recognition of one real shared moment (or the main
 * journey), the personal quest as it really stands, an optional reply that is
 * never scored, an invitation to keep walking, a small gesture, and a pet in
 * the background only when one is truly with you.
 *
 * Also: A Conversation We Still Owe Ourselves (a save that finished the story
 * before this passage existed: the same passage, told afterwards, in the
 * Lantern Hall) and An Unfinished Conversation (a personal quest finished
 * after the ending). The +2 bond and the Reflections memory are committed once
 * by !hook pages_end_done (src/content/pages/10_pages.js). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
# ======================================================================================
# Nao — messages, entrusted names, agency, knowing the way back
# ======================================================================================
@scene end.nao.core
!if pages.recall -> recall
nao: {灯落|ひおち} の {鐘|かね} も 、 {書庫|しょこ} へ の {坂|さか} も 、 {一緒|いっしょ} だった 。 {宛名|あてな} の {控|ひか}え は ない けど 、 {覚|おぼ}えてる 。 || Lanternfall's bell, the slope up to the Archive — we did those together. No copies of those addresses, but I remember.
!goto pq
:recall
!hook pages_recall
:pq
?(quest.lf_nao=done) nao[closed]: ウミ の {封筒|ふうとう} から はがした ラベル も 、 {束|たば} の {中|なか} に ある 。 {返事|へんじ} は {一行|いちぎょう} だけ 。 でも 、 {決|き}めた の は ウミ だ 。 || The label I peeled off Umi's envelope is in the bundle too. One line of reply. But Umi was the one who decided.
?(!quest.lf_nao=done) nao[think]: …… {鞄|かばん} の {底|そこ} に 、 まだ {届|とど}けて ない {手紙|てがみ} が {一通|いっつう} ある 。 どう する か は 、 {受|う}け{取|と}る {人|ひと} が {決|き}める 。 {灯落|ひおち} へ {持|も}って いって 、 {聞|き}いて みる 。 || …At the bottom of the bag there's still one letter I haven't delivered. What happens to it is up to the person it's for. I'll take it to Lanternfall and ask.
nao: {前|まえ} は 、 {重|おも}い {手紙|てがみ} を {一人|ひとり} で {抱|かか}えて た 。 {今|いま} は 、 {半分|はんぶん} くらい {持|も}って もらってる {気|き} が する 。 || I used to carry the heavy letters alone. These days it feels like you've been carrying about half.
?(bond>=trusted) nao[smirk]: {配達|はいたつ} の {順番|じゅんばん} に まで {口|くち} を {出|だ}す {相棒|あいぼう} は 、 {初|はじ}めて だ けど な 。 || First partner I've had who argues about the delivery order, mind you.

@scene end.nao.reply
nao: …… {次|つぎ} の {道|みち} の {話|はなし} だ 。 {聞|き}いて おきたい 。 $name は 、 どう {思|おも}ってる ？ || …About the next road. I want to hear it. What do you think?
!hook pages_choose reply
?(pages.pick=walk) nao[smile]: うん 。 {道|みち} は {二人|ふたり} で {選|えら}ぶ 。 {先|さき} に {一人|ひとり} で {決|き}めたり は しない 。 || Yeah. We pick the roads together. I won't go deciding ahead of you on my own.
?(pages.pick=home) nao: {分|わ}かる 。 {帰|かえ}り{道|みち} を {覚|おぼ}えて おく の は 、 {配達人|はいたつにん} の {一番|いちばん} {大事|だいじ} な {仕事|しごと} だ 。 {任|まか}せろ 。 || I get it. Remembering the way back is a courier's most important job. Leave it to me.
?(pages.pick=quiet) nao[smirk]: …… {頷|うなず}き {一|ひと}つ か 。 {受|う}け{取|と}った 。 {受取|うけとり} の {判子|はんこ} は いらない な 。 || …A nod. Received. No need to stamp for it.

@scene end.nao.b
!call end.nao.reply
nao: {明日|あした} は 、 ツル の {所|ところ} へ {行|い}こう 。 {見|み}せたい もの が ある って さ 。 {何|なに} か は 、 {知|し}らない 。 || Tomorrow, let's go and see Tsuru. She says there's something she wants to show us. No idea what.
nao: それ に 、 {五日|いつか} に {一度|いちど} は {潮硝子|しおがらす} {回|まわ}り の {配達|はいたつ} が ある 。 {暇|ひま} なら 、 {荷物|にもつ} を {半分|はんぶん} {持|も}て 。 || And every fifth day there's the Saltglass round. If you're free, carry half the parcels.

@scene end.nao.c
narr: ナオ は {鞄|かばん} を {肩|かた} に {掛|か}け{直|なお}し 、 {癖|くせ} で {橋|はし} の {両端|りょうはし} を {確|たし}かめた 。 それから 、 {少|すこ}し {笑|わら}った 。 || Nao shoulders the satchel again and, out of habit, checks both ends of the bridge. Then gives a small laugh.
!call end.pet.nao
!hook pages_end_done

@scene end.pet.nao
?(petvis=cat) narr: {猫|ねこ} が {下|お}ろした {鞄|かばん} の {上|うえ} に {乗|の}って 、 {宛名|あてな} の {束|たば} を {枕|まくら} に した 。 ナオ は {追|お}い{払|はら}わなかった 。 || The cat climbs onto the satchel and uses the bundle of labels as a pillow. Nao doesn't shoo it off.
?(petvis=dog) narr: {犬|いぬ} が {少|すこ}し {先|さき} まで {走|はし}って 、 {戻|もど}って きた 。 {出口|でぐち} を {確|たし}かめる {係|かかり} が 、 {一匹|いっぴき} {増|ふ}えた 。 || The dog runs a little way ahead and comes back. One more of you checking the exits.
?(petvis=bird) narr: {鳥|とり} が ナオ の {肩|かた} に {止|と}まって 、 ラベル の {端|はし} を つついた 。 || The bird lands on Nao's shoulder and pecks at the corner of a label.
?(petvis=tanuki) narr: たぬき が ナオ の {足元|あしもと} で {丸|まる}く なって 、 {大|おお}きな あくび を した 。 || The tanuki curls up at Nao's feet and gives an enormous yawn.

# ======================================================================================
# Mio — mutual support, healthy refusal, rest as growth
# ======================================================================================
@scene end.mio.core
!if pages.recall -> recall
mio: {雪鈴|ゆきすず} の {吹雪|ふぶき} も 、 {書庫|しょこ} の {長|なが}い {階段|かいだん} も 、 {一緒|いっしょ} に {越|こ}えた ね 。 {薬|くすり} より 、 {隣|となり} に {誰|だれ}か が いる こと の {方|ほう} が {効|き}いた 。 || We got through Snowbell's blizzard together, and the Archive's long stairs. Having someone beside me worked better than any medicine.
!goto pq
:recall
!hook pages_recall
:pq
?(quest.lf_mio=done) mio: {記録館|きろくかん} で タダシ さん に {言|い}えた の も 、 $name が {背中|せなか} に {手|て} を {当|あ}てて くれた から 。 {一人|ひとり} じゃ 、 {声|こえ} が {出|で}なかった 。 || I could say it to Tadashi at the Records Hall because you had a hand on my back. On my own, my voice wouldn't have come out.
?(!quest.lf_mio=done&quest.lf_mio>=2) mio[think]: {灯落|ひおち} に 、 まだ {返事|へんじ} を して いない {頼|たの}み{事|ごと} が {一|ひと}つ ある の 。 {自分|じぶん} の {声|こえ} で 、 ちゃんと {返|かえ}す 。 {急|いそ}がない けど 。 || There's still one request in Lanternfall I haven't answered. I'll answer it properly, in my own voice. Not in a hurry, though.
?(!quest.lf_mio>=2) mio[think]: {断|ことわ}る の は 、 まだ {練習|れんしゅう} {中|ちゅう} 。 {店|みせ} の {札|ふだ} が 、 {最初|さいしょ} の {一枚|いちまい} 。 || I'm still practising saying no. The sign on my shop is the first page.
mio: {旅|たび} の {間|あいだ} 、 わたし ばかり {薬|くすり} を {配|くば}って いた {気|き} が する けど 、 {本当|ほんとう} は わたし の {方|ほう} が {休|やす}ませて もらって た 。 || All through the journey it felt like I was the one handing out remedies. Really, you were the one letting me rest.
?(bond>=trusted) mio[smile]: {具合|ぐあい} を {聞|き}かれる {側|がわ} に なる の 、 {最初|さいしょ} は {落|お}ち{着|つ}かなかった の よ 。 {今|いま} は 、 {少|すこ}し {慣|な}れた 。 || Being the one asked how I'm feeling unsettled me at first. I'm a little used to it now.

@scene end.mio.reply
?(!pages.retrotalk) mio: …… ねえ 。 {続|つづ}き の {話|はなし} 。 これから の こと 、 どう {思|おも}ってる ？ || …Hey. About what comes next. How do you feel about it?
?(pages.retrotalk) mio: …… ねえ 。 これから の こと 、 あなた は どう {思|おも}ってる ？ {聞|き}いて なかった から 。 || …Hey. What comes next — how do you feel about it? I never asked.
!hook pages_choose reply
?(pages.pick=carry) mio[laugh]: いい の ？ じゃあ 、 {重|おも}い {方|ほう} の {鞄|かばん} を お{願|ねが}い 。 …… {冗談|じょうだん} 。 {半分|はんぶん} ずつ に しよう 。 || Really? Then you get the heavy bag. …Joking. Half each.
?(pages.pick=rest) mio[smile]: {水曜|すいよう} は {休|やす}み だ から 、 {何|なに} も しない の は {得意|とくい} よ 。 お{茶|ちゃ} は {交代|こうたい} で {淹|い}れよう 。 {今週|こんしゅう} は あなた 。 || Wednesdays I'm closed, so doing nothing is my speciality. We'll take turns making the tea. This week it's you.
?(pages.pick=quiet) mio: …… うん 。 それ で いい 。 {言葉|ことば} に しなくて も 、 {分|わ}かる こと も ある 。 || …Mm. That's enough. Some things you understand without saying them.

@scene end.mio.b
!call end.mio.reply
mio: ツル さん が {灯|あか}り{堂|どう} で {何|なに}か {見|み}せたい って 。 {包帯|ほうたい} と お{茶|ちゃ} を {持|も}って 、 {一緒|いっしょ} に {行|い}こう 。 …… {水曜|すいよう} {以外|いがい} なら ね 。 || Tsuru wants to show us something at the Lantern Hall. Let's go together, with bandages and tea. …Any day but Wednesday.
mio: それ から 、 {約束|やくそく} を {一|ひと}つ 。 {疲|つか}れたら 、 {先|さき} に {言|い}う 。 わたし も 、 あなた も 。 || And one promise. Whoever gets tired says so first. Me, and you.

@scene end.mio.c
narr: ミオ は {戸口|とぐち} の {札|ふだ} を 、 {指|ゆび} で {少|すこ}し だけ {直|なお}した 。 もう {十分|じゅうぶん} まっすぐ だった のに 。 || Mio straightens the sign on the door by a hair with one finger. It was already perfectly straight.
!call end.pet.mio
!hook pages_end_done

@scene end.pet.mio
?(petvis=cat) narr: {猫|ねこ} が ミオ の {瓶|びん} の {袋|ふくろ} の {匂|にお}い を {嗅|か}いだ 。 「 あなた の {分|ぶん} は ない の よ 」 と 、 ミオ は {笑|わら}った 。 || The cat sniffs at Mio's bag of bottles. "Nothing in there for you," Mio laughs.
?(petvis=dog) narr: {犬|いぬ} が {二人|ふたり} の {足元|あしもと} に {伏|ふ}せた 。 {休|やす}み の {日|ひ} の {番犬|ばんけん} の よう に 。 || The dog lies down at your feet, like a watchdog for a day off.
?(petvis=bird) narr: {鳥|とり} が {棚|たな} の {上|うえ} に {止|と}まって 、 {二人|ふたり} を {見下|みお}ろして いる 。 || The bird perches on top of the shelves, looking down at the two of you.
?(petvis=tanuki) narr: たぬき が ミオ の {薬草|やくそう} の {袋|ふくろ} を {覗|のぞ}き{込|こ}んで 、 そっと {戻|もど}された 。 || The tanuki peers into Mio's bag of herbs and is gently put back.

# ======================================================================================
# Ren — the choice they made, room for uncertainty, shared navigation
# ======================================================================================
@scene end.ren.pq
?(sa_ren_took) ren: {師匠|ししょう} の {顔|かお} は 、 {今|いま} は ちゃんと {思|おも}い{出|だ}せます 。 {眉|まゆ} が {太|ふと}い 。 {最後|さいご} の {口論|こうろん} も 、 {一緒|いっしょ} に 。 || I can picture my teacher's face properly now. Heavy eyebrows. The last quarrel came with it.
?(sa_ren_left) ren: {師匠|ししょう} の {顔|かお} は 、 {書庫|しょこ} に {預|あず}けた まま です 。 {選|えら}ばない こと を 、 {選|えら}びました 。 {教|おし}え は 、 ここ に あります 。 || My teacher's face is still left at the Archive. I chose not to choose. The lessons are here.

@scene end.ren.core
!if pages.recall -> recall
ren: {鐘楼|しょうろう} の {鐘|かね} も 、 {書庫|しょこ} の {門|もん} も 、 あなた が {隣|となり} に いました 。 {記録|きろく} に は {書|か}いて いません が 、 {覚|おぼ}えて います 。 || The bell tower's bell, the Archive gate — you were beside me for both. It isn't in the record, but I remember.
!goto next
:recall
!hook pages_recall
:next
ren: {一人|ひとり} で {灯|ひ} を {守|まも}って いた {頃|ころ} は 、 {分|わ}からない こと が {怖|こわ}かった 。 {今|いま} は 、 {分|わ}からない まま {二人|ふたり} で {歩|ある}ける 。 || When I kept the lamps alone, not knowing frightened me. Now the two of us can walk on without knowing.
?(bond>=trusted) ren[smirk]: {迷|まよ}った {回数|かいすう} も 、 {全部|ぜんぶ} {数|かぞ}えて あります 。 {公表|こうひょう} は しません 。 || I've also counted every time we got lost. I won't be publishing the figures.

@scene end.ren.reply
ren: …… {真面目|まじめ} な {質問|しつもん} を {一|ひと}つ 。 これから {一緒|いっしょ} に {歩|ある}く と したら 、 どう {分担|ぶんたん} します か 。 || …One serious question. If we go on walking together, how shall we divide the work?
!hook pages_choose reply
?(pages.pick=map) ren: {公平|こうへい} です 。 {地図|ちず} は あなた 、 {名前|なまえ} は わたし 。 {方角|ほうがく} で {揉|も}めたら 、 {地図|ちず} の {方|ほう} を {信|しん}じて ください 。 || Fair. You the maps, me the names. If we disagree about direction, trust the map.
?(pages.pick=lost) ren[smile]: …… {書|か}き{留|と}めて おきます 。 {師匠|ししょう} の {教|おし}え の {横|よこ} に 。 {字|じ} は 、 {少|すこ}し {右|みぎ} に {跳|は}ねさせて 。 || …I'll write that down. Next to my teacher's lessons. With the last stroke kicking a little to the right.
?(pages.pick=quiet) ren: …… それ で 、 {返事|へんじ} は {十分|じゅうぶん} です 。 || …That will do for an answer.

@scene end.ren.b
!call end.ren.reply
ren: ツル さん が 、 {何|なに}か {見|み}せたい もの が ある そう です 。 {明日|あした} の {朝|あさ} 、 {名前|なまえ} を {書|か}き{直|なお}して から 、 {一緒|いっしょ} に {行|い}きましょう 。 || Tsuru says she has something to show us. Tomorrow morning, after I've rewritten the names, let's go together.
ren: {朝|あさ} の {灯|ひ} の {見回|みまわ}り に も 、 {付|つ}き{合|あ}って ください 。 {地図|ちず} を {持|も}って くれれば 、 {昼|ひる} まで に は {帰|かえ}れます 。 || And come on the morning lamp rounds with me. If you carry the map, we will be back by noon.

@scene end.ren.c
narr: レン は {磨|みが}き{終|お}えた {二|ふた}つ の {灯|ひ} に {火|ひ} を {入|い}れ 、 {灯|あか}り{堂|どう} の {戸口|とぐち} の {両側|りょうがわ} に {一|ひと}つ ずつ {置|お}いた 。 || Ren lights the two polished lamps and sets one on each side of the Lantern Hall door.
ren: {一|ひと}つ は あなた の {分|ぶん} です 。 {遅|おそ}く {帰|かえ}って きて も 、 {見|み}える よう に 。 || One of them is yours. So you can see it, even if you come home late.
!call end.pet.ren
!hook pages_end_done

@scene end.pet.ren
?(petvis=cat) narr: {猫|ねこ} が レン の {灯|ひ} の {横|よこ} に {座|すわ}って 、 {温|あたた}かい {方|ほう} へ {少|すこ}し ずつ {寄|よ}って いった 。 || The cat sits down beside Ren's lamp and edges, little by little, towards the warm side.
?(petvis=dog) narr: {犬|いぬ} が {灯|ひ} の {匂|にお}い を {嗅|か}いで 、 {大|おお}きな くしゃみ を した 。 レン は {真顔|まがお} で 「 お{大事|だいじ} に 」 と {言|い}った 。 || The dog sniffs a lamp and sneezes hugely. "Bless you," says Ren, completely straight-faced.
?(petvis=bird) narr: {鳥|とり} が {近|ちか}く の {灯籠|とうろう} に {止|と}まり 、 {灯|ひ} の {番|ばん} を する よう に {首|くび} を かしげた 。 || The bird lands on a lantern nearby and tilts its head, as if keeping watch over the light.
?(petvis=tanuki) narr: たぬき が {灯|ひ} の {横|よこ} で {丸|まる}く なり 、 {一緒|いっしょ} に {番|ばん} を {始|はじ}めた 。 || The tanuki curls up beside the lamp and starts keeping watch with it.

# ======================================================================================
# Suzu — one sincere moment without a performance; humour and precision kept
# ======================================================================================
@scene end.suzu.a
narr: スズ は {舞台|ぶたい} の {端|はし} に {腰|こし} を {下|お}ろした 。 {舞台|ぶたい} の {声|こえ} を 、 {少|すこ}し {落|お}とす 。 || Suzu sits down on the edge of the stage and lets her voice drop out of its stage pitch.
suzu: {一|ひと}つ だけ 、 {衣装|いしょう} なし で {言|い}わせて 。 || Let me say one thing without a costume.
!call end.suzu.core

@scene end.suzu.core
!if pages.recall -> recall
suzu: {灰実|はいみ} の {工房|こうぼう} で 、 あなた は {客席|きゃくせき} に いて くれた 。 {灯落|ひおち} の {鐘|かね} の {時|とき} も 、 {書庫|しょこ} の {上|うえ} でも 。 {台本|だいほん} の ない {所|ところ} で 、 ずっと 。 || In the Cinder Orchard workshop, you stayed in the audience for me. At Lanternfall's bell, and up at the Archive too. Everywhere without a script.
!goto pq
:recall
!hook pages_recall
:pq
suzu: ヒロ が 、 {次|つぎ} の {祭|まつ}り で も {本当|ほんとう} の {話|はなし} を {聞|き}かせて くれ って 。 {嘘|うそ} じゃ ない {話|はなし} も 、 {稽古|けいこ} が いる んだ ね 。 {帳簿|ちょうぼ} に は 、 まだ 「 {一部|いちぶ} {返済|へんさい} 」 。 || Hiro wants the true version at the festivals, too. Turns out even a true story needs rehearsing. In my ledger it still says "paid in part".
suzu[closed]: …… {主役|しゅやく} って {書|か}いた けど 、 あなた は {一度|いちど} も {舞台|ぶたい} を {欲|ほ}しがらなかった 。 ただ 、 {歩|ある}いて いた 。 そこ を 、 ちゃんと {書|か}きたい の 。 || …I wrote you in as the lead, but you never once asked for a stage. You just walked. That's the part I want to get right.
?(bond>=trusted) suzu[laugh]: …… はい 、 {今|いま} の は {台本|だいほん} に {載|の}せない 。 {照|て}れる から 。 || …Right, that bit's not going in the script. Too embarrassing.

@scene end.suzu.reply
?(!pages.retrotalk) suzu: {最後|さいご} の {幕|まく} の {前|まえ} に 、 {聞|き}いて おく 。 {次|つぎ} の {幕|まく} で 、 あなた は どこ に いたい ？ || Before the final curtain, I'll ask. In the next act, where do you want to be?
?(pages.retrotalk) suzu: {次|つぎ} の {幕|まく} の {前|まえ} に 、 {聞|き}いて おく 。 あなた は どこ に いたい ？ || Before the next act, I'll ask. Where do you want to be?
!hook pages_choose reply
?(pages.pick=seat) suzu[laugh]: {一番|いちばん} {前|まえ} の {席|せき} 、 {予約|よやく} {済|ず}み 。 {木戸銭|きどせん} は いらない 。 {帳簿|ちょうぼ} に も つけない 。 || Front row, reserved. No admission. I won't even put it in the ledger.
?(pages.pick=onstage) suzu[surprise]: …… わたし も ？ …… {分|わ}かった 。 {一行|いちぎょう} だけ 、 {自分|じぶん} の {台詞|せりふ} を {書|か}く 。 {嘘|うそ} の ない やつ 。 || …Me too? …All right. I'll write myself one line. One without a lie in it.
?(pages.pick=quiet) suzu[smile]: …… {台詞|せりふ} なし 。 いい {芝居|しばい} は 、 そういう の が {一番|いちばん} {効|き}く の 。 || …No lines. In a good play, that's what lands hardest.

@scene end.suzu.b
!call end.suzu.reply
suzu: {次|つぎ} の {幕|まく} は 、 ツル さん の {灯|あか}り{堂|どう} から {始|はじ}まる らしい よ 。 それ と 、 {雨|あめ} の {日|ひ} は ハナ の {茶屋|ちゃや} で {小|ちい}さな {芝居|しばい} 。 あなた は {見|み}てる だけ で いい 。 || The next act starts at Tsuru's Lantern Hall, apparently. And on rainy days, a little play at Hana's teahouse. You only have to watch.

@scene end.suzu.c
narr: スズ は {帳簿|ちょうぼ} を {開|ひら}いて 、 {最後|さいご} の {頁|ページ} に {一行|いちぎょう} {書|か}き{足|た}した 。 「 {預|あず}け{物|もの} 、 リボン {一本|いっぽん} 。 {返却|へんきゃく} 、 {次|つぎ} の {幕|まく} 。 {必|かなら}ず 。 」 || Suzu opens her ledger and adds a line on the last page: "Left in safekeeping: one ribbon. To be returned: next act. Without fail."
!call end.pet.suzu
!hook pages_end_done

@scene end.pet.suzu
?(petvis=cat) narr: {猫|ねこ} が {二人|ふたり} の {真|ま}ん{中|なか} に {座|すわ}り{込|こ}んだ 。 スズ は 「 {主役|しゅやく} を {取|と}られた 」 と {笑|わら}った 。 || The cat sits down right between the two of you. "Upstaged," Suzu laughs.
?(petvis=dog) narr: {犬|いぬ} が スズ の {前|まえ} で {尻尾|しっぽ} を {振|ふ}って いる 。 {客席|きゃくせき} の {一列目|いちれつめ} は 、 もう {埋|う}まって いた 。 || The dog wags its tail in front of Suzu. The front row is already taken.
?(petvis=bird) narr: {鳥|とり} が {一声|ひとこえ} {鳴|な}いた 。 {幕|まく} の {合図|あいず} の よう に 。 || The bird calls once, like the cue for the curtain.
?(petvis=tanuki) narr: たぬき が スズ の {荷物|にもつ} の {陰|かげ} から {顔|かお} を {出|だ}した 。 スズ は {真面目|まじめ} な {顔|かお} で 、 {小道具|こどうぐ} {係|がかり} に {任命|にんめい} した 。 || The tanuki pokes its head out from behind Suzu's luggage. Straight-faced, Suzu appoints it head of props.

# ======================================================================================
# A Conversation We Still Owe Ourselves (§10.4): an older postgame save, told now
# ======================================================================================
@scene pages.enter_retro
# Staged (positions only; the conversation is pages.retro): walking into the Hall, your companion steps off the
# doorway to your side and you turn to them.
?(comp) !walkto comp 6 8 left
?(comp) !look pc comp
?(comp=nao) nao: $name 。 {少|すこ}し いい か 。 {言|い}いそびれてた こと が ある 。 || $name. Got a minute? There's something I never got round to saying.
?(comp=mio) mio: $name 、 {少|すこ}し {座|すわ}らない ？ {話|はな}して おきたい こと が ある の 。 || $name, sit down a moment? There's something I'd like to talk about.
?(comp=ren) ren: $name 。 {少|すこ}し {時間|じかん} を ください 。 {言|い}って おく べき こと が あります 。 || $name. Give me a little time. There's something I ought to say.
?(comp=suzu) suzu: $name 、 {幕間|まくあい} を {少|すこ}し だけ ちょうだい 。 {言|い}いそびれた {台詞|せりふ} が ある の 。 || $name, give me a short interval. There's a line I never got to say.
!choice
* {今|いま} {話|はな}そう || Let's talk now -> now
* また {後|あと} で || Later -> later
:later
?(comp=nao) nao: いつ でも いい 。 {声|こえ} を かけて くれ 。 || Whenever. Just say.
?(comp=mio) mio: うん 。 {急|いそ}がない から 。 {話|はな}したく なったら 、 {声|こえ} を かけて ね 。 || Mm. No hurry. When you feel like talking, just say.
?(comp=ren) ren: {承知|しょうち} しました 。 {話|はなし} は 、 {逃|に}げません 。 || Understood. It isn't going anywhere.
?(comp=suzu) suzu: {了解|りょうかい} 。 {開演|かいえん} は 、 あなた の {合図|あいず} で 。 || Understood. Curtain up on your cue.
!end
:now
!call pages.retro

@scene pages.retro
# Staged (anywhere it is told: no position is assumed): you turn to your companion and the narration's action is
# theirs. Nao sets the satchel down (a bend), turns back to you with an open hand, nods at choosing the roads
# together, and shoulders the satchel, looking one way and the other. Mio sits down first, nods at the plan,
# then gets up to straighten the ledgers. Ren bends to set the lamp down and cleans their glasses (the one
# adjustment of the scene), explains with an open hand, then puts their own lamp in your hand. Suzu breathes
# out like a costume coming off, her head goes down for the hard lines, an open hand for the next act, and she
# writes the line in her ledger.
!hook pages_retro_begin
?(comp) !look pc comp
!if comp=nao -> nao
!if comp=mio -> mio
!if comp=ren -> ren
!if comp=suzu -> suzu
!end
:nao
!gesture nao bend down
narr: ナオ は {鞄|かばん} を {下|お}ろして 、 {灯|あか}り{堂|どう} の {壁|かべ} に もたれた 。 || Nao sets the satchel down and leans against the Lantern Hall wall.
!look nao pc
!gesture nao palm
nao: {旅|たび} が {終|お}わって から 、 {配達|はいたつ} ばっかり で 、 ちゃんと {話|はな}して なかった な 。 {今|いま} {言|い}って おく 。 || Since the journey ended it's been nothing but deliveries. We never properly talked. I'll say it now.
!call end.nao.core
!call end.nao.reply
!gesture nao nod pc
nao: {地図|ちず} に ない {道|みち} も 、 {潮硝子|しおがらす} {回|まわ}り も 、 {次|つぎ} は {二人|ふたり} で {選|えら}ぼう 。 {断|ことわ}る {理由|りゆう} は 、 {今|いま} の ところ ない 。 || Roads that aren't on any map, the Saltglass round — next time, we choose them together. So far I haven't got a reason to say no.
!gesture nao strap left then=lookbetween and=right
narr: ナオ は {鞄|かばん} を {背負|せお}い{直|なお}して 、 {出口|でぐち} を {確|たし}かめ 、 それから {入口|いりぐち} も {確|たし}かめた 。 || Nao shoulders the satchel, checks the exit, and then checks the entrance too.
!call end.pet.nao
!hook pages_end_done retro
!end
:mio
!pose mio sit
narr: ミオ は {灯|あか}り{堂|どう} の {長椅子|ながいす} に {腰|こし} を {下|お}ろした 。 {珍|めずら}しく 、 {先|さき} に {座|すわ}った 。 || Mio sits down on a bench in the Lantern Hall. For once, she sits down first.
mio: {旅|たび} が {終|お}わって から 、 {店|みせ} の こと ばかり で 、 ちゃんと {話|はな}して なかった 。 …… {少|すこ}し だけ {聞|き}いて 。 || Since the journey ended, it's been all about the shop. We never properly talked. …Just listen for a bit.
!call end.mio.core
!call end.mio.reply
!gesture mio nod pc
mio: {書|か}かれて いない {道|みち} に {出|で}る {日|ひ} は 、 {包帯|ほうたい} と お{茶|ちゃ} を {持|も}って 。 {出|で}ない {日|ひ} は 、 {茶屋|ちゃや} で {何|なに} も しない 。 どっち も 、 {一緒|いっしょ} に 。 || On days we go out on the unwritten roads, bandages and tea. On days we don't, doing nothing at the teahouse. Either way, together.
!pose mio -
!gesture mio tidy
narr: ミオ は ツル の {机|つくえ} の {帳面|ちょうめん} を {揃|そろ}え かけて 、 {手|て} を {止|と}めた 。 {一冊|いっさつ} だけ 、 {曲|ま}がった まま に した 。 || Mio starts to straighten the ledgers on Tsuru's desk, then stops. She leaves one of them crooked.
!call end.pet.mio
!hook pages_end_done retro
!end
:ren
!gesture ren bend down then=glasses
narr: レン は {灯|ひ} を {床|ゆか} に {置|お}いて 、 {眼鏡|めがね} を {拭|ふ}いた 。 {拭|ふ}く {必要|ひつよう} は なかった 。 || Ren sets the lamp down on the floor and cleans their glasses. They didn't need cleaning.
!look ren pc
!gesture ren palm
ren: {橋|はし} を {渡|わた}って {帰|かえ}って きた {日|ひ} 、 {言|い}う べき こと を {言|い}い{忘|わす}れて いました 。 {記録|きろく} の {漏|も}れ は 、 {直|なお}さない と 。 || The day we crossed the bridge home, I forgot to say something I should have. Gaps in the record have to be fixed.
!call end.ren.pq
!call end.ren.core
!call end.ren.reply
!gesture ren nod pc
ren: ツル さん の {帳面|ちょうめん} の {道|みち} に は 、 まだ {歩|ある}いて いない もの が あります 。 あなた が {地図|ちず} を 、 わたし が {灯|ひ} を 。 || There are still roads in Tsuru's ledger we haven't walked. You take the map, I'll take the lamp.
!prop ren lantern
!gesture ren handover pc
!gesture pc receive ren
narr: レン は {灯|あか}り{堂|どう} の {灯籠|とうろう} の {芯|しん} を {切|き}り{揃|そろ}え 、 {少|すこ}し {迷|まよ}って から 、 {自分|じぶん} の {灯|ひ} を $name に {持|も}たせた 。 || Ren trims the wick of the Hall's lantern and, after a moment's hesitation, hands you their own lamp to hold.
!call end.pet.ren
!hook pages_end_done retro
!end
:suzu
!gesture suzu exhale
narr: スズ は {声|こえ} の {張|は}り を {落|お}とした 。 {衣装|いしょう} を {脱|ぬ}ぐ みたい に 。 || Suzu lets her voice drop, like taking off a costume.
!look suzu pc
!gesture suzu lowered
suzu: {幕|まく} が {下|お}りた {後|あと} の {台詞|せりふ} って 、 {一番|いちばん} {難|むずか}しい の 。 だから {後回|あとまわ}し に して た 。 {今|いま} {言|い}う ね 。 || The lines after the curtain comes down are the hardest. So I kept putting them off. I'll say them now.
!call end.suzu.core
!call end.suzu.reply
!gesture suzu palm
suzu: {次|つぎ} の {幕|まく} は 、 {書|か}かれて いない {道|みち} で も 、 ハナ の {茶屋|ちゃや} で も いい 。 あなた は {見|み}てる だけ で いい から ね 。 || The next act can be on the unwritten roads or at Hana's teahouse. You only have to watch.
!gesture suzu write
narr: スズ は {帳簿|ちょうぼ} に {一行|いちぎょう} {書|か}き{足|た}した 。 「 {言|い}いそびれた {台詞|せりふ} 、 {一|ひと}つ 。 {支払|しはら}い {済|ず}み 。 」 || Suzu adds a line to her ledger: "One line left unsaid. Paid."
!call end.pet.suzu
!hook pages_end_done retro
!end

# ======================================================================================
# An Unfinished Conversation (§10.4): a personal quest finished after the ending
# ======================================================================================
@scene pages.enter_unfinished
# Staged (positions only; the conversation is pages.unfinished): your companion steps off the doorway to your
# side and you turn to them.
?(comp) !walkto comp 6 8 left
?(comp) !look pc comp
?(comp=nao&memory.ending:nao) nao: $name 。 {橋|はし} の {上|うえ} の {話|はなし} の 、 {続|つづ}き が ある 。 || $name. There's more to what I said on the bridge.
?(comp=nao&!memory.ending:nao) nao: $name 。 この {前|まえ} の {話|はなし} の 、 {続|つづ}き が ある 。 || $name. There's more to what I said the other day.
?(comp=mio) mio: $name 、 {聞|き}いて ほしい こと が ある の 。 {前|まえ} の {話|はなし} の {続|つづ}き 。 || $name, there's something I want you to hear. The rest of what I said before.
!choice
* {聞|き}かせて || Tell me -> now
* また {後|あと} で || Later -> later
:later
?(comp=nao) nao: {分|わ}かった 。 {急|いそ}ぐ {話|はなし} じゃ ない 。 || Right. It's not urgent.
?(comp=mio) mio: うん 。 また {今度|こんど} 。 || Mm. Another time.
!end
:now
!call pages.unfinished

@scene pages.unfinished
# Staged (anywhere it is told): you turn to your companion. Nao pats the lighter satchel, nods at Umi's one line,
# and pats it again; Mio laughs as she tells it, her hands fidget over how they shook, and she thanks you with
# both hands for the hand on her back.
?(comp) !look pc comp
!if comp=nao -> nao
!if comp=mio -> mio
!end
:nao
!gesture nao strap
narr: ナオ が 、 {鞄|かばん} の {底|そこ} を {軽|かる}く {叩|たた}いた 。 {手紙|てがみ} の {分|ぶん} だけ 、 {軽|かる}く なって いる 。 || Nao gives the bottom of the satchel a light pat. It's one letter lighter.
?(memory.ending:nao) nao: {橋|はし} の {上|うえ} で {言|い}った {手紙|てがみ} 、 {届|とど}けた 。 || That letter I mentioned on the bridge — I delivered it.
?(!memory.ending:nao) nao: {前|まえ} に {言|い}った {手紙|てがみ} 、 {届|とど}けた 。 || That letter I mentioned before — I delivered it.
nao: ウミ は {一行|いちぎょう} だけ {書|か}いた 。 「 {読|よ}みました 」 って 。 {許|ゆる}す とも 、 {許|ゆる}さない とも {書|か}いて なかった 。 || Umi wrote one line. "I read it." Didn't say she forgives him, didn't say she doesn't.
!gesture nao nod pc
nao: それ で いい 。 {決|き}めた の は ウミ だ 。 {配達人|はいたつにん} の {仕事|しごと} は 、 そこ まで 。 || That's right. Umi decided. That's where a courier's job ends.
!gesture nao strap
nao[smile]: …… {途中|とちゅう} で {止|と}まってた {話|はなし} 、 これ で {最後|さいご} まで {言|い}えた な 。 {鞄|かばん} が {軽|かる}い 。 || …So I've finally finished what I started saying. The bag's lighter.
!hook pages_unfinished_done
!end
:mio
!gesture mio laugh
mio[laugh]: {聞|き}いて 。 {言|い}えた の 。 タダシ さん に 、 {自分|じぶん} の {声|こえ} で 。 「 お{断|ことわ}り します 」 って 。 || Listen. I said it. To Tadashi, in my own voice. "I refuse."
mio: {前|まえ} に 、 まだ {返事|へんじ} して いない {頼|たの}み{事|ごと} が ある って {言|い}った でしょ 。 あれ 、 {片付|かたづ}いた 。 || Remember I said there was still a request I hadn't answered? That's done now.
!gesture mio fidget
mio: {手|て} は 、 やっぱり {震|ふる}えた 。 でも 、 {声|こえ} は {震|ふる}えなかった 。 {少|すこ}し しか 。 || My hands shook, of course. But my voice didn't. Hardly at all.
!gesture mio thanks pc
mio[smile]: {背中|せなか} に {手|て} を {当|あ}てて くれて 、 ありがとう 。 {次|つぎ} は 、 わたし が {当|あ}てる {番|ばん} ね 。 || Thank you for the hand on my back. Next time, it's my turn.
!hook pages_unfinished_done
!end
`, 'pages/ending');
