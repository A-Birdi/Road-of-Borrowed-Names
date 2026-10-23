/* The Hall of a Hundred Tales, wing 6, The Toll That Changed: the language tasks and encounters (expansion P15; plan
 * 04_DUNGEONS.md D9; scenes in 28_w6_scenes.js). The theme: conditions and exceptions (～と, ～ば, ～たら, ～なら; ～ても;
 * ～場合, ただし, ～以外; at Advanced ～限り, ～さえ～ば, ～を除いて). Every task has its four levels and an Advanced
 * stretch.
 *   hall.w6.story      the tale's four written passages, back in order (A38)
 *   hall.w6.story_q    what the board filled up with, and the rule that was never written (optional)
 *   hall.w6.counter0/1 the waymarkers' sayings on conditions: the one that breaks the rule (A34)
 *   hall.w6.ask        asking your companion what Kihei's ledger says about going on after dark (A12)
 *   hall.w6.riddle     the riddle stone (a reprieve)
 *   encounters: hall.w6.mist (the mist on the pass: the porters fly, in mist), hall.w6.night (Ibuki and Otsuta at the
 *   shut gate: a mediation), hall.w6.watch (the night at the gate: the capstone procedure). */
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
  const P1 = '{昔|むかし} 、 {峠|とうげ} の {関所|せきしょ} の {通行料|つうこうりょう} は 、 {誰|だれ} でも {一文|いちもん} だった',
    P2 = 'ある {雨|あめ} の {日|ひ} 、 {関守|せきもり} は 「 {雨|あめ} なら 、 {帰|かえ}り に {払|はら}えば いい 」 と {決|き}まり を {足|た}した',
    P3 = '{決|き}まり は {年|とし} ごと に {増|ふ}え 、 {札|ふだ} は 「 ただし 」 と 「 なら 」 で いっぱい に なった',
    P4 = '{最後|さいご} の {決|き}まり だけ は 、 どこ に も {書|か}いて なかった';
  C.hallW6Tale = { P1, P2, P3, P4 };
  const FT = ['むかし 、 とうげ の せきしょ は 、 だれ でも いちもん だった', 'ある あめ の ひ 、 せきもり は 「 あめ なら 、 かえり に はらえば いい 」 と いった',
    'きまり は ふえて 、 ふだ は 「 でも 」 と 「 なら 」 で いっぱい に なった', 'さいご の きまり だけ は 、 どこ に も かいて なかった'];
  C.hallW6TaleF = FT;
  C.challenges['hall.w6.story'] = { title: T('{変|か}わった {通行料|つうこうりょう}', 'The Toll That Changed'), tiers: {
    F: [OR({ item: 'v:決まり', prompt: { en: 'Arrange the four written passages to retell the scroll\'s story.' }, tiles: [FT[2], FT[0], FT[3], FT[1]], answer: FT,
      orderHint: { en: 'One coin for everyone; then a rule for rainy days; then rule after rule; and one rule written nowhere.' } })],
    E: [OR({ item: 'v:通行料', prompt: { en: 'Arrange the four passages in the tale\'s order.' }, tiles: [P3, P1, P4, P2], answer: [P1, P2, P3, P4],
      orderHint: { en: 'First the toll as it began, then the first rule added, then the board filling up, then the rule that was never written.' } })],
    I: [OR({ item: 'g:cond_nara', prompt: { en: 'Order the passages so that each follows from the one before.' }, tiles: [P4, P2, P1, P3], answer: [P1, P2, P3, P4],
      orderHint: { en: 'The plain toll; the first condition (なら: if that is your case); the conditions and exceptions piling up (ただし); and, last, the one rule outside them all.' } })],
    A: [OR({ item: 'g:igai', prompt: { en: 'Order the passages; the turn is the one with だけ in it.' }, tiles: [P2, P4, P3, P1], answer: [P1, P2, P3, P4],
      orderHint: { en: 'Every hard case became a written exception; だけ sets apart the one rule that was never written down.' } })],
  },
  stretchA: [ch({ item: 'g:cond_nara', ctx: { jp: P2 + ' 。 ／ 「 {雨|あめ} が {降|ふ}ったら 、 {帰|かえ}り に {払|はら}えば いい 」', en: '' }, prompt: { en: 'The keeper said 雨なら. What would 雨が降ったら change?' },
    options: [e('なら takes the traveller\'s case as given ("if it is raining, as it is for you"), the way a rule answers a case; 降ったら looks ahead to the rain coming, one thing after another in time.', 1),
      e('Nothing: they are the same.', 0, 'Both are "if", but なら answers a situation already in front of you.'),
      e('雨なら means "only if it rains tomorrow".', 0, 'It answers the case at hand.')] })] };
  C.challenges['hall.w6.story_q'] = { title: T('{話|はなし} の {後|あと} で', 'After the tale'), optional: true, tiers: {
    F: [ch({ item: 'v:一文', ctx: { jp: FT[0] + ' 。', en: '' }, prompt: { en: 'How much was the toll at first?' },
      options: [e('One mon, for everyone.', 1), e('Two mon.', 0, 'いちもん: one mon.'), e('Nothing.', 0, 'It was one mon, for everyone.')] })],
    E: [ch({ item: 'v:決まり', ctx: { jp: P2 + ' 。', en: '' }, prompt: { en: 'What rule did the keeper add one rainy day?' },
      options: [e('In rain, a traveller could pay on the way back.', 1), e('Nobody could cross in the rain.', 0, '帰りに払えばいい: paying on the way back is enough.'), e('The toll went up in the rain.', 0, 'Nothing about more.')] })],
    I: [ch({ item: 'g:igai', ctx: { jp: P3 + ' 。', en: '' }, prompt: { en: 'What did the board fill up with?' },
      options: [e('Exceptions (ただし, "however") and conditions (なら, "if"), one for each hard case over the years.', 1), e('The prices of goods.', 0, 'It is the toll board.'), e('The keepers\' names.', 0, 'ただし and なら: rules.')] })],
    A: [ch({ item: 'g:igai', ctx: { jp: P3 + ' 。 ' + P4 + ' 。', en: '' }, prompt: { en: 'What is the tale suggesting about the last rule?' },
      options: [e('That the rule that mattered most stood behind all the written exceptions, and could not be written as one more condition.', 1), e('That the keeper forgot to write it.', 0, 'The tale sets it apart, as the one rule behind the others.'), e('That there were no more rules.', 0, 'There was one more: it was simply never written.')] })],
  } };

  // ---- the waymarkers' sayings on conditions: the one that breaks the rule (A34) ------------------------------------------
  // F: a condition with と or たら must lead where it naturally would. E: ～ば after an い-adjective or a verb; な-adjectives
  // and nouns take なら. I: と cannot end in a request; ても needs a result against the condition. A: ～ない限り, ～さえ～ば
  // and ～を除いて must say what they mean.
  C.hallW6Cards = {};
  function counter(F, E, I, A, pat) {
    C.hallW6Cards[pat] = { F, E, I, A };
    const mk = (item, list, prompt) => ch({ item, ctx: { jp: list.map((x, i) => (i + 1) + ' 、 ' + x[0]).join(' ／ '), en: '' }, prompt: { en: prompt }, options: list.map((x, i) => o(String(i + 1) + ' 、 ' + x[0], x[1], x[2])) });
    return {
      F: [mk('g:cond_to', F, 'Three sayings give a condition that leads where it should. Which one breaks the rule?')],
      E: [mk('g:cond_ba', E, 'Three sayings make a condition correctly. Which one breaks the rule?')],
      I: [mk('g:cond_tara', I, 'Three sayings use と, たら, ても and 場合 the way they work. Which one breaks the rule?')],
      A: [mk('g:kagiri', A, 'Three sayings use ～限り, ～さえ～ば and ～を除いて correctly. Which is the counterexample?')],
    };
  }
  const C0 = counter(
    [['はる に なる と 、 さくら が さく', 0, 'Spring comes, the cherries flower: a natural result with と. Correct.'], ['あめ が ふったら 、 かさ を さす', 0, 'Correct.'], ['よる に なる と 、 そら が あかるく なる', 1, 'Night does not make the sky bright: よる に なる と 、 そら が くらく なる.'], ['みぎ に まがる と 、 せきしょ が ある', 0, 'と for what you find: correct.']],
    [['{安|やす}ければ 、 {買|か}う', 0, 'An い-adjective: {安|やす}い → {安|やす}ければ. Correct.'], ['{時間|じかん} が あれば 、 {行|い}きます', 0, 'Correct.'], ['{静|しず}かければ 、 {眠|ねむ}れる', 1, 'A な-adjective has no ければ: {静|しず}か なら (or {静|しず}か で あれば).'], ['{雨|あめ} なら 、 {中止|ちゅうし} です', 0, 'A noun + なら: correct.']],
    [['{峠|とうげ} に {着|つ}いたら 、 {知|し}らせて ください', 0, 'たら can end in a request: correct.'], ['{雨|あめ} が {降|ふ}って も 、 {行|い}きます', 0, 'ても, even if: correct.'], ['{峠|とうげ} に {着|つ}く と 、 {知|し}らせて ください', 1, 'と gives a natural or habitual result and cannot end in a request: {着|つ}いたら.'], ['{安|やす}くて も 、 {要|い}らない', 0, 'Correct.']],
    [['{雨|あめ} が {降|ふ}らない {限|かぎ}り 、 {祭|まつ}り は {行|おこな}われる', 0, 'Unless it rains: correct.'], ['{名前|なまえ} さえ {書|か}けば 、 {誰|だれ} でも {通|とお}れる', 0, 'さえ…ば: this alone is enough. Correct.'], ['{日曜|にちよう} を {除|のぞ}いて 、 {毎日|まいにち} {開|あ}いて いる', 0, 'Correct.'], ['{薬|くすり} さえ {飲|の}めば 、 {熱|ねつ} が {上|あ}がる', 1, 'The counterexample: さえ…ば names the one thing that is enough for a hoped-for result, and nobody hopes for a rising fever. {薬|くすり} さえ {飲|の}めば 、 {熱|ねつ} は {下|さ}がる.']], 0);
  const C1 = counter(
    [['なつ に なる と 、 あつく なる', 0, 'Correct.'], ['おなか が すいたら 、 ごはん を たべる', 0, 'Correct.'], ['ふゆ に なる と 、 ゆき が とける', 1, 'Winter does not melt the snow: はる に なる と 、 ゆき が とける.'], ['この みち を いく と 、 はし が ある', 0, 'Correct.']],
    [['{暇|ひま} なら 、 {手伝|てつだ}って', 0, 'A な-adjective + なら: correct.'], ['{寒|さむ}ければ 、 {窓|まど} を {閉|し}めて ください', 0, 'Correct.'], ['{子供|こども} ければ 、 ただ です', 1, 'A noun has no ければ: {子供|こども} なら (or {子供|こども} で あれば).'], ['{荷物|にもつ} が あれば 、 {二文|にもん} です', 0, 'Correct.']],
    [['{分|わ}からない {場合|ばあい} は 、 {聞|き}いて ください', 0, 'A case in a rule: correct.'], ['{何度|なんど} {読|よ}んで も 、 {分|わ}からない', 0, 'Correct.'], ['{子供|こども} {以外|いがい} は 、 {一文|いちもん} です', 0, 'Correct.'], ['{雨|あめ} が {降|ふ}って も 、 {傘|かさ} を さす', 1, 'ても needs a result that goes against the condition, and rain is why you put up an umbrella: {雨|あめ} が {降|ふ}ったら 、 {傘|かさ} を さす.']],
    [['{私|わたし} が {関守|せきもり} で ある {限|かぎ}り 、 {門|もん} は {守|まも}る', 0, 'As long as: correct.'], ['{道|みち} さえ {分|わ}かれば 、 {一人|ひとり} で {行|い}ける', 0, 'Correct.'], ['{祭|まつ}り の {日|ひ} を {除|のぞ}いて 、 {祠|ほこら} の {灯|ひ} は {灯|とも}さない', 0, 'Correct.'], ['{雪|ゆき} が {降|ふ}らない {限|かぎ}り 、 {峠|とうげ} は {通|とお}れない', 1, 'The counterexample: ～ない限り means "unless", so this says the pass is shut unless it snows, the opposite of how snow and passes go. {雪|ゆき} が {降|ふ}らない {限|かぎ}り 、 {峠|とうげ} は {通|とお}れる.']], 1);
  const cardStretch = [ch({ item: 'g:kagiri', ctx: { jp: '{雨|あめ} が {降|ふ}らなければ 、 {祭|まつ}り は {行|おこな}われる 。 ／ {雨|あめ} が {降|ふ}らない {限|かぎ}り 、 {祭|まつ}り は {行|おこな}われる 。', en: '' }, prompt: { en: 'What does ～ない限り add?' },
    options: [e('It makes the festival a firm, standing plan that only rain can stop: the condition becomes the one exception, rather than one of two possibilities.', 1), e('Nothing: it is only more formal.', 0, 'It is firmer, too: the plan stands unless.'), e('It means the festival is held only if it rains.', 0, 'The opposite: unless it rains.')] })];
  C.challenges['hall.w6.counter0'] = { title: T('{道標|みちしるべ}', 'The waymarkers'), tiers: C0, stretchA: cardStretch };
  C.challenges['hall.w6.counter1'] = { title: T('{道標|みちしるべ}', 'The waymarkers'), tiers: C1, stretchA: cardStretch };

  // ---- asking what Kihei's ledger says about going on after dark (A12) -------------------------------------------------------
  C.challenges['hall.w6.ask'] = { title: T('キヘエ の {帳面|ちょうめん}', 'Kihei\'s ledger'), tiers: {
    F: [ch({ item: 'g:cond_tara', prompt: { en: 'You want to know who may go on up the pass once it is dark. What do you ask?' },
      options: [o('くらく なったら 、 だれ が とおれます か 。', 1), o('くらく なったら 、 なに を たべます か 。', 0, 'That asks what people eat after dark.'), o('あさ に なったら 、 どこ へ いきます か 。', 0, 'That asks about the morning.')] })],
    E: [ch({ item: 'g:cond_tara', prompt: { en: 'You want to know whom the keeper may let through once it is dark. What do you ask?' },
      options: [o('{暗|くら}く なったら 、 {誰|だれ} を {通|とお}して も いい ん です か 。', 1), o('{暗|くら}く なる {前|まえ} に 、 {誰|だれ} が {来|き}ました か 。', 0, 'That asks who came before dark.'), o('{暗|くら}い {道|みち} は 、 {好|す}き です か 。', 0, 'That asks whether they like dark roads.')] })],
    I: [ch({ item: 'g:baai', prompt: { en: 'You want to know whether the ledger gives any case when someone may go on after dark. What do you ask?' },
      options: [o('{日|ひ} が {暮|く}れた {後|あと} でも {通|とお}して いい {場合|ばあい} は 、 {帳面|ちょうめん} に {書|か}いて あります か 。', 1), o('{日|ひ} が {暮|く}れたら 、 {帳面|ちょうめん} を {書|か}かなくて も いい ん です か 。', 0, 'That asks whether the ledger need not be kept after dark.'), o('{帳面|ちょうめん} に は 、 {通行料|つうこうりょう} が いくら か {書|か}いて あります か 。', 0, 'That asks what the toll is.')] })],
    A: [ch({ item: 'g:keigo_kenjo', prompt: { en: 'Ask, politely, in what cases the ledger allows travel after sunset.' },
      options: [o('{恐|おそ}れ{入|い}ります が 、 {日没|にちぼつ} {後|ご} に {通行|つうこう} が {認|みと}められる の は 、 どの よう な {場合|ばあい} か 、 お{教|おし}え いただけます か 。', 1), o('{日没|にちぼつ} {後|ご} は 、 {帳面|ちょうめん} を {拝見|はいけん} して は いけません か 。', 0, 'That asks whether you may not look at the ledger after sunset.'), o('{通行|つうこう} の {際|さい} は 、 {必|かなら}ず お{知|し}らせ いたします 。', 0, 'That promises to tell them when you pass.')] })],
  },
  stretchA: [ch({ item: 'g:kagiri', ctx: { jp: '{日没|にちぼつ} {後|ご} の {通行|つうこう} は {認|みと}めない 。 ただし 、 {提灯|ちょうちん} を {持|も}つ {者|もの} は 、 この {限|かぎ}り で は ない 。', en: '' }, prompt: { en: 'What does この限りではない say, at the end of the rule?' },
    options: [e('That the rule just stated does not apply to them: the formal way a notice sets out an exception after ただし.', 1), e('That the doctor\'s road has no end.', 0, '限り here is the limit of the rule, not of a road.'), e('That they may cross only once.', 0, 'It lifts the rule for them; it sets no number.')] })] };

  // ---- the riddle stone (a reprieve) -----------------------------------------------------------------------------------------
  C.challenges['hall.w6.riddle'] = { title: T('なぞなぞ の {石|いし}', 'The riddle stone'), tiers: {
    F: [ch({ item: 'g:cond_to', ctx: { jp: 'あける と 、 とおれる 。 しめる と 、 とおれない 。 なあに ？', en: '' }, prompt: { en: 'What is it?' },
      options: [o('もん', 1), o('まど', 0, 'You open a window, but you do not walk through it.'), o('はし', 0, 'A bridge is never shut.')] })],
    E: [ch({ item: 'g:cond_ba', ctx: { jp: '{払|はら}えば {通|とお}れて 、 {払|はら}わなければ {通|とお}れない 。 {峠|とうげ} に ある もの 、 {何|なん} だ ？', en: '' }, prompt: { en: 'What is it?' },
      options: [o('{関所|せきしょ}', 1), o('{茶屋|ちゃや}', 0, 'At a teahouse you pay to eat, not to pass.'), o('{橋|はし}', 0, 'A bridge lets you over for nothing.')] })],
    I: [ch({ item: 'g:temo', ctx: { jp: '{雨|あめ} が {降|ふ}って も {傘|かさ} を ささない 。 {晴|は}れて も {休|やす}まない 。 {一年中|いちねんじゅう} 、 {峠|とうげ} に {立|た}って いる もの 、 {何|なん} だ ？', en: '' }, prompt: { en: 'What is it?' },
      options: [o('{道標|みちしるべ}', 1), o('{関守|せきもり}', 0, 'The keeper goes in out of the rain.'), o('{旅人|たびびと}', 0, 'A traveller moves on.')] })],
    A: [ch({ item: 'g:kagiri', ctx: { jp: '{通|とお}す {限|かぎ}り {減|へ}らず 、 {止|と}める {限|かぎ}り {溢|あふ}れる 。 {人|ひと} の {情|なさ}け に も {似|に}た もの 、 {何|なに} か 。', en: '' }, prompt: { en: 'What is it?' },
      options: [o('{川|かわ}', 1), o('{池|いけ}', 0, 'A pond lets nothing through.'), o('{雪|ゆき}', 0, 'Snow is not let through, nor stopped.')] })],
  },
  stretchA: [ch({ item: 'g:kagiri', ctx: { jp: '{通|とお}す {限|かぎ}り {減|へ}らず 、 {止|と}める {限|かぎ}り {溢|あふ}れる 。 {人|ひと} の {情|なさ}け に も {似|に}た もの 。', en: '' }, prompt: { en: 'Why is a river like kindness, in the riddle?' },
    options: [e('Both stay as they are only while they are let through: a river passed on never runs short, and dammed it floods; kindness kept back by a rule builds up the same way, which is what happens at Kihei\'s gate.', 1), e('Both are cold.', 0, 'The riddle is about letting through.'), e('Both run downhill.', 0, 'The riddle compares letting through with holding back.')] })] };

  // ---- t5: the mist on the pass (the porters fly; in mist) --------------------------------------------------------------------
  C.encounters = C.encounters || {};
  const FOG = { enemy: 'cr.fogporter', name: say('{霧|きり} の {運|はこ}び{手|て}', 'Mist porter'), conditions: ['airborne'], knots: 2, music: 'battle_atlas' };
  C.encounters['hall.w6.mist'] = {
    id: 'hall.w6.mist', kind: 'battle', name: say('{峠|とうげ} の {霧|きり}', 'The mist on the pass'),
    lead: Object.assign({}, FOG, { knots: 3 }),
    group: { normal: [FOG], hard: [FOG, FOG] },
    rules: { wait: true, conditions: true }, field: ['mist'],
  };

  // ---- t9: Ibuki and Otsuta at the shut gate (a mediation) -------------------------------------------------------------------
  function task(item, en, ok, w1, why1, w2, why2) {
    const low = ch({ item, prompt: { en }, options: [{ jp: ok, ok: true }, { jp: w1, ok: false, why: { en: why1 } }] });
    const high = ch({ item, prompt: { en: en + ' (Read them closely: two are near.)' }, options: [{ jp: ok, ok: true }, { jp: w1, ok: false, why: { en: why1 } }, { jp: w2, ok: false, why: { en: why2 } }] });
    return { F: low, E: low, I: high, A: high };
  }
  C.encounters['hall.w6.night'] = {
    id: 'hall.w6.night', kind: 'social', name: say('イブキ と オツタ', 'Ibuki and Otsuta'),
    rules: { wait: true },
    autoRoute: ['s:calm', 's:exception', 'wait', 's:through'],
    social: {
      parties: [
        { aid: 'n:ibuki', name: say('イブキ', 'Ibuki'), stance: 'heated', wants: { en: 'To keep the gate exactly as the board says, so that nobody can say they let Kihei down.' } },
        { aid: 'n:otsuta', name: say('オツタ', 'Otsuta'), stance: 'heated', wants: { en: 'To get her baby over the pass to the doctor tonight.' } },
      ],
      claims: {
        rule: { by: 'n:ibuki', jp: '{鐘|かね} が {鳴|な}ったら 、 {門|もん} は {開|あ}けない 。 {例外|れいがい} は ない 。 {私|わたし} が そう {書|か}いた 。', en: 'Ibuki: "Once the bell has rung, the gate stays shut. No exceptions. I wrote that myself."' },
        need: { by: 'n:otsuta', jp: '{熱|ねつ} が {下|さ}がらない ん です 。 {朝|あさ} まで {待|ま}ったら 、 この {子|こ} は …… 。', en: 'Otsuta: "The fever won\'t come down. If we wait till morning, this child…"' },
        last: { by: 'n:ibuki', jp: '…… キヘエ さん は 、 いつも 「 {困|こま}って いる {者|もの} は 、 {通|とお}して やれ 」 と {言|い}って いた 。 でも 、 どこ に も {書|か}いて ない 。', en: 'Ibuki: "…Kihei always used to say, \'Let anyone in trouble through.\' But it isn\'t written anywhere."', hidden: true },
      },
      understanding: 3,
      gesture: { name: say('{赤|あか}ん{坊|ぼう} の {額|ひたい} に {手|て} を {当|あ}てる', 'Lay a hand on the baby\'s forehead'), desc: 'Lay the back of your hand on the baby\'s forehead, as anyone would.', effect: { stance: { 'n:otsuta': 'listening' } }, once: true, says: { en: 'The baby is burning hot. Otsuta watches your face, and for a moment she breathes.' } },
      unravelTip: { en: 'Nothing is knotted. What is tangled is a rule written in fear, and a rule never written at all.' },
      actions: [
        { id: 'calm', kind: 'restate', label: say('お{二人|ふたり} と も 、 {大事|だいじ} な もの を {守|まも}ろう と して いる ん です ね 。', 'Say back what each of them is protecting'),
          task: task('g:cond_tara', 'Which says back what both of them are doing?', 'お{二人|ふたり} と も 、 {大事|だいじ} な もの を {守|まも}ろう と して いる ん です ね 。', '{決|き}まり なんて 、 {守|まも}らなくて も いい ん です ね 。', 'That says rules need not be kept; neither of them thinks so.', 'お{二人|ふたり} と も 、 {早|はや}く {寝|ね}たい ん です ね 。', 'Nobody here is thinking of sleep.'),
          cases: [{ when: { stance: { 'n:ibuki': 'heated' } }, effect: { stance: { 'n:ibuki': 'listening' } }, says: { en: 'Ibuki\'s grip on the bar loosens a little. "…Yes. The gate. Kihei trusted me with it."' } },
            { when: { stance: { 'n:otsuta': 'heated' } }, effect: { stance: { 'n:otsuta': 'listening' } }, says: { en: 'Otsuta stops pleading and holds the baby closer. "…Yes."' } }],
          says: { en: 'They are already listening.' } },
        { id: 'exception', kind: 'ask', label: say('{鐘|かね} の {後|あと} でも 、 {通|とお}して いい {場合|ばあい} は ありません か 。', 'Ask whether there is any case for opening after the bell'), once: true, when: { stance: { 'n:ibuki': 'listening' } },
          task: task('g:baai', 'Which asks whether there is any case when the gate may open after the bell?', '{鐘|かね} の {後|あと} でも 、 {通|とお}して いい {場合|ばあい} は ありません か 。', '{鐘|かね} の {前|まえ} なら 、 {通|とお}れました か 。', 'That asks about before the bell, which is past.', '{門|もん} は 、 {何時|なんじ} に {開|あ}きます か 。', 'That asks when the gate opens in the morning.'),
          effect: { reveal: 'last', understanding: 1 }, says: { en: 'Ibuki is quiet for a long moment. "…Kihei always said, \'Let anyone in trouble through.\' He never wrote it down. I was afraid to, without him."' } },
        { id: 'through', kind: 'propose', label: say('「 {困|こま}って いる {者|もの} は 、 {通|とお}して やれ 」 が キヘエ さん の {決|き}まり なら 、 {今夜|こんや} は その {場合|ばあい} です 。', 'Propose that tonight is the case Kihei\'s rule was for'), when: { claims: ['last'] },
          task: task('g:cond_nara', 'Which says that, if that is Kihei\'s rule, tonight is its case?', '「 {困|こま}って いる {者|もの} は 、 {通|とお}して やれ 」 が キヘエ さん の {決|き}まり なら 、 {今夜|こんや} は その {場合|ばあい} です 。', '{困|こま}って いない {人|ひと} だけ 、 {通|とお}して ください 。', 'That lets through only those who are not in trouble.', '{決|き}まり を {全部|ぜんぶ} {消|け}して ください 。', 'That throws out every rule, not just the one written in fear.'),
          effect: { flag: 'through' }, says: { en: 'Ibuki looks at the bar, and at the baby, and lifts the bar. "Go. Down the far side, the doctor\'s is the house with the red lantern. I\'ll leave ours lit for you."' } },
        { id: 'blunt', kind: 'propose', label: say('{決|き}まり なんて 、 どう でも いい 。 {門|もん} を {開|あ}けて 。', 'Tell Ibuki the rules don\'t matter'), lasting: true, means: { en: 'You will tell Ibuki their rules don\'t matter.' },
          task: task('v:決まり', 'Which tells Ibuki the rules don\'t matter?', '{決|き}まり なんて 、 どう でも いい 。 {門|もん} を {開|あ}けて 。', '{決|き}まり を 、 もう {一度|いちど} {読|よ}んで みましょう 。', 'That is gentle; it asks to read them again.', 'キヘエ さん に 、 {聞|き}いて みましょう か 。', 'That suggests asking Kihei.'),
          effect: { stance: { 'n:ibuki': 'leaving' } }, says: { en: 'Ibuki\'s face shuts like the gate. They go into the guard hut and slide the door to. Otsuta sinks down by the gate with her baby.' } },
      ],
      responses: {
        water: { effect: { stance: { 'n:otsuta': 'listening' } }, says: { en: 'You wet a cloth and lay it on the baby\'s forehead. Otsuta nods her thanks, unable to speak.' } },
        unravel: { says: { en: 'Nothing here is knotted. Listen for the rule nobody wrote.' } },
      },
      wait: { when: { stance: { 'n:ibuki': 'listening' } }, effect: { reveal: 'last' }, says: { en: 'Ibuki says, half to themself, "Kihei would have opened it. He always said: anyone in trouble."' } },
      drift: [{ when: { all: [{ rounds: 3 }, { stance: { 'n:ibuki': 'heated' } }] }, once: true, effect: { stance: { 'n:ibuki': 'listening', 'n:otsuta': 'listening' } }, says: { en: 'The baby\'s crying goes thin and quiet, which is worse. Ibuki hears it too, and lets go of the bar.' } }],
      companion: {
        nao: [{ id: 'nao_urgent', name: say('{急|いそ}ぎ の {手紙|てがみ}', 'Urgent letters'), desc: 'Nao, who has carried letters through barriers at night, says how.', once: true, effect: { understanding: 1, stance: { 'n:ibuki': 'listening' } }, says: { en: 'Nao: "Every barrier I\'ve passed at night had a rule for urgent letters. A sick child is more urgent than any letter." Ibuki looks at Nao.' } }],
        mio: [{ id: 'mio_fever', name: say('{熱|ねつ} を {診|み}る', 'Look at the fever'), desc: 'Mio looks at the baby as a healer would.', once: true, effect: { understanding: 1, stance: { 'n:otsuta': 'listening' } }, says: { en: 'Mio checks the baby\'s breathing and the colour of its lips. "This is a real fever. She\'s right to go tonight."' } }],
        ren: [{ id: 'ren_order', name: say('{灯守|ひもり} の {決|き}まり', 'The lamp-keepers\' rule'), desc: 'Ren speaks of the order\'s own rules.', once: true, effect: { understanding: 1, stance: { 'n:ibuki': 'listening' } }, says: { en: 'Ren: "The lamp-keepers\' rule book has a hundred rules. The first page says: all of these give way to someone in need." Ibuki\'s hand leaves the bar.' } }],
        suzu: [{ id: 'suzu_play', name: say('{門番|もんばん} の {芝居|しばい}', 'The gatekeeper in the play'), desc: 'Suzu remembers the play everyone knows about a gate.', once: true, effect: { understanding: 1 }, says: { en: 'Suzu: "There\'s a play about a barrier keeper who knows the rule and lets them through anyway. Audiences cry every night. It\'s the keeper they cry for."' } }],
      },
    },
    conclusions: [
      { id: 'shut', when: { left: 'n:ibuki' }, result: 'end', text: { en: 'Ibuki has shut themself in the guard hut. Otsuta waits by the gate; you can try again.' } },
      { id: 'through', when: { flag: 'through' }, result: 'win', text: { en: 'The gate opens for Otsuta and her baby.' } },
    ],
  };

  // ---- t10: the night at the gate (the capstone) ------------------------------------------------------------------------------
  function hear(item, fJp, jp, en, ok, w1, why1, w2, why2) {
    const opts = (two) => [{ en: ok, ok: true }, { en: w1, ok: false, why: { en: why1 } }].concat(two ? [{ en: w2, ok: false, why: { en: why2 } }] : []);
    return { F: ch({ item, ctx: { jp: fJp, en: '' }, prompt: { en }, options: opts(false) }), E: ch({ item, ctx: { jp, en: '' }, prompt: { en }, options: opts(false) }), I: ch({ item, ctx: { jp, en: '' }, prompt: { en }, options: opts(true) }), A: ch({ item, ctx: { jp, en: '' }, prompt: { en }, options: opts(true) }) };
  }
  const A = (id, jp, en, more) => Object.assign({ id, label: { jp, en } }, more);
  const vals = (x) => { const out = {}; for (const k in x) out[k] = { jp: x[k][0], en: x[k][1] }; return out; };
  const HOUR = vals({ bell: ['{鐘|かね} が {鳴|な}った', 'the bell has rung'], late: ['{夜更|よふ}け', 'late in the night'], small: ['{真夜中|まよなか} {過|す}ぎ', 'past midnight'], dawn: ['{夜明|よあ}け', 'dawn'], kept: ['{朝|あさ}', 'morning'] });
  C.encounters['hall.w6.watch'] = {
    id: 'hall.w6.watch', kind: 'procedure', name: say('{門|もん} の {夜|よる}', 'The night at the gate'),
    rules: { wait: true },
    procedure: {
      id: 'hall_w6_watch', version: 1, restart: 'stable',
      machine: { hour: 'bell' },
      show: [{ key: 'hour', label: say('{夜|よる}', 'The night'), values: HOUR }],
      done: { en: 'The night is kept, and the gate opens on the morning.' },
      steps: [
        { id: 'g1', stable: true, text: say('イブキ ： 「 {鐘|かね} が {鳴|な}ったら 、 {門|もん} を {閉|し}める 。 ただし 、 {峠|とうげ} に まだ {誰|だれ} か いる {場合|ばあい} は 、 {門|もん} に {提灯|ちょうちん} を {掛|か}けて おく 。 」', 'Ibuki: "When the bell rings, we shut the gate. But if anyone is still out on the pass, we hang a lantern on it."'),
          task: hear('g:baai', 'イブキ ： 「 とうげ に まだ だれ か いたら 、 もん に ちょうちん を かけて おく 。 」', 'イブキ ： 「 {鐘|かね} が {鳴|な}ったら 、 {門|もん} を {閉|し}める 。 ただし 、 {峠|とうげ} に まだ {誰|だれ} か いる {場合|ばあい} は 、 {門|もん} に {提灯|ちょうちん} を {掛|か}けて おく 。 」', 'What do you do if someone is still out on the pass?',
            'Hang a lantern on the gate.', 'Leave the gate open.', 'The gate is shut either way; the lantern is the exception.', 'Ring the bell again.', 'The bell has rung; the lantern is for whoever is still out.'),
          actions: [
            A('hang', 'オツタ の ため に 、 {門|もん} に {提灯|ちょうちん} を {掛|か}ける', 'Hang a lantern on the gate for Otsuta', { ok: true, set: { hour: 'late' }, means: { en: 'Otsuta is still on the far side of the pass. You hang a lantern on the gate.' }, result: { en: 'The lantern sways on its hook, a small light on the black pass. Somewhere below, Otsuta will see it.' } }),
            A('shut', '{門|もん} を {閉|し}めて 、 {寝|ね}る', 'Shut the gate and go to bed', { means: { en: 'You go to shut up for the night.' }, wrong: { en: 'Ibuki catches your arm. "Otsuta\'s still out there. The lantern first."' } }),
          ] },
        { id: 'g2', stable: true, text: say('ハンベエ ： 「 {朝|あさ} の {市|いち} に {間|ま}に{合|あ}いたい ん だ 。 {通|とお}して くれ 。 」 イブキ ： 「 {急|いそ}いで いる だけ なら 、 {朝|あさ} まで {待|ま}って もらう 。 」', 'Hanbei: "I want to make the morning market. Let me through." Ibuki: "If you\'re only in a hurry, you wait till morning."'),
          task: hear('g:cond_nara', 'イブキ ： 「 いそいで いる だけ なら 、 あさ まで まって もらう 。 」', 'ハンベエ ： 「 {朝|あさ} の {市|いち} に {間|ま}に{合|あ}いたい ん だ 。 {通|とお}して くれ 。 」 イブキ ： 「 {急|いそ}いで いる だけ なら 、 {朝|あさ} まで {待|ま}って もらう 。 」', 'What does Ibuki say about Hanbei?',
            'Being only in a hurry is no reason to open at night: he waits till morning.', 'He may go if he pays two mon.', 'Nothing on the board sells the night.', 'He must go back down the pass.', 'He only has to wait.'),
          actions: [
            A('rest', 'ハンベエ に 、 {朝|あさ} まで {奥|おく} で {休|やす}んで もらう', 'Let Hanbei sleep in the guard hut till morning', { ok: true, set: { hour: 'small' }, means: { en: 'You offer Hanbei a corner of the guard hut until morning.' }, result: { en: 'Hanbei grumbles, then snores. He will make the market anyway; it is downhill.' } }),
            A('let', 'ハンベエ を {通|とお}す', 'Let Hanbei through', { means: { en: 'You reach for the bar.' }, wrong: { en: 'Ibuki shakes their head. "Being in a hurry isn\'t the same as being in trouble."' } }),
          ] },
        { id: 'g3', stable: true, text: say('{木|き}こり ： 「 {霧|きり} で {道|みち} に {迷|まよ}って 、 {足|あし} を くじいた 。 」 イブキ ： 「 {困|こま}って いる {人|ひと} なら 、 {夜|よる} でも {通|とお}す 。 キヘエ さん なら 、 そう する 。 」', 'A woodcutter: "I lost my way in the mist and twisted my ankle." Ibuki: "Someone in trouble, we let through, even at night. Kihei would."'),
          task: hear('g:cond_nara', 'イブキ ： 「 こまって いる ひと なら 、 よる でも とおす 。 」', '{木|き}こり ： 「 {霧|きり} で {道|みち} に {迷|まよ}って 、 {足|あし} を くじいた 。 」 イブキ ： 「 {困|こま}って いる {人|ひと} なら 、 {夜|よる} でも {通|とお}す 。 キヘエ さん なら 、 そう する 。 」', 'What does Ibuki decide about the woodcutter?',
            'He is in trouble, so the gate opens for him, night or not.', 'He must wait till morning like Hanbei.', 'Hanbei was only in a hurry; the woodcutter is hurt.', 'He must pay double for the night.', 'Nobody in trouble is charged.'),
          actions: [
            A('open', '{門|もん} を {開|あ}けて 、 {木|き}こり を {火|ひ} の {側|そば} に {連|つ}れて くる', 'Open the gate and bring the woodcutter to the fire', { ok: true, set: { hour: 'dawn' }, means: { en: 'You lift the bar and help the woodcutter in to the hearth.' }, result: { en: 'The woodcutter sits by the fire with his ankle bound. Outside, the sky over the pass is going grey.' } }),
            A('wait', '{朝|あさ} まで {外|そと} で {待|ま}って もらう', 'Tell him to wait outside till morning', { means: { en: 'You go to tell him to wait outside.' }, wrong: { en: 'Ibuki is already lifting the bar. "On a twisted ankle, in the mist? No."' } }),
          ] },
        { id: 'g4', stable: true, text: say('キヘエ ： 「 {決|き}まり は 、 {人|ひと} の ため に ある 。 {人|ひと} が {決|き}まり の ため に ある ん じゃ ない 。 」', 'Kihei: "Rules are there for people. People aren\'t there for rules."'),
          task: hear('v:決まり', 'キヘエ ： 「 きまり は 、 ひと の ため に ある 。 」', 'キヘエ ： 「 {決|き}まり は 、 {人|ひと} の ため に ある 。 {人|ひと} が {決|き}まり の ため に ある ん じゃ ない 。 」', 'What does Kihei say rules are for?',
            'For people; people are not for rules.', 'For the keeper\'s pay.', 'He says nothing about pay.', 'For being changed every day.', 'He says what they are for, not how often they change.'),
          actions: [
            A('write', '「 {困|こま}って いる {者|もの} は 、 {通|とお}して やれ 」 と {札|ふだ} に {書|か}き{足|た}す', 'Write "Let anyone in trouble through" on the board', { ok: true, set: { hour: 'kept' }, means: { en: 'You take the brush and write the last rule at the foot of the board.' }, result: { en: 'Kihei reads it, and nods. Ibuki crosses out the line they wrote last night, the one that said no exceptions.' } }),
            A('erase', '{決|き}まり を {全部|ぜんぶ} {消|け}す', 'Wipe every rule off the board', { means: { en: 'You reach to wipe the board clean.' }, wrong: { en: 'Kihei laughs. "Then how would anyone know what the toll is? Keep them. Just add the one I never wrote."' } }),
          ] },
      ],
    },
    conclusions: [{ id: 'done', when: { proc: 'done' }, result: 'win', text: { en: 'The night at the gate is kept.' } }],
  };
})(RB.content);
