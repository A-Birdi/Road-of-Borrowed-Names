/* The Hall of a Hundred Tales, wing 8, Three Witnesses at the Inn: the language tasks and encounters (expansion P15;
 * plan 04_DUNGEONS.md D9; scenes in 34_w8_scenes.js). The theme: whose account? (what was seen, heard, told or
 * guessed: ～そうだ for looks and for hearsay, ～らしい, ～ようだ and ～みたいだ, ～はずだ, ～かもしれない, ～でしょう;
 * at Advanced ～に違いない and ～とのことだ). Every task has its four levels and an Advanced stretch.
 *   hall.w8.story      the tale's four written passages, back in order (A38)
 *   hall.w8.story_q    how each witness knew, and how sure they were (optional)
 *   hall.w8.counter0/1 the sayings on the inn's scrolls: the one that breaks the rule (A34)
 *   hall.w8.ask        asking your companion where Hisa's note says they went (A12)
 *   hall.w8.riddle     the riddle stone (a reprieve)
 *   encounters: hall.w8.fox (the snow fox: wet), hall.w8.quarrel (Saki and Gonroku: a mediation), hall.w8.record (the
 *   record of the night: the capstone procedure). */
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
  const P1 = '{雪|ゆき} の {夜|よる} 、 {峠|とうげ} の {宿|やど} から 、 {預|あず}かり{物|もの} の {箱|はこ} が {消|き}えた',
    P2 = '{女中|じょちゅう} は 「 {影|かげ} を {見|み}た 」 と {言|い}い 、 {行商人|ぎょうしょうにん} は 「 {足音|あしおと} が {聞|き}こえた 」 と {言|い}った',
    P3 = '{年寄|としよ}り の {客|きゃく} は 「 {狐|きつね} の {仕業|しわざ} らしい 」 と {言|い}った',
    P4 = '{三人|さんにん} の {話|はなし} を {合|あ}わせる と 、 {小|ちい}さな {足跡|あしあと} が {一|ひと}つ {見|み}えて きた';
  C.hallW8Tale = { P1, P2, P3, P4 };
  const FT = ['ゆき の よる 、 やど から はこ が きえた', 'じょちゅう は 「 かげ を みた 」 、 しょうにん は 「 あしおと が きこえた 」 と いった',
    'としより の きゃく は 「 きつね の せい らしい 」 と いった', 'みんな の はなし を あわせる と 、 ちいさい あしあと が みえて きた'];
  C.hallW8TaleF = FT;
  C.challenges['hall.w8.story'] = { title: T('{宿|やど} の {三人|さんにん} の {証人|しょうにん}', 'Three Witnesses at the Inn'), tiers: {
    F: [OR({ item: 'v:宿', prompt: { en: 'Arrange the four written passages to retell the scroll\'s story.' }, tiles: [FT[2], FT[0], FT[3], FT[1]], answer: FT,
      orderHint: { en: 'The box gone; what two people saw and heard; what the old guest guessed; and what all of it together showed.' } })],
    E: [OR({ item: 'v:足跡', prompt: { en: 'Arrange the four passages in the tale\'s order.' }, tiles: [P3, P1, P4, P2], answer: [P1, P2, P3, P4],
      orderHint: { en: 'First the loss, then the two who saw and heard, then the one who guessed, then the accounts put together.' } })],
    I: [OR({ item: 'g:rashii', prompt: { en: 'Order the passages so that each follows from the one before.' }, tiles: [P4, P2, P1, P3], answer: [P1, P2, P3, P4],
      orderHint: { en: 'What was seen and heard comes before the rumour (らしい); only when the three are laid side by side does the answer show.' } })],
    A: [OR({ item: 'g:ni_chigainai', prompt: { en: 'Order the passages; the turn is the one where the accounts are put together.' }, tiles: [P2, P4, P3, P1], answer: [P1, P2, P3, P4],
      orderHint: { en: 'No single witness had it; 合わせると, putting them together, is the turn.' } })],
  },
  stretchA: [ch({ item: 'g:ni_chigainai', ctx: { jp: P3 + ' 。 ／ 「 {狐|きつね} の {仕業|しわざ} に {違|ちが}いない 」', en: '' }, prompt: { en: 'The old guest said らしい. What would に違いない change?' },
    options: [e('らしい passes on a rumour or a guess and keeps a distance from it; に違いない claims near-certainty, which nothing he saw or heard supports.', 1),
      e('Nothing: both mean "perhaps".', 0, 'に違いない is close to "it must be".'),
      e('に違いない would mean he saw the fox.', 0, 'It claims certainty; it says nothing of seeing.')] })] };
  C.challenges['hall.w8.story_q'] = { title: T('{話|はなし} の {後|あと} で', 'After the tale'), optional: true, tiers: {
    F: [ch({ item: 'v:箱', ctx: { jp: FT[0] + ' 。', en: '' }, prompt: { en: 'What went missing?' },
      options: [e('A box left at the inn.', 1), e('A traveller.', 0, 'はこ: a box.'), e('The snow.', 0, 'It was a snowy night; a box went missing.')] })],
    E: [ch({ item: 'v:足音', ctx: { jp: P2 + ' 。', en: '' }, prompt: { en: 'How did the maid and the pedlar each know?' },
      options: [e('The maid saw a shadow; the pedlar heard footsteps.', 1), e('Both saw the thief.', 0, 'One saw a shadow, the other only heard.'), e('Both were told by the old guest.', 0, '見た and 聞こえた: their own eyes and ears.')] })],
    I: [ch({ item: 'g:rashii', ctx: { jp: P3 + ' 。', en: '' }, prompt: { en: 'How sure is the old guest?' },
      options: [e('Not sure at all: らしい, he is going on rumour.', 1), e('Certain: he saw the fox.', 0, 'らしい is a guess or a rumour.'), e('He is sure it was the maid.', 0, 'He blames a fox.')] })],
    A: [ch({ item: 'g:ni_chigainai', ctx: { jp: P2 + ' 。 ' + P3 + ' 。 ' + P4 + ' 。', en: '' }, prompt: { en: 'What is the tale suggesting?' },
      options: [e('That no single account was the truth, but each held a piece: sorting what was seen from what was heard and what was guessed is what found it.', 1), e('That witnesses always lie.', 0, 'Each told what they knew, in their own way.'), e('That the fox did it.', 0, 'The fox was only a rumour.')] })],
  } };

  // ---- the sayings on the inn's scrolls: the one that breaks the rule (A34) -----------------------------------------------
  // F: かもしれない and でしょう are not certainty (たぶん and かならず pull against each other). E: the "looks" そう cannot
  // follow a noun; after you know, you do not say it looks. I: ようだ, はずだ and らしい need evidence from outside; you do
  // not infer your own name. A: に違いない cannot sit beside "not sure"; とのことだ passes on what someone else said.
  C.hallW8Cards = {};
  function counter(F, E, I, A, pat) {
    C.hallW8Cards[pat] = { F, E, I, A };
    const mk = (item, list, prompt) => ch({ item, ctx: { jp: list.map((x, i) => (i + 1) + ' 、 ' + x[0]).join(' ／ '), en: '' }, prompt: { en: prompt }, options: list.map((x, i) => o(String(i + 1) + ' 、 ' + x[0], x[1], x[2])) });
    return {
      F: [mk('g:kamo', F, 'Three sayings say how sure they are in a way that holds together. Which one breaks the rule?')],
      E: [mk('g:sou_look', E, 'Three sayings use そう ("looks" and "I hear") correctly. Which one breaks the rule?')],
      I: [mk('g:you_mitai', I, 'Three sayings use ようだ, はずだ and らしい the way they work. Which one breaks the rule?')],
      A: [mk('g:ni_chigainai', A, 'Three sayings use に違いない and とのことだ correctly. Which is the counterexample?')],
    };
  }
  const C0 = counter(
    [['あした は あめ かも しれない', 0, 'Correct.'], ['あの ひと は せんせい でしょう', 0, 'Correct.'], ['たぶん 、 かならず くる', 1, 'たぶん (probably) and かならず (certainly) pull against each other: たぶん くる でしょう.'], ['くも が くろい から 、 あめ が ふる かも しれない', 0, 'Correct.']],
    [['この ケーキ は おいし そう だ', 0, 'Looks delicious: correct.'], ['{雨|あめ} が {降|ふ}り そう だ', 0, 'Looks like rain: correct.'], ['{先生|せんせい} そう だ', 1, 'The "looks" そう cannot follow a noun: {先生|せんせい} の よう だ (or {先生|せんせい} らしい).'], ['{明日|あした} は {雨|あめ} だ そう だ', 0, 'Hearsay after だ: correct.']],
    [['{電気|でんき} が {消|き}えて いる 。 {留守|るす} の よう だ', 0, 'Inference from what you see: correct.'], ['{三時|さんじ} に {出|で}た から 、 もう {着|つ}いた はず だ', 0, 'Correct.'], ['{窓|まど} の {外|そと} が {濡|ぬ}れて いる 。 {雨|あめ} が {降|ふ}った らしい', 0, 'Correct.'], ['{食|た}べて みたら 、 おいし そう だった', 1, 'After tasting, you know: おいしかった. そう is for how a thing looks before you know.']],
    [['この {足跡|あしあと} は 、 {子供|こども} の もの に {違|ちが}いない', 0, 'Correct.'], ['{手紙|てがみ} に よる と 、 {来週|らいしゅう} {着|つ}く と の こと だ', 0, 'Correct.'], ['{確|たし}か で は ない が 、 {犯人|はんにん} は {彼|かれ} に {違|ちが}いない', 1, 'The counterexample: に違いない is near-certainty, and "it isn\'t certain" contradicts it: {彼|かれ} かも しれない.'], ['{噂|うわさ} に よる と 、 {狐|きつね} が {出|で}る らしい', 0, 'Correct.']], 0);
  const C1 = counter(
    [['かぜ を ひいた かも しれない', 0, 'Correct.'], ['あした は はれる でしょう', 0, 'Correct.'], ['きっと 、 たぶん くる', 1, 'きっと (surely) and たぶん (probably) pull against each other; one is enough: きっと くる.'], ['そら が あかい から 、 あした は はれる でしょう', 0, 'Correct.']],
    [['{今|いま} に も {泣|な}き そう な {顔|かお}', 0, 'Correct.'], ['{田舎|いなか} は {静|しず}か だ そう だ', 0, 'Hearsay after だ: correct.'], ['（ {表紙|ひょうし} を {見|み}て ） この {本|ほん} は {面白|おもしろ}い そう だ', 1, 'Looking at the cover, you judge by appearance: {面白|おもしろ}そう だ. {面白|おもしろ}い そう だ means someone told you so.'], ['{午後|ごご} から {晴|は}れる そう だ', 0, 'Correct.']],
    [['{誰|だれ} も いない みたい だ', 0, 'Correct.'], ['{鍵|かぎ} は {机|つくえ} の {上|うえ} に ある はず だ', 0, 'Correct.'], ['{彼|かれ} は {来|こ}ない らしい', 0, 'Correct.'], ['{私|わたし} の {名前|なまえ} は 、 {田中|たなか} らしい', 1, 'You know your own name; らしい is for what you gather from outside: {私|わたし} の {名前|なまえ} は {田中|たなか} です.']],
    [['{宿|やど} の {者|もの} に よる と 、 {明日|あした} は {雪|ゆき} と の こと だ', 0, 'Correct.'], ['これ だけ {証拠|しょうこ} が あれば 、 {彼|かれ} に {違|ちが}いない', 0, 'Correct.'], ['{医者|いしゃ} の {話|はなし} で は 、 {一週間|いっしゅうかん} で {治|なお}る と の こと だ', 0, 'Correct.'], ['{私|わたし} は {昨日|きのう} 、 {熱|ねつ} が あった と の こと だ', 1, 'The counterexample: とのことだ passes on what someone else said, and you know your own fever at first hand: {昨日|きのう} 、 {熱|ねつ} が あった.']], 1);
  const cardStretch = [ch({ item: 'g:to_no_koto', ctx: { jp: '{明日|あした} は {雪|ゆき} だ そう だ 。 ／ {宿|やど} の {者|もの} に よる と 、 {明日|あした} は {雪|ゆき} と の こと だ 。', en: '' }, prompt: { en: 'Both pass on what someone said. What does the second add?' },
    options: [e('It names the source (によると) and passes the news on formally (とのことだ), as in a letter or a report; そうだ is the everyday way.', 1), e('The second is the speaker\'s own guess.', 0, 'Both report what someone else said.'), e('The second is more certain.', 0, 'It is more formal, not more certain.')] })];
  C.challenges['hall.w8.counter0'] = { title: T('{宿|やど} の {掛|か}け{軸|じく}', 'The inn\'s scrolls'), tiers: C0, stretchA: cardStretch };
  C.challenges['hall.w8.counter1'] = { title: T('{宿|やど} の {掛|か}け{軸|じく}', 'The inn\'s scrolls'), tiers: C1, stretchA: cardStretch };

  // ---- asking where Hisa's note says they went (A12) ---------------------------------------------------------------------
  C.challenges['hall.w8.ask'] = { title: T('ヒサ の {書|か}き{置|お}き', 'Hisa\'s note'), tiers: {
    F: [ch({ item: 'g:sou_hear', prompt: { en: 'You want to know where Hisa went, from the note. What do you ask?' },
      options: [o('ヒサ は 、 どこ へ いきました か 。', 1), o('ヒサ は 、 なに を たべました か 。', 0, 'That asks what Hisa ate.'), o('はこ は 、 いくら です か 。', 0, 'That asks what the box cost.')] })],
    E: [ch({ item: 'g:sou_hear', prompt: { en: 'You want to know where, by the note, Hisa went. What do you ask?' },
      options: [o('{書|か}き{置|お}き に よる と 、 ヒサ は どこ へ {行|い}った ん です か 。', 1), o('{書|か}き{置|お}き は 、 いつ {見|み}つけた ん です か 。', 0, 'That asks when the note was found.'), o('ヒサ は 、 {何時|なんじ} に {寝|ね}た ん です か 。', 0, 'That asks when Hisa went to bed.')] })],
    I: [ch({ item: 'g:you_mitai', prompt: { en: 'You want to know whether the note says where Hisa took the box. What do you ask?' },
      options: [o('ヒサ が {箱|はこ} を {持|も}って {行|い}った {先|さき} は 、 {書|か}き{置|お}き に {書|か}いて あります か 。', 1), o('ヒサ は 、 {箱|はこ} を {盗|ぬす}んだ ん です か 。', 0, 'That accuses Hisa of stealing it.'), o('{書|か}き{置|お}き の {字|じ} は 、 {上手|じょうず} です か 。', 0, 'That asks whether the handwriting is good.')] })],
    A: [ch({ item: 'g:keigo_kenjo', prompt: { en: 'Ask, politely, how the note gives Hisa\'s destination.' },
      options: [o('{恐|おそ}れ{入|い}ります が 、 {書|か}き{置|お}き に は 、 ヒサ さん の {行|ゆ}き{先|さき} が どう {書|か}かれて いる か 、 お{教|おし}え いただけます か 。', 1), o('{書|か}き{置|お}き を 、 {拝借|はいしゃく} して も よろしい でしょう か 。', 0, 'That asks to borrow the note.'), o('ヒサ さん は 、 {必|かなら}ず {戻|もど}られる に {違|ちが}いありません 。', 0, 'That reassures; it asks nothing.')] })],
  },
  stretchA: [ch({ item: 'g:ni_chigainai', ctx: { jp: '{茶屋|ちゃや} の {灯|ひ} が {一晩中|ひとばんじゅう} {点|つ}いて いた から 、 {持|も}ち{主|ぬし} は {峠|とうげ} の {茶屋|ちゃや} に いる に {違|ちが}いない 。', en: '' }, prompt: { en: 'How sure is Hisa, and on what?' },
    options: [e('Very sure (に違いない), from what they saw: the teahouse light burning all night.', 1), e('Not sure at all: に違いない is a guess.', 0, 'に違いない is close to certainty.'), e('Sure, because someone told them.', 0, 'The reason given is the light they saw.')] })] };

  // ---- the riddle stone (a reprieve) -----------------------------------------------------------------------------------------
  C.challenges['hall.w8.riddle'] = { title: T('なぞなぞ の {石|いし}', 'The riddle stone'), tiers: {
    F: [ch({ item: 'g:you_mitai', ctx: { jp: 'みえない けど 、 いる の が わかる 。 き の は を ゆらす もの 、 なあに ？', en: '' }, prompt: { en: 'What is it?' },
      options: [o('かぜ', 1), o('とり', 0, 'A bird can be seen.'), o('ひと', 0, 'People can be seen.')] })],
    E: [ch({ item: 'v:足跡', ctx: { jp: '{姿|すがた} は {見|み}えない が 、 {雪|ゆき} の {上|うえ} に {印|しるし} を {残|のこ}して いく 。 {朝|あさ} {見|み}る と 、 {誰|だれ} が {来|き}た か {分|わ}かる 。 {何|なん} だ ？', en: '' }, prompt: { en: 'What is it?' },
      options: [o('{足跡|あしあと}', 1), o('{影|かげ}', 0, 'A shadow leaves nothing on the snow.'), o('{声|こえ}', 0, 'A voice leaves no mark.')] })],
    I: [ch({ item: 'g:rashii', ctx: { jp: '{見|み}た {人|ひと} は いない のに 、 {誰|だれ} もが {知|し}って いる 。 {話|はな}す {人|ひと} が {変|か}わる たび に 、 {少|すこ}し ずつ {大|おお}きく なる 。 {何|なん} だ ？', en: '' }, prompt: { en: 'What is it?' },
      options: [o('{噂|うわさ}', 1), o('{雪|ゆき}だるま', 0, 'A snowman grows by rolling, and everyone can see it.'), o('{子供|こども}', 0, 'Children grow, but someone has always seen them.')] })],
    A: [ch({ item: 'g:to_no_koto', ctx: { jp: '{口|くち} から {口|くち} へ と {渡|わた}る うち に 、 {尾|お} が {付|つ}き {鰭|ひれ} が {付|つ}く 。 さて 、 {何|なに} か 。', en: '' }, prompt: { en: 'What is it?' },
      options: [o('{噂話|うわさばなし}', 1), o('{魚|さかな}', 0, 'A fish has its tail and fins from the start.'), o('{凧|たこ}', 0, 'A kite\'s tail is tied on by hand.')] })],
  },
  stretchA: [ch({ item: 'g:to_no_koto', ctx: { jp: '{尾|お} が {付|つ}き {鰭|ひれ} が {付|つ}く 。', en: '' }, prompt: { en: 'What does 尾ひれが付く mean, said of a story?' },
    options: [e('That it gets exaggerated as it is passed on, gaining details nobody saw: exactly what a rumour of a fox does.', 1), e('That it becomes a fish story about the sea.', 0, 'The tail and fins are a figure for additions.'), e('That it gets shorter.', 0, 'It gains things, not loses them.')] })] };

  // ---- t5: the snow fox (wet) ---------------------------------------------------------------------------------------------------
  C.encounters = C.encounters || {};
  const FOX = { enemy: 'sb.fox', name: say('{雪|ゆき} の {狐|きつね}', 'Snow fox'), conditions: ['wet'], knots: 2, music: 'battle_atlas' };
  C.encounters['hall.w8.fox'] = {
    id: 'hall.w8.fox', kind: 'battle', name: say('{雪|ゆき} の {狐|きつね}', 'The snow fox'),
    lead: Object.assign({}, FOX, { knots: 3 }),
    group: { normal: [FOX], hard: [FOX, FOX] },
    rules: { wait: true, conditions: true },
  };

  // ---- t9: Saki and Gonroku (a mediation) ------------------------------------------------------------------------------------
  function task(item, en, ok, w1, why1, w2, why2) {
    const low = ch({ item, prompt: { en }, options: [{ jp: ok, ok: true }, { jp: w1, ok: false, why: { en: why1 } }] });
    const high = ch({ item, prompt: { en: en + ' (Read them closely: two are near.)' }, options: [{ jp: ok, ok: true }, { jp: w1, ok: false, why: { en: why1 } }, { jp: w2, ok: false, why: { en: why2 } }] });
    return { F: low, E: low, I: high, A: high };
  }
  C.encounters['hall.w8.quarrel'] = {
    id: 'hall.w8.quarrel', kind: 'social', name: say('サキ と ゴンロク', 'Saki and Gonroku'),
    rules: { wait: true },
    autoRoute: ['s:calm', 's:size', 'wait', 's:child'],
    social: {
      parties: [
        { aid: 'n:saki', name: say('サキ', 'Saki'), stance: 'heated', wants: { en: 'To be believed: she saw what she saw, and it was no fox.' } },
        { aid: 'n:gonroku', name: say('ゴンロク', 'Gonroku'), stance: 'heated', wants: { en: 'For everyone to agree it was a fox, as it always has been in the stories.' } },
      ],
      claims: {
        saw: { by: 'n:saki', jp: '{確|たし}か に {影|かげ} を {見|み}ました 。 {狐|きつね} なんか じゃ ありません 。', en: 'Saki: "I did see a shadow. It was no fox."' },
        fox: { by: 'n:gonroku', jp: '{狐|きつね} に {決|き}まって おる 。 {村|むら} の {者|もの} も 、 {皆|みな} そう {言|い}って おる 。', en: 'Gonroku: "A fox, for certain. Everyone in the village says so."' },
        size: { by: 'n:saki', jp: '…… {影|かげ} は 、 {小|ちい}さかった ん です 。 {子供|こども} くらい の 。 {言|い}う と 、 {笑|わら}われる と {思|おも}って 。', en: 'Saki: "…The shadow was small. About the size of a child. I thought I\'d be laughed at if I said so."', hidden: true },
      },
      understanding: 3,
      gesture: { name: say('{二人|ふたり} に お{茶|ちゃ} を {注|つ}ぐ', 'Pour them both some tea'), desc: 'Pour each of them a cup from the kettle on the brazier.', effect: { stance: { 'n:saki': 'listening', 'n:gonroku': 'listening' } }, once: true, says: { en: 'You pour two cups. Holding something warm, they both stop talking for a moment.' } },
      unravelTip: { en: 'Nothing is knotted. What is tangled is what was seen and what was only said.' },
      actions: [
        { id: 'calm', kind: 'restate', label: say('サキ さん は {見|み}た こと を 、 ゴンロク さん は {聞|き}いた {話|はなし} を {言|い}って いる ん です ね 。', 'Say back how each of them knows'),
          task: task('g:sou_hear', 'Which says back how each of them knows?', 'サキ さん は {見|み}た こと を 、 ゴンロク さん は {聞|き}いた {話|はなし} を {言|い}って いる ん です ね 。', 'お{二人|ふたり} と も 、 {狐|きつね} を {見|み}た ん です ね 。', 'Neither of them saw a fox.', 'お{二人|ふたり} と も 、 {何|なに} も {見|み}て いない ん です ね 。', 'Saki did see something.'),
          cases: [{ when: { stance: { 'n:saki': 'heated' } }, effect: { stance: { 'n:saki': 'listening' } }, says: { en: 'Saki\'s shoulders come down. "Yes. I saw it. With my own eyes."' } },
            { when: { stance: { 'n:gonroku': 'heated' } }, effect: { stance: { 'n:gonroku': 'listening' } }, says: { en: 'Gonroku clears his throat. "…Well. I didn\'t see it myself, as such."' } }],
          says: { en: 'They are already listening.' } },
        { id: 'size', kind: 'ask', label: say('{影|かげ} は 、 どの くらい の {大|おお}きさ でした か 。', 'Ask how big the shadow was'), once: true, when: { stance: { 'n:saki': 'listening' } },
          task: task('g:you_mitai', 'Which asks how big the shadow was?', '{影|かげ} は 、 どの くらい の {大|おお}きさ でした か 。', '{影|かげ} は 、 {何色|なにいろ} でした か 。', 'A shadow has no colour to speak of; its size is what tells.', '{狐|きつね} は 、 {何匹|なんびき} いました か 。', 'That assumes there were foxes.'),
          effect: { reveal: 'size', understanding: 1 }, says: { en: 'Saki hesitates. "…Small. About the size of a child. I didn\'t say, in case you all laughed."' } },
        { id: 'child', kind: 'propose', label: say('{子供|こども} くらい の {影|かげ} なら 、 {狐|きつね} で は なく 、 ヒサ だった の かも しれません ね 。', 'Propose that the shadow may have been Hisa'), when: { claims: ['size'] },
          task: task('g:kamo', 'Which suggests, without claiming certainty, that it may have been Hisa?', '{子供|こども} くらい の {影|かげ} なら 、 {狐|きつね} で は なく 、 ヒサ だった の かも しれません ね 。', '{影|かげ} は 、 ヒサ に {違|ちが}いありません 。 ヒサ が {盗|ぬす}んだ ん です 。', 'That claims certainty, and accuses.', '{影|かげ} は 、 {狐|きつね} だった そう です 。', 'That repeats the rumour.'),
          effect: { flag: 'agreed' }, says: { en: 'Gonroku is quiet, then laughs at himself. "A child, not a fox. I suppose the stories don\'t know everything." Saki smiles at last.' } },
        { id: 'blunt', kind: 'propose', label: say('{見|み}て も いない こと を 、 {言|い}わない で ください 。', 'Tell Gonroku not to talk about what he didn\'t see'), lasting: true, means: { en: 'You will tell Gonroku to stop talking about things he never saw.' },
          task: task('v:噂', 'Which tells him not to talk about what he didn\'t see?', '{見|み}て も いない こと を 、 {言|い}わない で ください 。', 'もう {少|すこ}し 、 {話|はなし} を {聞|き}かせて ください 。', 'That invites him to say more.', 'お{茶|ちゃ} が {入|はい}りました よ 。', 'That offers tea.'),
          effect: { stance: { 'n:gonroku': 'leaving' } }, says: { en: 'Gonroku goes red. "In my day the young listened to their elders," he says, and stalks off to his room.' } },
      ],
      responses: {
        water: { effect: { stance: { 'n:gonroku': 'listening' } }, says: { en: 'You top up Gonroku\'s cup. He grunts his thanks.' } },
        unravel: { says: { en: 'Nothing here is knotted. Sort what was seen from what was said.' } },
      },
      wait: { when: { stance: { 'n:saki': 'listening' } }, effect: { reveal: 'size' }, says: { en: 'Saki says, mostly to herself, "It was so small, though."' } },
      drift: [{ when: { all: [{ rounds: 3 }, { stance: { 'n:gonroku': 'heated' } }] }, once: true, effect: { stance: { 'n:saki': 'listening', 'n:gonroku': 'listening' } }, says: { en: 'Omatsu sets down the morning rice between them. "Eat first. Quarrel after." Neither of them can argue with that.' } }],
      companion: {
        nao: [{ id: 'nao_post', name: say('{伝言|でんごん} の {話|はなし}', 'How messages change'), desc: 'Nao, who has carried messages through many mouths, says what happens to them.', once: true, effect: { understanding: 1, stance: { 'n:gonroku': 'listening' } }, says: { en: 'Nao: "A message that passes through three mouths arrives as three messages. That\'s why I carry them written." Gonroku looks at his hands.' } }],
        mio: [{ id: 'mio_symptom', name: say('{症状|しょうじょう} と {噂|うわさ}', 'Symptoms and rumours'), desc: 'Mio explains how a healer weighs what she sees against what she is told.', once: true, effect: { understanding: 1 }, says: { en: 'Mio: "When I treat someone, what I see comes first and what the neighbours say comes last. Saki saw; that counts."' } }],
        ren: [{ id: 'ren_lamp', name: say('{灯|ひ} の {証|あかし}', 'What a lamp shows'), desc: 'Ren speaks of what lamplight can and cannot show.', once: true, effect: { understanding: 1, stance: { 'n:saki': 'listening' } }, says: { en: 'Ren: "A lamp in a corridor makes any shape look larger than it is. A shadow that was small by lamplight was smaller still." Saki nods.' } }],
        suzu: [{ id: 'suzu_fox', name: say('{狐|きつね} の {役|やく}', 'The fox\'s part'), desc: 'Suzu talks about how the fox always gets cast as the villain.', once: true, effect: { understanding: 1 }, says: { en: 'Suzu: "In every play the fox gets the blame, because nobody ever asks the fox. Shall we ask somebody else this time?"' } }],
      },
    },
    conclusions: [
      { id: 'left', when: { left: 'n:gonroku' }, result: 'end', text: { en: 'Gonroku has gone off to his room in a huff. He will be back for breakfast; you can try again.' } },
      { id: 'agreed', when: { flag: 'agreed' }, result: 'win', text: { en: 'Saki and Gonroku agree: it may well have been Hisa.' } },
    ],
  };

  // ---- t10: the record of the night (the capstone) ----------------------------------------------------------------------------
  function hear(item, fJp, jp, en, ok, w1, why1, w2, why2) {
    const opts = (two) => [{ en: ok, ok: true }, { en: w1, ok: false, why: { en: why1 } }].concat(two ? [{ en: w2, ok: false, why: { en: why2 } }] : []);
    return { F: ch({ item, ctx: { jp: fJp, en: '' }, prompt: { en }, options: opts(false) }), E: ch({ item, ctx: { jp, en: '' }, prompt: { en }, options: opts(false) }), I: ch({ item, ctx: { jp, en: '' }, prompt: { en }, options: opts(true) }), A: ch({ item, ctx: { jp, en: '' }, prompt: { en }, options: opts(true) }) };
  }
  const A = (id, jp, en, more) => Object.assign({ id, label: { jp, en } }, more);
  const vals = (x) => { const out = {}; for (const k in x) out[k] = { jp: x[k][0], en: x[k][1] }; return out; };
  const PAGE = vals({ blank: ['{白紙|はくし}', 'blank'], one: ['{一行|いちぎょう}', 'one line'], two: ['{二行|にぎょう}', 'two lines'], three: ['{三行|さんぎょう}', 'three lines'], done: ['{書|か}き{終|お}えた', 'written'] });
  C.encounters['hall.w8.record'] = {
    id: 'hall.w8.record', kind: 'procedure', name: say('{夜|よる} の {記録|きろく}', 'The record of the night'),
    rules: { wait: true },
    procedure: {
      id: 'hall_w8_record', version: 1, restart: 'stable',
      machine: { page: 'blank' },
      show: [{ key: 'page', label: say('{宿|やど} の {帳面|ちょうめん}', 'The inn\'s ledger'), values: PAGE }],
      done: { en: 'The night is written down as it was: what was seen, what was heard, what was said and what was guessed.' },
      steps: [
        { id: 'r1', stable: true, text: say('サキ ： 「 {台所|だいどころ} から 、 {小|ちい}さな {影|かげ} を {見|み}ました 。 」', 'Saki: "From the kitchen, I saw a small shadow."'),
          task: hear('g:sou_hear', 'サキ ： 「 だいどころ から 、 ちいさな かげ を みました 。 」', 'サキ ： 「 {台所|だいどころ} から 、 {小|ちい}さな {影|かげ} を {見|み}ました 。 」', 'How does Saki know about the shadow?',
            'She saw it herself.', 'Someone told her.', 'She says 見ました: with her own eyes.', 'She guessed it.', 'She is not guessing; she saw.'),
          actions: [
            A('seen', '「 サキ は 、 {小|ちい}さな {影|かげ} を {見|み}た と {言|い}う 」 と {書|か}く', 'Write: "Saki says she saw a small shadow."', { ok: true, set: { page: 'one' }, means: { en: 'You write down what Saki saw, as she saw it.' }, result: { en: 'The first line goes down in Omatsu\'s careful hand, dictated by you.' } }),
            A('thief', '「 {泥棒|どろぼう} が {入|はい}った 」 と {書|か}く', 'Write: "A thief got in."', { means: { en: 'You go to write that a thief got in.' }, wrong: { en: 'Omatsu stops the brush. "Nobody saw a thief. Only a shadow."' } }),
          ] },
        { id: 'r2', stable: true, text: say('トウスケ ： 「 {階段|かいだん} で 、 {足音|あしおと} が {聞|き}こえた 。 」', 'Tōsuke: "I heard footsteps on the stairs."'),
          task: hear('g:sou_hear', 'トウスケ ： 「 かいだん で 、 あしおと が きこえた 。 」', 'トウスケ ： 「 {階段|かいだん} で 、 {足音|あしおと} が {聞|き}こえた 。 」', 'How does Tōsuke know about the footsteps?',
            'He heard them; he did not see anyone.', 'He saw someone on the stairs.', 'He says 聞こえた: only heard.', 'He climbed the stairs himself.', 'He heard the steps; he did not make them.'),
          actions: [
            A('heard', '「 {夜中|よなか} 、 {階段|かいだん} で {足音|あしおと} が した そう だ 」 と {書|か}く', 'Write: "There were footsteps on the stairs in the night, we are told."', { ok: true, set: { page: 'two' }, means: { en: 'You write down what Tōsuke heard, as heard.' }, result: { en: 'The second line: what was heard, and by whom.' } }),
            A('climbed', '「 トウスケ が {階段|かいだん} を {上|のぼ}った 」 と {書|か}く', 'Write: "Tōsuke went up the stairs."', { means: { en: 'You go to write that Tōsuke went up the stairs.' }, wrong: { en: 'Tōsuke protests. "I heard someone. I never said it was me!"' } }),
          ] },
        { id: 'r3', stable: true, text: say('ゴンロク ： 「 {狐|きつね} の {仕業|しわざ} じゃ と 、 {村|むら} の {者|もの} が {言|い}って おる 。 」', 'Gonroku: "The villagers say it was a fox\'s doing."'),
          task: hear('g:rashii', 'ゴンロク ： 「 きつね の せい だ と 、 むら の ひと が いって いる 。 」', 'ゴンロク ： 「 {狐|きつね} の {仕業|しわざ} じゃ と 、 {村|むら} の {者|もの} が {言|い}って おる 。 」', 'Where does the fox come from?',
            'From what the villagers say: a rumour.', 'From what Gonroku saw.', 'He says the villagers say so.', 'From the footprints.', 'The prints say nothing of a fox.'),
          actions: [
            A('rumour', '「 {狐|きつね} の {仕業|しわざ} と いう {噂|うわさ} も ある が 、 {確|たし}か で は ない 」 と {書|か}く', 'Write: "There is talk of a fox, but nothing certain."', { ok: true, set: { page: 'three' }, means: { en: 'You write the rumour down as a rumour.' }, result: { en: 'Gonroku reads it over your shoulder, and for once does not argue.' } }),
            A('fox', '「 {狐|きつね} が {箱|はこ} を {盗|ぬす}んだ 」 と {書|か}く', 'Write: "A fox stole the box."', { means: { en: 'You go to write that a fox stole the box.' }, wrong: { en: 'Saki shakes her head. "Nobody saw a fox. Write what people said, not what they guessed."' } }),
          ] },
        { id: 'r4', stable: true, text: say('ヒサ の {書|か}き{置|お}き ： 「 {箱|はこ} の {人|ひと} に 、 {届|とど}けて くる ね 。 」', 'Hisa\'s note: "I\'m taking it to the box\'s owner."'),
          task: hear('g:you_mitai', 'ヒサ の かきおき ： 「 はこ の ひと に 、 とどけて くる ね 。 」', 'ヒサ の {書|か}き{置|お}き ： 「 {箱|はこ} の {人|ひと} に 、 {届|とど}けて くる ね 。 」', 'What does the note tell you about the box?',
            'Hisa took it to give it to its owner.', 'Hisa stole it.', 'The note says 届けてくる: to deliver it.', 'Hisa lost it.', 'Hisa took it on purpose, to deliver.'),
          actions: [
            A('note', '「 ヒサ が {届|とど}け に {行|い}った よう だ 。 {書|か}き{置|お}き が あった 」 と {書|か}く', 'Write: "It seems Hisa went to deliver it; there was a note."', { ok: true, set: { page: 'done' }, means: { en: 'You write what the note shows, with the note as its evidence.' }, result: { en: 'Omatsu blots the page. Outside, small footsteps come crunching up the path, and a big pair beside them.' } }),
            A('stole', '「 ヒサ が {箱|はこ} を {盗|ぬす}んだ 」 と {書|か}く', 'Write: "Hisa stole the box."', { means: { en: 'You go to write that Hisa stole the box.' }, wrong: { en: 'Omatsu puts her hand over the page. "Read the note again. Delivering is not stealing."' } }),
          ] },
      ],
    },
    conclusions: [{ id: 'done', when: { proc: 'done' }, result: 'win', text: { en: 'The record of the night is written.' } }],
  };
})(RB.content);
