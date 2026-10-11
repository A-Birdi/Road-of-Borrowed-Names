/* Ashihara Shinden: the language of making a village (expansion P15f; plan 07_REGIONS.md R7; the scenes in
 * 20_scenes.js). Every task has its four levels; several have more than one right answer, and the one you give is
 * the one the village gets (a forged sentence's `result`, read by the scene: RB.challenge.run leaves it in var._forge).
 *   as.name_main / as.name_canal / as.name_hill   naming the three ways from what the people say of them (〜と呼ぶ,
 *                  〜と名付ける); two right names each, and a wrong one that says why
 *   as.notice_water   the first notice: the well is for drinking; washing at the stream, or at the reed bank
 *   as.notice_market  market day: every fifth day (〜ごとに), in front of the notice board, or at the bridge
 *   as.fest_lanterns  where the festival's lanterns go (along the road, the channel or the slope)
 *   as.fest_food      how much to cook (counters: 個, and rice by the real old measures, 合 and 升)
 *   as.fest_order     the evening's order (まず, その次に, それから, 最後に)
 *   encounters: as.water (Yoshizō and Taki, the channel's water: a mediation, E8), as.noise (Shō and Natsu, the forge
 *   and the baby: a mediation). Each settles more than one way, and the way it settles changes the village. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  const say = (jp, en) => ({ jp, en });
  const F = (o) => Object.assign({ kind: 'forge' }, o);
  const ch = (o) => Object.assign({ kind: 'choose' }, o);
  const OR = (o) => Object.assign({ kind: 'order' }, o);
  const ok = (parts, en, result) => ({ parts, ok: true, en, result });
  const no = (parts, en, why, result) => ({ parts, ok: false, en, why: { en: why }, result });
  const o = (jp, ok1, why) => Object.assign({ jp, ok: !!ok1 }, why ? { why: { en: why } } : {});
  const tiers = (low, high) => ({ F: [low], E: [low], I: [high], A: [high] });
  C.challenges = C.challenges || {};

  // ---- naming the three ways ---------------------------------------------------------------------------------------------
  // what the people say of each way (shown before the naming, at the level of the task)
  C.asWays = {
    main: { low: 'この みち は 、 あしのせ から まっすぐ きて 、 むら の まんなか を とおる 。', high: 'この {道|みち} は 、 {葦|あし}ノ{瀬|せ} から まっすぐ {来|き}て 、 {村|むら} の {真|ま}ん{中|なか} を {通|とお}る 。', en: 'This road comes straight from Reedwake and runs through the middle of the village.',
      names: { ashinose: ['{葦|あし}ノ{瀬|せ}{道|みち}', 'the Reedwake Road'], hon: ['{本通|ほんどお}り', 'Main Street'] } },
    canal: { low: 'この こみち は 、 ヨシゾウ が ほった すいろ に そって いる 。', high: 'この {小道|こみち} は 、 ヨシゾウ さん が {掘|ほ}った {水路|すいろ} に {沿|そ}って いる 。', en: 'This lane runs along the channel Yoshizō dug.',
      names: { suiro: ['{水路|すいろ}{通|どお}り', 'Channel Lane'], yoshizo: ['ヨシゾウ{通|どお}り', 'Yoshizō Lane'] } },
    hill: { low: 'この さか を のぼる と 、 まつ が いっぽん だけ たって いる 。 むら で いちばん たかい ところ だ 。', high: 'この {坂|さか} を {上|のぼ}る と 、 {松|まつ} が {一本|いっぽん} だけ {立|た}って いる 。 {村|むら} で {一番|いちばん} {高|たか}い {所|ところ} だ 。', en: 'Climb this slope and there is a single pine standing at the top. It is the highest place in the village.',
      names: { matsu: ['{一本松|いっぽんまつ}{坂|ざか}', 'Lone Pine Slope'], miharashi: ['{見晴|みは}らし{坂|ざか}', 'Lookout Slope'] } },
  };
  function naming(key, low, high, item) {
    const w = C.asWays[key];
    C.challenges['as.name_' + key] = { title: T('Naming the way', '{道|みち} に {名前|なまえ} を'), tiers: tiers(
      F({ id: 'as.name_' + key + '.low', item, ctx: { jp: w.low, en: '' }, prompt: T('Name this way from what they said of it. Either name that fits is right.'),
        families: low.map(([parts, en, res, why]) => (why ? no(parts, en, why, res) : ok(parts, en, res))) }),
      F({ id: 'as.name_' + key + '.high', item, ctx: { jp: w.high, en: '' }, prompt: T('Name this way from what they said of it. Either name that fits is right.'),
        families: high.map(([parts, en, res, why]) => (why ? no(parts, en, why, res) : ok(parts, en, res))) })) };
  }
  naming('main', [
    [['この みち を', 'あしのせ みち', 'と よびましょう 。'], 'Let\'s call this road the Reedwake Road.', 'ashinose'],
    [['この みち を', 'ほんどおり', 'と よびましょう 。'], 'Let\'s call this road Main Street.', 'hon'],
    [['この みち を', 'はまどおり', 'と よびましょう 。'], 'Let\'s call this road Beach Street.', 'hama', 'はま is a beach, and there is none here: name it for what it is.'],
  ], [
    [['この {道|みち} を', '{葦|あし}ノ{瀬|せ}{道|みち}', 'と {名付|なづ}けましょう 。'], 'Let\'s name this road the Reedwake Road.', 'ashinose'],
    [['この {道|みち} を', '{本通|ほんどお}り', 'と {名付|なづ}けましょう 。'], 'Let\'s name this road Main Street.', 'hon'],
    [['この {道|みち} を', '{浜通|はまどお}り', 'と {名付|なづ}けましょう 。'], 'Let\'s name this road Beach Street.', 'hama', '{浜|はま} is a beach, and there is none here: name it for what it is.'],
  ], 'g:kr_to_iu');
  naming('canal', [
    [['この こみち を', 'すいろどおり', 'と よびましょう 。'], 'Let\'s call this lane Channel Lane.', 'suiro'],
    [['この こみち を', 'ヨシゾウどおり', 'と よびましょう 。'], 'Let\'s call this lane Yoshizō Lane.', 'yoshizo'],
    [['この こみち を', 'さかみち', 'と よびましょう 。'], 'Let\'s call this lane the Slope.', 'saka', 'さかみち is a slope, and this lane is flat beside the water.'],
  ], [
    [['この {小道|こみち} を', '{水路|すいろ}{通|どお}り', 'と {名付|なづ}けましょう 。'], 'Let\'s name this lane Channel Lane.', 'suiro'],
    [['この {小道|こみち} を', 'ヨシゾウ{通|どお}り', 'と {名付|なづ}けましょう 。'], 'Let\'s name this lane Yoshizō Lane.', 'yoshizo'],
    [['この {小道|こみち} を', '{坂道|さかみち}', 'と {名付|なづ}けましょう 。'], 'Let\'s name this lane the Slope.', 'saka', '{坂道|さかみち} is a slope, and this lane is flat beside the water.'],
  ], 'g:kr_to_iu');
  naming('hill', [
    [['この さか を', 'いっぽんまつざか', 'と よびましょう 。'], 'Let\'s call this slope Lone Pine Slope.', 'matsu'],
    [['この さか を', 'みはらしざか', 'と よびましょう 。'], 'Let\'s call this slope Lookout Slope.', 'miharashi'],
    [['この さか を', 'かわばた', 'と よびましょう 。'], 'Let\'s call this slope Riverside.', 'kawabata', 'かわばた is beside a river; this slope climbs away from the water.'],
  ], [
    [['この {坂|さか} を', '{一本松|いっぽんまつ}{坂|ざか}', 'と {名付|なづ}けましょう 。'], 'Let\'s name this slope Lone Pine Slope.', 'matsu'],
    [['この {坂|さか} を', '{見晴|みは}らし{坂|ざか}', 'と {名付|なづ}けましょう 。'], 'Let\'s name this slope Lookout Slope.', 'miharashi'],
    [['この {坂|さか} を', '{川端|かわばた}', 'と {名付|なづ}けましょう 。'], 'Let\'s name this slope Riverside.', 'kawabata', '{川端|かわばた} is beside a river; this slope climbs away from the water.'],
  ], 'g:kr_to_iu');

  // ---- the first notices (A17: people do what they say) ------------------------------------------------------------------------
  C.challenges['as.notice_water'] = { title: T('The well notice', '{井戸|いど} の {知|し}らせ'), tiers: tiers(
    F({ id: 'as.notice_water.low', item: 'g:tame', prompt: T('People are washing clothes at the drinking well. Write the notice: the well is for drinking; washing goes elsewhere (the stream below the forge, or the reed bank: your choice).'),
      families: [
        ok(['いど の みず は 、 のむ ため の みず です 。', 'せんたく は 、', 'おがわ で して ください 。'], 'The well\'s water is for drinking. Please do your washing at the stream.', 'stream'),
        ok(['いど の みず は 、 のむ ため の みず です 。', 'せんたく は 、', 'あし の きし で して ください 。'], 'The well\'s water is for drinking. Please do your washing on the reed bank.', 'reeds'),
        no(['いど の みず は 、 のむ ため の みず です 。', 'せんたく は 、', 'いど で して ください 。'], 'The well\'s water is for drinking. Please do your washing at the well.', 'Washing at the well is what the notice is meant to stop.', 'well'),
      ] }),
    F({ id: 'as.notice_water.high', item: 'g:v_te_kudasai', prompt: T('People are washing clothes at the drinking well. Write the notice politely: the well is for drinking; washing goes elsewhere (the stream, or the reed bank: your choice).'),
      families: [
        ok(['{井戸|いど} の {水|みず} は 、 {飲|の}み{水|みず} です 。', '{洗濯|せんたく} は 、', '{小川|おがわ} で お{願|ねが}いします 。'], 'The well\'s water is drinking water. Washing at the stream, please.', 'stream'),
        ok(['{井戸|いど} の {水|みず} は 、 {飲|の}み{水|みず} です 。', '{洗濯|せんたく} は 、', '{葦|あし} の {岸|きし} で お{願|ねが}いします 。'], 'The well\'s water is drinking water. Washing on the reed bank, please.', 'reeds'),
        no(['{井戸|いど} の {水|みず} は 、 {飲|の}み{水|みず} です 。', '{洗濯|せんたく} は 、', '{井戸|いど} で お{願|ねが}いします 。'], 'The well\'s water is drinking water. Washing at the well, please.', 'Washing at the well is what the notice is meant to stop.', 'well'),
      ] })) };
  C.challenges['as.notice_market'] = { title: T('Market day', '{市|いち} の {日|ひ}'), tiers: tiers(
    F({ id: 'as.notice_market.low', item: 'g:mod_goto', prompt: T('Write the market notice: a market every fifth day, in front of the notice board or at the foot of the bridge (your choice).'),
      families: [
        ok(['いつか ごと に 、', 'けいじばん の まえ で', 'いち を ひらきます 。'], 'Every fifth day, a market in front of the notice board.', 'board'),
        ok(['いつか ごと に 、', 'はし の たもと で', 'いち を ひらきます 。'], 'Every fifth day, a market at the foot of the bridge.', 'bridge'),
        no(['いつか ごと に 、', 'たんぼ の なか で', 'いち を ひらきます 。'], 'Every fifth day, a market in the middle of the paddies.', 'A market in the paddies would trample the young rice.', 'paddy'),
      ] }),
    F({ id: 'as.notice_market.high', item: 'g:mod_goto', prompt: T('Write the market notice: a market every fifth day, in front of the notice board or at the foot of the bridge (your choice).'),
      families: [
        ok(['{五日|いつか} ごと に 、', '{掲示板|けいじばん} の {前|まえ} で', '{市|いち} を {開|ひら}きます 。'], 'Every fifth day, a market in front of the notice board.', 'board'),
        ok(['{五日|いつか} ごと に 、', '{橋|はし} の たもと で', '{市|いち} を {開|ひら}きます 。'], 'Every fifth day, a market at the foot of the bridge.', 'bridge'),
        no(['{五日|いつか} ごと に 、', '{田|た}んぼ の {中|なか} で', '{市|いち} を {開|ひら}きます 。'], 'Every fifth day, a market in the middle of the paddies.', 'A market in the paddies would trample the young rice.', 'paddy'),
      ] })) };

  // ---- the first festival (A50) ------------------------------------------------------------------------------------------------
  C.challenges['as.fest_lanterns'] = { title: T('The lanterns', '{提灯|ちょうちん}'), tiers: tiers(
    F({ id: 'as.fest_lanterns.low', item: 'g:prt_ni', prompt: T('Tell the young people where to hang the lanterns: along the road, along the channel, or up the slope. It is your choice.'),
      families: [
        ok(['ちょうちん を', 'みち に そって', 'かざって ください 。'], 'Please hang the lanterns along the road.', 'street'),
        ok(['ちょうちん を', 'すいろ に そって', 'かざって ください 。'], 'Please hang the lanterns along the channel.', 'canal'),
        ok(['ちょうちん を', 'さか に そって', 'かざって ください 。'], 'Please hang the lanterns up the slope.', 'hill'),
        no(['ちょうちん を', 'たんぼ の なか に', 'かざって ください 。'], 'Please hang the lanterns in the middle of the paddies.', 'In the paddies they would stand in the young rice.', 'paddy'),
      ] }),
    F({ id: 'as.fest_lanterns.high', item: 'g:cond_tara', prompt: T('Tell them where to hang the lanterns and when to light them: once it is dark. Where is your choice.'),
      families: [
        ok(['{暗|くら}く なったら 、', '{道|みち} に {沿|そ}った {提灯|ちょうちん} を', '{灯|とも}して ください 。'], 'Once it is dark, please light the lanterns along the road.', 'street'),
        ok(['{暗|くら}く なったら 、', '{水路|すいろ} に {沿|そ}った {提灯|ちょうちん} を', '{灯|とも}して ください 。'], 'Once it is dark, please light the lanterns along the channel.', 'canal'),
        ok(['{暗|くら}く なったら 、', '{坂|さか} に {沿|そ}った {提灯|ちょうちん} を', '{灯|とも}して ください 。'], 'Once it is dark, please light the lanterns up the slope.', 'hill'),
        no(['{明|あか}るい うち に 、', '{道|みち} に {沿|そ}った {提灯|ちょうちん} を', '{灯|とも}して ください 。'], 'While it is still light, please light the lanterns along the road.', 'Lit in daylight they would burn out before the night: {暗|くら}く なったら, once it is dark.', 'early'),
      ] })) };
  C.challenges['as.fest_food'] = { title: T('Enough for everyone', '{皆|みんな} の {分|ぶん}'), tiers: {
    F: [ch({ item: 'g:counters', ctx: { jp: 'ひとり ふたつ ずつ 。 むら の ひと は さんじゅうにん 。', en: '' }, prompt: T('Two rice balls each, thirty people. How many to make?'),
      options: [o('ろくじゅっこ', 1), o('さんじゅうにこ', 0, 'That adds two to thirty; it is two for each of thirty: 30 × 2.')] })],
    E: [ch({ item: 'g:counters', ctx: { jp: '{一人|ひとり} {二|ふた}つ ずつ 。 {村|むら} の {人|ひと} は {三十人|さんじゅうにん} 。', en: '' }, prompt: T('Two rice balls each, thirty people. How many to make?'),
      options: [o('{六十個|ろくじゅっこ}', 1), o('{三十二個|さんじゅうにこ}', 0, 'That adds two to thirty; it is two for each of thirty: 30 × 2.'), o('{十五個|じゅうごこ}', 0, 'That is thirty shared between two; it is two for each of thirty.')] })],
    I: [ch({ item: 'g:counters', ctx: { jp: '{湯呑|ゆの}み は {一人|ひとり} {一|ひと}つ 。 {三十人|さんじゅうにん} と 、 {割|わ}れた {時|とき} の ため に {十|とお} {余分|よぶん} に 。', en: '' }, prompt: T('Teacups: one each for thirty people, and ten spare in case of breakages. How many?'),
      options: [o('{四十個|よんじゅっこ}', 1), o('{三十個|さんじゅっこ}', 0, 'And ten spare: 30 + 10.'), o('{三百個|さんびゃっこ}', 0, 'That is thirty times ten; it is thirty plus ten.')] })],
    A: [ch({ item: 'g:counters', ctx: { jp: 'お{米|こめ} は {一人|ひとり} {一合|いちごう} 。 {三十人|さんじゅうにん} なら 、 {何合|なんごう} 、 つまり {何升|なんしょう} か 。', en: '' }, prompt: T('Rice: one gō each for thirty people. How many gō, that is, how many shō? (Real old measures: 10 gō make 1 shō.)'),
      options: [o('{三十合|さんじゅうごう} 、 つまり {三升|さんしょう}', 1), o('{三十合|さんじゅうごう} 、 つまり {三十升|さんじゅっしょう}', 0, 'Ten gō make one shō, so thirty gō are three shō.'), o('{三合|さんごう} 、 つまり {三升|さんしょう}', 0, 'One gō each for thirty people is thirty gō.')] })],
  } };
  const PR = {
    low: ['まず 、 ミツエ が あいさつ を する', 'つぎ に 、 こども たち が うたう', 'それから 、 みんな で おどる', 'さいご に 、 たきび を かこむ'],
    high: ['まず 、 ミツエ さん が {挨拶|あいさつ} を する', 'その {次|つぎ} に 、 {子供|こども} たち が {歌|うた}う', 'それから 、 {皆|みんな} で {踊|おど}る', '{最後|さいご} に 、 {焚|た}き{火|び} を {囲|かこ}む'],
  };
  C.asFestOrder = PR;
  C.challenges['as.fest_order'] = { title: T('The evening\'s order', '{夜|よる} の {順番|じゅんばん}'), tiers: {
    F: [OR({ item: 'g:mae_ato', ctx: { jp: 'こども たち は はやく ねむく なる 。 たきび は さいご 。', en: '' }, prompt: T('Put the evening in order. The children get sleepy early; the fire comes last.'), tiles: [PR.low[2], PR.low[0], PR.low[3], PR.low[1]], answer: PR.low,
      orderHint: T('まず first, つぎに next, それから after that, さいごに last.') })],
    E: [OR({ item: 'g:mae_ato', ctx: { jp: '{子供|こども} たち は {早|はや}く {眠|ねむ}く なる 。 {焚|た}き{火|び} は {最後|さいご} 。', en: '' }, prompt: T('Put the evening in order. The children get sleepy early; the fire comes last.'), tiles: [PR.high[3], PR.high[1], PR.high[0], PR.high[2]], answer: PR.high,
      orderHint: T('まず first, その{次|つぎ}に next, それから after that, {最後|さいご}に last.') })],
    I: [OR({ item: 'g:v_te_kara', ctx: { jp: '{挨拶|あいさつ} が {済|す}んで から 、 {子供|こども} たち が {眠|ねむ}く なる {前|まえ} に {歌|うた}う 。', en: '' }, prompt: T('Put the evening in order, by what Mitsue says.'), tiles: [PR.high[2], PR.high[3], PR.high[0], PR.high[1]], answer: PR.high,
      orderHint: T('{挨拶|あいさつ}が{済|す}んでから: after the greeting; {眠|ねむ}くなる{前|まえ}に: before they get sleepy.') })],
    A: [OR({ item: 'g:v_te_kara', ctx: { jp: '{挨拶|あいさつ} が {済|す}んで から 、 {子供|こども} たち が {眠|ねむ}く なる {前|まえ} に {歌|うた}う 。 {焚|た}き{火|び} を {囲|かこ}む の は 、 {踊|おど}り {疲|つか}れて から で いい 。', en: '' }, prompt: T('Put the evening in order, by what Mitsue says.'), tiles: [PR.high[1], PR.high[3], PR.high[2], PR.high[0]], answer: PR.high,
      orderHint: T('{踊|おど}り{疲|つか}れてから: once everyone is tired from dancing, so the fire is last.') })],
  } };

  // ---- the quarrels (E8: mediation) ------------------------------------------------------------------------------------------------
  function task(item, en, okJp, w1, why1, w2, why2) {
    const low = ch({ item, prompt: { en }, options: [{ jp: okJp, ok: true }, { jp: w1, ok: false, why: { en: why1 } }] });
    const high = ch({ item, prompt: { en: en + ' (Read them closely: two are near.)' }, options: [{ jp: okJp, ok: true }, { jp: w1, ok: false, why: { en: why1 } }, { jp: w2, ok: false, why: { en: why2 } }] });
    return { F: low, E: low, I: high, A: high };
  }
  C.encounters = C.encounters || {};
  // Yoshizō and Taki: the channel's water
  C.encounters['as.water'] = {
    id: 'as.water', kind: 'social', name: say('{水路|すいろ} の {水|みず}', 'The channel\'s water'),
    rules: { wait: true },
    autoRoute: ['s:restate', 's:restate', 's:ask_yoshizo', 's:ask_taki', 's:time'],
    social: {
      parties: [
        { aid: 'n:yoshizo', name: say('ヨシゾウ', 'Yoshizō'), stance: 'heated', wants: { en: 'The channel\'s water on his paddy first: he dug it.' } },
        { aid: 'n:taki', name: say('タキ', 'Taki'), stance: 'heated', wants: { en: 'Water for her paddy too, before her seedlings die.' } },
      ],
      claims: {
        dug: { by: 'n:yoshizo', jp: 'この {水路|すいろ} は 、 {俺|おれ} が {掘|ほ}った ん だ 。 {水|みず} は 、 まず {俺|おれ} の {田|た}んぼ に {入|い}れる 。', en: 'Yoshizō: "I dug this channel. The water goes into my paddy first."' },
        dying: { by: 'n:taki', jp: 'うち の {苗|なえ} が 、 {枯|か}れ そう な の よ 。 {一日|いちにち} {中|じゅう} 、 {水門|すいもん} を {閉|し}めて いる じゃ ない 。', en: 'Taki: "My seedlings are about to wither. You keep the sluice shut all day!"' },
        high: { by: 'n:yoshizo', jp: '…… {俺|おれ} の {田|た}んぼ は 、 {高|たか}い {所|ところ} に ある 。 {水門|すいもん} を {開|あ}けたら 、 {夕方|ゆうがた} に は {干上|ひあ}がる 。 {最初|さいしょ} の {米|こめ} が {取|と}れなかったら 、 {家族|かぞく} に {食|た}べさせる もの が ない 。', en: 'Yoshizō: "…My paddy is on the high ground. Open the sluice and it\'s dry by evening. If the first rice fails, I\'ve nothing to feed my family."', hidden: true },
        morning: { by: 'n:taki', jp: '{全部|ぜんぶ} {欲|ほ}しい なんて 、 {言|い}って ない わ 。 {朝|あさ} だけ で いい の 。 {日|ひ} が {低|ひく}い うち に 。', en: 'Taki: "I never said I wanted all of it. Just the mornings, while the sun is low."', hidden: true },
      },
      understanding: 4,
      gesture: { name: say('{二|ふた}つ の {田|た}んぼ の {土|つち} に {触|さわ}る', 'Feel the soil of both paddies'), desc: 'Kneel at each paddy and feel how dry its soil is.', effect: { understanding: 1, stance: { 'n:yoshizo': 'listening', 'n:taki': 'listening' } }, once: true, says: { en: 'Yoshizō\'s soil is damp and dark; Taki\'s crumbles in your fingers. Neither of them says anything, but both of them saw you do it.' } },
      unravelTip: { en: 'Nothing is knotted. Both of them are afraid of the same thing: a first harvest that fails.' },
      actions: [
        { id: 'restate', kind: 'restate', label: say('お{二人|ふたり} と も 、 {自分|じぶん} の {田|た}んぼ の {水|みず} が {心配|しんぱい} なん です ね 。', 'Say back what both of them are afraid of'),
          task: task('g:n_desu', 'Which says back what both of them are afraid of?', 'お{二人|ふたり} と も 、 {自分|じぶん} の {田|た}んぼ の {水|みず} が {心配|しんぱい} なん です ね 。', 'お{二人|ふたり} と も 、 {水|みず} が {嫌|きら}い なん です ね 。', 'They both need water; neither dislikes it.', 'ヨシゾウ さん が {悪|わる}い ん です ね 。', 'That takes a side before you have heard either.'),
          cases: [{ when: { stance: { 'n:yoshizo': 'heated' } }, effect: { stance: { 'n:yoshizo': 'listening' } }, says: { en: 'Yoshizō folds his arms. "…Well. Yes."' } },
            { when: { stance: { 'n:taki': 'heated' } }, effect: { stance: { 'n:taki': 'listening' }, understanding: 1 }, says: { en: 'Taki lets out a breath. "Somebody finally said it."' } }],
          says: { en: 'They are already listening.' } },
        { id: 'ask_yoshizo', kind: 'ask', label: say('ヨシゾウ さん 、 {水門|すいもん} を {開|あ}けたら 、 どう なる ん です か 。', 'Ask Yoshizō what happens if he opens the sluice'), once: true, when: { stance: { 'n:yoshizo': 'listening' } },
          task: task('g:cond_tara', 'Which asks Yoshizō what would happen if he opened the sluice?', 'ヨシゾウ さん 、 {水門|すいもん} を {開|あ}けたら 、 どう なる ん です か 。', 'ヨシゾウ さん 、 {水門|すいもん} は いくら でした か 。', 'That asks what it cost.', 'ヨシゾウ さん 、 {水門|すいもん} を {壊|こわ}して も いい です か 。', 'That asks to break it.'),
          effect: { reveal: 'high', understanding: 1 }, says: { en: 'Yoshizō looks up at his paddy. "It\'s on the high ground. Open the sluice and it\'s dry by evening. If the first rice fails, I\'ve nothing to feed them."' } },
        { id: 'ask_taki', kind: 'ask', label: say('タキ さん は 、 いつ {水|みず} が あれば いい ん です か 。', 'Ask Taki when she needs the water'), once: true, when: { stance: { 'n:taki': 'listening' } },
          task: task('g:toki', 'Which asks Taki when she needs the water?', 'タキ さん は 、 いつ {水|みず} が あれば いい ん です か 。', 'タキ さん は 、 どこ に {住|す}んで いる ん です か 。', 'That asks where she lives.', 'タキ さん は 、 {何人|なんにん} {家族|かぞく} です か 。', 'That asks how big her family is.'),
          effect: { reveal: 'morning', understanding: 1 }, says: { en: 'Taki blinks, as if no one had asked. "Mornings. Only the mornings, while the sun is low. I never wanted all of it."' } },
        { id: 'time', kind: 'propose', label: say('{朝|あさ} は タキ さん の {田|た}んぼ に 、 {昼|ひる} から は ヨシゾウ さん の {田|た}んぼ に {水|みず} を {流|なが}す の は どう です か 。', 'Propose: mornings to Taki\'s paddy, afternoons to Yoshizō\'s'), when: { claims: ['high', 'morning'] },
          task: task('g:prt_ni', 'Which proposes the water go to Taki\'s paddy in the mornings and Yoshizō\'s from noon?', '{朝|あさ} は タキ さん の {田|た}んぼ に 、 {昼|ひる} から は ヨシゾウ さん の {田|た}んぼ に {水|みず} を {流|なが}す の は どう です か 。', '{朝|あさ} は ヨシゾウ さん の {田|た}んぼ に 、 {夜|よる} は タキ さん の {田|た}んぼ に {流|なが}しましょう 。', 'At night the sun is no help to Taki\'s seedlings, and she asked for mornings.', '{水|みず} は 、 {全部|ぜんぶ} タキ さん の {田|た}んぼ に {流|なが}しましょう 。', 'Yoshizō\'s high paddy would be dry by evening.'),
          effect: { flag: 'time' }, says: { en: 'Yoshizō and Taki look at each other. "Mornings for you," Yoshizō says gruffly. "Afternoons for me." Taki nods. "And we write it on a board, so nobody forgets."' } },
        { id: 'days', kind: 'propose', label: say('{一日|いちにち} おき に 、 {交代|こうたい} で {水|みず} を {流|なが}しません か 。', 'Propose taking the water on alternate days'), when: { claims: ['high', 'morning'] },
          task: task('g:indirectness', 'Which proposes, gently, taking turns day by day?', '{一日|いちにち} おき に 、 {交代|こうたい} で {水|みず} を {流|なが}しません か 。', '{一日|いちにち} {中|じゅう} 、 {水門|すいもん} を {閉|し}めて おきましょう 。', 'That is the very thing Taki is upset about.', '{水|みず} は 、 {早|はや}い {者|もの} {勝|が}ち に しましょう 。', 'First come, first served is a race, not a turn.'),
          effect: { flag: 'days' }, says: { en: '"Turn and turn about," says Taki. Yoshizō scratches his head. "My paddy holds water a day, if it\'s full in the morning. …All right." They shake on it, awkwardly.' } },
        { id: 'blunt', kind: 'propose', label: say('{水路|すいろ} は {村|むら} の もの です 。 ヨシゾウ さん {一人|ひとり} の もの じゃ ありません 。', 'Tell Yoshizō the channel isn\'t his alone'), lasting: true, means: { en: 'You will tell Yoshizō, flatly, that the channel isn\'t his.' },
          task: task('g:no_pronoun', 'Which tells Yoshizō flatly that the channel isn\'t his alone?', '{水路|すいろ} は {村|むら} の もの です 。 ヨシゾウ さん {一人|ひとり} の もの じゃ ありません 。', '{水路|すいろ} を {掘|ほ}って くれて 、 ありがとう ございます 。', 'That thanks him.', '{水路|すいろ} は 、 {深|ふか}い です ね 。', 'That remarks on its depth.'),
          effect: { stance: { 'n:yoshizo': 'leaving' } }, says: { en: 'Yoshizō goes red, turns on his heel, and stamps off to his paddy without a word.' } },
      ],
      responses: {
        water: { effect: { stance: { 'n:taki': 'listening' } }, says: { en: 'You pour your flask on Taki\'s nearest seedlings. It is a very small amount of water, and she smiles at it anyway.' } },
        unravel: { says: { en: 'Nothing is knotted. Both of them are afraid of the same thing.' } },
      },
      wait: { when: { stance: { 'n:yoshizo': 'listening' } }, effect: { reveal: 'high', understanding: 1 }, says: { en: 'In the quiet, Yoshizō mutters to the channel: "High ground. Dry by evening. And if the first rice fails…" He doesn\'t finish.' } },
      drift: [{ when: { all: [{ rounds: 3 }, { stance: { 'n:yoshizo': 'heated' } }] }, once: true, effect: { stance: { 'n:yoshizo': 'listening', 'n:taki': 'listening' } }, says: { en: 'Taki\'s two small boys come running with a frog they caught in the channel. Both grown-ups stop to admire it.' } }],
      companion: {
        nao: [{ id: 'nao_rota', name: say('{配達|はいたつ} の {順番|じゅんばん}', 'A courier\'s round'), desc: 'Nao knows about sharing a road by turns.', once: true, effect: { understanding: 1, stance: { 'n:yoshizo': 'listening' } }, says: { en: 'Nao: "Two couriers, one mountain road, one mule. We took it in turns. Never once did we both go hungry."' } }],
        mio: [{ id: 'mio_soil', name: say('{土|つち} を {診|み}る', 'Read the soil'), desc: 'Mio reads soil as she reads a fever.', once: true, effect: { understanding: 1, stance: { 'n:taki': 'listening' } }, says: { en: 'Mio crumbles Taki\'s soil between her fingers. "Mornings would be enough for this. Watered at noon, half of it would only steam away."' } }],
        ren: [{ id: 'ren_lamp', name: say('{灯|ひ} の {番|ばん}', 'Keeping the lamps by turns'), desc: 'Ren tells how the lamp-keepers shared the road\'s lanterns.', once: true, effect: { understanding: 1, stance: { 'n:yoshizo': 'listening' } }, says: { en: 'Ren: "On the Keepers\' Road, one keeper lit the lamps at dusk and another trimmed them at dawn. Neither owned the road. Both kept it."' } }],
        suzu: [{ id: 'suzu_billing', name: say('{二人|ふたり} {主役|しゅやく}', 'Two leads'), desc: 'Suzu knows a show can have two leads.', once: true, effect: { understanding: 1 }, says: { en: 'Suzu: "A play can have two leads, you know. One gets the first act, one gets the second. The audience loves them both."' } }],
      },
    },
    conclusions: [
      { id: 'left', when: { left: 'n:yoshizo' }, result: 'end', text: { en: 'Yoshizō has stamped off to his paddy. Give him time; you can talk to them both again.' } },
      { id: 'time', when: { flag: 'time' }, result: 'win', text: { en: 'Mornings for Taki\'s paddy, afternoons for Yoshizō\'s.' }, flags: { as_rota_time: true } },
      { id: 'days', when: { flag: 'days' }, result: 'win', text: { en: 'The water by turns, a day each.' }, flags: { as_rota_days: true } },
    ],
  };

  // Shō and Natsu: the forge and the baby
  C.encounters['as.noise'] = {
    id: 'as.noise', kind: 'social', name: say('{鍛冶場|かじば} の {音|おと}', 'The forge\'s noise'),
    rules: { wait: true },
    autoRoute: ['s:restate', 's:restate', 's:ask_natsu', 's:ask_sho', 's:hours'],
    social: {
      parties: [
        { aid: 'n:sho', name: say('ショウ', 'Shō'), stance: 'heated', wants: { en: 'To keep working: every sickle for the harvest must be made in time.' } },
        { aid: 'n:natsu', name: say('ナツ', 'Natsu'), stance: 'heated', wants: { en: 'Quiet, so her baby can sleep.' } },
      ],
      claims: {
        sickles: { by: 'n:sho', jp: '{稲刈|いねか}り まで に 、 {鎌|かま} を {二十本|にじゅっぽん} {作|つく}らなければ ならない 。 {休|やす}んで いる {暇|ひま} は ない 。', en: 'Shō: "Twenty sickles before the harvest. There\'s no time to rest."' },
        baby: { by: 'n:natsu', jp: '{赤|あか}ちゃん が 、 {一日|いちにち} {中|じゅう} {泣|な}いて いる ん です 。 カン カン と いう {音|おと} で 、 すぐ {起|お}きて しまう ん です 。', en: 'Natsu: "The baby cries all day. That clang-clang wakes her every time."' },
        cool: { by: 'n:sho', jp: '…… {本当|ほんとう} は 、 {朝|あさ} の {涼|すず}しい うち に {打|う}つ ほう が いい 。 {炭|すみ} も {少|すく}なくて {済|す}む 。', en: 'Shō: "…Truth is, the cool of the morning is better for the work. Uses less charcoal, too."', hidden: true },
        nap: { by: 'n:natsu', jp: 'この {子|こ} が {眠|ねむ}る の は 、 お{昼|ひる} の {後|あと} だけ なん です 。 {朝|あさ} は 、 {起|お}きて います 。', en: 'Natsu: "She only sleeps after midday. In the mornings she\'s awake anyway."', hidden: true },
      },
      understanding: 4,
      gesture: { name: say('{赤|あか}ちゃん を {抱|だ}っこ する', 'Hold the baby for a moment'), desc: 'Offer to hold the baby so Natsu can sit down.', effect: { understanding: 1, stance: { 'n:natsu': 'listening' } }, once: true, says: { en: 'Natsu hands her over and sits down on the doorstep as if her legs had given way. The baby looks up at you, very seriously, and yawns.' } },
      unravelTip: { en: 'Nothing is knotted. Two people who are both very tired, for different reasons.' },
      actions: [
        { id: 'restate', kind: 'restate', label: say('ショウ さん は {仕事|しごと} を 、 ナツ さん は {赤|あか}ちゃん の {眠|ねむ}り を 、 {守|まも}りたい ん です ね 。', 'Say back what each of them wants to protect'),
          task: task('g:v_tai', 'Which says back what each of them wants to protect?', 'ショウ さん は {仕事|しごと} を 、 ナツ さん は {赤|あか}ちゃん の {眠|ねむ}り を 、 {守|まも}りたい ん です ね 。', 'お{二人|ふたり} と も 、 {静|しず}か に したい ん です ね 。', 'Shō wants to work, not to be quiet.', 'ショウ さん は {寝|ね}たい ん です ね 。', 'It is the baby who needs to sleep.'),
          cases: [{ when: { stance: { 'n:sho': 'heated' } }, effect: { stance: { 'n:sho': 'listening' } }, says: { en: 'Shō sets down the hammer. "…Yes."' } },
            { when: { stance: { 'n:natsu': 'heated' } }, effect: { stance: { 'n:natsu': 'listening' }, understanding: 1 }, says: { en: 'Natsu\'s shoulders drop. "Yes. That\'s all. Just sleep."' } }],
          says: { en: 'They are already listening.' } },
        { id: 'ask_natsu', kind: 'ask', label: say('{赤|あか}ちゃん は 、 いつ {眠|ねむ}る ん です か 。', 'Ask Natsu when the baby sleeps'), once: true, when: { stance: { 'n:natsu': 'listening' } },
          task: task('g:toki', 'Which asks Natsu when the baby sleeps?', '{赤|あか}ちゃん は 、 いつ {眠|ねむ}る ん です か 。', '{赤|あか}ちゃん は 、 {何歳|なんさい} です か 。', 'That asks her age.', '{赤|あか}ちゃん は 、 {誰|だれ} に {似|に}て います か 。', 'That asks who she takes after.'),
          effect: { reveal: 'nap', understanding: 1 }, says: { en: '"After midday," Natsu says. "Only then. In the mornings she\'s wide awake whatever anyone does."' } },
        { id: 'ask_sho', kind: 'ask', label: say('{朝|あさ} だけ {打|う}つ こと は できます か 。', 'Ask Shō whether they could work mornings only'), once: true, when: { stance: { 'n:sho': 'listening' } },
          task: task('g:v_potential', 'Which asks Shō whether they could hammer in the mornings only?', '{朝|あさ} だけ {打|う}つ こと は できます か 。', '{朝|あさ} は 、 {何|なに} を {食|た}べます か 。', 'That asks about breakfast.', '{鎌|かま} を 、 {一本|いっぽん} {売|う}って くれます か 。', 'That asks to buy a sickle.'),
          effect: { reveal: 'cool', understanding: 1 }, says: { en: 'Shō considers it. "The cool of the morning is better for the work anyway. Less charcoal."' } },
        { id: 'hours', kind: 'propose', label: say('{朝|あさ} は ショウ さん が {打|う}って 、 {昼|ひる} から は {静|しず}か に する 。 それ で どう です か 。', 'Propose: hammering in the mornings, quiet from noon'), when: { claims: ['nap', 'cool'] },
          task: task('g:mae_ato', 'Which proposes hammering in the mornings and quiet after noon?', '{朝|あさ} は ショウ さん が {打|う}って 、 {昼|ひる} から は {静|しず}か に する 。 それ で どう です か 。', '{昼|ひる} は ショウ さん が {打|う}って 、 {朝|あさ} は {静|しず}か に する 。 それ で どう です か 。', 'The afternoon is when the baby sleeps.', '{一日|いちにち} {中|じゅう} 、 {静|しず}か に しましょう 。', 'Then no sickles before the harvest.'),
          effect: { flag: 'hours' }, says: { en: '"Mornings, then," says Shō. "And in the afternoons I\'ll help Yoshizō in his paddy." Natsu laughs for the first time. "You\'ll be quieter there?" "Quieter than Yoshizō."' } },
        { id: 'move', kind: 'propose', label: say('{鍛冶場|かじば} を 、 {田|た}んぼ の {向|む}こう に {移|うつ}したら どう です か 。 そこ なら 、 {音|おと} が {届|とど}きません 。', 'Propose moving the forge beyond the paddies'), when: { claims: ['sickles'] },
          task: task('g:cond_tara', 'Which proposes moving the forge out beyond the paddies?', '{鍛冶場|かじば} を 、 {田|た}んぼ の {向|む}こう に {移|うつ}したら どう です か 。 そこ なら 、 {音|おと} が {届|とど}きません 。', '{鍛冶場|かじば} を 、 ナツ さん の {家|いえ} の {隣|となり} に {移|うつ}したら どう です か 。', 'It is already next door; that is the problem.', '{赤|あか}ちゃん を 、 {田|た}んぼ の {向|む}こう に {移|うつ}したら どう です か 。', 'Nobody is moving the baby.'),
          effect: { flag: 'moved' }, says: { en: 'Shō looks out past the channel, to the bare ground by Yoshizō\'s house. "An anvil and a fire. That\'s all a forge is." They are already measuring it with their eyes.' } },
        { id: 'blunt', kind: 'propose', label: say('{赤|あか}ちゃん は {泣|な}く もの です 。 {我慢|がまん} して ください 。', 'Tell Natsu babies cry and she must put up with it'), lasting: true, means: { en: 'You will tell Natsu to put up with it.' },
          task: task('g:v_te_kudasai', 'Which tells Natsu to put up with it?', '{赤|あか}ちゃん は {泣|な}く もの です 。 {我慢|がまん} して ください 。', '{少|すこ}し {座|すわ}って 、 {休|やす}んで ください 。', 'That is kind.', '{赤|あか}ちゃん の {名前|なまえ} を {教|おし}えて ください 。', 'That asks the baby\'s name.'),
          effect: { stance: { 'n:natsu': 'leaving' } }, says: { en: 'Natsu goes white, gathers up the baby and shuts her door on all of you.' } },
      ],
      responses: {
        water: { effect: { stance: { 'n:sho': 'listening' } }, says: { en: 'You hand Shō your flask. They drink half of it in one go and nod their thanks.' } },
        unravel: { says: { en: 'Nothing is knotted. Two people, both very tired.' } },
      },
      wait: { when: { stance: { 'n:natsu': 'listening' } }, effect: { reveal: 'nap', understanding: 1 }, says: { en: 'In the quiet the baby snuffles. "After midday," Natsu murmurs. "That\'s the only time she sleeps."' } },
      drift: [{ when: { all: [{ rounds: 3 }, { stance: { 'n:sho': 'heated' } }] }, once: true, effect: { stance: { 'n:sho': 'listening', 'n:natsu': 'listening' } }, says: { en: 'The baby, for no reason at all, falls asleep in the middle of the argument. Both of them stop talking at once and look at her.' } }],
      companion: {
        nao: [{ id: 'nao_mule', name: say('{夜明|よあ}け の {出発|しゅっぱつ}', 'Setting out at dawn'), desc: 'Nao knows the best work is done early.', once: true, effect: { understanding: 1, stance: { 'n:sho': 'listening' } }, says: { en: 'Nao: "Every courier I know leaves before dawn. Cool road, quiet towns, home by noon to sleep. Same thing, isn\'t it?"' } }],
        mio: [{ id: 'mio_sleep', name: say('{眠|ねむ}り の {話|はなし}', 'About sleep'), desc: 'Mio has nursed enough babies to know.', once: true, effect: { understanding: 1, stance: { 'n:natsu': 'listening' } }, says: { en: 'Mio: "A baby\'s sleep comes when it comes. If hers comes after midday, that\'s the hour to guard, and the rest of the day can be as loud as it likes."' } }],
        ren: [{ id: 'ren_bell', name: say('{鐘|かね} の {時刻|じこく}', 'The hours of the bells'), desc: 'Ren tells how Lanternfall\'s bells keep to their hours.', once: true, effect: { understanding: 1 }, says: { en: 'Ren: "In Lanternfall the bells ring only at their hours, and nobody minds them, because everyone knows when the quiet is."' } }],
        suzu: [{ id: 'suzu_rehearse', name: say('{稽古|けいこ} の {時間|じかん}', 'Rehearsal hours'), desc: 'Suzu knows about noisy work and sleeping neighbours.', once: true, effect: { understanding: 1, stance: { 'n:sho': 'listening' } }, says: { en: 'Suzu: "The troupe rehearsed drums in the mornings and lines in the afternoons, because the inn\'s cook slept after lunch. Nobody ever got thrown out."' } }],
      },
    },
    conclusions: [
      { id: 'left', when: { left: 'n:natsu' }, result: 'end', text: { en: 'Natsu has shut her door. She needs a little while; you can try again.' } },
      { id: 'hours', when: { flag: 'hours' }, result: 'win', text: { en: 'Hammering in the mornings; quiet from noon.' }, flags: { as_forge_hours: true } },
      { id: 'moved', when: { flag: 'moved' }, result: 'win', text: { en: 'The forge moves out beyond the paddies.' }, flags: { as_forge_moved: true } },
    ],
  };
})(RB.content);
