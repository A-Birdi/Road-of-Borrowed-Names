/* Chapter 5 companion stories and banter.
 *  Nao: the undelivered letter from Isamu of Saltglass to his daughter Umi.
 *       comp=nao → personal quest lf_nao; otherwise a cameo outside the ferry office.
 *  Mio: the limits of being useful to everyone — she must refuse out loud.
 *       comp=mio → personal quest lf_mio; otherwise a cameo at the inn.
 *  Banter: four or more per companion on lf.* maps. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
# ---- Nao and Umi (comp = nao) ------------------------------------------------------------------------------------------------------------
@scene lf.nao_umi_first
# Staged (Nao's personal quest): you step aside and Nao steps up to the counter; Umi's open hand; at her name Nao's
# hand goes to the satchel strap; Umi starts at "Isamu" and holds out her hand, fingertips trembling (held); Nao
# speaks plainly with an open hand, draws the letter halfway out and stops (the narration), then the flat hand of
# "No. Not like this."; Umi's hand drops; Nao's head goes down at "Sorry", turns towards the door and breathes out
# (the narration: outside, a long breath against the wall), and nods to you at "This time, Umi decides".
!walkto pc 5 4 up
!walkto comp 4 4 up
!gesture umi palm comp
umi: {渡|わた}し{場|ば} の {事務所|じむしょ} へ ようこそ 。{切符|きっぷ} です か 、{郵便|ゆうびん} です か 。|| Welcome to the ferry office. Tickets, or post?
!gesture comp strap
comp[closed]: …… ウミ さん 。|| …Umi.
umi: はい 、{私|わたし} です 。|| Yes, that's me.
comp: {配達人|はいたつにん} の ナオ 。{潮硝子|しおがらす} の イサム さん から 、{預|あず}かってる もの が ある 。|| Nao, courier. I've got something for you from Isamu in Saltglass.
!gesture umi flinch comp
umi[surprise]: …… {父|ちち} から 。|| …From my father.
umi[smile]: もちろん 、{受|う}け{取|と}ります 。|| Of course. I'll take it.
!gesture umi receive comp hold
narr: ウミ は {手|て} を {差|さ}し{出|だ}した 。{笑顔|えがお} の まま 、{指先|ゆびさき} が {少|すこ}し {震|ふる}えて いる 。|| Umi holds out her hand. Her smile doesn't move, but her fingertips are trembling slightly.
comp[think]: …… {受|う}け{取|と}りたい ？|| …Do you want to take it?
umi: もちろん です 。|| Of course.
!gesture comp palm umi
comp: {読|よ}みたく ない なら 、{断|ことわ}って いい んだ よ 。|| If you don't want to read it, you're allowed to refuse.
umi[smile]: かしこまりました 。|| Certainly.
!gesture comp present umi prop=letter hold
narr: ナオ は {鞄|かばん} から {手紙|てがみ} を {出|だ}しかけて 、{止|と}まった 。|| Nao starts to draw the letter out of the satchel, and stops.
!gesture comp emphatic
comp[angry]: …… だめ だ 。|| …No. Not like this.
comp: これ は 、{断|ことわ}れる {人|ひと} に {渡|わた}す {手紙|てがみ} なんだ 。{断|ことわ}れない {人|ひと} に は 、{渡|わた}せない 。|| This is a letter for someone who can refuse it. I can't hand it to someone who can't.
umi: かしこまりました 。|| Certainly.
!gesture umi -
!gesture comp lowered
comp[sad]: …… {出直|でなお}す よ 。ごめん 。|| …I'll come back. Sorry.
!look comp 5,8
!gesture comp exhale
narr: {事務所|じむしょ} を {出|で}る と 、ナオ は {壁|かべ} に もたれて 、{長|なが}い {息|いき} を ついた 。|| Outside the office, Nao leans against the wall and lets out a long breath.
comp: …… {一年|いちねん} 、{持|も}ってた 。{重|おも}い {手紙|てがみ} だ から 、{渡|わた}さない ほう が {親切|しんせつ} だ と {思|おも}った 。|| …I carried it for a year. It's a heavy letter; I thought not delivering it was the kind thing.
comp: でも それ 、ウミ の {代|か}わり に {決|き}めた って こと じゃん 。…… この {町|まち} と {同|おな}じ だ 。|| But that's me deciding for Umi. …Same as this whole town.
!look comp pc
!gesture comp nod pc
comp[closed]: {鐘|かね} を {鳴|な}らしたら 、もう {一回|いっかい} {来|く}る 。{今度|こんど} は 、ウミ が {決|き}める 。|| Once the bell's rung, we come back. This time, Umi decides.
!quest lf_nao 1
!autosave

@scene lf.nao_deliver
# Staged (Nao's personal quest, the delivery): you step aside and Nao steps up to the counter; Umi's flat hand for
# "does NOT run!" (or for "A whole year late"); Nao's hand to the strap, Umi's start at her father's name; Nao looks
# away and back to own up; Nao holds the envelope out, and Umi looks a long time at it; it passes from Nao's hand to
# hers (Nao's stronger reaction) and she reads it in silence (hers); Nao looks between her and you; her head goes
# down over "He was always like this"; she writes her one line and hands it to Nao; Nao points up the mountain,
# writes the address slowly (the narration), peels the old label into the satchel (the narration), and looks away
# with a smirk at the collection.
!if seen.lf.nao_umi_first -> again
!walkto pc 5 4 up
!walkto comp 4 4 up
!gesture umi emphatic
umi[angry]: {三時|さんじ} の {舟|ふね} は {出|で}ません ！ …… あ 、ごめんなさい 。{言|い}える の が {嬉|うれ}しくて 。|| The three o'clock does NOT run! …Oh, sorry. I'm just so glad I can say it.
!gesture comp strap
comp[closed]: …… ウミ さん 。{潮硝子|しおがらす} の イサム さん から 、{手紙|てがみ} を {預|あず}かってる 。|| …Umi. I've got a letter for you, from Isamu in Saltglass.
!gesture umi flinch comp
umi[surprise]: …… {父|ちち} から ？|| …From my father?
!gesture comp avert umi
comp: {一年|いちねん} {前|まえ} に {預|あず}かった 。{渡|わた}さない と {決|き}めた 。{君|きみ} に {聞|き}かず に 。|| I was given it a year ago. I decided not to deliver it. Without asking you.
!goto ask
:again
!walkto pc 5 4 up
!walkto comp 4 4 up
!gesture umi emphatic
umi[angry]: …… また {来|き}た の ね 。{父|ちち} の {手紙|てがみ} 。{一年|いちねん} も {遅|おく}れて 。|| …You came back. With my father's letter. A whole year late.
!gesture comp avert umi
comp: {遅|おく}れた の は 、{自分|じぶん} の せい だ 。{渡|わた}さない と {決|き}めた 。{君|きみ} に {聞|き}かず に 。|| It's late because of me. I decided not to deliver it. Without asking you.
:ask
umi: …… {勝手|かって} ね 。|| …That was presumptuous.
comp: うん 。{勝手|かって} だった 。|| Yeah. It was.
!gesture comp present umi prop=letter hold
comp: だから 、{今|いま} {聞|き}く 。{受|う}け{取|と}る ？ {断|ことわ}って も いい 。{捨|す}てて も いい 。|| So I'm asking now. Will you take it? You can refuse. You can throw it away.
umi: …… {断|ことわ}れる の ね 、{今|いま} は 。|| …I can refuse now, can't I.
!gesture umi observe comp
narr: ウミ は {長|なが}い あいだ 、{封筒|ふうとう} を {見|み}て いた 。{宛名|あてな} の {字|じ} が 、{三度|さんど} {書|か}き{直|なお}されて いる 。|| For a long time, Umi looks at the envelope. The address has been rewritten three times.
!gesture comp handover umi prop=letter
!gesture umi receive comp
umi: {受|う}け{取|と}ります 。{断|ことわ}れる けど 、{受|う}け{取|と}る 。|| I'll take it. I could refuse, but I'll take it.
!gesture umi read prop=letter hold
narr: {封|ふう} を {切|き}る {音|おと} 。ウミ は {黙|だま}って {読|よ}み 、それ から {手紙|てがみ} を {机|つくえ} に {置|お}いた 。|| The sound of the seal breaking. Umi reads in silence, then lays the letter on the desk.
narr: 「ウミ へ 。{元気|げんき} か 。{俺|おれ} は もう {長|なが}く ない らしい 。」|| "Umi. Are you well? It seems I don't have long."
narr: 「{許|ゆる}して ほしい と は {書|か}かない 。{書|か}けば 、お{前|まえ} は {断|ことわ}れなく なる 。」|| "I won't write that I want you to forgive me. If I wrote it, you wouldn't be able to refuse."
narr: 「ただ 、あの {朝|あさ} 、{港|みなと} で {言|い}えなかった こと が ある 。すまなかった 。」|| "Only, there's something I couldn't say that morning at the harbour. I'm sorry."
narr: 「{返事|へんじ} は いらない 。いや 、{本当|ほんとう} は ほしい 。どちら でも いい 。お{前|まえ} が {決|き}めて くれ 。 イサム」|| "You needn't reply. No — truthfully, I want you to. Either is fine. You decide. — Isamu"
!challenge lf.ch_nao_letter
!gesture comp lookbetween umi and=pc
comp[think]: …… 「{許|ゆる}して くれ」 って {書|か}いて ある と 、ずっと {思|おも}ってた 。イサム さん が 、そう {言|い}って {渡|わた}した から 。|| …I always thought it said "forgive me". That's what Isamu said when he handed it over.
comp: {書|か}いて ない 。…… いや 、{書|か}いて ある の か 、これ 。わかんない よ 。|| It doesn't say that. …Or does it? I can't tell.
!gesture umi lowered
umi[sad]: 「{返事|へんじ} は いらない 。いや 、{本当|ほんとう} は ほしい 。」 …… {昔|むかし} から 、こう いう {人|ひと} 。|| "You needn't reply. No — truthfully, I want you to." …He was always like this.
umi: {自分|じぶん} で は {何|なに} も {決|き}められない くせ に 、{決|き}めて くれ って 。|| Can't decide anything himself, then tells me to decide.
comp[think]: …… どう する ？|| …What will you do?
umi: {許|ゆる}す か どう か は 、まだ わからない 。|| Whether I forgive him — I don't know yet.
umi: でも 、{一行|いちぎょう} だけ {書|か}く 。|| But I'll write one line.
!gesture umi write 4,3
narr: ウミ は {事務所|じむしょ} の {便箋|びんせん} に 、さらさら と {書|か}いた 。|| Umi writes quickly on the office letter paper.
umi: 「{読|よ}みました 。 ウミ」|| "I read it. — Umi"
!gesture umi handover comp prop=letter
!gesture comp receive umi
umi: これ を 、{届|とど}けて くれる ？ {父|ちち} が まだ {生|い}きて いて も 、いなくて も 。|| Will you deliver this? Whether my father's still alive or not.
!gesture comp point up
comp: イサム さん は 、{春|はる} に {灯|ひ} の {道|みち} を {上|のぼ}って いった って {聞|き}いた 。{山|やま} の ほう だ 。…… ちょうど 、{行|い}く ところ だ よ 。|| I heard Isamu went up the lantern road last spring. Up the mountain. …As it happens, that's where we're headed.
comp[smile]: …… {届|とど}ける 。{必|かなら}ず 。|| …I'll deliver it. Without fail.
!gesture comp write
narr: ナオ は {封筒|ふうとう} に {宛名|あてな} を {書|か}いた 。いつも より 、ずっと ゆっくり 、ていねい に 。|| Nao writes the address on the envelope — far more slowly and carefully than usual.
!gesture comp check prop=tags
narr: それ から 、{古|ふる}い {封筒|ふうとう} の {宛名|あてな} の {紙|かみ} を そっと はがして 、{鞄|かばん} の {奥|おく} の {束|たば} に {加|くわ}えた 。|| Then Nao gently peels the old address label off Isamu's envelope and adds it to the bundle deep in the satchel.
comp: …… {一行|いちぎょう} か 。すごい {量|りょう} だ な 、あの {人|ひと} に しては 。|| …One line, huh. That's a lot, coming from her.
comp: {許|ゆる}す とも 、{許|ゆる}さない とも {書|か}いて ない 。…… それ で いい んだ 。{決|き}めた の は 、ウミ だ 。|| Doesn't say she forgives him, doesn't say she doesn't. …And that's right. Umi's the one who decided.
!gesture comp aside
comp[smirk]: {宛名|あてな} の {紙|かみ} 、{一枚|いちまい} {増|ふ}えた 。…… {笑|わら}う な よ 。{集|あつ}めてる んだ 、{昔|むかし} から 。|| One more address label for the collection. …Don't laugh. I've collected them for years.
!quest lf_nao done
!set lf_nao_done
!autosave

# ---- Nao cameo (comp != nao) ----------------------------------------------------------------------------------------------------------------
@scene lf.naoc
# Staged (Nao's cameo when travelling with someone else): Nao's nod; a point to the ferry office for Umi's letter; a
# look between it and you over a town that cannot say no; the hand on the satchel strap: "I'll wait"; your
# companion's own answer (Mio's laugh, Ren's hand to the chin, Suzu's laugh); Nao's smirk and glance away; a point
# down to the sluice and the tower.
!gesture nao nod pc
nao[smirk]: よう 。{久|ひさ}しぶり 。|| Hey. Long time.
!gesture nao point 35,29
nao: {配達|はいたつ} だ よ 。{潮硝子|しおがらす} から 、ここ の ウミ って {人|ひと} に 。{一年|いちねん} {遅|おく}れ の やつ 。|| Delivery. From Saltglass, for someone here called Umi. A year overdue.
!gesture nao lookbetween 35,29 and=pc
nao[think]: でも 、この {町|まち} 、{誰|だれ} も 「いいえ」 って {言|い}えない んだ ね 。|| But nobody in this town can say "no", huh.
!gesture nao strap
nao: {断|ことわ}れない {人|ひと} に 、この {手紙|てがみ} は {渡|わた}せない 。{待|ま}つ よ 。{何|なに} か が {変|か}わる まで 。|| I can't hand this letter to someone who can't refuse it. I'll wait. Until something changes.
?(comp=mio) !gesture comp laugh
?(comp=mio) comp[smile]: …… ナオ さん 、{変|か}わらない ね 。{頑固|がんこ} な ところ 。|| …Nao, you haven't changed. Stubborn as ever.
?(comp=ren) !gesture comp chin
?(comp=ren) comp: ナオ さん が 「{待|ま}つ」 と {言|い}う の は 、{珍|めずら}しい です ね 。|| It's rare to hear Nao say "I'll wait".
?(comp=suzu) !gesture comp laugh
?(comp=suzu) comp[laugh]: {急|いそ}がば {回|まわ}れ 、ね 。ナオ に しては 。|| More haste, less speed, eh? From you, of all people.
!gesture nao aside
nao[smirk]: うるさい 。|| Shut up.
!gesture nao point 40,39
nao: …… {鐘楼|しょうろう} に {行|い}く んだって ？ {気|き} を つけて 。{出口|でぐち} は 、{先|さき} に {確|たし}かめて おく こと 。|| …Heading for the bell tower, I hear? Be careful. Check where the way out is first.

@scene lf.naoc_after
# Staged (Nao's cameo after the bell): Nao's nod; the reply held up, "I read it."; your companion's own exchange
# with them (Mio looks Nao over and Nao's hand goes to a lighter satchel; Ren's open thanks and Nao's smirk away;
# Suzu checks her account book and Nao shakes their head); Nao points up the lantern road and waves you goodbye.
!gesture nao nod pc
nao: {鐘|かね} 、{聞|き}こえた よ 。あれ 、{君|きみ} たち だ よね 。|| Heard the bell. That was you lot, right?
nao: {渡|わた}した よ 、{手紙|てがみ} 。ウミ 、{怒|おこ}った 。ちゃんと {怒|おこ}れた 。|| I delivered it. Umi got angry. Properly angry.
!gesture nao present pc prop=letter
nao: で 、{一行|いちぎょう} だけ {返事|へんじ} を {書|か}いた 。「{読|よ}みました」 って 。|| Then she wrote one line back. "I read it."
nao[smile]: {許|ゆる}す とも {許|ゆる}さない とも {書|か}いて ない 。…… いい {返事|へんじ} だ よ 。|| Doesn't say whether she forgives him. …It's a good reply.
?(comp=mio) !gesture comp observe nao
?(comp=mio) comp: ナオ さん も 、{少|すこ}し {軽|かる}く なった ？|| Do you feel a bit lighter too, Nao?
?(comp=mio) !gesture nao strap
?(comp=mio) nao: …… {鞄|かばん} は {軽|かる}く なった 。|| …The satchel's lighter.
?(comp=ren) !gesture comp thanks nao
?(comp=ren) comp: {一年|いちねん} {遅|おく}れ の {配達|はいたつ} 、お{疲|つか}れ さま でした 。|| Well done on a delivery only a year late.
?(comp=ren) !gesture nao aside
?(comp=ren) nao[smirk]: {皮肉|ひにく} か ？ …… ありがと 。|| Is that sarcasm? …Thanks.
?(comp=suzu) !gesture comp check prop=accountbook
?(comp=suzu) comp: {送料|そうりょう} 、{一年分|いちねんぶん} {取|と}る の ？|| Charging a year's worth of postage?
?(comp=suzu) !gesture nao shake
?(comp=suzu) nao[laugh]: {取|と}らない よ 。…… たぶん 。|| No. …Probably not.
!gesture nao point up
nao: イサム さん は 、{春|はる} に {灯|ひ} の {道|みち} を {上|のぼ}って いった って {話|はなし} だ 。{返事|へんじ} は 、そっち へ {届|とど}ける 。|| Word is Isamu went up the lantern road last spring. I'll take the reply up that way.
!gesture nao wave pc
nao: じゃ 、{行|い}って くる 。{元気|げんき} で ね 。|| Right, I'm off. Take care.
!set lf_nao_cameo_done

# ---- Mio: a no, out loud (comp = mio) ----------------------------------------------------------------------------------------------------------
@scene lf.mio_start
# Staged (Mio's personal quest begins): you walk down to the avenue with Mio (the narration) and turn to her; the
# townspeople walk up to her one after another and she nods to each "of course", her hands fidget at the third, and
# she writes the requests in her notebook (the narration); a guarded hand at "I'm used to it"; Hayato hands her the
# Registrar's envelope; she starts back from her own "Yes, of cour—" (the narration: a hand over her mouth); she
# holds the recipe out for you to read with her; a shake of the head at what it does, her head goes down; she looks
# towards the Records Hall, and her hands fidget as she asks you to come.
!walkto pc 11 15 right
!walkto comp 12 15 left
narr: {通|とお}り を {歩|ある}いて いる と 、{町|まち} の {人|ひと} が {次々|つぎつぎ} に ミオ に {声|こえ} を かけて くる 。|| As you walk down the avenue, townsfolk come up to Mio one after another.
lf_setsu: {薬師|くすし} さん です よね ？ {宿|やど} の お{客|きゃく}さま が 、{咳|せき} を して いて 。|| You're an apothecary, aren't you? One of our guests has a cough.
!gesture comp nod lf_setsu
comp[smile]: はい 、もちろん 。{後|あと} で {持|も}って いきます 。|| Yes, of course. I'll bring something later.
lf_masaru: {俺|おれ} も ！ やけど の {薬|くすり} ！ {十人分|じゅうにんぶん} ！|| Me too! Burn ointment! Ten people's worth!
!gesture comp nod lf_masaru
comp: はい 、もちろん 。|| Yes, of course.
lf_nagi: {油|あぶら} で {荒|あ}れた {手|て} に {効|き}く もの 、ある ？|| Got anything for hands chapped from lamp oil?
!gesture comp fidget
comp: …… はい 、もちろん 。|| …Yes, of course.
!gesture comp write
narr: ミオ の {手帳|てちょう} が 、{頼|たの}まれ{事|ごと} で {埋|う}まって いく 。|| Mio's notebook fills up with requests.
pc: ミオ 、{大丈夫|だいじょうぶ} ？|| Mio, are you all right?
!gesture comp guard
comp[tired]: …… うん 。{慣|な}れてる から 。{昔|むかし} から 、こう なの 。|| …Mm. I'm used to it. I've always been like this.
!quest lf_mio start
lf_hayato: {薬師|くすし} の ミオ {様|さま} で いらっしゃいます か 。{登記官|とうきかん} から の ご{依頼|いらい} です 。|| Would you be Mio, the apothecary? A commission from the Registrar.
!gesture lf_hayato handover comp prop=letter
!gesture comp receive lf_hayato
narr: {封筒|ふうとう} の {中|なか} に は 、{処方|しょほう} の {写|うつ}し と 、{一行|いちぎょう} の {依頼|いらい} 。「{町|まち} の {全員|ぜんいん} {分|ぶん} 。{明日|あした} まで に 。」|| Inside the envelope: a copy of a recipe, and a single line. "Enough for the whole town. By tomorrow."
comp: はい 、もちろ@もちろん …… 。|| Yes, of cour—
!gesture comp recoil
narr: ミオ は 、{自分|じぶん} の {口|くち} を {押|お}さえた 。|| Mio claps a hand over her own mouth.
comp[surprise]: …… {今|いま} の 、{私|わたし} の {声|こえ} じゃ ない 。この {町|まち} の {声|こえ} だ 。|| …That wasn't my voice. That was this town's voice.
!quest lf_mio 1
!look comp pc
!gesture comp present pc prop=paper hold
comp[think]: {処方|しょほう} 、{一緒|いっしょ} に {読|よ}んで くれる ？ {嫌|いや}な {予感|よかん} が する 。|| Will you read the recipe with me? I've got a bad feeling.
!challenge lf.ch_recipe
!gesture comp shake
comp[angry]: …… これ は 、{薬|くすり} じゃ ない 。{飲|の}んだ {人|ひと} が 「いや」 と {思|おも}う {気持|きも}ち ごと 、{消|け}して しまう もの 。{本人|ほんにん} に {黙|だま}って 。|| …This isn't medicine. It wipes out the very feeling of "no" in whoever drinks it. Without telling them.
!gesture comp lowered
comp[sad]: {作|つく}れない 。{作|つく}っちゃ いけない 。…… でも 、{私|わたし} 、{断|ことわ}った こと なんて 、{一度|いちど} も ない 。|| I can't make it. I mustn't. …But I've never refused anyone, not once in my life.
!gesture comp lookroad 11,10
comp: …… タダシ さん に 、{言|い}い に {行|い}かなきゃ 。{言|い}える か 、わからない けど 。|| …I have to go and tell Tadashi. I don't know if I can say it.
!look comp pc
!gesture comp fidget
comp[shy]: {一緒|いっしょ} に {来|き}て くれる ？ {声|こえ} が {出|で}なかったら 、{背中|せなか} を {叩|たた}いて 。|| Will you come with me? If my voice won't come out, give me a pat on the back.
!quest lf_mio 2
!autosave

@scene lf.mio_refuse
# Staged (Chapter 5 performed interaction; Mio's personal quest): Mio steps up to the counter herself;
# your hand on her back; her refusal made with a flat hand and a shake of the head; the stamp held up
# and stopped; then she turns to you, hands shaking.
!if lf_bell_rung -> after
!prop lf_tadashi stamp
!pose lf_tadashi hold
!walkto comp 8 5 up
!look pc lf_tadashi
lf_tadashi: ミオ {様|さま} 。お{薬|くすり} の {件|けん} 、{明日|あした} まで に お{願|ねが}い できます でしょう か 。|| Ms Mio. Regarding the medicine — might I ask for it by tomorrow?
!gesture comp fidget
comp: …… あの 。|| …Um.
!gesture comp halfraise hold
narr: ミオ の {口|くち} が 、「はい」 の {形|かたち} に {動|うご}き かけて 、{止|と}まる 。|| Mio's mouth starts to shape a "yes", and stops.
!challenge lf.ch_mio_refuse
!gesture pc touchback comp hold
narr: {背中|せなか} に 、そっと {手|て} を {当|あ}てる 。|| You lay a hand gently on her back.
!gesture comp emphatic lf_tadashi then=shake
comp[angry]: …… お{断|ことわ}り します 。|| …I refuse.
narr: {記録館|きろくかん} が 、しん と した 。{何年|なんねん} も {誰|だれ} も {口|くち} に して いない {言葉|ことば} だった 。|| The Records Hall falls utterly silent. No one has said those words aloud in years.
!gesture pc -
!pose lf_tadashi stampup
lf_tadashi: かしこ@かしこまる …… 。|| Cert—
!gesture lf_tadashi flinch comp
lf_tadashi[surprise]: …… {今|いま} 、{何|なん} と ？|| …What did you say?
!gesture comp palm lf_tadashi
comp: {作|つく}りません 。{皆|みな}さん が {困|こま}って いる の は 、{気持|きも}ち が {騒|さわ}ぐ から じゃ ありません 。{言|い}いたい こと が 、{言|い}えない から です 。|| I won't make it. What's troubling everyone isn't that their feelings are too stirred up. It's that they can't say what they want to say.
!gesture comp guard hold
comp: {本人|ほんにん} に {黙|だま}って {飲|の}ませて 、{反対|はんたい} する {気持|きも}ち を {消|け}す の は 、{治療|ちりょう} じゃ ない 。{私|わたし} は {薬師|くすし} です 。だから 、{作|つく}りません 。|| Slipping something into people without telling them, to erase their objections — that isn't treatment. I'm an apothecary. So I won't make it.
!look lf_tadashi comp
narr: タダシ の 「{承認|しょうにん}」 の {判子|はんこ} が 、{宙|ちゅう} で {止|と}まった 。|| Tadashi's "approved" stamp stops in mid-air.
!pose lf_tadashi hold
lf_tadashi: …… {承認|しょうにん} …… できません 。「お{断|ことわ}り」 を {承認|しょうにん} する {様式|ようしき} は 、ございません ので 。|| …I cannot… approve this. There is no form for approving a refusal.
!gesture lf_tadashi exhale
lf_tadashi[think]: …… {不思議|ふしぎ} です 。{今|いま} 、{少|すこ}し だけ …… ほっと いたしました 。|| …How strange. Just now, I felt… a little relieved.
!gesture lf_tadashi nod comp
lf_tadashi: ご{依頼|いらい} は 、{取|と}り{下|さ}げます 。…… {取|と}り{下|さ}げる {様式|ようしき} なら 、ございます ので 。|| I withdraw the commission. …There is, at least, a form for withdrawing.
!goto end_scene
:after
!prop lf_tadashi stamp
!walkto comp 8 5 up
!look pc lf_tadashi
lf_tadashi: ミオ {様|さま} 。…… あの お{薬|くすり} の {件|けん} です が 。|| Ms Mio. …About that medicine.
!gesture comp emphatic lf_tadashi then=shake
comp: {作|つく}りません 。|| I won't make it.
!gesture lf_tadashi nod comp
lf_tadashi[think]: …… {鐘|かね} の {後|あと} ですから 、{私|わたし} も {申|もう}せます 。{作|つく}って いただかなくて {結構|けっこう} です 。{最初|さいしょ} から 、{出|だ}す べき で は ない {依頼|いらい} でした 。|| …Since the bell, I can say it too. You need not make it. It was a commission that should never have been sent.
!gesture comp guard hold
comp: それ でも 、{私|わたし} の {口|くち} で {言|い}いたかった んです 。お{断|ことわ}り します 。|| Even so, I wanted to say it with my own mouth. I refuse.
:end_scene
!look comp pc
!gesture comp fidget
comp[shy]: …… {言|い}えた 。{手|て} 、{震|ふる}えてる 。|| …I said it. My hands are shaking.
!gesture comp lowered hold
comp: ずっと 、{頼|たの}まれたら {全部|ぜんぶ} {引|ひ}き{受|う}けて きた 。{断|ことわ}ったら 、{役|やく} に {立|た}たない {人|ひと} に なる {気|き} が して 。|| All my life I've taken on everything anyone asked. It felt like if I refused, I'd become someone useless.
!gesture comp nod pc
comp: でも 、{断|ことわ}る の も 、{薬師|くすし} の {仕事|しごと} なんだ ね 。{効|き}かない {薬|くすり} を {出|だ}さない の と 、{同|おな}じ 。|| But refusing is part of an apothecary's work too. Same as not handing out medicine that doesn't work.
!gesture comp laugh
comp[laugh]: …… ふふ 。{町|まち} の {頼|たの}まれ{事|ごと} も 、{半分|はんぶん} くらい {断|ことわ}って こよう かな 。{十人分|じゅうにんぶん} の やけど {薬|ぐすり} は 、{三人分|さんにんぶん} で {足|た}りる し 。|| …Heh. Maybe I'll go and turn down about half the town's requests too. Ten people's worth of burn ointment? Three will do.
!quest lf_mio done
!set lf_mio_done
!autosave

# ---- Mio cameo (comp != mio) -----------------------------------------------------------------------------------------------------------------
@scene lf.mioc
# Staged (Mio's cameo when travelling with someone else): Mio's tired nod, an open hand at three days of requests, a
# guarded hand when "of course" slips out; your companion's own answer (Nao looks her over, Ren's open hand, Suzu
# writes her a sign in the air); Mio's laugh behind her hand.
!gesture mio nod pc
mio[tired]: あ 、$name さん 。…… {久|ひさ}しぶり 。|| Oh, $name. …It's been a while.
!gesture mio palm pc
mio: {薬草|やくそう} を {買|か}い に {来|き}た だけ なの 。でも 、{頼|たの}まれ{事|ごと} が {終|お}わらなくて 。もう {三日|みっか} 。|| I only came to buy herbs. But the requests never stop. Three days now.
!gesture mio guard
mio[worry]: {断|ことわ}ろう と する と 、「もちろん」 って {口|くち} が {勝手|かって} に …… 。{前|まえ} から {苦手|にがて} だった けど 、ここ だと もっと {言|い}えない 。|| Whenever I try to refuse, "of course" just comes out… I was never good at it, but here I can't say it at all.
?(comp=nao) !gesture comp observe mio
?(comp=nao) comp: ミオ 、{休|やす}め よ 。{顔|かお} が {真|ま}っ{青|さお} だ 。|| Mio, take a break. You're white as a sheet.
?(comp=ren) !gesture comp palm mio
?(comp=ren) comp: ミオ さん 、{薬師|くすし} が {倒|たお}れて は 、{元|もと} も {子|こ} も ありません 。|| Mio, an apothecary who collapses is no use to anyone.
?(comp=suzu) !gesture comp write
?(comp=suzu) comp: 「{本日|ほんじつ} {休業|きゅうぎょう}」 の {札|ふだ} 、{書|か}いて あげよう か ？|| Want me to write you a "Closed today" sign?
!gesture mio laugh
mio[smile]: …… ありがとう 。{書|か}いて もらって も 、{出|だ}せない かも しれない けど 。|| …Thank you. Even if you write it, I might not manage to put it up.

@scene lf.mioc_after
# Staged (Mio's cameo after the bell): Mio's small celebration at her fourteenth "no", her laugh behind her hand;
# your companion's own answer (Nao's nod, Ren's and Suzu's open-handed applause); she checks her bottles as she
# talks of going home to sort the shelves.
!gesture mio celebrate
mio[laugh]: $name さん ！ {聞|き}いて 。{十四人目|じゅうよにんめ} の {人|ひと} に 、「いいえ」 って {言|い}えた の 。|| $name! Listen. I managed to say "no" to the fourteenth person.
mio: {十五人目|じゅうごにんめ} に も 。{言|い}う たび に 、{少|すこ}し ずつ {楽|らく} に なった 。|| And the fifteenth. Each time it got a little easier.
!gesture mio laugh
mio[smile]: {断|ことわ}って も 、みんな {怒|おこ}らなかった 。…… {怒|おこ}った {人|ひと} も いた けど 、それ で いい の 。|| Nobody got angry when I refused. …Well, a few did, but that's fine too.
?(comp=nao) !gesture comp nod mio
?(comp=nao) comp[smirk]: {成長|せいちょう} した じゃん 。|| Look at you, growing up.
?(comp=ren) !gesture comp thanks mio
?(comp=ren) comp: おめでとう ございます 。{立派|りっぱ} な 「いいえ」 でした ね 、きっと 。|| Congratulations. I'm sure they were splendid "no"s.
?(comp=suzu) !gesture comp thanks mio
?(comp=suzu) comp[laugh]: {初|はつ}{舞台|ぶたい} ね ！ {花束|はなたば} は ない けど 、{拍手|はくしゅ} なら ある わ 。|| Your stage debut! No bouquet, but have some applause.
!gesture mio check prop=bottle
mio: {葦|あし}ノ{瀬|せ} に {帰|かえ}る ね 。{店|みせ} の {棚|たな} 、{整理|せいり} しなきゃ 。…… {断|ことわ}った ぶん 、{余|あま}った {薬草|やくそう} が いっぱい ある から 。|| I'm going home to Reedwake. I need to sort out the shop shelves. …I've got loads of spare herbs now, from everything I turned down.
!set lf_mio_cameo_done

# ---- banter (talk to your companion on lf.* maps) ---------------------------------------------------------------------------------------------
@scene lf.b_nao1
comp: この {町|まち} の {宛名|あてな} 、{全部|ぜんぶ} {同|おな}じ {字|じ} に {見|み}える 。{上手|じょうず} な のに 、{誰|だれ} の {字|じ} でも ない 。|| Every address in this town looks like the same handwriting. Neat — and nobody's.
comp: {字|じ} って 、{少|すこ}し {下手|へた} な くらい が いい んだ よ 。{急|いそ}いでた 、とか 、{寒|さむ}かった 、とか 、わかる から 。|| Handwriting's better a little bad. You can tell they were in a hurry, or cold.
pc: {字|じ} が {好|す}き なんです ね 。|| You really like handwriting.
comp[smirk]: …… {配達人|はいたつにん} だ から ね 。{他|ほか} に {理由|りゆう} は ない よ 。|| …I'm a courier. That's all it is.

@scene lf.b_nao2
comp: イサム さん の {手紙|てがみ} 、{宛名|あてな} を {三回|さんかい} {書|か}き{直|なお}して ある んだ 。|| Isamu rewrote the address on that letter three times.
comp: {一回目|いっかいめ} は {震|ふる}えて て 、{二回目|にかいめ} は {力|ちから} が {入|はい}りすぎ 。{三回目|さんかいめ} で 、やっと {普通|ふつう} の {字|じ} 。|| The first one shakes. The second's pressed too hard. The third's finally just normal handwriting.
comp[closed]: …… {渡|わた}す の が {怖|こわ}かった の は 、{中身|なかみ} より 、その {三回|さんかい} の せい かも な 。|| …Maybe what scared me about delivering it wasn't the letter. It was those three tries.

@scene lf.b_nao3
comp: {塔|とう} って 、{嫌|きら}い なんだ 。{出口|でぐち} が {上|うえ} か {下|した} しか ない 。|| I hate towers. The only ways out are up or down.
comp: {配達|はいたつ} で {一番|いちばん} {大事|だいじ} な の は 、{届|とど}ける こと より 、{帰|かえ}る こと 。{帰|かえ}れない {配達人|はいたつにん} は 、{次|つぎ} の {手紙|てがみ} を {運|はこ}べない から 。|| The most important part of a delivery isn't arriving, it's getting back. A courier who can't get back can't carry the next letter.

@scene lf.b_nao4
comp[laugh]: {町|まち} 、うるさく なった な 。{配達|はいたつ} も {大変|たいへん} に なる 。「{受|う}け{取|と}り {拒否|きょひ}」 が {増|ふ}える から 。|| The town's got loud. Deliveries'll be harder now — lots more "refused by recipient".
comp: …… でも 、そっち の ほう が いい 。{拒否|きょひ} できる {人|ひと} が {受|う}け{取|と}った {手紙|てがみ} は 、ちゃんと {届|とど}いた って こと だ から 。|| …But it's better that way. A letter taken by someone who could've refused it has really been delivered.

@scene lf.b_mio1
comp: {刈|か}り{込|こ}んだ {植木|うえき} って 、{元気|げんき} そう に {見|み}える けど 、{中|なか} は {息|いき} が できて ない の 。|| Clipped hedges look healthy, but inside they can't breathe.
comp[worry]: 「{大丈夫|だいじょうぶ} です」 しか {言|い}わない {患者|かんじゃ} さん と 、{同|おな}じ 。{一番|いちばん} {心配|しんぱい} な の は 、そういう {人|ひと} 。|| Like a patient who only ever says "I'm fine". They're the ones I worry about most.
pc: ミオ も 、よく 「{大丈夫|だいじょうぶ}」 と {言|い}います よね 。|| You say "I'm fine" a lot too, Mio.
comp[shy]: …… {気|き} を つけます 。|| …I'll watch that.

@scene lf.b_mio2
comp: {灯落|ひおち} の {市場|いちば} 、{薬草|やくそう} が {全部|ぜんぶ} {同|おな}じ {大|おお}きさ に {切|き}り{揃|そろ}えて ある の 。|| At the Lanternfall market, all the herbs are cut to exactly the same size.
comp[laugh]: {根|ね} の {長|なが}さ で {効|き}き{目|め} が {違|ちが}う のに 。{店|みせ} の {人|ひと} に {言|い}ったら 、「もちろん です」 って 。…… {言|い}い{返|かえ}して くれた ほう が 、{話|はなし} が {早|はや}い のに ね 。|| The root length changes how well they work. When I told the stall keeper, she said "of course". …An argument would've been quicker.

@scene lf.b_mio3
comp[worry]: {湿気|しっけ} で 、{瓶|びん} の {札|ふだ} の {字|じ} が にじんで きた 。|| The damp's making the ink run on my bottle labels.
comp: {札|ふだ} が {読|よ}めない {薬|くすり} は 、{使|つか}えない 。{中身|なかみ} が {同|おな}じ でも ね 。…… {言葉|ことば} も 、{少|すこ}し {似|に}て いる かも 。|| A medicine with an unreadable label can't be used, even if what's inside is the same. …Words are a bit like that too, maybe.

@scene lf.b_mio4
comp[laugh]: さっき 、{眠|ねむ}り{薬|ぐすり} を {十二本|じゅうにほん} くれって {言|い}う {人|ひと} に 、「{三本|さんぼん} まで です 」 って {言|い}ったの 。|| Just now, a man asked me for twelve bottles of sleeping draught. I told him, "Three at most."
comp: {怒|おこ}られる と {思|おも}った けど 、「そう か 、{助|たす}かる 」 って 。…… {断|ことわ}る の って 、{時々|ときどき} 、{助|たす}ける の と {同|おな}じ なんだ ね 。|| I thought he'd get angry, but he said, "I see — that's a help." …Sometimes refusing is the same as helping.

@scene lf.b_ren1
comp: {灯落|ひおち} の {灯籠|とうろう} は 、{手入|てい}れ が {完璧|かんぺき} です 。{芯|しん} も 、{油|あぶら} も 、{笠|かさ} も 。|| Lanternfall's lanterns are perfectly maintained. Wicks, oil, shades — everything.
comp[worry]: ただ 、{笠|かさ} の {名前|なまえ} が 、{全部|ぜんぶ} 「{灯落|ひおち}」 。{行|い}き{先|さき} を {示|しめ}さない {灯籠|とうろう} は 、{飾|かざ}り と {同|おな}じ です 。|| Only, the names on the shades all say "Lanternfall". A lantern that doesn't name where it leads is just an ornament.

@scene lf.b_ren2
comp: {鐘|かね} の {話|はなし} を {聞|き}く のに 、お{金|かね} は {要|い}りません 。|| No money needed to hear about the bell.
pc: …… え ？|| …Sorry?
comp[smirk]: {鐘|かね} と お{金|かね} 。どちら も 「かね」 です 。…… {灯落|ひおち} の {人|ひと} は 、{誰|だれ} も {笑|わら}って くれませんでした 。「もちろん です」 と だけ 。|| Bell and money. Both かね. …Nobody in Lanternfall laughed. They just said "of course".
comp: {笑|わら}わない の も 、{反対|はんたい} の {一種|いっしゅ} です から ね 。{取|と}られて しまった の でしょう 。|| Not laughing is a kind of objection, you see. They must have had it taken away.

@scene lf.b_ren3
comp: {階段|かいだん} は こちら です 。{上|うえ} へ …… いえ 。|| The stairs are this way. Up… no.
comp[think]: {水|みず} は {下|した} へ {流|なが}れます 。{水|みず} に {従|したが}えば 、{迷|まよ}いません 。{灯守|ひもり} の {方向|ほうこう} {感覚|かんかく} より 、{信用|しんよう} できます 。|| Water flows downhill. Follow the water and you won't get lost. More reliable than a lantern keeper's sense of direction.

@scene lf.b_ren4
comp: ウシオ {師匠|ししょう} は 、{誰|だれ} と でも {議論|ぎろん} を する {人|ひと} でした 。{私|わたし} と も 、{毎日|まいにち} 。|| Master Ushio argued with everyone. With me too, every day.
comp[closed]: {顔|かお} は {思|おも}い{出|だ}せない のに 、{反論|はんろん}された {時|とき} の {悔|くや}しさ だけ は 、よく {覚|おぼ}えて います 。|| I can't remember his face, but I remember exactly how annoying it was to be contradicted.
comp[smile]: …… {町|まち} が うるさく なって 、{少|すこ}し {懐|なつ}かしく なりました 。{反論|はんろん}されたい 、と {思|おも}う の は 、{変|へん} でしょう か 。|| …With the town noisy again, I feel a bit nostalgic. Is it odd to want someone to contradict me?

@scene lf.b_suzu1
comp: {拍手|はくしゅ} しか しない {客|きゃく} って 、{一番|いちばん} {怖|こわ}い の よ 。|| An audience that only ever applauds is the scariest kind.
comp: {野次|やじ} が {飛|と}べば 、どこ が {悪|わる}かった か わかる 。{拍手|はくしゅ} だけ だと 、{自分|じぶん} が {下手|へた} に なって も 、{誰|だれ} も {教|おし}えて くれない 。|| Heckling tells you what went wrong. With nothing but applause, you could get worse and worse and nobody would tell you.

@scene lf.b_suzu2
comp[think]: リツ の {店|みせ} 、{帳簿|ちょうぼ} が めちゃくちゃ よ 。{値切|ねぎ}られて も {断|ことわ}れない から 、{団子|だんご} が {半額|はんがく} {以下|いか} 。|| Ritsu's accounts are a shambles. She can't refuse when people haggle, so her dango sell for less than half price.
comp: {貸|か}し{借|か}り は 、きっちり しない と 。{情|なさ}け で {帳簿|ちょうぼ} を {曲|ま}げる と 、{最後|さいご} に {困|こま}る の は {情|なさ}け を かけた {本人|ほんにん} なんだ から 。|| Debts and credits need to be exact. Bend the books out of kindness, and in the end it's the kind one who suffers.
pc: {厳|きび}しい です ね 。|| That's strict.
comp[smirk]: {一座|いちざ} の {会計|かいけい} を {十年|じゅうねん} やれば 、{誰|だれ} でも こう なる わ よ 。|| Do a troupe's books for ten years and anyone would be.

@scene lf.b_suzu3
comp: この {塔|とう} 、{響|ひび}き が {最高|さいこう} ね 。{小声|こごえ} でも 、{一番|いちばん} {奥|おく} まで {届|とど}く 。|| This tower has marvellous acoustics. Even a whisper reaches the very back.
comp[sad]: …… {鳴|な}らない {鐘|かね} に は 、もったいない {舞台|ぶたい} 。|| …Wasted on a bell that won't ring.

@scene lf.b_suzu4
comp[laugh]: {聞|き}いた ？ さっき {広場|ひろば} で 、{誰|だれ} か が {誰|だれ} か に 「{引|ひ}っ{込|こ}め ！」 って {言|い}ってた の 。|| Did you hear? Just now in the square, someone yelled "Get off!" at someone.
comp: {何|なん}か{月|げつ}ぶり の {野次|やじ} かしら 。{音楽|おんがく} みたい に {聞|き}こえた わ 。|| First heckle in months, I'd guess. It sounded like music.
comp[closed]: …… {本当|ほんとう} の こと を {言|い}う の と 、「いいえ」 を {言|い}う の は 、{同|おな}じ {筋肉|きんにく} を {使|つか}う の 。どっち も 、{使|つか}わない と {弱|よわ}る 。|| …Telling the truth and saying no use the same muscle. Both waste away if you don't use them.
`, 'ch5/companions');

(function (C) {
  'use strict';
  const B = (comp, scene, map, cond) => C.banter.push({ comp, map: map || 'lf.*', if: cond, scene });
  B('nao', 'lf.b_nao1', 'lf.*', '!lf_bell_rung');
  B('nao', 'lf.b_nao2', 'lf.*', '!quest.lf_nao=done');
  B('nao', 'lf.b_nao3', 'lf.tower_*');
  B('nao', 'lf.b_nao3', 'lf.bellhall');
  B('nao', 'lf.b_nao4', 'lf.*', 'lf_bell_rung');
  B('mio', 'lf.b_mio1', 'lf.*', '!lf_bell_rung');
  B('mio', 'lf.b_mio2', 'lf.*');
  B('mio', 'lf.b_mio3', 'lf.tower_*');
  B('mio', 'lf.b_mio3', 'lf.bellhall');
  B('mio', 'lf.b_mio4', 'lf.*', 'lf_bell_rung');
  B('ren', 'lf.b_ren1', 'lf.*', '!lf_bell_rung');
  B('ren', 'lf.b_ren2', 'lf.*');
  B('ren', 'lf.b_ren3', 'lf.tower_*');
  B('ren', 'lf.b_ren4', 'lf.*', 'lf_bell_rung');
  B('suzu', 'lf.b_suzu1', 'lf.*', '!lf_bell_rung');
  B('suzu', 'lf.b_suzu2', 'lf.*');
  B('suzu', 'lf.b_suzu3', 'lf.tower_*');
  B('suzu', 'lf.b_suzu3', 'lf.bellhall');
  B('suzu', 'lf.b_suzu4', 'lf.*', 'lf_bell_rung');
})(RB.content);
