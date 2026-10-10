/* Sazanami (漣, "ripples"), a fishing hamlet up the coast from Saltglass (expansion P11d; plan 07_REGIONS.md R6;
 * docs/future/work/P11_SEA.md). Where, in Chapter 2's talk, Kiyo's elder son works. A port for the boat and a walk
 * up the coast road from Saltglass's road (west). Twelve-chapter journeys only. Here: its palette, its place on the
 * route chart, the road and the port, the hamlet's map and people, its three side stories and the wiring. The scenes
 * are in 20_scenes.js, the tasks in 30_learning.js.
 *   sz_market  The Morning Catch: Uki calls the catch at the market; tally it (counters: 匹, 杯, 尾) and the totals.
 *   sz_nets    The Torn Net: Yone mends nets by the racks; find the torn meshes, then the knot, step by step.
 *   sz_school  The Tide-Pool School: Mina and Riku ask what lives in the pools; the player teaches, three lessons
 *              (katakana names and their dakuten, counting creatures, a sign by the pools).
 * Isaku (Kiyo's elder son) keeps the jetty; on the maiden voyage the hamlet's post is left at Uki's stall, and after
 * the winter (Snowbell's story) his nets bring up written leaves: the hint that leads to the island. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C, K) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  const TL = RB.tiles;
  // weathered wood and tarred nets, a pale shingle beach, sea pinks on the slope, a cold green sea
  TL.PAL.sazanami = Object.assign({}, TL.PAL.saltglass || {}, {
    grass: ['#7a9a6e', '#8aaa7a', '#a2c08e', '#5e7e56'], sand: ['#d6ccb4', '#e4dcc8', '#bab09a'],
    water: ['#2e7484', '#3a8494', '#62a8b2', '#e0f0ee'], wood: ['#7a6450', '#927a62', '#5e4c3c', '#b09878'],
    roof: ['#5a4a42', '#4a3c36', '#3a2e2a', '#7a6658'], flower: ['#e8a0b0', '#f0c8d0', '#ffffff', '#d07088'],
    sky: '#d8e6e6', dark: '#121a1c',
  });
  TL.addRamps(TL.PAL.sazanami);

  // ---- the chart, the road and the port ----------------------------------------------------------------------------
  C.places.sazanami = {
    name: T('Sazanami', '{漣|さざなみ}'), map: 'sz.hamlet', x: 42, y: 10, dir: 'left', pos: [112, 252], region: 'sazanami',
    desc: 'A fishing hamlet up the coast from Saltglass: nets drying, a little market, tide pools at the point.', edition: 2,
  };
  C.roads.push(['saltglass', 'sazanami', { edition: 2 }]);
  C.ports.sazanami = { place: 'sazanami', name: T('Sazanami', '{漣|さざなみ}'),
    dock: { map: 'sz.hamlet', x: 21, y: 23, dir: 'right' }, boat: { x: 22, y: 23 },
    sea: { x: 10, y: 9, dir: 'down' }, zone: { x: 8, y: 2, w: 5, h: 7 }, arrive: 'sz.arrive_boat' };

  // ---- the people ---------------------------------------------------------------------------------------------------
  const ch = (id, d) => (C.chars[id] = d);
  // Isaku: Kiyo's elder son, a young fisher who keeps the jetty; easy-going, says little about home (he/him)
  ch('sz_isaku', {
    name: T('Isaku', 'イサク'), voice: { pitch: 0.88 },
    look: { skin: 3, hair: 'short', hairColor: 1, cloth: ['#4a6a8a', '#38526a', '#e8e0cc'], shape: 'tunic', acc: ['headband'], bandCol: '#e8e0cc' },
    portrait: { eyes: 'sharp', style: 'short', acc: ['headband'], bandCol: '#e8e0cc', mole: true, bg: '#243040' },
  });
  // Yone: the hamlet's net-mender, old and quick, who counts meshes under her breath (she/her)
  ch('sz_yone', {
    name: T('Yone', 'ヨネ'), voice: { pitch: 0.8 },
    look: { skin: 2, hair: 'wrap', wrapCol: '#6a5a4a', hairColor: 6, cloth: ['#6a6a5a', '#525246', '#d8ccb0'], shape: 'robe', acc: [], age: 'old' },
    portrait: { eyes: 'narrow', style: 'wrap', wrapCol: '#6a5a4a', age: 'old', bg: '#2a2a22' },
  });
  // Uki: calls the catch at the market and keeps the hamlet's post box at her stall (she/her)
  ch('sz_uki', {
    name: T('Uki', 'ウキ'), voice: { pitch: 1.06 },
    look: { skin: 4, hair: 'ponytail', hairColor: 2, cloth: ['#c8a050', '#a8843c', '#4a3a2a'], shape: 'apron', acc: ['headband'], bandCol: '#c84a3a' },
    portrait: { eyes: 'round', style: 'ponytail', acc: ['headband'], bandCol: '#c84a3a', collar: 'apron', bg: '#3a2c1c' },
  });
  // Mina and Riku: the hamlet's children, who have the pools for a classroom (she/her; he/him)
  ch('sz_mina', {
    name: T('Mina', 'ミナ'), voice: { pitch: 1.3 }, size: 'child',
    look: { skin: 3, hair: 'bob', hairColor: 1, cloth: ['#d07088', '#a85a6e', '#f0e6d6'], shape: 'tunic', acc: [] },
    portrait: { eyes: 'round', style: 'bob', bg: '#3a2430' },
  });
  ch('sz_riku', {
    name: T('Riku', 'リク'), voice: { pitch: 1.24 }, size: 'child',
    look: { skin: 4, hair: 'spiky', hairColor: 1, cloth: ['#5a8a6a', '#467054', '#e8e0cc'], shape: 'tunic', acc: [] },
    portrait: { eyes: 'round', style: 'spiky', bg: '#24382c' },
  });

  // ---- the hamlet ---------------------------------------------------------------------------------------------------
  C.maps['sz.hamlet'] = {
    name: T('Sazanami', '{漣|さざなみ}'), region: 'sazanami', place: 'sazanami', travel: 'sazanami', music: 'sazanami', edition: 2,
    ambient: { weather: null },
    terrain: K.build(44, 28, '.', (k) => {
      k.ragged('top', 'T', 2, 1101);                 // the wooded slope behind the hamlet
      k.scatter(',', 10, 1102, [0, 3, 44, 5], '.');    // sea pinks
      k.path([[43, 10], [3, 10]], ':', 2);           // the coast road, through the hamlet
      k.path([[22, 11], [22, 16]], ':', 2);          // down to the jetty
      k.path([[6, 11], [6, 14]], ':', 1);            // down to the pools
      k.rect(0, 15, 44, 5, 's');                     // the shingle beach
      k.rect(0, 19, 44, 1, 'w');                     // the waterline
      k.rect(0, 20, 44, 8, '~');                     // the sea
      k.rect(1, 15, 9, 4, 'w');                      // the tide pools at the point
      k.scatter('h', 7, 1103, [1, 15, 9, 4], 'w');
      k.rect(20, 17, 2, 8, '_');                     // the jetty
      k.scatter('h', 4, 1104, [30, 16, 13, 3], 's');
    }),
    structs: [
      { type: 'house', x: 5, y: 5, w: 5, h: 3, roof: 'tile', wall: 'wood', door: 2, windows: [0, 4], shut: T('Yone\'s house. Nets hang drying on the wall.', 'ヨネ の {家|いえ} 。 {壁|かべ} に {網|あみ} が {干|ほ}して ある 。') },
      { type: 'house', x: 13, y: 4, w: 6, h: 4, roof: 'tile', wall: 'wood', door: 3, windows: [1, 4], shut: T('The net shed, shut. It smells of pine tar and rope.', '{網|あみ} の {小屋|こや} 。 {閉|し}まって いる 。 {松|まつ}やに と {縄|なわ} の {匂|にお}い が する 。') },
      { type: 'house', x: 27, y: 4, w: 6, h: 4, roof: 'tile', wall: 'wood', door: 2, windows: [0, 4, 5], shut: T('Isaku\'s room, over the fish store.', '{魚|さかな} の {倉|くら} の {上|うえ} の 、 イサク の {部屋|へや} 。') },
      { type: 'house', x: 35, y: 5, w: 5, h: 3, roof: 'tile', wall: 'wood', door: 2, windows: [0, 4], shut: T('A fisher family\'s house. Someone is singing inside.', '{漁師|りょうし} の {家|いえ} 。 {中|なか} から {歌|うた} が {聞|き}こえる 。') },
    ],
    props: [
      { p: 'ko_netrack', x: 11, y: 13, scene: 'sz.netrack' }, { p: 'ko_netrack', x: 14, y: 13 }, { p: 'ko_netrack', x: 17, y: 13 },
      { p: 'counter', x: 26, y: 13, across: true, scene: 'sz.stall' }, { p: 'crate', x: 29, y: 13 }, { p: 'barrel', x: 30, y: 13 },
      { p: 'ko_basket', x: 25, y: 14 }, { p: 'table', x: 32, y: 13 },
      { p: 'sign', x: 8, y: 13, scene: 'sz.pools_sign' },
      { p: 'sign', x: 40, y: 11, scene: 'sz.road_sign' },
      { p: 'pier', x: 20, y: 24 }, { p: 'pier', x: 21, y: 24 },
      { p: 'boat', x: 24, y: 21 }, { p: 'boat', x: 16, y: 22 },
      { p: 'bench', x: 34, y: 12 }, { p: 'lantern', x: 23, y: 16, o: { lit: true } },
    ],
    npcs: [
      { id: 'sz_isaku', x: 23, y: 17, dir: 'down', talk: [{ scene: 'sz.isaku_idle' }] },
      { id: 'sz_yone', x: 14, y: 14, dir: 'up', talk: [{ scene: 'sz.yone_idle' }] },
      { id: 'sz_uki', x: 28, y: 14, dir: 'down', talk: [{ scene: 'sz.uki_idle' }] },
      { id: 'sz_mina', x: 4, y: 14, dir: 'down', talk: [{ scene: 'sz.mina_idle' }] },
      { id: 'sz_riku', x: 7, y: 14, dir: 'left', talk: [{ scene: 'sz.riku_idle' }] },
    ],
    exits: [{ x: 43, y: 10, w: 1, h: 2, to: 'sg.road', tx: 1, ty: 10, dir: 'right' }],
    onEnter: [{ scene: 'sz.first', if: '!sz_seen' }],
    spawn: { default: [41, 10, 'left'], from_road: [41, 10, 'left'] },
  };
  C.seaBoatAt('sazanami'); // (the sea's file, which adds the other ports' boats, loads before this one)

  // the coast road west from Saltglass's road (twelve-chapter journeys)
  const road = C.maps['sg.road'];
  // (by position, not a named spawn: the six-chapter road's geometry stays the base's)
  road.exits.push({ x: 0, y: 10, w: 1, h: 2, to: 'sz.hamlet', sp: 'from_road', dir: 'left', if: 'ed>=2' });

  // ---- the side stories ---------------------------------------------------------------------------------------------
  const Q = (id, title, stages) => (C.quests[id] = { chapter: 'sea', title, stages, reward: { flags: [id + '_done'] } });
  const at = (o, a) => Object.assign(o, { at: a });
  const J = (jp, en) => ({ jp, en });
  Q('sz_market', J('{朝|あさ} の {水揚|みずあ}げ', 'The Morning Catch'), [
    at(J('ウキ の {代|か}わり に 、 {朝|あさ} の {水揚|みずあ}げ を {数|かぞ}えよう 。', 'Count the morning\'s catch for Uki.'), { map: 'sz.hamlet', npc: 'sz_uki' }),
  ]);
  Q('sz_nets', J('{破|やぶ}れた {網|あみ}', 'The Torn Net'), [
    at(J('ヨネ の {網|あみ} の {破|やぶ}れ を {探|さが}して 、 {繕|つくろ}おう 。', 'Find the tears in Yone\'s net and mend them.'), { map: 'sz.hamlet', npc: 'sz_yone' }),
  ]);
  Q('sz_school', J('{潮|しお}だまり の {学校|がっこう}', 'The Tide-Pool School'), [
    at(J('ミナ と リク に 、 {潮|しお}だまり の こと を {教|おし}えよう 。 {三|みっ}つ の {授業|じゅぎょう} 。', 'Teach Mina and Riku about the tide pools: three lessons.'), { map: 'sz.hamlet', npc: 'sz_mina' }),
  ]);
  C.questOnly = C.questOnly || {};
  for (const id of ['sz_market', 'sz_nets', 'sz_school']) C.questOnly[id] = 'ed>=2';

  // ---- the wiring --------------------------------------------------------------------------------------------------
  const npc = (id) => C.maps['sz.hamlet'].npcs.find((n) => n.id === id);
  npc('sz_uki').talk.unshift(
    { if: 'item.sea_mailbag&!sea_post_sz', scene: 'sz.uki_post' },
    { if: 'quest.sz_market=0', scene: 'sz.uki_market' },
    { if: '!quest.sz_market', scene: 'sz.uki_first' },
    { if: 'quest.sz_market=done', scene: 'sz.uki_after' });
  npc('sz_yone').talk.unshift(
    { if: 'quest.sz_nets=0', scene: 'sz.yone_nets' },
    { if: '!quest.sz_nets', scene: 'sz.yone_first' },
    { if: 'quest.sz_nets=done', scene: 'sz.yone_after' });
  npc('sz_mina').talk.unshift(
    { if: 'quest.sz_school=0', scene: 'sz.school_lesson' },
    { if: '!quest.sz_school', scene: 'sz.school_ask' },
    { if: 'quest.sz_school=done', scene: 'sz.mina_after' });
  npc('sz_riku').talk.unshift(
    { if: 'quest.sz_school=0', scene: 'sz.school_lesson' },
    { if: 'quest.sz_school=done', scene: 'sz.riku_after' });
  // Isaku: a letter from his mother on the maiden voyage; after the winter, what his nets bring up
  npc('sz_isaku').talk.unshift(
    { if: 'ed>=2&ch4_done&quest.sea_licence=7&!sea_ko_hint', scene: 'sz.isaku_leaves' },
    { if: 'quest.sea_licence=7&!ch4_done', scene: 'sz.isaku_winter' },
    { if: '!seen.sz.isaku_first', scene: 'sz.isaku_first' });
})(RB.content, RB.mapkit);
