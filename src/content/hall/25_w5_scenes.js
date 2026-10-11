/* The Hall of a Hundred Tales, wing 5, The Two Wells: the scenes (expansion P15; plan 04_DUNGEONS.md D9; maps in
 * 14_w5_maps.js, tasks and encounters in 19_w5_learning.js). Each trial sets its floor's own flag and tells the Hall;
 * what a trial shows follows the level its task is set at (the profile, or one up on the Grow route); the pattern
 * (hall.w5.pat) chooses the causes, the jars, the record's reason and the helpers' reasons. Osugi and Hatsu she/her,
 * Mosuke and Kōta he/him, Kero they/them. Suzu's lines have Kansai versions (src/content/dialect/kansai_99_hall.js). */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const K = C.hallKit, W = 'w5', L = K.lv(W), both = L.both;
  const TALE = C.hallW5Tale, FT = C.hallW5TaleF;
  const cap = (x) => x[0].toUpperCase() + x.slice(1);
  const nest = (x) => x.replace(/「/g, '『').replace(/」/g, '』');
  const LV = (fn) => [0, 1].flatMap((p) => ['F', 'E', 'I', 'A'].map((t) => fn(p, t))).join('');
  const LV3 = (fn) => [0, 1].flatMap((p) => [['EF', 0], ['E', 1], ['IA', 2]].map(([t, i]) => fn(p, t, i))).join('');
  let out = `
@scene hall.w5.f1_first
!set hall_w5_f1_seen
narr: {紙|かみ} の {戸|と} を {抜|ぬ}ける と 、 {夏|なつ} の {終|お}わり の {村|むら} だった 。 {蝉|せみ} の {声|こえ} が {遠|とお}く で {聞|き}こえ 、 {道|みち} の {先|さき} に {井戸|いど} が {見|み}える 。 || Through the paper screen: a village at the end of summer. Cicadas sing far off, and there is a well along the road.
?(comp=nao) comp: {井戸|いど} の {周|まわ}り に は 、 {噂|うわさ} が {集|あつ}まる 。 {配達|はいたつ} の {時|とき} 、 よく {聞|き}かされた よ 。 || Rumours gather round a well. I used to get an earful on my rounds.
?(comp=mio) comp: {井戸|いど} の {水|みず} は 、 {薬|くすり} を {煎|せん}じる {時|とき} に {一番|いちばん} {大事|だいじ} な の 。 {水|みず} が {悪|わる}い と 、 {全部|ぜんぶ} {台無|だいな}し 。 || Well water matters most when brewing medicine. Bad water ruins everything.
?(comp=ren) comp: {灯|ひ} と {水|みず} は 、 {村|むら} の {二|ふた}つ の {命|いのち} です 。 {片方|かたほう} が {欠|か}ける と 、 {村|むら} は {困|こま}ります 。 || Light and water are a village's two lives. Lose one, and the village suffers.
?(comp=suzu) comp: {第|だい}{五幕|ごまく} は 、 {二|ふた}つ の {家|いえ} の {話|はなし} ね 。 {家|いえ} {同士|どうし} の {喧嘩|けんか} は 、 {芝居|しばい} の {定番|ていばん} よ 。 || Act five: a tale of two houses. A feud between houses is a stage favourite.
?(!comp) narr: {乾|かわ}いた {風|かぜ} が 、 {道|みち} の {土|つち} を {巻|ま}き{上|あ}げた 。 || A dry wind lifts the dust from the road.

@scene hall.w5.f2_first
!set hall_w5_f2_seen
narr: {村|むら} の {西|にし} の {外|はず}れ 、 {柳|やなぎ} の {下|した} に {古|ふる}い {井戸|いど} 。 {覗|のぞ}く と 、 {水|みず} が {暗|くら}く {淀|よど}んで いる 。 || At the west end of the village, an old well under a willow. Looking in, the water lies dark and still.
?(comp) comp: {苦|にが}い {井戸|いど} 、 か 。 {誰|だれ} の せい か より 、 {何|なに} が {理由|りゆう} か を {知|し}りたい ね 。 || The bitter well. Never mind whose fault; I'd like to know what the reason is.

@scene hall.w5.f3_first
!set hall_w5_f3_seen
narr: {村|むら} の {広場|ひろば} に 、 {東|ひがし} の {家|いえ} も {西|にし} の {家|いえ} も {集|あつ}まって いる 。 {今日|きょう} は {井戸替|いどが}え の {日|ひ} だ 。 でも 、 {誰|だれ} も {口|くち} を {利|き}かない 。 || In the village square, east house and west house have both gathered. Today is the well-cleaning. But nobody is speaking.
?(comp=nao) comp: {同|おな}じ {広場|ひろば} に いて 、 {目|め} も {合|あ}わせない の か 。 {重症|じゅうしょう} だ な 。 || In the same square and not even meeting each other's eyes. That's serious.
?(comp=mio) comp: {子供|こども} たち は 、 {仲良|なかよ}し みたい なのに ね 。 || The children seem to be good friends, though.
?(comp=ren) comp: {井戸替|いどが}え は 、 {村|むら} {中|じゅう} で {力|ちから} を {合|あ}わせる {日|ひ} です 。 {今年|ことし} こそ 、 {合|あ}わせられる と いい です ね 。 || The well-cleaning is the day the whole village works together. I hope they manage it this year.
?(comp=suzu) comp: {大詰|おおづ}め の {舞台|ぶたい} は 、 {広場|ひろば} ね 。 {両家|りょうけ} {揃|そろ}い{踏|ぶ}み よ 。 || The final scene is set in the square. Both houses on stage together.

@scene hall.w5.bench1
!hook hall_station w5_b1

@scene hall.w5.bench2
!hook hall_station w5_b2

@scene hall.w5.bench3
!hook hall_station w5_b3

@scene hall.w5.spring
narr: {西|にし} の {外|はず}れ の {湧|わ}き{水|みず} 。 {小|ちい}さい が 、 {冷|つめ}たくて {澄|す}んで いる 。 || A spring at the west end of the village: small, but cold and clear.
!hook hall_station w5_sp

@scene hall.w5.kero
!faceplayer hall_kero
!if hall.w5.t10 -> after
hall_kero: {僕|ぼく} は 、 {西|にし} の {井戸|いど} に {百年|ひゃくねん} {住|す}んで いる 。 {井|い} の {中|なか} の {蛙|かわず} 、 だ けど ね 。 {井戸|いど} の こと なら 、 {誰|だれ} より も {知|し}って いる よ 。 || I've lived in the west well a hundred years. A frog in a well, I know. But about wells, I know more than anyone.
!end
:after
hall_kero: {水|みず} が {澄|す}んだ 。 {広|ひろ}い {海|うみ} は {知|し}らない けど 、 {澄|す}んだ {井戸|いど} は {知|し}って いる 。 それ で {十分|じゅうぶん} だ よ 。 || The water's clear. I don't know the great sea, but I know a clear well. That's enough.
`;

  // ---- t1: the story room ----------------------------------------------------------------------------------------------
  const E_PANELS = [TALE.P1, TALE.P2, TALE.P3, TALE.P4].map(nest);
  const F_PANELS = FT.map(nest);
  const PANEL_EN = ['Long ago there were two wells, one at the east end of the village and one at the west.', 'The east water was sweet, but the west water was bitter.', 'The east house said, "It\'s the west\'s fault," and the west house said, "It\'s the east\'s."', 'Only the frog at the bottom of the well knew the real reason.'];
  out += '\n@scene hall.w5.t1' + K.taskTrial({ w: W, k: 0, t: 't1',
    intro: ['narr: オスギ の {家|いえ} の {床|とこ} の {間|ま} に 、 {絵巻|えまき} が {掛|か}けて ある 。 || A picture scroll hangs in the alcove of Osugi\'s house.']
      .concat(...[0, 1, 2, 3].map((i) => ['?(' + L.EF + ') narr: 「 ' + F_PANELS[i] + ' 。 」 || "' + PANEL_EN[i] + '"', '?(' + L.NOTF + ') narr: 「 ' + E_PANELS[i] + ' 。 」 || "' + PANEL_EN[i] + '"']),
      ['narr: {乾|かわ}いた {風|かぜ} が {吹|ふ}き{込|こ}んで 、 {絵|え} の {順番|じゅんばん} が {乱|みだ}れた 。 || A dry wind blows in, and the pictures slip out of order.']),
    task: 'hall.w5.story',
    after: ['narr: {絵巻|えまき} が 、 {元|もと} の {順番|じゅんばん} に {戻|もど}った 。 || The scroll is back in its order.', '!challenge hall.w5.story_q',
      '?(comp=nao) comp: {誰|だれ} の せい か で {揉|も}める {家|いえ} は 、 {配達先|はいたつさき} に も よく ある 。 {大抵|たいてい} 、 {両方|りょうほう} {少|すこ}し ずつ だ 。 || Houses fighting over whose fault it is: I\'ve delivered to plenty. Usually it\'s a bit of both.',
      '?(comp=mio) comp: {誰|だれ} も {蛙|かえる} に は {聞|き}かなかった の ね 。 {一番|いちばん} {近|ちか}く に いた のに 。 || Nobody asked the frog. Even though it was closest of all.',
      '?(comp=ren) comp: {理由|りゆう} を {探|さが}す {時|とき} 、 {人|ひと} は {遠|とお}く を {見|み}がち です 。 {答|こた}え は 、 {足元|あしもと} の {井戸|いど} の {底|そこ} に ある こと も 。 || When looking for a reason, people look far away. Sometimes the answer is right under their feet, at the bottom of a well.',
      '?(comp=suzu) comp: {悪役|あくやく} の いない {喧嘩|けんか} は 、 {演|や}る の が {一番|いちばん} {難|むずか}しい の よ 。 || A quarrel with no villain is the hardest kind to play.'],
    later: 'narr: {絵|え} は 、 {後|あと} で {並|なら}べ{直|なお}せる 。 || You can put the pictures in order later.',
    done: 'narr: {絵巻|えまき} は 、 {元|もと} の {順番|じゅんばん} で {掛|か}かって いる 。 || The scroll hangs in its proper order.' });

  // ---- t2: three things set right at their cause --------------------------------------------------------------------------
  const RIGHT = { 0: { bucket: 'pulley', field: 'stone', dog: 'feed' }, 1: { bucket: 'beam', field: 'sluice', dog: 'gate' } };
  const OF = { pulley: 'bucket', beam: 'bucket', stone: 'field', sluice: 'field', feed: 'dog', gate: 'dog' };
  const EFFECT = {
    bucket: ['{井戸|いど} の {桶|おけ} 。 {綱|つな} を {引|ひ}いて も 、 {上|あ}がって こない 。', 'The well bucket. Pull the rope as you like, it won\'t come up.', '{桶|おけ} が 、 {水|みず} を {満|み}たして {上|あ}がって きた 。', 'The bucket comes up, full.'],
    field: ['オスギ の {畑|はたけ} 。 {野菜|やさい} が {萎|しお}れて いる 。', 'Osugi\'s vegetable patch. The plants are wilting.', '{水|みず} が {畑|はたけ} に {流|なが}れ{込|こ}んで 、 {葉|は} が {起|お}き{上|あ}がった 。', 'Water runs into the patch, and the leaves lift.'],
    dog: ['{犬小屋|いぬごや} 。 {中|なか} で {犬|いぬ} が {悲|かな}しそう に {鳴|な}いて いる 。', 'The kennel. Inside, a dog is whining miserably.', '{犬|いぬ} が {鳴|な}き{止|や}んで 、 {尻尾|しっぽ} を {振|ふ}った 。', 'The dog stops whining and wags its tail.'],
  };
  const CAUSE = {
    pulley: ['{錆|さ}びた {滑車|かっしゃ}', 'the rusty pulley', '{滑車|かっしゃ} に {油|あぶら} を さした 。', 'You oil the pulley.'],
    beam: ['{井戸|いど} の {上|うえ} の {梁|はり}', 'the beam over the well', '{梁|はり} に {絡|から}まった {綱|つな} を {解|ほど}いた 。', 'You untangle the rope from the beam.'],
    stone: ['{水路|すいろ} の {石|いし}', 'the stone in the channel', '{水路|すいろ} から {石|いし} を {取|と}り{除|のぞ}いた 。', 'You lift the stone out of the channel.'],
    sluice: ['{水門|すいもん} の {板|いた}', 'the sluice board', '{水門|すいもん} の {板|いた} を {上|あ}げた 。', 'You raise the sluice board.'],
    feed: ['{餌|えさ} の {袋|ふくろ}', 'the feed sack', '{犬|いぬ} に {餌|えさ} を やった 。', 'You feed the dog.'],
    gate: ['{庭|にわ} の {門|もん}', 'the yard gate', '{門|もん} を {開|あ}けて 、 {犬|いぬ} を {外|そと} に {出|だ}して やった 。', 'You open the gate and let the dog out.'],
  };
  const WHY = {
    bucket: { who: 'hall_kota', p: {
      0: ['かっしゃ が さびて いる から 、 つな が うごかない 。', '{滑車|かっしゃ} が {錆|さ}びて いる から 、 {綱|つな} が {動|うご}かない ん だ 。', '{綱|つな} が {動|うご}かない の は 、 {滑車|かっしゃ} が {錆|さ}びて いる せい だ よ 。', 'The pulley\'s rusted, so the rope won\'t move.'],
      1: ['つな が はり に からまって いる から 、 うごかない 。', '{綱|つな} が {梁|はり} に {絡|から}まって いる から 、 {動|うご}かない ん だ 。', '{動|うご}かない の は 、 {綱|つな} が {梁|はり} に {絡|から}まって いる せい だ よ 。', 'The rope\'s tangled on the beam, so it won\'t move.'] } },
    field: { who: 'hall_osugi', p: {
      0: ['すいろ に いし が つまって いる ので 、 みず が こない 。', '{水路|すいろ} に {石|いし} が {詰|つ}まって いる ので 、 {水|みず} が {来|こ}ない ん だ よ 。', '{水|みず} が {来|こ}ない の は 、 {水路|すいろ} に {石|いし} が {詰|つ}まって いる から な ん だ よ 。', 'A stone has blocked the channel, so no water comes.'],
      1: ['すいもん の いた が しまって いる ので 、 みず が こない 。', '{水門|すいもん} の {板|いた} が {閉|し}まって いる ので 、 {水|みず} が {来|こ}ない ん だ よ 。', '{水|みず} が {来|こ}ない の は 、 {水門|すいもん} の {板|いた} が {下|お}りた まま だ から な ん だ よ 。', 'The sluice board is down, so no water comes.'] } },
    dog: { who: 'hall_hatsu', p: {
      0: ['だれ も えさ を やらない から 、 いぬ が なく の 。', '{誰|だれ} も {餌|えさ} を やらない から 、 {犬|いぬ} が {鳴|な}く の 。', '{犬|いぬ} が {鳴|な}く の は 、 {誰|だれ} も {餌|えさ} を やらない せい な の 。', 'Nobody feeds it, so the dog whines.'],
      1: ['もん が しまって いて 、 そと に でられない から 、 いぬ が なく の 。', '{門|もん} が {閉|し}まって いて 、 {外|そと} に {出|で}られない から 、 {犬|いぬ} が {鳴|な}く の 。', '{犬|いぬ} が {鳴|な}く の は 、 {門|もん} が {閉|し}まって いて {外|そと} に {出|で}られない せい な の 。', 'The gate\'s shut and it can\'t get out, so the dog whines.'] } },
  };
  const FIXED = (pr) => 'xp_hall_w5_f0_fixed_' + pr;
  for (const pr of Object.keys(WHY)) {
    const who = WHY[pr].who;
    out += `
@scene hall.w5.why_${pr}
!faceplayer ${who}
!if ${FIXED(pr)} -> done
`;
    for (const p of [0, 1]) out += `?(${both(L.EF, 'hall.w5.pat=' + p)}) ${who}: 「 ${WHY[pr].p[p][0]} 」 || "${WHY[pr].p[p][3]}"
?(${both(L.E, 'hall.w5.pat=' + p)}) ${who}: 「 ${WHY[pr].p[p][1]} 」 || "${WHY[pr].p[p][3]}"
?(${both(L.IA, 'hall.w5.pat=' + p)}) ${who}: 「 ${WHY[pr].p[p][2]} 」 || "${WHY[pr].p[p][3]}"
`;
    out += `!end
:done
${who}: {直|なお}った ！ ありがとう 。 || It's fixed! Thank you.

@scene hall.w5.e_${pr}
!if ${FIXED(pr)} -> done
narr: ${EFFECT[pr][0]} || ${EFFECT[pr][1]}
?(comp) comp: ここ に は 、 {困|こま}った こと が {見|み}えて いる だけ 。 どうして そう なった か 、 {誰|だれ} か に {聞|き}いて みよう 。 || Here the trouble only shows. Let's ask someone why it happens.
!end
:done
narr: ${EFFECT[pr][2]} || ${EFFECT[pr][3]}
`;
  }
  for (const c of Object.keys(CAUSE)) {
    const pr = OF[c];
    const right = [0, 1].filter((p) => RIGHT[p][pr] === c);
    out += `
@scene hall.w5.c_${c}
!if ${FIXED(pr)} -> done
narr: ${CAUSE[c][0]} 。 || ${cap(CAUSE[c][1])}.
${right.map((p) => '!if hall.w5.pat=' + p + ' -> right').join('\n')}
narr: ${CAUSE[c][2]} …… {何|なに} も {変|か}わらない 。 {理由|りゆう} は 、 ここ で は ない よう だ 。 || ${CAUSE[c][3]} …Nothing changes. That isn't why, it seems.
!end
:right
narr: ${CAUSE[c][2]} || ${CAUSE[c][3]}
narr: ${EFFECT[pr][2]} || ${EFFECT[pr][3]}
!set ${FIXED(pr)}
!if ${Object.keys(WHY).map(FIXED).join('&')} -> all
!refresh
!end
:all
narr: {困|こま}った こと が 、 {三|みっ}つ とも {直|なお}った 。 {直|なお}した の は 、 {見|み}えて いる {所|ところ} で は なく 、 {理由|りゆう} の {所|ところ} だ 。 || All three troubles are mended, each at its reason rather than where it showed.
?(comp) comp: {桶|おけ} を {叩|たた}いて も 、 {桶|おけ} は {上|あ}がらない もん ね 。 || Banging the bucket would never have brought it up.
${K.mark(W, 0, 't2')}
!end
:done
narr: ${CAUSE[c][0]} 。 もう {大丈夫|だいじょうぶ} だ 。 || ${cap(CAUSE[c][1])}. All right now.
`;
  }

  // ---- t3: the old sayings and their stone -----------------------------------------------------------------------------------
  const CE = {
    0: { F: ['It rained, so I put up my umbrella.', 'It was cold, so I shut the window.', 'I was full, so I ate more.', 'The water was bitter, so I didn\'t drink it.'],
      E: ['It was raining, so I didn\'t go out.', 'The well is deep, but there\'s little water.', 'It was cheap-is, so I bought it.', 'It was quiet, so I slept well.'],
      I: ['Even though I took the medicine, I\'m not better.', 'Because of the rain, the festival was called off.', '"Because of" (blame) your help, it was over quickly.', 'Thanks to the east well, the village was saved.'],
      A: ['Precisely because I worked hard, I succeeded.', 'Despite the rain, many came.', 'Though we dug the well, no water came.', 'Though it rained, the ground got wet.'] },
    1: { F: ['I was sleepy, so I went to bed early.', 'It was dark, so I lit a light.', 'I was tired, so I ran more.', 'The water was sweet, so I drank a lot.'],
      E: ['The road is dark, so I\'ll take a lantern.', 'It\'s old, but it\'s a sturdy well.', 'Healthy (missing だ), so I ran.', 'The water is cold, so my hands hurt.'],
      I: ['I cleaned it, and yet it got dirty again.', 'Because of the willow roots, the water turned bitter.', 'Even though it rained, the road got wet.', 'Thanks to everyone, the well is clean.'],
      A: ['Precisely because it\'s an old well, I want to treasure it.', 'Despite opposition, the plan went ahead.', 'Despite being tired, I went to bed early.', 'Though I apologised, I wasn\'t forgiven.'] },
  };
  out += '\n@scene hall.w5.t3' + K.taskTrial({ w: W, k: 0, t: 't3',
    intro: ['narr: {村|むら} の {古|ふる}い {石|いし} に 、 {字|じ} が {刻|きざ}んで ある 。 「 {四|よっ}つ の {言葉|ことば} の うち 、 {一|ひと}つ だけ が {間違|まちが}って いる 。 」 || Carved on an old village stone: "Of the four sayings, one alone is wrong."'],
    task: { 0: 'hall.w5.counter0', 1: 'hall.w5.counter1' },
    after: ['narr: {間違|まちが}った {言葉|ことば} が 、 {乾|かわ}いた {風|かぜ} に {消|き}えた 。 || The wrong saying blows away on the dry wind.', '?(comp) comp: {理由|りゆう} が {合|あ}わない と 、 {話|はなし} が {全部|ぜんぶ} おかしく なる から ね 。 || When the reason doesn\'t fit, the whole story goes wrong.'],
    later: 'narr: {言葉|ことば} を {一|ひと}つ ずつ {読|よ}んで から 、 また {来|こ}よう 。 || Read the sayings one by one, then come back.',
    done: 'narr: {石|いし} の {字|じ} は 、 もう {何|なに} も {問|と}わない 。 || The carving asks nothing more.' });
  for (let i = 0; i < 4; i++) {
    out += `\n@scene hall.w5.card${i + 1}\nnarr: {昔|むかし} の {言葉|ことば} を {刻|きざ}んだ {石|いし} 。 || A stone carved with an old saying.\n`;
    out += LV((p, t) => `?(${both(L[t], 'hall.w5.pat=' + p)}) narr: 「 ${C.hallW5Cards[p][t][i][0]} 」 || "${CE[p][t][i]}"\n`);
  }

  // ---- t4: the four jars ---------------------------------------------------------------------------------------------------
  const KIND = { 0: { j1: 'fresh', j2: 'spoiled', j3: 'boiled', j4: 'raw' }, 1: { j1: 'spoiled', j2: 'fresh', j3: 'raw', j4: 'boiled' } };
  const OKDRINK = { fresh: true, boiled: true, spoiled: false, raw: false };
  const LABEL = {
    fresh: ['ひがし の いど の みず だ から 、 あまい 。', '{東|ひがし} の {井戸|いど} の {水|みず} だ から 、 {甘|あま}い 。 {今朝|けさ} {汲|く}んだ 。', '{今朝|けさ} 、 {東|ひがし} の {井戸|いど} から {汲|く}んだ ばかり な ので 、 {甘|あま}くて {冷|つめ}たい 。', 'East well water, drawn this morning: sweet.'],
    spoiled: ['ひがし の いど の みず だ けど 、 みっか まえ の みず だ 。', '{東|ひがし} の {井戸|いど} の {水|みず} な のに 、 {三日|みっか} も {日|ひ} に {当|あ}てた ので 、 {腐|くさ}って いる 。', '{東|ひがし} の {井戸|いど} の {水|みず} で は ある ものの 、 {三日|みっか} も {日向|ひなた} に {置|お}いた せい で 、 {臭|にお}う 。', 'East well water, but three days in the sun: gone bad.'],
    boiled: ['にし の いど の みず だ けど 、 わかした から 、 のめる 。', '{西|にし} の {井戸|いど} の {水|みず} だ けど 、 {沸|わ}かした ので 、 {飲|の}める 。', '{西|にし} の {井戸|いど} の {水|みず} に も かかわらず 、 よく {沸|わ}かした おかげ で 、 {苦|にが}み が {抜|ぬ}けて いる 。', 'West well water, but boiled: fit to drink.'],
    raw: ['にし の いど の みず だ から 、 にがい 。', '{西|にし} の {井戸|いど} の {水|みず} な ので 、 {苦|にが}い 。 {沸|わ}かして いない 。', '{西|にし} の {井戸|いど} から {汲|く}んだ まま で 、 {沸|わ}かして いない ので 、 {苦|にが}い 。', 'West well water, unboiled: bitter.'],
  };
  const JHOLD = (j) => 'xp_hall_w5_f1_hold_' + j, JPUT = (j) => 'xp_hall_w5_f1_put_' + j;
  const JARS = ['j1', 'j2', 'j3', 'j4'];
  for (const j of JARS) {
    out += `
@scene hall.w5.${j}
narr: {古|ふる}い {瓶|かめ} 。 {札|ふだ} が {付|つ}いて いる 。 || An old jar with a label on it.
`;
    out += LV3((p, t, i) => `?(${both(L[t], 'hall.w5.pat=' + p)}) narr: 「 ${LABEL[KIND[p][j]][i]} 」 || "${LABEL[KIND[p][j]][3]}"\n`);
    out += `!unset ${JARS.map(JHOLD).join(' ')}
!set ${JHOLD(j)}
narr: {瓶|かめ} を {抱|かか}えた 。 || You pick up the jar.
`;
  }
  for (const [dest, isDrink, place] of [['drink', true, ['{飲|の}み{水|みず} の {棚|たな}', 'the shelf for drinking water']], ['drain', false, ['{捨|す}て{場|ば} の {石|いし}', 'the drain stone']]]) {
    out += `
@scene hall.w5.to_${dest}
narr: ${place[0]} 。 || ${cap(place[1])}.
${JARS.map((j) => '!if ' + JHOLD(j) + ' -> h_' + j).join('\n')}
!end
`;
    for (const j of JARS) {
      out += `:h_${j}\n` + [0, 1].map((p) => `!if hall.w5.pat=${p} -> ${OKDRINK[KIND[p][j]] === isDrink ? 'ok_' + j : 'no'}`).join('\n') + '\n!end\n';
      out += `:ok_${j}\nnarr: {瓶|かめ} を ${place[0]} に {置|お}いた 。 || You set the jar on ${place[1]}.\n!unset ${JHOLD(j)}\n!set ${JPUT(j)}\n!goto check\n`;
    }
    out += `:no
narr: {札|ふだ} を もう {一度|いちど} {読|よ}もう 。 どうして ${isDrink ? '{飲|の}めない' : '{飲|の}める'} の か 、 {理由|りゆう} が {書|か}いて ある 。 || Read the label again. It says why it ${isDrink ? 'can\'t' : 'can'} be drunk.
!end
:check
!if ${JARS.map(JPUT).join('&')} -> all
!refresh
!end
:all
narr: {四|よっ}つ の {瓶|かめ} が 、 {飲|の}める {物|もの} と {飲|の}めない {物|もの} に {分|わ}けられた 。 || The four jars are sorted: what can be drunk, and what can't.
?(comp) comp: {東|ひがし} だ から {甘|あま}い 、 {西|にし} だ から {苦|にが}い 、 じゃ ない ん だ ね 。 {理由|りゆう} を {最後|さいご} まで {読|よ}まない と 。 || It's not "east, so sweet" and "west, so bitter". You have to read the reason to the end.
${K.mark(W, 1, 't4')}
!end
`;
  }

  // ---- t5: the frogs ------------------------------------------------------------------------------------------------------------
  out += `
@scene hall.w5.t5
narr: {蛙|かえる} たち が 、 {井戸|いど} の {縁|ふち} に {並|なら}んで {大人|おとな}しく なった 。 || The frogs line up on the rim of the well and go quiet.
${K.mark(W, 1, 't5')}
`;

  // ---- t6: the well-digger's record and the remedy it points to (in your companion's hands; alone, Hatsu reads it) ---------
  const TOLD = {
    0: { F: 'にし の いど が にがく なった の は 、 やなぎ の ね が いど に はいった から だ 。', E: '{西|にし} の {井戸|いど} が {苦|にが}く なった の は 、 {柳|やなぎ} の {根|ね} が {井戸|いど} に {入|はい}った から だ 。', I: '{柳|やなぎ} の {根|ね} が {井戸|いど} に {入|はい}り{込|こ}んだ せい で 、 {水|みず} が {苦|にが}く なった 。', A: '{柳|やなぎ} の {根|ね} が {入|はい}り{込|こ}んだ ため 、 {水|みず} に {苦|にが}み が {出|で}た もの と {思|おも}われる 。', en: 'The west well turned bitter because the willow\'s roots grew into it.' },
    1: { F: 'にし の いど が にがく なった の は 、 だれ も みず を くまなく なった から だ 。', E: '{西|にし} の {井戸|いど} が {苦|にが}く なった の は 、 {誰|だれ} も {水|みず} を {汲|く}まなく なった から だ 。 {汲|く}まない {井戸|いど} は 、 {水|みず} が {腐|くさ}る 。', I: '{東|ひがし} の {井戸|いど} ばかり {使|つか}って 、 {西|にし} の {井戸|いど} を {汲|く}まなく なった せい で 、 {水|みず} が {淀|よど}んだ 。', A: '{汲|く}む {者|もの} が いなく なった ため 、 {水|みず} が {淀|よど}み 、 {苦|にが}み が {出|で}た もの と {思|おも}われる 。', en: 'The west well turned bitter because nobody draws from it any more. A well nobody draws from goes bad.' },
  };
  out += `
@scene hall.w5.t6
!if hall.w5.t6 -> done
!if xp_hall_w5_f1_asked -> told
narr: {机|つくえ} の {上|うえ} に 、 {昔|むかし} の {井戸掘|いどほ}り の {記録|きろく} 。 {古|ふる}い {字|じ} が {虫|むし} に {食|く}われて いる 。 || On the table, the old well-digger's record. The old writing is moth-eaten.
?(comp=nao) comp: {虫食|むしく}い の {字|じ} なら 、 {任|まか}せて くれ 。 {古|ふる}い {宛名|あてな} で {慣|な}れてる 。 {何|なに} を {探|さが}す ？ || Leave moth-eaten writing to me. Old addresses taught me. What are we looking for?
?(comp=mio) comp: {私|わたし} が {読|よ}む わ 。 {古|ふる}い {処方|しょほう} の {帳面|ちょうめん} と 、 {同|おな}じ よう な もの よ 。 {何|なに} が {知|し}りたい の ？ || I'll read it. It's like an old prescription book. What do you want to know?
?(comp=ren) comp: {古|ふる}い {記録|きろく} は 、 {灯守|ひもり} の {仕事|しごと} でも {読|よ}みます 。 {私|わたし} が {読|よ}みましょう 。 {何|なに} を ？ || Lamp-keepers read old records too. I'll read it. What for?
?(comp=suzu) comp: {古|ふる}い {台本|だいほん} を {読|よ}む の は 、 {慣|な}れて る わ 。 {任|まか}せて 。 {何|なに} を {見|み}る ？ || I'm used to reading old scripts. Leave it to me. What am I looking for?
?(!comp) hall_hatsu: おじいちゃん が 、 {字|じ} を {教|おし}えて くれた から 、 {私|わたし} が {読|よ}める よ 。 {何|なに} を {調|しら}べる の ？ || Grandpa taught me my letters, so I can read it. What are we looking up?
!hook hall_challenge hall.w5.ask
!if var._res=0 -> later
!set xp_hall_w5_f1_asked
:told
`.replace('{慣|な}れて る わ', '{慣|な}れてる わ');
  out += LV((p, t) => `?(${both(L[t], 'hall.w5.pat=' + p)}) narr: 「 ${TOLD[p][t]} 」 || "${TOLD[p].en}"\n`);
  out += `!end
:later
narr: {記録|きろく} は 、 {机|つくえ} の {上|うえ} に {戻|もど}した 。 || You put the record back on the table.
!end
:done
narr: {記録|きろく} は 、 {西|にし} の {井戸|いど} の {頁|ページ} で {開|ひら}いた まま だ 。 || The record lies open at the page on the west well.
`;
  const FIX6 = { willow: ['{柳|やなぎ} の {木|き}', 'the willow', '{井戸|いど} の {方|ほう} へ {伸|の}びた {根|ね} を 、 {鋸|のこぎり} で {切|き}った 。', 'You saw through the roots growing toward the well.', 0],
    draw: ['{西|にし} の {井戸|いど}', 'the west well', '{桶|おけ} で {何|なん}{十|じゅう} {杯|ぱい} も {汲|く}み{出|だ}す と 、 {水|みず} が {澄|す}んで きた 。', 'You draw bucket after bucket, dozens, until the water starts to run clear.', 1],
    lid: ['{井戸|いど} の {蓋|ふた}', 'a lid for the well', null, null, -1] };
  for (const f of Object.keys(FIX6)) {
    out += `
@scene hall.w5.m_${f}
!if hall.w5.t6 -> done
narr: ${FIX6[f][0]} 。 || ${cap(FIX6[f][1])}.
!if !xp_hall_w5_f1_asked -> unknown
${FIX6[f][4] >= 0 ? '!if hall.w5.pat=' + FIX6[f][4] + ' -> right\n' : ''}narr: {記録|きろく} の {理由|りゆう} と は 、 {関係|かんけい} が ない よう だ 。 これ で は 、 {水|みず} は {苦|にが}い まま だ 。 || This has nothing to do with the reason in the record, it seems. The water would stay bitter.
?(comp) comp: {記録|きろく} の {言葉|ことば} 、 もう {一度|いちど} {言|い}おう か ？ || Shall I say what the record said again?
!end
${FIX6[f][4] >= 0 ? `:right
narr: ${FIX6[f][2]} || ${FIX6[f][3]}
?(comp) comp: {理由|りゆう} が {分|わ}かれば 、 {直|なお}し {方|かた} も {分|わ}かる 。 {誰|だれ} の せい でも なかった ね 。 || Know the reason and you know the remedy. It was nobody's fault after all.
${K.mark(W, 1, 't6')}
!end
` : ''}:unknown
narr: {井戸|いど} が {苦|にが}い {理由|りゆう} が 、 まだ {分|わ}からない 。 {記録|きろく} を {読|よ}んで もらおう 。 || You don't know yet why the well is bitter. Have the record read first.
!end
:done
narr: ${FIX6[f][0]} 。 || ${cap(FIX6[f][1])}.
`;
  }

  // ---- t7: the riddle stone ----------------------------------------------------------------------------------------------------
  out += '\n@scene hall.w5.t7' + K.taskTrial({ w: W, k: 1, t: 't7',
    intro: ['narr: {苔|こけ} むした {石|いし} に 、 {字|じ} が {彫|ほ}って ある 。 「 {解|と}けた {者|もの} は 、 {一度|いちど} だけ 、 {帰|かえ}って また {来|く}る こと が できる 。 」 || Words cut into a mossy stone: "Whoever solves this may once go home and come back."'],
    task: 'hall.w5.riddle',
    after: ['narr: {石|いし} の {字|じ} が 、 {夕日|ゆうひ} に {光|ひか}った 。 || The carving shines in the evening sun.'],
    later: 'narr: {答|こた}え は 、 {急|いそ}がなくて いい 。 || There\'s no hurry for the answer.',
    done: 'narr: {石|いし} は 、 {答|こた}え を {覚|おぼ}えて いる 。 || The stone remembers the answer.' });

  // ---- t8: the cleaning's three jobs, given by the helpers' reasons ----------------------------------------------------------
  const ASSIGN = { 0: { kota: 'bucket', hatsu: 'rope', mosuke: 'tally' }, 1: { kota: 'tally', hatsu: 'bucket', mosuke: 'rope' } };
  const JOB = { bucket: ['{桶|おけ} {運|はこ}び', 'hauling buckets'], rope: ['{綱|つな} {持|も}ち', 'holding the rope'], tally: ['{数|かず} {数|かぞ}え', 'counting the buckets'] };
  const HELPER = { kota: ['hall_kota3', 'コウタ', 'Kōta', 'hall_kota'], hatsu: ['hall_hatsu3', 'ハツ', 'Hatsu', 'hall_hatsu'], mosuke: ['hall_mosuke', 'モスケ', 'Mosuke', 'hall_mosuke'] };
  const NO = { kota: ['「 それ は 、 {無理|むり} だ よ 。 さっき {言|い}った だろ ？ 」', '"I can\'t do that one. Didn\'t I just say?"'],
    hatsu: ['「 それ は 、 {無理|むり} だ よ 。 さっき {言|い}った でしょ ？ 」', '"I can\'t do that one. Didn\'t I just say?"'],
    mosuke: ['「 それ は 、 {無理|むり} じゃ 。 さっき {言|い}った ばかり じゃ ろう 。 」', '"That one I can\'t. I\'ve only just told you."'] };
  const OK = { kota: ['{任|まか}せて よ 。', 'Leave it to me.'], hatsu: ['{任|まか}せて 。', 'Leave it to me.'], mosuke: ['{任|まか}せて おけ 。', 'Leave it to me.'] };
  const REASON = {
    kota: { 0: ['ちから は ある けど 、 かず を かぞえる の は にがて だ 。', '{力|ちから} は ある けど 、 {数|かず} を {数|かぞ}える の は {苦手|にがて} な ん だ 。', '{重|おも}い {物|もの} を {運|はこ}ぶ の は {得意|とくい} だ けど 、 {数|かぞ}える と すぐ {間違|まちが}える ん だ よ 。', 'I\'m strong, but I\'m no good at counting.'],
      1: ['かず は とくい だ けど 、 きのう あし を くじいた から 、 はこべない 。', '{数|かず} は {得意|とくい} だ けど 、 {昨日|きのう} {足|あし} を くじいた から 、 {運|はこ}べない ん だ 。', '{足|あし} を くじいた せい で {運|はこ}べない けど 、 {数|かぞ}える の なら {誰|だれ} に も {負|ま}けない よ 。', 'I\'m good at counting, but I twisted my ankle yesterday, so I can\'t carry.'] },
    hatsu: { 0: ['て は きよう だ けど 、 おもい もの は もてない 。', '{手|て} は {器用|きよう} だ けど 、 {重|おも}い {物|もの} は {持|も}てない の 。', '{重|おも}い {物|もの} は {無理|むり} だ けど 、 {手|て} が {器用|きよう} な おかげ で 、 {綱|つな} を {扱|あつか}う の は {上手|じょうず} な の 。', 'My hands are nimble, but I can\'t lift heavy things.'],
      1: ['ちからしごと なら まかせて 。 てさき は ぶきよう だ けど 。', '{力仕事|ちからしごと} なら {任|まか}せて 。 {手先|てさき} は {不器用|ぶきよう} だ けど 。', '{手先|てさき} が {不器用|ぶきよう} な {分|ぶん} 、 {力|ちから} だけ は {誰|だれ} に も {負|ま}けない の 。', 'Leave the heavy work to me. I\'m clumsy with my fingers, though.'] },
    mosuke: { 0: ['こし が いたい から 、 たって はたらけない 。 でも 、 かず なら まかせろ 。', '{腰|こし} が {痛|いた}い ので 、 {立|た}ち{仕事|しごと} は {無理|むり} じゃ 。 {数|かず} なら {任|まか}せろ 。', '{腰|こし} を {痛|いた}めた せい で 、 {立|た}って いられん 。 じゃ が 、 {座|すわ}って {数|かず} を {数|かぞ}える だけ なら できる 。', 'My back hurts, so I can\'t work standing. But leave the counting to me.'],
      1: ['こし は いたい が 、 すわって つな を もつ だけ なら できる 。', '{腰|こし} は {痛|いた}い が 、 {座|すわ}って {綱|つな} を {持|も}つ だけ なら できる 。', '{腰|こし} は {言|い}う こと を {聞|き}かん が 、 {手|て} だけ は まだ {確|たし}か じゃ から 、 {綱|つな} なら {持|も}てる 。', 'My back hurts, but I can sit and hold the rope.'] },
  };
  const THOLD = (g) => 'xp_hall_w5_f2_hold_' + g, TGAVE = (g) => 'xp_hall_w5_f2_gave_' + g, TDONE = (h) => 'xp_hall_w5_f2_job_' + h;
  out += `
@scene hall.w5.t8_board
narr: {井戸替|いどが}え の {仕事|しごと} の {札|ふだ} 。 「 {桶|おけ} {運|はこ}び 、 {綱|つな} {持|も}ち 、 {数|かず} {数|かぞ}え 。 {一人|ひとり} {一|ひと}つ ずつ 。 」 || The well-cleaning's job board: "Hauling buckets, holding the rope, counting. One each."
?(comp&!hall.w5.t8) comp: {誰|だれ} に {何|なに} が できる か 、 {理由|りゆう} を {聞|き}いて から {決|き}めよう 。 || Let's hear everyone's reasons before we decide who does what.
`;
  for (const g of Object.keys(JOB)) out += `
@scene hall.w5.tag_${g}
!unset ${Object.keys(JOB).map(THOLD).join(' ')}
!set ${THOLD(g)}
narr: 「 ${JOB[g][0]} 」 の {札|ふだ} を {取|と}った 。 || You take the tag: "${cap(JOB[g][1])}".
`;
  for (const h of Object.keys(HELPER)) {
    const [id, jp, en, who] = HELPER[h];
    out += `
@scene hall.w5.h_${h}
!faceplayer ${id}
!if ${TDONE(h)} -> done
`;
    for (const p of [0, 1]) out += `?(${both(L.EF, 'hall.w5.pat=' + p)}) ${who}: 「 ${REASON[h][p][0]} 」 || "${REASON[h][p][3]}"
?(${both(L.E, 'hall.w5.pat=' + p)}) ${who}: 「 ${REASON[h][p][1]} 」 || "${REASON[h][p][3]}"
?(${both(L.IA, 'hall.w5.pat=' + p)}) ${who}: 「 ${REASON[h][p][2]} 」 || "${REASON[h][p][3]}"
`;
    out += `!if hall.w5.pat=1 -> p1
!if ${THOLD(ASSIGN[0][h])} -> give0
!goto other
:p1
!if ${THOLD(ASSIGN[1][h])} -> give1
:other
!if ${Object.keys(JOB).map(THOLD).join('|')} -> wrong
!end
:wrong
narr: ${jp} が {首|くび} を {振|ふ}った 。 ${NO[h][0]} || ${en} shakes ${h === 'hatsu' ? 'her' : 'his'} head. ${NO[h][1]}
!end
`;
    for (const p of [0, 1]) {
      const g = ASSIGN[p][h];
      out += `:give${p}
narr: 「 ${JOB[g][0]} 」 の {札|ふだ} を ${jp} に {渡|わた}した 。 || You hand ${en} the tag: "${cap(JOB[g][1])}".
!unset ${Object.keys(JOB).map(THOLD).join(' ')}
!set ${TDONE(h)} ${TGAVE(g)}
!goto check
`;
    }
    out += `:check
!if ${Object.keys(HELPER).map(TDONE).join('&')} -> all
!refresh
!end
:all
narr: {三|みっ}つ の {仕事|しごと} が 、 それぞれ {合|あ}う {人|ひと} に {決|き}まった 。 || The three jobs have each gone to the one they suit.
?(comp) comp: できない {理由|りゆう} を {聞|き}けば 、 できる こと も {分|わ}かる 。 {上手|うま}く {分|わ}けられた ね 。 || Hear why someone can't, and you learn what they can. Nicely shared out.
${K.mark(W, 2, 't8')}
!end
:done
${who}: ${OK[h][0]} || ${OK[h][1]}
`;
  }

  // ---- t9: Osugi and Mosuke --------------------------------------------------------------------------------------------------
  out += `
@scene hall.w5.t9
!faceplayer hall_osugi3
!if hall.w5.t9 -> after
hall_osugi: {西|にし} の {井戸|いど} の {話|はなし} なら 、 {聞|き}きたく ない ね 。 あの {家|いえ} の せい で 、 {村|むら} {中|じゅう} が {迷惑|めいわく} して いる 。 || If it's about the west well, I don't want to hear it. That house is the reason the whole village suffers.
!encounter hall.w5.feud
!if var._enc=together -> together
narr: {広場|ひろば} の {両端|りょうはし} で 、 {二人|ふたり} は {背|せ} を {向|む}けて いる 。 || At opposite ends of the square, the two stand with their backs turned.
!end
:together
hall_osugi: …… {二|ふた}つ と も 、 {一緒|いっしょ} に 。 {孫|まご} たち に 、 {見|み}せて やらない と ね 。 || …Both wells, together. We'd better show the grandchildren how it's done.
${K.mark(W, 2, 't9')}
!end
:after
hall_osugi: {西|にし} の {水|みず} も 、 {昔|むかし} は {甘|あま}かった の さ 。 {忘|わす}れて いた よ 。 || The west water used to be sweet too, you know. I'd forgotten.
`;

  // ---- t10: the well-cleaning ----------------------------------------------------------------------------------------------
  out += `
@scene hall.w5.t10
!if hall.w5.t10 -> after
!if !hall.w5.t8 -> wait
!if !hall.w5.t9 -> wait
narr: {東|ひがし} の {家|いえ} も {西|にし} の {家|いえ} も 、 {井戸|いど} の {周|まわ}り に {集|あつ}まった 。 ケロ が {縁|ふち} から {覗|のぞ}いて いる 。 || East house and west house gather round the well. Kero peers over the rim.
!encounter hall.w5.clean
!if var._res=0 -> later
!set xp_hall_w5_f2_t10
!hook hall_trial w5 t10
!if var._res=1 -> finale
!refresh
!end
:finale
!call hall.w5.end
!end
:wait
narr: {井戸|いど} の {周|まわ}り に は 、 まだ {誰|だれ} も いない 。 || Nobody has gathered at the well yet.
?(!hall.w5.t8) narr: {仕事|しごと} の {札|ふだ} は 、 まだ {誰|だれ} の {手|て} に も {渡|わた}って いない 。 || The job tags haven't been handed to anyone.
?(!hall.w5.t9) narr: オスギ と モスケ は 、 {広場|ひろば} の {両端|りょうはし} で {背|せ} を {向|む}け{合|あ}って いる 。 || Osugi and Mosuke stand at opposite ends of the square, backs turned.
!end
:later
narr: {井戸|いど} の {周|まわ}り で 、 {皆|みな} が {次|つぎ} の {合図|あいず} を {待|ま}って いる 。 || Round the well, everyone waits for the next word.
!end
:after
narr: {井戸|いど} の {水|みず} が 、 {空|そら} を {映|うつ}して いる 。 || The water in the well reflects the sky.

@scene hall.w5.end
narr: {夕方|ゆうがた} 、 {東|ひがし} の {家|いえ} と {西|にし} の {家|いえ} が 、 {同|おな}じ {鍋|なべ} で {夕飯|ゆうはん} を {作|つく}った 。 {水|みず} は 、 {二|ふた}つ の {井戸|いど} から {半分|はんぶん} ずつ 。 || In the evening the east house and the west house cook supper in one pot, with water from both wells, half and half.
hall_kero: {井|い} の {中|なか} の {蛙|かわず} 、 {大海|たいかい} を {知|し}らず 。 でも 、 {二|ふた}つ の {井戸|いど} の {仲直|なかなお}り は 、 {知|し}って いる よ 。 || The frog in the well knows nothing of the great sea. But it knows two wells making up.
?(comp=nao) comp: {両方|りょうほう} から {水|みず} を {汲|く}む 。 {両方|りょうほう} へ {手紙|てがみ} を {届|とど}ける 。 {同|おな}じ こと だ な 。 || Water from both. Letters to both. The same thing.
?(comp=mio) comp[happy]: から 、 のに 、 おかげ 、 せい 。 {理由|りゆう} の {言|い}い{方|かた} {一|ひと}つ で 、 {喧嘩|けんか} に も {仲直|なかなお}り に も なる のね 。 || Because, even though, thanks to, because of. One way of giving a reason, and it's a quarrel; another, and it's making up.
?(comp=ren) comp: {灯|ひ} が {五|いつ}つ 、 {戻|もど}りました 。 {半分|はんぶん} まで {来|き}ました ね 。 || Five lights back. We're halfway.
?(comp=suzu) comp: {第|だい}{五幕|ごまく} 、 {幕|まく} ！ {悪役|あくやく} なし の {大団円|だいだんえん} よ 。 {拍手|はくしゅ} ！ || End of act five! A happy ending with no villain. Applause!
narr: {夕餉|ゆうげ} の {湯気|ゆげ} が {畳|たた}まれる よう に {小|ちい}さく なって 、 {気|き}が {付|つ}く と 、 {館|やかた} の {囲炉裏|いろり} の {前|まえ} に いた 。 || The steam of supper folds small, and when you look up you are by the hall's hearth.
!set hall_w5_done
!hook hall_finish
`;
  RB.script.add(out);
})(RB.content);
