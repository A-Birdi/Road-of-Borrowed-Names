/* Cinder Orchard's Living World (C-87; docs/future/work/LW1_AUTHORING.md, LW1_ROLLOUT.md). From the end of its own
 * story (`ch3_done`):
 * W2 routines: Shino does her round (the post house, the notice board, Fusa's inn; a note on her desk while she is
 *   out); Old Gorō takes his too-hot tea at Fusa's or looks down on the village from the top terrace; Kotarō runs
 *   after the white goat or watches the glass furnace, reciting his fire rules.
 * W3 Fusa (who knows everyone, and Chigusa from long ago) and Gorō (the old lookout) can be asked after people;
 *   Master Isao, at his fire, won't say.
 * W1 beats: registered — Kotonoha's leaf home on Ume's drying-rack tag (`ko_ret_co`), this year's festival
 *   (`ed>=2&postgame`); new — a light on the northern mountain that is not a fire (Snowbell's lamp, `ch4_done`:
 *   Gorō's notice by the lookout, Kotarō's near miss with the bell), and oil jars at Nobu's for the Keepers' Road
 *   teahouse (`kr_done`: counted right this time).
 * W5 the Orchard Road (co.road): Matahei's persimmon cart tipped on the slope the first time you come (sort them by
 *   the tag), then now and then a traveller's smouldering campfire, a fallen scarecrow, or someone asking the way.
 * W6 return keys: the terraces' old sluice boards that will not rise one at a time (すべて), the kiln-keepers'
 *   tally board in the Old Workshop Row (ごとに), and the viewing stone on the upper terraces (全体). */
