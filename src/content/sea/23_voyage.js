/* The maiden voyage and after (expansion P11b–d; the quest in 05_licence.js; the ports in src/content/sz/ and
 * src/content/el/). The mailbag delivered at both ends; the first voyage up the coast; sailing past East Landing while
 * it is silted; the island reached in your own boat, which finishes the licence (and is the island's early visit if
 * it is the first landing there). Fishing from the boat and at Sazanami are stations of the after-the-story pastime:
 * P15 (F-82). */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const T = (en) => ({ jp: '', en });
  // the first voyage up the coast; East Landing seen from the water while it is silted (once a journey)
  C.seaSituations.first_sz = { kind: 'first', first: 'saltglass-sazanami', scene: 'sea.sit_first_sz', log: T('First voyage up the coast to Sazanami.') };
  const sea = C.maps[C.seaMap || 'sea.coast'];
  sea.triggers = (sea.triggers || []).concat([{ x: 33, y: 3, w: 4, h: 7, scene: 'sea.pass_el', if: '!el_done', once: true, id: 'pass_el' }]);
  // the island by boat
  C.ports.kotonoha.arrive = 'sea.arrive_kotonoha';
})(RB.content);

RB.script.add(`
# ---- the maiden voyage ------------------------------------------------------------------------------------------------
@scene sea.post_check
# After each delivery: both bundles delivered moves the licence on.
!if sea_post_sz&sea_post_el -> both
!end
:both
!take sea_mailbag
!quest sea_licence 7
!journal {郵便|ゆうびん}{袋|ぶくろ} は {空|から} に なった 。 {港長|こうちょう} の {言|い}って いた {島|しま} の {噂|うわさ} 。 {漣|さざなみ} の {漁師|りょうし} に 、 {海|うみ} が {何|なに} を {運|はこ}んで {来|く}る か {聞|き}いて みよう 。 || The mailbag is empty. The harbourmaster's rumour of an island: ask Sazanami's fishers what the sea brings in.

@scene sea.sit_first_sz
narr: {岬|みさき} を {西|にし} へ {回|まわ}る と 、 {緑|みどり} の {斜面|しゃめん} の {下|した} に {網|あみ} の {干|ほ}して ある {村|むら} が {見|み}えた 。 || Round the point to the west, a village with nets hung to dry appears below a green slope.
?(var.sea_to=sazanami) narr: {漣|さざなみ} だ 。 {桟橋|さんばし} で 、 {誰|だれ} か が {手|て} を {振|ふ}って いる 。 || Sazanami. Someone on the jetty is waving.
?(!var.sea_to=sazanami) narr: {振|ふ}り{返|かえ}る と 、 {漣|さざなみ} の {網|あみ} が {風|かぜ} に {揺|ゆ}れて いた 。 || Looking back, Sazanami's nets sway in the wind.
!hook sail_log sight Sazanami's nets

@scene sea.pass_el
# Sailing past East Landing before it is rebuilt: too shallow to put in.
narr: {小|ちい}さな {入|い}り{江|え} 。 {砂|すな} が {溜|た}まって 、 {船|ふね} は {入|はい}れそう に ない 。 {桟橋|さんばし} の {根元|ねもと} で 、 {老人|ろうじん} が {一人|ひとり} 、 {箒|ほうき} を {止|と}めて こちら を {見|み}て いる 。 || A small inlet, silted with sand: no boat could get in. At the foot of a jetty an old man stops sweeping and watches you pass.
!hook sail_log sight East Landing, silted

# ---- the island in your own boat --------------------------------------------------------------------------------------
@scene sea.arrive_kotonoha
# Ashore on the island's jetty from your own boat. The first landing anywhere is the island's own first sight; the
# licence's last leg ends here.
?(!ko_arrived) !call ko.first_sight
!if quest.sea_licence=8 -> done
!end
:done
narr: $boat {丸|まる} を {桟橋|さんばし} に {繋|つな}ぐ 。 {港長|こうちょう} の {噂|うわさ} の {島|しま} に 、 {自分|じぶん} の {船|ふね} で {着|つ}いた 。 || You tie the $boat up at the jetty. The island of the harbourmaster's rumour, reached in your own boat.
!quest sea_licence done
!journal {自分|じぶん} の {船|ふね} で 、 {西|にし} の {島|しま} に {着|つ}いた 。 {外海|そとうみ} の {免状|めんじょう} の {旅|たび} は 、 ここ まで 。 || In my own boat, to the island out west. The licence's journey ends here.
!autosave
`);
