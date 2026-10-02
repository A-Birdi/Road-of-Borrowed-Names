/* Chapter 5 learning content: story challenges (all four tiers), the café
 * orders activity, and drills tagged 'lanternfall'.
 * Language focus: register and politeness, indirect refusal (ちょっと…,
 * 〜かねます, けっこうです), official style, and conditions / negation in
 * written instructions (〜ないと〜ない, 〜たら, 〜なければ, 〜まで〜ては
 * いけない). Advanced tiers deal in implication and paraphrase. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const ch = (id, d) => (C.challenges[id] = d);
  const ok = (jp, en, why) => ({ jp, en, ok: true, why: { en: why || 'Yes.' } });
  const no = (jp, en, why) => ({ jp, en, ok: false, why: { en: why } });

  // ---- 1. the records request form -------------------------------------------------------------
  const FORM = '「{記録|きろく}{閲覧|えつらん}{申請書|しんせいしょ}」 {氏名|しめい} ・ {閲覧|えつらん}{希望|きぼう}{日|び} ・ {目的|もくてき} 。 ※ {閲覧|えつらん} は {申請|しんせい} の {当日|とうじつ} に {限|かぎ}ります 。';
  const FORM_EN = '"Records Request Form." Name · Date you wish to read · Purpose. Note: reading is limited to the day of application.';
  ch('lf.ch_form', {
    title: { jp: '{閲覧|えつらん}{申請書|しんせいしょ}', en: 'The records request form' },
    intro: { jp: FORM, en: FORM_EN },
    tiers: {
      F: [
        { kind: 'write', item: 'v:名前', ctx: { jp: '{氏名|しめい} （ なまえ ） ： ＿＿＿', en: 'Full name (name): ___' }, prompt: { en: 'The first box is for your name — なまえ. Complete the word.' }, answer: 'なまえ', accept: ['なまえ', '名前'], mode: 'kana', explain: { jp: '{名前|なまえ}', en: 'なまえ (名前) — name. On forms you will also see the formal 氏名 (しめい), "full name".' } },
        { kind: 'choose', item: 'v:はい', ctx: { jp: 'タダシ ： 「{閲覧|えつらん} は 、きょう です か 。」', en: 'Tadashi: "Is the reading for today?"' }, prompt: { en: 'You do want to read the records today. Answer "yes".' }, options: [ok('はい', 'Yes.', 'はい — yes.'), no('いいえ', 'No.', 'いいえ is "no" — not what you mean here (and nobody in Lanternfall says it any more).'), no('ええと', 'Um…', 'ええと is a hesitation noise, "um…".')], explain: { en: 'はい = yes, いいえ = no.' } },
      ],
      E: [
        { kind: 'choose', item: 'v:日', ctx: { jp: FORM, en: FORM_EN }, prompt: { en: 'Which box asks for the date you want to read the records?' }, options: [ok('{閲覧|えつらん}{希望|きぼう}{日|び}', 'Date you wish to read', '希望 = wish, 日 = day: "the day you wish to read".'), no('{氏名|しめい}', 'Full name', '氏名 is your full name.'), no('{目的|もくてき}', 'Purpose', '目的 is the purpose.')], explain: { en: 'Forms stack nouns: 閲覧 (reading) + 希望 (wish) + 日 (day).' } },
        { kind: 'write', item: 'v:六月', ctx: { jp: '{洪水|こうずい} は {三十年前|さんじゅうねんまえ} の ＿＿ でした 。', en: 'The flood was in June, thirty years ago.' }, prompt: { en: 'Write "June" (the sixth month) — hiragana or kanji is fine.' }, answer: 'ろくがつ', accept: ['ろくがつ', '六月', '6月'], mode: 'reading', choices: ['ろくがつ', 'ろくげつ', 'むつき'], explain: { jp: '{六月|ろくがつ}', en: 'Months are number + がつ: ろくがつ, June. (Not げつ: that reading is for counting months, as in ろっかげつ.)' } },
        { kind: 'order', item: 'g:v_tai', prompt: { en: 'Tell the Registrar: "I want to see the flood records."' }, tiles: ['{洪水|こうずい} の', '{記録|きろく} を', '{見|み}たい', 'です'], answer: ['{洪水|こうずい} の', '{記録|きろく} を', '{見|み}たい', 'です'], orderHint: { en: 'Noun の noun を, then the verb (たい form) and です.' } },
      ],
      I: [
        { kind: 'choose', item: 'c:lf_form', ctx: { jp: '※ {閲覧|えつらん} は 、{申請|しんせい} の {当日|とうじつ} に {限|かぎ}ります 。', en: 'Note: reading is limited to the day of application.' }, prompt: { en: 'According to the note, when may you read the records?' }, options: [ok('', 'Only on the same day you apply', '当日 = that very day; 〜に限ります = "limited to".'), no('', 'From the day after you apply', 'That would be 翌日以降 (よくじついこう).'), no('', 'Any day you like', '限ります restricts it.'), no('', 'Never on the day you apply', 'It is the opposite: only that day.')], explain: { en: '〜に限る (限ります) limits something to what comes before it.' } },
        { kind: 'choose', item: 'g:register_polite_plain', prompt: { en: 'What should you write in the "purpose" box? Pick the one that suits a form.' }, options: [ok('{三十年前|さんじゅうねんまえ} の {洪水|こうずい} に {関|かん}する {調査|ちょうさ} の ため', 'For research concerning the flood thirty years ago', 'Written forms favour nouns and set phrases: 〜に関する調査のため.'), no('{洪水|こうずい} の こと 、ちょっと {調|しら}べたい から', 'Cause I wanna look into the flood a bit', 'Fine when chatting; too casual for an official form.'), no('{洪水|こうずい} を {調査|ちょうさ} しろ', 'Investigate the flood!', 'That is a blunt command, not a purpose.')], explain: { en: 'Register matters on paper: forms use compact noun phrases rather than chatty sentences.' } },
      ],
      A: [
        { kind: 'choose', item: 'g:lf_kaneru', ctx: { jp: 'タダシ ： 「{許可|きょか}{証|しょう} は {再|さい}{発行|はっこう} いたしかねます ので 、{紛失|ふんしつ} なさいません よう 、お{願|ねが}い {申|もう}し{上|あ}げます 。」', en: '' }, prompt: { en: 'What is the Registrar telling you?' }, options: [ok('', 'The permit cannot be reissued, so please do not lose it.', '〜かねます is a formal, polite "cannot" — a refusal wrapped in humility.'), no('', 'He will gladly reissue the permit if you lose it.', 'かねます looks positive but is a refusal: "I am unable to".'), no('', 'He cannot issue a permit at all.', 'He has issued it; it is re-issuing (再発行) he cannot do.'), no('', 'Losing the permit is forbidden by law.', 'He is asking politely (お願い申し上げます), not citing a law.')], explain: { en: 'いたしかねます: humble いたす + かねる "be unable to". Service staff use it to refuse without ever saying できません.' } },
        { kind: 'write', item: 'v:調査', ctx: { jp: '{目的|もくてき} ： {三十年前|さんじゅうねんまえ} の {洪水|こうずい} に {関|かん}する ＿＿ の ため', en: 'Purpose: for ___ concerning the flood thirty years ago.' }, prompt: { en: 'Fill in the formal word for "research / investigation". Hiragana or kanji.' }, answer: 'ちょうさ', accept: ['ちょうさ', '調査'], mode: 'reading', choices: ['ちょうさ', 'ちょうし', 'じょうさ', 'ちゅうさ'], explain: { jp: '{調査|ちょうさ}', en: '調査 (ちょうさ): investigation, survey — the standard word in reports and forms. 調べる is its everyday verb.' } },
      ],
    },
  });

  // ---- 2. Akari's indirect warning -----------------------------------------------------------------
  const AKARI = 'アカリ ： 「{地下|ちか} の {書庫|しょこ} は 、ちょっと …… 。{行|い}かない ほう が いい かも しれません ね 。」 （ {言|い}いながら 、{鍵|かぎ} を {机|つくえ} の {上|うえ} で こちら へ {滑|すべ}らせる ）';
  const AKARI_EN = 'Akari: "The basement stacks are… well. It might be better not to go, perhaps." (As she says it, she slides a key across the desk towards you.)';
  ch('lf.ch_akari', {
    title: { jp: '{言葉|ことば} と {手|て}', en: 'What the words say, what the hands do' },
    tiers: {
      F: [
        { kind: 'write', item: 'v:鍵', ctx: { jp: 'アカリ は {鍵|かぎ} を くれた 。', en: 'Akari gave you a key.' }, prompt: { en: 'The word for key is かぎ. Complete it.' }, answer: 'かぎ', accept: ['かぎ', '鍵'], mode: 'kana', explain: { jp: '{鍵|かぎ}', en: 'かぎ — key.' } },
        { kind: 'choose', item: 'c:lf_akari', ctx: { jp: AKARI, en: AKARI_EN }, prompt: { en: 'She says "better not go", but hands you the key. What does she want?' }, options: [ok('', 'She wants you to go, but cannot say it', 'Her words refuse; her hands invite. In Lanternfall only the hands are free.'), no('', 'She truly forbids it', 'Then why give you the key?'), no('', 'She wants her key back', 'She is sliding it towards you.')] },
      ],
      E: [
        { kind: 'choose', item: 'g:indirectness', ctx: { jp: 'アカリ ： 「{地下|ちか} の {書庫|しょこ} は 、ちょっと …… 。」', en: 'Akari: "The basement stacks are, well…"' }, prompt: { en: 'What does a trailing ちょっと…… usually signal?' }, options: [ok('', 'A soft "no", or that something is a problem', 'Leaving ちょっと hanging lets the listener finish the thought: "…is a bit difficult."'), no('', '"Wait a moment"', 'That would be ちょっと待って.'), no('', 'A small amount of something', 'ちょっと can mean "a little", but trailing off like this it softens a refusal.')], explain: { en: 'ちょっと…… is one of the most common gentle refusals in Japanese.' } },
        { kind: 'choose', item: 'c:lf_akari', ctx: { jp: AKARI, en: AKARI_EN }, prompt: { en: 'So what is Akari really telling you?' }, options: [ok('', 'Go down to the stacks — the answer is there', 'The key says what her words cannot.'), no('', 'Stay away from the stacks', 'Her words say so, but actions speak here.'), no('', 'The stacks are closed today', 'She never says that, and she hands you the key.')] },
      ],
      I: [
        { kind: 'choose', item: 'g:kamo', ctx: { jp: AKARI, en: AKARI_EN }, prompt: { en: '「行かないほうがいいかもしれませんね」 — how strong is this advice, taken as words alone?' }, options: [ok('', 'Very soft: "it might be better not to go, perhaps"', 'ほうがいい (better to) is softened twice: かもしれません (might) and ね (seeking agreement).'), no('', 'An order: "Do not go."', 'An order would be 行かないでください or 行くな.'), no('', 'A promise: "I will not go."', 'It is advice to you, not about herself.')], explain: { en: 'Stacking softeners (ほうがいい + かもしれません + ね) can make advice so weak it is almost only a formality.' } },
        { kind: 'choose', item: 'c:lf_akari', prompt: { en: 'Put the words and the key together. Which reading fits best?' }, options: [ok('', 'The warning is a formality; the key is the message', 'She has to be seen to discourage you; she wants you to go.'), no('', 'She is testing whether you obey rules', 'Nothing suggests a test.'), no('', 'She gave the key by mistake', 'She slides it deliberately while speaking.')] },
      ],
      A: [
        { kind: 'choose', item: 'c:lf_akari', ctx: { jp: AKARI, en: AKARI_EN }, prompt: { en: 'Which paraphrase best captures what Akari communicated?' }, options: [ok('{表向|おもてむ}き は {止|と}めて いる が 、{実際|じっさい} に は {地下|ちか} へ {行|い}く よう {促|うなが}して いる 。', 'On the surface she discourages you; in fact she is urging you to go down.', 'The literal words are the cover; the act is the message.'), no('{地下|ちか} は {危険|きけん} なので 、{絶対|ぜったい} に {行|い}って は ならない と {警告|けいこく} して いる 。', 'She is warning that the basement is dangerous and you must never go.', 'That reads the words and ignores the key.'), no('{行|い}く か どう か は 、{本当|ほんとう} に どちら でも いい と {思|おも}って いる 。', 'She genuinely does not mind either way.', 'Then there would be no need for the key, or the hesitation.')], explain: { en: 'Reading implication means weighing what is said against what is done and the situation it is said in.' } },
        { kind: 'choose', item: 'g:indirectness', prompt: { en: 'If Akari could speak freely, which line would say the same thing directly — and still politely?' }, options: [ok('{地下|ちか} の {書庫|しょこ} に 、{元|もと} の {台帳|だいちょう} が あります 。どうか {見|み}て きて ください 。', 'The original ledger is in the basement stacks. Please, go and look.', 'Direct content, polite form: どうか + てください.'), no('{地下|ちか} へ {行|い}け 。', 'Go to the basement.', 'Direct, but a bare command — not how she would speak to a visitor.'), no('{地下|ちか} の こと は 、{私|わたし} に は わかりかねます 。', 'I am afraid I would not know about the basement.', 'That is another evasion, not a direct statement.')] },
      ],
    },
  });

  // ---- 3. the conduit tag ----------------------------------------------------------------------------
  const TAG = '「{上|のぼ}り 　{静寂|しじま} の {書庫|しょこ} {行|ゆ}き 」';
  ch('lf.ch_conduit', {
    title: { jp: '{管|くだ} の {札|ふだ}', en: 'The tag on the pipe' },
    tiers: {
      F: [
        { kind: 'write', item: 'v:上り', ctx: { jp: TAG, en: '"Uphill — bound for the Still Archive"' }, prompt: { en: 'The tag begins のぼり — "going up". Complete the word.' }, answer: 'のぼり', accept: ['のぼり', '上り'], mode: 'kana', explain: { jp: '{上|のぼ}り', en: 'のぼり — going up (uphill, upstream, or towards the capital).' } },
      ],
      E: [
        { kind: 'choose', item: 'v:行き', ctx: { jp: TAG, en: '' }, prompt: { en: 'What does 〜行き mean on a tag or a sign?' }, options: [ok('', 'Bound for ~', 'X行き: going to X, as on ferries and carts.'), no('', 'Coming from ~', 'That would be 〜発 or 〜から.'), no('', 'Returning to ~', 'That would be 〜へ戻る.')], explain: { en: '行き after a place name means "bound for". Both いき and ゆき are heard; ゆき is common in signs and announcements.' } },
      ],
      I: [
        { kind: 'choose', item: 'v:行き', ctx: { jp: TAG, en: '' }, prompt: { en: 'What does the whole tag tell you about this pipe?' }, options: [ok('', 'It runs uphill, carrying things to the Still Archive', '上り (uphill) + the Still Archive + 行き (bound for).'), no('', 'It brings water down from the Archive', 'Down would be 下り (くだり).'), no('', 'It is a pipe that belongs to the Archive but goes nowhere', '行き says it has a destination.')] },
      ],
      A: [
        { kind: 'choose', item: 'v:行き', ctx: { jp: TAG, en: '' }, prompt: { en: 'Which statement about reading 行き here is accurate?' }, options: [ok('', 'Both いき and ゆき are acceptable; ゆき often sounds more formal, as in signage.', 'This is how 行き is treated in practice.'), no('', 'Only ゆき is correct; いき is a mistake.', 'いき is standard in everyday speech.'), no('', 'It must be read こう, as in 旅行.', 'こう is an on-reading used in compounds, not for 〜行き.')] },
        { kind: 'choose', item: 'c:lf_conduit', prompt: { en: 'What does the existence of a neatly stamped tag suggest?' }, options: [ok('', 'Someone built and labelled this deliberately: it is infrastructure, not an accident.', 'Tags are for maintenance. Somebody maintains this.'), no('', 'The pipe is abandoned and unused.', 'Voices are flowing through it right now.'), no('', 'The Archive is sending help down to the town.', '上り: it goes up, not down.')] },
      ],
    },
  });

  // ---- 4. the minutes: 「必要なら開ける」 ---------------------------------------------------------------
  const MIN = '「{高瀬|たかせ} より {返答|へんとう} 。{必要|ひつよう} なら {開|あ}ける 。」';
  ch('lf.ch_minutes', {
    title: { jp: '「{必要|ひつよう} なら {開|あ}ける」', en: '"We\'ll open it if it\'s needed"' },
    tiers: {
      F: [
        { kind: 'choose', item: 'v:開ける', ctx: { jp: MIN, en: '"Reply from Takase: we\'ll open it if it\'s needed."' }, prompt: { en: 'What does あける (開ける) mean?' }, options: [ok('', 'to open', 'あける — open.'), no('', 'to close', 'Close is しめる (閉める).'), no('', 'to ring', 'Ring is ならす (鳴らす).')] },
        { kind: 'write', item: 'v:開ける', prompt: { en: 'Write あける — "open".' }, answer: 'あける', accept: ['あける', '開ける'], mode: 'kana', explain: { jp: '{開|あ}ける', en: 'あける — to open (something).' } },
      ],
      E: [
        { kind: 'choose', item: 'g:cond_nara', ctx: { jp: MIN, en: '' }, prompt: { en: 'What does the reply say?' }, options: [ok('', 'If it is needed, we will open it.', 'Noun + なら: "if (it is) …".'), no('', 'We need to open it now.', 'なら makes it conditional.'), no('', 'We will never open it.', 'Nothing here says never.')] },
        { kind: 'choose', item: 'c:lf_promise', prompt: { en: 'Who decides whether it is "needed"?' }, options: [ok('', 'The sentence does not say', 'That gap is the whole problem.'), no('', 'Lanternfall', 'Lanternfall assumed so — the sentence does not say it.'), no('', 'Nobody needs to decide', 'Someone must judge "needed".')] },
      ],
      I: [
        { kind: 'choose', item: 'c:lf_promise', ctx: { jp: MIN, en: '' }, prompt: { en: 'How did the Lanternfall council read it?' }, options: [ok('', 'As a promise to keep the gate shut unless it truly came to that', 'The minutes: 「開けない約束と受け取る」.'), no('', 'As a warning that the gate would open soon', 'That was Tōya\'s reading.'), no('', 'As a refusal to talk further', 'They took it as settling the matter kindly.')] },
        { kind: 'choose', item: 'c:lf_promise', prompt: { en: 'And how did Takase — and Tōya, who carried the message — mean it?' }, options: [ok('', 'As a warning: "we will open it when we judge it necessary"', 'Same words, different speaker\'s intent.'), no('', 'As a promise to ask Lanternfall first', 'Nothing in 必要なら開ける mentions asking.'), no('', 'As a joke', 'No one was joking.')], explain: { en: 'なら states a condition. It does not say who judges the condition, or whether anyone will be warned.' } },
      ],
      A: [
        { kind: 'choose', item: 'c:lf_promise', ctx: { jp: MIN, en: '' }, prompt: { en: 'Which rewrite would have removed the ambiguity?' }, options: [ok('{水位|すいい} が {石|いし} の {印|しるし} を {越|こ}えた {場合|ばあい} は 、{鐘|かね} で {知|し}らせた {上|うえ} で 、{当村|とうそん} の {判断|はんだん} で {開|あ}ける 。', 'If the water passes the stone mark, we will sound the bell and then open it at our own discretion.', 'It names the condition, who judges it, and the warning.'), no('{必要|ひつよう} と {思|おも}われる {場合|ばあい} に は 、{開|あ}ける こと も ありうる 。', 'Should it be deemed necessary, opening may be possible.', 'Longer and more formal, but even vaguer.'), no('{決|けっ}して {開|あ}けない 。', 'We will never open it.', 'Clear, but not what Takase meant — and a promise it could not keep.')], explain: { en: 'Clarity is not formality. A clear promise says what triggers it, who decides, and what warning comes first.' } },
        { kind: 'choose', item: 'c:lf_promise', prompt: { en: 'Kasane argued: 「文面は『必要なら』であり、約束と読むべきである」. What kind of mistake was that?' }, options: [ok('', 'Treating a condition the other side controlled as a promise made to Lanternfall', 'The text allowed it; the situation did not support it.'), no('', 'A grammar error: なら cannot express conditions', 'なら is a perfectly good conditional.'), no('', 'Lying on purpose to the council', 'The minutes show a sincere, careful reading — sincerely wrong.')] },
      ],
    },
  });

  // ---- 5–7. gate plates in the tower -----------------------------------------------------------------------
  const GA = '「{上|うえ} の {水門|すいもん} を {閉|し}めない と 、{下|した} の {水門|すいもん} は {開|ひら}かない 。」';
  const GA_EN = '"Unless the upper gate is closed, the lower gate will not open."';
  ch('lf.ch_gate1', {
    title: { jp: '{第一|だいいち} の {札|ふだ}', en: 'The first gate plate' },
    tiers: {
      F: [
        { kind: 'choose', item: 'v:閉める', ctx: { jp: GA, en: GA_EN }, prompt: { en: 'しめない means…' }, options: [ok('', 'not close', 'しめる (close) → しめない (not close).'), no('', 'close', 'That would be しめる.'), no('', 'open', 'Open is あける / ひらく.')] },
        { kind: 'choose', item: 'c:lf_gate1', ctx: { jp: GA, en: GA_EN }, prompt: { en: 'Which wheel should you turn first?' }, options: [ok('うえ の すいもん', 'The upper gate — close it', 'The lower gate only opens once the upper one is closed.'), no('した の すいもん', 'The lower gate', 'It will not open while the upper gate is open.')] },
      ],
      E: [
        { kind: 'choose', item: 'g:cond_to', ctx: { jp: GA, en: '' }, prompt: { en: 'What has to happen before the lower gate will open?' }, options: [ok('', 'The upper gate must be closed', '〜ないと〜ない: unless A, not B.'), no('', 'The upper gate must be opened', '閉めない is "not close".'), no('', 'Nothing — it opens any time', 'The plate sets a condition.')], explain: { en: 'A ないと B ない = "if not A, then not B" — A is required for B.' } },
      ],
      I: [
        { kind: 'choose', item: 'g:cond_to', ctx: { jp: GA, en: '' }, prompt: { en: 'You try the lower wheel first. What will happen, according to the plate?' }, options: [ok('', 'It will not turn', 'Upper gate not closed → lower gate does not open.'), no('', 'It will open, but slowly', 'The plate says it will not open at all.'), no('', 'The upper gate will close by itself', 'Nothing says that.')] },
        { kind: 'choose', item: 'g:cond_to', prompt: { en: 'Which sentence has the same meaning as the plate?' }, options: [ok('{下|した} の {水門|すいもん} を {開|ひら}く に は 、{上|うえ} の {水門|すいもん} を {閉|し}める {必要|ひつよう} が ある 。', 'To open the lower gate, you need to close the upper one.', 'A necessary condition, stated positively.'), no('{上|うえ} の {水門|すいもん} を {閉|し}めて は いけない 。', 'You must not close the upper gate.', 'Opposite.'), no('{下|した} の {水門|すいもん} を {開|ひら}けば 、{上|うえ} も {閉|し}まる 。', 'If you open the lower gate, the upper closes.', 'That reverses cause and effect.')] },
      ],
      A: [
        { kind: 'choose', item: 'g:cond_to', ctx: { jp: GA, en: '' }, prompt: { en: 'Careful: which statement goes BEYOND what the plate actually says?' }, options: [ok('{上|うえ} の {水門|すいもん} さえ {閉|し}めれば 、{下|した} の {水門|すいもん} は {必|かなら}ず {開|ひら}く 。', 'As long as the upper gate is closed, the lower gate will certainly open.', 'The plate gives a necessary condition, not a sufficient one: closing the upper gate is required, but it does not promise the lower one then opens by itself.'), no('{上|うえ} の {水門|すいもん} が {開|あ}いて いる {限|かぎ}り 、{下|した} の {水門|すいもん} は {開|ひら}かない 。', 'As long as the upper gate is open, the lower gate will not open.', 'This is a fair restatement.'), no('{下|した} の {水門|すいもん} を {開|ひら}ける {前|まえ} に 、{上|うえ} の {水門|すいもん} を {閉|し}める こと 。', 'Close the upper gate before opening the lower one.', 'This is a fair practical instruction.')], explain: { en: 'ないと…ない tells you what is required. It is easy to over-read it as a guarantee (〜さえ〜ば).' } },
      ],
    },
  });

  const GB = '「{東|ひがし} の {扉|とびら} を {開|あ}けない と 、{西|にし} の {栓|せん} は {抜|ぬ}けない 。{水|みず} が {引|ひ}いたら 、{東|ひがし} の {扉|とびら} を {閉|し}める こと 。{閉|し}めなければ 、{水|みず} は {戻|もど}って くる 。」';
  const GB_EN = '"Unless the east door is open, the west plug cannot be pulled. Once the water has gone down, close the east door. If you do not close it, the water will come back."';
  const GB_TILES = ['{東|ひがし} の {扉|とびら} を {開|あ}ける', '{西|にし} の {栓|せん} を {抜|ぬ}く', '{東|ひがし} の {扉|とびら} を {閉|し}める'];
  ch('lf.ch_gate2', {
    title: { jp: '{第二|だいに} の {札|ふだ}', en: 'The second gate plate' },
    tiers: {
      F: [
        { kind: 'choose', item: 'v:東', ctx: { jp: GB, en: GB_EN }, prompt: { en: 'ひがし means…' }, options: [ok('', 'east', 'ひがし — east. にし is west.'), no('', 'west', 'West is にし.'), no('', 'north', 'North is きた.')] },
        { kind: 'order', item: 'c:lf_gate2', prompt: { en: 'Put the three actions in the order the plate requires.' }, tiles: GB_TILES, answer: GB_TILES, orderHint: { en: 'Open the east door first; close it again only after the water has gone down.' } },
      ],
      E: [
        { kind: 'order', item: 'c:lf_gate2', ctx: { jp: GB, en: '' }, prompt: { en: 'Put the actions in the right order.' }, tiles: GB_TILES, answer: GB_TILES, orderHint: { en: '〜ないと〜ない sets the first step; 〜たら sets the last.' } },
        { kind: 'choose', item: 'g:cond_tara', ctx: { jp: '{水|みず} が {引|ひ}いたら 、{東|ひがし} の {扉|とびら} を {閉|し}める こと 。', en: '' }, prompt: { en: '「水が引いたら」 means…' }, options: [ok('', 'once the water has gone down', '引く (of water): recede. 〜たら: when/once.'), no('', 'if the water rises', 'Rising is 上がる / 増える.'), no('', 'while the water is going down', 'While would be 〜ている間.')] },
      ],
      I: [
        { kind: 'choose', item: 'g:cond_ba', ctx: { jp: GB, en: '' }, prompt: { en: 'You drain the room and walk off, leaving the east door open. What happens?' }, options: [ok('', 'The water comes back', '閉めなければ、水は戻ってくる.'), no('', 'Nothing; the plug holds the water back', 'The plate says the opposite.'), no('', 'The west plug closes the east door', 'Nothing says so.')] },
        { kind: 'choose', item: 'g:cond_tara', prompt: { en: 'What does the こと at the end of 「閉めること」 do?' }, options: [ok('', 'Turns it into a written instruction: "Close (it)."', 'Dictionary form + こと is a common way to give rules in notices.'), no('', 'Makes it past tense', 'Past would be 閉めた.'), no('', 'Makes it a question', 'Questions use か.')], explain: { en: 'Notices often end rules with 〜こと: 「走らないこと」 "No running."' } },
      ],
      A: [
        { kind: 'order', item: 'c:lf_gate2', ctx: { jp: GB, en: '' }, prompt: { en: 'Order the actions.' }, tiles: GB_TILES, answer: GB_TILES },
        { kind: 'choose', item: 'g:cond_ba', prompt: { en: 'Which paraphrase keeps every condition of the plate?' }, options: [ok('{西|にし} の {栓|せん} は {東|ひがし} の {扉|とびら} を {開|あ}けて から で なければ {抜|ぬ}けず 、{排水|はいすい} が {済|す}み{次第|しだい} 、{東|ひがし} の {扉|とびら} を {閉|し}めない と {水|みず} が {逆流|ぎゃくりゅう} する 。', 'The west plug can only be pulled after the east door is opened, and as soon as draining is done the east door must be shut or the water flows back.', 'All three conditions, in order.'), no('{東|ひがし} の {扉|とびら} を {閉|し}めて から {西|にし} の {栓|せん} を {抜|ぬ}けば 、{水|みず} は {引|ひ}く 。', 'If you close the east door and then pull the west plug, the water goes down.', 'That reverses the first condition.'), no('{水|みず} が {引|ひ}く まで 、{東|ひがし} の {扉|とびら} に {触|さわ}って は いけない 。', 'Do not touch the east door until the water goes down.', 'It must be opened first.')] },
      ],
    },
  });

  const GC = '「{南|みなみ} の {栓|せん} を {抜|ぬ}く まで 、{北|きた} の {栓|せん} に {触|さわ}って は いけない 。」';
  const GC_EN = '"Until the south plug is pulled, the north plug must not be touched."';
  ch('lf.ch_gate3', {
    title: { jp: '{第三|だいさん} の {札|ふだ}', en: 'The third gate plate' },
    tiers: {
      F: [
        { kind: 'write', item: 'v:南', ctx: { jp: GC, en: GC_EN }, prompt: { en: 'South is みなみ. Complete the word.' }, answer: 'みなみ', accept: ['みなみ', '南'], mode: 'kana', explain: { jp: '{南|みなみ}', en: 'みなみ — south. きた — north.' } },
        { kind: 'choose', item: 'c:lf_gate3', ctx: { jp: GC, en: GC_EN }, prompt: { en: 'Which plug first?' }, options: [ok('みなみ', 'South', 'South first, then north.'), no('きた', 'North', 'Not until the south one is out.')] },
      ],
      E: [
        { kind: 'choose', item: 'v:まで', ctx: { jp: GC, en: '' }, prompt: { en: 'When may you touch the north plug?' }, options: [ok('', 'After pulling the south plug', 'まで: until. Until then, don\'t touch.'), no('', 'Before pulling the south plug', 'Opposite.'), no('', 'Never', 'まで puts a time limit on the ban.')] },
      ],
      I: [
        { kind: 'choose', item: 'g:v_temo_ii', ctx: { jp: GC, en: '' }, prompt: { en: 'What kind of sentence is 「触ってはいけない」?' }, options: [ok('', 'A prohibition: "must not touch"', 'て-form + はいけない.'), no('', 'Permission: "may touch"', 'That would be 触ってもいい.'), no('', 'An obligation: "must touch"', 'That would be 触らなければならない.')] },
        { kind: 'choose', item: 'c:lf_gate3', prompt: { en: 'Which is the same rule?' }, options: [ok('{北|きた} の {栓|せん} を {抜|ぬ}く の は 、{南|みなみ} の {栓|せん} を {抜|ぬ}いた {後|あと} だけ 。', 'Pull the north plug only after the south one.', 'Same rule.'), no('{南|みなみ} の {栓|せん} を {抜|ぬ}く {前|まえ} に 、{北|きた} を {抜|ぬ}く 。', 'Pull the north before the south.', 'Opposite.')] },
      ],
      A: [
        { kind: 'choose', item: 'c:lf_gate3', ctx: { jp: GC, en: '' }, prompt: { en: 'Which formal restatement is faithful?' }, options: [ok('{北|きた} の {栓|せん} に は 、{南|みなみ} の {栓|せん} を {抜|ぬ}いた {後|のち} で なければ {触|ふ}れて は ならない 。', 'The north plug must not be touched other than after the south plug has been pulled.', '〜後でなければ〜てはならない: only after.'), no('{南|みなみ} の {栓|せん} を {抜|ぬ}いた ならば 、{北|きた} の {栓|せん} は {抜|ぬ}かなくて も よい 。', 'Once the south plug is out, there is no need to pull the north one.', 'The plate does not release you from the north plug; it only sets the order.'), no('{北|きた} の {栓|せん} は 、{南|みなみ} の {栓|せん} と {同時|どうじ} に {抜|ぬ}く べき で ある 。', 'Both plugs should be pulled at the same time.', 'まで sets a sequence, not simultaneity.')] },
      ],
    },
  });

  // ---- 8. the bell's inscription -------------------------------------------------------------------------
  const BELL = '「この {鐘|かね} が {鳴|な}ったら 、{高|たか}い {所|ところ} へ {逃|に}げよ 。」';
  const BELL_EN = '"When this bell rings, flee to high ground."';
  ch('lf.ch_bell', {
    title: { jp: '{鐘|かね} の {銘|めい}', en: 'The bell\'s inscription' },
    tiers: {
      F: [
        { kind: 'write', item: 'v:鐘', ctx: { jp: BELL, en: BELL_EN }, prompt: { en: 'A big bell is かね. Complete the word.' }, answer: 'かね', accept: ['かね', '鐘'], mode: 'kana', explain: { jp: '{鐘|かね}', en: 'かね — a large bell (a temple or tower bell). A small bell is すず.' } },
        { kind: 'choose', item: 'v:逃げる', ctx: { jp: BELL, en: BELL_EN }, prompt: { en: 'What does the bell tell people to do?' }, options: [ok('', 'Run to high ground', 'にげよ — flee.'), no('', 'Come to the tower', 'It sends people away, upward.'), no('', 'Stay quiet', 'It is the opposite of a hush.')] },
      ],
      E: [
        { kind: 'choose', item: 'g:cond_tara', ctx: { jp: BELL, en: '' }, prompt: { en: '「鳴ったら」 means…' }, options: [ok('', 'when (it) rings', '鳴る (ring) → 鳴った + ら.'), no('', 'because it rang', 'Because would be 鳴ったから.'), no('', 'even if it rings', 'Even if would be 鳴っても.')] },
        { kind: 'choose', item: 'v:高い', ctx: { jp: BELL, en: '' }, prompt: { en: 'Where should people go?' }, options: [ok('{高|たか}い {所|ところ}', 'a high place', 'High ground, above the flood.'), no('{低|ひく}い {所|ところ}', 'a low place', 'Floods fill low places.'), no('{塔|とう} の {中|なか}', 'inside the tower', 'Not what it says.')] },
      ],
      I: [
        { kind: 'choose', item: 'v:逃げる', ctx: { jp: BELL, en: '' }, prompt: { en: 'What kind of form is 逃げよ?' }, options: [ok('', 'A written-style command, like 逃げろ', 'Ichidan verbs have a literary imperative in よ: 逃げよ, 見よ.'), no('', 'A casual invitation, "let\'s run"', 'That would be 逃げよう.'), no('', 'A past tense', 'Past is 逃げた.')], explain: { en: '〜よ imperatives (逃げよ, 見よ, 出よ) appear in inscriptions and old notices.' } },
      ],
      A: [
        { kind: 'choose', item: 'c:lf_bell', ctx: { jp: BELL, en: '' }, prompt: { en: 'Why would the Hush want this particular bell silent?' }, options: [ok('', 'It exists to tell a whole town "not here, not now" — an interruption no calm can absorb.', 'A warning bell is a public refusal of the status quo.'), no('', 'Its sound is unpleasant.', 'Taste has nothing to do with it.'), no('', 'It marks the hours, and the Hush dislikes clocks.', 'This is a warning bell, not a time bell.')] },
        { kind: 'choose', item: 'c:lf_bell', prompt: { en: 'Choose the natural modern paraphrase of the inscription.' }, options: [ok('この {鐘|かね} が {鳴|な}ったら 、すぐ に {高台|たかだい} へ {避難|ひなん} して ください 。', 'When this bell rings, evacuate to high ground immediately.', 'Modern notice style: 避難してください.'), no('この {鐘|かね} を {鳴|な}らしたら 、{高|たか}い {所|ところ} へ {逃|に}げられる 。', 'If you ring this bell, you can flee to high ground.', 'That changes who acts and turns a command into a possibility.'), no('{高|たか}い {所|ところ} で この {鐘|かね} を {鳴|な}らす こと 。', 'Ring this bell in a high place.', 'Different instruction entirely.')] },
      ],
    },
  });

  // ---- 9. Mio: the recipe --------------------------------------------------------------------------------
  const RECIPE = '「しずめ{薬|ぐすり} 。{材料|ざいりょう} ： {忘|わす}れ{草|ぐさ} 、{眠|ねむ}り{花|ばな} の {根|ね} 。{効|き}き{目|め} ： {言|い}い{返|かえ}す {気持|きも}ち が {静|しず}まる 。{飲|の}ませ{方|かた} ： {毎朝|まいあさ} 、{配給|はいきゅう} の お{茶|ちゃ} に {混|ま}ぜる 。{本人|ほんにん} に は {知|し}らせない こと 。」';
  const RECIPE_EN = '"Quieting draught. Ingredients: daylily (\'forget-grass\'), sleep-flower root. Effect: calms the urge to talk back. Administration: mix into the morning ration tea. Do not inform the person."';
  ch('lf.ch_recipe', {
    title: { jp: 'しずめ{薬|ぐすり} の {処方|しょほう}', en: 'The quieting draught' },
    tiers: {
      F: [
        { kind: 'choose', item: 'v:お茶', ctx: { jp: RECIPE, en: RECIPE_EN }, prompt: { en: 'What is the medicine mixed into? おちゃ…' }, options: [ok('', 'tea', 'おちゃ — tea.'), no('', 'water', 'Water is みず.'), no('', 'bread', 'Bread is パン.')] },
        { kind: 'choose', item: 'g:v_nai', ctx: { jp: RECIPE, en: RECIPE_EN }, prompt: { en: 'しらせない こと — "do not tell". Who is not told?' }, options: [ok('', 'The people who drink it', 'ほんにん — the person themself.'), no('', 'The apothecary', 'Mio is the one being asked to make it.'), no('', 'The Registrar', 'He ordered it.')] },
      ],
      E: [
        { kind: 'choose', item: 'v:静まる', ctx: { jp: RECIPE, en: '' }, prompt: { en: 'What does the draught do?' }, options: [ok('', 'It calms the urge to talk back', '言い返す気持ちが静まる.'), no('', 'It cures a cough', 'Nothing about coughs.'), no('', 'It helps people remember', '忘れ草 points the other way.')] },
      ],
      I: [
        { kind: 'choose', item: 'g:v_nai', ctx: { jp: RECIPE, en: '' }, prompt: { en: '「本人には知らせないこと」 — what is the instruction?' }, options: [ok('', 'Do not let the people who drink it know', 'Dictionary/negative + こと = a rule.'), no('', 'The people who drink it will not notice anything', 'That is a claim, not an instruction.'), no('', 'Only tell people who ask', 'No exception is given.')] },
        { kind: 'choose', item: 'c:lf_recipe', prompt: { en: 'Why can\'t Mio, as an apothecary, make this?' }, options: [ok('', 'It is given secretly, to take away people\'s objections — that is not treatment.', 'Medicine without consent, aimed at silencing.'), no('', 'The ingredients are too expensive.', 'Cost is not the problem.'), no('', 'She does not know how to prepare roots.', 'She knows perfectly well.')] },
      ],
      A: [
        { kind: 'choose', item: 'c:lf_recipe', ctx: { jp: RECIPE, en: '' }, prompt: { en: 'Which sentence states Mio\'s professional objection precisely?' }, options: [ok('{本人|ほんにん} の {同意|どうい} なく {服用|ふくよう} させ 、{反論|はんろん} を {封|ふう}じる {目的|もくてき} の {薬|くすり} は 、{治療|ちりょう} と は {言|い}えない 。', 'A drug given without the person\'s consent, to shut down their objections, cannot be called treatment.', 'It names both problems: consent and purpose.'), no('この {薬|くすり} は {味|あじ} が {悪|わる}い ので 、お{茶|ちゃ} が {台無|だいな}し に なる 。', 'It tastes bad and will ruin the tea.', 'Trivial.'), no('{忘|わす}れ{草|ぐさ} は {季節|きせつ} {外|はず}れ な ので 、{今|いま} は {作|つく}れない 。', 'Daylily is out of season, so it cannot be made now.', 'That is an excuse, which in Lanternfall would be taken as "later, then".')] },
      ],
    },
  });

  // ---- 10. Mio: saying it out loud -------------------------------------------------------------------------
  const ASK = 'タダシ ： 「お{薬|くすり} の {件|けん} 、{明日|あした} まで に お{願|ねが}い できます でしょう か 。」';
  const ASK_EN = 'Tadashi: "About the medicine — might I ask for it by tomorrow?"';
  ch('lf.ch_mio_refuse', {
    title: { jp: '{声|こえ} に {出|だ}す 「いいえ」', en: 'A no, out loud' },
    intro: { jp: ASK, en: ASK_EN },
    tiers: {
      F: [
        { kind: 'choose', item: 'v:いいえ', ctx: { jp: ASK, en: ASK_EN }, prompt: { en: 'Mio needs to say "no". Which word?' }, options: [ok('いいえ', 'No.', 'いいえ — no.'), no('はい', 'Yes.', 'That is yes.'), no('もちろん', 'Of course.', 'That is what the town keeps saying.')] },
      ],
      E: [
        { kind: 'choose', item: 'g:indirectness', ctx: { jp: ASK, en: ASK_EN }, prompt: { en: 'In a town where soft refusals get swallowed, which reply cannot be mistaken for yes?' }, options: [ok('お{断|ことわ}り します 。', 'I refuse.', 'Clear and still polite.'), no('ちょっと …… 。', 'That\'s a bit…', 'Normally a gentle no. Here the Registrar hears "certainly".'), no('{考|かんが}えて おきます 。', 'I\'ll think about it.', 'A soft brush-off that he can file as agreement.')] },
      ],
      I: [
        { kind: 'choose', item: 'g:indirectness', ctx: { jp: ASK, en: ASK_EN }, prompt: { en: 'Which reply is clear, and still sounds like Mio?' }, options: [ok('その お{薬|くすり} は 、{作|つく}りません 。', 'I will not make that medicine.', 'Direct, polite (ません), no room to misread.'), no('{明日|あした} は ちょっと {難|むずか}しい かも しれません 。', 'Tomorrow might be a little difficult.', 'He will simply ask for the day after.'), no('{検討|けんとう} いたします 。', 'I shall consider it.', 'A bureaucratic non-answer.'), no('うるさい 、{作|つく}る もん か 。', 'Shut up, like I\'d make that.', 'Clear, but rude — and not Mio.')] },
      ],
      A: [
        { kind: 'choose', item: 'g:indirectness', ctx: { jp: ASK, en: ASK_EN }, prompt: { en: 'Choose the refusal that is unmistakable, appropriately polite to the Registrar, and gives a reason.' }, options: [ok('お{断|ことわ}り します 。ご{本人|ほんにん} に {知|し}らせず に {飲|の}ませる {薬|くすり} は 、{作|つく}れません 。', 'I refuse. I cannot make a medicine that is given without the person knowing.', 'Refusal first, then the reason.'), no('{前向|まえむ}き に {検討|けんとう} させて いただきます 。', 'I shall give it positive consideration.', 'Often a polite way of never doing something — and here it would be filed as a yes.'), no('{作|つく}らない こと も ない です が …… 。', 'It\'s not that I won\'t make it, but…', 'Double negative: "not that I won\'t" leans towards yes.'), no('ちょっと {今|いま} は {手|て} が {離|はな}せなくて …… 。', 'I\'m rather tied up just now…', 'An excuse invites "later, then".')] },
      ],
    },
  });

  // ---- 11. Nao: Isamu's letter ----------------------------------------------------------------------------
  const LETTER = '「{許|ゆる}して ほしい と は {書|か}かない 。{書|か}けば 、お{前|まえ} は {断|ことわ}れなく なる 。…… {返事|へんじ} は いらない 。いや 、{本当|ほんとう} は ほしい 。どちら でも いい 。お{前|まえ} が {決|き}めて くれ 。」';
  const LETTER_EN = '"I won\'t write that I want you to forgive me. If I wrote it, you wouldn\'t be able to refuse. …You needn\'t reply. No — truthfully, I want you to. Either is fine. You decide."';
  ch('lf.ch_nao_letter', {
    title: { jp: 'イサム の {手紙|てがみ}', en: 'Isamu\'s letter' },
    tiers: {
      F: [
        { kind: 'choose', item: 'v:返事', ctx: { jp: LETTER, en: LETTER_EN }, prompt: { en: 'へんじ は いらない — "no reply needed". But then: ほんとう は ほしい. What does he really want?' }, options: [ok('', 'A reply — but he won\'t insist', 'He says both, and leaves it to her.'), no('', 'Nothing at all', 'ほしい = he wants it.'), no('', 'Money', 'Nothing about money.')] },
      ],
      E: [
        { kind: 'choose', item: 'g:v_tai', ctx: { jp: LETTER, en: '' }, prompt: { en: '「許してほしいとは書かない」 means…' }, options: [ok('', 'I won\'t write that I want you to forgive me', '〜てほしい: want someone to …; とは書かない: won\'t write (that).'), no('', 'I don\'t want to forgive you', 'He is the one asking.'), no('', 'I forgave you long ago', 'Nothing like that.')] },
      ],
      I: [
        { kind: 'choose', item: 'g:cond_ba', ctx: { jp: LETTER, en: '' }, prompt: { en: 'Why won\'t he write it?' }, options: [ok('', 'Because asking would make it impossible for her to say no', '書けば、お前は断れなくなる.'), no('', 'Because he is too proud', 'He says why, and it is not pride.'), no('', 'Because he has already written it elsewhere', 'Not mentioned.')] },
      ],
      A: [
        { kind: 'choose', item: 'c:lf_letter', ctx: { jp: LETTER, en: '' }, prompt: { en: 'Which reading of the letter is most faithful?' }, options: [ok('', 'He clearly hopes, but deliberately refuses to ask, so the decision stays entirely hers.', 'The contradictions are the point: hope without pressure.'), no('', 'He is confused and does not know what he wants.', 'He knows exactly what he wants; he chooses not to demand it.'), no('', 'He is being manipulative, pretending not to ask.', 'Possible cynically, but the letter names the pressure it avoids.')] },
        { kind: 'choose', item: 'c:lf_letter', prompt: { en: 'Umi replies with a single line: 「読みました。」 What does it do?' }, options: [ok('', 'It answers him without deciding forgiveness — which is exactly the freedom he left her.', 'An acknowledgement, not a verdict.'), no('', 'It forgives him.', 'Nothing in it says so.'), no('', 'It refuses to forgive him.', 'Nothing in it says that either.')] },
      ],
    },
  });

  // ---- 12. side: the fence line --------------------------------------------------------------------------
  const PLOT = '「{東|ひがし} の {境|さかい} は 、{柿|かき} の {木|き} まで と する 。」';
  ch('lf.ch_fence', {
    title: { jp: '{柿|かき} の {木|き} まで', en: '"As far as the persimmon tree"' },
    tiers: {
      F: [
        { kind: 'write', item: 'v:柿', ctx: { jp: PLOT, en: '"The eastern boundary shall run as far as the persimmon tree."' }, prompt: { en: 'Persimmon is かき. Complete the word.' }, answer: 'かき', accept: ['かき', '柿'], mode: 'kana', explain: { jp: '{柿|かき}', en: 'かき — persimmon.' } },
        { kind: 'choose', item: 'v:まで', ctx: { jp: PLOT, en: '' }, prompt: { en: 'かき の き まで — まで means…' }, options: [ok('', 'as far as / up to', 'まで marks a limit.'), no('', 'from', 'From is から.'), no('', 'with', 'With is と.')] },
      ],
      E: [
        { kind: 'choose', item: 'c:lf_fence', ctx: { jp: PLOT, en: '' }, prompt: { en: 'What are Kōhei and Kinu really arguing about?' }, options: [ok('', 'Whether "up to the tree" includes the tree', 'まで marks the limit, but is the tree inside or outside it?'), no('', 'Whether there is a tree at all', 'The tree is right there.'), no('', 'Which of them is older', 'Not the point.')] },
      ],
      I: [
        { kind: 'choose', item: 'c:lf_fence', prompt: { en: 'Which suggestion answers both of them?' }, options: [ok('', 'Run the line through the trunk, and share the fruit', 'Neither loses the tree; both keep their say.'), no('', 'Cut the tree down', 'That settles nothing and loses the persimmons.'), no('', 'Let the fence keep moving every morning', 'That is what the Hush did.')] },
      ],
      A: [
        { kind: 'choose', item: 'c:lf_fence', prompt: { en: 'How would you put that proposal to two annoyed neighbours?' }, options: [ok('では 、{境|さかい} は {幹|みき} の {真|ま}ん{中|なか} と いう こと に して 、{実|み} は {半分|はんぶん} ずつ に しては いかが でしょう 。', 'Then how would it be if the line ran through the middle of the trunk, and the fruit were split half and half?', '〜ということにして + 〜てはいかがでしょう: a proposal, not a ruling.'), no('{境|さかい} は {幹|みき} の {真|ま}ん{中|なか} だ 。{文句|もんく} は {言|い}う な 。', 'The line is the middle of the trunk. No complaints.', 'Settling it by decree is exactly what went wrong in this town.'), no('どちら でも いい じゃない です か 。', 'Isn\'t it all the same either way?', 'Dismissive; it is not the same to them.')] },
      ],
    },
  });

  // ---- 13. side: the form that says two things -------------------------------------------------------------
  const CL = '「{本|ほん}{申請|しんせい} に {同意|どうい} しない {場合|ばあい} は 、{同意|どうい} した もの と みなします 。」';
  const CL_EN = '"If you do not agree to this application, you will be deemed to have agreed."';
  ch('lf.ch_form2', {
    title: { jp: '{二|ふた}つ の こと を {言|い}う {書類|しょるい}', en: 'The form that says two things' },
    tiers: {
      F: [
        { kind: 'choose', item: 'g:v_nai', ctx: { jp: CL, en: CL_EN }, prompt: { en: 'どうい しない — "not agree". And then? どうい した — "agreed". What is wrong?' }, options: [ok('', 'Not agreeing counts as agreeing', 'Both answers end up as "agreed".'), no('', 'Nothing is wrong', 'Read it again: no becomes yes.'), no('', 'It is written in the wrong colour', 'Not the problem.')] },
      ],
      E: [
        { kind: 'choose', item: 'c:lf_form2', ctx: { jp: CL, en: '' }, prompt: { en: 'What does the clause actually say?' }, options: [ok('', 'Even if you don\'t agree, it counts as agreement', 'みなす: "to regard as, deem".'), no('', 'If you don\'t agree, you may refuse', 'It removes refusal.'), no('', 'If you agree, it counts as not agreeing', 'Backwards.')] },
        { kind: 'choose', item: 'c:lf_form2', prompt: { en: 'Which fix makes it mean one thing?' }, options: [ok('{同意|どうい} しない {場合|ばあい} は 、その {旨|むね} を {記入|きにゅう} して ください 。', 'If you do not agree, please write so.', 'Now "no" is a real answer.'), no('{必|かなら}ず {同意|どうい} して ください 。', 'You must agree.', 'That removes the choice altogether.')] },
      ],
      I: [
        { kind: 'choose', item: 'c:lf_form2', ctx: { jp: CL, en: '' }, prompt: { en: 'Hayato says two departments each added a line, and nobody could object. Which line should be struck out?' }, options: [ok('{同意|どうい} しない {場合|ばあい} は 、{同意|どうい} した もの と みなします 。', 'If you do not agree, you will be deemed to have agreed.', 'This is the line that erases "no".'), no('{本|ほん}{申請|しんせい} の {内容|ないよう} を よく {読|よ}んで ください 。', 'Please read the contents of this application carefully.', 'Harmless.'), no('{署名|しょめい} を お{願|ねが}い します 。', 'Please sign.', 'Harmless.')] },
      ],
      A: [
        { kind: 'choose', item: 'g:adv_wake_dewa_nai', ctx: { jp: '「{提出|ていしゅつ} しない こと も できない わけ では ない 。」', en: '' }, prompt: { en: 'Untangle this second clause. What does it mean?' }, options: [ok('', 'You may choose not to submit.', 'しないこともできない = cannot (choose) not to; わけではない negates that: it is not that you cannot. So you can.'), no('', 'You must submit.', 'One negation too few.'), no('', 'You cannot submit.', 'The clause is about not submitting.')], explain: { en: 'Count the negatives: しない (1) … できない (2) … わけではない (3). Three negatives: "not (cannot (not submit))" = you can choose not to submit.' } },
        { kind: 'choose', item: 'c:lf_form2', prompt: { en: 'Choose the plain rewrite of that clause.' }, options: [ok('{提出|ていしゅつ} は {任意|にんい} です 。', 'Submission is optional.', 'Same meaning, one idea, no negatives.'), no('{提出|ていしゅつ} は {義務|ぎむ} です 。', 'Submission is compulsory.', 'Opposite.'), no('{提出|ていしゅつ} を {禁|きん}じます 。', 'Submission is prohibited.', 'Opposite in another direction.')] },
      ],
    },
  });

  // ---- 14. side: the ferry timetable ----------------------------------------------------------------------
  const NOTICE = '「{十五時|じゅうごじ} の {便|びん} は 、{当分|とうぶん} の {間|あいだ} {出|で}ます 。」';
  const LOG = '{日誌|にっし} ： 「{九時|くじ} {出航|しゅっこう} 。{十二時|じゅうにじ} {出航|しゅっこう} 。{十五時|じゅうごじ} {欠航|けっこう} 。」 （ {毎日|まいにち} {同|おな}じ ）';
  ch('lf.ch_timetable', {
    title: { jp: '{時刻表|じこくひょう}', en: 'The ferry timetable' },
    tiers: {
      F: [
        { kind: 'write', item: 'g:v_masu_forms', ctx: { jp: 'ウミ の {下書|したが}き ： 「{十五時|じゅうごじ} の {便|びん} は 、{当分|とうぶん} の {間|あいだ} でません 。」', en: 'Umi\'s draft: "The 3 o\'clock boat will not run for the time being."' }, prompt: { en: 'The draft says でません — "won\'t leave". Complete it.' }, answer: 'でません', accept: ['でません', '出ません'], mode: 'kana', explain: { jp: '{出|で}ません', en: 'でます = leaves; でません = does not leave. The Hush lifted the ん and the notice turned into its opposite.' } },
        { kind: 'choose', item: 'c:lf_timetable', ctx: { jp: LOG, en: 'Logbook: "9:00 sailed. 12:00 sailed. 15:00 cancelled." (the same every day)' }, prompt: { en: 'Tsuya waits at three o\'clock. Which boat should she take instead?' }, options: [ok('じゅうにじ', '12 o\'clock', 'The noon boat really sails.'), no('じゅうごじ', '3 o\'clock', 'It never sails.')] },
      ],
      E: [
        { kind: 'choose', item: 'c:lf_timetable', ctx: { jp: LOG, en: '' }, prompt: { en: 'Tsuya can\'t manage the early boat. Which departure should she take?' }, options: [ok('{十二時|じゅうにじ}', '12:00', 'It sails every day.'), no('{十五時|じゅうごじ}', '15:00', '欠航 = cancelled, every day.'), no('{九時|くじ}', '9:00', 'It sails, but she can\'t make it.')] },
        { kind: 'choose', item: 'g:v_masu_forms', ctx: { jp: NOTICE, en: '' }, prompt: { en: 'The logbook says the 15:00 boat never sails. What did the notice originally say?' }, options: [ok('{出|で}ません', 'will not run', 'The negative ending was lifted off.'), no('{出|で}ます', 'will run', 'That is what it says now — and it is wrong.'), no('{出|で}ました', 'ran', 'Past tense makes no sense on a notice about the future.')] },
      ],
      I: [
        { kind: 'choose', item: 'c:lf_timetable', ctx: { jp: NOTICE + ' ' + LOG, en: '' }, prompt: { en: 'Put the notice and the log together. What is true?' }, options: [ok('', 'The notice has lost its negative: the 3 o\'clock boat is not running for now.', 'A notice about the future plus a log of what happened.'), no('', 'The ferry crew are lazy and skip the 3 o\'clock.', 'The log is consistent — it is planned.'), no('', 'The log is wrong.', 'Logs record what happened; notices can be hushed.')] },
        { kind: 'choose', item: 'v:当分', prompt: { en: '「当分の間」 means…' }, options: [ok('', 'for the time being', 'Not forever, but for now.'), no('', 'every other day', 'No.'), no('', 'in the afternoon', 'No.')] },
      ],
      A: [
        { kind: 'choose', item: 'c:lf_timetable', ctx: { jp: '「{十五時|じゅうごじ} の {便|びん} は 、{船体|せんたい} {修理|しゅうり} の ため 、{当分|とうぶん} の {間|あいだ} {運休|うんきゅう} いたします 。」', en: '' }, prompt: { en: 'Umi\'s restored notice. What does it say?' }, options: [ok('', 'The 15:00 boat is suspended for the time being, for hull repairs.', '運休 = suspension of service; 〜のため = because of.'), no('', 'The 15:00 boat will run after its repairs today.', '当分の間 is not "today".'), no('', 'The 15:00 boat is being repaired while it runs.', '運休 means it does not run.')] },
        { kind: 'choose', item: 'g:keigo_kenjo', prompt: { en: 'Why does the notice say 運休いたします rather than 運休します?' }, options: [ok('', 'It is humble language: the ferry office lowers itself before its passengers.', 'いたす is the humble form of する, standard in official notices.'), no('', 'It makes the suspension longer.', 'Politeness does not change the facts.'), no('', 'It is the past tense.', 'いたします is present/future.')] },
      ],
    },
  });

  // ---- 15. Akari: the envelopes -----------------------------------------------------------------------------
  // (a) Hoshino left the address on his reply blank (Chapter 4); the player writes it.
  const ADDR_A = ['{灯落|ひおち}', '{事務所|じむしょ}', 'アカリ', '{様|さま}'];
  ch('lf.ch_akari_addr', {
    title: { jp: 'ホシノ の {封筒|ふうとう}', en: "Addressing Hoshino's envelope" },
    tiers: {
      F: [
        { kind: 'write', item: 'v:様', ctx: { jp: '{灯落|ひおち} {事務所|じむしょ} アカリ ＿＿', en: 'Lanternfall, Clerks\' Office, Ms Akari' }, prompt: { en: 'After the name on an envelope goes the polite title さま. Complete it.' }, answer: 'さま', accept: ['さま', '様'], mode: 'kana', explain: { jp: '{様|さま}', en: 'さま (様) — the polite title used on envelopes.' } },
      ],
      E: [
        { kind: 'order', item: 'c:lf_address', prompt: { en: 'Write the address in the Japanese order: town → office → name → title.' }, tiles: ADDR_A, answer: ADDR_A, orderHint: { en: 'Japanese addresses go from the biggest unit to the smallest.' } },
      ],
      I: [
        { kind: 'order', item: 'c:lf_address', prompt: { en: 'Address the envelope.' }, tiles: ADDR_A, answer: ADDR_A },
        { kind: 'choose', item: 'g:register_polite_plain', prompt: { en: 'Inside, the letter begins 「あかり へ」. On the envelope you wrote 「アカリ 様」. Why the difference?' }, options: [ok('', 'The envelope follows postal convention (様); inside, a father writes to his daughter in plain, warm language.', 'Different audiences: the postman and the daughter.'), no('', 'You made a mistake; they should match.', 'They are meant to differ.'), no('', '様 is only for strangers, so the envelope is rude.', '様 on an envelope is normal even within a family.')] },
      ],
      A: [
        { kind: 'order', item: 'c:lf_address', prompt: { en: 'Address the envelope.' }, tiles: ADDR_A, answer: ADDR_A },
        { kind: 'choose', item: 'c:lf_address', prompt: { en: 'Which title belongs on this envelope?' }, options: [ok('{様|さま}', 'sama', 'The standard, courteous title on letters.'), no('{殿|どの}', 'dono', 'Used in official or business documents; cold for a family letter.'), no('へ', 'e ("to")', 'Fine inside a letter or on a note, but not as the title on an envelope.'), no('さん', 'san', 'Spoken; envelopes use 様.')] },
      ],
    },
  });

  // (b) Akari's own letter home, after the bell.
  const ADDR_T = ['{雪鈴|ゆきすず}', '{天文台|てんもんだい}', 'ホシノ', '{様|さま}'];
  ch('lf.ch_akari_addr2', {
    title: { jp: '{封筒|ふうとう} の {宛名|あてな}', en: 'Addressing the envelope' },
    tiers: {
      F: [
        { kind: 'write', item: 'v:様', ctx: { jp: '{雪鈴|ゆきすず} {天文台|てんもんだい} ホシノ ＿＿', en: 'Snowbell Observatory, Mr Hoshino' }, prompt: { en: 'After the name goes the polite title さま. Complete it.' }, answer: 'さま', accept: ['さま', '様'], mode: 'kana', explain: { jp: '{様|さま}', en: 'さま (様) — the polite title used on envelopes.' } },
      ],
      E: [
        { kind: 'order', item: 'c:lf_address', prompt: { en: 'Put the address in the Japanese order: place → building → name → title.' }, tiles: ADDR_T, answer: ADDR_T, orderHint: { en: 'Japanese addresses go from the biggest unit to the smallest.' } },
      ],
      I: [
        { kind: 'order', item: 'c:lf_address', prompt: { en: 'Address the envelope.' }, tiles: ADDR_T, answer: ADDR_T },
        { kind: 'choose', item: 'v:様', prompt: { en: 'Akari hesitates: "It\'s my own father. Do I still write 様?"' }, options: [ok('', 'Yes — 様 is normal on an envelope, even to family.', 'Inside the letter she can write お父さん.'), no('', 'No — write nothing after the name.', 'A bare name looks rude to the postman, let alone her father.'), no('', 'Write さん instead.', 'さん is spoken; envelopes use 様.')] },
      ],
      A: [
        { kind: 'order', item: 'c:lf_address', prompt: { en: 'Address the envelope.' }, tiles: ADDR_T, answer: ADDR_T },
        { kind: 'choose', item: 'c:lf_address', prompt: { en: 'Which opening line suits the letter itself — to a father she has not written to in years?' }, options: [ok('お{父|とう}さん 、{長|なが}い あいだ {連絡|れんらく} できなくて 、ごめんなさい 。', 'Dad, I\'m sorry I couldn\'t write for so long.', 'Warm, direct, family register.'), no('{拝啓|はいけい} 、{時下|じか} ますます ご{清栄|せいえい} の こと と お{慶|よろこ}び {申|もう}し{上|あ}げます 。', 'Dear Sir, I trust this finds you in ever-increasing prosperity.', 'Business-letter boilerplate — cold between father and daughter.'), no('ホシノ {殿|どの} 。', 'To Hoshino, Esq.', 'Official and distant.')] },
      ],
    },
  });

  // ---- the café that can't refuse (orders activity) ------------------------------------------------------
  C.activities['lf.cafe_orders'] = {
    type: 'orders', title: { jp: 'リツ の {喫茶|きっさ}', en: "Ritsu's café" },
    menu: [
      { id: 'ocha', jp: 'お{茶|ちゃ}', en: 'green tea' },
      { id: 'houji', jp: 'ほうじ{茶|ちゃ}', en: 'roasted tea' },
      { id: 'amazake', jp: '{甘酒|あまざけ}', en: 'amazake (sweet rice drink)' },
      { id: 'dango', jp: '{団子|だんご}', en: 'dango (rice dumplings)' },
      { id: 'daifuku', jp: '{大福|だいふく}', en: 'daifuku (bean-paste mochi)' },
      { id: 'senbei', jp: 'せんべい', en: 'rice cracker' },
    ],
    customers: [
      { who: 'lf_kei', want: { dango: 2 }, items: ['v:団子', 'v:二つ'],
        line: { F: { jp: 'おだんご 、ふたつ ください ！', en: 'Two dango, please!' }, E: { jp: 'お{団子|だんご} を {二|ふた}つ ください ！', en: 'Two dango, please!' }, I: { jp: 'お{団子|だんご} {二|ふた}つ ちょうだい 。{一|ひと}つ は お{母|かあ}さん の ！', en: 'Two dango, please. One\'s for Mum!' }, A: { jp: 'お{団子|だんご} を {二|ふた}つ ！ {母|はは} の {分|ぶん} も です 。', en: 'Two dango! Mum\'s share too.' } },
        thanks: { jp: 'やった ！', en: 'Yay!' } },
      { who: 'lf_nagi', want: { houji: 1 }, items: ['v:結構', 'g:indirectness'],
        line: { F: { jp: 'ほうじちゃ を ひとつ 。おかし は いりません 。', en: 'One roasted tea. No sweets.' }, E: { jp: 'ほうじ{茶|ちゃ} を {一|ひと}つ お{願|ねが}い します 。{甘|あま}い もの は けっこう です 。', en: 'One roasted tea, please. No sweets, thank you.' }, I: { jp: 'ほうじ{茶|ちゃ} {一|ひと}つ 。お{菓子|かし} は …… {今日|きょう} は やめて おく 。', en: 'One roasted tea. Sweets… I\'ll skip them today.' }, A: { jp: 'ほうじ{茶|ちゃ} を {一杯|いっぱい} いただけます か 。{甘味|かんみ} は {遠慮|えんりょ} して おきます 。', en: 'Could I have a cup of roasted tea? I\'ll refrain from sweets.' } },
        hint: { F: { jp: 'いりません = いらない', en: 'いりません means "don\'t need".' }, E: { jp: 'けっこう です = いりません', en: 'けっこうです here means "no, thank you".' }, I: { jp: 'やめて おく = {今日|きょう} は {食|た}べない', en: 'やめておく: "I\'ll pass".' }, A: { jp: '{遠慮|えんりょ} する = {断|ことわ}る', en: '遠慮します: a polite "I\'ll decline".' } },
        thanks: { jp: 'ありがとう 。', en: 'Thanks.' } },
      { who: 'lf_hayato', want: { ocha: 1, senbei: 1 }, items: ['v:せんべい', 'v:一枚'],
        line: { F: { jp: 'おちゃ と せんべい を ひとつ ずつ 。', en: 'One tea and one rice cracker.' }, E: { jp: 'お{茶|ちゃ} と せんべい を {一|ひと}つ ずつ ください 。', en: 'A tea and a rice cracker, one each, please.' }, I: { jp: 'せんべい を {二枚|にまい} …… いや 、やっぱり {一枚|いちまい} で 。それ と お{茶|ちゃ} を 。', en: 'Two rice crackers… no, actually, just one. And a tea.' }, A: { jp: 'お{茶|ちゃ} を {一|ひと}つ と 、せんべい を {二枚|にまい} …… {失礼|しつれい} 、{一枚|いちまい} に {訂正|ていせい} します 。', en: 'One tea and two rice crackers… pardon me, I\'ll correct that to one.' } },
        hint: { jp: 'やっぱり / {訂正|ていせい} → {最後|さいご} の {数|かず}', en: 'He changed his mind: count the last number he says.' },
        thanks: { jp: 'どうも 。', en: 'Thanks.' } },
      { who: 'lf_tsuya', want: { amazake: 2 }, items: ['v:甘酒'],
        line: { F: { jp: 'あまざけ を ふたつ 。', en: 'Two amazake.' }, E: { jp: '{甘酒|あまざけ} を {二|ふた}つ 。{一|ひと}つ は {妹|いもうと} に 。', en: 'Two amazake. One\'s for my sister.' }, I: { jp: '{甘酒|あまざけ} を {二|ふた}つ ね 。{妹|いもうと} の {分|ぶん} も 、{持|も}って いく から 。', en: 'Two amazake, dear. I\'m taking one for my sister.' }, A: { jp: '{甘酒|あまざけ} を {二|ふた}つ 、{包|つつ}んで いただけます か 。{一|ひと}つ は {向|む}こう {岸|ぎし} の {妹|いもうと} へ の お{土産|みやげ} です の 。', en: 'Could you wrap two amazake? One is a present for my sister across the water.' } },
        thanks: { jp: 'まあ 、ありがとう 。', en: 'Oh, thank you.' } },
      { who: 'lf_yae', want: { daifuku: 1 }, items: ['v:結構', 'v:大福'],
        line: { F: { jp: 'だいふく を ひとつ 。おちゃ は いりません 。', en: 'One daifuku. No tea.' }, E: { jp: '{大福|だいふく} を {一|ひと}つ 。お{茶|ちゃ} は けっこう です 。', en: 'One daifuku. No tea, thank you.' }, I: { jp: '{大福|だいふく} を {一|ひと}つ 。…… お{茶|ちゃ} ? いえ 、{今日|きょう} は けっこう よ 。', en: 'One daifuku. …Tea? No, not today, thank you.' }, A: { jp: '{大福|だいふく} を {一|ひと}つ いただこう かしら 。お{茶|ちゃ} は {結構|けっこう} 。{家|いえ} で {飲|の}みます から 。', en: 'I think I\'ll have a daifuku. Tea, no thank you — I\'ll have it at home.' } },
        hint: { jp: '「けっこう です」 は 「いりません」', en: 'Offered something, けっこうです means "no, thank you".' },
        thanks: { jp: 'ありがとう 。{気|き} が {利|き}く わね 。', en: 'Thank you. How attentive.' } },
      { name: 'A traveller', want: {}, items: ['g:indirectness'],
        line: { F: { jp: 'カレー を みっつ ！', en: 'Three curries!' }, E: { jp: 'カレー を {三|みっ}つ ください 。', en: 'Three curries, please.' }, I: { jp: 'カレー {三|みっ}つ 。…… え 、ない の ?', en: 'Three curries. …Eh, you don\'t have any?' }, A: { jp: 'カレー を {三|みっ}つ お{願|ねが}い できます か 。メニュー に は ない よう です が 。', en: 'Could I have three curries? I see they\'re not on the menu, but…' } },
        hint: { jp: 'カレー は メニュー に ありません 。', en: 'Curry is not on the menu at all. Sometimes the right order is no order.' },
        thanks: { jp: 'あ 、ない の か 。じゃ 、また {今度|こんど} 。', en: 'Oh, you don\'t do curry. Another time, then.' } },
    ],
  };

  // ---- drills (tag: lanternfall) -------------------------------------------------------------------------
  const D = [];
  const w = (id, lv, item, ctxJp, ctxEn, promptEn, answer, accept, extra) => D.push(Object.assign({ id: 'lf.d' + id, lv, tags: ['lanternfall'], kind: 'write', item, ctx: ctxJp ? { jp: ctxJp, en: ctxEn } : undefined, prompt: { en: promptEn }, answer, accept, mode: 'reading' }, extra || {}));
  const c = (id, lv, item, ctxJp, ctxEn, promptEn, options, extra) => D.push(Object.assign({ id: 'lf.d' + id, lv, tags: ['lanternfall'], kind: 'choose', item, ctx: ctxJp ? { jp: ctxJp, en: ctxEn } : undefined, prompt: { en: promptEn }, options }, extra || {}));
  const o = (id, lv, item, promptEn, tiles, extra) => D.push(Object.assign({ id: 'lf.d' + id, lv, tags: ['lanternfall'], kind: 'order', item, prompt: { en: promptEn }, tiles, answer: tiles.slice() }, extra || {}));

  // Foundations: short kana words from the chapter
  w('01', 'F', 'v:鈴', '{小|ちい}さな {鈴|すず} が {鳴|な}った 。', 'A small bell rang.', 'A small bell is すず. Write it.', 'すず', ['すず', '鈴'], { mode: 'kana', explain: { jp: '{鈴|すず}', en: 'すず — small bell.' } });
  w('02', 'F', 'v:声', '{町|まち} に {声|こえ} が {戻|もど}った 。', 'Voices came back to the town.', 'Voice is こえ. Write it.', 'こえ', ['こえ', '声'], { mode: 'kana', explain: { jp: '{声|こえ}', en: 'こえ — voice.' } });
  w('03', 'F', 'v:鐘', '{塔|とう} の {鐘|かね}', 'The tower bell', 'A big bell is かね. Write it.', 'かね', ['かね', '鐘'], { mode: 'kana', explain: { jp: '{鐘|かね}', en: 'かね — large bell.' } });
  w('04', 'F', 'v:舟', 'トクジ の {舟|ふね}', "Tokuji's boat", 'Boat is ふね. Write it.', 'ふね', ['ふね', '舟', '船'], { mode: 'kana', explain: { jp: '{舟|ふね}', en: 'ふね — boat.' } });
  w('05', 'F', 'v:いいえ', '「はい」 と 「いいえ」', '"Yes" and "no"', 'Write the word for "no".', 'いいえ', ['いいえ'], { mode: 'kana', explain: { en: 'いいえ — no.' } });
  w('06', 'F', 'v:手紙', 'ウミ へ の {手紙|てがみ}', 'A letter for Umi', 'Letter is てがみ. Write it.', 'てがみ', ['てがみ', '手紙'], { mode: 'kana', explain: { jp: '{手紙|てがみ}', en: 'てがみ — letter.' } });
  w('07', 'F', 'v:水', '{水|みず} が {引|ひ}いた 。', 'The water went down.', 'Water is みず. Write it.', 'みず', ['みず', '水'], { mode: 'kana', explain: { jp: '{水|みず}', en: 'みず — water.' } });
  c('08', 'F', 'v:はい', '「かしこまりました 。」', '"Certainly."', 'かしこまりました is a very polite way to say…', [ok('', 'yes, certainly', 'It accepts a request.'), no('', 'no', 'It is the opposite.'), no('', 'goodbye', 'No.')]);
  c('09', 'F', 'v:北', '{北|きた} の {栓|せん}', 'the north plug', 'きた means…', [ok('', 'north', 'きた — north.'), no('', 'south', 'South is みなみ.'), no('', 'east', 'East is ひがし.')]);
  w('10', 'F', 'v:西', '{西|にし} の {扉|とびら}', 'the west door', 'West is にし. Write it.', 'にし', ['にし', '西'], { mode: 'kana', explain: { jp: '{西|にし}', en: 'にし — west.' } });

  // Elementary: polite forms, time, everyday politeness
  c('11', 'E', 'v:結構', '「お{茶|ちゃ} は いかが です か 。」 「いえ 、けっこう です 。」', '"Would you like some tea?" "No, thank you."', 'What does けっこうです mean here?', [ok('', 'No, thank you', 'Offered something, けっこうです declines it.'), no('', 'Yes, that\'s fine, pour it', 'It looks like "fine", but here it declines.'), no('', 'It\'s delicious', 'No.')], { explain: { en: 'けっこうです: "that is enough / no need" — a polite refusal of an offer.' } });
  c('12', 'E', 'g:v_masu_forms', '{十五時|じゅうごじ} の {便|びん} は {出|で}ません 。', '', 'What does this mean?', [ok('', 'The 3 o\'clock boat doesn\'t run.', 'ません: polite negative.'), no('', 'The 3 o\'clock boat runs.', 'That would be 出ます.'), no('', 'The 3 o\'clock boat ran.', 'Past would be 出ました.')]);
  w('13', 'E', 'v:十二時', '{昼|ひる} の {舟|ふね} は ＿＿ に {出|で}ます 。', 'The noon boat leaves at twelve.', 'Write "twelve o\'clock". Hiragana or kanji is fine.', 'じゅうにじ', ['じゅうにじ', '十二時', '12時'], { choices: ['じゅうにじ', 'じゅうにし', 'じゅうじ'] });
  c('14', 'E', 'g:keigo_kenjo', '「{少々|しょうしょう} お{待|ま}ち ください 。」', '', 'Who would most naturally say this?', [ok('', 'A clerk to a visitor at the counter', 'Polite service language.'), no('', 'A child to a friend', 'Children would say ちょっと待って.'), no('', 'Nobody; it is rude', 'It is very polite.')]);
  o('15', 'E', 'g:v_te_kudasai', 'Ask politely: "Please ring the bell."', ['{鐘|かね} を', '{鳴|な}らして', 'ください']);
  c('16', 'E', 'v:議会', '{議会|ぎかい} は {全員|ぜんいん} {賛成|さんせい} でした 。', 'The council was unanimous.', '全員賛成 means…', [ok('', 'everyone in favour', '全員 everyone, 賛成 in favour.'), no('', 'everyone against', 'Against is 反対.'), no('', 'nobody came', 'No.')]);
  w('17', 'E', 'v:反対', '{賛成|さんせい} ？ それ とも ＿＿ ？', 'In favour? Or against?', 'Write "against / opposed". Hiragana or kanji is fine.', 'はんたい', ['はんたい', '反対'], { choices: ['はんたい', 'はんだい', 'ほんたい'] });
  c('18', 'E', 'g:prt_kara_made', '{九時|くじ} から {十二時|じゅうにじ} まで', '', 'What does this phrase mean?', [ok('', 'from nine to twelve', 'から from, まで until.'), no('', 'nine or twelve', 'That would be か.'), no('', 'after twelve', 'No.')]);
  o('19', 'E', 'g:v_mashou', 'Suggest: "Let\'s go down to the basement."', ['{地下|ちか} へ', '{行|い}きましょう']);
  c('20', 'E', 'g:register_polite_plain', '「{行|い}く ？」 「{行|い}きます か 。」', '', 'What is the difference?', [ok('', 'Plain (friends) vs polite (strangers, work)', 'Same question, different register.'), no('', 'Present vs past', 'Both are present.'), no('', 'Question vs order', 'Both are questions.')]);

  // Intermediate: conditions, negation, softening
  c('21', 'I', 'g:cond_to', '{鈴|すず} を {鳴|な}らさない と 、{誰|だれ} も {気|き}づかない 。', '', 'What does this mean?', [ok('', 'Unless you ring the bell, nobody will notice.', '〜ないと〜ない: unless.'), no('', 'If you ring the bell, nobody will notice.', 'Missed the negative.'), no('', 'Don\'t ring the bell or people will notice.', 'Reversed.')]);
  c('22', 'I', 'g:cond_tara', '{水|みず} が {引|ひ}いたら 、{扉|とびら} を {閉|し}めて ください 。', '', 'When should the door be closed?', [ok('', 'Once the water has gone down', '〜たら: once / when.'), no('', 'Before the water goes down', 'No.'), no('', 'Whenever you like', 'No.')]);
  c('23', 'I', 'g:v_nakereba', '{閉|し}めなければ 、{水|みず} は {戻|もど}って くる 。', '', 'What does this warn?', [ok('', 'If you don\'t close it, the water will come back.', 'なければ: if not.'), no('', 'If you close it, the water will come back.', 'Missed the negative.'), no('', 'You must not close it.', 'No.')]);
  c('24', 'I', 'g:kamo', '{行|い}かない ほう が いい かも しれません ね 。', '', 'How strong is this advice?', [ok('', 'Very soft', 'ほうがいい + かもしれません + ね: softened twice.'), no('', 'A firm order', 'No.'), no('', 'A threat', 'No.')]);
  c('25', 'I', 'g:indirectness', '「{明日|あした} の {会議|かいぎ} 、{来|こ}られます か 。」 「{明日|あした} は ちょっと …… 。」', '', 'What is the answer?', [ok('', 'Probably not', 'A trailing ちょっと is a soft no.'), no('', 'Yes, a little late', 'No.'), no('', 'Yes, briefly', 'No.')]);
  c('26', 'I', 'g:keigo_sonkei', '{議員|ぎいん} は もう お{帰|かえ}り に なりました 。', '', 'What does this say?', [ok('', 'The councillor has already gone home.', 'お〜になる: respectful form of 帰る.'), no('', 'I have gone home.', 'Respectful forms are for others, not yourself.'), no('', 'Please go home.', 'That would be お帰りください.')]);
  c('27', 'I', 'g:keigo_kenjo', '{資料|しりょう} を お{持|も}ち します 。', '', 'Who is carrying the papers?', [ok('', 'The speaker', 'お〜する: humble form, about one\'s own action.'), no('', 'The listener', 'That would be お持ちになる / お持ちください.'), no('', 'Nobody', 'No.')]);
  o('28', 'I', 'g:cond_to', 'Order: "Unless you close the upper gate, the lower one won\'t open."', ['{上|うえ} の {水門|すいもん} を', '{閉|し}めない と', '{下|した} の {水門|すいもん} は', '{開|ひら}かない']);
  c('29', 'I', 'g:v_temo_ii', 'ここ で {鐘|かね} を {鳴|な}らして も いい です か 。', '', 'What is being asked?', [ok('', 'Permission to ring the bell here', '〜てもいいですか: may I…?'), no('', 'Whether the bell is broken', 'No.'), no('', 'An order to ring the bell', 'No.')]);
  c('30', 'I', 'v:当分', '{当分|とうぶん} の {間|あいだ} 、{休|やす}みます 。', '', '当分の間 means…', [ok('', 'for the time being', 'Temporary, open-ended.'), no('', 'forever', 'No.'), no('', 'every other day', 'No.')]);
  c('31', 'I', 'g:n_desu', '「どうした の ？」 「{実|じつ} は 、{帰|かえ}りたい ん です 。」', '', 'What does 〜んです add here?', [ok('', 'It explains a situation the speaker has been holding back', 'Explanatory のだ / んです.'), no('', 'It makes it past tense', 'No.'), no('', 'It turns it into a command', 'No.')]);

  // Advanced: refusal, implication, official style, paraphrase
  c('32', 'A', 'g:lf_kaneru', 'その ご{依頼|いらい} は 、お{引|ひ}き{受|う}け いたしかねます 。', '', 'What is the speaker doing?', [ok('', 'Politely refusing the request', '〜かねます: a humble "cannot".'), no('', 'Gladly accepting', 'かねる looks mild but it refuses.'), no('', 'Asking for more time', 'No.')], { explain: { en: '引き受けかねます = 引き受けることができません, said with maximum courtesy.' } });
  c('33', 'A', 'g:adv_wake_dewa_nai', '{反対|はんたい} して いる わけ で は ありません が 、{少|すこ}し {時間|じかん} を ください 。', '', 'What is the speaker\'s position?', [ok('', 'Not opposed as such, but not ready to agree yet', 'わけではない denies an inference ("I\'m not opposed") while holding back.'), no('', 'Strongly opposed', 'They deny that.'), no('', 'Completely in favour', 'Then no time would be needed.')]);
  c('34', 'A', 'g:indirectness', '「{前向|まえむ}き に {検討|けんとう} いたします 。」', '', 'In many offices, what can this polite phrase amount to?', [ok('', 'A courteous way of not committing — often it means nothing will be done', 'It avoids both yes and no.'), no('', 'A firm promise to act at once', 'It promises only consideration.'), no('', 'An insult', 'It is extremely polite.')]);
  c('35', 'A', 'g:adv_kanenai', 'この まま {黙|だま}って いれば 、{同|おな}じ {過|あやま}ち を {繰|く}り{返|かえ}し かねない 。', '', 'What does 〜かねない mean here?', [ok('', 'could well (happen) — a warning of a bad outcome', 'かねない ≠ かねます: it warns something bad might happen.'), no('', 'cannot (happen)', 'That is かねる / かねます.'), no('', 'must not (happen)', 'No.')], { explain: { en: 'Contrast: 〜かねます "cannot (politely)" vs 〜かねない "could well…".' } });
  c('36', 'A', 'c:lf_promise', '「{必要|ひつよう} なら {開|あ}ける 。」', '', 'Which question exposes the ambiguity?', [ok('', '"Needed by whom, and will you warn us first?"', 'Who judges the condition, and what happens before the act.'), no('', '"Is 開ける the right verb?"', 'The verb is fine.'), no('', '"Is なら too informal?"', 'Register is not the problem.')]);
  c('37', 'A', 'g:adv_to_iu_yori', '{彼|かれ} の {返事|へんじ} は 、{賛成|さんせい} と いう より 、{反対|はんたい} できない だけ だった 。', '', 'What is being said about his reply?', [ok('', 'It wasn\'t really agreement; he simply couldn\'t object', 'AというよりB: more B than A.'), no('', 'He strongly agreed', 'No.'), no('', 'He objected loudly', 'No.')]);
  c('38', 'A', 'g:keigo_kenjo', '{担当|たんとう} の {者|もの} が {参|まい}ります ので 、{少々|しょうしょう} お{待|ま}ち くださいませ 。', '', 'What is happening?', [ok('', 'The person in charge is coming; please wait a moment', '参ります: humble 来る, about one\'s own side.'), no('', 'You are being asked to go to the person in charge', 'The person in charge is coming to you.'), no('', 'The person in charge has left', 'No.')]);
  c('39', 'A', 'c:lf_certainly', '「{承知|しょうち} いたしました 。」 「かしこまりました 。」 「もちろん です 。」', '', 'In ordinary Japanese, what do these have in common?', [ok('', 'They are all ways of saying yes / accepting — at different levels of formality', 'Real, everyday politeness; Lanternfall has just lost the alternatives.'), no('', 'They all mean "no" in polite speech', 'No.'), no('', 'They are only used in writing', 'All are common in speech.')]);
  c('40', 'A', 'g:adv_zaru_wo_enai', 'こう なった {以上|いじょう} 、{書庫|しょこ} へ {行|い}かざる を {得|え}ない 。', '', 'What does the speaker feel?', [ok('', 'They have no choice but to go to the Archive', '〜ざるを得ない: cannot avoid doing.'), no('', 'They refuse to go', 'No.'), no('', 'They want to go for fun', 'The form implies reluctant necessity.')]);
  o('41', 'A', 'g:indirectness', 'Build a polite, clear refusal: "I\'m sorry, but I must decline."', ['{申|もう}し{訳|わけ} ありません が', 'お{断|ことわ}り', 'いたします']);
  c('42', 'A', 'c:lf_letter', '{返事|へんじ} は いらない 。いや 、{本当|ほんとう} は ほしい 。', '', 'What is the effect of いや here?', [ok('', 'He takes back what he just said, correcting himself in the same breath', 'いや: "no, rather…" — a self-correction.'), no('', 'He is refusing the reader', 'No.'), no('', 'It is a greeting', 'No.')]);
  C.addDrills(D);

  // ---- grammar cards used in this chapter -------------------------------------------------------------------
  if (RB.grammar && RB.grammar.add) RB.grammar.add([
    { id: 'lf_kaneru', lv: 'A', title: '～かねます (politely: cannot)', pat: '{動詞|どうし}（ます{形|けい}） ＋ かねます',
      en: 'Verb stem + かねます means "I am unable to …". It is a courteous refusal used by staff and officials: it avoids the blunt できません while still saying no. Do not confuse it with ～かねない, "could well (happen)", which warns of something bad.',
      ex: [{ jp: 'その ご{質問|しつもん} に は お{答|こた}え しかねます。', en: 'I am afraid I cannot answer that question.' }, { jp: '{当日|とうじつ} の {変更|へんこう} は お{受|う}け いたしかねます。', en: 'We are unable to accept same-day changes.' }] },
  ], 'ch5');
})(RB.content);
