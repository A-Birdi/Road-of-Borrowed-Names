/* Manybridge, Chapter 4: the people (expansion P09; docs/future/work/P09_MANYBRIDGE2.md). Blockprint Row's printers
 * and couriers, Playhouse Row's theatre, the festival committee, and the people the side stories meet. They speak
 * standard Japanese in their own registers (F-33); Suzu's lines have her Kansai versions as everywhere. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const ch = (id, d) => (C.chars[id] = d);
  // Sōbē: Blockprint Row's master printer. Gruff, exact, proud of blocks his grandfather cut; frightened now.
  ch('mp_sobe', {
    name: { en: 'Sōbē', jp: 'ソウベエ' }, voice: { pitch: 0.74 },
    look: { skin: 3, hair: 'shaved', hairColor: 6, cloth: ['#3a3a44', '#2a2a32', '#c8b890'], shape: 'apron', acc: ['headband'], bandCol: '#c8b890', age: 'old' },
    portrait: { eyes: 'sharp', style: 'shaved', age: 'old', acc: ['headband'], bandCol: '#c8b890', bg: '#22222a' },
  });
  // Kanta: Sōbē's apprentice, ink to the elbows, the boy who ran to the Exchange with a blank block.
  ch('mp_kanta', {
    name: { en: 'Kanta', jp: 'カンタ' }, voice: { pitch: 1.22 }, size: 'child',
    look: { skin: 2, hair: 'short', hairColor: 0, cloth: ['#4a5a7a', '#3a4862', '#d8d0bc'], shape: 'apron', acc: [] },
    portrait: { eyes: 'round', style: 'short', acc: [], bg: '#26304a' },
  });
  // Miyo: Kanta's little sister, who wants to set type and is told she is too small (The Apprentice Printer).
  ch('mp_miyo', {
    name: { en: 'Miyo', jp: 'ミヨ' }, voice: { pitch: 1.34 }, size: 'child',
    look: { skin: 2, hair: 'bob', hairColor: 0, cloth: ['#a8584a', '#86443a', '#efe2c8'], shape: 'tunic', acc: [] },
    portrait: { eyes: 'round', style: 'bob', acc: [], bg: '#3a2420' },
  });
  // Manbē: the theatre's manager, a showman whose script keeps losing its characters' names.
  ch('mp_manbe', {
    name: { en: 'Manbē', jp: 'マンベエ' }, voice: { pitch: 0.86 },
    look: { skin: 1, hair: 'short', hairColor: 3, cloth: ['#7a2a2a', '#5a1e1e', '#e8c860'], shape: 'coat', acc: ['hat'], hatCol: '#2a1e1e' },
    portrait: { eyes: 'narrow', style: 'short', acc: ['hat'], hatCol: '#2a1e1e', collar: 'high', bg: '#3a1818' },
  });
  // Sakutarō: the troupe's lead, who lost his stage name and, with it, his nerve (The Missing Lead Actor).
  ch('mp_saku', {
    name: { en: 'Sakutarō', jp: 'サクタロウ' }, voice: { pitch: 0.98 },
    look: { skin: 1, hair: 'long', hairColor: 0, cloth: ['#5a4a7a', '#463a62', '#e8dcc8'], shape: 'robe', acc: [] },
    portrait: { eyes: 'soft', style: 'long', acc: [], bg: '#2a2238' },
  });
  // Tomi: the festival committee's head, who has run the Opening of the River for thirty years and her lists for longer.
  ch('mp_tomi', {
    name: { en: 'Tomi', jp: 'トミ' }, voice: { pitch: 0.9 },
    look: { skin: 2, hair: 'bun', hairColor: 6, cloth: ['#3e6a5a', '#2e5246', '#e8dcc0'], shape: 'robe', acc: ['book'], age: 'old' },
    portrait: { eyes: 'soft', style: 'bun', pins: true, age: 'old', acc: [], bg: '#1e3029' },
  });
  // Shinobu: a writer whose stories went out under someone else's name (A Ghostwriter's Debt).
  ch('mp_shinobu', {
    name: { en: 'Shinobu', jp: 'シノブ' }, voice: { pitch: 1.04 },
    look: { skin: 2, hair: 'long', hairColor: 1, cloth: ['#6a6a5a', '#545446', '#e8e4d8'], shape: 'robe', acc: ['pencil'] },
    portrait: { eyes: 'narrow', style: 'long', acc: ['pencil'], bg: '#2a2a22' },
  });
  // Ryūsui: the popular author whose name the stories went out under. Vain, and not wholly without a conscience.
  ch('mp_ryusui', {
    name: { en: 'Ryūsui', jp: 'リュウスイ' }, voice: { pitch: 0.9 },
    look: { skin: 1, hair: 'short', hairColor: 2, cloth: ['#2a4a6a', '#1e3a54', '#e8d8a8'], shape: 'coat', acc: ['glasses'] },
    portrait: { eyes: 'sharp', style: 'short', acc: ['glasses'], collar: 'high', bg: '#1a2a3a' },
  });
  // Hayate: a courier of the Blockprint Row guild, quick and boastful; knew of Nao before meeting them.
  ch('mp_hayate', {
    name: { en: 'Hayate', jp: 'ハヤテ' }, voice: { pitch: 1.02 },
    look: { skin: 3, hair: 'short', hairColor: 0, cloth: ['#8a6a2a', '#6e5420', '#e8e0cc'], shape: 'tunic', acc: ['headband'], bandCol: '#a8462e' },
    portrait: { eyes: 'sharp', style: 'short', acc: ['headband'], bandCol: '#a8462e', bg: '#2e2414' },
  });
  // Tokubē: a tonic seller with a playbill of cures for every ailment of a far hot-spring valley.
  ch('mp_tokube', {
    name: { en: 'Tokubē', jp: 'トクベエ' }, voice: { pitch: 0.88 },
    look: { skin: 1, hair: 'short', hairColor: 4, cloth: ['#8a3a5a', '#6e2c48', '#f0d870'], shape: 'coat', acc: ['hat'], hatCol: '#6e2c48' },
    portrait: { eyes: 'narrow', style: 'short', acc: ['hat'], hatCol: '#6e2c48', bg: '#30182a' },
  });
  // Genta: the theatre's comic, who needs a straight man (the double act in journeys without Suzu).
  ch('mp_genta', {
    name: { en: 'Genta', jp: 'ゲンタ' }, voice: { pitch: 0.96 },
    look: { skin: 3, hair: 'shaved', hairColor: 1, cloth: ['#c8762a', '#a45e20', '#f0e4c8'], shape: 'tunic', acc: [] },
    portrait: { eyes: 'round', style: 'shaved', acc: [], bg: '#3a2410' },
  });
  // Hayashi: a busker with a little drum who plays wherever a crowd gathers, and leaves when it does (a wanderer).
  ch('mp_hayashi', {
    name: { en: 'Hayashi', jp: 'ハヤシ' }, voice: { pitch: 1.1 },
    look: { skin: 2, hair: 'bun', hairColor: 2, cloth: ['#2a6a6a', '#1e5252', '#f0e0b8'], shape: 'tunic', acc: ['headband'], bandCol: '#f0e0b8' },
    portrait: { eyes: 'round', style: 'bun', acc: ['headband'], bandCol: '#f0e0b8', bg: '#183030' },
  });

  // ---- notebook ------------------------------------------------------------------------------------------------
  C.notes = C.notes || {};
  C.notes.mp_oldest_block = {
    title: { jp: '{一番|いちばん} {古|ふる}い {版木|はんぎ}', en: 'The oldest block' }, fiction: true,
    jp: '{何百年|なんびゃくねん} も {前|まえ} の {版木|はんぎ} に 、 ツル さん と {同|おな}じ {言葉|ことば} が {彫|ほ}って あった 。 「{昔|むかし} の {灯守|ひもり} は 、 こういう の を 『しじま』 と {呼|よ}んだ 。」',
    en: 'A woodblock hundreds of years old in Sōbē\'s workshop carries, word for word, what Tsuru said in Reedwake: "The old keepers had a word for this: shijima." Whatever this is, it is older than anyone thought.',
  };
  C.notes.mp_kawabiraki = {
    title: { jp: '{川開|かわびら}き', en: 'The Opening of the River (kawabiraki)' }, fiction: false,
    jp: '{川開|かわびら}き は 、 {夏|なつ} の {始|はじ}め に {川|かわ} で {舟遊|ふなあそ}び を {始|はじ}める {日|ひ} の お{祭|まつ}り 。 {江戸|えど} の {両国|りょうごく} の {川開|かわびら}き で は 、 {花火|はなび} が {上|あ}がった 。',
    en: 'Kawabiraki ("opening the river") is the day boating on a river begins for the summer. Edo\'s Ryōgoku kawabiraki on the Sumida had fireworks from the 1730s; today\'s Sumida River fireworks descend from it. Manybridge\'s Opening is the game\'s own festival, in that tradition.',
  };
  C.notes.mp_yukata = {
    title: { jp: '{浴衣|ゆかた}', en: 'Yukata' }, fiction: false,
    jp: '{浴衣|ゆかた} は 、 {夏|なつ} に {着|き}る {木綿|もめん} の {軽|かる}い {着物|きもの} 。 {帯|おび} で {結|むす}ぶ 。 {夏祭|なつまつ}り や {花火|はなび} の {夜|よる} に よく {着|き}る 。',
    en: 'A yukata is a light cotton kimono for summer, tied with a sash (obi). People wear them to summer festivals and fireworks. The committee lends them to its helpers for the night; they go back the next morning.',
  };
  C.notes.mp_tamaya = {
    title: { jp: '「たまや」 と 「かぎや」', en: '"Tamaya!" and "Kagiya!"' }, fiction: false,
    jp: '{花火|はなび} が {開|ひら}く と 、 「たまや ！」 「かぎや ！」 と {声|こえ} を かける 。 {江戸|えど} の {二|ふた}つ の {花火屋|はなびや} の {名前|なまえ} 。',
    en: 'When a firework opens, people call out "Tamaya!" or "Kagiya!": the names of two fireworks makers of Edo. The houses are long gone; the shout has outlived them.',
  };
  C.notes.mp_kawaraban = {
    title: { jp: '{瓦版|かわらばん}', en: 'Kawaraban, the broadsheet' }, fiction: false,
    jp: '{瓦版|かわらばん} は 、 {江戸|えど} {時代|じだい} の {一枚|いちまい} {刷|ず}り の {知|し}らせ 。 {町|まち} で {読|よ}み{上|あ}げながら {売|う}った 。',
    en: 'Kawaraban were the single-sheet news prints of the Edo period, cut in woodblock and sold in the street by criers who read the stories aloud.',
  };
  C.notes.mp_hyakumonogatari = {
    title: { jp: '{百物語|ひゃくものがたり}', en: 'Hyaku-monogatari, a hundred tales' }, fiction: false,
    jp: '{百物語|ひゃくものがたり} は 、 {江戸|えど} {時代|じだい} の {夜|よる} の {集|あつ}まり 。 {百|ひゃく} の {灯|あか}り を {点|つ}けて {怖|こわ}い {話|はなし} を し 、 {一|ひと}つ {話|はな}す たび に {一|ひと}つ {消|け}した 。',
    en: 'Hyaku-monogatari ("a hundred tales") was an Edo-period gathering: a hundred lights, a hundred strange tales told by lamplight, one light put out after each. Tradition said something came when the hundredth went out, so people often stopped at ninety-nine. The playhouse\'s script, where lantern-keepers\' apprentices light the lamps one tale at a time, is the game\'s own.',
  };
  C.notes.mp_kuroko = {
    title: { jp: '{黒子|くろこ}', en: 'Kuroko, the stagehands in black' }, fiction: false,
    jp: '{歌舞伎|かぶき} の {黒子|くろこ} は 、 {黒|くろ}い {服|ふく} と {頭巾|ずきん} で {舞台|ぶたい} に {出|で}る 。 お{客|きゃく} は 、 {黒子|くろこ} を 「いない」 こと に して {見|み}る 。',
    en: 'In kabuki and puppet theatre, kuroko are stagehands dressed in black, hood and all, who move props and actors in full view. By convention the audience treats them as not there. The Understage\'s Prompter\'s Ghost is the game\'s own creature.',
  };
})(RB.content);
