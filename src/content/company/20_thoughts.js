/* Companionship content, part 2: what is on their mind (Company's Thoughts panel)
 * and "Talk about this place". A thought is an interpretation of the present in
 * the companion's own voice: never an unsolicited hint, never a claim about why
 * the player did anything. Selection: src/engine/58_companion.js thought().
 *   thoughts: { comp, kind: 'quest'|'rest'|'any', when, prio, text }
 *   places:   { comp, where: place key(s), when, lines } — the first line is the thought */
var RB = (globalThis.RB = globalThis.RB || {});

(function (CC) {
  'use strict';
  const T = (jp, en, expr) => (expr ? { jp, en, expr } : { jp, en });
  const P = (comp, where, when, ...lines) => CC.places.push({ comp, where, when, lines });
  const Q = (comp, when, text, prio) => CC.thoughts.push({ comp, kind: 'quest', when, text, prio: prio || 1 });
  const R = (comp, when, text) => CC.thoughts.push({ comp, kind: 'rest', when, text });
  const A = (comp, text) => CC.thoughts.push({ comp, kind: 'any', text });
  const AFTER = 'sa_hush_down|post';

  // ================================================================ Nao
  P('nao', 'reedwake', '!post',
    T('{葦|あし}ノ{瀬|せ} に {戻|もど}る と 、 {足|あし} が {勝手|かって} に {郵便|ゆうびん} の {棚|たな} に {向|む}かう 。 {癖|くせ} だ な 。', 'Back in Reedwake, my feet head for the post shelf on their own. Habit.'),
    T('{橋|はし} が {届|とど}いてる の を {見|み}る と 、 まだ {少|すこ}し {驚|おどろ}く 。 {前|まえ} は {遠回|とおまわ}り しか なかった から な 。', 'Seeing the bridge reach the far bank still surprises me a little. It used to be the long way round or nothing.'));
  P('nao', 'reedwake', 'post',
    T('{帰|かえ}る {場所|ばしょ} が ある って の は 、 {出口|でぐち} が ある の と {同|おな}じ くらい {大事|だいじ} だ 。', 'Having somewhere to come back to matters as much as having a way out.'),
    T('…… {俺|おれ} に しちゃ 、 {柄|がら} に も ない こと を {言|い}った な 。 {忘|わす}れて くれ 。', '…That was out of character for me. Forget I said it.', 'smirk'));
  P('nao', 'saltglass', '!ch2_done',
    T('{潮硝子|しおがらす} の {港|みなと} は 、 {荷|に} の ラベル が {全部|ぜんぶ} だ 。 {字|じ} が {一|ひと}つ {違|ちが}えば 、 {荷|に} が {違|ちが}う {港|みなと} に {着|つ}く 。', 'In Saltglass, cargo labels are everything. Get one character wrong and the cargo lands in the wrong port.'),
    T('{右|みぎ} の {桟橋|さんばし} は {歩|ある}くな よ 。 {板|いた} が {腐|くさ}ってる 。 …… {経験者|けいけんしゃ} は {語|かた}る 。', 'Don\'t walk the right-hand pier. The boards are rotten. …Speaking from experience.', 'smirk'));
  P('nao', 'saltglass', 'ch2_done',
    T('{渡|わた}し{場|ば} の {板|いた} が 、 {本当|ほんとう} の こと を {言|い}ってる 。 {退屈|たいくつ} で いい 。', 'The ferry board tells the truth now. Nice and boring.'),
    T('ワタル は {今日|きょう} も ラベル を {書|か}いてる だろう な 。 {字|じ} は {悪|わる}く なかった 。', 'Wataru\'s probably writing labels again today. His hand wasn\'t bad.'));
  P('nao', 'archive', '',
    T('{水|みず} の {下|した} の {書庫|しょこ} か 。 {出口|でぐち} は {三|みっ}つ {確|たし}かめて おく 。 {潮|しお} は {待|ま}って くれない 。', 'An archive under water. I\'ll check three ways out. The tide doesn\'t wait.'));
  P('nao', 'cinder', '!ch3_done',
    T('{柿|かき} と ガラス の {里|さと} だ 。 {配達|はいたつ} で {来|く}る と 、 いつも {柿|かき} を {持|も}たされる 。', 'A village of persimmons and glass. Deliver here and they always send you off with persimmons.'),
    T('…… {里|さと} の {人|ひと} が {火|ひ} の {話|はなし} を しない 。 {柿|かき} の {話|はなし} は {一日中|いちにちじゅう} する のに 。', '…Nobody here talks about fire. They\'ll talk about persimmons all day.', 'think'));
  P('nao', 'cinder', 'ch3_done',
    T('{防火帯|ぼうかたい} を {刈|か}る {音|おと} が する 。 {火事|かじ} を {覚|おぼ}えてる {里|さと} の {音|おと} だ 。', 'You can hear them cutting back the firebreaks. The sound of a village that remembers its fire.'));
  P('nao', 'snowbell', '!ch4_done',
    T('{雪|ゆき} の {道|みち} は 、 {足跡|あしあと} が すぐ {消|き}える 。 {帰|かえ}り{道|みち} は 、 {俺|おれ} が {覚|おぼ}えて おく 。', 'On snow roads, footprints vanish fast. I\'ll remember the way back.'),
    T('{宛名|あてな} の ない {手紙|てがみ} が 、 {郵便|ゆうびん} {小屋|ごや} に {溜|た}まってる 。 …… {見|み}てる だけ で {肩|かた} が {凝|こ}る 。', 'Letters with no address are piling up at the post shelter. …Just looking at them gives me a stiff neck.'));
  P('nao', 'snowbell', 'ch4_done',
    T('{宛名|あてな} が {戻|もど}った {雪鈴|ゆきすず} は 、 {同|おな}じ {雪|ゆき} でも {明|あか}るく {見|み}える 。', 'With the addresses back, Snowbell looks brighter. Same snow and all.'));
  P('nao', 'lanternfall', '!lf_bell_rung',
    T('{誰|だれ} も 「 いいえ 」 と {言|い}わない {町|まち} だ 。 「 {受取|うけとり} {拒否|きょひ} 」 が {一通|いっつう} も ない 。 {気味|きみ} が {悪|わる}い 。', 'Nobody in this town says no. Not a single "refused by recipient". Gives me the creeps.'));
  P('nao', 'lanternfall', 'lf_bell_rung',
    T('{鐘|かね} の {後|あと} の {灯落|ひおち} は 、 {道|みち} を {聞|き}けば {違|ちが}う {答|こた}え が {三|みっ}つ {返|かえ}って くる 。 {正常|せいじょう} だ 。', 'Since the bell, ask the way in Lanternfall and you get three different answers. That\'s normal.', 'smirk'));
  P('nao', 'sa_mount', '!sa_hush_down&!post',
    T('{書庫|しょこ} まで の {道|みち} は {一本|いっぽん} だけ 。 {帰|かえ}り{道|みち} も {一本|いっぽん} だ 。 {覚|おぼ}え やすい けど 、 {気|き} に {入|い}らない 。', 'One road up to the Archive. One road back. Easy to remember, but I don\'t like it.'));
  P('nao', 'sa_mount', AFTER,
    T('{小屋|こや} の {宿帳|やどちょう} 、 {帰|かえ}り の {欄|らん} に {日付|ひづけ} が {入|はい}った 。 {往復|おうふく} で {一|ひと}つ の {配達|はいたつ} だ 。', 'The hut\'s register has a date in our return column now. There and back: one delivery.', 'smile'));
  P('nao', 'sa_still', '!sa_hush_down&!post',
    T('{音|おと} が しない 。 {書庫|しょこ} って の は {静|しず}か な もん だ けど 、 ここ は {息|いき} まで {預|あず}けさせられ そう だ 。', 'No sound at all. Archives are quiet, but this one feels like it\'d take your breath into safekeeping too.'));
  P('nao', 'sa_still', AFTER,
    T('{静|しず}か な の は {同|おな}じ なのに 、 {今|いま} は {息|いき} が できる 。', 'Just as quiet, but now you can breathe.'));
  P('nao', 'koharuno', '',
    T('{小春野|こはるの} まで の {道|みち} 、 {今|いま} なら {目|め} を {閉|と}じて も {歩|ある}ける 。 {柿|かき} の {木|き} が {目印|めじるし} だ 。', 'The road to Koharuno — I could walk it with my eyes shut now. The persimmon tree\'s the landmark.'));
  P('nao', 'atlas', '',
    T('{地図|ちず} に ない {道|みち} だ 。 …… {正直|しょうじき} 、 {少|すこ}し {楽|たの}しい 。 {帰|かえ}り{道|みち} を {確|たし}かめ ながら なら 。', 'Roads that aren\'t on any map. …Honestly, it\'s a bit fun. As long as I keep checking the way back.'));

  Q('nao', 'sg_nao_isamu&!quest.lf_nao&!ch2_done', T('{丘|おか} の {上|うえ} の {空|あ}き{家|や} 。 {差出人|さしだしにん} の いない {家|いえ} って の は 、 {静|しず}か すぎる 。', 'The empty house on the hill. A house with its sender gone is too quiet.'));
  Q('nao', 'ch4_done&!quest.lf_nao', T('{灯落|ひおち} に {着|つ}いたら {話|はな}す って 、 {言|い}った よ な 。 …… {忘|わす}れて ない 。', 'I said I\'d tell you when we got to Lanternfall, didn\'t I. …I haven\'t forgotten.'));
  Q('nao', 'quest.lf_nao=1', T('{断|ことわ}れない {相手|あいて} に は 、 {渡|わた}せない 。 {鐘|かね} が {鳴|な}る まで 、 あの {手紙|てがみ} は まだ {俺|おれ} の {鞄|かばん} の {中|なか} だ 。', 'I can\'t hand it to someone who can\'t refuse it. Until the bell rings, that letter stays in my satchel.'), 2);
  Q('nao', 'quest.lf_nao=done&!ch5_done', T('{鞄|かばん} が {軽|かる}い 。 …… {軽|かる}すぎて 、 {歩|ある}き{方|かた} を {忘|わす}れ そう だ 。', 'The satchel\'s light. …So light I might forget how to walk.'), 2);
  Q('nao', 'quest.sb_lamp>=1&!sb_lamp_lit', T('{約束|やくそく} を {守|まも}って {灯|あか}り を {待|ま}つ {親父|おやじ} さん か 。 {待|ま}たせる {側|がわ} の {気持|きも}ち も 、 {少|すこ}し {分|わ}かる 。', 'An old man keeping a promise and a light. I know a little about the side that keeps people waiting, too.'));
  R('nao', 'rest!=camp', T('{宿|やど} に {着|つ}く と 、 まず {窓|まど} と {扉|とびら} を {数|かぞ}える 。 それ から やっと {靴|くつ} を {脱|ぬ}ぐ 。', 'When we get to an inn, I count the windows and doors first. Only then do the boots come off.'));
  R('nao', 'rest=camp', T('{焚|た}き{火|び} の {番|ばん} は {俺|おれ} が する 。 {火|ひ} を {見|み}て いる と 、 {道|みち} の こと を {考|かんが}え なくて {済|す}む 。', 'I\'ll watch the fire. Looking at flames, I don\'t have to think about the road.'));
  A('nao', T('{次|つぎ} の {角|かど} を {曲|ま}がったら {何|なに} が ある か 。 {分|わ}かって いて も 、 {毎回|まいかい} {少|すこ}し {楽|たの}しみ だ 。', 'What\'s round the next corner. Even when I know, I look forward to it a little every time.'));

  // ================================================================ Mio
  P('mio', 'reedwake', '!post',
    T('{葦|あし}ノ{瀬|せ} の お{店|みせ} 、 {棚|たな} の {埃|ほこり} が {気|き} に なります 。 …… {今|いま} は {見|み}ない こと に します 。', 'I keep thinking about the dust on the shop shelves in Reedwake. …I\'ve decided not to look, for now.'),
    T('ハナ さん の お{茶|ちゃ} 、 {旅|たび} の {間|あいだ} ずっと {恋|こい}しかった です 。', 'I missed Hana\'s tea the whole way.', 'smile'));
  P('mio', 'reedwake', 'post',
    T('{水曜|すいよう} は お{休|やす}み 、 の {札|ふだ} 、 まだ {慣|な}れません 。 でも 、 {外|はず}して は いません よ 。', 'I\'m still not used to the "Closed Wednesdays" sign. But I haven\'t taken it down.', 'smile'));
  P('mio', 'saltglass', '!ch2_done',
    T('{港|みなと} の {人|ひと} は 、 {手|て} が {荒|あ}れて います 。 {塩|しお} と {縄|なわ} の せい です ね 。 …… {軟膏|なんこう} 、 {足|た}りる かしら 。', 'People at the harbour have chapped hands. The salt and the rope. …I wonder if I\'ve enough ointment.'));
  P('mio', 'saltglass', 'ch2_done',
    T('{港|みなと} が {賑|にぎ}やか に なりました ね 。 {干物|ひもの} を たくさん {頂|いただ}いて 、 {鞄|かばん} が {魚|さかな} の {匂|にお}い です 。', 'The harbour\'s lively again. People keep giving us dried fish; my bag smells of it.', 'laugh'));
  P('mio', 'archive', '',
    T('{水|みず} が {冷|つめ}たい です 。 {足|あし} を {濡|ぬ}らしたら 、 {出|で}て から すぐ {拭|ふ}いて ください ね 。', 'The water\'s cold. If your feet get wet, dry them as soon as we\'re out.', 'worry'));
  P('mio', 'cinder', '!ch3_done',
    T('この {里|さと} 、 {火傷|やけど} の {薬|くすり} を {置|お}いて いる お{店|みせ} が 、 {一軒|いっけん} も ない んです 。 {窯|かま} の {里|さと} なのに 。', 'Not one shop in this village keeps burn salve. In a kiln village.', 'think'));
  P('mio', 'cinder', 'ch3_done',
    T('{柿|かき} の {葉|は} の お{茶|ちゃ} 、 {分|わ}けて もらいました 。 {火|ひ} の {話|はなし} を して も 、 {皆|みな} さん {落|お}ち{着|つ}いて います 。', 'They shared persimmon-leaf tea with me. People can talk about the fire now and stay calm.', 'smile'));
  P('mio', 'snowbell', '!ch4_done',
    T('{山|やま} の {空気|くうき} は {乾|かわ}いて います 。 {喉|のど} を {大事|だいじ} に して ください ね 。 {飴|あめ} 、 あります よ 。', 'The mountain air is dry. Look after your throat. I have lozenges.'));
  P('mio', 'snowbell', 'ch4_done',
    T('ホシノ さん の {灯|あか}り 、 {下|した} から {見|み}て も {暖|あたた}かい 。 …… {灯|あか}り って 、 {薬|くすり} に {似|に}て います ね 。 {効|き}く {人|ひと} に は 、 ちゃんと {効|き}く 。', 'Hoshino\'s lamp looks warm even from down here. …Light is a bit like medicine. It works on the ones it works on.', 'smile'));
  P('mio', 'lanternfall', '!lf_bell_rung',
    T('{皆|みな} さん 、 {顔色|かおいろ} は いい のに 、 {目|め} が {疲|つか}れて います 。 {言|い}いたい こと を {飲|の}み{込|こ}んだ {人|ひと} の {目|め} です 。', 'Everyone\'s colour is good, but their eyes are tired. The eyes of people who swallow what they want to say.', 'worry'));
  P('mio', 'lanternfall', 'lf_bell_rung&quest.lf_mio=done',
    T('{今日|きょう} 、 {三人|さんにん} に {頼|たの}まれて 、 {一人|ひとり} に {断|ことわ}りました 。 {誰|だれ} も {怒|おこ}りません でした 。', 'Today three people asked me for things, and I turned one of them down. Nobody got angry.', 'smile'));
  P('mio', 'lanternfall', 'lf_bell_rung&!quest.lf_mio=done',
    T('{町|まち} の {人|ひと} が {言|い}い{合|あ}って いる {声|こえ} 、 {元気|げんき} そう で ほっと します 。', 'Hearing the townspeople argue is a relief. They sound so well.', 'smile'));
  P('mio', 'sa_mount', '!sa_hush_down&!post',
    T('{高|たか}い {所|ところ} は {息|いき} が {切|き}れやすい です 。 {休|やす}み ながら {行|い}きましょう 。 {急|いそ}ぐ {理由|りゆう} が あって も 。', 'Up high you get out of breath easily. Let\'s rest as we go. Even if there\'s reason to hurry.'));
  P('mio', 'sa_mount', AFTER,
    T('{小屋|こや} の オヨネ さん が 、 {新|あたら}しい お{茶|ちゃ} を {淹|い}れて くれました 。 {帰|かえ}り の お{茶|ちゃ} って 、 {味|あじ} が {違|ちが}います ね 。', 'Oyone at the hut made us fresh tea. Tea on the way home tastes different, doesn\'t it.', 'smile'));
  P('mio', 'sa_still', '!sa_hush_down&!post',
    T('ここ に は 、 {自分|じぶん} から {悲|かな}しみ を {預|あず}けた {人|ひと} も いる んです よね 。 …… {責|せ}める {気|き} に は なれません 。', 'Some of the people here set their sorrow down of their own accord, didn\'t they. …I can\'t bring myself to blame them.', 'sad'));
  P('mio', 'sa_still', AFTER,
    T('{預|あず}けた もの を {取|と}り に {来|く}る か どう か 、 {自分|じぶん} で {決|き}められる 。 それ が {一番|いちばん} {大事|だいじ} だ と {思|おも}います 。', 'Whether to come back for what you left — you decide that yourself. I think that\'s what matters most.'));
  P('mio', 'koharuno', '',
    T('{柿|かき} の {木|き} 、 {元気|げんき} です 。 {誰|だれ} も {世話|せわ} して いない のに 。 …… {薬師|くすし} と して は 、 {少|すこ}し {悔|くや}しい です 。', 'The persimmon tree is thriving, with no one tending it. …A little galling, as an apothecary.', 'laugh'));
  P('mio', 'atlas', '',
    T('{知|し}らない {道|みち} でも 、 {薬箱|くすりばこ} が {重|おも}ければ {安心|あんしん} です 。 {重|おも}い の は 、 {私|わたし} が {持|も}ちます から 。', 'Even on roads nobody knows, a heavy medicine chest is a comfort. I\'ll carry the heavy one.'));

  Q('mio', 'ch4_done&!quest.lf_mio', T('{灯落|ひおち} は 、 「 いいえ 」 が {言|い}えない {町|まち} だ と {聞|き}きました 。 …… {私|わたし} に は 、 {少|すこ}し {他人事|ひとごと} じゃ ありません 。', 'They say Lanternfall is a town where no one can say "no". …For me, that hits a little close to home.', 'think'));
  Q('mio', 'quest.lf_mio=1', T('「 かしこまりました 」 が 、 {私|わたし} の {口|くち} から {出|で}そう に なる んです 。 {私|わたし} の {言葉|ことば} じゃ ない のに 。', '"Certainly" keeps trying to come out of my mouth. It isn\'t even my word.'), 2);
  Q('mio', 'quest.lf_mio=2', T('{断|ことわ}る {言葉|ことば} を 、 {頭|あたま} の {中|なか} で {何度|なんど} も {練習|れんしゅう} して います 。 {薬|くすり} を {量|はか}る みたい に 。', 'I\'m rehearsing the words of refusal over and over in my head. Like measuring out medicine.'), 2);
  Q('mio', 'quest.lf_mio=done&!ch5_done', T('{断|ことわ}った {後|あと} で 、 {頼|たの}まれた {薬|くすり} の {半分|はんぶん} を {作|つく}りました 。 {全部|ぜんぶ} じゃ なくて 、 {必要|ひつよう} な {分|ぶん} だけ 。', 'After refusing, I made half the medicines I\'d been asked for. Not all of them. Just what\'s needed.'), 2);
  Q('mio', 'quest.sb_lamp>=1&!sb_lamp_lit', T('ホシノ さん 、 {眠|ねむ}れて いない {顔|かお} を して います 。 {約束|やくそく} が 、 {人|ひと} を {眠|ねむ}らせない こと も ある ん です ね 。', 'Hoshino has the face of someone who isn\'t sleeping. A promise can keep a person awake, can\'t it.', 'worry'));
  R('mio', 'rest!=camp', T('お{湯|ゆ} が {沸|わ}く {音|おと} を {聞|き}く と 、 {肩|かた} の {力|ちから} が {抜|ぬ}けます 。 {職業病|しょくぎょうびょう} です ね 。', 'The sound of water coming to the boil makes my shoulders drop. An occupational habit.'));
  R('mio', 'rest=camp', T('{野宿|のじゅく} の {夜|よる} は 、 {薬箱|くすりばこ} を {枕|まくら} の {近|ちか}く に {置|お}きます 。 {開|あ}けない {夜|よる} が 、 {一番|いちばん} いい {夜|よる} です 。', 'On nights outdoors I keep the medicine chest by my pillow. The best nights are the ones I never open it.'));
  A('mio', T('{今日|きょう} の {空|そら} は 、 {薬草|やくそう} を {干|ほ}す の に ちょうど いい {空|そら} です 。', 'Today\'s sky is just right for drying herbs.'));

  // ================================================================ Ren
  P('ren', 'reedwake', '!post',
    T('{葦|あし}ノ{瀬|せ} の {灯|あか}り は 、 {全部|ぜんぶ} ともって います 。 {数|かぞ}えました 。 {二回|にかい} 。', 'Every lantern in Reedwake is lit. I counted. Twice.'),
    T('{灯|あか}り{堂|どう} まで の {道|みち} も 、 {今日|きょう} は {一度|いちど} で {着|つ}きました 。 {記録|きろく} して おきます 。', 'I reached the Lantern Hall in one go today, too. I\'ll put that on record.', 'smirk'));
  P('ren', 'reedwake', 'post',
    T('{灯|あか}り{堂|どう} の {棚|たな} に 、 {新|あたら}しい {記録|きろく} が {増|ふ}えました 。 {半分|はんぶん} は 、 {私|わたし} たち の {旅|たび} の こと です 。', 'There are new records on the Lantern Hall shelves. Half of them are about our journey.', 'smile'));
  P('ren', 'saltglass', '!ch2_done',
    T('{海|うみ} に は 、 {灯|あか}り の {道|みち} が ありません 。 {名前|なまえ} の ない {道|みち} を 、 {船|ふね} は どう やって {行|い}く の でしょう 。', 'The sea has no lantern roads. How do ships follow a road with no names?', 'think'),
    T('…… {灯台|とうだい} が {一|ひと}つ 。 なるほど 。 {名前|なまえ} を {書|か}かない {灯守|ひもり} です ね 。', '…One lighthouse. I see. A keeper who writes no names.'));
  P('ren', 'saltglass', 'ch2_done',
    T('{灯台|とうだい} の {灯|ひ} は 、 {名前|なまえ} を {呼|よ}ばない {灯|あか}り です 。 それでも {皆|みな} が {帰|かえ}って くる 。 {羨|うらや}ましい {仕事|しごと} です 。', 'The lighthouse lamp never calls a name. And still everyone comes home. An enviable job.'));
  P('ren', 'archive', '',
    T('{書庫|しょこ} の {札|ふだ} は 、 {全部|ぜんぶ} {丁寧|ていねい} な {字|じ} です 。 {丁寧|ていねい} すぎて 、 {少|すこ}し {怖|こわ}い 。', 'Every label in this archive is in careful handwriting. Too careful. It frightens me a little.', 'worry'));
  P('ren', 'cinder', '!ch3_done',
    T('{記録|きろく} が {静|しず}か すぎる {里|さと} です 。 {灯守|ひもり} と して 、 {落|お}ち{着|つ}きません 。', 'A village whose records are too quiet. As a keeper, it unsettles me.', 'think'));
  P('ren', 'cinder', 'ch3_done',
    T('{年代記|ねんだいき} に 、 {火事|かじ} の {頁|ページ} が {戻|もど}りました 。 {読|よ}む の が {辛|つら}い {頁|ページ} ほど 、 {大事|だいじ} な {頁|ページ} です 。', 'The fire is back in the chronicle. The pages that hurt to read are the ones that matter.'));
  P('ren', 'snowbell', '!ch4_done',
    T('{石段|いしだん} の {灯|あか}り が 、 {上|うえ} へ {行|い}く ほど {暗|くら}く なって います 。 {疲|つか}れた {灯|あか}り の {色|いろ} です 。', 'The lanterns on the stair grow dimmer the higher they go. That\'s the colour of a tired light.', 'worry'));
  P('ren', 'snowbell', 'ch4_done',
    T('{天文台|てんもんだい} の {灯|あか}り は 、 {良|よ}い {芯|しん} を {使|つか}って います 。 ホシノ さん と は 、 {芯|しん} の {話|はなし} だけ で {一晩|ひとばん} {語|かた}れ そう です 。', 'The observatory lamp has a good wick. Hoshino and I could spend a whole night talking about wicks alone.', 'smile'));
  P('ren', 'lanternfall', '!lf_bell_rung',
    T('この {町|まち} の {灯|あか}り は 、 {手入|てい}れ が {完璧|かんぺき} です 。 {完璧|かんぺき} すぎる {灯|あか}り は 、 {誰|だれ} も {文句|もんく} を {言|い}わない {証拠|しょうこ} かも しれません 。', 'The lamps in this town are perfectly kept. Too perfect — maybe proof that nobody complains.', 'think'));
  P('ren', 'lanternfall', 'lf_bell_rung',
    T('{通|とお}り の {名前|なまえ} で {言|い}い{争|あらそ}って いる {人|ひと} が います 。 {灯守|ひもり} と して は 、 {嬉|うれ}しい {音|おと} です 。', 'Someone is arguing about a street name. To a lantern keeper, that\'s a happy sound.', 'smile'));
  P('ren', 'sa_mount', '!sa_hush_down&!post',
    T('{書庫|しょこ} へ の {道|みち} は {一本|いっぽん} です 。 {迷|まよ}い よう が ありません 。 …… {油断|ゆだん} は しません が 。', 'There\'s only one road to the Archive. Impossible to get lost. …I shan\'t be complacent, though.', 'smirk'));
  P('ren', 'sa_mount', AFTER,
    T('{道|みち} の {脇|わき} の {灯|あか}り が 、 また {名前|なまえ} を {呼|よ}んで います 。 {下|くだ}り {道|みち} の {名前|なまえ} を 。', 'The lanterns along the road are calling names again. The names of the way down.'));
  P('ren', 'sa_still', '!sa_hush_down&!post',
    T('「 {写|うつ}して {預|あず}かり 、 {頼|たの}まれたら {返|かえ}す 」 。 {元|もと} は 、 {良|よ}い {約束|やくそく} から {始|はじ}まった {場所|ばしょ} です 。', '"Copy and keep; when asked, return." This place began with a good promise.', 'think'));
  P('ren', 'sa_still', AFTER,
    T('{返|かえ}す {仕組|しく}み が {戻|もど}れば 、 {書庫|しょこ} は {悪|わる}い {場所|ばしょ} で は ありません 。 {灯|あか}り{堂|どう} の {遠|とお}い {親戚|しんせき} の よう な もの です 。', 'Once it can give things back again, an archive isn\'t a bad place. A distant relative of the Lantern Hall, really.'));
  P('ren', 'koharuno', '',
    T('{笠|かさ} の {名前|なまえ} が 、 {根|ね} を {張|は}って います 。 {道|みち} は もう {迷|まよ}いません 。 {私|わたし} は {迷|まよ}います が 。', 'The names on the shade have taken root. The road won\'t get lost again. I still might.', 'smirk'));
  P('ren', 'atlas', '',
    T('{地図|ちず} に {名前|なまえ} の ない {道|みち} 。 {灯守|ひもり} に とって は 、 {宿題|しゅくだい} の {山|やま} です 。 {嬉|うれ}しい {山|やま} です が 。', 'Roads with no names on any map. For a lantern keeper, a mountain of homework. A welcome mountain.'));

  Q('ren', 'quest.ren_ushio=0', T('{似顔絵|にがおえ} の {字|じ} は 、 {確|たし}か に {師匠|ししょう} の {字|じ} でした 。 {字|じ} は {覚|おぼ}えて いる のに 。 …… {不公平|ふこうへい} な {記憶|きおく} です 。', 'The writing on the portrait was certainly my teacher\'s. I remember the handwriting. …An unfair sort of memory.', 'think'), 2);
  Q('ren', 'quest.ren_ushio=1', T('{墓|はか} を {彫|ほ}った {人|ひと} に 、 {聞|き}きたい こと が あります 。 {怒|おこ}って は いません 。 たぶん 。', 'I have questions for whoever carved that stone. I\'m not angry. Probably.'), 2);
  Q('ren', 'sa_ren_took&!post', T('{眉|まゆ} が {太|ふと}い 。 …… {失礼|しつれい} 。 {思|おも}い{出|だ}す たび に 、 そこ で {止|と}まって しまう んです 。', 'Thick eyebrows. …Forgive me. Every time I remember, I get stuck on that.', 'smirk'), 2);
  Q('ren', 'sa_ren_left&!post', T('{棚|たな} に {残|のこ}した もの の こと を 、 {一日|いちにち} に {一度|いちど} は {考|かんが}えます 。 {後悔|こうかい} と は 、 {少|すこ}し {違|ちが}う {感|かん}じ です 。', 'I think about what I left on that shelf once a day. It isn\'t quite regret.', 'think'), 2);
  Q('ren', 'quest.sb_lamp>=1&!sb_lamp_lit', T('{消|き}え かけた {灯|あか}り を {見|み}る と 、 {手|て} が {勝手|かって} に {芯|しん} を {探|さが}して しまいます 。', 'When I see a lamp going out, my hands start looking for the wick on their own.'));
  R('ren', 'rest!=camp', T('{宿|やど} の {灯|あか}り 、 {芯|しん} が {少|すこ}し {長|なが}い です 。 …… {直|なお}して いい か 、 {聞|き}いて きます 。', 'The inn\'s lamp wick is a little long. …I\'ll go and ask if I may trim it.'));
  R('ren', 'rest=camp', T('{焚|た}き{火|び} は 、 {名前|なまえ} の ない {灯|あか}り です 。 {今夜|こんや} だけ の {灯|あか}り 。 {嫌|きら}い じゃ ありません 。', 'A campfire is a light with no name. A light for tonight only. I don\'t dislike it.'));
  A('ren', T('{歩|ある}いて いる と 、 {師匠|ししょう} の {言葉|ことば} を {一|ひと}つ ずつ {思|おも}い{出|だ}します 。 {道|みち} は {覚|おぼ}えて いない のに 。', 'Walking, I remember my teacher\'s words one at a time. The road, not so much.'));

  // ================================================================ Suzu
  P('suzu', 'reedwake', '!post',
    T('{葦|あし}ノ{瀬|せ} の {広場|ひろば} 、 {舞台|ぶたい} に ちょうど いい {広|ひろ}さ なの よ ね 。 {客|きゃく} が {逃|に}げ{遅|おく}れる {広|ひろ}さ 。', 'Reedwake\'s square is just the right size for a stage. The size where the audience can\'t get away in time.', 'laugh'));
  P('suzu', 'reedwake', 'post',
    T('{広場|ひろば} の {舞台|ぶたい} で 、 {次|つぎ} は {何|なに} を やろう かしら 。 …… {主役|しゅやく} は 、 もう {決|き}まってる けど ね 。', 'What shall I put on next in the square? …The lead\'s already cast, of course.', 'smile'));
  P('suzu', 'saltglass', '!ch2_done',
    T('{港|みなと} の {客|きゃく} は {厳|きび}しい の 。 {天気|てんき} の {話|はなし} に しか {拍手|はくしゅ} しない 。', 'Harbour audiences are harsh. They only clap for the weather.', 'smirk'));
  P('suzu', 'saltglass', 'ch2_done',
    T('ワタル さん の {帳簿|ちょうぼ} 、 {今|いま} は ちゃんと {合|あ}って いる かしら 。 {合|あ}って いる {帳簿|ちょうぼ} は 、 {退屈|たいくつ} で {美|うつく}しい の よ 。', 'I wonder if Wataru\'s books balance now. A balanced ledger is boring, and beautiful.'));
  P('suzu', 'archive', '',
    T('{水|みず} の {音|おと} が 、 {客席|きゃくせき} の ざわめき に {聞|き}こえる 。 …… {誰|だれ} も いない のに ね 。', 'The water sounds like an audience murmuring. …And there\'s nobody here.', 'worry'));
  P('suzu', 'cinder', '!ch3_done',
    T('{柿|かき} の {匂|にお}い 。 …… この {里|さと} の {匂|にお}い は 、 {覚|おぼ}えて いる の 。', 'The smell of persimmons. …I remember how this village smells.', 'closed'));
  P('suzu', 'cinder', 'ch3_done&quest.co_suzu=done',
    T('ヒロ の {席|せき} 、 {今年|ことし} は {名前|なまえ} が {書|か}いて ある の 。 {来年|らいねん} も 、 {再来年|さらいねん} も 。', 'Hiro\'s seat has a name on it this year. Next year too, and the year after.', 'smile'));
  P('suzu', 'cinder', 'ch3_done&!quest.co_suzu=done',
    T('{祭|まつ}り の {後|あと} の {里|さと} って 、 {好|す}き 。 {皆|みな} {少|すこ}し {疲|つか}れて 、 {少|すこ}し {優|やさ}しい 。', 'I love a village after a festival. Everyone a little tired, and a little kinder.'));
  P('suzu', 'snowbell', '!ch4_done',
    T('{雪|ゆき} は {音|おと} を {吸|す}う の 。 {台詞|せりふ} が {客席|きゃくせき} まで {届|とど}かない 。 {役者|やくしゃ} {泣|な}かせ の {村|むら} ね 。', 'Snow swallows sound. Lines never reach the back rows. A village to make actors weep.'));
  P('suzu', 'snowbell', 'ch4_done',
    T('{灯|あか}り が ともって から 、 {村|むら} の {人|ひと} の {声|こえ} が {大|おお}きく なった {気|き} が する 。 {雪|ゆき} の せい じゃ なかった の ね 。', 'Since the lamp came back, people here seem to talk louder. It wasn\'t the snow after all.', 'smile'));
  P('suzu', 'lanternfall', '!lf_bell_rung',
    T('この {町|まち} の {人|ひと} 、 {台本|だいほん} を {渡|わた}された みたい に {話|はな}す の 。 {誰|だれ} も アドリブ を {入|い}れない 。', 'People here talk as if they\'d been handed a script. Nobody ad-libs.', 'think'));
  P('suzu', 'lanternfall', 'lf_bell_rung',
    T('アドリブ だらけ の {町|まち} に なった わ 。 {台本|だいほん} {通|どお}り より 、 ずっと いい 。', 'The whole town is ad-libbing now. Much better than sticking to the script.', 'laugh'));
  P('suzu', 'sa_mount', '!sa_hush_down&!post',
    T('{最終|さいしゅう} {幕|まく} の {前|まえ} の {楽屋|がくや} って 、 こんな {感|かん}じ 。 {静|しず}か で 、 {寒|さむ}くて 、 {誰|だれ} も {冗談|じょうだん} を {言|い}わない 。 …… {私|わたし} が {言|い}う わ 。', 'This is what the dressing room feels like before the final act. Quiet, cold, and nobody joking. …I\'ll do it.'));
  P('suzu', 'sa_mount', AFTER,
    T('{幕|まく} が {下|お}りた {後|あと} の {楽屋|がくや} 。 {皆|みな} {疲|つか}れて 、 {笑|わら}ってる 。 {私|わたし} の {一番|いちばん} {好|す}き な {時間|じかん} 。', 'The dressing room after the curtain falls. Everyone worn out and laughing. My favourite time.', 'smile'));
  P('suzu', 'sa_still', '!sa_hush_down&!post',
    T('{静|しず}か すぎる {劇場|げきじょう} は 、 {客|きゃく} が {帰|かえ}った {後|あと} か 、 {誰|だれ} も {来|こ}なかった か の どちら か よ 。', 'A theatre this quiet means either the audience has gone home, or nobody came.'));
  P('suzu', 'sa_still', AFTER,
    T('{書庫|しょこ} に {音|おと} が {戻|もど}った わ 。 {紙|かみ} を めくる {音|おと} 。 {最高|さいこう} の {拍手|はくしゅ} ね 。', 'Sound has come back to the Archive. Pages turning. The best applause there is.', 'smile'));
  P('suzu', 'koharuno', '',
    T('{柿|かき} の {木|き} の {下|した} って 、 {舞台|ぶたい} に ちょうど いい の よ 。 …… {今日|きょう} は {客席|きゃくせき} で いい けど 。', 'The space under a persimmon tree makes a perfect stage. …Today I\'m happy in the audience, though.'));
  P('suzu', 'atlas', '',
    T('{台本|だいほん} の ない {道|みち} ね 。 {即興|そっきょう} は {得意|とくい} よ 。 {帰|かえ}り {道|みち} だけ は 、 ちゃんと {覚|おぼ}えて おいて ね 。', 'A road with no script. I\'m good at improvising. Just make sure you remember the way home.', 'laugh'));

  Q('suzu', 'quest.co_suzu=1', T('ヒロ が {今|いま} {何|なに} を {信|しん}じて いる か 、 {知|し}りたい 。 {知|し}る の は {怖|こわ}い けど ね 。', 'I want to know what Hiro believes now. It scares me to find out, though.', 'closed'), 2);
  Q('suzu', 'quest.co_suzu=2', T('{窯|かま} の {記録|きろく} が {戻|もど}ったら 、 {言|い}う 。 {帳簿|ちょうぼ} に も そう {書|か}いた の 。 {書|か}いた こと は 、 {守|まも}る わ 。', 'When the kiln\'s record comes back, I\'ll tell him. I wrote it in my book. What I write down, I keep.'), 2);
  Q('suzu', 'quest.co_suzu=done&!ch3_done', T('{肩|かた} は {軽|かる}い のに 、 {帳簿|ちょうぼ} は {重|おも}く なった わ 。 {祭|まつ}り {二十回|にじゅっかい} {分|ぶん} 。 {悪|わる}く ない {重|おも}さ よ 。', 'My shoulders are lighter, but the book got heavier. Twenty festivals\' worth. Not a bad weight.', 'smile'), 2);
  Q('suzu', 'quest.sb_lamp>=1&!sb_lamp_lit', T('{十年|じゅうねん} {同|おな}じ {台詞|せりふ} を {待|ま}って いる {役者|やくしゃ} みたい 。 ホシノ さん の {出番|でばん} 、 {早|はや}く {来|く}る と いい わ ね 。', 'Like an actor waiting ten years for the same cue. I hope Hoshino\'s turn comes soon.', 'think'));
  R('suzu', 'rest!=camp', T('{今日|きょう} の {帳簿|ちょうぼ} を つけたら 、 {今夜|こんや} の {幕|まく} は おしまい 。 …… {客|きゃく} が {一人|ひとり} {残|のこ}ってる けど 。', 'Once today\'s accounts are done, that\'s the curtain for tonight. …One member of the audience is still here, though.', 'smirk'));
  R('suzu', 'rest=camp', T('{焚|た}き{火|び} って 、 {一番|いちばん} {古|ふる}い {照明|しょうめい} なの よ 。 {役者|やくしゃ} の {顔|かお} が {一番|いちばん} よく {見|み}える 。', 'A campfire is the oldest stage lighting there is. It shows an actor\'s face best.'));
  A('suzu', T('{旅|たび} は {長|なが}い {芝居|しばい} みたい な もの 。 {幕間|まくあい} が {一番|いちばん} {長|なが}い けど ね 。', 'A journey is like a long play. The intervals are the longest part, mind.'));
})(RB.content.company);
