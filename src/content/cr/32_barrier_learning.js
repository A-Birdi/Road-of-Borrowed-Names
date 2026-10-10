/* The Cloudroad, Chapter 10: the Mist Barrier's language tasks (expansion P12; plan R2 "papers at the Mist Barrier",
 * A48 forms, A41 role and register). Travel papers (通行手形) and checkpoints (関所) are real Edo-period history; this
 * barrier, its custom of surety and its people are the game's own.
 *   cr.papers_fill   the blanked travel papers filled again, field by field: F the kana labels, E the fields in kanji
 *                    (名前・出発地・行き先・目的), I the purpose written plainly and fully, A the purpose in written style
 *   cr.papers_seal   the station seals stamped on the papers checked, and the forged one found: F し written シ, E 木
 *                    carved 本, I 坂 carved 板, A 霧 carved 露 (shapes that are near, the forger's mistakes)
 *   cr.interview     the keeper's questions answered in suitably formal Japanese: E です・ます, I humble 参ります
 *                    against honorific いらっしゃる for oneself, A the full set (お越し, 参る, 頼まれて, not 調べろ)
 *   cr.guarantee     what to tell Kumoi's headwoman so she can vouch for you: the truth, all of it */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const T = (jp, en) => ({ jp, en });
  const ch = (o) => Object.assign({ kind: 'choose' }, o);
  const o = (jp, ok, why) => Object.assign({ jp, ok: !!ok }, why ? { why: { en: why } } : {});

  // ---- the papers, filled again --------------------------------------------------------------------------------------
  C.challenges['cr.papers_fill'] = { title: T('{通行手形|つうこうてがた}', 'The travel papers'), tiers: {
    F: [
      ch({ item: 'v:名前', ctx: { jp: 'てがた ： 「なまえ ＿＿ 、 いきさき ＿＿ 、 もくてき ＿＿」', en: '' }, prompt: { en: 'Your name has faded from the papers. Which blank is it written in?' }, options: [o('なまえ', 1), o('いきさき', 0, 'いきさき is where you are going.'), o('もくてき', 0, 'もくてき is what you are going for.')] }),
      ch({ item: 'v:行き先', ctx: { jp: 'てがた ： 「いきさき ＿＿」', en: '' }, prompt: { en: 'Where are you going? The pass at the top of the Cloudroad.' }, options: [o('くもじとうげ', 1), o('おいわけ', 0, 'Oiwake is where you came from, at the bottom.')] }),
    ],
    E: [
      ch({ item: 'v:出発', ctx: { jp: '{手形|てがた} ： 「{名前|なまえ} ＿＿ 、 {出発地|しゅっぱつち} ＿＿ 、 {行|い}き{先|さき} ＿＿ 、 {目的|もくてき} ＿＿」', en: '' }, prompt: { en: 'Where do you write "Lanternfall", where you set out from?' }, options: [o('{出発地|しゅっぱつち}', 1), o('{行|い}き{先|さき}', 0, '行き先 is where you are going.'), o('{目的|もくてき}', 0, '目的 is why you are going.')] }),
      ch({ item: 'v:行き先', ctx: { jp: '{手形|てがた} ： 「{行|い}き{先|さき} ＿＿」', en: '' }, prompt: { en: 'Fill in where you are going.' }, options: [o('{雲路峠|くもじとうげ}', 1), o('{灯落|ひおち}', 0, 'That is where you came from.'), o('{追分宿|おいわけじゅく}', 0, 'That is the first station, behind you.')] }),
    ],
    I: [
      ch({ item: 'v:目的', ctx: { jp: '{手形|てがた} ： 「{目的|もくてき} ＿＿」 。 {関所|せきしょ} で は 、 {目的|もくてき} を はっきり {書|か}く こと 。', en: '' }, prompt: { en: 'Write your purpose, plainly and fully.' }, options: [o('{灯落|ひおち} の {議会|ぎかい} に {頼|たの}まれて 、 {雲路|くもじ} の {灯|ひ} の {様子|ようす} を {見|み}る ため', 1), o('{見物|けんぶつ}', 0, 'Sightseeing is not why you came, and it says nothing of the council.'), o('{用事|ようじ} が ある ため', 0, 'Too vague: a checkpoint wants to know what business.')] }),
    ],
    A: [
      ch({ item: 'v:依頼', ctx: { jp: '{手形|てがた} ： 「{目的|もくてき} ＿＿」 （{書|か}き{言葉|ことば} で）', en: '' }, prompt: { en: 'Your purpose, in the written style papers use.' }, options: [o('{灯落|ひおち} {議会|ぎかい} の {依頼|いらい} に より 、 {雲路|くもじ} {灯火|とうか} の {調査|ちょうさ} の ため', 1), o('{議会|ぎかい} に {言|い}われた から 、 {灯|ひ} を {見|み}に {行|い}く', 0, 'True, but spoken style: papers are written as 〜により 〜のため.'), o('{雲路|くもじ} {灯火|とうか} {調査|ちょうさ} {完了|かんりょう}', 0, 'That says the inspection is finished; you are only going to do it.')] }),
    ],
  } };

  // ---- the seals, checked ------------------------------------------------------------------------------------------
  C.challenges['cr.papers_seal'] = { title: T('{宿場|しゅくば} の {印|いん}', 'The station seals'), tiers: {
    F: [ch({ item: 'k:し', ctx: { jp: 'てがた の いん ： 「おいわけ」 「すぎのき」 「さかした」 「うまがえシ」', en: '' }, prompt: { en: 'One seal was carved by someone who couldn\'t write the name. Which?' }, options: [o('「うまがえシ」', 1), o('「すぎのき」', 0, 'すぎのき is written right.'), o('「さかした」', 0, 'さかした is written right.')] })],
    E: [ch({ item: 'v:杉', ctx: { jp: '{手形|てがた} の {印|いん} ： 「{追分|おいわけ}」 「{杉|すぎ}ノ{本|もと}」 「{坂下|さかした}」 「{中山|なかやま}」', en: '' }, prompt: { en: 'One station seal is forged. Which?' }, options: [o('「{杉|すぎ}ノ{本|もと}」', 1), o('「{坂下|さかした}」', 0, '坂下 is right.'), o('「{中山|なかやま}」', 0, '中山 is right.')] })],
    I: [ch({ item: 'v:坂下', ctx: { jp: '{手形|てがた} の {印|いん} ： 「{杉|すぎ}ノ{木|き}」 「{板下|いたした}」 「{中山|なかやま}」 「{馬返|うまがえ}し」', en: '' }, prompt: { en: 'One station seal is forged. Which? (Read them closely.)' }, options: [o('「{板下|いたした}」', 1), o('「{杉|すぎ}ノ{木|き}」', 0, 'That is Suginoki, right.'), o('「{馬返|うまがえ}し」', 0, 'That is Umagaeshi, right.')] })],
    A: [ch({ item: 'v:霧下', ctx: { jp: '{手形|てがた} の {印|いん} ： 「{坂下|さかした}」 「{中山|なかやま}」 「{馬返|うまがえ}し」 「{露下|つゆした}」', en: '' }, prompt: { en: 'One station seal is forged. Which? (Read them closely.)' }, options: [o('「{露下|つゆした}」', 1), o('「{坂下|さかした}」', 0, '坂下 is right.'), o('「{馬返|うまがえ}し」', 0, '馬返し is right.')] })],
  } };

  // ---- the interview ----------------------------------------------------------------------------------------------
  C.challenges['cr.interview'] = { title: T('{関守|せきもり} の {問|と}い', 'The keeper\'s questions'), tiers: {
    F: [
      ch({ item: 'g:register_polite_plain', ctx: { jp: 'ウジエ ： 「どちら から きました か 。」', en: '' }, prompt: { en: 'Answer the keeper politely: you came from Lanternfall.' }, options: [o('ひおち から きました 。', 1), o('ひおち から きた よ 。', 0, 'At a checkpoint, speak politely: きました.')] }),
      ch({ item: 'g:register_polite_plain', ctx: { jp: 'ウジエ ： 「なに を しに いきます か 。」', en: '' }, prompt: { en: 'Answer politely: to see the lamps of the Cloudroad.' }, options: [o('くもじ の ひ を みに いきます 。', 1), o('ひ を みに いく 。', 0, 'Plain form to an official sounds rude. いきます.')] }),
    ],
    E: [
      ch({ item: 'g:register_polite_plain', ctx: { jp: 'ウジエ ： 「どちら から {来|き}ました か 。」', en: '' }, prompt: { en: 'Answer the keeper in polite Japanese.' }, options: [o('{灯落|ひおち} から {来|き}ました 。', 1), o('{灯落|ひおち} から {来|き}た よ 。', 0, 'Too casual for a checkpoint official.'), o('{灯落|ひおち} だ 。', 0, 'Curt: answer with です・ます.')] }),
      ch({ item: 'g:register_polite_plain', ctx: { jp: 'ウジエ ： 「{何|なん} の ため に {通|とお}ります か 。」', en: '' }, prompt: { en: 'Explain your purpose politely.' }, options: [o('{議会|ぎかい} に {頼|たの}まれて 、 {雲路|くもじ} の {灯|ひ} を {見|み}に {行|い}きます 。', 1), o('{灯|ひ} を {見|み}に {行|い}く ん だ 。', 0, 'Plain form: use です・ます with an official.'), o('ちょっと {見物|けんぶつ} です 。', 0, 'Not what you are here for, and too vague.')] }),
    ],
    I: [
      ch({ item: 'g:keigo_kenjo', ctx: { jp: 'ウジエ ： 「どちら から お{越|こ}し に なりました か 。」', en: '' }, prompt: { en: 'He uses honorific language for you. Answer about yourself in humble form.' }, options: [o('{灯落|ひおち} から {参|まい}りました 。', 1), o('{灯落|ひおち} から いらっしゃいました 。', 0, 'いらっしゃる is honorific: it raises the one who comes. Never use it of yourself; 参る lowers yourself.'), o('{灯落|ひおち} から {来|き}た 。', 0, 'Plain: to a formal question, answer in humble form.')] }),
      ch({ item: 'g:keigo_kenjo', ctx: { jp: 'ウジエ ： 「どちら へ {行|い}かれます か 。」', en: '' }, prompt: { en: 'Where are you going? Answer in humble form.' }, options: [o('{雲路峠|くもじとうげ} まで {参|まい}ります 。', 1), o('{雲路峠|くもじとうげ} へ いらっしゃいます 。', 0, 'Honorific about yourself: use 参ります.'), o('{峠|とうげ} に {行|い}く つもり だ 。', 0, 'Plain style: this is a formal interview.')] }),
    ],
    A: [
      ch({ item: 'g:keigo_kenjo', ctx: { jp: 'ウジエ ： 「{何|なん} の ご{用|よう} で お{通|とお}り に なります か 。」', en: '' }, prompt: { en: 'Explain your business formally (read closely: two are near).' }, options: [o('{灯落|ひおち} の {議会|ぎかい} に {頼|たの}まれ 、 {雲路|くもじ} の {灯|ひ} の {様子|ようす} を {見|み}に {参|まい}りました 。', 1), o('{灯落|ひおち} の {議会|ぎかい} が 「{雲路|くもじ} を {調|しら}べろ 」 と {言|い}った ので 、 {来|き}ました 。', 0, '調べろ is a bare command form, and it makes the council sound rough: say they asked (頼まれ).'), o('{灯落|ひおち} の {議会|ぎかい} に {頼|たの}まれ 、 {雲路|くもじ} の {灯|ひ} の {様子|ようす} を ご{覧|らん} に {参|まい}りました 。', 0, 'ご覧になる is honorific: it raises the one who looks. You are the one looking: 見に参りました.')] }),
    ],
  } };

  // ---- the guarantee at Kumoi -------------------------------------------------------------------------------------
  C.challenges['cr.guarantee'] = { title: T('{請状|うけじょう}', 'A letter of guarantee'), tiers: {
    F: [ch({ item: 'v:本当', ctx: { jp: 'シズ ： 「どうして わたし が あなた を しんじる の ？」', en: '' }, prompt: { en: 'Tell her the truth.' }, options: [o('てがた の なまえ が きえました 。 なかま が せきしょ で まって います 。', 1), o('なにも ありません 。 しんじて ください 。', 0, 'She needs to know why you need it.')] })],
    E: [ch({ item: 'v:本当', ctx: { jp: 'シズ ： 「{会|あ}った こと も ない {人|ひと} の {請状|うけじょう} を 、 どうして {書|か}く と {思|おも}う の ？」', en: '' }, prompt: { en: 'What will you tell her?' }, options: [o('{手形|てがた} の {名前|なまえ} が {消|き}えて 、 {仲間|なかま} が {関所|せきしょ} で {待|ま}って います 。 {全部|ぜんぶ} {話|はな}します 。', 1), o('{関守|せきもり} が {書|か}いて いい と {言|い}いました 。', 0, 'He didn\'t say that; he said to ask her.'), o('{急|いそ}いで いる ので 、 {早|はや}く {書|か}いて ください 。', 0, 'Hurrying her gives her no reason to trust you.')] })],
    I: [ch({ item: 'g:kr_to_iu', ctx: { jp: 'シズ ： 「{請状|うけじょう} と いう の は 、 わたし が あなた の {代|か}わり に {責任|せきにん} を {持|も}つ と いう こと よ 。」', en: '' }, prompt: { en: 'She is taking responsibility for you. What does she need from you?' }, options: [o('{本当|ほんとう} の こと を {全部|ぜんぶ} 。 {手形|てがた} の こと も 、 {仲間|なかま} が {残|のこ}って いる こと も 。', 1), o('{立派|りっぱ} な {話|はなし} を {少|すこ}し {大|おお}きめ に 。', 0, 'Making it bigger than it is would be the very thing a guarantee can\'t stand.'), o('{関所|せきしょ} の {規則|きそく} の {説明|せつめい} だけ 。', 0, 'She knows the rules; she wants to know you.')] })],
    A: [ch({ item: 'g:keigo_kenjo', ctx: { jp: 'シズ ： 「{見|み}ず {知|し}らず の {方|かた} の {請状|うけじょう} 。 わたし が {請|う}け{合|あ}う に {足|た}る {訳|わけ} を 、 お{聞|き}かせ {願|ねが}えます か 。」', en: '' }, prompt: { en: 'Give her your reasons, formally and truthfully (read closely: two are near).' }, options: [o('{手形|てがた} の {名|な} が {消|き}え 、 {連|つ}れ が {関|せき} に {残|のこ}って おります 。 {包|つつ}み{隠|かく}さず お{話|はな}し いたします 。', 1), o('{手形|てがた} の {名|な} が {消|き}えました が 、 {大|たい}した こと で は ございません 。', 0, 'Waving it away is no reason for her to vouch.'), o('{連|つ}れ が {関|せき} に {残|のこ}って いらっしゃいます ので 、 お{書|か}き ください 。', 0, 'いらっしゃる raises your own companion to an outsider; and it asks before giving reasons.')] })],
  } };
})(RB.content);
