/* Manybridge, Chapter 3: the crossing and the city (expansion P08). Tetsu's ferry east once Chapter 2 is over (in a
 * twelve-chapter journey); the arrival under the bridges; the Exchange district's first sight; the plaques of the
 * bridges; the city's signs, doors and people at their work. The story's thread is in 21_scenes_main.js. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  // Saltglass: Tetsu's ferry has a destination at last (twelve-chapter journeys; the six-chapter game is unchanged)
  const sg = C.maps['sg.harbor'];
  const tetsu = sg && sg.npcs.find((n) => n.id === 'tetsu');
  if (tetsu) tetsu.talk.splice(tetsu.talk.findIndex((t) => t.scene === 'sg.tetsu_ferry'), 0,
    { if: 'ed>=2&ch2_done&!mb_arrived', scene: 'mb.ferry_tetsu' },
    { if: 'ed>=2&mb_arrived&!post', scene: 'mb.ferry_tetsu_again' });
  // the north road: in a twelve-chapter journey it opens once Manybridge's two chapters are over
  const road = C.maps['sg.road'];
  if (road) road.triggers.push({ x: 15, y: 0, w: 2, h: 1, scene: 'mb.north_washed', if: 'ed>=2&ch2_done&!mb2_done' });
  const daigo = sg && sg.npcs.find((n) => n.id === 'daigo');
  if (daigo) daigo.talk.unshift({ if: 'ed>=2&ch2_done&!mb_arrived&!post', scene: 'mb.daigo_east' });
})(RB.content);

RB.script.add(`
@scene mb.ferry_tetsu
!faceplayer
tetsu: {板|いた} に 、 {新|あたら}しい {行|い}き{先|さき} が {出|で}た 。 {東|ひがし} 。 {八百橋|やおばし} だ 。 || There's a new line on the board. East. Manybridge.
tetsu: あそこ から の {荷舟|にぶね} が 、 {四日|よっか} {来|こ}ない 。 {橋|はし} の {名前|なまえ} が {消|き}えて 、 {舟|ふね} が {迷|まよ}って いる と {聞|き}いた 。 || The barges from there haven't come in four days. I hear the bridges' names are wearing off, and the boats are getting lost.
?(comp=nao) comp: {八百橋|やおばし} か 。 {配達|はいたつ} で {何度|なんど} も {行|い}った 。 {橋|はし} の {名前|なまえ} が なければ 、 あの {町|まち} は {迷路|めいろ} だ ぞ 。 || Manybridge. I've been there with deliveries plenty of times. Without the bridges' names, that city's a maze.
?(comp=mio) comp[think]: {橋|はし} の {名前|なまえ} が …… {葦|あし}ノ{瀬|せ} の ラベル と {同|おな}じ ね 。 || The bridges' names… Just like the labels in Reedwake.
?(comp=ren) comp[think]: {名前|なまえ} が {消|き}える {町|まち} は 、 {灯|ひ} の {道|みち} の {先|さき} に まだ ある の です ね 。 || So there are still towns down the lantern roads where the names are fading.
?(comp=suzu) comp[smile]: {八百橋|やおばし} ！ {芝居|しばい} と お{祭|まつ}り の {町|まち} よ 。 …… {迷子|まいご} に なる の は 、 {舟|ふね} だけ に して ほしい わ ね 。 || Manybridge! A city of theatre and festivals. …Let's hope it's only the boats that get lost.
!choice
* {八百橋|やおばし} へ {行|い}きます 。 || We'll go to Manybridge. -> go
* まだ です 。 || Not yet. -> wait
:go
tetsu: {乗|の}れ 。 {潮|しお} が いい 。 || Get aboard. The tide's right.
!call mb.ferry_east
!end
:wait
tetsu: {船|ふね} は {毎日|まいにち} {出|で}る 。 {用|よう} が {済|す}んだら {来|こ}い 。 || The boat sails every day. Come when you're done here.

@scene mb.ferry_tetsu_again
!faceplayer
tetsu: {八百橋|やおばし} へ {戻|もど}る か 。 || Back to Manybridge?
!choice
* はい 、 お{願|ねが}いします 。 || Yes, please. -> go
* いいえ 。 || No. -> end
:go
!call mb.ferry_east
:end

@scene mb.ferry_east
!fade out
narr: {船|ふね} は {岬|みさき} を {回|まわ}って 、 {東|ひがし} へ {進|すす}む 。 {海|うみ} の {色|いろ} が 、 {少|すこ}し ずつ {川|かわ} の {緑|みどり} に {変|か}わって いく 。 || The boat rounds the headland and heads east. Little by little the sea turns the green of river water.
!warp mb.pier 16 14 up
!fade in
?(!mb_arrived) !call mb.arrive

@scene mb.ferry_west
narr: テツ の {船|ふね} が 、 {渡|わた}し{場|ば} に {繋|つな}いで ある 。 {潮硝子|しおがらす} へ の {便|びん} だ 。 || Tetsu's boat is tied up at the jetty: the crossing back to Saltglass.
!choice
* {潮硝子|しおがらす} へ {戻|もど}る 。 || Go back to Saltglass. -> go
* まだ {乗|の}らない 。 || Not yet. -> end
:go
!fade out
narr: {船|ふね} は {西|にし} へ 。 {橋|はし} が {一|ひと}つ ずつ {遠|とお}ざかって いく 。 || The boat heads west. The bridges fall behind one by one.
!warp sg.harbor 33 28 up
!fade in
:end

@scene mb.daigo_east
!faceplayer
daigo: テツ の {船|ふね} が {東|ひがし} へ {出|で}る そう だ ぞ 。 {八百橋|やおばし} の {荷|に} が {止|と}まって 、 こっち の {干物|ひもの} も {行|い}き{場|ば} が ねえ ！ || Tetsu's boat is heading east, they say. Manybridge's cargo has stopped, and our dried fish have nowhere to go!

@scene mb.north_washed
# Staged: back at the fork, a notice tied to the fork lantern's post: the north road's bridge went in the storm.
!gesture pc read 17,8
narr: {分|わ}かれ{道|みち} の {灯籠|とうろう} に 、 {札|ふだ} が {結|むす}んで ある 。 || A notice is tied to the fork lantern's post.
narr: 「{北|きた} の {道|みち} の {橋|はし} 、 {嵐|あらし} で {流|なが}れました 。 {直|なお}る まで 、 {通|とお}れません 。」 || "The bridge on the north road was washed away in the storm. Closed until it is mended."
?(comp=nao) comp: {北|きた} は {当分|とうぶん} {無理|むり} か 。 …… なら 、 {船|ふね} だ な 。 || No north road for a while, then. …The boat it is.
?(comp=mio) comp: {橋|はし} が {直|なお}る まで 、 {待|ま}つ しか ない ね 。 || Nothing for it but to wait till the bridge is mended.
?(comp=ren) comp: {橋|はし} を {架|か}ける {大工|だいく} は 、 {八百橋|やおばし} に {多|おお}い と {聞|き}きます 。 || I hear Manybridge is where the bridge carpenters are.
?(comp=suzu) comp: {北|きた} が だめ なら 、 {東|ひがし} よ 。 {道|みち} は {一|ひと}つ じゃ ない わ 。 || If north's no good, then east. There's more than one road.
!warp sg.road 16 2 down

@scene mb.arrive
# Staged: off the boat onto the quay; you look up the canal at the bridges, one after another; a barge drifts
# sideways under the Harbour Bridge and bumps the quay; Take, a porter, shouts at the blank plaque; your companion's
# own first look (Nao counts the bridges, Mio covers her mouth at the bump, Ren looks at the plaques, Suzu spreads her
# arms at the city); you point up the canal into town.
!set mb_arrived
!chapter mb1
!travel manybridge
!gesture pc lookroad up
narr: {船|ふね} を {降|お}りる と 、 {水|みず} の {匂|にお}い と {人|ひと} の {声|こえ} が {一度|いちど} に {押|お}し{寄|よ}せて きた 。 || Off the boat, the smell of water and the noise of people come at you all at once.
!card {第三章|だいさんしょう} ・ {八百橋|やおばし} || Chapter 3 — Manybridge: Eight Hundred Bridges
narr: {運河|うんが} の {上|うえ} に 、 {橋|はし} が {次|つぎ} から {次|つぎ} へ と {架|か}かって いる 。 {八百|はっぴゃく} の {橋|はし} の {町|まち} 、 {八百橋|やおばし} だ 。 || Bridge after bridge spans the canal. Manybridge: the city of eight hundred bridges.
!shake 2
narr: ゴン 、 と {鈍|にぶ}い {音|おと} 。 {荷舟|にぶね} が {一|ひと}つ 、 {横|よこ} に {流|なが}れて {岸|きし} に ぶつかった 。 || A dull clunk. A barge has drifted sideways into the quay.
!look mb_take 25,6
mb_take: どっち だ よ ！ {札|ふだ} が {真|ま}っ{白|しろ} で 、 どこ を {曲|ま}がる か {分|わ}から ねえ ！ || Which way, then?! The plaque's blank — how am I supposed to know where to turn?!
!look comp pc
?(comp=nao) !gesture comp observe 25,6
?(comp=nao) comp: {一|ひと}つ 、 {二|ふた}つ 、 {三|みっ}つ …… {見|み}える {橋|はし} の {札|ふだ} 、 {全部|ぜんぶ} {白|しろ}い 。 {舟|ふね} が {迷|まよ}う わけ だ 。 || One, two, three… every plaque I can see is blank. No wonder the boats are lost.
?(comp=mio) !gesture comp flinch
?(comp=mio) comp[surprise]: あっ …… {舟|ふね} の {人|ひと} 、 {大丈夫|だいじょうぶ} ？ …… よかった 、 {怪我|けが} は ない みたい 。 || Oh — is the boatman all right? …Good, he doesn't look hurt.
?(comp=ren) !gesture comp observe 25,6
?(comp=ren) comp[think]: {橋|はし} の {名札|なふだ} が 、 {灯籠|とうろう} の {笠|かさ} と {同|おな}じ {消|き}え{方|かた} を して います 。 {字|じ} だけ が 、 きれい に ない 。 || The bridges' plaques have faded the way the lantern shades did. Only the letters gone, and cleanly.
?(comp=suzu) !gesture comp size
?(comp=suzu) comp[smile]: {着|つ}いた わ よ 、 {八百橋|やおばし} ！ …… {町|まち} は {賑|にぎ}やか な のに 、 {橋|はし} が {黙|だま}って いる の ね 。 || Here we are, Manybridge! …The city's as loud as ever, but the bridges have gone quiet.
!gesture pc point 13,0
pc: {町|まち} の {中|なか} で 、 {話|はなし} を {聞|き}こう 。 || Let's ask around in town.
!quest mb_main start
!note mb_yaobashi
!journal {東|ひがし} の {運河|うんが} の {町|まち} 、 {八百橋|やおばし} へ 。 {橋|はし} の {名前|なまえ} が {消|き}えて いる 。 || East to the canal city of Manybridge. The bridges' names are fading.

@scene mb.exchange_first
# Staged: into the Exchange district: you stop on the quay and look across the Long Canal at the bridges, the Tally
# Exchange's roofs and the porters; a clerk (Sen) runs across the Tally Bridge with an armful of papers; your
# companion turns to you.
!set mb_exchange_seen
!gesture pc observe up
narr: {長|なが}い {運河|うんが} の {向|む}こう に 、 {大|おお}きな {瓦|かわら} {屋根|やね} の {建物|たてもの} が {見|み}える 。 {札場|ふだば} だ 。 {商人|しょうにん} が {札|ふだ} を {掛|か}けて 、 {取引|とりひき} を {決|き}める {所|ところ} 。 || Across the long canal stands a building with a great tiled roof: the Tally Exchange, where merchants hang their tallies and strike their deals.
narr: {札場|ふだば} の {前|まえ} は 、 {怒|おこ}った {声|こえ} で いっぱい だ 。 「{届|とど}いて ない ！」 「{送|おく}った ！」 || Outside it, angry voices. "It never came!" "I sent it!"
?(comp=nao) comp: {荷|に} が {届|とど}かない と 、 {人|ひと} は まず {誰|だれ} か を {疑|うたが}う 。 {配達人|はいたつにん} の {方|ほう} が {先|さき} に な 。 || When cargo doesn't arrive, people suspect someone first. Usually the one who carried it.
?(comp=mio) comp[think]: みんな {疲|つか}れた {顔|かお} を してる 。 …… {怒|おこ}る の は 、 {困|こま}って いる から だ よ ね 。 || Everyone looks worn out. …They're angry because they're at their wits' end.
?(comp=ren) comp: {取引|とりひき} の {町|まち} です から 、 {名前|なまえ} が {消|き}える と 、 {約束|やくそく} も {一緒|いっしょ} に {迷子|まいご} に なる の でしょう 。 || In a trading city, when the names go, the promises get lost along with them.
?(comp=suzu) comp[smirk]: {大声|おおごえ} の {掛|か}け{合|あ}い 、 {懐|なつ}かしい わ 。 …… でも 、 {今日|きょう} の は {芝居|しばい} じゃ ない みたい ね 。 || Shouting matches — how nostalgic. …But today's isn't a play, by the look of it.
?(quest.mb_main=0) narr: {荷運|にはこ}び の {男|おとこ} が 、 {藤|ふじ} の {橋|はし} の {方|ほう} を {指|ゆび} さして {叫|さけ}んで いる 。 「{藤屋|ふじや} の {米|こめ} が また {迷子|まいご} だ ！」 || A porter is shouting and pointing towards the Wisteria Bridge: "Fujiya's rice is lost again!"

@scene mb.pier_sign
narr: 「{渡|わた}し{場|ば} 。 {潮硝子|しおがらす} {行|ゆ}き は {毎日|まいにち} 、 {満|み}ち{潮|しお} で {出|で}ます 。」 || "Ferry pier. For Saltglass, daily, on the high tide."

@scene mb.sign_city
narr: 「{八百橋|やおばし} 。 {北|きた} に {札場|ふだば} 、 {東|ひがし} に {藤屋|ふじや} と {荷運|にはこ}び{屋|や} 、 {南|みなみ} に {宿|やど} 。 {蔵|くら} の {並|なら}び は {東|ひがし} の {道|みち} の {先|さき} 。」 || "Manybridge. North, the Tally Exchange; east, Fujiya and the porters; south, the inn. Warehouse Row: along the east road."

@scene mb.mailbox
narr: {赤|あか}い {郵便箱|ゆうびんばこ} 。 {宛名|あてな} の {消|き}えた {手紙|てがみ} は 、 {札場|ふだば} の {下|した} の {宛先不明|あてさきふめい} の {係|かかり} へ {回|まわ}される らしい 。 || A red postbox. Letters whose addresses have faded go to the dead-letter office under the Tally Exchange, it seems.
?(comp=nao) comp[think]: {宛先不明|あてさきふめい} か 。 {配達人|はいたつにん} の {墓場|はかば} だ な 。 …… {冗談|じょうだん} だ よ 。 || Dead letters. A courier's graveyard. …Joking.

@scene mb.door_locked
narr: {戸|と} は {閉|し}まって いる 。 || The door is shut.

@scene mb.door_ferryoffice
narr: {渡|わた}し{場|ば} の {事務所|じむしょ} 。 {今|いま} は {誰|だれ} も いない 。 {時刻表|じこくひょう} が {貼|は}って ある 。 || The ferry office. Nobody in just now. A timetable is pinned up.

@scene mb.door_kura
narr: {白|しろ}い {壁|かべ} の {蔵|くら} 。 {重|おも}い {戸|と} に {錠|じょう} が かかって いる 。 || A white-walled storehouse. A lock hangs on the heavy door.

@scene mb.door_kayo
narr: {小|ちい}さな {家|いえ} 。 {中|なか} から 、 {子供|こども} の {笑|わら}い{声|ごえ} が {聞|き}こえる 。 || A small house. A child's laughter comes from inside.
?(mb_ichi_found) narr: {戸|と} の {前|まえ} に 、 {小|ちい}さな {草履|ぞうり} が {揃|そろ}えて {置|お}いて ある 。 || A small pair of sandals has been set neatly by the door.

@scene mb.take_idle
mb_take: {荷|に} を {運|はこ}ぶ の は {得意|とくい} だ が 、 {道|みち} を {覚|おぼ}える の は {札|ふだ} の {仕事|しごと} だった ん だ よ 。 || Carrying cargo, I'm good at. Remembering the way was the plaques' job.

@scene mb.take_city
mb_take: {藤屋|ふじや} の {米|こめ} 、 {今週|こんしゅう} で {三度目|さんどめ} の {迷子|まいご} だ 。 {女将|おかみ} は {藤橋|ふじばし} の {向|む}こう に いる ぜ 。 || That's the third time this week Fujiya's rice has gone astray. The mistress is over the Wisteria Bridge.
?(quest.mb_main>=1) mb_take: {荷運|にはこ}び{屋|や} は {藤屋|ふじや} の {隣|となり} だ 。 {運河|うんが} の {盤|ばん} が ある 。 || The porters' office is next to Fujiya. That's where the canal board is.

@scene mb.take_after
mb_take: {札|ふだ} が {読|よ}める って 、 いい な ！ {荷|に} が {真|ま}っ{直|す}ぐ {着|つ}く ！ || Plaques you can read — what a thing! The cargo goes straight there!

@scene mb.kayo_idle
mb_kayo: うち の イチ 、 {橋|はし} を {数|かぞ}える の が {好|す}き なん です 。 {名前|なまえ} が {消|き}えて 、 {寂|さび}しがって います 。 || My Ichi loves counting the bridges. Now the names are gone, he misses them.

@scene mb.kayo_after
mb_kayo: あの {夜|よる} は 、 {本当|ほんとう} に ありがとう ございました 。 イチ は もう 、 {一人|ひとり} で {川|かわ} の そば に {行|い}きません 。 …… たぶん 。 || Thank you so much, for that night. Ichi doesn't go near the canal alone any more. …I think.

@scene mb.ichi_after
mb_ichi: {橋|はし} の {名前|なまえ} 、 {全部|ぜんぶ} {覚|おぼ}えた よ ！ {八百|はっぴゃく} は まだ だ けど ！ || I learned all the bridges' names! Not all eight hundred yet!
`, 'mb/20_scenes_arrive.js');
