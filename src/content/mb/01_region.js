/* Manybridge (八百橋, Yaobashi), the region (expansion P08; plan 07_REGIONS.md R1; docs/future/work/P08_MANYBRIDGE.md):
 * a canal city of merchants, porters and printers, reached in journeys of the twelve-chapter edition by Tetsu's
 * eastbound ferry from Saltglass once Chapter 2 is over. Here: its palette (indigo and white, canal green, warm cedar;
 * vermilion only on the theatre), its place on the route chart and the ferry's route. The maps, people and story
 * are in the other files of this folder. Nothing here appears in a six-chapter journey (`edition: 2`). */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const TL = RB.tiles;
  // white plaster and black kawara, stone-faced canals the green of still water, cedar, willows
  TL.PAL.manybridge = {
    grass: ['#6a9458', '#7aa464', '#8eb674', '#557a46'], dirt: ['#a89478', '#baa68a', '#8e7c62', '#cebc9e'],
    stone: ['#9c9a94', '#b6b4ac', '#7e7c76'], water: ['#3a6e6a', '#467e78', '#62988e', '#dcece4'],
    sand: ['#d4c6a2', '#e2d6b6', '#bcae88'], wood: ['#7e5a3e', '#966e4e', '#62442e', '#b48c66'],
    leaf: ['#4e7e48', '#5e9254', '#78aa68', '#3a6236'], trunk: ['#5e4636', '#423026'],
    flower: ['#f0ecd8', '#e8a088', '#c8d8f0', '#f2d27a'], reed: ['#8eac68', '#aec486', '#6e8a50'],
    wall: ['#efebe0', '#dcd6c6', '#bab2a0'], floor: ['#a48a6c', '#8e765a', '#78624a'], roof: ['#4a4c56', '#3a3c46', '#2a2c34', '#6a6c78'],
    snow: ['#eef3f7', '#d6e2ec', '#bccbd8'], sky: '#e4eee8', dark: '#1a2428',
  };
  TL.addRamps(TL.PAL.manybridge);

  C.places.manybridge = {
    name: { en: 'Manybridge', jp: '{八百橋|やおばし}' }, map: 'mb.exchange', x: 24, y: 30, dir: 'up', pos: [430, 262], region: 'manybridge', hub: true,
    desc: 'A canal city of eight hundred bridges, merchants and printers.', edition: 2,
  };
  // the ferry's route across the bay (no road joins the two: the scenes that sail are named for the chart's check)
  C.roads.push(['saltglass', 'manybridge', { sea: true, edition: 2, ferry: ['mb.ferry_east', 'mb.ferry_west'] }]);
})(RB.content);
