/* The Hall of a Hundred Tales, wing 10, The Hundredth Tale: the scenes (expansion P15; plan 04_DUNGEONS.md D9; maps in
 * 38_w10_maps.js, tasks and encounters in 39_w10_learning.js), and, after it, Keeper Tsuru's last conversation in the
 * Hall and the keepsake she gives (D9 Rewards: all ten). Each trial sets its floor's own flag and tells the Hall; what
 * a trial shows follows the level its task is set at (the profile, or one up on the Grow route); the pattern
 * (hall.w10.pat) chooses the places on the waystones, the sayings in the gallery, where the wick is kept and the
 * pages. Sōan he/him, Kohaku they/them, Tsuru she/her. Suzu's lines have Kansai versions
 * (src/content/dialect/kansai_99_hall.js). */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const K = C.hallKit, W = 'w10', L = K.lv(W), both = L.both;
  const TALE = C.hallW10Tale, FT = C.hallW10TaleF;
  const nest = (x) => x.replace(/「/g, '『').replace(/」/g, '』');
  const cap = (x) => x[0].toUpperCase() + x.slice(1);
  const LV = (fn) => [0, 1].flatMap((p) => ['F', 'E', 'I', 'A'].map((t) => fn(p, t))).join('');
  const LV3 = (fn) => [0, 1].flatMap((p) => [['EF', 0], ['E', 1], ['IA', 2]].map(([t, i]) => fn(p, t, i))).join('');
  const LVS = ['EF', 'E', 'IA'];
  const P2 = (t, p) => both(L[t], 'hall.w10.pat=' + p);
  let out = `
@scene hall.w10.f1_first
!set hall_w10_f1_seen
narr: {紙|かみ} の {戸|と} を {抜|ぬ}ける と 、 {見覚|みおぼ}え の ある {道|みち} が {続|つづ}いて いた 。 {遠|とお}く に {葦|あし} の {原|はら} 、 {海|うみ} 、 {橋|はし} 、 {雪|ゆき} の {山|やま} 。 {全部|ぜんぶ} 、 {自分|じぶん} が {歩|ある}いて きた {所|ところ} だ 。 || Through the paper screen, a road you know runs on. Far off: reed beds, the sea, bridges, snowy mountains. Every one of them a place you walked.
?(comp=nao) comp: …… これ 、 {俺|おれ} たち の {道|みち} じゃん 。 || …Wait, this is our road.
?(comp=mio) comp: {懐|なつ}かしい わ 。 {最初|さいしょ} の {日|ひ} の こと 、 {覚|おぼ}えて いる ？ || It takes me back. Do you remember the very first day?
?(comp=ren) comp: {十番目|じゅうばんめ} の {灯|ひ} の {中|なか} は 、 {私|わたし} たち の {旅|たび} でした か 。 || So inside the tenth light is our own journey.
?(comp=suzu) comp: {最終幕|さいしゅうまく} の {舞台|ぶたい} は 、 {私|わたし} たち の {旅|たび} 。 {演出|えんしゅつ} 、 {憎|にく}い わ ね 。 || The last act is set on our own journey. Whoever staged this knows what they're doing.
?(!comp) narr: {一人|ひとり} で {歩|ある}いた {道|みち} も 、 {振|ふ}り{返|かえ}る と {誰|だれ} か の {足跡|あしあと} が {並|なら}んで いる 。 || Even the road you walked alone, looking back, has other footprints beside yours.

@scene hall.w10.f2_first
!set hall_w10_f2_seen
narr: {館|やかた} の {回廊|かいろう} 。 {壁|かべ} に {沿|そ}って 、 {九|ここの}つ の {話|はなし} の {灯|ひ} が {並|なら}んで いる 。 {今|いま} より ずっと {昔|むかし} の 、 {館|やかた} の {夜|よる} だ 。 || The Hall's long gallery. Along the walls stand the lights of the nine tales. It is a night in the Hall, long, long ago.
?(comp) comp: {九|ここの}つ の {灯|ひ} 、 {全部|ぜんぶ} {見覚|みおぼ}え が ある ね 。 || All nine lights look familiar.

@scene hall.w10.f3_first
!set hall_w10_f3_seen
narr: {一番|いちばん} {奥|おく} の {部屋|へや} 。 {九十九|きゅうじゅうきゅう} の {灯|ひ} が {燃|も}え 、 {真|ま}ん{中|なか} の {一|ひと}つ だけ が {暗|くら}い 。 {年老|としお}いた {灯守|ひもり} と {弟子|でし} が 、 その {灯|ひ} を {挟|はさ}んで {黙|だま}って いる 。 || The innermost room. Ninety-nine lights are burning; only the one in the middle is dark. An old keeper and an apprentice sit on either side of it, saying nothing.
?(comp=nao) comp: {最後|さいご} の {一通|いっつう} が 、 まだ {届|とど}いて ない って {顔|かお} だ な 。 || They look like people waiting on one last letter.
?(comp=mio) comp: {二人|ふたり} と も 、 {言|い}いたい こと を {飲|の}み{込|こ}んで いる {顔|かお} ね 。 || They both look like they're swallowing what they want to say.
?(comp=ren) comp: {九十九|きゅうじゅうきゅう} で {止|と}まった {夜|よる} 。 …… {灯守|ひもり} の {間|あいだ} で 、 {語|かた}られなかった {話|はなし} です 。 || The night it stopped at ninety-nine. …The one tale the keepers never told.
?(comp=suzu) comp: {大詰|おおづ}め の {大詰|おおづ}め ね 。 {客席|きゃくせき} は 、 {満員|まんいん} よ 。 || The very last scene. And a full house.
?(!comp) narr: {暗|くら}い {灯|ひ} の {前|まえ} で 、 {誰|だれ} か が {待|ま}って いる 。 || Before the dark light, someone is waiting.

@scene hall.w10.bench1
!hook hall_station w10_b1

@scene hall.w10.bench2
!hook hall_station w10_b2

@scene hall.w10.bench3
!hook hall_station w10_b3

@scene hall.w10.spring
narr: {館|やかた} の {井戸|いど} 。 {水面|みなも} に 、 {九十九|きゅうじゅうきゅう} の {灯|ひ} が {映|うつ}って いる 。 || The Hall's well. Ninety-nine lights are reflected in the water.
!hook hall_station w10_sp

@scene hall.w10.kohaku
!faceplayer hall_kohaku
!if hall.w10.t2 -> done
hall_kohaku: ここ は 、 あなた が {歩|ある}いて きた {道|みち} です 。 {道標|みちしるべ} に 、 {通|とお}った {順|じゅん} に {場所|ばしょ} の {名前|なまえ} を {置|お}いて ください 。 {道中記|どうちゅうき} も あります 。 || This is the road you walked. Set the names of the places on the waystones, in the order you passed them. There's a road record too.
!end
:done
hall_kohaku: {来|き}た {道|みち} を {知|し}って いる {人|ひと} は 、 {迷|まよ}って も {戻|もど}れます 。 || Someone who knows the road they came by can always find their way back.

@scene hall.w10.kohaku2
!faceplayer hall_kohaku2
!if hall.w10.t4 -> done
hall_kohaku: {床|ゆか} に {落|お}ちて いる {言葉|ことば} は 、 どれ も {九|ここの}つ の {話|はなし} の どれ か で {習|なら}った もの です 。 {合|あ}う {灯|ひ} の {前|まえ} に {置|お}いて あげて ください 。 || Each of the sayings on the floor is something one of the nine tales taught. Set each one before the light it belongs to.
!end
:done
hall_kohaku: {九十九|きゅうじゅうきゅう} まで は 、 {師匠|ししょう} と {一緒|いっしょ} に {灯|とも}した ん です 。 || I lit them up to ninety-nine with my master.
`;

  // ---- t1: the story room: your journey ----------------------------------------------------------------------------------
  const E_PANELS = [TALE.P1, TALE.P2, TALE.P3, TALE.P4].map(nest);
  const F_PANELS = FT.map(nest);
  const PANEL_EN = ['One day, a traveller set out from Reedwake.', 'The traveller met companions, and called back fading words one by one.', 'At the Still Archive, the long road came to an ending.', 'And now, in the Hall of a Hundred Tales, ninety-nine lights are burning.'];
  out += '\n@scene hall.w10.t1' + K.taskTrial({ w: W, k: 0, t: 't1',
    intro: ['narr: {小屋|こや} の {壁|かべ} に 、 {絵巻|えまき} が {掛|か}けて ある 。 {描|か}かれて いる {旅人|たびびと} の {顔|かお} は 、 $name に よく {似|に}て いる 。 || A picture scroll hangs on the hut wall. The traveller painted on it looks a great deal like $name.']
      .concat(...[0, 1, 2, 3].map((i) => ['?(' + L.EF + ') narr: 「 ' + F_PANELS[i] + ' 。 」 || "' + PANEL_EN[i] + '"', '?(' + L.NOTF + ') narr: 「 ' + E_PANELS[i] + ' 。 」 || "' + PANEL_EN[i] + '"']),
      ['narr: {風|かぜ} が {吹|ふ}き{込|こ}んで 、 {絵|え} の {順番|じゅんばん} が {乱|みだ}れた 。 || A wind blows in, and the pictures slip out of order.']),
    task: 'hall.w10.story',
    after: ['narr: {絵巻|えまき} が 、 {元|もと} の {順番|じゅんばん} に {戻|もど}った 。 || The scroll is back in its order.', '!challenge hall.w10.story_q',
      '?(comp=nao) comp: {自分|じぶん} の {話|はなし} を {人|ひと} の {話|はなし} みたい に {読|よ}む の 、 {変|へん} な {感|かん}じ だ な 。 || Funny, reading your own story like it\'s someone else\'s.',
      '?(comp=mio) comp: {四|よっ}つ の {絵|え} じゃ 、 {全然|ぜんぜん} {足|た}りない わ ね 。 {大事|だいじ} な こと が もっと あった もの 。 || Four pictures are nowhere near enough. So much more happened that mattered.',
      '?(comp=ren) comp: {絵|え} の {中|なか} の {旅人|たびびと} 、 {道|みち} に {迷|まよ}って いない です ね 。 {私|わたし} と {違|ちが}って 。 || The traveller in the pictures never gets lost. Unlike me.',
      '?(comp=suzu) comp: {主役|しゅやく} は あなた 。 {脇役|わきやく} は {私|わたし} 。 {悪|わる}く ない {配役|はいやく} よ 。 || You in the lead, me in support. Not bad casting.'],
    later: 'narr: {絵|え} は 、 {後|あと} で {並|なら}べ{直|なお}せる 。 || You can put the pictures in order later.',
    done: 'narr: {絵巻|えまき} は 、 {元|もと} の {順番|じゅんばん} で {掛|か}かって いる 。 || The scroll hangs in its proper order.' });

  // ---- t2: the waystones of your road ----------------------------------------------------------------------------------------------
  const PLACE = {
    rw: ['{葦|あし}ノ{瀬|せ}', 'Reedwake'], sg: ['{潮|しお}{硝子|がらす}', 'Saltglass'], mb1: ['{八百橋|やおばし} の {橋|はし}', 'Manybridge\'s bridges'],
    mb2: ['{八百橋|やおばし} の {芝居小屋|しばいごや}', 'Manybridge\'s playhouses'], co: ['{灰実|はいみ} の {里|さと}', 'Cinder Orchard'], sb: ['{雪鈴|ゆきすず}', 'Snowbell'],
    kr: ['{灯守|ひもり} の {道|みち}', 'the Keepers\' Road'], lf: ['{灯落|ひおち}', 'Lanternfall'], ko: ['{言|こと}の{葉|は}{島|じま}', 'Kotonoha'],
    cr: ['{雲路|くもじ}', 'the Cloudroad'], yn: ['{湯|ゆ}ノ{谷|たに}', 'Steamhollow'], sa: ['{静寂|しじま} の {書庫|しょこ}', 'the Still Archive'],
  };
  const ROADREC = {
    0: ['あしのせ を でて 、 やおばし へ いった 。 それから 、 はいみ の さと 、 ひもり の みち 、 ことのはじま 、 ゆのたに の じゅん に あるいた 。',
      '{葦|あし}ノ{瀬|せ} を {出|で}て 、 {八百橋|やおばし} へ {行|い}った 。 それから 、 {灰実|はいみ} の {里|さと} 、 {灯守|ひもり} の {道|みち} 、 {言|こと}の{葉|は}{島|じま} 、 {湯|ゆ}ノ{谷|たに} の {順|じゅん} に {歩|ある}いた 。',
      '{葦|あし}ノ{瀬|せ} を {発|た}った {後|あと} 、 まず {八百橋|やおばし} に {着|つ}いた 。 {灰実|はいみ} の {里|さと} を {過|す}ぎて から {灯守|ひもり} の {道|みち} を {辿|たど}り 、 {言|こと}の{葉|は}{島|じま} を {経|へ}て 、 {最後|さいご} に {湯|ゆ}ノ{谷|たに} へ {下|お}りた 。',
      'Out of Reedwake to Manybridge; then Cinder Orchard, the Keepers\' Road, Kotonoha and Steamhollow, in that order.'],
    1: ['しおがらす で うみ を みて 、 それから やおばし の しばいごや へ いった 。 その あと 、 ゆきすず 、 ひおち 、 くもじ を とおって 、 さいご に しじま の しょこ に ついた 。',
      '{潮|しお}{硝子|がらす} で {海|うみ} を {見|み}て 、 それから {八百橋|やおばし} の {芝居小屋|しばいごや} へ {行|い}った 。 その {後|あと} 、 {雪鈴|ゆきすず} 、 {灯落|ひおち} 、 {雲路|くもじ} を {通|とお}って 、 {最後|さいご} に {静寂|しじま} の {書庫|しょこ} に {着|つ}いた 。',
      '{潮|しお}{硝子|がらす} の {海|うみ} を {後|あと} に して 、 {八百橋|やおばし} の {芝居小屋|しばいごや} を {訪|たず}ねた 。 {雪鈴|ゆきすず} で {冬|ふゆ} を {越|こ}し 、 {灯落|ひおち} と {雲路|くもじ} を {抜|ぬ}けた {先|さき} に 、 {静寂|しじま} の {書庫|しょこ} が あった 。',
      'From the sea at Saltglass to Manybridge\'s playhouses; then Snowbell, Lanternfall and the Cloudroad, and last of all the Still Archive.'],
  };
  const WAY = C.hallW10.WAY;
  const STS = ['st1', 'st2', 'st3', 'st4', 'st5', 'st6'];
  const NUMJ = ['{一|いち}', '{二|に}', '{三|さん}', '{四|よん}', '{五|ご}', '{六|ろく}'];
  const HOLDT = (k) => 'xp_hall_w10_f0_hold_' + k, SETT = (k) => 'xp_hall_w10_f0_set_' + k, STF = (st) => 'xp_hall_w10_f0_stone_' + st;
  const KEYS = Object.keys(PLACE);
  out += `
@scene hall.w10.t2_board
narr: {道|みち} の {脇|わき} の {道中記|どうちゅうき} 。 {旅|たび} の {順|じゅん} が {書|か}いて ある 。 || The road record by the wayside, setting down the order of a journey.
`;
  out += LV3((p, t, i) => `?(${P2(t, p)}) narr: 「 ${ROADREC[p][i]} 」 || "${ROADREC[p][3]}"\n`);
  out += `?(comp&!hall.w10.t2) comp: {札|ふだ} を 、 {通|とお}った {順|じゅん} に {道標|みちしるべ} へ {置|お}いて いこう 。 || Let's set the tablets on the waystones in the order we passed through.
`;
  for (const k of KEYS) out += `
@scene hall.w10.tab_${k}
!unset ${KEYS.map(HOLDT).join(' ')}
!set ${HOLDT(k)}
narr: 「 ${PLACE[k][0]} 」 の {札|ふだ} を {拾|ひろ}った 。 || You pick up the tablet: "${PLACE[k][1]}".
`;
  STS.forEach((st, n) => {
    out += `
@scene hall.w10.${st}
narr: {第|だい}${NUMJ[n]} の {道標|みちしるべ} 。 || The ${['first', 'second', 'third', 'fourth', 'fifth', 'sixth'][n]} waystone.
!if ${STF(st)} -> done
!if ${KEYS.map(HOLDT).join('|')} -> try
!end
:try
${[0, 1].map((p) => `!if hall.w10.pat=${p}&${HOLDT(WAY[p][n])} -> r_${WAY[p][n]}`).join('\n')}
narr: {札|ふだ} を {置|お}こう と して 、 {手|て} を {止|と}めた 。 ここ に {来|く}る の は 、 この {場所|ばしょ} で は ない 。 || You go to set the tablet down, and stop. This is not the place that comes here.
!end
`;
    for (const k of [...new Set([0, 1].map((p) => WAY[p][n]))]) out += `:r_${k}
narr: 「 ${PLACE[k][0]} 」 の {札|ふだ} を 、 {道標|みちしるべ} に {立|た}てた 。 || You set "${PLACE[k][1]}" on the waystone.
!unset ${HOLDT(k)}
!set ${SETT(k)} ${STF(st)}
!goto check
`;
    out += `:check
!if ${STS.map(STF).join('&')} -> all
!refresh
!end
:all
narr: {六|むっ}つ の {道標|みちしるべ} に 、 {六|むっ}つ の {名前|なまえ} 。 {振|ふ}り{返|かえ}る と 、 {来|き}た {道|みち} が {一本|いっぽん} に {繋|つな}がって {見|み}えた 。 || Six waystones, six names. Looking back, the road you came by shows as one unbroken line.
?(comp) comp: {一|ひと}つ {一|ひと}つ は {寄|よ}り{道|みち} みたい だった けど 、 {並|なら}べる と ちゃんと {道|みち} に なって いる ね 。 || Each one felt like a detour at the time, but laid out together they make a road.
${K.mark(W, 0, 't2')}
!end
:done
narr: {道標|みちしるべ} に 、 {札|ふだ} が {立|た}って いる 。 || A tablet stands on the waystone.
`;
  });

  // ---- t3: the keepers' practice slates --------------------------------------------------------------------------------------------
  const CE = {
    0: { F: ['Turn right and go straight on.', 'If it rains, I won\'t go.', 'I am Tanaka-sama. (calling yourself さま)', 'I eat after washing my face.'],
      E: ['I received a book from my teacher.', 'Even if it rains, I\'ll go.', 'It\'s wet outside the window. It seems it rained.', '"Shall we go for tea?" "Yes, let\'s not go."'],
      I: ['If you are going to be late, please tell us.', 'We had a promise, and yet they didn\'t come.', 'Thanks to the rain, the festival was called off.', 'The guest has arrived.'],
      A: ['I had my teacher read the letter.', 'According to the letter, they arrive tomorrow.', 'Let\'s talk about that matter (you know the one) tomorrow.', 'The master humbly looked at my work. (humble verb for the master)'] },
    1: { F: ['Please turn left.', 'This one, please.', 'I asked a stranger, "Oi, what\'s your name?"', 'I got up in the morning, and then I washed my face.'],
      E: ['A friend gave me a book.', 'Can I borrow this umbrella?', 'I hear it will rain tomorrow.', 'The teacher gave (outward) me a book. (あげる toward you)'],
      I: ['It is open every day except Sunday.', 'Pass me the red one.', 'I\'m tired, so I\'ll rest a little.', 'Tanaka-san wants to eat sushi. (たい for someone else)'],
      A: ['Then, with your leave, I will begin.', 'The doctor says it will soon get better.', 'Unless it rains, the festival will be held.', 'The former is red, the latter blue, and the third white. (前者 and 後者 for three)'] },
  };
  out += '\n@scene hall.w10.t3' + K.taskTrial({ w: W, k: 0, t: 't3',
    intro: ['narr: {古|ふる}い {灯守|ひもり} たち が {練習|れんしゅう} に {使|つか}った {石板|せきばん} 。 {九|ここの}つ の {話|はなし} の {教|おし}え が {刻|きざ}まれて いる 。 {端|はし} の {掛|か}け{軸|じく} に は 「 {一|ひと}つ だけ が {間違|まちが}って いる 。 」 と ある 。 || The slates the old keepers practised on, cut with the lessons of the nine tales. The scroll at the end reads: "One alone is wrong."'],
    task: { 0: 'hall.w10.counter0', 1: 'hall.w10.counter1' },
    after: ['narr: {間違|まちが}った {石板|せきばん} の {文字|もじ} が 、 {砂|すな} の よう に {崩|くず}れて {消|き}えた 。 || The letters on the wrong slate crumble away like sand.', '?(comp) comp: {全部|ぜんぶ} 、 どこ か で {一度|いちど} {習|なら}った こと だ 。 {忘|わす}れて ない もの だ ね 。 || Every one of them something we learned somewhere along the way. We haven\'t forgotten.'],
    later: 'narr: {石板|せきばん} を {一|ひと}つ ずつ {読|よ}んで から 、 また {来|こ}よう 。 || Read the slates one by one, then come back.',
    done: 'narr: {石板|せきばん} は 、 もう {何|なに} も {問|と}わない 。 || The slates ask nothing more.' });
  for (let i = 0; i < 4; i++) {
    out += `\n@scene hall.w10.card${i + 1}\nnarr: {古|ふる}い {石板|せきばん} 。 {言葉|ことば} が {刻|きざ}まれて いる 。 || An old slate, with a saying cut into it.\n`;
    out += LV((p, t) => `?(${both(L[t], 'hall.w10.pat=' + p)}) narr: 「 ${nest(C.hallW10Cards[p][t][i][0])} 」 || "${CE[p][t][i]}"\n`);
  }

  // ---- t4: the nine lanterns (each saying set by the lantern of the tale that taught it) ---------------------------------------------
  const SAY = {
    0: {
      s1: ['w1', 'まっすぐ いって 、 ふたつめ の かど を みぎ に まがって ください 。', 'まっすぐ {行|い}って 、 {二|ふた}つ{目|め} の {角|かど} を {右|みぎ} に {曲|ま}がって ください 。', 'この {道|みち} を {突|つ}き{当|あ}たり まで {行|い}って 、 {左|ひだり} に {折|お}れた {先|さき} です 。', 'Go straight on and turn right at the second corner.'],
      s2: ['w6', 'あめ が ふったら 、 まつり は ありません 。', '{雨|あめ} が {降|ふ}ったら 、 {祭|まつ}り は {中止|ちゅうし} です 。', '{雨|あめ} の {場合|ばあい} 、 {祭|まつ}り は {中止|ちゅうし} と する 。 ただし 、 {小雨|こさめ} なら {行|おこな}う 。', 'If it rains, the festival is off.'],
      s3: ['w8', 'となり の ひと が 、 ゆうべ きつね を みた そう だ 。', '{隣|となり} の {人|ひと} の {話|はなし} では 、 {昨夜|ゆうべ} {狐|きつね} が {出|で}た そう だ 。', '{隣|となり} の {人|ひと} に よる と 、 {昨夜|ゆうべ} {狐|きつね} が {出|で}た と の こと だ 。', 'The neighbours say a fox came by last night.'],
      s4: ['w9', 'おきゃくさま 、 どうぞ おはいり ください 。', 'お{客|きゃく}さま 、 どうぞ お{上|あ}がり ください 。', '{遠|とお}い {所|ところ} を 、 ようこそ お{越|こ}し くださいました 。', 'Please, honoured guest, come in.'],
      s5: ['w3', 'かお を あらって から 、 あさごはん を たべる 。', '{顔|かお} を {洗|あら}って から 、 {朝|あさ}ご{飯|はん} を {食|た}べる 。', '{日|ひ} が {昇|のぼ}る {前|まえ} に {水|みず} を {汲|く}み 、 それ から {火|ひ} を {起|お}こす 。', 'Wash your face, and then eat breakfast.'] },
    1: {
      s1: ['w2', 'おかあさん が わたし に かさ を くれた 。', '{母|はは} が {私|わたし} に {傘|かさ} を くれた 。', '{出|で}かける {時|とき} 、 {母|はは} が {私|わたし} に {傘|かさ} を {持|も}たせて くれた 。', 'My mother gave me an umbrella.'],
      s2: ['w4', 'この かさ を かりて も いい です か 。', 'この {傘|かさ} を {借|か}りて も いい です か 。', 'この {傘|かさ} 、 {明日|あした} まで {貸|か}して いただけません か 。', 'May I borrow this umbrella?'],
      s3: ['w5', 'あめ だった から 、 でかけなかった 。', '{雨|あめ} だった から 、 {出|で}かけなかった 。 でも 、 {楽|たの}しかった 。', '{雨|あめ} だった ので {出|で}かけなかった が 、 それ でも {楽|たの}しい {一日|いちにち} だった 。', 'It rained, so we stayed in. But it was a good day.'],
      s4: ['w7', '（ おちゃ 、 ） のむ ？ ―― うん 、 もらう 。', '（ お{茶|ちゃ} 、 ） {飲|の}む ？ ―― うん 、 もらう 。', '{例|れい} の 、 {持|も}って きた ？ ―― うん 、 {赤|あか}い の でしょ 。', '(Tea,) want some? ―― Yes, please.'],
      s5: ['w8', 'だれ か が きた みたい だ 。', '{誰|だれ} か が {来|き}た らしい 。', 'どう やら 、 {夜中|よなか} に {誰|だれ} か が {来|き}た よう だ 。', 'It seems someone came.'] },
  };
  const LAMPW = ['w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7', 'w8', 'w9'];
  const TITLE = { w1: ['{辻|つじ} の {灯籠|とうろう}', 'The Lamp at the Crossroads'], w2: ['{狐|きつね} の {嫁入|よめい}り', 'The Fox\'s Wedding'], w3: ['{夜明|よあ}け {前|まえ} の {鐘|かね}', 'The Bell Before Dawn'], w4: ['{借|か}りた {傘|かさ}', 'The Borrowed Umbrella'], w5: ['{二|ふた}つ の {井戸|いど}', 'The Two Wells'], w6: ['{変|か}わった {通行料|つうこうりょう}', 'The Toll That Changed'], w7: ['{覚|おぼ}えて いる {家|いえ}', 'The House That Remembers'], w8: ['{宿|やど} の {三人|さんにん} の {証人|しょうにん}', 'Three Witnesses at the Inn'], w9: ['{鶴|つる} の {恩返|おんがえ}し', 'The Crane\'s Return'] };
  const SLS = ['s1', 's2', 's3', 's4', 's5'];
  const HOLDS = (s) => 'xp_hall_w10_f1_hold_' + s, PUT = (s) => 'xp_hall_w10_f1_put_' + s;
  for (const sl of SLS) {
    out += `
@scene hall.w10.${sl}
narr: {床|ゆか} に 、 {言葉|ことば} が {一|ひと}つ {落|お}ちて いる 。 || A saying lies on the floor.
`;
    out += LV3((p, t, i) => `?(${P2(t, p)}) narr: 「 ${nest(SAY[p][sl][i + 1])} 」 || "${SAY[p][sl][4]}"\n`);
    out += `!unset ${SLS.map(HOLDS).join(' ')}
!set ${HOLDS(sl)}
narr: {言葉|ことば} を {拾|ひろ}った 。 どの {話|はなし} で {習|なら}った {言葉|ことば} だろう 。 || You pick it up. Which tale taught it?
`;
  }
  for (const w of LAMPW) {
    const ok = [0, 1].flatMap((p) => SLS.filter((sl) => SAY[p][sl][0] === w).map((sl) => [p, sl]));
    out += `
@scene hall.w10.to_${w}
narr: 「 ${TITLE[w][0]} 」 の {灯|ひ} 。 || The light of "${TITLE[w][1]}".
${ok.map(([p, sl]) => '!if hall.w10.pat=' + p + '&' + HOLDS(sl) + ' -> ok_' + sl + '_' + p).join('\n')}
!if ${SLS.map(HOLDS).join('|')} -> no
!end
:no
narr: {言葉|ことば} を {置|お}こう と して 、 {手|て} を {止|と}めた 。 この {話|はなし} で {習|なら}った {言葉|ことば} で は ない 。 || You go to set the saying down, and stop. This tale didn't teach it.
!end
`;
    for (const [p, sl] of ok) out += `:ok_${sl}_${p}
narr: {言葉|ことば} を 、 「 ${TITLE[w][0]} 」 の {灯|ひ} の {前|まえ} に {置|お}いた 。 {灯|ひ} が 、 {少|すこ}し {明|あか}るく なった 。 || You set the saying before the light of "${TITLE[w][1]}". The light grows a little brighter.
!unset ${HOLDS(sl)}
!set ${PUT(sl)}
!goto check
`;
    if (ok.length) out += `:check
!if ${SLS.map(PUT).join('&')} -> all
!refresh
!end
:all
narr: {五|いつ}つ の {言葉|ことば} が 、 それぞれ の {灯|ひ} の {前|まえ} に {収|おさ}まった 。 || The five sayings are each in place before their lights.
?(comp) comp: {道|みち} を {聞|き}く の も 、 {断|ことわ}る の も 、 {人|ひと} の {話|はなし} を {伝|つた}える の も 、 {全部|ぜんぶ} この {館|やかた} で {練習|れんしゅう} した ん だ ね 。 || Asking the way, saying no, passing on what someone said: we practised all of it in this Hall.
${K.mark(W, 1, 't4')}
!end
`;
  }

  // ---- t5: the moss lantern ------------------------------------------------------------------------------------------------------
  out += `
@scene hall.w10.t5
narr: {苔|こけ} {灯籠|どうろう} の {灯|ひ} が 、 {回廊|かいろう} の {隅|すみ} を {照|て}らして いる 。 {長|なが}い {間|あいだ} 、 ここ で {誰|だれ} か を {待|ま}って いた よう だ 。 || The moss lantern's light falls in the gallery's corner. It seems it has been waiting here a long time for someone.
${K.mark(W, 1, 't5')}
`;

  // ---- t6: the keepers' note and the hundredth wick (in your companion's hands; alone, Kohaku reads it) -----------------------------------
  const TOLD = {
    0: { F: 'ひゃくばんめ の とうしん は 、 いろり の そば の うるし の はこ の なか 。', E: '{百番目|ひゃくばんめ} の {灯芯|とうしん} は 、 {囲炉裏|いろり} の {側|そば} の {漆|うるし} の {箱|はこ} の {中|なか} に ある 。', I: '{百番目|ひゃくばんめ} の {灯芯|とうしん} は 、 {囲炉裏|いろり} の {側|そば} に {置|お}いた {漆|うるし} の {箱|はこ} に しまって ある 。', A: '{百番目|ひゃくばんめ} の {灯芯|とうしん} は 、 {炉端|ろばた} の {漆箱|うるしばこ} に {納|おさ}めて おく 。 {次|つぎ} に {百|ひゃく} を {語|かた}る {者|もの} の ため に 。', en: 'The keepers\' note: the hundredth wick is in the lacquer box by the hearth.' },
    1: { F: 'ひゃくばんめ の とうしん は 、 きた の かべ の たな の うえ 。', E: '{百番目|ひゃくばんめ} の {灯芯|とうしん} は 、 {北|きた} の {壁|かべ} の {棚|たな} の {上|うえ} に ある 。', I: '{百番目|ひゃくばんめ} の {灯芯|とうしん} は 、 {北|きた} の {壁|かべ} の {棚|たな} に {上|あ}げて ある 。', A: '{百番目|ひゃくばんめ} の {灯芯|とうしん} は 、 {北壁|きたかべ} の {棚|たな} に {上|あ}げて おく 。 {次|つぎ} に {百|ひゃく} を {語|かた}る {者|もの} の ため に 。', en: 'The keepers\' note: the hundredth wick is on the shelf on the north wall.' },
  };
  out += `
@scene hall.w10.t6
!if hall.w10.t6 -> done
!if xp_hall_w10_f1_asked -> told
narr: {古|ふる}い {書|か}き{付|つ}け 。 {灯守|ひもり} の {昔|むかし} の {書|か}き{方|かた} で 、 {細|こま}かい {字|じ} が {並|なら}んで いる 。 || An old note, in the keepers' old hand, the writing small and close.
?(comp=nao) comp: {古|ふる}い {字|じ} は 、 {宛名|あてな} で {見|み}{慣|な}れて いる 。 {任|まか}せて 。 {何|なに} が {知|し}りたい ？ || I'm used to old writing from addresses. Leave it to me. What do you want to know?
?(comp=mio) comp: {古|ふる}い {薬|くすり} の {覚|おぼ}え{書|が}き と {同|おな}じ {書|か}き{方|かた} ね 。 {読|よ}める わ 。 {何|なに} を {探|さが}す ？ || Same hand as old remedy notes. I can read it. What are we looking for?
?(comp=ren) comp: {灯守|ひもり} の {書|か}き{方|かた} です 。 {私|わたし} が {読|よ}みましょう 。 {何|なに} を {知|し}りたい です か ？ || That's the keepers' hand. I'll read it. What would you like to know?
?(comp=suzu) comp: {古|ふる}い {台本|だいほん} の {字|じ} に {似|に}て いる わ 。 {読|よ}んで あげる 。 {何|なに} が {知|し}りたい ？ || It looks like the writing in old scripts. I'll read it for you. What do you want to know?
?(!comp) hall_kohaku: {師匠|ししょう} の {字|じ} です 。 {私|わたし} が {読|よ}みます 。 {何|なに} が {知|し}りたい です か ？ || That's my master's hand. I'll read it. What would you like to know?
!hook hall_challenge hall.w10.ask
!if var._res=0 -> later
!set xp_hall_w10_f1_asked
:told
`;
  out += LV((p, t) => `?(${both(L[t], 'hall.w10.pat=' + p)}) narr: 「 ${TOLD[p][t]} 」 || "${TOLD[p].en}"\n`);
  out += `!end
:later
narr: {書|か}き{付|つ}け を 、 {元|もと} の {所|ところ} に {戻|もど}した 。 || You put the note back where it was.
!end
:done
narr: {書|か}き{付|つ}け は 、 {畳|たた}んで しまって ある 。 || The note has been folded and put away.
`;
  const SPOT = { box: ['{囲炉裏|いろり} の {側|そば} の {漆|うるし} の {箱|はこ}', 'the lacquer box by the hearth', 0], shelf: ['{北|きた} の {壁|かべ} の {棚|たな}', 'the shelf on the north wall', 1], altar: ['{小|ちい}さな {祠|ほこら}', 'a little shrine', -1] };
  for (const k of Object.keys(SPOT)) {
    out += `
@scene hall.w10.k_${k}
!if hall.w10.t6 -> done
narr: ${SPOT[k][0]} 。 || ${cap(SPOT[k][1])}.
!if !xp_hall_w10_f1_asked -> unknown
${SPOT[k][2] >= 0 ? '!if hall.w10.pat=' + SPOT[k][2] + ' -> right\n' : ''}narr: {灯芯|とうしん} は 、 ここ に は ない よう だ 。 || The wick doesn't seem to be here.
?(comp) comp: {書|か}き{付|つ}け の {言葉|ことば} 、 もう {一度|いちど} {言|い}おう か ？ || Shall I say what the note said again?
!end
${SPOT[k][2] >= 0 ? `:right
narr: {古|ふる}い {灯芯|とうしん} が {一本|いっぽん} 、 {紙|かみ} に {包|つつ}まれて いた 。 {包|つつ}み に は 「 {次|つぎ} の {人|ひと} へ 」 と {書|か}いて ある 。 || One old wick, wrapped in paper. On the wrapping: "For the next one."
?(comp) comp: {止|や}めた {人|ひと} たち が 、 {続|つづ}き を {待|ま}って いた ん だ ね 。 || The ones who stopped were waiting for someone to go on.
${K.mark(W, 1, 't6')}
!end
` : ''}:unknown
narr: {灯芯|とうしん} が どこ に ある の か 、 まだ {分|わ}からない 。 {先|さき} に {書|か}き{付|つ}け を {読|よ}もう 。 || You don't know yet where the wick is. Read the note first.
!end
:done
narr: ${SPOT[k][0]} 。 {灯芯|とうしん} は 、 もう {手|て} の {中|なか} に ある 。 || ${cap(SPOT[k][1])}. The wick is already in your hands.
`;
  }

  // ---- t7: the riddle stone ----------------------------------------------------------------------------------------------------
  out += '\n@scene hall.w10.t7' + K.taskTrial({ w: W, k: 1, t: 't7',
    intro: ['narr: {庭|にわ} の {石|いし} に 、 {字|じ} が {彫|ほ}って ある 。 「 {解|と}けた {者|もの} は 、 {一度|いちど} だけ 、 {帰|かえ}って また {来|く}る こと が できる 。 」 || Words cut into a stone in the garden: "Whoever solves this may once go home and come back."'],
    task: 'hall.w10.riddle',
    after: ['narr: {石|いし} の {表|おもて} の {苔|こけ} が 、 ふわり と {光|ひか}った 。 || The moss on the stone glows softly.'],
    later: 'narr: {答|こた}え は 、 {急|いそ}がなくて いい 。 || There\'s no hurry for the answer.',
    done: 'narr: {石|いし} は 、 {答|こた}え を {覚|おぼ}えて いる 。 || The stone remembers the answer.' });

  // ---- t8: the unwritten pages (each given the one word it is missing) -----------------------------------------------------------------
  // [blank sentence by level, options by level (right first), English, why]; the options are shown in each page's order
  const PG = {
    0: {
      pg1: [{ EF: 'あしのせ ［ 　 ］ でて 、 ながい たび が はじまった 。', E: '{葦|あし}ノ{瀬|せ} ［ 　 ］ {出|で}て 、 {長|なが}い {旅|たび} が {始|はじ}まった 。', IA: '{生|う}まれ{育|そだ}った {葦|あし}ノ{瀬|せ} ［ 　 ］ {後|あと} に して 、 {長|なが}い {旅|たび} が {始|はじ}まった 。' },
        { EF: ['を', 'に', 'で'], E: ['を', 'に', 'で'], IA: ['を', 'に', 'が'] }, 'I left Reedwake, and the long journey began.', 'Leaving a place takes を: {葦|あし}ノ{瀬|せ} を {出|で}る.'],
      pg2: [{ EF: 'ことば が きえて いた ［ 　 ］ 、 なまえ を ひとつずつ よびもどした 。', E: '{言葉|ことば} が {消|き}えて いた ［ 　 ］ 、 {名前|なまえ} を {一|ひと}つ ずつ {呼|よ}び{戻|もど}した 。', IA: '{言葉|ことば} が {消|き}えて いた ［ 　 ］ こそ 、 {名前|なまえ} を {一|ひと}つ ずつ {呼|よ}び{戻|もど}した 。' },
        { EF: ['から', 'のに', 'ても'], E: ['から', 'のに', 'ても'], IA: ['から', 'のに', 'ので'] }, 'Because words were vanishing, I called the names back one by one.', 'The second half follows from the first: a reason (から; with こそ, からこそ: "that is exactly why").'],
      pg3: [{ EF: 'こわかった ［ 　 ］ 、 いちど も ひきかえさなかった 。', E: '{怖|こわ}かった ［ 　 ］ 、 {一度|いちど} も {引|ひ}き{返|かえ}さなかった 。', IA: '{怖|こわ}かった ［ 　 ］ 、 {一度|いちど} も {引|ひ}き{返|かえ}さなかった 。' },
        { EF: ['けれど', 'から', 'ので'], E: ['けれど', 'から', 'ので'], IA: ['ものの', 'ので', 'ために'] }, 'I was afraid, but I never once turned back.', 'Afraid, and yet not turning back: a contrast (けれど; at the top, ものの).'],
      pg4: [{ EF: 'さいご の ひ が もどった ［ 　 ］ 、 みんな で そら を みあげた 。', E: '{最後|さいご} の {灯|ひ} が {戻|もど}った ［ 　 ］ 、 {皆|みな} で {空|そら} を {見上|みあ}げた 。', IA: '{最後|さいご} の {灯|ひ} が {戻|もど}った ［ 　 ］ 、 {皆|みな} で {空|そら} を {見上|みあ}げた 。' },
        { EF: ['とき', 'まで', 'ながら'], E: ['とき', 'まで', 'ながら'], IA: ['とたん', 'まで', 'ながら'] }, 'When the last light came back, we all looked up at the sky.', 'One moment and what happened at it: とき (at the top, とたん, "the instant").'] },
    1: {
      pg1: [{ EF: 'たび の とちゅう 、 なかま ［ 　 ］ であった 。', E: '{旅|たび} の {途中|とちゅう} 、 {仲間|なかま} ［ 　 ］ {出会|であ}った 。', IA: '{旅|たび} の {途中|とちゅう} 、 {生涯|しょうがい} の {仲間|なかま} ［ 　 ］ {巡|めぐ}り{会|あ}った 。' },
        { EF: ['に', 'を', 'へ'], E: ['に', 'を', 'へ'], IA: ['に', 'を', 'へ'] }, 'Along the way, I met a companion.', 'You meet someone に: {仲間|なかま} に {出会|であ}う.'],
      pg2: [{ EF: 'みち が わからなかった ［ 　 ］ 、 ひと に きいた 。', E: '{道|みち} が {分|わ}からなかった ［ 　 ］ 、 {人|ひと} に {聞|き}いた 。', IA: '{道|みち} が {分|わ}からなかった ［ 　 ］ 、 {土地|とち} の {人|ひと} に {尋|たず}ねた 。' },
        { EF: ['ので', 'のに', 'ても'], E: ['ので', 'のに', 'ても'], IA: ['ため', 'のに', 'ながら'] }, 'I didn\'t know the way, so I asked someone.', 'Not knowing the way is why you asked: a reason (ので; ため in writing).'],
      pg3: [{ EF: 'あめ が ふって ［ 　 ］ 、 あるきつづけた 。', E: '{雨|あめ} が {降|ふ}って ［ 　 ］ 、 {歩|ある}き{続|つづ}けた 。', IA: '{雨|あめ} に {降|ふ}られて ［ 　 ］ 、 {歩|ある}き{続|つづ}けた 。' },
        { EF: ['も', 'ば', 'で'], E: ['も', 'ば', 'で'], IA: ['も', 'ば', 'で'] }, 'Even in the rain, I kept walking.', 'Even if it rains: ～ても.'],
      pg4: [{ EF: 'ぜんぶ の ひ が もどる ［ 　 ］ 、 たび は おわらなかった 。', E: '{全部|ぜんぶ} の {灯|ひ} が {戻|もど}る ［ 　 ］ 、 {旅|たび} は {終|お}わらなかった 。', IA: '{全|すべ}て の {灯|ひ} が {戻|もど}る ［ 　 ］ 、 {旅|たび} は {終|お}わらなかった 。' },
        { EF: ['まで', 'ながら', 'たり'], E: ['まで', 'ながら', 'たり'], IA: ['まで', 'ながら', 'ついでに'] }, 'Until every light came back, the journey did not end.', 'Until a moment: まで.'] },
  };
  // the position of the right word among the three, by page (so that it is never always first)
  const SPOTR = { pg1: 1, pg2: 0, pg3: 2, pg4: 1 };
  const PGS = ['pg1', 'pg2', 'pg3', 'pg4'];
  const PGF = (pg) => 'xp_hall_w10_f2_page_' + pg;
  PGS.forEach((pg, n) => {
    out += `
@scene hall.w10.${pg}
!if ${PGF(pg)} -> done
${n > 0 ? `!if !${PGF(PGS[n - 1])} -> early\n` : ''}narr: {百話目|ひゃくわめ} の {話|はなし} の {頁|ページ} 。 {言葉|ことば} が {一|ひと}つ {欠|か}けて いる 。 || A page of the hundredth tale, one word missing.
`;
    for (const p of [0, 1]) for (const t of LVS) out += `?(${P2(t, p)}) narr: 「 ${PG[p][pg][0][t]} 」 || "${PG[p][pg][2]}"\n`;
    out += '!choice\n';
    for (const p of [0, 1]) for (const t of LVS) {
      const words = PG[p][pg][1][t];
      const order = [1, 2]; order.splice(SPOTR[pg], 0, 0);
      for (const i of order) out += `* [${P2(t, p)}] ${words[i]} || ${words[i]} -> ${i === 0 ? 'right' : 'wrong'}\n`;
    }
    out += `:right
narr: {言葉|ことば} が {頁|ページ} に {収|おさ}まって 、 {墨|すみ} が {乾|かわ}いた 。 || The word settles into the page, and the ink dries.
!set ${PGF(pg)}
${n === PGS.length - 1 ? `narr: {四|よっ}つ の {頁|ページ} が 、 {一|ひと}つ の {話|はなし} に なった 。 || Four pages make one tale.
?(comp) comp: {自分|じぶん} の {旅|たび} を 、 {自分|じぶん} の {言葉|ことば} で {書|か}く 。 …… {最初|さいしょ} の {頃|ころ} は 、 {考|かんが}えられなかった ね 。 || Writing your own journey in your own words. …Back at the start, you couldn't have imagined it.
${K.mark(W, 2, 't8')}
` : '!refresh\n'}!end
:wrong
narr: {頁|ページ} が 、 その {言葉|ことば} を {受|う}け{付|つ}けない 。 || The page won't take that word.
`;
    for (const p of [0, 1]) out += `?(hall.w10.pat=${p}) narr: もう {一度|いちど} 、 {前後|ぜんご} の {言葉|ことば} を {読|よ}もう 。 || ${PG[p][pg][3].replace(/\{([^|}]+)\|[^}]*\}/g, '$1')}\n`;
    out += `!end
${n > 0 ? `:early
narr: {前|まえ} の {頁|ページ} が 、 まだ {白|しろ}い まま だ 。 {話|はなし} は {順|じゅん} に {書|か}こう 。 || The page before is still blank. Write the tale in order.
!end
` : ''}:done
narr: この {頁|ページ} は 、 もう {書|か}けて いる 。 || This page is already written.
`;
  });

  // ---- t9: Sōan and Kohaku ------------------------------------------------------------------------------------------------------
  out += `
@scene hall.w10.t9
!if hall.w10.t9 -> after
!if !hall.w10.t8 -> wait
hall_soan: {百話目|ひゃくわめ} は 、 {語|かた}らん 。 {九十九|きゅうじゅうきゅう} で {終|お}わり だ 。 || The hundredth will not be told. Ninety-nine is the end.
hall_kohaku: {師匠|ししょう} 、 {頁|ページ} は もう {書|か}けて います 。 {語|かた}らせて ください 。 || Master, the pages are written. Let it be told.
!encounter hall.w10.vigil
!if var._enc=together -> together
narr: ソウアン は 、 {灯|ひ} を {一|ひと}つ {持|も}って 、 {廊下|ろうか} の {奥|おく} へ {行|い}って しまった 。 コハク は 、 {暗|くら}い {灯|ひ} の {前|まえ} に {座|すわ}って いる 。 || Sōan has taken a lamp and gone to the far end of the corridor. Kohaku sits before the dark light.
!end
:together
hall_soan: …… {二人|ふたり} で 、 {語|かた}ろう 。 {語|かた}り{終|お}えたら 、 {同|おな}じ {道|みち} を {帰|かえ}れば よい 。 || …We'll tell it together. And when it's told, we'll walk home the same way.
hall_kohaku: はい 、 {師匠|ししょう} 。 || Yes, master.
${K.mark(W, 2, 't9')}
!end
:wait
narr: {二人|ふたり} は 、 {百話目|ひゃくわめ} の {頁|ページ} が {書|か}き{上|あ}がる の を {待|ま}って いる 。 || The two of them are waiting for the hundredth tale's pages to be written.
!end
:after
hall_kohaku: {終|お}わる の が {怖|こわ}い の は 、 {大事|だいじ} だった から です ね 。 || If an ending frightens you, it's because it mattered.

@scene hall.w10.t10
!if hall.w10.t10 -> after
!if !hall.w10.t8 -> wait
!if !hall.w10.t9 -> wait
narr: {百番目|ひゃくばんめ} の {灯|ひ} に 、 {見|み}つけた {灯芯|とうしん} を {差|さ}した 。 ソウアン と コハク が 、 {両側|りょうがわ} に {座|すわ}る 。 || You set the wick you found in the hundredth lantern. Sōan and Kohaku sit down on either side.
hall_soan: さて 、 {語|かた}り{手|て} 。 {百話目|ひゃくわめ} は 、 あんた の {話|はなし} だ 。 || Well then, teller. The hundredth tale is yours.
!encounter hall.w10.tale
!if var._res=0 -> later
!set xp_hall_w10_f2_t10
!hook hall_trial w10 t10
!if var._res=1 -> finale
!refresh
!end
:finale
!call hall.w10.end
!end
:wait
narr: {百番目|ひゃくばんめ} の {灯|ひ} は 、 まだ {暗|くら}い 。 || The hundredth lantern is still dark.
?(!hall.w10.t8) narr: {百話目|ひゃくわめ} の {頁|ページ} が 、 まだ {白紙|はくし} の まま だ 。 || The hundredth tale's pages are still blank.
?(!hall.w10.t9) narr: ソウアン と コハク が 、 まだ {心|こころ} を {決|き}めて いない 。 || Sōan and Kohaku have not made up their minds.
!end
:later
narr: {二人|ふたり} は 、 {話|はなし} の {続|つづ}き を {待|ま}って いる 。 || The two of them wait for the rest of the tale.
!end
:after
narr: {百番目|ひゃくばんめ} の {灯|ひ} が 、 {静|しず}か に {燃|も}えて いる 。 || The hundredth lantern burns quietly.

@scene hall.w10.end
narr: {百番目|ひゃくばんめ} の {灯|ひ} が 、 {静|しず}か に {燃|も}え{上|あ}がった 。 {館|やかた} じゅう の {灯|ひ} が 、 {一斉|いっせい} に {明|あか}るく なる 。 || The hundredth lantern flames up quietly. Every light in the Hall brightens at once.
narr: {百話目|ひゃくわめ} の {後|あと} に は 、 {何|なに} か が {現|あらわ}れる と いう 。 {壁|かべ} に {映|うつ}った の は 、 {話|はなし} を {語|かた}り{終|お}えた $name の {影|かげ} だった 。 || They say something appears after the hundredth tale. What appears on the wall is the shadow of $name, the teller, the tale told.
hall_soan: そう か 。 {現|あらわ}れる の は 、 {語|かた}り{手|て} {自身|じしん} だった か 。 || So. What appears is the teller.
hall_kohaku: {師匠|ししょう} 、 {一緒|いっしょ} に {帰|かえ}りましょう 。 || Master, let's go home together.
?(comp=nao) comp: {百話|ひゃくわ} 、 {全部|ぜんぶ} {届|とど}いた な 。 …… {次|つぎ} は 、 {自分|じぶん} たち の {話|はなし} を {誰|だれ} か に {届|とど}ける {番|ばん} だ 。 || A hundred tales, all delivered. …Now it's our turn to carry our own to someone.
?(comp=mio) comp[happy]: {初|はじ}め は 、 {看板|かんばん} も {読|よ}めなかった のに ね 。 {今|いま} は 、 {百|ひゃく} の {話|はなし} を {読|よ}んだ わ 。 || At the start you couldn't read a shop sign. Now you've read a hundred tales.
?(comp=ren) comp: {百|ひゃく} の {灯|ひ} が 、 {全部|ぜんぶ} {戻|もど}りました 。 …… ウシオ に も 、 {見|み}せたかった です 。 || All hundred lights are back. …I wish Ushio could have seen it.
?(comp=suzu) comp: {百幕|ひゃくまく} 、 {大入|おおい}り {満員|まんいん} 。 …… いい {芝居|しばい} だった わ 。 || A hundred acts, a full house. …A fine show.
?(!comp) narr: {一人|ひとり} で {語|かた}った {話|はなし} だ が 、 {聞|き}いて いた {者|もの} は {大勢|おおぜい} いた 。 || You told it alone, but a great many were listening.
narr: {灯|ひ} の {光|ひかり} が {畳|たた}まれる よう に {薄|うす}れて 、 {気|き}が {付|つ}く と 、 {館|やかた} の {囲炉裏|いろり} の {前|まえ} に いた 。 || The lantern light folds away, and when you look up you are by the hall's hearth.
!set hall_w10_done
!hook hall_finish
!call hall.tsuru_final

@scene hall.tsuru_final
!if hall_tsuru_final -> again
narr: {十番目|じゅうばんめ} の {囲炉裏|いろり} の {前|まえ} に 、 {小|ちい}さな {人影|ひとかげ} が {座|すわ}って いる 。 || Someone small is sitting by the tenth hearth.
tsuru: おや 、 {終|お}わった かい 。 {待|ま}ちくたびれた よ 。 || Oh, finished, have you? I got tired of waiting.
tsuru: {足|あし} が {動|うご}く うち に 、 {一度|いちど} ここ に {来|き}て みたくて ね 。 {雲路|くもじ} の {人|ひと} たち に 、 {手|て} を {引|ひ}いて もらった よ 。 || I wanted to see this place once while my legs still work. The Cloudroad folk helped me up the hill.
tsuru: {師匠|ししょう} の {師匠|ししょう} の {後|あと} 、 {百|ひゃく} を {語|かた}り{終|お}えた の は 、 あんた が {初|はじ}めて だ 。 || After my teacher's teacher, you're the first to finish the Hundred.
tsuru: で 、 {百話目|ひゃくわめ} の {後|あと} に は 、 {何|なに} が {出|で}た ん だい ？ || So. What appeared after the hundredth?
!choice
* {自分|じぶん} の {影|かげ} でした 。 || My own shadow. -> shadow
* {何|なに} も 。 {灯|ひ} が {明|あか}るく なった だけ です 。 || Nothing. The lights only grew brighter. -> nothing
:shadow
tsuru: そう かい 。 {師匠|ししょう} も 、 {同|おな}じ こと を {言|い}って いた よ 。 || Is that so. My teacher said the same.
!goto after
:nothing
tsuru: ふふ 。 それ を {見|み}た の は 、 あんた {自身|じしん} だろう に 。 || Heh. And who was it saw that, if not you?
:after
tsuru: {九番目|きゅうばんめ} の {話|はなし} は 、 {鶴|つる} だった だろう 。 …… {照|て}れくさい ね 。 || The ninth tale was the crane, wasn't it. …Makes me blush.
tsuru: これ を {持|も}って お{行|ゆ}き 。 {館|やかた} の {最後|さいご} の {提灯|ちょうちん} だ 。 {灯|ひ} は 、 {持|も}つ {者|もの} が {変|か}わって も 、 {消|き}えない もの さ 。 || Take this with you. The Hall's last lantern. A light doesn't go out just because it changes hands.
!give hall_lantern
narr: 「 {百|ひゃく} の {灯|ひ} の {提灯|ちょうちん} 」 を {受|う}け{取|と}った 。 || You receive the Lantern of the Hundred.
?(comp=nao) comp: {帰|かえ}り の {道|みち} は {任|まか}せて 。 {近道|ちかみち} なら 、 {全部|ぜんぶ} {頭|あたま} に {入|はい}って いる 。 || Leave the way home to me. I know every short cut.
?(comp=mio) comp: ツル さん 、 {膝|ひざ} に {効|き}く {薬|くすり} 、 {持|も}って きて います よ 。 || Keeper Tsuru, I've brought something for your knees.
?(comp=ren) comp: ツル さん 、 {帰|かえ}り は {私|わたし} が お{送|おく}り します 。 {今度|こんど} は 、 {道|みち} を {間違|まちが}えません 。 || Keeper Tsuru, I'll see you home. I won't take a wrong turn this time.
?(comp=suzu) comp: ツル さん 、 {帰|かえ}り の {道中|どうちゅう} 、 {退屈|たいくつ} は させません よ 。 || Keeper Tsuru, I won't let you be bored on the way home.
tsuru: さあ 、 {帰|かえ}ろう か 。 {葦|あし}ノ{瀬|せ} の {灯|ひ} も 、 そろそろ {替|か}え{時|どき} だ 。 || Well, shall we head home. Reedwake's lanterns are about due for changing.
!set hall_tsuru_final
!end
:again
tsuru: {百|ひゃく} の {灯|ひ} が {点|とも}って いる と 、 {館|やかた} も {若|わか}く {見|み}える ね 。 || With a hundred lights lit, even the Hall looks young again.
`;

  RB.script.add(out);
})(RB.content);
