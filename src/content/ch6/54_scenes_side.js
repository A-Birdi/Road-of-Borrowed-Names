/* Chapter 6: Isamu's side quest, post-story lines for the people of the
 * Archive road, and companion banter on the mountain. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
@scene sa.isamu_first
# Staged: you look at the sunburnt man by the fire; Isamu (sitting) looks up the slope to the Archive, puts a hand to
# his ear for his wife's laugh, his head goes down, and he rubs his cold hands over three days of waiting; your
# companion's own answer (Nao's nod, Mio bends to his cold hands, Ren's open hand, Suzu's shrug); his nod, and a
# breath out over the kettle about to boil.
!gesture pc observe sa_isamu
narr: {焚|た}き{火|び} の {前|まえ} に 、 {日焼|ひや}け した {男|おとこ} が {座|すわ}って いる 。 {手|て} に は 、 {折|お}り{畳|たた}んだ {紙|かみ} 。 || A sunburnt man sits by the fire, a folded paper in his hand.
!gesture sa_isamu lookroad up
sa_isamu: …… {上|うえ} へ {行|い}く の かい 。 {中|なか} に は {入|はい}れる よ 。 {入|はい}れる けど 、 {誰|だれ} も {返事|へんじ} を しない 。 {棚|たな} ばかり だ 。 || …Going up, are you? You can get in. You can — but nobody answers. Nothing but shelves.
sa_isamu: イサム だ 。 {潮硝子|しおがらす} で {網|あみ} を {繕|つくろ}ってる 。 {五年前|ごねんまえ} 、 この {坂|さか} を {登|のぼ}って 、 {預|あず}けた もの が ある 。 || Name's Isamu. I mend nets in Saltglass. Five years ago I climbed this slope and left something up there.
!gesture sa_isamu cupear
sa_isamu: {女房|にょうぼう} の {笑|わら}い{声|ごえ} だ 。 {死|し}んだ {後|あと} 、 {夜|よる} に {頭|あたま} の {中|なか} で {聞|き}こえる の が 、 {辛|つら}くて な 。 || My wife's laugh. After she died, hearing it in my head at night was more than I could take.
!gesture sa_isamu lowered
sa_isamu[sad]: {預|あず}けたら {楽|らく} に なる と {思|おも}った 。 {楽|らく} に は なった 。 …… でも 、 {笑|わら}い{方|かた} を {思|おも}い{出|だ}せない {家|いえ} は 、 {痛|いた}い {家|いえ} より {寒|さむ}い 。 || I thought I'd feel better if I left it. I did. …But a house where you can't remember how she laughed is colder than one that hurts.
!gesture sa_isamu rubhands
sa_isamu: {返|かえ}して くれ って {手紙|てがみ} を {書|か}いた 。 {扉|とびら} に {挟|はさ}んで 、 {三日|みっか} {待|ま}ってる 。 {中|なか} の {棚|たな} は 、 {俺|おれ} に は どれ が どれ だか {分|わ}からん 。 || I wrote asking for it back. Tucked it in the door, and I've waited three days. As for the shelves in there — I can't tell one from another.
?(comp=nao) !gesture comp nod sa_isamu
?(comp=nao) nao: {返事|へんじ} の ない {手紙|てがみ} を {待|ま}つ の は 、 {一番|いちばん} {体|からだ} に {悪|わる}い 。 …… {届|とど}けて やる よ 。 {逆|ぎゃく} {方向|ほうこう} の {配達|はいたつ} だ けど 。 || Waiting on a letter that never gets answered is the worst thing for you. …We'll deliver it. Just in the opposite direction.
?(comp=mio) !gesture comp bend sa_isamu
?(comp=mio) mio: イサム さん 、 {手|て} が {冷|つめ}たい 。 {三日|みっか} も {外|そと} に いた ん です か 。 …… お{茶|ちゃ} を {飲|の}んで 、 {待|ま}って いて ください 。 {探|さが}して きます 。 || Isamu, your hands are ice-cold. Three days out here? …Have some tea and wait. We'll look for it.
?(comp=ren) !gesture comp palm sa_isamu
?(comp=ren) ren: {預|あず}けた もの は 、 {頼|たの}まれたら {返|かえ}す べき です 。 {灯守|ひもり} の {誓|ちか}い と {同|おな}じ です 。 {探|さが}して きます 。 || What's left in someone's keeping should be returned when they ask. It's the same as a lantern keeper's oath. We'll look for it.
?(comp=suzu) !gesture comp shrug
?(comp=suzu) suzu: {預|あず}かり{証|しょう} は ある ？ …… ない 。 だよ ね 。 {大丈夫|だいじょうぶ} 、 {人|ひと} の {忘|わす}れ{物|もの} を {探|さが}す の は 、 {旅芸人|たびげいにん} の {副業|ふくぎょう} だ から 。 || Got a receipt? …No. Of course not. Don't worry — hunting down what people have lost is every travelling player's side job.
!look sa_isamu pc
!gesture sa_isamu nod pc
sa_isamu: {頼|たの}む 。 {目録|もくろく} に は 、 {俺|おれ} の {言葉|ことば} じゃ なく 、 {向|む}こう の {言葉|ことば} で {書|か}いて ある かも しれん が 。 || I'd be grateful. Mind, the catalogue might describe it in their words, not mine.
!gesture sa_isamu exhale
sa_isamu: {笑|わら}い{方|かた} は な …… {沸|わ}く {前|まえ} の やかん みたい だった 。 {低|ひく}く {始|はじ}まって 、 {自分|じぶん} でも {止|と}められなく なる 。 || Her laugh… it was like a kettle just before it boils. It'd start low, and then she couldn't stop it.
!quest sa_isamu start

@scene sa.isamu_wait
sa_isamu: {沸|わ}く {前|まえ} の やかん だ 。 {覚|おぼ}えて おいて くれ 。 …… {変|へん} な {頼|たの}み だ な 。 || A kettle just before it boils. Remember that. …Odd thing to ask, I know.
?(!sa_catalogue_done) sa_isamu: {中|なか} の {目録|もくろく} は 、 {字|じ} が {全部|ぜんぶ} {消|き}えて た 。 {分|わ}かる {人|ひと} に {頼|たの}む しか ない 。 || The catalogue inside had all its writing gone. Needs someone who can make sense of it.

@scene sa.isamu_return
# Staged (Chapter 6 performed interaction): the folio handed over at the fire (the !take stays where it
# is), held, opened; the laugh that comes back; the companion's own small response.
!prop pc folio
!gesture pc handover sa_isamu
!gesture sa_isamu receive pc hold
narr: $name は 、 {綴|つづ}り を イサム に {渡|わた}した 。 || You hand the folio to Isamu.
!gesture sa_isamu present prop=folio hold
sa_isamu: …… これ か 。 {薄|うす}い な 。 {五年|ごねん} {分|ぶん} 、 {重|おも}かった のに 。 || …This is it? It's so thin. It felt five years heavy.
!gesture sa_isamu read prop=folio hold
narr: イサム は 、 ゆっくり {表紙|ひょうし} を {開|ひら}いた 。 || Slowly, Isamu opens the cover.
!gesture comp listen sa_isamu
narr: {焚|た}き{火|び} の {音|おと} に {混|ま}じって 、 {誰|だれ}か が {笑|わら}った 。 {低|ひく}く {始|はじ}まって 、 {止|と}まらなく なる {笑|わら}い{声|ごえ} 。 || Mixed with the crackle of the fire, someone laughs. A laugh that starts low and can't stop.
!gesture sa_isamu lowered hold
sa_isamu[sad]: …… ああ 。 これ だ 。 これ だ よ 。 || …Ah. That's it. That's it.
!gesture sa_isamu exhale
sa_isamu: {痛|いた}い な 。 {痛|いた}い 。 …… {良|よ}かった 。 || It hurts. It hurts. …Good.
?(comp=nao) !gesture comp nod sa_isamu
?(comp=mio) !prop comp cloth
?(comp=mio) !gesture comp present sa_isamu prop=cloth hold
?(comp=ren) !gesture comp nod sa_isamu
?(comp=suzu) !gesture comp size
?(comp=nao) nao: {配達|はいたつ} {完了|かんりょう} 。 …… {受取|うけとり}{印|いん} は {要|い}らない な 。 {顔|かお} に {書|か}いて ある 。 || Delivered. …Don't need a signature. It's written on his face.
?(comp=mio) mio: {手拭|てぬぐ}い 、 どうぞ 。 {二枚|にまい} あります 。 {一枚|いちまい} は わたし の {分|ぶん} です けど 。 || Here, a cloth. I have two. One's for me, mind.
?(comp=ren) ren: {頼|たの}まれた もの を 、 {返|かえ}した 。 …… {定|さだ}め より 、 {少|すこ}し {遅|おそ}く なりました が 。 || Asked for, and returned. …A little later than the charter intended.
?(comp=suzu) suzu: {貸|か}し {借|か}り 、 {一件|いっけん} {清算|せいさん} 。 …… こういう {帳簿|ちょうぼ} の {付|つ}け{方|かた} なら 、 {毎日|まいにち} したい な 。 || One account settled. …I'd keep books like this every day if I could.
?(comp=mio) !prop comp -
?(comp=mio) !gesture comp -
!gesture sa_isamu nod pc
sa_isamu[smile]: {礼|れい} を {言|い}う よ 。 {言葉|ことば} が {足|た}りない が 。 …… {今夜|こんや} は 、 これ を {聞|き}き ながら {寝|ね}る 。 || Thank you. I haven't got the words. …Tonight I'll fall asleep listening to this.
!take sa_folio_isamu
!quest sa_isamu done
!autosave

@scene sa.isamu_after
sa_isamu: {時々|ときどき} 、 {急|きゅう} に {笑|わら}い{声|ごえ} が する んで 、 オヨネ さん が {驚|おどろ}いてる 。 …… {悪|わる}い な 。 {止|と}められない んだ 。 あいつ と {同|おな}じ で 。 || Every so often the laugh comes out of nowhere and startles Oyone. …Sorry. I can't stop it. Just like her.

@scene sa.oyone_post
# Staged: after the ending Oyone points you to the register (up and down, both), and nods over Kasane's letters.
!gesture sa_oyone point prop:table
sa_oyone: おや 、 また {来|き}た の かい 。 {宿帳|やどちょう} に {書|か}き な 。 {上|のぼ}り と {下|くだ}り 、 {両方|りょうほう} ね 。 || Well, back again? Sign the register. Up and down, both.
?(end_archive_library) sa_oyone: {近頃|ちかごろ} は 、 {読|よ}み に {登|のぼ}る {人|ひと} ばかり だ 。 {泣|な}き ながら {登|のぼ}る {人|ひと} は 、 もう {滅多|めった} に いない 。 {笑|わら}い ながら {下|くだ}って くる 。 || These days everyone who climbs up is going to read. Hardly anyone goes up crying any more. They come down laughing.
?(end_archive_closed) sa_oyone: {閉|と}じた {書庫|しょこ} の {鍵|かぎ} は 、 あたし が {預|あず}かってる 。 {開|あ}ける {用|よう} は ない けど ね 。 {誰|だれ}か が {持|も}ってる って だけ で 、 {落|お}ち{着|つ}く {人|ひと} も いる 。 || I keep the key to the closed Archive. Not that anyone needs it opened. Some folk just feel easier knowing someone's holding it.
?(end_mem_choose) sa_oyone: {綴|つづ}り を {取|と}り に {来|く}る {人|ひと} も いる 。 {来|き}て 、 {扉|とびら} の {前|まえ} で {引|ひ}き{返|かえ}す {人|ひと} も いる 。 どっち に も 、 お{茶|ちゃ} を {出|だ}す 。 || Some come for their folios. Some come as far as the door and turn back. Both get tea.
?(end_mem_return) sa_oyone: {全部|ぜんぶ} {返|かえ}した って ね 。 {下|した} の {町|まち} は 、 しばらく {泣|な}き{声|ごえ} だらけ だった そう だ 。 {今|いま} は 、 {笑|わら}い{声|ごえ} の ほう が {多|おお}い と さ 。 || They say everything was given back. The towns were full of crying for a while. More laughing than crying now, I hear.
?(end_kasane_keeper) sa_oyone: カサネ に は 、 {週|しゅう} に {一度|いちど} {飯|めし} を {持|も}って {上|あ}がる 。 {残|のこ}したら {叱|しか}る 。 {三十年|さんじゅうねん} {分|ぶん} 、 {叱|しか}ってる よ 。 || I carry Kasane's food up once a week. If there's anything left on the plate, I give them what for. Thirty years' worth of what for.
?(end_kasane_trial) !gesture sa_oyone nod
?(end_kasane_trial) sa_oyone: カサネ は {灯落|ひおち} で 、 {名前|なまえ} を {書|か}き{写|うつ}してる そう だ 。 {時々|ときどき} {手紙|てがみ} が {来|く}る 。 {字|じ} が 、 {少|すこ}し {下手|へた} に なった 。 いい こと だ よ 。 || Kasane's in Lanternfall copying out names, they say. Letters come now and then. The handwriting's got a bit worse. That's a good sign.
!call sa.oyone_inn

@scene sa.kasane_post
# Staged: after the ending Kasane's open hand of welcome for today's objection; they look over to the readers'
# shelves or to the shut doors; they hold up one of the week's letters, and nod at being asked to tell it again.
!gesture kasane palm pc
kasane[smile]: いらっしゃい 。 {今日|きょう} も 、 {反対|はんたい} を {持|も}って {来|き}て くれました か 。 || Welcome. Have you brought me an objection today?
?(end_archive_library) !gesture kasane lookroad 21,2
?(end_archive_library) kasane: {読|よ}み に {来|く}る {人|ひと} が 、 {毎日|まいにち} {少|すこ}し ずつ {増|ふ}えて います 。 {何|なに} も {取|と}らない {書庫|しょこ} は 、 {思|おも}って いた より {忙|いそが}しい 。 || More readers come every day. An archive that takes nothing is busier than I expected.
?(end_archive_closed) !gesture kasane lookroad 15,8
?(end_archive_closed) kasane: {扉|とびら} は {閉|し}めた まま です 。 それ でも {時々|ときどき} 、 {誰|だれ}か が {来|き}て 、 {門|もん} の {前|まえ} で {話|はなし} を して いきます 。 {怒|おこ}る {人|ひと} も 、 {黙|だま}って {座|すわ}る {人|ひと} も 。 || The doors stay shut. Even so, now and then someone comes and talks with me at the gate. Some are angry. Some just sit in silence.
!look kasane pc
!gesture kasane present pc prop=letter
kasane: {毎週|まいしゅう} 、 {手紙|てがみ} が {届|とど}きます 。 {全部|ぜんぶ} 、 {反対|はんたい} の {手紙|てがみ} です 。 {全部|ぜんぶ} に 、 {返事|へんじ} を {書|か}いて います 。 || Letters come every week. Every one of them an objection. I answer every one.
!choice
* あの {夜|よる} の {話|はなし} を 、 もう {一度|いちど} {聞|き}かせて 。 || Tell me about that night again. -> hist
* また {来|く}る よ 。 || I'll come again. -> end
:hist
!gesture kasane nod pc
kasane: …… ええ 。 {何度|なんど} でも 。 {話|はな}す たび に 、 {少|すこ}し ずつ {違|ちが}う ところ が {見|み}えて きます から 。 || …Yes. As often as you like. Each time I tell it, I see a little more of it.
!activity sa.flood_history

@scene sa.kasane_post_mem
kasane: {今日|きょう} は {二人|ふたり} {来|き}ました 。 {一人|ひとり} は {綴|つづ}り を {持|も}って {帰|かえ}り 、 {一人|ひとり} は {読|よ}んで 、 また {棚|たな} に {戻|もど}して いきました 。 || Two people came today. One took their folio home. The other read theirs, and put it back on the shelf.
kasane[smile]: どちら も 、 {本人|ほんにん} が {選|えら}んだ こと です 。 …… {見|み}て いる だけ で 、 {胸|むね} が いっぱい に なります 。 || Both were their own choice. …Just watching fills my heart.
!call sa.kasane_post

@scene sa.tsuzuri_post
?(end_archive_library) sa_tsuzuri[smile]: ようこそ 、 {名|な} の {図書館|としょかん} へ 。 ツヅリ です 。 {閲覧|えつらん}{番号|ばんごう} は {要|い}りません 。 お{名前|なまえ} だけ で {結構|けっこう} です 。 || Welcome to the library of names. I am Tsuzuri. No call number required. Your name will do.
?(end_archive_library) sa_tsuzuri: {新|あたら}しい {引|ひ}き{出|だ}し を {作|つく}りました 。 「 {嬉|うれ}しい 」 。 もう {三段目|さんだんめ} です 。 || I have made a new drawer: "Glad". It is already on its third tier.
?(end_archive_closed) sa_tsuzuri: ツヅリ は 、 {小屋|こや} で {宿帳|やどちょう} を {付|つ}けて います 。 {上|のぼ}り と {下|くだ}り 。 {分類|ぶんるい} は {二|ふた}つ だけ 。 {快適|かいてき} です 。 || Tsuzuri keeps the register at the hut now. Up and down. Only two categories. Very restful.

@scene sa.clerk_post
# Staged: after the ending the clerk at the camp tilts as it says it still has no name.
!gesture sa_clerk stiff pc
sa_clerk: {当|とう}{書記|しょき} は 、 まだ {名前|なまえ} が ありません 。 ウシオさん の {手帳|てちょう} は 、 オヨネさん が {下|お}ろして くれました 。 || This clerk still has no name. Oyone brought Ushio's notebook down.
!if item.sa_ushio_notes -> name
!give sa_ushio_notes
:name
!call sa.clerk_name

@scene sa.reader_gate
sa_reader: {祖母|そぼ} の {旧姓|きゅうせい} を {調|しら}べ に {来|き}た ん です 。 {写|うつ}し が 、 ちゃんと ありました ！ || I came to look up my grandmother's maiden name. There was a copy!
sa_reader: {中庭|なかにわ} で は 、 {川|かわ} の {名前|なまえ} の {読|よ}み{方|かた} で {誰|だれ}か が {揉|も}めて います 。 {楽|たの}しそう です よ 。 || Out in the courtyard, people are arguing over how to read the name of a river. They seem to be enjoying it.

@scene sa.reader_room
sa_reader: お{静|しず}か に 。 …… と {言|い}いたい ところ です が 、 わたし も さっき {笑|わら}って しまいました 。 {昔|むかし} の {恋文|こいぶみ} の {写|うつ}し が {出|で}て きて 。 || Quiet, please. …Is what I'd like to say, but I laughed out loud a moment ago myself. A copy of an old love letter turned up.

@scene sa.b_nao1
nao: {灯落|ひおち} で 、 ウミ に {手紙|てがみ} を {渡|わた}した だろ 。 …… {返事|へんじ} 、 {来|く}る と {思|おも}う か ？ || We gave Umi that letter in Lanternfall. …Think she'll write back?
nao: {来|こ}なくて も いい んだ 。 {来|こ}なくて いい 。 …… そう {思|おも}える よう に なった の は 、 {最近|さいきん} だ けど 。 || It's fine if she doesn't. It's fine. …Though I only came round to thinking that recently.
pc: ナオ は 、 {変|か}わった ね 。 || You've changed, Nao.
nao[smirk]: {変|か}わって ない 。 {宛名|あてな} が {読|よ}める よう に なった だけ だ 。 {自分|じぶん} の な 。 || Haven't changed. I can just read the address now. My own.

@scene sa.b_nao2
nao: ここ の {札|ふだ} の {字|じ} 、 {全部|ぜんぶ} カサネ の {字|じ} だ 。 {几帳面|きちょうめん} すぎる 。 || All the writing on these labels is Kasane's. Too neat.
nao: {急|いそ}いで {誰|だれ}か に {何|なに}か を {伝|つた}えた こと が ない {字|じ} だ 。 …… いや 、 {逆|ぎゃく} か 。 {二度|にど} と {読|よ}み{違|ちが}えられたく ない {人|ひと} の {字|じ} だ 。 || The writing of someone who's never had to rush a message to anyone. …No — the opposite. The writing of someone who never wants to be misread again.
nao[think]: {字|じ} は {嘘|うそ} を つかない 。 {配達|はいたつ} を やってる と 、 {分|わ}かる 。 || Handwriting doesn't lie. You learn that, doing deliveries.

@scene sa.b_nao3
nao: カサネ が {最初|さいしょ} に {預|あず}けた の は 、 {自分|じぶん} の {言葉|ことば} だった 。 {取|と}り{消|け}したい {言葉|ことば} 。 || The first thing Kasane set down was their own words. The words they wanted to take back.
nao: …… こっち は 、 {書|か}き{直|なお}した ラベル を {全部|ぜんぶ} {取|と}って ある 。 {捨|す}てられない 。 {逆|ぎゃく} の {病気|びょうき} だ な 。 || …Me, I've kept every label I ever rewrote. Can't throw them out. The opposite affliction.
pc: どっち も 、 {言葉|ことば} を {大事|だいじ} に してる 。 || You both take words seriously.
nao[shy]: …… そう {言|い}われる と 、 {反論|はんろん} できない な 。 || …Put like that, I can't argue.

@scene sa.b_nao4
nao: $name の {好|す}き な ところ 、 {一|ひと}つ {言|い}って やろう か 。 || Want to know one thing I like about you?
nao[smirk]: {手紙|てがみ} を 、 {最後|さいご} まで {読|よ}む ところ 。 {裏|うら} まで な 。 …… {配達人|はいたつにん} {以外|いがい} で 、 そう いう {奴|やつ} は {珍|めずら}しい 。 || You read letters all the way through. Both sides of the paper. …Rare, in anyone who isn't a courier.

@scene sa.b_mio1
mio: {山|やま} の {空気|くうき} は 、 {肺|はい} に は いい けど 、 {膝|ひざ} に は {悪|わる}い 。 …… {覚|おぼ}えて おいて ね 。 {後|あと} で {文句|もんく} を {言|い}う から 。 || Mountain air: good for the lungs, bad for the knees. …Remember I said so. I'll be complaining later.
narr: ミオ は {歩|ある}き ながら 、 {薬|くすり} の {瓶|びん} の {向|む}き を {揃|そろ}えて いる 。 {揃|そろ}って いた のに 。 || As she walks, Mio straightens the bottles in her bag. They were already straight.
mio[shy]: …… {考|かんが}え{事|ごと} を する と 、 {手|て} が {勝手|かって} に 。 {上|うえ} に {着|つ}いたら 、 {何|なに} を {言|い}う か 、 {考|かんが}えて た の 。 || …When I'm thinking, my hands do this on their own. I was working out what to say when we get to the top.

@scene sa.b_mio2
mio: いいえ 。 …… いいえ 。 || No. …No.
pc: {何|なに} を してる の ？ || What are you doing?
mio[shy]: {練習|れんしゅう} 。 {上|うえ} で 、 {言|い}わなきゃ いけない から 。 {灯落|ひおち} で {一度|いちど} {言|い}えた けど 、 {一度|いちど} で {慣|な}れる {言葉|ことば} じゃ ない の 。 || Practising. I'll have to say it up there. I managed it once in Lanternfall, but it's not a word you get used to after one go.
mio[laugh]: …… {笑|わら}わない で よ 。 {真剣|しんけん} な ん だ から 。 いいえ 。 ほら 、 {今|いま} の は {上手|じょうず} だった 。 || …Don't laugh. I'm serious. No. See — that one was good.

@scene sa.b_mio3
mio: $name 。 {変|へん} な こと {聞|き}く けど 。 {今|いま} から {戦|たたか}う {相手|あいて} に 、 ご{飯|はん} を {食|た}べさせたい って {思|おも}う の は 、 {間違|まちが}ってる ？ || $name. Strange question. Is it wrong to want to feed the person you're about to fight?
mio: あの {寝台|しんだい} 、 {使|つか}った {跡|あと} が なかった 。 {何年|なんねん} も 、 {椅子|いす} で {寝|ね}てる 。 {薬師|くすし} と して 、 {放|ほう}って おけない 。 || That bed had never been slept in. For years they've been sleeping in a chair. As an apothecary, I can't leave that alone.
mio[angry]: …… でも 、 それ と これ は {別|べつ} 。 {止|と}める 。 {食|た}べさせる の は 、 {止|と}めて から 。 || …But that's a separate matter. We stop them. Feeding comes after.

@scene sa.b_mio4
mio: {上|うえ} で 、 {大事|だいじ} な こと に 「 いいえ 」 って {言|い}えた 。 || Up there, I said no to something that mattered.
mio[smile]: {空|そら} は {落|お}ちて こなかった 。 {誰|だれ} も {嫌|きら}い に ならなかった 。 …… {少|すこ}し 、 {拍子抜|ひょうしぬ}け 。 || The sky didn't fall. Nobody stopped liking me. …It's almost a letdown.

@scene sa.b_ren1
ren: {師匠|ししょう} の {教|おし}え を 、 {一|ひと}つ ずつ {数|かぞ}えて いました 。 {灯|ひ} の {名|な} の {書|か}き{方|かた} 。 {雨|あめ} の {日|ひ} の {芯|しん} の {切|き}り{方|かた} 。 {迷|まよ}ったら 、 {音|おと} の する ほう へ 。 || I've been counting my teacher's lessons, one by one. How to write a lantern's name. How to trim a wick on a rainy day. When lost, go toward the sound.
ren[think]: この {山|やま} の {灯籠|とうろう} は 、 {名前|なまえ} は ある のに {約束|やくそく} が ない 。 {師匠|ししょう} が {見|み}たら 、 {黙|だま}って {書|か}き{直|なお}し{始|はじ}める でしょう 。 {文句|もんく} を {言|い}い ながら 。 || The lanterns on this mountain have names but no promises. My teacher would start rewriting them without a word. Well — complaining the whole time.

@scene sa.b_ren2
ren: {書架|しょか} の {列|れつ} を {二回|にかい} {数|かぞ}えました 。 {答|こた}え が {違|ちが}いました 。 || I've counted the aisles in the Stacks twice. I got two different answers.
ren[smirk]: {建物|たてもの} が {動|うご}いて いる と {考|かんが}える こと に しました 。 その ほう が 、 {精神|せいしん} に いい 。 || I've decided the building is moving. It's better for my peace of mind.
pc: {数|かぞ}え{間違|まちが}い じゃ ない の ？ || Couldn't you have just miscounted?
ren: …… その {可能性|かのうせい} は 、 {検討|けんとう} いたしかねます 。 || …I'm unable to entertain that possibility.

@scene sa.b_ren3
ren: カサネ さん が {彫|ほ}った {墓石|はかいし} 。 {字|じ} が 、 よかった 。 || The gravestone Kasane carved. The lettering was good.
ren[closed]: それ が 、 {一番|いちばん} {腹|はら} が {立|た}ちます 。 {敬意|けいい} の ある {字|じ} を {書|か}ける {人|ひと} が 、 どうして …… と 。 || That's what makes me angriest. That someone who can write with that much respect could still…
ren: …… {師匠|ししょう} も 、 {六年|ろくねん} 、 {同|おな}じ こと を {思|おも}って いた の かも しれません 。 だから {帰|かえ}らなかった 。 {反対|はんたい} し{続|つづ}ける ため に 。 || …Perhaps my teacher thought the same, for six years. And that's why they never came home. To keep on disagreeing.

@scene sa.b_ren4
ren: {階段|かいだん} で 、 {靴|くつ} の {底|そこ} が {抜|ぬ}けました 。 || The sole of my boot gave out on the stairs.
ren[smirk]: {灯|ひ} は {無事|ぶじ} です 。 {優先|ゆうせん}{順位|じゅんい} は {正|ただ}しかった 。 || The lamp is unharmed. My priorities were correct.
pc: …… {靴|くつ} も {磨|みが}いたら ？ || …Maybe polish your boots too?
ren: {検討|けんとう} します 。 {善処|ぜんしょ} します 。 …… {今|いま} の は 、 {曖昧|あいまい} の {引|ひ}き{出|だ}し {行|い}き です ね 。 || I'll consider it. I'll do what I can. …Those two go straight in the "vague" drawer, don't they.

@scene sa.b_suzu1
suzu: この {山|やま} が {借|か}りてる もの 、 {数|かぞ}えて みよう か 。 {名前|なまえ} 、 {約束|やくそく} 、 {言|い}い{争|あらそ}い 、 {声|こえ} 。 || Shall we tally up what this mountain owes? Names, promises, quarrels, voices.
suzu[think]: …… {利子|りし} の {計算|けいさん} で 、 {指|ゆび} が {足|た}りなく なった 。 {帳簿|ちょうぼ} を {持|も}って くれば よかった 。 || …I've run out of fingers calculating the interest. Should have brought the ledger.
suzu[smile]: {冗談|じょうだん} は ここ まで 。 {本気|ほんき} で {取|と}り{立|た}て に {行|い}く よ 。 {全部|ぜんぶ} 、 {持|も}ち{主|ぬし} に {返|かえ}して もらう 。 || Enough joking. I mean to collect. Every last thing goes back to its owner.

@scene sa.b_suzu2
suzu: {閲覧室|えつらんしつ} の {音|おと} 、 {聞|き}いた ？ {小声|こごえ} でも 、 {一番|いちばん} {後|うし}ろ の {席|せき} まで {届|とど}く 。 || Did you hear the acoustics in the Reading Room? A whisper would carry to the back row.
suzu[smirk]: {最高|さいこう} の {劇場|げきじょう} で 、 {最悪|さいあく} の {秘密|ひみつ} の {隠|かく}し{場所|ばしょ} だ ね 。 …… {内緒話|ないしょばなし} は 、 {外|そと} で しよう 。 || Perfect theatre. Terrible place to keep a secret. …Save any confidences for outside.

@scene sa.b_suzu3
suzu: {静寂|しじま} って 、 {一番|いちばん} {居心地|いごこち} の いい {嘘|うそ} だ よ ね 。 {何|なに} も {悪|わる}く ない 。 {何|なに} も ない から 。 || The Hush is the comfiest lie there is. Nothing's wrong — because nothing's there.
suzu[closed]: わたし も 、 ヒロ に {同|おな}じ よう な {嘘|うそ} を ついた 。 「 {春|はる} に なったら {帰|かえ}って くる 」 。 {優|やさ}しい {嘘|うそ} は 、 {長|なが}く {持|も}ちすぎる と 、 {誰|だれ}か の {席|せき} を {一|ひと}つ 、 {空|から} に する 。 || I told Hiro that kind of lie once. "She'll be back in spring." A kind lie that lasts too long leaves somebody's seat empty.
suzu[smile]: …… だから 、 {今日|きょう} は {嘘|うそ} なし で {行|い}く 。 {台本|だいほん} なし 。 {即興|そっきょう} だ よ 。 || …So today, no lies. No script. We're improvising.

@scene sa.b_suzu4
suzu: {帳簿|ちょうぼ} 、 {付|つ}けた よ 。 {今日|きょう} {返|かえ}った もの ： {町|まち} {五|いつ}つ {分|ぶん} の {名前|なまえ} と 、 「 いいえ 」 と 、 {笑|わら}い{声|ごえ} {一|ひと}つ 。 || I've done the books. Returned today: five towns' worth of names, a "no", and one laugh.
suzu[laugh]: {黒字|くろじ} だ 。 {大|だい}{黒字|くろじ} 。 …… こんな {帳簿|ちょうぼ} 、 {一生|いっしょう} に {一度|いちど} で いい 。 {額|がく} に {入|い}れて {飾|かざ}る 。 || In the black. Deep in the black. …One ledger like this in a lifetime is plenty. I'm framing it.
`, 'ch6/scenes-side');

RB.content.banter.push(
  { comp: 'nao', map: 'sa.*', if: '!sa_met_kasane', scene: 'sa.b_nao1' },
  { comp: 'nao', map: 'sa.*', if: 'sa_met_kasane&!sa_hush_down', scene: 'sa.b_nao2' },
  { comp: 'nao', map: 'sa.*', if: 'seen.sa.shelf_kasane&!sa_hush_down', scene: 'sa.b_nao3' },
  { comp: 'nao', map: 'sa.*', if: 'sa_hush_down', scene: 'sa.b_nao4' },
  { comp: 'mio', map: 'sa.*', if: '!sa_met_kasane', scene: 'sa.b_mio1' },
  { comp: 'mio', map: 'sa.*', if: 'sa_met_kasane&!sa_hush_down', scene: 'sa.b_mio2' },
  { comp: 'mio', map: 'sa.*', if: 'seen.sa.study_bed&!sa_hush_down|seen.sa.study_enter&!sa_hush_down', scene: 'sa.b_mio3' },
  { comp: 'mio', map: 'sa.*', if: 'sa_hush_down', scene: 'sa.b_mio4' },
  { comp: 'ren', map: 'sa.*', if: '!sa_met_kasane', scene: 'sa.b_ren1' },
  { comp: 'ren', map: 'sa.*', if: 'seen.sa.stacks_enter&!sa_hush_down', scene: 'sa.b_ren2' },
  { comp: 'ren', map: 'sa.*', if: 'sa_ushio_found&!sa_hush_down', scene: 'sa.b_ren3' },
  { comp: 'ren', map: 'sa.*', if: 'sa_hush_down', scene: 'sa.b_ren4' },
  { comp: 'suzu', map: 'sa.*', if: '!sa_met_kasane', scene: 'sa.b_suzu1' },
  { comp: 'suzu', map: 'sa.*', if: 'sa_met_kasane&!sa_hush_down', scene: 'sa.b_suzu2' },
  { comp: 'suzu', map: 'sa.*', if: 'sa_met_kasane&!sa_hush_down', scene: 'sa.b_suzu3' },
  { comp: 'suzu', map: 'sa.*', if: 'sa_hush_down', scene: 'sa.b_suzu4' }
);
