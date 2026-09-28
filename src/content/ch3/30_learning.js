/* Chapter 3 learning content: story challenges (all four tiers), oral
 * histories, the terrace signpost, festival letters and teahouse orders,
 * region drills, and the Inkweaving foes including the Kiln Warden. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const X = C.challenges;
  const no = (en, why) => ({ en, ok: false, why: { en: why } });
  const noJ = (jp, why) => ({ jp, ok: false, why: { en: why } });

  // ======================================================================================
  // Story challenges
  // ======================================================================================

  // Stage 2 — reading the chronicle's "perfect" entry.
  X['co.c_chronicle'] = { title: { jp: '{里|さと} の {記録|きろく}', en: 'The orchard\'s chronicle' },
    tiers: {
      F: [
        { kind: 'choose', item: 'v:火事', ctx: { jp: '{毎年|まいとし} の {最後|さいご} に 、 {同|おな}じ {言葉|ことば} が ある 。', en: 'Every year\'s entry ends with the same words.' },
          prompt: { en: 'From twenty years ago on, every festival entry ends the same way. Which line is it?' },
          options: [{ jp: 'かじ なし', en: 'no fire', ok: true }, noJ('あめ なし', 'That would be "no rain" — the entries mention rain only now and then.'), noJ('まつり なし', 'That would be "no festival" — but the festival is held every year.')],
          explain: { jp: '{火事|かじ} なし', en: 'かじ (火事) is a fire that burns buildings; なし means "none". Older entries never needed to say it.' } },
        { kind: 'write', item: 'v:火', prompt: { en: 'Tokiwa taps the word 火 — fire — at the start of 火事. It is read hi. Write it.' }, answer: 'ひ', accept: ['ひ', '火'], mode: 'reading', explain: { jp: '{火|ひ}', en: '火 (hi) — fire. In 火事 (kaji) the same character is read ka.' } },
      ],
      E: [
        { kind: 'choose', item: 'c:co_chronicle_e', ctx: { jp: '{十月|じゅうがつ} {十五日|じゅうごにち} 。 {秋祭|あきまつ}り 。 {例年|れいねん} どおり 。 {火事|かじ} なし 。', en: 'Tenth month, fifteenth day. Autumn festival. As in other years. No fire.' },
          prompt: { en: 'What does the entry claim about the festival twenty years ago?' },
          options: [{ en: 'It went ahead as usual, and there was no fire.', ok: true }, no('It was cancelled because of a fire.', 'どおり means "just as"; 例年どおり = as in ordinary years. Nothing is cancelled.'), no('It was held on the fourteenth.', '十五日 is the fifteenth (じゅうごにち).')],
          explain: { en: '例年どおり = "as in ordinary years". 火事なし = "no fire". Nothing else in the book bothers to say that.' } },
        { kind: 'write', item: 'g:counters', prompt: { en: 'Isao\'s kiln ledger stops on the fourteenth — the night before the festival. How do you read "the 14th (day of the month)"? It is irregular.' }, answer: 'じゅうよっか', accept: ['じゅうよっか', '十四日', '14日'], mode: 'reading', choices: ['じゅうよっか', 'じゅうよんにち', 'じゅうよか', 'じゅうしにち'], explain: { jp: '{十四日|じゅうよっか}', en: 'Dates 1–10, 14, 20 and 24 have special readings: 四日 is よっか, so 十四日 is じゅうよっか.' } },
      ],
      I: [
        { kind: 'choose', item: 'c:co_chronicle_i', ctx: { jp: '（ {前|まえ} の {年|とし} ） {十月|じゅうがつ} {十五日|じゅうごにち} 、 {秋祭|あきまつ}り 。 {雨|あめ} 。 {灯籠|とうろう} {三十|さんじゅう} 。 ／ （ その {年|とし} ） {十月|じゅうがつ} {十五日|じゅうごにち} 、 {秋祭|あきまつ}り 、 {例年|れいねん} どおり {行|おこな}われた 。 {火事|かじ} なし 。 ／ （ {以後|いご} {毎年|まいとし} ） …… {火事|かじ} なし 。', en: '(The year before) 10/15, festival. Rain. Thirty lanterns. / (That year) 10/15, the festival was held as usual. No fire. / (Every year since) … No fire.' },
          prompt: { en: 'Compare the entries. What is strange?' },
          options: [{ en: 'Only from that year on does every entry insist there was no fire — and that year gives no details at all.', ok: true }, no('The festival moved to a different date that year.', 'All three give 十月十五日.'), no('The year before, the festival was rained off.', '雨 only records the weather; thirty lanterns were still lit.')],
          explain: { en: 'A record that suddenly starts denying something it never mentioned before is answering a question nobody wrote down. 以後 = "from then on".' } },
        { kind: 'choose', item: 'g:v_te_iru', ctx: { jp: 'ページ の {墨|すみ} が 、 その {年|とし} だけ {新|あたら}しい 。 {字|じ} も {違|ちが}う {人|ひと} の {字|じ} に {見|み}える 。', en: 'Only that year\'s ink looks fresh, and the handwriting looks like someone else\'s.' },
          prompt: { en: 'What does this suggest?' },
          options: [{ en: 'That year\'s entry was written — or rewritten — later, by a different hand.', ok: true }, no('Someone spilled new ink over an old page.', 'Spilled ink wouldn\'t change the handwriting (字).'), no('The festival that year was written up by a child.', 'Nothing points to a child; only to a different, later hand.')],
          explain: { en: '〜に見える = "looks like". 違う人の字 = someone else\'s handwriting.' } },
      ],
      A: [
        { kind: 'choose', item: 'c:co_chronicle_a', ctx: { jp: '（ {前年|ぜんねん} ） {本年|ほんねん} {十月|じゅうがつ} {十五日|じゅうごにち} 、 {秋祭|あきまつ}り 。 {灯籠|とうろう} {三十|さんじゅう} 。 ／ （ {当該|とうがい} {年|ねん} ） {同年|どうねん} {十月|じゅうがつ} {十五日|じゅうごにち} 、 {秋祭|あきまつ}り を {例年|れいねん} どおり {執|と}り{行|おこな}う 。', en: '(The year before) "This year, 10/15: autumn festival. Thirty lanterns." / (The year in question) "In the same year, 10/15, the festival was held as usual."' },
          prompt: { en: 'Why does 同年 instead of 本年 matter?' },
          options: [{ en: '本年 ("this year") is how you write at the time; 同年 ("that same year") refers back to a year from later on. The entry was written afterwards.', ok: true }, no('同年 is simply more polite than 本年.', 'Neither is more polite; they differ in viewpoint (deixis), not register.'), no('同年 means the festival was held twice that year.', '同年 = "the same year", not "the same festival again".')],
          explain: { en: '本年 = the year the writer is living in. 同年 = "the (aforementioned) same year" — the writer is looking back.' } },
        { kind: 'choose', item: 'c:co_chronicle_a2', ctx: { jp: '{本|ほん}{里|り} {開村|かいそん} {以来|いらい} 、 {火災|かさい} の {記録|きろく} は {一件|いっけん} も なし 。', en: '"Since the founding of this village, not a single fire is on record."' },
          prompt: { en: 'What does this sentence actually assert — and what does it avoid asserting?' },
          options: [{ en: 'It says no fire was recorded. It does not say no fire happened.', ok: true }, no('It proves the orchard has never burned.', 'A missing record is not proof — especially in a book whose ink is new.'), no('It says the records of fires were lost in a fire.', 'That is your suspicion, not what the sentence says.')],
          explain: { en: '記録は一件もなし — "not one record". The claim is about the book, not the world.' } },
      ],
    } };

  // Stage 4 — setting the records side by side: dates, counters, cause and effect.
  X['co.c_records'] = { title: { jp: '{食|く}い{違|ちが}う {記録|きろく}', en: 'Records that disagree' },
    tiers: {
      F: [
        { kind: 'choose', item: 'g:counters', ctx: { jp: 'ウメ の {帳面|ちょうめん} ： {上|うえ} の {段|だん} に 、 なえぎ 200 {本|ほん} 。', en: 'Ume\'s book: on the upper terraces, 200 saplings.' },
          prompt: { en: 'How many young trees were planted on the upper terraces in a single spring?' },
          options: [{ en: '200', ok: true }, no('20', 'Look again at the number: 200.'), no('2', 'Look again at the number: 200.')],
          explain: { en: 'Trees are counted with 本 (ほん). Two hundred trees at once means a whole terrace was replanted.' } },
        { kind: 'write', item: 'v:窯', prompt: { en: 'Isao\'s ledger says a new kiln was built the next spring. "Kiln" is kama. Write it.' }, answer: 'かま', accept: ['かま', '窯'], mode: 'reading', explain: { jp: '{窯|かま}', en: 'かま — kiln. You don\'t build a new kiln unless something happened to the old one.' } },
        { kind: 'choose', item: 'g:conj_kara', ctx: { jp: 'かじ が ない から 、 くさ を かる の は やめる 。', en: 'There are no fires, so we\'ll stop cutting the grass.' },
          prompt: { en: 'Why did the village stop cutting the grass on the firebreaks?' },
          options: [{ en: 'Because there are no fires.', ok: true }, no('Because it rained.', 'Nothing here mentions rain (あめ).'), no('Because the grass was pretty.', 'The reason comes before から: かじ が ない.')],
          explain: { en: 'X から Y: "because X, Y". The reason sits before から.' } },
      ],
      E: [
        { kind: 'choose', item: 'c:co_records_e1', ctx: { jp: '{窯|かま} の {帳面|ちょうめん} ： {十月|じゅうがつ} {十三日|じゅうさんにち} 、 {火入|ひい}れ 。 {十四日|じゅうよっか} 、 {夜|よる} も {焚|た}く 。 …… {三月|さんがつ} 、 {窯|かま} を {新|あたら}しく {作|つく}る 。', en: 'Kiln ledger: 10/13, fire lit. 10/14, firing through the night too. … March: build the kiln anew.' },
          prompt: { en: 'What happened in the ledger between the fourteenth and March?' },
          options: [{ en: 'Nothing is written for months — and then a new kiln has to be built.', ok: true }, no('The kiln was fired every day.', 'After 十四日 the ledger falls silent until 三月.'), no('The festival lanterns were finished and delivered.', 'The ledger never says so.')],
          explain: { en: '新しく作る = "make (it) new". Kilns are rebuilt when they are destroyed, not when they are merely old.' } },
        { kind: 'choose', item: 'g:counters', ctx: { jp: '{戸数|こすう} ： {五十二軒|ごじゅうにけん} 。 （ {次|つぎ} の {年|とし} ） {四十七軒|よんじゅうななけん} 。', en: 'Households: 52. (The next year) 47.' },
          prompt: { en: 'How many households are missing the next year? Pick the right counter.' },
          options: [{ jp: '{五軒|ごけん}', en: 'five (houses)', ok: true }, noJ('{五本|ごほん}', '本 counts long, thin things — trees, bottles — not homes.'), noJ('{五枚|ごまい}', '枚 counts flat things like paper and plates.')],
          explain: { jp: '{軒|けん}', en: '軒 (けん) counts houses and households. 52 − 47 = 5 households, gone in one year.' } },
        { kind: 'choose', item: 'g:conj_node', ctx: { jp: '{火事|かじ} が ない ので 、 {火除|ひよ}け{道|みち} の {草刈|くさか}り は しなくて も いい 。', en: 'Since there are no fires, there\'s no need to cut the grass on the firebreak paths.' },
          prompt: { en: 'This is the firebreak log\'s decision. Which reading has cause and effect the right way round for what the log says?' },
          options: [{ en: 'No fires → so no need to cut the grass.', ok: true }, no('Cut grass → so there are no fires.', 'That is the truth the log got backwards — but it is not what this sentence says. ので follows the reason.'), no('No need to cut the grass → so there are no fires.', 'ので attaches to the reason: 火事がない.')],
          explain: { en: 'X ので Y: X is the reason, Y the result. The log reasons from a record that was missing a fire — and the firebreaks were part of why fire hadn\'t spread before.' } },
      ],
      I: [
        { kind: 'choose', item: 'c:co_records_i1', ctx: { jp: '{窯|かま} の {帳面|ちょうめん} ： {十四日|じゅうよっか} 、 {夜|よ}{通|どお}し {焚|た}く 。 （ {以後|いご} 、 {三月|さんがつ} まで {記録|きろく} なし ） {三月|さんがつ} 、 {窯|かま} を {一|いち} から {築|きず}き{直|なお}す 。', en: 'Kiln ledger: 14th, firing all night. (Nothing recorded until March.) March: rebuild the kiln from scratch.' },
          prompt: { en: 'What does the ledger suggest?' },
          options: [{ en: 'The all-night firing on the fourteenth was the old kiln\'s last; something destroyed it.', ok: true }, no('The kiln was rested for winter, as usual.', 'A rest doesn\'t require rebuilding 一から (from scratch).'), no('The ledger was lost until March.', 'The same ledger continues in March — in a different hand.')],
          explain: { en: '築き直す = "build again". 一から = "from zero".' } },
        { kind: 'choose', item: 'g:counters', ctx: { jp: '{翌年|よくねん} の {春|はる} 、 {上|うえ} の {段|だん} に {柿|かき} の {苗木|なえぎ} を {二百本|にひゃっぽん} {植|う}えた 。 {戸数|こすう} は {五十二軒|ごじゅうにけん} から {四十七軒|よんじゅうななけん} に {減|へ}った 。', en: 'The next spring, 200 persimmon saplings were planted on the upper terraces. Households fell from 52 to 47.' },
          prompt: { en: 'Taken together, what do these two lines say?' },
          options: [{ en: 'A whole terrace of trees had to be replaced, and five households vanished in the same year.', ok: true }, no('Five new households moved in to plant 200 trees.', '減った means "decreased" — 52 → 47.'), no('Two hundred households planted one tree each.', '本 counts the trees; 軒 counts the households.')],
          explain: { en: '二百本 (にひゃっぽん): 本 changes to ぽん after ひゃく. 減る = decrease.' } },
        { kind: 'choose', item: 'g:conj_node', ctx: { jp: '{火事|かじ} は {一度|いちど} も ない ので 、 {火除|ひよ}け{道|みち} の {手入|てい}れ は もう {必要|ひつよう} ない だろう 。 {来年|らいねん} から {草|くさ} は {刈|か}らない こと に する 。', en: 'Since there has never been a single fire, the firebreaks probably don\'t need looking after any more. From next year, we\'ll stop cutting the grass.' },
          prompt: { en: 'What has the writer got backwards?' },
          options: [{ en: 'The kept-clear firebreaks were a reason fire never spread; the writer treats their success as proof they aren\'t needed.', ok: true }, no('The writer decided to cut more grass, not less.', '刈らないことにする = decide NOT to cut.'), no('Nothing — the reasoning is sound.', 'Even on its own terms, "it never burned, so stop the thing that stops burning" is backwards.')],
          explain: { en: '〜ことにする = "decide to". 〜だろう softens the claim — the writer wasn\'t sure either.' } },
      ],
      A: [
        { kind: 'choose', item: 'c:co_records_a1', ctx: { jp: '{開村|かいそん} {以来|いらい} 、 {火災|かさい} の {前例|ぜんれい} なし 。 {依|よ}って 、 {防火帯|ぼうかたい} の {維持|いじ} は {要|よう}せず 。', en: '"No precedent of fire since the founding. Accordingly, maintenance of the firebreaks is not required."' },
          prompt: { en: 'What is wrong with this reasoning — beyond the doubtful record?' },
          options: [{ en: 'It takes the absence of fire as proof the firebreaks are useless, when their upkeep was part of why no fire spread.', ok: true }, no('依って is too casual for an official log.', '依って is formal and correct here; the problem is the logic.'), no('It confuses fire with flood.', '火災 is fire; 防火帯 is firebreak. The subject is consistent.')],
          explain: { en: '依って = "accordingly". 要せず = "is not needed" (literary negative of 要する).' } },
        { kind: 'choose', item: 'c:co_records_a2', ctx: { jp: '{戸数|こすう} 、 {前年|ぜんねん} {五十二|ごじゅうに} 、 {本年|ほんねん} {四十七|よんじゅうなな} 。 {転出|てんしゅつ} の {届|とど}け{出|で} なし 。', en: '"Households: last year 52, this year 47. No notices of departure filed."' },
          prompt: { en: 'What does 転出の届け出なし add?' },
          options: [{ en: 'Five households left the register without anyone formally moving away.', ok: true }, no('Five households moved away and filed the right papers.', 'なし: none were filed.'), no('Five new households arrived without registering.', 'The number went down, not up.')],
          explain: { en: '転出 = moving out (of a district); 届け出 = official notification.' } },
        { kind: 'choose', item: 'c:co_records_a3', ctx: { jp: '{火事|かじ} の {記録|きろく} が ない から と いって 、 {火事|かじ} が なかった と は {限|かぎ}らない 。', en: '' },
          prompt: { en: 'Which sentence says the same thing?' },
          options: [{ jp: '{記録|きろく} が ない こと は 、 {火事|かじ} が なかった {証拠|しょうこ} に は ならない 。', ok: true }, noJ('{記録|きろく} が ない の だ から 、 {火事|かじ} は なかった に {違|ちが}いない 。', 'That is the opposite: に違いない = "must have been".'), noJ('{火事|かじ} が あった の で 、 {記録|きろく} も {必|かなら}ず ある 。', 'This claims a record must exist; the original says only that absence proves nothing.')],
          explain: { en: '〜からといって…とは限らない = "just because X doesn\'t necessarily mean Y".' } },
      ],
    } };

  // The founders' stone and the crumbling terrace wall — teaches いし.
  X['co.c_ishi'] = { title: { jp: '{崩|くず}れかけた {石垣|いしがき}', en: 'The crumbling terrace wall' },
    tiers: {
      F: [{ kind: 'write', item: 'v:石', prompt: { en: 'The stones keep sliding. Write the word for stone — ishi — on the wall so it holds.' }, answer: 'いし', accept: ['いし', '石'], mode: 'reading', explain: { jp: '{石|いし}', en: 'いし (石) — stone. As an inscription it stands firm against gusts and floods.' },
        teach: { title: 'New inscription: いし', jp: '{石|いし}', en: 'いし (ishi) means stone — an ordinary word. Woven with clear intent, it stands firm: it answers gusts and rising water in battle.' } }],
      E: [{ kind: 'write', item: 'v:石', ctx: { jp: '{段|だん} の {壁|かべ} は 、 {石|いし} を {積|つ}んで {作|つく}って ある 。', en: 'The terrace walls are built of stacked stone.' }, prompt: { en: 'Weave the word for "stone" into the loose wall. (Kana or kanji.)' }, answer: 'いし', accept: ['いし', '石'], mode: 'reading', explain: { jp: '{石|いし}', en: 'いし — stone. 石を積む = to stack stones.' },
        teach: { title: 'New inscription: いし', jp: '{石|いし}', en: 'いし (ishi) means stone. Woven with clear intent, it stands firm: it answers gusts and rising water in battle.' } }],
      I: [
        { kind: 'choose', item: 'c:co_ishi_i', ctx: { jp: '{火|ひ} が {来|き}て も 、 {石|いし} は {燃|も}えない 。 だから 、 {上|うえ} の {段|だん} で は {石垣|いしがき} だけ が {残|のこ}った 。', en: '' },
          prompt: { en: 'Grandma Ume\'s words, carved on the marker by the stair. What do they explain?' },
          options: [{ en: 'Why only the stone walls survived on the upper terraces: stone doesn\'t burn, even when fire comes.', ok: true }, no('Why the stone walls were built after the fire.', '残った = "remained" — the walls were there before.'), no('That the stone walls caught fire first.', '燃えない = "does not burn".')],
          explain: { en: '〜ても = "even if". だけ = "only".' },
          teach: { title: 'New inscription: いし', jp: '{石|いし}', en: 'いし (ishi) means stone. Woven with clear intent, it stands firm: it answers gusts and rising water in battle.' } },
      ],
      A: [
        { kind: 'choose', item: 'c:co_ishi_a', ctx: { jp: '{火|ひ} は {来|く}る 。 {火|ひ} は {去|さ}る 。 {石|いし} は {黙|だま}って {残|のこ}る 。', en: '' },
          prompt: { en: 'The founders carved this on the stone. What is the best reading, in this place?' },
          options: [{ en: 'Fires come and go; stone stays — and keeps what it saw without saying a word.', ok: true }, no('Stone is silent, so it forgets.', '黙って残る: it remains, silently. Silence isn\'t forgetting — the stone is still there.'), no('Fire never comes here, so the stone is quiet.', '火は来る — fire does come.')],
          explain: { en: '黙って = "without speaking". The walls are a record nobody reads aloud.' },
          teach: { title: 'New inscription: いし', jp: '{石|いし}', en: 'いし (ishi) means stone. Woven with clear intent, it stands firm: it answers gusts and rising water in battle.' } },
      ],
    } };

  // The exposed cut with the band of ash — teaches つち.
  X['co.c_tsuchi'] = { title: { jp: '{土|つち} の {中|なか} の {黒|くろ}い {線|せん}', en: 'The black line in the soil' },
    tiers: {
      F: [{ kind: 'write', item: 'v:土', prompt: { en: 'The soil remembers. Write the word for earth — tsuchi — and pack the fallen soil into a step.' }, answer: 'つち', accept: ['つち', '土'], mode: 'reading', explain: { jp: '{土|つち}', en: 'つち (土) — earth, soil. As an inscription it banks up against water.' },
        teach: { title: 'New inscription: つち', jp: '{土|つち}', en: 'つち (tsuchi) means earth or soil. Woven with intent, it banks up: it holds back rising water in battle.' } }],
      E: [
        { kind: 'write', item: 'v:土', ctx: { jp: '{黒|くろ}い {線|せん} が 、 {崩|くず}れた {壁|かべ} の {断面|だんめん} に {見|み}える 。', en: 'A black line shows in the broken face of the wall.' }, template: { before: '{黒|くろ}い {線|せん} は', after: 'の {中|なか} に ある 。' }, prompt: { en: 'Where is the black line? Write the word for soil/earth (tsuchi).' }, answer: 'つち', accept: ['つち', '土'], mode: 'reading', explain: { jp: '{土|つち} の {中|なか}', en: '土の中 = in the soil.' },
          teach: { title: 'New inscription: つち', jp: '{土|つち}', en: 'つち (tsuchi) means earth or soil. Woven with intent, it banks up: it holds back rising water in battle.' } },
        { kind: 'choose', item: 'v:灰', ctx: { jp: 'この {黒|くろ}い {線|せん} は {灰|はい} だ 。', en: 'This black line is ash.' }, prompt: { en: 'What does a layer of ash buried in the soil tell you?' },
          options: [{ en: 'Something burned here, long enough ago for soil to cover it.', ok: true }, no('Someone spilled ink.', '灰 (はい) is ash, not ink.'), no('The soil here is new.', 'The ash is under older soil — the fire came first.')], explain: { jp: '{灰|はい}', en: 'はい — ash. (Also the ordinary word for "yes": context tells them apart.)' } },
      ],
      I: [{ kind: 'choose', item: 'c:co_tsuchi_i', ctx: { jp: '{記録|きろく} は {書|か}き{換|か}えられる が 、 {土|つち} は {嘘|うそ} を つかない 。 {灰|はい} の {層|そう} の {上|うえ} に は 、 {二十年|にじゅうねん} {分|ぶん} ほど の {土|つち} が {積|つ}もって いる 。', en: '' },
        prompt: { en: 'What can you conclude from the ash layer?' },
        options: [{ en: 'The terraces burned about twenty years ago, whatever the chronicle says.', ok: true }, no('The ash was put there twenty years later.', 'Soil built up ON TOP of the ash: the ash came first.'), no('Records and soil agree.', '書き換えられる… が — records can be rewritten, but.')],
        explain: { en: '〜分 = "worth of"; 積もる = to pile up.' },
        teach: { title: 'New inscription: つち', jp: '{土|つち}', en: 'つち (tsuchi) means earth or soil. Woven with intent, it banks up: it holds back rising water in battle.' } }],
      A: [{ kind: 'choose', item: 'c:co_tsuchi_a', ctx: { jp: '{紙|かみ} の {記録|きろく} は {書|か}き{換|か}えられて も 、 {土|つち} に {刻|きざ}まれた {層|そう} まで は {消|け}せない 。', en: '' },
        prompt: { en: 'Which paraphrase is faithful?' },
        options: [{ jp: '{紙|かみ} の {記録|きろく} なら {書|か}き{換|か}えられる が 、 {土|つち} の {層|そう} は {消|け}しよう が ない 。', ok: true }, noJ('{土|つち} の {層|そう} も 、 {紙|かみ} と {同|おな}じ よう に {書|か}き{換|か}えられる 。', 'まで は消せない = "can\'t erase even that far" — the soil is exactly what can\'t be rewritten.'), noJ('{紙|かみ} の {記録|きろく} を {消|け}せば 、 {土|つち} の {層|そう} も {消|き}える 。', 'The sentence contrasts them; it doesn\'t link them.')],
        explain: { en: '〜ても… まではVない = "even if X, not as far as Y". 〜ようがない = "there\'s no way to".' },
        teach: { title: 'New inscription: つち', jp: '{土|つち}', en: 'つち (tsuchi) means earth or soil. Woven with intent, it banks up: it holds back rising water in battle.' } }],
    } };

  // The ice house — teaches こおり.
  X['co.c_koori'] = { title: { jp: '{氷室|ひむろ} の {氷|こおり}', en: 'Ice in the ice house' },
    tiers: {
      F: [{ kind: 'write', item: 'v:氷', prompt: { en: 'The block under the straw is ice — koori. Write it.' }, answer: 'こおり', accept: ['こおり', '氷'], mode: 'reading', explain: { jp: '{氷|こおり}', en: 'こおり — ice. Note the long vowel is spelled お, not う: こおり.' },
        teach: { title: 'New inscription: こおり', jp: '{氷|こおり}', en: 'こおり (koori) means ice. Woven with intent, it cools — another way to answer heat, alongside みず.' } }],
      E: [{ kind: 'write', item: 'v:氷', ctx: { jp: '{冬|ふゆ} の {氷|こおり} を わら で {包|つつ}んで 、 {夏|なつ} まで しまって おく 。', en: 'Winter ice is wrapped in straw and stored until summer.' }, template: { before: '', after: 'を わら で {包|つつ}む 。' }, prompt: { en: 'What is wrapped in the straw? Write "ice". (Careful with the long vowel.)' }, answer: 'こおり', accept: ['こおり', '氷'], mode: 'reading', choices: ['こおり', 'こうり', 'こり', 'こおろ'], explain: { jp: '{氷|こおり}', en: 'こおり, not こうり: this long o is written with お.' },
        teach: { title: 'New inscription: こおり', jp: '{氷|こおり}', en: 'こおり (koori) means ice. Woven with intent, it cools — another way to answer heat, alongside みず.' } }],
      I: [{ kind: 'choose', item: 'c:co_koori_i', ctx: { jp: '{氷室|ひむろ} の {氷|こおり} は 、 {祭|まつ}り の かき{氷|ごおり} の ため に {冬|ふゆ} から {取|と}って おいた もの だ 。 その {年|とし} は 、 {誰|だれ} も {取|と}り に {来|こ}なかった 。', en: '' },
        prompt: { en: 'What does this tell you about the ice?' },
        options: [{ en: 'It was stored for the festival twenty years ago, and nobody ever came back for it.', ok: true }, no('It was cut this winter.', 'その年 — "that year" — and nobody came.'), no('It was used for the festival that year.', '誰も取りに来なかった = nobody came to fetch it.')],
        explain: { en: '〜ておいた = "had done in advance". 取りに来る = "come to fetch".' },
        teach: { title: 'New inscription: こおり', jp: '{氷|こおり}', en: 'こおり (koori) means ice. Woven with intent, it cools — another way to answer heat, alongside みず.' } }],
      A: [{ kind: 'choose', item: 'c:co_koori_a', ctx: { jp: '{誰|だれ} も {取|と}り に {来|こ}なかった {氷|こおり} は 、 {二十年|にじゅうねん} {経|た}って も 、 {溶|と}ける に {溶|と}けられず に いた 。', en: '' },
        prompt: { en: 'What does 溶けるに溶けられずにいた express?' },
        options: [{ en: 'The ice "couldn\'t melt even if it wanted to" — stuck, as if waiting.', ok: true }, no('The ice melted and refroze many times.', 'The construction describes being unable to, not repeating.'), no('The ice melted as expected.', '溶けられず = could not melt.')],
        explain: { en: 'Vに Vられない = "can\'t V even though one would/should" — a literary, emotive pattern.' },
        teach: { title: 'New inscription: こおり', jp: '{氷|こおり}', en: 'こおり (koori) means ice. Woven with intent, it cools — another way to answer heat, alongside みず.' } }],
    } };

  // Cracking the warm glass seal with cold.
  X['co.c_seal'] = { title: { jp: 'ガラス の {封|ふう}', en: 'The glass seal' },
    tiers: {
      F: [{ kind: 'write', item: 'v:氷', prompt: { en: 'The seal is still warm. Cold makes hot glass crack. Weave "ice" (koori) against it.' }, answer: 'こおり', accept: ['こおり', '氷'], mode: 'reading', explain: { jp: '{氷|こおり}', en: 'こおり — ice.' } }],
      E: [
        { kind: 'choose', item: 'c:co_seal_e', ctx: { jp: '{熱|あつ}い ガラス を {急|きゅう}に {冷|ひ}やす と 、 {割|わ}れる 。', en: '' }, prompt: { en: 'Hiro said this when you left the workshop. What does it mean?' },
          options: [{ en: 'If you cool hot glass suddenly, it cracks.', ok: true }, no('If you heat cold glass, it melts.', '冷やす = to cool; 割れる = to crack.'), no('Hot glass never cracks.', '〜と = "whenever/if" — it does crack.')], explain: { en: 'X と Y: whenever X, Y follows.' } },
        { kind: 'write', item: 'v:氷', prompt: { en: 'Now weave the word for "ice" against the seal.' }, answer: 'こおり', accept: ['こおり', '氷'], mode: 'reading', explain: { jp: '{氷|こおり}', en: 'こおり — ice.' } },
      ],
      I: [{ kind: 'choose', item: 'c:co_seal_i', ctx: { jp: '{封|ふう} は まだ {温|あたた}かい 。 {二十年|にじゅうねん} も {経|た}つ のに 、 {窯|かま} の {中|なか} の {熱|ねつ} が {抜|ぬ}けて いない らしい 。', en: '' },
        prompt: { en: 'What is surprising, and how will you use it?' },
        options: [{ en: 'Twenty years on, the kiln still holds heat — so sudden cold from ice will crack the seal.', ok: true }, no('The seal is cold, so ice won\'t do anything.', '温かい = warm.'), no('The kiln was fired yesterday.', '二十年も経つのに = "even though twenty years have passed".')],
        explain: { en: '〜のに = "even though" (with surprise). らしい = "it seems".' } }],
      A: [{ kind: 'choose', item: 'c:co_seal_a', ctx: { jp: '「 {焼|や}き{上|あ}がった ガラス に {急冷|きゅうれい} は {禁物|きんもつ} 。 」 ── ヒロ の {工房|こうぼう} の {壁|かべ} の {貼|は}り{紙|がみ} 。', en: '' },
        prompt: { en: 'The workshop rule warns against something. Why does it help you now?' },
        options: [{ en: 'It forbids sudden cooling because it cracks glass — exactly what you need to do to the seal.', ok: true }, no('It forbids touching glass, so you should leave the seal alone.', '禁物 is about 急冷 (sudden cooling), not touching.'), no('It says glass should always be cooled with ice.', '禁物 = something to be avoided.')],
        explain: { en: '急冷 = rapid cooling; 禁物 = taboo, something you must not do.' } }],
    } };

  // The kiln's firing instructions and temperature notes.
  X['co.c_kiln'] = { title: { jp: '{窯焚|かまだ}き の {手順|てじゅん}', en: 'The firing instructions' },
    tiers: {
      F: [
        { kind: 'order', item: 'c:co_kiln_f', prompt: { en: 'Put the three tiles back in order on the wall.' }, tiles: ['まき を いれる', 'ひ を つける', 'まど を あける'], answer: ['まき を いれる', 'ひ を つける', 'まど を あける'], orderHint: { en: 'First the wood (まき), then the fire (ひ), and only then the vent (まど).' } },
        { kind: 'choose', item: 'c:co_kiln_f2', ctx: { jp: 'しろ に なったら 、 うえ の まど を あける 。', en: 'When it turns white, open the upper vent.' }, prompt: { en: 'The fire in the peephole is white now. Which vent do you open?' },
          options: [{ jp: 'うえ の まど', en: 'the upper vent', ok: true }, noJ('した の まど', 'した is "lower". The tile says うえ (upper).'), noJ('どちら も あけない', 'The tile says to open one when it is white (しろ).')], explain: { en: 'うえ = up/upper, した = down/lower.' } },
      ],
      E: [
        { kind: 'order', item: 'c:co_kiln_e', prompt: { en: 'Put the four tiles back in order. Look for the order words.' },
          tiles: ['まず 、 {薪|まき} を {入|い}れる 。', '{次|つぎ} に 、 {火|ひ} を つける 。', '{少|すこ}し ずつ {温|あたた}める 。', '{最後|さいご} に 、 {窓|まど} を {開|あ}ける 。'],
          answer: ['まず 、 {薪|まき} を {入|い}れる 。', '{次|つぎ} に 、 {火|ひ} を つける 。', '{少|すこ}し ずつ {温|あたた}める 。', '{最後|さいご} に 、 {窓|まど} を {開|あ}ける 。'], orderHint: { en: 'まず = first, 次に = next, 最後に = finally. Warming comes after lighting.' } },
        { kind: 'choose', item: 'g:v_naide_kudasai', ctx: { jp: '{火|ひ} が {赤|あか}い あいだ は 、 {窓|まど} を {開|あ}けないで ください 。 {白|しろ}く なったら 、 {上|うえ} の {窓|まど} を {開|あ}けて ください 。', en: '' }, prompt: { en: 'The flame in the peephole has just turned white. What do you do?' },
          options: [{ en: 'Open the upper vent.', ok: true }, no('Keep every vent closed.', '開けないでください applies only while it is red (赤いあいだは).'), no('Open the lower vent.', 'The note says 上 (upper).')], explain: { en: '〜ないでください = please don\'t; 〜たら = once/when.' } },
      ],
      I: [
        { kind: 'order', item: 'g:v_te_kara', prompt: { en: 'Restore the four steps in order.' },
          tiles: ['{薪|まき} を {詰|つ}めて から 、 {火|ひ} を {入|い}れる 。', '{火|ひ} が {回|まわ}る まで 、 {少|すこ}し ずつ {温|あたた}める 。', '{黄色|きいろ} に なったら 、 {下|した} の {窓|まど} を {閉|し}める 。', '{白|しろ}く なって から 、 {上|うえ} の {窓|まど} を {開|あ}ける 。'],
          answer: ['{薪|まき} を {詰|つ}めて から 、 {火|ひ} を {入|い}れる 。', '{火|ひ} が {回|まわ}る まで 、 {少|すこ}し ずつ {温|あたた}める 。', '{黄色|きいろ} に なったら 、 {下|した} の {窓|まど} を {閉|し}める 。', '{白|しろ}く なって から 、 {上|うえ} の {窓|まど} を {開|あ}ける 。'], orderHint: { en: 'Flame colours rise red → yellow → white. 〜てから = after; 〜まで = until.' } },
        { kind: 'choose', item: 'g:cond_tara', ctx: { jp: '{赤|あか} → {黄色|きいろ} → {白|しろ} 。 {白|しろ} に ならない うち に {上|うえ} の {窓|まど} を {開|あ}ける と 、 ガラス が {割|わ}れる 。', en: '' }, prompt: { en: 'You closed the lower vent at yellow. Now the flame has gone white. What next?' },
          options: [{ en: 'Open the upper vent now.', ok: true }, no('Wait — opening it now will crack the glass.', 'The danger is opening it BEFORE white (白にならないうちに). It is white now.'), no('Open the lower vent again.', 'Nothing says to reopen it.')], explain: { en: '〜ないうちに = "before (it) does…".' } },
      ],
      A: [
        { kind: 'order', item: 'c:co_kiln_a', prompt: { en: 'Restore the four steps of the firing, written in the old workshop style.' },
          tiles: ['{窯詰|かまづ}め を {終|お}えた のち 、 {焚口|たきぐち} に {火|ひ} を {入|い}れる 。', '{焙|あぶ}り は {急|いそ}がず 、 {一昼夜|いっちゅうや} かけて {温|あたた}める 。', '{炎|ほのお} が {黄|き} を {帯|お}びたら 、 {下|した} の {窓|まど} を {絞|しぼ}る 。', '{白|しろ} み が さした ところ で 、 {上|うえ} の {窓|まど} を {開|ひら}く 。'],
          answer: ['{窯詰|かまづ}め を {終|お}えた のち 、 {焚口|たきぐち} に {火|ひ} を {入|い}れる 。', '{焙|あぶ}り は {急|いそ}がず 、 {一昼夜|いっちゅうや} かけて {温|あたた}める 。', '{炎|ほのお} が {黄|き} を {帯|お}びたら 、 {下|した} の {窓|まど} を {絞|しぼ}る 。', '{白|しろ} み が さした ところ で 、 {上|うえ} の {窓|まど} を {開|ひら}く 。'], orderHint: { en: 'のち = after; 帯びる = take on (a colour); 〜ところで = at the point when.' } },
        { kind: 'choose', item: 'c:co_kiln_a2', ctx: { jp: '（ {余白|よはく} に {別|べつ} の {字|じ} で ） {風|かぜ} の {強|つよ}い {夜|よる} は 、 {上|うえ} の {窓|まど} を {開|ひら}く べからず 。 {火|ひ} の {粉|こ} が {山|やま} へ {飛|と}ぶ 。 ── トモエ', en: '' }, prompt: { en: 'Tonight the air in the kiln is dead still, and the flame is white. What does the margin note mean for you?' },
          options: [{ en: 'Open the upper vent: the prohibition only covers windy nights.', ok: true }, no('Never open the upper vent — べからず forbids it.', 'べからず is scoped by 風の強い夜は — on windy nights.'), no('Open both vents to let the sparks out.', 'Nothing suggests the lower vent.')], explain: { en: '〜べからず = "must not" (classical, as on signs). The topic 風の強い夜は limits when it applies. Tomoe wrote this — and someone, one windy night, didn\'t read it.' } },
      ],
    } };

  // The assembly: writing the fire back into the chronicle.
  X['co.c_assembly'] = { title: { jp: '{書|か}き{戻|もど}す {一行|いちぎょう}', en: 'The line written back' },
    tiers: {
      F: [
        { kind: 'choose', item: 'v:火事', ctx: { jp: 'トキワ が {筆|ふで} を {持|も}って {待|ま}って いる 。', en: 'Tokiwa waits with the brush.' }, prompt: { en: 'Which line should go into the chronicle?' },
          options: [{ jp: 'かじ が あった', en: 'There was a fire.', ok: true }, noJ('かじ は なかった', 'That is the line that was wrong.'), noJ('まつり が あった', 'True, but it isn\'t what was missing.')], explain: { en: 'あった = "there was". なかった = "there wasn\'t".' } },
        { kind: 'write', item: 'v:火事', prompt: { en: 'Help write it: kaji (a fire).' }, answer: 'かじ', accept: ['かじ', '火事'], mode: 'reading', explain: { jp: '{火事|かじ}', en: 'かじ — a fire (in a building or a settlement).' } },
      ],
      E: [
        { kind: 'choose', item: 'g:cop_past', ctx: { jp: 'トキワ が {筆|ふで} を {持|も}って {待|ま}って いる 。', en: 'Tokiwa waits with the brush.' }, prompt: { en: 'Which sentence should go into the chronicle?' },
          options: [{ jp: '{二十年前|にじゅうねんまえ} の {十月|じゅうがつ} {十四日|じゅうよっか} 、 {火事|かじ} が ありました 。', ok: true }, noJ('{二十年前|にじゅうねんまえ} の {十月|じゅうがつ} {十四日|じゅうよっか} 、 {火事|かじ} は ありませんでした 。', 'ありませんでした = there was NOT. That is the lie being corrected.'), noJ('{二十年前|にじゅうねんまえ} の {十月|じゅうがつ} {十四日|じゅうよっか} 、 {火事|かじ} が ある でしょう 。', 'でしょう = "probably will be" — the wrong tense for a record.')], explain: { en: 'ありました = "there was" (polite past).' } },
        { kind: 'order', item: 'g:prt_wo', prompt: { en: 'Tamotsu wants one more line under it: "We will cut the firebreaks again."' }, tiles: ['{火除|ひよ}け{道|みち}', 'を', 'また', '{刈|か}ります'], answer: ['{火除|ひよ}け{道|みち}', 'を', 'また', '{刈|か}ります'], alts: [['また', '{火除|ひよ}け{道|みち}', 'を', '{刈|か}ります']], orderHint: { en: 'Object + を, then the verb at the end. また (again) can go first or before the verb.' } },
      ],
      I: [
        { kind: 'choose', item: 'c:co_assembly_i', ctx: { jp: '{記録|きろく} に {残|のこ}す {文|ぶん} は 、 {誰|だれ} が {読|よ}んで も {分|わ}かる よう に 。', en: 'A line for the record, clear to anyone who reads it.' }, prompt: { en: 'Which is right for the chronicle?' },
          options: [{ jp: '{二十年前|にじゅうねんまえ} {十月|じゅうがつ} {十四日|じゅうよっか} の {夜|よる} 、 {大窯|おおがま} から {火|ひ} が {出|で}た 。 {上|うえ} の {段|だん} と {工房|こうぼう} {通|どお}り が {焼|や}け 、 {五人|ごにん} が {亡|な}くなった 。', ok: true },
            noJ('なんか 、 {昔|むかし} {火事|かじ} が あった みたい 。', 'Too casual and vague for a record: なんか / みたい hedge everything.'),
            noJ('{少々|しょうしょう} {困|こま}った こと が あった 。', 'This hides the fire all over again behind a euphemism.')], explain: { en: 'A record states what, where, when and who plainly.' } },
        { kind: 'order', item: 'c:co_assembly_i2', prompt: { en: 'Build the rule that goes underneath: "Keep up the firebreaks every year."' }, tiles: ['{火除|ひよ}け{道|みち}', 'の', '{手入|てい}れ', 'を', '{毎年|まいとし}', '{続|つづ}ける', 'こと'], answer: ['{火除|ひよ}け{道|みち}', 'の', '{手入|てい}れ', 'を', '{毎年|まいとし}', '{続|つづ}ける', 'こと'], alts: [['{毎年|まいとし}', '{火除|ひよ}け{道|みち}', 'の', '{手入|てい}れ', 'を', '{続|つづ}ける', 'こと']], orderHint: { en: 'Verb + こと at the end states a rule. 毎年 can open the sentence or sit before the verb.' } },
      ],
      A: [
        { kind: 'choose', item: 'c:co_assembly_a', ctx: { jp: '{二|ふた}つ の {案|あん} が ある 。', en: 'There are two drafts on the table.' }, prompt: { en: 'Which draft restores the memory without hiding it again?' },
          options: [{ jp: '{大窯|おおがま} より {出火|しゅっか} し 、 {五名|ごめい} が {亡|な}くなった 。 {我々|われわれ} は 、 それ を {長|なが}らく {忘|わす}れて いた 。', ok: true },
            noJ('{不幸|ふこう} な {出来事|できごと} が あった と {伝|つた}えられる 。', 'と伝えられる ("it is said that") and 不幸な出来事 blur both the fact and who is speaking — another kind of hush.'),
            noJ('{火事|かじ} の {件|けん} に ついて は 、 {詳細|しょうさい} を {省|はぶ}く 。', '詳細を省く = "details omitted" — the same silence, in formal dress.')], explain: { en: 'The first draft names the cause, the loss, and the forgetting itself.' } },
        { kind: 'choose', item: 'c:co_assembly_a2', ctx: { jp: '{毎年|まいとし} {秋|あき} に は 、 {必|かなら}ず {火除|ひよ}け{道|みち} を {刈|か}る ＿ 。', en: '' }, prompt: { en: 'Which ending makes this a standing rule in a record?' },
          options: [{ jp: 'こと', ok: true }, noJ('はず', 'はず = "should (be expected to)" — a prediction, not a rule.'), noJ('らしい', 'らしい = "apparently" — hearsay.')], explain: { en: 'Dictionary form + こと = an instruction or rule (as in notices and bylaws).' } },
      ],
    } };

  // Side quest: the potter's thirty.
  X['co.c_count'] = { title: { jp: '{注文書|ちゅうもんしょ}', en: 'The order slip' },
    tiers: {
      F: [
        { kind: 'choose', item: 'g:counters', prompt: { en: 'Sayo wants thirty small plates. Plates are flat. Which counter?' }, ctx: { jp: 'こざら を さんじゅう ＿', en: 'thirty small plates' },
          options: [{ jp: 'まい', en: 'flat things', ok: true }, noJ('ほん', 'ほん (本) is for long, thin things — like Nobu\'s flasks.'), noJ('ひき', 'ひき (匹) is for small animals.')], explain: { en: 'まい (枚) counts flat things: paper, plates, boards.' } },
        { kind: 'write', item: 'g:counters', prompt: { en: 'Write the counter for flat things: mai.' }, answer: 'まい', accept: ['まい', '枚'], mode: 'reading', explain: { jp: '{枚|まい}', en: '三十枚 — thirty (flat things).' } },
      ],
      E: [
        { kind: 'write', item: 'g:counters', template: { before: '{小皿|こざら} を {三十|さんじゅう}', after: 'ください 。' }, prompt: { en: 'Fill in the right counter for plates.' }, answer: 'まい', accept: ['まい', '枚'], mode: 'reading', choices: ['まい', 'ほん', 'こ', 'ひき'], explain: { jp: '{小皿|こざら} を {三十枚|さんじゅうまい} ください 。', en: '枚 counts flat things. 本 (long things) is how Nobu ended up with flasks.' } },
        { kind: 'choose', item: 'g:counters', ctx: { jp: 'ノブ は 「 {三十本|さんじゅっぽん} 」 と {聞|き}いた 。', en: '' }, prompt: { en: 'What did Nobu reasonably think he was asked for?' },
          options: [{ en: 'Something long and slender — sake flasks.', ok: true }, no('Plates.', 'Plates are flat: 枚.'), no('Teacups.', 'Cups are counted with 個 or つ, sometimes 客.')], explain: { en: '本 (ほん／ぼん／ぽん) counts long, cylindrical things.' } },
      ],
      I: [
        { kind: 'choose', item: 'g:counters', ctx: { jp: '{祭|まつ}り に {要|い}る もの ： {小|ちい}さい {皿|さら} 、 {三十|さんじゅう} 。 {湯呑|ゆの}み 、 {二十|にじゅう} 。 とっくり 、 {十|じゅう} 。', en: '' }, prompt: { en: 'Which slip has every counter right?' },
          options: [{ jp: '{小皿|こざら} {三十枚|さんじゅうまい} ・ {湯呑|ゆの}み {二十個|にじゅっこ} ・ とっくり {十本|じゅっぽん}', ok: true },
            noJ('{小皿|こざら} {三十本|さんじゅっぽん} ・ {湯呑|ゆの}み {二十枚|にじゅうまい} ・ とっくり {十個|じゅっこ}', 'That is how thirty flasks happened.'),
            noJ('{小皿|こざら} {三十個|さんじゅっこ} ・ {湯呑|ゆの}み {二十本|にじゅっぽん} ・ とっくり {十枚|じゅうまい}', 'Flasks aren\'t flat; cups aren\'t long.')], explain: { en: '枚 flat · 個 small objects · 本 long objects.' } },
        { kind: 'write', item: 'g:counters', prompt: { en: 'How do you say "thirty (long objects)" — 30 + 本 — in kana? Watch the sound change.' }, answer: 'さんじゅっぽん', accept: ['さんじゅっぽん', 'さんじっぽん', '三十本', '30本'], mode: 'reading', explain: { jp: '{三十本|さんじゅっぽん}', en: 'After じゅう, 本 becomes っぽん: さんじゅっぽん (also さんじっぽん).' } },
      ],
      A: [
        { kind: 'choose', item: 'c:co_count_a', ctx: { jp: 'サヨ が ノブ に {詫|わ}び{状|じょう} を {書|か}く 。', en: 'Sayo is writing Nobu a note of apology.' }, prompt: { en: 'Which draft is the most fitting — polite, owning the mistake, making the new request clear?' },
          options: [{ jp: '{先日|せんじつ} の {注文|ちゅうもん} は 、 こちら の {伝|つた}え{方|かた} が {悪|わる}く 、 {申|もう}し{訳|わけ} ありません でした 。 {改|あらた}めて 、 {小皿|こざら} を {三十枚|さんじゅうまい} お{願|ねが}い できます でしょう か 。', ok: true },
            noJ('{三十本|さんじゅっぽん} なんて {頼|たの}んで いない ので 、 {作|つく}り{直|なお}して ください 。', 'Polite on the surface (ください) but it pins the blame on Nobu.'),
            noJ('コタロウ が {間違|まちが}えた ので 、 {私|わたし} の せい で は ありません 。', 'Blaming a child in writing — Sayo would never forgive herself.')], explain: { en: 'こちらの伝え方が悪く = "the way we conveyed it was at fault" — taking responsibility without naming anyone.' } },
        { kind: 'choose', item: 'c:co_count_a2', ctx: { jp: '{追伸|ついしん} ： とっくり {三十本|さんじゅっぽん} は 、 {無駄|むだ} に は しません 。', en: '' }, prompt: { en: 'What does Sayo promise in the postscript?' },
          options: [{ en: 'That the thirty flasks won\'t go to waste.', ok: true }, no('That she will return the flasks.', '無駄にしない = not waste — she means to use them.'), no('That the flasks were a waste of clay.', 'は adds contrast, but the verb is negative: しません.')], explain: { en: '無駄にする = to waste; 〜にはしません adds a firm "(that, at least) I won\'t do".' } },
      ],
    } };

  // Suzu's words (both the companion and the cameo version use this).
  X['co.c_suzu'] = { title: { jp: 'スズ の {最初|さいしょ} の {一言|ひとこと}', en: 'Suzu\'s first words' },
    tiers: {
      F: [{ kind: 'choose', item: 'c:co_suzu_f', ctx: { jp: 'スズ は {言|い}う こと を {考|かんが}えて いる 。', en: 'Suzu is working out what to say.' }, prompt: { en: 'Help her choose her first words to Hiro.' },
        options: [{ jp: 'うそ を ついた 。 ごめん 。', en: 'I lied. I\'m sorry.', ok: true }, noJ('げんき ？', '"How are you?" — a joke to hide behind. She\'s done that for twenty years.'), noJ('また ね 。', '"See you." — that is how she left last time.')], explain: { en: 'うそ を つく = to tell a lie.' } }],
      E: [{ kind: 'choose', item: 'c:co_suzu_e', ctx: { jp: 'スズ は {言|い}う こと を {考|かんが}えて いる 。', en: 'Suzu is working out what to say.' }, prompt: { en: 'Which is the honest place to begin?' },
        options: [{ jp: 'あの {時|とき} 、 {本当|ほんとう} の こと が {言|い}えなかった 。', ok: true }, noJ('お{母|かあ}さん は {元気|げんき} だ よ 。', 'That repeats the lie.'), noJ('もう {忘|わす}れて いい よ 。', '"You can forget it now" — the Hush\'s answer, not hers.')], explain: { en: '言えなかった = "couldn\'t say" (potential, past negative).' } }],
      I: [{ kind: 'choose', item: 'c:co_suzu_i', ctx: { jp: 'スズ は {言|い}う こと を {考|かんが}えて いる 。', en: 'Suzu is working out what to say.' }, prompt: { en: 'Which tells the truth without hiding behind the grammar?' },
        options: [{ jp: '{君|きみ} の お{母|かあ}さん は 、 あの {夜|よる} の {火事|かじ} で {亡|な}くなった 。 {私|わたし} は それ を {知|し}って いて 、 {嘘|うそ} を ついた 。', ok: true },
          noJ('お{母|かあ}さん は 、 {遠|とお}く へ {行|い}って しまった の 。', 'A softer version of the same lie: 遠くへ行ってしまった.'),
          noJ('{私|わたし} は {嘘|うそ} を つかされた の 。', 'つかされた ("I was made to lie") shifts the blame onto someone else.')], explain: { en: '知っていて = "knowing it (all along)". The first answer names the fact and her part in it.' } }],
      A: [{ kind: 'choose', item: 'c:co_suzu_a', ctx: { jp: 'スズ は {言|い}う こと を {考|かんが}えて いる 。', en: 'Suzu is working out what to say.' }, prompt: { en: 'Which line owns what the lie cost him, without asking to be forgiven?' },
        options: [{ jp: '{慰|なぐさ}め の つもり だった 。 でも それ は 、 {君|きみ} から {悲|かな}しむ {時間|じかん} を {取|と}り{上|あ}げた 。', ok: true },
          noJ('{君|きみ} の ため を {思|おも}えば こそ だ よ 。', '〜ばこそ ("precisely because") turns the apology into a justification.'),
          noJ('{仕方|しかた} なかった ん だ 。 {子|こ}ども だった し 。', 'Excuses — 仕方なかった and 〜し pile up reasons.')], explain: { en: '〜つもりだった = "I meant it as…". 取り上げる = to take away.' } }],
    } };

  // ======================================================================================
  // Activities
  // ======================================================================================
  const A = C.activities;

  // Oral histories. The tellers tell them out of order in the scenes; the player restores the order.
  A['co.a_hist_ume'] = { type: 'history', title: { jp: 'けむり の におい', en: 'The smell of smoke' }, note: 'co_hist_ume', item: 'c:co_hist_ume',
    fragments: [
      { F: { jp: 'あめ が ふらない ひ が つづいた', en: 'Day after day without rain.' }, E: { jp: '{雨|あめ} の ない {日|ひ} が {続|つづ}いた', en: 'Day after day without rain.' }, I: { jp: 'その {秋|あき} は 、 {一月|ひとつき} {以上|いじょう} {雨|あめ} が {降|ふ}らなかった', en: 'That autumn, no rain fell for over a month.' }, A: { jp: 'その {秋|あき} は ひと{月|つき} {余|あま}り 、 {雨|あめ} {一滴|いってき} {降|ふ}らなかった', en: 'That autumn not a drop fell for more than a month.' } },
      { F: { jp: 'やま から かぜ が ふいた', en: 'A wind blew down from the mountain.' }, E: { jp: '{祭|まつ}り の {前|まえ} の {晩|ばん} 、 {山|やま} から {風|かぜ} が {吹|ふ}いた', en: 'On festival eve, a wind came off the mountain.' }, I: { jp: '{祭|まつ}り の {前|まえ} の {晩|ばん} 、 {山|やま} から {乾|かわ}いた {風|かぜ} が {吹|ふ}き{下|お}ろした', en: 'On festival eve, a dry wind swept down off the mountain.' }, A: { jp: '{宵宮|よいみや} の {晩|ばん} 、 {山|やま} から {乾|かわ}いた {風|かぜ} が {吹|ふ}き{下|お}ろして きた', en: 'On the eve of the festival, a dry wind came sweeping down.' } },
      { F: { jp: 'けむり の におい で おきた', en: 'I woke to the smell of smoke.' }, E: { jp: 'けむり の におい で {目|め} が {覚|さ}めた', en: 'The smell of smoke woke me.' }, I: { jp: 'けむり の におい で {目|め} が {覚|さ}める と 、 {空|そら} が {赤|あか}かった', en: 'Smoke woke me, and the sky was red.' }, A: { jp: 'きな{臭|くさ}さ に {目|め} を {覚|さ}ます と 、 {北|きた} の {空|そら} が {赤|あか}く {染|そ}まって いた', en: 'The reek of burning woke me; the northern sky was stained red.' } },
      { F: { jp: 'みず の みち を おりた', en: 'We went down along the water channel.' }, E: { jp: 'みんな で {水路|すいろ} ぞい に {下|お}りた', en: 'Everyone went down along the channel.' }, I: { jp: '{子|こ}ども の {手|て} を {引|ひ}いて 、 {水路|すいろ} ぞい に {下|お}りた', en: 'We led the children by the hand down along the channel.' }, A: { jp: '{子|こ}ら の {手|て} を {引|ひ}き 、 {水路|すいろ} {伝|づた}い に {里|さと} まで {下|くだ}った', en: 'Hand in hand with the little ones, we followed the channel down to the village.' } },
      { F: { jp: 'あさ 、 うえ は くろかった', en: 'In the morning, the top was black.' }, E: { jp: '{朝|あさ} 、 {上|うえ} の {段|だん} は {真|ま}っ{黒|くろ} だった', en: 'In the morning, the upper terraces were black.' }, I: { jp: '{夜|よ}が{明|あ}ける と 、 {上|うえ} の {段|だん} は {真|ま}っ{黒|くろ} に なって いた', en: 'When dawn came, the upper terraces had turned black.' }, A: { jp: '{夜|よ} が {白|しら}む {頃|ころ} に は 、 {上|うえ} の {段|だん} は {黒|くろ}い {焼|や}け{野|の} と {化|か}して いた', en: 'By first light, the upper terraces had become a black waste.' } },
    ],
    question: {
      F: { kind: 'choose', item: 'c:co_hist_ume_q', prompt: { en: 'Which way did everyone go to escape?' }, options: [{ jp: 'みず の みち', en: 'along the water channel', ok: true }, noJ('やま の うえ', 'The fire was up the mountain.'), noJ('まつり の ひろば', 'The square came later — first the channel.')] },
      E: { kind: 'choose', item: 'c:co_hist_ume_q', prompt: { en: 'Which way did everyone escape?' }, options: [{ en: 'Down along the channel.', ok: true }, no('Up to the upper terraces.', 'That is where the fire was.'), no('Out along the Saltglass road.', 'Ume said 水路ぞい — along the channel.')] },
      I: { kind: 'choose', item: 'c:co_hist_ume_q', prompt: { en: 'Why might the square have been built where it is?' }, options: [{ en: 'The channel runs past it, so people fleeing downhill along the water reach it — it\'s an escape route.', ok: true }, no('For the view of the upper terraces.', 'Nothing Ume says is about the view.'), no('Because the ground is flat for dancing.', 'Maybe — but her story points to the channel.')] },
      A: { kind: 'choose', item: 'c:co_hist_ume_q', prompt: { en: 'What does 焼け野と化していた convey, compared with 黒かった?' }, options: [{ en: 'Not just a colour: the terraces had been transformed into burned wasteland.', ok: true }, no('That the soil was naturally dark.', '化す = to be transformed (into).'), no('That the fields were being cleared by burning on purpose.', 'Nothing suggests intent.')] },
    } };

  A['co.a_hist_goro'] = { type: 'history', title: { jp: '{一度|いちど} だけ {鳴|な}った {鐘|かね}', en: 'The bell that rang once' }, note: 'co_hist_goro', item: 'c:co_hist_goro',
    fragments: [
      { F: { jp: 'よる 、 やぐら に いた', en: 'At night I was up the lookout.' }, E: { jp: '{夜|よる} 、 {櫓|やぐら} の {上|うえ} で {番|ばん} を して いた', en: 'That night I was on watch up the lookout.' }, I: { jp: 'あの {晩|ばん} は 、 {櫓|やぐら} の {上|うえ} で {夜|よ}{番|ばん} を して いた', en: 'That night I had the night watch up the lookout.' }, A: { jp: 'あの {晩|ばん} 、 わし は {櫓|やぐら} で {夜|よ}{番|ばん} に {立|た}って おった', en: 'That night I stood the night watch on the lookout.' } },
      { F: { jp: 'うえ に あかい ひかり', en: 'A red light, up top.' }, E: { jp: '{上|うえ} の {段|だん} に {赤|あか}い {光|ひかり} が {見|み}えた', en: 'I saw a red light on the upper terraces.' }, I: { jp: '{上|うえ} の {段|だん} の {辺|あた}り が 、 ぼうっと {赤|あか}く {光|ひか}って いた', en: 'Up around the top terraces, something glowed a dull red.' }, A: { jp: '{上|うえ} の {段|だん} が 、 {妙|みょう} に {赤|あか}く {明|あか}るんで おった', en: 'The upper terraces were strangely bright with red.' } },
      { F: { jp: 'かね を たくさん ならした', en: 'I rang the bell again and again.' }, E: { jp: '{腕|うで} が {痛|いた}く なる まで {鐘|かね} を {鳴|な}らした', en: 'I rang the bell until my arms hurt.' }, I: { jp: '{腕|うで} が {上|あ}がらなく なる まで 、 {鐘|かね} を {鳴|な}らし{続|つづ}けた', en: 'I kept ringing the bell until I couldn\'t lift my arms.' }, A: { jp: '{腕|うで} が {利|き}かなく なる まで 、 {無我夢中|むがむちゅう} で {鐘|かね} を {打|う}ち{続|つづ}けた', en: 'I struck the bell without thinking, until my arms gave out.' } },
      { F: { jp: 'みんな おけ を もって はしった', en: 'Everyone ran with buckets.' }, E: { jp: '{提灯|ちょうちん} が {桶|おけ} を {持|も}って {水路|すいろ} へ {走|はし}った', en: 'Lanterns ran to the channel carrying buckets.' }, I: { jp: '{下|した} で は 、 {提灯|ちょうちん} の {灯|ひ} が いくつ も {水路|すいろ} へ {走|はし}って いった', en: 'Below, lantern lights by the dozen went running to the channel.' }, A: { jp: '{眼下|がんか} で は 、 {桶|おけ} を {提|さ}げた {提灯|ちょうちん} の {列|れつ} が {水路|すいろ} へ と {流|なが}れて いった', en: 'Below me, a line of lanterns with buckets streamed towards the channel.' } },
      { F: { jp: 'あさ 、 つな が なかった', en: 'In the morning the rope was gone.' }, E: { jp: '{朝|あさ} に は 、 {鐘|かね} の {綱|つな} が なくなって いた', en: 'By morning, the bell rope was gone.' }, I: { jp: '{朝|あさ} {気|き} が つく と 、 {鐘|かね} の {綱|つな} が {焼|や}け{落|お}ちた よう に なくなって いた', en: 'In the morning I noticed the bell rope was gone, as if burned away.' }, A: { jp: '{夜|よ} が {明|あ}けて みる と 、 {綱|つな} は {跡形|あとかた} も なく {消|き}えて おった', en: 'When day broke, the rope had vanished without a trace.' } },
    ],
    question: {
      F: { kind: 'choose', item: 'c:co_hist_goro_q', prompt: { en: 'Why did Gorō ring the bell?' }, options: [{ en: 'He saw a red light up on the terraces.', ok: true }, no('It was the festival.', 'It was night, on watch.'), no('He was bored.', 'He rang until his arms hurt.')] },
      E: { kind: 'choose', item: 'c:co_hist_goro_q', prompt: { en: 'Why did Gorō ring the bell?' }, options: [{ en: 'He saw a red light on the upper terraces.', ok: true }, no('To start the festival.', 'He was on night watch.'), no('Because the rope had burned.', 'The rope was gone by morning — after.')] },
      I: { kind: 'choose', item: 'c:co_hist_goro_q', prompt: { en: 'What were the lanterns running to the channel carrying, and why?' }, options: [{ en: 'Buckets — to fetch water for a fire.', ok: true }, no('Festival decorations.', '桶 is a bucket.'), no('Children.', 'Ume led the children; the lanterns carried 桶.')] },
      A: { kind: 'choose', item: 'c:co_hist_goro_q', prompt: { en: 'Gorō uses おった and わし. What does that tell you?' }, options: [{ en: 'It\'s an older man\'s regional, plain speech — おる for いる, わし for "I".', ok: true }, no('He is being extremely polite.', 'おった here is plain speech, not humble keigo.'), no('He is quoting someone else.', 'He\'s telling his own memory.')] },
    } };

  A['co.a_hist_isao'] = { type: 'history', title: { jp: '{最後|さいご} の {窯焚|かまだ}き', en: 'The last firing' }, note: 'co_hist_isao', item: 'c:co_hist_isao',
    fragments: [
      { F: { jp: 'まつり の ガラス を やいて いた', en: 'We were firing glass for the festival.' }, E: { jp: '{祭|まつ}り の {灯籠|とうろう} の ガラス を {焼|や}いて いた', en: 'We were firing the glass for the festival lanterns.' }, I: { jp: '{祭|まつ}り の {灯籠|とうろう} に {使|つか}う {火屋|ほや} を 、 {三十個|さんじゅっこ} {焼|や}いて いた', en: 'We were firing thirty globes for the festival lanterns.' }, A: { jp: '{祭|まつ}り の {灯籠|とうろう} の {火屋|ほや} を {三十|さんじゅう} 、 {夜|よ}{通|どお}し {焼|や}いて おった', en: 'We were firing thirty lantern globes through the night.' } },
      { F: { jp: 'トモエ が ひ を みて いた', en: 'Tomoe was watching the fire.' }, E: { jp: 'トモエ が {火|ひ} の {番|ばん} を して いた', en: 'Tomoe was keeping watch on the fire.' }, I: { jp: '{火|ひ} の {番|ばん} は トモエ で 、 {若|わか}い の が {一人|ひとり} {手伝|てつだ}って いた', en: 'Tomoe had the fire, with one youngster helping.' }, A: { jp: '{火|ひ} を {見|み}て いた の は トモエ だ 。 {見習|みなら}い が {一人|ひとり} 、 {側|そば} に ついて いた', en: 'Tomoe was watching the fire, an apprentice at her side.' } },
      { F: { jp: 'かぜ が かわった', en: 'The wind changed.' }, E: { jp: '{風|かぜ} の {向|む}き が {変|か}わった', en: 'The wind changed direction.' }, I: { jp: '{夜中|よなか} に 、 {急|きゅう} に {風|かぜ} の {向|む}き が {変|か}わった', en: 'In the middle of the night the wind suddenly turned.' }, A: { jp: '{夜半|やはん} 、 {風|かぜ} が {山|やま} から {吹|ふ}き{下|お}ろす {向|む}き に {変|か}わった', en: 'Around midnight the wind swung round to blow down off the mountain.' } },
      { F: { jp: 'てつ の と を しめた', en: 'I shut the iron door.' }, E: { jp: '{鉄|てつ} の {戸|と} を {素手|すで} で {閉|し}めた', en: 'I shut the iron door with my bare hand.' }, I: { jp: '{熱|あつ}い {鉄|てつ} の {戸|と} を 、 {素手|すで} で {押|お}して {閉|し}めた', en: 'I pushed the hot iron door shut with my bare hand.' }, A: { jp: '{焼|や}けた {鉄|てつ} の {戸|と} を 、 {構|かま}わず {素手|すで} で {閉|し}めた', en: 'Heedless, I shut the red-hot iron door with my bare hand.' } },
      { F: { jp: 'て に やけど が あった', en: 'My hand was burned.' }, E: { jp: '{気|き} が つく と 、 {手|て} に {火傷|やけど} が あった', en: 'When I came to myself, my hand was burned.' }, I: { jp: 'その {後|あと} の こと は {覚|おぼ}えて いない 。 {手|て} の {火傷|やけど} だけ が {残|のこ}った', en: 'I don\'t remember what came after. Only the burn on my hand stayed.' }, A: { jp: 'その {先|さき} は ぷっつり {途切|とぎ}れて いる 。 {残|のこ}った の は 、 この {火傷|やけど} だけ だ', en: 'After that, nothing — it just stops. All that\'s left is this burn.' } },
    ],
    question: {
      F: { kind: 'choose', item: 'c:co_hist_isao_q', prompt: { en: 'What was Tomoe doing that night?' }, options: [{ en: 'Watching the kiln fire.', ok: true }, no('Sleeping.', 'トモエ が ひ を みて いた.'), no('Decorating the square.', 'She was at the kiln.')] },
      E: { kind: 'choose', item: 'c:co_hist_isao_q', prompt: { en: 'What was Tomoe doing that night?' }, options: [{ en: 'Keeping watch on the kiln fire.', ok: true }, no('Carrying water.', 'Not in Isao\'s part of the story.'), no('Ringing the bell.', 'That was Gorō.')] },
      I: { kind: 'choose', item: 'c:co_hist_isao_q', prompt: { en: 'Who else was at the kiln with Tomoe?' }, options: [{ en: 'One young helper — an apprentice.', ok: true }, no('Isao\'s whole workshop.', '一人 — one person.'), no('Nobody.', '若いのが一人手伝っていた.')] },
      A: { kind: 'choose', item: 'c:co_hist_isao_q', prompt: { en: 'What does ぷっつり途切れている suggest about Isao\'s memory?' }, options: [{ en: 'It stops abruptly, like a cut thread — not a slow fading.', ok: true }, no('He remembers everything clearly.', '途切れる = to break off.'), no('He is refusing to talk.', 'He is describing what he can\'t reach.')] },
    } };

  // Terrace signpost.
  A['co.a_signs'] = { type: 'signpost', title: { jp: '{段々畑|だんだんばたけ} の {道|みち}しるべ', en: 'The terrace signpost' },
    places: [
      { id: 'sato', jp: '{里|さと}', en: 'the village', r: 'さと' },
      { id: 'suimon', jp: '{水門|すいもん}', en: 'the water gate', r: 'すいもん' },
      { id: 'ue', jp: '{上|うえ} の {段|だん}', en: 'the upper terraces', r: 'うえのだん' },
      { id: 'hiyoke', jp: '{火除|ひよ}け{道|みち}', en: 'the firebreak path', r: 'ひよけみち' },
    ],
    arms: [
      { dir: 'down the slope', to: 'sato', why: 'the village lies at the bottom of the terraces.',
        clue: { F: { jp: 'いえ が たくさん ある ほう', en: 'The way with lots of houses.' }, E: { jp: '{家|いえ} が {集|あつ}まって いる {方|ほう} 。 {祭|まつ}り の {音|おと} が {聞|き}こえる 。', en: 'Where the houses cluster. You can hear the festival preparations.' }, I: { jp: '{坂|さか} を {下|くだ}りきった ところ 。 {祭|まつ}り の {準備|じゅんび} の {音|おと} が {響|ひび}いて くる 。', en: 'At the bottom of the slope, where the sounds of festival work echo up.' }, A: { jp: '{段々畑|だんだんばたけ} を {下|くだ}りきれば 、 {人|ひと} の {暮|く}らし の {気配|けはい} が する 。', en: 'Go all the way down the terraces and you feel people living their lives.' } } },
      { dir: 'up and to the right', to: 'suimon', why: 'the gate at the head of the channel.',
        clue: { F: { jp: 'みず の おと が する ほう', en: 'The way you can hear water.' }, E: { jp: '{水路|すいろ} を {上|のぼ}った ところ 。 {水|みず} を {止|と}めたり {流|なが}したり する 。', en: 'Up the channel. It stops the water, or lets it run.' }, I: { jp: '{水路|すいろ} の {始|はじ}まり 。 {板|いた} を {上|あ}げれば 、 {水|みず} が {段|だん} に {回|まわ}る 。', en: 'The head of the channel. Raise the board, and water flows to the terraces.' }, A: { jp: '{堰|せき} を {上|あ}げれば 、 {水|みず} は {段|だん} から {段|だん} へ と {落|お}ちて ゆく 。', en: 'Lift the weir, and the water falls from terrace to terrace.' } } },
      { dir: 'straight up', to: 'ue', why: 'the fenced-off top terraces.',
        clue: { F: { jp: 'いちばん うえ 。 いま は だれ も いかない', en: 'The very top. Nobody goes there now.' }, E: { jp: 'いちばん {上|うえ} の {畑|はたけ} 。 {今|いま} は {誰|だれ} も {行|い}かない 。', en: 'The highest fields. Nobody goes there now.' }, I: { jp: '{柵|さく} の {向|む}こう 。 {同|おな}じ {年|とし} の {若|わか}い {木|き} ばかり が {並|なら}ぶ {畑|はたけ} 。', en: 'Beyond the fence: fields of young trees, all the same age.' }, A: { jp: '{柵|さく} の {先|さき} に は 、 {樹齢|じゅれい} の {揃|そろ}いすぎた {木|き} が {並|なら}んで いる 。', en: 'Beyond the fence stand trees whose ages are far too alike.' } } },
      { dir: 'along the slope to the left', to: 'hiyoke', why: 'a firebreak — a strip kept clear so fire has nothing to cross.',
        clue: { F: { jp: 'ひ を とめる ため の ひろい みち', en: 'A wide path for stopping fire.' }, E: { jp: '{火|ひ} が {広|ひろ}がらない よう に 、 {草|くさ} を {刈|か}って おく {広|ひろ}い {道|みち} 。 {今|いま} は {草|くさ} だらけ 。', en: 'A wide path kept mown so fire can\'t spread. Right now it\'s all weeds.' }, I: { jp: '{本来|ほんらい} は {草|くさ} を {刈|か}って おく べき {帯|おび} の よう な {道|みち} 。 {火|ひ} の {行|ゆ}く {手|て} を {阻|はば}む 。', en: 'A belt-like path that ought to be kept mown. It blocks fire\'s way forward.' }, A: { jp: '{刈|か}り{払|はら}われて いて こそ {役|やく} に {立|た}つ 、 {火|ひ} を {除|よ}ける ため の {道|みち} 。', en: 'A path for warding off fire — useful only if it\'s kept cleared.' } } },
    ] };

  // Festival invitations whose address slips fell off.
  A['co.a_letters'] = { type: 'letters', title: { jp: '{祭|まつ}り の {招待状|しょうたいじょう}', en: 'Festival invitations' },
    recipients: [
      { id: 'ume', name: { jp: 'ウメ', en: 'Grandma Ume' }, desc: { F: { jp: 'だんだんばたけ で かき を そだてて いる', en: 'Grows persimmons on the terraces.' }, E: { jp: '{段々畑|だんだんばたけ} で {柿|かき} を {育|そだ}てて いる 。', en: 'Grows persimmons on the terraces.' } } },
      { id: 'goro', name: { jp: 'ゴロウ', en: 'Old Gorō' }, desc: { F: { jp: 'やぐら の かね を みがいて いる', en: 'Polishes the lookout bell.' }, E: { jp: '{毎朝|まいあさ} 、 {櫓|やぐら} の {鐘|かね} を {磨|みが}いて いる 。', en: 'Polishes the lookout bell every morning.' } } },
      { id: 'isao', name: { jp: 'イサオ', en: 'Master Isao' }, desc: { F: { jp: 'ガラス の しごと を して いる', en: 'Works with glass.' }, E: { jp: 'ガラス {工房|こうぼう} の {親方|おやかた} 。', en: 'Master of the glass workshop.' } } },
      { id: 'nobu', name: { jp: 'ノブ', en: 'Nobu' }, desc: { F: { jp: 'さら や ちゃわん を つくる', en: 'Makes plates and bowls.' }, E: { jp: '{焼|や}き{物|もの} を {作|つく}って いる 。', en: 'Makes pottery.' } } },
      { id: 'tamotsu', name: { jp: 'タモツ', en: 'Tamotsu' }, desc: { F: { jp: 'みず の ばん を して いる', en: 'Looks after the water.' }, E: { jp: '{水路|すいろ} の {番|ばん} を して いる 。', en: 'Keeps the channel.' } } },
      { id: 'fusa', name: { jp: 'フサ', en: 'Fusa' }, desc: { F: { jp: 'やど と ちゃや を して いる', en: 'Runs the inn and teahouse.' }, E: { jp: '{宿|やど} と {茶屋|ちゃや} を やって いる 。', en: 'Runs the inn and teahouse.' } } },
    ],
    letters: [
      { to: 'nobu', items: ['c:co_letter1'], text: { F: { jp: 'きょねん の さら 、 ぜんぶ ある よ 。 ことし も たのしみ 。', en: 'Last year\'s plates — every one is still in one piece. Looking forward to this year.' }, E: { jp: '{去年|きょねん} の {小皿|こざら} 、 {一枚|いちまい} も {割|わ}れず に {残|のこ}って います 。 {今年|ことし} も {楽|たの}しみ に して います 。', en: 'Not one of last year\'s small plates has broken. Looking forward to this year.' } }, why: { en: 'Plates (皿) — the potter.' }, hint: { en: 'Who makes plates?' } },
      { to: 'tamotsu', items: ['c:co_letter2'], text: { F: { jp: 'まつり の ひ は 、 みず の ばん を やすんで ね 。', en: 'On festival day, take a break from minding the water.' }, E: { jp: '{祭|まつ}り の {日|ひ} ぐらい 、 {水|みず} の {番|ばん} は {休|やす}んで 、 {座|すわ}って ください 。', en: 'On festival day at least, stop minding the water and sit down.' } }, why: { en: 'The water watch (水の番) is Tamotsu\'s job.' }, hint: { en: 'Who minds the water?' } },
      { to: 'ume', items: ['c:co_letter3'], text: { F: { jp: 'ことし の かき は あまい と ききました 。', en: 'I hear this year\'s persimmons are sweet.' }, E: { jp: '{今年|ことし} の {柿|かき} は {特別|とくべつ} {甘|あま}い と {聞|き}きました 。 {段々畑|だんだんばたけ} の {坂|さか} 、 {足元|あしもと} に {気|き} を つけて 。', en: 'I hear this year\'s persimmons are especially sweet. Mind your step on the terrace slopes.' } }, why: { en: 'Persimmons and terraces — Ume.' }, hint: { en: 'Who grows the persimmons?' } },
      { to: 'goro', items: ['c:co_letter4'], text: { F: { jp: 'まいあさ かね を ぴかぴか に して くれて ありがとう 。', en: 'Thank you for making the bell shine every morning.' }, E: { jp: '{毎朝|まいあさ} {鐘|かね} を {磨|みが}いて くれて 、 ありがとう 。 {今度|こんど} 、 {櫓|やぐら} から の {景色|けしき} を {見|み}せて ください 。', en: 'Thank you for polishing the bell every morning. Some day, show me the view from the lookout.' } }, why: { en: 'The bell and the lookout — Gorō.' }, hint: { en: 'Who looks after the bell?' } },
      { to: 'isao', items: ['c:co_letter5'], text: { F: { jp: 'ことし も ガラス の ほや を 30 こ おねがい します 。', en: 'Thirty glass globes again this year, please.' }, E: { jp: '{今年|ことし} も {灯籠|とうろう} の {火屋|ほや} を {三十個|さんじゅっこ} お{願|ねが}い します 。 {窯|かま} の {具合|ぐあい} は いかが です か 。', en: 'Thirty lantern globes again this year, please. How is the kiln?' } }, why: { en: 'Lantern globes from the kiln — the glass master.' }, hint: { en: 'Who makes glass?' } },
    ] };

  // Festival-eve rush at Fusa's teahouse.
  A['co.a_orders'] = { type: 'orders', title: { jp: '{祭|まつ}り {前|まえ} の {茶屋|ちゃや}', en: 'The teahouse before the festival' },
    menu: [
      { id: 'kaki', jp: '{干|ほ}し{柿|がき}', en: 'dried persimmon' },
      { id: 'kuri', jp: '{焼|や}き{栗|ぐり}', en: 'roasted chestnuts (a bag)' },
      { id: 'tea', jp: 'お{茶|ちゃ}', en: 'tea (a cup)' },
      { id: 'amazake', jp: '{甘酒|あまざけ}', en: 'amazake (a cup)' },
      { id: 'onigiri', jp: 'おにぎり', en: 'rice ball' },
    ],
    customers: [
      { who: 'co_heita', want: { tea: 3 }, items: ['g:counters'],
        line: { F: { jp: 'おちゃ を みっつ 。 みんな の ぶん 。', en: 'Three teas. One for everyone.' }, E: { jp: 'お{茶|ちゃ} を {三杯|さんばい} ください 。 {草刈|くさか}り の みんな の {分|ぶん} です 。', en: 'Three cups of tea, please. For the grass-cutting crew.' }, I: { jp: '{草刈|くさか}り {組|ぐみ} に お{茶|ちゃ} を 。 {俺|おれ} を {入|い}れて {三人|さんにん} だ から 、 {三杯|さんばい} 。', en: 'Tea for the grass crew. Three of us counting me, so three cups.' }, A: { jp: '{三人|さんにん} {分|ぶん} 、 お{茶|ちゃ} を 。 …… {働|はたら}いて ない の に 、 って {顔|かお} しない で よ 。', en: 'Tea for three. …Don\'t make that face like I haven\'t done any work.' } },
        hint: { en: 'How many cups — and of what?' }, thanks: { jp: 'よし 、 これ で {昼寝|ひるね} …… いや 、 {仕事|しごと} だ 。', en: 'Right, now a nap… I mean, work.' } },
      { who: 'co_asa', want: { kaki: 4, tea: 1 }, items: ['g:counters'],
        line: { F: { jp: 'ほしがき を よっつ と 、 おちゃ を ひとつ 。', en: 'Four dried persimmons and one tea.' }, E: { jp: '{干|ほ}し{柿|がき} を {四|よっ}つ と 、 お{茶|ちゃ} を {一杯|いっぱい} お{願|ねが}い します 。', en: 'Four dried persimmons and a cup of tea, please.' }, I: { jp: '{干|ほ}し{柿|がき} {四|よっ}つ 。 あと お{茶|ちゃ} {一杯|いっぱい} 。 {甘酒|あまざけ} じゃ なくて 、 お{茶|ちゃ} ね 。', en: 'Four dried persimmons. And one tea — tea, not amazake.' }, A: { jp: '{干|ほ}し{柿|がき} を {四|よっ}つ 、 {包|つつ}んで もらえる ？ それ と 、 ここ で {飲|の}む お{茶|ちゃ} を {一杯|いっぱい} 。', en: 'Could you wrap four dried persimmons? And one tea to drink here.' } },
        hint: { en: 'Two different things — count each.' }, thanks: { jp: 'ありがとう 。 {上|うえ} の {段|だん} の {柿|かき} より {甘|あま}い かも 。', en: 'Thanks. Maybe sweeter than the upper-terrace ones.' } },
      { who: 'co_kotaro', want: { onigiri: 2 }, items: ['g:v_nai'],
        line: { F: { jp: 'おにぎり ふたつ ！ おちゃ は いらない ！', en: 'Two rice balls! No tea!' }, E: { jp: 'おにぎり を {二|ふた}つ ください ！ お{茶|ちゃ} は いらない よ 。', en: 'Two rice balls, please! I don\'t want tea.' }, I: { jp: 'おにぎり {二|ふた}つ ！ お{茶|ちゃ} は {苦|にが}い から いらない 。', en: 'Two rice balls! No tea — it\'s bitter.' }, A: { jp: 'おにぎり {二|ふた}つ 。 お{茶|ちゃ} ？ {大人|おとな} じゃ ない んだ から 、 {要|い}らない って ば 。', en: 'Two rice balls. Tea? I\'m not a grown-up, I said I don\'t want any!' } },
        hint: { en: 'He said what he doesn\'t want, too.' }, thanks: { jp: 'やった ！ {一|ひと}つ は ゴロウ じいちゃん の 。', en: 'Yes! One\'s for Grandpa Gorō.' } },
      { who: 'co_goro', want: { amazake: 1, kuri: 1 }, items: ['g:counters'],
        line: { F: { jp: 'あまざけ ひとつ と 、 やきぐり ひとつ 。', en: 'One amazake and one bag of chestnuts.' }, E: { jp: '{甘酒|あまざけ} を {一杯|いっぱい} と 、 {焼|や}き{栗|ぐり} を {一袋|ひとふくろ} 。', en: 'A cup of amazake and a bag of roast chestnuts.' }, I: { jp: '{甘酒|あまざけ} を {一杯|いっぱい} {頼|たの}む 。 {栗|くり} も {一袋|ひとふくろ} 。 {櫓|やぐら} の {上|うえ} は {冷|ひ}える んで な 。', en: 'One amazake. And a bag of chestnuts — it gets cold up the lookout.' }, A: { jp: '{甘酒|あまざけ} と {栗|くり} を {一|ひと}つ ずつ 。 {櫓|やぐら} の {上|うえ} は 、 {日|ひ} が {落|お}ちる と {冷|ひ}えて かなわん 。', en: 'One each of amazake and chestnuts. Up the lookout, once the sun\'s down, the cold is unbearable.' } },
        hint: { en: 'One of each?' }, thanks: { jp: 'うむ 。 {温|あたた}まる 。', en: 'Mm. That warms the bones.' } },
      { who: 'co_shino', want: { kaki: 2, amazake: 2 }, items: ['g:counters'],
        line: { F: { jp: 'ほしがき ふたつ と 、 あまざけ ふたつ 。', en: 'Two dried persimmons and two amazake.' }, E: { jp: '{干|ほ}し{柿|がき} を {二|ふた}つ と 、 {甘酒|あまざけ} を {二杯|にはい} ください 。', en: 'Two dried persimmons and two amazake, please.' }, I: { jp: '{甘酒|あまざけ} を {二杯|にはい} 。 {一杯|いっぱい} は {配達|はいたつ} の {人|ひと} に 。 それ と {干|ほ}し{柿|がき} を {二|ふた}つ 。', en: 'Two amazake — one\'s for the courier. And two dried persimmons.' }, A: { jp: '{干|ほ}し{柿|がき} {二|ふた}つ に 、 {甘酒|あまざけ} も {二杯|にはい} 。 {手紙|てがみ} を {待|ま}つ {間|あいだ} くらい 、 {甘|あま}い もの が ほしい の 。', en: 'Two persimmons, and two amazake. While I wait on letters, I want something sweet.' } },
        hint: { en: 'Count both items.' }, thanks: { jp: 'ありがとう 。 {招待状|しょうたいじょう} 、 {助|たす}かった わ 。', en: 'Thank you. And thanks for the invitations.' } },
    ] };

  // ======================================================================================
  // Drills (region: cinder)
  // ======================================================================================
  const w = (id, lv, item, prompt, answer, accept, extra) => Object.assign({ id, lv, tags: ['cinder'], kind: 'write', item, prompt: { en: prompt }, answer, accept, mode: 'reading' }, extra || {});
  const c = (id, lv, item, ctx, prompt, options, extra) => Object.assign({ id, lv, tags: ['cinder'], kind: 'choose', item, ctx, prompt: { en: prompt }, options }, extra || {});
  const o = (id, lv, item, prompt, tiles, extra) => Object.assign({ id, lv, tags: ['cinder'], kind: 'order', item, prompt: { en: prompt }, tiles, answer: tiles.slice() }, extra || {});
  C.addDrills([
    // ---- Foundations (kana through everyday words) ----
    w('co.d_f1', 'F', 'v:火', 'Write "fire" (hi).', 'ひ', ['ひ', '火'], { explain: { jp: '{火|ひ}', en: 'ひ — fire.' } }),
    w('co.d_f2', 'F', 'v:石', 'Write "stone" (ishi).', 'いし', ['いし', '石'], { explain: { jp: '{石|いし}', en: 'いし — stone.' } }),
    w('co.d_f3', 'F', 'v:土', 'Write "earth, soil" (tsuchi).', 'つち', ['つち', '土'], { explain: { jp: '{土|つち}', en: 'つち — earth, soil.' } }),
    w('co.d_f4', 'F', 'v:氷', 'Write "ice" (koori). The long o is spelled お.', 'こおり', ['こおり', '氷'], { explain: { jp: '{氷|こおり}', en: 'こおり — ice.' } }),
    w('co.d_f5', 'F', 'v:柿', 'Write "persimmon" (kaki).', 'かき', ['かき', '柿'], { explain: { jp: '{柿|かき}', en: 'かき — persimmon.' } }),
    w('co.d_f6', 'F', 'v:窯', 'Write "kiln" (kama).', 'かま', ['かま', '窯'], { explain: { jp: '{窯|かま}', en: 'かま — kiln.' } }),
    w('co.d_f7', 'F', 'v:煙', 'Write "smoke" (kemuri).', 'けむり', ['けむり', '煙'], { explain: { jp: '{煙|けむり}', en: 'けむり — smoke.' } }),
    w('co.d_f8', 'F', 'v:鐘', 'Write "(temple / alarm) bell" (kane).', 'かね', ['かね', '鐘'], { explain: { jp: '{鐘|かね}', en: 'かね — a large bell. (Also "money", written 金.)' } }),
    c('co.d_f9', 'F', 'v:灰', { jp: 'はい', big: true }, 'In the orchard, はい can be "yes" — or what else?', [{ en: 'ash', ok: true }, no('stone', 'Stone is いし.'), no('rain', 'Rain is あめ.')], { explain: { jp: '{灰|はい}', en: '灰 (はい) — ash. Context tells it apart from はい "yes".' } }),
    c('co.d_f10', 'F', 'v:席', { jp: 'この せき は あいて いる 。', en: '' }, 'What is empty?', [{ en: 'a seat', ok: true }, no('a cup', 'A cup would be コップ or ゆのみ.'), no('a bell', 'A bell is かね or すず.')], { explain: { jp: '{席|せき}', en: 'せき (席) — a seat, a place at an event.' } }),
    // ---- Elementary ----
    w('co.d_e1', 'E', 'g:counters', 'Plates are flat. "Three plates" = さら を さん＿. Write the counter.', 'まい', ['まい', '枚'], { template: { before: 'お{皿|さら} を {三|さん}', after: '' }, choices: ['まい', 'ほん', 'こ'], explain: { jp: '{三枚|さんまい}', en: '枚 counts flat things.' } }),
    w('co.d_e2', 'E', 'g:counters', 'How do you read 三本 (three long things)? Watch the sound change.', 'さんぼん', ['さんぼん', '三本'], { choices: ['さんぼん', 'さんほん', 'さんぽん'], explain: { jp: '{三本|さんぼん}', en: 'After さん, 本 becomes ぼん.' } }),
    w('co.d_e3', 'E', 'g:counters', 'How do you read 一本 (one long thing)?', 'いっぽん', ['いっぽん', '一本'], { choices: ['いっぽん', 'いちほん', 'いちぼん'], explain: { jp: '{一本|いっぽん}', en: 'いち + ほん → いっぽん.' } }),
    w('co.d_e4', 'E', 'g:counters', 'How do you read 六本?', 'ろっぽん', ['ろっぽん', '六本'], { choices: ['ろっぽん', 'ろくほん', 'ろくぼん'], explain: { jp: '{六本|ろっぽん}', en: 'ろく + ほん → ろっぽん.' } }),
    c('co.d_e5', 'E', 'g:counters', { jp: '{家|いえ} が {三軒|さんげん} ある 。', en: '' }, 'What is counted here?', [{ en: 'three houses', ok: true }, no('three trees', 'Trees take 本.'), no('three people', 'People take 人.')], { explain: { jp: '{軒|けん}', en: '軒 counts buildings and households (さんげん: け→げ after さん).' } }),
    w('co.d_e6', 'E', 'g:counters', 'Write the reading of 二十日 (the 20th of the month).', 'はつか', ['はつか', '二十日', '20日'], { choices: ['はつか', 'にじゅうにち', 'にじゅうか'], explain: { jp: '{二十日|はつか}', en: 'The 20th has its own reading: はつか.' } }),
    w('co.d_e7', 'E', 'g:counters', 'Write the reading of 十日 (the 10th of the month).', 'とおか', ['とおか', '十日', '10日'], { choices: ['とおか', 'じゅうにち', 'とうか'], explain: { jp: '{十日|とおか}', en: 'とおか — spelled with お.' } }),
    c('co.d_e8', 'E', 'g:v_naide_kudasai', { jp: '{窓|まど} を {開|あ}けないで ください 。', en: '' }, 'What does the sign ask?', [{ en: 'Please don\'t open the window.', ok: true }, no('Please open the window.', 'ないで = don\'t.'), no('The window won\'t open.', 'That would be 開きません.')], { explain: { en: '〜ないでください = please don\'t…' } }),
    c('co.d_e9', 'E', 'g:conj_kara', { jp: '{雨|あめ} が {降|ふ}らない から 、 {畑|はたけ} が {乾|かわ}いて いる 。', en: '' }, 'Why are the fields dry?', [{ en: 'Because it isn\'t raining.', ok: true }, no('Because it is raining.', '降らない = doesn\'t fall.'), no('Because the channel is full.', 'Not mentioned.')], { explain: { en: 'X から Y — because X, Y.' } }),
    w('co.d_e10', 'E', 'v:煙', 'The smell that woke Ume: けむり の ＿ (nioi). Write "smell".', 'におい', ['におい', '匂い', '臭い'], { template: { before: 'けむり の', after: '' }, explain: { jp: 'におい', en: 'におい — a smell (匂い for pleasant, 臭い for unpleasant).' } }),
    c('co.d_e11', 'E', 'g:v_te_iru', { jp: 'ゴロウ は {毎朝|まいあさ} {鐘|かね} を {磨|みが}いて いる 。', en: '' }, 'What does this say?', [{ en: 'Gorō polishes the bell every morning.', ok: true }, no('Gorō polished the bell once.', '毎朝 + ている = habit.'), no('Gorō is going to polish the bell.', 'ている isn\'t future here.')], { explain: { en: '〜ている with 毎朝 = a habit.' } }),
    o('co.d_e12', 'E', 'g:prt_wo', 'Build: "I cut the grass."', ['{草|くさ}', 'を', '{刈|か}ります']),
    o('co.d_e13', 'E', 'g:prt_ni', 'Build: "There is a bell on the lookout."', ['{櫓|やぐら}', 'に', '{鐘|かね}', 'が', 'あります'], { alts: [['{鐘|かね}', 'が', '{櫓|やぐら}', 'に', 'あります']] }),
    c('co.d_e14', 'E', 'g:cop_past', { jp: '{昔|むかし} 、 ここ は {畑|はたけ} でした 。', en: '' }, 'What does this say?', [{ en: 'Long ago, this was a field.', ok: true }, no('This will be a field.', 'でした is past.'), no('This isn\'t a field.', 'That would be じゃありません.')], { explain: { en: 'でした = was (polite).' } }),
    // ---- Intermediate ----
    c('co.d_i1', 'I', 'g:v_te_kara', { jp: '{窯|かま} が {冷|さ}めて から 、 {火屋|ほや} を {出|だ}す 。', en: '' }, 'When are the globes taken out?', [{ en: 'After the kiln has cooled.', ok: true }, no('Before the kiln cools.', 'てから = after.'), no('While the kiln is firing.', 'That would be 〜ている間に.')], { explain: { en: '〜てから = after doing.' } }),
    c('co.d_i2', 'I', 'g:cond_tara', { jp: '{風|かぜ} が {強|つよ}く なったら 、 {窓|まど} を {閉|し}めて 。', en: '' }, 'When should the vent be shut?', [{ en: 'Once the wind gets strong.', ok: true }, no('Always.', 'たら makes it conditional.'), no('Only when there\'s no wind.', 'The opposite.')], { explain: { en: '〜たら = if/when (once it happens).' } }),
    c('co.d_i3', 'I', 'g:temo', { jp: '{雨|あめ} が {降|ふ}って も 、 {祭|まつ}り は やる 。', en: '' }, 'What happens if it rains?', [{ en: 'The festival goes ahead anyway.', ok: true }, no('The festival is cancelled.', 'ても = even if.'), no('The festival is moved.', 'Not stated.')], { explain: { en: '〜ても = even if.' } }),
    c('co.d_i4', 'I', 'g:noni', { jp: '{火事|かじ} は なかった はず な のに 、 {焦|こ}げた {梁|はり} が ある 。', en: '' }, 'What feeling does のに carry here?', [{ en: 'Surprise at a contradiction: there "shouldn\'t" have been a fire, yet there\'s a burned beam.', ok: true }, no('A simple reason.', 'のに isn\'t ので.'), no('A wish.', 'のに can express regret, but here it links a contradiction.')], { explain: { en: '〜のに = even though (with surprise or frustration).' } }),
    c('co.d_i5', 'I', 'g:hazu', { jp: 'この {里|さと} は {一度|いちど} も {燃|も}えて いない はず だ 。', en: '' }, 'How sure is the speaker, and on what basis?', [{ en: 'They expect it to be true — based on what they\'ve been told or read.', ok: true }, no('They saw it with their own eyes.', 'はず is expectation, not witness.'), no('They hope it will burn.', 'No.')], { explain: { en: '〜はず = should be (by reasoning or information).' } }),
    c('co.d_i6', 'I', 'g:sou_hear', { jp: '{昔|むかし} 、 {大|おお}きな {窯|かま} が あった そう だ 。', en: '' }, 'How does the speaker know?', [{ en: 'They heard it from someone.', ok: true }, no('They saw the kiln.', 'そうだ after a plain verb = hearsay.'), no('It looks like there is a kiln.', 'That would be ありそう.')], { explain: { en: 'Plain form + そうだ = "I hear that".' } }),
    c('co.d_i7', 'I', 'g:te_shimau', { jp: '{大事|だいじ} な こと を {忘|わす}れて しまった 。', en: '' }, 'What does しまった add?', [{ en: 'Regret — forgetting it was a loss.', ok: true }, no('Pride.', 'てしまう often carries regret.'), no('An intention to forget.', 'That would be 忘れよう.')], { explain: { en: '〜てしまう = completely / regrettably.' } }),
    c('co.d_i8', 'I', 'g:passive', { jp: '{記録|きろく} が {書|か}き{換|か}えられた 。', en: '' }, 'What happened to the record?', [{ en: 'Someone rewrote it.', ok: true }, no('It rewrote something.', 'られた = passive: it was rewritten.'), no('It can be rewritten.', 'Potential would be context-dependent; here it is past passive.')], { explain: { en: 'Passive 〜られる: the subject undergoes the action.' } }),
    o('co.d_i9', 'I', 'g:v_te_kara', 'Build: "After the grass is cut, the fire won\'t spread."', ['{草|くさ}', 'を', '{刈|か}って', 'から', '{火|ひ}', 'は', '{広|ひろ}がらない']),
    c('co.d_i10', 'I', 'g:you_mitai', { jp: '{古|ふる}い {木|き} から 、 けむり の におい が する よう だ 。', en: '' }, 'How certain is the speaker?', [{ en: 'It seems so to them — a sensory impression.', ok: true }, no('Completely certain.', 'ようだ softens it.'), no('They heard someone say so.', 'That would be そうだ (hearsay).')], { explain: { en: '〜ようだ = it seems (based on one\'s own impression).' } }),
    c('co.d_i11', 'I', 'g:conj_node', { jp: '{風|かぜ} が {強|つよ}い ので 、 {窯|かま} は {焚|た}かない 。', en: '' }, 'What is decided, and why?', [{ en: 'No firing, because the wind is strong.', ok: true }, no('Fire the kiln because it\'s windy.', '焚かない = won\'t fire.'), no('The wind is strong because of the kiln.', 'ので follows the reason.')], { explain: { en: '〜ので = because (softer, explanatory).' } }),
    w('co.d_i12', 'I', 'v:覚える', 'Complete: "I don\'t remember" — ＿ていない (oboete).', 'おぼえて', ['おぼえて', '覚えて'], { template: { before: '', after: 'いない 。' }, explain: { jp: '{覚|おぼ}えて いない', en: '覚えていない = don\'t remember (the memory isn\'t "in" you).' } }),
    // ---- Advanced ----
    c('co.d_a1', 'A', 'g:adv_kanenai', { jp: 'この まま {草|くさ} を {放|ほう}って おけば 、 {大火|たいか} に なり かねない 。', en: '' }, 'What is the speaker warning?', [{ en: 'Leaving the grass could well lead to a great fire.', ok: true }, no('A great fire is impossible.', 'かねない = could well (a bad outcome).'), no('The grass will stop a fire.', 'The opposite.')], { explain: { en: '〜かねない = there is a real risk that…' } }),
    c('co.d_a2', 'A', 'g:adv_wake_dewa_nai', { jp: '{記録|きろく} を {否定|ひてい} する わけ で は ない 。 ただ 、 {抜|ぬ}けて いる 。', en: '' }, 'What is the stance?', [{ en: 'Not rejecting the record outright — just saying something is missing from it.', ok: true }, no('The record is entirely false.', 'わけではない = it isn\'t that…'), no('Nothing is missing.', 'ただ、抜けている.')], { explain: { en: '〜わけではない = it is not (necessarily) the case that…' } }),
    c('co.d_a3', 'A', 'g:adv_zaru_wo_enai', { jp: 'ここ まで {証拠|しょうこ} が {揃|そろ}えば 、 {認|みと}めざる を {得|え}ない 。', en: '' }, 'What is Tokiwa admitting?', [{ en: 'With this much evidence, he has no choice but to accept it.', ok: true }, no('He refuses to accept it.', 'ざるを得ない = cannot help but.'), no('He needs more evidence.', 'ここまで揃えば — this is enough.')], { explain: { en: '〜ざるを得ない = have no choice but to.' } }),
    c('co.d_a4', 'A', 'g:adv_to_wa_ie', { jp: '{辛|つら}い {記憶|きおく} と は いえ 、 {忘|わす}れた まま で は {人|ひと} が {死|し}ぬ 。', en: '' }, 'What is the argument?', [{ en: 'Granted it\'s painful, but staying forgotten will get people killed.', ok: true }, no('Because it\'s painful, it should stay forgotten.', 'とはいえ = that said / granted, but.'), no('Painful memories kill people.', 'It\'s the forgetting that endangers them.')], { explain: { en: '〜とはいえ = even though / that said.' } }),
    c('co.d_a5', 'A', 'c:co_d_a5', { jp: '{誰|だれ} も {口|くち} に は {出|だ}さない が 、 {皆|みな} どこ か で {分|わ}かって いた 。', en: '' }, 'What does the sentence imply?', [{ en: 'Nobody said it aloud, but everyone knew, somewhere.', ok: true }, no('Nobody knew anything.', 'どこかで分かっていた = knew somewhere, deep down.'), no('Everyone talked about it.', '口には出さない = didn\'t voice it.')], { explain: { en: '口に出す = to say aloud. どこかで = somewhere (in themselves).' } }),
    c('co.d_a6', 'A', 'c:co_d_a6', { jp: '{守|まも}る つもり で {黙|だま}って いた の が 、 かえって {子|こ} を {傷|きず}つけた 。', en: '' }, 'What does かえって do here?', [{ en: 'It marks an outcome opposite to the intention: silence meant to protect ended up hurting.', ok: true }, no('It means "again".', 'かえって = on the contrary / instead.'), no('It means "returned home".', 'Different word (帰って).')], { explain: { en: 'かえって = contrary to expectation.' } }),
    c('co.d_a7', 'A', 'c:co_d_a7', { jp: '{悲|かな}しみ を {預|あず}けた の は 、 {我々|われわれ} {自身|じしん} だった 。', en: '' }, 'What is being admitted?', [{ en: 'We ourselves were the ones who handed our grief over.', ok: true }, no('Someone stole our grief.', '預けた = entrusted, handed over (willingly).'), no('We received someone else\'s grief.', 'The subject gave, not received.')], { explain: { en: '預ける = to entrust into someone\'s keeping. の は…だった = "it was … who".' } }),
    c('co.d_a8', 'A', 'c:co_d_a8', { jp: '{祭|まつ}り の {灯|ひ} を {絶|た}やさない こと 。 それ が この {里|さと} の {習|なら}わし だ 。', en: '' }, 'What is described?', [{ en: 'A village custom: never letting the festival lights go out.', ok: true }, no('A law against lanterns.', '絶やさない = not let die out.'), no('A one-time event.', '習わし = custom, practice.')], { explain: { en: '絶やす = let die out; 習わし = custom.' } }),
  ]);

  // ======================================================================================
  // Enemies (Inkweaving)
  // ======================================================================================
  const EN = C.enemies;
  const pool = { tags: ['cinder'], F: ['v:火', 'v:石', 'v:土', 'v:柿'], E: ['v:灰', 'v:石', 'v:土', 'v:火', 'v:煙', 'v:柿', 'v:窯'], I: ['v:覚える', 'v:燃える', 'v:逃げる'], A: [] };

  EN['co.moth'] = { name: { en: 'Ash Moth', jp: '{灰|はい}{蛾|が}' }, art: 'moth', artOpts: { col: '#b8b0a8', col2: '#8a827a' }, look: { custom: 'moth', col: '#b8b0a8' },
    region: 'cinder', bg: 'cinder', knots: 2, pool, pattern: ['gust', 'strike', 'rest', 'strike'],
    intro: { jp: '{灰|はい} を まとった {蛾|が} が 、 {羽|はね} で {風|かぜ} を {起|お}こす 。', en: 'A moth dusted grey with ash beats up a wind with its wings.' },
    settle: { jp: '{蛾|が} は {灰|はい} を {落|お}として 、 ふつう の {白|しろ}い {蛾|が} に {戻|もど}った 。', en: 'The moth shakes off its ash and is only a small white moth again.' } };
  EN['co.soot'] = { setting: 'outdoor', name: { en: 'Smoke Blot', jp: '{煙|けむり}だまり' }, art: 'blot', artOpts: { col: '#4a4440' }, look: { custom: 'blot', col: '#4a4440' },
    region: 'cinder', bg: 'cinder', knots: 2, pool, pattern: ['sweep', 'rest', 'mend', 'strike'],
    intents: {
      sweep: { text: { F: { jp: 'けむり が ひろがる ！', en: 'The smoke is spreading!' }, E: { jp: '{煙|けむり} が {広|ひろ}がって 、 ふたり を {包|つつ}もう と して いる 。', en: 'The smoke is spreading out to engulf you both.' }, I: { jp: '{煙|けむり} が {低|ひく}く {這|は}い 、 {二人|ふたり} の {足元|あしもと} に {迫|せま}る 。', en: 'The smoke creeps low towards both your feet.' }, A: { jp: '{淀|よど}んだ {煙|けむり} が 、 {音|おと} も なく {二人|ふたり} を {呑|の}み{込|こ}もう と {広|ひろ}がる 。', en: 'Stagnant smoke spreads without a sound, ready to swallow you both.' } } },
      mend: { text: { F: { jp: 'けむり が また あつまる 。', en: 'The smoke gathers itself again.' }, E: { jp: 'ほどけた {煙|けむり} が 、 また {集|あつ}まろう と して いる 。', en: 'The loosened smoke is trying to gather itself back together.' }, I: { jp: '{散|ち}った {煙|けむり} が {渦|うず} を {巻|ま}き 、 {結|むす}び{目|め} を {作|つく}り{直|なお}して いる 。', en: 'The scattered smoke swirls and re-forms a knot.' }, A: { jp: '{一度|いちど} {散|ち}った {煙|けむり} が 、 {未練|みれん}がましく {寄|よ}り{集|あつ}まって くる 。', en: 'Smoke that had scattered drifts back together, unwilling to let go.' } } },
    },
    intro: { jp: '{二十年|にじゅうねん} {前|まえ} の {煙|けむり} が 、 {形|かたち} に なって {溜|た}まって いる 。', en: 'Smoke twenty years old has pooled into a shape.' },
    settle: { jp: '{煙|けむり} は {風|かぜ} に ほどけて 、 {空|そら} へ {上|のぼ}って いった 。', en: 'The smoke comes loose on the wind and climbs away into the sky.' } };
  EN['co.golem'] = { name: { en: 'Glass Golem', jp: 'ガラス{人形|にんぎょう}' }, art: 'golem', artOpts: { col: '#8fb8b0', core: '#f0a060' }, look: { custom: 'golem', col: '#5f807a' },
    region: 'cinder', bg: 'kiln', knots: 3, pool, pattern: ['charge', 'strike', 'mend', 'rest'],
    intro: { jp: '{溶|と}けた {火屋|ほや} が {固|かた}まって 、 {人|ひと} の {形|かたち} に なった 。', en: 'Melted lantern globes have set into the shape of a person.' },
    settle: { jp: 'ガラス の {体|からだ} は 、 {静|しず}か に {丸|まる}い {火屋|ほや} に {分|わ}かれた 。', en: 'The glass body quietly parts into round lantern globes.' } };
  EN['co.ember'] = { name: { en: 'Ember Wisp', jp: '{残|のこ}り{火|び}' }, art: 'wisp', artOpts: { col: '#f0a060' }, look: { custom: 'wisp', col: '#f0a060' },
    region: 'cinder', bg: 'kiln', knots: 2, pool, pattern: ['heat', 'strike', 'heat', 'rest'],
    intro: { jp: '{消|き}えそこねた {火|ひ} が 、 {宙|ちゅう} に {浮|う}いて いる 。', en: 'A fire that never quite went out hangs in the air.' },
    settle: { jp: '{残|のこ}り{火|び} は {小|ちい}さく なり 、 {最後|さいご} に ぱちり と {鳴|な}って {消|き}えた 。', en: 'The ember shrinks, gives one last crackle, and goes out.' } };

  // ---- Boss: the Kiln Warden ----------------------------------------------------------------
  EN['co.warden'] = { name: { en: 'The Kiln Warden', jp: '{窯|かま}の{番人|ばんにん}' }, art: 'warden', region: 'cinder', bg: 'kiln', knots: 6, boss: true, music: 'boss',
    pool: { tags: ['cinder'], F: ['v:火', 'v:石', 'v:土', 'v:氷'], E: ['v:灰', 'v:氷', 'v:窯', 'v:煙', 'v:火事'], I: ['v:覚える', 'v:忘れる', 'v:燃える'], A: [] },
    pattern: ['heat', 'strike', 'plea:children', 'heat', 'sweep'],
    intents: {
      heat: { text: {
        F: { jp: 'かま が あつく なる ！', en: 'The kiln is getting hot!' },
        E: { jp: '{窯|かま} の {奥|おく} から 、 {熱|ねつ} が あふれて くる 。', en: 'Heat is pouring out from deep in the kiln.' },
        I: { jp: '{番人|ばんにん} の {胸|むね} が {白|しろ}く {光|ひか}る 。 {熱|ねつ} が こもる ほど 、 {一撃|いちげき} が {重|おも}く なる 。', en: 'The warden\'s chest glows white. The more heat it holds, the heavier its blows.' },
        A: { jp: '{二十年|にじゅうねん} {閉|と}じ{込|こ}められた {熱|ねつ} が 、 {出口|でぐち} を {求|もと}めて {膨|ふく}らんで いく 。', en: 'Heat shut in for twenty years swells, looking for a way out.' } } },
      'plea:children': {
        text: {
          F: { jp: 'こども は どこ ？', en: 'Where are the children?' },
          E: { jp: '{子|こ}ども たち は どこ ？ {早|はや}く {逃|に}がして 。', en: 'Where are the children? Get them out, quickly.' },
          I: { jp: '{子|こ}ども たち は {水路|すいろ} へ {行|い}けた の ？ まだ {上|うえ} に {誰|だれ} か いる の ？', en: 'Did the children reach the channel? Is anyone still up here?' },
          A: { jp: '{誰|だれ} ひとり {取|と}り{残|のこ}されて いない と 、 {言|い}い{切|き}れる の ？', en: 'Can you tell me for certain that not one of them was left behind?' },
        },
        answer: {
          F: { kind: 'choose', item: 'c:co_warden_plea1', prompt: { en: 'It is asking about the children. Answer it.' }, options: [{ jp: 'みんな にげた よ', en: 'They all got away.', ok: true }, noJ('しらない', '"I don\'t know" — but you do: Ume led them down the channel.'), noJ('あつい', '"It\'s hot" — true, but not an answer.')], explain: { en: 'にげた = escaped, got away.' } },
          E: { kind: 'choose', item: 'c:co_warden_plea1', prompt: { en: 'Answer what it is really asking.' }, options: [{ jp: '{子|こ}ども たち は みんな {無事|ぶじ} です 。 {水路|すいろ} から {逃|に}げました 。', ok: true }, noJ('{窯|かま} を {閉|し}めて ください 。', 'That answers nothing it asked.'), noJ('わかりません 。', 'You do know — Ume and Gorō both told you.')], explain: { en: '無事 = safe, unharmed.' } },
          I: { kind: 'choose', item: 'c:co_warden_plea1', prompt: { en: 'Answer it truthfully and specifically.' }, options: [{ jp: 'みんな {水路|すいろ} ぞい に {下|お}りた 。 ウメ さん が {手|て} を {引|ひ}いて 。 {一人|ひとり} も {残|のこ}って いない 。', ok: true }, noJ('もう {昔|むかし} の こと だ 。 {気|き} に しなくて いい 。', 'That brushes the question aside — the Hush\'s way.'), noJ('{誰|だれ} か が {残|のこ}って いた かも しれない 。', 'Not true, and not kind.')], explain: { en: '一人も〜ない = not a single one.' } },
          A: { kind: 'choose', item: 'c:co_warden_plea1', prompt: { en: 'It wants certainty. Give it — and let it rest.' }, options: [{ jp: '{言|い}い{切|き}れる 。 {子|こ}ども は {皆|みな} {逃|に}げ{延|の}びた 。 その {中|なか} の {一人|ひとり} は 、 {今|いま} も {里|さと} で ガラス を {吹|ふ}いて いる 。', ok: true }, noJ('{言|い}い{切|き}れない が 、 {考|かんが}えて も {仕方|しかた} が ない 。', 'Dismissive where it needs certainty.'), noJ('それ は {記録|きろく} に {書|か}いて ない 。', 'The record is exactly what failed.')], explain: { en: '逃げ延びる = to escape to safety. The one still blowing glass is Hiro.' } },
        } },
      'mirror:record': { power: 2, target: 'rand',
        text: {
          F: { jp: '「 ここ は いちど も もえて いない 」', en: '"This place has never once burned."' },
          E: { jp: '「 この {里|さと} は {一度|いちど} も {燃|も}えた こと が ない 」', en: '"This village has never once burned."' },
          I: { jp: '「 {火事|かじ} は なかった 。 {記録|きろく} に そう {書|か}いて ある 」', en: '"There was no fire. It says so in the record."' },
          A: { jp: '「 {開村|かいそん} {以来|いらい} 、 {火災|かさい} の {記録|きろく} は {一件|いっけん} も なし 」 ── {番人|ばんにん} は {年代記|ねんだいき} の {言葉|ことば} を {映|うつ}して みせる 。', en: '"Since the founding, not a single fire on record" — the warden holds up the chronicle\'s own words like a mirror.' },
        },
        truth: {
          F: { kind: 'choose', item: 'c:co_warden_mirror', prompt: { en: 'That is false. What proves it?' }, options: [{ jp: 'つち に くろい はい', en: 'black ash in the soil', ok: true }, noJ('きれい な まつり', 'A pretty festival proves nothing.'), noJ('あたらしい ほん', 'A new book is the problem, not the proof.')], explain: { en: 'The ash layer under the upper terraces.' } },
          E: { kind: 'choose', item: 'c:co_warden_mirror', prompt: { en: 'See through it. What contradicts it?' }, options: [{ jp: '{土|つち} の {中|なか} に 、 {灰|はい} の {層|そう} が ある 。', ok: true }, noJ('{記録|きろく} に {書|か}いて ある 。', 'The record is the thing being questioned.'), noJ('{祭|まつ}り は {毎年|まいとし} ある 。', 'True, and irrelevant.')], explain: { en: '層 = layer.' } },
          I: { kind: 'choose', item: 'c:co_warden_mirror', prompt: { en: 'What does the mirror leave out?' }, options: [{ en: 'That the record was rewritten later — the ledger stops, 200 trees were replanted, five households vanished.', ok: true }, no('Nothing; the record is right.', 'Everything else you found disagrees.'), no('That the festival was on the fifteenth.', 'True, but it isn\'t what\'s false.')], explain: { en: 'A record is only as honest as whoever last wrote in it.' } },
          A: { kind: 'choose', item: 'c:co_warden_mirror', prompt: { en: 'Point out what is false in it.' }, options: [{ en: 'It confuses "no fire on record" with "no fire" — and the record itself was written afterwards (同年, fresh ink).', ok: true }, no('火災 is the wrong word; it should be 火事.', 'Both are fine; the flaw is logical.'), no('開村以来 is inaccurate because the village is older.', 'Nothing suggests that.')], explain: { en: 'An absence in the record is not an absence in the world.' } },
        } },
      'plea:forget': {
        text: {
          F: { jp: 'わすれて いい よ 。 いたい でしょう ？', en: 'You can forget. It hurts, doesn\'t it?' },
          E: { jp: '{忘|わす}れて も いい の 。 {覚|おぼ}えて いたら 、 {痛|いた}い でしょう ？', en: 'It\'s all right to forget. If you remember, it hurts — doesn\'t it?' },
          I: { jp: '{忘|わす}れて しまえば 、 {誰|だれ} も {泣|な}かなくて {済|す}む 。 それ でも {思|おも}い{出|だ}したい の ？', en: 'If it\'s forgotten, no one has to cry. Do you still want it remembered?' },
          A: { jp: '{痛|いた}み を {預|あず}けた の は 、 {彼|かれ}ら {自身|じしん} よ 。 {返|かえ}す こと が 、 {本当|ほんとう} に {優|やさ}しさ だ と {思|おも}う ？', en: 'They handed over the pain themselves. Do you truly believe giving it back is kindness?' },
        },
        answer: {
          F: { kind: 'choose', item: 'c:co_warden_plea2', prompt: { en: 'This is the Hush\'s own question. Answer it.' }, options: [{ jp: 'いたくても 、 おぼえて いたい', en: 'Even if it hurts, we want to remember.', ok: true }, noJ('わすれたい', '"We want to forget" — and the firebreaks stay forgotten too.'), noJ('いたく ない', '"It doesn\'t hurt" — it does.')], explain: { en: '〜ても = even if.' } },
          E: { kind: 'choose', item: 'c:co_warden_plea2', prompt: { en: 'Answer it.' }, options: [{ jp: '{痛|いた}くて も 、 {覚|おぼ}えて いたい 。 {覚|おぼ}えて いない と 、 また {火事|かじ} に なる 。', ok: true }, noJ('そう です ね 。 {忘|わす}れましょう 。', 'Agreeing to forget leaves the firebreaks forgotten.'), noJ('{痛|いた}く ない です 。', 'It does hurt; pretending otherwise isn\'t an answer.')], explain: { en: '〜ないと = if (we) don\'t…' } },
          I: { kind: 'choose', item: 'c:co_warden_plea2', prompt: { en: 'Answer it honestly.' }, options: [{ jp: '{泣|な}く こと に なって も 、 {忘|わす}れた まま で は 、 {次|つぎ} の {火事|かじ} を {防|ふせ}げない 。', ok: true }, noJ('{誰|だれ} も {泣|な}かない なら 、 その {方|ほう} が いい 。', 'The Hush\'s bargain: no tears, no firebreaks.'), noJ('{思|おも}い{出|だ}す かどうか は どうでも いい 。', 'It isn\'t unimportant — people\'s lives depend on it.')], explain: { en: '〜ことになっても = even if it comes to…' } },
          A: { kind: 'choose', item: 'c:co_warden_plea2', prompt: { en: 'Answer it — without pretending the pain away.' }, options: [{ jp: '{優|やさ}しさ か どう か は 、 {彼|かれ}ら が {決|き}める こと だ 。 {預|あず}けた もの を {取|と}り{戻|もど}す {権利|けんり} まで 、 {奪|うば}って は いけない 。', ok: true }, noJ('{確|たし}か に 、 {返|かえ}さない {方|ほう} が {親切|しんせつ} かも しれない 。', 'That concedes the Hush\'s point: deciding for them.'), noJ('{痛|いた}み など 、 すぐ に {慣|な}れる 。', 'Glib — and untrue.')], explain: { en: 'The choice belongs to the people who gave the memory — not to the Hush, and not to you.' } },
        } },
    },
    phases: [
      { at: 4, pattern: ['mirror:record', 'heat', 'charge', 'strike', 'heat'], line: { jp: '{番人|ばんにん} は {年代記|ねんだいき} の {頁|ページ} を {鏡|かがみ} の よう に {掲|かか}げた 。', en: 'The warden raises a page of the chronicle like a mirror.' }, teach: { en: 'New: Mirror. It reflects the chronicle\'s false line back at you. Choose "See through" and say what is false — or keep cooling its heat with みず or こおり.' } },
      { at: 2, pattern: ['plea:forget', 'heat', 'sweep', 'plea:forget', 'rest'], line: { jp: '{熱|ねつ} が {引|ひ}いて いく 。 {番人|ばんにん} の {声|こえ} が 、 {柔|やわ}らかく なった 。', en: 'The heat recedes. The warden\'s voice turns soft.' }, teach: { en: 'It is pleading now — with the Hush\'s own argument. Choose "Answer" to reply to what it is really asking.' } },
    ],
    intro: { jp: '{窯|かま} の {奥|おく} で 、 {焼|や}けた {土|つち} と ガラス の {体|からだ} が {立|た}ち{上|あ}がる 。 {胸|むね} の {中|なか} で 、 {二十年前|にじゅうねんまえ} の {火|ひ} が まだ {燃|も}えて いる 。', en: 'At the back of the kiln, a body of fired clay and glass stands up. In its chest, a fire from twenty years ago is still burning.' },
    settle: { jp: '{熱|ねつ} が {抜|ぬ}けて いく 。 {番人|ばんにん} は {膝|ひざ} を つき 、 {最後|さいご} に {一言|ひとこと} だけ {言|い}った 。 「 …… {水門|すいもん} は 、 {開|あ}いた ？ 」', en: 'The heat drains out of it. The warden sinks to one knee and says only one thing more: "…Did the water gate open?"' },
    reward: {} };
})(RB.content);
