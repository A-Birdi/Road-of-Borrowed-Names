/* The Hall of a Hundred Tales, wing 5, The Two Wells: the language tasks and encounters (expansion P15; plan
 * 04_DUNGEONS.md D9; scenes in 25_w5_scenes.js). The theme: reasons and contrasts (～から and ～ので; けど and が;
 * ～のに; ～おかげで and ～せいで; ～ために; at Advanced ～からこそ, ～にもかかわらず, ～ものの). Every task has its four
 * levels and an Advanced stretch.
 *   hall.w5.story      the tale's four written passages, back in order (A38)
 *   hall.w5.story_q    what the frog at the bottom of the well knew (optional)
 *   hall.w5.counter0/1 the old sayings on reasons: the one that breaks the rule (A34)
 *   hall.w5.ask        asking your companion what the well-digger's record says (A12)
 *   hall.w5.riddle     the riddle stone (a reprieve)
 *   encounters: hall.w5.frogs (the frogs of the west well: wet), hall.w5.feud (Osugi and Mosuke, who each blame the
 *   other's well: a mediation), hall.w5.clean (the well-cleaning: the capstone procedure). */
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
  const P1 = '{昔|むかし} 、 {村|むら} の {東|ひがし} と {西|にし} に 、 {井戸|いど} が {一|ひと}つ ずつ あった', P2 = '{東|ひがし} の {水|みず} は {甘|あま}い のに 、 {西|にし} の {水|みず} は {苦|にが}かった',
    P3 = '{東|ひがし} の {家|いえ} は 「 {西|にし} の せい だ 」 と {言|い}い 、 {西|にし} の {家|いえ} は 「 {東|ひがし} の せい だ 」 と {言|い}った', P4 = '{井戸|いど} の {底|そこ} の {蛙|かえる} だけ が 、 {本当|ほんとう} の {理由|りゆう} を {知|し}って いた';
  C.hallW5Tale = { P1, P2, P3, P4 };
  const FT = ['むかし 、 むら に いど が ふたつ あった', 'ひがし の みず は あまい のに 、 にし の みず は にがかった', 'ふたつ の いえ は 、 「 そっち の せい だ 」 と けんか を した', 'いど の そこ の かえる だけ が 、 ほんとう の りゆう を しって いた'];
  C.hallW5TaleF = FT;
  C.challenges['hall.w5.story'] = { title: T('{二|ふた}つ の {井戸|いど}', 'The Two Wells'), tiers: {
    F: [OR({ item: 'v:井戸', prompt: { en: 'Arrange the four written passages to retell the scroll\'s story.' }, tiles: [FT[2], FT[0], FT[3], FT[1]], answer: FT,
      orderHint: { en: 'Two wells; one sweet and one bitter; the two houses quarrel; only the frog knows why.' } })],
    E: [OR({ item: 'v:井戸', prompt: { en: 'Arrange the four passages in the tale\'s order.' }, tiles: [P3, P1, P4, P2], answer: [P1, P2, P3, P4],
      orderHint: { en: 'First the two wells, then how they differed, then the blame, then who really knew.' } })],
    I: [OR({ item: 'g:noni', prompt: { en: 'Order the passages so that each follows from the one before.' }, tiles: [P4, P2, P1, P3], answer: [P1, P2, P3, P4],
      orderHint: { en: 'Two wells that should have been alike (のに: one was bitter all the same); each house blamed the other (せい); the reason lay where nobody asked.' } })],
    A: [OR({ item: 'g:okage_sei', prompt: { en: 'Order the passages; the turn is the one with だけ in it.' }, tiles: [P2, P4, P3, P1], answer: [P1, P2, P3, P4],
      orderHint: { en: 'The blame goes back and forth; だけ sets the frog apart: the one witness nobody thought of.' } })],
  },
  stretchA: [ch({ item: 'g:noni', ctx: { jp: P2 + ' 。 ／ {東|ひがし} の {水|みず} は {甘|あま}い けど 、 {西|にし} の {水|みず} は {苦|にが}かった 。', en: '' }, prompt: { en: 'The tale says のに. What would けど change?' },
    options: [e('けど only sets the two side by side; のに says the bitterness goes against what anyone would expect of two wells in one village, and carries a little complaint.', 1),
      e('Nothing: they are the same.', 0, 'Both contrast, but のに adds that it should not have been so.'),
      e('のに means the east water was bitter.', 0, 'The east water is still the sweet one.')] })] };
  C.challenges['hall.w5.story_q'] = { title: T('{話|はなし} の {後|あと} で', 'After the tale'), optional: true, tiers: {
    F: [ch({ item: 'v:甘い', ctx: { jp: FT[1] + ' 。', en: '' }, prompt: { en: 'Which well\'s water was sweet?' },
      options: [e('The east well\'s.', 1), e('The west well\'s.', 0, 'にし の みず は にがかった: the west water was bitter.'), e('Both.', 0, 'One was bitter.')] })],
    E: [ch({ item: 'v:せい', ctx: { jp: P3 + ' 。', en: '' }, prompt: { en: 'What did the two houses say?' },
      options: [e('Each said the bitter water was the other\'s fault.', 1), e('Both said it was the frog\'s fault.', 0, 'They blamed each other.'), e('Both said nobody was to blame.', 0, 'せい だ: it is (someone\'s) fault.')] })],
    I: [ch({ item: 'g:noni', ctx: { jp: P2 + ' 。', en: '' }, prompt: { en: 'What does のに add here?' },
      options: [e('That two wells in one village should have tasted alike; the bitterness is unexpected.', 1), e('That the east water was bitter too.', 0, 'のに contrasts the two.'), e('That the water was bitter on purpose.', 0, 'のに is surprise, not purpose.')] })],
    A: [ch({ item: 'g:okage_sei', ctx: { jp: P3 + ' 。 ' + P4 + ' 。', en: '' }, prompt: { en: 'What is the tale suggesting about blame?' },
      options: [e('That blame looks across the road; the reason was at the bottom of the well, where nobody thought to ask.', 1), e('That frogs make water bitter.', 0, 'The frog knows the reason; it is not the reason.'), e('That the west house was right.', 0, 'Neither house knew.')] })],
  } };

  // ---- the old sayings on reasons: the one that breaks the rule (A34) -------------------------------------------------------
  // F: a reason with から must lead where it naturally would. E: い-adjectives take から directly, な-adjectives and
  // nouns だから. I: せいで for a bad result, おかげで for a good one; のに for what goes against expectation. A: ものの
  // and にもかかわらず need a real contrast.
  C.hallW5Cards = {};
  function counter(F, E, I, A, pat) {
    C.hallW5Cards[pat] = { F, E, I, A };
    const mk = (item, list, prompt) => ch({ item, ctx: { jp: list.map((x, i) => (i + 1) + ' 、 ' + x[0]).join(' ／ '), en: '' }, prompt: { en: prompt }, options: list.map((x, i) => o(String(i + 1) + ' 、 ' + x[0], x[1], x[2])) });
    return {
      F: [mk('g:conj_kara', F, 'Three sayings give a reason that leads where it should. Which one breaks the rule?')],
      E: [mk('g:conj_kara', E, 'Three sayings join a reason correctly. Which one breaks the rule?')],
      I: [mk('g:okage_sei', I, 'Three sayings use のに, せいで and おかげで the way they work. Which one breaks the rule?')],
      A: [mk('g:adv_monono', A, 'Three sayings use からこそ, にもかかわらず and ものの correctly. Which is the counterexample?')],
    };
  }
  const C0 = counter(
    [['あめ が ふった から 、 かさ を さした', 0, 'A reason and its natural result: correct.'], ['さむい ので 、 まど を しめた', 0, 'Correct.'], ['おなか が いっぱい だ から 、 もっと たべた', 1, 'Being full is no reason to eat more: おなか が いっぱい なのに 、 もっと たべた.'], ['みず が にがい ので 、 のまなかった', 0, 'Correct.']],
    [['{雨|あめ} が {降|ふ}って いた から 、 {出|で}かけなかった', 0, 'Correct.'], ['{井戸|いど} は {深|ふか}い けど 、 {水|みず} は {少|すく}ない', 0, 'A contrast with けど: correct.'], ['{安|やす}い だ から 、 {買|か}った', 1, 'An い-adjective takes から directly: {安|やす}い から.'], ['{静|しず}か だ から 、 よく {眠|ねむ}れた', 0, 'A な-adjective takes だから: correct.']],
    [['{薬|くすり} を {飲|の}んだ のに 、 {治|なお}らない', 0, 'Against expectation: correct.'], ['{雨|あめ} の せい で 、 {祭|まつ}り が {中止|ちゅうし} に なった', 0, 'A bad result: せいで, correct.'], ['{手伝|てつだ}って くれた せい で 、 {早|はや}く {終|お}わった', 1, 'A good result takes おかげで: {手伝|てつだ}って くれた おかげ で.'], ['{東|ひがし} の {井戸|いど} の おかげ で 、 {村|むら} は {助|たす}かった', 0, 'Correct.']],
    [['{努力|どりょく} した からこそ 、 {成功|せいこう} した', 0, 'Correct.'], ['{雨|あめ} に も かかわらず 、 {大勢|おおぜい} {集|あつ}まった', 0, 'Rain, and yet many came: correct.'], ['{井戸|いど} を {掘|ほ}った ものの 、 {水|みず} は {出|で}なかった', 0, 'Dug, and yet no water: correct.'], ['{雨|あめ} が {降|ふ}った ものの 、 {地面|じめん} が {濡|ぬ}れた', 1, 'The counterexample: ものの needs a result against expectation; wet ground after rain is no contrast. {雨|あめ} が {降|ふ}った ので 、 {地面|じめん} が {濡|ぬ}れた.']], 0);
  const C1 = counter(
    [['ねむい から 、 はやく ねた', 0, 'Correct.'], ['くらい ので 、 ひ を つけた', 0, 'Correct.'], ['つかれて いる から 、 もっと はしった', 1, 'Tiredness is no reason to run more: つかれて いる のに 、 もっと はしった.'], ['みず が あまい ので 、 たくさん のんだ', 0, 'Correct.']],
    [['{道|みち} が {暗|くら}い から 、 {提灯|ちょうちん} を {持|も}って いく', 0, 'Correct.'], ['{古|ふる}い けど 、 {丈夫|じょうぶ} な {井戸|いど} だ', 0, 'Correct.'], ['{元気|げんき} から 、 {走|はし}った', 1, 'A な-adjective needs だ: {元気|げんき} だ から.'], ['{水|みず} が {冷|つめ}たい ので 、 {手|て} が {痛|いた}い', 0, 'Correct.']],
    [['{掃除|そうじ} した のに 、 また {汚|よご}れた', 0, 'Correct.'], ['{柳|やなぎ} の {根|ね} の せい で 、 {水|みず} が {苦|にが}く なった', 0, 'Correct.'], ['{雨|あめ} が {降|ふ}った のに 、 {道|みち} が {濡|ぬ}れた', 1, 'のに needs something unexpected; a wet road after rain is just what happens: {雨|あめ} が {降|ふ}った ので 、 {道|みち} が {濡|ぬ}れた.'], ['{皆|みな} の おかげ で 、 {井戸|いど} が きれい に なった', 0, 'Correct.']],
    [['{古|ふる}い {井戸|いど} だ からこそ 、 {大切|たいせつ} に したい', 0, 'Correct.'], ['{反対|はんたい} に も かかわらず 、 {計画|けいかく} は {進|すす}んだ', 0, 'Correct.'], ['{疲|つか}れて いた に も かかわらず 、 {早|はや}く {寝|ね}た', 1, 'The counterexample: going to bed early is what tiredness leads to; にもかかわらず needs a result against it. {疲|つか}れて いた ので 、 {早|はや}く {寝|ね}た.'], ['{謝|あやま}った ものの 、 {許|ゆる}して もらえなかった', 0, 'Correct.']], 1);
  const cardStretch = [ch({ item: 'g:adv_kara_koso', ctx: { jp: '{古|ふる}い {井戸|いど} だ から 、 {大切|たいせつ} に したい 。 ／ {古|ふる}い {井戸|いど} だ からこそ 、 {大切|たいせつ} に したい 。', en: '' }, prompt: { en: 'What does こそ add to the reason?' },
    options: [e('It singles the reason out against someone who might think the opposite: "precisely because it is old" (where others would say old means worthless).', 1), e('Nothing: こそ is decoration.', 0, 'こそ marks this, and nothing else, as the reason.'), e('It turns the reason into a contrast.', 0, 'It strengthens the reason.')] })];
  C.challenges['hall.w5.counter0'] = { title: T('{昔|むかし} の {言葉|ことば}', 'The old sayings'), tiers: C0, stretchA: cardStretch };
  C.challenges['hall.w5.counter1'] = { title: T('{昔|むかし} の {言葉|ことば}', 'The old sayings'), tiers: C1, stretchA: cardStretch };

  // ---- asking about the well-digger's record (A12) -------------------------------------------------------------------------------
  C.challenges['hall.w5.ask'] = { title: T('{井戸掘|いどほ}り の {記録|きろく}', 'The well-digger\'s record'), tiers: {
    F: [ch({ item: 'v:井戸', prompt: { en: 'You want to know why the west well is bitter. What do you ask?' },
      options: [o('にし の いど は 、 どうして にがい の です か 。', 1), o('にし の いど は 、 どこ に あります か 。', 0, 'That asks where it is.'), o('ひがし の いど は 、 どうして あまい の です か 。', 0, 'That asks about the east well.')] })],
    E: [ch({ item: 'g:conj_kara', prompt: { en: 'You want to know why the west well turned bitter. What do you ask?' },
      options: [o('{西|にし} の {井戸|いど} は 、 どうして {苦|にが}く なった ん です か 。', 1), o('{西|にし} の {井戸|いど} は 、 いつ {掘|ほ}った ん です か 。', 0, 'That asks when it was dug.'), o('{西|にし} の {井戸|いど} は {苦|にが}い から 、 {飲|の}みます か 。', 0, 'That asks whether, being bitter, you will drink it.')] })],
    I: [ch({ item: 'g:conj_kara', prompt: { en: 'You want to know whether the record gives the reason the west well turned bitter. What do you ask?' },
      options: [o('{記録|きろく} に は 、 {西|にし} の {井戸|いど} が {苦|にが}く なった {理由|りゆう} が {書|か}いて あります か 。', 1), o('{記録|きろく} は 、 {苦|にが}い から {読|よ}まない ん です か 。', 0, 'That asks whether you will not read the record because it is bitter.'), o('{記録|きろく} を {書|か}いた {人|ひと} は 、 {苦|にが}い {人|ひと} です か 。', 0, 'That asks whether the writer was a bitter person.')] })],
    A: [ch({ item: 'g:keigo_kenjo', prompt: { en: 'Ask, politely, to be told what the record gives as the cause.' },
      options: [o('{恐|おそ}れ{入|い}ります が 、 {西|にし} の {井戸|いど} が {苦|にが}く なった {原因|げんいん} を 、 {記録|きろく} から お{教|おし}え いただけます か 。', 1), o('{記録|きろく} を {苦|にが}く して いただけます か 。', 0, 'That asks them to make the record bitter.'), o('{原因|げんいん} は 、 {存|ぞん}じ{上|あ}げて おります 。', 0, 'That says you already know it.')] })],
  },
  stretchA: [ch({ item: 'g:okage_sei', ctx: { jp: '「 {汲|く}まない {井戸|いど} は 、 {水|みず} が {腐|くさ}る 。 」', en: '' }, prompt: { en: 'The well-digger\'s saying. What does it say about the two houses\' quarrel?' },
    options: [e('That the west well went bad not because of anyone\'s doing but because of everyone\'s not doing: nobody drew from it once the east well was sweeter.', 1), e('That the west house poisoned it.', 0, 'The saying names no one.'), e('That wells should never be used.', 0, 'The opposite: a well must be drawn.')] })] };

  // ---- the riddle stone (a reprieve) -----------------------------------------------------------------------------------------
  C.challenges['hall.w5.riddle'] = { title: T('なぞなぞ の {石|いし}', 'The riddle stone'), tiers: {
    F: [ch({ item: 'v:井戸', ctx: { jp: 'そこ が みえない ほど ふかくて 、 みず を くれる もの 、 なあに ？', en: '' }, prompt: { en: 'What is it?' },
      options: [o('いど', 1), o('やま', 0, 'A mountain is high, not deep.'), o('そら', 0, 'The sky gives rain, but has no bottom to look for.')] })],
    E: [ch({ item: 'v:井戸', ctx: { jp: '{上|うえ} から {覗|のぞ}く と 、 {自分|じぶん} の {顔|かお} が {見|み}える 。 {桶|おけ} を {下|お}ろす と 、 {水|みず} が {上|あ}がって くる 。 {何|なん} だ ？', en: '' }, prompt: { en: 'What is it?' },
      options: [o('{井戸|いど}', 1), o('{鏡|かがみ}', 0, 'A mirror shows your face, but gives no water.'), o('{池|いけ}', 0, 'A pond needs no bucket lowered into it.')] })],
    I: [ch({ item: 'v:井の中の蛙', ctx: { jp: '{狭|せま}い {所|ところ} に {住|す}んで いる ので 、 {広|ひろ}い {海|うみ} を {知|し}らない 。 {誰|だれ} の こと ？', en: '' }, prompt: { en: 'Who is it?' },
      options: [o('{井|い} の {中|なか} の {蛙|かわず}', 1), o('{海|うみ} の {魚|さかな}', 0, 'A fish of the sea knows the sea.'), o('{空|そら} の {鳥|とり}', 0, 'A bird sees everything from above.')] })],
    A: [ch({ item: 'v:井戸', ctx: { jp: '{汲|く}めば {汲|く}む ほど {澄|す}み 、 {汲|く}まねば {濁|にご}る 。 {人|ひと} の {縁|えん} に も {似|に}た もの 、 {何|なに} か 。', en: '' }, prompt: { en: 'What is it?' },
      options: [o('{井戸|いど}', 1), o('{川|かわ}', 0, 'A river runs clear whether you draw from it or not.'), o('{雨|あめ}', 0, 'Nobody draws rain.')] })],
  },
  stretchA: [ch({ item: 'v:井戸', ctx: { jp: '{汲|く}めば {汲|く}む ほど {澄|す}み 、 {汲|く}まねば {濁|にご}る 。 {人|ひと} の {縁|えん} に も {似|に}た もの 。', en: '' }, prompt: { en: 'Why is a well like a bond between people, in the riddle?' },
    options: [e('Both stay clear by being used: a well drawn from every day, a tie kept up; left alone, both go cloudy, which is what happened to the west well and the two houses.', 1), e('Both are deep and dark.', 0, 'The riddle is about drawing, not depth.'), e('Both belong to the village.', 0, 'The riddle compares how they stay clear.')] })] };

  // ---- t5: the frogs of the west well (conditions: wet) ------------------------------------------------------------------------
  C.encounters = C.encounters || {};
  const FROG = { enemy: 'yn.toad', name: say('{井戸|いど} の {蛙|かえる}', 'Well frog'), conditions: ['wet'], knots: 2, music: 'battle_atlas' };
  C.encounters['hall.w5.frogs'] = {
    id: 'hall.w5.frogs', kind: 'battle', name: say('{西|にし} の {井戸|いど} の {蛙|かえる}', 'The frogs of the west well'),
    lead: Object.assign({}, FROG, { knots: 3 }),
    group: { normal: [FROG], hard: [FROG, FROG] },
    rules: { wait: true, conditions: true },
  };

  // ---- t9: Osugi and Mosuke (a mediation) -----------------------------------------------------------------------------------
  function task(item, en, ok, w1, why1, w2, why2) {
    const low = ch({ item, prompt: { en }, options: [{ jp: ok, ok: true }, { jp: w1, ok: false, why: { en: why1 } }] });
    const high = ch({ item, prompt: { en: en + ' (Read them closely: two are near.)' }, options: [{ jp: ok, ok: true }, { jp: w1, ok: false, why: { en: why1 } }, { jp: w2, ok: false, why: { en: why2 } }] });
    return { F: low, E: low, I: high, A: high };
  }
  C.encounters['hall.w5.feud'] = {
    id: 'hall.w5.feud', kind: 'social', name: say('オスギ と モスケ', 'Osugi and Mosuke'),
    rules: { wait: true },
    autoRoute: ['s:calm', 's:ask_thanks', 'wait', 's:together'],
    social: {
      parties: [
        { aid: 'n:osugi', name: say('オスギ', 'Osugi'), stance: 'heated', wants: { en: 'For the west house to admit the bitter well is its fault.' } },
        { aid: 'n:mosuke', name: say('モスケ', 'Mosuke'), stance: 'heated', wants: { en: 'For the east house to admit it drew the whole village away from his well.' } },
      ],
      claims: {
        east: { by: 'n:osugi', jp: '{西|にし} の {井戸|いど} が {苦|にが}い の は 、 {西|にし} の {家|いえ} が {手入|てい}れ を しない せい だ よ 。', en: 'Osugi: "The west well is bitter because the west house never looks after it."' },
        west: { by: 'n:mosuke', jp: '{東|ひがし} の {家|いえ} が {皆|みな} を {東|ひがし} の {井戸|いど} に {呼|よ}んだ から 、 {西|にし} の {井戸|いど} は {使|つか}われなく なった ん じゃ 。', en: 'Mosuke: "The east house called everyone to the east well, so nobody used mine any more."' },
        drought: { by: 'n:mosuke', jp: '…… {日照|ひで}り の {年|とし} 、 {東|ひがし} の {井戸|いど} が {涸|か}れた とき 、 {村|むら} を {救|すく}った の は 、 {西|にし} の {井戸|いど} じゃった 。', en: 'Mosuke: "…In the drought year, when the east well ran dry, it was the west well that saved the village."', hidden: true },
      },
      understanding: 3,
      gesture: { name: say('{二|ふた}つ の {水|みず} を {並|なら}べる', 'Set a cup from each well side by side'), desc: 'Draw a cup from each well and set them side by side between them.', effect: { stance: { 'n:osugi': 'listening', 'n:mosuke': 'listening' } }, once: true, says: { en: 'You set the two cups down between them, one from each well. They both look at the cups, not at each other.' } },
      unravelTip: { en: 'Nothing is knotted. What is tangled is who each blames, and what neither has said.' },
      actions: [
        { id: 'calm', kind: 'restate', label: say('お{二人|ふたり} と も 、 {相手|あいて} の せい だ と {思|おも}って いる ん です ね 。', 'Say back what each of them believes'),
          task: task('g:okage_sei', 'Which says back what both of them believe?', 'お{二人|ふたり} と も 、 {相手|あいて} の せい だ と {思|おも}って いる ん です ね 。', 'お{二人|ふたり} と も 、 {井戸|いど} が {好|す}き な ん です ね 。', 'True, maybe, but not what they are saying.', 'お{二人|ふたり} と も 、 {相手|あいて} の おかげ だ と {思|おも}って いる ん です ね 。', 'おかげ credits; they are blaming.'),
          cases: [{ when: { stance: { 'n:osugi': 'heated' } }, effect: { stance: { 'n:osugi': 'listening' } }, says: { en: 'Osugi sniffs. "Well. Yes."' } },
            { when: { stance: { 'n:mosuke': 'heated' } }, effect: { stance: { 'n:mosuke': 'listening' } }, says: { en: 'Mosuke grunts and folds his arms, but stops talking over her.' } }],
          says: { en: 'They are already listening.' } },
        { id: 'ask_thanks', kind: 'ask', label: say('{西|にし} の {井戸|いど} の おかげ で 、 {助|たす}かった こと は ありません か 。', 'Ask whether the west well ever helped'), once: true, when: { stance: { 'n:mosuke': 'listening' } },
          task: task('g:okage_sei', 'Which asks whether the west well ever helped anyone?', '{西|にし} の {井戸|いど} の おかげ で 、 {助|たす}かった こと は ありません か 。', '{西|にし} の {井戸|いど} の せい で 、 {困|こま}った こと は ありません か 。', 'That asks for more blame.', '{東|ひがし} の {井戸|いど} は 、 いつ {掘|ほ}った ん です か 。', 'That asks when the east well was dug.'),
          effect: { reveal: 'drought', understanding: 1 }, says: { en: 'Mosuke is quiet. Then: "The drought year. When the east well ran dry, it was mine the whole village drank from." Osugi looks down.' } },
        { id: 'together', kind: 'propose', label: say('{西|にし} の {井戸|いど} の おかげ で 、 {村|むら} は {助|たす}かった ん です ね 。 {今年|ことし} は 、 {二|ふた}つ と も {一緒|いっしょ} に {替|か}えません か 。', 'Propose cleaning both wells together this year'), when: { claims: ['drought'] },
          task: task('g:okage_sei', 'Which credits the west well and proposes cleaning both together?', '{西|にし} の {井戸|いど} の おかげ で 、 {村|むら} は {助|たす}かった ん です ね 。 {今年|ことし} は 、 {二|ふた}つ と も {一緒|いっしょ} に {替|か}えません か 。', '{西|にし} の {井戸|いど} の せい で 、 {村|むら} は {助|たす}かった ん です ね 。', 'せいで blames; the village was saved.', '{東|ひがし} の {井戸|いど} の おかげ で 、 {西|にし} の {井戸|いど} は {苦|にが}く なった ん です ね 。', 'おかげ cannot credit a thing for something bad.'),
          effect: { flag: 'together' }, says: { en: 'Osugi lets out a long breath. "…Both wells, then. Together." Mosuke nods, once.' } },
        { id: 'blunt', kind: 'propose', label: say('どちら も {悪|わる}い 。 {喧嘩|けんか} は やめなさい 。', 'Tell them both off'), lasting: true, means: { en: 'You will tell them both they are in the wrong.' },
          task: task('g:v_te_kudasai', 'Which tells them both to stop quarrelling?', 'どちら も {悪|わる}い 。 {喧嘩|けんか} は やめなさい 。', 'どちら の {井戸|いど} も 、 {大事|だいじ} です ね 。', 'That is gentle; it does not tell them off.', 'お{二人|ふたり} の おかげ で 、 {助|たす}かりました 。', 'That thanks them.'),
          effect: { stance: { 'n:osugi': 'leaving', 'n:mosuke': 'leaving' } }, says: { en: 'Osugi stalks off to the east, Mosuke to the west, each muttering about the other.' } },
      ],
      responses: {
        water: { effect: { stance: { 'n:osugi': 'listening', 'n:mosuke': 'listening' } }, says: { en: 'A little water spills between them. Both of them, at once, step back to keep their feet dry, and nearly laugh.' } },
        unravel: { says: { en: 'Nothing here is knotted. Listen to who blames whom, and what neither says.' } },
      },
      wait: { when: { stance: { 'n:mosuke': 'listening' } }, effect: { reveal: 'drought' }, says: { en: 'Mosuke says, half to himself, "The drought year, it was my well they all came to."' } },
      drift: [{ when: { all: [{ rounds: 3 }, { stance: { 'n:osugi': 'heated' } }] }, once: true, effect: { stance: { 'n:osugi': 'listening', 'n:mosuke': 'listening' } }, says: { en: 'Kōta and Hatsu come running across the square, hand in hand, and stop dead at the sight of their grandparents\' faces. Both grandparents go quiet.' } }],
      companion: {
        nao: [{ id: 'nao_both', name: say('{両方|りょうほう} の {手紙|てがみ}', 'Letters both ways'), desc: 'Nao, who carries letters both ways down a road, says so.', once: true, effect: { understanding: 1, stance: { 'n:osugi': 'listening', 'n:mosuke': 'listening' } }, says: { en: 'Nao: "I carry letters both ways down a road. Nobody\'s ever been wrong in only one direction." They both look at Nao.' } }],
        mio: [{ id: 'mio_taste', name: say('{水|みず} を {比|くら}べる', 'Taste the two waters'), desc: 'Mio tastes both waters, as she would a remedy.', once: true, effect: { understanding: 1 }, says: { en: 'Mio tastes the two cups. "The west water isn\'t bitter all through. It\'s stale, like a medicine left too long in the jar."' } }],
        ren: [{ id: 'ren_lamps', name: say('{灯|ひ} の {話|はなし}', 'Talk about lamps nobody tends'), desc: 'Ren speaks of lamps that go out when nobody tends them.', once: true, effect: { understanding: 1, stance: { 'n:mosuke': 'listening' } }, says: { en: 'Ren: "A lamp nobody tends goes out, and nobody is to blame but all of us." Mosuke unfolds his arms.' } }],
        suzu: [{ id: 'suzu_duet', name: say('{二人|ふたり} {芝居|しばい}', 'A two-hander'), desc: 'Suzu treats it as a two-hander that needs a different ending.', once: true, effect: { understanding: 1, stance: { 'n:osugi': 'listening' } }, says: { en: 'Suzu: "A two-hander where both sides blame each other runs for years. Audiences prefer the version where they make up." Osugi almost smiles.' } }],
      },
    },
    conclusions: [
      { id: 'walked', when: { left: 'n:osugi' }, result: 'end', text: { en: 'They have gone home to opposite ends of the village. They will be back in the square for the cleaning; you can try again.' } },
      { id: 'together', when: { flag: 'together' }, result: 'win', text: { en: 'Both wells will be cleaned together this year, by both houses.' } },
    ],
  };

  // ---- t10: the well-cleaning (the capstone) ----------------------------------------------------------------------------------
  function hear(item, fJp, jp, en, ok, w1, why1, w2, why2) {
    const opts = (two) => [{ en: ok, ok: true }, { en: w1, ok: false, why: { en: why1 } }].concat(two ? [{ en: w2, ok: false, why: { en: why2 } }] : []);
    return { F: ch({ item, ctx: { jp: fJp, en: '' }, prompt: { en }, options: opts(false) }), E: ch({ item, ctx: { jp, en: '' }, prompt: { en }, options: opts(false) }), I: ch({ item, ctx: { jp, en: '' }, prompt: { en }, options: opts(true) }), A: ch({ item, ctx: { jp, en: '' }, prompt: { en }, options: opts(true) }) };
  }
  const A = (id, jp, en, more) => Object.assign({ id, label: { jp, en } }, more);
  const vals = (x) => { const out = {}; for (const k in x) out[k] = { jp: x[k][0], en: x[k][1] }; return out; };
  const WELL = vals({ full: ['{水|みず} が {溜|た}まって いる', 'full of old water'], checked: ['{空気|くうき} を {確|たし}かめた', 'the air checked'], emptied: ['{空|から} に した', 'emptied'], scrubbed: ['{洗|あら}った', 'scrubbed'], blessed: ['お{清|きよ}め を した', 'blessed'] });
  C.encounters['hall.w5.clean'] = {
    id: 'hall.w5.clean', kind: 'procedure', name: say('{井戸替|いどが}え', 'The well-cleaning'),
    rules: { wait: true },
    procedure: {
      id: 'hall_w5_clean', version: 1, restart: 'stable',
      machine: { well: 'full' },
      show: [{ key: 'well', label: say('{井戸|いど}', 'The well'), values: WELL }],
      done: { en: 'The wells are clean, and the village drinks from both again.' },
      steps: [
        { id: 'w1', stable: true, text: say('モスケ ： 「 {入|はい}る {前|まえ} に 、 {提灯|ちょうちん} を {下|お}ろす 。 {火|ひ} が {消|き}えたら 、 {下|した} で は {息|いき} が できない から じゃ 。 」', 'Mosuke: "Before anyone goes down, lower a lantern. If the flame goes out, there\'s no breathing down there."'),
          task: hear('g:conj_kara', 'モスケ ： 「 ひ が きえたら 、 した で は いき が できない から じゃ 。 」', 'モスケ ： 「 {入|はい}る {前|まえ} に 、 {提灯|ちょうちん} を {下|お}ろす 。 {火|ひ} が {消|き}えたら 、 {下|した} で は {息|いき} が できない から じゃ 。 」', 'Why is the lantern lowered first?',
            'If the flame goes out, the air down there is bad to breathe.', 'To see the frogs.', 'He gives the reason with から: the flame shows whether there is air.', 'Because it is dark at night.', 'It is the air, not the dark, he is checking.'),
          actions: [
            A('lantern', '{提灯|ちょうちん} を {下|お}ろす', 'Lower the lantern', { ok: true, set: { well: 'checked' }, means: { en: 'You lower the lantern on its rope into the well.' }, result: { en: 'The flame burns steady all the way down. "Good air," Mosuke says.' } }),
            A('climb', 'すぐ に {降|お}りる', 'Climb straight down', { means: { en: 'You start down the well at once.' }, wrong: { en: 'Mosuke catches your sleeve. "The lantern first. I\'ve buried a man who didn\'t."' } }),
          ] },
        { id: 'w2', stable: true, text: say('オスギ ： 「 {水|みず} を {全部|ぜんぶ} {汲|く}み{出|だ}さない と 、 {底|そこ} が {見|み}えない よ 。 」', 'Osugi: "Unless we draw all the water out, we\'ll never see the bottom."'),
          task: hear('g:v_nakereba', 'オスギ ： 「 みず を ぜんぶ くみださない と 、 そこ が みえない よ 。 」', 'オスギ ： 「 {水|みず} を {全部|ぜんぶ} {汲|く}み{出|だ}さない と 、 {底|そこ} が {見|み}えない よ 。 」', 'What has to happen before the bottom can be seen?',
            'All the water drawn out.', 'The frogs taken out.', 'She says the water must all come out.', 'The rope cut.', 'Nothing about the rope.'),
          actions: [
            A('haul', '{皆|みな} で {桶|おけ} を {回|まわ}して 、 {水|みず} を {汲|く}み{出|だ}す', 'Everyone passes buckets and draws the water out', { ok: true, set: { well: 'emptied' }, means: { en: 'You form a line, east house and west together, and pass the buckets.' }, result: { en: 'Bucket after bucket goes down the line. At last the bottom shows: mud, leaves, and a very surprised frog.' } }),
            A('scrub', '{今|いま} すぐ {底|そこ} を {洗|あら}う', 'Scrub the bottom now', { means: { en: 'You reach for the brush.' }, wrong: { en: '"Through all that water?" Osugi laughs. "Out first, then scrub."' } }),
          ] },
        { id: 'w3', stable: true, text: say('ケロ ： 「 {僕|ぼく} が ここ に いる の は 、 {水|みず} が きれい だ から だ よ 。 {汚|きたな}い {井戸|いど} に は 、 {蛙|かえる} は {住|す}まない 。 」', 'Kero: "I live here because the water\'s clean. Frogs don\'t live in dirty wells."'),
          task: hear('g:conj_kara', 'ケロ ： 「 ぼく が ここ に いる の は 、 みず が きれい だ から だ よ 。 」', 'ケロ ： 「 {僕|ぼく} が ここ に いる の は 、 {水|みず} が きれい だ から だ よ 。 {汚|きたな}い {井戸|いど} に は 、 {蛙|かえる} は {住|す}まない 。 」', 'What does Kero say about the well?',
            'That a frog living there is a sign the water is good.', 'That frogs make the water bitter.', 'Kero says the opposite: frogs live only in clean wells.', 'That Kero wants to leave.', 'Kero wants to stay.'),
          actions: [
            A('keep', 'ケロ を {桶|おけ} に {入|い}れて 、 {洗|あら}う {間|あいだ} {待|ま}って もらう', 'Let Kero wait in a bucket while you scrub', { ok: true, set: { well: 'scrubbed' }, means: { en: 'You give Kero a bucket of clean water to wait in, and scrub the well.' }, result: { en: 'You scrub the stones and pull out the willow roots. Kero watches from the bucket, approving.' } }),
            A('chase', 'ケロ を {追|お}い{出|だ}す', 'Chase Kero out', { means: { en: 'You go to chase the frog away.' }, wrong: { en: '"No!" Hatsu and Kōta both shout. "Kero\'s how we know the water\'s good!"' } }),
          ] },
        { id: 'w4', stable: true, text: say('オスギ ： 「 {西|にし} の {井戸|いど} の おかげ で 、 あの {年|とし} は {助|たす}かった 。 」 モスケ ： 「 {東|ひがし} の {井戸|いど} の おかげ で 、 {毎日|まいにち} {助|たす}かって おる 。 」', 'Osugi: "Thanks to the west well, we came through that year." Mosuke: "Thanks to the east well, we get through every day."'),
          task: hear('g:okage_sei', 'オスギ ： 「 にし の いど の おかげ で 、 たすかった 。 」', 'オスギ ： 「 {西|にし} の {井戸|いど} の おかげ で 、 あの {年|とし} は {助|たす}かった 。 」 モスケ ： 「 {東|ひがし} の {井戸|いど} の おかげ で 、 {毎日|まいにち} {助|たす}かって おる 。 」', 'What are they saying to each other?',
            'Each thanks the other\'s well.', 'Each blames the other\'s well.', 'おかげで thanks; せいで would blame.', 'Each says their own well is best.', 'Each names the other\'s well.'),
          actions: [
            A('bless', '{塩|しお} と お{神酒|みき} を 、 {二|ふた}つ の {井戸|いど} に {供|そな}える', 'Offer salt and sake at both wells', { ok: true, set: { well: 'blessed' }, means: { en: 'You set salt and a little sake at both wells, east and west.' }, result: { en: 'Kero hops back into the clean water. From the bottom of the west well comes a single, contented croak.' } }),
            A('one', '{東|ひがし} の {井戸|いど} に だけ {供|そな}える', 'Offer only at the east well', { means: { en: 'You go to bless only the east well.' }, wrong: { en: 'Osugi stops you herself. "Both," she says. "This year, both."' } }),
          ] },
      ],
    },
    conclusions: [{ id: 'done', when: { proc: 'done' }, result: 'win', text: { en: 'Both wells are clean.' } }],
  };
})(RB.content);
