/* Two quest lines that span the journey (docs/STORY.md, "Long roads").
 *   lq_fare — "A Fare Thirty Years Owed": Reedwake → Saltglass → Cinder
 *             Orchard → the Snowbell road → back to Reedwake and Saltglass.
 *   lq_road — "The Name Nobody Calls": Reedwake → Saltglass → Cinder
 *             Orchard → back to Reedwake (the side area Koharuno opens) →
 *             Lanternfall → Koharuno.
 * This file: new people, the two quests, items, notebook entries, learning
 * challenges and a few props. Maps, hooks into earlier chapters and the
 * scenes live in the other files of this directory. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const T = (en, jp) => ({ en, jp });

  // ---- people ----------------------------------------------------------------------------
  // Chigusa: keeps a tea stall at the Snowbell pass. Plain-spoken, dry, kind
  // under it; brews tea you could stand a spoon in. Thirty years ago she was
  // the kitchen girl at the Gull ("Sister Dove") who crossed Reedwake's river
  // in a storm and never came back to pay the fare.
  C.chars.lq_chigusa = { name: T('Chigusa', 'チグサ'), voice: { pitch: 0.94 },
    look: { skin: 2, hair: 'wrap', hairColor: 1, wrapCol: '#8a4a3a', cloth: ['#7a5a4a', '#5e4436', '#d8b88a'], shape: 'apron', acc: ['scarf'], scarfCol: '#6a7a5a' },
    portrait: { eyes: 'narrow', style: 'wrap', wrapCol: '#8a4a3a', collar: 'apron', acc: ['scarf'], scarfCol: '#6a7a5a', mole: true, bg: '#3a2e28' } };
  // Kayo: a gardener in Lanternfall, forty-two. At twelve she was the
  // tree-keeper's daughter in Koharuno, sent to her aunt after the flood.
  C.chars.lq_kayo = { name: T('Kayo', 'カヨ'), voice: { pitch: 1.06 },
    look: { skin: 1, hair: 'bob', hairColor: 1, cloth: ['#5a6a4a', '#46543a', '#d8a050'], shape: 'dress', acc: ['hat', 'basket'], hatCol: '#c8a860' },
    portrait: { eyes: 'soft', style: 'bob', acc: ['hat'], hatCol: '#c8a860', blush: true, bg: '#2a3424' } };

  // ---- quests ------------------------------------------------------------------------------
  // Stage text is the practical next step; `hint` is one extra nudge and `at`
  // the place or person where that step happens (read by the quest guidance).
  C.quests.lq_fare = { chapter: 1, title: T('A Fare Thirty Years Owed', '{三十年|さんじゅうねん} の {渡|わた}し{賃|ちん}'),
    stages: [
      { jp: 'コウジ の {母|はは} は 、 {払|はら}われない {渡|わた}し{賃|ちん} を {三十年|さんじゅうねん} {待|ま}って いた 。 {向|む}こう{岸|ぎし} の {渡|わた}し{小屋|ごや} で 、 {渡|わた}し{帳|ちょう} を {見|み}よう 。',
        en: 'Kōji\'s mother waited thirty years for one unpaid fare. Look at her fare book in the ferry house on the far bank.',
        hint: T('The book is on the shelf at the back of the ferry house, over the bridge.', '{帳面|ちょうめん} は 、 {橋|はし} を {渡|わた}った {所|ところ} の {渡|わた}し{小屋|ごや} の {奥|おく} に ある 。'),
        at: { map: 'rw.ferry', prop: 'bookpile', x: 6, y: 2 } },
      { jp: '{払|はら}わなかった {客|きゃく} は 、 {判子|はんこ} を {置|お}いて いった 。 {判子|はんこ} の {字|じ} は 「 かもめ 」 。 {西|にし} の {港町|みなとまち} に 、 {同|おな}じ {名前|なまえ} の {宿|やど} は ない だろう か 。',
        en: 'The passenger who never paid left a seal behind. It stamps "kamome" — gull. Is there an inn by that name in the harbour town to the west?',
        hint: T('The inn in Saltglass is called the Gull. Show Tamae the stamp.', '{潮硝子|しおがらす} の {宿|やど} は 「 かもめ{亭|てい} 」 。 タマエ に {判子|はんこ} の {跡|あと} を {見|み}せよう 。'),
        at: { map: 'sg.inn', npc: 'tamae' } },
      { jp: 'タマエ の {話|はなし} ： {判子|はんこ} を {借|か}りた の は 「 ハトねえ 」 。 {匙|さじ} が {立|た}つ ほど {濃|こ}い お{茶|ちゃ} を いれる {人|ひと} だった 。 {果樹園|かじゅえん} の {方|ほう} から はがき が {来|き}た 。 {灰実|はいみ} の {里|さと} の {宿|やど} で {聞|き}こう 。',
        en: 'Tamae remembers "Sister Dove", who borrowed the seal and brewed tea you could stand a spoon in. Years later a card came from the orchard country. Ask at the inn in Cinder Orchard.',
        hint: T('The inn in Cinder Orchard is Fusa\'s. Innkeepers remember a strong cup of tea.', '{灰実|はいみ} の {里|さと} の {宿|やど} は フサ の {宿|やど} 。 {宿|やど} の {人|ひと} は 、 {濃|こ}い お{茶|ちゃ} を {忘|わす}れない 。'),
        at: { map: 'co.inn', npc: 'co_fusa' } },
      { jp: 'フサ は {覚|おぼ}えて いた 。 {名前|なまえ} は チグサ 。 {雪|ゆき} の {道|みち} を {上|のぼ}って 、 {峠|とうげ} で お{茶|ちゃ} の {屋台|やたい} を {開|ひら}いた らしい 。 {雪鈴|ゆきすず} へ の {坂道|さかみち} で {探|さが}そう 。',
        en: 'Fusa remembers her: Chigusa. She went up the snow road years ago and keeps a tea stall at the pass. Look for her on the road to Snowbell.',
        hint: T('The stall is on the western half of the Snowbell road, just north of the path.', '{屋台|やたい} は {坂道|さかみち} の {西|にし} の {方|ほう} 、 {道|みち} の すぐ {北|きた} に ある 。'),
        at: { map: 'sb.road', npc: 'lq_chigusa' } },
      { jp: 'チグサ は {雪|ゆき} の {道|みち} が {開|ひら}いたら 、 {葦|あし}ノ{瀬|せ} へ {払|はら}い に {行|い}く 。 ハナ の {茶屋|ちゃや} で {会|あ}おう 。',
        en: 'Chigusa will go down to Reedwake to pay once the road is open again. Meet her at Hana\'s teahouse.',
        hint: T('The road opens when the light above Snowbell is lit. You can travel to Reedwake from the route chart.', '{雪鈴|ゆきすず} の {上|うえ} の {灯|あか}り が ともれば 、 {道|みち} は {開|ひら}く 。 {葦|あし}ノ{瀬|せ} へ は {地図|ちず} から {行|い}ける 。'),
        at: { map: 'rw.tea', npc: 'lq_chigusa' } },
      { jp: '{渡|わた}し{賃|ちん} は {払|はら}われた 。 チグサ は 「 かもめ 」 の {判子|はんこ} を {自分|じぶん} で {返|かえ}し に {行|い}く 。 {潮硝子|しおがらす} の かもめ{亭|てい} で {会|あ}おう 。',
        en: 'The fare is paid. Chigusa is taking the Gull\'s seal back herself. Meet her at the Gull in Saltglass.',
        hint: T('The Gull is the big inn on Saltglass\'s main street.', 'かもめ{亭|てい} は 、 {潮硝子|しおがらす} の {大通|おおどお}り の {大|おお}きな {宿|やど} だ 。'),
        at: { map: 'sg.inn', npc: 'lq_chigusa' } },
    ],
    reward: { flags: ['lq_fare_done'] } };

  C.quests.lq_road = { chapter: 1, title: T('The Name Nobody Calls', '{誰|だれ} も {呼|よ}ばない {名前|なまえ}'),
    stages: [
      { jp: 'コウジ の {渡|わた}し{小屋|ごや} の {先|さき} に 、 {名前|なまえ} の {消|き}えた {灯|あか}り が ある 。 その {先|さき} の {道|みち} は 、 {歩|ある}く と {元|もと} に {戻|もど}って しまう 。 {桟橋|さんばし} の ヤス に {聞|き}いて みよう 。',
        en: 'Past Kōji\'s ferry house stands a lantern whose name has gone, and the path beyond turns you back where you started. Ask Old Yasu on the pier — he has known this river longest.',
        hint: T('Old Yasu fishes from the pier south of the bridge.', 'ヤス は {橋|はし} の {南|みなみ} の {桟橋|さんばし} に いる 。'),
        at: { map: 'rw.village', npc: 'yasu' } },
      { jp: 'ヤス は {昔|むかし} 、 {川|かわ} の {向|む}こう の {村|むら} に {住|す}んで いた 。 {大|おお}きな {柿|かき} の {木|き} は {覚|おぼ}えて いる が 、 {村|むら} の {名前|なまえ} が {出|で}て こない 。 {大水|おおみず} の {後|あと} 、 {村|むら} の {人|ひと} は {舟|ふね} で {川|かわ} を {下|くだ}った 。 {潮硝子|しおがらす} の {船乗|ふなの}り に {聞|き}こう 。',
        en: 'Yasu once lived in the hamlet across the river. He remembers its great persimmon tree, but not its name. After the flood its people left downriver by boat. Ask the boatmen of Saltglass.',
        hint: T('Tetsu, who runs the Saltglass ferry, has worked boats since his father\'s day.', '{潮硝子|しおがらす} の {渡|わた}し{船|ぶね} の テツ は 、 {父親|ちちおや} の {代|だい} から {船|ふね} に {乗|の}って いる 。'),
        at: { map: 'sg.harbor', npc: 'tetsu' } },
      { jp: 'テツ の {父|ちち} は 、 {大水|おおみず} の {後|あと} 、 {村|むら} の {人|ひと} を {運|はこ}んだ 。 {柿|かき} の {枝|えだ} を {持|も}って 、 {果樹園|かじゅえん} へ {行|い}った {家族|かぞく} も いた 。 {灰実|はいみ} の {里|さと} で {柿|かき} を {育|そだ}てる {人|ひと} に {聞|き}こう 。',
        en: 'Tetsu\'s father carried the hamlet\'s people after the flood; some families went inland to the orchards with cuttings of their persimmon tree. Ask the persimmon growers of Cinder Orchard.',
        hint: T('Grandma Ume on the terraces knows every persimmon tree by name.', '{段々畑|だんだんばたけ} の ウメ ばあさん は 、 {柿|かき} の {木|き} の こと なら {何|なん} でも {知|し}って いる 。'),
        at: { map: 'co.terraces', npc: 'co_ume' } },
      { jp: 'ウメ の いちばん {古|ふる}い {柿|かき} は 「 {小春|こはる} 」 。 {東|ひがし} の {川|かわ} の {向|む}こう の {大木|たいぼく} から {接|つ}いだ もの だ 。 {実|み} が {村|むら} の {名前|なまえ} を {借|か}りて いた の かも しれない 。 {干|ほ}し{柿|がき} を ヤス に {届|とど}けよう 。',
        en: 'Ume\'s oldest persimmon is called Koharu, grafted long ago from a great tree across a river in the east. Perhaps the fruit borrowed the hamlet\'s name. Take her dried persimmon to Old Yasu.',
        hint: T('Yasu said he can still taste those persimmons.', 'ヤス は 「 {柿|かき} の {味|あじ} は {今|いま} でも {覚|おぼ}えて いる 」 と {言|い}って いた 。'),
        at: { map: 'rw.village', npc: 'yasu' } },
      { jp: 'ヤス が {思|おも}い{出|だ}した 。 {村|むら} の {名前|なまえ} は {小春野|こはるの} 。 {渡|わた}し{小屋|ごや} の {先|さき} の {灯|あか}り に 、 {名前|なまえ} を {書|か}こう 。',
        en: 'Yasu remembered: the hamlet was Koharuno. Write the name on the blank lantern past the ferry house.',
        hint: T('Yasu is waiting by the lantern.', 'ヤス は {灯|あか}り の そば で {待|ま}って いる 。'),
        at: { map: 'rw.village', prop: 'deadlantern', x: 48, y: 17 } },
      { jp: '{小春野|こはるの} へ の {道|みち} が {戻|もど}った 。 {渡|わた}し{小屋|ごや} の {先|さき} から {東|ひがし} へ {歩|ある}いて 、 {村|むら} の {大|おお}きな {柿|かき} の {木|き} を {見|み}て みよう 。',
        en: 'The road to Koharuno holds again. Walk east from the ferry house and look at the great persimmon tree in the middle of the hamlet.',
        hint: T('The tree stands just north of the path, between the two old houses.', '{柿|かき} の {木|き} は 、 {道|みち} の すぐ {北|きた} 、 {古|ふる}い {家|いえ} の {間|あいだ} に ある 。'),
        at: { map: 'lq.koharu', prop: 'lq_kaki', x: 20, y: 7 } },
      { jp: '{柿|かき} の {木|き} に 、 「 かよ 」 と いう {子|こ} の {背|せ} の {高|たか}さ が {刻|きざ}んで ある 。 {木守|きもり} の {娘|むすめ} は 、 {大水|おおみず} の {後|あと} 、 {灯落|ひおち} の おば に {預|あず}けられた 。 {灯落|ひおち} で {柿|かき} を {育|そだ}てて いる {人|ひと} を {探|さが}そう 。',
        en: 'The tree bears height marks for a child called Kayo — the tree-keeper\'s daughter, sent to her aunt in Lanternfall after the flood. Look for someone growing a persimmon in Lanternfall.',
        hint: T('Try the Garden Quarter. In Lanternfall everyone answers "certainly" — if an answer sounds hollow, come back once the town can say what it means.', '{庭|にわ} の {区画|くかく} を {探|さが}そう 。 {灯落|ひおち} で は {誰|だれ} も が 「 もちろん 」 と {答|こた}える 。 {答|こた}え が {空|から} に {聞|き}こえたら 、 {町|まち} が {本当|ほんとう} の こと を {言|い}える よう に なって から {来|こ}よう 。'),
        at: { map: 'lf.gardens', npc: 'lq_kayo' } },
      { jp: 'カヨ は {小春野|こはるの} に {帰|かえ}る 。 {柿|かき} の {木|き} の {下|した} で {会|あ}おう 。',
        en: 'Kayo is going home to Koharuno. Meet her under the persimmon tree.',
        hint: T('Koharuno is reached from the path past Kōji\'s ferry house in Reedwake.', '{小春野|こはるの} へ は 、 {葦|あし}ノ{瀬|せ} の {渡|わた}し{小屋|ごや} の {先|さき} の {道|みち} から {行|い}ける 。'),
        at: { map: 'lq.koharu', npc: 'lq_kayo' } },
    ],
    reward: { flags: ['lq_road_done'] } };

  // ---- items ---------------------------------------------------------------------------------
  const it = (id, d) => (C.items[id] = d);
  it('lq_stamp', { name: T('Stamped scrap', '{判子|はんこ} の {跡|あと}'), key: true,
    desc: 'A scrap of paper stamped with the seal left in the Reedwake ferry book: かもめ, "gull".' });
  it('lq_koharu_fruit', { name: T('Koharu dried persimmon', '{小春|こはる} の {干|ほ}し{柿|がき}'), key: true,
    desc: 'From Grandma Ume\'s oldest tree in Cinder Orchard. Wrinkled, sugary, and meant for Old Yasu.' });
  it('lq_kept_cup', { name: T('The kept cup', '{伏|ふ}せて おいた {湯呑|ゆの}み'), slot: 'charm', effect: { resolve: 1 },
    desc: 'The thick little cup Chigusa kept upside down on her table for thirty years, for the ferrywoman she owed. "Keep it for the next time you owe someone." Charm: in battle you and your companion stand a little steadier (+1 resolve).' });
  it('lq_kaki_seed', { name: T('Persimmon-seed charm', '{柿|かき} の {種|たね} の お{守|まも}り'), slot: 'charm', effect: { harmonyStart: 1 },
    desc: 'A seed from Kayo\'s Lanternfall tree — a grandchild of Koharu — in a pouch she sewed from an old sleeve. "Seeds wait. So can we." Charm: encounters begin with a little harmony already built.' });
  it('lq_tenugui', { name: T('Persimmon-dyed cloth', '{柿渋|かきしぶ} の {手|て}ぬぐい'), slot: 'cosmetic', acc: 'scarf', wear: { scarfCol: '#9a5a32' },
    desc: 'Found in the tree-keeper\'s chest in Koharuno: a cotton cloth dyed with kakishibu, the brown-orange dye made from unripe persimmons. Worn at the neck as a keepsake; it changes only how you look.' });

  // ---- notebook ---------------------------------------------------------------------------------
  C.notes.lq_farebook = { title: T('The Reedwake fare book', '{渡|わた}し{帳|ちょう}'),
    jp: '{葦|あし}ノ{瀬|せ} の {渡|わた}し{舟|ぶね} の {帳面|ちょうめん} 。 {最後|さいご} の {客|きゃく} の {名前|なまえ} は {消|き}えて 、 「 かもめ 」 の {判子|はんこ} だけ が {残|のこ}った 。',
    en: 'Kōji\'s mother recorded every crossing and every fare. One entry, from a stormy night thirty years ago, was never paid: the passenger\'s name went blank in this year\'s storm, and only the seal they left as a pledge remains. It stamps かもめ (gull).' };
  C.notes.lq_koharuno = { title: T('Koharuno', '{小春野|こはるの}'), fiction: true,
    jp: '{葦|あし}ノ{瀬|せ} の {川|かわ} の {向|む}こう に あった {小|ちい}さな {村|むら} 。 {三十年|さんじゅうねん} {前|まえ} の {大水|おおみず} で {人|ひと} が {去|さ}り 、 {名前|なまえ} を {呼|よ}ぶ {人|ひと} が いなく なった 。',
    en: 'A hamlet of ten houses across Reedwake\'s river, known for one great persimmon tree. After the flood thirty years ago its people scattered, nobody called its name, and the road to it forgot where it led. The name lived on only in a persimmon grown in Cinder Orchard, "Koharu". (The hamlet and the Koharu persimmon are fiction.)' };
  C.notes.lq_koharubiyori = { title: T('Koharu and koharu-biyori', '{小春|こはる} と {小春日和|こはるびより}'),
    jp: '{小春|こはる} は {旧暦|きゅうれき} の {十月|じゅうがつ} の {別名|べつめい} 。 {小春日和|こはるびより} は 、 {晩秋|ばんしゅう} から {初冬|しょとう} の 、 {暖|あたた}かく {穏|おだ}やか な {晴|は}れ の {日|ひ} 。',
    en: '小春 (koharu) is an old name for the tenth month of the lunar calendar, roughly November today, and 小春日和 (koharu-biyori) is a mild, sunny day in late autumn or early winter. Despite the 春 ("spring") in it, it is not about spring — a common trap for learners.' };
  C.notes.lq_kakishibu = { title: T('Kakishibu', '{柿渋|かきしぶ}'),
    jp: '{柿渋|かきしぶ} は 、 {渋|しぶ}い {青|あお}い {柿|かき} を しぼって {作|つく}る {液|えき} 。 {布|ぬの} や {紙|かみ} を {染|そ}めたり 、 {水|みず} に {強|つよ}く したり する 。',
    en: 'Kakishibu is juice pressed from unripe, astringent persimmons and left to ferment. In Japan it has long been used to dye cloth, paper and wood a brown-orange and to make them more water-resistant.' };

  // ---- learning challenges ------------------------------------------------------------------------
  const X = C.challenges;
  // Reedwake (read in chapter 1 or later): the fare book and the pledge seal.
  X['lq.c_seal'] = { title: T('The fare book', '{渡|わた}し{帳|ちょう}'),
    tiers: {
      F: [{ kind: 'write', item: 'v:かもめ', prompt: { en: 'The seal is carved back to front, so you press it on a scrap of paper. It prints three hiragana: ka-mo-me — "kamome", a gull. Write the word in hiragana.' }, answer: 'かもめ', accept: ['かもめ'], mode: 'kana', explain: { jp: 'かもめ', en: 'かもめ (kamome) — a gull, a seagull.' } }],
      E: [
        { kind: 'choose', item: 'c:lq_fare_e', ctx: { jp: 'わたしちん 、 かならず はらい に きます 。', en: '' }, prompt: { en: 'The last entry in the book, in a young person\'s shaky hand. What does it promise?' },
          options: [{ en: 'I will come back to pay the fare, without fail.', ok: true }, { en: 'I have paid the fare in full.', ok: false, why: { en: 'はらいに きます = "will come to pay": nothing has been paid yet.' } }, { en: 'Please pay the fare when you come.', ok: false, why: { en: 'There is no ください; the writer is the one who will come.' } }],
          explain: { en: 'Verb stem + に + 来る/行く = "come / go (in order) to do…": はらいに きます = "(I) will come to pay". かならず = "without fail".' } },
        { kind: 'write', item: 'v:かもめ', prompt: { en: 'Press the seal on a scrap of paper. It prints a word: kamome, a gull. Write it in hiragana.' }, answer: 'かもめ', accept: ['かもめ'], mode: 'kana', explain: { jp: 'かもめ', en: 'かもめ — a gull.' } },
      ],
      I: [
        { kind: 'choose', item: 'c:lq_fare_i', ctx: { jp: '{嵐|あらし} の {夜|よる} 、 {川|かわ} {高|たか}し@高い 。 {娘|むすめ} {一人|ひとり} を {渡|わた}す 。 {賃|ちん} は {後払|あとばら}い 。 かわり に {判|はん} を {預|あず}かる 。', en: '' }, prompt: { en: 'Beside the entry, Kōji\'s mother noted what happened, in a ferrywoman\'s shorthand. What does it say?' },
          options: [{ en: 'Stormy night, river high. Took one girl across. Fare to be paid later; kept a seal in its place.', ok: true }, { en: 'Stormy night, so no crossing. A girl left her seal and waited for morning.', ok: false, why: { en: '渡す = to take someone across: she did cross.' } }, { en: 'A girl paid double because of the storm.', ok: false, why: { en: '後払い = paying afterwards; nothing was paid that night.' } }],
          explain: { en: '川高し is a clipped, old-fashioned way of writing 川が高い — note-takers drop particles, and 〜し is the classical adjective ending. 後払い = paying later; 預かる = to keep something in trust for someone.' } },
        { kind: 'write', item: 'v:かもめ', prompt: { en: 'The seal prints a word meaning "gull" (kamome). Write it.' }, answer: 'かもめ', accept: ['かもめ', 'カモメ'], mode: 'reading', explain: { jp: 'かもめ', en: 'かもめ — a gull.' } },
      ],
      A: [
        { kind: 'choose', item: 'g:keigo_kenjo', ctx: { jp: 'この {判|はん} は {私|わたし} の もの で は ございません 。 {必|かなら}ず {受|う}け{出|だ}し に {参|まい}ります ので 、 それ まで お{預|あず}け いたします 。', en: '' }, prompt: { en: 'Squeezed under the entry, in the girl\'s hand. What is she telling the ferrywoman?' },
          options: [{ en: 'The seal isn\'t hers; she is leaving it in trust and will come back to redeem it.', ok: true }, { en: 'She is giving the seal away because it means nothing to her.', ok: false, why: { en: '受け出す is to redeem something left as a pledge: she means to reclaim it.' } }, { en: 'She is asking the ferrywoman to deliver the seal to its owner.', ok: false, why: { en: 'お預けいたします = "I leave it with you" (humble); there is no request to deliver anything.' } }],
          explain: { en: '受け出す: to redeem a pledge. 参ります and お預けいたします are humble forms, and ございません the formal negative — very careful language from a frightened girl who wanted to be taken seriously.' } },
        { kind: 'write', item: 'v:かもめ', prompt: { en: 'The seal prints a word meaning "gull". Write it.' }, answer: 'かもめ', accept: ['かもめ', 'カモメ'], mode: 'reading', explain: { jp: 'かもめ', en: 'かもめ — a gull.' } },
      ],
    } };

  // The Snowbell road (chapter 4): the note Chigusa sends ahead to Kōji.
  X['lq.c_note'] = { title: T('A note to send ahead', '{先|さき} に {出|だ}す {手紙|てがみ}'),
    tiers: {
      F: [{ kind: 'order', item: 'c:lq_note_f', prompt: { en: 'Chigusa: "Help me with the first line. I want to say: I\'m sorry I\'m late." Put the words in order.' },
        tiles: ['おそく', 'なって', 'ごめんなさい'], answer: ['おそく', 'なって', 'ごめんなさい'], orderHint: { en: 'おそく なって = "having become late"; ごめんなさい = "I\'m sorry".' } }],
      E: [{ kind: 'order', item: 'c:lq_note_e', prompt: { en: 'Chigusa\'s first line: "I am going to Reedwake to pay the fare." Put it in order.' },
        tiles: ['{葦|あし}ノ{瀬|せ} へ', '{渡|わた}し{賃|ちん} を', '{払|はら}い に', '{行|い}きます'], answer: ['{葦|あし}ノ{瀬|せ} へ', '{渡|わた}し{賃|ちん} を', '{払|はら}い に', '{行|い}きます'],
        alts: [['{渡|わた}し{賃|ちん} を', '{払|はら}い に', '{葦|あし}ノ{瀬|せ} へ', '{行|い}きます']],
        orderHint: { en: 'The verb comes last. 払いに 行きます = "go (in order) to pay" — the same pattern as the promise in the fare book.' } }],
      I: [{ kind: 'choose', item: 'g:register_polite_plain', prompt: { en: 'Chigusa has never met Kōji. Which opening line suits her letter?' },
        options: [{ jp: '{突然|とつぜん} の お{手紙|てがみ} 、 {失礼|しつれい} いたします 。', ok: true }, { jp: '{元気|げんき} ？ ひさしぶり ！', ok: false, why: { en: 'Casual, and they have never met — there is no "long time" to speak of.' } }, { jp: 'お{金|かね} を {返|かえ}して ください 。', ok: false, why: { en: 'She is the one who owes.' } }],
        explain: { en: '突然のお手紙失礼いたします ("Please forgive this sudden letter") is a set phrase for writing to someone who isn\'t expecting to hear from you. いたします is the humble form of します.' } }],
      A: [{ kind: 'choose', item: 'g:causative', ctx: { jp: '{三十年|さんじゅうねん} も お{待|ま}たせ した {上|うえ} に 、 {今更|いまさら} と お{思|おも}い でしょう が 、 せめて お{約束|やくそく} だけ は {果|は}たさせて ください 。', en: '' }, prompt: { en: 'Chigusa\'s draft. What exactly is she asking of Kōji?' },
        options: [{ en: 'Knowing it is absurdly late, she asks at least to be allowed to keep her promise.', ok: true }, { en: 'She asks him to forgive the debt.', ok: false, why: { en: '果たさせてください = "please let me fulfil (it)": she wants to pay, not to be let off.' } }, { en: 'She says she will come only if he still wants the money.', ok: false, why: { en: 'There is no condition; せめて〜だけは = "at least…".' } }],
        explain: { en: '〜た上に = on top of having…; 今更 = now, after all this time (it implies "too late"); せめて〜だけは = at least…; 果たさせてください is causative + request: "please let me fulfil".' } }],
    } };

  // Back in Reedwake (after chapter 3): writing the lost name on the lantern.
  X['lq.c_koharu'] = { title: T('The lantern past the ferry house', '{渡|わた}し{小屋|ごや} の {先|さき} の {灯|あか}り'),
    tiers: {
      F: [{ kind: 'write', item: 'v:小春', prompt: { en: 'Yasu said the name: Koharuno. The の is already on the shade. Write the first part, "koharu", in hiragana.' }, template: { before: '', after: 'の' }, answer: 'こはる', accept: ['こはる', '小春'], mode: 'kana', explain: { jp: '{小春|こはる}{野|の}', en: 'Koharuno = こはる + の.' } }],
      E: [{ kind: 'write', item: 'v:小春野', prompt: { en: 'Write the hamlet\'s name on the shade: Koharuno.' }, answer: 'こはるの', accept: ['こはるの', '小春野'], mode: 'reading', explain: { jp: '{小春野|こはるの}', en: 'Koharuno — 小春 (koharu) + 野 (field, here read の).' } }],
      I: [
        { kind: 'choose', item: 'v:小春', ctx: { jp: '{小春|こはる} の {頃|ころ} 、 {柿|かき} が {甘|あま}く なる 。', en: '' }, prompt: { en: 'Carved on the lantern post, below the blank shade. When do the persimmons turn sweet?' },
          options: [{ en: 'In the mild days of late autumn and early winter.', ok: true }, { en: 'In early spring.', ok: false, why: { en: '小春 contains 春 ("spring"), but it is an old name for the tenth lunar month, around November.' } }, { en: 'In the rainy season.', ok: false, why: { en: 'The rainy season is 梅雨 (つゆ).' } }],
          explain: { en: '小春 is an old name for the tenth month of the lunar calendar (roughly November). 小春日和 is a mild, sunny day in late autumn or early winter.' } },
        { kind: 'write', item: 'v:小春野', prompt: { en: 'Write the hamlet\'s name on the shade: Koharuno (hiragana or kanji).' }, answer: 'こはるの', accept: ['こはるの', '小春野'], mode: 'reading', explain: { jp: '{小春野|こはるの}', en: 'Koharuno.' } },
      ],
      A: [
        { kind: 'choose', item: 'c:lq_koharu_a', ctx: { jp: '{名|な} は {呼|よ}ばれて こそ {名|な} 。 {呼|よ}ぶ {者|もの} なき {里|さと} は 、 {地図|ちず} より {先|さき} に {人|ひと} の {口|くち} から {消|き}える 。', en: '' }, prompt: { en: 'A line cut into the lantern frame, older than the paper. What does it claim?' },
          options: [{ en: 'A place with no one left to say its name vanishes from people\'s mouths before it vanishes from maps.', ok: true }, { en: 'Maps outlast spoken names, so a place name should be written down.', ok: false, why: { en: '地図より先に = "sooner than from maps": speech is lost first, and the line is about calling, not writing.' } }, { en: 'Only the people who live in a place may call its name.', ok: false, why: { en: '呼ぶ者なき = "with no one who calls (it)"; nothing restricts who may.' } }],
          explain: { en: '〜てこそ = only when… (is it truly…); なき is the literary form of ない before a noun (呼ぶ者なき里 = a hamlet with no one to call it); 〜より先に = before….' } },
        { kind: 'write', item: 'v:小春野', prompt: { en: 'Write the hamlet\'s name on the shade: Koharuno (hiragana or kanji).' }, answer: 'こはるの', accept: ['こはるの', '小春野'], mode: 'reading', explain: { jp: '{小春野|こはるの}', en: 'Koharuno.' } },
      ],
    } };
})(RB.content);

// ---- props --------------------------------------------------------------------------------------------
(function () {
  'use strict';
  const P = RB.props && RB.props.P;
  if (!P) return;
  const px = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  const def = (id, o, draw) => (P[id] = Object.assign({ id, w: 1, h: 1, block: true }, o, { draw }));
  const blob = (c, cx, cy, r, col) => { c.fillStyle = col; c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.fill(); };
  const shadow = (c, x, y, w) => { c.fillStyle = 'rgba(0,0,0,0.22)'; c.beginPath(); c.ellipse(x + w / 2, y, w / 2 - 1, 3, 0, 0, Math.PI * 2); c.fill(); };
  // fixed fruit positions (relative to the canopy centre)
  const FRUIT = [[-11, -6], [-6, 2], [0, -12], [5, -3], [10, 4], [13, -9], [-14, 5], [7, -15], [-3, -7], [16, 0], [-9, -14], [2, 7]];

  // The great persimmon tree of Koharuno (2×2): an old, gnarled trunk with
  // height marks, a thinning autumn canopy and the fruit nobody picked.
  def('lq_kaki', { w: 2, h: 2 }, (c, x, y) => {
    shadow(c, x, y + 30, 30);
    px(c, x + 12, y + 6, 8, 24, '#4a3a2e');
    px(c, x + 12, y + 6, 2, 24, '#5e4a3a');
    px(c, x + 18, y + 10, 2, 20, '#3a2c22');
    px(c, x + 6, y + 4, 8, 3, '#4a3a2e'); px(c, x + 19, y + 2, 8, 3, '#4a3a2e');
    for (let i = 0; i < 4; i++) px(c, x + 13, y + 26 - i * 4, 4, 1, '#c8b89a'); // the height marks
    blob(c, x + 16, y - 6, 17, '#7a4a24');
    blob(c, x + 9, y - 2, 10, '#96602a');
    blob(c, x + 24, y - 1, 10, '#96602a');
    blob(c, x + 16, y - 12, 11, '#b07a34');
    blob(c, x + 11, y - 10, 5, '#c89040'); blob(c, x + 22, y - 8, 4, '#c89040');
    for (const [dx, dy] of FRUIT) { px(c, x + 16 + dx, y - 4 + dy, 3, 3, '#e8742a'); px(c, x + 16 + dx, y - 4 + dy, 1, 1, '#f8b060'); }
  });
  // A young persimmon grown from seed (Kayo's tree in Lanternfall).
  def('lq_kaki_young', {}, (c, x, y) => {
    shadow(c, x, y + 15, 14);
    px(c, x + 7, y + 4, 2, 11, '#5a4636');
    blob(c, x + 8, y, 7, '#6a7a3a');
    blob(c, x + 6, y - 2, 4, '#8a8a42');
    blob(c, x + 11, y + 1, 3, '#a07a38');
    for (const [dx, dy] of [[-3, 1], [2, -3], [4, 3]]) { px(c, x + 8 + dx, y + dy, 2, 2, '#e8742a'); }
  });
  // The stone of names in Koharuno (2×1): a low slab with carved lines.
  def('lq_namestone', { w: 2 }, (c, x, y) => {
    shadow(c, x, y + 15, 30);
    px(c, x + 3, y - 6, 26, 20, '#7e7e78');
    px(c, x + 4, y - 5, 24, 18, '#a2a29a');
    px(c, x + 4, y - 5, 24, 2, '#b8b8b0');
    for (let i = 0; i < 5; i++) px(c, x + 7 + (i % 2) * 2, y - 1 + i * 3, 16 - (i % 2) * 4, 1, '#62625c');
    px(c, x + 4, y + 11, 7, 2, '#6a8a4a'); px(c, x + 22, y + 11, 5, 2, '#6a8a4a');
  });
  // Chigusa's tea stall (2×1): a short counter under a cloth awning, a kettle
  // and a row of thick cups (one always upside down).
  def('lq_teastall', { w: 2 }, (c, x, y, p) => {
    px(c, x, y + 2, 32, 13, p.wood[0]);
    px(c, x, y + 2, 32, 3, p.wood[3]);
    px(c, x + 2, y - 18, 2, 21, p.wood[2]); px(c, x + 28, y - 18, 2, 21, p.wood[2]);
    for (let i = 0; i < 6; i++) px(c, x - 2 + i * 6, y - 22, 6, 6, i % 2 ? '#e8dcc8' : '#9a4a3a');
    px(c, x - 2, y - 16, 36, 1, 'rgba(0,0,0,0.25)');
    px(c, x + 4, y - 3, 7, 5, '#3a3a40'); px(c, x + 10, y - 2, 3, 1, '#3a3a40'); px(c, x + 6, y - 5, 3, 2, '#3a3a40');
    for (let i = 0; i < 3; i++) px(c, x + 16 + i * 5, y - 1, 4, 3, '#d8cfc0');
    px(c, x + 16, y - 2, 4, 1, '#8a8278'); // the cup kept upside down
  });
})();
