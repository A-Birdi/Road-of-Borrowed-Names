/* Chapter 2 learning content: story challenges (all four tiers), the Gull's
 * lunch rush (orders), the post bag (letters), the cove signpost, Tetsu's
 * oral history, and Saltglass drills. Fiction stays fiction: the language
 * facts (gojūon order, 〜なくていい, passives, keigo) are ordinary Japanese. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const CH = (id, d) => (C.challenges[id] = d);
  const no = (en) => ({ en });

  // ---- warehouse: which label did a person change? --------------------------------
  CH('sg.c_crates', {
    title: { jp: '{二|ふた}つ の ラベル', en: 'Two labels' },
    tiers: {
      F: [
        { kind: 'write', item: 'v:灯台', ctx: { jp: 'ふるい ラベル ： 「？？？？ ゆき 」', en: 'The old label underneath: "To the ????"' },
          prompt: { en: 'The oil was meant for the lighthouse — とうだい (tōdai). Complete the old label.' },
          template: { before: '', after: ' ゆき' }, answer: 'とうだい', accept: ['とうだい', '{灯台|とうだい}'], mode: 'reading',
          explain: { jp: '{灯台|とうだい} ・ 〜{行|ゆ}き', en: 'とうだい — lighthouse. ゆき on a label means "bound for".' } },
        { kind: 'choose', item: 'c:sg_labels', prompt: { en: 'Which label did a PERSON change?' },
          options: [
            { jp: 'あたらしい ラベル 。 のり が やわらかい 。', en: 'The new label. The paste is still soft.', ok: true },
            { jp: 'しろく きえる ラベル 。 だれ も さわって いない 。', en: 'The label that fades by itself. No one has touched it.', ok: false, why: no('Nobody touched that one — it changes on its own. That is the Hush.') },
          ], explain: { en: 'Fresh paste means a hand did it recently. The fading label is the Hush.' } },
      ],
      E: [
        { kind: 'choose', item: 'c:sg_labels', ctx: { jp: 'あたらしい ラベル ： 「{嵐|あらし} で {破損|はそん} ・ {廃棄|はいき}」 ／ {下|した} の ラベル ： 「{灯台|とうだい} {行|ゆ}き ・ {灯油|とうゆ} {四缶|よんかん}」', en: 'New label: "Damaged in storm — for disposal". Label underneath: "To the lighthouse — lamp oil, 4 cans".' },
          prompt: { en: 'Where was this crate really going?' },
          options: [
            { jp: '{灯台|とうだい}', en: 'to the lighthouse', ok: true },
            { jp: 'ガラス {工房|こうぼう}', en: 'to the glassworks', ok: false, why: no('Read the older label: とうだい ゆき — bound for the lighthouse.') },
            { jp: '{捨|す}てる {所|ところ}', en: 'to be thrown away', ok: false, why: no('That is what the NEW label claims. The oil is fine.') },
          ], explain: { jp: '〜{行|ゆ}き ＝ bound for …', en: 'ゆき (or いき) after a place on a label or ticket means "bound for".' } },
        { kind: 'order', item: 'g:prt_he', prompt: { en: 'Put the sentence in order: "This crate goes to the lighthouse."' },
          tiles: ['この', '{箱|はこ}', 'は', '{灯台|とうだい}', 'へ', '{行|い}きます'], answer: ['この', '{箱|はこ}', 'は', '{灯台|とうだい}', 'へ', '{行|い}きます'],
          orderHint: { en: 'Topic first (この はこ は), then the destination with へ, and the verb last.' } },
      ],
      I: [
        { kind: 'choose', item: 'c:sg_labels', ctx: { jp: '{帳簿|ちょうぼ} ： 「{三日|みっか} 、 {灯油|とうゆ} {八缶|はちかん} {入荷|にゅうか} 。 {灯台|とうだい} へ {四缶|よんかん} {出荷|しゅっか} 。 {残|のこ}り {四缶|よんかん} は {嵐|あらし} に より {破損|はそん} 。」', en: 'Ledger: "3rd: 8 cans lamp oil received. 4 cans dispatched to lighthouse. Remaining 4 cans damaged by storm."' },
          prompt: { en: 'You have just shaken the "damaged" crate and heard full cans of oil. What does that tell you?' },
          options: [
            { jp: '{帳簿|ちょうぼ} の 「{嵐|あらし} に より {破損|はそん}」 が {嘘|うそ} だ 。', en: 'The ledger\'s "damaged by storm" is untrue.', ok: true },
            { jp: '{灯台|とうだい} に は {八缶|はちかん} {届|とど}いた 。', en: 'Eight cans reached the lighthouse.', ok: false, why: no('The ledger says four were dispatched to the lighthouse.') },
            { jp: '{嵐|あらし} は {三日|みっか} に {来|き}た 。', en: 'The storm came on the 3rd.', ok: false, why: no('The 3rd is when the oil arrived. The ledger doesn\'t date the storm.') },
          ], explain: { jp: '〜に より ＝ due to (formal)', en: 'により marks a cause in written style. Here the stated cause hides a sale.' } },
        { kind: 'choose', item: 'c:sg_labels', prompt: { en: 'Which detail shows the NEW label was put on after the storm, not during it?' },
          options: [
            { jp: '{糊|のり} が まだ {柔|やわ}らかい 。', en: 'The paste is still soft.', ok: true },
            { jp: '{字|じ} が {丁寧|ていねい} だ 。', en: 'The writing is careful.', ok: false, why: no('Careful writing proves nothing about when.') },
            { jp: 'ラベル が {白|しろ}く ない 。', en: 'The label isn\'t blank.', ok: false, why: no('That only shows the Hush hasn\'t touched it yet.') },
          ], explain: { en: 'The storm was two weeks ago; paste stays soft for a day or two.' } },
      ],
      A: [
        { kind: 'choose', item: 'c:sg_labels', ctx: { jp: '{新|あたら}しい ラベル の {但|ただ}し{書|が}き ： 「{本品|ほんぴん} は {荒天|こうてん} に よる {浸水|しんすい} の {恐|おそ}れ が ある ため 、 {廃棄|はいき} {扱|あつか}い と する 。」', en: 'Note on the new label: "As this item may have been flooded owing to rough weather, it is to be treated as written off."' },
          prompt: { en: 'What does the note actually claim — and what does it avoid claiming?' },
          options: [
            { jp: '{浸水|しんすい} した とは {言|い}って いない 。 「{恐|おそ}れ が ある 」 だけ で 、 {廃棄|はいき} {扱|あつか}い に して いる 。', en: 'It never says the goods WERE flooded — only that they might have been — and writes them off on that basis.', ok: true },
            { jp: '{油|あぶら} が {浸水|しんすい} で {駄目|だめ} に なった こと を {証明|しょうめい} して いる 。', en: 'It certifies that the oil was ruined by flooding.', ok: false, why: no('おそれ が ある means "there is a risk of", not "it happened".') },
            { jp: '{廃棄|はいき} した {後|あと} の {報告|ほうこく} で ある 。', en: 'It is a report written after disposal.', ok: false, why: no('あつかい と する — "shall be treated as" — is a decision about how to record it, not a report that it was destroyed.') },
          ], explain: { jp: '〜の {恐|おそ}れ が ある ／ 〜{扱|あつか}い と する', en: 'Hedged written language lets the writer avoid a checkable claim. The crate is full.' } },
        { kind: 'choose', item: 'c:sg_labels', prompt: { en: 'Which observation would convince a sceptical harbourmaster that the label is deliberate, not the Hush?' },
          options: [
            { jp: '{古|ふる}い ラベル の {上|うえ} に {新|あたら}しい {紙|かみ} が {貼|は}られ 、 {糊|のり} が {新|あたら}しく 、 {中身|なかみ} は {無事|ぶじ} だ 。', en: 'A new sheet is pasted over the old one, the paste is fresh, and the contents are intact.', ok: true },
            { jp: '{字|じ} が {時々|ときどき} {揺|ゆ}れて {見|み}える 。', en: 'The writing seems to waver now and then.', ok: false, why: no('Wavering writing points to the Hush, not a person.') },
            { jp: '{誰|だれ} も {見|み}て いない {間|あいだ} に {変|か}わった に {違|ちが}いない 。', en: 'It must have changed while no one was looking.', ok: false, why: no('That is an assumption, not an observation.') },
          ], explain: { en: 'Three independent physical facts beat any single impression.' } },
      ],
    },
  });

  // ---- report: sort the contradictions ----------------------------------------------------
  CH('sg.c_sort', {
    title: { jp: '{食|く}い{違|ちが}い を {分|わ}ける', en: 'Sorting the contradictions' },
    tiers: {
      F: [{ kind: 'choose', item: 'c:sg_sort', prompt: { en: 'Ōmi asks: which one did a PERSON do?' },
        options: [
          { jp: 'ふね の じこくひょう が かわる 。', en: 'The ferry board keeps changing.', ok: false, why: no('Tetsu says the board changes by itself — the Hush.') },
          { jp: 'てがみ の なまえ が きえる 。', en: 'Names vanish from letters.', ok: false, why: no('The addresses faded by themselves — the Hush.') },
          { jp: 'だれ か が あたらしい ラベル を はった 。', en: 'Someone stuck on a new label.', ok: true },
        ], explain: { en: 'Two are the Hush. One was done by hand.' } }],
      E: [{ kind: 'choose', item: 'c:sg_sort', prompt: { en: 'Which of these did a person do by hand?' },
        ctx: { jp: '「{人|ひと} が {手|て} で やった の は 、 どれ だ ？」', en: '"Which one did someone do by hand?"' },
        options: [
          { jp: '{時刻表|じこくひょう} の {時間|じかん} が {変|か}わる 。', en: 'The times on the ferry board change.', ok: false, why: no('No one touches the board; the times shift by themselves.') },
          { jp: '{手紙|てがみ} の {宛名|あてな} が {消|き}える 。', en: 'Addresses vanish from letters.', ok: false, why: no('The contents were still readable — only the addresses faded. The Hush.') },
          { jp: '{灯台|とうだい} の {油|あぶら} に 「{破損|はそん}」 の ラベル を {貼|は}る 。', en: 'A "damaged" label is stuck on the lighthouse oil.', ok: true },
        ], explain: { jp: '{手|て} で ＝ by hand', en: 'Only the oil label shows a hand at work.' } }],
      I: [{ kind: 'choose', item: 'c:sg_sort', prompt: { en: 'Ōmi: "How can you tell the oil label isn\'t the Hush?" Choose your reason.' },
        options: [
          { jp: '{糊|のり} が {新|あたら}しくて 、 {字|じ} が {動|うご}かない から です 。', en: 'Because the paste is new and the writing doesn\'t move.', ok: true },
          { jp: '{字|じ} が {綺麗|きれい} だ から です 。', en: 'Because the handwriting is neat.', ok: false, why: no('Neat writing alone proves nothing.') },
          { jp: '{嵐|あらし} の {夜|よる} に {剥|は}がれた から です 。', en: 'Because it came off on the night of the storm.', ok: false, why: no('That is Wataru\'s story, not evidence.') },
        ], explain: { jp: '〜から です ＝ it\'s because …', en: 'A reason given with から: the physical evidence.' } }],
      A: [{ kind: 'choose', item: 'c:sg_sort', prompt: { en: 'Ōmi wants a fair report — accurate, but not an accusation you can\'t yet prove. Which do you give?' },
        options: [
          { jp: '{手|て} で {貼|は}り{替|か}えられた ラベル が ある 。 {誰|だれ} が やった か は 、 まだ {断定|だんてい} できない 。', en: 'Some labels were changed by hand. Who did it, we can\'t yet say for certain.', ok: true },
          { jp: 'ワタル が {犯人|はんにん} に {違|ちが}いない 。', en: 'It must be Wataru.', ok: false, why: no('に ちがいない asserts certainty. You have a pattern, not proof — Ōmi said as much.') },
          { jp: '{結局|けっきょく} は {全部|ぜんぶ} {静寂|しじま} の せい だろう 。', en: 'In the end it\'s probably all the Hush.', ok: false, why: no('The fresh paste says otherwise.') },
        ], explain: { jp: '{断定|だんてい} できない ＝ can\'t state definitively', en: 'Separating what you observed from whom you suspect.' } }],
    },
  });

  // ---- confrontation: see through the claim -------------------------------------------------
  CH('sg.c_lie', {
    title: { jp: '{嘘|うそ} を {見抜|みぬ}く', en: 'Seeing through it' },
    intro: { jp: 'ワタル の {言葉|ことば} と 、 {見|み}た もの を {比|くら}べよう 。', en: 'Compare what Wataru says with what you have seen.' },
    tiers: {
      F: [{ kind: 'choose', item: 'c:sg_lie', prompt: { en: 'Wataru says it all happened on the night of the storm. What do you know?' },
        options: [
          { jp: 'のり が あたらしい 。 あらし の よる じゃ ない 。', en: 'The paste is fresh. It wasn\'t the night of the storm.', ok: true },
          { jp: 'ラベル は しろい 。', en: 'The labels are white.', ok: false, why: no('Some are — but that doesn\'t answer what he said.') },
          { jp: 'あらし は こわい 。', en: 'Storms are scary.', ok: false, why: no('True, but not evidence.') },
        ], explain: { en: 'Fresh paste two weeks after the storm.' } }],
      E: [{ kind: 'choose', item: 'c:sg_lie', ctx: { jp: 'ワタル ： 「{嵐|あらし} の {夜|よる} に 、 ラベル が {全部|ぜんぶ} {剥|は}がれました 。」', en: 'Wataru: "On the night of the storm, all the labels came off."' },
        prompt: { en: 'Which evidence contradicts this?' },
        options: [
          { jp: '{帳簿|ちょうぼ} は 、 {嵐|あらし} の {三日後|みっかご} に {直|なお}されて いる 。', en: 'The ledger was corrected three days after the storm.', ok: true },
          { jp: '{嵐|あらし} の {夜|よる} は 、 {雨|あめ} が {降|ふ}って いた 。', en: 'It was raining on the night of the storm.', ok: false, why: no('True, and irrelevant.') },
          { jp: 'ワタル さん は {字|じ} が {上手|じょうず} だ 。', en: 'Wataru has good handwriting.', ok: false, why: no('That is not a contradiction.') },
        ], explain: { jp: '{三日後|みっかご} ＝ three days later', en: 'His story says the storm night; his own ledger says three days after.' } }],
      I: [{ kind: 'choose', item: 'g:passive', ctx: { jp: 'ワタル ： 「ラベル が {貼|は}り{替|か}えられて いた ん です 。 {誰|だれ} か に 。」', en: 'Wataru: "The labels had been switched. By someone."' },
        prompt: { en: 'What is telling about the way he says this?' },
        options: [
          { jp: '「{貼|は}り{替|か}えられた」 と {受身|うけみ} で {言|い}って 、 {誰|だれ} が やった か を {言|い}わない 。 {帳簿|ちょうぼ} を {直|なお}した の は {本人|ほんにん} の {字|じ} なのに 。', en: 'He uses the passive — "had been switched" — and never says who, though the ledger correction is in his own hand.', ok: true },
          { jp: '「{誰|だれ} か に 」 は {丁寧|ていねい} すぎる 。', en: '"By someone" is too polite.', ok: false, why: no('It isn\'t a politeness issue — it\'s vague on purpose.') },
          { jp: '{嵐|あらし} の {夜|よる} は 、 {誰|だれ} も {倉庫|そうこ} に いなかった 。', en: 'No one was in the warehouse on the night of the storm.', ok: false, why: no('You have no evidence of that.') },
        ], explain: { jp: '〜られる （{受身|うけみ}）', en: 'The passive is ordinary grammar, but it lets a speaker leave out the doer. Here the doer is the speaker.' } }],
      A: [{ kind: 'choose', item: 'c:sg_lie', ctx: { jp: 'ワタル ： 「{嵐|あらし} の {夜|よる} の こと です から 、 {僕|ぼく} の {知|し}らない {間|あいだ} に {貼|は}り{替|か}えられて いた と しか {考|かんが}えられません 。 {帳簿|ちょうぼ} も 、 {気付|きづ}いた {時|とき} に {直|なお}した だけ で …… 。」', en: 'Wataru: "It was the night of the storm, so I can only think they were switched without my knowing. And the ledger — I only corrected it when I noticed…"' },
        prompt: { en: 'Which part of his explanation undermines itself?' },
        options: [
          { jp: '「{知|し}らない {間|あいだ} に 」 と {言|い}いながら 、 {八|はち} を {四|よん} に {直|なお}した の は {自分|じぶん} だ と {認|みと}めて いる 。', en: 'He says it happened "without his knowing", yet admits he himself changed the eight to a four.', ok: true },
          { jp: '「{考|かんが}えられません 」 は {敬語|けいご} の {誤用|ごよう} だ 。', en: 'That phrasing misuses polite language.', ok: false, why: no('It is an ordinary potential negative. Nothing wrong with it.') },
          { jp: '{嵐|あらし} の {夜|よる} は 、 {倉庫|そうこ} に {鍵|かぎ} が かかって いた はず だ 。', en: 'The warehouse must have been locked that night.', ok: false, why: no('Perhaps, but you have no evidence for it.') },
        ], explain: { jp: '〜ながら ＝ while (saying) …, even though', en: 'He can\'t both not know about the change and have made the matching correction himself.' } }],
    },
  });

  // ---- Wataru's letter: asking for time, honestly and politely ----------------------------------
  CH('sg.c_extension', {
    title: { jp: '{待|ま}って ほしい と {書|か}く', en: 'Asking them to wait' },
    tiers: {
      F: [
        { kind: 'write', item: 'g:v_te_kudasai', prompt: { en: 'Wataru wants to write "Please wait." Complete it: まって (matte) ください.' },
          template: { before: '', after: ' ください 。' }, answer: 'まって', accept: ['まって', '{待|ま}って'], mode: 'reading',
          explain: { jp: '{待|ま}って ください', en: 'まってください — please wait. て-form + ください is a polite request.' } },
        { kind: 'choose', item: 'g:v_te_kudasai', prompt: { en: 'Which is polite enough for a letter to a lender?' },
          options: [
            { jp: 'まって ください 。', en: 'Please wait.', ok: true },
            { jp: 'まて 。', en: 'Wait! (an order)', ok: false, why: no('まて is a blunt command.') },
            { jp: 'まった 。', en: 'Waited.', ok: false, why: no('That is the past tense, not a request.') },
          ], explain: { en: 'て-form + ください makes a polite request.' } },
      ],
      E: [
        { kind: 'choose', item: 'g:v_te_kudasai', prompt: { en: 'Which line politely asks the lender to wait a little?' },
          options: [
            { jp: '{少|すこ}し {待|ま}って ください 。', en: 'Please wait a little.', ok: true },
            { jp: '{少|すこ}し {待|ま}って 。', en: 'Wait a bit. (casual)', ok: false, why: no('Without ください it\'s casual — fine for a friend, not for a creditor.') },
            { jp: '{少|すこ}し {待|ま}ちました 。', en: 'I waited a little.', ok: false, why: no('Past tense: a report, not a request.') },
          ], explain: { en: '〜てください — polite request.' } },
        { kind: 'order', item: 'g:prt_kara_made', prompt: { en: 'Put it in order: "Please wait until next month."' },
          tiles: ['{来月|らいげつ}', 'まで', '{待|ま}って', 'ください'], answer: ['{来月|らいげつ}', 'まで', '{待|ま}って', 'ください'],
          orderHint: { en: 'The time limit with まで comes first; the request comes last.' } },
      ],
      I: [
        { kind: 'choose', item: 'g:keigo_kenjo', prompt: { en: 'Which sentence belongs in a letter to a creditor?' },
          options: [
            { jp: '{大変|たいへん} {申|もう}し{訳|わけ}ございません が 、 {返済|へんさい} を {来月|らいげつ}{末|まつ} まで {待|ま}って いただけない でしょう か 。', en: 'I am very sorry, but could you possibly wait for repayment until the end of next month?', ok: true },
            { jp: '{来月|らいげつ} {払|はら}う から 、 {待|ま}って ね 。', en: 'I\'ll pay next month, so wait, OK?', ok: false, why: no('Far too casual for a lender.') },
            { jp: '{返済|へんさい} は {来月|らいげつ} です 。 {以上|いじょう} 。', en: 'Repayment is next month. That is all.', ok: false, why: no('Polite form, but it announces instead of asking. That will not go well.') },
          ], explain: { jp: '〜て いただけない でしょう か', en: 'A humble, softened request: "could I possibly have you…?"' } },
        { kind: 'order', item: 'g:keigo_kenjo', prompt: { en: 'Order the request: "Could you extend the repayment deadline?"' },
          tiles: ['{返済|へんさい}', 'の', '{期限|きげん}', 'を', '{延|の}ばして', 'いただけない', 'でしょう', 'か'], answer: ['{返済|へんさい}', 'の', '{期限|きげん}', 'を', '{延|の}ばして', 'いただけない', 'でしょう', 'か'],
          orderHint: { en: 'Object (へんさい の きげん を), then the verb in て-form, then いただけない でしょう か.' } },
      ],
      A: [
        { kind: 'choose', item: 'g:keigo_kenjo', prompt: { en: 'Which paragraph is both honest and properly polite — no excuses, no promises he can\'t keep?' },
          options: [
            { jp: '{給料|きゅうりょう} の {支払|しはら}い が {遅|おく}れて おり 、 {期日|きじつ} どおり の {返済|へんさい} が {難|むずか}しい {状況|じょうきょう} です 。 {誠|まこと} に {勝手|かって} ながら 、 {来月|らいげつ}{末|まつ} まで {猶予|ゆうよ} を いただけない でしょう か 。', en: 'My wages are being paid late, and repaying on the due date is difficult. I realise this is entirely my convenience, but might I ask for a grace period until the end of next month?', ok: true },
            { jp: '{必|かなら}ず {明日|あした} お{支払|しはら}い いたします ので 、 ご{安心|あんしん} ください 。', en: 'I will certainly pay tomorrow, so please rest assured.', ok: false, why: no('Beautifully polite — and another lie. He can\'t pay tomorrow.') },
            { jp: '{嵐|あらし} の {被害|ひがい} に より 、 {返済|へんさい} は {不可能|ふかのう} と なりました 。', en: 'Owing to storm damage, repayment has become impossible.', ok: false, why: no('Blames the storm again and gives up instead of asking.') },
          ], explain: { jp: '{誠|まこと} に {勝手|かって} ながら', en: '"I realise this is purely for my own convenience" — a set phrase that owns the request instead of excusing it.' } },
        { kind: 'choose', item: 'g:giving', ctx: { jp: '「{猶予|ゆうよ} を ＿＿＿ でしょう か 」', en: '' }, prompt: { en: 'Fill the gap — Wataru is asking to RECEIVE extra time. Which verbs fit? (More than one may be right.)' },
          options: [
            { jp: 'いただけない', en: 'itadakenai (could I receive…)', ok: true },
            { jp: 'くださらない', en: 'kudasaranai (would you give…)', ok: true },
            { jp: 'さしあげない', en: 'sashiagenai (won\'t I give…)', ok: false, why: no('さしあげる is giving FROM the speaker. Wrong direction.') },
            { jp: 'もらわない', en: 'morawanai (won\'t I get…)', ok: false, why: no('Plain もらう is too casual here, and the negative question doesn\'t make a request.') },
          ], explain: { en: 'いただけないでしょうか (humble, "could I receive") and くださらないでしょうか (honorific, "would you give") both work; いただけない is the more common in letters.' } },
      ],
    },
  });

  // ---- the tide table -------------------------------------------------------------------------
  CH('sg.c_tidetable', {
    title: { jp: '{潮|しお} の {表|ひょう}', en: 'The tide table' },
    tiers: {
      F: [
        { kind: 'write', item: 'v:三時', ctx: { jp: 'ひきしお ： ごご 3:00', en: 'Low tide: 3:00 p.m.' },
          prompt: { en: 'Shiori: "When is low tide?" Write the hour in kana: three o\'clock is さんじ (sanji).' },
          template: { before: 'ごご ', after: '' }, answer: 'さんじ', accept: ['さんじ', '3じ', '{三時|さんじ}'], mode: 'reading',
          explain: { jp: 'ごご {三時|さんじ}', en: 'ごご さんじ — 3 p.m. (ごご = afternoon, p.m.)' } },
        { kind: 'choose', item: 'g:mae_ato', prompt: { en: 'The causeway is dry from an hour BEFORE low tide. When can you start walking?' },
          options: [
            { jp: 'ごご 2:00', en: '2 p.m.', ok: true },
            { jp: 'ごご 4:00', en: '4 p.m.', ok: false, why: no('That is an hour AFTER low tide.') },
            { jp: 'ごぜん 2:00', en: '2 a.m.', ok: false, why: no('ごぜん is the morning (a.m.).') },
          ], explain: { en: 'One hour before 3 p.m. is 2 p.m.' } },
      ],
      E: [
        { kind: 'choose', item: 'v:干潮', ctx: { jp: '{満潮|まんちょう} {午前|ごぜん} {九時|くじ} ／ {干潮|かんちょう} {午後|ごご} {三時|さんじ}{十五分|じゅうごふん}', en: '' },
          prompt: { en: 'When is LOW tide (かんちょう)?' },
          options: [
            { jp: '{午後|ごご} {三時|さんじ} {十五分|じゅうごふん}', en: '3:15 p.m.', ok: true },
            { jp: '{午前|ごぜん} {九時|くじ}', en: '9 a.m.', ok: false, why: no('That is まんちょう — high tide.') },
            { jp: '{午後|ごご} {九時|くじ}', en: '9 p.m.', ok: false, why: no('Not on the table.') },
          ], explain: { jp: '{満潮|まんちょう} ↔ {干潮|かんちょう}', en: 'まんちょう = high tide, かんちょう = low tide.' } },
        { kind: 'choose', item: 'g:mae_ato', ctx: { jp: 'シオリ ： 「{干潮|かんちょう} の {一時間|いちじかん} {前|まえ} から 、 {道|みち} を {歩|ある}けます 。」', en: '' },
          prompt: { en: 'From what time can you walk the causeway?' },
          options: [
            { jp: '{午後|ごご} {二時|にじ} {十五分|じゅうごふん}', en: '2:15 p.m.', ok: true },
            { jp: '{午後|ごご} {四時|よじ} {十五分|じゅうごふん}', en: '4:15 p.m.', ok: false, why: no('まえ means before, not after.') },
            { jp: '{午前|ごぜん} {八時|はちじ}', en: '8 a.m.', ok: false, why: no('That is around high tide.') },
          ], explain: { jp: '〜の {前|まえ} ＝ before …', en: 'One hour before 3:15 p.m. is 2:15 p.m.' } },
      ],
      I: [
        { kind: 'choose', item: 'g:mae_ato', ctx: { jp: '「{本日|ほんじつ} の {干潮|かんちょう} は {午後|ごご}{三時|さんじ}{十五分|じゅうごふん} 。 {干潮|かんちょう} の {前後|ぜんご} {一時間|いちじかん} ほど は {岬|みさき} の {道|みち} を {渡|わた}れます が 、 {霧|きり} が {出|で}たら {引|ひ}き{返|かえ}して ください 。」', en: '' },
          prompt: { en: 'During which window can you cross?' },
          options: [
            { jp: '{二時|にじ}{十五分|じゅうごふん} から {四時|よじ}{十五分|じゅうごふん} ごろ まで', en: 'From about 2:15 to 4:15', ok: true },
            { jp: '{三時|さんじ}{十五分|じゅうごふん} から {四時|よじ}{十五分|じゅうごふん} まで', en: 'From 3:15 to 4:15', ok: false, why: no('ぜんご means before AND after.') },
            { jp: '{二時|にじ}{十五分|じゅうごふん} から {三時|さんじ}{十五分|じゅうごふん} まで', en: 'From 2:15 to 3:15', ok: false, why: no('ぜんご covers after low tide too.') },
          ], explain: { jp: '{前後|ぜんご} ＝ before and after', en: 'An hour either side of 3:15.' } },
        { kind: 'choose', item: 'g:cond_tara', prompt: { en: 'What should you do if fog comes in?' },
          options: [
            { jp: '{引|ひ}き{返|かえ}す 。', en: 'Turn back.', ok: true },
            { jp: '{霧|きり} の {中|なか} で {待|ま}つ 。', en: 'Wait in the fog.', ok: false, why: no('The notice says ひきかえして ください — turn back.') },
            { jp: '{急|いそ}いで {渡|わた}る 。', en: 'Hurry across.', ok: false, why: no('Nothing in the notice suggests hurrying.') },
          ], explain: { jp: '{霧|きり} が {出|で}たら ＝ if fog comes', en: '〜たら: "if/when". Then: ひきかえして ください, please turn back.' } },
      ],
      A: [
        { kind: 'choose', item: 'c:sg_tide_a', ctx: { jp: '「{暦|こよみ} の {上|うえ} では {午後|ごご}{三時|さんじ} {過|す}ぎ が {干潮|かんちょう} だ 。 とはいえ 、 {嵐|あらし} の {後|あと} は {潮|しお} の {引|ひ}き が {鈍|にぶ}く 、 {表|ひょう} どおり に {道|みち} が {現|あらわ}れる とは {限|かぎ}らない 。 {霧|きり} の {中|なか} を {急|いそ}げば 、 {満|み}ち{潮|しお} に {足|あし} を {取|と}られ かねない 。」', en: '' },
          prompt: { en: 'What is the writer\'s main caution?' },
          options: [
            { jp: '{嵐|あらし} の {後|あと} は {表|ひょう} が {当|あ}て に ならない 。 {霧|きり} の {中|なか} で {急|いそ}ぐ な 。', en: 'After a storm the table can\'t be relied on; don\'t rush through fog.', ok: true },
            { jp: '{干潮|かんちょう} は {必|かなら}ず {三時|さんじ} だ 。', en: 'Low tide is definitely at three.', ok: false, why: no('とは かぎらない — "not necessarily" — says the opposite.') },
            { jp: '{満|み}ち{潮|しお} に {必|かなら}ず {足|あし} を {取|と}られる 。', en: 'The rising tide will certainly catch you.', ok: false, why: no('かねない means there is a risk, not a certainty.') },
          ], explain: { jp: '〜とは {限|かぎ}らない ／ 〜かねない', en: 'Not necessarily … / could well (a risk).' } },
        { kind: 'choose', item: 'c:sg_tide_a', prompt: { en: 'What does とはいえ do in the passage?' },
          options: [
            { jp: '{前|まえ} の {文|ぶん} を {認|みと}めた {上|うえ} で 、 {条件|じょうけん} を つける 。', en: 'It accepts the previous sentence, then qualifies it.', ok: true },
            { jp: '{理由|りゆう} を {述|の}べる 。', en: 'It gives a reason.', ok: false, why: no('That would be から/ので.') },
            { jp: '{引用|いんよう} を {示|しめ}す 。', en: 'It marks a quotation.', ok: false, why: no('That would be と/とは in another sense. Here とはいえ = "that said".') },
          ], explain: { jp: 'とはいえ ＝ that said, even so', en: 'A concessive connector common in written Japanese.' } },
      ],
    },
  });

  // ---- the wind word ----------------------------------------------------------------------------
  CH('sg.c_kaze', {
    title: { jp: '{風見|かざみ} の {字|じ}', en: 'The word on the vane' },
    intro: { jp: '「{風|かぜ}」 ── かぜ 。 {普通|ふつう} の {言葉|ことば} だ 。 {灯守|ひもり} の {教|おし}え で は 、 {名|な} を {書|か}けば {物|もの} は それ を {思|おも}い{出|だ}す 。', en: 'Kaze — "wind". An ordinary word. In lantern-keeper lore (fiction), writing a thing\'s name helps it remember what it is.' },
    tiers: {
      F: [{ kind: 'write', item: 'v:風', prompt: { en: 'Genzō: "The word carved on the vane is kaze — wind." Write it.' },
        answer: 'かぜ', accept: ['かぜ', '{風|かぜ}'], mode: 'reading', explain: { jp: '{風|かぜ}', en: 'かぜ — wind.' } }],
      E: [
        { kind: 'write', item: 'v:風', prompt: { en: 'Write the word for "wind" to carve back into the vane.' },
          answer: 'かぜ', accept: ['かぜ', '{風|かぜ}'], mode: 'reading', explain: { jp: '{風|かぜ}', en: 'かぜ — wind.' } },
        { kind: 'choose', item: 'v:吹く', prompt: { en: 'Which sentence means "the wind is blowing"?' },
          options: [
            { jp: '{風|かぜ} が {吹|ふ}いて います 。', ok: true },
            { jp: '{風|かぜ} が {降|ふ}って います 。', ok: false, why: no('ふる is for rain and snow falling.') },
            { jp: '{風|かぜ} が {咲|さ}いて います 。', ok: false, why: no('さく is for flowers blooming.') },
          ], explain: { jp: '{風|かぜ} が {吹|ふ}く', en: 'Wind ふく — blows.' } },
      ],
      I: [
        { kind: 'choose', item: 'c:sg_wind', ctx: { jp: 'ゲンゾウ ： 「{風|かぜ} が {止|や}む と 、 {霧|きり} が {座|すわ}る 。 {座|すわ}った {霧|きり} は 、 {風|かぜ} で しか {動|うご}かん 。」', en: '' },
          prompt: { en: 'According to Genzō, how does the fog get moved?' },
          options: [
            { jp: '{風|かぜ} だけ が {動|うご}かせる 。', en: 'Only wind can move it.', ok: true },
            { jp: '{風|かぜ} が {止|や}めば {動|うご}く 。', en: 'It moves when the wind stops.', ok: false, why: no('When the wind stops, the fog SETTLES (すわる).') },
            { jp: '{座|すわ}れば {消|き}える 。', en: 'It disappears once it settles.', ok: false, why: no('Settled fog stays until the wind moves it.') },
          ], explain: { jp: '〜で しか 〜ない ＝ only by …', en: 'しか + negative: かぜ で しか うごかん = moves only with the wind. (うごかん is a casual form of うごかない.)' } },
        { kind: 'write', item: 'v:風', prompt: { en: 'Write "wind" into the vane\'s grooves (kana or kanji).' },
          answer: 'かぜ', accept: ['かぜ', '{風|かぜ}'], mode: 'reading', explain: { jp: '{風|かぜ}', en: 'かぜ — wind.' } },
      ],
      A: [
        { kind: 'choose', item: 'v:風見', ctx: { jp: '{風見|かざみ}', en: '' }, prompt: { en: 'The vane is a kazami: in this word, wind is read かざ, not かぜ. Which other word shows the same change?' },
          options: [
            { jp: '{風車|かざぐるま}', en: 'kazaguruma (pinwheel)', ok: true },
            { jp: '{風邪|かぜ}', en: 'kaze (a cold)', ok: false, why: no('A different word written with different kanji — no sound change involved.') },
            { jp: '{台風|たいふう}', en: 'taifū (typhoon)', ok: false, why: no('That uses the Sino-Japanese reading ふう.') },
          ], explain: { jp: '{風見|かざみ} ・ {風上|かざかみ} ・ {風車|かざぐるま} ・ {雨傘|あまがさ}', en: 'In some compounds かぜ becomes かざ — a regular e→a change also seen in あめ → あまがさ (umbrella). The pinwheel word can also be read ふうしゃ, meaning a windmill.' } },
        { kind: 'write', item: 'v:風', prompt: { en: 'Now write the word itself, as it stands alone.' },
          answer: 'かぜ', accept: ['かぜ', '{風|かぜ}'], mode: 'reading', explain: { jp: '{風|かぜ}', en: 'On its own, the word is read かぜ.' } },
      ],
    },
  });

  // ---- the catalogue (gojūon order) -------------------------------------------------------------------
  CH('sg.c_catalog', {
    title: { jp: '{目録|もくろく} を {並|なら}べる', en: 'Restoring the catalogue' },
    intro: { jp: '{日本語|にほんご} の {目録|もくろく} は 、 {五十音|ごじゅうおん} {順|じゅん} に {並|なら}ぶ 。', en: 'Japanese catalogues are sorted in gojūon order: a i u e o, then ka ki ku ke ko, and so on. (A real convention.)' },
    tiers: {
      F: [
        { kind: 'order', item: 'c:sg_gojuon', prompt: { en: 'The row labels on the drawers: put them in gojūon order.' },
          tiles: ['あ{行|ぎょう}', 'か{行|ぎょう}', 'さ{行|ぎょう}', 'た{行|ぎょう}', 'な{行|ぎょう}'], answer: ['あ{行|ぎょう}', 'か{行|ぎょう}', 'さ{行|ぎょう}', 'た{行|ぎょう}', 'な{行|ぎょう}'], orderHint: { en: 'あ, then か, さ, た, な — the order of the rows of the kana chart (ぎょう = row).' } },
        { kind: 'order', item: 'c:sg_gojuon', prompt: { en: 'Inside the か-row drawer, the cards: put them in order.' },
          tiles: ['かさ', 'きた', 'くも', 'けさ', 'こえ'], answer: ['かさ', 'きた', 'くも', 'けさ', 'こえ'], orderHint: { en: 'Look at the first kana. Vowel order: ka, ki, ku, ke, ko.' } },
      ],
      E: [
        { kind: 'order', item: 'c:sg_gojuon', prompt: { en: 'Sort these catalogue cards in gojūon order.' },
          tiles: ['うみ', 'かぜ', 'しお', 'なみ', 'ふね'], answer: ['うみ', 'かぜ', 'しお', 'なみ', 'ふね'], orderHint: { en: 'Look at the first kana: う, か, し, な, ふ.' } },
        { kind: 'order', item: 'c:sg_gojuon', prompt: { en: 'Two cards start with い. Sort all four.' },
          tiles: ['あめ', 'いえ', 'いし', 'うた'], answer: ['あめ', 'いえ', 'いし', 'うた'], orderHint: { en: 'When the first kana is the same, compare the second: え (a-row) comes before し (sa-row).' } },
      ],
      I: [
        { kind: 'order', item: 'c:sg_gojuon', prompt: { en: 'The Archive filed Saltglass residents by name. Restore the order.' },
          tiles: ['アサヒ', 'キヨ', 'ゲンゾウ', 'シオリ', 'タマエ', 'テツ', 'ワタル'], answer: ['アサヒ', 'キヨ', 'ゲンゾウ', 'シオリ', 'タマエ', 'テツ', 'ワタル'],
          orderHint: { en: 'Katakana sort the same way. At first a voiced kana counts as its plain form: ゲ sorts with ケ, after キ.' } },
      ],
      A: [
        { kind: 'order', item: 'c:sg_charter', prompt: { en: 'The Archive\'s founding plaque has been broken into pieces. Restore the sentence.' },
          tiles: ['{名|な} と {約束|やくそく} の {写|うつ}し を {預|あず}かり 、', '{災|わざわ}い の {後|のち} に', '{失|うしな}われた {道|みち} を {再|ふたた}び {結|むす}ぶ', 'ために', 'この {書庫|しょこ} を {置|お}く 。'],
          answer: ['{名|な} と {約束|やくそく} の {写|うつ}し を {預|あず}かり 、', '{災|わざわ}い の {後|のち} に', '{失|うしな}われた {道|みち} を {再|ふたた}び {結|むす}ぶ', 'ために', 'この {書庫|しょこ} を {置|お}く 。'],
          alts: [['{災|わざわ}い の {後|のち} に', '{名|な} と {約束|やくそく} の {写|うつ}し を {預|あず}かり 、', '{失|うしな}われた {道|みち} を {再|ふたた}び {結|むす}ぶ', 'ために', 'この {書庫|しょこ} を {置|お}く 。']],
          orderHint: { en: 'あずかり、 is a continuative (it links to what follows). ために needs a plain verb before it, and the main verb おく ends the sentence.' } },
        { kind: 'choose', item: 'c:sg_charter', prompt: { en: 'According to the plaque, what was the archive founded for?' },
          options: [
            { jp: '{写|うつ}し を {預|あず}かって 、 {災害|さいがい} の {後|あと} に {道|みち} を {繋|つな}ぎ{直|なお}す ため 。', en: 'To keep copies so that roads could be reconnected after disasters.', ok: true },
            { jp: '{争|あらそ}い を {減|へ}らす ため に 、 {名|な} を {集|あつ}める ため 。', en: 'To collect names so there would be fewer quarrels.', ok: false, why: no('That is what it does now — not what the plaque says.') },
            { jp: '{読|よ}めない {手紙|てがみ} を {処分|しょぶん} する ため 。', en: 'To dispose of unreadable letters.', ok: false, why: no('Nothing in the charter about disposal.') },
          ], explain: { en: 'The founders meant to restore connections. The irony is the point.' } },
      ],
    },
  });

  // ---- the reading-room rules --------------------------------------------------------------------------
  CH('sg.c_notice', {
    title: { jp: '{書庫|しょこ} の {規則|きそく}', en: 'The archive\'s rules' },
    tiers: {
      F: [{ kind: 'choose', item: 'c:sg_notice', ctx: { jp: 'よめない なまえ の てがみ は 、 やま の しょこ へ おくる 。', en: '' },
        prompt: { en: 'Where do letters with unreadable names go?' },
        options: [
          { jp: 'やま の しょこ', en: 'the archive in the mountains', ok: true },
          { jp: 'みなと', en: 'the harbour', ok: false, why: no('The rule says やま の しょこ.') },
          { jp: 'うみ', en: 'the sea', ok: false, why: no('Not the sea — look for へ, the direction marker.') },
        ], explain: { jp: 'やま の しょこ へ おくる', en: 'へ marks where something is sent.' } }],
      E: [{ kind: 'choose', item: 'c:sg_notice', ctx: { jp: '「{宛名|あてな} が {読|よ}めない {手紙|てがみ} は 、 {差出人|さしだしにん} に {返|かえ}さず 、 {山|やま} の {本庁|ほんちょう} へ {送|おく}る こと 。」', en: '' },
        prompt: { en: 'What happens to letters whose address can\'t be read?' },
        options: [
          { jp: '{山|やま} の {本庁|ほんちょう} へ {送|おく}られる 。', en: 'They are sent to the head office in the mountains.', ok: true },
          { jp: '{差出人|さしだしにん} に {返|かえ}される 。', en: 'They are returned to the sender.', ok: false, why: no('かえさず means "without returning".') },
          { jp: '{捨|す}てられる 。', en: 'They are thrown away.', ok: false, why: no('Nothing says they are thrown away.') },
        ], explain: { jp: '〜ず ＝ without …ing', en: 'かえさず = かえさないで, "without returning". 〜こと at the end of a rule means "must".' } }],
      I: [{ kind: 'choose', item: 'c:sg_notice', ctx: { jp: '「{宛名|あてな} の {判読|はんどく} できない もの は 、 {差出人|さしだしにん} へ {返送|へんそう} した もの と {見|み}なし 、 {本庁|ほんちょう} へ {移管|いかん} する こと 。」', en: '' },
        prompt: { en: 'What does へんそう した もの と みなし mean here?' },
        options: [
          { jp: '{返送|へんそう} した こと に して 、 {実際|じっさい} に は {本庁|ほんちょう} へ {送|おく}る 。', en: 'It is recorded as returned — but actually sent to head office.', ok: true },
          { jp: '{本当|ほんとう} に {差出人|さしだしにん} へ {返|かえ}す 。', en: 'It really is returned to the sender.', ok: false, why: no('みなす = to regard as, deem. It is only treated as returned.') },
          { jp: 'ここ に {保管|ほかん} して おく 。', en: 'It is kept here.', ok: false, why: no('いかん する = transfer to another office.') },
        ], explain: { jp: '〜と {見|み}なす ＝ to deem, treat as', en: 'The "Returned" stamp is a legal fiction covering a transfer.' } }],
      A: [
        { kind: 'choose', item: 'c:sg_notice', ctx: { jp: '「{宛名|あてな} の {判読|はんどく} {能|あた}わざる もの は 、 {差出人|さしだしにん} に {返送|へんそう} する に {及|およ}ばず 、 {本庁|ほんちょう} へ {移管|いかん} すべし 。 {名|な} の {散逸|さんいつ} は {争|あらそ}い の {種|たね} なれば なり 。」', en: '' },
          prompt: { en: 'What does the rule say should happen?' },
          options: [
            { jp: '{返送|へんそう} する {必要|ひつよう} は なく 、 {本庁|ほんちょう} へ {移|うつ}す べき だ 。', en: 'There is no need to return them; they must be transferred to head office.', ok: true },
            { jp: '{返送|へんそう} して は いけない 。 {捨|す}てる べき だ 。', en: 'They must not be returned; they should be destroyed.', ok: false, why: no('に およばず = "need not", not "must not"; and nothing says destroy.') },
            { jp: '{判読|はんどく} できる まで 、 {分室|ぶんしつ} で {待|ま}つ べき だ 。', en: 'They should wait at the branch until they can be read.', ok: false, why: no('いかん す べし — transfer them.') },
          ], explain: { jp: '〜に {及|およ}ばず ＝ need not ／ 〜べし ＝ shall', en: 'Classical-style rules: あたわざる = cannot; に およばず = there is no need to; べし = shall.' } },
        { kind: 'choose', item: 'c:sg_notice', prompt: { en: 'And the last sentence — what reason does it give?' },
          options: [
            { jp: '{名|な} が {散|ち}らばる と 、 {争|あらそ}い が {起|お}きる から 。', en: 'Because scattered names cause quarrels.', ok: true },
            { jp: '{名|な} が {多|おお}すぎて 、 {棚|たな} に {入|はい}らない から 。', en: 'Because there are too many names for the shelves.', ok: false, why: no('さんいつ is scattering and loss, not overcrowding.') },
            { jp: '{手紙|てがみ} は {種|たね} から {作|つく}る から 。', en: 'Because letters are made from seeds.', ok: false, why: no('たね is figurative here: "seed (cause) of conflict".') },
          ], explain: { jp: '〜なれば なり ＝ for it is …', en: 'A classical explanatory ending: "(this is) because …".' } },
      ],
    },
  });

  // ---- the rope word ------------------------------------------------------------------------------------
  CH('sg.c_nawa', {
    title: { jp: '{縄|なわ} の {字|じ}', en: 'The word for rope' },
    intro: { jp: '「{縄|なわ}」 ── なわ 。 {普通|ふつう} の {言葉|ことば} で 、 {物|もの} を {結|むす}び{止|と}める 。', en: 'Nawa — "rope". An ordinary word; in inkweaving (fiction) it holds things in place.' },
    tiers: {
      F: [{ kind: 'write', item: 'v:縄', prompt: { en: 'Write nawa — rope — on Tetsu\'s rope.' },
        answer: 'なわ', accept: ['なわ', '{縄|なわ}'], mode: 'reading', explain: { jp: '{縄|なわ}', en: 'なわ — rope.' } }],
      E: [
        { kind: 'write', item: 'v:縄', prompt: { en: 'Write the word for "rope".' },
          answer: 'なわ', accept: ['なわ', '{縄|なわ}'], mode: 'reading', explain: { jp: '{縄|なわ}', en: 'なわ — rope.' } },
        { kind: 'choose', item: 'v:結ぶ', ctx: { jp: '「{縄|なわ} を ＿＿」', en: '' }, prompt: { en: '"Tie the rope" — which verb fills the gap?' },
          options: [
            { jp: '{結|むす}ぶ', en: 'musubu (tie)', ok: true },
            { jp: '{飲|の}む', en: 'nomu (drink)', ok: false, why: no('You don\'t drink rope.') },
            { jp: '{読|よ}む', en: 'yomu (read)', ok: false, why: no('Nor read it.') },
          ], explain: { jp: '{縄|なわ} を {結|むす}ぶ', en: 'To tie a rope.' } },
      ],
      I: [
        { kind: 'choose', item: 'c:sg_rope', ctx: { jp: 'テツ ： 「{縄|なわ} なし で {水|みず} に {近|ちか}づく の は 、 {馬鹿|ばか} だけ だ 。」', en: '' },
          prompt: { en: 'What was Tetsu saying?' },
          options: [
            { jp: '{縄|なわ} を {持|も}たず に {水辺|みずべ} へ {行|い}く の は {愚|おろ}か だ 。', en: 'Only a fool goes near water without a rope.', ok: true },
            { jp: '{馬鹿|ばか} は {縄|なわ} を {持|も}って いない 。', en: 'Fools don\'t own rope.', ok: false, why: no('The subject is "going near water without rope" (の is a nominaliser).') },
            { jp: '{縄|なわ} は {馬鹿|ばか} の ため の もの だ 。', en: 'Rope is for fools.', ok: false, why: no('Other way round.') },
          ], explain: { jp: '〜の は …… だけ だ', en: 'X のは Y だけだ — "the only ones who X are Y".' } },
        { kind: 'write', item: 'v:縄', prompt: { en: 'Write "rope" (kana or kanji).' },
          answer: 'なわ', accept: ['なわ', '{縄|なわ}'], mode: 'reading', explain: { jp: '{縄|なわ}', en: 'なわ — rope.' } },
      ],
      A: [
        { kind: 'choose', item: 'v:一筋縄', ctx: { jp: '「この {書庫|しょこ} は 、 {一筋縄|ひとすじなわ} では いかない わ ね 。」', en: '' },
          prompt: { en: 'What does the idiom mean?' },
          options: [
            { jp: '{普通|ふつう} の やり{方|かた} では {片付|かたづ}かない 。', en: 'This archive won\'t yield to ordinary methods.', ok: true },
            { jp: '{縄|なわ} が {一本|いっぽん} {足|た}りない 。', en: 'We\'re one rope short.', ok: false, why: no('It\'s an idiom — not about counting rope.') },
            { jp: '{書庫|しょこ} は {縄|なわ} で {縛|しば}られて いる 。', en: 'The archive is tied up with rope.', ok: false, why: no('No literal rope involved.') },
          ], explain: { jp: '{一筋縄|ひとすじなわ} では いかない', en: 'Literally "won\'t go with a single strand of rope": not easily handled.' } },
        { kind: 'write', item: 'v:縄', prompt: { en: 'Write the plain word itself: "rope".' },
          answer: 'なわ', accept: ['なわ', '{縄|なわ}'], mode: 'reading', explain: { jp: '{縄|なわ}', en: 'なわ — rope.' } },
      ],
    },
  });

  // ---- Genzō's letter: 〜なくていい vs 〜ないで ---------------------------------------------------------------
  CH('sg.c_genzo', {
    title: { jp: '「{来|こ}なくて いい 」 の {意味|いみ}', en: 'What "you needn\'t come" means' },
    tiers: {
      F: [
        { kind: 'choose', item: 'g:v_temo_ii', ctx: { jp: 'むかえ に こなくて いい よ 。', en: '' },
          prompt: { en: 'What does Nagisa mean?' },
          options: [
            { en: 'You don\'t have to come and meet me.', ok: true },
            { en: 'Don\'t ever come.', ok: false, why: no('That would be こないで.') },
            { en: 'Come quickly.', ok: false, why: no('はやく きて would be "come quickly".') },
          ], explain: { en: 'こなくていい — "(you) don\'t have to come".' } },
        { kind: 'choose', item: 'g:v_naide_kudasai', prompt: { en: 'Which one tells someone NOT to come?' },
          options: [
            { jp: 'こないで', ok: true },
            { jp: 'こなくて いい', ok: false, why: no('That only says there\'s no need.') },
            { jp: 'きて', ok: false, why: no('きて means "come".') },
          ], explain: { en: 'こないで = "don\'t come". こなくていい = "no need to come".' } },
      ],
      E: [
        { kind: 'choose', item: 'g:v_temo_ii', ctx: { jp: '「{迎|むか}え に {来|こ}なくて いい よ 。 {港|みなと} まで は {自分|じぶん} で {行|い}ける から 。」', en: '' },
          prompt: { en: 'What does Nagisa mean?' },
          options: [
            { en: 'You needn\'t come; I can get there myself.', ok: true },
            { en: 'Don\'t come — I don\'t want to see you.', ok: false, why: no('The next sentence gives a practical reason, not a rejection.') },
            { en: 'Come to the harbour.', ok: false, why: no('She says he doesn\'t need to.') },
          ], explain: { jp: '〜なくて いい', en: 'Removes an obligation: "you don\'t have to".' } },
        { kind: 'choose', item: 'g:v_naide_kudasai', prompt: { en: 'Which is the polite way to ask someone NOT to come?' },
          options: [
            { jp: '{来|こ}ないで ください 。', ok: true },
            { jp: '{来|こ}なくて も いい です 。', ok: false, why: no('"You don\'t have to come" — permission, not a request.') },
            { jp: '{来|き}て ください 。', ok: false, why: no('"Please come."') },
          ], explain: { jp: '〜ないで ください', en: 'A polite request not to do something.' } },
      ],
      I: [
        { kind: 'choose', item: 'g:v_temo_ii', ctx: { jp: '「お{父|とう}さん へ 。 {来月|らいげつ} 、 {帰|かえ}ります 。 {迎|むか}え に {来|こ}なくて いい よ 。 {港|みなと} まで は 、 {自分|じぶん} で {行|い}ける から 。 {膝|ひざ} 、 {大事|だいじ} に して 。 {灯台|とうだい} で {待|ま}って て 。」', en: '' },
          prompt: { en: 'Why does she say he needn\'t come?' },
          options: [
            { en: 'She\'s worried about his knees and can manage alone.', ok: true },
            { en: 'She\'s still angry with him.', ok: false, why: no('The letter ends asking him to wait for her.') },
            { en: 'The ferry doesn\'t stop at the harbour.', ok: false, why: no('She says she can get to the harbour herself.') },
          ], explain: { jp: '〜から ＝ because', en: 'The から clause gives the reason; ひざ、だいじ に して shows the care behind it.' } },
        { kind: 'choose', item: 'g:casual_contractions', ctx: { jp: '「{待|ま}って て 」', en: '' }, prompt: { en: 'This is a casual contraction of…?' },
          options: [
            { jp: '{待|ま}って いて', ok: true },
            { jp: '{待|ま}たないで', ok: false, why: no('That is the opposite: "don\'t wait".') },
            { jp: '{待|ま}って って', ok: false, why: no('って would be a quotation.') },
          ], explain: { jp: '{待|ま}って いて', en: 'In speech, the い of 〜ている often drops: まって いて → まってて, "keep waiting / be waiting".' } },
      ],
      A: [
        { kind: 'choose', item: 'g:v_temo_ii', ctx: { jp: '「{迎|むか}え に {来|こ}なくて いい よ 。」', en: '' }, prompt: { en: 'Genzō read only this line. In context, which reading is most accurate?' },
          options: [
            { en: 'A considerate release from an obligation, softened by よ.', ok: true },
            { en: 'A polite refusal meaning "don\'t come".', ok: false, why: no('A refusal would be こないで (ください) or けっこう です; the following lines show care.') },
            { en: 'Indifference: it makes no difference to her whether he comes.', ok: false, why: no('"Look after your knees" and "wait at the lighthouse" show the opposite.') },
          ], explain: { en: 'Pragmatics: the same words read differently once you see the reason and the request that follow.' } },
        { kind: 'choose', item: 'g:keigo_sonkei', prompt: { en: 'Explain it to Genzō in a way that respects his pride. Which do you say?' },
          options: [
            { jp: '{膝|ひざ} の {具合|ぐあい} を {考|かんが}えて 、 {坂|さか} を {下|お}りて いらっしゃらなくて も {大丈夫|だいじょうぶ} です 、 と いう {意味|いみ} です 。', en: 'It means: with your knees in mind, you needn\'t come down the hill.', ok: true },
            { jp: '{来|く}る な と いう {意味|いみ} です 。', en: 'It means "don\'t come".', ok: false, why: no('That is the misreading.') },
            { jp: '{迎|むか}え は {不要|ふよう} です 。', en: 'Meeting her is unnecessary.', ok: false, why: no('Accurate on the surface, but cold — it drops the care that is the whole point.') },
          ], explain: { jp: 'いらっしゃる ＝ {来|く}る の {尊敬語|そんけいご}', en: 'いらっしゃらなくても だいじょうぶ — respectful and gentle.' } },
      ],
    },
  });

  // ---- activities ------------------------------------------------------------------------------------------
  const A = C.activities;
  A['sg.a_lunch'] = {
    type: 'orders', title: { jp: 'かもめ{亭|てい} の {昼|ひる}', en: 'Lunch rush at the Gull' },
    menu: [
      { id: 'fish', jp: '{焼|や}き{魚|ざかな}', en: 'grilled fish' },
      { id: 'soup', jp: '{味噌汁|みそしる}', en: 'miso soup' },
      { id: 'rice', jp: 'ご{飯|はん}', en: 'rice' },
      { id: 'tea', jp: 'お{茶|ちゃ}', en: 'tea' },
      { id: 'ball', jp: 'おにぎり', en: 'rice ball' },
    ],
    customers: [
      { who: 'daigo', want: { fish: 1, rice: 1, ball: 1 }, items: ['v:焼き魚', 'g:counters'],
        line: {
          F: { jp: 'さかな ひとつ 、 ごはん ひとつ 、 おにぎり ひとつ ！', en: 'One fish, one rice, one rice ball!' },
          E: { jp: '{焼|や}き{魚|ざかな} を {一|ひと}つ と 、 ご{飯|はん} を {一|ひと}つ 。 それ から 、 おにぎり も {一|ひと}つ 。', en: 'One grilled fish and one rice. And a rice ball too.' },
          I: { jp: 'いつも の で {頼|たの}む わ 。 あ 、 {汁|しる} は {今日|きょう} は いい 。 {代|か}わり に おにぎり {一|ひと}つ 。', en: 'The usual, please. Oh — skip the soup today. A rice ball instead.' },
          A: { jp: 'いつも の やつ を …… いや 、 {汁物|しるもの} は {抜|ぬ}き で 。 {腹|はら} が {減|へ}って る から 、 {握|にぎ}り を {一|ひと}つ {足|た}して くれ 。', en: 'The usual… no, hold the soup. I\'m starving, so add a rice ball.' },
        },
        hint: { F: { en: 'One each of fish, rice and rice ball.' }, I: { en: 'Tamae said Daigo\'s usual is fish, rice and miso soup.' } },
        thanks: { jp: 'おう 、 これ これ ！', en: 'That\'s the stuff!' } },
      { who: 'tetsu', want: { tea: 2 }, items: ['v:茶', 'g:counters'],
        line: {
          F: { jp: 'おちゃ ふたつ 。', en: 'Two teas.' },
          E: { jp: 'お{茶|ちゃ} を {二|ふた}つ 。 {一|ひと}つ は {連|つ}れ の {分|ぶん} だ 。', en: 'Two teas. One\'s for a friend.' },
          I: { jp: '{茶|ちゃ} を くれ 。 {後|あと} で ゲンゾウ が {来|く}る から 、 あいつ の {分|ぶん} も な 。', en: 'Tea. Genzō\'s coming later, so one for him too.' },
          A: { jp: '{茶|ちゃ} だけ で いい 。 …… いや 、 {灯台|とうだい} の {爺|じい}さん も じき {来|く}る はず だ から 、 もう {一杯|いっぱい} {頼|たの}む 。', en: 'Just tea. …No — the old man from the lighthouse should be along soon, so one more cup.' },
        },
        hint: { F: { en: 'Two teas.' }, I: { en: 'One for Tetsu, one for Genzō.' } },
        thanks: { jp: '…… ん 。', en: '…Mm.' } },
      { who: 'kiyo', want: { soup: 2, rice: 1 }, items: ['v:味噌汁', 'g:counters'],
        line: {
          F: { jp: 'みそしる ふたつ と 、 ごはん ひとつ 。', en: 'Two miso soups and one rice.' },
          E: { jp: '{味噌汁|みそしる} を {二|ふた}つ と 、 ご{飯|はん} を {一|ひと}つ ね 。 {魚|さかな} は いらない よ 。', en: 'Two miso soups and one rice. No fish.' },
          I: { jp: '{魚|さかな} は {勘弁|かんべん} して よ 。 {汁|しる} を {二杯|にはい} と 、 ご{飯|はん} を {一杯|いっぱい} 。', en: 'Spare me the fish. Two bowls of soup and one of rice.' },
          A: { jp: '{魚|さかな} だけ は {見|み}たく ない ね 。 {朝|あさ} から {晩|ばん} まで {睨|にら}めっこ して る ん だ から 。 {汁|しる} は {二杯|にはい} 、 ご{飯|はん} は {軽|かる}く {一膳|いちぜん} で 。', en: 'Anything but fish — I stare the things down from dawn to dusk. Two bowls of soup, and a light bowl of rice.' },
        },
        hint: { F: { en: 'Two soups, one rice. No fish.' }, I: { jp: '{二杯|にはい} ・ {一杯|いっぱい} ・ {一膳|いちぜん}', en: 'はい counts cups and bowls (にはい = two); ぜん counts bowls of rice (いちぜん = one).' } },
        thanks: { jp: 'ありがと ！ {次|つぎ} は {安|やす}く する よ 。 {魚|さかな} を ね 。', en: 'Thanks! I\'ll give you a discount next time. On fish.' } },
      { who: 'wataru', want: { tea: 1 }, items: ['v:茶'],
        line: {
          F: { jp: 'おちゃ ひとつ …… だけ で いい です 。', en: 'Just one tea… that\'s all.' },
          E: { jp: 'お{茶|ちゃ} を {一|ひと}つ だけ 。 {食事|しょくじ} は 、 {今日|きょう} は いい です 。', en: 'Just one tea. No food today, thanks.' },
          I: { jp: 'あ 、 {僕|ぼく} は お{茶|ちゃ} だけ で …… 。 いえ 、 お{腹|なか} は {空|す}いて ない ので 。', en: 'Oh, just tea for me… No, I\'m not hungry.' },
          A: { jp: 'お{茶|ちゃ} を {一杯|いっぱい} だけ 。 …… {昼|ひる} は {抜|ぬ}く こと に して いる ん です 。 {節約|せつやく} と いう わけ では ない ん です が 。', en: 'Just a cup of tea. …I\'ve made a habit of skipping lunch. Not that it\'s to save money or anything.' },
        },
        hint: { F: { en: 'Only one tea.' }, E: { en: 'だけ = only.' } },
        thanks: { jp: 'す 、 すみません 。 ありがとう ございます 。', en: 'S-sorry. Thank you.' } },
      { who: 'sota', want: { ball: 3 }, items: ['v:おにぎり', 'g:counters'],
        line: {
          F: { jp: 'おにぎり みっつ ！', en: 'Three rice balls!' },
          E: { jp: 'おにぎり を {三|みっ}つ 、 {持|も}って {帰|かえ}ります 。', en: 'Three rice balls to take away, please.' },
          I: { jp: '{岸|きし} で {食|た}べる ので 、 おにぎり を {三|みっ}つ {包|つつ}んで もらえます か 。', en: 'I\'ll eat on the shore — could you wrap up three rice balls?' },
          A: { jp: '{夕方|ゆうがた} まで {岸|きし} で {粘|ねば}る つもり な ので 、 {握|にぎ}り を …… {僕|ぼく} の と 、 {母|かあ}さん の と 、 {母|かあ}さん が {欲|ほ}しがる もう {一|ひと}つ 。', en: 'I\'m going to stick it out on the shore till evening, so rice balls… one for me, one for Mum, and the extra one Mum will want.' },
        },
        hint: { F: { en: 'Three rice balls.' }, A: { en: 'Count them: his, his mother\'s, and one more for his mother.' } },
        thanks: { jp: 'やった ！ ありがとう ！', en: 'Yes! Thank you!' } },
      { who: 'omi', want: { fish: 2, soup: 1, tea: 1 }, items: ['v:焼き魚', 'g:counters'],
        line: {
          F: { jp: 'やきざかな ふたつ 、 みそしる ひとつ 、 おちゃ ひとつ 。', en: 'Two grilled fish, one miso soup, one tea.' },
          E: { jp: '{焼|や}き{魚|ざかな} を {二|ふた}つ と 、 {味噌汁|みそしる} {一|ひと}つ 。 お{茶|ちゃ} も {一|ひと}つ 。', en: 'Two grilled fish and a miso soup. And a tea.' },
          I: { jp: '{焼|や}き{魚|ざかな} を {二|ふた}つ 。 {一|ひと}つ は ワタル に {持|も}って いく 。 あいつ 、 {昼|ひる} を {食|く}わない から な 。 それ と 、 {汁|しる} と {茶|ちゃ} を {一|ひと}つ ずつ 。', en: 'Two grilled fish — one\'s going to Wataru; the man never eats lunch. And one each of soup and tea.' },
          A: { jp: 'わたし の {分|ぶん} と 、 ワタル の {分|ぶん} の {焼|や}き{魚|ざかな} 。 {汁|しる} と {茶|ちゃ} は わたし だけ で いい 。 …… あいつ 、 {昼|ひる} を {抜|ぬ}いて る だろう 。 {気付|きづ}かない と でも {思|おも}って る の か ね 。', en: 'Grilled fish for me and one for Wataru. Soup and tea just for me. …He\'s been skipping lunch. Does he think I haven\'t noticed?' },
        },
        hint: { F: { en: 'Two fish, one soup, one tea.' }, I: { en: 'ずつ = each: one soup and one tea.' } },
        thanks: { jp: '{助|たす}かる 。 {釣|つ}り は いらない よ 。', en: 'Much obliged. Keep the change.' } },
    ],
  };

  const R = (id, nameJp, nameEn, F, E) => ({ id, name: { jp: nameJp, en: nameEn }, desc: { F, E } });
  A['sg.a_post'] = {
    type: 'letters', title: { jp: '{宛名|あてな} の ない {手紙|てがみ}', en: 'Letters without addresses' },
    recipients: [
      R('genzo', 'ゲンゾウ', 'Genzō', { jp: 'とうだい の ひと', en: 'the lighthouse keeper' }, { jp: '{灯台|とうだい} を {守|まも}って いる', en: 'keeps the lighthouse' }),
      R('asahi', 'アサヒ', 'Asahi', { jp: 'ガラス を つくる ひと', en: 'makes glass' }, { jp: '{工房|こうぼう} で ガラス を {作|つく}る', en: 'makes glass at the workshop' }),
      R('tetsu', 'テツ', 'Tetsu', { jp: 'ふね を だす ひと', en: 'runs the ferry' }, { jp: '{渡|わた}し{船|ぶね} を {出|だ}す', en: 'runs the ferry' }),
      R('kiyo', 'キヨ', 'Kiyo', { jp: 'さかな を うる ひと', en: 'sells fish' }, { jp: '{市場|いちば} で {魚|さかな} を {売|う}る ・ {息子|むすこ} が {二人|ふたり}', en: 'sells fish at the market; has two sons' }),
      R('shiori', 'シオリ', 'Shiori', { jp: 'しお を みる ひと', en: 'watches the tides' }, { jp: '{潮|しお} の {時間|じかん} を {記録|きろく} する', en: 'records the tides' }),
    ],
    letters: [
      { to: 'shiori', items: ['c:sg_post'],
        text: {
          F: { jp: 'しお の じかん を 、 おしえて ください 。', en: 'Please tell me the tide times.' },
          E: { jp: '{来月|らいげつ} の {潮|しお} の {時間|じかん} を {教|おし}えて ください 。 {漁|りょう} の {予定|よてい} を {立|た}てたい ので 。', en: 'Please tell me next month\'s tide times. I want to plan the fishing.' },
          I: { jp: '{毎月|まいつき} {写|うつ}させて いただいて いる {潮|しお} の {表|ひょう} 、 {来月|らいげつ} の {分|ぶん} も お{願|ねが}い できます か 。', en: 'Might I copy next month\'s tide table as well, as you kindly let me do every month?' },
          A: { jp: '{先日|せんじつ} お{送|おく}り いただいた {満|み}ち{干|ひ} の {記録|きろく} 、 {大変|たいへん} {重宝|ちょうほう} して おります 。 {引|ひ}き{続|つづ}き 、 {来月|らいげつ} {分|ぶん} の {写|うつ}し を いただければ {幸|さいわ}い です 。', en: 'The record of the ebb and flow you sent recently has been most useful. I would be grateful to receive a copy for next month as well.' },
        },
        why: { en: 'Tide times — Shiori keeps the tide records.' }, hint: { en: 'Who keeps the tide tables?' } },
      { to: 'asahi', items: ['c:sg_post'],
        text: {
          F: { jp: 'ガラス の うきだま を 、 とお ください 。', en: 'Ten glass floats, please.' },
          E: { jp: 'ガラス の {浮|う}き{玉|だま} を {十個|じっこ} お{願|ねが}い します 。 {網|あみ} に {付|つ}けます 。', en: 'Ten glass floats, please. They\'re for the nets.' },
          I: { jp: '{割|わ}れた {浮|う}き{玉|だま} の {代|か}わり を {作|つく}って もらえない か 。 {炉|ろ} の {火|ひ} が {戻|もど}ったら で いい 。', en: 'Could you make replacements for the broken floats? Whenever your furnace is lit again is fine.' },
          A: { jp: '{炉|ろ} に {火|ひ} が {入|はい}り{次第|しだい} 、 {浮|う}き{玉|だま} を {十|とお} ばかり {吹|ふ}いて いただけない だろう か 。 {代金|だいきん} は {魚|さかな} で {払|はら}う 。', en: 'As soon as your furnace is lit, could you blow ten or so floats? I\'ll pay in fish.' },
        },
        why: { en: 'Glass floats — made at the glassworks.' }, hint: { en: 'Who makes things from glass?' } },
      { to: 'tetsu', items: ['c:sg_post'],
        text: {
          F: { jp: 'ふね に のりたい です 。 なんじ に でます か 。', en: 'I want to ride the boat. What time does it leave?' },
          E: { jp: '{来週|らいしゅう} 、 {渡|わた}し{船|ぶね} に {乗|の}りたい です 。 {何時|なんじ} に {出|で}ます か 。', en: 'I\'d like to take the ferry next week. What time does it leave?' },
          I: { jp: '{東|ひがし} の {岸|きし} へ {渡|わた}りたい の です が 、 {時刻表|じこくひょう} が {毎日|まいにち} {違|ちが}う ので 、 {船頭|せんどう} さん に {直接|ちょくせつ} {伺|うかが}います 。', en: 'I want to cross to the east shore, but the timetable is different every day, so I\'m asking the boatman directly.' },
          A: { jp: '{掲示|けいじ} の {時刻|じこく} が {当|あ}て に ならない ゆえ 、 {出航|しゅっこう} の {刻限|こくげん} は 、 {船|ふね} を {出|だ}す ご{本人|ほんにん} に お{尋|たず}ね する より {他|ほか} ない と {存|ぞん}じます 。', en: 'As the posted times cannot be relied on, I believe there is nothing for it but to ask the one who sails the boat when it departs.' },
        },
        why: { en: 'A question about the ferry — for the ferryman.' }, hint: { en: 'Who runs the boats?' } },
      { to: 'kiyo', items: ['c:sg_post'],
        text: {
          F: { jp: 'かあさん 、 げんき ？ さかな を うる の 、 むり しないで ね 。', en: 'Mum, are you well? Don\'t overdo it selling fish.' },
          E: { jp: '{母|かあ}さん へ 。 {魚|さかな} の {店|みせ} は {忙|いそが}しい です か 。 {無理|むり} を しないで ください 。', en: 'Dear Mum, is the fish stall busy? Please don\'t push yourself.' },
          I: { jp: '{市場|いちば} で {毎朝|まいあさ} {声|こえ} を {張|は}り{上|あ}げて いる と {聞|き}きました 。 {喉|のど} を {大事|だいじ} に して ください ね 、 {母|かあ}さん 。', en: 'I hear you\'re shouting yourself hoarse at the market every morning. Look after your throat, Mum.' },
          A: { jp: '{値段|ねだん} の {駆|か}け{引|ひ}き に {夢中|むちゅう} に なる の も {結構|けっこう} です が 、 たまに は {店|みせ} を {閉|し}めて {休|やす}んで ください 。 {弟|おとうと} に も よろしく 。', en: 'Haggling over prices is all very well, but do close the stall and rest now and then. Give my regards to my little brother.' },
        },
        why: { en: 'To a mother who sells fish — Kiyo. (Her elder son works up the coast.)' }, hint: { en: 'Who sells fish, and is someone\'s mother?' } },
      { to: 'genzo', items: ['c:sg_post'],
        text: {
          F: { jp: 'とうだい の あかり 、 いつも ありがとう 。', en: 'Thank you for the lighthouse light, always.' },
          E: { jp: '{灯台|とうだい} の {明|あ}かり の おかげ で 、 {無事|ぶじ} に {帰|かえ}れました 。 ありがとう ございます 。', en: 'Thanks to the lighthouse, I made it home safely. Thank you.' },
          I: { jp: '{嵐|あらし} の {夜|よる} 、 {岬|みさき} の {灯|ひ} が なければ 、 {船|ふね} は {岩|いわ} に {乗|の}り{上|あ}げて いた でしょう 。', en: 'On the night of the storm, if not for the light on the point, my boat would have run onto the rocks.' },
          A: { jp: '{荒|あ}れた {夜|よる} に こそ {灯|ひ} を {絶|た}やさぬ その {心構|こころがま}え に 、 {沖|おき} の {者|もの} は {皆|みな} {救|すく}われて おります 。', en: 'Your resolve to keep the light burning on the roughest nights of all is what saves every one of us out at sea.' },
        },
        why: { en: 'Thanks for the light on the point — the lighthouse keeper.' }, hint: { en: 'Who keeps a light burning at night?' } },
    ],
  };

  A['sg.a_signpost'] = {
    type: 'signpost', title: { jp: '{崖|がけ} の {道標|みちしるべ}', en: 'The cliff-path signpost' },
    places: [
      { id: 'cove', jp: '{入|い}り{江|え}', r: 'いりえ', en: 'the cove', item: 'v:入り江' },
      { id: 'port', jp: '{港|みなと}', r: 'みなと', en: 'the harbour', item: 'v:港' },
      { id: 'road', jp: '{街道|かいどう}', r: 'かいどう', en: 'the high road', item: 'v:街道' },
    ],
    arms: [
      { dir: 'east, down the cliff steps', to: 'cove', why: 'Where the sun rises; down the steps to the nets.',
        clue: {
          F: { jp: 'ひ の のぼる ほう 。 かいだん を おりる と 、 あみ が ある 。', en: 'Where the sun rises. Down the steps, the nets are waiting.' },
          E: { jp: '{東|ひがし} の {階段|かいだん} を {下|お}りる と 、 ソウタ の {網|あみ} が {干|ほ}して ある 。', en: 'Go down the eastern steps and Sōta\'s nets are hung out to dry.' },
          I: { jp: 'キヨ の 「{日|ひ} の {昇|のぼ}る ほう 」 。 {海|うみ} を {向|む}いた トビ に とって は {右|みぎ} 。', en: 'Kiyo\'s "where the sun rises". For Tobi, facing the sea, it\'s on the right.' },
          A: { jp: '{陸|おか} から {見|み}れば {右|みぎ} 、 {沖|おき} から {見|み}れば {左|ひだり} 。 {立|た}つ {場所|ばしょ} で {言|い}い{方|かた} は {変|か}わって も 、 {指|さ}す {先|さき} は {一|ひと}つ 。', en: 'Right, seen from land; left, seen from the sea. The words change with where you stand, but they point to one place.' },
        } },
      { dir: 'west, back along the street', to: 'port', why: 'The market, the piers and the smell of tar.',
        clue: {
          F: { jp: 'さかな と ふね が たくさん ある ほう 。', en: 'The way with lots of fish and boats.' },
          E: { jp: '{大通|おおどお}り を {西|にし} へ {行|い}く と 、 {市場|いちば} と {桟橋|さんばし} が ある 。', en: 'Go west along the main street for the market and the piers.' },
          I: { jp: '{荷|に} を {運|はこ}ぶ {声|こえ} と 、 {魚|さかな} の {匂|にお}い が する ほう 。 {今|いま} {来|き}た {道|みち} だ 。', en: 'The way that smells of fish, full of porters\' shouts. The way you just came.' },
          A: { jp: '{潮|しお} と タール の {匂|にお}い が {満|み}ち 、 {荷札|にふだ} の {字|じ} が {騒|さわ}がしい ほう 。', en: 'The way thick with salt and tar, where the cargo tags are noisy with writing.' },
        } },
      { dir: 'north, up the hill', to: 'road', why: 'Up the hill to the lantern road and the other towns.',
        clue: {
          F: { jp: 'うえ の ほう 。 ほか の まち へ いく みち 。', en: 'Uphill. The road to other towns.' },
          E: { jp: '{坂|さか} を {上|のぼ}る と 、 {灯|ひ} の {道|みち} に {出|で}る 。 {他|ほか} の {町|まち} へ {続|つづ}く {道|みち} だ 。', en: 'Climb the slope and you reach the lantern road, which leads to other towns.' },
          I: { jp: '{灯籠|とうろう} の {並|なら}ぶ {坂|さか} を {上|のぼ}れば 、 {葦|あし}ノ{瀬|せ} や {灰実|はいみ} の {里|さと} へ {通|つう}じる 。', en: 'Climb the lantern-lined slope and it leads on to Reedwake or Cinder Orchard.' },
          A: { jp: '{丘|おか} を {越|こ}え 、 {灯籠|とうろう} を {辿|たど}れば 、 {町|まち} から {町|まち} へ と {通|つう}じる {道|みち} に {出|で}る 。', en: 'Over the hill and follow the lanterns, and you come to the road that runs from town to town.' },
        } },
    ],
  };

  A['sg.a_history'] = {
    type: 'history', title: { jp: '{鐘|かね} の {鳴|な}る {島|しま}', en: 'The island with the bell' }, teller: 'tetsu', item: 'c:sg_history', note: 'sg_archive_story',
    fragments: [
      { F: { jp: 'こども の ころ 、 しま に は しょこ が あった 。', en: 'When I was a boy, there was an archive on the island.', short: 'しょこ が あった' },
        E: { jp: '{子|こ}ども の {頃|ころ} 、 {島|しま} に は まだ {書庫|しょこ} が {建|た}って いた 。', en: 'When I was a boy, the archive still stood on the island.', short: '{書庫|しょこ} が {建|た}って いた' },
        I: { jp: '{俺|おれ} が {子|こ}ども の {頃|ころ} は 、 あの {島|しま} に まだ {書庫|しょこ} が {建|た}って いて な 。', en: 'When I was a boy, the archive was still standing on that island.', short: 'まだ {書庫|しょこ} が {建|た}って いた' },
        A: { jp: '{物心|ものごころ} ついた {頃|ころ} に は 、 あの {島|しま} に は {既|すで}に {書庫|しょこ} が {構|かま}えて あった 。', en: 'As far back as I can remember, the archive already stood on that island.', short: '{既|すで}に {書庫|しょこ} が あった' } },
      { F: { jp: 'てがみ を わける たび に 、 かね が なった 。', en: 'Every time letters were sorted, a bell rang.', short: 'かね が なった' },
        E: { jp: '{手紙|てがみ} を {仕分|しわ}ける たび に 、 {島|しま} の {鐘|かね} が {鳴|な}った 。', en: 'Every time letters were sorted, the island bell rang.', short: '{鐘|かね} が {鳴|な}った' },
        I: { jp: '{手紙|てがみ} の {仕分|しわ}け が {済|す}む たび に 、 {鐘|かね} が {一|ひと}つ {鳴|な}った もん だ 。', en: 'Each time a batch of letters was sorted, the bell would ring once.', short: '{仕分|しわ}け の たび に {鐘|かね}' },
        A: { jp: '{便|びん} が {仕分|しわ}け られる {度|たび} 、 {鐘|かね} が {一打|いちだ} 、 {沖|おき} まで {響|ひび}いた 。', en: 'Every time a post was sorted, the bell struck once and the sound carried out to sea.', short: '{鐘|かね} が {沖|おき} まで {響|ひび}いた' } },
      { F: { jp: 'ある あき 、 おおきな なみ で しま が しずんだ 。', en: 'One autumn, a great wave sank the island.', short: 'しま が しずんだ' },
        E: { jp: 'ある {秋|あき} の {高潮|たかしお} で 、 {島|しま} は {一晩|ひとばん} で {沈|しず}んだ 。', en: 'One autumn a storm surge sank the island overnight.', short: '{島|しま} が {沈|しず}んだ' },
        I: { jp: 'ところが ある {秋|あき} 、 {高潮|たかしお} が {来|き}て 、 {島|しま} は {一晩|ひとばん} の うち に {沈|しず}んじまった 。', en: 'Then one autumn a storm surge came and the island went under in a single night.', short: '{一晩|ひとばん} で {沈|しず}んだ' },
        A: { jp: 'だが 、 ある {年|とし} の {秋|あき} 、 {高潮|たかしお} が {島|しま} を {一夜|いちや} に して {呑|の}み{込|こ}んだ 。', en: 'But one autumn, a storm surge swallowed the island in a single night.', short: '{一夜|いちや} に して {呑|の}まれた' } },
      { F: { jp: 'それ から 、 かね の おと は きこえない 。', en: 'Since then, no one has heard the bell.', short: 'かね は きこえない' },
        E: { jp: 'それ から は 、 {鐘|かね} の {音|おと} を {聞|き}いた {者|もの} は いない 。', en: 'Since then, no one has heard the bell.', short: 'もう {鐘|かね} は {聞|き}こえない' },
        I: { jp: 'それっきり 、 {鐘|かね} の {音|おと} を {聞|き}いた って {奴|やつ} は {一人|ひとり} も いない 。', en: 'And that was that — not one soul has heard the bell since.', short: 'それっきり {聞|き}こえない' },
        A: { jp: '{以来|いらい} 、 {鐘|かね} の {音|おと} を {耳|みみ} に した {者|もの} は 、 {誰一人|だれひとり} と して いない 。', en: 'Since then, not a single person has heard the bell.', short: '{以来|いらい} {誰|だれ} も {聞|き}いて いない' } },
    ],
    question: {
      F: { kind: 'choose', item: 'c:sg_history', prompt: { en: 'When did the bell ring?' },
        options: [{ jp: 'てがみ を わける とき', en: 'When letters were sorted', ok: true }, { jp: 'ふね が でる とき', en: 'When boats left', ok: false, why: no('Tetsu said たび に — each time letters were sorted.') }, { jp: 'あめ の ひ', en: 'On rainy days', ok: false, why: no('Not mentioned.') }] },
      E: { kind: 'choose', item: 'c:sg_history', prompt: { en: 'When did the bell ring?' },
        options: [{ jp: '{手紙|てがみ} を {仕分|しわ}ける たび に', en: 'Every time letters were sorted', ok: true }, { jp: '{船|ふね} が {港|みなと} に {着|つ}く たび に', en: 'Every time a boat came in', ok: false, why: no('〜たびに attaches to しわける — sorting.') }, { jp: '{高潮|たかしお} の {夜|よる} だけ', en: 'Only on the night of the surge', ok: false, why: no('After the surge it never rang again.') }] },
      I: { kind: 'choose', item: 'c:sg_history', prompt: { en: 'What does それっきり tell you?' },
        options: [{ jp: 'その {時|とき} を {最後|さいご} に 、 {二度|にど} と {聞|き}こえなかった 。', en: 'After that time, it was never heard again.', ok: true }, { jp: 'それ から {少|すこ}し の {間|あいだ} だけ {聞|き}こえた 。', en: 'It was heard for a little while afterwards.', ok: false, why: no('っきり means "only that and no more".') }, { jp: '{鐘|かね} は {一|ひと}つ しか なかった 。', en: 'There was only one bell.', ok: false, why: no('True perhaps, but not what それっきり means.') }] },
      A: { kind: 'choose', item: 'c:sg_history', prompt: { en: 'Which detail suggests the archive valued quiet even before it sank?' },
        options: [{ jp: '{鐘|かね} は {仕分|しわ}け の {時|とき} に {一打|いちだ} だけ 。 {他|ほか} に {音|おと} の {話|はなし} は {出|で}て こない 。', en: 'The bell struck only once per sorting; no other sound is ever mentioned.', ok: true }, { jp: '{鐘|かね} の {音|おと} が {沖|おき} まで {響|ひび}いた 。', en: 'The bell carried out to sea.', ok: false, why: no('That is about reach, not quiet.') }, { jp: '{高潮|たかしお} で {沈|しず}んだ 。', en: 'It sank in a storm surge.', ok: false, why: no('That is how it ended, not what it valued.') }] },
    },
  };

  // ---- drills (Saltglass region) -----------------------------------------------------------------------------
  const D = [];
  const W = (id, lv, item, en, answer, kanji, explain, extra) => D.push(Object.assign({ id: 'sg.d_' + id, lv, tags: ['saltglass'], kind: 'write', item, prompt: { en }, answer, accept: kanji ? [answer, kanji] : [answer], mode: 'reading', explain }, extra || {}));
  const Q = (id, lv, item, en, options, explain, ctx) => D.push(Object.assign({ id: 'sg.d_' + id, lv, tags: ['saltglass'], kind: 'choose', item, prompt: { en }, options, explain }, ctx ? { ctx } : {}));
  const O = (id, lv, item, en, tiles, hint, alts) => D.push({ id: 'sg.d_' + id, lv, tags: ['saltglass'], kind: 'order', item, prompt: { en }, tiles, answer: tiles.slice(), alts, orderHint: { en: hint } });

  // Foundations: harbour words in kana
  W('umi', 'F', 'v:海', 'Write "sea" (umi).', 'うみ', '{海|うみ}', { jp: '{海|うみ}', en: 'うみ — sea.' });
  W('fune', 'F', 'v:船', 'Write "boat" (fune).', 'ふね', '{船|ふね}', { jp: '{船|ふね}', en: 'ふね — boat, ship.' });
  W('sakana', 'F', 'v:魚', 'Write "fish" (sakana).', 'さかな', '{魚|さかな}', { jp: '{魚|さかな}', en: 'さかな — fish.' });
  W('kaze', 'F', 'v:風', 'Write "wind" (kaze).', 'かぜ', '{風|かぜ}', { jp: '{風|かぜ}', en: 'かぜ — wind.' });
  W('nawa', 'F', 'v:縄', 'Write "rope" (nawa).', 'なわ', '{縄|なわ}', { jp: '{縄|なわ}', en: 'なわ — rope.' });
  W('ami', 'F', 'v:網', 'Write "net" (ami).', 'あみ', '{網|あみ}', { jp: '{網|あみ}', en: 'あみ — (fishing) net.' });
  W('suna', 'F', 'v:砂', 'Write "sand" (suna).', 'すな', '{砂|すな}', { jp: '{砂|すな}', en: 'すな — sand.' });
  W('shio', 'F', 'v:潮', 'Write "tide" (shio).', 'しお', '{潮|しお}', { jp: '{潮|しお}', en: 'しお — tide; also seawater. (The town is しおがらす.)' });
  W('namae', 'F', 'v:名前', 'Write "name" (namae).', 'なまえ', '{名前|なまえ}', { jp: '{名前|なまえ}', en: 'なまえ — name.' });
  Q('fune_q', 'F', 'v:船', 'Which word means "boat"?', [
    { jp: 'ふね', ok: true }, { jp: 'はね', ok: false, why: no('はね is a feather or wing.') }, { jp: 'ふく', ok: false, why: no('ふく is clothes (or to blow).') },
  ], { jp: '{船|ふね}', en: 'ふね — boat.' });
  Q('umi_q', 'F', 'v:海', 'Which word means "sea"?', [
    { jp: 'うみ', ok: true }, { jp: 'うし', ok: false, why: no('うし is a cow.') }, { jp: 'くみ', ok: false, why: no('くみ is a group or class.') },
  ], { jp: '{海|うみ}', en: 'うみ — sea.' });
  Q('mae_f', 'F', 'g:mae_ato', 'The ferry leaves at 3 (さんじ). You must be there before (まえ). When?', [
    { jp: 'にじ', en: '2 o\'clock', ok: true }, { jp: 'よじ', en: '4 o\'clock', ok: false, why: no('That is after three.') },
  ], { en: 'まえ — before.' });

  // Elementary: particles, times, counters, requests
  const J = (jp) => ({ jp, en: '' });
  Q('ni_dest', 'E', 'g:prt_ni', 'Choose the particle for "I\'m going to the lighthouse".', [
    { jp: 'に', ok: true }, { jp: 'へ', ok: true }, { jp: 'を', ok: false, why: no('を marks an object, not a destination.') }, { jp: 'で', ok: false, why: no('で marks where an action happens.') },
  ], { en: 'に or へ can mark a destination with いく.' }, J('{灯台|とうだい} ＿ {行|い}きます 。'));
  Q('de_place', 'E', 'g:prt_de', 'Choose the particle for "She sells fish at the market".', [
    { jp: 'で', ok: true }, { jp: 'に', ok: false, why: no('に marks where something IS; selling is an action — で.') }, { jp: 'を', ok: false, why: no('を already marks the fish.') },
  ], { en: 'で marks the place where an action happens.' }, J('{市場|いちば} ＿ {魚|さかな} を {売|う}ります 。'));
  Q('kara_made', 'E', 'g:prt_kara_made', 'When is the causeway out?', [
    { en: 'From two until four', ok: true }, { en: 'Only at two and at four', ok: false, why: no('から…まで marks a span.') }, { en: 'After four', ok: false, why: no('まで means until.') },
  ], { en: 'から = from, まで = until.' }, J('{二時|にじ} から {四時|よじ} まで 、 {道|みち} が {出|で}ます 。'));
  Q('mae_e', 'E', 'g:mae_ato', 'What should you do?', [
    { en: 'Come back before high tide', ok: true }, { en: 'Come back after high tide', ok: false, why: no('まえ = before; あと = after.') }, { en: 'Wait for high tide', ok: false, why: no('かえって ください — please come back.') },
  ], { jp: '〜の {前|まえ} に', en: 'Before ….' }, J('{満潮|まんちょう} の {前|まえ} に {帰|かえ}って ください 。'));
  Q('ato_e', 'E', 'g:mae_ato', 'When did the labels vanish?', [
    { en: 'After the storm', ok: true }, { en: 'Before the storm', ok: false, why: no('あと = after.') }, { en: 'During the storm', ok: false, why: no('"During" would be あいだ or さいちゅう.') },
  ], { jp: '〜の {後|あと}', en: 'After ….' }, J('{嵐|あらし} の {後|あと} 、 ラベル が {消|き}えました 。'));
  Q('counter_tsu', 'E', 'g:counters', 'How do you say "three (things)" with the native counter?', [
    { jp: 'みっつ', ok: true }, { jp: 'よっつ', ok: false, why: no('よっつ is four.') }, { jp: 'ふたつ', ok: false, why: no('ふたつ is two.') },
  ], { en: 'ひとつ, ふたつ, みっつ, よっつ…' });
  Q('counter_hai', 'E', 'g:counters', 'How many?', [
    { en: 'Two cups', ok: true }, { en: 'Twelve cups', ok: false, why: no('にはい is two cups; はい counts cups and bowls.') }, { en: 'Two pots', ok: false, why: no('はい counts cupfuls or bowlfuls, not pots.') },
  ], { jp: '{一杯|いっぱい} ・ {二杯|にはい} ・ {三杯|さんばい}', en: 'はい (ばい, ぱい) counts cupfuls and bowlfuls.' }, J('お{茶|ちゃ} を {二杯|にはい} ください 。'));
  O('tekudasai', 'E', 'g:v_te_kudasai', 'Order it: "Please tell me the tide times."', ['{潮|しお}', 'の', '{時間|じかん}', 'を', '{教|おし}えて', 'ください'], 'Noun phrase with の, object を, then て-form + ください.');
  O('ni_iku', 'E', 'g:prt_ni', 'Order it: "I will go to the harbour tomorrow."', ['{明日|あした}', '{港|みなと}', 'に', '{行|い}きます'], 'Time first, then place + に, verb last.', [['{港|みなと}', 'に', '{明日|あした}', '{行|い}きます']]);
  W('tegami', 'E', 'v:手紙', 'Write "letter" (the kind you post).', 'てがみ', '{手紙|てがみ}', { jp: '{手紙|てがみ}', en: 'てがみ — letter.' });
  W('minato', 'E', 'v:港', 'Write "harbour".', 'みなと', '{港|みなと}', { jp: '{港|みなと}', en: 'みなと — harbour, port.' });
  W('kiri', 'E', 'v:霧', 'Write "fog".', 'きり', '{霧|きり}', { jp: '{霧|きり}', en: 'きり — fog, mist.' });
  W('nami', 'E', 'v:波', 'Write "wave".', 'なみ', '{波|なみ}', { jp: '{波|なみ}', en: 'なみ — wave.' });
  W('souko', 'E', 'v:倉庫', 'Write "warehouse".', 'そうこ', '{倉庫|そうこ}', { jp: '{倉庫|そうこ}', en: 'そうこ — warehouse.' });

  // Intermediate: passive, hearsay, はず, conditions, 〜なくていい
  Q('passive', 'I', 'g:passive', 'Who switched the labels?', [
    { en: 'The sentence doesn\'t say.', ok: true }, { en: 'The labels switched themselves.', ok: false, why: no('〜られた is passive: something was done to the labels by someone unnamed.') }, { en: 'The speaker did.', ok: false, why: no('The passive leaves the doer out; it doesn\'t name the speaker.') },
  ], { jp: '〜られる （{受身|うけみ}）', en: 'The passive lets you leave out who did it.' }, J('ラベル が {貼|は}り{替|か}えられた 。'));
  Q('sou_hear', 'I', 'g:sou_hear', 'How does the speaker know?', [
    { en: 'They heard it from someone.', ok: true }, { en: 'They saw it happen.', ok: false, why: no('Plain form + そうだ is hearsay: "I hear that…".') }, { en: 'They think it looks likely.', ok: false, why: no('That would be the stem + そう: ながされそう.') },
  ], { jp: '〜そう だ （{伝聞|でんぶん}）', en: 'Plain form + そうだ = "I hear that…".' }, J('{油|あぶら} は {嵐|あらし} で {流|なが}された そう だ 。'));
  Q('hazu', 'I', 'g:hazu', 'What does はずだった tell you?', [
    { en: 'Eight cans were expected — but that didn\'t happen.', ok: true }, { en: 'Eight cans definitely arrived.', ok: false, why: no('はずだった often implies the expectation wasn\'t met.') }, { en: 'Someone wants eight cans.', ok: false, why: no('はず is about expectation, not desire.') },
  ], { jp: '〜はず だった', en: 'Was supposed to … (but didn\'t).' }, J('{油|あぶら} は {八缶|はちかん} {届|とど}く はず だった 。'));
  Q('nakuteii', 'I', 'g:v_temo_ii', 'Which means "You don\'t have to write the address"?', [
    { jp: '{宛名|あてな} は {書|か}かなくて いい 。', ok: true }, { jp: '{宛名|あてな} は {書|か}かないで 。', ok: false, why: no('〜ないで asks someone not to.') }, { jp: '{宛名|あてな} は {書|か}かなければ ならない 。', ok: false, why: no('That means you MUST write it.') },
  ], { en: '〜なくていい removes an obligation.' });
  Q('tara', 'I', 'g:cond_tara', 'When will they cross?', [
    { en: 'Once the fog lifts', ok: true }, { en: 'Before the fog lifts', ok: false, why: no('〜たら = when/if (after) ….') }, { en: 'Even if the fog stays', ok: false, why: no('That would be 〜ても.') },
  ], { jp: '〜たら', en: '"When/if …" — the second action follows the first.' }, J('{霧|きり} が {晴|は}れたら 、 {島|しま} へ {渡|わた}ろう 。'));
  Q('kamo', 'I', 'g:kamo', 'What does this say?', [
    { en: 'The name might be in the archive.', ok: true }, { en: 'The name is definitely in the archive.', ok: false, why: no('かもしれない = maybe.') }, { en: 'The name isn\'t in the archive.', ok: false, why: no('Nothing negative here.') },
  ], { en: '〜かもしれない — might, maybe.' }, J('{名前|なまえ} は {書庫|しょこ} に ある かも しれない 。'));
  Q('tame', 'I', 'g:tame', 'Why did he borrow money?', [
    { en: 'To repair his mother\'s boat', ok: true }, { en: 'Because his mother\'s boat was repaired', ok: false, why: no('〜ために after a plain verb = in order to.') }, { en: 'Instead of repairing the boat', ok: false, why: no('ために shows purpose.') },
  ], { jp: '〜ため に', en: 'Plain verb + ために = in order to.' }, J('{母|はは} の {船|ふね} を {直|なお}す ため に 、 お{金|かね} を {借|か}りた 。'));
  O('passive_o', 'I', 'g:passive', 'Order it: "The letters were sent to the archive."', ['{手紙|てがみ}', 'は', '{書庫|しょこ}', 'へ', '{送|おく}られた'], 'Topic, destination with へ, then the passive verb.');
  W('todokeru', 'I', 'v:届ける', 'Write the verb "to deliver" (dictionary form).', 'とどける', '{届|とど}ける', { jp: '{届|とど}ける', en: 'とどける — to deliver.' });
  W('atesaki', 'I', 'v:宛先', 'Write the word for "address / destination (of mail)".', 'あてさき', '{宛先|あてさき}', { jp: '{宛先|あてさき}', en: 'あてさき — where something is addressed to.' });

  // Advanced: nuance, register, written style
  Q('nisuginai', 'A', 'g:adv_ni_suginai', 'What is the speaker\'s point?', [
    { en: 'The lack of errors is merely because nothing is delivered.', ok: true }, { en: 'Errors are rare because delivery is excellent.', ok: false, why: no('に すぎない belittles the reason: "nothing more than".') }, { en: 'Nothing is delivered because of errors.', ok: false, why: no('Cause and effect reversed.') },
  ], { jp: '〜に {過|す}ぎない', en: 'Nothing more than ….' }, J('{誤配|ごはい} が ない の は 、 {何|なに} も {届|とど}かない から に すぎない 。'));
  Q('wakedewa', 'A', 'g:adv_wake_dewa_nai', 'What is Wataru doing here?', [
    { en: 'Denying a conclusion the listener might reach — though it is in fact true.', ok: true }, { en: 'Saying he has no money at all.', ok: false, why: no('He says the opposite of admitting it.') }, { en: 'Asking for a discount.', ok: false, why: no('No request here.') },
  ], { jp: '〜という わけ では ない', en: '"It isn\'t (exactly) that…" — a partial denial. Listeners often hear the opposite.' }, J('{節約|せつやく} と いう わけ では ない ん です が 。'));
  Q('kanenai', 'A', 'g:adv_kanenai', 'What is the warning?', [
    { en: 'If you hurry, the tide could well catch your feet.', ok: true }, { en: 'If you hurry, the tide can\'t catch you.', ok: false, why: no('かねない looks negative but means "could (unfortunately) happen".') }, { en: 'Hurry, or the tide will catch you.', ok: false, why: no('The warning is against hurrying.') },
  ], { jp: '〜かねない', en: 'There is a risk that … (something bad).' }, J('{急|いそ}げば 、 {満|み}ち{潮|しお} に {足|あし} を {取|と}られ かねない 。'));
  Q('kagiranai', 'A', 'c:sg_kagiranai', 'What does this say about the causeway?', [
    { en: 'It won\'t necessarily appear as the table says.', ok: true }, { en: 'It never appears as the table says.', ok: false, why: no('とは かぎらない = not necessarily, not never.') }, { en: 'It always appears as the table says.', ok: false, why: no('It qualifies "always".') },
  ], { jp: '〜とは {限|かぎ}らない', en: 'Not necessarily ….' }, J('{表|ひょう} どおり に {道|みち} が {現|あらわ}れる とは {限|かぎ}らない 。'));
  Q('itadakeru', 'A', 'g:keigo_kenjo', 'Most appropriate in a letter asking a lender for time:', [
    { jp: 'ご{猶予|ゆうよ} を いただけます と {幸|さいわ}い です 。', ok: true }, { jp: '{待|ま}って もらえる と {助|たす}かる 。', ok: false, why: no('Plain style — too casual for a creditor.') }, { jp: '{待|ま}つ べき です 。', ok: false, why: no('Tells them what they should do. Not a request.') },
  ], { jp: '〜いただけます と {幸|さいわ}い です', en: 'A formal, humble way to ask: "I would be grateful if…".' });
  Q('minasu', 'A', 'c:sg_minasu', 'What happens to the letter?', [
    { en: 'It is treated as returned, whether or not it actually was.', ok: true }, { en: 'It is actually returned.', ok: false, why: no('みなす = to deem; it describes how it is recorded.') }, { en: 'It is examined again.', ok: false, why: no('It contains み- like みる (see), but みなす means "regard as".') },
  ], { jp: '〜と {見|み}なす', en: 'To deem, to treat as.' }, J('{返送|へんそう} した もの と {見|み}なす 。'));
  Q('zaruwoenai', 'A', 'g:adv_zaru_wo_enai', 'What does this mean?', [
    { en: 'We have no choice but to tell the harbourmaster.', ok: true }, { en: 'We mustn\'t tell the harbourmaster.', ok: false, why: no('ざるを えない = cannot avoid doing.') }, { en: 'We could tell the harbourmaster if we like.', ok: false, why: no('No choice is implied.') },
  ], { jp: '〜ざる を {得|え}ない', en: 'Cannot help but …, have no choice but to ….' }, J('{港長|こうちょう} に {話|はな}さざる を {得|え}ない 。'));
  O('kenjo_o', 'A', 'g:keigo_kenjo', 'Order the formal apology line: "I am truly sorry for the trouble I have caused."', ['ご{迷惑|めいわく}', 'を', 'お{掛|か}け', 'して', '{誠|まこと} に', '{申|もう}し{訳|わけ}', 'ございません'], 'お + stem + して is humble; the apology comes last.', [['{誠|まこと} に', 'ご{迷惑|めいわく}', 'を', 'お{掛|か}け', 'して', '{申|もう}し{訳|わけ}', 'ございません']]);
  C.addDrills(D);
})(RB.content);
