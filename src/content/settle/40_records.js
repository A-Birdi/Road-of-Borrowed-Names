/* Ashihara Shinden: its journal entry and records (expansion P15f; plan R7; K1, K2). One entry in four parts, a stamp
 * for the village become a place (hidden until then, spoiler-safe), the travel volume's page of its first festival
 * (witnessed that night, revealable before by confirmation: H1), and the villagers' gift, a planting hat to wear. No
 * money, no upkeep: nothing here ever needs looking after again (R7). */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  const J = (jp, en) => ({ jp, en });
  const at = (o, a) => Object.assign(o, { at: a });
  C.quests.as_main = { chapter: 'sa', title: J('{葦原|あしはら}{新田|しんでん}', 'Ashihara Shinden'), reward: { flags: ['as_main_done'] }, stages: [
    at(J('{村|むら} の {三|みっ}つ の {道|みち} に 、 {名前|なまえ} を つけよう 。', 'Name the village\'s three roads.'), { map: 'as.village', npc: 'as_mitsue' }),
    at(J('{掲示板|けいじばん} に 、 {最初|さいしょ} の {知|し}らせ を {書|か}こう 。', 'Write the first notices for the board.'), { map: 'as.village', npc: 'as_mitsue' }),
    at(J('{村|むら} の {二|ふた}つ の {喧嘩|けんか} の {間|あいだ} に {入|はい}ろう 。', 'Step in between the village\'s two quarrels.'), { map: 'as.village', npc: 'as_yoshizo' }),
    at(J('{村|むら} の {最初|さいしょ} の {祭|まつ}り を {支度|したく} しよう 。', 'Prepare the village\'s first festival.'), { map: 'as.village', npc: 'as_mitsue' }),
  ] };
  C.questOnly = C.questOnly || {};
  C.questOnly.as_main = 'ed>=2&postgame';
  C.stamps = C.stamps || {};
  C.stamps['as.village'] = { id: 'as.village', family: 'region', title: T('A Village with Names', '{名前|なまえ} の ある {村|むら}'), hidden: true, stand: null,
    when: 'ed>=2&as_fest_done', criteria: T('A new village, helped to become a place.', '{新|あたら}しい {村|むら}'), design: { shape: 'square', motif: 'path', ink: '#5a7a3a' } };
  if (RB.volume) RB.volume.add({ id: 'as.festival', chapter: 12, kind: 'settlement', special: true, flag: 'as_fest_done', title: T('The First Festival', '{最初|さいしょ} の {祭|まつ}り'), plate: '{最初|さいしょ} の {祭|まつ}り',
    criteria: { en: 'A new village\'s first festival night.', jp: '{新|あたら}しい {村|むら} の {最初|さいしょ} の {祭|まつ}り' } });
  C.items = C.items || {};
  C.items.as_kasa = { name: T('Planting hat', '{田植|たう}え の {笠|かさ}'), desc: 'A sedge hat from the villagers of Ashihara Shinden, the kind worn for planting rice. A keepsake: it changes only how you look.', slot: 'cosmetic', acc: 'hat', wear: { hatCol: '#c8a860' } };
})(RB.content);
