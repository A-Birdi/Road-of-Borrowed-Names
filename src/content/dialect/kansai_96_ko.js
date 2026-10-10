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
`);
