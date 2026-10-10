/* The press's content (expansion P09; plan C15, W10; the rules in src/engine/72p_press.js, the screen in
 * src/ui/89p_press.js). Blocks: authored sentences with tags, some unlocked as the journey goes on; `pieces` are how
 * the line comes apart when the type is set by hand (practice only). Readers: people around the world who react to
 * what a page contains (its tags), never to its language; the first rule whose tags hold, the more specific first;
 * a rule with no tags is a reader's fallback, used only to reach three readers. Each reader's waiting reaction is
 * heard by talking to them (a talk option added below, waiting on press_rx_<reader>). */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  const B = (id, tags, jp, en, pieces, o) => Object.assign({ id, tags, jp, en, pieces }, o || {});
  const R = (when, jp, en) => ({ when, jp, en });
  C.press = {
    text: {
      title: T('The press', '{刷|す}り{場|ば}'),
      intro: T('Compose a page from the blocks in the racks, print it, and pass it round. Any combination may be printed. Readers will tell you what they make of it.'),
      where: { board: T('Post it at the press'), inn: T('Leave it at an inn'), stall: T('Give it out at a stall') },
    },
    kinds: {
      story: { name: T('Story', '{物語|ものがたり}'), slots: ['who', 'where', 'want', 'trouble', 'turn', 'end'],
        help: T('A short story, one line from each rack: who, where, what they wanted, what went wrong, what they did, and how it ended.'),
        labels: { who: T('Who'), where: T('Where'), want: T('What they wanted'), trouble: T('What went wrong'), turn: T('What they did'), end: T('How it ended') } },
      notice: { name: T('Notice', '{知|し}らせ'), slots: ['what', 'when', 'place', 'ask'],
        help: T('A notice for the boards: what is happening, when, where, and what you ask of the reader.'),
        labels: { what: T('What'), when: T('When'), place: T('Where'), ask: T('What you ask') } },
    },
    blocks: {
      who: [
        B('s_boatman', ['boatman', 'water'], '{船頭|せんどう} の ゲン は 、 {毎日|まいにち} {舟|ふね} を {漕|こ}いで いた 。', 'Gen the boatman rowed his boat every day.', ['{船頭|せんどう} の ゲン は 、', '{毎日|まいにち}', '{舟|ふね} を {漕|こ}いで いた 。']),
        B('s_courier', ['courier', 'deliver'], '{配達人|はいたつにん} の ユキ は 、 {手紙|てがみ} を {運|はこ}んで いた 。', 'Yuki the courier carried letters.', ['{配達人|はいたつにん} の ユキ は 、', '{手紙|てがみ} を', '{運|はこ}んで いた 。']),
        B('s_cat', ['cat', 'animal'], '{一匹|いっぴき} の {猫|ねこ} が 、 {町|まち} に {住|す}んで いた 。', 'A cat lived in the town.', ['{一匹|いっぴき} の {猫|ねこ} が 、', '{町|まち} に', '{住|す}んで いた 。']),
        B('s_child', ['child'], '{小|ちい}さな {女|おんな} の {子|こ} が 、 {橋|はし} を {数|かぞ}えて いた 。', 'A little girl was counting the bridges.', ['{小|ちい}さな {女|おんな} の {子|こ} が 、', '{橋|はし} を', '{数|かぞ}えて いた 。']),
        B('s_keeper', ['keeper', 'lantern'], '{灯守|ひもり} の {老人|ろうじん} が 、 {灯籠|とうろう} を {守|まも}って いた 。', 'An old lantern-keeper looked after the lanterns.', ['{灯守|ひもり} の {老人|ろうじん} が 、', '{灯籠|とうろう} を', '{守|まも}って いた 。']),
        B('s_actor', ['actor', 'stage'], '{若|わか}い {役者|やくしゃ} が 、 {台詞|せりふ} を {覚|おぼ}えて いた 。', 'A young actor was learning his lines.', ['{若|わか}い {役者|やくしゃ} が 、', '{台詞|せりふ} を', '{覚|おぼ}えて いた 。'], { unlock: 'mp_theatre_seen' }),
        B('s_fox', ['fox', 'animal', 'funny'], 'おしゃべり な {狐|きつね} が 、 {人|ひと} に {化|ば}けて いた 。', 'A chatty fox had disguised itself as a person.', ['おしゃべり な {狐|きつね} が 、', '{人|ひと} に', '{化|ば}けて いた 。'], { unlock: 'mb_kansuke_met' }),
      ],
      where: [
        B('s_canal', ['city', 'water', 'night'], 'ある {夏|なつ} の {夜|よる} 、 {運河|うんが} の {町|まち} で の こと 。', 'One summer night, in the canal city.', ['ある {夏|なつ} の {夜|よる} 、', '{運河|うんが} の {町|まち} で の こと 。']),
        B('s_harbour', ['sea'], '{潮|しお} の {香|かお}る {港|みなと} で の こと 。', 'At a harbour that smelled of the tide.', ['{潮|しお} の {香|かお}る', '{港|みなと} で の こと 。']),
        B('s_reeds', ['river', 'village'], '{葦|あし} の {揺|ゆ}れる {川|かわ}べり の {村|むら} で の こと 。', 'In a village by a river where the reeds sway.', ['{葦|あし} の {揺|ゆ}れる', '{川|かわ}べり の {村|むら} で の こと 。']),
        B('s_eve', ['festival', 'night'], '{祭|まつ}り の {前|まえ} の {晩|ばん} の こと 。', 'On the night before a festival.', ['{祭|まつ}り の {前|まえ} の', '{晩|ばん} の こと 。'], { unlock: 'mp_fest_heard' }),
        B('s_orchard', ['orchard', 'hills'], '{果樹園|かじゅえん} の ある {丘|おか} で の こと 。', 'On a hill with an orchard.', ['{果樹園|かじゅえん} の ある', '{丘|おか} で の こと 。'], { unlock: 'ch3_done' }),
        B('s_snow', ['mountain', 'snow'], '{雪|ゆき} の {降|ふ}る {山|やま} の {村|むら} で の こと 。', 'In a mountain village where the snow falls.', ['{雪|ゆき} の {降|ふ}る', '{山|やま} の {村|むら} で の こと 。'], { unlock: 'ch4_done' }),
      ],
      want: [
        B('s_letter', ['letter', 'deliver'], '{大事|だいじ} な {手紙|てがみ} を 、 {届|とど}けたかった 。', 'They wanted to deliver an important letter.', ['{大事|だいじ} な {手紙|てがみ} を 、', '{届|とど}けたかった 。']),
        B('s_name', ['name', 'search'], 'なくした {名前|なまえ} を 、 {探|さが}して いた 。', 'They were looking for a lost name.', ['なくした {名前|なまえ} を 、', '{探|さが}して いた 。']),
        B('s_fireworks', ['fireworks', 'ambition'], '{誰|だれ} より {高|たか}く 、 {花火|はなび} を {上|あ}げたかった 。', 'They wanted to send fireworks up higher than anyone.', ['{誰|だれ} より {高|たか}く 、', '{花火|はなび} を {上|あ}げたかった 。']),
        B('s_friend', ['friend', 'makeup'], '{友達|ともだち} と 、 {仲直|なかなお}り したかった 。', 'They wanted to make up with a friend.', ['{友達|ともだち} と 、', '{仲直|なかなお}り したかった 。']),
        B('s_soba', ['food', 'funny'], '{一番|いちばん} おいしい {蕎麦|そば} を 、 {食|た}べたかった 。', 'They wanted to eat the best soba in the world.', ['{一番|いちばん} おいしい {蕎麦|そば} を 、', '{食|た}べたかった 。']),
      ],
      trouble: [
        B('s_storm', ['storm', 'danger'], 'でも 、 {嵐|あらし} で {橋|はし} が {流|なが}れて しまった 。', 'But a storm washed the bridge away.', ['でも 、', '{嵐|あらし} で {橋|はし} が', '{流|なが}れて しまった 。']),
        B('s_fading', ['names'], 'でも 、 {町|まち} の {名前|なまえ} が 、 {一|ひと}つ ずつ {消|き}えて いった 。', 'But the town\'s names faded, one by one.', ['でも 、', '{町|まち} の {名前|なまえ} が 、', '{一|ひと}つ ずつ {消|き}えて いった 。']),
        B('s_thief', ['thief'], 'でも 、 {大切|たいせつ} な {物|もの} を {盗|ぬす}まれた 。', 'But something precious was stolen from them.', ['でも 、', '{大切|たいせつ} な {物|もの} を', '{盗|ぬす}まれた 。']),
        B('s_forgot', ['forget', 'sad'], 'でも 、 {自分|じぶん} が {誰|だれ} か 、 {忘|わす}れて しまった 。', 'But they forgot who they were.', ['でも 、', '{自分|じぶん} が {誰|だれ} か 、', '{忘|わす}れて しまった 。']),
        B('s_wallet', ['funny', 'money'], 'でも 、 {財布|さいふ} を {家|いえ} に {忘|わす}れて きた 。', 'But they had left their purse at home.', ['でも 、', '{財布|さいふ} を {家|いえ} に', '{忘|わす}れて きた 。']),
      ],
      turn: [
        B('s_alone', ['alone', 'brave'], 'それでも 、 {一人|ひとり} で {前|まえ} へ {進|すす}んだ 。', 'Even so, they went on alone.', ['それでも 、', '{一人|ひとり} で', '{前|まえ} へ {進|すす}んだ 。']),
        B('s_help', ['friends', 'help'], 'だから 、 {友達|ともだち} に {助|たす}け を {頼|たの}んだ 。', 'So they asked their friends for help.', ['だから 、', '{友達|ともだち} に', '{助|たす}け を {頼|たの}んだ 。']),
        B('s_back', ['went_back'], 'そこで 、 {来|き}た {道|みち} を {戻|もど}った 。', 'So they went back the way they had come.', ['そこで 、', '{来|き}た {道|みち} を', '{戻|もど}った 。']),
        B('s_sing', ['song', 'wait'], 'そこで 、 {歌|うた} を {歌|うた}って 、 {朝|あさ} を {待|ま}った 。', 'So they sang, and waited for morning.', ['そこで 、', '{歌|うた} を {歌|うた}って 、', '{朝|あさ} を {待|ま}った 。']),
        B('s_laugh', ['laugh', 'funny'], 'そこで 、 {大声|おおごえ} で {笑|わら}って しまった 。', 'So they burst out laughing.', ['そこで 、', '{大声|おおごえ} で', '{笑|わら}って しまった 。']),
      ],
      end: [
        B('s_home', ['happy', 'home'], '{最後|さいご} に は 、 {無事|ぶじ} に {家|いえ} へ {帰|かえ}った 。', 'In the end, they got home safely.', ['{最後|さいご} に は 、', '{無事|ぶじ} に', '{家|いえ} へ {帰|かえ}った 。']),
        B('s_open', ['sad', 'open'], '{最後|さいご} まで 、 {答|こた}え は {見|み}つからなかった 。', 'To the very end, no answer was found.', ['{最後|さいご} まで 、', '{答|こた}え は', '{見|み}つからなかった 。']),
        B('s_together', ['happy', 'festival'], '{最後|さいご} に は 、 みんな で {花火|はなび} を {見|み}た 。', 'In the end, everyone watched the fireworks together.', ['{最後|さいご} に は 、', 'みんな で', '{花火|はなび} を {見|み}た 。']),
        B('s_legend', ['legend'], '{今|いま} でも 、 その {話|はなし} を {覚|おぼ}えて いる {人|ひと} が いる 。', 'Even now, there are people who remember the tale.', ['{今|いま} でも 、', 'その {話|はなし} を {覚|おぼ}えて いる', '{人|ひと} が いる 。']),
        B('s_mayor', ['funny', 'cat_wins'], 'そして 、 {猫|ねこ} が {町|まち} の {長|おさ} に なった 。', 'And then the cat became the head of the town.', ['そして 、', '{猫|ねこ} が {町|まち} の {長|おさ} に', 'なった 。']),
      ],
      what: [
        B('n_festival', ['festival', 'fireworks'], '{川開|かわびら}き の {花火|はなび} を {上|あ}げます 。', 'Fireworks for the Opening of the River.', ['{川開|かわびら}き の {花火|はなび} を', '{上|あ}げます 。']),
        B('n_play', ['theatre'], '{芝居小屋|しばいごや} で 、 {新|あたら}しい {芝居|しばい} が {始|はじ}まります 。', 'A new play is opening at the playhouse.', ['{芝居小屋|しばいごや} で 、', '{新|あたら}しい {芝居|しばい} が', '{始|はじ}まります 。'], { unlock: 'mp_theatre_seen' }),
        B('n_cat', ['lost', 'cat'], '{迷子|まいご} の {猫|ねこ} を {探|さが}して います 。', 'Looking for a lost cat.', ['{迷子|まいご} の {猫|ねこ} を', '{探|さが}して います 。']),
        B('n_soba', ['food'], '{新|あたら}しい {蕎麦屋|そばや} が {開|ひら}きます 。', 'A new soba shop is opening.', ['{新|あたら}しい {蕎麦屋|そばや} が', '{開|ひら}きます 。']),
      ],
      when: [
        B('n_evening', ['evening'], '{七日|なのか} の {夕方|ゆうがた} から です 。', 'From the evening of the seventh.', ['{七日|なのか} の {夕方|ゆうがた}', 'から です 。']),
        B('n_morning', ['morning'], '{毎朝|まいあさ} 、 {六時|ろくじ} から です 。', 'Every morning from six.', ['{毎朝|まいあさ} 、', '{六時|ろくじ} から です 。']),
        B('n_rain', ['condition'], '{雨|あめ} が {降|ふ}ったら 、 {次|つぎ} の {日|ひ} に します 。', 'If it rains, it will be the next day.', ['{雨|あめ} が {降|ふ}ったら 、', '{次|つぎ} の {日|ひ} に します 。']),
      ],
      place: [
        B('n_bank', ['canal'], '{場所|ばしょ} は 、 {長堀|ながぼり} の {岸|きし} です 。', 'At the bank of the Long Canal.', ['{場所|ばしょ} は 、', '{長堀|ながぼり} の {岸|きし} です 。']),
        B('n_playhouse', ['theatre_place'], '{場所|ばしょ} は 、 {芝居小屋|しばいごや} の {前|まえ} です 。', 'In front of the playhouse.', ['{場所|ばしょ} は 、', '{芝居小屋|しばいごや} の {前|まえ} です 。'], { unlock: 'mp_theatre_seen' }),
        B('n_exchange', ['exchange'], '{場所|ばしょ} は 、 {札場|ふだば} の {中|なか} です 。', 'Inside the Tally Exchange.', ['{場所|ばしょ} は 、', '{札場|ふだば} の {中|なか} です 。']),
      ],
      ask: [
        B('n_welcome', ['welcome'], 'どうぞ 、 {皆|みな}さん で {来|き}て ください 。', 'Everyone, please come.', ['どうぞ 、', '{皆|みな}さん で', '{来|き}て ください 。']),
        B('n_keepback', ['safety'], '{危|あぶ}ない ので 、 {岸|きし} に {近|ちか}づかないで ください 。', 'It is dangerous, so please keep back from the bank.', ['{危|あぶ}ない ので 、', '{岸|きし} に', '{近|ちか}づかないで ください 。']),
        B('n_report', ['report'], '{見|み}つけたら 、 {教|おし}えて ください 。', 'If you find it, please let us know.', ['{見|み}つけたら 、', '{教|おし}えて ください 。']),
        B('n_kids', ['children', 'safety'], 'お{子|こ}さん は 、 {大人|おとな} と {一緒|いっしょ} に {来|き}て ください 。', 'Children, please come with a grown-up.', ['お{子|こ}さん は 、', '{大人|おとな} と {一緒|いっしょ} に', '{来|き}て ください 。']),
      ],
    },
    // readers: who (a character), npc + map (where to hear them), where (shown on the press's page), if (met)
    readers: [
      { id: 'mb_kansuke', npc: 'mb_kansuke', map: 'mb.kura', where: T('Warehouse Row, Manybridge'), if: 'mb_arrived', rules: [
        R(['boatman'], '{船頭|せんどう} が {主役|しゅやく} か ！ {儂|わし} の こと か と {思|おも}った わい 。', 'A boatman in the lead! I thought it was about me.'),
        R(['kind:notice', 'festival'], '{川開|かわびら}き の {知|し}らせ 、 {見|み}た ぞ 。 {儂|わし} の {舟|ふね} も 、 {花火|はなび} の {下|した} を {通|とお}る わい 。', 'Saw the notice for the Opening. My boat\'ll pass under the fireworks too.'),
        R(['storm'], '{嵐|あらし} で {橋|はし} が {流|なが}れる {話|はなし} は 、 {笑|わら}えん のう 。 …… でも 、 {最後|さいご} まで {読|よ}んで しもうた 。', 'A bridge washed away in a storm is no laughing matter. …But I read it to the end all the same.'),
        R([], '{読|よ}んだ よ 。 {話|はなし} は 、 {短|みじか}い ほど いい 。', 'I read it. The shorter a tale, the better.'),
      ] },
      { id: 'mb_uno', npc: 'mb_uno', map: 'mb.inn', where: T('Kawaya, the inn, Manybridge'), if: 'mb_arrived', rules: [
        R(['where:inn'], '{置|お}いて いった {紙|かみ} 、 お{客|きゃく}さん が {回|まわ}し{読|よ}み して いる よ 。', 'The sheet you left here: the guests are passing it round.'),
        R(['food'], '{読|よ}んだら 、 お{腹|なか} が {空|す}いちゃった よ 。 {今夜|こんや} は {蕎麦|そば} に しよう か ね 。', 'Reading it made me hungry. Soba tonight, I think.'),
        R(['happy', 'home'], '{家|いえ} に {帰|かえ}る {話|はなし} は いい ね 。 {宿屋|やどや} が {言|い}う の も {変|へん} だ けど 。', 'Stories about getting home are nice. An odd thing for an innkeeper to say.'),
        R([], '{読|よ}んだ よ 。 {宿|やど} の お{客|きゃく}さん に も {見|み}せて おく ね 。', 'I read it. I\'ll show the guests too.'),
      ] },
      { id: 'mb_kayo', npc: 'mb_kayo', map: 'mb.exchange', where: T('The Exchange district, Manybridge'), if: 'mb_ichi_found', rules: [
        R(['child'], '{女|おんな} の {子|こ} が {橋|はし} を {数|かぞ}える {話|はなし} …… うち の イチ みたい です 。 {寝|ね}る {前|まえ} に {読|よ}んで あげて います 。', 'A little girl counting bridges… just like my Ichi. I read it to him at bedtime.'),
        R(['kind:notice', 'children'], 'お{子|こ}さん は {大人|おとな} と {一緒|いっしょ} に 、 と {書|か}いて くれて 、 ありがとう ございます 。', 'Thank you for writing "children with a grown-up".'),
        R(['kind:notice', 'lost'], '{迷子|まいご} の {知|し}らせ を {見|み}る と 、 あの {夜|よる} を {思|おも}い{出|だ}します 。 …… {見|み}つかります よう に 。', 'A notice about something lost takes me back to that night. …I hope it\'s found.'),
        R([], 'イチ が 、 {字|じ} を {指|ゆび} で なぞって {読|よ}んで います 。', 'Ichi is reading it with his finger under the words.'),
      ] },
      { id: 'mb_yoshi', npc: 'mb_yoshi', map: 'mb.deadletter', where: T('The dead-letter office, Manybridge'), if: 'mb_ev_letter', rules: [
        R(['letter'], '{届|とど}かない かも しれない {手紙|てがみ} を {運|はこ}ぶ {話|はなし} …… {胸|むね} に {来|き}ました 。', 'A story about carrying a letter that might never arrive… it went to my heart.'),
        R(['went_back'], '{来|き}た {道|みち} を {戻|もど}る 。 {宛先|あてさき} が {分|わ}からない とき 、 {私|わたし} も そう します 。', 'Going back the way you came. When I can\'t find an address, I do the same.'),
        R([], '{読|よ}みました 。 {行|い}き{先|さき} の ある {紙|かみ} は 、 いい です ね 。', 'I read it. Paper with somewhere to go is a fine thing.'),
      ] },
      { id: 'mb_masa', npc: 'mb_masa', map: 'mb.exchange', where: T('Masaya\'s stall, Manybridge'), if: 'mb_arrived', rules: [
        R(['where:stall'], '{屋台|やたい} で {配|くば}った {紙|かみ} 、 {全部|ぜんぶ} なくなった よ ！ お{客|きゃく}さん が {持|も}って いった 。', 'The sheets you gave out at the stall are all gone! The customers took them.'),
        R(['food'], '{蕎麦|そば} が {出|で}て くる {話|はなし} は 、 {全部|ぜんぶ} いい {話|はなし} よ ！', 'Any story with soba in it is a good story!'),
        R(['funny'], '{笑|わら}った 、 {笑|わら}った ！ {屋台|やたい} の {前|まえ} で {読|よ}み{上|あ}げちゃった 。', 'I laughed and laughed! I read it out in front of the stall.'),
        R([], '{読|よ}んだ よ 。 {字|じ} が {大|おお}きくて 、 {読|よ}みやすい ね 。', 'I read it. Nice big letters, easy to read.'),
      ] },
      { id: 'mb_take', npc: 'mb_take', map: 'mb.pier', where: T('The ferry pier, Manybridge'), if: 'mb_arrived', rules: [
        R(['courier'], '{配達人|はいたつにん} が {主人公|しゅじんこう} か 。 {荷運|にはこ}び の {話|はなし} も {書|か}いて くれ よ 。', 'A courier as the hero, eh. Write one about porters too.'),
        R(['deliver'], '{届|とど}ける {話|はなし} は 、 {俺|おれ} たち の {話|はなし} だ 。', 'Stories about delivering are our stories.'),
        R([], '{読|よ}んだ ぜ 。 {荷|に} の {合間|あいま} に ちょうど いい 。', 'Read it. Just right between loads.'),
      ] },
      { id: 'fuku', npc: 'fuku', map: 'sg.harbor', where: T('The harbour, Saltglass'), rules: [
        R(['sea'], '{港|みなと} の {話|はなし} ね 。 {潮|しお} の {匂|にお}い が して きそう 。', 'A harbour story. I can almost smell the tide.'),
        R(['sad'], '{答|こた}え の {出|で}ない {話|はなし} …… わたし は 、 {嫌|きら}い じゃ ない わ 。', 'A story with no answer… I don\'t mind that, you know.'),
        R([], '{八百橋|やおばし} の {刷|す}り{物|もの} が 、 ここ まで {届|とど}いた の よ 。', 'A print from Manybridge reached all the way here.'),
      ] },
      { id: 'hana', npc: 'hana', map: 'rw.tea', where: T('The teahouse, Reedwake'), rules: [
        R(['river', 'village'], '{葦|あし} の {揺|ゆ}れる {川|かわ}べり の {村|むら} …… ここ の こと かしら 。 うれしい わ 。', 'A village by a river where the reeds sway… is that here? How lovely.'),
        R(['friend', 'makeup'], '{仲直|なかなお}り の {話|はなし} は 、 {何度|なんど} {読|よ}んで も いい わ ね 。', 'Stories about making up are good however many times you read them.'),
        R([], '{旅|たび} の {途中|とちゅう} で 、 {話|はなし} を {書|か}いた の ね 。 {読|よ}んだ わ よ 。', 'You wrote a story on your travels. I read it.'),
      ] },
    ],
  };

  // each reader's waiting reaction, heard by talking to them: a talk option first, waiting on press_rx_<reader>
  // (the flag is set only by printing, in twelve-chapter journeys; a six-chapter journey never meets it)
  for (const r of C.press.readers) {
    C.scenes = C.scenes || {};
    const m = C.maps[r.map];
    if (!m) continue;
    for (const n of m.npcs || []) {
      if (n.id !== r.npc) continue;
      const talk = Array.isArray(n.talk) ? n.talk : typeof n.talk === 'string' ? [{ scene: n.talk }] : [];
      n.talk = [{ if: 'press_rx_' + r.id, scene: 'mp.rx_' + r.id }].concat(talk);
    }
  }
})(RB.content);

// the readers' reactions, heard in the world (the line itself is chosen by src/engine/72p_press.js from the page's tags)
RB.script.add(`
@scene mp.rx_mb_kansuke
!hook press_react mb_kansuke

@scene mp.rx_mb_uno
!hook press_react mb_uno

@scene mp.rx_mb_kayo
!hook press_react mb_kayo

@scene mp.rx_mb_yoshi
!hook press_react mb_yoshi

@scene mp.rx_mb_masa
!hook press_react mb_masa

@scene mp.rx_mb_take
!hook press_react mb_take

@scene mp.rx_fuku
!hook press_react fuku

@scene mp.rx_hana
!hook press_react hana
`, 'mp/30_press.js');
