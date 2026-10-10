/* The festival's other four games (expansion P09; plan 08_CULTURE.md C10 "The games"; the shell is P06's,
 * src/engine/72f_festival.js). Each is Practice by default (untimed, nothing kept) or Timed (opt-in; your own best
 * only). Just for fun: no score wins anything (C-17, C-55).
 *   型抜き katanuki (real): read the shape's name, choose its candy sheet, trace it out without breaking it
 *   輪投げ ring toss: the prize is described (read, and spoken if the voice is on); throw at the one described
 *   言葉くじ the word lottery: draw a word and forge a sentence with it for the stall-keeper (L7)
 *   太鼓 taiko: read the drum words (ドン the face, カッ the rim) and drum them; practice is call and response
 * The language is graded two ways: kana and short sentences for Foundations and Elementary journeys, kanji and
 * fuller sentences for Intermediate and Advanced. */
var RB = (globalThis.RB = globalThis.RB || {});
(function (C) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  C.festival = C.festival || {};

  // ---- katanuki: the shapes (drawn from their outlines in src/ui/88g_festival_games.js) ---------------------------
  C.festival.katanuki = {
    shapes: [
      { id: 'star', name: T('star', '{星|ほし}'), kana: 'ほし' },
      { id: 'umbrella', name: T('umbrella', '{傘|かさ}'), kana: 'かさ' },
      { id: 'fish', name: T('fish', '{魚|さかな}'), kana: 'さかな' },
      { id: 'gourd', name: T('gourd', 'ひょうたん'), kana: 'ひょうたん' },
      { id: 'moon', name: T('crescent moon', '{月|つき}'), kana: 'つき' },
      { id: 'house', name: T('house', '{家|いえ}'), kana: 'いえ' },
    ],
    ask: T('Press out the %S.', '%S を {抜|ぬ}いて ください 。'),
    askKana: 'ぬいて ください',
  };

  // ---- ring toss: the prizes and their descriptions ------------------------------------------------------------
  const P = (id, name, easy, full) => ({ id, name, easy, full });
  C.festival.wanage = {
    prizes: [
      P('daruma', T('a daruma doll', 'だるま'), T('Red and round. Knock it down and it gets back up.', 'あかくて 、 まるい 。 たおれて も 、 おきあがる 。'),
        T('Red and round. However many times it falls, it gets back up.', '{赤|あか}くて {丸|まる}い 。 {何度|なんど} {倒|たお}れて も 、 {起|お}き{上|あ}がる 。')),
      P('furin', T('a wind chime', '{風鈴|ふうりん}'), T('When the wind blows, it goes "chirin".', 'かぜ が ふく と 、 ちりん と なる 。'),
        T('In summer, when the wind blows, it rings: "chirin".', '{夏|なつ} 、 {風|かぜ} が {吹|ふ}く と 、 ちりん と {鳴|な}る 。')),
      P('kendama', T('a kendama', 'けん{玉|だま}'), T('You swing the ball up and catch it on a cup.', 'たま を あげて 、 さら で うける 。'),
        T('A toy: you swing the ball up and catch it on a cup or the spike.', '{玉|たま} を {振|ふ}り{上|あ}げて 、 {皿|さら} や {先|さき} で {受|う}ける {遊|あそ}び{道具|どうぐ} 。')),
      P('uchiwa', T('a round fan', 'うちわ'), T('You wave it to make yourself cool.', 'あおいで 、 すずしく する 。'),
        T('Something you wave at your face in summer to cool down.', '{夏|なつ} に {顔|かお} を あおいで 、 {涼|すず}しく する もの 。')),
      P('omen', T('a festival mask', 'お{面|めん}'), T('You put it on your face. Some have a fox\'s face.', 'かお に つける 。 きつね の かお も ある 。'),
        T('You wear it over your face. Some have the face of a fox, or an ogre.', '{顔|かお} に {着|つ}ける 。 {狐|きつね} や {鬼|おに} の {顔|かお} を した もの も ある 。')),
      P('kingyo', T('a goldfish', '{金魚|きんぎょ}'), T('A red fish. It is in a bag of water.', 'あかい さかな 。 ふくろ の みず の なか に いる 。'),
        T('A small red fish, in a bag filled with water.', '{赤|あか}い {小|ちい}さな {魚|さかな} 。 {水|みず} の {入|はい}った {袋|ふくろ} に {入|はい}って いる 。')),
      P('tako', T('a kite', '{凧|たこ}'), T('It rides the wind and flies in the sky.', 'かぜ に のって 、 そら を とぶ 。'),
        T('Held on a long string, it rides the wind up into the sky.', '{長|なが}い {糸|いと} で 、 {風|かぜ} に {乗|の}って {空|そら} を {飛|と}ぶ 。')),
    ],
  };

  // ---- the word lottery: a drawn word, and the sentences it can make -----------------------------------------------
  // each word: a forge step for kana journeys (F, E) and one with kanji (I, A); several right answers, a wrong one says why
  const F = (o) => Object.assign({ kind: 'forge' }, o);
  const ok = (parts, en) => ({ parts, ok: true, en });
  const no = (parts, en, why) => ({ parts, ok: false, en, why: { en: why } });
  // each word is a challenge of its own (pt.kuji_<id>), so it is validated, reviewed and tiered like any other
  const W = (id, word, low, high) => {
    const l = F(Object.assign({ id: 'pt.kuji_' + id + '.low' }, low)), h = F(Object.assign({ id: 'pt.kuji_' + id + '.high' }, high));
    C.challenges['pt.kuji_' + id] = { title: T('The word lottery: ' + word.en, word.jp), tiers: { F: [l], E: [l], I: [h], A: [h] } };
    return { id, word, challenge: 'pt.kuji_' + id };
  };
  C.festival.kuji = {
    words: [
      W('hanabi', T('fireworks', '{花火|はなび}'),
        { item: 'g:v_mashou', prompt: T('Your word is はなび (fireworks). Make an invitation with it.'), families: [ok(['はなび を', 'みに', 'いきましょう 。'], 'Let\'s go and see the fireworks.'), ok(['いっしょ に', 'はなび を', 'みましょう 。'], 'Let\'s watch the fireworks together.'), no(['はなび を', 'たべに', 'いきましょう 。'], 'Let\'s go and eat the fireworks.', 'たべに: to eat. Fireworks are for watching (みに).')] },
        { item: 'g:v_mashou', prompt: T('Your word is {花火|はなび} (fireworks). Make an invitation with it.'), families: [ok(['{花火|はなび} を', '{見|み}に', '{行|い}きましょう 。'], 'Let\'s go and see the fireworks.'), ok(['{一緒|いっしょ} に', '{花火|はなび} を', '{見|み}ません か 。'], 'Won\'t you watch the fireworks with me?'), no(['{花火|はなび} を', '{食|た}べに', '{行|い}きましょう 。'], 'Let\'s go and eat the fireworks.', '{食|た}べに: to eat. Fireworks are watched ({見|み}に).')] }),
      W('kingyo', T('goldfish', '{金魚|きんぎょ}'),
        { item: 'g:prt_ga', prompt: T('Your word is きんぎょ (goldfish). Say how many there are.'), families: [ok(['きんぎょ が', 'さんびき', 'います 。'], 'There are three goldfish.'), ok(['あかい', 'きんぎょ が', 'います 。'], 'There is a red goldfish.'), no(['きんぎょ が', 'さんびき', 'あります 。'], 'There are three goldfish (as things).', 'Living things います; あります is for things.')] },
        { item: 'g:exist_aru_iru', prompt: T('Your word is {金魚|きんぎょ} (goldfish). Say where they are.'), families: [ok(['{袋|ふくろ} の {中|なか} に', '{金魚|きんぎょ} が', '{三匹|さんびき} います 。'], 'There are three goldfish in the bag.'), ok(['{水|みず} の {中|なか} で', '{金魚|きんぎょ} が', '{泳|およ}いで います 。'], 'The goldfish are swimming in the water.'), no(['{袋|ふくろ} の {中|なか} に', '{金魚|きんぎょ} が', '{三匹|さんびき} あります 。'], 'There are three goldfish (as things) in the bag.', 'Living things います.')] }),
      W('yukata', T('yukata', '{浴衣|ゆかた}'),
        { item: 'g:v_te_iru', prompt: T('Your word is ゆかた. Say what someone is wearing.'), families: [ok(['あおい', 'ゆかた を', 'きて います 。'], 'They are wearing a blue yukata.'), ok(['ともだち は', 'ゆかた を', 'きて います 。'], 'My friend is wearing a yukata.'), no(['あおい', 'ゆかた を', 'はいて います 。'], 'They are wearing (on their legs) a blue yukata.', 'はく is for shoes and trousers; a yukata is きる.')] },
        { item: 'g:v_te_iru', prompt: T('Your word is {浴衣|ゆかた}. Say what someone is wearing.'), families: [ok(['{青|あお}い', '{浴衣|ゆかた} を', '{着|き}て います 。'], 'They are wearing a blue yukata.'), ok(['{祭|まつ}り の {夜|よる} は', '{浴衣|ゆかた} を', '{着|き}ます 。'], 'On festival nights I wear a yukata.'), no(['{青|あお}い', '{浴衣|ゆかた} を', '{履|は}いて います 。'], 'They are wearing (on their feet) a blue yukata.', '{履|は}く is for shoes; a yukata is {着|き}る.')] }),
      W('yatai', T('stall', '{屋台|やたい}'),
        { item: 'g:exist_aru_iru', prompt: T('Your word is やたい (a stall). Say where it is.'), families: [ok(['はし の まえ に', 'やたい が', 'あります 。'], 'There is a stall in front of the bridge.'), ok(['きし に', 'やたい が', 'たくさん あります 。'], 'There are lots of stalls on the bank.'), no(['はし の まえ に', 'やたい が', 'います 。'], 'There is a stall (as a living thing) in front of the bridge.', 'A stall is a thing: あります.')] },
        { item: 'g:exist_aru_iru', prompt: T('Your word is {屋台|やたい} (a stall). Say where it is.'), families: [ok(['{橋|はし} の {前|まえ} に', '{屋台|やたい} が', 'あります 。'], 'There is a stall in front of the bridge.'), ok(['{岸|きし} に {沿|そ}って', '{屋台|やたい} が', '{並|なら}んで います 。'], 'The stalls are lined up along the bank.'), no(['{橋|はし} の {前|まえ} に', '{屋台|やたい} が', 'います 。'], 'There is a stall (as a living thing) in front of the bridge.', 'A stall is a thing: あります.')] }),
      W('taiko', T('drum', '{太鼓|たいこ}'),
        { item: 'g:v_te_iru', prompt: T('Your word is たいこ (drum). Say what someone is doing.'), families: [ok(['こども が', 'たいこ を', 'たたいて います 。'], 'A child is playing the drum.'), ok(['だれ か が', 'たいこ を', 'たたいて います 。'], 'Someone is beating the drum.'), no(['こども が', 'たいこ を', 'のんで います 。'], 'A child is drinking the drum.', 'のむ is to drink. A drum is beaten: たたく.')] },
        { item: 'g:v_te_iru', prompt: T('Your word is {太鼓|たいこ} (drum). Say what you hear.'), families: [ok(['{遠|とお}く で', '{太鼓|たいこ} の {音|おと} が', '{聞|き}こえます 。'], 'I can hear a drum far off.'), ok(['{子供|こども} が', '{太鼓|たいこ} を', '{叩|たた}いて います 。'], 'A child is beating a drum.'), no(['{遠|とお}く で', '{太鼓|たいこ} の {音|おと} が', '{見|み}えます 。'], 'I can see the sound of a drum far off.', 'A sound is heard ({聞|き}こえる), not seen.')] }),
      W('uchiwa', T('round fan', 'うちわ'),
        { item: 'g:v_te', prompt: T('Your word is うちわ (a round fan). Say what you do with it.'), families: [ok(['うちわ で', 'あおいで 、', 'すずしく します 。'], 'I fan myself with it to cool down.'), ok(['あつい から 、', 'うちわ を', 'つかいます 。'], 'It\'s hot, so I use a fan.'), no(['うちわ で', 'あおいで 、', 'あつく します 。'], 'I fan myself with it to warm up.', 'あつく: hotter. A fan cools you: すずしく.')] },
        { item: 'g:conj_kara', prompt: T('Your word is うちわ (a round fan). Say why you use it.'), families: [ok(['{暑|あつ}い から 、', 'うちわ で', 'あおぎます 。'], 'It\'s hot, so I fan myself.'), ok(['うちわ で あおぐ と 、', '{少|すこ}し', '{涼|すず}しく なります 。'], 'When I fan myself it gets a little cooler.'), no(['{寒|さむ}い から 、', 'うちわ で', 'あおぎます 。'], 'It\'s cold, so I fan myself.', 'You fan yourself when it is hot ({暑|あつ}い).')] }),
      W('chochin', T('paper lantern', '{提灯|ちょうちん}'),
        { item: 'g:prt_ni', prompt: T('Your word is ちょうちん. Say where it hangs.'), families: [ok(['みせ の まえ に', 'ちょうちん が', 'さがって います 。'], 'A lantern hangs in front of the shop.'), ok(['あかい', 'ちょうちん が', 'きれい です 。'], 'The red lantern is beautiful.'), no(['みせ の まえ に', 'ちょうちん が', 'およいで います 。'], 'A lantern is swimming in front of the shop.', 'およぐ is to swim. A lantern hangs: さがる.')] },
        { item: 'g:prt_ni', prompt: T('Your word is {提灯|ちょうちん}. Say where it hangs, and when it is lit.'), families: [ok(['{暗|くら}く なったら 、', '{店|みせ} の {前|まえ} の {提灯|ちょうちん} に', '{火|ひ} を {入|い}れます 。'], 'Once it is dark, we light the lantern in front of the shop.'), ok(['{赤|あか}い {提灯|ちょうちん} が', '{岸|きし} に {沿|そ}って', '{下|さ}がって います 。'], 'Red lanterns hang along the bank.'), no(['{明|あか}るい うち に 、', '{店|みせ} の {前|まえ} の {提灯|ちょうちん} に', '{火|ひ} を {入|い}れます 。'], 'While it is still light, we light the lantern in front of the shop.', 'Lanterns are lit once it is dark ({暗|くら}く なったら).')] }),
      W('omatsuri', T('festival', 'お{祭|まつ}り'),
        { item: 'g:v_tai', prompt: T('Your word is おまつり. Say what you want to do there.'), families: [ok(['おまつり で', 'きんぎょ を', 'すくいたい です 。'], 'At the festival I want to scoop a goldfish.'), ok(['おまつり に', 'いきたい', 'です 。'], 'I want to go to the festival.'), no(['おまつり で', 'きんぎょ を', 'すくいたく ない です 。'], 'At the festival I don\'t want to scoop a goldfish.', 'That says you don\'t want to.')] },
        { item: 'g:v_tai', prompt: T('Your word is お{祭|まつ}り. Say what you would like to do there.'), families: [ok(['お{祭|まつ}り で', '{金魚|きんぎょ} を', 'すくって みたい です 。'], 'At the festival I\'d like to try scooping a goldfish.'), ok(['{今年|ことし} の お{祭|まつ}り に は', '{浴衣|ゆかた} で', '{行|い}きたい です 。'], 'This year I want to go to the festival in a yukata.'), no(['お{祭|まつ}り で', '{金魚|きんぎょ} を', 'すくいました 。'], 'At the festival I scooped a goldfish.', 'That says what happened, not what you would like: 〜たい is a wish.')] }),
    ],
  };

  // ---- taiko: the drum words and the patterns (4 beats, then 6, then 8) ------------------------------------------
  C.festival.taiko = {
    words: { don: T('the drum\'s face (centre)', 'ドン'), ka: T('the drum\'s rim', 'カッ') },
    patterns: [
      ['don', 'don', 'don', 'ka'], ['don', 'ka', 'don', 'ka'], ['don', 'don', 'ka', 'ka'], ['ka', 'don', 'don', 'don'],
      ['don', 'ka', 'ka', 'don'], ['don', 'don', 'ka', 'don', 'don', 'ka'], ['ka', 'ka', 'don', 'ka', 'ka', 'don'],
      ['don', 'ka', 'don', 'don', 'ka', 'don'], ['don', 'don', 'don', 'ka', 'don', 'ka', 'don', 'don'],
      ['ka', 'don', 'ka', 'don', 'don', 'ka', 'don', 'ka'],
    ],
  };

  if (RB.festival) {
    RB.festival.define('katanuki', {
      title: T('Katanuki', '{型抜|かたぬ}き'), seconds: 90, better: 'more', streaks: true, ui: 'katanuki',
      about: T('A thin sugar sheet with a shape pressed into it. Read the shape\'s name, choose its sheet, and trace the shape out without breaking it.', '{型|かた} を {割|わ}らず に {抜|ぬ}く 。'),
    });
    RB.festival.define('wanage', {
      title: T('Ring toss', '{輪投|わな}げ'), seconds: 60, better: 'more', streaks: true, ui: 'wanage',
      about: T('The stall-keeper describes a prize. Throw your ring at the one described.', '{説明|せつめい} を {聞|き}いて 、 {輪|わ} を {投|な}げる 。'),
    });
    RB.festival.define('kuji', {
      title: T('Word lottery', '{言葉|ことば} くじ'), seconds: 120, better: 'more', streaks: true, ui: 'kuji',
      about: T('Draw a word from the lottery box and make a sentence with it for the stall-keeper.', '{引|ひ}いた {言葉|ことば} で 、 {文|ぶん} を {作|つく}る 。'),
    });
    RB.festival.define('taiko', {
      title: T('Taiko', '{太鼓|たいこ}'), seconds: 60, better: 'more', streaks: true, ui: 'taiko',
      about: T('Read the drum words and drum them: ドン is the drum\'s face, カッ its rim. Practice is call and response; a timed round is played in time.', 'ドン は {真|ま}ん{中|なか} 、 カッ は {縁|ふち} 。'),
    });
  }
})(RB.content);
