/* Steamhollow, Chapter 11: the language (expansion P13; plan R3 "Language focus": F kana on signs, room numbers, food
 * words; E requests, permission, refusals, rules; I changing arrangements, apologies and reasons, invitations; A
 * hospitality keigo in comprehension, mediating with tact, implication in complaints). The chapter's grammar points,
 * and its reading tasks: the two inns' house rules (different on purpose: hot springs vary by place, and the game says
 * so, A42), the vents' notice (A11) and the written agreement you help word (A17). The encounters' language steps are
 * in 31_encounters.js and 33_creatures.js. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const T = (jp, en) => ({ jp, en });
  const ch = (o) => Object.assign({ kind: 'choose' }, o);
  const o = (jp, ok, why) => Object.assign({ jp, ok: !!ok }, why ? { why: { en: why } } : {});
  const e = (en, ok, why) => Object.assign({ en, ok: !!ok }, why ? { why: { en: why } } : {});

  // ---- the grammar this chapter teaches ------------------------------------------------------------------------------
  if (RB.grammar && RB.grammar.add) RB.grammar.add([
    { id: 'yn_wa_chotto', lv: 'E', title: '～は ちょっと… (a soft no)', pat: '{名詞|めいし} ＋ は ちょっと …',
      en: 'The gentlest common way to decline: name the thing, add は ちょっと, and stop. The unfinished sentence does the refusing; nobody has to hear the word "no". Add すみません first, and a reason after if you like: すみません、それ は ちょっと …。',
      ex: [{ jp: 'すみません 、 {薬|くすり} は ちょっと …… 。', en: 'Sorry, medicine is… (not for me).' }, { jp: '{今日|きょう} は ちょっと {忙|いそが}しい ので …… 。', en: 'Today I\'m a bit busy, so…' }] },
    { id: 'yn_omotenashi', lv: 'A', title: 'Hospitality keigo (おもてなし の {敬語|けいご})', pat: 'ご{予約|よやく} ・ {承知|しょうち}いたしました ・ ～で ございます ・ お～ください',
      en: 'The language an inn uses to its guests: humble forms for what the staff do (いたします, {承知|しょうち}いたしました "certainly"), respectful ones for what the guest does (お{越|こ}し くださいました "you have come"), ご/お before the guest\'s things (ご{予約|よやく}, お{部屋|へや}), and で ございます for です. Listen for who is doing what.',
      ex: [{ jp: 'ご{予約|よやく} の お{名前|なまえ} を {伺|うかが}って も よろしい でしょう か 。', en: 'May I ask the name on your reservation?' }, { jp: '{本日|ほんじつ} は {満室|まんしつ} で ございます 。', en: 'We are fully booked today.' }] },
    { id: 'yn_kedo_hint', lv: 'A', title: '～んです けど … (saying it without saying it)', pat: '{普通形|ふつうけい} ＋ ん です けど ／ が …',
      en: 'A sentence left hanging on けど or が hands the rest to the listener: ちょっと にぎやか な ん です けど … "it\'s a little lively, but…" means "it\'s noisy, please do something" without the complaint ever being said. In a complaint, listen for what comes before the けど; the request is in the silence after it.',
      ex: [{ jp: '{夜|よる} に なる と 、 ちょっと にぎやか な ん です けど …… 。', en: 'It gets a bit lively at night… (please do something about the noise)' }, { jp: 'お{湯|ゆ} が 、 {少|すこ}し ぬるい よう な {気|き} が する ん です が …… 。', en: 'I have a feeling the water is a little lukewarm… (it\'s cold)' }] },
    { id: 'yn_owabi', lv: 'E', title: 'Saying sorry: ごめん ・ すみません ・ {申|もう}し{訳|わけ}ありません', pat: 'ごめん（ね） ／ すみません でした ／ {申|もう}し{訳|わけ} ありません ・ {言|い}い{過|す}ぎた',
      en: 'Three steps of apology: ごめん among friends, すみません (でした) to most people, {申|もう}し{訳|わけ} ありません (ございません) at work or to a guest. To make up after a quarrel, name what you did: {言|い}い{過|す}ぎた "I went too far", {言|い}い{方|かた} が きつかった "I put it too harshly". こちら こそ "it\'s me who should apologise" answers an apology with your own.',
      ex: [{ jp: 'さっき は {言|い}い{過|す}ぎた 。 ごめん 。', en: 'I went too far just now. Sorry.' }, { jp: 'こちら こそ 、 すみません でした 。', en: 'No, I\'m the one who\'s sorry.' }] },
  ], 'yn');

  // ---- the Upper House's rules (上の湯), framed by the stair -----------------------------------------------------------
  const KAMI = '{一|いち} 、 {湯船|ゆぶね} に {入|はい}る {前|まえ} に 、 {体|からだ} を {流|なが}して ください 。 {二|に} 、 {手拭|てぬぐ}い を {湯船|ゆぶね} に {入|い}れて は いけません 。 {三|さん} 、 {湯|ゆ} の {中|なか} で は 、 お{静|しず}か に 。 {四|よん} 、 {夜|よる} {十時|じゅうじ} に 、 {男湯|おとこゆ} と {女湯|おんなゆ} が {入|い}れ{替|か}わります 。';
  C.challenges['yn.rules_kami'] = { title: T('{上|かみ}の{湯|ゆ} の {心得|こころえ}', 'The Upper House\'s bath rules'), tiers: {
    F: [ch({ item: 'v:湯', ctx: { jp: '{暖簾|のれん} の {字|じ} ： 「おとこ 」 「おんな 」 「かしきり 」', en: '' }, prompt: { en: 'Which curtain leads to the reserved bath?' },
      options: [o('かしきり', 1), o('おとこ', 0, 'おとこ: the men\'s bath.'), o('おんな', 0, 'おんな: the women\'s bath.')] }),
      ch({ item: 'v:手拭い', ctx: { jp: 'てぬぐい は 、 ゆぶね に いれないで ください 。', en: '' }, prompt: { en: 'Where does your towel go?' },
      options: [e('Not in the bath: on your head or beside it.', 1), e('Into the bath with you.', 0, 'いれないで ください: please don\'t put it in.')] })],
    E: [ch({ item: 'g:v_temo_ii', ctx: { jp: KAMI, en: '' }, prompt: { en: 'What does rule 2 say?' },
      options: [e('Towels must not go into the bath.', 1), e('Towels may go into the bath.', 0, '〜ては いけません: must not.'), e('Towels are provided in the bath.', 0, 'It is about putting your towel in the water: you mustn\'t.')] }),
      ch({ item: 'g:v_te_kudasai', ctx: { jp: KAMI, en: '' }, prompt: { en: 'What should you do before getting in?' },
      options: [e('Rinse yourself off.', 1), e('Take your towel in.', 0, 'Rule 2 forbids that.'), e('Wait until ten o\'clock.', 0, 'Ten o\'clock is when the sides swap, rule 4.')] })],
    I: [ch({ item: 'g:conj_node', ctx: { jp: KAMI + ' {夜|よる} は {暗|くら}い ので 、 {暖簾|のれん} の {色|いろ} を よく {見|み}て から お{入|はい}り ください 。', en: '' }, prompt: { en: 'It is half past ten at night. This morning you used the bath behind the indigo curtain. What should you go by now?' },
      options: [e('The curtain colours as they hang now: the sides have swapped at ten, and the curtains with them.', 1), e('The same side as this morning: the bath doesn\'t move.', 0, 'Rule 4: at ten the two sides change over.'), e('Whichever is quieter.', 0, 'The notice says to look at the curtains\' colour.')] })],
    A: [ch({ item: 'g:yn_omotenashi', ctx: { jp: 'オキヨ ： 「ご{入浴|にゅうよく} の {前|まえ} に 、 かけ{湯|ゆ} を お{願|ねが}い いたします 。 お{手拭|てぬぐ}い は 、 {湯船|ゆぶね} に お{入|い}れ に ならない よう 、 お{願|ねが}い {申|もう}し{上|あ}げます 。」', en: '' }, prompt: { en: 'What is Okiyo asking of you, and who does each verb belong to?' },
      options: [e('You rinse before your bath and keep your towel out of the water; お入れにならない is honorific, about you, and お願い申し上げます is her humble request.', 1),
        e('She will rinse you and hold your towel.', 0, 'お願い いたします asks you to do it; it is not an offer.'),
        e('Towels may go in if you rinse first.', 0, 'お入れにならないよう: so that you do not put it in.')] })],
  } };

  // ---- the Lower House's rules (下の湯): three lines on a board -------------------------------------------------------
  const SHIMO = '{体|からだ} を {流|なが}して から {入|はい}る こと 。 {手拭|てぬぐ}い は {湯|ゆ} に {入|い}れない こと 。 {露天風呂|ろてんぶろ} は 、 {一晩中|ひとばんじゅう} {入|はい}って よい 。';
  C.challenges['yn.rules_shimo'] = { title: T('{下|しも}の{湯|ゆ} の {決|き}まり', 'The Lower House\'s rules'), tiers: {
    F: [ch({ item: 'v:露天風呂', ctx: { jp: 'ろてんぶろ は 、 ひとばんじゅう はいって よい 。', en: '' }, prompt: { en: 'It\'s two in the morning. Can you use the Lower House\'s open-air bath?' },
      options: [e('Yes: it is open all night.', 1), e('No: it closes at midnight.', 0, 'That is the Upper House\'s rule, not this one: ひとばんじゅう, all night.')] })],
    E: [ch({ item: 'g:v_temo_ii', ctx: { jp: SHIMO, en: '' }, prompt: { en: 'Which is true at the Lower House?' },
      options: [e('You may use the open-air bath at any hour of the night.', 1), e('The men\'s and women\'s sides swap at ten.', 0, 'That is the Upper House. Nothing here says so.'), e('Towels may go into the water.', 0, '入れない こと: they must not.')] })],
    I: [ch({ item: 'g:v_te_kara', ctx: { jp: SHIMO + ' ／ {上|かみ}の{湯|ゆ} ： {入浴|にゅうよく} は {朝|あさ} {六時|ろくじ} から {夜|よる} {十二時|じゅうにじ} まで 。', en: '' }, prompt: { en: 'You want a bath after midnight. Where, and what first?' },
      options: [e('The Lower House\'s open-air bath, after rinsing off.', 1), e('The Upper House, after rinsing off.', 0, 'The Upper House closes at midnight.'), e('Either; rinsing is only an Upper House rule.', 0, 'Both houses ask you to rinse first: a real custom at most hot springs.')] })],
    A: [ch({ item: 'v:決まり', ctx: { jp: SHIMO, en: '' }, prompt: { en: 'Why are the first two lines written ending in こと?' },
      options: [e('〜こと on a notice is a written instruction: "Rinse before entering." Rules said briefly, as a house\'s own.', 1), e('こと makes them questions to the guest.', 0, 'A question would end in か.'), e('こと means "it is a fact that" here: a description of what guests do.', 0, 'On a notice, 〜こと gives an instruction.')] })],
  } };

  // ---- the vents' notice (A11) --------------------------------------------------------------------------------------
  const VENT = '{弁|べん} は 、 {一度|いちど} に {一|ひと}つ だけ {開|あ}ける こと 。 {一|ひと}つ {開|あ}ける と 、 {湯気|ゆげ} は {別|べつ} の {道|みち} に {流|なが}れる 。 {奥|おく} の {弁|べん} の {取|と}っ{手|て} は 、 {道具置|どうぐお}き に ある 。';
  C.challenges['yn.vents_notice'] = { title: T('{湯守|ゆもり} の {張|は}り{紙|がみ}', 'The bath-keepers\' notice'), tiers: {
    F: [ch({ item: 'g:prt_dake_shika', ctx: { jp: 'べん は 、 いちど に ひとつ だけ あけて ください 。', en: '' }, prompt: { en: 'How many valves may be open at once?' },
      options: [e('One.', 1), e('All of them.', 0, 'ひとつ だけ: only one.'), e('None.', 0, 'You may open one.')] })],
    E: [ch({ item: 'g:prt_dake_shika', ctx: { jp: VENT, en: '' }, prompt: { en: 'The far valve has no handle. Where is it?' },
      options: [e('In the tool nook.', 1), e('Beside the near valve.', 0, '道具置き に ある: in the tool nook.'), e('Up in the spring house.', 0, 'The notice says the tool nook.')] })],
    I: [ch({ item: 'g:cond_to', ctx: { jp: VENT, en: '' }, prompt: { en: 'You open the near valve. What will happen, by the notice?' },
      options: [e('The steam will move into a different passage: one clears, another fills.', 1), e('All the steam will go out of the pipe and every passage will clear.', 0, '別 の 道 に 流れる: it flows into another passage.'), e('Nothing until both valves are open.', 0, 'Only one may be open at once.')] })],
    A: [ch({ item: 'g:cond_to', ctx: { jp: VENT, en: '' }, prompt: { en: 'Why does the notice use 開けると rather than 開けたら?' },
      options: [e('It states what always happens, like a law of the tunnels.', 1), e('It describes one particular time it happened.', 0, '〜たら would suit a single occasion; 〜と states a regular result.'), e('It asks you to open it.', 0, 'A request would be 開けて ください.')] })],
  } };

  // ---- the written agreement (A17): three clauses, worded by you --------------------------------------------------
  C.challenges['yn.agreement'] = { title: T('{湯|ゆ} の {取|と}り{決|き}め', 'The spring agreement'), tiers: {
    F: [ch({ item: 'v:湯', ctx: { jp: 'ロクベエ ： 「いち 。 ゆ は とけい で はかって 、 はんぶん ずつ わける 。」', en: '' }, prompt: { en: 'Which line says the water is shared out by the clock, half each?' },
      options: [o('ゆ は とけい で はかって 、 はんぶん ずつ わける 。', 1), o('ゆ は ぜんぶ 、 かみのゆ に いれる 。', 0, 'ぜんぶ かみのゆ: all of it to the Upper House.')] }),
      ch({ item: 'v:部屋', ctx: { jp: 'ロクベエ ： 「に 。 おね から きた ひと の ため の ゆ を つくる 。」', en: '' }, prompt: { en: 'Clause two is about whom?' },
      options: [e('The people who came down from the ridge.', 1), e('The bath-keepers.', 0, 'おね から きた ひと: people who came from the ridge.')] }),
      ch({ item: 'v:話す', ctx: { jp: 'ロクベエ ： 「さん 。 きまらない こと は 、 つき に いちど 、 はなす 。」', en: '' }, prompt: { en: 'What happens to what isn\'t settled?' },
      options: [e('They talk about it once a month.', 1), e('It is forgotten.', 0, 'つき に いちど はなす: they talk once a month.')] })],
    E: [ch({ item: 'g:prt_ni', ctx: { jp: '{一|いち} 。', en: 'Clause one: the water.' }, prompt: { en: 'Choose the wording for clause one: the water measured by the clock and shared half and half.' },
      options: [o('{湯|ゆ} は {時計|とけい} で {量|はか}って 、 {半分|はんぶん} ずつ {分|わ}けます 。', 1), o('{湯|ゆ} は {時計|とけい} を {見|み}ないで 、 {半分|はんぶん} ずつ {分|わ}けます 。', 0, 'The clock is the point: 時計で量って.'), o('{湯|ゆ} は {下|しも}の{湯|ゆ} に {全部|ぜんぶ} {流|なが}します 。', 0, 'That gives it all to one house.')] }),
      ch({ item: 'g:tame', ctx: { jp: '{二|に} 。', en: 'Clause two: the newcomers.' }, prompt: { en: 'Choose the wording for clause two: a bath for the people from the ridge.' },
      options: [o('{尾根|おね} から {来|き}た {人|ひと} の ため に 、 {湯|ゆ} を {一|ひと}つ {作|つく}ります 。', 1), o('{尾根|おね} から {来|き}た {人|ひと} は 、 {湯|ゆ} に {入|はい}って は いけません 。', 0, 'That shuts them out.')] }),
      ch({ item: 'g:v_mashou', ctx: { jp: '{三|さん} 。', en: 'Clause three: what isn\'t settled.' }, prompt: { en: 'Choose the wording for clause three: they will meet once a month to talk.' },
      options: [o('{決|き}まらない こと は 、 {月|つき} に {一度|いちど} 、 {寄合所|よりあいじょ} で {話|はな}しましょう 。', 1), o('{決|き}まらない こと は 、 もう {話|はな}さない で ください 。', 0, 'That ends the talking instead of keeping it going.')] })],
    I: [ch({ item: 'g:koto_ni_suru', ctx: { jp: '{一|いち} 。', en: 'Clause one: what they decided about the water.' }, prompt: { en: 'Which records the decision as a decision they made together?' },
      options: [o('{湯|ゆ} は {直|なお}した {水時計|みずどけい} で {量|はか}り 、 {半日|はんにち} ずつ {分|わ}ける こと に した 。', 1), o('{湯|ゆ} は {水時計|みずどけい} で {量|はか}る こと に なって いた 。', 0, 'こと に なって いた: had been arranged (by someone else, before); it doesn\'t record a decision made today.'), o('{湯|ゆ} を {分|わ}ける の は 、 やめる こと に した 。', 0, 'That stops sharing altogether.')] }),
      ch({ item: 'g:noni', ctx: { jp: '{二|に} 。', en: 'Clause two: the newcomers\' bath.' }, prompt: { en: 'Which is a fair clause (read closely: two are near)?' },
      options: [o('{尾根|おね} から {来|き}た {人|ひと} の {湯|ゆ} は 、 {両方|りょうほう} の {宿|やど} が {半分|はんぶん} ずつ {払|はら}う こと に する 。', 1), o('{尾根|おね} から {来|き}た {人|ひと} の {湯|ゆ} は 、 {下|しも}の{湯|ゆ} が {払|はら}う こと に する 。', 0, 'One house alone pays: that isn\'t what both agreed.'), o('{尾根|おね} から {来|き}た {人|ひと} が {払|はら}う こと に する 。', 0, 'They came with nothing; nobody proposed that.')] }),
      ch({ item: 'g:koto_ni_suru', ctx: { jp: '{三|さん} 。', en: 'Clause three: what isn\'t settled.' }, prompt: { en: 'Which keeps the disagreement open and honest?' },
      options: [o('{露天風呂|ろてんぶろ} の こと は {決|き}まらなかった 。 {月|つき} に {一度|いちど} 、 {寄合所|よりあいじょ} で {話|はな}し{合|あ}う こと に した 。', 1), o('{露天風呂|ろてんぶろ} の こと は 、 {皆|みんな} が {賛成|さんせい} した 。', 0, 'Nobody agreed about it: writing that they did would be untrue.')] })],
    A: [ch({ item: 'g:yn_omotenashi', ctx: { jp: '{第一条|だいいちじょう} 。', en: 'Clause one, in the formal style of a written agreement.' }, prompt: { en: 'Which wording suits a signed agreement and says what was decided?' },
      options: [o('{湯|ゆ} は 、 {湯守|ゆもり} が {水時計|みずどけい} に より {量|はか}り 、 {両館|りょうかん} に {半日|はんにち} ずつ {分|わ}ける もの と する 。', 1), o('{湯|ゆ} は 、 まあ 、 {適当|てきとう} に {分|わ}けて おく 。', 0, 'Far too casual, and it decides nothing.'), o('{湯|ゆ} は 、 {両館|りょうかん} が {好|す}きな だけ {取|と}る もの と する 。', 0, 'That would start the quarrel again.')] }),
      ch({ item: 'g:adv_wake_dewa_nai', ctx: { jp: '{第二条|だいにじょう} 。', en: 'Clause two: the newcomers\' bath.' }, prompt: { en: 'Which is fair and precise (read closely: two are near)?' },
      options: [o('{尾根|おね} より {来|き}た {者|もの} の ため 、 {共同|きょうどう} の {湯|ゆ} を {設|もう}け 、 その {費用|ひよう} は {両館|りょうかん} が {折半|せっぱん} する 。', 1), o('{尾根|おね} より {来|き}た {者|もの} の ため 、 {共同|きょうどう} の {湯|ゆ} を {設|もう}け 、 その {費用|ひよう} は {湯守|ゆもり} が {負|お}う 。', 0, 'The guild never offered to pay it alone.'), o('{尾根|おね} より {来|き}た {者|もの} は 、 {各館|かくかん} の {土間|どま} に て {過|す}ごす もの と する 。', 0, 'That writes the floor of the Lower House into the agreement.')] }),
      ch({ item: 'g:adv_wake_dewa_nai', ctx: { jp: '{第三条|だいさんじょう} 。', en: 'Clause three: the open-air bath.' }, prompt: { en: 'Which preserves the disagreement honestly?' },
      options: [o('{露天風呂|ろてんぶろ} に ついて は 、 {両館|りょうかん} の {意見|いけん} が {一致|いっち} した わけ で は ない 。 {月|つき} に {一度|いちど} 、 {寄合|よりあい} にて {協議|きょうぎ} する 。', 1), o('{露天風呂|ろてんぶろ} に ついて は 、 {両館|りょうかん} の {意見|いけん} が {一致|いっち} した 。', 0, 'They did not agree; the agreement shouldn\'t say they did.'), o('{露天風呂|ろてんぶろ} は 、 {取|と}り{壊|こわ}す もの と する 。', 0, 'Nobody decided that.')] })],
  } };
})(RB.content);
