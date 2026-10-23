/* The Hall of a Hundred Tales, wing 4, The Borrowed Umbrella: the language tasks and encounters (expansion P15; plan
 * 04_DUNGEONS.md D9; scenes in 24_w4_scenes.js). The theme: requests, permission, intention and misunderstanding
 * (～てください, ～てもらえますか; ～てもいい and ～てはいけない; ～つもり and ～ようと思う; at the top the humble
 * ways to ask). Every task has its four levels and an Advanced stretch.
 *   hall.w4.story      the tale's four written passages, back in order (A38)
 *   hall.w4.story_q    what the umbrella's going home says (optional)
 *   hall.w4.counter0/1 the peddler's cards on asking: the one that breaks the rule (A34)
 *   hall.w4.ask        asking your companion what the river notice allows today (A12)
 *   hall.w4.riddle     the riddle stone (a reprieve)
 *   encounters: hall.w4.reeds (the reeds in the flood: rooted, in the rain), hall.w4.kasa (the umbrella at the gate,
 *   sure it was never meant to come back: a conversation), hall.w4.return (the umbrella returned to Myōshin: the
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
  const P1 = '{嵐|あらし} の {夜|よる} 、 {行商人|ぎょうしょうにん} の ゴサク は 、 {山寺|やまでら} で {傘|かさ} を {借|か}りた', P2 = '「 {雨|あめ} が {止|や}んだら 、 {返|かえ}しに {来|き}ます 」 と 、 ゴサク は {約束|やくそく} した',
    P3 = 'けれど {川|かわ} が {溢|あふ}れて 、 ゴサク は {一年|いちねん} 、 {寺|てら} へ {戻|もど}れなかった', P4 = '{待|ま}ち{続|つづ}けた {傘|かさ} は 、 {一本足|いっぽんあし} で {跳|は}ねて 、 {自分|じぶん} で {寺|てら} へ {向|む}かった';
  C.hallW4Tale = { P1, P2, P3, P4 };
  const FT = ['あらし の よる 、 ゴサク は やまでら で かさ を かりた', '「 あめ が やんだら 、 かえしに きます 」 と 、 ゴサク は いった', 'けれど かわ が あふれて 、 ゴサク は いちねん もどれなかった', 'かさ は いっぽんあし で はねて 、 じぶん で てら へ むかった'];
  C.hallW4TaleF = FT;
  C.challenges['hall.w4.story'] = { title: T('{借|か}りた {傘|かさ}', 'The Borrowed Umbrella'), tiers: {
    F: [OR({ item: 'v:傘', prompt: { en: 'Arrange the four written passages to retell the scroll\'s story.' }, tiles: [FT[2], FT[0], FT[3], FT[1]], answer: FT,
      orderHint: { en: 'The umbrella borrowed; the promise; the flood; the umbrella setting off on its own.' } })],
    E: [OR({ item: 'v:傘', prompt: { en: 'Arrange the four passages in the tale\'s order.' }, tiles: [P3, P1, P4, P2], answer: [P1, P2, P3, P4],
      orderHint: { en: 'First the borrowing, then the promise, then what stopped him, then what the umbrella did.' } })],
    I: [OR({ item: 'g:tsumori', prompt: { en: 'Order the passages so that each follows from the one before.' }, tiles: [P4, P2, P1, P3], answer: [P1, P2, P3, P4],
      orderHint: { en: 'He borrowed it and promised to return it (he meant to); the flood kept him away; the umbrella, waiting, went home by itself.' } })],
    A: [OR({ item: 'g:tsumori', prompt: { en: 'Order the passages; the turn is the one with けれど in it.' }, tiles: [P2, P4, P3, P1], answer: [P1, P2, P3, P4],
      orderHint: { en: 'The promise is kept in words; けれど turns it: the flood, not a change of heart, is why it was broken.' } })],
  },
  stretchA: [ch({ item: 'g:tsumori', ctx: { jp: '{返|かえ}す つもり だった 。 ／ {返|かえ}した つもり だった 。', en: '' }, prompt: { en: 'One letter apart. What does each say about Gosaku?' },
    options: [e('返すつもりだった: he meant to return it (and did not); 返したつもりだった: he believed he had already returned it (and was wrong). Only the first is his story.', 1),
      e('They mean the same.', 0, 'つもり after a dictionary form is an intention; after a past form it is a belief about what you did.'),
      e('The second means he returned it twice.', 0, 'It means he wrongly thought it was done.')] })] };
  C.challenges['hall.w4.story_q'] = { title: T('{話|はなし} の {後|あと} で', 'After the tale'), optional: true, tiers: {
    F: [ch({ item: 'v:返す', ctx: { jp: FT[1] + ' 。', en: '' }, prompt: { en: 'What did Gosaku promise?' },
      options: [e('To bring the umbrella back when the rain stopped.', 1), e('To buy the umbrella.', 0, 'かえしに きます: come to give it back.'), e('To stay at the temple.', 0, 'He promised to come back with it.')] })],
    E: [ch({ item: 'v:溢れる', ctx: { jp: P2 + ' 。 ' + P3 + ' 。', en: '' }, prompt: { en: 'Why didn\'t he come back?' },
      options: [e('The river flooded, and he could not cross for a year.', 1), e('He forgot.', 0, 'The tale says the river overflowed.'), e('He sold the umbrella.', 0, 'Nothing says so.')] })],
    I: [ch({ item: 'g:tsumori', ctx: { jp: P2 + ' 。', en: '' }, prompt: { en: 'What does 返しに来ます show about Gosaku?' },
      options: [e('That he meant to bring it back: his intention was plain.', 1), e('That he wanted to keep it.', 0, '返しに来る: come to give it back.'), e('That he was asking permission.', 0, 'It is a promise, not a question.')] })],
    A: [ch({ item: 'g:tsumori', ctx: { jp: P3 + ' 。 ' + P4 + ' 。', en: '' }, prompt: { en: 'The umbrella goes home by itself. What is the tale suggesting?' },
      options: [e('That a thing lent and not returned feels forgotten, though nobody meant to forget it: the misunderstanding is the tale.', 1), e('That umbrellas are dangerous.', 0, 'It only hops; it harms nobody.'), e('That Gosaku was a thief.', 0, 'He meant to return it; the river stopped him.')] })],
  } };

  // ---- the peddler's cards on asking: the one that breaks the rule (A34) ---------------------------------------------------
  // F and E: ～てください and ～てもいいですか take the て form. I: ～つもり after the dictionary form is an intention
  // (after the past, a belief). A: humble verbs (お～する, いただく, 伺う, 拝見する) are for your own side.
  C.hallW4Cards = {};
  function counter(F, E, I, A, pat) {
    C.hallW4Cards[pat] = { F, E, I, A };
    const mk = (item, list, prompt) => ch({ item, ctx: { jp: list.map((x, i) => (i + 1) + ' 、 ' + x[0]).join(' ／ '), en: '' }, prompt: { en: prompt }, options: list.map((x, i) => o(String(i + 1) + ' 、 ' + x[0], x[1], x[2])) });
    return {
      F: [mk('g:v_te_kudasai', F, 'Three cards ask the right way. Which one breaks the rule?')],
      E: [mk('g:v_temo_ii', E, 'Three cards ask and give permission correctly. Which one breaks the rule?')],
      I: [mk('g:tsumori', I, 'Three cards use つもり and ～ようと思う the way they work. Which one breaks the rule?')],
      A: [mk('g:keigo_kenjo', A, 'Three cards ask with humble language correctly. Which is the counterexample?')],
    };
  }
  const C0 = counter(
    [['かさ を かして ください', 0, 'て form + ください: correct.'], ['ここ で まって も いい です か', 0, 'て form + も いい: correct.'], ['みの を かす ください', 1, 'ください takes the て form: かして ください.'], ['まど を しめて ください', 0, 'Correct.']],
    [['{窓|まど} を {開|あ}けて ください', 0, 'Correct.'], ['{写真|しゃしん} を {撮|と}る も いい です か', 1, 'も いい takes the て form: {撮|と}って も いい です か.'], ['{入|はい}らないで ください', 0, 'Correct.'], ['ここ に {座|すわ}って も いい です か', 0, 'Correct.']],
    [['{明日|あした} 、 {寺|てら} へ {行|い}く つもり です', 0, 'An intention: correct.'], ['{傘|かさ} を {返|かえ}そう と {思|おも}って います', 0, 'Correct.'], ['{返|かえ}す つもり だった が 、 {川|かわ} が {溢|あふ}れた', 0, 'An intention that did not happen: correct.'], ['{明日|あした} 、 {寺|てら} へ {行|い}った つもり です', 1, 'つもり after a past form is a belief about what you did ("I believe I went"), never a plan for tomorrow: {行|い}く つもり です.']],
    [['{傘|かさ} を お{借|か}り して も よろしい でしょう か', 0, 'お{借|か}りする: humble, for my own borrowing. Correct.'], ['しばらく {待|ま}たせて いただけません か', 0, 'Correct.'], ['お{名前|なまえ} を {伺|うかが}って も よろしい です か', 0, 'Correct.'], ['{傘|かさ} を お{貸|か}し して いただけません か', 1, 'The counterexample: お{貸|か}しする is humble, for my own lending. For the other\'s lending: お{貸|か}し いただけません か, or {貸|か}して いただけません か.']], 0);
  const C1 = counter(
    [['ちょうちん を かして ください', 0, 'Correct.'], ['ここ で やすんで も いい です か', 0, 'Correct.'], ['まど を あける も いい です か', 1, 'も いい takes the て form: あけて も いい です か.'], ['しずか に して ください', 0, 'Correct.']],
    [['{手|て} を {洗|あら}って ください', 0, 'Correct.'], ['{靴|くつ} を {脱|ぬ}がないで ください', 0, 'Correct.'], ['ここ で {走|はし}って は いい です', 1, 'は goes with いけない: {走|はし}って は いけない (or {走|はし}って も いい).'], ['{窓|まど} を {開|あ}けて も いい です か', 0, 'Correct.']],
    [['{来年|らいねん} も {来|く}る つもり です', 0, 'Correct.'], ['{謝|あやま}ろう と {思|おも}った', 0, 'Correct.'], ['{傘|かさ} を {返|かえ}そう つもり です', 1, 'つもり takes the dictionary form, not the volitional: {返|かえ}す つもり です (or {返|かえ}そう と {思|おも}って います).'], ['{行|い}かない つもり です', 0, 'Correct.']],
    [['ご{説明|せつめい} いただけます か', 0, 'Correct.'], ['{少々|しょうしょう} お{待|ま}ち いただけます か', 0, 'Correct.'], ['{拝見|はいけん} して も よろしい です か', 0, 'Correct.'], ['ご{覧|らん} に なって も よろしい です か', 1, 'The counterexample: ご{覧|らん}になる is respectful, for the other person\'s looking. For my own looking: {拝見|はいけん} して も よろしい です か.']], 1);
  const cardStretch = [ch({ item: 'g:keigo_kenjo', ctx: { jp: '{傘|かさ} を {貸|か}して ください 。 ／ {傘|かさ} を {貸|か}して いただけません か 。', en: '' }, prompt: { en: 'Both ask to borrow the umbrella. What does the second do that the first does not?' },
    options: [e('It asks whether the favour can be granted rather than asking for it outright, and puts the other person above you: the way to ask a nun at her temple door.', 1), e('Nothing: it is only longer.', 0, 'The negative question and いただく both soften and lower you.'), e('It asks the nun to borrow your umbrella.', 0, 'It still asks her to lend.')] })];
  C.challenges['hall.w4.counter0'] = { title: T('{行商人|ぎょうしょうにん} の {札|ふだ}', 'The peddler\'s cards'), tiers: C0, stretchA: cardStretch };
  C.challenges['hall.w4.counter1'] = { title: T('{行商人|ぎょうしょうにん} の {札|ふだ}', 'The peddler\'s cards'), tiers: C1, stretchA: cardStretch };

  // ---- asking about the river notice (A12) ---------------------------------------------------------------------------------------
  C.challenges['hall.w4.ask'] = { title: T('{川留|かわど}め の {高札|こうさつ}', 'The river notice'), tiers: {
    F: [ch({ item: 'v:渡る', prompt: { en: 'You want to know where you may cross today. What do you ask?' },
      options: [o('きょう は 、 どこ で わたって も いい です か 。', 1), o('きょう は 、 どこ で ねて も いい です か 。', 0, 'That asks where you may sleep.'), o('きのう は 、 どこ で わたりました か 。', 0, 'That asks about yesterday.')] })],
    E: [ch({ item: 'g:v_temo_ii', prompt: { en: 'You want to know where you may cross the river today. What do you ask?' },
      options: [o('{今日|きょう} は 、 どこ で {川|かわ} を {渡|わた}って も いい です か 。', 1), o('{今日|きょう} は 、 {川|かわ} を {渡|わた}らなければ なりません か 。', 0, 'That asks whether you must cross.'), o('{今日|きょう} は 、 {川|かわ} の {水|みず} を {飲|の}んで も いい です か 。', 0, 'That asks whether you may drink the river.')] })],
    I: [ch({ item: 'g:v_temo_ii', prompt: { en: 'You want to know whether the notice says where crossing is allowed today. What do you ask?' },
      options: [o('{高札|こうさつ} に は 、 {今日|きょう} {渡|わた}って も いい {所|ところ} が {書|か}いて あります か 。', 1), o('{高札|こうさつ} を {渡|わた}って も いい です か 。', 0, 'That asks whether you may cross the notice board.'), o('{高札|こうさつ} は 、 {誰|だれ} が {書|か}いた ん です か 。', 0, 'That asks who wrote it.')] })],
    A: [ch({ item: 'g:keigo_kenjo', prompt: { en: 'Ask, politely, to be told where crossing is permitted today.' },
      options: [o('{恐|おそ}れ{入|い}ります が 、 {本日|ほんじつ} {渡|わた}る こと が {許|ゆる}されて いる {場所|ばしょ} を 、 {教|おし}えて いただけます か 。', 1), o('{本日|ほんじつ} は 、 {渡|わた}らせて いただきます 。', 0, 'That announces you will cross; it asks nothing.'), o('{高札|こうさつ} を お{読|よ}み に なって も よろしい です か 。', 0, 'お{読|よ}みになる is respectful, for someone else\'s reading; it cannot ask permission for your own.')] })],
  },
  stretchA: [ch({ item: 'g:v_temo_ii', ctx: { jp: '「 {本日|ほんじつ} 、 {橋|はし} の {通行|つうこう} を {禁|きん}ずる 。 {浅瀬|あさせ} に {限|かぎ}り 、 {渡|わた}る こと を {許|ゆる}す 。 」', en: '' }, prompt: { en: 'A notice of the old highways. How does it say "must not" and "may"?' },
    options: [e('禁ずる (forbids) and 許す (permits), the written words for いけない and いい; に限り narrows the permission to the ford alone.', 1), e('It forbids every crossing.', 0, 'The ford is allowed.'), e('It asks travellers politely to choose.', 0, 'A notice orders; it does not ask.')] })] };

  // ---- the riddle stone (a reprieve) -----------------------------------------------------------------------------------------
  C.challenges['hall.w4.riddle'] = { title: T('なぞなぞ の {石|いし}', 'The riddle stone'), tiers: {
    F: [ch({ item: 'v:傘', ctx: { jp: 'あめ の ひ に だけ 、 ひらく はな 、 なあに ？', en: '' }, prompt: { en: 'What is it?' },
      options: [o('かさ', 1), o('あさがお', 0, 'A morning glory opens in the morning, rain or shine.'), o('たんぽぽ', 0, 'A dandelion closes in the rain.')] })],
    E: [ch({ item: 'v:傘', ctx: { jp: '{晴|は}れた {日|ひ} は {閉|と}じて {休|やす}み 、 {雨|あめ} の {日|ひ} に {開|ひら}いて {働|はたら}く 。 {何|なん} だ ？', en: '' }, prompt: { en: 'What is it?' },
      options: [o('{傘|かさ}', 1), o('{窓|まど}', 0, 'A window is opened on fine days, not rainy ones.'), o('{戸|と}', 0, 'A door is closed in the rain.')] })],
    I: [ch({ item: 'v:傘', ctx: { jp: '{貸|か}して も 、 {返|かえ}って こない こと が {多|おお}い 。 {返|かえ}って こない と 、 {寂|さび}しくて {跳|は}ねる かも しれない 。 {何|なん} だ ？', en: '' }, prompt: { en: 'What is it?' },
      options: [o('{傘|かさ}', 1), o('{本|ほん}', 0, 'Books go unreturned too, but they do not hop.'), o('{鍵|かぎ}', 0, 'A key is seldom lent and never hops.')] })],
    A: [ch({ item: 'v:唐傘', ctx: { jp: '{骨|ほね} は ある が {肉|にく} は なく 、 {一本足|いっぽんあし} で {雨|あめ} を {凌|しの}ぐ 。 {年|とし} を {経|へ}れば {目|め} を {開|ひら}き 、 {舌|した} を {出|だ}す 。', en: '' }, prompt: { en: 'What is it?' },
      options: [o('{唐傘|からかさ}', 1), o('{案山子|かかし}', 0, 'A scarecrow stands on one leg, but keeps off crows, not rain.'), o('{提灯|ちょうちん}', 0, 'An old lantern may open its mouth in the tales, but it has no leg to stand on in the rain.')] })],
  },
  stretchA: [ch({ item: 'v:唐傘', ctx: { jp: '{年|とし} を {経|へ}れば {目|め} を {開|ひら}き 、 {舌|した} を {出|だ}す 。', en: '' }, prompt: { en: 'What old belief is the riddle\'s second half drawing on?' },
    options: [e('That a thing used for many years can come alive (the tsukumogami of folklore): the old umbrella opens one eye and sticks out its tongue, hopping on its single leg.', 1), e('That umbrellas are made of animals.', 0, 'It is the umbrella\'s age, not its making.'), e('That rain makes things grow eyes.', 0, 'Years, not rain, wake it.')] })] };

  // ---- t5: the reeds in the flood (conditions: rooted, in the rain) ----------------------------------------------------------
  C.encounters = C.encounters || {};
  const REED = { enemy: 'rw.reedling', name: say('{増水|ぞうすい} の {葦|あし}', 'Flood reed'), conditions: ['rooted'], knots: 2, music: 'battle_atlas' };
  C.encounters['hall.w4.reeds'] = {
    id: 'hall.w4.reeds', kind: 'battle', name: say('{増水|ぞうすい} の {葦|あし}', 'Reeds in the flood'),
    lead: Object.assign({}, REED, { knots: 3 }),
    group: { normal: [REED], hard: [REED, REED] },
    rules: { wait: true, conditions: true }, field: ['rain'],
  };

  // ---- t9: the umbrella at the gate (a conversation) --------------------------------------------------------------------------
  function task(item, en, ok, w1, why1, w2, why2) {
    const low = ch({ item, prompt: { en }, options: [{ jp: ok, ok: true }, { jp: w1, ok: false, why: { en: why1 } }] });
    const high = ch({ item, prompt: { en: en + ' (Read them closely: two are near.)' }, options: [{ jp: ok, ok: true }, { jp: w1, ok: false, why: { en: why1 } }, { jp: w2, ok: false, why: { en: why2 } }] });
    return { F: low, E: low, I: high, A: high };
  }
  C.encounters['hall.w4.kasa'] = {
    id: 'hall.w4.kasa', kind: 'social', name: say('{門|もん} の {唐傘|からかさ}', 'The umbrella at the gate'),
    rules: { wait: true },
    autoRoute: ['s:restate', 's:ask_why', 'wait', 's:explain'],
    social: {
      parties: [{ aid: 'n:kasa', name: say('{唐傘|からかさ}', 'The umbrella'), stance: 'closed', wants: { en: 'To know whether it was wanted back, without having to ask.' } }],
      claims: {
        nobody: { by: 'n:kasa', jp: '{僕|ぼく} は 、 もう {誰|だれ} の {傘|かさ} で も ない 。', en: '"I\'m nobody\'s umbrella any more."' },
        never: { by: 'n:kasa', jp: 'あの {人|ひと} は 、 {僕|ぼく} を {返|かえ}す つもり なんか なかった ん だ 。', en: '"He never meant to bring me back."' },
        river: { by: 'n:kasa', jp: '…… {一度|いちど} 、 {川|かわ} の {前|まえ} で 、 あの {人|ひと} が {泣|な}いて いる の を {見|み}た 。', en: '"…Once, I saw him crying, in front of the river."', hidden: true },
      },
      understanding: 2,
      gesture: { name: say('{雨|あめ} の {中|なか} に {並|なら}んで {立|た}つ', 'Stand beside it in the rain'), desc: 'Stand beside it, getting as wet as it is.', effect: { stance: { 'n:kasa': 'listening' } }, once: true, says: { en: 'You stand beside the umbrella in the rain. After a while it tilts, just a little, to keep the rain off you.' } },
      unravelTip: { en: 'Nothing is knotted. Listen for what it thinks was meant.' },
      actions: [
        { id: 'restate', kind: 'restate', label: say('{忘|わす}れられた と {思|おも}った ん だ ね 。', 'Say what it means'), once: true,
          task: task('g:n_desu', 'It says it is nobody\'s umbrella any more. Which says back what it means?', '{忘|わす}れられた と {思|おも}った ん だ ね 。', '{雨|あめ} が {嫌|きら}い な ん だ ね 。', 'An umbrella does not hate the rain.', '{寺|てら} に {帰|かえ}りたく なかった ん だ ね 。', 'It came to the temple by itself.'),
          effect: { understanding: 1, stance: { 'n:kasa': 'listening' } }, says: { en: 'The umbrella\'s one eye blinks. Its paper rustles, which may be a yes.' } },
        { id: 'ask_why', kind: 'ask', label: say('どうして 、 {返|かえ}す つもり が なかった と {思|おも}う の ？', 'Ask why it thinks so'), once: true, when: { stance: { 'n:kasa': 'listening' } },
          task: task('g:tsumori', 'Which asks why it thinks he never meant to return it?', 'どうして 、 {返|かえ}す つもり が なかった と {思|おも}う の ？', 'どうして 、 {返|かえ}す つもり だった の ？', 'That asks the umbrella about its own intention.', 'いつ 、 {返|かえ}して もらう つもり ？', 'That asks when it plans to be given back.'),
          effect: { reveal: 'river', understanding: 1 }, says: { en: '"He didn\'t come," the umbrella says. "A whole year. …Though once, I saw him at the river. He was crying."' } },
        { id: 'explain', kind: 'propose', label: say('{返|かえ}す つもり だった けど 、 {川|かわ} が {溢|あふ}れて 、 {来|こ}られなかった ん だ よ 。', 'Tell it what he meant, and what stopped him'), when: { claims: ['river'] },
          task: task('g:tsumori', 'Which tells it he meant to return it but could not come?', '{返|かえ}す つもり だった けど 、 {川|かわ} が {溢|あふ}れて 、 {来|こ}られなかった ん だ よ 。', '{返|かえ}す つもり は なかった けど 、 {来|き}た ん だ よ 。', 'That says he never meant to, the opposite.', '{返|かえ}した つもり だった ん だ よ 。', 'Close, but that says he believed he had already returned it.'),
          effect: { flag: 'understood' }, says: { en: 'The umbrella is quiet a long time. Then it opens, slowly, all the way, as if it had been holding its breath for a year.' } },
        { id: 'blunt', kind: 'propose', label: say('ただ の {傘|かさ} の くせ に 、 {文句|もんく} を {言|い}わない で 。', 'Tell it an umbrella has no say'), lasting: true, means: { en: 'You will tell it that a mere umbrella should not complain.' },
          task: task('g:v_naide_kudasai', 'Which tells it not to complain?', 'ただ の {傘|かさ} の くせ に 、 {文句|もんく} を {言|い}わない で 。', 'きれい な {傘|かさ} だ ね 。', 'That admires it.', '{雨|あめ} から {守|まも}って くれて 、 ありがとう 。', 'That thanks it.'),
          effect: { stance: { 'n:kasa': 'leaving' } }, says: { en: 'The umbrella snaps shut and hops away behind the gatepost, one leg, very fast.' } },
      ],
      responses: {
        water: { effect: { stance: { 'n:kasa': 'listening' } }, says: { en: 'You hold your hand out in the rain. The umbrella opens a little over it, out of habit, and then looks embarrassed.' } },
        unravel: { says: { en: 'Nothing here is knotted. Listen to what it thinks was meant.' } },
      },
      wait: { when: { stance: { 'n:kasa': 'listening' } }, effect: { reveal: 'river' }, says: { en: 'The umbrella says, to the rain more than to you, "I saw him once, at the river. He was crying."' } },
      drift: [{ when: { all: [{ rounds: 3 }, { stance: { 'n:kasa': 'closed' } }] }, once: true, effect: { stance: { 'n:kasa': 'listening' } }, says: { en: 'Down the approach, Gosaku calls out, hoarse from the road: "Is it here? Is it all right?" The umbrella turns its one eye toward the voice.' } }],
      companion: {
        nao: [{ id: 'nao_late', name: say('{遅|おく}れた {手紙|てがみ} の {話|はなし}', 'Talk about late letters'), desc: 'Nao, who carries letters, says something about lateness.', once: true, effect: { understanding: 1, stance: { 'n:kasa': 'listening' } }, says: { en: 'Nao: "A late letter is still a letter, once it arrives. Late isn\'t never." The umbrella\'s eye turns to Nao.' } }],
        mio: [{ id: 'mio_mend', name: say('{骨|ほね} を {直|なお}す', 'Mend its rib'), desc: 'Mio mends a bent rib.', once: true, effect: { stance: { 'n:kasa': 'listening' } }, says: { en: 'Mio straightens a bent rib with careful fingers. "There. A year of hopping is hard on the bones." The umbrella lets her.' } }],
        ren: [{ id: 'ren_dry', name: say('{灯|ひ} で {乾|かわ}かす', 'Dry it by the lamp'), desc: 'Ren holds the lamp near to dry its paper.', once: true, effect: { understanding: 1, stance: { 'n:kasa': 'listening' } }, says: { en: 'Ren holds the lamp close, and the oiled paper steams and warms. "Things kept for a long time deserve care," Ren says.' } }],
        suzu: [{ id: 'suzu_prop', name: say('{小道具|こどうぐ} の {話|はなし}', 'Talk about stage props'), desc: 'Suzu talks about props waiting in the wings.', once: true, effect: { understanding: 1, stance: { 'n:kasa': 'listening' } }, says: { en: 'Suzu: "Every prop in the troupe\'s trunk waits for its scene. Nobody forgets a good umbrella." The umbrella stands a little taller.' } }],
      },
    },
    conclusions: [
      { id: 'ran', when: { left: 'n:kasa' }, result: 'end', text: { en: 'The umbrella has hopped away behind the gatepost. It will come back out; you can try again.' } },
      { id: 'understood', when: { flag: 'understood' }, result: 'win', text: { en: 'The umbrella opens all the way and hops up the approach to wait on the veranda.' } },
    ],
  };

  // ---- t10: the umbrella returned (the capstone) ----------------------------------------------------------------------------
  function hear(item, fJp, jp, en, ok, w1, why1, w2, why2) {
    const opts = (two) => [{ en: ok, ok: true }, { en: w1, ok: false, why: { en: why1 } }].concat(two ? [{ en: w2, ok: false, why: { en: why2 } }] : []);
    return { F: ch({ item, ctx: { jp: fJp, en: '' }, prompt: { en }, options: opts(false) }), E: ch({ item, ctx: { jp, en: '' }, prompt: { en }, options: opts(false) }), I: ch({ item, ctx: { jp, en: '' }, prompt: { en }, options: opts(true) }), A: ch({ item, ctx: { jp, en: '' }, prompt: { en }, options: opts(true) }) };
  }
  const A = (id, jp, en, more) => Object.assign({ id, label: { jp, en } }, more);
  const vals = (x) => { const out = {}; for (const k in x) out[k] = { jp: x[k][0], en: x[k][1] }; return out; };
  const KASA = vals({ gate: ['{門|もん} の {外|そと}', 'outside the gate'], sorry: ['{謝|あやま}った', 'apologised for'], held: ['{差|さ}し{出|だ}した', 'held out'], returned: ['{返|かえ}した', 'returned'], lent: ['また {借|か}りた', 'borrowed again'] });
  C.encounters['hall.w4.return'] = {
    id: 'hall.w4.return', kind: 'procedure', name: say('{傘|かさ} を {返|かえ}す', 'The umbrella returned'),
    rules: { wait: true },
    procedure: {
      id: 'hall_w4_return', version: 1, restart: 'stable',
      machine: { kasa: 'gate' },
      show: [{ key: 'kasa', label: say('{傘|かさ}', 'The umbrella'), values: KASA }],
      done: { en: 'The umbrella is returned, and lent again: it goes home with Gosaku, and will come back each rainy season.' },
      steps: [
        { id: 'r1', stable: true, text: say('ゴサク ： 「 {最初|さいしょ} に 、 {謝|あやま}らなければ ならない 。 {何|なん} と {言|い}おう 。 」', 'Gosaku: "First I have to apologise. What do I say?"'),
          task: hear('g:v_nakereba', 'ゴサク ： 「 さいしょ に 、 あやまらなければ ならない 。 」', 'ゴサク ： 「 {最初|さいしょ} に 、 {謝|あやま}らなければ ならない 。 {何|なん} と {言|い}おう 。 」', 'What does Gosaku say he must do first?',
            'Apologise.', 'Give back the umbrella.', 'He says the apology comes first.', 'Ask to borrow it again.', 'That comes last.'),
          actions: [
            A('sorry', '{遅|おそ}く なって 、 {申|もう}し{訳|わけ} ありません 。', '"I am so sorry to be this late."', { ok: true, set: { kasa: 'sorry' }, means: { en: 'Gosaku bows and apologises for the year.' }, result: { en: 'Myōshin looks at him for a long moment, and then at the umbrella beside him.' } }),
            A('late_ok', '{遅|おそ}く なって も 、 {構|かま}いません か 。', '"Do you mind if I am late?"', { means: { en: 'Gosaku asks whether lateness is all right.' }, wrong: { en: 'Myōshin\'s brows rise. "You are already a year late," she says, not unkindly. "Begin with sorry."' } }),
          ] },
        { id: 'r2', stable: true, text: say('ミョウシン ： 「 {一年|いちねん} 、 {待|ま}って いました よ 。 {傘|かさ} も 、 わたし も 。 」', 'Myōshin: "I waited a year. The umbrella and I both."'),
          task: hear('g:indirectness', 'ミョウシン ： 「 いちねん 、 まって いました よ 。 かさ も 、 わたし も 。 」', 'ミョウシン ： 「 {一年|いちねん} 、 {待|ま}って いました よ 。 {傘|かさ} も 、 わたし も 。 」', 'Is she angry?',
            'No: she says, kindly, that they both waited.', 'Yes: she wants it back at once.', 'She says they waited; there is no anger in it.', 'She has forgotten Gosaku.', 'She remembers exactly how long.'),
          actions: [
            A('bow', '{深|ふか}く {頭|あたま} を {下|さ}げる', 'Bow deeply', { ok: true, means: { en: 'Gosaku bows again, lower.' }, result: { en: '"Lift your head," Myōshin says. "The river is nobody\'s fault."' } }),
            A('excuse', '「 {川|かわ} の せい です 」 と {言|い}い{返|かえ}す', 'Answer back: "It was the river\'s fault."', { means: { en: 'Gosaku blames the river.' }, wrong: { en: '"It was," Myōshin says. "I know. But that is not what you came all this way to say."' } }),
          ] },
        { id: 'r3', stable: true, text: say('ゴサク は 、 {傘|かさ} を {両手|りょうて} で {差|さ}し{出|だ}した 。', 'Gosaku holds the umbrella out with both hands.'),
          task: hear('g:keigo_kenjo', 'ゴサク は 、 かさ を りょうて で さしだした 。', 'ゴサク は 、 {傘|かさ} を {両手|りょうて} で {差|さ}し{出|だ}した 。', 'What is Gosaku doing?',
            'Holding the umbrella out to her with both hands.', 'Opening the umbrella.', 'さしだす: to hold out, to offer.', 'Hiding the umbrella.', 'He holds it out to her.'),
          actions: [
            A('return', '{傘|かさ} を お{返|かえ}し して も よろしい でしょう か 。', '"May I return your umbrella?"', { ok: true, set: { kasa: 'returned' }, means: { en: 'Gosaku asks, humbly, to give it back.' }, result: { en: 'Myōshin takes the umbrella in both hands. "Welcome home," she says, and nobody is sure which of them she means.' } }),
            A('give_back', '{傘|かさ} を {返|かえ}して ください 。', '"Please return the umbrella."', { means: { en: 'Gosaku asks her to return it.' }, wrong: { en: 'Myōshin tilts her head. "I am to return it to you? I think you have that the wrong way round."' } }),
          ] },
        { id: 'r4', stable: true, text: say('ミョウシン ： 「 まだ 、 {雨|あめ} が {降|ふ}って います ね 。 」', 'Myōshin: "It\'s still raining, isn\'t it."'),
          task: hear('g:indirectness', 'ミョウシン ： 「 まだ 、 あめ が ふって います ね 。 」', 'ミョウシン ： 「 まだ 、 {雨|あめ} が {降|ふ}って います ね 。 」', 'What might she mean by it?',
            'That he will need an umbrella on the way home.', 'That he should stay out in the rain.', 'She says it gently, looking at the umbrella.', 'That the umbrella is broken.', 'Nothing is wrong with it.'),
          actions: [
            A('again', 'もう {一度|いちど} 、 {貸|か}して いただけません か 。', '"Might I borrow it once more?"', { ok: true, set: { kasa: 'lent' }, means: { en: 'Gosaku asks to borrow it again.' }, result: { en: 'Myōshin smiles. "That is what I hoped you would ask." The umbrella opens over Gosaku by itself.' } }),
            A('offer', 'もう {一度|いちど} 、 {貸|か}して あげましょう か 。', '"Shall I lend it to you once more?"', { means: { en: 'Gosaku offers to lend it to her.' }, wrong: { en: 'Myōshin laughs. "It is mine to lend, I think."' } }),
          ] },
      ],
    },
    conclusions: [{ id: 'done', when: { proc: 'done' }, result: 'win', text: { en: 'The umbrella is home, and lent again.' } }],
  };
})(RB.content);
