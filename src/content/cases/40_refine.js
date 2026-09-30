/* One refined choice/interpretation sequence per region (addendum §14.8) and
 * the four keepsakes bound to them (§17.2). The original challenges, their
 * correct forms and their profile tiers are unchanged; what is added is
 * clearer feedback when the player steps away, a visible or inspectable
 * consequence where one was missing, Known Details entries whose state
 * follows the real flags (src/content/cases/60_known.js), and a short local
 * acknowledgement after the real milestone. Older saves past a milestone
 * claim the keepsake once from the same person or place. Audit and details:
 * docs/addendum/cases.md.
 *   Reedwake — the Mill Road candidates: audited only (worker D1 owns the
 *     Mill Road repair and its scenes).
 *   Saltglass — Shiori's tide table (sg.c_tidetable): the tide board outside
 *     gets its times chalked in; Shell Button from Shiori.
 *   Cinder Orchard — the kiln firing order (co.c_kiln): Clay Swallow from Nobu.
 *   Snowbell — Hoshino's observing log (sb.c_log): Star Rosette from a box of
 *     paper stars Hoshino leaves out for whoever read the log.
 *   Lanternfall — the three linked gate plates (lf.ch_gate1–3): Thread Spool
 *     from Tokuji, who keeps the gates, after the bell rings.
 *   The Still Archive — the charter at the water gate (sa.charter): feedback. */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  RB.hooks = RB.hooks || {};
  // !hook cs_keepsake <id>: record a keepsake from a refined sequence (once)
  RB.hooks.cs_keepsake = async (args) => {
    const k = RB.content.keepsakes[args[0]];
    RB.discovery.keepsake(RB.game.s, args[0], k ? k.source : null);
  };
  // the tide board's chalked times (drawn over the board once Shiori has read the table with you)
  const P = RB.props.P;
  // h: 2 so it sorts after the board it is drawn on (a non-blocking prop is
  // otherwise drawn a little early, under whatever stands on its tile).
  P.cs_tidechalk = { id: 'cs_tidechalk', w: 2, h: 2, block: false, draw(c, x, y) {
    // Shiori's chalk: a ring on the high and the low of the curve, and a
    // row of written figures beside each (the words live in the scene).
    c.fillStyle = '#fff0b0';
    c.fillRect(x + 9, y - 6, 3, 1); c.fillRect(x + 9, y - 3, 3, 1); c.fillRect(x + 8, y - 5, 1, 2); c.fillRect(x + 12, y - 5, 1, 2);
    c.fillRect(x + 21, y + 2, 3, 1); c.fillRect(x + 21, y + 5, 3, 1); c.fillRect(x + 20, y + 3, 1, 2); c.fillRect(x + 24, y + 3, 1, 2);
    for (let i = 0; i < 3; i++) c.fillRect(x + 15 + i * 3, y - 5, 2, 3);
    for (let i = 0; i < 3; i++) c.fillRect(x + 5 + i * 3, y + 2, 2, 3);
  } };
})();

