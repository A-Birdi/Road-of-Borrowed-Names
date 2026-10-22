/* Steamhollow, Chapter 11: the side stories' scenes (expansion P13f; quests and wiring in 25_side.js, tasks in
 * 35_side_learning.js). The masseur's song, the double-booked wedding, the retired actor, eggs for the newcomers and
 * the footbath poet's story room (A38). Suzu's lines have Kansai versions (kansai_99_yn.js). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
@scene yn.bunkichi
# Bunkichi, the masseur: works by touch and by his teacher's song, whose words he has lost.
!faceplayer
!if quest.yn_masseur=1 -> song
!if quest.yn_masseur=0 -> wait
yn_bunkichi: {按摩|あんま} の ブンキチ で ござい 。 …… {肩|かた} が {凝|こ}って おいで だ ね 。 {足音|あしおと} で {分|わ}かる 。 || Bunkichi the masseur, at your service. …Your shoulders are stiff. I can tell by your footsteps.
yn_bunkichi: {師匠|ししょう} は 、 {揉|も}み ながら {歌|うた} を {歌|うた}った 。 {節|ふし} は {手|て} が {覚|おぼ}えて いる 。 だが 、 {言葉|ことば} を {忘|わす}れて しまって ね 。 {歌|うた} の ない {按摩|あんま} は 、 {手|て} だけ が {急|いそ}ぐ 。 || My teacher sang as he worked. My hands remember the tune. But I've lost the words. Without the song, the hands rush.
yn_bunkichi: {谷|たに} の {古|ふる}い {者|もの} なら 、 {一行|いちぎょう} ぐらい {覚|おぼ}えて いる かも しれん 。 {上|かみ}の{湯|ゆ} の {仲居|なかい} 、 {下駄屋|げたや} の {爺|じい}さん 、 それ と …… {尾根|おね} の {方|ほう} でも 、 {歌|うた}って いた と {聞|き}く 。 || The old ones in the valley might remember a line. The maid at the Upper House, the old geta-maker, and… I hear they sang it up on the ridge, too.
!quest yn_masseur 0
!end
:wait
yn_bunkichi: {一行|いちぎょう} でも 、 {集|あつ}まったら {聞|き}かせて おくれ 。 || Even one line: when you have it, let me hear.
!end
:song
yn_bunkichi: {三行|さんぎょう} 。 …… {順番|じゅんばん} は 、 どう だった か 。 {一緒|いっしょ} に {並|なら}べて くれる かい 。 || Three lines. …What was the order? Will you help me put them right?
!challenge yn.masseur_song
narr: ブンキチ は {手|て} を {擦|す}り{合|あ}わせ 、 {小|ちい}さな {声|こえ} で {歌|うた}い ながら 、 あなた の {肩|かた} を {揉|も}んだ 。 {手|て} が 、 {歌|うた} と {同|おな}じ {速|はや}さ で {動|うご}く 。 || Bunkichi rubs his hands together and kneads your shoulders, singing softly. His hands move at the song's pace.
!heal
yn_bunkichi: …… {師匠|ししょう} の {声|こえ} が 、 {手|て} に {戻|もど}って きた 。 ありがとう よ 。 || …My teacher's voice has come back to my hands. Thank you.
?(comp=nao) comp[closed]: …… {首|くび} も 、 {頼|たの}んで いい か 。 {鞄|かばん} の {紐|ひも} で 、 {十年|じゅうねん} {凝|こ}って いる 。 || …Could you do my neck too? Ten years of satchel strap.
?(comp=mio) comp[smile]: {歌|うた} で {速|はや}さ を {揃|そろ}える ん です ね 。 {薬|くすり} を {煎|せん}じる {時|とき} も 、 {同|おな}じ です 。 || The song keeps the pace even. It's the same when I brew medicine.
?(comp=ren) comp[smile]: {言葉|ことば} が {戻|もど}る と 、 {手|て} も {戻|もど}る 。 {灯|ひ} と {名前|なまえ} と {同|おな}じ です ね 。 || When the words come back, so do the hands. Like lamps and their names.
?(comp=suzu) comp[laugh]: {台詞|せりふ} が {戻|もど}った {役者|やくしゃ} の {顔|かお} ね 。 {見|み}れば {分|わ}かる わ 。 || That's the face of an actor who's got his lines back. I'd know it anywhere.
!quest yn_masseur done
:end

@scene yn.bunkichi_idle
!faceplayer
yn_bunkichi: {揉|も}み{歌|うた} は 、 {毎日|まいにち} {歌|うた}って いる よ 。 {客|きゃく} が {寝|ね}て しまう の が 、 {玉|たま}に {瑕|きず} だ が ね 。 || I sing the song every day now. The only flaw is that the customers fall asleep.

@scene yn.verse_okiyo
!faceplayer
!set yn_verse1
yn_okiyo: {揉|も}み{歌|うた} で ございます か 。 {祖母|そぼ} が {歌|うた}って おりました 。 「{肩|かた} の {山|やま} 、 {谷|たに} に {下|お}りて 、 {湯|ゆ} に なる 」 …… {一行|いちぎょう} だけ です けれど 。 || The massage song? My grandmother used to sing it. "The mountain of the shoulders goes down to the valley and turns to water"… That's only one line, though.
!journal {揉|も}み{歌|うた} の {一行|いちぎょう} ： 「{肩|かた} の {山|やま} 、 {谷|たに} に {下|お}りて 、 {湯|ゆ} に なる 」 。 || A line of the massage song: "The mountain of the shoulders goes down to the valley and turns to water."
?(yn_verse2&yn_verse3) !quest yn_masseur 1

@scene yn.verse_kihachi
!faceplayer
!set yn_verse2
yn_kihachi: {揉|も}み{歌|うた} か 。 {子供|こども} の {頃|ころ} 、 {親父|おやじ} が {揉|も}まれ ながら {一緒|いっしょ} に {歌|うた}って いた 。 「{凝|こ}り は {石|いし} 、 {石|いし} は {砂|すな} 」 。 || The massage song? When I was a boy my father sang along while he was being massaged. "A knot is a stone; the stone turns to sand."
!journal {揉|も}み{歌|うた} の {一行|いちぎょう} ： 「{凝|こ}り は {石|いし} 、 {石|いし} は {砂|すな} 」 。 || A line of the massage song: "A knot is a stone; the stone turns to sand."
?(yn_verse1&yn_verse3) !quest yn_masseur 1

@scene yn.verse_oshige
!faceplayer
!set yn_verse3
yn_oshige: …… {揉|も}み{歌|うた} です 。 {村|むら} で 、 {稲刈|いねか}り の {後|あと} に {歌|うた}いました 。 {最後|さいご} の {行|ぎょう} は 、 「{明日|あした} も {歩|ある}ける 、 {軽|かる}い {足|あし} 」 。 …… {村|むら} で 、 {最後|さいご} に {歌|うた}った の は 、 いつ だった か 。 || …The massage song. We sang it in the village after the rice harvest. The last line goes, "Light feet, to walk again tomorrow." …When did we last sing it in the village, I wonder.
!journal {揉|も}み{歌|うた} の {最後|さいご} の {一行|いちぎょう} ： 「{明日|あした} も {歩|ある}ける 、 {軽|かる}い {足|あし} 」 。 || The last line of the massage song: "Light feet, to walk again tomorrow."
?(yn_verse1&yn_verse2) !quest yn_masseur 1

@scene yn.oshige
!faceplayer
yn_oshige: {竹|たけ} の {間|ま} 、 {階段|かいだん} が なくて {助|たす}かります 。 …… {膝|ひざ} が {悪|わる}い と 、 {誰|だれ} か が {覚|おぼ}えて いて くれた の が 、 {嬉|うれ}しくて 。 || The Bamboo room, with no stairs: such a help. …I was glad someone remembered about my knees.
?(yn_mio_back) yn_oshige: {薬師|くすし} の {娘|むすめ} さん に 、 {一晩中|ひとばんじゅう} {看|み}て もらいました 。 {目|め} を {覚|さ}ましたら 、 {歌|うた} を {歌|うた}って くれて いた 。 || The young apothecary sat with me all night. When I woke, she was singing to me.

@scene yn.kume
# The go-between who booked both inns for one feast.
!faceplayer
yn_kume: {困|こま}りました 。 {花婿|はなむこ} の {家|いえ} は {上|かみ}の{湯|ゆ} 、 {花嫁|はなよめ} の {家|いえ} は {下|しも}の{湯|ゆ} 。 {両家|りょうけ} が それぞれ {宴|うたげ} を {頼|たの}んで 、 {同|おな}じ {夜|よる} に {二|ふた}つ の {宴|うたげ} に なって しまった の です 。 || I'm in a fix. The groom's family wants the Upper House, the bride's the Lower House. Each booked a feast, and now there are two feasts on the same night.
yn_kume: どちら か を {断|ことわ}れば 、 どちら か の {家|いえ} の {顔|かお} が {潰|つぶ}れます 。 {花婿|はなむこ} の ヨシマツ さん は 、 {下|しも} の {町|まち} の {橋|はし} の {向|む}こう に います 。 || Cancel either and one family loses face. Yoshimatsu, the groom, is across the bridge in the lower town.
!quest yn_wedding 0

@scene yn.yoshimatsu
!faceplayer
!if quest.yn_wedding<0 -> plain
yn_yoshimatsu: {宴|うたげ} ？ {僕|ぼく} は 、 {物置|ものおき} でも いい ん です 。 オセン と {一緒|いっしょ} なら 。 {手紙|てがみ} の {予約|よやく} {騒|さわ}ぎ は 、 もう {勘弁|かんべん} して ほしい 。 || The feast? I'd be happy in a shed. As long as it's with Osen. I've had enough of booking letters.
yn_yoshimatsu: ただ 、 {両方|りょうほう} の {母|はは} が 、 {相手|あいて} の {宿|やど} に は {一歩|いっぽ} も {入|はい}らない と {言|い}って いて …… 。 || Only, both our mothers say they won't set foot in the other's inn…
!quest yn_wedding 1
!end
:plain
yn_yoshimatsu: {来月|らいげつ} 、 {結婚|けっこん} します 。 …… {予約|よやく} の {手紙|てがみ} が 、 {山|やま} の よう に {来|く}る ん です 。 || I'm getting married next month. …Booking letters arrive by the mountain-load.

@scene yn.yoshimatsu_after
!faceplayer
yn_yoshimatsu: {寄合所|よりあいじょ} の {宴|うたげ} 、 {両方|りょうほう} の {宿|やど} の {料理|りょうり} が {並|なら}ぶ ん です 。 {母|はは} たち は 、 {相手|あいて} の {料理|りょうり} を {褒|ほ}め{合|あ}って いました 。 {悔|くや}しそう に 。 || The feast at the guild hall: dishes from both inns side by side. Our mothers were praising each other's food. Through gritted teeth.

@scene yn.kume_plan
!faceplayer
yn_kume: {両家|りょうけ} の {顔|かお} が {立|た}つ {方法|ほうほう} 、 {何|なに} か ございます か 。 || Is there any way for both families to save face?
!challenge yn.wedding
!if var._res=0 -> later
yn_kume: {寄合所|よりあいじょ} で 、 {両方|りょうほう} の {宿|やど} が {半分|はんぶん} ずつ {料理|りょうり} を {作|つく}る 。 …… どちら の {宿|やど} でも ない {場所|ばしょ} なら 、 どちら の {母|はは} も {入|はい}れます ね ！ || The guild hall, with each inn cooking half the dishes. …Somewhere that belongs to neither inn: both mothers can go in!
yn_kume: {女将|おかみ} と {主|あるじ} は 、 {相手|あいて} より {美味|おい}しい もの を {作|つく}る と {言|い}って 、 もう {張|は}り{切|き}って います よ 。 || The proprietress and the master are each already swearing they'll cook better than the other.
?(comp=suzu) comp[laugh]: {張|は}り{合|あ}い で {腕|うで} が {上|あ}がる なら 、 {結構|けっこう} な {喧嘩|けんか} ね 。 || If rivalry improves the cooking, that's a fine sort of quarrel.
!quest yn_wedding done
!end
:later
yn_kume: {急|いそ}ぎません 。 {婚礼|こんれい} は {来月|らいげつ} です から 。 || There's no hurry. The wedding is next month.

@scene yn.kume_after
!faceplayer
yn_kume: {仲人|なこうど} を {三十年|さんじゅうねん} して いて 、 {宿|やど} を {二|ふた}つ も {使|つか}った {宴|うたげ} は 、 {初|はじ}めて です 。 || Thirty years a go-between, and this is the first feast that used two inns at once.

@scene yn.ginnojo
# Ginnojō, the old comic of Playhouse Row, taking the waters; with Suzu, her idol.
!faceplayer
!if quest.yn_actor=2 -> line
!if quest.yn_actor>=0 -> wait
yn_ginnojo: …… {失礼|しつれい} 。 {湯治|とうじ} の {客|きゃく} の ギンノジョウ だ 。 {昔|むかし} 、 {八百橋|やおばし} の {芝居町|しばいまち} で 、 {少|すこ}し {人|ひと} を {笑|わら}わせて いた 。 || …Excuse me. Ginnojō, here for the waters. Long ago I made people laugh a little, on Manybridge's Playhouse Row.
?(comp=suzu) comp[surprise]: …… {嘘|うそ} 。 ギンノジョウ さん 。 {本物|ほんもの} 。 || …No way. Ginnojō. The real one.
yn_ginnojo: {一座|いちざ} の {座長|ざちょう} に 、 {最後|さいご} に {一席|いっせき} {頼|たの}まれて ね 。 {昔|むかし} の {当|あ}たり{芸|げい} を やろう と したら 、 {最後|さいご} の {台詞|せりふ} が {出|で}て こない 。 {落|お}ち の ない {話|はなし} ほど 、 {寂|さび}しい もの は ない 。 || The troupe's head asked me for one last turn. I meant to do my old famous bit, and the last line won't come. Nothing is lonelier than a story without its punchline.
?(comp=suzu) comp[shy]: {十六|じゅうろく} の {時|とき} 、 {毎晩|まいばん} {真似|まね} しました 。 {間|ま} の {取|と}り{方|かた} を 。 …… {似|に}て ない って 、 {皆|みんな} に {言|い}われました けど 。 || When I was sixteen I copied you every night. Your timing. …Everyone said it was nothing like.
?(comp=suzu) yn_ginnojo: …… {君|きみ} の {間|ま} を {見|み}れば {分|わ}かる 。 {似|に}て ない 。 {君|きみ} の {間|ま} だ 。 それ で いい ん だ よ 。 || …I can tell from your timing. It's nothing like. It's yours. That's how it should be.
!quest yn_actor 0
!end
:wait
yn_ginnojo: {最後|さいご} の {台詞|せりふ} …… {町|まち} の {誰|だれ} か が 、 {覚|おぼ}えて いない もの か 。 || That last line… surely someone in town remembers it.
!end
:line
yn_ginnojo: …… {番付|ばんづけ} ？ {八百橋|やおばし} の …… これ は 、 {四十年|よんじゅうねん} {前|まえ} の 。 || …A playbill? From Manybridge… this is forty years old.
!challenge yn.actor_line
narr: ギンノジョウ は {番付|ばんづけ} を {畳|たた}み 、 {背筋|せすじ} を {伸|の}ばした 。 {急|きゅう} に 、 {四十年|よんじゅうねん} {若|わか}く {見|み}えた 。 || Ginnojō folds the playbill and straightens his back. Suddenly he looks forty years younger.
yn_ginnojo: {今夜|こんや} 、 {一席|いっせき} やる よ 。 {落|お}ち まで な 。 || Tonight, I'll do my turn. All the way to the punchline.
?(comp=suzu) yn_ginnojo: {君|きみ} 、 {後見|こうけん} を {頼|たの}める かい 。 {台詞|せりふ} を {忘|わす}れたら 、 {袖|そで} から {付|つ}けて くれ 。 || Would you be my prompter? If I forget a line, give it to me from the wings.
?(comp=suzu) comp[laugh]: {喜|よろこ}んで ！ …… {一生|いっしょう} の {自慢|じまん} に する わ 。 || With pleasure! …I'll boast about this for the rest of my life.
!quest yn_actor done

@scene yn.ginnojo_idle
!faceplayer
yn_ginnojo: {最後|さいご} の {台詞|せりふ} が 、 {戻|もど}って {来|き}た 。 …… {四十年|よんじゅうねん} {経|た}って も 、 {笑|わら}い が {来|く}る {間|ま} は 、 {体|からだ} が {覚|おぼ}えて いる 。 || The last line's come back. …Forty years on, my body still knows the beat where the laugh comes.

@scene yn.onatsu_line
!faceplayer
yn_onatsu: ギンノジョウ の {当|あ}たり{芸|げい} ？ {知|し}ってる わ よ ！ {最後|さいご} は ね 、 「{湯|ゆ} に {入|はい}って 、 {湯|ゆ} を {忘|わす}れる 」 。 …… だった と {思|おも}う 。 たぶん 。 || Ginnojō's famous bit? I know it! The last line goes, "Get into the bath and forget the bath." …I think. Probably.
!quest yn_actor 1
?(comp=suzu) comp[think]: …… {違|ちが}う {気|き} が する 。 {落|お}ち に なって ない もの 。 {古|ふる}い {番付|ばんづけ} が あれば …… 。 || …I don't think that's right. It's not a punchline. If only there were an old playbill…

@scene yn.troupe_baskets
!if quest.yn_actor=1 -> bill
narr: {一座|いちざ} の {葛籠|つづら} 。 {衣装|いしょう} 、 {鬘|かつら} 、 {張|は}り{子|こ} の {魚|さかな} 。 {一番|いちばん} {下|した} に 、 {古|ふる}い {番付|ばんづけ} が {挟|はさ}まって いる 。 || The troupe's wicker trunks: costumes, wigs, a papier-mâché fish. At the very bottom, an old playbill tucked away.
?(comp=suzu) comp[shy]: …… {十六|じゅうろく} の {時|とき} の {番付|ばんづけ} 。 {私|わたし} の {名前|なまえ} 、 こんな {下|した} の {方|ほう} に 。 || …The playbill from when I was sixteen. My name, all the way down here.
!end
:bill
narr: {葛籠|つづら} の {底|そこ} に 、 {八百橋|やおばし} の {芝居町|しばいまち} の {古|ふる}い {番付|ばんづけ} が あった 。 {一番|いちばん} {上|うえ} に 、 「ギンノジョウ 」 の {名前|なまえ} 。 {演目|えんもく} の {横|よこ} に 、 {台詞|せりふ} が {刷|す}って ある 。 || At the bottom of a trunk, an old playbill from Manybridge's Playhouse Row. At the very top, the name "Ginnojō", and beside the title of his bit, its lines printed out.
yn_shinza: それ か 。 {先代|せんだい} の {座長|ざちょう} が 、 {大事|だいじ} に {取|と}って いた ん だ 。 {持|も}って {行|い}きな 。 || That one? The old troupe master treasured it. Take it.
!quest yn_actor 2

@scene yn.egg_yasuke
!faceplayer
!take yn_eggs
!set yn_egg_yasuke
yn_yasuke: …… {温|あたた}かい 。 {卵|たまご} が 、 {温|あたた}かい 。 || …Warm. The egg's warm.
narr: ヤスケ は {卵|たまご} を {食|た}べて 、 {小|ちい}さく 「うまい 」 と {言|い}った 。 {自分|じぶん} の {声|こえ} に 、 {少|すこ}し {驚|おどろ}いた {顔|かお} を した 。 || Yasuke eats the egg and says, quietly, "Good." He looks a little surprised at his own voice.
!call yn.egg_check

@scene yn.egg_tsuneji
!faceplayer
!take yn_eggs
!set yn_egg_tsuneji
yn_tsuneji: …… {村|むら} の {者|もの} に も 、 {分|わ}けて やって いい か 。 {一口|ひとくち} ずつ でも 。 || …Can I share it with the others from the village? Even a mouthful each.
# (he walks back to the Lower House's door and in before the narration says he went: the riverbank no longer holds him
# and the house does; it is further than the usual bound allows, so this one waits up to 9 s; RBN-QA-120)
!refresh gone 9000
narr: ツネジ は {卵|たまご} を {大事|だいじ} そう に {持|も}って 、 {下|しも}の{湯|ゆ} の {土間|どま} へ {帰|かえ}って いった 。 || Tsuneji carries the egg carefully back to the Lower House's floor.
!call yn.egg_check

@scene yn.egg_oshige
!faceplayer
!take yn_eggs
!set yn_egg_oshige
yn_oshige: まあ 、 {温泉卵|おんせんたまご} 。 {村|むら} の {祭|まつ}り で 、 {子供|こども} たち に {配|くば}った もの です 。 …… {今度|こんど} は 、 {私|わたし} が もらう {番|ばん} です ね 。 || Oh, a spring egg. We used to give these to the children at the village festival. …Now it's my turn to receive one.
!call yn.egg_check

@scene yn.egg_check
!if yn_egg_yasuke&yn_egg_tsuneji&yn_egg_oshige -> done
!end
:done
narr: {三|みっ}つ の {卵|たまご} を 、 {全部|ぜんぶ} {配|くば}り{終|お}えた 。 || All three eggs handed out.
!quest yn_eggs done

@scene yn.kanae
# Kanae, the footbath poet: her newest short story, a story room to step into (A38).
!faceplayer
yn_kanae: {足湯|あしゆ} に {足|あし} を {入|い}れる と 、 {話|はなし} が {浮|う}かぶ の 。 …… {新|あたら}しい の が {一|ひと}つ ある んだけど 、 {読|よ}んで くれる ？ {短|みじか}い の 。 || When I put my feet in the footbath, stories come to me. …I have a new one. Would you read it? It's short.
!choice
* {読|よ}む || Read it -> read
* {後|あと} で || Later -> later
:read
!quest yn_poet 0
!call yn.story
!quest yn_poet done
yn_kanae: {読|よ}んで くれて 、 ありがとう 。 {話|はなし} は 、 {誰|だれ} か に {読|よ}まれて 、 やっと {話|はなし} に なる の 。 || Thank you for reading it. A story only becomes a story once someone reads it.
!end
:later
yn_kanae: いつ でも 。 {私|わたし} は 、 ここ に {足|あし} を {入|い}れて いる から 。 || Any time. I'll be here with my feet in the water.

@scene yn.kanae_idle
!faceplayer
yn_kanae: {次|つぎ} の {話|はなし} は 、 {湯気|ゆげ} の {中|なか} で {迷|まよ}った {客|きゃく} の {話|はなし} に する つもり 。 {最後|さいご} に は 、 ちゃんと {部屋|へや} に {帰|かえ}れる の 。 || My next one will be about a guest lost in the steam. At the end, they find their room again.

@scene yn.story
# The story room (A38): four panels of Kanae's tale, read for its own sake; then put back in order, and an optional
# question or two. Nothing is lost by a wrong answer.
!ambience dusk
narr: 「{冷|つめ}たく なった {湯|ゆ} 」 カナエ ・ {作|さく} || "The Spring That Went Cold", by Kanae
narr: {一|いち} 。 {昔|むかし} 、 {谷|たに} に {兄弟|きょうだい} が いた 。 {二人|ふたり} は {毎朝|まいあさ} 、 {同|おな}じ {湯|ゆ} に {入|はい}って 、 {話|はなし} を した 。 || One. Long ago there were two brothers in the valley. Every morning they bathed in the same spring and talked.
narr: {二|に} 。 ある {日|ひ} 、 {兄弟|きょうだい} は {喧嘩|けんか} を して 、 {話|はな}さなく なった 。 {兄|あに} は {朝|あさ} に 、 {弟|おとうと} は {夜|よる} に {入|はい}る よう に なった 。 || Two. One day the brothers quarrelled and stopped speaking. The elder bathed in the morning, the younger at night.
narr: {三|さん} 。 すると 、 {湯|ゆ} が {少|すこ}し ずつ {冷|つめ}たく なった 。 {誰|だれ} も {話|はな}さない {湯|ゆ} は 、 {温|あたた}まらない の だ 。 || Three. Then, little by little, the spring went cold. A spring where nobody talks never warms.
narr: {四|よん} 。 {妹|いもうと} が 、 {二人|ふたり} を {同|おな}じ {時間|じかん} に {湯|ゆ} へ {連|つ}れて {来|き}た 。 {二人|ふたり} は {黙|だま}って {入|はい}り 、 やがて 、 「{冷|つめ}たい な 」 と {同|おな}じ {言葉|ことば} を {言|い}った 。 {湯|ゆ} は 、 その {日|ひ} から また {温|あたた}かく なった 。 || Four. Their sister brought them both to the spring at the same hour. They got in without a word, and at last both said the same thing: "It's cold." From that day the spring was warm again.
!challenge yn.story_order
!challenge yn.story_question
?(comp=nao) comp: 「{冷|つめ}たい な 」 で {仲直|なかなお}り か 。 …… {悪|わる}く ない 。 || Making up over "It's cold". …Not bad.
?(comp=mio) comp[smile]: {同|おな}じ {言葉|ことば} を {言|い}う と 、 {同|おな}じ {側|がわ} に いる {気|き} が します ね 。 || Saying the same words makes you feel you're on the same side.
?(comp=ren) comp[think]: {湯|ゆ} を {温|あたた}める の は 、 {話|はな}す {声|こえ} 。 …… {釜|かま}の{主|ぬし} の {話|はなし} みたい です 。 || What warms the spring is the sound of talking. …Like the Kettle Below.
?(comp=suzu) comp[laugh]: {妹|いもうと} が {一番|いちばん} の {役者|やくしゃ} ね 。 {台詞|せりふ} {一|ひと}つ なし で 、 {話|はなし} を {動|うご}かした わ 。 || The sister's the best actor in it. Not a single line, and she moved the whole story.

@scene yn.oritsu_after
!faceplayer
yn_oritsu: {露天風呂|ろてんぶろ} の こと は 、 {来月|らいげつ} の {寄合|よりあい} で 、 また {申|もう}し{上|あ}げる つもり で ございます 。 …… {楽|たの}しみ に して おります の よ 。 {少|すこ}し だけ 。 || I intend to raise the open-air bath again at next month's meeting. …I am looking forward to it. A little.

@scene yn.koume_suzu
# Koume, before the evening: the reunion's first moment; the crossroads proper is that evening (27_scenes_comp.js).
!faceplayer
!set yn_koume_met
yn_koume: スズ ！ …… {本当|ほんとう} に スズ だ 。 {手紙|てがみ} 、 {届|とど}いた よ 。 {話|はなし} は 、 {今夜|こんや} の {芝居|しばい} の {後|あと} で 。 {絶対|ぜったい} {来|き}て ね 。 || Suzu! …It really is you. Your letter came. We'll talk after tonight's show. You have to come.
suzu[closed]: …… うん 。 {行|い}く 。 || …Yes. I'll come.
`);
