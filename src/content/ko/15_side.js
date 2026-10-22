/* Kotonoha, Chapter 9: the side stories and the companions' places on the island (expansion P11f; R4's five side
 * quests; 14_COMPANIONS's Chapter 9 pressure). The quests, their items and Kihei here, with the map wiring; the scenes
 * are in 24_scenes_side.js (side stories) and 25_scenes_comp.js (companions), the tasks in 32_side_learning.js.
 *   ko_ao      The Apprentice Who Cannot Read: Ao asks, in secret, to be taught the leaves' letters (three lessons by
 *              his basket: look-alike kana, は read as わ, the small っ); then, in the hall in front of Yoshino, he reads
 *              the leaf Nana slipped into his basket. It is his own name.
 *   ko_kihei   The Sailor's Last Letter: Kihei, a sailor's echo at the tide pools, looks for the letter he never sent.
 *              It lies on the sea cave's rock stage (low tide, Koyomi's calendar), written to Hatsu, who was Mitsu's
 *              grandmother. Three lasting ends, each shown before it is chosen (E17): Mitsu reads it; it goes on the
 *              wind from the Wind Stone; Kihei keeps it, to say it himself one day.
 *   ko_myname  The Leaf That Is Your Name: Tokio's count turns up a leaf with the player's name in a hand they know
 *              (by background: the courier's boss, the first customer, the teacher); read who wrote it and when, then
 *              answer it on a fresh leaf from the Wind Stone. The leaf with your name is kept.
 *   ko_census  The Keepers' Census: count two of the day's baskets for Tokio (枚 and big numbers), then read the
 *              trend with him; the board names the two who helped.
 *   ko_tide    The Tide Calendar: four moon stones blown from Koyomi's ring; find them, set them in the moon's order,
 *              read when the next spring tide falls; that night the leaves rise on the wind (an illustration for P16).
 * Twelve-chapter journeys only (the island is). Nothing here gates the main story. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const T = (jp, en) => ({ jp, en });
  const Q = (id, title, stages) => (C.quests[id] = { chapter: 'ko', title, stages, reward: { flags: [id + '_done'] } });
  Q('ko_ao', T('{字|じ} の {読|よ}めない {見習|みなら}い', 'The Apprentice Who Cannot Read'), [
    Object.assign(T('アオ に 、 {葉|は} の {字|じ} を こっそり {教|おし}えて ほしい と {頼|たの}まれた 。 {籠|かご} の {横|よこ} で 、 {三|みっ}つ の {授業|じゅぎょう} 。', 'Ao has asked you, in secret, to teach him the letters on the leaves: three lessons, by his basket on the village path.'), { at: [{ map: 'ko.village', npc: 'ko_ao' }] }),
    T('アオ は 、 ナナ が {籠|かご} に {入|い}れた {葉|は} を 、 {館|やかた} で ヨシノ の {前|まえ} で {読|よ}む つもり だ 。', 'Ao means to read the leaf Nana slipped into his basket, in the keepers\' hall, in front of Yoshino.'),
  ]);
  Q('ko_kihei', T('{船乗|ふなの}り の {最後|さいご} の {手紙|てがみ}', 'The Sailor\'s Last Letter'), [
    T('{潮|しお}だまり の キヘイ は 、 {出|だ}せなかった {手紙|てがみ} を {探|さが}して いる 。 {海|うみ} は {大事|だいじ} な もの を {東|ひがし} の {洞|ほら} に {仕舞|しま}う と いう 。', 'Kihei, at the tide pools, is looking for the letter he never sent. The sea keeps what matters in the cave to the east, he says.'),
    T('{海|うみ} の {洞|ほら} で 、 キヘイ の {手紙|てがみ} を {見|み}つけた 。 {宛名|あてな} は 「ハツ」 。 {村|むら} で {聞|き}いて みよう 。', 'You found Kihei\'s letter in the sea cave. It is addressed to Hatsu. Ask in the village.'),
    T('ハツ は 、 ミツ の {祖母|そぼ} だった 。 {手紙|てがみ} を どう する か 、 キヘイ と {決|き}めよう 。', 'Hatsu was Mitsu\'s grandmother. Decide with Kihei what becomes of the letter.'),
  ]);
  Q('ko_myname', T('あなた の {名前|なまえ} の {葉|は}', 'The Leaf That Is Your Name'), [
    T('{名前|なまえ} の {書|か}いて ある {葉|は} 。 {知|し}って いる {字|じ} だ 。 {誰|だれ} が 、 いつ {書|か}いた の だろう 。', 'A leaf with your name on it, in a hand you know. Who wrote it, and when?'),
    T('{新|あたら}しい {葉|は} に {返事|へんじ} を {書|か}いて 、 {風石|かぜいし} から {風|かぜ} に {乗|の}せよう 。', 'Write an answer on a fresh leaf, and send it on the wind from the Wind Stone.'),
  ]);
  Q('ko_census', T('{葉守|はもり} の {数|かず}', 'The Keepers\' Census'), [
    T('トキオ の {代|か}わり に 、 {籠|かご} を {二|ふた}つ {数|かぞ}えよう 。 {段|だん} の アオ の {籠|かご} と 、 {浜|はま} の {籠|かご} 。 それから 、 トキオ と {数|かず} を {確|たし}かめよう 。', 'Count two of today\'s baskets for Tokio, Ao\'s on the terraces and the one on the shore; then go over the numbers with him.'),
  ]);
  Q('ko_tide', T('{潮|しお} の {暦|こよみ}', 'The Tide Calendar'), [
    T('コヨミ の {暦|こよみ} の {石|いし} から 、 {月|つき} の {石|いし} が {四|よっ}つ {飛|と}んで いった 。 {浜|はま} 、 {村|むら} 、 {段|だん} 、 {潮|しお}だまり を {探|さが}そう 。', 'Four moon stones have blown away from Koyomi\'s calendar ring. Look on the shore, in the village, on the terraces and at the tide pools.'),
    T('{四|よっ}つ {揃|そろ}った 。 {暦|こよみ} の {石|いし} の {周|まわ}り に 、 {月|つき} の {順番|じゅんばん} で {並|なら}べよう 。', 'All four found. Set them round the calendar stone in the moon\'s order.'),
    T('{円|えん} は {揃|そろ}った 。 {暦|こよみ} の {石|いし} で 、 {次|つぎ} の {大潮|おおしお} を {読|よ}もう 。', 'The ring is whole. Read the next spring tide from the calendar stone.'),
  ]);

  const it = (id, d) => (C.items[id] = d);
  it('ko_kihei_letter', { name: T('キヘイ の {手紙|てがみ}', 'Kihei\'s letter'), key: true, desc: 'A leaf from the sea cave in a sailor\'s careful hand: "Hatsu. I\'m sorry I left with us quarrelling. I\'ll be home on the next spring tide. Leave the door open for me. Kihei."' });
  it('ko_myleaf', { name: T('{名前|なまえ} の {葉|は}', 'The leaf with your name'), key: true, desc: 'A leaf from Kotonoha with your name on it, in a hand you know. Words someone meant for you, which never reached you until now.' });

  // Kihei: a sailor lost at sea long ago, or what the tide remembers of him (he/him). An old coat, a cap, pale as spray.
  C.chars.ko_kihei = {
    name: { en: 'Kihei', jp: 'キヘイ' }, voice: { pitch: 0.74 },
    look: { skin: 1, hair: 'short', hairColor: 5, cloth: ['#8a98a4', '#6e7c88', '#dce2e6'], pants: '#5a6670', shape: 'coat', acc: ['beard'], age: 'old' },
    portrait: { eyes: 'narrow', style: 'short', beard: '#c8ced2', age: 'old', collar: 'high', bg: '#1c2a32' },
  };

  // ---- the map wiring ------------------------------------------------------------------------------------------------
  const M = (id) => C.maps[id];
  const npc = (map, id) => (M(map).npcs || []).find((n) => n.id === id);
  const propAt = (map, p, x, y) => (M(map).props || []).find((q) => q.p === p && q.x === x && q.y === y && !/^ko_ret|^item/.test(q.if || ''));

  // Ao: the lessons by his basket (the village path), the asking, then the reading in the hall
  const ao = npc('ko.village', 'ko_ao');
  ao.if = '!quest.ko_ao=1';
  ao.talk.unshift(
    { if: 'quest.ko_ao=0', scene: 'ko.ao_lesson' },
    { if: 'ko_ch9&!quest.ko_ao&ko_ao_helped|ko_ch9&!quest.ko_ao&seen.ko.ao_leaf', scene: 'ko.ao_ask' });
  M('ko.hall').npcs.push({ id: 'ko_ao_hall', char: 'ko_ao', x: 6, y: 8, dir: 'up', if: 'quest.ko_ao=1', talk: 'ko.ao_reads' });

  // Kihei at the tide pools once met (the wanderer, 33_creatures.js); gone if the letter went to Mitsu or the wind
  M('ko.tidepools').npcs.push({ id: 'ko_kihei', x: 9, y: 19, dir: 'right', if: 'ko_kihei_met&!ko_kihei_mitsu&!ko_kihei_wind', talk: [
    { if: 'ko_kihei_kept', scene: 'ko.kihei_kept' },
    { if: 'quest.ko_kihei=2', scene: 'ko.kihei_choose' },
    { if: 'quest.ko_kihei=1', scene: 'ko.kihei_found' },
    { if: 'quest.ko_kihei=0', scene: 'ko.kihei_wait' },
    { scene: 'ko.kihei_ask' }] });
  M('ko.seacave').props.push({ p: 'ko_leaves', x: 15, y: 5, if: 'quest.ko_kihei=0', scene: 'ko.kihei_letter' });
  const mitsu = npc('ko.lodge', 'ko_mitsu');
  mitsu.talk.unshift(
    { if: 'ko_kihei_mitsu&!seen.ko.mitsu_letter', scene: 'ko.mitsu_letter' },
    { if: 'quest.ko_kihei=1', scene: 'ko.mitsu_hatsu' });
  // Kihei's leaf, framed by the door as Mitsu says (ko.mitsu_letter, ko.mitsu_after), once she has it: the handing-over
  // played through, not the choice alone (RBN-QA-093)
  M('ko.lodge').props.push({ p: 'ko_frame', x: 3, y: 7, if: 'ko_kihei_mitsu&seen.ko.mitsu_letter', scene: 'ko.lodge_letter' });

  // Tokio: the leaf with your name, and the census
  const tokio = npc('ko.village', 'ko_tokio');
  tokio.talk.unshift(
    { if: 'quest.ko_myname=0', scene: 'ko.myname_read' },
    { if: 'ko_ch9&var.ko_ret>=2&!quest.ko_myname', scene: 'ko.myname_start' },
    { if: 'quest.ko_census=0&ko_cn_a&ko_cn_b', scene: 'ko.census_report' },
    { if: 'quest.ko_census=0', scene: 'ko.census_wait' },
    { if: 'ko_ch9&!quest.ko_census&seen.ko.tokio_ch9', scene: 'ko.census_ask' });
  propAt('ko.terraces', 'ko_basket', 21, 19).scene = 'ko.basket_a';
  propAt('ko.shore', 'ko_basket', 15, 14).scene = 'ko.basket_b';

  // Nami answers the mainland's versions of the island's rumour (25_scenes_comp.js), once
  npc('ko.village', 'ko_nami').talk.unshift({ if: 'ko_ch9&!seen.ko.rumours&seen.ko.rumour_tetsu|ko_ch9&!seen.ko.rumours&seen.ko.rumour_shinobu', scene: 'ko.rumours' });

  // Koyomi: the calendar's moon stones
  const koyomi = npc('ko.tidepools', 'ko_koyomi');
  koyomi.talk.unshift(
    { if: 'quest.ko_tide=0&var.ko_moons>=4', scene: 'ko.tide_back' },
    { if: 'quest.ko_tide=0', scene: 'ko.tide_wait' },
    { if: 'ko_ch9&ko_lowtide&!quest.ko_tide', scene: 'ko.tide_ask' });
  const moon = (map, x, y, n) => M(map).props.push({ p: 'ko_moonstone', x, y, o: { phase: n }, if: 'quest.ko_tide=0&!ko_moon_' + n, scene: 'ko.moon_' + n });
  moon('ko.shore', 3, 13, 1); moon('ko.village', 36, 16, 2); moon('ko.terraces', 26, 13, 3); moon('ko.tidepools', 33, 19, 4);

  // the companions' places: Nao's letter on the drift line, Ren's lanterns in the sand, Mio among Otoha's pressed
  // leaves, Suzu's reply in the sea cave and the cave's rock stage (25_scenes_comp.js)
  M('ko.shore').onEnter.push(
    { scene: 'ko.nao_letter', if: 'comp=nao&quest.ko_main>=3&!ko_nao_letter&!ko_apart' },
    { scene: 'ko.ren_toro_first', if: 'comp=ren&ko_ch9&!ko_apart' });
  for (const [map, x, y, id] of [['ko.shore', 7, 12, 'shore1'], ['ko.shore', 34, 16, 'shore2'], ['ko.tidepools', 31, 15, 'pools']]) {
    const t = (M(map).props || []).find((q) => q.p === 'ko_sandtoro' && q.x === x && q.y === y && q.if === '!ko_l_' + id);
    t.scene = 'ko.toro_' + id;
  }
  M('ko.otoha').onEnter = [{ scene: 'ko.mio_labels', if: 'comp=mio&ko_otoha_met&!ko_apart' }];
  M('ko.seacave').onEnter.push({ scene: 'ko.suzu_leaf', if: 'comp=suzu&!ko_apart' });
  M('ko.seacave').triggers = (M('ko.seacave').triggers || []).concat([{ x: 10, y: 8, w: 10, h: 1, scene: 'ko.suzu_stage', if: 'comp=suzu&tell_ko.t_hall_ok&!ko_suzu_stage' }]);
})(RB.content);
