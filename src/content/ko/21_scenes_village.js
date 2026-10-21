/* Kotonoha, Chapter 9: the village and the leaves (expansion P11; R4, A32 transfer, W1). Otoha, the eldest keeper,
 * and what the island holds (S1, S5: what is lost by ordinary means, and lately stray pages; never the taken names);
 * her request. Leaf returning: each leaf carries a word or a line lost from a place the party has been; read it, work
 * out where it was lost, and send it home from the Wind Stone; back on the mainland the place has it again (one line
 * from someone there, once). Eight leaves, one for each place on the way here; three returned move the chapter on,
 * and the rest can go home whenever.
 *
 *   leaf  text                     lost from                                  found
 *   rw    あまい おだんご あります   Hana's teahouse sign, Reedwake (the storm)   the shore
 *   sg    われもの ちゅうい         Asahi's glass crates, Saltglass              the shore
 *   mb    荷物置き場                 the porters' yard board, Manybridge          Ao's basket
 *   mp    満員御礼                   a playbill, Playhouse Row                    Otoha's gift
 *   co    干し柿                     Grandma Ume's drying-rack tag, Cinder Orchard the lower terraces
 *   sb    春には帰ります             a letter's last line, Snowbell's post        the lower terraces
 *   kr    峠の灯                     the pass lantern's plate, the Keepers' Road  the tide pools
 *   lf    はんたい                   the council's old minutes, Lanternfall       Ōmi's letter
 */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const T = (jp, en) => ({ jp, en });
  const it = (id, d) => (C.items[id] = d);
  const leaf = (k, jp, en, desc) => it('ko_leaf_' + k, { name: T('{葉|は} ・ 「' + jp + '」', 'A leaf: "' + en + '"'), key: true, desc });
  leaf('rw', 'あまい おだんご あります', 'Sweet dumplings today', 'A written leaf from Kotonoha\'s drift line. Brush-written, in a hand used to signboards.');
  leaf('sg', 'われもの ちゅうい', 'Fragile: take care', 'A written leaf from the drift line, the letters stencilled rather than written, the way crates are marked.');
  leaf('mb', '{荷物|にもつ} {置|お}き{場|ば}', 'Baggage here', 'A leaf from Ao\'s basket: big square characters, the kind painted on a board for people in a hurry.');
  leaf('mp', '{満員|まんいん} {御礼|おんれい}', 'Full house, with thanks', 'A leaf Otoha gave you: fat, festive brushwork, the kind printed on a theatre\'s bill.');
  leaf('co', '{干|ほ}し{柿|がき}', 'Dried persimmons', 'A leaf from the lower terraces, the writing small and careful, like a tag on a rack.');
  leaf('sb', '{春|はる} に は {帰|かえ}ります', 'I\'ll be home in spring', 'A leaf from the lower terraces: one line in a letter-writer\'s hand, the last line of something.');
  leaf('kr', '{峠|とうげ} の {灯|ひ}', 'The Pass Light', 'A leaf from the tide pools, the characters cut rather than written, as on a lantern\'s plate.');
  leaf('lf', 'はんたい', 'Against', 'The leaf in Ōmi\'s letter: one word, in a thin, determined hand.');

  // back on the mainland: src/content/zz_ko_mainland.js (it runs after every chapter's people are in place)
})(RB.content);

