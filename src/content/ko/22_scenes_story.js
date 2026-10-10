/* Kotonoha, Chapter 9: the story from the tellings to the Gardener (expansion P11; R4; 10_STORY §8). The four
 * tellings and the conches; hanging the exhibition; Otoha opens the hollow; the Root Hollows, where restoring the
 * leaves' unsaid words reshapes the passages; the tide that leaves the companion on the far side (a solvable scare,
 * calm lines) and the long way round alone; the reunion; the Gardener of Unsent Words; the tree quiet again. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
@scene ko.otoha_tellings
!faceplayer
!if tell_ko.t_hall_ok -> hung
!if ko_tell_otoha -> wait
!set ko_tell_otoha
ko_otoha: わたし たち {葉守|はもり} の {話|はなし} から 。 || The keepers' telling first, then.
ko_otoha: {昔|むかし} 、 {一人|ひとり} の {女|おんな} の {人|ひと} が 、 {海|うみ} の {真|ま}ん{中|なか} の {岩|いわ} に {楠|くす} の {種|たね} を {植|う}えた 。 {届|とど}かない {言葉|ことば} が 、 {休|やす}める よう に 。 その {人|ひと} が 、 {最初|さいしょ} の {葉守|はもり} 。 || Long ago a woman planted a camphor seed on a rock in the middle of the sea, so that words that never arrive could rest. She was the first keeper.
?(prof>=A) ko_otoha: {葉守|はもり} は 、 {古今集|こきんしゅう} の {序|じょ} を {唱|とな}えて きました 。 「やまとうた は 、 {人|ひと} の {心|こころ} を {種|たね} と して 」 …… {古|ふる}い 、 {本当|ほんとう} の {歌|うた} の {本|ほん} の {言葉|ことば} です よ 。 || The keepers have always recited the Kokinshū's preface. "Japanese poetry takes the human heart as its seed…" Words from an old book of poems: a real one.
ko_otoha: ナミ は {舟|ふね} の {話|はなし} を 、 ハマジ は {漁師|りょうし} の {話|はなし} を する でしょう 。 それ から 、 {西|にし} の {浜|はま} の {法螺貝|ほらがい} 。 あれ は 、 {話|はなし} で は なく 、 {声|こえ} を {覚|おぼ}えて いる 。 || Nami will tell you the boat-keepers' telling, Hamaji the fishers'. And the conches on the west beach: they don't keep a story, they keep voices.
!end
:wait
ko_otoha: {四|よっ}つ {揃|そろ}ったら 、 {館|やかた} の {机|つくえ} で {並|なら}べて ください 。 どれ を {板|いた} に {出|だ}す か は 、 あなた が {決|き}めて いい 。 || When you have all four, set them out at the desk in the hall. Which goes on the panels is yours to choose.
?(!ko_tell_nami) ko_otoha: ナミ は 、 {館|やかた} の {前|まえ} に いる はず です 。 || Nami should be in front of the hall.
?(!ko_tell_hamaji) ko_otoha: ハマジ は 、 {網|あみ} を {直|なお}して います よ 。 || Hamaji is mending nets.
?(!ko_tell_shell) ko_otoha: {法螺貝|ほらがい} は 、 {西|にし} の {潮|しお}だまり に {三|みっ}つ 。 || The conches are at the tide pools to the west, three of them.
!end
:hung
# Staged: Otoha has been to see the panels; she speaks of the third, then looks up the path at the tree.
?(var.tell_ko.t_hall_p3=shell) ko_otoha[surprise]: 「{書|か}いた {人|ひと} だけ の {言葉|ことば} も ある 」 。 …… チトセ の {言葉|ことば} を 、 {壁|かべ} に {掛|か}けた {人|ひと} は 、 {初|はじ}めて です 。 || "Some words belong only to the one who wrote them." …No one has ever hung Chitose's words on the wall before.
?(var.tell_ko.t_hall_p3=otoha) ko_otoha[smile]: 「{一枚|いちまい} {残|のこ}らず {返|かえ}す 」 。 {欲張|よくば}り な {約束|やくそく} です ね 。 わたし の {約束|やくそく} です 。 || "Every leaf goes home." A greedy promise. It is mine.
?(var.tell_ko.t_hall_p3=nami) ko_otoha[smile]: 「どんな に {遠|とお}くて も 」 。 ナミ が {喜|よろこ}びます 。 あの {子|こ} の {腕|うで} は 、 {約束|やくそく} より {強|つよ}い 。 || "However far." Nami will be pleased. That girl's arms are stronger than any promise.
!gesture ko_otoha lookroad up
ko_otoha: …… でも 、 {木|き} は まだ {落|お}として いる 。 {今朝|けさ} 、 {葉|は} が {下|した} から {上|あ}がって くる の を {見|み}ました 。 {枝|えだ} から で は なく 、 {根|ね} から 。 || …But the tree is still shedding. This morning I saw leaves rising from below. Not from the branches: from the roots.
ko_otoha: {大楠|おおくす} の {根|ね} の {間|あいだ} に 、 {洞|ほら} が あります 。 わたし たち は 、 {入|はい}らない {所|ところ} 。 …… {開|あ}けて おきます 。 {行|い}って ください 。 || Between the great camphor's roots there is a hollow. A place we keepers don't go. …I'll open it. Go down.
?(comp=nao) comp: {根|ね} の {方|ほう} から {葉|は} が {来|く}る か 。 …… {郵便|ゆうびん} で {言|い}えば 、 {差出人|さしだしにん} の {所|ところ} で {詰|つ}まってる って こと だ な 。 || Leaves coming up from the roots. …In post terms, the jam is back where it's sent from.
?(comp=mio) comp: {根|ね} の {病|やまい} は 、 {外|そと} から は {見|み}えない もの です 。 {行|い}きましょう 。 || A sickness in the roots can't be seen from outside. Let's go.
?(comp=ren) comp: {灯籠|とうろう} も 、 {火袋|ひぶくろ} より {台|だい} が {割|わ}れて いる こと が あります 。 {下|した} を {見|み}に {行|い}きましょう 。 || A lantern's base can crack before its fire box does. Let's go and look underneath.
?(comp=suzu) comp: {奈落|ならく} に {下|お}りる の は 、 {慣|な}れてる わ 。 {舞台|ぶたい} の {下|した} に は 、 いつも {何|なに} か ある の よ 。 || Going down below stage, I'm used to. There's always something under the boards.
!call ko.arayuru
!set ko_hollow_open
!quest ko_main 4
!journal {大楠|おおくす} の {根|ね} の {洞|ほら} が {開|ひら}いた 。 {上|うえ} の {段|だん} から 、 {根|ね} の {洞|ほら} へ {下|お}りよう 。 || The hollow under the great camphor is open. Go up to the crown and down into the Root Hollows.

@scene ko.nami_telling
!faceplayer
!set ko_tell_nami
ko_nami: {舟|ふね} の {話|はなし} ね 。 {船乗|ふなの}り は 、 みんな こう {言|い}う 。 || The boat story? Every boat person tells it like this.
ko_nami: この {島|しま} は 、 {昔|むかし} {海|うみ} を {流|なが}れて いた 。 なくした {言葉|ことば} を {追|お}いかけて ね 。 {最初|さいしょ} の {葉守|はもり} が 、 {舟|ふね} の {綱|つな} を {木|き} に {結|むす}んで 、 {止|と}めた 。 || This island used to drift over the sea, chasing lost words. The first keeper tied her boat's line to the tree, and it stopped.
ko_nami[smile]: だから 、 {今|いま} は {島|しま} の {代|か}わり に 、 わたし たち が {漕|こ}ぐ の 。 {本当|ほんとう} か どう か は 、 {知|し}らない けど 。 {腕|うで} は {本当|ほんとう} に {疲|つか}れる よ 。 || So now we row instead of the island. Whether it's true, I don't know. My arms get truly tired, though.

@scene ko.hamaji_telling
!faceplayer
!set ko_tell_hamaji
ko_hamaji: {漁師|りょうし} の {話|はなし} か 。 {座|すわ}れ 。 {網|あみ} は {逃|に}げない 。 || The fishers' story? Sit down. The nets won't run off.
ko_hamaji: {昔|むかし} な 、 {大|おお}きな {海蛇|うみへび} が いた 。 {嵐|あらし} の {夜|よる} に {船乗|ふなの}り が {叫|さけ}んだ {言葉|ことば} を 、 {全部|ぜんぶ} {飲|の}み{込|こ}んで しまう 。 || Long ago there was a great sea serpent. On stormy nights it swallowed every word the sailors shouted.
ko_hamaji: {最初|さいしょ} の {葉守|はもり} が {叱|しか}りつけて 、 {吐|は}き{出|だ}させた 。 {海蛇|うみへび} は {恥|は}ずかしく なって 、 {寝|ね}て しまった 。 その {背中|せなか} が 、 この {島|しま} だ 。 || The first keeper gave it a scolding and made it spit them out. The serpent was so ashamed it went to sleep. Its back is this island.
ko_hamaji[laugh]: …… {孫|まご} が {海|うみ} に {遠|とお}く まで {泳|およ}ぎ{出|だ}さない よう に な 、 よく {話|はな}した もの だ 。 だが 、 {嵐|あらし} の {後|あと} の {葉|は} は 、 {本当|ほんとう} に {叫|さけ}び{声|ごえ} ばかり だ よ 。 || …I told it to my grandchildren often, so they wouldn't swim out too far. But the leaves after a storm really are all shouting.

@scene ko.shell_a
!gesture pc bend
narr: {大|おお}きな {法螺貝|ほらがい} に {耳|みみ} を {当|あ}てる と 、 {波|なみ} の {音|おと} の {奥|おく} から 、 {二人|ふたり} の {女|おんな} の {人|ひと} の {声|こえ} が した 。 || Put your ear to the great conch, and from deep behind the sound of the sea come two women's voices.
narr: 「{返事|へんじ} は 、 まだ {来|こ}ない の ？」 「{来|こ}ない わ 。 {船|ふね} が {出|で}なく なって から 、 {一通|いっつう} も 。」 || "Still no reply?" "No. Not one, since the boats stopped."
!set ko_shell_a
!call ko.shells_check
@scene ko.shell_b
!gesture pc bend
narr: {法螺貝|ほらがい} の {中|なか} から 、 {年|とし} を {取|と}った {男|おとこ} の {声|こえ} と 、 {若|わか}い {女|おんな} の {声|こえ} 。 || From inside the conch, an old man's voice and a young woman's.
narr: 「お{嬢|じょう}さん 、 この {種|たね} を どこ に {植|う}える ん だい 。」 「{海|うみ} の {真|ま}ん{中|なか} の {岩|いわ} に 。 {届|とど}かない {言葉|ことば} が 、 {休|やす}める {所|ところ} が ほしい の 。」 || "Young lady, where are you planting this seed?" "On the rock in the middle of the sea. I want somewhere for words that don't arrive to rest."
!set ko_shell_b
!call ko.shells_check
@scene ko.shell_c
!gesture pc bend
narr: {法螺貝|ほらがい} が 、 {小|ちい}さな {声|こえ} で {二|ふた}つ の こと を {言|い}う 。 || The conch says two things, quietly.
narr: 「{姉|ねえ}さん が {植|う}えた の は 、 {自分|じぶん} の {手紙|てがみ} の ため じゃ ない 。 みんな の ため よ 。」 「…… {返事|へんじ} が {来|こ}なくて も 、 {書|か}いた {言葉|ことば} は {本当|ほんとう} だった 。」 || "My sister didn't plant it for her own letters. She planted it for everyone's." "…Even with no reply, what I wrote was true."
!set ko_shell_c
!call ko.shells_check

@scene ko.shells_check
# Once all three conches have been heard: who said each line, and to whom (the shells' sheet), then the same lines'
# reading task (the evidence); the shells' telling is then the fourth for the exhibition.
!if ko_tell_shell -> done
!if !ko_shell_a -> more
!if !ko_shell_b -> more
!if !ko_shell_c -> more
narr: {三|みっ}つ の {貝|かい} の {声|こえ} は 、 {同|おな}じ {夜|よる} の {話|はなし} らしい 。 {誰|だれ} が 、 {誰|だれ} に {言|い}った の だろう 。 || The three conches' voices seem to be from the same night. Who said what, to whom?
!hook shells ko.s_first
!if var._shells=cancel -> later
!challenge ko.shells_read
!set ko_tell_shell
narr: チトセ 。 {最初|さいしょ} の {葉守|はもり} に は 、 {名前|なまえ} が あった 。 || Chitose. The first keeper had a name.
?(comp=nao) comp: {返事|へんじ} の {来|こ}ない {手紙|てがみ} を 、 {書|か}き{続|つづ}けた {人|ひと} か 。 …… {郵便屋|ゆうびんや} と して は 、 {頭|あたま} が {下|さ}がる よ 。 || Someone who kept writing letters that never got answered. …As a courier, I take my hat off to her.
?(comp=mio) comp[sad]: {届|とど}かなくて も 、 {本当|ほんとう} だった 。 …… その {言葉|ことば} 、 {覚|おぼ}えて おきます 。 || Even if it never arrived, it was true. …I'll remember that.
?(comp=ren) comp: {名前|なまえ} を {呼|よ}ばれない まま の {人|ひと} が 、 ここ に も いた の です ね 。 チトセ さん 。 || Someone who went uncalled by her name, here too. Chitose.
?(comp=suzu) comp: {妹|いもうと} さん 、 いい {台詞|せりふ} {言|い}う じゃない 。 {姉|あね} の {肩|かた} を {持|も}つ {妹|いもうと} 。 …… {嫌|きら}い じゃ ない わ 。 || The little sister's got good lines. A sister sticking up for her sister. …I don't mind that at all.
?(quest.ko_main=3) !journal {法螺貝|ほらがい} の {声|こえ} は 、 {最初|さいしょ} の {葉守|はもり} チトセ の {夜|よる} の {話|はなし} だった 。 {四|よっ}つ {目|め} の {話|はなし} が {揃|そろ}った 。 || The conches kept the night of Chitose, the first keeper. That is the fourth telling.
!end
:more
narr: {他|ほか} の {法螺貝|ほらがい} に も 、 {同|おな}じ {夜|よる} の {声|こえ} が {残|のこ}って いる かも しれない 。 || The other conches may keep voices from the same night.
!end
:later
narr: {貝|かい} の {声|こえ} は 、 {逃|に}げない 。 また {後|あと} で {聞|き}こう 。 || The voices won't go anywhere. Listen again later.
:done

@scene ko.hall_exhibit
# The desk in the keepers' hall: the four tellings side by side, three panels to hang.
!if tell_ko.t_hall_ok -> hung
!if quest.ko_main<3 -> early
!if !ko_tell_otoha -> missing
!if !ko_tell_nami -> missing
!if !ko_tell_hamaji -> missing
!if !ko_tell_shell -> missing
narr: {机|つくえ} の {上|うえ} に 、 {空|から} の {板|いた} が {三枚|さんまい} 。 {四|よっ}つ の {話|はなし} を {並|なら}べて 、 どれ を {出|だ}す か {決|き}めよう 。 || Three blank panels on the desk. Set the four tellings side by side and choose what each one shows.
!hook tellings ko.t_hall
!if var._tell=cancel -> later
narr: {板|いた} を {一枚|いちまい} ずつ {壁|かべ} に {掛|か}けた 。 {館|やかた} の {中|なか} に 、 {島|しま} の {始|はじ}まり が {並|なら}んだ 。 || You hang the panels one by one. The island's beginning is on the walls.
?(comp=nao) comp: {悪|わる}く ない 。 {読|よ}む {人|ひと} が {自分|じぶん} で {比|くら}べられる 。 || Not bad. Whoever reads it can compare for themselves.
?(comp=mio) comp[smile]: どの {話|はなし} も 、 {誰|だれ} か が {大事|だいじ} に して きた もの です ね 。 || Every one of them is something someone has cherished.
?(comp=ren) comp: {一|ひと}つ に {決|き}めない の も 、 {守|まも}る と いう こと です ね 。 || Not settling on just one is a kind of keeping too.
?(comp=suzu) comp[smile]: {三幕|さんまく} {物|もの} の {出来上|できあ}がり 。 {演出|えんしゅつ} は 、 あなた 。 || A play in three acts, done. Directed by you.
!journal {館|やかた} に {島|しま} の {話|はなし} を {並|なら}べた 。 オトハ に {見|み}せよう 。 || The island's tellings hang in the hall. Show Otoha.
!end
:missing
narr: {空|から} の {板|いた} が {三枚|さんまい} 。 {話|はなし} が {四|よっ}つ {揃|そろ}う まで 、 {並|なら}べられない 。 || Three blank panels. They can't be hung until you have all four tellings.
?(!ko_tell_otoha) narr: オトハ の {話|はなし} が 、 まだ だ 。 || Otoha's telling: not yet.
?(!ko_tell_nami) narr: ナミ の {話|はなし} が 、 まだ だ 。 || Nami's: not yet.
?(!ko_tell_hamaji) narr: ハマジ の {話|はなし} が 、 まだ だ 。 || Hamaji's: not yet.
?(!ko_tell_shell) narr: {法螺貝|ほらがい} の {声|こえ} が 、 まだ だ 。 || The conches' voices: not yet.
!end
:early
narr: {展示|てんじ} の {机|つくえ} 。 {空|から} の {板|いた} が {重|かさ}ねて ある 。 || The exhibition desk. Blank panels, stacked.
!end
:later
narr: {板|いた} は 、 {机|つくえ} の {上|うえ} で {待|ま}って いる 。 || The panels wait on the desk.
!end
:hung
narr: {板|いた} は {壁|かべ} に {掛|か}かって いる 。 {並|なら}べ{直|なお}したく なったら 、 また ここ で 。 || The panels are on the walls. Here, if you want to rearrange them.
!choice
* {並|なら}べ{直|なお}す 。 || Rearrange them. -> again
* その まま に する 。 || Leave them. -> end
:again
!hook tellings ko.t_hall
:end

@scene ko.hall_panel_blank
narr: {何|なに} も {書|か}いて いない {板|いた} 。 || A blank panel.
@scene ko.hall_panel_p1
narr: 「{木|き} の {始|はじ}まり」 。 || "How the tree began".
?(var.tell_ko.t_hall_p1=otoha) narr: {最初|さいしょ} の {葉守|はもり} が 、 {届|とど}かない {言葉|ことば} の ため に {植|う}えた 。 || The first keeper planted it for words that never arrive.
?(var.tell_ko.t_hall_p1=hamaji) narr: {眠|ねむ}る {海蛇|うみへび} の {背中|せなか} に {生|は}えた 。 {絵|え} の {海蛇|うみへび} は 、 {少|すこ}し {恥|は}ずかしそう だ 。 || It grew on a sleeping serpent's back. The painted serpent looks a little embarrassed.
?(var.tell_ko.t_hall_p1=shell) narr: チトセ が 、 {自分|じぶん} と みんな の {手紙|てがみ} の ため に {植|う}えた 。 || Chitose planted it, for her letters and everyone's.
@scene ko.hall_panel_p2
narr: 「{島|しま} の {始|はじ}まり」 。 || "How the island came to be here".
?(var.tell_ko.t_hall_p2=otoha) narr: {岩|いわ} は 、 {昔|むかし} から ここ に あった 。 || The rock was always here.
?(var.tell_ko.t_hall_p2=nami) narr: {流|なが}れ{島|じま} が 、 {舟|ふね} の {綱|つな} で {留|とど}まった 。 || A drifting island, held by a mooring line.
?(var.tell_ko.t_hall_p2=hamaji) narr: {海蛇|うみへび} が {眠|ねむ}って 、 {島|しま} に なった 。 || A serpent fell asleep and became the island.
@scene ko.hall_panel_p3
narr: 「{葉守|はもり} の {約束|やくそく}」 。 || "What the keepers promise".
?(var.tell_ko.t_hall_p3=otoha) narr: {葉|は} は 、 {一枚|いちまい} {残|のこ}らず {元|もと} の {場所|ばしょ} へ {返|かえ}す 。 || Every leaf goes home.
?(var.tell_ko.t_hall_p3=nami) narr: どんな に {遠|とお}くて も 、 {舟|ふね} で {届|とど}ける 。 || However far, the boats will take them.
?(var.tell_ko.t_hall_p3=shell) narr: {書|か}いた {人|ひと} だけ の {言葉|ことば} も ある 。 || Some words belong only to the one who wrote them.

@scene ko.crown_first
# Staged: up the last steps onto the crown; the trunk goes up out of sight; you look up; leaves falling like snow from
# a canopy you can't see the top of; your companion's own look.
!set ko_crown_seen
!gesture pc lookroad up
narr: {大楠|おおくす} の {幹|みき} は 、 {見上|みあ}げて も {上|うえ} が {見|み}えない 。 {枝|えだ} の {間|あいだ} から 、 {葉|は} が {絶|た}え{間|ま} なく {降|ふ}って くる 。 || Look up the great camphor's trunk and you can't see the top. Leaves come down between the branches without end.
?(comp=nao) comp: …… {一|ひと}つ の {町|まち} の {郵便|ゆうびん} より 、 {多|おお}い な 。 || …More than a whole town's post.
?(comp=mio) comp: こんな に {大|おお}きな {木|き} 、 {見|み}た こと ない 。 …… {疲|つか}れて いる の が 、 {分|わ}かる {気|き} が する 。 || I've never seen a tree this big. …I think I can tell it's tired.
?(comp=ren) comp: {灯|ひ} の {道|みち} の {一番|いちばん} {古|ふる}い {杉|すぎ} より 、 {年上|としうえ} です ね 。 || Older than the oldest cedar on the lantern roads.
?(comp=suzu) comp: {緞帳|どんちょう} みたい ね 。 {上|あ}がらない {緞帳|どんちょう} 。 || Like a stage curtain. One that never goes up.

@scene ko.hollow_shut
narr: {二本|にほん} の {根|ね} の {間|あいだ} に 、 {暗|くら}い {洞|ほら} 。 {縄|なわ} が {張|は}って あって 、 {紙|かみ} の {札|ふだ} が {下|さ}がって いる 。 「{葉守|はもり} の {外|ほか} 、 {入|い}る べからず」 。 || A dark hollow between two roots, roped off, with a paper notice: "None but the keepers may enter."
!move pc down 1

@scene ko.crown_shrine
!gesture pc nod
narr: {小|ちい}さな {祠|ほこら} 。 {供|そな}えて ある の は 、 {花|はな} で は なく 、 {一枚|いちまい} の {白|しろ}い {紙|かみ} 。 {何|なに} も {書|か}いて いない 。 || A small shrine. The offering isn't flowers: a single sheet of white paper, with nothing written on it.

@scene ko.terrace_shrine
narr: {段|だん} の {隅|すみ} の {祠|ほこら} に 、 {小|ちい}さな {籠|かご} 。 {葉守|はもり} が 、 {字|じ} の {読|よ}めない {葉|は} を {置|お}いて いく {所|ところ} らしい 。 || In the shrine at the corner of the terrace, a small basket: where the keepers leave leaves they can't read, it seems.

@scene ko.rope_early
narr: {上|うえ} へ の {石段|いしだん} に 、 {縄|なわ} が {張|は}って ある 。 {札|ふだ} に 「この {先|さき} 、 {大楠|おおくす} 。 {客人|きゃくじん} は 、 オトハ に {一言|ひとこと} 」 。 || A rope across the steps up, and a notice: "Beyond, the great camphor. Visitors, a word with Otoha first."
!move pc down 1

@scene ko.roots_enter
# Staged: down through the hollow into the dark; the air moves; leaves turning in it; your companion close behind.
!set ko_roots_seen
narr: {根|ね} の {洞|ほら} の {中|なか} は 、 {湿|しめ}った {土|つち} と {潮|しお} の {匂|にお}い 。 {風|かぜ} が {下|した} から {吹|ふ}いて 、 {葉|は} が {宙|ちゅう} を {回|まわ}って いる 。 || Inside the Root Hollows: damp earth and the smell of the sea. Air blows up from below, and leaves turn in it.
narr: {葉|は} の {字|じ} が 、 {半分|はんぶん} {消|き}えて いる 。 {風|かぜ} に {乗|の}った まま 、 {行|い}き{場|ば} を なくした よう に 。 || Half the writing on the leaves is gone, as if, caught on the wind, they'd lost their way.
?(comp=nao) comp: {宛名|あてな} の {消|き}えた {手紙|てがみ} が 、 {仕分|しわ}け{棚|だな} の {上|うえ} で {回|まわ}ってる みたい だ 。 || Like letters with their addresses rubbed off, going round and round on the sorting shelf.
?(comp=mio) comp: {息|いき} が {詰|つ}まる …… 。 {木|き} も 、 {苦|くる}しい の かな 。 || It's close down here… Maybe the tree can't breathe either.
?(comp=ren) comp: {灯|ひ} を {持|も}って いて よかった 。 …… {足元|あしもと} に {気|き} を つけて ください 。 || Good thing we brought a light. …Mind your footing.
?(comp=suzu) comp: {奈落|ならく} より {暗|くら}い わ ね 。 …… {大丈夫|だいじょうぶ} 、 {出口|でぐち} は いつも ある もの よ 。 || Darker than any understage. …Don't worry, there's always a way out.

@scene ko.root_leaf_a
!gesture pc observe
narr: {風|かぜ} の {中|なか} を 、 {一枚|いちまい} の {葉|は} が {回|まわ}り{続|つづ}けて いる 。 {字|じ} が {一部|いちぶ} {消|き}えて いる 。 {言|い}えなかった {言葉|ことば} の {葉|は} だ 。 || One leaf goes round and round in the current. Some of its writing is gone: a leaf of words that were never said.
!challenge ko.root_a
!if var._res=0 -> again
!set ko_root_a
!sfx wind
!shake 1
narr: {言葉|ことば} が {戻|もど}る と 、 {葉|は} は {風|かぜ} から {抜|ぬ}けて 、 {静|しず}か に {落|お}ちた 。 {奥|おく} で 、 {根|ね} の {軋|きし}む {音|おと} が して 、 {下|した} へ の {道|みち} が {開|ひら}いた 。 || With its word back, the leaf slips out of the wind and falls quietly. Further in, roots creak, and the way down opens.
!end
:again
narr: {葉|は} は まだ {回|まわ}って いる 。 {言葉|ことば} が {違|ちが}う らしい 。 || The leaf is still turning. That wasn't the word, it seems.

@scene ko.root_arch
narr: {根|ね} が {絡|から}み{合|あ}って 、 {道|みち} を {塞|ふさ}いで いる 。 {近|ちか}く の {風|かぜ} の {中|なか} に 、 {何|なに} か {鍵|かぎ} が ありそう だ 。 || Roots knotted together block the way. Something in the wind nearby seems to be the key.

@scene ko.roots_rest
!gesture pc brow
narr: {根|ね} の {間|あいだ} の {乾|かわ}いた {窪|くぼ}み 。 {少|すこ}し {休|やす}める 。 || A dry hollow between the roots. You can rest a little.
!heal
!checkpoint

@scene ko.tide_split
# The separation (10_STORY §8, "in danger"): halfway over the root bridge the sea comes in under the island; it rises
# over the bridge behind you, and your companion is left on the far bank. Staged: a roar from below; the water rises;
# you look back; your companion calls across; the spray hides them; you step down onto the south bank. Calm, never a
# warning: the way round is there.
!set ko_tide_in
!sfx splash
!shake 2
narr: {足|あし} の {下|した} から 、 {低|ひく}い {音|おと} 。 {潮|しお} が 、 {根|ね} の {間|あいだ} から {一気|いっき} に {満|み}ちて くる 。 || A low roar from under your feet. The tide is pouring in between the roots.
narr: {振|ふ}り{返|かえ}る と 、 {橋|はし} は もう {水|みず} の {下|した} だった 。 {仲間|なかま} は 、 {向|む}こう {岸|ぎし} に {残|のこ}って いる 。 || You look back: the bridge is already under water. Your companion is left on the far bank.
?(comp=nao) comp: {動|うご}く な ！ …… いや 、 {動|うご}け 。 そっち に {道|みち} が ある なら 、 {回|まわ}って {来|こ}い 。 {俺|おれ} は ここ で {待|ま}つ 。 {絶対|ぜったい} {動|うご}かない 。 || Don't move! …No, do move. If there's a way on your side, come round. I'll wait right here. I won't budge.
?(comp=mio) comp[worry]: {大丈夫|だいじょうぶ} ！？ …… わたし は {平気|へいき} 。 ここ で {待|ま}ってる から 、 {無理|むり} しない で ね 。 {絶対|ぜったい} 、 {迎|むか}え に {来|き}て 。 || Are you all right?! …I'm fine. I'll wait here, so don't push yourself. You will come for me, won't you.
?(comp=ren) comp: {灯|ひ} は {持|も}って います ね ！ {水|みず} は 、 {低|ひく}い {方|ほう} へ {流|なが}れる 。 {登|のぼ}る {道|みち} を {探|さが}して ください 。 {私|わたし} は 、 ここ で {灯|ひ} を {振|ふ}って います ！ || You have your light, yes? Water runs downhill: look for a way that climbs. I'll keep waving my light from here!
?(comp=suzu) comp: …… {大丈夫|だいじょうぶ} 、 {幕間|まくあい} よ 、 {幕間|まくあい} ！ {次|つぎ} の {幕|まく} で {会|あ}いましょう 。 {出番|でばん} {忘|わす}れたら 、 {承知|しょうち} しない から ね ！ || …It's all right, it's just the interval! See you in the next act. Miss your cue and I'll never forgive you!
!set ko_apart
!refresh
!move pc down 1
narr: {水|みず} しぶき の {向|む}こう に 、 {仲間|なかま} の {姿|すがた} が {見|み}えなく なった 。 {西|にし} に 、 {細|ほそ}い {道|みち} が {続|つづ}いて いる 。 || Through the spray you can't see your companion any more. To the west, a narrow way goes on.
!quest ko_main 5
!journal {潮|しお} が {満|み}ちて 、 {仲間|なかま} と {離|はな}れて しまった 。 {西|にし} の {回|まわ}り{道|みち} から 、 {向|む}こう {岸|ぎし} へ {戻|もど}ろう 。 || The tide has come in between you and your companion. Find the way round to the far bank, west.

@scene ko.round_enter
!set ko_round_seen
narr: {一人|ひとり} だ 。 {自分|じぶん} の {足音|あしおと} だけ が 、 {根|ね} に {響|ひび}く 。 || Alone. Only your own footsteps echo in the roots.
pc: …… {大丈夫|だいじょうぶ} 。 {回|まわ}って いけば 、 {着|つ}く 。 || …It's all right. Go round, and I'll get there.

@scene ko.root_leaf_b
!gesture pc observe
narr: {暗|くら}い {風|かぜ} の {中|なか} に 、 {葉|は} が {一枚|いちまい} 。 {傘|かさ} の {絵|え} の {横|よこ} に 、 {字|じ} が {欠|か}けて いる 。 || In the dark current, one leaf. Beside a little drawing of an umbrella, the words break off.
!challenge ko.root_b
!if var._res=0 -> again
!set ko_root_b
!sfx wind
narr: {葉|は} が {落|お}ちる と 、 {道|みち} の {真|ま}ん{中|なか} の {根|ね} が 、 {解|ほど}ける よう に {退|しりぞ}いた 。 || As the leaf falls, the roots across the middle of the passage draw back, as if untying.
!end
:again
narr: {葉|は} は まだ {回|まわ}って いる 。 || The leaf is still turning.

@scene ko.root_leaf_c
!gesture pc observe
narr: {一番|いちばん} {奥|おく} の {風|かぜ} の {中|なか} 。 {玄関|げんかん} の {絵|え} が {描|か}いて ある {葉|は} 。 {最初|さいしょ} の {言葉|ことば} が 、 ない 。 || In the furthest current, a leaf with a drawing of a doorway. Its first word is missing.
!challenge ko.root_c
!if var._res=0 -> again
!set ko_root_c
!sfx wind
!shake 2
narr: {洞|ほら} {全体|ぜんたい} が {軋|きし}んだ 。 {根|ね} が {動|うご}いて 、 {上|うえ} へ の {道|みち} が {開|ひら}く 。 {遠|とお}く で 、 {水|みず} が {引|ひ}いて いく {音|おと} が した 。 || The whole hollow creaks. Roots shift, and a way up opens. Far off, you hear water draining away.
!journal {根|ね} の {形|かたち} が {変|か}わった 。 {北|きた} の {道|みち} から 、 {潮|しお} の {洞|ほら} の {向|む}こう {岸|ぎし} へ {戻|もど}れる 。 || The roots have shifted. The way north leads back to the far bank of the Tidal Hollow.
!end
:again
narr: {葉|は} は まだ {回|まわ}って いる 。 || The leaf is still turning.

@scene ko.reunion
# Each companion's reunion after the separation (S14, 14_COMPANIONS). Staged: out of the dark onto the north bank; your
# companion turns at your step and comes running; each in their own way (Nao's hand on your shoulder, held a beat too
# long; Mio checks you over for scrapes and then laughs; Ren holds up the lantern to see your face; Suzu's mock bow and
# then a real hug); the water below is going down.
!unset ko_apart
!set ko_reunited
!refresh
!look comp pc
?(comp=nao) !gesture comp handover pc
?(comp=nao) comp: …… {遅|おそ}い 。 {配達|はいたつ} なら 、 {苦情|くじょう} もん だ ぞ 。 || …You're late. If you were a delivery, I'd be filing a complaint.
?(comp=nao) comp[smile]: {待|ま}つ の は {得意|とくい} な はず だった ん だ が な 。 {今日|きょう} は 、 {下手|へた} だった 。 || I thought I was good at waiting. Today I was bad at it.
?(comp=mio) !gesture comp observe pc
?(comp=mio) comp[worry]: {怪我|けが} は ？ {手|て} 、 {見|み}せて 。 …… {擦|す}り{傷|きず} だけ 。 よかった 。 || Are you hurt? Show me your hands. …Just scrapes. Thank goodness.
?(comp=mio) comp[laugh]: …… ごめん 、 {泣|な}いて ない よ 。 {潮|しお} の {水|みず} が 、 {目|め} に {入|はい}った だけ 。 || …Sorry, I'm not crying. Just seawater in my eyes.
?(comp=ren) !gesture comp present pc prop=lantern
?(comp=ren) comp: {顔|かお} を {見|み}せて ください 。 …… はい 、 {確|たし}か に あなた です 。 || Let me see your face. …Yes. It's definitely you.
?(comp=ren) comp[smile]: {灯|ひ} を {振|ふ}り{続|つづ}けて いました 。 {見|み}えて いました か 。 {見|み}えて いなくて も 、 {振|ふ}って いました けど 。 || I kept waving the light. Could you see it? I'd have kept waving even if you couldn't.
?(comp=suzu) !gesture comp bow
?(comp=suzu) comp[smile]: お{帰|かえ}り なさい 、 {主役|しゅやく} さん 。 {出番|でばん} 、 ぎりぎり {間|ま}に{合|あ}った わ ね 。 || Welcome back, star of the show. Just made your cue.
?(comp=suzu) comp[sad]: …… {本当|ほんとう} は 、 {怖|こわ}かった 。 {台本|だいほん} に {書|か}いて ない {場面|ばめん} は 、 {嫌|きら}い よ 。 || …Honestly? I was scared. I hate scenes that aren't in the script.
narr: {足元|あしもと} の {水|みず} が 、 {少|すこ}し ずつ {引|ひ}いて いく 。 {東|ひがし} の {根|ね} の {向|む}こう に 、 {緑|みどり} の {光|ひかり} が {見|み}える 。 || The water at your feet is going down. Beyond the roots to the east, a green light.
!quest ko_main 6
!journal {仲間|なかま} と {会|あ}えた 。 {東|ひがし} の {根|ね} の {向|む}こう 、 {届|とど}かぬ {言葉|ことば} の {庭|にわ} へ 。 || Together again. East, beyond the roots: the Garden of Unsent Words.

@scene ko.root_arch_garden
narr: {根|ね} が {何重|なんじゅう} に も {絡|から}んで いる 。 {隙間|すきま} から 、 {緑|みどり} の {光|ひかり} が {漏|も}れて いる 。 || Roots tangled many times over. Green light shows through the gaps.

@scene ko.garden_enter
# Staged: in under the heart of the tree; leaves hanging on root-branches like paper lanterns; at the centre, the woven
# roots stir and turn towards you; your companion's own look.
!set ko_garden_seen
narr: {木|き} の {心臓|しんぞう} の {真下|ました} 。 {根|ね} の {枝|えだ} に 、 {無数|むすう} の {葉|は} が {吊|つ}るされて いる 。 {提灯|ちょうちん} の よう に 、 {淡|あわ}く {光|ひか}って 。 || Right under the heart of the tree. Countless leaves hang from root-branches, glowing faintly like paper lanterns.
narr: どの {葉|は} も 、 {宛名|あてな} の ある {手紙|てがみ} の {字|じ} だ 。 {出|だ}されなかった {手紙|てがみ} 。 || Every one is in a letter's hand, with someone's name on it. Letters never sent.
?(comp=nao) comp: …… {出|だ}されなかった {手紙|てがみ} の {郵便局|ゆうびんきょく} か 。 {俺|おれ} の {知|し}ってる {手紙|てがみ} も 、 ここ に ある かも な 。 || …A post office for letters nobody sent. Some I know of might be here too.
?(comp=mio) comp: {全部|ぜんぶ} 、 {誰|だれ} か に {言|い}いたかった {言葉|ことば} な の ね 。 || Every one of them, something someone wanted to say to someone.
?(comp=ren) comp: {灯籠|とうろう} の {並|なら}び {方|かた} に {似|に}て います 。 {誰|だれ} か が 、 ずっと {手入|てい}れ を して いる 。 || They're hung like a row of lanterns. Someone has tended them all this time.
?(comp=suzu) comp: {客席|きゃくせき} {一杯|いっぱい} の 、 {言|い}えなかった {台詞|せりふ} 。 …… {静|しず}か に しなきゃ ね 。 || A full house of lines nobody ever got to say. …We should be quiet.

@scene ko.gardener
# The Gardener of Unsent Words: the island's oldest keeper-spirit (social and folklore, E7/E8): ask back (A6),
# compare the tellings (A49), and decide which leaves to return. Staged: the woven roots lift into a tall shape of
# leaves with a lantern of a face; it speaks slowly, in the old way.
!if ko_gardener_done -> done
ko_gardener: …… {人|ひと} が {来|く}る の は 、 {何百年|なんびゃくねん} ぶり か 。 {葉守|はもり} で すら 、 ここ へ は {下|お}りて こない 。 || …How many hundred years since anyone came. Not even the keepers come down here.
ko_gardener: ここ の {葉|は} は 、 {届|とど}けて は ならぬ {言葉|ことば} 。 {書|か}いた {者|もの} が 、 {出|だ}さぬ と {決|き}めた {言葉|ことば} だ 。 || The leaves here are words that must not be delivered. Their writers chose not to send them.
ko_gardener: {近|ちか}ごろ 、 {上|うえ} から {落|お}ちて くる {葉|は} が {多|おお}すぎて 、 {庭|にわ} が {溢|あふ}れる 。 {溢|あふ}れた {葉|は} は 、 {風|かぜ} に {乗|の}って {出|で}て ゆく 。 {出|で}て いかせ は しない 。 || Lately, too many leaves come down from above, and the garden overflows. The overflow rides the wind out. I will not let them go.
!encounter ko.gardener
!if var._res=0 -> again
!set ko_gardener_done
!refresh
narr: {根|ね} の {形|かたち} が 、 {静|しず}か に {元|もと} の {編|あ}み{目|め} に {戻|もど}った 。 {風|かぜ} が {止|や}み 、 {宙|ちゅう} の {葉|は} が 、 {一枚|いちまい} ずつ {枝|えだ} に {帰|かえ}って いく 。 || The shape settles back into woven roots. The wind drops, and the leaves in the air go back to their branches, one by one.
?(comp=nao) comp: {出|だ}す {手紙|てがみ} と 、 {出|だ}さない {手紙|てがみ} 。 …… {仕分|しわ}け は 、 {終|お}わった な 。 || Letters to send and letters not to. …The sorting's done.
?(comp=mio) comp[smile]: {言|い}わない {方|ほう} が いい {言葉|ことば} も 、 ある の よ ね 。 {薬|くすり} と {同|おな}じ 。 {量|りょう} の {問題|もんだい} 。 || Some words are better left unsaid, aren't they. Like medicine: it's a matter of the dose.
?(comp=ren) comp: {灯|ひ} を {消|け}す の も 、 {灯守|ひもり} の {仕事|しごと} です 。 {庭守|にわもり} も 、 きっと {同|おな}じ です ね 。 || Putting a light out is part of a keeper's work too. A gardener's as well, I expect.
?(comp=suzu) comp: {言|い}わない {台詞|せりふ} が ある から 、 {言|い}う {台詞|せりふ} が {生|い}きる の よ 。 {名|めい}{演出|えんしゅつ} だった わ 。 || It's the lines you don't say that make the ones you do say count. Beautifully directed.
!quest ko_main 7
!journal {庭守|にわもり} と {話|はな}した 。 {木|き} は {静|しず}か に なった 。 {村|むら} の オトハ に {知|し}らせよう 。 || You spoke with the Gardener, and the tree is quiet. Tell Otoha in the village.
!autosave
!end
:again
narr: {庭守|にわもり} は 、 {根|ね} の {奥|おく} に {沈|しず}んで いった 。 {葉|は} は まだ {風|かぜ} の {中|なか} だ 。 {落|お}ち{着|つ}いたら 、 また {話|はな}そう 。 || The Gardener sinks back into the roots. The leaves are still in the wind. Speak with it again when you're ready.
!end
:done
!call ko.garden_after

@scene ko.garden_after
narr: {根|ね} の {編|あ}み{目|め} は 、 {静|しず}か だ 。 {吊|つ}るされた {葉|は} が 、 {灯|あか}り の よう に {揺|ゆ}れて いる 。 || The woven roots are still. The hanging leaves sway like little lights.

@scene ko.end
# The chapter's end: Otoha at the Wind Stone; the leaves falling gently now; Nami offers the boat back; the leaves like
# torn pages, she says, came from the north, over the mountains, from somewhere high (S5: indirect, never explained).
!faceplayer
ko_otoha[smile]: {木|き} が 、 {息|いき} を して います 。 {葉|は} の {落|お}ち{方|かた} が 、 {昔|むかし} の よう に {戻|もど}った 。 || The tree is breathing. The leaves fall the way they used to.
ko_otoha: {庭守|にわもり} に {会|あ}った の です ね 。 …… わたし の {祖母|そぼ} も 、 その {祖母|そぼ} も 、 {会|あ}った こと が ない 。 {葉守|はもり} を {代表|だいひょう} して 、 お{礼|れい} を {言|い}います 。 || You met the Gardener. …Neither my grandmother nor hers ever did. On behalf of all the keepers: thank you.
!gesture ko_otoha lookroad up
ko_otoha: ただ 、 {一|ひと}つ 。 {紙|かみ} の {切|き}れ{端|はし} の よう な {葉|は} は 、 {北|きた} から {来|き}ました 。 {山|やま} の 、 ずっと {上|うえ} の {方|ほう} から 。 …… {何|なに} が ある の か 、 わたし に は {分|わ}かりません 。 || Just one thing. The leaves like torn pages came from the north. From far up in the mountains. …What is up there, I couldn't say.
?(comp=nao) comp: {北|きた} の {山|やま} …… 。 {灯落|ひおち} の {上|うえ} か 。 || The northern mountains… Above Lanternfall.
?(comp=mio) comp[think]: {山|やま} の {上|うえ} …… {書庫|しょこ} の {方|ほう} ね 。 || Up in the mountains… The Archive's way.
?(comp=ren) comp[think]: {師匠|ししょう} が {行|い}った {方|ほう} です 。 …… {繋|つな}がって いる の かも しれません 。 || The way my master went. …It may all be connected.
?(comp=suzu) comp: {最終|さいしゅう} {幕|まく} の {舞台|ぶたい} から 、 {紙吹雪|かみふぶき} が {先|さき} に {届|とど}いた って わけ ね 。 || So the confetti from the final act's stage got here ahead of us.
!quest ko_main done
!set ko_done
!travel kotonoha
!journal {言|こと}の{葉|は}{島|じま} の {木|き} は {静|しず}か に なった 。 {紙|かみ} の よう な {葉|は} は 、 {北|きた} の {山|やま} から {来|き}て いた 。 テツ の {船|ふね} で {陸|りく} へ {戻|もど}ろう 。 || Kotonoha's tree is quiet. The leaves like torn pages came from the northern mountains. Take Tetsu's boat back to the mainland.
!toast {第九章|だいきゅうしょう} {完|かん} || Chapter 9 complete
!autosave
`);

RB.script.add(`
@scene ko.arayuru
# C-74 (the pattern of kr.subete): あらゆる, Protect against a move of any kind, from the keepers' words before the hollow.
!if mod_arayuru -> end
ko_otoha: {葉守|はもり} が {洞|ほら} に {入|はい}る とき 、 {唱|とな}える {言葉|ことば} が あります 。 「あらゆる {言葉|ことば} を 、 あらゆる {風|かぜ} から {守|まも}れ 。」 || There are words the keepers say on going into a hollow. "Guard every kind of word from every kind of wind."
ko_otoha: {根|ね} の {下|した} に は 、 あらゆる もの が {集|あつ}まる 。 {怒|いか}り も 、 {悲|かな}しみ も 、 {言|い}えなかった お{礼|れい} も 。 {何|なに} が {来|き}て も 、 {守|まも}れる よう に 。 || Every kind of thing gathers under the roots. Anger, sorrow, thanks never said. So that whatever comes, you can guard against it.
?(comp=nao) comp: あらゆる {風|かぜ} から 、 か 。 …… {郵便屋|ゆうびんや} の {心得|こころえ} と {同|おな}じ だ 。 {雨|あめ} でも {雪|ゆき} でも 、 {届|とど}ける 。 || From every kind of wind. …Same as a postman's rule. Rain or snow, it gets there.
?(comp=mio) comp[smile]: あらゆる {病|やまい} に {効|き}く {薬|くすり} は ない けれど 、 {守|まも}る {言葉|ことば} なら {持|も}って {行|い}けます ね 。 || There's no medicine for every kind of illness, but a guarding word we can take with us.
?(comp=ren) comp[think]: {灯守|ひもり} は 「すべて の {灯|ひ} を 」 。 {葉守|はもり} は 「あらゆる {言葉|ことば} を 」 。 …… {数|かず} で は なく 、 {種類|しゅるい} の {話|はなし} です ね 。 || The lamp-keepers say "every lamp". The leaf-keepers, "every kind of word". …Not how many: what kinds.
?(comp=suzu) comp[laugh]: あらゆる {役|やく} を こなす の が 、 {一座|いちざ} の {看板|かんばん} よ 。 {任|まか}せて 。 || Playing every kind of part is what a company's known for. Leave it to me.
!set mod_arayuru
!teach mod_arayuru
:end

@scene ko.otoha_roots
!faceplayer
ko_otoha: {根|ね} の {洞|ほら} は 、 {大楠|おおくす} の {上|うえ} の {段|だん} から {下|お}ります 。 {下|した} は {海|うみ} と {繋|つな}がって いる 。 {潮|しお} の {音|おと} が したら 、 {慌|あわ}てず に 。 {潮|しお} は 、 {必|かなら}ず {引|ひ}きます から 。 || The way into the Root Hollows is from the crown, by the great camphor. Down there it joins the sea. If you hear the tide, don't panic. The tide always goes out again.
`);
