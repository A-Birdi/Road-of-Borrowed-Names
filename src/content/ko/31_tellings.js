/* Kotonoha, Chapter 9: the island's legend, told four ways, and the voices in the shells (expansion P11; rules
 * src/engine/72k_tellings.js and 72s_shells.js, sheets src/ui/89k_tellings.js and 89s_shells.js; plan 07_REGIONS.md
 * R4, A49 folklore told several ways, A53 distributed messages, A5 reference, A10 comic reconstruction).
 *   ko.s_first  three conches at the tide pools hold six lines from the night the first keeper planted the tree: who
 *               said each, and to whom (Chitose, the first keeper; Yoshi, her younger sister; the old boatman; and the
 *               one she wrote to, who was never there).
 *   ko.t_hall   the keepers' hall's exhibition: Otoha's telling (the keepers'), Nami's (the boat-keepers'), Hamaji's
 *               (the fishers', with the sea serpent) and the shells' (the first keeper's own voice). Three panels, each
 *               showing one teller's version: none is wrong, and each pick says what showing it means.
 * Each text is given by profile: F in kana, E reporting who said what (〜と言いました) in narrative past, I comparing
 * versions (〜によると, 〜という話だ), A a literary register; Otoha's A telling quotes the Kokinshū's preface (905), a
 * real text, labelled as such. The island's lore (Chitose, the drifting island, the serpent) is the game's own. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const T = (jp, en) => ({ jp, en });
  const no = (en) => ({ en });
  const ch = (o) => Object.assign({ kind: 'choose' }, o);
  const o = (jp, ok, why) => Object.assign({ jp, ok: !!ok }, why ? { why: { en: why } } : {});
  C.tellings = C.tellings || {};
  C.shells = C.shells || {};

  // ---- the grammar this chapter teaches ------------------------------------------------------------------------------
  if (RB.grammar && RB.grammar.add) RB.grammar.add([
    { id: 'ko_to_iimashita', lv: 'E', title: '「…」と言いました (reporting who said what)', pat: '{人|ひと} は 「…」 と {言|い}いました',
      en: 'To report what someone said, put their words in 「」 and add と言いました ("said"), or と言っていました ("was saying"; "said, back then"). The と marks the quotation. Who said it comes first, with は or が; to whom, with に: ヨシ は チトセ に 「…」 と 言いました.',
      ex: [{ jp: 'ナミ さん は 「{島|しま} は {流|なが}れて いた 」 と {言|い}いました 。', en: 'Nami said, "The island used to drift."' }, { jp: '{妹|いもうと} は {姉|あね} に 「{返事|へんじ} は まだ ？」 と {言|い}いました 。', en: 'The younger sister said to the elder: "Still no reply?"' }] },
    { id: 'ko_to_iu_hanashi', lv: 'I', title: '～という話だ (the story goes that)', pat: '{普通形|ふつうけい} ＋ と いう {話|はなし} だ',
      en: 'Plain form + という話だ: "the story is that …, they say that …". It hands on something heard, like そうだ, but names it as a story: something told, which may or may not be so. Set beside 〜によると, it lets you compare whose story says what.',
      ex: [{ jp: 'この {島|しま} は {昔|むかし} {流|なが}れて いた と いう {話|はなし} だ 。', en: 'The story goes that this island once drifted.' }, { jp: '{漁師|りょうし} の {間|あいだ} で は 、 {島|しま} は {海蛇|うみへび} の {背中|せなか} だ と いう {話|はなし} だ 。', en: 'Among the fishers, the story is that the island is a serpent\'s back.' }] },
    { id: 'ko_literary', lv: 'A', title: 'Literary narration: ～と伝えられている, ～ほかならない, and a classical line', pat: '…と {伝|つた}えられて いる ／ …に ほかならない',
      en: 'A literary register for tellings: と伝えられている ("it is handed down that"), にほかならない ("is nothing other than"), 〜し for the classical past of a noun clause (呑まれし言葉, "words that were swallowed"). The Kokinshū\'s preface (905, a real text) is quoted in its own classical Japanese: ぞ … ける is an old emphatic pattern, "it is … that it became". Optional reading, always glossed.',
      ex: [{ jp: '{島|しま} は {眠|ねむ}れる {海蛇|うみへび} の {背|せ} に ほかならない 。', en: 'The island is nothing other than a sleeping serpent\'s back.' }, { jp: 'やまとうた は 、 {人|ひと} の {心|こころ} を {種|たね} と して 、 よろづ の {言|こと}の{葉|は} と ぞ なれり ける 。', en: 'Japanese poetry took the human heart as its seed and became the myriad leaves of words. (Kokinshū, 905)' }] },
  ], 'ko');

  // ---- the four tellings (one place; the reading tasks below ask about the same text) --------------------------------
  const OTOHA = {
    F: T('むかし 、 ひとり の おんな の ひと が 、 うみ の まんなか の いわ に 、 くす の たね を うえた 。 「とどかない ことば が 、 やすめる よう に 。」 それ が この き 。 その ひと が 、 さいしょ の はもり 。', 'Long ago, a woman planted a camphor seed on a rock in the middle of the sea. "So that words that don\'t arrive can rest." That is this tree. She was the first keeper.'),
    E: T('{昔|むかし} 、 {一人|ひとり} の {女|おんな} の {人|ひと} が 、 {海|うみ} の {真|ま}ん{中|なか} の {岩|いわ} に {楠|くす} の {種|たね} を {植|う}えました 。 その {人|ひと} は 「{届|とど}かない {言葉|ことば} が 、 {休|やす}める よう に 」 と {言|い}いました 。 その {人|ひと} が 、 {最初|さいしょ} の {葉守|はもり} です 。 {岩|いわ} は 、 {昔|むかし} から ここ に ありました 。', 'Long ago, a woman planted a camphor seed on a rock in the middle of the sea. She said, "So that words that don\'t arrive can rest." She was the first keeper. The rock had always been here.'),
    I: T('{葉守|はもり} の {言|い}い{伝|つた}え に よると 、 {最初|さいしょ} の {葉守|はもり} は 、 {返事|へんじ} の {来|こ}ない {手紙|てがみ} を {書|か}き{続|つづ}けた {人|ひと} だった 。 {誰|だれ} の {言葉|ことば} で も {休|やす}める よう に と 、 {海|うみ} の {岩|いわ} に {楠|くす} を {植|う}えた と いう {話|はなし} だ 。 {岩|いわ} は 、 {昔|むかし} から ここ に あった 。', 'By the keepers\' tradition, the first keeper was someone who kept writing letters that were never answered. The story is that she planted the camphor on a rock in the sea so that anyone\'s words could rest. The rock had always been here.'),
    A: Object.assign(T('{葉守|はもり} の {間|あいだ} で は 、 {古今集|こきんしゅう} の {仮名序|かなじょ} の {一節|いっせつ} が {唱|とな}えられて きた 。 「やまとうた は 、 {人|ひと} の {心|こころ} を {種|たね} と して 、 よろづ の {言|こと}の{葉|は} と ぞ なれり ける 。」 {最初|さいしょ} の {葉守|はもり} は 、 {届|とど}かぬ {言|こと}の{葉|は} の ため に 、 {海|うみ} の {岩|いわ} へ {一粒|ひとつぶ} の {種|たね} を {託|たく}した 、 と {伝|つた}えられて いる 。', 'The keepers have long recited a passage from the Kokinshū\'s preface: "Japanese poetry took the human heart as its seed, and became the myriad leaves of words." It is handed down that the first keeper entrusted one seed to the rock in the sea, for the leaves of words that never arrive.'),
      { gloss: T('（{本当|ほんとう} に ある {古典|こてん} ： 『{古今和歌集|こきんわかしゅう}』 の {仮名序|かなじょ} 、 905 {年|ねん} ） {和歌|わか} は 、 {人|ひと} の {心|こころ} を {種|たね} に して 、 たくさん の {言葉|ことば} に なった 。', 'In today\'s Japanese (a real text: the Kokinshū\'s preface, 905)') }),
  };
  const NAMI = {
    F: T('この しま は 、 むかし うみ を ながれて いた 。 なくした ことば を おいかけて 。 さいしょ の はもり が 、 ふね の つな を き に むすんだ 。 それ から 、 しま は ここ に いる 。', 'This island once drifted over the sea, chasing lost words. The first keeper tied her boat\'s line to the tree. Since then the island has stayed here.'),
    E: T('{舟|ふね} の {人|ひと} たち は 「この {島|しま} は 、 {昔|むかし} {海|うみ} を {流|なが}れて いた 」 と {言|い}います 。 {最初|さいしょ} の {葉守|はもり} が {舟|ふね} の {綱|つな} を {木|き} に {結|むす}んだ から 、 {島|しま} は {止|と}まった そう です 。 だから {葉守|はもり} は 、 {葉|は} を {舟|ふね} で {返|かえ}しに {行|い}きます 。', 'The boat people say, "This island once drifted over the sea." It stopped, they say, because the first keeper tied her boat\'s line to the tree. That is why the keepers take the leaves home by boat.'),
    I: T('{船乗|ふなの}り の {間|あいだ} で は 、 {島|しま} は もともと {流|なが}れ{島|じま} だった と いう {話|はなし} だ 。 なくした {言葉|ことば} を {追|お}って {海|うみ} を {渡|わた}って いた が 、 {最初|さいしょ} の {葉守|はもり} が {舟|ふね} の {綱|つな} を {楠|くす} に {結|むす}んだ ので 、 ここ に {留|とど}まった と いう 。', 'Among the boat people, the story is that the island was a drifting island to begin with. It crossed the sea after lost words, but stayed here because the first keeper tied her boat\'s line to the camphor.'),
    A: T('{流|なが}れ{島|じま} は 、 {言葉|ことば} の {行|ゆ}く{末|すえ} を {追|お}って {波|なみ} に {漂|ただよ}う もの だった 。 {葉守|はもり} の {舟|ふな}{綱|づな} が {結|むす}ばれて より 、 {島|しま} は {動|うご}かず 、 {人|ひと} が {言葉|ことば} を {運|はこ}ぶ よう に なった の だ と いう 。', 'The drifting island once wandered the waves after the fate of words. Since the keeper\'s mooring line was tied, they say, the island has not moved, and people have carried the words instead.'),
  };
  const HAMAJI = {
    F: T('むかし 、 おおきな うみへび が 、 あらし の なか で ふなのり が さけんだ ことば を のみこんだ 。 さいしょ の はもり が 、 うみへび に ことば を はきださせた 。 うみへび は ねむった 。 この しま は 、 その せなか 。', 'Long ago, a great sea serpent swallowed the words sailors shouted in storms. The first keeper made it spit them out. The serpent fell asleep. This island is its back.'),
    E: T('ハマジ さん は 「{昔|むかし} 、 {大|おお}きな {海蛇|うみへび} が 、 {嵐|あらし} の {中|なか} で {船乗|ふなの}り が {叫|さけ}んだ {言葉|ことば} を {飲|の}み{込|こ}んだ 」 と {言|い}いました 。 {最初|さいしょ} の {葉守|はもり} が それ を {吐|は}き{出|だ}させて 、 {海蛇|うみへび} は {眠|ねむ}りました 。 その {背中|せなか} が 、 この {島|しま} だ そう です 。', 'Hamaji said, "Long ago, a great sea serpent swallowed the words sailors shouted in storms." The first keeper made it spit them out, and the serpent went to sleep. This island, he says, is its back.'),
    I: T('ハマジ さん に よると 、 この {島|しま} は {眠|ねむ}って いる {海蛇|うみへび} の {背中|せなか} だ と いう {話|はなし} だ 。 {嵐|あらし} で {船乗|ふなの}り が {叫|さけ}んだ {言葉|ことば} を {飲|の}み{込|こ}んで いた が 、 {最初|さいしょ} の {葉守|はもり} に {叱|しか}られて {吐|は}き{出|だ}し 、 そのまま {眠|ねむ}った と いう 。 {楠|くす} は 、 その {背|せ} に {生|は}えた 。', 'According to Hamaji, the story is that this island is a sleeping sea serpent\'s back. It had swallowed the words sailors shouted in storms, but the first keeper scolded it into spitting them out, and it went to sleep where it was. The camphor grew on its back.'),
    A: T('{漁師|りょうし} たち の {語|かた}る ところ で は 、 {島|しま} は {眠|ねむ}れる {海蛇|うみへび} の {背|せ} に ほかならない 。 {嵐|あらし} に {呑|の}まれし {言葉|ことば} を {吐|は}き{出|だ}させた の は {最初|さいしょ} の {葉守|はもり} だ 、 と いう の が {彼|かれ}ら の {言|い}い{分|ぶん} だ 。 {子供|こども} を {海|うみ} から {遠|とお}ざける ため の {話|はなし} か 、 それとも …… 。', 'As the fishers tell it, the island is nothing other than a sleeping serpent\'s back. It was the first keeper who made it spit out the words the storms had swallowed: so they maintain. A tale to keep children away from the sea, or…'),
  };
  const SHELL = {
    F: T('ちとせ の こえ ： 「へんじ が こなくて も 、 かいた ことば は ほんとう だった 。」 いもうと の こえ ： 「ねえさん が うえた の は 、 みんな の ため 。」', 'Chitose\'s voice: "Even with no reply, what I wrote was true." Her sister\'s voice: "My sister planted it for everyone."'),
    E: T('{貝|かい} の {中|なか} で 、 チトセ と いう {人|ひと} が 「{返事|へんじ} が {来|こ}なくて も 、 {書|か}いた {言葉|ことば} は {本当|ほんとう} だった 」 と {言|い}って いました 。 {妹|いもうと} は {船頭|せんどう} に 「{姉|ねえ}さん が {植|う}えた の は 、 みんな の ため 」 と {言|い}って いました 。', 'In the shells, someone called Chitose was saying, "Even with no reply, what I wrote was true." Her younger sister was telling the boatman, "My sister planted it for everyone."'),
    I: T('{法螺貝|ほらがい} の {声|こえ} に よると 、 {最初|さいしょ} の {葉守|はもり} は チトセ と いう {名|な} で 、 {返事|へんじ} の {来|こ}ない {相手|あいて} に {手紙|てがみ} を {書|か}いて いた 。 {楠|くす} を {植|う}えた の は 、 {自分|じぶん} の {手紙|てがみ} の ため だけ で は なく 、 {届|とど}かない {言葉|ことば} {全部|ぜんぶ} の ため だった と いう 。', 'According to the voices in the conches, the first keeper was named Chitose, and wrote letters to someone who never replied. She planted the camphor not only for her own letters, they say, but for every word that doesn\'t arrive.'),
    A: T('{貝|かい} が {覚|おぼ}えて いた の は 、 {伝説|でんせつ} で は なく 、 {人|ひと} の {声|こえ} そのもの だ 。 チトセ は {答|こた}え の ない {手紙|てがみ} を {書|か}き{続|つづ}け 、 それ でも {書|か}いた {言葉|ことば} に {偽|いつわ}り は なかった と {語|かた}る 。 {楠|くす} は 、 {彼女|かのじょ} {一人|ひとり} の {心残|こころのこ}り で は なく 、 {届|とど}かぬ {言葉|ことば} すべて の {休|やす}み{場所|ばしょ} と して {植|う}えられた 。', 'What the shells kept is not a legend but the voices themselves. Chitose wrote on and on to someone who never answered, and says even so there was nothing false in what she wrote. The camphor was planted not for her one regret, but as a resting place for every word that never arrives.'),
  };

  C.tellings['ko.t_hall'] = {
    id: 'ko.t_hall', title: T('{島|しま} の {言|い}い{伝|つた}え', 'The island\'s legend'),
    question: T('{館|やかた} の {三|みっ}つ の {板|いた} に 、 どの {話|はなし} を {並|なら}べます か 。', 'Three panels in the hall: which telling does each one show?'),
    sources: [
      { id: 'otoha', kind: 'telling', who: T('オトハ （{葉守|はもり}）', 'Otoha, for the keepers'), read: 'ko.read_otoha', text: OTOHA,
        claims: [
          { id: 'o_planted', jp: '{最初|さいしょ} の {葉守|はもり} が {楠|くす} を {植|う}えた', en: 'The first keeper planted the camphor', vouch: true, why: no('Every telling agrees on this, and so do the shells: as a tradition, the keepers can hand it down.') },
          { id: 'o_always', jp: '{岩|いわ} は {昔|むかし} から ここ に あった', en: 'The rock was always here', vouch: false, why: no('Nobody alive saw the island before the tree: a telling can hand this down, not vouch for it.') },
        ] },
      { id: 'nami', kind: 'telling', who: T('ナミ （{舟|ふね} の {葉守|はもり}）', 'Nami, for the boat-keepers'), read: 'ko.read_nami', text: NAMI,
        claims: [
          { id: 'n_drift', jp: '{島|しま} は {昔|むかし} {流|なが}れて いた', en: 'The island once drifted', vouch: false, why: no('A boat people\'s story: told, not seen. It is the reason they give for their work, not a record of it.') },
          { id: 'n_rows', jp: '{葉守|はもり} は {葉|は} を {舟|ふね} で {返|かえ}しに {行|い}く', en: 'The keepers take leaves home by boat', vouch: true, why: no('Nami does it herself: she crossed to Saltglass to fetch you.') },
        ] },
      { id: 'hamaji', kind: 'telling', who: T('ハマジ （{漁師|りょうし}）', 'Hamaji, for the fishers'), read: 'ko.read_hamaji', text: HAMAJI,
        claims: [
          { id: 'h_serpent', jp: '{島|しま} は {眠|ねむ}る {海蛇|うみへび} の {背中|せなか} だ', en: 'The island is a sleeping serpent\'s back', vouch: false, why: no('A fishers\' tale, and Hamaji half says himself it is for keeping children out of the sea.') },
          { id: 'h_storms', jp: '{嵐|あらし} の {後|あと} に は 、 {叫|さけ}んだ {言葉|ことば} の {葉|は} が {来|く}る', en: 'After storms, leaves of shouted words come in', vouch: true, why: no('Hamaji has gathered them himself, sixty years of storms: that is what he saw.') },
        ] },
      { id: 'shell', kind: 'shell', who: T('{法螺貝|ほらがい} の {声|こえ}', 'The voices in the conches'), read: 'ko.read_shell', text: SHELL,
        claims: [
          { id: 's_name', jp: '{最初|さいしょ} の {葉守|はもり} の {名|な} は チトセ', en: 'The first keeper\'s name was Chitose', vouch: true, why: no('Her sister calls her by name, and she answers: the shells kept the words as they were said.') },
          { id: 's_answered', jp: 'チトセ の {手紙|てがみ} に は 、 {最後|さいご} に {返事|へんじ} が {来|き}た', en: 'Chitose\'s letters were answered in the end', vouch: false, why: no('Nothing in the shells says so: she says even with no reply, what she wrote was true.') },
        ] },
    ],
    answer: { kind: 'panels', panels: [
      { id: 'p1', jp: '{木|き} の {始|はじ}まり', en: 'How the tree began', picks: [
        { source: 'otoha', jp: '{最初|さいしょ} の {葉守|はもり} が 、 {届|とど}かない {言葉|ことば} の ため に {植|う}えた', en: 'The first keeper planted it for words that never arrive', why: no('The keepers\' own telling: visitors will see the island the way its keepers do.') },
        { source: 'hamaji', jp: '{眠|ねむ}る {海蛇|うみへび} の {背中|せなか} に {生|は}えた', en: 'It grew on a sleeping serpent\'s back', why: no('The fishers\' story: the children will love it, and nobody will take it for a record.') },
        { source: 'shell', jp: 'チトセ が 、 {自分|じぶん} と みんな の {手紙|てがみ} の ため に {植|う}えた', en: 'Chitose planted it, for her letters and everyone\'s', why: no('The voices in the shells: the nearest to what was really said, and it gives the first keeper her name back.') },
      ] },
      { id: 'p2', jp: '{島|しま} の {始|はじ}まり', en: 'How the island came to be here', picks: [
        { source: 'otoha', jp: '{岩|いわ} は 、 {昔|むかし} から ここ に あった', en: 'The rock was always here', why: no('Plain and modest: it claims no more than anyone can see now.') },
        { source: 'nami', jp: '{流|なが}れ{島|じま} が 、 {舟|ふね} の {綱|つな} で {留|とど}まった', en: 'A drifting island, held by a mooring line', why: no('The boat-keepers\' story: it explains why the keepers row the leaves home.') },
        { source: 'hamaji', jp: '{海蛇|うみへび} が {眠|ねむ}って 、 {島|しま} に なった', en: 'A serpent fell asleep and became the island', why: no('The fishers\' story again: a good scare for anyone who swims out too far.') },
      ] },
      { id: 'p3', jp: '{葉守|はもり} の {約束|やくそく}', en: 'What the keepers promise', picks: [
        { source: 'otoha', jp: '{葉|は} は 、 {一枚|いちまい} {残|のこ}らず {元|もと} の {場所|ばしょ} へ {返|かえ}す', en: 'Every leaf goes home', why: no('The keepers\' rule as Otoha keeps it: generous, and a little impossible.') },
        { source: 'nami', jp: 'どんな に {遠|とお}くて も 、 {舟|ふね} で {届|とど}ける', en: 'However far, the boats will take them', why: no('The rule as Nami lives it: work, not wishes.') },
        { source: 'shell', jp: '{書|か}いた {人|ひと} だけ の {言葉|ことば} も ある', en: 'Some words belong only to the one who wrote them', why: no('Chitose\'s own words: not every leaf should go home. The keepers have never hung that on a wall before.') },
      ] },
    ] },
  };

  // ---- the shells: who said what, to whom --------------------------------------------------------------------------
  C.shells['ko.s_first'] = {
    id: 'ko.s_first', title: T('{法螺貝|ほらがい} の {声|こえ}', 'The voices in the conches'),
    question: T('{三|みっ}つ の {貝|かい} に 、 {昔|むかし} の {夜|よる} の {言葉|ことば} が {六|むっ}つ 。 {誰|だれ} が 、 {誰|だれ} に {言|い}った の でしょう 。', 'Three conches, six things said one night long ago. Who said each, and to whom?'),
    people: [
      { id: 'chitose', jp: 'チトセ', en: 'Chitose (the first keeper)' },
      { id: 'yoshi', jp: 'ヨシ', en: 'Yoshi (her younger sister)' },
      { id: 'sendo', jp: '{船頭|せんどう}', en: 'the old boatman' },
      { id: 'ano', jp: 'あの {人|ひと}', en: 'the one she wrote to (far away)' },
    ],
    read: 'ko.shells_read',
    frags: [
      { id: 'a1', shell: 'a', who: 'yoshi', to: 'chitose',
        text: { F: T('へんじ は 、 まだ こない の ？', 'Still no reply?'), E: T('{返事|へんじ} は 、 まだ {来|こ}ない の ？', 'Still no reply?'), A: T('{返事|へんじ} は 、 まだ {来|こ}ない の ？ もう {何年|なんねん} に なる の よ 。', 'Still no reply? How many years has it been?') },
        cue: no('Someone close asks after "the reply" in plain speech (の？). The one waiting for a reply is Chitose, and only family talks to her this plainly.'),
        comic: no('From the old boatman to Chitose, it would sound as if he had been waiting for a love letter from her.') },
      { id: 'a2', shell: 'a', who: 'chitose', to: 'yoshi',
        text: { F: T('こない わ 。 ふね が でなく なって から 、 いっつう も 。', 'No. Not one, since the boats stopped.'), E: T('{来|こ}ない わ 。 {船|ふね} が {出|で}なく なって から 、 {一通|いっつう} も 。', 'No. Not one, since the boats stopped.') },
        cue: no('It answers the question about the reply, in the same plain words: Chitose, to her sister.'),
        comic: no('From the boatman, it would be a ferryman grumbling about the post he no longer carries.') },
      { id: 'b1', shell: 'b', who: 'sendo', to: 'chitose',
        text: { F: T('おじょうさん 、 この たね を どこ に うえる ん だい 。', 'Young lady, where are you planting this seed?'), E: T('お{嬢|じょう}さん 、 この {種|たね} を どこ に {植|う}える ん だい 。', 'Young lady, where are you planting this seed?') },
        cue: no('お嬢さん is how an older man speaks to a young woman he hardly knows, and だい ends an old man\'s question. The one with the seed is Chitose.'),
        comic: no('If Yoshi called her own sister お嬢さん, Chitose would think she had hit her head.') },
      { id: 'b2', shell: 'b', who: 'chitose', to: 'sendo',
        text: { F: T('うみ の まんなか の いわ に 。 とどかない ことば が 、 やすめる ところ が ほしい の 。', 'On the rock in the middle of the sea. I want somewhere for words that don\'t arrive to rest.'), E: T('{海|うみ} の {真|ま}ん{中|なか} の {岩|いわ} に 。 {届|とど}かない {言葉|ことば} が 、 {休|やす}める {所|ところ} が ほしい の 。', 'On the rock in the middle of the sea. I want somewhere for words that don\'t arrive to rest.') },
        cue: no('It answers "where are you planting it": Chitose, to the boatman who will row her there.'),
        comic: no('Said to her sister, it would be a very poetic way to ask for a lift.') },
      { id: 'c1', shell: 'c', who: 'yoshi', to: 'sendo',
        text: { F: T('ねえさん が うえた の は 、 じぶん の てがみ の ため じゃ ない 。 みんな の ため よ 。', 'My sister didn\'t plant it for her own letters. She planted it for everyone\'s.'), E: T('{姉|ねえ}さん が {植|う}えた の は 、 {自分|じぶん} の {手紙|てがみ} の ため じゃ ない 。 みんな の ため よ 。', 'My sister didn\'t plant it for her own letters. She planted it for everyone\'s.') },
        cue: no('姉さん: the speaker is the younger sister, explaining Chitose to someone else: the boatman, who asked where, and now hears why.'),
        comic: no('Said by Chitose about herself, it would be the least modest thing ever said on this island.') },
      { id: 'c2', shell: 'c', who: 'chitose', to: 'ano',
        text: { F: T('…… へんじ が こなくて も 、 かいた ことば は ほんとう だった 。', '…Even with no reply, what I wrote was true.'), E: T('…… {返事|へんじ} が {来|こ}なくて も 、 {書|か}いた {言葉|ことば} は {本当|ほんとう} だった 。', '…Even with no reply, what I wrote was true.') },
        cue: no('Spoken about her own letters, and to no one in the room: to the one who never answered, far away.'),
        comic: no('Said to the boatman, it would be a strange thing to tell a man you have only asked for a ride.') },
    ],
  };

  // ---- the reading tasks (each asks about the same text, at the profile's tier) ---------------------------------------
  C.challenges['ko.read_otoha'] = { title: T('オトハ の {話|はなし}', 'Otoha\'s telling'), tiers: {
    F: [ch({ item: 'v:種', prompt: { en: 'In Otoha\'s telling, what did the woman plant?' }, options: [o('くす の たね', 1), o('はな の たね', 0, 'She planted a camphor (くす) seed.'), o('てがみ', 0, 'Letters are why she planted it; what she planted was a seed.')] })],
    E: [ch({ item: 'g:ko_to_iimashita', prompt: { en: 'What did the first keeper say, by Otoha\'s telling?' }, options: [o('「{届|とど}かない {言葉|ことば} が 、 {休|やす}める よう に 」', 1), o('「{島|しま} が {流|なが}れない よう に 」', 0, 'That is closer to Nami\'s telling.'), o('「{海蛇|うみへび} が {眠|ねむ}る よう に 」', 0, 'That is Hamaji\'s serpent.')] })],
    I: [ch({ item: 'g:ko_to_iu_hanashi', prompt: { en: 'What does the story say (という話だ) she planted the tree for?' }, options: [o('{誰|だれ} の {言葉|ことば} で も {休|やす}める よう に', 1), o('{自分|じぶん} の {手紙|てがみ} の {返事|へんじ} を {待|ま}つ ため に', 0, 'She wrote unanswered letters, but the story says she planted it for anyone\'s words.'), o('{岩|いわ} を {隠|かく}す ため に', 0, 'Nothing in the telling says so.')] })],
    A: [ch({ item: 'g:ko_literary', prompt: { en: 'In the Kokinshū line, what becomes the "myriad leaves of words"? (classical, optional)' }, options: [o('{人|ひと} の {心|こころ}', 1), o('{楠|くす} の {種|たね}', 0, 'The seed is a metaphor: 人の心を種として, the heart is the seed.'), o('{海|うみ} の {岩|いわ}', 0, 'The rock is in Otoha\'s telling, not in the Kokinshū.')] })],
  } };
  C.challenges['ko.read_nami'] = { title: T('ナミ の {話|はなし}', 'Nami\'s telling'), tiers: {
    F: [ch({ item: 'v:流れる', prompt: { en: 'By Nami\'s telling, what did the island once do?' }, options: [o('うみ を ながれて いた', 1), o('うみ に しずんで いた', 0, 'ながれて いた: it drifted.'), o('そら を とんで いた', 0, 'ながれて いた: it drifted on the sea.')] })],
    E: [ch({ item: 'g:ko_to_iimashita', prompt: { en: 'What do the boat people say (と言います)?' }, options: [o('{島|しま} は {昔|むかし} {海|うみ} を {流|なが}れて いた', 1), o('{島|しま} は {海蛇|うみへび} の {背中|せなか} だ', 0, 'That is the fishers\' story.'), o('{島|しま} は {昔|むかし} から ここ に あった', 0, 'That is Otoha\'s telling.')] })],
    I: [ch({ item: 'g:ko_to_iu_hanashi', prompt: { en: 'Why, the story goes, did the island stay here?' }, options: [o('{最初|さいしょ} の {葉守|はもり} が {舟|ふね} の {綱|つな} を {楠|くす} に {結|むす}んだ から', 1), o('{海蛇|うみへび} が {眠|ねむ}った から', 0, 'That is Hamaji\'s telling.'), o('{言葉|ことば} が もう {流|なが}れ{着|つ}かなく なった から', 0, 'Words still wash up; the line held it.')] })],
    A: [ch({ item: 'v:漂う', prompt: { en: 'What changed once the mooring line was tied, by Nami\'s telling?' }, options: [o('{島|しま} は {動|うご}かず 、 {人|ひと} が {言葉|ことば} を {運|はこ}ぶ よう に なった', 1), o('{島|しま} は {言葉|ことば} を {追|お}う の を やめ 、 {言葉|ことば} を {忘|わす}れた', 0, 'The words are still carried: by people now.'), o('{波|なみ} が {止|や}んだ', 0, 'The waves go on; the island stopped drifting.')] })],
  } };
  C.challenges['ko.read_hamaji'] = { title: T('ハマジ の {話|はなし}', 'Hamaji\'s telling'), tiers: {
    F: [ch({ item: 'v:背中', prompt: { en: 'In Hamaji\'s story, what is the island?' }, options: [o('うみへび の せなか', 1), o('うみへび の あたま', 0, 'せなか: its back.'), o('ふね の うえ', 0, 'It is the sleeping serpent\'s back.')] })],
    E: [ch({ item: 'g:ko_to_iimashita', prompt: { en: 'What did Hamaji say the serpent swallowed?' }, options: [o('{嵐|あらし} の {中|なか} で {船乗|ふなの}り が {叫|さけ}んだ {言葉|ことば}', 1), o('{最初|さいしょ} の {葉守|はもり} の {手紙|てがみ}', 0, 'The keeper made it spit out the sailors\' words.'), o('{楠|くす} の {種|たね}', 0, 'The camphor grew on its back later.')] })],
    I: [ch({ item: 'g:kr_ni_yoruto', prompt: { en: 'According to Hamaji (によると), why did the serpent let the words go?' }, options: [o('{最初|さいしょ} の {葉守|はもり} に {叱|しか}られた から', 1), o('{嵐|あらし} が {止|や}んだ から', 0, 'The keeper scolded it.'), o('{眠|ねむ}く なった から', 0, 'It slept after spitting them out, not before.')] })],
    A: [ch({ item: 'g:ko_literary', prompt: { en: 'What does Hamaji\'s telling suggest the story may really be for?' }, options: [o('{子供|こども} を {海|うみ} から {遠|とお}ざける ため', 1), o('{海蛇|うみへび} を {探|さが}す ため', 0, 'The trailing それとも… leaves room, but the purpose it names is to keep children away from the sea.'), o('{漁|りょう} の {季節|きせつ} を {教|おし}える ため', 0, 'Nothing in it speaks of seasons.')] })],
  } };
  C.challenges['ko.read_shell'] = { title: T('{貝|かい} の {声|こえ}', 'The voices in the shells'), tiers: {
    F: [ch({ item: 'v:返事', prompt: { en: 'What did Chitose say about her letters?' }, options: [o('へんじ が こなくて も 、 ほんとう だった', 1), o('へんじ が きた', 0, 'へんじ が こなくて も: even with no reply.')] })],
    E: [ch({ item: 'g:ko_to_iimashita', prompt: { en: 'What was the younger sister telling the boatman?' }, options: [o('「{姉|ねえ}さん が {植|う}えた の は 、 みんな の ため 」', 1), o('「{返事|へんじ} は 、 まだ {来|こ}ない の ？」', 0, 'She asked her sister that, not the boatman.'), o('「{書|か}いた {言葉|ことば} は {本当|ほんとう} だった 」', 0, 'Chitose said that.')] })],
    I: [ch({ item: 'g:kr_ni_yoruto', prompt: { en: 'According to the voices in the conches, who was the first keeper?' }, options: [o('チトセ と いう {名|な} の 、 {返事|へんじ} の {来|こ}ない {手紙|てがみ} を {書|か}いて いた {人|ひと}', 1), o('{船頭|せんどう} の {娘|むすめ}', 0, 'The boatman calls her お嬢さん because she is young, not because she is his daughter.'), o('{返事|へんじ} を {書|か}かなかった {人|ひと}', 0, 'She was the one waiting for a reply.')] })],
    A: [ch({ item: 'g:ko_literary', prompt: { en: 'How does this source differ from the other three?' }, options: [o('{伝説|でんせつ} で は なく 、 {言|い}われた とおり の {人|ひと} の {声|こえ} だ', 1), o('{一番|いちばん} {新|あたら}しい {言|い}い{伝|つた}え だ', 0, 'It is the oldest: the voices themselves, from that night.'), o('{書|か}かれた {記録|きろく} だ', 0, 'It was never written down: the shells kept the sound.')] })],
  } };
  C.challenges['ko.shells_read'] = { title: T('{貝|かい} の {声|こえ} ・ {誰|だれ} が {誰|だれ} に', 'The shells: who to whom'), tiers: {
    F: [ch({ item: 'v:姉', prompt: { en: '"ねえさん が うえた の は …" Who is ねえさん?' }, options: [o('チトセ', 1), o('ヨシ', 0, 'ねえさん is said by the younger sister, Yoshi, about her elder sister.'), o('せんどう', 0, 'ねえさん is an elder sister.')] })],
    E: [ch({ item: 'g:ko_to_iimashita', prompt: { en: 'Report the first line of shell B: who said it to whom?' }, options: [o('{船頭|せんどう} が チトセ に 「お{嬢|じょう}さん 、 …」 と {言|い}いました 。', 1), o('チトセ が {船頭|せんどう} に 「お{嬢|じょう}さん 、 …」 と {言|い}いました 。', 0, 'お嬢さん is said TO a young woman, by an older man.'), o('ヨシ が チトセ に 「お{嬢|じょう}さん 、 …」 と {言|い}いました 。', 0, 'A sister wouldn\'t call her sister お嬢さん.')] })],
    I: [ch({ item: 'g:indirectness', prompt: { en: 'Shell C, second line: "…返事が来なくても、書いた言葉は本当だった." Who is she speaking to?' }, options: [o('{遠|とお}く に いる 、 {手紙|てがみ} の {相手|あいて}', 1), o('{船頭|せんどう}', 0, 'She speaks about her letters to no one in the room.'), o('{妹|いもうと}', 0, 'Her sister is speaking to the boatman just then.')] })],
    A: [ch({ item: 'g:indirectness', prompt: { en: 'What does Chitose\'s last line imply about why she planted the tree?' }, options: [o('{届|とど}かなくて も {言葉|ことば} に は {価値|かち} が ある と {信|しん}じて いた', 1), o('{返事|へんじ} を {諦|あきら}めて 、 {手紙|てがみ} を {捨|す}てたかった', 0, 'She says what she wrote was true: she kept it, she didn\'t throw it away.'), o('{返事|へんじ} が {来|く}る と {分|わ}かって いた', 0, 'Nothing says a reply came.')] })],
  } };
})(RB.content);
