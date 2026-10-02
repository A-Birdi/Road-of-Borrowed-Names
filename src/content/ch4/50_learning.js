/* Chapter 4 learning content: story challenges (all four tiers), side-quest
 * challenges, the unaddressed-letters and hearth-orders activities, and
 * region drills tagged 'snowbell'. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const X = C.challenges;
  const o = (en, ok, why) => (why ? { en, ok, why: { en: why } } : { en, ok });
  const oj = (jp, ok, why, en) => Object.assign({ jp, ok }, en ? { en } : {}, why ? { why: { en: why } } : {});

  // ---- Akari's letters, in order -----------------------------------------------------------
  X['sb.c_akari_order'] = { title: { jp: 'アカリ の {手紙|てがみ}', en: 'Akari\'s letters' },
    tiers: {
      F: [
        { kind: 'choose', item: 'v:秋', prompt: { en: 'Held to the lamp, each envelope shows its first words: a season. Summer has just ended. Which season\'s letter comes first?' },
          options: [oj('あき', true, null, 'autumn'), oj('ふゆ', false, 'ふゆ (winter) comes after autumn.', 'winter'), oj('はる', false, 'はる (spring) is months away; the letters stopped before winter.', 'spring')],
          explain: { en: 'あき (aki) = autumn → ふゆ (fuyu) = winter. The first letter begins with the autumn wind.' } },
        { kind: 'write', item: 'v:雪', prompt: { en: 'The last letter asks: "Has the first snow fallen yet?" Complete the word for first snow — hatsu-yuki. Write yuki (snow).' },
          template: { before: 'はつ', after: ' は もう ふりました か 。' }, answer: 'ゆき', accept: ['ゆき', '雪'], mode: 'kana', explain: { jp: 'はつゆき', en: 'はつゆき (初雪) — the first snow of the winter.' } },
      ],
      E: [
        { kind: 'order', item: 'c:sb_akari_order', prompt: { en: 'Put Akari\'s letters in the order she wrote them, from early autumn to early winter.' },
          tiles: ['{秋風|あきかぜ} が {冷|つめ}たく なって きました', '{川|かわ} の {紅葉|もみじ} が {色|いろ}づいて きました', '{朝|あさ} 、 {霜|しも} が {降|お}りる よう に なりました', '{初雪|はつゆき} は もう {降|ふ}りました か'],
          answer: ['{秋風|あきかぜ} が {冷|つめ}たく なって きました', '{川|かわ} の {紅葉|もみじ} が {色|いろ}づいて きました', '{朝|あさ} 、 {霜|しも} が {降|お}りる よう に なりました', '{初雪|はつゆき} は もう {降|ふ}りました か'],
          orderHint: { en: 'Autumn wind → autumn leaves → morning frost → first snow.' }, explain: { en: 'Seasonal openings are like dates: 秋風 (autumn wind), 紅葉 (autumn leaves), 霜 (frost), 初雪 (first snow).' } },
        { kind: 'choose', item: 'c:sb_akari1', ctx: { jp: '{最近|さいきん} 、 {灯|あか}り が {見|み}えない {夜|よる} が あります 。 {心配|しんぱい} です 。', en: 'Lately there are nights I can\'t see the lamp. I\'m worried.' }, prompt: { en: 'The last letter. What is Akari worried about?' },
          options: [o('Some nights she can\'t see the lamp on the mountain.', true), o('She can\'t sleep because of her work.', false, 'Nothing about sleep or work here; 見えない = can\'t see.'), o('The first snow hasn\'t come yet.', false, 'That was her question to her father, not her worry.')],
          explain: { en: '見えない夜があります = "there are nights when (I) can\'t see it". 心配です = "I\'m worried".' } },
      ],
      I: [
        { kind: 'order', item: 'c:sb_akari_order', prompt: { en: 'Put Akari\'s letters in the order she wrote them.' },
          tiles: ['{秋風|あきかぜ} が {冷|つめ}たく なって きました 。 お{父|とう}さん 、 ちゃんと {食|た}べて います か 。', '{川|かわ} の {紅葉|もみじ} が {色|いろ}づいて きました 。 {役所|やくしょ} の {仕事|しごと} に も {慣|な}れました 。', '{朝|あさ} 、 {霜|しも} が {降|お}りる よう に なりました 。 {近頃|ちかごろ} 、 {役所|やくしょ} の {人|ひと} たち が {少|すこ}し {変|へん} です 。', '{初雪|はつゆき} は もう {降|ふ}りました か 。 {無理|むり} しないで ね 。'],
          answer: ['{秋風|あきかぜ} が {冷|つめ}たく なって きました 。 お{父|とう}さん 、 ちゃんと {食|た}べて います か 。', '{川|かわ} の {紅葉|もみじ} が {色|いろ}づいて きました 。 {役所|やくしょ} の {仕事|しごと} に も {慣|な}れました 。', '{朝|あさ} 、 {霜|しも} が {降|お}りる よう に なりました 。 {近頃|ちかごろ} 、 {役所|やくしょ} の {人|ひと} たち が {少|すこ}し {変|へん} です 。', '{初雪|はつゆき} は もう {降|ふ}りました か 。 {無理|むり} しないで ね 。'],
          orderHint: { en: 'Follow the season words, and notice she is already "used to" the office by the second letter.' } },
        { kind: 'choose', item: 'g:register_polite_plain', ctx: { jp: '（ {前|まえ} の {手紙|てがみ} ） お{体|からだ} に {気|き}を つけて ください 。 ／ （ {最後|さいご} の {手紙|てがみ} ） お{父|とう}さん 、 {無理|むり} しないで ね 。', en: '' }, prompt: { en: 'Her earlier letters close politely (〜ください). Why does the last one end 「無理しないでね」 in plain speech?' },
          options: [o('Her worry breaks through: she slips into the way she really talks to her father.', true), o('She is angry with him, so she drops the politeness.', false, 'ね softens and seeks closeness; this is affection, not anger.'), o('Letters must always end in plain speech.', false, 'Her earlier letters end politely; there is no such rule.')],
          explain: { en: 'Grown children often write to parents in です/ます, but emotion pulls them back into everyday plain speech: 〜しないでね is how you\'d say it face to face.' } },
      ],
      A: [
        { kind: 'order', item: 'c:sb_akari_order_a', prompt: { en: 'These are the literary seasonal openings of Akari\'s letters. Put them in the order of the season.' },
          tiles: ['{秋風|あきかぜ} の {身|み} に しみる {頃|ころ} と なりました', '{山|やま} の {紅葉|もみじ} も {見頃|みごろ} を {迎|むか}えた こと でしょう', '{朝晩|あさばん} の {冷|ひ}え{込|こ}み が {厳|きび}しく なって まいりました', '{初雪|はつゆき} の {便|たよ}り が {届|とど}く {頃|ころ}'],
          answer: ['{秋風|あきかぜ} の {身|み} に しみる {頃|ころ} と なりました', '{山|やま} の {紅葉|もみじ} も {見頃|みごろ} を {迎|むか}えた こと でしょう', '{朝晩|あさばん} の {冷|ひ}え{込|こ}み が {厳|きび}しく なって まいりました', '{初雪|はつゆき} の {便|たよ}り が {届|とど}く {頃|ころ}'],
          orderHint: { en: 'The autumn wind "soaking into the body", leaves at their best, sharp morning cold, news of first snow.' } },
        { kind: 'choose', item: 'c:sb_akari_a', ctx: { jp: '{灯|あか}り が {見|み}えない の は 、 きっと {霧|きり} の せい です ね 。 そう {思|おも}う こと に して います 。', en: '' }, prompt: { en: 'What does 「そう思うことにしています」 reveal about Akari?' },
          options: [o('She is choosing to believe it is the mist, because the other explanations frighten her.', true), o('She has checked and confirmed it is the mist.', false, '〜ことにしている is a deliberate decision, not a finding.'), o('She thinks her father has become lazy.', false, 'Nothing blames him; the worry is for him.')],
          explain: { en: '〜ことにしている = "I make a point of / I have decided to…". Paired with きっと, it shows reassurance she is giving herself.' } },
      ],
    } };

  // ---- the hearth: ほのお -------------------------------------------------------------
  const honooTeach = { title: 'New inscription: ほのお', jp: '{炎|ほのお}', en: 'Flame — the visible tongues of a fire. In Inkweaving it warms against cold and also gives light. (火 ひ is fire in general.)' };
  const honooWrite = (en) => ({ kind: 'write', item: 'v:炎', prompt: { en }, answer: 'ほのお', accept: ['ほのお', '炎'], mode: 'reading', teach: honooTeach, explain: { jp: '{炎|ほのお}', en: 'ほのお — flame.' } });
  X['sb.c_honoo'] = { title: { jp: '{囲炉裏|いろり} の {炎|ほのお}', en: 'The hearth flame' },
    tiers: {
      F: [Object.assign(honooWrite('The hearth needs the word for flame: honoo. Write it.'), { mode: 'kana' })],
      E: [
        { kind: 'choose', item: 'v:炎', ctx: { jp: '{火|ひ} は ある 。 でも 、 {炎|ほのお} が {上|あ}がらない 。', en: 'There is fire. But no flames rise.' }, prompt: { en: 'Which word means the flame itself — the tongues of fire you can see?' },
          options: [oj('{炎|ほのお}', true, null, 'flame'), oj('{灰|はい}', false, '灰 (はい) is ash.', 'ash'), oj('{煙|けむり}', false, '煙 (けむり) is smoke.', 'smoke')],
          explain: { en: '火 (ひ) is fire in general; 炎 (ほのお) is the flame you can see.' } },
        honooWrite('Now write it on the ash: honoo (flame).'),
      ],
      I: [
        { kind: 'choose', item: 'c:sb_hearth_i', ctx: { jp: '{火|ひ} は {消|き}えて いない のに 、 {炎|ほのお} が {上|あ}がらない 。 {寒|さむ}さ に {押|お}さえつけられて いる みたい 。', en: '' }, prompt: { en: 'What is Yae describing?' },
          options: [o('The fire is still alive, but the cold is holding the flames down.', true), o('The fire has gone out completely.', false, '消えていない = has NOT gone out.'), o('The flames are too high to control.', false, '上がらない = do not rise.')],
          explain: { en: '〜のに = "even though"; 押さえつけられている = "is being pressed down" (passive); みたい = "it seems".' } },
        honooWrite('Write the word that will lift the flames: honoo (hiragana or kanji).'),
      ],
      A: [
        { kind: 'choose', item: 'c:sb_hearth_a', ctx: { jp: '{炭|すみ} は {火|ひ} を {抱|いだ}いて も 、 {炎|ほのお} は {見|み}せない 。 {人|ひと} も また {然|しか}り 、 だ 。', en: '' }, prompt: { en: 'Denji mutters a saying of his own while the fire sinks. What does he mean?' },
          options: [o('Like embers, a person can hold warmth inside without ever showing it.', true), o('Charcoal is useless unless it flames.', false, 'He says the embers do hold fire (火を抱く).'), o('People should always show what they feel.', false, 'He describes, rather than prescribes — and the point is the hidden warmth.')],
          explain: { en: '〜ても = even if; 然り (しかり, literary) = "it is so"; 〜もまた然り = "the same is true of…".' } },
        honooWrite('Write the inscription on the ash: honoo (hiragana or kanji).'),
      ],
    } };

  X['sb.c_melt'] = { title: { jp: '{石段|いしだん} の {氷|こおり}', en: 'The iced stair' },
    tiers: {
      F: [Object.assign(honooWrite('Melt the ice with the flame word: honoo.'), { mode: 'kana' })],
      E: [Object.assign(honooWrite('The stair is sealed in ice. Write the word for flame (honoo).'), { ctx: { jp: '{氷|こおり} を とかす {言葉|ことば} は ？', en: 'Which word will melt the ice?' } })],
      I: [Object.assign(honooWrite('Write the word that answers ice (hiragana or kanji).'), { ctx: { jp: '{昨夜|ゆうべ} {囲炉裏|いろり} に {書|か}いた {字|じ} なら 、 {氷|こおり} も とける はず だ 。', en: 'The word you wrote on the hearth last night should melt ice too.' } })],
      A: [Object.assign(honooWrite('Write the inscription (hiragana or kanji).'), { ctx: { jp: '{凍|い}て{付|つ}いた {石段|いしだん} を {解|と}く に は 、 {冷|つめ}たさ に {抗|あらが}う {言葉|ことば} を {以|もっ}て する ほか ない 。', en: '' } })],
    } };

  // ---- the dial door: directions and times --------------------------------------------------
  X['sb.c_dial'] = { title: { jp: '{奥|おく} の {扉|とびら}', en: 'The dial door' },
    tiers: {
      F: [
        { kind: 'choose', item: 'v:南', ctx: { jp: 'ふゆ の よる 、 つづみぼし は みなみ の そら に みえる 。', en: 'On winter nights, the Drum Stars can be seen in the southern sky.' }, prompt: { en: 'The door opens for one who knows which way to look. Which way should the needle point?' },
          options: [oj('みなみ', true, null, 'south'), oj('きた', false, 'きた is north.', 'north'), oj('ひがし', false, 'ひがし is east.', 'east')],
          explain: { en: 'みなみ = south, きた = north, ひがし = east, にし = west.' } },
        { kind: 'write', item: 'v:南', prompt: { en: 'Engrave the direction on the dial: minami (south).' }, answer: 'みなみ', accept: ['みなみ', '南'], mode: 'kana', explain: { jp: '{南|みなみ}', en: 'みなみ — south.' } },
      ],
      E: [
        { kind: 'choose', item: 'v:南', ctx: { jp: '{冬|ふゆ} の {夜|よる} {九時|くじ} ごろ 、 {鼓星|つづみぼし} は {南|みなみ} の {空|そら} に {見|み}える 。 {奥|おく} の {扉|とびら} は 、 {見|み}る べき {方角|ほうがく} を {知|し}る {者|もの} に {開|ひら}く 。', en: 'On winter nights around nine, the Drum Stars can be seen in the southern sky. The inner door opens for one who knows which way to look.' }, prompt: { en: 'Which way should the needle point?' },
          options: [o('South', true), o('North', false, '北 (きた) is north; the rule says 南.'), o('East', false, '東 (ひがし) is east.'), o('West', false, '西 (にし) is west.')], explain: { en: '南 (みなみ) = south.' } },
        { kind: 'choose', item: 'g:counters', ctx: { jp: '{九時|くじ} ごろ', en: '' }, prompt: { en: 'And at what time does the rule say to look?' },
          options: [o('About nine o\'clock', true), o('About seven o\'clock', false, 'Seven o\'clock is 七時 (しちじ).'), o('About four o\'clock', false, 'Four o\'clock is 四時 (よじ).')], explain: { en: '九時 is read くじ (not きゅうじ); ごろ = "around, about" a point in time.' } },
      ],
      I: [
        { kind: 'choose', item: 'c:sb_dial_i', ctx: { jp: '{鼓星|つづみぼし} は 、 {夕方|ゆうがた} に は {東|ひがし} の {空|そら} に {低|ひく}く 、 {九時|くじ} ごろ に は {南|みなみ} の {空|そら} {高|たか}く 、 {明|あ}け{方|がた} に は {西|にし} に {沈|しず}む 。 {扉|とびら} の {針|はり} は 、 {九時|くじ} の {鼓星|つづみぼし} に {合|あ}わせる こと 。', en: '' }, prompt: { en: 'Where should the needle point?' },
          options: [o('South — where the Drum Stars are at nine.', true), o('East — where they are in the early evening.', false, '夕方 (evening) is east; the needle is set for 九時.'), o('West — where they set.', false, '明け方 (dawn) is when they set in the west.')],
          explain: { en: '〜には = "at (that time), as for…"; 〜に合わせること = written instruction: "(you are to) set it to…".' } },
        { kind: 'choose', item: 'c:sb_dial_i2', prompt: { en: 'According to the same board, what happens to the Drum Stars at dawn?' },
          options: [o('They set in the west.', true), o('They rise in the east.', false, 'Rising low in the east is 夕方, the early evening.'), o('They stand high in the south.', false, 'That is around nine.')], explain: { en: '明け方 = dawn; 沈む = to sink, set.' } },
      ],
      A: [
        { kind: 'choose', item: 'c:sb_dial_a', ctx: { jp: '{鼓星|つづみぼし} が {真南|まみなみ} に {来|く}る の は 、 {十二月|じゅうにがつ} の {半|なか}ば なら {真夜中|まよなか} で ある 。 {星|ほし} は {一月|ひとつき} に {約|やく} {二時間|にじかん} ずつ {早|はや}く {同|おな}じ {位置|いち} に {来|く}る 。 {扉|とびら} は 、 {二月|にがつ} の {半|なか}ば 、 {夜|よる} {八時|はちじ} に {鼓星|つづみぼし} の ある {方角|ほうがく} に {針|はり} を {合|あ}わせれば {開|ひら}く 。', en: '' }, prompt: { en: 'Where should the needle point?' },
          options: [o('Due south: two months after mid-December, it reaches south about four hours earlier — around 8 p.m.', true), o('East: at 8 p.m. it has only just risen.', false, 'That forgets the monthly shift: 一月に約二時間ずつ早く.'), o('West: by February it has already set.', false, 'It reaches the same place earlier each month, not a different one.')],
          explain: { en: '〜ずつ = "(by) … each"; 一月に約二時間ずつ早く = "about two hours earlier each month". (This is real: stars rise about four minutes earlier each night.)' } },
        { kind: 'choose', item: 'c:sb_dial_a2', prompt: { en: 'Which paraphrase matches 「一月に約二時間ずつ早く同じ位置に来る」?' },
          options: [o('Each month it arrives at the same spot roughly two hours earlier.', true), o('It moves two hours\' distance every month.', false, '位置 is the position; 早く modifies 来る (arrives earlier).'), o('It stays in the same position for about two hours.', false, 'Nothing about staying; the sentence is about arriving earlier.')] },
      ],
    } };

  // ---- the observing log: the light that doesn't move ---------------------------------------
  const logE = '{午後|ごご} {八時|はちじ} ： {東|ひがし} に {赤|あか}い {星|ほし} 。 {南東|なんとう} の {低|ひく}い ところ に {白|しろ}い {光|ひかり} 。 ／ {午後|ごご} {十時|じゅうじ} ： {赤|あか}い {星|ほし} は {南東|なんとう} へ {上|のぼ}った 。 {白|しろ}い {光|ひかり} は {同|おな}じ ところ 。 ／ {午前|ごぜん} {零時|れいじ} ： {赤|あか}い {星|ほし} は {南|みなみ} 。 {白|しろ}い {光|ひかり} は まだ {南東|なんとう} 。 {動|うご}かない 。';
  const logI = '{午後|ごご} {八時|はちじ} 、 {東|ひがし} の {地平|ちへい} に {赤|あか}い {星|ほし} 。 {南東|なんとう} 、 {高|たか}さ {五度|ごど} に {白|しろ}い {光|ひかり} 。 {十時|じゅうじ} 、 {赤|あか}い {星|ほし} が {南東|なんとう} に {来|き}て 、 {白|しろ}い {光|ひかり} と {並|なら}ぶ 。 どちら が どちら か 、 {一瞬|いっしゅん} {迷|まよ}う 。 {零時|れいじ} 、 {赤|あか}い {星|ほし} は {南|みなみ} の {空|そら} {高|たか}く 。 {白|しろ}い {光|ひかり} は {南東|なんとう} 、 {高|たか}さ {五度|ごど} の まま 。 {星|ほし} に {非|あら}ず 。';
  const drawer = (item) => ({ kind: 'choose', item, prompt: { en: 'Hoshino\'s note to Denji: the key is in "the drawer for the direction of the light that isn\'t a star". Which drawer?' },
    options: [oj('{南東|なんとう}', true, null, 'southeast'), oj('{南|みなみ}', false, 'South is where the red star ended up at midnight.', 'south'), oj('{東|ひがし}', false, 'East is where the red star was at eight.', 'east'), oj('{北|きた}', false, 'Nothing in the log is in the north.', 'north')],
    explain: { en: '南東 (なんとう) = southeast: 南 south + 東 east.' } });
  X['sb.c_log'] = { title: { jp: '{観測|かんそく} {日誌|にっし}', en: 'The observing log' },
    tiers: {
      F: [
        { kind: 'choose', item: 'c:sb_log_f', ctx: { jp: 'はちじ ： あかい ほし は ひがし 。 しろい ひかり は なんとう 。 ／ じゅうじ ： あかい ほし は なんとう 。 しろい ひかり も なんとう 。 ／ れいじ ： あかい ほし は みなみ 。 しろい ひかり は まだ なんとう 。', en: '8:00 — red star: east. White light: southeast. / 10:00 — red star: southeast. White light: southeast too. / 0:00 — red star: south. White light: still southeast.' }, prompt: { en: 'Stars move across the sky during the night. Which light did NOT move?' },
          options: [oj('しろい ひかり', true, null, 'the white light'), oj('あかい ほし', false, 'The red star went east → southeast → south.', 'the red star')] },
        { kind: 'write', item: 'v:白い', prompt: { en: 'Write the colour of the light that stayed put: shiroi (white).' }, template: { before: '', after: ' ひかり' }, answer: 'しろい', accept: ['しろい', '白い'], mode: 'kana', explain: { jp: 'しろい ひかり', en: 'しろい = white. It never moved, so it isn\'t a star.' } },
        drawer('v:南東'),
      ],
      E: [
        { kind: 'choose', item: 'c:sb_log_e', ctx: { jp: logE, en: '8 p.m.: a red star in the east; a white light low in the southeast. / 10 p.m.: the red star has climbed to the southeast; the white light is in the same place. / Midnight: the red star is south; the white light is still southeast. It does not move.' }, prompt: { en: 'Which one is not a star?' },
          options: [o('The white light — it stayed in the same place all night.', true), o('The red star — it changed direction.', false, 'Changing position through the night is exactly what stars do.')], explain: { en: '動かない = does not move. 同じところ = the same place.' } },
        drawer('v:南東'),
      ],
      I: [
        { kind: 'choose', item: 'c:sb_log_i', ctx: { jp: logI, en: '' }, prompt: { en: 'At ten, both are in the southeast. Why does Hoshino end with 「星に非ず」 (not a star)?' },
          options: [o('Because it kept exactly the same position while everything else moved with the hours.', true), o('Because it was white instead of red.', false, 'Many stars are white; colour isn\'t his reason.'), o('Because it was low in the sky.', false, 'Stars can be low too; the point is that it never moved.')],
          explain: { en: '並ぶ = to line up side by side; 〜のまま = "remaining as…"; 非ず (あらず) is literary for ではない.' } },
        drawer('v:南東'),
      ],
      A: [
        { kind: 'choose', item: 'c:sb_log_a', ctx: { jp: 'あれ が {星|ほし} で ない と すれば 、 {誰|だれ} か が {山|やま} の {上|うえ} で {火|ひ} を {絶|た}やさず に いる と いう こと に なる 。 {七年|しちねん} {見|み}て きた が 、 {一晩|ひとばん} たりとも {消|き}えた こと は ない 。 {守|まも}る {者|もの} の {執念|しゅうねん} か 、 あるいは …… 。', en: '' }, prompt: { en: 'A note added later below the log, in newer ink. What does Hoshino conclude?' },
          options: [o('Someone up on the mountain is keeping a fire burning and has never once let it go out.', true), o('It must be a traveller\'s campfire.', false, '一晩たりとも消えたことはない: seven years without a single dark night rules out a passing campfire.'), o('It is a star after all, too faint to see move.', false, '〜とすれば starts from the premise that it is NOT a star.')],
          explain: { en: '〜とすれば = "if (we suppose)…"; 絶やさずにいる = "keeps (it) from dying out"; 〜ということになる = "that means…".' } },
        { kind: 'choose', item: 'c:sb_log_a2', prompt: { en: 'What is the force of 「一晩たりとも消えたことはない」?' },
          options: [o('Not even for a single night has it ever gone out.', true), o('It went out for one night only.', false, '〜たりとも〜ない is emphatic negation: "not even one".'), o('It goes out every night for a while.', false, 'The sentence denies that it has ever gone out.')] },
        drawer('v:南東'),
      ],
    } };

  // ---- the hatch crank: order of operations ----------------------------------------------------
  const noteE = { jp: '{先|さき} に 、 ハンドル を {火|ひ} で よく あたためる こと 。 {次|つぎ} に 、 {右|みぎ} へ {三回|さんかい} 。 {最後|さいご} に 、 {左|ひだり} へ {一回|いっかい} {戻|もど}す 。', en: 'First, warm the handle well with fire. Next, three turns to the right. Last, one turn back to the left.' };
  const crankOrder = (tiles, item, en) => ({ kind: 'order', item: item || 'c:sb_crank', prompt: { en: en || 'Put the steps from Denji\'s note in order.' }, tiles: tiles.slice().reverse(), answer: tiles.slice(), orderHint: { en: 'Look for 先に (first), 次に (next) and 最後に (last).' } });
  X['sb.c_crank'] = { title: { jp: '{蓋|ふた} の ハンドル', en: 'The hatch handle' },
    tiers: {
      F: [Object.assign(crankOrder(['あたためる', 'みぎ に さんかい', 'ひだり に いっかい'], 'c:sb_crank_f', 'Denji\'s note: first warm the handle, then three turns right, then one turn left. Put the steps in order.'), { ctx: { jp: 'さき に あたためる 。 つぎ に みぎ に さんかい 。 さいご に ひだり に いっかい 。', en: 'First warm it. Next, three times to the right. Last, once to the left.' } }),
        { kind: 'write', item: 'v:右', prompt: { en: 'Which way do you turn it three times? Write migi (right).' }, answer: 'みぎ', accept: ['みぎ', '右'], mode: 'kana', explain: { jp: '{右|みぎ}', en: 'みぎ = right; ひだり = left.' } }],
      E: [Object.assign(crankOrder(['{火|ひ} で あたためる', '{右|みぎ} へ {三回|さんかい}', '{左|ひだり} へ {一回|いっかい}']), { ctx: noteE }),
        { kind: 'choose', item: 'c:sb_crank_e', ctx: { jp: '{凍|こお}った まま {回|まわ}す と 、 {軸|じく} が {折|お}れる 。', en: '' }, prompt: { en: 'Why must you warm the handle first?' },
          options: [o('If you turn it while frozen, the shaft will snap.', true), o('Because warm handles turn faster.', false, 'Nothing about speed; 折れる = to snap.'), o('Because it is too cold to hold.', false, 'The note is about the shaft (軸), not your hands.')], explain: { en: '〜たまま = "while still…"; 〜と = "if/when (then naturally)…".' } }],
      I: [Object.assign(crankOrder(['{火|ひ} で あたためる', '{右|みぎ} へ {三回|さんかい}', '{左|ひだり} へ {一回|いっかい}']), { ctx: noteE }),
        { kind: 'choose', item: 'c:sb_crank_i', ctx: { jp: '{逆|ぎゃく} に する な 。 ホシノ 、 お{前|まえ} の こと だ 。', en: '' }, prompt: { en: 'What is Denji implying with the last two lines?' },
          options: [o('Hoshino has done it the wrong way round before.', true), o('Hoshino is the only one allowed to open the hatch.', false, 'お前のことだ = "I mean you" — it singles him out for the warning.'), o('Hoshino wrote the instructions himself.', false, 'Denji wrote them, addressing Hoshino.')], explain: { en: '〜するな = blunt prohibition "don\'t…"; 〜のことだ = "(it\'s) about…, I mean…".' } }],
      A: [Object.assign(crankOrder(['{火|ひ} で あたためる', '{右|みぎ} へ {三回|さんかい}', '{左|ひだり} へ {一回|いっかい}']), { ctx: { jp: '{凍|こお}った まま {回|まわ}そう もの なら 、 {軸|じく} が {折|お}れ かねない 。 {必|かなら}ず {火|ひ} で あたためて から 、 {右|みぎ} へ {三|み}たび 、 しかるのち {左|ひだり} へ {一|ひと}たび {戻|もど}す べし 。', en: '' } }),
        { kind: 'choose', item: 'g:adv_kanenai', prompt: { en: 'What does 「回そうものなら、軸が折れかねない」 convey?' },
          options: [o('If you were to try turning it, the shaft could well snap.', true), o('Even if you turn it, the shaft won\'t break.', false, '〜かねない warns of a real risk; it doesn\'t deny one.'), o('You should turn it until the shaft breaks.', false, 'ものなら introduces a hypothetical with bad consequences.')], explain: { en: '〜ようものなら = "if one should (dare to)…"; 〜かねない = "could well (happen)". 三たび/一たび = three times/once (literary).' } }],
    } };

  // ---- writing Akari's name ------------------------------------------------------------------
  const nameWrite = (en) => ({ kind: 'write', item: 'v:明かり', prompt: { en }, answer: 'あかり', accept: ['あかり', 'アカリ', '明かり', '灯り'], mode: 'kana', explain: { jp: 'あかり', en: 'あかり — Akari\'s name, and also the word for "light".' } });
  X['sb.c_name'] = { title: { jp: '{笠|かさ} の {名前|なまえ}', en: 'The name on the shade' },
    tiers: {
      F: [nameWrite('Write her name on the lamp\'s shade: a-ka-ri.')],
      E: [
        { kind: 'choose', item: 'v:明かり', ctx: { jp: 'あかり が {帰|かえ}る まで 、 この {灯|あか}り を {消|け}さない 。', en: 'I won\'t let this lamp go out until Akari comes home.' }, prompt: { en: 'Hoshino\'s promise. His daughter\'s name is also an ordinary word. What does あかり mean?' },
          options: [o('A light; a lamp', true), o('A star', false, 'A star is ほし.'), o('A road home', false, 'A way home is かえりみち.')], explain: { en: '明かり / 灯り (あかり) = a light, a lamp.' } },
        nameWrite('Write her name on the shade (あかり).'),
      ],
      I: [
        { kind: 'choose', item: 'c:sb_name_i', ctx: { jp: '{名前|なまえ} に 「 {明|あ}かり 」 と いう {意味|いみ} を {込|こ}めた の は 、 {暗|くら}い {山|やま} で も {迷|まよ}わない よう に と {願|ねが}った から だ 。', en: '' }, prompt: { en: 'Why did Hoshino choose that name?' },
          options: [o('He hoped she would never lose her way, even in the dark mountains.', true), o('She was born on a night the lamp was lit.', false, 'The reason given is a wish: 願ったから.'), o('He wanted her to become an astronomer.', false, 'Nothing about her work.')], explain: { en: '〜という意味を込める = "to put the meaning … into"; 〜ように願う = "to wish that…".' } },
        nameWrite('Write her name on the shade (kana).'),
      ],
      A: [
        { kind: 'choose', item: 'c:sb_name_a', ctx: { jp: '{灯|ひ} は {名|な} を {守|まも}り 、 {名|な} は {灯|ひ} に {守|まも}られる 。 {互|たが}い に {依|よ}って {立|た}つ もの で ある 。', en: '' }, prompt: { en: 'A line on the lamp\'s base. What relationship does it describe?' },
          options: [o('Each keeps the other: the lamp holds the name up, and the name keeps the lamp alight.', true), o('The lamp is more important than the name.', false, '互いに依って立つ = they stand by relying on each other.'), o('Names should never be written on lamps.', false, 'It describes a bond, not a prohibition.')], explain: { en: '〜に依って立つ = "to stand upon, rest on"; 互いに = mutually.' } },
        nameWrite('Write her name on the shade (kana).'),
      ],
    } };

  // ---- Hoshino's reply: register in family letters -----------------------------------------------
  X['sb.c_reply'] = { title: { jp: 'ホシノ の {返事|へんじ}', en: 'Hoshino\'s reply' },
    tiers: {
      F: [
        { kind: 'choose', item: 'g:register_polite_plain', prompt: { en: 'How should a father begin a letter to his daughter?' },
          options: [oj('あかり へ', true, null, 'To Akari'), oj('あかり さま', false, 'さま is for customers and formal letters; stiff between father and daughter.', 'Dear Ms Akari'), oj('はいけい', false, 'はいけい (拝啓) opens formal letters.', 'Dear Sir/Madam (formal)')] },
        { kind: 'write', item: 'v:元気', prompt: { en: 'He asks how she is. Write genki (well, in good health).' }, template: { before: '', after: ' に して いる かい 。' }, answer: 'げんき', accept: ['げんき', '元気'], mode: 'kana', explain: { jp: 'げんき に して いる かい', en: '"Are you keeping well?" — かい is a gentle, slightly old-fashioned question ending.' } },
      ],
      E: [
        { kind: 'choose', item: 'g:register_polite_plain', prompt: { en: 'Which line sounds like a father writing to his grown daughter?' },
          options: [oj('{元気|げんき} に して いる かい 。', true, null, 'Are you keeping well?'), oj('お{元気|げんき} で いらっしゃいます か 。', false, 'Very respectful — the way you\'d write to a superior.', 'Are you well? (very respectful)'), oj('{元気|げんき} か 。 {返事|へんじ} を よこせ 。', false, 'Curt and demanding: よこせ is a rough command.', 'You well? Write back.')] },
        { kind: 'choose', item: 'g:v_nakereba', prompt: { en: 'He wants to say: "You don\'t need to worry about me."' },
          options: [oj('わたし の こと は {心配|しんぱい} しなくて いい よ 。', true), oj('わたし の こと を {心配|しんぱい} して ください 。', false, 'That asks her TO worry.'), oj('わたし は {心配|しんぱい} です 。', false, 'That says he is worried.')], explain: { en: '〜なくていい = "(you) don\'t have to…".' } },
      ],
      I: [
        { kind: 'choose', item: 'c:sb_reply_i', prompt: { en: 'Hoshino will not write anything untrue. Which line keeps his promise honestly?' },
          options: [oj('{灯|あか}り は 、 {今夜|こんや} も ついて いる よ 。', true, null, 'The lamp is lit tonight as well.'), oj('{灯|あか}り は {一度|いちど} も {消|き}えなかった よ 。', false, 'It did go out for ten nights — that would be a comforting lie.', 'The lamp never once went out.'), oj('{灯|あか}り の こと は {忘|わす}れなさい 。', false, 'He wants her to keep looking for it.', 'Forget about the lamp.')] },
        { kind: 'choose', item: 'g:register_polite_plain', prompt: { en: 'Akari writes in です/ます; Hoshino writes in plain speech. Why the difference?' },
          options: [o('A parent usually writes to a child in plain speech; a grown child often keeps some politeness in writing.', true), o('Hoshino is being rude on purpose.', false, 'Plain speech within a family is warm and normal.'), o('Plain speech is required in letters from the mountains.', false, 'There\'s no such rule; it\'s about relationship and register.')] },
      ],
      A: [
        { kind: 'choose', item: 'c:sb_reply_a', ctx: { jp: '{寒|さむ}さ {厳|きび}しき {折|おり} 、 くれぐれも ご{自愛|じあい} ください 。', en: '' }, prompt: { en: 'Hoshino frowns at his first draft and crosses it out. Why?' },
          options: [o('It\'s a formal set phrase ("in this severe cold, please take good care of yourself") — right for business letters, stiff from a father.', true), o('It\'s grammatically wrong.', false, '厳しき is a correct literary attributive form of 厳しい.'), o('It sounds as if he doesn\'t care.', false, 'The meaning is caring; the register is the problem.')], explain: { en: '〜の折 = "at this time of…"; ご自愛ください = "please take care of yourself" (formal letters).' } },
        { kind: 'choose', item: 'g:register_polite_plain', prompt: { en: 'Which rewrite says the same thing in his own voice?' },
          options: [oj('{寒|さむ}い から 、 {温|あたた}かく して {寝|ね}る んだ よ 。', true, null, 'It\'s cold, so keep warm when you sleep.'), oj('{寒冷|かんれい} の {候|こう} 、 {貴殿|きでん} の ご{健勝|けんしょう} を お{祈|いの}り {申|もう}し{上|あ}げます 。', false, 'Even more formal: a letter to an important stranger.', 'In this cold season, I pray for your good health (very formal).'), oj('{寝|ね}ろ 。', false, 'Blunt to the point of rudeness.', 'Sleep.')] },
      ],
    } };

  // ---- side quests ---------------------------------------------------------------------------
  X['sb.c_goat_note'] = { title: { jp: 'ナツメ の {書|か}き{置|お}き', en: 'Natsume\'s note' },
    tiers: {
      F: [
        { kind: 'choose', item: 'c:sb_goat_f', ctx: { jp: 'テツジ おじさん へ 。 よる 、 モモ が こヤギ を にひき うみました 。 にひき とも げんき です 。 ナツメ', en: 'Uncle Tetsuji — In the night, Momo gave birth to two kids. Both are healthy. Natsume' }, prompt: { en: 'What happened in the night?' },
          options: [o('Momo gave birth to two kids.', true), o('Two goats ran away.', false, 'うみました = gave birth.'), o('Two goats came from another farm.', false, 'Nothing about another farm.')] },
        { kind: 'write', item: 'g:counters', prompt: { en: 'How many kids? Write "two" with the counter for small animals: nihiki.' }, answer: 'にひき', accept: ['にひき', '二匹', '2匹', '２匹'], mode: 'kana', explain: { jp: 'にひき', en: '二匹 (にひき) — two (small animals). 匹 changes sound: いっぴき, にひき, さんびき.' } },
      ],
      E: [
        { kind: 'choose', item: 'g:counters', ctx: { jp: 'テツジ {伯父|おじ} さん へ 。 {夜中|よなか} に モモ が {子|こ}ヤギ を {二匹|にひき} {産|う}みました 。 {二匹|にひき} とも {元気|げんき} です 。 わら を {多|おお}め に {入|い}れて ください 。 ナツメ', en: '' }, prompt: { en: 'Tetsuji owns ten goats. How many are in his shed now?' },
          options: [o('Twelve — ten, plus two newborn kids.', true), o('Ten — the two extra belong to someone else.', false, '産みました: Momo gave birth to them. They\'re his.'), o('Eight — two are missing.', false, 'Nobody is missing.')] },
        { kind: 'choose', item: 'g:v_te_kudasai', prompt: { en: 'What does Natsume ask Tetsuji to do?' },
          options: [o('Put in extra straw.', true), o('Count the goats again.', false, 'わらを多めに入れてください = please put in extra straw.'), o('Wake her up.', false, 'Nothing about waking her.')], explain: { en: '多めに = "a bit more than usual"; 〜てください = please do.' } },
      ],
      I: [
        { kind: 'choose', item: 'c:sb_goat_i', ctx: { jp: '{伯父|おじ} さん が {起|お}きる {前|まえ} に {書|か}いて おきます 。 {夜中|よなか} に モモ が {産気|さんけ}づいて 、 {明|あ}け{方|がた} に {二匹|にひき} {生|う}まれました 。 {母子|ぼし} とも {無事|ぶじ} です 。 {数|かぞ}えたら {十二|じゅうに} に なって いる はず なので 、 {驚|おどろ}かない で ね 。', en: '' }, prompt: { en: 'Why does Natsume tell him not to be surprised?' },
          options: [o('Because if he counts, there should now be twelve.', true), o('Because Momo is ill.', false, '母子とも無事 = mother and kids are both fine.'), o('Because she moved the goats to another shed.', false, 'Nothing was moved.')], explain: { en: '〜はず = "should be (by my reckoning)"; 〜ので = because.' } },
        { kind: 'choose', item: 'c:sb_goat_i2', prompt: { en: 'What does 「母子とも無事です」 mean?' },
          options: [o('Mother and young are both safe and well.', true), o('The mother is fine but the kids are weak.', false, 'とも = both.'), o('Nobody knows how they are yet.', false, '無事 = safe, without mishap.')] },
      ],
      A: [
        { kind: 'choose', item: 'c:sb_goat_a', ctx: { jp: '{伯父|おじ} さん は たぶん {先|さき} に {数|かず} を {数|かぞ}えて から この {紙|かみ} に {気|き}づく と {思|おも}う ので 、 {先回|さきまわ}り して {言|い}って おきます 。 {増|ふ}えた {分|ぶん} は 、 {誰|だれ} か の ヤギ で は ありません 。 {強|し}いて {言|い}えば 、 モモ の です 。', en: '' }, prompt: { en: 'What is Natsume anticipating?' },
          options: [o('That he\'ll count first, find extra goats, and assume they belong to someone else.', true), o('That he will never read the note.', false, 'She expects him to notice it — after counting.'), o('That he\'ll be angry she let goats in.', false, 'She says the extra ones aren\'t anyone else\'s.')], explain: { en: '先回りして言っておく = "to say it in advance, heading (him) off".' } },
        { kind: 'choose', item: 'c:sb_goat_a2', prompt: { en: 'What is the tone of 「強いて言えば、モモのです」?' },
          options: [o('Wry: "if I had to say whose they are — Momo\'s."', true), o('Angry: she blames Momo.', false, '強いて言えば = "if forced to say"; it\'s a joke.'), o('Uncertain: she doesn\'t know which goat gave birth.', false, 'She names Momo plainly.')] },
      ],
    } };

  X['sb.c_bell_board'] = { title: { jp: 'フキ の {帳面|ちょうめん}', en: 'Fuki\'s notebook' },
    tiers: {
      F: [
        { kind: 'choose', item: 'c:sb_bell_f', ctx: { jp: 'あさ しちじ ： いっかい 。 ひる じゅうにじ ： にかい 。 ゆうがた ごじ ： さんかい （ ヤギ を こや に いれる ） 。', en: '7 a.m.: once. Noon: twice. 5 p.m.: three times (bring the goats into the shed).' }, prompt: { en: 'It\'s almost noon. How many times do you ring?' },
          options: [oj('にかい', true, null, 'twice'), oj('いっかい', false, 'いっかい is the morning signal.', 'once'), oj('さんかい', false, 'さんかい is the evening goat signal.', 'three times')] },
        { kind: 'write', item: 'g:counters', prompt: { en: 'Write it on the blank board: nikai (two times).' }, answer: 'にかい', accept: ['にかい', '二回', '2回', '２回'], mode: 'kana', explain: { jp: 'にかい', en: '回 (かい) counts times: いっかい, にかい, さんかい.' } },
      ],
      E: [
        { kind: 'choose', item: 'g:counters', ctx: { jp: '{朝|あさ} {七時|しちじ} に {一回|いっかい} 。 {昼|ひる} {十二時|じゅうにじ} に {二回|にかい} 。 {夕方|ゆうがた} {五時|ごじ} に {三回|さんかい} 、 ヤギ を {小屋|こや} に {入|い}れる {合図|あいず} 。 {吹雪|ふぶき} が {来|く}る とき は 、 {短|みじか}く {何度|なんど} も 。', en: '' }, prompt: { en: 'It\'s almost noon. How many strokes?' },
          options: [o('Two', true), o('One', false, 'One is at seven in the morning.'), o('Three', false, 'Three is at five in the evening.')] },
        { kind: 'choose', item: 'c:sb_bell_e', prompt: { en: 'What do three strokes at five o\'clock mean?' },
          options: [o('Time to bring the goats into the shed.', true), o('A storm is coming.', false, 'The storm signal is short strokes, again and again.'), o('Lunchtime.', false, 'Lunch is the noon bell.')], explain: { en: '合図 (あいず) = signal. 小屋に入れる = put into the shed.' } },
      ],
      I: [
        { kind: 'choose', item: 'c:sb_bell_i', ctx: { jp: '{昼|ひる} の {鐘|かね} は {二|ふた}つ 。 ただし 、 {吹雪|ふぶき} が {近|ちか}づいて いる とき は 、 {昼|ひる} で も {短|みじか}く {何度|なんど} も {鳴|な}らす こと 。 {迷子|まいご} が {出|で}た とき は 、 {長|なが}く {一|ひと}つ 、 {間|ま} を {置|お}いて また {一|ひと}つ 。 {見|み}つかる まで {続|つづ}ける 。', en: '' }, prompt: { en: 'It\'s noon, but a storm is closing in. How do you ring?' },
          options: [o('Short strokes, again and again.', true), o('Two strokes, as always at noon.', false, 'ただし introduces the exception: 昼でも (even at noon).'), o('One long stroke, a pause, then another.', false, 'That is for someone who is lost.')], explain: { en: 'ただし = "however, provided that"; 〜でも = "even (at)…".' } },
        { kind: 'choose', item: 'c:sb_bell_i2', prompt: { en: 'Someone is lost. When do you stop ringing?' },
          options: [o('When they are found.', true), o('After two long strokes.', false, '見つかるまで続ける = keep going until (they) are found.'), o('At five o\'clock.', false, 'The lost signal has no set time.')] },
      ],
      A: [
        { kind: 'choose', item: 'c:sb_bell_a', ctx: { jp: '{鐘|かね} は {時|とき} を {告|つ}げる ため だけ に ある の で は ない 。 {吹雪|ふぶき} の {夜|よる} に は 、 {音|おと} そのもの が {道|みち} と なる 。 {鳴|な}らす {者|もの} は 、 {聞|き}く {者|もの} の {足元|あしもと} を {思|おも}え 。', en: '' }, prompt: { en: 'The first page of Fuki\'s notebook. What does she mean by 「音そのものが道となる」?' },
          options: [o('When no one can see, the sound itself guides people home.', true), o('The bell\'s sound clears the snow off the road.', false, 'Figurative: the sound becomes the way.'), o('Ringing the bell is only about telling the time.', false, 'She says it is NOT only for telling the time (だけにあるのではない).')], explain: { en: '〜ためだけにあるのではない = "doesn\'t exist only for…"; 〜と(なる) = "becomes"; 思え = "think of (it)!" (imperative).' } },
        { kind: 'choose', item: 'g:counters', ctx: { jp: '{朝|あさ} {七時|しちじ} {一|ひと}つ 、 {正午|しょうご} {二|ふた}つ 、 {夕|ゆう} {五時|ごじ} {三|みっ}つ 。', en: '' }, prompt: { en: 'The schedule itself. How many strokes at noon (正午)?' },
          options: [o('Two', true), o('One', false, '一つ is at seven.'), o('Three', false, '三つ is at five in the evening.')], explain: { en: '正午 (しょうご) = noon, midday.' } },
      ],
    } };

  const cards = {
    F: 'カンタ ： ねて いる ヤギ 。 つの が ふたつ 。 ／ チヨ ： てんもんだい 。 やね は まるい 。 うえ に あかい あかり 。 ／ ロクタ ： すわって いる キツネ 。 しっぽ は からだ より おおきい 。',
    E: 'カンタ ： {寝|ね}て いる ヤギ 。 {角|つの} が {二本|にほん} 。 ／ チヨ ： {天文台|てんもんだい} 。 {屋根|やね} は {丸|まる}い 。 {上|うえ} に {赤|あか}い {灯|あか}り 。 {入|い}り{口|ぐち} は {一|ひと}つ 。 ／ ロクタ ： {座|すわ}って いる キツネ 。 {尻尾|しっぽ} は {体|からだ} より {大|おお}きい 。',
  };
  const seen = 'ヤギ の {角|つの} は {一本|いっぽん} {折|お}れて いる 。 {天文台|てんもんだい} の {屋根|やね} に は {赤|あか}い {実|み} 、 {入|い}り{口|ぐち} は {一|ひと}つ 。 キツネ の {尻尾|しっぽ} は {細|ほそ}くて {短|みじか}い 。';
  const winner = (item, extra) => ({ kind: 'choose', item, ctx: { jp: extra || cards.E, en: '' }, prompt: { en: 'The rule: the sculpture that matches its own card wins. Which one?' },
    options: [o('Chiyo\'s observatory', true), o('Kanta\'s goat', false, 'The card says two horns; one has broken off.'), o('Rokuta\'s fox', false, 'The card says the tail is bigger than the body; it\'s thin and short.')] });
  X['sb.c_snow_judge'] = { title: { jp: '{審査|しんさ}', en: 'Judging the contest' },
    tiers: {
      F: [
        { kind: 'choose', item: 'c:sb_snow_f', ctx: { jp: cards.F, en: 'Kanta: a goat lying down, two horns. / Chiyo: the observatory, round roof, a red light on top. / Rokuta: a fox sitting, tail bigger than its body.' }, prompt: { en: 'You saw: the goat has one horn left; the observatory has a round roof and a red berry on top; the fox\'s tail is small. Which sculpture matches its card?' },
          options: [oj('チヨ の てんもんだい', true, null, 'Chiyo\'s observatory'), oj('カンタ の ヤギ', false, 'The card says つの が ふたつ (two horns). One fell off.', 'Kanta\'s goat'), oj('ロクタ の キツネ', false, 'The card says the tail is big. It is small.', 'Rokuta\'s fox')] },
        { kind: 'write', item: 'v:角', prompt: { en: 'Kanta\'s card says the goat has two of these. Write tsuno (horn).' }, answer: 'つの', accept: ['つの', '角'], mode: 'kana', explain: { jp: 'つの', en: 'つの = horn (of an animal).' } },
      ],
      E: [
        winner('c:sb_snow_e', cards.E + ' ／ （ {見|み}た もの ） ' + seen),
        { kind: 'choose', item: 'c:sb_snow_e2', ctx: { jp: '{角|つの} が {二本|にほん} 。', en: '' }, prompt: { en: 'What\'s wrong with Kanta\'s goat, compared with its card?' },
          options: [o('One of its two horns has broken off.', true), o('It is standing up.', false, 'It is lying down, as the card says (寝ている).'), o('It has no eyes.', false, 'Its eyes are charcoal.')] },
      ],
      I: [
        winner('c:sb_snow_i', cards.E + ' ／ （ {見|み}た もの ） ' + seen),
        { kind: 'choose', item: 'g:n_desu', ctx: { jp: '{昨日|きのう} は もっと {大|おお}きかった んだ から 。', en: '' }, prompt: { en: 'Rokuta protests. What does 〜んだから add?' },
          options: [o('Insistence: "it WAS bigger yesterday, you know!"', true), o('A question: "was it bigger yesterday?"', false, 'No question marker; んだから asserts a reason.'), o('A promise: "it will be bigger."', false, 'かった is past.')], explain: { en: '〜んだから presents something as a reason the listener ought to accept — often insistent or exasperated.' } },
      ],
      A: [
        winner('c:sb_snow_a', cards.E + ' ／ （ {見|み}た もの ） ' + seen),
        { kind: 'choose', item: 'c:sb_snow_a2', prompt: { en: 'Rokuta argues: "Chiyo\'s \'red light\' is just a berry — so it doesn\'t match its card either!" How do you rule?' },
          options: [o('The card describes what the sculpture shows; a red berry standing for a lamp is exactly what she wrote.', true), o('He\'s right: a berry isn\'t a lamp, so nobody wins.', false, 'A goat of snow isn\'t a goat either; the cards describe representations.'), o('The biggest sculpture should win instead.', false, 'The agreed rule was about matching, not size.')] },
      ],
    } };

  // ---- activities ------------------------------------------------------------------------------
  const A = C.activities;
  A['sb.a_letters'] = { type: 'letters', title: { jp: '{宛名|あてな} の ない {手紙|てがみ}', en: 'Letters with no address' },
    recipients: [
      { id: 'sachi', name: { en: 'Sachi', jp: 'サチ' }, desc: { F: { jp: 'カンタ の おかあさん', en: 'Kanta\'s mother' }, E: { jp: 'カンタ の {母|はは} 。 {夫|おっと} は {町|まち} で {働|はたら}いて いる', en: 'Kanta\'s mother; her husband works in the town' } } },
      { id: 'fuki', name: { en: 'Fuki', jp: 'フキ' }, desc: { F: { jp: 'かね を ならす おばあさん', en: 'the old woman who rings the bell' }, E: { jp: '{鐘撞|かねつ}き の おばあさん', en: 'the elderly bell-keeper' } } },
      { id: 'tetsuji', name: { en: 'Tetsuji', jp: 'テツジ' }, desc: { F: { jp: 'ヤギ を かって いる ひと', en: 'keeps goats' }, E: { jp: 'ヤギ {飼|か}い', en: 'a goatherd' } } },
      { id: 'yae', name: { en: 'Yae', jp: 'ヤエ' }, desc: { F: { jp: 'やど の ひと', en: 'runs the inn' }, E: { jp: '{宿|やど} の {女将|おかみ}', en: 'the innkeeper' } } },
      { id: 'denji', name: { en: 'Denji', jp: 'デンジ' }, desc: { F: { jp: 'むかし だいく だった ひと', en: 'used to be a carpenter' }, E: { jp: '{元|もと} {大工|だいく}', en: 'a retired carpenter' } } },
      { id: 'natsume', name: { en: 'Natsume', jp: 'ナツメ' }, desc: { F: { jp: 'よる の ヤギ ばん', en: 'watches the goats at night' }, E: { jp: 'テツジ の {姪|めい} 。 {夜|よる} の ヤギ {番|ばん}', en: 'Tetsuji\'s niece; the night goat-watch' } } },
      { id: 'hoshino', name: { en: 'Hoshino', jp: 'ホシノ' }, desc: { F: { jp: 'ほし を みる ひと', en: 'watches the stars' }, E: { jp: '{天文|てんもん}{学者|がくしゃ}', en: 'an astronomer' } } },
    ],
    letters: [
      { to: 'sachi', items: ['v:人形'], text: { F: { jp: 'はる に かえります 。 カンタ に おみやげ が あります 。', en: 'I\'ll be home in spring. I have a present for Kanta.' }, E: { jp: '{春|はる} に は {帰|かえ}ります 。 カンタ に {木|き} の {人形|にんぎょう} を {買|か}いました 。', en: 'I\'ll be home in spring. I bought Kanta a wooden doll.' }, I: { jp: '{雪|ゆき} が とけたら すぐ {帰|かえ}る 。 カンタ の みやげ は {内緒|ないしょ} に して おいて くれ 。 {喜|よろこ}ぶ {顔|かお} が {見|み}たい から な 。', en: 'I\'ll come home as soon as the snow melts. Keep Kanta\'s present a secret — I want to see his face.' }, A: { jp: '{出稼|でかせ}ぎ も あと {一月|ひとつき} 。 {坊主|ぼうず} の {土産|みやげ} は 、 {本人|ほんにん} に は {黙|だま}って おいて くれ 。 {子|こ}ども {扱|あつか}い する な と {怒|おこ}る だろう が な 。', en: 'One more month of work down here. Don\'t say a word to the boy about his present. He\'ll be cross and say I\'m treating him like a baby.' } },
        hint: { en: 'Whose husband is working away, and who has a son?' }, why: { en: 'A husband working in the town and a present for Kanta — Sachi.' } },
      { to: 'fuki', items: ['v:膝'], text: { F: { jp: 'ひざ は どう ？ かき を おくります 。', en: 'How are your knees? I\'m sending persimmons.' }, E: { jp: '{膝|ひざ} の {具合|ぐあい} は どう ？ {干|ほ}し{柿|がき} を {送|おく}ります 。 {鐘|かね} は {若|わか}い {人|ひと} に {任|まか}せなさい 。', en: 'How are your knees? I\'m sending dried persimmons. Leave the bell to the young ones.' }, I: { jp: '{姉|ねえ}さん 、 また {鐘|かね} の {柱|はしら} に {上|のぼ}って いる でしょう 。 その {歳|とし} で {梯子|はしご} は {危|あぶ}ない わ 。', en: 'Sister, you\'re still climbing the bell-post, aren\'t you. Ladders are dangerous at your age.' }, A: { jp: '{五十年|ごじゅうねん} {鳴|な}らし{続|つづ}けた {鐘|かね} を 、 {今|いま} さら {手放|てばな}せ と は {言|い}わない けれど 、 せめて {冬|ふゆ} の {梯子|はしご} だけ は {誰|だれ} か に {譲|ゆず}って ちょうだい 。', en: 'I won\'t tell you to give up a bell you\'ve rung for fifty years, not now — but at least let someone else take the ladder in winter.' } },
        hint: { en: 'Who climbs a ladder every day, and isn\'t young?' }, why: { en: 'Knees, a ladder, the bell — Fuki, from her sister.' } },
      { to: 'tetsuji', items: ['v:注文'], text: { F: { jp: 'ヤギ の チーズ を とお 、 おねがい します 。', en: 'Ten goat cheeses, please.' }, E: { jp: 'ヤギ の チーズ を {十個|じゅっこ} 、 {春|はる} に {送|おく}って ください 。', en: 'Please send ten goat cheeses in spring.' }, I: { jp: '{去年|きょねん} の ヤギ の チーズ が {評判|ひょうばん} で 、 {今年|ことし} は {倍|ばい} の {二十個|にじゅっこ} お{願|ねが}い できます か 。', en: 'Last year\'s goat cheese went down so well — could we order double this year, twenty?' }, A: { jp: '{貴殿|きでん} の ヤギ の チーズ は 、 {当店|とうてん} で も {指折|ゆびお}り の {人気|にんき} で ございます 。 {雪解|ゆきど}け を {待|ま}って 、 {改|あらた}めて ご{注文|ちゅうもん} {申|もう}し{上|あ}げます 。', en: 'Your goat cheese is among the most popular items in our shop. We will place a formal order once the snow melts.' } },
        hint: { en: 'Who makes goat cheese?' }, why: { en: 'A cheese order — Tetsuji the goatherd.' } },
      { to: 'yae', items: ['v:甘酒'], text: { F: { jp: 'こめ の おかね は 、 はる で いい です 。', en: 'The money for the rice can wait until spring.' }, E: { jp: '{米|こめ} と {麹|こうじ} の {代金|だいきん} は 、 {春|はる} で {結構|けっこう} です 。 {甘酒|あまざけ} 、 {楽|たの}しみ に して います 。', en: 'Payment for the rice and koji can wait till spring. Looking forward to the amazake.' }, I: { jp: '{米|こめ} の {値段|ねだん} が {上|あ}がって しまい 、 {申|もう}し{訳|わけ} ありません 。 {甘酒|あまざけ} の {分|ぶん} は 、 {今年|ことし} も {変|か}わらず お{届|とど}け します 。', en: 'I\'m sorry — the price of rice has gone up. The amount for your amazake will be delivered as usual this year.' }, A: { jp: '{毎度|まいど} ご{贔屓|ひいき} に あずかり 、 {恐縮|きょうしゅく} です 。 {麹|こうじ} の {仕入|しい}れ が {難|むずか}しく 、 {値上|ねあ}げ を お{願|ねが}い する {次第|しだい} です 。 ツケ は {例年|れいねん} どおり {春|はる} まで で {構|かま}いません 。', en: 'Thank you as always for your custom. Koji has been hard to obtain, so I must ask you to accept a price rise. As usual, the tab can wait until spring.' } },
        hint: { en: 'Who brews amazake for guests — and keeps tabs "until spring"?' }, why: { en: 'Rice and koji for amazake — Yae\'s inn.' } },
      { to: 'denji', items: ['v:橋'], text: { F: { jp: 'せんせい の はし は 、 おおみず でも だいじょうぶ でした 。', en: 'Your bridge held up, even in the flood.' }, E: { jp: '{先生|せんせい} に {教|おそ}わった {作|つく}り{方|かた} の {橋|はし} は 、 {大水|おおみず} でも {流|なが}されません でした 。', en: 'The bridge built the way you taught me wasn\'t washed away, even in the flood.' }, I: { jp: '{親方|おやかた} の {言|い}う とおり 、 {柱|はしら} を {一本|いっぽん} {増|ふ}やして おいて よかった です 。 {秋|あき} の {大水|おおみず} に も {耐|た}えました 。', en: 'Just as you said, master, I\'m glad I added one more post. It stood up to the autumn flood.' }, A: { jp: '{親方|おやかた} に 「 {無駄|むだ} だ 」 と {笑|わら}われた {裏|うら} の {柱|はしら} こそ が 、 {秋|あき} の {大水|おおみず} で {橋|はし} を {救|すく}いました 。 {親方|おやかた} も {昔|むかし} 、 {同|おな}じ こと を {言|い}われた と {伺|うかが}って います 。', en: 'The back post you laughed at as "a waste" was precisely what saved the bridge in the autumn flood. I hear someone once said the same to you, too.' } },
        hint: { en: 'Who used to build things, and taught others?' }, why: { en: 'Bridges and posts — Denji, the old carpenter.' } },
      { to: 'natsume', items: ['v:会う'], text: { F: { jp: 'はる に ヤギ を かい に いきます 。 また あいたい です 。', en: 'I\'ll come to buy goats in spring. I\'d like to see you again.' }, E: { jp: '{春|はる} に ヤギ を {買|か}い に {行|い}きます 。 その とき 、 また {会|あ}えます か 。', en: 'I\'ll come up to buy goats in spring. Can we meet again then?' }, I: { jp: 'ヤギ を {見|み}に {行|い}く と いう の は {口実|こうじつ} で 、 {本当|ほんとう} は {夜|よる} の ヤギ {番|ばん} の {話|はなし} を また {聞|き}きたい の です 。', en: '"Coming to see the goats" is an excuse. Really, I want to hear more stories about the night goat-watch.' }, A: { jp: '{春|はる} の ヤギ {市|いち} に は {必|かなら}ず {参|まい}ります 。 {目当|めあ}て が ヤギ で は ない こと は 、 {伯父|おじ} {上|うえ} に は {内緒|ないしょ} に して ください 。', en: 'I will be at the spring goat market without fail. Please don\'t tell your uncle that it isn\'t the goats I\'m coming for.' } },
        hint: { en: 'Not a business letter. Who watches the goats at night — and whose uncle owns them?' }, why: { en: 'Someone wants to see the night goat-watch again — Natsume. (Tetsuji must not find out.)' } },
    ] };

  A['sb.a_hearth_orders'] = { type: 'orders', title: { jp: '{吹雪|ふぶき} の {夜|よる} の {囲炉裏|いろり}', en: 'The hearth on a storm night' },
    menu: [
      { id: 'amazake', jp: '{甘酒|あまざけ}', en: 'amazake (sweet rice drink)' }, { id: 'shouga', jp: 'しょうが{湯|ゆ}', en: 'ginger tea' },
      { id: 'milk', jp: 'ヤギ の ミルク', en: 'goat\'s milk' }, { id: 'tea', jp: 'お{茶|ちゃ}', en: 'green tea' }, { id: 'mochi', jp: '{焼|や}き{餅|もち}', en: 'grilled rice cake' },
    ],
    customers: [
      { who: 'kanta', want: { amazake: 2 }, items: ['v:甘酒'], line: { F: { jp: 'あまざけ ふたつ ！ チヨ の ぶん も ！', en: 'Two amazake! One for Chiyo too!' }, E: { jp: '{甘酒|あまざけ} を {二|ふた}つ ！ チヨ の {分|ぶん} も ！', en: 'Two amazake! Chiyo\'s too!' }, I: { jp: '{甘酒|あまざけ} 、 おれ と チヨ の 。 ロクタ の は …… いい や 、 {自分|じぶん} で {頼|たの}む だろ 。', en: 'Amazake — mine and Chiyo\'s. Rokuta\'s… nah, he can order his own.' }, A: { jp: '{甘酒|あまざけ} ちょうだい 。 おれ の と 、 チヨ の 。 ロクタ は さっき {三杯|さんばい} {目|め} を {頼|たの}んで {母|かあ}ちゃん に {怒|おこ}られてた から 、 {抜|ぬ}き で 。', en: 'Amazake, please. Mine and Chiyo\'s. Rokuta just got told off by Mum for ordering a third, so leave him out.' } },
        hint: { I: { en: 'Two people are named; the third orders his own.' }, A: { en: 'Two cups: Kanta and Chiyo. Rokuta is 抜き (left out).' } }, thanks: { jp: 'やった ！', en: 'Yay!' } },
      { who: 'fuki', want: { shouga: 1 }, items: ['v:生姜'], line: { F: { jp: 'しょうがゆ を ひとつ 。 あつい の を ね 。', en: 'One ginger tea. A hot one.' }, E: { jp: 'しょうが{湯|ゆ} を {一|ひと}つ 。 {喉|のど} に いい から ね 。', en: 'One ginger tea. It\'s good for the throat.' }, I: { jp: 'かぜ {気味|ぎみ} で ね 。 {喉|のど} に {効|き}く もの を {一杯|いっぱい} 。 {甘|あま}い の は いらない よ 。', en: 'I\'ve a bit of a cold. One cup of something good for the throat. Nothing sweet.' }, A: { jp: '{喉|のど} を やられて いる んで 、 {温|あたた}まる もの を {頼|たの}む よ 。 {甘酒|あまざけ} は {好|す}き だ が 、 {今夜|こんや} は {辛|から}い ほう が いい 。', en: 'My throat\'s done in, so something warming, please. I like amazake, but tonight I\'d rather something with a bite.' } },
        hint: { I: { en: 'Good for the throat, and not sweet.' }, A: { en: '辛い here means sharp/spicy — ginger, not the sweet amazake.' } } },
      { who: 'tetsuji', want: { tea: 2 }, items: ['v:お茶'], line: { F: { jp: 'おちゃ ふたつ 。 ミルク は いらない 。', en: 'Two teas. No milk.' }, E: { jp: 'お{茶|ちゃ} を {二|ふた}つ 。 ミルク は もう {十分|じゅうぶん} だ 。', en: 'Two teas. I\'ve had enough milk for a lifetime.' }, I: { jp: 'ヤギ の ミルク {以外|いがい} なら {何|なん} でも いい 。 …… {茶|ちゃ} だ な 。 {二杯|にはい} 。', en: 'Anything but goat\'s milk. …Tea, then. Two cups.' }, A: { jp: '{毎日|まいにち} ヤギ の {乳|ちち} を {搾|しぼ}って いる {人間|にんげん} に 、 ミルク を {勧|すす}める な よ 。 {茶|ちゃ} を {二杯|にはい} 、 {濃|こ}い め で 。', en: 'Don\'t offer milk to a man who milks goats every day. Two teas, strong.' } },
        hint: { en: 'Not the milk.' } },
      { who: 'denji', want: { mochi: 3, tea: 1 }, items: ['v:餅'], line: { F: { jp: 'やきもち みっつ と おちゃ 。', en: 'Three grilled rice cakes and a tea.' }, E: { jp: '{焼|や}き{餅|もち} を {三|みっ}つ と 、 お{茶|ちゃ} を {一|ひと}つ 。', en: 'Three grilled rice cakes and one tea.' }, I: { jp: '{餅|もち} を {三|みっ}つ {焼|や}いて くれ 。 {茶|ちゃ} は …… テツジ の を {一口|ひとくち} もらう から いい や 。 いや 、 やっぱり {一杯|いっぱい} 。', en: 'Grill me three rice cakes. Tea… I\'ll pinch a sip of Tetsuji\'s. No — one cup after all.' }, A: { jp: '{焼|や}き{餅|もち} を {三|みっ}つ 。 {歯|は} が {丈夫|じょうぶ} な うち に {食|く}って おかん@おく と な 。 {茶|ちゃ} は {一杯|いっぱい} で {足|た}りる 。', en: 'Three grilled rice cakes. Must eat them while my teeth hold out. One tea will do.' } },
        hint: { I: { en: 'He changed his mind about the tea — listen to the end.' } } },
      { who: 'hoshino', want: { tea: 1 }, items: ['v:癖'], line: { F: { jp: 'おちゃ を ひとつ 。', en: 'One tea.' }, E: { jp: 'お{茶|ちゃ} を {二|ふた}つ …… いや 、 {一|ひと}つ で いい 。', en: 'Two teas… no, one is fine.' }, I: { jp: 'お{茶|ちゃ} を {二|ふた}つ 。 …… いや 、 {一|ひと}つ だ 。 {癖|くせ} で ね 。 {昔|むかし} は {二|ふた}つ {頼|たの}んで いた から 。', en: 'Two teas. …No, one. Habit. I used to order two.' }, A: { jp: '{茶|ちゃ} を {二杯|にはい} 、 と {言|い}いかけて しまう の は 、 {年寄|としよ}り の {悪|わる}い {癖|くせ} だ ね 。 {一杯|いっぱい} で {結構|けっこう} 。', en: 'Starting to say "two teas" is a bad old man\'s habit. One will do.' } },
        hint: { en: 'He corrected himself.' } },
      { who: 'natsume', want: { milk: 1, mochi: 1 }, items: ['v:牛乳'], line: { F: { jp: 'ミルク と やきもち 、 ひとつ ずつ 。', en: 'A milk and a grilled rice cake, one each.' }, E: { jp: 'ヤギ の ミルク と {焼|や}き{餅|もち} を {一|ひと}つ ずつ 。', en: 'A goat\'s milk and a grilled rice cake, one of each.' }, I: { jp: 'ミルク 、 {温|あたた}かい の を 。 あと 、 お{餅|もち} も {一|ひと}つ 。 …… {寝|ね}る {前|まえ} だ けど 、 いい よね 。', en: 'A warm milk. And one rice cake. …It\'s nearly bedtime, but that\'s okay, right?' }, A: { jp: '{寝|ね}る {前|まえ} に は {温|あたた}かい ミルク 、 と {母|はは} に {教|おそ}わった の 。 お{餅|もち} も {一|ひと}つ …… {母|はは} に は {内緒|ないしょ} で 。', en: 'Mum taught me: warm milk before bed. And one rice cake… don\'t tell her.' } },
        hint: { en: 'One of each.' } },
    ] };

  // ---- drills (tag: snowbell) -----------------------------------------------------------------------
  const wF = (id, item, en, answer, accept, tpl, explain) => ({ id, lv: 'F', tags: ['snowbell'], kind: 'write', item, prompt: { en }, answer, accept, mode: 'kana', template: tpl || undefined, explain: { en: explain } });
  const ch = (id, lv, item, ctx, en, options, explain) => ({ id, lv, tags: ['snowbell'], kind: 'choose', item, ctx: ctx ? { jp: ctx, en: '' } : undefined, prompt: { en }, options, explain: explain ? { en: explain } : undefined });
  C.addDrills([
    wF('sb.d_f1', 'v:雪', 'Snow: yuki.', 'ゆき', ['ゆき', '雪'], { before: '', after: ' が ふって いる 。' }, 'ゆき (雪) — snow. ゆきが ふっている = it is snowing.'),
    wF('sb.d_f2', 'v:星', 'Star: hoshi.', 'ほし', ['ほし', '星'], { before: '', after: ' が きれい だ 。' }, 'ほし (星) — star.'),
    wF('sb.d_f3', 'v:寒い', 'Cold (weather): samui.', 'さむい', ['さむい', '寒い'], { before: 'きょう は ', after: ' 。' }, 'さむい (寒い) — cold (weather, air).'),
    wF('sb.d_f4', 'v:火', 'Fire: hi.', 'ひ', ['ひ', '火'], { before: '', after: ' に あたる 。' }, 'ひ (火) — fire. ひにあたる = to warm yourself at a fire.'),
    wF('sb.d_f5', 'v:鐘', 'Bell (a big hanging bell): kane.', 'かね', ['かね', '鐘'], { before: '', after: ' が なる 。' }, 'かね (鐘) — a large bell. A small bell is すず.'),
    wF('sb.d_f6', 'v:手紙', 'Letter: tegami.', 'てがみ', ['てがみ', '手紙'], { before: '', after: ' を かく 。' }, 'てがみ (手紙) — a letter.'),
    wF('sb.d_f7', 'v:冬', 'Winter: fuyu.', 'ふゆ', ['ふゆ', '冬'], { before: '', after: ' は ながい 。' }, 'ふゆ (冬) — winter.'),
    wF('sb.d_f8', 'v:夜', 'Night: yoru.', 'よる', ['よる', '夜'], { before: '', after: ' に ほし を みる 。' }, 'よる (夜) — night.'),
    wF('sb.d_f9', 'v:北', 'North: kita.', 'きた', ['きた', '北'], { before: '', after: ' の やま 。' }, 'きた (北) — north.'),
    wF('sb.d_f10', 'v:山', 'Mountain: yama.', 'やま', ['やま', '山'], { before: '', after: ' に のぼる 。' }, 'やま (山) — mountain.'),
    wF('sb.d_f11', 'v:炎', 'Flame: honoo.', 'ほのお', ['ほのお', '炎'], null, 'ほのお (炎) — flame. Note the long お: ほ・の・お.'),
    Object.assign(wF('sb.d_f12', 'v:ヤギ', 'Goat — written in katakana: yagi.', 'ヤギ', ['ヤギ', '山羊'], null, 'ヤギ — goat. Animal names are often written in katakana.'), { script: 'kata' }),

    ch('sb.d_e1', 'E', 'g:counters', 'こヤギ が ＿＿ いる 。', 'Two kids (baby goats) are in the shed. Which counter fits?', [oj('{二匹|にひき}', true), oj('{二人|ふたり}', false, '人 counts people.'), oj('{二枚|にまい}', false, '枚 counts flat things like paper.')], '匹 (ひき) counts small and medium animals.'),
    { id: 'sb.d_e2', lv: 'E', tags: ['snowbell'], kind: 'write', item: 'g:counters', prompt: { en: 'The morning bell rings at 7 o\'clock. Write the time: shichiji.' }, answer: 'しちじ', accept: ['しちじ', 'ななじ', '七時', '7時', '７時'], mode: 'reading', explain: { en: '七時 is usually read しちじ; ななじ is also heard, to avoid confusion with いちじ.' } },
    ch('sb.d_e3', 'E', 'g:prt_ni', '{雪見屋|ゆきみや} ＿ {泊|と}まる 。', 'Which particle? (to stay AT an inn)', [oj('に', true), oj('を', false, 'を marks the object of an action.'), oj('へ', false, 'へ shows direction of movement.')], '泊まる takes に for the place you stay: 宿に泊まる.'),
    ch('sb.d_e4', 'E', 'c:sb_d_genki', 'お{元気|げんき} です か 。', 'A letter opens with this. What does it mean?', [o('How are you? / Are you keeping well?', true), o('Are you angry?', false, '元気 is health and energy.'), o('Where are you?', false, 'Nothing about place.')], 'お元気ですか is the standard "How are you?" in letters and after time apart.'),
    { id: 'sb.d_e5', lv: 'E', tags: ['snowbell'], kind: 'write', item: 'v:南', prompt: { en: 'Winter stars are seen in the south. Write minami (south).' }, template: { before: '{冬|ふゆ} の {星|ほし} は ', after: ' の {空|そら} に {見|み}える 。' }, answer: 'みなみ', accept: ['みなみ', '南'], mode: 'reading', explain: { en: '南 (みなみ) — south.' } },
    ch('sb.d_e6', 'E', 'g:v_te_kudasai', 'わら を {入|い}れて ください 。', 'What is being asked?', [o('Please put in some straw.', true), o('I put in the straw.', false, 'That would be 入れました.'), o('Don\'t put in straw.', false, 'That would be 入れないでください.')], '〜てください = please do.'),
    ch('sb.d_e7', 'E', 'g:counters', '{鐘|かね} を {何回|なんかい} {鳴|な}らします か 。', 'What is being asked?', [o('How many times will you ring the bell?', true), o('When will you ring the bell?', false, 'When is いつ.'), o('Who will ring the bell?', false, 'Who is だれ.')], '何回 (なんかい) = how many times.'),
    { id: 'sb.d_e8', lv: 'E', tags: ['snowbell'], kind: 'write', item: 'v:熱い', prompt: { en: 'Drink the ginger tea while it\'s hot. Write atsui (hot, of things you touch or drink).' }, template: { before: 'しょうが{湯|ゆ} は ', after: ' うち に {飲|の}んで 。' }, answer: 'あつい', accept: ['あつい', '熱い'], mode: 'reading', explain: { en: '熱い (あつい) is hot to the touch; 暑い (あつい) is hot weather.' } },
    ch('sb.d_e9', 'E', 'g:v_masu_forms', '{昨日|きのう} 、 {雪|ゆき} が ＿＿ 。', 'It snowed yesterday. Which form fits?', [oj('{降|ふ}りました', true), oj('{降|ふ}ります', false, '〜ます is present/future.'), oj('{降|ふ}りません', false, '〜ません is negative.')], '〜ました = polite past.'),
    ch('sb.d_e10', 'E', 'g:adj_i', '{寒|さむ}い です 。', 'What is the plain (casual) form of this?', [oj('{寒|さむ}い', true), oj('{寒|さむ}い だ', false, 'い-adjectives don\'t take だ in plain speech.'), oj('{寒|さむ}かった', false, 'That is past: "was cold".')], 'For い-adjectives, drop です: 寒いです → 寒い.'),
    { id: 'sb.d_e11', lv: 'E', tags: ['snowbell'], kind: 'order', item: 'g:prt_ni', prompt: { en: 'Build the sentence: "We will stay at the inn."' }, tiles: ['わたし たち は', '{宿|やど} に', '{泊|と}まります'], answer: ['わたし たち は', '{宿|やど} に', '{泊|と}まります'], orderHint: { en: 'Topic, place with に, verb last.' } },
    ch('sb.d_e12', 'E', 'g:comp_yori_hou', '{今日|きょう} は {昨日|きのう} より {寒|さむ}い 。', 'What does this mean?', [o('Today is colder than yesterday.', true), o('Yesterday was colder than today.', false, 'X は Y より… = X is more … than Y.'), o('It was cold yesterday and today.', false, 'より compares.')], 'より = "than".'),
    ch('sb.d_e13', 'E', 'g:prt_kara_made', '{手紙|てがみ} は {春|はる} まで {待|ま}ちます 。', 'What does this mean?', [o('The letters wait until spring.', true), o('The letters wait from spring.', false, 'From is から.'), o('The letters arrived in spring.', false, 'まで = until.')], 'まで = until, as far as.'),

    ch('sb.d_i1', 'I', 'g:cond_tara', '{雪|ゆき} が とけたら 、 {帰|かえ}ります 。', 'What does this mean?', [o('When the snow melts, I\'ll come home.', true), o('Because the snow melted, I came home.', false, '〜たら looks ahead: when/once.'), o('Even if the snow melts, I won\'t come home.', false, 'That would need 〜ても and a negative.')], '〜たら = when / once (something happens).'),
    ch('sb.d_i2', 'I', 'g:temo', '{誰|だれ} も {見|み}て いなくて も 、 {灯|あか}り を ともす 。', 'What does this mean?', [o('Even if no one is watching, I light the lamp.', true), o('Because no one is watching, I light the lamp.', false, '〜ても = even if, not because.'), o('If someone is watching, I light the lamp.', false, 'いなくても = even if (they) are not.')], '〜なくても = even if not.'),
    ch('sb.d_i3', 'I', 'g:hazu', '{手紙|てがみ} は {秋|あき} に {届|とど}く はず だった 。', 'What does this mean?', [o('The letter should have arrived in autumn (but didn\'t).', true), o('The letter arrived in autumn, as usual.', false, 'はずだった implies the expectation was not met.'), o('The letter must never arrive in autumn.', false, 'はず is expectation, not prohibition.')], '〜はずだった = "was supposed to / should have".'),
    ch('sb.d_i4', 'I', 'c:sb_d_youni', '{迷|まよ}わない よう に 、 {鐘|かね} を {鳴|な}らす 。', 'What does this mean?', [o('We ring the bell so that people don\'t get lost.', true), o('We ring the bell as if we were lost.', false, 'ように here expresses purpose, not likeness.'), o('We don\'t ring the bell when lost.', false, 'The verb 鳴らす is positive.')], '〜ないように = "so that (someone) doesn\'t…".'),
    ch('sb.d_i5', 'I', 'g:conj_node', '{吹雪|ふぶき} な ので 、 {外|そと} に {出|で}ないで ください 。', 'What does this mean?', [o('Since there\'s a storm, please don\'t go outside.', true), o('Although there\'s a storm, please go outside.', false, 'ので = because.'), o('After the storm, please go outside.', false, 'Nothing about after.')], 'Noun/な-adjective + なので = "because it is…".'),
    ch('sb.d_i6', 'I', 'c:sb_d_season', '{川|かわ} の {紅葉|もみじ} が {色|いろ}づいて きました 。', 'A letter opens with this. When was it written?', [o('Mid-autumn, when the leaves are turning.', true), o('Early spring.', false, '紅葉 (もみじ) are autumn leaves.'), o('Midsummer.', false, '色づく = to take on colour — autumn.')], 'Seasonal openings date a letter: 紅葉が色づく = the leaves are colouring.'),
    ch('sb.d_i7', 'I', 'g:te_shimau', '{灯|あか}り が {消|き}えて しまった 。', 'What does 〜てしまった add?', [o('Regret: the lamp went out, and that\'s a pity.', true), o('The lamp was deliberately put out.', false, '消える is intransitive: it went out by itself.'), o('The lamp is about to go out.', false, 'しまった is completed.')], '〜てしまう = completely / regrettably.'),
    ch('sb.d_i8', 'I', 'g:te_oku', '{部屋|へや} を {温|あたた}めて おきます 。', 'What does this mean?', [o('I\'ll warm the room in advance (for later).', true), o('I warmed the room by mistake.', false, 'That would be 〜てしまいました.'), o('Please warm the room.', false, 'No request form here.')], '〜ておく = do something in advance.'),
    ch('sb.d_i9', 'I', 'g:passive', '{宛名|あてな} が {消|け}された 。', 'How is this different from 宛名が消えた?', [o('消された says someone (or something) erased it; 消えた just says it disappeared.', true), o('There is no difference.', false, '消す is transitive; its passive implies an agent.'), o('消された means it will be erased later.', false, '〜された is past.')], 'Passive 〜される implies an agent acting on the subject.'),
    ch('sb.d_i10', 'I', 'g:toki', '{吹雪|ふぶき} の とき は 、 {短|みじか}く {何度|なんど} も {鳴|な}らす 。', 'What does this mean?', [o('When there\'s a storm, ring short strokes again and again.', true), o('Ring for a short time before a storm.', false, 'とき = when (at the time of).'), o('Ring many times after the storm.', false, 'Not after — during/when.')], 'Noun + のとき = "at the time of…, when…".'),
    ch('sb.d_i11', 'I', 'g:sou_hear', '{明日|あした} は {晴|は}れる そう だ 。', 'What does this mean?', [o('I hear it\'ll be clear tomorrow.', true), o('It looks like it\'s about to clear up.', false, 'That would be 晴れそうだ (stem + そう).'), o('It must not be clear tomorrow.', false, 'No negation.')], 'Plain form + そうだ = hearsay: "they say / I hear".'),

    ch('sb.d_a1', 'A', 'g:adv_kanenai', '{凍|こお}った まま {回|まわ}せば 、 {軸|じく} が {折|お}れ かねない 。', 'What does this mean?', [o('If you turn it while frozen, the shaft could well snap.', true), o('Even frozen, the shaft can\'t snap.', false, '〜かねない warns that something bad could happen.'), o('The shaft snapped because it was frozen.', false, 'かねない is about possibility, not a past event.')], '〜かねない = could well (bad outcome).'),
    ch('sb.d_a2', 'A', 'g:adv_wake_dewa_nai', '{忘|わす}れた わけ では ない 。 {思|おも}い{出|だ}せない だけ だ 。', 'What does this mean?', [o('It\'s not that I\'ve forgotten; I just can\'t bring it to mind.', true), o('I\'ve completely forgotten it.', false, '〜わけではない denies that conclusion.'), o('I don\'t want to remember.', false, 'Nothing about wanting.')], '〜わけではない = "it isn\'t (necessarily) the case that…".'),
    ch('sb.d_a3', 'A', 'c:sb_d_jiai', 'くれぐれも ご{自愛|じあい} ください 。', 'A letter closes with this. What does it mean?', [o('Please take good care of yourself.', true), o('Please love yourself more.', false, 'ご自愛 is a set phrase about health, not self-love.'), o('Please come and visit me.', false, 'Nothing about visiting.')], 'ご自愛ください is a formal closing wishing the reader good health; くれぐれも = "earnestly".'),
    ch('sb.d_a4', 'A', 'g:adv_zu_ni_wa_irarenai', '{灯|あか}り を {見上|みあ}げず に は いられない 。', 'What does this mean?', [o('I can\'t help looking up at the lamp.', true), o('I can\'t look up at the lamp.', false, 'Double negative: can\'t NOT look.'), o('I mustn\'t look up at the lamp.', false, 'Not a prohibition.')], '〜ずにはいられない = can\'t help doing.'),
    ch('sb.d_a5', 'A', 'g:adv_monono', '{手紙|てがみ} は {書|か}いた ものの 、 {出|だ}せず に いる 。', 'What does this mean?', [o('Although I wrote the letter, I haven\'t been able to send it.', true), o('Because I wrote the letter, I sent it.', false, 'ものの = although.'), o('I will write the letter and send it.', false, '出せずにいる = remaining unable to send.')], '〜ものの = although (it\'s true that…).'),
    ch('sb.d_a6', 'A', 'g:adv_kara_koso', '{誰|だれ} も {見|み}て いない {夜|よる} だ から こそ 、 ともす の だ 。', 'What does this mean?', [o('It\'s precisely because no one is watching that I light it.', true), o('I light it only when people are watching.', false, 'からこそ emphasises the reason given.'), o('Because no one is watching, there\'s no point lighting it.', false, 'The conclusion is to light it.')], '〜からこそ = precisely because.'),
    ch('sb.d_a7', 'A', 'g:adv_to_wa_ie', '{春|はる} が {近|ちか}い と は いえ 、 {峠|とうげ} は まだ {雪|ゆき} だ 。', 'What does this mean?', [o('Though spring is near, the pass is still under snow.', true), o('Because spring is near, the snow on the pass has melted.', false, 'とはいえ concedes, then contrasts.'), o('Spring is far off, and the pass is snowy.', false, '近い = near.')], '〜とはいえ = "that said / even though".'),
    ch('sb.d_a8', 'A', 'g:adv_ni_koshita', '{冬|ふゆ} の {山|やま} で は 、 {用心|ようじん} する に {越|こ}した こと は ない 。', 'What does this mean?', [o('In the winter mountains, you can\'t be too careful.', true), o('You shouldn\'t cross the winter mountains.', false, '越す here is part of a set phrase, not crossing.'), o('There\'s no need to be careful in winter.', false, 'The phrase recommends caution.')], '〜に越したことはない = nothing is better than…; it\'s best to….'),
    ch('sb.d_a9', 'A', 'c:sb_d_ori', '{寒|さむ}さ {厳|きび}しき {折|おり}', 'Where would you meet this phrase, and what does it mean?', [o('In a formal letter: "at this time of severe cold".', true), o('In a weather report: "it will be severely cold tomorrow".', false, '〜の折 and the literary 厳しき mark letter style.'), o('In a shop sign: "cold goods sold here".', false, 'It is a seasonal greeting.')], '厳しき is the literary attributive of 厳しい; 折 = occasion, time.'),
    ch('sb.d_a10', 'A', 'g:adv_dokoroka', '{春|はる} どころか 、 {夏|なつ} に なって も {返事|へんじ} が ない 。', 'What does this mean?', [o('Far from spring — even by summer there was no reply.', true), o('Not in spring, but a reply came in summer.', false, 'なってもない = even then, none.'), o('The reply came before spring.', false, 'どころか escalates: not only not X, but not even Y.')], '〜どころか = far from….'),
    ch('sb.d_a11', 'A', 'g:adv_to_iu_yori', '{待|ま}って いる と いう より 、 {祈|いの}って いる の だ 。', 'What does this mean?', [o('It\'s less waiting than praying.', true), o('I\'m waiting, and also praying.', false, 'というより sets the second above the first.'), o('I stopped waiting to pray.', false, 'Nothing about stopping.')], '〜というより = rather than (saying)….'),
  ]);
})(RB.content);
