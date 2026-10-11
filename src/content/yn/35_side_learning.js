/* Steamhollow, Chapter 11: the side stories' language tasks (expansion P13f; scenes in 26_scenes_side.js).
 *   yn.masseur_song  the massage song's three lines put back in order (the shoulders' mountain, the knot to sand, light
 *                    feet for tomorrow): an ordering task, each tier with its own pieces.
 *   yn.wedding       a plan that saves face for both families (〜ことにする: deciding; どちら でも ない: neither one's).
 *   yn.actor_line    Ginnojō's punchline from the old playbill: いい湯だ……言うことなし！ (a pun: 湯 yu and 言う yū; 言う
 *                    ことなし, "nothing to say", means perfect).
 *   yn.story_order   Kanae's story room (A38): the four panels back in order.
 *   yn.story_question an optional question on what the story means (never counted against you: A38). */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const T = (jp, en) => ({ jp, en });
  const ch = (o) => Object.assign({ kind: 'choose' }, o);
  const o = (jp, ok, why) => Object.assign({ jp, ok: !!ok }, why ? { why: { en: why } } : {});
  const e = (en, ok, why) => Object.assign({ en, ok: !!ok }, why ? { why: { en: why } } : {});
  const OR = (o) => Object.assign({ kind: 'order' }, o);

  // ---- the massage song ---------------------------------------------------------------------------------------------
  const L1 = '{肩|かた} の {山|やま} 、 {谷|たに} に {下|お}りて 、 {湯|ゆ} に なる', L2 = '{凝|こ}り は {石|いし} 、 {石|いし} は {砂|すな}', L3 = '{明日|あした} も {歩|ある}ける 、 {軽|かる}い {足|あし}';
  C.challenges['yn.masseur_song'] = { title: T('{揉|も}み{歌|うた}', 'The massage song'), tiers: {
    F: [OR({ item: 'v:歌', prompt: { en: 'Put the song in order: the shoulders first, then the knots, then the feet for tomorrow.' },
      tiles: ['かた の やま', 'こり は いし', 'かるい あし'], answer: ['かた の やま', 'こり は いし', 'かるい あし'],
      orderHint: { en: 'It works down the body: shoulders (かた), the knots (こり), the feet (あし).' } })],
    E: [OR({ item: 'v:歌', prompt: { en: 'Put the three lines in the order the song goes: down the body, from the shoulders to the feet.' },
      tiles: [L1, L2, L3], answer: [L1, L2, L3], orderHint: { en: 'Shoulders (肩), then knots (凝り), then feet (足): the masseur\'s hands go down the back.' } })],
    I: [OR({ item: 'g:adj_naru', prompt: { en: 'Each line turns one thing into another (〜になる, 〜は〜). Put them in the song\'s order, ending with tomorrow.' },
      tiles: [L3, L1, L2], answer: [L1, L2, L3], orderHint: { en: 'The mountain of the shoulders becomes water; the knot becomes sand; and the song ends on tomorrow (明日).' } })],
    A: [OR({ item: 'g:adj_naru', prompt: { en: 'Order the song so that its images run from the heaviest to the lightest.' },
      tiles: [L2, L3, L1], answer: [L1, L2, L3], orderHint: { en: 'A mountain melts to water, a stone to sand, and at last feet light enough to walk tomorrow.' } })],
  } };

  // ---- the wedding feast -----------------------------------------------------------------------------------------------
  C.challenges['yn.wedding'] = { title: T('{両家|りょうけ} の {顔|かお}', 'Saving face for both families'), tiers: {
    F: [ch({ item: 'v:半分', ctx: { jp: 'クメ ： 「どちら の やど でも ない ところ で 、 うたげ を したい 。」', en: '' }, prompt: { en: 'Which place belongs to neither inn?' },
      options: [o('よりあいじょ', 1), o('かみのゆ', 0, 'That is the groom\'s family\'s inn.'), o('しものゆ', 0, 'That is the bride\'s family\'s inn.')] })],
    E: [ch({ item: 'g:v_mashou', ctx: { jp: '', en: 'Both mothers refuse to set foot in the other family\'s inn.' }, prompt: { en: 'Which plan lets both families come?' },
      options: [o('{寄合所|よりあいじょ} で 、 {両方|りょうほう} の {宿|やど} が {料理|りょうり} を {作|つく}りましょう 。', 1), o('{上|かみ}の{湯|ゆ} で {一回|いっかい} 、 {下|しも}の{湯|ゆ} で {一回|いっかい} 、 {二回|にかい} やりましょう 。', 0, 'Two feasts on one night: the very problem.'), o('{下|しも}の{湯|ゆ} の {予約|よやく} を {取|と}り{消|け}しましょう 。', 0, 'The bride\'s family loses face.')] })],
    I: [ch({ item: 'g:koto_ni_suru', ctx: { jp: '', en: 'Tell Kume what you\'d suggest they decide.' }, prompt: { en: 'Which suggests a decision that keeps both families\' face?' },
      options: [o('{宴|うたげ} は {寄合所|よりあいじょ} で する こと に して 、 {料理|りょうり} は {両方|りょうほう} の {宿|やど} が {半分|はんぶん} ずつ {作|つく}る こと に しましょう 。', 1),
        o('{宴|うたげ} は {上|かみ}の{湯|ゆ} で する こと に なった と 、 {下|しも}の{湯|ゆ} に {言|い}いましょう 。', 0, 'That decides for one side and tells the other.'),
        o('{宴|うたげ} は やめる こと に しましょう 。', 0, 'Nobody wants the wedding cancelled.')] })],
    A: [ch({ item: 'g:yn_omotenashi', ctx: { jp: '', en: 'Put the plan to Kume as the go-between would put it to both families.' }, prompt: { en: 'Which is tactful and fair to both?' },
      options: [o('{両家|りょうけ} の どちら の お{宿|やど} でも ない {寄合所|よりあいじょ} にて 、 {両館|りょうかん} に {半分|はんぶん} ずつ お{料理|りょうり} を お{願|ねが}い して は いかが でしょう か 。', 1),
        o('{上|かみ}の{湯|ゆ} の {方|ほう} が {格|かく} が {上|うえ} です から 、 そちら に いたしましょう 。', 0, 'Ranking one family\'s inn above the other is the insult everyone feared.'),
        o('どちら か が {折|お}れる べき で ございます 。', 0, 'True of many quarrels; no help here.')] })],
  } };

  // ---- Ginnojō's punchline ---------------------------------------------------------------------------------------------
  const BILL = '{番付|ばんづけ} ： 「…… {湯|ゆ} に {浸|つ}かって 、 {一言|ひとこと} 。 『いい {湯|ゆ} だ 。 …… {言|い}う こと なし ！』」';
  C.challenges['yn.actor_line'] = { title: T('{落|お}ち の {台詞|せりふ}', 'The punchline'), tiers: {
    F: [ch({ item: 'v:湯', ctx: { jp: 'ばんづけ ： 「いい ゆ だ 。 …… いう こと なし ！」', en: '' }, prompt: { en: 'Which is the line on the playbill?' },
      options: [o('いい ゆ だ 。 …… いう こと なし ！', 1), o('ゆ に はいって 、 ゆ を わすれる 。', 0, 'That is Onatsu\'s version, not the playbill\'s.')] })],
    E: [ch({ item: 'v:言う', ctx: { jp: BILL, en: '' }, prompt: { en: 'What does 言うことなし mean here?' },
      options: [e('Nothing more to say: it\'s perfect.', 1), e('He has forgotten what to say.', 0, 'こと なし: there is nothing (to complain of). It\'s praise.'), e('He is not allowed to speak.', 0, 'It\'s a set phrase for "perfect".')] })],
    I: [ch({ item: 'v:言う', ctx: { jp: BILL, en: '' }, prompt: { en: 'Why does the line get a laugh?' },
      options: [e('湯 (yu) and 言う (yū) sound alike: "a fine bath" runs into "nothing to say".', 1), e('Because the bath is cold.', 0, 'いい湯: it\'s a good bath.'), e('Because he forgets his line.', 0, 'He says it exactly; the joke is the sound.')] })],
    A: [ch({ item: 'g:adv_to_iu_yori', ctx: { jp: BILL + ' ／ オナツ ： 「{湯|ゆ} に {入|はい}って 、 {湯|ゆ} を {忘|わす}れる 」', en: '' }, prompt: { en: 'Why is Onatsu\'s version not a punchline?' },
      options: [e('It loses the play on 湯 and 言う: without the sound-joke there is nothing to land.', 1), e('Hers is too short.', 0, 'Length isn\'t the problem; the pun is.'), e('Hers is in the wrong politeness level.', 0, 'Both are plain speech.')] })],
  } };

  // ---- Kanae's story room (A38) ----------------------------------------------------------------------------------------
  const P1 = '{兄弟|きょうだい} は {毎朝|まいあさ} {一緒|いっしょ} に {湯|ゆ} に {入|はい}った', P2 = '{喧嘩|けんか} を して 、 {話|はな}さなく なった', P3 = '{湯|ゆ} が {冷|つめ}たく なった', P4 = '{妹|いもうと} が {二人|ふたり} を {連|つ}れて {来|き}た';
  C.challenges['yn.story_order'] = { title: T('{冷|つめ}たく なった {湯|ゆ}', 'The Spring That Went Cold'), tiers: {
    F: [OR({ item: 'v:湯', prompt: { en: 'Put the story back in order.' }, tiles: ['きょうだい は いっしょ に ゆ に はいった', 'けんか を した', 'ゆ が つめたく なった', 'いもうと が ふたり を つれて きた'],
      answer: ['きょうだい は いっしょ に ゆ に はいった', 'けんか を した', 'ゆ が つめたく なった', 'いもうと が ふたり を つれて きた'], orderHint: { en: 'Together; the quarrel; the cold; the sister.' } })],
    E: [OR({ item: 'v:湯', prompt: { en: 'Put the four panels back in order.' }, tiles: [P3, P1, P4, P2], answer: [P1, P2, P3, P4], orderHint: { en: 'First the brothers together, then the quarrel, then the cold spring, then the sister.' } })],
    I: [OR({ item: 'g:you_ni_naru', prompt: { en: 'Order the panels by cause and effect.' }, tiles: [P4, P3, P2, P1], answer: [P1, P2, P3, P4], orderHint: { en: 'Not speaking made the spring go cold; the sister came to put that right.' } })],
    A: [OR({ item: 'g:you_ni_naru', prompt: { en: 'Order the panels; the story turns on the moment they stop speaking.' }, tiles: [P2, P4, P1, P3], answer: [P1, P2, P3, P4], orderHint: { en: '話さなく なった is the turn: everything after follows from it.' } })],
  } };
  C.challenges['yn.story_question'] = { title: T('{話|はなし} の {後|あと} で', 'After the story'), optional: true, tiers: {
    F: [ch({ item: 'v:話す', ctx: { jp: 'だれ も はなさない ゆ は 、 あたたまらない 。', en: '' }, prompt: { en: 'In the story, what warms the spring?' },
      options: [e('People talking.', 1), e('The sun.', 0, 'はなさない ゆ は あたたまらない: the talk is what warms it.')] })],
    E: [ch({ item: 'v:話す', ctx: { jp: '{二人|ふたり} は {黙|だま}って {入|はい}り 、 やがて 、 「{冷|つめ}たい な 」 と {同|おな}じ {言葉|ことば} を {言|い}った 。', en: '' }, prompt: { en: 'What did the brothers say first, together?' },
      options: [e('"It\'s cold."', 1), e('"I\'m sorry."', 0, 'They never apologise in the story: they just say the same thing.'), e('Nothing.', 0, 'At last they both spoke.')] })],
    I: [ch({ item: 'g:you_ni_naru', ctx: { jp: '{兄|あに} は {朝|あさ} に 、 {弟|おとうと} は {夜|よる} に {入|はい}る よう に なった 。', en: '' }, prompt: { en: 'What does よう に なった tell you here?' },
      options: [e('It became their habit: a change that settled in over time.', 1), e('They were told to by someone.', 0, 'よう に いわれた would be that.'), e('It happened only once.', 0, 'よう に なった describes a lasting change.')] })],
    A: [ch({ item: 'g:adv_kara_koso', ctx: { jp: '', en: 'The sister brings them at the same hour; they say the same words about the cold.' }, prompt: { en: 'What does Kanae seem to be saying about Steamhollow?' },
      options: [e('That sharing even a complaint can be a way back to speaking; the valley\'s two houses could start there.', 1), e('That quarrels are best left alone until they cool.', 0, 'Left alone, the spring went cold: the opposite.'), e('That sisters should settle every quarrel.', 0, 'The sister only brings them to the same place; the words are theirs.')] })],
  } };
})(RB.content);
