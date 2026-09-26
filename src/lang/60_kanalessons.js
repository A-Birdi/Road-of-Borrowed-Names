/* RB.kanaLessons — teaching sequence for the Foundations profile.
 * Group: {id, script, title, jp, kana:[{k, r, note}], chars:[…new characters],
 *         notes:[mixed text], words:[{w, m, lemma}]}
 * Example words use ONLY kana taught up to and including their group (tested).
 * Notes are factual (romanisation, pronunciation, shape differences); there
 * are no invented "meanings" for kana. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.kanaLessons = (function () {
  'use strict';
  const K = RB.kana;

  // Factual per-kana notes; anything not listed gets "X is romanised x."
  const NOTE = {
    あ: 'The vowel a. Compare お, which has a separate dot at the upper right.',
    い: 'The vowel i. Compare り, whose right stroke is much longer.',
    う: 'The vowel u, said without rounding the lips much.',
    え: 'The vowel e.',
    お: 'The vowel o. Compare あ: お has a separate dot at the upper right.',
    き: 'Romanised ki. き has two horizontal strokes; さ has one.',
    こ: 'Romanised ko. Compare に, which has an extra vertical stroke on the left.',
    さ: 'Romanised sa. The lower curve of さ opens to the right; in ち it opens to the left.',
    し: 'Romanised shi (not "si").',
    す: 'Romanised su. Its vowel is often whispered (devoiced), as in です.',
    ち: 'Romanised chi (not "ti"). Its lower curve opens to the left, unlike さ.',
    つ: 'Romanised tsu (not "tu").',
    ぬ: 'Romanised nu. ぬ ends with a small loop; め does not.',
    ね: 'Romanised ne. ね ends in a small loop; compare れ and わ.',
    は: 'Romanised ha. As the topic particle, は is pronounced wa.',
    ひ: 'Romanised hi.',
    ふ: 'Romanised fu. The sound is made with both lips, not with the teeth as in English f.',
    へ: 'Romanised he. As the direction particle, へ is pronounced e. It looks almost the same as katakana ヘ.',
    ほ: 'Romanised ho. ほ has an extra horizontal stroke closing the top of its right part; は does not.',
    め: 'Romanised me. Compare ぬ, which ends with a small loop.',
    や: 'Romanised ya.',
    ゆ: 'Romanised yu.',
    よ: 'Romanised yo.',
    ら: 'Romanised ra. The ら-row consonant is a quick tap of the tongue tip; it is neither English r nor l.',
    り: 'Romanised ri. Compare い: in り the right stroke is much longer.',
    る: 'Romanised ru. る ends with a small loop at the bottom; ろ does not.',
    れ: 'Romanised re. れ ends with an outward flick; compare ね and わ.',
    ろ: 'Romanised ro. Compare る, which ends with a small loop.',
    わ: 'Romanised wa. わ ends with an inward curve; compare ね and れ.',
    を: 'Romanised wo in kana charts but pronounced o. It is used almost only as the object particle.',
    ん: 'Romanised n. It is a beat (mora) of its own, and no word starts with it. Its exact sound changes with the sound that follows.',
    ぢ: 'Romanised ji. In standard Japanese it sounds the same as じ; it appears in a limited set of words, such as はなぢ.',
    づ: 'Romanised zu. In standard Japanese it sounds the same as ず; it appears in a limited set of words, such as つづく.',
    じ: 'Romanised ji.',
    っ: 'Small っ adds a one-beat pause and doubles the next consonant: きて (kite) → きって (kitte).',
    ゃ: 'Small ゃ joins the kana before it into one syllable: き + ゃ = きゃ (kya).',
    ゅ: 'Small ゅ joins the kana before it into one syllable: き + ゅ = きゅ (kyu).',
    ょ: 'Small ょ joins the kana before it into one syllable: き + ょ = きょ (kyo).',
    ア: 'The vowel a. Compare マ, which has a short stroke at the bottom right instead.',
    ウ: 'The vowel u. ウ has a short stroke on top; ワ does not.',
    カ: 'Romanised ka. Hiragana か has an extra short stroke; カ does not.',
    ク: 'Romanised ku. Compare ケ and タ.',
    ケ: 'Romanised ke. A horizontal stroke reaches out to the right with a vertical hanging from it.',
    コ: 'Romanised ko. コ is closed on the right; in ユ the bottom stroke extends past the vertical.',
    シ: 'Romanised shi. The two short strokes are on the left, and the long stroke is written upward from the bottom.',
    ソ: 'Romanised so. The short stroke is on top and the long stroke comes down from the top right.',
    タ: 'Romanised ta. Like ク with an extra short stroke inside.',
    チ: 'Romanised chi. Compare テ.',
    ツ: 'Romanised tsu. The two short strokes are on top, and the long stroke is written downward.',
    テ: 'Romanised te. Compare チ.',
    ヌ: 'Romanised nu. Its second stroke crosses the first; in ス it only touches it.',
    ス: 'Romanised su. Compare ヌ.',
    ノ: 'Romanised no. A single stroke; メ adds a second, crossing stroke.',
    フ: 'Romanised fu. A single stroke; compare ワ and ウ.',
    ヘ: 'Romanised he. It looks almost the same as hiragana へ.',
    マ: 'Romanised ma. Compare ア.',
    メ: 'Romanised me. Compare ノ and ナ.',
    ユ: 'Romanised yu. Compare コ.',
    ラ: 'Romanised ra. The ラ-row consonant is a quick tap of the tongue tip.',
    リ: 'Romanised ri. It looks very similar to hiragana り.',
    ル: 'Romanised ru. Two strokes; レ is one.',
    レ: 'Romanised re. A single stroke; compare ル.',
    ロ: 'Romanised ro. Closed on all four sides, unlike コ.',
    ワ: 'Romanised wa. Compare ウ, which has a short stroke on top.',
    ヲ: 'Romanised wo, pronounced o. Rarely used in katakana.',
    ン: 'Romanised n. The short stroke is on the left and the long stroke is written upward. Compare ソ.',
    ヴ: 'Romanised vu. Used for a v sound in some loanwords; many such words also have a spelling with バ-row kana.',
    ッ: 'Small ッ adds a one-beat pause and doubles the next consonant, as in hiragana.',
    ー: 'The long-vowel mark: it lengthens the vowel before it by one beat (コーヒー = koohii). It is used mainly in katakana.',
    ァ: 'Small ァ combines with the kana before it, e.g. ファ (fa).',
    ィ: 'Small ィ combines with the kana before it, e.g. ティ (ti), フィ (fi).',
    ゥ: 'Small ゥ combines with the kana before it, e.g. トゥ (tu).',
    ェ: 'Small ェ combines with the kana before it, e.g. シェ (she), フェ (fe).',
    ォ: 'Small ォ combines with the kana before it, e.g. フォ (fo).',
  };
  const ROMA_SPECIAL = { を: 'wo (o)', ヲ: 'wo (o)', っ: '(doubles the next consonant)', ッ: '(doubles the next consonant)', ー: '(long vowel)' };

  const groups = [];
  // G(id, script, title, jp, kanaList (string, space-separated), notes[], words[[kana, meaning, lemma]])
  function G(id, script, title, jp, kanaStr, notes, words) {
    const kana = kanaStr ? kanaStr.split(' ').filter(Boolean) : [];
    const chars = [];
    kana.forEach((k) => Array.from(k).forEach((ch) => { if (!chars.includes(ch) && !groups.some((g) => g.chars.includes(ch))) chars.push(ch); }));
    groups.push({
      id, script, title, jp,
      kana: kana.map((k) => {
        const r = ROMA_SPECIAL[k] || K.romaji(k);
        const note = NOTE[k] || (k.length === 2 ? k[0] + ' + small ' + k[1] + ' = ' + r + ', one syllable.' : k + ' is romanised ' + r + '.');
        return { k, r, note };
      }),
      chars,
      notes: notes || [],
      words: (words || []).map(([w, m, lemma]) => ({ w, m, lemma: lemma || w })),
    });
  }

  // ---- hiragana ---------------------------------------------------------------
  G('h_a', 'hira', 'Hiragana: the vowels', 'あ{行|ぎょう}', 'あ い う え お',
    ['These five vowels are a, i, u, e, o. Every other basic kana except ん ends in one of these vowel sounds.',
      'Each kana is one beat (mora); keep the beats even.'],
    [['あい', 'love', '愛'], ['いえ', 'house, home', '家'], ['うえ', 'above, on top', '上'], ['あお', 'blue', '青'],
      ['え', 'picture', '絵'], ['あう', 'to meet', '会う'], ['いい', 'good']]);
  G('h_ka', 'hira', 'Hiragana: the k row', 'か{行|ぎょう}', 'か き く け こ', [],
    [['かお', 'face', '顔'], ['あか', 'red', '赤'], ['いけ', 'pond', '池'], ['こえ', 'voice', '声'], ['かく', 'to write', '書く'],
      ['えき', 'station', '駅'], ['あき', 'autumn', '秋'], ['いく', 'to go', '行く'], ['きく', 'to listen; to ask', '聞く'],
      ['ここ', 'here'], ['かき', 'persimmon', '柿'], ['き', 'tree', '木']]);
  G('h_sa', 'hira', 'Hiragana: the s row', 'さ{行|ぎょう}', 'さ し す せ そ', ['し is romanised shi.'],
    [['あさ', 'morning', '朝'], ['いす', 'chair', '椅子'], ['うそ', 'lie', '嘘'], ['あし', 'foot, leg', '足'], ['かさ', 'umbrella', '傘'],
      ['しお', 'salt', '塩'], ['すき', 'liked', '好き'], ['せかい', 'world', '世界'], ['そこ', 'there'], ['しか', 'deer', '鹿'],
      ['おかし', 'sweets', 'お菓子'], ['すこし', 'a little', '少し'], ['さく', 'to bloom', '咲く']]);
  G('h_ta', 'hira', 'Hiragana: the t row', 'た{行|ぎょう}', 'た ち つ て と', ['ち is romanised chi and つ is romanised tsu.'],
    [['いと', 'thread', '糸'], ['つき', 'moon', '月'], ['て', 'hand', '手'], ['そと', 'outside', '外'], ['した', 'below, under', '下'],
      ['うた', 'song', '歌'], ['くつ', 'shoes', '靴'], ['たかい', 'high; expensive', '高い'], ['ちかい', 'near', '近い'],
      ['つくえ', 'desk', '机'], ['あつい', 'hot (weather)', '暑い'], ['たいせつ', 'important', '大切'], ['ちいさい', 'small', '小さい']]);
  G('h_na', 'hira', 'Hiragana: the n row', 'な{行|ぎょう}', 'な に ぬ ね の', [],
    [['なつ', 'summer', '夏'], ['いぬ', 'dog', '犬'], ['ねこ', 'cat', '猫'], ['ぬの', 'cloth', '布'], ['なに', 'what', '何'],
      ['あに', '(my) older brother', '兄'], ['なか', 'inside', '中'], ['にし', 'west', '西'], ['きのう', 'yesterday', '昨日'],
      ['おかね', 'money', 'お金'], ['なく', 'to cry', '泣く'], ['のこす', 'to leave behind', '残す']]);
  G('h_ha', 'hira', 'Hiragana: the h row', 'は{行|ぎょう}', 'は ひ ふ へ ほ',
    ['ふ is romanised fu.', 'As particles, は is pronounced wa and へ is pronounced e; in other words they are ha and he.'],
    [['はな', 'flower', '花'], ['ひと', 'person', '人'], ['ふね', 'boat', '船'], ['ほし', 'star', '星'], ['はし', 'bridge', '橋'],
      ['へた', 'bad at', '下手'], ['はこ', 'box', '箱'], ['ひ', 'fire', '火'], ['ふく', 'clothes', '服'], ['ほそい', 'thin', '細い'],
      ['ひくい', 'low', '低い'], ['ふたつ', 'two (things)', '二つ'], ['ひとつ', 'one (thing)', '一つ'], ['はなす', 'to speak', '話す']]);
  G('h_ma', 'hira', 'Hiragana: the m row', 'ま{行|ぎょう}', 'ま み む め も', [],
    [['まち', 'town', '町'], ['むし', 'insect', '虫'], ['め', 'eye', '目'], ['もの', 'thing', '物'], ['うみ', 'sea', '海'],
      ['みち', 'road, path', '道'], ['さむい', 'cold (weather)', '寒い'], ['あめ', 'rain', '雨'], ['かみ', 'paper', '紙'],
      ['むね', 'chest', '胸'], ['もも', 'peach', '桃'], ['みみ', 'ear', '耳'], ['くも', 'cloud', '雲'], ['あたま', 'head', '頭'],
      ['のむ', 'to drink', '飲む']]);
  G('h_ya', 'hira', 'Hiragana: the y row', 'や{行|ぎょう}', 'や ゆ よ', ['The y row has only three kana: や, ゆ, よ.'],
    [['やま', 'mountain', '山'], ['ゆき', 'snow', '雪'], ['ゆめ', 'dream', '夢'], ['よい', 'good', '良い'], ['やすみ', 'rest; day off', '休み'],
      ['ゆか', 'floor', '床'], ['よこ', 'side', '横'], ['へや', 'room', '部屋'], ['ふゆ', 'winter', '冬'], ['おゆ', 'hot water', 'お湯'],
      ['やさい', 'vegetables', '野菜'], ['よむ', 'to read', '読む'], ['やすむ', 'to rest', '休む']]);
  G('h_ra', 'hira', 'Hiragana: the r row', 'ら{行|ぎょう}', 'ら り る れ ろ',
    ['The consonant of this row is a quick tap of the tongue tip behind the upper teeth.'],
    [['よる', 'night', '夜'], ['はる', 'spring', '春'], ['くるま', 'cart; vehicle', '車'], ['とり', 'bird', '鳥'], ['さくら', 'cherry blossom', '桜'],
      ['いろ', 'colour', '色'], ['くすり', 'medicine', '薬'], ['ひかり', 'light', '光'], ['みる', 'to see', '見る'], ['かえる', 'to go home', '帰る'],
      ['しろい', 'white', '白い'], ['くろい', 'black', '黒い'], ['あかるい', 'bright', '明るい'], ['れきし', 'history', '歴史'], ['ふる', 'to fall (rain, snow)', '降る']]);
  G('h_wa', 'hira', 'Hiragana: わ, を and ん', 'わ{行|ぎょう}と ん', 'わ を ん',
    ['を is pronounced o and is used almost only as the object particle.', 'ん counts as a full beat: ほん is two beats, ho-n.'],
    [['わたし', 'I, me', '私'], ['かわ', 'river', '川'], ['にわ', 'garden', '庭'], ['ほん', 'book', '本'], ['みかん', 'mandarin orange'],
      ['てんき', 'weather', '天気'], ['せんせい', 'teacher', '先生'], ['みんな', 'everyone', '皆'], ['しんせつ', 'kind', '親切'],
      ['わかる', 'to understand', '分かる'], ['ほんや', 'bookshop', '本屋'], ['おんな', 'woman', '女'], ['わらう', 'to laugh', '笑う']]);
  G('h_dakuten', 'hira', 'Hiragana: dakuten ゛', '{濁点|だくてん}',
    'が ぎ ぐ げ ご ざ じ ず ぜ ぞ だ ぢ づ で ど ば び ぶ べ ぼ',
    ['The two small marks ゛ (dakuten) voice the consonant: k → g, s → z, t → d, h → b.',
      'じ is romanised ji. ぢ and づ sound the same as じ and ず in standard Japanese and appear in only a few words.'],
    [['かぜ', 'wind', '風'], ['みず', 'water', '水'], ['ごはん', 'rice; meal', 'ご飯'], ['かぎ', 'key', '鍵'], ['ぼうし', 'hat', '帽子'],
      ['てがみ', 'letter', '手紙'], ['まど', 'window', '窓'], ['だいどころ', 'kitchen', '台所'], ['にじ', 'rainbow', '虹'], ['どうぐ', 'tool', '道具'],
      ['みぎ', 'right', '右'], ['ひだり', 'left', '左'], ['かばん', 'bag', '鞄'], ['りんご', 'apple'], ['かぞく', 'family', '家族'],
      ['でぐち', 'exit', '出口'], ['はなぢ', 'nosebleed', '鼻血'], ['つづく', 'to continue', '続く']]);
  G('h_handakuten', 'hira', 'Hiragana: handakuten ゜', '{半濁点|はんだくてん}', 'ぱ ぴ ぷ ぺ ぽ',
    ['The small circle ゜ (handakuten) is used only on the は row and gives a p sound.'],
    [['さんぽ', 'a walk', '散歩'], ['えんぴつ', 'pencil', '鉛筆'], ['ぽかぽか', 'pleasantly warm'], ['ぴかぴか', 'sparkling'],
      ['しんぱい', 'worry', '心配'], ['てんぷら', 'tempura', '天ぷら']]);
  G('h_yoon', 'hira', 'Hiragana: small ゃ ゅ ょ', '{拗音|ようおん}',
    'きゃ きゅ きょ しゃ しゅ しょ ちゃ ちゅ ちょ にゃ にゅ にょ ひゃ ひゅ ひょ みゃ みゅ みょ りゃ りゅ りょ ぎゃ ぎゅ ぎょ じゃ じゅ じょ びゃ びゅ びょ ぴゃ ぴゅ ぴょ',
    ['A small ゃ, ゅ or ょ after an i-row kana makes one syllable of one beat: きゃ (kya). With a full-size や it is two beats: きや (ki-ya).',
      'Size matters: write the small kana visibly smaller and lower.'],
    [['きゃく', 'guest', '客'], ['しゃしん', 'photograph', '写真'], ['おちゃ', 'tea', 'お茶'], ['びょうき', 'illness', '病気'],
      ['きょう', 'today', '今日'], ['じゅう', 'ten', '十'], ['りょこう', 'trip', '旅行'], ['ちゅうい', 'caution', '注意'], ['ひゃく', 'hundred', '百'],
      ['しょくじ', 'meal', '食事'], ['きょうだい', 'siblings', '兄弟'], ['じゃま', 'in the way', '邪魔'], ['ちょうちん', 'paper lantern', '提灯']]);
  G('h_sokuon', 'hira', 'Hiragana: small っ', '{促音|そくおん}', 'っ',
    ['A small っ is a one-beat pause that doubles the following consonant. A full-size つ is the syllable tsu.'],
    [['きって', 'stamp', '切手'], ['がっこう', 'school', '学校'], ['いっしょに', 'together', '一緒に'], ['もっと', 'more'],
      ['ちょっと', 'a little'], ['みっつ', 'three (things)', '三つ'], ['きっと', 'surely'], ['はっきり', 'clearly'],
      ['ざっし', 'magazine', '雑誌'], ['にっき', 'diary', '日記'], ['いっぱい', 'full; a lot']]);
  G('h_long', 'hira', 'Hiragana: long vowels', '{長音|ちょうおん}', '',
    ['A long vowel lasts one extra beat and can change the meaning: おばさん (aunt) and おばあさん (grandmother).',
      'In hiragana it is spelled with an extra vowel kana: ああ, いい, うう. Long e is usually written えい (せんせい), sometimes ええ (おねえさん). Long o is usually written おう (おとうさん), sometimes おお (おおきい).'],
    [['おかあさん', 'mother', 'お母さん'], ['おとうさん', 'father', 'お父さん'], ['おにいさん', 'older brother', 'お兄さん'],
      ['おねえさん', 'older sister', 'お姉さん'], ['おばあさん', 'grandmother'], ['おじいさん', 'grandfather'], ['おばさん', 'aunt'],
      ['くうき', 'air', '空気'], ['ゆうびん', 'mail', '郵便'], ['とおい', 'far', '遠い'], ['おおきい', 'big', '大きい'], ['こおり', 'ice', '氷'],
      ['すうじ', 'number', '数字'], ['ふうとう', 'envelope', '封筒'], ['えいご', 'English', '英語']]);

  // ---- katakana ------------------------------------------------------------------
  G('k_a', 'kata', 'Katakana: the vowels', 'ア{行|ぎょう}', 'ア イ ウ エ オ',
    ['Katakana is used mainly for words from other languages, foreign names, and some sound words. Each katakana has the same sound as its hiragana partner.',
      'Few everyday words use only these five katakana; example words start with the next group.'], []);
  G('k_ka', 'kata', 'Katakana: the k row', 'カ{行|ぎょう}', 'カ キ ク ケ コ', [],
    [['ココア', 'cocoa'], ['イカ', 'squid']]);
  G('k_sa', 'kata', 'Katakana: the s row', 'サ{行|ぎょう}', 'サ シ ス セ ソ', ['シ and ソ are easy to confuse with ツ and ン; watch the stroke directions.'],
    [['アイス', 'ice cream'], ['スイカ', 'watermelon']]);
  G('k_ta', 'kata', 'Katakana: the t row', 'タ{行|ぎょう}', 'タ チ ツ テ ト', [],
    [['テスト', 'test'], ['テキスト', 'textbook; text']]);
  G('k_na', 'kata', 'Katakana: the n row', 'ナ{行|ぎょう}', 'ナ ニ ヌ ネ ノ', [],
    [['ネクタイ', 'necktie'], ['テニス', 'tennis']]);
  G('k_ha', 'kata', 'Katakana: the h row', 'ハ{行|ぎょう}', 'ハ ヒ フ ヘ ホ', [],
    [['ナイフ', 'knife']]);
  G('k_ma', 'kata', 'Katakana: the m row', 'マ{行|ぎょう}', 'マ ミ ム メ モ', [],
    [['トマト', 'tomato'], ['メモ', 'memo, note'], ['ハム', 'ham'], ['マスク', 'mask']]);
  G('k_ya', 'kata', 'Katakana: the y row', 'ヤ{行|ぎょう}', 'ヤ ユ ヨ', [],
    [['タイヤ', 'tyre']]);
  G('k_ra', 'kata', 'Katakana: the r row', 'ラ{行|ぎょう}', 'ラ リ ル レ ロ', [],
    [['カメラ', 'camera'], ['トイレ', 'toilet'], ['ホテル', 'hotel'], ['クラス', 'class']]);
  G('k_wa', 'kata', 'Katakana: ワ, ヲ and ン', 'ワ{行|ぎょう}と ン', 'ワ ヲ ン', ['ヲ is rarely used; ン and ソ are easy to confuse.'],
    [['ランタン', 'lantern'], ['インク', 'ink'], ['ワイン', 'wine'], ['レモン', 'lemon'], ['メロン', 'melon']]);
  G('k_dakuten', 'kata', 'Katakana: dakuten ゛', '{濁点|だくてん}',
    'ガ ギ グ ゲ ゴ ザ ジ ズ ゼ ゾ ダ ヂ ヅ デ ド バ ビ ブ ベ ボ ヴ',
    ['Dakuten works as in hiragana. ヴ (vu) writes a v sound in some loanwords.'],
    [['ガラス', 'glass'], ['ドア', 'door'], ['ボタン', 'button'], ['ベンチ', 'bench']]);
  G('k_handakuten', 'kata', 'Katakana: handakuten ゜', '{半濁点|はんだくてん}', 'パ ピ プ ペ ポ', [],
    [['パン', 'bread'], ['ペン', 'pen'], ['ランプ', 'lamp'], ['ポスト', 'postbox'], ['ピアノ', 'piano']]);
  G('k_yoon', 'kata', 'Katakana: small ャ ュ ョ', '{拗音|ようおん}',
    'キャ キュ キョ シャ シュ ショ チャ チュ チョ ニャ ニュ ニョ ヒャ ヒュ ヒョ ミャ ミュ ミョ リャ リュ リョ ギャ ギュ ギョ ジャ ジュ ジョ ビャ ビュ ビョ ピャ ピュ ピョ', [],
    [['シャツ', 'shirt'], ['ジャム', 'jam'], ['キャベツ', 'cabbage']]);
  G('k_sokuon', 'kata', 'Katakana: small ッ', '{促音|そくおん}', 'ッ', [],
    [['カップ', 'cup'], ['マッチ', 'match'], ['ポケット', 'pocket'], ['バッグ', 'bag'], ['ベッド', 'bed']]);
  G('k_long', 'kata', 'Katakana: the long-vowel mark ー', '{長音|ちょうおん}', 'ー',
    ['In katakana, a long vowel is usually written with ー (vertical text uses a vertical bar).'],
    [['スープ', 'soup'], ['ブーツ', 'boots'], ['ケーキ', 'cake'], ['コーヒー', 'coffee'], ['ノート', 'notebook'], ['テーブル', 'table']]);
  G('k_ext', 'kata', 'Katakana: extended combinations', '', 'ァ ィ ゥ ェ ォ ファ フィ フェ フォ ティ ディ トゥ ウィ ウェ ウォ ヴァ ヴィ ヴェ ヴォ シェ ジェ チェ',
    ['Small ァ ィ ゥ ェ ォ combine with the kana before them to write sounds used in loanwords.'],
    [['フォーク', 'fork'], ['ソファ', 'sofa'], ['パーティー', 'party'], ['ヴァイオリン', 'violin']]);

  // Set of characters taught in groups 0..idx (inclusive).
  function knownSet(idx) {
    const s = new Set();
    const last = idx == null ? groups.length - 1 : Math.min(idx, groups.length - 1);
    for (let i = 0; i <= last; i++) groups[i].chars.forEach((c) => s.add(c));
    return s;
  }
  const indexOf = (id) => groups.findIndex((g) => g.id === id);
  const get = (id) => groups.find((g) => g.id === id) || null;
  // Index of the group that introduces ch (or -1).
  const groupOf = (ch) => groups.findIndex((g) => g.chars.includes(ch));
  // True when every character of s has been taught by group idx.
  function usesOnly(s, idx) {
    const k = knownSet(idx);
    return Array.from(s).every((c) => k.has(c));
  }

  return { groups, knownSet, indexOf, get, groupOf, usesOnly };
})();
