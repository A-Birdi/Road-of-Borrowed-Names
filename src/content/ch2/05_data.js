/* Chapter 2 — Saltglass (潮硝子): characters, items, quests, notebook
 * entries and the hub's fast-travel place. Story bible: docs/STORY.md. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const ch = (id, d) => (C.chars[id] = d);

  // ---- people of Saltglass ------------------------------------------------------
  // Harbourmaster: brisk, weathered, fair. Navy coat, old scar, a hat she never takes off.
  ch('omi', {
    name: { en: 'Harbourmaster Ōmi', jp: 'オウミ' }, voice: { pitch: 0.85 },
    look: { skin: 3, hair: 'bun', hairColor: 5, cloth: ['#2e3e5e', '#223048', '#c8a050'], pants: '#2a2a34', shape: 'coat', acc: ['hat'], hatCol: '#23283a' },
    portrait: { eyes: 'sharp', style: 'bun', acc: ['hat'], hatCol: '#23283a', collar: 'high', scar: true, bg: '#23304a' },
  });
  // Clerk: ink-stained cuffs, glasses, a ledger always under one arm.
  ch('wataru', {
    name: { en: 'Wataru', jp: 'ワタル' }, voice: { pitch: 1.0 },
    look: { skin: 1, hair: 'short', hairColor: 0, cloth: ['#6a6a5e', '#52524a', '#d8d0c0'], pants: '#3a3a40', shape: 'tunic', acc: ['glasses', 'book'] },
    portrait: { eyes: 'soft', style: 'short', parted: true, acc: ['glasses', 'pencil'], browY: 1, bg: '#2e2e36' },
  });
  // Innkeeper and cook of the Gull: a red headscarf and a voice that carries over a lunch rush.
  ch('tamae', {
    name: { en: 'Tamae', jp: 'タマエ' }, voice: { pitch: 1.05 },
    look: { skin: 2, hair: 'wrap', wrapCol: '#c8503a', hairColor: 1, cloth: ['#c86a3a', '#a85430', '#f0e0c0'], shape: 'apron', acc: [] },
    portrait: { eyes: 'round', style: 'wrap', wrapCol: '#c8503a', collar: 'apron', blush: true, bg: '#3a2a22' },
  });
  // Ferryman: says little, reads the water better than the board.
  ch('tetsu', {
    name: { en: 'Tetsu', jp: 'テツ' }, voice: { pitch: 0.75 },
    look: { skin: 4, hair: 'shaved', hairColor: 5, cloth: ['#4a5a6a', '#384654', '#a89070'], shape: 'coat', acc: ['beard', 'hat'], hatCol: '#8a7a5a', age: 'old' },
    portrait: { eyes: 'narrow', style: 'shaved', beard: '#a8a8ae', acc: ['hat'], hatCol: '#8a7a5a', age: 'old', bg: '#26303a' },
  });
  // Tide-keeper: long braid, a tide book, speaks as precisely as she writes.
  ch('shiori', {
    name: { en: 'Shiori', jp: 'シオリ' }, voice: { pitch: 1.1 },
    look: { skin: 1, hair: 'braid', hairColor: 7, cloth: ['#5a7a8a', '#46606e', '#e8d8b0'], shape: 'robe', acc: ['book'] },
    portrait: { eyes: 'soft', style: 'braid', collar: 'high', iris: '#2a4a5a', bg: '#22303a' },
  });
  // Lighthouse keeper: yellow oilskin, sou'wester, white beard, bad knees, good eyes (he says).
  ch('genzo', {
    name: { en: 'Genzō', jp: 'ゲンゾウ' }, voice: { pitch: 0.7 },
    look: { skin: 3, hair: 'short', hairColor: 6, cloth: ['#c8a040', '#a8862e', '#4a3a2a'], shape: 'coat', acc: ['beard', 'hat'], hatCol: '#c8a040', age: 'old' },
    portrait: { eyes: 'narrow', style: 'short', beard: '#e4e0dc', acc: ['hat'], hatCol: '#c8a040', age: 'old', bg: '#2a2e3a' },
  });
  // Glassblower: goggles pushed up, burn-scarred forearms, talks while she works.
  ch('asahi', {
    name: { en: 'Asahi', jp: 'アサヒ' }, voice: { pitch: 1.15 },
    look: { skin: 2, hair: 'short', hairColor: 3, cloth: ['#8a5a3a', '#6e4630', '#e8c070'], shape: 'apron', acc: ['headband'], bandCol: '#e8e0cc' },
    portrait: { eyes: 'round', style: 'short', acc: ['goggles'], collar: 'apron', bg: '#3a2a1e' },
  });
  // Fishmonger, Sōta's mother. Blue headscarf, a mole, prices shouted in a sing-song.
  ch('kiyo', {
    name: { en: 'Kiyo', jp: 'キヨ' }, voice: { pitch: 1.0 },
    look: { skin: 3, hair: 'wrap', wrapCol: '#4a6a9a', hairColor: 2, cloth: ['#4a6a8a', '#38526a', '#e8e0cc'], shape: 'apron', acc: [] },
    portrait: { eyes: 'sharp', style: 'wrap', wrapCol: '#4a6a9a', mole: true, collar: 'apron', bg: '#243040' },
  });
  // Fisher: cheerful, sunburnt, worried about his nets.
  ch('sota', {
    name: { en: 'Sōta', jp: 'ソウタ' }, voice: { pitch: 0.95 },
    look: { skin: 4, hair: 'spiky', hairColor: 0, cloth: ['#3e5e4e', '#2e4a3c', '#d8c090'], shape: 'tunic', acc: ['headband'], bandCol: '#e8e0cc' },
    portrait: { eyes: 'round', style: 'spiky', acc: ['headband'], bandCol: '#e8e0cc', bg: '#233a30' },
  });
  // Widow on the hill. Cane, lavender robe, hums while she waits.
  ch('fuku', {
    name: { en: 'Fuku', jp: 'フク' }, voice: { pitch: 1.0 },
    look: { skin: 1, hair: 'bun', hairColor: 6, cloth: ['#6a5a7a', '#54466a', '#c8b8a0'], shape: 'robe', acc: ['cane'], age: 'old' },
    portrait: { eyes: 'soft', style: 'bun', age: 'old', collar: 'high', bg: '#2e2838' },
  });
  // Dock porter: huge, loud, sees everything from the water side.
  ch('daigo', {
    name: { en: 'Daigo', jp: 'ダイゴ' }, voice: { pitch: 0.7 },
    look: { skin: 5, hair: 'shaved', hairColor: 0, cloth: ['#8a4a3a', '#6e3a2e', '#d8c8a0'], shape: 'tunic', acc: ['headband'], bandCol: '#2a2a2a' },
    portrait: { eyes: 'round', style: 'shaved', beard: '#2a2224', acc: ['headband'], bandCol: '#2a2a2a', bg: '#3a2620' },
  });
  // Harbour kid: collects sea glass, gives directions with great confidence.
  ch('tobi', {
    name: { en: 'Tobi', jp: 'トビ' }, voice: { pitch: 1.3 },
    look: { skin: 2, hair: 'curly', hairColor: 1, cloth: ['#d8a040', '#b8862e', '#4a6a8a'], shape: 'tunic', acc: [], size: 'child' },
    portrait: { eyes: 'round', style: 'curly', blush: true, bg: '#3a3220' },
  });
  // Genzō's daughter; arrives on the ferry late in the chapter.
  ch('nagisa', {
    name: { en: 'Nagisa', jp: 'ナギサ' }, voice: { pitch: 1.05 },
    look: { skin: 3, hair: 'long', hairColor: 0, cloth: ['#7a8a6a', '#5e6e52', '#e8c8a0'], shape: 'dress', acc: ['satchel'] },
    portrait: { eyes: 'sharp', style: 'long', acc: ['satchel', 'earrings'], bg: '#2a3228' },
  });
  // The Tide Clerk (speaker in the Drowned Archive).
  ch('sg_clerk', {
    name: { en: 'The Tide Clerk', jp: '{潮|しお}の{書記|しょき}' }, voice: { pitch: 0.6 },
    look: { custom: 'sg_clerk' },
    portrait: { skin: ['#b8c8d0', '#98a8b4'], hair: ['#1e2a3a', '#2a3a4c', '#3a4a5e'], cloth: ['#4a6a8a', '#3a5470', '#e8e0cc'], style: 'short', eyes: 'narrow', iris: '#7ab0d0', acc: ['hood', 'glasses'], hoodCol: '#3a5470', glassCol: '#c8b060', collar: 'high', bg: '#141a30' },
  });

  // ---- items --------------------------------------------------------------------------
  const it = (id, d) => (C.items[id] = d);
  it('sg_rope', { name: { jp: '{縄|なわ}', en: 'Coil of rope' }, key: true, desc: 'Tetsu\'s spare rope. "Nobody sensible goes near the water without one."' });
  it('sg_postbag', { name: { jp: '{郵便|ゆうびん}{袋|ぶくろ}', en: 'Post bag' }, key: true, desc: 'The Gull\'s bag of storm-soaked letters. Half the addresses have run.' });
  it('sg_notice', { name: { jp: '{督促状|とくそくじょう}', en: 'Final notice' }, key: true, desc: 'A letter to Wataru from a lender in Lanternfall. Its address is perfectly clear.' });
  it('sg_labelbook', { name: { jp: 'ワタル の {手帳|てちょう}', en: 'Wataru\'s notebook' }, key: true, desc: 'Every label in the harbour that changed by itself, copied out in a small, careful hand.' });
  it('sg_seaglass', { name: { jp: '{青|あお}い {海|うみ}ガラス', en: 'Blue sea glass' }, desc: 'Frosted smooth by the sea. Asahi needs three pieces.' });
  it('sg_registry', { name: { jp: '{船|ふね}の {登録|とうろく}カード', en: 'Ship registry card' }, key: true, desc: 'Found in the Drowned Archive, stamped "returned". It names a boat and its owner.' });
  it('sg_nets', { name: { jp: 'ソウタ の {網|あみ}', en: 'Sōta\'s nets' }, key: true, desc: 'Heavy, tangled and smelling of the cove.' });
  it('sg_plate', { name: { jp: '{海|うみ}ガラス の {名札|なふだ}', en: 'Sea-glass nameplate' }, key: true, desc: 'Asahi\'s work: a boat\'s name set in blue glass.' });
  it('sg_stamp', { name: { jp: '{割|わ}れた {判子|はんこ}', en: 'Broken stamp' }, key: true, desc: 'The Tide Clerk\'s "returned to sender" stamp, split in two.' });
  it('sg_float_charm', { name: { jp: 'ガラス の {浮|う}き{玉|だま}', en: 'Glass float charm' }, slot: 'charm', effect: { startWard: 1 }, desc: 'A fishing float the size of a plum, from Kiyo and Sōta. Charm: each encounter begins with a small ward before both of you.' });
  it('sg_lens_charm', { name: { jp: 'レンズ の かけら', en: 'Lens chip' }, slot: 'charm', effect: { harmonyStart: 1 }, desc: 'A chip of the old lighthouse lens, from Genzō. Charm: encounters begin with a little harmony already built.' });
  it('sg_glass_earrings', { name: { jp: '{海|うみ}ガラス の {耳飾|みみかざ}り', en: 'Sea-glass earrings' }, slot: 'cosmetic', acc: 'earrings', desc: 'Asahi\'s thank-you: two drops of frosted blue glass.' });

  // ---- quests ------------------------------------------------------------------------------
  C.quests.sg_main = {
    main: true, chapter: 2,
    title: { jp: '{食|く}い{違|ちが}う ラベル', en: 'Labels That Disagree' },
    stages: [
      { jp: '{港|みなと}の {事務所|じむしょ}で {港長|こうちょう}に {会|あ}おう 。', en: 'Find the harbourmaster at the harbour office on the main street.' },
      { jp: '{三|みっ}つ の {食|く}い{違|ちが}い を {調|しら}べよう ： {二番|にばん}{倉庫|そうこ} 、 かもめ{亭|てい} の {郵便|ゆうびん} 、 {渡|わた}し{場|ば} の {時刻表|じこくひょう} 。', en: 'Look into the three contradictions: the crates in No. 2 warehouse, the post at the Gull inn, and the ferry board at the landing.' },
      { jp: '{港長|こうちょう}に {報告|ほうこく} しよう 。', en: 'Report to Harbourmaster Ōmi at the office.' },
      { jp: '{誰|だれ}か が {手|て}で ラベル を {貼|は}り{替|か}えた 。 ガラス{工房|こうぼう} 、 {灯台|とうだい} 、 {魚市場|うおいちば}で {話|はなし}を {聞|き}こう 。', en: 'Someone re-labelled crates by hand. Ask at the glassworks, the lighthouse and the fish market about deliveries that went wrong.' },
      { jp: '{二番|にばん}{倉庫|そうこ}の ワタル と {話|はな}そう 。', en: 'Talk to Wataru at No. 2 warehouse about what you found.' },
      { jp: '{潮見|しおみ}{小屋|ごや}の シオリ に 、 {岬|みさき}の {道|みち}が いつ {開|ひら}く か {聞|き}こう 。', en: 'Ask Shiori at the tide-watch hut on the point when the causeway opens.' },
      { jp: '{風|かぜ}の ない {霧|きり}が {道|みち}を {隠|かく}して いる 。 {灯台|とうだい}の ゲンゾウ に {相談|そうだん} しよう 。', en: 'A windless fog hides the causeway. Ask Genzō at the lighthouse about the wind.' },
      { jp: '{引|ひ}き{潮|しお}の {道|みち}を {渡|わた}って 、 {沈|しず}んだ {書庫|しょこ}へ {入|はい}ろう 。', en: 'Cross the causeway south of the point and enter the Drowned Archive.' },
      { jp: '「{返送|へんそう}」された {名前|なまえ}が どこ へ {行|い}く の か {突|つ}き{止|と}めよう 。', en: 'Find out where the "returned" names are taken — go deeper into the archive.' },
      { jp: '{潮硝子|しおがらす}に {戻|もど}って 、 オウミ に {伝|つた}えよう 。', en: 'Return to Saltglass and tell Ōmi what you found.' },
    ],
    reward: { items: { sg_stamp: 1 } },
  };
  C.quests.sg_lighthouse = {
    chapter: 2,
    title: { jp: '{塩|しお}に {滲|にじ}んだ {手紙|てがみ}', en: 'The Salt-Stained Letter' },
    stages: [
      { jp: 'ゲンゾウ は {娘|むすめ}の {手紙|てがみ}を {読|よ}み{違|ちが}えて いる かも しれない 。 {灯台|とうだい}の {机|つくえ}の {手紙|てがみ}を よく {見|み}よう 。', en: 'Genzō may have misread his daughter\'s letter. Take a closer look at it on the lighthouse table.' },
      { jp: '{手紙|てがみ}が {本当|ほんとう}に {言|い}って いる こと を ゲンゾウ に {伝|つた}えよう 。', en: 'Tell Genzō what the letter actually says.' },
      { jp: '{渡|わた}し{船|ぶね}が {着|つ}いたら 、 {渡|わた}し{場|ば}へ {行|い}って みよう 。', en: 'When the ferry is running again, see who comes in at the landing.' },
    ],
    reward: { items: { sg_lens_charm: 1 } },
  };
  C.quests.sg_cove = {
    chapter: 2,
    title: { jp: '{入|い}り{江|え}への {道|みち}', en: 'The Way to the Cove' },
    stages: [
      { jp: 'ソウタ の {網|あみ}は {入|い}り{江|え}に ある 。 {港|みなと}の {人|ひと}に {道|みち}を {聞|き}こう 。', en: 'Sōta\'s nets are at the fishers\' cove. Ask people around the harbour for directions.' },
      { jp: '{東|ひがし}の {崖|がけ}の {道|みち}の {道標|みちしるべ}を {直|なお}そう 。', en: 'Put the signpost right at the east end of the main street, where the cliff path begins.' },
      { jp: '{入|い}り{江|え}で ソウタ の {網|あみ}を {探|さが}そう 。', en: 'Find Sōta\'s nets in the cove.' },
      { jp: '{網|あみ}を ソウタ に {届|とど}けよう 。', en: 'Bring the nets back to Sōta on the fishing pier.' },
    ],
    reward: { items: { sg_float_charm: 1 } },
  };
  C.quests.sg_seaglass = {
    chapter: 2,
    title: { jp: '{海|うみ}ガラス の {名札|なふだ}', en: 'A Nameplate of Sea Glass' },
    stages: [
      { jp: '{浜|はま}で {青|あお}い {海|うみ}ガラス を {三|みっ}つ {集|あつ}めて 、 アサヒ に {渡|わた}そう 。', en: 'Collect three pieces of blue sea glass on the shore (the beach, the cove) and bring them to Asahi.' },
      { jp: 'フク の {夫|おっと}の {船|ふね}の {名前|なまえ}を {誰|だれ}も {思|おも}い{出|だ}せない 。 どこ か に {記録|きろく}は ない だろう か 。', en: 'Nobody can remember the name of Fuku\'s husband\'s boat. Is there a record of it somewhere — perhaps where names have been "returned"?' },
      { jp: '{船|ふね}の {名前|なまえ}を アサヒ に {伝|つた}えよう 。', en: 'Take the boat\'s name to Asahi at the glassworks.' },
      { jp: 'できあがった {名札|なふだ}を フク に {届|とど}けよう 。', en: 'Give the finished nameplate to Fuku at her house on the hill.' },
    ],
    reward: { items: { sg_glass_earrings: 1 } },
  };

  // ---- notebook ------------------------------------------------------------------------------
  const note = (id, d) => (C.notes[id] = d);
  note('sg_hush_labels', {
    title: { jp: '{書|か}き{換|か}わる ラベル', en: 'Labels that rewrite themselves' }, fiction: true,
    jp: '{嵐|あらし}の {後|あと} 、 {潮硝子|しおがらす}の ラベル は {勝手|かって}に {白|しろ}く なったり 、 {別|べつ}の {字|じ}に {変|か}わったり する 。',
    en: 'Since the storm, labels in Saltglass fade to blank or change their words by themselves. The Hush (fiction) does this; a hand-glued label is something else.',
  });
  note('sg_three_kinds', {
    title: { jp: '{三|みっ}つ の {食|く}い{違|ちが}い', en: 'Three kinds of contradiction' },
    jp: '{静寂|しじま}の しわざ 、 {人|ひと}の {嘘|うそ} 、 そして ただ の {勘違|かんちが}い 。',
    en: 'In Saltglass you met all three: the Hush rewriting labels, a clerk\'s deliberate lie, and two honest people giving opposite directions because they were facing opposite ways.',
  });
  note('sg_tide_words', {
    title: { jp: '{潮|しお}の {言葉|ことば}', en: 'Words for the tide' },
    jp: '{満潮|まんちょう} ・ {満|み}ち{潮|しお} ＝ {潮|しお}が いちばん {高|たか}い とき 。 {干潮|かんちょう} ・ {引|ひ}き{潮|しお} ＝ いちばん {低|ひく}い とき 。',
    en: 'High tide: 満潮 (manchō) or 満ち潮 (michishio). Low tide: 干潮 (kanchō) or 引き潮 (hikishio). On a tide table you will usually see the kanchō/manchō forms with times.',
  });
  note('sg_gojuon', {
    title: { jp: '{五十音|ごじゅうおん}{順|じゅん}', en: 'Gojūon order' },
    jp: 'あ い う え お 、 か き く け こ …… {日本語|にほんご}の {辞書|じしょ}や {名簿|めいぼ}は この {順|じゅん}に {並|なら}ぶ 。',
    en: 'Japanese dictionaries, catalogues and name lists are sorted in gojūon order: by vowel within each consonant row (a i u e o), rows in the order a, ka, sa, ta, na, ha, ma, ya, ra, wa. This is a real convention, not archive magic.',
  });
  note('sg_nakute', {
    title: { jp: '「〜なくて いい 」と 「〜ないで 」', en: '"You needn\'t…" vs "Don\'t…"' },
    jp: '{来|こ}なくて いい ＝ {来|く}る {必要|ひつよう}は ない 。 {来|こ}ないで ＝ {来|く}る な 。',
    en: '〜なくていい means "you don\'t have to" — it removes an obligation. 〜ないで (ください) asks someone not to do it. Genzō read the first as the second.',
  });
  note('sg_passive', {
    title: { jp: '{誰|だれ}が した の か {言|い}わない {受身|うけみ}', en: 'A passive that hides the doer' },
    jp: 'ラベル が {貼|は}り{替|か}えられて いた 。',
    en: 'Japanese often leaves out who did something, and the passive (〜られる) makes that easy: "the labels had been changed" says nothing about by whom. It is ordinary grammar — but a careful listener notices when someone who knows the answer keeps using it.',
  });
  note('sg_drowned_archive', {
    title: { jp: '{沈|しず}んだ {書庫|しょこ}', en: 'The Drowned Archive' }, fiction: true,
    jp: '{岬|みさき}の {沖|おき}の {小島|こじま}に あった {書庫|しょこ}の {分室|ぶんしつ} 。 {八十年|はちじゅうねん}{前|まえ}の {高潮|たかしお}で {沈|しず}んだ 。',
    en: 'A branch of a great archive, built on the tidal island off the point to keep copies of the harbour\'s records. It flooded in a storm surge eighty years ago and was abandoned — but not, it turns out, emptied.',
  });
  note('sg_still_archive', {
    title: { jp: '{静寂|しじま}の {書庫|しょこ}', en: 'The Still Archive' }, fiction: true,
    jp: '{名|な}と {約束|やくそく}の {写|うつ}し を {預|あず}かる {山|やま}の {書庫|しょこ} 。 {今|いま}も {名|な}を 「{棚|たな}に {上|あ}げて 」いる 。',
    en: 'The mountain archive above Lanternfall, founded to keep copies of every name and promise. The drowned branch\'s ledger shows it is still active: unreadable names are being "shelved" and sent there.',
  });
  note('sg_archive_story', {
    title: { jp: 'テツ の {話|はなし} ： {鐘|かね}の {鳴|な}る {島|しま}', en: 'Tetsu\'s story: the island with the bell' }, fiction: true,
    jp: '{子|こ}どもの {頃|ころ} 、 {島|しま}の {書庫|しょこ}から {鐘|かね}が {聞|き}こえた 。',
    en: 'Tetsu remembers the archive island before it drowned: a bell rang when letters were sorted, and nobody on the island ever raised their voice.',
  });

  // ---- fast travel -----------------------------------------------------------------------------
  C.places.saltglass = {
    name: { en: 'Saltglass', jp: '{潮|しお}{硝子|がらす}' }, map: 'sg.harbor', x: 27, y: 3, dir: 'down', pos: [170, 270],
    region: 'saltglass', hub: true, desc: 'A working harbour of labels, letters and tides.',
  };
})(RB.content);
