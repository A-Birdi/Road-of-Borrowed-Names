/* Lanternfall in twelve-chapter journeys (Chapter 8 there; expansion P11). After the council the fork lantern has its
 * name back, but in a twelve-chapter journey the Still Archive is the last chapter, not the next: the road above the
 * fork stays in mist until Steamhollow is behind the party (`yn_done`), and the way on is the sea (Kotonoha,
 * src/content/ko/). The six-chapter game's north fork is unchanged (its exit and its lock keep their conditions). */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const road = C.maps['lf.road'];
  if (road) road.triggers.push({ x: 24, y: 1, w: 2, h: 1, scene: 'lf2.road_north_mist', if: 'ed>=2&ch5_done&!yn_done' });
})(RB.content);

RB.script.add(`
@scene lf2.yae_far
# The council's end in a twelve-chapter journey (lf.yae_after): the fork lantern's name is back, but the Archive is
# far, and the road above still in mist.
lf_yae: $name さん 。{山道|やまみち} の {灯籠|とうろう} に 、 {名前|なまえ} が {戻|もど}って いる はず です 。 …… でも 、 {書庫|しょこ} は {遠|とお}い 。 {上|うえ} の {道|みち} は 、 まだ {霧|きり} の {中|なか} でしょう 。 || $name. The lantern on the mountain road should have its name back. …But the Archive is far, and the road above it will still be in mist.

@scene lf2.road_north_mist
# Staged: the fork lantern burns with its name again, but a little above it the road still melts into mist; your
# companion answers it in kind (Nao looks back down towards the coast, Mio's hand at her head, Ren looks up the road
# at the dark lanterns beyond, Suzu's shrug), and you step back.
!walkto comp 24 3 up
!gesture pc lookroad up
narr: {分|わ}かれ{道|みち} の {灯籠|とうろう} に は 、 {名前|なまえ} が {戻|もど}って いる 。 でも 、 その {少|すこ}し {上|うえ} で 、 {道|みち} は まだ {霧|きり} に {溶|と}けて いる 。 || The fork lantern has its name back. But a little higher up, the road still melts into mist.
narr: {進|すす}もう と して も 、 {気|き} が つく と {灯籠|とうろう} の {下|した} に {戻|もど}って いる 。 || Try to go on, and you find yourself back under the lantern.
?(comp=nao) !gesture comp lookroad down
?(comp=nao) comp: {一|ひと}つ の {灯|ひ} じゃ 、 {山|やま} {全部|ぜんぶ} は {照|て}らせない か 。 …… {先|さき} に 、 {海|うみ} の {方|ほう} の {用|よう} を {済|す}ませよう 。 || One lantern can't light a whole mountain, then. …Let's see to the business by the sea first.
?(comp=mio) !gesture comp guard
?(comp=mio) comp[worry]: また {頭|あたま} が くらくら する 。 …… {今|いま} は 、 {登|のぼ}る {時|とき} じゃ ない みたい 。 || My head's spinning again. …It doesn't seem the time to climb.
?(comp=ren) !gesture comp lookroad up
?(comp=ren) comp[think]: {上|うえ} の {灯籠|とうろう} は 、 まだ {暗|くら}い まま です 。 {一|ひと}つ {戻|もど}して も 、 {道|みち} は {一本|いっぽん} の {灯|ひ} で は {続|つづ}かない 。 || The lanterns further up are still dark. Bring one back, and still a road doesn't run on a single light.
?(comp=suzu) !gesture comp shrug
?(comp=suzu) comp: {幕|まく} は まだ {上|あ}がらない みたい ね 。 {最終|さいしゅう} {幕|まく} の {前|まえ} に 、 {別|べつ} の {幕|まく} が ある の よ 。 || The curtain's not going up yet, it seems. There's another act before the last one.
!move pc down 1
`);
