/* Kotonoha, Chapter 9: the companions on the island (expansion P11f; 14_COMPANIONS's Chapter 9 pressure; sealed S14).
 * Each companion meets something of their own among the island's lost words, once, and it adds Bond (ko:beat):
 *   Nao   a letter-leaf on the drift line in a hand Nao knows. Nao reads it alone and says nothing yet (the Cloudroad
 *         takes it up: the bundle's sender is waiting there).
 *   Mio   labels without bottles among Otoha's pressed leaves: other people's undecided things; her own unanswered
 *         letter, not named.
 *   Ren   three stone lanterns half-buried in the sand, older than the Keepers' Road, named in the old kana spelling
 *         only Ren can read; relit by name with the player. Ren's own quest is untouched (S2).
 *   Suzu  her own half-written reply to Koume, washed into the sea cave; and, once the exhibition hangs, the island's
 *         story told on the cave's rock stage for the village children, the way the panels tell it.
 * And the island's rumour on the mainland (R4: told several ways, each partly true): Tetsu's at Saltglass, Shinobu's
 * at Playhouse Row, and Nami's answer to both on the island. (Ōmi's comes with the licence, the pilgrim's on the
 * Cloudroad.) */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
# ---- Nao: the astray letter -------------------------------------------------------------------------------------------
@scene ko.nao_letter
!set ko_nao_letter
narr: {浜|はま} を {歩|ある}いて いる と 、 {風|かぜ} が {葉|は} を {一枚|いちまい} 、 ナオ の {足元|あしもと} に {運|はこ}んだ 。 || As you walk the beach, the wind carries a leaf to Nao's feet.
!gesture comp bend prop=letter
comp[surprise]: …… この {字|じ} 。 || …This handwriting.
!gesture comp read prop=letter
narr: ナオ は {背中|せなか} を {向|む}けて 、 {一人|ひとり} で {読|よ}む 。 {長|なが}い {間|あいだ} 、 {動|うご}かない 。 || Nao turns their back and reads it alone. For a long while, they don't move.
!gesture comp avert
comp: …… {何|なん} でも ない 。 {誰|だれ} か の {買|か}い{物|もの} の {覚|おぼ}え{書|が}き だ 。 || …It's nothing. Somebody's shopping list.
narr: ナオ は {葉|は} を {折|お}って 、 {鞄|かばん} の {一番|いちばん} {奥|おく} に しまった 。 || Nao folds the leaf and tucks it into the very bottom of their satchel.
!choice
* {何|なに} も {聞|き}かない 。 || Leave it. -> leave
* 「{話|はな}したく なったら 、 {聞|き}く よ 。」 || "If you want to talk, I'm listening." -> listen
:leave
comp: …… {助|たす}かる 。 || …Thanks.
!goto out
:listen
comp: …… ああ 。 いつか な 。 || …Yeah. Some day.
:out
!hook co_bond ko:beat

# ---- Mio: labels without bottles -------------------------------------------------------------------------------------
@scene ko.mio_labels
!set ko_mio_labels
narr: {棚|たな} の {押|お}し{葉|ば} の {中|なか} に 、 {札|ふだ} の よう な {小|ちい}さな {葉|は} が {並|なら}んで いる 。 「{熱|ねつ} さまし」 「{咳|せき} {止|ど}め」 「{寝|ね}る {前|まえ} に {一|ひと}さじ」 。 || Among the pressed leaves on the shelf is a row of little leaves like labels. "For fever." "For a cough." "One spoonful before bed."
comp[think]: …… {薬|くすり} の {札|ふだ} ね 。 でも 、 {瓶|びん} が ない 。 {作|つく}ろう と して 、 {作|つく}らなかった {薬|くすり} の {名前|なまえ} 。 || …Medicine labels. But there are no bottles. The names of medicines someone meant to make, and didn't.
!gesture comp tidy
narr: ミオ の {手|て} が 、 {勝手|かって} に {札|ふだ} を {並|なら}べ{直|なお}して いく 。 {最後|さいご} に 、 {何|なに} も {書|か}いて いない {札|ふだ} が {一枚|いちまい} {残|のこ}った 。 || Mio's hands start putting the labels in order by themselves. At the end, one label is left with nothing written on it.
comp: {決|き}められなかった {人|ひと} の {札|ふだ} ね 。 …… {分|わ}かる わ 。 {答|こた}え を {出|だ}して いない もの 、 {私|わたし} の {鞄|かばん} に も ある から 。 || The label of someone who couldn't decide. …I understand. There's something I haven't answered in my bag too.
comp[smile]: …… なんて ね 。 {行|い}きましょう 。 || …Never mind me. Let's go.
!hook co_bond ko:beat

