/* Kotonoha, Chapter 9: the main quest (expansion P11). The side quests are in 15_side.js. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const T = (jp, en) => ({ jp, en });
  C.quests.ko_main = {
    main: true, chapter: 'ko',
    title: T('{言|こと}の{葉|は}{島|じま}', 'Kotonoha'),
    stages: [
      T('{港|みなと} に 、 {字|じ} の ある {葉|は} が {流|なが}れ{着|つ}いて いる 。 {潮硝子|しおがらす} から テツ の {船|ふね} で 、 {言|こと}の{葉|は}{島|じま} へ {渡|わた}ろう 。', 'Leaves with writing on them are washing up in Saltglass. Take Tetsu\'s ferry from Saltglass to Kotonoha.'),
      T('{島|しま} の {村|むら} で 、 {葉守|はもり} たち に {会|あ}おう 。', 'Find the island\'s keepers in the village.'),
      T('オトハ に {頼|たの}まれた 。 {流|なが}れ{着|つ}いた {葉|は} を 、 なくした {場所|ばしょ} へ {返|かえ}そう 。', 'Otoha has asked for help: return drifted leaves to the places that lost them.'),
      T('{島|しま} の {言|い}い{伝|つた}え を {四|よっ}つ {集|あつ}めて 、 {葉守|はもり} の {館|やかた} に {並|なら}べよう 。', 'Gather four tellings of the island\'s legend, and set them out in the keepers\' hall.'),
      T('{大|おお}きな {木|き} は 、 {根|ね} から {葉|は} を {落|お}として いる 。 {根|ね} の {洞|ほら} へ {下|お}りよう 。', 'The great tree is shedding from its roots. Go down into the Root Hollows.'),
      T('{潮|しお} が {満|み}ちて 、 {仲間|なかま} と {離|はな}れて しまった 。 {回|まわ}り{道|みち} を {探|さが}そう 。', 'The tide has come in between you and your companion. Find a way round.'),
      T('{根|ね} の {奥|おく} で 、 {届|とど}かぬ {言葉|ことば} の {庭守|にわもり} に {会|あ}おう 。', 'Meet the Gardener of Unsent Words, deep in the roots.'),
      T('{木|き} は {静|しず}か に なった 。 オトハ に {知|し}らせよう 。', 'The tree is quiet again. Tell Otoha.'),
    ],
    reward: { flags: ['ko_main_done'] },
  };
})(RB.content);
