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

  // wing 2: a hill meadow in a sun-shower, the grass bright and wet, red torii, foxfire in the rain's shine
  TL.PAL.hall_w2 = Object.assign({}, TL.PAL.hall, {
    grass: ['#6a9a52', '#7aac5e', '#58864a', '#8ebc6c'], dirt: ['#8a7458', '#9c8668', '#746048', '#ae987a'],
    stone: ['#8a8a82', '#a2a29a', '#6e6e68'], water: ['#6a9ab4', '#7cacc4', '#a8cede', '#f0f6f8'],
    wood: ['#a8382c', '#c04a36', '#82281e', '#d8684c'], leaf: ['#3e6a3a', '#4a7c44', '#5e9054', '#2e5230'],
    flower: ['#f0c84a', '#f4f0e0', '#d84a3a', '#f0a8b8'], sky: '#c8dce8', dark: '#1a2420',
  });
  TL.addRamps(TL.PAL.hall_w2);

  // wing 3: a mountain village in the last hour of the night, indigo going grey, dew on the grass, the temple's bell
  // tower dark on the ridge and one lantern climbing to it
  TL.PAL.hall_w3 = Object.assign({}, TL.PAL.hall, {
    grass: ['#3a4a5a', '#465868', '#2e3c4a', '#566a7a'], dirt: ['#5a5650', '#6c6860', '#4a4640', '#7e7a70'],
    stone: ['#6a6e78', '#82868e', '#52565e'], water: ['#2e4458', '#3c566c', '#6a8aa0', '#c8d8e4'],
    wood: ['#4a3a30', '#5c483a', '#382a22', '#76604c'], leaf: ['#26343e', '#2e3e4a', '#3a4c58', '#1c2830'],
    flower: ['#d8c890', '#c8ccd8', '#a8584a', '#e0d8b0'], roof: ['#2a2a34', '#20202a', '#16161e', '#3e3e4a'],
    sky: '#1a2230', dark: '#080a10',
  });
  TL.addRamps(TL.PAL.hall_w3);

  // wing 4: the rainy season in a river valley, grey-green and wet, hydrangeas blue and violet by every wall, the river
  // brown and high
  TL.PAL.hall_w4 = Object.assign({}, TL.PAL.hall, {
    grass: ['#4e6a50', '#5a7a5c', '#425a44', '#6a8a68'], dirt: ['#6a5e4c', '#7a6e5a', '#58503e', '#8c806a'],
    stone: ['#727a7a', '#8a9292', '#5a6262'], water: ['#6a5a3e', '#7a6a4a', '#9a8a68', '#c8bc9c'],
    wood: ['#5a4a3a', '#6c5a46', '#46382c', '#86725a'], leaf: ['#2e4a3a', '#385a46', '#466c54', '#22382c'],
    flower: ['#6a7ac8', '#9a7ac0', '#c8d0e8', '#7aa0d0'], roof: ['#3a4048', '#2e343c', '#22282e', '#4e5660'],
    sky: '#8a96a0', dark: '#14181c',
  });
  TL.addRamps(TL.PAL.hall_w4);

  // wing 5: a village at the end of summer, two wells at either end of it, dry yellow grass, a weeping willow over the
  // west well, the water dark and cold
  TL.PAL.hall_w5 = Object.assign({}, TL.PAL.hall, {
    grass: ['#8a9a52', '#9aac5e', '#748446', '#acbc6e'], dirt: ['#9a8460', '#ac9670', '#826e4e', '#bea882'],
    stone: ['#8a8a80', '#a2a298', '#6e6e66'], water: ['#2e4a5a', '#3c5a6c', '#6a8a9a', '#c0d4dc'],
    wood: ['#6a5038', '#7e6046', '#52402c', '#96785a'], leaf: ['#4a6a3a', '#5a7c44', '#6e9054', '#3a5230'],
    flower: ['#e8c048', '#f0e8d0', '#d8683a', '#e89aa8'], sky: '#d8d0b0', dark: '#1e1c14',
  });
  TL.addRamps(TL.PAL.hall_w5);

  // wing 6: a mountain pass in late autumn, maples red against grey stone, mist in the valley below, the toll house of
  // old dark wood with its rule board under the eaves
  TL.PAL.hall_w6 = Object.assign({}, TL.PAL.hall, {
    grass: ['#7a7a4a', '#8a8a56', '#66663e', '#9c9a66'], dirt: ['#7a6a56', '#8c7c66', '#665846', '#9e8e78'],
    stone: ['#7e8084', '#96989c', '#64666a'], water: ['#5a7a8a', '#6a8c9c', '#9ab4c0', '#e0e8ec'],
    wood: ['#4a3628', '#5c4432', '#38281e', '#765a44'], leaf: ['#a83a24', '#c04e2c', '#d8783a', '#82301e'],
    flower: ['#e8a83a', '#f0e0c8', '#c84a2a', '#d8c8a0'], roof: ['#3a3430', '#2e2a26', '#24201c', '#4e4640'],
    sky: '#b8bcc0', dark: '#16140f',
  });
  TL.addRamps(TL.PAL.hall_w6);

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

  // ---- the tales' people: wing 2, The Fox's Wedding (foxes in human shape, as the old tales tell it) ----------------
  // Kozue (she/her), the fox bride; Gin (he/him), the white fox who marries her; Toku (she/her), the old go-between;
  // Konta (he/him), the bride's little brother; Sayo (she/her), the village girl who lent the bride her umbrella; a
  // lantern-bearer and a porter (they/them).
  ch('hall_kozue', { name: { en: 'Kozue', jp: 'コズエ' }, voice: { pitch: 1.1 },
    look: { skin: 1, hair: 'long', hairColor: 3, cloth: ['#f4f0e6', '#dcd6c8', '#c8382c'], shape: 'robe', acc: ['hat'], hatCol: '#f4f0e6' },
    portrait: { eyes: 'narrow', style: 'long', acc: ['hat'], hatCol: '#f4f0e6', bg: '#2a2018' } });
  ch('hall_gin', { name: { en: 'Gin', jp: 'ギン' }, voice: { pitch: 0.94 },
    look: { skin: 1, hair: 'short', hairColor: 6, cloth: ['#2a2a32', '#1e1e26', '#c8c8d0'], shape: 'robe', acc: [] },
    portrait: { eyes: 'narrow', style: 'short', acc: [], bg: '#1c1c24' } });
  ch('hall_toku', { name: { en: 'Toku', jp: 'トク' }, voice: { pitch: 0.8 },
    look: { skin: 2, hair: 'bun', hairColor: 6, cloth: ['#5a3a4a', '#462c3a', '#d8b878'], shape: 'robe', acc: ['cane'], age: 'old' },
    portrait: { eyes: 'narrow', style: 'bun', age: 'old', acc: [], bg: '#241a20' } });
  ch('hall_konta', { name: { en: 'Konta', jp: 'コンタ' }, voice: { pitch: 1.36 }, size: 'child',
    look: { skin: 2, hair: 'short', hairColor: 3, cloth: ['#c8783a', '#a8602c', '#f0e0c0'], shape: 'tunic', acc: [] },
    portrait: { eyes: 'round', style: 'short', acc: [], bg: '#2a2014' } });
  ch('hall_sayo', { name: { en: 'Sayo', jp: 'サヨ' }, voice: { pitch: 1.2 },
    look: { skin: 2, hair: 'braid', hairColor: 1, cloth: ['#4a6a8a', '#3a5470', '#e8dcc0'], shape: 'apron', acc: [] },
    portrait: { eyes: 'round', style: 'braid', collar: 'apron', bg: '#1e2a36' } });
  ch('hall_bearer', { name: { en: 'The lantern-bearer', jp: '{提灯持|ちょうちんも}ち' }, voice: { pitch: 1.0 },
    look: { skin: 2, hair: 'short', hairColor: 3, cloth: ['#e8e0d0', '#ccc4b2', '#c8382c'], shape: 'tunic', acc: ['lamp'] },
    portrait: { eyes: 'narrow', style: 'short', acc: ['lamp'], bg: '#2a2018' } });
  ch('hall_porter', { name: { en: 'The porter', jp: '{荷物持|にもつも}ち' }, voice: { pitch: 0.9 },
    look: { skin: 3, hair: 'short', hairColor: 3, cloth: ['#7a6a4a', '#625438', '#e0d4b8'], shape: 'tunic', acc: ['headband'], bandCol: '#e0d4b8' },
    portrait: { eyes: 'narrow', style: 'short', acc: ['headband'], bandCol: '#e0d4b8', bg: '#241e14' } });

  // ---- the tales' people: wing 3, The Bell Before Dawn ---------------------------------------------------------------
  // Jinbei (he/him), the old bell-ringer, ill in bed; Shino (she/her), his granddaughter, who rings the dawn bell for the
  // first time; the temple's priest (he/him); Mataji (he/him), the night watchman with his clappers; Sukezō (he/him), a
  // fisherman on his way down to the boats; Mame (she/her), a mother tanuki, and Kobu (they/them), her lost cub, both in
  // human shape, as the old tales tell it.
  ch('hall_jinbei', { name: { en: 'Jinbei', jp: 'ジンベエ' }, voice: { pitch: 0.76 },
    look: { skin: 2, hair: 'short', hairColor: 6, cloth: ['#4a4a5a', '#3a3a48', '#d8d0c0'], shape: 'robe', acc: [], age: 'old' },
    portrait: { eyes: 'soft', style: 'short', age: 'old', acc: [], bg: '#161a24' } });
  ch('hall_shino', { name: { en: 'Shino', jp: 'シノ' }, voice: { pitch: 1.18 },
    look: { skin: 2, hair: 'braid', hairColor: 1, cloth: ['#3a5a7a', '#2c4660', '#e8dcc0'], shape: 'apron', acc: ['lamp'] },
    portrait: { eyes: 'round', style: 'braid', collar: 'apron', acc: ['lamp'], bg: '#18202c' } });
  ch('hall_osho', { name: { en: 'The priest', jp: '{和尚|おしょう}さん' }, voice: { pitch: 0.86 },
    look: { skin: 2, hair: 'shaved', hairColor: 6, cloth: ['#2a2a2e', '#1e1e22', '#c8a050'], shape: 'robe', acc: [], age: 'old' },
    portrait: { eyes: 'narrow', style: 'shaved', age: 'old', acc: [], bg: '#1a1a1e' } });
  ch('hall_mataji', { name: { en: 'Mataji', jp: 'マタジ' }, voice: { pitch: 0.92 },
    look: { skin: 3, hair: 'short', hairColor: 3, cloth: ['#5a4a3a', '#46382c', '#d8c8a0'], shape: 'tunic', acc: ['headband'], bandCol: '#d8c8a0' },
    portrait: { eyes: 'narrow', style: 'short', acc: ['headband'], bandCol: '#d8c8a0', bg: '#1e1a14' } });
  ch('hall_sukezo', { name: { en: 'Sukezō', jp: 'スケゾウ' }, voice: { pitch: 0.88 },
    look: { skin: 3, hair: 'short', hairColor: 1, cloth: ['#3a5a6a', '#2c4652', '#e0d4b8'], shape: 'tunic', acc: ['hat'], hatCol: '#a89060' },
    portrait: { eyes: 'narrow', style: 'short', acc: ['hat'], hatCol: '#a89060', bg: '#14202a' } });
  ch('hall_mame', { name: { en: 'Mame', jp: 'マメ' }, voice: { pitch: 1.02 },
    look: { skin: 2, hair: 'bun', hairColor: 3, cloth: ['#7a5a3a', '#62482e', '#e8d8b8'], shape: 'robe', acc: ['hat'], hatCol: '#c8a868' },
    portrait: { eyes: 'round', style: 'bun', acc: ['hat'], hatCol: '#c8a868', bg: '#221a12' } });
  ch('hall_kobu', { name: { en: 'Kobu', jp: 'コブ' }, voice: { pitch: 1.4 }, size: 'child',
    look: { skin: 2, hair: 'short', hairColor: 3, cloth: ['#8a6a44', '#705436', '#e8d8b8'], shape: 'tunic', acc: [] },
    portrait: { eyes: 'round', style: 'short', acc: [], bg: '#221a12' } });

  // ---- the tales' people: wing 4, The Borrowed Umbrella --------------------------------------------------------------
  // Gosaku (he/him), the peddler who borrowed an umbrella on a stormy night and could not bring it back for a year;
  // Myōshin (she/her), the nun of the mountain temple who lent it; the umbrella itself, grown into a karakasa spirit
  // (they/them); Gosaku's neighbours Oume (she/her), Otake (she/her) and Kyūbei (he/him), and Kaede (they/them), a
  // traveller sheltering in the village.
  ch('hall_gosaku', { name: { en: 'Gosaku', jp: 'ゴサク' }, voice: { pitch: 0.96 },
    look: { skin: 2, hair: 'short', hairColor: 1, cloth: ['#5a6a4a', '#465438', '#d8c8a0'], shape: 'tunic', acc: ['hat', 'satchel'], hatCol: '#b8a070' },
    portrait: { eyes: 'round', style: 'short', acc: ['hat'], hatCol: '#b8a070', bg: '#1e2418' } });
  ch('hall_myoshin', { name: { en: 'Myōshin', jp: 'ミョウシン' }, voice: { pitch: 0.84 },
    look: { skin: 2, hair: 'wrap', hairColor: 6, cloth: ['#4a4a52', '#3a3a42', '#e8e4d8'], shape: 'robe', acc: [], age: 'old' },
    portrait: { eyes: 'soft', style: 'wrap', age: 'old', acc: [], bg: '#1c1c22' } });
  ch('hall_karakasa', { name: { en: 'The umbrella', jp: '{唐傘|からかさ}' }, voice: { pitch: 1.24 },
    look: { custom: 'spirit', col: '#c8584a' },
    portrait: { skin: ['#e8b0a0', '#d09080'], hair: ['#8a2a22', '#a8382c', '#c8584a'], cloth: ['#c8584a', '#a8382c', '#f0d8b0'], style: 'long', eyes: 'round', acc: ['hood'], hoodCol: '#c8584a', bg: '#2a1a18' } });
  ch('hall_oume', { name: { en: 'Oume', jp: 'オウメ' }, voice: { pitch: 1.0 },
    look: { skin: 3, hair: 'bun', hairColor: 1, cloth: ['#6a7a4a', '#566438', '#e0d4b8'], shape: 'apron', acc: ['headband'], bandCol: '#e0d4b8' },
    portrait: { eyes: 'narrow', style: 'bun', collar: 'apron', acc: ['headband'], bandCol: '#e0d4b8', bg: '#202418' } });
  ch('hall_otake', { name: { en: 'Otake', jp: 'オタケ' }, voice: { pitch: 1.1 },
    look: { skin: 2, hair: 'bun', hairColor: 3, cloth: ['#7a5a6a', '#644856', '#e8d8c8'], shape: 'robe', acc: [] },
    portrait: { eyes: 'soft', style: 'bun', acc: [], bg: '#241c20' } });
  ch('hall_kyubei', { name: { en: 'Kyūbei', jp: 'キュウベエ' }, voice: { pitch: 0.78 },
    look: { skin: 2, hair: 'shaved', hairColor: 6, cloth: ['#5a5040', '#463e30', '#d8ccb0'], shape: 'robe', acc: ['cane'], age: 'old' },
    portrait: { eyes: 'narrow', style: 'shaved', age: 'old', acc: [], bg: '#1e1a14' } });
  ch('hall_kaede', { name: { en: 'Kaede', jp: 'カエデ' }, voice: { pitch: 1.04 },
    look: { skin: 1, hair: 'ponytail', hairColor: 1, cloth: ['#4a5a6a', '#3a4654', '#d8c8a0'], shape: 'tunic', acc: ['hat'], hatCol: '#8a7a5a' },
    portrait: { eyes: 'round', style: 'ponytail', acc: ['hat'], hatCol: '#8a7a5a', bg: '#1a2028' } });

  // ---- the tales' people: wing 5, The Two Wells ------------------------------------------------------------------------
  // Osugi (she/her) of the east house and Mosuke (he/him) of the west house, old neighbours who blame each other for
  // the bitter well; Kōta (he/him), Osugi's grandson, and Hatsu (she/her), Mosuke's granddaughter, who are friends;
  // Kero (they/them), the frog who has lived in the west well longer than anyone, in human shape as the tales tell it.
  ch('hall_osugi', { name: { en: 'Osugi', jp: 'オスギ' }, voice: { pitch: 0.82 },
    look: { skin: 2, hair: 'bun', hairColor: 6, cloth: ['#6a4a5a', '#563c48', '#e0d0b8'], shape: 'robe', acc: [], age: 'old' },
    portrait: { eyes: 'narrow', style: 'bun', age: 'old', acc: [], bg: '#221a1e' } });
  ch('hall_mosuke', { name: { en: 'Mosuke', jp: 'モスケ' }, voice: { pitch: 0.76 },
    look: { skin: 3, hair: 'short', hairColor: 6, cloth: ['#4a5a6a', '#3c4a58', '#d8ccb0'], shape: 'tunic', acc: ['headband'], bandCol: '#d8ccb0', age: 'old' },
    portrait: { eyes: 'narrow', style: 'short', age: 'old', acc: ['headband'], bandCol: '#d8ccb0', bg: '#1a1e24' } });
  ch('hall_kota', { name: { en: 'Kōta', jp: 'コウタ' }, voice: { pitch: 1.28 }, size: 'child',
    look: { skin: 2, hair: 'spiky', hairColor: 1, cloth: ['#c8783a', '#a8602c', '#f0e0c0'], shape: 'tunic', acc: [] },
    portrait: { eyes: 'round', style: 'spiky', acc: [], bg: '#2a2014' } });
  ch('hall_hatsu', { name: { en: 'Hatsu', jp: 'ハツ' }, voice: { pitch: 1.3 }, size: 'child',
    look: { skin: 2, hair: 'bob', hairColor: 1, cloth: ['#4a7a8a', '#3a6270', '#f0e0c0'], shape: 'tunic', acc: [] },
    portrait: { eyes: 'round', style: 'bob', acc: [], bg: '#18242a' } });
  ch('hall_kero', { name: { en: 'Kero', jp: 'ケロ' }, voice: { pitch: 1.16 }, size: 'child',
    look: { skin: 1, hair: 'short', hairColor: 4, cloth: ['#4a7a3a', '#3a622e', '#d8e0a0'], shape: 'robe', acc: [] },
    portrait: { eyes: 'round', style: 'short', acc: [], bg: '#1a2414' } });

  // ---- the tales' people: wing 6, The Toll That Changed --------------------------------------------------------------
  // Kihei (he/him), the old keeper of the toll gate on the pass, laid up with his back; Ibuki (they/them), the young
  // keeper keeping it in his place by the board; travellers Ofuku (she/her), a medicine seller, Hanbei (he/him), a
  // merchant, Kōun (they/them), a pilgrim, and Momo (she/her), a child of the pass village; Otsuta (she/her), who comes
  // down the pass at nightfall with her baby in a fever.
  ch('hall_kihei', { name: { en: 'Kihei', jp: 'キヘエ' }, voice: { pitch: 0.74 },
    look: { skin: 3, hair: 'short', hairColor: 6, cloth: ['#5a4a3a', '#46382c', '#d8c8a8'], shape: 'robe', acc: [], age: 'old' },
    portrait: { eyes: 'narrow', style: 'short', age: 'old', acc: [], bg: '#1e1810' } });
  ch('hall_ibuki', { name: { en: 'Ibuki', jp: 'イブキ' }, voice: { pitch: 1.06 },
    look: { skin: 2, hair: 'ponytail', hairColor: 0, cloth: ['#3a4a5a', '#2e3c4a', '#e0d4b8'], shape: 'tunic', acc: ['headband'], bandCol: '#a83a24' },
    portrait: { eyes: 'narrow', style: 'ponytail', acc: ['headband'], bandCol: '#a83a24', bg: '#141c24' } });
  ch('hall_ofuku', { name: { en: 'Ofuku', jp: 'オフク' }, voice: { pitch: 1.12 },
    look: { skin: 1, hair: 'bun', hairColor: 1, cloth: ['#7a3a4a', '#622e3c', '#f0e0c8'], shape: 'robe', acc: [] },
    portrait: { eyes: 'round', style: 'bun', acc: [], bg: '#241418' } });
  ch('hall_hanbei', { name: { en: 'Hanbei', jp: 'ハンベエ' }, voice: { pitch: 0.9 },
    look: { skin: 2, hair: 'short', hairColor: 2, cloth: ['#6a5a3a', '#54482e', '#e0d0a8'], shape: 'tunic', acc: ['hat'], hatCol: '#8a7048' },
    portrait: { eyes: 'narrow', style: 'short', acc: ['hat'], hatCol: '#8a7048', bg: '#1e1a10' } });
  ch('hall_koun', { name: { en: 'Kōun', jp: 'コウウン' }, voice: { pitch: 0.98 },
    look: { skin: 2, hair: 'shaved', hairColor: 1, cloth: ['#d8d0c0', '#bab2a2', '#5a5048'], shape: 'robe', acc: ['hat'], hatCol: '#c8b890' },
    portrait: { eyes: 'narrow', style: 'shaved', acc: ['hat'], hatCol: '#c8b890', bg: '#22201c' } });
  ch('hall_momo', { name: { en: 'Momo', jp: 'モモ' }, voice: { pitch: 1.32 }, size: 'child',
    look: { skin: 1, hair: 'bob', hairColor: 1, cloth: ['#d8784a', '#b8603a', '#f0e0c0'], shape: 'tunic', acc: [] },
    portrait: { eyes: 'round', style: 'bob', acc: [], bg: '#2a1a12' } });
  ch('hall_otsuta', { name: { en: 'Otsuta', jp: 'オツタ' }, voice: { pitch: 1.08 },
    look: { skin: 2, hair: 'long', hairColor: 1, cloth: ['#4a5a4a', '#3a4a3a', '#e0d8c0'], shape: 'robe', acc: [] },
    portrait: { eyes: 'round', style: 'long', acc: [], bg: '#161e16' } });
})(RB.content);
