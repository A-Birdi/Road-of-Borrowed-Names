/* The Hall of a Hundred Tales, wing 7, The House That Remembers: the language tasks and encounters (expansion P15; plan
 * 04_DUNGEONS.md D9; scenes in 31_w7_scenes.js). The theme: what was left unsaid (leaving out what is understood;
 * こ・そ・あ; の for "the one"; at Advanced 例の, 前者 and 後者). Every task has its four levels and an Advanced
 * stretch.
 *   hall.w7.story      the tale's four written passages, back in order (A38)
 *   hall.w7.story_q    what the house had laid out, and who it gave to (optional)
 *   hall.w7.counter0/1 the sayings on the garden stones: the one that breaks the rule (A34)
 *   hall.w7.ask        asking your companion which keepsake the letter means (A12)
 *   hall.w7.riddle     the riddle stone (a reprieve)
 *   encounters: hall.w7.lantern (the lantern in the dark room: paper; it floats), hall.w7.greed (Magoroku and Owan: a
 *   mediation), hall.w7.leave (leaving the house: the capstone procedure). */
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
  const P1 = '{昔|むかし} 、 {遠野|とおの} の {山奥|やまおく} で 、 {一人|ひとり} の {娘|むすめ} が {道|みち} に {迷|まよ}った',
    P2 = '{黒|くろ}い {門|もん} の {大|おお}きな {家|いえ} が あった が 、 {誰|だれ} も いなかった',
    P3 = '{座敷|ざしき} に は {赤|あか}い {膳|ぜん} と {黒|くろ}い {椀|わん} が {並|なら}び 、 {鉄瓶|てつびん} の {湯|ゆ} が {沸|わ}いて いた',
    P4 = '{娘|むすめ} は {何|なに} も {取|と}らず に {帰|かえ}った 。 すると 、 {赤|あか}い {椀|わん} が {一|ひと}つ 、 {川|かわ} を {流|なが}れて きた';
  C.hallW7Tale = { P1, P2, P3, P4 };
  const FT = ['むかし 、 やま の おく で 、 むすめ が みち に まよった', 'くろい もん の おおきな いえ が あった 。 でも 、 だれ も いなかった',
    'へや に は あかい おぜん と くろい おわん が あって 、 おゆ が わいて いた', 'むすめ は なにも とらない で かえった 。 すると 、 あかい おわん が かわ を ながれて きた'];
  C.hallW7TaleF = FT;
  C.challenges['hall.w7.story'] = { title: T('{覚|おぼ}えて いる {家|いえ}', 'The House That Remembers'), tiers: {
    F: [OR({ item: 'v:家', prompt: { en: 'Arrange the four written passages to retell the scroll\'s story.' }, tiles: [FT[2], FT[0], FT[3], FT[1]], answer: FT,
      orderHint: { en: 'Lost in the mountains; a big house with nobody in it; the room laid out and the water on the boil; home with nothing, and a bowl down the river.' } })],
    E: [OR({ item: 'v:椀', prompt: { en: 'Arrange the four passages in the tale\'s order.' }, tiles: [P3, P1, P4, P2], answer: [P1, P2, P3, P4],
      orderHint: { en: 'First the girl lost, then the empty house, then what was laid out inside, then what came after her.' } })],
    I: [OR({ item: 'g:omission', prompt: { en: 'Order the passages so that each follows from the one before.' }, tiles: [P4, P2, P1, P3], answer: [P1, P2, P3, P4],
      orderHint: { en: 'The tale never says who laid out the bowls or who boiled the water: it leaves that out, and so does the house.' } })],
    A: [OR({ item: 'g:omission', prompt: { en: 'Order the passages; the turn is the one with すると in it.' }, tiles: [P2, P4, P3, P1], answer: [P1, P2, P3, P4],
      orderHint: { en: 'Everything is laid out and nobody is there; すると brings the turn: what she did not take came after her.' } })],
  },
  stretchA: [ch({ item: 'g:omission', ctx: { jp: P4 + ' 。', en: '' }, prompt: { en: 'The tale never says who sent the bowl down the river. Why might it leave that out?' },
    options: [e('Because the listener supplies it: the house, the only one who could have; saying so would make the house a person, and the tale keeps it a mystery.', 1),
      e('Because the bowl fell in by accident.', 0, 'The tale ties the bowl to her taking nothing: すると.'),
      e('Because the girl sent it to herself.', 0, 'She had taken nothing with her.')] })] };
  C.challenges['hall.w7.story_q'] = { title: T('{話|はなし} の {後|あと} で', 'After the tale'), optional: true, tiers: {
    F: [ch({ item: 'v:家', ctx: { jp: FT[1] + ' 。', en: '' }, prompt: { en: 'Who was in the big house?' },
      options: [e('Nobody.', 1), e('An old woman.', 0, 'だれ も いなかった: nobody was there.'), e('A family having dinner.', 0, 'Nobody was there.')] })],
    E: [ch({ item: 'v:椀', ctx: { jp: P3 + ' 。', en: '' }, prompt: { en: 'What was laid out in the parlour?' },
      options: [e('Red trays and black bowls, with water boiling in an iron kettle.', 1), e('Gold coins.', 0, '膳 and 椀: trays and bowls.'), e('Nothing at all.', 0, 'The room was laid out, as if for guests.')] })],
    I: [ch({ item: 'g:omission', ctx: { jp: P4 + ' 。', en: '' }, prompt: { en: 'What happened after she went home?' },
      options: [e('A red bowl came floating down the river to her.', 1), e('She went back for a bowl.', 0, '何も取らずに: she took nothing.'), e('The house followed her.', 0, 'A bowl came, by the river.')] })],
    A: [ch({ item: 'g:omission', ctx: { jp: P2 + ' 。 ' + P4 + ' 。', en: '' }, prompt: { en: 'What is the tale suggesting?' },
      options: [e('That the house gave to the one who took nothing: what is not grasped comes of itself.', 1), e('That the house was haunted and dangerous.', 0, 'Nothing harms her; something is given.'), e('That she stole a bowl.', 0, '何も取らずに: she took nothing.')] })],
  } };

  // ---- the sayings on the garden stones: the one that breaks the rule (A34) ----------------------------------------------
  // F: こ for what is by the speaker, そ for what is by the listener, あ for what is far from both. E: の for "the one"
  // (な-adjectives take な before it; い-adjectives join it directly). I: あ for what both know; そ for what only the
  // speaker knows. A: 例の needs something both know; 前者 picks the first of two.
  C.hallW7Cards = {};
  function counter(F, E, I, A, pat) {
    C.hallW7Cards[pat] = { F, E, I, A };
    const mk = (item, list, prompt) => ch({ item, ctx: { jp: list.map((x, i) => (i + 1) + ' 、 ' + x[0]).join(' ／ '), en: '' }, prompt: { en: prompt }, options: list.map((x, i) => o(String(i + 1) + ' 、 ' + x[0], x[1], x[2])) });
    return {
      F: [mk('g:kosoado', F, 'Three sayings use こ, そ and あ for where the thing is. Which one breaks the rule?')],
      E: [mk('g:no_pronoun', E, 'Three sayings use の for "the one" correctly. Which one breaks the rule?')],
      I: [mk('g:kosoado', I, 'Three sayings use そ and あ for what the listener knows, or doesn\'t. Which one breaks the rule?')],
      A: [mk('g:rei_no', A, 'Three sayings use 例の, 前者 and 後者 correctly. Which is the counterexample?')],
    };
  }
  const C0 = counter(
    [['（ じぶん の て の ほん を みせて ） これ は わたし の ほん です', 0, 'これ: the thing by the speaker. Correct.'], ['（ あいて の もって いる もの を さして ） それ は なん です か', 0, 'それ: the thing by the listener. Correct.'], ['（ じぶん の て の かさ を みせて ） あれ は わたし の かさ です', 1, 'The umbrella is in the speaker\'s own hand: これ, not あれ.'], ['（ とおく を さして ） あそこ に いえ が あります', 0, 'あそこ: far from both. Correct.']],
    [['{赤|あか}い の を ください', 0, 'の for "the one": the red one. Correct.'], ['{昨日|きのう} {買|か}った の は 、 これ です', 0, 'Correct.'], ['{静|しず}か の が いい', 1, 'A な-adjective needs な before の: {静|しず}か な の が いい.'], ['この {傘|かさ} は 、 {私|わたし} の です', 0, 'の after a noun: mine. Correct.']],
    [['{昨日|きのう} の {話|はなし} 、 あれ 、 どう なった ？', 0, 'Something both know: あれ. Correct.'], ['{駅|えき} で {友達|ともだち} に {会|あ}った 。 その {人|ひと} は {医者|いしゃ} だ', 0, 'Someone the listener has never met: その. Correct.'], ['{町|まち} で {古|ふる}い {本屋|ほんや} を {見|み}つけた 。 あの {店|みせ} は {安|やす}い よ', 1, 'The listener has never heard of the shop: その {店|みせ}. あの points to something both know.'], ['（ {手紙|てがみ} で ） こちら は {雪|ゆき} です 。 そちら は どう です か', 0, 'こちら where the writer is, そちら where the reader is: correct.']],
    [['{例|れい} の {件|けん} 、 {考|かんが}えて くれた ？', 0, 'Both know which matter: correct.'], ['{櫛|くし} と {笛|ふえ} が ある 。 {前者|ぜんしゃ} は {祖母|そぼ} の {物|もの} だ', 0, 'The former: the comb. Correct.'], ['{初|はじ}めて {会|あ}った {人|ひと} に 、 「 {例|れい} の {物|もの} 、 {持|も}って きました か 」 と {聞|き}いた', 1, 'The counterexample: 例の needs something both already know, and a stranger shares nothing with you yet. Name it instead.'], ['{兄|あに} と {姉|あね} が いる 。 {後者|こうしゃ} は {医者|いしゃ} だ', 0, 'The latter: the elder sister. Correct.']], 0);
  const C1 = counter(
    [['（ みせ の ひと の て の パン を さして ） それ を ください', 0, 'The bread is by the listener: それ. Correct.'], ['（ じぶん の へや で ） ここ は わたし の へや です', 0, 'Correct.'], ['（ とおく の くつ を さして ） これ は だれ の くつ です か', 1, 'The shoes are far from you both: あれ, not これ.'], ['（ とおく を みて ） あの やま は たかい です', 0, 'Correct.']],
    [['{大|おお}きい の と {小|ちい}さい の 、 どっち ？', 0, 'Correct.'], ['さっき の は 、 どこ ？', 0, 'さっき + の: the one from before. Correct.'], ['{好|す}き な の を {取|と}って', 0, 'Correct.'], ['{古|ふる}い な の を {捨|す}てた', 1, 'An い-adjective joins の directly: {古|ふる}い の を {捨|す}てた.']],
    [['A ： {鍵|かぎ} 、 どこ ？ B ： {机|つくえ} の {上|うえ} 。', 0, 'Everything understood is left out: correct.'], ['{去年|きょねん} {一緒|いっしょ} に {行|い}った {宿|やど} 、 あそこ 、 また {行|い}きたい ね', 0, 'A place both remember: あそこ. Correct.'], ['{昨日|きのう} 、 {田中|たなか} と いう {人|ひと} に {会|あ}った 。 あの {人|ひと} 、 {面白|おもしろ}い よ', 1, 'The listener has never met Tanaka: その {人|ひと}, not あの.'], ['（ {電話|でんわ} で ） そちら に は 、 {何時|なんじ} に {着|つ}きます か', 0, 'Correct.']],
    [['{例|れい} の {話|はなし} 、 もう {聞|き}いた ？', 0, 'Correct.'], ['{電車|でんしゃ} と バス が ある 。 {後者|こうしゃ} の {方|ほう} が {安|やす}い', 0, 'The latter: the bus. Correct.'], ['{犬|いぬ} と {猫|ねこ} を {飼|か}って いる 。 {前者|ぜんしゃ} は よく {吠|ほ}える', 0, 'The former: the dog. Correct.'], ['{本|ほん} が {一冊|いっさつ} ある 。 {前者|ぜんしゃ} は {古|ふる}い', 1, 'The counterexample: 前者 picks the first of two, and here there is only one book. その {本|ほん} は {古|ふる}い.']], 1);
  const cardStretch = [ch({ item: 'g:rei_no', ctx: { jp: '{例|れい} の {物|もの} を {持|も}って きて 。 ／ {櫛|くし} を {持|も}って きて 。', en: '' }, prompt: { en: 'What does 例の物 do that 櫛 doesn\'t?' },
    options: [e('It counts on the listener already knowing which thing, and keeps it unnamed: between the two of you, or from anyone else listening.', 1), e('Nothing: it is only more polite.', 0, 'It is not about politeness but about what both already know.'), e('It means any old thing.', 0, 'The opposite: one particular thing both know.')] })];
  C.challenges['hall.w7.counter0'] = { title: T('{庭|にわ} の {石|いし}', 'The garden stones'), tiers: C0, stretchA: cardStretch };
  C.challenges['hall.w7.counter1'] = { title: T('{庭|にわ} の {石|いし}', 'The garden stones'), tiers: C1, stretchA: cardStretch };

  // ---- asking which keepsake the letter means (A12) -----------------------------------------------------------------------
  C.challenges['hall.w7.ask'] = { title: T('{蔵|くら} の {手紙|てがみ}', 'The letter in the storehouse'), tiers: {
    F: [ch({ item: 'g:kosoado', prompt: { en: 'You want to know which thing the letter means. What do you ask?' },
      options: [o('てがみ は 、 どれ の こと です か 。', 1), o('てがみ は 、 だれ が かきました か 。', 0, 'That asks who wrote it.'), o('てがみ は 、 いつ きました か 。', 0, 'That asks when it came.')] })],
    E: [ch({ item: 'g:no_pronoun', prompt: { en: 'You want to know which of the things in the storehouse the letter means. What do you ask?' },
      options: [o('{手紙|てがみ} が {言|い}って いる の は 、 {蔵|くら} の どれ です か 。', 1), o('{手紙|てがみ} は 、 {蔵|くら} の どこ に あった ん です か 。', 0, 'That asks where the letter was found.'), o('{蔵|くら} に は 、 {手紙|てがみ} が {何枚|なんまい} あります か 。', 0, 'That asks how many letters there are.')] })],
    I: [ch({ item: 'g:omission', prompt: { en: 'You want to know what the letter means by the thing it never names. What do you ask?' },
      options: [o('{手紙|てがみ} で 、 {名前|なまえ} を {書|か}いて いない {物|もの} は 、 {何|なん} の こと です か 。', 1), o('{手紙|てがみ} に は 、 {誰|だれ} の {名前|なまえ} が {書|か}いて あります か 。', 0, 'That asks whose names are in it.'), o('{手紙|てがみ} を {書|か}いた {人|ひと} は 、 {何|なん} と いう {名前|なまえ} です か 。', 0, 'That asks the writer\'s name.')] })],
    A: [ch({ item: 'g:keigo_kenjo', prompt: { en: 'Ask, politely, what the letter refers to.' },
      options: [o('{恐|おそ}れ{入|い}ります が 、 この {手紙|てがみ} が {指|さ}して いる {物|もの} は 、 どちら か 、 お{教|おし}え いただけます か 。', 1), o('この {手紙|てがみ} を 、 {頂|いただ}いて も よろしい でしょう か 。', 0, 'That asks whether you may keep the letter.'), o('{手紙|てがみ} を お{書|か}き に なった の は 、 どなた でしょう か 。', 0, 'That asks who wrote it.')] })],
  },
  stretchA: [ch({ item: 'g:rei_no', ctx: { jp: '{櫛|くし} と {笛|ふえ} は {蔵|くら} に {納|おさ}めて ある 。 {前者|ぜんしゃ} を {仏壇|ぶつだん} に {供|そな}えて ほしい 。', en: '' }, prompt: { en: 'Which is to go before the altar, and how do you know?' },
    options: [e('The comb: 前者, "the former", is the first of the two just named.', 1), e('The flute: 前者 means "the one in front".', 0, '前者 is the one named first, not the one standing in front.'), e('Both.', 0, '前者 picks one of the two.')] })] };

  // ---- the riddle stone (a reprieve) -----------------------------------------------------------------------------------------
  C.challenges['hall.w7.riddle'] = { title: T('なぞなぞ の {石|いし}', 'The riddle stone'), tiers: {
    F: [ch({ item: 'g:kosoado', ctx: { jp: 'いつも いっしょ に いる けど 、 くらい ところ で は いなく なる 。 なあに ？', en: '' }, prompt: { en: 'What is it?' },
      options: [o('かげ', 1), o('ともだち', 0, 'A friend stays with you in the dark.'), o('かぜ', 0, 'The wind is not always with you.')] })],
    E: [ch({ item: 'g:omission', ctx: { jp: '{呼|よ}ぶ と 、 {同|おな}じ {言葉|ことば} で {答|こた}える 。 でも 、 {姿|すがた} は {見|み}えない 。 {山|やま} に いる もの 、 {何|なん} だ ？', en: '' }, prompt: { en: 'What is it?' },
      options: [o('{山彦|やまびこ}', 1), o('{狐|きつね}', 0, 'A fox has its own voice, and can be seen.'), o('{鳥|とり}', 0, 'A bird sings its own song.')] })],
    I: [ch({ item: 'g:omission', ctx: { jp: '{取|と}ろう と する と {逃|に}げて いき 、 {取|と}らず に {帰|かえ}る と {川|かわ} を {流|なが}れて くる 。 {何|なん} だ ？', en: '' }, prompt: { en: 'What is it?' },
      options: [o('{赤|あか}い {椀|わん}', 1), o('{魚|さかな}', 0, 'A fish does not come to those who leave it alone.'), o('{木|こ}の{葉|は}', 0, 'Leaves float down whether you reach for them or not.')] })],
    A: [ch({ item: 'g:omission', ctx: { jp: '{見|み}えて いる のに 、 {誰|だれ} も {住|す}んで いない 。 {探|さが}せば {見|み}つからず 、 {探|さが}さねば {現|あらわ}れる 。 {何|なに} か 。', en: '' }, prompt: { en: 'What is it?' },
      options: [o('マヨイガ', 1), o('{雲|くも}', 0, 'Clouds are there whether you look or not.'), o('{虹|にじ}', 0, 'A rainbow does not hide from those who seek it.')] })],
  },
  stretchA: [ch({ item: 'g:omission', ctx: { jp: '{探|さが}せば {見|み}つからず 、 {探|さが}さねば {現|あらわ}れる 。', en: '' }, prompt: { en: 'The riddle never says who is searching. Who is it?' },
    options: [e('Anyone at all: leaving out the subject makes it a rule for whoever searches, as in a proverb.', 1), e('Only the girl in the tale.', 0, 'With no subject named, it holds for anyone.'), e('The house.', 0, 'The house is what is searched for.')] })] };

  // ---- t5: the lantern in the dark room (paper; it floats) ---------------------------------------------------------------------
  C.encounters = C.encounters || {};
  const LAMP = { enemy: 'kr.chochin', name: say('{古|ふる}い {提灯|ちょうちん}', 'Old lantern'), conditions: ['paper', 'airborne'], knots: 2, music: 'battle_atlas' };
  C.encounters['hall.w7.lantern'] = {
    id: 'hall.w7.lantern', kind: 'battle', name: say('{暗|くら}い {部屋|へや} の {提灯|ちょうちん}', 'The lantern in the dark room'),
    lead: Object.assign({}, LAMP, { knots: 3 }),
    group: { normal: [LAMP], hard: [LAMP, LAMP] },
    rules: { wait: true, conditions: true },
  };

  // ---- t9: Magoroku and Owan (a mediation) ------------------------------------------------------------------------------------
  function task(item, en, ok, w1, why1, w2, why2) {
    const low = ch({ item, prompt: { en }, options: [{ jp: ok, ok: true }, { jp: w1, ok: false, why: { en: why1 } }] });
    const high = ch({ item, prompt: { en: en + ' (Read them closely: two are near.)' }, options: [{ jp: ok, ok: true }, { jp: w1, ok: false, why: { en: why1 } }, { jp: w2, ok: false, why: { en: why2 } }] });
    return { F: low, E: low, I: high, A: high };
  }
  C.encounters['hall.w7.greed'] = {
    id: 'hall.w7.greed', kind: 'social', name: say('マゴロク と オワン', 'Magoroku and Owan'),
    rules: { wait: true },
    autoRoute: ['s:calm', 's:forwhom', 'wait', 's:askhouse'],
    social: {
      parties: [
        { aid: 'n:magoroku', name: say('マゴロク', 'Magoroku'), stance: 'heated', wants: { en: 'To carry off something valuable from the house, and not to say why.' } },
        { aid: 'n:owan', name: say('オワン', 'Owan'), stance: 'heated', wants: { en: 'That nothing be carried off from the house.' } },
      ],
      claims: {
        take: { by: 'n:magoroku', jp: '{要|い}る ん だ 。 {持|も}って {帰|かえ}る 。 {止|と}めて も {無駄|むだ} だ 。', en: 'Magoroku: "I need it. I\'m taking it home. Don\'t bother trying to stop me."' },
        rule: { by: 'n:owan', jp: 'この {家|いえ} から {物|もの} を {持|も}ち{出|だ}した {人|ひと} は 、 {二度|にど} と {来|こ}られない よ 。', en: 'Owan: "Anyone who carries things out of this house can never come back."' },
        need: { by: 'n:magoroku', jp: '…… おふくろ が {寝込|ねこ}んで いる 。 {米|こめ} も {薬|くすり} も 、 もう {買|か}えない ん だ 。', en: 'Magoroku: "…My mother\'s laid up in bed. We can\'t buy rice or medicine any more."', hidden: true },
      },
      understanding: 3,
      gesture: { name: say('{膳|ぜん} の {前|まえ} に {座|すわ}る', 'Sit down at a laid tray'), desc: 'Sit down at one of the trays the house has laid, as a guest would.', effect: { stance: { 'n:owan': 'listening' } }, once: true, says: { en: 'You kneel at a tray. Somewhere in the house the kettle sings, and Owan\'s shoulders come down.' } },
      unravelTip: { en: 'Nothing is knotted. What is missing is what Magoroku leaves out: what he needs, and for whom.' },
      actions: [
        { id: 'calm', kind: 'restate', label: say('マゴロク さん は {何|なに} か が {要|い}る 。 オワン は 、 この {家|いえ} を {守|まも}りたい 。 そう です ね 。', 'Say back what each of them wants'),
          task: task('g:omission', 'Which says back what each of them wants?', 'マゴロク さん は {何|なに} か が {要|い}る 。 オワン は 、 この {家|いえ} を {守|まも}りたい 。 そう です ね 。', 'マゴロク さん は 、 この {家|いえ} に {住|す}みたい ん です ね 。', 'He wants something from it, not to live in it.', 'オワン は 、 {物|もの} を {全部|ぜんぶ} あげたい ん です ね 。', 'Owan wants nothing taken.'),
          cases: [{ when: { stance: { 'n:magoroku': 'heated' } }, effect: { stance: { 'n:magoroku': 'listening' } }, says: { en: 'Magoroku lets go of the gold sake cup he had picked up. "…Something like that."' } },
            { when: { stance: { 'n:owan': 'heated' } }, effect: { stance: { 'n:owan': 'listening' } }, says: { en: 'Owan stops pulling the sliding doors shut. "…Yes."' } }],
          says: { en: 'They are already listening.' } },
        { id: 'forwhom', kind: 'ask', label: say('{誰|だれ} の ため に 、 {要|い}る ん です か 。', 'Ask who it is for'), once: true, when: { stance: { 'n:magoroku': 'listening' } },
          task: task('g:omission', 'Which asks who he needs it for?', '{誰|だれ} の ため に 、 {要|い}る ん です か 。', '{何|なに} が {食|た}べたい ん です か 。', 'That asks what he wants to eat.', 'いつ {来|き}た ん です か 。', 'That asks when he came.'),
          effect: { reveal: 'need', understanding: 1 }, says: { en: 'Magoroku is quiet for a long time. "…My mother. She\'s been in bed since the summer. We\'ve no rice left, and no money for medicine."' } },
        { id: 'askhouse', kind: 'propose', label: say('{持|も}って {帰|かえ}る の で は なく 、 お{母|かあ}さん の ため に 、 この {家|いえ} に {頼|たの}んで みません か 。', 'Propose asking the house, for his mother, instead of taking'), when: { claims: ['need'] },
          task: task('g:te_giving', 'Which proposes asking the house, for his mother, instead of taking?', '{持|も}って {帰|かえ}る の で は なく 、 お{母|かあ}さん の ため に 、 この {家|いえ} に {頼|たの}んで みません か 。', '{全部|ぜんぶ} 、 {持|も}って {帰|かえ}りましょう 。', 'That takes everything.', 'お{母|かあ}さん の こと は 、 {忘|わす}れましょう 。', 'That asks him to forget her.'),
          effect: { flag: 'asked' }, says: { en: 'Magoroku puts the cup back on its tray, kneels, and bows to the empty room. "…For my mother. Please." Owan watches him, and nods.' } },
        { id: 'blunt', kind: 'propose', label: say('{泥棒|どろぼう} は 、 {帰|かえ}れ 。', 'Call him a thief and tell him to go'), lasting: true, means: { en: 'You will call him a thief.' },
          task: task('v:泥棒', 'Which calls him a thief and tells him to go?', '{泥棒|どろぼう} は 、 {帰|かえ}れ 。', 'まず 、 {座|すわ}って ください 。', 'That invites him to sit.', 'お{茶|ちゃ} を {飲|の}みません か 。', 'That offers tea.'),
          effect: { stance: { 'n:magoroku': 'leaving' } }, says: { en: 'Magoroku goes red, then white. He throws the cup down on its tray and stamps out into the snow.' } },
      ],
      responses: {
        water: { effect: { stance: { 'n:magoroku': 'listening' } }, says: { en: 'You pour him a cup from the kettle. He drinks it like a man who has walked a long way.' } },
        unravel: { says: { en: 'Nothing here is knotted. Listen for what Magoroku leaves out.' } },
      },
      wait: { when: { stance: { 'n:magoroku': 'listening' } }, effect: { reveal: 'need' }, says: { en: 'Magoroku says, to nobody, "She used to make rice like this. Before."' } },
      drift: [{ when: { all: [{ rounds: 3 }, { stance: { 'n:magoroku': 'heated' } }] }, once: true, effect: { stance: { 'n:magoroku': 'listening', 'n:owan': 'listening' } }, says: { en: 'From the kitchen comes the smell of rice on the boil. Magoroku\'s stomach growls, loudly. Owan almost laughs, and he sits down hard.' } }],
      companion: {
        nao: [{ id: 'nao_carry', name: say('{頼|たの}まれた {物|もの}', 'What is asked for'), desc: 'Nao, who carries only what people ask to be carried, says so.', once: true, effect: { understanding: 1, stance: { 'n:magoroku': 'listening' } }, says: { en: 'Nao: "I carry what people ask me to carry. Never what I take. The difference is the whole job." Magoroku looks at the cup in his hand.' } }],
        mio: [{ id: 'mio_medicine', name: say('{薬|くすり} の {話|はなし}', 'Ask about the medicine'), desc: 'Mio asks, as a healer would, what the trouble is.', once: true, effect: { understanding: 1 }, says: { en: 'Mio: "You said you need something. Is somebody ill? I can tell you what to give them, at least." Magoroku\'s face changes.' } }],
        ren: [{ id: 'ren_memory', name: say('{家|いえ} の {記憶|きおく}', 'What a house remembers'), desc: 'Ren speaks of houses that remember their last kindness.', once: true, effect: { understanding: 1, stance: { 'n:owan': 'listening' } }, says: { en: 'Ren: "The lamp-keepers say an empty house remembers the last kindness done in it, and keeps it like a lamp." Owan\'s hands go still.' } }],
        suzu: [{ id: 'suzu_ending', name: say('{別|べつ} の {結末|けつまつ}', 'Another ending'), desc: 'Suzu offers the story a better ending.', once: true, effect: { understanding: 1 }, says: { en: 'Suzu: "In every telling, the greedy neighbour finds nothing. Wouldn\'t it be something if, just once, he asked instead?"' } }],
      },
    },
    conclusions: [
      { id: 'left', when: { left: 'n:magoroku' }, result: 'end', text: { en: 'Magoroku has gone out into the snow. He has nowhere else to look; he will be back. You can try again.' } },
      { id: 'asked', when: { flag: 'asked' }, result: 'win', text: { en: 'Magoroku has asked, instead of taking.' } },
    ],
  };

  // ---- t10: leaving the house (the capstone) -----------------------------------------------------------------------------------
  function hear(item, fJp, jp, en, ok, w1, why1, w2, why2) {
    const opts = (two) => [{ en: ok, ok: true }, { en: w1, ok: false, why: { en: why1 } }].concat(two ? [{ en: w2, ok: false, why: { en: why2 } }] : []);
    return { F: ch({ item, ctx: { jp: fJp, en: '' }, prompt: { en }, options: opts(false) }), E: ch({ item, ctx: { jp, en: '' }, prompt: { en }, options: opts(false) }), I: ch({ item, ctx: { jp, en: '' }, prompt: { en }, options: opts(true) }), A: ch({ item, ctx: { jp, en: '' }, prompt: { en }, options: opts(true) }) };
  }
  const A = (id, jp, en, more) => Object.assign({ id, label: { jp, en } }, more);
  const vals = (x) => { const out = {}; for (const k in x) out[k] = { jp: x[k][0], en: x[k][1] }; return out; };
  const WHERE = vals({ parlour: ['{座敷|ざしき}', 'the parlour'], hall: ['{玄関|げんかん}', 'the entrance hall'], gate: ['{門|もん}', 'the gate'], mist: ['{霧|きり} の {中|なか}', 'in the mist'], home: ['{川辺|かわべ}', 'the riverbank'] });
  C.encounters['hall.w7.leave'] = {
    id: 'hall.w7.leave', kind: 'procedure', name: say('{家|いえ} を {出|で}る', 'Leaving the house'),
    rules: { wait: true },
    procedure: {
      id: 'hall_w7_leave', version: 1, restart: 'stable',
      machine: { where: 'parlour' },
      show: [{ key: 'where', label: say('{今|いま}', 'Now'), values: WHERE }],
      done: { en: 'You have left the house, and something has come after you down the stream.' },
      steps: [
        { id: 'g1', stable: true, text: say('オワン ： 「 {好|す}き な の を 、 {持|も}って いって いい よ 。 どれ でも 。 」', 'Owan: "You can take whichever one you like. Any of them."'),
          task: hear('g:no_pronoun', 'オワン ： 「 すき な の を 、 もって いって いい よ 。 」', 'オワン ： 「 {好|す}き な の を 、 {持|も}って いって いい よ 。 どれ でも 。 」', 'What does Owan offer?',
            'To take any one thing you like.', 'To stay the night.', 'の is "the one": any thing you like.', 'To take everything.', 'One, whichever you like.'),
          actions: [
            A('decline', '{何|なに} も {取|と}らず に 、 お{礼|れい} を {言|い}う', 'Take nothing, and say thank you', { ok: true, set: { where: 'hall' }, means: { en: 'You thank the house, and take nothing.' }, result: { en: 'Owan looks at you for a long moment, then smiles, and walks with you to the entrance hall.' } }),
            A('take', '{金|きん} の {盃|さかずき} を {取|と}る', 'Take the gold sake cup', { means: { en: 'You reach for the gold sake cup.' }, wrong: { en: 'The house goes very quiet. You put the cup back. Owan says nothing at all.' } }),
          ] },
        { id: 'g2', stable: true, text: say('{声|こえ} ： 「 {行|い}ってらっしゃい 。 {帰|かえ}って きたら 、 『 お{帰|かえ}り 』 って {言|い}う から ね 。 」', 'A voice: "Off you go. When you come back, I\'ll say \'welcome home\'."'),
          task: hear('g:omission', 'こえ ： 「 いってらっしゃい 。 かえって きたら 、 『 おかえり 』 って いう から ね 。 」', '{声|こえ} ： 「 {行|い}ってらっしゃい 。 {帰|かえ}って きたら 、 『 お{帰|かえ}り 』 って {言|い}う から ね 。 」', 'Who will say "welcome home", and to whom?',
            'The voice of the house, to you, when you come back.', 'You, to the house.', 'The one who says it is the one speaking; you are the one coming back.', 'Owan, to Magoroku.', 'Nobody named: the speaker, to you.'),
          actions: [
            A('reply', '「 {行|い}って きます 」 と {答|こた}える', 'Answer, "I\'m off, then"', { ok: true, set: { where: 'gate' }, means: { en: 'You answer the empty house: "I\'m off, then."' }, result: { en: 'Somewhere far inside, someone laughs softly, the way people do when they have been waiting a long time to hear that.' } }),
            A('silent', '{黙|だま}って {出|で}る', 'Leave without a word', { means: { en: 'You go to leave without a word.' }, wrong: { en: 'You stop at the step. Somewhere in the house, someone is still waiting for an answer.' } }),
          ] },
        { id: 'g3', stable: true, text: say('{子供|こども} の {声|こえ} ： 「 また {来|き}て ね 。 {今度|こんど} は 、 {探|さが}さない で 。 」', 'A child\'s voice: "Come again. Next time, don\'t look."'),
          task: hear('g:omission', 'こども の こえ ： 「 また きて ね 。 こんど は 、 さがさない で 。 」', '{子供|こども} の {声|こえ} ： 「 また {来|き}て ね 。 {今度|こんど} は 、 {探|さが}さない で 。 」', 'Don\'t look for what?',
            'For the house: it is found only by those who are not looking.', 'For the child.', 'The child is not hiding; the house is what is found.', 'For the gold cup.', 'The cup stays; the house is what comes and goes.'),
          actions: [
            A('promise', '{探|さが}さず に 、 また {来|く}る と {約束|やくそく} する', 'Promise to come again, without looking for it', { ok: true, set: { where: 'mist' }, means: { en: 'You promise to come again, and not to look.' }, result: { en: 'The black gate closes behind you without a sound. When you turn, there is only mist, and snow on the cedars.' } }),
            A('map', '{地図|ちず} に {道|みち} を {書|か}いて おく', 'Mark the way on a map to find it again', { means: { en: 'You take out a brush to mark the way.' }, wrong: { en: 'The ink will not take on the paper. Some places are not for finding.' } }),
          ] },
        { id: 'g4', stable: true, text: say('オワン の {声|こえ} ： 「 それ 、 あの {人|ひと} に 。 お{米|こめ} が {減|へ}らない から 。 」', 'Owan\'s voice: "That\'s for him. The rice in it never runs out."'),
          task: hear('g:kosoado', 'オワン の こえ ： 「 それ 、 あの ひと に 。 」', 'オワン の {声|こえ} ： 「 それ 、 あの {人|ひと} に 。 お{米|こめ} が {減|へ}らない から 。 」', 'Who is "あの人", the one the bowl is for?',
            'Magoroku, for his mother: the one you both know needs rice.', 'You.', 'あの人 is someone both of you know, not you yourself.', 'The girl in the tale.', 'The tale is long ago; あの人 is someone you both met today.'),
          actions: [
            A('give', '{椀|わん} を 、 マゴロク の {家|いえ} に {届|とど}ける', 'Take the bowl to Magoroku\'s house', { ok: true, set: { where: 'home' }, means: { en: 'A red bowl comes turning down the stream. You lift it out and carry it down to Magoroku\'s house.' }, result: { en: 'Magoroku\'s mother holds the red bowl in both hands. "It was full of rice," Magoroku says, "and it still is."' } }),
            A('keep', '{椀|わん} を {自分|じぶん} の {物|もの} に する', 'Keep the bowl yourself', { means: { en: 'You go to keep the bowl for yourself.' }, wrong: { en: 'The bowl slips from your hands back into the stream, and turns there, waiting, until you understand who it is for.' } }),
          ] },
      ],
    },
    conclusions: [{ id: 'done', when: { proc: 'done' }, result: 'win', text: { en: 'You have left the house as it hoped.' } }],
  };
})(RB.content);
