/* The Keepers' Road, Chapter 7: the tellings the player weighs (expansion P10; rules src/engine/72k_tellings.js, sheet
 * src/ui/89k_tellings.js; plan 07_REGIONS.md R8, A49, A5). Three of them:
 *   kr.t_cave   the order the scriptorium cave's four lanterns are lit in: the ridge's stele, Hisae's memory, the
 *               children's rhyme, Kikyō's scroll. Only one order keeps everything the sources can vouch for.
 *   kr.t_cache  where the keepers kept their oil: the rhyme's second verse, the stele's last line, Kumazō's memory.
 *               Two readings hold (one saves a detour); one does not.
 *   kr.t_fox    how the Fox Bridge got its name (The Three Tellings): Kame's grandmother's story, the hamlet's register,
 *               the shrine's board. Several versions the hamlet could keep are honest; one is not.
 * Each source's text is given by profile: F in kana, E with narrative past and sequence words, I with comparing
 * sources (〜によると, 〜と伝えられている, 〜という), A with a classical line (〜べし, 〜なり) and its modern gloss,
 * labelled classical and never needed to go on. Each source has a reading task (`read`), its four tiers asked about
 * that same text, recorded as evidence like any other task. The keepers' rite is the game's own (fiction). */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const T = (jp, en) => ({ jp, en });
  const no = (en) => ({ en });
  C.tellings = C.tellings || {};

  // ---- the grammar this chapter teaches ------------------------------------------------------------------------------
  if (RB.grammar && RB.grammar.add) RB.grammar.add([
    { id: 'kr_ni_yoruto', lv: 'I', title: '～によると (according to)', pat: '{名詞|めいし} ＋ に よると',
      en: 'Noun + によると names where a piece of information comes from: "according to …". What follows is what that source says, often ending in そうだ or らしい. It does not say the speaker agrees: weighing it is up to you.',
      ex: [{ jp: '{天気|てんき}{予報|よほう} に よると 、 {明日|あした} は {雨|あめ} だ そう です 。', en: 'According to the forecast, it will rain tomorrow.' }, { jp: '{碑|ひ} に よると 、 {東|ひがし} の {灯|ひ} が {最初|さいしょ} だ 。', en: 'According to the stele, the east lantern comes first.' }] },
    { id: 'kr_to_iu', lv: 'I', title: '～という (called; that says)', pat: 'A ＋ と いう ＋ B',
      en: 'A という B: "a B called A", or "the B that says A". It names something, or gives the content of a story, a rule or a rumour: {狐橋|きつねばし} と いう {橋|はし} (a bridge called Fox Bridge), {狐|きつね} が {橋|はし} を {架|か}けた と いう {話|はなし} (the story that a fox built the bridge).',
      ex: [{ jp: '「しじま」 と いう {言葉|ことば} を {知|し}って います か 。', en: 'Do you know a word called "shijima"?' }, { jp: '{一晩|ひとばん} で {橋|はし} が できた と いう {話|はなし} が ある 。', en: 'There is a story that the bridge was made in one night.' }] },
    { id: 'kr_tsutaerareru', lv: 'I', title: '～と伝えられている (it is handed down that)', pat: '{普通形|ふつうけい} ＋ と {伝|つた}えられて いる',
      en: 'Plain form + と伝えられている: "it has been handed down that …, tradition says …". A passive of 伝える (to pass on): nobody alive saw it; it has come down through tellers. Put beside a record, it is the weaker witness for what happened, and the stronger one for what people believed.',
      ex: [{ jp: '{昔|むかし} 、 ここ に {大|おお}きな {寺|てら} が あった と {伝|つた}えられて いる 。', en: 'Tradition says there was once a great temple here.' }, { jp: '{見習|みなら}い は {最後|さいご} に {鐘|かね} を {鳴|な}らした と {伝|つた}えられて いる 。', en: 'It is handed down that the apprentice rang the bell last.' }] },
    { id: 'kr_classical', lv: 'A', title: '～べし ・ ～なり (classical: must; is)', pat: '{動詞|どうし} ＋ べし ／ {名詞|めいし} ＋ なり',
      en: 'Two classical forms still met on old stones and in set phrases. べし after a verb means "must, should" (today ～なければならない, ～べきだ); its negative is べからず, "must not". なり after a noun is the classical "is" (today だ or である). Optional reading: shown with a modern gloss, labelled classical, never needed to go on.',
      ex: [{ jp: '{灯|ひ} を {絶|た}やす べからず 。', en: 'The light must not be let go out. (classical)' }, { jp: 'この {道|みち} 、 {灯守|ひもり} の {道|みち} なり 。', en: 'This road is the keepers\' road. (classical)' }] },
  ], 'kr');

  // ---- the sources' texts (one place; the reading tasks below ask about the same text) -------------------------------
  const STELE = {
    F: T('いし に 、 こう {書|か}いて ある 。 「いちばん は ひがし 。 にばん は いずみ 。 さんばん は …… （よめない） 。 さいご は かね 。」', 'The stone says: "First, east. Second, spring. Third… (worn away). Last, the bell."'),
    E: T('{石|いし} に 、 「{最初|さいしょ} に {東|ひがし} の {灯|ひ} を {点|つ}けて 、 それから {泉|いずみ} の {灯|ひ} 。 …… 。 {最後|さいご} に {鐘|かね} の {灯|ひ} 。」 と {彫|ほ}って ある 。 {三|みっ}つ{目|め} は {読|よ}めない 。', 'Cut in the stone: "Light the east lantern first, and then the spring\'s. … Last, the bell\'s." The third is worn away.'),
    I: T('{碑|ひ} に よると 、 {東|ひがし} の {灯|ひ} を {最初|さいしょ} に {点|とも}す こと に なって いる 。 {次|つぎ} は {泉|いずみ} 。 {三|みっ}つ{目|め} の {字|じ} は {削|けず}れて {読|よ}めない が 、 {鐘|かね} の {灯|ひ} は {最後|さいご} だ 。', 'According to the stele, the east lantern is the one lit first. Next, the spring. The third is worn too smooth to read, but the bell\'s lantern is last.'),
    A: Object.assign(T('「{東|ひがし} の {灯|ひ} より {点|とも}す べし 。 {次|つぎ} に {泉|いずみ} 。 …… 。 {鐘|かね} の {灯|ひ} を {終|お}わり と す べし 。」 （{三|みっ}つ{目|め} は {削|けず}れて {読|よ}めない）', '"Begin with the east lantern. Next, the spring. … The bell\'s lantern shall be the last." (The third is worn away.)'),
      { gloss: T('{東|ひがし} の {灯|ひ} から {点|つ}けなければ ならない 。 {次|つぎ} に {泉|いずみ} 。 …… 。 {鐘|かね} の {灯|ひ} を {最後|さいご} に しなければ ならない 。', 'In today\'s Japanese') }),
  };
  const HISAE = {
    F: T('ヒサエ さん が いった 。 「いちばん は ひがし 。 よく おぼえて いる よ 。 かね は 、 なまえ の あと 。 かね が なったら 、 おわり だから ね 。 いずみ は …… わすれた 。」', 'Hisae said: "East was first. I remember that well. The bell came after the name: when the bell has rung, it\'s over. The spring… I forget."'),
    E: T('ヒサエ さん は 「{最初|さいしょ} は {東|ひがし} でした 。 よく {覚|おぼ}えて います 。 {鐘|かね} は {名|な} の {灯|ひ} の {後|あと} でした 。 {鐘|かね} が {鳴|な}ったら 、 {終|お}わり です から 。 {泉|いずみ} は …… {忘|わす}れました 。」 と {言|い}いました 。', 'Hisae said: "East was first. I remember that well. The bell came after the name lantern: once the bell has rung, it\'s over. The spring… I\'ve forgotten."'),
    I: T('ヒサエ さん の {話|はなし} に よると 、 {最初|さいしょ} は {東|ひがし} の {灯|ひ} だった 。 {名|な} の {灯|ひ} の {後|あと} で {鐘|かね} を {鳴|な}らす こと に なって いた 。 {鐘|かね} が {鳴|な}れば 、 {終|お}わり だ から だ 。 {泉|いずみ} が {何番目|なんばんめ} だった か は 、 {覚|おぼ}えて いない そう だ 。', 'By Hisae\'s account, the east lantern was first. The bell was rung after the name lantern, because once it rings, it is over. Where the spring came, she says she doesn\'t remember.'),
    A: T('{七十年|ななじゅうねん} {前|まえ} の {記憶|きおく} だ が 、 {東|ひがし} が {最初|さいしょ} だった こと 、 {鐘|かね} が {名|な} の {後|あと} だった こと は {確|たし}か だ と いう 。 {泉|いずみ} の {順番|じゅんばん} に ついて は 、 {本人|ほんにん} も {自信|じしん} が ない 。', 'A memory seventy years old, but she is certain the east came first and the bell after the name. About the spring\'s place she is not sure herself.'),
  };
  const RHYME = {
    F: T('{子供|こども} の うた 。 「ひがし の ひ 、 いずみ の ひ 、 かね が なったら 、 なまえ の ひ 。」', 'A children\'s song: "East\'s light, spring\'s light; when the bell has rung, the name\'s light."'),
    E: T('{子供|こども} たち の {歌|うた} 。 「ひがし の ひ 、 いずみ の ひ 、 かね が なったら 、 なまえ の ひ 。」 {歌|うた} の {最後|さいご} は 「なまえ」 で 、 よく {響|ひび}く 。', 'The children\'s song: "East\'s light, spring\'s light; when the bell has rung, the name\'s light." It ends on なまえ, which rings out well.'),
    I: T('{里|さと} の {子供|こども} たち が {歌|うた}う {数|かぞ}え{歌|うた} 。 「ひがし の ひ 、 いずみ の ひ 、 かね が なったら 、 なまえ の ひ 。」 {歌|うた} は 、 {調子|ちょうし} の いい よう に {言葉|ことば} の {順|じゅん} が {変|か}わる こと が ある 。', 'The hamlet children\'s counting song: "East\'s light, spring\'s light; when the bell has rung, the name\'s light." Songs sometimes shift their words to fit the tune.'),
    A: T('{数|かぞ}え{歌|うた} は {四|よっ}つ の {灯|ひ} を {全部|ぜんぶ} {歌|うた}う が 、 {順番|じゅんばん} は {節|ふし} に {合|あ}わせて {入|い}れ{替|か}わって いる {可能性|かのうせい} が ある 。 「かね が なったら」 の {一節|いっせつ} は 、 {後|あと} から {付|つ}いた らしい 。', 'The counting song names all four lights, but their order may have been swapped to suit the melody. The line "when the bell has rung" seems a later addition.'),
  };
  const SCROLL = {
    F: T('えまき の え 。 1 みならい が ひがし の ひ を つける 。 2 いずみ の ひ 。 3 なまえ の ひ 。 4 かね が なる 。 きつね が みて いる 。', 'The scroll\'s pictures: 1, an apprentice lights the east lantern. 2, the spring\'s. 3, the name\'s. 4, the bell rings. A fox is watching.'),
    E: T('{絵巻|えまき} に は 、 {見習|みなら}い が {東|ひがし} の {灯|ひ} を {点|つ}けて 、 それから {泉|いずみ} の {灯|ひ} 、 {名|な} の {灯|ひ} を {点|つ}けて 、 {最後|さいご} に {鐘|かね} を {鳴|な}らす {絵|え} が ある 。 {狐|きつね} も {見|み}て います 。', 'The scroll shows an apprentice lighting the east lantern, then the spring\'s and the name\'s, and last ringing the bell. A fox is watching too.'),
    I: T('{絵巻|えまき} に よると 、 {見習|みなら}い は {東|ひがし} 、 {泉|いずみ} 、 {名|な} の {順|じゅん} に {灯|ひ} を {点|とも}し 、 {最後|さいご} に {鐘|かね} を {鳴|な}らした と {伝|つた}えられて いる 。 {狐|きつね} は 、 {絵解|えと}き が {足|た}した もの らしい 。', 'According to the scroll, it is handed down that the apprentice lit the east, the spring and the name lanterns in that order, and rang the bell last. The fox seems to be the tellers\' own addition.'),
    A: T('キキョウ さん の {語|かた}り で は 、 {順番|じゅんばん} は {東|ひがし} 、 {泉|いずみ} 、 {名|な} 、 {鐘|かね} 。 ただし 、 「{狐|きつね} が {見守|みまも}って いた」 と いう の は {語|かた}り{手|て} の {付|つ}け{足|た}し だ と 、 {本人|ほんにん} が {言|い}う 。', 'In Kikyō\'s telling the order is east, spring, name, bell. But "a fox was watching over them" is, she says herself, a teller\'s addition.'),
  };
  // the oil cache
  const RHYME2 = {
    F: T('うた の つづき 。 「おね の みち 、 とうろう みっつ 、 みっつめ の した に 、 あぶら が ねむる 。」', 'The song goes on: "Along the ridge road, lanterns three; under the third the oil sleeps."'),
    E: T('{歌|うた} の {続|つづ}き 。 「おね の みち 、 とうろう みっつ 、 みっつめ の した に 、 あぶら が ねむる 。」 どこ から {数|かぞ}える か は 、 {歌|うた} に ない 。', 'The song goes on: "Along the ridge road, lanterns three; under the third the oil sleeps." Where to count from, the song doesn\'t say.'),
    I: T('{数|かぞ}え{歌|うた} の {二番|にばん} 。 「おね の みち 、 とうろう みっつ 、 みっつめ の した に 、 あぶら が ねむる 。」 {灯籠|とうろう} の {下|した} に {油|あぶら} が ある と いう {言葉|ことば} は ある が 、 どちら の {端|はし} から {数|かぞ}える か は 、 {歌|うた} から は {分|わ}からない 。', 'The song\'s second verse: "Along the ridge road, lanterns three; under the third the oil sleeps." It says the oil is under a lantern; which end to count from, the song can\'t tell you.'),
    A: T('{歌|うた} の {二番|にばん} は 、 {油|あぶら} が {灯籠|とうろう} の {下|した} に ある と {歌|うた}う 。 「みっつめ」 は {数|かぞ}え{歌|うた} の {決|き}まり{文句|もんく} で 、 {実際|じっさい} の {数|かず} と は {限|かぎ}らない 。', 'The second verse sings that the oil lies under a lantern. "The third" is a counting song\'s stock phrase, and need not be the real count.'),
  };
  const STELE2 = {
    F: T('いし の さいご の ぎょう 。 「あぶら は 、 くだりみち の とうろう の した 。」', 'The stone\'s last line: "The oil: under the lantern on the way down."'),
    E: T('{碑|ひ} の {最後|さいご} の {行|ぎょう} に 、 「{油|あぶら} は {下|くだ}り{道|みち} の {灯籠|とうろう} の {下|した} に {置|お}く 。」 と {彫|ほ}って ある 。', 'The stele\'s last line reads: "The oil is kept under the lantern on the way down."'),
    I: T('{碑|ひ} の {最後|さいご} の {行|ぎょう} に よると 、 {油|あぶら} は {下|くだ}り{道|みち} の {灯籠|とうろう} の {下|した} に {置|お}く こと に なって いた 。', 'According to the stele\'s last line, the oil was to be kept under the lantern on the way down.'),
    A: Object.assign(T('「{油|あぶら} は {下|くだ}り{道|みち} の {灯籠|とうろう} の {下|もと} に {置|お}く べし 。」', '"Oil shall be set beneath the lantern on the way down."'),
      { gloss: T('{油|あぶら} は {下|くだ}り{道|みち} の {灯籠|とうろう} の {下|した} に {置|お}かなければ ならない 。', 'In today\'s Japanese') }),
  };
  const KUMAZO = {
    F: T('クマゾウ さん が いった 。 「むかし 、 ひもり が 、 おね の ちいさい みち を おりて いった 。 かめ を もって 。 その さき は …… しらない 。」', 'Kumazō said: "Long ago, keepers went down the little path off the ridge, carrying jars. Where to… I don\'t know."'),
    E: T('クマゾウ さん は 「{子供|こども} の とき 、 {灯守|ひもり} が {尾根|おね} の {小道|こみち} を {下|お}りて いく の を {見|み}ました 。 かめ を {持|も}って いました 。 {小屋|こや} が あった と {思|おも}います が 、 よく {分|わ}かりません 。」 と {言|い}いました 。', 'Kumazō said: "When I was a boy I saw keepers go down the little path off the ridge. They were carrying jars. I think there was a hut, but I\'m not sure."'),
    I: T('クマゾウ さん に よると 、 {子供|こども} の ころ 、 {灯守|ひもり} が かめ を {持|も}って {尾根|おね} の {小道|こみち} を {下|お}りて いく の を {見|み}た そう だ 。 {小屋|こや} が あった か どう か は 、 はっきり しない と いう 。', 'According to Kumazō, as a boy he saw keepers carrying jars down the little path off the ridge. Whether there was a hut, he says he isn\'t clear.'),
    A: T('クマゾウ さん が {自分|じぶん} の {目|め} で {見|み}た の は 、 {灯守|ひもり} が かめ を {抱|かか}えて {小道|こみち} を {下|お}りる {姿|すがた} だけ だ 。 「{小屋|こや}」 は 、 {後|あと} で {誰|だれ} か から {聞|き}いた {話|はなし} かも しれない と 、 {本人|ほんにん} も {認|みと}めて いる 。', 'What Kumazō saw with his own eyes was only keepers carrying jars down the little path. The "hut", he admits himself, may be something he heard from someone later.'),
  };
  // the Fox Bridge
  const KAME = {
    F: T('カメ さん の はなし 。 「むかし 、 きつね が ひとばん で はし を かけた 。 たすけて もらった おれい に 。 おばあさん から きいた よ 。」', 'Kame\'s story: "Long ago a fox built the bridge in one night, to repay a kindness. I heard it from my grandmother."'),
    E: T('カメ さん は 「{昔|むかし} 、 {狐|きつね} が {一晩|ひとばん} で {橋|はし} を {架|か}けました 。 {助|たす}けて もらった お{礼|れい} です 。 おばあさん が いつも {話|はな}して くれました 。」 と {言|い}いました 。', 'Kame said: "Long ago a fox built the bridge in a single night, as thanks for being helped. My grandmother always told it."'),
    I: T('カメ さん の {家|いえ} で は 、 {狐|きつね} が {一晩|ひとばん} で {橋|はし} を {架|か}けた と {伝|つた}えられて いる 。 {助|たす}けて もらった {礼|れい} だった と いう 。 カメ さん は 、 おばあさん から {何度|なんど} も {聞|き}いた そう だ 。', 'In Kame\'s family it is handed down that a fox built the bridge in one night, as thanks for being helped. Kame says she heard it from her grandmother many times.'),
    A: T('カメ さん が {確|たし}か に {覚|おぼ}えて いる の は 、 おばあさん の {語|かた}り {口|くち} だ 。 {狐|きつね} が {橋|はし} を {架|か}けた と いう {出来事|できごと} そのもの を 、 {誰|だれ} か が {見|み}た わけ で は ない 。', 'What Kame truly remembers is her grandmother\'s way of telling it. Nobody saw a fox build a bridge.'),
  };
  const RECORD = {
    F: T('さと の きろく 。 「ひもり が 、 はし の そば の とうろう を きつねいろ に ぬった 。 それで 、 きつねばし と よんだ 。」', 'The hamlet\'s register: "A keeper painted the lantern by the bridge fox-colour. So it was called Fox Bridge."'),
    E: T('{里|さと} の {記録|きろく} に 、 「{灯守|ひもり} が {橋|はし} の そば の {灯籠|とうろう} を {狐色|きつねいろ} に {塗|ぬ}った 。 それで 「{狐橋|きつねばし}」 と {呼|よ}んだ 。」 と {書|か}いて ある 。', 'The hamlet\'s register says: "A keeper painted the lantern by the bridge fox-colour, and so called it Fox Bridge."'),
    I: T('{里|さと} の {記録|きろく} に よると 、 {橋|はし} の そば の {灯籠|とうろう} を {狐色|きつねいろ} に {塗|ぬ}った {灯守|ひもり} が 、 {橋|はし} を 「{狐橋|きつねばし}」 と {名付|なづ}けた 。 {狐色|きつねいろ} と いう の は 、 {焼|や}けた パン の よう な {茶色|ちゃいろ} の こと だ 。', 'According to the register, a keeper who painted the lantern by the bridge fox-colour named it Fox Bridge. Fox-colour (狐色) means a golden brown, like toasted bread.'),
    A: T('{記録|きろく} は {橋|はし} が できた {年|とし} に {書|か}かれた もの で 、 {名付|なづ}けた {灯守|ひもり} の {名前|なまえ} も {残|のこ}って いる 。 {狐|きつね} が {出|で}て くる の は 、 {灯籠|とうろう} の {色|いろ} の {話|はなし} だけ だ 。', 'The register was written the year the bridge was built, and keeps the name of the keeper who named it. The only fox in it is the lantern\'s colour.'),
  };
  const BOARD = {
    F: T('ほこら の いた 。 「この ほこら は 、 はし を まもる きつね を まつる 。」', 'The shrine\'s board: "This shrine honours the fox that guards the bridge."'),
    E: T('{祠|ほこら} の {板|いた} に 、 「この {祠|ほこら} は 、 {橋|はし} を {守|まも}る {狐|きつね} を まつって います 。」 と {書|か}いて ある 。', 'On the shrine\'s board: "This shrine honours the fox that guards the bridge."'),
    I: T('{祠|ほこら} の {板|いた} に よると 、 この {祠|ほこら} は {橋|はし} を {守|まも}る {狐|きつね} を まつる もの だ 。 いつ {建|た}てた か は {書|か}いて いない 。', 'According to the shrine\'s board, the shrine honours the fox that guards the bridge. When it was built, the board doesn\'t say.'),
    A: T('{板|いた} は {新|あたら}しく 、 {祠|ほこら} が {何|なに} を まつる か を {伝|つた}えて いる 。 {橋|はし} が どう して できた か に は 、 {何|なに} も {触|ふ}れて いない 。', 'The board is new, and tells what the shrine honours. It says nothing about how the bridge came to be.'),
  };

  // ---- the reading tasks: one per source, its four tiers about the same text ----------------------------------------
  const o = (jp, en, ok, why) => Object.assign({ ok: !!ok }, jp ? { jp } : {}, en ? { en } : {}, why ? { why: no(why) } : {});
  function readTask(id, title, text, item, q) {
    const tiers = {};
    for (const k of ['F', 'E', 'I', 'A']) {
      const [prompt, opts] = q[k];
      tiers[k] = [{ kind: 'choose', item: q.items ? q.items[k] : item, ctx: { jp: text[k].jp, en: '' }, prompt: { en: prompt }, options: opts }];
    }
    C.challenges[id] = { title, tiers };
  }
  readTask('kr.read_stele', T('{碑|ひ} を {読|よ}む', 'Reading the stele'), STELE, 'v:最後', {
    items: { F: 'v:最後', E: 'v:最初', I: 'g:kr_ni_yoruto', A: 'g:kr_classical' },
    F: ['Which lantern is last?', [o('かね', 'the bell', 1), o('ひがし', 'the east', 0, 'East is first: いちばん.'), o('いずみ', 'the spring', 0, 'The spring is second: にばん.')]],
    E: ['What can\'t be read on the stone?', [o('', 'Which lantern comes third', 1), o('', 'Which lantern comes first', 0, '最初 に 東: the east is first, plainly cut.'), o('', 'Which lantern comes last', 0, '最後 に 鐘: the bell is last.')]],
    I: ['According to the stele, what is the rule?', [o('', 'The east lantern is lit first and the bell\'s last', 1), o('', 'The bell is lit third', 0, 'The third is worn away: 読めない.'), o('', 'Any order will do', 0, 'こと に なって いる: there is a fixed custom.')]],
    A: ['What does べし add to 点す and to 終わりとす?', [o('', 'An obligation: it must be done so (today ～なければならない)', 1), o('', 'A guess: it probably happened so', 0, 'That would be だろう or らしい; べし is "must, shall".'), o('', 'A past tense: it was done so', 0, 'The past would be き or けり in classical Japanese; べし is "must".')]],
  });
  readTask('kr.read_hisae', T('ヒサエ の {話|はなし}', 'What Hisae remembers'), HISAE, 'v:覚える', {
    items: { F: 'v:覚える', E: 'v:後', I: 'g:sou_hear', A: 'v:記憶' },
    F: ['What does Hisae forget?', [o('いずみ', 'the spring', 1), o('ひがし', 'the east', 0, 'よく おぼえて いる: she remembers east well.'), o('かね', 'the bell', 0, 'かね は なまえ の あと: she remembers the bell.')]],
    E: ['Why does the bell come after the name lantern?', [o('', 'Once the bell has rung, the rite is over', 1), o('', 'The bell is the brightest', 0, 'She says: 鐘 が 鳴ったら 、 終わり です から.'), o('', 'The name lantern is the oldest', 0, 'She gives her reason: when the bell rings, it is over.')]],
    I: ['What does 覚えていないそうだ tell you?', [o('', 'Hisae says she doesn\'t remember the spring\'s place (reported)', 1), o('', 'The writer doesn\'t remember', 0, 'そうだ after a plain form reports what someone else said.'), o('', 'Hisae looks as if she remembers', 0, 'That would be 覚えて いそう (looks); this is hearsay.')]],
    A: ['Which parts is Hisae sure of?', [o('', 'East first, and the bell after the name', 1), o('', 'All four places', 0, '泉 の 順番 に ついて は 、 本人 も 自信 が ない.'), o('', 'None of it: it was seventy years ago', 0, 'She is old, but she says two things are 確か.')]],
  });
  readTask('kr.read_rhyme', T('{数|かぞ}え{歌|うた}', 'The counting song'), RHYME, 'v:歌', {
    items: { F: 'v:歌', E: 'v:最後', I: 'v:変わる', A: 'v:可能性' },
    F: ['How many lights are in the song?', [o('よっつ', 'four', 1), o('みっつ', 'three', 0, 'ひがし 、 いずみ 、 かね 、 なまえ: four.'), o('いつつ', 'five', 0, 'Count them: ひがし 、 いずみ 、 かね 、 なまえ.')]],
    E: ['Which word ends the song?', [o('なまえ', 'name', 1), o('かね', 'bell', 0, '最後 は 「なまえ」.'), o('いずみ', 'spring', 0, '最後 は 「なまえ」.')]],
    I: ['What can happen to a song\'s words?', [o('', 'Their order can change to fit the tune', 1), o('', 'They are always in the true order', 0, '言葉 の 順 が 変わる こと が ある: the order can change.'), o('', 'They are written on stone', 0, 'It is sung, not carved.')]],
    A: ['What does 可能性がある claim?', [o('', 'Only that the order may have been changed', 1), o('', 'That the order was certainly changed', 0, '可能性 が ある is "may", not "did".'), o('', 'That the song is wrong about everything', 0, 'It names all four lights; only their order is in doubt.')]],
  });
  readTask('kr.read_scroll', T('{絵巻|えまき} を {読|よ}む', 'Reading the scroll'), SCROLL, 'v:絵巻', {
    items: { F: 'v:絵巻', E: 'v:最後', I: 'g:kr_tsutaerareru', A: 'g:kr_to_iu' },
    F: ['What is in picture 3?', [o('なまえ の ひ', 'the name lantern', 1), o('かね', 'the bell', 0, '4 is the bell.'), o('いずみ の ひ', 'the spring\'s lantern', 0, '2 is the spring.')]],
    E: ['What does the apprentice do last?', [o('', 'Rings the bell', 1), o('', 'Lights the east lantern', 0, 'That is first: 東 の 灯 を 点けて.'), o('', 'Feeds the fox', 0, 'The fox only watches.')]],
    I: ['What does と伝えられている tell you about the order?', [o('', 'It has come down through the tellers', 1), o('', 'The teller saw it herself', 0, '伝えられて いる: handed down, not witnessed.'), o('', 'It was written on the stele', 0, 'This is the scroll\'s tradition.')]],
    A: ['What does 「狐が見守っていた」というの refer to?', [o('', 'The detail that a fox was watching, which the teller added', 1), o('', 'The order of the lanterns', 0, 'と いう の picks up the quoted detail about the fox.'), o('', 'The bell', 0, 'と いう の picks up the quoted detail about the fox.')]],
  });
  readTask('kr.read_rhyme2', T('{歌|うた} の {続|つづ}き', 'The song\'s second verse'), RHYME2, 'v:油', {
    items: { F: 'v:油', E: 'v:数える', I: 'g:kr_to_iu', A: 'v:決まり文句' },
    F: ['Where does the oil sleep?', [o('とうろう の した', 'under a lantern', 1), o('はし の した', 'under the bridge', 0, 'みっつめ の (とうろう の) した.'), o('いえ の なか', 'in a house', 0, 'みっつめ の した: under the third (lantern).')]],
    E: ['What doesn\'t the song tell you?', [o('', 'Where to start counting', 1), o('', 'That the oil is under a lantern', 0, 'It says so: みっつめ の した に.'), o('', 'That it is on the ridge', 0, 'おね の みち: the ridge road.')]],
    I: ['What does 油がある という言葉 refer to?', [o('', 'The song\'s words saying the oil is under a lantern', 1), o('', 'A real map', 0, 'と いう 言葉: the words that say it.'), o('', 'The number three', 0, 'と いう picks up "the oil is under a lantern".')]],
    A: ['Why can\'t "the third" be trusted as a count?', [o('', 'It is a counting song\'s stock phrase', 1), o('', 'The children cannot count', 0, '決まり文句: a set phrase of such songs.'), o('', 'There are only two lanterns', 0, 'The point is the phrase, not the number of lanterns.')]],
  });
  readTask('kr.read_stele2', T('{碑|ひ} の {最後|さいご} の {行|ぎょう}', 'The stele\'s last line'), STELE2, 'v:下り道', {
    items: { F: 'v:油', E: 'v:置く', I: 'g:kr_ni_yoruto', A: 'g:kr_classical' },
    F: ['Where is the oil?', [o('くだりみち の とうろう の した', 'under the lantern on the way down', 1), o('いし の した', 'under the stone', 0, 'くだりみち の とうろう の した.'), o('おね の うえ', 'on top of the ridge', 0, 'くだりみち: the way down.')]],
    E: ['Which lantern does the stele mean?', [o('', 'The one on the path going down', 1), o('', 'The third one on the ridge', 0, 'That is the song; the stele says 下り道.'), o('', 'The one at the lodge', 0, '下り道 の 灯籠: the lantern on the way down.')]],
    I: ['What does こと に なって いた tell you?', [o('', 'It was the custom to keep the oil there', 1), o('', 'Someone decided it once, today', 0, 'こと に なって いた: an arrangement that held.'), o('', 'The oil was never there', 0, 'It says where the oil was to be kept.')]],
    A: ['What is the modern meaning of 置くべし?', [o('', 'Must be put (置かなければならない)', 1), o('', 'Was put (置いた)', 0, 'べし is "must, shall".'), o('', 'Might be put (置くかもしれない)', 0, 'べし is "must, shall", not "might".')]],
  });
  readTask('kr.read_kumazo', T('クマゾウ の {話|はなし}', 'What Kumazō saw'), KUMAZO, 'v:小道', {
    items: { F: 'v:持つ', E: 'v:小道', I: 'g:sou_hear', A: 'v:認める' },
    F: ['What did the keepers carry?', [o('かめ', 'jars', 1), o('とうろう', 'lanterns', 0, 'かめ を もって.'), o('き', 'wood', 0, 'かめ を もって: carrying jars.')]],
    E: ['What is Kumazō not sure of?', [o('', 'Whether there was a hut', 1), o('', 'That keepers went down the little path', 0, 'He saw that: 見ました.'), o('', 'That they carried jars', 0, 'He saw that too: かめ を 持って いました.')]],
    I: ['How does the writer know what Kumazō saw?', [o('', 'Kumazō said so (見たそうだ)', 1), o('', 'The writer saw it too', 0, 'そう だ reports what Kumazō said.'), o('', 'It is carved on the stele', 0, 'It comes from Kumazō: クマゾウ さん に よると.')]],
    A: ['What does Kumazō admit?', [o('', 'The hut may be something he was told later', 1), o('', 'He never saw the keepers', 0, '自分 の 目 で 見た: he did see them.'), o('', 'The jars were empty', 0, 'He says nothing of what was in them.')]],
  });
  readTask('kr.read_kame', T('カメ の {話|はなし}', 'Kame\'s telling'), KAME, 'v:狐', {
    items: { F: 'v:狐', E: 'v:礼', I: 'g:kr_tsutaerareru', A: 'v:出来事' },
    F: ['Who built the bridge, in Kame\'s story?', [o('きつね', 'a fox', 1), o('ひもり', 'a keeper', 0, 'In Kame\'s story: きつね が はし を かけた.'), o('おばあさん', 'her grandmother', 0, 'Her grandmother told the story.')]],
    E: ['Why did the fox build it?', [o('', 'To thank someone who had helped it', 1), o('', 'To cross the stream', 0, '助けて もらった お礼.'), o('', 'Because the keeper asked', 0, 'お礼: as thanks.')]],
    I: ['What does 伝えられている tell you about the story?', [o('', 'It has been passed down in Kame\'s family', 1), o('', 'Kame saw it happen', 0, 'Handed down, not witnessed.'), o('', 'It is written in the register', 0, 'It lives in Kame\'s family: カメ さん の 家 で は.')]],
    A: ['What does Kame truly remember?', [o('', 'Her grandmother\'s way of telling it', 1), o('', 'The fox building the bridge', 0, '誰 か が 見た わけ で は ない: nobody saw it.'), o('', 'The keeper who named it', 0, 'That is the register\'s account.')]],
  });
  readTask('kr.read_record', T('{里|さと} の {記録|きろく}', 'The hamlet\'s register'), RECORD, 'v:記録', {
    items: { F: 'v:塗る', E: 'v:記録', I: 'v:狐色', A: 'v:記録' },
    F: ['What did the keeper paint?', [o('とうろう', 'the lantern', 1), o('はし', 'the bridge', 0, 'とうろう を きつねいろ に ぬった.'), o('きつね', 'a fox', 0, 'The lantern, fox-coloured.')]],
    E: ['Why is it called Fox Bridge, says the register?', [o('', 'The lantern by it was painted fox-colour', 1), o('', 'A fox built it', 0, 'That is Kame\'s story.'), o('', 'Foxes live under it', 0, 'それで: because of the painted lantern.')]],
    I: ['What colour is 狐色?', [o('', 'Golden brown, like toast', 1), o('', 'White', 0, '焼けた パン の よう な 茶色.'), o('', 'Red', 0, '焼けた パン の よう な 茶色: golden brown.')]],
    A: ['Why does the register weigh more for how the bridge was named?', [o('', 'It was written the year the bridge was built, and names the keeper', 1), o('', 'It is older than the fox', 0, 'Its weight is that it was written at the time.'), o('', 'It has a fox in it', 0, 'The only fox in it is a colour.')]],
  });
  readTask('kr.read_board', T('{祠|ほこら} の {板|いた}', 'The shrine\'s board'), BOARD, 'v:祠', {
    items: { F: 'v:守る', E: 'v:祠', I: 'g:kr_ni_yoruto', A: 'v:触れる' },
    F: ['What does the fox do, says the board?', [o('はし を まもる', 'guards the bridge', 1), o('はし を かける', 'builds the bridge', 0, 'まもる: guards.'), o('ひ を つける', 'lights the lantern', 0, 'はし を まもる.')]],
    E: ['What is the shrine for?', [o('', 'To honour the fox that guards the bridge', 1), o('', 'To keep the oil', 0, '狐 を まつって います.'), o('', 'For the keepers to sleep in', 0, 'It honours the fox.')]],
    I: ['What does the board not tell you?', [o('', 'When the shrine was built', 1), o('', 'What it honours', 0, 'It says: 橋 を 守る 狐.'), o('', 'That there is a fox', 0, 'It names the fox.')]],
    A: ['What does the board say about how the bridge came to be?', [o('', 'Nothing at all', 1), o('', 'That a fox built it', 0, '何 も 触れて いない.'), o('', 'That a keeper named it', 0, 'It touches on nothing of the bridge\'s making.')]],
  });

  // ---- the tellings ---------------------------------------------------------------------------------------------------
  const cl = (id, jp, en, vouch, why, rule) => Object.assign({ id, jp, en, vouch: !!vouch }, why ? { why: no(why) } : {}, rule ? { rule } : {});
  C.tellings['kr.t_cave'] = {
    id: 'kr.t_cave',
    title: T('{灯|ひ} の {順番|じゅんばん}', 'The order of the lights'),
    question: T('{洞|ほら} の {四|よっ}つ の {灯|ひ} を 、 どの {順|じゅん} に {点|つ}ける ？', 'In what order will you light the cave\'s four lanterns?'),
    sources: [
      { id: 'stele', kind: 'inscription', who: T('{尾根|おね} の {碑|ひ}', 'the ridge\'s stele'), read: 'kr.read_stele', text: STELE, claims: [
        cl('s1', '{東|ひがし} が {一番目|いちばんめ}', 'The east lantern is first', 1, 'The stone was cut by the keepers who dug the cave, and this line can still be read.', { first: 'east' }),
        cl('s2', '{泉|いずみ} が {二番目|にばんめ}', 'The spring is second', 1, 'Cut in the stone and still legible.', { at: ['spring', 2] }),
        cl('s3', '{三番目|さんばんめ} は {名|な}', 'The name lantern is third', 0, 'The third line is worn smooth: the stone can\'t say what it was.'),
        cl('s4', '{鐘|かね} が {最後|さいご}', 'The bell is last', 1, 'Cut in the stone and still legible.', { last: 'bell' }),
      ] },
      { id: 'hisae', kind: 'memory', who: T('ヒサエ', 'Hisae'), read: 'kr.read_hisae', text: HISAE, claims: [
        cl('h1', '{東|ひがし} が {一番目|いちばんめ}', 'The east lantern is first', 1, 'She carried the flame herself as an apprentice, and is sure of it.', { first: 'east' }),
        cl('h2', '{名|な} の {後|あと} に {鐘|かね}', 'The bell comes after the name', 1, 'She is sure, and gives her reason: once the bell rings, the rite is over.', { before: ['name', 'bell'] }),
        cl('h3', '{泉|いずみ} は {三番目|さんばんめ}', 'The spring is third', 0, 'She says herself she doesn\'t remember where the spring came.'),
      ] },
      { id: 'rhyme', kind: 'rhyme', who: T('{里|さと} の {子供|こども} たち', 'the hamlet\'s children'), read: 'kr.read_rhyme', text: RHYME, claims: [
        cl('r1', '{灯|ひ} は {四|よっ}つ', 'There are four lights', 1, 'A song keeps its words: it names all four.'),
        cl('r2', '{鐘|かね} の {後|あと} に {名|な}', 'The name comes after the bell', 0, 'A song keeps its words and moves them to fit the tune: it can\'t vouch for their order.', { before: ['bell', 'name'] }),
      ] },
      { id: 'scroll', kind: 'scroll', who: T('キキョウ の {絵巻|えまき}', 'Kikyō\'s scroll'), read: 'kr.read_scroll', text: SCROLL, claims: [
        cl('k1', '{東|ひがし} 、 {泉|いずみ} 、 {名|な} 、 {鐘|かね} の {順|じゅん}', 'East, spring, name, bell, in that order', 1, 'The pictures are old, and the order is the tellers\' tradition, handed down with them.', { at: ['name', 3] }),
        cl('k2', '{狐|きつね} が {見守|みまも}って いた', 'A fox was watching over them', 0, 'Kikyō says herself the fox is a teller\'s addition, for listeners.'),
      ] },
    ],
    answer: { kind: 'order', items: [
      { id: 'east', jp: '{東|ひがし} の {灯|ひ}', en: 'the east lantern' }, { id: 'spring', jp: '{泉|いずみ} の {灯|ひ}', en: 'the spring\'s lantern' },
      { id: 'name', jp: '{名|な} の {灯|ひ}', en: 'the name lantern' }, { id: 'bell', jp: '{鐘|かね} の {灯|ひ}', en: 'the bell\'s lantern' },
    ] },
  };
  C.tellings['kr.t_cache'] = {
    id: 'kr.t_cache',
    title: T('{油|あぶら} の {隠|かく}し{場所|ばしょ}', 'Where the oil is'),
    question: T('{灯守|ひもり} の {油|あぶら} を 、 どこ で {探|さが}す ？', 'Where will you look for the keepers\' oil?'),
    sources: [
      { id: 'rhyme2', kind: 'rhyme', who: T('{里|さと} の {子供|こども} たち', 'the hamlet\'s children'), read: 'kr.read_rhyme2', text: RHYME2, claims: [
        cl('c1', '{油|あぶら} は {灯籠|とうろう} の {下|した}', 'The oil is under a lantern', 1, 'A song keeps its words: under a lantern is what it says.'),
        cl('c2', '{三|みっ}つ{目|め} の {灯籠|とうろう} だ', 'It is the third lantern', 0, '"The third" is a counting song\'s stock phrase, and the song doesn\'t say where to count from.'),
      ] },
      { id: 'stele2', kind: 'inscription', who: T('{尾根|おね} の {碑|ひ}', 'the ridge\'s stele'), read: 'kr.read_stele2', text: STELE2, claims: [
        cl('c3', '{下|くだ}り{道|みち} の {灯籠|とうろう} の {下|した}', 'Under the lantern on the way down', 1, 'Cut by the keepers, and still legible.'),
      ] },
      { id: 'kumazo', kind: 'memory', who: T('クマゾウ', 'Kumazō'), read: 'kr.read_kumazo', text: KUMAZO, claims: [
        cl('c4', '{灯守|ひもり} は {尾根|おね} の {小道|こみち} を {下|お}りた', 'Keepers went down the little path off the ridge', 1, 'He saw it himself, and is sure.'),
        cl('c5', '{小道|こみち} の {先|さき} に {小屋|こや} が あった', 'There was a hut down the path', 0, 'He isn\'t sure, and thinks he may have heard it later.'),
      ] },
    ],
    answer: { kind: 'choice', options: [
      { id: 'down', jp: '{小道|こみち} を {下|お}りて 、 その {灯籠|とうろう} の {下|した} を {掘|ほ}る', en: 'Go down the little path and dig under its lantern', needs: ['c1', 'c3', 'c4'], best: true },
      { id: 'every', jp: '{尾根|おね} の {灯籠|とうろう} の {下|した} を 、 {全部|ぜんぶ} {掘|ほ}って みる', en: 'Dig under every lantern on the ridge', needs: ['c1'], detour: no('You turn the ground over under one lantern after another, all along the ridge. The last, down the little path, has the jar.') },
      { id: 'third', jp: '{狐橋|きつねばし} から {数|かぞ}えて {三|みっ}つ{目|め} の {灯籠|とうろう} を {掘|ほ}る', en: 'Count three lanterns from the Fox Bridge end and dig under the third', needs: ['c2'] },
      { id: 'hut', jp: '{小屋|こや} の {跡|あと} を {探|さが}す', en: 'Look for the remains of the hut', needs: ['c5'] },
    ] },
  };
  C.tellings['kr.t_fox'] = {
    id: 'kr.t_fox',
    title: T('{狐橋|きつねばし} の {名前|なまえ}', 'The Fox Bridge\'s name'),
    question: T('{新|あたら}しい {板|いた} に 、 {里|さと} は どの {話|はなし} を {残|のこ}す ？', 'Which telling will the hamlet put on its new board?'),
    sources: [
      { id: 'kame', kind: 'memory', who: T('カメ', 'Kame'), read: 'kr.read_kame', text: KAME, claims: [
        cl('f1', '{狐|きつね} が {一晩|ひとばん} で {橋|はし} を {架|か}けた', 'A fox built the bridge in one night', 0, 'Kame remembers her grandmother telling it, and is sure of that; nobody saw a fox build a bridge.'),
        cl('f2', 'おばあさん が この {話|はなし} を {語|かた}った', 'Kame\'s grandmother told this story', 1, 'Kame heard it herself, many times.'),
      ] },
      { id: 'record', kind: 'record', who: T('{里|さと} の {記録|きろく}', 'the hamlet\'s register'), read: 'kr.read_record', text: RECORD, claims: [
        cl('f3', '{灯守|ひもり} が {灯籠|とうろう} を {狐色|きつねいろ} に {塗|ぬ}った', 'A keeper painted the lantern fox-colour', 1, 'Written the year the bridge was built.'),
        cl('f4', '「{狐橋|きつねばし}」 と {名付|なづ}けた の は {灯守|ひもり}', 'A keeper gave the bridge its name', 1, 'Written at the time, with the keeper\'s own name.'),
      ] },
      { id: 'board', kind: 'board', who: T('{祠|ほこら} の {板|いた}', 'the shrine\'s board'), read: 'kr.read_board', text: BOARD, claims: [
        cl('f5', '{祠|ほこら} は {橋|はし} を {守|まも}る {狐|きつね} を まつる', 'The shrine honours a fox that guards the bridge', 1, 'That is what the shrine is for: the board can vouch for it.'),
        cl('f6', '{狐|きつね} の おかげ で {橋|はし} が できた', 'The bridge exists thanks to the fox', 0, 'The board says nothing of how the bridge was made.'),
      ] },
    ],
    answer: { kind: 'choice', options: [
      { id: 'both', jp: '{灯守|ひもり} の {名付|なづ}け を {書|か}いて 、 {狐|きつね} の {話|はなし} は 「カメ さん の 家 の 話」 と して {添|そ}える', en: 'Write the keeper\'s naming, and add the fox story as "the tale Kame\'s family tells"', needs: ['f3', 'f4', 'f2'], best: true },
      { id: 'record', jp: '{灯守|ひもり} の {名付|なづ}け だけ を {書|か}く', en: 'Write only the keeper\'s naming', needs: ['f3', 'f4'] },
      { id: 'three', jp: '{三|みっ}つ の {話|はなし} を 、 だれ の {話|はなし} か {書|か}いて 、 {全部|ぜんぶ} {並|なら}べる', en: 'Set all three tellings side by side, each with whose it is', needs: ['f2', 'f4', 'f5'] },
      { id: 'fox', jp: '「{狐|きつね} が {橋|はし} を {架|か}けた」 と {書|か}く', en: 'Write that a fox built the bridge', needs: ['f1'] },
    ] },
  };
})(RB.content);