# ---- Ren: the oldest lanterns in the sand ----------------------------------------------------------------------------
@scene ko.ren_toro_first
comp[surprise]: …… {砂|すな} の {中|なか} に 、 {灯籠|とうろう} が {埋|う}まって います 。 {名前|なまえ} も {彫|ほ}って ある 。 {後|あと} で 、 {読|よ}ませて ください 。 || …There are lanterns buried in the sand, with names cut in them. Let me read them later.

@scene ko.toro_shore1
!gesture pc observe
!if comp=ren -> ren
narr: {砂|すな} に {半分|はんぶん} {埋|う}まった {石|いし} の {灯籠|とうろう} 。 {火袋|ひぶくろ} の {下|した} に {字|じ} が {彫|ほ}って ある が 、 {古|ふる}すぎて {読|よ}めない 。 || A stone lantern half-buried in the sand. Letters are cut below the light box, but they're too old to read.
!end
:ren
comp: 「ゆふなぎ」 。 {昔|むかし} の {仮名遣|かなづか}い です 。 {読|よ}んで みて ください 。 || ゆふなぎ. That's the old kana spelling. Try reading it.
!challenge ko.toro_1
!if var._res=0 -> later
!set ko_l_shore1
!var ko_toro + 1
comp: 「ゆうなぎ」 。 {夕方|ゆうがた} 、 {風|かぜ} が {止|や}んで {海|うみ} が {静|しず}か に なる {時|とき} 。 …… {灯|ひ} が {点|つ}きました 。 || ゆうなぎ: the evening calm, when the wind drops and the sea goes still. …It's lit.
?(var.ko_toro>=3) !call ko.ren_toro_all
!end
:later
comp[think]: …… もう {少|すこ}し {砂|すな} を {払|はら}って から 、 また {読|よ}みましょう 。 || …Let's brush away a bit more sand and read it again.
@scene ko.toro_shore2
!gesture pc observe
!if comp=ren -> ren
narr: {砂|すな} に {半分|はんぶん} {埋|う}まった {石|いし} の {灯籠|とうろう} 。 {字|じ} は {古|ふる}すぎて {読|よ}めない 。 || A stone lantern half-buried in the sand. The letters are too old to read.
!end
:ren
comp: 「しほさゐ」 。 これ も {昔|むかし} の {書|か}き{方|かた} です ね 。 || しほさゐ. The old way of writing again.
!challenge ko.toro_2
!if var._res=0 -> later
!set ko_l_shore2
!var ko_toro + 1
comp: 「しおさい」 。 {潮|しお} の {寄|よ}せる {音|おと} 。 …… {点|つ}きました 。 || しおさい: the sound of the tide coming in. …It's lit.
?(var.ko_toro>=3) !call ko.ren_toro_all
!end
:later
comp[think]: …… {急|いそ}がなくて いい です 。 {灯籠|とうろう} は {待|ま}って くれます 。 || …No hurry. Lanterns wait.
@scene ko.toro_pools
!gesture pc observe
!if comp=ren -> ren
narr: {砂|すな} に {半分|はんぶん} {埋|う}まった {石|いし} の {灯籠|とうろう} 。 {字|じ} は {古|ふる}すぎて {読|よ}めない 。 || A stone lantern half-buried in the sand. The letters are too old to read.
!end
:ren
comp: 「みをつくし」 。 {舟|ふね} の {通|とお}り{道|みち} を {示|しめ}す {杭|くい} の こと です 。 {読|よ}み{方|かた} は 、 {分|わ}かります か 。 || みをつくし: the posts that mark a channel for boats. Can you tell how it's read?
!challenge ko.toro_3
!if var._res=0 -> later
!set ko_l_pools
!var ko_toro + 1
comp: 「みおつくし」 。 {潮|しお}だまり の {間|あいだ} を 、 {舟|ふね} が {通|とお}れた {頃|ころ} の {灯籠|とうろう} でしょう 。 …… {点|つ}きました 。 || みおつくし. A lantern from when boats could pass between the pools, I'd say. …It's lit.
?(var.ko_toro>=3) !call ko.ren_toro_all
!end
:later
comp[think]: …… {後|あと} で 、 もう {一度|いちど} 。 || …Again later.

