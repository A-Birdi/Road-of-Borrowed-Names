/* Kotonoha, Chapter 9: the side stories (expansion P11f; the quests and their wiring in 15_side.js, the tasks in
 * 32_side_learning.js). Ao's secret lessons and the leaf he reads in the hall; Kihei's letter, Hatsu, and what becomes
 * of it (three lasting ends, each shown before it is chosen); the leaf with the player's name, read and answered; the
 * keepers' census; the tide calendar's moon stones and the night the leaves rise. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
# ---- The Apprentice Who Cannot Read ---------------------------------------------------------------------------------
@scene ko.ao_ask
# Ao, once the Leafling is chased off his basket or his leaf has been given: in secret, he asks to be taught.
!faceplayer
ko_ao: …… ねえ 。 {誰|だれ} に も {言|い}わない ？ || …Hey. You won't tell anyone?
ko_ao[worry]: {僕|ぼく} 、 {葉|は} の {字|じ} が {読|よ}めない 。 ナナ は {読|よ}める のに 。 {三|みっ}つ も {年下|としした} なのに 。 || I can't read the writing on the leaves. Nana can, and she's three years younger.
ko_ao: ヨシノ {先生|せんせい} の {所|ところ} に は 、 もう {行|い}けない 。 {大|おお}きい {子|こ} は {僕|ぼく} だけ だ から 。 …… だから 、 こっそり {教|おし}えて 。 ここ で 。 || I can't go to Miss Yoshino's now. I'm the only big one. …So teach me, secretly. Here.
?(comp=nao) comp: {秘密|ひみつ} の {授業|じゅぎょう} か 。 {俺|おれ} も {見習|みなら}い の {頃|ころ} 、 {宛名|あてな} の {字|じ} は {夜|よる} に {覚|おぼ}えた 。 || Secret lessons, eh. When I was an apprentice, I learned the letters on addresses at night too.
?(comp=mio) comp[smile]: {大丈夫|だいじょうぶ} 。 {読|よ}める よう に なる まで 、 {誰|だれ} に も {言|い}わない わ 。 || It's all right. We won't tell anyone until you can read.
?(comp=ren) comp: {灯籠|とうろう} の {名前|なまえ} も 、 {最初|さいしょ} は {一字|いちじ} ずつ でした 。 {私|わたし} も です 。 || Lantern names start one letter at a time too. Mine did.
?(comp=suzu) comp[smile]: {稽古|けいこ} は {人|ひと} に {見|み}せない もの よ 。 {幕|まく} が {上|あ}がる まで は ね 。 || Rehearsals aren't for showing anyone. Not till the curtain goes up.
!quest ko_ao 0

@scene ko.ao_lesson
# The three lessons, one at a time, each time you talk to Ao while the quest is at its first stage.
!faceplayer
!if var.ko_ao_l>=2 -> l3
!if var.ko_ao_l>=1 -> l2
ko_ao: これ 、 「れこ」 って {書|か}いて ある ？ …… {変|へん} な {言葉|ことば} 。 || Does this one say れこ? …Funny word.
!challenge ko.ao_teach1
!if var._res=1 -> ok
!goto later
:l2
ko_ao: これ は 「こんにち ハ」 。 …… {合|あ}ってる ？ {何|なん} か {変|へん} だ 。 || This says こんにち-ha. …Is that right? Something's off.
!challenge ko.ao_teach2
!if var._res=1 -> ok
!goto later
:l3
ko_ao: 「きつて」 。 …… {切手|きって} の こと かな 。 でも 、 {字|じ} が {一|ひと}つ {小|ちい}さい 。 || きつて. …A stamp, maybe? But one letter's small.
!challenge ko.ao_teach3
!if var._res=1 -> ok
!goto later
:ok
!var ko_ao_l + 1
!if var.ko_ao_l>=3 -> done
?(var.ko_ao_l=1) ko_ao[happy]: 「ねこ」 ！ ね の {最後|さいご} は 、 くるっと {丸|まる} 。 れ に は {丸|まる} が ない 。 …… {覚|おぼ}えた 。 || ねこ, cat! ね ends in a little loop; れ doesn't. …Got it.
?(var.ko_ao_l=2) ko_ao[happy]: {助詞|じょし} の 「は」 は 、 「わ」 って {読|よ}む んだ 。 …… ずるい けど 、 {覚|おぼ}えた 。 || The particle は is read わ. …That's cheating, but I've got it.
ko_ao: {次|つぎ} の {葉|は} も 、 {取|と}って おく 。 || I'll keep the next leaf for you.
!end
:done
ko_ao[happy]: 「きって」 ！ {小|ちい}さい 「つ」 は 、 {次|つぎ} の {音|おと} の {前|まえ} で 、 ちょっと {止|と}まる 。 …… {三|みっ}つ とも 、 {覚|おぼ}えた ！ || きって! A small つ means a little stop before the next sound. …I've got all three!
ko_ao: ナナ が 、 {僕|ぼく} の {籠|かご} に {葉|は} を {一枚|いちまい} {入|い}れた 。 {何|なに} か {書|か}いて ある 。 …… {館|やかた} で 、 ヨシノ {先生|せんせい} の {前|まえ} で {読|よ}んで みる 。 {来|き}て 。 || Nana's put a leaf in my basket. Something's written on it. …I'm going to read it in the hall, in front of Miss Yoshino. Come with me.
!quest ko_ao 1
!end
:later
ko_ao: …… {今日|きょう} は もう いい 。 また {教|おし}えて 。 || …That'll do for today. Teach me again.

@scene ko.ao_reads
# In the keepers' hall, in front of Yoshino: Ao reads the leaf Nana slipped into his basket. It is his own name.
!faceplayer
narr: アオ が 、 {籠|かご} から {葉|は} を {一枚|いちまい} {出|だ}す 。 ヨシノ が 、 {本|ほん} を {閉|と}じる 。 || Ao takes a leaf from his basket. Yoshino closes her book.
ko_ao: …… ア 。 …… オ 。 || …A. …O.
ko_ao[surprise]: アオ 。 …… {僕|ぼく} の {名前|なまえ} だ 。 || Ao. …It's my name.
ko_yoshino[smile]: ナナ が {書|か}いた の ね 。 カタカナ で 。 …… アオ 、 {明日|あした} の {朝|あさ} 、 {席|せき} を {一|ひと}つ {空|あ}けて おきます 。 {一番|いちばん} {後|うし}ろ の {席|せき} です けど 。 || Nana wrote it, in katakana. …Ao, tomorrow morning I'll keep a seat for you. The one at the very back, mind.
ko_ao: …… {後|うし}ろ で いい 。 {後|うし}ろ が いい 。 || …The back's fine. The back's best.
?(comp=nao) comp: {自分|じぶん} の {名前|なまえ} が {読|よ}めたら 、 {次|つぎ} は {他人|たにん} の {名前|なまえ} だ 。 そう やって {宛名|あてな} が {全部|ぜんぶ} {読|よ}める よう に なる 。 || Once you can read your own name, other people's come next. That's how you get to read every address.
?(comp=mio) comp[smile]: {最初|さいしょ} に {読|よ}めた の が 、 {自分|じぶん} の {名前|なまえ} 。 …… いい {始|はじ}まり ね 。 || The first thing you read is your own name. …That's a good start.
?(comp=ren) comp[smile]: {名前|なまえ} を {呼|よ}ぶ と 、 {灯|ひ} が {点|つ}く 。 …… {同|おな}じ です ね 。 || You call a name, and a light comes on. …The same thing.
?(comp=suzu) comp[laugh]: {初舞台|はつぶたい} の {台詞|せりふ} が 、 {自分|じぶん} の {名前|なまえ} ！ {大物|おおもの} に なる わ よ 、 この {子|こ} 。 || His first line on stage is his own name! This one'll be a star.
!quest ko_ao done
!set ko_ao_reads

# ---- The Sailor's Last Letter ----------------------------------------------------------------------------------------
@scene ko.kihei_ask
!faceplayer
ko_kihei: また {会|あ}った な 。 …… {俺|おれ} は キヘイ 。 {昔|むかし} 、 この {島|しま} の {船乗|ふなの}り だった 。 || We meet again. …I'm Kihei. I was a sailor from this island, long ago.
ko_kihei: {陸|りく} の {港|みなと} で 、 {手紙|てがみ} を {一通|いっつう} {書|か}いた 。 {出|だ}す {前|まえ} に 、 {船|ふね} が {出|で}た 。 {船|ふね} は {戻|もど}らなかった 。 || In a mainland harbour I wrote a letter. The boat sailed before I could send it, and it never came back.
ko_kihei: {出|だ}せなかった {手紙|てがみ} は 、 {葉|は} に なって ここ へ {来|く}る と {聞|き}いた 。 …… {探|さが}して いる が 、 {見|み}つからない 。 || They say letters that never got sent come here as leaves. …I've been looking, but I can't find it.
ko_kihei: {海|うみ} は 、 {大事|だいじ} な もの を {東|ひがし} の {洞|ほら} に {仕舞|しま}う 。 {潮|しお} が {引|ひ}かない と 、 {入|はい}れない が な 。 || The sea keeps what matters in the cave to the east. You can't get in unless the tide's out, mind.
!quest ko_kihei 0
?(comp=nao) comp: {出|だ}せなかった {手紙|てがみ} か 。 …… {探|さが}そう 。 {手紙|てがみ} を {届|とど}ける の は 、 {俺|おれ} の {仕事|しごと} だ 。 || A letter that never got sent. …Let's find it. Getting letters where they're going is my job.
?(comp=mio) comp[worry]: {何年|なんねん} も 、 {探|さが}して いた の ？ …… {見|み}つけましょう 。 || You've been looking all these years? …Let's find it.
?(comp=ren) comp: {潮|しお} の {暦|こよみ} は 、 コヨミ さん の {所|ところ} に ありました ね 。 || Koyomi has the tide calendar, doesn't she.
?(comp=suzu) comp: {出|だ}せなかった {手紙|てがみ} …… 。 {耳|みみ} の {痛|いた}い {話|はなし} ね 。 …… {探|さが}しましょう 。 || A letter never sent… That one stings a little. …Let's look.

@scene ko.kihei_wait
!faceplayer
ko_kihei: {東|ひがし} の {洞|ほら} だ 。 {潮|しお} が {引|ひ}いたら 、 {頼|たの}む 。 || The cave to the east. When the tide's out, if you would.

@scene ko.kihei_letter
# The letter on the sea cave's rock stage: a leaf in a sailor's careful hand. Who wrote it, and to whom?
!gesture pc bend
narr: {舞台|ぶたい} の よう な {岩|いわ} の {上|うえ} に 、 {葉|は} が {一枚|いちまい} 。 {濡|ぬ}れて いる が 、 {字|じ} は {消|き}えて いない 。 || On the rock like a stage, a single leaf. Wet, but the writing hasn't faded.
narr: 「ハツ へ 。 {喧嘩|けんか} を した まま {出|で}て 、 すまなかった 。 {次|つぎ} の {大潮|おおしお} に は {帰|かえ}る 。 {戸|と} を {開|あ}けて おいて くれ 。 キヘイ」 || "Hatsu. I'm sorry I left with us quarrelling. I'll be home on the next spring tide. Leave the door open for me. Kihei."
!challenge ko.kihei_read
!if var._res=0 -> later
!give ko_kihei_letter
!quest ko_kihei 1
?(comp=nao) comp: {宛名|あてな} は 「ハツ」 だけ 。 {島|しま} の {人|ひと} に {聞|き}けば 、 {分|わ}かる だろう 。 || The address is just "Hatsu". Someone on the island will know.
?(comp=mio) comp[worry]: 「{戸|と} を {開|あ}けて おいて くれ」 …… 。 ハツ さん は 、 {待|ま}って いた の かしら 。 || "Leave the door open"… I wonder if Hatsu waited.
?(comp=ren) comp: ハツ さん 。 {村|むら} で {聞|き}いて みましょう 。 || Hatsu. Let's ask in the village.
?(comp=suzu) comp: {謝|あやま}る {手紙|てがみ} ね 。 …… {出|だ}せなかった の は 、 {船|ふね} の せい だけ じゃ ない かも ね 。 || A letter saying sorry. …Maybe it wasn't only the boat that kept it from being sent.
!end
:later
narr: {葉|は} を そっと {戻|もど}す 。 {誰|だれ} が 、 {誰|だれ} に {書|か}いた の か 。 もう {一度|いちど} {読|よ}もう 。 || You put the leaf gently back. Who wrote it, and to whom? Read it again.

@scene ko.kihei_found
!faceplayer
ko_kihei: …… {見|み}つけた の か 。 {読|よ}んだ な 。 ハツ は 、 {俺|おれ} の {女房|にょうぼう} だった 。 {村|むら} で {誰|だれ} か が 、 {覚|おぼ}えて いる かも しれない 。 || …You found it. You've read it. Hatsu was my wife. Someone in the village might remember her.

@scene ko.mitsu_hatsu
# Mitsu, asked about Hatsu.
!faceplayer
ko_mitsu[surprise]: ハツ ？ …… {私|わたし} の {祖母|そぼ} です よ 。 どうして その {名前|なまえ} を ？ || Hatsu? …That was my grandmother. How do you know that name?
ko_mitsu: {祖父|そふ} は {船乗|ふなの}り で 、 {喧嘩|けんか} を して {陸|りく} へ {行|い}った きり 、 {戻|もど}らなかった そう です 。 || My grandfather was a sailor. They say he went off to the mainland after a quarrel and never came back.
ko_mitsu[smile]: {祖母|そぼ} は 、 この {宿|やど} の {戸|と} を {一度|いちど} も {閉|し}めなかった 。 「{帰|かえ}って くる {人|ひと} に 、 {帰|かえ}る {所|ところ} が ない と {困|こま}る から 」 って 。 {私|わたし} も 、 {閉|し}めた こと が ない の 。 || My grandmother never once shut this house's door. "Whoever comes back needs somewhere to come back to," she'd say. I've never shut it either.
narr: {手紙|てがみ} の {話|はなし} は 、 まだ して いない 。 {葉|は} を どう する か は 、 キヘイ と {決|き}めよう 。 || You haven't mentioned the letter. What becomes of it is for you and Kihei to decide.
!quest ko_kihei 2

@scene ko.kihei_choose
# The Sailor's Last Letter (E17): what becomes of the letter, lasting, with each end shown before it is chosen.
!faceplayer
ko_kihei: ハツ の {孫|まご} が 、 あの {宿|やど} を ？ …… {戸|と} を 、 {閉|し}めず に 。 || Hatsu's granddaughter keeps that house? …With the door still open.
ko_kihei: {手紙|てがみ} は 、 お{前|まえ} さん に {任|まか}せる 。 {俺|おれ} に は 、 もう {決|き}められない 。 || I'll leave the letter to you. I can't decide any more.
:menu
!choice
* ミツ さん に {渡|わた}す 。 || Give it to Mitsu. -> mitsu
* {風石|かぜいし} から 、 {風|かぜ} に {乗|の}せる 。 || Send it on the wind, from the Wind Stone. -> wind
* キヘイ に {返|かえ}す 。 || Give it back to Kihei. -> kept
* {今|いま} は {決|き}めない 。 || Not now. -> end
:mitsu
narr: （ミツ は {祖父|そふ} の {言葉|ことば} を {読|よ}む 。 キヘイ は {安心|あんしん} して 、 {潮|しお} と {一緒|いっしょ} に {消|き}える 。 もう {会|あ}えない 。） || (Mitsu reads her grandfather's words. Kihei, at peace, goes out with the tide. You won't meet him again.)
!choice
* {渡|わた}す 。 || Give it to her. -> mitsu_go
* やめて おく 。 || Think again. -> menu
:wind
narr: （{手紙|てがみ} は {風|かぜ} に {乗|の}って 、 ハツ の {所|ところ} へ {行|い}く 。 キヘイ は それ を {見送|みおく}って 、 {一緒|いっしょ} に {行|い}く 。 ミツ は {何|なに} も {知|し}らない まま 。） || (The letter rides the wind to Hatsu, wherever she is now. Kihei watches it go, and goes with it. Mitsu never knows.)
!choice
* {風|かぜ} に {乗|の}せる 。 || Send it. -> wind_go
* やめて おく 。 || Think again. -> menu
:kept
narr: （キヘイ は {手紙|てがみ} を {持|も}って 、 {潮|しお}だまり に {残|のこ}る 。 いつか {自分|じぶん} で {言|い}う ため に 。 ミツ は {祖父|そふ} の こと を {知|し}らない まま 。） || (Kihei keeps the letter and stays by the tide pools, to say it himself one day. Mitsu never learns of her grandfather.)
!choice
* {返|かえ}す 。 || Give it back. -> kept_go
* やめて おく 。 || Think again. -> menu
:mitsu_go
!take ko_kihei_letter
!set ko_kihei_mitsu
ko_kihei: …… {頼|たの}む 。 あの {宿|やど} で {読|よ}まれる なら 、 それ で いい 。 || …Please. If it's read in that house, that's enough.
# (he goes with his last word, gone where he stood before the narration says so: the scene waits for it; RBN-QA-093)
!refresh gone
narr: {波|なみ} が {引|ひ}く と 、 キヘイ の {足跡|あしあと} は もう なかった 。 || When the wave drew back, Kihei's footprints were gone.
!journal {宿|やど} の ミツ さん に 、 キヘイ の {葉|は} を {届|とど}ける こと に した 。 || Decided to take Kihei's leaf to Mitsu at the lodging house.
!goto close
:wind_go
!take ko_kihei_letter
!set ko_kihei_wind
narr: キヘイ と {二人|ふたり} で 、 {村|むら} の {風石|かぜいし} まで {歩|ある}いた 。 {石|いし} の {上|うえ} で 、 {葉|は} が {浮|う}く 。 キヘイ が {帽子|ぼうし} を {取|と}って 、 {見送|みおく}る 。 || You walk up to the village's Wind Stone with Kihei. On the stone the leaf lifts. Kihei takes off his cap and watches it go.
ko_kihei: …… {遅|おそ}く なった な 、 ハツ 。 || …I'm late, Hatsu.
!refresh gone
narr: {葉|は} が {見|み}えなく なる と 、 キヘイ も いなかった 。 || When the leaf was out of sight, Kihei was gone too.
!goto close
:kept_go
!take ko_kihei_letter
!set ko_kihei_kept
ko_kihei: …… {自分|じぶん} で {言|い}う べき だった 。 {今度|こんど} こそ 、 {自分|じぶん} で {言|い}う 。 {潮|しお} が {許|ゆる}す {日|ひ} に な 。 || …I should have said it myself. This time, I will. On a day the tide allows.
:close
!quest ko_kihei done
?(comp=nao) comp: {届|とど}け{方|かた} は 、 {一|ひと}つ じゃ ない 。 …… {今日|きょう} の は 、 {悪|わる}く なかった 。 || There's more than one way to deliver a letter. …Today's wasn't a bad one.
?(comp=mio) comp: …… {重|おも}い こと を {決|き}めた わ ね 。 {一人|ひとり} で {背負|せお}わない で 。 || …That was a heavy thing to decide. Don't carry it alone.
?(comp=ren) comp: {言葉|ことば} が 、 {行|い}く {所|ところ} へ {行|い}きました 。 {私|わたし} は 、 そう {思|おも}います 。 || The words went where they were going. That's what I think.
?(comp=suzu) comp: {幕|まく} の {下|お}ろし{方|かた} は 、 {役者|やくしゃ} じゃ なくて 、 {観|み}た {人|ひと} が {決|き}める もの よ 。 …… いい {幕|まく} だった わ 。 || How the curtain comes down isn't the actor's to say; it's the audience's. …It was a good one.

@scene ko.kihei_kept
!faceplayer
ko_kihei: まだ 、 {言|い}い{方|かた} を {考|かんが}えて いる 。 {海|うみ} は {気|き} が {長|なが}い 。 {俺|おれ} も 、 {長|なが}く なった 。 || I'm still working out how to say it. The sea's patient. I've grown patient too.

@scene ko.mitsu_letter
!faceplayer
narr: ミツ に 、 キヘイ の {葉|は} を {渡|わた}す 。 || You give Mitsu Kihei's leaf.
ko_mitsu[surprise]: …… これ 、 {祖父|そふ} の {字|じ} ？ 「{戸|と} を {開|あ}けて おいて くれ」 …… 。 || …Is this my grandfather's hand? "Leave the door open"…
ko_mitsu[smile]: {祖母|そぼ} の {言|い}った とおり ね 。 {開|あ}けて おいて 、 よかった 。 …… {額|がく} に {入|い}れて 、 {戸|と} の {近|ちか}く に {飾|かざ}ります 。 || Just as my grandmother said. I'm glad we kept it open. …I'll frame it and put it up by the door.

@scene ko.lodge_letter
!gesture pc read
narr: {額|がく} の {中|なか} の {葉|は} 。 「{戸|と} を {開|あ}けて おいて くれ 。」 {宿|やど} の {戸|と} は 、 {今日|きょう} も {開|あ}いて いる 。 || The leaf in its frame: "Leave the door open for me." The lodging house's door is open today too.

# ---- The Leaf That Is Your Name --------------------------------------------------------------------------------------
@scene ko.myname_start
!faceplayer
ko_tokio: {失礼|しつれい} 。 {今日|きょう} の {数|かず} の {中|なか} に 、 {名前|なまえ} の {書|か}いて ある {葉|は} が ありました 。 || Excuse me. In today's count there was a leaf with a name written on it.
ko_tokio: {葉守|はもり} の {決|き}まり で は 、 {人|ひと} の {名前|なまえ} の ある {葉|は} は 、 その {人|ひと} に {渡|わた}す こと に なって います 。 …… $name さん 。 あなた の {名前|なまえ} です ね 。 || By the keepers' rule, a leaf with a person's name goes to that person. …$name. That's your name, isn't it.
!give ko_myleaf
!quest ko_myname 0
!call ko.myname_read

@scene ko.myname_read
# The leaf with your name, by your background: who wrote it, and when.
!gesture pc read
?(bg=courier) narr: 「$name へ 。 はじめて の {配達|はいたつ} 、 よく がんばった な 。 ―― {親方|おやかた}」 || "$name. Well done on your first delivery. — the boss"
?(bg=craft) narr: 「$name さん の {作|つく}った {箸|はし} を 、 {母|はは} に {贈|おく}ります 。 {大事|だいじ} に します 。」 || "Chopsticks made by $name, a gift for my mother. We'll treasure them."
?(bg=student) narr: 「$name さん 、 また いつ でも {来|き}て ください 。 {先生|せんせい} より」 || "$name, come back any time. From your teacher"
?(bg=courier) !challenge ko.myname_courier
?(bg=craft) !challenge ko.myname_craft
?(bg=student) !challenge ko.myname_student
!if var._res=0 -> later
?(bg=courier) narr: {親方|おやかた} の {字|じ} だ 。 {初|はじ}めて の {配達|はいたつ} の {日|ひ} 、 {局|きょく} の {板|いた} に {貼|は}って あった の だろう 。 {戻|もど}る {前|まえ} に 、 {風|かぜ} が {持|も}って いった 。 {一度|いちど} も {読|よ}んだ こと が なかった 。 || The boss's handwriting. It must have been pinned to the board at the post office the day of your first delivery, and the wind took it before you got back. You never read it.
?(bg=craft) narr: {初|はじ}めて {売|う}れた {箸|はし} の 、 {包|つつ}み に {書|か}かれた {一行|いちぎょう} 。 {包|つつ}み は {開|あ}けられて 、 {捨|す}てられた の だろう 。 {書|か}いた {人|ひと} の {気持|きも}ち だけ が 、 ここ まで {来|き}た 。 || The line written on the wrapping of the first chopsticks you ever sold. The wrapping must have been opened and thrown away; only what the writer felt came this far.
?(bg=student) narr: {旅|たび} に {出|で}る {時|とき} に {置|お}いて きた {帳面|ちょうめん} の 、 {表紙|ひょうし} の {裏|うら} 。 {先生|せんせい} は 、 {読|よ}まれない と {知|し}って いて {書|か}いた の かも しれない 。 || The inside cover of the copybook you left behind when you set out. Perhaps your teacher wrote it knowing you'd never read it.
?(comp=nao) comp: {届|とど}かなかった {手紙|てがみ} が 、 {遅|おく}れて {届|とど}いた わけ だ 。 …… {返事|へんじ} 、 {書|か}く か ？ || A letter that never arrived, arriving late. …Going to write back?
?(comp=mio) comp[smile]: {誰|だれ} か の {大事|だいじ} な {言葉|ことば} の {中|なか} に 、 あなた の {名前|なまえ} が ある 。 …… {素敵|すてき} ね 。 {返事|へんじ} を {書|か}いたら ？ || Your name, inside someone's precious words. …That's lovely. Why not write back?
?(comp=ren) comp: {名前|なまえ} は 、 {呼|よ}ぶ {人|ひと} が いて こそ です 。 {返事|へんじ} を {風|かぜ} に {乗|の}せましょう 。 || A name is only a name when someone calls it. Let's send an answer on the wind.
?(comp=suzu) comp[smile]: あら 、 {昔|むかし} の お{客|きゃく} さん から の {花束|はなたば} ね 。 お{礼|れい} の {挨拶|あいさつ} 、 しない と 。 || Well, flowers from an old audience. You'll have to take a bow back.
!quest ko_myname 1
!end
:later
narr: {葉|は} を {大事|だいじ} に しまう 。 {誰|だれ} が 、 いつ {書|か}いた の か 。 {落|お}ち{着|つ}いて 、 また {読|よ}もう 。 || You put the leaf away carefully. Who wrote it, and when? Read it again when you're ready.

@scene ko.myname_reply
# At the Wind Stone: the answer on a fresh leaf. The leaf with your name stays with you.
narr: {新|あたら}しい {葉|は} を {一枚|いちまい} {拾|ひろ}って 、 {返事|へんじ} を {書|か}く 。 || You pick up a fresh leaf and write your answer.
!challenge ko.myname_reply
!if var._res=0 -> later
narr: {返事|へんじ} の {葉|は} が {浮|う}いて 、 {風|かぜ} に {乗|の}って {飛|と}んで いく 。 {名前|なまえ} の {葉|は} は 、 {手元|てもと} に {残|のこ}った 。 || The answer lifts and rides the wind away. The leaf with your name stays with you.
?(comp=nao) comp: {宛先|あてさき} の {分|わ}かる {手紙|てがみ} は 、 {必|かなら}ず {届|とど}く 。 …… {俺|おれ} の {経験|けいけん} だ と な 。 || A letter that knows where it's going always arrives. …In my experience.
?(comp=mio) comp[smile]: {届|とど}く と いい わ ね 。 || I hope it gets there.
?(comp=ren) comp[smile]: {名前|なまえ} の {葉|は} は 、 {大事|だいじ} に {持|も}って いて ください 。 {灯|ひ} と {同|おな}じ で 、 {持|も}つ {人|ひと} が いる と {消|き}えません 。 || Keep the leaf with your name safe. Like a light, it won't go out while someone carries it.
?(comp=suzu) comp: {返|かえ}し の {挨拶|あいさつ} 、 ちゃんと できた わ ね 。 …… {私|わたし} も 、 いつか しない と 。 || You took your bow properly. …I'll have to, one of these days.
!quest ko_myname done
!end
:later
narr: {書|か}きかけ の {葉|は} を しまう 。 {言葉|ことば} は 、 また {考|かんが}えよう 。 || You put the half-written leaf away. You'll think of the words again.

# ---- The Keepers' Census --------------------------------------------------------------------------------------------
@scene ko.census_ask
!faceplayer
ko_tokio: …… お{願|ねが}い が あります 。 {今日|きょう} の {籠|かご} を 、 まだ {二|ふた}つ {数|かぞ}えて いません 。 || …I have a favour to ask. Two of today's baskets haven't been counted yet.
ko_tokio: {段|だん} の アオ の {籠|かご} と 、 {浜|はま} の {籠|かご} です 。 {数|かず} を {教|おし}えて ください 。 {一枚|いちまい} ずつ 、 {正確|せいかく} に お{願|ねが}い します 。 || Ao's basket on the terraces, and the one on the shore. Tell me the numbers. One leaf at a time, exactly, please.
!quest ko_census 0

@scene ko.census_wait
!faceplayer
ko_tokio: {段|だん} の {籠|かご} と {浜|はま} の {籠|かご} 、 {数|かず} が {分|わ}かったら {教|おし}えて ください 。 {一枚|いちまい} も {落|お}とさず に 。 || Ao's on the terraces and the one on the shore: tell me when you have the numbers. Every last leaf.

@scene ko.basket_a
!gesture pc bend
!if quest.ko_census=0&!ko_cn_a -> count
narr: {葉守|はもり} の {籠|かご} 。 {字|じ} の ある {葉|は} が 、 {山盛|やまも}り に なって いる 。 || A keeper's basket, heaped with written leaves.
!end
:count
narr: アオ の {籠|かご} 。 {葉|は} を {一枚|いちまい} ずつ {出|だ}して 、 {数|かぞ}える 。 || Ao's basket. You take the leaves out one at a time and count.
!challenge ko.census_a
!if var._res=0 -> later
!set ko_cn_a
narr: {数|かず} を {手帳|てちょう} に {書|か}いた 。 || You note the number down.
!end
:later
narr: もう {一度|いちど} 、 {最初|さいしょ} から {数|かぞ}えよう 。 || Count again, from the start.

@scene ko.basket_b
!gesture pc bend
!if quest.ko_census=0&!ko_cn_b -> count
narr: {葉守|はもり} の {籠|かご} 。 {字|じ} の ある {葉|は} が 、 {山盛|やまも}り に なって いる 。 || A keeper's basket, heaped with written leaves.
!end
:count
narr: {浜|はま} の {籠|かご} は 、 {重|おも}い 。 {十枚|じゅうまい} ずつ {束|たば} に して {数|かぞ}える 。 || The shore basket is heavy. You count the leaves in bundles of ten.
!challenge ko.census_b
!if var._res=0 -> later
!set ko_cn_b
narr: {数|かず} を {手帳|てちょう} に {書|か}いた 。 || You note the number down.
!end
:later
narr: {束|たば} を {数|かぞ}え{直|なお}そう 。 || Count the bundles again.

@scene ko.census_report
!faceplayer
ko_tokio: {二|ふた}つ とも ？ …… ありがとう ございます 。 {帳面|ちょうめん} に {書|か}きます 。 || Both of them? …Thank you. I'll put them in the book.
ko_tokio[worry]: {昨日|きのう} より 、 また {多|おお}い 。 {古|ふる}い {帳面|ちょうめん} と {比|くら}べて みて ください 。 || More than yesterday, again. Compare them with the old books, will you.
!challenge ko.census_c
!if var._res=0 -> later
ko_tokio: …… そう です 。 {数|かず} は {嘘|うそ} を つきません 。 {木|き} が 、 {急|いそ}いで いる 。 || …Yes. Numbers don't lie. The tree is in a hurry.
ko_tokio[smile]: {記録|きろく} に 、 {手伝|てつだ}って くれた {人|ひと} の {名前|なまえ} も {書|か}いて おきます 。 {葉守|はもり} の {帳面|ちょうめん} に {外|そと} の {人|ひと} の {名前|なまえ} が {載|の}る の は 、 {初|はじ}めて です 。 || I'll put the names of those who helped in the record too. It's the first time anyone from outside has been written in the keepers' book.
?(comp=nao) comp: {数|かぞ}える {仕事|しごと} は 、 {地味|じみ} だ が {一番|いちばん} {大事|だいじ} だ 。 {配達|はいたつ} も {同|おな}じ だ 。 || Counting's dull work, but it matters most. Same with deliveries.
?(comp=mio) comp: {毎日|まいにち} {数|かぞ}えて きた から 、 {変|か}わった こと に {気付|きづ}けた の ね 。 || Because you've counted every day, you could tell something had changed.
?(comp=ren) comp: {灯|ひ} の {数|かず} も 、 {毎晩|まいばん} {数|かぞ}えます 。 {数|かぞ}える {人|ひと} が いる {所|ところ} は 、 {強|つよ}い です 。 || We count the lights every night too. A place with someone counting is a strong place.
?(comp=suzu) comp[smile]: {帳簿|ちょうぼ} を {付|つ}ける {人|ひと} は 、 {信用|しんよう} できる わ 。 …… {私|わたし} も {付|つ}けてる から {分|わ}かる の 。 || You can trust someone who keeps the books. …I keep them too, so I'd know.
!quest ko_census done
!set ko_census_done
!end
:later
ko_tokio: …… もう {一度|いちど} 、 {数字|すうじ} を {見|み}て ください 。 {急|いそ}がなくて いい 。 || …Look at the numbers again, please. There's no hurry.

# ---- The Tide Calendar ----------------------------------------------------------------------------------------------
@scene ko.tide_ask
!faceplayer
ko_koyomi: {暦|こよみ} の {石|いし} を {見|み}て ください 。 {周|まわ}り の {小|ちい}さな {石|いし} が 、 {四|よっ}つ {足|た}りない でしょう 。 || Look at the calendar stone. Four of the little stones round it are missing.
ko_koyomi[worry]: {葉|は} が {一番|いちばん} {多|おお}く {降|ふ}った {夜|よる} に 、 {風|かぜ} が {持|も}って いった の です 。 {月|つき} の {形|かたち} を {彫|ほ}った {石|いし} です 。 {今|いま} は 、 {大潮|おおしお} しか {分|わ}かりません 。 || The night the leaves fell thickest, the wind took them: stones with the moon's shapes cut in them. Now the calendar can only tell the spring tides.
ko_koyomi: {浜|はま} 、 {村|むら} 、 {段|だん} 、 それから この {潮|しお}だまり 。 {風|かぜ} の {通|とお}り{道|みち} に 、 {落|お}ちて いる はず です 。 || The shore, the village, the terraces, and here at the pools. They'll be lying along the wind's way.
!quest ko_tide 0

@scene ko.tide_wait
!faceplayer
ko_koyomi: {月|つき} の {石|いし} は 、 {浜|はま} 、 {村|むら} 、 {段|だん} 、 {潮|しお}だまり に {一|ひと}つ ずつ 。 {急|いそ}がなくて いい です よ 。 {潮|しお} は {毎日|まいにち} {来|き}ます から 。 || One moon stone each on the shore, in the village, on the terraces and at the pools. There's no hurry. The tide comes every day.

@scene ko.moon_1
!gesture pc bend
narr: {小|ちい}さな {平|たい}ら な {石|いし} 。 {黒|くろ}い {丸|まる} が {彫|ほ}って ある 。 {新月|しんげつ} だ 。 || A small flat stone with a black circle cut in it: the new moon.
!set ko_moon_1
!var ko_moons + 1
?(var.ko_moons>=4) narr: {四|よっ}つ {揃|そろ}った 。 コヨミ の {所|ところ} へ {持|も}って {行|い}こう 。 || That's all four. Take them to Koyomi.
@scene ko.moon_2
!gesture pc bend
narr: {小|ちい}さな {平|たい}ら な {石|いし} 。 {細|ほそ}い {弓|ゆみ} の {形|かたち} が {彫|ほ}って ある 。 {三日月|みかづき} だ 。 || A small flat stone with a thin bow cut in it: the crescent moon.
!set ko_moon_2
!var ko_moons + 1
?(var.ko_moons>=4) narr: {四|よっ}つ {揃|そろ}った 。 コヨミ の {所|ところ} へ {持|も}って {行|い}こう 。 || That's all four. Take them to Koyomi.
@scene ko.moon_3
!gesture pc bend
narr: {小|ちい}さな {平|たい}ら な {石|いし} 。 {丸|まる} の {半分|はんぶん} が {白|しろ}い 。 {半月|はんげつ} だ 。 || A small flat stone, half its circle white: the half moon.
!set ko_moon_3
!var ko_moons + 1
?(var.ko_moons>=4) narr: {四|よっ}つ {揃|そろ}った 。 コヨミ の {所|ところ} へ {持|も}って {行|い}こう 。 || That's all four. Take them to Koyomi.
@scene ko.moon_4
!gesture pc bend
narr: {小|ちい}さな {平|たい}ら な {石|いし} 。 {真|ま}っ{白|しろ} な {丸|まる} 。 {満月|まんげつ} だ 。 || A small flat stone with a pure white circle: the full moon.
!set ko_moon_4
!var ko_moons + 1
?(var.ko_moons>=4) narr: {四|よっ}つ {揃|そろ}った 。 コヨミ の {所|ところ} へ {持|も}って {行|い}こう 。 || That's all four. Take them to Koyomi.

@scene ko.tide_back
!faceplayer
ko_koyomi[smile]: {四|よっ}つ とも ！ では 、 {暦|こよみ} の {石|いし} の {周|まわ}り に {並|なら}べて ください 。 {月|つき} の {順番|じゅんばん} に 。 || All four! Then set them round the calendar stone, in the moon's order.
!quest ko_tide 1

@scene ko.tide_ring
# At the calendar stone: the moon stones set in order, then the next spring tide read from the whole ring.
!if quest.ko_tide=2 -> next
narr: {石|いし} の {周|まわ}り に 、 {四|よっ}つ の {窪|くぼ}み 。 {月|つき} の {順番|じゅんばん} に {並|なら}べよう 。 || Four hollows round the stone. Set the moon stones in order.
!challenge ko.tide_ring
!if var._res=0 -> later
narr: {最後|さいご} の {石|いし} を {入|い}れる と 、 {円|えん} が {一周|いっしゅう} {繋|つな}がった 。 || With the last stone in, the circle runs all the way round.
!quest ko_tide 2
:next
!challenge ko.tide_next
!if var._res=0 -> later2
!call ko.tide_night
!end
:later
narr: {順番|じゅんばん} が {違|ちが}う よう だ 。 {月|つき} は 、 {暗|くら}い {夜|よる} から {少|すこ}し ずつ {太|ふと}る 。 || The order seems wrong. The moon fills out little by little from the dark night.
!end
:later2
narr: {円|えん} は {揃|そろ}って いる 。 {次|つぎ} の {大潮|おおしお} は 、 また {読|よ}もう 。 || The ring is whole. Read the next spring tide again later.

@scene ko.tide_night
# The Tide Calendar's end: the spring-tide night on the point, when the leaves rise on the night wind, in its pictures
# (43k_seq_ko.js, RBN-QA-089); the world stays as it is.
!sequence ko.tide_night begin
!shot point
narr: {大潮|おおしお} の {夜|よる} 、 コヨミ と {岬|みさき} に {立|た}つ 。 {満月|まんげつ} の {下|した} で 、 {潮|しお} が {遠|とお}く まで {引|ひ}いて いく 。 || On the night of the spring tide you stand on the point with Koyomi. Under the full moon, the tide draws far out.
!shot rise
narr: {風|かぜ} が {変|か}わった 。 {浜|はま} の {葉|は} が 、 {一枚|いちまい} 、 また {一枚|いちまい} と {浮|う}き{上|あ}がって 、 {月|つき} の {方|ほう} へ {昇|のぼ}って いく 。 || The wind changes. One by one, the leaves on the beach lift and rise towards the moon.
ko_koyomi: {大潮|おおしお} の {夜|よる} に だけ 、 {帰|かえ}る {先|さき} の {分|わ}かった {葉|は} が 、 {自分|じぶん} で {飛|と}んで いく の です 。 {祖母|そぼ} から {聞|き}いた {話|はなし} です けど 、 {見|み}た の は {初|はじ}めて 。 || Only on a spring-tide night, the leaves that know their way home fly off by themselves. My grandmother told me so, but this is the first time I've seen it.
?(comp=nao) comp: …… {全部|ぜんぶ} 、 {宛先|あてさき} の ある {手紙|てがみ} か 。 {壮観|そうかん} だ な 。 || …Every one of them a letter with somewhere to go. Quite a sight.
?(comp=mio) comp[smile]: {綺麗|きれい} …… 。 {薬|くすり} の {瓶|びん} に {詰|つ}めて おきたい くらい 。 || Beautiful… I'd like to keep it in a bottle.
?(comp=ren) comp: {灯籠|とうろう} の {灯|ひ} が 、 {空|そら} に {上|あ}がって いく みたい です 。 || Like lantern lights going up into the sky.
?(comp=suzu) comp: …… {紙吹雪|かみふぶき} の {逆|ぎゃく} ね 。 {降|ふ}る の じゃ なくて 、 {昇|のぼ}って いく 。 {幕切|まくぎ}れ に は 、 もったいない くらい 。 || …Confetti in reverse. Not falling, rising. Almost too good for a final curtain.
!sequence ko.tide_night end
!quest ko_tide done
!set ko_tide_night
`);
