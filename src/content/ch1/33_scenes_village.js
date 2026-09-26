/* Chapter 1 scenes: Reedwake life, side quests, readable signs, post-story
 * lines, the Unwritten Atlas entry, and road banter. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
@scene rw.board
narr: {村|むら} の {掲示板|けいじばん} 。 {紙|かみ} の {貼|は}り{紙|がみ} は {白|しろ}い 。 {板|いた} に {直接|ちょくせつ} {彫|ほ}った {字|じ} だけ が {残|のこ}って いる 。 || The village noticeboard. The paper notices are blank. Only words carved straight into the wood remain.
narr: 「 {井戸|いど} の {水|みず} は {沸|わ}かして から {飲|の}む こと 」 || "Boil well water before drinking."
?(rw_echo_done) narr: {新|あたら}しい {貼|は}り{紙|がみ} が {一枚|いちまい} 。 「 {猫|ねこ} を さがして います 。 {名前|なまえ} は モチ 。 」 {字|じ} は {消|き}えて いない 。 || One new notice: "Looking for my cat. Her name is Mochi." The writing hasn't faded.
?(post) narr: {貼|は}り{紙|がみ} が {増|ふ}えて いる 。 {祭|まつ}り の {知|し}らせ 、 {落|お}とし{物|もの} 、 {子|こ}ども の {字|じ} で 「 {西|にし} の {話|はなし} 、 {聞|き}かせて 」 。 || More notices now: a festival announcement, lost property, and in a child's hand, "Tell us about the west."

@scene rw.sign_square
narr: {道標|みちしるべ} 。 「 {北|きた} ： {水車|すいしゃ}{小屋|ごや} 　 {東|ひがし} ： {橋|はし} 　 {南|みなみ} ： {川|かわ} の {倉庫|そうこ} 」 。 {焼|や}き{印|いん} で {書|か}いて ある ので 、 {消|き}えて いない 。 || A signpost: "North: water mill · East: bridge · South: river warehouse." It's branded into the wood, so it survived.

@scene rw.sign_road
!if quest.rw_crossroads=done -> fixed
narr: {村|むら} の {西|にし} の {辻|つじ} の {道標|みちしるべ} 。 {腕|うで} は {三|みっ}つ ある が 、 どれ も {真|ま}っ{白|しろ} だ 。 {旅人|たびびと} が {迷|まよ}って しまう 。 || The signpost at the crossroads west of the village. It has three arms, all blank. Travellers will get lost.
!quest rw_crossroads start
!choice
* {直|なお}す || Restore it. -> fix
* あとで || Later. -> end
:fix
!activity rw.a_signpost
!if var._res=0 -> end
!set rw_sign_fixed
!quest rw_crossroads done
narr: {三|みっ}つ の {腕|うで} に 、 {行|い}き{先|さき} が {戻|もど}った 。 || The three arms have their destinations back.
?(!rw_charm_given) narr: {遠|とお}く で マメ が {手|て} を {振|ふ}って いる 。 {何|なに} か {渡|わた}したい もの が ある らしい 。 || In the distance, Mame is waving. It looks like she has something to give you.
!end
:fixed
!call rw.sign_road_fixed

@scene rw.sign_road_fixed
narr: 「 {東|ひがし} ： {村|むら} 　 {北|きた} ： {水車|すいしゃ}{小屋|ごや} 　 {南|みなみ} ： {川|かわ} 」 。 {字|じ} は しっかり {残|のこ}って いる 。 || "East: village · North: water mill · South: river." The letters are holding firm.

@scene rw.far_marker
narr: {向|む}こう{岸|ぎし} の {石|いし} 。 「 {渡|わた}し{場|ば} 」 と {彫|ほ}って ある 。 {下|した} の {方|ほう} に 、 {後|あと} から {小|ちい}さく {彫|ほ}り{足|た}した {字|じ} 。 「 コウジ 」 。 || A stone on the far bank, carved "Ferry landing". Underneath, added later in small letters: "Kōji".

@scene rw.hall_desk
narr: {灯|あか}り の {記録|きろく} が {積|つ}まれた {机|つくえ} 。 {一番|いちばん} {上|うえ} の {帳面|ちょうめん} の {表紙|ひょうし} に 、 {字|じ} が {彫|ほ}って ある 。 || A desk stacked with lantern records. Words are carved into the cover of the top ledger.
narr: 「 {名|な} を {書|か}く {者|もの} は 、 {約束|やくそく} を {書|か}く 」 || "Whoever writes a name writes a promise."
?(post) narr: {新|あたら}しい {帳面|ちょうめん} が {一冊|いっさつ} 。 {表紙|ひょうし} に は 「 {書|か}かれて いない {地図|ちず} 」 。 || A new ledger sits on top, its cover reading: "The Unwritten Atlas".

@scene rw.ferry_cup
narr: {小|ちい}さな {卓|たく} の {上|うえ} に 、 {縁|ふち} の {欠|か}けた {茶碗|ちゃわん} が {一|ひと}つ 。 ハナ の {店|みせ} の {茶碗|ちゃわん} と 、 {同|おな}じ {欠|か}け{方|かた} だ 。 || On the small table is a single teacup with a chipped rim — chipped exactly like the one at Hana's.

@scene rw.boots
!if !quest.rw_boots -> plain
!if rw_sign_read -> done
narr: {古|ふる}い {在庫|ざいこ} の {木箱|きばこ} 。 {底|そこ} の {方|ほう} に 、 {昔|むかし} の {看板|かんばん} が {裏返|うらがえ}し に {入|はい}って いた 。 {裏返|うらがえ}し だった から 、 {字|じ} が {消|き}えなかった の だろう か 。 || A crate of old stock. At the bottom, an old shop sign lies face down. Maybe being face down is why its writing survived.
!challenge rw.c_boots_sign
!if var._res=0 -> end
!set rw_sign_read
!quest rw_boots 1
!end
:done
narr: {古|ふる}い {看板|かんばん} は 、 オト に {見|み}せる ため に {脇|わき} に {置|お}いた 。 || You set the old sign aside to show Oto.
!end
:plain
narr: {古|ふる}い {在庫|ざいこ} の {木箱|きばこ} 。 {革|かわ} の {切|き}れ{端|はし} と {釘|くぎ} が {入|はい}って いる 。 || A crate of old stock: scraps of leather and nails.

@scene rw.oto_first
!faceplayer oto
oto: いらっしゃい 。 …… {看板|かんばん} 、 {見|み}た だろ 。 {真|ま}っ{白|しろ} 。 {客|きゃく} が {入|はい}って こない わけ だ よ 。 || Come in. …You saw the sign, right? Blank. No wonder nobody's coming in.
oto: {父|ちち} の {代|だい} の {看板|かんばん} が 、 どこか の {箱|はこ} に しまって ある はず なん だ けど 、 {手|て} が {離|はな}せ なくて さ 。 {見|み}て くれる かい 。 {奥|おく} の {木箱|きばこ} だ よ 。 || My father's old sign should be packed away in some box, but I can't leave my work. Would you look? The crate at the back.
?(rw_met_ren) oto[smirk]: ついでに 、 あの {灯守|ひもり} の {若|わか}い の に {言|い}って おくれ 。 {靴|くつ} くらい {持|も}って {来|こ}い って 。 {見|み}てる だけ で {足|あし} が {冷|つめ}たく なる 。 || While you're at it, tell that young lantern keeper to bring me their boots. Just looking at them makes my feet cold.
!quest rw_boots 0

@scene rw.oto_again
!faceplayer oto
oto: {看板|かんばん} は {奥|おく} の {木箱|きばこ} の どこか 。 {革|かわ} の {下|した} かも ね 。 || The sign's somewhere in the crate at the back. Maybe under the leather.

@scene rw.oto_sign
!faceplayer oto
oto[surprise]: {父|ちち} の {看板|かんばん} ！ …… そう 、 そう {書|か}いて あった 。 {子|こ}ども の {頃|ころ} 、 {毎日|まいにち} {見上|みあ}げてた のに 、 {忘|わす}れてた 。 || My father's sign! …Yes, that's what it said. I looked up at it every day as a kid, and I'd forgotten.
oto: {描|か}き{直|なお}す よ 。 あんた の {字|じ} を {手本|てほん} に して ね 。 …… お{礼|れい} に 、 これ 。 {雨|あめ} でも {滑|すべ}らない 。 {灯守|ひもり} の {分|ぶん} も {作|つく}って あげたい ところ だ けど 、 {本人|ほんにん} が {来|こ}ない から ね 。 || I'll repaint it, using your writing as the model. …Here, as thanks. They won't slip even in the rain. I'd make a pair for the lantern keeper too, but they never come in.
!give rw_boots_good
!quest rw_boots done

@scene rw.oto_after
!faceplayer oto
oto: {看板|かんばん} を {直|なお}したら 、 {客|きゃく} が {戻|もど}って きた 。 {字|じ} って の は {大事|だいじ} だ ね 。 || Since I fixed the sign, customers have come back. Writing matters, huh.
?(comp=ren) oto[laugh]: …… で 、 その {靴|くつ} 。 {置|お}いて いき な 。 {旅|たび} に {出|で}る {前|まえ} に {直|なお}す 。 {文句|もんく} は {聞|き}かない よ 。 || …And those boots. Leave them here. I'll fix them before you head out. No arguments.

@scene rw.oto_post
!faceplayer oto
oto: {西|にし} から {来|く}る {客|きゃく} が {増|ふ}えた よ 。 {道|みち} が {戻|もど}った から だ って 。 {靴|くつ} も {擦|す}り{減|へ}る わけ だ 。 {商売|しょうばい} {繁盛|はんじょう} 。 || More customers coming in from the west. They say it's because the roads came back. No wonder soles are wearing thin. Business is booming.
?(end_mem_return) oto: {父|ちち} の こと 、 {少|すこ}し {思|おも}い{出|だ}した 。 {嫌|いや} な こと も 。 でも 、 {全部|ぜんぶ} {込|こ}み で {父|ちち} だ から ね 。 || I've remembered a little more about my father. The bad parts too. But all of it together was him.

@scene rw.bunta_first
!faceplayer bunta
bunta: おう 、 {旅|たび} の {人|ひと} か 。 {悪|わる}い が 、 {今|いま} {機嫌|きげん} が {悪|わる}い 。 || Well, a traveller. Sorry, I'm in a bad mood.
bunta: キク の {婆|ばあ}さん が 、 {春|はる} に {貸|か}した かんな を {返|かえ}さねえ ん だ 。 {道具|どうぐ} の {名札|なふだ} も {嵐|あらし} で {白|しろ}く なっちまって 、 {証拠|しょうこ} も ねえ 。 || Old Kiku won't give back the plane I lent her in spring. And the storm wiped the name tags off my tools, so I've got no proof.
!quest rw_tools 0

@scene rw.bunta_again
!faceplayer bunta
bunta: キク に {会|あ}った か ？ {婆|ばあ}さん の {家|いえ} は {広場|ひろば} の {南|みなみ} だ 。 || Seen Kiku yet? Her house is south of the square.
?(quest.rw_tools>=1) bunta: …… {貸|か}し{借|か}り の {記録|きろく} ？ そういや 、 {作業台|さぎょうだい} の {裏|うら} に {何|なに} か {彫|ほ}った {気|き} が する な 。 {若|わか}い {頃|ころ} の {癖|くせ} だ 。 || …A record of loans? Come to think of it, I might have carved something under the workbench. A habit from when I was young.

@scene rw.kiku_first
!faceplayer kiku
kiku: あら 、 いらっしゃい 。 {糸|いと} が {絡|から}まって いる けれど 、 {気|き} に しないで ちょうだい 。 {機|はた} を {織|お}る と 、 {考|かんが}え{事|ごと} まで {絡|から}まる の よ 。 || Oh, welcome. Mind the tangled thread. When I weave, my thoughts get tangled too.

@scene rw.kiku_side
!faceplayer kiku
kiku: ブンタ さん が 、 また かんな の こと を ？ …… {困|こま}った {人|ひと} ね 。 {私|わたし} は ちゃんと {返|かえ}しました よ 。 || Bunta is going on about the plane again? …What a trying man. I returned it properly.
kiku: それ より 、 {私|わたし} の {杼|ひ} を まだ {返|かえ}して もらって いない の 。 {機|はた} の {修理|しゅうり} に {貸|か}した きり 。 {貸|か}し{借|か}り は 、 あの {人|ひと} が {作業台|さぎょうだい} に {彫|ほ}って いた はず です よ 。 || More to the point, I haven't got my shuttle back. I lent it to him to repair the loom and that was that. He used to carve our loans into his workbench, you know.
!quest rw_tools 1

@scene rw.bench_tools
!if !quest.rw_tools -> plain
!if rw_tally_read -> read
narr: {作業台|さぎょうだい} の {裏|うら} を のぞく と 、 {小刀|こがたな} で {彫|ほ}った {字|じ} が {並|なら}んで いた 。 {彫|ほ}った {字|じ} は {消|き}えて いない 。 || Peering under the workbench, you find rows of letters cut with a knife. Carved letters don't fade.
!challenge rw.c_tools
!if var._res=0 -> end
!set rw_tally_read
narr: {作業台|さぎょうだい} の {下|した} の {暗|くら}がり に 、 {何|なに} か が {光|ひか}った 。 {埃|ほこり} を かぶった かんな だ 。 || Something glints in the dark under the bench: a dusty plane.
!give rw_plane
!quest rw_tools 2
!end
:read
narr: {作業台|さぎょうだい} の {裏|うら} の {記録|きろく} 。 もう {読|よ}んだ 。 || The record under the workbench. You've read it.
!end
:plain
narr: よく {使|つか}い{込|こ}まれた {作業台|さぎょうだい} 。 {削|けず}り{屑|くず} の いい {匂|にお}い が する 。 || A well-used workbench. It smells pleasantly of wood shavings.

@scene rw.bunta_tally
!faceplayer bunta
!if !item.rw_plane -> gone
narr: かんな を {見|み}せる と 、 ブンタ は {黙|だま}って {頭|あたま} を かいた 。 || You show him the plane. Bunta scratches his head in silence.
bunta[shy]: …… {俺|おれ} の {作業台|さぎょうだい} の {下|した} に あった の か 。 {返|かえ}して もらってた の を 、 {忘|わす}れてた 。 {婆|ばあ}さん に {怒鳴|どな}り{込|こ}む {前|まえ} で よかった 。 || …It was under my own bench. She'd given it back and I forgot. Good thing I didn't go shouting at her.
bunta: {杼|ひ} も {返|かえ}さねえ と な 。 {悪|わる}い が 、 {届|とど}けて くれる か 。 {顔|かお} を {合|あ}わせる の が 、 ちょっと な 。 || I'd better return her shuttle too. Sorry, but would you take it to her? Facing her right now is a bit…
!take rw_plane
!give rw_shuttle
!end
:gone
bunta: {杼|ひ} を キク に {届|とど}けて くれた か ？ || Did you take the shuttle to Kiku?

@scene rw.kiku_tally
!faceplayer kiku
!if !item.rw_shuttle -> wait
kiku[smile]: まあ 、 {私|わたし} の {杼|ひ} 。 …… ブンタ さん 、 {自分|じぶん} で {来|こ}られない の ね 。 {照|て}れ{屋|や} だ こと 。 || Oh, my shuttle. …Bunta couldn't bring it himself, I see. Such a shy man.
kiku: お{礼|れい} に 、 これ を どうぞ 。 {昔|むかし} {織|お}った リボン の {残|のこ}り です 。 {色|いろ} は {褪|あ}せた けれど 、 {糸|いと} は まだ {丈夫|じょうぶ} よ 。 || Please take this as thanks. It's what's left of a ribbon I wove long ago. The colour has faded, but the thread is still strong.
!take rw_shuttle
!give rw_ribbon
!quest rw_tools done
!end
:wait
kiku: {作業台|さぎょうだい} の {記録|きろく} 、 {見|み}つかりました か ？ || Did you find the record on the workbench?

@scene rw.bunta_after
!faceplayer bunta
bunta: {婆|ばあ}さん に {謝|あやま}り に {行|い}ったら 、 {茶|ちゃ} を {出|だ}された 。 {怒|おこ}られる より {堪|こた}える な 。 || I went to apologise and she served me tea. That's harder to take than a scolding.

@scene rw.kiku_after
!faceplayer kiku
kiku: ブンタ さん 、 {機|はた} の {脚|あし} を {直|なお}して くれた の よ 。 {頼|たの}んで も いない のに 。 {不器用|ぶきよう} な {謝|あやま}り{方|かた} ね 。 || Bunta fixed my loom's leg. I didn't even ask. What a clumsy way to apologise.

@scene rw.bunta_post
!faceplayer bunta
bunta: {新|あたら}しい {橋|はし} の {手|て}すり 、 {俺|おれ} が {作|つく}った ん だ 。 {渡|わた}し{守|もり} の コウジ に 「 {手|て} を {振|ふ}る {場所|ばしょ} を {作|つく}れ 」 って {言|い}われて な 。 || I made the new railing on the bridge. Kōji the ferryman told me, "Make a place to wave from."

@scene rw.kiku_post
!faceplayer kiku
kiku: {旅|たび} の お{話|はなし} 、 {聞|き}かせて ちょうだい 。 {布|ぬの} に {織|お}り{込|こ}んで おきたい の 。 {字|じ} は {消|き}えて も 、 {柄|がら} は {残|のこ}る から 。 || Tell me about your travels. I want to weave them into cloth. Even if writing fades, a pattern remains.
?(end_archive_library) kiku: {山|やま} の {書庫|しょこ} が 、 {誰|だれ} でも {入|はい}れる {場所|ばしょ} に なった と {聞|き}いた わ 。 {私|わたし} も いつか 、 {若|わか}い {頃|ころ} の {名前|なまえ} を {探|さが}しに {行|い}って みよう かしら 。 || I hear the archive in the mountains is open to anyone now. Maybe someday I'll go and look for the names from when I was young.

@scene rw.kiku_plane
narr: {糸|いと} の {入|はい}った {籠|かご} 。 {色|いろ} ごと に きちんと {分|わ}けて ある 。 || A basket of thread, neatly sorted by colour.

@scene rw.yasu_first
!faceplayer yasu
yasu: {川|かわ} が {高|たか}い うち は {舟|ふね} を {出|だ}せん 。 {暇|ひま} な {年寄|としよ}り の {話|はなし} でも {聞|き}いて いく か ？ || Can't take the boat out while the river's high. Want to hear an idle old man's story?
!quest rw_founding start
!choice
* {聞|き}かせて ください || Please tell me. -> tell
* また {今度|こんど} || Another time. -> end
:tell
!activity rw.a_history
!if var._res=0 -> end
!quest rw_founding done
yasu: {聞|き}き{上手|じょうず} だ な 。 …… {今|いま} の {話|はなし} 、 どこか に {書|か}いて おいて くれ 。 {紙|かみ} じゃ なくて も いい 。 {誰|だれ} か の {頭|あたま} の {中|なか} でも いい 。 || You're a good listener. …Write that story down somewhere. Doesn't have to be paper. Somebody's head will do.

@scene rw.yasu_after
!faceplayer yasu
yasu: {川|かわ} は {正直|しょうじき} だ 。 {増|ふ}えれば {増|ふ}えた 、 {減|へ}れば {減|へ}った と {見|み}せて くれる 。 {人|ひと} は そう は いかん 。 || The river's honest. When it rises, it shows you; when it falls, it shows you. People aren't like that.
?(rw_koji_back) yasu: コウジ の {若造|わかぞう} 、 また {舟|ふね} を {出|だ}す って さ 。 {橋|はし} が ある のに な 。 …… {手|て} を {振|ふ}る ため だろう よ 。 || Young Kōji says he'll run the ferry again. Even with the bridge. …So he can wave, I expect.

@scene rw.yasu_post
!faceplayer yasu
yasu: {孫|まご} に あんた の {話|はなし} を して やった 。 {少|すこ}し {盛|も}った が な 。 {年寄|としよ}り の {特権|とっけん} だ 。 || I told my grandchild about you. Embellished it a bit. An old man's privilege.

@scene rw.mame_first
!faceplayer mame
mame: ねえ ねえ ！ {字|じ} が {消|き}えた の 、 {見|み}た ？ マメ の {名前|なまえ} も {消|き}える ？ || Hey, hey! Did you see the writing disappear? Will Mame's name disappear too?
!choice
* {消|き}えない よ || It won't. -> no
* わからない || I don't know. -> idk
:no
mame[smile]: ほんと ？ じゃあ 、 マメ も {字|じ} を {練習|れんしゅう} する ！ {自分|じぶん} で {書|か}けば 、 {消|き}えない よね ！ || Really? Then Mame will practise writing too! If I write it myself, it won't disappear, right?
!end
:idk
mame[think]: …… じゃあ 、 {大|おお}きい {声|こえ} で {言|い}う 。 マメ ！ マメ ！ これ で {忘|わす}れない でしょ ！ || …Then I'll say it loud. Mame! Mame! Now you won't forget!

@scene rw.mame_after
!faceplayer mame
mame: {橋|はし} 、 {向|む}こう まで {走|はし}った ！ {十回|じっかい} ！ コウジ おじさん が 「 {橋|はし} が すり{減|へ}る 」 って {笑|わら}ってた ！ || I ran all the way across the bridge! Ten times! Uncle Kōji laughed and said I'd wear it out!
?(!quest.rw_crossroads=done) mame: {西|にし} の {辻|つじ} の {看板|かんばん} 、 {真|ま}っ{白|しろ} なの 。 {直|なお}せる ？ || The sign at the west crossroads is all white. Can you fix it?

@scene rw.mame_charm
!faceplayer mame
mame: {看板|かんばん} 、 {直|なお}して くれた ！ これ 、 あげる 。 {葦|あし} で {編|あ}んだ お{守|まも}り 。 マメ が {作|つく}った ！ || You fixed the sign! This is for you — a charm woven from reeds. Mame made it!
!give rw_reed_charm
!set rw_charm_given
mame: {持|も}って いる と 、 {悪|わる}い もの が ちょっと だけ よけて いく 。 …… たぶん ！ || If you carry it, bad things will step aside a little. …Probably!

@scene rw.mame_post
!faceplayer mame
mame: {字|じ} 、 {練習|れんしゅう} した よ ！ {見|み}て ！ 「 まめ 」 ！ …… {西|にし} の {話|はなし} 、 {次|つぎ} は {何|なに} ？ || I practised writing! Look! "Mame"! …What's the next story from the west?

@scene rw.tomo_first
!faceplayer tomo
tomo: {洗濯物|せんたくもの} が {全部|ぜんぶ} {泥|どろ} だらけ 。 {嵐|あらし} って {本当|ほんとう} に {迷惑|めいわく} ね 。 …… {名前|なまえ} の {刺繍|ししゅう} まで {消|き}える なんて 、 {聞|き}いた こと ない けど 。 || All the washing is covered in mud. Storms really are a nuisance. …Though I've never heard of one that erases the names embroidered on things.

@scene rw.tomo_after
!faceplayer tomo
tomo: {子|こ}ども たち が 、 {自分|じぶん} の {名前|なまえ} を {地面|じめん} に {書|か}いて {遊|あそ}んで いる の 。 {流行|はや}ってる みたい 。 || The children are playing at writing their names in the dirt. It seems to be the latest craze.

@scene rw.tomo_post
!faceplayer tomo
tomo: {西|にし} の {港|みなと} から {新|あたら}しい {布|ぬの} が {届|とど}く よう に なった の 。 {道|みち} が {繋|つな}がる って 、 こういう こと なの ね 。 || New cloth arrives from the harbour in the west now. So this is what it means when roads connect.

@scene rw.koji_bank
!faceplayer koji
koji: {橋|はし} が {届|とど}いた な 。 …… {変|へん} な {気分|きぶん} だ 。 {毎朝|まいあさ} {渡|わた}って いた のに 、 {三日|みっか} {間|かん} 、 {誰|だれ} の {所|ところ} へ {行|い}く の か わからなかった 。 || The bridge reaches. …Strange feeling. I crossed every morning, and for three days I didn't know who I was crossing to.

@scene rw.koji_tea
!faceplayer koji
koji: {姉|ねえ}さん の {茶|ちゃ} は {薄|うす}い 。 でも 、 これ じゃ ない と {朝|あさ} が {始|はじ}まらない 。 {言|い}う な よ 。 || My sister's tea is weak. But the morning doesn't start without it. Don't tell her I said that.
?(comp) koji: {西|にし} へ {行|い}く ん だって な 。 {渡|わた}し{守|もり} から {一言|ひとこと} 。 {向|む}こう{岸|ぎし} に {着|つ}いたら 、 {一度|いちど} {振|ふ}り{返|かえ}って {手|て} を {振|ふ}れ 。 {誰|だれ} か が {振|ふ}り{返|かえ}して くれる 。 || Heard you're heading west. A word from a ferryman: when you reach the far bank, turn round once and wave. Someone will wave back.

@scene rw.koji_post
!faceplayer koji
koji: {橋|はし} と {舟|ふね} 、 {両方|りょうほう} ある の が {葦|あし}ノ{瀬|せ} だ 。 {急|いそ}ぐ {奴|やつ} は {橋|はし} 、 {話|はな}したい {奴|やつ} は {舟|ふね} 。 {最近|さいきん} は {舟|ふね} の {客|きゃく} の {方|ほう} が {多|おお}い 。 || Reedwake has both a bridge and a boat. In a hurry, take the bridge; want to talk, take the boat. These days the boat gets more customers.

@scene rw.hana_rush
!faceplayer hana
hana[smile]: いらっしゃい ！ …… ごめん なさい 、 {今|いま} {朝|あさ} の {混|こ}む {時間|じかん} で 。 コウジ が {戻|もど}った って {聞|き}いて 、 みんな {見|み}に {来|く}る の よ 。 {手伝|てつだ}って くれる ？ || Welcome! …Sorry, it's the morning rush. Everyone heard Kōji's back and came to look. Would you help?
!quest rw_teahouse start
!choice
* {手伝|てつだ}う || Help out. -> help
* また {後|あと} で || Later. -> end
:help
!activity rw.a_orders
!if var._res=0 -> end
!quest rw_teahouse done
hana: {助|たす}かった ！ はい 、 お{礼|れい} 。 {朝|あさ} の お{茶|ちゃ} の {葉|は} 。 {旅|たび} の {途中|とちゅう} で 、 {誰|だれ} か と {飲|の}んで ね 。 {二杯|にはい} ずつ 。 || You saved me! Here, as thanks — my morning tea leaves. Drink them with someone on your travels. Two cups at a time.
!give rw_tea_leaves

@scene rw.hana_after2
!faceplayer hana
hana: お{茶|ちゃ} を ふたつ いれる の が 、 また {楽|たの}しく なった の 。 {変|へん} よ ね 。 {同|おな}じ ふたつ なのに 。 || Pouring two cups is fun again. Funny, isn't it — it's the same two cups.

@scene rw.hana_post
!faceplayer hana
hana: お{帰|かえ}り なさい 。 {今日|きょう} は お{茶|ちゃ} を みっつ いれた の 。 {一|ひと}つ は あなた の {分|ぶん} 。 …… {冷|さ}めない うち に 。 || Welcome back. Today I poured three cups. One is yours. …Before it gets cold.
?(end_mem_choose) hana: {山|やま} の {書庫|しょこ} に {預|あず}けた {記憶|きおく} を 、 {取|と}り に {行|い}く {人|ひと} も いる そう よ 。 {私|わたし} は …… {今|いま} の {朝|あさ} が あれば 、 いい かな 。 || I hear some people are going to the mountain archive to take back memories they left there. Me… I think my mornings as they are now are enough.

@scene rw.tsuru_post
!faceplayer tsuru
tsuru: {帰|かえ}った かい 。 {灯|あか}り の {名前|なまえ} は 、 もう {滑|すべ}り{落|お}ちない 。 {年寄|としよ}り の {手|て} でも ね 。 || Back, are you? The lanterns' names don't slide off anymore. Not even in an old woman's hand.
?(end_kasane_trial) tsuru[think]: {灯落|ひおち} で 、 あの {書庫|しょこ} の {番人|ばんにん} が {町|まち} の {人|ひと} と {話|はな}して いる そう だ 。 {許|ゆる}す {者|もの} も 、 {許|ゆる}さない {者|もの} も いる 。 それ で いい 。 {黙|だま}らせる より は ずっと いい 。 || I hear the Archive's keeper is talking with the people of Lanternfall. Some forgive, some don't. That's as it should be. Far better than silencing them.
?(end_kasane_keeper) tsuru[think]: あの {番人|ばんにん} は 、 {山|やま} で {書庫|しょこ} を {開|ひら}いて いる と さ 。 {見張|みは}り が ついて いる と は いえ 、 {変|か}われる もの か どう か 。 …… {見届|みとど}ける しか ない ね 。 || They say the keeper is still up in the mountains, keeping the Archive open. Watched, of course. Whether someone like that can change… all we can do is see.
tsuru: {机|つくえ} の {上|うえ} の {新|あたら}しい {帳面|ちょうめん} 、 {見|み}た かい 。 「 {書|か}かれて いない {地図|ちず} 」 。 {話|はな}して {欲|ほ}しけりゃ 、 また {声|こえ} を かけ な 。 || Did you see the new ledger on the desk? "The Unwritten Atlas". If you want me to explain, just ask again.
!choice
* {地図|ちず} の {話|はなし} を {聞|き}く || Ask about the Atlas. -> atlas
* また {今度|こんど} || Another time. -> end
:atlas
!call rw.atlas_go

@scene rw.atlas_intro
!faceplayer tsuru
tsuru: {世界|せかい} が {元|もと} に {戻|もど}る {途中|とちゅう} で 、 {変|へん} な {道|みち} が {生|う}まれて いる 。 {名前|なまえ} が {落|お}ち{着|つ}く {場所|ばしょ} を {探|さが}して 、 ふらふら して いる {道|みち} だ 。 || While the world mends, strange roads are appearing — roads wandering about, looking for a place for their names to settle.
tsuru: {地図|ちず} に は {載|の}って いない 。 {載|の}せよう と する と 、 {形|かたち} が {変|か}わる 。 だから 「 {書|か}かれて いない {地図|ちず} 」 さ 。 || They aren't on any map. Try to put them on one and they change shape. Hence "the Unwritten Atlas".
tsuru: {行|い}くか どう か は 、 あんた たち の {自由|じゆう} だ 。 {物語|ものがたり} は もう {終|お}わった 。 これ は 、 おまけ の {散歩|さんぽ} みたい な もの だ よ 。 || Whether you go is entirely up to you. The story's over. Think of this as a bonus stroll.
!note rw_atlas
!call rw.atlas_go

@scene rw.atlas_go
!choice
* {書|か}かれて いない {道|みち} へ {出|で}る || Set out on an unwritten road. -> go
* {今|いま} は やめて おく || Not now. -> end
:go
!hook atlas_start
`, 'ch1/33_village');

RB.content.notes.rw_atlas = { title: { jp: '{書|か}かれて いない {地図|ちず}', en: 'The Unwritten Atlas' }, fiction: true,
  en: 'After the Hush lifted, unstable routes appeared: roads searching for somewhere their names can settle. Keeper Tsuru keeps a ledger of them. Expeditions there are optional and repeatable; the story itself stays resolved.' };

RB.content.banter.push(
  { comp: 'nao', map: 'rw.*', scene: 'rw.b_nao1' }, { comp: 'mio', map: 'rw.*', scene: 'rw.b_mio1' },
  { comp: 'ren', map: 'rw.*', scene: 'rw.b_ren1' }, { comp: 'suzu', map: 'rw.*', scene: 'rw.b_suzu1' },
  { comp: 'nao', map: 'rw.*', scene: 'rw.b_nao2', if: 'post' }, { comp: 'mio', map: 'rw.*', scene: 'rw.b_mio2', if: 'post' },
  { comp: 'ren', map: 'rw.*', scene: 'rw.b_ren2', if: 'post' }, { comp: 'suzu', map: 'rw.*', scene: 'rw.b_suzu2', if: 'post' }
);
RB.script.add(`
@scene rw.b_nao1
nao: {葦|あし}ノ{瀬|せ} の {道|みち} は {全部|ぜんぶ} {覚|おぼ}えた 。 {三日|みっか} で な 。 …… {嘘|うそ} だ 。 {二日|ふつか} 。 || I've memorised every road in Reedwake. In three days. …That's a lie. Two.
@scene rw.b_mio1
mio: {旅|たび} の {荷物|にもつ} 、 {三回|さんかい} {確|たし}かめました 。 …… {薬|くすり} が {一本|いっぽん} {多|おお}い ん です 。 {誰|だれ} か が {入|い}れた ？ …… {私|わたし} です ね 。 {心配|しんぱい} で 。 || I checked our packs three times. …There's one bottle too many. Did someone put it in? …It was me. I was worried.
@scene rw.b_ren1
ren: {灯|あか}り の {持|も}ち{手|て} 、 {今朝|けさ} も {磨|みが}きました 。 {靴|くつ} は …… {明日|あした} {磨|みが}きます 。 {毎日|まいにち} そう {言|い}って います が 。 || I polished the lantern's handle again this morning. My boots… I'll polish tomorrow. I say that every day.
@scene rw.b_suzu1
suzu: ねえ 、 {旅|たび} の {一座|いちざ} の {名前|なまえ} 、 {決|き}めない ？ 「 ふたり {座|ざ} 」 。 …… {却下|きゃっか} ？ {早|はや}い ！ || Hey, shall we name our travelling company? "The Two-Person Troupe." …Rejected? That was fast!
@scene rw.b_nao2
nao: {村|むら} の {字|じ} 、 {誰|だれ} も {消|け}さなく なった な 。 {配達|はいたつ} が {退屈|たいくつ} に なる くらい {平和|へいわ} だ 。 …… {悪|わる}く ない 。 || Nobody's erasing the village's writing anymore. So peaceful that deliveries are boring. …Not bad, though.
@scene rw.b_mio2
mio: {店|みせ} の {看板|かんばん} に 「 {定休日|ていきゅうび} 」 を {書|か}き{足|た}しました 。 …… {初|はじ}めて {書|か}いた {字|じ} です 。 || I added "Regular day off" to the shop sign. …First time I've ever written those words.
@scene rw.b_ren2
ren: {先生|せんせい} の {教|おし}え 、 {一|ひと}つ {増|ふ}えました 。 {正確|せいかく} に は 、 {私|わたし} が {増|ふ}やしました 。 「 {迷|まよ}ったら 、 {隣|となり} を {見|み}ろ 」 。 || My teacher's lessons have gained one more. Strictly speaking, I added it. "When lost, look beside you."
@scene rw.b_suzu2
suzu: {新作|しんさく} が できた の 。 {題名|だいめい} は 「 {借|か}りた {名前|なまえ} の {道|みち} 」 。 …… {主役|しゅやく} は {誰|だれ} か 、 わかる でしょ ？ || My new piece is finished. It's called "The Road of Borrowed Names". …You can guess who plays the lead, can't you?
`, 'ch1/33_banter');