@scene ko.ren_toro_all
comp[think]: …… {三|みっ}つ とも 、 {灯守|ひもり} の {道|みち} の {灯籠|とうろう} より {古|ふる}い 。 {名前|なまえ} は {昔|むかし} の {仮名遣|かなづか}い で {彫|ほ}って ある 。 || …All three are older than the lanterns on the Keepers' Road, their names cut in the old kana spelling.
comp: この {島|しま} に も 、 {昔|むかし} は {灯|ひ} の {番|ばん} を する {人|ひと} が いた の でしょう 。 {名前|なまえ} を {読|よ}める {人|ひと} が いなく なって 、 {砂|すな} に {埋|う}もれた 。 || Someone must have kept the lights here once too. When nobody was left who could read the names, the sand took them.
comp[closed]: …… {誰|だれ} も {読|よ}めない {名前|なまえ} は 、 {無|な}い の と {同|おな}じ です 。 {私|わたし} が {読|よ}めて 、 よかった 。 || …A name nobody can read is as good as no name. I'm glad I could read them.
!hook co_bond ko:beat

# ---- Suzu: the unsent reply, and the sea cave's stage ----------------------------------------------------------------
@scene ko.suzu_leaf
!set ko_suzu_leaf
narr: {洞|ほら} の {入|い}り{口|ぐち} に {溜|た}まった {葉|は} の {中|なか} から 、 スズ が {一枚|いちまい} {拾|ひろ}い{上|あ}げる 。 || From the leaves heaped at the cave's mouth, Suzu picks one up.
comp[surprise]: …… あら 。 {私|わたし} の {字|じ} 。 || …Oh. My handwriting.
narr: 「コウメ へ 。 {手紙|てがみ} 、 ありがとう 。 {私|わたし} は {元気|げんき} 。 でも 、 まだ {戻|もど}れない 。 なぜ か と いう と ――」 そこ で 、 {字|じ} は {終|お}わって いる 。 || "Koume. Thank you for your letter. I'm well. But I can't come back yet. The reason is—" There the writing stops.
comp[laugh]: {書|か}きかけ の {返事|へんじ} ！ {捨|す}てた つもり だった のに 、 {海|うみ} を {渡|わた}って {来|く}る なんて 。 {律儀|りちぎ} な {葉|は} ね 。 || A half-written reply! I thought I'd thrown it away, and it's come all the way across the sea. What a dutiful leaf.
comp: …… 「なぜ か と いう と」 の {続|つづ}き 、 {書|か}けなかった の よ 。 {今|いま} も 、 {書|か}けない 。 || …I couldn't write what came after "The reason is". I still can't.
narr: スズ は {葉|は} を {帯|おび} に {挟|はさ}んだ 。 {捨|す}て は しなかった 。 || Suzu tucks the leaf into her sash. She doesn't throw it away.
!hook co_bond ko:beat

