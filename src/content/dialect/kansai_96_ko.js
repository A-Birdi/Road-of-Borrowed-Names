/* Suzu's Kansai-ben: Lanternfall's end and Kotonoha, Chapters 8–9 of a twelve-chapter journey (expansion P11). The
 * north fork in mist, the letter from Saltglass, the crossing, the island.
 * Format and rules: src/lang/85_dialect.js, docs/dialect/suzu_kansai.md.
 * "=" the standard line as authored (the key: its Japanese); ">" the Kansai version. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.dialect.add('kansai', `
@ lf2 [lf.road_north_mist]
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
`);
