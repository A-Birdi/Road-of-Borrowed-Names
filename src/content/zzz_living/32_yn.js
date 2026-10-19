/* Steamhollow's Living World (C-87; docs/future/work/LW1_AUTHORING.md, LW1_ROLLOUT.md): the upper and lower towns, the
 * river terraces and their rooms, from the valley's agreement (`yn_done`), and the way down into it (yn.descent).
 * W2 routines: Toki writing street names on the lower town's lanterns and lighting the terrace lamp last of all; Senta
 *   resting sore feet at the quiet terrace footbath or bringing the Lower House its post; Heikichi repainting the Lower
 *   House's sign or the troupe's (checking the names first, now).
 * W3 "Have you seen…?": Onatsu at her stall (who knows everyone's business), Kane at the Lower House and Tama at the
 *   steam box; Tokuzō, run off his feet and discreet about guests, won't say.
 * W1 change beats. Registered (already there): the north road open once the valley has agreed. Added, from the one
 *   chapter after this one: replies coming down from the ridge villages once the Hush is settled (a letter by the upper
 *   board, Senta's bag); news of the mountain's archive at Onatsu's stall after the story (her new towels).
 * W5 the Steaming Slope (yn.descent, from the Cloudroad's pass). Its first arrival (yn.descent_first, Yasuke) sets the
 *   scene but poses no problem, so the road gets its own unique event: Yohei the yu-no-hana gatherer, who can't read the
 *   bath-keepers' board through the steam (read it for him); then now and then eggs cooking by the path, a first-timer
 *   asking about bath manners, a family choosing an inn.
 * W6 return keys, all opened by the twelfth chapter or after it (nothing earlier is later than this chapter): the old
 *   signal bell to the ridge villages, silent until the Hush is settled (Chapter 12); the spring house over the source,
 *   steam-sealed until the Kettle's Mother sleeps (her shrine, after the story); the poem stone by the terrace footbath,
 *   whose last line is for whoever comes back from the mountain (after the story). */
