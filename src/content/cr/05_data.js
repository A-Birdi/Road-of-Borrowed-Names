/* The Cloudroad, Chapter 10: the people (expansion P12; docs/future/work/P12_CLOUDROAD.md). The relay master and the
 * runners, the stations' innkeepers and porters, the last courier's granddaughter, two rival inns and their guest, a
 * mapmaker, a pack-horse driver, a dispensary keeper, Sakichi (the old courier who taught Nao the road west; sealed
 * S14), the Mist Barrier's keeper and its inspector, the headwoman above the cloud, a pilgrim and a smuggler. They
 * speak standard Japanese in their own registers (the checkpoint's officials formally); Suzu's lines have her Kansai
 * versions as everywhere. Pronouns, for anyone writing about them: Kanbe, Jinpachi, Sada, Kōsuke, Heisuke, Yahei,
 * Seibe, Tatsu, Genji, Matazō, Sakichi, Ujie, Gonza, Ginji and Genta (the courier) he/him; Tome, Ine, Sono, Otaki, Rin, Chika, Sue, Sumi,
 * Shizu, Koma and Oshika she/her. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const ch = (id, d) => (C.chars[id] = d);
  // ---- Oiwake (追分宿), the first station ------------------------------------------------------------------------------
  // Kanbe: the relay master (問屋); keeps the ledger of every letter that passes, and the old relay's emblem over his door.
  // Gruff, exact, fond of the runners he scolds.
  ch('cr_kanbe', {
    name: { en: 'Kanbe', jp: 'カンベエ' }, voice: { pitch: 0.74 },
    look: { skin: 2, hair: 'shaved', hairColor: 5, cloth: ['#3e4a52', '#2e3a42', '#d8ccb0'], shape: 'coat', acc: ['pencil'], age: 'old' },
    portrait: { eyes: 'narrow', style: 'shaved', age: 'old', collar: 'high', bg: '#1c2226' },
  });
  // Tome: keeps Oiwake's inn; has heard every traveller's version of the road and believes about half of each.
  ch('cr_tome', {
    name: { en: 'Tome', jp: 'トメ' }, voice: { pitch: 0.96 },
    look: { skin: 2, hair: 'bun', hairColor: 1, cloth: ['#7a4a3a', '#5e3a2e', '#e8dcc4'], shape: 'apron', acc: [] },
    portrait: { eyes: 'soft', style: 'bun', collar: 'apron', bg: '#2a1c18' },
  });
  // Jinpachi: a young relay runner; fast on his feet, faster with his mouth; carries messages whole until he repeats them.
  ch('cr_jinpachi', {
    name: { en: 'Jinpachi', jp: 'ジンパチ' }, voice: { pitch: 1.12 },
    look: { skin: 3, hair: 'spiky', hairColor: 0, cloth: ['#c86a3a', '#a4542c', '#f0e4c8'], shape: 'tunic', acc: ['headband', 'satchel'], bandCol: '#f0e4c8' },
    portrait: { eyes: 'round', style: 'spiky', acc: ['headband'], bandCol: '#f0e4c8', bg: '#3a2014' },
  });
  // ---- Suginoki (杉ノ木宿), under the great cedar ---------------------------------------------------------------------
  ch('cr_ine', {
    name: { en: 'Ine', jp: 'イネ' }, voice: { pitch: 1.04 },
    look: { skin: 1, hair: 'wrap', hairColor: 2, cloth: ['#4a6a4a', '#3a543a', '#e8e0cc'], shape: 'apron', acc: ['scarf'], scarfCol: '#c8a85a' },
    portrait: { eyes: 'soft', style: 'wrap', collar: 'apron', bg: '#1e2a1e' },
  });
  // Sada: a porter who carries loads up and down the stone road every day; says only what he saw.
  ch('cr_sada', {
    name: { en: 'Sada', jp: 'サダ' }, voice: { pitch: 0.8 },
    look: { skin: 3, hair: 'short', hairColor: 0, cloth: ['#6a5a3a', '#54462c', '#c8b890'], shape: 'tunic', acc: ['headband', 'basket'], bandCol: '#e8e0cc' },
    portrait: { eyes: 'round', style: 'short', acc: ['headband'], bandCol: '#e8e0cc', bg: '#26201a' },
  });
  // Kōsuke: a cheerful merchant on his way down; passes on every story he hears, improved.
  ch('cr_kosuke', {
    name: { en: 'Kōsuke', jp: 'コウスケ' }, voice: { pitch: 1.0 },
    look: { skin: 1, hair: 'short', hairColor: 3, cloth: ['#5a3a6a', '#462c54', '#e0d4c0'], shape: 'coat', acc: ['hat'], hatCol: '#8a7a5a' },
    portrait: { eyes: 'round', style: 'short', acc: ['hat'], hatCol: '#8a7a5a', bg: '#221a26' },
  });
  // ---- Sakashita (坂下宿) -------------------------------------------------------------------------------------------
  // Sono: keeps the inn her grandfather built; the granddaughter of Genta, the last courier, and tired of what the station
  // says about him.
  ch('cr_sono', {
    name: { en: 'Sono', jp: 'ソノ' }, voice: { pitch: 1.0 },
    look: { skin: 2, hair: 'ponytail', hairColor: 1, cloth: ['#3a4a6a', '#2c3a56', '#e4dccc'], shape: 'apron', acc: [] },
    portrait: { eyes: 'sharp', style: 'ponytail', collar: 'apron', bg: '#1a2030' },
  });
  // Heisuke: the station's elder; tells the version in which the last courier ran off with the post, because his father did.
  ch('cr_heisuke', {
    name: { en: 'Heisuke', jp: 'ヘイスケ' }, voice: { pitch: 0.78 },
    look: { skin: 2, hair: 'shaved', hairColor: 6, cloth: ['#5a4a3a', '#463a2c', '#d8ccb4'], shape: 'robe', acc: ['cane'], age: 'old' },
    portrait: { eyes: 'narrow', style: 'shaved', age: 'old', bg: '#241e18' },
  });
  // Yahei: a woodcutter who works above the stream; came down this morning soaked to the knee.
  ch('cr_yahei', {
    name: { en: 'Yahei', jp: 'ヤヘイ' }, voice: { pitch: 0.76 },
    look: { skin: 3, hair: 'short', hairColor: 0, cloth: ['#4a4a3a', '#3a3a2c', '#a8987a'], shape: 'tunic', acc: ['beard', 'toolbelt'] },
    portrait: { eyes: 'round', style: 'short', beard: true, bg: '#1e1e18' },
  });
  // ---- Nakayama (中山宿): two inns and a mapmaker ---------------------------------------------------------------------
  ch('cr_otaki', {
    name: { en: 'Otaki', jp: 'オタキ' }, voice: { pitch: 1.06 },
    look: { skin: 1, hair: 'bun', hairColor: 0, cloth: ['#2e5a4a', '#22463a', '#e8dcc0'], shape: 'robe', acc: ['flower'] },
    portrait: { eyes: 'sharp', style: 'bun', collar: 'high', bg: '#162a22' },
  });
  ch('cr_seibe', {
    name: { en: 'Seibe', jp: 'セイベエ' }, voice: { pitch: 0.86 },
    look: { skin: 2, hair: 'short', hairColor: 5, cloth: ['#6a5a2a', '#544620', '#e8dcb8'], shape: 'coat', acc: [] , age: 'old' },
    portrait: { eyes: 'narrow', style: 'short', age: 'old', collar: 'high', bg: '#262012' },
  });
  // Tatsu: the guest both inns say is theirs; a quiet traveller who booked one and slept at the other.
  ch('cr_tatsu', {
    name: { en: 'Tatsu', jp: 'タツ' }, voice: { pitch: 0.94 },
    look: { skin: 2, hair: 'long', hairColor: 0, cloth: ['#4a4a5a', '#3a3a48', '#c8c0b0'], shape: 'coat', acc: ['hat'], hatCol: '#a8987a' },
    portrait: { eyes: 'soft', style: 'long', acc: ['hat'], hatCol: '#a8987a', bg: '#1c1c24' },
  });
  // Rin: a mapmaker walking the highway with her chain and brush, whose new map has the old road wrong.
  ch('cr_rin', {
    name: { en: 'Rin', jp: 'リン' }, voice: { pitch: 1.08 },
    look: { skin: 1, hair: 'bob', hairColor: 2, cloth: ['#3a5a6a', '#2c4656', '#e8e4d8'], shape: 'tunic', acc: ['glasses', 'satchel', 'pencil'] },
    portrait: { eyes: 'round', style: 'bob', acc: ['glasses'], bg: '#18242c' },
  });
  // ---- Umagaeshi (馬返し宿): where the horses turn back -----------------------------------------------------------------
  // Genji: a pack-horse driver (馬子) and his horse Kuri; has driven the road forty years and trusts the wind over anyone.
  ch('cr_genji', {
    name: { en: 'Genji', jp: 'ゲンジ' }, voice: { pitch: 0.72 },
    look: { skin: 3, hair: 'wrap', hairColor: 5, cloth: ['#5a4632', '#463626', '#c0a880'], shape: 'tunic', acc: ['headband', 'beard'], bandCol: '#d8ccb0', age: 'old' },
    portrait: { eyes: 'narrow', style: 'wrap', beard: true, age: 'old', bg: '#221a12' },
  });
  // Chika: keeps the station's medicine chest for travellers taken ill with the height; her labels are old and faded.
  ch('cr_chika', {
    name: { en: 'Chika', jp: 'チカ' }, voice: { pitch: 0.92 },
    look: { skin: 2, hair: 'bun', hairColor: 6, cloth: ['#6a6a5a', '#545446', '#e8e4d4'], shape: 'apron', acc: ['glasses'], age: 'old' },
    portrait: { eyes: 'soft', style: 'bun', age: 'old', acc: ['glasses'], collar: 'apron', bg: '#24241e' },
  });
  // Matazō: a courier caught on the road by the rain (a road event); sore-footed and stubborn about his satchel.
  ch('cr_matazo', {
    name: { en: 'Matazō', jp: 'マタゾウ' }, voice: { pitch: 0.9 },
    look: { skin: 3, hair: 'short', hairColor: 0, cloth: ['#8a5a3a', '#6e462c', '#e0d0b0'], shape: 'tunic', acc: ['headband', 'satchel'], bandCol: '#e0d0b0' },
    portrait: { eyes: 'round', style: 'short', acc: ['headband'], bandCol: '#e0d0b0', bg: '#2a1e14' },
  });
  // ---- Kirishita (霧下宿), the last lit station below the Barrier -------------------------------------------------------
  // Sakichi: an old courier who keeps the station and its post; taught Nao the road west, and has written to Nao for years
  // (sealed S14). Patient, dry, a little deaf on the left; still walks like a runner.
  ch('cr_sakichi', {
    name: { en: 'Sakichi', jp: 'サキチ' }, voice: { pitch: 0.7 },
    look: { skin: 3, hair: 'shaved', hairColor: 6, cloth: ['#3a4a5a', '#2c3a48', '#c8bca4'], shape: 'tunic', acc: ['headband', 'satchel'], bandCol: '#c8bca4', age: 'old' },
    portrait: { eyes: 'narrow', style: 'shaved', age: 'old', acc: ['headband'], bandCol: '#c8bca4', bg: '#1a2028' },
  });
  // Sue: runs the station's inn with Sakichi; fusses over every traveller who comes out of the mist.
  ch('cr_sue', {
    name: { en: 'Sue', jp: 'スエ' }, voice: { pitch: 0.98 },
    look: { skin: 2, hair: 'bun', hairColor: 4, cloth: ['#7a5a4a', '#5e463a', '#ecdfc8'], shape: 'apron', acc: ['scarf'], scarfCol: '#a85a3a' },
    portrait: { eyes: 'soft', style: 'bun', collar: 'apron', bg: '#2a1e1a' },
  });
  // ---- the Mist Barrier (霧の関) ---------------------------------------------------------------------------------------
  // Ujie: the keeper of the checkpoint; formal to the last syllable, fair, and bound by the barrier's rules as much as anyone.
  ch('cr_ujie', {
    name: { en: 'Ujie', jp: 'ウジエ' }, voice: { pitch: 0.82 },
    look: { skin: 1, hair: 'bun', hairColor: 0, cloth: ['#2e3440', '#222833', '#c8c4b8'], shape: 'robe', acc: [] },
    portrait: { eyes: 'sharp', style: 'bun', collar: 'high', bg: '#14181e' },
  });
  // Sumi: the barrier's inspector of papers (in the old checkpoints, women inspectors checked women travellers; here she
  // checks everyone's stamps); misses nothing and says so kindly.
  ch('cr_sumi', {
    name: { en: 'Sumi', jp: 'スミ' }, voice: { pitch: 1.02 },
    look: { skin: 2, hair: 'long', hairColor: 1, cloth: ['#4a3a5a', '#3a2c48', '#e0d8cc'], shape: 'robe', acc: ['glasses'] },
    portrait: { eyes: 'sharp', style: 'long', acc: ['glasses'], collar: 'high', bg: '#1e1826' },
  });
  ch('cr_gonza', {
    name: { en: 'Gonza', jp: 'ゴンザ' }, voice: { pitch: 0.74 },
    look: { skin: 3, hair: 'short', hairColor: 0, cloth: ['#3a3e46', '#2c3038', '#a8a49a'], shape: 'coat', acc: ['hat'], hatCol: '#4a4a4a' },
    portrait: { eyes: 'round', style: 'short', acc: ['hat'], hatCol: '#4a4a4a', bg: '#18181c' },
  });
  // ---- Kumoi (雲居宿), above the cloud --------------------------------------------------------------------------------
  // Shizu: the station's headwoman (名主); signs for travellers she has never met, if they can show her why she should.
  ch('cr_shizu', {
    name: { en: 'Shizu', jp: 'シズ' }, voice: { pitch: 0.86 },
    look: { skin: 1, hair: 'bun', hairColor: 6, cloth: ['#5a4a6a', '#463a56', '#e8e0d8'], shape: 'robe', acc: ['cane'], age: 'old' },
    portrait: { eyes: 'soft', style: 'bun', age: 'old', collar: 'high', bg: '#221c2a' },
  });
  ch('cr_koma', {
    name: { en: 'Koma', jp: 'コマ' }, voice: { pitch: 1.36 }, size: 'child',
    look: { skin: 2, hair: 'bob', hairColor: 0, cloth: ['#c8a83a', '#a48a2c', '#f0e8d0'], shape: 'tunic', acc: [] },
    portrait: { eyes: 'round', style: 'bob', bg: '#2e2810' },
  });
  // ---- on the road -------------------------------------------------------------------------------------------------
  // Oshika: an old pilgrim on the shrine path, with a stamp book older than the player.
  ch('cr_oshika', {
    name: { en: 'Oshika', jp: 'オシカ' }, voice: { pitch: 0.84 },
    look: { skin: 2, hair: 'wrap', hairColor: 6, cloth: ['#e8e4d8', '#ccc6b6', '#7a6a4a'], shape: 'robe', acc: ['hat', 'cane'], hatCol: '#c8b07a', age: 'old' },
    portrait: { eyes: 'soft', style: 'wrap', age: 'old', acc: ['hat'], hatCol: '#c8b07a', bg: '#2a2620' },
  });
  // ---- the Courier's Hut ----------------------------------------------------------------------------------------------
  // the Courier Who Never Arrived: what is left of Genta, the last courier, at the hut on the pass (he/him); a straw
  // hat, a runner's legs, the snow showing through him
  ch('cr_genta', {
    name: { en: 'The Courier Who Never Arrived', jp: '{届|とど}かず の {飛脚|ひきゃく}' }, voice: { pitch: 0.82 },
    portrait: { skin: ['#d8ccb0', '#b8ac90'], hair: ['#5a5048', '#463e38'], style: 'short', eyes: 'narrow', acc: ['hat'], hatCol: '#b8a070', bg: '#161a20' },
  });
  // Ginji: a smuggler who knows a way round the checkpoint and would rather you didn't ask about the crates.
  ch('cr_ginji', {
    name: { en: 'Ginji', jp: 'ギンジ' }, voice: { pitch: 0.88 },
    look: { skin: 2, hair: 'ponytail', hairColor: 0, cloth: ['#2a2a2a', '#1e1e1e', '#8a7a5a'], shape: 'coat', acc: ['scarf'], scarfCol: '#5a3a2a' },
    portrait: { eyes: 'sharp', style: 'ponytail', bg: '#141414' },
  });
})(RB.content);