var RB = (globalThis.RB = globalThis.RB || {});
(function (L, C) {
  'use strict';
  const T = L.T; // (en, jp)
  const TJ = (jp, en) => ({ jp, en }); // challenge titles, written Japanese first
  const ch = (o) => Object.assign({ kind: 'choose' }, o);
  const o = (jp, ok, why) => Object.assign({ jp, ok: !!ok }, why ? { why: { en: why } } : {});

  RB.lex.add(RB.lex.parseTable(`
堰板|せきいた|n|A|a sluice board (a plank that holds back water in a channel)
干し場|ほしば|n|I|a drying place, a drying rack
女将|おかみ|n|I|the landlady (of an inn or teahouse)
燻る|くすぶる|v5r|A|to smoulder
かざす||v5s|I|to hold (a hand) over something
柿畑|かきばたけ|n|I|a persimmon orchard
潤う|うるおう|v5u|A|to be watered, to be moistened
ぷつり||adv|A|(stopping or snapping) short, all at once
見晴らし|みはらし|n|I|a view; a place with a view
渋柿|しぶがき|n|I|an astringent persimmon (sweet only once dried)
甘柿|あまがき|n|I|a sweet persimmon (eaten fresh)
窯番|かまばん|n|A|a kiln-keeper
マタヘイ||name|F|Matahei (a name; a farmer on the Orchard Road)
`));

  // ---- the town ------------------------------------------------------------------------------------------------------
  L.town('cinder', {
    maps: ['co.village', 'co.inn', 'co.post', 'co.glass', 'co.pottery', 'co.hall', 'co.terraces', 'co.ume'],
    care: ['ch4_done', 'kr_done', 'ch5_done', 'ko_ret_co'],
    after: 'ch3_done',
  });

  // ---- W2: routines ---------------------------------------------------------------------------------------------------
  L.routine('cinder', 'co_shino', { base: 'co.post:co_shino', slots: [
    { map: 'co.village', x: 15, y: 25, dir: 'up', line: ['{皆|みな}さん に {読|よ}んで いただく {手紙|てがみ} は 、 ここ に {貼|は}ります 。 {一軒|いっけん} ずつ {回|まわ}る より 、 {早|はや}い です から 。', 'Letters meant for everyone go up here. Quicker than going door to door.'] },
    { map: 'co.inn', x: 2, y: 5, dir: 'up', line: ['{旅|たび} の お{客|きゃく} さん {宛|あ}て の {手紙|てがみ} は 、 フサ さん の {宿|やど} に {届|とど}きます 。 {毎日|まいにち} {寄|よ}る ん です 。', 'Letters for travellers come to Fusa\'s inn. I stop by every day.'] },
  ] });
  L.away('cinder', 'co_shino', { map: 'co.post', x: 3, y: 3, p: 'fw_note', line: ['{机|つくえ} の {横|よこ} に {書|か}き{置|お}き 。 「{配達|はいたつ} {中|ちゅう} です 。 {掲示板|けいじばん} か 、 フサ さん の {宿|やど} に います 。 シノ」', 'A note by the desk: "Out on my round. At the notice board, or Fusa\'s inn. —Shino"'] });
  L.routine('cinder', 'co_goro', { base: 'co.village:co_goro', slots: [
    { map: 'co.inn', x: 4, y: 7, dir: 'up', line: ['フサ の {茶|ちゃ} は いつも {熱|あつ}すぎる 。 …… それ でも {毎日|まいにち} {飲|の}み に {来|く}る 。 {癖|くせ} だ な 。', 'Fusa\'s tea is always too hot. …And still I come every day. Habit.'] },
    { map: 'co.terraces', x: 31, y: 3, dir: 'down', line: ['ここ から なら 、 {里|さと} が {全部|ぜんぶ} {見|み}える 。 {櫓|やぐら} の {番|ばん} の {癖|くせ} は 、 {抜|ぬ}けない もの だ な 。', 'From up here you can see the whole village. A lookout\'s habits don\'t leave you.'] },
  ] });
  // Kotarō has two placements on the square: before the story's end (27,20) and after it (13,15), his usual place
  L.routine('cinder', 'co_kotaro', { base: 'co.village:co_kotaro@13,15', slots: [
    { map: 'co.terraces', x: 24, y: 24, dir: 'right', line: ['{白|しろ}い ヤギ が また {逃|に}げた ！ …… {僕|ぼく} が {追|お}いかけて いる ん じゃ ない よ 。 ヤギ が {先|さき} に {走|はし}る ん だ 。', 'The white goat got out again! …I\'m not chasing it. It runs first!'] },
    { map: 'co.glass', x: 4, y: 7, dir: 'up', line: ['{決|き}まり {二|に} 。 {火|ひ} から {目|め} を {離|はな}さない 。 …… {見|み}て いる だけ なら 、 いい よね ？', 'Rule two: never take your eyes off the fire. …Just watching is all right, isn\'t it?'] },
  ] });

  // ---- W3: who can be asked after whom ------------------------------------------------------------------------------
  L.asks('co_fusa', ['co.inn']);
  L.knows('co_fusa', { co_shino: 'routine', co_goro: 'routine', co_kotaro: 'routine', co_sayo: 'routine', co_ume: 'routine', hiro: 'routine', co_isao: 'routine', co_nobu: 'routine', co_tamotsu: 'routine', co_tokiwa: 'routine', co_asa: 'routine', co_heita: 'routine', lq_chigusa: 'loose' });
  L.asks('co_goro', ['co.village', 'co.inn', 'co.terraces']);
  L.knows('co_goro', { co_kotaro: 'routine', co_tamotsu: 'routine', co_heita: 'routine', co_ume: 'routine', co_isao: 'routine', co_fusa: 'routine', hiro: 'routine', co_tokiwa: 'loose', co_sayo: 'loose', co_shino: 'loose', co_nobu: 'loose', co_asa: 'loose' });
  L.asks('co_isao', ['co.glass']);
  L.cold('co_isao', ['{火|ひ} の {前|まえ} だ 。 {人|ひと} の {話|はなし} は {後|あと} に しろ 。', 'I\'m at the fire. Talk about people later.']);
  L.usual('co_shino', ['シノ さん は {郵便所|ゆうびんじょ} か 、 {掲示板|けいじばん} の {前|まえ} か 、 うち の {宿|やど} です ね 。', 'Shino? The post house, or the notice board, or here at the inn.']);
  L.usual('co_goro', ['ゴロウ さん は {櫓|やぐら} の {下|した} か 、 うち の {宿|やど} で お{茶|ちゃ} か 、 {段々畑|だんだんばたけ} の {一番|いちばん} {上|うえ} です よ 。', 'Gorō? Under the lookout, or here at the inn with his tea, or right at the top of the terraces.']);
  L.usual('co_kotaro', ['コタロウ は {広場|ひろば} か 、 {段々畑|だんだんばたけ} で ヤギ と {走|はし}って いる か 、 ガラス {工房|こうぼう} を のぞいて いる か です 。', 'Kotarō? The square, or the terraces running about with the goat, or peering into the glass workshop.']);
  L.usual('co_tamotsu', ['タモツ さん なら 、 {水路|すいろ} の そば です よ 。 {小屋|こや} の {前|まえ} に いつも います 。', 'Tamotsu? By the channel. Always in front of his shed.']);
  L.usual('co_heita', ['ヘイタ さん は 、 {火除|ひよ}け{道|みち} で {草|くさ} を {束|たば}ねて います 。 {昼寝|ひるね} {中|ちゅう} で なければ ね 。', 'Heita\'s binding the cut grass on the firebreak. When he isn\'t napping.']);
  L.usual('co_asa', ['アサ さん は {段々畑|だんだんばたけ} の {下|した} の {方|ほう} 、 {道|みち}しるべ の そば です 。', 'Asa\'s down at the bottom of the terraces, by the signposts.']);
  L.usual('co_ume', ['ウメ さん は {段々畑|だんだんばたけ} に います よ 。 {柿|かき} の {木|き} の {間|あいだ} です 。', 'Grandma Ume\'s on the terraces, among the persimmon trees.']);
  L.usual('hiro', ['ヒロ は {広場|ひろば} です 。 {名前|なまえ} の ある {席|せき} の そば 。', 'Hiro\'s on the square, by the seat with the name on it.']);
  L.usual('co_isao', ['イサオ さん は ガラス {工房|こうぼう} から {出|で}て きません 。', 'Isao never comes out of the glass workshop.']);
  L.usual('co_nobu', ['ノブ さん は {焼|や}き{物|もの}{屋|や} で 、 {土|つち} を こねて います 。', 'Nobu\'s at the pottery, wedging clay.']);
  L.usual('co_fusa', ['フサ さん は {宿|やど} です 。 いつも です 。', 'Fusa\'s at the inn. Always.']);
  L.usual('co_tokiwa', ['トキワ さん は {水路|すいろ} の {向|む}こう の {記録堂|きろくどう} です 。', 'Tokiwa\'s at the Chronicle Hall, across the channel.']);
  L.usual('co_sayo', ['サヨ さん は {広場|ひろば} の {机|つくえ} の ところ です よ 。', 'Sayo\'s at her table on the square.']);

  // ---- W1: change beats ---------------------------------------------------------------------------------------------
  // already in the journey: Kotonoha's leaf goes home to the tag on Ume's drying rack (zz_ko_mainland.js), and this
  // year's festival once the story is over (returns/20_festival.js)
  L.beat('cinder', { id: 'leaf', when: 'ko_ret_co', en: 'A leaf home on the tag of Grandma Ume\'s drying rack', jp: 'ウメ さん の {干|ほ}し{場|ば} の {札|ふだ}' });
  L.beat('cinder', { id: 'festival', when: 'ed>=2&postgame', en: 'This year\'s festival', jp: '{今年|ことし} の {秋祭|あきまつ}り' });
  // new: Snowbell's lamp seen from the lookout, and a notice so nobody rings the fire bell for it
  L.beat('cinder', { id: 'northlight', when: 'ch4_done', en: 'A light on the northern mountain, and a notice by the lookout', jp: '{北|きた} の {山|やま} の {灯|あか}り' });
  C.maps['co.village'].props.push({ p: 'fw_postnote', x: 13, y: 11, if: 'beat.cinder.northlight', scene: 'sb.lw_co_northlight' });
  L.talk('co.village:co_kotaro@13,15', [{ if: 'beat.cinder.northlight&!seen.sb.lw_co_northlight_kotaro', scene: 'sb.lw_co_northlight_kotaro' }]);
  // new: the Keepers' Road teahouse orders oil jars from Nobu
  L.beat('cinder', { id: 'jars', when: 'kr_done', en: 'Oil jars at the pottery for the Keepers\' Road', jp: '{灯守|ひもり} の {道|みち} の かめ' });
  C.maps['co.pottery'].props.push({ p: 'kr_jar', x: 7, y: 3, if: 'beat.cinder.jars', scene: 'kr.lw_co_jars' }, { p: 'kr_jar', x: 8, y: 3, if: 'beat.cinder.jars', scene: 'kr.lw_co_jars' });
  L.talk('co.pottery:co_nobu', [{ if: 'beat.cinder.jars&!seen.kr.lw_co_jars_nobu', scene: 'kr.lw_co_jars_nobu' }]);

  // ---- W5: the Orchard Road -----------------------------------------------------------------------------------------
  // Matahei: a farmer from the slopes below the village, bringing persimmons up for the festival
  C.chars.lw_matahei = { name: T('Matahei', 'マタヘイ'), voice: { pitch: 0.84 },
    look: { skin: 3, hair: 'short', hairColor: 5, cloth: ['#6a5a3a', '#544630', '#d8a050'], shape: 'tunic', acc: ['hat'], hatCol: '#c8b07a', age: 'old' },
    portrait: { eyes: 'round', style: 'short', age: 'old', acc: ['hat'], hatCol: '#c8b07a', bg: '#3a2e20' } };
  const road = C.maps['co.road'];
  road.npcs = road.npcs || [];
  road.npcs.push({ id: 'lw_matahei', x: 15, y: 8, dir: 'left', if: '!lw_co_kaki_done', talk: 'co.lw_road_kaki' });
  road.props.push({ p: 'cart', x: 12, y: 7, if: '!lw_co_kaki_done' }, { p: 'crate', x: 14, y: 7, if: '!lw_co_kaki_done' });
  // each stands where it happens (RE-1): Matahei by his tipped cart (placed above), the two baskets to sort into at
  // his feet; the smouldering campfire on the verge under the dry grass, its board beside it; the fallen scarecrow (a
  // heap of straw) among the persimmon trees past the fence gap; the puzzled traveller on the road below the signpost
  L.road('co_road', { maps: ['co.road'],
    unique: { id: 'kaki', scene: 'co.lw_road_kaki', at: { props: [{ p: 'ko_basket', x: 13, y: 8, meet: true }, { p: 'ko_basket', x: 14, y: 8, meet: true }] } },
    variants: [
      { id: 'embers', scene: 'co.lw_road_embers', at: { props: [{ p: 'campfire', x: 27, y: 9, meet: true }, { p: 'sign', x: 26, y: 9, meet: true }] } },
      { id: 'scarecrow', scene: 'co.lw_road_scarecrow', at: { props: [{ p: 'hay', x: 20, y: 15, meet: true }] } },
      { id: 'way', scene: 'co.lw_road_way', at: { who: [{ char: 'lw_rd_traveller2', x: 31, y: 11, dir: 'up' }] } },
    ],
    stamp: { title: ['{灰実|はいみ} へ の {坂道|さかみち}', 'the Orchard Road'], motif: 'path', ink: '#a8502a' } });
  C.notes.lw_co_shibugaki = { title: T('Astringent persimmons', '{渋柿|しぶがき}'), fiction: false,
    jp: '{渋柿|しぶがき} は 、 そのまま で は {渋|しぶ}くて {食|た}べられない 。 {皮|かわ} を むいて {干|ほ}す と 、 {甘|あま}い {干|ほ}し{柿|がき} に なる 。 {甘柿|あまがき} は 、 {木|き} から {取|と}って すぐ {食|た}べられる 。',
    en: 'Astringent persimmons (shibugaki) are too puckering to eat fresh; peeled and hung to dry, they turn sweet: hoshigaki. Sweet kinds (amagaki) can be eaten straight from the tree.' };

  C.challenges['co.lw_kaki'] = { title: TJ('{柿|かき} の {札|ふだ}', 'The persimmon tag'), tiers: {
    F: [ch({ item: 'v:柿', ctx: { jp: 'ふだ ： 「あまい かき は あかい かご 。 しぶい かき は しろい かご 。」', en: '' }, prompt: { en: 'This persimmon is the astringent kind (しぶい). Which basket?' }, options: [o('しろい かご', 1), o('あかい かご', 0, 'The red basket is for the sweet ones (あまい).')] })],
    E: [ch({ item: 'v:渋い', ctx: { jp: '{札|ふだ} ： 「{甘|あま}い {柿|かき} は {赤|あか}い {籠|かご} に 。 {渋|しぶ}い {柿|かき} は {白|しろ}い {籠|かご} に 。」', en: '' }, prompt: { en: 'You pick up an astringent one. Where does it go?' }, options: [o('{白|しろ}い {籠|かご}', 1), o('{赤|あか}い {籠|かご}', 0, '{赤|あか}い {籠|かご} is for the sweet ones.'), o('どちら でも いい', 0, 'The tag keeps them apart.')] })],
    I: [ch({ item: 'g:v_te_kara', ctx: { jp: 'マタヘイ ： 「{渋柿|しぶがき} は 、 {干|ほ}して から {食|た}べる ん だ 。 {干|ほ}す {前|まえ} は 、 {渋|しぶ}くて {食|た}べられない ぞ 。」', en: '' }, prompt: { en: 'When can the astringent ones be eaten?' }, options: [o('{干|ほ}して から', 1), o('{干|ほ}す {前|まえ} に', 0, 'Before drying they are too astringent: {渋|しぶ}くて {食|た}べられない.'), o('{今|いま} すぐ', 0, '〜てから: only after drying.')] })],
    A: [ch({ item: 'g:indirectness', ctx: { jp: 'マタヘイ ： 「{赤|あか}い {籠|かご} の {方|ほう} は 、 {祭|まつ}り {用|よう} で ね 。 …… {一|ひと}つ くらい {減|へ}って も 、 {誰|だれ} も {数|かぞ}えちゃ いない さ 。」', en: '' }, prompt: { en: 'What is Matahei hinting?' }, options: [o('{甘|あま}い {柿|かき} を {一|ひと}つ {食|た}べて いい', 1), o('{籠|かご} を {数|かぞ}えて ほしい', 0, 'He says nobody is counting.'), o('{祭|まつ}り に {来|こ}ないで ほしい', 0, 'He means one fewer won\'t be missed: help yourself.')] })],
  } };
  C.challenges['co.lw_embers'] = { title: TJ('{焚|た}き{火|び} の {跡|あと}', 'The smouldering campfire'), tiers: {
    F: [ch({ item: 'v:水', ctx: { jp: 'たてふだ ： 「たきび の あと は 、 みず を かけて から 、 つち を かける こと 。」', en: '' }, prompt: { en: 'What do you do first?' }, options: [o('みず を かける', 1), o('つち を かける', 0, 'から: the earth comes after the water.'), o('そのまま いく', 0, 'The board asks you to put it out.')] })],
    E: [ch({ item: 'g:v_te_kara', ctx: { jp: '{立|た}て{札|ふだ} ： 「{焚|た}き{火|び} の {跡|あと} は 、 {水|みず} を かけて から 、 {土|つち} を かける こと 。」', en: '' }, prompt: { en: 'In what order?' }, options: [o('{水|みず} 、 それから {土|つち}', 1), o('{土|つち} 、 それから {水|みず}', 0, '{水|みず} を かけて から: water first.'), o('{土|つち} だけ', 0, 'The board names both.')] })],
    I: [ch({ item: 'g:v_nakereba', ctx: { jp: '{立|た}て{札|ふだ} ： 「{火|ひ} が {消|き}えた と {思|おも}って も 、 {手|て} を かざして {確|たし}かめなければ ならない 。」', en: '' }, prompt: { en: 'Even when it looks out, what must you do?' }, options: [o('{手|て} を かざして 、 {熱|あつ}く ない か {確|たし}かめる', 1), o('すぐ に {離|はな}れる', 0, '{確|たし}かめなければ ならない: you must check.'), o('{息|いき} を {吹|ふ}きかける', 0, 'That would wake the embers.')] })],
    A: [ch({ item: 'g:adv_kanenai', ctx: { jp: '{立|た}て{札|ふだ} の {下|した} に {小|ちい}さく ： 「{乾|かわ}いた {日|ひ} は 、 {小|ちい}さな {火|ひ} でも {山|やま} {一|ひと}つ {焼|や}き かねない 。」', en: '' }, prompt: { en: 'What does the small print warn?' }, options: [o('{小|ちい}さな {火|ひ} でも 、 {山|やま} が {燃|も}えて しまう かも しれない', 1), o('{小|ちい}さな {火|ひ} なら {安全|あんぜん} だ', 0, '〜かねない: it could well happen.'), o('{山|やま} で は {火|ひ} を {焚|た}いて も いい', 0, 'It warns against exactly that, on dry days.')] })],
  } };
  C.challenges['co.lw_scarecrow'] = { title: TJ('{倒|たお}れた {案山子|かかし}', 'The fallen scarecrow'), tiers: {
    F: [ch({ item: 'v:顔', ctx: { jp: 'ふだ ： 「たおれて いたら 、 おこして ください 。 かお は やま の ほう 。」', en: '' }, prompt: { en: 'Which way should its face point?' }, options: [o('やま の ほう', 1), o('みち の ほう', 0, 'かお は やま の ほう: the face towards the hills.')] })],
    E: [ch({ item: 'g:v_te_kudasai', ctx: { jp: '{札|ふだ} ： 「{倒|たお}れて いたら 、 {起|お}こして ください 。 {顔|かお} は {山|やま} の {方|ほう} に {向|む}けて ください 。」', en: '' }, prompt: { en: 'What does the tag ask?' }, options: [o('{起|お}こして 、 {顔|かお} を {山|やま} に {向|む}ける', 1), o('{倒|たお}れた まま に して おく', 0, '{起|お}こして ください: stand it up.'), o('{顔|かお} を {道|みち} に {向|む}ける', 0, '{顔|かお} は {山|やま} の {方|ほう}.')] })],
    I: [ch({ item: 'g:conj_node', ctx: { jp: '{札|ふだ} ： 「カラス は {山|やま} から {来|く}る ので 、 {顔|かお} を {山|やま} に {向|む}けて おく こと 。」', en: '' }, prompt: { en: 'Why face the hills?' }, options: [o('カラス が {山|やま} から {来|く}る から', 1), o('{山|やま} の {方|ほう} が {明|あか}るい から', 0, '〜ので gives the reason: the crows.'), o('{道|みち} を {見張|みは}る ため', 0, 'It is turned away from the road.')] })],
    A: [ch({ item: 'g:relative_clause', ctx: { jp: '{札|ふだ} の {裏|うら} ： 「{起|お}こして くれた {方|かた} へ 。 カラス に {負|ま}けない {案山子|かかし} は 、 {柿|かき} の {番人|ばんにん} です 。 どうぞ よろしく 。」', en: '' }, prompt: { en: 'Who is the note on the back for?' }, options: [o('{案山子|かかし} を {起|お}こした {人|ひと}', 1), o('カラス', 0, '{起|お}こして くれた {方|かた}: whoever stood it up.'), o('{柿|かき} の {番人|ばんにん}', 0, 'That is the scarecrow itself.')] })],
  } };
  C.challenges['co.lw_way'] = { title: TJ('{宿|やど} へ の {道|みち}', 'The way to the inn'), tiers: {
    F: [ch({ item: 'v:右', ctx: { jp: 'みちしるべ ： 「→ はいみ の さと 。 ← しおがらす 。」 たびびと ： 「やど は どっち ？」', en: '' }, prompt: { en: 'The inn is in the village. Which way?' }, options: [o('みぎ', 1), o('ひだり', 0, '← points to しおがらす, Saltglass.')] })],
    E: [ch({ item: 'v:上る', ctx: { jp: '{旅人|たびびと} ： 「{灰実|はいみ} の {里|さと} の {宿|やど} へ {行|い}きたい ん です 。 この {坂|さか} を {上|のぼ}れば いい です か 。」', en: '' }, prompt: { en: 'The village is up the slope. What do you say?' }, options: [o('はい 、 この {坂|さか} を {上|のぼ}って ください', 1), o('いいえ 、 {下|くだ}って ください', 0, 'Down the slope is the way to Saltglass.'), o('{北|きた} へ {行|い}って ください', 0, 'North is the old road, not the village.')] })],
    I: [ch({ item: 'g:cond_ba', ctx: { jp: 'あなた ： 「{里|さと} に {入|はい}って 、 {左|ひだり} へ {行|い}けば 、 すぐ です 。」', en: '' }, prompt: { en: 'What did you tell the traveller?' }, options: [o('{里|さと} に {入|はい}って {左|ひだり} へ {行|い}く と 、 すぐ {着|つ}く', 1), o('{左|ひだり} へ {行|い}って は いけない', 0, '〜ば: if you go left, it is right there.'), o('{左|ひだり} へ {行|い}く と 、 {遠|とお}い', 0, 'すぐ です: it is close.')] })],
    A: [ch({ item: 'g:keigo_sonkei', ctx: { jp: '{旅人|たびびと} ： 「{宿|やど} の ご{主人|しゅじん} は 、 どんな {方|かた} で いらっしゃいます か 。」', en: '' }, prompt: { en: 'What is the traveller asking (respectful language)?' }, options: [o('{宿|やど} の {主人|しゅじん} は どんな {人|ひと} か', 1), o('{宿|やど} は どこ に ある か', 0, 'いらっしゃいます here is the respectful いる / です: what kind of person.'), o('{宿|やど} に {泊|と}まって いる か', 0, 'They ask about the innkeeper.')] })],
  } };

  // ---- W6: return keys ----------------------------------------------------------------------------------------------
  L.seal('co_headgate', { map: 'co.terraces', x: 36, y: 2, p: 'fence', needs: 'mod_subete', opens: 'lw_co_headgate_open', scene: 'kr.lw_co_headgate_open',
    hint: ['{水門|すいもん} の {脇|わき} に 、 {古|ふる}い {堰板|せきいた} が {並|なら}んで いる 。 {一枚|いちまい} {上|あ}げる と 、 {隣|となり} の {板|いた} が {落|お}ちる 。 {柱|はしら} に 「{一枚|いちまい} ずつ で は {開|ひら}かぬ 」 と {彫|ほ}って ある 。', 'Beside the headgate, a row of old sluice boards. Lift one and the next drops back. Cut into the post: "Not opened one at a time."'],
    openedLabel: ['{段々畑|だんだんばたけ} の {堰板|せきいた}', 'The terraces\' sluice boards'], after: { p: 'fence', scene: 'kr.lw_co_headgate_after' } });
  L.seal('co_tally', { map: 'co.oldworks', x: 25, y: 8, p: 'co_tablet', needs: 'mod_goto', opens: 'lw_co_tally_read', scene: 'cr.lw_co_tally_open',
    hint: ['{窯番|かまばん} の {小屋|こや} の {板|いた} に 、 {短|みじか}い {線|せん} が {何百|なんびゃく} も {刻|きざ}んで ある 。 {上|うえ} に {一行|いちぎょう} 、 「{窯|かま} を {焚|た}く ごと に {一本|いっぽん} 」 。 「ごと に 」 が 、 まだ {分|わ}からない 。', 'A board from the kiln-keepers\' hut, cut with hundreds of short strokes. Above them, one line: "One stroke ごとに the kiln is fired." The ごとに means nothing to you yet.'],
    openedLabel: ['{窯|かま} の {数|かず} の {板|いた}', 'The kiln\'s tally board'], after: { p: 'co_tablet', scene: 'cr.lw_co_tally_after' } });
  L.seal('co_view', { map: 'co.upper', x: 26, y: 27, p: 'cs_viewstone', needs: 'mod_zentai', opens: 'lw_co_view_seen', scene: 'yn.lw_co_view_open',
    hint: ['{見晴|みは}らし の {石|いし} 。 {下|した} に {畑|はたけ} と {道|みち} と {水路|すいろ} が {見|み}える が 、 どれ も ばらばら だ 。 {石|いし} に は 「{一|ひと}つ と して {見|み}よ 」 と ある 。', 'A viewing stone. Below lie the fields, the paths and the channel, all in pieces. Carved on the stone: "See them as one."'],
    openedLabel: ['{見晴|みは}らし の {石|いし}', 'The viewing stone'], after: { p: 'cs_viewstone', scene: 'yn.lw_co_view_after' } });
  C.notes.lw_co_water = { title: T('The sluice boards', '{堰板|せきいた}'), fiction: true,
    jp: '{段々畑|だんだんばたけ} の {古|ふる}い {堰板|せきいた} は 、 すべて {一度|いちど} に {上|あ}がる よう に {作|つく}られて いた 。 どの {家|いえ} の {畑|はたけ} も 、 {同|おな}じ {時|とき} に {水|みず} を {飲|の}む 。 {柱|はしら} に は 、 「{一|ひと}つ の {段|だん} だけ が {潤|うるお}う {年|とし} は 、 {里|さと} が {割|わ}れる 」 と ある 。',
    en: 'The terraces\' old sluice boards were made to rise all at once: every family\'s field drinks at the same moment. On the post: "A year when one terrace alone is watered, the village splits."' };
  C.notes.lw_co_tally = { title: T('The kiln-keepers\' tally', '{窯番|かまばん} の {板|いた}'), fiction: true,
    jp: '{窯番|かまばん} は 、 {大窯|おおがま} を {焚|た}く ごと に {一本|いっぽん} 、 {板|いた} に {線|せん} を {刻|きざ}んだ 。 {線|せん} は {二十年|にじゅうねん} {前|まえ} の {秋|あき} で {止|と}まって いる 。',
    en: 'The kiln-keepers cut one stroke on the board for every firing of the Great Kiln. The strokes stop at the autumn twenty years ago.' };
  C.notes.lw_co_terraces_whole = { title: T('The terraces as one', '{段々畑|だんだんばたけ} の {全体|ぜんたい}'), fiction: true,
    jp: '{上|うえ} の {段|だん} から {全体|ぜんたい} を {見|み}る と 、 {火除|ひよ}け{道|みち} は {葉|は} の {筋|すじ} の よう に {段|だん} の {間|あいだ} を {走|はし}り 、 どれ も {水路|すいろ} へ {続|つづ}いて いる 。 {山|やま} {全体|ぜんたい} が 、 {一|ひと}つ の {逃|に}げ{道|みち} に なって いる 。',
    en: 'Seen whole from the upper terraces, the firebreaks run between the terraces like the veins of a leaf, and every one leads to the channel. The whole hillside is one way out.' };

  L.scenes(`
@scene sb.lw_co_northlight
narr: {櫓|やぐら} の {柱|はしら} に {貼|は}り{紙|がみ} 。 「{北|きた} の {山|やま} の {灯|あか}り は 、 {火事|かじ} で は ない 。 {雪鈴|ゆきすず} の {天文台|てんもんだい} の {灯|あか}り で ある 。 {鐘|かね} は {鳴|な}らさない こと 。 ゴロウ 」 || A notice on the lookout's post: "The light on the northern mountain is not a fire. It is the lamp of the Snowbell observatory. Do not ring the bell. —Gorō"

@scene sb.lw_co_northlight_kotaro
co_kotaro: ねえ 、 {聞|き}いて よ 。 {北|きた} の {山|やま} に {灯|あか}り が {見|み}えた から 、 {火事|かじ} だ と {思|おも}って 、 {鐘|かね} を {鳴|な}らし かけた ん だ 。 || Hey, listen. I saw a light on the northern mountain and thought it was a fire, so I nearly rang the bell.
co_kotaro: …… {天文台|てんもんだい} の {灯|あか}り だった 。 じいちゃん に {笑|わら}われた 。 でも 、 {鳴|な}らす {前|まえ} に {聞|き}いた から 、 {褒|ほ}められた よ 。 || …It was the observatory's lamp. Grandpa laughed at me. But I asked before I rang it, so he said well done.

@scene kr.lw_co_jars
narr: {焼|や}き{上|あ}がった ばかり の かめ@甕 が {並|なら}んで いる 。 {札|ふだ} に 「{灯守|ひもり} の {道|みち} ・ {麓|ふもと} の {茶屋|ちゃや} {行|ゆ}き 」 。 || Freshly fired jars in a row. The tag: "To the teahouse at the foot of the Keepers' Road."

@scene kr.lw_co_jars_nobu
co_nobu: {山|やま} の {向|む}こう の {茶屋|ちゃや} から 、 {油|あぶら} の かめ@甕 の {注文|ちゅうもん} が {来|き}た 。 {三十個|さんじゅっこ} だ 。 || An order came from a teahouse over the mountains: oil jars, thirty of them.
co_nobu: {数|かず} に うるさい {女将|おかみ} で な 。 {注文書|ちゅうもんしょ} に 「{三十個|さんじゅっこ} 」 と {三回|さんかい} {書|か}いて あった 。 …… {今度|こんど} は 、 とっくり じゃ ない ぞ 。 || A landlady who's fussy about numbers: "thirty jars", three times over on the slip. …No flasks this time.

@scene co.lw_road_kaki
# Road event (W5): the Orchard Road's own, the first time you walk it. A farmer's cart has tipped on the slope and
# the two kinds of persimmon are all mixed up.
!look lw_matahei pc
lw_matahei: おーい 、 そこ の {人|ひと} ！ ちょっと {手|て} を {貸|か}して くれ 。 || Hey, you there! Lend me a hand a moment.
lw_matahei: {坂|さか} で {荷車|にぐるま} が {傾|かたむ}いて 、 {柿|かき} が {全部|ぜんぶ} {混|ま}ざって しまった 。 {札|ふだ} の {通|とお}り に 、 {籠|かご} に {分|わ}けて ほしい ん だ 。 || The cart tipped on the slope and the persimmons are all mixed up. I need them sorted into the baskets the way the tag says.
!challenge co.lw_kaki
!if var._res=0 -> later
narr: {甘|あま}い {柿|かき} は {赤|あか}い {籠|かご} へ 、 {渋|しぶ}い {柿|かき} は {白|しろ}い {籠|かご} へ 。 {荷車|にぐるま} も {元|もと} に {戻|もど}った 。 || Sweet ones in the red basket, astringent ones in the white. The cart is set back on its wheels.
lw_matahei[laugh]: {助|たす}かった ！ {白|しろ}い {籠|かご} は {段々畑|だんだんばたけ} の ウメ さん へ {届|とど}ける ん だ 。 {干|ほ}し{柿|がき} に する から な 。 || Saved! The white basket goes to Grandma Ume on the terraces. She dries them.
?(comp=mio) comp[smile]: {干|ほ}し{柿|がき} は 、 {喉|のど} に も いい ん です よ 。 || Dried persimmons are good for the throat, too.
?(comp=nao) comp: {籠|かご} {二|ふた}つ 、 {届|とど}け{先|さき} {二|ふた}つ 。 {間違|まちが}えたら {大変|たいへん} だ 。 || Two baskets, two addresses. Mix those up and you're in trouble.
!note lw_co_shibugaki
!set lw_co_kaki_done
!hook road_done co_road kaki
!refresh
!end
:later
lw_matahei: {急|いそ}ぎ じゃ ない 。 {柿|かき} は {逃|に}げない から な 。 また {通|とお}る とき に {頼|たの}む よ 。 || No rush. Persimmons don't run off. Give me a hand next time you're passing.

@scene co.lw_road_embers
narr: {道|みち} の {脇|わき} で 、 {誰|だれ} か の {焚|た}き{火|び} の {跡|あと} が まだ {燻|くすぶ}って いる 。 {乾|かわ}いた {草|くさ} の すぐ そば だ 。 {立|た}て{札|ふだ} が {一|ひと}つ 。 || By the roadside, someone's campfire is still smouldering, right beside the dry grass. There is a board.
!challenge co.lw_embers
!if var._res=0 -> later
narr: {水|みず} を かけ 、 {土|つち} を かぶせて 、 {手|て} を かざす 。 もう {熱|あつ}く ない 。 || Water, then earth over it, then a hand held above. No heat left.
?(comp=mio) comp: よかった 。 この {乾|かわ}き {方|かた} なら 、 {本当|ほんとう} に {危|あぶ}なかった 。 || Good. As dry as it is, that really was dangerous.
!hook road_done co_road embers
!end
:later
narr: {近|ちか}く の {畑|はたけ} から {人|ひと} が {桶|おけ} を {持|も}って {走|はし}って きた 。 {大事|だいじ} に は ならなかった 。 || Someone runs over from a nearby field with a bucket. No harm done.

@scene co.lw_road_scarecrow
narr: {柿畑|かきばたけ} の {案山子|かかし} が 、 {風|かぜ} で {倒|たお}れて いる 。 {首|くび} に {札|ふだ} が {下|さ}がって いる 。 || A scarecrow in the persimmon trees has blown over. A tag hangs round its neck.
!challenge co.lw_scarecrow
!if var._res=0 -> later
narr: {案山子|かかし} を {起|お}こして 、 {顔|かお} を {山|やま} に {向|む}けた 。 {柿|かき} の {木|き} の {上|うえ} で 、 カラス が {不満|ふまん} そう に {鳴|な}いた 。 || You stand the scarecrow up and turn its face to the hills. Up in the persimmon tree, a crow complains.
!hook road_done co_road scarecrow
!end
:later
narr: {案山子|かかし} は {倒|たお}れた まま 、 {空|そら} を {見上|みあ}げて いる 。 || The scarecrow lies where it fell, gazing at the sky.

@scene co.lw_road_way
narr: {荷物|にもつ} を {背負|せお}った {旅人|たびびと} が 、 {道|みち} の {真|ま}ん{中|なか} で {首|くび} を かしげて いる 。 || A traveller with a pack stands in the middle of the road, head tilted, puzzled.
!challenge co.lw_way
!if var._res=0 -> later
narr: {旅人|たびびと} は {何度|なんど} も {頭|あたま} を {下|さ}げて 、 {坂|さか} を {上|のぼ}って いった 。 || With bow after bow, the traveller sets off up the slope.
!hook road_done co_road way
!end
:later
narr: {旅人|たびびと} は {道|みち}しるべ を {見上|みあ}げて 、 {自分|じぶん} で {決|き}めた らしい 。 || The traveller looks up at the waymarker and seems to decide alone.

@scene kr.lw_co_headgate_open
narr: {一枚|いちまい} ずつ で は なく 、 すべて の {堰板|せきいた} を {一度|いちど} に {上|あ}げる 。 || Not one at a time: you lift all the boards at once.
narr: {水|みず} が {音|おと} を {立|た}てて 、 すべて の {段|だん} へ {同時|どうじ} に {流|なが}れて いく 。 {段々畑|だんだんばたけ} が 、 {上|うえ} から {下|した} まで {光|ひか}った 。 || The water rushes out to every terrace at once, and the whole hillside shines from top to bottom.
narr: {柱|はしら} の {裏|うら} に 、 もう {一行|いちぎょう} 。 「{一|ひと}つ の {段|だん} だけ が {潤|うるお}う {年|とし} は 、 {里|さと} が {割|わ}れる 」 。 || On the back of the post, one more line: "A year when one terrace alone is watered, the village splits."
?(comp=ren) comp: {水|みず} を {分|わ}ける {決|き}まり は 、 {人|ひと} を {分|わ}けない ため の {決|き}まり です ね 。 || A rule for sharing water is a rule for not dividing people.
!note lw_co_water

@scene kr.lw_co_headgate_after
narr: {堰板|せきいた} は すべて {上|あ}がった まま だ 。 {水|みず} が どの {段|だん} に も {流|なが}れて いる 。 || All the boards stay raised, and the water runs to every terrace.

@scene cr.lw_co_tally_open
narr: 「{窯|かま} を {焚|た}く ごと に {一本|いっぽん} 」 。 {焚|た}く たび に 、 {一本|いっぽん} 。 {大窯|おおがま} の {火|ひ} の {数|かず} だ 。 || "One stroke for each firing of the kiln." A stroke every time: the Great Kiln's fires, counted.
narr: {線|せん} を {数|かぞ}えて いく 。 {毎年|まいとし} {同|おな}じ くらい の {数|かず} が {並|なら}び 、 {二十年|にじゅうねん} {前|まえ} の {秋|あき} で 、 ぷつり と {止|と}まって いる 。 || You count along the rows. Much the same number every year, until an autumn twenty years ago, where they simply stop.
?(comp=nao) comp: {記録|きろく} に ない こと も 、 {線|せん} は {覚|おぼ}えて いた わけ だ 。 || What the chronicle left out, the strokes remembered.
!note lw_co_tally

@scene cr.lw_co_tally_after
narr: {窯|かま} を {焚|た}く ごと に {一本|いっぽん} 。 {大窯|おおがま} の {火|ひ} の {数|かず} が 、 {並|なら}んで いる 。 || One stroke for each firing: the Great Kiln's fires, in rows.

@scene yn.lw_co_view_open
narr: {畑|はたけ} を {一枚|いちまい} ずつ {見|み}る の を やめて 、 {全体|ぜんたい} を {見|み}る 。 || You stop looking field by field and take in the whole.
narr: {火除|ひよ}け{道|みち} は {葉|は} の {筋|すじ} の よう に {段|だん} の {間|あいだ} を {走|はし}り 、 どれ も {下|した} の {水路|すいろ} へ {続|つづ}いて いる 。 {山|やま} {全体|ぜんたい} が 、 {一|ひと}つ の {逃|に}げ{道|みち} に なって いた 。 || The firebreaks run between the terraces like the veins of a leaf, and every one leads down to the channel. The whole hillside was made as one way out.
?(comp=mio) comp[think]: {昔|むかし} の {人|ひと} は 、 {逃|に}げる {人|ひと} の {足|あし} の こと まで {考|かんが}えて いた ん です ね 。 || The people of old even thought about the feet of those who'd have to run.
!note lw_co_terraces_whole

@scene yn.lw_co_view_after
narr: {見晴|みは}らし の {石|いし} 。 {段々畑|だんだんばたけ} の {全体|ぜんたい} が 、 {一|ひと}つ の {絵|え} の よう に {見|み}える 。 || The viewing stone. The terraces lie below as a whole, like a single picture.
`);
})(RB.living, RB.content);
