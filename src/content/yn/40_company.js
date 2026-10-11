/* Steamhollow, Chapter 11: the companion (expansion P13g; plan R3 and 14_COMPANIONS.md). Bond events within the existing
 * Bond table (RB.company.award through !hook co_bond, once a journey each):
 *   yn:bath        the companion's bath scene, the first time you bathe anywhere in the valley (yn.bath_beat);
 *   yn:crossroads  Mio's (Kikue's offer of the dispensary) and Suzu's (Koume's offer of the old act) crossroads;
 *   yn:night       Mio's and Suzu's nights apart, ended (the dawn footbath; the inn's garden);
 *   yn:settled     Suzu's unfinished matter: the books shown openly to the troupe;
 *   yn:makeup      Nao's and Ren's quarrels over the mediation, made up the same evening (a quarrel never lowers Bond;
 *                  making up is the Bond event, C-59);
 *   yn:walk        the evening walk in yukata after the mediation (whichever answer you give at the one earlier
 *                  romance moment C-67 allows: Bond is the same either way).
 * Three kept memories for What We Keep: the footbath (Mio's dawn, or Nao's making up), the inn's garden (Suzu), the
 * lanterns (Ren). Twelve-chapter journeys only: the scenes are in Chapter 11. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const T = (jp, en) => ({ jp, en });
  const CC = C.company;
  CC.bondEvents = Object.assign(CC.bondEvents || {}, { 'yn:bath': 1, 'yn:crossroads': 1, 'yn:night': 1, 'yn:settled': 1, 'yn:makeup': 1, 'yn:walk': 1 });
  CC.mem.yn_footbath = {
    kind: 'together', title: T('{湯|ゆ}ノ{谷|たに} の {足湯|あしゆ}', 'The footbath at Steamhollow'), place: T('{湯|ゆ}ノ{谷|たに}', 'Steamhollow'),
    text: T('{湯|ゆ}ノ{谷|たに} の {足湯|あしゆ} で 、 {並|なら}んで {足|あし} を {温|あたた}めた 。', 'At Steamhollow you sat side by side with your feet in the footbath.'),
    texts: {
      mio: T('{棚田|たなだ} の {上|うえ} の {足湯|あしゆ} 。 {夜明|よあ}け に 、 ミオ は {一番|いちばん} {古|ふる}い {紙切|かみき}れ の {裏|うら} に {返事|へんじ} を {書|か}いた 。', 'The footbath above the terraces. At dawn Mio wrote her answer on the back of the oldest scrap in her jar.'),
      nao: T('{町|まち} の {足湯|あしゆ} 。 {言|い}い{過|す}ぎた と {謝|あやま}り{合|あ}って 、 ナオ は {初|はじ}めて {長|なが}く {座|すわ}って いた 。', 'The town footbath. You both said sorry for going too far, and Nao sat still a long time, for once.'),
    },
    keep: {
      mio: T('{役|やく}に {立|た}たない {日|ひ} も 、 {待|ま}って いて くれる 。 その {言葉|ことば} は 、 {棚|たな} の {一番|いちばん} {前|まえ} に {置|お}いて あります 。', 'You\'d wait for me on useless days too. Those words are at the very front of my shelf.'),
      nao: T('{座|すわ}る の が {下手|へた} な {飛脚|ひきゃく} が 、 {足湯|あしゆ} で {溶|と}けた {夜|よる} だ 。 {誰|だれ} に も {言|い}う な よ 。', 'The night a courier who can\'t sit still melted in a footbath. Don\'t tell anyone.'),
    },
  };
  CC.mem.yn_garden = {
    kind: 'together', title: T('{宿|やど} の {裏庭|うらにわ}', 'The inn\'s back garden'), place: T('{湯|ゆ}ノ{谷|たに}', 'Steamhollow'),
    text: T('{鈴虫|すずむし} の {鳴|な}く {裏庭|うらにわ} で 、 {夜|よる} {遅|おそ}く まで {話|はな}した 。', 'You talked late into the night in a back garden full of bell crickets.'),
    texts: { suzu: T('{鈴虫|すずむし} の {裏庭|うらにわ} 。 スズ は {一座|いちざ} に {戻|もど}らない と {決|き}め 、 {次|つぎ} の {幕|まく} の {相方|あいかた} を {選|えら}んだ 。', 'The garden of bell crickets. Suzu decided not to go back to the troupe, and chose her partner for the next act.') },
    keep: { suzu: T('{元手|もとで} が かかり{過|す}ぎてる って {言|い}った けど 、 {本当|ほんとう} は {一緒|いっしょ} に {立|た}ちたかった だけ よ 。', 'I said the investment was too great. Really, I just wanted to stand on a stage with you.') },
  };
  CC.mem.yn_lanterns = {
    kind: 'together', title: T('{谷|たに} の {提灯|ちょうちん}', 'The valley\'s lanterns'), place: T('{湯|ゆ}ノ{谷|たに}', 'Steamhollow'),
    text: T('{夕暮|ゆうぐ}れ に 、 {谷|たに} の {提灯|ちょうちん} が {一|ひと}つ ずつ {点|つ}いて いく の を {見|み}た 。', 'At dusk you watched the valley\'s lanterns come on, one by one.'),
    texts: { ren: T('{谷|たに} の {提灯|ちょうちん} 。 レン は トキ と {灯|ひ} を {入|い}れ ながら 、 {古|ふる}い {名前|なまえ} と {新|あたら}しい {名前|なまえ} を {一|ひと}つ の {灯|ひ} に した 。', 'The valley\'s lanterns. Lighting them with Toki, Ren put an old name and a new one on the same light.') },
    keep: { ren: T('{谷|たに} は {迷|まよ}って いた ん じゃ ない 。 {増|ふ}えた ん です 。 …… {今夜|こんや} の {灯|ひ} は 、 {全部|ぜんぶ} {名前|なまえ} を {覚|おぼ}えて います 。', 'The valley wasn\'t lost. It had grown. …I remember every one of tonight\'s lamps by name.') },
  };
})(RB.content);