RB.script.add(`
@scene ko.shore_enter
# Landing on the island once Lanternfall is over, by any way other than the ferry (the chapter begins at the jetty).
!call ko.begin

@scene ko.east_tide
narr: {東|ひがし} の {岩場|いわば} は 、 {潮|しお} に {沈|しず}んで いる 。 {潮|しお} が {引|ひ}けば 、 {向|む}こう へ {回|まわ}れ そう だ 。 || The rocks to the east are under the tide. When it goes out, it looks as if you could get round them.
?(ko_ch9) narr: {潮|しお} の {時刻|じこく} は 、 {西|にし} の {浜|はま} の コヨミ が {知|し}って いる らしい 。 || Koyomi, out on the west beach, is the one who knows the tides, they say.
!move pc left 1

@scene ko.otoha_first
# Staged: Otoha by the Wind Stone, a leaf between two fingers; she turns it to the light before she turns to you; her
# long look at each of you; she holds out a leaf; your companion's own answer.
!faceplayer
!set ko_otoha_met
?(ko_early_met) ko_otoha[smile]: また {会|あ}えました ね 。 {今度|こんど} は 、 {頼|たの}み{事|ごと} を {持|も}って 。 || We meet again. And this time I have a favour to ask.
?(!ko_early_met) ko_otoha: よく {来|き}て くれました 。 オトハ です 。 この {島|しま} の {葉守|はもり} の 、 {一番|いちばん} {年寄|としよ}り 。 || Thank you for coming. I am Otoha, the oldest of this island's keepers.
!gesture ko_otoha present pc prop=leaf
ko_otoha: この {島|しま} に は 、 なくした {言葉|ことば} が {流|なが}れ{着|つ}きます 。 {忘|わす}れられた {言葉|ことば} 、 {出|だ}さなかった {手紙|てがみ} 、 {海|うみ} に さらわれた {札|ふだ} の {字|じ} 。 || Lost words wash up on this island. Forgotten words, letters never sent, the writing off labels the sea carried away.
ko_otoha: {大|おお}きな {楠|くす} が 、 それ を {葉|は} に して {受|う}け{止|と}める 。 わたし たち は 、 {葉|は} を {拾|ひろ}って 、 {元|もと} の {場所|ばしょ} へ {返|かえ}す の です 。 || The great camphor catches them as leaves. We gather the leaves, and send them back where they came from.
ko_otoha[sad]: {近|ちか}ごろ は 、 {葉|は} が {多|おお}すぎる 。 {見|み}た こと の ない 、 {紙|かみ} の {切|き}れ{端|はし} の よう な {葉|は} まで {混|ま}じって いる 。 {木|き} が 、 {疲|つか}れて いる の です 。 || Lately there are too many. Some are like nothing I have seen: scraps, like torn-off pages. The tree is tired.
?(comp=nao) comp: {配達|はいたつ} が {間|ま}に{合|あ}わない って こと か 。 {分|わ}かる よ 。 || The deliveries can't keep up. I know how that is.
?(comp=mio) comp[worry]: {木|き} が {疲|つか}れる …… 。 {薬|くすり} で {治|なお}る もの なら いい のに 。 || The tree is tired… If only it were something medicine could mend.
?(comp=ren) comp: {灯|ひ} の {道|みち} で も 、 {名前|なまえ} が {消|き}える の が 、 {年|とし} ごと に {速|はや}く なって いました 。 || On the lantern roads too, the names were fading faster every year.
?(comp=suzu) comp: {稽古|けいこ} を {詰|つ}め{込|こ}みすぎた {役者|やくしゃ} みたい ね 。 {休|やす}ませて あげない と 。 || Like an actor rehearsed half to death. It needs a rest.
ko_otoha: {手|て} を {貸|か}して ください 。 {葉|は} を {読|よ}んで 、 どこ で なくした もの か を {考|かんが}えて 、 {風石|かぜいし} から {返|かえ}して ほしい 。 || Lend us your hands. Read a leaf, think where it was lost, and send it home from the Wind Stone.
?(mb2_done) ko_otoha: まず 、 これ を 。 {今朝|けさ} {拾|ひろ}った {葉|は} です 。 {賑|にぎ}やか な {字|じ} でしょう 。 || This one first. I picked it up this morning. Cheerful writing, isn't it.
?(mb2_done) !give ko_leaf_mp
?(item.ko_leaf_lf) ko_otoha: …… その {手紙|てがみ} の {葉|は} も 。 「はんたい」 。 {強|つよ}い {字|じ} です ね 。 {風石|かぜいし} なら 、 {帰|かえ}れます よ 。 || …And the leaf in that letter. はんたい. A strong hand. From the Wind Stone, it can go home.
!quest ko_main 2
!journal オトハ に {頼|たの}まれた 。 {葉|は} を {読|よ}んで 、 なくした {場所|ばしょ} を {考|かんが}え 、 {村|むら} の {風石|かぜいし} から {返|かえ}そう 。 {三枚|さんまい} {返|かえ}したら 、 また {話|はなし} を しよう 。 || Otoha has asked: read the leaves, work out where each was lost, and send them home from the village's Wind Stone. Three, and then talk to her again.

@scene ko.otoha_leaves
!faceplayer
ko_otoha: {葉|は} は 、 {浜|はま} に も 、 {下|しも} の {段|だん} に も 、 {潮|しお}だまり に も {落|お}ちて います 。 アオ の {籠|かご} に も 、 {一枚|いちまい} {二枚|にまい} は ある でしょう 。 || There are leaves on the shore, on the lower terraces, at the tide pools. And one or two in Ao's basket, I expect.
ko_otoha: どこ で なくした か {分|わ}からない とき は 、 {字|じ} の {書|か}き{方|かた} を {見|み}なさい 。 {看板|かんばん} の {字|じ} 、 {手紙|てがみ} の {字|じ} 、 {彫|ほ}った {字|じ} 。 {字|じ} が {教|おし}えて くれます 。 || When you can't tell where one was lost, look at how it's written. A signboard's hand, a letter's hand, cut letters. The writing tells you.

@scene ko.otoha_early
!faceplayer
!set ko_early_met
ko_otoha: {船|ふね} で {来|き}た の です か 。 {珍|めずら}しい 。 この {島|しま} は 、 {地図|ちず} に は {載|の}って いない のに 。 || You came by your own boat? How unusual. This island isn't on any chart.
ko_otoha: {葉|は} を {見|み}て いきなさい 。 あなた が {通|とお}って きた {町|まち} の {言葉|ことば} も 、 {流|なが}れ{着|つ}いて いる かも しれません よ 。 || Look at the leaves while you're here. Words from the towns you've passed through may have washed up too.

@scene ko.otoha_after
!faceplayer
ko_otoha[smile]: {木|き} は 、 {落|お}ち{着|つ}きました 。 {葉|は} は まだ {流|なが}れ{着|つ}きます が 、 {拾|ひろ}える {数|かず} です 。 || The tree has settled. Leaves still wash up, but as many as we can gather.
ko_otoha: {残|のこ}って いる {葉|は} が あれば 、 いつ でも {風石|かぜいし} から {返|かえ}して ください 。 || If you have leaves left, send them home from the Wind Stone whenever you like.

@scene ko.otoha_post
!faceplayer
ko_otoha: {山|やま} の {上|うえ} で 、 {大|おお}きな こと が {終|お}わった そう です ね 。 {葉|は} の {流|なが}れ{方|かた} が 、 {変|か}わりました 。 || Something great was finished on the mountain, I hear. The way the leaves come in has changed.
ko_otoha: {紙|かみ} の {切|き}れ{端|はし} の よう な {葉|は} は 、 もう {来|き}ません 。 {来|く}る の は 、 {昔|むかし} から の {葉|は} だけ 。 {忘|わす}れられた {言葉|ことば} と 、 {出|だ}さなかった {手紙|てがみ} 。 …… それ で いい の です 。 || The leaves like torn pages don't come any more. Only the old kind: forgotten words, letters never sent. …That is as it should be.

@scene ko.windstone
# The Wind Stone: a leaf laid on it, named for the place that lost it, rides the wind home. Each leaf's task asks where
# (at the profile's tier); a wrong guess is explained and the leaf stays in hand to try again.
!if !ko_otoha_met -> early
narr: {風石|かぜいし} 。 {平|たい}ら な {石|いし} の {上|うえ} を 、 いつも {同|おな}じ {向|む}き の {風|かぜ} が {吹|ふ}いて いる 。 || The Wind Stone: a flat stone, with a wind always blowing over it the same way.
!choice
* [item.ko_leaf_rw] 「あまい おだんご あります」 || "Sweet dumplings today" -> rw
* [item.ko_leaf_sg] 「われもの ちゅうい」 || "Fragile: take care" -> sg
* [item.ko_leaf_mb] 「{荷物|にもつ} {置|お}き{場|ば}」 || "Baggage here" -> mb
* [item.ko_leaf_mp] 「{満員|まんいん} {御礼|おんれい}」 || "Full house, with thanks" -> mp
* [item.ko_leaf_co] 「{干|ほ}し{柿|がき}」 || "Dried persimmons" -> co
* [item.ko_leaf_sb] 「{春|はる} に は {帰|かえ}ります」 || "I'll be home in spring" -> sb
* [item.ko_leaf_kr] 「{峠|とうげ} の {灯|ひ}」 || "The Pass Light" -> kr
* [item.ko_leaf_lf] 「はんたい」 || "Against" -> lf
* [quest.ko_myname=1] {自分|じぶん} の {返事|へんじ} の {葉|は} || Your own answer, on a fresh leaf -> myname
* {今|いま} は {返|かえ}さない 。 || Not now. -> end
:myname
!call ko.myname_reply
!end
:rw
!challenge ko.ret_rw
!if var._res=1 -> rw_ok
!goto miss
:rw_ok
!call ko.sent_rw
!goto after
:sg
!challenge ko.ret_sg
!if var._res=1 -> sg_ok
!goto miss
:sg_ok
!call ko.sent_sg
!goto after
:mb
!challenge ko.ret_mb
!if var._res=1 -> mb_ok
!goto miss
:mb_ok
!call ko.sent_mb
!goto after
:mp
!challenge ko.ret_mp
!if var._res=1 -> mp_ok
!goto miss
:mp_ok
!call ko.sent_mp
!goto after
:co
!challenge ko.ret_co
!if var._res=1 -> co_ok
!goto miss
:co_ok
!call ko.sent_co
!goto after
:sb
!challenge ko.ret_sb
!if var._res=1 -> sb_ok
!goto miss
:sb_ok
!call ko.sent_sb
!goto after
:kr
!challenge ko.ret_kr
!if var._res=1 -> kr_ok
!goto miss
:kr_ok
!call ko.sent_kr
!goto after
:lf
!challenge ko.ret_lf
!if var._res=1 -> lf_ok
!goto miss
:lf_ok
!call ko.sent_lf
!goto after
:miss
narr: {葉|は} は {石|いし} の {上|うえ} で {一度|いちど} {震|ふる}えて 、 {動|うご}かなかった 。 {風|かぜ} は 、 {行|い}き{先|さき} の {分|わ}からない {葉|は} を {運|はこ}ばない らしい 。 || The leaf trembles once on the stone and doesn't move. The wind, it seems, won't carry a leaf that doesn't know where it's going.
!end
:after
?(ko_ch9&quest.ko_main=2&var.ko_ret>=3) !call ko.three_home
!end
:early
narr: {平|たい}ら な {石|いし} 。 その {上|うえ} だけ 、 {風|かぜ} が {同|おな}じ {向|む}き に {吹|ふ}いて いる 。 || A flat stone. Over it, and only over it, the wind blows always the same way.
:end

@scene ko.three_home
# The third leaf sent home in Chapter 9: Otoha has watched; the island's legend comes next.
!look ko_otoha pc
ko_otoha[smile]: {三枚|さんまい} 。 {風|かぜ} が 、 {迷|まよ}わず に {運|はこ}んで いきました ね 。 || Three. And the wind carried them without hesitating.
ko_otoha: …… でも 、 {木|き} は まだ {落|お}とし{続|つづ}けて いる 。 {葉|は} を {返|かえ}す だけ で は 、 {足|た}りない の でしょう 。 || …But the tree is still shedding. Sending leaves home isn't enough, it seems.
ko_otoha: この {島|しま} の {始|はじ}まり の {話|はなし} を 、 {聞|き}いて ください 。 {語|かた}る {人|ひと} ごと に 、 {少|すこ}し ずつ {違|ちが}う {話|はなし} です 。 {館|やかた} に 、 {並|なら}べて みて ほしい 。 || Hear how this island began. Each teller tells it a little differently. Set the tellings out side by side in the hall, would you.
!quest ko_main 3
!journal {島|しま} の {始|はじ}まり の {話|はなし} を 、 オトハ 、 ナミ 、 ハマジ 、 そして {潮|しお}だまり の {法螺貝|ほらがい} から {聞|き}いて 、 {葉守|はもり} の {館|やかた} に {並|なら}べよう 。 || Hear how the island began from Otoha, Nami, Hamaji and the conches at the tide pools, and set it out in the keepers' hall.

@scene ko.sent_rw
!take ko_leaf_rw
!set ko_ret_rw
!var ko_ret + 1
!sfx wind
!beat leafhome.east
narr: {葉|は} が {浮|う}き{上|あ}がって 、 {東|ひがし} へ 。 {葦|あし}ノ{瀬|せ} の {茶屋|ちゃや} の {看板|かんばん} へ 、 {帰|かえ}って いく 。 || The leaf lifts, and away east: home to the sign over Reedwake's teahouse.
!beat leafhome.end
!toast {葉|は} が {葦|あし}ノ{瀬|せ} へ {帰|かえ}った || A leaf has gone home to Reedwake
@scene ko.sent_sg
!take ko_leaf_sg
!set ko_ret_sg
!var ko_ret + 1
!sfx wind
!beat leafhome.east
narr: {葉|は} は {潮硝子|しおがらす} の {方|ほう} へ 。 アサヒ の {硝子|がらす} の {箱|はこ} に 、 {字|じ} が {戻|もど}る だろう 。 || The leaf goes Saltglass's way. Asahi's glass crates will have their warning back.
!beat leafhome.end
!toast {葉|は} が {潮硝子|しおがらす} へ {帰|かえ}った || A leaf has gone home to Saltglass
@scene ko.sent_mb
!take ko_leaf_mb
!set ko_ret_mb
!var ko_ret + 1
!sfx wind
!beat leafhome.east
narr: {葉|は} は {八百橋|やおばし} の {方|ほう} へ 。 {人足|にんそく} たち の {荷置|にお}き{場|ば} の {板|いた} に 、 {字|じ} が {戻|もど}る 。 || The leaf goes Manybridge's way, home to the board over the porters' yard.
!beat leafhome.end
!toast {葉|は} が {八百橋|やおばし} へ {帰|かえ}った || A leaf has gone home to Manybridge
@scene ko.sent_mp
!take ko_leaf_mp
!set ko_ret_mp
!var ko_ret + 1
!sfx wind
!beat leafhome.east
narr: {葉|は} は {芝居町|しばいまち} の {方|ほう} へ 。 {古|ふる}い {番付|ばんづけ} に 、 {賑|にぎ}やか な {字|じ} が {戻|もど}る 。 || The leaf goes the way of Playhouse Row: home to an old playbill, cheerful writing and all.
!beat leafhome.end
!toast {葉|は} が {芝居町|しばいまち} へ {帰|かえ}った || A leaf has gone home to Playhouse Row
@scene ko.sent_co
!take ko_leaf_co
!set ko_ret_co
!var ko_ret + 1
!sfx wind
!beat leafhome.east
narr: {葉|は} は {灰実|はいみ} の {里|さと} の {方|ほう} へ 。 ウメ さん の {干|ほ}し{場|ば} の {札|ふだ} へ {帰|かえ}る 。 || The leaf goes Cinder Orchard's way, home to the tag on Grandma Ume's drying rack.
!beat leafhome.end
!toast {葉|は} が {灰実|はいみ} の {里|さと} へ {帰|かえ}った || A leaf has gone home to Cinder Orchard
@scene ko.sent_sb
!take ko_leaf_sb
!set ko_ret_sb
!var ko_ret + 1
!sfx wind
!beat leafhome.north
narr: {葉|は} は {北|きた} の {山|やま} の {方|ほう} へ 。 {雪鈴|ゆきすず} の {郵便局|ゆうびんきょく} の 、 {誰|だれ} か の {手紙|てがみ} へ 。 || The leaf goes north, towards the mountains: home to someone's letter at Snowbell's post office.
!beat leafhome.end
!toast {葉|は} が {雪鈴|ゆきすず} へ {帰|かえ}った || A leaf has gone home to Snowbell
@scene ko.sent_kr
!take ko_leaf_kr
!set ko_ret_kr
!var ko_ret + 1
!sfx wind
!beat leafhome.east
narr: {葉|は} は {山|やま} の {尾根|おね} の {方|ほう} へ 。 {峠|とうげ} の {灯籠|とうろう} の {名札|なふだ} へ {帰|かえ}る 。 || The leaf goes towards the mountain ridge: home to the plate on the lantern at the pass.
!beat leafhome.end
!toast {葉|は} が {灯守|ひもり} の {道|みち} へ {帰|かえ}った || A leaf has gone home to the Keepers' Road
@scene ko.sent_lf
!take ko_leaf_lf
!set ko_ret_lf
!var ko_ret + 1
!sfx wind
!beat leafhome.east
narr: {葉|は} は {灯落|ひおち} の {方|ほう} へ 。 {議会|ぎかい} の {古|ふる}い {議事録|ぎじろく} の 、 {空|あ}いて いた {所|ところ} へ 。 || The leaf goes Lanternfall's way: home to a blank in the council's oldest minutes.
!beat leafhome.end
!toast {葉|は} が {灯落|ひおち} へ {帰|かえ}った || A leaf has gone home to Lanternfall

@scene ko.leaf_rw
!gesture pc kneel
narr: {砂|すな} の {上|うえ} の {葉|は} 。 {看板|かんばん} の よう な {筆|ふで} の {字|じ} で 、 「あまい おだんご あります」 。 || A leaf on the sand. In a signboard's brushwork: "Sweet dumplings today".
!give ko_leaf_rw
@scene ko.leaf_sg
!gesture pc kneel
narr: {波打|なみう}ち{際|ぎわ} の {葉|は} 。 {型|かた} で {刷|す}った よう な {字|じ} で 、 「われもの ちゅうい」 。 || A leaf at the water's edge. Stencilled, it looks like: "Fragile: take care".
!give ko_leaf_sg
@scene ko.leaf_co
!gesture pc kneel
narr: {石段|いしだん} の {隅|すみ} の {葉|は} 。 {小|ちい}さく 、 {丁寧|ていねい} な {字|じ} で 、 「{干|ほ}し{柿|がき}」 。 || A leaf in the corner of the steps. Small, careful writing: "Dried persimmons".
!give ko_leaf_co
@scene ko.leaf_sb
!gesture pc kneel
narr: {根|ね} の {間|あいだ} の {葉|は} 。 {手紙|てがみ} の {字|じ} で 、 {一行|いちぎょう} だけ 。 「{春|はる} に は {帰|かえ}ります」 。 || A leaf between the roots. One line, in a letter-writer's hand: "I'll be home in spring".
!give ko_leaf_sb
@scene ko.leaf_kr
!gesture pc kneel
narr: {潮|しお}だまり の {縁|ふち} の {葉|は} 。 {字|じ} は {書|か}いた ので は なく 、 {彫|ほ}った よう に {見|み}える 。 「{峠|とうげ} の {灯|ひ}」 。 || A leaf on the rim of a pool. The characters look cut rather than written: "The Pass Light".
!give ko_leaf_kr

@scene ko.back_rw
!faceplayer
hana[surprise]: ねえ 、 {聞|き}いて ！ {嵐|あらし} で {消|き}えた {店|みせ} の {看板|かんばん} の {字|じ} が 、 {今朝|けさ} {戻|もど}って いた の 。 「あまい おだんご あります」 って 。 || Listen to this! The words on my sign that the storm washed off: this morning, they were back. "Sweet dumplings today".
hana[smile]: {誰|だれ} が {書|か}いた の かしら 。 わたし の {字|じ} な のに 。 || Who wrote it, I wonder? It's my own handwriting.
@scene ko.back_sg
!faceplayer
asahi[surprise]: {不思議|ふしぎ} な こと が ある もん だ ね 。 {硝子|がらす} の {箱|はこ} の 「われもの ちゅうい」 、 {消|き}えてた のに 、 {戻|もど}って きた 。 || Funny thing. The "Fragile: take care" on my glass crates had worn off, and now it's back.
asahi[smile]: これ で {港|みなと} の {連中|れんちゅう} も 、 {箱|はこ} を {投|な}げない だろう よ 。 || Maybe now the dock lot will stop throwing them about.
@scene ko.back_mb
!faceplayer
mb_take: おう 、 {聞|き}いた か 。 {荷置|にお}き{場|ば} の {板|いた} 、 {真|ま}っ{白|しろ} だった のに 、 「{荷物|にもつ} {置|お}き{場|ば}」 って {字|じ} が {戻|もど}って きた ぜ 。 || Hey, heard? The board over the porters' yard was blank, and now it says "Baggage here" again.
mb_take: これ で {客|きゃく} に {百回|ひゃっかい} {同|おな}じ こと を {言|い}わなくて {済|す}む ！ || That's a hundred times a day I don't have to say it!
@scene ko.back_mp
!faceplayer
mp_manbe[happy]: {見|み}て くれ 、 {古|ふる}い {番付|ばんづけ} だ ！ 「{満員|まんいん} {御礼|おんれい}」 の {字|じ} が 、 いつ の {間|ま} に か {戻|もど}って いた 。 || Look at this, an old playbill! "Full house, with thanks": the words came back when nobody was looking.
mp_manbe: {縁起|えんぎ} が いい 。 {次|つぎ} の {興行|こうぎょう} も 、 {満員|まんいん} {間違|まちが}い なし だ ！ || A good omen. The next run will be a full house, no doubt about it!
@scene ko.back_co
!faceplayer
co_ume[smile]: {干|ほ}し{場|ば} の {札|ふだ} に 、 「{干|ほ}し{柿|がき}」 って {字|じ} が {戻|もど}った ん だ よ 。 {孫|まご} が {書|か}いて くれた {札|ふだ} さ 。 || The tag on my drying rack: "Dried persimmons" is back on it. My grandchild wrote that tag for me.
co_ume: {消|き}えた とき は 、 {少|すこ}し {寂|さび}しかった けど ね 。 || I was a little sad when it faded.
@scene ko.back_sb
!faceplayer
sousuke: {届|とど}け{先|さき} の {分|わ}からない {手紙|てがみ} が {一通|いっつう} ありまして ね 。 {最後|さいご} の {一行|いちぎょう} が {消|き}えて いた んです 。 || There's a letter here I couldn't deliver. Its last line had faded away.
sousuke[smile]: {今朝|けさ} {見|み}たら 、 {戻|もど}って いました 。 「{春|はる} に は {帰|かえ}ります」 。 …… {宛名|あてな} も 、 {読|よ}める よう に なりました 。 {届|とど}けられます よ 。 || This morning it was back. "I'll be home in spring." …And the address is readable now too. I can deliver it.
@scene ko.back_kr
!faceplayer
kr_aya[surprise]: {峠|とうげ} の {灯籠|とうろう} の {名札|なふだ} 、 {見|み}ました ？ 「{峠|とうげ} の {灯|ひ}」 。 {字|じ} が {戻|もど}って いる の 。 || Have you seen the plate on the lantern at the pass? "The Pass Light". The characters are back.
kr_aya: ヒサエ さん が 、 {名札|なふだ} を {撫|な}でて 、 {泣|な}いて いた そう よ 。 || Hisae ran her hand over the plate and cried, they say.
@scene ko.back_lf
!faceplayer
lf_yae: {古|ふる}い {議事録|ぎじろく} を {見|み}て いたら 、 {空|あ}いて いた {所|ところ} に {字|じ} が {入|はい}って いた の 。 {私|わたし} が {生|う}まれる {前|まえ} の {議事録|ぎじろく} よ 。 || I was going through the old minutes, and where there'd been a blank, there was a word. Minutes from before I was born.
lf_yae[smile]: 「はんたい」 。 …… {昔|むかし} も 、 ちゃんと {言|い}った {人|ひと} が いた の ね 。 || はんたい. …So somebody said it, back then too.
`);
