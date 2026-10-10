/* Kotonoha, Chapter 9: creatures and encounters (expansion P11; plan R4, E3 wanderers, E7/E8 social and folklore).
 *   ko.leafling     Leafling (木の葉童): a sprite carrying a word on its leaf, and reading it wrong on purpose (a False
 *                   word, put right by reading it yourself); Gust.
 *   ko.jelly        Driftword Jelly: drifts in on a Flood of half-dissolved words; Chill.
 *   ko.mirror       Tidepool Mirror: says your sentence back with who-did-what-to-whom swapped (a Mirror); Chill.
 *   ko.echo         Conch Echo: a voice left in a shell, begging to be answered (a Plea); a Strike of echoes.
 *   ko.sandlantern  Sand Lantern: a half-buried lantern walking the tide line, throwing sand (a Shroud), Heat, Re-tying.
 *   ko.gardener     The Gardener of Unsent Words: the island's oldest keeper-spirit (social, no Unravel): its claim that
 *                   every unsent word is better left unsent (a False promise), its plea not to read them.
 *   ko.wander_ao     the keeper's apprentice (E3): Ao stands his ground by his basket while a Leafling tries to take it.
 *   ko.wander_kihei  the sailor's echo (E3): Kihei, a sailor lost at sea long ago, knows the tide pools' ways.
 * Interim art on existing families with their own palettes (F-36's rule; their own families are P16 art under AC-1,
 * C-82). The island's lore is the game's own. Every conclusion leads on. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  const say = (jp, en) => ({ jp, en });
  const ch = (o) => Object.assign({ kind: 'choose' }, o);
  const o = (en, ok, why) => (why ? { en, ok, why: { en: why } } : { en, ok });
  const oj = (jp, ok, why) => (why ? { jp, ok, why: { en: why } } : { jp, ok });
  C.encounters = C.encounters || {};
  function task(item, en, ok, w1, why1, w2, why2) {
    const low = ch({ item, prompt: { en }, options: [{ jp: ok, ok: true }, { jp: w1, ok: false, why: { en: why1 } }] });
    const high = ch({ item, prompt: { en: en + ' (Read them closely: two are near.)' },
      options: [{ jp: ok, ok: true }, { jp: w1, ok: false, why: { en: why1 } }, { jp: w2, ok: false, why: { en: why2 } }] });
    return { F: low, E: low, I: high, A: high };
  }

  // ---- the creatures ----------------------------------------------------------------------------------------------
  const EN = (id, d) => (C.enemies[id] = Object.assign({ region: 'kotonoha', bg: 'kotonoha', music: 'battle', boss: false, setting: 'outdoor', edition: 2 }, d));
  const POOL = {
    tags: ['kotonoha'],
    F: ['v:葉', 'v:海', 'v:言葉', 'v:手紙', 'g:prt_no', 'g:prt_to'],
    E: ['g:ko_to_iimashita', 'g:v_ta', 'g:prt_ga', 'g:prt_wo', 'g:v_te_iru'],
    I: ['g:ko_to_iu_hanashi', 'g:kr_ni_yoruto', 'g:sou_hear', 'g:te_giving', 'g:passive'],
    A: ['g:ko_literary', 'g:indirectness', 'g:adv_to_iu_yori'],
  };
  EN('ko.leafling', {
    name: T('Leafling', '{木|こ}の{葉|は}{童|わらし}'), setting: undefined, art: 'wisp', artOpts: { col: '#d8b84a' }, look: { custom: 'wisp', col: '#d8b84a' }, knots: 2, pool: POOL,
    pattern: ['gust', 'lie', 'rest'],
    // its trick: reading the word on its own leaf wrong (the kana the same, the meaning not)
    intents: {
      lie: { power: 1, target: 'rand',
        text: {
          F: { jp: 'この はっぱ に は 「かえる」 と かいて ある 。 ケロケロ 。 かえる の はっぱ だ よ 。', en: 'My leaf says かえる. Ribbit. It\'s a frog\'s leaf.' },
          E: { jp: 'この {葉|は} に は 「かえる」 と {書|か}いて ある 。 {池|いけ} の {蛙|かえる} の {葉|は} さ 。 {海|うみ} に は {要|い}らない 。', en: 'This leaf says かえる: a pond frog\'s leaf. The sea doesn\'t need it.' },
          I: { jp: '{葉|は} に よると 、 「{早|はや}く かえる 」 。 {蛙|かえる} が {早|はや}く {跳|と}ぶ と いう {話|はなし} だ 。', en: 'According to the leaf: はやく かえる. The story is that a frog jumps fast.' },
          A: { jp: '「{春|はる} に は かえる」 。 {春|はる} の {田|た} に {鳴|な}く {蛙|かえる} の {歌|うた} に ほかならない 。', en: '"In spring, kaeru." Nothing other than a song of frogs croaking in the spring paddies.' },
        },
        truth: {
          F: ch({ item: 'c:ko_leaf_f', prompt: { en: 'It says its leaf is about a frog (かえる). Look at the leaf: a letter\'s hand, a homecoming.' }, options: [o('かえる here is "go home" (帰る), not a frog.', true), o('It\'s right: a frog.', false, 'The leaf is in a letter-writer\'s hand: someone going home.')] }),
          E: ch({ item: 'c:ko_leaf_e', prompt: { en: 'What is wrong with its reading?' }, options: [o('かえる can be 帰る (go home): a leaf in a letter\'s hand means going home.', true), o('かえる can only mean a frog.', false, 'The same kana, かえる, is also 帰る.'), o('The leaf is blank.', false, 'The leaf says かえる; the question is which かえる.')] }),
          I: ch({ item: 'c:ko_leaf_i', prompt: { en: 'It quotes the leaf (によると) and adds a story (という話だ). Where does it go wrong?' }, options: [o('The leaf says はやく かえる, "come home soon": the frog story is its own addition.', true), o('It quotes the leaf wrongly.', false, 'It quotes it right; the meaning it adds is wrong.'), o('Nothing: frogs do jump fast.', false, 'True of frogs, but not what the leaf says.')] }),
          A: ch({ item: 'c:ko_leaf_a', prompt: { en: 'It calls the line nothing other than a frog song (にほかならない). How do you answer?' }, options: [o('「春にはかえる」 in a letter\'s hand is a promise to come home in spring (帰る), not a song of frogs.', true), o('A line about spring must be about frogs.', false, 'Spring is just when; かえる is who comes home.'), o('Old lines can\'t be read.', false, 'You can read it, in its own hand.')] }),
        } },
    },
    intro: T('A little figure of leaves, light as a draught, with one written leaf held up like a placard. It reads it out wrong, on purpose.', '{葉|は} で できた {小|ちい}さな {子|こ} 。 {字|じ} の ある {葉|は} を {一枚|いちまい} {掲|かか}げて 、 わざと {間違|まちが}えて {読|よ}む 。'),
    settle: T('The Leafling reads its leaf right, out loud, for once, and blows away on the wind with it.', '{木|こ}の{葉|は}{童|わらし} は 、 {一度|いちど} だけ {葉|は} を {正|ただ}しく {読|よ}み{上|あ}げて 、 {風|かぜ} に {乗|の}って {飛|と}んで いった 。') });
  EN('ko.jelly', {
    name: T('Driftword Jelly', '{言葉|ことば}{海月|くらげ}'), setting: undefined, art: 'blot', artOpts: { col: '#7ac8c8' }, look: { custom: 'blot', col: '#7ac8c8' }, knots: 2, pool: POOL,
    pattern: ['flood', 'chill', 'rest'],
    intents: {
      flood: { text: {
        F: { jp: 'みず が あふれて 、 とけかけた もじ が ながれて くる 。', en: 'Water floods in, carrying half-dissolved letters.' },
        E: { jp: '{水|みず} が {溢|あふ}れて 、 {溶|と}けかけた {字|じ} が {流|なが}れて くる 。', en: 'Water floods in, carrying half-dissolved letters.' },
        I: { jp: '{海月|くらげ} が {膨|ふく}らむ と 、 {中|なか} に {溜|た}めて いた {言葉|ことば} が 、 {水|みず} と {一緒|いっしょ} に {溢|あふ}れ{出|だ}す 。', en: 'As the jelly swells, the words it held spill out with the water.' },
        A: { jp: '{呑|の}み{込|こ}んだ {言葉|ことば} の {重|おも}み に {耐|た}えかねた か 、 {海月|くらげ} は {潮|しお} を {吐|は}き{出|だ}した 。', en: 'As if it could no longer bear the weight of the words it had swallowed, the jelly spews out a tide.' },
      } },
    },
    intro: T('A jellyfish the size of a cartwheel, drifting a hand above the ground. Inside it, words turn over slowly, half dissolved.', '{車輪|しゃりん} ほど の {海月|くらげ} が 、 {地面|じめん} の {上|うえ} を {漂|ただよ}って いる 。 {中|なか} で 、 {溶|と}けかけた {字|じ} が ゆっくり {回|まわ}って いる 。'),
    settle: T('The jelly lets go of its words; they fall as leaves, and it drifts off, clear as water.', '{海月|くらげ} は {言葉|ことば} を {手放|てばな}した 。 {言葉|ことば} は {葉|は} に なって {落|お}ち 、 {海月|くらげ} は {水|みず} の よう に {透|す}き{通|とお}って {去|さ}った 。') });
  EN('ko.mirror', {
    name: T('Tidepool Mirror', '{潮|しお}だまり の {鏡|かがみ}'), art: 'echo', artOpts: { col: '#a8d0d8' }, look: { custom: 'wisp', col: '#a8d0d8' }, knots: 2, pool: POOL,
    pattern: ['mirror', 'chill', 'rest'],
    // what it reflects: the same sentence with who-did-what-to-whom swapped (the particles turned round)
    intents: {
      mirror: { power: 2, target: 'rand',
        text: {
          F: { jp: '「ねこ が さかな を たべた 」 …… 「さかな が ねこ を たべた 」 。', en: '"The cat ate the fish." … "The fish ate the cat."' },
          E: { jp: '「{子供|こども} が {貝|かい} を {拾|ひろ}った 」 …… 「{貝|かい} が {子供|こども} を {拾|ひろ}った 」 。', en: '"The child picked up a shell." … "The shell picked up the child."' },
          I: { jp: '「ナミ さん が アオ くん に {舟|ふね} を {貸|か}して あげた 」 …… 「アオ くん が ナミ さん に {舟|ふね} を {貸|か}して あげた 」 。', en: '"Nami lent Ao the boat." … "Ao lent Nami the boat."' },
          A: { jp: '「{葉守|はもり} に {拾|ひろ}われた {言葉|ことば} 」 …… 「{言葉|ことば} に {拾|ひろ}われた {葉守|はもり} 」 。', en: '"The words picked up by the keepers." … "The keepers picked up by the words."' },
        },
        truth: {
          F: ch({ item: 'c:ko_mirror_f', prompt: { en: 'The pool said it back the other way round. What did it swap?' }, options: [o('Who ate whom: が and を changed places.', true), o('Nothing: it\'s the same sentence.', false, 'Look at the particles: ねこ が became さかな が.')] }),
          E: ch({ item: 'c:ko_mirror_e', prompt: { en: 'What did the pool swap?' }, options: [o('Who picked up what: 子供 and 貝 swapped places around が and を.', true), o('It changed 拾った to 捨てた.', false, 'The verb is the same; the roles swapped.'), o('It changed the tense.', false, 'Both are past (拾った).')] }),
          I: ch({ item: 'c:ko_mirror_i', prompt: { en: 'What changed, and who really lent the boat?' }, options: [o('The giver and receiver swapped round に: Nami lent it to Ao, not the other way.', true), o('The boat became Ao\'s.', false, 'Only who lent it to whom changed.'), o('Nothing changed: あげた is the same.', false, 'The same verb, but the names around が and に swapped.')] }),
          A: ch({ item: 'c:ko_mirror_a', prompt: { en: 'The passive phrase came back reversed. Which is the island\'s truth?' }, options: [o('「葉守に拾われた言葉」: the keepers pick up the words; the reflection turns the passive inside out.', true), o('Both are equally true.', false, 'The second is a pretty reflection, not what happens on the island.'), o('「言葉に拾われた葉守」 is the original.', false, 'The pool always gives the reversed one second.')] }),
        } },
    },
    intro: T('A tide pool so still it is a mirror. Say something near it, and it says it back, with everyone in the wrong place.', '{静|しず}か すぎて {鏡|かがみ} に なった {潮|しお}だまり 。 {近|ちか}く で {話|はな}す と 、 {誰|だれ} が {何|なに} を した か を {入|い}れ{替|か}えて {言|い}い{返|かえ}す 。'),
    settle: T('A wave runs into the pool, and when it settles, it only reflects the sky.', '{波|なみ} が {一|ひと}つ {潮|しお}だまり に {入|はい}り 、 {静|しず}まる と 、 ただ {空|そら} を {映|うつ}して いた 。') });
  EN('ko.echo', {
    name: T('Conch Echo', '{法螺貝|ほらがい} の {木霊|こだま}'), art: 'echo', artOpts: { col: '#e0c4b4' }, look: { custom: 'spirit', col: '#e0c4b4' }, knots: 2, pool: POOL, setting: 'indoor', bg: 'kotonoha_cave',
    pattern: ['plea', 'strike', 'rest'],
    intents: {
      plea: { power: 1,
        text: {
          F: { jp: 'だれ か 、 こたえて 。 ずっと 、 おなじ こと を いって いる の 。', en: 'Someone, answer. I keep saying the same thing.' },
          E: { jp: '{誰|だれ} か 、 {答|こた}えて 。 {何百年|なんびゃくねん} も 、 {同|おな}じ こと を {言|い}って いる の 。', en: 'Someone, answer me. I\'ve been saying the same thing for hundreds of years.' },
          I: { jp: '{返事|へんじ} が {来|く}る まで 、 {私|わたし} は {繰|く}り{返|かえ}す しか ない 。 {一度|いちど} で いい 、 {答|こた}えて 。', en: 'Until a reply comes, all I can do is repeat myself. Just once, answer.' },
          A: { jp: '{問|と}い は 、 {答|こた}え を {得|え}て はじめて {問|と}い と して {終|お}われる 。 {私|わたし} に も 、 {終|お}わり を 。', en: 'A question can only finish being a question once it is answered. Give me an ending too.' },
        },
        answer: {
          F: ch({ item: 'c:ko_echo_plea', prompt: { en: 'It keeps calling 「おーい」 (hey!). Answer it.' }, options: [{ jp: 'はーい 、 ここ に いる よ 。', en: 'Here! I\'m here.', ok: true }, { jp: 'おーい 。', en: 'Hey.', ok: false, why: { en: 'Calling back only adds another echo; it wants an answer.' } }] }),
          E: ch({ item: 'c:ko_echo_plea', prompt: { en: 'It asks, over and over: 「{誰|だれ} か いますか 」. Answer it.' }, options: [oj('はい 、 ここ に います 。', true), oj('{誰|だれ} か いますか 。', false, 'That repeats the question: one more echo.'), oj('いいえ 、 {誰|だれ} も いません 。', false, 'You are there; say so.')] }),
          I: ch({ item: 'c:ko_echo_plea', prompt: { en: 'It asks: 「この {声|こえ} 、 {届|とど}いて います か 」. Answer so that it can stop.' }, options: [oj('{届|とど}いて います よ 。 ちゃんと {聞|き}こえました 。', true), oj('{届|とど}いて いる か どう か 、 {分|わ}かりません 。', false, 'Uncertainty keeps it asking.'), oj('もう {一度|いちど} {言|い}って ください 。', false, 'Asking it to repeat is the one thing it can already do.')] }),
          A: ch({ item: 'c:ko_echo_plea', prompt: { en: 'Which reply ends its question rather than adding to it?' }, options: [oj('{確|たし}か に {受|う}け{取|と}りました 。 もう {繰|く}り{返|かえ}さなくて {大丈夫|だいじょうぶ} です 。', true), oj('{答|こた}え は 、 {問|と}い の {中|なか} に ある の でしょう 。', false, 'A riddle back is another question.'), oj('{答|こた}え など 、 {要|い}らない でしょう 。', false, 'Refusing it an answer leaves it calling for ever.')] }),
        } },
    },
    intro: T('A voice that has come loose from a conch, the shape of a curl of shell. It says one thing over and over, waiting for an answer.', '{法螺貝|ほらがい} から {抜|ぬ}け{出|だ}した {声|こえ} が 、 {巻|ま}き{貝|がい} の {形|かたち} に なった 。 {同|おな}じ こと を {繰|く}り{返|かえ}して 、 {返事|へんじ} を {待|ま}って いる 。'),
    settle: T('Answered at last, the echo coils back into the sound of the sea, and goes quiet.', 'やっと {答|こた}え を もらった {木霊|こだま} は 、 {波|なみ} の {音|おと} に {巻|ま}き{戻|もど}って 、 {静|しず}か に なった 。') });
  EN('ko.sandlantern', {
    name: T('Sand Lantern', '{砂|すな}{灯籠|どうろう}'), art: 'lantern', artOpts: { col: '#d8c08a' }, look: { custom: 'lanternghost', col: '#d8c08a' }, knots: 3, pool: POOL,
    pattern: ['shroud', 'heat', 'mend'],
    intents: {
      shroud: { text: {
        F: { jp: 'すな が まいあがって 、 まえ が みえない 。', en: 'Sand flies up; you can\'t see ahead.' },
        E: { jp: '{砂|すな} が {舞|ま}い{上|あ}がって 、 {前|まえ} が {見|み}えない 。', en: 'Sand whirls up, and you can\'t see in front of you.' },
        I: { jp: '{灯籠|とうろう} が {身|み}を {揺|ゆ}する と 、 {砂|すな} が {幕|まく} の よう に {広|ひろ}がった 。 {灯|ひ} を {当|あ}てれば 、 {透|す}けて {見|み}える かも しれない 。', en: 'The lantern shakes itself and sand spreads like a curtain. A light might show through it.' },
        A: { jp: '{砂|すな} の {帳|とばり} が {下|お}りた 。 {灯|ひ} を {欠|か}いた {目|め} に は 、 {何|なに} も {映|うつ}らない 。', en: 'A curtain of sand comes down. To eyes without a light, nothing shows.' },
      } },
    },
    intro: T('A stone lantern that has dug itself out of the sand and walks the tide line on its base, its fire box dark, sand pouring from its hat.', '{砂|すな} から {這|は}い{出|だ}した {石|いし} の {灯籠|とうろう} が 、 {波打|なみう}ち{際|ぎわ} を {歩|ある}いて いる 。 {火袋|ひぶくろ} は {暗|くら}く 、 {笠|かさ} から {砂|すな} が こぼれる 。'),
    settle: T('The lantern settles back into the sand, the right way up, and a little light shows in its fire box.', '{灯籠|とうろう} は {砂|すな} の {中|なか} に {正|ただ}しく {座|すわ}り {直|なお}し 、 {火袋|ひぶくろ} に {小|ちい}さな {灯|ひ} が ともった 。') });

  // the Gardener (the island's boss: a social and folklore encounter; no Unravel, C-09)
  EN('ko.gardener', {
    name: T('The Gardener of Unsent Words', '{届|とど}かぬ {言葉|ことば} の {庭守|にわもり}'), art: 'echo', artOpts: { col: '#5e8a5a' }, look: { custom: 'spirit', col: '#5e8a5a' }, knots: 6, pool: POOL, boss: true, setting: 'indoor', bg: 'kotonoha_cave', music: 'boss_ko',
    pattern: ['lie', 'plea', 'mend', 'rest'],
    // its lie: that every unsent word is better left unsent (some are waiting to be received); its plea: not to read
    // them. The answer is to tell the leaves apart: return the ones whose writers meant them to arrive.
    intents: {
      lie: { power: 2, target: 'rand',
        text: {
          F: { jp: 'だされなかった ことば は 、 ぜんぶ だされない まま が いい 。', en: 'Words never sent are all better left unsent.' },
          E: { jp: '{出|だ}されなかった {言葉|ことば} は 、 {全部|ぜんぶ} {出|だ}さない {方|ほう} が いい 。 {書|か}いた {人|ひと} が 、 そう {決|き}めた の だ から 。', en: 'Words never sent are all better left unsent. Their writers decided so.' },
          I: { jp: '{書|か}いた {者|もの} に よると 、 どの {言葉|ことば} も 「{出|だ}さない で 」 と いう {話|はなし} だ 。 {一枚|いちまい} も 、 {外|そと} へ は {出|だ}さぬ 。', en: 'According to their writers, the story is that every one says "don\'t send". Not one leaf leaves.' },
          A: { jp: '{届|とど}かぬ {言葉|ことば} は 、 {届|とど}かぬ が ゆえ に {美|うつく}しい 。 {出|だ}さぬ と {決|き}めた {心|こころ} を 、 {破|やぶ}る べからず 。', en: 'A word that never arrives is beautiful because it never arrives. The heart that chose not to send it must not be broken.' },
        },
        truth: {
          F: ch({ item: 'c:ko_garden_f', prompt: { en: 'It says every unsent word should stay unsent. What do you know?' }, options: [o('Some were never sent only because the writer couldn\'t: Kihei\'s letter was meant to arrive.', true), o('It\'s right: none should go.', false, 'Some writers never chose silence: the sea or the time took the chance away.')] }),
          E: ch({ item: 'c:ko_garden_e', prompt: { en: 'What is false in what it said?' }, options: [o('"Their writers decided so": not all of them did. Some were lost, not kept back.', true), o('"Words never sent": these were all sent.', false, 'They were never sent; the question is why.'), o('Nothing; they all chose silence.', false, 'Chitose wrote and sent; the boats stopped. That is not a choice.')] }),
          I: ch({ item: 'c:ko_garden_i', prompt: { en: 'It cites the writers (によると) and calls it "the story" (という話だ). Do you believe it?' }, options: [o('No: it is speaking for every writer at once, and the shells and the letters say otherwise for some.', true), o('Yes: it named its source.', false, 'Naming a source isn\'t the same as the source saying it.'), o('Nobody can know what the writers wanted.', false, 'For some you do know: they wrote to be read.')] }),
          A: ch({ item: 'c:ko_garden_a', prompt: { en: 'It says unsent words are beautiful because they never arrive (がゆえに), and must not be broken (べからず). How do you answer?' }, options: [o('That is true of words their writers chose to keep. A word lost against its writer\'s will isn\'t beautiful for never arriving: it is only lost.', true), o('Every word must be delivered.', false, 'That is the opposite mistake: some are rightly kept.'), o('Classical lines can\'t be argued with.', false, 'You can weigh it against what you know.')] }),
        } },
      plea: { power: 1,
        text: {
          F: { jp: 'よまないで 。 ここ の は を 、 よまないで 。', en: 'Don\'t read them. Don\'t read the leaves here.' },
          E: { jp: 'ここ の {葉|は} を {読|よ}まないで くれ 。 {読|よ}まれたら 、 {秘密|ひみつ} で なく なる 。', en: 'Don\'t read the leaves here. Once read, they\'re secrets no more.' },
          I: { jp: '{読|よ}まれる ため に {書|か}かれた {言葉|ことば} で は ない 。 {読|よ}む の なら 、 {書|か}いた {者|もの} の {心|こころ} で {読|よ}んで くれ 。', en: 'These words were not written to be read. If you must read, read with the writer\'s heart.' },
          A: { jp: '{見|み}る と いう こと は 、 {暴|あば}く と いう こと に {近|ちか}い 。 {暴|あば}かず に 、 {分|わ}けて くれる か 。', en: 'To look is close to laying bare. Can you sort them without laying them bare?' },
        },
        answer: {
          F: ch({ item: 'c:ko_garden_plea', prompt: { en: 'Answer it: how will you choose which leaves go home?' }, options: [{ jp: 'あてな だけ を みる 。 なかみ は よまない 。', en: 'Look only at whom it\'s for. Don\'t read what\'s inside.', ok: true }, { jp: 'ぜんぶ よむ 。', en: 'Read them all.', ok: false, why: { en: 'That is exactly what it fears.' } }] }),
          E: ch({ item: 'c:ko_garden_plea', prompt: { en: 'Answer it: how will you sort the leaves?' }, options: [oj('{宛名|あてな} と {日付|ひづけ} だけ {見|み}て 、 {中|なか} は {読|よ}みません 。', true), oj('{全部|ぜんぶ} {読|よ}んで から {決|き}めます 。', false, 'It asked you not to read them.'), oj('{読|よ}まない で 、 {全部|ぜんぶ} {返|かえ}します 。', false, 'Sending all of them back breaks the ones that were kept on purpose.')] }),
          I: ch({ item: 'c:ko_garden_plea', prompt: { en: 'Answer it in a way that keeps its secrets and still sends some home.' }, options: [oj('「{出|だ}さない で 」 と {書|か}いて ある {葉|は} は 、 {開|ひら}かず に ここ に {残|のこ}します 。', true), oj('{読|よ}む か どう か は 、 {私|わたし} たち が {決|き}めます 。', false, 'That ignores what it asked.'), oj('どの {葉|は} も 、 {書|か}いた {人|ひと} に {聞|き}いて から に します 。', false, 'Most of the writers are long gone: you can\'t ask them.')] }),
          A: ch({ item: 'c:ko_garden_plea', prompt: { en: 'Which reply sorts the leaves without laying them bare?' }, options: [oj('{封|ふう} を {切|き}らず 、 {宛名|あてな} と {添|そ}え{書|が}き だけ で {分|わ}けましょう 。 {残|のこ}す と {記|しる}された もの は 、 ここ に {眠|ねむ}らせます 。', true), oj('{暴|あば}く の も 、 {時|とき} に は {優|やさ}しさ です 。', false, 'It asked not to be laid bare; this argues for it.'), oj('{分|わ}ける {必要|ひつよう} は ありません 。', false, 'Then the overflow goes on.')] }),
        } },
    },
    intro: T('The woven roots lift and stand: a tall shape of leaves, with a lantern of a face. It speaks slowly, in the old way, and listens longer than it speaks.', '{編|あ}まれた {根|ね} が {持|も}ち{上|あ}がり 、 {立|た}ち{上|あ}がった 。 {葉|は} で できた {背|せ} の {高|たか}い {姿|すがた} 。 {顔|かお} は 、 {灯籠|とうろう} の よう に {光|ひか}って いる 。'),
    settle: T('The Gardener lowers itself into the roots again. The leaves it keeps hang still; the ones that will go home drift up towards the light.', '{庭守|にわもり} は 、 ゆっくり と {根|ね} に {戻|もど}った 。 {残|のこ}す {葉|は} は {静|しず}か に {吊|つ}るされ 、 {帰|かえ}る {葉|は} は {光|ひかり} の {方|ほう} へ {昇|のぼ}って いく 。') });

  Object.assign(C.reviewEnemies = C.reviewEnemies || {}, { 'ko.leafling': 'ko', 'ko.jelly': 'ko', 'ko.mirror': 'ko', 'ko.echo': 'ko', 'ko.sandlantern': 'ko', 'ko.gardener': 'ko' });
  if (RB.creaturesA && RB.creaturesA.auditEnemy) {
    const note = 'interim: a Kotonoha creature (P11) drawn on an existing family with its own palette; its own family is P16 art work (AC-1, C-82)';
    for (const [id, art] of [['ko.leafling', 'wisp'], ['ko.jelly', 'blot'], ['ko.mirror', 'echo'], ['ko.echo', 'echo'], ['ko.gardener', 'echo']]) RB.creaturesA.auditEnemy(id, art, 'incomplete', note);
  }

  // ---- the Gardener of Unsent Words (social and folklore; no Unravel, C-09) -------------------------------------------
  C.encounters['ko.gardener'] = {
    id: 'ko.gardener', kind: 'social', name: say('{届|とど}かぬ {言葉|ことば} の {庭守|にわもり}', 'The Gardener of Unsent Words'),
    lead: { enemy: 'ko.gardener' },
    rules: { wait: true },
    autoRoute: ['s:ask_mean', 's:tellings', 's:sort', 'gesture'],
    social: {
      parties: [{ aid: 'n:gardener', name: say('{庭守|にわもり}', 'the Gardener'), stance: 'closed', wants: { en: 'To keep the words that were never meant to be found where no one will read them.' } }],
      claims: {
        g1: { by: 'n:gardener', jp: 'ここ の {葉|は} は 、 {書|か}いた {者|もの} が {出|だ}さぬ と {決|き}めた {言葉|ことば} だ 。', en: 'These leaves are words their writers chose not to send.' },
        g2: { by: 'n:gardener', jp: '…… {本当|ほんとう} は 、 {出|だ}したくて も {出|だ}せなかった {言葉|ことば} も 、 {混|ま}じって いる 。', en: '…In truth, some here are words their writers wanted to send and could not.', hidden: true },
        g3: { by: 'n:gardener', jp: '{上|うえ} から {落|お}ちて くる {葉|は} が {多|おお}すぎて 、 {分|わ}ける {手|て} が {足|た}りぬ 。 {全部|ぜんぶ} {閉|と}じ{込|こ}める しか なかった 。', en: 'Too many leaves fall from above, and I haven\'t the hands to sort them. Shutting them all in was all I could do.', hidden: true },
      },
      understanding: 4,
      gesture: { name: say('{一緒|いっしょ} に {葉|は} を {分|わ}ける', 'Sort the leaves together'), desc: 'Without opening a single one: by whom they are for, and by what is written on the outside.', effect: { flag: 'sorted' }, says: { en: 'You sort the leaves with the Gardener, unopened, by their addresses and the words written on the outside. Some it hangs back on the branches. Others it lets go, up into the light.' } },
      unravelTip: { en: 'Nothing here is knotted. The Gardener is guarding something; ask it what.' },
      actions: [
        { id: 'ask_mean', kind: 'ask', label: say('「{出|だ}さぬ と {決|き}めた 」 の は 、 {全部|ぜんぶ} です か 。', 'Ask back whether every writer chose not to send'), once: true,
          task: task('g:kr_to_iu', 'Which asks back whether every writer chose it?', '「{出|だ}さぬ と {決|き}めた 」 の は 、 {全部|ぜんぶ} です か 。', '「{出|だ}さぬ と {決|き}めた 」 の は 、 いつ です か 。', 'That asks when, not whether all of them did.', 'はい 、 {全部|ぜんぶ} {出|だ}しません 。', 'That agrees without asking anything.'),
          effect: { reveal: 'g2', understanding: 1, stance: { 'n:gardener': 'listening' } }, says: { en: 'The lantern of its face dims and brightens. "…No," it says at last. "Not all."' } },
        { id: 'tellings', kind: 'evidence', label: say('{館|やかた} の {板|いた} の {話|はなし} を する', 'Tell it the tellings in the keepers\' hall'), once: true, when: { claims: 'g2' },
          task: task('g:ko_to_iu_hanashi', 'Which tells it what the shells say Chitose said?', 'チトセ は 「{返事|へんじ} が {来|こ}なくて も 、 {書|か}いた {言葉|ことば} は {本当|ほんとう} だった 」 と {言|い}いました 。', 'チトセ は 「{手紙|てがみ} を {出|だ}さない で 」 と {言|い}いました 。', 'Chitose wrote and sent; she never asked for her letters to be kept back.', 'チトセ は {手紙|てがみ} を {書|か}かなかった と いう {話|はなし} です 。', 'The shells say she wrote on and on.'),
          effect: { reveal: 'g3', understanding: 1 }, says: { en: 'The Gardener goes very still. "Chitose," it says, as if tasting a name it had forgotten. "She planted the tree for words that wanted to arrive. Not for words that wanted to hide."' } },
        { id: 'sort', kind: 'propose', label: say('{宛名|あてな} だけ {見|み}て 、 {分|わ}けましょう 。', 'Propose sorting them by their addresses, unopened'), once: true, when: { claims: 'g3' },
          task: { F: ch({ item: 'v:手紙', prompt: { en: 'Propose how to sort the leaves without reading them.' }, options: [{ jp: 'あてな を みて 、 わけよう 。', ok: true }, { jp: 'ぜんぶ ひらいて 、 よもう 。', ok: false, why: { en: 'That is what it fears.' } }] }),
            E: ch({ item: 'g:v_mashou', prompt: { en: 'Propose how to sort the leaves without reading them.' }, options: [{ jp: '{宛名|あてな} だけ {見|み}て 、 {一緒|いっしょ} に {分|わ}けましょう 。', ok: true }, { jp: '{全部|ぜんぶ} {開|ひら}けて 、 {読|よ}みましょう 。', ok: false, why: { en: 'It asked you not to read them.' } }] }),
            I: ch({ item: 'g:te_giving', prompt: { en: 'Propose sorting them, offering your hands (read closely: two are near).' }, options: [{ jp: '{分|わ}ける の を {手伝|てつだ}わせて ください 。 {中|なか} は {読|よ}みません 。', ok: true }, { jp: '{分|わ}けて あげます から 、 {読|よ}ませて ください 。', ok: false, why: { en: 'Trading help for reading is just what it fears.' } }, { jp: '{分|わ}けて もらえます か 。 {私|わたし} たち は {読|よ}む だけ です 。', ok: false, why: { en: 'That leaves it the work it can\'t do alone, and you reading.' } }] }),
            A: ch({ item: 'g:indirectness', prompt: { en: 'Offer to sort them, in a way it can accept (read closely: two are near).' }, options: [{ jp: '{封|ふう} を {切|き}らず に 、 {宛名|あてな} と {添|そ}え{書|が}き で {分|わ}けて は いかがでしょう 。', ok: true }, { jp: '{分|わ}ける の なら 、 {中身|なかみ} を {確|たし}かめる べき でしょう 。', ok: false, why: { en: 'Checking the contents means reading them.' } }, { jp: '{分|わ}けず とも 、 {全部|ぜんぶ} {外|そと} へ {出|だ}せば {済|す}む こと です 。', ok: false, why: { en: 'Letting them all out breaks the ones that were kept on purpose.' } }] }) },
          effect: { understanding: 2, flag: 'decided' }, says: { en: '"Unopened," the Gardener repeats. "By their addresses." It holds out a root like a hand, with a leaf on it, face down.' } },
      ],
      responses: {
        hikari: { says: { en: 'Your light falls on the hanging leaves, and the Gardener turns its face away from the glare. Not everything wants to be lit.' } },
        unravel: { says: { en: 'There is nothing to untangle. The roots are woven, not knotted.' } },
      },
      wait: { when: { all: [{ stance: { 'n:gardener': 'listening' } }, { not: { claims: 'g3' } }] }, effect: { reveal: 'g3' }, says: { en: 'In the quiet, the Gardener speaks again: "So many fall now. I cannot sort them all. I shut them all in."' } },
      companion: {
        nao: [{ id: 'nao_sort', name: say('{仕分|しわ}け を {手伝|てつだ}う', 'Help with the sorting'), desc: 'Nao has sorted more letters than anyone.', once: true, effect: { understanding: 2, stance: { 'n:gardener': 'listening' } }, says: { en: 'Nao starts sorting without being asked, by address only, fast, never once turning a leaf over. The Gardener watches their hands, and lets them.' } }],
        mio: [{ id: 'mio_label', name: say('{添|そ}え{書|が}き を {読|よ}む', 'Read only the outer labels'), desc: 'Mio knows labels.', once: true, effect: { understanding: 2, stance: { 'n:gardener': 'listening' } }, says: { en: 'Mio reads only what is written on the outside, the way she reads a bottle\'s label without opening it, and sets the leaves into two piles.' } }],
        ren: [{ id: 'ren_light', name: say('{灯|ひ} を {落|お}とす', 'Lower the light'), desc: 'A keeper knows when not to shine.', once: true, effect: { understanding: 2, stance: { 'n:gardener': 'listening' } }, says: { en: 'Ren lowers the lantern so its light falls on the floor and not on the leaves. The Gardener\'s face brightens a little in the dimness.' } }],
        suzu: [{ id: 'suzu_unsaid', name: say('{言|い}わない {台詞|せりふ} の {話|はなし} を する', 'Talk about lines left unsaid'), desc: 'Suzu knows about lines cut from a play.', once: true, effect: { understanding: 2, stance: { 'n:gardener': 'listening' } }, says: { en: 'Suzu tells it about lines cut from plays: some cut because they were wrong, some because they were too true to say on a stage. "You keep both kinds," she says. "But not in the same drawer."' } }],
      },
      drift: [{ when: { all: [{ rounds: 2 }, { stance: { 'n:gardener': 'closed' } }] }, once: true, effect: { stance: { 'n:gardener': 'listening' } }, says: { en: 'Leaves keep falling around you. The Gardener turns its lantern face towards you, and waits.' } }],
    },
    conclusions: [
      { id: 'sorted', when: { flag: 'sorted' }, result: 'win', text: { en: 'The leaves are sorted, unopened: the kept ones hang still, and the ones that wanted to arrive go up into the light.' }, flags: { ko_gardener_sorted: true } },
      { id: 'decided', when: { flag: 'decided' }, result: 'win', text: { en: 'The Gardener agrees to sort the leaves by their addresses. The overflow stops.' }, flags: { ko_gardener_sorted: true } },
      { id: 'otoha', when: { rounds: 9 }, result: 'end', text: { en: 'Leaves keep falling. The Gardener sinks back into its roots to think, and the wind drops a little.' } },
    ],
  };

  // ---- the wanderers (E3) -------------------------------------------------------------------------------------------
  C.encounters['ko.wander_ao'] = {
    id: 'ko.wander_ao', name: say('アオ の {籠|かご}', 'Ao\'s basket'),
    lead: { enemy: 'ko.leafling', knots: 2 },
    actors: [{
      aid: 'g:ao', side: 'guest', name: say('アオ', 'Ao'), hp: 3,
      agenda: { wants: 'help', act: { kind: 'ward', on: 'pc', n: 1 }, leavesWhen: { rounds: 4 } },
      lines: {
        arrive: say('{僕|ぼく} の {籠|かご} だ ！ {葉|は} を {返|かえ}せ ！', '"That\'s my basket! Give the leaves back!"'),
        act: say('{籠|かご} を {抱|かか}えて 、 {木|こ}の{葉|は}{童|わらし} と あなた の {間|あいだ} に {立|た}つ 。', 'Ao clutches his basket and plants himself between you and the Leafling.'),
        leave: say('…… ありがとう 。 {読|よ}めなくて も 、 {拾|ひろ}う の は {僕|ぼく} の {仕事|しごと} だ から 。', '"…Thanks. I can\'t read them, but picking them up is my job." Ao runs off down the steps.'),
      },
    }],
    conclusions: [{ id: 'won', when: { settled: 'all' }, result: 'win', text: { en: 'The Leafling drops its leaf into Ao\'s basket and blows away.' }, flags: { ko_ao_helped: true } }],
  };
  C.encounters['ko.wander_kihei'] = {
    id: 'ko.wander_kihei', name: say('{潮|しお} の {声|こえ}', 'A voice on the tide'),
    lead: { enemy: 'ko.jelly', knots: 2 },
    actors: [{
      aid: 'g:kihei', side: 'guest', name: say('キヘイ', 'Kihei'), hp: 3,
      agenda: { wants: 'pass', act: { kind: 'say' }, leavesWhen: { rounds: 3 } },
      lines: {
        arrive: say('{海月|くらげ} は {潮|しお} と {一緒|いっしょ} に {来|く}る 。 {波|なみ} が {引|ひ}く {時|とき} が {狙|ねら}い{目|め} だ 。', '"Jellies come in with the tide. Hit them as the wave goes out." A sailor in an old coat, pale as sea mist, stands at the water\'s edge.'),
        act: say('{波|なみ} を {読|よ}め 。 {海|うみ} は 、 {嘘|うそ} を つかん 。', '"Read the waves. The sea doesn\'t lie."'),
        leave: say('…… {俺|おれ} は 、 {手紙|てがみ} を {探|さが}して いる ん だ 。 {出|だ}せなかった {手紙|てがみ} を な 。', '"…I\'m looking for a letter. One I never managed to send." The sailor fades into the spray, and is gone.'),
      },
    }],
    conclusions: [{ id: 'won', when: { settled: 'all' }, result: 'win', text: { en: 'The jelly drifts off. Where the sailor stood, only footprints, filling with water.' }, flags: { ko_kihei_met: true } }],
  };
})(RB.content);
