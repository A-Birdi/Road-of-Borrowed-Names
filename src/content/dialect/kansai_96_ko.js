/* Suzu's Kansai-ben: Lanternfall's end and Kotonoha, Chapters 8–9 of a twelve-chapter journey (expansion P11). The
 * north fork in mist, the letter from Saltglass, the crossing, the island.
 * Format and rules: src/lang/85_dialect.js, docs/dialect/suzu_kansai.md.
 * "=" the standard line as authored (the key: its Japanese); ">" the Kansai version. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.dialect.add('kansai', `
@ lf2 [lf2.road_north_mist]
= {幕|まく} は まだ {上|あ}がらない みたい ね 。 {最終|さいしゅう} {幕|まく} の {前|まえ} に 、 {別|べつ} の {幕|まく} が ある の よ 。 || The curtain's not going up yet, it seems. There's another act before the last one.
> {幕|まく} は まだ {上|あ}がらへん みたい や な 。 {最終|さいしゅう} {幕|まく} の {前|まえ} に 、 {別|べつ} の {幕|まく} が ある ねん 。 || The curtain's not going up yet, it seems. There's another act before the last one.
@ ko/arrive [ko.call]
= 「{港長|こうちょう} オウミ」 。 …… あの {人|ひと} が {頼|たの}み{事|ごと} の {手紙|てがみ} を {書|か}く なんて ね 。 {次|つぎ} の {幕|まく} は {海|うみ} の {上|うえ} よ 。 || "Ōmi, Harbourmaster." …Her, writing a letter asking for help. The next act's out at sea.
> 「{港長|こうちょう} オウミ」 。 …… あの {人|ひと} が {頼|たの}み{事|ごと} の {手紙|てがみ} を {書|か}く なんて な 。 {次|つぎ} の {幕|まく} は {海|うみ} の {上|うえ} や で 。 || "Ōmi, Harbourmaster." …Her, writing a letter asking for help. The next act's out at sea.
@ ko/arrive [ko.ferry_tetsu]
= {島|しま} へ {渡|わた}る {船旅|ふなたび} ！ {舞台|ぶたい} が {海|うみ} の {上|うえ} に {移|うつ}る わけ ね 。 || A voyage out to an island! The stage moves out to sea.
> {島|しま} へ {渡|わた}る {船旅|ふなたび} や ！ {舞台|ぶたい} が {海|うみ} の {上|うえ} に {移|うつ}る わけ や な 。 || A voyage out to an island! The stage moves out to sea.
@ ko/arrive [ko.first_sight]
= {紙吹雪|かみふぶき} みたい ね 。 …… {拍手|はくしゅ} の {代|か}わり に 、 {言葉|ことば} が {降|ふ}って くる {舞台|ぶたい} 。 || Like a shower of paper confetti. …A stage where words come down instead of applause.
> {紙吹雪|かみふぶき} みたい や な 。 …… {拍手|はくしゅ} の {代|か}わり に 、 {言葉|ことば} が {降|ふ}って くる {舞台|ぶたい} や 。 || Like a shower of paper confetti. …A stage where words come down instead of applause.
@ ko/arrive [ko.begin]
= {裏方|うらかた} が {足|た}りない {舞台|ぶたい} ね 。 {任|まか}せて 。 {人手|ひとで} なら 、 ここ に {二人|ふたり} いる わ 。 || A show that's short of stagehands. Leave it to us. There are two pairs of hands right here.
> {裏方|うらかた} が {足|た}りへん {舞台|ぶたい} や な 。 {任|まか}せとき 。 {人手|ひとで} なら 、 ここ に {二人|ふたり} おる で 。 || A show that's short of stagehands. Leave it to us. There are two pairs of hands right here.
@ ko/village [ko.otoha_first]
= {稽古|けいこ} を {詰|つ}め{込|こ}みすぎた {役者|やくしゃ} みたい ね 。 {休|やす}ませて あげない と 。 || Like an actor rehearsed half to death. It needs a rest.
> {稽古|けいこ} を {詰|つ}め{込|こ}みすぎた {役者|やくしゃ} みたい や な 。 {休|やす}ませて あげな あかん 。 || Like an actor rehearsed half to death. It needs a rest.
@ ko/story [ko.otoha_tellings]
= {奈落|ならく} に {下|お}りる の は 、 {慣|な}れてる わ 。 {舞台|ぶたい} の {下|した} に は 、 いつも {何|なに} か ある の よ 。 || Going down below stage, I'm used to. There's always something under the boards.
> {奈落|ならく} に {下|お}りる の は 、 {慣|な}れてる で 。 {舞台|ぶたい} の {下|した} に は 、 いつも {何|なに} か ある ねん 。 || Going down below stage, I'm used to. There's always something under the boards.
@ ko/story [ko.shells_check]
= {妹|いもうと} さん 、 いい {台詞|せりふ} {言|い}う じゃない 。 {姉|あね} の {肩|かた} を {持|も}つ {妹|いもうと} 。 …… {嫌|きら}い じゃ ない わ 。 || The little sister's got good lines. A sister sticking up for her sister. …I don't mind that at all.
> {妹|いもうと} さん 、 ええ {台詞|せりふ} {言|い}う やん 。 {姉|あね} の {肩|かた} を {持|も}つ {妹|いもうと} 。 …… {嫌|きら}い や ない で 。 || The little sister's got good lines. A sister sticking up for her sister. …I don't mind that at all.
@ ko/story [ko.hall_exhibit]
= {三幕|さんまく} {物|もの} の {出来上|できあ}がり 。 {演出|えんしゅつ} は 、 あなた 。 || A play in three acts, done. Directed by you.
> {三幕|さんまく} {物|もの} の {出来上|できあ}がり や 。 {演出|えんしゅつ} は 、 あんた 。 || A play in three acts, done. Directed by you.
@ ko/story [ko.crown_first]
= {緞帳|どんちょう} みたい ね 。 {上|あ}がらない {緞帳|どんちょう} 。 || Like a stage curtain. One that never goes up.
> {緞帳|どんちょう} みたい や な 。 {上|あ}がらへん {緞帳|どんちょう} 。 || Like a stage curtain. One that never goes up.
@ ko/story [ko.roots_enter]
= {奈落|ならく} より {暗|くら}い わ ね 。 …… {大丈夫|だいじょうぶ} 、 {出口|でぐち} は いつも ある もの よ 。 || Darker than any understage. …Don't worry, there's always a way out.
> {奈落|ならく} より {暗|くら}い な 。 …… {大丈夫|だいじょうぶ} 、 {出口|でぐち} は いつも ある もん や 。 || Darker than any understage. …Don't worry, there's always a way out.
@ ko/story [ko.tide_split]
= …… {大丈夫|だいじょうぶ} 、 {幕間|まくあい} よ 、 {幕間|まくあい} ！ {次|つぎ} の {幕|まく} で {会|あ}いましょう 。 {出番|でばん} {忘|わす}れたら 、 {承知|しょうち} しない から ね ！ || …It's all right, it's just the interval! See you in the next act. Miss your cue and I'll never forgive you!
> …… {大丈夫|だいじょうぶ} 、 {幕間|まくあい} や 、 {幕間|まくあい} ！ {次|つぎ} の {幕|まく} で {会|あ}おう 。 {出番|でばん} {忘|わす}れたら 、 {承知|しょうち} せえへん で ！ || …It's all right, it's just the interval! See you in the next act. Miss your cue and I'll never forgive you!
@ ko/story [ko.reunion]
= お{帰|かえ}り なさい 、 {主役|しゅやく} さん 。 {出番|でばん} 、 ぎりぎり {間|ま}に{合|あ}った わ ね 。 || Welcome back, star of the show. Just made your cue.
> お{帰|かえ}り 、 {主役|しゅやく} さん 。 {出番|でばん} 、 ぎりぎり {間|ま}に{合|あ}った な 。 || Welcome back, star of the show. Just made your cue.
@ ko/story [ko.reunion]
= …… {本当|ほんとう} は 、 {怖|こわ}かった 。 {台本|だいほん} に {書|か}いて ない {場面|ばめん} は 、 {嫌|きら}い よ 。 || …Honestly? I was scared. I hate scenes that aren't in the script.
> …… ほんま は 、 {怖|こわ}かった 。 {台本|だいほん} に {書|か}いて へん {場面|ばめん} は 、 {嫌|きら}い や 。 || …Honestly? I was scared. I hate scenes that aren't in the script.
@ ko/story [ko.garden_enter]
= {客席|きゃくせき} {一杯|いっぱい} の 、 {言|い}えなかった {台詞|せりふ} 。 …… {静|しず}か に しなきゃ ね 。 || A full house of lines nobody ever got to say. …We should be quiet.
> {客席|きゃくせき} {一杯|いっぱい} の 、 {言|い}えへんかった {台詞|せりふ} 。 …… {静|しず}か に せな あかん な 。 || A full house of lines nobody ever got to say. …We should be quiet.
@ ko/story [ko.gardener]
= {言|い}わない {台詞|せりふ} が ある から 、 {言|い}う {台詞|せりふ} が {生|い}きる の よ 。 {名|めい}{演出|えんしゅつ} だった わ 。 || It's the lines you don't say that make the ones you do say count. Beautifully directed.
> {言|い}わへん {台詞|せりふ} が ある から 、 {言|い}う {台詞|せりふ} が {生|い}きる ねん 。 {名|めい}{演出|えんしゅつ} やった わ 。 || It's the lines you don't say that make the ones you do say count. Beautifully directed.
@ ko/story [ko.end]
= {最終|さいしゅう} {幕|まく} の {舞台|ぶたい} から 、 {紙吹雪|かみふぶき} が {先|さき} に {届|とど}いた って わけ ね 。 || So the confetti from the final act's stage got here ahead of us.
> {最終|さいしゅう} {幕|まく} の {舞台|ぶたい} から 、 {紙吹雪|かみふぶき} が {先|さき} に {届|とど}いた って わけ や な 。 || So the confetti from the final act's stage got here ahead of us.
@ ko/village [ko.ao_leaf]
= {裏方|うらかた} が いない と 、 {役者|やくしゃ} は {台詞|せりふ} も {言|い}えない の よ 。 {胸|むね} を {張|は}り なさい 。 || Without the stagehands, the actors couldn't say a line. Hold your head up.
> {裏方|うらかた} が おらん と 、 {役者|やくしゃ} は {台詞|せりふ} も {言|い}えへん ねん で 。 {胸|むね} を {張|は}り 。 || Without the stagehands, the actors couldn't say a line. Hold your head up.
@ ko/village [ko.seacave_first]
= …… {本物|ほんもの} の {舞台|ぶたい} より 、 {舞台|ぶたい} らしい わ 。 || …More of a stage than a real one.
> …… ほんま の {舞台|ぶたい} より 、 {舞台|ぶたい} らしい わ 。 || …More of a stage than a real one.
@ ko/side [ko.ao_ask]
= {稽古|けいこ} は {人|ひと} に {見|み}せない もの よ 。 {幕|まく} が {上|あ}がる まで は ね 。 || Rehearsals aren't for showing anyone. Not till the curtain goes up.
> {稽古|けいこ} は {人|ひと} に {見|み}せへん もん や 。 {幕|まく} が {上|あ}がる まで は な 。 || Rehearsals aren't for showing anyone. Not till the curtain goes up.
@ ko/side [ko.ao_reads]
= {初舞台|はつぶたい} の {台詞|せりふ} が 、 {自分|じぶん} の {名前|なまえ} ！ {大物|おおもの} に なる わ よ 、 この {子|こ} 。 || His first line on stage is his own name! This one'll be a star.
> {初舞台|はつぶたい} の {台詞|せりふ} が 、 {自分|じぶん} の {名前|なまえ} や ！ {大物|おおもの} に なる で 、 この {子|こ} 。 || His first line on stage is his own name! This one'll be a star.
@ ko/side [ko.kihei_ask]
= {出|だ}せなかった {手紙|てがみ} …… 。 {耳|みみ} の {痛|いた}い {話|はなし} ね 。 …… {探|さが}しましょう 。 || A letter never sent… That one stings a little. …Let's look.
> {出|だ}せへんかった {手紙|てがみ} …… 。 {耳|みみ} の {痛|いた}い {話|はなし} や な 。 …… {探|さが}しましょう 。 || A letter never sent… That one stings a little. …Let's look.
@ ko/side [ko.kihei_letter]
= {謝|あやま}る {手紙|てがみ} ね 。 …… {出|だ}せなかった の は 、 {船|ふね} の せい だけ じゃ ない かも ね 。 || A letter saying sorry. …Maybe it wasn't only the boat that kept it from being sent.
> {謝|あやま}る {手紙|てがみ} や な 。 …… {出|だ}せへんかった ん は 、 {船|ふね} の せい だけ と ちゃう かも な 。 || A letter saying sorry. …Maybe it wasn't only the boat that kept it from being sent.
@ ko/side [ko.kihei_choose]
= {幕|まく} の {下|お}ろし{方|かた} は 、 {役者|やくしゃ} じゃ なくて 、 {観|み}た {人|ひと} が {決|き}める もの よ 。 …… いい {幕|まく} だった わ 。 || How the curtain comes down isn't the actor's to say; it's the audience's. …It was a good one.
> {幕|まく} の {下|お}ろし{方|かた} は 、 {役者|やくしゃ} や なくて 、 {観|み}た {人|ひと} が {決|き}める もん や 。 …… ええ {幕|まく} やった で 。 || How the curtain comes down isn't the actor's to say; it's the audience's. …It was a good one.
@ ko/side [ko.myname_read]
= あら 、 {昔|むかし} の お{客|きゃく} さん から の {花束|はなたば} ね 。 お{礼|れい} の {挨拶|あいさつ} 、 しない と 。 || Well, flowers from an old audience. You'll have to take a bow back.
> あら 、 {昔|むかし} の お{客|きゃく} さん から の {花束|はなたば} や な 。 お{礼|れい} の {挨拶|あいさつ} 、 せな あかん で 。 || Well, flowers from an old audience. You'll have to take a bow back.
@ ko/side [ko.myname_reply]
= {返|かえ}し の {挨拶|あいさつ} 、 ちゃんと できた わ ね 。 …… {私|わたし} も 、 いつか しない と 。 || You took your bow properly. …I'll have to, one of these days.
> {返|かえ}し の {挨拶|あいさつ} 、 ちゃんと できた な 。 …… うち も 、 いつか せな あかん わ 。 || You took your bow properly. …I'll have to, one of these days.
@ ko/side [ko.census_report]
= {帳簿|ちょうぼ} を {付|つ}ける {人|ひと} は 、 {信用|しんよう} できる わ 。 …… {私|わたし} も {付|つ}けてる から {分|わ}かる の 。 || You can trust someone who keeps the books. …I keep them too, so I'd know.
> {帳簿|ちょうぼ} を {付|つ}ける {人|ひと} は 、 {信用|しんよう} できる で 。 …… うち も {付|つ}けてる から {分|わ}かる ねん 。 || You can trust someone who keeps the books. …I keep them too, so I'd know.
@ ko/side [ko.tide_night]
= …… {紙吹雪|かみふぶき} の {逆|ぎゃく} ね 。 {降|ふ}る の じゃ なくて 、 {昇|のぼ}って いく 。 {幕切|まくぎ}れ に は 、 もったいない くらい 。 || …Confetti in reverse. Not falling, rising. Almost too good for a final curtain.
> …… {紙吹雪|かみふぶき} の {逆|ぎゃく} や な 。 {降|ふ}る ん や なくて 、 {昇|のぼ}って いく 。 {幕切|まくぎ}れ に は 、 もったいない くらい や 。 || …Confetti in reverse. Not falling, rising. Almost too good for a final curtain.
@ ko/comp [ko.suzu_leaf]
= …… あら 。 {私|わたし} の {字|じ} 。 || …Oh. My handwriting.
> …… あら 。 うち の {字|じ} や 。 || …Oh. My handwriting.
= {書|か}きかけ の {返事|へんじ} ！ {捨|す}てた つもり だった のに 、 {海|うみ} を {渡|わた}って {来|く}る なんて 。 {律儀|りちぎ} な {葉|は} ね 。 || A half-written reply! I thought I'd thrown it away, and it's come all the way across the sea. What a dutiful leaf.
> {書|か}きかけ の {返事|へんじ} や ！ {捨|す}てた つもり やった のに 、 {海|うみ} を {渡|わた}って {来|く}る なんて 。 {律儀|りちぎ} な {葉|は} や な 。 || A half-written reply! I thought I'd thrown it away, and it's come all the way across the sea. What a dutiful leaf.
= …… 「なぜ か と いう と」 の {続|つづ}き 、 {書|か}けなかった の よ 。 {今|いま} も 、 {書|か}けない 。 || …I couldn't write what came after "The reason is". I still can't.
> …… 「なぜ か と いう と」 の {続|つづ}き 、 {書|か}けへんかった ねん 。 {今|いま} も 、 {書|か}けへん 。 || …I couldn't write what came after "The reason is". I still can't.
@ ko/comp [ko.suzu_stage]
= …… お{客|きゃく} さん が いる なら 、 やる しか ない わ ね 。 || …Well, if there's an audience, there's nothing for it.
> …… お{客|きゃく} さん が おる なら 、 やる しか ない な 。 || …Well, if there's an audience, there's nothing for it.
= さあ さあ 、 お{立|た}ち{会|あ}い ！ {言|こと}の{葉|は}{島|じま} の 、 {始|はじ}まり の {話|はなし} ！ || Roll up, roll up! The story of how Kotonoha began!
> さあ さあ 、 お{立|た}ち{会|あ}い ！ {言|こと}の{葉|は}{島|じま} の 、 {始|はじ}まり の {話|はなし} や で ！ || Roll up, roll up! The story of how Kotonoha began!
= むかし 、 {一人|ひとり} の {女|おんな} の {人|ひと} が 、 {届|とど}かない {言葉|ことば} の ため に 、 {海|うみ} の {真|ま}ん{中|なか} に {種|たね} を {植|う}えた ！ || Long ago, a woman planted a seed in the middle of the sea, for words that never arrive!
> むかし 、 {一人|ひとり} の {女|おんな} の {人|ひと} が 、 {届|とど}かへん {言葉|ことば} の ため に 、 {海|うみ} の {真|ま}ん{中|なか} に {種|たね} を {植|う}えた ん や ！ || Long ago, a woman planted a seed in the middle of the sea, for words that never arrive!
= むかし 、 {大|おお}きな {海蛇|うみへび} が {眠|ねむ}って いた 。 その {背中|せなか} に 、 ある {日|ひ} {木|き} が {生|は}えた ！ || Long ago a great sea serpent lay sleeping, and one day a tree grew on its back!
> むかし 、 {大|おお}きな {海蛇|うみへび} が {眠|ねむ}って おった 。 その {背中|せなか} に 、 ある {日|ひ} {木|き} が {生|は}えた ん や ！ || Long ago a great sea serpent lay sleeping, and one day a tree grew on its back!
= むかし 、 チトセ と いう {人|ひと} が 、 {自分|じぶん} と みんな の {手紙|てがみ} の ため に 、 {種|たね} を {植|う}えた ！ || Long ago, a woman called Chitose planted a seed, for her own letters and for everyone's!
> むかし 、 チトセ と いう {人|ひと} が 、 {自分|じぶん} と みんな の {手紙|てがみ} の ため に 、 {種|たね} を {植|う}えた ん や ！ || Long ago, a woman called Chitose planted a seed, for her own letters and for everyone's!
= そして {葉守|はもり} は {誓|ちか}った 。 {葉|は} は 、 {一枚|いちまい} {残|のこ}らず {元|もと} の {場所|ばしょ} へ ！ || And the keepers swore: every last leaf, back where it belongs!
> そして {葉守|はもり} は {誓|ちか}った ん や 。 {葉|は} は 、 {一枚|いちまい} {残|のこ}らず {元|もと} の {場所|ばしょ} へ ！ || And the keepers swore: every last leaf, back where it belongs!
= そして {舟|ふね} の {人|ひと} は {誓|ちか}った 。 どんな に {遠|とお}くて も 、 {届|とど}けて みせる ！ || And the boat people swore: however far, we'll get them there!
> そして {舟|ふね} の {人|ひと} は {誓|ちか}った ん や 。 どんな に {遠|とお}くて も 、 {届|とど}けて みせる で ！ || And the boat people swore: however far, we'll get them there!
= …… でも ね 、 {書|か}いた {人|ひと} だけ の {言葉|ことば} も ある の 。 それ は 、 そっと {仕舞|しま}って おく の よ 。 || …But some words belong only to the one who wrote them. Those, you put away gently.
> …… でも な 、 {書|か}いた {人|ひと} だけ の {言葉|ことば} も ある ねん 。 それ は 、 そっと {仕舞|しま}って おく ん や で 。 || …But some words belong only to the one who wrote them. Those, you put away gently.
= アンコール ？ …… {相方|あいかた} が いない と 、 {二幕目|にまくめ} は できない の よ 。 ねえ 、 $name ？ || An encore? …I can't do a second act without a partner. Can I, $name?
> アンコール ？ …… {相方|あいかた} が おらん と 、 {二幕目|にまくめ} は でけへん ねん 。 なあ 、 $name ？ || An encore? …I can't do a second act without a partner. Can I, $name?
@ sea [sea.sit_seal]
= {観客|かんきゃく} が {三人|さんにん} ！ {手|て} を {振|ふ}って おこう か な 。 || An audience of three! I'll give them a wave.
> {観客|かんきゃく} が {三人|さんにん} や ！ {手|て} を {振|ふ}って おこう か な 。 || An audience of three! I'll give them a wave.
`);
