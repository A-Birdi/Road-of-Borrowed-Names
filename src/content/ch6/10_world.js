/* Chapter 6 — The Still Archive (静寂の書庫). World data: characters,
 * items, quests, notes, the pilgrims' hut travel point, the Archive's
 * palettes and procedural art, and two small story hooks.
 * Story bible: docs/STORY.md. Prefix: sa. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const T = (en, jp) => ({ en, jp });

  // ---- characters ---------------------------------------------------------------
  C.chars.sa_oyone = {
    name: T('Oyone', 'オヨネ'), voice: { pitch: 0.85 },
    look: { skin: 2, hair: 'bun', hairColor: 5, cloth: ['#5a4a6a', '#44385a', '#c8a060'], shape: 'coat', acc: ['scarf'], scarfCol: '#a85a4a', age: 'old' },
    portrait: { eyes: 'narrow', style: 'bun', age: 'old', acc: ['scarf'], scarfCol: '#a85a4a', bg: '#2e2a38' },
  };
  C.chars.sa_isamu = {
    name: T('Isamu', 'イサム'), voice: { pitch: 0.8 },
    look: { skin: 3, hair: 'short', hairColor: 5, cloth: ['#3e5a6a', '#2e4654', '#c8b890'], shape: 'tunic', acc: ['hat'], hatCol: '#6a5a44' },
    portrait: { eyes: 'narrow', style: 'short', beard: '#8a8a90', acc: ['hat'], hatCol: '#6a5a44', bg: '#24323c' },
  };
  // The catalogue clerk construct: one character before it is named, one after.
  const clerkLook = { custom: 'sa_clerk', col: '#ece6d6' };
  const clerkFace = {
    skin: ['#ece6d6', '#cfc6b0'], hair: ['#d8d0bc', '#c4bca8', '#f4f0e6'], cloth: ['#8a8474', '#6e695c', '#c85a4a'],
    style: 'shaved', acc: [], eyes: 'round', bg: '#2a2c40', age: 'adult',
    extra2: (c, expr) => {
      // a face made of index cards: a ruled card for a forehead, ink-slit eyes
      const R = (x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
      R(24, 16, 48, 20, '#f4efe2'); R(24, 16, 48, 2, '#c85a4a'); R(24, 18, 48, 1, '#e8a090');
      R(70, 18, 2, 18, '#d8d0bc'); R(24, 35, 48, 1, '#cfc6b0');
      for (let i = 0; i < 3; i++) R(26, 22 + i * 5, 44, 1, '#b8b0a0');
      R(28, 38, 40, 28, '#f4efe2'); R(28, 38, 40, 1, '#fffaf0'); R(66, 39, 2, 27, '#d8d0bc'); R(28, 65, 40, 1, '#c4bca8');
      const ink = '#2a2436';
      if (expr === 'smile' || expr === 'laugh') { R(34, 46, 8, 2, ink); R(54, 46, 8, 2, ink); R(33, 47, 1, 1, ink); R(62, 47, 1, 1, ink); }
      else if (expr === 'surprise') { R(36, 42, 4, 9, ink); R(56, 42, 4, 9, ink); }
      else { R(36, 44, 4, 6, ink); R(56, 44, 4, 6, ink); R(36, 44, 1, 2, '#6a6480'); R(56, 44, 1, 2, '#6a6480'); }
      R(40, 60, 16, 2, '#b8b0a0');
    },
  };
  C.chars.sa_clerk = { name: T('Catalogue Clerk', '{目録|もくろく}{係|がかり}'), voice: { pitch: 1.2, rate: 0.9 }, look: clerkLook, portrait: clerkFace };
  C.chars.sa_tsuzuri = { name: T('Tsuzuri', 'ツヅリ'), voice: { pitch: 1.2, rate: 0.9 }, look: clerkLook, portrait: clerkFace };
  C.chars.sa_ushio = {
    name: T('Master Ushio', 'ウシオ'), voice: { pitch: 0.75 },
    look: { skin: 3, hair: 'wrap', hairColor: 5, cloth: ['#3a3e6a', '#2a2c50', '#d8b060'], shape: 'coat', acc: ['lamp'], wrapCol: '#6a6a78', age: 'old' },
    portrait: {
      eyes: 'narrow', style: 'wrap', wrapCol: '#6a6a78', age: 'old', collar: 'high', acc: ['lamp'], bg: '#262a44',
      // thick brows and an ink smudge on the left cheek (Ren remembers both)
      brows: 'thick', browCol: '#d8d4d0', smudge: '#2a2436',
    },
  };
  C.chars.sa_tae = {
    name: T('Tae', 'タエ'), voice: { pitch: 0.9 },
    look: { skin: 1, hair: 'bun', hairColor: 6, cloth: ['#6a6a8a', '#50506e', '#d8c8a0'], shape: 'robe', acc: [], age: 'old' },
    portrait: { eyes: 'soft', style: 'bun', age: 'old', collar: 'high', bg: '#2a2840' },
  };
  C.chars.sa_reader = {
    name: T('Reader', '{読|よ}み{手|て}'),
    look: { skin: 4, hair: 'braid', hairColor: 1, cloth: ['#7a5a3a', '#5e442c', '#e8d8b0'], shape: 'tunic', acc: ['glasses'] },
  };
  // People from earlier chapters who appear in the denouement. Their own
  // chapters define them; these are fallbacks so this chapter stands alone.
  const fallback = (id, d) => { if (!C.chars[id]) C.chars[id] = d; };
  fallback('hiro', { name: T('Hiro', 'ヒロ'), look: { skin: 3, hair: 'short', hairColor: 2, cloth: ['#8a5a3a', '#6e442a', '#8fb8b0'], shape: 'apron', acc: [] }, portrait: { eyes: 'round', style: 'short', collar: 'apron', acc: ['goggles'], bg: '#3a2a24' } });
  fallback('hoshino', { name: T('Hoshino', 'ホシノ'), look: { skin: 1, hair: 'short', hairColor: 6, cloth: ['#3a4a6a', '#2c3850', '#d8c890'], shape: 'coat', acc: ['glasses', 'scarf'], scarfCol: '#8a8ab0', age: 'old' }, portrait: { eyes: 'soft', style: 'short', age: 'old', beard: true, acc: ['glasses', 'scarf'], scarfCol: '#8a8ab0', bg: '#1e2438' } });
  fallback('akari', { name: T('Akari', 'アカリ'), look: { skin: 1, hair: 'bob', hairColor: 0, cloth: ['#4c4a78', '#3a3860', '#e8e0c8'], shape: 'robe', acc: ['glasses'] }, portrait: { eyes: 'soft', style: 'bob', collar: 'high', acc: ['glasses'], bg: '#2a2848' } });
  fallback('umi', { name: T('Umi', 'ウミ'), look: { skin: 2, hair: 'long', hairColor: 1, cloth: ['#3a6a7a', '#2a5260', '#e8d8b0'], shape: 'dress', acc: [] }, portrait: { eyes: 'sharp', style: 'long', bg: '#1e3440' } });
  fallback('lf_toya', { name: T('A young voice', '{若|わか}い {声|こえ}'), look: { skin: 1, hair: 'spiky', hairColor: 2, cloth: ['#6c8cbc', '#4a6c9c', '#e0e8f8'], shape: 'tunic', acc: ['scarf'], scarfCol: '#e0e8f8' }, portrait: { eyes: 'round', style: 'spiky', acc: ['scarf'], scarfCol: '#e0e8f8', bg: '#1a2a44' } });
  fallback('kanta', { name: T('Kanta', 'カンタ'), look: { skin: 3, hair: 'short', hairColor: 1, cloth: ['#5a6a7a', '#465464', '#e8d8b0'], shape: 'coat', acc: ['scarf'], scarfCol: '#a85a4a' }, portrait: { eyes: 'round', style: 'short', acc: ['scarf'], scarfCol: '#a85a4a', bg: '#243040' } });
  fallback('lf_yae', { name: T('Councillor Tami', 'タミ'), look: { skin: 2, hair: 'bun', hairColor: 6, cloth: ['#6a3a5a', '#502a44', '#e8c070'], shape: 'robe', acc: [], age: 'old' }, portrait: { eyes: 'narrow', style: 'bun', age: 'old', collar: 'high', pins: true, bg: '#3a2438' } });
  fallback('wataru', { name: T('Wataru', 'ワタル'), look: { skin: 2, hair: 'short', hairColor: 1, cloth: ['#5a6a7a', '#465464', '#e8e0cc'], shape: 'coat', acc: ['glasses'] }, portrait: { eyes: 'round', style: 'short', collar: 'high', acc: ['glasses'], bg: '#2a3440' } });

  // ---- items --------------------------------------------------------------------------
  C.items.sa_letter_kasane = { name: T("Kasane's first folio", 'カサネ の {最初|さいしょ} の {綴|つづ}り'), desc: 'The first memory ever shelved in the Room of Set-Down Memories: Kasane\'s own half of a quarrel in a council corridor, thirty years ago.', key: true };
  C.items.sa_toya_reply = { name: T("Tōya's note", 'トウヤ の {書|か}き{置|お}き'), desc: 'A bell-tower key slip. On the back, in a hurried young hand: 「必要なら開ける」. On the front, in Kasane\'s neat one: "Key taken out — messenger Tōya. Without permission."', key: true };
  C.items.sa_notice = { name: T('Council notice', '{議会|ぎかい} の {貼|は}り{紙|がみ}'), desc: 'A water-stained notice posted by the Lanternfall council on the night of the flood: Takase\'s reply, how the council chose to read it, and an order that the bell tower stay locked.', key: true };
  C.items.sa_tae_slip = { name: T("Tae's slip", 'タエ の {紙片|しへん}'), desc: 'A set-down memory of the flood night: the bell that rang from a locked tower.', key: true };
  C.items.sa_folio_isamu = { name: T("Isamu's folio", 'イサム の {綴|つづ}り'), desc: 'A thin folio filed under "a laugh, before the kettle boils". Isamu asked for it back.', key: true };
  C.items.sa_ushio_notes = { name: T("Ushio's notebook", 'ウシオ の {手帳|てちょう}'), desc: 'A battered notebook of objections, recipes and, near the back, three names for the Archive\'s clerk.', key: true };
  C.items.sa_ren_folio = { name: T("Ren's folio", 'レン の {綴|つづ}り'), desc: 'Filed by Master Ushio: "To be held until the person themself chooses." Not yours to open.', key: true };
  C.items.sa_bookmark = { name: T('Archive bookmark', '{書庫|しょこ} の {栞|しおり}'), desc: 'A bookmark of pale card with a red thread, given by Tsuzuri. It marks a place so you can come back to it.', slot: 'charm' };

  // ---- quests ---------------------------------------------------------------------------
  C.quests.sa_main = {
    main: true, chapter: 6, title: T('The Still Archive', '{静寂|しじま} の {書庫|しょこ}'),
    stages: [
      T('Climb the lantern road above Lanternfall to the Still Archive.', '{灯落|ひおち} の {上|うえ} の {道|みち} を {登|のぼ}って 、 {書庫|しょこ} へ {行|い}こう 。'),
      T('Something has blanked the catalogue in the Reading Room. Put the cards back where they belong.', '{閲覧室|えつらんしつ} の {目録|もくろく} を {元|もと} に {戻|もど}そう 。'),
      T('Find the way down through the Stacks. The call slip on the desk says which aisle.', '{書架|しょか} を {抜|ぬ}けて 、 {下|した} へ {降|お}りる {道|みち} を {探|さが}そう 。'),
      T('The conduits end in a basin beneath the Archive. Get the charter gate to let you through.', '{水路|すいろ} の {門|もん} を {開|あ}けて もらおう 。'),
      T('Beyond the Room of Set-Down Memories is the Keeper\'s study. Look around; go up when you\'re ready.', '{記憶|きおく} の {部屋|へや} の {先|さき} に 、 カサネ の {書斎|しょさい} が ある 。'),
      T('Climb to the Heart of the Hush. Kasane is waiting.', '{静寂|しじま} の {芯|しん} へ {登|のぼ}ろう 。 カサネ が {待|ま}って いる 。'),
      T('Go down to the Room of Set-Down Memories and decide what happens to what people gave away.', '{記憶|きおく} の {部屋|へや} で 、 {預|あず}けられた {記憶|きおく} を どう する か {決|き}めよう 。'),
      T('In the Reading Room, decide what the Archive becomes.', '{閲覧室|えつらんしつ} で 、 {書庫|しょこ} の これから を {決|き}めよう 。'),
      T('Kasane will be waiting at the gate. Decide where they go.', '{門|もん} で カサネ が {待|ま}って いる 。'),
      T('Go home. Take the road down.', '{帰|かえ}ろう 。 {坂|さか} を {下|くだ}って 。'),
    ],
  };
  C.quests.sa_isamu = {
    title: T('The Laugh in the Folio', '{綴|つづ}り の {中|なか} の {笑|わら}い{声|ごえ}'), chapter: 6,
    stages: [
      T('Isamu set down the sound of his wife\'s laugh years ago and wants it back. Find his folio in the Room of Set-Down Memories — the catalogue describes things its own way.', '{記憶|きおく} の {部屋|へや} で イサム の {綴|つづ}り を {探|さが}そう 。'),
      T('Take the folio to Isamu at the Last Lamp Hut.', 'イサム に {綴|つづ}り を {届|とど}けよう 。'),
    ],
    reward: { flags: ['sa_isamu_done'] },
  };
  C.quests.sa_clerk = {
    title: T('A Name for the Clerk', '{係|かかり} に {名前|なまえ} を'), chapter: 6,
    stages: [
      T('The catalogue clerk says Master Ushio meant to name it. Look for Ushio\'s notes beyond the Reading Room.', 'ウシオ の {手帳|てちょう} を {探|さが}そう 。'),
      T('Bring what Ushio wrote back to the clerk in the Reading Room.', '{閲覧室|えつらんしつ} の {係|かかり} に {伝|つた}えよう 。'),
    ],
    reward: { items: { sa_bookmark: 1 }, flags: ['sa_clerk_named'] },
  };

  // ---- notebook lore -----------------------------------------------------------------------
  C.notes.sa_archive = {
    title: T('The Still Archive', '{静寂|しじま} の {書庫|しょこ}'), fiction: true,
    jp: '{洪水|こうずい} や {火事|かじ} の {後|あと} 、 {失|うしな}われた {名前|なまえ} を {取|と}り{戻|もど}す ため に {建|た}てられた {書庫|しょこ} 。 {名前|なまえ} の {写|うつ}し を {守|まも}り 、 {求|もと}められれば {返|かえ}す はず だった 。',
    en: '(Fiction.) Built in the mountains above Lanternfall to keep copies of every name and promise, so the region could recover after floods and fires. It was meant to keep copies — and to give them back when asked.',
  };
  C.notes.sa_hush = {
    title: T('The Hush', '{静寂|しじま}'), fiction: true,
    jp: '{名前|なまえ} 、 {言|い}い{争|あらそ}い 、 {曖昧|あいまい}な {言葉|ことば} を {世界|せかい} から {持|も}ち{上|あ}げて しまう {静|しず}かな {力|ちから} 。 はじめ は {頼|たの}まれた もの だけ を {預|あず}かって いた 。',
    en: '(Fiction.) The quiet force that lifts names, disagreements and ambiguities out of the world and carries them uphill. At first it only kept what people asked it to keep. By the end it no longer asked anyone — not even Kasane.',
  };
  C.notes.sa_kasane = {
    title: T('Kasane', 'カサネ'), fiction: true,
    jp: '{三十年|さんじゅうねん} {前|まえ} 、 {灯落|ひおち} の {議会|ぎかい} の {書記|しょき} だった 。 {弟|おとうと} の トウヤ は {使|つか}い だった 。 {二人|ふたり} は {高瀬|たかせ} の {返事|へんじ} を めぐって 、 {議会|ぎかい} の {廊下|ろうか} で {言|い}い{争|あらそ}った 。',
    en: '(Fiction.) Thirty years ago, clerk to the Lanternfall council. Their younger brother Tōya was the council\'s messenger. They quarrelled in the council corridor over how to read Takase\'s reply; that night the flood came, and Tōya did not come back. Kasane set down their own half of the quarrel — the first memory the Archive ever kept.',
  };
  C.notes.sa_toya = {
    title: T('「必要なら開ける」', '「{必要|ひつよう}なら {開|あ}ける」'), fiction: true,
    jp: '{高瀬|たかせ} の {返事|へんじ} と {同|おな}じ {四語|よんご} 。 でも トウヤ の {書|か}き{置|お}き は 、 {鐘楼|しょうろう} の {鍵|かぎ} の {控|ひか}え の {裏|うら} に 、 カサネ へ の {返事|へんじ} と して {書|か}かれて いた 。 {開|あ}ける の は {自分|じぶん} 、 {開|あ}ける の は {鐘楼|しょうろう} 。',
    en: 'The same four words as Takase\'s reply — but Tōya wrote his on the back of the bell-tower key slip, straight after Kasane told him "no one is opening it". Japanese often leaves out subject and object when context supplies them; here the context says: I will open the bell tower. Takase\'s 必要なら left open "needed by whom?"; in Tōya\'s note, the one who judges is the one who acts. He kept the promise.',
  };
  C.notes.sa_ushio = {
    title: T('Master Ushio', 'ウシオ{師匠|ししょう}'), fiction: true,
    jp: 'レン の {師匠|ししょう} 。 {七|なな}{冬|ふゆ} {前|まえ} 、 カサネ と {言|い}い{争|あらそ}う ため に {書庫|しょこ} へ {来|き}て 、 {六年|ろくねん} 、 {反対|はんたい} し{続|つづ}けた 。',
    en: '(Fiction.) A lantern keeper, Ren\'s teacher. Came to the Archive seven winters ago to have it out with Kasane, and spent six years doing exactly that. Died there last winter. Kasane never shelved a single one of Ushio\'s objections.',
  };
  C.notes.sa_memories = {
    title: T('The Room of Set-Down Memories', '{預|あず}けられた {記憶|きおく} の {部屋|へや}'), fiction: true,
    jp: '{悲|かな}しみ を {抱|かか}えた {人|ひと} が 、 {自分|じぶん} から {頼|たの}んで {置|お}いて いった {記憶|きおく} の {棚|たな} 。',
    en: '(Fiction.) Shelves of memories that grieving people asked Kasane to keep for them — Kasane\'s first mercy. Some shelves are empty now, and labelled "returned".',
  };
  C.notes.sa_charter = {
    title: T('The founders\' charter', '{書庫|しょこ} の {定|さだ}め'), fiction: true,
    jp: '{当|とう}{書庫|しょこ} は 、 {災|わざわ}い に より {失|うしな}われし {名|な} を {写|うつ}し{置|お}き 、 {求|もと}め {有|あ}らば {必|かなら}ず {返|かえ}す べし 。',
    en: '(Fiction; written in an old formal style.) "This archive shall keep copies of names lost to disaster, and whenever they are asked for, shall without fail return them." It never says what to do when no one asks — an "if" is not an "only if".',
  };

  // ---- travel point below the Archive ------------------------------------------------------------
  C.places.sa_hut = {
    name: T('Last Lamp Hut', '{最後|さいご} の {灯|ひ} の {小屋|こや}'), map: 'sa.camp', x: 13, y: 12, dir: 'up',
    pos: [452, 96], region: 'sa_mount', hub: false, desc: 'A pilgrims\' hut on the road below the Still Archive.',
  };
  if (!C.roads.some((r) => r.indexOf('sa_hut') >= 0)) C.roads.push(['lanternfall', 'sa_hut']);
})(RB.content);

// ---- palettes: the mountain drains of colour; the Archive is paper and stone ----------------------
(function () {
  'use strict';
  if (!RB.tiles || !RB.tiles.PAL) return;
  RB.tiles.PAL.sa_mount = {
    grass: ['#7c8c76', '#889880', '#98a78e', '#687760'], dirt: ['#a59c8c', '#b5ac9c', '#8f8676', '#c6beb0'],
    stone: ['#9c9ca6', '#b4b4be', '#80808c'], water: ['#4a6680', '#587890', '#86a2b8', '#e8f0f6'],
    sand: ['#cfcabc', '#ddd8cc', '#b8b2a4'], wood: ['#6e5a4c', '#846e5e', '#54443a', '#a08a78'],
    leaf: ['#4a6056', '#586e62', '#6e8676', '#3a4c44'], trunk: ['#4e4038', '#3a2e28'],
    flower: ['#ece8dc', '#ccc4dc', '#f6f2ea', '#bcc8dc'], reed: ['#9aa89a', '#b4c0b2', '#7e8c7e'],
    wall: ['#e6e0d2', '#d2cabb', '#b0a898'], floor: ['#8e7a68', '#7a6858', '#665648'], roof: ['#4a4a64', '#3a3a52', '#2a2a3e', '#626282'],
    snow: ['#edf0f4', '#d8dee6', '#bec8d2'], sky: '#e4e6ee', dark: '#181a24',
  };
  RB.tiles.PAL.sa_still = {
    grass: ['#8a8a96', '#9696a2', '#a4a4b0', '#767684'], dirt: ['#b0aa9c', '#c0baac', '#9a9486', '#d0cabe'],
    stone: ['#c6c2ba', '#dad6ce', '#a8a49c'], water: ['#28324e', '#323e5c', '#8a9cc8', '#d0dcf0'],
    sand: ['#d6d0c2', '#e4ded2', '#bcb6a8'], wood: ['#5e5058', '#72626a', '#483c44', '#8c7c84'],
    leaf: ['#5a6a7a', '#6a7a8a', '#8494a4', '#46545e'], trunk: ['#4a3e44', '#342a30'],
    flower: ['#f0ece0', '#b8cce0', '#faf6ee', '#d0c0e4'], reed: ['#8a94a8', '#a4acbe', '#707a90'],
    wall: ['#f0ebe0', '#ddd6c6', '#bdb5a2'], floor: ['#b8b0a0', '#a8a090', '#948c7c'], roof: ['#3a3c54', '#2e3046', '#22243a', '#50527a'],
    snow: ['#eef3f7', '#d6e2ec', '#bccbd8'], sky: '#e8e6ee', dark: '#0e1020',
  };
})();

// ---- procedural art: props, overworld creatures, the Hush itself ------------------------------------
(function () {
  'use strict';
  const P = RB.props && RB.props.P;
  const px = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  if (P) {
    const def = (id, props, draw) => { P[id] = Object.assign({ id, w: 1, h: 1, block: true }, props, { draw }); };
    // Card catalogue: many small drawers; o.blank shows labels wiped by the Hush.
    def('sa_cabinet', { w: 2 }, (c, x, y, p, t, o) => {
      px(c, x + 1, y - 10, 30, 25, p.wood[2]);
      px(c, x + 2, y - 9, 28, 23, p.wood[0]);
      for (let r = 0; r < 4; r++) for (let q = 0; q < 4; q++) {
        const dx = x + 3 + q * 7, dy = y - 8 + r * 5;
        px(c, dx, dy, 6, 4, p.wood[1]);
        px(c, dx + 1, dy + 1, 4, 1, o && o.blank ? '#f4f0e6' : ((r + q) % 3 ? '#e8e0c8' : '#c85a4a'));
        px(c, dx + 2, dy + 3, 2, 1, '#d8c070');
      }
      px(c, x + 1, y + 14, 30, 1, '#00000030');
    });
    // Iron grille that bars a way until something is resolved.
    def('sa_gate', {}, (c, x, y) => {
      px(c, x, y - 6, 16, 2, '#4a4a5a');
      for (let i = 1; i < 16; i += 3) px(c, x + i, y - 5, 2, 20, '#5a5a6e');
      px(c, x, y + 3, 16, 1, '#4a4a5a');
      px(c, x + 6, y + 1, 4, 4, '#c8a050');
    });
    // A heavy bolted door (blocks until opened from the other side).
    def('sa_door', {}, (c, x, y, p) => {
      px(c, x + 1, y - 8, 14, 23, '#2e2a36');
      px(c, x + 2, y - 7, 12, 21, p.wood[0]);
      for (let i = 0; i < 3; i++) px(c, x + 2, y - 4 + i * 6, 12, 1, p.wood[2]);
      px(c, x + 5, y + 2, 6, 2, '#8a8a9a');
      px(c, x + 11, y, 2, 3, '#c8a050');
    });
    // Conduit mouth: faint marks drift out of it (names on their way uphill).
    def('sa_pipe', { light: 16 }, (c, x, y, p, t) => {
      px(c, x + 2, y - 4, 12, 18, '#3a3c52');
      px(c, x + 4, y - 2, 8, 14, '#10121e');
      const k = ((t / 90) | 0) % 14;
      c.fillStyle = 'rgba(232,228,210,0.85)';
      c.fillRect(x + 6, y + 10 - k, 1, 2); c.fillRect(x + 8, y + 12 - ((k + 6) % 14), 2, 1); c.fillRect(x + 9, y + 11 - ((k + 10) % 14), 1, 2);
    });
    // Ushio's lamp on a stand, kept lit for three winters.
    def('sa_lamp', { light: 38 }, (c, x, y, p, t) => {
      px(c, x + 7, y + 2, 2, 12, '#3a3440');
      px(c, x + 4, y + 12, 8, 2, '#3a3440');
      px(c, x + 4, y - 6, 8, 9, '#2a2430');
      const f = 0.8 + Math.sin(t / 240) * 0.15;
      c.fillStyle = `rgba(255,214,130,${f})`; c.fillRect(x + 5, y - 5, 6, 7);
      px(c, x + 5, y - 8, 6, 2, '#d8b060');
    });
    // Archive guardian: a dark stone scribe on a plinth, holding a closed book.
    def('sa_statue', {}, (c, x, y) => {
      px(c, x + 1, y + 9, 14, 6, '#3c3a48');
      px(c, x + 2, y + 9, 12, 1, '#5a5868');
      px(c, x + 4, y - 4, 8, 13, '#56546a');
      px(c, x + 5, y - 9, 6, 5, '#56546a');
      px(c, x + 4, y - 4, 1, 13, '#72708a');
      px(c, x + 6, y + 1, 5, 4, '#8a6a4a');
      px(c, x + 6, y + 1, 5, 1, '#b89a6a');
      px(c, x + 1, y + 14, 14, 1, '#00000040');
    });
    // Ushio's grave: a low weathered slab with a brush-shaped cut and a cup of water.
    def('sa_grave', {}, (c, x, y) => {
      px(c, x + 3, y - 3, 10, 16, '#4a4858');
      px(c, x + 4, y - 5, 8, 2, '#4a4858');
      px(c, x + 3, y - 3, 1, 16, '#66647a');
      px(c, x + 7, y - 1, 2, 7, '#d8d4c8');
      px(c, x + 6, y + 5, 4, 1, '#d8d4c8');
      px(c, x + 12, y + 10, 3, 3, '#8a8aa0');
      px(c, x + 13, y + 10, 1, 1, '#a8d8e8');
      px(c, x + 2, y + 13, 12, 2, '#00000040');
    });
    // The Hush at the Heart: a slow spiral of blank pages around a hollow.
    def('sa_hushcore', { w: 3, h: 3, light: 30 }, (c, x, y, p, t, o) => {
      const cx = x + 24, cy = y + 18;
      const calm = o && o.settled;
      const n = calm ? 10 : 22;
      for (let i = 0; i < n; i++) {
        const a = (calm ? 0 : t / 1400) + i * (Math.PI * 2 / n);
        const r = 10 + (i % 4) * 5 + (calm ? 0 : Math.sin(t / 500 + i) * 2);
        const px0 = cx + Math.cos(a) * r, py0 = cy + Math.sin(a) * r * 0.6 + (calm ? 14 : 0);
        c.fillStyle = i % 3 ? 'rgba(240,236,224,0.9)' : 'rgba(200,196,216,0.9)';
        c.fillRect(Math.round(px0) - 2, Math.round(py0) - 1, 4, 3);
      }
      if (!calm) {
        c.fillStyle = '#0a0a14'; c.beginPath(); c.ellipse(cx, cy, 7, 5, 0, 0, Math.PI * 2); c.fill();
        c.strokeStyle = 'rgba(220,216,240,0.6)'; c.lineWidth = 1; c.beginPath(); c.ellipse(cx, cy, 9, 7, 0, 0, Math.PI * 2); c.stroke();
      }
    });
  }

  const S = RB.sprites && RB.sprites.custom;
  if (S) {
    const R = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
    // Hush wraith: a tall pale veil with a hollow ring for a face.
    S.sa_wraith = (c, look, d, f) => {
      const col = look.col || '#e6e4ee';
      c.fillStyle = col + 'd0';
      c.beginPath(); c.moveTo(3, 23); c.quadraticCurveTo(2, 4, 8, 2); c.quadraticCurveTo(14, 4, 13, 23);
      c.lineTo(11, 21 - (f === 1 ? 1 : 0)); c.lineTo(8, 23); c.lineTo(5, 21 + (f === 1 ? 1 : 0)); c.fill();
      c.strokeStyle = '#1a1830'; c.lineWidth = 1; c.beginPath(); c.arc(8, 8, 2, 0, Math.PI * 2); c.stroke();
      R(c, 5, 13, 6, 1, '#c8c4d8'); R(c, 5, 16, 6, 1, '#c8c4d8');
    };
    // Shelved echo: an open book ringed by its own repeating sound.
    S.sa_echo = (c, look, d, f) => {
      const b = f === 1 ? 1 : 0;
      c.strokeStyle = (look.col || '#a8c8d8') + 'b0'; c.lineWidth = 1;
      c.beginPath(); c.arc(8, 13 - b, 7, 0, Math.PI * 2); c.stroke();
      R(c, 3, 11 - b, 5, 5, '#f0ece0'); R(c, 8, 11 - b, 5, 5, '#e4ded0'); R(c, 8, 11 - b, 1, 5, '#8a7a6a');
      R(c, 4, 13 - b, 3, 1, '#6a6a80'); R(c, 9, 13 - b, 3, 1, '#6a6a80');
    };
    // The catalogue clerk: a figure stacked from index cards, red-thread sash.
    S.sa_clerk = (c, look, d, f) => {
      const col = look.col || '#ece6d6';
      const step = f === 1 ? 1 : f === 2 ? -1 : 0;
      R(c, 4, 20, 3, 3 + (step > 0 ? 0 : 1), '#8a8474'); R(c, 9, 20, 3, 3 + (step < 0 ? 0 : 1), '#8a8474');
      R(c, 3, 10, 10, 11, col); R(c, 3, 13, 10, 1, '#b8b0a0'); R(c, 3, 16, 10, 1, '#b8b0a0');
      R(c, 3, 11, 10, 1, '#c85a4a');
      R(c, 4, 2, 8, 8, '#f4efe2'); R(c, 4, 2, 8, 1, '#c85a4a');
      if (d !== 'up') { R(c, 5, 5, 2, 2, '#2a2436'); if (d === 'down') R(c, 9, 5, 2, 2, '#2a2436'); }
      R(c, 1, 12, 2, 6, col); R(c, 13, 12, 2, 6, col);
    };
  }

  const A = RB.enemyArt && RB.enemyArt.A;
  if (A) {
    // The Hush itself: a hollow ringed by blank pages, shedding the marks it took.
    A.sa_hush = (c, t, o) => {
      const b = Math.sin(t / 900) * 3;
      const g = c.createRadialGradient(0, b, 4, 0, b, 44);
      g.addColorStop(0, 'rgba(10,10,20,1)'); g.addColorStop(0.35, 'rgba(40,40,70,0.8)'); g.addColorStop(1, 'rgba(230,228,240,0)');
      c.fillStyle = g; c.beginPath(); c.arc(0, b, 44, 0, Math.PI * 2); c.fill();
      for (let i = 0; i < 18; i++) {
        const a = t / 2000 * (i % 2 ? 1 : -1) + i * 0.35;
        const r = 20 + (i % 5) * 5;
        const x = Math.cos(a) * r, y = Math.sin(a) * r * 0.7 + b;
        c.save(); c.translate(x, y); c.rotate(a);
        c.fillStyle = i % 4 ? '#eeeae0' : '#cfcadf'; c.fillRect(-4, -3, 8, 6);
        c.fillStyle = '#9a96ac'; c.fillRect(-3, -1, 6, 1);
        c.restore();
      }
      c.strokeStyle = 'rgba(240,236,255,0.8)'; c.lineWidth = 2;
      c.beginPath(); c.arc(0, b, 9 + Math.sin(t / 300) * 1.5, 0, Math.PI * 2); c.stroke();
      c.fillStyle = 'rgba(232,228,210,0.7)';
      for (let i = 0; i < 6; i++) { const k = ((t / 40 + i * 37) % 120) / 120; c.fillRect(Math.sin(i * 2.1) * 30 * (1 - k), -30 - k * 30 + b, 2, 3); }
    };
  }
})();

// ---- hooks ---------------------------------------------------------------------------------------------
(function () {
  'use strict';
  RB.hooks = RB.hooks || {};
  // !hook sa_goto <placeId> — denouement: step onto a hub's arrival tile.
  // Uses whatever the hub's own chapter defines in C.places; stays put if
  // that map is not present in this build.
  RB.hooks.sa_goto = async (args) => {
    const p = RB.content.places[args[0]];
    if (!p || !RB.content.maps[p.map]) return;
    await RB.game.transition(p.map, p.x, p.y, p.dir || 'down', { inScript: true });
  };
  // !hook sa_after <sceneId> — once the current scene has finished and the
  // player is back in the world, run another scene if it exists and has not
  // been seen (used to hand over to the Unwritten Atlas introduction).
  RB.hooks.sa_after = async (args) => {
    const id = args[0];
    if (!id || !RB.content.scenes[id] || (RB.game.s && RB.game.s.seen[id])) return;
    let tries = 0;
    const tick = () => {
      if (!RB.game.s || ++tries > 600) return;
      if (RB.script.isRunning() || RB.game.mode() !== 'world') { setTimeout(tick, 150); return; }
      RB.script.run(id);
    };
    setTimeout(tick, 300);
  };
})();