@scene ko.suzu_stage
# The island's story on the sea cave's rock stage, for the village children who followed round the rocks, told the
# way the exhibition's panels tell it. Nana comes in behind you as the scene begins and stands in the audience; she is
# the scene's own (an extra: her encore finds her, and she walks off when it ends); Suzu takes the rock, paces it while
# she tells it, and follows you again after (RBN-QA-088).
!set ko_suzu_stage
!enter ko_nana 13 10 up
narr: {岩|いわ} の {舞台|ぶたい} の {前|まえ} で 、 スズ が {足|あし} を {止|と}めた 。 {後|うし}ろ で は 、 ナナ と {村|むら} の {子供|こども} たち が {覗|のぞ}いて いる 。 {岩場|いわば} を {付|つ}いて {来|き}た らしい 。 || Suzu stops in front of the rock stage. Behind you, Nana and the village children are peeking in. They must have followed you round the rocks.
comp[smile]: …… お{客|きゃく} さん が いる なら 、 やる しか ない わ ね 。 || …Well, if there's an audience, there's nothing for it.
!walkto comp 14 6 down cross
!gesture comp bow
comp: さあ さあ 、 お{立|た}ち{会|あ}い ！ {言|こと}の{葉|は}{島|じま} の 、 {始|はじ}まり の {話|はなし} ！ || Roll up, roll up! The story of how Kotonoha began!
?(var.tell_ko.t_hall_p1=otoha) comp: むかし 、 {一人|ひとり} の {女|おんな} の {人|ひと} が 、 {届|とど}かない {言葉|ことば} の ため に 、 {海|うみ} の {真|ま}ん{中|なか} に {種|たね} を {植|う}えた ！ || Long ago, a woman planted a seed in the middle of the sea, for words that never arrive!
?(var.tell_ko.t_hall_p1=hamaji) comp: むかし 、 {大|おお}きな {海蛇|うみへび} が {眠|ねむ}って いた 。 その {背中|せなか} に 、 ある {日|ひ} {木|き} が {生|は}えた ！ || Long ago a great sea serpent lay sleeping, and one day a tree grew on its back!
?(var.tell_ko.t_hall_p1=shell) comp: むかし 、 チトセ と いう {人|ひと} が 、 {自分|じぶん} と みんな の {手紙|てがみ} の ため に 、 {種|たね} を {植|う}えた ！ || Long ago, a woman called Chitose planted a seed, for her own letters and for everyone's!
!walkto comp 12 6 down max=6000
!walkto comp 17 6 down max=6000
!walkto comp 14 6 down max=6000
narr: {子供|こども} たち が {息|いき} を のむ 。 スズ は {岩|いわ} の {上|うえ} を {歩|ある}き{回|まわ}り 、 {波|なみ} の {音|おと} を {相方|あいかた} に 、 {話|はなし} を {続|つづ}ける 。 || The children hold their breath. Suzu paces the rock and goes on, with the waves as her partner.
?(var.tell_ko.t_hall_p3=otoha) comp: そして {葉守|はもり} は {誓|ちか}った 。 {葉|は} は 、 {一枚|いちまい} {残|のこ}らず {元|もと} の {場所|ばしょ} へ ！ || And the keepers swore: every last leaf, back where it belongs!
?(var.tell_ko.t_hall_p3=nami) comp: そして {舟|ふね} の {人|ひと} は {誓|ちか}った 。 どんな に {遠|とお}くて も 、 {届|とど}けて みせる ！ || And the boat people swore: however far, we'll get them there!
?(var.tell_ko.t_hall_p3=shell) comp: …… でも ね 、 {書|か}いた {人|ひと} だけ の {言葉|ことば} も ある の 。 それ は 、 そっと {仕舞|しま}って おく の よ 。 || …But some words belong only to the one who wrote them. Those, you put away gently.
ko_nana[happy]: もう {一回|いっかい} ！ もう {一回|いっかい} ！ || Again! Again!
comp[laugh]: アンコール ？ …… {相方|あいかた} が いない と 、 {二幕目|にまくめ} は できない の よ 。 ねえ 、 $name ？ || An encore? …I can't do a second act without a partner. Can I, $name?
!walkto comp 13 9 up cross

