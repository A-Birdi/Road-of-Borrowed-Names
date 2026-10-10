/* Manybridge, Chapter 3: the side content's scenes (expansion P08). The bridges' plaques and the Bridge-Name Census
 * (quest mb_census; Sen keeps the register), the Rival Noodle Stalls (mb_noodle), Boatman's Riddles (Kansuke; a
 * pastime), the Lost Contract (mb_lc), and the inn's furniture. The language is in 15_side.js. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
# The bridges' plaques: blank until the census reads each name back; once named, a plaque reads (the names and
# their clues are in 15_side.js, C.mbBridges)
@scene mb.plaque_minato
?(mb_pl_minato) narr: {橋|はし} の {札|ふだ} に 、 「{港橋|みなとばし}」 と {彫|ほ}って ある 。 || The plaque reads: "Harbour Bridge."
?(mb_pl_minato) !end
narr: {橋|はし} の {札|ふだ} は {真|ま}っ{白|しろ} だ 。 {木目|もくめ} だけ が {見|み}える 。 || The bridge's plaque is blank. Only the grain of the wood shows.
?(comp=ren&!mb_ren_mark) !call mb.ren_mark
?(!quest.mb_census) !end
narr: {名前|なまえ} の {手|て}がかり が ある 。 || There is something here that tells you its name.
!challenge mb.census_minato
!set mb_pl_minato
!var mb_census + 1
narr: {名前|なまえ} を {帳面|ちょうめん} に {書|か}き{留|と}めた 。 セン に {伝|つた}えれば 、 {札|ふだ} は {彫|ほ}り{直|なお}される 。 || You note the name down. Once Sen has it, the plaque will be cut again.
!refresh
?(var.mb_census>=7) !quest mb_census 1

@scene mb.plaque_fuda
?(mb_pl_fuda) narr: {橋|はし} の {札|ふだ} に 、 「{札橋|ふだばし}」 と {彫|ほ}って ある 。 || The plaque reads: "Tally Bridge."
?(mb_pl_fuda) !end
narr: {橋|はし} の {札|ふだ} は {真|ま}っ{白|しろ} だ 。 {木目|もくめ} だけ が {見|み}える 。 || The bridge's plaque is blank. Only the grain of the wood shows.
?(!quest.mb_census) !end
narr: {名前|なまえ} の {手|て}がかり が ある 。 || There is something here that tells you its name.
!challenge mb.census_fuda
!set mb_pl_fuda
!var mb_census + 1
narr: {名前|なまえ} を {帳面|ちょうめん} に {書|か}き{留|と}めた 。 セン に {伝|つた}えれば 、 {札|ふだ} は {彫|ほ}り{直|なお}される 。 || You note the name down. Once Sen has it, the plaque will be cut again.
!refresh
?(var.mb_census>=7) !quest mb_census 1

@scene mb.plaque_naka
?(mb_pl_naka) narr: {橋|はし} の {札|ふだ} に 、 「{中橋|なかばし}」 と {彫|ほ}って ある 。 || The plaque reads: "Middle Bridge."
?(mb_pl_naka) !end
narr: {橋|はし} の {札|ふだ} は {真|ま}っ{白|しろ} だ 。 {木目|もくめ} だけ が {見|み}える 。 || The bridge's plaque is blank. Only the grain of the wood shows.
?(!quest.mb_census) !end
narr: {名前|なまえ} の {手|て}がかり が ある 。 || There is something here that tells you its name.
!challenge mb.census_naka
!set mb_pl_naka
!var mb_census + 1
narr: {名前|なまえ} を {帳面|ちょうめん} に {書|か}き{留|と}めた 。 セン に {伝|つた}えれば 、 {札|ふだ} は {彫|ほ}り{直|なお}される 。 || You note the name down. Once Sen has it, the plaque will be cut again.
!refresh
?(var.mb_census>=7) !quest mb_census 1

@scene mb.plaque_kura
?(mb_pl_kura) narr: {橋|はし} の {札|ふだ} に 、 「{蔵橋|くらばし}」 と {彫|ほ}って ある 。 || The plaque reads: "Storehouse Bridge."
?(mb_pl_kura) !end
narr: {橋|はし} の {札|ふだ} は {真|ま}っ{白|しろ} だ 。 {木目|もくめ} だけ が {見|み}える 。 || The bridge's plaque is blank. Only the grain of the wood shows.
?(!quest.mb_census) !end
narr: {名前|なまえ} の {手|て}がかり が ある 。 || There is something here that tells you its name.
!challenge mb.census_kura
!set mb_pl_kura
!var mb_census + 1
narr: {名前|なまえ} を {帳面|ちょうめん} に {書|か}き{留|と}めた 。 セン に {伝|つた}えれば 、 {札|ふだ} は {彫|ほ}り{直|なお}される 。 || You note the name down. Once Sen has it, the plaque will be cut again.
!refresh
?(var.mb_census>=7) !quest mb_census 1

@scene mb.plaque_fuji
?(mb_pl_fuji) narr: {橋|はし} の {札|ふだ} に 、 「{藤橋|ふじばし}」 と {彫|ほ}って ある 。 || The plaque reads: "Wisteria Bridge."
?(mb_pl_fuji) !end
narr: {橋|はし} の {札|ふだ} は {真|ま}っ{白|しろ} だ 。 {木目|もくめ} だけ が {見|み}える 。 || The bridge's plaque is blank. Only the grain of the wood shows.
?(!quest.mb_census) !end
narr: {名前|なまえ} の {手|て}がかり が ある 。 || There is something here that tells you its name.
!challenge mb.census_fuji
!set mb_pl_fuji
!var mb_census + 1
narr: {名前|なまえ} を {帳面|ちょうめん} に {書|か}き{留|と}めた 。 セン に {伝|つた}えれば 、 {札|ふだ} は {彫|ほ}り{直|なお}される 。 || You note the name down. Once Sen has it, the plaque will be cut again.
!refresh
?(var.mb_census>=7) !quest mb_census 1

@scene mb.plaque_nishi
?(mb_pl_nishi) narr: {橋|はし} の {札|ふだ} に 、 「{西橋|にしばし}」 と {彫|ほ}って ある 。 || The plaque reads: "West Bridge."
?(mb_pl_nishi) !end
narr: {橋|はし} の {札|ふだ} は {真|ま}っ{白|しろ} だ 。 {木目|もくめ} だけ が {見|み}える 。 || The bridge's plaque is blank. Only the grain of the wood shows.
?(!quest.mb_census) !end
narr: {名前|なまえ} の {手|て}がかり が ある 。 || There is something here that tells you its name.
!challenge mb.census_nishi
!set mb_pl_nishi
!var mb_census + 1
narr: {名前|なまえ} を {帳面|ちょうめん} に {書|か}き{留|と}めた 。 セン に {伝|つた}えれば 、 {札|ふだ} は {彫|ほ}り{直|なお}される 。 || You note the name down. Once Sen has it, the plaque will be cut again.
!refresh
?(var.mb_census>=7) !quest mb_census 1

@scene mb.plaque_higashi
?(mb_pl_higashi) narr: {橋|はし} の {札|ふだ} に 、 「{東橋|ひがしばし}」 と {彫|ほ}って ある 。 || The plaque reads: "East Bridge."
?(mb_pl_higashi) !end
narr: {橋|はし} の {札|ふだ} は {真|ま}っ{白|しろ} だ 。 {木目|もくめ} だけ が {見|み}える 。 || The bridge's plaque is blank. Only the grain of the wood shows.
?(!quest.mb_census) !end
narr: {名前|なまえ} の {手|て}がかり が ある 。 || There is something here that tells you its name.
!challenge mb.census_higashi
!set mb_pl_higashi
!var mb_census + 1
narr: {名前|なまえ} を {帳面|ちょうめん} に {書|か}き{留|と}めた 。 セン に {伝|つた}えれば 、 {札|ふだ} は {彫|ほ}り{直|なお}される 。 || You note the name down. Once Sen has it, the plaque will be cut again.
!refresh
?(var.mb_census>=7) !quest mb_census 1
`, 'mb/22_scenes_side.js');


RB.script.add(`
@scene mb.ren_mark
# The seed (14_COMPANIONS): the plaques were cut by a lantern guild whose mark Ren knows.
!gesture comp observe 25,6
comp[surprise]: …… {札|ふだ} の {裏|うら} に 、 {印|しるし} が あります 。 {灯|ひ} の {紋|もん} 。 {灯守|ひもり} の {記録|きろく} で {見|み}た こと が ある {組|くみ} の {印|しるし} です 。 || …There's a mark on the back of the plaque. A lantern crest. A guild mark I've seen in the keepers' registers.
pc: {灯守|ひもり} の ？ || The keepers'?
comp[think]: {灯籠|とうろう} の {笠|かさ} の {名札|なふだ} を {彫|ほ}る {人|ひと} たち が 、 {橋|はし} の {札|ふだ} も {彫|ほ}って いた の かも しれません 。 …… {覚|おぼ}えて おきます 。 || Perhaps the people who carve the name slips on lantern shades carved the bridges' plaques too. …I'll remember it.
!set mb_ren_mark

@scene mb.census_start
mb_sen: {一番|いちばん} の {橋|はし} を {待|ま}つ {間|あいだ} 、 {一|ひと}つ {頼|たの}んで も いい です か 。 || While we wait on the first bridge, may I ask you something?
mb_sen: {白|しろ}く なった {札|ふだ} の {名前|なまえ} を 、 {集|あつ}めて ほしい ん です 。 {近|ちか}く の {人|ひと} が {覚|おぼ}えて いたり 、 {古|ふる}い {札|ふだ} に {書|か}いて あったり します 。 {名前|なまえ} が {分|わ}かれば 、 {帳面|ちょうめん} に {書|か}き{戻|もど}して 、 {札|ふだ} を {彫|ほ}り{直|なお}せます 。 || Collect the names of the plaques that have gone blank. People nearby may remember them, or an old notice may have them. Once I have a name, I write it back into the register and the plaque can be cut again.
mb_sen: {渡|わた}し{場|ば} 、 この {辺|あた}り 、 {蔵|くら} の {並|なら}び 。 {七|なな}つ です 。 || The pier, around here, and Warehouse Row. Seven of them.
!quest mb_census start
!journal セン の {頼|たの}み ： {白|しろ}い {橋|はし} の {札|ふだ} の {名前|なまえ} を {七|なな}つ {集|あつ}める 。 || Sen's request: collect the names of seven blank plaques.

@scene mb.census_done
mb_sen: {七|なな}つ とも ！ …… {帳面|ちょうめん} に {全部|ぜんぶ} {書|か}き{戻|もど}しました 。 {彫|ほ}り{師|し} に {回|まわ}します 。 || All seven! …I've written them all back into the register. I'll send them to the carvers.
mb_sen: これ 、 お{礼|れい} です 。 {刷|す}り{上|あ}がった ばかり の {橋|はし} の {図|ず} 。 {版木|はんぎ} の {町|まち} 、 {刷|す}り{物|もの} の {通|とお}り で {作|つく}って いる ん です よ 。 || Here, a thank-you: a bridge map, fresh off the press. They make them on Blockprint Row, the woodblock quarter.
!quest mb_census done
!journal {七|なな}つ の {橋|はし} の {名前|なまえ} を セン に {届|とど}けた 。 || Took the names of seven bridges to Sen.

@scene mb.masa
!faceplayer
?(quest.mb_noodle=done) mb_masa: {赤|あか}い のれん の まさ{屋|や} 、 {今日|きょう} も {満員|まんいん} ！ {一杯|いっぱい} どう ？ {代|だい} は いらない よ 。 || Masaya of the red curtain, full again today! A bowl? It's on the house.
?(quest.mb_noodle=done) !heal
?(quest.mb_noodle=done) !end
mb_masa: {聞|き}いて よ 。 {隣|となり} の ます{屋|や} と {看板|かんばん} が {一字|いちじ} しか {違|ちが}わない から 、 お{客|きゃく} が {間違|まちが}えて {向|む}こう に {行|い}く の 。 {名前|なまえ} が {消|き}えて から 、 {余計|よけい} に ね 。 || Listen. Our sign and Masuya's next door differ by one letter, so customers go to theirs by mistake. Worse since the names started fading.
!quest mb_noodle start
?(!mb_noodle_masa) mb_masa: {張|は}り{紙|がみ} を {書|か}いて くれない ？ うち の のれん は {赤|あか} 。 {橋|はし} の そば 。 || Would you write us a notice? Our curtain's red. By the bridge.
?(!mb_noodle_masa) !challenge mb.noodle_masa
?(!mb_noodle_masa) !set mb_noodle_masa
?(!mb_noodle_masu) mb_masa: …… ます{屋|や} に も {書|か}いて あげて 。 {向|む}こう が {迷|まよ}う と 、 うち の お{客|きゃく} も {迷|まよ}う から 。 || …Write one for Masuya too. If their customers get lost, so do ours.
?(mb_noodle_masa&mb_noodle_masu) !call mb.noodle_done

@scene mb.masu
!faceplayer
?(quest.mb_noodle=done) mb_masu: {青|あお}い のれん の ます{屋|や} 、 {本日|ほんじつ} も {営業|えいぎょう} {中|ちゅう} ！ {一杯|いっぱい} 、 {食|た}べて いって 。 || Masuya of the blue curtain, open as ever! Have a bowl.
?(quest.mb_noodle=done) !heal
?(quest.mb_noodle=done) !end
mb_masu: まさ{屋|や} の お{客|きゃく} が うち に {来|き}て 、 {怒|おこ}って {帰|かえ}る の 。 「{味|あじ} が {違|ちが}う 」 って 。 {違|ちが}う の は {当|あ}たり{前|まえ} よ ！ || Masaya's customers come to us and leave in a huff: "It doesn't taste right." Of course it doesn't!
!quest mb_noodle start
?(!mb_noodle_masu) mb_masu: うち の のれん は {青|あお} 。 {井戸|いど} の {前|まえ} 。 {分|わ}かる よう に {書|か}いて くれる ？ || Our curtain is blue, in front of the well. Can you write it so people can tell?
?(!mb_noodle_masu) !challenge mb.noodle_masu
?(!mb_noodle_masu) !set mb_noodle_masu
?(mb_noodle_masa&mb_noodle_masu) !call mb.noodle_done

@scene mb.noodle_done
narr: {二|ふた}つ の {屋台|やたい} に 、 {新|あたら}しい {張|は}り{紙|がみ} が {出|で}た 。 {赤|あか} と {青|あお} 。 {客|きゃく} は もう {迷|まよ}わない 。 || New notices go up on both stalls, red and blue. Nobody is confused any more.
mb_masa: …… ねえ 、 ます{屋|や} 。 {今度|こんど} の お{祭|まつ}り 、 {屋台|やたい} {並|なら}べて {出|だ}さない ？ || …Hey, Masuya. At the next festival, shall we set our stalls side by side?
mb_masu: {赤|あか} と {青|あお} で ？ …… {悪|わる}く ない わ ね 。 || Red and blue? …Not a bad idea.
?(comp=nao) comp[smirk]: {商売敵|しょうばいがたき} が {組|く}む と 、 {強|つよ}い ぞ 。 || Rivals who team up are hard to beat.
?(comp=mio) comp[smile]: よかった 。 どっち の お{蕎麦|そば} も 、 {食|た}べて みたい な 。 || I'm glad. I'd like to try both.
?(comp=ren) comp: {名前|なまえ} が {似|に}て いて も 、 {目印|めじるし} が あれば {迷|まよ}いません 。 {灯籠|とうろう} と {同|おな}じ です 。 || Names may be alike, but with a landmark nobody gets lost. Like lanterns.
?(comp=suzu) comp[laugh]: {赤|あか} と {青|あお} の {二枚看板|にまいかんばん} 。 お{祭|まつ}り の {目玉|めだま} に なる わ よ 。 || Red and blue, a double bill. They'll be the talk of the festival.
!quest mb_noodle done
!journal まさ{屋|や} と ます{屋|や} に {張|は}り{紙|がみ} を {書|か}いた 。 || Wrote notices for Masaya and Masuya.

@scene mb.stall_masa
narr: まさ{屋|や} の {屋台|やたい} 。 {赤|あか}い のれん 。 {出汁|だし} の {匂|にお}い が する 。 || Masaya's stall: a red curtain, and the smell of broth.
?(quest.mb_noodle=done) narr: {張|は}り{紙|がみ} ： 「{赤|あか}い のれん が {目印|めじるし} です 。」 || The notice: "Look for the red curtain."

@scene mb.stall_masu
narr: ます{屋|や} の {屋台|やたい} 。 {青|あお}い のれん 。 {湯気|ゆげ} が {上|あ}がって いる 。 || Masuya's stall: a blue curtain, steam rising.
?(quest.mb_noodle=done) narr: {張|は}り{紙|がみ} ： 「{青|あお}い のれん が {目印|めじるし} です 。」 || The notice: "Look for the blue curtain."

@scene mb.kansuke
!faceplayer
!set mb_riddles_met
?(!mb_kansuke_met) mb_kansuke: {道|みち} を {聞|き}きたい の かい 。 {儂|わし} は なぞなぞ で しか {答|こた}えん よ 。 {解|と}けたら 、 {次|つぎ} の を {出|だ}そう 。 || Want directions? I only answer in riddles. Solve one and I'll tell you the next.
?(!mb_kansuke_met) !set mb_kansuke_met
?(var.mb_riddles>=6&!mb1_done) mb_kansuke: {儂|わし} の なぞなぞ は 、 もう {全部|ぜんぶ} {解|と}かれて しもうた 。 …… {次|つぎ} に {来|く}る まで に 、 {新|あたら}しい の を {考|かんが}えて おこう 。 || You've solved every riddle I have. …By the time you come again, I'll have thought up new ones.
?(var.mb_riddles>=6&!mb1_done) !end
?(var.mb_riddles>=10) mb_kansuke: {新|あたら}しい の も 、 {全部|ぜんぶ} {解|と}かれて しもうた 。 …… まいった 。 {儂|わし} の {負|ま}け じゃ 。 || You've solved the new ones too. …I give up. You win.
?(var.mb_riddles>=10) !end
?(var.mb_riddles=6&!mb_riddles_new) mb_kansuke: {約束|やくそく} どおり 、 {新|あたら}しい の を {考|かんが}えて おいた ぞ 。 {版木|はんぎ} と {芝居|しばい} の {通|とお}り の {話|はなし} から {作|つく}った 。 || As promised, I've thought up new ones. Made them from Blockprint and Playhouse Rows.
?(var.mb_riddles=6) !set mb_riddles_new
!choice
* なぞなぞ を {聞|き}く 。 || Hear a riddle. -> riddle
* また {今度|こんど} 。 || Another time. -> end
:riddle
?(var.mb_riddles=0) !challenge mb.riddle_1
?(var.mb_riddles=1) !challenge mb.riddle_2
?(var.mb_riddles=2) !challenge mb.riddle_3
?(var.mb_riddles=3) !challenge mb.riddle_4
?(var.mb_riddles=4) !challenge mb.riddle_5
?(var.mb_riddles=5) !challenge mb.riddle_6
?(var.mb_riddles=6) !challenge mb.riddle_7
?(var.mb_riddles=7) !challenge mb.riddle_8
?(var.mb_riddles=8) !challenge mb.riddle_9
?(var.mb_riddles=9) !challenge mb.riddle_10
?(var.mb_riddles=0) !set mb_ev_riddle
?(var.mb_riddles=0) mb_kansuke: むすび 、 じゃ 。 …… {一番|いちばん} {古|ふる}い {橋|はし} も 、 {昔|むかし} は そう {呼|よ}ばれて おった のう 。 || Musubi, a tie. …The oldest bridge was called something like that, once.
!var mb_riddles + 1
mb_kansuke: {当|あ}たり 。 {次|つぎ} の は 、 また {今度|こんど} {来|き}た とき に な 。 || Right. The next one, when you come again.
:end

@scene mb.zenzo
!faceplayer
?(quest.mb_lc=done) mb_zenzo: {藤屋|ふじや} の {女将|おかみ} と 、 {祖父|そふ} の {約定|やくじょう} を {読|よ}み{直|なお}した 。 {六十年|ろくじゅうねん} ぶり に 、 {両家|りょうけ} で {茶|ちゃ} を {飲|の}んだ よ 。 || Fujiya's mistress and I read my grandfather's agreement over again. Our two houses had tea together for the first time in sixty years.
?(quest.mb_lc=done) !end
?(quest.mb_lc>=1) !goto open
mb_zenzo: {祖父|そふ} が {藤屋|ふじや} と {交|か}わした {約定書|やくじょうしょ} が 、 どこ か の {蔵|くら} に ある はず なん じゃ 。 {古|ふる}い {運河|うんが} の {図|ず} に 、 {場所|ばしょ} が {書|か}いて ある 。 || The agreement my grandfather made with Fujiya should be in one of these storehouses. The old canal plan says where.
!quest mb_lc start
!challenge mb.lc_plan
pc: {東橋|ひがしばし} から {三|みっ}つ{目|め} の {蔵|くら} 。 {戸|と} は {運河|うんが} の {方|ほう} …… でも 、 {今|いま} は {壁|かべ} です 。 || The third storehouse from the East Bridge, its door on the canal side… but there's a wall there now.
mb_zenzo: {塗|ぬ}り{込|こ}めた の か ！ …… {儂|わし} の {腕|うで} じゃ 、 {壁|かべ} は {崩|くず}せん 。 || Walled up! …These arms of mine can't break through a wall.
!quest mb_lc 1
!journal {東橋|ひがしばし} から {三|みっ}つ{目|め} の {蔵|くら} の {戸|と} は 、 {塗|ぬ}り{込|こ}められて いる 。 {荷運|にはこ}び の {力|ちから} が {要|い}る 。 || The door of the third storehouse from the East Bridge has been walled up. It will take a porter's strength.
!end
:open
mb_zenzo: {壁|かべ} を {崩|くず}せる {者|もの} は おらん か のう 。 {荷運|にはこ}び なら 、 {力|ちから} が ある じゃろう に 。 || Is there no one who can knock that wall through? A porter would have the strength.

@scene mb.lc_wall
!gesture pc observe
narr: {新|あたら}しい しっくい で {塗|ぬ}られた {壁|かべ} 。 {昔|むかし} は {戸|と} だった {形|かたち} が 、 うっすら {見|み}える 。 || A wall of newer plaster. The shape of the door it once was shows faintly through.
?(!quest.mb_lc) !end
?(!mb_dispute_done) narr: {一人|ひとり} の {力|ちから} では 、 {崩|くず}せ そう に ない 。 || One person's strength won't break this.
?(!mb_dispute_done) !end
narr: {荷運|にはこ}び{屋|や} から ゴンタ が {来|き}て 、 {腕|うで}まくり を した 。 || Gonta comes over from the porters' office and rolls up his sleeves.
mb_gonta: {壁|かべ} {一枚|いちまい} か 。 {浮|う}き{玉|だま} の {箱|はこ} より は 、 {軽|かる}い もん だ 。 || One wall? Lighter than a crate of floats.
!shake 2
narr: しっくい が {崩|くず}れて 、 {古|ふる}い {戸|と} が {現|あらわ}れた 。 || The plaster crumbles away, and an old door appears.
!set mb_lc_opened
!refresh

@scene mb.lc_inside
?(quest.mb_lc>=2) narr: {空|から} の {蔵|くら} 。 {箱|はこ} は もう ない 。 || The empty storehouse. The box is gone.
?(quest.mb_lc>=2) !end
narr: {暗|くら}い {蔵|くら} の {奥|おく} に 、 {油紙|あぶらがみ} で {包|つつ}んだ {箱|はこ} が {一|ひと}つ 。 {中|なか} に 、 {古|ふる}い {約定書|やくじょうしょ} が {入|はい}って いた 。 || At the back of the dark storehouse, a box wrapped in oiled paper. Inside, the old agreement.
!give mb_contract
!quest mb_lc 2
?(comp=nao) comp: {六十年|ろくじゅうねん} も {届|とど}かなかった {書類|しょるい} か 。 …… {配達|はいたつ} し がい が ある な 。 || A document sixty years undelivered. …Worth carrying.
?(comp=mio) comp: {紙|かみ} が {湿|しめ}って いない 。 {大事|だいじ} に しまって あった ん だ ね 。 || The paper isn't damp. Someone stored it with care.
?(comp=ren) comp: {塗|ぬ}り{込|こ}めた の は 、 {隠|かく}す ため では なく 、 {守|まも}る ため だった の かも しれません 。 || Perhaps it was walled up not to hide it, but to keep it safe.
?(comp=suzu) comp[smile]: {六十年|ろくじゅうねん} の {幕間|まくあい} ね 。 {次|つぎ} の {幕|まく} 、 {始|はじ}めましょう 。 || A sixty-year interval. Let's start the next act.

@scene mb.zenzo_contract
mb_zenzo: これ じゃ ！ {祖父|そふ} の {字|じ} じゃ 。 …… 「{両家|りょうけ} 、 {互|たが}い の {名|な} に かけて 、 {荷|に} を {守|まも}る べし 」 。 || This is it! My grandfather's hand. …"The two houses shall guard each other's cargo, on their names."
mb_zenzo: {藤屋|ふじや} の {女将|おかみ} に 、 {見|み}せに {行|い}こう 。 ありがとう よ 。 || I'll take it to Fujiya's mistress. Thank you.
!take mb_contract
!quest mb_lc done
!journal ゼンゾウ に {約定書|やくじょうしょ} を {届|とど}けた 。 || Took the agreement to Zenzō.

@scene mb.sign_heiji_w
narr: 「ヘイジ {米穀店|べいこくてん} 、 {西|にし} の {蔵|くら} 」 || "Heiji's Rice — west storehouse"

@scene mb.sign_heiji_e
narr: 「ヘイジ {米穀店|べいこくてん} 、 {東|ひがし} の {蔵|くら} 」 || "Heiji's Rice — east storehouse"

@scene mb.door_heiji_w
narr: ヘイジ の {西|にし} の {蔵|くら} 。 {重|おも}い {戸|と} に {錠|じょう} が かかって いる 。 || Heiji's west storehouse. A lock hangs on the heavy door.

@scene mb.door_heiji_e
narr: ヘイジ の {東|ひがし} の {蔵|くら} 。 {錠|じょう} が かかって いる 。 {戸|と} の {隙間|すきま} から 、 {米|こめ} の {匂|にお}い が する 。 || Heiji's east storehouse. Locked. Through the gap in the door comes the smell of rice.

@scene mb.inn_table
narr: {川|かわ} の {見|み}える {窓際|まどぎわ} の {席|せき} 。 {運河|うんが} を {行|い}く {舟|ふね} の {櫓|ろ} の {音|おと} が する 。 || A table by the window over the river. The creak of oars from barges going by.

@scene mb.inn_stairs
narr: {二階|にかい} の {客間|きゃくま} へ の {階段|かいだん} 。 || The stairs up to the guest rooms.

@scene mb.offers
# The Exchange's offers (R1, A46/A48): one of the day's tallies checked before it goes up (15_side.js, mb.offers)
?(mb_offers_done) narr: {今日|きょう} の {札|ふだ} の {束|たば} 。 セン が {条件|じょうけん} を {確|たし}かめた {印|しるし} が {付|つ}いて いる 。 || Today's bundle of tallies, each marked where Sen checked its conditions.
?(mb_offers_done) !end
?(!mb_dispute_done) narr: {札|ふだ} の {束|たば} 。 {揉|も}め{事|ごと} の {間|あいだ} は 、 {誰|だれ} も {見|み}て いない 。 || A bundle of tallies. With the dispute on, nobody is looking at them.
?(!mb_dispute_done) !end
!look mb_sen pc
mb_sen: {揉|も}め{事|ごと} の {後|あと} で {悪|わる}い です が …… {今日|きょう} の {札|ふだ} を {一枚|いちまい} 、 {見|み}て もらえます か 。 {条件|じょうけん} の {中|なか} に 、 {守|まも}れない もの が {一|ひと}つ ある はず です 。 || Sorry to ask after all that… would you look at one of today's tallies? One of its conditions can't be kept.
!challenge mb.offers
?(var._res=1) mb_sen[smile]: そう 、 それ です 。 {掛|か}ける {前|まえ} に {気|き}づけて よかった 。 {揉|も}め{事|ごと} が {一|ひと}つ {減|へ}りました 。 || Yes, that one. Good to catch it before it went up. One dispute fewer.
!set mb_offers_done

@scene mb.inn_menu
narr: 「{本日|ほんじつ} の お{品書|しなが}き 。 {潮硝子|しおがらす} の {干物|ひもの} 、 {葦|あし}ノ{瀬|せ} の お{米|こめ} 。」 || "Today's menu: Saltglass dried fish; Reedwake rice."
`, 'mb/22_scenes_side.js');
