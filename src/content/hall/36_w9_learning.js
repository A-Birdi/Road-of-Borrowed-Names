/* The Hall of a Hundred Tales, wing 9, The Crane's Return: the language tasks and encounters (expansion P15; plan
 * 04_DUNGEONS.md D9; scenes in 37_w9_scenes.js). The theme: to whom are you speaking? (plain and polite speech, what
 * you call people and your own family, respectful and humble verbs; at Intermediate ～てくださる／～ていただく, at
 * Advanced ～させていただく). Every task has its four levels and an Advanced stretch.
 *   hall.w9.story      the tale in four pictures, back in order (A38)
 *   hall.w9.story_q    who asked what of whom, and how (optional)
 *   hall.w9.counter0/1 the prayer boards at the shrine: the one that breaks the rule (A34)
 *   hall.w9.ask        asking your companion what the young woman asked of you (A12)
 *   hall.w9.riddle     the riddle stone (a reprieve)
 *   encounters: hall.w9.frost (the frost at the window: frozen), hall.w9.quarrel (Yosaku and Otoku: a mediation),
 *   hall.w9.farewell (the farewell: the capstone procedure). */
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
  const P1 = 'ある {雪|ゆき} の {日|ひ} 、 おじいさん は {罠|わな} に かかった {鶴|つる} を {助|たす}けて やった',
    P2 = 'その {夜|よる} 、 {美|うつく}しい {娘|むすめ} が {戸|と} を {叩|たた}き 、 「 {一晩|ひとばん} {泊|と}めて いただけません か 」 と {頭|あたま} を {下|さ}げた',
    P3 = '{娘|むすめ} は 「 {機|はた} を {織|お}る {間|あいだ} は 、 {決|けっ}して {覗|のぞ}かないで ください 」 と {言|い}って 、 {見事|みごと} な {布|ぬの} を {織|お}った',
    P4 = '{約束|やくそく} を {破|やぶ}って {覗|のぞ}く と 、 {一羽|いちわ} の {鶴|つる} が {自分|じぶん} の {羽|はね} を {抜|ぬ}いて {布|ぬの} を {織|お}って いた';
  C.hallW9Tale = { P1, P2, P3, P4 };
  const FT = ['ゆき の ひ 、 おじいさん は わな の つる を たすけた', 'よる 、 きれいな むすめ が きて 、 「 とめて ください 」 と いった',
    'むすめ は 「 みないで ください 」 と いって 、 ぬの を おった', 'へや を のぞく と 、 つる が じぶん の はね で ぬの を おって いた'];
  C.hallW9TaleF = FT;
  C.challenges['hall.w9.story'] = { title: T('{鶴|つる} の {恩返|おんがえ}し', 'The Crane\'s Return'), tiers: {
    F: [OR({ item: 'v:鶴', prompt: { en: 'Put the four pictures of the tale back in order.' }, tiles: [FT[2], FT[0], FT[3], FT[1]], answer: FT,
      orderHint: { en: 'The crane saved; a visitor at night; the cloth and the one thing she asked; and what they saw when they looked.' } })],
    E: [OR({ item: 'v:機', prompt: { en: 'Put the four pictures back in order.' }, tiles: [P3, P1, P4, P2], answer: [P1, P2, P3, P4],
      orderHint: { en: 'First the kindness, then the stranger at the door, then the weaving, then the promise broken.' } })],
    I: [OR({ item: 'g:keigo_kenjo', prompt: { en: 'Order the pictures so that each follows from the one before.' }, tiles: [P4, P2, P1, P3], answer: [P1, P2, P3, P4],
      orderHint: { en: 'She asks to stay as a stranger asks, very humbly, before she is one of the family; the promise comes before it is broken.' } })],
    A: [OR({ item: 'g:te_kudasaru', prompt: { en: 'Order the pictures; the turn is the promise broken.' }, tiles: [P2, P4, P3, P1], answer: [P1, P2, P3, P4],
      orderHint: { en: 'A kindness, a stranger\'s request (～ていただけませんか), a request kept, and then the one that was not.' } })],
  },
  stretchA: [ch({ item: 'g:te_kudasaru', ctx: { jp: '「 {一晩|ひとばん} {泊|と}めて ください 」 ／ 「 {一晩|ひとばん} {泊|と}めて いただけません か 」', en: '' }, prompt: { en: 'The young woman says the second. What does it do that the first does not?' },
    options: [e('It asks for the stay as a favour she would receive, and as a question, so that they are free to refuse: the way a stranger asks at someone\'s door.', 1),
      e('Nothing: both are orders.', 0, '～てください is a plain request; ～ていただけませんか is far humbler.'),
      e('The second asks to stay longer.', 0, 'Both ask for one night.')] })] };
  C.challenges['hall.w9.story_q'] = { title: T('{話|はなし} の {後|あと} で', 'After the tale'), optional: true, tiers: {
    F: [ch({ item: 'v:鶴', ctx: { jp: FT[0] + ' 。', en: '' }, prompt: { en: 'Whom did the old man help?' },
      options: [e('A crane caught in a trap.', 1), e('A young woman.', 0, 'He met her that night.'), e('A fox.', 0, 'つる: a crane.')] })],
    E: [ch({ item: 'g:register_polite_plain', ctx: { jp: P2 + ' 。', en: '' }, prompt: { en: 'How does the young woman ask to stay?' },
      options: [e('Very politely, as a stranger asks at someone\'s door.', 1), e('Rudely, demanding a bed.', 0, 'She bows and asks a favour.'), e('She doesn\'t ask; she just comes in.', 0, 'She asks, and bows.')] })],
    I: [ch({ item: 'g:v_naide_kudasai', ctx: { jp: P3 + ' 。', en: '' }, prompt: { en: 'What is the one thing she asks?' },
      options: [e('That they never look in while she weaves.', 1), e('That they sell the cloth for her.', 0, 'She asks them not to look.'), e('That they tell nobody she is there.', 0, '覗かないで: don\'t look in.')] })],
    A: [ch({ item: 'g:te_kudasaru', ctx: { jp: P1 + ' 。 ' + P2 + ' 。 ' + P3 + ' 。 ' + P4 + ' 。', en: '' }, prompt: { en: 'What is the tale suggesting?' },
      options: [e('That a kindness comes back, and that some gifts last only as long as nobody looks into them: once seen for what she is, she can no longer stay as one of them.', 1), e('That cranes are dangerous.', 0, 'The crane only repays a kindness.'), e('That you should never help strangers.', 0, 'Helping the crane is where the good begins.')] })],
  } };

  // ---- the prayer boards at the shrine: the one that breaks the rule (A34) -------------------------------------------------
  // F: speak to a stranger or a grown-up you don't know politely, and never put さん on your own name. E: what you call
  // people; your own mother is 母 to outsiders; さま, like さん, is never for yourself. I: respectful verbs for what others
  // do, humble verbs for what you do. A: with いただく the receiver is the subject; させていただく is for your own action.
  C.hallW9Cards = {};
  function counter(F, E, I, A, pat) {
    C.hallW9Cards[pat] = { F, E, I, A };
    const mk = (item, list, prompt) => ch({ item, ctx: { jp: list.map((x, i) => (i + 1) + ' 、 ' + x[0]).join(' ／ '), en: '' }, prompt: { en: prompt }, options: list.map((x, i) => o(String(i + 1) + ' 、 ' + x[0], x[1], x[2])) });
    return {
      F: [mk('g:register_polite_plain', F, 'Three sayings speak to their listener the way they should. Which one breaks the rule?')],
      E: [mk('g:address_terms', E, 'Three sayings call people what they should be called. Which one breaks the rule?')],
      I: [mk('g:keigo_kenjo', I, 'Three sayings use respectful and humble verbs the right way round. Which one breaks the rule?')],
      A: [mk('g:te_kudasaru', A, 'Three sayings use ～てくださる, ～ていただく and ～させていただく correctly. Which is the counterexample?')],
    };
  }
  const C0 = counter(
    [['はじめまして 。 たなか です 。', 0, 'Correct.'], ['せんせい 、 おはよう ございます 。', 0, 'Correct.'], ['わたし は 、 たなか さん です 。', 1, 'You never put さん on your own name: わたし は たなか です.'], ['ともだち に 「 また あした ね 」 と いった 。', 0, 'Correct.']],
    [['{親方|おやかた} に 「 お{疲|つか}れ さま です 」 と {言|い}う', 0, 'Correct.'], ['{友達|ともだち} に 「 {明日|あした} {行|い}く ？ 」 と {聞|き}く', 0, 'Correct.'], ['{師匠|ししょう} に 「 {私|わたし} の お{母|かあ}さん は {元気|げんき} です 」 と {言|い}う', 1, 'To someone outside the family, your own mother is {母|はは}: {私|わたし} の {母|はは} は {元気|げんき} です. お{母|かあ}さん is for someone else\'s mother, or for calling your own.'], ['{小|ちい}さな {女|おんな} の {子|こ} を 「 ミイ ちゃん 」 と {呼|よ}ぶ', 0, 'Correct.']],
    [['{庄屋|しょうや}さま が いらっしゃいました', 0, 'Correct.'], ['{荷物|にもつ} は {私|わたし} が お{持|も}ち します', 0, 'Correct.'], ['{明日|あした} 、 {私|わたし} が {庄屋|しょうや}さま の お{宅|たく} に いらっしゃいます', 1, 'いらっしゃる raises the one who comes or goes; for your own visit, use the humble {伺|うかが}います (or {参|まい}ります).'], ['{親方|おやかた} は もう お{帰|かえ}り に なりました', 0, 'Correct.']],
    [['{師匠|ししょう} が {手紙|てがみ} を {読|よ}んで くださった', 0, 'Correct.'], ['{親方|おやかた} に {仕事|しごと} を {見|み}て いただいた', 0, 'Correct.'], ['{師匠|ししょう} が {私|わたし} に {本|ほん} を {貸|か}して いただいた', 1, 'The counterexample: with いただく the one who receives is the subject: {師匠|ししょう} に {貸|か}して いただいた, or {師匠|ししょう} が {貸|か}して くださった.'], ['では 、 {始|はじ}め させて いただきます', 0, 'Correct.']], 0);
  const C1 = counter(
    [['おかあさん 、 ただいま 。', 0, 'Correct.'], ['みせ の ひと に 「 これ を ください 」 と いった 。', 0, 'Correct.'], ['ちいさい こ に 「 なまえ は ？ 」 と きいた 。', 0, 'Correct.'], ['しらない おとな に 「 おい 、 みち は どこ だ 」 と きいた 。', 1, 'To a grown-up you don\'t know, ask politely: すみません 、 みち を おしえて ください.']],
    [['お{客|きゃく}さま 、 いらっしゃいませ', 0, 'Correct.'], ['{師匠|ししょう} 、 おはよう ございます', 0, 'Correct.'], ['{自分|じぶん} の {名前|なまえ} を 「 {山田|やまだ} さま です 」 と {言|い}う', 1, 'さま, like さん, is never for yourself: {山田|やまだ} です (or {山田|やまだ} と {申|もう}します).'], ['{弟|おとうと} に 「 {早|はや}く {来|こ}い よ 」 と {言|い}う', 0, 'Correct.']],
    [['どうぞ 、 {召|め}し{上|あ}がって ください', 0, 'Correct.'], ['{殿|との}さま が そう おっしゃいました', 0, 'Correct.'], ['お{客|きゃく}さま 、 どうぞ いただいて ください', 1, 'いただく is humble, for your own eating; for a guest\'s, use {召|め}し{上|あ}がって ください.'], ['{明日|あした} 、 {私|わたし} が お{届|とど}け します', 0, 'Correct.']],
    [['お{名前|なまえ} を {伺|うかが}って も よろしい でしょう か', 0, 'Correct.'], ['{本日|ほんじつ} は {休|やす}ませて いただきます', 0, 'Correct.'], ['{殿|との}さま が {私|わたし} の {話|はなし} を {聞|き}いて くださった', 0, 'Correct.'], ['どうぞ 、 ゆっくり {休|やす}ませて いただいて ください', 1, 'The counterexample: させていただく asks leave for your own action; to invite someone to rest, say ごゆっくり お{休|やす}み ください.']], 1);
  const cardStretch = [ch({ item: 'g:sasete_itadaku', ctx: { jp: '{泊|と}めて ください 。 ／ {泊|と}めて いただけません か 。 ／ {泊|と}めて いただけます でしょう か 。', en: '' }, prompt: { en: 'Three ways to ask for a night\'s lodging. What changes from one to the next?' },
    options: [e('Each is humbler and leaves the listener freer to say no: a request, then asking whether you might receive the favour, then asking whether it would even be possible.', 1), e('They ask for longer and longer stays.', 0, 'All three ask for the same night.'), e('The last one is rude.', 0, 'The last is the most courteous.')] })];
  C.challenges['hall.w9.counter0'] = { title: T('{絵馬|えま}', 'The prayer boards'), tiers: C0, stretchA: cardStretch };
  C.challenges['hall.w9.counter1'] = { title: T('{絵馬|えま}', 'The prayer boards'), tiers: C1, stretchA: cardStretch };

  // ---- asking what the young woman asked of you (A12) ---------------------------------------------------------------------
  C.challenges['hall.w9.ask'] = { title: T('{娘|むすめ} の {頼|たの}み', 'What she asked'), tiers: {
    F: [ch({ item: 'g:v_te_kudasai', prompt: { en: 'The young woman asked something of you all before she shut the door. What do you ask?' },
      options: [o('むすめ さん は 、 なに を たのみました か 。', 1), o('むすめ さん は 、 どこ から きました か 。', 0, 'That asks where she came from.'), o('ぬの は 、 いくら です か 。', 0, 'That asks what the cloth costs.')] })],
    E: [ch({ item: 'g:te_giving', prompt: { en: 'You want to know what she asked of you. What do you ask?' },
      options: [o('{娘|むすめ} さん は 、 {私|わたし}たち に {何|なに} を {頼|たの}んだ ん です か 。', 1), o('{娘|むすめ} さん は 、 いつ から ここ に いる ん です か 。', 0, 'That asks how long she has been here.'), o('{布|ぬの} は 、 いつ できる ん です か 。', 0, 'That asks when the cloth will be ready.')] })],
    I: [ch({ item: 'g:te_giving', prompt: { en: 'You want to know what she asked of you before she went in. What do you ask?' },
      options: [o('{娘|むすめ} さん が {部屋|へや} に {入|はい}る {前|まえ} に 、 {私|わたし}たち に {頼|たの}んで いった こと は {何|なん} です か 。', 1), o('{娘|むすめ} さん は 、 {部屋|へや} で {何|なに} を して いる ん です か 。', 0, 'That asks what she is doing in there; she asked you not to look.'), o('{娘|むすめ} さん に 、 {何|なに} を {頼|たの}んだら いい です か 。', 0, 'That asks what you should ask of her.')] })],
    A: [ch({ item: 'g:keigo_sonkei', prompt: { en: 'Ask, respectfully of her, what she asked of you before she went in.' },
      options: [o('あの {方|かた} は 、 {私|わたし}ども に {何|なに} を お{頼|たの}み に なった の でしょう か 。', 1), o('あの {方|かた} に 、 {何|なに} を お{頼|たの}み したら よろしい でしょう か 。', 0, 'That asks what you should ask of her (the humble お頼みする), not what she asked of you.'), o('あの {方|かた} は 、 どちら から いらっしゃった の でしょう か 。', 0, 'That asks where she came from.')] })],
  },
  stretchA: [ch({ item: 'g:keigo_sonkei', ctx: { jp: '{機|はた} を {織|お}る {間|あいだ} は 、 どうか {決|けっ}して お{覗|のぞ}き に なりません よう に 。', en: '' }, prompt: { en: 'How does she ask, and why so?' },
    options: [e('With the respectful お～になる for her hosts\' looking, and as a wish (～ませんように) rather than an order: a guest asking her hosts not to do something, and raising them as she asks.', 1), e('As an order: she is the mistress of the house.', 0, 'She is their guest, and asks as one.'), e('Humbly, about her own looking.', 0, 'お覗きになる is respectful, about the hosts.')] })] };

  // ---- the riddle stone (a reprieve) -----------------------------------------------------------------------------------------
  C.challenges['hall.w9.riddle'] = { title: T('なぞなぞ の {石|いし}', 'The riddle stone'), tiers: {
    F: [ch({ item: 'v:鶴', ctx: { jp: 'しろい からだ に 、 ながい あし 。 さむい くに から 、 とんで くる 。 なあに ？', en: '' }, prompt: { en: 'What is it?' },
      options: [o('つる', 1), o('うさぎ', 0, 'A hare is white, but it cannot fly.'), o('ゆき', 0, 'Snow flies on the wind, but it has no legs.')] })],
    E: [ch({ item: 'v:機', ctx: { jp: '{細|ほそ}い {糸|いと} を {縦|たて} と {横|よこ} に {組|く}んで 、 トン トン カラリ 。 {一枚|いちまい} の {布|ぬの} が できる 。 {何|なん} だ ？', en: '' }, prompt: { en: 'What is it?' },
      options: [o('{機|はた}', 1), o('{針|はり}', 0, 'A needle sews cloth that is already made.'), o('{筆|ふで}', 0, 'A brush writes; it makes no cloth.')] })],
    I: [ch({ item: 'g:keigo_kenjo', ctx: { jp: '{上|うえ} の {人|ひと} は {高|たか}く 、 {自分|じぶん} は {低|ひく}く 。 {口|くち} の {中|なか} で {背|せ} を {比|くら}べる もの 、 {何|なん} だ ？', en: '' }, prompt: { en: 'What is it?' },
      options: [o('{敬語|けいご}', 1), o('{階段|かいだん}', 0, 'Stairs go up and down, but not in your mouth.'), o('{声|こえ}', 0, 'A voice can be high or low, but it raises nobody.')] })],
    A: [ch({ item: 'g:keigo_kenjo', ctx: { jp: '{実|みの}る ほど 、 {頭|あたま} を {垂|た}れる 。 {何|なに} か 。', en: '' }, prompt: { en: 'What is it?' },
      options: [o('{稲穂|いなほ}', 1), o('{柳|やなぎ}', 0, 'A willow bends, but bears no grain.'), o('{鶴|つる}', 0, 'A crane bows in its dance, but it does not ripen.')] })],
  },
  stretchA: [ch({ item: 'g:keigo_kenjo', ctx: { jp: '{実|みの}る ほど {頭|あたま} を {垂|た}れる {稲穂|いなほ} かな', en: '' }, prompt: { en: 'What does the saying mean, said of a person?' },
    options: [e('The more someone has achieved, the more modest they become, as the fullest ears of rice hang lowest.', 1), e('That the hungry must bow to the rich.', 0, 'It praises modesty in those who have done well.'), e('That rice must be cut before it bows.', 0, 'The ears bow because they are full.')] })] };

  // ---- t5: the frost at the window (frozen) --------------------------------------------------------------------------------------
  C.encounters = C.encounters || {};
  const FROST = { enemy: 'sb.wisp', name: say('{窓|まど} の {霜|しも}', 'Window frost'), conditions: ['frozen'], knots: 2, music: 'battle_atlas' };
  C.encounters['hall.w9.frost'] = {
    id: 'hall.w9.frost', kind: 'battle', name: say('{窓|まど} の {霜|しも}', 'Frost at the window'),
    lead: Object.assign({}, FROST, { knots: 3 }),
    group: { normal: [FROST], hard: [FROST, FROST] },
    rules: { wait: true, conditions: true },
  };

  // ---- t9: Yosaku and Otoku (a mediation) ---------------------------------------------------------------------------------------
  function task(item, en, ok, w1, why1, w2, why2) {
    const low = ch({ item, prompt: { en }, options: [{ jp: ok, ok: true }, { jp: w1, ok: false, why: { en: why1 } }] });
    const high = ch({ item, prompt: { en: en + ' (Read them closely: two are near.)' }, options: [{ jp: ok, ok: true }, { jp: w1, ok: false, why: { en: why1 } }, { jp: w2, ok: false, why: { en: why2 } }] });
    return { F: low, E: low, I: high, A: high };
  }
  C.encounters['hall.w9.quarrel'] = {
    id: 'hall.w9.quarrel', kind: 'social', name: say('ヨサク と オトク', 'Yosaku and Otoku'),
    rules: { wait: true },
    autoRoute: ['s:calm', 's:ask', 'wait', 's:together'],
    social: {
      parties: [
        { aid: 'n:yosaku', name: say('ヨサク', 'Yosaku'), stance: 'heated', wants: { en: 'To do as the lord asks: you do not send a lord\'s word back, and the money would see them through the winter.' } },
        { aid: 'n:otoku', name: say('オトク', 'Otoku'), stance: 'heated', wants: { en: 'To spare the girl: she grows thinner with every bolt she weaves.' } },
      ],
      claims: {
        duty: { by: 'n:yosaku', jp: '{殿|との}さま の {仰|おお}せ だ 。 {断|ことわ}る わけ に は いかん 。', en: 'Yosaku: "It\'s his lordship\'s order. We can\'t refuse."' },
        thin: { by: 'n:otoku', jp: 'あの {子|こ} 、 {一反|いったん} {織|お}る たび に 、 {痩|や}せて いく ん です よ 。', en: 'Otoku: "Every bolt she weaves, she grows thinner."' },
        never: { by: 'n:yosaku', jp: '…… {使|つか}い の {方|かた} に は 、 {頭|あたま} を {下|さ}げて ばかり いた 。 だが 、 {娘|むすめ} に は 、 {一度|いちど} も {聞|き}いて おらん 。', en: 'Yosaku: "…I bowed and bowed to the lord\'s man. But I never once asked the girl."', hidden: true },
      },
      understanding: 3,
      gesture: { name: say('{囲炉裏|いろり} に {薪|まき} を {足|た}す', 'Put a log on the fire'), desc: 'Add a log to the hearth between them.', effect: { stance: { 'n:yosaku': 'listening', 'n:otoku': 'listening' } }, once: true, says: { en: 'The fire takes the new log. For a moment they both watch it instead of each other.' } },
      unravelTip: { en: 'Nothing is knotted. Each of them is speaking for someone who is not in the room.' },
      actions: [
        { id: 'calm', kind: 'restate', label: say('ヨサク さん は {殿|との}さま の こと を 、 オトク さん は {娘|むすめ} さん の こと を {心配|しんぱい} して いる ん です ね 。', 'Say back what each of them is worried for'),
          task: task('g:register_polite_plain', 'Which says back what each of them is worried for?', 'ヨサク さん は {殿|との}さま の こと を 、 オトク さん は {娘|むすめ} さん の こと を {心配|しんぱい} して いる ん です ね 。', 'お{二人|ふたり} と も 、 お{金|かね} の こと を {心配|しんぱい} して いる ん です ね 。', 'Otoku is not thinking of money.', 'お{二人|ふたり} と も 、 {殿|との}さま が {怖|こわ}い ん です ね 。', 'Otoku is thinking of the girl.'),
          cases: [{ when: { stance: { 'n:yosaku': 'heated' } }, effect: { stance: { 'n:yosaku': 'listening' } }, says: { en: 'Yosaku lets out a breath. "Aye. A lord\'s word is not a thing you send back."' } },
            { when: { stance: { 'n:otoku': 'heated' } }, effect: { stance: { 'n:otoku': 'listening' } }, says: { en: 'Otoku\'s hands stop twisting her apron. "Yes. It\'s her I\'m thinking of."' } }],
          says: { en: 'They are already listening.' } },
        { id: 'ask', kind: 'ask', label: say('{娘|むすめ} さん に は 、 もう {聞|き}いて みました か 。', 'Ask whether anyone has asked her'), once: true, when: { stance: { 'n:yosaku': 'listening' } },
          task: task('g:te_miru', 'Which asks whether anyone has asked her?', '{娘|むすめ} さん に は 、 もう {聞|き}いて みました か 。', '{娘|むすめ} さん は 、 もう {寝|ね}ました か 。', 'That asks whether she has gone to bed.', '{殿|との}さま に は 、 もう {聞|き}いて みました か 。', 'The lord has said what he wants; it is the girl nobody has asked.'),
          effect: { reveal: 'never', understanding: 1 }, says: { en: 'Yosaku opens his mouth, and shuts it again. "…No. I bowed to the lord\'s man till my back ached. I never once asked her."' } },
        { id: 'together', kind: 'propose', label: say('{二人|ふたり} で 、 {娘|むすめ} さん に {聞|き}いて みません か 。 {断|ことわ}って も いい 、 と {言|い}って 。', 'Propose they ask her together, and let her say no'), when: { claims: ['never'] },
          task: task('g:indirectness', 'Which proposes that they ask her together, and leave her free to refuse?', '{二人|ふたり} で 、 {娘|むすめ} さん に {聞|き}いて みません か 。 {断|ことわ}って も いい 、 と {言|い}って 。', '{娘|むすめ} さん に 、 もう {一反|いったん} {織|お}る よう に {言|い}いましょう 。', 'That decides for her.', '{殿|との}さま に 、 {娘|むすめ} さん を {会|あ}わせましょう 。', 'That only makes it worse.'),
          effect: { flag: 'asked' }, says: { en: 'Otoku nods first, then Yosaku. "Together, then. And if she says no, I\'ll go down to the gate myself and say so."' } },
        { id: 'blunt', kind: 'propose', label: say('{欲|よく} を {出|だ}す の は 、 やめなさい 。', 'Tell Yosaku to stop being greedy'), lasting: true, means: { en: 'You will tell Yosaku he is being greedy.' },
          task: task('g:v_te_kudasai', 'Which tells him to stop being greedy?', '{欲|よく} を {出|だ}す の は 、 やめなさい 。', 'もう {少|すこ}し 、 {話|はなし} を {聞|き}かせて ください 。', 'That invites him to say more.', 'お{茶|ちゃ} でも {入|い}れましょう か 。', 'That offers tea.'),
          effect: { stance: { 'n:yosaku': 'leaving' } }, says: { en: 'Yosaku goes red to the ears. "Greedy, is it? From a guest under my own roof?" He jams on his hat and goes out to the woodshed.' } },
      ],
      responses: {
        water: { effect: { stance: { 'n:otoku': 'listening' } }, says: { en: 'You pour Otoku a cup of hot water. She holds it in both hands.' } },
        unravel: { says: { en: 'Nothing here is knotted. Each of them is speaking for someone who is not in the room.' } },
      },
      wait: { when: { stance: { 'n:yosaku': 'listening' } }, effect: { reveal: 'never' }, says: { en: 'Yosaku stares into the fire. "…I never did ask her, did I," he says, to nobody.' } },
      drift: [{ when: { all: [{ rounds: 3 }, { stance: { 'n:otoku': 'heated' } }] }, once: true, effect: { stance: { 'n:yosaku': 'listening', 'n:otoku': 'listening' } }, says: { en: 'From the loom room comes the sound of the loom, steady: ton, ton, karari. They both fall quiet to listen.' } }],
      companion: {
        nao: [{ id: 'nao_address', name: say('{宛先|あてさき}', 'Who it is addressed to'), desc: 'Nao, who carries letters, asks who this order is really for.', once: true, effect: { understanding: 1, stance: { 'n:yosaku': 'listening' } }, says: { en: 'Nao: "Every letter I carry has a name on it. This order has the lord\'s name at the top and nobody\'s at the bottom. Whose hands does it end up in?" Yosaku looks towards the loom room.' } }],
        mio: [{ id: 'mio_hands', name: say('{痩|や}せた {手|て}', 'Thin hands'), desc: 'Mio speaks, as a healer, about what she saw at supper.', once: true, effect: { understanding: 1, stance: { 'n:otoku': 'listening' } }, says: { en: 'Mio: "I saw her hands at supper. That isn\'t tiredness. Whatever the order says, she needs rest more than the lord needs cloth."' } }],
        ren: [{ id: 'ren_bow', name: say('{頭|あたま} の {下|さ}げ{方|かた}', 'How low to bow'), desc: 'Ren speaks of bowing lowest to the far and forgetting the near.', once: true, effect: { understanding: 1 }, says: { en: 'Ren: "We bow lowest to the people furthest from us, and forget to ask the ones beside us at all. Strange, isn\'t it."' } }],
        suzu: [{ id: 'suzu_line', name: say('{台詞|せりふ} の {相手|あいて}', 'Who the line is for'), desc: 'Suzu points out that on stage every line is said to someone.', once: true, effect: { understanding: 1 }, says: { en: 'Suzu: "On stage you never say a line to the air; it\'s always to somebody. You\'ve both said yours to me. Say them to her."' } }],
      },
    },
    conclusions: [
      { id: 'left', when: { left: 'n:yosaku' }, result: 'end', text: { en: 'Yosaku has gone out to the woodshed in a temper. He will come in when he gets cold; you can try again.' } },
      { id: 'asked', when: { flag: 'asked' }, result: 'win', text: { en: 'Yosaku and Otoku will ask her together.' } },
    ],
  };

  // ---- t10: the farewell (the capstone) --------------------------------------------------------------------------------------------
  function hear(item, fJp, jp, en, ok, w1, why1, w2, why2) {
    const opts = (two) => [{ en: ok, ok: true }, { en: w1, ok: false, why: { en: why1 } }].concat(two ? [{ en: w2, ok: false, why: { en: why2 } }] : []);
    return { F: ch({ item, ctx: { jp: fJp, en: '' }, prompt: { en }, options: opts(false) }), E: ch({ item, ctx: { jp, en: '' }, prompt: { en }, options: opts(false) }), I: ch({ item, ctx: { jp, en: '' }, prompt: { en }, options: opts(true) }), A: ch({ item, ctx: { jp, en: '' }, prompt: { en }, options: opts(true) }) };
  }
  const A = (id, jp, en, more) => Object.assign({ id, label: { jp, en } }, more);
  const vals = (x) => { const out = {}; for (const k in x) out[k] = { jp: x[k][0], en: x[k][1] }; return out; };
  const SKY = vals({ night: ['{夜|よる}', 'night'], grey: ['{薄明|うすあ}かり', 'first grey'], pale: ['{白|しら}み{始|はじ}め', 'paling'], rose: ['{朝焼|あさや}け', 'red dawn'], morning: ['{朝|あさ}', 'morning'] });
  C.encounters['hall.w9.farewell'] = {
    id: 'hall.w9.farewell', kind: 'procedure', name: say('{別|わか}れ', 'The farewell'),
    rules: { wait: true },
    procedure: {
      id: 'hall_w9_farewell', version: 1, restart: 'stable',
      machine: { dawn: 'night' },
      show: [{ key: 'dawn', label: say('{東|ひがし} の {空|そら}', 'The eastern sky'), values: SKY }],
      done: { en: 'Each of them has been answered as who they are to her: family as family, a guest as a guest, a child as a child, and the lord\'s man as the lord\'s man.' },
      steps: [
        { id: 'f1', stable: true, text: say('{娘|むすめ} ： 「 {長|なが}い {間|あいだ} 、 {大変|たいへん} お{世話|せわ} に なりました 。 {姿|すがた} を {見|み}られた {以上|いじょう} 、 もう こちら に は おられません 。 」', 'The young woman: "I have been so much in your debt all this while. Now that I have been seen as I am, I can stay here no longer."'),
          task: hear('g:keigo_kenjo', 'むすめ ： 「 ながい あいだ 、 おせわ に なりました 。 もう ここ に は いられません 。 」', '{娘|むすめ} ： 「 {長|なが}い {間|あいだ} 、 {大変|たいへん} お{世話|せわ} に なりました 。 {姿|すがた} を {見|み}られた {以上|いじょう} 、 もう こちら に は おられません 。 」', 'For months she has spoken to them as their daughter. What does this formal speech tell you?',
            'She is speaking as a guest again: she is taking her leave of them.', 'She is angry with them.', 'There is no anger in it; it is how a guest takes leave.', 'She has forgotten how to talk to them.', 'She chooses the distance on purpose.'),
          actions: [
            A('family', 'オトク が 「 そんな {他人行儀|たにんぎょうぎ} な 。 お{前|まえ} は うち の {子|こ} だ よ 」 と {言|い}う', 'Otoku: "Don\'t talk like a stranger. You\'re our girl."', { ok: true, set: { dawn: 'grey' }, means: { en: 'Otoku answers her as family, in the speech of home.' }, result: { en: 'The young woman\'s face crumples. For a moment she is their daughter again.' } }),
            A('formal', 'オトク が 「 さようで ございます か 。 どうぞ お{元気|げんき} で 」 と {言|い}う', 'Otoku: "Is that so. Fare you well." (as to a guest)', { means: { en: 'Otoku answers her as a guest, in the same formal speech.' }, wrong: { en: 'Otoku stops herself. "No. That\'s how you see off a stranger."' } }),
          ] },
        { id: 'f2', stable: true, text: say('{娘|むすめ} ： 「 {旅|たび} の お{方|かた} 、 {二人|ふたり} の こと を 、 どうか よろしく お{願|ねが}い いたします 。 」', 'The young woman: "Traveller, I beg you, look after the two of them."'),
          task: hear('g:keigo_kenjo', 'むすめ ： 「 たび の かた 、 ふたり を よろしく おねがい します 。 」', '{娘|むすめ} ： 「 {旅|たび} の お{方|かた} 、 {二人|ふたり} の こと を 、 どうか よろしく お{願|ねが}い いたします 。 」', 'What is she asking of you?',
            'To look after the old couple when she has gone.', 'To take her with you.', 'She asks you to look after them.', 'To pay for her keep.', 'She asks a favour, not money.'),
          actions: [
            A('polite', '「 はい 。 {確|たし}か に お{引|ひ}き{受|う}け します 」 と {答|こた}える', 'Answer: "Yes. I will see to it, I promise."', { ok: true, set: { dawn: 'pale' }, means: { en: 'You answer her politely, as one traveller to another at a solemn moment.' }, result: { en: 'She bows low to you, and you bow back.' } }),
            A('casual', '「 うん 、 いい よ 。 {任|まか}せて 」 と {答|こた}える', 'Answer: "Yeah, sure. Leave it to me."', { means: { en: 'You answer her casually.' }, wrong: { en: 'The words come out too light. She has asked you something with her whole heart; answer her in kind.' } }),
          ] },
        { id: 'f3', stable: true, text: say('サブ ： 「 ねえちゃん 、 どこ {行|い}く の ？ また {来|く}る ？ 」', 'Sabu: "Big sister, where are you going? Will you come back?"'),
          task: hear('g:register_polite_plain', 'サブ ： 「 ねえちゃん 、 どこ いく の ？ また くる ？ 」', 'サブ ： 「 ねえちゃん 、 どこ {行|い}く の ？ また {来|く}る ？ 」', 'Who is speaking, and how?',
            'The neighbours\' child, in a child\'s plain speech, calling her "big sister".', 'The lord\'s messenger, formally.', 'ねえちゃん and plain forms: a child.', 'Otoku, in tears.', 'It is Sabu, the neighbours\' child.'),
          actions: [
            A('gentle', 'サブ に 「 ねえちゃん は 、 {遠|とお}く の お{家|うち} に {帰|かえ}る ん だ よ 。 {空|そら} を {見|み}て て ごらん 」 と {言|い}う', 'Tell Sabu: "She\'s going home, far away. Keep watching the sky."', { ok: true, set: { dawn: 'rose' }, means: { en: 'You answer Sabu gently, in plain words a child can hold on to.' }, result: { en: 'Sabu grips your sleeve and looks up.' } }),
            A('stiff', 'サブ に 「 お{姉|ねえ}さま は 、 {遠方|えんぽう} へ お{帰|かえ}り に なります 」 と {言|い}う', 'Tell Sabu: "The honoured lady is returning to a distant place."', { means: { en: 'You answer Sabu in formal, respectful speech.' }, wrong: { en: 'Sabu stares at you. "Why are you talking like the lord\'s man?" Say it the way you would to a child.' } }),
          ] },
        { id: 'f4', stable: true, text: say('{殿|との}さま の {使|つか}い ： 「 {約束|やくそく} の {布|ぬの} を {受|う}け{取|と}り に {参|まい}った 。 {出|だ}して もらおう 。 」', 'The lord\'s messenger: "I have come for the promised cloth. Hand it over."'),
          task: hear('g:keigo_kenjo', 'つかい ： 「 ぬの を もらい に きた 。 だして くれ 。 」', '{殿|との}さま の {使|つか}い ： 「 {約束|やくそく} の {布|ぬの} を {受|う}け{取|と}り に {参|まい}った 。 {出|だ}して もらおう 。 」', 'What does the messenger want?',
            'The cloth promised to the lord.', 'A night\'s lodging.', 'He has come for the cloth.', 'To meet the young woman.', 'He asks only for the cloth.'),
          actions: [
            A('humble', 'ヨサク が {頭|あたま} を {下|さ}げて 、 「 {申|もう}し{訳|わけ} ございません 。 この {布|ぬの} は 、 {娘|むすめ} が {私|わたし}ども に {残|のこ}して くれた もの で ございます 。 お{渡|わた}し する わけ に は まいりません 」 と {言|い}う', 'Yosaku bows: "I am truly sorry. This cloth is what our daughter left to us. I cannot hand it over."', { ok: true, set: { dawn: 'morning' }, means: { en: 'Yosaku refuses, with every courtesy, in humble speech.' }, result: { en: 'The messenger looks at the old man for a long moment, then at the empty sky, and bows in return. "I shall tell his lordship so."' } }),
            A('rude', 'ヨサク が 「 {帰|かえ}れ 。 {布|ぬの} は {渡|わた}さない 」 と {怒鳴|どな}る', 'Yosaku shouts: "Go home. You\'re not having it."', { means: { en: 'Yosaku refuses him bluntly.' }, wrong: { en: 'The messenger\'s face sets hard, and Otoku tugs at Yosaku\'s sleeve. To a lord\'s man, even a refusal has to be humble.' } }),
          ] },
      ],
    },
    conclusions: [{ id: 'done', when: { proc: 'done' }, result: 'win', text: { en: 'The farewell is said, to each as they should hear it.' } }],
  };
})(RB.content);
