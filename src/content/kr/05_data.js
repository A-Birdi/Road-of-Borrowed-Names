/* The Keepers' Road, Chapter 7: the people (expansion P10; docs/future/work/P10_KEEPERS.md). Old Hisae, the last
 * keeper living on the road; the first waystation's keeper; the woodcutter; the Fox Bridge hamlet; a scholar copying
 * inscriptions; two pilgrims; an etoki teller; the lodge's caretaker family. They speak standard Japanese in their
 * own registers; Suzu's lines have her Kansai versions as everywhere. Hisae never speaks of Ren's teacher (sealed S2,
 * S14): the road's story is the order's, not the teacher's. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const ch = (id, d) => (C.chars[id] = d);
  // Hisae: the last keeper still living on the road. Small, upright, sharp-eyed; asks more than she answers. She
  // remembers Tsuru's teacher as a young apprentice, and keeps one lamp lit at the lodge every night.
  ch('kr_hisae', {
    name: { en: 'Hisae', jp: 'ヒサエ' }, voice: { pitch: 0.72 },
    look: { skin: 2, hair: 'bun', hairColor: 6, cloth: ['#3e4a3a', '#2e382c', '#d8a848'], shape: 'robe', acc: ['cane', 'lamp'], age: 'old' },
    portrait: { eyes: 'narrow', style: 'bun', age: 'old', collar: 'high', acc: ['lamp'], bg: '#1e2420' },
  });
  // Aya: keeps the first waystation's teahouse at the foot of the road; brisk, kind, counts everything.
  ch('kr_aya', {
    name: { en: 'Aya', jp: 'アヤ' }, voice: { pitch: 1.0 },
    look: { skin: 2, hair: 'bun', hairColor: 1, cloth: ['#7a5a3a', '#5e442c', '#e8dcc0'], shape: 'apron', acc: [] },
    portrait: { eyes: 'soft', style: 'bun', collar: 'apron', bg: '#2e241a' },
  });
  // Kumazō: a woodcutter who works the cedar steps; big, slow-spoken, superstitious about the dark lanterns.
  ch('kr_kumazo', {
    name: { en: 'Kumazō', jp: 'クマゾウ' }, voice: { pitch: 0.7 },
    look: { skin: 3, hair: 'short', hairColor: 0, cloth: ['#5a4a32', '#463a26', '#a8885a'], shape: 'tunic', acc: ['beard', 'toolbelt'] },
    portrait: { eyes: 'round', style: 'short', beard: true, acc: [], bg: '#26201a' },
  });
  // Shōzō: the Fox Bridge hamlet's headman; fair-minded and tired of the three versions of the bridge's story.
  ch('kr_shozo', {
    name: { en: 'Shōzō', jp: 'ショウゾウ' }, voice: { pitch: 0.82 },
    look: { skin: 2, hair: 'short', hairColor: 5, cloth: ['#4a5a6a', '#3a4856', '#d8ccb0'], shape: 'coat', acc: [], age: 'old' },
    portrait: { eyes: 'narrow', style: 'short', age: 'old', collar: 'high', bg: '#20262c' },
  });
  // Kame: the hamlet's oldest teller, who has the fox bridge's story from her grandmother, and tells it with the fox.
  ch('kr_kame', {
    name: { en: 'Kame', jp: 'カメ' }, voice: { pitch: 0.78 },
    look: { skin: 1, hair: 'bun', hairColor: 6, cloth: ['#6a4a5a', '#543a48', '#e0d0c0'], shape: 'robe', acc: ['cane'], age: 'old' },
    portrait: { eyes: 'soft', style: 'bun', age: 'old', bg: '#2a1e24' },
  });
  // Hinata and Kai: the hamlet's children, who sing the rhyme of the oil cache without knowing it is a map.
  ch('kr_hinata', {
    name: { en: 'Hinata', jp: 'ヒナタ' }, voice: { pitch: 1.36 }, size: 'child',
    look: { skin: 2, hair: 'twintails', hairColor: 0, cloth: ['#c8763a', '#a45e2c', '#f0e4c8'], shape: 'tunic', acc: ['ribbon'] },
    portrait: { eyes: 'round', style: 'twintails', acc: ['ribbon'], bg: '#3a2414' },
  });
  ch('kr_kai', {
    name: { en: 'Kai', jp: 'カイ' }, voice: { pitch: 1.3 }, size: 'child',
    look: { skin: 3, hair: 'spiky', hairColor: 0, cloth: ['#4a6a4a', '#3a543a', '#e0d8c0'], shape: 'tunic', acc: [] },
    portrait: { eyes: 'round', style: 'spiky', acc: [], bg: '#1e2a1e' },
  });
  // Jūzō: a scholar from the capital copying the road's inscriptions, who trusts stone over memory, at first.
  ch('kr_juzo', {
    name: { en: 'Jūzō', jp: 'ジュウゾウ' }, voice: { pitch: 0.92 },
    look: { skin: 1, hair: 'short', hairColor: 3, cloth: ['#3a3a5a', '#2c2c46', '#e8e0cc'], shape: 'coat', acc: ['glasses', 'book'] },
    portrait: { eyes: 'narrow', style: 'short', acc: ['glasses'], collar: 'high', bg: '#1e1e2e' },
  });
  // Iwa: an old pilgrim walking the lantern shrines with her stamp book (and losing it).
  ch('kr_iwa', {
    name: { en: 'Iwa', jp: 'イワ' }, voice: { pitch: 0.84 },
    look: { skin: 2, hair: 'wrap', hairColor: 6, cloth: ['#e8e4d8', '#ccc6b6', '#8a7a5a'], shape: 'robe', acc: ['hat', 'cane'], hatCol: '#c8b07a', age: 'old' },
    portrait: { eyes: 'soft', style: 'wrap', age: 'old', acc: ['hat'], hatCol: '#c8b07a', bg: '#2a2620' },
  });
  // Seiji: a young pilgrim on his way to the high shrine, who walks a stretch with the party and advises (never fights).
  ch('kr_seiji', {
    name: { en: 'Seiji', jp: 'セイジ' }, voice: { pitch: 1.04 },
    look: { skin: 2, hair: 'short', hairColor: 1, cloth: ['#e4e0d4', '#c8c2b2', '#6a5a3a'], shape: 'robe', acc: ['hat'], hatCol: '#c8b07a' },
    portrait: { eyes: 'round', style: 'short', acc: ['hat'], hatCol: '#c8b07a', bg: '#26221c' },
  });
  // Kikyō: a travelling etoki teller (絵解き) who explains a painted scroll to audiences; a performer, like Suzu.
  ch('kr_kikyo', {
    name: { en: 'Kikyō', jp: 'キキョウ' }, voice: { pitch: 1.08 },
    look: { skin: 1, hair: 'long', hairColor: 0, cloth: ['#4a3a6a', '#3a2e56', '#e8c860'], shape: 'robe', acc: ['hat'], hatCol: '#3a2e56' },
    portrait: { eyes: 'soft', style: 'long', acc: ['hat'], hatCol: '#3a2e56', bg: '#221a2e' },
  });
  // The lodge's caretaker family: Mokichi and Fuyu keep a corner of the roofless lodge dry, and their son Sora.
  ch('kr_mokichi', {
    name: { en: 'Mokichi', jp: 'モキチ' }, voice: { pitch: 0.86 },
    look: { skin: 3, hair: 'short', hairColor: 1, cloth: ['#5a5a3a', '#46462c', '#c8b890'], shape: 'tunic', acc: ['headband'], bandCol: '#c8b890' },
    portrait: { eyes: 'round', style: 'short', acc: ['headband'], bandCol: '#c8b890', bg: '#24241a' },
  });
  ch('kr_fuyu', {
    name: { en: 'Fuyu', jp: 'フユ' }, voice: { pitch: 1.02 },
    look: { skin: 2, hair: 'braid', hairColor: 1, cloth: ['#6a4a3a', '#543a2e', '#e0d4bc'], shape: 'apron', acc: [] },
    portrait: { eyes: 'soft', style: 'braid', collar: 'apron', bg: '#2a1e18' },
  });
  ch('kr_sora', {
    name: { en: 'Sora', jp: 'ソラ' }, voice: { pitch: 1.32 }, size: 'child',
    look: { skin: 3, hair: 'short', hairColor: 1, cloth: ['#4a6a8a', '#3a5470', '#e0d8c8'], shape: 'tunic', acc: [] },
    portrait: { eyes: 'round', style: 'short', acc: [], bg: '#1e2a36' },
  });
  // voices that speak only in scenes: the Hundredth Tale, and the lanterns' own names when read
  ch('kr_hyakuwa', { name: { en: 'The Hundredth Tale', jp: '{百話目|ひゃくわめ}' }, voice: { pitch: 0.6 } });
})(RB.content);
