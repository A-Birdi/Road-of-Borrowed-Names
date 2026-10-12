/* The Keepers' Road's Living World (C-87; docs/future/work/LW1_AUTHORING.md, LW1_ROLLOUT.md). Two small settlements
 * are towns: the Foot of the Road with Aya's teahouse, and the Keepers' Lodge (the lodge, the caretakers' room and
 * Hisae's hut). The road between them already has the richest once-only events on land (the fallen cedar, Iwa's
 * stamp book, the moss lantern, the wanderers, the moths) and the Shuttered Hall door as a return key: those stay
 * as they are; this file registers them and adds only what comes after. From `kr_done`:
 * W2 routines: Aya (her teahouse; sweeping the front; trimming the Welcoming Light; a note on the counter while
 *   she is out), Mokichi (his shingle block; carrying shingles; planing indoors on a wet day), Fuyu (the caretakers'
 *   room; sweeping maple leaves; tidying Hisae's notebooks), Sora (the yard; topping up Hisae's lamp; copying the
 *   lodge's inscription).
 * W3 Aya (the foot), Fuyu and Mokichi (the lodge) can be asked after people; Hisae asks more than she answers, and
 *   won't say.
 * W1 beats: registered — Kotonoha's leaf home to the plate on the lantern at the pass, noticed by Aya (`ko_ret_kr`),
 *   Tsuru's reply held at the teahouse (`quest.kr_inkstone=1&kr_done`); new — Lanternfall's oil in Cinder Orchard
 *   jars at the foot, and its merchant saying no for the first time (`ch5_done`), new shingles from Lanternfall at
 *   the lodge (`ch5_done`), and Tsuru's own letter on Hisae's table (`kr_inkstone_done`).
 * W5 the road maps get variants only, each after the map's own bespoke event (registered by its done flag): the
 *   Cedar Steps after the fallen cedar (`kr_cedar_cleared`), Fox Bridge after the Fox Light is relit (`kr_l_fox`),
 *   the Maple Ridge after the moths (`kr_moths_done`), the Pass after the chapter's end (`kr_done`).
 * W6 return keys: the Shuttered Hall door, registered (its own scene, wrapped so the spot is noticed and opened
 *   through the same hook: `hall_ledger`); the stones every hundred paces to the keepers' watch-place on the ridge
 *   (ごとに); the wicks for every kind of lamp under the teahouse floor (あらゆる). */
