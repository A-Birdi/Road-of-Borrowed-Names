/* Chapter 6 scenes: the road up from Lanternfall, the Last Lamp Hut, and
 * the Archive's outer court (including Master Ushio's grave). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
@scene sa.arrive
!set sa_arrived
!chapter 6
!music quiet_road
!card {第六章|だいろくしょう} 　 {静寂|しじま} の {書庫|しょこ} || Chapter Six — The Still Archive
narr: {灯落|ひおち} の {上|うえ} で 、 {道|みち} は {急|きゅう} に {静|しず}か に なる 。 || Above Lanternfall, the road goes suddenly quiet.
narr: {鳥|とり} の {声|こえ} も 、 {風|かぜ} の {音|おと} も 、 {少|すこ}し ずつ {遠|とお}く なって いく 。 || Birdsong and wind both drop away, a little at a time.
narr: {道|みち} の {脇|わき} の {灯籠|とうろう} は 、 {上|うえ} に {立|た}つ もの ほど 、 {名前|なまえ} が {薄|うす}い 。 || The lantern posts beside the road carry names that grow fainter the higher they stand.
?(comp=nao) nao[think]: {出口|でぐち} は {二|ふた}つ 。 {上|うえ} か 、 {下|した} か 。 …… {嫌|いや} な {道|みち} だ な 。 || Two exits. Up, or down. …I hate roads like this.
?(comp=nao) nao[smirk]: ま 、 {下|した} に {逃|に}げる {気|き} は ない けど 。 {行|い}こう 、 $name 。 || Not that I'm planning on running back down. Let's go, $name.
?(comp=mio) mio[worry]: {耳|みみ} が {変|へん} 。 {音|おと} が {足|た}りない {感|かん}じ 。 || My ears feel strange. Like there isn't enough sound.
?(comp=mio) mio[smile]: {息|いき} が {切|き}れたら 、 ちゃんと {言|い}って ね 。 {薬|くすり} は {持|も}って きた から 。 || If you get out of breath, tell me. I brought medicine.
?(comp=ren) ren[think]: 「 {迷|まよ}ったら 、 {音|おと} の する ほう へ 」 。 {師匠|ししょう} の {教|おし}え です 。 …… {困|こま}りました 。 {音|おと} が しない 。 || "When lost, go toward the sound." One of my teacher's lessons. …Problem: there is no sound.
?(comp=ren) ren: {師匠|ししょう} は 、 この {道|みち} を {登|のぼ}って いった 。 {道|みち} は {一本|いっぽん} です 。 {迷|まよ}う {余地|よち} は ありません 。 || My teacher climbed this road. There's only one path. No room to get lost.
?(comp=ren) ren[smirk]: それ でも {迷|まよ}ったら 、 {笑|わら}って ください 。 {一本道|いっぽんみち} で {迷|まよ}う の は {才能|さいのう} です から 。 || If I manage it anyway, you have my permission to laugh. Getting lost on a single road is a talent, after all.
?(comp=suzu) suzu[smile]: さあ 、 {最終幕|さいしゅうまく} だ よ 。 {客席|きゃくせき} は …… {誰|だれ} も いない けど 。 || Well — curtain up on the final act. The house is… completely empty.
?(comp=suzu) suzu[think]: {静|しず}か すぎる {舞台|ぶたい} は {好|す}き じゃ ない 。 {台詞|せりふ} を {忘|わす}れた {気|き} に なる 。 || I don't like a stage this quiet. It makes me feel I've forgotten my lines.
!quest sa_main start
!journal {灯落|ひおち} の {上|うえ} の {道|みち} を {登|のぼ}って 、 {静寂|しじま} の {書庫|しょこ} を {目指|めざ}す 。 || Climbing the road above Lanternfall towards the Still Archive.
!autosave

@scene sa.lantern1
narr: {灯|ひ} の {消|き}えた {灯籠|とうろう} 。 {笠|かさ} に {字|じ} が {残|のこ}って いる 。 || A dark lantern post. There is still writing on the shade.
narr: 「 {次|つぎ} は {最後|さいご} の {灯|ひ} の {小屋|こや} 。 この {道|みち} は そこ へ {続|つづ}く 。 」 || "Next: the Last Lamp Hut. This road leads there."
narr: {字|じ} は {読|よ}める 。 でも {墨|すみ} が 、 {水|みず} で {薄|うす}めた よう に {淡|あわ}い 。 || You can read it. But the ink is pale, as if it had been watered down.
?(comp=ren) ren[worry]: {名前|なまえ} は {残|のこ}って いる のに 、 {火|ひ} が {入|はい}らない 。 {約束|やくそく} の ほう が 、 {先|さき} に {抜|ぬ}かれて いる 。 || The name's still there, but it won't take a flame. The promise has been lifted out first.
?(comp=nao) nao: {書|か}き{直|なお}して も 、 すぐ {薄|うす}く なり そう だ な 。 {上|うえ} に {近|ちか}すぎる 。 || Rewrite it and it'd just fade again. We're too close to whatever's up there.
?(comp=mio) mio: {誰|だれ}か が {何度|なんど} も {書|か}き{直|なお}した {跡|あと} が ある 。 {下|した} の ほう の {字|じ} 、 {重|かさ}なってる 。 || Someone's rewritten this over and over. The strokes near the bottom are layered on each other.
?(comp=suzu) suzu: {看板|かんばん} が {薄|うす}く なる {劇場|げきじょう} は 、 だいたい {潰|つぶ}れる {前|まえ} な んだ よ ね 。 || When a theatre's sign starts fading, it's usually about to close.

@scene sa.lantern1_lit
narr: {灯|ひ} が {入|はい}って いる 。 「 {次|つぎ} は {最後|さいご} の {灯|ひ} の {小屋|こや} 。 この {道|みち} は そこ へ {続|つづ}く 。 」 {墨|すみ} は 、 {真|ま}っ{黒|くろ} だ 。 || It's lit. "Next: the Last Lamp Hut. This road leads there." The ink is jet black.

@scene sa.lantern2
narr: {笠|かさ} の {字|じ} が 、 ところどころ {抜|ぬ}けて いる 。 || Parts of the writing on the shade are missing.
narr: 「 {次|つぎ} は …… {小屋|こや} 。 この {道|みち} は …… へ {続|つづ}く 。 」 || "Next: … hut. This road leads to …"
?(comp=suzu) suzu: {台詞|せりふ} {飛|と}ばした {役者|やくしゃ} みたい 。 {見|み}て いられない 。 || Like an actor who's dried. Painful to watch.
?(comp=ren) ren: {次|つぎ} の {場所|ばしょ} の {名前|なまえ} から {消|き}えて いる 。 {行|い}き{先|さき} が {消|き}えれば 、 {道|みち} は {道|みち} で なく なる 。 || The next place's name goes first. Take away where a road leads and it stops being a road.

@scene sa.lantern2_lit
narr: {抜|ぬ}けて いた {字|じ} が 、 {戻|もど}って いる 。 「 {次|つぎ} は {最後|さいご} の {灯|ひ} の {小屋|こや} 」 。 || The missing characters are back. "Next: the Last Lamp Hut."

@scene sa.lantern3
narr: {笠|かさ} に は 、 「 この {道|みち} は 」 と だけ {残|のこ}って いる 。 || All that's left on the shade is "This road…"
narr: その {先|さき} は 、 {白|しろ}い 。 || After that, white.
?(comp=mio) mio[worry]: 「 この {道|みち} は 」 …… {何|なに} ？ {続|つづ}き を {言|い}って ほしい 。 || "This road…" what? I want it to finish the sentence.
?(comp=nao) nao: {書|か}き{出|だ}し だけ の {手紙|てがみ} って 、 {一番|いちばん} {始末|しまつ} が {悪|わる}い 。 || A letter that's only the opening line. Worst kind there is.

@scene sa.lantern3_lit
narr: 「 この {道|みち} は 、 {書庫|しょこ} へ {続|つづ}く 。 {帰|かえ}り {道|みち} も ある 。 」 {誰|だれ}か が 、 {後|あと} の {一文|いちぶん} を {書|か}き{足|た}して いる 。 || "This road leads to the Archive. There is a road back, too." Someone has added the second sentence.

@scene sa.lantern4
narr: {何|なに} も {書|か}かれて いない 。 {紙|かみ} が {新|あたら}しく {見|み}える ほど 、 {白|しろ}い 。 || Nothing is written on it. The paper is so white it looks new.
?(comp=nao) nao: {新品|しんぴん} の {顔|かお} を してる けど 、 {古|ふる}い {灯籠|とうろう} だ 。 {消|け}された だけ だ 。 || It's putting on a brand-new face, but it's an old post. Just wiped.
?(comp=mio) mio: …… {傷|きず} が ない の が 、 {一番|いちばん} {怖|こわ}い 。 || …The lack of a single mark is the scariest part.
?(comp=ren) ren[closed]: {灯守|ひもり} と して 、 これ は …… {見|み}たく なかった 。 || As a lantern keeper, this is… something I didn't want to see.
?(comp=suzu) suzu: {白紙|はくし} の {台本|だいほん} は 、 {自由|じゆう} って {言|い}う {人|ひと} も いる けど ね 。 これ は {違|ちが}う 。 {誰|だれ}か が {消|け}した {白|しろ} だ 。 || Some people call a blank script freedom. This isn't that. This white is something someone erased.

@scene sa.lantern4_lit
narr: {笠|かさ} に {字|じ} が ある 。 {少|すこ}し {下手|へた} な {字|じ} だ 。 「 {上|うえ} は {書庫|しょこ} 。 {下|した} は {灯落|ひおち} 。 どちら も {開|ひら}いて いる 。 」 || There's writing on the shade, in a slightly clumsy hand: "Up: the Archive. Down: Lanternfall. Both are open."

@scene sa.road_marker
narr: {苔|こけ} の {生|は}えた {道標|みちしるべ} 。 || A mossy stone waymarker.
narr: 「 ここ から {上|うえ} は 、 {荷|に} を {下|お}ろしたい {者|もの} の {道|みち} 。 」 || "Above this point, the road is for those who wish to set down their burdens."
?(comp=nao) nao: {荷|に} を {下|お}ろす 、 か 。 {配達人|はいたつにん} に は {耳|みみ} の {痛|いた}い {言葉|ことば} だ 。 {下|お}ろす の は 、 {届|とど}けた {後|あと} だ 。 || Set down your burdens. Not what a courier wants to hear. You set it down after it's delivered.
?(comp=mio) mio: {重|おも}い {荷物|にもつ} を {下|お}ろす の は 、 {悪|わる}い こと じゃ ない 。 …… {誰|だれ} の {荷物|にもつ} か に よる けど 。 || Setting down a heavy load isn't a bad thing. …Depends whose load it is, though.
?(comp=ren) ren: {灯守|ひもり} の {道標|みちしるべ} の {書|か}き{方|かた} です 。 {昔|むかし} は 、 {正|ただ}しい {道|みち} だった の でしょう 。 || That's how lantern keepers carve their markers. Once, this was an honest road.
?(comp=suzu) suzu: {荷物|にもつ} を {下|お}ろす の は いい けど 、 {預|あず}かり{証|しょう} は もらって おく べき だ よ ね 。 {経験上|けいけんじょう} 。 || Setting down your baggage is fine, but you should always get a receipt. Speaking from experience.

@scene sa.road_view
!if sa_hush_down -> after
narr: {灯落|ひおち} の {屋根|やね} が 、 {下|した} に {並|なら}んで いる 。 {町|まち} の {音|おと} は 、 ここ まで {届|とど}かない 。 || Below, the roofs of Lanternfall lie in rows. No sound from the town reaches this far.
narr: {川|かわ} は 、 {音|おと} も なく {光|ひか}って いる 。 {絵|え} に {描|か}いた {川|かわ} の よう に 。 || The river shines without a sound, like a river in a painting.
!end
:after
narr: {灯落|ひおち} の {屋根|やね} 。 {魚|さかな} の {値段|ねだん} で {揉|も}めて いる {声|こえ} が 、 ここ まで {聞|き}こえる 。 || Lanternfall's roofs. You can hear someone arguing over the price of fish from up here.
narr: {誰|だれ}か が {笑|わら}った 。 {川|かわ} が 、 ちゃんと {音|おと} を {立|た}てて いる 。 || Someone laughs. The river is making its proper noise again.

@scene sa.road_bundle
narr: {道|みち} の {脇|わき} の {箱|はこ} に 、 {新|あたら}しい わらじ が {何足|なんぞく} も {入|はい}って いる 。 {札|ふだ} が {付|つ}いて いる 。 || In a box by the road are several pairs of new straw sandals. There's a tag.
narr: 「 {下|くだ}り の {方|かた} へ 。 {履|は}き{替|か}え に どうぞ 。 ── {最後|さいご} の {灯|ひ} の {小屋|こや} 」 || "For those coming down: please change into these. — The Last Lamp Hut"
?(comp=nao) nao: {下|くだ}り の {人|ひと} 、 か 。 {帰|かえ}って くる {前提|ぜんてい} で {置|お}いて ある 。 {気|き} の {利|き}いた {宿|やど} だ 。 || "For those coming down." Left on the assumption people come back. That's a thoughtful inn.
?(comp=mio) mio: {親切|しんせつ} 。 …… {靴擦|くつず}れ の {薬|くすり} も 、 {置|お}いて いこう か な 。 || That's kind. …Maybe I'll leave some blister ointment here too.
?(comp=ren) ren[shy]: {靴|くつ} …… いえ 。 わたし の {靴|くつ} は まだ {大丈夫|だいじょうぶ} です 。 {灯|ひ} ほど {磨|みが}いて は いません が 。 || Shoes… no. My boots are still fine. Not as polished as the lamp, admittedly.
?(comp=suzu) suzu: わらじ {一足|いっそく} 、 {借|か}り 。 …… {冗談|じょうだん} 。 {下|くだ}り の {時|とき} に {借|か}りる よ 。 {返|かえ}す あて も ある し 。 || One pair of sandals, borrowed. …Joking. I'll borrow them on the way down. I know where to return them.

@scene sa.camp_first
narr: {雪|ゆき} の {積|つ}もった {小|ちい}さな {平地|へいち} に 、 {小屋|こや} が {一軒|いっけん} 。 {煙突|えんとつ} から {煙|けむり} が {出|で}て いる 。 || On a small snowy shelf of land stands a single hut. Smoke rises from its chimney.
narr: {小屋|こや} の {前|まえ} の {灯籠|とうろう} だけ が 、 {明|あか}るく {燃|も}えて いる 。 || Only the lantern post in front of the hut burns brightly.
?(comp=nao) nao: {火|ひ} が {点|つ}いてる 。 {人|ひと} が いる 。 …… {助|たす}かる 。 {足|あし} が {冷|つめ}たい 。 || There's a fire. People. …Thank goodness. My feet are freezing.
?(comp=mio) mio[smile]: お{茶|ちゃ} の {匂|にお}い が する 。 {少|すこ}し {休|やす}もう よ 。 {登|のぼ}る {前|まえ} に 。 || I can smell tea. Let's rest a little before we go on up.
?(comp=ren) ren: この {灯|ひ} は 、 {生|い}きて います 。 {誰|だれ}か が {毎日|まいにち} {名前|なまえ} を {書|か}き{直|なお}して いる 。 || That lamp is alive. Someone rewrites its name every day.
?(comp=suzu) suzu: {楽屋|がくや} 、 {発見|はっけん} 。 {出番|でばん} の {前|まえ} に 、 {衣装|いしょう} を {乾|かわ}かそう 。 || Dressing room, found. Let's dry our costumes before we go on.

@scene sa.camp_lamp
narr: {最後|さいご} の {灯籠|とうろう} 。 {笠|かさ} の {字|じ} は {太|ふと}く 、 {何度|なんど} も {上書|うわが}き されて いる 。 || The last lantern post. The writing on its shade is thick, written over again and again.
narr: 「 {最後|さいご} の {灯|ひ} の {小屋|こや} 。 {上|うえ} は {書庫|しょこ} 。 {下|した} は {灯落|ひおち} 。 {休|やす}んで いきな 。 」 || "The Last Lamp Hut. Up: the Archive. Down: Lanternfall. Stop and rest."
narr: {上手|じょうず} な {字|じ} で は ない 。 でも 、 {消|き}えて いない 。 || It is not skilled handwriting. But it hasn't faded.
?(comp=ren) ren[smile]: {毎朝|まいあさ} 、 {書|か}き{直|なお}して いる 。 {下手|へた} でも 、 {毎朝|まいあさ} 。 {灯|ひ} は 、 それ で {十分|じゅうぶん} な ん です 。 || Rewritten every morning. Clumsy, but every morning. For a lamp, that's enough.

@scene sa.camp_board
narr: {掲示板|けいじばん} に 、 {紙|かみ} が {何枚|なんまい} も {留|と}めて ある 。 || Several notes are pinned to the board.
narr: 「 {夫|おっと} の {咳|せき} の {音|おと} を 、 {置|お}いて いきます 。 {最後|さいご} の {冬|ふゆ} の 。 」 || "I'm leaving my husband's cough here. The one from his last winter."
narr: 「 {置|お}き に {来|き}た けど 、 やめた 。 {帰|かえ}ります 。 ── タ 」 || "Came to set it down. Changed my mind. Going home. — T."
narr: 「 {誰|だれ}か 、 この {手紙|てがみ} を {書庫|しょこ} の {人|ひと} に {渡|わた}して くれ 。 {扉|とびら} が {返事|へんじ} を しない 。 ── イ 」 || "Somebody give this letter to the Archive's keeper. The door won't answer. — I."
narr: 「 {上|うえ} へ {行|い}く {人|ひと} は 、 {火|ひ} に あたって から 。 {下|くだ}る {人|ひと} は 、 お{茶|ちゃ} を {飲|の}んで から 。 ── オヨネ 」 || "Those going up: warm yourselves at the fire first. Those coming down: have a cup of tea first. — Oyone"
?(comp=nao) nao: {掲示板|けいじばん} って の は 、 {届|とど}かなかった {手紙|てがみ} の {墓場|はかば} だ 。 …… {三|みっ}つ {目|め} の やつ 、 {気|き} に なる な 。 || Noticeboards are graveyards for letters that never got delivered. …That third one bothers me.
?(comp=mio) mio: {置|お}き に {来|き}て 、 やめた {人|ひと} も いる んだ 。 …… よかった 。 || Some people came to set things down and changed their minds. …Good.
?(comp=ren) ren: 「 {扉|とびら} が {返事|へんじ} を しない 」 。 {書庫|しょこ} は 、 {頼|たの}み を {聞|き}かなく なって いる 。 || "The door won't answer." The Archive has stopped listening to requests.
?(comp=suzu) suzu: {最後|さいご} の {貼|は}り{紙|がみ} 、 {好|す}き 。 {行|い}き も {帰|かえ}り も 、 ちゃんと {数|かぞ}えてる 。 || I like the last one. It counts the way up and the way back.

@scene sa.camp_cairn
narr: {小石|こいし} を {積|つ}んだ {塚|つか} 。 {石|いし} の {一|ひと}つ {一|ひと}つ に 、 {名前|なまえ} が {刻|きざ}んで ある 。 || A cairn of stacked pebbles. Each stone has a name scratched into it.
narr: {上|うえ} へ {荷|に} を {下|お}ろし に {行|い}った {人|ひと} たち が 、 {置|お}いて いった の だろう 。 {何十年|なんじゅうねん} {分|ぶん} も 。 || Left by the people who went up to set down their burdens, you suppose. Decades' worth.
?(sa_hush_down) narr: {新|あたら}しい {石|いし} が {一|ひと}つ {増|ふ}えて いる 。 「 トウヤ 」 。 || One new stone has been added: "Tōya".

@scene sa.camp_folios
narr: {小屋|こや} の {脇|わき} の {棚|たな} に 、 {書庫|しょこ} から {降|お}ろされた {綴|つづ}り が {並|なら}んで いる 。 {会|あ}い に {来|く}る {人|ひと} の ため に 。 || On the shelf beside the hut stand the folios brought down from the Archive — for anyone who comes to see theirs.
narr: {貼|は}り{紙|がみ} が ある 。 「 {読|よ}む の は {小屋|こや} の {中|なか} で 。 お{茶|ちゃ} {付|つ}き 。 ── オヨネ 」 || A note: "Read them inside the hut. Tea included. — Oyone"

@scene sa.hut_register
narr: {小屋|こや} の {机|つくえ} に 、 {分厚|ぶあつ}い {宿帳|やどちょう} 。 {三十年|さんじゅうねん} {分|ぶん} の {名前|なまえ} が 、 {並|なら}んで いる 。 || On the hut's table, a thick guest register. Thirty years of names, one after another.
narr: {上|うえ} へ {行|い}った {日付|ひづけ} の {横|よこ} に 、 {下|くだ}った {日付|ひづけ} 。 {下|くだ}った {日付|ひづけ} が ない {名前|なまえ} は 、 {一|ひと}つ だけ 。 「 ウシオ 」 。 || Beside each date going up, a date coming down. Only one name has no date coming down: "Ushio".
!if seen.sa.hut_register_signed -> end
sa_oyone: {名前|なまえ} 、 {書|か}いて いき な 。 {下|くだ}る {時|とき} に 、 {日付|ひづけ} を {足|た}す から 。 || Write your name. I'll add the date when you come back down.
!lesson kana
!call sa.hut_register_signed

@scene sa.hut_register_signed
narr: $name は 、 {宿帳|やどちょう} に {名前|なまえ} を {書|か}いた 。 {隣|となり} の {欄|らん} は 、 {空|あ}けて おく 。 || You write your name in the register, and leave the column beside it blank for now.
?(comp=nao) nao: {下|くだ}り の {欄|らん} 、 {必|かなら}ず {埋|う}める ぞ 。 {配達人|はいたつにん} は {往復|おうふく} が {基本|きほん} だ 。 || We are filling in that return column. Couriers always do the round trip.
?(comp=mio) mio: …… わたし の {字|じ} 、 {震|ふる}えてる 。 {寒|さむ}い から ね 。 {寒|さむ}い から 。 || …My handwriting's shaky. It's the cold. It's the cold.
?(comp=ren) ren: ウシオ 。 …… {下|くだ}り の {日付|ひづけ} が ない 。 || Ushio. …No date coming down.
?(comp=suzu) suzu: {貸|か}し{出|だ}し の {帳簿|ちょうぼ} みたい 。 {返却|へんきゃく}{日|び} 、 {守|まも}ろう ね 。 || Like a lending ledger. Let's be back by the due date.

@scene sa.hut_shelf
narr: {棚|たな} に 、 {巡礼|じゅんれい} の {人|ひと} たち が {忘|わす}れて いった もの が {並|なら}んで いる 。 || On the shelf, things the pilgrims left behind.
narr: {木|き} の {独楽|こま} 。 {竹|たけ} の {笛|ふえ} 。 {片方|かたほう} だけ の {手袋|てぶくろ} 。 {度|ど} の {強|つよ}い {眼鏡|めがね} 。 || A wooden top. A bamboo flute. One glove. A pair of very strong spectacles.
sa_oyone: {取|と}り に {来|く}る {人|ひと} も いる 。 {来|こ}ない {人|ひと} も いる 。 {捨|す}てる わけ に も いかない から ね 。 || Some come back for their things. Some don't. I can hardly throw them out.

@scene sa.hut_tea
narr: {湯呑|ゆの}み が {二|ふた}つ 。 {一|ひと}つ は {縁|ふち} が {欠|か}けて いる 。 {欠|か}けた ほう が 、 よく {使|つか}われて いる らしい 。 || Two teacups. One has a chipped rim. It's the chipped one that seems to get used most.

@scene sa.oyone_first
sa_oyone: おや 、 {上|うえ} へ {行|い}く {客|きゃく} は {久|ひさ}しぶり だ 。 {寒|さむ}かった だろう 。 {火|ひ} に あたり な 。 || Well, now. It's been a while since anyone went up. You must be frozen. Get by the fire.
sa_oyone: オヨネ だ よ 。 この {小屋|こや} の {番|ばん} を してる 。 {昔|むかし} は 、 {上|うえ} へ {行|い}く {人|ひと} の {荷|に} を {担|かつ}いで {登|のぼ}って た 。 || I'm Oyone. I keep this hut. Used to carry people's bags up the mountain, in the old days.
sa_oyone: {三十年|さんじゅうねん} {前|まえ} の {大水|おおみず} の {後|あと} は 、 {泣|な}き ながら {登|のぼ}って くる {人|ひと} が {多|おお}かった 。 {下|くだ}る {時|とき} は 、 みんな {少|すこ}し {軽|かる}く なって た 。 || After the big flood thirty years back, a lot of folk came up here crying. When they went down again, they were all a little lighter.
sa_oyone[think]: {上|うえ} の カサネ も 、 {最初|さいしょ} は {頼|たの}まれた もの しか {預|あず}からなかった 。 {痩|や}せた {書記|しょき} で ね 。 {眠|ねむ}れない {顔|かお} を して た 。 || That Kasane up top only ever took what they were asked to, at first. A thin clerk. Always had the face of someone who couldn't sleep.
sa_oyone[sad]: ここ {何年|なんねん} か は 、 {誰|だれ} も {登|のぼ}って こない 。 {荷|に} の ほう が 、 {勝手|かって} に {上|うえ} へ {行|い}く ように なった 。 {水路|すいろ} を {通|とお}って ね 。 || These last few years, nobody climbs up. The burdens go up on their own now. Through the conduits.
?(comp=nao) nao: {荷物|にもつ} が {自分|じぶん} で {歩|ある}く なら 、 {配達人|はいたつにん} は {失業|しつぎょう} だ な 。 …… {笑|わら}えない か 。 || If parcels walk themselves, couriers are out of a job. …Not funny, is it.
?(comp=mio) mio: オヨネ さん 、 {手|て} を {見|み}せて ください 。 …… {墨|すみ} が {付|つ}いてる 。 {表|おもて} の {灯籠|とうろう} 、 オヨネ さん が ？ || Oyone, may I see your hands? …There's ink on them. The lantern out front — that's you?
?(comp=mio) sa_oyone[smile]: {下手|へた} な {字|じ} だろう 。 {灯|ひ} は {文句|もんく} を {言|い}わない から ね 。 || Terrible handwriting, isn't it. The lamp doesn't complain.
?(comp=ren) sa_oyone[surprise]: …… その {灯|ひ} 。 そんな に {磨|みが}いて ある {灯|ひ} は 、 {一人|ひとり} しか {知|し}らない 。 あんた 、 ウシオ の {弟子|でし} かい 。 || …That lamp. I only ever knew one person who polished a lamp like that. You're Ushio's apprentice, are you.
?(comp=ren) ren[surprise]: {師匠|ししょう} を 、 {知|し}って いる の です か 。 || You knew my teacher?
?(comp=ren) sa_oyone: {七|なな}{冬|ふゆ} {前|まえ} 、 ここ で お{茶|ちゃ} を {三杯|さんばい} {飲|の}んで いった 。 {値段|ねだん} に {文句|もんく} を {言|い}って 、 {倍|ばい} {払|はら}って いった よ 。 {下|くだ}って は 、 こなかった 。 || Seven winters ago, drank three cups of tea right here. Complained about the price and paid double. Never came back down.
?(comp=suzu) suzu: {三十年|さんじゅうねん} も {荷|に} を {担|かつ}いでた の ？ {腰|こし} の {貸|か}し が 、 {相当|そうとう} {溜|た}まってる ね 。 || Thirty years of hauling bags? Your back must be owed a fortune.
?(comp=suzu) sa_oyone[laugh]: {取|と}り{立|た}て に {来|き}て くれる かい 。 || Going to collect it for me, are you?
sa_oyone: {休|やす}んで いく なら 、 {寝床|ねどこ} は ある よ 。 {上|うえ} へ {行|い}く {前|まえ} に 、 {声|こえ} を かけな 。 || If you want to rest, there's a bed. Give me a shout before you head up.
!call sa.oyone_inn

@scene sa.oyone_inn
sa_oyone: {休|やす}んで いく かい 。 || Staying for a rest?
!choice
* {休|やす}ませて ください 。 || Yes, please. -> rest
* {今|いま} は {大丈夫|だいじょうぶ} 。 || I'm fine for now. -> no
:rest
sa_oyone: {火|ひ} を {足|た}して おく よ 。 {朝|あさ} まで ゆっくり し な 。 || I'll build up the fire. Take it easy till morning.
!inn
sa_oyone[smile]: よく {寝|ね}て た ね 。 {顔色|かおいろ} が いい 。 || You slept well. You've got colour in your face.
!end
:no
sa_oyone: そう かい 。 {無理|むり} は しない ことだ よ 。 || Suit yourself. Don't push too hard.

@scene sa.ushio_grave
narr: {小|ちい}さな {石|いし} 。 {丁寧|ていねい} に {彫|ほ}られた {字|じ} 。 || A small stone. The letters are carefully cut.
narr: 「 ウシオ 、 ここ に {眠|ねむ}る 。 {灯守|ひもり} 。 {最後|さいご} まで {反対|はんたい} した {人|ひと} 。 」 || "Here sleeps Ushio. Lantern keeper. One who disagreed to the very end."
?(sa_hush_down) narr: {石|いし} の {前|まえ} に 、 {野|の}の{花|はな} が {一輪|いちりん} {置|お}いて ある 。 {灯籠|とうろう} に は 、 {火|ひ} が {入|はい}って いる 。 || A single wildflower has been laid before the stone. The lantern post beside it is lit.
!if seen.sa.ushio_grave -> end
!if comp=ren -> ren
?(comp=nao) nao: ウシオ …… レン の {師匠|ししょう} の {名前|なまえ} じゃ なかった か 。 {帰|かえ}り を {待|ま}って た {人|ひと} だ 。 || Ushio… Wasn't that Ren's teacher's name? The one Ren's been waiting for.
?(comp=mio) mio[sad]: ウシオ さん 。 レン さん が 、 ずっと {帰|かえ}り を {待|ま}って いた {人|ひと} 。 …… {伝|つた}えなきゃ 。 || Ushio. The one Ren has waited for all this time. …We'll have to tell them.
?(comp=suzu) suzu[sad]: 「 {反対|はんたい} した {人|ひと} 」 か 。 {墓石|はかいし} の {言葉|ことば} と して は 、 {最高|さいこう} の {褒|ほ}め{言葉|ことば} だ ね 。 {葦|あし}ノ{瀬|せ} の レン の {師匠|ししょう} でしょ 。 {知|し}らせて あげなきゃ 。 || "One who disagreed." As words for a gravestone, that's the highest praise there is. That's Ren's teacher, from Reedwake, isn't it? Someone has to tell them.
!set sa_ushio_found
!end
:ren
!music sorrow
ren: …… || …
ren[closed]: {帰|かえ}って こない はず です ね 。 || No wonder they never came back.
ren: 「 {最後|さいご} まで {反対|はんたい} した 」 。 …… {師匠|ししょう} だ 。 {間違|まちが}い なく 。 || "Disagreed to the very end." …That's my teacher. No question.
narr: レン は {灯|ひ} を {石|いし} の {前|まえ} に {置|お}いて 、 {袖|そで} で {磨|みが}いた 。 もう {十分|じゅうぶん} {光|ひか}って いる のに 。 || Ren sets the lamp down before the stone and polishes it with a sleeve, though it already shines.
ren: {誰|だれ}か が 、 {丁寧|ていねい} に {彫|ほ}って います 。 {敬意|けいい} の ある {字|じ} です 。 || Someone carved this with care. These are respectful letters.
ren[think]: …… {行|い}きましょう 。 {彫|ほ}った {人|ひと} に 、 {聞|き}きたい こと が できました 。 || …Let's go. I have some questions for whoever carved it.
!set sa_ushio_found
!quest ren_ushio 1

@scene sa.gate_first
narr: {石段|いしだん} の {上|うえ} に 、 {書庫|しょこ} が {建|た}って いた 。 || At the top of the stone steps stands the Archive.
narr: {壁|かべ} は {紙|かみ} の よう に {白|しろ}い 。 {窓|まど} に は {灯|ひ} が ある のに 、 {中|なか} から は {何|なに} の {音|おと} も しない 。 || Its walls are paper-white. There is light in the windows, yet no sound at all comes from inside.
narr: {左右|さゆう} の {水路|すいろ} を 、 {黒|くろ}い {水|みず} が {流|なが}れて いく 。 {下|した} から 、 {上|うえ} へ 。 || In the channels to either side, black water flows — from below, upwards.
?(comp=nao) nao: {水|みず} が {坂|さか} を {上|のぼ}る の は 、 {初|はじ}めて {見|み}た 。 …… {気持|きも}ち {悪|わる}い な 。 || First time I've seen water run uphill. …Gives me the creeps.
?(comp=mio) mio: {水|みず} の {中|なか} に 、 {字|じ} が {見|み}える 。 {名前|なまえ} ？ …… {運|はこ}ばれてる ん だ 。 || There are letters in the water. Names? …They're being carried.
?(comp=suzu) suzu: {立派|りっぱ} な {劇場|げきじょう} だ ね 。 {看板|かんばん} が ない けど 。 || Fine theatre. No signboard, though.
?(comp=ren) ren: …… あの {石|いし} 。 {灯守|ひもり} の {墓|はか} の {形|かたち} です 。 || …That stone. It's shaped like a lantern keeper's grave.
?(comp=ren) !call sa.ushio_grave

@scene sa.gate_statue
narr: {本|ほん} を {抱|かか}えた {二人|ふたり} の {石像|せきぞう} 。 {台座|だいざ} に {字|じ} が {彫|ほ}って ある 。 || Two stone figures, each holding a book. There's an inscription on the base.
narr: 「 {写|うつ}して {守|まも}り 、 {求|もと}められれば {返|かえ}す 。 」 || "Copy and keep; when asked, return."
narr: {書庫|しょこ} を {建|た}てた {人|ひと} たち だろう 。 {顔|かお} は {風雨|ふうう} で {削|けず}れて いる 。 || Presumably the people who built the Archive. Their faces have been worn away by wind and rain.

@scene sa.gate_plaque
narr: 「 {静寂|しじま} の {書庫|しょこ} 。 {大火|たいか} と {大水|おおみず} の {後|あと} に {建|た}つ 。 {失|うしな}われた {名|な} を {写|うつ}し{置|お}く ため に 。 」 || "The Still Archive. Built after the great fires and floods, to keep copies of names that were lost."
?(sa_hush_down&!post) narr: {札|ふだ} の {下|した} に 、 {新|あたら}しい {紙|かみ} が {貼|は}られて いる 。 「 {写|うつ}し だけ 。 {何|なに} も {取|と}らない 。 」 || Beneath the plaque, a new sheet has been pasted: "Copies only. Nothing taken."
?(post&end_archive_library) narr: {札|ふだ} の {下|した} に 、 {新|あたら}しい {札|ふだ} 。 「 {名|な} の {図書館|としょかん} 。 {誰|だれ} でも {読|よ}める 。 {何|なに} も {取|と}らない 。 」 || Beneath it, a new plaque: "A library of names. Anyone may read. Nothing is taken."
?(post&end_archive_closed) narr: {札|ふだ} の {下|した} に 、 {新|あたら}しい {札|ふだ} 。 「 {役目|やくめ} を {終|お}える 。 {名|な} は 、 {呼|よ}ばれる {所|ところ} に {住|す}む 。 」 || Beneath it, a new plaque: "Its work is done. Names live where they are called."

@scene sa.gate_sealed
narr: {扉|とびら} は {封|ふう} を されて いる 。 {封|ふう} の {紙|かみ} に 、 {丁寧|ていねい} な {字|じ} 。 「 {閉|へい}{館|かん} 。 ご{用|よう} の {方|かた} は 、 {最後|さいご} の {灯|ひ} の {小屋|こや} へ 。 」 || The doors are sealed. On the seal, in a careful hand: "Closed. Enquiries to the Last Lamp Hut."
`, 'ch6/scenes-road');
