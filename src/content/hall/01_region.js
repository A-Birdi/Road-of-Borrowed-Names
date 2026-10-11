/* The Hall of a Hundred Tales: the place, its palettes and the tales' people (expansion P15; plan 04_DUNGEONS.md D9).
 * The Hall stands above the Keepers' Road (the Shuttered Hall of Chapter 7, F-64); its door opens after the story,
 * once Tsuru has handed over the key ledger. Inside, an old wooden hall of ten alcoves, and through each alcove's
 * paper screen a tale inside a lantern's light: a wing with its own palette, music and language theme.
 *
 * Palettes: `hall` (the foyer: dark cedar, worn tatami, paper glowing warm); `hall_w1` (The Lamp at the Crossroads:
 * a hill road at dusk turning to night, blue grass, grey stone, one warm lamp).
 *
 * The tales' people (wing 1): Otami (she/her), the old woman in the tale who kept the crossroads lamp and always
 * asked travellers to say it again; Genza (he/him), a proud old pilgrim who will not admit he is lost; a lost child
 * (they/them); a traveller asking the way (they/them); the lamp's own voice (bodiless). Nothing here appears in a
 * six-chapter journey. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const TL = RB.tiles;
  const ch = (id, d) => (C.chars[id] = d);

  TL.PAL.hall = {
    grass: ['#5a5a3e', '#6a6a48', '#4a4a32', '#7a7a54'], dirt: ['#6a5440', '#7a6450', '#564434', '#8a7460'],
    stone: ['#7a746a', '#948e82', '#5e5a52'], water: ['#3e5a6a', '#4e6c7a', '#7a9aa6', '#dce8ec'],
    sand: ['#c8b48a', '#d8c69c', '#ac9a72'], wood: ['#5a3e2c', '#6e4c36', '#432e22', '#8a6448'],
    leaf: ['#3a4a32', '#465a3c', '#566c48', '#2c3826'], trunk: ['#3e2e24', '#2c2018'],
    flower: ['#e8b45a', '#f0e6d2', '#c84a32', '#e8d88a'], reed: ['#9a9070', '#b0a684', '#7e765a'],
    wall: ['#d8ccb2', '#c4b89c', '#a89c80'], floor: ['#7a6046', '#685038', '#54402c'], roof: ['#3e3a3e', '#2e2a2e', '#1e1a1e', '#585258'],
    snow: ['#f0ece4', '#ddd8ce', '#c8c2b6'], sky: '#2a2420', dark: '#120e0c',
  };
  TL.addRamps(TL.PAL.hall);
  // wing 1: a hill crossroads at dusk going to night, inside the lamp's light
  TL.PAL.hall_w1 = Object.assign({}, TL.PAL.hall, {
    grass: ['#3e5a54', '#4a6a62', '#30483f', '#5a7a70'], dirt: ['#6a604e', '#7c725e', '#544c3e', '#8e846e'],
    stone: ['#6e7270', '#888c88', '#545856'],
    leaf: ['#2a4038', '#344c42', '#40584c', '#20322a'], flower: ['#e8c06a', '#dcd8c8', '#b85a3a', '#e8d88a'],
    sky: '#1c2630', dark: '#0a0e12',
  });
  TL.addRamps(TL.PAL.hall_w1);

  // ---- the tales' people: wing 1 ------------------------------------------------------------------------------------
  // Otami: in the tale, the old woman who kept the crossroads lamp. Hard of hearing; asked everyone to say it again.
  ch('hall_otami', {
    name: { en: 'Otami', jp: 'オタミ' }, voice: { pitch: 0.78 },
    look: { skin: 2, hair: 'bun', hairColor: 6, cloth: ['#4a5a5e', '#3a484c', '#e0c890'], shape: 'robe', acc: ['lamp'], age: 'old' },
    portrait: { eyes: 'soft', style: 'bun', age: 'old', acc: ['lamp'], bg: '#1a2226' },
  });
  // Genza: a proud old pilgrim who has walked every road and will not say he is lost.
  ch('hall_genza', {
    name: { en: 'Genza', jp: 'ゲンザ' }, voice: { pitch: 0.82 },
    look: { skin: 2, hair: 'short', hairColor: 6, cloth: ['#e4e0d4', '#c8c2b2', '#5a4a3a'], shape: 'robe', acc: ['hat', 'cane'], hatCol: '#c8b07a', age: 'old' },
    portrait: { eyes: 'narrow', style: 'short', age: 'old', acc: ['hat'], hatCol: '#c8b07a', bg: '#22201a' },
  });
  // the lost child, who has come too far from the village in the dark
  ch('hall_child', {
    name: { en: 'The lost child', jp: '{迷子|まいご}' }, voice: { pitch: 1.34 }, size: 'child',
    look: { skin: 2, hair: 'short', hairColor: 1, cloth: ['#8a5a3a', '#6e462e', '#e8dcc0'], shape: 'tunic', acc: [] },
    portrait: { eyes: 'round', style: 'short', acc: [], bg: '#2a2018' },
  });
  // a traveller asking the way at the signpost
  ch('hall_traveller', {
    name: { en: 'The traveller', jp: '{旅|たび}の{人|ひと}' }, voice: { pitch: 1.02 },
    look: { skin: 1, hair: 'long', hairColor: 1, cloth: ['#5a6a7a', '#465462', '#d8c8a0'], shape: 'robe', acc: ['hat'], hatCol: '#8a7a5a' },
    portrait: { eyes: 'round', style: 'long', acc: ['hat'], hatCol: '#8a7a5a', bg: '#1e2630' },
  });
  // the crossroads lamp's own voice: no figure, only the light
  ch('hall_lamp', { name: { en: 'The lamp', jp: '{灯籠|とうろう}' }, bodiless: true, voice: { pitch: 0.92 },
    look: { custom: 'spirit', col: '#e8c06a' },
    portrait: { skin: ['#f0dca8', '#d8c088'], hair: ['#8a6a3a', '#a07e4a', '#c89a5a'], cloth: ['#c8a050', '#a8843c', '#f0d890'], style: 'long', eyes: 'soft', acc: ['hood'], hoodCol: '#c8a050', bg: '#1a140c' } });
})(RB.content);
