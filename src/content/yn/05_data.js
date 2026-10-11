/* Steamhollow, Chapter 11: the people (expansion P13; docs/future/work/P13_STEAMHOLLOW.md). The two great inns, the
 * Upper House (上の湯) and the Lower House (下の湯), and their people; the bath-keepers' guild caught between them;
 * Kikue's dispensary (Mio's crossroads, sealed S14) and Suzu's old troupe playing the valley's little theatre (her
 * crossroads, S14); the market by the red bridge, with Tokube the tonic seller from Manybridge's Playhouse Row come to
 * sell his "cures" at their source; the side stories' people; and the newcomers, come down from villages above where
 * nobody speaks any more (S15), who cannot say why they came. They speak standard Japanese in their own registers (the
 * Upper House's staff in polished hospitality keigo, the Lower House's people plainly); Suzu's lines have her Kansai
 * versions as everywhere. Pronouns, for anyone writing about them: Tokuzō, Tahei, Zenroku, Rokubei, Tokube,
 * Bunkichi, Yoshimatsu, Ginnojō, Shinza, Yasuke, Tsuneji, Kihachi, Senta and Heikichi he/him; Oritsu, Okiyo, Kane, Aki,
 * Tama, Kume, Kanae, Kikue, Koume, Oshige, Toki and Onatsu she/her. The valley, its inns and its people are fiction. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const ch = (id, d) => (C.chars[id] = d);
  // ---- the Upper House (上の湯) ------------------------------------------------------------------------------------
  // Oritsu: the proprietress (女将); third of her line; exacting, proud of the house's rules, kinder than she lets show.
  ch('yn_oritsu', {
    name: { en: 'Oritsu', jp: 'オリツ' }, voice: { pitch: 0.94 },
    look: { skin: 1, hair: 'bun', hairColor: 4, cloth: ['#5a2a3a', '#46202e', '#e8d8c0'], shape: 'robe', acc: [], age: 'adult' },
    portrait: { eyes: 'sharp', style: 'bun', collar: 'high', bg: '#2a1620' },
  });
  // Tokuzō: the head clerk (番頭) at the front desk; run off his feet; keeps the reservations book like scripture.
  ch('yn_tokuzo', {
    name: { en: 'Tokuzō', jp: 'トクゾウ' }, voice: { pitch: 0.9 },
    look: { skin: 2, hair: 'short', hairColor: 5, cloth: ['#3a4250', '#2c3440', '#e0d8c8'], shape: 'coat', acc: ['glasses', 'pencil'], age: 'old' },
    portrait: { eyes: 'narrow', style: 'short', acc: ['glasses'], age: 'old', collar: 'high', bg: '#1c2028' },
  });
  // Okiyo: a maid (仲居); explains the house rules to every new guest, cheerfully, all day.
  ch('yn_okiyo', {
    name: { en: 'Okiyo', jp: 'オキヨ' }, voice: { pitch: 1.1 },
    look: { skin: 1, hair: 'bun', hairColor: 0, cloth: ['#c86a4a', '#a8543a', '#f2e6d0'], shape: 'apron', acc: ['ribbon'], ribbonCol: '#f2e6d0' },
    portrait: { eyes: 'round', style: 'bun', collar: 'apron', bg: '#3a1e16' },
  });
  // ---- the Lower House (下の湯) ------------------------------------------------------------------------------------
  // Tahei: the master; loud, warm, few rules ("hot water, clean feet, that's all"); dug the new outdoor bath himself.
  ch('yn_tahei', {
    name: { en: 'Tahei', jp: 'タヘエ' }, voice: { pitch: 0.78 },
    look: { skin: 3, hair: 'shaved', hairColor: 0, cloth: ['#2e4a5a', '#223a48', '#e8dcc4'], shape: 'round', acc: ['headband'], bandCol: '#e8dcc4' },
    portrait: { eyes: 'round', style: 'shaved', acc: ['headband'], bandCol: '#e8dcc4', collar: 'open', bg: '#16242c' },
  });
  // Kane: Tahei's wife; keeps the Lower House's books and its peace; says the quiet thing her husband won't.
  ch('yn_kane', {
    name: { en: 'Kane', jp: 'カネ' }, voice: { pitch: 1.0 },
    look: { skin: 2, hair: 'wrap', hairColor: 1, cloth: ['#4a5a3a', '#3a482e', '#e6dcc6'], shape: 'apron', acc: ['scarf'], scarfCol: '#d8b860' },
    portrait: { eyes: 'soft', style: 'wrap', collar: 'apron', bg: '#1e2618' },
  });
  // Zenroku: a cloth merchant staying at the Lower House; complains by saying everything except what he means.
  ch('yn_zenroku', {
    name: { en: 'Zenroku', jp: 'ゼンロク' }, voice: { pitch: 0.96 },
    look: { skin: 1, hair: 'short', hairColor: 2, cloth: ['#6a5a7a', '#544866', '#e6dccc'], shape: 'coat', acc: ['hat'], hatCol: '#5a4a3a' },
    portrait: { eyes: 'narrow', style: 'short', acc: ['hat'], hatCol: '#5a4a3a', collar: 'high', bg: '#221c28' },
  });
  // ---- the bath-keepers' guild (湯守) -------------------------------------------------------------------------------
  // Rokubei: head of the guild; forty years keeping the channels; wrote the letter the relay carried; tired of being
  // asked to take sides.
  ch('yn_rokubei', {
    name: { en: 'Rokubei', jp: 'ロクベエ' }, voice: { pitch: 0.7 },
    look: { skin: 3, hair: 'short', hairColor: 5, cloth: ['#4a4a3e', '#3a3a30', '#d8ccb0'], shape: 'tunic', acc: ['headband', 'beard'], bandCol: '#d8ccb0', age: 'old' },
    portrait: { eyes: 'narrow', style: 'short', acc: ['headband', 'beard'], bandCol: '#d8ccb0', age: 'old', collar: 'open', bg: '#22221a' },
  });
  // Aki: a young bath-keeper; reads the water's temper by hand; has no patience for anyone muddying it.
  ch('yn_aki', {
    name: { en: 'Aki', jp: 'アキ' }, voice: { pitch: 1.08 },
    look: { skin: 2, hair: 'ponytail', hairColor: 3, cloth: ['#3a5a5a', '#2c4848', '#e2dccc'], shape: 'tunic', acc: ['headband', 'toolbelt'], bandCol: '#e8c84a' },
    portrait: { eyes: 'sharp', style: 'ponytail', acc: ['headband'], bandCol: '#e8c84a', bg: '#162424' },
  });
  // ---- the market by the red bridge --------------------------------------------------------------------------------
  // Tama: sells eggs boiled in the spring (温泉卵) from a steam box; teaches anyone who asks.
  ch('yn_tama', {
    name: { en: 'Tama', jp: 'タマ' }, voice: { pitch: 1.02 },
    look: { skin: 2, hair: 'bun', hairColor: 2, cloth: ['#d8a84a', '#b88a3a', '#f4ecd8'], shape: 'apron', acc: ['basket'] },
    portrait: { eyes: 'round', style: 'bun', collar: 'apron', bg: '#33260e' },
  });
  // Onatsu: keeps the souvenir stall on the bridge; knows everyone's business and shares it.
  ch('yn_onatsu', {
    name: { en: 'Onatsu', jp: 'オナツ' }, voice: { pitch: 1.06 },
    look: { skin: 1, hair: 'bob', hairColor: 1, cloth: ['#7a3a4a', '#622e3c', '#f0e2d0'], shape: 'apron', acc: ['flower'] },
    portrait: { eyes: 'round', style: 'bob', collar: 'apron', bg: '#2c161c' },
  });
  // Kihachi: the geta-maker; can tell a guest's walk from the sound of their sandals on the stone.
  ch('yn_kihachi', {
    name: { en: 'Kihachi', jp: 'キハチ' }, voice: { pitch: 0.84 },
    look: { skin: 3, hair: 'spiky', hairColor: 5, cloth: ['#5a4632', '#463626', '#d8c8a8'], shape: 'tunic', acc: ['toolbelt'], age: 'old' },
    portrait: { eyes: 'narrow', style: 'spiky', age: 'old', collar: 'open', bg: '#241c12' },
  });
  // Toki: lights the valley's lanterns at dusk, one street at a time (Ren's beat).
  ch('yn_toki', {
    name: { en: 'Toki', jp: 'トキ' }, voice: { pitch: 1.04 },
    look: { skin: 1, hair: 'braid', hairColor: 0, cloth: ['#3e3a5a', '#302c48', '#e8dcc8'], shape: 'tunic', acc: ['lamp'] },
    portrait: { eyes: 'soft', style: 'braid', bg: '#1a1828' },
  });
  // Senta: the valley's postman; walks the north road and back every day on sore feet (Nao's beat).
  ch('yn_senta', {
    name: { en: 'Senta', jp: 'センタ' }, voice: { pitch: 1.0 },
    look: { skin: 3, hair: 'short', hairColor: 0, cloth: ['#4a5a6a', '#3a4856', '#e4dccc'], shape: 'tunic', acc: ['satchel', 'headband'], bandCol: '#c83a32' },
    portrait: { eyes: 'round', style: 'short', acc: ['headband'], bandCol: '#c83a32', bg: '#1c2430' },
  });
  // Heikichi: paints the inns' signs; paints what he's told, spelling and all.
  ch('yn_heikichi', {
    name: { en: 'Heikichi', jp: 'ヘイキチ' }, voice: { pitch: 0.92 },
    look: { skin: 2, hair: 'curly', hairColor: 2, cloth: ['#6a6a5a', '#56564a', '#e8e0cc'], shape: 'tunic', acc: ['pencil', 'patches'] },
    portrait: { eyes: 'round', style: 'curly', collar: 'open', bg: '#22221c' },
  });
  // ---- the dispensary (Mio's crossroads, sealed S14) ---------------------------------------------------------------
  // Kikue: a healer at the springs, Mio's mother's old friend; retiring; honest about what the waters can and can't do.
  ch('yn_kikue', {
    name: { en: 'Kikue', jp: 'キクエ' }, voice: { pitch: 0.9 },
    look: { skin: 1, hair: 'bun', hairColor: 5, cloth: ['#4a6a5a', '#3a5648', '#ece4d4'], shape: 'robe', acc: ['glasses'], age: 'old' },
    portrait: { eyes: 'soft', style: 'bun', acc: ['glasses'], age: 'old', collar: 'high', bg: '#1a2620' },
  });
  // ---- the troupe at the little theatre (Suzu's crossroads, sealed S14) --------------------------------------------
  // Koume: Suzu's double-act partner of those years, now the troupe's lead comic; laughs first.
  ch('yn_koume', {
    name: { en: 'Koume', jp: 'コウメ' }, voice: { pitch: 1.08 },
    look: { skin: 2, hair: 'twintails', hairColor: 1, cloth: ['#c84a5a', '#a83a4a', '#f4e6d4'], shape: 'dress', acc: ['ribbon'], ribbonCol: '#f4e6d4' },
    portrait: { eyes: 'round', style: 'twintails', collar: 'open', bg: '#3a1418' },
  });
  // Shinza: the troupe's head (座長); counts the house by ear; owes Suzu more than he knows.
  ch('yn_shinza', {
    name: { en: 'Shinza', jp: 'シンザ' }, voice: { pitch: 0.82 },
    look: { skin: 2, hair: 'long', hairColor: 4, cloth: ['#3a3a5a', '#2c2c48', '#e2d8c4'], shape: 'coat', acc: ['scarf'], scarfCol: '#c8a84a', age: 'old' },
    portrait: { eyes: 'narrow', style: 'long', age: 'old', collar: 'high', bg: '#1a1a2c' },
  });
  // ---- the side stories --------------------------------------------------------------------------------------------
  // Bunkichi: the masseur (按摩); works by touch and by the old patter he sings while he works, and has lost the words.
  ch('yn_bunkichi', {
    name: { en: 'Bunkichi', jp: 'ブンキチ' }, voice: { pitch: 0.86 },
    look: { skin: 2, hair: 'shaved', hairColor: 5, cloth: ['#5a5a6a', '#48485a', '#e0d8c8'], shape: 'robe', acc: ['cane'], age: 'old' },
    portrait: { eyes: 'narrow', style: 'shaved', age: 'old', collar: 'high', bg: '#20202a' },
  });
  // Kume: go-between (仲人) for a wedding party that has booked both inns at once.
  ch('yn_kume', {
    name: { en: 'Kume', jp: 'クメ' }, voice: { pitch: 0.98 },
    look: { skin: 1, hair: 'bun', hairColor: 3, cloth: ['#2a2a3a', '#1e1e2c', '#e8dcc8'], shape: 'robe', acc: ['flower'], age: 'adult' },
    portrait: { eyes: 'sharp', style: 'bun', collar: 'high', bg: '#18182a' },
  });
  // Yoshimatsu: the groom; would marry in a shed if it meant no more letters about rooms.
  ch('yn_yoshimatsu', {
    name: { en: 'Yoshimatsu', jp: 'ヨシマツ' }, voice: { pitch: 1.04 },
    look: { skin: 2, hair: 'short', hairColor: 0, cloth: ['#3a3a3a', '#2a2a2a', '#f0e8d8'], shape: 'coat', acc: [] },
    portrait: { eyes: 'round', style: 'short', collar: 'high', bg: '#1c1c1c' },
  });
  // Ginnojō: a retired comic actor of Manybridge's Playhouse Row, taking the waters; Suzu's old idol.
  ch('yn_ginnojo', {
    name: { en: 'Ginnojō', jp: 'ギンノジョウ' }, voice: { pitch: 0.8 },
    look: { skin: 1, hair: 'wavy', hairColor: 5, cloth: ['#6a4a2a', '#563c22', '#ece0c8'], shape: 'robe', acc: ['scarf', 'cane'], scarfCol: '#9a3a3a', age: 'old' },
    portrait: { eyes: 'soft', style: 'wavy', age: 'old', collar: 'high', bg: '#2a1c10' },
  });
  // Kanae: the footbath poet; sits with her feet in the terrace footbath and writes the valley one short story at a
  // time.
  ch('yn_kanae', {
    name: { en: 'Kanae', jp: 'カナエ' }, voice: { pitch: 1.0 },
    look: { skin: 1, hair: 'long', hairColor: 1, cloth: ['#5a6a7a', '#485866', '#eee6d6'], shape: 'dress', acc: ['book'] },
    portrait: { eyes: 'soft', style: 'long', collar: 'open', bg: '#1c2430' },
  });
  // ---- the newcomers, down from the silent villages (S15) -----------------------------------------------------------
  // Yasuke: a charcoal burner from a village up the mountain; came down the night his village went quiet.
  ch('yn_yasuke', {
    name: { en: 'Yasuke', jp: 'ヤスケ' }, voice: { pitch: 0.82 },
    look: { skin: 3, hair: 'short', hairColor: 0, cloth: ['#4a4440', '#3a3430', '#c8bca8'], shape: 'tunic', acc: ['patches'] },
    portrait: { eyes: 'narrow', style: 'short', collar: 'open', bg: '#1e1a18' },
  });
  // Oshige: a weaver from the same mountain; can't remember why she came, only that it was too quiet to stay.
  ch('yn_oshige', {
    name: { en: 'Oshige', jp: 'オシゲ' }, voice: { pitch: 0.96 },
    look: { skin: 1, hair: 'wrap', hairColor: 4, cloth: ['#6a5a4a', '#56483a', '#e2d8c4'], shape: 'apron', acc: ['scarf'], scarfCol: '#a8a090', age: 'old' },
    portrait: { eyes: 'soft', style: 'wrap', age: 'old', collar: 'apron', bg: '#241e18' },
  });
  // Tsuneji: a carter; brought six neighbours down in his cart and hasn't said a word about it.
  ch('yn_tsuneji', {
    name: { en: 'Tsuneji', jp: 'ツネジ' }, voice: { pitch: 0.88 },
    look: { skin: 2, hair: 'spiky', hairColor: 2, cloth: ['#5a4a3a', '#483a2e', '#d8ccb4'], shape: 'tunic', acc: ['headband'], bandCol: '#8a7a5a' },
    portrait: { eyes: 'round', style: 'spiky', acc: ['headband'], bandCol: '#8a7a5a', bg: '#221c16' },
  });
})(RB.content);
