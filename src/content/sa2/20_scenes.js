/* The last chapter in a twelve-chapter journey (expansion P14; docs/future/work/P14_INTEGRATION.md): the hushed voice at
 * the Archive's gate (10_STORY.md §6a, sealed S15), each companion's second arc reaching its ending at the bridge
 * (14_COMPANIONS.md §2 step 7, sealed S14), and the ending's romance moment (10_STORY.md §7a; C-63, C-67).
 *
 * The arcs' endings are called from inside the companion's ending (src/content/pages/20_ending.js, end.<comp>.c), only
 * in a twelve-chapter journey; what each says depends on what the journey really holds (the crossroads kept or not).
 *   Nao   a forwarding address, written for the first time; you choose where it is.
 *   Mio   her shelves' honest labels, and the one jar with none, for whatever she hasn't decided yet.
 *   Ren   the answer to Hisae: a keeper who walks the road, as the order once did.
 *   Suzu  her play's opening night, and the troupe that will fill the seats.
 * The romance moment: the player's choice, holding hands or a kiss, or standing together as the closest of friends;
 * the companion's yes in their own voice; Bond the same either way; offered when the bond is close (trusted or more).
 * Suzu's lines have Kansai versions (src/content/dialect/kansai_99_sa2.js). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
@scene sa2.hushed
# At the gate, near the Hush's source: the wind stops, the water goes silent, and for a few lines the companion's voice
# is gone. Their mouth moves; nothing comes. You call their name, and it comes back. Never permanent; nobody is hurt.
!set sa2_hushed
!music -
narr: {風|かぜ} が {止|や}んだ 。 {水|みず} の {音|おと} も 、 {自分|じぶん} の {足音|あしおと} も 、 {聞|き}こえない 。 || The wind drops. The water, your own footsteps: you can hear nothing.
?(comp=nao) !gesture comp aside
?(comp=mio) !gesture comp lowered
?(comp=ren) !gesture comp lowered
?(comp=suzu) !gesture comp aside
comp: …… || …
?(comp=nao) narr: ナオ の {口|くち} が {動|うご}いた 。 {声|こえ} が 、 {出|で}ない 。 ナオ は {喉|のど} に {手|て} を {当|あ}てた 。 || Nao's mouth moves. No voice comes. Nao puts a hand to their throat.
?(comp=mio) narr: ミオ の {口|くち} が {動|うご}いた 。 {声|こえ} が 、 {出|で}ない 。 ミオ は {胸|むね} に {手|て} を {当|あ}てた 。 || Mio's mouth moves. No voice comes. Mio puts a hand to her chest.
?(comp=ren) narr: レン の {口|くち} が {動|うご}いた 。 {声|こえ} が 、 {出|で}ない 。 レン は {灯|ひ} を {強|つよ}く {握|にぎ}った 。 || Ren's mouth moves. No voice comes. Ren grips the lamp tight.
?(comp=suzu) narr: スズ の {口|くち} が {動|うご}いた 。 {声|こえ} が 、 {出|で}ない 。 スズ は {笑|わら}おう と して 、 {途中|とちゅう} で やめた 。 || Suzu's mouth moves. No voice comes. She tries to laugh, and stops halfway.
narr: {声|こえ} が 、 {名前|なまえ} の よう に {取|と}られて しまった 。 …… {名前|なまえ} を {呼|よ}べば 、 {届|とど}く かも しれない 。 || The voice has been taken, the way names are. …If you call their name, it might reach.
:call
?(comp=nao) !challenge sa2.name_nao
?(comp=mio) !challenge sa2.name_mio
?(comp=ren) !challenge sa2.name_ren
?(comp=suzu) !challenge sa2.name_suzu
!if var._res=0 -> again
!goto back
:again
narr: もう {一度|いちど} 。 {名前|なまえ} は 、 {一|ひと}つ だけ 。 || Once more. There is only one name.
!goto call
:back
!set sa2_voice_back
narr: {名前|なまえ} を {呼|よ}んだ 。 {自分|じぶん} の {声|こえ} が 、 {聞|き}こえた 。 || You call their name. You can hear your own voice.
?(comp=nao) nao[closed]: …… {聞|き}こえた 。 {名前|なまえ} だけ は 、 ちゃんと {届|とど}いた 。 …… {一番|いちばん} {大事|だいじ} な {郵便|ゆうびん} だ な 。 || …I heard it. My name, at least, got through. …The most important post there is.
?(comp=mio) mio[closed]: …… {聞|き}こえた 。 {名前|なまえ} を {呼|よ}んで もらう と 、 {声|こえ} って {戻|もど}る ん だ ね 。 {薬|くすり} に は 、 できない こと 。 || …I heard it. When someone calls your name, your voice comes back. That's something no medicine can do.
?(comp=ren) ren[closed]: …… {名前|なまえ} を {呼|よ}ばれました 。 {灯|ひ} と {同|おな}じ です 。 {名前|なまえ} を {呼|よ}べば 、 {灯|ひ} は {応|こた}える 。 …… ありがとう ございます 。 || …You called my name. It's the same as a lamp: call its name, and it answers. …Thank you.
?(comp=suzu) suzu[surprise]: …… {出|で}た ！ {声|こえ} 、 {出|で}た ！ …… もう 、 {台詞|せりふ} が {飛|と}んだ {役者|やくしゃ} の {気分|きぶん} 。 {二度|にど} と ごめん よ 。 || …It's back! My voice, it's back! …That felt like an actor whose lines have gone. Never again, thank you.
narr: {遠|とお}く で 、 {水|みず} の {音|おと} が {戻|もど}って きた 。 || Far off, the sound of water comes back.
!music sa_drone
!journal {書庫|しょこ} の {門|もん} で 、 {相棒|あいぼう} の {声|こえ} が {一度|いちど} {消|き}えた 。 {名前|なまえ} を {呼|よ}んだら 、 {戻|もど}った 。 || At the Archive's gate your companion's voice was gone for a moment. When you called their name, it came back.

@scene sa2.end_nao
# Nao's ending (S14): a forwarding address, the first they have ever written; the player chooses where it is.
?(comp=nao) !gesture comp present pc prop=tags hold
nao: …… それ と 、 もう {一枚|いちまい} 。 || …And one more.
narr: ナオ は {新|あたら}しい ラベル に 、 {自分|じぶん} の {名前|なまえ} を {書|か}いた 。 {宛先|あてさき} の {欄|らん} は 、 {空|あ}いて いる 。 || Nao writes their own name on a fresh label. The space for the address is empty.
nao: {転送先|てんそうさき} だ 。 {手紙|てがみ} が {俺|おれ} を {追|お}いかけて {来|こ}られる よう に 。 …… {今|いま} まで 、 {一度|いちど} も {書|か}いた こと が ない 。 || A forwarding address. So letters can catch up with me. …I've never once written one.
?(cr_nao_crossroads) nao: サキチ さん に {言|い}われた 。 {届|とど}く {場所|ばしょ} が ない と 、 {待|ま}つ {方|ほう} が {疲|つか}れる って 。 || Sakichi told me. With nowhere for letters to reach, it's the one waiting who wears out.
nao: どこ に する か 、 $name が {決|き}めて くれ 。 || You decide where.
!choice
* {葦|あし}ノ{瀬|せ} の {灯|あか}り{堂|どう} || The Lantern Hall in Reedwake -> hall
* {霧下|きりした} の {宿|しゅく} || The station at Kirishita -> station
* $name の {所|ところ} || Wherever you are -> you
:hall
!hook co_note nao_address hall
nao: {灯|あか}り{堂|どう} か 。 ツル さん なら 、 {手紙|てがみ} を なくさない 。 …… {毎朝|まいあさ} 、 {読|よ}み{上|あ}げられそう だ けど な 。 || The Lantern Hall. Tsuru won't lose a letter. …Though she'll probably read them out every morning.
!goto done
:station
!hook co_note nao_address station
nao: {霧下|きりした} か 。 …… サキチ さん の {棚|たな} に 、 また {俺|おれ} の {段|だん} が できる な 。 {今度|こんど} は 、 ちゃんと {取|と}り に {行|い}く 。 || Kirishita. …There'll be a shelf for me at Sakichi's again. This time I'll actually go and collect them.
!goto done
:you
!hook co_note nao_address you
nao[shy]: …… $name の {所|ところ} 。 {住所|じゅうしょ} は 、 {書|か}かなくて いい な 。 {俺|おれ} が {知|し}ってる から 。 || …Wherever you are. No need to write the address. I know it.
:done
?(comp=nao) !gesture comp nod pc
narr: ナオ は ラベル を 、 {鞄|かばん} の {内側|うちがわ} に {貼|は}った 。 || Nao sticks the label inside the satchel.
nao[smile]: これ で 、 {俺|おれ} に も {届|とど}く 。 || Now things can reach me too.

@scene sa2.end_mio
# Mio's ending (S14): her own shelves, an honest label on every one; the one jar with no label, kept for whatever she
# hasn't decided yet.
narr: {棚|たな} の {札|ふだ} に は 、 {効|き}く こと と 、 {効|き}かない こと が 、 {両方|りょうほう} {書|か}いて ある 。 || Each label on the shelves says what the remedy does, and what it doesn't.
?(yn_mio_back) mio: キクエ さん の {札|ふだ} の {真似|まね} 。 …… {正直|しょうじき} な {札|ふだ} は 、 {書|か}く の に {時間|じかん} が かかる の 。 || I copied Kikue's labels. …Honest labels take a long time to write.
?(!yn_mio_back) mio: {正直|しょうじき} な {札|ふだ} は 、 {書|か}く の に {時間|じかん} が かかる 。 でも 、 {嘘|うそ} の {札|ふだ} より 、 {夜|よる} よく {眠|ねむ}れる の 。 || Honest labels take a long time to write. But I sleep better than I would with lying ones.
?(comp=mio) !gesture comp point up
narr: {棚|たな} の {一番|いちばん} {奥|おく} に 、 {札|ふだ} の ない {瓶|びん} が {一|ひと}つ ある 。 || At the very back of the shelf there is one jar with no label.
mio: これ は 、 その まま 。 {決|き}めて いない こと の {場所|ばしょ} 。 …… {中身|なかみ} は 、 だいぶ {減|へ}った よ 。 || That one stays as it is. A place for what I haven't decided yet. …There's a lot less in it now.
?(yn_mio_back) mio[smile]: {一番|いちばん} {古|ふる}い {紙|かみ} は 、 もう {入|はい}って ない 。 {返事|へんじ} を した から 。 || The oldest scrap isn't in there any more. I answered it.
?(!yn_mio_back) mio[smile]: いつか 、 {全部|ぜんぶ} に {返事|へんじ} を する 。 {急|いそ}がず に 。 || One day I'll answer all of them. Without hurrying.

@scene sa2.end_ren
# Ren's ending (S14): the answer to Hisae, a keeper who walks the road as the order once did; the relay will carry it.
?(comp=ren) !gesture comp present pc
narr: レン は {懐|ふところ} から 、 {封|ふう} を した {手紙|てがみ} を {出|だ}した 。 {宛名|あてな} は 「 {灯守|ひもり} の {道|みち} 、 ヒサエ {様|さま} 」 。 || Ren takes a sealed letter from inside their robe. It is addressed: "The Keepers' Road, to Hisae."
?(kr_ren_crossroads) ren: ヒサエ さん へ の {返事|へんじ} です 。 {灯守|ひもり} の {道|みち} の {番|ばん} に は 、 なりません 。 …… でも 、 {道|みち} を {歩|ある}く {灯守|ひもり} に なります 。 {昔|むかし} の {灯守|ひもり} が 、 そう して いた よう に 。 || My answer to Hisae. I won't stay as the keeper of the Keepers' Road. …But I'll be a keeper who walks the road, the way the keepers once did.
?(!kr_ren_crossroads) ren: {灯守|ひもり} の {道|みち} の ヒサエ さん に 、 {手紙|てがみ} を {書|か}きました 。 {道|みち} を {歩|ある}く {灯守|ひもり} に なります 、 と 。 {昔|むかし} の {灯守|ひもり} が 、 そう して いた よう に 。 || I've written to Hisae on the Keepers' Road. That I'll be a keeper who walks the road, the way the keepers once did.
ren: {継|つ}ぎ{飛脚|びきゃく} に {頼|たの}んで もらえます か 。 …… わたし が {持|も}って {行|い}く と 、 {迷|まよ}う ので 。 || Could you ask the relay to take it? …If I carry it myself, I'll get lost.
?(comp=ren) !gesture comp handover pc
?(comp=ren) !gesture pc receive comp
narr: {手紙|てがみ} は 、 {灯|ひ} の {温|ぬく}もり で {少|すこ}し {温|あたた}かかった 。 || The letter is a little warm from the lamp.

@scene sa2.end_suzu
# Suzu's ending (S14): the play's opening night in Manybridge's Playhouse Row; the troupe will fill the seats; her
# partner is you.
?(yn_suzu_books) suzu: コウメ から {手紙|てがみ} 。 {初日|しょにち} は {八百橋|やおばし} の {芝居町|しばいまち} で やれ って 。 {一座|いちざ} が 、 {客席|きゃくせき} を {埋|う}めて くれる って 。 || A letter from Koume. She says to open in Manybridge's Playhouse Row. The troupe will fill the seats.
?(!yn_suzu_books) suzu: {初日|しょにち} は 、 {八百橋|やおばし} の {芝居町|しばいまち} が いい な 。 あそこ の {客|きゃく} は 、 {笑|わら}い{方|かた} を {知|し}ってる 。 || Opening night: Manybridge's Playhouse Row, I think. The audience there knows how to laugh.
?(comp=suzu) !gesture comp point pc
suzu[laugh]: もちろん 、 {相方|あいかた} は あなた よ 。 {台詞|せりふ} は 、 まだ {一行|いちぎょう} も ない けど 。 || Your part's my partner, of course. Not that you've got a single line yet.

@scene sa2.romance
# The ending's romance moment (10_STORY §7a; C-63, C-67): offered when the bond is close; the player's choice, a hand
# held or a kiss, or standing together as the closest of friends. The companion's yes in their own voice; nothing
# explicit; Bond the same either way (nothing here awards it).
narr: {最後|さいご} の {光|ひかり} が 、 {川|かわ} の {上|うえ} から {消|き}えて いく 。 {二人|ふたり} の {間|あいだ} は 、 {半歩|はんぽ} しか ない 。 || The last light is leaving the river. There is only half a step between the two of you.
!choice
* {手|て} を つなぐ || Hold hands -> hand
* キス を する || A kiss -> kiss
* {一番|いちばん} の {友|とも} と して 、 {隣|となり} に {立|た}つ || Stand side by side, as the closest of friends -> friend
:hand
!hook co_note end_romance hand
?(comp=nao) nao[shy]: …… ああ 。 {離|はな}す な よ 。 {出口|でぐち} は 、 {確|たし}かめなくて いい 。 || …Yeah. Don't let go. No need to check the exits.
?(comp=mio) mio[smile]: …… はい 。 {手|て} 、 {温|あたた}かい ね 。 {今日|きょう} は 、 {薬|くすり} の {匂|にお}い が しない 。 || …Yes. Your hand's warm. And today it doesn't smell of medicine.
?(comp=ren) ren[smile]: …… はい 。 {迷子|まいご} に ならない よう に 、 で は なくて 。 そう したい から です 。 || …Yes. Not so that I don't get lost. Because I want to.
?(comp=suzu) suzu[shy]: …… うん 。 {台詞|せりふ} なし で いい 。 {一番|いちばん} {効|き}く {場面|ばめん} だ から 。 || …Mm. No lines needed. It's the scene that lands hardest.
narr: {日|ひ} が {沈|しず}む まで 、 {二人|ふたり} は {手|て} を つないで いた 。 || You hold hands until the sun is down.
!end
:kiss
!hook co_note end_romance kiss
?(comp=nao) nao[shy]: …… {聞|き}く な よ 。 …… いい 。 || …Don't ask. …Yes.
?(comp=mio) mio[shy]: …… はい 。 {私|わたし} も 、 そう したかった 。 || …Yes. I wanted that too.
?(comp=ren) ren[shy]: …… はい 。 {師匠|ししょう} の {教|おし}え に は 、 ない こと です けど 。 || …Yes. It isn't in any of my teacher's sayings, mind.
?(comp=suzu) suzu[shy]: …… うん 。 {今|いま} の は 、 {台本|だいほん} に {書|か}かない 。 {二人|ふたり} だけ の {場面|ばめん} 。 || …Mm. That one's not going in the script. A scene just for the two of us.
narr: {短|みじか}い キス 。 {川|かわ} の {音|おと} だけ が 、 {聞|き}いて いた 。 || A brief kiss. Only the river is listening.
!end
:friend
!hook co_note end_romance friend
?(comp=nao) nao[smile]: ああ 。 {隣|となり} が {一番|いちばん} {歩|ある}きやすい 。 {相棒|あいぼう} 。 || Yeah. Beside you is the easiest place to walk. Partner.
?(comp=mio) mio[smile]: うん 。 {隣|となり} に いて くれる の が 、 {一番|いちばん} {安心|あんしん} する 。 || Yes. Having you beside me is what makes me feel safest.
?(comp=ren) ren[smile]: {一番|いちばん} の {友|とも} 。 …… {灯|ひ} の {名前|なまえ} より 、 {大事|だいじ} に {覚|おぼ}えて おきます 。 || My closest friend. …I'll keep that more carefully than any lamp's name.
?(comp=suzu) suzu[laugh]: {相方|あいかた} は {並|なら}んで {立|た}つ もの よ 。 {舞台|ぶたい} でも 、 {道|みち} でも 。 …… {最後|さいご} まで 、 {一緒|いっしょ} に ね 。 || Partners stand side by side. On stage, and on the road. …All the way, together.
narr: {二人|ふたり} は {並|なら}んで 、 {日|ひ} が {沈|しず}む の を {見|み}て いた 。 || Side by side, you watch the sun go down.
`, 'sa2/scenes');
