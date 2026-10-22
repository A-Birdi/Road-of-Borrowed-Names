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
      // where it leads, named (RBN-QA-081): the exhibition's flag is set inside the tellings sheet, which the guide
      // cannot see, so derived it named the next chapter's tide instead. Once the panels hang, Otoha (whose talk opens
      // the hollow); before that, the first telling still missing, in the order Otoha gives them (her own, Nami's,
      // Hamaji's), then each conch not yet heard, then a conch again if all three were heard but their sheet was left
      // (any one opens it, ko.shells_check), then the desk in the hall. Kotonoha's routines wait for ko_done, so all
      // three keepers stand in the village throughout.
      Object.assign(T('{島|しま} の {言|い}い{伝|つた}え を {四|よっ}つ {集|あつ}めて 、 {葉守|はもり} の {館|やかた} に {並|なら}べよう 。', 'Gather four tellings of the island\'s legend, and set them out in the keepers\' hall.'), { atIf: [
        { if: 'tell_ko.t_hall_ok', at: { map: 'ko.village', npc: 'ko_otoha' } },
        { if: '!ko_tell_otoha', at: { map: 'ko.village', npc: 'ko_otoha' } },
        { if: '!ko_tell_nami', at: { map: 'ko.village', npc: 'ko_nami' } },
        { if: '!ko_tell_hamaji', at: { map: 'ko.village', npc: 'ko_hamaji' } },
        { if: '!ko_tell_shell&!ko_shell_a', at: { map: 'ko.tidepools', prop: 'ko_conch', x: 7, y: 9 } },
        { if: '!ko_tell_shell&!ko_shell_b', at: { map: 'ko.tidepools', prop: 'ko_conch', x: 18, y: 15 } },
        { if: '!ko_tell_shell&!ko_shell_c', at: { map: 'ko.tidepools', prop: 'ko_conch', x: 24, y: 11 } },
        { if: '!ko_tell_shell', at: { map: 'ko.tidepools', prop: 'ko_conch', x: 7, y: 9 } },
        { if: '!tell_ko.t_hall_ok', at: { map: 'ko.hall', prop: 'desk', x: 11, y: 6 } },
      ] }),
      // where it leads, named (RBN-QA-086): the next step, the tide splitting the party in the Tidal Hollow, lies behind
      // the Whispering Hollow's way down, which opens only once its drifting leaf has its word back (ko_root_a,
      // ko.root_leaf_a), and the guide does not route through a way that is shut, so derived it named the Tidal Hollow
      // with "no way there". Until then, the drifting leaf (ko.roots1 4,10); after it, derived as before.
      Object.assign(T('{大|おお}きな {木|き} は 、 {根|ね} から {葉|は} を {落|お}として いる 。 {根|ね} の {洞|ほら} へ {下|お}りよう 。', 'The great tree is shedding from its roots. Go down into the Root Hollows.'), { atIf: [
        { if: '!ko_root_a', at: { map: 'ko.roots1', prop: 'ko_current', x: 4, y: 10 } },
      ] }),
      T('{潮|しお} が {満|み}ちて 、 {仲間|なかま} と {離|はな}れて しまった 。 {回|まわ}り{道|みち} を {探|さが}そう 。', 'The tide has come in between you and your companion. Find a way round.'),
      T('{根|ね} の {奥|おく} で 、 {届|とど}かぬ {言葉|ことば} の {庭守|にわもり} に {会|あ}おう 。', 'Meet the Gardener of Unsent Words, deep in the roots.'),
      T('{木|き} は {静|しず}か に なった 。 オトハ に {知|し}らせよう 。', 'The tree is quiet again. Tell Otoha.'),
    ],
    reward: { flags: ['ko_main_done'] },
  };
})(RB.content);
