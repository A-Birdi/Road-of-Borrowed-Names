/* World-level content: main cast, places, roads, shared items.
 * Story bible: docs/STORY.md. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const ch = (id, d) => (C.chars[id] = d);

  // ---- companions ---------------------------------------------------------
  ch('nao', {
    name: { en: 'Nao', jp: 'ナオ' }, companion: true, voice: { pitch: 0.95 },
    look: { skin: 3, hair: 'spiky', hairColor: 1, cloth: ['#5a6a4a', '#46543a', '#c8962e'], pants: '#3a3440', shape: 'tunic', acc: ['scarf', 'satchel'], scarfCol: '#c8962e', bigSatchel: true },
    portrait: { eyes: 'sharp', style: 'spiky', acc: ['scarf', 'satchel', 'pencil'], scarfCol: '#c8962e', bg: '#3a3a2a' },
    role: { en: 'Courier', jp: '{配達人|はいたつにん}' },
    support: { en: 'Reads what an enemy intends two moves ahead; after a clean counter, the next unravel frees two knots.' },
  });
  ch('mio', {
    name: { en: 'Mio', jp: 'ミオ' }, companion: true, voice: { pitch: 1.05 },
    look: { skin: 1, hair: 'bun', hairColor: 0, cloth: ['#6a8a7a', '#50705e', '#e8e0c8'], pants: '#3a3a40', shape: 'apron', acc: ['bottles'] },
    portrait: { eyes: 'soft', style: 'bun', pins: true, collar: 'apron', acc: ['bottles'], bg: '#2a3a36' },
    role: { en: 'Apothecary', jp: '{薬師|くすし}' },
    support: { en: 'Steadies the pair: recovers a little resolve each exchange and clears lingering effects.' },
  });
  ch('ren', {
    name: { en: 'Ren', jp: 'レン' }, companion: true, voice: { pitch: 0.9 },
    look: { skin: 2, hair: 'ponytail', hairColor: 7, cloth: ['#3a3e6a', '#2a2c50', '#d8b060'], pants: '#2a2a3a', boots: '#5a4636', shape: 'coat', acc: ['lamp', 'patches', 'glasses'] },
    portrait: { eyes: 'narrow', style: 'ponytail', parted: true, collar: 'high', acc: ['glasses', 'lamp', 'patches'], bg: '#262a44' },
    role: { en: 'Lantern keeper', jp: '{灯守|ひもり}' },
    support: { en: 'Begins each encounter behind a ward and can interrupt a charging enemy with any clean inscription.' },
  });
  ch('suzu', {
    name: { en: 'Suzu', jp: 'スズ' }, companion: true, voice: { pitch: 1.12 },
    look: { skin: 4, hair: 'wavy', hairColor: 3, cloth: ['#8a3a5a', '#6a2a44', '#e8c070'], pants: '#3a2a34', shape: 'dress', acc: ['ribbon', 'earrings'], ribbonCol: '#c8a0a8' },
    portrait: { eyes: 'round', style: 'wavy', mole: true, acc: ['ribbon', 'earrings'], ribbonCol: '#c8a0a8', bg: '#3a2634' },
    role: { en: 'Travelling performer', jp: '{旅芸人|たびげいにん}' },
    support: { en: 'Once per encounter, turns a blow aside; a false promise can be answered by any correct inscription.' },
  });

  // ---- main cast -------------------------------------------------------------
  ch('tsuru', {
    name: { en: 'Keeper Tsuru', jp: 'ツル' }, voice: { pitch: 0.8 },
    look: { skin: 1, hair: 'bun', hairColor: 6, cloth: ['#4a4a5a', '#3a3a48', '#c8a050'], shape: 'robe', acc: ['cane'], age: 'old' },
    portrait: { eyes: 'narrow', style: 'bun', age: 'old', collar: 'high', bg: '#2e2a3a' },
  });
  ch('hana', {
    name: { en: 'Hana', jp: 'ハナ' }, voice: { pitch: 1.0 },
    look: { skin: 2, hair: 'bob', hairColor: 2, cloth: ['#a86a5a', '#8a5446', '#f0e0c0'], shape: 'apron', acc: [] },
    portrait: { eyes: 'soft', style: 'bob', collar: 'apron', bg: '#3a2e2a' },
  });
  ch('koji', {
    name: { en: 'Kōji', jp: 'コウジ' }, voice: { pitch: 0.85 },
    look: { skin: 3, hair: 'short', hairColor: 2, cloth: ['#5a6a7a', '#465464', '#c8a070'], shape: 'tunic', acc: ['hat', 'beard'], hatCol: '#a8884a' },
    portrait: { eyes: 'round', style: 'short', beard: true, acc: ['hat'], hatCol: '#a8884a', bg: '#2a3440' },
  });
  ch('kasane', {
    name: { en: 'Kasane', jp: 'カサネ' }, voice: { pitch: 0.95 },
    look: { skin: 0, hair: 'long', hairColor: 5, cloth: ['#d8d4c8', '#b8b4a8', '#6a8aa8'], shape: 'robe', acc: ['hood'], hoodCol: '#c8c4b8' },
    portrait: { eyes: 'soft', style: 'long', collar: 'high', bg: '#1e2234' },
  });
  ch('narr', { name: { en: '', jp: '' } });

  // ---- places (fast travel) & roads -----------------------------------------------------
  C.places.reedwake = { name: { en: 'Reedwake', jp: '{葦|あし}ノ{瀬|せ}' }, map: 'rw.village', x: 22, y: 30, dir: 'up', pos: [90, 230], region: 'reedwake', hub: true, desc: 'A riverside village drying out after the storm.' };
  C.places.saltglass = { name: { en: 'Saltglass', jp: '{潮|しお}{硝子|がらす}' }, map: 'sg.harbor', x: 4, y: 20, dir: 'right', pos: [170, 270], region: 'saltglass', hub: true, desc: 'A working harbour of labels, letters and tides.' };
  C.places.cinder = { name: { en: 'Cinder Orchard', jp: '{灰実|はいみ}の{里|さと}' }, map: 'co.village', x: 4, y: 18, dir: 'right', pos: [270, 200], region: 'cinder', hub: true, desc: 'Terraced orchards and glass workshops.' };
  C.places.snowbell = { name: { en: 'Snowbell', jp: '{雪鈴|ゆきすず}' }, map: 'sb.hamlet', x: 4, y: 20, dir: 'up', pos: [330, 90], region: 'snowbell', hub: true, desc: 'A mountain hamlet beneath the old observatory.' };
  C.places.lanternfall = { name: { en: 'Lanternfall', jp: '{灯落|ひおち}' }, map: 'lf.town', x: 4, y: 20, dir: 'right', pos: [420, 170], region: 'lanternfall', hub: true, desc: 'An orderly town of records and bridges.' };
  C.roads = [['reedwake', 'saltglass'], ['saltglass', 'cinder'], ['cinder', 'snowbell'], ['snowbell', 'lanternfall'], ['cinder', 'lanternfall']];

  C.start = { map: 'rw.road', x: 3, y: 9, dir: 'right', scene: 'rw.arrive' };
})(RB.content);