var RB = (globalThis.RB = globalThis.RB || {});
(function (L) {
  'use strict';
  const C = RB.content, T = L.T;
  RB.lex.add(RB.lex.parseTable(`
ヨヘイ||name|F|Yohei (a name)
湯の花|ゆのはな|n|A|yu-no-hana, "hot-spring flowers": the mineral crust that forms round a spring's vents
採る|とる|v5r|A|to gather, to collect (plants, minerals)
短歌|たんか|n|A|tanka, a five-line poem of 5-7-5-7-7 syllables
茹でる|ゆでる|v1|I|to boil (eggs, noodles)
茹で上がる|ゆであがる|v5r|A|to be boiled through, to be done
ご容赦|ごようしゃ|n|A|(polite) pardon; ご容赦ください: please forgive us
お子様|おこさま|n|I|(polite) someone else's child, children
`));

  L.town('steamhollow', {
    name: T('Steamhollow', '{湯|ゆ}ノ{谷|たに}'),
    maps: ['yn.upper', 'yn.lower', 'yn.terraces', 'yn.kami', 'yn.kami_bath', 'yn.shimo', 'yn.shimo_bath', 'yn.dispensary', 'yn.guild', 'yn.playhouse'],
    care: ['sa_hush_down', 'postgame'],
    after: 'yn_done',
  });

  // ---- W2: routines -------------------------------------------------------------------------------------------------
  L.routine('steamhollow', 'yn_toki', { base: 'yn.upper:yn_toki', slots: [
    { map: 'yn.lower', x: 24, y: 18, dir: 'up', perform: 'tend', line: ['{下|しも} の {町|まち} の {提灯|ちょうちん} に も 、 {通|とお}り の {名前|なまえ} を {書|か}いて いる の 。 「{赤|あか}い {橋|はし} の {通|とお}り」 。 いい {名前|なまえ} でしょ 。', 'I\'m writing the street names on the lower town\'s lanterns too. "Red Bridge Street." A good name, isn\'t it.'] },
    { map: 'yn.terraces', x: 25, y: 13, dir: 'up', perform: 'tend', line: ['{棚田|たなだ} の {灯|ひ} は 、 {一番|いちばん} {最後|さいご} に {点|つ}ける の 。 ここ から {谷|たに} じゅう の {灯|ひ} が {見|み}える から 。', 'The terrace lamp, I light last of all. From here you can see every light in the valley.'] },
  ] });
  L.routine('steamhollow', 'yn_senta', { base: 'yn.upper:yn_senta', slots: [
    { map: 'yn.terraces', x: 29, y: 13, dir: 'left', line: ['{北|きた} の {道|みち} を {往復|おうふく} した {後|あと} は 、 ここ の {足湯|あしゆ} が {一番|いちばん} です 。 {町|まち} の {足湯|あしゆ} より 、 {静|しず}か で 。', 'After the north road there and back, this footbath is the best. Quieter than the one in town.'] },
    { map: 'yn.shimo', x: 3, y: 4, dir: 'up', line: ['{郵便|ゆうびん} です 。 {下|しも}の{湯|ゆ} さん に は 、 {今日|きょう} も {予約|よやく} の {手紙|てがみ} が {三通|さんつう} 。 {繁盛|はんじょう} です ね 。', 'Post! Three booking letters for the Lower House again today. Business is good.'] },
  ] });
  L.routine('steamhollow', 'yn_heikichi', { base: 'yn.upper:yn_heikichi', slots: [
    { map: 'yn.lower', x: 5, y: 11, dir: 'up', line: ['{下|しも}の{湯|ゆ} の {看板|かんばん} の {塗|ぬ}り{直|なお}し だ 。 {字|じ} が {太|ふと}い と 、 {主|あるじ} が {喜|よろこ}ぶ ん で な 。', 'Repainting the Lower House\'s sign. The master likes the letters bold.'] },
    { map: 'yn.playhouse', x: 14, y: 4, dir: 'up', line: ['{一座|いちざ} の {看板|かんばん} も {頼|たの}まれた 。 {名前|なまえ} の {字|じ} は 、 {本人|ほんにん} に {確|たし}かめて から {書|か}く こと に した よ 。', 'The troupe wants a sign too. I\'ve taken to checking each name with its owner before I paint it.'] },
  ] });
  // the performers' manifest (src/content/zzz_living/00_work.js; tests/unit/perform.test.mjs): the routine's own work
  C.work = C.work || [];
  C.work.push(
    { map: 'yn.lower', id: 'yn_toki_r2', char: 'yn_toki', act: 'tend', why: 'the lamplighter, naming and trimming the lower town\'s lanterns' },
    { map: 'yn.terraces', id: 'yn_toki_r3', char: 'yn_toki', act: 'tend', why: 'the lamplighter at the terrace lamp, the last one lit' });

  // ---- W3: who can be asked after whom ---------------------------------------------------------------------------------
  L.asks('yn_onatsu');
  L.knows('yn_onatsu', { yn_tama: 'routine', yn_kihachi: 'routine', yn_heikichi: 'routine', yn_senta: 'routine', yn_toki: 'routine', yn_yoshimatsu: 'routine',
    yn_kume: 'routine', yn_kanae: 'routine', yn_bunkichi: 'routine', yn_oritsu: 'routine', yn_tahei: 'routine', yn_ginnojo: 'routine',
    yn_kane: 'loose', yn_kikue: 'loose', yn_rokubei: 'loose', yn_tokuzo: 'loose', yn_okiyo: 'loose', yn_koume: 'loose', yn_shinza: 'loose', yn_oshige: 'loose', mp_tokube: 'loose' });
  L.asks('yn_kane');
  L.knows('yn_kane', { yn_tahei: 'routine', yn_senta: 'routine', yn_kikue: 'routine', yn_toki: 'routine', yn_onatsu: 'routine',
    yn_oritsu: 'loose', yn_rokubei: 'loose', yn_heikichi: 'loose', yn_bunkichi: 'loose', yn_tama: 'loose', yn_okiyo: 'loose' });
  L.asks('yn_tama');
  L.knows('yn_tama', { yn_heikichi: 'routine', yn_kihachi: 'routine', yn_toki: 'routine', yn_senta: 'routine', yn_bunkichi: 'routine',
    yn_onatsu: 'loose', yn_rokubei: 'loose', yn_kanae: 'loose', yn_okiyo: 'loose', yn_tokuzo: 'loose', yn_oshige: 'loose', yn_kume: 'loose' });
  L.asks('yn_tokuzo');
  L.cold('yn_tokuzo', ['{申|もう}し{訳|わけ} ございません 、 {帳場|ちょうば} が {立|た}て{込|こ}んで おりまして …… 。 お{客様|きゃくさま} の ご{様子|ようす} は 、 {申|もう}し{上|あ}げられません 。', 'I do beg your pardon, the front desk is rather busy just now… And I\'m afraid I can\'t speak of our guests\' comings and goings.']);
  L.usual('yn_tama', ['タマ さん は 、 {上|かみ} の {町|まち} の {蒸|む}し{場|ば} で {卵|たまご} を {売|う}って います よ 。', 'Tama sells eggs at the steam box in the upper town.']);
  L.usual('yn_kihachi', ['キハチ さん は 、 {上|かみ} の {町|まち} の {下駄|げた} の {店|みせ} です 。', 'Kihachi\'s at the geta stall in the upper town.']);
  L.usual('yn_kume', ['クメ さん は 、 {上|かみ} の {町|まち} の {通|とお}り で 、 {婚礼|こんれい} の {話|はなし} を して います よ 。', 'Kume\'s out on the upper town\'s street, talking weddings.']);
  L.usual('yn_yoshimatsu', ['ヨシマツ さん は 、 {下|しも} の {町|まち} の {赤|あか}い {橋|はし} の {近|ちか}く に います 。', 'Yoshimatsu\'s in the lower town, near the red bridge.']);
  L.usual('yn_kanae', ['カナエ さん は 、 {棚田|たなだ} の {足湯|あしゆ} に {足|あし} を {入|い}れて います 。 いつも です 。', 'Kanae sits with her feet in the terrace footbath. Always.']);
  L.usual('yn_bunkichi', ['ブンキチ さん は 、 {上|かみ} の {町|まち} の {通|とお}り で お{客|きゃく} を {待|ま}って います 。', 'Bunkichi waits for customers on the upper town\'s street.']);
  L.usual('yn_oritsu', ['{上|かみ}の{湯|ゆ} の {女将|おかみ} は 、 {宿|やど} の {中|なか} に います よ 。', 'The proprietress of the Upper House is inside her inn.']);
  L.usual('yn_tahei', ['{下|しも}の{湯|ゆ} の {主|あるじ} は 、 {帳場|ちょうば} で {大|おお}きな {声|こえ} を {出|だ}して います 。', 'The master of the Lower House is at his front desk, being loud.']);
  L.usual('yn_kikue', ['キクエ さん は 、 {下|しも} の {町|まち} の {薬処|くすりどころ} です 。', 'Kikue\'s at her dispensary in the lower town.']);
  L.usual('yn_onatsu', ['オナツ さん は 、 {赤|あか}い {橋|はし} の {近|ちか}く の {土産|みやげ} の {店|みせ} です 。', 'Onatsu keeps the souvenir stall near the red bridge.']);
  L.usual('yn_ginnojo', ['ギンノジョウ さん は 、 {芝居|しばい}{小屋|ごや} で {昔|むかし} の {話|はなし} を して います よ 。', 'Ginnojō is at the little theatre, telling old stories.']);
  L.usual('yn_rokubei', ['ロクベエ さん は 、 {湯守|ゆもり} の {寄合所|よりあいじょ} です 。', 'Rokubei\'s at the bath-keepers\' hall.']);
  L.usual('yn_tokuzo', ['トクゾウ さん は 、 {上|かみ}の{湯|ゆ} の {帳場|ちょうば} で {走|はし}り{回|まわ}って います 。', 'Tokuzō is running about at the Upper House\'s front desk.']);

  // ---- W1: change beats -------------------------------------------------------------------------------------------
  // already there: the chapter's own end
  L.beat('steamhollow', { id: 'north_road', when: 'yn_done', en: 'The north road open', jp: '{北|きた} の {道|みち}' });
  // added: the twelfth chapter, and after it
  L.beat('steamhollow', { id: 'ridge', when: 'sa_hush_down', en: 'Replies come down from the ridge villages', jp: '{尾根|おね} から の {返事|へんじ}' });
  L.beat('steamhollow', { id: 'mountain', when: 'postgame', en: 'News of the mountain\'s archive at Onatsu\'s stall', jp: '{山|やま} の {書庫|しょこ} の {話|はなし}' });
  C.maps['yn.upper'].props.push({ p: 'fw_postnote', x: 16, y: 11, if: 'beat.steamhollow.ridge', scene: 'yn.lw_ridge_letter_post' });
  C.maps['yn.lower'].props.push({ p: 'laundry', x: 12, y: 12, if: 'beat.steamhollow.mountain', scene: 'yn.lw_onatsu_towels_post' });
  L.talk('yn.upper:yn_senta', [{ if: 'beat.steamhollow.ridge&!seen.yn.lw_senta_ridge_post', scene: 'yn.lw_senta_ridge_post' }]);
  L.talk('yn.lower:yn_onatsu', [{ if: 'beat.steamhollow.mountain&!seen.yn.lw_onatsu_mountain_post', scene: 'yn.lw_onatsu_mountain_post' }]);

  // ---- W5: the Steaming Slope ---------------------------------------------------------------------------------------
  // a yu-no-hana gatherer who works the slope's vents (a road's own face)
  C.chars.lw_yohei = { name: T('Yohei', 'ヨヘイ'), voice: { pitch: 0.86 },
    look: { skin: 3, hair: 'shaved', hairColor: 1, cloth: ['#8a7a5a', '#6a5c42', '#e8dcc0'], shape: 'tunic', acc: ['headband', 'basket'], bandCol: '#e8e0cc' },
    portrait: { eyes: 'round', style: 'shaved', acc: ['headband'], bandCol: '#e8e0cc', bg: '#3a3428' } };
  C.maps['yn.descent'].npcs.push({ id: 'lw_yohei', x: 9, y: 6, dir: 'left', if: '!lw_yn_descent_done', talk: 'yn.lw_road_descent_yunohana' });
  C.maps['yn.descent'].props.push({ p: 'sign', x: 7, y: 7, scene: 'yn.lw_descent_board' });
  L.road('yn_descent', { maps: ['yn.descent'],
    // each stands where it happens (RE-1): Yohei already stands at his vent by the bath-keepers' board (above), so his
    // event adds only his basket at its rim; the egg pool beside the vent below the second bend, a traveller reaching in;
    // the bath rules posted near the town end, a first-timer before them; the family at the viewing bench with the guide
    unique: { id: 'yunohana', scene: 'yn.lw_road_descent_yunohana', at: { props: [{ p: 'ko_basket', x: 9, y: 7, meet: true }] } },
    variants: [
      { id: 'eggs', scene: 'yn.lw_road_descent_eggs', at: { who: [{ char: 'lw_rd_traveller2', x: 17, y: 12, dir: 'left' }], props: [{ p: 'yn_pool', x: 15, y: 12, meet: true }] } },
      { id: 'manners', scene: 'yn.lw_road_descent_manners', at: { who: [{ char: 'lw_rd_traveller', x: 25, y: 22, dir: 'up' }], props: [{ p: 'noticeboard', x: 24, y: 21, meet: true }] } },
      { id: 'inns', scene: 'yn.lw_road_descent_inns', at: { who: [{ char: 'lw_rd_parent', x: 16, y: 9, dir: 'left' }, { char: 'lw_rd_child', x: 13, y: 9, dir: 'right' }, { char: 'lw_rd_child2', x: 17, y: 9, dir: 'down' }] } },
    ],
    stamp: { title: ['{湯煙|ゆけむり} の {坂|さか}', 'the Steaming Slope'], motif: 'path', ink: '#8a4a2a' } });
  C.notes.lw_yunohana = { title: T('Yu-no-hana', '{湯|ゆ}の{花|はな}'), fiction: false,
    jp: '「{湯|ゆ}の{花|はな}」 は 、 {温泉|おんせん} の {湧|わ}く {穴|あな} の {周|まわ}り に できる 、 {白|しろ}い {粉|こな} の よう な もの 。 {温泉|おんせん} の {町|まち} で は 、 これ を {集|あつ}めて 、 {家|いえ} の {風呂|ふろ} に {入|い}れる {土産|みやげ} に する 。',
    en: 'Yu-no-hana, "hot-spring flowers", are the white or yellowish mineral crusts that form round a spring\'s vents. Real spring towns gather them and sell them as bath powder, so visitors can take a little of the spring home.' };
  const ch = (o) => Object.assign({ kind: 'choose' }, o);
  const o = (jp, ok, why) => Object.assign({ jp, ok: !!ok }, why ? { why: { en: why } } : {});
  C.challenges['yn.lw_yunohana'] = { title: T('The bath-keepers\' board', '{湯守|ゆもり} の {札|ふだ}'), tiers: {
    F: [ch({ item: 'v:待つ', ctx: { jp: 'ふだ ： 「ゆげ が しろくて こい とき は 、 あな に ちかづかないで ください 。 ゆげ が うすく なったら 、 とって も いい です 。」 （いま 、 ゆげ は しろくて こい 。）', en: '' }, prompt: { en: 'The steam is thick and white right now. What should Yohei do?' }, options: [o('ゆげ が うすく なる まで まつ', 1), o('すぐ に とる', 0, 'こい とき は ちかづかないで: keep away while it is thick.'), o('あな に ちかづく', 0, 'ちかづかないで ください: please do not go near.')] })],
    E: [ch({ item: 'g:v_naide_kudasai', ctx: { jp: '{札|ふだ} ： 「{湯気|ゆげ} が {白|しろ}くて {濃|こ}い {時|とき} は 、 {穴|あな} に {近|ちか}づかないで ください 。 {薄|うす}く なったら 、 {取|と}って も いい です 。」', en: '' }, prompt: { en: 'When may Yohei gather the yu-no-hana?' }, options: [o('{湯気|ゆげ} が {薄|うす}く なったら', 1), o('{湯気|ゆげ} が {白|しろ}くて {濃|こ}い {時|とき}', 0, 'That is when the board says to keep away (近づかないでください).'), o('{穴|あな} に {近|ちか}づいて から', 0, 'The board asks you not to go near while the steam is thick.')] })],
    I: [ch({ item: 'g:cond_to', ctx: { jp: '{札|ふだ} ： 「{湯気|ゆげ} の {色|いろ} が {黄色|きいろ}く なったら 、 すぐ {離|はな}れる こと 。 {硫黄|いおう} の {匂|にお}い が {強|つよ}く なる と 、 {息|いき} が {苦|くる}しく なる 。」', en: '' }, prompt: { en: 'The steam turns yellowish. What should you do, and why?' }, options: [o('すぐ {離|はな}れる 。 {匂|にお}い が {強|つよ}く なる と 、 {息|いき} が {苦|くる}しく なる から', 1), o('{色|いろ} が {戻|もど}る まで 、 {穴|あな} の そば で {待|ま}つ', 0, 'すぐ 離れる こと: move away at once.'), o('{匂|にお}い が {強|つよ}く なったら 、 {近|ちか}づいて {取|と}る', 0, '〜と: whenever the smell gets strong, breathing gets hard. No time to go closer.')] })],
    A: [ch({ item: 'g:kr_classical', ctx: { jp: '{古|ふる}い {札|ふだ} ： 「{湯|ゆ}の{花|はな} 、 {採|と}る べからず 。 {但|ただ}し 、 {湯守|ゆもり} の {許|ゆる}し ある {者|もの} は 、 この {限|かぎ}り に あらず 。」 ヨヘイ ： 「{許|ゆる}し の {札|ふだ} なら 、 {腰|こし} に {下|さ}げて いる よ 。」', en: '' }, prompt: { en: 'An older line on the board (classical, optional). May Yohei gather at all?' }, options: [o('はい 。 {湯守|ゆもり} の {許|ゆる}し が ある {人|ひと} は 、 {採|と}って も いい', 1), o('いいえ 。 {誰|だれ} も {採|と}って は いけない', 0, '但し…この限りにあらず: "except" those with the bath-keepers\' leave, and Yohei has it.'), o('{湯守|ゆもり} だけ が {採|と}れる', 0, 'Anyone with their leave may: 許しある者.')] })],
  } };
  C.challenges['yn.lw_eggs'] = { title: T('The tag on the eggs', '{卵|たまご} の {札|ふだ}'), tiers: {
    F: [ch({ item: 'v:触る', ctx: { jp: 'き の ふだ ： 「タマ の たまご 。 さわらないで ください 。」', en: '' }, prompt: { en: 'A traveller reaches for an egg. What does the tag ask?' }, options: [o('さわらないで', 1), o('ひとつ どうぞ', 0, 'さわらないで ください: please don\'t touch.')] })],
    E: [ch({ item: 'g:v_naide_kudasai', ctx: { jp: '{木|き} の {札|ふだ} ： 「タマ の {卵|たまご} 。 {十分|じゅっぷん} {茹|ゆ}でて います 。 {触|さわ}らないで ください 。」', en: '' }, prompt: { en: 'Whose eggs are these, and what does the tag ask?' }, options: [o('タマ さん の {卵|たまご} 。 {触|さわ}らないで ほしい', 1), o('{誰|だれ} の でも ない 。 {自由|じゆう} に {取|と}って いい', 0, 'タマ の 卵: they are Tama\'s.'), o('タマ さん の {卵|たまご} 。 {十個|じゅっこ} {取|と}って いい', 0, '十分 is ten minutes (じゅっぷん), not ten eggs.')] })],
    I: [ch({ item: 'g:prt_kara_made', ctx: { jp: '{札|ふだ} の {裏|うら} ： 「{茹|ゆ}で{上|あ}がる まで 、 {触|さわ}らないで ください 。 {欲|ほ}しい {方|かた} は 、 {上|かみ} の {町|まち} の {蒸|む}し{場|ば} で どうぞ 。」', en: '' }, prompt: { en: 'The traveller wants an egg. What does the back of the tag suggest?' }, options: [o('{上|かみ} の {町|まち} の {蒸|む}し{場|ば} で {買|か}う', 1), o('{茹|ゆ}で{上|あ}がったら 、 ここ から {取|と}る', 0, 'Those who want one are sent to the steam box in the upper town.'), o('{明日|あした} まで {待|ま}つ', 0, 'まで goes with 茹で上がる: until they are cooked. Nothing about tomorrow.')] })],
    A: [ch({ item: 'g:keigo_kenjo', ctx: { jp: '{札|ふだ} の {隅|すみ} ： 「お{一|ひと}つ {差|さ}し{上|あ}げたい ところ です が 、 {数|かず} が {決|き}まって おります 。 ご{容赦|ようしゃ} ください 。」', en: '' }, prompt: { en: 'What is the tag\'s corner politely saying?' }, options: [o('あげたい けれど 、 {数|かず} が {決|き}まって いる ので 、 あげられない', 1), o('{一|ひと}つ なら 、 あげる', 0, '〜たいところですが: "I would like to, but…". It is a polite no.'), o('{数|かず} を {数|かぞ}えて ほしい', 0, '数が決まっております: the number is fixed (they are all spoken for).')] })],
  } };
  C.challenges['yn.lw_manners'] = { title: T('The bath rules', '{湯|ゆ} の {決|き}まり'), tiers: {
    F: [ch({ item: 'v:入れる', ctx: { jp: 'はりがみ ： 「ゆぶね に てぬぐい を いれないで ください 。」', en: '' }, prompt: { en: 'May the traveller take their towel into the bath water?' }, options: [o('いいえ 。 いれないで', 1), o('はい 。 いれて も いい', 0, 'いれないで ください: please don\'t put it in.')] })],
    E: [ch({ item: 'g:v_te_kara', ctx: { jp: '{張|は}り{紙|がみ} ： 「{体|からだ} を {洗|あら}って から 、 {湯船|ゆぶね} に {入|はい}って ください 。 {手拭|てぬぐ}い は 、 {頭|あたま} に {載|の}せて ください 。」', en: '' }, prompt: { en: 'What does the traveller do first, and where does the towel go?' }, options: [o('{体|からだ} を {洗|あら}って から {入|はい}る 。 {手拭|てぬぐ}い は {頭|あたま} に', 1), o('{入|はい}って から {体|からだ} を {洗|あら}う', 0, '洗ってから入る: wash first, then get in.'), o('{手拭|てぬぐ}い で {湯船|ゆぶね} を {洗|あら}う', 0, 'The towel goes on your head (頭に載せる).')] })],
    I: [ch({ item: 'g:v_temo_ii', ctx: { jp: '{張|は}り{紙|がみ} ： 「{湯船|ゆぶね} で {泳|およ}いで は いけません 。 {髪|かみ} の {長|なが}い {方|かた} は 、 {結|むす}んで から {入|はい}って ください 。」', en: '' }, prompt: { en: 'Which of these does the notice allow?' }, options: [o('{髪|かみ} を {結|むす}んで から {入|はい}る', 1), o('{湯船|ゆぶね} で {泳|およ}ぐ', 0, '泳いではいけません: no swimming.'), o('{長|なが}い {髪|かみ} を {湯|ゆ} に {入|い}れる', 0, 'Long hair is to be tied up first (結んでから).')] })],
    A: [ch({ item: 'g:yn_omotenashi', ctx: { jp: '{張|は}り{紙|がみ} の {下|した} ： 「{初|はじ}めて の お{客様|きゃくさま} は 、 ご{遠慮|えんりょ} なく {仲居|なかい} に お{尋|たず}ね ください 。 {湯|ゆ} の {決|き}まり を 、 {丁寧|ていねい} に ご{案内|あんない} いたします 。」', en: '' }, prompt: { en: 'What does the line at the bottom offer a first-time guest?' }, options: [o('{遠慮|えんりょ} せず に {仲居|なかい} に {聞|き}けば 、 {決|き}まり を {教|おし}えて くれる', 1), o('{初|はじ}めて の {客|きゃく} は 、 {入|はい}れない', 0, 'ご遠慮なく: don\'t hold back. It invites questions.'), o('{仲居|なかい} に {案内|あんない} を {頼|たの}んで は いけない', 0, 'お尋ねください / ご案内いたします: please ask; we will show you.')] })],
  } };
  C.challenges['yn.lw_inns'] = { title: T('The inn guide', '{宿|やど} の {案内|あんない}'), tiers: {
    F: [ch({ item: 'v:子供', ctx: { jp: 'やど の あんない ： 「かみのゆ は しずか 。 しものゆ は にぎやか 。 こども と いっしょ なら 、 しものゆ が いい です よ 。」', en: '' }, prompt: { en: 'The family has two small children. Which inn does the guide suggest?' }, options: [o('しものゆ', 1), o('かみのゆ', 0, 'こども と いっしょ なら 、 しものゆ: with children, the Lower House.')] })],
    E: [ch({ item: 'g:comp_yori_hou', ctx: { jp: '{宿|やど} の {案内|あんない} ： 「{上|かみ}の{湯|ゆ} は 、 {下|しも}の{湯|ゆ} より {静|しず}か です 。 {下|しも}の{湯|ゆ} の {方|ほう} が {賑|にぎ}やか で 、 {子供|こども} に {人気|にんき} が あります 。」', en: '' }, prompt: { en: 'Which inn is quieter, and which do children like?' }, options: [o('{上|かみ}の{湯|ゆ} が {静|しず}か 。 {子供|こども} に は {下|しも}の{湯|ゆ}', 1), o('{下|しも}の{湯|ゆ} が {静|しず}か 。 {子供|こども} に は {上|かみ}の{湯|ゆ}', 0, '上の湯 は 下の湯 より 静か: the Upper House is the quieter one.'), o('どちら も {同|おな}じ', 0, 'より and の方が compare them: they differ.')] })],
    I: [ch({ item: 'g:conj_node', ctx: { jp: '{宿|やど} の {案内|あんない} ： 「{上|かみ}の{湯|ゆ} は {決|き}まり が {多|おお}い ので 、 {静|しず}か に {休|やす}みたい {方|かた} に 。 {下|しも}の{湯|ゆ} は {決|き}まり が {少|すく}ない ので 、 {子供|こども} {連|づ}れ でも {気楽|きらく} です 。」', en: '' }, prompt: { en: 'Why does the guide suit the Lower House to families?' }, options: [o('{決|き}まり が {少|すく}ない ので 、 {気楽|きらく} だ から', 1), o('{決|き}まり が {多|おお}い ので 、 {安心|あんしん} だ から', 0, 'That is the Upper House, for those who want quiet.'), o('{部屋|へや} が {広|ひろ}い ので', 0, 'The guide gives the rules as the reason (ので).')] })],
    A: [ch({ item: 'g:keigo_kenjo', ctx: { jp: '{宿|やど} の {案内|あんない} ： 「どちら も {良|よ}い お{宿|やど} で ございます が 、 お{子様|こさま} {連|づ}れ でしたら 、 {下|しも}の{湯|ゆ} の {方|ほう} が {気楽|きらく} に お{過|す}ごし いただける か と {存|ぞん}じます 。」', en: '' }, prompt: { en: 'How strongly does the guide recommend the Lower House?' }, options: [o('{控|ひか}えめ に すすめて いる 。 「〜か と {存|ぞん}じます」 は 、 {丁寧|ていねい} な 「{思|おも}います」', 1), o('{上|かみ}の{湯|ゆ} は {悪|わる}い 、 と {言|い}って いる', 0, 'どちらも良いお宿: both are good inns.'), o('{下|しも}の{湯|ゆ} に {泊|と}まらなければ ならない', 0, '〜かと存じます is a soft, humble "I think", not an order.')] })],
  } };

  // ---- W6: return keys (the twelfth chapter and after) ----------------------------------------------------------------
  L.seal('yn_ridgebell', { map: 'yn.upper', x: 17, y: 2, p: 'sb_bellpost', needs: 'sa_hush_down', opens: 'lw_yn_bell_rung', scene: 'yn.lw_bell_open_post',
    hint: ['{古|ふる}い {鐘|かね} 。 {尾根|おね} の {村|むら} へ {合図|あいず} を {送|おく}る ため の もの らしい 。 {打|う}って も 、 {音|おと} が {上|うえ} へ {届|とど}かない 。 {山|やま} の {静|しず}けさ が 、 {音|おと} を {吸|す}って しまう よう だ 。', 'An old bell, for signalling to the ridge villages, it seems. Strike it, and the sound never climbs. The mountain\'s silence seems to swallow it.'],
    openedLabel: ['{尾根|おね} へ の {鐘|かね}', 'The ridge bell, answered'], after: { p: 'sb_bellpost', scene: 'yn.lw_bell_after_post' } });
  L.seal('yn_springhouse', { map: 'yn.lower', x: 37, y: 23, p: 'yn_steamwall', needs: 'gd.yn', opens: 'lw_yn_spring_open', scene: 'yn.lw_spring_open_post',
    hint: ['{泉|いずみ} の {小屋|こや} の {戸|と} 。 {隙間|すきま} から {熱|あつ}い {湯気|ゆげ} が {吹|ふ}き{出|だ}して いて 、 {近|ちか}づけない 。 {谷|たに} の {底|そこ} で 、 {何|なに} か が まだ {寝返|ねがえ}り を {打|う}って いる よう だ 。', 'The spring house door. Scalding steam blasts from every crack; you can\'t get near. Deep under the valley, something still seems to be turning in its sleep.'],
    openedLabel: ['{泉|いずみ} の {小屋|こや}', 'The spring house, open'], after: { p: 'yn_steam', scene: 'yn.lw_spring_after_post' } });
  L.seal('yn_poemstone', { map: 'yn.terraces', x: 30, y: 14, p: 'stone_marker', needs: 'postgame', opens: 'lw_yn_poem_done', scene: 'yn.lw_poem_open_post',
    hint: ['{足湯|あしゆ} の {横|よこ} の {石|いし} に 、 {短|みじか}い {歌|うた} が {彫|ほ}って ある 。 {最後|さいご} の {一行|いちぎょう} だけ 、 {空|あ}いて いる 。 {添|そ}え{書|が}き ： 「{山|やま} から {帰|かえ}った {人|ひと} が 、 {書|か}き{足|た}す こと」 。', 'A short poem is carved on the stone beside the footbath, its last line left blank. A note beside it: "To be added by whoever comes back from the mountain."'],
    openedLabel: ['{足湯|あしゆ} の {歌|うた} の {石|いし}', 'The poem stone, finished'], after: { p: 'stone_marker', scene: 'yn.lw_poem_after_post' } });
  L.talk('yn.kami:yn_oshige', [{ if: 'lw_yn_bell_rung&!seen.yn.lw_oshige_bell_post', scene: 'yn.lw_oshige_bell_post' }]);
  L.talk('yn.guild:yn_rokubei', [{ if: 'lw_yn_spring_open&!seen.yn.lw_rokubei_spring_post', scene: 'yn.lw_rokubei_spring_post' }]);
  C.notes.lw_yn_ridgebell = { title: T('The ridge bell', '{尾根|おね} へ の {鐘|かね}'), fiction: true,
    jp: '{尾根|おね} の {村|むら} と {谷|たに} は 、 {昔|むかし} から {鐘|かね} で {合図|あいず} を {送|おく}り{合|あ}って いた 。 {山|やま} の {静|しず}けさ が ほどけて 、 {鐘|かね} の {音|おと} が また {届|とど}く よう に なった 。',
    en: 'The ridge villages and the valley have long signalled to each other with bells. With the mountain\'s silence lifted, the bells carry again.' };
  C.notes.lw_yn_springhouse = { title: T('The spring house', '{泉|いずみ} の {小屋|こや}'), fiction: true,
    jp: '{湯|ゆ}ノ{谷|たに} の {湯|ゆ} が {最初|さいしょ} に {湧|わ}いた {場所|ばしょ} に は 、 {石|いし} の {湯船|ゆぶね} が ある 。 {縁|ふち} に は 、 {代々|だいだい} の {湯守|ゆもり} の {名前|なまえ} が {刻|きざ}んで ある 。 {一番|いちばん} {新|あたら}しい の は 、 ロクベエ 。',
    en: 'Where Steamhollow\'s spring first rose there is a stone basin, its rim carved with the names of the bath-keepers, generation after generation. The newest is Rokubei\'s.' };
  C.notes.lw_yn_poemstone = { title: T('The poem stone', '{歌|うた} の {石|いし}'), fiction: true,
    jp: '{短歌|たんか} は 、 {五|ご} ・ {七|しち} ・ {五|ご} ・ {七|しち} ・ {七|しち} の {音|おと} で {作|つく}る {日本|にほん} の {歌|うた} 。 {棚田|たなだ} の {石|いし} の {歌|うた} は 、 {最後|さいご} の {七|しち} {音|おん} が {空|あ}いて いた 。',
    en: 'A tanka is a real Japanese poem form of five lines, 5-7-5-7-7 syllables. The terraces\' stone poem, waiting years for its last seven, is the game\'s.' };

  L.scenes(`
@scene yn.lw_road_descent_yunohana
# Road event (W5): the Steaming Slope's own, the first time you walk it: a yu-no-hana gatherer who can't read the
# bath-keepers' board through the steam
!look lw_yohei pc
lw_yohei: おーい 、 {旅|たび} の {人|ひと} ！ ちょうど いい ところ に 。 || Hey there, travellers! Just in time.
lw_yohei: {湯|ゆ}の{花|はな} を {取|と}って いる ん だ が 、 {湯気|ゆげ} が {目|め} に しみて 、 {札|ふだ} が {読|よ}めない 。 {湯守|ゆもり} の {決|き}まり が {書|か}いて ある ん だ 。 {読|よ}んで くれない か 。 || I gather yu-no-hana, the spring's white crust, but the steam's got in my eyes and I can't read the board. It's the bath-keepers' rules. Would you read it for me?
!challenge yn.lw_yunohana
!if var._res=0 -> later
narr: {札|ふだ} の {通|とお}り 、 {湯気|ゆげ} が {薄|うす}く なる まで {待|ま}った 。 ヨヘイ は {穴|あな} の {縁|ふち} から 、 {白|しろ}い {粉|こな} を {丁寧|ていねい} に {集|あつ}めた 。 || As the board says, you wait for the steam to thin. Yohei carefully gathers the white crust from the rim of the vent.
lw_yohei[laugh]: {助|たす}かった ！ {決|き}まり を {守|まも}れば 、 {湯|ゆ}の{花|はな} は {逃|に}げない 。 {谷|たに} の {宿|やど} の {風呂|ふろ} に も 、 これ が {入|はい}って いる ん だ よ 。 || That's a help! Keep the rules and the yu-no-hana won't run off. This goes into the inns' baths down in the valley, you know.
?(comp=mio&!yn_apart) comp[smile]: {湯|ゆ}の{花|はな} 。 {薬師|くすし} の {間|あいだ} で も 、 {肌|はだ} に いい と {言|い}われて います 。 || Yu-no-hana. Apothecaries say it's good for the skin, too.
?(comp=nao&!yn_apart) comp: {札|ふだ} は 、 {読|よ}める {人|ひと} が {通|とお}る まで {待|ま}って いる 。 {手紙|てがみ} と {同|おな}じ だ 。 || A board waits for someone who can read it to come by. Same as a letter.
!note lw_yunohana
!set lw_yn_descent_done
!hook road_done yn_descent yunohana
!refresh
!end
:later
lw_yohei: {急|いそ}がない よ 。 {湯気|ゆげ} は {逃|に}げない から な 。 また {通|とお}ったら 、 {頼|たの}む 。 || No rush. The steam isn't going anywhere. Next time you're passing, then.

@scene yn.lw_descent_board
narr: {湯守|ゆもり} の {札|ふだ} 。 「{湯気|ゆげ} が {白|しろ}くて {濃|こ}い {時|とき} は 、 {穴|あな} に {近|ちか}づかないで ください 。 {薄|うす}く なったら 、 {取|と}って も いい です 。」 || The bath-keepers' board: "When the steam is thick and white, please keep away from the vent. Once it thins, you may gather."

@scene yn.lw_road_descent_eggs
# Road event (W5, a variant): eggs cooking in a vent pool by the path, and a traveller's hand
narr: {道|みち} の {脇|わき} の {湯|ゆ} の {溜|た}まり に 、 {卵|たまご} の {入|はい}った {網|あみ} が {沈|しず}めて ある 。 {木|き} の {札|ふだ} が {下|さ}がって いる 。 || In a pool of hot water beside the path, a net of eggs has been sunk to cook, a wooden tag hanging from it.
narr: {通|とお}りがかり の {旅人|たびびと} が 、 {手|て} を {伸|の}ばした 。 「{一|ひと}つ ぐらい 、 いい だろう 」 。 || A passing traveller reaches for one. "Surely one won't hurt."
!challenge yn.lw_eggs
!if var._res=0 -> later
narr: {札|ふだ} を {読|よ}んで {聞|き}かせる と 、 {旅人|たびびと} は {手|て} を {引|ひ}っ{込|こ}めた 。 「タマ さん の か 。 {町|まち} の {蒸|む}し{場|ば} で {買|か}おう 。」 || You read the tag out, and the traveller draws back. "Tama's, is it? I'll buy one at the steam box in town."
!hook road_done yn_descent eggs
!end
:later
narr: {旅人|たびびと} は {卵|たまご} を {一|ひと}つ {掴|つか}んで 、 {熱|あつ}さ に {飛|と}び{上|あ}がった 。 || The traveller grabs an egg and jumps at the heat.

@scene yn.lw_road_descent_manners
# Road event (W5, a variant): a first-timer puzzling over the bath rules
narr: {初|はじ}めて {湯|ゆ}ノ{谷|たに} へ {行|い}く と いう {旅人|たびびと} が 、 {湯|ゆ} の {決|き}まり の {張|は}り{紙|がみ} の {前|まえ} で {首|くび} を かしげて いる 。 || A traveller on their way to Steamhollow for the first time is puzzling over a notice of the bath rules.
narr: 「{湯|ゆ} の {決|き}まり 、 {読|よ}める かい ？ {手拭|てぬぐ}い は 、 {湯|ゆ} に {入|い}れて も いい の か な 。」 || "Can you read these bath rules? Can I take my towel in the water, I wonder?"
!challenge yn.lw_manners
!if var._res=0 -> later
narr: {決|き}まり を {一|ひと}つ ずつ {説明|せつめい} する と 、 {旅人|たびびと} は {手拭|てぬぐ}い を {頭|あたま} に {載|の}せて {笑|わら}った 。 「{先|さき} に {聞|き}いて よかった 。」 || You go through the rules one by one, and the traveller pops the towel on their head and laughs. "Glad I asked first."
!hook road_done yn_descent manners
!end
:later
narr: {旅人|たびびと} は {張|は}り{紙|がみ} を もう {一度|いちど} {眺|なが}めて 、 {首|くび} を かしげた まま {坂|さか} を {下|お}りて いった 。 || The traveller looks at the notice once more and heads down the slope, still puzzled.

@scene yn.lw_road_descent_inns
# Road event (W5, a variant): a family choosing between the two houses
narr: {子供|こども} を {二人|ふたり} {連|つ}れた {旅|たび} の {家族|かぞく} が 、 {宿|やど} の {案内|あんない} を {広|ひろ}げて {迷|まよ}って いる 。 || A travelling family with two small children has spread out an inn guide and can't decide.
narr: 「{上|かみ}の{湯|ゆ} と {下|しも}の{湯|ゆ} 、 どっち が いい の かしら 。」 || "The Upper House or the Lower House: which would be better, I wonder?"
!challenge yn.lw_inns
!if var._res=0 -> later
narr: {案内|あんない} を {読|よ}んで {教|おし}える と 、 {子供|こども} たち が {跳|は}ねた 。 「{下|しも}の{湯|ゆ} ！ {賑|にぎ}やか な {方|ほう} ！」 || You read them the guide, and the children jump up and down. "The Lower House! The noisy one!"
!hook road_done yn_descent inns
!end
:later
narr: {家族|かぞく} は {案内|あんない} を {畳|たた}んで 、 「{下|した} で {聞|き}いて みよう 」 と {坂|さか} を {下|お}りて いった 。 || The family fold up the guide. "We'll ask down there," and off they go down the slope.

@scene yn.lw_ridge_letter_post
narr: {掲示板|けいじばん} の {横|よこ} に 、 {尾根|おね} の {村|むら} から の {手紙|てがみ} が {貼|は}って ある 。 「{声|こえ} が {届|とど}く よう に なりました 。 {鳥|とり} も {鳴|な}いて います 。 {谷|たに} の {皆|みな}さん 、 ありがとう 。」 || Beside the board, a letter from the ridge villages is pinned up: "Our voices carry again. The birds are singing. Thank you, everyone in the valley."

@scene yn.lw_senta_ridge_post
!faceplayer
yn_senta: {尾根|おね} の {村|むら} から 、 {返事|へんじ} が {束|たば} で {来|く}る よう に なりました ！ {鞄|かばん} が {重|おも}くて 、 {足|あし} が {痛|いた}い 。 …… うれしい {痛|いた}さ です 。 || Replies come down from the ridge villages in bundles now! My bag's heavy and my feet hurt. …A happy sort of hurt.
?(comp=nao) comp[smile]: {重|おも}い {鞄|かばん} は 、 いい {鞄|かばん} だ 。 || A heavy bag is a good bag.

@scene yn.lw_onatsu_mountain_post
!faceplayer
yn_onatsu: {聞|き}いた わ よ ！ {北|きた} の {山|やま} の {上|うえ} の 、 {大|おお}きな {書庫|しょこ} の {話|はなし} ！ || I heard! About the great archive up on the north mountain!
?(end_archive_library) yn_onatsu: {誰|だれ} でも {読|よ}める {図書館|としょかん} に なった んだって ？ {谷|たに} の {子供|こども} たち 、 {字|じ} を {習|なら}い に {登|のぼ}る って {言|い}ってる わ 。 || It's a library anyone can read in now, they say? The valley children are talking about climbing up to learn their letters.
?(end_archive_closed) yn_onatsu: {扉|とびら} を {閉|と}じた んだって ね 。 …… {名前|なまえ} は 、 {口|くち} で {呼|よ}ぶ もの 。 うち の お{客|きゃく} も 、 そう {言|い}ってた わ 。 || They closed its doors, I hear. …Names are for calling out loud. My customers say so too.
yn_onatsu: {土産|みやげ} に 、 {山|やま} の {絵|え} の {手拭|てぬぐ}い を {作|つく}った の 。 {売|う}れる わ よ 。 || I've made souvenir towels with the mountain printed on them. They'll sell.

@scene yn.lw_onatsu_towels_post
narr: {土産|みやげ} の {手拭|てぬぐ}い が {干|ほ}して ある 。 {北|きた} の {山|やま} と 、 {小|ちい}さな {灯|ひ} の {絵|え} 。 「{山|やま} の {書庫|しょこ} 、 {帰|かえ}り{道|みち} の {灯|ひ}」 と {染|そ}めて ある 。 || Souvenir towels hang drying: the north mountain and a little lamp, dyed with the words "The mountain's archive; a light for the way home."

@scene yn.lw_bell_open_post
narr: {山|やま} の {上|うえ} の {静|しず}けさ は 、 もう ほどけた 。 {鐘|かね} を {打|う}つ と 、 {音|おと} が {谷|たに} を {登|のぼ}って いく 。 || The silence on the mountain has lifted. You strike the bell, and the sound climbs out of the valley.
narr: しばらく して 、 {尾根|おね} の {上|うえ} から 、 {小|ちい}さな {鐘|かね} の {音|おと} が {返|かえ}って きた 。 {一|ひと}つ 、 また {一|ひと}つ 。 || After a while, from up on the ridge, small bells answer. One, then another.
?(comp=nao) comp: {返事|へんじ} だ 。 …… {届|とど}いた な 。 || A reply. …It got there.
?(comp=mio) comp[smile]: {村|むら} の {人|ひと} たち 、 {声|こえ} が {戻|もど}った ん です ね 。 || The villagers have their voices back.
?(comp=ren) comp: {灯|ひ} の かわり に 、 {音|おと} で {道|みち} を {照|て}らす 。 {尾根|おね} の {灯守|ひもり} です ね 。 || Lighting the way with sound instead of a lamp. The ridge's own lamp-keepers.
?(comp=suzu) comp[laugh]: {拍手|はくしゅ} の {返事|へんじ} みたい 。 {客席|きゃくせき} が {戻|もど}って きた わ 。 || Like applause answering. The audience is back.
!note lw_yn_ridgebell
!refresh

@scene yn.lw_bell_after_post
narr: {尾根|おね} へ の {合図|あいず} の {鐘|かね} 。 {打|う}てば 、 {今|いま} は {上|うえ} から {返事|へんじ} が {来|く}る 。 || The signal bell for the ridge. Strike it now, and an answer comes down.

@scene yn.lw_oshige_bell_post
!faceplayer
yn_oshige: {尾根|おね} の {鐘|かね} 、 {聞|き}こえました 。 {村|むら} の {鐘|かね} です 。 …… {春|はる} に なったら 、 {帰|かえ}ろう と {思|おも}います 。 {膝|ひざ} が {許|ゆる}せば 。 || I heard the ridge bells. Our village's bell. …Come spring, I think I'll go home. If my knees allow.

@scene yn.lw_spring_open_post
narr: {谷|たに} の {底|そこ} の {釜|かま} の {母|はは} は 、 もう {静|しず}か に {眠|ねむ}って いる 。 {戸|と} の {湯気|ゆげ} が {細|ほそ}く なり 、 やがて {止|と}まった 。 || The Kettle's Mother, deep under the valley, sleeps quietly now. The steam at the door thins, and then stops.
narr: {小屋|こや} の {中|なか} に は 、 {石|いし} の {湯船|ゆぶね} が {一|ひと}つ 。 {湯|ゆ} が {最初|さいしょ} に {湧|わ}いた {場所|ばしょ} だ 。 {縁|ふち} に 、 {古|ふる}い {字|じ} で {湯守|ゆもり} たち の {名前|なまえ} が {刻|きざ}んで ある 。 || Inside: a single stone basin, where the spring first rose. Round its rim, in an old hand, the names of the bath-keepers are carved.
narr: {一番|いちばん} {新|あたら}しい {名前|なまえ} は 、 「ロクベエ」 。 その {下|した} は 、 まだ {空|あ}いて いる 。 || The newest name is "Rokubei". Below it, the stone is still blank.
?(comp=mio) comp: …… {名前|なまえ} の {下|した} の {空|あ}いた ところ 。 {次|つぎ} の {人|ひと} を {待|ま}って いる ん です ね 。 || …The blank below the names. It's waiting for the next one.
?(comp=ren) comp: {灯守|ひもり} の {記録|きろく} と {同|おな}じ です 。 {名前|なまえ} の {後|あと} に 、 {名前|なまえ} が {続|つづ}く 。 || Like a lamp-keepers' register. Name after name.
!note lw_yn_springhouse
!refresh

@scene yn.lw_spring_after_post
narr: {泉|いずみ} の {小屋|こや} 。 {石|いし} の {湯船|ゆぶね} の {縁|ふち} に 、 {湯守|ゆもり} たち の {名前|なまえ} 。 {湯気|ゆげ} は 、 {今|いま} は {穏|おだ}やか だ 。 || The spring house: the bath-keepers' names round the stone basin's rim. The steam is gentle now.

@scene yn.lw_rokubei_spring_post
!faceplayer
yn_rokubei: {泉|いずみ} の {小屋|こや} に {入|はい}った の か 。 …… {湯守|ゆもり} の {名前|なまえ} 、 {見|み}た だろう 。 {俺|おれ} の {下|した} に は 、 アキ の {名前|なまえ} を {彫|ほ}る つもり だ 。 || You went into the spring house. …You'll have seen the keepers' names. Below mine, I mean to carve Aki's.
yn_rokubei: {本人|ほんにん} に は 、 まだ {言|い}う な よ 。 {調子|ちょうし} に {乗|の}る から な 。 || Don't tell Aki yet, mind. It'd go to that young head.

@scene yn.lw_poem_open_post
narr: {山|やま} から {帰|かえ}って きた 。 {石|いし} の {歌|うた} を 、 もう {一度|いちど} {読|よ}む 。 || You have come back from the mountain. You read the stone's poem again.
narr: 「{湯煙|ゆけむり} の 、 {谷|たに} に {呼|よ}ぶ {声|こえ} 、 {溶|と}けて ゆく 、 {山|やま} の {静|しず}けさ …… 」 。 || "Into the steam / of the valley, calling voices / melt and fade away. / The stillness of the mountain…"
narr: {空|あ}いた {最後|さいご} の {行|ぎょう} に 、 {山|やま} で {知|し}った こと を {書|か}き{足|た}した 。 「いま は {応|こた}える」 。 || In the empty last line, you add what the mountain taught you: "now it answers".
!look yn_kanae pc
yn_kanae: …… {誰|だれ} が {彫|ほ}った の か 、 {誰|だれ} も {知|し}らない {歌|うた} な の 。 {私|わたし} 、 {何年|なんねん} も {横|よこ} で {足|あし} を {浸|ひた}して 、 {最後|さいご} の {行|ぎょう} を {待|ま}って いた の よ 。 || …Nobody knows who carved that poem. I've sat beside it with my feet in the water for years, waiting for its last line.
yn_kanae: 「いま は {応|こた}える」 。 …… いい わ 。 {山|やま} の {静|しず}けさ が 、 {返事|へんじ} を する の ね 。 || "Now it answers." …That's good. The mountain's stillness, answering back.
!note lw_yn_poemstone
!refresh

@scene yn.lw_poem_after_post
narr: {足湯|あしゆ} の {横|よこ} の {歌|うた} の {石|いし} 。 {最後|さいご} の {行|ぎょう} に 、 「いま は {応|こた}える」 。 || The poem stone by the footbath. On its last line: "now it answers".
`);

  // Suzu's Kansai-ben for her lines above (src/lang/85_dialect.js; docs/dialect/suzu_kansai.md)
  RB.dialect.add('kansai', `
@ zzz_living/32_yn [yn.lw_bell_open_post]
= {拍手|はくしゅ} の {返事|へんじ} みたい 。 {客席|きゃくせき} が {戻|もど}って きた わ 。 || Like applause answering. The audience is back.
> {拍手|はくしゅ} の {返事|へんじ} みたい や 。 {客席|きゃくせき} が {戻|もど}って きた で 。 || Like applause answerin'. The audience is back.
`, 'zzz_living/32_yn.js');
})(RB.living);
