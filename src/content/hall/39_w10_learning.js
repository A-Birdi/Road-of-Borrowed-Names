/* The Hall of a Hundred Tales, wing 10, The Hundredth Tale: the language tasks and encounters (expansion P15; plan
 * 04_DUNGEONS.md D9; scenes in 39a_w10_scenes.js). The theme: everything at once (finding the way, who did what to
 * whom, sequence, requests, reasons, conditions, what goes unsaid, whose account, to whom you speak), and the tale
 * told is the player's own journey. Every task has its four levels and an Advanced stretch.
 *   hall.w10.story      your journey in four pictures, back in order (A38)
 *   hall.w10.story_q    what the pictures say (optional)
 *   hall.w10.counter0/1 the keepers' practice slates: the one that breaks its rule, one rule from each tale (A34)
 *   hall.w10.ask        asking your companion where the keepers' note says the hundredth wick is kept (A12)
 *   hall.w10.riddle     the riddle stone (a reprieve)
 *   encounters: hall.w10.moss (the moss lantern: rooted), hall.w10.vigil (Sōan and Kohaku: a mediation),
 *   hall.w10.tale (the hundredth tale: the capstone procedure). */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const T = (jp, en) => ({ jp, en });
  const ch = (o) => Object.assign({ kind: 'choose' }, o);
  const OR = (o) => Object.assign({ kind: 'order' }, o);
  const o = (jp, ok, why) => Object.assign({ jp, ok: !!ok }, why ? { why: { en: why } } : {});
  const e = (en, ok, why) => Object.assign({ en, ok: !!ok }, why ? { why: { en: why } } : {});
  const say = (jp, en) => ({ jp, en });

  // ---- the story room: your journey -------------------------------------------------------------------------------------
  const P1 = 'ある {日|ひ} 、 {一人|ひとり} の {旅人|たびびと} が {葦|あし}ノ{瀬|せ} を {出|で}た',
    P2 = '{旅人|たびびと} は {仲間|なかま} と {出会|であ}い 、 {消|き}えかけた {言葉|ことば} を {一|ひと}つ ずつ {呼|よ}び{戻|もど}した',
    P3 = '{静寂|しじま} の {書庫|しょこ} で 、 {長|なが}い {旅|たび} は {一|ひと}つ の {終|お}わり を {迎|むか}えた',
    P4 = 'そして {今|いま} 、 {百物語|ひゃくものがたり} の {館|やかた} で は 、 {九十九|きゅうじゅうきゅう} の {灯|ひ} が {点|とも}って いる';
  C.hallW10Tale = { P1, P2, P3, P4 };
  const FT = ['ある ひ 、 たびびと が あしのせ を でた', 'なかま と あって 、 きえそう な ことば を よびもどした',
    'しじま の しょこ で 、 ながい たび が おわった', 'いま 、 やかた で 、 きゅうじゅうきゅう の ひ が ついて いる'];
  C.hallW10TaleF = FT;
  C.challenges['hall.w10.story'] = { title: T('{百話目|ひゃくわめ} の {話|はなし}', 'The Hundredth Tale'), tiers: {
    F: [OR({ item: 'g:v_ta', prompt: { en: 'Put the four pictures of your journey back in order.' }, tiles: [FT[2], FT[0], FT[3], FT[1]], answer: FT,
      orderHint: { en: 'Setting out; companions and words called back; the end of the long road; and now.' } })],
    E: [OR({ item: 'g:mae_ato', prompt: { en: 'Put the four pictures back in order.' }, tiles: [P3, P1, P4, P2], answer: [P1, P2, P3, P4],
      orderHint: { en: 'Reedwake first, then the road, then the Archive, then the Hall.' } })],
    I: [OR({ item: 'g:relative_clause', prompt: { en: 'Order the pictures so that each follows from the one before.' }, tiles: [P4, P2, P1, P3], answer: [P1, P2, P3, P4],
      orderHint: { en: 'そして今 ("and now") can only come last; the Archive is where the long road ended.' } })],
    A: [OR({ item: 'g:relative_clause', prompt: { en: 'Order the pictures; the turn is the one that says the journey ended, but not the tale.' }, tiles: [P2, P4, P3, P1], answer: [P1, P2, P3, P4],
      orderHint: { en: '一つの終わり is "an ending", not "the end": the fourth picture goes on from it.' } })],
  },
  stretchA: [ch({ item: 'g:relative_clause', ctx: { jp: P3 + ' 。', en: '' }, prompt: { en: 'Why 一つの終わりを迎えた, and not simply 終わった?' },
    options: [e('It calls the Archive an ending, one of several, and leaves room for what came after: the Hall, and this tale.', 1), e('It is only more polite.', 0, 'It changes the meaning: "an ending", not "the end".'), e('It means the journey failed.', 0, 'Nothing in it says the journey failed.')] })] };
  C.challenges['hall.w10.story_q'] = { title: T('{話|はなし} の {後|あと} で', 'After the tale'), optional: true, tiers: {
    F: [ch({ item: 'g:v_ta', ctx: { jp: FT[0] + ' 。', en: '' }, prompt: { en: 'Where did the traveller set out from?' },
      options: [e('Reedwake.', 1), e('The Hall.', 0, 'あしのせ: Reedwake.'), e('The Still Archive.', 0, 'That is where the long road ended.')] })],
    E: [ch({ item: 'g:v_te', ctx: { jp: P2 + ' 。', en: '' }, prompt: { en: 'What did the traveller do on the road?' },
      options: [e('Met companions and called back words that were fading.', 1), e('Travelled alone and forgot words.', 0, '仲間と出会い: met companions.'), e('Wrote a book.', 0, '呼び戻した: called back.')] })],
    I: [ch({ item: 'g:relative_clause', ctx: { jp: P4 + ' 。', en: '' }, prompt: { en: 'How many lights burn in the Hall now?' },
      options: [e('Ninety-nine: one is still dark.', 1), e('A hundred.', 0, '九十九: ninety-nine.'), e('Nine.', 0, 'Nine wings; ninety-nine lights.')] })],
    A: [ch({ item: 'g:relative_clause', ctx: { jp: P1 + ' 。 ' + P2 + ' 。 ' + P3 + ' 。 ' + P4 + ' 。', en: '' }, prompt: { en: 'Whose tale is the hundredth?' },
      options: [e('The traveller\'s: yours. The other ninety-nine were the keepers\' tales; the last is the one you lived.', 1), e('Keeper Tsuru\'s.', 0, 'The pictures follow the traveller.'), e('Nobody\'s: it is never told.', 0, 'It is about to be told.')] })],
  } };

  // ---- the keepers' practice slates: the one that breaks its rule (A34) ------------------------------------------------------
  // One rule from each of the nine tales, mixed: what you call yourself, how you answer an invitation, giving toward
  // you, おかげで and せいで, someone else's wish, humble verbs for others' doing, 前者 and 後者 for two.
  C.hallW10Cards = {};
  function counter(F, E, I, A, pat, items) {
    C.hallW10Cards[pat] = { F, E, I, A };
    const mk = (item, list, prompt) => ch({ item, ctx: { jp: list.map((x, i) => (i + 1) + ' 、 ' + x[0]).join(' ／ '), en: '' }, prompt: { en: prompt }, options: list.map((x, i) => o(String(i + 1) + ' 、 ' + x[0], x[1], x[2])) });
    const q = 'Three slates keep the rules the tales taught. Which one breaks its rule?';
    return { F: [mk(items.F, F, q)], E: [mk(items.E, E, q)], I: [mk(items.I, I, q)], A: [mk(items.A, A, 'Three slates keep the rules the tales taught. Which is the counterexample?')] };
  }
  const C0 = counter(
    [['みぎ に まがって 、 まっすぐ いって ください 。', 0, 'Correct.'], ['あめ が ふったら 、 いきません 。', 0, 'Correct.'], ['わたし は 、 たなか さま です 。', 1, 'さま, like さん, is never for yourself: わたし は たなか です.'], ['かお を あらって から 、 たべます 。', 0, 'Correct.']],
    [['{先生|せんせい} に {本|ほん} を いただきました 。', 0, 'Correct.'], ['{雨|あめ} が {降|ふ}って も 、 {行|い}きます 。', 0, 'Correct.'], ['{窓|まど} の {外|そと} が {濡|ぬ}れて いる 。 {雨|あめ} が {降|ふ}った らしい 。', 0, 'Correct.'], ['「 お{茶|ちゃ} を {飲|の}み に {行|い}きません か 。 」 「 はい 、 {行|い}きません 。 」', 1, 'To accept an invitation in ～ませんか, say はい 、 {行|い}きましょう (or ええ 、 ぜひ).']],
    [['{遅|おく}れる {場合|ばあい} は 、 {知|し}らせて ください 。', 0, 'Correct.'], ['{約束|やくそく} した のに 、 {来|こ}なかった 。', 0, 'Correct.'], ['{雨|あめ} の おかげ で 、 {祭|まつ}り が {中止|ちゅうし} に なった 。', 1, 'おかげで credits a cause for something good; for a festival rained off, say {雨|あめ} の せい で.'], ['お{客|きゃく}さま が いらっしゃいました 。', 0, 'Correct.']],
    [['{師匠|ししょう} に {手紙|てがみ} を {読|よ}んで いただいた 。', 0, 'Correct.'], ['{手紙|てがみ} に よる と 、 {明日|あした} {着|つ}く と の こと だ 。', 0, 'Correct.'], ['{例|れい} の {件|けん} は 、 {明日|あした} {話|はな}そう 。', 0, 'Correct.'], ['{親方|おやかた} が {私|わたし} の {仕事|しごと} を {拝見|はいけん} しました 。', 1, 'The counterexample: {拝見|はいけん}する is humble, for your own looking; the master\'s looking is ご{覧|らん}に なりました.']], 0,
    { F: 'g:address_terms', E: 'g:v_mashou', I: 'g:okage_sei', A: 'g:keigo_kenjo' });
  const C1 = counter(
    [['ひだり に まがって ください 。', 0, 'Correct.'], ['これ を ください 。', 0, 'Correct.'], ['しらない ひと に 「 おい 、 なまえ は ？ 」 と きいた 。', 1, 'To someone you don\'t know, ask politely: すみません 、 おなまえ は ？'], ['あさ おきて 、 それから かお を あらった 。', 0, 'Correct.']],
    [['{友達|ともだち} が {私|わたし} に {本|ほん} を くれた 。', 0, 'Correct.'], ['この {傘|かさ} 、 {借|か}りて も いい ？', 0, 'Correct.'], ['{明日|あした} は {雨|あめ} だ そう だ 。', 0, 'Correct.'], ['{先生|せんせい} が {私|わたし} に {本|ほん} を あげました 。', 1, 'Giving toward you is くれる, and from a teacher くださる: {先生|せんせい} が {本|ほん} を くださいました.']],
    [['{日曜|にちよう} {以外|いがい} は 、 {毎日|まいにち} {開|あ}いて いる 。', 0, 'Correct.'], ['{赤|あか}い の を {取|と}って 。', 0, 'Correct.'], ['{疲|つか}れた ので 、 {少|すこ}し {休|やす}みます 。', 0, 'Correct.'], ['{田中|たなか} さん は 、 {寿司|すし} が {食|た}べたい です 。', 1, '～たい is for your own wish; for someone else\'s, say {食|た}べたがって います (or {食|た}べたい そう です).']],
    [['では 、 {始|はじ}め させて いただきます 。', 0, 'Correct.'], ['{医者|いしゃ} の {話|はなし} で は 、 すぐ {治|なお}る と の こと です 。', 0, 'Correct.'], ['{雨|あめ} が {降|ふ}らない {限|かぎ}り 、 {祭|まつ}り は {行|おこな}われる 。', 0, 'Correct.'], ['{前者|ぜんしゃ} は {赤|あか} 、 {後者|こうしゃ} は {青|あお} 、 {三|みっ}つ{目|め} は {白|しろ} だ 。', 1, 'The counterexample: {前者|ぜんしゃ} and {後者|こうしゃ} are for exactly two things just mentioned; with three, say {一|ひと}つ{目|め} 、 {二|ふた}つ{目|め} 、 {三|みっ}つ{目|め}.']], 1,
    { F: 'g:register_polite_plain', E: 'g:giving', I: 'g:v_tai', A: 'g:rei_no' });
  const cardStretch = [ch({ item: 'g:adv_kara_koso', ctx: { jp: '{言葉|ことば} が {消|き}えて いた から 、 {名前|なまえ} を {呼|よ}び{戻|もど}した 。 ／ {言葉|ことば} が {消|き}えて いた から こそ 、 {名前|なまえ} を {呼|よ}び{戻|もど}した 。', en: '' }, prompt: { en: 'What does こそ add to the second?' },
    options: [e('It singles the reason out: "it was exactly because words were vanishing that I called the names back", the loss itself the reason to act.', 1), e('Nothing: こそ is decoration.', 0, 'こそ picks out the reason and stresses it.'), e('It turns the reason into a contrast.', 0, 'からこそ is still a reason, only stronger.')] })];
  C.challenges['hall.w10.counter0'] = { title: T('{灯守|ひもり} の {石板|せきばん}', 'The keepers\' slates'), tiers: C0, stretchA: cardStretch };
  C.challenges['hall.w10.counter1'] = { title: T('{灯守|ひもり} の {石板|せきばん}', 'The keepers\' slates'), tiers: C1, stretchA: cardStretch };

  // ---- asking where the keepers' note says the hundredth wick is kept (A12) ---------------------------------------------------
  C.challenges['hall.w10.ask'] = { title: T('{灯守|ひもり} の {書|か}き{付|つ}け', 'The keepers\' note'), tiers: {
    F: [ch({ item: 'g:exist_aru_iru', prompt: { en: 'You want to know where the hundredth wick is, from the note. What do you ask?' },
      options: [o('とうしん は 、 どこ に あります か 。', 1), o('とうしん は 、 いくら です か 。', 0, 'That asks what the wick costs.'), o('かきつけ は 、 だれ が かきました か 。', 0, 'That asks who wrote the note.')] })],
    E: [ch({ item: 'g:exist_aru_iru', prompt: { en: 'You want to know where, by the note, the hundredth wick is. What do you ask?' },
      options: [o('{書|か}き{付|つ}け に よる と 、 {百番目|ひゃくばんめ} の {灯芯|とうしん} は どこ に ある ん です か 。', 1), o('{灯芯|とうしん} は 、 {何|なに} で できて いる ん です か 。', 0, 'That asks what the wick is made of.'), o('{書|か}き{付|つ}け は 、 いつ {書|か}かれた ん です か 。', 0, 'That asks when the note was written.')] })],
    I: [ch({ item: 'g:te_oku', prompt: { en: 'You want to know where the last keepers put the hundredth wick away. What do you ask?' },
      options: [o('{最後|さいご} の {灯守|ひもり} たち は 、 {百番目|ひゃくばんめ} の {灯芯|とうしん} を どこ に しまって おいた と {書|か}いて あります か 。', 1), o('{最後|さいご} の {灯守|ひもり} たち は 、 {灯芯|とうしん} を {誰|だれ} に {渡|わた}した ん です か 。', 0, 'That asks whom they gave it to.'), o('{灯芯|とうしん} は 、 {全部|ぜんぶ} で {何本|なんぼん} あった ん です か 。', 0, 'That asks how many wicks there were.')] })],
    A: [ch({ item: 'g:te_kudasaru', prompt: { en: 'Ask, politely, how the note gives the wick\'s hiding place.' },
      options: [o('{恐|おそ}れ{入|い}ります が 、 {書|か}き{付|つ}け に は 、 {灯芯|とうしん} の {在|あ}り{処|か} が どう {記|しる}されて いる か 、 {読|よ}んで いただけます か 。', 1), o('{灯芯|とうしん} を 、 {拝借|はいしゃく} して も よろしい でしょう か 。', 0, 'That asks to borrow the wick.'), o('この {書|か}き{付|つ}け を {書|か}かれた の は 、 どなた です か 。', 0, 'That asks who wrote it.')] })],
  },
  stretchA: [ch({ item: 'g:te_oku', ctx: { jp: '{次|つぎ} に {百|ひゃく} を {語|かた}る {者|もの} の ため に 。', en: '' }, prompt: { en: 'The note ends with this. What does it tell you about the last keepers?' },
    options: [e('That they put the wick away (～ておく) for someone to come: even as they stopped, they expected the Hundred to be told one day.', 1), e('That they forbade anyone to tell it.', 0, 'ために: for the sake of the one who comes next.'), e('That they took the wick with them.', 0, 'They left it for the next teller.')] })] };

  // ---- the riddle stone (a reprieve) -----------------------------------------------------------------------------------------
  C.challenges['hall.w10.riddle'] = { title: T('なぞなぞ の {石|いし}', 'The riddle stone'), tiers: {
    F: [ch({ item: 'g:v_ta', ctx: { jp: 'くち から でて 、 みみ に はいる 。 て で さわれない けど 、 ずっと のこる 。 なあに ？', en: '' }, prompt: { en: 'What is it?' },
      options: [o('はなし', 1), o('かぜ', 0, 'The wind doesn\'t come out of a mouth, and it doesn\'t stay.'), o('あめ', 0, 'Rain doesn\'t go into your ears and stay.')] })],
    E: [ch({ item: 'g:address_terms', ctx: { jp: '{誰|だれ} でも {一|ひと}つ {持|も}って いる 。 {人|ひと} に {呼|よ}ばれる と 、 {振|ふ}り{向|む}く 。 {何|なん} だ ？', en: '' }, prompt: { en: 'What is it?' },
      options: [o('{名前|なまえ}', 1), o('{影|かげ}', 0, 'A shadow doesn\'t turn when it is called.'), o('{顔|かお}', 0, 'You turn your face, but nobody calls your face.')] })],
    I: [ch({ item: 'g:rashii', ctx: { jp: '{百|ひゃく} {語|かた}る と 、 {何|なに} か が {現|あらわ}れる と いう 。 {現|あらわ}れる の は 、 {語|かた}った {本人|ほんにん} の {後|うし}ろ に いつも いる もの 。 {何|なん} だ ？', en: '' }, prompt: { en: 'What is it?' },
      options: [o('{影|かげ}', 1), o('{幽霊|ゆうれい}', 0, 'A ghost, the legend says; but a ghost is not always behind you.'), o('{狐|きつね}', 0, 'Foxes get the blame in other tales.')] })],
    A: [ch({ item: 'g:giving', ctx: { jp: '{受|う}けた {時|とき} より 、 {返|かえ}す {時|とき} の ほう が {大|おお}きく なる 。 {鶴|つる} も それ を {返|かえ}し に {来|き}た 。 {何|なに} か 。', en: '' }, prompt: { en: 'What is it?' },
      options: [o('{恩|おん}', 1), o('{傘|かさ}', 0, 'A borrowed umbrella goes back as it came.'), o('{名前|なまえ}', 0, 'A borrowed name goes back as it came.')] })],
  },
  stretchA: [ch({ item: 'g:giving', ctx: { jp: '{恩|おん} を {仇|あだ} で {返|かえ}す', en: '' }, prompt: { en: 'What does the saying mean?' },
    options: [e('To repay a kindness with harm: the opposite of the crane.', 1), e('To return a favour twice over.', 0, '仇: harm, an enemy\'s turn.'), e('To forget a debt.', 0, 'It is worse than forgetting: harm for kindness.')] })] };

  // ---- t5: the moss lantern (rooted) --------------------------------------------------------------------------------------------
  C.encounters = C.encounters || {};
  const MOSS = { enemy: 'kr.moss', name: say('{苔|こけ} {灯籠|どうろう}', 'Moss lantern'), conditions: ['rooted'], knots: 2, music: 'battle_keepers' };
  C.encounters['hall.w10.moss'] = {
    id: 'hall.w10.moss', kind: 'battle', name: say('{苔|こけ} {灯籠|どうろう}', 'The moss lantern'),
    lead: Object.assign({}, MOSS, { knots: 3 }),
    group: { normal: [MOSS], hard: [MOSS, MOSS] },
    rules: { wait: true, conditions: true },
  };

  // ---- t9: Sōan and Kohaku (a mediation) ---------------------------------------------------------------------------------------
  function task(item, en, ok, w1, why1, w2, why2) {
    const low = ch({ item, prompt: { en }, options: [{ jp: ok, ok: true }, { jp: w1, ok: false, why: { en: why1 } }] });
    const high = ch({ item, prompt: { en: en + ' (Read them closely: two are near.)' }, options: [{ jp: ok, ok: true }, { jp: w1, ok: false, why: { en: why1 } }, { jp: w2, ok: false, why: { en: why2 } }] });
    return { F: low, E: low, I: high, A: high };
  }
  C.encounters['hall.w10.vigil'] = {
    id: 'hall.w10.vigil', kind: 'social', name: say('ソウアン と コハク', 'Sōan and Kohaku'),
    rules: { wait: true },
    autoRoute: ['s:calm', 's:ask', 'wait', 's:together'],
    social: {
      parties: [
        { aid: 'n:soan', name: say('ソウアン', 'Sōan'), stance: 'heated', wants: { en: 'To leave the Hundred at ninety-nine: the legend says something appears after the hundredth tale.' } },
        { aid: 'n:kohaku', name: say('コハク', 'Kohaku'), stance: 'heated', wants: { en: 'To finish the Hundred, as the keepers before them did.' } },
      ],
      claims: {
        fear: { by: 'n:soan', jp: '{百話目|ひゃくわめ} の {後|あと} に は 、 {何|なに} か が {現|あらわ}れる 。 {昔|むかし} から そう {言|い}われて おる 。', en: 'Sōan: "After the hundredth tale, something appears. So it has always been said."' },
        finish: { by: 'n:kohaku', jp: '{九十九|きゅうじゅうきゅう} で {止|や}める なんて 、 {今|いま} まで の {話|はなし} が かわいそう です 。', en: 'Kohaku: "Stopping at ninety-nine isn\'t fair to all the tales before it."' },
        self: { by: 'n:soan', jp: '…… {本当|ほんとう} は な 、 {怖|こわ}い の は {化|ば}け{物|もの} で は ない 。 {百|ひゃく} を {語|かた}り{終|お}えたら 、 この {子|こ} は {館|やかた} を {出|で}て いく 。 それ が {怖|こわ}い の だ 。', en: 'Sōan: "…The truth is, it isn\'t a monster I fear. Once the Hundred is told, the child will leave the Hall. That is what I fear."', hidden: true },
      },
      understanding: 3,
      gesture: { name: say('{消|き}えかけた {灯|ひ} の {芯|しん} を {切|き}る', 'Trim a guttering wick'), desc: 'Trim the wick of a lantern that is guttering between them.', effect: { stance: { 'n:soan': 'listening', 'n:kohaku': 'listening' } }, once: true, says: { en: 'The lantern steadies. For a moment they both watch the flame instead of each other.' } },
      unravelTip: { en: 'Nothing is knotted. One of them fears an ending; the other fears never reaching one.' },
      actions: [
        { id: 'calm', kind: 'restate', label: say('ソウアン さん は {百話目|ひゃくわめ} の {後|あと} を 、 コハク さん は {話|はなし} が {途中|とちゅう} で {終|お}わる こと を {心配|しんぱい} して いる ん です ね 。', 'Say back what each of them is afraid of'),
          task: task('g:n_desu', 'Which says back what each of them is afraid of?', 'ソウアン さん は {百話目|ひゃくわめ} の {後|あと} を 、 コハク さん は {話|はなし} が {途中|とちゅう} で {終|お}わる こと を {心配|しんぱい} して いる ん です ね 。', 'お{二人|ふたり} と も 、 {化|ば}け{物|もの} が {怖|こわ}い ん です ね 。', 'Kohaku is not afraid of monsters.', 'お{二人|ふたり} と も 、 もう {寝|ね}たい ん です ね 。', 'Neither of them wants to sleep on this.'),
          cases: [{ when: { stance: { 'n:soan': 'heated' } }, effect: { stance: { 'n:soan': 'listening' } }, says: { en: 'Sōan grunts. "Aye. Something comes after the hundredth. Everyone knows it."' } },
            { when: { stance: { 'n:kohaku': 'heated' } }, effect: { stance: { 'n:kohaku': 'listening' } }, says: { en: 'Kohaku lets out a breath. "Ninety-nine tales, and the last one never told. It isn\'t right."' } }],
          says: { en: 'They are already listening.' } },
        { id: 'ask', kind: 'ask', label: say('{百話目|ひゃくわめ} の {後|あと} に 、 {本当|ほんとう} は {何|なに} が {起|お}きる と {思|おも}って いる ん です か 。', 'Ask Sōan what he really thinks will happen'), once: true, when: { stance: { 'n:soan': 'listening' } },
          task: task('g:n_desu', 'Which asks what he really thinks will happen after the hundredth?', '{百話目|ひゃくわめ} の {後|あと} に 、 {本当|ほんとう} は {何|なに} が {起|お}きる と {思|おも}って いる ん です か 。', '{百話目|ひゃくわめ} は 、 {何時|なんじ} に {始|はじ}まります か 。', 'That asks when it starts.', 'コハク さん は 、 {何歳|なんさい} です か 。', 'That asks Kohaku\'s age.'),
          effect: { reveal: 'self', understanding: 1 }, says: { en: 'Sōan is quiet a long while. "…It isn\'t a monster. Once the Hundred is told, the child will leave. That is what I fear."' } },
        { id: 'together', kind: 'propose', label: say('{百話目|ひゃくわめ} は 、 {二人|ふたり} で {語|かた}りません か 。 {語|かた}り{終|お}えて も 、 {帰|かえ}る {場所|ばしょ} は {同|おな}じ です 。', 'Propose they tell the hundredth together'), when: { claims: ['self'] },
          task: task('g:indirectness', 'Which proposes, gently, that they tell it together?', '{百話目|ひゃくわめ} は 、 {二人|ふたり} で {語|かた}りません か 。 {語|かた}り{終|お}えて も 、 {帰|かえ}る {場所|ばしょ} は {同|おな}じ です 。', 'コハク さん {一人|ひとり} で {語|かた}れば いい です 。', 'That leaves Sōan out.', 'もう {二度|にど} と {語|かた}らない ほう が いい です 。', 'That ends the Hundred for good.'),
          effect: { flag: 'together' }, says: { en: 'Kohaku looks at Sōan, and Sōan at the dark lantern. "…Together, then," he says. "And afterwards, we go home the same way."' } },
        { id: 'blunt', kind: 'propose', label: say('{迷信|めいしん} を {信|しん}じる の は 、 やめて ください 。', 'Tell Sōan to stop believing superstitions'), lasting: true, means: { en: 'You will tell Sōan his fear is only superstition.' },
          task: task('g:v_te_kudasai', 'Which tells him to stop believing superstitions?', '{迷信|めいしん} を {信|しん}じる の は 、 やめて ください 。', 'もう {少|すこ}し 、 お{話|はなし} を {聞|き}かせて ください 。', 'That invites him to say more.', 'お{茶|ちゃ} を {入|い}れましょう か 。', 'That offers tea.'),
          effect: { stance: { 'n:soan': 'leaving' } }, says: { en: 'Sōan draws himself up. "Superstition, is it." He takes his lamp and goes to sit alone at the far end of the corridor.' } },
      ],
      responses: {
        water: { effect: { stance: { 'n:kohaku': 'listening' } }, says: { en: 'You hand Kohaku a cup of water. They drink it in one go.' } },
        unravel: { says: { en: 'Nothing here is knotted. One fears an ending; the other fears never reaching one.' } },
      },
      wait: { when: { stance: { 'n:soan': 'listening' } }, effect: { reveal: 'self' }, says: { en: 'Sōan watches Kohaku trim a wick. "…They\'ll be gone, once it\'s told," he says, very quietly.' } },
      drift: [{ when: { all: [{ rounds: 3 }, { stance: { 'n:soan': 'heated' } }] }, once: true, effect: { stance: { 'n:soan': 'listening', 'n:kohaku': 'listening' } }, says: { en: 'One of the ninety-nine lanterns gutters and flares. They both turn to look, and forget for a moment what they were arguing about.' } }],
      companion: {
        nao: [{ id: 'nao_reply', name: say('{手紙|てがみ} の {結|むす}び', 'How a letter ends'), desc: 'Nao, who carries letters, says what an ending is for.', once: true, effect: { understanding: 1, stance: { 'n:soan': 'listening' } }, says: { en: 'Nao: "Every letter ends, and nobody ever stopped writing back because of it. An ending\'s just where the reply starts."' } }],
        mio: [{ id: 'mio_name', name: say('{怖|こわ}さ の {名前|なまえ}', 'Naming the fear'), desc: 'Mio says what changes once a fear has a name.', once: true, effect: { understanding: 1, stance: { 'n:soan': 'listening' } }, says: { en: 'Mio: "A fear with no name is the worst kind. Once you say what it is, it\'s only a sad thing, and a sad thing can be shared."' } }],
        ren: [{ id: 'ren_ushio', name: say('{師匠|ししょう} の {言葉|ことば}', 'What a teacher said'), desc: 'Ren remembers one of Master Ushio\'s teachings.', once: true, effect: { understanding: 1, stance: { 'n:kohaku': 'listening' } }, says: { en: 'Ren: "Master Ushio used to say a lantern isn\'t lit for the keeper. It\'s lit so someone else can find the way. I think that goes for tales, too."' } }],
        suzu: [{ id: 'suzu_bow', name: say('{幕|まく} の {後|あと}', 'After the curtain'), desc: 'Suzu talks about what happens after a show ends.', once: true, effect: { understanding: 1 }, says: { en: 'Suzu: "The curtain coming down isn\'t the end of the company. You take your bow together, and then you all go out for noodles."' } }],
      },
    },
    conclusions: [
      { id: 'left', when: { left: 'n:soan' }, result: 'end', text: { en: 'Sōan has gone to sit alone at the end of the corridor. He will come back to the lanterns; you can try again.' } },
      { id: 'together', when: { flag: 'together' }, result: 'win', text: { en: 'Sōan and Kohaku will tell the hundredth together.' } },
    ],
  };

  // ---- t10: the hundredth tale (the capstone) ------------------------------------------------------------------------------------
  function hear(item, fJp, jp, en, ok, w1, why1, w2, why2) {
    const opts = (two) => [{ en: ok, ok: true }, { en: w1, ok: false, why: { en: why1 } }].concat(two ? [{ en: w2, ok: false, why: { en: why2 } }] : []);
    return { F: ch({ item, ctx: { jp: fJp, en: '' }, prompt: { en }, options: opts(false) }), E: ch({ item, ctx: { jp, en: '' }, prompt: { en }, options: opts(false) }), I: ch({ item, ctx: { jp, en: '' }, prompt: { en }, options: opts(true) }), A: ch({ item, ctx: { jp, en: '' }, prompt: { en }, options: opts(true) }) };
  }
  const A = (id, jp, en, more) => Object.assign({ id, label: { jp, en } }, more);
  const vals = (x) => { const out = {}; for (const k in x) out[k] = { jp: x[k][0], en: x[k][1] }; return out; };
  const FLAME = vals({ dark: ['{消|き}えて いる', 'dark'], ember: ['{火種|ひだね}', 'an ember'], small: ['{小|ちい}さな {炎|ほのお}', 'a small flame'], tall: ['{高|たか}い {炎|ほのお}', 'a tall flame'], lit: ['{灯|とも}った', 'lit'] });
  C.encounters['hall.w10.tale'] = {
    id: 'hall.w10.tale', kind: 'procedure', name: say('{百話目|ひゃくわめ}', 'The hundredth tale'),
    rules: { wait: true },
    procedure: {
      id: 'hall_w10_tale', version: 1, restart: 'stable',
      machine: { flame: 'dark' },
      show: [{ key: 'flame', label: say('{百番目|ひゃくばんめ} の {灯|ひ}', 'The hundredth lantern'), values: FLAME }],
      done: { en: 'The hundredth tale is told: where it began, who walked it with you, what you saw and what you were told, and an ending left open.' },
      steps: [
        { id: 'h1', stable: true, text: say('コハク ： 「 どこ から 、 {話|はなし} を {始|はじ}めます か 。 」', 'Kohaku: "Where will you begin the tale?"'),
          task: hear('g:prt_kara_made', 'コハク ： 「 どこ から 、 はなし を はじめます か 。 」', 'コハク ： 「 どこ から 、 {話|はなし} を {始|はじ}めます か 。 」', 'What does Kohaku ask?',
            'Where your tale begins.', 'Where you are going next.', 'どこから: from where.', 'Why you came to the Hall.', 'どこから asks where from, not why.'),
          actions: [
            A('start', '「 {葦|あし}ノ{瀬|せ} の {灯|ひ} の {下|した} から 、 {始|はじ}めます 」 と {答|こた}える', 'Answer: "From under the lanterns of Reedwake."', { ok: true, set: { flame: 'ember' }, means: { en: 'You begin where your road began.' }, result: { en: 'A spark catches in the hundredth lantern.' } }),
            A('end', '「 {終|お}わり から {始|はじ}めます 」 と {答|こた}える', 'Answer: "I\'ll begin at the end."', { means: { en: 'You go to begin at the end.' }, wrong: { en: 'Kohaku laughs. "Then nobody will know how you got there. Start at the start."' } }),
          ] },
        { id: 'h2', stable: true, text: say('ソウアン ： 「 {誰|だれ} と 、 {旅|たび} を した の か ね 。 」', 'Sōan: "And who walked the road with you?"'),
          task: hear('g:prt_to', 'ソウアン ： 「 だれ と 、 たび を した の か ね 。 」', 'ソウアン ： 「 {誰|だれ} と 、 {旅|たび} を した の か ね 。 」', 'What does Sōan ask?',
            'Who travelled with you.', 'Where you travelled.', '誰と: with whom.', 'How long it took.', '誰と asks who, not how long.'),
          actions: [
            A('company', '「 {仲間|なかま} と 、 {道|みち} で {出会|であ}った {大勢|おおぜい} の {人|ひと} と 」 と {答|こた}える', 'Answer: "With my companions, and with all the people I met on the road."', { ok: true, set: { flame: 'small' }, means: { en: 'You name the people who walked it with you.' }, result: { en: 'A small flame stands up in the lantern.' } }),
            A('alone', '「 {一人|ひとり} で 。 {誰|だれ} の {手|て} も {借|か}りず に 」 と {答|こた}える', 'Answer: "Alone. I needed nobody\'s help."', { means: { en: 'You claim to have walked it alone.' }, wrong: { en: 'Sōan smiles. "Nobody comes this far alone. Who held the lamp when your hands were full?"' } }),
          ] },
        { id: 'h3', stable: true, text: say('コハク ： 「 {見|み}た こと と 、 {聞|き}いた こと を 、 {分|わ}けて {話|はな}して ください 。 」', 'Kohaku: "Please tell what you saw apart from what you were told."'),
          task: hear('g:sou_hear', 'コハク ： 「 みた こと と 、 きいた こと を 、 わけて はなして ください 。 」', 'コハク ： 「 {見|み}た こと と 、 {聞|き}いた こと を 、 {分|わ}けて {話|はな}して ください 。 」', 'What does Kohaku ask of you?',
            'To keep what you saw apart from what you were told.', 'To tell only what you saw.', '分けて: separately, both of them.', 'To tell it in a whisper.', 'Nothing in it says how loud.'),
          actions: [
            A('apart', '「 {静寂|しじま} の {書庫|しょこ} は 、 この {目|め} で {見|み}た 。 この {館|やかた} の こと は 、 ツル さん から {聞|き}いた 」 と {話|はな}す', 'Tell it: "The Still Archive I saw with my own eyes. Of this Hall, I heard from Keeper Tsuru."', { ok: true, set: { flame: 'tall' }, means: { en: 'You keep what you saw apart from what you were told.' }, result: { en: 'The flame grows tall and steady.' } }),
            A('all', '「 {全部|ぜんぶ} 、 この {目|め} で {見|み}た 」 と {話|はな}す', 'Tell it: "I saw all of it with my own eyes."', { means: { en: 'You claim to have seen everything yourself.' }, wrong: { en: 'Kohaku tilts their head. "All of it? Even this Hall, before you ever came? Somebody must have told you."' } }),
          ] },
        { id: 'h4', stable: true, text: say('ソウアン ： 「 {話|はなし} の {結|むす}び は 、 どう する ？ 」', 'Sōan: "And how will you end it?"'),
          task: hear('g:keigo_kenjo', 'ソウアン ： 「 はなし の おわり は 、 どう する ？ 」', 'ソウアン ： 「 {話|はなし} の {結|むす}び は 、 どう する ？ 」', 'What does Sōan ask?',
            'How you will end your tale.', 'Whether you are tired.', '結び: the ending.', 'When you will leave.', 'He asks about the tale, not about leaving.'),
          actions: [
            A('open', '「 {聞|き}いて くださって 、 ありがとう ございました 。 {続|つづ}き は 、 まだ {書|か}いて いる {途中|とちゅう} です 」 と {頭|あたま} を {下|さ}げる', 'Bow: "Thank you for listening. The rest is still being written."', { ok: true, set: { flame: 'lit' }, means: { en: 'You thank them humbly, and leave the ending open.' }, result: { en: 'The hundredth lantern is lit.' } }),
            A('shut', '「 {話|はなし} は これ で おしまい 。 もう {何|なに} も {起|お}こらない 」 と {言|い}う', 'Say: "That\'s the end of it. Nothing more will ever happen."', { means: { en: 'You close the tale for good.' }, wrong: { en: 'Sōan shakes his head. "A traveller\'s tale isn\'t finished while the traveller is still walking. Leave the end open."' } }),
          ] },
      ],
    },
    conclusions: [{ id: 'done', when: { proc: 'done' }, result: 'win', text: { en: 'The hundredth tale is told.' } }],
  };
})(RB.content);
