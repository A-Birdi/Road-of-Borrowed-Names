/* The Cloudroad, Chapter 10: the side stories' language tasks (expansion P12e; the scenes are in 26_scenes_side.js).
 *   cr.guest_book  the Matsuba's guest book: Tatsu's booking and what settles it. F くれむつ まで に (by dusk), E まで
 *                  against までに (until / by), I 〜ば in 「過ぎれば、取り消し」, A settling it fairly by what is written
 *                  (〜わけではない). 暮れ六つ, the old hour of dusk, is real Edo-period timekeeping.
 *   cr.map_check   Rin's map: which of the reports were walked and which were told, kept apart by how they are said
 *                  (F the plain fact you saw against the one you heard, E と言っていました, I そうです and らしい, A との
 *                  こと in a map's note). */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const T = (jp, en) => ({ jp, en });
  const ch = (o) => Object.assign({ kind: 'choose' }, o);
  const o = (jp, ok, why) => Object.assign({ jp, ok: !!ok }, why ? { why: { en: why } } : {});
  const e = (en, ok, why) => Object.assign({ en, ok: !!ok }, why ? { why: { en: why } } : {});

  C.challenges['cr.guest_book'] = { title: T('{松葉屋|まつばや} の {宿帳|やどちょう}', 'The Matsuba\'s guest book'), tiers: {
    F: [ch({ item: 'g:prt_kara_made', ctx: { jp: 'やどちょう ： 「タツ さま 。 いっぱく 。 くれむつ まで に つく こと 。」', en: '' }, prompt: { en: 'Tatsu arrived late at night, long after dusk (くれむつ). Was he in time for his booking?' },
      options: [o('まにあわなかった 。', 1), o('まにあった 。', 0, 'くれむつ まで に: by dusk. He came after it.')] })],
    E: [ch({ item: 'g:prt_kara_made', ctx: { jp: '{宿帳|やどちょう} ： 「タツ {様|さま} 。 {一泊|いっぱく} 。 {暮|く}れ{六|む}つ まで に お{着|つ}き の こと 。」', en: '' }, prompt: { en: 'What does 暮れ六つまでに mean here?' },
      options: [e('By dusk, at the latest: a deadline.', 1), e('Until dusk: all the time up to then.', 0, 'まで alone is "until"; までに is "by": a deadline.'), e('After dusk.', 0, 'までに: no later than dusk.')] })],
    I: [ch({ item: 'g:cond_ba', ctx: { jp: '{宿帳|やどちょう} ： 「{暮|く}れ{六|む}つ まで に お{着|つ}き の こと 。 {過|す}ぎれば 、 {取|と}り{消|け}し 。」', en: '' }, prompt: { en: 'Tatsu came late at night. What does the entry say happened to his booking?' },
      options: [e('Once dusk had passed it was cancelled (過ぎれば: if it passes).', 1), e('It held until he came, however late.', 0, '過ぎれば、取り消し: if the time passes, it is cancelled.'), e('It was moved to the Take.', 0, 'The Matsuba\'s book says nothing about the Take.')] })],
    A: [ch({ item: 'g:adv_wake_dewa_nai', ctx: { jp: '{宿帳|やどちょう} ： 「…… {暮|く}れ{六|む}つ まで に お{着|つ}き の こと 。 {過|す}ぎれば 、 {取|と}り{消|け}し 。」 タツ は {夜|よる} {遅|おそ}く {着|つ}いて 、 {竹屋|たけや} で {寝|ね}た 。', en: '' }, prompt: { en: 'Otaki asks you to settle it fairly, by what is written. What do you say?' },
      options: [o('{予約|よやく} が なかった わけ で は ありません 。 でも 、 {暮|く}れ{六|む}つ を {過|す}ぎた ので 、 {取|と}り{消|け}し です 。 その {夜|よる} は 、 {竹屋|たけや} の お{客|きゃく} です 。', 1),
        o('{予約|よやく} が あった の だ から 、 {松葉屋|まつばや} の お{客|きゃく} です 。', 0, 'The entry itself says the booking lapses after dusk.'),
        o('{予約|よやく} など 、 {初|はじ}め から なかった の です 。', 0, 'It was there in the book; it lapsed.')] })],
  } };

  C.challenges['cr.map_check'] = { title: T('リン の {地図|ちず}', 'Rin\'s map'), tiers: {
    F: [ch({ item: 'v:地図', ctx: { jp: 'リン ： 「がけみち は 、 あなた が あるいた ？ それ とも 、 きいた ？」 ／ あなた ： 「がけみち は 、 タツ さん に きいた 。」', en: '' }, prompt: { en: 'Rin draws what you walked in black and what you were told in red. What colour does the ledge get?' },
      options: [e('Red: you heard about it from Tatsu.', 1), e('Black.', 0, 'You were told about it; you didn\'t walk it.')] }),
      ch({ item: 'v:地図', ctx: { jp: 'あなた ： 「さわ の あさせ は 、 じぶん で わたった 。」', en: '' }, prompt: { en: 'And the ford on the stream?' },
      options: [e('Black: you crossed it yourself.', 1), e('Red.', 0, 'じぶん で わたった: you crossed it yourself.')] })],
    E: [ch({ item: 'g:cr_to_itte', ctx: { jp: '「タツ さん は 『{崖道|がけみち} は {大|おお}きな {石|いし} で {通|とお}れない 』 と {言|い}って いました 。」', en: '' }, prompt: { en: 'You tell Rin this. Black (walked) or red (told)?' },
      options: [e('Red: と言っていました passes on Tatsu\'s words.', 1), e('Black: it\'s said as a plain fact.', 0, 'The sentence says who said it: Tatsu.')] })],
    I: [ch({ item: 'g:sou_hear', ctx: { jp: 'Ａ 「{沢|さわ} の {浅瀬|あさせ} は 、 {石|いし} を {踏|ふ}んで {渡|わた}れました 。」 Ｂ 「{霧|きり} の {坂|さか} の {旧道|きゅうどう} は 、 {崖|がけ} の {縁|ふち} が {見|み}えない そう です 。」 Ｃ 「{崖道|がけみち} は 、 {石|いし} で ふさがって いる らしい です 。」', en: '' }, prompt: { en: 'Which of these reports is something you saw yourself?' },
      options: [e('A only: B and C are passed on (そうです, らしい).', 1), e('A and B.', 0, 'そうです marks B as something heard.'), e('All three.', 0, 'らしい and そうです both say "told".')] })],
    A: [ch({ item: 'g:cr_tono', ctx: { jp: 'リン の {地図|ちず} の {書|か}き{込|こ}み ： 「{崖道|がけみち} 、 {近道|ちかみち} 。」 （{古|ふる}い {絵図|えず} から {写|うつ}した もの ）', en: '' }, prompt: { en: 'How should the note be put right, so the map says how it is known?' },
      options: [o('「{崖道|がけみち} は {大石|おおいし} で {通|とお}れない と の こと 。 （タツ さん の {話|はなし} ） 」', 1),
        o('「{崖道|がけみち} は {大石|おおいし} で {通|とお}れない 。」', 0, 'Said as a plain fact, it claims Rin saw it; との こと marks it as reported.'),
        o('「{崖道|がけみち} 、 {近道|ちかみち} と の こと 。」', 0, 'Marked as reported, but still the old sketch-map\'s mistake.')] })],
  } };
})(RB.content);
