/* The Hall of a Hundred Tales, wing 6, The Toll That Changed: the scenes (expansion P15; plan 04_DUNGEONS.md D9; maps in
 * 26_w6_maps.js, tasks and encounters in 27_w6_learning.js). Each trial sets its floor's own flag and tells the Hall;
 * what a trial shows follows the level its task is set at (the profile, or one up on the Grow route); the pattern
 * (hall.w6.pat) chooses the travellers' circumstances, the lantern rule, the ledger's night rule and the help board's
 * cases. Kihei and Hanbei he/him, Ibuki and Kōun they/them, Ofuku, Momo and Otsuta she/her. Suzu's lines have Kansai
 * versions (src/content/dialect/kansai_99_hall.js). */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const K = C.hallKit, W = 'w6', L = K.lv(W), both = L.both;
  const TALE = C.hallW6Tale, FT = C.hallW6TaleF;
  const nest = (x) => x.replace(/「/g, '『').replace(/」/g, '』');
  const LV = (fn) => [0, 1].flatMap((p) => ['F', 'E', 'I', 'A'].map((t) => fn(p, t))).join('');
  const LV3 = (fn) => [0, 1].flatMap((p) => [['EF', 0], ['E', 1], ['IA', 2]].map(([t, i]) => fn(p, t, i))).join('');
  const LVN = (fn) => ['F', 'E', 'I', 'A'].map((t) => fn(t)).join('');
  const LVN3 = (fn) => [['EF', 0], ['E', 1], ['IA', 2]].map(([t, i]) => fn(t, i)).join('');
  let out = `
@scene hall.w6.f1_first
!set hall_w6_f1_seen
narr: {紙|かみ} の {戸|と} を {抜|ぬ}ける と 、 {秋|あき} の {峠|とうげ} の {麓|ふもと} だった 。 {紅葉|もみじ} の {下|した} に 、 {古|ふる}い {関所|せきしょ} が ある 。 || Through the paper screen: the foot of a mountain pass in autumn. Under the maples stands an old toll gate.
?(comp=nao) comp: {関所|せきしょ} は 、 {何度|なんど} も {通|とお}った 。 {毎回|まいかい} 、 {決|き}まり が {少|すこ}し ずつ {違|ちが}う ん だ 。 || I've been through plenty of barriers. The rules are a little different every time.
?(comp=mio) comp: {通行料|つうこうりょう} 、 ね 。 {薬|くすり} の {行商|ぎょうしょう} の {人|ひと} たち は 、 {関所|せきしょ} の {話|はなし} ばかり して いた わ 。 || Tolls. The travelling medicine sellers never talked about anything but barriers.
?(comp=ren) comp: {関守|せきもり} も 、 {灯守|ひもり} と {同|おな}じ です 。 {決|き}まり を {守|まも}る の が 、 {仕事|しごと} です 。 || A barrier keeper is like a lamp-keeper. Keeping the rules is the job.
?(comp=suzu) comp: {第|だい}{六幕|ろくまく} は 、 {関所|せきしょ} の {場|ば} ね 。 {関所|せきしょ} の {芝居|しばい} に は 、 {名場面|めいばめん} が {多|おお}い の よ 。 || Act six: the barrier scene. Barrier plays are full of famous scenes.
?(!comp) narr: {冷|つめ}たい {風|かぜ} が 、 {峠|とうげ} から {吹|ふ}き{下|お}ろして くる 。 || A cold wind blows down off the pass.

@scene hall.w6.f2_first
!set hall_w6_f2_seen
narr: {峠|とうげ} の {道|みち} は 、 {夕暮|ゆうぐ}れ の {中|なか} を {上|のぼ}って いく 。 {道|みち} に {沿|そ}って 、 {火|ひ} の {入|はい}って いない {灯籠|とうろう} が {並|なら}んで いる 。 || The road climbs the pass into the dusk. Along it stand stone lanterns, none of them lit.
?(comp) comp: {暗|くら}く なる {前|まえ} に 、 {灯籠|とうろう} を {灯|とも}さない と 。 でも 、 {決|き}まり が ある みたい だ ね 。 || We should light the lanterns before it's dark. But there seems to be a rule.

@scene hall.w6.f3_first
!set hall_w6_f3_seen
narr: {峠|とうげ} の {上|うえ} の {門|もん} 。 {日|ひ} が {沈|しず}んで 、 {鐘|かね} が {鳴|な}った 。 {門|もん} の {前|まえ} に 、 {赤|あか}ん{坊|ぼう} を {抱|だ}いた {女|おんな} の {人|ひと} が {立|た}って いる 。 || The gate at the top of the pass. The sun has set and the bell has rung. Before the gate stands a woman with a baby in her arms.
?(comp=nao) comp: …… {急|いそ}ぎ の {用|よう} が ある {顔|かお} だ 。 || …That's the face of someone with an urgent errand.
?(comp=mio) comp: あの {子|こ} 、 {熱|ねつ} が ある わ 。 {顔|かお} が {赤|あか}い 。 || That baby has a fever. Look how flushed it is.
?(comp=ren) comp: {鐘|かね} の {後|あと} の {門|もん} 。 {関守|せきもり} に とって 、 {一番|いちばん} {難|むずか}しい {時間|じかん} です 。 || The gate after the bell: the hardest hour for a keeper.
?(comp=suzu) comp: {幕|まく} が {上|あ}がる と 、 {門|もん} の {前|まえ} に {母|はは} と {子|こ} 。 {泣|な}かせる {場面|ばめん} の {始|はじ}まり よ 。 || Curtain up on a mother and child before the gate. The start of a tear-jerker.

@scene hall.w6.bench1
!hook hall_station w6_b1

@scene hall.w6.bench2
!hook hall_station w6_b2

@scene hall.w6.bench3
!hook hall_station w6_b3

@scene hall.w6.spring
narr: {峠|とうげ} の {途中|とちゅう} の {湧|わ}き{水|みず} 。 {落|お}ち{葉|ば} が {一枚|いちまい} 、 {浮|う}かんで いる 。 || A spring partway up the pass, a single fallen leaf floating on it.
!hook hall_station w6_sp

@scene hall.w6.kihei
!faceplayer hall_kihei
!if hall.w6.t1 -> after
hall_kihei: {腰|こし} を {痛|いた}めて な 。 {関所|せきしょ} は 、 イブキ に {任|まか}せて ある 。 …… {真面目|まじめ} すぎる の が 、 {玉|たま} に {瑕|きず} じゃ が な 。 || I've done my back in. I've left the gate to Ibuki. …Too conscientious by half, that one.
!end
:after
hall_kihei: {絵|え} の {通|とお}り じゃ 。 {札|ふだ} は 、 {増|ふ}える {一方|いっぽう} で な 。 || Just like the pictures. The board only ever grows.

@scene hall.w6.ibuki
!faceplayer hall_ibuki
!if hall.w6.t2 -> done
hall_ibuki: キヘエ さん の {代|か}わり に 、 {関所|せきしょ} を {守|まも}って いる 。 {札|ふだ} の {決|き}まり の {通|とお}り に 、 {一人|ひとり} ずつ {木札|きふだ} を {渡|わた}して 。 {箱|はこ} は そこ 。 || I'm keeping the gate in Kihei's place. Give each traveller the wooden tag the board says they owe. The box is there.
?(comp) comp: {札|ふだ} の {決|き}まり 、 {先|さき} に {読|よ}もう 。 {例外|れいがい} が {多|おお}そう だ 。 || Let's read the board first. Looks like lots of exceptions.
!end
:done
hall_ibuki: {全部|ぜんぶ} 、 {札|ふだ} の {通|とお}り 。 {間違|まちが}い は ない 。 …… キヘエ さん が {戻|もど}る まで 、 {間違|まちが}えられない ん だ 。 || All by the board. No mistakes. …I can't make any, till Kihei's back.

@scene hall.w6.ibuki2
!faceplayer hall_ibuki2
hall_ibuki: {灯籠|とうろう} の {決|き}まり は 、 {柱|はしら} の {札|ふだ} に ある 。 {夜|よる} の {決|き}まり は 、 キヘエ さん の {帳面|ちょうめん} に 。 {小屋|こや} の {机|つくえ} の {上|うえ} だ 。 || The lantern rule is on the board on the post. The night rules are in Kihei's ledger, on the desk in the hut.
`;

  // ---- t1: the story room ----------------------------------------------------------------------------------------------
  const E_PANELS = [TALE.P1, TALE.P2, TALE.P3, TALE.P4].map(nest);
  const F_PANELS = FT.map(nest);
  const PANEL_EN = ['Long ago the toll at the pass was one mon, for anyone at all.', 'One rainy day the keeper added a rule: "In rain, you may pay on the way back."', 'Every year the rules grew, until the board was full of "however" and "if".', 'Only the last rule was written nowhere at all.'];
  out += '\n@scene hall.w6.t1' + K.taskTrial({ w: W, k: 0, t: 't1',
    intro: ['narr: キヘエ の {部屋|へや} の {壁|かべ} に 、 {絵巻|えまき} が {掛|か}けて ある 。 || A picture scroll hangs on the wall of Kihei\'s room.']
      .concat(...[0, 1, 2, 3].map((i) => ['?(' + L.EF + ') narr: 「 ' + F_PANELS[i] + ' 。 」 || "' + PANEL_EN[i] + '"', '?(' + L.NOTF + ') narr: 「 ' + E_PANELS[i] + ' 。 」 || "' + PANEL_EN[i] + '"']),
      ['narr: {峠|とうげ} の {風|かぜ} が {吹|ふ}き{込|こ}んで 、 {絵|え} の {順番|じゅんばん} が {乱|みだ}れた 。 || A gust off the pass blows in, and the pictures slip out of order.']),
    task: 'hall.w6.story',
    after: ['narr: {絵巻|えまき} が 、 {元|もと} の {順番|じゅんばん} に {戻|もど}った 。 || The scroll is back in its order.', '!challenge hall.w6.story_q',
      '?(comp=nao) comp: {決|き}まり が {増|ふ}えた {数|かず} だけ 、 {困|こま}った {人|ひと} が {来|き}た ん だ 。 {悪|わる}い こと じゃ ない 。 || Every rule added is someone in trouble who came by. That\'s no bad thing.',
      '?(comp=mio) comp: 「 ただし 」 の {一|ひと}つ {一|ひと}つ に 、 {誰|だれ} か の {雨|あめ} の {日|ひ} が ある のね 。 || Behind every "however" there\'s somebody\'s rainy day.',
      '?(comp=ren) comp: {書|か}かれて いない {決|き}まり が 、 {一番|いちばん} {大事|だいじ} な こと も あります 。 || Sometimes the most important rule is the unwritten one.',
      '?(comp=suzu) comp: {最後|さいご} の {一行|いちぎょう} を {書|か}かない {台本|だいほん} 。 {役者|やくしゃ} を {信|しん}じて いる の ね 。 || A script that leaves out its last line. It trusts its actors.'],
    later: 'narr: {絵|え} は 、 {後|あと} で {並|なら}べ{直|なお}せる 。 || You can put the pictures in order later.',
    done: 'narr: {絵巻|えまき} は 、 {元|もと} の {順番|じゅんばん} で {掛|か}かって いる 。 || The scroll hangs in its proper order.' });

  // ---- t2: the toll board and four travellers ---------------------------------------------------------------------------------
  const RULE = [
    ['ひとり いちもん 。', '{一人|ひとり} {一文|いちもん} 。', '{通行料|つうこうりょう} は 、 {一人|ひとり} {一文|いちもん} 。', '{通行料|つうこうりょう} は 、 {一人|ひとり} に つき {一文|いちもん} と する 。', 'One mon a head.'],
    ['にもつ が あれば 、 にもん 。', '{荷物|にもつ} が あれば 、 {二文|にもん} 。', '{荷物|にもつ} の ある {場合|ばあい} は 、 {二文|にもん} 。', '{荷|に} を {負|お}う {者|もの} は 、 {二文|にもん} と する 。', 'With a load, two mon.'],
    ['こども は ただ 。 でも 、 にもつ が あれば いちもん 。', '{子供|こども} は ただ 。 でも 、 {荷物|にもつ} が あれば {一文|いちもん} 。', '{子供|こども} は ただ 。 ただし 、 {荷物|にもつ} の ある {場合|ばあい} は {一文|いちもん} 。', '{子供|こども} は {無料|むりょう} と する 。 ただし 、 {荷|に} を {負|お}う {場合|ばあい} に {限|かぎ}り 、 {一文|いちもん} と する 。', 'Children go free; but with a load, one mon.'],
    ['とうげ の むら の ひと は 、 にもつ が あって も ただ 。', '{峠|とうげ} の {村|むら} の {人|ひと} は 、 {荷物|にもつ} が あって も ただ 。', '{峠|とうげ} の {村|むら} の {者|もの} は 、 {荷物|にもつ} が あって も ただ 。', '{峠|とうげ} の {村|むら} の {者|もの} は 、 {荷|に} の {有無|うむ} に かかわらず 、 {無料|むりょう} と する 。', 'People of the pass village go free, even with a load.'],
  ];
  const TIX = { free: ['ただ の {木札|きふだ}', 'the free tag'], one: ['{一文|いちもん} の {木札|きふだ}', 'the one-mon tag'], two: ['{二文|にもん} の {木札|きふだ}', 'the two-mon tag'] };
  const ANS = { 0: { ofuku: 'two', hanbei: 'free', koun: 'one', momo: 'one' }, 1: { ofuku: 'free', hanbei: 'two', koun: 'two', momo: 'free' } };
  const WHO = { ofuku: ['オフク', 'Ofuku', 'her', 'ありがとう 。 {峠|とうげ} の {上|うえ} で 、 また {会|あ}いましょう 。', 'Thank you. See you at the top of the pass.'],
    hanbei: ['ハンベエ', 'Hanbei', 'him', '{助|たす}かる よ 。', 'Much obliged.'],
    koun: ['コウウン', 'Kōun', 'them', 'ありがとう ございます 。', 'Thank you.'],
    momo: ['モモ', 'Momo', 'her', 'ありがとう ！', 'Thank you!'] };
  const SIT = {
    ofuku: { 0: ['くすり の はこ を せおって いる の 。 ふもと の まち から きた わ 。', '{薬|くすり} の {箱|はこ} を {背負|せお}って いる の 。 {麓|ふもと} の {町|まち} から {来|き}た わ 。', '{麓|ふもと} の {町|まち} から {来|き}た の 。 {背中|せなか} の {薬箱|くすりばこ} が {重|おも}くて ね 。', 'I\'ve come up from the town below, with a medicine box on my back.'],
      1: ['とうげ の むら に すんで いる の 。 にもつ は ない わ 。', '{峠|とうげ} の {村|むら} に {住|す}んで いる の 。 {荷物|にもつ} は ない わ 。', '{峠|とうげ} の {村|むら} で {薬屋|くすりや} を して いる の 。 {売|う}り{物|もの} は 、 {全部|ぜんぶ} {売|う}れて しまった わ 。', 'I live in the pass village, and I\'ve nothing to carry: I sold the lot.'] },
    hanbei: { 0: ['とうげ の むら の もの だ 。 こめ を はこんで いる 。', '{峠|とうげ} の {村|むら} の {者|もの} だ 。 {米|こめ} を {運|はこ}んで いる 。', '{生|う}まれ も {育|そだ}ち も {峠|とうげ} の {村|むら} だ 。 {背中|せなか} の {米|こめ} は 、 {村|むら} の {祭|まつ}り の {分|ぶん} だ よ 。', 'I\'m from the pass village, carrying rice for the village festival.'],
      1: ['まち の しょうにん だ 。 にもつ が たくさん ある 。', '{町|まち} の {商人|しょうにん} だ 。 {荷物|にもつ} が たくさん ある 。', '{麓|ふもと} の {町|まち} から 、 {反物|たんもの} を {売|う}り に {来|き}た 。 {荷|に} が {重|おも}くて {大変|たいへん} だ 。', 'I\'m a merchant from the town, with a heavy load of cloth to sell.'] },
    koun: { 0: ['たび の とちゅう です 。 にもつ は ありません 。', '{旅|たび} の {途中|とちゅう} です 。 {荷物|にもつ} は ありません 。', '{遠|とお}く の お{寺|てら} から {歩|ある}いて {来|き}ました 。 {持|も}ち{物|もの} は 、 この {杖|つえ} だけ です 。', 'I\'m a pilgrim from far away, with nothing to carry but this staff.'],
      1: ['たび の とちゅう です 。 おきょう の はこ を せおって います 。', '{旅|たび} の {途中|とちゅう} です 。 お{経|きょう} の {箱|はこ} を {背負|せお}って います 。', '{遠|とお}く の お{寺|てら} まで 、 お{経|きょう} を {届|とど}ける {途中|とちゅう} です 。 {箱|はこ} が {重|おも}くて 。', 'I\'m a pilgrim on the road, carrying a box of sutras to a temple far away.'] },
    momo: { 0: ['まち から きた の 。 かご に くり が いっぱい ！', '{町|まち} から {来|き}た の 。 {籠|かご} に {栗|くり} が いっぱい ！', '{麓|ふもと} の {町|まち} から 、 おばあちゃん の {家|いえ} まで {栗|くり} を {届|とど}ける の 。 {籠|かご} が {重|おも}い の 。', 'I came from the town, with a basket full of chestnuts for Grandma!'],
      1: ['おかあさん に あい に いく の 。 なにも もって ない よ 。', 'お{母|かあ}さん に {会|あ}い に {行|い}く の 。 {何|なに} も {持|も}って ない よ 。', 'お{母|かあ}さん が {峠|とうげ} の {向|む}こう で {待|ま}って いる の 。 {荷物|にもつ} は 、 {先|さき} に {送|おく}った よ 。', 'I\'m going to see my mother over the pass. I\'m not carrying anything!'] },
  };
  const HOLD = (g) => 'xp_hall_w6_f0_hold_' + g, SERVED = (w) => 'xp_hall_w6_f0_served_' + w;
  out += `
@scene hall.w6.board
narr: {軒下|のきした} の {札|ふだ} 。 {墨|すみ} の {字|じ} が 、 {何度|なんど} も {書|か}き{足|た}されて いる 。 || The board under the eaves, written over and added to many times in ink.
`;
  for (const r of RULE) out += LVN((t) => `?(${L[t]}) narr: 「 ${r['FEIA'.indexOf(t)]} 」 || "${r[4]}"\n`);
  for (const g of Object.keys(TIX)) out += `
@scene hall.w6.tag_${g}
!unset ${Object.keys(TIX).map(HOLD).join(' ')}
!set ${HOLD(g)}
narr: {箱|はこ} から 、 「 ${TIX[g][0]} 」 を {取|と}った 。 || You take ${TIX[g][1]} from the box.
`;
  for (const w of Object.keys(SIT)) {
    const [jp, en, obj, thx, thxEn] = WHO[w];
    out += `
@scene hall.w6.n_${w}
!faceplayer hall_${w}
!if ${SERVED(w)} -> done
!if ${Object.keys(TIX).map(HOLD).join('|')} -> give
`;
    out += LV3((p, t, i) => `?(${both(L[t], 'hall.w6.pat=' + p)}) hall_${w}: 「 ${SIT[w][p][i]} 」 || "${SIT[w][p][3]}"\n`);
    out += `!end
:give
!if hall.w6.pat=1 -> p1
!if ${HOLD(ANS[0][w])} -> right
!goto wrong
:p1
!if ${HOLD(ANS[1][w])} -> right
:wrong
hall_ibuki: {待|ま}って 。 その {木札|きふだ} で {合|あ}って いる か 、 {札|ふだ} の {決|き}まり を もう {一度|いちど} {読|よ}んで 。 || Wait. Read the board again: is that the right tag?
!end
:right
narr: {木札|きふだ} を ${jp} に {渡|わた}した 。 ${jp} は {木札|きふだ} の {通|とお}り に {払|はら}って 、 {峠|とうげ} へ {向|む}かった 。 || You give ${en} the tag. ${en} pays what it says and sets off up the pass.
hall_${w}: ${thx} || ${thxEn}
!unset ${Object.keys(TIX).map(HOLD).join(' ')}
!set ${SERVED(w)}
!if ${Object.keys(SIT).map(SERVED).join('&')} -> all
!refresh
!end
:all
narr: {四人|よにん} と も 、 {札|ふだ} の {決|き}まり の {通|とお}り に {払|はら}って 、 {峠|とうげ} を {上|のぼ}って いった 。 || All four have paid what the board says and gone on up the pass.
?(comp) comp: {決|き}まり の {通|とお}り 。 「 ても 」 と 「 ただし 」 を {見落|みお}とさなくて よかった 。 || All by the board. Good thing we didn't miss the "even if" and the "however".
${K.mark(W, 0, 't2')}
!end
:done
hall_${w}: ${thx} || ${thxEn}
`;
  }

  // ---- t3: the waymarkers and their stone -----------------------------------------------------------------------------------
  const CE = {
    0: { F: ['When spring comes, the cherries flower.', 'If it rains, put up an umbrella.', 'When night comes, the sky grows bright.', 'Turn right and there is the barrier station.'],
      E: ['If it\'s cheap, I\'ll buy it.', 'If I have time, I\'ll go.', 'If quiet-kereba (a form that doesn\'t exist), I can sleep.', 'If it rains, it\'s called off.'],
      I: ['When you reach the pass, let me know.', 'Even if it rains, I\'ll go.', 'Whenever you reach the pass, let me know.', 'Even if it\'s cheap, I don\'t want it.'],
      A: ['Unless it rains, the festival will be held.', 'As long as you write your name, anyone may pass.', 'Open every day except Sunday.', 'If only you take the medicine, the fever will rise.'] },
    1: { F: ['When summer comes, it gets hot.', 'When I\'m hungry, I eat.', 'When winter comes, the snow melts.', 'Go along this road and there\'s a bridge.'],
      E: ['If you\'re free, help me.', 'If you\'re cold, please shut the window.', 'If child-kereba (a form that doesn\'t exist), it\'s free.', 'With a load, it\'s two mon.'],
      I: ['If you don\'t understand, please ask.', 'However many times I read it, I don\'t understand.', 'Everyone but children pays one mon.', 'Even if it rains, I put up my umbrella.'],
      A: ['As long as I am keeper, I will guard the gate.', 'As long as I know the way, I can go alone.', 'Except on festival days, the shrine lamp is not lit.', 'Unless it snows, the pass cannot be crossed.'] },
  };
  out += '\n@scene hall.w6.t3' + K.taskTrial({ w: W, k: 0, t: 't3',
    intro: ['narr: {古|ふる}い {道標|みちしるべ} が {四|よっ}つ {並|なら}び 、 その {先|さき} の {石|いし} に {字|じ} が {刻|きざ}んで ある 。 「 {四|よっ}つ の {言葉|ことば} の うち 、 {一|ひと}つ だけ が {間違|まちが}って いる 。 」 || Four old waymarkers stand in a row, and on the stone beyond them is carved: "Of the four sayings, one alone is wrong."'],
    task: { 0: 'hall.w6.counter0', 1: 'hall.w6.counter1' },
    after: ['narr: {間違|まちが}った {言葉|ことば} が 、 {峠|とうげ} の {風|かぜ} に {消|き}えた 。 || The wrong saying blows away on the wind off the pass.', '?(comp) comp: {条件|じょうけん} が {合|あ}わない と 、 {言葉|ことば} が {全部|ぜんぶ} {逆|さか}さま に なる から ね 。 || When the condition doesn\'t fit, the whole saying comes out backwards.'],
    later: 'narr: {言葉|ことば} を {一|ひと}つ ずつ {読|よ}んで から 、 また {来|こ}よう 。 || Read the sayings one by one, then come back.',
    done: 'narr: {石|いし} の {字|じ} は 、 もう {何|なに} も {問|と}わない 。 || The carving asks nothing more.' });
  for (let i = 0; i < 4; i++) {
    out += `\n@scene hall.w6.card${i + 1}\nnarr: {古|ふる}い {道標|みちしるべ} 。 {昔|むかし} の {言葉|ことば} が {刻|きざ}んで ある 。 || An old waymarker, carved with an old saying.\n`;
    out += LV((p, t) => `?(${both(L[t], 'hall.w6.pat=' + p)}) narr: 「 ${C.hallW6Cards[p][t][i][0]} 」 || "${CE[p][t][i]}"\n`);
  }

  // ---- t4: the lanterns of the pass --------------------------------------------------------------------------------------------
  const LRULE = {
    0: { F: 'とうろう は ぜんぶ ともす 。 でも 、 かぜ が つよい ひ は 、 はし の とうろう だけ は ともさない 。', E: '{灯籠|とうろう} は {全部|ぜんぶ} {灯|とも}す 。 でも 、 {風|かぜ} が {強|つよ}い {日|ひ} は 、 {橋|はし} の {灯籠|とうろう} だけ は {灯|とも}さない 。', I: '{灯籠|とうろう} は {全部|ぜんぶ} {灯|とも}す 。 ただし 、 {風|かぜ} の {強|つよ}い {場合|ばあい} は 、 {橋|はし} の {灯籠|とうろう} を {除|のぞ}く 。', A: '{峠|とうげ} の {灯籠|とうろう} は {全|すべ}て {灯|とも}す こと 。 ただし 、 {橋|はし} の {灯籠|とうろう} は 、 {風|かぜ} の {強|つよ}い {日|ひ} を {除|のぞ}いて {灯|とも}す こと 。', en: 'Light every lantern; but on a windy day, leave the bridge lantern dark.' },
    1: { F: 'とうろう は ぜんぶ ともす 。 でも 、 ほこら の とうろう は 、 まつり の ひ しか ともさない 。', E: '{灯籠|とうろう} は {全部|ぜんぶ} {灯|とも}す 。 でも 、 {祠|ほこら} の {灯籠|とうろう} は 、 お{祭|まつ}り の {日|ひ} しか {灯|とも}さない 。', I: '{灯籠|とうろう} は {全部|ぜんぶ} {灯|とも}す 。 ただし 、 {祠|ほこら} の {灯籠|とうろう} は 、 {祭|まつ}り の {日|ひ} {以外|いがい} は {灯|とも}さない 。', A: '{峠|とうげ} の {灯籠|とうろう} は {全|すべ}て {灯|とも}す こと 。 ただし 、 {祠|ほこら} の {灯籠|とうろう} は 、 {祭|まつ}り の {日|ひ} で ない {限|かぎ}り 、 {灯|とも}さない こと 。', en: 'Light every lantern; but the shrine lantern only on a festival day.' },
  };
  const DARK = { 0: 'bridge', 1: 'shrine' };
  const LAMPS = ['foot', 'bend', 'bridge', 'shrine', 'top'];
  const LIT = (l) => 'xp_hall_w6_f1_lit_' + l;
  const NEED = (p) => LAMPS.filter((l) => l !== DARK[p]).map(LIT).join('&');
  out += `
@scene hall.w6.t4_rule
!set xp_hall_w6_f1_read
narr: {柱|はしら} の {札|ふだ} 。 キヘエ の {字|じ} で 、 {灯籠|とうろう} の {灯|とも}し{方|かた} が {書|か}いて ある 。 || The board on the post: how the lanterns are to be lit, in Kihei's hand.
`;
  out += LV((p, t) => `?(${both(L[t], 'hall.w6.pat=' + p)}) narr: 「 ${LRULE[p][t]} 」 || "${LRULE[p].en}"\n`);
  out += `
@scene hall.w6.sky
narr: {峠|とうげ} の {祭|まつ}り の {知|し}らせ 。 「 {祭|まつ}り は {明日|あした} 。 」 || A notice for the pass festival: "The festival is tomorrow."
?(hall.w6.pat=0) narr: {見上|みあ}げる と 、 {谷|たに} から {強|つよ}い {風|かぜ} が {吹|ふ}き{上|あ}げて いる 。 {紅葉|もみじ} が {舞|ま}い{上|あ}がる 。 || Looking up: a strong wind is blowing up out of the valley, and maple leaves whirl into the air.
?(hall.w6.pat=1) narr: {見上|みあ}げる と 、 {風|かぜ} は ない 。 {紅葉|もみじ} が 、 まっすぐ {落|お}ちて くる 。 || Looking up: there is no wind. The maple leaves fall straight down.
`;
  for (const l of LAMPS) {
    const no = [0, 1].filter((p) => DARK[p] === l);
    out += `
@scene hall.w6.l_${l}
!if ${LIT(l)} -> lit
!if !xp_hall_w6_f1_read -> unread
${no.map((p) => '!if hall.w6.pat=' + p + ' -> no').join('\n')}
narr: {灯籠|とうろう} に {火|ひ} を {入|い}れた 。 || You light the lantern.
!set ${LIT(l)}
!if hall.w6.pat=0&${NEED(0)}|hall.w6.pat=1&${NEED(1)} -> all
!refresh
!end
:all
narr: {峠|とうげ} の {灯籠|とうろう} が 、 {決|き}まり の {通|とお}り に {灯|とも}った 。 || The pass's lanterns are lit, just as the rule says.
?(comp) comp: 「 {全部|ぜんぶ} {灯|とも}す 」 で も 、 「 ただし 」 が {一|ひと}つ 。 {例外|れいがい} を {見落|みお}とさなくて よかった 。 || "Light them all", with one "however". Good thing we didn't miss the exception.
${K.mark(W, 1, 't4')}
!end
:no
narr: {火|ひ} を {入|い}れよう と して 、 {手|て} を {止|と}めた 。 {決|き}まり と {今日|きょう} の {空|そら} を 、 もう {一度|いちど} {確|たし}かめよう 。 || You go to light it, and stop. Check the rule, and today's sky, once more.
!end
:unread
narr: {灯籠|とうろう} の {灯|とも}し{方|かた} に は 、 {決|き}まり が ある らしい 。 {先|さき} に {柱|はしら} の {札|ふだ} を {読|よ}もう 。 || There seems to be a rule for lighting the lanterns. Read the board on the post first.
!end
:lit
narr: {灯籠|とうろう} の {火|ひ} が 、 {夕闇|ゆうやみ} に {揺|ゆ}れて いる 。 || The lantern's flame wavers in the dusk.
`;
  }

  // ---- t5: the mist on the pass ----------------------------------------------------------------------------------------------
  out += `
@scene hall.w6.t5
narr: {霧|きり} が {晴|は}れて 、 {峠|とうげ} の {道|みち} が {見|み}えた 。 || The mist clears, and the road up the pass shows again.
${K.mark(W, 1, 't5')}
`;

  // ---- t6: Kihei's ledger and the one traveller it lets go on after dark (in your companion's hands; alone, Ibuki reads it) --
  const TOLD = {
    0: { F: 'くらく なったら 、 ちょうちん を もって いない ひと は 、 とおさない 。', E: '{暗|くら}く なったら 、 {提灯|ちょうちん} を {持|も}って いない {人|ひと} は 、 {通|とお}さない 。', I: '{日|ひ} が {暮|く}れたら 、 {提灯|ちょうちん} の ない {場合|ばあい} は {通|とお}さない 。 {一人|ひとり} でも 、 {提灯|ちょうちん} が あれば {通|とお}して よい 。', A: '{日没|にちぼつ} {後|ご} の {通行|つうこう} は 、 {提灯|ちょうちん} を {持|も}つ {者|もの} に {限|かぎ}る 。 {人数|にんずう} は {問|と}わない 。', en: 'After dark, nobody goes on without a lantern; with one, even alone, they may.' },
    1: { F: 'くらく なったら 、 ひとり で は とおさない 。 ふたり いじょう なら 、 とおして いい 。', E: '{暗|くら}く なったら 、 {一人|ひとり} で は {通|とお}さない 。 {二人|ふたり} {以上|いじょう} なら 、 {通|とお}して いい 。', I: '{日|ひ} が {暮|く}れたら 、 {一人|ひとり} の {場合|ばあい} は {通|とお}さない 。 {二人|ふたり} {以上|いじょう} なら 、 {提灯|ちょうちん} が なくて も {通|とお}して よい 。', A: '{日没|にちぼつ} {後|ご} は 、 {二人|ふたり} {以上|いじょう} で ない {限|かぎ}り 、 {通行|つうこう} を {認|みと}めない 。 {提灯|ちょうちん} の {有無|うむ} は {問|と}わない 。', en: 'After dark, nobody goes on alone; two or more may, lantern or not.' },
  };
  out += `
@scene hall.w6.t6
!if hall.w6.t6 -> done
!if xp_hall_w6_f1_asked -> told
narr: {避難小屋|ひなんごや} の {机|つくえ} に 、 キヘエ の {帳面|ちょうめん} 。 {夜|よる} の {決|き}まり の {頁|ページ} は 、 {雨漏|あまも}り で {滲|にじ}んで いる 。 || On the shelter hut's desk lies Kihei's ledger. The page of night rules has run where the roof leaked.
?(comp=nao) comp: {滲|にじ}んだ {字|じ} なら 、 {任|まか}せて くれ 。 {雨|あめ} に {濡|ぬ}れた {宛名|あてな} を 、 {何百|なんびゃく} と {読|よ}んで きた 。 {何|なに} が {知|し}りたい ？ || Leave smudged writing to me. I've read hundreds of rain-soaked addresses. What do you want to know?
?(comp=mio) comp: {私|わたし} が {読|よ}む わ 。 {滲|にじ}んだ {処方|しょほう} も 、 {読|よ}み{慣|な}れて いる の 。 {何|なに} を {調|しら}べる ？ || I'll read it. I'm used to smudged prescriptions. What are we looking for?
?(comp=ren) comp: {灯守|ひもり} の {帳面|ちょうめん} と 、 {書|か}き{方|かた} が {似|に}て います 。 {私|わたし} が {読|よ}みましょう 。 {何|なに} を ？ || It's kept like a lamp-keeper's ledger. I'll read it. What for?
?(comp=suzu) comp: {滲|にじ}んだ {台本|だいほん} なら 、 {何度|なんど} も {読|よ}んだ わ 。 {任|まか}せて 。 {何|なに} を {探|さが}す ？ || I've read plenty of smudged scripts. Leave it to me. What am I looking for?
?(!comp) hall_ibuki: {私|わたし} が {読|よ}む 。 キヘエ さん の {字|じ} なら 、 {読|よ}める 。 {何|なに} を {調|しら}べる ？ || I'll read it. I can read Kihei's hand. What are we looking up?
!hook hall_challenge hall.w6.ask
!if var._res=0 -> later
!set xp_hall_w6_f1_asked
:told
`;
  out += LV((p, t) => `?(${both(L[t], 'hall.w6.pat=' + p)}) narr: 「 ${TOLD[p][t]} 」 || "${TOLD[p].en}"\n`);
  out += `!end
:later
narr: {帳面|ちょうめん} を {机|つくえ} に {戻|もど}した 。 || You put the ledger back on the desk.
!end
:done
narr: {帳面|ちょうめん} は 、 {夜|よる} の {決|き}まり の {頁|ページ} で {開|ひら}いた まま だ 。 || The ledger lies open at the page of night rules.
`;
  const ALLOW = { momo: 0, koun: 1 };
  const NIGHTSIT = {
    momo: ['むら に かえる の 。 おじいちゃん の ちょうちん を もって いる よ 。 ひとり で だいじょうぶ 。', '{村|むら} に {帰|かえ}る の 。 おじいちゃん の {提灯|ちょうちん} を {持|も}って いる よ 。 {一人|ひとり} で {大丈夫|だいじょうぶ} 。', '{峠|とうげ} の {上|うえ} の {村|むら} に {帰|かえ}る ところ な の 。 おじいちゃん の {提灯|ちょうちん} が ある から 、 {一人|ひとり} でも {平気|へいき} だ よ 。', 'I\'m going home to the village. I\'ve got Grandpa\'s lantern, so I\'m fine on my own.', 'ありがとう ！ おやすみ なさい ！', 'Thank you! Good night!', 'モモ', 'Momo'],
    koun: ['もう ひとり の じゅんれい と いっしょ です 。 ちょうちん は 、 かぜ で きえて しまいました 。', 'もう {一人|ひとり} の {巡礼|じゅんれい} と {一緒|いっしょ} です 。 {提灯|ちょうちん} は 、 {風|かぜ} で {消|き}えて しまいました 。', '{連|つ}れ の {巡礼|じゅんれい} と {二人|ふたり} です 。 あいにく 、 {提灯|ちょうちん} の {火|ひ} は {風|かぜ} に {消|け}されて しまいました が 。', 'There are two of us pilgrims. Our lantern blew out in the wind, I\'m afraid.', 'ありがとう ございます 。 {二人|ふたり} で 、 {足元|あしもと} に {気|き}を {付|つ}けて {行|い}きます 。', 'Thank you. We\'ll mind our step, the two of us.', 'コウウン', 'Kōun'],
    hanbei: ['あさ の いち に まにあいたい 。 ひとり だ 。 ちょうちん は ない 。', '{朝|あさ} の {市|いち} に {間|ま}に{合|あ}いたい 。 {一人|ひとり} だ 。 {提灯|ちょうちん} は ない 。', '{朝|あさ} の {市|いち} に {間|ま}に{合|あ}わない と {困|こま}る ん だ 。 {連|つ}れ も {提灯|ちょうちん} も ない が 、 {急|いそ}いで いる 。', 'I want to make the morning market. I\'m on my own, and I\'ve no lantern.', '', '', 'ハンベエ', 'Hanbei'],
  };
  for (const w of Object.keys(NIGHTSIT)) {
    const s = NIGHTSIT[w];
    out += `
@scene hall.w6.x_${w}
!faceplayer hall_${w}2
!if hall.w6.t6 -> done
`;
    out += LVN3((t, i) => `?(${L[t]}) hall_${w}: 「 ${s[i]} 」 || "${s[3]}"\n`);
    out += `!if !xp_hall_w6_f1_asked -> unknown
${w in ALLOW ? '!if hall.w6.pat=' + ALLOW[w] + ' -> right\n' : ''}narr: キヘエ の {帳面|ちょうめん} の {決|き}まり で は 、 {今|いま} は {通|とお}せない 。 || By the rule in Kihei's ledger, you can't let them through now.
?(comp) comp: {帳面|ちょうめん} の {言葉|ことば} 、 もう {一度|いちど} {言|い}おう か ？ || Shall I say what the ledger said again?
!end
${w in ALLOW ? `:right
narr: {帳面|ちょうめん} の {決|き}まり の {通|とお}り 、 ${s[6]} を {峠|とうげ} の {上|うえ} へ {通|とお}した 。 || As the ledger allows, you let ${s[7]} go on up the pass.
hall_${w}: ${s[4]} || ${s[5]}
?(comp) comp: {夜|よる} は {通|とお}さない 。 ただし 、 {一|ひと}つ だけ {例外|れいがい} が ある 。 {読|よ}んで よかった ね 。 || Nobody after dark, except in one case. Good thing we read it.
${K.mark(W, 1, 't6')}
!end
` : ''}:unknown
narr: {暗|くら}く なったら 、 {誰|だれ} を {通|とお}して いい の か 、 まだ {分|わ}からない 。 キヘエ の {帳面|ちょうめん} を {読|よ}んで もらおう 。 || You don't know yet whom you may let on after dark. Have Kihei's ledger read first.
!end
:done
narr: {峠|とうげ} は もう {暗|くら}い 。 {灯籠|とうろう} の {灯|ひ} が 、 {道|みち} を {照|て}らして いる 。 || The pass is dark now. The lanterns light the road.
`;
  }

  // ---- t7: the riddle stone ----------------------------------------------------------------------------------------------------
  out += '\n@scene hall.w6.t7' + K.taskTrial({ w: W, k: 1, t: 't7',
    intro: ['narr: {苔|こけ} むした {石|いし} に 、 {字|じ} が {彫|ほ}って ある 。 「 {解|と}けた {者|もの} は 、 {一度|いちど} だけ 、 {帰|かえ}って また {来|く}る こと が できる 。 」 || Words cut into a mossy stone: "Whoever solves this may once go home and come back."'],
    task: 'hall.w6.riddle',
    after: ['narr: {石|いし} の {字|じ} が 、 {夕日|ゆうひ} に {光|ひか}った 。 || The carving shines in the setting sun.'],
    later: 'narr: {答|こた}え は 、 {急|いそ}がなくて いい 。 || There\'s no hurry for the answer.',
    done: 'narr: {石|いし} は 、 {答|こた}え を {覚|おぼ}えて いる 。 || The stone remembers the answer.' });

  // ---- t8: the help board, each case hung beside what the toll house does for it -------------------------------------------------
  const CASE = {
    rain: ['あめ なら', '{雨|あめ} が {降|ふ}ったら', '{雨|あめ} の {場合|ばあい} は', 'If it rains'],
    dark: ['くらく なったら', '{暗|くら}く なったら', '{日|ひ} が {暮|く}れた {場合|ばあい} は', 'Once it is dark'],
    sick: ['ぐあい が わるければ', '{具合|ぐあい} が {悪|わる}ければ', '{具合|ぐあい} の {悪|わる}い {場合|ばあい} は', 'If someone is unwell'],
    lost: ['みち に まよったら', '{道|みち} に {迷|まよ}ったら', '{道|みち} に {迷|まよ}った {場合|ばあい} は', 'If someone is lost'],
    cold: ['さむければ', '{寒|さむ}ければ', '{寒|さむ}さ の {厳|きび}しい {場合|ばあい} は', 'If it is cold'],
  };
  const DOES = {
    rain: ['かさ を かす', '{傘|かさ} を {貸|か}す', '{傘|かさ} を {貸|か}す こと', 'lend an umbrella'],
    dark: ['ちょうちん を もたせる', '{提灯|ちょうちん} を {持|も}たせる', '{提灯|ちょうちん} を {持|も}たせる こと', 'give them a lantern'],
    sick: ['くすり を のませる', '{薬|くすり} を {飲|の}ませる', '{薬|くすり} を {飲|の}ませる こと', 'give them medicine'],
    lost: ['みち を かいて わたす', '{道|みち} を {描|か}いて {渡|わた}す', '{道|みち} を {描|か}いて {渡|わた}す こと', 'draw them the way'],
    cold: ['いろり に あたらせる', '{囲炉裏|いろり} に {当|あ}たらせる', '{囲炉裏|いろり} に {当|あ}たらせる こと', 'sit them by the hearth'],
  };
  const HOOKR = { 0: { h1: 'dark', h2: 'sick', h3: 'rain', h4: 'lost' }, 1: { h1: 'cold', h2: 'rain', h3: 'sick', h4: 'dark' } };
  const HOLDC = (c) => 'xp_hall_w6_f2_holdc_' + c, HUNG = (c) => 'xp_hall_w6_f2_hung_' + c, HOOKED = (h) => 'xp_hall_w6_f2_hook_' + h;
  out += `
@scene hall.w6.t8_board
narr: {番小屋|ばんごや} の {壁|かべ} の 「 {助|たす}け の {札|ふだ} 」 。 {風|かぜ} で 、 {場合|ばあい} を {書|か}いた {板|いた} が {外|はず}れて {落|お}ちて いる 。 {鉤|かぎ} に {残|のこ}って いる の は 、 {関所|せきしょ} が する こと だけ だ 。 || The "help board" on the guard hut wall. The wind has knocked down the boards naming each case; only what the toll house does is left on the hooks.
?(comp&!hall.w6.t8) comp: どの {場合|ばあい} に 、 {何|なに} を する の か 。 {合|あ}う {組|く}み{合|あ}わせ を {探|さが}そう 。 || Which case calls for what. Let's find what goes together.
`;
  for (const c of Object.keys(CASE)) {
    out += `
@scene hall.w6.pl_${c}
narr: {風|かぜ} で {落|お}ちた {板|いた} 。 || A board the wind knocked down.
`;
    out += LVN3((t, i) => `?(${L[t]}) narr: 「 ${CASE[c][i]} 」 || "${CASE[c][3]}"\n`);
    out += `!unset ${Object.keys(CASE).map(HOLDC).join(' ')}
!set ${HOLDC(c)}
narr: {板|いた} を {拾|ひろ}った 。 || You pick up the board.
`;
  }
  const HOOKS = ['h1', 'h2', 'h3', 'h4'];
  for (const h of HOOKS) {
    out += `
@scene hall.w6.${h}
`;
    out += LV3((p, t, i) => `?(${both(L[t], 'hall.w6.pat=' + p)}) narr: 「 …… 、 ${DOES[HOOKR[p][h]][i]} 」 || "…, ${DOES[HOOKR[p][h]][3]}"\n`);
    out += `!if ${HOOKED(h)} -> done
!if ${Object.keys(CASE).map(HOLDC).join('|')} -> try
!end
:try
!if hall.w6.pat=1 -> p1
!if ${HOLDC(HOOKR[0][h])} -> right0
!goto wrong
:p1
!if ${HOLDC(HOOKR[1][h])} -> right1
:wrong
narr: {板|いた} を {掛|か}けよう と して 、 {手|て} を {止|と}めた 。 この {場合|ばあい} に 、 これ は {合|あ}わない 。 || You go to hang the board, and stop. That case doesn't go with this.
!end
`;
    for (const p of [0, 1]) out += `:right${p}
narr: {板|いた} を {鉤|かぎ} に {掛|か}けた 。 || You hang the board on the hook.
!unset ${Object.keys(CASE).map(HOLDC).join(' ')}
!set ${HUNG(HOOKR[p][h])} ${HOOKED(h)}
!goto check
`;
    out += `:check
!if ${HOOKS.map(HOOKED).join('&')} -> all
!refresh
!end
:all
narr: 「 {助|たす}け の {札|ふだ} 」 が 、 {元|もと} に {戻|もど}った 。 || The help board is whole again.
?(comp) comp: {雨|あめ} なら {傘|かさ} 、 {暗|くら}く なったら {提灯|ちょうちん} 。 {決|き}まり と いう より 、 {親切|しんせつ} の {一覧|いちらん} だ ね 。 || An umbrella if it rains, a lantern once it's dark. Less a list of rules than a list of kindnesses.
${K.mark(W, 2, 't8')}
!end
:done
narr: {板|いた} が {掛|か}かって いる 。 || The board hangs in its place.
`;
  }

  // ---- t9: Ibuki and Otsuta ----------------------------------------------------------------------------------------------------
  out += `
@scene hall.w6.otsuta
!faceplayer hall_otsuta
hall_otsuta: お{願|ねが}い です 。 この {子|こ} を 、 {峠|とうげ} の {向|む}こう の お{医者|いしゃ} に …… 。 || Please. This child, to the doctor over the pass…
?(comp) comp: …… イブキ と {話|はな}そう 。 || …Let's talk to Ibuki.

@scene hall.w6.t9
!faceplayer hall_ibuki3
!if hall.w6.t9 -> after
hall_ibuki: {鐘|かね} は もう {鳴|な}った 。 {門|もん} は 、 {朝|あさ} まで {開|あ}けない 。 そう {札|ふだ} に {書|か}いた 。 || The bell has rung. The gate stays shut till morning. I wrote it on the board.
!encounter hall.w6.night
!if var._enc=through -> through
narr: {番小屋|ばんごや} の {戸|と} は {閉|し}まった まま だ 。 オツタ は 、 {門|もん} の {前|まえ} で {赤|あか}ん{坊|ぼう} を {揺|ゆ}すって いる 。 || The guard hut's door stays shut. Otsuta rocks her baby by the gate.
!end
:through
narr: {門|もん} が {開|あ}いた 。 オツタ は {深|ふか}く {頭|あたま} を {下|さ}げて 、 {暗|くら}い {峠|とうげ} を {下|くだ}って いった 。 || The gate opens. Otsuta bows deeply and goes down into the dark on the far side.
hall_ibuki: …… 「 {例外|れいがい} は ない 」 と {書|か}いた の は 、 {私|わたし} だ 。 {怖|こわ}かった ん だ 。 {間違|まちが}える の が 。 || …I'm the one who wrote "no exceptions". I was afraid. Of getting it wrong.
${K.mark(W, 2, 't9')}
!end
:after
hall_ibuki: {門|もん} に 、 {提灯|ちょうちん} を {掛|か}けて おこう 。 オツタ さん が 、 {帰|かえ}り に {迷|まよ}わない よう に 。 || Let's hang a lantern on the gate, so Otsuta doesn't lose her way back.
`;

  // ---- t10: the night at the gate -------------------------------------------------------------------------------------------------
  out += `
@scene hall.w6.t10
!if hall.w6.t10 -> after
!if !hall.w6.t8 -> wait
!if !hall.w6.t9 -> wait
narr: {夜|よる} が {来|き}た 。 イブキ と {二人|ふたり} で 、 {門|もん} の {番|ばん} を する 。 || Night has come. You keep the gate with Ibuki.
!encounter hall.w6.watch
!if var._res=0 -> later
!set xp_hall_w6_f2_t10
!hook hall_trial w6 t10
!if var._res=1 -> finale
!refresh
!end
:finale
!call hall.w6.end
!end
:wait
narr: {門|もん} の {前|まえ} は 、 まだ {落|お}ち{着|つ}かない 。 || Things at the gate haven't settled yet.
?(!hall.w6.t8) narr: 「 {助|たす}け の {札|ふだ} 」 の {板|いた} が 、 まだ {地面|じめん} に {落|お}ちて いる 。 || The help board's case boards are still lying on the ground.
?(!hall.w6.t9) narr: オツタ が 、 {閉|し}まった {門|もん} の {前|まえ} で {赤|あか}ん{坊|ぼう} を {抱|だ}いて いる 。 || Otsuta stands at the shut gate, holding her baby.
!end
:later
narr: イブキ が 、 {門|もん} の {横|よこ} で {次|つぎ} の {合図|あいず} を {待|ま}って いる 。 || Ibuki waits by the gate for the next word.
!end
:after
narr: {門|もん} の {提灯|ちょうちん} が 、 {朝|あさ} の {光|ひかり} に {薄|うす}れて いく 。 || The gate's lantern pales in the morning light.

@scene hall.w6.end
!fade out
!sequence hall.w6 begin
!shot tale
narr: {朝|あさ} 、 オツタ が {峠|とうげ} を {上|のぼ}って {戻|もど}って きた 。 {赤|あか}ん{坊|ぼう} は 、 {腕|うで} の {中|なか} で {眠|ねむ}って いる 。 {熱|ねつ} は {下|さ}がった 。 || In the morning Otsuta comes back up the pass. The baby is asleep in her arms; the fever has broken.
hall_kihei: {札|ふだ} の {一番|いちばん} {下|した} の {一行|いちぎょう} 、 {良|よ}い {字|じ} じゃ 。 …… {決|き}まり は {変|か}わる 。 {変|か}わって {良|よ}い 。 {変|か}わらん の は 、 {何|なん} の ため の {決|き}まり か 、 だけ じゃ 。 || The bottom line on the board: a good hand. …Rules change, and so they should. The only thing that doesn't is what they're for.
?(comp=nao) comp: {宛先|あてさき} の ない {手紙|てがみ} は {届|とど}けない 。 ただし 、 {困|こま}って いる {人|ひと} の {手紙|てがみ} は 、 {何|なん} と して でも {届|とど}ける 。 {配達|はいたつ} の {決|き}まり も 、 {同|おな}じ だ 。 || No address, no delivery. Except a letter from someone in trouble: that gets there, whatever it takes. The delivery rules are the same.
?(comp=mio) comp[happy]: なら 、 たら 、 ても 、 ただし 。 {決|き}まり の {言葉|ことば} は {冷|つめ}たく {聞|き}こえる けど 、 {使|つか}う {人|ひと} {次第|しだい} で 、 {温|あたた}かく も なる のね 。 || If, when, even if, except. The words of rules sound cold, but in the right hands they can be warm.
?(comp=ren) comp: {灯|ひ} が {六|むっ}つ 、 {戻|もど}りました 。 {残|のこ}り は 、 {四|よっ}つ です 。 || Six lights back. Four to go.
?(comp=suzu) comp: {第|だい}{六幕|ろくまく} 、 {幕|まく} ！ {門番|もんばん} が {門|もん} を {開|あ}ける {場面|ばめん} は 、 {何度|なんど} {見|み}て も {泣|な}ける わ 。 || End of act six! The scene where the gatekeeper opens the gate makes me cry every time.
!sequence hall.w6 end
narr: {朝|あさ} の {霧|きり} が {畳|たた}まれる よう に {薄|うす}く なって 、 {気|き}が {付|つ}く と 、 {館|やかた} の {囲炉裏|いろり} の {前|まえ} に いた 。 || The morning mist folds thin, and when you look up you are by the hall's hearth.
!set hall_w6_done
!hook hall_finish
!fade in
`;

  RB.script.add(out);
})(RB.content);
