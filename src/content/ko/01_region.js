/* Kotonoha (言の葉島), the Isle of Word-Leaves, the region (expansion P11; plan 07_REGIONS.md R4;
 * docs/future/work/P11_SEA.md): the island where lost words wash up as leaves, Chapter 9 of a twelve-chapter journey.
 * Reached by Tetsu's public ferry from Saltglass once Lanternfall is over (`ch5_done`), or earlier by the player's own
 * boat (src/content/sea/). Here: its palette (sea-glass teal, leaf gold, moonlit silver, ink black; softer and dreamier
 * than anywhere else), its place on the route chart, the ferry's route and Tetsu's new line on the board. The maps,
 * people and story are in the other files of this folder. Nothing here appears in a six-chapter journey. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const TL = RB.tiles;
  // sea-glass and teal water, pale sand, leaf gold, silvered stone, the camphor's deep green; ink-black shadows
  TL.PAL.kotonoha = {
    grass: ['#7aa88a', '#8ab896', '#a0c8a6', '#5e8e70'], dirt: ['#bcae90', '#ccc0a2', '#a29476', '#dcd2b8'],
    stone: ['#a8b0b2', '#c2c8c8', '#868e92'], water: ['#3e8a8e', '#4a9a9c', '#6cb4b0', '#e0f2ee'],
    sand: ['#e2dac2', '#eee8d4', '#cac0a2'], wood: ['#8a7058', '#a2866a', '#6a5440', '#c0a482'],
    leaf: ['#3e6e52', '#4e8460', '#6aa078', '#2c5440'], trunk: ['#6a5a4a', '#4a3e34'],
    flower: ['#f2e6b0', '#e8c060', '#d0e4ec', '#f4f0e0'], reed: ['#9ab88e', '#b8ceaa', '#7a9670'],
    wall: ['#e6e4da', '#d0cec4', '#b0aea4'], floor: ['#9c8a70', '#887660', '#74644e'], roof: ['#4a5a5e', '#3a484c', '#2a3438', '#6a7a7e'],
    snow: ['#eef3f4', '#d8e4e6', '#bccacc'], sky: '#dcecea', dark: '#121a1e',
  };
  TL.addRamps(TL.PAL.kotonoha);

  C.places.kotonoha = {
    name: { en: 'Kotonoha', jp: '{言|こと}の{葉|は}{島|じま}' }, map: 'ko.shore', x: 20, y: 22, dir: 'up', pos: [64, 302], region: 'kotonoha', hub: true,
    desc: 'The Isle of Word-Leaves, out to sea west of Saltglass, where lost words wash up.', edition: 2,
  };
  // the ferry's route out to the island (the scenes that sail are named for the chart's check); the own boat's routes
  // are the sea chart's (src/content/sea/)
  C.roads.push(['saltglass', 'kotonoha', { sea: true, edition: 2, if: 'ch5_done|ko_arrived', ferry: ['ko.ferry_out', 'ko.ferry_back'] }]);

  // Saltglass: Tetsu's board has a second new line once Lanternfall is over (twelve-chapter journeys). His talk is
  // read in order, so the island's entries go before Manybridge's
  const sg = C.maps['sg.harbor'];
  const tetsu = sg && sg.npcs.find((n) => n.id === 'tetsu');
  if (tetsu) {
    const at = tetsu.talk.findIndex((t) => t.scene === 'mb.ferry_tetsu');
    tetsu.talk.splice(at < 0 ? 0 : at, 0,
      { if: 'ed>=2&ch5_done&!ko_arrived', scene: 'ko.ferry_tetsu' },
      { if: 'ed>=2&ko_arrived&!post', scene: 'ko.ferry_tetsu_again' });
  }
})(RB.content);
