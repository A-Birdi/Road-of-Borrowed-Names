/* Saltglass's Living World (C-87; docs/future/work/LW1_AUTHORING.md, LW1_ROLLOUT.md; plan 06_WORLD.md W1-W3, W5, W6).
 * The town is the harbour and its rooms; its routines run once Chapter 2 is over (`ch2_done`).
 *   Routines (W2): Daigo carries on the quay, eats at his carved seat in the Gull, or shifts Kiyo's fish boxes at the
 *     market; Tobi plays on the beach, practises reading addresses at the post box, or watches for boats from the
 *     west point; Fuku sits outside her house, wipes the Chidori-maru's nameplate at the little shrine on the beach,
 *     or takes the sun at the bench (only once the nameplate is there: she is pinned until then, and while the
 *     licence's first step needs her); Wataru tallies in No. 2 Warehouse, rewrites the quay's crate labels, or copies
 *     the harbourmaster's ledgers (a note on his desk while he is out).
 *   Asking after people (W3): Tamae at the Gull and Kiyo at her stall; Genzō at the lighthouse will not say.
 *   Change beats (W1): registered, the north road open (`mb2_done`; sg.road_open), your own boat at the pier
 *     (`sea_boat`) and Fuku's bench with Isamu home (postgame; pastimes/60_postgame.js); new, city traders on the quay
 *     after Playhouse Row's festival (Matsuzō's print stall; Kiyo's word on it), and the harbour's gossip about the sea
 *     trial (Daigo, Tobi, Tamae, once each).
 *   The coast road (W5, sg.road; the Reedwake road beside it has its own: 11_rw_world.js): a small child lost at the
 *     fork, who knows home only by its landmarks, the first time; then now and then a crab with an old fisher's bait
 *     bag, a fish-seller's tags blown off by the wind, or sea fog and a traveller asking the way inland. A stamp for all.
 *   Return keys (W6): the sea cave under the west point (your own boat: a beach of sea glass), the tangled mooring on
 *     the quay (いくつか, two knots undone together), the silent fog bell on the point (鈴, the word that breaks a hush,
 *     from Lanternfall). */