var RB = (globalThis.RB = globalThis.RB || {});
(function (L, C) {
  'use strict';
  const T = L.T; // (en, jp)
  const TJ = (jp, en) => ({ jp, en }); // challenge titles, written Japanese first
  const ch = (o) => Object.assign({ kind: 'choose' }, o);
  const o = (jp, ok, why) => Object.assign({ jp, ok: !!ok }, why ? { why: { en: why } } : {});

  RB.lex.add(RB.lex.parseTable(`
床板|ゆかいた|n|I|a floorboard
納む|おさむ|exp|A|is stored, are kept (classical form of 納める)
イグサ||n|A|soft rush (the plant tatami and lamp wicks are made from)
見張り場|みはりば|n|I|a lookout post, a watch-place
百歩|ひゃっぽ|n|I|a hundred paces
雲海|うんかい|n|I|a sea of clouds (seen from above)
一里|いちり|n|I|one ri (an old measure of distance, about 4 km)
三里|さんり|n|I|three ri (about 12 km)
間引き|まびき|n|I|thinning out (trees, seedlings)
木屑|きくず|n|I|wood shavings
天気雨|てんきあめ|n|I|a sun shower, rain from a clear sky
突風|とっぷう|n|I|a gust of wind
十二回目|じゅうにかいめ|n|I|the twelfth time
散らかす|ちらかす|v5s|I|to scatter about, to make a mess
一人前|いちにんまえ|n|I|full-fledged, fully trained (a proper keeper, worker)
斧|おの|n|I|an axe
早起き|はやおき|n|E|getting up early; an early riser
二百十二|にひゃくじゅうに|n|I|two hundred and twelve
株|かぶ|n|I|a stump (of a felled tree)
齧る|かじる|v5r|I|to gnaw, to nibble
ぼやける||v1|I|to blur, to go fuzzy
散りて|ちりて|exp|A|having fallen, scattered (classical form of 散って)
明らか|あきらか|adj-na|I|clear, bright
散らす|ちらす|v5s|I|to scatter
`));

  // ---- the towns ----------------------------------------------------------------------------------------------------
  L.town('kr_foot', { maps: ['kr.foot', 'kr.foot_inn'], care: ['ch5_done', 'ko_ret_kr', 'cr_done'], after: 'kr_done' });
  L.town('kr_lodge', { maps: ['kr.lodge', 'kr.lodge_in', 'kr.hisae'], care: ['ch5_done', 'ko_done', 'kr_inkstone_done'], after: 'kr_done' });

  // ---- W2: routines ---------------------------------------------------------------------------------------------------
  L.routine('kr_foot', 'kr_aya', { base: 'kr.foot_inn:kr_aya', pin: 'quest.kr_inkstone&!quest.kr_inkstone=done', slots: [
    { map: 'kr.foot', x: 10, y: 9, dir: 'down', perform: 'sweep', line: ['{表|おもて} を {掃|は}いて おかない と 、 {油|あぶら} の {荷|に} が {通|とお}る とき に {滑|すべ}る の よ 。', 'If I don\'t sweep the front, the oil loads slip when they come through.'] },
    { map: 'kr.foot', x: 8, y: 11, dir: 'up', line: ['{迎|むか}え の {灯|ひ} の {芯|しん} を {切|き}る の は 、 わたし の {仕事|しごと} に なった の 。 {数|かぞ}えたら 、 {今月|こんげつ} で {十二回目|じゅうにかいめ} 。', 'Trimming the Welcoming Light\'s wick is my job now. I counted: that\'s the twelfth time this month.'] },
  ] });
  L.away('kr_foot', 'kr_aya', { map: 'kr.foot_inn', x: 2, y: 3, p: 'fw_note', line: ['{帳場|ちょうば} の {横|よこ} に {書|か}き{置|お}き 。 「{表|おもて} に います 。 {大|おお}きな {声|こえ} で {呼|よ}んで ね 。 アヤ 」', 'A note by the counter: "Out front. Call loudly. —Aya"'] });
  L.routine('kr_lodge', 'kr_mokichi', { base: 'kr.lodge:kr_mokichi', slots: [
    { map: 'kr.lodge', x: 30, y: 17, dir: 'left', perform: 'carry', line: ['{屋根|やね} の {板|いた} を {運|はこ}んで います 。 {雨漏|あまも}り と の {戦|たたか}い は 、 まだ {終|お}わりません よ 。', 'Carrying shingles. The war with the leaks isn\'t over yet.'] },
    { map: 'kr.lodge_in', x: 6, y: 4, dir: 'up', perform: 'plane', line: ['{雨|あめ} の {日|ひ} は 、 {中|なか} で {板|いた} を {削|けず}ります 。 フユ に は 「{木屑|きくず} を {散|ち}らかさないで 」 と {言|い}われます が 。', 'On wet days I shave the boards indoors. Fuyu tells me not to scatter shavings, mind.'] },
  ] });
  L.routine('kr_lodge', 'kr_fuyu', { base: 'kr.lodge_in:kr_fuyu', slots: [
    { map: 'kr.lodge', x: 8, y: 11, dir: 'down', perform: 'sweep', line: ['{落|お}ち{葉|ば} が {多|おお}くて ね 。 {掃|は}いて も {掃|は}いて も 、 {紅葉|もみじ} が {降|ふ}って くる の 。', 'So many leaves. Sweep and sweep, and the maples keep coming down.'] },
    { map: 'kr.hisae', x: 5, y: 3, dir: 'up', perform: 'sort', line: ['ヒサエ さん の {帳面|ちょうめん} 、 {放|ほう}って おく と {机|つくえ} から {溢|あふ}れる の よ 。 {順番|じゅんばん} だけ は {変|か}えないで って {言|い}われて いる けど 。', 'Hisae\'s notebooks spill off the table if you leave them. I\'m told never to change their order, though.'] },
  ] });
  L.routine('kr_lodge', 'kr_sora', { base: 'kr.lodge:kr_sora', slots: [
    { map: 'kr.lodge', x: 19, y: 8, dir: 'right', line: ['ヒサエ ばあちゃん の {灯|ひ} 、 {今|いま} は おれ が {油|あぶら} を {足|た}す ん だ 。 {半分|はんぶん} だけ 。 {多|おお}すぎる と 、 {怒|おこ}られる 。', 'I top up Granny Hisae\'s lamp now. Only halfway. Too much and I get told off.'] },
    { map: 'kr.lodge', x: 16, y: 12, dir: 'up', perform: 'read', line: ['{石|いし} の {字|じ} を {写|うつ}して いる ん だ 。 {全部|ぜんぶ} {読|よ}めたら 、 {一人前|いちにんまえ} の {灯守|ひもり} だ って 。', 'I\'m copying the letters on the stone. When I can read them all, I\'ll be a proper keeper, she says.'] },
  ] });

  // ---- W3: who can be asked after whom ------------------------------------------------------------------------------
  L.asks('kr_aya', ['kr.foot_inn', 'kr.foot']);
  L.knows('kr_aya', { kr_iwa: 'routine', kr_seiji: 'routine', kr_kumazo: 'routine', kr_hisae: 'routine', kr_mokichi: 'routine', kr_shozo: 'loose', kr_kame: 'loose', kr_fuyu: 'loose', kr_sora: 'loose', kr_juzo: 'loose', kr_kikyo: 'loose' });
  L.asks('kr_fuyu', ['kr.lodge_in', 'kr.lodge', 'kr.hisae']);
  L.knows('kr_fuyu', { kr_mokichi: 'routine', kr_sora: 'routine', kr_hisae: 'routine', kr_aya: 'loose', kr_kumazo: 'loose', kr_juzo: 'loose', kr_kikyo: 'loose', kr_iwa: 'loose' });
  L.asks('kr_mokichi', ['kr.lodge', 'kr.lodge_in']);
  L.knows('kr_mokichi', { kr_fuyu: 'routine', kr_sora: 'routine', kr_hisae: 'routine', kr_juzo: 'routine', kr_kumazo: 'loose', kr_aya: 'loose' });
  L.asks('kr_hisae', ['kr.lodge']);
  L.cold('kr_hisae', ['{人|ひと} に {聞|き}く より 、 {自分|じぶん} の {足|あし} で {探|さが}し な 。 {灯守|ひもり} は そう やって {道|みち} を {覚|おぼ}えた もん さ 。', 'Rather than ask after people, go and look on your own two feet. That\'s how keepers learned the road.']);
  L.usual('kr_aya', ['アヤ さん は {麓|ふもと} の {茶屋|ちゃや} か 、 その {表|おもて} です ね 。 {迎|むか}え の {灯|ひ} の そば に いる こと も あります 。', 'Aya? The teahouse at the foot, or out in front of it. Sometimes by the Welcoming Light.']);
  L.usual('kr_mokichi', ['モキチ さん は {宿坊|しゅくぼう} の {庭|にわ} で {板|いた} を {削|けず}って いる か 、 {運|はこ}んで いる か です 。', 'Mokichi\'s in the lodge yard, shaving shingles or carrying them.']);
  L.usual('kr_fuyu', ['フユ さん は {宿坊|しゅくぼう} の {奥|おく} の {部屋|へや} か 、 {庭|にわ} を {掃|は}いて いる か 、 ヒサエ さん の {小屋|こや} です 。', 'Fuyu? The room at the back of the lodge, or sweeping the yard, or at Hisae\'s hut.']);
  L.usual('kr_sora', ['ソラ は {宿坊|しゅくぼう} の {庭|にわ} を {走|はし}り{回|まわ}って います 。 {灯|ひ} の そば か 、 {石|いし} の {前|まえ} です 。', 'Sora\'s running about the lodge yard. By the lamp, or in front of the stone.']);
  L.usual('kr_hisae', ['ヒサエ さん は {宿坊|しゅくぼう} の {灯|ひ} の そば です 。 {夜|よる} も {昼|ひる} も 。', 'Hisae\'s by the lodge lamp. Night and day.']);
  L.usual('kr_kumazo', ['クマゾウ さん は {杉|すぎ} の {石段|いしだん} です 。 {掃除|そうじ} を して います よ 。', 'Kumazō\'s on the cedar steps, sweeping.']);
  L.usual('kr_iwa', ['イワ さん は {狐橋|きつねばし} の {里|さと} に {泊|と}まって います 。', 'Iwa\'s staying in the Fox Bridge hamlet.']);
  L.usual('kr_seiji', ['セイジ さん は {巡礼|じゅんれい} の {人|ひと} です から 、 {道|みち} の どこ か を {歩|ある}いて います よ 。', 'Seiji\'s a pilgrim: he\'ll be walking somewhere along the road.']);
  L.usual('kr_juzo', ['ジュウゾウ さん は {尾根|おね} で 、 {石|いし} の {字|じ} を {写|うつ}して います 。', 'Jūzō\'s up on the ridge, copying the writing on the stones.']);

  // ---- W1: change beats ---------------------------------------------------------------------------------------------
  // already in the journey: Kotonoha's leaf home to the plate on the lantern at the pass, which Aya notices
  // (zz_ko_mainland.js), and Tsuru's reply waiting at the teahouse (kr/23_scenes_side.js)
  L.beat('kr_foot', { id: 'leaf', when: 'ko_ret_kr', en: 'A leaf home to the plate on the lantern at the pass', jp: '{峠|とうげ} の {灯籠|とうろう} の {名札|なふだ}' });
  L.beat('kr_foot', { id: 'reply', when: 'quest.kr_inkstone=1&kr_done', en: 'Tsuru\'s reply, held at the teahouse', jp: 'ツル の {返事|へんじ}' });
  // new: Lanternfall's oil, in the jars from Cinder Orchard; its merchant says no for the first time
  L.beat('kr_foot', { id: 'oil', when: 'ch5_done', en: 'Oil from Lanternfall by the teahouse', jp: '{灯落|ひおち} の {油|あぶら}' });
  C.maps['kr.foot'].props.push({ p: 'kr_jar', x: 12, y: 8, if: 'beat.kr_foot.oil', scene: 'lf.lw_kr_oil_jars' }, { p: 'kr_jar', x: 13, y: 8, if: 'beat.kr_foot.oil', scene: 'lf.lw_kr_oil_jars' });
  L.talk('kr.foot_inn:kr_aya', [{ if: 'beat.kr_foot.oil&!seen.lf.lw_kr_oil_aya', scene: 'lf.lw_kr_oil_aya' }]);
  // new: shingles from Lanternfall for the lodge's roof
  L.beat('kr_lodge', { id: 'shingles', when: 'ch5_done', en: 'New shingles from Lanternfall', jp: '{灯落|ひおち} の {屋根|やね} {板|いた}' });
  C.maps['kr.lodge'].props.push({ p: 'sb_woodpile', x: 3, y: 14, if: 'beat.kr_lodge.shingles', scene: 'lf.lw_kr_shingles' });
  L.talk('kr.lodge:kr_mokichi', [{ if: 'beat.kr_lodge.shingles&!seen.lf.lw_kr_shingles_mokichi', scene: 'lf.lw_kr_shingles_mokichi' }]);
  // new: Tsuru writes to Hisae with her teacher's inkstone
  L.beat('kr_lodge', { id: 'tsuru', when: 'kr_inkstone_done', en: 'A letter from Reedwake on Hisae\'s table', jp: '{葦|あし}ノ{瀬|せ} から の {手紙|てがみ}' });
  C.maps['kr.hisae'].props.push({ p: 'fw_note', x: 7, y: 2, if: 'beat.kr_lodge.tsuru', scene: 'kr.lw_kr_tsuru_letter' });
  L.talk('kr.lodge:kr_hisae', [{ if: 'beat.kr_lodge.tsuru&!seen.kr.lw_kr_tsuru_hisae', scene: 'kr.lw_kr_tsuru_hisae' }]);

  // ---- W5: the road's variants, after each map's own event ----------------------------------------------------------
  L.road('kr_steps', { maps: ['kr.steps'],
    variants: [{ id: 'rain', scene: 'kr.lw_road_steps_rain', when: 'kr_cedar_cleared' }, { id: 'marks', scene: 'kr.lw_road_steps_marks', when: 'kr_cedar_cleared' }, { id: 'pilgrims', scene: 'kr.lw_road_steps_pilgrims', when: 'kr_cedar_cleared' }],
    stamp: { title: ['{杉|すぎ} の {石段|いしだん}', 'the Cedar Steps'], motif: 'path', ink: '#4e6a3a' } });
  L.road('kr_fox', { maps: ['kr.fox'],
    variants: [{ id: 'plank', scene: 'kr.lw_road_fox_plank', when: 'kr_l_fox' }, { id: 'yomeiri', scene: 'kr.lw_road_fox_yomeiri', when: 'kr_l_fox' }, { id: 'mist', scene: 'kr.lw_road_fox_mist', when: 'kr_l_fox' }],
    stamp: { title: ['{狐橋|きつねばし}', 'Fox Bridge'], motif: 'path', ink: '#b8783a' } });
  L.road('kr_ridge', { maps: ['kr.ridge'],
    variants: [{ id: 'copy', scene: 'kr.lw_road_ridge_copy', when: 'kr_moths_done' }, { id: 'fork', scene: 'kr.lw_road_ridge_fork', when: 'kr_moths_done' }, { id: 'wind', scene: 'kr.lw_road_ridge_wind', when: 'kr_moths_done' }],
    stamp: { title: ['{紅葉|もみじ} の {尾根|おね}', 'the Maple Ridge'], motif: 'path', ink: '#a8402a' } });
  L.road('kr_descent', { maps: ['kr.descent'],
    variants: [{ id: 'far', scene: 'kr.lw_road_descent_far', when: 'kr_done' }, { id: 'water', scene: 'kr.lw_road_descent_water', when: 'kr_done' }, { id: 'clouds', scene: 'kr.lw_road_descent_clouds', when: 'kr_done' }],
    stamp: { title: ['{峠|とうげ}', 'the Pass'], motif: 'path', ink: '#5a5a6a' } });
  C.notes.lw_kr_yomeiri = { title: T('The fox\'s wedding', '{狐|きつね} の {嫁入|よめい}り'), fiction: false,
    jp: '{晴|は}れて いる のに {降|ふ}る {雨|あめ} を 、 「{狐|きつね} の {嫁入|よめい}り 」 と いう 。 {狐|きつね} が {人|ひと} に {見|み}られない よう に 、 {雨|あめ} に {隠|かく}れて {嫁入|よめい}り を する 、 と {言|い}われて きた 。',
    en: 'A sun shower, rain from a clear sky, is called kitsune no yomeiri, "the fox\'s wedding": the foxes, so the old saying goes, hold their wedding procession under cover of the rain so that no one sees them.' };
  C.notes.lw_kr_unkai = { title: T('A sea of clouds', '{雲海|うんかい}'), fiction: false,
    jp: '{山|やま} の {上|うえ} から {見|み}る と 、 {谷|たに} を {埋|う}める {雲|くも} が {海|うみ} の よう に {見|み}える 。 {風|かぜ} の ない {晴|は}れた {夜|よる} の {後|あと} に {出|で}やすい ので 、 「{朝|あさ} の {雲海|うんかい} は {晴|は}れ 」 と {言|い}う 。',
    en: 'From a mountain, cloud filling the valleys below looks like a sea: unkai. It forms most often after a still, clear night, so the saying goes that a morning sea of clouds means a fine day.' };

  C.challenges['kr.lw_steps_rain'] = { title: TJ('{雨|あめ} の {石段|いしだん}', 'The steps in the rain'), tiers: {
    F: [ch({ item: 'v:端', ctx: { jp: 'ふだ ： 「あめ の ひ は 、 はし を あるく 。 まんなか は すべる 。」', en: '' }, prompt: { en: 'Where do you walk on a rainy day?' }, options: [o('はし', 1), o('まんなか', 0, 'まんなか は すべる: the middle is slippery.')] })],
    E: [ch({ item: 'v:苔', ctx: { jp: '{札|ふだ} ： 「{雨|あめ} の {日|ひ} は 、 {石段|いしだん} の {端|はし} を {歩|ある}いて ください 。 {真|ま}ん{中|なか} は {苔|こけ} で {滑|すべ}ります 。」', en: '' }, prompt: { en: 'Why not the middle?' }, options: [o('{苔|こけ} で {滑|すべ}る から', 1), o('{狭|せま}い から', 0, 'The sign gives the reason: {苔|こけ} で {滑|すべ}ります.'), o('{灯籠|とうろう} が ある から', 0, 'The sign gives the reason: the moss.')] })],
    I: [ch({ item: 'g:kr_ni_yoruto', ctx: { jp: 'クマゾウ ： 「{親父|おやじ} に よると 、 {昔|むかし} は {灯守|ひもり} が {毎朝|まいあさ} {苔|こけ} を {削|けず}って いた そう だ 。」', en: '' }, prompt: { en: 'Who says what?' }, options: [o('クマゾウ さん の お{父|とう}さん の {話|はなし} で は 、 {昔|むかし} {灯守|ひもり} が {苔|こけ} を {削|けず}って いた', 1), o('クマゾウ さん が {毎朝|まいあさ} {苔|こけ} を {削|けず}って いる', 0, '〜に よると: he is passing on his father\'s account of the old days.'), o('{灯守|ひもり} に よると 、 {苔|こけ} は {削|けず}らない', 0, 'The source is Kumazō\'s father.')] })],
    A: [ch({ item: 'g:kr_classical', ctx: { jp: '{古|ふる}い {札|ふだ} ： 「{雨|あめ} の {日|ひ} 、 {段|だん} の {中|なか} を {行|ゆ}く べからず 。」', en: '' }, prompt: { en: 'The old sign (classical; べからず is the negative of べし): what does it say?' }, options: [o('{雨|あめ} の {日|ひ} は 、 {真|ま}ん{中|なか} を {歩|ある}いて は いけない', 1), o('{雨|あめ} の {日|ひ} は 、 {真|ま}ん{中|なか} を {歩|ある}く べき だ', 0, 'べからず is "must not".'), o('{雨|あめ} の {日|ひ} は 、 {石段|いしだん} を {使|つか}えない', 0, 'Only the middle of the steps is forbidden.')] })],
  } };
  C.challenges['kr.lw_steps_marks'] = { title: TJ('{幹|みき} の {印|しるし}', 'The marks on the trunks'), tiers: {
    F: [ch({ item: 'v:残す', ctx: { jp: 'クマゾウ ： 「みき に ばつ が ある き は きる 。 まる が ある き は のこす 。」', en: '' }, prompt: { en: 'This tree has a まる. What happens to it?' }, options: [o('のこす', 1), o('きる', 0, 'ばつ means cut; まる means keep.')] })],
    E: [ch({ item: 'v:幹', ctx: { jp: 'クマゾウ ： 「{幹|みき} に ばつ の {印|しるし} が ある {木|き} だけ {切|き}る 。 {丸|まる} の {木|き} は {残|のこ}す ん だ 。」', en: '' }, prompt: { en: 'Which trees get cut?' }, options: [o('ばつ の {印|しるし} の {木|き} だけ', 1), o('{丸|まる} の {木|き} だけ', 0, '{丸|まる} の {木|き} は {残|のこ}す: those stay.'), o('{印|しるし} の ない {木|き} {全部|ぜんぶ}', 0, 'だけ: only the ones marked ばつ.')] })],
    I: [ch({ item: 'g:relative_clause', ctx: { jp: 'クマゾウ ： 「{灯籠|とうろう} に {影|かげ} を {落|お}とす {枝|えだ} は 、 {払|はら}って おく 。 {灯|ひ} が {道|みち} まで {届|とど}く よう に な 。」', en: '' }, prompt: { en: 'Which branches does he clear?' }, options: [o('{灯籠|とうろう} に {影|かげ} を {落|お}とす {枝|えだ}', 1), o('{道|みち} に {落|お}ちた {枝|えだ}', 0, 'The clause before {枝|えだ} says which: the ones shading the lantern.'), o('{枯|か}れた {枝|えだ} だけ', 0, 'He clears the ones that shade the lantern.')] })],
    A: [ch({ item: 'g:kr_to_iu', ctx: { jp: 'クマゾウ ： 「{親父|おやじ} は 、 {切|き}った {木|き} の {株|かぶ} に {酒|さけ} を かけて いた 。 「ありがとう 」 と いう {意味|いみ} だ そう だ 。」', en: '' }, prompt: { en: 'Why did his father pour sake on the stumps?' }, options: [o('{切|き}った {木|き} に {礼|れい} を {言|い}う ため', 1), o('{株|かぶ} を {早|はや}く {腐|くさ}らせる ため', 0, '「ありがとう」 と いう {意味|いみ}: it meant thank you.'), o('{自分|じぶん} で {飲|の}む {前|まえ} に', 0, 'It was a thank-you to the tree.')] })],
  } };
  C.challenges['kr.lw_steps_pilgrims'] = { title: TJ('{祠|ほこら} の {作法|さほう}', 'The shrine\'s custom'), tiers: {
    F: [ch({ item: 'v:合わせる', ctx: { jp: 'ほこら の ふだ ： 「て を あわせて から 、 しるし を おす 。」', en: '' }, prompt: { en: 'What comes first?' }, options: [o('て を あわせる', 1), o('しるし を おす', 0, 'から: the seal comes after.')] })],
    E: [ch({ item: 'g:v_te_kara', ctx: { jp: '{祠|ほこら} の {札|ふだ} ： 「{手|て} を {合|あ}わせて から 、 {印|しるし} を {押|お}して ください 。」', en: '' }, prompt: { en: 'The pilgrims ask what to do. In what order?' }, options: [o('{手|て} を {合|あ}わせて 、 それから {印|しるし} を {押|お}す', 1), o('{印|しるし} を {押|お}して 、 それから {手|て} を {合|あ}わせる', 0, '〜てから: hands together first.'), o('{印|しるし} だけ {押|お}す', 0, 'The board names both.')] })],
    I: [ch({ item: 'g:kr_tsutaerareru', ctx: { jp: '{札|ふだ} の {下|した} ： 「この {祠|ほこら} の {灯|ひ} は 、 {旅人|たびびと} の {足|あし} を {守|まも}る と {伝|つた}えられて いる 。」', en: '' }, prompt: { en: 'What is the shrine\'s lamp said to do?' }, options: [o('{旅人|たびびと} の {足|あし} を {守|まも}る', 1), o('{旅人|たびびと} に {道|みち} を {教|おし}える', 0, 'It is handed down that it guards travellers\' feet.'), o('{雨|あめ} を {止|と}める', 0, '{足|あし} を {守|まも}る: it guards their feet.')] })],
    A: [ch({ item: 'g:keigo_sonkei', ctx: { jp: '{巡礼|じゅんれい} ： 「{上|うえ} の {祠|ほこら} に は 、 どなた か いらっしゃる の でしょう か 。」', en: '' }, prompt: { en: 'What is the pilgrim asking?' }, options: [o('{祠|ほこら} に {誰|だれ} か いる か', 1), o('{祠|ほこら} は どこ に ある か', 0, 'いらっしゃる is the respectful いる: is anyone there?'), o('{祠|ほこら} に {何|なに} が ある か', 0, 'どなた: who, not what.')] })],
  } };
  C.challenges['kr.lw_fox_plank'] = { title: TJ('{浮|う}いた {板|いた}', 'The loose plank'), tiers: {
    F: [ch({ item: 'v:板', ctx: { jp: 'はりがみ ： 「むこう から さんまいめ の いた を ふまないで 。」', en: '' }, prompt: { en: 'Which plank must you not step on?' }, options: [o('むこう から さんまいめ', 1), o('こちら から さんまいめ', 0, 'むこう から: counted from the far side.')] })],
    E: [ch({ item: 'g:v_naide_kudasai', ctx: { jp: '{貼|は}り{紙|がみ} ： 「{向|む}こう {側|がわ} から {三枚目|さんまいめ} の {板|いた} は 、 {踏|ふ}まないで ください 。 ショウゾウ 」', en: '' }, prompt: { en: 'What does the notice ask?' }, options: [o('{向|む}こう から {三枚目|さんまいめ} の {板|いた} を {踏|ふ}まない', 1), o('{三枚目|さんまいめ} の {板|いた} を {直|なお}す', 0, '{踏|ふ}まないで: don\'t step on it.'), o('{橋|はし} を {渡|わた}らない', 0, 'Only the one plank.')] })],
    I: [ch({ item: 'g:te_oku', ctx: { jp: 'ショウゾウ ： 「{明日|あした} {直|なお}す 。 それ まで 、 {板|いた} に {赤|あか}い {布|ぬの} を {結|むす}んで おこう 。」', en: '' }, prompt: { en: 'What is the red cloth for?' }, options: [o('{直|なお}す まで 、 {危|あぶ}ない {板|いた} が {分|わ}かる よう に', 1), o('{狐|きつね} を {呼|よ}ぶ ため', 0, '〜て おこう: tied on in advance, until it is mended.'), o('{祭|まつ}り の {飾|かざ}り', 0, 'It marks the loose plank.')] })],
    A: [ch({ item: 'g:adv_wake_dewa_nai', ctx: { jp: 'ショウゾウ ： 「{橋|はし} が {古|ふる}い わけ で は ない 。 {狐|きつね} が {夜|よる} に {板|いた} を {齧|かじ}る ん だ と 、 カメ が {言|い}う の さ 。」', en: '' }, prompt: { en: 'What is Shōzō saying, and how?' }, options: [o('{古|ふる}い から で は なく 、 {狐|きつね} の せい だ と カメ さん が {言|い}って いる', 1), o('{橋|はし} は とても {古|ふる}い', 0, '〜わけ で は ない: it is not that the bridge is old.'), o('ショウゾウ さん が {狐|きつね} を {見|み}た', 0, 'He is repeating Kame\'s telling, wryly.')] })],
  } };
  C.challenges['kr.lw_fox_yomeiri'] = { title: TJ('{狐|きつね} の {嫁入|よめい}り', 'The fox\'s wedding'), tiers: {
    F: [ch({ item: 'v:晴れる', ctx: { jp: 'ヒナタ ： 「はれて いる のに あめ ！ きつね の よめいり だ ！」', en: '' }, prompt: { en: 'What is the weather doing?' }, options: [o('はれて いて 、 あめ も ふって いる', 1), o('くもって いて 、 あめ が ふって いる', 0, 'はれて いる のに: it is sunny.')] })],
    E: [ch({ item: 'g:noni', ctx: { jp: 'カイ ： 「{晴|は}れて いる のに 、 {雨|あめ} が {降|ふ}って いる 。 こういう {雨|あめ} を 「{狐|きつね} の {嫁入|よめい}り 」 って いう ん だ よ 。」', en: '' }, prompt: { en: 'What do they call a "fox\'s wedding"?' }, options: [o('{晴|は}れて いる のに {降|ふ}る {雨|あめ}', 1), o('{夜|よる} に {降|ふ}る {雨|あめ}', 0, '{晴|は}れて いる のに: rain while the sun shines.'), o('{狐|きつね} が {嫌|きら}い な {雨|あめ}', 0, 'こういう {雨|あめ}: this kind of rain, sun and rain together.')] })],
    I: [ch({ item: 'g:kr_to_iu', ctx: { jp: 'ヒナタ ： 「カメ ばあちゃん が {言|い}って いた よ 。 {狐|きつね} の {嫁入|よめい}り と いう の は 、 {狐|きつね} が {雨|あめ} に {隠|かく}れて {結婚|けっこん} する こと だ って 。」', en: '' }, prompt: { en: 'What does Kame say a fox\'s wedding is?' }, options: [o('{狐|きつね} が {雨|あめ} に {隠|かく}れて {結婚|けっこん} する こと', 1), o('{狐|きつね} が {雨|あめ} を {降|ふ}らせる こと', 0, '〜と いう の は: what the phrase means, in Kame\'s telling.'), o('{人|ひと} が {狐|きつね} と {結婚|けっこん} する こと', 0, 'The foxes marry each other.')] })],
    A: [ch({ item: 'g:kr_tsutaerareru', ctx: { jp: '{記録|きろく} ： 「{天気雨|てんきあめ} の {日|ひ} 、 {狐橋|きつねばし} を {渡|わた}る {行列|ぎょうれつ} を {見|み}た {者|もの} が いる と {伝|つた}えられて いる 。」', en: '' }, prompt: { en: 'What has been handed down?' }, options: [o('{天気雨|てんきあめ} の {日|ひ} に 、 {橋|はし} を {渡|わた}る {行列|ぎょうれつ} を {見|み}た {人|ひと} が いる', 1), o('{行列|ぎょうれつ} を {見|み}る と 、 {雨|あめ} が {止|や}む', 0, 'The register says only that someone saw it.'), o('{誰|だれ} も {行列|ぎょうれつ} を {見|み}た こと が ない', 0, '{見|み}た {者|もの} が いる: someone did.')] })],
  } };
  C.challenges['kr.lw_fox_mist'] = { title: TJ('{霧|きり} の {橋|はし}', 'The bridge in the mist'), tiers: {
    F: [ch({ item: 'v:霧', ctx: { jp: 'ふだ ： 「きり の ひ は 、 きつね の ひ が みえて から わたる 。」', en: '' }, prompt: { en: 'When do you cross in mist?' }, options: [o('きつね の ひ が みえて から', 1), o('きり が はれる まえ に', 0, 'みえて から: once you can see the Fox Light.')] })],
    E: [ch({ item: 'g:prt_kara_made', ctx: { jp: '{札|ふだ} ： 「{霧|きり} の {日|ひ} は 、 {狐|きつね} の {灯|ひ} が {見|み}える まで {待|ま}つ こと 。 {見|み}えたら {渡|わた}って よい 。」', en: '' }, prompt: { en: 'What do you do?' }, options: [o('{灯|ひ} が {見|み}える まで {待|ま}って 、 それから {渡|わた}る', 1), o('すぐ {渡|わた}る', 0, '{見|み}える まで {待|ま}つ: wait until it shows.'), o('{灯|ひ} を {消|け}して から {渡|わた}る', 0, 'The light is what you wait for.')] })],
    I: [ch({ item: 'g:cond_tara', ctx: { jp: 'ショウゾウ ： 「{灯|ひ} が ぼやけて {見|み}えたら 、 まだ {霧|きり} が {濃|こ}い 。 はっきり {見|み}えたら 、 {渡|わた}れ 。」', en: '' }, prompt: { en: 'The lamp shows sharp and clear. What now?' }, options: [o('{渡|わた}る', 1), o('まだ {待|ま}つ', 0, 'はっきり {見|み}えたら 、 {渡|わた}れ: clear means cross.'), o('{引|ひ}き{返|かえ}す', 0, 'Clear means cross.')] })],
    A: [ch({ item: 'g:kr_classical', ctx: { jp: '{古|ふる}い {碑|ひ} ： 「{霧|きり} {深|ふか}き {日|ひ} は 、 {灯|ひ} を {待|ま}つ べし 。」', en: '' }, prompt: { en: 'Classical: what must you do on a deep-mist day?' }, options: [o('{灯|ひ} を {待|ま}たなければ ならない', 1), o('{灯|ひ} を {待|ま}って は いけない', 0, 'べし: must.'), o('{灯|ひ} は {待|ま}たなくて いい', 0, 'べし is an obligation, not a permission.')] })],
  } };
  C.challenges['kr.lw_ridge_copy'] = { title: TJ('{写|うつ}し {間違|まちが}い', 'A copying slip'), tiers: {
    F: [ch({ item: 'v:尾根', ctx: { jp: 'いし ： 「おね の みち 」 。 ジュウゾウ の うつし ： 「やね の みち 」', en: '' }, prompt: { en: 'Does Jūzō\'s copy match the stone?' }, options: [o('いいえ 。 「おね 」 が 「やね 」 に なって いる', 1), o('はい 、 おなじ', 0, 'おね (ridge) is not やね (roof).')] })],
    E: [ch({ item: 'v:尾根', ctx: { jp: '{石|いし} ： 「{尾根|おね} の {道|みち} 」 。 ジュウゾウ の {写|うつ}し ： 「{屋根|やね} の {道|みち} 」 。', en: '' }, prompt: { en: 'Which character did he miscopy?' }, options: [o('{尾|お} を {屋|や} と {書|か}いた', 1), o('{道|みち} を {間違|まちが}えた', 0, '{道|みち} matches.'), o('{間違|まちが}い は ない', 0, '{尾根|おね}, ridge; {屋根|やね}, roof.')] })],
    I: [ch({ item: 'g:kr_to_iu', ctx: { jp: 'ジュウゾウ ： 「「{屋根|やね} の {道|みち} 」 と いう の は 、 {変|へん} だ と {思|おも}った ん だ 。 {屋根|やね} の {上|うえ} を {歩|ある}く {道|みち} なんて ない から ね 。」', en: '' }, prompt: { en: 'Why did he doubt his copy?' }, options: [o('「{屋根|やね} の {道|みち} 」 で は {意味|いみ} が {通|とお}らない から', 1), o('{石|いし} が {割|わ}れて いた から', 0, 'He says the phrase made no sense.'), o('{字|じ} が {小|ちい}さかった から', 0, 'He says the phrase made no sense.')] })],
    A: [ch({ item: 'g:kr_ni_yoruto', ctx: { jp: 'ジュウゾウ ： 「{都|みやこ} の {本|ほん} に よると 、 ここ は 「{屋根|やね} の {道|みち} 」 だ 。 だが {石|いし} に は 「{尾根|おね} 」 と ある 。 …… {本|ほん} の {方|ほう} が {写|うつ}し {間違|まちが}い だった の か 。」', en: '' }, prompt: { en: 'What is Jūzō realising?' }, options: [o('{都|みやこ} の {本|ほん} が 、 {石|いし} を {写|うつ}し{間違|まちが}えて いた', 1), o('{石|いし} が {間違|まちが}って いる', 0, 'He trusts the stone over the book now.'), o('{本|ほん} と {石|いし} は {同|おな}じ こと を {言|い}って いる', 0, 'They disagree: {屋根|やね} and {尾根|おね}.')] })],
  } };
  C.challenges['kr.lw_ridge_fork'] = { title: TJ('{分|わ}かれ{道|みち}', 'The fork'), tiers: {
    F: [ch({ item: 'v:東', ctx: { jp: 'みちしるべ ： 「きた ・ やかた 。 ひがし ・ しゅくぼう 。」 たびびと ： 「とまる ところ は どっち ？」', en: '' }, prompt: { en: 'The travellers need somewhere to sleep. Which way?' }, options: [o('ひがし', 1), o('きた', 0, 'やかた: the hall, which is shut.')] })],
    E: [ch({ item: 'v:宿坊', ctx: { jp: '{道標|みちしるべ} ： 「{北|きた} ・ {館|やかた} 。 {東|ひがし} ・ {宿坊|しゅくぼう} 。」 {旅人|たびびと} ： 「{今夜|こんや} {泊|と}まれる ところ を {探|さが}して いる ん です 。」', en: '' }, prompt: { en: 'Where should they go?' }, options: [o('{東|ひがし} の {宿坊|しゅくぼう}', 1), o('{北|きた} の {館|やかた}', 0, 'The hall is shut.'), o('{西|にし} の {狐橋|きつねばし}', 0, 'Back the way they came.')] })],
    I: [ch({ item: 'g:sou_hear', ctx: { jp: '{旅人|たびびと} ： 「{館|やかた} の {戸|と} は 、 {開|あ}かない そう です ね 。」', en: '' }, prompt: { en: 'What have they heard about the hall?' }, options: [o('{館|やかた} の {戸|と} は {開|あ}かない', 1), o('{館|やかた} に {泊|と}まれる', 0, '{開|あ}かない そう: they hear it won\'t open.'), o('{館|やかた} は もう ない', 0, 'The door is shut, not gone.')] })],
    A: [ch({ item: 'g:keigo_kenjo', ctx: { jp: '{旅人|たびびと} ： 「{宿坊|しゅくぼう} の {方|かた} に 、 ご{挨拶|あいさつ} に {伺|うかが}って も よろしい でしょう か 。」', en: '' }, prompt: { en: 'What are they asking (humbly)?' }, options: [o('{宿坊|しゅくぼう} の {人|ひと} に {挨拶|あいさつ} に {行|い}って いい か', 1), o('{宿坊|しゅくぼう} の {人|ひと} が {来|く}る か', 0, '{伺|うかが}う is the humble {行|い}く: they would go.'), o('{挨拶|あいさつ} は {要|い}らない か', 0, 'They ask whether they may call.')] })],
  } };
  C.challenges['kr.lw_ridge_wind'] = { title: TJ('{散|ち}った {写|うつ}し', 'The scattered copies'), tiers: {
    F: [{ kind: 'order', item: 'v:紅葉', prompt: { en: 'Put Jūzō\'s sheets back in the order of the stone: the ridge\'s, the maples, the lamps, guard.' }, tiles: ['おね の', 'もみじ は', 'ひ を', 'まもる'], answer: ['おね の', 'もみじ は', 'ひ を', 'まもる'] }],
    E: [{ kind: 'order', item: 'g:prt_wo', prompt: { en: 'Put the sheets back in the stone\'s order: "The ridge\'s maples guard the lamps."' }, tiles: ['{尾根|おね} の', '{紅葉|もみじ} は', '{灯|ひ} を', '{守|まも}る'], answer: ['{尾根|おね} の', '{紅葉|もみじ} は', '{灯|ひ} を', '{守|まも}る'] }],
    I: [ch({ item: 'g:cond_to', ctx: { jp: 'ジュウゾウ ： 「{三枚目|さんまいめ} に は 、 「{紅葉|もみじ} が {散|ち}る と 、 {灯|ひ} が よく {見|み}える 」 と いう {一行|いちぎょう} が あった 。」', en: '' }, prompt: { en: 'What did the third sheet say?' }, options: [o('{紅葉|もみじ} が {散|ち}る と 、 {灯|ひ} が よく {見|み}える', 1), o('{紅葉|もみじ} が {灯|ひ} を {隠|かく}す', 0, 'The line says the opposite: once the leaves fall, the lamps show.'), o('{灯|ひ} が {紅葉|もみじ} を {燃|も}やす', 0, '〜と: when the leaves fall, the lamps are easy to see.')] })],
    A: [ch({ item: 'g:kr_classical', ctx: { jp: '{石|いし} ： 「{紅葉|もみじ} {散|ち}りて 、 {灯|ひ} {明|あき}らか なり 。」', en: '' }, prompt: { en: 'What does the classical line mean?' }, options: [o('{紅葉|もみじ} が {散|ち}って 、 {灯|ひ} が はっきり {見|み}える', 1), o('{紅葉|もみじ} が {散|ち}らない と 、 {灯|ひ} は {暗|くら}い', 0, 'なり here is "is": the lamps are bright, once the leaves have fallen.'), o('{灯|ひ} が {紅葉|もみじ} を {散|ち}らす', 0, 'The leaves fall; the lamps show.')] })],
  } };
  C.challenges['kr.lw_descent_far'] = { title: TJ('{峠|とうげ} の {道標|みちしるべ}', 'The waystone at the pass'), tiers: {
    F: [ch({ item: 'v:近い', ctx: { jp: 'みちしるべ ： 「しゅくぼう まで いちり 。 ひおち まで さんり 。」', en: '' }, prompt: { en: 'Which is nearer?' }, options: [o('しゅくぼう', 1), o('ひおち', 0, 'さんり is three times as far.')] })],
    E: [ch({ item: 'g:counters', ctx: { jp: '{道標|みちしるべ} ： 「{宿坊|しゅくぼう} まで {一里|いちり} 。 {灯落|ひおち} まで {三里|さんり} 。」 {旅人|たびびと} ： 「{日|ひ} が {暮|く}れる {前|まえ} に {着|つ}きたい ん です 。」', en: '' }, prompt: { en: 'With little daylight left, where should the traveller head?' }, options: [o('{近|ちか}い {宿坊|しゅくぼう}', 1), o('{遠|とお}い {灯落|ひおち}', 0, '{三里|さんり} is too far before dark.'), o('{峠|とうげ} で {寝|ね}る', 0, 'The lodge is only {一里|いちり} away.')] })],
    I: [ch({ item: 'g:hazu', ctx: { jp: '{旅人|たびびと} ： 「{一里|いちり} なら 、 {暗|くら}く なる {前|まえ} に {着|つ}く はず です ね 。」', en: '' }, prompt: { en: 'What does the traveller expect?' }, options: [o('{暗|くら}く なる {前|まえ} に {着|つ}く だろう', 1), o('{暗|くら}く なって から {着|つ}く', 0, '{前|まえ} に {着|つ}く はず: should arrive before dark.'), o('{着|つ}かない かも しれない', 0, 'はず: they expect to.')] })],
    A: [ch({ item: 'g:adv_to_wa_ie', ctx: { jp: '{旅人|たびびと} ： 「{上|のぼ}り と は いえ 、 {一里|いちり} なら {何|なん} と か なる 。」', en: '' }, prompt: { en: 'What does the traveller conclude?' }, options: [o('{上|のぼ}り {坂|ざか} でも 、 {一里|いちり} なら {大丈夫|だいじょうぶ}', 1), o('{上|のぼ}り {坂|ざか} だ から 、 {無理|むり} だ', 0, '〜と は いえ: even though it is uphill.'), o('{一里|いちり} は {遠|とお}すぎる', 0, '{何|なん} と か なる: they can manage it.')] })],
  } };
  C.challenges['kr.lw_descent_water'] = { title: TJ('セイジ の {書|か}き{置|お}き', 'Seiji\'s note'), tiers: {
    F: [ch({ item: 'v:汲む', ctx: { jp: 'セイジ の かきおき ： 「この さき 、 みず は ありません 。 ここ で くんで ください 。」', en: '' }, prompt: { en: 'What should pilgrims do here?' }, options: [o('ここ で みず を くむ', 1), o('この さき で みず を くむ', 0, 'この さき 、 みず は ありません: there is none further on.')] })],
    E: [ch({ item: 'g:v_te_kudasai', ctx: { jp: 'セイジ の {書|か}き{置|お}き ： 「この {先|さき} 、 {水|みず} は ありません 。 ここ で {汲|く}んで ください 。」', en: '' }, prompt: { en: 'Why fill up here?' }, options: [o('この {先|さき} に {水|みず} が ない から', 1), o('ここ の {水|みず} が おいしい から', 0, 'The note gives the reason: no water further on.'), o('{宿坊|しゅくぼう} で {水|みず} を {売|う}って いる から', 0, 'The note gives the reason: no water further on.')] })],
    I: [ch({ item: 'g:register_polite_plain', ctx: { jp: 'セイジ ： 「「{汲|く}みなさい 」 だ と 、 {強|つよ}すぎます か ね 。 {巡礼|じゅんれい} の {方|かた} は 、 {年上|としうえ} の {人|ひと} が {多|おお}い ので 。」', en: '' }, prompt: { en: 'Why is Seiji unsure about 汲みなさい?' }, options: [o('{年上|としうえ} の {人|ひと} に は 、 {命令|めいれい} の よう に {聞|き}こえる から', 1), o('{字|じ} が {難|むずか}しい から', 0, 'He worries about how it sounds to his elders.'), o('{水|みず} が {少|すく}ない から', 0, 'He worries about the tone.')] })],
    A: [ch({ item: 'g:keigo_sonkei', ctx: { jp: 'セイジ ： 「「お{汲|く}み ください 」 に しましょう 。 {祖父|そふ} なら 、 そう {書|か}いた と {思|おも}います 。」', en: '' }, prompt: { en: 'Which wording does he settle on, as the most respectful?' }, options: [o('お{汲|く}み ください', 1), o('{汲|く}め', 0, 'A bare command: the opposite of what he wants.'), o('{汲|く}みなさい', 0, 'That was the one he thought too strong.')] })],
  } };
  C.challenges['kr.lw_descent_clouds'] = { title: TJ('{雲海|うんかい}', 'A sea of clouds'), tiers: {
    F: [ch({ item: 'v:雲', ctx: { jp: 'たびびと ： 「みて 、 くも の うみ ！ あさ に くも の うみ が でる と 、 その ひ は はれる ん だ って 。」', en: '' }, prompt: { en: 'What will the weather be today?' }, options: [o('はれ', 1), o('あめ', 0, 'はれる: fine weather.')] })],
    E: [ch({ item: 'g:cond_to', ctx: { jp: '{旅人|たびびと} ： 「{朝|あさ} に {雲海|うんかい} が {出|で}る と 、 その {日|ひ} は {晴|は}れる ん です よ 。」', en: '' }, prompt: { en: 'What follows a morning sea of clouds?' }, options: [o('その {日|ひ} は {晴|は}れる', 1), o('{雨|あめ} が {降|ふ}る', 0, '〜と: whenever there is one, the day is fine.'), o('{雲|くも} が {山|やま} を {登|のぼ}る', 0, 'The traveller is talking about the weather.')] })],
    I: [ch({ item: 'g:you_mitai', ctx: { jp: '{旅人|たびびと} ： 「{下|した} の {灯落|ひおち} は 、 まだ {雲|くも} の {中|なか} みたい です ね 。」', en: '' }, prompt: { en: 'Where does Lanternfall seem to be?' }, options: [o('{雲|くも} の {中|なか}', 1), o('{雲|くも} の {上|うえ}', 0, '{雲|くも} の {中|なか} みたい: it seems to be inside the cloud.'), o('{山|やま} の {上|うえ}', 0, 'It lies below, under the cloud.')] })],
    A: [ch({ item: 'g:adv_koto_ka', ctx: { jp: '{旅人|たびびと} ： 「この {景色|けしき} を {見|み}る ため に 、 {何年|なんねん} {待|ま}った こと か 。」', en: '' }, prompt: { en: 'What is the traveller expressing?' }, options: [o('{長|なが}い {間|あいだ} 、 この {景色|けしき} を {待|ま}って いた', 1), o('{待|ま}つ の は {嫌|いや} だ', 0, '〜こと か is an exclamation: how many years I waited!'), o('{何年|なんねん} {待|ま}った か {分|わ}からない', 0, 'Not a question: how long I waited!')] })],
  } };

  // ---- W6: return keys ----------------------------------------------------------------------------------------------
  // registered: the Shuttered Hall door (kr/21_scenes_lodge.js kr.hall_door; opened by the key ledger Tsuru gives in
  // the postgame). Its own scene stays; the prop is wrapped so the spot is noticed and opened through the hook.
  C.sealed.kr_hall_door = { map: 'kr.hall', x: 14, y: 10, needs: 'hall_ledger', opens: 'lw_kr_hall_open', scene: 'kr.hall_door',
    hint: T('The door is shut fast by its sacred rope. Something of the keepers\', a key of some kind, might open it.', '{戸|と} は しめ{縄|なわ} で {閉|と}ざされて いる 。 {灯守|ひもり} の {鍵|かぎ} の よう な もの が あれば ……'),
    openedLabel: T('The Shuttered Hall\'s door', '{閉|と}ざされた {館|やかた} の {戸|と}'), existing: 'kr.hall_door' };
  C.living.seals.push('kr_hall_door');
  for (const p of C.maps['kr.hall'].props || []) if (p.scene === 'kr.hall_door') p.scene = 'kr.lw_hall_door';
  L.seal('kr_watch', { map: 'kr.ridge', x: 36, y: 4, p: 'stone_marker', needs: 'mod_goto', opens: 'lw_kr_watch', scene: 'cr.lw_kr_watch_open',
    hint: ['{尾根|おね} の {端|はし} に 、 {苔|こけ} むした {小|ちい}さな {石|いし} 。 「{百歩|ひゃっぽ} ごと に {石|いし} 。 {石|いし} の {先|さき} に {灯守|ひもり} の {見張|みは}り{場|ば} 」 。 「ごと に 」 が 、 まだ {分|わ}からない 。', 'At the ridge\'s edge, a small mossy stone: "A stone ごとに a hundred paces. Beyond the stones, the keepers\' watch-place." The ごとに means nothing to you yet.'],
    openedLabel: ['{灯守|ひもり} の {見張|みは}り{場|ば}', 'The keepers\' watch-place'], after: { p: 'stone_marker', scene: 'cr.lw_kr_watch_after' } });
  L.seal('kr_wicks', { map: 'kr.foot_inn', x: 6, y: 2, p: 'sign', needs: 'mod_arayuru', opens: 'lw_kr_wicks', scene: 'ko.lw_kr_wicks_open',
    hint: ['{壁|かべ} に {古|ふる}い {札|ふだ} 。 「あらゆる {灯|ひ} の {芯|しん} 、 ここ に {納|おさ}む 」 。 {下|した} の {床板|ゆかいた} が {一枚|いちまい} だけ {新|あたら}しい 。 アヤ は 、 「あらゆる 」 と いう {灯|ひ} は {知|し}らない と {言|い}う 。', 'An old plaque on the wall: "Wicks for the あらゆる lamps, stored here." One floorboard beneath it is newer than the rest. Aya says she has never heard of a lamp called "Arayuru".'],
    openedLabel: ['{床|ゆか} の {下|した} の {灯心|とうしん}', 'The wicks under the floor'], after: { p: 'kr_wicks', scene: 'ko.lw_kr_wicks_after' } });
  C.notes.lw_kr_watch = { title: T('The keepers\' watch-place', '{灯守|ひもり} の {見張|みは}り{場|ば}'), fiction: true,
    jp: '{紅葉|もみじ} の {尾根|おね} の {先|さき} の {岩|いわ} 。 {百歩|ひゃっぽ} ごと の {小|ちい}さな {石|いし} を {辿|たど}る と {着|つ}く 。 {麓|ふもと} から {峠|とうげ} まで 、 {道|みち} の {灯|ひ} が {全部|ぜんぶ} {見|み}える 。',
    en: 'A rock past the end of the Maple Ridge, reached by small stones set a hundred paces apart. From it every lamp on the road can be seen, from the Welcoming Light at the foot to the pass: the keepers counted from here the lamps that had gone out.' };
  C.notes.lw_kr_toshin = { title: T('Rush wicks', '{灯心|とうしん}'), fiction: false,
    jp: '{灯心|とうしん} は 、 イグサ の {茎|くき} の {芯|しん} から {作|つく}る {灯|ひ} の {芯|しん} 。 {油|あぶら} を {吸|す}って 、 {長|なが}く {静|しず}か に {燃|も}える 。',
    en: 'Tōshin, lamp wicks made from the white pith of the soft rush, burned in oil lamps for centuries: they draw up the oil and burn long and quietly. (Real; the keepers\' store under the teahouse floor is the game\'s.)' };

  L.scenes(`
@scene kr.lw_hall_door
# The Shuttered Hall door as a return key (W6): its own scene as before, and the spot noticed (Known details) or
# opened through the sealed-spot hook. Once open, the door's own scene is all there is.
!if lw_kr_hall_open -> again
!if hall_ledger -> open
!call kr.hall_door
!hook sealed kr_hall_door
!end
:open
!hook sealed kr_hall_door
!end
:again
!call kr.hall_door

@scene lf.lw_kr_oil_jars
narr: {灰実|はいみ} の {焼|や}き{物|もの} の かめ に 、 {灯落|ひおち} の {油|あぶら} 。 {札|ふだ} に アヤ の {字|じ} で {数|かず} が {書|か}いて ある 。 「{三十|さんじゅう} 」 。 || Cinder Orchard jars, full of Lanternfall oil. A tag in Aya's hand gives the count: "Thirty."

@scene lf.lw_kr_oil_aya
kr_aya: {灯落|ひおち} の {油屋|あぶらや} さん が ね 、 {初|はじ}めて {値段|ねだん} に {文句|もんく} を {言|い}った の 。 「その {値|ね} で は {売|う}れません 」 って 。 || The oil merchant from Lanternfall argued over the price for the first time. "I can't sell at that price," he said.
kr_aya[laugh]: …… {変|へん} な {話|はなし} だけど 、 {嬉|うれ}しかった わ 。 {前|まえ} は {何|なに} を {言|い}って も 「かしこまりました 」 だった から 。 || …Odd thing to be glad about, but I was. Before, whatever I said, it was always "Certainly."

@scene lf.lw_kr_shingles
narr: {新|あたら}しい {屋根|やね} {板|いた} が {積|つ}んで ある 。 {札|ふだ} に 「{灯落|ひおち} より 」 。 || A stack of new roof shingles. The tag: "From Lanternfall."

@scene lf.lw_kr_shingles_mokichi
kr_mokichi: {灯落|ひおち} から {屋根|やね} の {板|いた} が {上|あ}がって きました 。 {道|みち} が {両方|りょうほう} {開|あ}いた から です ね 。 || Shingles have come up from Lanternfall, now the road's open at both ends.
kr_mokichi[smile]: {雨|あめ} の {夜|よる} に 、 もう {桶|おけ} を {並|なら}べなくて いい ん です 。 || No more setting out buckets on rainy nights.

@scene kr.lw_kr_tsuru_letter
narr: {机|つくえ} の {横|よこ} に 、 {細|ほそ}い {字|じ} の {手紙|てがみ} 。 {差出人|さしだしにん} は 「{葦|あし}ノ{瀬|せ} 、 ツル 」 。 あの {硯|すずり} で {書|か}いた {字|じ} だ 。 || By the table, a letter in a fine hand, from "Tsuru, Reedwake". Written with that inkstone.

@scene kr.lw_kr_tsuru_hisae
kr_hisae: ツル から {手紙|てがみ} が {来|き}た よ 。 {泣|な}き{虫|むし} だった {弟子|でし} の 、 その また {弟子|でし} から ね 。 || A letter came from Tsuru. From the apprentice of that crybaby apprentice, no less.
kr_hisae: …… {字|じ} が 、 {師匠|ししょう} に そっくり だ 。 {腹|はら} が {立|た}つ くらい さ 。 || …Her hand is just like her teacher's. Almost annoying.

@scene kr.lw_road_steps_rain
narr: {夜|よる} の {雨|あめ} で 、 {石段|いしだん} が {濡|ぬ}れて {光|ひか}って いる 。 クマゾウ が {古|ふる}い {札|ふだ} の {前|まえ} で {腕|うで} を {組|く}んで いる 。 || The night's rain has left the steps wet and shining. Kumazō stands with his arms folded before an old sign.
kr_kumazo: {字|じ} が {薄|うす}くて な 。 {読|よ}んで くれん か 。 {上|のぼ}って くる {巡礼|じゅんれい} に 、 {教|おし}えて やりたい ん だ 。 || The writing's faded. Will you read it for me? I want to tell the pilgrims coming up.
!challenge kr.lw_steps_rain
!if var._res=0 -> later
kr_kumazo: {端|はし} を {歩|ある}け 、 か 。 よし 、 {覚|おぼ}えた 。 …… {親父|おやじ} も 、 {同|おな}じ こと を {言|い}って いた な 。 || Walk at the edge, eh. Right, I'll remember. …My father said the same.
!hook road_done kr_steps rain
!end
:later
kr_kumazo: まあ 、 {急|いそ}ぐ {話|はなし} じゃ ない 。 {雨|あめ} は また {降|ふ}る 。 || Well, it'll keep. There'll be more rain.

@scene kr.lw_road_steps_marks
narr: クマゾウ が {斧|おの} を {肩|かた} に 、 {杉|すぎ} の {間|あいだ} を {歩|ある}いて いる 。 {幹|みき} に {印|しるし} を {付|つ}けて いる らしい 。 || Kumazō is walking among the cedars with his axe on his shoulder, marking the trunks.
kr_kumazo: {今日|きょう} は {間引|まび}き だ 。 {印|しるし} の {読|よ}み{方|かた} 、 {分|わ}かる か 。 || Thinning today. Can you read the marks?
!challenge kr.lw_steps_marks
!if var._res=0 -> later
kr_kumazo: {丸|まる} は {残|のこ}す 。 よし 。 …… これ で {杉|すぎ} の {灯|ひ} に 、 また {光|ひかり} が {届|とど}く 。 || The round ones stay. Good. …Now the light will reach the Cedar Light again.
!hook road_done kr_steps marks
!end
:later
kr_kumazo: {印|しるし} は {逃|に}げん 。 また {今度|こんど} {教|おし}えて やる 。 || The marks aren't going anywhere. I'll show you another time.

@scene kr.lw_road_steps_pilgrims
narr: {白|しろ}い {着物|きもの} の {巡礼|じゅんれい} が {二人|ふたり} 、 {石段|いしだん} の {途中|とちゅう} で {息|いき} を {整|ととの}えて いる 。 {上|うえ} の {祠|ほこら} の {作法|さほう} を {知|し}りたい らしい 。 || Two pilgrims in white are catching their breath halfway up the steps. They want to know the custom at the shrine above.
!challenge kr.lw_steps_pilgrims
!if var._res=0 -> later
narr: {巡礼|じゅんれい} たち は {頭|あたま} を {下|さ}げて 、 {上|うえ} の {祠|ほこら} へ {登|のぼ}って いった 。 || The pilgrims bow and climb on to the shrine above.
!hook road_done kr_steps pilgrims
!end
:later
narr: {巡礼|じゅんれい} たち は {札|ふだ} を {自分|じぶん} たち で {読|よ}もう と 、 {先|さき} に {登|のぼ}って いった 。 || The pilgrims climb on, meaning to read the board for themselves.

@scene kr.lw_road_fox_plank
narr: {狐橋|きつねばし} の {板|いた} が {一枚|いちまい} 、 {浮|う}いて いる 。 ショウゾウ が {貼|は}り{紙|がみ} を {持|も}って {来|き}た 。 || One of the Fox Bridge's planks has come loose. Shōzō arrives with a notice.
kr_shozo: {字|じ} は {書|か}いた が 、 {子供|こども} たち が {読|よ}まない ん だ 。 {正|ただ}しく {読|よ}める か 、 {確|たし}かめて くれ 。 || I've written it, but the children won't read it. See whether it reads right.
!challenge kr.lw_fox_plank
!if var._res=0 -> later
kr_shozo: {向|む}こう から {三枚目|さんまいめ} 。 よし 。 …… カメ に は 、 {狐|きつね} の せい に させて おこう 。 || Third from the far side. Good. …And let Kame blame the fox.
!hook road_done kr_fox plank
!end
:later
kr_shozo: …… {明日|あした} 、 {直|なお}して しまう か 。 {貼|は}り{紙|がみ} より 、 その {方|ほう} が {早|はや}い 。 || …Maybe I'll just mend it tomorrow. Quicker than a notice.

@scene kr.lw_road_fox_yomeiri
narr: {日|ひ} が {照|て}って いる のに 、 {細|ほそ}い {雨|あめ} が {降|ふ}り{出|だ}した 。 {子供|こども} たち が {橋|はし} の {方|ほう} を {指|さ}して 、 {騒|さわ}いで いる 。 || The sun is shining, and yet a fine rain has started. The children are pointing at the bridge, shrieking.
!challenge kr.lw_fox_yomeiri
!if var._res=0 -> later
narr: {雨|あめ} は すぐ に {止|や}んだ 。 {橋|はし} の {上|うえ} に は 、 {誰|だれ} も いない 。 …… {小|ちい}さな {足跡|あしあと} が 、 {一列|いちれつ} だけ {残|のこ}って いた 。 || The rain stops as quickly as it came. Nobody is on the bridge. …Only a single line of small footprints.
?(comp=ren) comp[smile]: {記録|きろく} に は {書|か}けません ね 。 {書|か}きたい です けど 。 || That can't go in the records. Much as I'd like it to.
!note lw_kr_yomeiri
!hook road_done kr_fox yomeiri
!end
:later
narr: {雨|あめ} は {止|や}み 、 {子供|こども} たち は {笑|わら}い ながら {走|はし}って いった 。 || The rain stops, and the children run off laughing.

@scene kr.lw_road_fox_mist
narr: {谷|たに} から {霧|きり} が {上|あ}がって きて 、 {橋|はし} の {向|む}こう が {見|み}えない 。 {橋|はし} の {袂|たもと} に {古|ふる}い {札|ふだ} が ある 。 || Mist rises out of the gorge, and the far end of the bridge is gone. At the bridge's foot there is an old board.
!challenge kr.lw_fox_mist
!if var._res=0 -> later
narr: しばらく {待|ま}つ と 、 {霧|きり} の {中|なか} に {狐|きつね} の {灯|ひ} が 、 はっきり {見|み}えた 。 {橋|はし} を {渡|わた}る 。 || You wait a while, and the Fox Light shows clear through the mist. You cross.
!hook road_done kr_fox mist
!end
:later
narr: {霧|きり} の {中|なか} で 、 {灯|ひ} が ぼんやり {揺|ゆ}れて いる 。 {今日|きょう} は {無理|むり} を しない こと に した 。 || In the mist the light only wavers. You decide not to push it today.

@scene kr.lw_road_ridge_copy
kr_juzo: ちょうど いい 。 {私|わたし} の {写|うつ}し を 、 {石|いし} と {比|くら}べて くれない か 。 {目|め} が {疲|つか}れて ね 。 || Just the person. Would you check my copy against the stone? My eyes are tired.
!challenge kr.lw_ridge_copy
!if var._res=0 -> later
kr_juzo[laugh]: {尾根|おね} 、 か 。 …… {石|いし} は {正|ただ}しい 。 {写|うつ}す {人|ひと} が {間違|まちが}える 。 {私|わたし} も 、 {都|みやこ} の {本|ほん} も 。 || Ridge, then. …The stone is right. It's the copyists who slip. Me, and the books in the capital too.
!hook road_done kr_ridge copy
!end
:later
kr_juzo: いや 、 {急|いそ}がない 。 {石|いし} は {逃|に}げない から ね 。 || No, no hurry. Stones don't run away.

@scene kr.lw_road_ridge_fork
narr: {分|わ}かれ{道|みち} で 、 {荷|に} を {背負|せお}った {旅人|たびびと} が {二人|ふたり} 、 {道標|みちしるべ} を {見上|みあ}げて いる 。 || At the fork, two travellers with packs are peering up at the waymarker.
!challenge kr.lw_ridge_fork
!if var._res=0 -> later
narr: {旅人|たびびと} たち は {東|ひがし} へ {歩|ある}いて いった 。 {紅葉|もみじ} の {向|む}こう に 、 {宿坊|しゅくぼう} の {灯|ひ} が {見|み}える 。 || The travellers set off east. Beyond the maples, the lodge's light shows.
!hook road_done kr_ridge fork
!end
:later
narr: {旅人|たびびと} たち は {相談|そうだん} しながら 、 {北|きた} の {館|やかた} の {方|ほう} へ {歩|ある}いて いった 。 {戻|もど}って くる だろう 。 || Still discussing it, the travellers head north towards the hall. They'll be back.

@scene kr.lw_road_ridge_wind
narr: {突風|とっぷう} が {尾根|おね} を {吹|ふ}き{抜|ぬ}けた 。 ジュウゾウ の {紙|かみ} が 、 {紅葉|もみじ} と {一緒|いっしょ} に {舞|ま}って いる 。 || A gust tears across the ridge. Jūzō's papers are flying with the maple leaves.
kr_juzo: ああ っ 、 {写|うつ}し が ！ {拾|ひろ}って 、 {石|いし} の {順|じゅん} に {並|なら}べて くれ ！ || Ah, my copies! Pick them up, and put them in the stone's order!
!challenge kr.lw_ridge_wind
!if var._res=0 -> later
kr_juzo: {助|たす}かった 。 …… {紅葉|もみじ} が {一枚|いちまい} {挟|はさ}まって いる な 。 これ も {写|うつ}し の {内|うち} に して おこう 。 || Thank you. …There's a maple leaf caught between the sheets. I'll keep it as part of the copy.
!hook road_done kr_ridge wind
!end
:later
kr_juzo: …… {順|じゅん} は {後|あと} で {直|なお}す 。 {拾|ひろ}って くれて 、 ありがとう 。 || …I'll sort the order later. Thank you for picking them up.

@scene kr.lw_road_descent_far
narr: {東|ひがし} の {坂|さか} から 、 {息|いき} を {切|き}らした {旅人|たびびと} が {上|のぼ}って きた 。 {日|ひ} が {傾|かたむ}いて いる 。 || Up the eastern slope comes a traveller, out of breath. The sun is getting low.
!challenge kr.lw_descent_far
!if var._res=0 -> later
narr: {旅人|たびびと} は {礼|れい} を {言|い}って 、 {宿坊|しゅくぼう} の {方|ほう} へ {歩|ある}いて いった 。 {振|ふ}り{返|かえ}る と 、 {峠|とうげ} の {灯籠|とうろう} に {灯|ひ} が {入|はい}った 。 || The traveller thanks you and walks on towards the lodge. Looking back, you see the lanterns at the pass come alight.
!hook road_done kr_descent far
!end
:later
narr: {旅人|たびびと} は {道標|みちしるべ} の {前|まえ} で 、 しばらく {考|かんが}えて いた 。 || The traveller stands before the waystone a long while, thinking.

@scene kr.lw_road_descent_water
kr_seiji: あ 、 また {会|あ}いました ね 。 {峠|とうげ} に {書|か}き{置|お}き を {残|のこ}したい ん です が 、 {言葉|ことば} を {見|み}て もらえます か 。 || Oh, we meet again. I want to leave a note at the pass. Would you look over the wording?
!challenge kr.lw_descent_water
!if var._res=0 -> later
narr: セイジ は {書|か}き{置|お}き を {道標|みちしるべ} に {結|むす}んだ 。 「この {先|さき} 、 {水|みず} は ありません 。 ここ で お{汲|く}み ください 。」 || Seiji ties the note to the waystone: "No water beyond this point. Kindly fill up here."
!hook road_done kr_descent water
!end
:later
kr_seiji: もう {少|すこ}し {考|かんが}えて みます 。 {祖父|そふ} なら 、 どう {書|か}いた かな 。 || I'll think about it a little more. How would my grandfather have put it?

@scene kr.lw_road_descent_clouds
narr: {峠|とうげ} の {向|む}こう 、 {谷|たに} が {一面|いちめん} 、 {白|しろ}い {雲|くも} に {埋|う}まって いる 。 {早起|はやお}き の {旅人|たびびと} が {一人|ひとり} 、 {声|こえ} を {上|あ}げた 。 || Beyond the pass, the valley is filled with white cloud from side to side. An early traveller cries out at it.
!challenge kr.lw_descent_clouds
!if var._res=0 -> later
narr: {日|ひ} が {昇|のぼ}る と 、 {雲|くも} の {海|うみ} は ゆっくり {光|ひか}り{始|はじ}めた 。 || As the sun comes up, the sea of cloud slowly begins to shine.
!note lw_kr_unkai
!hook road_done kr_descent clouds
!end
:later
narr: {雲|くも} は やがて {崩|くず}れて 、 {谷|たに} へ {沈|しず}んで いった 。 || In time the cloud breaks and sinks back into the valley.

@scene cr.lw_kr_watch_open
narr: 「{百歩|ひゃっぽ} ごと に {石|いし} 」 。 {百歩|ひゃっぽ} {歩|ある}く たび に 、 {石|いし} が {一|ひと}つ 。 || "A stone every hundred paces": one for each hundred steps.
narr: {歩|ほ} を {数|かぞ}えて {紅葉|もみじ} の {中|なか} を {進|すす}む と 、 {百歩|ひゃっぽ} ごと に 、 {本当|ほんとう} に {小|ちい}さな {石|いし} が あった 。 {四|よっ}つ {目|め} の {石|いし} の {先|さき} で 、 {木|き} が {切|き}れた 。 || Counting your steps through the maples, you find them: a small stone at every hundred paces. Past the fourth, the trees open out.
narr: {尾根|おね} の {先|さき} の {岩|いわ} の {上|うえ} 。 {麓|ふもと} の {迎|むか}え の {灯|ひ} から {峠|とうげ} まで 、 {道|みち} の {灯|ひ} が {全部|ぜんぶ} {見|み}える 。 {灯守|ひもり} は ここ から 、 {消|き}えた {灯|ひ} を {数|かぞ}えた の だ 。 || A rock at the ridge's end. From the Welcoming Light at the foot to the pass, every lamp on the road is in sight. From here, the keepers counted the lamps that had gone out.
?(comp=ren) comp: …… {全部|ぜんぶ} 、 {点|つ}いて います 。 {数|かぞ}える {必要|ひつよう} が ない の は 、 いい こと です ね 。 || …Every one is lit. A good thing, not to need counting.
!note lw_kr_watch

@scene cr.lw_kr_watch_after
narr: {百歩|ひゃっぽ} ごと の {石|いし} 。 その {先|さき} の {見張|みは}り{場|ば} から 、 {道|みち} の {灯|ひ} が {全部|ぜんぶ} {見|み}える 。 || The stones every hundred paces. From the watch-place beyond them, every lamp on the road is in view.

@scene ko.lw_kr_wicks_open
narr: 「あらゆる {灯|ひ} の {芯|しん} 」 。 あらゆる は {灯|ひ} の {名前|なまえ} で は ない 。 「どんな {灯|ひ} でも 」 と いう {意味|いみ} だ 。 || "Wicks for あらゆる lamps." あらゆる isn't a lamp's name. It means "every kind of".
kr_aya[surprise]: …… {名前|なまえ} じゃ なかった の ？ どこ か の {灯|ひ} の {物|もの} だ と {思|おも}って 、 {何年|なんねん} も {開|あ}けず に いた の に ！ || …It isn't a name? I thought they belonged to some lamp somewhere, and left them shut away for years!
narr: {床板|ゆかいた} を {外|はず}す と 、 {乾|かわ}いた {灯心|とうしん} の {束|たば} が 、 {紙|かみ} に {包|つつ}まれて {並|なら}んで いた 。 {石|いし} の {灯籠|とうろう} の {分|ぶん} 、 {提灯|ちょうちん} の {分|ぶん} 、 {灯明皿|とうみょうざら} の {分|ぶん} 。 || Under the board, bundles of dry rush wicks wrapped in paper, side by side: for the stone lanterns, for the paper lanterns, for the lamp dishes.
kr_aya[laugh]: {数|かぞ}えて おく わ 。 …… {全部|ぜんぶ} 、 {数|かぞ}えて おく 。 || I'll count them. …Every last one.
!note lw_kr_toshin

@scene ko.lw_kr_wicks_after
narr: {灯心|とうしん} の {束|たば} 。 アヤ の {字|じ} で 、 {数|かず} が {書|か}いて ある 。 「{二百十二|にひゃくじゅうに} {本|ほん} 」 。 || The bundles of rush wicks, with Aya's count in her own hand: "Two hundred and twelve."
`);
})(RB.living, RB.content);
