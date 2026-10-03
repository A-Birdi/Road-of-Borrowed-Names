/* Chapter 2 main quest, acts 1–2: the harbourmaster, the three
 * contradictions, following the cargo, and Wataru. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
@scene sg.omi_intro
# Staged: Ōmi keeps writing through her first words; at "Reedwake too?" her working hand stops and she looks
# up at you; she separates the three troubles with both hands and makes her point with a flat downward hand;
# she looks over at your companion as they speak (each answers in their own way) and back; she counts the
# three troubles, and shakes her head at the ghost story.
!pose omi write1
!prop omi brush
omi: {客|きゃく} か 。 {悪|わる}い が 、 {船|ふね} の {予定|よてい} なら {答|こた}えられない よ 。 {予定表|よていひょう} が {毎日|まいにち} {勝手|かって} に {書|か}き{変|か}わる ん で ね 。 || Visitors? Sorry — if it's about sailings, I can't tell you. The schedule rewrites itself every day.
!gesture pc palm omi
pc: {葦|あし}ノ{瀬|せ} から {来|き}ました 。 {嵐|あらし} の {後|あと} 、 {名前|なまえ} や ラベル が {消|き}えて いる {件|けん} で 。 || We've come from Reedwake — about the names and labels vanishing since the storm.
!pose omi -
!prop omi -
!gesture omi listen pc
omi[surprise]: …… {葦|あし}ノ{瀬|せ} でも か 。 まあ 、 {座|すわ}りな 。 || …Reedwake too? Well, sit down.
omi: {港長|こうちょう} の オウミ だ 。 {三十年|さんじゅうねん} この {港|みなと} を {回|まわ}して きた が 、 こんな の は {初|はじ}めて だ よ 。 || I'm Ōmi, harbourmaster. Thirty years running this port, and I've never seen the like.
!gesture omi size
omi: {荷札|にふだ} が {白|しろ}く なる 。 {手紙|てがみ} の {宛名|あてな} が {消|き}える 。 {渡|わた}し{場|ば} の {時刻表|じこくひょう} は 、 {朝|あさ} と {昼|ひる} で {言|い}う こと が {違|ちが}う 。 || Cargo tags go blank. Addresses vanish from letters. The ferry board says one thing in the morning and another at noon.
!gesture omi emphatic
omi[think]: {港|みなと} って の は 、 {字|じ} で {動|うご}いてる ん だ 。 {字|じ} が {嘘|うそ} を {言|い}い{出|だ}したら 、 {何|なに} も {動|うご}かない 。 || A harbour runs on writing. When the writing starts lying, nothing moves.
!look omi comp
?(comp=nao) !gesture comp nod omi
?(comp=mio) !gesture comp guard
?(comp=ren) !gesture comp palm omi
?(comp=suzu) !gesture comp shrug
?(comp=nao) comp: {配達人|はいたつにん} も {同|おな}じ だ 。 {宛名|あてな} が {読|よ}めなきゃ 、 ただ の {紙|かみ} を {運|はこ}んでる だけ 。 || Same for couriers. If you can't read the address, you're just carrying paper around.
?(comp=mio) comp: お{察|さっ}し します 。 わたし の {店|みせ} でも 、 {薬|くすり} の ラベル が {消|き}えて {大変|たいへん} でした 。 || I understand. At my shop the medicine labels vanished too. It was awful.
?(comp=ren) comp: {灯|ひ} の {道|みち} の {名前|なまえ} も 、 {同|おな}じ よう に {消|き}えて います 。 {無関係|むかんけい} と は {思|おも}えません 。 || The names on the lantern roads are fading the same way. I can't believe it's unrelated.
?(comp=suzu) comp: {字|じ} が {嘘|うそ} を つく 、 か 。 …… {役者|やくしゃ} より {質|たち} が {悪|わる}い わ ね 。 || Writing that lies. …Worse than actors.
!look omi pc
!gesture omi count
omi: {手|て} を {貸|か}して くれる なら 、 {助|たす}かる 。 {特|とく}に {困|こま}ってる の は {三|みっ}つ だ 。 || If you'll lend a hand, I'd be grateful. Three things are giving me the most grief.
omi: {一|ひと}つ 、 {二番|にばん}{倉庫|そうこ} の {荷|に} 。 {係|かかり} の ワタル が 、 {数|かず} が {合|あ}わない と {言|い}ってる 。 || One: the cargo in No. 2 warehouse. The clerk, Wataru, says the counts don't add up.
omi: {二|ふた}つ 、 かもめ{亭|てい} に {溜|た}まった {郵便|ゆうびん} 。 {宛名|あてな} の {消|き}えた {手紙|てがみ} が {山|やま} ほど ある 。 || Two: the post piling up at the Gull. Heaps of letters with the addresses gone.
omi: {三|みっ}つ 、 {渡|わた}し{場|ば} の {時刻表|じこくひょう} 。 テツ の {爺|じい}さん に {聞|き}いて くれ 。 || Three: the ferry board at the landing. Ask old Tetsu.
pc: {沈|しず}んだ {書庫|しょこ} の {噂|うわさ} を {聞|き}いて {来|き}た の です が 。 || We also came because of a rumour about a sunken archive.
!gesture omi shake
omi: …… {沈|しず}んだ {書庫|しょこ} ？ ああ 、 {岬|みさき} の {沖|おき} の やつ か 。 {子|こ}ども の {怪談|かいだん} だ よ 。 まず は {港|みなと} を {片付|かたづ}けて から に しな 。 || …The sunken archive? Oh, the one off the point. That's a children's ghost story. Sort out the harbour first.
!quest sg_main 1
!journal {倉庫|そうこ} 、 {郵便|ゆうびん} 、 {時刻表|じこくひょう} 。 {三|みっ}つ を {調|しら}べる 。 || The warehouse, the post, the ferry board: look into all three.

@scene sg.omi_checking
omi: {倉庫|そうこ} 、 {郵便|ゆうびん} 、 {渡|わた}し{場|ば} 。 {全部|ぜんぶ} {見|み}たら 、 {戻|もど}って きて くれ 。 || The warehouse, the post, the landing. Come back once you've seen all three.
?(!sg_crates_done) omi: ワタル は {真面目|まじめ} すぎる くらい の {男|おとこ} だ 。 {数|かず} が {合|あ}わない と 、 {眠|ねむ}れない らしい 。 || Wataru's almost too conscientious. If the numbers don't match, he can't sleep, apparently.
?(!sg_post_done) omi: かもめ{亭|てい} の タマエ は 、 {昼|ひる} が {一番|いちばん} {忙|いそが}しい 。 {手伝|てつだ}えば 、 {話|はなし} が {早|はや}い よ 。 || Tamae at the Gull is busiest at lunch. Lend a hand and she'll talk faster.
?(!sg_ferry_done) omi: テツ は {口|くち} が {重|おも}い が 、 {潮|しお} の こと なら {誰|だれ} より {知|し}ってる 。 || Tetsu doesn't say much, but no one knows the tides better.

@scene sg.office_desk
narr: {港長|こうちょう} の {机|つくえ} 。 {書類|しょるい} の {山|やま} の {上|うえ} に 、 {冷|さ}めた お{茶|ちゃ} が {置|お}いて ある 。 {三杯|さんばい} も 。 || The harbourmaster's desk. On top of a mountain of papers sit cups of cold tea. Three of them.
?(comp=mio) comp: （{湯呑|ゆの}み 、 {片付|かたづ}けたい …… 。 {我慢|がまん} 、 {我慢|がまん} 。） || (I want to clear those cups away… Resist. Resist.)

@scene sg.office_chart
narr: {壁|かべ} に {港|みなと} の {海図|かいず} 。 {岬|みさき} の {沖|おき} に {小|ちい}さな {島|しま} が {描|か}かれ 、 {赤|あか}い {字|じ} で 「{近|ちか}づく な 」 。 || A chart of the harbour on the wall. A small island is drawn off the point, with "Keep away" in red.
narr: {島|しま} の {名前|なまえ} の {所|ところ} だけ 、 {紙|かみ} が {白|しろ}い 。 || Only where the island's name should be is the paper blank.

@scene sg.wataru_first
# Staged: Wataru starts up from his counting; an open hand at the mess; his hands twist over the storm; he
# turns away to his ledger as he says he will check it; your companion's aside is their own look at him (Nao
# and Mio lean in to watch him, Suzu looks between him and you, Ren straightens their glasses).
!set sg_wataru_met
!gesture wataru flinch pc
wataru[surprise]: あっ 、 すみません 、 {今|いま} {数|かぞ}えて いて …… 。 {港長|こうちょう} の お{使|つか}い の {方|かた} です か 。 || Oh — sorry, I was in the middle of counting… Are you the people the harbourmaster sent?
!gesture wataru palm
wataru: {倉庫|そうこ} {係|がかり} の ワタル です 。 {見|み}て の とおり 、 {荷札|にふだ} が めちゃくちゃ で …… 。 || I'm Wataru, the warehouse clerk. As you can see, the tags are a complete mess…
!gesture wataru fidget
wataru[worry]: {嵐|あらし} の {夜|よる} に 、 ラベル が {全部|ぜんぶ} {剥|は}がれて しまった ん です 。 {貼|は}り{直|なお}した ん です が 、 {朝|あさ} に なる と また {字|じ} が {変|か}わって いて 。 || On the night of the storm, the labels all came off. I stuck them back on, but by morning the writing had changed again.
!look wataru 1,6
wataru: よかったら 、 {箱|はこ} を {見|み}て みて ください 。 {僕|ぼく} は …… {帳簿|ちょうぼ} を {確認|かくにん} します ので 。 || Please, look at the crates if you like. I'll… check the ledger.
?(comp=nao) !gesture comp observe wataru
?(comp=suzu) !gesture comp lookbetween wataru and=pc
?(comp=mio) !gesture comp observe wataru
?(comp=ren) !gesture comp glasses
?(comp=nao) comp: （{字|じ} の {綺麗|きれい} な {人|ひと} だ 。 {帳簿|ちょうぼ} を {持|も}つ {手|て} が 、 {少|すこ}し {震|ふる}えてる けど 。） || (Neat handwriting, this one. His hands are shaking a bit on that ledger, though.)
?(comp=suzu) comp: （{帳簿|ちょうぼ} を {閉|と}じる の が 、 ちょっと {早|はや}かった わ ね 。） || (He shut that ledger a little too quickly.)
?(comp=mio) comp: （{顔色|かおいろ} が {悪|わる}い 。 {寝|ね}て ない の かな 。） || (He looks pale. Isn't he sleeping?)
?(comp=ren) comp: （{几帳面|きちょうめん} な {方|かた} です ね 。 {棚|たな} の {箱|はこ} の {角|かど} が 、 {全部|ぜんぶ} {揃|そろ}って いる 。） || (A meticulous man. Every crate on the shelves is squared up exactly.)

@scene sg.wataru_busy
wataru: {箱|はこ} は {自由|じゆう} に {見|み}て ください 。 {僕|ぼく} は …… {数|かず} を {合|あ}わせない と 。 || Look at the crates as much as you like. I have to… make the numbers match.
?(sg_wataru_confessed&!sg_wataru_resolved) wataru[sad]: …… {港長|こうちょう} に 、 {全部|ぜんぶ} {話|はな}します 。 || …I'll tell the harbourmaster everything.

@scene sg.crate_blank
# Staged: you lean in to the label that will not keep still; your companion's own reaction (Ren leans in
# too, Nao looks between it and you, Mio's hand to her chest, Suzu looks away).
!set sg_crate_blank
!gesture pc observe 4,3 hold
narr: {木箱|きばこ} の ラベル を {見|み}る 。 {字|じ} が {薄|うす}く なり 、 また {浮|う}かび 、 また {消|き}える 。 || You look at the crate's label. The writing fades, surfaces again, fades again.
narr: {紙|かみ} は {古|ふる}く 、 {糊|のり} も {乾|かわ}いて いる 。 {誰|だれ} も {触|さわ}って いない 。 {字|じ} だけ が 、 {勝手|かって} に {動|うご}いて いる 。 || The paper is old and the paste is dry. No one has touched it. Only the writing moves, by itself.
?(comp=ren) !gesture comp observe 4,3
?(comp=nao) !gesture comp lookbetween 4,3 and=pc
?(comp=mio) !gesture comp guard
?(comp=suzu) !gesture comp aside
?(comp=ren) comp[think]: {灯籠|とうろう} の {名前|なまえ} が {消|き}える とき と 、 {同|おな}じ {揺|ゆ}れ{方|かた} です 。 {静寂|しじま} の しわざ でしょう 。 || It wavers just the way lantern names do when they fade. This is the Hush's doing.
?(comp=nao) comp: {誰|だれ} も {触|さわ}って ない のに 、 {字|じ} が {動|うご}いてる 。 …… {気味|きみ} が {悪|わる}い な 。 || No one's touched it, and the writing's moving. …Creepy.
?(comp=mio) comp[worry]: {誰|だれ} も {触|さわ}って ない のに 、 {字|じ} が {動|うご}いてる 。 {葦|あし}ノ{瀬|せ} と {同|おな}じ …… 。 || No one's touched it and the writing moves. Just like in Reedwake…
?(comp=suzu) comp[worry]: {種|たね} も {仕掛|しか}け も ない の が 、 {一番|いちばん} {怖|こわ}い わ 。 || No trick, no hidden wire. That's the scariest kind.
!note sg_hush_labels
!call sg.crates_check

@scene sg.crate_glued
# Staged: you lean in to the new label and reach to lift its corner; your companion's own reaction (Nao and
# Mio lean in to the hand and the paste, Ren pushes their glasses up, Suzu an open hand: an old trick); at
# "someone's hand" you turn to look at Wataru.
!set sg_crate_glued
!gesture pc observe 8,3 hold
narr: この {箱|はこ} の ラベル は {新|あたら}しい 。 {糊|のり} が まだ {柔|やわ}らかい 。 {字|じ} は {動|うご}かない 。 || This crate's label is new. The paste is still soft. The writing doesn't move.
!gesture pc handover 8,3
narr: 「{嵐|あらし} で {破損|はそん} ・ {廃棄|はいき}」 。 {端|はし} を めくる と 、 {下|した} に {古|ふる}い ラベル が ある 。 「{灯台|とうだい} {行|ゆ}き ・ {灯油|とうゆ} {四缶|よんかん}」 。 || "Damaged in storm — for disposal." Lift the corner, and there's an older label underneath: "To the lighthouse — lamp oil, four cans."
narr: {箱|はこ} を {揺|ゆ}らす と 、 {中|なか} で {油|あぶら} が ちゃぷん と {鳴|な}った 。 {壊|こわ}れて など いない 。 || You tip the crate. Oil sloshes inside. Nothing is damaged.
?(comp=nao) !gesture comp observe 8,3
?(comp=mio) !gesture comp observe 8,3
?(comp=ren) !gesture comp glasses
?(comp=suzu) !gesture comp palm pc
?(comp=nao) comp[think]: …… この {字|じ} 、 {知|し}ってる 。 {跳|は}ね の {癖|くせ} が 、 {倉庫|そうこ} の {他|ほか} の {札|ふだ} と {同|おな}じ だ 。 {同|おな}じ {人|ひと} の {手|て} だ よ 。 || …I know this hand. Same flick at the end of the strokes as the other tags in here. Same person wrote it.
?(comp=mio) comp[think]: {糊|のり} の {匂|にお}い 、 {嗅|か}いで みて 。 {米|こめ} の {糊|のり} で 、 {炊|た}いた ばかり 。 {嵐|あらし} は {二週間|にしゅうかん} {前|まえ} よ 。 || Smell the paste. Rice paste, freshly cooked. The storm was two weeks ago.
?(comp=ren) comp[think]: {灯台|とうだい} の {油|あぶら} を 「{廃棄|はいき}」 に ？ …… {灯守|ひもり} と して 、 {見過|みす}ごせません 。 {灯|あか}り の {油|あぶら} は {命綱|いのちづな} です 。 || The lighthouse oil marked "for disposal"? …As a lantern keeper, I can't let that pass. Lamp oil is a lifeline.
?(comp=suzu) comp[smirk]: {壊|こわ}れて ない {荷|に} に 「{破損|はそん}」 の {札|ふだ} 。 {帳簿|ちょうぼ} の {上|うえ} では 、 {消|き}えて {無|な}くなる {荷物|にもつ} ね 。 よく ある {手|て} よ 。 || An undamaged crate tagged "damaged". On the books, it simply disappears. An old trick.
!look pc wataru
narr: これ は {静寂|しじま} では ない 。 {誰|だれ} か の {手|て} だ 。 || This isn't the Hush. It's someone's hand.
!call sg.crates_check

@scene sg.crate_oil
!set sg_crate_oil
narr: {灯油|とうゆ} の {樽|たる} 。 ラベル は {白紙|はくし} に なって いる が 、 {樽|たる} に {焼|や}き{印|いん} が ある 。 「{灯台|とうだい}」 。 || A barrel of lamp oil. The label has gone blank, but the barrel is branded: "Lighthouse".
narr: {木|き} に {焼|や}き{付|つ}けた {字|じ} は 、 {消|き}えない らしい 。 || Letters burned into wood, it seems, don't fade.
?(comp=ren) comp: {紙|かみ} の {字|じ} は {消|き}えて も 、 {木|き} に {焼|や}いた {字|じ} は {残|のこ}る 。 …… {覚|おぼ}えて おきましょう 。 || Words on paper fade, but words burned into wood remain. …Worth remembering.

@scene sg.wh_ledger
!set sg_ledger_seen
narr: {帳簿|ちょうぼ} だ 。 {細|こま}かく {丁寧|ていねい} な {字|じ} 。 {入荷|にゅうか} と {出荷|しゅっか} が 、 {一日|いちにち} も {欠|か}かさず {書|か}いて ある 。 || The ledger. Small, careful writing. Every arrival and dispatch recorded without missing a day.
narr: {嵐|あらし} の {三日後|みっかご} の {欄|らん} に 、 {直|なお}した {跡|あと} が ある 。 「{灯油|とうゆ} {八缶|はちかん}」 の 「{八|はち}」 が 、 「{四|よん}」 に {書|か}き{直|なお}されて いる 。 || On the page for three days after the storm there's a correction. In "lamp oil, eight cans", the eight has been changed to a four.
?(comp=suzu) comp[think]: {八|はち} から {四|よん} 。 {嵐|あらし} の {三日後|みっかご} に 。 「{嵐|あらし} の {夜|よる} に {剥|は}がれた 」 って {話|はなし} と 、 {日付|ひづけ} が {合|あ}わない わ 。 || Eight to four. Three days after the storm. That date doesn't fit his story about tags coming off on the night of the storm.
?(comp!=suzu) pc: {嵐|あらし} の {夜|よる} では なく 、 {三日後|みっかご} に {直|なお}して いる 。 || Not on the night of the storm — he corrected it three days later.

@scene sg.crates_check
!if sg_crates_done -> end
!if sg_crate_blank&sg_crate_glued -> ready
!end
:ready
# Staged: you look from one label to the other; Wataru turns to you and starts at the question; your
# companion's aside names what he does (Nao: he glances at the door; Mio: he will not meet your eyes) or is
# their own (Ren's glasses, Suzu looks between him and you); unasked, his hands twist.
!gesture pc lookbetween 4,3 and=8,3
narr: {二|ふた}つ の ラベル を {比|くら}べて みる 。 {片方|かたほう} は {勝手|かって} に {変|か}わる 。 {片方|かたほう} は 、 {誰|だれ} か が {貼|は}り{替|か}えた 。 || You compare the two labels. One changes by itself. The other, someone changed.
!lesson kana
!challenge sg.c_crates
!if var._res=0 -> later
!set sg_crates_done
!look wataru pc
!look pc wataru
wataru[worry]: …… {何|なに} か 、 {分|わ}かりました か 。 || …Did you find anything?
!choice
* この ラベル 、 {新|あたら}しい です ね 。 || This label is new, isn't it? -> ask
* まだ {何|なに} とも 。 || Nothing definite yet. -> quiet
:ask
!gesture wataru flinch pc
wataru[surprise]: え 、 ええ 。 {嵐|あらし} の {後|あと} に {貼|は}り{直|なお}した もの です 。 {壊|こわ}れた {荷|に} は {分|わ}けて おかない と …… 。 {港長|こうちょう} も ご{存|ぞん}じ です よ 。 || Y-yes. I put those on after the storm. Damaged goods have to be kept separate… The harbourmaster knows all about it.
?(comp=mio) !gesture wataru aside
?(comp=nao) !gesture wataru glance 6,9
?(comp=ren) !gesture comp glasses
?(comp=suzu) !gesture comp lookbetween wataru and=pc
?(comp=mio) comp: （…… {目|め} を {合|あ}わせない ね 。） || (…He won't meet our eyes.)
?(comp=nao) comp: （{出口|でぐち} を {見|み}た 。 {今|いま} 、 {出口|でぐち} を {見|み}た ぞ 。） || (He glanced at the door. Just now, he glanced at the door.)
?(comp=ren) comp: （{答|こた}え が {早|はや}すぎます 。 {用意|ようい} して いた {答|こた}え です 。） || (That answer came too fast. It was prepared.)
?(comp=suzu) comp: （{台詞|せりふ} の {練習|れんしゅう} を した {顔|かお} ね 。） || (That's the face of someone who rehearsed his lines.)
!goto after
:quiet
!gesture wataru fidget
wataru: そう です か …… 。 {何|なに} か {分|わ}かったら 、 {教|おし}えて ください 。 || I see… Please tell me if you find anything.
:after
narr: {倉庫|そうこ} の こと は 、 {他|ほか} の {二|ふた}つ を {見|み}て から 、 {港長|こうちょう} に {話|はな}そう 。 || Tell the harbourmaster about the warehouse — once you've seen the other two.
!call sg.check3
!end
:later
narr: {後|あと} で 、 また {見|み}に {来|こ}よう 。 || Come back and look again later.

@scene sg.check3
!if sg_crates_done&sg_post_done&sg_ferry_done -> all
!end
:all
!quest sg_main 2
narr: {三|みっ}つ とも {見|み}た 。 {港長|こうちょう} の {事務所|じむしょ} に {戻|もど}ろう 。 || You've seen all three. Back to the harbour office.
!autosave

@scene sg.tamae_first
# Staged: Tamae wipes the counter as she greets you, an open hand at the rush, then points at you: help;
# a small celebration for yes and a count of the regulars' habits; her laugh when it is done; your
# companion's own answer (Mio's nod, Suzu's showman's hands, Nao wipes their brow, Ren's breath out).
!gesture tamae tidy
tamae: いらっしゃい ！ …… って 、 {今|いま} は {座|すわ}って もらう {席|せき} も ない よ 。 もう すぐ {昼|ひる} の {波|なみ} が {来|く}る ん だ 。 || Welcome! …Though I've no seat to give you right now. The lunch wave's about to hit.
pc: {港長|こうちょう} に {言|い}われて 、 {郵便|ゆうびん} の こと で {来|き}ました 。 || The harbourmaster sent us about the post.
!gesture tamae palm pc
tamae: ああ 、 あの {袋|ふくろ} ！ {見|み}て ほしい けど 、 {昼|ひる} が {終|お}わる まで {手|て} が {離|はな}せない ん だ よ 。 || Oh, that bag! I'd love you to look at it, but I can't spare a hand until lunch is done.
!gesture tamae point pc
tamae[think]: …… そう だ 。 {手伝|てつだ}って くれたら 、 {早|はや}く {終|お}わる 。 {注文|ちゅうもん} を {聞|き}いて 、 {盆|ぼん} に {載|の}せる だけ 。 どう ？ || …I know. If you help, it'll be over sooner. Just listen to the orders and load the trays. What do you say?
!choice
* {手伝|てつだ}います 。 || We'll help. -> help
* {後|あと} で {来|き}ます 。 || We'll come back later. -> later
:later
!gesture tamae laugh
tamae: はいよ 。 {昼|ひる} は {逃|に}げない から ね 。 || Right you are. Lunch isn't going anywhere.
!end
:help
!gesture tamae celebrate
tamae[laugh]: {助|たす}かる ！ {常連|じょうれん} の {好|この}み を {教|おし}えとく よ 。 ダイゴ の 「いつも の 」 は 、 {焼|や}き{魚|ざかな} と ご{飯|はん} と {味噌汁|みそしる} 。 || Lifesaver! Let me tell you the regulars' habits. Daigo's "the usual" is grilled fish, rice and miso soup.
!gesture tamae count
tamae: テツ さん は お{茶|ちゃ} ばかり 。 キヨ さん は {魚|さかな} を {頼|たの}まない 。 {朝|あさ} から {晩|ばん} まで {見|み}てる から ね 。 || Tetsu only ever has tea. Kiyo never orders fish — she looks at it from dawn to dusk.
!activity sg.a_lunch
!if var._res=0 -> stopped
!set sg_lunch_done
!gesture tamae laugh
tamae[laugh]: {終|お}わった ！ {今日|きょう} は {早|はや}かった よ 。 あんた たち 、 {宿屋|やどや} {向|む}き だ ね 。 || Done! Fastest lunch this year. You two are made for innkeeping.
?(comp=mio) !gesture comp nod pc
?(comp=suzu) !gesture comp size
?(comp=nao) !gesture comp brow
?(comp=ren) !gesture comp exhale
?(comp=mio) comp[smile]: {薬|くすり} の {調合|ちょうごう} と {似|に}てる ね 。 {分量|ぶんりょう} を {間違|まちが}えない こと 。 || It's like mixing medicines. Don't get the quantities wrong.
?(comp=suzu) comp[laugh]: {満員|まんいん} {御礼|おんれい} ！ …… {皿|さら} {洗|あら}い は {別料金|べつりょうきん} よ 。 || Full house, thank you! …Washing up costs extra.
?(comp=nao) comp[tired]: {配達|はいたつ} より {忙|いそが}しかった 。 {誰|だれ} に も {言|い}う な よ 。 || Busier than couriering. Don't tell anyone I said that.
?(comp=ren) comp[tired]: {灯籠|とうろう} を {百|ひゃく} {灯|とも}す より 、 {疲|つか}れました 。 || More tiring than lighting a hundred lanterns.
!call sg.tamae_postbag
!end
:stopped
!gesture tamae nod pc
tamae: {休憩|きゅうけい} かい ？ また {頼|たの}む よ 。 || Taking a break? I'll need you again.

@scene sg.tamae_postbag
# Staged: Tamae hands the bundle of post across the counter and you read the blank envelopes; when the last
# letter turns up she holds it up, and its red stamp is what you lean in to; she hands it over; your
# companion's own reaction (Suzu lowers her head, Mio's hand to her chest, Nao shakes their head, Ren's hand
# to their chin).
!prop tamae envelopes
!gesture tamae handover pc
!gesture pc receive tamae
tamae: さて 、 {郵便|ゆうびん} {袋|ぶくろ} だ 。 {嵐|あらし} の {夜|よる} の {便|びん} で {来|き}た ん だ けど 、 {半分|はんぶん} が この {通|とお}り 。 || Now, the post bag. It came on the storm-night run, and half of it looks like this.
!give sg_postbag
!gesture pc read prop=envelopes hold
narr: {封筒|ふうとう} の {宛名|あてな} が {真|ま}っ{白|しろ} だ 。 でも 、 {中|なか} の {手紙|てがみ} の {字|じ} は {読|よ}める 。 || The addresses on the envelopes are blank white. But the letters inside can still be read.
?(comp=nao) !gesture comp observe pc
?(comp!=nao) !gesture tamae shrug
?(comp=nao) comp: {中身|なかみ} を {読|よ}んで {宛先|あてさき} を {当|あ}てる 。 {配達人|はいたつにん} の {奥|おく}の{手|て} だ 。 {本当|ほんとう} は やっちゃ いけない けど な 。 || Read the letter to work out who it's for. A courier's last resort. Not something you're really supposed to do.
?(comp!=nao) tamae: {中身|なかみ} を {読|よ}めば 、 {誰|だれ} {宛|あて} か {分|わ}かる かも ね 。 {悪|わる}い けど 、 {非常時|ひじょうじ} だ 。 || If you read them, you might tell who they're for. Not nice, but it's an emergency.
!activity sg.a_post
!if var._res=0 -> stopped
!set sg_post_done
!take sg_postbag
!gesture pc -
!prop pc -
!prop tamae notice
!gesture tamae present pc hold
tamae: {全部|ぜんぶ} {届|とど}いた ？ …… {待|ま}って 。 {一通|いっつう} だけ 、 {袋|ふくろ} の {底|そこ} に {残|のこ}ってた 。 || All delivered? …Wait. There's one left at the bottom of the bag.
!gesture pc observe tamae
narr: {宛名|あてな} は はっきり {読|よ}める 。 「{潮硝子|しおがらす} {二番|にばん}{倉庫|そうこ} ワタル {様|さま}」 。 {差出人|さしだしにん} は 「{灯落|ひおち} ・ {黒部|くろべ}{商会|しょうかい}」 。 || The address is perfectly legible: "Mr Wataru, No. 2 Warehouse, Saltglass". From "Kurobe & Co., Lanternfall".
narr: {封筒|ふうとう} に 、 {赤|あか}い {判|はん} 。 「{督促|とくそく}」 。 || A red stamp on the envelope: "PAYMENT DEMANDED".
!gesture tamae handover pc
!gesture pc receive tamae
tamae[worry]: ワタル は これ を {取|と}りに {来|こ}ない ん だ よ 。 「{届|とど}かない {手紙|てがみ} の {箱|はこ} に {入|い}れといて 」 って 。 {宛名|あてな} は ちゃんと {読|よ}める のに ね 。 || Wataru never comes for that one. He told me to put it in the undeliverable box. Even though the address is perfectly readable.
!give sg_notice
?(comp=suzu) !gesture comp lowered
?(comp=mio) !gesture comp guard
?(comp=nao) !gesture comp shake
?(comp=ren) !gesture comp chin
?(comp=suzu) comp[closed]: …… {借金|しゃっきん} の {手紙|てがみ} は 、 {開|あ}けなければ {無|な}い こと に なる 。 そう {思|おも}いたい {気持|きも}ち は 、 {分|わ}かる わ 。 || …A debt letter stays unreal as long as you don't open it. I understand wanting to believe that.
?(comp=mio) comp[worry]: {開|あ}けて いない …… 。 {怖|こわ}い ん だ ね 。 || He hasn't opened it… He's frightened.
?(comp=nao) comp: {宛名|あてな} の {読|よ}める {手紙|てがみ} を 、 {読|よ}めない {箱|はこ} に 。 …… {嫌|いや} な {手|て} だ 。 {気持|きも}ち は {分|わ}かる けど 。 || A letter with a readable address, filed in the unreadable box. …Nasty trick. I get the feeling, though.
?(comp=ren) comp[think]: {読|よ}める {字|じ} を 、 {読|よ}まない こと に する 。 {静寂|しじま} と は {違|ちが}う {消|け}し{方|かた} です ね 。 || Choosing not to read writing that can be read. A different kind of erasing from the Hush.
!call sg.check3
!end
:stopped
tamae: {残|のこ}り は 、 また {後|あと} で いい よ 。 || The rest can wait.

@scene sg.tetsu_first
# Staged: Tetsu points you to the board and you look at it; his arms fold over "boards lie"; he points the
# way to Shiori's hut; you step to his side and he hands you a coil of rope; your companion's own answer
# (Nao's nod, Suzu's laugh, Mio's open hands, Ren lifts their lamp).
tetsu: …… {時刻表|じこくひょう} か 。 || …The board, is it.
!gesture tetsu point 36,24
!gesture pc listen 36,24
tetsu: {見|み}て みろ 。 || Go on, look.
!call sg.ferryboard
!look pc tetsu
!gesture tetsu folded hold
tetsu: {板|いた} は {嘘|うそ} を つく 。 {潮|しお} は つかない 。 || Boards lie. Tides don't.
tetsu: {渡|わた}し{船|ぶね} は {満|み}ち{潮|しお} で {出|で}る 。 {四十年|よんじゅうねん} {変|か}わらん 。 {今|いま} は 、 {港長|こうちょう} が {船|ふね} を {止|と}めてる が な 。 || The ferry goes out on the high tide. Forty years, same. Just now the harbourmaster's stopped the boat, mind.
pc: {止|と}めて いる ん です か 。 || She's stopped it?
tetsu: {客|きゃく} が {時刻表|じこくひょう} を {信|しん}じて 、 {違|ちが}う {時間|じかん} に {来|く}る 。 {誰|だれ} も {乗|の}らない {船|ふね} を {出|だ}して も {仕方|しかた} ない 。 || Passengers trust the board and turn up at the wrong time. No sense sailing an empty boat.
!gesture tetsu point 7,26
tetsu: {潮|しお} の {時間|じかん} なら 、 {岬|みさき} の シオリ が {書|か}いてる 。 {板|いた} じゃ なく 、 {帳面|ちょうめん} に な 。 {帳面|ちょうめん} の {字|じ} は 、 まだ {変|か}わって ない そう だ 。 || If you want tide times, Shiori on the point writes them down. In her notebooks, not on a board. They say the writing in her books hasn't changed yet.
tetsu: …… それ と 。 || …And.
!walkto pc 35 29 left
!look tetsu pc
!prop tetsu rope
!gesture tetsu handover pc
!gesture pc receive tetsu
!give sg_rope
tetsu: {水辺|みずべ} を {嗅|か}ぎ{回|まわ}る なら 、 {縄|なわ} を {持|も}って いけ 。 {縄|なわ} なし で {水|みず} に {近|ちか}づく の は 、 {馬鹿|ばか} だけ だ 。 || If you're going to nose around the waterfront, take a rope. Only fools go near water without one.
!set sg_ferry_done
?(comp=nao) !gesture comp nod tetsu
?(comp=suzu) !gesture comp laugh
?(comp=mio) !gesture comp thanks tetsu
?(comp=ren) !gesture comp tendlamp
?(comp=nao) comp: …… {嫌|きら}い じゃ ない 、 この {爺|じい}さん 。 || …I don't mind this old man.
?(comp=suzu) comp[smile]: {台詞|せりふ} が {短|みじか}い ほど 、 {役者|やくしゃ} は {上手|うま}い の よ 。 || The fewer the lines, the better the actor.
?(comp=mio) comp[smile]: ありがとう ございます 。 {大事|だいじ} に {使|つか}います 。 || Thank you. We'll take good care of it.
?(comp=ren) comp: {縄|なわ} と {灯|あか}り 。 {旅|たび} の {基本|きほん} です ね 。 {灯|あか}り は {私|わたし} の {担当|たんとう} です が 。 || Rope and light — the basics of travel. Light is my department, of course.
!call sg.check3

@scene sg.ferryboard
!if sg_boss_done -> fixed
narr: {渡|わた}し{場|ば} の {時刻表|じこくひょう} 。 「{東|ひがし} {行|ゆ}き {午前|ごぜん} {九時|くじ}」 と {書|か}いて ある 。 || The ferry board. "Eastbound: 9 a.m."
narr: {瞬|まばた}き を する と 、 「{午後|ごご} {九時|くじ}」 に なった 。 もう {一度|いちど} {見|み}る と 、 {時刻|じこく} の {所|ところ} が {空白|くうはく} だ 。 || You blink and it says "9 p.m.". Look again, and the time is blank.
!end
:fixed
narr: {時刻表|じこくひょう} の {横|よこ} に 、 シオリ の {潮|しお} の {表|ひょう} が {釘|くぎ} で {留|と}めて ある 。 {手書|てが}き の {字|じ} は 、 もう {動|うご}かない 。 || Shiori's tide table is nailed up beside the board. Handwritten — and the writing stays put now.

@scene sg.omi_report
# Staged: Ōmi asks without looking up from her writing, and stops to listen when you say the causes differ;
# a nod; then her point made with a flat hand, the two kinds of fault held apart in her two hands, a breath
# out over Sōta's boat, a shake of the head at accusing on a guess, an open hand: follow the cargo. If your
# thoughts are not in order she goes back to her writing.
!pose omi write1
!prop omi brush
omi: どう だった 。 || Well?
!pose omi -
!prop omi -
!gesture omi listen pc hold
pc: {三|みっ}つ とも {見|み}ました 。 でも …… {全部|ぜんぶ} が {同|おな}じ {原因|げんいん} では ない と {思|おも}います 。 || We've seen all three. But… I don't think they all have the same cause.
!gesture omi nod pc
omi[think]: {聞|き}こう 。 || Let's hear it.
!challenge sg.c_sort
!if var._res=0 -> later
!gesture omi emphatic
omi[angry]: …… {糊|のり} の {乾|かわ}いて ない {札|ふだ} 、 か 。 || …A tag with the paste still wet.
!gesture omi size
omi: {静寂|しじま} だ か {何|なん} だ か {知|し}らない が 、 {字|じ} が {勝手|かって} に {変|か}わる の は {仕方|しかた} ない 。 だが 、 {手|て} で {貼|は}った {嘘|うそ} は {別|べつ} だ 。 || Hush or whatever it is — writing that changes by itself, that I can't help. But a lie stuck on by hand is another matter.
!gesture omi exhale
omi[sad]: {灯台|とうだい} の {油|あぶら} が 「{廃棄|はいき}」 だ と ？ {三日前|みっかまえ} の {晩|ばん} 、 {灯台|とうだい} の {灯|ひ} が {細|ほそ}く なって 、 ソウタ の {船|ふね} が {岬|みさき} の {岩|いわ} に {擦|す}った 。 {無事|ぶじ} だった の は 、 {運|うん} だ よ 。 || The lighthouse oil marked "for disposal"? Three nights ago the light burned low and Sōta's boat scraped the rocks off the point. It was luck he came home.
!gesture omi shake
omi: {誰|だれ} が やった か 、 {見当|けんとう} は つく 。 だが 、 {見当|けんとう} で {人|ひと} を {責|せ}める わけ に は いかない 。 || I can guess who did it. But I won't accuse someone on a guess.
!gesture omi palm pc
omi: {荷|に} の {行|ゆ}き{先|さき} を {追|お}って くれ 。 {油|あぶら} を {待|ま}って いた {灯台|とうだい} 、 {灰|はい} が {届|とど}かない ガラス{工房|こうぼう} 。 それ と {市場|いちば} の キヨ だ 。 キヨ は {最近|さいきん} 、 やけに {安|やす}い {塩|しお} を {仕入|しい}れた らしい 。 || Follow the cargo. The lighthouse that was waiting for oil. The glassworks that never got its ash. And Kiyo at the market — she's been buying suspiciously cheap salt lately.
!quest sg_main 3
!autosave
!end
:later
!pose omi write1
!prop omi brush
omi: {考|かんが}え が まとまったら 、 また {来|き}な 。 || Come back when you've got your thoughts in order.

@scene sg.omi_ask
omi: {灯台|とうだい} 、 ガラス{工房|こうぼう} 、 {市場|いちば} 。 {荷|に} が どこ で {消|き}えた か 、 {聞|き}いて {回|まわ}って くれ 。 || The lighthouse, the glassworks, the market. Ask around where the cargo disappeared.
?(!sg_clue_genzo) omi: ゲンゾウ の {爺|じい}さん は {機嫌|きげん} が {悪|わる}い が 、 {噛|か}みつき は しない 。 たぶん 。 || Old Genzō's in a foul mood, but he doesn't bite. Probably.

@scene sg.omi_wait
!if sg_wataru_resolved -> after
omi: {話|はなし} を {聞|き}く なら 、 {本人|ほんにん} から だ 。 ワタル は {倉庫|そうこ} に いる 。 || If you're going to hear it, hear it from him. Wataru's in the warehouse.
!end
:after
omi: ワタル の {手紙|てがみ} は {書|か}けた か ？ {手伝|てつだ}って やって くれ 。 あいつ は {字|じ} は {上手|うま}い が 、 {頼|たの}み{事|ごと} は {下手|へた} だ 。 || Has Wataru written that letter? Give him a hand. His handwriting's excellent, but he's hopeless at asking for anything.

@scene sg.omi_tide
omi: {岬|みさき} の {道|みち} へ {行|い}く なら 、 {潮|しお} の {時間|じかん} を {守|まも}れ よ 。 {海|うみ} は {言|い}い{訳|わけ} を {聞|き}かない 。 || If you're taking the causeway, keep to the tide times. The sea doesn't listen to excuses.
?(quest.sg_main>=8) omi: …… {本当|ほんとう} に あった の か 、 {沈|しず}んだ {書庫|しょこ} 。 {子|こ}ども の {怪談|かいだん} の {方|ほう} が 、 まだ {気|き}が {楽|らく} だった ね 。 || …So there really is a drowned archive. I liked it better as a children's ghost story.

@scene sg.asahi_clue
asahi: {灰|はい} ？ ああ 、 {注文|ちゅうもん} した ソーダ{灰|ばい} の こと ね ！ {届|とど}いて ない よ 。 ワタル さん が 、 「{嵐|あらし} で {濡|ぬ}れて {駄目|だめ} に なった 」 って 。 || Ash? Oh, the soda ash I ordered! Never came. Wataru said it got soaked in the storm and was ruined.
asahi[think]: でも さ 、 ソーダ{灰|ばい} は {樽|たる} に {入|はい}ってる ん だ よ 。 {蝋|ろう} で {封|ふう} して ある 。 {濡|ぬ}れる わけ ない ん だ けど な 。 || But here's the thing: soda ash comes in barrels sealed with wax. It can't get wet.
asahi: {灰|はい} が ない と 、 {新|あたら}しい ガラス は {作|つく}れない 。 {炉|ろ} が {冷|ひ}えて {困|こま}ってる ん だ よ ね 。 || Without the ash I can't make new glass. The furnace has gone cold. It's a real problem.
!set sg_clue_asahi
!call sg.check_clues

@scene sg.genzo_clue
# Staged: Genzō points to the oil barrel, folds his arms over "washed away", and turns aside over Sōta's
# boat; your companion's own answer (Ren's head lowered, Mio's shake of the head, Nao's nod, Suzu counts).
!gesture genzo point 7,2
genzo: {油|あぶら} ？ {来|き}た よ 。 {四缶|よんかん} な 。 {頼|たの}んだ の は {八缶|はちかん} だ 。 || Oil? It came. Four cans. I ordered eight.
!look genzo pc
!gesture genzo folded hold
genzo[angry]: {倉庫|そうこ} の {若|わか}いの が {言|い}う に は 、 「{嵐|あらし} で {半分|はんぶん} {流|なが}された 」 だ と さ 。 {流|なが}された なら {仕方|しかた} ない 。 {灯|ひ} を {細|ほそ}く して 、 {節約|せつやく} した 。 || The young fellow at the warehouse says half of it "washed away in the storm". If it washed away, it washed away. So I turned the flame down to save oil.
!gesture genzo aside
genzo[sad]: その {晩|ばん} だ 。 ソウタ の {船|ふね} が {岬|みさき} の {岩|いわ} に {擦|す}った の は 。 …… {灯|ひ} が {明|あか}るければ 、 {見|み}えた はず だ 。 || That was the night Sōta's boat scraped the rocks on the point. …With a brighter light, he'd have seen them.
?(comp=ren) !gesture comp lowered
?(comp=mio) !gesture comp shake
?(comp=nao) !gesture comp nod pc
?(comp=suzu) !gesture comp count
?(comp=ren) comp[sad]: {灯|ひ} を {細|ほそ}く する しか なかった 。 …… その お{気持|きも}ち 、 {分|わ}かります 。 || You had no choice but to turn it down. …I understand how that feels.
?(comp=mio) comp[worry]: ゲンゾウ さん の せい じゃ ありません 。 {油|あぶら} が {足|た}りなかった ん です から 。 || That's not your fault, Genzō. You didn't have enough oil.
?(comp=nao) comp: {四缶|よんかん} 、 か 。 {帳簿|ちょうぼ} の 「{八|はち}」 と 「{四|よん}」 と 、 {合|あ}う な 。 || Four cans. That matches the eight and the four in the ledger.
?(comp=suzu) comp[think]: {八|はち} {引|ひ}く {四|よん} は {四|よん} 。 {四缶|よんかん} 、 どこ か で {誰|だれ} か が {売|う}った の ね 。 || Eight minus four is four. Four cans that someone sold somewhere.
!set sg_clue_genzo
!call sg.check_clues

@scene sg.kiyo_clue
# Staged: Kiyo's guarded hand at "who told you?", a look away over the cheap salt, a shrug; she points to
# the barrels by the stall and you look; her head goes down as she takes her share of the blame.
!gesture kiyo guard
kiyo: {塩|しお} ？ …… {誰|だれ} から {聞|き}いた の さ 。 || Salt? …Who told you that?
!gesture kiyo aside
kiyo[worry]: {安|やす}かった ん だ よ 。 {嵐|あらし} の {後|あと} の {晩|ばん} に 、 {見|み}ない {顔|かお} の {商人|しょうにん} が {樽|たる} を {二|ふた}つ {持|も}って {来|き}て さ 。 || It was cheap. The night after the storm, a trader I didn't know came round with two barrels.
!gesture kiyo shrug
kiyo: {樽|たる} の {焼|や}き{印|いん} が {削|けず}って あった 。 {変|へん} だ と は {思|おも}った よ 。 でも 、 {魚|さかな} を {干|ほ}す に は {塩|しお} が {要|い}る ん だ 。 || The brand on the barrels had been scraped off. I thought it was odd. But you need salt to dry fish.
!gesture kiyo point 29,21
!gesture pc listen 29,21
kiyo: …… {削|けず}り{残|のこ}し が ある よ 。 {見|み}る かい ？ 「{潮硝子|しおがらす} {二番|にばん}」 。 {港|みなと} の {倉庫|そうこ} の {印|しるし} だ 。 || …There's a bit they missed. Want to see? "Saltglass No. 2". The harbour warehouse's own mark.
!look pc kiyo
!look kiyo pc
!gesture kiyo lowered
kiyo[sad]: {買|か}った あたし も {悪|わる}い ね 。 {樽|たる} は {返|かえ}す よ 。 || I'm to blame too, for buying it. I'll give the barrels back.
!set sg_clue_kiyo
!call sg.check_clues

@scene sg.check_clues
!if sg_clue_asahi&sg_clue_genzo&sg_clue_kiyo -> all
!end
:all
# Staged: you put the three together with a hand to your chin; your companion turns to you to say it, each
# their own way (Nao's nod, Mio's hand to her chest, Ren's open hand, Suzu's lowered head).
!gesture pc chin
narr: {油|あぶら} 、 ソーダ{灰|ばい} 、 {塩|しお} 。 どれ も {二番|にばん}{倉庫|そうこ} から {消|き}えて 、 「{嵐|あらし} の せい 」 に なって いる 。 || Oil, soda ash, salt. All of it vanished from No. 2 warehouse, and all of it blamed on "the storm".
!look comp pc
!look pc comp
?(comp=nao) !gesture comp nod pc
?(comp=mio) !gesture comp guard
?(comp=ren) !gesture comp palm pc
?(comp=suzu) !gesture comp lowered
?(comp=nao) comp: {全部|ぜんぶ} 、 {同|おな}じ {字|じ} の {札|ふだ} だ 。 {会|あ}いに {行|い}こう 。 {逃|に}げ{道|みち} が ある うち に 、 {本人|ほんにん} の {口|くち} から {聞|き}きたい 。 || Every tag in the same hand. Let's go and see him. I'd rather hear it from him while he still has a way out.
?(comp=mio) comp[worry]: ワタル さん に {会|あ}いに {行|い}こう 。 …… {責|せ}める ため じゃ なくて 、 {本当|ほんとう} の こと を {聞|き}く ため に 。 || Let's go and see Wataru. …Not to blame him. To hear the truth.
?(comp=ren) comp: ワタル さん の {所|ところ} へ {行|い}きましょう 。 {記録|きろく} を {書|か}き{換|か}える の は 、 {記録|きろく} を {守|まも}る {者|もの} の {罪|つみ} です 。 {理由|りゆう} を {聞|き}かなければ 。 || Let's go to Wataru. Altering records is a sin for someone who keeps them. We need to hear why.
?(comp=suzu) comp[closed]: {帳簿|ちょうぼ} を {合|あ}わせる ため の {嘘|うそ} は 、 {一|ひと}つ では {終|お}わらない の 。 …… {会|あ}いに {行|い}きましょう 。 || A lie told to balance the books never stays just one lie. …Let's go and see him.
!quest sg_main 4
!autosave

@scene sg.wataru_confront
# Staged in the warehouse: Wataru's hands twist; you count off the three things; he looks away as the lie
# holds; when it breaks his head goes down, then he faces you to say "I did it" (a fidget resolving into a
# lowered but direct posture); a hand half raised over the boat, hands twisting over the unopened notice,
# head down over Sōta; your companion's own answer (Nao's nod, Mio's flat hand: be kind but not let it go,
# Ren's open hand, Suzu's lowered head); his own way of saying he will go (a nod; or, for your route, the
# same resolve to face it).
!gesture wataru fidget
wataru: あ …… また {来|き}て くれた ん です ね 。 {数|かず} は 、 まだ {合|あ}わなくて 。 {嵐|あらし} の せい で …… 。 || Oh… you came back. The numbers still don't add up. Because of the storm…
!gesture pc count
pc: {灯台|とうだい} の {油|あぶら} 、 ガラス{工房|こうぼう} の ソーダ{灰|ばい} 、 {市場|いちば} の {塩|しお} の こと で {来|き}ました 。 || We're here about the lighthouse oil, the glassworks' soda ash, and the salt at the market.
!gesture wataru aside
wataru[worry]: …… それ は 、 {嵐|あらし} の {夜|よる} に 、 {全部|ぜんぶ} …… 。 ラベル が {貼|は}り{替|か}えられて いた ん です 。 {誰|だれ} か に 。 || …That was all, on the night of the storm… The labels had been switched. By someone.
!teach passive
!challenge sg.c_lie
!if var._res=0 -> later
!gesture wataru lowered hold
wataru[sad]: …… 。 || ……
!gesture wataru resolve pc hold
wataru[sad]: {僕|ぼく} が やりました 。 || I did it.
!gesture wataru halfraise
wataru: {母|はは} の {船|ふね} を {直|なお}す ため に 、 {灯落|ひおち} で お{金|かね} を {借|か}りました 。 {会社|かいしゃ} から の {給料|きゅうりょう} は 、 {春|はる} から ずっと {遅|おく}れて いて …… 。 || I borrowed money in Lanternfall to repair my mother's boat. Our wages from the company have been late since spring…
!gesture wataru fidget
wataru: そしたら {嵐|あらし} で 、 {船|ふね} が また {壊|こわ}れて 。 {督促状|とくそくじょう} が {来|き}て 。 {開|あ}ける の が {怖|こわ}くて 、 まだ {開|あ}けて いません 。 || Then the storm wrecked the boat again. And the final notice came. I was too scared to open it. I still haven't.
wataru: {荷|に} を {少|すこ}し ずつ {売|う}って 、 {払|はら}う つもり でした 。 {給料|きゅうりょう} が {出|で}たら 、 {全部|ぜんぶ} {戻|もど}す つもり で 。 ラベル が {勝手|かって} に {変|か}わり{始|はじ}めた とき …… {嵐|あらし} の せい に できる 、 と {思|おも}って しまった ん です 。 || I meant to sell a little cargo at a time and pay it off. To put it all back once the wages came. When the labels started changing by themselves… I thought, I can blame the storm.
!music sg_confession
!gesture wataru lowered hold
wataru[sad]: {灯台|とうだい} の {灯|ひ} が {細|ほそ}く なった {夜|よる} の こと 、 {聞|き}きました 。 ソウタ さん が …… 。 {僕|ぼく} の せい です 。 || I heard about the night the lighthouse burned low. Sōta… That was my fault.
?(comp=nao) !gesture comp nod wataru
?(comp=mio) !gesture comp emphatic wataru
?(comp=ren) !gesture comp palm wataru
?(comp=suzu) !gesture comp lowered
?(comp=nao) comp: …… {言|い}えた じゃん 。 {一番|いちばん} {重|おも}い {荷物|にもつ} は 、 {下|お}ろす {直前|ちょくぜん} が {一番|いちばん} {重|おも}い ん だ よ 。 || …You said it. The heaviest load's always heaviest right before you put it down.
?(comp=mio) comp[sad]: {言|い}って くれて 、 ありがとう 。 …… でも 、 {優|やさ}しく する の と 、 {許|ゆる}す の は {違|ちが}う 。 {港長|こうちょう} さん に も 、 {灯台|とうだい} に も 、 ちゃんと {言|い}わなきゃ 。 || Thank you for telling us. …But being kind isn't the same as letting it go. You have to tell the harbourmaster, and the lighthouse, properly.
?(comp=ren) comp: {記録|きろく} を {正|ただ}す {手|て} は 、 {記録|きろく} を {歪|ゆが}めた {手|て} と {同|おな}じ で いい 。 あなた の {字|じ} は 、 {綺麗|きれい} です 。 || The hand that sets a record right can be the same one that bent it. Your writing is beautiful.
?(comp=suzu) comp[closed]: {帳尻|ちょうじり} は 、 いつか {合|あ}わせなきゃ いけない の よ 。 {嘘|うそ} で {合|あ}わせた {分|ぶん} も 、 {利子|りし} を つけて ね 。 …… {身|み} に {覚|おぼ}え が ある から 、 {言|い}える の 。 || The books have to balance eventually. Including whatever you balanced with lies — with interest. …I say that from experience.
!choice
* {自分|じぶん} で {港長|こうちょう} に {話|はな}して ください 。 {一緒|いっしょ} に {行|い}きます 。 || Tell the harbourmaster yourself. We'll go with you. -> self
* {港長|こうちょう} に は 、 わたし たち から {伝|つた}えます 。 || We'll tell the harbourmaster ourselves. -> us
:self
!set sg_wataru_self
!gesture wataru nod pc
wataru: …… はい 。 {自分|じぶん} の {口|くち} で {言|い}います 。 || …Yes. I'll say it myself.
!goto go
:us
!gesture wataru resolve pc
wataru[sad]: …… {分|わ}かりました 。 {僕|ぼく} も {行|い}きます 。 {黙|だま}って {待|ま}つ の は 、 もう {嫌|いや} です 。 || …Understood. I'll come too. I'm done waiting in silence.
:go
!set sg_wataru_confessed
!warp sg.office 5 6 up
!call sg.omi_wataru
!end
:later
!look wataru 1,6
wataru: …… {帳簿|ちょうぼ} の {整理|せいり} が あります ので 。 || …I have the ledger to sort out.

@scene sg.omi_wataru
# Staged (docs/expressive/GESTURES.md §8; the owner's addendum §14): Omi is at her desk, writing; on
# Wataru's own route he takes the forward place at the desk's corner and the party stays behind his lead;
# on the party's route you open, and he steps up into his own admission. The pivotal exchange (the two
# faults, "not dismissing me?", the notice handed back and opened) is marked by the beats omi.pivot.* for
# the illustrated close-up (SHOTS.md §2); the overworld staging under it stays complete on its own. Omi is
# firm, not angry: her working hand stops, she listens, separates the two faults, and goes back to the desk.
!beat omi.arrive
!pose omi write1
!prop omi brush
?(sg_wataru_self) !walkto wataru 6 4 left
?(sg_wataru_self) !gesture wataru resolve omi hold
?(sg_wataru_self) !gesture pc listen wataru
?(sg_wataru_self) wataru: {港長|こうちょう} 。 {二番|にばん}{倉庫|そうこ} の {荷|に} を {売|う}った の は 、 {僕|ぼく} です 。 || Harbourmaster. I'm the one who sold the cargo from No. 2 warehouse.
?(!sg_wataru_self) !walkto pc 5 5 up
?(!sg_wataru_self) !gesture pc palm omi
?(!sg_wataru_self) pc: {港長|こうちょう} 。 {二番|にばん}{倉庫|そうこ} の {件|けん} です 。 || Harbourmaster. It's about No. 2 warehouse.
?(!sg_wataru_self) !walkto wataru 6 4 left
?(!sg_wataru_self) !gesture wataru resolve omi hold
?(!sg_wataru_self) !gesture pc listen wataru hold
?(!sg_wataru_self) wataru[sad]: …… {僕|ぼく} です 。 {荷|に} を {売|う}った の は 。 || …It was me. I sold the cargo.
!beat omi.pause
!pose omi -
!prop omi -
!gesture omi listen wataru hold
!gesture comp listen omi
omi: …… 。 || ……
!gesture omi exhale
omi: {知|し}ってた よ 。 {半分|はんぶん} くらい は ね 。 {残|のこ}り の {半分|はんぶん} は 、 {知|し}りたく なかった 。 || I knew. About half of it. The other half I didn't want to know.
!gesture wataru halfraise omi then=fidget
wataru: {借金|しゃっきん} が あって …… 。 いえ 、 {言|い}い{訳|わけ} は しません 。 || I had debts… No. I won't make excuses.
!gesture omi emphatic wataru then=palm
!gesture wataru flinch omi
omi[angry]: {言|い}い{訳|わけ} を しろ 。 {聞|き}く の も 、 {港長|こうちょう} の {仕事|しごと} だ 。 || Make them. Listening is part of the harbourmaster's job too.
!gesture wataru palm omi then=size,palm
!look omi wataru
narr: ワタル は {全部|ぜんぶ} {話|はな}した 。 {船|ふね} の こと 、 {利子|りし} の こと 、 {遅|おく}れて いる {給料|きゅうりょう} の こと 。 || Wataru tells her everything: the boat, the interest, the late wages.
!beat omi.pivot.begin
!gesture omi palm prop:desk
omi[think]: {給料|きゅうりょう} が {遅|おく}れて いる の は 、 {会社|かいしゃ} の {落|お}ち{度|ど} だ 。 {灯落|ひおち} の {本店|ほんてん} に は 、 わたし から {手紙|てがみ} を {書|か}く 。 {遅|おく}れた {分|ぶん} は 、 {利子|りし} を つけて {払|はら}って もらう 。 || The wages being late is the company's fault. I'll write to head office in Lanternfall myself. They'll pay what they owe — with interest.
!gesture omi size wataru
omi: だが 、 {荷|に} を {売|う}った の は お{前|まえ} の {落|お}ち{度|ど} だ 。 {売|う}った {分|ぶん} は 、 {給料|きゅうりょう} から {返|かえ}して もらう 。 {灯台|とうだい} と ソウタ に は 、 {自分|じぶん} で {頭|あたま} を {下|さ}げに {行|い}け 。 || But selling the cargo is your fault. You'll repay what you sold out of your wages. And you'll go to the lighthouse and to Sōta yourself, and apologise.
!gesture omi point wataru
omi: それ から 、 {港|みなと} じゅう の ラベル を {書|か}き{直|なお}せ 。 {一枚|いちまい} {残|のこ}らず 。 お{前|まえ} より {字|じ} の {綺麗|きれい} な {者|もの} は 、 この {港|みなと} に いない 。 || And then you'll rewrite every label in the harbour. Every last one. No one in this port writes a better hand than you.
!gesture wataru flinch omi
wataru[surprise]: …… {辞|や}めさせない ん です か 。 || …You're not dismissing me?
!gesture wataru exhale
omi: {辞|や}めさせたら 、 {誰|だれ} が {借金|しゃっきん} を {返|かえ}す ん だ 。 || If I dismiss you, who pays back the debt?
?(sg_wataru_self) !gesture omi nod wataru
?(sg_wataru_self) omi[smile]: …… それ に 、 {自分|じぶん} の {口|くち} で {言|い}いに {来|き}た 。 それ は {覚|おぼ}えて おく よ 。 || …Besides, you came and said it yourself. I'll remember that.
?(comp=mio) !gesture comp nod omi
?(comp=mio) comp[smile]: （{厳|きび}しい けど 、 {優|やさ}しい {人|ひと} だ ね 。） || (Strict, but kind.)
?(comp=suzu) !gesture comp size
?(comp=suzu) comp[smile]: （{見事|みごと} な お{裁|さば}き 。 {貸|か}し と {借|か}り が 、 ちゃんと {合|あ}った わ 。） || (Well judged. The debits and credits actually balance.)
?(comp=nao) !gesture comp lookbetween omi and=wataru
?(comp=nao) comp: （…… {逃|に}げ{道|みち} じゃ なくて 、 {帰|かえ}り{道|みち} を {作|つく}った な 。） || (…She didn't give him a way out. She gave him a way back.)
?(comp=ren) !gesture comp listen omi then=nod
?(comp=ren) comp: （{正|ただ}す こと と {罰|ばっ}する こと を 、 {分|わ}けて いる 。 よい {港長|こうちょう} です 。） || (She keeps correcting separate from punishing. A good harbourmaster.)
!gesture omi palm wataru
omi: {灯落|ひおち} の {黒部|くろべ} に は 、 {正直|しょうじき} に 「{待|ま}って くれ 」 と {書|か}け 。 {開|あ}けて ない {手紙|てがみ} に は 、 {返事|へんじ} も {書|か}けない だろう 。 || And write to Kurobe in Lanternfall, honestly asking them to wait. You can't answer a letter you haven't opened.
!take sg_notice
!walkto pc 6 5 up
!prop pc notice
!gesture pc handover wataru
!gesture wataru receive pc hold
narr: {督促状|とくそくじょう} を ワタル に {返|かえ}した 。 || You give the final notice back to Wataru.
!gesture wataru read prop=notice hold
wataru: …… {開|あ}けます 。 {今|いま} 、 ここ で 。 || …I'll open it. Now. Here.
!look omi wataru
narr: {封|ふう} が {切|き}られた 。 {誰|だれ} も {何|なに} も {言|い}わなかった 。 {窓|まど} の {外|そと} で 、 カモメ が {一羽|いちわ} {鳴|な}いた 。 || The seal breaks. No one says anything. Outside the window, a single gull cries.
!set sg_wataru_resolved
!note sg_passive
?(comp=suzu) !gesture comp lowered wataru then=listen
?(comp=suzu) comp: （…… {開|あ}けた わ ね 。 {一番|いちばん} {難|むずか}しい ところ よ 。） || (…He opened it. That's the hardest part.)
!beat omi.pivot.end
!look wataru omi
!gesture wataru nod omi
!look omi -
!prop omi brush
!pose omi write1
!gesture pc listen wataru
wataru: {倉庫|そうこ} に {戻|もど}ります 。 {返事|へんじ} を {書|か}かない と 。 …… よければ 、 {後|あと} で {寄|よ}って ください 。 || I'll go back to the warehouse. I have a reply to write. …Please stop by later, if you would.
!autosave
!music saltglass

@scene sg.wataru_letter
# Staged: Wataru reads over his unfinished reply and holds it out to you; relief breathed out when it is done;
# you step to his side and he hands you his notebook of labels, his hands twisting over the reason; you read
# its last page; he points west to the point and the tide-watcher; your companion's own answer (Ren's and
# Suzu's hand to the chin, Nao looks between you and him, Mio's hand to her chest).
!prop wataru paper
!gesture wataru read hold
wataru: {黒部|くろべ}{商会|しょうかい} へ の {返事|へんじ} です 。 …… {待|ま}って ほしい 、 と {書|か}きたい ん です が 、 {言葉|ことば} が {決|き}まらなくて 。 || My reply to Kurobe & Co. …I want to ask them to wait, but I can't settle on the words.
!gesture wataru present pc hold
wataru: {手伝|てつだ}って もらえません か 。 || Would you help me?
!teach keigo_kenjo
!challenge sg.c_extension
!if var._res=0 -> later
!prop wataru -
!gesture wataru exhale
wataru[smile]: …… これ なら 、 {出|だ}せます 。 ありがとう ございます 。 || …This one I can send. Thank you.
!set sg_extension_done
!walkto pc 4 5 right
!look wataru pc
!prop wataru book
!gesture wataru handover pc
!gesture pc receive wataru
wataru[think]: それ と 、 お{礼|れい} に なる か {分|わ}かりません が …… 。 これ を 。 || And — I don't know if this counts as thanks, but… here.
!give sg_labelbook
!gesture wataru fidget
wataru: {嵐|あらし} の {後|あと} 、 {勝手|かって} に {変|か}わった ラベル を 、 {全部|ぜんぶ} {書|か}き{写|うつ}して いた ん です 。 {自分|じぶん} で {貼|は}り{替|か}えた もの と 、 {区別|くべつ} する ため に 。 …… {情|なさ}けない {理由|りゆう} です が 。 || After the storm, I copied down every label that changed by itself. To keep them apart from the ones I'd changed. …A pathetic reason, I know.
!gesture wataru palm pc
wataru[think]: でも 、 {並|なら}べて みる と {変|へん} なんです 。 {変|か}わった ラベル は 、 {最後|さいご} に は みんな {同|おな}じ {字|じ} に なる 。 || But when you line them up, it's strange. The labels that changed all end up saying the same thing.
!gesture pc read prop=book hold
narr: {手帳|てちょう} の {最後|さいご} の ページ 。 {同|おな}じ {文字|もじ} が 、 {何十回|なんじっかい} も {並|なら}んで いる 。 「{差出人|さしだしにん} に {返送|へんそう} ・ {沖|おき} の {分室|ぶんしつ}」 。 || The last page of the notebook. The same words, dozens of times: "Return to sender — offshore branch."
!gesture wataru point left
wataru: {沖|おき} の {分室|ぶんしつ} 。 {岬|みさき} の {沖|おき} に は 、 {昔|むかし} 、 {書庫|しょこ} が あった そう です 。 {潮見|しおみ} の シオリ さん なら 、 {詳|くわ}しい はず です 。 || The offshore branch. They say there used to be an archive out past the point. Shiori the tide-watcher would know more.
?(comp=ren) !gesture comp chin
?(comp=nao) !gesture comp lookbetween pc and=wataru
?(comp=mio) !gesture comp guard
?(comp=suzu) !gesture comp chin
?(comp=ren) comp[surprise]: {分室|ぶんしつ} …… 。 {本庁|ほんちょう} が ある から こそ 、 {分室|ぶんしつ} と {呼|よ}ぶ 。 どこ か に 、 {本体|ほんたい} が ある 。 || A branch… You only call something a branch if there's a head office. Somewhere, there's the main archive.
?(comp=nao) comp: {返送|へんそう} 、 ね 。 {誰|だれ} も {頼|たの}んで ない のに 、 {勝手|かって} に {送|おく}り{返|かえ}してる {奴|やつ} が いる 。 || "Return to sender", huh. Someone's sending things back that nobody asked to have returned.
?(comp=mio) comp[worry]: {名前|なまえ} が {消|き}えた ん じゃ なくて 、 どこ か へ {送|おく}られてる …… ？ || The names didn't vanish — they're being sent somewhere…?
?(comp=suzu) comp[think]: {消|き}えた {荷|に} に は 、 {行|い}き{先|さき} が あった 。 {消|き}えた {名前|なまえ} に も 、 ある の かも ね 。 || The missing cargo had somewhere it went. Maybe the missing names do too.
!quest sg_main 5
!journal 「{沖|おき} の {分室|ぶんしつ}」 …… シオリ に {聞|き}こう 。 || "The offshore branch"… ask Shiori.
!autosave
!end
:later
!prop wataru -
!gesture wataru fidget
wataru: {急|いそ}ぎ では ありません 。 …… {本当|ほんとう} は {急|いそ}ぎ です けど 。 || It's not urgent. …Well, it is, really.

@scene sg.wataru_after
wataru: {港|みなと} じゅう の ラベル を {書|か}き{直|なお}して います 。 {楽|たの}しい なんて {言|い}ったら 、 {港長|こうちょう} に {怒|おこ}られます ね 。 || I'm rewriting every label in the harbour. If I said I was enjoying it, the harbourmaster would have my head.
?(!sg_boss_done) wataru: {沖|おき} の {分室|ぶんしつ} へ {行|い}く ん です か 。 …… {気|き}を つけて 。 {返送|へんそう} される の は 、 {手紙|てがみ} だけ とは {限|かぎ}りません から 。 || You're going to the offshore branch? …Be careful. It may not only be letters that get returned.
?(sg_boss_done) wataru[smile]: {手紙|てがみ} の {雨|あめ} 、 {見|み}ました 。 {全部|ぜんぶ} 、 {宛名|あてな} が {戻|もど}って いた 。 {僕|ぼく} の {書|か}いた ラベル も 、 もう {変|か}わりません 。 || I saw the rain of letters. Every one of them had its address back. And the labels I write don't change any more.
`, 'ch2/21_scenes_main');
