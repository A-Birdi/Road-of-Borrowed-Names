/* Chapter 6 ending: the descent, the denouement walk through the changed
 * towns, the companion-specific endings, credits, and the hand-over to the
 * Unwritten Atlas in Reedwake's Lantern Hall. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
@scene sa.camp_descent
narr: {小屋|こや} の {前|まえ} で 、 オヨネ が {待|ま}って いた 。 || Oyone is waiting outside the hut.
sa_oyone: {音|おと} が {戻|もど}って きた ね 。 {朝|あさ} から {鳥|とり} が うるさくて 、 {眠|ねむ}れ や しない 。 || The sound's come back. The birds have been at it since dawn; a body can't sleep.
?(end_kasane_trial) sa_oyone: …… {痩|や}せた ね 、 カサネ 。 {三十年|さんじゅうねん} {前|まえ} も {痩|や}せて た けど 。 || …You've got thin, Kasane. You were thin thirty years ago, too.
?(end_kasane_trial) kasane[shy]: オヨネさん 。 …… お{茶|ちゃ} を 、 {一杯|いっぱい} だけ 。 || Oyone. …Just one cup of tea, please.
?(end_kasane_trial) sa_oyone[smile]: {一杯|いっぱい} で {済|す}む もん かい 。 {下|くだ}る {人|ひと} は 、 お{茶|ちゃ} を {飲|の}んで から 。 {決|き}まり だ よ 。 || One cup, she says. Those coming down have tea first. That's the rule.
?(end_kasane_keeper) sa_oyone: カサネ は {上|うえ} に {残|のこ}る の かい 。 なら 、 {時々|ときどき} {飯|めし} を {担|かつ}いで {上|あ}がる よ 。 {荷|に} を {担|かつ}ぐ の は 、 {慣|な}れた もん さ 。 || Kasane's staying up there? Then I'll carry some food up now and then. Hauling loads up that slope is nothing new to me.
?(end_archive_library) sa_oyone: {図書館|としょかん} に なる なら 、 この {小屋|こや} も {忙|いそが}しく なる ね 。 {読|よ}み に {登|のぼ}る {人|ひと} の {宿|やど} だ 。 {泣|な}き ながら {登|のぼ}る {人|ひと} より 、 よっぽど いい 。 || If it's to be a library, this hut'll be busy. An inn for people climbing up to read. Much better than people climbing up in tears.
?(end_archive_closed) sa_oyone: {閉|と}じた の かい 。 …… それ で いい 。 {灯|ひ} は 、 {毎朝|まいあさ} {書|か}き{直|なお}す よ 。 {誰|だれ}か が {道|みち} に {迷|まよ}わない よう に 。 || Closed, is it. …That's all right. I'll still rewrite the lamp every morning. So nobody loses their way.
!if !seen.sa.isamu_first -> after_isamu
?(quest.sa_isamu=done) sa_isamu[smile]: {聞|き}こえる か ？ …… いや 、 {聞|き}こえる の は {俺|おれ} だけ か 。 {頭|あたま} の {中|なか} で 、 {朝|あさ} から ずっと {笑|わら}って やがる 。 || Can you hear it? …No, only I can. She's been laughing in my head all morning.
?(!quest.sa_isamu=done) sa_isamu: {夜中|よなか} に 、 {急|きゅう} に {思|おも}い{出|だ}した 。 あいつ の {笑|わら}い{声|ごえ} 。 {上|うえ} の {誰|だれ}か が 、 やっと {手紙|てがみ} を {読|よ}んで くれた らしい 。 || In the middle of the night it came back to me — her laugh. Seems somebody up there finally read my letter.
?(!quest.sa_isamu=done) sa_isamu[smile]: {飛|と}び{起|お}きて 、 {泣|な}いて 、 それから …… {笑|わら}っちまった 。 {沸|わ}く {前|まえ} の やかん みたい に 。 || I sat bolt upright, cried, and then… I laughed. Like a kettle just before it boils.
sa_isamu: {今日|きょう} 、 {下|くだ}る よ 。 {潮硝子|しおがらす} で 、 {網|あみ} が {待|ま}って る 。 || I'm going down today. The nets are waiting in Saltglass.
!if quest.sa_isamu=active -> finish_isamu
!goto after_isamu
:finish_isamu
!quest sa_isamu done
:after_isamu
?(comp=nao) nao: {往復|おうふく} {完了|かんりょう} だ 。 {宿帳|やどちょう} の {下|くだ}り の {欄|らん} 、 {埋|う}めて いこう 。 || Round trip complete. Let's fill in the column for coming down.
?(comp=mio) mio: オヨネ さん 、 {腰|こし} に {効|き}く {膏薬|こうやく} 、 {置|お}いて いきます 。 {担|かつ}ぐ の は 、 ほどほど に 。 …… {言|い}って も {聞|き}かない でしょう けど 。 || Oyone, I'll leave you a plaster for your back. Go easy on the hauling. …Not that you'll listen.
?(comp=ren) ren: {最後|さいご} の {灯|ひ} 、 {今日|きょう} は わたし に {書|か}かせて ください 。 {師匠|ししょう} の {払|はら}い で 。 || Let me write the last lamp's name today. With my teacher's sweep.
?(comp=suzu) suzu: {宿代|やどだい} 、 {払|はら}って いく ね 。 …… {倍|ばい} で 。 {誰|だれ}か の {真似|まね} だ よ 。 || I'll settle the bill. …Double. I'm copying someone.
narr: {宿帳|やどちょう} の {下|くだ}り の {欄|らん} に 、 {今日|きょう} の {日付|ひづけ} が {入|はい}った 。 || Today's date goes into the register's column for coming down.
!if seen.sa.hut_register -> signed
!end
:signed
narr: ウシオ の {名前|なまえ} の {横|よこ} に も 、 オヨネ が {何|なに}か {書|か}き{足|た}して いる 。 「 {下|くだ}らず 。 {上|うえ} で 、 {最後|さいご} まで {反対|はんたい} 。 」 || Beside Ushio's name, Oyone has added something too: "Did not come down. Stayed up there, disagreeing to the end."

@scene sa.oyone_descent
sa_oyone: {下|くだ}る の かい 。 お{茶|ちゃ} は {飲|の}んだ ね 。 よし 。 {気|き} を つけて {行|い}き な 。 || Heading down? You've had your tea? Good. Mind how you go.
!call sa.oyone_inn

@scene sa.kasane_walk
kasane: {灯落|ひおち} まで 、 {自分|じぶん} の {足|あし} で {歩|ある}きます 。 {三十年|さんじゅうねん} ぶり の {坂|さか} です 。 …… {膝|ひざ} が {笑|わら}って います 。 || I'll walk to Lanternfall on my own feet. The first time down this slope in thirty years. …My knees are shaking.
?(comp=mio) mio: {膝|ひざ} が {笑|わら}える なら 、 {大丈夫|だいじょうぶ} 。 {本人|ほんにん} も 、 {少|すこ}し は {笑|わら}って ください 。 || If your knees can laugh, you'll be fine. You could try laughing a little yourself.

@scene sa.epilogue
!set sa_epilogue
!music ending
narr: {坂|さか} を {下|くだ}りきる と 、 {灯落|ひおち} の {鐘|かね} が {鳴|な}って いた 。 {朝|あさ} を {知|し}らせる 、 ただ の {鐘|かね} だ 。 || At the foot of the slope, Lanternfall's bell is ringing. Just the ordinary bell that marks the morning.
!hook sa_goto lanternfall
!call sa.epi_lf
!hook sa_goto snowbell
!call sa.epi_sb
!hook sa_goto cinder
!call sa.epi_co
!hook sa_goto saltglass
!call sa.epi_sg
!hook sa_goto reedwake
!call sa.epi_rw
!call sa.end_comp
!music credits
!credits
!postgame
!set post ch6_done sa_done
!quest sa_main done
!warp rw.hall 5 5 up
!music reedwake_night
!autosave
narr: {灯|あか}り{堂|どう} の {灯|ひ} は 、 {静|しず}か に {燃|も}えて いる 。 {名前|なまえ} は 、 {全部|ぜんぶ} {読|よ}める 。 || The lamps in the Lantern Hall burn quietly. Every name can be read.
!journal ツル が {灯|あか}り{堂|どう} で {待|ま}って いる 。 「 {書|か}かれて いない {地図|ちず} 」 の こと を {聞|き}いて みよう 。 || Tsuru is waiting in the Lantern Hall. Ask her about the Unwritten Atlas.
!toast {物語|ものがたり} は {終|お}わった 。 {道|みち} は 、 まだ {続|つづ}く 。 || The story is over. The roads go on — and every town is yours to revisit.
!hook sa_after rw.atlas_intro

@scene sa.epi_lf
narr: {灯落|ひおち} の {大通|おおどお}り は 、 うるさかった 。 || Lanternfall's main avenue is noisy.
narr: {魚|さかな} の {値段|ねだん} で {揉|も}める {声|こえ} 。 「 いや 、 それ は {違|ちが}う 」 と {言|い}う {声|こえ} 。 {誰|だれ} も が 、 {少|すこ}し {嬉|うれ}し そう に {反対|はんたい} して いる 。 || Haggling over fish. Someone saying "No, that's wrong." Everyone is disagreeing, and looking a little pleased about it.
?(end_mem_return) narr: {昨夜|ゆうべ} は 、 {町|まち} じゅう で {泣|な}き{声|ごえ} が した と いう 。 {朝|あさ} に は 、 {誰|だれ} も が {目|め} を {赤|あか}く して 、 それ でも {店|みせ} を {開|あ}けて いた 。 || Last night, they say, there was weeping all over town. By morning everyone's eyes were red — and they opened their shops anyway.
?(end_mem_choose) narr: {山|やま} へ の {坂|さか} を 、 {提灯|ちょうちん} を {持|も}った {人|ひと} が {何人|なんにん} も {登|のぼ}って いく 。 {途中|とちゅう} で {引|ひ}き{返|かえ}す {人|ひと} も いる 。 どちら も 、 {止|と}める {人|ひと} は いない 。 || Several people with lanterns are climbing the road to the mountain. Some turn back halfway. No one stops either kind.
?(end_kasane_trial) narr: カサネ は {広場|ひろば} の {真|ま}ん{中|なか} で {足|あし} を {止|と}めた 。 {人|ひと} が 、 {少|すこ}し ずつ {集|あつ}まって くる 。 || Kasane stops in the middle of the square. People gather, a few at a time.
?(end_kasane_trial) lf_yae: …… カサネ 。 {三十年|さんじゅうねん} の {遅刻|ちこく} です よ 。 || …Kasane. You're thirty years late.
?(end_kasane_trial) kasane: はい 。 {申|もう}し{訳|わけ} ありません 。 || Yes. I'm sorry.
?(end_kasane_trial) lf_yae: {謝|あやま}る の は 、 {議会|ぎかい} で どうぞ 。 {三日|みっか} は かかる でしょう ね 。 {誰|だれ} も {賛成|さんせい} しない から 。 …… {素晴|すば}らしい こと です 。 || You may apologise in council. It'll take three days, I expect, since nobody will agree with anybody. …Marvellous.
?(end_kasane_keeper) lf_yae: カサネ は {山|やま} に {残|のこ}った の ね 。 {議会|ぎかい} は {大|おお}もめ でした よ 。 「 {甘|あま}い 」 「 それ で いい 」 「 {手紙|てがみ} を {書|か}け 」 。 {結局|けっきょく} 、 {全員|ぜんいん} {毎週|まいしゅう} {手紙|てがみ} を {書|か}く こと に なりました 。 || So Kasane stayed up the mountain. The council was in uproar. "Too soft!" "Quite right!" "Write to them!" In the end, everyone's to write every week.
sa_tae: …… あんた が 、 {上|うえ} まで {行|い}った {旅|たび} の {人|ひと} かい 。 || …You're the traveller who went all the way up there, are you.
sa_tae: {昨夜|ゆうべ} 、 {鐘|かね} の {音|おと} を {思|おも}い{出|だ}した よ 。 {三十年前|さんじゅうねんまえ} の 。 {返|かえ}して くれ って {頼|たの}んで 、 {五年|ごねん} {待|ま}った 。 || Last night I remembered the bell. From thirty years ago. I'd asked for it back, and waited five years.
sa_tae: {誰|だれ} が {鳴|な}らした の か 、 {結局|けっきょく} {分|わ}からず じまい さ 。 || Never did find out who rang it.
pc: {鳴|な}らした の は 、 トウヤ と いう {人|ひと} です 。 {使|つか}い の 。 {鍵|かぎ} を {持|も}って 、 {自分|じぶん} で {開|あ}けた 。 || The one who rang it was named Tōya. The messenger. He had the key, and he opened it himself.
sa_tae[surprise]: …… そう かい 。 あの {子|こ} だった の かい 。 || …Was it. So it was that boy.
?(end_kasane_trial) narr: カサネ は {何|なに} も {言|い}わなかった 。 ただ 、 {深|ふか}く {頭|あたま} を {下|さ}げた 。 タエ は 、 {長|なが}い こと それ を {見|み}て いた 。 || Kasane says nothing; only bows, very low. Tae watches for a long time.
?(end_kasane_trial) sa_tae: {謝|あやま}って {済|す}む こと じゃ ない よ 。 …… でも 、 {聞|き}いた 。 {聞|き}いた から ね 。 || Sorry doesn't settle it. …But I've heard you. I've heard you.
akari: $name さん ！ …… {父|ちち} と 、 {手紙|てがみ} が やり{取|と}り できる よう に なりました 。 {宛先|あてさき} が 、 ちゃんと {読|よ}める {字|じ} で {届|とど}く んです 。 || $name! …My father and I can write to each other now. The addresses arrive in writing anyone can read.
?(sb_hoshino_goes) akari[smile]: {父|ちち} は 、 {今|いま} こっち に いる んです 。 {灯|あか}り を {人|ひと} に {頼|たの}んで 、 {山|やま} を {下|お}りて きて 。 {毎晩|まいばん} 、 {窓|まど} から {雪鈴|ゆきすず} の {方|ほう} を {見|み}て います 。 || My father's here now. He left the lamp in someone's care and came down the mountain. Every night he looks out of the window towards Snowbell.
?(comp=nao) umi: …… {返事|へんじ} は 、 まだ {書|か}いて ない 。 {書|か}く か どう か も 、 {決|き}めて ない 。 || …I haven't written back. I haven't decided whether I will.
?(comp=nao) umi: {決|き}めなくて いい って 、 あんた {言|い}った よ ね 。 || You said I didn't have to decide.
?(comp=nao) nao: {言|い}った 。 {今|いま} も そう {思|おも}う 。 {手紙|てがみ} は {届|とど}いた 。 {配達人|はいたつにん} の {仕事|しごと} は 、 そこ まで だ 。 || I did. I still think so. The letter arrived. That's where a courier's job ends.
?(comp=mio) lf_yae: ミオ さん 、 {町|まち} に {残|のこ}って {薬屋|くすりや} を {開|ひら}いて くれない かしら 。 {皆|みな} 、 {頼|たよ}り に して いる の よ 。 || Mio, won't you stay and open an apothecary here? Everyone's come to rely on you.
?(comp=mio) mio: ごめんなさい 。 お{断|ことわ}り します 。 {葦|あし}ノ{瀬|せ} に 、 {店|みせ} が あります ので 。 || I'm sorry. I'll have to say no. I have a shop in Reedwake.
?(comp=mio) mio[laugh]: …… {聞|き}いた ？ {今|いま} の 。 {断|ことわ}った 。 ちゃんと 、 {丁寧|ていねい} に 。 || …Did you hear that? I said no. Properly, and politely.
?(comp=ren) ren: {灯落|ひおち} の {灯籠|とうろう} 、 {名前|なまえ} が {全部|ぜんぶ} {戻|もど}って います 。 …… {一本|いっぽん} だけ 、 {字|じ} が {下手|へた} です 。 {新|あたら}しい {字|じ} だ 。 {誰|だれ}か が 、 {練習|れんしゅう} して いる 。 || Every lantern in Lanternfall has its name back. …Just one has clumsy writing. New writing. Someone's practising.
?(comp=suzu) suzu: {広場|ひろば} で {揉|も}めてる {声|こえ} 、 {最高|さいこう} の {音楽|おんがく} だ ね 。 {入場料|にゅうじょうりょう} を {取|と}りたい くらい 。 || The squabbling in the square — finest music there is. I could charge admission.

@scene sa.epi_sb
narr: {数日後|すうじつご} 、 {雪鈴|ゆきすず} 。 || A few days later: Snowbell.
?(!sb_hoshino_goes) narr: {観測所|かんそくじょ} の {灯|あか}り が 、 {昼間|ひるま} なのに {点|つ}いて いる 。 || The observatory lamp is lit, though it's broad daylight.
?(!sb_hoshino_goes) hoshino: {消|け}し{忘|わす}れ じゃ ない よ 。 {娘|むすめ} が 、 {春|はる} に {帰|かえ}る と {書|か}いて きた ん だ 。 || I didn't forget to put it out. My daughter's written that she's coming home in spring.
?(!sb_hoshino_goes) hoshino[smile]: {春|はる} まで は {長|なが}い が な 。 {長|なが}い こと {待|ま}った ん だ 。 {少|すこ}し {早|はや}く {点|つ}けて も 、 {罰|ばち} は {当|あ}たる まい 。 || Spring's a long way off, mind. But I've waited a long time. Lighting it a little early won't bring bad luck.
?(sb_hoshino_goes) narr: {観測所|かんそくじょ} の {灯|あか}り を 、 カンタ が ともして いる 。 ホシノ は {灯落|ひおち} へ {下|くだ}った 。 それ でも {灯|あか}り は 、 {一晩|ひとばん} も {欠|か}けて いない 。 || Kanta is lighting the observatory lamp. Hoshino has gone down to Lanternfall; even so, not a single night has been missed.
?(sb_hoshino_goes) kanta: ホシノ さん から {手紙|てがみ} が {来|く}る んだ 。 「 {灯|あか}り は {点|つ}いて いる か 」 って 、 {毎回|まいかい} 。 {点|つ}いて る よ 。 {毎回|まいかい} そう {返事|へんじ} する 。 || Letters come from Hoshino. "Is the lamp lit?" every time. It is. That's what I write back, every time.
narr: {星図|せいず} に は 、 まだ {書庫|しょこ} の {場所|ばしょ} が {書|か}いて ある 。 でも もう 、 {動|うご}かない {光|ひかり} は ない 。 {山|やま} の {上|うえ} の {灯|ひ} は 、 {朝|あさ} に なる と ちゃんと {消|き}える 。 || The star charts still mark where the Archive is. But the light that never moved is gone. The lamp on the mountain goes out properly now, when morning comes.
?(end_archive_library) narr: {書庫|しょこ} が {図書館|としょかん} に なった と {聞|き}いて 、 {観測所|かんそくじょ} の {古|ふる}い {日誌|にっし} を {写|うつ}して {送|おく}る {話|はなし} が 、 {村|むら} で {出|で}て いる 。 {星|ほし} の {名前|なまえ} も 、 {誰|だれ}か が {守|まも}って おかない と 。 || Word that the Archive is now a library has the village talking about copying the observatory's old logs and sending them up. Someone ought to keep the names of the stars.
?(end_archive_closed) narr: {書庫|しょこ} が {閉|と}じた と {聞|き}いて 、 {村|むら} の {人|ひと} は {肩|かた} を すくめた 。 {雪鈴|ゆきすず} の {記録|きろく} は 、 {昔|むかし} から {鐘|かね} と {日誌|にっし} が {覚|おぼ}えて いる 。 || Hearing the Archive has closed, the villagers shrug. Snowbell's records have always been kept by its bell and its logbook.
?(comp=ren&sa_ren_took) ren: {星図|せいず} の {似顔絵|にがおえ} 、 {似|に}て いません でした ね 。 {眉|まゆ} が {細|ほそ}すぎる 。 {描|か}き{足|た}して いい か 、 ホシノ さん に {聞|き}いて みます 。 || The sketch on the star chart doesn't really look like my teacher, you know. The eyebrows are far too thin. I'll ask Hoshino whether I may add to them.
?(comp=ren&!sa_ren_took) ren: {似顔絵|にがおえ} は 、 {似顔絵|にがおえ} の まま で いい 。 {余白|よはく} の {言葉|ことば} は 、 {全部|ぜんぶ} {合|あ}って いました から 。 || The sketch can stay a sketch. The words in the margin were all correct.
?(comp=nao) nao: {雪|ゆき} の {宿|やど} 、 また {泊|と}まりたい な 。 …… {今度|こんど} は 、 {吹雪|ふぶき} なし で 。 || I'd like to stay at the snowbound inn again. …Without the blizzard, this time.
?(comp=mio) mio: {雪|ゆき} の {夜|よる} に {話|はな}した こと 、 {覚|おぼ}えてる ？ …… わたし は {全部|ぜんぶ} {覚|おぼ}えてる 。 {預|あず}け ない から ね 。 || Remember what we talked about that snowy night? …I remember all of it. And I'm not setting any of it down.
?(comp=suzu) suzu: {雪鈴|ゆきすず} の {鐘|かね} 、 {音|おと} が {戻|もど}った ね 。 {迷子|まいご} の {合図|あいず} を {鳴|な}らさない で {済|す}む よう に 、 {祈|いの}ろう 。 || Snowbell's bell has its voice back. Here's hoping no one ever needs to ring the lost-traveller signal.

@scene sa.epi_co
narr: {灰実|はいみ}の{里|さと} 。 {防火帯|ぼうかたい} の {草|くさ} を {刈|か}る {音|おと} が 、 {段々畑|だんだんばたけ} に {響|ひび}いて いる 。 || Cinder Orchard. The sound of scythes clearing the firebreaks rings across the terraces.
?(co_bell_done) narr: {夕方|ゆうがた} に なる と 、 ゴロウ の {鐘|かね} が {鳴|な}る 。 {今|いま} は 、 {毎日|まいにち} 。 || At dusk, Gorō's bell rings. Every day, now.
hiro: {祭|まつ}り の {席|せき} 、 {今年|ことし} も {一|ひと}つ {空|あ}けて ある 。 || I've kept a seat empty at the festival again this year.
?(co_hiro_seat_named) hiro: {席|せき} に は 、 {母|はは} の {名前|なまえ} を {彫|ほ}った 。 {待|ま}つ ため じゃ ない 。 {覚|おぼ}えて おく ため だ 。 {違|ちが}い が {分|わ}かる か ？ || I carved my mother's name into it. Not to wait. To remember. Do you see the difference?
?(!co_hiro_seat_named) hiro: でも 、 {待|ま}つ ため じゃ ない 。 {覚|おぼ}えて おく ため だ 。 {違|ちが}い が {分|わ}かる か ？ || But not to wait. To remember. Do you see the difference?
?(comp=suzu) suzu[sad]: …… {分|わ}かる よ 。 {分|わ}かる 。 || …I do. I do.
?(comp=suzu) hiro: スズ 。 {座|すわ}って いけ よ 。 {空|あ}いてる {席|せき} の {隣|となり} に 。 {母|かあ}さん の {話|はなし} 、 {本当|ほんとう} の ほう を 、 もう {一度|いちど} {聞|き}かせて くれ 。 || Suzu. Sit down — next to the empty seat. Tell me about my mother again. The true version.
?(comp=suzu) suzu[smile]: …… うん 。 {今度|こんど} は 、 {最後|さいご} まで ちゃんと {話|はな}す 。 {笑|わら}える ところ も 、 {泣|な}ける ところ も 。 || …Okay. This time I'll tell it right to the end. The funny parts and the sad ones.
?(!comp=suzu) narr: {広場|ひろば} の {隅|すみ} で 、 {旅芸人|たびげいにん} の スズ が {子|こ}ども たち に {芝居|しばい} を {見|み}せて いる 。 {火事|かじ} の {話|はなし} だ 。 {最後|さいご} は 、 {皆|みんな} で {防火帯|ぼうかたい} を {作|つく}る 。 || In a corner of the square, Suzu the travelling performer is putting on a play for the children. It's about the fire. At the end, everyone builds a firebreak together.
?(!comp=suzu) suzu[smile]: あ 、 $name ！ {見|み}て いって よ 。 {今日|きょう} の {芝居|しばい} に は 、 {嘘|うそ} が {一|ひと}つ も ない んだ 。 {珍|めずら}しい でしょ 。 || Oh, $name! Stay and watch. There isn't a single lie in today's play. Rare, right?
?(comp=nao) nao: {草|くさ} を {刈|か}る {音|おと} って 、 {落|お}ち{着|つ}く な 。 {誰|だれ}か が {明日|あした} の こと を {考|かんが}えてる {音|おと} だ 。 || The sound of scything is soothing. It's the sound of people thinking about tomorrow.
?(comp=mio) mio: {火傷|やけど} の {薬|くすり} 、 {置|お}いて いこう 。 {使|つか}わない で {済|す}む の が 、 {一番|いちばん} だ けど 。 || Let's leave some burn ointment. Best if it never gets used.
?(comp=ren) ren: {防火帯|ぼうかたい} の {端|はし} に 、 {新|あたら}しい {灯籠|とうろう} が {立|た}って います 。 {名前|なまえ} は 「 {火|ひ} の {後|あと} 」 。 …… いい {名前|なまえ} だ 。 || There's a new lantern post at the edge of the firebreak. Its name is "After the Fire". …A good name.

@scene sa.epi_sg
narr: {潮硝子|しおがらす} の {港|みなと} 。 {積|つ}み{荷|に} の ラベル は 、 {全部|ぜんぶ} {読|よ}める 。 || Saltglass harbour. Every cargo label is legible.
wataru: {帳簿|ちょうぼ} は 、 {全部|ぜんぶ} {書|か}き{直|なお}しました 。 {正|ただ}しい {数字|すうじ} で 。 {借金|しゃっきん} は …… {正|ただ}しく {増|ふ}えました 。 || I've rewritten all the ledgers. With the right numbers. The debts have… correctly gone up.
wataru[smile]: でも 、 {夜|よる} は {眠|ねむ}れる よう に なりました 。 {沈|しず}んだ {書庫|しょこ} も 、 {干潮|かんちょう} の {時|とき} は ただ の {岩場|いわば} です 。 || But I sleep at night now. And the Drowned Archive is just rocks at low tide.
?(quest.sa_isamu=done) sa_isamu: {網|あみ} を {繕|つくろ}い ながら 、 {時々|ときどき} {笑|わら}っちまう 。 {客|きゃく} に {変|へん} な {顔|かお} を される よ 。 || Sometimes I laugh while I'm mending nets. The customers give me funny looks.
?(quest.sa_isamu=done) sa_isamu[smile]: あいつ の {笑|わら}い{方|かた} が 、 {移|うつ}っちまった らしい 。 {沸|わ}く {前|まえ} の やかん だ 。 || Seems her laugh has rubbed off on me. The kettle, just before it boils.
?(!comp=nao) nao[smirk]: よう 、 $name 。 {灯落|ひおち} {行|い}き の {手紙|てがみ} が {山|やま} ほど ある 。 {急|きゅう} に 、 みんな {言|い}いたい こと が {増|ふ}えた らしい 。 || Hey, $name. I've got a mountain of letters for Lanternfall. Everyone suddenly has a lot more to say, apparently.
?(!comp=nao) nao: …… {宛名|あてな} 、 {全部|ぜんぶ} {読|よ}める 。 いい {気分|きぶん} だ 。 || …Every address is legible. Feels good.
?(comp=nao) nao: {港|みなと} の {郵便受|ゆうびんう}け 、 {満杯|まんぱい} だ 。 …… {手伝|てつだ}って く か ？ {冗談|じょうだん} だ よ 。 {半分|はんぶん} は 。 || The harbour mailboxes are stuffed. …Want to help? Joking. Half joking.
?(comp=mio) mio: {潮|しお} の {匂|にお}い 。 …… {帰|かえ}って きた 、 って {感|かん}じ が する 。 {葦|あし}ノ{瀬|せ} まで 、 あと {少|すこ}し 。 || The smell of the sea. …It feels like coming home. Not far to Reedwake now.
?(comp=ren) ren: {港|みなと} の {灯台|とうだい} の {名前|なまえ} 、 {書|か}き{直|なお}さなくて も {消|き}えて いません 。 {良|よ}い {字|じ} で {書|か}いて ある 。 || The lighthouse's name hasn't faded, even without rewriting. It's written in a good hand.
?(comp=suzu) suzu: ワタル の {帳簿|ちょうぼ} 、 {後|あと} で {見|み}せて もらおう 。 {正直|しょうじき} な {帳簿|ちょうぼ} は 、 {読|よ}んで いて {気持|きも}ち が いい から 。 || I'll ask to see Wataru's ledgers later. An honest ledger is a pleasure to read.

@scene sa.epi_rw
narr: {葦|あし}ノ{瀬|せ} 。 {橋|はし} は 、 ちゃんと {向|む}こう {岸|ぎし} に {届|とど}いて いる 。 || Reedwake. The bridge reaches the far bank, as a bridge should.
hana[smile]: {帰|かえ}って きた ！ ほら 、 お{茶|ちゃ} 。 …… {三|みっ}つ いれた の 。 {間違|まちが}えた わけ じゃ ない よ 。 || You're back! Here — tea. …I poured three. Not by mistake.
koji: {一|ひと}つ は {俺|おれ} の だ 。 {一|ひと}つ は ハナ の 。 {一|ひと}つ は …… {言|い}わなくて も {分|わ}かる だろ 。 || One's mine. One's Hana's. And one's… well, you know whose.
?(!comp=mio) narr: {薬屋|くすりや} の {前|まえ} で 、 ミオ が {客|きゃく} に {頭|あたま} を {下|さ}げて いる 。 || Outside the apothecary, Mio is bowing to a customer.
?(!comp=mio) mio: {今日|きょう} は お{休|やす}み です 。 …… いえ 、 {本当|ほんとう} に お{休|やす}み です 。 {断|ことわ}る {練習|れんしゅう} 、 {続|つづ}けて いる んです 。 || We're closed today. …No, really, closed. I'm keeping up my practice at saying no.
?(!comp=ren) !call sa.epi_ren_home
tsuru: {帰|かえ}った かい 。 {顔|かお} を {見|み}せて ごらん 。 …… うん 。 {道|みち} の {顔|かお} に なった ね 。 || You're back, are you. Let me see your face. …Mm. You've got the look of the road about you now.
tsuru: {灯|あか}り{堂|どう} に おいで 。 {見|み}せたい もの が ある 。 {急|いそ}がなくて いい 。 {先|さき} に 、 {連|つ}れ と {話|はな}して おいで 。 || Come by the Lantern Hall. There's something I want to show you. No hurry. Talk with your companion first.

@scene sa.epi_ren_home
narr: {灯|あか}り{堂|どう} の {前|まえ} で 、 レン が {灯籠|とうろう} の {名前|なまえ} を {書|か}き{直|なお}して いる 。 || Outside the Lantern Hall, Ren is rewriting a lantern's name.
ren: $name 。 お{帰|かえ}り なさい 。 {無事|ぶじ} で よかった 。 || $name. Welcome back. I'm glad you're safe.
!if !sa_ushio_found&!seen.sa.shelf_ren -> plain
pc: レン 。 {師匠|ししょう} の こと で 、 {話|はなし} が ある 。 || Ren. I have news of your teacher.
narr: $name は 、 {門|もん} の {脇|わき} の {小|ちい}さな {石|いし} の こと を {話|はな}した 。 「 {最後|さいご} まで {反対|はんたい} した {人|ひと} 」 と {彫|ほ}られた {石|いし} の こと を 。 || You tell Ren about the small stone beside the Archive gate, carved "One who disagreed to the very end."
ren[closed]: …… そう です か 。 {最後|さいご} まで 、 {反対|はんたい} して いた 。 …… {師匠|ししょう} らしい 。 || …I see. Disagreeing to the very end. …That's my teacher all over.
!if item.sa_ren_folio -> folio
!if sa_ren_told -> told
ren: {会|あ}い に {行|い}きます 。 {墓|はか} の {灯|ひ} を 、 {消|け}さない よう に 。 || I'll go and visit. And see that the lamp at the grave stays lit.
!end
:folio
narr: $name は 、 ウシオ の {札|ふだ} の {付|つ}いた {綴|つづ}り を {渡|わた}した 。 {一度|いちど} も {開|ひら}かず に {運|はこ}んで きた もの だ 。 || You hand over the folio with Ushio's label on it, carried all this way without once being opened.
ren: 「 {本人|ほんにん} が {選|えら}ぶ まで {預|あず}かる こと 」 …… {師匠|ししょう} の {字|じ} です 。 {右|みぎ} に {跳|は}ねる 。 {間違|まちが}い ない 。 || "To be held until the person themself chooses." …My teacher's hand. It kicks to the right. No mistaking it.
ren[closed]: …… {今|いま} は 、 {開|ひら}けません 。 でも 、 {捨|す}て も しない 。 {選|えら}べる の は 、 {嬉|うれ}しい です 。 {選|えら}ぶ まで 、 {少|すこ}し {時間|じかん} を ください 。 || …I can't open it now. But I won't throw it away. I'm glad I get to choose. Give me a little time before I do.
!take sa_ren_folio
!set sa_ren_delivered
!end
:told
pc: {書庫|しょこ} に 、 レン の {綴|つづ}り が ある 。 {師匠|ししょう} の {字|じ} で 、 「 {本人|ほんにん} が {選|えら}ぶ まで 」 と 。 || There's a folio of yours in the Archive. In your teacher's hand: "until the person chooses".
ren: …… {自分|じぶん} で {取|と}り に {行|い}きます 。 {道|みち} に {迷|まよ}わなければ 。 {迷|まよ}ったら 、 {音|おと} の する ほう へ 。 {今|いま} は 、 {音|おと} が あります から 。 || …I'll go and fetch it myself. If I don't get lost. And if I do — toward the sound. There's sound now.
!end
:plain
ren[smile]: {灯|ひ} の {道|みち} が 、 {全部|ぜんぶ} {繋|つな}がりました 。 {書|か}き{直|なお}す {名前|なまえ} は 、 まだ {山|やま} ほど あります が 。 || The lantern roads are all joined up again. There are still mountains of names to rewrite, mind.

@scene sa.end_comp
!music departure
!if comp=nao -> nao
!if comp=mio -> mio
!if comp=ren -> ren
!if comp=suzu -> suzu
narr: {日|ひ} が {暮|く}れる 。 {橋|はし} の {上|うえ} で 、 {川|かわ} の {音|おと} を {聞|き}いた 。 {道|みち} は 、 どこ まで も {続|つづ}いて いる 。 || The sun goes down. On the bridge, you listen to the river. The road goes on and on.
!end
:nao
!music companion_nao
narr: {日|ひ} が {暮|く}れる 。 {橋|はし} の {上|うえ} で 、 ナオ が {鞄|かばん} を {下|お}ろした 。 || The sun goes down. On the bridge, Nao sets down the satchel.
nao: {次|つぎ} の {配達|はいたつ} 、 もう {決|き}まって る んだ 。 {山|やま} の {上|うえ} 。 {書庫|しょこ} {行|い}き 。 || My next delivery's already set. Up the mountain. To the Archive.
?(end_kasane_keeper) nao[smirk]: カサネ {宛|あ}て の {文句|もんく} の {手紙|てがみ} 、 {山|やま} ほど ある 。 {全部|ぜんぶ} {届|とど}ける 。 {返事|へんじ} も {持|も}って {帰|かえ}る 。 {逃|に}げ{道|みち} は ない 。 || A mountain of complaint letters for Kasane. I'll deliver every one — and bring the replies back. No escape routes.
?(end_kasane_trial) nao: {灯落|ひおち} で カサネ が {書|か}き{写|うつ}す {名前|なまえ} を 、 {一|ひと}つ ずつ {持|も}ち{主|ぬし} に {届|とど}ける 。 {気|き} の {長|なが}い {仕事|しごと} だ 。 {嫌|きら}い じゃ ない 。 || Every name Kasane copies out in Lanternfall, I'll carry to its owner. One at a time. Slow work. I don't mind it.
narr: ナオ は {鞄|かばん} から 、 {古|ふる}い {紙|かみ} の {束|たば} を {出|だ}した 。 {宛名|あてな} の ラベル 。 {何百枚|なんびゃくまい} も 。 || From the satchel, Nao draws out a bundle of old paper. Address labels. Hundreds of them.
nao[shy]: {書|か}き{直|なお}した ラベル 、 {全部|ぜんぶ} {取|と}って ある 。 {笑|わら}う な よ 。 || Every label I ever rewrote. Kept them all. Don't laugh.
nao: …… これ は 、 $name に 。 || …This one's for you.
narr: {一枚|いちまい} の ラベル 。 ナオ の {字|じ} で 、 {名前|なまえ} だけ が {書|か}いて ある 。 「 $name 」 。 || One label. In Nao's hand, just a name: "$name".
nao: {住所|じゅうしょ} は {書|か}いて ない 。 {要|い}らない から 。 {道|みち} に {迷|まよ}ったら 、 それ を どこ か に {貼|は}っとけ 。 {探|さが}し に {行|い}く 。 || No address. You don't need one. If you ever get lost, stick that up somewhere. I'll come and find you.
nao[smirk]: {出口|でぐち} は 、 いつ も {確|たし}かめて る から な 。 {入口|いりぐち} も 。 {両方|りょうほう} 、 {知|し}ってる 。 || I always know where the exits are, remember. The entrances too. Both.
nao[smile]: …… {一緒|いっしょ} に {歩|ある}けて 、 よかった 。 {次|つぎ} の {道|みち} も 、 {声|こえ} を かけろ 。 {断|ことわ}る {理由|りゆう} は 、 {今|いま} の ところ {一|ひと}つ も ない 。 || …I'm glad we walked it together. Call me for the next road too. So far I haven't got a single reason to say no.
!end
:mio
!music companion_mio
narr: {薬屋|くすりや} の {棚|たな} に 、 {新|あたら}しい ラベル が {並|なら}んで いる 。 {全部|ぜんぶ} 、 まっすぐ だ 。 || On the apothecary's shelves stands a row of new labels. Every one of them perfectly straight.
mio: {見|み}て 。 {新|あたら}しい {札|ふだ} 。 || Look. A new sign.
narr: {戸口|とぐち} の {札|ふだ} に は 、 こう {書|か}いて ある 。 「 {水曜|すいよう} は {休|やす}み 。 {急|きゅう}{患|かん} {以外|いがい} は 、 お{断|ことわ}り します 。 」 || The sign on the door reads: "Closed Wednesdays. Emergencies only — everything else, I will politely refuse."
mio[laugh]: {書|か}いた {時|とき} 、 {手|て} が {震|ふる}えた の 。 {笑|わら}える でしょ 。 「 {断|ことわ}る 」 って {字|じ} だけ で 。 || My hand shook when I wrote it. Funny, isn't it? Just the word "refuse".
mio: でも 、 {灯落|ひおち} で {分|わ}かった 。 「 いいえ 」 が {言|い}えない {所|ところ} は 、 {優|やさ}しい ん じゃ なくて 、 {苦|くる}しい ん だ って 。 || But Lanternfall taught me. A place where no one can say no isn't kind. It's suffocating.
narr: ミオ は {棚|たな} の {奥|おく} から 、 {空|から} の {瓶|びん} を {一|ひと}つ {取|と}り{出|だ}した 。 ラベル に 、 $name の {名前|なまえ} 。 || From the back of the shelf, Mio takes out an empty bottle. The label bears your name.
mio: {旅|たび} の {間|あいだ} 、 ずっと {作|つく}ろう と して た {薬|くすり} 。 「 {長|なが}い {道|みち} に {効|き}く {薬|くすり} 」 。 …… {結局|けっきょく} 、 {中身|なかみ} は {作|つく}れなかった 。 || A remedy I've been trying to make the whole journey. "For long roads." …In the end, I couldn't make what goes inside.
mio[smile]: たぶん 、 {一緒|いっしょ} に {歩|ある}く {人|ひと} が {中身|なかみ} な んだ と {思|おも}う 。 だから 、 {瓶|びん} だけ 。 {持|も}って て 。 || I think maybe the person walking beside you is what goes inside. So — just the bottle. Keep it.
mio: …… それ から 、 {約束|やくそく} 。 これから は 、 $name に も 、 {時々|ときどき} 「 いいえ 」 って {言|い}う から ね 。 || …And a promise. From now on, I'll say no to you too, sometimes.
mio[laugh]: {嬉|うれ}し そう な {顔|かお} 、 しない で よ 。 || Don't look so pleased about it.
!end
:ren
!music companion_ren
narr: {灯|あか}り{堂|どう} の {前|まえ} で 、 レン が {灯|ひ} を {磨|みが}いて いる 。 {二|ふた}つ 。 || Outside the Lantern Hall, Ren is polishing lamps. Two of them.
ren: {師匠|ししょう} の {灯|ひ} です 。 カサネ さん が 、 {持|も}って いけ と 。 {磨|みが}き{方|かた} が {雑|ざつ} で 、 {見|み}て いられません でした 。 || My teacher's lamp. Kasane told me to take it. The polishing was so slapdash I couldn't bear to look.
?(sa_ren_took) ren[smile]: {顔|かお} を {思|おも}い{出|だ}して から 、 {教|おし}え が {少|すこ}し {違|ちが}って {聞|き}こえます 。 {同|おな}じ {言葉|ことば} なのに 、 {言|い}った {顔|かお} が {笑|わら}って いる 。 || Since I remembered the face, the lessons sound a little different. The same words, but the face that says them is smiling.
?(sa_ren_took) ren: {最後|さいご} の {口論|こうろん} も 、 {一緒|いっしょ} に {戻|もど}って きました 。 {痛|いた}い です 。 でも 、 {痛|いた}い {所|ところ} に 、 {師匠|ししょう} が いる 。 || The last quarrel came back with it. It hurts. But where it hurts is where my teacher is.
?(sa_ren_left) ren: {顔|かお} は 、 {書庫|しょこ} に {置|お}いて きました 。 {後悔|こうかい} は …… {毎日|まいにち} {少|すこ}し ずつ して います 。 {体|からだ} に いい {程度|ていど} に 。 || I left the face at the Archive. Regrets… I have a small one every day. A healthy dose.
?(sa_ren_left) ren: {教|おし}え は 、 {全部|ぜんぶ} ここ に ある 。 {師匠|ししょう} が {一番|いちばん} {残|のこ}したかった の は 、 たぶん こっち です 。 || The lessons are all here. I suspect that's what my teacher most wanted to leave behind.
ren: {灯|ひ} の {道|みち} は 、 まだ {途中|とちゅう} です 。 {書|か}き{直|なお}す {名前|なまえ} が 、 {山|やま} ほど ある 。 || The lantern roads are only half mended. There are mountains of names to rewrite.
ren[think]: {師匠|ししょう} の {教|おし}え を 、 {一|ひと}つ {足|た}して も いい です か 。 「 {道|みち} を {知|し}る {者|もの} より 、 {一緒|いっしょ} に {迷|まよ}って くれる {者|もの} を {連|つ}れて いけ 」 。 || May I add one to my teacher's lessons? "Take someone who'll get lost with you, over someone who knows the way."
ren[smirk]: …… {今|いま} {考|かんが}えました 。 でも 、 {師匠|ししょう} なら {言|い}った と {思|おも}います 。 {解説|かいせつ} は {要|い}りません ね 。 || …I just made that one up. But I think my teacher would have said it. No explanation needed, I trust.
ren[smile]: {次|つぎ} も 、 {一緒|いっしょ} に {迷|まよ}って ください 。 $name 。 || Get lost with me next time too, $name.
!end
:suzu
!music companion_suzu
narr: {葦|あし}ノ{瀬|せ} の {広場|ひろば} に 、 {小|ちい}さな {舞台|ぶたい} が {組|く}まれて いる 。 || A little stage has been put up in Reedwake's square.
suzu: {帳簿|ちょうぼ} 、 {閉|と}じた よ 。 {借|か}り は {全部|ぜんぶ} {返|かえ}した 。 {貸|か}し は …… {半分|はんぶん} 、 {棒引|ぼうび}き に した 。 {珍|めずら}しい でしょ 。 || I've closed my ledger. Every debt I owed, repaid. What I'm owed… I let half of it go. Rare for me, right?
suzu[laugh]: {新|あたら}しい {芝居|しばい} を {書|か}いてる んだ 。 {題|だい} は 『 {借|か}りた {名前|なまえ} の {道|みち} 』 。 {主役|しゅやく} が {誰|だれ} か 、 {分|わ}かる よ ね 。 || I'm writing a new play. It's called "The Road of Borrowed Names". You know who the lead is.
suzu: {最後|さいご} の {台詞|せりふ} で 、 {迷|まよ}って る 。 「 みんな {幸|しあわ}せ に {暮|く}らしました 」 に する か …… || I'm stuck on the last line. Whether to go with "And everyone lived happily ever after"…
suzu[closed]: …… ううん 。 「 みんな 、 {生|い}きて いきました 」 に する 。 {幸|しあわ}せ か どう か は 、 {見|み}た {人|ひと} が {決|き}める 。 || …No. "And everyone went on living." Whether it was happily, the audience can decide.
suzu: それ と 、 これ 。 || And — this.
narr: スズ は {髪|かみ} の {古|ふる}い リボン を ほどいて 、 $name の {手首|てくび} に {結|むす}んだ 。 || Suzu unties the faded ribbon from her hair and ties it around your wrist.
suzu: {貸|か}し じゃ ない よ 。 {預|あず}ける だけ 。 {次|つぎ} の {幕|まく} まで 。 …… {返|かえ}し に {来|き}て よ ね 。 {必|かなら}ず 。 {曖昧|あいまい} じゃ ない ほう の {必|かなら}ず 。 || It's not a loan. I'm just leaving it with you. Until the next act. …Come and give it back. Without fail. The kind of "without fail" that isn't vague.
!end
`, 'ch6/scenes-ending');
