/* The Hall of a Hundred Tales, wing 2, The Fox's Wedding: the language tasks and encounters (expansion P15; plan
 * 04_DUNGEONS.md D9; scenes in 22_w2_scenes.js). The theme: who does what, from whom to whom (に and から, を and が;
 * あげる, くれる, もらう; 貸す and 借りる). Every task has its four levels and an Advanced stretch.
 *   hall.w2.story      the tale in four pictures, back in order (A38)
 *   hall.w2.story_q    what Sayo's chestnuts mean (optional)
 *   hall.w2.counter0/1 the go-between's cards: the one that breaks the rule (A34)
 *   hall.w2.ask        asking your companion where Sayo sits (A12)
 *   hall.w2.riddle     the riddle stone (a reprieve)
 *   encounters: hall.w2.foxfire (foxfire in a sun-shower: flame in the rain), hall.w2.konta (Konta, who will not give
 *   up his umbrella: a conversation), hall.w2.cups (the cup passed round: the capstone procedure). */
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
  const P1 = '{晴|は}れて いる のに 、 {雨|あめ} が {降|ふ}って きた', P2 = '{村|むら} の {人|ひと} は 「 {狐|きつね} の {嫁入|よめい}り だ 」 と {言|い}って 、 {戸|と} を {閉|し}めた',
    P3 = 'サヨ だけ が 、 {花嫁|はなよめ} に {傘|かさ} を {貸|か}して あげた', P4 = '{次|つぎ} の {朝|あさ} 、 サヨ の {家|いえ} の {前|まえ} に 、 お{礼|れい} の {栗|くり} が {置|お}いて あった';
  C.hallW2Tale = { P1, P2, P3, P4 };
  C.challenges['hall.w2.story'] = { title: T('{狐|きつね} の {嫁入|よめい}り', 'The Fox\'s Wedding'), tiers: {
    F: [OR({ item: 'v:傘', prompt: { en: 'Put the four pictures of the tale back in order.' },
      tiles: ['はれて いる のに 、 あめ が ふって きた', 'むら の ひと は 、 と を しめた', 'サヨ だけ が 、 かさ を かして あげた', 'つぎ の あさ 、 くり が おいて あった'],
      answer: ['はれて いる のに 、 あめ が ふって きた', 'むら の ひと は 、 と を しめた', 'サヨ だけ が 、 かさ を かして あげた', 'つぎ の あさ 、 くり が おいて あった'],
      orderHint: { en: 'The sun-shower; the village shuts its doors; Sayo lends her umbrella; the chestnuts the next morning.' } })],
    E: [OR({ item: 'v:傘', prompt: { en: 'Put the four pictures back in order.' }, tiles: [P3, P1, P4, P2], answer: [P1, P2, P3, P4],
      orderHint: { en: 'First the strange rain, then the villagers hiding from it, then Sayo\'s umbrella, then what came of it.' } })],
    I: [OR({ item: 'g:te_giving', prompt: { en: 'Order the pictures so that each follows from the one before.' }, tiles: [P4, P2, P1, P3], answer: [P1, P2, P3, P4],
      orderHint: { en: 'Everyone else shut their doors; only Sayo lent the umbrella (貸してあげた: a kindness done for the bride), so only her door got the chestnuts.' } })],
    A: [OR({ item: 'g:te_giving', prompt: { en: 'Order the pictures; the turn is the one with だけ in it.' }, tiles: [P2, P4, P3, P1], answer: [P1, P2, P3, P4],
      orderHint: { en: 'だけ sets Sayo apart from the village; the gift that follows is the answer to that one kindness.' } })],
  },
  stretchA: [ch({ item: 'g:te_giving', ctx: { jp: P3 + ' 。 ' + P4 + ' 。', en: '' }, prompt: { en: 'The tale says 貸してあげた and then 置いてあった. What do the two endings, side by side, tell you?' },
    options: [e('Sayo\'s kindness is told from her side (something done for the bride); the thanks arrives with no giver shown, left there by hands nobody saw: the foxes are present only in what they leave.', 1),
      e('Both say Sayo did everything herself.', 0, '置いてあった names no giver: someone left them, and the tale will not say who.'),
      e('They mean the same: both are just past tense.', 0, 'One is a favour done (てあげる); the other is a result left in place (てある).')] })] };
  C.challenges['hall.w2.story_q'] = { title: T('{話|はなし} の {後|あと} で', 'After the tale'), optional: true, tiers: {
    F: [ch({ item: 'v:栗', ctx: { jp: 'つぎ の あさ 、 サヨ の いえ の まえ に 、 くり が おいて あった 。', en: '' }, prompt: { en: 'Who left the chestnuts, do you think?' },
      options: [e('The fox bride, to say thank you.', 1), e('Sayo herself.', 0, 'They were left at her door: a gift for her.')] })],
    E: [ch({ item: 'v:礼', ctx: { jp: P4 + ' 。', en: '' }, prompt: { en: 'What are the chestnuts for?' },
      options: [e('They are thanks for the umbrella.', 1), e('They are payment for the rain.', 0, 'お{礼|れい}: thanks.'), e('Sayo is selling them.', 0, 'They were left at her door.')] })],
    I: [ch({ item: 'g:te_giving', ctx: { jp: P3 + ' 。', en: '' }, prompt: { en: 'Why does the tale say 貸してあげた rather than just 貸した?' },
      options: [e('To show the lending as a kindness done for the bride, from Sayo\'s side.', 1), e('Because the umbrella was a present.', 0, '貸す is to lend: she expected it back.'), e('Because the bride asked her to.', 0, 'The tale does not say she asked.')] })],
    A: [ch({ item: 'g:te_giving', ctx: { jp: P2 + ' 。 ' + P3 + ' 。', en: '' }, prompt: { en: 'The villagers call it a fox\'s wedding and shut their doors. What is the tale suggesting?' },
      options: [e('That naming a thing is not the same as being kind to it: the one who lent an umbrella is the one who was thanked.', 1), e('That foxes are dangerous.', 0, 'The foxes leave a gift, not harm.'), e('That rain in sunshine is bad luck.', 0, 'The tale\'s rain brings Sayo good luck.')] })],
  } };

  // ---- the go-between's cards: the one that breaks the rule (A34) ----------------------------------------------------------
  // F and E: the one who gives takes が/は and the one who receives に; with もらう, the giver takes に or から.
  // I and A: くれる is giving toward me (or my side), never from me outward.
  C.hallW2Cards = {};
  function counter(F, E, I, A, pat) {
    C.hallW2Cards[pat] = { F, E, I, A };
    const mk = (item, list, prompt) => ch({ item, ctx: { jp: list.map((x, i) => (i + 1) + ' 、 ' + x[0]).join(' ／ '), en: '' }, prompt: { en: prompt }, options: list.map((x, i) => o(String(i + 1) + ' 、 ' + x[0], x[1], x[2])) });
    return {
      F: [mk('g:giving', F, 'Three cards follow the rule. Which one breaks it?')],
      E: [mk('g:giving', E, 'Three cards say who gives to whom correctly. Which one breaks the rule?')],
      I: [mk('g:giving', I, 'Three cards use くれる the way it works. Which one breaks the rule?')],
      A: [mk('g:te_giving', A, 'Three cards use ～てくれる, ～てあげる and ～てもらう correctly. Which is the counterexample?')],
    };
  }
  const C0 = counter(
    [['はなよめ は はなむこ に くり を あげた', 0, 'はなよめ (giver) は, はなむこ (receiver) に: correct.'], ['サヨ は はなよめ に くり を もらった', 0, 'With もらう the giver can take に: correct.'], ['トク は コンタ を ちょうちん に あげた', 1, 'The thing given takes を and the receiver に: コンタ に ちょうちん を あげた.'], ['ギン は トク から かさ を もらった', 0, 'With もらう the giver can take から: correct.']],
    [['{花嫁|はなよめ} は {花婿|はなむこ} に {栗|くり} を あげた', 0, 'Giver は, receiver に: correct.'], ['サヨ は {花嫁|はなよめ} に {栗|くり} を もらった', 0, 'もらう: the giver with に: correct.'], ['トク は コンタ を {提灯|ちょうちん} に あげた', 1, 'The gift takes を, the receiver に: コンタ に {提灯|ちょうちん} を あげた.'], ['ギン は トク から {傘|かさ} を もらった', 0, 'もらう: the giver with から: correct.']],
    [['{姉|あね} が {私|わたし} に {傘|かさ} を くれた', 0, 'Toward me: correct.'], ['トク さん が {弟|おとうと} に {栗|くり} を くれた', 0, 'Toward my side (my brother): correct.'], ['{私|わたし} は サヨ に {盃|さかずき} を くれた', 1, 'くれる never goes from me outward: {私|わたし} は サヨ に {盃|さかずき} を あげた.'], ['サヨ が {私|わたし} たち に {提灯|ちょうちん} を くれた', 0, 'Toward us: correct.']],
    [['サヨ が {傘|かさ} を {貸|か}して くれた', 0, 'A kindness toward me: correct.'], ['{私|わたし} は コンタ に {傘|かさ} を {貸|か}して あげた', 0, 'A kindness I did: correct.'], ['{私|わたし} は トク さん に {道|みち} を {教|おし}えて くれた', 1, 'The counterexample: てくれる cannot run from me to someone else. {教|おし}えて あげた (or, more modestly, {教|おし}えた).'], ['{花嫁|はなよめ} に {髪|かみ} を {結|ゆ}って もらった', 0, 'I had the bride do it for me: correct.']], 0);
  const C1 = counter(
    [['ギン は コズエ に はな を あげた', 0, 'Correct.'], ['コンタ は トク から くり を もらった', 0, 'Correct.'], ['サヨ に はなよめ は かさ を かりた', 0, 'The lender with に, the borrower は: correct (サヨ lent it).'], ['トク は ギン に もらった を ちょうちん', 1, 'The thing given comes before the verb, with を: ギン に ちょうちん を もらった.']],
    [['ギン は コズエ に {花|はな} を あげた', 0, 'Correct.'], ['コンタ は トク から {栗|くり} を もらった', 0, 'Correct.'], ['サヨ に {花嫁|はなよめ} は {傘|かさ} を {借|か}りた', 0, 'Correct: the bride borrowed from Sayo.'], ['トク は ギン に もらった を {提灯|ちょうちん}', 1, 'を goes with the thing, before the verb: ギン に {提灯|ちょうちん} を もらった.']],
    [['{友達|ともだち} が {私|わたし} に {手紙|てがみ} を くれた', 0, 'Correct.'], ['{先生|せんせい} が {妹|いもうと} に {本|ほん} を くれた', 0, 'Toward my side: correct.'], ['{花嫁|はなよめ} が {花婿|はなむこ} に {栗|くり} を くれた', 1, 'Neither is me or my side; told from outside, it is あげた.'], ['{村|むら} の {人|ひと} が {僕|ぼく} に {傘|かさ} を くれた', 0, 'Toward me: correct.']],
    [['コンタ が {道|みち} を {案内|あんない} して くれた', 0, 'Correct.'], ['{花婿|はなむこ} に {盃|さかずき} を {渡|わた}して もらった', 0, 'I had the groom do it: correct.'], ['トク さん は {私|わたし} に {話|はなし} を {聞|き}いて あげた', 1, 'The counterexample: a favour toward me is てくれた: {聞|き}いて くれた.'], ['{私|わたし} は {花嫁|はなよめ} の {荷物|にもつ} を {持|も}って あげた', 0, 'Correct.']], 1);
  const cardStretch = [ch({ item: 'g:te_giving', ctx: { jp: '{傘|かさ} を {貸|か}して くれた 。 ／ {傘|かさ} を {貸|か}して もらった 。', en: '' }, prompt: { en: 'Both are about the same umbrella lent to me. What does each put first?' },
    options: [e('くれた puts the lender\'s kindness first (they did it for me); もらった puts my receiving first (I had it lent to me), which can sound as if I asked.', 1), e('They mean exactly the same.', 0, 'Same event, told from a different side.'), e('もらった means I lent it.', 0, 'もらう is receiving.')] })];
  C.challenges['hall.w2.counter0'] = { title: T('{仲人|なこうど} の {札|ふだ}', 'The go-between\'s cards'), tiers: C0, stretchA: cardStretch };
  C.challenges['hall.w2.counter1'] = { title: T('{仲人|なこうど} の {札|ふだ}', 'The go-between\'s cards'), tiers: C1, stretchA: cardStretch };

  // ---- asking about the seating list (A12) -----------------------------------------------------------------------------------
  C.challenges['hall.w2.ask'] = { title: T('{席|せき} の {紙|かみ}', 'The seating list'), tiers: {
    F: [ch({ item: 'v:席', prompt: { en: 'You want to know where Sayo sits. What do you ask?' },
      options: [o('サヨ の せき は 、 どこ です か 。', 1), o('サヨ は 、 だれ です か 。', 0, 'That asks who Sayo is.'), o('せき は 、 いくつ です か 。', 0, 'That asks how many seats there are.')] })],
    E: [ch({ item: 'v:席', prompt: { en: 'You want to know where Sayo sits. What do you ask?' },
      options: [o('サヨ さん の {席|せき} は 、 どこ です か 。', 1), o('サヨ さん は 、 {誰|だれ} の {席|せき} です か 。', 0, 'That asks whose seat Sayo is.'), o('{席|せき} は 、 {何|なん} {人|にん} です か 。', 0, 'That asks how many people.')] })],
    I: [ch({ item: 'g:prt_no', prompt: { en: 'You want to know who Sayo sits next to. What do you ask?' },
      options: [o('サヨ さん は 、 {誰|だれ} の {隣|となり} に {座|すわ}ります か 。', 1), o('サヨ さん の {隣|となり} は 、 どこ に {座|すわ}ります か 。', 0, 'That asks where her neighbour sits, not who it is.'), o('サヨ さん は 、 {誰|だれ} に {座|すわ}ります か 。', 0, 'に with 座る is the seat or place, not a person.')] })],
    A: [ch({ item: 'g:keigo_sonkei', prompt: { en: 'Ask the go-between\'s list, politely, where the guest of honour, Sayo, is to be seated.' },
      options: [o('サヨ さま は 、 どちら に お{座|すわ}り に なります か 。', 1), o('サヨ は 、 どこ に {座|すわ}る ？', 0, 'Far too plain for a guest of honour at a wedding.'), o('サヨ さま は 、 どちら に {座|すわ}らせます か 。', 0, 'That asks where you will make her sit.')] })],
  },
  stretchA: [ch({ item: 'g:keigo_sonkei', ctx: { jp: '「 サヨ さま の お{席|せき} は 、 {花嫁|はなよめ} の {隣|となり} で ございます 。 」', en: '' }, prompt: { en: 'Why is Sayo given a seat beside the bride, at a fox wedding?' },
    options: [e('She is the guest of honour: the one person who lent the bride an umbrella; the seat is the thanks said in public.', 1), e('Because she is a fox too.', 0, 'Nothing says so; she is the village girl.'), e('Because there was no other seat.', 0, 'The list is careful: the place is chosen.')] })] };

  // ---- the riddle stone (a reprieve) -----------------------------------------------------------------------------------------
  C.challenges['hall.w2.riddle'] = { title: T('なぞなぞ の {石|いし}', 'The riddle stone'), tiers: {
    F: [ch({ item: 'v:雨', ctx: { jp: 'おひさま が でて いる のに 、 そら から ふって くる もの 、 なあに ？', en: '' }, prompt: { en: 'What is it?' },
      options: [o('きつね の よめいり', 1), o('ゆき', 0, 'Snow could fall in sunshine, but the riddle wants the name of the rain.'), o('ほし', 0, 'Stars do not fall in the daytime.')] })],
    E: [ch({ item: 'v:狐の嫁入り', ctx: { jp: '{晴|は}れて いる のに 、 {降|ふ}る {雨|あめ} 。 {誰|だれ} の {結婚式|けっこんしき} ？', en: '' }, prompt: { en: 'What is it?' },
      options: [o('{狐|きつね} の {嫁入|よめい}り', 1), o('{鶴|つる} の {恩返|おんがえ}し', 0, 'A crane\'s gratitude: another tale, no rain.'), o('{雀|すずめ} の {宿|やど}', 0, 'The sparrow\'s inn: another tale.')] })],
    I: [ch({ item: 'v:狐の嫁入り', ctx: { jp: '{空|そら} に は お{日様|ひさま} 、 {地面|じめん} に は {雨粒|あまつぶ} 。 {山|やま} の {向|む}こう で 、 {誰|だれ} か が {嫁|とつ}いで いく 。 {何|なん} だ ？', en: '' }, prompt: { en: 'What is it?' },
      options: [o('{狐|きつね} の {嫁入|よめい}り', 1), o('{虹|にじ}', 0, 'A rainbow often comes with it, but nobody marries.'), o('{夕立|ゆうだち}', 0, 'An evening shower comes under clouds, not sunshine.')] })],
    A: [ch({ item: 'v:狐の嫁入り', ctx: { jp: '{照|て}り ながら {降|ふ}る 、 {泣|な}き ながら {笑|わら}う 。 {人|ひと} の {目|め} を {避|さ}けて {行|ゆ}く {花嫁|はなよめ} の {名|な} を {借|か}りた {空模様|そらもよう} 、 {何|なん} と いう ？', en: '' }, prompt: { en: 'What weather borrows a bride\'s name?' },
      options: [o('{狐|きつね} の {嫁入|よめい}り', 1), o('{花曇|はなぐも}り', 0, 'Cloudy blossom-time weather: no rain in sunshine.'), o('{五月雨|さみだれ}', 0, 'The long early-summer rains: grey, not sunlit.')] })],
  },
  stretchA: [ch({ item: 'v:狐の嫁入り', ctx: { jp: '{照|て}り ながら {降|ふ}る 、 {泣|な}き ながら {笑|わら}う 。', en: '' }, prompt: { en: 'What does the riddle\'s second half add to the first?' },
    options: [e('It reads the weather as a face: sun and rain at once, like tears through a smile, which is how a wedding feels to a bride\'s family.', 1), e('Nothing: it repeats the first half.', 0, 'The first half is weather; the second makes it a person.'), e('It means foxes cry at weddings.', 0, 'It is the weather that weeps and smiles.')] })] };

  // ---- t5: foxfire in a sun-shower (conditions: flame, in the rain) -----------------------------------------------------------
  C.encounters = C.encounters || {};
  const FOXFIRE = { enemy: 'co.ember', name: say('{狐火|きつねび}', 'Foxfire'), conditions: ['flame', 'airborne'], knots: 2, music: 'battle_atlas' };
  C.encounters['hall.w2.foxfire'] = {
    id: 'hall.w2.foxfire', kind: 'battle', name: say('{雨|あめ} の {狐火|きつねび}', 'Foxfire in the rain'),
    lead: Object.assign({}, FOXFIRE, { knots: 3 }),
    group: { normal: [FOXFIRE], hard: [FOXFIRE, FOXFIRE] },
    rules: { wait: true, conditions: true }, field: ['rain'],
  };

  // ---- t9: Konta, who will not give up his umbrella (a conversation) -----------------------------------------------------------
  function task(item, en, ok, w1, why1, w2, why2) {
    const low = ch({ item, prompt: { en }, options: [{ jp: ok, ok: true }, { jp: w1, ok: false, why: { en: why1 } }] });
    const high = ch({ item, prompt: { en: en + ' (Read them closely: two are near.)' }, options: [{ jp: ok, ok: true }, { jp: w1, ok: false, why: { en: why1 } }, { jp: w2, ok: false, why: { en: why2 } }] });
    return { F: low, E: low, I: high, A: high };
  }
  C.encounters['hall.w2.konta'] = {
    id: 'hall.w2.konta', kind: 'social', name: say('コンタ の {傘|かさ}', 'Konta\'s umbrella'),
    rules: { wait: true },
    autoRoute: ['s:restate', 's:ask_who', 'wait', 's:give'],
    social: {
      parties: [{ aid: 'n:konta', name: say('コンタ', 'Konta'), stance: 'closed', wants: { en: 'For his sister not to go, without having to say it.' } }],
      claims: {
        mine: { by: 'n:konta', jp: 'この {傘|かさ} は 、 {僕|ぼく} の だ ！ {誰|だれ} に も あげない ！', en: '"This umbrella\'s mine! I\'m not giving it to anyone!"' },
        rain: { by: 'n:konta', jp: '{雨|あめ} が {降|ふ}ってる から 、 {姉|ねえ}ちゃん は {出|で}かけちゃ だめ な ん だ 。', en: '"It\'s raining, so my sister can\'t go out."' },
        gift: { by: 'n:konta', jp: '…… {姉|ねえ}ちゃん が くれた {傘|かさ} だ 。 {姉|ねえ}ちゃん が {行|い}っちゃったら 、 {誰|だれ} が {僕|ぼく} を {迎|むか}えに {来|く}る の 。', en: '"…My sister gave me this umbrella. If she goes, who\'ll come and fetch me?"', hidden: true },
      },
      understanding: 2,
      gesture: { name: say('しゃがんで {目|め} の {高|たか}さ を {合|あ}わせる', 'Crouch to his eye level'), desc: 'Get down where he is.', effect: { stance: { 'n:konta': 'listening' } }, once: true, says: { en: 'You crouch down. Konta grips the umbrella tighter, but he looks at you.' } },
      unravelTip: { en: 'Nothing is knotted. Listen for who gave the umbrella to whom.' },
      actions: [
        { id: 'restate', kind: 'restate', label: say('{姉|ねえ}ちゃん に 、 {行|い}って ほしく ない ん だ ね 。', 'Say what he means about the rain'), once: true,
          task: task('g:n_desu', 'He says his sister can\'t go out because of the rain. Which says back what he means?', '{姉|ねえ}ちゃん に 、 {行|い}って ほしく ない ん だ ね 。', '{雨|あめ} が {好|す}き な ん だ ね 。', 'He doesn\'t care about the rain.', '{姉|ねえ}ちゃん と {一緒|いっしょ} に {行|い}きたい ん だ ね 。', 'Close, but he wants her to stay, not to go with her.'),
          effect: { understanding: 1, stance: { 'n:konta': 'listening' } }, says: { en: 'Konta\'s lip trembles. He nods, very small.' } },
        { id: 'ask_who', kind: 'ask', label: say('その {傘|かさ} 、 {誰|だれ} に もらった の ？', 'Ask who gave him the umbrella'), once: true, when: { stance: { 'n:konta': 'listening' } },
          task: task('g:giving', 'Which asks him who gave him the umbrella?', 'その {傘|かさ} 、 {誰|だれ} に もらった の ？', 'その {傘|かさ} 、 {誰|だれ} に あげた の ？', 'That asks who he gave it to.', 'その {傘|かさ} 、 {誰|だれ} が もらった の ？', 'That asks who received it: him.'),
          effect: { reveal: 'gift', understanding: 1 }, says: { en: '"…My sister gave it me," Konta says. "So I wouldn\'t get wet waiting for her."' } },
        { id: 'give', kind: 'propose', label: say('その {傘|かさ} 、 {姉|ねえ}ちゃん に あげたら ？ {嫁入|よめい}り の お{祝|いわ}い に 。', 'Suggest he give it to his sister, as a wedding present'), when: { claims: ['gift'] },
          task: task('g:giving', 'Which suggests he gives the umbrella to his sister as a present?', 'その {傘|かさ} 、 {姉|ねえ}ちゃん に あげたら ？ {嫁入|よめい}り の お{祝|いわ}い に 。', 'その {傘|かさ} 、 {姉|ねえ}ちゃん に もらったら ？', 'He already got it from her; that turns it round.', 'その {傘|かさ} 、 {僕|ぼく} に くれたら ？', 'That asks him to give it to you.'),
          effect: { flag: 'given' }, says: { en: 'Konta looks at the umbrella a long time. "…Then she won\'t get wet. On the way." He nods.' } },
        { id: 'blunt', kind: 'propose', label: say('{傘|かさ} を {返|かえ}しなさい 。', 'Tell him to hand the umbrella back'), lasting: true, means: { en: 'You will order him to give up the umbrella.' },
          task: task('g:v_te_kudasai', 'Which orders him to hand it back?', '{傘|かさ} を {返|かえ}しなさい 。', '{傘|かさ} を {大事|だいじ} に して ね 。', 'That tells him to look after it.', '{傘|かさ} を {貸|か}して くれて 、 ありがとう 。', 'That thanks him for lending it.'),
          effect: { stance: { 'n:konta': 'leaving' } }, says: { en: '"No!" Konta runs off behind the torii, the umbrella clutched to his chest.' } },
      ],
      responses: {
        water: { effect: { stance: { 'n:konta': 'listening' } }, says: { en: 'You hold your hand out in the rain beside his. He giggles despite himself.' } },
        unravel: { says: { en: 'Nothing here is knotted. Listen to who gave whom the umbrella.' } },
      },
      wait: { when: { stance: { 'n:konta': 'listening' } }, effect: { reveal: 'gift' }, says: { en: 'Konta says, to the umbrella more than to you, "My sister gave me this."' } },
      companion: {
        nao: [{ id: 'nao_letter', name: say('{手紙|てがみ} の {話|はなし}', 'Talk about letters'), desc: 'Nao, who carries letters, talks about writing to someone who has moved away.', once: true, effect: { understanding: 1, stance: { 'n:konta': 'listening' } }, says: { en: 'Nao: "People who move away still get letters. I carry them." Konta peeks out from under the umbrella.' } }],
        mio: [{ id: 'mio_sleeve', name: say('{袖|そで} を {拭|ふ}く', 'Dry his sleeve'), desc: 'Mio dries his wet sleeve.', once: true, effect: { stance: { 'n:konta': 'listening' } }, says: { en: 'Mio dries his sleeve with her cloth. "There. You held that umbrella over your sister\'s things, didn\'t you." He sniffs.' } }],
        ren: [{ id: 'ren_light', name: say('{灯|ひ} の {話|はなし}', 'Speak of the procession\'s lights'), desc: 'Ren speaks of the lanterns lighting her way.', once: true, effect: { understanding: 1, stance: { 'n:konta': 'listening' } }, says: { en: 'Ren: "The lanterns light her way there, and the same road brings her back to visit." Konta looks up.' } }],
        suzu: [{ id: 'suzu_umbrella', name: say('{傘|かさ} の {芸|げい}', 'An umbrella trick'), desc: 'Suzu spins a borrowed umbrella like a stage prop.', once: true, effect: { understanding: 1, stance: { 'n:konta': 'listening' } }, says: { en: 'Suzu spins an umbrella on one finger. "A good umbrella goes to the person who needs it most, on stage." Konta stares.' } }],
      },
      drift: [{ when: { all: [{ rounds: 3 }, { stance: { 'n:konta': 'closed' } }] }, once: true, effect: { stance: { 'n:konta': 'listening' } }, says: { en: 'Up the approach, his sister calls his name. Konta\'s grip loosens.' } }],
    },
    conclusions: [
      { id: 'ran', when: { left: 'n:konta' }, result: 'end', text: { en: 'Konta hides behind the torii. He will come back out when he is ready; you can try again.' } },
      { id: 'given', when: { flag: 'given' }, result: 'win', text: { en: 'Konta walks up the approach and holds the umbrella out to his sister, with both hands.' } },
    ],
  };

  // ---- t10: the cup passed round (the capstone; the real 三々九度 is three cups, each drunk in three sips: here one cup goes
  // from the go-between to the groom, to the bride, and home again) --------------------------------------------------------
  function hear(item, fJp, jp, en, ok, w1, why1, w2, why2) {
    const opts = (two) => [{ en: ok, ok: true }, { en: w1, ok: false, why: { en: why1 } }].concat(two ? [{ en: w2, ok: false, why: { en: why2 } }] : []);
    return { F: ch({ item, ctx: { jp: fJp, en: '' }, prompt: { en }, options: opts(false) }), E: ch({ item, ctx: { jp, en: '' }, prompt: { en }, options: opts(false) }), I: ch({ item, ctx: { jp, en: '' }, prompt: { en }, options: opts(true) }), A: ch({ item, ctx: { jp, en: '' }, prompt: { en }, options: opts(true) }) };
  }
  const A = (id, jp, en, more) => Object.assign({ id, label: { jp, en } }, more);
  const vals = (x) => { const out = {}; for (const k in x) out[k] = { jp: x[k][0], en: x[k][1] }; return out; };
  const CUP = vals({ toku: ['トク の {手|て}', 'with Toku'], gin: ['ギン の {手|て}', 'with Gin'], kozue: ['コズエ の {手|て}', 'with Kozue'], done: ['{三|みっ}つ とも {済|す}んだ', 'all three done'] });
  C.encounters['hall.w2.cups'] = {
    id: 'hall.w2.cups', kind: 'procedure', name: say('{盃|さかずき} の {受|う}け{渡|わた}し', 'The cup passed round'),
    rules: { wait: true },
    procedure: {
      id: 'hall_w2_cups', version: 1, restart: 'stable',
      machine: { cup: 'toku' },
      show: [{ key: 'cup', label: say('{盃|さかずき}', 'The cup'), values: CUP }],
      done: { en: 'The cup has gone round; the rain stops, and the sun is all that is left.' },
      steps: [
        { id: 'c1', stable: true, text: say('トク ： 「 {盃|さかずき} を 、 わたし から {花婿|はなむこ} に {渡|わた}して ください 。 」', 'Toku: "Pass the cup from me to the groom."'),
          task: hear('g:prt_kara_made', 'トク ： 「 さかずき を 、 わたし から はなむこ に わたして ください 。 」', 'トク ： 「 {盃|さかずき} を 、 わたし から {花婿|はなむこ} に {渡|わた}して ください 。 」', 'Who does the cup go to first?',
            'From Toku to the groom, Gin.', 'From the groom to Toku.', 'わたし から: from Toku; はなむこ に: to the groom.', 'From Toku to the bride.', 'She said はなむこ, the groom.'),
          actions: [
            A('to_gin', '{盃|さかずき} を ギン に {渡|わた}す', 'Pass the cup to Gin', { ok: true, set: { cup: 'gin' }, means: { en: 'You take the cup from Toku and pass it to Gin.' }, result: { en: 'Gin drinks in three small sips, as the custom asks.' } }),
            A('to_kozue', '{盃|さかずき} を コズエ に {渡|わた}す', 'Pass the cup to Kozue', { means: { en: 'You pass the cup to Kozue.' }, wrong: { en: 'Toku shakes her head, smiling. "The groom first, child. From me, to him."' } }),
          ] },
        { id: 'c2', stable: true, text: say('トク ： 「 {次|つぎ} は 、 {花婿|はなむこ} から {花嫁|はなよめ} へ 。 」', 'Toku: "Next, from the groom to the bride."'),
          task: hear('g:prt_he', 'トク ： 「 つぎ は 、 はなむこ から はなよめ へ 。 」', 'トク ： 「 {次|つぎ} は 、 {花婿|はなむこ} から {花嫁|はなよめ} へ 。 」', 'Where does the cup go next?',
            'From Gin to Kozue.', 'From Kozue to Gin.', 'から marks where it comes from: the groom.', 'Back to Toku.', 'へ marks where it goes: the bride.'),
          actions: [
            A('to_kozue', '{盃|さかずき} を コズエ に {渡|わた}す', 'Pass the cup to Kozue', { ok: true, set: { cup: 'kozue' }, means: { en: 'You take the cup from Gin and give it to Kozue.' }, result: { en: 'Kozue drinks in three sips. The rain is thinning.' } }),
            A('to_toku', '{盃|さかずき} を トク に {返|かえ}す', 'Give the cup back to Toku', { means: { en: 'You hand the cup back to Toku.' }, wrong: { en: '"Not yet," Toku says. "From the groom to the bride. Then it comes home to me."' } }),
          ] },
        { id: 'c3', stable: true, text: say('コンタ が {小|ちい}さな {声|こえ} で {聞|き}く 。 「 {僕|ぼく} も 、 {姉|ねえ}ちゃん に {何|なに} か {渡|わた}して いい ？ 」', 'Konta asks, quietly: "Can I give my sister something too?"'),
          task: hear('g:v_temo_ii', 'コンタ ： 「 ぼく も 、 ねえちゃん に なにか わたして いい ？ 」', 'コンタ ： 「 {僕|ぼく} も 、 {姉|ねえ}ちゃん に {何|なに} か {渡|わた}して いい ？ 」', 'What is Konta asking?',
            'Whether he may give his sister something too.', 'Whether his sister will give him something.', 'ねえちゃん に わたす: he gives to her.', 'Whether he may drink from the cup.', 'He asks about giving his sister something.'),
          actions: [
            A('yes', 'うん 、 {渡|わた}して いい よ 。', '"Yes, go ahead."', { ok: true, means: { en: 'You tell Konta he may.' }, result: { en: 'Konta gives his sister the umbrella, open, held high over her head. Toku pretends not to see her wipe her eyes.' } }),
            A('no', '{今|いま} は だめ 。', '"Not now."', { means: { en: 'You tell him not now.' }, wrong: { en: 'Toku touches your arm. "Let him," she says softly. "This is the moment for it."' } }),
          ] },
        { id: 'c4', stable: true, text: say('トク ： 「 {最後|さいご} に 、 {盃|さかずき} を {花嫁|はなよめ} から わたし に {返|かえ}して ください 。 」', 'Toku: "Last, return the cup from the bride to me."'),
          task: hear('g:prt_kara_made', 'トク ： 「 さいご に 、 さかずき を はなよめ から わたし に かえして ください 。 」', 'トク ： 「 {最後|さいご} に 、 {盃|さかずき} を {花嫁|はなよめ} から わたし に {返|かえ}して ください 。 」', 'Where does the cup go last?',
            'From Kozue back to Toku.', 'From Toku to Kozue.', 'はなよめ から: from the bride; わたし に: to Toku.', 'To Konta.', 'She asked for it back.'),
          actions: [
            A('to_toku', '{盃|さかずき} を トク に {返|かえ}す', 'Return the cup to Toku', { ok: true, set: { cup: 'done' }, means: { en: 'You take the cup from Kozue and return it to Toku.' }, result: { en: 'Toku sets the cup down. "There. It is done." The sun-shower stops.' } }),
            A('to_gin', '{盃|さかずき} を ギン に {渡|わた}す', 'Pass it to Gin again', { means: { en: 'You give the cup to Gin again.' }, wrong: { en: 'Gin hands it back to you with a small bow. "To Toku, I think."' } }),
          ] },
      ],
    },
    conclusions: [{ id: 'done', when: { proc: 'done' }, result: 'win', text: { en: 'The cup has gone round.' } }],
  };
})(RB.content);
