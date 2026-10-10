/* Kotonoha, Chapter 9: the island's people in its three phases (expansion P11; R4: "three versions of resident
 * dialogue, one per story phase"): an early visit by the player's own boat (before Lanternfall is over), Chapter 9
 * itself, after the chapter, and after the ending (postgame). What each person knows follows the phase: nobody speaks
 * of the roots before the hollow opens, or of the mountain before the ending. And the small places: the census board,
 * Otoha's shelves, the hall's records, the lodging house's beds, the tide calendar, the sea cave. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
# ---- Nami, keeper and boatwoman --------------------------------------------------------------------------------------
@scene ko.nami_early
!faceplayer
ko_nami: {自分|じぶん} の {船|ふね} で {来|き}た の ？ {度胸|どきょう} が ある ね 。 この {辺|あた}り の {潮|しお} は 、 {読|よ}み{方|かた} を {知|し}らない と {流|なが}される よ 。 || You came in your own boat? You've got nerve. Around here, if you can't read the tides, they carry you off.
ko_nami: {葉|は} を {届|とど}けに {陸|りく} へ {漕|こ}いで いく の が 、 わたし の {仕事|しごと} 。 {最近|さいきん} は 、 {漕|こ}いで も {漕|こ}いで も {間|ま}に{合|あ}わない けど 。 || Rowing leaves home to the mainland is my job. Lately, row as I might, I can't keep up.
@scene ko.nami_ch9
!faceplayer
?(quest.ko_main<=2) ko_nami: {葉|は} を {返|かえ}す とき は 、 {風石|かぜいし} に {任|まか}せて いい 。 {遠|とお}い {所|ところ} の {葉|は} は 、 わたし が {舟|ふね} で {運|はこ}ぶ 。 || When you send a leaf home, leave it to the Wind Stone. Leaves for far places, I take by boat.
?(quest.ko_main>=4) ko_nami[worry]: {根|ね} の {洞|ほら} に {下|お}りる の ？ {潮|しお} が {入|はい}る から 、 {気|き} を つけて 。 {潮|しお} は {待|ま}って くれない 。 でも 、 {必|かなら}ず {引|ひ}く 。 || You're going down into the Root Hollows? The tide comes in down there, so take care. The tide won't wait for you. But it always goes out again.
?(quest.ko_main=3) ko_nami: {館|やかた} の {板|いた} 、 {楽|たの}しみ に してる 。 {舟|ふね} の {話|はなし} も 、 {一枚|いちまい} ぐらい {入|はい}れて くれる と うれしい な 。 || I'm looking forward to the hall's panels. I'd like it if the boat story got on one, at least.
@scene ko.nami_after
!faceplayer
ko_nami[smile]: {葉|は} の {数|かず} が 、 {漕|こ}げる {数|かず} に {戻|もど}った 。 {腕|うで} が {喜|よろこ}んでる よ 。 || The leaves are back to as many as I can row. My arms are delighted.
ko_nami: {陸|りく} へ {帰|かえ}る なら 、 テツ さん の {船|ふね} が {桟橋|さんばし} に いる 。 || If you're going back to the mainland, Tetsu's boat is at the jetty.
@scene ko.nami_post
!faceplayer
ko_nami: {紙|かみ} みたい な {葉|は} が 、 {来|こ}なく なった 。 {北|きた} の {山|やま} で 、 {何|なに} か が {片付|かたづ}いた ん だ ね 。 …… {聞|き}かない で おく よ 。 || The paper-like leaves have stopped. Something got settled up in the northern mountains. …I won't ask.

# ---- Hamaji, net-mender -----------------------------------------------------------------------------------------------
@scene ko.hamaji_early
!faceplayer
ko_hamaji: {網|あみ} の {目|め} から 、 {葉|は} が {抜|ぬ}けて いく 。 {魚|さかな} より {多|おお}い ぞ 。 || Leaves slip out through the mesh of my nets. More of them than fish.
@scene ko.hamaji_ch9
!faceplayer
?(quest.ko_main<4) ko_hamaji: {網|あみ} は {毎日|まいにち} {直|なお}さない と いけない 。 {言葉|ことば} も 、 {同|おな}じ だろう 。 || Nets need mending every day. Words too, I'd say.
?(quest.ko_main>=4) ko_hamaji: {根|ね} の {下|した} は 、 {海|うみ} と {繋|つな}がって いる 。 {昔|むかし} から 、 {海蛇|うみへび} の {腹|はら} の {中|なか} だ と {言|い}う だろう 。 …… {冗談|じょうだん} だ 。 {潮|しお} に だけ は 、 {気|き} を つけろ 。 || Under the roots, it joins the sea. We've always said it's the serpent's belly. …That's a joke. Just mind the tide.
@scene ko.hamaji_after
!faceplayer
ko_hamaji[laugh]: {孫|まご} に {話|はな}す {話|はなし} が 、 {一|ひと}つ {増|ふ}えた な 。 {根|ね} の {下|した} の {庭|にわ} の {話|はなし} だ 。 {海蛇|うみへび} より 、 {怖|こわ}がる かな 。 || One more story to tell the grandchildren. The garden under the roots. Will it scare them more than the serpent, I wonder.
@scene ko.hamaji_post
!faceplayer
ko_hamaji: {嵐|あらし} の {後|あと} の {葉|は} が 、 {静|しず}か に なった 。 {叫|さけ}び{声|ごえ} が 、 {減|へ}った 。 …… {海|うみ} も 、 {落|お}ち{着|つ}いた ん だろう 。 || The leaves after storms have gone quiet. Fewer shouts. …The sea's settled too, I suppose.

# ---- Tokio, the census -------------------------------------------------------------------------------------------------
@scene ko.tokio_early
!faceplayer
ko_tokio: {今日|きょう} {拾|ひろ}った {葉|は} は 、 {三百|さんびゃく} {十二枚|じゅうにまい} 。 …… {昨日|きのう} の {分|ぶん} が 、 まだ {数|かぞ}え{終|お}わって いない 。 || Leaves gathered today: three hundred and twelve. …I still haven't finished counting yesterday's.
@scene ko.tokio_ch9
!faceplayer
?(!ko_done) ko_tokio[worry]: {昔|むかし} は {一日|いちにち} {十枚|じゅうまい} {程度|ていど} でした 。 {今|いま} は {千枚|せんまい} を {超|こ}える {日|ひ} も あります 。 {記録|きろく} が 、 {木|き} に {追|お}いつきません 。 || It used to be about ten a day. Now some days it's over a thousand. The records can't keep up with the tree.
@scene ko.tokio_after
!faceplayer
ko_tokio[smile]: {今日|きょう} は {十一枚|じゅういちまい} 。 {一枚|いちまい} {一枚|いちまい} 、 {書|か}き{写|うつ}せる {数|かず} です 。 {帳面|ちょうめん} が 、 やっと {息|いき} を して います 。 || Eleven today. A number I can copy out leaf by leaf. My ledger can finally breathe.
@scene ko.tokio_post
!faceplayer
ko_tokio: {紙|かみ} の {切|き}れ{端|はし} の よう な {葉|は} は 、 {記録|きろく} の {上|うえ} で は 、 もう {何週間|なんしゅうかん} も {零|ゼロ} です 。 {数字|すうじ} が {静|しず}か な の は 、 いい こと です 。 || The leaves like torn pages: in the records, zero for weeks now. Quiet numbers are good numbers.
@scene ko.census_board
!gesture pc read 13,12
narr: {葉守|はもり} の {数|かず} の {板|いた} 。 {一日|いちにち} ごと に 、 {拾|ひろ}った {葉|は} の {数|かず} が {書|か}いて ある 。 || The keepers' tally board: the leaves gathered, day by day.
?(!ko_done) narr: {古|ふる}い {方|ほう} は {十|じゅう} 、 {十二|じゅうに} 、 {九|きゅう} …… {新|あたら}しい {方|ほう} は 、 {三百|さんびゃく} 、 {六百|ろっぴゃく} 、 {千百|せんひゃく} 。 || The old ones read ten, twelve, nine… the new ones, three hundred, six hundred, eleven hundred.
?(ko_done) narr: {一番|いちばん} {新|あたら}しい {数|かず} は 、 {十一|じゅういち} 。 その {横|よこ} に 、 {小|ちい}さく {花|はな} の {絵|え} が {描|か}いて ある 。 || The newest number is eleven. Beside it, someone has drawn a small flower.

# ---- Nana and Ao -------------------------------------------------------------------------------------------------------
@scene ko.nana_early
!faceplayer
ko_nana[happy]: わたし 、 {字|じ} が よめる の ！ 「は」 と 「ほ」 と 「ま」 ！ アオ は 、 まだ よめない の 。 ないしょ ね 。 || I can read! は and ほ and ま! Ao can't read yet. It's a secret.
@scene ko.nana_ch9
!faceplayer
?(quest.ko_main<4) ko_nana: {葉|は} の {字|じ} 、 よんで あげよう か ？ ひらがな なら 、 {半分|はんぶん} ぐらい わかる よ 。 || Shall I read a leaf for you? I know about half the hiragana.
?(quest.ko_main>=4) ko_nana[worry]: {根|ね} の {下|した} に {行|い}く の ？ {暗|くら}い よ 。 …… {帰|かえ}って きたら 、 なに が あった か {教|おし}えて ね 。 || You're going under the roots? It's dark there. …When you come back, tell me what happened.
@scene ko.nana_after
!faceplayer
ko_nana[happy]: おかえり ！ {根|ね} の {下|した} の お{話|はなし} 、 {聞|き}かせて ！ …… えっ 、 お{庭|にわ} が あった の ？ いい なあ 。 || Welcome back! Tell me about under the roots! …There was a garden? I wish I'd seen it.
@scene ko.nana_post
!faceplayer
ko_nana: わたし 、 カタカナ も よめる よう に なった の 。 つぎ は {漢字|かんじ} ！ || I can read katakana now too. Kanji next!
@scene ko.ao_early
!faceplayer
ko_ao: …… なに 。 {葉|は} を {拾|ひろ}ってる だけ 。 {読|よ}む の は 、 {他|ほか} の {人|ひと} の {仕事|しごと} だ から 。 || …What. I'm just picking up leaves. Reading them is someone else's job.
@scene ko.ao_ch9
!faceplayer
?(quest.ko_main<4) ko_ao: {籠|かご} を {一杯|いっぱい} に する の は 、 {僕|ぼく} が {一番|いちばん} {早|はや}い ん だ 。 …… {読|よ}む の は 、 {遅|おそ}い けど 。 || My basket fills up fastest of anyone. …Reading them, I'm slow.
?(quest.ko_main>=4) ko_ao: {根|ね} の {洞|ほら} 、 {僕|ぼく} も {入|はい}った こと ない 。 …… {怖|こわ}く ない よ 。 {入|はい}る {用事|ようじ} が ない だけ 。 || The Root Hollows: I've never been in either. …I'm not scared. I just haven't had any reason to go.
@scene ko.ao_leaf
!faceplayer
ko_ao: これ 、 {籠|かご} の {底|そこ} に あった 。 {四角|しかく} い {大|おお}きな {字|じ} 。 …… {読|よ}めない から 、 あげる 。 || This was at the bottom of my basket. Big square writing. …I can't read it, so you have it.
!give ko_leaf_mb
?(comp=nao) comp: {読|よ}めない の は 、 {恥|は}ずかしい こと じゃ ない ぞ 。 {俺|おれ} も 、 {字|じ} の {汚|きたな}い {宛名|あてな} は {読|よ}めない 。 || Not being able to read isn't anything to be ashamed of. I can't read messy addresses either.
?(comp=mio) comp[smile]: ありがとう 、 アオ くん 。 {一緒|いっしょ} に {読|よ}んで みよう か 。 || Thank you, Ao. Shall we read it together?
?(comp=ren) comp: {拾|ひろ}う {人|ひと} が いる から 、 {読|よ}む {人|ひと} が {読|よ}める の です よ 。 || If no one picked them up, no one could read them.
?(comp=suzu) comp: {裏方|うらかた} が いない と 、 {役者|やくしゃ} は {台詞|せりふ} も {言|い}えない の よ 。 {胸|むね} を {張|は}り なさい 。 || Without the stagehands, the actors couldn't say a line. Hold your head up.
@scene ko.ao_after
!faceplayer
ko_ao: {庭|にわ} が あった って ？ …… {僕|ぼく} も 、 いつか {行|い}く 。 {字|じ} が {読|よ}める よう に なったら 。 || There was a garden? …I'll go some day. When I can read.
@scene ko.ao_post
!faceplayer
ko_ao: {今日|きょう} 、 {一枚|いちまい} {読|よ}めた 。 「おかえり」 って {書|か}いて あった 。 …… {誰|だれ} に も {言|い}う な よ 。 || I read one today. It said おかえり, welcome home. …Don't tell anyone.

# ---- Yoshino, the teacher ----------------------------------------------------------------------------------------------
@scene ko.yoshino_early
!faceplayer
ko_yoshino: {朝|あさ} は 、 ここ で {子供|こども} たち に {字|じ} を {教|おし}えて います 。 {六人|ろくにん} しか いない けれど 、 {六人|ろくにん} {分|ぶん} {賑|にぎ}やか です よ 。 || In the mornings I teach the children their letters here. There are only six of them, but they make noise enough for six.
@scene ko.yoshino_ch9
!faceplayer
?(!tell_ko.t_hall_ok) ko_yoshino: {館|やかた} の {壁|かべ} の {板|いた} は 、 {何年|なんねん} も {空|から} の まま 。 {誰|だれ} の {話|はなし} を {掛|か}ける か 、 {葉守|はもり} の {間|あいだ} で {決|き}まらなかった の です 。 || The panels on the hall's walls have been blank for years. The keepers never could agree whose story to hang.
?(tell_ko.t_hall_ok) ko_yoshino[smile]: {子供|こども} たち が 、 {板|いた} の {前|まえ} で {喧嘩|けんか} して います 。 「わたし は {海蛇|うみへび} の {話|はなし} が いい 」 「{僕|ぼく} は {舟|ふね} ！」 …… いい {授業|じゅぎょう} に なりそう です 。 || The children are arguing in front of the panels. "I like the serpent one!" "The boat!" …It'll make a good lesson.
@scene ko.yoshino_after
!faceplayer
ko_yoshino: アオ が 、 {朝|あさ} の {授業|じゅぎょう} を {窓|まど} の {外|そと} から {聞|き}いて いる の です 。 …… {気付|きづ}かない ふり を して います 。 || Ao listens to the morning lessons from outside the window. …I'm pretending not to notice.
@scene ko.yoshino_post
!faceplayer
ko_yoshino[smile]: アオ が 、 {窓|まど} の {外|そと} から {中|なか} に {入|はい}って きました 。 {一番|いちばん} {後|うし}ろ の {席|せき} です けど 。 || Ao has come in from outside the window. To the back row, but in.
@scene ko.hall_shelf
!gesture pc read
narr: {葉守|はもり} の {記録|きろく} の {棚|たな} 。 {返|かえ}した {葉|は} の {行|い}き{先|さき} が 、 {何百年|なんびゃくねん} {分|ぶん} {並|なら}んで いる 。 || The keepers' records: where every returned leaf went, centuries of them.

# ---- Otoha's house -----------------------------------------------------------------------------------------------------
@scene ko.otoha_shelf
!gesture pc observe
narr: {押|お}し{葉|ば} に した {葉|は} が 、 {棚|たな} {一杯|いっぱい} に {並|なら}んで いる 。 {返|かえ}す {先|さき} の 、 {見|み}つからなかった {葉|は} らしい 。 || Pressed leaves fill the shelves: the ones whose homes were never found, it seems.
?(ko_done) narr: {一番|いちばん} {上|うえ} の {段|だん} に 、 {新|あたら}しい {押|お}し{葉|ば} が {一枚|いちまい} 。 「チトセ」 と {札|ふだ} が {付|つ}いて いる 。 || On the top shelf, one new pressed leaf, labelled "Chitose".

# ---- Mitsu, the lodging house ------------------------------------------------------------------------------------------
@scene ko.mitsu_early
!faceplayer
ko_mitsu[smile]: {船|ふね} で {来|き}た お{客|きゃく} さん ！ {珍|めずら}しい わ ね 。 お{腹|なか} すいてる でしょう 。 {魚|さかな} の お{汁|しる} が ある わ よ 。 || A guest who came by boat! How unusual. You must be hungry. There's fish soup.
@scene ko.mitsu_ch9
!faceplayer
?(quest.ko_main<4) ko_mitsu: {寝|ね}る {所|ところ} なら 、 {奥|おく} の {布団|ふとん} を {使|つか}って ね 。 {葉|は} が {窓|まど} から {入|はい}って くる けど 、 {気|き} に しない で 。 || If you need a bed, use the futons in the back. Leaves come in through the window, but don't mind them.
?(quest.ko_main>=4) ko_mitsu[worry]: {根|ね} の {下|した} に {行|い}く ん です って ？ …… {帰|かえ}って きたら 、 {温|あたた}かい もの を {作|つく}って {待|ま}ってる から 。 || You're going under the roots? …I'll have something warm waiting when you come back.
@scene ko.mitsu_after
!faceplayer
ko_mitsu[happy]: お{帰|かえ}り なさい ！ ほら 、 {約束|やくそく} の お{汁|しる} 。 {二人|ふたり} {分|ぶん} 、 {大盛|おおも}り よ 。 || Welcome back! Here, the soup I promised. Two big bowls.
@scene ko.mitsu_post
!faceplayer
ko_mitsu: {最近|さいきん} は 、 {陸|りく} から の お{客|きゃく} さん が {増|ふ}えた の 。 {葉|は} を {見|み}に {来|く}る ん です って 。 {宿|やど} が {賑|にぎ}やか で 、 {嬉|うれ}しい わ 。 || More guests from the mainland lately. They come to see the leaves. The lodging house is lively, and I'm glad.
@scene ko.lodge_rest
narr: {布団|ふとん} に {横|よこ} に なる 。 {窓|まど} から 、 {葉|は} が {一枚|いちまい} 、 {枕|まくら} の {横|よこ} に {落|お}ちて きた 。 || You lie down on the futon. A leaf drifts in through the window and lands by the pillow.
!heal
!checkpoint

# ---- Koyomi, the tide calendar ----------------------------------------------------------------------------------------
@scene ko.koyomi_early
!faceplayer
ko_koyomi: {月|つき} の {形|かたち} を {見|み}れば 、 {潮|しお} が {分|わ}かります 。 {満月|まんげつ} と {新月|しんげつ} の {頃|ころ} は 、 {潮|しお} が {大|おお}きく {引|ひ}く の です 。 || Read the moon's shape and you know the tide. Around the full moon and the new moon, the tide goes out a long way.
@scene ko.koyomi_ch9
!faceplayer
?(!ko_lowtide) ko_koyomi: {東|ひがし} の {海|うみ} の {洞|ほら} へ {行|い}きたい の なら 、 {潮|しお} が {引|ひ}く {日|ひ} を {選|えら}ばない と 。 {石|いし} の {暦|こよみ} を {一緒|いっしょ} に {読|よ}みましょう か 。 || If you want the sea cave to the east, you have to choose a day when the tide goes out. Shall we read the stone calendar together?
?(ko_lowtide) ko_koyomi[smile]: {今日|きょう} は {大潮|おおしお} 。 {東|ひがし} の {岩場|いわば} が 、 {夕方|ゆうがた} まで {出|で}て います よ 。 || Spring tide today. The eastern rocks are out until evening.
@scene ko.koyomi_after
!faceplayer
ko_koyomi: {根|ね} の {下|した} の {潮|しお} は 、 {暦|こよみ} に は {書|か}いて ありません でした 。 …… {書|か}き{足|た}して おきます 。 || The tide under the roots wasn't on the calendar. …I'll add it.
@scene ko.koyomi_post
!faceplayer
ko_koyomi: {潮|しお} は {変|か}わりません 。 {人|ひと} が {変|か}わる だけ 。 …… {誰|だれ} か が 、 {同|おな}じ こと を {言|い}って いました ね 。 || The tide doesn't change. Only people do. …Somebody else says that, don't they.

# ---- the sea cave ------------------------------------------------------------------------------------------------------
@scene ko.seacave_first
!set ko_seacave_seen
narr: {岩場|いわば} を {回|まわ}る と 、 {海|うみ} の {洞|ほら} 。 {奥|おく} の {平|たい}ら な {岩|いわ} は 、 まるで {舞台|ぶたい} の よう だ 。 {波|なみ} の {音|おと} が 、 {拍手|はくしゅ} の よう に {響|ひび}く 。 || Round the rocks, a sea cave. The flat rock at the back is just like a stage. The waves echo like applause.
?(comp=suzu) comp[surprise]: …… {本物|ほんもの} の {舞台|ぶたい} より 、 {舞台|ぶたい} らしい わ 。 || …More of a stage than a real one.
@scene ko.cave_conch
!gesture pc bend
narr: {洞|ほら} の {法螺貝|ほらがい} は 、 {人|ひと} の {声|こえ} で は なく 、 {波|なみ} の {音|おと} だけ を {覚|おぼ}えて いる 。 {何百年|なんびゃくねん} {分|ぶん} の 、 {同|おな}じ {音|おと} 。 || This cave's conch keeps no voices, only the sound of the waves: centuries of the same sound.
`);

RB.script.add(`
@scene ko.tidestone
# The tide calendar's standing stone (Koyomi's): the moon's phases cut round a disc. Reading it finds the next low
# tide, which opens the rocks round to the sea cave (the Tide Calendar, 24_scenes_side.js, takes it further).
!gesture pc read 29,3
narr: {潮|しお} の {暦|こよみ} の {石|いし} 。 {月|つき} の {形|かたち} が 、 {円|えん} の {周|まわ}り に {彫|ほ}って ある 。 || The tide calendar's stone: the moon's shapes cut round a circle.
!if ko_lowtide -> known
!challenge ko.tide_read
!if var._res=0 -> later
!set ko_lowtide
narr: {今日|きょう} は {大潮|おおしお} 。 {東|ひがし} の {岩場|いわば} は 、 {夕方|ゆうがた} まで {歩|ある}ける 。 || A spring tide today: the eastern rocks can be walked until evening.
!end
:later
narr: {月|つき} の {形|かたち} と {潮|しお} の {関係|かんけい} を 、 もう {一度|いちど} {考|かんが}えよう 。 コヨミ が {知|し}って いる 。 || Think again how the moon's shape and the tide go together. Koyomi knows.
!end
:known
narr: {今日|きょう} は {大潮|おおしお} 。 {東|ひがし} の {岩場|いわば} が {出|で}て いる 。 || A spring tide today: the eastern rocks are out.
`);
