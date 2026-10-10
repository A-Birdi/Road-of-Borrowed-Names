/* Manybridge, Chapter 4: Blockprint Row (expansion P09). The way up the Cross Canal, Sōbē's workshop and its blank
 * blocks, the oldest block (the folklore seed: the keepers' word for it, in Tsuru's own words), the press restarted
 * with a notice, the courier guild (Nao), the tonic seller's playbill (Mio), and the shade slips (Ren).
 * Chapter 4's rung (S15): the names in stories and plays; resolve, anger on others' behalf. Nothing here names what a
 * later chapter reveals (S1). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
@scene mp.arrive
# Staged: up the Cross Canal past the drying racks; sheets hang on the lines, blank; Kanta runs to meet you.
!set mp_arrived
!chapter mb2
!gesture pc lookroad up
narr: {運河|うんが} を {上|のぼ}る と 、 {紙|かみ} と {墨|すみ} の {匂|にお}い が {強|つよ}く なった 。 {干|ほ}し{場|ば} の {綱|つな} に 、 {刷|す}った {紙|かみ} が {何百枚|なんびゃくまい} も {下|さ}がって いる 。 || Up the canal, the smell of paper and ink grows stronger. Hundreds of printed sheets hang from the drying lines.
!card {第四章|だいよんしょう} ・ {版木|はんぎ} と {灯|あか}り || Chapter 4 — Manybridge: Blockprint and Footlights
narr: …… {近|ちか}づく と 、 {分|わ}かる 。 {紙|かみ} は 、 どれ も {白|しろ}い 。 {刷|す}った はず の {字|じ} が 、 ない 。 || …Closer, you see it: every sheet is white. The letters that were printed on them are gone.
!look mp_kanta pc
mp_kanta: こっち です ！ {親方|おやかた} の {仕事場|しごとば} は 、 こっち ！ || This way! The master's workshop is this way!
?(comp=nao) comp[think]: {刷|す}った {先|さき} から {白|しろ}く なる の か 。 …… {配達|はいたつ} する {前|まえ} に {消|き}える {手紙|てがみ} だ な 。 || They're going blank as fast as they're printed. …Letters that vanish before they're even delivered.
?(comp=mio) comp[worry]: {全部|ぜんぶ} …… {白|しろ}い 。 {誰|だれ} か が 、 {一枚|いちまい} ずつ {心|こころ} を {込|こ}めて {刷|す}った のに 。 || All of them… white. Someone printed every one of these with care.
?(comp=ren) comp[surprise]: {灯籠|とうろう} の {名札|なふだ} を {刷|す}る {所|ところ} も 、 この {辺|あた}り の はず です 。 …… {急|いそ}ぎましょう 。 || The place that prints the lantern name slips must be round here too. …Let's hurry.
?(comp=suzu) comp[worry]: {刷|す}り{物|もの} の {通|とお}り が 、 {真|ま}っ{白|しろ} …… 。 {芝居|しばい} の {番付|ばんづけ} も 、 ここ で {刷|す}る の よ 。 || Blockprint Row, gone white… This is where the playbills are printed, too.
!quest mp_main start
!journal {版木|はんぎ} の {通|とお}り 。 {刷|す}った {紙|かみ} が {白|しろ}く なって いく 。 {宗兵衛|そうべえ} の {仕事場|しごとば} へ 。 || Blockprint Row. Printed sheets are going blank. To Sōbē's workshop.

@scene mp.kanta_first
!faceplayer
mp_kanta: {親方|おやかた} が {待|ま}って います 。 {中|なか} へ どうぞ ！ || The master's waiting. Go on in!

@scene mp.sobe_first
# Staged: Sōbē at his desk among the racks; he turns a block in his hands; Kanta hovers at the door.
!faceplayer
mp_sobe: …… {八百橋|やおばし} の {橋|はし} に {名前|なまえ} を {戻|もど}した の は 、 あんた たち か 。 {礼|れい} を {言|い}う 。 || …So you're the ones who gave the bridges their names back. My thanks.
!gesture mp_sobe present pc prop=paper
mp_sobe: だが 、 {見|み}て くれ 。 {棚|たな} の {版木|はんぎ} が 、 {毎晩|まいばん} {少|すこ}し ずつ {白|しろ}く なる 。 {札|ふだ} の {版木|はんぎ} も 、 {知|し}らせ の {版木|はんぎ} も 、 {灯籠|とうろう} の {名札|なふだ} の {版木|はんぎ} も だ 。 || But look. The blocks on the racks go a little whiter every night. The plaque blocks, the notice blocks, the blocks for the lantern name slips, all of them.
mp_sobe: {版木|はんぎ} が {白|しろ}ければ 、 {刷|す}った {物|もの} も {白|しろ}い 。 {刷|す}り{場|ば} は 、 もう {三日|みっか} {止|と}まって いる 。 || A blank block prints blank. The press has stood idle three days now.
?(comp=nao) comp: {止|と}めて いる 、 の {間違|まちが}い じゃ ない か ？ {誰|だれ} も {版木|はんぎ} を {信|しん}じなく なった ん だろう 。 || Stood idle, or been stopped? Nobody trusts the blocks any more, I'd guess.
?(comp=mio) comp: {親方|おやかた} 、 {顔色|かおいろ} が よく ない です よ 。 {眠|ねむ}れて います か ？ || Master, you don't look well. Are you sleeping?
?(comp=ren) comp: {灯籠|とうろう} の {名札|なふだ} …… {道|みち} の {先|さき} の {名前|なまえ} を 、 ここ で {刷|す}って いた の です ね 。 || The lantern name slips… so this is where the names of the places ahead were printed.
?(comp=suzu) comp: {番付|ばんづけ} が {刷|す}れない と 、 {芝居小屋|しばいごや} も {困|こま}る わ ね 。 || If the playbills can't be printed, the playhouse is in trouble too.
mp_sobe: {新|あたら}しく {彫|ほ}った {版木|はんぎ} なら 、 まだ {字|じ} が {残|のこ}る 。 {組|く}んだ ばかり の {活字|かつじ} も だ 。 …… {川開|かわびら}き の {知|し}らせ を 、 {一枚|いちまい} {刷|す}って みて くれない か 。 {世話役|せわやく} の トミ さん が 、 {待|ま}って いる 。 || A newly cut block still holds its letters. So does type that's just been set. …Would you try printing one notice for the Opening of the River? Tomi of the festival committee is waiting on it.
?(comp=suzu) comp[smile]: {川開|かわびら}き ！ {花火|はなび} の {上|あ}がる 、 あの お{祭|まつ}り ね 。 || The Opening of the River! The festival with the fireworks.
mp_sobe: {刷|す}り{場|ば} は {隣|となり} だ 。 カンタ が {手伝|てつだ}う 。 {何|なに} を どう {書|か}く か は 、 あんた の {好|す}き に して くれ 。 || The press room is next door. Kanta will help. What you write and how is up to you.
!set mp_sobe_met
!set mp_press_open
!quest mp_main 1
!journal {宗兵衛|そうべえ} の {頼|たの}み ： {刷|す}り{場|ば} で {知|し}らせ を {一枚|いちまい} {刷|す}る 。 || Sōbē's request: print one notice at the press room.

@scene mp.racks
narr: {棚|たな} に {並|なら}んだ {版木|はんぎ} 。 {彫|ほ}った {字|じ} の {溝|みぞ} が 、 {埋|う}まった よう に {平|たい}ら に なって いる 。 || Woodblocks on the racks. The grooves of the cut letters have gone flat, as if filled in.

@scene mp.oldest_block
# The folklore seed (R1): the printers' oldest block, centuries old, in the words Tsuru uses (ch1 rw arrival).
narr: {箱|はこ} に {入|はい}った 、 {一番|いちばん} {古|ふる}い {版木|はんぎ} 。 {黒|くろ}く {光|ひか}って 、 {字|じ} は {一|ひと}つ も {消|き}えて いない 。 || The oldest block, in its box. It is black with age and polish, and not one letter on it has faded.
mp_sobe: {先祖|せんぞ} が {彫|ほ}った もの だ 。 {何百年|なんびゃくねん} も {前|まえ} の 、 {灯守|ひもり} の {心得|こころえ} だ そう だ 。 || My forebears cut that one. A keepers' rule, they say, from hundreds of years ago.
narr: 「{昔|むかし} の {灯守|ひもり} は 、 こういう の を 『しじま』 と {呼|よ}んだ 。」 || "The old keepers had a word for this: shijima."
?(comp=nao) comp[surprise]: …… ツル さん の {言葉|ことば} と 、 {一字|いちじ} も {違|ちが}わない 。 {何百年|なんびゃくねん} {前|まえ} の {版木|はんぎ} が 、 {同|おな}じ こと を {言|い}ってる 。 || …Not one word different from what Tsuru said. A block hundreds of years old says exactly the same.
?(comp=mio) comp[surprise]: ツル さん の {言葉|ことば} と 、 {同|おな}じ …… 。 {昔|むかし} の {昔|むかし} から 、 {同|おな}じ こと が あった の ？ || The same as Tsuru's words… Has this been happening since long, long ago?
?(comp=ren) comp[surprise]: …… ツル さん が {言|い}った こと と 、 {同|おな}じ です 。 {同|おな}じ {言葉|ことば} で 。 {何百年|なんびゃくねん} も {前|まえ} に 、 {誰|だれ} か が {同|おな}じ よう に {彫|ほ}って いた 。 || …It's what Tsuru said. In the same words. Someone cut it just the same, hundreds of years ago.
?(comp=suzu) comp[surprise]: ツル さん の {台詞|せりふ} と 、 そっくり よ 。 {何百年|なんびゃくねん} も {前|まえ} の {台本|だいほん} に 、 {同|おな}じ {台詞|せりふ} が ある みたい 。 || Word for word what Tsuru said. As if a script from hundreds of years ago had the same line.
!note mp_oldest_block
!set mp_ev_block

@scene mp.sobe_press
!faceplayer
mp_sobe: {刷|す}り{場|ば} は {隣|となり} だ 。 {刷|す}れたら 、 {持|も}って きて くれ 。 || The press room's next door. Bring it to me once it's printed.

@scene mp.sobe_printed
# Staged: Sōbē holds the fresh sheet up to the window; the letters stay; he breathes out.
!faceplayer
!gesture mp_sobe read prop=paper
mp_sobe: …… {字|じ} が 、 {残|のこ}って いる 。 {組|く}んだ ばかり の {活字|かつじ} は 、 まだ {大丈夫|だいじょうぶ} だ 。 || …The letters are holding. Freshly set type is still all right.
mp_sobe: {三日|みっか} {止|と}まって いた {刷|す}り{場|ば} が 、 {動|うご}いた 。 {礼|れい} を {言|い}う 。 …… これ で {知|し}らせ は {町|まち} に {出|で}る 。 || The press that stood idle three days has run. My thanks. …Now notices can go out into the city again.
?(comp=ren) !gesture mp_sobe present comp prop=paper
?(comp=ren) mp_sobe: …… あんた 、 {灯守|ひもり} の {弟子|でし} だ な 。 これ を {見|み}て いけ 。 {灯籠|とうろう} の {笠|かさ} に {貼|は}る {名札|なふだ} の {版木|はんぎ} だ 。 {次|つぎ} の {宿場|しゅくば} の {名前|なまえ} を 、 ここ で {彫|ほ}る 。 || …You're a keeper's apprentice, aren't you. Look at this, then. The block for the name slips pasted on lantern shades. We cut the name of the next post town here.
?(comp=ren) comp[think]: {毎晩|まいばん} {灯|ひ} を {入|い}れて いた {名札|なふだ} は 、 ここ で {生|う}まれて いた の です ね 。 …… {彫|ほ}る {人|ひと} の {手|て} を 、 {初|はじ}めて {見|み}ました 。 || The name slips I lit every night were born here. …I've never seen the hands that cut them before.
mp_sobe: {芝居|しばい} の {通|とお}り の マンベエ が 、 {昨日|きのう} {来|き}た 。 {台本|だいほん} の {役|やく} の {名前|なまえ} が 、 {消|き}えて いく と 。 {行|い}って やって くれ 。 {版木|はんぎ} の {通|とお}り の {東|ひがし} だ 。 || Manbē from Playhouse Row came by yesterday. The names of the parts in his script are fading, he says. Go and see him. It's east of Blockprint Row.
!quest mp_main 2
!journal {刷|す}った {知|し}らせ は {消|き}えない 。 {芝居|しばい} の {通|とお}り の マンベエ に {会|あ}う 。 || The new print holds. To Manbē on Playhouse Row.

@scene mp.sobe_idle
!faceplayer
mp_sobe: {版木|はんぎ} は 、 {名前|なまえ} を {覚|おぼ}えて おく {道具|どうぐ} だ 。 {忘|わす}れる {道具|どうぐ} じゃ ない 。 || A woodblock is a tool for remembering names. Not for forgetting them.

@scene mp.sobe_after
!faceplayer
mp_sobe: {棚|たな} の {版木|はんぎ} に 、 {字|じ} が {戻|もど}った 。 {彫|ほ}り{直|なお}す つもり で いた が …… {彫|ほ}らずに {済|す}んだ 。 || The letters came back to the blocks on the racks. I'd meant to cut them all again… I didn't have to.

@scene mp.press
# The press: the activity (src/ui/89p_press.js) once Sōbē has restarted it.
?(!mp_press_open) narr: {刷|す}り{台|だい} は {冷|つめ}たい 。 {誰|だれ} も {使|つか}って いない 。 || The press is cold. Nobody has used it in days.
?(!mp_press_open) !end
narr: {刷|す}り{台|だい} 。 {活字|かつじ} の {箱|はこ} と 、 {墨|すみ} の {壺|つぼ} が {並|なら}んで いる 。 || The press. Cases of type and the ink pot stand ready.
!hook press_open notice

@scene mp.press_proofs
narr: {刷|す}り{上|あ}がった {紙|かみ} が 、 {乾|かわ}く の を {待|ま}って いる 。 || Freshly printed sheets wait to dry.
?(press_printed) narr: あなた の {刷|す}った {一枚|いちまい} も 、 その {中|なか} に ある 。 || Yours is among them.

@scene mp.kanta_press
!faceplayer
?(quest.mp_main=1&!press_notice) mp_kanta: {刷|す}り{台|だい} の {横|よこ} に 、 {活字|かつじ} の {箱|はこ} が あります 。 {一行|いちぎょう} ずつ 、 {好|す}き な {版|はん} を {選|えら}んで ください ！ || The type cases are beside the press. Choose the block you like for each line!
?(quest.mp_main=1&!press_notice) !end
mp_kanta: {刷|す}り{台|だい} は 、 いつ でも {使|つか}って いい って 、 {親方|おやかた} が 。 {話|はなし} でも {知|し}らせ でも ！ || The master says you can use the press any time. Stories or notices!

@scene mp.kanta_after
!faceplayer
mp_kanta: {刷|す}った {物|もの} に 、 {字|じ} が ちゃんと {残|のこ}る 。 {当|あ}たり{前|まえ} の こと が 、 こんな に うれしい なんて 。 || What we print keeps its letters. I never knew something so ordinary could make me so happy.

@scene mp.pressboard
narr: {刷|す}り{場|ば} の {前|まえ} の {掲示板|けいじばん} 。 {刷|す}り{物|もの} が {留|と}めて ある 。 || The board outside the press room, with prints pinned to it.
?(!press_printed) narr: {貼|は}って ある {紙|かみ} は 、 みんな {白|しろ}い 。 || Every sheet pinned here is blank.
?(press_printed) narr: {白|しろ}い {紙|かみ} の {間|あいだ} に 、 あなた の {刷|す}った {一枚|いちまい} が 、 {字|じ} を {残|のこ}して {貼|は}って ある 。 || Among the blank sheets, the one you printed hangs with its letters intact.

@scene mp.tonic_bill
# Mio's seed (14_COMPANIONS): a tonic seller's playbill of cures for a far hot-spring valley; her temper; her bag.
narr: {派手|はで} な {刷|す}り{物|もの} 。 「{遠|とお}い {湯|ゆ} の {谷|たに} の {名薬|めいやく} 。 {腰|こし} の {痛|いた}み 、 {胸|むね} の {痛|いた}み 、 {何|なん} でも {治|なお}る ！」 || A gaudy print: "The wonder tonic of a far hot-spring valley! Bad backs, aching hearts, it cures them all!"
?(comp=mio) comp[angry]: {何|なん} でも {治|なお}る {薬|くすり} なんて 、 ない わ 。 {飲|の}む {人|ひと} の {体|からだ} も 、 {痛|いた}み も 、 {一人|ひとり} ずつ {違|ちが}う のに 。 || There's no medicine that cures everything. Every body, every pain is different.
?(comp=mio) !gesture comp guard
?(comp=mio) narr: ミオ の {手|て} が 、 {一瞬|いっしゅん} 、 {肩|かた} の {鞄|かばん} に {触|ふ}れた 。 {何|なに} も {言|い}わない 。 || For a moment Mio's hand goes to the bag on her shoulder. She says nothing.
?(comp=mio) !set mp_ev_tonic
?(comp=nao) comp: {湯|ゆ} の {谷|たに} か 。 {配達|はいたつ} で {一度|いちど} {行|い}った 。 {湯気|ゆげ} で {手紙|てがみ} が {湿|しめ}る {所|ところ} だ 。 || A hot-spring valley. I went once with a delivery. The steam makes the letters damp.
?(comp=ren) comp: {字|じ} が {大|おお}きい ほど 、 {本当|ほんとう} かどうか {分|わ}からなく なります ね 。 || The bigger the letters, the harder it is to tell if it's true.
?(comp=suzu) comp[laugh]: {口上|こうじょう} が うまい わ ね 。 {役者|やくしゃ} に {向|む}いてる わ 。 || Smooth patter. He'd make a fine actor.

@scene mp.tokube
!faceplayer
mp_tokube: さあ さあ 、 {湯|ゆ} の {谷|たに} の {名薬|めいやく} だ よ ！ {一口|ひとくち} {飲|の}めば 、 {何|なん} でも {治|なお}る ！ || Step up, step up, the wonder tonic of the hot-spring valley! One sip and it cures everything!
?(comp=mio) mp_tokube: お{嬢|じょう}ちゃん に は 、 {難|むずか}しい {話|はなし} か な 。 {薬|くすり} の こと は 、 {大人|おとな} に {任|まか}せ な 。 || Too difficult for a young miss like you, eh? Leave medicine to the grown-ups.
?(comp=mio) comp[angry]: …… {私|わたし} は 、 {葦|あし}ノ{瀬|せ} の {薬師|くすし} です 。 {何|なに} が {入|はい}って いる か 、 {言|い}えます か ？ {言|い}えない なら 、 {売|う}らないで ください 。 || …I'm the apothecary of Reedwake. Can you tell me what's in it? If you can't, please don't sell it.
?(comp=mio) mp_tokube: いや …… それ は 、 {秘伝|ひでん} で …… 。 || Well… that's a secret recipe…
?(comp!=mio) comp: {何|なん} でも {治|なお}る は 、 {何|なに} も {治|なお}らない と {同|おな}じ かも ね 。 || "Cures everything" might be the same as "cures nothing".

@scene mp.hayate
# Nao's thread here (14_COMPANIONS): the courier guild, a rival who has heard of them.
!faceplayer
mp_hayate: {飛脚|ひきゃく} の {組合|くみあい} へ ようこそ 。 {版木|はんぎ} が {白|しろ}く なって 、 {宛名|あてな} の {札|ふだ} も {刷|す}れない 。 {口|くち} で {覚|おぼ}えて {走|はし}る しか ない ぜ 。 || Welcome to the courier guild. With the blocks gone blank we can't print address tags. We run with the addresses in our heads.
?(comp=nao) mp_hayate: …… あんた 、 {灯|ひ} の {道|みち} の ナオ か 。 {一度|いちど} も {手紙|てがみ} を {落|お}とした こと が ない って いう 。 || …You're Nao, of the lantern roads. The one who's never dropped a letter, they say.
?(comp=nao) comp[smirk]: {落|お}とした こと は ある 。 {拾|ひろ}った だけ だ 。 || I've dropped plenty. I just picked them up again.
?(comp=nao) mp_hayate: はは ！ {噂|うわさ} より {正直|しょうじき} だ な 。 {今度|こんど} 、 {八百橋|やおばし} から {潮硝子|しおがらす} まで 、 どっち が {早|はや}い か {競|きそ}おう ぜ 。 || Ha! More honest than the stories. Some day let's race from Manybridge to Saltglass and see who's faster.
?(comp=nao) !set mp_ev_hayate

@scene mp.hayate_after
!faceplayer
mp_hayate: {宛名|あてな} の {札|ふだ} が {刷|す}れる 。 {頭|あたま} が {軽|かる}く なった ぜ 。 || We can print address tags again. My head feels lighter already.

@scene mp.guild_board
narr: {飛脚|ひきゃく} の {組合|くみあい} の {掲示板|けいじばん} 。 「{本日|ほんじつ} の {便|びん} ： {潮硝子|しおがらす} 、 {葦|あし}ノ{瀬|せ} 。 {北|きた} の {道|みち} は {橋|はし} の {修理|しゅうり} {中|ちゅう} 。」 || The courier guild's board: "Today's runs: Saltglass, Reedwake. The north road: bridge under repair."

@scene mp.guild_box
narr: {組合|くみあい} の {郵便箱|ゆうびんばこ} 。 {投|な}げ{込|こ}まれた {手紙|てがみ} の {宛名|あてな} が 、 {半分|はんぶん} {白|しろ}い 。 || The guild's postbox. Half the addresses on the letters dropped in it have gone blank.

@scene mp.sign_blockprint
narr: 「{版木|はんぎ} の {通|とお}り 。 {南|みなみ} に {札場|ふだば} 、 {東|ひがし} に {芝居|しばい} の {通|とお}り 。」 || "Blockprint Row. South to the Tally Exchange; east to Playhouse Row."

@scene mp.door_kanta
narr: カンタ と ミヨ の {家|いえ} 。 {戸|と} は {閉|し}まって いる 。 || Kanta and Miyo's house. The door is shut.

@scene mp.door_locked
narr: {戸|と} は {閉|し}まって いる 。 || The door is shut.
`, 'mp/20_scenes_print.js');
