/* The Keepers' Road (灯守の道, Himori no Michi), the region (expansion P10; plan 07_REGIONS.md R8;
 * docs/future/work/P10_KEEPERS.md): the old ridge road of stone lanterns the lantern-keepers walked between Snowbell's
 * valley and Lanternfall, dark for years. Here: its palette (moss green, lantern amber, maple red, ink black; late
 * autumn), its place on the route chart, and the seams with the existing chapters. In a twelve-chapter journey,
 * Snowbell's road east climbs onto the Keepers' Road (the lower road lies under an avalanche until spring), and
 * Lanternfall's Lantern Road is reached from the Keepers' Road's far end once its chapter is done. A six-chapter
 * journey keeps the old way exactly (`ed<2` on the old exits and road). The maps, people and story are in the other
 * files of this folder. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const TL = RB.tiles;
  // cedar and maple forest, moss on stone, worn steps, lantern light; mist
  TL.PAL.keepers = {
    grass: ['#5e7a46', '#6e8a50', '#829c5e', '#4a6238'], dirt: ['#8e7a5e', '#a08c6e', '#76664c', '#b6a284'],
    stone: ['#8a8e84', '#a2a69a', '#6e7268'], water: ['#3e5e66', '#4a6e74', '#6a8e8e', '#d8e4e0'],
    sand: ['#c8b894', '#d8caa8', '#ae9e7a'], wood: ['#6e4e36', '#866044', '#523a28', '#a27e5c'],
    leaf: ['#b0482e', '#c86a36', '#d8963e', '#7e3424'], trunk: ['#4e3a2c', '#36281e'],
    flower: ['#e8dcc0', '#d86a4a', '#c8a8d8', '#e8c860'], reed: ['#a89a6a', '#c0b282', '#857a52'],
    wall: ['#d8d0bc', '#c2b8a2', '#a49a84'], floor: ['#8e765a', '#7a644c', '#66523e'], roof: ['#4a4038', '#3a322c', '#2a2420', '#665a50'],
    snow: ['#eef2f4', '#d8e0e6', '#bcc8d2'], sky: '#e2e4dc', dark: '#16181a',
  };
  TL.addRamps(TL.PAL.keepers);

  C.places.keepers = {
    name: { en: 'The Keepers\' Road', jp: '{灯守|ひもり} の {道|みち}' }, map: 'kr.lodge', x: 20, y: 24, dir: 'up', pos: [384, 120], region: 'keepers', hub: true,
    desc: 'The old ridge road of stone lanterns between Snowbell and Lanternfall, and the keepers\' lodge.', edition: 2,
  };

  // ---- the seams ----------------------------------------------------------------------------------------------------
  // the route chart: Snowbell to Lanternfall directly only in a six-chapter journey; through the hills in a twelve
  const direct = C.roads.find((r) => r[0] === 'snowbell' && r[1] === 'lanternfall');
  if (direct) direct[2] = Object.assign({}, direct[2] || {}, { if: 'ed<2' });
  C.roads.push(['snowbell', 'keepers', { edition: 2 }]);
  C.roads.push(['keepers', 'lanternfall', { edition: 2, if: 'kr_done' }]);
  // Snowbell's road east: down to the Lantern Road (six chapters), up onto the Keepers' Road (twelve)
  const sb = C.maps['sb.road'];
  for (const ex of sb.exits) if (ex.to === 'lf.road') ex.if = (ex.if ? ex.if + '&' : '') + 'ed<2';
  sb.exits.push({ x: 35, y: 13, w: 1, h: 2, to: 'kr.foot', sp: 'from_snowbell', dir: 'right', if: 'ch4_done&ed>=2' });
  // the Lantern Road's way back west: Snowbell (six chapters), the Keepers' Road's last stretch (twelve)
  const lf = C.maps['lf.road'];
  for (const ex of lf.exits) if (ex.to === 'sb.road') ex.if = (ex.if ? ex.if + '&' : '') + 'ed<2';
  lf.exits.push({ x: 0, y: 12, w: 1, h: 2, to: 'kr.descent', sp: 'from_lanternfall', dir: 'left', if: 'ed>=2' });
  // Hayate, who clears the drift: in a twelve-chapter journey the lower road is buried, and he says so
  const hay = (sb.npcs || []).find((n) => n.id === 'hayate');
  if (hay) hay.talk = [{ if: 'ed>=2', scene: 'kr.hayate_road' }].concat(typeof hay.talk === 'string' ? [{ scene: hay.talk }] : hay.talk);
})(RB.content);
