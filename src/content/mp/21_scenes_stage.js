/* Manybridge, Chapter 4: Playhouse Row (expansion P09). The theatre whose script is losing its characters' names, the
 * rehearsal (staging, a line for the matinée, the prompt-book), the stage door (Suzu's seed: an old playbill with her
 * name and a letter for her; she pockets it, laughs it off, and leaves word that she is safe; her troupe is not met
 * here), the theatre's comic and the double act, the lead actor who lost his stage name, and the dress rehearsal that
 * sends the party down into the Understage. Chapter 4's rung (S15): actors who forget the roles they loved; the
 * party's anger on others' behalf. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
@scene mp.playhouse_first
# Staged: round the corner from Blockprint Row; the theatre's banners stir; a bill on the board has gone blank.
!set mp_theatre_seen
!gesture pc lookroad up
narr: {大|おお}きな {芝居小屋|しばいごや} 。 {赤|あか} と {藍|あい} の のぼり が 、 {川風|かわかぜ} に {揺|ゆ}れて いる 。 || A great playhouse. Red and indigo banners stir in the wind off the river.
narr: {入|い}り{口|ぐち} の {番付|ばんづけ} に は 、 {役|やく} の {名前|なまえ} の {所|ところ} だけ 、 {白|しろ}い {穴|あな} が {開|あ}いて いる 。 || On the playbill by the entrance, only the names of the parts have gone: white holes where they were.
?(comp=suzu) comp[shy]: …… {芝居小屋|しばいごや} の {匂|にお}い 。 {木|き} と 、 {白粉|おしろい} と 、 {埃|ほこり} 。 {久|ひさ}しぶり ね 。 || …The smell of a playhouse. Wood, face powder, dust. It's been a while.
?(comp!=suzu) comp: {役|やく} の {名前|なまえ} だけ が {消|き}えて いる 。 {役者|やくしゃ} の {名前|なまえ} は {残|のこ}って いる のに 。 || Only the parts' names are gone. The actors' names are still there.

@scene mp.manbe_first
!faceplayer
?(quest.mp_main<2) mp_manbe: {川開|かわびら}き の {夜|よる} に 、 {芝居|しばい} を {一本|いっぽん} {打|う}つ ん です が …… いや 、 {今|いま} は {忙|いそが}しくて 。 {失礼|しつれい} ！ || We're putting on a play for the night of the Opening, but… no, I'm rushed off my feet just now. Excuse me!
?(quest.mp_main<2) !end
mp_manbe: {宗兵衛|そうべえ} さん から ？ ああ 、 {助|たす}かった ！ {座元|ざもと} の マンベエ です 。 || From Sōbē? Oh, thank heavens! I'm Manbē, the manager here.
mp_manbe: {台本|だいほん} の {役|やく} の {名前|なまえ} が 、 {毎日|まいにち} {一|ひと}つ ずつ {消|き}えて いく 。 {役者|やくしゃ} は {自分|じぶん} の {役|やく} を {忘|わす}れ 、 {立|た}ち{位置|いち} も {台詞|せりふ} も ばらばら だ 。 || The names of the parts in the script fade one a day. The actors forget their parts; the blocking and the lines are all over the place.
mp_manbe: {看板役者|かんばんやくしゃ} の サクタロウ は 、 {自分|じぶん} の {芸名|げいめい} まで {忘|わす}れて 、 {岸|きし} に {座|すわ}り{込|こ}んで しまった 。 …… {好|す}きな {役|やく} だった のに 。 || Our lead, Sakutarō, has even forgotten his stage name. He's sitting down by the canal and won't move. …He loved that part.
?(comp=nao) comp[angry]: {好|す}きな {物|もの} を {取|と}り{上|あ}げる の か 。 {名前|なまえ} {一|ひと}つ で 。 …… {気|き} に {入|い}らない な 。 || Taking away the thing someone loves. With nothing but a name. …I don't like it.
?(comp=mio) comp[angry]: {好|す}きで {覚|おぼ}えた {役|やく} を 、 {忘|わす}れさせる なんて …… {許|ゆる}せない 。 || Making someone forget a part they learned out of love… I won't stand for it.
?(comp=ren) comp[angry]: {灯|ひ} を {消|け}す より 、 ひどい です 。 {人|ひと} が {大事|だいじ} に して きた もの を 、 {中|なか} から {消|け}して いる 。 || That's worse than putting out a lantern. It's erasing what people have cherished, from the inside.
?(comp=suzu) comp[angry]: {役者|やくしゃ} から {役|やく} を {取|と}る なんて 、 {一番|いちばん} {残酷|ざんこく} な こと よ 。 …… {黙|だま}って いられない わ 。 || Taking an actor's part away is the cruellest thing there is. …I can't keep quiet about this.
mp_manbe: けいこ を {手伝|てつだ}って くれません か 。 {外|そと} の {目|め} が あれば 、 {台本|だいほん} を {組|く}み{直|なお}せる かも しれない 。 || Would you help with the rehearsal? With fresh eyes we might be able to put the script back together.
!quest mp_main 3
!call mp.rehearsal

@scene mp.manbe_rehearse
!faceplayer
?(mp_rehearsal_done) mp_manbe: {舞台稽古|ぶたいげいこ} は 、 {祭|まつ}り の {前|まえ} の {晩|ばん} です 。 それ まで に 、 {世話役|せわやく} の トミ さん を {手伝|てつだ}って あげて ください 。 || The dress rehearsal is the night before the festival. Until then, please help Tomi of the committee.
?(mp_rehearsal_done) !end
!call mp.rehearsal

@scene mp.rehearsal
# Staged: the bare stage, Manbē with the prompt-book, the actors waiting in the wings; three passes.
narr: {舞台|ぶたい} の {上|うえ} 。 {役者|やくしゃ} たち が 、 {誰|だれ} が どこ に {立|た}つ の か {分|わ}からない まま 、 {立|た}って いる 。 || On the stage the actors stand about, not knowing who goes where.
mp_manbe: まず は {立|た}ち{位置|いち} から 。 {台本|だいほん} の {指示|しじ} を {読|よ}んで 、 {並|なら}べて みて ください 。 || Blocking first. Read the directions in the script and set them out.
!challenge mp.rehearse_block
mp_manbe: よし 、 {見|み}える ！ {次|つぎ} は {昼|ひる} の {部|ぶ} です 。 {子供|こども} の お{客|きゃく} に も {分|わ}かる {台詞|せりふ} に {直|なお}したい 。 || Yes, now we can see it! Next, the afternoon show. I want the lines put so the children understand them too.
!challenge mp.rehearse_line
mp_manbe: {最後|さいご} に 、 ばらばら に なった {台本|だいほん} を 、 {順番|じゅんばん} どおり に 。 || Last, the prompt-book that came apart: back in order.
!challenge mp.rehearse_book
narr: {役者|やくしゃ} たち が 、 {一人|ひとり} 、 また {一人|ひとり} と 、 {自分|じぶん} の {場所|ばしょ} に {立|た}つ 。 {台本|だいほん} の {白|しろ}い {所|ところ} に 、 {鉛筆|えんぴつ} の {字|じ} が {書|か}き{込|こ}まれて いく 。 || One by one the actors find their places. Pencilled names fill the white gaps in the script.
mp_manbe: …… {動|うご}いた 。 {芝居|しばい} が 、 {動|うご}いた ！ ありがとう ！ || …It moves. The play moves again! Thank you!
?(comp=suzu) comp[smile]: {鉛筆|えんぴつ} で {書|か}き{込|こ}んだ {名前|なまえ} は 、 {消|き}えて も また {書|か}ける わ 。 {役者|やくしゃ} は 、 そう やって {生|い}きて きた の よ 。 || A name pencilled in can be written again if it fades. That's how actors have always lived.
mp_manbe: {舞台稽古|ぶたいげいこ} は 、 {祭|まつ}り の {前|まえ} の {晩|ばん} 。 それ まで に 、 {世話役|せわやく} の トミ さん を {手伝|てつだ}って くれません か 。 {祭|まつ}り の {準備|じゅんび} が 、 まるで {進|すす}んで いない らしい 。 || The dress rehearsal is the night before the festival. Until then, would you help Tomi of the committee? The preparations are nowhere, I hear.
!set mp_rehearsal_done
!set mp_fest_heard
!quest mp_main 4
!journal けいこ は {進|すす}んだ 。 {祭|まつ}り の {世話役|せわやく} の トミ を {手伝|てつだ}う 。 || The rehearsal went well. Now help Tomi of the festival committee.

@scene mp.manbe_idle
!faceplayer
mp_manbe: {台本|だいほん} の {名前|なまえ} 、 {毎朝|まいあさ} {鉛筆|えんぴつ} で {書|か}き{直|なお}して います 。 {役者|やくしゃ} たち も 、 {自分|じぶん} で {書|か}き{込|こ}む よう に なった 。 || I pencil the names back into the script every morning. The actors have started writing theirs in themselves.

@scene mp.manbe_under
# Staged: the dress rehearsal; mid-scene the actors stop, one after another, and stare; the stage judders and stops.
!faceplayer
narr: {舞台稽古|ぶたいげいこ} 。 {幕|まく} が {上|あ}がり 、 {役者|やくしゃ} たち が {台詞|せりふ} を {言|い}い{始|はじ}める 。 || The dress rehearsal. The curtain rises; the actors begin their lines.
!shake 2
narr: その {時|とき} 、 {舞台|ぶたい} の {床|ゆか} が {大|おお}きく {揺|ゆ}れて 、 {止|と}まった 。 {役者|やくしゃ} たち が 、 {台詞|せりふ} の {途中|とちゅう} で 、 {一人|ひとり} ずつ {黙|だま}って いく 。 || Then the stage floor jolts and stops. One by one, the actors fall silent in the middle of their lines.
mp_manbe: {奈落|ならく} だ ！ {舞台|ぶたい} の {下|した} の からくり が {止|と}まった 。 …… {台本|だいほん} を {見|み}て ください 。 {鉛筆|えんぴつ} の {名前|なまえ} まで 、 {下|した} へ {吸|す}い{込|こ}まれる よう に {消|き}えて いく ！ || The Understage! The machinery under the stage has stopped. …Look at the script. Even the pencilled names are fading, as if they were being drawn down below!
?(comp=nao) comp: {下|した} だ な 。 {名前|なまえ} の {行|い}き{先|さき} が {分|わ}かった 。 {追|お}いかける ぞ 。 || Below, then. Now we know where the names are going. After them.
?(comp=mio) comp: {下|した} に {何|なに} か が いる 。 {怖|こわ}い けど …… {行|い}きましょう 。 {役者|やくしゃ} さん たち の ため に 。 || Something's down there. It's frightening, but… let's go. For the actors.
?(comp=ren) comp: {灯|あか}り を {持|も}って いきます 。 {奈落|ならく} は 、 {暗|くら}い {所|ところ} です から 。 || I'll take a light. The Understage is a dark place.
?(comp=suzu) comp: {奈落|ならく} …… {舞台|ぶたい} の {下|した} の 、 {役者|やくしゃ} が {怖|こわ}がる {場所|ばしょ} よ 。 {一緒|いっしょ} なら 、 {平気|へいき} 。 || The Understage… the place under the stage that actors are afraid of. With you, I'll be fine.
mp_manbe: {床|ゆか} の せり を {下|お}ろします 。 {気|き} を つけて ！ || I'll lower the trap lift in the floor. Be careful!
!set mp_under_open
!refresh
!journal {舞台|ぶたい} の {下|した} の {奈落|ならく} へ 。 {名前|なまえ} が {吸|す}い{込|こ}まれて いく 。 || Down into the Understage. The names are being drawn below.

@scene mp.trap_closed
narr: {舞台|ぶたい} の {床|ゆか} の せり 。 {今|いま} は {上|あ}がって いて 、 {床|ゆか} と {同|おな}じ {高|たか}さ だ 。 || The trap lift in the stage floor. It is up, flush with the boards.

@scene mp.promptbook
?(mb2_done) narr: {台本|だいほん} 。 {役|やく} の {名前|なまえ} が 、 {墨|すみ} で {刷|す}り{直|なお}されて いる 。 || The prompt-book. The parts' names have been printed in again, in ink.
?(mb2_done) !end
narr: {台本|だいほん} 。 {役|やく} の {名前|なまえ} の {所|ところ} が {白|しろ}く 、 {鉛筆|えんぴつ} の {字|じ} が {書|か}き{込|こ}まれて いる 。 || The prompt-book. Where the parts' names were, the page is white; names have been pencilled in.

@scene mp.stagedoor
# Suzu's seed (14_COMPANIONS; sealed companion note): an old playbill with her name, a letter left for her (from
# Koume); she pockets it, laughs it off, and leaves word that she is safe. Her troupe is not met here.
narr: {楽屋|がくや} の {入|い}り{口|ぐち} 。 {戸|と} の {横|よこ} に 、 {役者|やくしゃ} {宛|あて} の {手紙|てがみ} の {棚|たな} と 、 {古|ふる}い {番付|ばんづけ} が {何枚|なんまい} も {貼|は}って ある 。 || The stage door. Beside it, a rack of letters for the players and a crust of old playbills pinned to the wall.
?(comp!=suzu) !end
?(mp_ev_koume) narr: スズ の {名前|なまえ} の ある {番付|ばんづけ} は 、 もう {外|はず}されて いる 。 || The playbill with Suzu's name on it has already been taken down.
?(mp_ev_koume) !end
!look comp pc
narr: {一番|いちばん} {古|ふる}い {番付|ばんづけ} の {隅|すみ} に 、 {小|ちい}さな {字|じ} で 「スズ」 。 || In the corner of the oldest playbill, in small letters: "Suzu".
comp[surprise]: …… あら 。 {懐|なつ}かしい 。 わたし 、 こんな に {小|ちい}さい {字|じ} だった の ね 。 || …Oh. How it takes me back. My name was this small.
narr: {番付|ばんづけ} の {裏|うら} に 、 {手紙|てがみ} が {一通|いっつう} {挟|はさ}まって いた 。 「スズ へ」 。 || Tucked behind the playbill, a letter: "To Suzu".
?(comp=suzu) !gesture comp avert
comp[laugh]: …… {後|あと} で {読|よ}む わ 。 {今|いま} は {芝居|しばい} の {方|ほう} が {大事|だいじ} 。 || …I'll read it later. The play matters more just now.
?(comp=suzu) !gesture comp write
comp: {一言|ひとこと} だけ 、 {残|のこ}して いく わ 。 「スズ は {元気|げんき} です 。 {心配|しんぱい} しないで 。」 …… これ で いい の 。 || I'll leave just a line. "Suzu is well. Don't worry." …That will do.
!give mp_playbill
!set mp_ev_koume

@scene mp.genta
!faceplayer
?(comp=suzu&!mp_manzai_done) mp_genta: お{客|きゃく}さん 、 {役者|やくしゃ} だろう ？ {立|た}ち{方|かた} で {分|わ}かる 。 …… {相方|あいかた} が {風邪|かぜ} で {寝|ね}て いて ね 。 {代|か}わり に 、 {一本|いっぽん} やって くれない か 。 || You're a performer, aren't you? I can tell by how you stand. …My partner's in bed with a cold. Would you do a routine in his place?
?(comp=suzu&!mp_manzai_done) comp[smile]: {漫才|まんざい} ？ …… ふふ 。 わたし が ボケ で 、 この {人|ひと} が ツッコミ なら 、 {出|で}て あげる わ 。 || A double act? …Heh. If I'm the funny one and this one plays it straight, I'll go on.
?(comp=suzu&!mp_manzai_done) !call mp.manzai
?(comp=suzu&!mp_manzai_done) !end
mp_genta: {芝居|しばい} の {合間|あいま} に 、 {漫才|まんざい} を やって いる ゲンタ です 。 {笑|わら}い は 、 {名前|なまえ} が なくて も {消|き}えない よ 。 || I'm Genta; I do the double acts between plays. Laughter doesn't fade, even without names.

@scene mp.genta_act
!faceplayer
?(mp_manzai_done) mp_genta: また {組|く}もう ぜ 、 {相方|あいかた} 。 || Let's team up again some time, partner.
?(mp_manzai_done) !end
mp_genta: {相方|あいかた} が {風邪|かぜ} で {寝|ね}て いて ね 。 {代|か}わり に 、 ツッコミ を やって くれない か 。 {俺|おれ} が {変|へん} な こと を {言|い}う から 、 {直|なお}して くれ 。 || My partner's in bed with a cold. Would you play the straight one in his place? I say something daft, you put it right.
!call mp.manzai

@scene mp.manzai
# Staged: the little stage between plays; the funny one (Suzu in her journeys, Genta otherwise) and you; a few
# dozen in the seats; three bits; the audience laughs, or doesn't; nothing is scored.
narr: {小|ちい}さな {舞台|ぶたい} 。 {客席|きゃくせき} に は 、 {祭|まつ}り を {待|ま}つ {人|ひと} たち が {座|すわ}って いる 。 || The little stage. In the seats, people waiting for the festival.
?(comp=suzu) comp: はい 、 どうも どうも ！ {今日|きょう} は いい {天気|てんき} です ね 。 だから 、 {傘|かさ} を {三本|さんぼん} {持|も}って {来|き}ました ！ || Hello, hello! Lovely weather today. So I brought three umbrellas!
?(comp!=suzu) mp_genta: はい 、 どうも どうも ！ {今日|きょう} は いい {天気|てんき} です ね 。 だから 、 {傘|かさ} を {三本|さんぼん} {持|も}って {来|き}ました ！ || Hello, hello! Lovely weather today. So I brought three umbrellas!
!challenge mp.manzai_1
narr: {客席|きゃくせき} から 、 くすくす と {笑|わら}い{声|ごえ} 。 || A ripple of giggles from the seats.
?(comp=suzu) comp: わたし 、 {毎朝|まいあさ} {走|はし}って います 。 …… {夢|ゆめ} の {中|なか} で 。 || I go for a run every morning. …In my dreams.
?(comp!=suzu) mp_genta: {俺|おれ} 、 {毎朝|まいあさ} {走|はし}って います 。 …… {夢|ゆめ} の {中|なか} で 。 || I go for a run every morning. …In my dreams.
!challenge mp.manzai_2
narr: {前|まえ} の {席|せき} の {子供|こども} が 、 {手|て} を {叩|たた}いて {笑|わら}って いる 。 || A child in the front row is laughing and clapping.
?(comp=suzu) comp: {昨日|きのう} は ね 、 {箸|はし} を {渡|わた}って 、 {橋|はし} で ご{飯|はん} を {食|た}べました 。 || Yesterday I crossed the chopsticks and ate my rice with a bridge.
?(comp!=suzu) mp_genta: {昨日|きのう} は な 、 {箸|はし} を {渡|わた}って 、 {橋|はし} で ご{飯|はん} を {食|た}べました 。 || Yesterday I crossed the chopsticks and ate my rice with a bridge.
!challenge mp.manzai_3
narr: {客席|きゃくせき} が どっと {沸|わ}いた 。 {八百橋|やおばし} の {人|ひと} たち に は 、 {橋|はし} の {洒落|しゃれ} が よく {効|き}く 。 || The house roars. A bridge pun goes down well in Manybridge.
?(comp=suzu) comp[laugh]: …… ありがとう 、 {相方|あいかた} 。 {久|ひさ}しぶり に 、 {舞台|ぶたい} で {笑|わら}った わ 。 {間|ま} の {取|と}り{方|かた} 、 {悪|わる}く ない わ よ 。 || …Thank you, partner. It's been a long time since I laughed on a stage. Your timing's not bad at all.
?(comp=suzu) !set mp_ev_suzu_act
?(comp!=suzu) mp_genta: いい ツッコミ だった ！ {相方|あいかた} が {治|なお}る まで 、 {代|か}わり を {頼|たの}みたい くらい だ 。 || Great straight work! I'd have you stand in till my partner's better, if I could.
?(comp!=suzu) comp[laugh]: {意外|いがい} な {才能|さいのう} だ な 。 || An unexpected talent.
!set mp_manzai_done

@scene mp.genta_after
!faceplayer
mp_genta: {祭|まつ}り の {晩|ばん} の {漫才|まんざい} 、 {大入|おおい}り だった ぜ 。 {名前|なまえ} の ない {夜|よる} を {笑|わら}い{飛|と}ばして やった 。 || The double acts on festival night packed the house. We laughed the nameless nights away.

@scene mp.saku_first
# The Missing Lead Actor (R1): Sakutarō has lost his stage name and, with it, his nerve.
!faceplayer
mp_saku: …… {僕|ぼく} の {芸名|げいめい} が 、 {思|おも}い{出|だ}せない ん です 。 {舞台|ぶたい} に {立|た}つ と 、 {誰|だれ} として {立|た}てば いい の か 、 {分|わ}からなく なる 。 || …I can't remember my stage name. When I stand on the stage, I don't know who I'm supposed to be standing there as.
?(comp=suzu) comp: {名前|なまえ} が なくて も 、 {台詞|せりふ} は {体|からだ} が {覚|おぼ}えて いる わ 。 {一緒|いっしょ} に 、 {読|よ}んで みましょう 。 || Your body remembers the lines, even without the name. Let's read them together.
?(comp!=suzu) comp: {台詞|せりふ} を {一緒|いっしょ} に {読|よ}んで みません か 。 {名前|なまえ} より {先|さき} に 、 {役|やく} が {戻|もど}る かも しれない 。 || Shall we read your lines together? The part might come back before the name does.
!quest mp_actor start
!quest mp_actor 1

@scene mp.saku_rehearse
!faceplayer
?(quest.mp_actor=done) !end
mp_saku: {昼|ひる} の {部|ぶ} の {台詞|せりふ} から 、 お{願|ねが}い します 。 || From the afternoon show's lines, please.
!challenge mp.rehearse_line
mp_saku: …… {声|こえ} が 、 {出|で}た 。 {役|やく} の {名前|なまえ} は まだ {白|しろ}い けど 、 {誰|だれ} を {演|えん}じる か は 、 {分|わ}かった 。 || …My voice came out. The part's name is still blank, but I know who I'm playing now.
mp_saku: {芸名|げいめい} は …… {戻|もど}らなくて も 、 {舞台|ぶたい} に {立|た}ちます 。 {本名|ほんみょう} の サクタロウ で 。 || My stage name… even if it never comes back, I'll go on. As Sakutarō, my own name.
!quest mp_actor done
!journal サクタロウ は {本名|ほんみょう} で {舞台|ぶたい} に {立|た}つ と {決|き}めた 。 || Sakutarō has decided to go on stage under his own name.

@scene mp.saku_after
!faceplayer
mp_saku: {芸名|げいめい} も {戻|もど}って きました 。 でも {番付|ばんづけ} に は 、 {本名|ほんみょう} も {小|ちい}さく {刷|す}って もらいました 。 || My stage name came back too. But I had my own name printed small on the playbill as well.

@scene mp.hayashi
!faceplayer
mp_hayashi: ポン 、 ポン ！ {人|ひと} が {集|あつ}まる {所|ところ} に {太鼓|たいこ} あり 。 {祭|まつ}り の {晩|ばん} は 、 {岸|きし} で {叩|たた}く よ ！ || Pom, pom! Wherever a crowd gathers, there's a drum. On festival night I'll be drumming on the bank!

@scene mp.pp_board
narr: {芝居小屋|しばいごや} の {掲示板|けいじばん} 。 「{川開|かわびら}き の {晩|ばん} 、 {特別|とくべつ} {公演|こうえん} 。」 {演目|えんもく} の {名前|なまえ} は 、 {白|しろ}い 。 || The playhouse board: "Special performance, the night of the Opening." The play's title is blank.

@scene mp.sign_playhouse
narr: 「{芝居|しばい} の {通|とお}り 。 {西|にし} に {版木|はんぎ} の {通|とお}り 。 {南|みなみ} の {岸|きし} で {川開|かわびら}き 。」 || "Playhouse Row. West to Blockprint Row. The Opening of the River on the south bank."

@scene mp.door_ryusui
narr: {人気作家|にんきさっか} リュウスイ の {家|いえ} 。 {戸|と} は {閉|し}まって いる 。 || The house of Ryūsui, the popular author. The door is shut.
`, 'mp/21_scenes_stage.js');
