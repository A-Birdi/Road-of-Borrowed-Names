/* The Keepers' Road, Chapter 7: quests and items (expansion P10; docs/future/work/P10_KEEPERS.md). */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const T = (jp, en) => ({ jp, en });
  C.quests.kr_main = {
    main: true, chapter: 'kr',
    title: T('{灯守|ひもり} の {道|みち}', 'The Keepers\' Road'),
    stages: [
      T('{古|ふる}い {灯守|ひもり} の {道|みち} を {登|のぼ}ろう 。 {灯籠|とうろう} は 、 どれ も {消|き}えて いる 。', 'Climb the old keepers\' road. Every one of its lanterns is dark.'),
      T('{杉|すぎ} の {石段|いしだん} を {登|のぼ}って 、 {狐橋|きつねばし} の {里|さと} へ {行|い}こう 。', 'Climb the cedar steps to the hamlet at the Fox Bridge.'),
      T('{尾根|おね} を {越|こ}えて 、 {灯守|ひもり} の {宿坊|しゅくぼう} を {探|さが}そう 。', 'Cross the ridge and find the keepers\' lodge.'),
      T('ヒサエ に {頼|たの}まれた 。 {尾根|おね} の {灯籠|とうろう} に {灯|ひ} を {入|い}れて 、 {守|まも}ろう 。', 'Hisae has asked you to light the ridge\'s waystation lanterns, and keep them lit.'),
      T('{洞|ほら} の {灯籠|とうろう} を 、 {正|ただ}しい {順番|じゅんばん} で {点|つ}けよう 。 {言|い}い{伝|つた}え を {比|くら}べて 。', 'Light the cave\'s lanterns in the right order: weigh the tellings to find it.'),
      T('{書庫|しょこ} の {洞|ほら} の {奥|おく} で 、 {灯守|ひもり} の {記録|きろく} を {読|よ}もう 。', 'Read the keepers\' registers at the back of the scriptorium cave.'),
      T('{宿坊|しゅくぼう} で 、 {夜|よ}{通|どお}し の {灯|ひ} の {番|ばん} を しよう 。', 'Keep the vigil at the lodge, through the night.'),
      T('{夜|よ} が {明|あ}けた 。 {峠|とうげ} を {越|こ}えて 、 {灯落|ひおち} へ {下|くだ}ろう 。', 'Dawn. Cross the pass and go down to Lanternfall.'),
    ],
    reward: { flags: ['kr_main_done'] },
  };
  C.quests.kr_stamps = {
    chapter: 'kr',
    title: T('{巡礼|じゅんれい} の {御朱印帳|ごしゅいんちょう}', 'The Pilgrim\'s Stamp Book'),
    stages: [
      T('イワ さん の {御朱印帳|ごしゅいんちょう} が {落|お}ちて いた 。 {道|みち} の {先|さき} で {返|かえ}そう 。', 'Iwa\'s stamp book was lying on the road. Give it back to her further on.'),
      T('{灯|ひ} の {祠|ほこら} を {三|みっ}つ {回|まわ}って 、 {印|しるし} を もらおう 。', 'Visit the three lantern shrines and collect their seals.'),
    ],
    reward: { flags: ['kr_stamps_done'] },
  };
  C.quests.kr_fox = {
    chapter: 'kr',
    title: T('{狐橋|きつねばし} の {三|みっ}つ の {話|はなし}', 'Three Tellings of the Fox Bridge'),
    stages: [
      T('{狐橋|きつねばし} の {名前|なまえ} の {由来|ゆらい} を 、 {三人|さんにん} から {聞|き}こう 。', 'Hear how the Fox Bridge got its name, from three people.'),
      T('{里|さと} に {残|のこ}す {話|はなし} を 、 ショウゾウ と {決|き}めよう 。', 'Decide with Shōzō which telling the hamlet will keep.'),
    ],
    reward: { flags: ['kr_fox_done'] },
  };
  C.quests.kr_hisae = {
    chapter: 'kr',
    title: T('{残|のこ}った {灯守|ひもり}', 'The Keeper Who Stayed'),
    stages: [
      T('ヒサエ は 、 {灯守|ひもり} の {仲間|なかま} が まだ どこか に いる と {思|おも}って いる 。', 'Hisae believes there are still keepers somewhere on the roads.'),
      T('{本当|ほんとう} の こと を 、 どう {伝|つた}える か {決|き}めよう 。', 'Decide whether, and how, to tell her the truth.'),
    ],
    reward: { flags: ['kr_hisae_done'] },
  };
  C.quests.kr_cache = {
    chapter: 'kr',
    title: T('{油|あぶら} の {隠|かく}し{場所|ばしょ} の {歌|うた}', 'The Rhyme of the Oil Cache'),
    stages: [
      T('{子供|こども} たち の {数|かぞ}え{歌|うた} は 、 {地図|ちず} かも しれない 。', 'The children\'s counting rhyme may be a map.'),
      T('{尾根|おね} で 、 {灯守|ひもり} の {油|あぶら} を {探|さが}そう 。', 'Find the keepers\' oil on the ridge.'),
    ],
    reward: { flags: ['kr_cache_done'] },
  };
  C.quests.kr_inkstone = {
    chapter: 'kr',
    title: T('{師匠|ししょう} の {硯|すずり}', 'The Teacher\'s Inkstone'),
    stages: [
      T('ヒサエ が 、 ツル さん の {師匠|ししょう} の {硯|すずり} を {預|あず}かって いた 。', 'Hisae has kept an inkstone that belonged to Tsuru\'s teacher.'),
      T('{硯|すずり} を {葦|あし}ノ{瀬|せ} の ツル さん に {送|おく}ろう 。', 'Send the inkstone to Tsuru in Reedwake.'),
      T('ツル さん から 、 {返事|へんじ} が {届|とど}く の を {待|ま}とう 。', 'Wait for Tsuru\'s reply.'),
    ],
    reward: { flags: ['kr_inkstone_done'] },
  };

  const it = (id, d) => (C.items[id] = d);
  it('kr_stampbook', { name: T('{御朱印帳|ごしゅいんちょう}', 'A pilgrim\'s stamp book'), key: true, desc: 'Iwa\'s, dropped on the cedar steps: a folding book of shrine seals, half full.' });
  it('kr_oil', { name: T('{灯油|とうゆ}', 'Lamp oil'), desc: 'Rapeseed oil from the keepers\' old cache on the ridge, sealed in its jar for years and still good.' });
  it('kr_inkstone', { name: T('{硯|すずり}', 'An inkstone'), key: true, desc: 'A small, much-used inkstone that belonged to Tsuru\'s teacher, who learned the keepers\' work on this road. Hisae has kept it all these years.' });
  it('kr_register', { name: T('{灯守|ひもり} の {記録|きろく}', 'A keepers\' register'), key: true, desc: 'A page copied from the scriptorium\'s registers: the waystations of the Keepers\' Road, and the oldest telling of しじま, in three versions.' });
})(RB.content);
