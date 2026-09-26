/* Chapter 2 Inkweaving encounters: harbour and Drowned Archive foes, and the
 * Tide Clerk. Every fight is winnable with Unravel alone; counters that the
 * player may know by now: まもる (ward), みず, ひかり, いやす, かぜ (wind), なわ (bind). */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const E = (id, d) => (C.enemies[id] = Object.assign({ region: 'saltglass', bg: 'archive', music: 'battle', boss: false }, d));
  const POOL = {
    tags: ['saltglass'],
    F: ['v:海', 'v:船', 'v:魚', 'v:風', 'v:名前', 'v:道'],
    E: ['v:港', 'v:手紙', 'v:波', 'v:倉庫', 'v:霧', 'v:砂', 'v:郵便', 'g:prt_ni', 'g:mae_ato'],
    I: ['v:潮', 'v:灯台', 'v:届ける', 'v:宛先', 'v:縄', 'v:貼る', 'g:passive', 'g:hazu'],
    A: ['v:差出人', 'v:宛名', 'v:書庫', 'g:adv_wake_dewa_nai', 'g:adv_ni_suginai'],
  };

  E('sg.crab', {
    name: { en: 'Label Crab', jp: 'ラベル{蟹|がに}' }, art: 'crab', artOpts: { col: '#c86a4a' }, look: { custom: 'sg_crab', col: '#c86a4a' },
    bg: 'saltglass', knots: 2, pool: POOL,
    pattern: ['strike', 'rest', 'mend'],
    intro: { jp: '{剥|は}がれた ラベル を {背負|せお}った {蟹|かに} が 、 はさみ を {鳴|な}らす 。', en: 'A crab with a peeled-off label stuck to its shell clacks its claws at you.' },
    settle: { jp: '{蟹|かに} は ラベル を {置|お}いて 、 {横歩|よこある}き で {去|さ}って いった 。', en: 'The crab puts the label down and scuttles off sideways.' },
  });
  E('sg.crane', {
    name: { en: 'Soggy Paper Crane', jp: 'しめった {折|お}り{鶴|づる}' }, art: 'crane', artOpts: { col: '#e4e0cc' }, look: { custom: 'crane', col: '#e4e0cc' },
    knots: 2, pool: POOL,
    pattern: ['shroud', 'strike', 'rest'],
    intro: { jp: '{湿|しめ}った {紙|かみ} の {鶴|つる} が 、 {重|おも}たげ に {羽|は}ばたく 。 {羽|はね} に {誰|だれ} か の {名前|なまえ} が {滲|にじ}んで いる 。', en: 'A damp paper crane flaps heavily towards you. Someone\'s name has run across its wings.' },
    settle: { jp: '{鶴|つる} は ほどけて 、 {一枚|いちまい} の {紙|かみ} に {戻|もど}った 。', en: 'The crane unfolds and becomes a single sheet of paper again.' },
  });
  E('sg.blot', {
    name: { en: 'Runaway Ink', jp: 'にじんだ {墨|すみ}' }, art: 'blot', artOpts: { col: '#1e2440' }, look: { custom: 'blot', col: '#1e2440' },
    knots: 3, pool: POOL,
    pattern: ['sweep', 'mend', 'rest'],
    intro: { jp: '{水|みず} に {溶|と}けた {墨|すみ} が {集|あつ}まって 、 {床|ゆか}から {起|お}き{上|あ}がった 。', en: 'Ink washed out of a hundred pages has pooled together and risen off the floor.' },
    settle: { jp: '{墨|すみ} は {静|しず}か に {広|ひろ}がって 、 ただ の {水|みず}たまり に なった 。', en: 'The ink spreads out quietly into an ordinary puddle.' },
  });
  E('sg.fogwisp', {
    name: { en: 'Harbour Fog', jp: '{港|みなと} の {霧|きり}' }, art: 'wisp', artOpts: { col: '#c8d4e0' }, look: { custom: 'wisp', col: '#c8d4e0' },
    bg: 'saltglass', knots: 2, pool: POOL,
    pattern: ['shroud', 'rest', 'strike'],
    intro: { jp: '{風|かぜ} の ない {所|ところ} に だけ {溜|た}まる {霧|きり} が 、 {形|かたち} を {持|も}った 。', en: 'Fog that only gathers where there is no wind has taken a shape.' },
    settle: { jp: '{霧|きり} は {薄|うす}れて 、 {向|む}こう の {岩|いわ} が {見|み}えた 。', en: 'The fog thins, and you can see the rocks beyond it again.' },
  });
  E('sg.moth', {
    name: { en: 'Postmark Moth', jp: '{消印|けしいん}{蛾|が}' }, art: 'moth', artOpts: { col: '#b0b8d0', col2: '#6a7090' }, look: { custom: 'moth', col: '#b0b8d0' },
    knots: 3, pool: POOL,
    pattern: ['charge', 'strike', 'rest'],
    intro: { jp: '{羽|はね} に {丸|まる}い {消印|けしいん} の {模様|もよう} が ある {蛾|が}だ 。 {押|お}された {所|ところ}から {文字|もじ} が {消|き}えて いく 。', en: 'A moth with round postmarks on its wings. Wherever it lands, the writing fades.' },
    settle: { jp: '{蛾|が} は {灯|あか}り の ほう へ ふらふら と {飛|と}んで いった 。', en: 'The moth flutters away towards the lamplight.' },
  });
  E('sg.golem', {
    name: { en: 'Ledger Heap', jp: '{帳簿|ちょうぼ} の {山|やま}' }, art: 'golem', artOpts: { col: '#8a8aa0', core: '#e8e0cc' }, look: { custom: 'golem', col: '#8a8aa0' },
    knots: 4, pool: POOL,
    pattern: ['charge', 'strike', 'flood', 'rest'],
    intro: { jp: '{水|みず} を {吸|す}った {帳簿|ちょうぼ} が {積|つ}み{重|かさ}なって 、 {立|た}ち{上|あ}がった 。 {重|おも}そう だ 。', en: 'Waterlogged ledgers have stacked themselves up into something that stands. It looks heavy.' },
    settle: { jp: '{帳簿|ちょうぼ} は {崩|くず}れて 、 {床|ゆか} に {並|なら}んだ 。 {数字|すうじ} が {少|すこ}し {読|よ}める 。', en: 'The ledgers slump into a row on the floor. A few of the figures are readable again.' },
  });

  // A lost letter that only wants to be delivered — settle it by answering.
  const whoFor = (lv) => ({
    F: { kind: 'choose', item: 'c:sg_letter_who', prompt: { en: 'The letter smells of lamp oil and asks to go "to the light by the sea". Who is it for?' },
      options: [
        { jp: 'とうだい の ゲンゾウ', en: 'Genzō at the lighthouse', ok: true },
        { jp: 'さかなや の キヨ', en: 'Kiyo at the fish stall', ok: false, why: { en: 'Kiyo sells fish; nothing here is about fish.' } },
        { jp: 'ガラス こうぼう の アサヒ', en: 'Asahi at the glassworks', ok: false, why: { en: 'A furnace is a light of sorts — but "by the sea", and lamp oil?' } },
      ], explain: { en: 'とうだい is a lighthouse: the light by the sea.' } },
    E: { kind: 'choose', item: 'c:sg_letter_who', ctx: { jp: '{海|うみ} の {光|ひかり} を {守|まも}る {人|ひと} へ 。 {油|あぶら} を {八缶|はちかん} {送|おく}ります 。', en: 'To the one who keeps the light of the sea. I am sending eight cans of oil.' },
      prompt: { en: 'Who is this letter for?' },
      options: [
        { jp: '{灯台|とうだい} の ゲンゾウ', en: 'Genzō at the lighthouse', ok: true },
        { jp: '{渡|わた}し{船|ぶね} の テツ', en: 'Tetsu the ferryman', ok: false, why: { en: 'Tetsu works on the sea, but he doesn\'t keep a light.' } },
        { jp: '{潮見|しおみ} の シオリ', en: 'Shiori the tide-keeper', ok: false, why: { en: 'Shiori watches the sea; she doesn\'t burn eight cans of oil.' } },
      ], explain: { jp: '{光|ひかり} を {守|まも}る ＝ keeps the light', en: 'The one who "keeps the light of the sea" and needs oil: the lighthouse keeper.' } },
    I: { kind: 'choose', item: 'c:sg_letter_who', ctx: { jp: '{先月|せんげつ} の {分|ぶん} と {合|あ}わせて {八缶|はちかん} お{送|おく}り します 。 {冬|ふゆ} の {夜|よる} は {長|なが}い ので 、 {灯|ひ} を {絶|た}やさない よう に 。', en: 'Together with last month\'s share, I am sending eight cans. Winter nights are long, so don\'t let the light go out.' },
      prompt: { en: 'Who should receive this letter?' },
      options: [
        { jp: '{灯台|とうだい} の ゲンゾウ', en: 'Genzō at the lighthouse', ok: true },
        { jp: 'かもめ{亭|てい} の タマエ', en: 'Tamae at the Gull', ok: false, why: { en: 'An inn has lamps, but "don\'t let the light go out" on long nights is a keeper\'s duty.' } },
        { jp: '{倉庫|そうこ} の ワタル', en: 'Wataru at the warehouse', ok: false, why: { en: 'Wataru handles the cans, but the letter is for whoever burns them.' } },
      ], explain: { jp: '{灯|ひ} を {絶|た}やさない', en: '"Keep the light from going out": the lighthouse.' } },
    A: { kind: 'choose', item: 'c:sg_letter_who', ctx: { jp: '{不足分|ふそくぶん} は {追|お}って {届|とど}けます 。 {岬|みさき} の {灯|ひ} が {一晩|ひとばん}でも {途切|とぎ}れれば 、 {沖|おき} の {船|ふね} は {帰|かえ}る {港|みなと} を {失|うしな}う の です から 。', en: 'The shortfall will follow shortly. If the light on the point fails for even one night, the boats at sea lose the harbour they are coming home to.' },
      prompt: { en: 'Who is the letter addressed to, and what does ふそくぶん ("the shortfall") tell you?' },
      options: [
        { jp: 'ゲンゾウ 。 {油|あぶら} が {足|た}りなかった こと を {送|おく}り{主|ぬし} も {知|し}って いる 。', en: 'Genzō — and the sender knows his oil came up short.', ok: true },
        { jp: 'テツ 。 {渡|わた}し{船|ぶね} の {灯|ひ} の {話|はなし}だ 。', en: 'Tetsu — it\'s about the ferry\'s lamp.', ok: false, why: { en: 'みさき の ひ is the light on the point: the lighthouse, not the ferry.' } },
        { jp: 'ゲンゾウ 。 ただ の {季節|きせつ} の {挨拶|あいさつ}だ 。', en: 'Genzō — it\'s just a seasonal greeting.', ok: false, why: { en: 'ふそくぶん (the shortfall) means something was missing from the delivery.' } },
      ], explain: { jp: '{不足分|ふそくぶん} は {追|お}って {届|とど}けます', en: '"The shortfall will be sent on": someone already noticed missing oil.' } },
  })[lv];
  E('sg.letter', {
    name: { en: 'Undelivered Letter', jp: '{届|とど}かない {手紙|てがみ}' }, art: 'sg_letter', look: { custom: 'sg_letter' },
    knots: 3, pool: POOL,
    pattern: ['plea:who', 'rest', 'sweep'],
    intents: {
      'plea:who': {
        text: {
          F: { jp: '「わたし を 、 だれ に とどけて くれる の ？」', en: '"Who will you deliver me to?"' },
          E: { jp: '「{宛名|あてな} が {消|き}えて しまった 。 わたし は {誰|だれ} の {手紙|てがみ}です か 。」', en: '"My address has faded. Whose letter am I?"' },
          I: { jp: '「{宛名|あてな} が {読|よ}めない まま {三年|さんねん} も {待|ま}った 。 {中身|なかみ} を {読|よ}めば 、 {分|わ}かる でしょう ？」', en: '"I\'ve waited three years with an address no one can read. If you read what\'s inside, you\'ll know, won\'t you?"' },
          A: { jp: '「{宛名|あてな}こそ {失|うしな}った が 、 {用件|ようけん}まで {失|うしな}った わけ では ない 。 {読|よ}んで みて くれ 。」', en: '"I may have lost my address, but I haven\'t lost my errand. Read me."' },
        },
        answer: { F: whoFor('F'), E: whoFor('E'), I: whoFor('I'), A: whoFor('A') },
      },
    },
    intro: { jp: '{封筒|ふうとう} が ひとり で {浮|う}かんで いる 。 {宛名|あてな} の {所|ところ}だけ が {真|ま}っ{白|しろ}だ 。', en: 'An envelope is floating by itself. Only the address is completely blank.' },
    settle: { jp: '{手紙|てがみ} は ほっと した よう に {舞|ま}い{降|お}りた 。 {宛名|あてな} が うっすら {戻|もど}って いる 。 「{灯台|とうだい} ゲンゾウ {様|さま}」 。', en: 'The letter drifts down as if relieved. Its address has faintly come back: "Mr Genzō, the Lighthouse".' },
  });

  // ---- the Tide Clerk -------------------------------------------------------------------------------
  const pick = (opts) => opts;
  const gone = {
    F: { kind: 'choose', item: 'c:sg_clerk_lie', prompt: { en: 'The Clerk holds up a letter to "Genzō, the lighthouse" and says no one by that name exists. What is false?' },
      options: pick([
        { jp: 'ゲンゾウ さん は いる 。 とうだい に いる 。', en: 'Genzō is here — he\'s at the lighthouse.', ok: true },
        { jp: 'てがみ が ぬれて いる 。', en: 'The letter is wet.', ok: false, why: { en: 'True — but that isn\'t what it lied about.' } },
        { jp: 'なまえ が ながい 。', en: 'The name is long.', ok: false, why: { en: 'Length has nothing to do with it. Is the person gone?' } },
      ]), explain: { en: 'You met Genzō this morning. The addressee exists; only the Clerk says otherwise.' } },
    E: { kind: 'choose', item: 'c:sg_clerk_lie', prompt: { en: 'Which part of the Clerk\'s statement is false?' },
      ctx: { jp: '「{宛先|あてさき} の {人|ひと} は もう いません 。」', en: '"The addressee is no longer here."' },
      options: pick([
        { jp: 'ゲンゾウ さん は {今|いま} も {灯台|とうだい} に います 。', en: 'Genzō is still at the lighthouse.', ok: true },
        { jp: '{手紙|てがみ} は {書庫|しょこ} に あります 。', en: 'The letter is in the archive.', ok: false, why: { en: 'That\'s true, and not what it claimed.' } },
        { jp: '{差出人|さしだしにん} は {油屋|あぶらや}です 。', en: 'The sender is an oil merchant.', ok: false, why: { en: 'Also true. What did it say about the addressee?' } },
      ]), explain: { jp: 'もう いません ＝ is not here any more', en: 'もういません claims the person is gone. He isn\'t.' } },
    I: { kind: 'choose', item: 'c:sg_clerk_lie', prompt: { en: 'The Clerk justifies returning the letter. Where is the lie?' },
      ctx: { jp: '「この {名|な} を {呼|よ}ぶ {者|もの} は もう {誰|だれ} も いない 。 よって {差出人|さしだしにん} に {返送|へんそう}する 。」', en: '"No one calls this name any more. It is therefore returned to sender."' },
      options: pick([
        { jp: '{呼|よ}ぶ {人|ひと} は いる 。 テツ が {毎朝|まいあさ} 「ゲンゾウ ！」 と {怒鳴|どな}って いる 。', en: 'People do call it — Tetsu yells "Genzō!" across the quay every morning.', ok: true },
        { jp: '{返送|へんそう} は {差出人|さしだしにん} の {希望|きぼう}だ 。', en: 'The sender asked for it to be returned.', ok: false, why: { en: 'Nothing suggests the sender wanted it back.' } },
        { jp: '{名|な} を {呼|よ}ぶ の は {失礼|しつれい}だ 。', en: 'Calling someone by name is rude.', ok: false, why: { en: 'Irrelevant — the Clerk\'s claim is that no one uses the name.' } },
      ]), explain: { en: 'Its whole argument rests on "no one calls this name" — and you have heard the name called.' } },
    A: { kind: 'choose', item: 'c:sg_clerk_lie', prompt: { en: 'Identify the flaw in the Clerk\'s reasoning.' },
      ctx: { jp: '「{当該|とうがい} の {宛名|あてな} は {既|すで}に {所在|しょざい}{不明|ふめい} で ある 。 {規定|きてい} に より 、 {差出人|さしだしにん} へ {返送|へんそう} の {上|うえ} 、 {本庁|ほんちょう} へ {移管|いかん}する 。」', en: '"The said addressee\'s whereabouts are unknown. Per the regulations, the item is returned to its sender and transferred to the head archive."' },
      options: pick([
        { jp: '「{所在|しょざい}{不明|ふめい}」 なのは {宛名|あてな} を {消|け}した から で あって 、 {人|ひと} が いない から では ない 。', en: 'The whereabouts are "unknown" only because it erased the address — not because the person is missing.', ok: true },
        { jp: '{規定|きてい} が {古|ふる}い ので 、 {従|したが}う {必要|ひつよう} は ない 。', en: 'The regulations are old, so there\'s no need to follow them.', ok: false, why: { en: 'Age isn\'t the problem; the premise is. It manufactured "unknown" itself.' } },
        { jp: '{本庁|ほんちょう} は もう {存在|そんざい}しない 。', en: 'The head archive no longer exists.', ok: false, why: { en: 'The ledger you read says it does — and is still receiving.' } },
      ]), explain: { en: 'A circular argument: it blanks the address, then cites the blank address as grounds to take the letter away.' } },
  };
  const quiet = {
    F: { kind: 'choose', item: 'c:sg_clerk_mirror', prompt: { en: 'The Clerk: "Without names, no one makes mistakes." What is wrong with that?' },
      options: pick([
        { jp: 'なまえ が ないと 、 てがみ が とどかない 。', en: 'Without names, letters never arrive at all.', ok: true },
        { jp: 'まちがい は ない ほう が いい 。', en: 'It\'s better to have no mistakes.', ok: false, why: { en: 'That agrees with the Clerk. What does it cost?' } },
        { jp: 'なまえ は たかい 。', en: 'Names are expensive.', ok: false, why: { en: 'Not the point.' } },
      ]), explain: { en: 'No names, no mistakes — and no deliveries either.' } },
    E: { kind: 'choose', item: 'c:sg_clerk_mirror', prompt: { en: 'What is wrong with the Clerk\'s claim?' },
      ctx: { jp: '「{名前|なまえ} が なければ 、 {誰|だれ} も {間違|まちが}えない 。 {嘘|うそ} も つけない 。」', en: '"Without names, no one gets anything wrong. No one can lie, either."' },
      options: pick([
        { jp: '{名前|なまえ} が ない と 、 {手紙|てがみ} は {誰|だれ} に も {届|とど}かない 。', en: 'Without names, letters reach no one at all.', ok: true },
        { jp: '{嘘|うそ} は {時々|ときどき} {必要|ひつよう}だ 。', en: 'Lies are sometimes necessary.', ok: false, why: { en: 'That doesn\'t answer the Clerk — it just argues about lying.' } },
        { jp: '{名前|なまえ} は {長|なが}すぎる 。', en: 'Names are too long.', ok: false, why: { en: 'Not relevant.' } },
      ]), explain: { en: 'It is "correct" only because nothing happens at all.' } },
    I: { kind: 'choose', item: 'c:sg_clerk_mirror', prompt: { en: 'The Clerk uses what you saw at the warehouse against you. How do you answer?' },
      ctx: { jp: '「ラベル が なければ 、 {貼|は}り{替|か}える {者|もの} も いない 。 {君|きみ}たち が {見|み}た {嘘|うそ} は 、 {名前|なまえ} が ある から {起|お}きた 。」', en: '"Without labels, no one could switch them. The lie you saw happened because names exist."' },
      options: pick([
        { jp: '{嘘|うそ} が {分|わ}かった の も 、 {正|ただ}しい ラベル が あった から だ 。', en: 'We could only see through the lie because the right labels existed.', ok: true },
        { jp: 'ワタル は {嘘|うそ} を ついて いない 。', en: 'Wataru didn\'t lie.', ok: false, why: { en: 'He did — and he owned it. Denying that won\'t answer the Clerk.' } },
        { jp: 'ラベル は {紙|かみ} で できて いる 。', en: 'Labels are made of paper.', ok: false, why: { en: 'True, and beside the point.' } },
      ]), explain: { en: 'Names made the lie possible — and also made the truth findable, and the harm repairable.' } },
    A: { kind: 'choose', item: 'c:sg_clerk_mirror', prompt: { en: 'Choose the reply that exposes what the Clerk leaves out.' },
      ctx: { jp: '「{名|な} が あるから {人|ひと} は {偽|いつわ}り 、 {名|な} が あるから {争|あらそ}う 。 {宛名|あてな} を {消|け}せば 、 {誤配|ごはい} も {嘘|うそ} も {起|お}こり{得|え}ない 。 {違|ちが}う か 。」', en: '"Because there are names, people deceive; because there are names, they quarrel. Erase the addresses and neither misdelivery nor lies can happen. Am I wrong?"' },
      options: pick([
        { jp: '{誤配|ごはい} が {起|お}こり{得|え}ない の は 、 {何|なに} も {届|とど}かない から に すぎない 。', en: 'Misdelivery "can\'t happen" only because nothing is delivered at all.', ok: true },
        { jp: '{確|たし}か に 、 {争|あらそ}い が なくなる なら {仕方|しかた}ない 。', en: 'True — if it ends quarrels, it can\'t be helped.', ok: false, why: { en: 'That concedes the Clerk\'s point instead of answering it.' } },
        { jp: '{宛名|あてな} を {消|け}す の は {法律|ほうりつ}{違反|いはん}だ 。', en: 'Erasing addresses is against the law.', ok: false, why: { en: 'Perhaps, but it avoids the argument. The flaw is in what "no errors" means.' } },
      ]), explain: { jp: '〜に すぎない ＝ nothing more than', en: 'The absence of error is being bought with the absence of delivery.' } },
  };
  const where = {
    F: { kind: 'write', item: 'v:港', ctx: { jp: 'この てがみ は みんな 、 みなと で だされた 。', en: 'Every one of these letters was posted in the harbour.' },
      prompt: { en: 'Tell the Clerk where the letters belong: the harbour (みなと).' },
      answer: 'みなと', accept: ['みなと', '{港|みなと}'], mode: 'reading', explain: { jp: '{港|みなと}', en: 'みなと — harbour.' } },
    E: { kind: 'choose', item: 'c:sg_clerk_plea', prompt: { en: 'What do you tell the Clerk?' },
      options: pick([
        { jp: '{港|みなと} に {返|かえ}して 。 {読|よ}めない {所|ところ} は 、 {町|まち} の {人|ひと} が {読|よ}む 。', en: 'Send them back to the harbour. The townspeople will read what you can\'t.', ok: true },
        { jp: '{全部|ぜんぶ} {捨|す}てて 。', en: 'Throw them all away.', ok: false, why: { en: 'That is what the Clerk has been doing, in its way.' } },
        { jp: '{山|やま} の {書庫|しょこ} に {送|おく}って 。', en: 'Send them to the archive in the mountains.', ok: false, why: { en: 'That\'s exactly where names go to disappear.' } },
      ]), explain: { en: 'The letters belong to the people they were written to, and those people are in Saltglass.' } },
    I: { kind: 'choose', item: 'c:sg_clerk_plea', prompt: { en: 'The Clerk asks where letters with unreadable addresses should go. Your answer:' },
      options: pick([
        { jp: '{読|よ}めない なら 、 {港|みなと} の {人|ひと} に {聞|き}けば いい 。 {中身|なかみ} を {読|よ}めば 、 {分|わ}かる こと も ある 。', en: 'If you can\'t read them, ask the people of the harbour. Reading the contents often tells you.', ok: true },
        { jp: '{規定|きてい}どおり に すれば いい 。', en: 'Do whatever the regulations say.', ok: false, why: { en: 'The regulations are how it got here.' } },
        { jp: '{分|わ}からない なら 、 {差出人|さしだしにん} に {返|かえ}せば いい 。', en: 'If you don\'t know, return them to the sender.', ok: false, why: { en: 'That is what its stamp already says. It is asking for another way.' } },
      ]), explain: { en: 'You did exactly this with the Gull\'s post bag.' } },
    A: { kind: 'choose', item: 'c:sg_clerk_plea', prompt: { en: 'The Clerk admits its rules only cover what to do with unreadable addresses. Which reply best answers what it is really asking?' },
      options: pick([
        { jp: '{規定|きてい} に ない なら 、 {人|ひと} に {頼|たよ}れば いい 。 {宛名|あてな} が {消|き}えて も 、 {待|ま}って いる {人|ひと} は {港|みなと} に いる 。', en: 'If the rules don\'t cover it, rely on people. The address may be gone, but the people waiting are still in the harbour.', ok: true },
        { jp: '{規定|きてい} を {書|か}き{直|なお}せば {済|す}む {話|はなし}だ 。', en: 'Just rewrite the regulations and be done with it.', ok: false, why: { en: 'It is asking what to do now, not for a new rule.' } },
        { jp: 'それ は {私|わたし}たち の {知|し}った こと では ない 。', en: 'That is none of our concern.', ok: false, why: { en: 'Dismissive — and untrue. You came here for these letters.' } },
      ]), explain: { en: 'Its question is not about procedure; it is asking whether anyone will still read them.' } },
  };
  E('sg.tideclerk', {
    name: { en: 'The Tide Clerk', jp: '{潮|しお} の {書記|しょき}' }, art: 'clerk', artOpts: { col: '#3a5a7a' }, look: { custom: 'sg_clerk' },
    boss: true, music: 'boss', knots: 6, pool: POOL,
    pattern: ['strike', 'lie:gone', 'rest', 'charge', 'strike'],
    intents: {
      'lie:gone': {
        power: 2,
        text: {
          F: { jp: '「この なまえ の ひと は もう いない 。 かえす 。」', en: '"No one by this name exists any more. Returned."' },
          E: { jp: '「{宛先|あてさき} の {人|ひと} は もう いません 。 {差出人|さしだしにん} に {返|かえ}します 。」', en: '"The addressee no longer exists. Returning to sender."' },
          I: { jp: '「この {名|な} を {呼|よ}ぶ {者|もの} は もう {誰|だれ} も いない 。 よって {差出人|さしだしにん} に {返送|へんそう}する 。」', en: '"No one calls this name any more. It is therefore returned to sender."' },
          A: { jp: '「{当該|とうがい} の {宛名|あてな} は {既|すで}に {所在|しょざい}{不明|ふめい} で ある 。 {規定|きてい} に より {返送|へんそう}する 。」', en: '"The said addressee\'s whereabouts are unknown. Per regulations: returned."' },
        },
        truth: gone,
      },
      'mirror:quiet': {
        power: 2,
        text: {
          F: { jp: '「なまえ が なければ 、 だれ も まちがえない 。」', en: '"Without names, no one makes mistakes."' },
          E: { jp: '「{名前|なまえ} が なければ 、 {誰|だれ} も {間違|まちが}えない 。 {嘘|うそ} も つけない 。」', en: '"Without names, no one gets anything wrong. No one can lie."' },
          I: { jp: '「{君|きみ}たち が {見|み}た {嘘|うそ} は 、 {名前|なまえ} が ある から {起|お}きた 。」', en: '"The lie you saw happened because names exist."' },
          A: { jp: '「{宛名|あてな} を {消|け}せば 、 {誤配|ごはい} も {嘘|うそ} も {起|お}こり{得|え}ない 。 {違|ちが}う か 。」', en: '"Erase the addresses, and neither misdelivery nor lies can happen. Am I wrong?"' },
        },
        truth: quiet,
      },
      'plea:address': {
        text: {
          F: { jp: '「……この てがみ 、 どこ へ いけば いい ？」', en: '"...Where should these letters go?"' },
          E: { jp: '「……{宛先|あてさき} が {読|よ}めない 。 この {手紙|てがみ} は 、 どこ へ {行|い}けば いい 。」', en: '"...I can\'t read the addresses. Where should these letters go?"' },
          I: { jp: '「……{教|おし}えて くれ 。 {読|よ}めない {宛先|あてさき} の {手紙|てがみ} は 、 どこ へ {届|とど}ければ いい の だ 。」', en: '"...Tell me. Where do you deliver a letter whose address can\'t be read?"' },
          A: { jp: '「……{規定|きてい} に は 、 {読|よ}めない {宛名|あてな} の {扱|あつか}い しか {書|か}いて いない 。 {君|きみ}なら 、 どう する 。」', en: '"...The regulations only say how to dispose of unreadable addresses. What would you do?"' },
        },
        answer: where,
      },
    },
    phases: [
      { at: 4, pattern: ['flood', 'shroud', 'mirror:quiet', 'strike'],
        line: { jp: '{潮|しお} が {満|み}ちて くる 。 {書記|しょき} は {判子|はんこ} を {高|たか}く {掲|かか}げた 。', en: 'The tide comes flooding in. The Clerk raises its stamp high.' },
        teach: { en: 'The tide is rising: a flood strikes you both. A ward (まもる) in front of one of you softens it; light or wind clears the mist; and plain unravelling always works.' } },
      { at: 2, pattern: ['plea:address', 'strike', 'rest'],
        line: { jp: '{判子|はんこ} を {持|も}つ {手|て} が {止|と}まった 。 {書記|しょき} は {読|よ}めない {封筒|ふうとう} を じっと {見|み}て いる 。', en: 'The hand holding the stamp stops. The Clerk is staring at an envelope it cannot read.' },
        teach: { en: 'It is asking a real question now. Answer it (💬), or keep unravelling.' } },
    ],
    intro: { jp: '「{宛先|あてさき}{不明|ふめい} 。 {差出人|さしだしにん} に {返送|へんそう} 。 {次|つぎ} 。」', en: '"Address unknown. Returned to sender. Next."' },
    settle: { jp: '{判子|はんこ} が {二|ふた}つ に {割|わ}れた 。 {潮|しお} の {書記|しょき} は {初|はじ}めて {顔|かお} を {上|あ}げた 。', en: 'The stamp splits in two. For the first time, the Tide Clerk looks up.' },
  });
})(RB.content);
