/* Unwritten Atlas — data: route modifiers, temporary relics and their
 * combinations, permanent rewards (charm sidegrades, cosmetics), notebook
 * entries, settlement restoration details and atlas encounters.
 * Everything here is plain data; behaviour lives in 30_gen / 40_combat / 50_run. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const A = (C.atlas = C.atlas || {});

  // ---- route modifiers (the player picks one of three offered) ----------------------------
  A.modifiers = {
    mirror: {
      name: { jp: '{鏡|かがみ} の {道|みち}', en: 'The Mirrored Road' },
      tag: { jp: '{部屋|へや} が {左右|さゆう} {逆|ぎゃく} に {描|か}かれて いる 。', en: 'Every room is drawn the wrong way round, left for right.' },
      desc: 'Rooms are mirrored left for right. Written directions still mean exactly what they say, so read them rather than trusting habit.',
      reward: 'atlas_charm_mirror',
    },
    escort: {
      name: { jp: '{灯|あか}り を {守|まも}る {旅|たび}', en: 'The Escorted Lantern' },
      tag: { jp: '{小|ちい}さな {灯|あか}り が {一緒|いっしょ}に {歩|ある}いて くる 。', en: 'A small lantern walks the route with you.' },
      desc: 'A little lantern travels with you (an extra bar, 5 points). Taking hits in battle and wrong turns make it gutter; camps rekindle it. Bring it home lit for a special thanks. If it goes out, the expedition simply carries on without that bonus.',
      reward: 'atlas_cos_lamplet',
    },
    promises: {
      name: { jp: '{約束|やくそく} の {廃墟|はいきょ}', en: 'The Promise-bound Ruin' },
      tag: { jp: '{守|まも}られた {約束|やくそく} で 、 {先|さき} の {部屋|へや} が {変|か}わる 。', en: 'Keeping promises changes the rooms further on.' },
      desc: 'Two broken promises lie along the route. Restoring the first opens a side room at the camp; restoring the second loosens the guardian at the end before you even arrive.',
      reward: 'atlas_charm_reed',
    },
    fog: {
      name: { jp: '{濃|こ}い {霧|きり}', en: 'Heavy Fog' },
      tag: { jp: '{霧|きり} の {中|なか} で 、 {相手|あいて} が {姿|すがた} を {隠|かく}す 。', en: 'Foes hide in the mist.' },
      desc: 'Mist hangs over every room. Foes shroud themselves more often; light or wind clears it.',
      reward: 'atlas_cos_cape',
    },
    echo: {
      name: { jp: 'こだま の {回廊|かいろう}', en: 'Echoing Halls' },
      tag: { jp: '{言葉|ことば} が {少|すこ}し {違|ちが}って {返|かえ}って くる 。', en: 'Words come back slightly wrong.' },
      desc: 'Foes throw your own words back at you, twisted. See through the echo to answer it (and loosen a knot).',
      reward: 'atlas_charm_page',
    },
    lowtide: {
      name: { jp: '{引|ひ}き{潮|しお}', en: 'Low Tide' },
      tag: { jp: '{水|みず} が {引|ひ}いて 、 {隠|かく}れた {道|みち} が {見|み}える 。', en: 'The water has drawn back, uncovering hidden paths.' },
      desc: 'Shallows uncover side paths and extra finds. During fights, the water rushes back in: floods strike you both unless you stand firm.',
      reward: 'atlas_charm_tide',
    },
    crowd: {
      name: { jp: 'さまよう {名前|なまえ}', en: 'Wandering Names' },
      tag: { jp: '{帰|かえ}る {場所|ばしょ} を {探|さが}す {名前|なまえ} が {多|おお}い 。', en: 'Many names are looking for their way home.' },
      desc: 'More unmoored names drift along the route, and fewer foes. A road for listening.',
      reward: 'atlas_cos_flower',
    },
    gusts: {
      name: { jp: '{紙|かみ} {吹雪|ふぶき}', en: 'Paper Squall' },
      tag: { jp: '{紙|かみ} が {舞|ま}い 、 {風|かぜ} が {守|まも}り を {飛|と}ばす 。', en: 'Loose pages whirl; the wind tears wards away.' },
      desc: 'Foes raise gusts that strip your wards. Something heavy — stone — will hold you in place.',
      reward: 'atlas_cos_sash',
    },
  };
  A.modifierOrder = ['mirror', 'escort', 'promises', 'fog', 'echo', 'lowtide', 'crowd', 'gusts'];

  // ---- temporary relics (lost at the end of an expedition) ---------------------------------
  // comp: only matters when that companion travels with you.
  A.relics = {
    thread: { name: { jp: '{丈夫|じょうぶ}な {糸|いと}', en: 'Sturdy Thread' }, desc: 'The first Unravel in each battle frees two knots.' },
    wick: { name: { jp: '{予備|よび} の {芯|しん}', en: 'Spare Wick' }, desc: 'The first time a foe shrouds itself in a battle, the mist burns off at once.' },
    shell: { name: { jp: '{巻|ま}き{貝|がい}', en: 'Spiral Shell' }, desc: 'Hold it to your ear and you hear what was really said: seeing through a lie or an echo frees an extra knot.' },
    weight: { name: { jp: '{重|おも}し{石|いし}', en: 'Pickling Weight' }, desc: 'A pickling stone, absurdly heavy. Floods and gusts hit for 1 less, and gusts no longer tear your wards away.' },
    letters: { name: { jp: '{手紙|てがみ} の {束|たば}', en: 'Bundle of Letters' }, desc: 'Letters written to someone who was waiting. They stand between you and harm: both of you begin each battle behind a ward.' },
    bell: { name: { jp: '{小|ちい}さな {鈴|すず}', en: 'Little Bell' }, desc: 'Each battle begins with one point of harmony already rung.' },
    compass: { name: { jp: '{方位|ほうい}{磁石|じしゃく}', en: 'Compass' }, desc: 'After a wrong door the needle swings to the right one, and signposts at forks say plainly what lies down each road.' },
    teapot: { name: { jp: '{急須|きゅうす}', en: 'Teapot for Two' }, desc: 'After each battle you win, you share a cup with your companion: the escorted lantern (if any) recovers a point.' },
    inkstone: { name: { jp: '{欠|か}けた {硯|すずり}', en: 'Chipped Inkstone' }, desc: 'Every second clean Unravel frees an extra knot — but a slip of the brush costs 2 resolve instead of 1 (never in Assisted mode).' },
    map: { name: { jp: '{地図|ちず} の {切|き}れ{端|はし}', en: 'Scrap of Map' }, desc: 'Shows a corner of the room at the end of the road: the guardian there starts with one knot fewer.' },
    tag_nao: { comp: 'nao', name: { jp: '{消印|けしいん} の {押|お}された {荷札|にふだ}', en: 'Postmarked Parcel Tag' }, desc: 'With Nao: she reads three moves ahead, and once per battle a clean Unravel also sets up her opening.' },
    vial_mio: { comp: 'mio', name: { jp: '{栓|せん} つき の {小瓶|こびん}', en: 'Stoppered Vial' }, desc: 'With Mio: her draught at the end of each exchange restores 2 instead of 1, and cools any heat by one step.' },
    trim_ren: { comp: 'ren', name: { jp: '{芯切|しんき}り', en: 'Wick Trimmers' }, desc: 'With Ren: you both start behind stronger wards (2), and any clean inscription while shrouded lets Ren\'s lamp clear the mist.' },
    mask_suzu: { comp: 'suzu', name: { jp: '{代役|だいやく} の {面|めん}', en: 'Understudy\'s Mask' }, desc: 'With Suzu: she can turn a blow aside twice per battle, and Curtain Call frees three knots.' },
  };
  A.relicOrder = ['thread', 'wick', 'shell', 'weight', 'letters', 'bell', 'compass', 'teapot', 'inkstone', 'map', 'tag_nao', 'vial_mio', 'trim_ren', 'mask_suzu'];

  // Discoverable combinations: holding both relics adds an effect and a notebook entry.
  A.combos = {
    taut: { needs: ['thread', 'inkstone'], name: { jp: '{張|は}り{詰|つ}めた {糸|いと}', en: 'Taut Line' }, desc: 'Thread and inkstone together: the first Unravel in each battle frees three knots.' },
    lamplit: { needs: ['wick', 'shell'], name: { jp: '{灯|あか}り の こだま', en: 'Lamplit Echo' }, desc: 'Wick and shell together: seeing through a lie or an echo also clears any mist.' },
    harbour: { needs: ['weight', 'letters'], name: { jp: '{港|みなと} の {壁|かべ}', en: 'Harbour Wall' }, desc: 'Weight and letters together: any ward stops a flood completely.' },
    duet: { needs: ['bell', '*comp'], name: { jp: '{二重奏|にじゅうそう}', en: 'Duet' }, desc: 'The little bell and your companion\'s own relic together: after a coordinated technique, harmony starts again at one.' },
  };

  // ---- permanent rewards -------------------------------------------------------------------------
  const I = (id, d) => (C.items[id] = Object.assign({ atlas: true }, d));
  // Charm sidegrades: each opens a tactic and costs something else.
  I('atlas_charm_reed', { slot: 'charm', name: { jp: '{葦|あし} の {結|むす}び{目|め}', en: 'Reed Knot (charm)' }, desc: 'Start every battle behind a ward (1). Coordinated techniques need 4 harmony instead of 3.', effect: { atlasCharm: 'reed' } });
  I('atlas_charm_tide', { slot: 'charm', name: { jp: '{潮見|しおみ} の ガラス', en: 'Tide-glass (charm)' }, desc: 'Floods and sweeps hit for 1 less. Wards you raise with a word hold 1 point instead of 2.', effect: { atlasCharm: 'tide' } });
  I('atlas_charm_page', { slot: 'charm', name: { jp: '{白紙|はくし} の {栞|しおり}', en: 'Blank Bookmark (charm)' }, desc: 'Clean Unravels build harmony twice as fast. Answering and seeing through build none.', effect: { atlasCharm: 'page' } });
  I('atlas_charm_mirror', { slot: 'charm', name: { jp: '{鏡|かがみ} の かけら', en: 'Mirror Shard (charm)' }, desc: 'Seeing through a lie or an echo frees a knot as well. Your first Unravel in each battle only finds the thread (it frees nothing).', effect: { atlasCharm: 'mirror' } });
  // Cosmetics (keepsakes shown on your sprite).
  I('atlas_cos_sash', { slot: 'cosmetic', acc: 'atlas_sash', name: { jp: '{地図|ちず} の たすき', en: 'Map-paper Sash' }, desc: 'A sash folded from a map of a road that now exists.' });
  I('atlas_cos_pin', { slot: 'cosmetic', acc: 'atlas_pin', name: { jp: '{方位|ほうい} の ピン', en: 'Compass-rose Pin' }, desc: 'It points north. Mostly.' });
  I('atlas_cos_lamplet', { slot: 'cosmetic', acc: 'atlas_lamplet', name: { jp: '{小|ちい}さな {提灯|ちょうちん}', en: 'Little Lantern' }, desc: 'The lantern you walked home, still lit. It hangs at your hip now.' });
  I('atlas_cos_quill', { slot: 'cosmetic', acc: 'atlas_quill', name: { jp: '{羽|はね}ペン', en: 'Quill' }, desc: 'Worn behind the ear, as cartographers apparently do.' });
  I('atlas_cos_flower', { slot: 'cosmetic', acc: 'flower', wear: { flowerCol: '#9fb6ea' }, name: { jp: '{押|お}し{花|ばな}', en: 'Pressed Road-flower' }, desc: 'A flower that grew on a road that had not been written yet.' });
  I('atlas_cos_cape', { slot: 'cosmetic', acc: 'cape', wear: { capeCol: '#51666e' }, name: { jp: '{旅|たび} の {外套|がいとう}', en: 'Traveller\'s Cape' }, desc: 'Good against fog, and against being asked where you have been.' });
  A.rewardOrder = ['atlas_cos_quill', 'atlas_charm_reed', 'atlas_cos_pin', 'atlas_charm_page', 'atlas_cos_sash', 'atlas_charm_tide', 'atlas_cos_flower', 'atlas_charm_mirror', 'atlas_cos_cape', 'atlas_cos_lamplet'];

  // ---- settlement restoration details (flags atlas_restore_1..6) ----------------------------------------
  // The coordinator adds small conditional decorations to hub maps keyed to these flags.
  A.restorations = [
    { flag: 'atlas_restore_1', place: 'reedwake', jp: '{葦|あし}ノ{瀬|せ} の {渡|わた}し{場|ば} に 、 {新|あたら}しい {看板|かんばん} が {立|た}った そう だ 。', en: 'Word comes that a new signboard stands at the Reedwake ferry landing, its letters freshly painted.' },
    { flag: 'atlas_restore_2', place: 'saltglass', jp: '{潮|しお}{硝子|がらす} の {港|みなと} で 、 {迷子|まいご} の {荷札|にふだ} が {持|も}ち{主|ぬし} の {元|もと} へ {戻|もど}った らしい 。', en: 'In Saltglass harbour, a basket of lost cargo tags has found its owners.' },
    { flag: 'atlas_restore_3', place: 'cinder', jp: '{灰実|はいみ} の {里|さと} の {防火|ぼうか}{帯|たい} に 、 {名前|なまえ} の ついた {苗木|なえぎ} が {植|う}えられた 。', en: 'Along Cinder Orchard\'s firebreak, a row of saplings has been planted, each with a name tag.' },
    { flag: 'atlas_restore_4', place: 'snowbell', jp: '{雪鈴|ゆきすず} の {天文台|てんもんだい} へ の {道|みち} に 、 {道標|みちしるべ} が {戻|もど}った 。', en: 'The waymarkers on the path up to Snowbell\'s observatory are back, one every hundred steps.' },
    { flag: 'atlas_restore_5', place: 'lanternfall', jp: '{灯落|ひおち} の {掲示板|けいじばん} に 、 {反対|はんたい} {意見|いけん} を {書|か}く {欄|らん} が {増|ふ}えた 。', en: 'Lanternfall\'s notice board has grown a new column: a space for writing that you disagree.' },
    { flag: 'atlas_restore_6', place: 'road', jp: '{灯|ひ} の {道|みち} の {灯籠|とうろう} に 、 {新|あたら}しい {名前|なまえ} が {一|ひと}つ {増|ふ}えた 。', en: 'A new lantern stands on the lantern road, with the name of a place that did not exist a year ago.' },
  ];

  // ---- notebook entries ---------------------------------------------------------------------------------
  const N = (id, d) => (C.notes[id] = d);
  N('atlas_about', { fiction: true, title: { jp: '{書|か}かれて いない {道|みち} の {歩|ある}き{方|かた}', en: 'Walking the unwritten roads' },
    jp: '{道|みち} は {歩|ある}く たび に {変|か}わる 。 {野営地|やえいち} で {引|ひ}き{返|かえ}して も いい 。',
    en: 'Each walk on the Unwritten Atlas (a fictional term) is different: a gate to open, a fork to choose, a camp, a guardian at the end and a lantern that takes you home. Before setting out you can pick how the road behaves (fog, low tide, mirrored rooms and so on). Things found on the road help only while you walk it; keepsakes, names you send home and anything the road gives you at the end are yours to keep. At a camp you can head home early. If a fight goes badly the road folds up and sets you down in the Lantern Hall, and nothing you learned is lost.' });
  N('atlas_unmoored', { fiction: true, title: { jp: 'さまよう {名前|なまえ}', en: 'Unmoored names' },
    jp: '{名前|なまえ} は 、 {呼|よ}ぶ {人|ひと} が いる {場所|ばしょ} へ {帰|かえ}る 。',
    en: 'In the fiction of this world, a name that has lost its place drifts until someone understands what it was. Answer one well and it goes back to where it is still wanted.' });
  N('atlas_relics', { fiction: true, title: { jp: '{道|みち} の {落|お}とし{物|もの}', en: 'Things found on the road' },
    jp: '{道|みち} に {落|お}ちて いた {物|もの} は 、 {道|みち} を {出|で}る と {持|も}ち{主|ぬし} の {元|もと} へ {帰|かえ}る 。',
    en: 'Relics found on an unwritten road only stay with you while you walk it. When you come home they go back to whoever lost them — which is fair.' });
  N('atlas_defeat', { fiction: true, title: { jp: '{途中|とちゅう} で {終|お}わった {旅|たび}', en: 'A walk cut short' },
    jp: '{倒|たお}れて も 、 {覚|おぼ}えた {言葉|ことば} は {消|き}えない 。',
    en: 'An unwritten road can fold up under you. When it does, it sets you down at the Lantern Hall. What you learned on it stays with you, and so do the names you sent home.' });
  for (const k in A.combos) N('atlas_combo_' + k, { fiction: true, title: { jp: A.combos[k].name.jp, en: 'Combination: ' + A.combos[k].name.en }, en: A.combos[k].desc });
  A.restorations.forEach((r, i) => N('atlas_news_' + (i + 1), { title: { jp: '{便|たよ}り', en: 'News from the road (' + (i + 1) + ')' }, jp: r.jp, en: r.en }));

  // ---- encounters ---------------------------------------------------------------------------------------
  const E = (id, d) => (C.enemies[id] = Object.assign({ region: 'atlas', bg: 'atlas', atlas: true }, d));
  const POOL = {
    tags: ['atlas_knot'],
    F: ['v:道', 'v:山', 'v:空'],
    E: ['v:道', 'v:名前', 'v:橋', 'v:地図', 'v:約束'],
    I: ['v:目印', 'v:忘れる', 'g:hazu', 'g:cond_tara'],
    A: ['g:adv_ni_suginai', 'g:adv_to_iu_yori', 'g:prt_sae'],
  };
  A.pool = POOL;
  // Authored special intents (text + answer/truth steps per profile) live in 15_lang.js,
  // which attaches them to these enemies.

  E('atlas.stray', { name: { jp: 'さまよう {名|な}', en: 'Stray Name' }, art: 'wisp', artOpts: { col: '#e8dcb0' }, look: { custom: 'wisp', col: '#e8dcb0' }, knots: 2, pool: POOL,
    pattern: ['rest', 'strike', 'plea:1'], intents: {},
    intro: { jp: '{名前|なまえ} の ない {光|ひかり} が 、 {怯|おび}えた よう に {揺|ゆ}れて いる 。', en: 'A light without a name flickers, frightened.' },
    settle: { jp: '{光|ひかり} は {落|お}ち{着|つ}いて 、 {道|みち} の {脇|わき} へ {退|しりぞ}いた 。', en: 'The light calms and drifts to the side of the road.' } });
  E('atlas.moth', { name: { jp: '{余白|よはく} の {蛾|が}', en: 'Margin Moth' }, art: 'moth', artOpts: { col: '#e6dcc4', col2: '#b8ac90' }, look: { custom: 'moth', col: '#e6dcc4' }, knots: 2, pool: POOL,
    pattern: ['shroud', 'strike', 'rest'],
    intro: { jp: '{白|しろ}い {蛾|が} が 、 {紙|かみ} の {端|はし} から {舞|ま}い{上|あ}がった 。', en: 'A white moth flutters up from the edge of the page.' },
    settle: { jp: '{蛾|が} は {余白|よはく} に {戻|もど}って {動|うご}かなく なった 。', en: 'The moth settles back into the margin and is still.' } });
  E('atlas.blot', { name: { jp: 'にじんだ {行|ぎょう}', en: 'Blotted Line' }, art: 'blot', artOpts: { col: '#3a3050' }, look: { custom: 'blot', col: '#3a3050' }, knots: 3, pool: POOL,
    pattern: ['strike', 'mend', 'rest', 'strike'],
    intro: { jp: '{書|か}き{損|そこ}なった {一行|いちぎょう} が 、 {墨|すみ} の {塊|かたまり} に なって {這|は}って くる 。', en: 'A spoiled line of writing has become a lump of ink, crawling towards you.' },
    settle: { jp: '{墨|すみ} が ほどけて 、 {読|よ}める {文字|もじ} に {戻|もど}った 。', en: 'The ink comes loose and turns back into letters you can read.' } });
  E('atlas.crane', { name: { jp: 'ほどけた {折|お}り{鶴|づる}', en: 'Unfolded Crane' }, art: 'crane', artOpts: { col: '#f2ead6' }, look: { custom: 'crane', col: '#f2ead6' }, knots: 2, pool: POOL,
    pattern: ['gust', 'rest', 'sweep'],
    intro: { jp: '{半分|はんぶん} ほどけた {折|お}り{鶴|づる} が 、 {羽|はね} を {広|ひろ}げた 。', en: 'A half-unfolded paper crane spreads its wings.' },
    settle: { jp: '{鶴|つる} は きちんと {折|お}り{直|なお}されて 、 {地面|じめん} に {降|お}りた 。', en: 'The crane folds itself neatly back together and lands.' } });
  E('atlas.milestone', { name: { jp: '{苔|こけ}むした {道標|みちしるべ}', en: 'Mossy Milestone' }, art: 'golem', artOpts: { col: '#9a9a7a', core: '#c8b070' }, look: { custom: 'golem', col: '#9a9a7a' }, knots: 3, pool: POOL,
    pattern: ['charge', 'strike', 'rest', 'rest'],
    intro: { jp: '{距離|きょり} の {消|き}えた {道標|みちしるべ} が 、 {重|おも}そう に {起|お}き{上|あ}がる 。', en: 'A milestone whose distances have worn away heaves itself upright.' },
    settle: { jp: '{道標|みちしるべ} は {元|もと} の {場所|ばしょ} に {座|すわ}り{込|こ}んだ 。', en: 'The milestone sits back down where it belongs.' } });
  E('atlas.lamp', { name: { jp: '{消|き}えかけ の {灯籠|とうろう}', en: 'Guttering Lantern' }, art: 'lantern', artOpts: { col: '#e8a060' }, look: { custom: 'lanternghost' }, knots: 2, pool: POOL,
    pattern: ['heat', 'strike', 'rest'],
    intro: { jp: '{名前|なまえ} の ない {灯籠|とうろう} が 、 {熱|ねつ} を {持|も}って {揺|ゆ}れる 。', en: 'A lantern with no name sways, running hot.' },
    settle: { jp: '{灯|ひ} は {穏|おだ}やか に なり 、 {道|みち} を {照|て}らし{始|はじ}めた 。', en: 'The flame steadies and starts to light the road.' } });
  E('atlas.echo', { name: { jp: '{道|みち} の こだま', en: 'Road Echo' }, art: 'echo', artOpts: { col: '#c8c0a8' }, look: { custom: 'spirit', col: '#d8d0bc' }, knots: 2, pool: POOL,
    pattern: ['mirror:1', 'rest', 'strike'], intents: {},
    intro: { jp: 'あなた たち の {声|こえ} が 、 {少|すこ}し {遅|おく}れて {返|かえ}って くる 。', en: 'Your own voices come back to you, a moment late.' },
    settle: { jp: 'こだま は {静|しず}か に なった 。', en: 'The echo falls quiet.' } });
  E('atlas.toll', { name: { jp: '{偽|にせ} の {番人|ばんにん}', en: 'False Gatekeeper' }, art: 'clerk', artOpts: { col: '#6a5a4a' }, look: { custom: 'atlas_gate', col: '#7a6a58' }, knots: 3, pool: POOL,
    pattern: ['lie:1', 'strike', 'rest', 'charge'], intents: {},
    intro: { jp: '{誰|だれ} も {頼|たの}んで いない {番人|ばんにん} が 、 {道|みち} を ふさいで いる 。', en: 'A gatekeeper nobody appointed is blocking the road.' },
    settle: { jp: '{番人|ばんにん} は {帽子|ぼうし} を {脱|ぬ}いで 、 {道|みち} を {空|あ}けた 。', en: 'The gatekeeper takes off its cap and steps aside.' } });
  E('atlas.crab', { name: { jp: '{潮|しお}だまり の {蟹|かに}', en: 'Rock-pool Crab' }, art: 'crab', artOpts: { col: '#b89070' }, look: { custom: 'atlas_crab', col: '#b89070' }, knots: 2, pool: POOL,
    pattern: ['flood', 'rest', 'strike', 'rest'],
    intro: { jp: '{潮|しお}だまり から 、 {蟹|かに} が {横|よこ} {向|む}き に {出|で}て きた 。', en: 'A crab sidles out of a rock pool.' },
    settle: { jp: '{蟹|かに} は {潮|しお}だまり に {戻|もど}って いった 。', en: 'The crab goes back to its rock pool.' } });
  E('atlas.fox', { name: { jp: '{名|な} を {借|か}りた {狐|きつね}', en: 'Name-borrowing Fox' }, art: 'fox', artOpts: { col: '#e8d0a0' }, look: { custom: 'spirit', col: '#e8d0a0' }, knots: 2, pool: POOL,
    pattern: ['lie:1', 'rest', 'sweep'], intents: {},
    intro: { jp: '{誰|だれ}か の {名前|なまえ} を {首|くび} に {巻|ま}いた {狐|きつね} が 、 にやり と {笑|わら}った 。', en: 'A fox wearing someone else\'s name like a scarf grins at you.' },
    settle: { jp: '{狐|きつね} は {名前|なまえ} を {置|お}いて 、 {草|くさ} の {中|なか} へ {消|き}えた 。', en: 'The fox leaves the name behind and vanishes into the grass.' } });
  // Combination encounters (unlocked after completed expeditions).
  E('atlas.mothlamp', { name: { jp: '{蛾|が} と {灯籠|とうろう}', en: 'Moth and Lantern' }, art: 'lantern', artOpts: { col: '#d8c0a0' }, look: { custom: 'lanternghost' }, knots: 3, pool: POOL,
    pattern: ['shroud', 'heat', 'strike', 'rest'],
    intro: { jp: '{灯籠|とうろう} の {周|まわ}り を 、 {白|しろ}い {蛾|が} が {回|まわ}って いる 。', en: 'White moths circle a lantern — and the lantern circles back.' },
    settle: { jp: '{蛾|が} は {散|ち}り 、 {灯|ひ} は {静|しず}か に なった 。', en: 'The moths scatter and the flame goes quiet.' } });
  E('atlas.echotoll', { name: { jp: 'こだま の {番人|ばんにん}', en: 'Echoing Gatekeeper' }, art: 'clerk', artOpts: { col: '#5a6a7a' }, look: { custom: 'atlas_gate', col: '#6a7a8a' }, knots: 3, pool: POOL,
    pattern: ['mirror:1', 'rest', 'lie:1', 'strike'], intents: {},
    intro: { jp: '{番人|ばんにん} の {声|こえ} が 、 {二重|にじゅう} に {聞|き}こえる 。', en: 'The gatekeeper\'s voice comes twice, and not quite the same both times.' },
    settle: { jp: '{二|ふた}つ の {声|こえ} が {一|ひと}つ に なって 、 {消|き}えた 。', en: 'The two voices become one, and fade.' } });
  // Guardians at the end of the road (climax).
  E('atlas.cartographer', { boss: true, name: { jp: '{白紙|はくし} の {地図師|ちずし}', en: 'The Blank Cartographer' }, art: 'atlas_cartographer', look: { custom: 'atlas_cartographer' }, knots: 5, music: 'boss', pool: POOL,
    pattern: ['rest', 'strike', 'plea:1', 'sweep'], intents: {},
    phases: [
      { at: 3, pattern: ['shroud', 'strike', 'plea:1', 'rest'], line: { jp: '{見|み}えない {所|ところ} は 、 {見|み}えない まま に して おこう 。', en: '"What cannot be seen can stay unseen."' }, who: 'narr', teach: { en: 'The Cartographer draws mist over itself. Light or wind clears it; if you know neither, you can still feel for the knots.' } },
      { at: 1, pattern: ['plea:1', 'rest', 'strike'], line: { jp: '…… {本当|ほんとう} に 、 {全部|ぜんぶ} {残|のこ}す の か 。', en: '"…You would truly keep all of them?"' }, who: 'narr' },
    ],
    intro: { jp: '{地図師|ちずし} は {白紙|はくし} の {地図|ちず} を {広|ひろ}げ 、 {道|みち} を {一|ひと}つ ずつ {消|け}して いく 。', en: 'The Cartographer unrolls a blank map and erases the roads on it, one by one.' },
    settle: { jp: '{地図師|ちずし} は {筆|ふで} を {置|お}いた 。 {白紙|はくし} の {上|うえ} に 、 {細|ほそ}い {道|みち} が {一本|いっぽん} {残|のこ}って いる 。', en: 'The Cartographer lays down its brush. On the blank sheet, one thin road remains.' } });
  E('atlas.bell', { boss: true, name: { jp: '{借|か}り{物|もの} の {鐘|かね}', en: 'The Borrowed Bell' }, art: 'bell', artOpts: { col: '#7a8a6a' }, look: { custom: 'atlas_bell', col: '#7a8a6a' }, knots: 5, music: 'boss', pool: POOL,
    pattern: ['lie:1', 'strike', 'rest', 'sweep'], intents: {},
    phases: [
      { at: 3, pattern: ['charge', 'strike', 'lie:1', 'rest'], line: { jp: 'ゴーン …… 。 {鐘|かね} の {音|おと} が {重|おも}く なる 。', en: 'Bong… The bell\'s voice grows heavier.' }, who: 'narr', teach: { en: 'It is gathering itself for a heavy stroke. Rope holds it; failing that, keep unravelling — the heavy blow only lands once.' } },
    ],
    intro: { jp: '{緑青|ろくしょう} の {浮|う}いた {鐘|かね} が 、 {知|し}らない {名前|なまえ} を {鳴|な}らして いる 。', en: 'A bell green with verdigris is ringing out a name that is not its own.' },
    settle: { jp: '{最後|さいご} の {音|おと} は 、 {確|たし}か に {鐘|かね} {自身|じしん} の {名前|なまえ} だった 。', en: 'Its last note is, unmistakably, its own name.' } });
  E('atlas.gate', { boss: true, name: { jp: '{半道|はんみち} の {関守|せきもり}', en: 'The Half-road Gatekeeper' }, art: 'golem', artOpts: { col: '#8a8a78', core: '#e8c070' }, look: { custom: 'atlas_gate', col: '#8a8a78' }, knots: 5, music: 'boss', pool: POOL,
    pattern: ['charge', 'strike', 'plea:1', 'rest'], intents: {},
    phases: [
      { at: 2, pattern: ['mend', 'rest', 'plea:1', 'strike'], line: { jp: '{崩|くず}れた {石|いし} を 、 {関守|せきもり} が {積|つ}み{直|なお}そう と する 。', en: 'The Gatekeeper tries to stack its fallen stones back up.' }, who: 'narr', teach: { en: 'It is re-tying knots now. Rope or light stops that; otherwise it only undoes one knot at a time, and you undo them faster.' } },
    ],
    intro: { jp: '{半分|はんぶん} だけ {作|つく}られた {道|みち} の {端|はし} で 、 {石|いし} の {関守|せきもり} が {立|た}ち{上|あ}がった 。', en: 'At the end of a road built only halfway, a stone gatekeeper stands up.' },
    settle: { jp: '{関守|せきもり} は {道|みち} の {脇|わき} に {腰|こし} を {下|お}ろした 。 {続|つづ}き を {作|つく}る {人|ひと} を 、 {今度|こんど} は {待|ま}つ つもり らしい 。', en: 'The Gatekeeper sits down by the road. This time, it seems, it means to wait for whoever builds the rest.' } });

  A.regular = ['atlas.stray', 'atlas.moth', 'atlas.blot', 'atlas.crane', 'atlas.milestone', 'atlas.lamp', 'atlas.echo', 'atlas.toll', 'atlas.crab', 'atlas.fox'];
  A.combosFoes = ['atlas.mothlamp', 'atlas.echotoll'];
  A.climaxes = {
    cartographer: { enemy: 'atlas.cartographer', legend: 'cartographer', name: { jp: '{白紙|はくし} の {地図師|ちずし}', en: 'The Blank Cartographer' } },
    bell: { enemy: 'atlas.bell', legend: 'bell', name: { jp: '{借|か}り{物|もの} の {鐘|かね}', en: 'The Borrowed Bell' } },
    gate: { enemy: 'atlas.gate', legend: 'gate', name: { jp: '{半道|はんみち} の {関守|せきもり}', en: 'The Half-road Gatekeeper' } },
  };
})(RB.content);
