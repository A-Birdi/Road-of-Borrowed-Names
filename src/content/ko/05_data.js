/* Kotonoha, Chapter 9: the people (expansion P11; docs/future/work/P11_SEA.md). The island's leaf-keepers (葉守,
 * hamori: the game's name for them, taken from a real old word; see the lore entry in 30_learning.js) and their
 * village: Otoha, the eldest keeper; Nami, keeper and boatwoman, who crossed to Saltglass to ask for help; Ao, the
 * apprentice who gathers leaves he cannot read; Hamaji the net-mender; Mitsu, who keeps the lodging house; Tokio, who
 * keeps the keepers' census; Koyomi, who keeps the tide calendar; Nana, a child of the village; Yoshino, who teaches the
 * village children; the lost sailor's echo; and the Gardener of Unsent Words, deep in the roots. They speak standard
 * Japanese in their own registers (Otoha's has an old, literary turn at the A profile); Suzu's lines have her Kansai
 * versions as everywhere. Pronouns: Otoha, Nami, Mitsu, Koyomi, Nana, Yoshino she/her; Ao, Hamaji, Tokio, Kihei he/him;
 * the Gardener it. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const ch = (id, d) => (C.chars[id] = d);
  // Otoha: the eldest keeper. Very old, very straight-backed; a shawl the colour of dry leaves; listens a long time
  // before she answers, and answers with a question as often as not.
  ch('ko_otoha', {
    name: { en: 'Otoha', jp: 'オトハ' }, voice: { pitch: 0.7 },
    look: { skin: 1, hair: 'bun', hairColor: 6, cloth: ['#8a7a4a', '#6e6038', '#e8dcb0'], shape: 'robe', acc: ['cane'], age: 'old' },
    portrait: { eyes: 'narrow', style: 'bun', age: 'old', collar: 'high', bg: '#1e2622' },
  });
  // Nami: keeper and the island's boatwoman. Sun-browned, quick, says what she means; a string of sea-glass beads.
  ch('ko_nami', {
    name: { en: 'Nami', jp: 'ナミ' }, voice: { pitch: 1.0 },
    look: { skin: 4, hair: 'ponytail', hairColor: 1, cloth: ['#3e7a7a', '#2e5e5e', '#e6d6a8'], pants: '#3a4448', shape: 'tunic', acc: ['headband'], bandCol: '#d8c070' },
    portrait: { eyes: 'sharp', style: 'ponytail', acc: [], collar: 'open', bg: '#1c3030' },
  });
  // Ao: the apprentice. Eleven, all elbows, gathers more leaves than anyone and cannot read one of them; ashamed of
  // it and pretends not to be.
  ch('ko_ao', {
    name: { en: 'Ao', jp: 'アオ' }, voice: { pitch: 1.3 }, size: 'child',
    look: { skin: 3, hair: 'spiky', hairColor: 0, cloth: ['#5a8a9a', '#46707e', '#e8e0c8'], shape: 'tunic', acc: [] },
    portrait: { eyes: 'round', style: 'spiky', bg: '#1e2c34' },
  });
  // Hamaji: an old net-mender who has fished these waters sixty years; tells the island's story with a sea serpent.
  ch('ko_hamaji', {
    name: { en: 'Hamaji', jp: 'ハマジ' }, voice: { pitch: 0.68 },
    look: { skin: 4, hair: 'shaved', hairColor: 5, cloth: ['#4a5e6e', '#3a4a58', '#c8b088'], shape: 'coat', acc: ['beard'], age: 'old' },
    portrait: { eyes: 'narrow', style: 'shaved', beard: '#d8d4cc', age: 'old', bg: '#1e262c' },
  });
  // Mitsu: keeps the lodging house by the shore; brisk and motherly, feeds everyone who lands.
  ch('ko_mitsu', {
    name: { en: 'Mitsu', jp: 'ミツ' }, voice: { pitch: 1.05 },
    look: { skin: 2, hair: 'wrap', wrapCol: '#d8b860', hairColor: 2, cloth: ['#a87a4a', '#8a6038', '#f0e4c8'], shape: 'apron', acc: [] },
    portrait: { eyes: 'soft', style: 'wrap', wrapCol: '#d8b860', collar: 'apron', blush: true, bg: '#2c2418' },
  });
  // Tokio: keeps the keepers' census, the count of every leaf gathered; fussy, honest, behind on his count.
  ch('ko_tokio', {
    name: { en: 'Tokio', jp: 'トキオ' }, voice: { pitch: 0.9 },
    look: { skin: 1, hair: 'short', hairColor: 3, cloth: ['#6a6a5a', '#545446', '#dcd4bc'], shape: 'tunic', acc: ['glasses', 'book'] },
    portrait: { eyes: 'soft', style: 'short', parted: true, acc: ['glasses', 'pencil'], bg: '#26261e' },
  });
  // Koyomi: keeps the tide calendar, a ring of stones on the point; reads the moon better than any book.
  ch('ko_koyomi', {
    name: { en: 'Koyomi', jp: 'コヨミ' }, voice: { pitch: 0.95 },
    look: { skin: 3, hair: 'braid', hairColor: 4, cloth: ['#4a5a7a', '#3a4862', '#d8d8e8'], shape: 'robe', acc: [] },
    portrait: { eyes: 'soft', style: 'braid', collar: 'high', iris: '#3a4a6a', bg: '#1c2230' },
  });
  // Nana: eight, Ao's shadow, can read a little and is very proud of it.
  ch('ko_nana', {
    name: { en: 'Nana', jp: 'ナナ' }, voice: { pitch: 1.4 }, size: 'child',
    look: { skin: 2, hair: 'twintails', hairColor: 1, cloth: ['#d88a6a', '#b86e52', '#f4e8d0'], shape: 'dress', acc: ['ribbon'] },
    portrait: { eyes: 'round', style: 'twintails', acc: ['ribbon'], blush: true, bg: '#2e2420' },
  });
  // Yoshino: teaches the village's six children in the keepers' hall in the mornings; patient, a little tired.
  ch('ko_yoshino', {
    name: { en: 'Yoshino', jp: 'ヨシノ' }, voice: { pitch: 1.1 },
    look: { skin: 1, hair: 'bob', hairColor: 2, cloth: ['#7a8a6a', '#626e54', '#ece6d0'], shape: 'robe', acc: ['book'] },
    portrait: { eyes: 'soft', style: 'bob', collar: 'high', bg: '#22261e' },
  });
  // Kihei: the echo of a sailor lost at sea long ago, who wanders the tide line looking for the letter he never
  // sent. Drawn pale for now (a see-through figure is P16 art, AC-1).
  ch('ko_kihei', {
    name: { en: 'Kihei', jp: 'キヘイ' }, voice: { pitch: 0.85 },
    look: { skin: 1, hair: 'short', hairColor: 0, cloth: ['#8aa4b0', '#6e8894', '#e0ecf0'], shape: 'coat', acc: ['hat'], hatCol: '#6e8894' },
    portrait: { eyes: 'narrow', style: 'short', acc: ['hat'], hatCol: '#6e8894', bg: '#18242a' },
  });
  // The Gardener of Unsent Words: the island's oldest keeper-spirit, among the deepest roots. A tall shape of woven
  // leaves with a lantern of a face; speaks slowly, in the old way, and listens longer than it speaks. Bodiless (a
  // figure of leaves: its portrait only).
  ch('ko_gardener', {
    name: { en: 'The Gardener of Unsent Words', jp: '{届|とど}かぬ {言葉|ことば} の {庭守|にわもり}' }, voice: { pitch: 0.6 },
    portrait: { skin: ['#c8b880', '#a89860'], hair: ['#4e7a52', '#3a5e3e'], style: 'long', eyes: 'narrow', acc: ['hood'], hoodCol: '#3a5a3e', bg: '#0e1612' },
  });
})(RB.content);
