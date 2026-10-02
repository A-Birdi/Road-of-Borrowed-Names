/* Chapter 6 learning moments. The Archive's puzzles are all about reading
 * in context: restoring a catalogue by meaning, recognising a paraphrase,
 * reading a conditional promise, and — at the climax — recovering what a
 * four-word reply meant from the letters around it. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  const ch = (id, d) => (C.challenges[id] = d);
  const choose = (item, prompt, ctx, options, explain) => ({ kind: 'choose', item, prompt: { en: prompt }, ctx, options, explain });

  // ---- 1. The catalogue (Reading Room) --------------------------------------------------------------
  ch('sa.catalogue', {
    title: T('Restore the catalogue', '{目録|もくろく} を {元|もと} に'),
    intro: T('Every drawer label has been wiped white, and the cards lie in a heap. Read what each card says and file it where it belongs.', '{引|ひ}き{出|だ}し の ラベル は {全部|ぜんぶ} {白|しろ}く なり 、 カード が {山|やま} に なって いる 。 カード を {読|よ}んで 、 {正|ただ}しい {引|ひ}き{出|だ}し に {戻|もど}そう 。'),
    tiers: {
      F: [
        choose('c:sa_catalogue', 'Which drawer does this card belong in?', { jp: 'カード ： 「 あしのせ 」', en: 'Card: "Ashinose" — the name of Reedwake.' }, [
          { jp: 'ちめい', en: 'Place names', ok: true },
          { jp: 'やくそく', en: 'Promises', ok: false, why: { en: 'A place\'s name isn\'t a promise.' } },
          { jp: 'わかれ の ことば', en: 'Parting words', ok: false, why: { en: 'Nobody says "Reedwake" to say goodbye.' } },
        ], { en: 'あしのせ is a place: Reedwake.' }),
        { kind: 'write', item: 'v:別れ', ctx: { jp: 'カード ： 「 また あした 。 」', en: 'Card: "See you tomorrow."' }, prompt: { en: 'This card goes in the drawer for parting words. Write the drawer\'s label: わかれ ("parting").' }, answer: 'わかれ', accept: ['わかれ', '別れ'], mode: 'reading', explain: { en: 'また あした — "see you tomorrow" — is something you say when parting (わかれ).' } },
        choose('c:sa_catalogue', 'Which drawer does this card belong in?', { jp: 'カード ： 「 いや 、 ちがう と おもう 。 」', en: 'Card: "No, I don\'t think that\'s right."' }, [
          { jp: 'はんたい', en: 'Objections', ok: true },
          { jp: 'ちめい', en: 'Place names', ok: false, why: { en: 'No place is named on this card.' } },
          { jp: 'やくそく', en: 'Promises', ok: false, why: { en: 'It disagrees; it doesn\'t promise.' } },
        ], { en: 'いや (no) and ちがう (that\'s wrong): an objection — はんたい.' }),
      ],
      E: [
        choose('c:sa_catalogue', 'File this card.', { jp: 'カード ： 「 {春|はる} に なったら 、 {帰|かえ}る 。 」', en: 'Card: "When spring comes, I\'ll come home."' }, [
          { jp: '{約束|やくそく}', en: 'Promises', ok: true },
          { jp: '{別|わか}れ の {言葉|ことば}', en: 'Parting words', ok: false, why: { en: 'It might be said at parting, but what it is, is a promise about the future.' } },
          { jp: '{地名|ちめい}', en: 'Place names', ok: false, why: { en: 'No place is named.' } },
        ], { en: '〜たら、〜る: "when …, I will …" — a promise.' }),
        choose('c:sa_catalogue', 'File this card.', { jp: 'カード ： 「 また {明日|あした} 。 {気|き} を つけて ね 。 」', en: 'Card: "See you tomorrow. Take care."' }, [
          { jp: '{別|わか}れ の {言葉|ことば}', en: 'Parting words', ok: true },
          { jp: '{反対|はんたい}', en: 'Objections', ok: false, why: { en: 'Nothing here disagrees.' } },
          { jp: '{約束|やくそく}', en: 'Promises', ok: false, why: { en: '"See you tomorrow" is a goodbye, not a vow.' } },
        ], { en: 'また明日 / 気をつけて — everyday goodbyes.' }),
        choose('c:sa_catalogue', 'File this card.', { jp: 'カード ： 「 いや 、 それ は {違|ちが}う と {思|おも}う 。 」', en: 'Card: "No, I think that\'s wrong."' }, [
          { jp: '{反対|はんたい}', en: 'Objections', ok: true },
          { jp: '{約束|やくそく}', en: 'Promises', ok: false, why: { en: 'It disagrees; it commits to nothing.' } },
          { jp: '{別|わか}れ の {言葉|ことば}', en: 'Parting words', ok: false, why: { en: 'No one is leaving.' } },
        ], { en: '〜と思う softens it, but 違う is still a clear objection.' }),
      ],
      I: [
        choose('c:sa_catalogue', 'File this card.', { jp: 'カード ： 「 {雪|ゆき} が {解|と}けたら 、 {必|かなら}ず {迎|むか}え に {行|い}く 。 」', en: 'Card: "When the snow melts, I\'ll come for you without fail."' }, [
          { jp: '{約束|やくそく}', ok: true },
          { jp: '{別|わか}れ の {言葉|ことば}', ok: false, why: { en: 'It looks ahead to meeting, and 必ず commits to it: a promise.' } },
          { jp: '{曖昧|あいまい}', ok: false, why: { en: 'Nothing vague about 必ず ("without fail").' } },
        ], { en: '必ず〜行く: a firm promise with a clear condition (雪が解けたら).' }),
        choose('c:sa_catalogue', 'File this card.', { jp: 'カード ： 「 お{言葉|ことば} を {返|かえ}す よう です が 、 それ は {無理|むり} が ある と {思|おも}います 。 」', en: 'Card: "I don\'t mean to contradict you, but I think that\'s asking too much."' }, [
          { jp: '{反対|はんたい}', ok: true },
          { jp: '{約束|やくそく}', ok: false, why: { en: 'Polite, but it is disagreeing.' } },
          { jp: '{別|わか}れ の {言葉|ことば}', ok: false, why: { en: 'No one is taking their leave.' } },
        ], { en: 'お言葉を返すようですが is a set polite opener for contradicting someone.' }),
        choose('c:sa_catalogue', 'This drawer is overflowing. Does this card belong in it?', { jp: '{引|ひ}き{出|だ}し ： 「 {曖昧|あいまい} 」　　カード ： 「 まあ 、 そのうち 、 なんとか する よ 。 」', en: 'Drawer: "Vague". Card: "Well, I\'ll sort it out one of these days."' }, [
          { en: 'Yes — it sounds like a promise but commits to nothing definite.', ok: true },
          { en: 'No — it is a firm promise.', ok: false, why: { en: 'そのうち ("sometime") and なんとか ("somehow") leave every detail open.' } },
          { en: 'No — it is an objection.', ok: false, why: { en: 'It doesn\'t disagree with anything.' } },
        ], { en: 'そのうち、なんとか: when and how are both left open. Kasane filed thousands of these.' }),
      ],
      A: [
        choose('c:sa_catalogue', 'File this card.', { jp: 'カード ： 「 {追|お}って ご{連絡|れんらく} いたします 。 」', en: 'Card: "We will be in touch in due course."' }, [
          { jp: '{約束|やくそく}', ok: true },
          { jp: '{別|わか}れ の {言葉|ことば}', ok: false, why: { en: 'It often closes a conversation, but it commits the speaker to a later contact.' } },
          { jp: '{反対|はんたい}', ok: false, why: { en: 'Nothing is opposed.' } },
        ], { en: '追って (later, in due course) + ご連絡いたします (humble): a formal commitment to follow up.' }),
        choose('c:sa_catalogue', 'File this card.', { jp: 'カード ： 「 お{言葉|ことば} です が 、 {賛成|さんせい} いたしかねます 。 」', en: 'Card: "With respect, I find myself unable to agree."' }, [
          { jp: '{反対|はんたい}', ok: true },
          { jp: '{曖昧|あいまい}', ok: false, why: { en: 'Very polite — and completely clear. 〜かねます is a courteous "cannot".' } },
          { jp: '{約束|やくそく}', ok: false, why: { en: 'It declines rather than commits.' } },
        ], { en: 'お言葉ですが + 〜いたしかねます: a formal, unmistakable objection.' }),
        choose('c:sa_catalogue', 'File this card — carefully.', { jp: 'カード ： 「 {前向|まえむ}き に {検討|けんとう} いたします 。 」', en: 'Card: "We will give it positive consideration."' }, [
          { jp: '{曖昧|あいまい}', ok: true },
          { jp: '{約束|やくそく}', ok: false, why: { en: 'It sounds warm, but it promises only to think about it — often a polite way of promising nothing.' } },
          { jp: '{反対|はんたい}', ok: false, why: { en: 'It may end in a no, but it doesn\'t say one.' } },
        ], { en: '前向きに検討いたします commits to considering, not to doing. Its meaning depends on who says it and how — exactly the kind of card the Hush was built to take.' }),
      ],
    },
  });

  // ---- 2. The call slip (Stacks) ------------------------------------------------------------------------
  const aisles = (en) => [
    { jp: '{言|い}い{争|あらそ}い', en: en ? 'Quarrels' : undefined, ok: false, why: { en: 'A quarrel is an argument, not a promise.' } },
    { jp: '{曖昧|あいまい}な {約束|やくそく}', en: en ? 'Vague promises' : undefined, ok: true },
    { jp: '{悲|かな}しい {記憶|きおく}', en: en ? 'Sad memories' : undefined, ok: false, why: { en: 'The slip says nothing about sadness.' } },
    { jp: '{地名|ちめい}', en: en ? 'Place names' : undefined, ok: false, why: { en: 'No place is mentioned.' } },
  ];
  ch('sa.paraphrase', {
    title: T('The call slip', '{請求|せいきゅう}{票|ひょう}'),
    intro: T('The slip on the desk is in Kasane\'s hand. It doesn\'t use the aisle\'s label — it describes it.', '{机|つくえ} の {上|うえ} の {紙|かみ} は カサネ の {字|じ} だ 。 {棚|たな} の {名前|なまえ} で は なく 、 {説明|せつめい} で {書|か}いて ある 。'),
    tiers: {
      F: [
        choose('c:sa_paraphrase', 'Which aisle does the slip mean?', { jp: 'はっきり しない やくそく の たな 。 いちばん おく 。', en: '"The shelf of promises that aren\'t clear. Right at the back."' }, aisles(true), { en: 'はっきりしない ("not clear") is another way of saying あいまい ("vague").' }),
        { kind: 'write', item: 'v:約束', prompt: { en: 'Write the word the slip and the aisle share: やくそく ("promise").' }, answer: 'やくそく', accept: ['やくそく', '約束'], mode: 'reading', explain: { en: 'やくそく — promise.' } },
      ],
      E: [
        choose('c:sa_paraphrase', 'Which aisle does the slip mean?', { jp: 'はっきり しない {約束|やくそく} の {棚|たな} の 、 いちばん {奥|おく} 。', en: '"At the very back of the shelf of promises that aren\'t clear."' }, aisles(true), { en: 'はっきりしない約束 = 曖昧な約束.' }),
        choose('v:曖昧', 'Which word means the same as はっきり しない ("not clear")?', null, [
          { jp: '{曖昧|あいまい}', en: 'vague', ok: true },
          { jp: '{静|しず}か', en: 'quiet', ok: false, why: { en: 'Quiet is about sound, not clarity.' } },
          { jp: '{悲|かな}しい', en: 'sad', ok: false, why: { en: 'Sadness is a feeling, not a lack of clarity.' } },
        ], { jp: '{曖昧|あいまい}', en: 'あいまい: vague, ambiguous.' }),
      ],
      I: [
        choose('c:sa_paraphrase', 'Which aisle does the slip describe?', { jp: '{守|まも}る の か {守|まも}らない の か 、 {読|よ}む {人|ひと} に よって {違|ちが}う {約束|やくそく} 。 その {列|れつ} の {奥|おく} 。', en: '"Promises that read as kept or not kept depending on who reads them. At the back of that row."' }, aisles(false), { en: 'A promise whose meaning depends on the reader is a vague one: 曖昧な約束.' }),
        choose('c:sa_paraphrase', 'Which of these is also a paraphrase of 曖昧な約束?', null, [
          { jp: 'どう と でも {取|と}れる {約束|やくそく}', ok: true },
          { jp: '{破|やぶ}られた {約束|やくそく}', ok: false, why: { en: '"A broken promise" — clear enough, just not kept.' } },
          { jp: '{忘|わす}れられた {約束|やくそく}', ok: false, why: { en: '"A forgotten promise" — it may have been perfectly clear.' } },
        ], { jp: 'どう と でも {取|と}れる', en: 'どうとでも取れる: "can be taken any way at all".' }),
      ],
      A: [
        choose('c:sa_paraphrase', 'Which aisle does the slip describe?', { jp: 'どちら と も {取|と}れる {言質|げんち} ── {読|よ}み{手|て} {次第|しだい} で {白|しろ} に も {黒|くろ} に も なる {約束|やくそく} ── を {収|おさ}めた {列|れつ} の {突|つ}き{当|あ}たり 。', en: '"The end of the row that holds commitments that can be taken either way — promises that turn white or black depending on the reader."' }, aisles(false), { en: '言質 (a verbal commitment) that どちらとも取れる (can be read either way): 曖昧な約束.' }),
        choose('c:sa_paraphrase', 'Two phrases look alike. Which one describes the same thing as the slip?', null, [
          { jp: 'どう に でも {解釈|かいしゃく} できる {取|と}り{決|き}め', ok: true },
          { jp: '{言|い}った {言|い}わない の {水掛|みずか}け{論|ろん}', ok: false, why: { en: '"An endless he-said-she-said" — that is a quarrel about what was said, filed under 言い争い.' } },
          { jp: '{果|は}たされなかった {誓|ちか}い', ok: false, why: { en: '"A vow that went unfulfilled" — broken, not ambiguous.' } },
        ], { en: 'An arrangement (取り決め) that can be interpreted any way at all (どうにでも解釈できる) is exactly a promise whose colour depends on the reader.' }),
      ],
    },
  });

  // ---- 3. The charter gate (Conduits) ---------------------------------------------------------------------
  ch('sa.charter', {
    title: T('The charter gate', '{定|さだ}め の {門|もん}'),
    intro: T('The gate is bound to the Archive\'s founding charter. Beside it, in Kasane\'s hand, a note reads the charter in its own way. The gate will let through whoever reads the charter as it was written.', '{門|もん} は {書庫|しょこ} の {定|さだ}め に {従|したが}う 。 {横|よこ} に カサネ の {字|じ} の {貼|は}り{紙|がみ} が ある 。 {定|さだ}め を {書|か}かれた とおり に {読|よ}める {者|もの} だけ が {通|とお}れる 。'),
    tiers: {
      F: [
        choose('c:sa_charter', 'What did the founders promise to keep?', { jp: 'さだめ ： 「 なまえ の うつし を まもる 。 もとめられれば 、 かえす 。 」', en: 'Charter: "We keep copies of names. If asked, we give them back."' }, [
          { en: 'Copies of names', ok: true },
          { en: 'The names themselves', ok: false, why: { en: 'うつし means a copy. The names were meant to stay with their people.' } },
          { en: 'Nothing at all', ok: false, why: { en: 'まもる — they promised to keep something.' } },
        ], { en: 'うつし = a copy. The Archive was built to keep copies.' }),
        { kind: 'write', item: 'v:返す', prompt: { en: 'Write the charter\'s last word: かえす ("give back").' }, answer: 'かえす', accept: ['かえす', '返す'], mode: 'reading', explain: { en: 'かえす — to give back, return.' } },
        choose('c:sa_charter', 'Kasane\'s note says: "If not asked, we need not give them back." Does the charter say that?', { jp: 'カサネ ： 「 もとめられなければ 、 かえさなくて よい 。 」', en: 'Kasane: "If not asked, need not return."' }, [
          { en: 'No. The charter only says what happens when someone asks.', ok: true },
          { en: 'Yes, that is what it says.', ok: false, why: { en: 'Read it again: it says nothing about when no one asks.' } },
        ], { en: '"If asked, give back" is not "only if asked".' }),
      ],
      E: [
        choose('v:写す', 'The charter says the Archive 「{名前|なまえ} を {写|うつ}す」. What does 写す mean?', null, [
          { en: 'to copy', ok: true },
          { en: 'to take away', ok: false, why: { en: 'That would be 取る or 取り上げる.' } },
          { en: 'to hide', ok: false, why: { en: 'That would be 隠す.' } },
        ], { jp: '{写|うつ}す', en: '写す: to copy (also, to photograph). 写し: a copy.' }),
        choose('g:cond_ba', 'What does 「{求|もと}められれば 、 {返|かえ}す 。」 say?', { jp: '{定|さだ}め ： 「 {名前|なまえ} の {写|うつ}し を {守|まも}る 。 {求|もと}められれば 、 {返|かえ}す 。 」', en: 'Charter: "We keep copies of names. If asked, we return them."' }, [
          { en: 'If asked, (the Archive) returns them.', ok: true },
          { en: 'Only if asked does it return them.', ok: false, why: { en: '〜ば gives a condition, not the only condition. That is Kasane\'s reading.' } },
          { en: 'The Archive asks for them back.', ok: false, why: { en: '求められる is passive: the Archive is the one being asked.' } },
        ], { en: '求められれば = if (it) is asked. 〜ば states a condition; it doesn\'t rule out others.' }),
        { kind: 'order', item: 'c:sa_charter', prompt: { en: 'Put the charter\'s first line back together: "(We) keep copies of names."' }, tiles: ['{名前|なまえ}', 'の', '{写|うつ}し', 'を', '{守|まも}る'], answer: ['{名前|なまえ}', 'の', '{写|うつ}し', 'を', '{守|まも}る'], orderHint: { en: 'Noun の noun を verb.' } },
      ],
      I: [
        choose('c:sa_charter', 'The plaque on the gate quotes only part of the charter. What does it leave out that changes the meaning?', { jp: '{門|もん} の {札|ふだ} ： 「 {求|もと}められれば 、 {返|かえ}す 。 」 ／ {定|さだ}め ： 「 この {書庫|しょこ} は 、 {失|うしな}われた {名前|なまえ} の {写|うつ}し を {守|まも}る 。 {求|もと}められれば 、 {必|かなら}ず {返|かえ}す 。 」', en: 'Plaque: "If asked, return." / Charter: "This archive keeps copies of lost names. If asked, it will always return them."' }, [
          { en: 'That the Archive keeps copies (写し), not the names themselves.', ok: true },
          { en: 'That the Archive is a library.', ok: false, why: { en: 'The charter doesn\'t say that either.' } },
          { en: 'Nothing important.', ok: false, why: { en: 'Without 写し, it sounds as if the Archive may hold the originals.' } },
        ], { en: 'Cut away "copies" and "always", and "if asked, return" starts to sound like a favour.' }),
        choose('g:cond_ba', 'Kasane\'s note: 「{求|もと}められなければ 、 {返|かえ}さなくて よい 。」 Does the charter say this?', null, [
          { en: 'No. "If asked, return" says nothing about when no one asks.', ok: true },
          { en: 'Yes, it follows logically.', ok: false, why: { en: 'Only if you read "if" as "only if" — which the charter never says.' } },
        ], { en: '〜ば is "if", not "only if". Kasane added the "only".' }),
        choose('c:sa_charter', 'Which sentence keeps the charter?', null, [
          { jp: '{写|うつ}し は {書庫|しょこ} に {残|のこ}し 、 {名前|なまえ} そのもの は {持|も}ち{主|ぬし} に {戻|もど}す 。', ok: true },
          { jp: '{名前|なまえ} そのもの を {書庫|しょこ} に {集|あつ}める 。', ok: false, why: { en: '"Gather the names themselves into the Archive" — what the Hush does, and what the charter never allowed.' } },
          { jp: '{頼|たの}まれる まで 、 {何|なに}も {返|かえ}さない 。', ok: false, why: { en: '"Return nothing until asked" — Kasane\'s "only if".' } },
        ], { en: 'Copies stay here; the names themselves go back to their owners.' }),
      ],
      A: [
        choose('c:sa_charter', 'The charter is written in an old formal style. In 写し置き, what is the Archive to keep?', { jp: '{定|さだ}め ： 「 {当|とう}{書庫|しょこ} は 、 {災|わざわ}い に より {失|うしな}われし {名|な} を {写|うつ}し{置|お}き 、 {求|もと}め {有|あ}らば {必|かなら}ず {返|かえ}す べし 。 」', en: 'Charter: "This archive shall keep copies of names lost to disaster, and whenever they are asked for, shall without fail return them."' }, [
          { en: 'Copies of the lost names, set aside for safekeeping.', ok: true },
          { en: 'The lost names themselves, confiscated.', ok: false, why: { en: '写す is to copy; 置く is to set aside. Nothing is confiscated.' } },
          { en: 'Only the names that no one asks for.', ok: false, why: { en: 'That condition appears nowhere.' } },
        ], { en: '写し置く: to copy and set aside. 失われし is the classical form of 失われた.' }),
        choose('c:sa_charter', 'What kind of statement is 「{求|もと}め {有|あ}らば … {返|かえ}す べし」?', null, [
          { en: 'An obligation that applies whenever a request comes (べし: "shall, must").', ok: true },
          { en: 'A permission to refuse unless asked.', ok: false, why: { en: 'べし binds the Archive; it grants no permission.' } },
          { en: 'A prediction about what will happen.', ok: false, why: { en: 'In a charter, べし states a duty, not a forecast.' } },
        ], { en: '有らば (= あれば, "if there is") + べし: whenever there is a request, it must return.' }),
        choose('c:sa_charter', 'Kasane\'s gloss reads: 「{求|もと}められなければ {返|かえ}さなくて よい 」. What has it done to the charter?', null, [
          { en: 'Turned "if asked, return" into "only if asked, return" — a condition the charter never states.', ok: true },
          { en: 'Restated exactly what 求め有らば means.', ok: false, why: { en: '求め有らば gives one case. It is silent on the others.' } },
          { en: 'Quoted the charter\'s second half.', ok: false, why: { en: 'The charter has no such half.' } },
        ], { en: 'A sufficient condition read as a necessary one. The same slip — reading a conditional without its context — runs through this whole building.' }),
      ],
    },
  });

  // ---- 4. Side quest: Isamu's folio (Room of Set-Down Memories) ------------------------------------------------
  ch('sa.isamu_find', {
    title: T('Isamu\'s folio', 'イサム の {綴|つづ}り'),
    intro: T('The folios are catalogued in Kasane\'s formal hand, not in the words people used when they set them down. Match Isamu\'s description to the right entry.', '{綴|つづ}り の {説明|せつめい} は 、 {預|あず}けた {人|ひと} の {言葉|ことば} で は なく 、 カサネ の かたい {文|ぶん} で {書|か}いて ある 。'),
    tiers: {
      F: [
        choose('c:sa_isamu', 'Isamu said: "Her laugh — like a kettle about to boil. From Saltglass, five winters ago." Which folio is his?', null, [
          { jp: 'わく まえ の やかん の ような わらいごえ 。 しおがらす 。 ごねん まえ 。', en: 'A laugh like a kettle about to boil. Saltglass. Five years ago.', ok: true },
          { jp: 'おゆ を いれる とき の はなうた 。 しおがらす 。 じゅうねん まえ 。', en: 'Humming while pouring hot water. Saltglass. Ten years ago.', ok: false, why: { en: 'Humming, not laughing — and ten years, not five.' } },
          { jp: 'あめ の ような ねいき 。 ゆきすず 。 はちねん まえ 。', en: 'Breathing in sleep, like rain. Snowbell. Eight years ago.', ok: false, why: { en: 'Wrong town, wrong sound.' } },
        ], { en: 'A laugh, a kettle, Saltglass, five years: all four details match.' }),
      ],
      E: [
        choose('c:sa_isamu', 'Isamu said: 「{笑|わら}い{声|ごえ} だ 。 {沸|わ}く {前|まえ} の やかん みたい な 。 {潮硝子|しおがらす} で 、 {五年前|ごねんまえ} に {預|あず}けた 。」 Which folio is his?', null, [
          { jp: '{沸|わ}く {前|まえ} の やかん の よう な {笑|わら}い{声|ごえ} 。 {潮硝子|しおがらす} 。 {五年前|ごねんまえ} 。', ok: true },
          { jp: 'お{湯|ゆ} を {入|い}れる {時|とき} の {鼻歌|はなうた} 。 {潮硝子|しおがらす} 。 {十年前|じゅうねんまえ} 。', ok: false, why: { en: 'Humming (鼻歌) while pouring hot water — and ten years ago.' } },
          { jp: '{最後|さいご} に {聞|き}いた {怒|おこ}った {声|こえ} 。 {灯落|ひおち} 。 {五年前|ごねんまえ} 。', ok: false, why: { en: 'An angry voice from Lanternfall. Five years matches; nothing else does.' } },
        ], { en: 'みたいな and のような both mean "like …".' }),
      ],
      I: [
        choose('c:sa_isamu', 'Isamu: 「あいつ の {笑|わら}い{方|かた} さ 。 やかん が {沸|わ}き{出|だ}す {手前|てまえ} みたい に 、 {低|ひく}く {始|はじ}まって {止|と}まらなく なる 。 {五年前|ごねんまえ} 、 {潮硝子|しおがらす} から {持|も}って きた 。」 Which entry is his?', null, [
          { jp: '{沸騰|ふっとう}{直前|ちょくぜん} の {薬缶|やかん} を {思|おも}わせる {笑|わら}い{声|ごえ} 。 {潮硝子|しおがらす} 。 {五年前|ごねんまえ} 。', ok: true },
          { jp: '{沸|わ}いた {湯|ゆ} を {注|そそ}ぐ {時|とき} の {鼻歌|はなうた} 。 {潮硝子|しおがらす} 。 {十年前|じゅうねんまえ} 。', ok: false, why: { en: 'Boiled water, not "just before boiling"; a hum, not a laugh; ten years, not five.' } },
          { jp: '{雨音|あまおと} に {似|に}た {寝息|ねいき} 。 {雪鈴|ゆきすず} 。 {八年前|はちねんまえ} 。', ok: false, why: { en: 'Breathing in sleep, from Snowbell.' } },
          { jp: '{最後|さいご} に {聞|き}いた {怒|いか}り の {声|こえ} 。 {灯落|ひおち} 。 {五年前|ごねんまえ} 。', ok: false, why: { en: 'Only the year matches.' } },
        ], { en: '沸き出す手前 ("just before it starts to boil") = 沸騰直前; 〜を思わせる = "reminiscent of".' }),
        choose('c:sa_isamu', 'The humming entry also mentions a kettle and Saltglass. Which detail rules it out most clearly?', null, [
          { en: '沸いた湯 — water that has already boiled, not a kettle about to.', ok: true },
          { en: '注ぐ — someone is pouring.', ok: false, why: { en: 'Pouring alone could fit many memories.' } },
          { en: 'Nothing — it could be his.', ok: false, why: { en: 'Isamu was precise: "just before it boils".' } },
        ], { en: 'The tense of 沸いた (has boiled) versus 沸く前 / 直前 (about to boil) is the telling difference.' }),
      ],
      A: [
        choose('c:sa_isamu', 'Isamu: 「{笑|わら}い{方|かた} だよ 。 {低|ひく}く くつくつ {始|はじ}まって 、 {最後|さいご} は {自分|じぶん} でも {止|と}められなく なる 。 {沸|わ}く {寸前|すんぜん} の やかん そっくり でな 。 {五年|ごねん} {前|まえ} の {冬|ふゆ} 、 {潮硝子|しおがらす} から {担|かつ}いで {来|き}た 。」 Which entry is his?', null, [
          { jp: '{沸騰|ふっとう}{直前|ちょくぜん} の {薬缶|やかん} を {彷彿|ほうふつ} と させる {笑|わら}い{声|ごえ} 。 {潮硝子|しおがらす} 。 {五年前|ごねんまえ} 。', ok: true },
          { jp: '{湯|ゆ} を {注|そそ}ぎ ながら の {鼻歌|はなうた} 。 {煮|に}え{立|た}った {薬缶|やかん} の {音|おと} を {伴|ともな}う 。 {潮硝子|しおがらす} 。 {十年前|じゅうねんまえ} 。', ok: false, why: { en: 'A hum accompanied by a kettle already at the boil (煮え立った) — ten years ago.' } },
          { jp: '{怒声|どせい} 。 {最後|さいご} の {口論|こうろん} に おける もの 。 {灯落|ひおち} 。 {五年前|ごねんまえ} 。', ok: false, why: { en: 'An angry shout from a final quarrel — Lanternfall.' } },
        ], { en: '彷彿とさせる ("brings vividly to mind") is the formal cousin of そっくり; 沸騰直前 matches 沸く寸前.' }),
        choose('c:sa_isamu', 'Isamu says 担いで来た ("carried it up on my back"). What does that small word add?', null, [
          { en: 'That he climbed the road himself with it — setting it down was his own heavy choice.', ok: true },
          { en: 'That someone else brought it for him.', ok: false, why: { en: '担ぐ is to shoulder a load yourself.' } },
          { en: 'That the folio is physically heavy.', ok: false, why: { en: 'A memory weighs nothing on a scale; he means the climb, and the choice.' } },
        ], { en: 'Word choice carries weight: 担ぐ makes the memory a load he chose to carry up the mountain.' }),
      ],
    },
  });

  // ---- 5. Side quest: a name for the clerk ------------------------------------------------------------------------
  const nameStep = { kind: 'write', item: 'v:綴り', prompt: { en: 'The clerk holds out its blank name tag. Write its name: ツヅリ (katakana or hiragana).' }, answer: 'ツヅリ', accept: ['ツヅリ', 'つづり', '綴り'], mode: 'reading', script: 'kata', explain: { en: 'ツヅリ — from 綴る, "to bind pages together; to spell".' } };
  const names = (why1, why2) => [
    { jp: 'シオリ', en: 'Shiori (bookmark)', ok: false, why: { en: why1 } },
    { jp: 'ヨミ', en: 'Yomi (reading)', ok: false, why: { en: why2 } },
    { jp: 'ツヅリ', en: 'Tsuzuri (binding; spelling)', ok: true },
  ];
  ch('sa.clerk_name', {
    title: T('Ushio\'s three names', 'ウシオ の {三|みっ}つ の {名前|なまえ}'),
    intro: T('Near the back of Ushio\'s notebook, under "for the clerk", three names — and a note beside each.', '{手帳|てちょう} の {後|うし}ろ の ほう に 「{係|かかり} へ 」 と あり 、 {名前|なまえ} が {三|みっ}つ 、 それぞれ に {一言|ひとこと} {添|そ}えて ある 。'),
    tiers: {
      F: [
        choose('c:sa_clerk', 'Which name did Ushio settle on?', { jp: 'シオリ ── ずっと はさまれて いる の は かわいそう 。 ／ ヨミ ── よむ だけ じゃ ない 。 かく 。 ／ ツヅリ ── ばらばら の かみ を ひとつ に する 。 これ だ 。', en: 'Shiori — a pity to be stuck between pages forever. / Yomi — it doesn\'t only read; it writes. / Tsuzuri — it makes loose pages into one. This is it.' }, names('Ushio thought a bookmark stays stuck in one place.', 'Ushio pointed out it writes as well as reads.'), { en: 'これだ — "this is it".' }),
        nameStep,
      ],
      E: [
        choose('c:sa_clerk', 'Which name did Ushio settle on?', { jp: 'シオリ ── ずっと {同|おな}じ ページ に {挟|はさ}まれて いる の は 、 かわいそう だ 。 ／ ヨミ ── {読|よ}む だけ の やつ じゃ ない 。 {書|か}く 。 ／ ツヅリ ── ばらばら の {紙|かみ} を {一冊|いっさつ} に まとめる 。 {間違|まちが}えた {字|じ} も {一緒|いっしょ} に 。 これ だ 。', en: 'Shiori — a pity to be stuck in the same page forever. / Yomi — it isn\'t one who only reads. It writes. / Tsuzuri — gathers loose pages into one book, mistakes and all. This is it.' }, names('かわいそう — Ushio felt sorry for a name that never moves.', '〜だけのやつじゃない — "not one who only …".'), { en: 'これだ closes the question.' }),
        nameStep,
      ],
      I: [
        choose('c:sa_clerk', 'Ushio doesn\'t say "no" to any name outright. Which one did Ushio mean to give?', { jp: 'シオリ ── {挟|はさ}まれた まま {動|うご}けない の は 、 もう {十分|じゅうぶん} だろう 。 ／ ヨミ ── {読|よ}む だけ で {書|か}かない {奴|やつ} じゃ ない 。 ／ ツヅリ ── ばらばら の {紙|かみ} を {一冊|いっさつ} に {綴|と}じる 。 {書|か}き{損|そん}じ も {捨|す}てず に 。 …… うん 。', en: 'Shiori — it has been stuck between pages long enough. / Yomi — it isn\'t one who reads and never writes. / Tsuzuri — binds loose pages into one book, without throwing out the spoiled ones. …Yes.' }, names('もう十分だろう — "that\'s been enough, surely": Ushio is against a name that keeps it stuck.', 'It isn\'t a mere reader — the note rules the name out without saying no.'), { en: 'The first two notes reject by implication; うん is Ushio agreeing with the last.' }),
        nameStep,
      ],
      A: [
        choose('c:sa_clerk', 'Which name did Ushio settle on, reading between the lines?', { jp: 'シオリ ── {挟|はさ}まれた {場所|ばしょ} から {一歩|いっぽ} も {動|うご}けぬ {名|な} を 、 あの {働|はたら}き{者|もの} に {付|つ}ける わけ に は いかない 。 ／ ヨミ ── {読|よ}む {一方|いっぽう} の {名|な} だ 。 あれ は {自分|じぶん} で {書|か}き{足|た}す 。 ／ ツヅリ ── ばらばら の {紙|かみ} を {一冊|いっさつ} に {綴|と}じる 。 {書|か}き{損|そん}じ ごと 。 {文句|もんく} なし 。', en: 'Shiori — I can hardly give that hard worker a name that can\'t take a step from where it\'s wedged. / Yomi — a name for one who only reads; that one adds its own lines. / Tsuzuri — binds loose pages into one book, spoiled sheets and all. No objection.' }, names('〜わけにはいかない: "can\'t very well" — a refusal made on principle.', '〜一方: "only ever …" — and the clerk writes as well.'), { en: 'From Ushio, who objected to everything for six years, 文句なし ("no objection") is the highest praise.' }),
        nameStep,
      ],
    },
  });

  // ---- 6. Tōya's note (the climax) --------------------------------------------------------------------------------
  // Chapter 5 established Takase's ambiguous reply 「必要なら開ける」, which the
  // messenger Tōya carried home and which Kasane, as clerk, read as a promise.
  // Here: after their quarrel, Tōya left Kasane a note in the same four words,
  // on the back of the bell-tower key slip. Read in context, it is not vague.
  const DOC = {
    F: 'カサネ （ ろうか で ） ： 「 ひつよう ない 。 だれ も あけない 。 かぎ を おいて いきなさい 。 」 ／ トウヤ の かきおき （ かぎ の かみ の うら ） ： 「 ひつようなら あける 。 」',
    E: '① カサネ （ {廊下|ろうか} で ） ： 「 {必要|ひつよう} ない 。 {高瀬|たかせ} は {開|あ}けない 。 {鐘|かね} の {塔|とう} も 、 {誰|だれ} も {開|あ}けない 。 {鍵|かぎ} を {置|お}いて いきなさい 。 」 ② {鍵|かぎ} の {紙|かみ} の {表|おもて} ： 「 {鐘|かね} の {塔|とう} の {鍵|かぎ} 。 {持|も}って いった {人|ひと} ： トウヤ 。 」 ③ {裏|うら} ： 「 {必要|ひつよう}なら {開|あ}ける 。 」',
    I: '① {議会|ぎかい} の {貼|は}り{紙|がみ} ： 「 {高瀬|たかせ} より {返答|へんとう} 。 『 {必要|ひつよう}なら {開|あ}ける 』 。 {本|ほん}{議会|ぎかい} は 、 これ を {開|あ}けない {約束|やくそく} と {受|う}け{取|と}る 。 {鐘楼|しょうろう} は {施錠|せじょう} の まま と する 。 」 ② カサネ の {記憶|きおく} （ {廊下|ろうか} ） ： 「 {必要|ひつよう} ない 。 {高瀬|たかせ} は {開|あ}けない と {約束|やくそく} した の 。 {鐘楼|しょうろう} も 、 {誰|だれ} も {開|あ}けない 。 {鍵|かぎ} を {置|お}いて いきなさい 、 トウヤ 。 」 ③ {鍵|かぎ} の {控|ひか}え ： {表|おもて} 「 {鐘楼|しょうろう} {鍵|かぎ} {持|も}ち{出|だ}し ── {使|つか}い トウヤ 。 {許可|きょか} なし 。 」 {裏|うら} 「 {必要|ひつよう}なら {開|あ}ける 。 」',
    A: '① {貼|は}り{紙|がみ} ： 「 {高瀬|たかせ} より {返答|へんとう} 。 『 {必要|ひつよう}なら {開|あ}ける 』 。 {本|ほん}{議会|ぎかい} は 、 これ を {開|あ}けない {約束|やくそく} と {受|う}け{取|と}る 。 {鐘楼|しょうろう} は {施錠|せじょう} の まま と する 。 」 ② {廊下|ろうか} で の {口論|こうろん} （ カサネ の {記憶|きおく} ） ： トウヤ 「 {向|む}こう の {顔|かお} を {見|み}て ない から 、 そう {言|い}える んだ 。 {高瀬|たかせ} は {開|あ}ける 。 」 カサネ 「 {必要|ひつよう} ない 。 {文面|ぶんめん} は {約束|やくそく} よ 。 {鐘楼|しょうろう} も 、 {誰|だれ} も {開|あ}けない 。 {鍵|かぎ} を {置|お}いて いきなさい 。 {書記|しょき} と して {言|い}って いる の 。 」 ③ {鍵|かぎ} の {控|ひか}え ： {表|おもて} 「 {鐘楼|しょうろう} {鍵|かぎ} {持|も}ち{出|だ}し ── {使|つか}い トウヤ 。 {許可|きょか} なし 。 {書記|しょき} カサネ 」 {裏|うら} 「 {必要|ひつよう}なら {開|あ}ける 。 」 ④ タエ の {紙片|しへん} ： 「 {夜中|よなか} に {鐘|かね} が {鳴|な}った 。 {鍵|かぎ} の かかって いた はず の {鐘楼|しょうろう} から 。 {鳴|な}らした {人|ひと} は 、 {出|で}て こなかった 。 」',
  };
  const DOC_EN = {
    F: 'Kasane (in the corridor): "It isn\'t needed. No one is opening it. Leave the key." / Tōya\'s note (on the back of the key slip): "If needed, open."',
    E: '(1) Kasane, in the corridor: "It isn\'t needed. Takase won\'t open it. And no one is opening the bell tower either. Leave the key." (2) Front of the key slip: "Bell tower key. Taken by: Tōya." (3) Back: "If needed, open."',
    I: '(1) Council notice: "Reply from Takase: \'If needed, open.\' This council takes it as a promise not to open. The bell tower shall remain locked." (2) Kasane\'s memory of the corridor: "It isn\'t needed. Takase promised not to open it. And no one is opening the bell tower either. Leave the key, Tōya." (3) Key slip — front: "Bell tower key taken out: messenger Tōya. Without permission." Back: "If needed, open."',
    A: '(1) Notice: "Reply from Takase: \'If needed, open.\' This council takes it as a promise not to open. The bell tower shall remain locked." (2) The quarrel in the corridor (Kasane\'s memory) — Tōya: "You can say that because you didn\'t see their faces. Takase is going to open it." Kasane: "It isn\'t needed. The wording is a promise. And no one is opening the bell tower either. Leave the key. I\'m telling you as clerk." (3) Key slip — front: "Bell tower key taken out: messenger Tōya. Without permission. Clerk Kasane." Back: "If needed, open." (4) Tae\'s slip: "At midnight the bell rang — from the tower that was supposed to be locked. The one who rang it never came out."',
  };
  const doc = (lv) => ({ jp: DOC[lv], en: DOC_EN[lv] });
  ch('sa.toya', {
    title: T('「必要なら開ける」', '「{必要|ひつよう}なら {開|あ}ける」'),
    intro: T('You lay everything out on the floor of the Heart: Kasane\'s first folio, the key slip from the desk, the council\'s notice from the conduits. Tōya\'s four words are the same as Takase\'s. Read his where they belong.', '{芯|しん} の {床|ゆか} に 、 {全部|ぜんぶ} {並|なら}べる 。 カサネ の {最初|さいしょ} の {綴|つづ}り 。 {机|つくえ} の {上|うえ} の {鍵|かぎ} の {控|ひか}え 。 {水路|すいろ} で {見|み}つけた {貼|は}り{紙|がみ} 。'),
    tiers: {
      F: [
        { kind: 'write', item: 'v:開ける', ctx: doc('F'), prompt: { en: 'Tōya\'s note ends with the verb "open". Write it: あける.' }, answer: 'あける', accept: ['あける', '開ける'], mode: 'reading', explain: { en: 'あける — to open (something).' } },
        choose('c:sa_toya', 'Tōya wrote his note on the back of the bell tower\'s key slip. What did he mean to open?', doc('F'), [
          { en: 'The bell tower', ok: true },
          { en: 'The sluice gate', ok: false, why: { en: 'That was Takase\'s reply. His note is on the key slip for the tower.' } },
          { en: 'A letter', ok: false, why: { en: 'Look at what the slip is for.' } },
        ], { en: 'The key slip and Kasane\'s words both point to the bell tower.' }),
        choose('c:sa_toya', 'Kasane said だれ も あけない ("no one is opening it"). Tōya wrote あける ("open"). Who would open it?', doc('F'), [
          { en: 'Tōya himself', ok: true },
          { en: 'Nobody', ok: false, why: { en: 'That was what Kasane said. He wrote the opposite.' } },
          { en: 'The council', ok: false, why: { en: 'The council locked it.' } },
        ], { en: 'あけない (won\'t open) → あける (will open). He answered Kasane: "I will."' }),
      ],
      E: [
        choose('g:v_nai', 'Kasane said 「{誰|だれ} も {開|あ}けない」. Tōya wrote 「{必要|ひつよう}なら {開|あ}ける」. What did he do with Kasane\'s words?', doc('E'), [
          { en: 'He answered their "no one will open it" with "I will open it — if it\'s needed."', ok: true },
          { en: 'He copied Takase\'s reply.', ok: false, why: { en: 'Same words — but written on the key slip, straight after the quarrel, they answer Kasane.' } },
          { en: 'He agreed with Kasane.', ok: false, why: { en: '開けない is negative; 開ける is not.' } },
        ], { en: '開けない (won\'t open) and 開ける (will open): one small change, a whole answer.' }),
        choose('c:sa_toya', 'What would Tōya open?', doc('E'), [
          { jp: '{鐘|かね} の {塔|とう}', en: 'the bell tower', ok: true },
          { jp: '{水門|すいもん}', en: 'the sluice gate', ok: false, why: { en: 'The note is written on the tower key\'s slip.' } },
          { jp: '{手紙|てがみ}', en: 'the letter', ok: false, why: { en: 'Nothing there is a letter to open.' } },
        ], { en: 'Japanese often leaves the object out when it is obvious — here, from the key slip and the quarrel.' }),
        { kind: 'order', item: 'c:sa_toya', ctx: doc('E'), prompt: { en: 'Say in full what Tōya meant: "If it\'s needed, I\'ll open the tower."' }, tiles: ['{必要|ひつよう}なら', '{僕|ぼく}が', '{塔|とう}を', '{開|あ}ける'], answer: ['{必要|ひつよう}なら', '{僕|ぼく}が', '{塔|とう}を', '{開|あ}ける'], alts: [['{僕|ぼく}が', '{必要|ひつよう}なら', '{塔|とう}を', '{開|あ}ける'], ['{必要|ひつよう}なら', '{塔|とう}を', '{僕|ぼく}が', '{開|あ}ける']], orderHint: { en: 'The condition (〜なら) usually comes first; the verb comes last.' } },
      ],
      I: [
        choose('c:sa_toya', 'The same four words appear twice: Takase\'s reply in the notice, and Tōya\'s note. What is different about them?', doc('I'), [
          { en: 'Who opens what. Takase meant its own sluice gate; Tōya meant that he would open the bell tower.', ok: true },
          { en: 'Nothing — Tōya was quoting Takase at Kasane.', ok: false, why: { en: 'That is how Kasane read it for thirty years. Look where he wrote it, and what it answers.' } },
          { en: 'Only the handwriting.', ok: false, why: { en: 'The handwriting is the least of it.' } },
        ], { en: 'Identical words, different context: different subject, different object.' }),
        choose('c:sa_toya', 'Kasane said 「{鐘楼|しょうろう} も 、 {誰|だれ} も {開|あ}けない 」. How does the note answer that?', doc('I'), [
          { en: 'It turns "no one will open it" into "I will open it, if it\'s needed."', ok: true },
          { en: 'It agrees and promises to leave the key.', ok: false, why: { en: 'He took the key — the front of the slip records it.' } },
          { en: 'It passes Takase\'s message on again.', ok: false, why: { en: 'Kasane already had Takase\'s message; the quarrel was about it.' } },
        ], { en: '開けない → 開ける. The omitted subject is the writer, the one holding the key.' }),
        choose('g:hazu', 'The notice says 「{鐘楼|しょうろう} は {施錠|せじょう} の まま と する 」. That night the bell rang. What follows?', doc('I'), [
          { en: 'Someone unlocked the tower — the one who had taken the key: Tōya.', ok: true },
          { en: 'The notice was wrong about the lock.', ok: false, why: { en: 'The tower was locked. Someone with the key opened it.' } },
          { en: 'The bell rang by itself.', ok: false, why: { en: 'Bells don\'t ring themselves, even in this story.' } },
        ], { en: 'The key slip says who had the key. He did what his note said.' }),
      ],
      A: [
        choose('c:sa_toya', 'Why could Kasane read the note for thirty years as nothing but Takase\'s words thrown back at them?', doc('A'), [
          { en: 'Because Kasane had set down their own words from the corridor. Without them, the note matched only Takase\'s reply.', ok: true },
          { en: 'Because Tōya\'s handwriting was hard to read.', ok: false, why: { en: 'The four words were never in doubt; their reference was.' } },
          { en: 'Because the note was in a formal register.', ok: false, why: { en: 'It is plain speech — sibling to sibling.' } },
        ], { en: 'Lose the question and even a precise answer looks vague.' }),
        choose('c:sa_toya', 'Recover the omitted subject and object of the note.', doc('A'), [
          { jp: '{僕|ぼく}が {鐘楼|しょうろう}を {開|あ}ける 。', ok: true },
          { jp: '{我々|われわれ}が {水門|すいもん}を {開|ひら}く 。', ok: false, why: { en: '"We shall open the sluice" — Takase\'s meaning, in an official voice.' } },
          { jp: '{誰|だれ}か が {鐘楼|しょうろう}を {開|あ}ける だろう 。', ok: false, why: { en: '"Someone will probably open it" — a guess, not a commitment.' } },
        ], { en: 'Subject: the writer, who had just taken the key. Object: the tower on the slip.' }),
        choose('c:sa_toya', 'Takase\'s 必要なら left open "needed by whom?". In Tōya\'s note, who judges the need?', doc('A'), [
          { en: 'Tōya himself: the one who writes 開ける is the one who will be standing at the door.', ok: true },
          { en: 'The council.', ok: false, why: { en: 'The council had already decided it wasn\'t needed.' } },
          { en: 'Takase.', ok: false, why: { en: 'Takase decides about its own sluice, not the tower\'s key.' } },
        ], { en: 'When the one who judges the condition is the one who acts, the same conditional stops being vague.' }),
        choose('c:sa_toya', 'Which paraphrase is faithful to what Tōya meant?', doc('A'), [
          { jp: '{誰|だれ} も {開|あ}けない なら 、 {必要|ひつよう} な {時|とき} は {僕|ぼく} が {開|あ}ける 。', ok: true },
          { jp: '{高瀬|たかせ} は {必要|ひつよう} なら {開|あ}ける と {言|い}って いる 。 {気|き} を つけて 。', ok: false, why: { en: '"Takase says it will open if needed — be careful": a relay of Takase\'s message. It ignores the key slip he wrote on.' } },
          { jp: '{必要|ひつよう} なら 、 {鍵|かぎ} は {返|かえ}す 。', ok: false, why: { en: '"If needed, I\'ll give the key back" — the opposite of what he did.' } },
        ], { en: '"If no one else will, then when it\'s needed, I will." And Tae\'s slip says the rest: the bell rang from a locked tower, and the one who rang it never came out.' }),
      ],
    },
  });

  // ---- 7. Ren and the last quarrel (only when Ren travels with you and takes the memory back) -------------------
  const QUARREL = {
    F: T('Ren: "Fine, do what you like. Don\'t ever come back." / Ushio (smiling): "All right. I\'m counting on you for the lamps."', 'レン ： 「 かって に しろ 。 もう かえって くるな 。 」 ／ ウシオ （ わらって ） ： 「 わかった 。 ひ は たのんだ 。 」'),
    E: T('Ren: "Do what you like. Don\'t come back." / Ushio (smiling): "All right. I\'m counting on you for the lamps."', 'レン ： 「 {勝手|かって} に しろ 。 もう {帰|かえ}って くるな 。 」 ／ ウシオ （ {笑|わら}って ） ： 「 {分|わ}かった 。 {灯|ひ} は {頼|たの}んだ 。 」'),
    I: T('Ren: "Do what you like. Don\'t ever come back." / Ushio, smiling, not arguing for once: "All right. The lamps — I\'m counting on you."', 'レン ： 「 {勝手|かって} に しろ 。 もう {二度|にど} と {帰|かえ}って くるな 。 」 ／ ウシオ （ めずらしく {言|い}い{返|かえ}さず 、 {笑|わら}って ） ： 「 {分|わ}かった 。 {灯|ひ} は {頼|たの}んだ 。 」'),
    A: T('Ren: "Do as you please. Don\'t ever come back." / Ushio, smiling — for once not answering back: "All right. The lamps — I\'m leaving them to you."', 'レン ： 「 {勝手|かって} に しろ 。 {二度|にど} と {帰|かえ}って くるな 。 」 ／ ウシオ （ めずらしく {言|い}い{返|かえ}さず 、 {笑|わら}って ） ： 「 {分|わ}かった 。 {灯|ひ} は {頼|たの}んだ 。 」'),
  };
  ch('sa.ren_reply', {
    title: T('The last quarrel', '{最後|さいご} の {口論|こうろん}'),
    intro: T('Ren remembers the words. Now they can see the face that said them. Help Ren read Ushio\'s answer.', 'レン は {言葉|ことば} を {覚|おぼ}えて いた 。 いま 、 それ を {言|い}った {顔|かお} が {見|み}える 。'),
    tiers: {
      F: [
        choose('c:sa_ren', 'What was Ushio doing with those words?', QUARREL.F, [
          { en: 'Trusting Ren with the lamps', ok: true },
          { en: 'Agreeing never to come back', ok: false, why: { en: 'Look at what comes after わかった.' } },
          { en: 'Refusing to leave', ok: false, why: { en: 'Ushio left.' } },
        ], { en: 'ひ は たのんだ — "I\'m counting on you for the lamps."' }),
      ],
      E: [
        choose('v:頼む', 'What does 「{灯|ひ} は {頼|たの}んだ」 mean here?', QUARREL.E, [
          { en: 'I\'m leaving the lamps to you — I\'m counting on you.', ok: true },
          { en: 'I asked for a lamp.', ok: false, why: { en: 'The past tense here is idiomatic: 頼んだ = "I\'m counting on you".' } },
          { en: 'The lamps are broken.', ok: false, why: { en: 'Nothing is said about breaking.' } },
        ], { en: '頼んだ(よ) is said when handing a task to someone you trust.' }),
      ],
      I: [
        choose('c:sa_ren', 'Ren always heard 分かった as "fine, I won\'t come back." Given what follows it, what was Ushio agreeing to?', QUARREL.I, [
          { en: 'To go — and to leave the lamps in Ren\'s hands while gone.', ok: true },
          { en: 'Never to return.', ok: false, why: { en: 'You don\'t hand your work to someone you mean never to see again — not like that.' } },
          { en: 'That Ren had won the argument.', ok: false, why: { en: 'Ushio simply didn\'t argue — which, for Ushio, was the message.' } },
        ], { en: 'The second sentence reframes the first: 分かった accepts Ren\'s anger, 灯は頼んだ answers what lay under it.' }),
        choose('v:頼む', 'Why is 頼んだ in the past tense?', null, [
          { en: 'It\'s a set way of entrusting something: "consider it asked — I\'m counting on you."', ok: true },
          { en: 'Because Ushio had asked earlier and was reminding Ren.', ok: false, why: { en: 'Possible in other contexts, but here it is the idiomatic handing-over.' } },
        ], { en: 'Like 頼んだよ or 任せた, the た here marks the request as done — the trust is already given.' }),
      ],
      A: [
        choose('c:sa_ren', 'Ren has read 分かった as agreement to never return. Which reading fits Ushio better?', QUARREL.A, [
          { jp: '{怒|おこ}って いる {弟子|でし} に {言|い}い{返|かえ}さず 、 {後|あと} を {託|たく}した 。', ok: true },
          { jp: '{弟子|でし} を {突|つ}き{放|はな}した 。', ok: false, why: { en: '"Pushed the apprentice away" — but 頼んだ binds them closer.' } },
          { jp: '{議論|ぎろん} に {負|ま}けた と {認|みと}めた 。', ok: false, why: { en: '"Admitted defeat in the argument" — Ushio, who argued with Kasane for six years, did not lose arguments by accident.' } },
        ], { en: '後を託す: to leave what comes after in someone\'s hands. The silence where a retort should have been is part of the message.' }),
        choose('c:sa_ren', 'What does めずらしく言い返さず ("for once, without answering back") add?', null, [
          { en: 'That Ushio chose not to win this one — the lack of a retort was deliberate.', ok: true },
          { en: 'That Ushio was too tired to argue.', ok: false, why: { en: 'Possible, but the smile says otherwise.' } },
          { en: 'That Ushio agreed with every word.', ok: false, why: { en: 'Not answering back isn\'t the same as agreeing.' } },
        ], { en: 'めずらしく marks it as out of character — which is what makes it mean something.' }),
      ],
    },
  });

  // ---- oral history: Kasane's account of the flood ------------------------------------------------------------------
  C.activities['sa.flood_history'] = {
    type: 'history', title: T('The flood, thirty years ago', '{三十年前|さんじゅうねんまえ} の {洪水|こうずい}'), teller: 'kasane', item: 'c:sa_history', note: 'sa_kasane',
    fragments: [
      {
        F: { jp: 'あの とし は 、 あめ が やみません でした 。', en: 'That year, the rain would not stop.', short: 'あめ が やまない' },
        E: { jp: 'あの {年|とし} は 、 {秋|あき} の {雨|あめ} が {止|や}みません でした 。', en: 'That year, the autumn rain would not stop.', short: '{雨|あめ} が {止|や}まない' },
        I: { jp: 'あの {年|とし} は 、 {秋|あき} の {長雨|ながあめ} が いつ まで も {止|や}みません でした 。', en: 'That year, the long autumn rains simply would not stop.', short: '{長雨|ながあめ}' },
        A: { jp: 'あの {年|とし} は 、 {秋|あき} の {長雨|ながあめ} が {明|あ}ける {気配|けはい} も ありません でした 。', en: 'That year there was no sign at all of the long autumn rains letting up.', short: '{長雨|ながあめ} が {明|あ}けない' },
      },
      {
        F: { jp: 'たかせ と ひおち は 、 けんか を して いました 。', en: 'Takase and Lanternfall were quarrelling.', short: 'たかせ と の けんか' },
        E: { jp: '{高瀬|たかせ} と {灯落|ひおち} は 、 {水門|すいもん} の こと で けんか して いました 。', en: 'Takase and Lanternfall were quarrelling about the sluice.', short: '{水門|すいもん} の けんか' },
        I: { jp: '{上流|じょうりゅう} の {高瀬|たかせ} と {灯落|ひおち} は 、 {水門|すいもん} を めぐって {何週間|なんしゅうかん} も {言|い}い{争|あらそ}って いました 。', en: 'For weeks, Takase upstream and Lanternfall had been arguing over the sluice.', short: '{水門|すいもん} を めぐる {争|あらそ}い' },
        A: { jp: '{上流|じょうりゅう} の {高瀬|たかせ} と {灯落|ひおち} は 、 {水門|すいもん} の {開|ひら}け{閉|し}め を めぐって 、 {何週間|なんしゅうかん} も {平行線|へいこうせん} を たどって いました 。', en: 'For weeks Takase and Lanternfall had argued in parallel lines over the opening and shutting of the sluice, never meeting.', short: '{平行線|へいこうせん}' },
      },
      {
        F: { jp: 'トウヤ が 、 たかせ の へんじ を もって かえりました 。 「 ひつようなら あける 」 。', en: 'Tōya brought back Takase\'s reply: "If needed, open."', short: 'たかせ の へんじ' },
        E: { jp: '{使|つか}い の トウヤ が 、 {高瀬|たかせ} の {返事|へんじ} を {持|も}って {帰|かえ}りました 。 「 {必要|ひつよう}なら {開|あ}ける 」 。', en: 'Tōya, the messenger, brought back Takase\'s reply: "If needed, open."', short: '{高瀬|たかせ} の {返事|へんじ}' },
        I: { jp: '{使|つか}い の トウヤ が 、 {雨|あめ} の {中|なか} を {走|はし}って 、 {高瀬|たかせ} の {返事|へんじ} を {持|も}ち{帰|かえ}りました 。 「 {必要|ひつよう}なら {開|あ}ける 」 。', en: 'Tōya, our messenger, ran back through the rain with Takase\'s reply: "If needed, open."', short: '{雨|あめ} の {中|なか} の {返事|へんじ}' },
        A: { jp: '{使|つか}い の トウヤ が 、 {雨|あめ} の {中|なか} を {駆|か}け{戻|もど}って 、 {高瀬|たかせ} の {返答|へんとう} を {届|とど}けました 。 「 {必要|ひつよう}なら {開|あ}ける 」 ── それ きり でした 。', en: 'Tōya, our messenger, came running back through the rain with Takase\'s answer: "If needed, open." — and nothing more.', short: 'それ きり の {返答|へんとう}' },
      },
      {
        F: { jp: 'わたし と トウヤ は 、 けんか を しました 。 わたし が なにを いったか は …… おぼえて いません 。', en: 'Tōya and I quarrelled. What I said… I don\'t remember.', short: 'ろうか の けんか' },
        E: { jp: 'わたし は {約束|やくそく} だ と {読|よ}み 、 あの {子|こ} は {警告|けいこく} だ と {言|い}いました 。 {廊下|ろうか} で けんか を しました 。 {何|なに} を {言|い}った か は …… {覚|おぼ}えて いません 。', en: 'I read it as a promise; he said it was a warning. We quarrelled in the corridor. What I said… I don\'t remember.', short: '{廊下|ろうか} の けんか' },
        I: { jp: 'わたし は {約束|やくそく} と {読|よ}み 、 あの {子|こ} は {警告|けいこく} と {読|よ}みました 。 {議会|ぎかい} の {廊下|ろうか} で 、 {大|おお}げんか に なりました 。 {自分|じぶん} が {何|なに} を {言|い}った か は …… {覚|おぼ}えて いない の です 。', en: 'I read it as a promise; he read it as a warning. We had a dreadful quarrel in the council corridor. What I said to him… that, I don\'t remember.', short: '{議会|ぎかい} の {廊下|ろうか}' },
        A: { jp: 'わたし は {文面|ぶんめん} どおり {約束|やくそく} と {読|よ}み 、 あの {子|こ} は {向|む}こう の {声色|こわいろ} から {警告|けいこく} と {読|よ}んだ 。 {廊下|ろうか} で {言|い}い{争|あらそ}いました 。 {何|なに} を {言|い}った の か は …… {不思議|ふしぎ} な こと に 、 {覚|おぼ}えて いない の です 。', en: 'I read it to the letter, as a promise; he read it from their tone of voice, as a warning. We argued in the corridor. What I said… strangely, I don\'t remember.', short: '{文面|ぶんめん} と {声色|こわいろ}' },
      },
      {
        F: { jp: 'その よる 、 かね が なりました 。', en: 'That night, the bell rang.', short: 'かね が なった' },
        E: { jp: 'その {夜|よる} 、 {鍵|かぎ} の かかった {塔|とう} で 、 {鐘|かね} が {鳴|な}りました 。', en: 'That night, the bell rang in the locked tower.', short: '{鐘|かね} が {鳴|な}った' },
        I: { jp: 'その {夜|よる} 、 {鍵|かぎ} の かかって いた はず の {鐘楼|しょうろう} で 、 {鐘|かね} が {鳴|な}りました 。', en: 'That night, the bell rang in the bell tower that was supposed to be locked.', short: '{鍵|かぎ} の {鐘楼|しょうろう} で {鐘|かね}' },
        A: { jp: 'その {夜|よる} 、 {施錠|せじょう} された はず の {鐘楼|しょうろう} から 、 {鐘|かね} の {音|ね} が {響|ひび}きました 。', en: 'That night, the sound of the bell rang out from a tower that was supposed to have been locked.', short: '{施錠|せじょう} された {鐘楼|しょうろう}' },
      },
      {
        F: { jp: 'あさ に なって も 、 トウヤ は もどりません でした 。', en: 'Even when morning came, Tōya did not come back.', short: 'トウヤ は もどらない' },
        E: { jp: '{朝|あさ} に なって も 、 トウヤ は {戻|もど}りません でした 。', en: 'When morning came, Tōya had not come back.', short: '{戻|もど}らない トウヤ' },
        I: { jp: '{水|みず} が {引|ひ}いて {朝|あさ} に なって も 、 トウヤ は {戻|もど}って きません でした 。', en: 'The water went down and morning came, and Tōya did not come back.', short: '{水|みず} が {引|ひ}いた {朝|あさ}' },
        A: { jp: '{水|みず} が {引|ひ}き 、 {夜|よ} が {明|あ}けて も 、 トウヤ が {戻|もど}る こと は ありません でした 。', en: 'The water receded, the night gave way to morning, and Tōya never came back.', short: '{夜|よ} が {明|あ}けて も' },
      },
    ],
    question: {
      F: choose('c:sa_history', 'What does Kasane not remember?', null, [
        { en: 'What they said to Tōya in the quarrel', ok: true },
        { en: 'That the bell rang', ok: false, why: { en: 'Kasane remembers the bell.' } },
        { en: 'Takase\'s reply', ok: false, why: { en: 'Kasane knows those four words by heart.' } },
      ], { en: 'なにを いったか は おぼえて いません — "what I said, I don\'t remember".' }),
      E: choose('c:sa_history', 'What does Kasane not remember?', null, [
        { jp: '{自分|じぶん} が {廊下|ろうか} で {何|なに} を {言|い}った か', en: 'what they said in the corridor', ok: true },
        { jp: '{鐘|かね} が {鳴|な}った こと', en: 'that the bell rang', ok: false, why: { en: 'The bell is in the story.' } },
        { jp: '{高瀬|たかせ} の {返事|へんじ}', en: 'Takase\'s reply', ok: false, why: { en: 'They quote it exactly.' } },
      ], { en: '何を言ったか (what I said) is an embedded question.' }),
      I: choose('c:sa_history', 'Why might Kasane not remember their own words?', null, [
        { en: 'Because they set them down in the Archive — the first memory ever shelved there.', ok: true },
        { en: 'Because it was too long ago.', ok: false, why: { en: 'They remember everything else about that night in detail.' } },
        { en: 'Because Tōya never heard them.', ok: false, why: { en: 'He heard them. He answered them.' } },
      ], { en: 'The first shelf in the Room of Set-Down Memories is Kasane\'s own.' }),
      A: choose('c:sa_history', 'Kasane says 何を言ったのかは…覚えていないのです. What does the は after the question suggest?', null, [
        { en: 'Contrast: everything else is remembered; their own words alone are singled out as missing.', ok: true },
        { en: 'That they said nothing at all.', ok: false, why: { en: 'They say plainly that there was a quarrel.' } },
        { en: 'Nothing; は is only a topic marker.', ok: false, why: { en: 'Here the topic is also a contrast: "as for what I said — that, I don\'t."' } },
      ], { en: 'Contrastive は marks the one gap in an account that is otherwise whole. That gap is the first shelf.' }),
    },
  };

  // ---- drills (region: the Still Archive) ------------------------------------------------------------------------
  const kanaDrill = (id, word, en, before, ans, after, item) => ({ id, lv: 'F', tags: ['still'], kind: 'write', item: item || ('k:' + ans), prompt: { en: 'Complete the word "' + en + '": write the missing ' + (RB.kana.isKata(ans) ? 'katakana' : 'hiragana') + '.' }, template: { before, after }, answer: ans, accept: [ans], mode: 'kana', single: true, explain: { en: word + ' — ' + en + '.' } });
  const read = (id, lv, w, r, en, extra) => Object.assign({ id, lv, tags: ['still'], kind: 'write', item: 'v:' + w, prompt: { en: 'Write the word for "' + en + '" (in hiragana, or in kanji).' }, answer: r, accept: [r, w], mode: 'reading', explain: { jp: '{' + w + '|' + r + '}', en: en + '.' } }, extra || {});
  const mc = (id, lv, item, prompt, ctx, options, explain) => ({ id, lv, tags: ['still'], kind: 'choose', item, prompt: { en: prompt }, ctx, options, explain });
  C.addDrills([
    // Foundations: kana inside the chapter's everyday words
    kanaDrill('sa.df1', 'なまえ', 'name', 'な', 'ま', 'え'),
    kanaDrill('sa.df2', 'かね', 'bell', 'か', 'ね', ''),
    kanaDrill('sa.df3', 'こえ', 'voice', '', 'こ', 'え'),
    kanaDrill('sa.df4', 'てがみ', 'letter', 'て', 'が', 'み'),
    kanaDrill('sa.df5', 'しずか', 'quiet', 'し', 'ず', 'か'),
    kanaDrill('sa.df6', 'かぎ', 'key', 'か', 'ぎ', ''),
    kanaDrill('sa.df7', 'たな', 'shelf', '', 'た', 'な'),
    kanaDrill('sa.df8', 'やくそく', 'promise', 'やく', 'そ', 'く'),
    kanaDrill('sa.df9', 'へんじ', 'reply', 'へん', 'じ', ''),
    kanaDrill('sa.df10', 'かさ', 'lampshade; umbrella', 'か', 'さ', ''),
    // Elementary
    read('sa.de1', 'E', '手紙', 'てがみ', 'letter'),
    read('sa.de2', 'E', '返事', 'へんじ', 'reply'),
    read('sa.de3', 'E', '約束', 'やくそく', 'promise'),
    read('sa.de4', 'E', '弟', 'おとうと', 'younger brother'),
    read('sa.de5', 'E', '鍵', 'かぎ', 'key'),
    read('sa.de6', 'E', '鐘', 'かね', 'bell (large)'),
    mc('sa.de7', 'E', 'v:返す', 'Which verb means "to give (something) back"?', null, [
      { jp: '{返|かえ}す', ok: true }, { jp: '{帰|かえ}る', ok: false, why: { en: '帰る is "to go home" — same sound, different verb.' } }, { jp: '{変|か}える', ok: false, why: { en: '変える is "to change".' } },
    ], { en: '返す (give back) and 帰る (go home) are both かえ… but mean different things.' }),
    mc('sa.de8', 'E', 'v:開ける', 'Which one do you do TO a door (transitive)?', { jp: 'ドア を ＿＿ 。', en: '(I) ___ the door.' }, [
      { jp: '{開|あ}ける', ok: true }, { jp: '{開|あ}く', ok: false, why: { en: '開く (あく) is what the door does by itself: ドアが開く.' } },
    ], { en: 'ドアを開ける (I open the door) / ドアが開く (the door opens).' }),
    mc('sa.de9', 'E', 'g:te_giving', 'Which means "please get someone to open it"?', null, [
      { jp: '{誰|だれ}か に {開|あ}けて もらって 。', ok: true }, { jp: '{誰|だれ}か に {開|あ}けて あげて 。', ok: false, why: { en: '〜てあげる is doing it for someone else.' } }, { jp: '{誰|だれ}か が {開|あ}けた 。', ok: false, why: { en: '"Someone opened it" — a report, not a request.' } },
    ], { en: '〜てもらう: have someone do something (for you).' }),
    mc('sa.de10', 'E', 'g:cond_nara', 'What does 「{必要|ひつよう}なら 、 {開|あ}ける 。」 say?', null, [
      { en: 'If it\'s needed, (I\'ll) open it.', ok: true }, { en: 'It is necessary to open it.', ok: false, why: { en: 'That would be 開ける必要がある.' } }, { en: 'Don\'t open it unless it\'s needed.', ok: false, why: { en: 'That adds a prohibition the sentence doesn\'t have.' } },
    ], { en: 'なら: "if (that is the case)".' }),
    { id: 'sa.de11', lv: 'E', tags: ['still'], kind: 'order', item: 'g:v_te_kudasai', prompt: { en: 'Build: "Please give the letter back."' }, tiles: ['{手紙|てがみ}', 'を', '{返|かえ}して', 'ください'], answer: ['{手紙|てがみ}', 'を', '{返|かえ}して', 'ください'], orderHint: { en: 'Object を, then the て form + ください.' } },
    mc('sa.de12', 'E', 'v:忘れる', 'Which sentence means "Don\'t forget the name"?', null, [
      { jp: '{名前|なまえ} を {忘|わす}れないで 。', ok: true }, { jp: '{名前|なまえ} を {覚|おぼ}えないで 。', ok: false, why: { en: '覚えないで = "don\'t memorise it".' } }, { jp: '{名前|なまえ} を {書|か}かないで 。', ok: false, why: { en: '書かないで = "don\'t write it".' } },
    ], { en: '忘れないで — "don\'t forget".' }),
    // Intermediate
    read('sa.di1', 'I', '記憶', 'きおく', 'memory (what one remembers)'),
    read('sa.di2', 'I', '扉', 'とびら', 'door (hinged)'),
    mc('sa.di3', 'I', 'v:預かる', 'What does 「{記憶|きおく} を {預|あず}かる」 mean?', null, [
      { en: 'to keep a memory safe for someone', ok: true }, { en: 'to give a memory to someone', ok: false, why: { en: 'That would be 預ける — the other side of the exchange.' } }, { en: 'to throw a memory away', ok: false, why: { en: 'That would be 捨てる.' } },
    ], { en: '預ける (leave in someone\'s care) ↔ 預かる (take into your care).' }),
    mc('sa.di4', 'I', 'v:写す', 'Which word means "a copy"?', null, [
      { jp: '{写|うつ}し', ok: true }, { jp: '{移|うつ}し', ok: false, why: { en: '移す is "to move (something)".' } }, { jp: '{映|うつ}し', ok: false, why: { en: '映す is "to reflect, project".' } },
    ], { en: '写す / 写し: copy. Several うつす verbs share a sound.' }),
    mc('sa.di5', 'I', 'g:rashii', 'A notice says 「{水門|すいもん} の {件|けん} と {思|おも}われる 。」 How sure is the writer?', null, [
      { en: 'It is a guess, stated impersonally.', ok: true }, { en: 'It is a confirmed fact.', ok: false, why: { en: 'と思われる never confirms; it presumes.' } }, { en: 'It is a direct quote.', ok: false, why: { en: 'Quotes go in 「」 or 『』.' } },
    ], { en: '〜と思われる: "it is thought that …" — official-sounding guesswork.' }),
    mc('sa.di6', 'I', 'g:you_ni_suru', 'Choose the sentence that means "I make a point of not forgetting to return things."', null, [
      { jp: '{返|かえ}す の を {忘|わす}れない よう に して いる 。', ok: true }, { jp: '{返|かえ}す の を {忘|わす}れる よう に なった 。', ok: false, why: { en: '"I\'ve started forgetting to return things."' } }, { jp: '{返|かえ}さない こと に した 。', ok: false, why: { en: '"I decided not to return it."' } },
    ], { en: '〜ようにしている: a habit one keeps up.' }),
    mc('sa.di7', 'I', 'g:noni', 'Choose the best ending: 「{誰|だれ}も {泣|な}かなく なった ＿＿ 、 {誰|だれ}も {笑|わら}わなく なった 。」', null, [
      { jp: 'けれど', ok: true }, { jp: 'から', ok: false, why: { en: '"Because no one cried, no one laughed" — the Hush would say so, but the sentence contrasts, it doesn\'t explain.' } }, { jp: 'ため に', ok: false, why: { en: '"In order to" doesn\'t fit.' } },
    ], { en: '"No one cried any more, but no one laughed any more either."' }),
    { id: 'sa.di8', lv: 'I', tags: ['still'], kind: 'order', item: 'g:relative_clause', prompt: { en: 'Build: "the letter (my) brother wrote" — a clause before the noun.' }, tiles: ['{弟|おとうと}', 'が', '{書|か}いた', '{手紙|てがみ}'], answer: ['{弟|おとうと}', 'が', '{書|か}いた', '{手紙|てがみ}'], alts: [['{弟|おとうと}', 'の', '{書|か}いた', '{手紙|てがみ}']], orderHint: { en: 'The describing clause comes before the noun it describes.' } },
    mc('sa.di9', 'I', 'g:hazu', 'What does 「{鍵|かぎ} の かかって いた はず の {塔|とう}」 imply?', null, [
      { en: 'The tower should have been locked — so how did the bell ring?', ok: true }, { en: 'The tower was definitely locked.', ok: false, why: { en: 'はず is an expectation, not a certainty.' } }, { en: 'The tower had no lock.', ok: false, why: { en: 'It did; the question is who opened it.' } },
    ], { en: 'はず: what should be the case, given what one knows.' }),
    mc('sa.di10', 'I', 'g:te_shimau', 'Kasane: 「{決|き}めて しまった の です 。 {皆|みな} の {代|か}わり に 。」 What does 〜てしまった add?', null, [
      { en: 'Regret: it was done, and cannot be undone.', ok: true }, { en: 'Pride in a finished job.', ok: false, why: { en: 'In context, the tone is regret.' } }, { en: 'That it is still being decided.', ok: false, why: { en: 'しまった marks completion.' } },
    ], { en: '〜てしまう: completely done — often with regret.' }),
    // Advanced
    mc('sa.da1', 'A', 'v:曖昧', 'Which word is closest to 曖昧 in the sense Kasane feared?', null, [
      { jp: 'どちら と も {取|と}れる', ok: true }, { jp: '{言|い}わず も がな', ok: false, why: { en: '"Better left unsaid" — a different idea.' } }, { jp: '{言語道断|ごんごどうだん}', ok: false, why: { en: '"Outrageous, beyond words."' } },
    ], { en: 'どちらとも取れる: can be taken either way.' }),
    mc('sa.da2', 'A', 'v:言質', '「{言質|げんち} を {取|と}られない よう に 、 {曖昧|あいまい}な {返事|へんじ} を した 。」 What is a 言質?', null, [
      { en: 'A verbal commitment someone can hold you to.', ok: true }, { en: 'A written apology.', ok: false, why: { en: 'An apology is 謝罪.' } }, { en: 'A rumour.', ok: false, why: { en: 'A rumour is 噂.' } },
    ], { en: '言質を取る / 取られる: to get / be pinned to a verbal promise. Vagueness can be a deliberate defence.' }),
    mc('sa.da3', 'A', 'g:adv_wake_ni_wa_ikanai', '「{預|あず}かった もの を {返|かえ}さない わけ に は いかない 。」 What is the speaker saying?', null, [
      { en: 'I have to return what I was entrusted with.', ok: true }, { en: 'I can\'t return it.', ok: false, why: { en: 'That would be 返すわけにはいかない.' } }, { en: 'It isn\'t that I won\'t return it.', ok: false, why: { en: 'That would be 返さないわけではない.' } },
    ], { en: 'ない form + わけにはいかない: cannot very well not — so, must.' }),
    mc('sa.da4', 'A', 'g:adv_zaru_wo_enai', '「{書庫|しょこ} を {閉|と}じ ざる を {得|え}ない 。」 How does the speaker feel?', null, [
      { en: 'Reluctant but left with no choice.', ok: true }, { en: 'Eager to close it.', ok: false, why: { en: 'ざるを得ない implies reluctance.' } }, { en: 'Undecided.', ok: false, why: { en: 'The decision is made.' } },
    ], { en: 'ざるを得ない: cannot help but, have no option but to.' }),
    mc('sa.da5', 'A', 'g:adv_nimokakawarazu', 'Choose the natural completion: 「{何度|なんど} も {頼|たの}まれた ＿＿ 、 {記憶|きおく} は {返|かえ}されなかった 。」', null, [
      { jp: 'に も かかわらず', ok: true }, { jp: 'から こそ', ok: false, why: { en: '"Precisely because it was asked many times" contradicts the result.' } }, { jp: 'と いう より', ok: false, why: { en: '"Rather than" doesn\'t fit.' } },
    ], { en: '〜にもかかわらず: despite. The result runs against expectation.' }),
    mc('sa.da6', 'A', 'g:adv_kara_koso', 'Ushio to Kasane: 「お{前|まえ} を {大事|だいじ} に {思|おも}う から こそ 、 {反対|はんたい} する 。」 What does から こそ stress?', null, [
      { en: 'The objection comes precisely because of the care.', ok: true }, { en: 'The objection happens despite the care.', ok: false, why: { en: 'That would be のに or にもかかわらず.' } }, { en: 'The care is less important than the objection.', ok: false, why: { en: 'The two are joined, not ranked.' } },
    ], { en: '〜からこそ defends something that might look like a reason for the opposite.' }),
    mc('sa.da7', 'A', 'g:adv_to_iu_yori', '「あれ は {悪意|あくい} と いう より 、 {疲|つか}れ だった 。」 What is the speaker doing?', null, [
      { en: 'Correcting a description: it was less malice than exhaustion.', ok: true }, { en: 'Saying it was both malice and exhaustion.', ok: false, why: { en: 'というより replaces the first word with a better one.' } }, { en: 'Denying there was any exhaustion.', ok: false, why: { en: 'The opposite.' } },
    ], { en: 'A というより B: "B rather than A".' }),
    mc('sa.da8', 'A', 'g:adv_kanenai', '「このまま では 、 {町|まち} の {名前|なまえ} まで {消|き}え かねない 。」 What is expressed?', null, [
      { en: 'A real risk of something bad happening.', ok: true }, { en: 'Something impossible.', ok: false, why: { en: 'かねない means it could well happen.' } }, { en: 'A hope.', ok: false, why: { en: 'かねない is only used of undesirable outcomes.' } },
    ], { en: 'stem + かねない: "could well (happen)".' }),
    mc('sa.da9', 'A', 'g:indirectness', 'An official answers your petition: 「{善処|ぜんしょ} いたします 。」 What have you been promised?', null, [
      { en: 'Very little: "we\'ll do what we can" often commits to nothing.', ok: true }, { en: 'A guarantee of action.', ok: false, why: { en: 'It sounds cooperative, but it names no action.' } }, { en: 'A refusal.', ok: false, why: { en: 'It doesn\'t refuse, either — that is the point.' } },
    ], { en: '善処します is a classic noncommittal answer. Whether it means anything depends on who says it.' }),
    mc('sa.da10', 'A', 'c:sa_classical', 'In the charter, 「{求|もと}め {有|あ}らば … {返|かえ}す べし」, what is べし?', null, [
      { en: 'A classical ending of obligation: "shall, must".', ok: true }, { en: 'A question marker.', ok: false, why: { en: 'Old documents use か for questions.' } }, { en: 'A past tense.', ok: false, why: { en: 'That would be けり or き in classical style.' } },
    ], { en: 'べし survives in modern Japanese in set phrases (〜べきだ): what should be done.' }),
    read('sa.da11', 'A', '鐘楼', 'しょうろう', 'bell tower'),
    read('sa.da12', 'A', '書庫', 'しょこ', 'archive, stacks'),
  ]);
})(RB.content);
