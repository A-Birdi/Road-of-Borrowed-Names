/* Chapter 3 main story: arrival, the suspicion, the chronicle, the records,
 * Tokiwa's resistance, the way up, and the return. The dungeon, the
 * assembly and the festival are in 41_scenes_kiln.js / 43_scenes_end.js. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
@scene co.arrive
# Staged: you stop where the road starts to climb and look up the terraces to the workshop smoke; your
# companion's own first look (Nao along the road to the one way out, Mio bends to the wilting herbs, Ren leans
# in to the rewritten lantern and says the pun without a gesture, Suzu's showman's hands, then a glance away).
!music co_road
!chapter 3
!card {第三章|だいさんしょう} ・ {灰実|はいみ}の{里|さと} || Chapter Three — Cinder Orchard
!gesture pc lookroad up
narr: {坂道|さかみち} の {両側|りょうがわ} に 、 {実|み} を つけた {柿|かき} の {木|き} が {並|なら}んで いる 。 || The road climbs between persimmon trees heavy with fruit.
narr: {丘|おか} の {上|うえ} は {段々畑|だんだんばたけ} 。 {工房|こうぼう} の {煙突|えんとつ} から 、 {細|ほそ}い {煙|けむり} が {上|あ}がって いる 。 || Above, the hill is stepped with terraces, and thin smoke rises from workshop chimneys.
?(comp=nao) !gesture comp lookroad right
?(comp=nao) comp[smirk]: {柿|かき} と ガラス と {祭|まつ}り の {里|さと} か 。 {配達|はいたつ} で {一回|いっかい} {来|き}た 。 {坂|さか} が {多|おお}くて 、 {靴|くつ} が {減|へ}る ん だ よ な 。 || Persimmons, glass and a festival. I delivered here once. All slopes — it eats your boots.
?(comp=nao) !gesture comp point 35,11
?(comp=nao) comp: …… {出口|でぐち} の {少|すく}ない {村|むら} だ 。 {下|した} へ {一本|いっぽん} 、 {水|みず} の {道|みち} が ある だけ 。 || …Not many ways out of this place. One channel running downhill, and that's it.
?(comp=mio) comp[smile]: {空気|くうき} が {乾|かわ}いて います ね 。 {柿|かき} を {干|ほ}す に は いい けど …… {喉|のど} を {痛|いた}める {人|ひと} が {多|おお}そう 。 || The air's so dry. Good for drying persimmons, but… I'd guess a lot of sore throats.
?(comp=mio) !gesture comp bend down
?(comp=mio) comp[think]: {道端|みちばた} の {薬草|やくそう} まで {萎|しお}れて いる 。 {雨|あめ} 、 {長|なが}い こと {降|ふ}って ない みたい です 。 || Even the herbs by the road are wilting. It hasn't rained in a long while.
?(comp=ren) !gesture comp observe prop:lantern
?(comp=ren) comp[think]: {灯|ひ} の {名|な} は 「 {灰実|はいみ} 」 。 …… {字|じ} は {新|あたら}しい のに 、 {芯|しん} が {古|ふる}い 。 {書|か}き{直|なお}された {灯|ひ} です ね 。 || The lantern's name reads "Haimi". …The letters are new but the wick is old. Someone has rewritten this lantern.
?(comp=ren) comp[smirk]: {灰|はい} の {里|さと} で 「 はい 」 と ばかり {言|い}う {人|ひと} が いて も 、 {驚|おどろ}かない で ください 。 …… {失礼|しつれい} 。 {駄洒落|だじゃれ} です 。 || If people in the village of ash say nothing but "hai", don't be surprised. …Forgive me. That was a pun.
?(comp=suzu) !gesture comp size
?(comp=suzu) comp[laugh]: さあ さあ 、 お{立|た}ち{会|あ}い ！ {柿|かき} に ガラス に {秋祭|あきまつ}り 。 {舞台|ぶたい} が {一番|いちばん} {映|は}える {里|さと} …… と 、 {聞|き}いた こと が ある わ 。 || Roll up, roll up! Persimmons, glass and an autumn festival — the finest stage west of the mountains… or so I've heard.
?(comp=suzu) !gesture comp aside
?(comp=suzu) comp[closed]: …… {聞|き}いた だけ よ 。 ほんと に 。 || …Only heard. Really.
!look pc comp
pc: {祭|まつ}り の {前|まえ} に {着|つ}いた みたい だ ね 。 || Looks like we've arrived just before the festival.
!set co_arrived
!quest co_main 0
!note co_orchard
!autosave

@scene co.road_marker
# Staged: you lean in to the carved words on the stone; your companion answers in their own way (Nao points
# out the grass strip beyond it, Mio's guarded hand, Ren's open hand to the strip, Suzu's head goes down, then
# she laughs it off when you turn to her).
!gesture pc observe 22,9
narr: {苔|こけ} の {生|は}えた {石|いし} に 、 {字|じ} が {彫|ほ}って ある 。 「 {火除|ひよ}け 」 。 || Words are carved into the mossy stone: 火除け — "fire-ward".
narr: {石|いし} の {向|む}こう に は 、 {道|みち} の よう に {幅|はば} の {広|ひろ}い 、 {草|くさ} だらけ の {帯|おび} が {続|つづ}いて いる 。 || Beyond it runs a strip as wide as a road, thick with dry grass.
?(comp=nao) !gesture comp point 22,5
?(comp=nao) comp: {火除|ひよ}け ？ この {草|くさ} で ？ {逆|ぎゃく} に よく {燃|も}え そう だ けど な 。 || Fire-ward? With this much grass on it? Looks more like kindling.
?(comp=mio) !gesture comp guard
?(comp=mio) comp[worry]: {火除|ひよ}け の {道|みち} …… {本当|ほんとう} は {草|くさ} を {刈|か}って おく {道|みち} です よ ね 。 {誰|だれ} も {手入|てい}れ して いない 。 || A firebreak… it's meant to be kept mown. Nobody has touched it.
?(comp=ren) !gesture comp palm 22,5
?(comp=ren) comp: {火除|ひよ}け{道|みち} です ね 。 {古|ふる}い {里|さと} に は よく あります 。 {手入|てい}れ を やめれば 、 ただ の {草|くさ}むら です が 。 || A firebreak path. Old villages often have them. Stop tending one and it's just a strip of weeds.
?(comp=suzu) !gesture comp lowered hold
?(comp=suzu) comp[closed]: …… {昔|むかし} は 、 きれい に {刈|か}って あった のに 。 || …It used to be cut so neatly.
?(comp=suzu) !gesture pc listen comp
?(comp=suzu) pc: スズ ？ || Suzu?
?(comp=suzu) !gesture comp laugh
?(comp=suzu) comp[laugh]: ん ？ {火除|ひよ}け って 、 {普通|ふつう} そう でしょ 、 って {話|はなし} 。 || Hm? I just mean that's what firebreaks are normally like.
!if co_clue_marker -> end
!set co_clue_marker
!var co_clues + 1
!call co.clue_check

@scene co.road_north
# Staged: you look at the thorn scrub over the old road and shade your eyes to the snow peaks beyond; your
# companion's own answer (Nao's shrug, Mio leans in to the dry brambles, Ren's open hand, Suzu glances away
# from the road north).
!gesture pc observe 23,5
narr: {北|きた} へ {向|む}かう {古|ふる}い {道|みち} は 、 {乾|かわ}いた {茨|いばら} に {埋|う}もれて いる 。 || The old road north is buried under dry thorn scrub.
!gesture pc shadeeyes up
narr: {茂|しげ}み の {向|む}こう 、 {雪|ゆき} を かぶった {峰|みね} が {見|み}える 。 {雪鈴|ゆきすず} へ の {道|みち} だ 。 || Beyond it, snow-capped peaks: the road to Snowbell.
?(comp=nao) !gesture comp shrug
?(comp=nao) comp: {抜|ぬ}けられ なく は ない けど 、 {服|ふく} が {全部|ぜんぶ} {破|やぶ}れる 。 {先|さき} に {村|むら} だ 。 || Could force it, if you don't mind losing your clothes. Village first.
?(comp=mio) !gesture comp observe 23,5
?(comp=mio) comp[worry]: この {茨|いばら} 、 {枯|か}れて カラカラ です 。 {火|ひ} が ついたら 、 ひとたまり も ない 。 || These brambles are bone dry. One spark and they'd go up like paper.
?(comp=ren) !gesture comp palm
?(comp=ren) comp: {道|みち} が 、 {道|みち} で ある こと を {忘|わす}れて います 。 {先|さき} に {里|さと} の {人|ひと} に {話|はなし} を {聞|き}きましょう 。 || This road has forgotten it's a road. Let's talk to the villagers first.
?(comp=suzu) !gesture comp aside
?(comp=suzu) comp: {雪鈴|ゆきすず} へ は 、 {祭|まつ}り の {後|あと} で ね 。 …… {後|あと} で 。 || Snowbell after the festival. …After.

@scene co.clue_check
!if co_suspect -> end
!if !co_met_sayo -> end
!if var.co_clues<3 -> end
!call co.suspect
`, 'ch3/road');

RB.script.add(`
@scene co.village_first
# Staged: your companion steps off the road beside you (the follow rule left them on your tile); you look along the square being decorated and turn towards Sayo calling from it (she is up the
# square among the ladders, heard before she is near); your nod; your companion's own answer to the perfect
# record (Nao's smirk and a look away, Mio's hand to the chin, Ren's glasses, Suzu's head goes down and then
# an open hand for the "applause").
!walkto comp 1 19 right
!gesture pc lookroad right
narr: {広場|ひろば} で は 、 {人|ひと} が {梯子|はしご} に {登|のぼ}って {飾|かざ}り を {吊|つ}るして いる 。 {柿|かき} の {甘|あま}い におい と 、 {削|けず}った {木|き} の におい 。 || In the square, people up ladders are stringing decorations. The air smells of sweet persimmon and fresh-cut wood.
!look pc co_sayo
co_sayo[smile]: あ 、 {旅|たび} の {方|かた} ！ ようこそ 、 {灰実|はいみ}の{里|さと} へ ！ いい {時|とき} に {来|き}ました ね 。 {秋祭|あきまつ}り は {三日|みっか} {後|ご} です よ ！ || Oh — travellers! Welcome to Cinder Orchard! You've come at a good time: the autumn festival is in three days!
co_sayo: {祭|まつ}り の {世話役|せわやく} の サヨ です 。 {泊|と}まる ところ なら 、 {西|にし} の フサ さん の {宿|やど} が いい です よ 。 || I'm Sayo — I'm running the festival. If you need a bed, Fusa's inn on the west side is lovely.
!gesture pc nod
pc: ありがとう ございます 。 {立派|りっぱ} な {祭|まつ}り みたい です ね 。 || Thank you. It looks like quite a festival.
co_sayo[laugh]: {立派|りっぱ} です とも ！ {百二十年|ひゃくにじゅうねん} 、 {一度|いちど} も {休|やす}んだ こと が ない ん です 。 {雨|あめ} の {年|とし} も 、 {不作|ふさく} の {年|とし} も 。 || It certainly is! A hundred and twenty years, and it's never once been skipped — not in wet years, not in bad harvests.
co_sayo: {記録堂|きろくどう} の {年代記|ねんだいき} に 、 {全部|ぜんぶ} {書|か}いて あります 。 {火事|かじ} も {洪水|こうずい} も 、 {一度|いちど} も なし ！ || It's all in the chronicle at the Chronicle Hall. Not one fire, not one flood, ever!
?(comp=nao) !gesture comp aside
?(comp=nao) comp[smirk]: …… {火事|かじ} が ない の を {自慢|じまん} する {村|むら} 、 {初|はじ}めて {見|み}た 。 || …First village I've seen that brags about not having fires.
?(comp=mio) !gesture comp chin
?(comp=mio) comp[think]: {一度|いちど} も ？ …… {百二十年|ひゃくにじゅうねん} で ？ || Not once? …In a hundred and twenty years?
?(comp=ren) !gesture comp glasses
?(comp=ren) comp: {記録|きろく} が {完璧|かんぺき} すぎる の は 、 {灯守|ひもり} と して は {少|すこ}し {気|き} に なります ね 。 || As a lantern keeper, I find a record that perfect a little worrying.
?(comp=suzu) !gesture comp lowered hold
?(comp=suzu) comp[closed]: …… || …
?(comp=suzu) !gesture comp palm
?(comp=suzu) comp[smile]: {素敵|すてき} ね 。 {完璧|かんぺき} な {歴史|れきし} 。 {拍手|はくしゅ} 。 || How lovely. A perfect history. Applause.
co_sayo: じゃ 、 {私|わたし} は {席|せき} の {準備|じゅんび} が ある ので ！ {何|なに} か あったら {声|こえ} を かけて ください ね 。 || Well, I've seats to set out! Just call if you need anything.
!set co_met_sayo
!quest co_main 1
!journal {祭|まつ}り は {三日|みっか} {後|ご} 。 {里|さと} の {記録|きろく} に は 、 {火事|かじ} が {一度|いちど} も ない らしい 。 || The festival is in three days. The village record apparently lists no fire, ever.

@scene co.suspect
# Staged: your feet stop in the square and you look from the empty seat to the ropeless bell; your companion
# says it in their own way (Nao looks between the same two things, Mio's guarded hand and a shake of the head,
# Ren's hand to the chin and the marks counted off, Suzu's head goes down and then she faces you); you point
# the way to the Chronicle Hall.
!if co_suspect -> end
!set co_suspect
!gesture pc lookbetween prop:co_seat and=prop:co_lookout
narr: {広場|ひろば} を {抜|ぬ}ける {途中|とちゅう} で 、 {足|あし} が {止|と}まった 。 || Crossing the square, your feet stop on their own.
?(comp=nao) !gesture comp lookbetween prop:co_seat and=prop:co_lookout
?(comp=nao) comp: なあ 、 {気|き}づいた ？ {空|あ}いた {席|せき} 、 {焦|こ}げた {梁|はり} 、 {誰|だれ} も {使|つか}わない {桶|おけ} 、 {綱|つな} の ない {鐘|かね} 。 || Hey. Notice it? An empty seat, a scorched beam, buckets nobody uses, a bell with no rope.
?(comp=nao) comp: {全部|ぜんぶ} 、 {同|おな}じ {穴|あな} の {周|まわ}り を よけて {歩|ある}いてる 。 {宛名|あてな} の {抜|ぬ}けた {手紙|てがみ} と {同|おな}じ {感|かん}じ だ 。 || Everything here walks around the same hole. Same feeling as a letter with the address missing.
?(comp=mio) !gesture comp guard
?(comp=mio) comp[worry]: $name さん 。 この {里|さと} 、 {火傷|やけど} の {薬|くすり} を {置|お}いて いる {家|いえ} が {一軒|いっけん} も ない んです 。 || $name… not one house in this village keeps burn salve.
?(comp=mio) !gesture comp shake
?(comp=mio) comp: ガラス と {焼|や}き{物|もの} の {里|さと} で 、 {火傷|やけど} の {薬|くすり} が ない なんて 。 {何|なに} か を 、 {忘|わす}れさせられて いる みたい 。 || A village of glass and pottery, and no burn salve. It's as if they've been made to forget something.
?(comp=ren) !gesture comp chin hold
?(comp=ren) comp[think]: {灯|ひ} の {名|な} と {同|おな}じ です 。 {上|うわ}{書|が}き の {下|した} に 、 {元|もと} の {字|じ} が {透|す}けて {見|み}える 。 || It's like the lantern's name. Under the overwriting, the original letters still show through.
?(comp=ren) !gesture comp count
?(comp=ren) comp: {空|あ}いた {席|せき} 、 {焦|こ}げた {木|き} 、 {鳴|な}らない {鐘|かね} …… {火|ひ} の {字|じ} を {消|け}した {跡|あと} です 。 || The empty seat, the scorched wood, the silent bell… they're the marks left where the word "fire" was erased.
?(comp=suzu) !gesture comp lowered hold
?(comp=suzu) comp[closed]: …… ねえ 、 $name 。 || …Hey, $name.
?(comp=suzu) !gesture comp avert pc hold
?(comp=suzu) comp: {私|わたし} 、 {嘘|うそ} の {上手|じょうず} な {人|ひと} を たくさん {知|し}ってる の 。 {自分|じぶん} も {含|ふく}めて ね 。 この {里|さと} は {嘘|うそ} を ついてる ん じゃ ない 。 {嘘|うそ} を {信|しん}じてる 。 || I know a lot of good liars. Myself included. This village isn't lying. It believes the lie.
!gesture pc point 43,7
pc: {記録堂|きろくどう} へ {行|い}こう 。 {年代記|ねんだいき} を {見|み}せて もらおう 。 || Let's go to the Chronicle Hall. I want to see that chronicle.
!quest co_main 2
!journal {年代記|ねんだいき} は {火事|かじ} を {記録|きろく} して いない 。 でも {里|さと} の あちこち に 、 {火|ひ} の {跡|あと} が ある 。 || The chronicle records no fire. But the village is full of the marks of one.
`, 'ch3/village-main');

RB.script.add(`
@scene co.tokiwa
# Staged: Tokiwa looks from the desk to you when he sends you to the chronicle or the reading table, adjusts
# his glasses over half a memory, and glances away when he says the kiln is sealed.
!if co_kiln_done -> kiln
!if co_records_done -> after
!if quest.co_main>=4 -> records
!if co_chronicle_read -> hist
!if seen.co.tokiwa_intro -> idle
!call co.tokiwa_intro
!end
:idle
!gesture co_tokiwa lookbetween 5,3 and=pc
co_tokiwa: {年代記|ねんだいき} は {机|つくえ} の {上|うえ} です 。 {頁|ページ} を {折|お}らない よう に 、 お{願|ねが}い します ね 。 || The chronicle is on the desk. Please don't fold the pages.
!end
:hist
!gesture co_tokiwa listen pc
co_tokiwa: {里|さと} の {方|かた} たち に {話|はなし} を {聞|き}いて いる そう です ね 。 {皆|みな} {同|おな}じ こと を {言|い}う でしょう 。 {記録|きろく} と {同|おな}じ こと を 。 || I hear you've been asking the villagers questions. They'll all say the same thing — the same as the record.
?(quest.co_main>=3) !gesture pc palm
?(quest.co_main>=3) pc: {皆|みな} 、 {半分|はんぶん} だけ {覚|おぼ}えて いる こと が ある みたい です 。 || Everyone seems to half-remember something.
!gesture co_tokiwa glasses
co_tokiwa[think]: {半分|はんぶん} の {記憶|きおく} は 、 {記録|きろく} に は なりません 。 …… {証拠|しょうこ} が ある なら 、 {別|べつ} です が 。 || Half a memory isn't a record. …Unless there's evidence, of course.
!end
:records
!gesture co_tokiwa lookbetween 9,6 and=pc
co_tokiwa: {植|う}え{付|つ}け{帳|ちょう} に 、 {窯|かま} の {帳面|ちょうめん} ？ …… {閲覧|えつらん} の {机|つくえ} に {並|なら}べて ください 。 {公平|こうへい} に {見|み}ましょう 。 || The planting book, and the kiln ledger? …Lay them out on the reading table. Let us look at them fairly.
!end
:after
!gesture co_tokiwa aside
co_tokiwa: {窯|かま} の {記録|きろく} が {見|み}つかれば …… いえ 。 {見|み}つかる はず が ない 。 {封|ふう} を して ある の です から 。 || If the kiln's own record were found… no. It can't be. The kiln is sealed.
!end
:kiln
!call co.tokiwa_page

@scene co.tokiwa_intro
# Staged: Tokiwa's nod of welcome and his glasses pushed up over his badly written apprentice years; your
# companion's own answer (Nao looks from him to the square-cornered shelves, Mio leans in to the tidy shelves,
# Ren's open hand, Suzu's laugh); he looks from the desk to you.
!gesture co_tokiwa nod pc
co_tokiwa: {記録堂|きろくどう} へ ようこそ 。 {記録係|きろくがかり} の トキワ です 。 {里|さと} の {年代記|ねんだいき} を {預|あず}かって います 。 || Welcome to the Chronicle Hall. I'm Tokiwa, the recorder. I keep the orchard's chronicle.
!gesture co_tokiwa glasses
co_tokiwa[smile]: {開村|かいそん} から {百二十年|ひゃくにじゅうねん} 、 {一年|いちねん} も {欠|か}けて いません 。 {字|じ} が {汚|きたな}い {年|とし} は あります が 。 {私|わたし} の {見習|みなら}い {時代|じだい} など 。 || A hundred and twenty years since the founding, and not one year missing. A few years are badly written — my apprentice years, for example.
?(comp=nao) !gesture comp lookbetween co_tokiwa and=prop:shelf
?(comp=nao) comp: {几帳面|きちょうめん} な {人|ひと} だ な 。 {封筒|ふうとう} の {角|かど} まで {揃|そろ}って そう 。 || Meticulous type. I bet his envelopes have square corners.
?(comp=mio) !gesture comp observe prop:shelf
?(comp=mio) comp[smile]: {整|ととの}った {棚|たな} です ね 。 …… {落|お}ち{着|つ}きます 。 || Such tidy shelves. …It's calming.
?(comp=ren) !gesture comp palm
?(comp=ren) comp: {記録|きろく} を {守|まも}る {仕事|しごと} です か 。 {灯守|ひもり} と {親戚|しんせき} の よう な もの です ね 。 || Keeping records. A cousin of lantern keeping, then.
?(comp=suzu) !gesture comp laugh
?(comp=suzu) comp[smile]: {字|じ} が {汚|きたな}い {年|とし} 、 ちょっと {見|み}たい わ 。 || I'd quite like to see the badly written years.
!gesture co_tokiwa lookbetween 5,3 and=pc
co_tokiwa: {年代記|ねんだいき} は {机|つくえ} の {上|うえ} です 。 どうぞ 、 {手|て} に {取|と}って ご{覧|らん} ください 。 || The chronicle is on the desk. Please, take a look.

@scene co.chronicle
# Staged: you lean over the chronicle on the desk; when you tell Tokiwa the year is in another hand he turns,
# then his glasses go up over the page he cannot remember and he looks away (a headache, he says), and his
# flat hand insists the village will say the same; your companion's own answer (Nao looks from him to you, Mio
# leans in to look him over, Ren's and Suzu's hand to the chin), and how to go on (Nao points to the door,
# Mio's nod, Ren and Suzu count the three names off).
!if co_chronicle_read -> reread
!if !co_suspect -> casual
!gesture pc observe 5,3
co_tokiwa: {年代記|ねんだいき} です 。 {開村|かいそん} から {今年|ことし} まで 、 {一年|いちねん} も {欠|か}けて いません 。 || The chronicle. From the founding to this year, not a single year missing.
!look co_tokiwa pc
co_tokiwa[smile]: {祭|まつ}り の {頁|ページ} なら 、 {毎年|まいとし} {十月|じゅうがつ} の ところ です 。 || The festival entries are under the tenth month of each year.
!gesture pc observe 5,3 hold
narr: {頁|ページ} を めくる 。 {毎年|まいとし} の {秋祭|あきまつ}り が 、 {同|おな}じ {形|かたち} で {記|しる}されて いる 。 || You turn the pages. Every autumn festival is recorded in the same pattern.
!lesson kana
!challenge co.c_chronicle
!if var._res=0 -> later
narr: {二十年前|にじゅうねんまえ} の {頁|ページ} だけ 、 {墨|すみ} が {新|あたら}しい 。 そして その {年|とし} から {毎年|まいとし} 、 「 {火事|かじ} なし 」 と {書|か}き{足|た}されて いる 。 || Only the page from twenty years ago has fresh ink. And from that year on, every entry adds: "No fire."
!look pc co_tokiwa
!gesture pc palm
pc: トキワ さん 。 この {年|とし} だけ 、 {字|じ} が {違|ちが}います ね 。 || Tokiwa — this year alone is in a different hand.
!gesture co_tokiwa listen pc
co_tokiwa[surprise]: …… {字|じ} が ？ それ は {私|わたし} の {字|じ} です 。 {見習|みなら}い の {頃|ころ} の 。 || …The hand? That's mine. From when I was an apprentice.
!gesture co_tokiwa glasses
co_tokiwa[think]: {見習|みなら}い の {頃|ころ} に 、 {私|わたし} は …… {十月|じゅうがつ} の {頁|ページ} を …… || When I was an apprentice, I… the tenth-month page…
!gesture co_tokiwa aside
co_tokiwa: …… {失礼|しつれい} 。 {少|すこ}し {頭|あたま} が {痛|いた}くて 。 {記録|きろく} に {間違|まちが}い は ありません 。 {私|わたし} が {保証|ほしょう} します 。 || …Excuse me. A slight headache. There is no error in the record. I give you my word.
?(comp=nao) !gesture comp lookbetween co_tokiwa and=pc
?(comp=nao) comp: …… {今|いま} の 、 {嘘|うそ} を つく {顔|かお} じゃ なかった 。 {自分|じぶん} でも {分|わ}かって ない {顔|かお} だ 。 || …That wasn't a lying face. That was the face of a man who doesn't know either.
?(comp=mio) !gesture comp observe co_tokiwa
?(comp=mio) comp[worry]: トキワ さん 、 {顔色|かおいろ} が {悪|わる}い です 。 {座|すわ}って ください 。 {水|みず} を {持|も}って きます 。 || Tokiwa, you've gone pale. Please sit down. I'll fetch some water.
?(comp=ren) !gesture comp chin
?(comp=ren) comp: {記録|きろく} を {守|まも}る {人|ひと} が 、 {記録|きろく} に {守|まも}られて いる 。 …… {逆|ぎゃく} の はず な のに 。 || The keeper of the record is being kept by it. …It's meant to be the other way round.
?(comp=suzu) !gesture comp chin
?(comp=suzu) comp[closed]: …… {見習|みなら}い の {頃|ころ} 、 か 。 || …When he was an apprentice, hm.
!gesture co_tokiwa emphatic
co_tokiwa: {里|さと} の {人|ひと} に {聞|き}いて みて ください 。 {皆|みな} 、 {同|おな}じ こと を {言|い}う はず です 。 || Ask anyone in the village. They'll all tell you the same.
?(comp=nao) !gesture comp point 6,9
?(comp=nao) comp: {聞|き}く なら 、 {年寄|としよ}り と {職人|しょくにん} だ 。 {段々畑|だんだんばたけ} の ばあさん 、 {櫓|やぐら} の じいさん 、 ガラス {工房|こうぼう} の {親方|おやかた} 。 || If we're asking, we ask the old folk and the craftsmen. The grandma on the terraces, the old man at the lookout, the master at the glass workshop.
?(comp=mio) !gesture comp nod pc
?(comp=mio) comp: {話|はなし} を {聞|き}く なら 、 {長|なが}く {住|す}んで いる {方|かた} に 。 {段々畑|だんだんばたけ} の ウメ さん 、 {櫓|やぐら} の ゴロウ さん 、 ガラス {工房|こうぼう} の イサオ さん 。 || We should ask people who've lived here longest. Ume on the terraces, Gorō at the lookout, Isao at the glass workshop.
?(comp=ren) !gesture comp count
?(comp=ren) comp: {古|ふる}い {灯|ひ} ほど 、 {古|ふる}い {名|な} を {覚|おぼ}えて います 。 {人|ひと} も {同|おな}じ でしょう 。 ウメ さん 、 ゴロウ さん 、 イサオ さん に 。 || The older the lantern, the older the names it remembers. People too, I'd think. Ume, Gorō and Isao.
?(comp=suzu) !gesture comp count
?(comp=suzu) comp: {年寄|としよ}り に {聞|き}こう 。 {体|からだ} が {覚|おぼ}えてる こと って 、 ある から 。 ウメ さん 、 ゴロウ さん 、 イサオ さん 。 || Let's ask the old ones. Bodies remember things. Ume, Gorō, Isao.
!set co_chronicle_read
!quest co_main 3
!journal ウメ （ {段々畑|だんだんばたけ} ） 、 ゴロウ （ {櫓|やぐら} ） 、 イサオ （ ガラス {工房|こうぼう} ） に {話|はなし} を {聞|き}こう 。 || Ask Ume (terraces), Gorō (lookout) and Isao (glass workshop) what they remember.
!autosave
!end
:later
narr: {頁|ページ} を {閉|と}じた 。 また {後|あと} で {読|よ}もう 。 || You close the book. You can come back to it.
!end
:casual
!gesture pc observe 5,3
narr: {年代記|ねんだいき} 。 {毎年|まいとし} の {秋祭|あきまつ}り が 、 {同|おな}じ {形|かたち} で {並|なら}んで いる 。 {丁寧|ていねい} な {字|じ} だ 。 || The chronicle. Each year's festival, recorded in the same neat pattern.
!if co_clue_chron -> end
!set co_clue_chron
narr: {二十年前|にじゅうねんまえ} の {頁|ページ} から 、 {毎年|まいとし} {同|おな}じ {一言|ひとこと} が {書|か}き{足|た}されて いる 。 「 {火事|かじ} なし 」 。 || From twenty years ago on, every year has the same words added: "No fire."
!var co_clues + 1
!call co.clue_check
!end
:reread
!gesture pc observe 5,3
narr: 「 {同年|どうねん} {十月|じゅうがつ} {十五日|じゅうごにち} 、 {秋祭|あきまつ}り 、 {例年|れいねん} どおり 。 {火事|かじ} なし 。 」 {新|あたら}しい {墨|すみ} が 、 {他|ほか} の {頁|ページ} より {黒|くろ}い 。 || "Same year, 10/15: autumn festival, as usual. No fire." The new ink is blacker than the rest.
!if !co_restored -> end
narr: その {下|した} に 、 {震|ふる}える {字|じ} で {一行|いちぎょう} 。 {墨|すみ} は {深|ふか}く 、 {紙|かみ} に {沈|しず}んで いる 。 || Below it, one line in a shaking hand. The ink has sunk deep into the paper.

@scene co.hall_shelf
narr: {古|ふる}い {年代記|ねんだいき} の {写|うつ}し 。 {開村|かいそん} の {頁|ページ} に 、 {里|さと} を {作|つく}った {人|ひと} たち の {決|き}まり が {書|か}いて ある 。 || Copies of older chronicles. On the founding page, the founders' rules are set down.
narr: 「 {一|ひと}つ 、 {毎年|まいとし} {秋|あき} に 、 {三本|さんぼん} の {火除|ひよ}け{道|みち} を {刈|か}る こと 。 」 || "First: every autumn, cut the three firebreak paths."
?(!co_restored) narr: その {一行|いちぎょう} だけ 、 {誰|だれ} も {読|よ}まない よう に 、 {頁|ページ} の {端|はし} が {折|お}れて いる 。 || The corner of the page is folded over, just across that one line, as if nobody was meant to read it.
?(comp=ren) comp: {一番目|いちばんめ} の {決|き}まり が 、 {一番|いちばん} {忘|わす}れられて いる 。 よく ある こと です 。 {残念|ざんねん} ながら 。 || The first rule is the most forgotten. It happens a lot. Sadly.

@scene co.hall_register
narr: {里|さと} の {戸数|こすう} を {記|しる}した {台帳|だいちょう} 。 {毎年|まいとし} 、 {少|すこ}し ずつ {増|ふ}えたり {減|へ}ったり して いる 。 || A register of the orchard's households. Year by year the number rises and falls a little.
narr: {二十年前|にじゅうねんまえ} だけ 、 {五十二軒|ごじゅうにけん} から {四十七軒|よんじゅうななけん} に {一度|いちど} に {減|へ}って いる 。 {理由|りゆう} は {書|か}いて いない 。 || Only twenty years ago does it drop all at once — from fifty-two households to forty-seven. No reason is given.
?(comp=nao) comp: {五軒|ごけん} {分|ぶん} の {宛先|あてさき} が 、 {黙|だま}って {消|き}えた わけ か 。 || Five households' worth of addresses, gone without a word.
!set co_saw_register

@scene co.hall_reading
# Staged: you lay the records out on the reading table and Tokiwa comes to stand at its side to look at them
# with you (he goes back to his place after the scene).
!if co_records_done -> done
!if quest.co_main<4 -> early
!gesture pc present 9,6 prop=book
narr: {閲覧|えつらん} の {机|つくえ} に 、 {年代記|ねんだいき} 、 {窯|かま} の {帳面|ちょうめん} 、 {植|う}え{付|つ}け{帳|ちょう} 、 {戸数|こすう} の {台帳|だいちょう} 、 {火除|ひよ}け{道|みち} の {手入|てい}れ {日誌|にっし} を {並|なら}べた 。 || On the reading table you lay out the chronicle, the kiln ledger, the planting book, the household register and the firebreak upkeep log.
!walkto co_tokiwa 8 6 right
!gesture co_tokiwa observe 9,6
co_tokiwa: …… {拝見|はいけん} しましょう 。 {公平|こうへい} に 。 || …Let us look. Fairly.
!lesson kana
!challenge co.c_records
!if var._res=0 -> later
!call co.tokiwa_confront
!end
:later
!gesture pc bend 9,6
narr: {帳面|ちょうめん} を {重|かさ}ねて おいた 。 {続|つづ}き は また {後|あと} で 。 || You stack the books neatly. You can pick this up later.
!end
:early
!gesture pc observe 9,6
narr: {閲覧|えつらん} {用|よう} の {机|つくえ} 。 {紙|かみ} を {押|お}さえる {文鎮|ぶんちん} が {四|よっ}つ 、 {角|かど} に {並|なら}んで いる 。 || A reading table. Four paperweights sit squarely at the corners.
!end
:done
narr: {机|つくえ} の {上|うえ} は 、 {元|もと} どおり {片付|かたづ}いて いる 。 トキワ の {仕事|しごと} は {早|はや}い 。 || The table has been cleared back to perfect order. Tokiwa works fast.

@scene co.tokiwa_confront
# Staged: you both lean over the records; you turn to Tokiwa to say it, and his flat hand refuses it; he takes
# up one record after another to explain each away; your companion's own answer (Nao points at the records,
# Mio's flat hand, Ren holds the two things apart in both hands, Suzu's open hand); his head goes down over
# "suppose, then", and he looks up to ask whether he should decide; you turn to the door as Tamotsu walks in
# (his arms fold over the weeds), Tokiwa's glasses over the kiln, Tamotsu's nod.
!gesture pc observe 9,6
!gesture co_tokiwa observe 9,6
narr: {並|なら}べて {見|み}る と 、 {記録|きろく} は {同|おな}じ {秋|あき} を {指|さ}して いた 。 {窯|かま} は {十四日|じゅうよっか} で {止|と}まり 、 {翌春|よくしゅん} に {作|つく}り{直|なお}された 。 {上|うえ} の {段|だん} に {苗木|なえぎ} が {二百本|にひゃっぽん} 。 {五軒|ごけん} の {家|いえ} が {消|き}えた 。 || Side by side, the records all point to the same autumn. The kiln stops on the fourteenth and is rebuilt the next spring. Two hundred saplings on the upper terraces. Five households gone.
narr: そして {同|おな}じ {年|とし} 、 {火除|ひよ}け{道|みち} の {草刈|くさか}り が 「 {火事|かじ} が ない ので 」 {止|や}められて いる 。 || And that same year, the firebreak grass-cutting was stopped "because there are no fires".
!look pc co_tokiwa
!gesture pc palm
pc: トキワ さん 。 {二十年前|にじゅうねんまえ} 、 ここ で {火事|かじ} が あった ん です 。 || Tokiwa. Twenty years ago, there was a fire here.
!gesture co_tokiwa emphatic
co_tokiwa[angry]: …… ありません 。 || …There was not.
!gesture co_tokiwa read prop=ledger hold
co_tokiwa: {苗木|なえぎ} は {病気|びょうき} で {植|う}え{替|か}えた の かも しれない 。 {窯|かま} は {古|ふる}く なった の かも しれない 。 {帳面|ちょうめん} の {空白|くうはく} は 、 {誰|だれ} か が {書|か}き{忘|わす}れた の かも しれない 。 || The saplings may have been replaced for blight. The kiln may simply have grown old. The gap in the ledger may be someone's forgetfulness.
co_tokiwa: {一|ひと}つ {一|ひと}つ は 、 {全部|ぜんぶ} {説明|せつめい} が つきます 。 || Each thing, on its own, can be explained.
?(comp=nao) !gesture comp point 9,6
?(comp=nao) comp: {全部|ぜんぶ} {同|おな}じ {年|とし} に {起|お}きた こと まで 、 {説明|せつめい} できる の か ？ || And can you explain them all happening in the same year?
?(comp=mio) !gesture comp emphatic
?(comp=mio) comp[angry]: {一|ひと}つ ずつ {説明|せつめい} を つけて 、 {全体|ぜんたい} を {見|み}ない ふり を する の は 、 {診察|しんさつ} と して は {最悪|さいあく} です 。 || Explaining every symptom separately so you never have to look at the whole patient — as a diagnosis, that's the worst there is.
?(comp=ren) !gesture comp size
?(comp=ren) comp: {字|じ} を {一|ひと}つ ずつ {見|み}て も 、 {名前|なまえ} は {読|よ}めません 。 {並|なら}べて {初|はじ}めて 、 {読|よ}める 。 || Look at each character on its own and you'll never read the name. Only side by side can you read it.
?(comp=suzu) !gesture comp palm
?(comp=suzu) comp: {一幕|ひとまく} ずつ なら 、 どんな {筋|すじ} でも {通|とお}る わ 。 {通|とお}し {稽古|げいこ} を したら 、 {穴|あな} が {見|み}える の よ 。 || Scene by scene, any plot makes sense. Run the whole play through and you see the holes.
!gesture co_tokiwa lowered hold
co_tokiwa[sad]: …… {仮|かり} に 、 {火事|かじ} が あった と しましょう 。 || …Suppose, then, that there was a fire.
co_tokiwa: {里|さと} の {皆|みな} は 、 {今|いま} 、 {笑|わら}って {祭|まつ}り の {準備|じゅんび} を して います 。 {誰|だれ} も {泣|な}いて いない 。 その {記憶|きおく} を {戻|もど}せば 、 {皆|みな} が {泣|な}く 。 || Everyone in this village is laughing as they prepare the festival. Nobody is crying. Bring that memory back, and everyone will weep.
!gesture co_tokiwa listen pc
co_tokiwa: それ を {記録係|きろくがかり} の {私|わたし} が 、 {確|たし}か でも ない {証拠|しょうこ} で {決|き}めて いい の です か 。 || Should I — the recorder — decide that, on evidence that isn't even certain?
!gesture pc listen 6,9
narr: {扉|とびら} が {開|あ}いた 。 {水番|みずばん} の タモツ が 、 {泥|どろ} の ついた {長靴|ながぐつ} の まま {入|はい}って きた 。 || The door opens. Tamotsu, the channel keeper, walks in without taking off his muddy boots.
co_tamotsu: トキワ 。 {水路|すいろ} が {三分|さんぶ} の {一|いち} を {切|き}った 。 {雨|あめ} は {四十日|よんじゅうにち} {降|ふ}って ない 。 || Tokiwa. The channel's below a third. It hasn't rained in forty days.
!gesture co_tamotsu folded hold
co_tamotsu: {話|はなし} は {外|そと} で {聞|き}こえた 。 {火事|かじ} が あった か なかった か 、 {俺|おれ} に は {分|わ}からん 。 だが {今|いま} {上|うえ} で {火|ひ} が {出|で}たら 、 {止|と}める もの は {何|なに} も ない 。 {火除|ひよ}け{道|みち} は {草|くさ} だらけ だ 。 || I heard you from outside. Whether there was a fire or not, I couldn't say. But if fire broke out up there now, nothing would stop it. The firebreaks are all weeds.
!gesture co_tokiwa glasses
co_tokiwa[think]: …… || …
!look pc co_tokiwa
co_tokiwa: {確|たし}か な {記録|きろく} が あれば 、 {私|わたし} は {書|か}きます 。 {窯|かま} の {記録|きろく} です 。 {窯焚|かまだ}き の {日誌|にっし} は 、 {大窯|おおがま} の {中|なか} に しまう {決|き}まり でした 。 || If there is a certain record, I will write it. The kiln's record. By custom, the firing log was kept inside the great kiln itself.
co_tokiwa: ですが 、 {大窯|おおがま} は {上|うえ} の {段|だん} の {更|さら}に {上|うえ} 。 {古|ふる}い {工房|こうぼう} {通|どお}り の {奥|おく} で 、 {封|ふう} が して あります 。 …… {私|わたし} が {来|き}た {時|とき} から 、 ずっと 。 || But the great kiln is beyond the upper terraces, at the end of the old workshop row, and it is sealed. …It has been, for as long as I've been here.
!gesture co_tamotsu nod pc
co_tamotsu: {上|うえ} の {段|だん} へ の {柵|さく} の {鍵|かぎ} は 、 {俺|おれ} が {持|も}ってる 。 {水門|すいもん} で {待|ま}ってる 。 || I've got the key to the fence on the upper terraces. I'll wait for you at the water gate.
!set co_records_done
!quest co_main 5
!journal {窯|かま} の {日誌|にっし} は {大窯|おおがま} の {中|なか} に ある らしい 。 タモツ が {段々畑|だんだんばたけ} の {水門|すいもん} で {待|ま}って いる 。 || The kiln's firing log should be inside the great kiln. Tamotsu is waiting at the water gate at the top of the terraces.
!autosave

@scene co.tokiwa_page
# Staged: you step to Tokiwa's side and hand him the page; he reads its last line, it slips from his fingers
# and his head goes down; he faces you to ask you to laugh; your companion's own answer (Nao's hand to the
# satchel strap, Mio's shake of the head, Ren tends their lamp, Suzu's shake of the head); his nod when he
# decides to call the village (and when he is ready).
!if co_tokiwa_page -> wait
!walkto pc 6 5 right
!prop pc paper
!gesture pc handover co_tokiwa
!look co_tokiwa pc
!gesture co_tokiwa receive pc
pc: トキワ さん 。 {窯|かま} の {奥|おく} に 、 これ が ありました 。 || Tokiwa. This was at the back of the kiln.
!take co_logpage
!gesture co_tokiwa read prop=paper hold
narr: トキワ は {頁|ページ} を {受|う}け{取|と}り 、 {最後|さいご} の {行|ぎょう} を {読|よ}んだ 。 || Tokiwa takes the page and reads the last line.
co_tokiwa[surprise]: 「 {上|うえ} の {窓|まど} 、 {開|あ}く 。 {風|かぜ} {強|つよ}し 」 …… || "Upper vent open. Strong wind"…
co_tokiwa: …… {開|あ}けた の は 、 {私|わたし} です 。 || …I'm the one who opened it.
!prop co_tokiwa -
!gesture co_tokiwa lowered hold
narr: {彼|かれ} の {手|て} から 、 {頁|ページ} が {机|つくえ} に {落|お}ちた 。 || The page slips from his fingers onto the desk.
co_tokiwa[sad]: {思|おも}い{出|だ}しました 。 {全部|ぜんぶ} 。 {白|しろ}い {服|ふく} の {人|ひと} に 、 {自分|じぶん} から {頼|たの}んだ こと も 。 || I remember. All of it. Even that I asked the one in white myself.
!gesture co_tokiwa listen pc
co_tokiwa: {記録|きろく} を {守|まも}る {者|もの} が 、 {自分|じぶん} の {記録|きろく} から {逃|に}げて いた 。 どうぞ 、 {笑|わら}って ください 。 || The keeper of the record, running from his own. Please — laugh.
?(comp=nao) !gesture comp strap
?(comp=nao) comp: {笑|わら}わない よ 。 {届|とど}けなかった {手紙|てがみ} なら 、 {俺|おれ} も {鞄|かばん} に {入|い}れて {歩|ある}いてる 。 || I won't. I've got an undelivered letter in my own bag.
?(comp=mio) !gesture comp shake
?(comp=mio) comp[sad]: {笑|わら}いません 。 {痛|いた}み を ずっと {抱|かか}えて いた {人|ひと} を 、 {笑|わら}える わけ が ない です 。 || I won't. How could anyone laugh at someone who has carried that much pain?
?(comp=ren) !gesture comp tendlamp
?(comp=ren) comp: {灯守|ひもり} も 、 {時々|ときどき} {自分|じぶん} の {灯|ひ} を {見失|みうしな}います 。 {笑|わら}い は しません 。 || Lantern keepers lose sight of their own lamps sometimes. I won't laugh.
?(comp=suzu) !gesture comp shake
?(comp=suzu) comp: {笑|わら}う の は {私|わたし} の {仕事|しごと} だ けど 、 {今日|きょう} は お{休|やす}み 。 || Laughing is my job, but I'm taking today off.
!gesture co_tokiwa nod pc
co_tokiwa: …… {夕方|ゆうがた} 、 {里|さと} の {皆|みな} を {広場|ひろば} に {集|あつ}めます 。 {決|き}める の は 、 {私|わたし} {一人|ひとり} で は ない 。 || …At dusk I'll gather everyone in the square. This isn't mine alone to decide.
!set co_tokiwa_page
!quest co_main 8
!if co_suzu_done -> gather
?(comp=suzu) comp: …… その {前|まえ} に 、 {少|すこ}し だけ {時間|じかん} を ちょうだい 。 {行|い}く ところ が ある の 。 || …Before that, give me a little time. There's somewhere I need to go.
?(comp!=suzu) narr: スズ が 、 ヒロ の {工房|こうぼう} で {待|ま}って いる はず だ 。 || Suzu should be waiting at Hiro's workshop.
!journal {広場|ひろば} に {皆|みな} が {集|あつ}まる {前|まえ} に 、 スズ と ヒロ の {工房|こうぼう} へ 。 || Before the village gathers, go with Suzu to Hiro's glass workshop.
!end
:wait
!if co_suzu_done -> gather
co_tokiwa: {皆|みな} を {集|あつ}める {準備|じゅんび} を して います 。 {用|よう} が {済|す}んだら 、 {声|こえ} を かけて ください 。 || I'm getting ready to call everyone. Let me know when you're ready.
!end
:gather
!gesture co_tokiwa nod pc
co_tokiwa: …… {準備|じゅんび} は できました 。 {行|い}きましょう 。 || …I'm ready. Let's go.
!call co.assembly
`, 'ch3/hall');

RB.script.add(`
@scene co.tamotsu_gate
# Staged: Tamotsu's nod; he holds up the rusty key from his belt, looks across to the fence he never asked
# about and shades his eyes up past the water gate; his flat hand for "be careful"; when the fence opens you
# look to it, and your companion answers in their own way (Nao's nod, Mio checks her water bottle, Ren's open
# hand, Suzu's showman's hands).
!gesture co_tamotsu nod pc
co_tamotsu: {来|き}た か 。 || You came.
!gesture co_tamotsu present prop=key hold
narr: タモツ は {腰|こし} の {鍵束|かぎたば} から 、 {錆|さ}びた {鍵|かぎ} を {一本|いっぽん} {外|はず}した 。 || Tamotsu unhooks a rusty key from the ring at his belt.
!gesture co_tamotsu lookroad 20,0
co_tamotsu: この {柵|さく} は 、 {俺|おれ} が {子|こ}ども の {頃|ころ} から {閉|し}まってた 。 {理由|りゆう} を {聞|き}いた こと は ない 。 {聞|き}こう と も {思|おも}わなかった 。 || This fence has been shut since I was a boy. I never asked why. Never even thought to ask.
!gesture co_tamotsu shadeeyes up
co_tamotsu: …… {変|へん} だ よ な 。 {水|みず} の {番|ばん} を して いて 、 {水門|すいもん} の {上|うえ} に {何|なに} が ある か 、 {考|かんが}えた こと も なかった 。 || …Strange, isn't it. I keep the water, and I never once wondered what lay above the water gate.
!look co_tamotsu pc
!gesture co_tamotsu emphatic
co_tamotsu: {上|うえ} は {乾|かわ}いてる 。 {火|ひ} の {気|け} の ある もの は {持|も}って {行|い}く な 。 {気|き} を つけろ 。 || It's dry up there. Take nothing that burns. Be careful.
!set co_upper_open
!quest co_main 6
!sfx door
!gesture pc lookroad 20,0
narr: {柵|さく} が きしんで {開|ひら}いた 。 || The fence creaks open.
?(comp=nao) !gesture comp nod
?(comp=nao) comp: {出口|でぐち} が {一|ひと}つ {増|ふ}えた 。 {悪|わる}く ない 。 || One more exit. Not bad.
?(comp=mio) !gesture comp check prop=bottle
?(comp=mio) comp: {水筒|すいとう} 、 {満|まん}タン です 。 {行|い}きましょう 。 || Water flasks full. Let's go.
?(comp=ren) !gesture comp palm
?(comp=ren) comp: {上|うえ} へ 。 …… {方向|ほうこう} は 、 {私|わたし} が {言|い}う の と {逆|ぎゃく} に {行|い}けば {間違|まちが}い ありません 。 || Upward. …If you go the opposite way to whatever I suggest, you can't go wrong.
?(comp=suzu) !gesture comp size
?(comp=suzu) comp: {幕|まく} が {上|あ}がった わ 。 …… {行|い}こう 。 || Curtain's up. …Let's go.
!autosave

@scene co.upper_locked
# Staged: you lean in to the locked fence and its bleached sign; your companion's own answer (Nao looks from
# the sign to you, Mio glances away, Ren leans in to the too-even trees, Suzu shakes her head); once you know
# the key, you look across to the water gate.
!if co_records_done -> key
!gesture pc observe 20,0
narr: {上|うえ} の {段|だん} へ の {道|みち} は 、 {錠|じょう} の {下|お}りた {柵|さく} で {塞|ふさ}がれて いる 。 「 {立入|たちい}り {禁止|きんし} 」 の {札|ふだ} が 、 {日|ひ} に {焼|や}けて {白|しろ}く なって いる 。 || The way to the upper terraces is shut by a locked fence. The "No entry" sign has bleached white in the sun.
?(comp=nao) !gesture comp lookbetween 20,0 and=pc
?(comp=nao) comp: {立入|たちい}り {禁止|きんし} の {理由|りゆう} が {書|か}いて ない 。 {理由|りゆう} の ない {禁止|きんし} は 、 {大体|だいたい} {何|なに} か {隠|かく}してる 。 || No reason given for the "no entry". A ban without a reason is usually hiding something.
?(comp=mio) !gesture comp aside
?(comp=mio) comp: {鍵|かぎ} が ない と {無理|むり} です ね 。 {誰|だれ} が {持|も}って いる の かしら 。 || We can't without the key. I wonder who has it.
?(comp=ren) !gesture comp observe 20,0
?(comp=ren) comp: {柵|さく} の {向|む}こう の {木|き} 、 {全部|ぜんぶ} {同|おな}じ {背丈|せたけ} です 。 …… {気味|きみ} が {悪|わる}い ほど 。 || The trees beyond the fence are all the same height. …Unnervingly so.
?(comp=suzu) !gesture comp shake
?(comp=suzu) comp[closed]: …… {上|うえ} は 、 {今|いま} は いい わ 。 || …Not up there. Not yet.
!end
:key
!gesture pc lookroad 34,3
narr: {柵|さく} は まだ {閉|し}まって いる 。 タモツ は {水門|すいもん} の ところ に いる はず だ 。 || The fence is still locked. Tamotsu should be by the water gate.

@scene co.shortcut_locked
narr: {古|ふる}い {木戸|きど} 。 {向|む}こう {側|がわ} から {閂|かんぬき} が かかって いて 、 びくとも しない 。 || An old wooden gate, barred from the far side. It won't budge.
?(comp=nao) comp: {向|む}こう から なら {開|あ}く 。 {回|まわ}り{道|みち} して 、 {上|うえ} から {外|はず}そう 。 || It'll open from the other side. We'll go round and lift the bar from above.
?(comp=ren) comp: {内側|うちがわ} から しか {開|あ}かない {戸|と} 。 {帰|かえ}り{道|みち} を {作|つく}る {戸|と} です ね 。 || A gate that only opens from inside. The kind that makes a way home.
`, 'ch3/gate');

RB.script.add(`
@scene co.kiln_return
# Staged: back in the village, Suzu turns to you and asks for Hiro's sake (an averted look that comes back to
# you, then her head goes down); when she is not with you, Shino walks up with her message and nods it
# delivered.
!set co_kiln_return
narr: {里|さと} に {戻|もど}る と 、 {夕日|ゆうひ} が {段々畑|だんだんばたけ} を {赤|あか}く {染|そ}めて いた 。 || When you come back down, the evening sun is reddening the terraces.
?(comp=suzu) !look comp pc
?(comp=suzu) !gesture comp avert pc hold
?(comp=suzu) comp: $name 。 {頁|ページ} は トキワ さん に {渡|わた}して 。 でも 、 {広場|ひろば} で {読|よ}み{上|あ}げられる {前|まえ} に …… ヒロ に は 、 {私|わたし} から {言|い}いたい 。 || $name. Give the page to Tokiwa. But before it's read out in the square… I want Hiro to hear it from me.
?(comp=suzu) !gesture comp lowered hold
?(comp=suzu) comp: {母親|ははおや} の {死|し} を 、 {記録|きろく} の {読|よ}み{上|あ}げ で {知|し}る なんて 。 {誰|だれ} に も そんな {思|おも}い は させたく ない 。 || Learning of your mother's death from a public reading. Nobody should have to go through that.
?(comp!=suzu) co_shino: あ 、 いた ！ {旅芸人|たびげいにん} の スズ さん から {伝言|でんごん} です 。 「 ヒロ の {工房|こうぼう} で {待|ま}ってる 。 {来|く}れば {分|わ}かる 」 って 。 || There you are! A message from Suzu, the performer: "I'm waiting at Hiro's workshop. You'll know why when you come."
?(comp!=suzu) !gesture co_shino nod pc
?(comp!=suzu) co_shino: {伝言|でんごん} は {確|たし}か に {届|とど}けました よ 。 {配達料|はいたつりょう} は {取|と}りません 。 || Message delivered. No charge.
!quest co_main 7
!quest co_suzu 3
!journal {窯|かま} の {頁|ページ} を トキワ に {届|とど}けよう 。 {皆|みな} が {集|あつ}まる {前|まえ} に 、 スズ と ヒロ の {工房|こうぼう} へ 。 || Take the kiln page to Tokiwa. Before the village gathers, go with Suzu to Hiro's workshop.
`, 'ch3/return');

RB.script.add(`
@scene co.tokiwa_after
co_tokiwa: {年代記|ねんだいき} の {今年|ことし} の {頁|ページ} に は 、 「 {本年|ほんねん} 」 と {書|か}きました 。 {今|いま} 、 ここ で {書|か}いて いる {記録|きろく} です から 。 || On this year's page I wrote "this year". Because it's a record written here and now.
co_tokiwa: {記録係|きろくがかり} の {仕事|しごと} は 、 {正|ただ}しい {字|じ} を {守|まも}る こと だ と {思|おも}って いました 。 {違|ちが}いました 。 {書|か}いて ある こと と 、 {書|か}いて ない こと の {両方|りょうほう} に 、 {責任|せきにん} を {持|も}つ こと でした 。 || I used to think a recorder's job was to guard correct writing. I was wrong. It's to answer for both what is written and what isn't.
?(co_bell_rung) co_tokiwa: …… {鐘|かね} を {外|はず}せ と {言|い}った こと 、 ゴロウ さん に {謝|あやま}りました 。 {笑|わら}われました よ 。 {腕|うで} の {方|ほう} が {頭|あたま} より {賢|かしこ}い 、 と 。 || …I apologised to Gorō for telling him to take the rope down. He laughed at me. Said arms are wiser than heads.

@scene co.tokiwa_post
# Staged: Tokiwa reads a letter from the other villages' recorders; then, for what became of the Archive and
# the memories, his nod for the copy deposited, his glasses over the closed archive, his head down under the
# grief come back, a nod for fetching his own, a flat hand for his protest to the keeper, a nod for the yearly
# copy.
!gesture co_tokiwa read prop=letter
co_tokiwa: {他|ほか} の {里|さと} の {記録係|きろくがかり} と 、 {手紙|てがみ} の やり{取|と}り を {始|はじ}めました 。 {皆|みな} 、 {何|なに} か を {書|か}き{落|お}として いた 。 {一緒|いっしょ} に {探|さが}して います 。 || I've begun corresponding with recorders in other villages. They'd all left something out. We're searching together.
?(end_archive_library) !gesture co_tokiwa nod pc
?(end_archive_library) co_tokiwa: {山|やま} の {書庫|しょこ} は 、 {誰|だれ} でも {読|よ}める {場所|ばしょ} に なった そう です ね 。 {灰実|はいみ} の {年代記|ねんだいき} の {写|うつ}し を 、 {一冊|いっさつ} {納|おさ}めました 。 {火事|かじ} の {頁|ページ} も 、 {私|わたし} の {字|じ} の まま で 。 || I hear the mountain archive is now a place anyone can read. I've deposited a copy of Haimi's chronicle — the fire page too, in my own hand.
?(end_archive_closed) !gesture co_tokiwa glasses
?(end_archive_closed) co_tokiwa: {書庫|しょこ} は {閉|と}じられた 。 {記録|きろく} は 、 {記録|きろく} を {必要|ひつよう} と する {人|ひと} の {手元|てもと} に {残|のこ}る 。 {私|わたし} は 、 それ で よい と {思|おも}います 。 {預|あず}ける の は 、 もう {懲|こ}り{懲|ご}り です 。 || The archive was closed. Records stay in the hands of the people who need them. I think that's right. I've had my fill of handing things over for safekeeping.
?(end_mem_return) !gesture co_tokiwa lowered
?(end_mem_return) co_tokiwa: {預|あず}けた {悲|かな}しみ が 、 {皆|みな} に {返|かえ}って きました 。 {私|わたし} の {分|ぶん} も 。 …… {重|おも}い です 。 でも 、 {持|も}てない {重|おも}さ で は ない 。 || The grief we handed over came back to all of us. Mine too. …It's heavy. But not too heavy to carry.
?(end_mem_choose) !gesture co_tokiwa nod pc
?(end_mem_choose) co_tokiwa: {自分|じぶん} で {選|えら}んで {取|と}り{戻|もど}しに {行|い}きました 。 {頼|たの}んだ の は {私|わたし} です から 、 {迎|むか}え に {行|い}く の も {私|わたし} で あるべき だ と 。 || I chose to go and take mine back. I was the one who asked; it seemed only right that I should be the one to fetch it.
?(end_kasane_trial) !gesture co_tokiwa emphatic
?(end_kasane_trial) co_tokiwa: {灯落|ひおち} で 、 {番人|ばんにん} と {話|はな}しました 。 {冬|ふゆ} に {来|き}た 、 {白|しろ}い {服|ふく} の {人|ひと} でした 。 {私|わたし} は {礼|れい} を {言|い}い 、 それ から {抗議|こうぎ} しました 。 {順番|じゅんばん} は 、 それ で {正|ただ}しかった と {思|おも}います 。 || I spoke with the keeper in Lanternfall — the one in white who came that winter. I thanked them, and then I protested. I believe that was the right order.
?(end_kasane_keeper) !gesture co_tokiwa nod pc
?(end_kasane_keeper) co_tokiwa: {番人|ばんにん} は {山|やま} に {残|のこ}り 、 {書庫|しょこ} を {守|まも}って いる 。 {年|とし} に {一度|いちど} 、 {記録|きろく} の {写|うつ}し を {送|おく}る {約束|やくそく} を しました 。 {見張|みは}り {役|やく} の {一人|ひとり} と して 。 || The keeper stayed on the mountain to mind the archive. I've promised to send them a copy of our records once a year — as one of those who keep watch.
`, 'ch3/hall-after');
