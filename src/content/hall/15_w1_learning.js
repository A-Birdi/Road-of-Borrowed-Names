/* The Hall of a Hundred Tales, wing 1, The Lamp at the Crossroads: the language tasks and encounters (expansion P15;
 * plan 04_DUNGEONS.md D9; scenes in 21_w1_scenes.js, which this file comes before so they can show the plaques). The wing's theme: finding the way (directions, signs, which
 * turning, asking again). Every task has its four levels and an Advanced stretch (the Grow route at Advanced: nuance,
 * never an invented level); the Grow route elsewhere runs the next level up, taught first (src/learn/70_grow.js).
 *   hall.w1.story      the tale's four written passages, back in order (A38: the story room)
 *   hall.w1.story_q    what the tale is about (optional: never counted against you)
 *   hall.w1.sign0/1    the signpost: which way to the place the traveller asks for (by the wing's pattern)
 *   hall.w1.counter0/1 the plaques: the one that breaks the rule (A34: a counterexample hall)
 *   hall.w1.ask        asking your companion about the map (A12: the information is theirs, the question yours)
 *   hall.w1.riddle     the riddle stone (a reprieve)
 *   encounters: hall.w1.lanterns (stray paper lanterns in the mist: conditions), hall.w1.pilgrim (Genza, who will not
 *   say he is lost: a conversation), hall.w1.great (the lamp relit for the travellers: the capstone procedure). */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const T = (jp, en) => ({ jp, en });
  const ch = (o) => Object.assign({ kind: 'choose' }, o);
  const OR = (o) => Object.assign({ kind: 'order' }, o);
  const o = (jp, ok, why) => Object.assign({ jp, ok: !!ok }, why ? { why: { en: why } } : {});
  const e = (en, ok, why) => Object.assign({ en, ok: !!ok }, why ? { why: { en: why } } : {});
  const say = (jp, en) => ({ jp, en });

  // ---- the story room: the tale's four passages ------------------------------------------------------------------------
  const P1 = '{昔|むかし} 、 {山|やま} の {辻|つじ} に 、 {灯籠|とうろう} が {一|ひと}つ {立|た}って いた', P2 = '{灯籠|とうろう} の {番|ばん} を して いた の は 、 {耳|みみ} の {遠|とお}い おばあさん だった',
    P3 = '{旅人|たびびと} が {道|みち} を {聞|き}く と 、 おばあさん は いつも 「 もう {一度|いちど} 、 {言|い}って ください 」 と {言|い}った', P4 = '{二度|にど} {聞|き}いた {旅人|たびびと} は 、 {一人|ひとり} も {道|みち} に {迷|まよ}わなかった';
  C.challenges['hall.w1.story'] = { title: T('{辻|つじ} の {灯籠|とうろう}', 'The Lamp at the Crossroads'), tiers: {
    F: [OR({ item: 'v:道', prompt: { en: 'Arrange the four written passages to retell the scroll\'s story.' },
      tiles: ['とうろう が ひとつ たって いた', 'おばあさん が ばん を して いた', '「もう いちど いって ください」', 'だれ も みち に まよわなかった'],
      answer: ['とうろう が ひとつ たって いた', 'おばあさん が ばん を して いた', '「もう いちど いって ください」', 'だれ も みち に まよわなかった'],
      orderHint: { en: 'The lamp; the old woman who kept it; what she always said; and what came of it.' } })],
    E: [OR({ item: 'v:道', prompt: { en: 'Arrange the four passages in the tale\'s order.' }, tiles: [P3, P1, P4, P2], answer: [P1, P2, P3, P4],
      orderHint: { en: 'First the lamp, then its keeper, then what she said to travellers, then what happened to them.' } })],
    I: [OR({ item: 'v:迷う', prompt: { en: 'Order the passages so that each follows from the one before.' }, tiles: [P4, P2, P1, P3], answer: [P1, P2, P3, P4],
      orderHint: { en: 'She was hard of hearing (耳が遠い), so she asked again; because they said it twice, nobody got lost.' } })],
    A: [OR({ item: 'v:迷う', prompt: { en: 'Order the passages; the tale turns on the line in quotation marks.' }, tiles: [P2, P4, P3, P1], answer: [P1, P2, P3, P4],
      orderHint: { en: 'The quoted request is the hinge: everything after it is its consequence.' } })],
  },
  stretchA: [ch({ item: 'v:迷う', ctx: { jp: P2 + ' 。 ' + P3 + ' 。 ' + P4 + ' 。', en: '' }, prompt: { en: 'Read the tale against the grain: who, in it, is actually doing the travellers a favour?' },
    options: [e('The travellers, by saying it twice: repeating themselves is what saves them, though they think the old woman is the one helping.', 1),
      e('Only the old woman: the travellers do nothing.', 0, 'They do one thing: they say it again. The tale\'s point is that this is what keeps them on the road.'),
      e('Nobody: the tale is about deafness.', 0, 'Her hearing is the occasion, not the subject; the subject is asking twice.')] })] };
  C.challenges['hall.w1.story_q'] = { title: T('{話|はなし} の {後|あと} で', 'After the tale'), optional: true, tiers: {
    F: [ch({ item: 'v:聞く', ctx: { jp: 'にど きいた たびびと は 、 みち に まよわなかった 。', en: '' }, prompt: { en: 'Why did nobody get lost?' },
      options: [e('They said it twice, so they listened twice too.', 1), e('The lamp was very bright.', 0, 'にど きいた: they asked (and heard) twice. That is the reason the tale gives.')] })],
    E: [ch({ item: 'v:聞く', ctx: { jp: P4 + ' 。', en: '' }, prompt: { en: 'What does the tale say about asking again?' },
      options: [e('That it is nothing to be ashamed of: it keeps you on the right road.', 1), e('That travellers should not ask the way.', 0, '{二度|にど} {聞|き}いた: asking twice is what saved them.'), e('That the old woman was rude.', 0, 'She asked politely: もう {一度|いちど} 、 {言|い}って ください.')] })],
    I: [ch({ item: 'v:聞き返す', ctx: { jp: P3 + ' 。 ' + P4 + ' 。', en: '' }, prompt: { en: 'Why might the tale give the old woman poor hearing?' },
      options: [e('So that asking again is something she has to do, and the travellers learn it does them good.', 1), e('To make her seem foolish.', 0, 'Nothing in the tale mocks her; the travellers are the ones who learn.'), e('Because the lamp was noisy.', 0, 'The tale gives no other reason than her ears.')] })],
    A: [ch({ item: 'v:聞き返す', ctx: { jp: P3 + ' 。 ' + P4 + ' 。', en: '' }, prompt: { en: 'The tale says the travellers asked (聞いた) twice, not that they were told twice. Why does that matter?' },
      options: [e('Saying the question again made them check what they themselves wanted: the second asking was for them as much as for her.', 1), e('It doesn\'t: 聞く and 言う mean the same here.', 0, '聞く is to ask (and to hear); the travellers are the ones doing it.'), e('Because the old woman never answered.', 0, 'She answered; the tale is about what the asking did.')] })],
  } };

  // ---- the signpost: which way to the place the traveller asks for ------------------------------------------------------
  // The arms (both patterns): 北 山 (the mountain), 東 寺 (the temple), 南 川 (the river), 西 村 (the village).
  // Pattern 0: the traveller wants the temple (east); pattern 1: the village (west).
  const ARMS = '{北|きた} ： {山|やま} ／ {東|ひがし} ： {寺|てら} ／ {南|みなみ} ： {川|かわ} ／ {西|にし} ： {村|むら}';
  const ARMS_F = 'きた ： やま ／ ひがし ： てら ／ みなみ ： かわ ／ にし ： むら';
  function sign(where, whereF, ans, ansF, wrong) {
    const W = { 東: ['{東|ひがし}', 'ひがし'], 西: ['{西|にし}', 'にし'], 南: ['{南|みなみ}', 'みなみ'], 北: ['{北|きた}', 'きた'] };
    const opts = (k) => [ans].concat(wrong).map((d) => o(k === 'F' ? W[d][1] : W[d][0], d === ans, 'The signpost says ' + W[d][1] + ' goes to ' + { 東: 'the temple', 西: 'the village', 南: 'the river', 北: 'the mountain' }[d] + '.'));
    return {
      F: [ch({ item: 'v:道', ctx: { jp: ARMS_F + ' 。 「 ' + whereF + ' は 、 どっち です か 。 」', en: '' }, prompt: { en: 'Which way do you tell the traveller?' }, options: opts('F') })],
      E: [ch({ item: 'v:' + ansF, ctx: { jp: ARMS + ' 。 「 ' + where + ' は 、 どちら です か 。 」', en: '' }, prompt: { en: 'Which way do you tell the traveller?' }, options: opts('E') })],
      I: [ch({ item: 'g:prt_wo', ctx: { jp: ARMS + ' 。 「 ' + where + ' に {行|い}きたい ん です が 、 どの {道|みち} を {行|い}けば いい です か 。 」', en: '' }, prompt: { en: 'Which answer sends the traveller the right way?' },
        options: [o(W[ans][0] + ' の {道|みち} を まっすぐ {行|い}って ください 。', 1), o(W[wrong[0]][0] + ' の {道|みち} を まっすぐ {行|い}って ください 。', 0, 'That road goes somewhere else: read the arm again.'), o(W[ans][0] + ' の {道|みち} に まっすぐ {行|い}って ください 。', 0, 'The road you go along takes を: {道|みち} を {行|い}く.')] })],
      A: [ch({ item: 'g:keigo_sonkei', ctx: { jp: ARMS + ' 。 {年配|ねんぱい} の {旅人|たびびと} が 、 「 ' + where + ' へ は 、 どう {行|い}けば よろしい でしょう か 。 」 と {尋|たず}ねる 。', en: '' }, prompt: { en: 'Which answer is both right and suitably polite?' },
        options: [o(W[ans][0] + ' の {道|みち} を 、 まっすぐ お{進|すす}み ください 。', 1), o(W[ans][0] + ' の {道|みち} を 、 まっすぐ {進|すす}め 。', 0, 'Right way, but a bare command to an older stranger.'), o(W[wrong[0]][0] + ' の {道|みち} を 、 まっすぐ お{進|すす}み ください 。', 0, 'Polite, but the wrong road: read the arm again.')] })],
    };
  }
  const S0 = sign('お{寺|てら}', 'おてら', '東', 'てら', ['西', '南']);
  const S1 = sign('{村|むら}', 'むら', '西', 'むら', ['東', '北']);
  // (the vocabulary item for E names the place asked for)
  S0.E[0].item = 'v:寺'; S1.E[0].item = 'v:村';
  const signStretch = (where, ans) => [ch({ item: 'g:cond_to', ctx: { jp: ARMS + ' 。 「 ' + where + ' は 、 どちら です か 。 」', en: '' }, prompt: { en: 'Answer as a local would: say which way, and what the traveller will see.' },
    options: [o(ans + ' の {道|みち} を {行|い}く と 、 すぐ {見|み}えます よ 。', 1, null), o(ans + ' の {道|みち} を {行|い}く と 、 {見|み}て ください 。', 0, '～と cannot end in a request: what follows it is what naturally happens.'), o(ans + ' の {道|みち} を {行|い}った のに 、 {見|み}えます 。', 0, 'のに is "even though": it turns the sentence against itself.')] })];
  C.challenges['hall.w1.sign0'] = { title: T('{道|みち}しるべ', 'The signpost'), tiers: S0, stretchA: signStretch('お{寺|てら}', '{東|ひがし}') };
  C.challenges['hall.w1.sign1'] = { title: T('{道|みち}しるべ', 'The signpost'), tiers: S1, stretchA: signStretch('{村|むら}', '{西|にし}') };

  // ---- the plaques: the one that breaks the rule (A34) ------------------------------------------------------------------
  // F and E: the turning direction takes に (右に, 左に); the place you turn at or go along takes を (角を, 橋を, 道を).
  // I and A: ～と tells what naturally follows; it cannot end in a request.
  // (the plaques' sentences are kept for the scenes, which show each plaque at the level the task is set: 21_w1_scenes.js)
  C.hallW1Plaques = {};
  function counter(F, E, I, A, pat) {
    C.hallW1Plaques[pat] = { F, E, I, A };
    const mk = (item, list, prompt) => ch({ item, ctx: { jp: list.map((x, i) => (i + 1) + ' 、 ' + x[0]).join(' ／ '), en: '' }, prompt: { en: prompt },
      options: list.map((x, i) => o(String(i + 1) + ' 、 ' + x[0], x[1], x[2])) });
    return {
      F: [mk('g:prt_ni', F, 'Three plaques follow the rule. Which one breaks it?')],
      E: [mk('g:prt_wo', E, 'Three plaques follow the rule (a direction takes に, the corner or road takes を). Which one breaks it?')],
      I: [mk('g:cond_to', I, 'Three plaques use ～と the way it works. Which one breaks the rule?')],
      A: [mk('g:cond_to', A, 'Three plaques use ～と correctly. Which is the odd one out, and so the rule\'s counterexample?')],
    };
  }
  const C0 = counter(
    [['かど を みぎ に まがって ください', 0, 'かど を (the corner) and みぎ に (the direction): this one follows the rule.'], ['はし を わたって ください', 0, 'はし を わたる: you cross along the bridge with を. It follows the rule.'], ['ひだり を まがって ください', 1, 'A direction takes に: ひだり に まがる. This is the one.'], ['この みち を まっすぐ いって ください', 0, 'みち を いく: along the road, を. It follows the rule.']],
    [['{角|かど} を {右|みぎ} に {曲|ま}がって ください', 0, '{角|かど} を (the corner) and {右|みぎ} に (the direction): correct.'], ['{橋|はし} を {渡|わた}って ください', 0, '{橋|はし} を {渡|わた}る: correct.'], ['{左|ひだり} を {曲|ま}がって ください', 1, 'A direction takes に: {左|ひだり} に {曲|ま}がる.'], ['この {道|みち} を まっすぐ {行|い}って ください', 0, '{道|みち} を {行|い}く: correct.']],
    [['{角|かど} を {曲|ま}がる と 、 {寺|てら} が {見|み}えます', 0, 'What you naturally see: correct.'], ['{橋|はし} を {渡|わた}る と 、 {村|むら} に {着|つ}きます', 0, 'A natural result: correct.'], ['{右|みぎ} に {曲|ま}がる と 、 {止|と}まって ください', 1, '～と cannot be followed by a request; ～たら could: {右|みぎ} に {曲|ま}がったら 、 {止|と}まって ください.'], ['まっすぐ {行|い}く と 、 {川|かわ} が あります', 0, 'What is there: correct.']],
    [['{坂|さか} を {上|のぼ}る と 、 {峠|とうげ} の {茶屋|ちゃや} が {見|み}えて くる', 0, 'A natural consequence: correct.'], ['{灯籠|とうろう} を {過|す}ぎる と 、 {道|みち} が {二|ふた}つ に {分|わ}かれる', 0, 'What happens next on the road: correct.'], ['{分|わ}かれ{道|みち} に {着|つ}く と 、 {左|ひだり} を {選|えら}んで ください', 1, 'A request after ～と: the rule\'s counterexample. ～たら would carry a request.'], ['{川|かわ} に {出|で}る と 、 {渡|わた}し{場|ば} は すぐ そこ だ', 0, 'A statement of what is there: correct.']], 0);
  const C1 = counter(
    [['ふたつめ の かど を ひだり に まがって ください', 0, 'かど を, ひだり に: correct.'], ['かわ に わたって ください', 1, 'You cross a river with を: かわ を わたる. This is the one.'], ['みぎ に まがって ください', 0, 'みぎ に: correct.'], ['さか を のぼって ください', 0, 'さか を のぼる: up along the slope, を. Correct.']],
    [['{二|ふた}つ{目|め} の {角|かど} を {左|ひだり} に {曲|ま}がって ください', 0, 'Correct.'], ['{川|かわ} に {渡|わた}って ください', 1, '{川|かわ} を {渡|わた}る: what you cross takes を.'], ['{右|みぎ} に {曲|ま}がって ください', 0, 'Correct.'], ['{坂|さか} を {上|のぼ}って ください', 0, 'Correct.']],
    [['この {道|みち} を {行|い}く と 、 {橋|はし} に {出|で}ます', 0, 'A natural result: correct.'], ['{左|ひだり} に {曲|ま}がる と 、 {灯籠|とうろう} が あります', 0, 'What is there: correct.'], ['{寺|てら} に {着|つ}く と 、 {鐘|かね} を {鳴|な}らして ください', 1, 'A request after ～と. Use ～たら: {着|つ}いたら 、 {鳴|な}らして ください.'], ['{坂|さか} を {下|くだ}る と 、 {村|むら} が {見|み}えます', 0, 'What you naturally see: correct.']],
    [['{辻|つじ} を {北|きた} へ {抜|ぬ}ける と 、 {峠|とうげ} に {出|で}る', 0, 'A natural result: correct.'], ['{最初|さいしょ} の {灯籠|とうろう} を {過|す}ぎる と 、 {空|そら} が {開|ひら}ける', 0, 'What happens: correct.'], ['{村|むら} の {入|い}り{口|ぐち} に {着|つ}く と 、 {声|こえ} を かけて ください', 1, 'The counterexample: a request after ～と. ～たら would carry it.'], ['{川|かわ} を {渡|わた}る と 、 {風|かぜ} が {冷|つめ}たく なる', 0, 'A natural change: correct.']], 1);
  const counterStretch = [ch({ item: 'g:cond_to', ctx: { jp: '{右|みぎ} に {曲|ま}がる と 、 {寺|てら} が {見|み}えます 。 ／ {右|みぎ} に {曲|ま}がったら 、 {寺|てら} が {見|み}えます 。', en: '' }, prompt: { en: 'Both are correct. What does the second say that the first does not?' },
    options: [e('～たら treats it as one occasion: once you have turned (this time), you will see it. ～と states what always follows, like a fact about the road.', 1), e('Nothing: they mean exactly the same.', 0, 'They overlap, but ～と is a general consequence and ～たら a particular one.'), e('～たら is only for the past.', 0, 'Here it is about a future turn.')] })];
  C.challenges['hall.w1.counter0'] = { title: T('{一|ひと}つ だけ {違|ちが}う {石|いし}', 'The odd plaque out'), tiers: C0, stretchA: counterStretch };
  C.challenges['hall.w1.counter1'] = { title: T('{一|ひと}つ だけ {違|ちが}う {石|いし}', 'The odd plaque out'), tiers: C1, stretchA: counterStretch };

  // ---- asking about the map (A12) -------------------------------------------------------------------------------------
  C.challenges['hall.w1.ask'] = { title: T('{地図|ちず} を {持|も}つ {人|ひと}', 'The one with the map'), tiers: {
    F: [ch({ item: 'v:地図', prompt: { en: 'You want to know where the spring is on the map. What do you ask?' },
      options: [o('いずみ は 、 ちず の どこ です か 。', 1), o('いずみ は 、 なん です か 。', 0, 'That asks what a spring is, not where it is.'), o('ちず は 、 どこ です か 。', 0, 'They have the map in their hands; you want the spring.')] })],
    E: [ch({ item: 'v:地図', prompt: { en: 'You want to know where the spring is on the map. What do you ask?' },
      options: [o('{泉|いずみ} は 、 {地図|ちず} の どこ に あります か 。', 1), o('{泉|いずみ} は 、 {地図|ちず} の {何|なん} です か 。', 0, 'That asks what the spring is.'), o('{地図|ちず} は 、 どこ に あります か 。', 0, 'They are holding the map: ask about the spring.')] })],
    I: [ch({ item: 'g:qword_ka_mo', prompt: { en: 'You want them to tell you where the spring is and how to get there. What do you ask?' },
      options: [o('{泉|いずみ} が どこ に ある か 、 どう {行|い}けば いい か 、 {教|おし}えて くれます か 。', 1), o('{泉|いずみ} が どこ に ある 、 {教|おし}えて くれます か 。', 0, 'An embedded question needs か: どこ に ある か.'), o('{泉|いずみ} に {行|い}って も いい です か 。', 0, 'That asks permission, not the way.')] })],
    A: [ch({ item: 'g:indirectness', prompt: { en: 'They are studying the map closely. Ask, without hurrying them, whether they can see a spring on it.' },
      options: [o('もし {見|み}つかったら で いい ん だ けど 、 {泉|いずみ} らしい もの 、 {描|か}いて ある ？', 1), o('{泉|いずみ} は どこ ？ {早|はや}く 。', 0, 'Exactly the hurry you were asked to avoid.'), o('{泉|いずみ} が {描|か}いて ない なら 、 その {地図|ちず} は {要|い}らない よ 。', 0, 'That dismisses their map before they\'ve looked.')] })],
  },
  stretchA: [ch({ item: 'g:indirectness', ctx: { jp: '{地図|ちず} を {持|も}つ {人|ひと} ： 「 {北東|ほくとう} の {外|はず}れ …… か な 。 {字|じ} が {薄|うす}くて 。 」', en: '' }, prompt: { en: 'They are not sure. Which reply checks without making them feel doubted?' },
    options: [o('{北東|ほくとう} の {外|はず}れ ね 。 {行|い}って みて 、 なかったら また {一緒|いっしょ} に {見|み}よう 。', 1), o('「か な」 じゃ {困|こま}る 。 はっきり して 。', 0, 'That makes their honesty about doubt into a fault.'), o('じゃあ 、 {自分|じぶん} で {探|さが}す 。', 0, 'That throws away what they could tell you.')] })] };

  // ---- the riddle stone (a reprieve) ------------------------------------------------------------------------------------
  C.challenges['hall.w1.riddle'] = { title: T('なぞなぞ の {石|いし}', 'The riddle stone'), tiers: {
    F: [ch({ item: 'v:道', ctx: { jp: 'あし が いっぽん 、 うで が よっつ 。 あるかない のに 、 みんな を いきさき へ つれて いく 。 なあに ？', en: '' }, prompt: { en: 'What is it?' },
      options: [o('みちしるべ', 1), o('かかし', 0, 'A scarecrow has one leg, but two arms, and sends nobody anywhere.'), o('はし', 0, 'A bridge takes you across, but has no arms.')] })],
    E: [ch({ item: 'v:道しるべ', ctx: { jp: '{足|あし} が {一本|いっぽん} 、 {腕|うで} が {四本|よんほん} 。 {歩|ある}かない のに 、 みんな を {行|い}き{先|さき} へ {連|つ}れて {行|い}く 。 なあに ？', en: '' }, prompt: { en: 'What is it?' },
      options: [o('{道|みち}しるべ', 1), o('かかし', 0, 'Two arms, and it guides nobody.'), o('{橋|はし}', 0, 'No arms at all.')] })],
    I: [ch({ item: 'v:道しるべ', ctx: { jp: '{一本足|いっぽんあし} で {立|た}ち 、 {四方|しほう} に {腕|うで} を {伸|の}ばして いる 。 {一歩|いっぽ} も {歩|ある}かない のに 、 {旅人|たびびと} を {行|い}き{先|さき} へ {導|みちび}く 。 {何|なん} だ ？', en: '' }, prompt: { en: 'What is it?' },
      options: [o('{道|みち}しるべ', 1), o('{旅人|たびびと} の {杖|つえ}', 0, 'A staff walks with the traveller; this never takes a step.'), o('{灯籠|とうろう}', 0, 'A lamp shows the road but has no arms pointing four ways.')] })],
    A: [ch({ item: 'v:道しるべ', ctx: { jp: '{口|くち} は きかぬ が 、 {聞|き}かれ も せぬ うち に {答|こた}えて おる 。 {四方|しほう} へ {腕|うで} を {差|さ}し{伸|の}べ 、 {足|あし} は {一本|いっぽん} 、 {一生|いっしょう} {一歩|いっぽ} も {動|うご}かぬ 。 {何|なん} じゃ ？', en: '' }, prompt: { en: 'An old-fashioned riddle. What is it?' },
      options: [o('{道|みち}しるべ', 1), o('{案山子|かかし}', 0, 'One leg, but two arms, and it answers nothing.'), o('{辻|つじ} の {地蔵|じぞう}', 0, 'A wayside statue stands still, but has no arms pointing four ways.')] })],
  },
  stretchA: [ch({ item: 'v:道しるべ', ctx: { jp: '{口|くち} は きかぬ が 、 {聞|き}かれ も せぬ うち に {答|こた}えて おる 。', en: '' }, prompt: { en: 'The riddle plays on 聞かれもせぬうちに答える. What is the joke?' },
    options: [e('A signpost answers the question "which way?" before anyone asks it: it has nothing to say, yet it is all answer.', 1), e('It means the thing is rude.', 0, 'It is praise in riddle form: always ready with the answer.'), e('It means the thing cannot hear.', 0, '聞かれもせぬ: it is not even asked, yet it answers.')] })] };

  // ---- t5: stray paper lanterns in the mist (conditions) ----------------------------------------------------------------
  C.encounters = C.encounters || {};
  const LANTERN = { enemy: 'yn.chochin', name: say('{辻|つじ} の {提灯|ちょうちん}', 'Crossroads lantern'), conditions: ['paper', 'airborne'], knots: 2, music: 'battle_atlas' };
  C.encounters['hall.w1.lanterns'] = {
    id: 'hall.w1.lanterns', kind: 'battle', name: say('{霧|きり} の {提灯|ちょうちん}', 'Lanterns in the mist'),
    lead: { enemy: 'yn.chochin', name: say('{辻|つじ} の {提灯|ちょうちん}', 'Crossroads lantern'), conditions: ['paper', 'airborne'], knots: 3, music: 'battle_atlas' },
    group: { normal: [LANTERN], hard: [LANTERN, LANTERN] },
    rules: { wait: true, conditions: true }, field: ['mist'],
  };

  // ---- t9: Genza, who will not say he is lost (a conversation) ----------------------------------------------------------
  function task(item, en, ok, w1, why1, w2, why2) {
    const low = ch({ item, prompt: { en }, options: [{ jp: ok, ok: true }, { jp: w1, ok: false, why: { en: why1 } }] });
    const high = ch({ item, prompt: { en: en + ' (Read them closely: two are near.)' }, options: [{ jp: ok, ok: true }, { jp: w1, ok: false, why: { en: why1 } }, { jp: w2, ok: false, why: { en: why2 } }] });
    return { F: low, E: low, I: high, A: high };
  }
  C.encounters['hall.w1.pilgrim'] = {
    id: 'hall.w1.pilgrim', kind: 'social', name: say('{道|みち} を {知|し}って いる {巡礼|じゅんれい}', 'The pilgrim who knows the way'),
    rules: { wait: true },
    autoRoute: ['s:restate', 's:ask_where', 'wait', 's:together'],
    social: {
      parties: [{ aid: 'n:genza', name: say('ゲンザ', 'Genza'), stance: 'closed', wants: { en: 'To find the lamp without having to say he is lost.' } }],
      claims: {
        years: { by: 'n:genza', jp: '{四十年|よんじゅうねん} 、 {道|みち} を {歩|ある}いて きた 。 {迷|まよ}う わけ が ない 。', en: '"Forty years I\'ve walked the roads. There\'s no question of being lost."' },
        near: { by: 'n:genza', jp: '{峠|とうげ} は 、 あの {木|き} の {向|む}こう だ 。 …… さっき も 、 そう {思|おも}った が な 。', en: '"The pass is beyond that tree. …I thought so last time, too."' },
        lamp: { by: 'n:genza', jp: '…… {本当|ほんとう} は 、 {辻|つじ} の {灯籠|とうろう} を {探|さが}して いる 。 {女房|にょうぼう} が {昔|むかし} 、 そこ で {道|みち} を {聞|き}いた と {言|い}って いた 。 {二度|にど} {聞|き}け と {言|い}われた そう だ 。', en: '"…The truth is, I\'m looking for the crossroads lamp. My wife asked the way there, long ago. She was told to ask twice."', hidden: true },
      },
      understanding: 2,
      gesture: { name: say('{並|なら}んで {座|すわ}る', 'Sit down beside him'), desc: 'Rest a moment where he is.', effect: { stance: { 'n:genza': 'listening' } }, once: true, says: { en: 'You sit on a stone by the road. After a while Genza sits too, as if it had been his idea.' } },
      unravelTip: { en: 'Nothing is knotted. He won\'t be corrected; let him say where he means to go.' },
      actions: [
        { id: 'restate', kind: 'restate', label: say('{峠|とうげ} へ {行|い}く ん です ね 。', 'Say back where he is going'), once: true,
          task: task('g:n_desu', 'He says the pass is beyond that tree. Which says back his aim without contradicting him?', '{峠|とうげ} へ {行|い}く ん です ね 。', '{峠|とうげ} は 、 そっち じゃ ありません 。', 'True, perhaps, but he will only dig in.', '{峠|とうげ} へ は {行|い}かない ん です ね 。', 'That gets his aim backwards.'),
          effect: { understanding: 1, stance: { 'n:genza': 'listening' } }, says: { en: 'Genza nods, gruffly. "The pass. Yes. Or thereabouts."' } },
        { id: 'ask_where', kind: 'ask', label: say('{峠|とうげ} の {先|さき} に 、 {何|なに} が ある ん です か 。', 'Ask what lies past the pass'), once: true, when: { stance: { 'n:genza': 'listening' } },
          task: task('g:n_desu', 'Which asks, with interest, what is beyond the pass for him?', '{峠|とうげ} の {先|さき} に 、 {何|なに} が ある ん です か 。', '{峠|とうげ} の {先|さき} は 、 {何|なに} も ありません よ 。', 'That tells him instead of asking him.', 'どうして {迷|まよ}った ん です か 。', 'He hasn\'t said he is lost; that asks him to admit it.'),
          effect: { reveal: 'lamp', understanding: 1 }, says: { en: 'Genza is quiet a moment. "…Not the pass. A lamp. My wife\'s lamp, where she asked the way twice."' } },
        { id: 'together', kind: 'propose', label: say('{私|わたし} も {灯籠|とうろう} へ {行|い}きます 。 {一緒|いっしょ} に {行|い}きませんか 。', 'Offer to walk to the lamp together'), when: { claims: ['lamp'] },
          task: task('g:v_mashou', 'Which offers to walk with him, as a companion rather than a guide?', '{私|わたし} も {灯籠|とうろう} へ {行|い}きます 。 {一緒|いっしょ} に {行|い}きませんか 。', '{灯籠|とうろう} まで 、 {案内|あんない} して あげます よ 。', 'Kind, but it makes him the one being shown the way.', '{一人|ひとり} で {行|い}って ください 。', 'That leaves him where he was.'),
          effect: { flag: 'together' }, says: { en: 'Genza looks at you for a long moment. "Going that way yourself, eh? …Then I\'ll not stop you keeping an old man company."' } },
        { id: 'blunt', kind: 'propose', label: say('{道|みち} に {迷|まよ}って います よ 。', 'Tell him plainly he is lost'), lasting: true, means: { en: 'You will tell him outright that he is lost.' },
          task: task('g:v_te_iru', 'Which tells him outright that he is lost?', '{道|みち} に {迷|まよ}って います よ 。', '{道|みち} を よく {知|し}って います ね 。', 'That flatters him instead.', '{道|みち} は {一|ひと}つ しか ありません よ 。', 'There are four, and he knows it.'),
          effect: { stance: { 'n:genza': 'leaving' } }, says: { en: 'Genza stiffens. "Lost? I." He sets off past the tree, fast, the wrong way.' } },
      ],
      responses: {
        water: { effect: { stance: { 'n:genza': 'listening' } }, says: { en: 'You offer him your water. He drinks, wipes his mouth, and stops pretending not to be tired.' } },
        unravel: { says: { en: 'Nothing here is knotted. He needs to say where he is going, not to be told.' } },
      },
      wait: { when: { stance: { 'n:genza': 'listening' } }, effect: { reveal: 'lamp' }, says: { en: 'In the quiet Genza says, half to himself, "She said: ask twice. I never asked anyone anything once."' } },
      companion: {
        nao: [{ id: 'nao_road', name: say('{道|みち} の {話|はなし}', 'Talk about roads'), desc: 'Nao, a courier, talks road to road.', once: true, effect: { understanding: 1, stance: { 'n:genza': 'listening' } }, says: { en: 'Nao: "Forty years? I\'ve barely done ten, and I still ask at every fork." Genza snorts, but he is listening.' } }],
        mio: [{ id: 'mio_feet', name: say('{足|あし} を {見|み}る', 'Look at his feet'), desc: 'Mio notices his sandals are worn through.', once: true, effect: { stance: { 'n:genza': 'listening' } }, says: { en: 'Mio: "Your straps have nearly gone. Sit, and I\'ll fix them." He sits.' } }],
        ren: [{ id: 'ren_lamp', name: say('{灯|ひ} の {話|はなし}', 'Speak of lamps'), desc: 'Ren speaks of crossroads lamps and their keepers.', once: true, effect: { understanding: 1, stance: { 'n:genza': 'listening' } }, says: { en: 'Ren: "Keepers used to stand at crossroads, answering. Some asked their own questions back." Genza\'s eyes sharpen.' } }],
        suzu: [{ id: 'suzu_scene', name: say('{芝居|しばい} に する', 'Play it as a scene'), desc: 'Suzu treats it like a stage entrance.', once: true, effect: { understanding: 1, stance: { 'n:genza': 'listening' } }, says: { en: 'Suzu: "Enter a pilgrim who knows every road! The audience gasps." Genza laughs despite himself. "Every road but this one."' } }],
      },
      drift: [{ when: { all: [{ rounds: 3 }, { stance: { 'n:genza': 'closed' } }] }, once: true, effect: { stance: { 'n:genza': 'listening' } }, says: { en: 'Genza walks to the tree, looks, and walks back. He does not say anything about it.' } }],
    },
    conclusions: [
      { id: 'walked', when: { left: 'n:genza' }, result: 'end', text: { en: 'Genza strides off the wrong way. He will be back at this tree before long; you can try again.' } },
      { id: 'together', when: { flag: 'together' }, result: 'win', text: { en: 'Genza falls in beside you, keeping his own pace. Neither of you mentions that he was lost.' } },
    ],
  };

  // ---- t10: the lamp relit for the travellers (the capstone) -------------------------------------------------------------
  function hear(item, fJp, jp, en, ok, w1, why1, w2, why2) {
    const opts = (two) => [{ en: ok, ok: true }, { en: w1, ok: false, why: { en: why1 } }].concat(two ? [{ en: w2, ok: false, why: { en: why2 } }] : []);
    return {
      F: ch({ item, ctx: { jp: fJp, en: '' }, prompt: { en }, options: opts(false) }),
      E: ch({ item, ctx: { jp, en: '' }, prompt: { en }, options: opts(false) }),
      I: ch({ item, ctx: { jp, en: '' }, prompt: { en }, options: opts(true) }),
      A: ch({ item, ctx: { jp, en: '' }, prompt: { en }, options: opts(true) }),
    };
  }
  const A = (id, jp, en, more) => Object.assign({ id, label: { jp, en } }, more);
  const vals = (x) => { const out = {}; for (const k in x) out[k] = { jp: x[k][0], en: x[k][1] }; return out; };
  const LAMP = vals({ dark: ['{暗|くら}い', 'dark'], lit: ['{灯|ひ} が {入|はい}った', 'lit'], guiding: ['{道|みち} を {照|て}らす', 'showing the way'], bright: ['{明|あか}るく {灯|とも}る', 'burning bright'] });
  C.encounters['hall.w1.great'] = {
    id: 'hall.w1.great', kind: 'procedure', name: say('{辻|つじ} の {灯籠|とうろう}', 'The crossroads lamp'),
    rules: { wait: true },
    procedure: {
      id: 'hall_w1_great', version: 1, restart: 'stable',
      machine: { lamp: 'dark' },
      show: [{ key: 'lamp', label: say('{灯籠|とうろう}', 'The lamp'), values: LAMP }],
      done: { en: 'The lamp burns at the crossroads again, and every traveller who asked has gone the right way.' },
      steps: [
        { id: 'g1', stable: true, text: say('オタミ の {札|ふだ} ： 「 {油|あぶら} を {入|い}れて 、 {火|ひ} を {点|つ}けて ください 。 」', 'Otami\'s note: "Put in oil, and light it."'),
          task: hear('g:v_te_kudasai', 'オタミ の ふだ ： 「 あぶら を いれて 、 ひ を つけて ください 。 」', 'オタミ の {札|ふだ} ： 「 {油|あぶら} を {入|い}れて 、 {火|ひ} を {点|つ}けて ください 。 」', 'What does Otami\'s note ask?',
            'Put oil in, then light it.', 'Light it, then put the oil away.', 'あぶら を いれて: put the oil in first.', 'Leave it dark until a traveller comes.', 'It asks you to light it now.'),
          actions: [
            A('light', '{油|あぶら} を {入|い}れて 、 {火|ひ} を {点|つ}ける', 'Put in oil and light it', { ok: true, set: { lamp: 'lit' }, means: { en: 'You pour in the oil and light the wick.' }, result: { en: 'A small flame, then a steady one. Light spreads over the four roads.' } }),
            A('look', '{灯籠|とうろう} を {見|み}て {待|ま}つ', 'Look at the lamp and wait', { means: { en: 'You wait beside the dark lamp.' }, wrong: { en: 'Nothing comes out of the dark to light it for you. The note is still in your hand.' } }),
          ] },
        { id: 'g2', stable: true, text: say('{旅人|たびびと} ： 「 すみません 。 {渡|わた}し{場|ば} は 、 どちら です か 。 」 （ {灯籠|とうろう} の {札|ふだ} ： {東|ひがし} {渡|わた}し{場|ば} ・ {西|にし} {村|むら} ・ {北|きた} {峠|とうげ} ・ {南|みなみ} {寺|てら} ）', 'A traveller: "Excuse me, which way is the ferry landing?" (The lamp\'s plate: east, the ferry landing; west, the village; north, the pass; south, the temple.)'),
          task: hear('v:渡し場', 'たびびと ： 「 すみません 。 わたしば は 、 どちら です か 。 」 （ ひがし わたしば ・ にし むら ・ きた とうげ ・ みなみ てら ）', '{旅人|たびびと} ： 「 すみません 。 {渡|わた}し{場|ば} は 、 どちら です か 。 」 （ {東|ひがし} {渡|わた}し{場|ば} ・ {西|にし} {村|むら} ・ {北|きた} {峠|とうげ} ・ {南|みなみ} {寺|てら} ）', 'Which way does the traveller want?',
            'East, to the ferry landing.', 'West, to the village.', 'わたしば is the ferry landing: east on the plate.', 'North, to the pass.', 'とうげ is the pass; they asked for わたしば.'),
          actions: [
            A('east', '{東|ひがし} の {道|みち} を {指|さ}す', 'Point to the east road', { ok: true, set: { lamp: 'guiding' }, means: { en: 'You point down the east road.' }, result: { en: 'The traveller bows and goes east, toward the sound of water.' } }),
            A('west', '{西|にし} の {道|みち} を {指|さ}す', 'Point to the west road', { means: { en: 'You point down the west road.' }, wrong: { en: 'The traveller looks at the plate, then at you. "That says 村, doesn\'t it? The village." They wait for you to look again.' } }),
          ] },
        { id: 'g3', stable: true, text: say('{別|べつ} の {旅人|たびびと} が 、 {小|ちい}さな {声|こえ} で {何|なに} か {言|い}った 。 「 …… の {道|みち} は …… です か 。 」', 'Another traveller says something, too quietly: "…the road to… is it…?"'),
          task: hear('v:もう一度', '「 …… の みち は …… です か 。 」', '「 …… の {道|みち} は …… です か 。 」', 'You could not hear where they want to go. What is the right thing to do?',
            'Ask them to say it again.', 'Guess, and point somewhere.', 'Otami\'s lesson: when you cannot hear, ask again.', 'Say nothing and hope they go away.', 'They asked you; ask them back.'),
          actions: [
            A('again', 'すみません 、 もう {一度|いちど} {言|い}って ください 。', '"Sorry, could you say that again?"', { ok: true, means: { en: 'You ask them to say it again.' }, result: { en: 'The traveller smiles, and says it slowly and clearly: "Which is the road to the pass?"' } }),
            A('guess', '{村|むら} の {道|みち} は 、 {西|にし} です 。', '"The village road is west."', { means: { en: 'You guess they meant the village.' }, wrong: { en: 'The traveller shakes their head. "Not the village…" and their voice trails off again. You still don\'t know.' } }),
          ] },
        { id: 'g4', stable: true, text: say('{旅人|たびびと} ： 「 {峠|とうげ} へ の {道|みち} は 、 どちら です か 。 」', 'The traveller: "Which is the road to the pass?"'),
          task: hear('g:v_te_kudasai', 'たびびと ： 「 とうげ へ の みち は 、 どちら です か 。 」', '{旅人|たびびと} ： 「 {峠|とうげ} へ の {道|みち} は 、 どちら です か 。 」', 'Where do they want to go now?',
            'The pass: the north road.', 'The temple: the south road.', 'とうげ is the pass, north on the plate.', 'The ferry landing: the east road.', 'That was the first traveller.'),
          actions: [
            A('north', '{北|きた} の {道|みち} を まっすぐ {行|い}って ください 。', '"Go straight along the north road."', { ok: true, set: { lamp: 'bright' }, means: { en: 'You send them north.' }, result: { en: 'They go north, and the lamp burns brighter, as if pleased.' } }),
            A('south', '{南|みなみ} の {道|みち} を まっすぐ {行|い}って ください 。', '"Go straight along the south road."', { means: { en: 'You send them south.' }, wrong: { en: 'The traveller checks the plate. "South is the temple, isn\'t it?" You look again.' } }),
          ] },
      ],
    },
    conclusions: [{ id: 'done', when: { proc: 'done' }, result: 'win', text: { en: 'The crossroads lamp burns again.' } }],
  };
})(RB.content);
