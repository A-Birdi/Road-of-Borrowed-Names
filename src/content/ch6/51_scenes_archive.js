/* Chapter 6 scenes inside the Still Archive: the Reading Room (Kasane, the
 * catalogue clerk), the Stacks, the conduit terminus, the Room of Set-Down
 * Memories and Kasane's study. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
@scene sa.kasane_meet
# Staged (the Archive is still; little moves): you walk in and look up the room to the one standing beyond the
# desks; Kasane's open hand of welcome and a nod for "I keep this archive"; each companion meets them in their own
# way (Nao's flat hand of anger and Kasane looks away; Mio looks them over and Kasane starts a little at the
# kindness; Ren points back to the stone at the gate, Kasane's head goes down, and Ren stays still; Suzu's open
# hand, and her head down at "That, I know"); Kasane opens a hand to the shelves, their head goes down over why
# (either answer), an open hand to read whatever you like, and points you to the Stacks; you look after them as
# they go; your companion's own answer (Nao looks between where they went and you, Mio's flat hand, Ren breathes
# out, Suzu's hand to her chin).
!set sa_met_kasane
!music sa_kasane
!move pc up 4
!gesture pc lookroad kasane
narr: {長|なが}い {机|つくえ} の {列|れつ} の {向|む}こう に 、 {誰|だれ}か が {立|た}って いる 。 || Beyond the long rows of desks, someone is standing.
narr: {白|しろ}い {上着|うわぎ} 。 {袖|そで} に {墨|すみ} の しみ 。 {眠|ねむ}って いない {人|ひと} の {目|め} 。 || A pale coat. Ink stains on the cuffs. The eyes of someone who has not slept.
!gesture kasane palm pc
kasane[tired]: ようこそ 、 {静寂|しじま} の {書庫|しょこ} へ 。 {遠|とお}い ところ を 、 よく {来|き}て くださいました 。 || Welcome to the Still Archive. You've come a long way.
kasane: $name さん です ね 。 あなた が {書|か}き{直|なお}した {名前|なまえ} は 、 {一|ひと}つ も {上|うえ} へ {上|あ}がって きません でした 。 || You're $name, aren't you. Not one of the names you rewrote ever came up here.
kasane[smile]: {珍|めずら}しい こと です 。 {三十年|さんじゅうねん} で 、 {二人目|ふたりめ} です 。 || That's rare. In thirty years, you are the second.
pc: …… あなた が 、 カサネ 。 || …You're Kasane.
!gesture kasane nod pc
kasane: はい 。 この {書庫|しょこ} の {番|ばん} を して います 。 || Yes. I keep this archive.
?(comp=nao) !gesture comp emphatic
?(comp=nao) nao[angry]: {番|ばん} ね 。 {人|ひと} の {手紙|てがみ} の {宛名|あてな} まで {持|も}って いく {番人|ばんにん} か 。 || Keeper, is it. The kind of keeper who walks off with the addresses on people's letters.
?(comp=nao) !gesture kasane aside
?(comp=nao) kasane[tired]: {宛名|あてな} が なければ 、 {届|とど}かない {手紙|てがみ} で {傷|きず}つく {人|ひと} も いません 。 …… と 、 {前|まえ} は {思|おも}って いました 。 || Without addresses, no one is hurt by letters that never arrive. …Or so I used to think.
?(comp=mio) !gesture comp observe kasane
?(comp=mio) mio[worry]: …… {顔色|かおいろ} が {悪|わる}い です 。 {最後|さいご} に {食|た}べた の は 、 いつ です か 。 || …You look terrible. When did you last eat?
?(comp=mio) !gesture kasane flinch comp
?(comp=mio) kasane[surprise]: …… {覚|おぼ}えて いません 。 {親切|しんせつ} な {方|かた} です ね 。 || …I don't remember. How kind of you.
?(comp=ren) !gesture comp point down
?(comp=ren) ren: {門|もん} の {石|いし} を {見|み}ました 。 {彫|ほ}った の は 、 あなた です か 。 || I saw the stone by the gate. Did you carve it?
?(comp=ren) !gesture kasane lowered
?(comp=ren) kasane[sad]: …… はい 。 ウシオさん の お{弟子|でし}さん です ね 。 {灯|ひ} の {磨|みが}き{方|かた} で 、 {分|わ}かりました 。 || …Yes. You're Ushio's apprentice. I could tell by how your lamp is polished.
?(comp=ren) ren[closed]: 「 {最後|さいご} まで {反対|はんたい} した {人|ひと} 」 。 {正確|せいかく} な {墓碑|ぼひ} です 。 {礼|れい} を {言|い}う {気|き} は ありません が 。 || "One who disagreed to the very end." An accurate epitaph. I don't intend to thank you for it.
?(comp=ren) kasane: {当然|とうぜん} です 。 ウシオさん の こと は 、 {書斎|しょさい} で {全部|ぜんぶ} お{話|はな}し します 。 {嘘|うそ} は つきません 。 || Of course. I'll tell you everything about Ushio, in my study. I won't lie to you.
?(comp=suzu) !gesture comp palm kasane
?(comp=suzu) suzu: お{客|きゃく} を {迎|むか}える なら 、 {看板|かんばん} ぐらい {掛|か}けて おく もん だ よ 。 {名前|なまえ} の ない {劇場|げきじょう} なんて 。 || If you're receiving guests, you might at least hang a sign. A theatre with no name.
?(comp=suzu) kasane: {看板|かんばん} が {嘘|うそ} を {言|い}う こと も あります から 。 || Signs sometimes lie.
?(comp=suzu) !gesture comp lowered
?(comp=suzu) suzu[closed]: …… それ は 、 {知|し}ってる 。 || …That, I know.
!gesture kasane palm 21,2
kasane: この {書庫|しょこ} は 、 {洪水|こうずい} や {火事|かじ} の {後|あと} に 、 {失|うしな}われた {名前|なまえ} を {取|と}り{戻|もど}す ため に {建|た}てられました 。 || This archive was built so that names lost in floods and fires could be recovered.
kasane: わたし は 、 その {仕事|しごと} を {少|すこ}し {先|さき} まで {続|つづ}けた だけ です 。 || I have only carried that work a little further.
!choice
* {頼|たの}まれて も いない のに ？ || Without being asked? -> asked
* どうして {言|い}い{争|あらそ}い まで {消|け}す の ？ || Why take even arguments? -> quarrels
:asked
!look kasane pc
!gesture kasane lowered
kasane[sad]: {最初|さいしょ} は 、 {頼|たの}まれた もの だけ でした 。 {泣|な}き ながら {山|やま} を {登|のぼ}って くる {人|ひと} たち の 、 {重|おも}い {記憶|きおく} だけ 。 || At first, only what I was asked to take. The heavy memories of people who climbed the mountain in tears.
kasane: そのうち 、 {頼|たの}まれる の を {待|ま}てなく なりました 。 {待|ま}って いる {間|あいだ} に も 、 {誰|だれ}か が {傷|きず}つく ので 。 || In time I could no longer wait to be asked. Someone was always being hurt while I waited.
!goto on
:quarrels
!look kasane pc
!gesture kasane lowered
kasane[sad]: {言|い}い{争|あらそ}い が 、 {人|ひと} を {溺|おぼ}れさせる こと が ある から です 。 || Because arguments can drown people.
kasane: {比喩|ひゆ} で は なく 。 || I don't mean that as a figure of speech.
:on
!gesture kasane palm pc
kasane[tired]: {読|よ}みたい もの は 、 {何|なん}でも {読|よ}んで ください 。 {隠|かく}す もの は ありません 。 {預|あず}かって いる もの が ある だけ です 。 || Read whatever you like. I have nothing to hide — only things I am keeping.
!gesture kasane point 1,9
kasane: {目録|もくろく} が {読|よ}めれば 、 {書架|しょか} へ の {扉|とびら} は {開|ひら}きます 。 わたし は {上|うえ} の 「 {芯|しん} 」 に います 。 || If you can read the catalogue, the door to the Stacks will open. I'll be above, in the Heart.
kasane: {十分|じゅうぶん} {読|よ}んだら 、 {来|き}て ください 。 わたし が {間違|まちが}って いる と {言|い}い に 。 || When you've read enough, come up. Come and tell me I'm wrong.
kasane[smile]: ウシオさん は 、 {六年|ろくねん} 、 {毎日|まいにち} そう {言|い}い{続|つづ}けました 。 || Ushio told me so every day for six years.
!move kasane up 4
!set sa_kasane_left
!gesture pc lookroad up
narr: カサネ は {棚|たな} の {間|あいだ} に {消|き}えた 。 {足音|あしおと} は 、 {一|ひと}つ も {聞|き}こえなかった 。 || Kasane disappears among the shelves. Not one footstep can be heard.
?(comp=nao) !gesture comp lookbetween up and=pc
?(comp=nao) nao[think]: …… {敵|てき} の {顔|かお} じゃ ない な 。 {寝|ね}て ない {人|ひと} の {顔|かお} だ 。 || …That's not an enemy's face. That's the face of someone who hasn't slept.
?(comp=mio) !gesture comp emphatic
?(comp=mio) mio[angry]: {何|なん}でも {一人|ひとり} で {決|き}めて 、 {一人|ひとり} で {背負|せお}って 。 …… {誰|だれ}か に {似|に}てる 。 {嫌|いや} だ な 。 || Deciding everything alone, carrying everything alone. …Reminds me of someone. I hate that.
?(comp=ren) !gesture comp exhale
?(comp=ren) ren[closed]: {師匠|ししょう} と {六年|ろくねん} も {言|い}い{争|あらそ}って 、 まだ {間違|まちが}って いる 。 {師匠|ししょう} も {大変|たいへん} だった でしょう 。 || Six years arguing with my teacher and still wrong. My teacher must have had a hard time of it.
?(comp=suzu) !gesture comp chin
?(comp=suzu) suzu[think]: {丁寧|ていねい} な {悪役|あくやく} って 、 {一番|いちばん} {困|こま}る んだ よ ね 。 {嫌|きら}い に なりにくい から 。 || Polite villains are the worst. They're so hard to hate.
!quest sa_main 1
!journal {閲覧室|えつらんしつ} で カサネ に {会|あ}った 。 {目録|もくろく} を {読|よ}めば 、 {書架|しょか} へ の {扉|とびら} が {開|ひら}く と いう 。 || Met Kasane in the Reading Room. Reading the catalogue should open the door to the Stacks.
!music still_archive

@scene sa.clerk_first
# Staged: the Catalogue Clerk (a figure of stacked paper: only a fixed tilt and a turn of its head) tilts at you
# for a call number; you lean in to its blank name tag; it looks over at the white catalogue labels and turns back;
# your companion's own answer (Nao's smirk away, Mio leans in to the blank tag, Ren turns to it at "Ushio" and it
# tilts, Suzu's laugh); it looks to the study at the back for Ushio's notebook, and back to you.
!gesture sa_clerk stiff pc
sa_clerk: {閲覧|えつらん} の お{客様|きゃくさま} です か 。 {整理|せいり}{番号|ばんごう} を どうぞ 。 || A reader? Your call number, please.
pc: {番号|ばんごう} は ない けど …… 。 || I don't have a number…
sa_clerk: {承知|しょうち} しました 。 {番号|ばんごう} の ない お{客様|きゃくさま} は 、 {七年|ななねん} ぶり です 。 {記録|きろく} して おきます 。 || Understood. It has been seven years since a reader without a number. I shall make a note of it.
!gesture pc observe sa_clerk
narr: {紙|かみ} を {重|かさ}ねて {作|つく}った よう な {人形|にんぎょう} だ 。 {胸|むね} に 、 {白紙|はくし} の {名札|なふだ} が {下|さ}がって いる 。 || It is a figure that seems to be made of stacked paper. A blank name tag hangs on its chest.
sa_clerk: {当|とう}{書記|しょき} は 、 {目録|もくろく}{係|がかり} です 。 {名前|なまえ} は 、 まだ ありません 。 || This clerk is the catalogue clerk. It does not yet have a name.
!look sa_clerk 5,2
sa_clerk: {目録|もくろく} の ラベル が 、 {今朝|けさ} {全部|ぜんぶ} {白|しろ}く なりました 。 {当|とう}{書記|しょき} は 、 {字|じ} は {読|よ}めて も 、 {意味|いみ} で {分|わ}ける こと が できません 。 || This morning every catalogue label went white. This clerk can read the characters, but cannot sort them by meaning.
!look sa_clerk pc
sa_clerk: {意味|いみ} で {分|わ}ける の は 、 {人|ひと} の {仕事|しごと} です 。 …… と 、 ウシオさん が {言|い}って いました 。 || Sorting by meaning is a person's job. …So Ushio used to say.
!lesson kana
?(comp=nao) !gesture comp aside
?(comp=nao) nao[smirk]: {紙|かみ} の {係員|かかりいん} か 。 {郵便|ゆうびん} の {仕分|しわ}け に {一人|ひとり} ほしい な 。 || A paper clerk. The post could use one of you for sorting.
?(comp=mio) !gesture comp observe sa_clerk
?(comp=mio) mio[smile]: {名札|なふだ} 、 {白|しろ}い まま な んです ね 。 {書|か}いて あげたく なる 。 || Your name tag's still blank. It makes me want to write on it.
?(comp=ren) !gesture comp listen sa_clerk
?(comp=ren) ren[surprise]: ウシオ 、 と 。 …… {師匠|ししょう} を {知|し}って いる の です か 。 || Ushio, you said. …You knew my teacher?
?(comp=ren) !gesture sa_clerk stiff comp
?(comp=ren) sa_clerk: {当|とう}{書記|しょき} に {字|じ} の {払|はら}い を {教|おし}えた {方|かた} です 。 {右|みぎ} に {跳|は}ねる {癖|くせ} が 、 {移|うつ}りました 。 || The one who taught this clerk how to finish a stroke. Their habit of kicking the sweep up to the right has rubbed off on me.
?(comp=suzu) !gesture comp laugh
?(comp=suzu) suzu[laugh]: {当|とう}{書記|しょき} ！ いい ね 、 {芝居|しばい} の {台詞|せりふ} みたい 。 || "This clerk"! Love it. Sounds like a line from a play.
sa_clerk: ウシオさん は 、 {当|とう}{書記|しょき} に {名前|なまえ} を {付|つ}ける と {約束|やくそく} しました 。 「 {議論|ぎろん} が {片付|かたづ}いたら な 」 と 。 || Ushio promised to give this clerk a name. "Once the argument's settled," Ushio said.
!look sa_clerk 27,9
sa_clerk: {議論|ぎろん} は 、 {片付|かたづ}きません でした 。 ウシオさん の {手帳|てちょう} は 、 {奥|おく} の {書斎|しょさい} に ある はず です 。 || The argument was never settled. Ushio's notebook should be in the study at the back.
!look sa_clerk pc
sa_clerk: もし {見|み}つけたら 、 {文|ぶん} の {続|つづ}き を {読|よ}んで いただけます か 。 {当|とう}{書記|しょき} の {感情|かんじょう} は …… {未分類|みぶんるい} です が 。 || If you find it, would you read me the rest of the sentence? This clerk's feelings are… unclassified, however.
!quest sa_clerk start

@scene sa.clerk_again
?(!sa_catalogue_done) sa_clerk: {目録|もくろく} は 、 まだ {白|しろ}い まま です 。 {意味|いみ} で {分|わ}けて くださる {方|かた} を 、 {待|ま}って います 。 || The catalogue is still blank. This clerk awaits someone who can sort by meaning.
?(sa_catalogue_done) sa_clerk: {目録|もくろく} は {元|もと} に {戻|もど}りました 。 {曖昧|あいまい} の {引|ひ}き{出|だ}し だけ 、 {今|いま} も {閉|し}まりません 。 || The catalogue is restored. Only the drawer marked "vague" still won't shut.
sa_clerk: ウシオさん の {手帳|てちょう} は 、 {奥|おく} の {書斎|しょさい} です 。 {書架|しょか} と {水路|すいろ} と 、 {記憶|きおく} の {部屋|へや} の {先|さき} 。 || Ushio's notebook is in the study at the back. Past the Stacks, the conduits, and the Room of Set-Down Memories.

@scene sa.clerk_name
# Staged: the clerk tilts; you hold up Ushio's notebook and it turns its attention to it; once you have read the
# name, you lean in to the writing appearing on its tag; Tsuzuri tilts at its own name; your companion's own answer
# (Nao's nod, Mio's laugh, Ren's small formal bow in their teacher's place, Suzu's open-handed congratulations); you
# reach to take the bookmark. Not yet: its tilt.
!if seen.sa.clerk_first -> named
!gesture sa_clerk stiff pc
sa_clerk: {閲覧|えつらん} の お{客様|きゃくさま} です か 。 {当|とう}{書記|しょき} は 、 {目録|もくろく}{係|がかり} です 。 {名前|なまえ} は 、 まだ ありません 。 || A reader? This clerk is the catalogue clerk. It does not yet have a name.
:named
!gesture pc present sa_clerk prop=book hold
!gesture sa_clerk listen pc
sa_clerk[surprise]: …… それ は 、 ウシオさん の {手帳|てちょう} です ね 。 || …That is Ushio's notebook.
pc: {君|きみ} の {名前|なまえ} が 、 {書|か}いて あった 。 || Your name is written in it.
sa_clerk: {当|とう}{書記|しょき} の 。 …… {読|よ}んで ください 。 {分類|ぶんるい} は 、 {後|あと} で {考|かんが}えます 。 || This clerk's. …Please read it. Classification can wait.
!quest sa_clerk 1
!challenge sa.clerk_name
!if var._res=0 -> later
!gesture pc observe sa_clerk
narr: {白|しろ}い {名札|なふだ} に 、 {字|じ} が {入|はい}った 。 「 ツヅリ 」 。 || Writing appears on the blank name tag: "Tsuzuri".
!gesture sa_clerk stiff
sa_tsuzuri[smile]: ツヅリ 。 …… ツヅリ 。 || Tsuzuri. …Tsuzuri.
sa_tsuzuri: ばらばら の {紙|かみ} を 、 {一冊|いっさつ} に {綴|と}じる {者|もの} 。 {書|か}き{損|そん}じ も {捨|す}てず に 。 || One who binds loose pages into a single book. Without throwing away the spoiled ones.
sa_tsuzuri: {当|とう}{書記|しょき} …… いえ 。 ツヅリ は 、 {自分|じぶん} の {感情|かんじょう} を {分類|ぶんるい} します 。 {分類|ぶんるい}{名|めい} ： 「 {嬉|うれ}しい 」 。 || This clerk… no. Tsuzuri will now classify its feelings. Category: "glad".
?(comp=nao) !gesture comp nod sa_clerk
?(comp=nao) nao[smile]: {名札|なふだ} に {名前|なまえ} が {入|はい}る と 、 {急|きゅう} に {顔|かお} に {見|み}える な 。 {宛名|あてな} と {同|おな}じ だ 。 || Once there's a name on the tag, it suddenly looks like a face. Same as an address.
?(comp=mio) !gesture comp laugh
?(comp=mio) mio[laugh]: {嬉|うれ}しい 、 の {引|ひ}き{出|だ}し 。 {作|つく}って おいて ね 。 これから {増|ふ}える から 。 || A drawer for "glad". Better make one. It's going to fill up.
?(comp=ren) !gesture comp bow sa_clerk
?(comp=ren) ren[smile]: {師匠|ししょう} が {選|えら}んだ {名前|なまえ} を 、 {師匠|ししょう} の {代|か}わり に {渡|わた}せた 。 …… {少|すこ}し 、 {借|か}り を {返|かえ}せた {気|き} が します 。 || I got to give the name my teacher chose, in my teacher's place. …It feels like repaying a little of what I owe.
?(comp=suzu) !gesture comp thanks sa_clerk
?(comp=suzu) suzu: ツヅリ 。 いい {芸名|げいめい} だ 。 {初舞台|はつぶたい} 、 おめでとう 。 || Tsuzuri. Good stage name. Congratulations on your debut.
!gesture pc receive sa_clerk
sa_tsuzuri: {文|ぶん} の {続|つづ}き を {読|よ}んで くださって 、 ありがとう ございました 。 これ を 。 {栞|しおり} です 。 {挟|はさ}まって いる の が {仕事|しごと} の {物|もの} です が 、 あなた なら {持|も}ち{歩|ある}いて くれる でしょう 。 || Thank you for reading me the rest of the sentence. Please take this. A bookmark. Its job is to stay between pages — but you, I think, will carry it about.
!quest sa_clerk done
!end
:later
!gesture sa_clerk stiff pc
sa_clerk: {急|いそ}ぎません 。 ひと{冬|ふゆ} {待|ま}ちました から 。 || There is no hurry. This clerk has waited one whole winter.

@scene sa.clerk_after
sa_clerk: {静寂|しじま} が {止|と}まって 、 {閲覧室|えつらんしつ} に {音|おと} が {戻|もど}りました 。 {当|とう}{書記|しょき} の {足音|あしおと} まで 、 {聞|き}こえます 。 || The Hush has stopped, and sound has come back to the Reading Room. Even this clerk's footsteps can be heard.
!if item.sa_ushio_notes -> notes
sa_clerk: {名前|なまえ} の {件|けん} は …… {手帳|てちょう} が {見|み}つかったら 、 で {構|かま}いません 。 || As for the matter of a name… whenever the notebook turns up.
!end
:notes
!call sa.clerk_name

@scene sa.tsuzuri_chat
sa_tsuzuri[smile]: ツヅリ です 。 {名乗|なの}る の は 、 {何度|なんど} {言|い}って も {慣|な}れません 。 {慣|な}れたく も ありません 。 || I am Tsuzuri. However many times I say it, introducing myself never gets old. I hope it never does.
?(!sa_hush_down) sa_tsuzuri: カサネさん は {上|うえ} です 。 {間違|まちが}って いる と {言|い}って あげて ください 。 ウシオさん の {代|か}わり に 。 || Kasane is above. Please go and tell Kasane they're wrong. In Ushio's place.
?(sa_hush_down) sa_tsuzuri: {分類|ぶんるい} できない もの が 、 {今日|きょう} は {多|おお}い です 。 {良|よ}い {日|ひ} です 。 || Many things today refuse to be classified. It is a good day.

@scene sa.cabinet
# Staged: you lean in to the blank drawer labels; when the last card goes in you look to the west door as its grille
# lifts; the clerk's tilt; your companion's own answer (Nao's shrug, Mio glances aside at kind vagueness, Ren's
# open hand, Suzu's laugh). Not yet: you look over the heap of cards.
!gesture pc observe prop:sa_cabinet
narr: {引|ひ}き{出|だ}し の ラベル が 、 {全部|ぜんぶ} {白|しろ}い 。 {床|ゆか} に は カード が {散|ち}らばって いる 。 || Every drawer label is blank. Cards are scattered across the floor.
!challenge sa.catalogue
!if var._res=0 -> later
!set sa_catalogue_done
!sfx reveal
!gesture pc lookroad 1,9
narr: {最後|さいご} の カード を {入|い}れる と 、 ラベル に {字|じ} が {戻|もど}った 。 {西|にし} の {扉|とびら} の {格子|こうし} が 、 {音|おと} も なく {上|あ}がる 。 || As the last card goes in, the writing returns to the labels. The grille over the west door lifts without a sound.
!gesture sa_clerk stiff
sa_clerk[smile]: {分類|ぶんるい} {完了|かんりょう} 。 …… {曖昧|あいまい} の {引|ひ}き{出|だ}し だけ 、 {閉|し}まりきりません 。 {中身|なかみ} が {多|おお}すぎて 。 || Sorting complete. …Only the drawer marked "vague" won't shut. There's too much in it.
?(comp=nao) !gesture comp shrug
?(comp=nao) nao: {曖昧|あいまい} が {一番|いちばん} {多|おお}い の か 。 そりゃ そう だ 。 {人|ひと} の {言|い}う こと の {半分|はんぶん} は 、 それ だ 。 || "Vague" is the biggest drawer. Figures. Half of what people say is that.
?(comp=mio) !gesture comp aside
?(comp=mio) mio: {曖昧|あいまい} な {言葉|ことば} って 、 {優|やさ}しさ の {時|とき} も ある の に ね 。 || Vague words are sometimes kindness, though.
?(comp=ren) !gesture comp palm
?(comp=ren) ren: {灯|ひ} の {名前|なまえ} が {曖昧|あいまい} で は {困|こま}ります 。 {人|ひと} の {言葉|ことば} は …… {困|こま}ります が 、 {必要|ひつよう} です 。 || A lantern's name can't afford to be vague. People's words, though… they're a nuisance. A necessary one.
?(comp=suzu) !gesture comp laugh
?(comp=suzu) suzu[smirk]: {曖昧|あいまい} が なかったら 、 {芝居|しばい} は {全部|ぜんぶ} {三分|さんぷん} で {終|お}わる よ 。 || Without vagueness, every play would be over in three minutes.
!quest sa_main 2
!autosave
!end
:later
!gesture pc observe prop:sa_cabinet
narr: カード は まだ {山|やま} の まま だ 。 {後|あと} で {続|つづ}けよう 。 || The cards are still in a heap. You can come back to this.

@scene sa.cabinet_done
narr: {引|ひ}き{出|だ}し の ラベル ： 「 {地名|ちめい} 」 「 {約束|やくそく} 」 「 {別|わか}れ の {言葉|ことば} 」 「 {反対|はんたい} 」 「 {曖昧|あいまい} 」 。 || The drawer labels: "Place names", "Promises", "Parting words", "Objections", "Vague".
narr: 「 {曖昧|あいまい} 」 の {引|ひ}き{出|だ}し は 、 {半分|はんぶん} {開|あ}いた まま だ 。 カード が あふれて いる 。 || The drawer marked "Vague" is stuck half open, overflowing with cards.
?(sa_hush_down) narr: 「 {反対|はんたい} 」 の {引|ひ}き{出|だ}し の {札|ふだ} に 、 {誰|だれ}か が {小|ちい}さく {書|か}き{足|た}して いる 。 「 ウシオ {専用|せんよう} 」 。 || On the label of the "Objections" drawer, someone has added in small writing: "Reserved for Ushio".

@scene sa.reading_desk
# Staged: you lean in to the open ledger and bend to the day's accessions; your companion's own answer (Suzu's
# shake of the head at the honest count, Nao's nod, Mio's shake of the head, Ren's head goes down for twelve roads).
!gesture pc observe prop:desk
narr: {開|ひら}いた まま の {帳簿|ちょうぼ} 。 {細|こま}かい {字|じ} で 、 {毎日|まいにち} の {記録|きろく} 。 || A ledger left open. Daily entries, in small, careful writing.
!gesture pc bend prop:desk
narr: 「 {本日|ほんじつ} の {収蔵|しゅうぞう} ── {地名|ちめい} {十二|じゅうに} 、 {約束|やくそく} {四十|よんじゅう} 、 {言|い}い{争|あらそ}い {百三|ひゃくさん} 、 {曖昧|あいまい} {不明|ふめい} 。 」 || "Today's accessions — place names: 12. Promises: 40. Quarrels: 103. Vague: uncounted."
?(comp=suzu) !gesture comp shake
?(comp=suzu) suzu[angry]: {言|い}い{争|あらそ}い {百三|ひゃくさん} 。 {毎日|まいにち} 。 …… {帳簿|ちょうぼ} は {正直|しょうじき} だ ね 。 {正直|しょうじき} な {分|ぶん} 、 {腹|はら} が {立|た}つ 。 || A hundred and three quarrels. Every day. …The ledger's honest. Which makes it all the more infuriating.
?(comp=nao) !gesture comp nod
?(comp=nao) nao: {言|い}い{争|あらそ}い が {一番|いちばん} {多|おお}い 。 {下|した} の {町|まち} は 、 {本当|ほんとう} は {賑|にぎ}やか だった んだ な 。 || Quarrels are the biggest number. The towns below must have been lively places, once.
?(comp=mio) !gesture comp shake
?(comp=mio) mio: 「 {曖昧|あいまい} 、 {不明|ふめい} 」 。 {数|かぞ}えられない ほど 、 か 。 || "Vague: uncounted." Too many to count.
?(comp=ren) !gesture comp lowered
?(comp=ren) ren: {地名|ちめい} {十二|じゅうに} 。 …… {十二|じゅうに} {本|ほん} の {道|みち} が 、 {今日|きょう} どこ か で {途切|とぎ}れた 。 || Twelve place names. …Somewhere today, twelve roads stopped short.

@scene sa.reading_charter
narr: {机|つくえ} の {上|うえ} に 、 {古|ふる}い {文書|ぶんしょ} の {写|うつ}し 。 {書庫|しょこ} の {定|さだ}め だ 。 || On the desk, a copy of an old document: the Archive's charter.
narr: 「 {当|とう}{書庫|しょこ} は 、 {災|わざわ}い に より {失|うしな}われし {名|な} を {写|うつ}し{置|お}き 、 {求|もと}め {有|あ}らば {必|かなら}ず {返|かえ}す べし 。 」 || "This archive shall keep copies of names lost to disaster, and whenever they are asked for, shall without fail return them."
narr: {余白|よはく} に 、 {鉛筆|えんぴつ} の {書|か}き{込|こ}み 。 カサネ の {字|じ} だ 。 「 {求|もと}め {無|な}くば 、 {返|かえ}さず とも {可|か} 。 」 || In the margin, a note in pencil, in Kasane's hand: "If not asked, need not return."
narr: その {下|した} に 、 {別|べつ} の {字|じ} で {太|ふと}く 。 「 そう は {書|か}いて ない 。 ── ウシオ 」 || Beneath it, in another hand, heavily: "It doesn't say that. — Ushio."
!note sa_charter

@scene sa.reading_plaque
!if post -> post
narr: {札|ふだ} ： 「 {静|しず}か に 。 {読|よ}んで いる {人|ひと} が います 。 」 || A sign: "Quiet, please. People are reading."
?(comp=suzu) suzu: {誰|だれ} も いない のに 。 …… {皮肉|ひにく} な {看板|かんばん} だ 。 || There's no one here. …What an ironic sign.
!end
:post
?(end_archive_library) narr: {札|ふだ} が {新|あたら}しく なって いる 。 「 {読|よ}む {時|とき} は {静|しず}か に 。 {議論|ぎろん} は {中庭|なかにわ} で 。 {大|おお}いに どうぞ 。 」 || The sign has been replaced: "Quiet while reading. Arguments in the courtyard, please. As many as you like."
?(!end_archive_library) narr: {札|ふだ} ： 「 {静|しず}か に 。 {読|よ}んで いる {人|ひと} が います 。 」 || A sign: "Quiet, please. People are reading."

@scene sa.stacks_locked
narr: {西|にし} の {扉|とびら} に 、 {鉄|てつ} の {格子|こうし} 。 {小|ちい}さな {札|ふだ} ： 「 {目録|もくろく} を {正|ただ}した {者|もの} に {開|ひら}く 。 」 || An iron grille over the west door. A small tag: "Opens for whoever puts the catalogue right."

@scene sa.shortcut_locked
narr: {重|おも}い {扉|とびら} 。 {向|む}こう {側|がわ} から {閂|かんぬき} が かかって いる 。 || A heavy door, bolted from the other side.

@scene sa.stacks_enter
# Staged: you look along the stone shelves of name slips and lean in to the nearest; your companion's own answer
# (Nao looks along them, Mio's guarded hand, Ren points left, Suzu's open hand to the costume store).
!autosave
!gesture pc lookroad left
narr: {石|いし} の {棚|たな} が 、 {果|は}て が ない ほど {並|なら}んで いる 。 {並|なら}んで いる の は {本|ほん} で は なく 、 {細|ほそ}い {紙|かみ} の {札|ふだ} だ 。 {一枚|いちまい} ずつ 、 {名前|なまえ} が {書|か}いて ある 。 || Stone shelves stretch on and on. What stands on them isn't books but thin slips of paper, each with a name written on it.
!gesture pc observe 24,12
narr: {棚|たな} に は 、 {取|と}られた {理由|りゆう} ごと に {札|ふだ} が {付|つ}いて いる 。 || Each shelf is labelled with the reason its names were taken.
?(comp=nao) !gesture comp lookroad left
?(comp=nao) nao: {郵便受|ゆうびんう}け が {何千|なんぜん} {個|こ} も ある {郵便局|ゆうびんきょく} だ 。 {誰|だれ} も {取|と}り に {来|こ}ない 。 || A post office with thousands of mailboxes. And nobody comes to collect.
?(comp=mio) !gesture comp guard
?(comp=mio) mio[worry]: {整理|せいり} されてる 。 {気持|きも}ち {悪|わる}い くらい 。 …… わたし も {棚|たな} を {並|なら}べる の は {好|す}き だ けど 、 これ は {違|ちが}う 。 || It's all organised. Creepily so. …I like arranging shelves too, but this is different.
?(comp=ren) !gesture comp point left
?(comp=ren) ren: {迷路|めいろ} です ね 。 {大丈夫|だいじょうぶ} 、 {左|ひだり} です 。 …… つまり {右|みぎ} です 。 わたし が {左|ひだり} と {言|い}ったら 。 || A maze. Don't worry, it's left. …Meaning it's right, if I'm the one saying left.
?(comp=suzu) !gesture comp palm left
?(comp=suzu) suzu: {楽屋|がくや} の {衣装|いしょう}{部屋|べや} みたい 。 {着|き}る {人|ひと} の いない {衣装|いしょう} ばっかり 。 || Like a theatre's costume store. Nothing but costumes with no one to wear them.
!journal {書架|しょか} に {入|はい}った 。 {入口|いりぐち} の {机|つくえ} に 、 {請求|せいきゅう}{票|ひょう} が ある 。 || Entered the Stacks. There's a call slip on the desk by the entrance.

@scene sa.stacks_slip
narr: {机|つくえ} の {上|うえ} に 、 {請求|せいきゅう}{票|ひょう} 。 カサネ の {字|じ} だ 。 {下|くだ}り の {階段|かいだん} の {場所|ばしょ} を 、 {自分|じぶん} の ため に {書|か}いた もの らしい 。 || A call slip on the desk, in Kasane's hand. It seems to be a note Kasane wrote to themself about where the stairs down are.
?(prof=F) narr: 「 はっきり しない やくそく の たな 。 いちばん おく 。 」 || "The shelf of promises that aren't clear. Right at the back."
?(prof=E) narr: 「 はっきり しない {約束|やくそく} の {棚|たな} の 、 いちばん {奥|おく} 。 」 || "At the very back of the shelf of promises that aren't clear."
?(prof=I) narr: 「 {守|まも}る の か {守|まも}らない の か 、 {読|よ}む {人|ひと} に よって {違|ちが}う {約束|やくそく} 。 その {列|れつ} の {奥|おく} 。 」 || "Promises that read as kept or not kept depending on who reads them. At the back of that row."
?(prof=A) narr: 「 どちら と も {取|と}れる {言質|げんち} ── {読|よ}み{手|て} {次第|しだい} で {白|しろ} に も {黒|くろ} に も なる {約束|やくそく} ── を {収|おさ}めた {列|れつ} の {突|つ}き{当|あ}たり 。 」 || "The end of the row that holds commitments that can be taken either way — promises that turn white or black depending on the reader."
narr: {列|れつ} の {札|ふだ} は 、 {下|した} の {棚|たな} の {入口|いりぐち} に {立|た}って いる 。 || The aisle signs stand at the heads of the lower shelves.

@scene sa.aisle_a
narr: {列|れつ} の {札|ふだ} ： 「 {言|い}い{争|あらそ}い 」 。 {棚|たな} は ぎっしり {詰|つ}まって いて 、 {札|ふだ} の {何枚|なんまい} か は 、 まだ {温|あたた}かい 。 || Aisle sign: "Quarrels". The shelves are crammed full, and some of the slips still feel warm.

@scene sa.aisle_b
narr: {列|れつ} の {札|ふだ} ： 「 {曖昧|あいまい}な {約束|やくそく} 」 。 この {列|れつ} だけ 、 {奥|おく} が {深|ふか}い 。 {突|つ}き{当|あ}たり に 、 {格子|こうし} が {見|み}える 。 || Aisle sign: "Vague promises". This aisle alone runs deep. At its far end, a grille.

@scene sa.aisle_c
narr: {列|れつ} の {札|ふだ} ： 「 {悲|かな}しい {記憶|きおく} 」 。 {棚|たな} は 、 ほとんど {空|から} だ 。 {札|ふだ} に {小|ちい}さく ： 「 {別室|べっしつ} へ 」 。 || Aisle sign: "Sad memories". The shelves are almost empty. A small note on the sign: "Moved to a separate room."

@scene sa.aisle_d
narr: {列|れつ} の {札|ふだ} ： 「 {地名|ちめい} 」 。 {川|かわ} の {名前|なまえ} 、 {橋|はし} の {名前|なまえ} 、 {坂|さか} の {名前|なまえ} 。 {一枚|いちまい} ずつ 、 {日付|ひづけ} の {判|はん} 。 || Aisle sign: "Place names". Names of rivers, bridges, slopes. Each slip bears a date stamp.
?(comp=ren) ren: {橋|はし} が {向|む}こう {岸|ぎし} に {届|とど}かなく なった {日|ひ} が 、 ここ に {全部|ぜんぶ} {書|か}いて ある 。 || Every day a bridge stopped reaching the far bank is recorded here.

@scene sa.stacks_gate
# Staged: you lean in to the lock plate on the grille; when it lifts you look down the stairs; your companion's own
# answer (Nao's nod, Mio checks her bottles, Ren's open hand, Suzu's laugh). Without the slip: you look over to the
# desk by the entrance. Not yet, and open: you look at the grille and down.
!if sa_stacks_done -> open
!if !seen.sa.stacks_slip -> noslip
!gesture pc observe prop:sa_gate
narr: {格子|こうし} に {錠|じょう} の {板|いた} 。 「 {請求|せいきゅう}{票|ひょう} の {列|れつ} を {示|しめ}せ 。 」 || A lock plate on the grille: "Show the aisle on your call slip."
!challenge sa.paraphrase
!if var._res=0 -> later
!set sa_stacks_done
!sfx reveal
!gesture pc lookroad down
narr: {格子|こうし} が {上|あ}がる 。 {奥|おく} に 、 {下|くだ}り の {階段|かいだん} 。 {水|みず} の {音|おと} が {上|あ}がって くる 。 || The grille lifts. Beyond it, stairs going down. The sound of water rises from below.
?(comp=nao) !gesture comp nod
?(comp=nao) nao: {言|い}い{換|か}え か 。 {宛名|あてな} を {間違|まちが}える {客|きゃく} の {手紙|てがみ} を {届|とど}ける の と {同|おな}じ だ 。 {言|い}いたい こと の ほう を {読|よ}む 。 || A paraphrase. Same as delivering a letter where the sender botched the address. You read what they meant.
?(comp=mio) !gesture comp check prop=bottle
?(comp=mio) mio: {同|おな}じ こと を {違|ちが}う {言葉|ことば} で 。 {薬|くすり} の {名前|なまえ} も そう 。 {地方|ちほう} ごと に {呼|よ}び{方|かた} が {違|ちが}う 。 || The same thing in different words. Medicines are like that too — every region calls them something else.
?(comp=ren) !gesture comp palm pc
?(comp=ren) ren: {迷|まよ}わず に {着|つ}きました 。 {記録|きろく} して おいて ください 。 || We arrived without getting lost. Please make a note of it.
?(comp=suzu) !gesture comp laugh
?(comp=suzu) suzu: {言|い}い{換|か}え は {役者|やくしゃ} の {得意技|とくいわざ} だ よ 。 {台詞|せりふ} を {忘|わす}れた {時|とき} の ね 。 || Paraphrasing is an actor's speciality. For when you've forgotten the line.
!quest sa_main 3
!end
:noslip
!gesture pc lookroad 27,15
narr: {格子|こうし} に {錠|じょう} の {板|いた} 。 「 {請求|せいきゅう}{票|ひょう} の {列|れつ} を {示|しめ}せ 。 」 …… {請求|せいきゅう}{票|ひょう} なら 、 {入口|いりぐち} の {机|つくえ} に {何|なに}か {置|お}いて あった 。 || A lock plate: "Show the aisle on your call slip." …There was something on the desk by the entrance.
!end
:later
!gesture pc observe prop:sa_gate
narr: {格子|こうし} は {閉|し}まった まま だ 。 || The grille stays shut.
!end
:open
!gesture pc lookroad down
narr: {上|あ}がった {格子|こうし} 。 {下|した} から 、 {水|みず} の {音|おと} 。 || The raised grille. From below, the sound of water.

@scene sa.stacks_pile
narr: {崩|くず}れた {札|ふだ} の {山|やま} 。 {拾|ひろ}い{上|あ}げた {一枚|いちまい} に 、 {見覚|みおぼ}え の ある {名前|なまえ} 。 || A collapsed heap of slips. The one you pick up bears a name you recognise.
narr: 「 {葦|あし}ノ{瀬|せ} の {渡|わた}し 」 。 {上|うえ} から 、 {赤|あか}い {判|はん} ： 「 {返却|へんきゃく} 」 。 || "The Reedwake crossing". Stamped across it in red: "Returned".
narr: {下|した} の {札|ふだ} に も 、 {同|おな}じ {判|はん} 。 {潮硝子|しおがらす} の {積|つ}み{荷|に} 、 {雪鈴|ゆきすず} の {宛先|あてさき} 。 {旅|たび} の {途中|とちゅう} で {直|なお}した もの が 、 ここ に {返却|へんきゃく}{済|ず}み で {積|つ}まれて いる 。 || The slips beneath carry the same stamp: Saltglass cargo, Snowbell addresses. Things you mended along the way, piled here, marked "returned".

@scene sa.conduits_enter
# Staged: you look over to the basin where the faint characters sink, and listen to water that makes no sound; your
# companion's own answer (Nao points to the end of the delivery route, Mio's head goes down, Ren points to the pipes
# stamped "uphill", Suzu looks away).
!gesture pc lookroad 14,12
narr: {静|しず}かな {水路|すいろ} の {終|お}わり 。 {壁|かべ} の {管|くだ} から 、 {淡|あわ}い {字|じ} が {流|なが}れ{出|だ}して 、 {真|ま}ん{中|なか} の {溜|た}まり に {沈|しず}んで いく 。 || The end of the Quiet Conduits. Faint characters drift out of the pipes in the walls and sink into the basin in the middle.
!gesture pc cupear 14,12
narr: {水|みず} の {音|おと} が しない 。 {流|なが}れて いる のに 。 || The water makes no sound, though it is moving.
?(comp=nao) !gesture comp point 14,12
?(comp=nao) nao: {灯落|ひおち} の {地下|ちか} の {管|くだ} が 、 ここ に {繋|つな}がって た の か 。 {配達|はいたつ} の {終点|しゅうてん} だ な 。 {受取人|うけとりにん} の いない 。 || So this is where the pipes under Lanternfall end up. The end of the delivery route. With no one to sign for it.
?(comp=mio) !gesture comp lowered
?(comp=mio) mio: {字|じ} が 、 {溺|おぼ}れてる みたい 。 …… {見|み}て いられない 。 || It's like watching letters drown. …I can't look.
?(comp=ren) !gesture comp point 21,2
?(comp=ren) ren: {上|のぼ}り の {印|しるし} の {管|くだ} 。 {灯落|ひおち} で {見|み}た もの と {同|おな}じ です 。 || Pipes stamped "uphill". The same ones we saw in Lanternfall.
?(comp=suzu) !gesture comp aside
?(comp=suzu) suzu: {音|おと} の ない {水|みず} って 、 {拍手|はくしゅ} の ない {芝居|しばい} より {怖|こわ}い 。 || Silent water's scarier than a play with no applause.

@scene sa.notice_desk
# Staged: you lean in to the water-stained notice and bend to read it, then hold it; your companion's own answer
# (Nao's shake of the head, Mio leans in to the notice in your hands, Ren's hand to the chin, Suzu's shake of the
# head). Taken already: you lean in to the watermark.
!if item.sa_notice -> have
!gesture pc observe prop:desk
narr: {水|みず} に {濡|ぬ}れた {貼|は}り{紙|がみ} が 、 {机|つくえ} に {広|ひろ}げて ある 。 {三十年|さんじゅうねん} {前|まえ} の もの だ 。 || A water-stained notice lies spread out on the desk. Thirty years old.
!gesture pc bend prop:desk
narr: 「 {高瀬|たかせ} より {返答|へんとう} 。 『 {必要|ひつよう}なら {開|あ}ける 』 。 {本|ほん}{議会|ぎかい} は 、 これ を {開|あ}けない {約束|やくそく} と {受|う}け{取|と}る 。 {鐘楼|しょうろう} は {施錠|せじょう} の まま と する 。 ── {灯落|ひおち} {議会|ぎかい} 」 || "Reply from Takase: 'If needed, open.' This council takes it as a promise not to open. The bell tower shall remain locked. — Lanternfall Council"
narr: {水路|すいろ} が {運|はこ}んで きた の だろう 。 {町|まち} じゅう の {貼|は}り{紙|がみ} と {一緒|いっしょ} に 。 || The conduits must have carried it up, along with every other notice in town.
!give sa_notice
!prop pc notice
?(comp=nao) !gesture comp shake
?(comp=nao) nao: {鐘楼|しょうろう} に {鍵|かぎ} を かけた の か 。 {警報|けいほう} を {鳴|な}らせない よう に 。 …… {最悪|さいあく} の {判断|はんだん} だ 。 || They locked the bell tower. So no alarm could be rung. …About the worst call you could make.
?(comp=mio) !gesture comp observe pc
?(comp=mio) mio: 「 {開|あ}けない {約束|やくそく} と {受|う}け{取|と}る 」 。 {受|う}け{取|と}る 、 って {書|か}いて ある 。 {向|む}こう が そう {言|い}った ん じゃ なくて 。 || "Takes it as a promise not to open." It says "takes it as" — not that Takase said so.
?(comp=ren) !gesture comp chin
?(comp=ren) ren: {議事録|ぎじろく} で {読|よ}んだ {言葉|ことば} です 。 {鍵|かぎ} の こと は 、 {書|か}いて ありません でした が 。 || The same words as in the minutes. Though the minutes said nothing about a key.
?(comp=suzu) !gesture comp shake
?(comp=suzu) suzu: {本番|ほんばん} の {前|まえ} に 、 {非常口|ひじょうぐち} に {鍵|かぎ} を かけた {劇場|げきじょう} だ 。 {怖|こわ}い 。 || A theatre that locked its fire exits before the show. Terrifying.
!end
:have
!gesture pc observe prop:desk
narr: {空|から} の {机|つくえ} 。 {水|みず} の {跡|あと} が 、 {貼|は}り{紙|がみ} の {形|かたち} に {残|のこ}って いる 。 || An empty desk. A watermark in the shape of the notice remains.

@scene sa.charter_gate
# Staged: you look at the gate of water, bend to Kasane's note beneath the plaque, and lean in to the charter on
# the wall; once you read it rightly you look down the plank bridge; your companion's own answer (Nao points to
# the charter, Mio's open hand, Ren leans in to it, Suzu's laugh). Not yet: you look at the water still over the
# bridge. Done: you lean in to the plaque.
!if sa_promise_done -> done
!gesture pc observe prop:water
narr: {板|いた} の {橋|はし} の {手前|てまえ} に 、 {水|みず} の {門|もん} 。 {札|ふだ} が {下|さ}がって いる 。 || Before the plank bridge stands a gate of water. A plaque hangs from it.
narr: 「 {求|もと}められれば 、 {返|かえ}す 。 」 || "If asked, return."
!gesture pc bend prop:water
narr: その {下|した} に 、 カサネ の {字|じ} の {貼|は}り{紙|がみ} 。 「 {求|もと}められなければ 、 {返|かえ}さなくて よい 。 ── カサネ 」 || Beneath it, a note in Kasane's hand: "If not asked, need not return. — Kasane."
!gesture pc observe prop:sign
narr: {門|もん} は 、 {定|さだ}め を {正|ただ}しく {読|よ}む {者|もの} だけ を {通|とお}す 。 {定|さだ}め の {全文|ぜんぶん} が 、 {壁|かべ} に {彫|ほ}って ある 。 || The gate lets through only those who read the charter rightly. The full charter is carved into the wall.
!challenge sa.charter
!if var._res=0 -> later
!set sa_promise_done
!sfx water
!gesture pc lookroad down
narr: {水|みず} の {門|もん} が 、 {音|おと} も なく {引|ひ}いて いく 。 {板|いた} の {橋|はし} が 、 {濡|ぬ}れた {背中|せなか} を {見|み}せた 。 || The gate of water draws back without a sound. The plank bridge shows its wet back.
narr: カサネ の {貼|は}り{紙|がみ} が 、 {水|みず} を {吸|す}って {剥|は}がれ{落|お}ちた 。 || Kasane's note soaks through and peels away.
?(comp=nao) !gesture comp point prop:sign
?(comp=nao) nao: 「 もし 」 は 「 もし 」 だ 。 「 だけ 」 を {足|た}した の は カサネ だ 。 || "If" means "if". Kasane's the one who added "only".
?(comp=mio) !gesture comp palm
?(comp=mio) mio: {写|うつ}し を {守|まも}る の は 、 {薬|くすり} の {控|ひか}え と {同|おな}じ 。 {患者|かんじゃ} から {薬|くすり} を {取|と}り{上|あ}げる ため じゃ ない 。 || Keeping copies is like keeping a prescription on file. It's not so you can take the medicine off the patient.
?(comp=ren) !gesture comp observe prop:sign
?(comp=ren) ren: 「 {求|もと}め {有|あ}らば {必|かなら}ず {返|かえ}す べし 」 。 {灯守|ひもり} の {誓|ちか}い に よく {似|に}て います 。 {似|に}て いる から 、 {読|よ}み{違|ちが}える と {怖|こわ}い 。 || "Whenever asked, it shall without fail be returned." Very like a lantern keeper's oath. Which is why misreading it is so frightening.
?(comp=suzu) !gesture comp laugh
?(comp=suzu) suzu: {契約書|けいやくしょ} の {細|こま}かい {字|じ} を {読|よ}む の 、 {得意|とくい} だ よ 。 {借金|しゃっきん} {取|と}り に は {何度|なんど} も {泣|な}かされた から ね 。 || I'm good at reading the small print. Debt collectors made me cry often enough.
!note sa_charter
!quest sa_main 4
!autosave
!end
:later
!gesture pc observe prop:water
narr: {水|みず} は まだ 、 {橋|はし} を {覆|おお}って いる 。 || Water still covers the bridge.
narr: {札|ふだ} と {貼|は}り{紙|がみ} と {壁|かべ} の {定|さだ}め は 、 いつ でも {読|よ}み{比|くら}べられる 。 || The plaque, the note and the charter on the wall will still be here to compare.
!end
:done
!gesture pc observe prop:sign
narr: {定|さだ}め の {札|ふだ} 。 「 {求|もと}められれば 、 {返|かえ}す 」 。 {下|した} の {貼|は}り{紙|がみ} は 、 もう ない 。 || The charter plaque: "If asked, return." The note beneath it is gone.

@scene sa.conduit_crate
# Staged: you bend to the crate of scraps stamped "Unprocessed" and read one; your companion's own answer (Nao's
# shake of the head, Mio's laugh behind her hand, Ren's head goes down, Suzu's two hands for the mountain of bills).
!gesture pc bend prop:crate
narr: {木箱|きばこ} いっぱい の {紙切|かみき}れ 。 {全部|ぜんぶ} 、 {同|おな}じ {判|はん} が {押|お}して ある 。 「 {未処理|みしょり} 」 。 || A crate full of scraps of paper, every one stamped the same: "Unprocessed".
!gesture pc read prop=paper hold
narr: 「 {母|はは} の {名前|なまえ} を {返|かえ}して 。 」 「 {橋|はし} の {名前|なまえ} が {分|わ}からなく なった 。 」 「 {夫|おっと} と {喧嘩|けんか} が できない 。 {困|こま}って います 。 」 || "Give me back my mother's name." "I can't remember the name of the bridge." "I can't quarrel with my husband. It's a problem."
?(comp=nao) !gesture comp shake
?(comp=nao) nao: {全部|ぜんぶ} 、 {届|とど}いて は いた ん だ 。 {読|よ}まれなかった だけ で 。 || They all arrived. They just never got read.
?(comp=mio) !gesture comp laugh
?(comp=mio) mio[laugh]: 「 {夫|おっと} と {喧嘩|けんか} が できない 」 。 …… ごめん 、 {笑|わら}っちゃった 。 でも 、 {分|わ}かる 。 || "I can't quarrel with my husband." …Sorry, I laughed. But I understand.
?(comp=ren) !gesture comp lowered
?(comp=ren) ren: {頼|たの}まれて いた 。 {何百|なんびゃく} {回|かい} も 。 || They were asked. Hundreds of times.
?(comp=suzu) !gesture comp size
?(comp=suzu) suzu: {未払|みばら}い の {請求書|せいきゅうしょ} の {山|やま} だ 。 {利子|りし} が {膨|ふく}らんでる よ 。 || A mountain of unpaid bills. The interest must be enormous by now.

@scene sa.memories_enter
# Staged: you look along the held-breath room, lean in to the nearest shelf of folios, and look over to the one
# labelled differently at the back on the left; your companion's own answer (Nao looks along the room, Mio's head
# goes down, Suzu's open hand to the costumes no one can wear, Ren points to the shelf with their own name).
!autosave
!gesture pc lookroad left
narr: {静|しず}かな {部屋|へや} 。 ここ だけ は 、 {静寂|しじま} と は {違|ちが}う {静|しず}けさ だ 。 {誰|だれ}か が 、 {息|いき} を {止|と}めて いる よう な 。 || A quiet room — but here the quiet is different from the Hush. Like someone holding their breath.
!gesture pc observe prop:shelf
narr: {棚|たな} に は 、 {薄|うす}い {綴|つづ}り が {並|なら}んで いる 。 {一冊|いっさつ} ずつ 、 {名前|なまえ} と {日付|ひづけ} 。 || Thin folios line the shelves, each marked with a name and a date.
!gesture pc lookroad 3,3
narr: {奥|おく} の {左|ひだり} の {棚|たな} だけ 、 {札|ふだ} の {書|か}き{方|かた} が {違|ちが}う 。 「 カサネ ── {最初|さいしょ} の {一冊|いっさつ} 」 。 || Only the shelf at the back on the left has a label written differently: "Kasane — the first volume."
!note sa_memories
?(comp=nao) !gesture comp lookroad left
?(comp=nao) nao: {預|あず}け{物|もの} の {倉庫|そうこ} だ 。 {全部|ぜんぶ} 、 {持|も}ち{主|ぬし} が {自分|じぶん} で {運|はこ}んで きた やつ 。 || A left-luggage room. Everything here, the owners carried up themselves.
?(comp=mio) !gesture comp lowered
?(comp=mio) mio[sad]: ここ は …… {薬棚|くすりだな} に {似|に}てる 。 {飲|の}む の が {辛|つら}い {薬|くすり} を 、 {預|あず}かって おく {棚|たな} 。 || This is… like a medicine cabinet. Where you keep the medicines that are too hard to take.
?(comp=suzu) !gesture comp palm left
?(comp=suzu) suzu: {衣装|いしょう} を {脱|ぬ}いで いった {役者|やくしゃ} たち の {楽屋|がくや} だ ね 。 もう {着|き}られない {役|やく} が 、 {掛|か}かってる 。 || A dressing room full of costumes actors took off. Roles no one can wear any more, hanging up.
?(comp=ren) !gesture comp point 4,6
?(comp=ren) ren[surprise]: …… $name 。 あの {棚|たな} 。 {札|ふだ} に 、 わたし の {名前|なまえ} が 。 || …$name. That shelf. My name is on the label.
?(comp=ren) !call sa.shelf_ren
!quest sa_main 4

@scene sa.mem_table
narr: {読書|どくしょ} {用|よう} の {机|つくえ} 。 {椅子|いす} が {一|ひと}つ 、 {引|ひ}いた まま に なって いる 。 {冷|つめ}たく なった お{茶|ちゃ} 。 || A reading table. One chair has been left pulled out. A cup of tea gone cold.
narr: {夜|よる} ごと に 、 {誰|だれ}か が ここ に {座|すわ}って いた の だろう 。 {読|よ}み{返|かえ}す ため に 。 {返|かえ}す ため で は なく 。 || Someone must have sat here night after night. To reread — not to return.

@scene sa.mem_requests
# Staged: you lean in to the drawers full of return requests and read the one on top; your companion's own answer
# (Nao's flat hand of anger, Mio's and Ren's shake of the head, Suzu points to the drawer of standing claims).
!gesture pc observe prop:sa_cabinet
narr: {引|ひ}き{出|だ}し いっぱい の {紙|かみ} 。 {全部|ぜんぶ} 、 {返却|へんきゃく}{願|ねが}い だ 。 || The drawers are full of paper — all of it return requests.
!gesture pc read prop=paper hold
narr: 「 {返|かえ}して ください 。 やっぱり {覚|おぼ}えて いたい 。 」 「 {孫|まご} が {生|う}まれた ので 、 {夫|おっと} の {声|こえ} を {聞|き}かせたい 。 」 「 {間違|まちが}えました 。 」 || "Please give it back. I'd rather remember, after all." "My grandchild's been born; I want her to hear her grandfather's voice." "I made a mistake."
narr: どれ に も {同|おな}じ {判|はん} 。 「 {未処理|みしょり} 」 。 いちばん {上|うえ} の {一枚|いちまい} は 、 タエ と いう {人|ひと} の もの だ 。 {五年|ごねん} {前|まえ} の {日付|ひづけ} 。 || Every one bears the same stamp: "Unprocessed". The one on top is from someone called Tae, dated five years ago.
?(comp=nao) !gesture comp emphatic
?(comp=nao) nao[angry]: {定|さだ}め に は 「 {求|もと}め {有|あ}らば {必|かなら}ず {返|かえ}す 」 だ 。 {求|もと}め は 、 ここ に {山|やま} ほど ある 。 || The charter says "whenever asked, shall return". Here's a mountain of asking.
?(comp=mio) !gesture comp shake
?(comp=mio) mio: {断|ことわ}る の で も なく 、 {返事|へんじ} を しない 。 …… それ が 、 {一番|いちばん} {残酷|ざんこく} な {断|ことわ}り{方|かた} だ よ 。 || Not refusing — just not answering. …That's the cruellest way to say no.
?(comp=ren) !gesture comp shake
?(comp=ren) ren: {頼|たの}まれた もの すら 、 {返|かえ}さなく なって いた 。 {定|さだ}め を {自分|じぶん} で {破|やぶ}って いる 。 || They'd stopped returning even what was asked for. Breaking their own charter.
?(comp=suzu) !gesture comp point prop:sa_cabinet
?(comp=suzu) suzu: {返事|へんじ} の ない {請求|せいきゅう} は 、 {時効|じこう} に なら ない 。 {全部|ぜんぶ} {有効|ゆうこう} だ よ 。 {覚|おぼ}えて おいて 。 || A claim that gets no answer doesn't expire. Every one of these still stands. Remember that.

@scene sa.shelf_kasane
# Staged: you open Kasane's first folio and read it while the voices from the rain and the stone corridor are heard
# (nobody seen); your companion's own answer (Nao looks away, Mio's head goes down, Ren's hand to the chin, Suzu
# looks away and back). Taken: you lean in to the empty space.
!speakerless kasane lf_toya
!if item.sa_letter_kasane -> have
!gesture pc read prop=folio hold
narr: 「 カサネ ── {最初|さいしょ} の {一冊|いっさつ} 」 。 {綴|つづ}り を {開|ひら}く と 、 {声|こえ} が {聞|き}こえた 。 {雨|あめ} の {音|おと} 。 {石|いし} の {廊下|ろうか} 。 || "Kasane — the first volume." When you open the folio, you hear voices. Rain. A stone corridor.
lf_toya: {向|む}こう の {顔|かお} を {見|み}て ない から 、 そう {言|い}える んだ ！ {高瀬|たかせ} は {開|あ}ける 。 {今夜|こんや} に でも ！ || You can say that because you didn't see their faces over there! Takase is going to open it. Maybe tonight!
kasane[angry]: {必要|ひつよう} ない 。 {文面|ぶんめん} は {約束|やくそく} よ 。 {高瀬|たかせ} は {開|あ}けない 。 {鐘楼|しょうろう} も 、 {誰|だれ} も {開|あ}けない 。 || It isn't needed. The wording is a promise. Takase won't open it. And no one is opening the bell tower either.
kasane: {鍵|かぎ} を {置|お}いて いきなさい 、 トウヤ 。 {書記|しょき} と して {言|い}って いる の 。 || Leave the key, Tōya. I'm telling you as clerk.
narr: {返事|へんじ} は ない 。 {走|はし}って いく {足音|あしおと} だけ が 、 {遠|とお}ざかる 。 || No reply. Only running footsteps, going away.
narr: {綴|つづ}り の {最後|さいご} に 、 {若|わか}い カサネ の {字|じ} で 、 {一行|いちぎょう} 。 「 {預|あず}けます 。 わたし の {言葉|ことば} を 。 {持|も}って いたく ない 。 」 || At the end of the folio, one line in a young Kasane's hand: "I'm setting these down. My own words. I don't want to carry them."
!give sa_letter_kasane
?(sa_need_letter) narr: カサネ が {頼|たの}んだ もの だ 。 {上|うえ} へ {持|も}って いこう 。 || This is what Kasane asked for. Take it up.
?(comp=nao) !gesture comp aside
?(comp=nao) nao: {言|い}った ほう が {預|あず}けた の か 。 {言|い}われた ほう じゃ なく 。 …… {重|おも}かった ん だ な 。 {自分|じぶん} の {言葉|ことば} が 。 || The one who said it set it down — not the one who heard it. …Their own words weighed that much.
?(comp=mio) !gesture comp lowered
?(comp=mio) mio: 「 {鍵|かぎ} を {置|お}いて いきなさい 」 。 …… {怖|こわ}かった ん だ 。 {弟|おとうと} さん が {行|い}って しまう の が 。 {書記|しょき} の {顔|かお} で 、 {姉|あね} …… いえ 、 {家族|かぞく} の {心配|しんぱい} を してる 。 || "Leave the key." …They were frightened. Of their brother going. Worrying as family, wearing a clerk's face.
?(comp=ren) !gesture comp chin
?(comp=ren) ren: 「 {誰|だれ} も {開|あ}けない 」 。 …… この {言葉|ことば} を {覚|おぼ}えて おいて ください 。 {鍵|かぎ} に なる {気|き} が します 。 || "No one is opening it." …Remember those words. I think they're a key.
?(comp=suzu) !gesture comp avert pc
?(comp=suzu) suzu: {一番|いちばん} {聞|き}かれたく ない {台詞|せりふ} を 、 {一番|いちばん} {先|さき} に {棚|たな} に しまった の か 。 …… {分|わ}かる よ 。 {分|わ}かり たく ない けど 。 || The line they least wanted anyone to hear, put on the shelf first of all. …I understand. I wish I didn't.
!end
:have
!gesture pc observe prop:shelf
narr: {空|から} の {綴|つづ}り の {跡|あと} 。 {札|ふだ} だけ が 、 「 {最初|さいしょ} の {一冊|いっさつ} 」 と {言|い}って いる 。 || The space where the folio stood. Only the label still says "the first volume".

@scene sa.shelf_returned_rw
# Staged: you lean in to the empty shelf stamped "Returned"; Mio's nod, Nao points to the stamp.
!gesture pc observe prop:shelf
narr: 「 {葦|あし}ノ{瀬|せ} ── ハナ ── {二|ふた}つ{目|め} の {湯呑|ゆの}み の {相手|あいて} 。 」 {上|うえ} から {赤|あか}い {判|はん} ： 「 {返却|へんきゃく}{済|ず}み 」 。 || "Reedwake — Hana — who the second teacup was for." Stamped in red: "Returned".
narr: {棚|たな} は {空|から} だ 。 {橋|はし} が {架|か}かった {日|ひ} の {日付|ひづけ} が 、 {書|か}き{込|こ}まれて いる 。 || The shelf is empty. The date the bridge was mended has been written in.
?(comp=mio) !gesture comp nod pc
?(comp=mio) mio[smile]: ハナ さん の お{茶|ちゃ} 。 …… {帰|かえ}ったら 、 {三杯|さんばい} {目|め} を {頼|たの}もう 。 || Hana's tea. …When we get back, let's ask for a third cup.
?(comp=nao) !gesture comp point prop:shelf
?(comp=nao) nao: {最初|さいしょ} に {直|なお}した やつ だ 。 {返却|へんきゃく}{済|ず}み 。 いい {判|はん} だ な 。 || The very first thing we fixed. "Returned." That's a good stamp.

@scene sa.shelf_returned_co
# Staged: you lean in to the Cinder Orchard folio (still on the shelf, or returned); returned, Suzu's head goes down
# over Hiro's mother.
!if co_restored -> ret
!gesture pc observe prop:shelf
narr: 「 {灰実|はいみ}の{里|さと} ── {二十年前|にじゅうねんまえ} の {火|ひ} 。 」 {綴|つづ}り は まだ {棚|たな} に ある 。 {里|さと} は 、 {忘|わす}れる ほう を {選|えら}んだ の かも しれない 。 || "Cinder Orchard — the fire twenty years ago." The folio is still on the shelf. Perhaps the village chose to forget.
!end
:ret
?(co_restored) !gesture pc observe prop:shelf
narr: 「 {灰実|はいみ}の{里|さと} ── {二十年前|にじゅうねんまえ} の {火|ひ} 。 」 {赤|あか}い {判|はん} ： 「 {返却|へんきゃく}{済|ず}み 」 。 {里|さと} じゅう の {人|ひと} が 、 {一緒|いっしょ} に {取|と}り{戻|もど}した 。 || "Cinder Orchard — the fire twenty years ago." Stamped: "Returned". The whole village took it back together.
?(comp=suzu) !gesture comp lowered
?(comp=suzu) suzu[sad]: …… ヒロ の お{母|かあ}さん も 、 この {中|なか} に いた ん だ ね 。 {返|かえ}って よかった 。 {痛|いた}くて も 。 || …Hiro's mother was in here too. I'm glad she went back. Even if it hurts.

@scene sa.shelf_returned_sb
narr: 「 {雪鈴|ゆきすず} ── {娘|むすめ} へ の {宛先|あてさき} 。 」 || "Snowbell — the address to a daughter."
?(lf_akari_letter|sb_letters_done) narr: {赤|あか}い {判|はん} ： 「 {返却|へんきゃく}{済|ず}み 」 。 {手紙|てがみ} は 、 {届|とど}いた の だ 。 || Stamped: "Returned". The letters got through.
?(!lf_akari_letter&!sb_letters_done) narr: {判|はん} は まだ ない 。 {宛先|あてさき} の {字|じ} が 、 {薄|うす}く {残|のこ}って いる 。 || No stamp yet. The address is still faintly there.

@scene sa.shelf_returned_lf
# Staged: you lean in to the shelf of Lanternfall's "no", returned by the sound of a bell; Mio's laugh, Nao's nod.
!gesture pc observe prop:shelf
narr: 「 {灯落|ひおち} ── 『 いいえ 』 と いう {言葉|ことば} 。 {町|まち} {全体|ぜんたい} 。 」 {赤|あか}い {判|はん} ： 「 {返却|へんきゃく}{済|ず}み 」 。 {鐘|かね} の {音|おと} で 。 || "Lanternfall — the word 'no'. The whole town." Stamped: "Returned — by the sound of a bell."
?(comp=mio) !gesture comp laugh
?(comp=mio) mio[laugh]: 「 いいえ 」 が {棚|たな} {一|ひと}つ {分|ぶん} 。 {重|おも}かった だろう ね 。 …… {返|かえ}って よかった 。 わたし の {分|ぶん} も 、 {入|はい}って た かも 。 || A whole shelf of "no". Must have been heavy. …Glad it went back. Some of mine might have been in there too.
?(comp=nao) !gesture comp nod
?(comp=nao) nao: {町|まち} {一|ひと}つ {分|ぶん} の 「 いいえ 」 。 {配達|はいたつ} し がい が あった な 。 || A whole town's worth of "no". That was a delivery worth making.

@scene sa.shelf_tae
# Staged: you lean in to Tae's folio and read the slip tucked in its cover; your companion's own answer (Nao's hand
# to the chin, Mio's guarded hand, Ren's head goes down, Suzu looks away). Taken: you lean in to the empty folio.
!if item.sa_tae_slip -> have
!gesture pc observe prop:shelf
narr: 「 タエ ── {灯落|ひおち} ── {洪水|こうずい} の {夜|よる} の {鐘|かね} 。 」 || "Tae — Lanternfall — the bell on the night of the flood."
!gesture pc read prop=paper hold
narr: {表紙|ひょうし} に 、 {紙片|しへん} が {挟|はさ}まって いる 。 {預|あず}けた {人|ひと} が 、 {自分|じぶん} で {書|か}いた {説明|せつめい} だ 。 || A slip is tucked into the cover — a description written by the person who set it down.
narr: 「 {夜中|よなか} に {鐘|かね} が {鳴|な}った 。 {鍵|かぎ} の かかって いた はず の {鐘楼|しょうろう} から 。 わたしたち は {上|うえ} の {道|みち} へ {逃|に}げた 。 {鳴|な}らした {人|ひと} は 、 {出|で}て こなかった 。 」 || "At midnight the bell rang — from the bell tower that was supposed to be locked. We fled to the upper road. The one who rang it never came out."
narr: 「 {助|たす}かった のに 、 {毎晩|まいばん} あの {音|おと} で {目|め} が {覚|さ}める 。 {預|あず}けます 。 ── タエ 」 || "I was saved, and still that sound wakes me every night. I'm leaving it here. — Tae"
!give sa_tae_slip
?(comp=nao) !gesture comp chin
?(comp=nao) nao: {鍵|かぎ} の かかって いた {塔|とう} から 、 {鐘|かね} 。 …… {誰|だれ}か が {鍵|かぎ} を {持|も}って た って こと だ 。 || A bell from a locked tower. …Means somebody had the key.
?(comp=mio) !gesture comp guard
?(comp=mio) mio: {助|たす}けて もらった {音|おと} が 、 {怖|こわ}い {音|おと} に なる 。 {分|わ}かる 。 {患者|かんじゃ} さん で 、 {何人|なんにん} も {見|み}た 。 || The sound that saved you becomes the sound that frightens you. I know. I've seen it in patients more than once.
?(comp=ren) !gesture comp lowered
?(comp=ren) ren: {鳴|な}らした {人|ひと} が 、 {出|で}て こなかった 。 …… {鍵|かぎ} の かかった {塔|とう} で 。 || The one who rang it never came out. …Of a locked tower.
?(comp=suzu) !gesture comp aside
?(comp=suzu) suzu: {誰|だれ} が {鳴|な}らした か 、 {書|か}いて ない 。 {知|し}らない まま 、 {三十年|さんじゅうねん} 。 || It doesn't say who rang it. Thirty years without knowing.
!end
:have
!gesture pc observe prop:shelf
narr: {空|から} の {綴|つづ}り 。 {表紙|ひょうし} に 、 {小|ちい}さく ： 「 {五年前|ごねんまえ} 、 {返却|へんきゃく}{願|ねが}い {有|あ}り 」 。 || An empty folio. On the cover, small: "Return requested, five years ago."

@scene sa.shelf_grief
narr: 「 {雪鈴|ゆきすず} ── {夫|おっと} の {最後|さいご} の {冬|ふゆ} の {咳|せき} 。 」 || "Snowbell — a husband's cough, his last winter."
narr: {表紙|ひょうし} の {隅|すみ} に 、 {小|ちい}さな {字|じ} 。 「 {咳|せき} の {後|あと} に 、 いつも 『 {大丈夫|だいじょうぶ} 』 と {言|い}った 。 そこ は {返|かえ}して ほしい 。 」 || In the corner of the cover, small writing: "After every cough he said 'I'm all right.' That part I'd like back."

@scene sa.shelf_grief2
# Staged: you lean in to the folio of the shop sign and bend to the one beside it; Suzu laughs at "overslept", Nao
# shrugs.
!gesture pc observe prop:shelf
narr: 「 {灯落|ひおち} ── {店|みせ} を {畳|たた}んだ {日|ひ} の 、 {看板|かんばん} の {重|おも}さ 。 」 || "Lanternfall — the weight of the shop sign, the day I closed my shop."
!gesture pc bend prop:shelf
narr: その {隣|となり} 。 「 {潮硝子|しおがらす} ── {駆|か}け{落|お}ち に {失敗|しっぱい} した {夜|よる} 。 {雨|あめ} 。 {相手|あいて} は {寝坊|ねぼう} 。 」 || Next to it: "Saltglass — the night the elopement failed. Rain. The other party overslept."
?(comp=suzu) !gesture comp laugh
?(comp=suzu) suzu[laugh]: {寝坊|ねぼう} ！ …… ごめん 。 でも 、 これ は {返|かえ}して あげて ほしい な 。 {十年|じゅうねん} {後|ご} に は {笑|わら}い{話|ばなし} に なる やつ だ よ 。 || Overslept! …Sorry. But I'd like this one given back. In ten years it'll be a funny story.
?(comp=nao) !gesture comp shrug
?(comp=nao) nao: {寝坊|ねぼう} した ほう の {記憶|きおく} は 、 どこ に {預|あず}けて ある ん だろう な 。 || Wonder where the one who overslept stashed their memory of it.

@scene sa.shelf_grief3
narr: 「 {灰実|はいみ}の{里|さと} ── {初|はじ}めて {焼|や}いた {器|うつわ} が {割|わ}れた {音|おと} 。 」 || "Cinder Orchard — the sound my first fired bowl made when it broke."
narr: {悲|かな}しみ の {大|おお}きさ は 、 {人|ひと} に よって {違|ちが}う 。 {棚|たな} は 、 どれ も {同|おな}じ {大|おお}きさ だ 。 || Griefs come in different sizes for different people. The shelves are all the same size.

@scene sa.shelf_saltglass
narr: 「 {潮硝子|しおがらす} ── {沈|しず}んだ {書庫|しょこ} より {移送|いそう} 。 {港|みなと} の {名前|なまえ} {一式|いっしき} 。 」 {赤|あか}い {判|はん} ： 「 {返却|へんきゃく}{済|ず}み 」 。 || "Saltglass — transferred from the Drowned Archive. The harbour's names, complete set." Stamped: "Returned".

@scene sa.shelf_empty
# Staged: you lean in to the empty shelf and bend to Kasane's label; your companion's own answer (Nao's flat hand of
# anger, Mio's guarded hand, Ren's and Suzu's shake of the head).
!gesture pc observe prop:shelf
narr: {何|なに} も ない {棚|たな} 。 {札|ふだ} だけ が {付|つ}いて いる 。 カサネ の {字|じ} だ 。 || An empty shelf with only a label, in Kasane's hand.
!gesture pc bend prop:shelf
narr: 「 {予約|よやく} ── {最後|さいご} に {預|あず}ける もの ： わたし の {名前|なまえ} 。 」 || "Reserved — the last thing to be set down: my own name."
?(comp=nao) !gesture comp emphatic
?(comp=nao) nao[angry]: {自分|じぶん} の {名前|なまえ} まで 、 {棚|たな} に {上|あ}げる {気|き} だった の か 。 {宛名|あてな} の ない {手紙|てがみ} に なる つもり か よ 。 || Planning to shelve your own name too? Turn yourself into a letter with no address?
?(comp=mio) !gesture comp guard
?(comp=mio) mio: …… {疲|つか}れてる 。 {休|やす}みたい ん じゃ なくて 、 {消|き}えたい ん だ 。 {違|ちが}い は {分|わ}かる 。 {分|わ}かる から 、 {放|ほう}って おけない 。 || …They're exhausted. Not wanting to rest — wanting to disappear. I know the difference. That's why I can't leave it alone.
?(comp=ren) !gesture comp shake
?(comp=ren) ren: 「 {名|な} を {一人|ひとり} で {守|まも}る {者|もの} は いない 」 。 {師匠|ししょう} なら 、 この {札|ふだ} を {破|やぶ}った でしょう 。 || "No one keeps a name alone." My teacher would have torn this label down.
?(comp=suzu) !gesture comp shake
?(comp=suzu) suzu: {最終幕|さいしゅうまく} で 、 {主役|しゅやく} が {舞台|ぶたい} から {消|き}える {芝居|しばい} は 、 {嫌|きら}い 。 {観客|かんきゃく} に {失礼|しつれい} だ よ 。 || I hate plays where the lead just vanishes in the last act. It's rude to the audience.

@scene sa.shelf_isamu
# Staged: you lean in to the Saltglass shelf and, once you find Isamu's folio, read the request on its spine; your
# companion's own answer (Nao points down the mountain to the hut, Mio checks the cloths she will need, Ren's nod,
# Suzu writes it in her ledger). Otherwise: you lean in to the shelf.
!if item.sa_folio_isamu -> have
!if quest.sa_isamu=done -> done
!if !quest.sa_isamu -> noq
!gesture pc observe prop:shelf
narr: {潮硝子|しおがらす} の {棚|たな} 。 {綴|つづ}り が {何冊|なんさつ} も {並|なら}んで いる 。 {説明|せつめい} は どれ も 、 イサム の {言葉|ことば} で は なく 、 {目録|もくろく} の {言葉|ことば} で {書|か}いて ある 。 || The Saltglass shelf. Several folios stand here. Every description is written in the catalogue's words, not Isamu's.
!challenge sa.isamu_find
!if var._res=0 -> later
!give sa_folio_isamu
!quest sa_isamu 1
!gesture pc read prop=folio hold
narr: {綴|つづ}り の {背|せ} に 、 {小|ちい}さな {字|じ} 。 「 {返却|へんきゃく}{願|ねが}い {有|あ}り 。 {未処理|みしょり} 。 」 || On the spine, in small writing: "Return requested. Unprocessed."
?(comp=nao) !gesture comp point down
?(comp=nao) nao: {届|とど}け{先|さき} は 、 {小屋|こや} の {焚|た}き{火|び} の {前|まえ} 。 {近|ちか}い な 。 {配達人|はいたつにん} {冥利|みょうり} に {尽|つ}きる 。 || Destination: the fire outside the hut. Close by. A courier couldn't ask for better.
?(comp=mio) !gesture comp check prop=cloth
?(comp=mio) mio: {持|も}って いって あげよう 。 …… きっと {泣|な}く よ 。 {手拭|てぬぐ}い 、 {二枚|にまい} {用意|ようい} して おく 。 || Let's take it to him. …He's going to cry. I'll get two cloths ready.
?(comp=ren) !gesture comp nod
?(comp=ren) ren: {言|い}い{換|か}え を {読|よ}み{解|と}く の は 、 {灯|ひ} の {名前|なまえ} を {直|なお}す の と {同|おな}じ です ね 。 {元|もと} の {声|こえ} を {聞|き}き{取|と}る 。 || Seeing through a paraphrase is like mending a lantern name. You listen for the original voice.
?(comp=suzu) !gesture comp write
?(comp=suzu) suzu: {返却|へんきゃく} {一件|いっけん} 。 {帳簿|ちょうぼ} に つけて おく ね 。 {今日|きょう} の {最初|さいしょ} の {黒字|くろじ} だ 。 || One return. I'll put it in the ledger. Our first profit of the day.
!end
:noq
!gesture pc observe prop:shelf
narr: {潮硝子|しおがらす} の {棚|たな} 。 {説明|せつめい} は どれ も {丁寧|ていねい} で 、 どれ も {遠|とお}い 。 || The Saltglass shelf. Every description is careful, and every one is distant.
!end
:later
narr: どれ が イサム の {綴|つづ}り か 、 まだ {分|わ}からない 。 || You still can't tell which folio is Isamu's.
!end
:have
narr: イサム の {綴|つづ}り は 、 {手元|てもと} に ある 。 {小屋|こや} へ {持|も}って いこう 。 || You have Isamu's folio. Take it to the hut.
!end
:done
!gesture pc observe prop:shelf
narr: {棚|たな} に 、 {空|あ}いた {隙間|すきま} が {一|ひと}つ 。 {返却|へんきゃく}{済|ず}み 。 || One gap on the shelf. Returned.

@scene sa.shelf_ren
!speakerless sa_ushio
!if sa_ren_decided -> after
narr: {棚|たな} の {札|ふだ} に 、 {見覚|みおぼ}え の ない {力強|ちからづよ}い {字|じ} 。 || The label on this shelf is in a strong hand you don't recognise.
narr: 「 レン ── {師|し} の {顔|かお} 、 {及|およ}び {最後|さいご} の {口論|こうろん} 。 {本人|ほんにん} が {選|えら}ぶ まで {預|あず}かる こと 。 ── ウシオ 」 || "Ren — the teacher's face, and the last quarrel. To be held until the person themself chooses. — Ushio"
!if comp=ren -> ren
?(comp=nao) nao: レン …… {葦|あし}ノ{瀬|せ} の {灯守|ひもり} の 。 {師匠|ししょう} の {顔|かお} が {思|おも}い{出|だ}せない って 、 {誰|だれ} に も {言|い}え なかった やつ だ 。 || Ren… the lantern keeper back in Reedwake. The one who never told anyone they couldn't remember their teacher's face.
?(comp=mio) mio: レン さん の 。 …… {勝手|かって} に {開|ひら}いちゃ だめ 。 {本人|ほんにん} が {選|えら}ぶ 、 って {書|か}いて ある 。 || Ren's. …We mustn't open it. It says the person themself chooses.
?(comp=suzu) suzu: レン の {分|ぶん} だ 。 {預|あず}かり{証|しょう} {付|つ}き 。 …… {開|ひら}けない よ 。 これ は {人|ひと} の {荷物|にもつ} 。 || Ren's. With a receipt attached. …We don't open it. It's someone else's luggage.
!choice
* {開|ひら}かず に 、 レン の ところ へ {持|も}って {帰|かえ}ろう 。 || Don't open it. Take it home to Ren. -> take
* ここ に {置|お}いて おこう 。 レン に {知|し}らせる 。 || Leave it here, and tell Ren where it is. -> leave
:take
!give sa_ren_folio
!set sa_ren_decided sa_ren_carried
?(comp=nao) nao: {届|とど}け{物|もの} は {得意|とくい} だ 。 {中身|なかみ} を {見|み}ない の も な 。 || Deliveries are my speciality. So is not looking inside.
?(comp=mio) mio: {割|わ}れ{物|もの} と {同|おな}じ に {運|はこ}ぼう 。 そっと 。 || Let's carry it like something fragile. Gently.
?(comp=suzu) suzu: {貴重品|きちょうひん} 、 お{預|あず}かり します 。 {帳簿|ちょうぼ} に も つけた 。 || Valuables, taken into safekeeping. It's in the ledger.
!end
:leave
!set sa_ren_decided sa_ren_told
narr: {綴|つづ}り は 、 {棚|たな} に {戻|もど}した 。 レン が {自分|じぶん} で {来|く}る まで 。 || You put the folio back on the shelf — until Ren comes for it themself.
!end
:ren
ren[surprise]: …… {師匠|ししょう} の {字|じ} だ 。 || …That's my teacher's hand.
ren: この 「 {預|あず}かる 」 の {払|はら}い 。 {必|かなら}ず {右|みぎ} に {跳|は}ねる 。 {十年|じゅうねん} {直|なお}らなかった {癖|くせ} です 。 || The sweep on 預かる. It always kicks up to the right. A habit that never changed in ten years.
ren[think]: {顔|かお} を {取|と}られた と 、 {思|おも}って いました 。 {取|と}られた の は 、 {口論|こうろん} の ほう だった 。 {顔|かお} は 、 {一緒|いっしょ} に {持|も}って いかれた 。 || I thought the Hush had taken the face. What it took was the quarrel. The face just went along with it.
ren: {最後|さいご} に {見|み}た {顔|かお} が 、 {口論|こうろん} の {時|とき} の {顔|かお} だった から 。 || Because the last time I saw that face was during the quarrel.
ren[closed]: {何|なに} を {言|い}った か は 、 {覚|おぼ}えて います 。 {言葉|ことば} だけ は 。 …… ひどい こと を {言|い}いました 。 || I remember what I said. The words, at least. …It was a cruel thing to say.
ren: これ を {開|ひら}けば 、 {顔|かお} が {戻|もど}る 。 あの {時|とき} の {顔|かお} が 。 わたし の {言葉|ことば} を {聞|き}いた {時|とき} の {顔|かお} が 。 || If I open this, the face comes back. That face — the one my teacher had, hearing me say it.
ren: $name 。 …… どう {思|おも}います か 。 {決|き}める の は わたし です が 、 {聞|き}いて おきたい 。 || $name. …What do you think? The choice is mine, but I'd like to hear it.
!choice
* {取|と}り{戻|もど}そう 。 {痛|いた}くて も 、 レン の もの だ 。 || Take it back. Even if it hurts, it's yours. -> rtake
* {置|お}いて いこう 。 {教|おし}え は 、 もう {持|も}って いる 。 || Leave it. You already have the lessons. -> rleave
* レン が {決|き}めて 。 どっち でも 、 {一緒|いっしょ} に いる 。 || You decide. Either way, I'm here. -> ryours
:ryours
ren[smile]: …… ずるい です ね 。 そう {言|い}われたら 、 {開|ひら}ける しか ない 。 || …That's unfair. Put like that, I have to open it.
!goto ropen
:rtake
ren: …… はい 。 {師匠|ししょう} も 、 たぶん そう {言|い}います 。 {逃|に}げる な 、 と 。 || …Yes. My teacher would probably say the same. Don't run from it.
:ropen
!set sa_ren_took sa_ren_decided
!quest ren_ushio done
!music companion_ren
narr: レン は {綴|つづ}り を {開|ひら}いた 。 || Ren opens the folio.
narr: {紙|かみ} の {上|うえ} に 、 {誰|だれ}か の {顔|かお} が {浮|う}かぶ 。 {太|ふと}い {眉|まゆ} 。 {笑|わら}う と 、 {目|め} が {消|き}える 。 {左|ひだり} の {頬|ほお} に 、 {墨|すみ} の {跡|あと} 。 || On the paper, a face surfaces. Heavy eyebrows. Eyes that vanish when it smiles. An ink smudge on the left cheek.
ren: 「 {勝手|かって} に しろ 。 {二度|にど} と {帰|かえ}って くるな 。 」 || "Do what you like. Don't ever come back."
sa_ushio[smile]: {分|わ}かった 。 {灯|ひ} は {頼|たの}んだ 。 || All right. I'm counting on you for the lamps.
narr: {声|こえ} が {消|き}える 。 {顔|かお} は 、 {消|き}えなかった 。 || The voice fades. The face does not.
!challenge sa.ren_reply
ren[sad]: …… {笑|わら}って いた 。 あの {時|とき} 、 {師匠|ししょう} は {笑|わら}って いた 。 || …Smiling. My teacher was smiling, then.
ren: 「 {分|わ}かった 」 は 、 「 {帰|かえ}らない 」 じゃ なかった 。 「 {灯|ひ} を {頼|たの}む 」 だった 。 {七年|ななねん} 、 {逆|ぎゃく} に {読|よ}んで いた 。 || "All right" didn't mean "I won't come back." It meant "look after the lamps." For seven years I read it the wrong way round.
ren[smirk]: …… {眉|まゆ} が 、 {思|おも}って いた より {太|ふと}い 。 || …The eyebrows are thicker than I imagined.
narr: レン は {眼鏡|めがね} を {外|はず}して 、 {長|なが}い こと {拭|ふ}いて いた 。 {拭|ふ}く {必要|ひつよう} が ない くらい {長|なが}く 。 || Ren takes off their glasses and cleans them for a long time. Much longer than they need cleaning.
!music sorrow
!end
:rleave
!set sa_ren_left sa_ren_decided
!quest ren_ushio done
ren: …… そう です ね 。 {教|おし}え は 、 {全部|ぜんぶ} ここ に ある 。 {顔|かお} を {取|と}り{戻|もど}して も 、 {口論|こうろん} を {取|と}り{消|け}せる わけ じゃ ない 。 || …Yes. The lessons are all here. Taking back the face wouldn't unsay the quarrel.
ren[closed]: {師匠|ししょう} の {札|ふだ} に も 、 「 {選|えら}ぶ まで 」 と あります 。 {今|いま} は 、 {選|えら}ばない こと を {選|えら}びます 。 {逃|に}げる の と は 、 {少|すこ}し {違|ちが}う と {思|おも}いたい 。 || My teacher's label says "until the person chooses". For now, I choose not to choose. I'd like to think that's a little different from running away.
ren[smile]: いつか 、 {取|と}り に {来|き}ます 。 {道|みち} に {迷|まよ}わなければ 。 || Someday I'll come back for it. If I don't get lost on the way.
!end
:after
narr: レン の {棚|たな} 。 {札|ふだ} の {字|じ} が 、 {少|すこ}し だけ {右|みぎ} に {跳|は}ねて いる 。 || Ren's shelf. The writing on the label kicks up slightly to the right.

@scene sa.study_enter
# Staged: you look over to the one old keeper's lamp burning and lean in to the slip on the desk; your companion's
# own answer (Ren turns to their teacher's lamp and stays turned, Nao points to the stair up, Mio leans in to the
# two teacups, Suzu looks away).
!autosave
!gesture pc lookroad 10,3
narr: {狭|せま}い {書斎|しょさい} 。 {灯|ひ} が {一|ひと}つ だけ {点|つ}いて いる 。 {古|ふる}い {灯守|ひもり} の {灯|ひ} だ 。 || A narrow study. Only one light burns: an old lantern keeper's lamp.
!gesture pc observe prop:desk
narr: {机|つくえ} の {上|うえ} に 、 {文鎮|ぶんちん} で {押|お}さえた {小|ちい}さな {紙|かみ} 。 {上|うえ} へ {続|つづ}く {階段|かいだん} 。 || On the desk, a small slip of paper under a paperweight. A stair leading up.
?(comp=ren) !gesture comp listen 10,3 hold
?(comp=ren) ren[surprise]: …… {師匠|ししょう} の {灯|ひ} だ 。 || …That's my teacher's lamp.
?(comp=nao) !gesture comp point 7,1
?(comp=nao) nao: {出口|でぐち} は {三|みっ}つ 。 {下|した} 、 {西|にし} 、 {上|うえ} 。 …… {上|うえ} が {本命|ほんめい} だ な 。 {西|にし} の {扉|とびら} は 、 こっち から {開|あ}けられ そう だ 。 || Three exits. Down, west, up. …Up's the one that matters. And the west door looks like it opens from this side.
?(comp=mio) !gesture comp observe 12,8
?(comp=mio) mio: {湯呑|ゆの}み が {二|ふた}つ 。 {片方|かたほう} に は 、 {埃|ほこり} が {積|つ}もってる 。 || Two teacups. One has a layer of dust in it.
?(comp=suzu) !gesture comp aside
?(comp=suzu) suzu: {楽屋|がくや} みたい 。 {主役|しゅやく} が {一人|ひとり} で {泣|な}く {場所|ばしょ} 。 || Like a dressing room. The place the lead goes to cry alone.
!quest sa_main 5
!journal カサネ の {書斎|しょさい} に {着|つ}いた 。 {上|うえ} の {階段|かいだん} は 「 {芯|しん} 」 へ {続|つづ}く 。 {西|にし} の {扉|とびら} は {閲覧室|えつらんしつ} へ の {近道|ちかみち} だ 。 || Reached Kasane's study. The stair leads up to the Heart; the west door is a short way back to the Reading Room.

@scene sa.study_desk
# Staged: you bend to the slip under the paperweight, then hold it and read the form on its back; your companion's
# own answer (Nao points to the slip in your hand, Mio leans in to its worn corners, Ren's hand to the chin, Suzu's
# open hand). Taken: you lean in to the paperweight.
!if item.sa_toya_reply -> have
!gesture pc bend prop:desk
narr: {文鎮|ぶんちん} の {下|した} に 、 {小|ちい}さな {紙|かみ} 。 {上|うえ} を {向|む}いた {面|めん} に 、 {急|いそ}いだ {若|わか}い {字|じ} で 、 {四語|よんご} 。 || Under the paperweight, a small slip of paper. On the side facing up, four words in a hurried young hand.
narr: 「 {必要|ひつよう}なら {開|あ}ける 。 」 || "If needed, open."
!gesture pc read prop=paper hold
narr: {裏|うら} を {返|かえ}す 。 {印刷|いんさつ} された {書式|しょしき} に 、 {几帳面|きちょうめん} な {字|じ} 。 「 {鐘楼|しょうろう} {鍵|かぎ} {持|も}ち{出|だ}し ── {使|つか}い トウヤ 。 {許可|きょか} なし 。 {書記|しょき} カサネ 」 || You turn it over. A printed form, filled in with a meticulous hand: "Bell tower key taken out — messenger Tōya. Without permission. Clerk Kasane."
narr: {四語|よんご} の {面|めん} は 、 {何度|なんど} も {触|さわ}られて {柔|やわ}らかい 。 {書式|しょしき} の {面|めん} は 、 {新|あたら}しい まま だ 。 || The side with the four words has gone soft from handling. The form side is as crisp as new.
!give sa_toya_reply
?(comp=nao) !gesture comp point pc
?(comp=nao) nao: {高瀬|たかせ} の {返事|へんじ} と 、 {一字|いちじ} {一句|いっく} {同|おな}じ だ 。 …… でも 、 {書|か}いて ある {紙|かみ} が {違|ちが}う 。 {鍵|かぎ} の {控|ひか}え の {裏|うら} だ 。 || Word for word the same as Takase's reply. …But look what it's written on. The back of the key slip.
?(comp=mio) !gesture comp observe pc
?(comp=mio) mio: {何度|なんど} も {触|さわ}った {跡|あと} 。 {薬|くすり} の {瓶|びん} と {同|おな}じ 。 {一番|いちばん} {使|つか}う もの は 、 {角|かど} が {丸|まる}く なる 。 || Worn from handling. Like medicine bottles — the ones you use most get rounded corners.
?(comp=ren) !gesture comp chin
?(comp=ren) ren: {主語|しゅご} も {目的語|もくてきご} も ない 。 {書|か}き{置|お}き なら {珍|めずら}しく ない の です が 。 …… {表|おもて} を {見|み}ない で {読|よ}む と 、 {読|よ}めません 。 || No subject, no object. Nothing unusual in a note. …But if you read it without looking at the front, you can't read it.
?(comp=suzu) !gesture comp palm pc
?(comp=suzu) suzu: {台本|だいほん} の {一行|いちぎょう} だけ {渡|わた}されて 、 {芝居|しばい} を しろ って {言|い}われた {気分|きぶん} 。 …… {裏|うら} に {配役|はいやく} が {書|か}いて ある けど ね 。 || Like being handed one line of a script and told to perform the play. …Though there's a cast list on the back.
!end
:have
!gesture pc observe prop:desk
narr: {文鎮|ぶんちん} だけ が 、 {机|つくえ} に {残|のこ}って いる 。 {押|お}さえる もの は 、 もう ない 。 || Only the paperweight remains on the desk, with nothing left to hold down.

@scene sa.study_lamp
narr: {灯守|ひもり} の {灯|ひ} 。 {去年|きょねん} の {冬|ふゆ} から 、 {誰|だれ}か が {油|あぶら} を {足|た}し{続|つづ}けて いる らしい 。 || A lantern keeper's lamp. Someone has kept it topped up with oil since last winter.
?(comp=ren) ren: {磨|みが}き{方|かた} が {雑|ざつ} です 。 {内側|うちがわ} に {曇|くも}り が {残|のこ}って いる 。 …… でも 、 {毎日|まいにち} {磨|みが}いて いる 。 {下手|へた} な {人|ひと} の {磨|みが}き{方|かた} で 、 {毎日|まいにち} 。 || The polishing's sloppy. There's cloudiness left on the inside of the glass. …But it's been polished every day. Badly, every day.
?(!comp=ren) narr: {火屋|ほや} に 、 {小|ちい}さな {札|ふだ} 。 「 ウシオ 。 {消|け}さない こと 。 」 || On the glass chimney, a small tag: "Ushio. Do not put out."

@scene sa.study_bed
narr: {細|ほそ}い {寝台|しんだい} 。 {毛布|もうふ} は {畳|たた}まれた まま で 、 {使|つか}った {跡|あと} が ほとんど ない 。 || A narrow bed. The blanket is still folded; it has barely been slept in.
?(comp=mio) mio[angry]: …… {寝|ね}て ない 。 {何年|なんねん} も 、 {椅子|いす} で {寝|ね}てる 。 {背中|せなか} が {悪|わる}く なる のに 。 || …They don't sleep. For years they've been sleeping in a chair. It'll ruin their back.

@scene sa.study_objections
# Staged: you lean in to the boxes of objections and read the ones you draw out; your companion's own answer (Nao's
# hand to the satchel of kept labels, Mio's laugh at the weak tea, Ren's head goes down over their teacher's hand,
# Suzu looks away).
!gesture pc observe prop:shelf
narr: {箱|はこ} が {並|なら}んで いる 。 {札|ふだ} に は 「 {反対|はんたい} ── ウシオ 」 。 {日付|ひづけ} {順|じゅん} に 、 {六年|ろくねん} {分|ぶん} 。 || A row of boxes, labelled "Objections — Ushio", filed by date. Six years' worth.
!gesture pc read prop=paper hold
narr: {一枚|いちまい} {引|ひ}き{抜|ぬ}く 。 「 {忘|わす}れる {権利|けんり} と 、 {忘|わす}れさせる {権利|けんり} は 、 {別|べつ} の もの だ 。 」 || You draw one out. "The right to forget and the right to make others forget are two different things."
narr: もう {一枚|いちまい} 。 「 お{前|まえ} の {茶|ちゃ} は {薄|うす}い 。 」 || Another. "Your tea is weak."
narr: もう {一枚|いちまい} 。 「 お{前|まえ} を {大事|だいじ} に {思|おも}う から こそ 、 {反対|はんたい} する 。 {毎日|まいにち} だ 。 {覚悟|かくご} しろ 。 」 || Another. "It's precisely because I think well of you that I object. Every day. Brace yourself."
narr: {静寂|しじま} は 、 この {箱|はこ} に だけ は {触|ふ}れて いない 。 || The Hush hasn't touched a single one of these boxes.
?(comp=nao) !gesture comp strap
?(comp=nao) nao: {反対|はんたい} の {手紙|てがみ} を 、 {全部|ぜんぶ} {取|と}って ある 。 …… {捨|す}てられなかった ん だ な 。 {分|わ}かる よ 。 || Every letter of objection, kept. …Couldn't throw them out. I get that.
?(comp=mio) !gesture comp laugh
?(comp=mio) mio[laugh]: 「 お{前|まえ} の {茶|ちゃ} は {薄|うす}い 」 。 …… {確|たし}か に 、 {大事|だいじ} な {反対|はんたい} だ 。 || "Your tea is weak." …Now that's an important objection.
?(comp=ren) !gesture comp lowered
?(comp=ren) ren[closed]: {師匠|ししょう} の {字|じ} です 。 {全部|ぜんぶ} 。 …… {六年|ろくねん} {分|ぶん} 、 {毎日|まいにち} 。 {変|か}わって いない 。 || My teacher's handwriting. All of it. …Six years of it, every day. Unchanged.
?(comp=suzu) !gesture comp aside
?(comp=suzu) suzu: {批評|ひひょう} を {全部|ぜんぶ} {取|と}って おく {役者|やくしゃ} は 、 {伸|の}びる よ 。 …… {遅|おそ}すぎた けど 。 || Actors who keep every review get better. …Too late, in this case.

@scene sa.study_notebook
# Staged: you bend to the battered notebook and read it; with Ren, they trim their lamp's wick the way it is written;
# otherwise you look to the west door, the short way to the Reading Room. Taken: you lean in to the gap in the dust.
!if item.sa_ushio_notes -> have
!gesture pc bend prop:bookpile
narr: {本|ほん} の {山|やま} の {上|うえ} に 、 {擦|す}り{切|き}れた {手帳|てちょう} 。 {表紙|ひょうし} に 「 ウシオ 」 。 || On top of the book pile, a battered notebook. On the cover: "Ushio".
!gesture pc read prop=book hold
narr: {中|なか} は 、 {反対|はんたい} の {下書|したが}き と 、 {茶|ちゃ} の {淹|い}れ{方|かた} と 、 {雨|あめ} の {日|ひ} の {芯|しん} の {切|き}り{方|かた} 。 {後|うし}ろ の ほう に 、 「 {係|かかり} へ 」 。 || Inside: drafts of objections, how to brew tea, how to trim a wick on a rainy day. Near the back: "For the clerk."
!give sa_ushio_notes
!if quest.sa_clerk=active -> q
narr: {名前|なまえ} が {三|みっ}つ {書|か}いて ある 。 {誰|だれ} の ため の もの か は 、 {閲覧室|えつらんしつ} で {分|わ}かる かも しれない 。 || Three names are written there. Who they're for, the Reading Room might tell you.
!end
:q
!quest sa_clerk 1
?(comp=ren) !gesture comp tendlamp
?(comp=ren) ren: 「 {雨|あめ} の {日|ひ} の {芯|しん} の {切|き}り{方|かた} 」 。 わたし が {教|おそ}わった の と 、 {同|おな}じ {書|か}き{方|かた} です 。 || "How to trim a wick on a rainy day." Written exactly the way I was taught it.
?(!comp=ren) !gesture pc lookroad 0,6
?(!comp=ren) narr: {係|かかり} の {名前|なまえ} の {件|けん} だ 。 {閲覧室|えつらんしつ} へ {持|も}って いこう 。 {西|にし} の {扉|とびら} から {近|ちか}い 。 || It's about the clerk's name. Take it to the Reading Room — the west door is the short way.
!end
:have
!gesture pc observe prop:bookpile
narr: {本|ほん} の {山|やま} 。 {一番|いちばん} {上|うえ} に あった {手帳|てちょう} の {形|かたち} に 、 {埃|ほこり} が {抜|ぬ}けて いる 。 || The book pile. A notebook-shaped gap in the dust where the notebook lay.

@scene sa.study_cups
# Staged: you lean in to the two teacups and bend to the name at the bottom of the dusty one; your companion's own
# answer (Mio's head goes down, Nao looks between the cups and you, Ren leans in to the chipped rim, Suzu's head
# goes down).
!gesture pc observe prop:smalltable
narr: {小|ちい}さな {卓|たく} に 、 {湯呑|ゆの}み が {二|ふた}つ 。 {一|ひと}つ は {使|つか}われて いる 。 もう {一|ひと}つ に は 、 {埃|ほこり} 。 || Two teacups on a little table. One is in use. The other has dust in it.
!gesture pc bend prop:smalltable
narr: {埃|ほこり} の ほう の {底|そこ} に 、 {墨|すみ} で 「 ウシオ 」 。 || At the bottom of the dusty one, in ink: "Ushio".
?(comp=mio) !gesture comp lowered
?(comp=mio) mio[sad]: ハナ さん の {湯呑|ゆの}み と {同|おな}じ だ 。 {来|こ}ない {人|ひと} の {分|ぶん} まで 、 {出|だ}して おく 。 || It's just like Hana's teacups. Setting one out for someone who won't come.
?(comp=nao) !gesture comp lookbetween prop:smalltable and=pc
?(comp=nao) nao: {二|ふた}つ {目|め} の {湯呑|ゆの}み か 。 {葦|あし}ノ{瀬|せ} から ずっと 、 {同|おな}じ {話|はなし} を {追|お}いかけてる {気|き} が する 。 || A second teacup. Feels like we've been chasing the same story all the way from Reedwake.
?(comp=ren) !gesture comp observe prop:smalltable
?(comp=ren) ren[closed]: …… {師匠|ししょう} の {湯呑|ゆの}み です 。 {縁|ふち} の {欠|か}け{方|かた} で 、 {分|わ}かります 。 || …My teacher's cup. I can tell by the chip on the rim.
?(comp=suzu) !gesture comp lowered
?(comp=suzu) suzu: {空|あ}いた {席|せき} 。 …… {灰実|はいみ}の{里|さと} の お{祭|まつ}り の {席|せき} と 、 {同|おな}じ {顔|かお} を してる 。 || An empty seat. …It has the same look as the empty seat at the Cinder Orchard festival.

@scene sa.shortcut_open
# Staged: you look over the bolted west door and draw the bolt; Nao's nod at one more exit, Ren glances away.
!gesture pc observe prop:sa_door
narr: {西|にし} の {扉|とびら} 。 こちら {側|がわ} に {閂|かんぬき} が かかって いる 。 || The west door, bolted on this side.
!gesture pc bend prop:sa_door
narr: {閂|かんぬき} を {外|はず}す と 、 {扉|とびら} の {向|む}こう は {閲覧室|えつらんしつ} だった 。 {遠回|とおまわ}り しなくて も 、 {戻|もど}れる 。 || You draw the bolt. On the other side is the Reading Room — a short way back.
!set sa_shortcut
!sfx door
!toast {閲覧室|えつらんしつ} へ の {近道|ちかみち} が {開|ひら}いた || A shortcut to the Reading Room is open.
?(comp=nao) !gesture comp nod
?(comp=nao) nao: {出口|でぐち} が {一|ひと}つ {増|ふ}えた 。 {気分|きぶん} が いい 。 || One more exit. That's better.
?(comp=ren) !gesture comp aside
?(comp=ren) ren: {近道|ちかみち} です 。 これ で {迷|まよ}い{様|よう} が ありません 。 …… {言|い}わない ほう が よかった かも しれません 。 || A shortcut. Now there's no way to get lost. …Perhaps I shouldn't have said that out loud.
`, 'ch6/scenes-archive');