RB.script.add(`
@scene cs.tidepost
!if !sg_tide_read -> old
narr: {外|そと} の {潮見|しおみ} の {板|いた} 。 {空白|くうはく} だった ところ に 、 シオリ の {字|じ} で {時刻|じこく} が {書|か}き{込|こ}まれて いる 。 || The tide board outside. Where the times were blank, Shiori has chalked them in.
narr: 「 {満潮|まんちょう} {午前|ごぜん} {九時|くじ} ・ {干潮|かんちょう} {午後|ごご} {三時|さんじ} {十五分|じゅうごふん} 。 {岬|みさき} の {道|みち} は 、 {干潮|かんちょう} の {前後|ぜんご} {一時間|いちじかん} 」 。 || "High tide 9:00 a.m. — low tide 3:15 p.m. The causeway: an hour either side of low tide."
!end
:old
!call sg.tidepost

@scene cs.shell_shiori
shiori: {潮|しお} の {表|ひょう} 、 {正|ただ}しく {読|よ}んで くれました ね 。 {時間|じかん} が かかって も 、 {正|ただ}しければ それ で いい の です 。 || You read the tide table right. However long it takes, right is what matters.
shiori: {棚|たな} の {瓶|びん} から 、 {貝|かい} の ボタン を {一|ひと}つ どうぞ 。 {浜|はま} の {貝|かい} で {作|つく}った もの です 。 {潮|しお} を {読|よ}めた {人|ひと} に は 、 {渡|わた}す こと に して います 。 || Take a shell button from the jar on the shelf. I cut them from shells on the beach. I give one to everyone who has read the tide.
?(comp=mio) comp[smile]: {大|おお}きさ の {順|じゅん} に {並|なら}べた {貝殻|かいがら} の 、 {隣|となり} の {瓶|びん} です ね 。 || The jar next to the shells I sorted by size.
!hook cs_keepsake shell_button
narr: {貝|かい} の ボタン を もらった 。 || You receive a shell button.

@scene cs.swallow_nobu
co_nobu: {大窯|おおがま} の {札|ふだ} を 、 {順番|じゅんばん} {通|どお}り に {読|よ}んだ の は お{前|まえ} さん だって な 。 || So you're the one who read the Great Kiln's tiles in the right order.
co_nobu: トモエ の {字|じ} を 、 {誰|だれ} か が ちゃんと {読|よ}んだ 。 それ で {十分|じゅうぶん} だ 。 || Someone read Tomoe's hand properly. That's enough.
co_nobu: ほら 、 その {週|しゅう} に うち の {窯|かま} で {焼|や}いた {燕|つばめ} だ 。 {持|も}って いけ 。 {割|わ}る な よ 。 || Here. A swallow I fired in my own kiln that week. Take it. Don't break it.
!hook cs_keepsake clay_swallow
narr: {土|つち} の {燕|つばめ} を もらった 。 || You receive a clay swallow.

@scene cs.rosette_box
narr: {低|ひく}い {棚|たな} に {小|ちい}さな {箱|はこ} 。 {折|お}り{紙|がみ} の {星|ほし} が たくさん {入|はい}って いる 。 || A small box on a low shelf, full of folded paper stars.
narr: {蓋|ふた} に ホシノ の {字|じ} 。 「 {日誌|にっし} を {読|よ}んで くれた {人|ひと} へ 。 {一|ひと}つ {持|も}って いって ください 。 アカリ が {子|こ}ども の {頃|ころ} に {折|お}った もの です 。 」 || On the lid, in Hoshino's hand: "To whoever read the log. Please take one. Akari folded these as a child."
!if keepsake.star_rosette -> have
!choice
* {一|ひと}つ もらう || Take one -> take
* そのまま に する || Leave them -> end
:take
!hook cs_keepsake star_rosette
narr: {星|ほし} の {飾|かざ}り を {一|ひと}つ もらった 。 || You take one of the paper stars.
?(comp=ren) comp: {星|ほし} の {形|かたち} は {方角|ほうがく} を {教|おし}えて くれません が …… {持|も}って いる と 、 {迷|まよ}わない {気|き} が します 。 || A star-shape won't tell you which way is which… but holding one, I feel less lost.
!end
:have
narr: {星|ほし} は まだ たくさん ある 。 {一|ひと}つ で {十分|じゅうぶん} だ 。 || There are still plenty of stars. One is enough.

@scene cs.spool_tokuji
lf_tokuji: {塔|とう} の {札|ふだ} を {三枚|さんまい} とも 、 {読|よ}んだ {通|とお}り に {動|うご}かした そう だ な 。 || I hear you worked all three of the tower's plates exactly as they read.
lf_tokuji: {縄|なわ}ばしご を {繕|つくろ}った {糸|いと} の {余|あま}り だ 。 {小|ちい}さく {巻|ま}いて おいた 。 {持|も}って いけ 。 || Thread left over from mending the rope ladder. I wound it small. Take it.
lf_tokuji: {古|ふる}い もの も 、 {丁寧|ていねい} に {繕|つくろ}えば まだ {使|つか}える 。 {水門|すいもん} も 、 {町|まち} も な 。 || Old things still work if you mend them carefully. Gates. Towns.
!hook cs_keepsake thread_spool
narr: {糸巻|いとま}き を もらった 。 || You receive a thread spool.
`, 'cases/40_refine');
