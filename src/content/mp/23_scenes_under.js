/* Manybridge, Chapter 4: the Understage (expansion P09): down through the trap, the three levels of machinery, the
 * いくつか growth after the crowded fights (C-74), the Lord of the Understage, and the names back on the stage. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
@scene mp.under_go
narr: せり が {下|お}りて いる 。 {暗|くら}い {穴|あな} から 、 {縄|なわ} の きしむ {音|おと} が {聞|き}こえる 。 || The trap lift is down. From the dark hole comes the creak of ropes.
!choice
* {下|お}りる 。 || Go down. -> go
* まだ {下|お}りない 。 || Not yet. -> end
:go
!warp mp.under1 3 3 down
:end

@scene mp.under_up
narr: {舞台|ぶたい} へ {戻|もど}る {階段|かいだん} 。 || The stairs back up to the stage.
!choice
* {上|あ}がる 。 || Go up. -> go
* まだ {上|あ}がらない 。 || Stay. -> end
:go
!warp mp.theatre 8 5 down
:end

@scene mp.under_arrive
# Staged: down the last rungs onto the boards under the stage; ropes, wheels and weights in the lantern light; the
# pencilled names drifting down past you like ash; the companion's first look.
!set mp_under_seen
narr: {舞台|ぶたい} の {下|した} 。 {縄|なわ} と {車|くるま} と {錘|おもり} が 、 {闇|やみ} の {中|なか} に どこ まで も {続|つづ}いて いる 。 || Beneath the stage. Ropes, wheels and weights run on into the dark.
narr: {上|うえ} から 、 {鉛筆|えんぴつ} の {字|じ} が {灰|はい} の よう に {舞|ま}い{落|お}ちて くる 。 {役|やく} の {名前|なまえ} だ 。 || From above, pencil letters drift down like ash: the names of the parts.
?(comp=nao) comp: {名前|なまえ} が {落|お}ちて いく {先|さき} を {追|お}えば いい 。 {宛先|あてさき} は {下|した} だ 。 || Follow where the names are falling. The address is down.
?(comp=mio) comp: {台本|だいほん} の {頁|ページ} が 、 {柱|はしら} に {貼|は}って ある 。 {昔|むかし} の {人|ひと} が 、 ここ で {読|よ}みながら {動|うご}かした の ね 。 || Prompt-book pages are pasted on the pillars. People used to work the machines here by reading them.
?(comp=ren) comp: {暗|くら}い {所|ところ} で {働|はたら}く {人|ひと} の ため の {灯|あか}り が 、 {全部|ぜんぶ} {消|き}えて います 。 …… {灯|とも}して いきましょう 。 || All the lamps for the people who work down here have gone out. …Let's light them as we go.
?(comp=suzu) comp: {奈落|ならく} …… 。 {子供|こども} の {頃|ころ} 、 ここ に {落|お}ちる {夢|ゆめ} を よく {見|み}た わ 。 {今日|きょう} は 、 {自分|じぶん} で {下|お}りて きた の ね 。 || The Understage… As a child I used to dream of falling down here. Today I came down on my own.
!journal {奈落|ならく} へ 。 {台本|だいほん} の {頁|ページ} を {読|よ}んで 、 からくり を {動|うご}かして {進|すす}む 。 || Into the Understage. Read the prompt-book's pages and work the machinery to go on.

@scene mp.book1
!gesture pc read
narr: {柱|はしら} に {貼|は}られた {台本|だいほん} の {頁|ページ} 。 せり の {動|うご}かし{方|かた} 。 || A prompt-book page pasted on a pillar: how to work the trap lifts.
!challenge mp.book1
!set mp_book1

@scene mp.lifts_go
?(mp_u1_lift) narr: せり は {上|あ}がった まま だ 。 {東|ひがし} の {戸口|とぐち} は {開|あ}いて いる 。 || The lift stays up. The doorway east is open.
?(mp_u1_lift) !end
?(!mp_book1) narr: せり の {綱|つな} と {錘|おもり} 。 {台本|だいほん} を {読|よ}まず に {動|うご}かす の は 、 {危|あぶ}ない 。 || The lifts' ropes and weights. Dangerous to work them without reading the prompt-book.
?(!mp_book1) !end
narr: せり の {綱|つな} 。 {東|ひがし} の {戸口|とぐち} を {塞|ふさ}いで いる {書|か}き{割|わ}り は 、 {左|ひだり} の せり の {上|うえ} に {立|た}って いる 。 || The lift ropes. The scenery flats blocking the doorway east are standing on the left lift.
!encounter mp.lifts
?(mp_u1_lift) !refresh

@scene mp.under_down1
!warp mp.under2 3 3 down

@scene mp.under_up2
!warp mp.under1 27 14 up

@scene mp.book2
!gesture pc read
narr: {回|まわ}り{舞台|ぶたい} の {下|した} の {柱|はしら} に 、 {台本|だいほん} の {頁|ページ} 。 || A prompt-book page on a pillar under the revolve.
!challenge mp.book2
!set mp_book2

@scene mp.revolve_go
?(mp_u2_turned) narr: {回|まわ}り{舞台|ぶたい} は 、 {回|まわ}した まま に して ある 。 || The revolve stands as you left it.
?(mp_u2_turned) !end
?(!mp_book2) narr: {大|おお}きな {轆轤|ろくろ} 。 {台本|だいほん} を {読|よ}んで から に しよう 。 || A great capstan. Better read the prompt-book first.
?(!mp_book2) !end
narr: {回|まわ}り{舞台|ぶたい} の {轆轤|ろくろ} 。 {書|か}き{割|わ}り が 、 {下|した} の {通|とお}り{道|みち} を {塞|ふさ}いで いる 。 || The revolve's capstan. Scenery flats block the way through underneath.
!encounter mp.revolve
?(mp_u2_turned) !refresh

@scene mp.under_bench
narr: {大道具|おおどうぐ} の {人|ひと} が {休|やす}む {長椅子|ながいす} 。 {少|すこ}し {休|やす}もう 。 || A bench where the stagehands rest. You rest a while.
!heal

@scene mp.under_down2
!warp mp.under3 3 3 down

@scene mp.under_up3
!warp mp.under2 28 17 up

@scene mp.ikutsuka
# C-74: after the crowded fights beneath the revolve, Unravel reaches two: the phrase 結び目を いくつか ほどく.
# Staged: a breather at the top of the weight well; the companion shakes out their hands; the phrase takes shape.
narr: {錘|おもり} の {井戸|いど} の {入|い}り{口|ぐち} で 、 {息|いき} を {整|ととの}える 。 {回|まわ}り{舞台|ぶたい} の {下|した} で は 、 {何|なん} {匹|びき} も {一度|いちど} に {来|き}た 。 || At the head of the weight well you get your breath back. Under the revolve they came several at a time.
?(comp=nao) comp[think]: {一|ひと}つ ずつ {解|ほど}いて たら 、 {日|ひ} が {暮|く}れる 。 {荷|に} の {紐|ひも} も 、 {二|ふた}つ {三|みっ}つ {一緒|いっしょ} に {解|ほど}く だろ 。 || Untie them one at a time and we'll be here till dark. You undo two or three parcel strings at once, don't you?
?(comp=mio) comp[think]: {薬草|やくそう} の {束|たば} も 、 {結|むす}び{目|め} を いくつか {一度|いちど} に {解|ほど}く の よ 。 {全部|ぜんぶ} じゃ なくて 、 {要|い}る {分|ぶん} だけ 。 || With a bundle of herbs you undo a few knots at once. Not all of them: just the ones you need.
?(comp=ren) comp[think]: {灯|あか}り を {灯|とも}す とき 、 {近|ちか}く の {二|ふた}つ を {続|つづ}けて {灯|とも}す こと が あります 。 {結|むす}び{目|め} も 、 {同|おな}じ かも しれません 。 || When I light lamps I sometimes light the two nearest one after the other. Knots might be the same.
?(comp=suzu) comp[think]: {早替|はやが}わり の {衣装|いしょう} は ね 、 {結|むす}び{目|め} を いくつか {一度|いちど} に {解|ほど}く の 。 {選|えら}んだ {所|ところ} だけ 。 || A quick-change costume, you know: you undo a few of its ties at once. Just the ones you choose.
narr: {言葉|ことば} が {一|ひと}つ 、 {形|かたち} に なった 。 「{結|むす}び{目|め} を いくつか ほどく」 。 {選|えら}んだ {二|ふた}つ の {結|むす}び{目|め} を 、 {一度|いちど} に 。 || A phrase takes shape: 結び目を いくつか ほどく, "untie some knots": two knots of your choosing, at once.
!teach mod_ikutsuka
!set mod_ikutsuka
!journal {結|むす}び{目|め} を いくつか ほどく 。 {選|えら}んだ {二|ふた}つ を 、 {一度|いちど} に 。 || Untie some knots: two of your choosing, at once.

@scene mp.book3
!gesture pc read
narr: {錘|おもり} の {井戸|いど} の {縁|ふち} に 、 {台本|だいほん} の {頁|ページ} 。 || A prompt-book page at the rim of the weight well.
!challenge mp.book3
!set mp_book3

@scene mp.weights_go
?(mp_u3_raised) narr: {台|だい} は {床|ゆか} と {同|おな}じ {高|たか}さ で {止|と}まって いる 。 || The platform is holding level with the floor.
?(mp_u3_raised) !end
?(!mp_book3) narr: {錘|おもり} の {綱|つな} 。 {重|おも}さ が {分|わ}からない まま {下|お}ろす の は 、 やめて おこう 。 || The weights' ropes. Better not drop anything without knowing how much.
?(!mp_book3) !end
narr: {錘|おもり} の {綱|つな} 。 {井戸|いど} の {底|そこ} に 、 {台|だい} が {沈|しず}んで いる 。 || The weights' ropes. Down the well, a platform lies sunk.
!encounter mp.weights
?(mp_u3_raised) !refresh

@scene mp.kuroko_1
?(mp_kuroko1) narr: {柱|はしら} の {影|かげ} 。 {誰|だれ} も いない 。 || The pillar's shadow. Nobody there.
?(mp_kuroko1) !end
!call mp.kuroko_meet
?(var._res=1) !set mp_kuroko1
?(var._res=1) !refresh

@scene mp.kuroko_2
?(mp_kuroko2) narr: {柱|はしら} の {影|かげ} 。 {誰|だれ} も いない 。 || The pillar's shadow. Nobody there.
?(mp_kuroko2) !end
!call mp.kuroko_meet
?(var._res=1) !set mp_kuroko2
?(var._res=1) !refresh

@scene mp.kuroko_meet
# the theatre's rule: a kuroko, dressed in black, is not there. Something in black stands in the pillar's shadow.
narr: {柱|はしら} の {影|かげ} に 、 {黒|くろ}い {頭巾|ずきん} の {誰|だれ} か が {立|た}って いる 。 {芝居|しばい} の {決|き}まり で は 、 {黒子|くろこ} は 「いない」 こと に なって いる 。 || In the pillar's shadow stands someone in a black hood. By the theatre's rule, a kuroko is "not there".
!note mp_kuroko
?(comp=suzu) comp[think]: {黒子|くろこ} は 、 {見|み}えて も {見|み}えない ふり を する の が {礼儀|れいぎ} よ 。 …… でも 、 ここ は {舞台|ぶたい} じゃ ない わ 。 || With a kuroko, it's good manners to pretend you can't see them. …But this isn't the stage.
?(comp!=suzu) comp[think]: {見|み}えて いる のに 、 いない こと に する の か 。 …… {声|こえ} を かけて みよう 。 || You can see it, and it counts as not there? …Say something to it.
!challenge mp.kuroko_name
?(var._res=1) narr: {黒子|くろこ} が 、 ゆっくり と {顔|かお} を {上|あ}げた 。 {名前|なまえ} を {呼|よ}ばれて 、 {初|はじ}めて そこ に いる 。 || The kuroko slowly raises its head. Named aloud, it is there at last.

@scene mp.bottom_door
?(!mp_u3_raised) narr: {井戸|いど} の {向|む}こう の {戸|と} 。 {台|だい} が {上|あ}がらない と 、 {届|とど}かない 。 || A door beyond the well. Out of reach until the platform is up.
?(!mp_u3_raised) !end
!warp mp.bottom 13 14 up

@scene mp.bottom_back
!warp mp.under3 13 16 up

@scene mp.bottom_arrive
# Staged: through the low door into the deepest pit; the names circle in the dark like moths round a lamp; at the
# centre, something of ropes and wheels in a prompter's hood turns to look at you.
!set mp_bottom_seen
!gesture pc observe 13,8
narr: {奈落|ならく} の {底|そこ} 。 {吸|す}い{込|こ}まれた {名前|なまえ} が 、 {闇|やみ} の {中|なか} で {輪|わ} を {描|えが}いて {回|まわ}って いる 。 || The bottom of the Understage. The names that were drawn down circle in the dark.
narr: {真|ま}ん{中|なか} に 、 {縄|なわ} と {車|くるま} で できた {何|なに} か が 、 {黒子|くろこ} の {頭巾|ずきん} を かぶって {立|た}って いる 。 || At the centre stands something made of ropes and wheels, wearing a kuroko's hood.
mp_naraku: …… {役者|やくしゃ} は {名前|なまえ} を {忘|わす}れて も 、 きっかけ さえ {守|まも}れば {動|うご}く 。 {名前|なまえ} は {重|おも}い 。 {重|おも}い {物|もの} は 、 {下|した} へ {落|お}ちる 。 || …Actors move well enough without their names, so long as they keep to their cues. Names are heavy. Heavy things fall.
?(comp=nao) comp[angry]: {重|おも}い から {捨|す}てる の か 。 {荷物|にもつ} を {預|あず}かる {奴|やつ} の {言|い}う こと じゃ ない ！ || Throw it away because it's heavy? That's no way for anyone holding someone's parcel to talk!
?(comp=mio) comp[angry]: {好|す}きで {覚|おぼ}えた {役|やく} の {名前|なまえ} を 、 {重|おも}い なんて {言|い}わせない ！ || I won't let you call the names of parts they learned out of love "heavy"!
?(comp=ren) comp[angry]: {名前|なまえ} は {重荷|おもに} では ありません 。 {灯|あか}り です 。 {返|かえ}して もらいます 。 || Names are not burdens. They're lights. We're taking them back.
?(comp=suzu) comp[angry]: きっかけ だけ の {芝居|しばい} なんて 、 {人形|にんぎょう} {芝居|しばい} より {冷|つめ}たい わ 。 {役者|やくしゃ} に {名前|なまえ} を {返|かえ}しなさい ！ || A play of nothing but cues is colder than a puppet show. Give the actors back their names!

@scene mp.boss_go
# Staged: you step to the lip; the Understage rears up, ropes whipping; the encounter.
mp_naraku: {最後|さいご} の {頁|ページ} を {読|よ}める か 。 {読|よ}めなければ 、 {名前|なまえ} は {永遠|えいえん} に {下|した} だ 。 || Can you read the last page? If not, the names stay down here for ever.
pc: {読|よ}む 。 {一行|いちぎょう} ずつ 。 || I'll read it. One line at a time.
!encounter mp.boss noflee
?(mp_under_done) !call mp.boss_won

@scene mp.boss_won
# Staged: the ropes go slack, the wheels still; the names spiral up through the boards; far above, a roar of voices
# (the company calling their own names); the companion's line; up into the theatre.
!set mp_under_done
!refresh
narr: {縄|なわ} が {緩|ゆる}み 、 {車|くるま} が {止|と}まった 。 {名前|なまえ} が {一|ひと}つ ずつ 、 {床|ゆか} を {抜|ぬ}けて {上|うえ} へ {昇|のぼ}って いく 。 || The ropes go slack; the wheels stop. One by one the names rise up through the boards.
narr: {遠|とお}く {上|うえ} の {舞台|ぶたい} から 、 {声|こえ} が {聞|き}こえる 。 {役者|やくしゃ} たち が 、 {自分|じぶん} の {役|やく} の {名前|なまえ} を {呼|よ}び{合|あ}って いる 。 || Far above, from the stage, voices: the actors are calling out their parts' names to each other.
?(comp=nao) comp[smile]: {全部|ぜんぶ} {届|とど}いた な 。 {一通|いっつう} も {落|お}とさず に 。 || Every one delivered. Not a single letter dropped.
?(comp=mio) comp[smile]: よかった …… 。 {怒|おこ}った かい が ありました 。 || Thank goodness… It was worth getting angry.
?(comp=ren) comp[smile]: {上|うえ} が {明|あか}るい 。 {名前|なまえ} の {灯|あか}り です 。 || It's bright up there. The light of names.
?(comp=suzu) comp[laugh]: カーテンコール よ ！ {一人|ひとり} {残|のこ}らず 、 {名前|なまえ} を {呼|よ}ばれて ！ || Curtain call! Every last one, called by name!
!warp mp.theatre 10 9 up
narr: {舞台|ぶたい} の {上|うえ} で は 、 {役者|やくしゃ} たち が {台本|だいほん} を {抱|だ}きしめて いる 。 {白|しろ}かった {所|ところ} に 、 {名前|なまえ} が {戻|もど}って いた 。 || On the stage the actors are hugging their scripts. The names are back in the white gaps.
mp_manbe: ありがとう …… ！ {明日|あした} の {川開|かわびら}き 、 {芝居|しばい} は {予定|よてい} どおり です 。 {皆|みな}さん も 、 {祭|まつ}り を {楽|たの}しんで ください ！ || Thank you…! Tomorrow's Opening, the play goes ahead as planned. And you, enjoy the festival!
!journal {奈落|ならく} の {名前|なまえ} が 、 {舞台|ぶたい} に {戻|もど}った 。 {明日|あした} は {川開|かわびら}き 。 || The names from the Understage are back on the stage. Tomorrow is the Opening of the River.
!call mp.fest_eve
`, 'mp/23_scenes_under.js');
