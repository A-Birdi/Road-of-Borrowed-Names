/* Chapter 4 main quest, part 3: the lamp that waited, rewriting Akari's
 * name, Hoshino's choice (shaped by the player's words), the reply letter
 * and the evening the lamp comes back. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
@scene sb.boss_pre
narr: {灯|あか}り に {近|ちか}づく と 、 {氷|こおり} の {中|なか} で 、 {青|あお}い {炎|ほのお} が ゆらり と {立|た}ち{上|あ}がった 。 || As you draw near the lamp, a blue flame rises and sways inside the ice.
sb_lampvoice: …… {誰|だれ} ？ {誰|だれ} か 、 {来|き}た の ？ || …Who's there? Has someone come?
sb_lampvoice: {違|ちが}う 。 あの {子|こ} じゃ ない 。 あの {子|こ} の {名前|なまえ} …… {思|おも}い{出|だ}せない 。 {思|おも}い{出|だ}せない のに 、 まだ {待|ま}って いる 。 || No. It isn't her. Her name… I can't remember it. I can't remember, and still I'm waiting.
sb_lampvoice: {待|ま}つ の は 、 {寒|さむ}い 。 {誰|だれ} も {見|み}て いない {夜|よる} は 、 もっと {寒|さむ}い 。 {帰|かえ}って 。 {寒|さむ}さ を {分|わ}けて あげる から 。 || Waiting is cold. Nights when no one is watching are colder still. Go away. Or I'll share the cold with you.
?(comp=nao) comp: {待|ま}ち{疲|つか}れた {灯|あか}り 、 か 。 …… {悪|わる}い が 、 {帰|かえ}る {気|き} は ない 。 {届|とど}け{物|もの} が ある んで な 。 || A lamp worn out from waiting. …Sorry, but we're not leaving. We've got a delivery.
?(comp=mio) comp[worry]: {冷|つめ}たい …… でも 、 {怒|おこ}って いる ん じゃ ない 。 {寂|さび}しい んです 。 {傷|きず}つけず に 、 {温|あたた}めましょう 。 || So cold… but it isn't angry. It's lonely. Let's warm it without hurting it.
?(comp=ren) comp: {名|な} を {失|うしな}って も 、 {約束|やくそく} だけ は {覚|おぼ}えて いる 。 …… {灯|ひ} と は 、 {健気|けなげ} な もの です 。 {行|い}きましょう 。 || It lost the name and still remembers the promise. …Lamps are loyal things. Let's go.
?(comp=suzu) comp: {最終幕|さいしゅうまく} だ よ 、 $name 。 {相手|あいて} は {悪役|あくやく} じゃ ない 。 {待|ま}ち{続|つづ}けた {役|やく} だ 。 {丁寧|ていねい} に {演|えん}じよう 。 || Final act, $name. It's not a villain. It's the one who kept on waiting. Let's play it with care.
!battle sb.boss noflee
!set sb_boss_done
!call sb.boss_after

@scene sb.boss_after
narr: {氷|こおり} が {溶|と}け 、 {青|あお}い {炎|ほのお} は {小|ちい}さく なって 、 {芯|しん} の {上|うえ} で {震|ふる}えて いる 。 || The ice melts away. The blue flame, grown small, trembles on the wick.
sb_lampvoice: …… {名前|なまえ} を 、 {呼|よ}んで 。 {書|か}いて 。 あの {子|こ} の {名前|なまえ} を 。 || …Call her name. Write it. Her name.
narr: {下|した} から 、 {梯子|はしご} を {上|のぼ}る {足音|あしおと} が {聞|き}こえた 。 {息|いき} を {切|き}らした ホシノ が {顔|かお} を {出|だ}す 。 {後|うし}ろ で デンジ が {支|ささ}えて いる 。 || From below comes the sound of feet on the ladder. Hoshino's head appears, out of breath, with Denji steadying him from behind.
?(sb_shortcut) hoshino: …… {裏|うら} の {階段|かいだん} が {開|あ}いて いた 。 デンジ の {自慢|じまん} の 、 {無駄|むだ} な {階段|かいだん} が ね 。 || …The back stair was open. Denji's pride and joy, that useless stair.
?(sb_shortcut) denji[smirk]: {無駄|むだ} じゃ なかった だろう が 。 || Wasn't so useless, was it.
?(!sb_shortcut) hoshino: …… {扉|とびら} が {全部|ぜんぶ} 、 {開|あ}いて いた 。 {一段|いちだん} ずつ 、 {君|きみ} たち の {足跡|あしあと} を {辿|たど}って きた よ 。 || …Every door was open. I followed your footprints one step at a time.
?(!sb_shortcut) denji: {裏|うら} の {階段|かいだん} を {開|あ}けて おけば 、 {半分|はんぶん} で {済|す}んだ んだ が な 。 || If you'd opened the back stair, it'd have been half the climb.
hoshino[sad]: …… ああ 。 {名前|なまえ} が 、 {消|き}えて いる 。 || …Ah. The name is gone.
hoshino: {書|か}こう と した んだ 。 {何度|なんど} も 。 {消|き}えた {晩|ばん} に 。 でも わたし の {字|じ} は {滲|にじ}んで 、 {笠|かさ} から {流|なが}れ{落|お}ちて しまった 。 || I tried to write it. Again and again, the night it went out. But my writing blurred and ran right off the shade.
?(comp=ren) comp: {静寂|しじま} に {取|と}られた {名|な} は 、 {取|と}られた {側|がわ} の {手|て} で は {戻|もど}りにくい 。 {外|そと} から {来|き}た {手|て} が {要|い}ります 。 …… $name 、 あなた の {字|じ} は {残|のこ}ります 。 {葦|あし}ノ{瀬|せ} で も そう だった 。 || A name taken by the Hush is hard to restore from the side it was taken from. It needs a hand from outside. …$name, your writing holds. It did in Reedwake too.
?(comp=nao) comp: $name の {字|じ} は {消|き}えない 。 {葦|あし}ノ{瀬|せ} から ずっと {見|み}てる 。 {書|か}いて やれ 。 || $name's writing doesn't fade. I've watched it since Reedwake. Write it for him.
?(comp=mio) comp[smile]: $name の {字|じ} なら 、 きっと {残|のこ}ります 。 わたし 、 {灯|あか}り を {持|も}って います から 。 ゆっくり で いい 。 || Your writing will stay, $name, I'm sure. I'll hold the light. Take your time.
?(comp=suzu) comp: {主役|しゅやく} の {名前|なまえ} を {呼|よ}ぶ {役|やく} は 、 $name に {譲|ゆず}る よ 。 {一番|いちばん} いい {台詞|せりふ} だ 。 || The part where the lead's name is called — that's yours, $name. It's the best line in the play.
hoshino: $name さん 。 …… {頼|たの}む 。 あの {子|こ} の {名前|なまえ} を 、 {書|か}いて くれ 。 || $name. …Please. Write her name.
!call sb.lamp_name

@scene sb.dome_hoshino
!if sb_lamp_lit -> reply
hoshino: {名前|なまえ} を …… {頼|たの}める かい 。 {書|か}ける とき で いい 。 || The name… may I ask you now? Only when you're ready.
!call sb.lamp_name
!end
:reply
!if item.sb_reply_letter -> done
hoshino: {手紙|てがみ} の {続|つづ}き を 、 {一緒|いっしょ} に {考|かんが}えて くれる かい 。 || Will you help me finish the letter?
!call sb.lamp_reply
!end
:done
hoshino[smile]: もう {少|すこ}し 、 ここ で {灯|あか}り を {見|み}て いる よ 。 {先|さき} に {下|お}りて おくれ 。 || I'll watch the lamp a little longer. Go on down ahead of me.

@scene sb.lamp_name
!lesson kana
!challenge sb.c_name
!if var._res=0 -> later
!set sb_name_done
!sfx lantern
narr: {笠|かさ} に {書|か}いた {字|じ} が 、 {滲|にじ}まず に {残|のこ}った 。 「 あかり 」 。 || The letters you wrote on the shade stay, without running: "Akari".
sb_lampvoice: …… あかり 。 そう 、 あかり 。 {待|ま}って いた の は 、 あかり 。 || …Akari. Yes. Akari. It was Akari I was waiting for.
narr: {青|あお}い {炎|ほのお} が 、 ゆっくり と {色|いろ} を {変|か}えて いく 。 {黄色|きいろ} に 、 {橙|だいだい} に 。 || The blue flame slowly changes colour — to yellow, then orange.
hoshino: …… ありがとう 。 || …Thank you.
hoshino: {火|ひ} を {入|い}れる {前|まえ} に 、 {一|ひと}つ {聞|き}いて も いい かな 。 || Before I light it — may I ask you one thing?
hoshino: この {灯|あか}り が {言|い}って いた こと が 、 {耳|みみ} に {残|のこ}って いる 。 「 {誰|だれ} も {見|み}て いない {夜|よる} は 、 もっと {寒|さむ}い 」 。 || What the lamp said stays in my ears. "Nights when no one is watching are colder still."
hoshino[think]: わたし は {何年|なんねん} も 、 あの {子|こ} が {見|み}て いる と {信|しん}じて 、 {灯|あか}り を ともして きた 。 {本当|ほんとう} に {見|み}て いた んだ と 、 {手紙|てがみ} で わかった 。 || For years I lit this lamp believing she was watching. The letters told me she truly was.
hoshino: でも …… あの {子|こ} が {待|ま}って いる の は 、 {灯|あか}り だろう か 。 {灯|あか}り の {向|む}こう の {誰|だれ} か だろう か 。 || But… is it the lamp she's waiting for? Or someone on the other side of it?
hoshino: わたし は ここ で {灯|あか}り を {守|まも}る べき か 。 それとも {山|やま} を {下|くだ}って 、 {会|あ}い に {行|い}く べき か 。 {君|きみ} なら 、 どう {言|い}う ？ || Should I stay here and keep the lamp? Or go down the mountain and see her? What would you say?
!choice
* {約束|やくそく} は 、 {誰|だれ} も {見|み}て いなくて も {約束|やくそく} です || A promise is a promise even when no one is watching. -> stay
* アカリ さん が {待|ま}って いる の は 、 ホシノ さん {本人|ほんにん} です || It's you Akari is waiting for, not the lamp. -> go
* {灯|あか}り を {人|ひと} に {預|あず}けて も 、 {約束|やくそく} は {消|き}えません || You could leave the lamp in someone's hands, and the promise wouldn't go out. -> both
:stay
!set sb_hoshino_stays
hoshino: …… そう だ ね 。 {見|み}られる ため に 、 ともして きた わけ じゃ なかった 。 あの {子|こ} が {帰|かえ}る {道|みち} を 、 {明|あか}るく して おきたかった だけ だ 。 || …Yes. I never lit it to be seen. I only wanted the road she'd come home by to be bright.
hoshino[smile]: ここ に {残|のこ}ろう 。 {毎晩|まいばん} 、 {上|のぼ}る よ 。 {膝|ひざ} が {文句|もんく} を {言|い}って も ね 。 そして {手紙|てがみ} を {書|か}く 。 {灯|あか}り は ここ に ある 、 {急|いそ}がなくて いい 、 と 。 || I'll stay. I'll climb up every night, however my knees complain. And I'll write to her: the lamp is here; there's no need to hurry.
?(comp=nao) comp: {急|いそ}がなくて いい 、 か 。 …… {配達人|はいたつにん} が {一番|いちばん} {言|い}われたい {言葉|ことば} だ な 。 || "No need to hurry." …The words a courier most wants to hear.
?(comp=mio) comp[smile]: {膝|ひざ} の {薬|くすり} 、 {置|お}いて いきます ね 。 {毎晩|まいばん} {上|のぼ}る なら 、 {必要|ひつよう} です から 。 || I'll leave you something for your knees. If you're climbing every night, you'll need it.
?(comp=ren) comp: {誰|だれ} も {見|み}て いない {夜|よる} に ともす {灯|あか}り こそ 、 {灯守|ひもり} の {灯|あか}り です 。 …… {師匠|ししょう} の {受|う}け{売|う}り です が 。 || A lamp lit on the nights no one is watching — that is a keeper's lamp. …My teacher's words, not mine.
?(comp=suzu) comp: {客席|きゃくせき} が {空|から} でも {幕|まく} を {上|あ}げる 。 …… {一番|いちばん} {難|むずか}しくて 、 {一番|いちばん} {格好|かっこう} いい やつ だ 。 || Raising the curtain on an empty house. …The hardest thing, and the finest.
!goto light
:go
!set sb_hoshino_goes
hoshino[surprise]: …… わたし {本人|ほんにん} 、 か 。 || …Me, myself.
hoshino: そう かも しれない 。 {灯|あか}り の {陰|かげ} に 、 わたし は {隠|かく}れて いた の かも しれない な 。 {灯|あか}り を ともして いれば 、 {会|あ}い に {行|い}かなくて も いい 。 そう {思|おも}って いた 。 || Perhaps. Perhaps I've been hiding behind the lamp. As long as I kept it lit, I didn't have to go and see her. That's what I told myself.
hoshino[smile]: {雪|ゆき} が {許|ゆる}したら 、 {下|くだ}ろう 。 {灯|あか}り は …… カンタ と フキ さん に {頼|たの}む 。 {約束|やくそく} を {人|ひと} に {預|あず}ける の は {怖|こわ}い が 、 {怖|こわ}い の は わたし だけ だ 。 || When the snow allows, I'll go down. The lamp… I'll ask Kanta and Fuki. Handing a promise to others frightens me, but I'm the only one it frightens.
?(comp=nao) comp: {自分|じぶん} で {届|とど}ける の が 、 {一番|いちばん} {確|たし}か だ 。 …… {耳|みみ} が {痛|いた}い な 、 {自分|じぶん} で {言|い}って て 。 || Delivering it yourself is the surest way. …Stings a bit, saying that.
?(comp=mio) comp[smile]: {灯落|ひおち} の {坂|さか} は {長|なが}い です 。 {靴|くつ} と {膝|ひざ} の {薬|くすり} 、 {用意|ようい} して おきます ね 。 || The road down to Lanternfall is long. I'll get your boots and something for your knees ready.
?(comp=ren) comp: {約束|やくそく} は {灯|あか}り に {宿|やど}り 、 {灯|あか}り は {人|ひと} から {人|ひと} へ {渡|わた}る 。 {名|な} は {灯|ひ} に 、 {灯|ひ} は {人|ひと} に 。 …… {正|ただ}しい {形|かたち} です 。 || A promise lives in a lamp, and a lamp passes from hand to hand. A name to the lamp, the lamp to people. …That's the proper shape of it.
?(comp=suzu) comp[smile]: {舞台|ぶたい} を {降|お}りて 、 {客席|きゃくせき} の {娘|むすめ} さん に {会|あ}い に {行|い}く 。 …… {最高|さいこう} の {終幕|しゅうまく} じゃ ない 。 || Stepping down off the stage to meet your daughter in the audience. …What a finale.
!goto light
:both
!set sb_hoshino_both
hoshino[think]: {預|あず}けて も 、 {消|き}えない …… 。 || Leave it with someone, and it won't go out…
hoshino[smile]: そう か 。 {灯|あか}り を {守|まも}る こと と 、 {会|あ}い に {行|い}く こと は 、 {片方|かたほう} を {選|えら}ぶ もの じゃ ない の か 。 || I see. Keeping the lamp and going to see her aren't a matter of choosing one.
hoshino: {春|はる} まで は 、 わたし が ともす 。 {春|はる} に なったら 、 カンタ と フキ さん に {頼|たの}んで 、 {会|あ}い に {行|い}く 。 そして 、 また {帰|かえ}って くる 。 {欲張|よくば}り だ ね 。 || Until spring, I'll light it. Come spring, I'll ask Kanta and Fuki to keep it and go to see her. And then I'll come back. Greedy of me.
?(comp=nao) comp[smirk]: {欲張|よくば}り で いい 。 {往復|おうふく} の {配達|はいたつ} は 、 {一番|いちばん} {割|わり} が いい んだ 。 || Greedy's fine. A round-trip delivery pays best.
?(comp=mio) comp[laugh]: {欲張|よくば}り な {人|ひと} の ほう が 、 {長生|ながい}き します よ 。 {薬師|くすし} の {経験|けいけん} {上|じょう} です 。 || Greedy people live longer. Speaking from an apothecary's experience.
?(comp=ren) comp: {灯|あか}り を {人|ひと} に {預|あず}ける {時間|じかん} も 、 {灯守|ひもり} の {仕事|しごと} の {一部|いちぶ} です 。 {休|やす}む こと も 、 {守|まも}る こと の {一部|いちぶ} 。 || Leaving the lamp in others' care for a while is part of a keeper's work too. Resting is part of keeping.
?(comp=suzu) comp: {巡業|じゅんぎょう} と {同|おな}じ だ ね 。 {行|い}って 、 {帰|かえ}って 、 また {行|い}く 。 {幕|まく} は {何度|なんど} でも {上|あ}がる 。 || Same as touring. You go, you come back, you go again. The curtain can rise as many times as you like.
:light
hoshino: …… さあ 、 {火|ひ} を {入|い}れよう 。 || …Now, let's light it.
narr: ホシノ が {古|ふる}い {火打|ひう}ち{石|いし} を {打|う}つ 。 {小|ちい}さな {火花|ひばな} に 、 あなた は {昨夜|ゆうべ} の {字|じ} を {添|そ}えた 。 {炎|ほのお} が 、 {芯|しん} を {抱|だ}く よう に {立|た}ち{上|あ}がる 。 || Hoshino strikes his old flint. To the tiny spark, you add last night's word. The flame rises as if embracing the wick.
!sfx light
!set sb_lamp_lit
!music sb_lamp
narr: {丸屋根|まるやね} の {窓|まど} から 、 {光|ひかり} が {夜|よる} の {山|やま} へ {流|なが}れ{出|だ}した 。 {谷|たに} を {越|こ}え 、 {南東|なんとう} へ 、 {灯落|ひおち} の ほう へ 。 || Light pours from the dome's window out into the mountain night — across the valley, southeast, toward Lanternfall.
?(comp=nao) comp[smile]: …… {届|とど}いた な 。 {宛名|あてな} なし でも 、 {届|とど}く もの が ある 。 || …It got there. Some things arrive even without an address.
?(comp=mio) comp[smile]: {温|あたた}かい 。 …… ちゃんと 、 {温|あたた}かい {灯|あか}り です 。 || Warm. …A properly warm light.
?(comp=ren) comp[smile]: 「 あかり 」 が 、 あかり を ともして いる 。 …… {今|いま} の は {駄洒落|だじゃれ} では ありません 。 {事実|じじつ} です 。 || "Akari" is making light. …That wasn't a pun. It's a fact.
?(comp=suzu) comp[laugh]: {照明|しょうめい} 、 よし ！ …… {拍手|はくしゅ} は 、 {下|した} の {村|むら} から {聞|き}こえて くる はず だ よ 。 || Lights — go! …The applause should come up from the village below.
!call sb.lamp_reply
!end
:later
hoshino: …… {急|いそ}がなくて いい 。 {灯|あか}り は 、 もう {少|すこ}し なら {待|ま}てる 。 {慣|な}れて いる から ね 。 {書|か}ける とき に 、 {声|こえ} を かけて おくれ 。 || …No need to hurry. The lamp can wait a little longer — it's used to that. Tell me when you're ready to write.

@scene sb.lamp_reply
hoshino: {手紙|てがみ} を {書|か}こう 。 {灯|あか}り の {下|した} で 。 …… {言葉|ことば} を {選|えら}ぶ の を 、 {手伝|てつだ}って くれる かい 。 || I'll write the letter. Here, under the lamp. …Will you help me choose the words?
!challenge sb.c_reply
!if var._res=0 -> later
narr: ホシノ は {最後|さいご} の {一行|いちぎょう} を {書|か}き 、 {丁寧|ていねい} に {封|ふう} を した 。 {宛名|あてな} の {欄|らん} は 、 {空|あ}けた まま だ 。 || Hoshino writes the last line and seals the envelope with care. He leaves the address blank.
hoshino: {宛名|あてな} は 、 {君|きみ} たち が {灯落|ひおち} で あの {子|こ} を {見|み}つけた とき に {書|か}いて おくれ 。 {君|きみ} たち の {字|じ} なら 、 {消|き}えない だろう 。 || Write the address when you find her in Lanternfall. Your writing won't fade.
!give sb_reply_letter
?(sb_hoshino_goes) hoshino: わたし が {着|つ}く より 、 きっと {君|きみ} たち の ほう が {早|はや}い 。 {父|ちち} が {行|い}く 、 と {伝|つた}えて おくれ 。 || You'll surely get there before I do. Tell her that her father is coming.
!set sb_evening
!fade out
!warp sb.hamlet 22 20 up
!fade in
!call sb.eve_start
!end
:later
hoshino: …… {年寄|としよ}り の {手紙|てがみ} は 、 {時間|じかん} が かかる 。 {言葉|ことば} が {決|き}まったら 、 また {声|こえ} を かけて おくれ 。 || …An old man's letters take time. When the words come to you, let me know.
`, 'ch4/end-lamp');

RB.script.add(`
@scene sb.eve_start
!set sb_evening_seen
!set sb_evening
!music sb_lamp
narr: {日|ひ} が {暮|く}れる と 、 {雪鈴|ゆきすず} の {人|ひと} たち は {広場|ひろば} に {集|あつ}まって 、 {北|きた} の {空|そら} を {見上|みあ}げた 。 || As night falls, the people of Snowbell gather in the square and look up at the northern sky.
narr: {山|やま} の {上|うえ} に 、 {灯|あか}り が ともって いる 。 {十日|とおか} {前|まえ} と {同|おな}じ {場所|ばしょ} に 、 {同|おな}じ {色|いろ} で 。 {石段|いしだん} の {灯|あか}り も 、 {一|ひと}つ {残|のこ}らず ついて いた 。 || On the mountain, the lamp is burning — in the same place as ten days ago, the same colour. Every lantern on the stair is lit too, every last one.
yae[laugh]: {十一日|じゅういちにち} ぶり ！ …… {数|かず} 、 ちゃんと {思|おも}い{出|だ}せる よ 。 {今|いま} なら 、 {何年|なんねん} {目|め} か も わかる 。 {十二年|じゅうにねん} よ 。 || Eleven days! …And I can remember the numbers properly now. I even know how many years it's been. Twelve.
sousuke[smile]: {袋|ふくろ} の {封筒|ふうとう} に 、 {宛名|あてな} が {戻|もど}って きました 。 {全部|ぜんぶ} です 。 {春|はる} に は 、 {全部|ぜんぶ} {届|とど}けられる 。 || The addresses have come back on the envelopes in the sack. All of them. Come spring, every one can be delivered.
?(comp=nao) comp: …… {宛名|あてな} が {戻|もど}った 、 か 。 {今日|きょう} {一番|いちばん} の {知|し}らせ だ 。 || …The addresses are back. Best news of the day.
?(comp=nao) comp[smile]: $name 。 {灯落|ひおち} に {着|つ}いたら 、 {話|はな}す こと が ある 。 {鞄|かばん} の {底|そこ} の {手紙|てがみ} の こと だ 。 || $name. When we get to Lanternfall, there's something I'll tell you. About the letter at the bottom of my bag.
?(comp=mio) comp[smile]: みんな の {顔|かお} 、 {明|あか}るい です ね 。 {灯|あか}り の せい だけ じゃ なくて 。 || Everyone looks so bright. And not only because of the lamp.
?(comp=mio) comp[think]: {灯落|ひおち} の {人|ひと} たち は 、 「 かしこまりました 」 しか {言|い}えない …… 。 アカリ さん の {手紙|てがみ} が 、 {気|き}に なります 。 {次|つぎ} は 、 わたし たち が {下|くだ}る {番|ばん} です ね 。 || The people in Lanternfall can only say "certainly"… I keep thinking about Akari's letter. Next it's our turn to go down.
?(comp=ren) comp[smile]: {石段|いしだん} の {灯|あか}り が 、 {上|うえ} の {灯|あか}り の {名前|なまえ} を {呼|よ}んで いる 。 {正|ただ}しい {夜|よる} です 。 || The stair lanterns are calling the name of the lamp above. A proper night.
?(comp=ren) comp: …… {南東|なんとう} の {光|ひかり} も 、 {見|み}えて います 。 {灯落|ひおち} の {上|うえ} 。 {師匠|ししょう} の {顔|かお} の {残|のこ}り が ある {場所|ばしょ} 。 {急|いそ}ぎません 。 でも 、 {行|い}きます 。 || …The light in the southeast is visible too. Above Lanternfall. Where the rest of my teacher's face is. I won't rush. But I will go.
?(comp=suzu) comp[laugh]: {満員|まんいん} の {客席|きゃくせき} が 、 {舞台|ぶたい} を {見上|みあ}げてる 。 {役者|やくしゃ} {冥利|みょうり} に {尽|つ}きる ね 。 {灯|あか}り の ほう が 。 || A packed house, all looking up at the stage. What an honour for the performer. The lamp, I mean.
?(comp=suzu) comp: {次|つぎ} の {町|まち} は {灯落|ひおち} 。 「 いいえ 」 が {言|い}えない {町|まち} 、 だった っけ 。 …… {台本|だいほん} を {読|よ}み{直|なお}して おこう 。 || Next town's Lanternfall. The town where nobody can say "no", wasn't it. …I'd better reread the script.
!quest sb_lamp done
!set ch4_done
!journal {雪鈴|ゆきすず} の {灯|あか}り が {戻|もど}った 。 ホシノ の {返事|へんじ} を {持|も}って 、 {灯落|ひおち} へ {下|くだ}ろう 。 || The light above Snowbell is back. Take Hoshino's reply down to Lanternfall.
!autosave
narr: {広場|ひろば} の {人|ひと} たち と {話|はな}したら 、 {南|みなみ} の {坂|さか} から {灯落|ひおち} へ {向|む}かおう 。 {吹|ふ}き{溜|だ}まり は 、 {明日|あした} の {朝|あさ} ハヤテ が {崩|くず}して くれる 。 || Talk with the people in the square, then head down the south road toward Lanternfall. Hayate will break up the drift in the morning.

@scene sb.next_day
!unset sb_evening
!set sb_after
narr: {雪見屋|ゆきみや} で {一晩|ひとばん} {休|やす}み 、 {朝|あさ} に なった 。 {坂|さか} の {下|した} から 、 シャベル の {音|おと} が {聞|き}こえる 。 || You spend the night at Yukimiya, and morning comes. From down the slope comes the sound of a shovel.
!heal
!autosave

@scene sb.next_day_inn
!unset sb_evening
!set sb_after
!fade out
narr: その {夜|よる} は 、 {雪見屋|ゆきみや} の {二階|にかい} で {休|やす}んだ 。 {窓|まど} の {外|そと} で は 、 {山|やま} の {上|うえ} の {灯|あか}り が 、 {朝|あさ} まで {消|き}えなかった 。 || That night you rest upstairs at Yukimiya. Outside the window, the lamp on the mountain stays lit until morning.
!heal
!fade in
narr: {朝|あさ} に なった 。 {坂|さか} の {下|した} の ほう から 、 シャベル の {音|おと} が {聞|き}こえる 。 ハヤテ が {灯落|ひおち} へ の {道|みち} を {開|あ}けて いる らしい 。 || Morning. From down the slope comes the sound of a shovel: Hayate is clearing the road to Lanternfall.
!autosave

@scene sb.eve_yae
yae[smile]: {帰|かえ}って きたら 、 {熱|あつ}い の を {用意|ようい} する って {言|い}った でしょ 。 {宿|やど} に {甘酒|あまざけ} が ある よ 。 {今夜|こんや} は {全部|ぜんぶ} {店|みせ} の おごり ！ || I said I'd have something hot ready when you got back. There's amazake at the inn. Tonight it's all on the house!

@scene sb.eve_tetsuji
tetsuji: …… {灯|あか}り が ある と 、 ヤギ が {落|お}ち{着|つ}く 。 {人|ひと} も な 。 || …With the lamp lit, the goats settle. People too.
?(quest.sb_goats=done) tetsuji: {子|こ}ヤギ に も 、 {見|み}せて やった 。 {分|わ}かって は いない だろう が な 。 || I showed the kids too. Not that they understood.
`, 'ch4/end-evening');
