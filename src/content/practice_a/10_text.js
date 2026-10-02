/* Practice suite A — the Japanese (and matching English) for lantern tending,
 * the writing desk and Practice mementos (Practice addendum §15, §16, §8.1),
 * the desk's twenty base cards, the first-session notebook note, and the two
 * world scenes. Every `jp` / `w` string in RB.content.practiceA is checked by
 * tools/validate.mjs (registry root `practiceA`): furigana on every kanji,
 * every token known to the lexicon (src/content/practice_a/00_lex.js). */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const T = (jp, en) => ({ jp, en });

  // The twenty base cards (§16.2). Each resolves to the existing core lexicon record
  // (src/lang/30_lexicon.js) for its contextual reading; `full` is an authored
  // sentence using the word, `gap` its English with the word left out (the prompt).
  // `mark` (derived) is the word's own markup inside `full`, so the prompt can blank it.
  // (`word`, not `w`: the validator reads every `w` as running Japanese text.)
  const card = (id, en, word, r, full, fullEn, gap, accept) => ({ id, en, word, r, item: 'v:' + word, accept: accept || [r, word], full: T(full, fullEn), gap });
  const cards = [
    card('water', 'water', '水', 'みず', '{冷|つめ}たい {水|みず} を {一杯|いっぱい} ください 。', 'A glass of cold water, please.', 'A glass of cold ___, please.'),
    card('light', 'light', '光', 'ひかり', '{窓|まど} から {光|ひかり} が {入|はい}る 。', 'Light comes in through the window.', '___ comes in through the window.'),
    card('wind', 'wind', '風', 'かぜ', '{今日|きょう} は {風|かぜ} が {強|つよ}い 。', 'The wind is strong today.', 'The ___ is strong today.'),
    card('stone', 'stone', '石', 'いし', '{道|みち} に {大|おお}きな {石|いし} が ある 。', 'There is a big stone on the road.', 'There is a big ___ on the road.'),
    card('voice', 'voice', '声', 'こえ', '{遠|とお}く から {子|こ}ども の {声|こえ} が する 。', 'A child\'s voice carries from far away.', 'A child\'s ___ carries from far away.'),
    card('road', 'road', '道', 'みち', 'この {道|みち} は {海|うみ} へ {続|つづ}いて いる 。', 'This road leads to the sea.', 'This ___ leads to the sea.'),
    card('name', 'name', '名前', 'なまえ', '{紙|かみ} に {名前|なまえ} を {書|か}く 。', 'Write a name on the paper.', 'Write a ___ on the paper.'),
    card('letter', 'letter', '手紙', 'てがみ', '{家|いえ} から {手紙|てがみ} が {届|とど}いた 。', 'A letter came from home.', 'A ___ came from home.'),
    card('sky', 'sky', '空', 'そら', '{今日|きょう} は {空|そら} が {青|あお}い 。', 'The sky is blue today.', 'The ___ is blue today.'),
    card('rain', 'rain', '雨', 'あめ', '{朝|あさ} から {雨|あめ} が {降|ふ}って いる 。', 'It has been raining since morning.', '___ has been falling since morning.'),
    card('flower', 'flower', '花', 'はな', '{道|みち} の {端|はし} に {花|はな} が {咲|さ}いて いる 。', 'Flowers are blooming by the roadside.', '___ are blooming by the roadside.'),
    card('tree', 'tree', '木', 'き', '{大|おお}きな {木|き} の {下|した} で {休|やす}む 。', 'Rest under a big tree.', 'Rest under a big ___.'),
    card('river', 'river', '川', 'かわ', '{川|かわ} を {舟|ふね} で {渡|わた}る 。', 'Cross the river by boat.', 'Cross the ___ by boat.'),
    card('sea', 'sea', '海', 'うみ', '{海|うみ} の {近|ちか}く に {町|まち} が ある 。', 'There is a town near the sea.', 'There is a town near the ___.'),
    card('mountain', 'mountain', '山', 'やま', '{北|きた} に {高|たか}い {山|やま} が {見|み}える 。', 'A tall mountain stands to the north.', 'A tall ___ stands to the north.'),
    card('star', 'star', '星', 'ほし', '{夜空|よぞら} に {星|ほし} が {光|ひか}って いる 。', 'Stars are shining in the night sky.', '___ are shining in the night sky.'),
    card('moon', 'moon', '月', 'つき', '{今夜|こんや} は {月|つき} が {明|あか}るい 。', 'The moon is bright tonight.', 'The ___ is bright tonight.'),
    card('morning', 'morning', '朝', 'あさ', '{朝|あさ} {早|はや}く {出発|しゅっぱつ} する 。', 'We set out early in the morning.', 'We set out early in the ___.'),
    card('night', 'night', '夜', 'よる', '{夜|よる} の {村|むら} は {静|しず}か だ 。', 'The village is quiet at night.', 'The village is quiet at ___.'),
    // 家 has two readings in the lexicon; "home" in this sentence is うち (いえ is also correct)
    card('home', 'home', '家', 'うち', 'そろそろ {家|うち} に {帰|かえ}ろう 。', 'Let\'s head home soon.', 'Let\'s head ___ soon.', ['うち', '家', 'いえ']),
  ];
  for (const c of cards) c.mark = c.word === c.r ? c.word : '{' + c.word + '|' + c.r + '}';

  C.practiceA = {
    cards,
    lanterns: {
      title: T('{灯|あか}り の {手入|てい}れ', 'Tend a few lamps'),
      rack: T('{練習用|れんしゅうよう} の {小|ちい}さな {灯|あか}り', 'Small practice lamps'),
      where: T('{葦|あし}ノ{瀬|せ} の {灯|あか}り{堂|どう}', 'The Lantern Hall, Reedwake'),
      modes: {
        review: T('{覚|おぼ}えた もの を {見直|みなお}す', 'Review familiar material'),
        topic: T('{一|ひと}つ に {絞|しぼ}る', 'Focus on a topic'),
        new: T('{新|あたら}しい {言葉|ことば} を {習|なら}う', 'Introduce something new'),
      },
      topics: {
        kana: T('{仮名|かな}', 'Kana'),
        words: T('{言葉|ことば}', 'Words'),
        grammar: T('{文法|ぶんぽう} と {読|よ}み', 'Grammar and reading'),
        saltglass: T('{潮硝子|しおがらす}', 'Saltglass'),
        cinder: T('{灰実|はいみ} の {里|さと}', 'Cinder Orchard'),
        snowbell: T('{雪鈴|ゆきすず}', 'Snowbell'),
        lanternfall: T('{灯落|ひおち}', 'Lanternfall'),
        still: T('{静寂|しじま} の {書庫|しょこ}', 'The Still Archive'),
      },
      lamp: T('{灯|あか}り', 'Lamp'),
      end: T('{灯|あか}り が ともった', 'The lamps are lit'),
    },
    desk: {
      title: T('{書|か}き{物|もの} の {机|つくえ}', 'Writing desk'),
      where: T('{潮硝子|しおがらす} の かもめ{亭|てい}', 'The Gull, Saltglass'),
      rest: T('{机|つくえ} で {書|か}く', 'Writing desk'),
      modes: {
        trace: T('なぞる', 'Trace'),
        copy: T('{手本|てほん} を {見|み}て {書|か}く', 'Copy beside the model'),
        prompt: T('{意味|いみ} から {書|か}く', 'Write from a prompt'),
        typeset: T('{印刷|いんさつ} の {字|じ} で {組|く}む', 'Typeset a practice page'),
      },
      forms: { kanji: T('{漢字|かんじ}', 'As usually written'), kana: T('{仮名|かな}', 'In kana') },
      yours: T('あなた の {字|じ}', 'Your handwriting'),
      typeset: T('{印刷|いんさつ} の {字|じ}', 'Typeset'),
      notebook: T('{控|ひか}え の {言葉|ことば}', 'From your notebook'),
      pages: T('{取|と}って おいた {紙|かみ}', 'Kept pages'),
    },
    mementos: {
      title: T('{練習|れんしゅう} の {記念|きねん}', 'Practice mementos'),
      shelf: T('{棚|たな} に {飾|かざ}る', 'On the practice shelf'),
    },
  };

  // ---- the first-session notebook note (§15.2: one note, nothing else collected) ------------
  C.notes.pa_lamps = {
    title: T('{練習用|れんしゅうよう} の {灯|あか}り', 'The practice lamps'),
    jp: '{灯|あか}り{堂|どう} の {隅|すみ} に 、 {旅|たび} の {灯|あか}り と は {別|べつ} の {小|ちい}さな {灯|あか}り が ある 。',
    en: 'In a corner of the Lantern Hall, apart from the travelling lantern, stands a rack of small practice lamps. Tending one means answering one short question about something you have met on the road. They keep no schedule: lit or not, they wait as long as you like.',
  };

  // ---- the world: the practice lamps' rack and the writing desk -------------------------------
  // Scenes only offer the activity; the hooks (src/ui/88_lanterns.js, 89_desk.js) start it once
  // the scene has ended. Each has "Not now" as the safe way out.
  RB.script.add(`
@scene pa.lamps
narr: {旅|たび} の {灯|あか}り と は {別|べつ} に 、 {練習用|れんしゅうよう} の {小|ちい}さな {灯|あか}り が {棚|たな} に {並|なら}んで いる 。 || Apart from the travelling lantern, a row of small practice lamps stands on a rack.
!choice
* {灯|あか}り を いくつか {手入|てい}れ する || Tend a few lamps. -> go
* {今|いま} は いい || Not now. -> end
:go
!hook pa_lamps

@scene pa.desk
narr: {小|ちい}さな {机|つくえ} 。 {紙|かみ} と {筆|ふで} が {置|お}いて ある 。 {泊|と}まり{客|きゃく} なら {誰|だれ} でも {使|つか}って いい らしい 。 || A small desk with paper and a brush set out. Any guest may use it, it seems.
!choice
* {机|つくえ} で {字|じ} を {書|か}く || Sit at the writing desk. -> go
* {今|いま} は いい || Not now. -> end
:go
!hook pa_desk
`, 'practice_a/10_text');
})(RB.content);
