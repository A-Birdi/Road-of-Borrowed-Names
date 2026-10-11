/* The Hall of a Hundred Tales, wing 3, The Bell Before Dawn: the language tasks and encounters (expansion P15; plan
 * 04_DUNGEONS.md D9; scenes in 23_w3_scenes.js). The theme: sequence and timing (～てから; ～前に and ～後で; まで and
 * までに; ～と, ～たら and ～とき; on the Grow route ～うちに and ～ところ; at Advanced ～次第). Every task has its four
 * levels and an Advanced stretch.
 *   hall.w3.story      the tale in four pictures, back in order (A38)
 *   hall.w3.story_q    why the bell rings before the dawn (optional)
 *   hall.w3.counter0/1 the bell-ringer's sayings: the one that breaks the rule (A34)
 *   hall.w3.ask        asking your companion what the almanac says about today's hour (A12)
 *   hall.w3.riddle     the riddle stone (a reprieve)
 *   encounters: hall.w3.moths (night moths round the slope lantern in the dawn mist: airborne), hall.w3.mame (Mame,
 *   who drums to hold the night back: a conversation), hall.w3.bell0/1 (the dawn bell, by the almanac's hour: the
 *   capstone procedure). */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const T = (jp, en) => ({ jp, en });
  const ch = (o) => Object.assign({ kind: 'choose' }, o);
  const OR = (o) => Object.assign({ kind: 'order' }, o);
  const o = (jp, ok, why) => Object.assign({ jp, ok: !!ok }, why ? { why: { en: why } } : {});
  const e = (en, ok, why) => Object.assign({ en, ok: !!ok }, why ? { why: { en: why } } : {});
  const say = (jp, en) => ({ jp, en });

  // ---- the story room ----------------------------------------------------------------------------------------------------
  const P1 = '{昔|むかし} 、 {山寺|やまでら} の {鐘|かね} は 、 {毎朝|まいあさ} {夜明|よあ}け の {前|まえ} に {鳴|な}った', P2 = '{鐘|かね} を {撞|つ}く ジンベエ が 、 ある {晩|ばん} 、 {病気|びょうき} に なった',
    P3 = '{孫|まご} の シノ は 、 {灯|ひ} を {持|も}って 、 {暗|くら}い {坂|さか} を {登|のぼ}った', P4 = '{鐘|かね} が {鳴|な}る と 、 {村|むら} が {目|め} を {覚|さ}ました';
  C.hallW3Tale = { P1, P2, P3, P4 };
  const FT = ['むかし 、 やまでら の かね は 、 まいあさ よあけ の まえ に なった', 'かね を つく ジンベエ が 、 ある ばん 、 びょうき に なった', 'まご の シノ は 、 ひ を もって 、 くらい さか を のぼった', 'かね が なる と 、 むら の ひと が おきた'];
  C.hallW3TaleF = FT;
  C.challenges['hall.w3.story'] = { title: T('{夜明|よあ}け {前|まえ} の {鐘|かね}', 'The Bell Before Dawn'), tiers: {
    F: [OR({ item: 'v:鐘', prompt: { en: 'Put the four pictures of the tale back in order.' }, tiles: [FT[2], FT[0], FT[3], FT[1]], answer: FT,
      orderHint: { en: 'The bell every morning; the ringer falls ill; his granddaughter climbs the slope; the village wakes.' } })],
    E: [OR({ item: 'v:鐘', prompt: { en: 'Put the four pictures back in order.' }, tiles: [P3, P1, P4, P2], answer: [P1, P2, P3, P4],
      orderHint: { en: 'First how it always was, then the night it changed, then what Shino did, then what came of it.' } })],
    I: [OR({ item: 'g:mae_ato', prompt: { en: 'Order the pictures so that each follows from the one before.' }, tiles: [P4, P2, P1, P3], answer: [P1, P2, P3, P4],
      orderHint: { en: 'The bell rang before dawn every morning; one night its ringer fell ill, so Shino climbed up in his place, and the bell still rang.' } })],
    A: [OR({ item: 'g:toki', prompt: { en: 'Order the pictures; the turn is the one with ある晩 in it.' }, tiles: [P2, P4, P3, P1], answer: [P1, P2, P3, P4],
      orderHint: { en: '毎朝 sets out what always happened; ある晩 breaks it; the last picture\'s と says that once the bell rang, the waking followed as it always had.' } })],
  },
  stretchA: [ch({ item: 'g:cond_tara', ctx: { jp: P4 + ' 。 ／ {鐘|かね} が {鳴|な}ったら 、 {村|むら} が {目|め} を {覚|さ}ました 。', en: '' }, prompt: { en: 'The tale says 鳴ると. What would 鳴ったら change?' },
    options: [e('と tells it as what always follows, as sure as habit; ～たら would make that morning one particular event, and in the past it can sound as if the waking surprised the teller.', 1),
      e('Nothing: と and たら are the same.', 0, 'Both join two events, but と is the natural, habitual sequence; たら singles out one occasion.'),
      e('鳴ったら means the bell rang twice.', 0, 'たら is a condition, not a count.')] })] };
  C.challenges['hall.w3.story_q'] = { title: T('{話|はなし} の {後|あと} で', 'After the tale'), optional: true, tiers: {
    F: [ch({ item: 'v:夜明け', ctx: { jp: FT[0] + ' 。', en: '' }, prompt: { en: 'When did the bell ring?' },
      options: [e('Every morning, before dawn.', 1), e('Every evening.', 0, 'まいあさ: every morning.'), e('Only on festival days.', 0, 'まいあさ: every morning.')] })],
    E: [ch({ item: 'g:mae_ato', ctx: { jp: P2 + ' 。 ' + P3 + ' 。', en: '' }, prompt: { en: 'What did Shino do after Jinbei fell ill?' },
      options: [e('She took a light and climbed the dark slope.', 1), e('She went to fetch a doctor.', 0, 'The tale says she climbed the slope with a light.'), e('She waited until morning.', 0, 'She went up in the dark, before morning.')] })],
    I: [ch({ item: 'g:cond_tara', ctx: { jp: P4 + ' 。', en: '' }, prompt: { en: 'What does と tell you here?' },
      options: [e('That the waking followed the bell, as it always did.', 1), e('That the bell and the village are both doing the waking.', 0, 'と joining two clauses means "when / whenever", not "and".'), e('That the bell rang because the village woke.', 0, 'The order is the other way round.')] })],
    A: [ch({ item: 'g:mae_ato', ctx: { jp: P1 + ' 。 ' + P4 + ' 。', en: '' }, prompt: { en: 'Why does the bell ring before the dawn, not at it?' },
      options: [e('The bell does not mark the dawn; it brings the village to it: rung in the dark, so people are up and out when the light comes.', 1), e('Because the ringer could not see the dawn from the tower.', 0, 'The tale is about the village, not what the ringer sees.'), e('Because dawn was too late for the priest.', 0, 'The bell is for the whole village.')] })],
  } };

  // ---- the bell-ringer's sayings: the one that breaks the rule (A34) -------------------------------------------------------
  // F and E: ～前に takes the dictionary form, ～後で the past; ～てから the て form. I: まで for something that goes on
  // until a time, までに for something done by it (and ～うちに). A: ～次第 for arrangements to come, never the past.
  C.hallW3Cards = {};
  function counter(F, E, I, A, pat) {
    C.hallW3Cards[pat] = { F, E, I, A };
    const mk = (item, list, prompt) => ch({ item, ctx: { jp: list.map((x, i) => (i + 1) + ' 、 ' + x[0]).join(' ／ '), en: '' }, prompt: { en: prompt }, options: list.map((x, i) => o(String(i + 1) + ' 、 ' + x[0], x[1], x[2])) });
    return {
      F: [mk('g:v_te_kara', F, 'Three sayings put the two actions together correctly. Which one breaks the rule?')],
      E: [mk('g:mae_ato', E, 'Three sayings use 前に, 後で and てから correctly. Which one breaks the rule?')],
      I: [mk('g:prt_kara_made', I, 'Three sayings use まで, までに and うちに the way they work. Which one breaks the rule?')],
      A: [mk('g:shidai', A, 'Three sayings use 次第, ところ and とき correctly. Which is the counterexample?')],
    };
  }
  const C0 = counter(
    [['みず を くんで から 、 ひ を いれた', 0, 'て form + から: correct.'], ['ねる まえ に 、 かね を みがいた', 0, 'まえ に after the dictionary form: correct.'], ['ちょうちん を つけた まえ に 、 そと に でた', 1, 'まえ に takes the dictionary form: つける まえ に.'], ['かね が なって から 、 むら の ひと が おきた', 0, 'Correct.']],
    [['{水|みず} を {汲|く}んで から 、 {火|ひ} を {入|い}れた', 0, 'Correct.'], ['{寝|ね}る {前|まえ} に 、 {鐘|かね} を {磨|みが}いた', 0, 'Correct.'], ['{鐘|かね} を {撞|つ}いた {前|まえ} に 、 {手|て} を {合|あ}わせた', 1, '{前|まえ}に takes the dictionary form: {撞|つ}く {前|まえ} に.'], ['{坂|さか} を {登|のぼ}った {後|あと} で 、 {少|すこ}し {休|やす}んだ', 0, '{後|あと}で after the past form: correct.']],
    [['{夜明|よあ}け まで 、 {鐘|かね} の {番|ばん} を した', 0, 'まで: a watch kept up until dawn. Correct.'], ['{夜明|よあ}け までに 、 {鐘|かね} を {撞|つ}かなければ ならない', 0, 'までに: done by dawn. Correct.'], ['{夜明|よあ}け までに 、 ずっと {待|ま}って いた', 1, 'Waiting goes on: {夜明|よあ}け まで {待|ま}って いた.'], ['{暗|くら}い うち に 、 {坂|さか} を {登|のぼ}った', 0, 'うちに: while it was still dark. Correct.']],
    [['{鐘|かね} が {鳴|な}り{次第|しだい} 、 {舟|ふね} を {出|だ}す', 0, 'An arrangement for what is to come: correct.'], ['{鐘|かね} を {撞|つ}こう と した ところ に 、 {狸|たぬき} が {来|き}た', 0, 'ところに: just as. Correct.'], ['{昨日|きのう} は 、 {鐘|かね} が {鳴|な}り{次第|しだい} 、 {目|め} が {覚|さ}めた', 1, 'The counterexample: 次第 is never used for what has already happened. {鳴|な}る と すぐ ({鳴|な}った とたん) {目|め} が {覚|さ}めた.'], ['{村|むら} を {出|で}る とき 、 {鐘|かね} の {音|おと} が {聞|き}こえた', 0, 'Correct.']], 0);
  const C1 = counter(
    [['て を あらって から 、 たべた', 0, 'Correct.'], ['でかける まえ に 、 と を しめた', 0, 'Correct.'], ['かね を ついた まえ に 、 て を あわせた', 1, 'まえ に takes the dictionary form: つく まえ に.'], ['かね が なって から 、 とり が ないた', 0, 'Correct.']],
    [['{門|もん} を {開|あ}けて から 、 {中|なか} に {入|はい}った', 0, 'Correct.'], ['{鐘|かね} を {撞|つ}く {前|まえ} に 、 {手|て} を {合|あ}わせた', 0, 'Correct.'], ['{石段|いしだん} を {掃|は}く {後|あと} で 、 {水|みず} を {撒|ま}いた', 1, '{後|あと}で takes the past form: {掃|は}いた {後|あと} で.'], ['{鐘|かね} が {鳴|な}った {後|あと} で 、 {鶏|にわとり} が {鳴|な}いた', 0, 'Correct.']],
    [['{月|つき} が {出|で}て いる うち に 、 {坂|さか} を {登|のぼ}ろう', 0, 'Correct.'], ['{鐘|かね} が {鳴|な}る まで 、 {寝|ね}て いた', 0, 'Sleeping went on until the bell: correct.'], ['{鐘|かね} が {鳴|な}る まで 、 {起|お}きた', 1, 'Getting up happens once: {鐘|かね} が {鳴|な}る までに {起|お}きた.'], ['{夜明|よあ}け までに 、 {全部|ぜんぶ} {済|す}ませた', 0, 'Correct.']],
    [['{支度|したく} が {整|ととの}い{次第|しだい} 、 {鐘楼|しょうろう} へ {参|まい}ります', 0, 'Correct.'], ['ちょうど {鐘|かね} を {撞|つ}き{終|お}わった ところ だ', 0, 'Correct.'], ['{夜明|よあ}け {次第|しだい} 、 {鐘|かね} を {撞|つ}いた', 1, 'The counterexample: after a noun 次第 means "depending on", and it never tells a past event. {夜明|よあ}け と ともに {撞|つ}いた.'], ['{坂|さか} を {登|のぼ}って いる とき 、 {星|ほし} が {消|き}え{始|はじ}めた', 0, 'Correct.']], 1);
  const cardStretch = [ch({ item: 'g:shidai', ctx: { jp: '{鐘|かね} が {鳴|な}り{次第|しだい} 、 {舟|ふね} を {出|だ}します 。 ／ {鐘|かね} が {鳴|な}る と すぐ 、 {舟|ふね} を {出|だ}します 。', en: '' }, prompt: { en: 'Both say the boats go out as soon as the bell rings. Where would you hear each?' },
    options: [e('次第 on a notice or from the harbour master announcing the arrangement; すぐ in everyday talk, and only すぐ could tell it about yesterday.', 1), e('They are used in exactly the same places.', 0, '次第 is formal and forward-looking.'), e('次第 means the boats go out before the bell.', 0, 'Both are "as soon as".')] })];
  C.challenges['hall.w3.counter0'] = { title: T('{鐘撞|かねつ}き の {言葉|ことば}', 'The bell-ringer\'s sayings'), tiers: C0, stretchA: cardStretch };
  C.challenges['hall.w3.counter1'] = { title: T('{鐘撞|かねつ}き の {言葉|ことば}', 'The bell-ringer\'s sayings'), tiers: C1, stretchA: cardStretch };

  // ---- asking about the almanac (A12) ------------------------------------------------------------------------------------------
  C.challenges['hall.w3.ask'] = { title: T('{暦|こよみ}', 'The almanac'), tiers: {
    F: [ch({ item: 'v:鐘', prompt: { en: 'You want to know when the bell should be rung today. What do you ask?' },
      options: [o('きょう は 、 いつ かね を つきます か 。', 1), o('きょう は 、 どこ で かね を つきます か 。', 0, 'That asks where.'), o('きのう は 、 いつ かね を つきました か 。', 0, 'That asks about yesterday.')] })],
    E: [ch({ item: 'v:鐘', prompt: { en: 'You want to know when the bell should be rung today. What do you ask?' },
      options: [o('{今日|きょう} は 、 いつ {鐘|かね} を {撞|つ}けば いい です か 。', 1), o('{今日|きょう} は 、 {誰|だれ} が {鐘|かね} を {撞|つ}きます か 。', 0, 'That asks who.'), o('{今日|きょう} は 、 {何回|なんかい} {鐘|かね} を {撞|つ}きます か 。', 0, 'That asks how many times.')] })],
    I: [ch({ item: 'g:mae_ato', prompt: { en: 'You want to know whether today\'s bell comes before or after the cock-crow. What do you ask?' },
      options: [o('{暦|こよみ} だ と 、 {今日|きょう} は {鶏|にわとり} が {鳴|な}く {前|まえ} と {後|あと} 、 どちら に {撞|つ}く ん です か 。', 1), o('{鶏|にわとり} は 、 {暦|こよみ} を {読|よ}む ん です か 。', 0, 'That asks whether the rooster reads the almanac.'), o('{今日|きょう} は 、 {鐘|かね} を {撞|つ}いた ところ です か 。', 0, 'That asks whether it has just been rung.')] })],
    A: [ch({ item: 'g:keigo_sonkei', prompt: { en: 'Ask, politely, for today\'s hour to be checked in the almanac.' },
      options: [o('{恐|おそ}れ{入|い}ります が 、 {本日|ほんじつ} 、 {鐘|かね} を {撞|つ}く {時刻|じこく} を 、 {暦|こよみ} で {確|たし}かめて いただけます か 。', 1), o('{本日|ほんじつ} は 、 {撞|つ}かなくて も よろしい の です か 。', 0, 'That asks whether it need not be rung at all.'), o('{暦|こよみ} を {撞|つ}いて いただけます か 。', 0, 'That asks them to strike the almanac.')] })],
  },
  stretchA: [ch({ item: 'g:mae_ato', ctx: { jp: '「 {本日|ほんじつ} 、 {一番鶏|いちばんどり} に {先立|さきだ}って {撞|つ}く べし 。 」', en: '' }, prompt: { en: 'The almanac\'s words are old and formal. What do に先立って and べし add?' },
    options: [e('に先立って is a written "before", and べし an old "must": an instruction recorded for whoever rings, not a friendly suggestion.', 1), e('They make it optional.', 0, 'べし is an obligation.'), e('They mean after the cock-crow.', 0, '先立つ: to go ahead of, before.')] })] };

  // ---- the riddle stone (a reprieve) -----------------------------------------------------------------------------------------
  C.challenges['hall.w3.riddle'] = { title: T('なぞなぞ の {石|いし}', 'The riddle stone'), tiers: {
    F: [ch({ item: 'v:鶏', ctx: { jp: 'あさ が くる まえ に 、 「 コケコッコー 」 と なく もの 、 なあに ？', en: '' }, prompt: { en: 'What is it?' },
      options: [o('にわとり', 1), o('ふくろう', 0, 'An owl calls at night, not コケコッコー.'), o('すずめ', 0, 'Sparrows chirp after the sun is up.')] })],
    E: [ch({ item: 'v:鐘', ctx: { jp: '{夜|よる} は {黙|だま}って いて 、 {朝|あさ} の {前|まえ} に だけ 、 {山|やま} の {上|うえ} から {大|おお}きな {声|こえ} で {鳴|な}る もの 。 {何|なん} だ ？', en: '' }, prompt: { en: 'What is it?' },
      options: [o('{鐘|かね}', 1), o('{鶏|にわとり}', 0, 'A rooster crows from the yard, not from the top of the mountain.'), o('{雷|かみなり}', 0, 'Thunder keeps no hour.')] })],
    I: [ch({ item: 'v:鐘', ctx: { jp: '{打|う}たれれば {打|う}たれる ほど 、 {遠|とお}く まで {声|こえ} が {届|とど}く 。 {打|う}たれない うち は 、 {黙|だま}って いる 。 {何|なん} だ ？', en: '' }, prompt: { en: 'What is it?' },
      options: [o('{鐘|かね}', 1), o('{鶏|にわとり}', 0, 'Nobody strikes a rooster to make it crow.'), o('{戸|と}', 0, 'A knock on a door does not carry over the mountains.')] })],
    A: [ch({ item: 'v:鐘', ctx: { jp: '{百八|ひゃくはち} を {数|かぞ}えて {年|とし} を {送|おく}り 、 {六|む}つ を {数|かぞ}えて {夜|よ} を {明|あ}かす 。 {我|われ} は {何|なに} か 。', en: '' }, prompt: { en: 'What am I?' },
      options: [o('{寺|てら} の {鐘|かね}', 1), o('{数珠|じゅず}', 0, 'A rosary may have a hundred and eight beads, but it does not count the dawn.'), o('{暦|こよみ}', 0, 'An almanac counts days, not strikes.')] })],
  },
  stretchA: [ch({ item: 'v:鐘', ctx: { jp: '{百八|ひゃくはち} を {数|かぞ}えて {年|とし} を {送|おく}り 、 {六|む}つ を {数|かぞ}えて {夜|よ} を {明|あ}かす 。', en: '' }, prompt: { en: 'What two real customs does the riddle count?' },
    options: [e('A hundred and eight strikes on New Year\'s Eve (除夜の鐘), seeing the year out; and six strikes for the old dawn hour, 明け六つ.', 1), e('Two festivals with drums.', 0, 'Both are strikes of a temple bell.'), e('The number of monks in a temple.', 0, 'The numbers are strikes.')] })] };

  // ---- t5: night moths round the slope lantern (conditions: airborne, in the dawn mist) --------------------------------------
  C.encounters = C.encounters || {};
  const MOTH = { enemy: 'co.moth', name: say('{夜|よる} の {蛾|が}', 'Night moth'), conditions: ['airborne'], knots: 2, music: 'battle_atlas' };
  C.encounters['hall.w3.moths'] = {
    id: 'hall.w3.moths', kind: 'battle', name: say('{霧|きり} の {中|なか} の {蛾|が}', 'Moths in the dawn mist'),
    lead: Object.assign({}, MOTH, { knots: 3 }),
    group: { normal: [MOTH], hard: [MOTH, MOTH] },
    rules: { wait: true, conditions: true }, field: ['mist'],
  };

  // ---- t9: Mame, who drums to hold the night back (a conversation) -------------------------------------------------------------
  function task(item, en, ok, w1, why1, w2, why2) {
    const low = ch({ item, prompt: { en }, options: [{ jp: ok, ok: true }, { jp: w1, ok: false, why: { en: why1 } }] });
    const high = ch({ item, prompt: { en: en + ' (Read them closely: two are near.)' }, options: [{ jp: ok, ok: true }, { jp: w1, ok: false, why: { en: why1 } }, { jp: w2, ok: false, why: { en: why2 } }] });
    return { F: low, E: low, I: high, A: high };
  }
  C.encounters['hall.w3.mame'] = {
    id: 'hall.w3.mame', kind: 'social', name: say('マメ の {腹鼓|はらつづみ}', 'Mame\'s drum'),
    rules: { wait: true },
    autoRoute: ['s:restate', 's:ask_when', 'wait', 's:promise'],
    social: {
      parties: [{ aid: 'n:mame', name: say('マメ', 'Mame'), stance: 'closed', wants: { en: 'For the night not to end before her child is home.' } }],
      claims: {
        night: { by: 'n:mame', jp: '{夜|よる} は 、 まだ {終|お}わらない よ 。 {終|お}わらせない 。', en: '"The night isn\'t over. I won\'t let it end."' },
        dogs: { by: 'n:mame', jp: '{朝|あさ} に なったら 、 {村|むら} の {犬|いぬ} が {出|で}て くる 。 そう したら 、 もう {出|で}て {来|こ}られない 。', en: '"When morning comes, the village dogs come out. Then there\'s no coming out any more."' },
        lost: { by: 'n:mame', jp: '…… あの {子|こ} が 、 {帰|かえ}って {来|こ}ない の 。 {夜|よる} の うち に {見|み}つけたい 。', en: '"…My child hasn\'t come back. I want to find them while it\'s still night."', hidden: true },
      },
      understanding: 2,
      gesture: { name: say('{隣|となり} に {静|しず}か に {座|すわ}る', 'Sit down quietly beside her'), desc: 'Sit down beside her without a word.', effect: { stance: { 'n:mame': 'listening' } }, once: true, says: { en: 'You sit down on the root beside her. The drumming slows; she watches you out of the corner of her eye.' } },
      unravelTip: { en: 'Nothing is knotted. Listen for what she wants done before the morning.' },
      actions: [
        { id: 'restate', kind: 'restate', label: say('{夜|よる} が {明|あ}ける {前|まえ} に 、 {誰|だれ} か を {見|み}つけたい ん だ ね 。', 'Say what she means about the night'), once: true,
          task: task('g:mae_ato', 'She drums so the night won\'t end. Which says back what she means?', '{夜|よる} が {明|あ}ける {前|まえ} に 、 {誰|だれ} か を {見|み}つけたい ん だ ね 。', '{夜|よる} が {好|す}き な ん だ ね 。', 'It is not the night she loves; it is what she must do in it.', '{朝|あさ} に なって から 、 {探|さが}したい ん だ ね 。', 'After morning is exactly what she fears.'),
          effect: { understanding: 1, stance: { 'n:mame': 'listening' } }, says: { en: 'Mame\'s paws go still on her belly. "…Yes," she says.' } },
        { id: 'ask_when', kind: 'ask', label: say('{最後|さいご} に {見|み}た の は 、 いつ ？', 'Ask when she last saw them'), once: true, when: { stance: { 'n:mame': 'listening' } },
          task: task('g:toki', 'Which asks her when she last saw the one she is looking for?', '{最後|さいご} に {見|み}た の は 、 いつ ？', '{次|つぎ} に {会|あ}う の は 、 いつ ？', 'That asks when she will meet them next.', '{最後|さいご} に {見|み}た の は 、 どこ ？', 'That asks where, not when.'),
          effect: { reveal: 'lost', understanding: 1 }, says: { en: '"At the start of the night," Mame says. "My child went off after a moth, and hasn\'t come back."' } },
        { id: 'promise', kind: 'propose', label: say('{夜明|よあ}け までに 、 {一緒|いっしょ} に {見|み}つけよう 。', 'Promise to find the child with her by dawn'), when: { claims: ['lost'] },
          task: task('g:prt_kara_made', 'Which promises to find the child by dawn?', '{夜明|よあ}け までに 、 {一緒|いっしょ} に {見|み}つけよう 。', '{夜明|よあ}け まで 、 {一緒|いっしょ} に {寝|ね}よう 。', 'That offers to sleep with her until dawn.', '{夜明|よあ}け まで 、 {一緒|いっしょ} に {探|さが}そう 。', 'Close, but まで promises to keep looking until dawn, not to find the child by then; she needs them home before the dogs come out.'),
          effect: { flag: 'promised' }, says: { en: 'Mame looks at you a long while. "By dawn," she says. "Then I\'ll let the morning come." She lowers her paws from her belly.' } },
        { id: 'blunt', kind: 'propose', label: say('うるさい 。 {太鼓|たいこ} を {止|や}めなさい 。', 'Tell her to stop the noise'), lasting: true, means: { en: 'You will order her to stop drumming.' },
          task: task('g:v_te_kudasai', 'Which orders her to stop?', 'うるさい 。 {太鼓|たいこ} を {止|や}めなさい 。', 'その {太鼓|たいこ} 、 {上手|じょうず} だ ね 。', 'That praises her drumming.', '{太鼓|たいこ} を {叩|たた}いて くれて 、 ありがとう 。', 'That thanks her for it.'),
          effect: { stance: { 'n:mame': 'leaving' } }, says: { en: 'Mame bares her teeth, then she is gone into the cedars, and the drumming starts again, further off.' } },
      ],
      responses: {
        light: { effect: { stance: { 'n:mame': 'listening' } }, says: { en: 'You lower the light so it does not dazzle her. Her eyes stop shining green.' } },
        unravel: { says: { en: 'Nothing here is knotted. Listen to what she wants done before the morning.' } },
      },
      wait: { when: { stance: { 'n:mame': 'listening' } }, effect: { reveal: 'lost' }, says: { en: 'Mame says, to the dark more than to you, "My child hasn\'t come home."' } },
      drift: [{ when: { all: [{ rounds: 3 }, { stance: { 'n:mame': 'closed' } }] }, once: true, effect: { stance: { 'n:mame': 'listening' } }, says: { en: 'In the east the sky goes a shade paler. Mame\'s paws falter on her belly; she looks up, afraid.' } }],
      companion: {
        nao: [{ id: 'nao_find', name: say('{探|さが}し{物|もの} の {話|はなし}', 'Talk about finding people'), desc: 'Nao, who finds people for a living, says so.', once: true, effect: { understanding: 1, stance: { 'n:mame': 'listening' } }, says: { en: 'Nao: "I find people for a living. Letters, mostly, but people too." Mame\'s ears turn toward Nao.' } }],
        mio: [{ id: 'mio_warm', name: say('{手|て} を {温|あたた}める', 'Warm her paws'), desc: 'Mio offers to warm her cold paws.', once: true, effect: { stance: { 'n:mame': 'listening' } }, says: { en: 'Mio holds out her hands. "Your paws are cold. Drumming all night will do that." Mame lets her hold them.' } }],
        ren: [{ id: 'ren_lamp', name: say('{灯|ひ} を {低|ひく}く する', 'Lower the lamp'), desc: 'Ren lowers the lamp so as not to frighten her.', once: true, effect: { understanding: 1, stance: { 'n:mame': 'listening' } }, says: { en: 'Ren turns the lamp down. "A light is for finding, not for frightening." Mame\'s drumming stops.' } }],
        suzu: [{ id: 'suzu_beat', name: say('{拍子|ひょうし} を {返|かえ}す', 'Answer her rhythm'), desc: 'Suzu answers the drumming with a beat on a box.', once: true, effect: { understanding: 1, stance: { 'n:mame': 'listening' } }, says: { en: 'Suzu taps an answer on the lid of a box. Mame stops, surprised, and then laughs, very quietly.' } }],
      },
    },
    conclusions: [
      { id: 'ran', when: { left: 'n:mame' }, result: 'end', text: { en: 'Mame has gone into the cedars. She will come back to the same root; you can try again.' } },
      { id: 'promised', when: { flag: 'promised' }, result: 'win', text: { en: 'Mame stops drumming and waits by the bell tower for her child.' } },
    ],
  };

  // ---- t10: the dawn bell (the capstone; the almanac's hour decides the moment) ----------------------------------------------
  function hear(item, fJp, jp, en, ok, w1, why1, w2, why2) {
    const opts = (two) => [{ en: ok, ok: true }, { en: w1, ok: false, why: { en: why1 } }].concat(two ? [{ en: w2, ok: false, why: { en: why2 } }] : []);
    return { F: ch({ item, ctx: { jp: fJp, en: '' }, prompt: { en }, options: opts(false) }), E: ch({ item, ctx: { jp, en: '' }, prompt: { en }, options: opts(false) }), I: ch({ item, ctx: { jp, en: '' }, prompt: { en }, options: opts(true) }), A: ch({ item, ctx: { jp, en: '' }, prompt: { en }, options: opts(true) }) };
  }
  const A = (id, jp, en, more) => Object.assign({ id, label: { jp, en } }, more);
  const vals = (x) => { const out = {}; for (const k in x) out[k] = { jp: x[k][0], en: x[k][1] }; return out; };
  const BELL = vals({ still: ['{静|しず}か', 'silent'], ready: ['{撞木|しゅもく} を {引|ひ}いた', 'the beam drawn back'], time: ['{時|とき} が {来|き}た', 'the hour has come'], done: ['{夜|よ} が {明|あ}けた', 'dawn'] });
  const ROPE = { id: 'b1', stable: true, text: say('シノ ： 「 まず 、 {綱|つな} を {解|ほど}いて から 、 {撞木|しゅもく} を {引|ひ}いて 。 」', 'Shino: "First untie the rope, then draw the beam back."'),
    task: hear('g:v_te_kara', 'シノ ： 「 まず 、 つな を ほどいて から 、 しゅもく を ひいて 。 」', 'シノ ： 「 まず 、 {綱|つな} を {解|ほど}いて から 、 {撞木|しゅもく} を {引|ひ}いて 。 」', 'What comes first?',
      'Untying the rope, then drawing back the beam.', 'Drawing back the beam, then untying the rope.', 'ほどいて から: the untying comes first.', 'Striking the bell at once.', 'She asks for the rope and the beam first.'),
    actions: [
      A('untie', '{綱|つな} を {解|ほど}いて から 、 {撞木|しゅもく} を {引|ひ}く', 'Untie the rope, then draw the beam back', { ok: true, set: { bell: 'ready' }, means: { en: 'You untie the rope that holds the beam, then draw it back.' }, result: { en: 'The beam swings free on its ropes. Shino holds it steady.' } }),
      A('pull', '{撞木|しゅもく} を {引|ひ}く', 'Draw the beam back', { means: { en: 'You pull at the beam.' }, wrong: { en: 'The beam will not move: the rope still holds it. "The rope first," Shino says.' } }),
    ] };
  const KOBU = { id: 'b3', stable: true, text: say('コブ が {聞|き}く 。 「 {鐘|かね} が {鳴|な}ったら 、 {夜|よる} は {終|お}わる の ？ 」', 'Kobu asks: "When the bell rings, is the night over?"'),
    task: hear('g:cond_tara', 'コブ ： 「 かね が なったら 、 よる は おわる の ？ 」', 'コブ ： 「 {鐘|かね} が {鳴|な}ったら 、 {夜|よる} は {終|お}わる の ？ 」', 'What is Kobu asking?',
      'Whether the night ends once the bell has rung.', 'Whether the bell rings at the end of the night.', 'なったら: once it has rung.', 'Whether the night will ring the bell.', 'Kobu asks about the night ending.'),
    actions: [
      A('yes', 'うん 。 でも 、 {夜|よる} は また {来|く}る よ 。', '"Yes. But the night comes back again."', { ok: true, means: { en: 'You tell Kobu the truth, and the rest of it.' }, result: { en: 'Kobu thinks about that, then nods and takes their mother\'s hand.' } }),
      A('no', 'ううん 、 {終|お}わらない よ 。', '"No, it won\'t end."', { means: { en: 'You tell Kobu the night won\'t end.' }, wrong: { en: 'Shino shakes her head gently. "It does end," she tells Kobu. "And then it comes back. Every day."' } }),
    ] };
  const COUNT = { id: 'b4', stable: true, text: say('シノ ： 「 {捨|す}て{鐘|がね} を {三|みっ}つ {撞|つ}いて から 、 {時|とき} の {数|かず} を {撞|つ}く の 。 」', 'Shino: "Three warning strikes first, then the hour\'s count."'),
    task: hear('g:v_te_kara', 'シノ ： 「 すてがね を みっつ ついて から 、 とき の かず を つく の 。 」', 'シノ ： 「 {捨|す}て{鐘|がね} を {三|みっ}つ {撞|つ}いて から 、 {時|とき} の {数|かず} を {撞|つ}く の 。 」', 'In what order are the strikes?',
      'Three warning strikes, then the hour.', 'The hour, then three warning strikes.', 'ついて から: the three come first.', 'Only three strikes.', 'The hour is counted after them.'),
    actions: [
      A('three_six', '{三|みっ}つ {撞|つ}いて から 、 {六|む}つ {撞|つ}く', 'Three strikes, then six', { ok: true, set: { bell: 'done' }, means: { en: 'You strike three warning strikes, then count the dawn hour, six.' }, result: { en: 'The bell\'s voice rolls down the valley. Below, one by one, the shutters open.' } }),
      A('six_three', '{六|む}つ {撞|つ}いて から 、 {三|みっ}つ {撞|つ}く', 'Six strikes, then three', { means: { en: 'You count six first.' }, wrong: { en: 'Shino catches the beam. "The three first, so the village knows the count is coming."' } }),
    ] };
  const STARS = say('{星|ほし} が {薄|うす}く なって きた 。 {一番鶏|いちばんどり} は 、 まだ {鳴|な}いて いない 。', 'The stars are fading. The first cock has not crowed yet.');
  const STARS_F = 'ほし が うすく なって きた 。 いちばんどり は 、 まだ ないて いない 。';
  function bell(pat) {
    const steps = [ROPE];
    if (pat === 0) {
      steps.push({ id: 'b2', stable: true, text: STARS,
        task: hear('g:mae_ato', STARS_F, STARS.jp, 'The almanac says: before the first cock-crow. Is it time?', 'Yes: the cock has not crowed yet.', 'No: wait for the cock.', 'The almanac says before the first cock-crow; after it would be too late.', 'No: wait for the sun.', 'The bell comes before the light.'),
        actions: [
          A('ring', '{今|いま} 、 {撞|つ}く', 'Ring it now', { ok: true, set: { bell: 'time' }, means: { en: 'You decide to ring before the first cock-crow, as the almanac says.' }, result: { en: 'Shino nods. "Now." She steadies the beam for the first stroke. Far below, a dog barks once and is quiet.' } }),
          A('wait', '{鶏|にわとり} を {待|ま}つ', 'Wait for the cock', { means: { en: 'You wait for the cock to crow.' }, wrong: { en: 'Shino touches your arm. "The almanac said before the first cock-crow. Now."' } }),
        ] });
    } else {
      steps.push({ id: 'b2', stable: true, text: STARS,
        task: hear('g:mae_ato', STARS_F, STARS.jp, 'The almanac says: after the first cock-crow, before the second. Is it time?', 'Not yet: the first cock has not crowed.', 'Yes: ring now.', 'The almanac says after the first cock-crow; it has not come yet.', 'Yes: the second cock has crowed.', 'Neither has crowed yet.'),
        actions: [
          A('wait', '{一番鶏|いちばんどり} を {待|ま}つ', 'Wait for the first cock', { ok: true, means: { en: 'You wait, the beam held ready.' }, result: { en: 'Below, in the dark, a cock crows once.' } }),
          A('ring', '{今|いま} 、 {撞|つ}く', 'Ring it now', { means: { en: 'You go to ring at once.' }, wrong: { en: 'Shino holds the beam. "Not yet. After the first cock, the almanac says."' } }),
        ] });
      const CROW = say('{一番鶏|いちばんどり} が {鳴|な}いた 。 {二番鶏|にばんどり} は 、 まだ だ 。', 'The first cock has crowed. The second has not.');
      steps.push({ id: 'b2b', stable: true, text: CROW,
        task: hear('g:mae_ato', 'いちばんどり が ないた 。 にばんどり は 、 まだ だ 。', CROW.jp, 'Is it time now?', 'Yes: after the first cock-crow, before the second.', 'No: wait for the second.', 'The almanac says before the second cock-crow.', 'No: wait for the sun.', 'The bell comes before the light.'),
        actions: [
          A('ring', '{今|いま} 、 {撞|つ}く', 'Ring it now', { ok: true, set: { bell: 'time' }, means: { en: 'You decide to ring between the first cock-crow and the second.' }, result: { en: 'Shino nods. "Now." She steadies the beam for the first stroke. Below, the second cock does not crow; it listens.' } }),
          A('wait', '{二番鶏|にばんどり} を {待|ま}つ', 'Wait for the second', { means: { en: 'You wait for the second cock.' }, wrong: { en: '"Now," Shino says. "Before the second, the almanac says."' } }),
        ] });
    }
    steps.push(KOBU, COUNT);
    return {
      id: 'hall.w3.bell' + pat, kind: 'procedure', name: say('{明|あ}け{六|む}つ の {鐘|かね}', 'The dawn bell'),
      rules: { wait: true },
      procedure: {
        id: 'hall_w3_bell' + pat, version: 1, restart: 'stable',
        machine: { bell: 'still' },
        show: [{ key: 'bell', label: say('{鐘|かね}', 'The bell'), values: BELL }],
        done: { en: 'The dawn bell has rung; the village is waking.' },
        steps,
      },
      conclusions: [{ id: 'done', when: { proc: 'done' }, result: 'win', text: { en: 'The bell has rung at its hour.' } }],
    };
  }
  C.encounters['hall.w3.bell0'] = bell(0);
  C.encounters['hall.w3.bell1'] = bell(1);
})(RB.content);
