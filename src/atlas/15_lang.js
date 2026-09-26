/* Unwritten Atlas — language content.
 * Unmoored names (small stories that want to go home), inscriptions, road
 * signs, promises, the guardians' legends, knot drills, door clues and the
 * authored special intents of atlas encounters. Every objective type has
 * material at all four profiles (F/E/I/A); Advanced is interpretation, never
 * long handwriting. All steps are registered as drills tagged 'atlas'. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const A = C.atlas;
  const drills = [];
  const add = (d) => { drills.push(d); return d; };
  const opt = (jp, ok, why) => { const o = { jp, ok: !!ok }; if (why) o.why = { en: why }; return o; };
  const oen = (en, ok, why) => { const o = { en, ok: !!ok }; if (why) o.why = { en: why }; return o; };

  // =====================================================================================
  // Unmoored names. Each has a line per profile (the step's context) and a mooring note.
  // =====================================================================================
  A.names = {};
  function NAME(id, d) {
    A.names[id] = d;
    const tags = ['atlas', 'atlas_name', 'atlas_name_' + id];
    for (const lv of ['F', 'E', 'I', 'A']) add(Object.assign({ id: 'atlas.name.' + id + '.' + lv, lv, tags }, d.steps[lv]));
    C.notes['atlas_name_' + id] = { title: { jp: d.title.jp, en: 'Moored: ' + d.title.en }, jp: d.note.jp, en: d.note.en };
  }
  NAME('ferry', {
    title: { jp: '{朝|あさ} の {渡|わた}し', en: 'The Dawn Ferry\'s Call' }, home: 'reedwake', col: '#e8e0c8',
    moored: { jp: '{呼|よ}び{声|ごえ} は 、 {川下|かわしも} の {葦|あし}ノ{瀬|せ} へ {流|なが}れて いった 。', en: 'The call drifts downriver towards Reedwake. On the next foggy morning, a ferryman will shout it again.' },
    note: { jp: '「わたる よー 」 。 {霧|きり} の {朝|あさ} に は 、 {橋|はし} より {頼|たよ}り に なる {声|こえ} 。', en: '"Crossing now!" — the call that woke Reedwake before the bridge was mended. On foggy mornings a voice is still easier to follow than a bridge you cannot see.' },
    steps: {
      F: { kind: 'write', item: 'v:船', mode: 'reading', ctx: { jp: '「…… おーい 、 わたる よー 。」 かわ の ほう から こえ が する 。', en: '"…Hoy, crossing now!" A voice from the direction of the river.' }, prompt: { en: 'It is the call of a ferry. Write "fune" (boat) so it remembers what it belongs to.' }, answer: 'ふね', accept: ['ふね', '船', '舟'], explain: { en: 'ふね (fune) — boat. A ferry is わたしぶね.' } },
      E: { kind: 'choose', item: 'c:atlas_name_ferry_E', ctx: { jp: '「{毎朝|まいあさ} 、 {川|かわ} を わたる {前|まえ} に 、 {大|おお}きな {声|こえ} で {呼|よ}んで いました 。」', en: '"Every morning, before crossing the river, I used to call out in a big voice."' }, prompt: { en: 'What was this name?' },
        options: [oen('The call of a river ferry', true), oen('A temple bell on a hill', false, 'It crossed a river (川をわたる).'), oen('A baker shouting prices', false, 'It called before crossing the river.')], explain: { en: '川をわたる — to cross the river; 呼んでいました — used to call out.' } },
      I: { kind: 'choose', item: 'c:atlas_name_ferry_I', ctx: { jp: '「{橋|はし} が {直|なお}って から 、 もう {誰|だれ} も {私|わたし} を {呼|よ}ばなく なった 。 {便利|べんり} に なった の は 、 いい こと だ けど ね 。」', en: '"Since the bridge was mended, nobody calls for me any more. Things being more convenient is a good thing, mind you."' }, prompt: { en: 'What is it, and how does it seem to feel?' },
        options: [opt('{渡|わた}し{舟|ぶね} の {呼|よ}び{声|ごえ} で 、 {少|すこ}し {寂|さび}しい', true), opt('{橋|はし} の {名前|なまえ} で 、 {喜|よろこ}んで いる', false, 'It is what people used before the bridge — and "けどね" softens a regret.'), opt('{渡|わた}し{舟|ぶね} の {呼|よ}び{声|ごえ} で 、 {怒|おこ}って いる', false, 'It calls the change a good thing; the feeling is wistful, not angry.')], explain: { en: '〜なくなった: no longer (happens). 〜けどね at the end leaves a feeling unsaid.' } },
      A: { kind: 'choose', item: 'c:atlas_name_ferry_A', ctx: { jp: '「わたる よー 、 と {叫|さけ}ぶ {必要|ひつよう} は もう ない 。 それでも 、 {霧|きり} の {朝|あさ} に {限|かぎ}って は 、 {橋|はし} より {声|こえ} の {方|ほう} が {頼|たよ}り に なる こと だって ある だろう 。」', en: '"There\'s no need to shout \'crossing now!\' any more. Still — on foggy mornings especially, a voice can be more reliable than a bridge."' }, prompt: { en: 'What is it suggesting it could still be good for?' },
        options: [opt('{霧|きり} で {橋|はし} が {見|み}えない {朝|あさ} の {目印|めじるし}', true), opt('{橋|はし} が {壊|こわ}れた {時|とき} の {代|か}わり の {舟|ふね}', false, 'It says nothing about the bridge breaking — only about fog.'), opt('{村|むら} {中|じゅう} を {起|お}こす {朝|あさ} の {時計|とけい}', false, 'It did once wake the village, but the passage points at foggy mornings (〜に限っては).')], explain: { en: '〜に限っては: in the particular case of. 〜ことだってある: it can even happen that.' } },
    },
  });
  NAME('mochi', {
    title: { jp: 'モチ', en: 'Mochi, a harbour dog' }, home: 'saltglass', col: '#f0e4c8',
    moored: { jp: '{名前|なまえ} は {潮|しお} の {匂|にお}い の する {方|ほう} へ {駆|か}けて いった 。', en: 'The name trots off towards the smell of salt. On a Saltglass pier, a dog looks up as if someone called.' },
    note: { jp: '{桟橋|さんばし} で {船|ふね} を {待|ま}って いた {犬|いぬ} 。', en: 'Mochi waited on the pier for the fishing boats. Everyone said it was for the fish. Some of the older fishers are no longer so sure.' },
    steps: {
      F: { kind: 'write', item: 'k:モ', mode: 'kana', ctx: { jp: '「わん ！」 しっぽ を ふって いる 。 くびわ の ふだ の なまえ が きえて いる 。', en: '"Woof!" It\'s wagging its tail. The name on its collar tag has faded.' }, prompt: { en: 'The tag once said "Mochi". Write it in katakana: モチ.' }, answer: 'モチ', accept: ['モチ'], script: 'kata', explain: { en: 'モチ (Mochi) — names of pets are often written in katakana.' } },
      E: { kind: 'choose', item: 'c:atlas_name_mochi_E', ctx: { jp: '「{毎日|まいにち} 、 {港|みなと} で {船|ふね} を {待|ま}って いました 。 {魚|さかな} を もらう の が {好|す}き でした 。」', en: '"Every day I waited for the boats at the harbour. I liked being given fish."' }, prompt: { en: 'What kind of name is this?' },
        options: [oen('A dog who waited at the harbour', true), oen('The name of a fishing boat', false, 'It waited FOR the boats (船を待っていました).'), oen('A fish market', false, 'It liked being given fish; it didn\'t sell them.')], explain: { en: '〜を待っていました: was waiting for …' } },
      I: { kind: 'choose', item: 'c:atlas_name_mochi_I', ctx: { jp: '「{漁師|りょうし} たち が {帰|かえ}って くる と 、 いつも {一番|いちばん} に {気|き}づいた もの だ 。 {名前|なまえ} を {呼|よ}ばれる {前|まえ} から 、 しっぽ を {振|ふ}って いた らしい 。」', en: '"Whenever the fishers came back, I was always the first to notice. They say I was wagging my tail before anyone even called my name."' }, prompt: { en: 'What does this memory say about Mochi?' },
        options: [opt('{誰|だれ} より も {早|はや}く 、 {船|ふね} が {帰|かえ}る の に {気|き}づいた', true), opt('{名前|なまえ} を {呼|よ}ばれない と 、 {動|うご}かなかった', false, 'The opposite: it wagged before being called (呼ばれる前から).'), opt('{漁師|りょうし} と {一緒|いっしょ}に {海|うみ} へ {出|で}て いた', false, 'It waited for them to come back.')], explain: { en: '〜たものだ: used to (nostalgic). 〜らしい: apparently.' } },
      A: { kind: 'choose', item: 'c:atlas_name_mochi_A', ctx: { jp: '「あの {犬|いぬ} が {桟橋|さんばし} から {離|はな}れなかった の は 、 {魚|さかな} {目当|めあ}て だ と {皆|みな} {笑|わら}って いた 。 だが {嵐|あらし} の {翌朝|よくあさ} 、 {戻|もど}らなかった {船|ふね} が {一艘|いっそう} だけ あった こと を 、 {覚|おぼ}えて いる {者|もの} は もう {少|すく}ない 。」', en: '"Everyone laughed that the dog never left the pier because it was after fish. But few remember now that, the morning after the storm, one boat did not come back."' }, prompt: { en: 'What does the passage imply?' },
        options: [opt('{犬|いぬ} は {魚|さかな} で は なく 、 {帰|かえ}らなかった {船|ふね} を {待|ま}ち{続|つづ}けて いた の かも しれない', true), opt('{犬|いぬ} は {嵐|あらし} の {日|ひ} に {海|うみ} へ {出|で}て しまった', false, 'Nothing says the dog went to sea.'), opt('{皆|みな} が {笑|わら}った の は 、 {犬|いぬ} が {魚|さかな} を {盗|ぬす}んだ から だ', false, 'They laughed at a guess about its motive, not at theft.')], explain: { en: 'だが marks the turn: the second sentence quietly undercuts the first.' } },
    },
  });
  NAME('verse', {
    title: { jp: '{二番|にばん} の {歌詞|かし}', en: 'The Second Verse' }, home: 'cinder', col: '#f0dcc8',
    moored: { jp: '{歌|うた} は 、 {段々畑|だんだんばたけ} の {方|ほう} へ {口|くち}ずさみ ながら {帰|かえ}って いった 。', en: 'The verse hums its way home towards the terraces. At the next festival, someone in Cinder Orchard will sing it — quietly, then less quietly.' },
    note: { jp: '{誰|だれ} も {歌|うた}わなく なった {祭|まつ}り {歌|うた} の {二番|にばん} 。', en: 'The second verse of the orchard festival song remembers the year of the fire. Without it, even the cheerful first verse was only half true.' },
    steps: {
      F: { kind: 'write', item: 'v:歌', mode: 'reading', ctx: { jp: '「♪ …… らら …… 」 だれ か が くちずさんで いる 。', en: '"♪ …la la…" Someone is humming.' }, prompt: { en: 'It is part of a song. Write "uta" (song).' }, answer: 'うた', accept: ['うた', '歌'], explain: { en: 'うた (uta) — song.' } },
      E: { kind: 'choose', item: 'c:atlas_name_verse_E', ctx: { jp: '「お{祭|まつ}り で は 、 みんな {一番|いちばん} だけ {歌|うた}います 。 {二番|にばん} は だれ も {歌|うた}いません 。」', en: '"At the festival, everyone sings only the first verse. Nobody sings the second."' }, prompt: { en: 'What is this name?' },
        options: [oen('A festival song\'s verse that nobody sings', true), oen('The verse everyone knows by heart', false, 'That would be 一番, the first verse.'), oen('A song sung only at night', false, 'The problem is which verse, not when.')], explain: { en: '一番 / 二番: first / second verse of a song.' } },
      I: { kind: 'choose', item: 'c:atlas_name_verse_I', ctx: { jp: '「{二番|にばん} を {歌|うた}う と 、 {火事|かじ} の {年|とし} を {思|おも}い{出|だ}して しまう から 、 {誰|だれ} も {口|くち} に しなく なった の よ 。」', en: '"Singing the second verse brings back the year of the fire, so people stopped singing it."' }, prompt: { en: 'Why did people stop singing it?' },
        options: [opt('{悲|かな}しい {出来事|できごと} を {思|おも}い{出|だ}す から', true), opt('{歌詞|かし} が {難|むずか}しすぎた から', false, 'The reason given is 火事の年を思い出してしまう.'), opt('{火事|かじ} で {楽譜|がくふ} が {燃|も}えた から', false, 'People still knew it; they chose not to sing it.')], explain: { en: '〜てしまう: can\'t help (an unwanted result). 口にしない: not say aloud.' } },
      A: { kind: 'choose', item: 'c:atlas_name_verse_A', ctx: { jp: '「{忘|わす}れる ため に {歌|うた}わなかった の か 、 {歌|うた}わなかった から {忘|わす}れて しまった の か 。 どちら に せよ 、 {二番|にばん} が なければ 、 {一番|いちばん} の {明|あか}るさ も {半分|はんぶん} {嘘|うそ} に なる 。」', en: '"Did they stop singing it to forget, or forget because they stopped singing? Either way, without the second verse, even the brightness of the first becomes half a lie."' }, prompt: { en: 'What is the verse suggesting?' },
        options: [opt('{悲|かな}しい {部分|ぶぶん} を {抜|ぬ}いた {歌|うた} は 、 {明|あか}るい {部分|ぶぶん} まで {本当|ほんとう} で なく なる', true), opt('{一番|いちばん} だけ {歌|うた}えば {十分|じゅうぶん} だ', false, 'It says the first verse alone becomes half a lie.'), opt('{二番|にばん} は {最初|さいしょ} から {存在|そんざい} しなかった', false, 'It existed; the question is why it was dropped.')], explain: { en: 'どちらにせよ: either way. 〜も半分嘘になる: even … becomes half a lie.' } },
    },
  });
  NAME('shortcut', {
    title: { jp: '{葦|あし} の {近道|ちかみち}', en: 'The Shortcut through the Reeds' }, home: 'reedwake', col: '#e4e8c8',
    moored: { jp: '{近道|ちかみち} は 、 {草|くさ} の {間|あいだ} を すり{抜|ぬ}けて {帰|かえ}って いった 。', en: 'The shortcut slips away through the grass. In Reedwake, a child late for the ferry finds the crooked willow again.' },
    note: { jp: '{曲|ま}がった {柳|やなぎ} で {左|ひだり} 。', en: 'Left at the crooked willow. Every child in Reedwake once knew it, and none of the adults were supposed to.' },
    steps: {
      F: { kind: 'write', item: 'v:左', mode: 'reading', ctx: { jp: '「まがった やなぎ の き で …… 」', en: '"At the crooked willow…"' }, prompt: { en: 'The old shortcut turned left at the crooked willow. Write "hidari" (left).' }, answer: 'ひだり', accept: ['ひだり', '左'], explain: { en: 'ひだり (hidari) — left. みぎ (migi) is right.' } },
      E: { kind: 'choose', item: 'c:atlas_name_shortcut_E', ctx: { jp: '「{曲|ま}がった {柳|やなぎ} の {木|き} で {左|ひだり} へ {行|い}く と 、 {早|はや}く {村|むら} に {着|つ}きます 。」', en: '"If you go left at the crooked willow tree, you reach the village quickly."' }, prompt: { en: 'What is this name?' },
        options: [oen('A shortcut: left at the crooked willow', true), oen('A warning to keep away from the willow', false, 'It tells you where to turn, not to stay away.'), oen('Directions: right at the willow', false, '左 is left.')], explain: { en: '〜と: when/if you do …, (then) …' } },
      I: { kind: 'choose', item: 'c:atlas_name_shortcut_I', ctx: { jp: '「{子|こ}ども の {頃|ころ} 、 {遅刻|ちこく} し そう に なる と 、 {皆|みんな} この {道|みち} を {走|はし}った 。 {大人|おとな} に は {内緒|ないしょ} だった けど ね 。」', en: '"When we were kids and about to be late, we all ran this way. It was a secret from the grown-ups, though."' }, prompt: { en: 'What was this road?' },
        options: [opt('{子|こ}ども たち が こっそり {使|つか}って いた {近道|ちかみち}', true), opt('{大人|おとな} が {作|つく}った {新|あたら}しい {道|みち}', false, 'It was kept secret FROM adults (大人には内緒).'), opt('{遅|おそ}い {時間|じかん} に は {通|とお}れない {道|みち}', false, '遅刻しそう means about to be late, not late at night.')], explain: { en: '〜しそうになる: to be about to …; 内緒: a secret.' } },
      A: { kind: 'choose', item: 'c:atlas_name_shortcut_A', ctx: { jp: '「{地図|ちず} に {載|の}らない {道|みち} ほど 、 {人|ひと} の {足|あし} が よく {覚|おぼ}えて いる もの だ 。 {誰|だれ}か が {踏|ふ}み{続|つづ}ける {限|かぎ}り 、 そこ に {草|くさ} は {生|は}えない 。」', en: '"The less a road appears on maps, the better feet remember it. As long as someone keeps treading it, no grass grows there."' }, prompt: { en: 'What keeps a path like this alive?' },
        options: [opt('{人|ひと} が {通|とお}り{続|つづ}ける こと', true), opt('{地図|ちず} に {書|か}き{込|こ}む こと', false, 'It says such roads are NOT on maps.'), opt('{草|くさ} を {刈|か}る {係|かかり} が いる こと', false, 'The grass stays away because of feet, not mowing.')], explain: { en: '〜ほど: the more …; 〜限り: as long as …' } },
    },
  });
  NAME('umeboshi', {
    title: { jp: 'おばあちゃん の {梅干|うめぼ}し', en: 'Grandmother\'s Pickled Plums' }, home: 'snowbell', col: '#f0d8d0',
    moored: { jp: '{名前|なまえ} は 、 {雪|ゆき} の {山|やま} の {方|ほう} へ {転|ころ}がる よう に {帰|かえ}って いった 。', en: 'The name rolls off towards the mountains. In Snowbell, someone opens a jar, winces at the salt, and smiles.' },
    note: { jp: 'しょっぱすぎる 、 と {皆|みな} が {言|い}った {梅干|うめぼ}し 。', en: 'Nobody ever wrote the recipe down: the weight of the pickling stone and the number of drying days lived in one pair of hands.' },
    steps: {
      F: { kind: 'write', item: 'v:梅', mode: 'reading', ctx: { jp: '「すっぱい ！ でも おいしい 。」', en: '"Sour! But delicious."' }, prompt: { en: 'It remembers a taste. Write "ume" (Japanese apricot, "plum").' }, answer: 'うめ', accept: ['うめ', '梅'], explain: { en: 'うめ (ume) — often translated "plum"; うめぼし are pickled ume.' } },
      E: { kind: 'choose', item: 'c:atlas_name_umeboshi_E', ctx: { jp: '「おばあちゃん の {梅干|うめぼ}し は 、 とても しょっぱかった です 。 でも 、 みんな {毎年|まいとし} {食|た}べました 。」', en: '"Grandma\'s pickled plums were very salty. But everyone ate them every year."' }, prompt: { en: 'What is this name?' },
        options: [oen('Grandmother\'s very salty pickled plums, eaten every year', true), oen('Sweet plums bought at a market', false, 'They were very salty (しょっぱかった), and homemade.'), oen('Plums that nobody would eat', false, 'でも、みんな毎年食べました — they ate them anyway.')], explain: { en: 'しょっぱい: salty. でも: but.' } },
      I: { kind: 'choose', item: 'c:atlas_name_umeboshi_I', ctx: { jp: '「「しょっぱすぎる 」 と {文句|もんく} を {言|い}い ながら 、 {誰|だれ} も {塩|しお} を {減|へ}らして と は {言|い}わなかった 。」', en: '"They complained they were far too salty, and yet nobody ever asked her to use less salt."' }, prompt: { en: 'What does this say about the family?' },
        options: [opt('{文句|もんく} を {言|い}い つつ も 、 その {味|あじ} が {好|す}き だった', true), opt('{塩|しお} を {減|へ}らして ほしかった', false, 'Nobody ever asked for less salt.'), opt('{誰|だれ} も {食|た}べなかった', false, 'They complained while eating them.')], explain: { en: '〜ながら: while (here: even while). 〜すぎる: too …' } },
      A: { kind: 'choose', item: 'c:atlas_name_umeboshi_A', ctx: { jp: '「レシピ など ない 。 {重|おも}し{石|いし} の {重|おも}さ も 、 {干|ほ}す {日|ひ} の {数|かず} も 、 すべて {手|て} が {覚|おぼ}えて いた 。 だから こそ 、 その {手|て} が {失|うしな}われる と {同時|どうじ} に 、 {名前|なまえ} まで {消|き}えかけた の だ 。」', en: '"There was no recipe. The weight of the pickling stone, the number of drying days — her hands remembered it all. Which is exactly why, when those hands were gone, even the name began to vanish."' }, prompt: { en: 'Why did the name nearly vanish?' },
        options: [opt('{作|つく}り{方|かた} が {書|か}かれず 、 {作|つく}る {人|ひと} の {手|て} に しか なかった から', true), opt('{梅|うめ} が {取|と}れなく なった から', false, 'Nothing is said about the harvest.'), opt('レシピ が {盗|ぬす}まれた から', false, 'There never was a written recipe (レシピなどない).')], explain: { en: 'だからこそ: precisely because of that. 〜と同時に: at the same time as.' } },
    },
  });
  NAME('tuesday', {
    title: { jp: '{火曜日|かようび} の パン', en: 'Tuesday Bread' }, home: 'lanternfall', col: '#f0e0c0',
    moored: { jp: '{名前|なまえ} は 、 {焼|や}きたて の {匂|にお}い を {残|のこ}して {去|さ}って いった 。', en: 'The name drifts off, smelling faintly of crust. Next Tuesday, a Lanternfall queue will form before dawn.' },
    note: { jp: '{火曜日|かようび} に しか {焼|や}かない パン 。', en: 'A Lanternfall bakery baked this loaf only on Tuesdays. Customers asked for it daily; the baker said that having a day to wait for is what makes a day special.' },
    steps: {
      F: { kind: 'write', item: 'v:パン', mode: 'kana', ctx: { jp: '「かようび だけ の …… 」 いい におい が する 。', en: '"Only on Tuesdays…" There is a lovely smell.' }, prompt: { en: 'It was a kind of bread. Write "pan" (bread) in katakana.' }, answer: 'パン', accept: ['パン'], script: 'kata', explain: { en: 'パン (pan) — bread, written in katakana.' } },
      E: { kind: 'choose', item: 'c:atlas_name_tuesday_E', ctx: { jp: '「この パン は {火曜日|かようび} に しか {焼|や}きません 。 {朝|あさ} {早|はや}く {売|う}り{切|き}れます 。」', en: '"This bread is baked only on Tuesdays. It sells out early in the morning."' }, prompt: { en: 'What is this name?' },
        options: [oen('Bread baked only on Tuesdays that sells out early', true), oen('Bread sold every day except Tuesday', false, '火曜日にしか焼きません: baked ONLY on Tuesday.'), oen('Bread baked late at night', false, 'It sells out early in the morning.')], explain: { en: '〜にしか〜ない: only (with a negative verb).' } },
      I: { kind: 'choose', item: 'c:atlas_name_tuesday_I', ctx: { jp: '「{火曜日|かようび} に しか {焼|や}かない の は 、 {店主|てんしゅ} の {母|はは} が {火曜日|かようび} {生|う}まれ だった から だ そう だ 。」', en: '"Apparently the reason it\'s only baked on Tuesdays is that the owner\'s mother was born on a Tuesday."' }, prompt: { en: 'Why only on Tuesdays, according to this?' },
        options: [opt('{店主|てんしゅ} の {母|はは} の {生|う}まれた {曜日|ようび} だ から', true), opt('{火曜日|かようび} は {小麦粉|こむぎこ} が {安|やす}い から', false, 'The reason given is about the owner\'s mother.'), opt('{店主|てんしゅ} {本人|ほんにん} が {火曜日|かようび} {生|う}まれ だ から', false, 'It was the owner\'s MOTHER (店主の母).')], explain: { en: '〜そうだ (after a plain form): I hear that …' } },
      A: { kind: 'choose', item: 'c:atlas_name_tuesday_A', ctx: { jp: '「{毎日|まいにち} {焼|や}けば いい の に 、 と {言|い}う {客|きゃく} も いた が 、 {店主|てんしゅ} は {首|くび} を {縦|たて} に {振|ふ}らなかった 。 {待|ま}つ {日|ひ} が ある から こそ 、 {火曜日|かようび} が {特別|とくべつ} に なる の だ と 。」', en: '"Some customers said: why not bake it every day? The owner never agreed. It is precisely because there are days to wait, they said, that Tuesday becomes special."' }, prompt: { en: 'What was the baker\'s reason?' },
        options: [opt('{待|ま}つ {時間|じかん} が あって こそ 、 {特別|とくべつ} な {日|ひ} に なる から', true), opt('{毎日|まいにち} {焼|や}く {余裕|よゆう} が なかった から', false, 'Time or money isn\'t mentioned; the reason is about waiting.'), opt('{客|きゃく} が {毎日|まいにち} {来|こ}なかった から', false, 'Customers wanted it every day.')], explain: { en: '首を縦に振らない: not to nod — refuse. 〜からこそ: precisely because.' } },
    },
  });
  NAME('umbrella', {
    title: { jp: '{傘|かさ} の {持|も}ち{主|ぬし}', en: 'The Umbrella\'s Owner' }, home: 'saltglass', col: '#d8e0e8',
    moored: { jp: '{名前|なまえ} は {傘|かさ} の よう に {開|ひら}いて 、 {港|みなと} の {方|ほう} へ {飛|と}んで いった 。', en: 'The name opens like an umbrella and floats towards the harbour. Someone in Saltglass finally remembers who to thank.' },
    note: { jp: '{雨|あめ} の {日|ひ} に {傘|かさ} を {貸|か}した {人|ひと} の {名前|なまえ} 。', en: 'Not the umbrella that was forgotten, but the name of the person who lent it. They never wanted it back — only to know that the borrower got home dry.' },
    steps: {
      F: { kind: 'write', item: 'v:傘', mode: 'reading', ctx: { jp: '「あめ の ひ に かした …… まだ かえって こない 。」', en: '"The one I lent on a rainy day… still hasn\'t come back."' }, prompt: { en: 'It lent something on a rainy day. Write "kasa" (umbrella).' }, answer: 'かさ', accept: ['かさ', '傘'], explain: { en: 'かさ (kasa) — umbrella.' } },
      E: { kind: 'choose', item: 'c:atlas_name_umbrella_E', ctx: { jp: '「{雨|あめ} の {日|ひ} に {傘|かさ} を {貸|か}しました 。 まだ {返|かえ}して もらって いません 。」', en: '"I lent my umbrella on a rainy day. I haven\'t had it back yet."' }, prompt: { en: 'Whose name is this?' },
        options: [oen('The owner of an umbrella that was lent and never returned', true), oen('Someone who borrowed an umbrella and returned it', false, '貸しました — this person LENT it; 返してもらっていません — not given back.'), oen('An umbrella shop', false, 'It is one person\'s umbrella.')], explain: { en: '貸す: lend. 返してもらう: have (something) returned to you.' } },
      I: { kind: 'choose', item: 'c:atlas_name_umbrella_I', ctx: { jp: '「{返|かえ}して ほしい わけ じゃ ない 。 ただ 、 あの {日|ひ} {濡|ぬ}れずに {帰|かえ}れた か どう か 、 {知|し}りたい だけ だ 。」', en: '"It\'s not that I want it back. I just want to know whether they got home that day without getting soaked."' }, prompt: { en: 'What does the owner really want?' },
        options: [opt('{借|か}りた {人|ひと} が {無事|ぶじ} に {帰|かえ}れた か {知|し}りたい', true), opt('{傘|かさ} を {返|かえ}して ほしい', false, '返してほしいわけじゃない — it is NOT that.'), opt('{新|あたら}しい {傘|かさ} が ほしい', false, 'The owner wants news, not an umbrella.')], explain: { en: '〜わけじゃない: it isn\'t that … ; 〜ずに: without doing.' } },
      A: { kind: 'choose', item: 'c:atlas_name_umbrella_A', ctx: { jp: '「{貸|か}した {方|ほう} は {覚|おぼ}えて いて 、 {借|か}りた {方|ほう} は {忘|わす}れて いる 。 よく ある {話|はなし} だ が 、 この {場合|ばあい} 、 {忘|わす}れられた の は {傘|かさ} で は なく 、 {貸|か}した {人|ひと} の {名前|なまえ} の {方|ほう} だった 。」', en: '"The lender remembers; the borrower forgets. A common enough story — except that here, what was forgotten was not the umbrella but the lender\'s name."' }, prompt: { en: 'What was actually forgotten?' },
        options: [opt('{傘|かさ} を {貸|か}して くれた {人|ひと} の {名前|なまえ}', true), opt('{傘|かさ} そのもの', false, '傘ではなく — not the umbrella.'), opt('{雨|あめ} が {降|ふ}った {日|ひ} の こと', false, 'The day is remembered; the name is not.')], explain: { en: '〜ではなく、〜の方: not …, but rather …' } },
    },
  });
  NAME('starcat', {
    title: { jp: 'ホシ と いう {猫|ねこ}', en: 'A Cat Called Hoshi' }, home: 'snowbell', col: '#e0e0f0',
    moored: { jp: '{名前|なまえ} は 、 {足音|あしおと} も {立|た}てずに {雪|ゆき} の {方|ほう} へ {帰|かえ}って いった 。', en: 'The name pads away towards the snow. On the observatory roof, a cat settles on the warm telescope, exactly where it shouldn\'t.' },
    note: { jp: '{望遠鏡|ぼうえんきょう} の {上|うえ} で {寝|ね}る の が {好|す}き な {猫|ねこ} 。', en: 'The observatory cat slept on the telescope and ruined a great many observations. On the nights it was missing, the astronomer recorded nothing at all.' },
    steps: {
      F: { kind: 'write', item: 'v:星', mode: 'reading', ctx: { jp: '「にゃあ 。」 よる に なる と 、 いつも そら を みて いた 。', en: '"Miaow." When night came, it was always looking at the sky.' }, prompt: { en: 'The cat was named after what it watched at night. Write "hoshi" (star).' }, answer: 'ほし', accept: ['ほし', '星', 'ホシ'], explain: { en: 'ほし (hoshi) — star. As the cat\'s name it would usually be written ホシ.' } },
      E: { kind: 'choose', item: 'c:atlas_name_starcat_E', ctx: { jp: '「{天文台|てんもんだい} の {猫|ねこ} です 。 {夜|よる} に なる と 、 いつも {星|ほし} を {見|み}て いました 。」', en: '"I am the observatory\'s cat. When night came, I was always looking at the stars."' }, prompt: { en: 'What is this name?' },
        options: [oen('The observatory cat that watched the stars', true), oen('A star named after a cat', false, 'It is a cat (猫です).'), oen('A cat that slept every night', false, 'At night it watched the stars.')], explain: { en: '〜になると: when it becomes …' } },
      I: { kind: 'choose', item: 'c:atlas_name_starcat_I', ctx: { jp: '「{望遠鏡|ぼうえんきょう} の {上|うえ} で {寝|ね}る の が {好|す}き で 、 {博士|はかせ} が {観測|かんそく} できない と {困|こま}って いた の を {覚|おぼ}えて いる 。」', en: '"I loved sleeping on top of the telescope — I remember the professor fretting that he couldn\'t make his observations."' }, prompt: { en: 'What happened?' },
        options: [opt('{猫|ねこ} が {望遠鏡|ぼうえんきょう} の {上|うえ} で {寝|ね}て 、 {観測|かんそく} の {邪魔|じゃま} を して いた', true), opt('{猫|ねこ} が {望遠鏡|ぼうえんきょう} を {壊|こわ}して しまった', false, 'It slept on it; nothing broke.'), opt('{博士|はかせ} が {猫|ねこ} を {観測|かんそく} して いた', false, 'He couldn\'t observe (観測できない) because of the cat.')], explain: { en: '〜のが好き: to like doing … ; 困る: to be troubled.' } },
      A: { kind: 'choose', item: 'c:atlas_name_starcat_A', ctx: { jp: '「{博士|はかせ} は {文句|もんく} ばかり {言|い}って いた が 、 {猫|ねこ} の いない {夜|よる} に は 、 なぜか {星|ほし} を {一|ひと}つ も {記録|きろく} して いなかった らしい 。」', en: '"The professor did nothing but complain — yet on nights when the cat was absent, for some reason, he apparently recorded not a single star."' }, prompt: { en: 'What does this suggest about the astronomer?' },
        options: [opt('{文句|もんく} を {言|い}い つつ も 、 {猫|ねこ} が いない と {落|お}ち{着|つ}かなかった', true), opt('{猫|ねこ} が いない {夜|よる} は 、 いつも {曇|くも}って いた', false, 'なぜか hints at a personal reason, not the weather.'), opt('{猫|ねこ} の {代|か}わり に {星|ほし} を {記録|きろく} して いた', false, 'He recorded nothing on those nights.')], explain: { en: 'ばかり: nothing but; なぜか: for some reason.' } },
    },
  });
  NAME('tomorrow', {
    title: { jp: 'また あした', en: 'See You Tomorrow' }, home: 'lanternfall', col: '#e8e0f0',
    moored: { jp: '{言葉|ことば} は 、 ひとり で {橋|はし} を {渡|わた}って いった 。', en: 'The words cross the bridge by themselves. In Lanternfall, two grown friends exchange letters that still end the same way.' },
    note: { jp: '{毎日|まいにち} 、 {橋|はし} の {上|うえ} で {交|か}わした {言葉|ことば} 。', en: 'Two children said it on the Lanternfall bridge every evening, and kept saying it on the last day, when one of them was moving away. Less a promise than a hope.' },
    steps: {
      F: { kind: 'write', item: 'v:明日', mode: 'reading', ctx: { jp: '「また …… 」 ふたり の こども の こえ 。', en: '"See you…" Two children\'s voices.' }, prompt: { en: 'They said "mata ashita" (see you tomorrow). Write "ashita" (tomorrow).' }, answer: 'あした', accept: ['あした', '明日'], explain: { en: 'あした (ashita) — tomorrow. また あした: see you tomorrow.' } },
      E: { kind: 'choose', item: 'c:atlas_name_tomorrow_E', ctx: { jp: '「{毎日|まいにち} 、 {橋|はし} の {上|うえ} で 「また あした 」 と {言|い}って {別|わか}れました 。」', en: '"Every day we parted on the bridge saying \'see you tomorrow\'."' }, prompt: { en: 'What is this name?' },
        options: [oen('A goodbye two people said every day on a bridge', true), oen('A promise to meet again next year', false, 'あした is tomorrow, and it was every day.'), oen('A greeting said in the morning', false, '別れました — they said it when parting.')], explain: { en: '別れる: to part, say goodbye.' } },
      I: { kind: 'choose', item: 'c:atlas_name_tomorrow_I', ctx: { jp: '「ある {日|ひ} 、 {片方|かたほう} の {子|こ} が {引|ひ}っ{越|こ}す こと に なった 。 それでも 、 {最後|さいご} の {日|ひ} まで 「さようなら 」 と は {言|い}わなかった 。」', en: '"One day, one of the children was going to move away. Even so, right up to the last day, neither said \'goodbye\'."' }, prompt: { en: 'Why might they never have said "goodbye"?' },
        options: [opt('{本当|ほんとう} の {別|わか}れ に したく なかった から', true), opt('「さようなら 」 と いう {言葉|ことば} を {知|し}らなかった から', false, 'The point is choosing not to say it.'), opt('{引|ひ}っ{越|こ}す こと を {知|し}らなかった から', false, 'They knew: 引っ越すことになった.')], explain: { en: '〜ことになる: it is decided that … ; それでも: even so.' } },
      A: { kind: 'choose', item: 'c:atlas_name_tomorrow_A', ctx: { jp: '「「また あした 」 は 、 {守|まも}れる か どう か {分|わ}からない {約束|やくそく} だ 。 それでも {毎日|まいにち} {口|くち} に する うち に 、 {約束|やくそく} と いう より 、 {祈|いの}り に {近|ちか}い もの に なって いった 。」', en: '"\'See you tomorrow\' is a promise you can\'t know you\'ll keep. Yet said every day, it became something closer to a prayer than a promise."' }, prompt: { en: 'How does the passage see "see you tomorrow"?' },
        options: [opt('{確|たし}か で は ない が 、 そう なる よう に {願|ねが}う {言葉|ことば}', true), opt('{必|かなら}ず {守|まも}られる {約束|やくそく}', false, 'It says you can\'t know whether it will be kept.'), opt('{意味|いみ} の ない ただ の {挨拶|あいさつ}', false, 'It grew into something closer to a prayer.')], explain: { en: '〜うちに: in the course of; 〜というより: rather than …' } },
    },
  });
  NAME('postscript', {
    title: { jp: '{追伸|ついしん}', en: 'The Postscript' }, home: 'lanternfall', col: '#f4ecd8',
    moored: { jp: '{追伸|ついしん} は 、 {自分|じぶん} の {手紙|てがみ} を {探|さが}しに ひらひら と {飛|と}んで いった 。', en: 'The postscript flutters off to find its letter. Somewhere, someone picks up a kettle — carefully.' },
    note: { jp: '「{追伸|ついしん} 。 やかん の {取|と}っ{手|て} が ゆるい から 、 {気|き}を つけて 。」', en: '"P.S. The kettle handle is loose, so mind your hand." The letter above it was all apologies; the one line anyone would believe was the last.' },
    steps: {
      F: { kind: 'write', item: 'v:手紙', mode: 'reading', ctx: { jp: '「…… の いちばん さいご に かいて あった 。」', en: '"It was written at the very end of a …"' }, prompt: { en: 'It fell off the end of a letter. Write "tegami" (letter).' }, answer: 'てがみ', accept: ['てがみ', '手紙'], explain: { en: 'てがみ (tegami) — letter.' } },
      E: { kind: 'choose', item: 'c:atlas_name_postscript_E', ctx: { jp: '「{追伸|ついしん} 。 やかん の {取|と}っ{手|て} が ゆるい から 、 {気|き}を つけて ください 。」', en: '"P.S. The kettle handle is loose, so please be careful."' }, prompt: { en: 'What is this name?' },
        options: [oen('A postscript warning that the kettle handle is loose', true), oen('A recipe for tea', false, 'It is about the kettle\'s handle.'), oen('A note saying the kettle is new', false, 'ゆるい means loose, not new.')], explain: { en: '気をつけて: take care, be careful.' } },
      I: { kind: 'choose', item: 'c:atlas_name_postscript_I', ctx: { jp: '「{本文|ほんぶん} に は 、 {謝|あやま}る {言葉|ことば} ばかり が {並|なら}んで いた 。 {本当|ほんとう} に {伝|つた}えたかった の は 、 むしろ {最後|さいご} の {一行|いちぎょう} の {方|ほう} だった の かも しれない 。」', en: '"The body of the letter was nothing but apologies. What the writer really wanted to say may have been the last line instead."' }, prompt: { en: 'What does this suggest?' },
        options: [opt('{相手|あいて} を {気|き}づかう {気持|きも}ち は 、 {追伸|ついしん} に こそ {表|あらわ}れて いた', true), opt('{謝|あやま}る {言葉|ことば} が {一番|いちばん} {大切|たいせつ} だった', false, 'むしろ: rather — the last line mattered more.'), opt('{追伸|ついしん} は {書|か}き{間違|まちが}い だった', false, 'Nothing says it was a mistake.')], explain: { en: 'むしろ: rather, if anything. 〜かもしれない: might be.' } },
      A: { kind: 'choose', item: 'c:atlas_name_postscript_A', ctx: { jp: '「「{気|き}を つけて 」 と {書|か}く だけ なら 、 {誰|だれ} に でも できる 。 やかん の {取|と}っ{手|て} が ゆるい こと を {知|し}って いる の は 、 {同|おな}じ {台所|だいどころ} に {立|た}った こと の ある {者|もの} だけ だ 。」', en: '"Anyone can write \'take care\'. Only someone who has stood in the same kitchen knows the kettle handle is loose."' }, prompt: { en: 'What does the postscript reveal about the writer?' },
        options: [opt('{相手|あいて} と {同|おな}じ {台所|だいどころ} で {暮|く}らした こと が ある', true), opt('やかん を {売|う}った {店|みせ} の {人|ひと} で ある', false, 'The clue is shared everyday life, not selling.'), opt('{台所|だいどころ} に {入|はい}った こと が ない', false, 'The opposite: they have stood in that kitchen.')], explain: { en: '〜たことのある: who has (ever) done …' } },
    },
  });
  A.nameOrder = ['ferry', 'mochi', 'verse', 'shortcut', 'umeboshi', 'tuesday', 'umbrella', 'starcat', 'tomorrow', 'postscript'];

  // =====================================================================================
  // Inscriptions (restore a word on a stone, shelf label or lantern shade). Also knot drills.
  // =====================================================================================
  const INS = (lv, n, d) => add(Object.assign({ id: 'atlas.ins.' + lv + n, lv, tags: ['atlas', 'atlas_ins', 'atlas_knot'], kind: 'write', mode: 'reading' }, d));
  INS('F', 1, { item: 'v:道', template: { before: '', after: ' は どこ へ つづく ？' }, prompt: { en: 'The stone asks where the road leads. Write "michi" (road).' }, answer: 'みち', accept: ['みち', '道'], explain: { en: 'みち (michi) — road, way.' } });
  INS('F', 2, { item: 'v:橋', template: { before: 'かわ の ', after: ' を わたる 。' }, prompt: { en: 'Cross the river by the … Write "hashi" (bridge).' }, answer: 'はし', accept: ['はし', '橋'], explain: { en: 'はし (hashi) — bridge (the same sound can also mean chopsticks or edge).' } });
  INS('F', 3, { item: 'v:山', template: { before: '', after: ' の うえ へ 。' }, prompt: { en: 'Up the … Write "yama" (mountain).' }, answer: 'やま', accept: ['やま', '山'], explain: { en: 'やま (yama) — mountain.' } });
  INS('F', 4, { item: 'v:空', template: { before: 'よる の ', after: ' に ほし が でる 。' }, prompt: { en: 'Stars come out in the night … Write "sora" (sky).' }, answer: 'そら', accept: ['そら', '空'], explain: { en: 'そら (sora) — sky.' } });
  INS('F', 5, { item: 'v:海', template: { before: '', after: ' へ つづく みち 。' }, prompt: { en: 'A road leading to the … Write "umi" (sea).' }, answer: 'うみ', accept: ['うみ', '海'], explain: { en: 'うみ (umi) — sea.' } });
  INS('F', 6, { item: 'v:家', template: { before: '', after: ' に かえる 。' }, prompt: { en: 'Going back … Write "ie" (home, house).' }, answer: 'いえ', accept: ['いえ', '家'], explain: { en: 'いえ (ie) — house, home.' } });
  INS('E', 1, { item: 'v:名前', template: { before: 'この {灯籠|とうろう} に は 、 {村|むら} の ', after: ' が {書|か}いて ありました 。' }, prompt: { en: 'Write the missing word: "name".' }, answer: 'なまえ', accept: ['なまえ', '名前'], explain: { jp: '{名前|なまえ}', en: 'なまえ — name. 書いてありました: had been written (and was there to see).' } });
  INS('E', 2, { item: 'v:約束', template: { before: '{必|かなら}ず {帰|かえ}る と ', after: ' しました 。' }, prompt: { en: 'Write the missing word: "promise".' }, answer: 'やくそく', accept: ['やくそく', '約束'], explain: { jp: '{約束|やくそく}', en: 'やくそく — promise; 約束する: to promise.' } });
  INS('E', 3, { item: 'v:地図', template: { before: 'この ', after: ' に は 、 まだ {何|なに} も {書|か}いて いません 。' }, prompt: { en: 'Write the missing word: "map".' }, answer: 'ちず', accept: ['ちず', '地図'], explain: { jp: '{地図|ちず}', en: 'ちず — map.' } });
  INS('E', 4, { item: 'v:友達', template: { before: '{橋|はし} の むこう で 、 ', after: ' が {待|ま}って います 。' }, prompt: { en: 'Write the missing word: "friend".' }, answer: 'ともだち', accept: ['ともだち', '友達', '友だち'], explain: { jp: '{友達|ともだち}', en: 'ともだち — friend.' } });
  INS('E', 5, { item: 'v:北', template: { before: 'この {道|みち} を ', after: ' へ {行|い}く と 、 {雪鈴|ゆきすず} です 。' }, prompt: { en: 'Write the missing word: "north".' }, answer: 'きた', accept: ['きた', '北'], explain: { jp: '{北|きた}', en: 'きた — north. (みなみ south, ひがし east, にし west.)' } });
  INS('E', 6, { item: 'v:港', template: { before: '{船|ふね} は ', after: ' に {帰|かえ}って きます 。' }, prompt: { en: 'Write the missing word: "harbour".' }, answer: 'みなと', accept: ['みなと', '港'], explain: { jp: '{港|みなと}', en: 'みなと — harbour, port.' } });
  INS('I', 1, { item: 'v:忘れる', template: { before: '{名前|なまえ} を {書|か}いて おけば 、 {誰|だれ} も ', after: ' でしょう 。' }, prompt: { en: 'Fill the gap with "forget" in the negative: "(then) nobody will forget".' }, answer: 'わすれない', accept: ['わすれない', '忘れない'], explain: { en: '忘れない — won\'t forget. 〜ておけば: if you do it in advance.' } });
  INS('I', 2, { item: 'g:tame', template: { before: '{道|みち} を {直|なお}す ', after: ' 、 {村|むら} の {人|ひと} が {集|あつ}まった 。' }, prompt: { en: 'Fill the gap: "in order to (mend the road)".' }, answer: 'ために', accept: ['ために', '為に'], explain: { en: 'Dictionary form + ために: in order to.' } });
  INS('I', 3, { item: 'g:v_nagara', template: { before: '{地図|ちず} を {見|み}', after: ' {歩|ある}く と 、 {道|みち} に {迷|まよ}わない 。' }, prompt: { en: 'Fill the gap: "while (looking at the map)".' }, answer: 'ながら', accept: ['ながら'], explain: { en: 'Verb stem + ながら: while doing.' } });
  INS('I', 4, { item: 'g:hazu', template: { before: 'ここ に {橋|はし} が ある ', after: ' な のに 、 {見|み}えない 。' }, prompt: { en: 'Fill the gap: "there should be (a bridge here)".' }, answer: 'はず', accept: ['はず', '筈'], explain: { en: '〜はず: should be (expectation based on reasons).' } });
  INS('I', 5, { item: 'g:cond_tara', template: { before: '{灯|ひ} が {消|き}え', after: ' 、 すぐ に {戻|もど}って きて ください 。' }, prompt: { en: 'Fill the gap: "if / when (the light goes out)".' }, answer: 'たら', accept: ['たら'], explain: { en: '〜たら: if / when (once something happens).' } });
  INS('I', 6, { item: 'g:sou_look', template: { before: 'この {橋|はし} は 、 {今|いま} に も {落|お}ち', after: ' だ 。' }, prompt: { en: 'Fill the gap: "looks as if (it will fall at any moment)".' }, answer: 'そう', accept: ['そう'], explain: { en: 'Verb stem + そうだ: looks as if it will …' } });
  const INSA = (n, d) => add(Object.assign({ id: 'atlas.ins.A' + n, lv: 'A', tags: ['atlas', 'atlas_ins'], kind: 'choose', prompt: { en: 'Restore the missing words on the inscription.' } }, d));
  INSA(1, { item: 'g:register_polite_plain', ctx: { jp: '{本|ほん} {街道|かいどう} は 、 {修復|しゅうふく} {工事|こうじ} の ため 、 {当分|とうぶん} の {間|あいだ} ＿＿ 。', en: 'Due to repair works, this main road will ＿＿ for the time being.' },
    options: [opt('{通行止|つうこうど}め と なります', true), opt('{通|とお}れない よ', false, 'Far too casual for an official notice.'), opt('{通|とお}って ください', false, 'That contradicts "repair works".')], explain: { en: 'Notices use formal set phrases: 通行止めとなります — will be closed to traffic.' } });
  INSA(2, { item: 'g:adv_wake_dewa_nai', ctx: { jp: '{地図|ちず} に {載|の}って いない ＿＿ 、 {道|みち} が ない わけ で は ない 。', en: 'Just ＿＿ it isn\'t on the map doesn\'t mean there is no road.' },
    options: [opt('から と いって', true), opt('から こそ', false, 'からこそ (precisely because) would make it nonsense.'), opt('ばかり か', false, 'ばかりか (not only) doesn\'t fit before わけではない.')], explain: { en: '〜からといって〜わけではない: just because … doesn\'t mean …' } });
  INSA(3, { item: 'g:prt_sae', ctx: { jp: '{名前|なまえ} を {失|うしな}った {道|みち} は 、 やがて {道|みち} で ある こと ＿＿ {忘|わす}れて しまう 。', en: 'A road that has lost its name eventually forgets ＿＿ that it is a road.' },
    options: [opt('さえ', true), opt('こそ', false, 'こそ stresses the thing as THE one; the sense here is "even".'), opt('しか', false, 'しか needs a negative verb.')], explain: { en: 'さえ: even (an extreme example).' } });
  INSA(4, { item: 'g:adv_to_iu_yori', ctx: { jp: 'これ は {道標|みちしるべ} と いう ＿＿ 、 {誰|だれ}か の {祈|いの}り の {跡|あと} だ 。', en: 'This is not so much a signpost ＿＿ the trace of someone\'s prayer.' },
    options: [opt('より', true), opt('ほど', false, 'というほど means "to the extent of", which doesn\'t fit.'), opt('から', false, 'というから means "because it is said", which doesn\'t fit.')], explain: { en: '〜というより: rather than (calling it) …' } });
  INSA(5, { item: 'g:adv_nimokakawarazu', ctx: { jp: '{何度|なんど} {嵐|あらし} が {来|き}た ＿＿ 、 この {橋|はし} は {落|お}ちなかった 。', en: '＿＿ how many storms came, this bridge never fell.' },
    options: [opt('に も かかわらず', true), opt('から こそ', false, 'Storms are not why it stood.'), opt('ついでに', false, 'ついでに (while at it) makes no sense here.')], explain: { en: '〜にもかかわらず: despite …' } });
  INSA(6, { item: 'g:adv_ni_suginai', ctx: { jp: 'この {石|いし} は 、 {道|みち} の {始|はじ}まり を {示|しめ}す {目印|めじるし} ＿＿ 。 {本当|ほんとう} の {道|みち} は 、 {歩|ある}く {人|ひと} の {数|かず} だけ ある 。', en: 'This stone is ＿＿ a marker showing where the road begins. The real road is as many as the people who walk it.' },
    options: [opt('に すぎない', true), opt('に こした こと は ない', false, 'That means "nothing is better than", which doesn\'t fit.'), opt('どころ で は ない', false, 'That means "far from being", which doesn\'t fit.')], explain: { en: '〜にすぎない: is nothing more than.' } });
  // Extra knot drills (short restorations for battles).
  const KN = (lv, n, d) => add(Object.assign({ id: 'atlas.knot.' + lv + n, lv, tags: ['atlas', 'atlas_knot'], kind: 'write', mode: 'reading' }, d));
  KN('F', 1, { item: 'v:風', template: { before: '', after: ' が ふく 。' }, prompt: { en: 'The … blows. Write "kaze" (wind).' }, answer: 'かぜ', accept: ['かぜ', '風'] });
  KN('F', 2, { item: 'v:月', template: { before: 'よる の ', after: ' 。' }, prompt: { en: 'The night … Write "tsuki" (moon).' }, answer: 'つき', accept: ['つき', '月'] });
  KN('E', 1, { item: 'v:明かり', template: { before: '{暗|くら}い {道|みち} に ', after: ' が ほしい です 。' }, prompt: { en: 'Write the missing word: "light (a lamp\'s light)".' }, answer: 'あかり', accept: ['あかり', '明かり', '灯り'] });
  KN('E', 2, { item: 'v:印', template: { before: '{分|わ}かれ{道|みち} に ', after: ' を つけました 。' }, prompt: { en: 'Write the missing word: "mark".' }, answer: 'しるし', accept: ['しるし', '印'] });
  KN('I', 1, { item: 'v:目印', template: { before: 'あの {大|おお}きな {木|き} を ', after: ' に して {進|すす}んで ください 。' }, prompt: { en: 'Write the missing word: "landmark".' }, answer: 'めじるし', accept: ['めじるし', '目印'] });
  KN('I', 2, { item: 'v:道標', template: { before: '', after: ' が {倒|たお}れて いた ので 、 {道|みち} を {間違|まちが}えた 。' }, prompt: { en: 'Write the missing word: "signpost, waymarker".' }, answer: 'みちしるべ', accept: ['みちしるべ', '道標'] });
  KN('A', 1, { item: 'v:絶える', template: { before: 'この {街道|かいどう} は 、 {昔|むかし} から {人|ひと} の {往来|おうらい} が ', after: ' 。' }, prompt: { en: 'Fill the gap: "never ceases" (the stream of travellers).' }, answer: 'たえない', accept: ['たえない', '絶えない'] });
  KN('A', 2, { item: 'v:行方', template: { before: '{名|な} を {失|うしな}った {人|ひと} の ', after: ' は 、 {誰|だれ} も {知|し}らない 。' }, prompt: { en: 'Fill the gap: "whereabouts".' }, answer: 'ゆくえ', accept: ['ゆくえ', '行方'] });

  // =====================================================================================
  // Half-written road signs (put the pieces back in order).
  // =====================================================================================
  const SIGN = (lv, n, d) => add(Object.assign({ id: 'atlas.sign.' + lv + n, lv, tags: ['atlas', 'atlas_sign'], kind: 'order', prompt: { en: 'The sign has come apart. Put its words back in order.' } }, d));
  SIGN('F', 1, { item: 'g:prt_he', tiles: ['やま', 'へ', 'いく'], answer: ['やま', 'へ', 'いく'], orderHint: { en: 'へ follows the place you are going to.' } });
  SIGN('F', 2, { item: 'g:prt_wa', tiles: ['うみ', 'は', 'こっち'], answer: ['うみ', 'は', 'こっち'], alts: [['こっち', 'は', 'うみ']], orderHint: { en: 'は follows the topic: "the sea — this way".' } });
  SIGN('F', 3, { item: 'g:prt_wo', tiles: ['はし', 'を', 'わたる'], answer: ['はし', 'を', 'わたる'], orderHint: { en: 'を follows what you cross; the verb comes last.' } });
  SIGN('F', 4, { item: 'g:prt_ni', tiles: ['いえ', 'に', 'かえる'], answer: ['いえ', 'に', 'かえる'], orderHint: { en: 'に follows the place you return to; the verb comes last.' } });
  SIGN('F', 5, { item: 'g:prt_no', tiles: ['もり', 'の', 'みち'], answer: ['もり', 'の', 'みち'], orderHint: { en: 'A の B: B of A — "the forest\'s road".' } });
  SIGN('E', 1, { item: 'g:prt_ni', tiles: ['{橋|はし} の', 'むこう に', '{村|むら} が', 'あります'], answer: ['{橋|はし} の', 'むこう に', '{村|むら} が', 'あります'], alts: [['{村|むら} が', '{橋|はし} の', 'むこう に', 'あります']], orderHint: { en: 'Place に, thing が, あります at the end.' } });
  SIGN('E', 2, { item: 'g:v_te_kudasai', tiles: ['{右|みぎ} に', '{曲|ま}がって', 'ください'], answer: ['{右|みぎ} に', '{曲|ま}がって', 'ください'], orderHint: { en: 'て-form + ください: please do …' } });
  SIGN('E', 3, { item: 'g:v_naide_kudasai', tiles: ['{夜|よる} は', 'この {道|みち} を', '{通|とお}らないで', 'ください'], answer: ['{夜|よる} は', 'この {道|みち} を', '{通|とお}らないで', 'ください'], alts: [['この {道|みち} を', '{夜|よる} は', '{通|とお}らないで', 'ください']], orderHint: { en: '〜ないでください: please don\'t …' } });
  SIGN('E', 4, { item: 'g:cond_tara', tiles: ['{灯|ひ} が', '{消|き}えたら', '{戻|もど}って', 'ください'], answer: ['{灯|ひ} が', '{消|き}えたら', '{戻|もど}って', 'ください'], orderHint: { en: 'The condition (〜たら) comes before the request.' } });
  SIGN('E', 5, { item: 'g:prt_kara_made', tiles: ['ここ から', '{村|むら} まで', '{歩|ある}いて', '{十分|じゅっぷん} です'], answer: ['ここ から', '{村|むら} まで', '{歩|ある}いて', '{十分|じゅっぷん} です'], alts: [['{村|むら} まで', 'ここ から', '{歩|ある}いて', '{十分|じゅっぷん} です']], orderHint: { en: 'から (from) … まで (to) …, then how long.' } });
  SIGN('I', 1, { item: 'g:cond_to', tiles: ['{川|かわ} を {渡|わた}って', '{二|ふた}つ {目|め} の {角|かど} を', '{左|ひだり} に {曲|ま}がる と', '{宿|やど} が {見|み}えて きます'], answer: ['{川|かわ} を {渡|わた}って', '{二|ふた}つ {目|め} の {角|かど} を', '{左|ひだり} に {曲|ま}がる と', '{宿|やど} が {見|み}えて きます'], orderHint: { en: 'Follow the directions in the order you would walk them.' } });
  SIGN('I', 2, { item: 'g:conj_node', tiles: ['{雨|あめ} が {降|ふ}ったら', '{橋|はし} が {滑|すべ}りやすく なる ので', '{気|き}を つけて', '{渡|わた}って ください'], answer: ['{雨|あめ} が {降|ふ}ったら', '{橋|はし} が {滑|すべ}りやすく なる ので', '{気|き}を つけて', '{渡|わた}って ください'], orderHint: { en: 'Condition, then reason (ので), then the request.' } });
  SIGN('I', 3, { item: 'g:tame', tiles: ['この {先|さき} は', '{道|みち} が {細|ほそ}く なる ため', '{荷物|にもつ} の {多|おお}い {方|かた} は', '{左|ひだり} の {道|みち} を ご{利用|りよう} ください'], answer: ['この {先|さき} は', '{道|みち} が {細|ほそ}く なる ため', '{荷物|にもつ} の {多|おお}い {方|かた} は', '{左|ひだり} の {道|みち} を ご{利用|りよう} ください'], alts: [['{荷物|にもつ} の {多|おお}い {方|かた} は', 'この {先|さき} は', '{道|みち} が {細|ほそ}く なる ため', '{左|ひだり} の {道|みち} を ご{利用|りよう} ください']], orderHint: { en: 'ため gives the reason; the polite request ご〜ください closes the sign.' } });
  SIGN('I', 4, { item: 'g:mae_ato', tiles: ['{日|ひ} が {暮|く}れる {前|まえ} に', '{峠|とうげ} を {越|こ}えない と', '{次|つぎ} の {宿|やど} まで', '{明|あ}かり が ありません'], answer: ['{日|ひ} が {暮|く}れる {前|まえ} に', '{峠|とうげ} を {越|こ}えない と', '{次|つぎ} の {宿|やど} まで', '{明|あ}かり が ありません'], orderHint: { en: 'When (前に), what must happen (〜ないと), then the consequence.' } });
  SIGN('I', 5, { item: 'g:conj_node', tiles: ['{地図|ちず} に {書|か}いて ある {道|みち} が', 'いつも {正|ただ}しい と は', '{限|かぎ}らない ので', '{地元|じもと} の {人|ひと} に {聞|き}いて ください'], answer: ['{地図|ちず} に {書|か}いて ある {道|みち} が', 'いつも {正|ただ}しい と は', '{限|かぎ}らない ので', '{地元|じもと} の {人|ひと} に {聞|き}いて ください'], orderHint: { en: '〜とは限らない: is not necessarily …' } });
  SIGN('A', 1, { item: 'g:register_polite_plain', tiles: ['{本道|ほんどう} は', '{落石|らくせき} の {恐|おそ}れ が ある ため', '{当面|とうめん} の {間|あいだ}', '{通行止|つうこうど}め と いたします'], answer: ['{本道|ほんどう} は', '{落石|らくせき} の {恐|おそ}れ が ある ため', '{当面|とうめん} の {間|あいだ}', '{通行止|つうこうど}め と いたします'], alts: [['{本道|ほんどう} は', '{当面|とうめん} の {間|あいだ}', '{落石|らくせき} の {恐|おそ}れ が ある ため', '{通行止|つうこうど}め と いたします']], orderHint: { en: 'Topic, reason (ため), period, then the formal announcement.' } });
  SIGN('A', 2, { item: 'g:v_you_to_suru', tiles: ['{道|みち} に {迷|まよ}った {際|さい} は', '{無理|むり} に {進|すす}もう と せず', '{最寄|もよ}り の {灯籠|とうろう} まで', '{引|ひ}き{返|かえ}す こと'], answer: ['{道|みち} に {迷|まよ}った {際|さい} は', '{無理|むり} に {進|すす}もう と せず', '{最寄|もよ}り の {灯籠|とうろう} まで', '{引|ひ}き{返|かえ}す こと'], orderHint: { en: 'Instruction notices end in 〜こと. せず = しないで.' } });
  SIGN('A', 3, { item: 'g:passive', tiles: ['この {橋|はし} は', '{長年|ながねん} {村人|むらびと} の {手|て} で', '{守|まも}られて きた もの で あり', '{許可|きょか} なく {手|て} を {加|くわ}える こと を {禁|きん}ずる'], answer: ['この {橋|はし} は', '{長年|ながねん} {村人|むらびと} の {手|て} で', '{守|まも}られて きた もの で あり', '{許可|きょか} なく {手|て} を {加|くわ}える こと を {禁|きん}ずる'], orderHint: { en: 'であり joins the two clauses in written style; 禁ずる ends the notice.' } });
  SIGN('A', 4, { item: 'g:adv_bakari_ka', tiles: ['{名|な} を {失|うしな}った {道|みち} は', '{誰|だれ} も {通|とお}らなく なる ばかり か', 'やがて {道|みち} で ある こと さえ', '{忘|わす}れられて しまう'], answer: ['{名|な} を {失|うしな}った {道|みち} は', '{誰|だれ} も {通|とお}らなく なる ばかり か', 'やがて {道|みち} で ある こと さえ', '{忘|わす}れられて しまう'], orderHint: { en: '〜ばかりか: not only …; さえ: even.' } });
  SIGN('A', 5, { item: 'g:indirectness', tiles: ['{旅人|たびびと} に {道|みち} を {尋|たず}ねられた {時|とき} は', '{知|し}って いる ふり を せず', '{分|わ}からない なら', '{分|わ}からない と {答|こた}える べき だ'], answer: ['{旅人|たびびと} に {道|みち} を {尋|たず}ねられた {時|とき} は', '{知|し}って いる ふり を せず', '{分|わ}からない なら', '{分|わ}からない と {答|こた}える べき だ'], alts: [['{旅人|たびびと} に {道|みち} を {尋|たず}ねられた {時|とき} は', '{分|わ}からない なら', '{知|し}って いる ふり を せず', '{分|わ}からない と {答|こた}える べき だ']], orderHint: { en: 'When…, (don\'t pretend), (if you don\'t know), answer that you don\'t know.' } });

  // =====================================================================================
  // Promises (what does this actually commit someone to?).
  // =====================================================================================
  const PR = (lv, n, d) => add(Object.assign({ id: 'atlas.promise.' + lv + n, lv, tags: ['atlas', 'atlas_promise'], kind: 'choose', item: 'c:atlas_promise_' + lv + n, prompt: { en: 'This promise has come loose from whoever made it. What does it commit them to?' } }, d));
  PR('F', 1, { ctx: { jp: '「あした くる ね 。」' }, options: [oen('I\'ll come tomorrow.', true), oen('I came today.', false, 'あした is tomorrow.'), oen('I won\'t come.', false, 'くる is come — no negative here.')] });
  PR('F', 2, { ctx: { jp: '「まって て ね 。」' }, options: [oen('Please wait for me.', true), oen('I\'ll wait for you.', false, 'まってて asks the OTHER person to wait.'), oen('Don\'t wait for me.', false, 'There is no negative.')] });
  PR('F', 3, { ctx: { jp: '「かならず かえる 。」' }, options: [oen('I will definitely come back.', true), oen('I might come back.', false, 'かならず means "definitely", "without fail".'), oen('I am not coming back.', false, 'かえる is come back — no negative.')] });
  PR('F', 4, { ctx: { jp: '「いっしょ に いく 。」' }, options: [oen('I\'ll go with you.', true), oen('I\'ll go alone.', false, 'いっしょに means together.'), oen('I\'ll stay here.', false, 'いく means go.')] });
  PR('F', 5, { ctx: { jp: '「あめ なら やすみ 。」' }, options: [oen('If it rains, it\'s off.', true), oen('Even if it rains, we\'ll go.', false, 'なら means "if (that is the case)".'), oen('It\'s going to rain.', false, 'This is a condition, not a forecast.')] });
  PR('F', 6, { ctx: { jp: '「また あそぼう 。」' }, options: [oen('Let\'s play again.', true), oen('Let\'s never play again.', false, 'また means again.'), oen('We played yesterday.', false, 'あそぼう is "let\'s play" — about the future.')] });
  PR('E', 1, { ctx: { jp: '「{雨|あめ} が {降|ふ}って も 、 {迎|むか}え に {行|い}きます 。」' }, options: [oen('I\'ll come to meet you even if it rains.', true), oen('If it rains, I won\'t come.', false, '〜ても means "even if".'), oen('I\'ll come once the rain stops.', false, 'It says even if it rains.')], explain: { en: '〜ても: even if.' } });
  PR('E', 2, { item: 'g:prt_kara_made', ctx: { jp: '「{日曜日|にちようび} まで に {返|かえ}します 。」' }, options: [oen('I\'ll return it by Sunday (at the latest).', true), oen('I\'ll return it on Sunday, not before.', false, 'までに means "by" — any time up to Sunday.'), oen('I\'ll borrow it until Sunday.', false, '返します means "return".')], explain: { en: 'までに: by (a deadline); まで: until.' } });
  PR('E', 3, { ctx: { jp: '「{暗|くら}く なる {前|まえ} に {帰|かえ}って きて ね 。」' }, options: [oen('Come back before it gets dark.', true), oen('Come back after dark.', false, '前に means before.'), oen('Leave before it gets dark.', false, '帰ってきて is "come back".')] });
  PR('E', 4, { ctx: { jp: '「{手紙|てがみ} を {書|か}く から 、 {住所|じゅうしょ} を {教|おし}えて 。」' }, options: [oen('I\'ll write, so tell me your address.', true), oen('Write to me at my address.', false, 'The speaker will write (書くから).'), oen('I\'ve lost your address.', false, 'They are asking for it.')] });
  PR('E', 5, { item: 'g:te_oku', ctx: { jp: '「{毎晩|まいばん} 、 {灯|あか}り を つけて おきます 。」' }, options: [oen('I\'ll light the lamp every night and leave it burning (for you).', true), oen('I\'ll put the light out every night.', false, 'つける means turn on / light.'), oen('I lit the lamp one night.', false, 'おきます is non-past: a promise about every night.')], explain: { en: '〜ておく: do in advance / leave in that state.' } });
  PR('E', 6, { ctx: { jp: '「{橋|はし} が {直|なお}ったら 、 {一番|いちばん} に {渡|わた}ります 。」' }, options: [oen('When the bridge is mended, I\'ll be the first to cross.', true), oen('I\'ll mend the bridge first.', false, '直ったら: once it IS mended (by anyone).'), oen('I crossed the bridge first.', false, 'The promise is about the future.')] });
  PR('I', 1, { ctx: { jp: '「{必要|ひつよう} なら {開|あ}ける 。」', en: '"We\'ll open it if it\'s needed."' }, prompt: { en: 'Two towns read this sluice-gate promise differently. What does it actually commit to?' },
    options: [opt('{必要|ひつよう} だ と {判断|はんだん} したら {開|あ}ける が 、 {誰|だれ} が {判断|はんだん} する か は {決|き}まって いない', true), opt('{相手|あいて} に {頼|たの}まれたら 、 いつ でも {開|あ}ける', false, 'Nothing says the other side decides.'), opt('ずっと {開|あ}けた まま に して おく', false, 'It is conditional (なら).')], explain: { en: 'なら makes it conditional; the promise never says who decides what counts as "needed".' } });
  PR('I', 2, { ctx: { jp: '「{手|て} が {空|あ}いたら 、 {手伝|てつだ}う よ 。」' }, options: [opt('{忙|いそが}しく なくなったら {手伝|てつだ}う', true), opt('{今|いま} すぐ {手伝|てつだ}う', false, '〜たら: once (they are free) — not now.'), opt('{手|て} を {貸|か}して ほしい', false, 'The speaker is offering help, not asking.')], explain: { en: '手が空く: to be free (lit. hands empty).' } });
  PR('I', 3, { ctx: { jp: '「{次|つぎ} に {会|あ}う {時|とき} まで に 、 この {本|ほん} を {読|よ}んで おく 。」' }, options: [opt('{次|つぎ} に {会|あ}う {前|まえ} に 、 {本|ほん} を {読|よ}み{終|お}えて おく', true), opt('{次|つぎ} に {会|あ}った {時|とき} に 、 {一緒|いっしょ}に {本|ほん} を {読|よ}む', false, 'までに: by that time — before meeting.'), opt('{本|ほん} を {貸|か}して おく', false, '読んでおく: read (in advance).')] });
  PR('I', 4, { ctx: { jp: '「もし {私|わたし} が {戻|もど}らなかったら 、 {灯|ひ} は {消|け}さないで 。」' }, options: [opt('{戻|もど}らない {場合|ばあい} で も 、 {灯|ひ} を つけた まま に して ほしい', true), opt('{戻|もど}らなかったら 、 {灯|ひ} を {消|け}して ほしい', false, '消さないで: please DON\'T put it out.'), opt('{戻|もど}る まで {灯|ひ} を つけないで ほしい', false, 'It asks to keep the light burning.')] });
  PR('I', 5, { ctx: { jp: '「{嘘|うそ} は つかない 。 でも 、 {全部|ぜんぶ} は {話|はな}せない 。」' }, options: [opt('{言|い}う こと は {本当|ほんとう} だ が 、 {話|はな}さない こと も ある', true), opt('{全部|ぜんぶ} {本当|ほんとう} の こと を {話|はな}す', false, '全部は話せない: can\'t tell everything.'), opt('{時々|ときどき} {嘘|うそ} を つく', false, '嘘はつかない: won\'t lie.')] });
  PR('I', 6, { item: 'g:tsumori', ctx: { jp: '「{春|はる} に は {戻|もど}る つもり です 。」' }, options: [opt('{春|はる} に {戻|もど}る {予定|よてい} で いる が 、 {確実|かくじつ} だ と は {言|い}って いない', true), opt('{必|かなら}ず {春|はる} に {戻|もど}る と {約束|やくそく} して いる', false, 'つもり is an intention, not a guarantee.'), opt('{春|はる} に は もう {戻|もど}らない', false, 'They intend to come back.')], explain: { en: '〜つもり: intend to.' } });
  PR('A', 1, { ctx: { jp: '「{行|い}けたら {行|い}く 。」' }, options: [opt('{行|い}く と は {言|い}って いる が 、 {実際|じっさい} に は {来|こ}ない {可能性|かのうせい} の {方|ほう} が {高|たか}い', true), opt('{必|かなら}ず {来|く}る と {約束|やくそく} して いる', false, 'In practice this set phrase usually signals a polite "probably not".'), opt('{行|い}けない と はっきり {断|ことわ}って いる', false, 'It avoids a clear refusal — that is the point.')], explain: { en: '行けたら行く: literally "I\'ll go if I can" — conventionally a soft way of not committing.' } });
  PR('A', 2, { item: 'g:keigo_kenjo', ctx: { jp: '「{善処|ぜんしょ} いたします 。」' }, options: [opt('{前向|まえむ}き な {姿勢|しせい} を {示|しめ}して いる が 、 {具体的|ぐたいてき} に {何|なに} を する か は {約束|やくそく} して いない', true), opt('{必|かなら}ず {要望|ようぼう} どおり に する と {約束|やくそく} して いる', false, '善処: deal with it "appropriately" — nothing specific.'), opt('{要望|ようぼう} を はっきり {断|ことわ}って いる', false, 'It sounds positive; it just doesn\'t commit.')], explain: { en: '善処いたします: a humble, official phrase that promises attention, not action.' } });
  PR('A', 3, { ctx: { jp: '「{君|きみ} が {望|のぞ}む なら 、 {私|わたし} は {止|と}めない 。」' }, options: [opt('{賛成|さんせい} は して いない が 、 {邪魔|じゃま} も しない と いう {立場|たちば}', true), opt('{心|こころ} から {応援|おうえん} して いる', false, '止めない is only "won\'t stop you".'), opt('{絶対|ぜったい} に {反対|はんたい} して いる', false, 'They won\'t stand in the way.')] });
  PR('A', 4, { ctx: { jp: '「この {件|けん} は 、 {持|も}ち{帰|かえ}って {検討|けんとう} いたします 。」' }, options: [opt('その {場|ば} で の {返事|へんじ} を {避|さ}け 、 {結論|けつろん} を {先|さき} に {延|の}ばして いる', true), opt('すぐ に {承諾|しょうだく} して いる', false, '持ち帰る: take it back (to consider) — not a yes.'), opt('{提案|ていあん} を {持|も}ち{帰|かえ}って {捨|す}てる と {言|い}って いる', false, 'It says 検討 (consider), not discard.')], explain: { en: '持ち帰って検討する: to take away and consider — a way of deferring.' } });
  PR('A', 5, { ctx: { jp: '「{約束|やくそく} は {守|まも}る 。 ただし 、 {約束|やくそく} した {時|とき} の {私|わたし} が {正|ただ}しかった なら 、 だ 。」' }, options: [opt('{約束|やくそく} を {守|まも}る {条件|じょうけん} と して 、 {当時|とうじ} の {判断|はんだん} が {正|ただ}しかった こと を {求|もと}めて いる', true), opt('どんな {場合|ばあい} で も {約束|やくそく} を {守|まも}る', false, 'ただし adds a condition.'), opt('{約束|やくそく} を {守|まも}る {気|き} は まったく ない', false, 'It keeps the promise — conditionally.')], explain: { en: 'ただし: however, provided that.' } });
  PR('A', 6, { ctx: { jp: '「{今度|こんど} こそ 、 {言葉|ことば} を {濁|にご}さず に {話|はな}す 。」' }, options: [opt('{以前|いぜん} は はっきり {言|い}わなかった こと を {省|かえり}み 、 {今回|こんかい} は {明確|めいかく} に {話|はな}す と {誓|ちか}って いる', true), opt('{今回|こんかい} も {曖昧|あいまい} に {話|はな}す つもり で いる', false, '濁さずに: WITHOUT being vague.'), opt('{二度|にど} と {話|はな}さない と {決|き}めて いる', false, 'It promises to speak — clearly.')], explain: { en: '言葉を濁す: to speak evasively; 今度こそ: this time for sure.' } });

  // =====================================================================================
  // Legends at the end of the road (read before the guardian; understanding loosens a knot).
  // =====================================================================================
  const LEG = (boss, lv, d) => add(Object.assign({ id: 'atlas.legend.' + boss + '.' + lv, lv, tags: ['atlas', 'atlas_legend', 'atlas_legend_' + boss], kind: 'choose', item: 'c:atlas_legend_' + boss + '_' + lv }, d));
  LEG('cartographer', 'F', { ctx: { jp: '「ちず を ぜんぶ しろ に したい 。」', en: '"I want to make the whole map white."' }, prompt: { en: 'What does it want to do to the map?' }, options: [oen('Make it all blank', true), oen('Draw more roads on it', false, 'しろ is white — blank.'), oen('Burn it', false, 'It wants it white, not burnt.')] });
  LEG('cartographer', 'E', { ctx: { jp: '「{分|わ}からない {道|みち} が ある と 、 みんな {迷|まよ}います 。 だから 、 {消|け}したい の です 。」', en: '"If there are roads nobody understands, everyone gets lost. That is why I want to erase them."' }, prompt: { en: 'What does the Cartographer want, and why?' }, options: [oen('To erase uncertain roads so nobody gets lost', true), oen('To draw new roads for everyone', false, '消したい: wants to erase.'), oen('It is lost and wants help', false, 'It worries that OTHERS get lost.')] });
  LEG('cartographer', 'I', { ctx: { jp: '「{私|わたし} は {地図|ちず} を {完成|かんせい} させたい だけ だ 。 {完成|かんせい} と は 、 {分|わ}からない {所|ところ} が {一|ひと}つ も ない こと だ 。」', en: '"I only want to complete the map. Complete means there is not a single place left that nobody knows."' }, prompt: { en: 'What is its idea of "complete"?' }, options: [opt('{分|わ}からない {部分|ぶぶん} を {一|ひと}つ も {残|のこ}さない こと', true), opt('すべて の {道|みち} を {実際|じっさい} に {歩|ある}く こと', false, 'It defines 完成 as leaving nothing unknown.'), opt('{地図|ちず} を もっと {大|おお}きく する こと', false, 'Size isn\'t mentioned.')] });
  LEG('cartographer', 'A', { ctx: { jp: '「{白紙|はくし} の {部分|ぶぶん} は {嘘|うそ} を {生|う}む 。 {書|か}けない の なら 、 {最初|さいしょ} から {存在|そんざい} しなかった こと に すれば いい 。」', en: '"Blank spaces breed lies. If they can\'t be written, better to treat them as never having existed."' }, prompt: { en: 'Where is the flaw in its reasoning?' }, options: [opt('{分|わ}からない こと と 、 {存在|そんざい} しない こと を {同|おな}じ に {扱|あつか}って いる', true), opt('{白紙|はくし} の {部分|ぶぶん} は {確|たし}か に {嘘|うそ} を {生|う}む', false, 'That repeats its claim rather than finding the flaw.'), opt('{地図|ちず} は {誰|だれ} に も {書|か}けない', false, 'Nobody argued that.')] });
  LEG('bell', 'F', { ctx: { jp: '「わたし の なまえ は …… なんだっけ 。」', en: '"My name is… what was it again?"' }, prompt: { en: 'What is wrong with the bell?' }, options: [oen('It has forgotten its own name.', true), oen('It knows everyone\'s name.', false, 'なんだっけ: "what was it again?"'), oen('It wants a new name.', false, 'It is trying to remember, not replace.')] });
  LEG('bell', 'E', { ctx: { jp: '「この {鐘|かね} は {灯落|ひおち} から {借|か}りた もの です 。 {返|かえ}す {前|まえ} に 、 {名前|なまえ} を {忘|わす}れました 。」', en: '"This bell was borrowed from Lanternfall. Before it was returned, it forgot its name."' }, prompt: { en: 'What is the bell\'s story?' }, options: [oen('It was borrowed, and forgot its name before being returned.', true), oen('It was stolen from Lanternfall.', false, '借りた: borrowed.'), oen('It was made in Lanternfall and never left.', false, 'It was borrowed FROM Lanternfall.')] });
  LEG('bell', 'I', { ctx: { jp: '「{鳴|な}れば {鳴|な}る ほど 、 {自分|じぶん} の {音|おと} が {分|わ}からなく なる 。 {誰|だれ}か の {名前|なまえ} を {呼|よ}んで いる はず な のに 。」', en: '"The more I ring, the less I know my own sound. And yet I must be calling someone\'s name."' }, prompt: { en: 'What is troubling the bell?' }, options: [opt('{自分|じぶん} が {誰|だれ} を {呼|よ}ぶ ため の {鐘|かね} なのか {分|わ}からなく なって いる', true), opt('{音|おと} が {大|おお}きすぎて {困|こま}って いる', false, 'Volume isn\'t the issue.'), opt('{誰|だれ} の {名前|なまえ} も {呼|よ}びたく ない', false, 'It believes it should be calling someone.')] });
  LEG('bell', 'A', { ctx: { jp: '「{借|か}りた {物|もの} を {返|かえ}さずに いる うち に 、 {返|かえ}す {先|さき} の {方|ほう} が {先|さき} に {消|き}えて しまった 。 {今|いま} さら {誰|だれ} に {返|かえ}せ と いう の だ 。」', en: '"While I kept putting off returning what I borrowed, the place to return it to vanished first. Who am I supposed to return it to now?"' }, prompt: { en: 'What is it really doing?' }, options: [opt('{返|かえ}す {相手|あいて} が いない こと を {理由|りゆう} に 、 {借|か}りた まま で いる こと を {正当化|せいとうか} して いる', true), opt('{返|かえ}す {方法|ほうほう} を {純粋|じゅんすい} に {知|し}りたがって いる', false, 'The question is rhetorical (〜というのだ) — it isn\'t asking for help.'), opt('{借|か}りた こと を {覚|おぼ}えて いない', false, 'It clearly remembers borrowing.')] });
  LEG('gate', 'F', { ctx: { jp: '「はんぶん だけ の みち 。」', en: '"A road only half there."' }, prompt: { en: 'What does the gatekeeper guard?' }, options: [oen('A road that is only half built', true), oen('A finished road', false, 'はんぶん: half.'), oen('A house', false, 'みち is a road.')] });
  LEG('gate', 'E', { ctx: { jp: '「{昔|むかし} 、 {誰|だれ}か が この {道|みち} を {作|つく}り{始|はじ}めました 。 でも 、 {最後|さいご} まで {作|つく}りませんでした 。」', en: '"Long ago, someone began building this road. But they never finished it."' }, prompt: { en: 'What happened to this road?' }, options: [oen('Someone started building it but never finished.', true), oen('Someone finished it long ago.', false, '最後まで作りませんでした: didn\'t build it to the end.'), oen('Nobody ever started it.', false, '作り始めました: began building.')] });
  LEG('gate', 'I', { ctx: { jp: '「{完成|かんせい} しない なら 、 {誰|だれ} も {通|とお}さない 。 それ が {私|わたし} の {役目|やくめ} だ と {思|おも}って いた 。」', en: '"If it isn\'t finished, I let no one through. I believed that was my duty."' }, prompt: { en: 'What did the gatekeeper believe its duty was?' }, options: [opt('{未完成|みかんせい} の {道|みち} を {誰|だれ} に も {通|とお}らせない こと', true), opt('{道|みち} を {自分|じぶん} で {完成|かんせい} させる こと', false, 'It guards; it doesn\'t build.'), opt('{誰|だれ} で も {通|とお}す こと', false, 'The opposite.')] });
  LEG('gate', 'A', { ctx: { jp: '「{約束|やくそく} した {者|もの} たち が {戻|もど}らない の なら 、 せめて {約束|やくそく} の {形|かたち} だけ で も {守|まも}り{通|とお}す 。 それ が {残|のこ}された {者|もの} の {務|つと}め だろう 。」', en: '"If those who made the promise will not return, then at least I will keep its outward form to the end. Surely that is the duty of the one left behind."' }, prompt: { en: 'What is the gatekeeper clinging to?' }, options: [opt('{中身|なかみ} を {失|うしな}った {約束|やくそく} の {形|かたち} だけ に しがみついて いる', true), opt('{約束|やくそく} を {新|あたら}しく {結|むす}び{直|なお}そう と して いる', false, 'It keeps the old form; it isn\'t renewing anything.'), opt('{戻|もど}らない {者|もの} たち を {責|せ}めて いる', false, 'It speaks of duty, not blame.')] });

  // =====================================================================================
  // Door clues. Doors are L / M / R as seen on screen (after any mirroring).
  // lamps: which door lamps are lit (the clue may depend on them).
  // =====================================================================================
  const LIT = { L: true, M: true, R: true };
  A.doorClues = {
    F: {
      L: [{ jp: 'ひだり へ 。', en: 'To the left.', lamps: LIT }, { jp: 'ひだり の とびら 。', en: 'The left door.', lamps: LIT }],
      M: [{ jp: 'まっすぐ 。', en: 'Straight ahead.', lamps: LIT }, { jp: 'まんなか の とびら 。', en: 'The middle door.', lamps: LIT }],
      R: [{ jp: 'みぎ へ 。', en: 'To the right.', lamps: LIT }, { jp: 'みぎ の とびら 。', en: 'The right door.', lamps: LIT }],
    },
    E: {
      L: [{ jp: '{右|みぎ} の {扉|とびら} も 、 {真|ま}ん{中|なか} の {扉|とびら} も {開|あ}けないで ください 。', en: 'Please open neither the right door nor the middle door.', lamps: LIT }],
      M: [{ jp: '{左|ひだり} と {右|みぎ} の {扉|とびら} は {使|つか}えません 。', en: 'The left and right doors cannot be used.', lamps: LIT }],
      R: [{ jp: '{左|ひだり} の {扉|とびら} は だめ です 。 {真|ま}ん{中|なか} も だめ です 。', en: 'Not the left door. Not the middle one either.', lamps: LIT }],
    },
    I: {
      '*': [
        { jp: '{灯|ひ} の {消|き}えて いる {扉|とびら} を {選|えら}べば 、 {元|もと} の {場所|ばしょ} に {戻|もど}らずに {済|す}む 。', en: 'Choose the door whose light is out, and you won\'t end up back where you started.', unlit: 'correct' },
        { jp: '{灯|ひ} が ついて いる {扉|とびら} を {通|とお}る と 、 {最初|さいしょ} の {部屋|へや} に {戻|もど}って しまう 。', en: 'Go through a door with a lit lamp and you\'ll find yourself back in the first room.', unlit: 'correct' },
      ],
    },
    A: {
      L: [{ jp: '{真|ま}ん{中|なか} の {扉|とびら} は {無難|ぶなん} に {見|み}える が 、 {実|じつ} は {行|い}き{止|ど}まり だ 。 {残|のこ}る {二|ふた}つ の うち 、 {灯|あか}り の {絶|た}えた {方|ほう} こそ が {先|さき} へ {通|つう}じて いる 。', en: 'The middle door looks the safe choice, but it is a dead end. Of the other two, it is the one whose light has died that leads on.', unlit: 'correct' }],
      R: [{ jp: '{真|ま}ん{中|なか} の {扉|とびら} は {無難|ぶなん} に {見|み}える が 、 {実|じつ} は {行|い}き{止|ど}まり だ 。 {残|のこ}る {二|ふた}つ の うち 、 {灯|あか}り の {絶|た}えた {方|ほう} こそ が {先|さき} へ {通|つう}じて いる 。', en: 'The middle door looks the safe choice, but it is a dead end. Of the other two, it is the one whose light has died that leads on.', unlit: 'correct' }],
      M: [{ jp: '{左右|さゆう} の {扉|とびら} は 、 {灯|あか}り が ついて いる から と いって {安全|あんぜん} な わけ で は ない 。 どちら も {先|さき} は {行|い}き{止|ど}まり だ 。', en: 'Just because the left and right doors are lit doesn\'t make them safe. Both are dead ends.', unlit: 'correct' }],
    },
  };

  // =====================================================================================
  // Authored special intents for atlas encounters (text + answer/truth per profile).
  // =====================================================================================
  const T4 = (F, E, I, Aa) => ({ F, E, I, A: Aa });
  const INT = {};
  INT.stray = { text: T4(
    { jp: 'かえりたい …… 。', en: '"I want to go home…"' },
    { jp: '{家|いえ} に {帰|かえ}りたい けど 、 {道|みち} が {分|わ}からない 。', en: '"I want to go home, but I don\'t know the way."' },
    { jp: '{帰|かえ}る {場所|ばしょ} が ある はず な のに 、 {名前|なまえ} を {呼|よ}んで くれる {人|ひと} が いない 。', en: '"There must be somewhere I belong, yet nobody calls my name."' },
    { jp: '{帰|かえ}る {場所|ばしょ} なら 、 とうに {分|わ}かって いる 。 {分|わ}からない の は 、 まだ {待|ま}って いて くれる {人|ひと} が いる か どう か だ 。', en: '"I\'ve long known where home is. What I don\'t know is whether anyone is still waiting for me."' }),
  answer: T4(
    { kind: 'write', item: 'v:帰る', mode: 'reading', prompt: { en: 'Answer it: "Let\'s go home" — write kaerou.' }, answer: 'かえろう', accept: ['かえろう', '帰ろう'], explain: { en: 'かえろう: let\'s go home (volitional of かえる).' } },
    { kind: 'choose', item: 'c:atlas_int_stray_E', prompt: { en: 'Which reply answers what it is asking?' }, options: [opt('{一緒|いっしょ}に {道|みち} を {探|さが}そう 。', true), opt('{家|いえ} は {大|おお}きい です ね 。', false, 'It didn\'t ask about the house — it\'s lost.'), opt('もう {帰|かえ}りました か 。', false, 'It can\'t go home; it doesn\'t know the way.')] },
    { kind: 'choose', item: 'c:atlas_int_stray_I', prompt: { en: 'Which reply answers what it is really asking?' }, options: [opt('じゃあ 、 {私|わたし} たち が {呼|よ}ぶ よ 。 {一緒|いっしょ}に {帰|かえ}ろう 。', true), opt('{場所|ばしょ} なら {地図|ちず} に {書|か}いて ある よ 。', false, 'It isn\'t asking for directions; nobody calls its name.'), opt('{名前|なまえ} なんて なくて も {平気|へいき} だ よ 。', false, 'That brushes off what it needs.')] },
    { kind: 'choose', item: 'c:atlas_int_stray_A', prompt: { en: 'Which reply answers what it is really afraid of?' }, options: [opt('{待|ま}って いる か どう か は 、 {帰|かえ}って みなければ {分|わ}からない 。 {一緒|いっしょ}に {確|たし}かめ に {行|い}こう 。', true), opt('{道|みち} なら {案内|あんない} できる よ 。', false, 'It already knows the way; that\'s not the question.'), opt('{誰|だれ} も {待|ま}って いない なら 、 {帰|かえ}らなくて いい 。', false, 'That answers its fear with the worst case.')] }) };
  INT.echo = { text: T4(
    { jp: 'まや …… まや …… 。', en: '"Maya… maya…" — it is echoing a word back to front.' },
    { jp: 'この {道|みち} は {通|とお}れません 。', en: '"This road can\'t be passed."' },
    { jp: '{戻|もど}れば 、 {出口|でぐち} に {着|つ}く よ 。', en: '"If you go back, you\'ll reach the way out."' },
    { jp: '{約束|やくそく} を {守|まも}る と は 、 {約束|やくそく} を {変|か}えない こと だ 。', en: '"Keeping a promise means never changing it."' }),
  truth: T4(
    { kind: 'write', item: 'v:山', mode: 'reading', prompt: { en: 'It says まや. Write the word the right way round (yama, mountain).' }, answer: 'やま', accept: ['やま', '山'], explain: { en: 'やま — mountain. まや is just やま backwards.' } },
    { kind: 'choose', item: 'c:atlas_int_echo_E', ctx: { jp: 'あなた は さっき 「この {道|みち} は {通|とお}れます 」 と {言|い}った 。', en: 'A moment ago you said: "This road can be passed."' }, prompt: { en: 'It threw your words back twisted. Which word did it change?' }, options: [opt('{通|とお}れません', true, '通れます (can pass) became 通れません (can\'t pass).'), opt('この', false, 'That part is the same.'), opt('{道|みち}', false, 'That part is the same.')] },
    { kind: 'choose', item: 'c:atlas_int_echo_I', ctx: { jp: 'さっき $comp は 「この まま {進|すす}めば 、 {出口|でぐち} に {着|つ}く はず だ 」 と {言|い}った 。', en: 'Earlier $comp said: "If we keep going ahead, we should reach the way out."' }, prompt: { en: 'Which reply sets the echo straight?' }, options: [opt('いや 、 {進|すす}んで こそ {出口|でぐち} に {着|つ}く ん だ 。', true), opt('{戻|もど}る なら 、 {早|はや}い {方|ほう} が いい 。', false, 'That goes along with the twisted version.'), opt('{出口|でぐち} なんて どこ に も ない 。', false, 'That is a new claim, not a correction.')] },
    { kind: 'choose', item: 'c:atlas_int_echo_A', prompt: { en: 'The echo has taken something true and bent it. Which reply shows the flaw?' }, options: [opt('{変|か}えない こと と {守|まも}る こと は {別|べつ} だ 。 {状況|じょうきょう} が {変|か}われば 、 {約束|やくそく} の {意味|いみ} を {確|たし}かめ{直|なお}す {必要|ひつよう} が ある 。', true), opt('{約束|やくそく} など {守|まも}らなくて も いい 。', false, 'That throws promises away instead of correcting the echo.'), opt('{一度|いちど} した {約束|やくそく} は 、 {何|なに} が あって も その まま {守|まも}る べき だ 。', false, 'That agrees with the echo.')] }) };
  INT.toll = { text: T4(
    { jp: 'この みち は わたし の みち 。', en: '"This road is mine."' },
    { jp: '{通行料|つうこうりょう} を {払|はら}えば 、 {通|とお}して やる 。', en: '"Pay the toll and I\'ll let you through."' },
    { jp: '{名前|なまえ} を ひとつ {置|お}いて いけば 、 {誰|だれ} も {困|こま}らない さ 。', en: '"Leave one name behind and nobody will be troubled."' },
    { jp: '{誰|だれ} も {通|とお}らない {道|みち} に 、 {名前|なまえ} など {必要|ひつよう} ある まい 。', en: '"A road no one travels can hardly need a name."' }),
  truth: T4(
    { kind: 'write', item: 'v:みんな', mode: 'reading', template: { before: '', after: ' の みち' }, prompt: { en: 'The lantern post under its lie says whose road this is: minna (everyone). Write the missing word.' }, answer: 'みんな', accept: ['みんな', '皆'], explain: { en: 'みんな の みち — everyone\'s road.' } },
    { kind: 'choose', item: 'c:atlas_int_toll_E', ctx: { jp: '{古|ふる}い {立|た}て{札|ふだ} : 「この {道|みち} は 、 だれ でも {通|とお}れます 。 お{金|かね} は いりません 。」', en: 'An old notice: "Anyone may use this road. No money is needed."' }, prompt: { en: 'What does the old notice say?' }, options: [oen('Anyone may pass, and no money is needed.', true), oen('Only people who pay may pass.', false, 'お金はいりません: money is NOT needed.'), oen('The road is closed today.', false, '通れます: can pass.')] },
    { kind: 'choose', item: 'c:atlas_int_toll_I', prompt: { en: 'Which reply exposes the lie?' }, options: [opt('{名前|なまえ} を {置|お}いて いけば 、 その {名前|なまえ} を {待|ま}って いる {人|ひと} が {困|こま}る 。', true), opt('{名前|なまえ} なら たくさん ある から 、 ひとつ ぐらい いい 。', false, 'That accepts its terms.'), opt('{困|こま}る の は あなた だけ だ 。', false, 'That doesn\'t address the lie.')] },
    { kind: 'choose', item: 'c:atlas_int_toll_A', prompt: { en: 'Which reply exposes the lie?' }, options: [opt('{名前|なまえ} が なくなった から こそ 、 {誰|だれ} も {通|とお}れなく なった の だ 。 {順序|じゅんじょ} が {逆|ぎゃく} だ 。', true), opt('{確|たし}か に 、 {使|つか}われない {道|みち} は {忘|わす}れて も いい 。', false, 'That agrees with it.'), opt('{名前|なまえ} が あって も 、 {通|とお}る {人|ひと} は {増|ふ}えない 。', false, 'That concedes the point instead of correcting it.')] }) };
  INT.fox = { text: T4(
    { jp: 'わたし は ハナ だ よ 。', en: '"I\'m Hana, you know."' },
    { jp: 'わたし は この {道|みち} の {案内人|あんないにん} です 。 {右|みぎ} へ どうぞ 。', en: '"I am this road\'s guide. This way, to the right."' },
    { jp: '{名前|なまえ} は {借|か}りた だけ 。 {返|かえ}す つもり は ある ん だ よ 、 いつか ね 。', en: '"I only borrowed the name. I do mean to give it back — someday."' },
    { jp: '{借|か}りた {名前|なまえ} でも 、 {大事|だいじ}に {使|つか}えば {本物|ほんもの} に なる 。', en: '"Even a borrowed name becomes real if you use it with care."' }),
  truth: T4(
    { kind: 'write', item: 'v:狐', mode: 'reading', prompt: { en: 'It says it\'s Hana. Say what it really is: kitsune (fox).' }, answer: 'きつね', accept: ['きつね', '狐', 'キツネ'], explain: { en: 'きつね — fox.' } },
    { kind: 'choose', item: 'c:atlas_int_fox_E', ctx: { jp: '{道標|みちしるべ} : 「{右|みぎ} は {行|い}き{止|ど}まり 」', en: 'Signpost: "Right: dead end."' }, prompt: { en: 'What does the signpost tell you?' }, options: [oen('Right is a dead end — the "guide" is lying.', true), oen('Right is the way on.', false, '行き止まり: dead end.'), oen('The fox really is a guide.', false, 'The sign contradicts it.')] },
    { kind: 'choose', item: 'c:atlas_int_fox_I', prompt: { en: 'Which reply exposes it?' }, options: [opt('「いつか 」 と いう の は 、 {返|かえ}す {気|き} が ない と いう こと でしょう 。', true), opt('{借|か}りた だけ なら 、 {問題|もんだい} ない ね 。', false, 'That swallows the excuse.'), opt('{名前|なまえ} なんて 、 {返|かえ}さなくて も いい 。', false, 'That agrees with it.')] },
    { kind: 'choose', item: 'c:atlas_int_fox_A', prompt: { en: 'Which reply exposes the sleight of hand?' }, options: [opt('{大事|だいじ}に する こと と 、 {持|も}ち{主|ぬし} に {黙|だま}って {使|つか}う こと は 、 {別|べつ} の {話|はなし} だ 。', true), opt('{確|たし}か に 、 {使|つか}い{方|かた} {次第|しだい} だ ね 。', false, 'That accepts its framing.'), opt('{本物|ほんもの} の {名前|なまえ} など 、 どこ に も ない 。', false, 'That dodges the question of whose name it is.')] }) };
  INT.cartographer = { text: T4(
    { jp: 'どの みち が ほんとう ？', en: '"Which road is the real one?"' },
    { jp: '{正|ただ}しい {道|みち} を ひとつ だけ {教|おし}えて 。 ほか は ぜんぶ {消|け}す から 。', en: '"Tell me the one correct road. I will erase all the others."' },
    { jp: '{行|い}き{先|さき} の {分|わ}からない {道|みち} は 、 {人|ひと} を {迷|まよ}わせる だけ だ 。 {消|け}して しまった {方|ほう} が {親切|しんせつ} だろう 。', en: '"Roads whose ends are unknown only lead people astray. Surely it is kinder to erase them."' },
    { jp: '{曖昧|あいまい} な {道|みち} は 、 いずれ {誰|だれ}か を {溺|おぼ}れさせる 。 {私|わたし} は それ を {防|ふせ}ぎたい だけ な の だ 。', en: '"A vague road will drown someone sooner or later. I only want to prevent that."' }),
  answer: T4(
    { kind: 'write', item: 'v:全部', mode: 'reading', prompt: { en: 'Answer it: "all of them" — write zenbu.' }, answer: 'ぜんぶ', accept: ['ぜんぶ', '全部'], explain: { en: 'ぜんぶ — all, every one.' } },
    { kind: 'choose', item: 'c:atlas_int_cart_E', prompt: { en: 'Which reply answers it?' }, options: [opt('ひとつ だけ じゃ ない 。 どの {道|みち} も 、 {誰|だれ}か の {道|みち} だ 。', true), opt('{右|みぎ} の {道|みち} です 。', false, 'Name one road and it erases the rest.'), opt('ぜんぶ {消|け}して ください 。', false, 'That is exactly what must not happen.')] },
    { kind: 'choose', item: 'c:atlas_int_cart_I', prompt: { en: 'Which reply answers it?' }, options: [opt('{迷|まよ}う こと も {旅|たび} の うち だ 。 {消|け}したら 、 {誰|だれ} も {新|あたら}しい {場所|ばしょ} へ {行|い}けなく なる 。', true), opt('そう だ ね 。 {迷|まよ}う の は つらい から 。', false, 'That hands it the eraser.'), opt('{地図|ちず} なんて 、 {最初|さいしょ} から いらない 。', false, 'That doesn\'t answer its fear.')] },
    { kind: 'choose', item: 'c:atlas_int_cart_A', prompt: { en: 'Which reply answers it?' }, options: [opt('{曖昧|あいまい} さ を {消|け}して も 、 {危|あぶ}なさ は {消|き}えない 。 {必要|ひつよう} な の は 、 {分|わ}からない {時|とき} に {確|たし}かめ{合|あ}える こと だ 。', true), opt('あなた の {言|い}う とおり 、 {曖昧|あいまい} な {道|みち} は {消|け}す べき だ 。', false, 'That is how the Hush began.'), opt('{誰|だれ}か が {溺|おぼ}れて も 、 それ は {運|うん} だ 。', false, 'That abandons the people it worries about.')] }) };
  INT.bell = { text: T4(
    { jp: 'わたし は あたらしい かね 。', en: '"I am a new bell."' },
    { jp: 'わたし の {音|おと} を {聞|き}けば 、 みんな {家|いえ} に {帰|かえ}れます 。', en: '"Hear my sound and everyone can go home."' },
    { jp: '{鳴|な}らして いる の は {私|わたし} の {名前|なまえ} だ 。 {昔|むかし} から ずっと そう だ 。', en: '"The name I ring is my own. It has always been so."' },
    { jp: '{返|かえ}さなければ 、 {借|か}りた こと に は ならない 。 だから これ は {私|わたし} の {音|おと} だ 。', en: '"If I never give it back, it doesn\'t count as borrowing. So this sound is mine."' }),
  truth: T4(
    { kind: 'write', item: 'v:古い', mode: 'reading', prompt: { en: 'It claims to be new, but it is green with age. Write the opposite: furui (old).' }, answer: 'ふるい', accept: ['ふるい', '古い'], explain: { en: 'ふるい — old. あたらしい — new.' } },
    { kind: 'choose', item: 'c:atlas_int_bell_E', ctx: { jp: '{鐘|かね} に {刻|きざ}まれた {文字|もじ} : 「{借|か}りた {鐘|かね} 。 {秋|あき} まで に {返|かえ}す こと 。」', en: 'Words cut into the bell: "Borrowed bell. To be returned by autumn."' }, prompt: { en: 'What do the words on the bell show?' }, options: [oen('It is a borrowed bell that should have been returned.', true), oen('It is the town\'s own bell.', false, '借りた: borrowed.'), oen('It only rings in autumn.', false, '秋までに返す: return by autumn.')] },
    { kind: 'choose', item: 'c:atlas_int_bell_I', prompt: { en: 'Which reply exposes the lie?' }, options: [opt('「{昔|むかし} から 」 なら 、 なぜ {鐘|かね} に {別|べつ} の {村|むら} の {名|な} が {刻|きざ}まれて いる の ？', true), opt('{昔|むかし} から なら 、 {本当|ほんとう} だろう 。', false, 'That takes it at its word.'), opt('{名前|なまえ} は {鳴|な}らせない よ 。', false, 'That misses the point.')] },
    { kind: 'choose', item: 'c:atlas_int_bell_A', prompt: { en: 'Which reply exposes the lie?' }, options: [opt('{返|かえ}さない から と いって 、 {借|か}りた {事実|じじつ} が {消|き}える わけ で は ない 。', true), opt('なるほど 、 {返|かえ}さなければ {自分|じぶん} の もの だ 。', false, 'That accepts its logic.'), opt('{音|おと} に {持|も}ち{主|ぬし} なんて いない 。', false, 'That sidesteps the lie.')] }) };
  INT.gate = { text: T4(
    { jp: 'この みち 、 つくって くれる ？', en: '"Will you build this road?"' },
    { jp: 'この {道|みち} を {最後|さいご} まで {作|つく}る と 、 {約束|やくそく} して くれます か 。', en: '"Will you promise to build this road all the way to the end?"' },
    { jp: '{半分|はんぶん} だけ の {道|みち} は 、 {誰|だれ} も {通|とお}れない 。 それ なら 、 {最初|さいしょ} から {作|つく}らなければ よかった 。', en: '"A road only half built is a road no one can travel. Better never to have started."' },
    { jp: '「いつか {完成|かんせい} させる 」 と {言|い}った {者|もの} は 、 {皆|みな} {去|さ}って いった 。 {約束|やくそく} など 、 {口|くち} に した {時点|じてん} で {半分|はんぶん} {嘘|うそ} だ 。', en: '"Everyone who said \'we\'ll finish it someday\' went away. A promise is half a lie the moment it is spoken."' }),
  answer: T4(
    { kind: 'write', item: 'v:作る', mode: 'reading', prompt: { en: 'Answer it: "I\'ll build it" — write tsukuru.' }, answer: 'つくる', accept: ['つくる', '作る', '造る'], explain: { en: 'つくる — to make, to build.' } },
    { kind: 'choose', item: 'c:atlas_int_gate_E', prompt: { en: 'Which answer is honest — and still helps?' }, options: [opt('{最後|さいご} まで と は {約束|やくそく} できない 。 でも 、 {手伝|てつだ}う よ 。', true), opt('はい 。 {明日|あした} {全部|ぜんぶ} {作|つく}ります 。', false, 'A promise you can\'t keep is what left this road half-built.'), opt('{道|みち} は いりません 。', false, 'That abandons it.')] },
    { kind: 'choose', item: 'c:atlas_int_gate_I', prompt: { en: 'Which reply answers it?' }, options: [opt('{半分|はんぶん} でも 、 {次|つぎ} の {人|ひと} が {続|つづ}き を {作|つく}れる 。 {作|つく}り{始|はじ}めた こと に は {意味|いみ} が ある 。', true), opt('そう だ ね 。 {最初|さいしょ} から やめれば よかった 。', false, 'That agrees with its despair.'), opt('{半分|はんぶん} なら 、 {半分|はんぶん} だけ {通|とお}れば いい 。', false, 'That is a joke, not an answer.')] },
    { kind: 'choose', item: 'c:atlas_int_gate_A', prompt: { en: 'Which reply answers it?' }, options: [opt('{守|まも}れなかった {約束|やくそく} が あった と して も 、 {約束|やくそく} が すべて {嘘|うそ} だった と いう こと に は ならない 。', true), opt('その とおり だ 。 {約束|やくそく} は しない {方|ほう} が いい 。', false, 'That gives up on promises altogether.'), opt('{去|さ}った {者|もの} が {悪|わる}い の だ から 、 あなた は {関係|かんけい} ない 。', false, 'That doesn\'t answer what it said.')] }) };
  A.intents = INT;
  const EN = C.enemies;
  EN['atlas.stray'].intents['plea:1'] = { text: INT.stray.text, answer: INT.stray.answer };
  EN['atlas.echo'].intents['mirror:1'] = { text: INT.echo.text, truth: INT.echo.truth };
  EN['atlas.toll'].intents['lie:1'] = { text: INT.toll.text, truth: INT.toll.truth };
  EN['atlas.fox'].intents['lie:1'] = { text: INT.fox.text, truth: INT.fox.truth };
  EN['atlas.echotoll'].intents['mirror:1'] = { text: INT.echo.text, truth: INT.echo.truth };
  EN['atlas.echotoll'].intents['lie:1'] = { text: INT.toll.text, truth: INT.toll.truth };
  EN['atlas.cartographer'].intents['plea:1'] = { text: INT.cartographer.text, answer: INT.cartographer.answer };
  EN['atlas.bell'].intents['lie:1'] = { text: INT.bell.text, truth: INT.bell.truth };
  EN['atlas.gate'].intents['plea:1'] = { text: INT.gate.text, answer: INT.gate.answer };
  // Intent added to foes by the Echoing Halls modifier.
  A.modIntents = { 'mirror:atlas': { text: INT.echo.text, truth: INT.echo.truth } };

  C.addDrills(drills);
  A.drillIds = drills.map((d) => d.id);
})(RB.content);
