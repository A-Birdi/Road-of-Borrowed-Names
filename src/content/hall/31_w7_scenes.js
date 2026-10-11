/* The Hall of a Hundred Tales, wing 7, The House That Remembers: the scenes (expansion P15; plan 04_DUNGEONS.md D9; maps
 * in 29_w7_maps.js, tasks and encounters in 30_w7_learning.js). Each trial sets its floor's own flag and tells the
 * Hall; what a trial shows follows the level its task is set at (the profile, or one up on the Grow route); the
 * pattern (hall.w7.pat) chooses the notes on the hooks, the memo, the keepsake the letter means and the bowls the house
 * asks for. Owan they/them (and never names themself: the house leaves its own name out), Magoroku he/him. Suzu's lines
 * have Kansai versions (src/content/dialect/kansai_99_hall.js). */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const K = C.hallKit, W = 'w7', L = K.lv(W), both = L.both;
  const TALE = C.hallW7Tale, FT = C.hallW7TaleF;
  const nest = (x) => x.replace(/「/g, '『').replace(/」/g, '』');
  const LV = (fn) => [0, 1].flatMap((p) => ['F', 'E', 'I', 'A'].map((t) => fn(p, t))).join('');
  const LV3 = (fn) => [0, 1].flatMap((p) => [['EF', 0], ['E', 1], ['IA', 2]].map(([t, i]) => fn(p, t, i))).join('');
  let out = `
@scene hall.w7.f1_first
!set hall_w7_f1_seen
narr: {紙|かみ} の {戸|と} を {抜|ぬ}ける と 、 {雪|ゆき} の {降|ふ}り{始|はじ}めた {山奥|やまおく} だった 。 {霧|きり} の {中|なか} に 、 {黒|くろ}い {門|もん} が {開|ひら}いて いる 。 || Through the paper screen: deep in the mountains, the first snow falling. In the mist a black gate stands open.
?(comp=nao) comp: {配達|はいたつ} で {山|やま} を {歩|ある}く と 、 たまに こういう {門|もん} を {見|み}る 。 {二度目|にどめ} は 、 {見|み}つからない ん だ 。 || Walking the mountains on my rounds, you sometimes see a gate like this. You never find it a second time.
?(comp=mio) comp: {誰|だれ} の {家|いえ} かしら 。 {煙|けむり} は {出|で}て いる のに 、 {人|ひと} の {気配|けはい} が しない わ 。 || Whose house is it? There's smoke rising, but no sense of anyone.
?(comp=ren) comp: マヨイガ 、 です ね 。 {灯守|ひもり} の {古|ふる}い {話|はなし} に も {出|で}て きます 。 {何|なに} も {取|と}らない の が 、 {礼儀|れいぎ} だ と 。 || A mayoiga. It comes up in the lamp-keepers' old tales too. Taking nothing is the courtesy, they say.
?(comp=suzu) comp: {第|だい}{七幕|ななまく} は 、 {誰|だれ} も {出|で}て こない {芝居|しばい} ね 。 {台詞|せりふ} の ない {役|やく} が 、 {一番|いちばん} {難|むずか}しい の よ 。 || Act seven: a play where nobody comes on. The part with no lines is the hardest.
?(!comp) narr: {門|もん} の {向|む}こう で 、 {鉄瓶|てつびん} が {鳴|な}って いる 。 || Beyond the gate, an iron kettle is singing.

@scene hall.w7.f2_first
!set hall_w7_f2_seen
narr: {家|いえ} の {奥|おく} へ {続|つづ}く {廊下|ろうか} 。 どの {部屋|へや} に も 、 {今|いま} まで {誰|だれ} か が いた よう な {温|ぬく}もり が ある 。 || A corridor leading into the house. Every room is warm, as if someone had been there a moment ago.
?(comp) comp: …… {誰|だれ} も いない のに 、 {誰|だれ} か の {話|はな}し{声|ごえ} が {聞|き}こえる よう な {気|き}が する 。 || …There's nobody here, but it feels as if I can hear someone talking.

@scene hall.w7.f3_first
!set hall_w7_f3_seen
narr: {座敷|ざしき} の {向|む}こう を 、 {川|かわ} が {流|なが}れて いる 。 {膳|ぜん} が {三|みっ}つ 、 {客|きゃく} を {待|ま}って いる 。 {座敷|ざしき} の {真|ま}ん{中|なか} に 、 {知|し}らない {男|おとこ} が {立|た}って いた 。 || Beyond the parlour a stream runs by. Three trays wait for guests. In the middle of the parlour stands a man you don't know.
?(comp=nao) comp: {勝手|かって} に {入|はい}って きた {口|くち} だ な 。 {人|ひと} の こと は {言|い}えない が 。 || He's let himself in. Not that we can talk.
?(comp=mio) comp: あの {人|ひと} 、 {顔色|かおいろ} が {悪|わる}い わ 。 {何日|なんにち} も {食|た}べて いない みたい 。 || That man looks pale. As if he hasn't eaten in days.
?(comp=ren) comp: {何|なに} か を {探|さが}して いる {目|め} です 。 …… {探|さが}す {人|ひと} に は 、 {見|み}つからない {家|いえ} の はず なのに 。 || Those are searching eyes. …And this is meant to be a house no searcher finds.
?(comp=suzu) comp: {出|で}た ！ {欲張|よくば}り な {隣|となり} の {人|ひと} 。 この {役|やく} 、 {昔話|むかしばなし} で は {大抵|たいてい} {損|そん} を する の よ ね 。 || There he is! The greedy neighbour. In the old tales, that part usually comes off worst.

@scene hall.w7.bench1
!hook hall_station w7_b1

@scene hall.w7.bench2
!hook hall_station w7_b2

@scene hall.w7.bench3
!hook hall_station w7_b3

@scene hall.w7.spring
narr: {中庭|なかにわ} の {井戸|いど} 。 {水|みず} が 、 {雪|ゆき} の {光|ひかり} を {映|うつ}して いる 。 || The courtyard well. The water holds the light of the snow.
!hook hall_station w7_sp

@scene hall.w7.owan
!faceplayer hall_owan
!if hall.w7.t2 -> done
hall_owan: いらっしゃい 。 この {家|いえ} の {椀|わん} だ よ 。 {昔|むかし} の {人|ひと} が {置|お}いて いった {物|もの} が 、 {片付|かたづ}かない の 。 {札|ふだ} の {下|した} に 、 {掛|か}けて あげて 。 || Welcome. (I'm) this house's bowl. The things people left behind long ago never got put away. Hang each one under its note.
?(comp) comp: {札|ふだ} に は 、 {何|なに} の こと か 、 {書|か}いて ない ね 。 {読|よ}めば {分|わ}かる の かな 。 || The notes don't say what they mean. I suppose you can tell by reading them.
!end
:done
hall_owan: {全部|ぜんぶ} 、 {元|もと} の {所|ところ} 。 {家|いえ} が 、 {少|すこ}し {思|おも}い{出|だ}した みたい 。 || All back where they belong. The house seems to remember a little.

@scene hall.w7.owan2
!faceplayer hall_owan2
hall_owan: {台所|だいどころ} の {覚|おぼ}え{書|が}き は 、 おばあさん の {字|じ} 。 {蔵|くら} の {手紙|てがみ} は 、 お{父|とう}さん の 。 {二人|ふたり} と も 、 {大事|だいじ} な こと ほど {書|か}かない {人|ひと} だった 。 || The kitchen memo is in the grandmother's hand; the letter in the storehouse, the father's. Both of them left out the things that mattered most.
`;

  // ---- t1: the story room ----------------------------------------------------------------------------------------------
  const E_PANELS = [TALE.P1, TALE.P2, TALE.P3, TALE.P4].map(nest);
  const F_PANELS = FT.map(nest);
  const PANEL_EN = ['Long ago, deep in the mountains of Tōno, a girl lost her way.', 'There was a great house with a black gate, but nobody was there.', 'In the parlour red trays and black bowls were laid out, and water was boiling in an iron kettle.', 'The girl took nothing and went home. Then a red bowl came floating down the river.'];
  out += '\n@scene hall.w7.t1' + K.taskTrial({ w: W, k: 0, t: 't1',
    intro: ['narr: {脇|わき} の {部屋|へや} の {床|とこ} の {間|ま} に 、 {絵巻|えまき} が {掛|か}けて ある 。 || A picture scroll hangs in the alcove of the side room.']
      .concat(...[0, 1, 2, 3].map((i) => ['?(' + L.EF + ') narr: 「 ' + F_PANELS[i] + ' 。 」 || "' + PANEL_EN[i] + '"', '?(' + L.NOTF + ') narr: 「 ' + E_PANELS[i] + ' 。 」 || "' + PANEL_EN[i] + '"']),
      ['narr: {障子|しょうじ} の {隙間|すきま} から {雪|ゆき} が {吹|ふ}き{込|こ}んで 、 {絵|え} の {順番|じゅんばん} が {乱|みだ}れた 。 || Snow blows in through a gap in the paper door, and the pictures slip out of order.']),
    task: 'hall.w7.story',
    after: ['narr: {絵巻|えまき} が 、 {元|もと} の {順番|じゅんばん} に {戻|もど}った 。 || The scroll is back in its order.', '!challenge hall.w7.story_q',
      '?(comp=nao) comp: {何|なに} も {取|と}らず に {帰|かえ}った {人|ひと} の ところ へ 、 {向|む}こう から {届|とど}いた 。 {一番|いちばん} {確|たし}か な {配達|はいたつ} だ な 。 || It reached the one who took nothing, all on its own. The surest delivery there is.',
      '?(comp=mio) comp: {誰|だれ} が {椀|わん} を {流|なが}した の か 、 {話|はなし} は {言|い}わない のね 。 {言|い}わなくて も 、 {分|わ}かる けど 。 || The tale never says who sent the bowl down the river. Not that it needs to.',
      '?(comp=ren) comp: {欲|ほ}しがらない {人|ひと} に だけ 、 {家|いえ} は {与|あた}える 。 {灯|ひ} も 、 {少|すこ}し {似|に}て います 。 || The house gives only to those who don\'t grasp. Light is a little like that.',
      '?(comp=suzu) comp: {一番|いちばん} {大事|だいじ} な {人|ひと} が 、 {一度|いちど} も {出|で}て こない {話|はなし} 。 {粋|いき} だ わ 。 || A tale where the most important one never once comes on stage. Very stylish.'],
    later: 'narr: {絵|え} は 、 {後|あと} で {並|なら}べ{直|なお}せる 。 || You can put the pictures in order later.',
    done: 'narr: {絵巻|えまき} は 、 {元|もと} の {順番|じゅんばん} で {掛|か}かって いる 。 || The scroll hangs in its proper order.' });

  // ---- t2: the things left behind, each hung under the note that means it --------------------------------------------------
  const ITEM = { umbrella: ['{傘|かさ}', 'the umbrella'], jacket: ['{羽織|はおり}', 'the padded jacket'], lantern: ['{提灯|ちょうちん}', 'the paper lantern'], book: ['{本|ほん}', 'the book'], teacup: ['{湯呑|ゆの}み', 'the teacup'] };
  const NOTE = {
    umbrella: ['あめ が やんだ から 、 もう いらない 。', '{雨|あめ} が やんだ から 、 もう {要|い}らない 。 {置|お}いて いきます 。', 'やんだ ので 、 もう {要|い}りません 。 {次|つぎ} に {降|ふ}られた {方|かた} が 、 お{使|つか}い ください 。', 'It\'s stopped raining, so I don\'t need it any more.'],
    jacket: ['さむかったら 、 きて ね 。', '{寒|さむ}かったら 、 {着|き}て ね 。 {返|かえ}さなくて いい から 。', '{冷|ひ}える {晩|ばん} は 、 {肩|かた} に かけて お{行|い}き 。 {返|かえ}す に は {及|およ}ばない よ 。', 'If you\'re cold, put it on.'],
    lantern: ['くらく なったら 、 つかって ね 。', '{暗|くら}く なったら 、 {使|つか}って ね 。', '{足元|あしもと} が {見|み}えなく なったら 、 {灯|とも}して お{行|い}き 。', 'Once it\'s dark, use it.'],
    book: ['よみおわった から 、 かえします 。', '{読|よ}み{終|お}わった から 、 {返|かえ}します 。', '{最後|さいご} まで {読|よ}みました ので 、 お{返|かえ}し します 。 {続|つづ}き が あれば 、 また {貸|か}して ください 。', 'I\'ve finished reading it, so I\'m giving it back.'],
    teacup: ['のみおわったら 、 あらって 、 ここ に おいて ね 。', '{飲|の}み{終|お}わったら 、 {洗|あら}って 、 ここ に {置|お}いて ね 。', '{冷|さ}めない うち に どうぞ 。 {済|す}んだら 、 {洗|あら}って {伏|ふ}せて おいて ください 。', 'When you\'ve finished drinking, wash it and leave it here.'],
  };
  const HOOKN = { 0: { h1: 'book', h2: 'umbrella', h3: 'lantern', h4: 'jacket' }, 1: { h1: 'lantern', h2: 'teacup', h3: 'jacket', h4: 'book' } };
  const HOLDI = (i) => 'xp_hall_w7_f0_hold_' + i, HUNG = (i) => 'xp_hall_w7_f0_hung_' + i, HOOKED = (h) => 'xp_hall_w7_f0_hook_' + h;
  const HOOKS = ['h1', 'h2', 'h3', 'h4'];
  for (const i of Object.keys(ITEM)) out += `
@scene hall.w7.i_${i}
!unset ${Object.keys(ITEM).map(HOLDI).join(' ')}
!set ${HOLDI(i)}
narr: {床|ゆか} の 「 ${ITEM[i][0]} 」 を {拾|ひろ}った 。 || You pick up ${ITEM[i][1]} from the boards.
`;
  for (const h of HOOKS) {
    out += `
@scene hall.w7.${h}
narr: {鉤|かぎ} の {下|した} に 、 {古|ふる}い {書|か}き{付|つ}け 。 || Under a hook, an old note.
`;
    out += LV3((p, t, i) => `?(${both(L[t], 'hall.w7.pat=' + p)}) narr: 「 ${NOTE[HOOKN[p][h]][i]} 」 || "${NOTE[HOOKN[p][h]][3]}"\n`);
    out += `!if ${HOOKED(h)} -> done
!if ${Object.keys(ITEM).map(HOLDI).join('|')} -> try
!end
:try
!if hall.w7.pat=1 -> p1
!if ${HOLDI(HOOKN[0][h])} -> right0
!goto wrong
:p1
!if ${HOLDI(HOOKN[1][h])} -> right1
:wrong
narr: {掛|か}けよう と して 、 {手|て} を {止|と}めた 。 この {書|か}き{付|つ}け が {言|い}って いる の は 、 これ で は ない よう だ 。 || You go to hang it, and stop. This note doesn't seem to mean that.
!end
`;
    for (const p of [0, 1]) out += `:right${p}
narr: 「 ${ITEM[HOOKN[p][h]][0]} 」 を {鉤|かぎ} に {掛|か}けた 。 || You hang ${ITEM[HOOKN[p][h]][1]} on the hook.
!unset ${Object.keys(ITEM).map(HOLDI).join(' ')}
!set ${HUNG(HOOKN[p][h])} ${HOOKED(h)}
!goto check
`;
    out += `:check
!if ${HOOKS.map(HOOKED).join('&')} -> all
!refresh
!end
:all
narr: {忘|わす}れ{物|もの} が 、 {全部|ぜんぶ} {元|もと} の {鉤|かぎ} に {戻|もど}った 。 || Everything left behind is back on its hook.
?(comp) comp: {何|なに} の こと か {書|か}いて ない のに 、 {読|よ}めば {分|わ}かる 。 {書|か}いた {人|ひと} も 、 {分|わ}かる と {思|おも}って {書|か}いた ん だ ね 。 || None of them says what it means, and yet you can tell. Whoever wrote them trusted the reader to know.
${K.mark(W, 0, 't2')}
!end
:done
?(hall.w7.pat=0) narr: 「 ${ITEM[HOOKN[0][h]][0]} 」 が 、 {鉤|かぎ} に {掛|か}かって いる 。 || ${ITEM[HOOKN[0][h]][1][0].toUpperCase() + ITEM[HOOKN[0][h]][1].slice(1)} hangs on the hook.
?(hall.w7.pat=1) narr: 「 ${ITEM[HOOKN[1][h]][0]} 」 が 、 {鉤|かぎ} に {掛|か}かって いる 。 || ${ITEM[HOOKN[1][h]][1][0].toUpperCase() + ITEM[HOOKN[1][h]][1].slice(1)} hangs on the hook.
`;
  }

  // ---- t3: the garden stones ------------------------------------------------------------------------------------------------
  const CE = {
    0: { F: ['(Showing the book in your hand) This is my book.', '(Pointing at what the other person holds) What is that?', '(Showing the umbrella in your hand) That over there is my umbrella.', '(Pointing far off) There is a house over there.'],
      E: ['The red one, please.', 'The one I bought yesterday is this.', 'The quiet-no one (no な) is best.', 'This umbrella is mine.'],
      I: ['That thing from yesterday: how did it go?', 'I met a friend at the station. That person (whom you don\'t know) is a doctor.', 'I found an old bookshop in town. That shop (we both know) is cheap.', '(In a letter) Here it\'s snowing. How is it there?'],
      A: ['Have you thought about that matter (you know the one)?', 'There\'s a comb and a flute. The former was Grandmother\'s.', 'You asked someone you\'d just met, "Did you bring the thing (you know the one)?"', 'I have an elder brother and an elder sister. The latter is a doctor.'] },
    1: { F: ['(Pointing at the bread in the shopkeeper\'s hand) That one, please.', '(In your own room) This is my room.', '(Pointing at shoes far away) Whose shoes are these?', '(Looking far off) That mountain is high.'],
      E: ['The big one or the small one: which?', 'Where\'s the one from earlier?', 'Take the one you like.', 'I threw out the old-na one (with a needless な).'],
      I: ['A: The key? B: On the desk.', 'That inn we went to last year: I\'d like to go there again.', 'I met someone called Tanaka yesterday. That person (we both know) is fun.', '(On the phone) What time will you get there?'],
      A: ['Have you heard about that (you know what)?', 'There\'s a train and a bus. The latter is cheaper.', 'I keep a dog and a cat. The former barks a lot.', 'There\'s one book. The former is old.'] },
  };
  out += '\n@scene hall.w7.t3' + K.taskTrial({ w: W, k: 0, t: 't3',
    intro: ['narr: {庭|にわ} の {石|いし} に 、 {四|よっ}つ の {言葉|ことば} が {刻|きざ}んで ある 。 {一番|いちばん} {奥|おく} の {石|いし} に は 、 「 {一|ひと}つ だけ が {間違|まちが}って いる 。 」 と ある 。 || Four sayings are carved on the garden stones. The stone at the back says: "One alone is wrong."'],
    task: { 0: 'hall.w7.counter0', 1: 'hall.w7.counter1' },
    after: ['narr: {間違|まちが}った {言葉|ことば} の {上|うえ} に 、 {雪|ゆき} が {積|つ}もって {消|け}した 。 || Snow settles on the wrong saying until it is gone.', '?(comp) comp: 「 あれ 」 も 「 それ 」 も 、 {相手|あいて} が {何|なに} を {知|し}って いる か で {決|き}まる ん だ ね 。 || Are or sore: which one you say depends on what the other person knows.'],
    later: 'narr: {言葉|ことば} を {一|ひと}つ ずつ {読|よ}んで から 、 また {来|こ}よう 。 || Read the sayings one by one, then come back.',
    done: 'narr: {石|いし} の {字|じ} は 、 もう {何|なに} も {問|と}わない 。 || The carving asks nothing more.' });
  for (let i = 0; i < 4; i++) {
    out += `\n@scene hall.w7.card${i + 1}\nnarr: {苔|こけ} むした {庭|にわ} の {石|いし} 。 {言葉|ことば} が {刻|きざ}んで ある 。 || A mossy garden stone, carved with a saying.\n`;
    out += LV((p, t) => `?(${both(L[t], 'hall.w7.pat=' + p)}) narr: 「 ${nest(C.hallW7Cards[p][t][i][0])} 」 || "${CE[p][t][i]}"\n`);
  }

  // ---- t4: the kitchen memo that names nothing ---------------------------------------------------------------------------------
  const STEPS = { 0: ['kettle', 'hearth', 'teapot', 'tray'], 1: ['shutters', 'lamp', 'brazier', 'door'] };
  const MEMO = {
    0: { F: 'ひ に かけて 、 わいたら よわめて 、 そそいで 、 だして 。', E: '{火|ひ} に かけて 、 {沸|わ}いたら {弱|よわ}めて 。 それから {注|そそ}いで 、 {出|だ}して 。', I: '{火|ひ} に かけて おいて 。 {沸|わ}いたら {弱|よわ}めて 、 {冷|さ}めない うち に {注|そそ}いで 、 お{客|きゃく} さん に {出|だ}して 。', A: '{火|ひ} に かけ 、 {沸|わ}き{次第|しだい} {弱|よわ}め 、 {冷|さ}めぬ うち に {注|そそ}いで お{出|だ}し する こと 。', en: 'Put (it) on the fire; when (it) boils, turn (it) down; then pour (it), and serve (it).' },
    1: { F: 'くらく なる まえ に しめて 、 つけて 、 ひえて きたら たして 、 さいご に かけて 。', E: '{暗|くら}く なる {前|まえ} に {閉|し}めて 。 それから {点|つ}けて 、 {冷|ひ}えて きたら {足|た}して 。 {最後|さいご} に {掛|か}けて 。', I: '{日|ひ} が {暮|く}れる {前|まえ} に {閉|し}めて おいて 。 {点|つ}けたら 、 {冷|ひ}えて きた とき に {足|た}して 、 {寝|ね}る {前|まえ} に {掛|か}けて 。', A: '{日暮|ひぐ}れ {前|まえ} に {閉|し}め 、 {点|つ}け 、 {冷|ひ}え{込|こ}み {次第|しだい} {足|た}し 、 {就寝|しゅうしん} {前|まえ} に {掛|か}ける こと 。', en: 'Before dark, shut (them); then light (it); when it turns cold, add (some); last thing, bolt (it).' },
  };
  const THING = { kettle: ['{鉄瓶|てつびん}', 'the iron kettle', '{鉄瓶|てつびん} を {火|ひ} に かけた 。', 'You put the iron kettle on the fire.'],
    hearth: ['{囲炉裏|いろり}', 'the hearth', '{湯|ゆ} が {沸|わ}いた 。 {火|ひ} を {弱|よわ}めた 。', 'The water boils. You turn the fire down.'],
    teapot: ['{急須|きゅうす}', 'the teapot', '{急須|きゅうす} に {湯|ゆ} を {注|そそ}いだ 。', 'You pour the water into the teapot.'],
    tray: ['お{盆|ぼん}', 'the tray', 'お{茶|ちゃ} を お{盆|ぼん} に {載|の}せて 、 {客間|きゃくま} に {出|だ}した 。', 'You set the tea on the tray and take it through to the guest room.'],
    shutters: ['{雨戸|あまど}', 'the storm shutters', '{雨戸|あまど} を {閉|し}めた 。', 'You slide the storm shutters shut.'],
    lamp: ['{行灯|あんどん}', 'the lamp', '{行灯|あんどん} に {火|ひ} を {点|つ}けた 。', 'You light the lamp.'],
    brazier: ['{火鉢|ひばち}', 'the brazier', '{火鉢|ひばち} に {炭|すみ} を {足|た}した 。', 'You add charcoal to the brazier.'],
    door: ['{勝手口|かってぐち}', 'the back door', '{勝手口|かってぐち} に {閂|かんぬき} を {掛|か}けた 。', 'You slide the bolt across the back door.'] };
  const DID = (c) => 'xp_hall_w7_f1_did_' + c;
  const ALLDONE = [0, 1].map((p) => 'hall.w7.pat=' + p + '&' + STEPS[p].map(DID).join('&')).join('|');
  out += `
@scene hall.w7.memo
!set xp_hall_w7_f1_memo
narr: {台所|だいどころ} の {柱|はしら} の {覚|おぼ}え{書|が}き 。 おばあさん の {字|じ} だ 。 {何|なに} を する の か 、 {物|もの} の {名前|なまえ} が {一|ひと}つ も {書|か}いて ない 。 || A memo on the kitchen post, in the grandmother's hand. It says what to do, but never names a single thing.
`;
  out += LV((p, t) => `?(${both(L[t], 'hall.w7.pat=' + p)}) narr: 「 ${MEMO[p][t]} 」 || "${MEMO[p].en}"\n`);
  for (const c of Object.keys(THING)) {
    out += `
@scene hall.w7.c_${c}
narr: ${THING[c][0]} 。 || ${THING[c][1][0].toUpperCase() + THING[c][1].slice(1)}.
!if !xp_hall_w7_f1_memo -> unread
!if ${DID(c)} -> did
!if hall.w7.pat=1 -> p1
`;
    for (const p of [0, 1]) {
      const idx = STEPS[p].indexOf(c);
      out += (p === 1 ? ':p1\n' : '') + (idx < 0 ? '!goto none\n' : (idx > 0 ? `!if !${DID(STEPS[p][idx - 1])} -> early\n` : '') + '!goto do\n');
    }
    out += `:do
narr: ${THING[c][2]} || ${THING[c][3]}
!set ${DID(c)}
!if ${ALLDONE} -> all
!refresh
!end
:all
narr: {覚|おぼ}え{書|が}き の {通|とお}り に 、 {全部|ぜんぶ} {済|す}んだ 。 {台所|だいどころ} が 、 {満足|まんぞく} そう に {静|しず}か に なった 。 || Everything on the memo is done, in its order. The kitchen goes quiet, as if satisfied.
?(comp) comp: {何|なに} を 、 と は {一言|ひとこと} も {書|か}いて ない のに 、 {台所|だいどころ} に {立|た}つ と {分|わ}かる 。 {毎日|まいにち} の こと だ から だ ね 。 || It never once says what, and yet standing in the kitchen you know. Because it's the same every day.
${K.mark(W, 1, 't4')}
!end
:early
narr: {待|ま}って 。 {覚|おぼ}え{書|が}き の {順番|じゅんばん} で は 、 これ は まだ {先|さき} だ 。 || Wait. By the memo's order, that comes later.
!end
:none
narr: {覚|おぼ}え{書|が}き に は 、 これ の こと は {書|か}いて ない よう だ 。 || The memo doesn't seem to mean this.
!end
:unread
narr: {台所|だいどころ} の {柱|はしら} に 、 {覚|おぼ}え{書|が}き が {貼|は}って ある 。 {先|さき} に {読|よ}もう 。 || There's a memo pinned to the kitchen post. Read it first.
!end
:did
narr: これ は もう {済|す}んだ 。 || That's done already.
`;
  }

  // ---- t5: the lantern in the dark room -----------------------------------------------------------------------------------------
  out += `
@scene hall.w7.t5
narr: {暗|くら}い {部屋|へや} に 、 {提灯|ちょうちん} の {明|あ}かり が {静|しず}か に {灯|とも}った 。 || In the dark room, the lantern's light settles, steady.
${K.mark(W, 1, 't5')}
`;

  // ---- t6: the letter in the storehouse and the keepsake it means (in your companion's hands; alone, Owan reads it) --------
  const TOLD = {
    0: { F: 'くし と ふえ が 、 くら に しまって ある 。 くし の ほう を 、 ぶつだん に おいて ほしい 。', E: '{櫛|くし} と {笛|ふえ} が 、 {蔵|くら} に しまって ある 。 {櫛|くし} の {方|ほう} を 、 {仏壇|ぶつだん} に {供|そな}えて ほしい 。', I: '{櫛|くし} と {笛|ふえ} が {蔵|くら} に しまって ある 。 {先|さき} に {書|か}いた {方|ほう} を 、 {仏壇|ぶつだん} に {供|そな}えて ほしい 。', A: '{櫛|くし} と {笛|ふえ} は {蔵|くら} に {納|おさ}めて ある 。 {前者|ぜんしゃ} を {仏壇|ぶつだん} に {供|そな}えて ほしい 。', en: 'A comb and a flute are put away in the storehouse; one of them is to go before the family altar.' },
    1: { F: 'ふえ と くし が 、 くら に しまって ある 。 ふえ の ほう を 、 ぶつだん に おいて ほしい 。', E: '{笛|ふえ} と {櫛|くし} が 、 {蔵|くら} に しまって ある 。 {笛|ふえ} の {方|ほう} を 、 {仏壇|ぶつだん} に {供|そな}えて ほしい 。', I: '{笛|ふえ} と {櫛|くし} が {蔵|くら} に しまって ある 。 {先|さき} に {書|か}いた {方|ほう} を 、 {仏壇|ぶつだん} に {供|そな}えて ほしい 。', A: '{笛|ふえ} と {櫛|くし} は {蔵|くら} に {納|おさ}めて ある 。 {前者|ぜんしゃ} を {仏壇|ぶつだん} に {供|そな}えて ほしい 。', en: 'A flute and a comb are put away in the storehouse; one of them is to go before the family altar.' },
  };
  out += `
@scene hall.w7.t6
!if hall.w7.t6 -> done
!if xp_hall_w7_f1_asked -> told
narr: {蔵|くら} の {机|つくえ} に 、 お{父|とう}さん の {手紙|てがみ} 。 {大事|だいじ} な {所|ところ} が 、 {湿気|しっけ} で {滲|にじ}んで いる 。 || On the storehouse desk lies the father's letter. The part that matters has run in the damp.
?(comp=nao) comp: {滲|にじ}んだ {手紙|てがみ} なら 、 {任|まか}せて くれ 。 {何|なに} が {知|し}りたい ？ || Leave a smudged letter to me. What do you want to know?
?(comp=mio) comp: {私|わたし} が {読|よ}む わ 。 {古|ふる}い {帳面|ちょうめん} は 、 {慣|な}れて いる の 。 {何|なに} を {調|しら}べる ？ || I'll read it. I'm used to old notebooks. What are we looking for?
?(comp=ren) comp: {私|わたし} が {読|よ}みましょう 。 {何|なに} を {知|し}りたい です か ？ || I'll read it. What would you like to know?
?(comp=suzu) comp: {古|ふる}い {手紙|てがみ} は 、 {役|やく} の {下調|したしら}べ で {何度|なんど} も {読|よ}んだ わ 。 {任|まか}せて 。 {何|なに} を {探|さが}す ？ || I've read plenty of old letters preparing for parts. Leave it to me. What am I looking for?
?(!comp) hall_owan: {読|よ}んで あげる 。 この {家|いえ} の {手紙|てがみ} だ から 。 {何|なに} が {知|し}りたい ？ || I'll read it for you. It's this house's letter. What do you want to know?
!hook hall_challenge hall.w7.ask
!if var._res=0 -> later
!set xp_hall_w7_f1_asked
:told
`;
  out += LV((p, t) => `?(${both(L[t], 'hall.w7.pat=' + p)}) narr: 「 ${TOLD[p][t]} 」 || "${TOLD[p].en}"\n`);
  out += `!end
:later
narr: {手紙|てがみ} を {机|つくえ} に {戻|もど}した 。 || You put the letter back on the desk.
!end
:done
narr: {手紙|てがみ} は 、 {机|つくえ} の {上|うえ} で {畳|たた}まれて いる 。 || The letter lies folded on the desk.
`;
  const KEEP = { comb: ['{櫛|くし}', 'the comb', 0], flute: ['{笛|ふえ}', 'the flute', 1], mirror: ['{手鏡|てかがみ}', 'the hand mirror', -1] };
  for (const g of Object.keys(KEEP)) {
    out += `
@scene hall.w7.m_${g}
!if hall.w7.t6 -> done
narr: ${KEEP[g][0]} 。 || ${KEEP[g][1][0].toUpperCase() + KEEP[g][1].slice(1)}.
!if !xp_hall_w7_f1_asked -> unknown
${KEEP[g][2] >= 0 ? '!if hall.w7.pat=' + KEEP[g][2] + ' -> right\n' : ''}narr: {手紙|てがみ} が {言|い}って いる の は 、 これ で は ない よう だ 。 || The letter doesn't seem to mean this one.
?(comp) comp: {手紙|てがみ} の {言葉|ことば} 、 もう {一度|いちど} {言|い}おう か ？ || Shall I say what the letter said again?
!end
${KEEP[g][2] >= 0 ? `:right
narr: ${KEEP[g][0]} を 、 {仏壇|ぶつだん} の {前|まえ} に そっと {供|そな}えた 。 || You set ${KEEP[g][1]} gently before the family altar.
?(comp) comp: {名前|なまえ} を {書|か}かなくて も 、 {家族|かぞく} に は {分|わ}かった ん だ ね 。 {分|わ}かる {人|ひと} に {向|む}けて {書|か}いた {手紙|てがみ} だ 。 || Even without naming it, the family would have known. It was written for someone who would understand.
${K.mark(W, 1, 't6')}
!end
` : ''}:unknown
narr: {手紙|てがみ} が どれ の こと を {言|い}って いる の か 、 まだ {分|わ}からない 。 {先|さき} に {読|よ}んで もらおう 。 || You don't know yet which one the letter means. Have it read first.
!end
:done
narr: ${KEEP[g][0]} 。 {蔵|くら} の {中|なか} は 、 {静|しず}か だ 。 || ${KEEP[g][1][0].toUpperCase() + KEEP[g][1].slice(1)}. The storehouse is quiet.
`;
  }

  // ---- t7: the riddle stone ----------------------------------------------------------------------------------------------------
  out += '\n@scene hall.w7.t7' + K.taskTrial({ w: W, k: 1, t: 't7',
    intro: ['narr: {苔|こけ} むした {石|いし} に 、 {字|じ} が {彫|ほ}って ある 。 「 {解|と}けた {者|もの} は 、 {一度|いちど} だけ 、 {帰|かえ}って また {来|く}る こと が できる 。 」 || Words cut into a mossy stone: "Whoever solves this may once go home and come back."'],
    task: 'hall.w7.riddle',
    after: ['narr: {石|いし} の {字|じ} の {上|うえ} で 、 {雪|ゆき} が {光|ひか}った 。 || The snow glints on the carving.'],
    later: 'narr: {答|こた}え は 、 {急|いそ}がなくて いい 。 || There\'s no hurry for the answer.',
    done: 'narr: {石|いし} は 、 {答|こた}え を {覚|おぼ}えて いる 。 || The stone remembers the answer.' });

  // ---- t8: the bowls by the stream, fetched as the house asks for "the one" ----------------------------------------------------
  const BOWL = { rl: ['{大|おお}きな {赤|あか}い {椀|わん}', 'a big red bowl'], rs: ['{小|ちい}さな {赤|あか}い {椀|わん}', 'a small red bowl'], bl: ['{大|おお}きな {黒|くろ}い {椀|わん}', 'a big black bowl'], bs: ['{小|ちい}さな {黒|くろ}い {椀|わん}', 'a small black bowl'] };
  const REQ = {
    0: [['rl', 'おおきくて あかい の を とって 。', '{大|おお}きくて {赤|あか}い の を {取|と}って 。', '{赤|あか}い の を {取|と}って 。 {大|おお}きい {方|ほう} ね 。', 'Fetch the big red one.'],
      ['rs', 'おなじ いろ の 、 ちいさい の を とって 。', '{同|おな}じ {色|いろ} の 、 {小|ちい}さい の を {取|と}って 。', 'さっき の と {同|おな}じ {色|いろ} で 、 もっと {小|ちい}さい の を 。', 'Now the small one, the same colour.'],
      ['bl', 'さっき と ちがう いろ の 、 おおきい の を とって 。', 'さっき と {違|ちが}う {色|いろ} の 、 {大|おお}きい の を {取|と}って 。', '{今度|こんど} は 、 {最初|さいしょ} の と {大|おお}きさ が {同|おな}じ で 、 {色|いろ} が {違|ちが}う の を 。', 'Now the big one of the other colour.']],
    1: [['bs', 'ちいさくて くろい の を とって 。', '{小|ちい}さくて {黒|くろ}い の を {取|と}って 。', '{黒|くろ}い の を {取|と}って 。 {小|ちい}さい {方|ほう} ね 。', 'Fetch the small black one.'],
      ['rs', 'おなじ おおきさ の 、 あかい の を とって 。', '{同|おな}じ {大|おお}きさ の 、 {赤|あか}い の を {取|と}って 。', 'さっき の と {大|おお}きさ が {同|おな}じ で 、 {色|いろ} が {違|ちが}う の を 。', 'Now the red one, the same size.'],
      ['bl', 'さいしょ と おなじ いろ の 、 おおきい の を とって 。', '{最初|さいしょ} と {同|おな}じ {色|いろ} の 、 {大|おお}きい の を {取|と}って 。', '{最後|さいご} は 、 {一番|いちばん} {初|はじ}め の と {同|おな}じ {色|いろ} で 、 {大|おお}きい の を 。', 'Last, the big one, the colour of the first.']],
  };
  const GOT = (b) => 'xp_hall_w7_f2_got_' + b;
  const STEP = (p, k) => (k === 0 ? '!' + GOT(REQ[p][0][0]) : GOT(REQ[p][k - 1][0]) + '&!' + GOT(REQ[p][k][0]));
  const ASKS = [0, 1].flatMap((p) => [0, 1, 2].flatMap((k) => [['EF', 1], ['E', 2], ['IA', 3]].map(([t, i]) => `?(${both(L[t], 'hall.w7.pat=' + p + '&' + STEP(p, k))}) hall_owan: 「 ${REQ[p][k][i]} 」 || "${REQ[p][k][4]}"\n`))).join('');
  const ALLGOT = [0, 1].map((p) => 'hall.w7.pat=' + p + '&' + REQ[p].map((r) => GOT(r[0])).join('&')).join('|');
  out += `
@scene hall.w7.owan3
!faceplayer hall_owan3
!if hall.w7.t8 -> done
hall_owan: {川辺|かわべ} の {椀|わん} を 、 {言|い}う {順|じゅん} に {取|と}って きて ほしい の 。 || Fetch me the bowls by the stream, in the order I ask.
${ASKS}!end
:done
hall_owan: {三|みっ}つ と も 、 {揃|そろ}った 。 {家族|かぞく} の {分|ぶん} 。 || All three, together. One for each of the family.
`;
  for (const b of Object.keys(BOWL)) {
    const conds = [0, 1].map((p) => { const k = REQ[p].findIndex((r) => r[0] === b); return k < 0 ? null : 'hall.w7.pat=' + p + '&' + STEP(p, k); }).filter(Boolean);
    out += `
@scene hall.w7.b_${b}
narr: ${BOWL[b][0]} 。 || ${BOWL[b][1][0].toUpperCase() + BOWL[b][1].slice(1)}.
${conds.length ? '!if ' + conds.join('|') + ' -> take\n' : ''}hall_owan: その {椀|わん} じゃ ない よ 。 もう {一度|いちど} {言|い}う ね 。 || Not that one. I'll say it again.
${ASKS}!end
:take
narr: ${BOWL[b][0]} を {拾|ひろ}い{上|あ}げた 。 || You pick up ${BOWL[b][1]}.
!set ${GOT(b)}
!if ${ALLGOT} -> all
${ASKS}!refresh
!end
:all
narr: オワン が 、 {三|みっ}つ の {椀|わん} を {膳|ぜん} に {並|なら}べた 。 「 それ で 、 {全部|ぜんぶ} 。 」 || Owan sets the three bowls on a tray. "That's all of them."
?(comp) comp: 「 {赤|あか}い の 」 「 さっき の 」 。 {名前|なまえ} を {言|い}わなくて も 、 {話|はなし} の {流|なが}れ で {分|わ}かる ね 。 || "The red one", "the one from before": no names needed, the conversation carries it.
${K.mark(W, 2, 't8')}
!end
`;
  }

  // ---- t9: Magoroku and Owan --------------------------------------------------------------------------------------------------------
  out += `
@scene hall.w7.t9
!faceplayer hall_magoroku
!if hall.w7.t9 -> after
hall_magoroku: この {家|いえ} の {物|もの} を 、 {一|ひと}つ {持|も}って {帰|かえ}る 。 {文句|もんく} は {言|い}わせない 。 || I'm taking one thing from this house home with me. Nobody's going to stop me.
!encounter hall.w7.greed
!if var._enc=asked -> asked
narr: {開|ひら}いた {障子|しょうじ} から 、 {雪|ゆき} が {吹|ふ}き{込|こ}んで くる 。 マゴロク は 、 {行|い}く {所|ところ} も なく 、 また {戻|もど}って くる だろう 。 || Snow blows in through the open door. Magoroku has nowhere else to go; he will be back.
!end
:asked
hall_owan: …… {分|わ}かった 。 {頼|たの}まれた なら 、 {考|かんが}える 。 || …All right. Since I've been asked, I'll think about it.
${K.mark(W, 2, 't9')}
!end
:after
hall_magoroku: {頼|たの}んで みた 。 …… {後|あと} は 、 {待|ま}つ だけ だ 。 || I've asked. …Now I just wait.
`;

  // ---- t10: leaving the house ---------------------------------------------------------------------------------------------------
  out += `
@scene hall.w7.t10
!if hall.w7.t10 -> after
!if !hall.w7.t8 -> wait
!if !hall.w7.t9 -> wait
narr: {川辺|かわべ} の {小|ちい}さな {門|もん} 。 ここ から 、 {家|いえ} を {出|で}る 。 || The little gate by the stream. This is the way out of the house.
!encounter hall.w7.leave
!if var._res=0 -> later
!set xp_hall_w7_f2_t10
!hook hall_trial w7 t10
!if var._res=1 -> finale
!refresh
!end
:finale
!call hall.w7.end
!end
:wait
narr: {家|いえ} は 、 まだ {何|なに} か を {待|ま}って いる よう だ 。 || The house still seems to be waiting for something.
?(!hall.w7.t8) narr: {川辺|かわべ} の {椀|わん} が 、 まだ {揃|そろ}って いない 。 || The bowls by the stream aren't gathered yet.
?(!hall.w7.t9) narr: {座敷|ざしき} で 、 マゴロク が {金|きん} の {盃|さかずき} を {握|にぎ}って いる 。 || In the parlour, Magoroku is clutching a gold sake cup.
!end
:later
narr: オワン が 、 {門|もん} の {側|そば} で {待|ま}って いる 。 || Owan waits by the gate.
!end
:after
narr: {門|もん} の {向|む}こう は 、 {霧|きり} と {雪|ゆき} だけ だ 。 || Beyond the gate there is only mist and snow.

@scene hall.w7.end
narr: それ から 、 マゴロク の {家|いえ} の {米|こめ} は 、 {何年|なんねん} {経|た}って も {減|へ}らなかった と いう 。 || And after that, they say, the rice in Magoroku's house never ran low, however many years went by.
hall_owan: {誰|だれ} か が {来|く}る と 、 {家|いえ} は {思|おも}い{出|だ}す 。 {誰|だれ} も {言|い}わなかった こと も 、 {全部|ぜんぶ} 。 || When someone comes, the house remembers. Even the things nobody said.
?(comp=nao) comp: {宛名|あてな} の ない {手紙|てがみ} も 、 {読|よ}めば {誰|だれ} {宛|あ}て か {分|わ}かる こと が ある 。 {今日|きょう} は 、 そういう {日|ひ} だった な 。 || Even a letter with no address on it: read it, and sometimes you know who it's for. Today was that kind of day.
?(comp=mio) comp[happy]: {言|い}わなかった こと を 、 {聞|き}き{取|と}る 。 {患者|かんじゃ} さん の {話|はなし} も 、 {同|おな}じ よ 。 || Hearing what wasn't said. It's the same with patients.
?(comp=ren) comp: {灯|ひ} が {七|なな}つ 、 {戻|もど}りました 。 {残|のこ}り は 、 {三|みっ}つ です 。 || Seven lights back. Three to go.
?(comp=suzu) comp: {第|だい}{七幕|ななまく} 、 {幕|まく} ！ {台詞|せりふ} の ない {場面|ばめん} ほど 、 お{客|きゃく} は {聞|き}き{入|い}る もの よ 。 || End of act seven! The scenes with no lines are the ones audiences lean in for.
narr: {雪|ゆき} が {畳|たた}まれる よう に {止|や}んで 、 {気|き}が {付|つ}く と 、 {館|やかた} の {囲炉裏|いろり} の {前|まえ} に いた 。 || The snow folds away into stillness, and when you look up you are by the hall's hearth.
!set hall_w7_done
!hook hall_finish
`;

  RB.script.add(out);
})(RB.content);