# ---- the rumour, told several ways (R4) ------------------------------------------------------------------------------
@scene ko.rumour_tetsu
# Saltglass, once Manybridge is reached: Tetsu's sailors' version (partly true), then his ferry board as usual.
!faceplayer
tetsu: {西|にし} の {沖|おき} に 、 {無|な}くした {言葉|ことば} が {流|なが}れ{着|つ}く {島|しま} が ある と いう 。 {言|こと}の{葉|は}{島|じま} だ 。 || They say that out west there's an island where lost words wash up. Kotonoha.
tetsu: {船乗|ふなの}り の {話|はなし} で は 、 あそこ で {風|かぜ} に {名前|なまえ} を {叫|さけ}ぶ と 、 {死|し}んだ {者|もの} が {返事|へんじ} を する そう だ 。 …… {俺|おれ} は {叫|さけ}んだ こと は ない が な 。 || Sailors' talk says that if you shout a name into the wind there, the dead answer. …Not that I've ever shouted.
!call mb.ferry_tetsu_again

@scene ko.rumour_shinobu
# Playhouse Row, once Shinobu's own name is on her play: a playwright's version (partly true).
!faceplayer
mp_shinobu: {次|つぎ} の {芝居|しばい} の {話|はなし} 、 {聞|き}いて くれる ？ {西|にし} の {海|うみ} に 、 {出|だ}せなかった {恋文|こいぶみ} が {全部|ぜんぶ} {流|なが}れ{着|つ}く {島|しま} が ある の 。 {恋文|こいぶみ} は {木|き} に なって 、 {花|はな} が {咲|さ}く の よ 。 || Want to hear about my next play? Out in the western sea there's an island where every love letter that was never sent washes up. The letters grow into a tree, and the tree flowers.
mp_shinobu: {港|みなと} の {船乗|ふなの}り に {聞|き}いた {話|はなし} を 、 ちょっと {盛|も}った だけ 。 …… ちょっと よ 。 || I only dressed up a story I heard from a sailor at the docks. …A little.

@scene ko.rumours
# Nami, on the island, answers the mainland's versions: each partly true.
!faceplayer
?(seen.ko.rumour_tetsu) ko_nami[laugh]: {名前|なまえ} を {叫|さけ}ぶ と 、 {死|し}んだ {人|ひと} が {答|こた}える ？ …… {答|こた}えない よ 。 {流|なが}れ{着|つ}く の は 、 {名前|なまえ} じゃ なくて 、 {言|い}えなかった {言葉|ことば} の {方|ほう} 。 || Shout a name and the dead answer? …They don't. What washes up isn't names. It's the words people never managed to say.
?(seen.ko.rumour_shinobu) ko_nami[laugh]: {恋文|こいぶみ} の {木|き} ？ {木|き} は {本当|ほんとう} 。 {花|はな} は {咲|さ}かない 。 それ に 、 {恋文|こいぶみ} だけ じゃ なくて 、 {看板|かんばん} も {札|ふだ} も {来|く}る よ 。 || A tree of love letters? The tree's real. It doesn't flower. And it's not only love letters: signboards and tags come too.
ko_nami: {陸|りく} の {話|はなし} は 、 いつも {半分|はんぶん} だけ {本当|ほんとう} 。 …… {半分|はんぶん} {本当|ほんとう} なら 、 {上等|じょうとう} だ けど ね 。 || The mainland's stories are always half true. …Half true is pretty good, mind.
`);
