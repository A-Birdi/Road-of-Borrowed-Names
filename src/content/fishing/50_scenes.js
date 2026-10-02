/* A Quiet Cast — the station scenes (Cast / Fishing notes / Rules / Leave,
 * addendum §20.1), Yasu's favour and thanks, and the signed note that
 * introduces the survey when he is elsewhere (§5.1). The hooks fish_intro and
 * fish_go are in src/ui/86_fishing.js: fish_go starts the activity once this
 * scene has ended (an activity never opens on top of a running scene). */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const station = (id, site, look) => `
@scene fish.station.${id}
!if !fish.intro -> note
:menu
narr: ${look}
!choice
* {竿|さお} を {出|だ}す || Cast. -> cast
* {釣|つ}り の {記録|きろく} を {見|み}る || Fishing notes. -> notes
* {釣|つ}り の きまり || Rules. -> rules
* {離|はな}れる || Leave. -> end
:cast
!hook fish_go ${site}
!end
:notes
!menu fishing
!end
:rules
!call fish.rules
!goto menu
:note
!call fish.note
!hook fish_intro note
!goto menu
`;
  RB.script.add(
    station('current', 'fish.reedwake.current', '{川岸|かわぎし} の {印|しるし} 。 {竿|さお} が {一本|いっぽん} 、 {杭|くい} に {立|た}てかけて ある 。 || The riverbank marker. A rod leans against the stake.') +
    station('quiet', 'fish.reedwake.quiet', '{池|いけ} の {浅|あさ}い ところ に {立|た}つ {杭|くい} 。 {竿|さお} が {一本|いっぽん} 、 {結|むす}びつけて ある 。 || A stake standing in the pond\'s shallows. A rod is tied to it.') +
    station('harbor', 'fish.saltglass.harbor', '{岸壁|がんぺき} の {下|した} の {杭|くい} 。 {竿|さお} が {一本|いっぽん} 、 {掛|か}けて ある 。 || A stake below the quay wall. A rod hangs on it.') + `
@scene fish.note
narr: {杭|くい} に 、 {紙|かみ} が {結|むす}んで ある 。 {字|じ} は ヤス の もの だ 。 || A note is tied to the stake, in Yasu's hand.
narr: 「 この {辺|へん} の {魚|さかな} を 、 {三種類|さんしゅるい} 、 {見|み}て {書|か}いて おいて くれ 。 {釣|つ}ったら よく {見|み}て 、 {同|おな}じ {水|みず} に {逃|に}がす こと 。 {竿|さお} は ここ に {置|お}いて おく 。 ―― ヤス 」 || "Note down three kinds of fish from round here for me. When you catch one, look at it properly, then let it go into the same water. The rod stays here. — Yasu"

@scene fish.rules
narr: {竿|さお} を {出|だ}す {場所|ばしょ} を 、 {三|みっ}つ の うち から {選|えら}ぶ 。 「{水|みず} を {探|さぐ}る」 なら 、 まだ {見|み}て いない {魚|さかな} の いる ところ へ {案内|あんない} する 。 || Choose one of three places to cast. "Discover the waters" takes you to where a fish you haven't seen yet can be found.
narr: {当|あ}たり が {来|き}たら 、 ヤス の メモ を {読|よ}んで 、 {日本語|にほんご} で {答|こた}える 。 {時間|じかん} の {制限|せいげん} は ない 。 {手助|てだす}け を {使|つか}って も 、 {魚|さかな} も {記録|きろく} も {変|か}わらない 。 || When something bites, read Yasu's note and answer in Japanese. There is no time limit. Using help changes neither the fish nor the record.
narr: {見|み}た {魚|さかな} は よく {観察|かんさつ} して から 、 {同|おな}じ {水|みず} に {逃|に}がす 。 いつ {離|はな}れて も 、 それ まで の {記録|きろく} は {残|のこ}る 。 || Observe each fish, then let it go into the same water. Leave whenever you like: the records so far stay.

@scene fish.yasu_intro
!call rw.yasu_post
yasu: ところ で 、 {一|ひと}つ {頼|たの}み が ある 。 この {辺|へん} の {魚|さかな} を 、 {少|すこ}し {書|か}き{留|と}めて おきたい 。 || By the way, I've a favour to ask. I'd like a few of the fish round here written down.
yasu: {釣|つ}って 、 よく {見|み}て 、 {逃|に}がして やって くれ 。 {三種類|さんしゅるい} で いい 。 {竿|さお} は 、 この {少|すこ}し {上|うえ} の {川岸|かわぎし} の {印|しるし} に {置|お}いて ある 。 || Catch them, have a proper look, and let them go. Three kinds will do. There's a rod at the marker on the bank, a little way up from here.
yasu[smile]: {灯|ひ}の{道|みち} の {池|いけ} と 、 {潮|しお}{硝子|がらす} の {波止場|はとば} に も 、 {印|しるし} を {立|た}てて おいた 。 {気|き} が {向|む}いたら な 。 || I've put markers by the pond on the Lantern Road and on the Saltglass quay too. If you feel like it.
!hook fish_intro yasu

@scene fish.yasu_thanks
!faceplayer yasu
yasu: {記録|きろく} 、 {見|み}た よ 。 {三種類|さんしゅるい} 、 ちゃんと {逃|に}がして くれた な 。 || I saw the record. Three kinds — and you let them all go.
yasu[smile]: {川|かわ} は {正直|しょうじき} だ 。 {見|み}た まま を {書|か}けば いい 。 {竿|さお} は あんた の {好|す}き に {使|つか}って くれ 。 || The river's honest. Write down what you see, that's all. Use the rod whenever you like.
`, 'fishing/scenes');
})();