var RB = (globalThis.RB = globalThis.RB || {});
(function (L) {
  'use strict';
  const C = RB.content;
  const J = (jp, en) => ({ jp, en });
  const ch = (o) => Object.assign({ kind: 'choose' }, o);
  const o = (jp, ok, why) => Object.assign({ jp, ok: !!ok }, why ? { why: { en: why } } : {});

  RB.lex.add(RB.lex.parseTable(`
洞窟|どうくつ|n|I|a cave
係船柱|けいせんちゅう|n|A|a bollard, a mooring post
甲羅|こうら|n|I|a shell (of a crab or turtle)
片っぽ|かたっぽ|n|I|(casual) one of a pair (片方)
でっかい|でっかい|adj-i|I|(casual) huge (でかい)
海霧|うみぎり|n|A|sea fog
刷り物|すりもの|n|I|a print, printed matter
もやい結び|もやいむすび|n|A|a bowline (a knot that makes a fixed loop)
本結び|ほんむすび|n|A|a reef knot, a square knot
男前|おとこまえ|n|I|good-looking, handsome (of a man)
ぱっと|ぱっと|adv|I|all at once, suddenly (opening, spreading)
魚売り|さかなうり|n|I|a fish-seller
魚偏|うおへん|n|A|the fish radical (魚 on the left of a kanji)
細長い|ほそながい|adj-i|I|long and thin
`));

  // ---- the town ------------------------------------------------------------------------------------------------------
  L.town('saltglass', {
    maps: ['sg.harbor', 'sg.office', 'sg.inn', 'sg.warehouse', 'sg.glass', 'sg.lighthouse', 'sg.lighthouse_top', 'sg.tidehut', 'sg.isamu'],
    care: ['mb2_done', 'ch4_done', 'kr_done', 'ko_done', 'cr_done', 'yn_done'],
    after: 'ch2_done',
  });

  // the little shrine on the beach that Fuku's nameplate is for (ch2: sg.asahi_order, sg.fuku_after)
  C.maps['sg.harbor'].props.push({ p: 'shrine', x: 48, y: 29, scene: 'sg.lw_shrine' });

  // ---- routines (W2) ---------------------------------------------------------------------------------------------------
  L.routine('saltglass', 'daigo', { base: 'sg.harbor:daigo', pin: 'quest.sg_cove=0', slots: [
    { map: 'sg.inn', x: 2, y: 4, dir: 'up', line: ['おう ！ {昼飯|ひるめし} だ ！ この {席|せき} は {俺|おれ} の だ ぞ 。 {名前|なまえ} が {彫|ほ}って ある だろ ！', 'Ho! Lunchtime! This seat\'s mine. My name\'s carved right there!'] },
    { map: 'sg.harbor', x: 38, y: 22, dir: 'up', perform: { act: 'carry', traits: ['brisk'] }, line: ['キヨ さん の {箱|はこ} を {運|はこ}んでる ん だ 。 {重|おも}い が 、 {札|ふだ} が {白|しろ}く ならねえ から {楽|らく} な もん だ ！', 'Shifting Kiyo\'s boxes. Heavy, but the tags don\'t go blank any more, so it\'s easy work!'] },
  ] });
  L.routine('saltglass', 'tobi', { base: 'sg.harbor:tobi', pin: 'quest.sg_cove=0|quest.sg_seaglass=0', slots: [
    { map: 'sg.harbor', x: 37, y: 12, dir: 'left', line: ['{宛名|あてな} を {読|よ}む {練習|れんしゅう} ！ {配達人|はいたつにん} に なる ん だ から ！ {右|みぎ} と {左|ひだり} は 、 もう {間違|まちが}えない よ 。', 'Practising reading addresses! I\'m going to be a courier! And I don\'t mix up right and left any more.'] },
    { map: 'sg.harbor', x: 5, y: 28, dir: 'down', line: ['ここ から だ と 、 {船|ふね} が {帰|かえ}って くる の が {一番|いちばん} {早|はや}く {見|み}える ん だ よ 。 {海|うみ} ガラス も 、 {時々|ときどき} {落|お}ちてる ！', 'From here you see the boats coming home first. And sometimes there\'s sea glass lying about!'] },
  ] });
  L.routine('saltglass', 'fuku', { base: 'sg.harbor:fuku', pin: '!quest.sg_seaglass=done|quest.sea_licence=0', slots: [
    { map: 'sg.harbor', x: 48, y: 28, dir: 'down', line: ['{千鳥丸|ちどりまる} の {名札|なふだ} 、 {毎朝|まいあさ} {拭|ふ}いて いる の 。 「いってらっしゃい 」 も {一緒|いっしょ} に ね 。', 'I wipe the Chidori-maru\'s nameplate every morning. And say "take care" while I\'m at it.'] },
    { map: 'sg.harbor', x: 40, y: 9, dir: 'up', line: ['{朝|あさ} の ベンチ は 、 {日|ひ} が {当|あ}たって {気持|きも}ち が いい の よ 。 {港|みなと} が {全部|ぜんぶ} {見|み}える わ 。', 'The bench in the morning sun is lovely. You can see the whole harbour from here.'] },
  ] });
  L.routine('saltglass', 'wataru', { base: 'sg.warehouse:wataru', slots: [
    { map: 'sg.harbor', x: 14, y: 26, dir: 'left', perform: 'tally', line: ['{岸壁|がんぺき} の {箱|はこ} の ラベル を 、 {一|ひと}つ ずつ {書|か}き{直|なお}して います 。 {全部|ぜんぶ} {僕|ぼく} の {字|じ} です 。', 'I\'m rewriting the labels on the crates along the quay, one by one. All in my hand.'] },
    { map: 'sg.office', x: 9, y: 5, dir: 'down', perform: 'read', line: ['{港長|こうちょう} の {帳簿|ちょうぼ} を {写|うつ}して います 。 {字|じ} の {綺麗|きれい} な {人|ひと} が {要|い}る そう で 。 …… {僕|ぼく} です 。', 'Copying the harbourmaster\'s ledgers. They need someone with neat handwriting, apparently. …Me.'] },
  ] });
  L.away('saltglass', 'wataru', { map: 'sg.warehouse', x: 3, y: 6, p: 'fw_note', line: ['{書|か}き{置|お}き 。 「{岸壁|がんぺき} か 、 {港|みなと} の {事務所|じむしょ} に います 。 ワタル」', 'A note: "On the quay, or at the Harbour Office. —Wataru"'] });

  // ---- who can be asked after whom (W3) --------------------------------------------------------------------------------
  L.asks('tamae');
  L.knows('tamae', { daigo: 'routine', wataru: 'routine', fuku: 'routine', asahi: 'routine', kiyo: 'routine', tetsu: 'routine', omi: 'routine', sg_matsuzo: 'routine', tobi: 'loose', sota: 'loose', genzo: 'loose', cs_hama: 'loose', el_genroku: 'loose' });
  L.asks('kiyo');
  L.knows('kiyo', { sota: 'routine', sz_isaku: 'routine', daigo: 'routine', tamae: 'routine', wataru: 'routine', tobi: 'loose', fuku: 'loose', asahi: 'loose', tetsu: 'loose', omi: 'loose', sg_matsuzo: 'loose' });
  L.asks('genzo', ['sg.lighthouse', 'sg.lighthouse_top']);
  L.cold('genzo', ['{灯台|とうだい} から は 、 {沖|おき} の {船|ふね} しか {見|み}えん 。 {人|ひと} の こと は 、 {他|ほか} を {当|あ}たれ 。', 'From the lighthouse I see boats out at sea, nothing else. Ask someone else about people.']);
  L.usual('daigo', ['ダイゴ さん ？ {岸壁|がんぺき} で {荷|に} を {運|はこ}んで いる か 、 かもめ{亭|てい} で {昼飯|ひるめし} です よ 。', 'Daigo? Carrying cargo on the quay, or having lunch at the Gull.']);
  L.usual('tobi', ['トビ なら 、 {浜|はま} か 、 {郵便|ゆうびん} {箱|ばこ} の ところ か 、 {岬|みさき} です ね 。', 'Tobi? The beach, or by the post box, or out on the point.']);
  L.usual('fuku', ['フク さん は 、 お{家|うち} の {前|まえ} か 、 ベンチ か 、 {浜|はま} の {祠|ほこら} です よ 。', 'Fuku? Outside her house, or at the bench, or at the little shrine on the beach.']);
  L.usual('wataru', ['ワタル さん は {倉庫|そうこ} か 、 {岸壁|がんぺき} で ラベル を {書|か}いて いる か 、 {港|みなと} の {事務所|じむしょ} です 。', 'Wataru? The warehouse, or writing labels on the quay, or the Harbour Office.']);
  L.usual('tetsu', ['テツ さん は 、 {渡|わた}し{船|ぶね} の {桟橋|さんばし} から {離|はな}れません よ 。', 'Tetsu never leaves the ferry pier.']);
  L.usual('omi', ['{港長|こうちょう} なら 、 {港|みなと} の {事務所|じむしょ} です 。 {机|つくえ} から {動|うご}きません 。', 'The harbourmaster? The Harbour Office. She doesn\'t leave her desk.']);
  L.usual('kiyo', ['キヨ さん は 、 {市場|いちば} の {屋台|やたい} です よ 。 {声|こえ} で {分|わ}かります 。', 'Kiyo\'s at her stall in the market. You\'ll hear her.']);
  L.usual('asahi', ['アサヒ さん は 、 ガラス {工房|こうぼう} に いる はず です 。', 'Asahi should be at the glassworks.']);
  L.usual('tamae', ['タマエ さん なら 、 かもめ{亭|てい} の {台所|だいどころ} です 。', 'Tamae? In the Gull\'s kitchen.']);
  L.usual('sota', ['ソウタ は 、 {桟橋|さんばし} で {網|あみ} を {繕|つくろ}って います よ 。', 'Sōta\'s on the pier, mending his nets.']);
  L.usual('genzo', ['ゲンゾウ さん は {灯台|とうだい} です 。 {階段|かいだん} が {急|きゅう} だ と 、 いつも {言|い}って います よ 。', 'Genzō\'s at the lighthouse. Always complaining the stairs are steep.']);
  L.usual('cs_hama', ['ハマ さん は 、 {岸壁|がんぺき} の {作業台|さぎょうだい} に います よ 。', 'Hama\'s at the workbench on the stone quay.']);
  L.usual('sg_matsuzo', ['マツゾウ さん なら 、 {岸壁|がんぺき} で {刷|す}り{物|もの} を {売|う}って います 。', 'Matsuzō? Selling prints on the quay.']);

  // ---- change beats (W1) ---------------------------------------------------------------------------------------------------
  // registered: the story already does these
  L.beat('saltglass', { id: 'north_road', when: 'ch2_done&!ed>=2|mb2_done', en: 'The north road at the fork is open: the way to Cinder Orchard (sg.road_open).', jp: '{分|わ}かれ{道|みち} の {北|きた} の {道|みち} が {開|ひら}いた 。' });
  L.beat('saltglass', { id: 'boat', when: 'ed>=2&sea_boat', en: 'Your own boat, the coast\'s post boat, at the harbour\'s pier (sea.boat).', jp: '{港|みなと} の {桟橋|さんばし} に 、 {自分|じぶん} の {船|ふね} 。' });
  L.beat('saltglass', { id: 'bench', when: 'ed>=2&postgame&sa_isamu_done&quest.sg_seaglass=done', en: 'Isamu home: shōgi with Fuku at the bench every morning (pt.bench).', jp: 'ベンチ で 、 フク さん と イサム さん が {将棋|しょうぎ} を {指|さ}す 。' });
  // new: city traders on the quay once Playhouse Row's festival is over
  L.beat('saltglass', { id: 'traders', when: 'mb2_done', en: 'City traders: Matsuzō\'s print stall from Blockprint Row on the quay.', jp: '{岸壁|がんぺき} に 、 {八百橋|やおばし} の {刷|す}り{物|もの} の {店|みせ} 。' });
  C.chars.sg_matsuzo = {
    // Matsuzō: a print-seller from Blockprint Row, down the coast with the festival's prints; cheerful, a city talker
    name: { en: 'Matsuzō', jp: 'マツゾウ' }, voice: { pitch: 0.96 },
    look: { skin: 2, hair: 'short', hairColor: 1, cloth: ['#3a4e6a', '#2c3c52', '#e8dcc0'], shape: 'coat', acc: ['hat'], hatCol: '#d8c8a0' },
    portrait: { eyes: 'round', style: 'short', acc: ['hat'], hatCol: '#d8c8a0', bg: '#26303e' },
  };
  C.maps['sg.harbor'].props.push({ p: 'table', x: 17, y: 24, if: 'mb2_done', scene: 'mp.lw_sg_prints' });
  C.maps['sg.harbor'].npcs.push({ id: 'sg_matsuzo', x: 17, y: 25, dir: 'up', if: 'mb2_done', perform: 'hawk', talk: [
    { if: '!seen.mp.lw_sg_matsuzo_first', scene: 'mp.lw_sg_matsuzo_first' }, { scene: 'mp.lw_sg_matsuzo_idle' }] });
  C.work.push({ map: 'sg.harbor', id: 'sg_matsuzo', char: 'sg_matsuzo', act: 'hawk', why: 'the city print-seller\'s stall on the quay, after the festival' });
  L.talk('sg.harbor:kiyo', [{ if: 'mb2_done&!seen.mp.lw_sg_kiyo_traders', scene: 'mp.lw_sg_kiyo_traders' }]);
  // new: the harbour talks about the sea trial (once each)
  L.beat('saltglass', { id: 'trial', when: 'ed>=2&sea_trial_done', en: 'The harbour\'s gossip about the sea trial round the buoy (Daigo, Tobi, Tamae).', jp: '{試|ため}し{乗|の}り の {噂|うわさ} 。' });
  L.talk('sg.harbor:daigo', [{ if: 'ed>=2&sea_trial_done&!seen.sea.lw_sg_trial_daigo', scene: 'sea.lw_sg_trial_daigo' }]);
  L.talk('sg.harbor:tobi', [{ if: 'ed>=2&sea_trial_done&!seen.sea.lw_sg_trial_tobi', scene: 'sea.lw_sg_trial_tobi' }]);
  L.talk('sg.inn:tamae', [{ if: 'ed>=2&sea_trial_done&!seen.sea.lw_sg_trial_tamae', scene: 'sea.lw_sg_trial_tamae' }]);

  // ---- the coast road (W5) ---------------------------------------------------------------------------------------------
  // (the Reedwake road next to it has a cart, a waymarker, a letter and geese: 11_rw_world.js; these are the coast's own)
  L.road('sg_road', {
    maps: ['sg.road'],
    unique: { id: 'child', scene: 'sg.lw_road_child' },
    variants: [
      { id: 'crab', scene: 'sg.lw_road_crab' },
      { id: 'tags', scene: 'sg.lw_road_tags', when: 'ch2_done' },
      { id: 'fog', scene: 'sg.lw_road_fog', when: 'ch2_done&!ed>=2|mb2_done' },
    ],
    stamp: { title: ['{海沿|うみぞ}い の {道|みち}', 'The Coast Road'], motif: 'path', ink: '#3a6a7a' },
  });
  C.challenges['sg.lw_child'] = { title: J('{迷子|まいご} の {目印|めじるし}', 'The lost child\'s landmarks'), tiers: {
    F: [ch({ item: 'v:灯台', ctx: { jp: 'こども ： 「おうち から は 、 おおきな とうだい と ふね が みえる の 。 あかい やね の となり 。」', en: '' }, prompt: { en: 'The child describes home. Which way do you point?' },
      options: [o('さか を くだった ところ 、 みなと の ほう', 1), o('きた の やま の ほう', 0, 'No lighthouse or boats up in the hills: とうだい と ふね means the harbour.'), o('ひがし の かわ の ほう', 0, 'とうだい と ふね: a lighthouse and boats. That is the harbour, down the slope.')] })],
    E: [ch({ item: 'v:灯台', ctx: { jp: '{子|こ}ども ： 「お{家|うち} から は 、 {大|おお}きな {灯台|とうだい} と {船|ふね} が {見|み}える の 。 {赤|あか}い {屋根|やね} の {隣|となり} 。」', en: '' }, prompt: { en: 'The child describes home. Which way do you point?' },
      options: [o('{坂|さか} を {下|くだ}った {港|みなと} の {方|ほう}', 1), o('{北|きた} の {山|やま} の {方|ほう}', 0, '灯台 と 船: a lighthouse and boats. Not up in the hills.'), o('{東|ひがし} の {川|かわ} の {方|ほう}', 0, '灯台 と 船: a lighthouse and boats, down at the harbour.')] })],
    I: [ch({ item: 'g:relative_clause', ctx: { jp: '{子|こ}ども ： 「{窓|まど} から {灯台|とうだい} が {見|み}える {家|いえ} 。 {干|ほ}した {網|あみ} が いっぱい {掛|か}かって いる ところ の 、 {近|ちか}く 。」', en: '' }, prompt: { en: 'Which description fits the child\'s home?' },
      options: [o('{灯台|とうだい} が {見|み}えて 、 {近|ちか}く に {網|あみ} が {干|ほ}して ある {家|いえ}', 1), o('{網|あみ} の {窓|まど} が ある {灯台|とうだい}', 0, '灯台が見える is said of the house (家): the lighthouse is what you see from it.'), o('{灯台|とうだい} の {中|なか} に ある {家|いえ}', 0, 'The lighthouse is seen from the window, so it is outside, nearby.')] })],
    A: [ch({ item: 'g:cond_to', ctx: { jp: '{子|こ}ども ： 「えっと ね 、 {夜|よる} に なる と 、 {光|ひかり} が {回|まわ}って きて 、 {部屋|へや} が {明|あか}るく なる の 。 で 、 {朝|あさ} は カモメ が うるさい の 。」', en: '' }, prompt: { en: 'The child describes home by what happens there. Where is it?' },
      options: [o('{灯台|とうだい} の すぐ {近|ちか}く 、 {海|うみ} の そば', 1), o('{山|やま} の {上|うえ} の {寺|てら} の {近|ちか}く', 0, 'A light that comes round every night (～と: whenever) is a lighthouse\'s; the gulls say the sea.'), o('{市場|いちば} の {真|ま}ん{中|なか}', 0, 'A light sweeping round at night: the lighthouse.')] })],
  } };
  C.challenges['sg.lw_crab'] = { title: J('{餌|えさ} を {取|と}った カニ', 'The crab with the bait bag'), tiers: {
    F: [ch({ item: 'g:adj_te', ctx: { jp: 'りょうし ： 「あかい カニ だ 。 はさみ が ひとつ だけ おおきい 。 こうら に しろい てん が ある 。」', en: '' }, prompt: { en: 'The fisher describes the crab. Which one is it?' },
      options: [o('あかくて 、 はさみ が かたほう だけ おおきい カニ', 1), o('あかくて 、 はさみ が ふたつ とも ちいさい カニ', 0, 'はさみ が ひとつ だけ おおきい: only one claw is big.'), o('くろくて 、 はさみ が ひとつ だけ おおきい カニ', 0, 'あかい: it is red.')] })],
    E: [ch({ item: 'g:adj_te', ctx: { jp: '{漁師|りょうし} ： 「{赤|あか}い カニ だ 。 はさみ が {一|ひと}つ だけ {大|おお}きい 。 {甲羅|こうら} に {白|しろ}い {点|てん} が ある 。」', en: '' }, prompt: { en: 'Which crab is it?' },
      options: [o('{赤|あか}くて 、 {片方|かたほう} の はさみ が {大|おお}きくて 、 {甲羅|こうら} に {白|しろ}い {点|てん} が ある カニ', 1), o('{赤|あか}くて 、 はさみ が {両方|りょうほう} {大|おお}きい カニ', 0, '一つだけ: only one claw is big.'), o('{白|しろ}くて 、 {甲羅|こうら} に {赤|あか}い {点|てん} が ある カニ', 0, 'The crab is red, with white spots.')] })],
    I: [ch({ item: 'g:no_pronoun', ctx: { jp: '{漁師|りょうし} ： 「{一番|いちばん} {大|おお}きい カニ じゃ なくて 、 その {隣|となり} の 、 {小|ちい}さい {赤|あか}い の だ 。」', en: '' }, prompt: { en: 'Which crab does the fisher mean?' },
      options: [o('{一番|いちばん} {大|おお}きい カニ の {隣|となり} に いる 、 {小|ちい}さくて {赤|あか}い カニ', 1), o('{一番|いちばん} {大|おお}きい カニ', 0, 'じゃなくて: not the biggest one.'), o('{赤|あか}い {石|いし}', 0, '赤いの here is "the red one": a crab.')] })],
    A: [ch({ item: 'g:casual_contractions', ctx: { jp: '{漁師|りょうし} ： 「あいつ だ 。 ほら 、 {岩|いわ} の かげ で はさみ {振|ふ}ってる 。 {片|かた}っぽ だけ でっかい {奴|やつ} だ 。」', en: '' }, prompt: { en: 'The old fisher, in rough speech. Which crab?' },
      options: [o('{岩|いわ} の かげ で 、 {大|おお}きい {方|ほう} の はさみ を {振|ふ}って いる カニ', 1), o('{岩|いわ} の {上|うえ} で {寝|ね}て いる {大|おお}きな カニ', 0, '振ってる (振っている): it is waving a claw, in the shadow (かげ) of the rock.'), o('はさみ が {両方|りょうほう} でっかい カニ', 0, '片っぽだけ: only one claw is huge.')] })],
  } };
  C.challenges['sg.lw_tags'] = { title: J('{籠|かご} の {札|ふだ}', 'The baskets\' tags'), tiers: {
    F: [ch({ item: 'v:烏賊', ctx: { jp: 'かご は みっつ 。 ほそながくて 、 あし が たくさん ある の 。 あおくて 、 しま が ある の 。 ちいさくて 、 ぎんいろ の 。', en: '' }, prompt: { en: 'Which basket gets the tag イカ (squid)?' },
      options: [o('ほそながくて 、 あし が たくさん ある の', 1), o('あおくて 、 しま が ある の', 0, 'Blue with stripes is the mackerel (さば). A squid has many legs.'), o('ちいさくて 、 ぎんいろ の', 0, 'Small and silver is the horse mackerel (あじ). A squid has many legs.')] })],
    E: [ch({ item: 'v:烏賊', ctx: { jp: '{札|ふだ} ： 「{鯵|あじ}」 「{鯖|さば}」 「{烏賊|いか}」 。 {魚売|さかなう}り ： 「{足|あし} が {十本|じっぽん} ある の は 、 {烏賊|いか} だ よ 。」', en: '' }, prompt: { en: 'Which tag goes on the basket of creatures with ten legs?' },
      options: [o('{烏賊|いか}', 1), o('{鯖|さば}', 0, 'The fish-seller says: 足が十本あるのは烏賊.'), o('{鯵|あじ}', 0, 'The fish-seller says: 足が十本あるのは烏賊.')] })],
    I: [ch({ item: 'g:comp_yori_hou', ctx: { jp: '{魚売|さかなう}り ： 「{鯖|さば} の {方|ほう} が 、 {鯵|あじ} より ずっと {大|おお}きい よ 。」 {残|のこ}って いる {籠|かご} は {二|ふた}つ 。 {大|おお}きい {魚|さかな} の {籠|かご} と 、 {小|ちい}さい {魚|さかな} の {籠|かご} 。', en: '' }, prompt: { en: 'Which tag goes on the basket of big fish?' },
      options: [o('{鯖|さば}', 1), o('{鯵|あじ}', 0, '鯖の方が鯵より大きい: the mackerel is the bigger one.'), o('どちら でも いい', 0, 'The fish-seller has just told you which is bigger.')] })],
    A: [ch({ item: 'g:keigo_sonkei', ctx: { jp: '{札|ふだ} ： 「{本日|ほんじつ} {水揚|みずあ}げ 。 {生|なま} の ため 、 お{早|はや}め に お{召|め}し{上|あ}がり ください 。」', en: '' }, prompt: { en: 'One more tag, printed. Which basket is it for?' },
      options: [o('{今朝|けさ} {獲|と}れた 、 {生|なま} の {魚|さかな} の {籠|かご}', 1), o('{干|ほ}した {魚|さかな} の {籠|かご}', 0, '生のため: because it is fresh (raw), eat it soon. Dried fish keeps.'), o('{空|から} の {籠|かご}', 0, '本日水揚げ: landed today. It is for the fresh catch.')] })],
  } };
  C.challenges['sg.lw_fog'] = { title: J('{霧|きり} の {中|なか} の {道案内|みちあんない}', 'Directions in the fog'), tiers: {
    F: [ch({ item: 'g:v_te_kudasai', ctx: { jp: 'たびびと ： 「はいみ の さと へ は 、 どっち です か 。」 （わかれみち に とうろう 。 きた の みち は やま へ 、 さか は みなと へ 。）', en: '' }, prompt: { en: 'Tell the traveller the way to Cinder Orchard.' },
      options: [o('とうろう の ところ で 、 きた の みち を のぼって ください 。', 1), o('とうろう の ところ で 、 さか を くだって ください 。', 0, 'Down the slope is the harbour; Cinder Orchard is inland, north.'), o('まっすぐ ひがし へ いって ください 。', 0, 'East is the way to Reedwake.')] })],
    E: [ch({ item: 'g:v_te_kudasai', ctx: { jp: '{旅人|たびびと} ： 「{灰実|はいみ} の {里|さと} へ は 、 どっち です か 。」 （{分|わ}かれ{道|みち} に {灯籠|とうろう} 。 {北|きた} の {道|みち} は {山|やま} へ 、 {坂|さか} は {港|みなと} へ 。）', en: '' }, prompt: { en: 'Tell the traveller the way to Cinder Orchard.' },
      options: [o('{灯籠|とうろう} の ところ で 、 {北|きた} の {道|みち} を {登|のぼ}って ください 。', 1), o('{灯籠|とうろう} の ところ で 、 {坂|さか} を {下|くだ}って ください 。', 0, 'Down the slope is the harbour; Cinder Orchard is inland, north.'), o('まっすぐ {東|ひがし} へ {行|い}って ください 。', 0, 'East is the way to Reedwake.')] })],
    I: [ch({ item: 'g:cond_tara', ctx: { jp: '{旅人|たびびと} ： 「{霧|きり} で {何|なに} も {見|み}えません 。 {灰実|はいみ} の {里|さと} へ は 、 どう {行|い}けば いい です か 。」', en: '' }, prompt: { en: 'The fork lantern is the one thing that shows through the fog. Which directions work?' },
      options: [o('{灯籠|とうろう} が {見|み}えたら 、 そこ から {北|きた} の {道|みち} を {登|のぼ}って ください 。', 1), o('{北|きた} の {道|みち} を {登|のぼ}ったら 、 {灯籠|とうろう} が {見|み}えます 。', 0, 'The lantern is at the fork, where the north road starts: see it first, then climb.'), o('{灯籠|とうろう} が {見|み}えたら 、 {坂|さか} を {下|くだ}って ください 。', 0, 'Down the slope from the lantern is the harbour, not Cinder Orchard.')] })],
    A: [ch({ item: 'g:keigo_sonkei', ctx: { jp: '{旅人|たびびと} ： 「{恐|おそ}れ{入|い}ります が 、 {灰実|はいみ} の {里|さと} へ は どちら から {参|まい}れば よろしい でしょう か 。」', en: '' }, prompt: { en: 'A very polite traveller. Answer as politely.' },
      options: [o('{分|わ}かれ{道|みち} の {灯籠|とうろう} の ところ から 、 {北|きた} の {道|みち} を お{進|すす}み ください 。', 1), o('{灯籠|とうろう} の ところ から 、 {北|きた} の {道|みち} を {参|まい}って ください 。', 0, '参る is humble: for your own going, never the traveller\'s.'), o('{灯籠|とうろう} から {北|きた} へ {行|い}け 。', 0, 'Right way, but a bare command to a stranger who spoke so politely.')] })],
  } };

  // ---- return keys (W6) --------------------------------------------------------------------------------------------------
  L.seal('sg_seacave', { map: 'sg.harbor', x: 3, y: 34, p: 'rock', if: 'ed>=2', opens: 'lw_sg_seacave',
    needs: 'ed>=2&sea_boat',
    hint: ['{岬|みさき} の {下|した} で 、 {波|なみ} が {岩|いわ} の {穴|あな} に {吸|す}い{込|こ}まれて いく 。 {陸|りく} から は {行|い}けない 。 {船|ふね} が あれば …… 。', 'Below the point, the waves are drawn into a hole in the rock. There is no way down from land. With a boat, though…'],
    scene: 'sea.lw_open_sg_seacave', openedLabel: ['{岬|みさき} の {下|した} の {洞窟|どうくつ}', 'The cave under the point'],
    after: { p: 'rock', scene: 'sg.lw_seacave_after' } });
  L.seal('sg_knots', { map: 'sg.harbor', x: 12, y: 28, p: 'sg_bollard', if: 'ed>=2', opens: 'lw_sg_knots',
    needs: 'mod_ikutsuka',
    hint: ['{古|ふる}い {係船柱|けいせんちゅう} に 、 {縄|なわ} が {二|ふた}つ の {結|むす}び{目|め} で {絡|から}まって いる 。 {一|ひと}つ を ほどく と 、 もう {一|ひと}つ が {締|し}まる 。', 'Rope is tangled round an old bollard in two knots. Loosen one, and the other pulls tight.'],
    scene: 'mp.lw_open_sg_knots', openedLabel: ['ほどけた {縄|なわ}', 'The untied mooring'],
    after: { p: 'sg_bollard', scene: 'sg.lw_knots_after' } });
  // the old fog bell on the point: silent, until a word that breaks a hush (鈴, from Lanternfall)
  L.seal('sg_fogbell', { map: 'sg.harbor', x: 5, y: 31, p: 'sb_bellpost', if: 'ed>=2', opens: 'lw_sg_fogbell',
    needs: 'word.suzu',
    hint: ['{岬|みさき} の {古|ふる}い {霧|きり} の {鐘|かね} 。 {綱|つな} を {引|ひ}いて も 、 {音|おと} が {一|ひと}つ も {出|で}ない 。 {静|しず}けさ が 、 {中|なか} に {詰|つ}まって いる よう だ 。', 'An old fog bell on the point. Pull the rope, and not a sound comes out, as if silence itself were packed inside it.'],
    scene: 'lf.lw_open_sg_fogbell', openedLabel: ['{岬|みさき} の {霧|きり} の {鐘|かね}', 'The fog bell on the point'],
    after: { p: 'sb_bellpost', scene: 'sg.lw_fogbell_after' } });

  // ---- notes ---------------------------------------------------------------------------------------------------------------
  const note = (id, d) => (C.notes[id] = d);
  note('sg_lw_landmarks', { title: J('{目印|めじるし} で {道|みち} を {教|おし}える', 'Directions by landmarks'), fiction: false,
    jp: '{日本|にほん} の {町|まち} の {道|みち} は 、 {多|おお}く が {名前|なまえ} を {持|も}たない 。 だから {道|みち} を {教|おし}える {時|とき} は 、 {目印|めじるし} を {使|つか}う 。',
    en: 'Most streets in Japan have no names (addresses go by district and block), so directions are given by landmarks, 目印 (mejirushi): "left at the post office", "the house next to the red roof". Real.' });
  note('sg_lw_uohen', { title: J('{魚偏|うおへん}', 'The fish radical'), fiction: false,
    jp: '{魚|さかな} の {名前|なまえ} の {漢字|かんじ} に は 、 {左|ひだり} に 「{魚|うお}」 が {付|つ}く もの が {多|おお}い 。 {鯵|あじ} 、 {鯖|さば} 、 {鯛|たい} 。 {烏賊|いか} は {魚|さかな} で は ない から 、 {付|つ}かない 。',
    en: 'Many fish are written with the fish radical 魚 on the left (魚偏, uo-hen): 鯵 aji, 鯖 saba, 鯛 tai. Squid, 烏賊 (ika), is no fish, and its kanji have no 魚. Real.' });
  note('sg_lw_seafog', { title: J('{海霧|うみぎり}', 'Sea fog'), fiction: false,
    jp: '{暖|あたた}かい {空気|くうき} が {冷|つめ}たい {海|うみ} の {上|うえ} を {通|とお}る と 、 {霧|きり} が できる 。 {海|うみ} から {崖|がけ} の {道|みち} まで {上|あ}がって くる こと も ある 。',
    en: 'Sea fog (海霧, umigiri) forms when warm, damp air moves over colder water. On a coast it can roll inland and up the cliffs in minutes, and lift as quickly. Real weather.' });
  note('sg_lw_seaglass', { title: J('{海|うみ} ガラス', 'Sea glass'), fiction: false,
    jp: '{海|うみ} ガラス は 、 {割|わ}れた ガラス が {波|なみ} と {砂|すな} に {長|なが}い {間|あいだ} {磨|みが}かれて できる 。 {緑|みどり} や {白|しろ} は {多|おお}い が 、 {青|あお} は {珍|めずら}しい 。',
    en: 'Sea glass is broken glass worn by waves and sand over many years until it is frosted and smooth. Green, white and brown are common (bottles); blue is rare, because far less blue glass was ever made. Real.' });
  note('sg_lw_knots', { title: J('{船乗|ふなの}り の {結|むす}び{方|かた}', 'Sailors\' knots'), fiction: false,
    jp: 'もやい{結|むす}び は 、 {引|ひ}いて も {締|し}まらない {輪|わ} を {作|つく}る 。 {本結|ほんむす}び は 、 {二本|にほん} の {縄|なわ} を つなぐ 。',
    en: 'Two real knots every harbour uses: the bowline (もやい結び, moyai-musubi) makes a loop that will not tighten under load and is easy to undo after; the reef knot (本結び, hon-musubi) joins two ropes of the same thickness.' });
  note('sg_lw_fogbell', { title: J('{霧|きり} の {鐘|かね}', 'The fog bell'), fiction: false,
    jp: '{霧|きり} で {灯台|とうだい} の {光|ひかり} が {見|み}えない {時|とき} は 、 {鐘|かね} や {笛|ふえ} の {音|おと} で 、 {船|ふね} に {岬|みさき} の {場所|ばしょ} を {知|し}らせた 。',
    en: 'When fog hides a lighthouse\'s light, a sound tells boats where the point is: once a bell, later a horn. Real: lighthouses kept fog signals. (The silence in this one is the game\'s own.)' });

  // ---- scenes --------------------------------------------------------------------------------------------------------------
  L.scenes(`
@scene sg.lw_shrine
narr: {浜|はま} の {小|ちい}さな {祠|ほこら} 。 {海|うみ} の {方|ほう} を {向|む}いて いる 。 || A little shrine on the beach, facing the sea.
?(quest.sg_seaglass=done) narr: {海|うみ} ガラス の {名札|なふだ} が {飾|かざ}って ある 。 「{千鳥丸|ちどりまる}」 。 {青|あお}い {字|じ} が 、 {朝|あさ} の {光|ひかり} で {光|ひか}って いる 。 || A sea-glass nameplate hangs there: "Chidori-maru". The blue letters catch the morning light.

# ---- the city traders (after Playhouse Row's festival) ----------------------------------------------------------------
@scene mp.lw_sg_prints
narr: {台|だい} の {上|うえ} に 、 {刷|す}り{物|もの} が {並|なら}んで いる 。 {芝居|しばい} の {役者|やくしゃ} 、 {八百|はっぴゃく} の {橋|はし} 、 {祭|まつ}り の {提灯|ちょうちん} 。 || Prints laid out on the table: actors from the plays, the eight hundred bridges, the festival's lanterns.

@scene mp.lw_sg_matsuzo_first
!faceplayer
sg_matsuzo: いらっしゃい ！ {八百橋|やおばし} の {版木|はんぎ}{通|どお}り から {来|き}ました 。 {祭|まつ}り の {刷|す}り{物|もの} 、 {港|みなと} の {皆|みな}さん に も ！ || Roll up! Down from Blockprint Row in Manybridge. The festival's prints, for the harbour folk too!
sg_matsuzo: {芝居|しばい} の {絵|え} も 、 {橋|はし} の {絵|え} も ある よ 。 {潮硝子|しおがらす} の {人|ひと} は 、 {海|うみ} の {絵|え} より {橋|はし} の {絵|え} を {買|か}う ね 。 {珍|めずら}しい から かな 。 || Pictures of the plays, pictures of the bridges. Saltglass folk buy the bridges over the sea pictures. Novelty, I suppose.
?(el_done) sg_matsuzo: {船|ふね} は 、 {東|ひがし} の {渡|わた}し{場|ば} に {着|つ}けて ある 。 ゴンスケ の {船|ふね} だ 。 {岸壁|がんぺき} は {混|こ}んでる から ね 。 || The boat's tied up round at East Landing. Gonsuke's boat. The stone quay's too crowded.
?(!el_done) sg_matsuzo: {船|ふね} で {来|き}た ん だ 。 {岸壁|がんぺき} は {混|こ}んでて 、 {着|つ}ける の が {大変|たいへん} だった よ 。 || Came by boat. The stone quay's so crowded it was a job to tie up.
?(comp=suzu) comp[smile]: {役者|やくしゃ} の {絵|え} ね 。 …… {知|し}ってる {顔|かお} が ある わ 。 {本物|ほんもの} より {男前|おとこまえ} に {刷|す}って ある けど 。 || Actors' pictures. …There's a face I know. Printed handsomer than the real thing, mind.

@scene mp.lw_sg_matsuzo_idle
!faceplayer
sg_matsuzo: {刷|す}り{物|もの} は {軽|かる}い から 、 {船|ふね} でも {道|みち} でも {運|はこ}べる 。 {一枚|いちまい} どう だい ？ {見|み}る だけ でも いい よ 。 || Prints are light: they travel by boat or by road. Fancy one? Looking's free.

@scene mp.lw_sg_kiyo_traders
!faceplayer
kiyo: {岸壁|がんぺき} に {町|まち} の {人|ひと} が {店|みせ} を {出|だ}してる よ 。 {魚|さかな} じゃ なくて 、 {絵|え} を {売|う}ってる ん だ と さ 。 …… {絵|え} は {食|た}べられない のに ねぇ 。 || City folk have set up on the quay. Not fish: pictures, if you please. …You can't eat a picture, can you.
kiyo[smile]: でも 、 {絵|え} を {買|か}い に {来|く}る {客|きゃく} が 、 ついで に {鯵|あじ} も {買|か}って いく 。 {悪|わる}く ない よ 。 || Still, the folk who come for the pictures pick up some horse mackerel on the way. Not bad.

# ---- the sea trial's gossip ----------------------------------------------------------------------------------------------
@scene sea.lw_sg_trial_daigo
!faceplayer
daigo: おう ！ {見|み}た ぞ 、 {試|ため}し{乗|の}り ！ {岬|みさき} の {沖|おき} の ブイ を 、 きれい に {回|まわ}った な ！ {港|みなと} じゅう {見|み}てた ぜ ！ || Ho! I saw the sea trial! Round the buoy off the point, clean as you like! The whole harbour was watching!

@scene sea.lw_sg_trial_tobi
!faceplayer
tobi: {試|ため}し{乗|の}り 、 {岬|みさき} から {見|み}た よ ！ {帆|ほ} が ぱっと {開|ひら}いて 、 かっこよかった ！ {僕|ぼく} も {大|おお}きく なったら {乗|の}せて ね ！ || I watched the sea trial from the point! The sail opened all at once, it was so cool! Take me out when I'm bigger!

@scene sea.lw_sg_trial_tamae
!faceplayer
tamae: {聞|き}いた よ 、 {試|ため}し{乗|の}り ！ うち の {客|きゃく} が 、 {朝|あさ} から その {話|はなし} ばかり さ 。 {免状|めんじょう} が {取|と}れたら 、 お{茶|ちゃ} を {一杯|いっぱい} {奢|おご}る よ 。 || Heard about the sea trial! My guests have talked of nothing else all morning. Once you've got your licence, the tea's on me.

# ---- the coast road (W5) -------------------------------------------------------------------------------------------------
@scene sg.lw_road_child
# Road event (W5), the coast road's first: a small child lost at the fork, who knows home only by its landmarks. From
# the top of the slope the harbour shows, and the child knows the way from there. Leaving defers it.
!if lw_sg_child_met -> again
!set lw_sg_child_met
narr: {分|わ}かれ{道|みち} の {灯籠|とうろう} の {下|した} で 、 {小|ちい}さな {子|こ} が {泣|な}きそう な {顔|かお} で {立|た}って いる 。 || Under the lantern at the fork, a small child stands on the edge of tears.
narr: 「{道|みち} が {分|わ}からなく なっちゃった 。 …… お{家|うち} の {名前|なまえ} ？ {分|わ}かんない 。 でも 、 お{家|うち} から {見|み}える もの なら {分|わ}かる よ 。」 || "I don't know the way any more. …The name of where I live? I don't know. But I know what you can see from home."
!goto ask
:again
narr: {灯籠|とうろう} の {下|した} に 、 あの {子|こ} が また {座|すわ}って いる 。 {待|ま}って いた らしい 。 || The child is sitting under the lantern again. Waiting, by the look of it.
:ask
!choice
* {一緒|いっしょ} に {探|さが}そう 。 || Let's find it together. -> help
* {今|いま} は {急|いそ}いで いる 。 ごめん ね 。 || We're in a hurry just now. Sorry. -> later
:help
!challenge sg.lw_child
!if var._res=0 -> miss
narr: {坂|さか} の {上|うえ} から 、 {港|みなと} を {指|さ}す 。 {赤|あか}い {屋根|やね} 、 {桟橋|さんばし} 、 {岬|みさき} の {灯台|とうだい} 。 || From the top of the slope you point out the harbour: red roofs, piers, the lighthouse on the point.
narr: 「あ ！ {灯台|とうだい} ！ あっち が お{家|うち} ！」 {子|こ} は {手|て} を {振|ふ}って 、 {坂|さか} を {走|はし}って {下|お}りて いった 。 || "Oh! The lighthouse! Home's that way!" The child waves and runs off down the slope.
?(comp=nao) comp: {住所|じゅうしょ} が なくて も 、 {目印|めじるし} が あれば {届|とど}く 。 {配達|はいたつ} と {同|おな}じ だ 。 || No address, but with landmarks it still gets there. Same as the post.
?(comp=mio) comp[smile]: {灯台|とうだい} が {見|み}えた {時|とき} の {顔|かお} 、 {見|み}ました ？ {一番|いちばん} の お{薬|くすり} です ね 。 || Did you see that face when the lighthouse came into view? Better than any medicine.
?(comp=ren) comp: {灯|ひ} は 、 {帰|かえ}る {道|みち} の {目印|めじるし} です 。 {灯台|とうだい} も {灯籠|とうろう} も 。 || A light marks the way home. Lighthouse or lantern, both.
?(comp=suzu) comp[smile]: {迷子|まいご} の {役|やく} は 、 {家|いえ} に {帰|かえ}る {場面|ばめん} で {終|お}わり 。 いい {幕切|まくぎ}れ ね 。 || A lost child's part ends with the scene where they get home. A good curtain.
!note sg_lw_landmarks
!hook road_done sg_road child
!end
:miss
narr: {子|こ} は {首|くび} を かしげた 。 「…… {違|ちが}う と {思|おも}う 。」 もう {一度|いちど} 、 よく {聞|き}いて みよう 。 || The child tilts their head. "…I don't think that's it." Listen to the child again, carefully.
!end
:later
narr: 「…… うん 。 ここ で {待|ま}ってる 。 {迷|まよ}ったら {動|うご}かない の が {一番|いちばん} って 、 お{母|かあ}さん が {言|い}ってた 。」 || "…OK. I'll wait here. Mum says when you're lost, staying put is best."

@scene sg.lw_road_crab
# Road event (W5), a variant: a crab has run off with an old fisher's bait bag on the way down to the beach.
narr: {浜|はま} へ {下|お}りる ところ で 、 {年寄|としよ}り の {漁師|りょうし} が {岩|いわ} を {覗|のぞ}き{込|こ}んで いる 。 「カニ が 、 {餌|えさ} の {袋|ふくろ} を {持|も}って いって しまった 。」 || Where the path drops to the beach, an old fisher is peering under the rocks. "A crab's gone off with my bait bag."
narr: {岩|いわ} の {間|あいだ} に 、 カニ が {何匹|なんびき} も いる 。 どの カニ だろう 。 || There are crabs all over the rocks. Which one?
!challenge sg.lw_crab
!if var._res=0 -> miss
narr: {大|おお}きな はさみ の カニ が 、 {袋|ふくろ} の {紐|ひも} を {挟|はさ}んで いた 。 そっと {取|と}り{返|かえ}す と 、 カニ は {横|よこ} に {走|はし}って {逃|に}げた 。 || A crab with one big claw had the bag's cord in its grip. You ease it free, and the crab scuttles off sideways.
narr: 「{助|たす}かった よ 。 カニ に {餌|えさ} を {取|と}られる {漁師|りょうし} なんて 、 {笑|わら}い{話|ばなし} だ 。」 || "That's a help. A fisher robbed of his bait by a crab. There's a story to laugh at."
!hook road_done sg_road crab
!end
:miss
narr: {違|ちが}う カニ だった 。 もう {一度|いちど} よく {見|み}て みよう 。 || Wrong crab. Have another good look.

@scene sg.lw_road_tags
# Road event (W5), a variant: the wind has blown the tags off a fish-seller's baskets; which is which?
narr: ベンチ の {横|よこ} で 、 {魚売|さかなう}り が {籠|かご} を {並|なら}べて {休|やす}んで いる 。 {風|かぜ} で 、 {籠|かご} の {札|ふだ} が {全部|ぜんぶ} {飛|と}んで しまった らしい 。 || By the bench a fish-seller is resting, baskets set out in a row. The wind has blown every tag off them, by the look of it.
narr: 「{葦|あし}ノ{瀬|せ} へ {売|う}り に {行|い}く ん だ けど 、 {札|ふだ} が ない と {売|う}れない よ 。 どれ が どれ か 、 {手伝|てつだ}って くれる ？」 || "I'm off to Reedwake to sell these, but I can't sell without the tags. Help me work out which is which?"
!challenge sg.lw_tags
!if var._res=0 -> miss
narr: {札|ふだ} を {全部|ぜんぶ} {付|つ}け{直|なお}した 。 「{助|たす}かった ！ {字|じ} が {読|よ}める {人|ひと} は 、 {頼|たよ}り に なる ね 。」 || Every tag back where it belongs. "What a help! Someone who can read is worth having about."
!note sg_lw_uohen
!hook road_done sg_road tags
!end
:miss
narr: 「あれ 、 {違|ちが}う みたい 。 {急|いそ}がない から 、 ゆっくり {見|み}て 。」 || "Hm, that doesn't look right. No hurry: take your time."

@scene sg.lw_road_fog
# Road event (W5), a variant: sea fog comes up the cliffs; a traveller who cannot see the fork asks the way inland.
narr: {海|うみ} から {霧|きり} が {上|あ}がって きた 。 {道|みち} の {先|さき} が {見|み}えない 。 || Fog comes up off the sea. You can't see the road ahead.
narr: {霧|きり} の {中|なか} から 、 {旅|たび} の {人|ひと} の {声|こえ} が する 。 || From inside the fog comes a traveller's voice.
!challenge sg.lw_fog
!if var._res=0 -> miss
narr: 「ありがとう ございます ！」 {足音|あしおと} が 、 {北|きた} の {道|みち} へ {遠|とお}ざかって いく 。 しばらく する と 、 {霧|きり} も {晴|は}れて きた 。 || "Thank you!" The footsteps fade away up the north road. After a while, the fog lifts too.
!note sg_lw_seafog
!hook road_done sg_road fog
!end
:miss
narr: {声|こえ} は {迷|まよ}って いる よう だ 。 {霧|きり} が {晴|は}れる まで 、 {一緒|いっしょ} に {待|ま}つ こと に した 。 || The voice sounds lost. You decide to wait with them until the fog lifts.

# ---- return keys (W6) ------------------------------------------------------------------------------------------------------
@scene sea.lw_open_sg_seacave
# Opened with the boat: round the point at low water and in. A beach of sea glass nobody knew.
narr: {自分|じぶん} の {船|ふね} が ある 。 {潮|しお} が {引|ひ}いた {時|とき} に {岬|みさき} を {回|まわ}って 、 {洞窟|どうくつ} に {入|はい}った 。 || You have a boat of your own now. At low water you take her round the point and into the cave.
narr: {奥|おく} に 、 {小|ちい}さな {浜|はま} が あった 。 {一面|いちめん} 、 {海|うみ} ガラス 。 {緑|みどり} 、 {白|しろ} 、 {茶色|ちゃいろ} …… {青|あお} も 、 たくさん ある 。 || At the back is a tiny beach covered in sea glass: green, white, brown… and blue, lots of blue.
narr: {波|なみ} が {寄|よ}せる たび に 、 ガラス が {鳴|な}る 。 {潮|しお} と ガラス 。 {町|まち} の {名前|なまえ} の よう な {場所|ばしょ} だ 。 || Every wave that comes in sets the glass chiming. Tide and glass: a place like the town's own name.
narr: {一|ひと}つ も {持|も}って {帰|かえ}らない 。 ここ の ガラス は 、 ここ の もの だ 。 || You don't take a single piece. The glass here belongs here.
?(comp=nao) comp: …… トビ に は {黙|だま}って おけ よ 。 {一人|ひとり} で {泳|およ}いで {来|き}かねない 。 || …Don't tell Tobi. That kid would try swimming here alone.
?(comp=mio) comp[smile]: {青|あお} が こんな に 。 {光|ひかり} が {水|みず} の {底|そこ} から {来|く}る みたい 。 || So much blue. As if the light came up from under the water.
?(comp=ren) comp: {長|なが}い {時間|じかん} を かけて 、 {波|なみ} が {磨|みが}いた の です ね 。 {急|いそ}がない {仕事|しごと} です 。 || The waves have polished them over a long, long time. Work that never hurries.
?(comp=suzu) comp[smile]: {舞台|ぶたい} の {照明|しょうめい} より きれい ね 。 {誰|だれ} も {見|み}て ない の が 、 もったいない わ 。 || Prettier than any stage lighting. A shame nobody's watching.
!note sg_lw_seaglass

@scene sg.lw_seacave_after
narr: {岬|みさき} の {下|した} の {洞窟|どうくつ} 。 {船|ふね} で {行|い}けば 、 {海|うみ} ガラス の {浜|はま} が また {見|み}られる 。 || The cave under the point. With the boat, you can visit its beach of sea glass again.

@scene mp.lw_open_sg_knots
# Opened with いくつか (learned in Blockprint Row): two knots that tighten against each other come undone only together.
narr: {二|ふた}つ の {結|むす}び{目|め} が 、 {互|たが}い を {締|し}めて いる 。 {一|ひと}つ ずつ で は 、 {絶対|ぜったい} に ほどけない 。 || The two knots hold each other tight. One at a time, they will never come undone.
narr: でも 、 {今|いま} は 「いくつか」 を {知|し}って いる 。 {一|ひと}つ で は なく 、 {結|むす}び{目|め} を いくつか {一度|いちど} に ほどく 。 {二|ふた}つ の {結|むす}び{目|め} が 、 {同時|どうじ} に {緩|ゆる}んだ 。 || But now you know いくつか, "some, a few". Not one knot but several at once: both knots loosen together.
narr: {縄|なわ} の {下|した} から 、 {小|ちい}さな {缶|かん} が {出|で}て きた 。 {中|なか} に 、 {結|むす}び{方|かた} の {絵|え} を {描|か}いた {古|ふる}い {札|ふだ} 。 {船乗|ふなの}り の {覚|おぼ}え{書|が}き だ 。 || From under the rope comes a little tin. Inside, an old card with knots drawn on it: some sailor's notes.
?(comp=suzu) comp[smile]: {絡|から}まった {筋書|すじが}き も 、 {二|ふた}つ {同時|どうじ} に {引|ひ}けば {解|と}ける もの よ 。 || A tangled plot comes loose too, if you pull two threads at once.
!note sg_lw_knots

@scene sg.lw_knots_after
narr: {古|ふる}い {係船柱|けいせんちゅう} 。 {縄|なわ} は ほどけて 、 きれい に {巻|ま}いて ある 。 || The old bollard. The rope is untied now, and neatly coiled.

@scene lf.lw_open_sg_fogbell
# Opened with 鈴 (the word learned in Lanternfall): a clear sound that breaks a hush.
narr: {灯落|ひおち} で {覚|おぼ}えた {言葉|ことば} が ある 。 「{鈴|すず}」 。 {静|しず}けさ を {破|やぶ}る 、 {澄|す}んだ {音|おと} 。 || There is a word you learned in Lanternfall: 鈴, bell. A clear sound that breaks a hush.
narr: {言葉|ことば} を {綱|つな} に {込|こ}めて 、 {引|ひ}く 。 {霧|きり} の {鐘|かね} が {鳴|な}った 。 {澄|す}んだ {音|おと} が 、 {港|みなと} じゅう に {響|ひび}いた 。 || You weave the word into the rope, and pull. The fog bell rings, and its clear note carries across the whole harbour.
genzo: …… {鳴|な}った か 。 {何年|なんねん} も {黙|だま}った まま の {鐘|かね} だった 。 {霧|きり} の {夜|よる} に は 、 これ が {要|い}る ん だ 。 || …So it rings. That bell's been dumb for years. On foggy nights, it's needed.
?(comp=nao) comp: {霧|きり} の {日|ひ} の {配達|はいたつ} は 、 {音|おと} が {頼|たよ}り だ 。 これ で {船|ふね} も {迷|まよ}わない 。 || On foggy days a courier goes by sound. Now the boats won't lose their way either.
?(comp=mio) comp[smile]: いい {音|おと} 。 {胸|むね} の {奥|おく} まで {届|とど}く みたい 。 || What a sound. It reaches right inside you.
?(comp=ren) comp: {灯|ひ} が {届|とど}かない {霧|きり} の {夜|よる} に は 、 {音|おと} が {灯|ひ} の {代|か}わり です 。 || On foggy nights when the light can't reach, sound stands in for it.
?(comp=suzu) comp[smile]: {開幕|かいまく} の {柝|き} より 、 {大|おお}きな {音|おと} ね 。 || Louder than the clappers before curtain-up.
!note sg_lw_fogbell

@scene sg.lw_fogbell_after
narr: {岬|みさき} の {霧|きり} の {鐘|かね} 。 {綱|つな} を {引|ひ}く と 、 {澄|す}んだ {音|おと} が {港|みなと} に {響|ひび}く 。 || The fog bell on the point. Pull the rope, and a clear note rings across the harbour.
`);

  // ---- Suzu's lines in Kansai-ben (src/lang/85_dialect.js; docs/dialect/suzu_kansai.md) --------------------------------
  if (RB.dialect && RB.dialect.add) RB.dialect.add('kansai', `
@ zzz_living/20_sg [mp.lw_sg_matsuzo_first]
= {役者|やくしゃ} の {絵|え} ね 。 …… {知|し}ってる {顔|かお} が ある わ 。 {本物|ほんもの} より {男前|おとこまえ} に {刷|す}って ある けど 。 || Actors' pictures. …There's a face I know. Printed handsomer than the real thing, mind.
> {役者|やくしゃ} の {絵|え} や な 。 …… {知|し}ってる {顔|かお} が ある わ 。 {本物|ほんもの} より {男前|おとこまえ} に {刷|す}って ある けど な 。 || Actors' pictures. …There's a face I know. Printed handsomer than the real thing, mind you.
@ zzz_living/20_sg [sg.lw_road_child]
= {迷子|まいご} の {役|やく} は 、 {家|いえ} に {帰|かえ}る {場面|ばめん} で {終|お}わり 。 いい {幕切|まくぎ}れ ね 。 || A lost child's part ends with the scene where they get home. A good curtain.
> {迷子|まいご} の {役|やく} は 、 {家|いえ} に {帰|かえ}る {場面|ばめん} で {終|お}わり や 。 ええ {幕切|まくぎ}れ や な 。 || A lost child's part ends with the scene where they get home. A good curtain, that.
@ zzz_living/20_sg [sea.lw_open_sg_seacave]
= {舞台|ぶたい} の {照明|しょうめい} より きれい ね 。 {誰|だれ} も {見|み}て ない の が 、 もったいない わ 。 || Prettier than any stage lighting. A shame nobody's watching.
> {舞台|ぶたい} の {照明|しょうめい} より きれい や な 。 {誰|だれ} も {見|み}て ない の が 、 もったいない わ 。 || Prettier than any stage lighting. A shame nobody's watching.
@ zzz_living/20_sg [mp.lw_open_sg_knots]
= {絡|から}まった {筋書|すじが}き も 、 {二|ふた}つ {同時|どうじ} に {引|ひ}けば {解|と}ける もの よ 。 || A tangled plot comes loose too, if you pull two threads at once.
> {絡|から}まった {筋書|すじが}き も 、 {二|ふた}つ {同時|どうじ} に {引|ひ}いたら {解|と}ける もん や で 。 || A tangled plot comes loose too, if you pull two threads at once.
@ zzz_living/20_sg [lf.lw_open_sg_fogbell]
= {開幕|かいまく} の {柝|き} より 、 {大|おお}きな {音|おと} ね 。 || Louder than the clappers before curtain-up.
> {開幕|かいまく} の {柝|き} より 、 {大|おお}きな {音|おと} や な 。 || Louder than the clappers before curtain-up.
`, 'zzz_living/20_sg.js');
})(RB.living);
