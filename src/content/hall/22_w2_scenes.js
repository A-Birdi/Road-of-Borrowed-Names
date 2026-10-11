/* The Hall of a Hundred Tales, wing 2, The Fox's Wedding: the scenes (expansion P15; plan 04_DUNGEONS.md D9; maps in
 * 11_w2_maps.js, tasks and encounters in 16_w2_learning.js). Each trial sets its floor's own flag and tells the Hall;
 * what a trial shows follows the level its task is set at (the profile, or one up on the Grow route); the pattern
 * (hall.w2.pat) chooses the gifts' tags, the procession's order, Sayo's seat and who lent what to whom. Kozue (she/her)
 * is the fox bride, Gin (he/him) the groom, Toku (she/her) the go-between, Konta (he/him) the bride's little brother,
 * Sayo (she/her) the village girl; the lantern-bearer and the porter they/them. Suzu's lines have Kansai versions
 * (src/content/dialect/kansai_99_hall.js). */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const K = C.hallKit, W = 'w2', L = K.lv(W), both = L.both;
  const TALE = C.hallW2Tale;
  let out = `
@scene hall.w2.f1_first
!set hall_w2_f1_seen
narr: {紙|かみ} の {戸|と} を {抜|ぬ}ける と 、 {明|あか}るい {野原|のはら} だった 。 {日|ひ} が {照|て}って いる のに 、 {細|ほそ}い {雨|あめ} が {降|ふ}って いる 。 || Through the paper screen: a bright meadow. The sun is shining, and yet a fine rain is falling.
?(comp=nao) comp: {晴|は}れてる のに {雨|あめ} か 。 …… {狐|きつね} の {嫁入|よめい}り 、 って やつ だ な 。 || Sunshine and rain. …A fox's wedding, as they say.
?(comp=mio) comp[happy]: {狐|きつね} の {嫁入|よめい}り ！ {子供|こども} の {頃|ころ} 、 {窓|まど} から {狐|きつね} を {探|さが}した わ 。 || A fox's wedding! When I was little I used to look out of the window for the foxes.
?(comp=ren) comp: {日照|ひで}り{雨|あめ} です 。 {灯守|ひもり} の {間|あいだ} で は 、 {狐|きつね} の {行列|ぎょうれつ} が {通|とお}る と {言|い}います 。 || A sun-shower. Among the keepers, they say a fox procession is passing.
?(comp=suzu) comp: {第|だい}{二幕|にまく} は 、 {雨|あめ} と お{日様|ひさま} の {舞台|ぶたい} ね 。 {傘|かさ} の {出番|でばん} よ 。 || Act two: a stage of rain and sunshine. Time for the umbrellas.
?(!comp) narr: {雨粒|あまつぶ} が 、 {日|ひ} の {光|ひかり} の {中|なか} で {光|ひか}って いる 。 || The raindrops glitter in the sunlight.

@scene hall.w2.f2_first
!set hall_w2_f2_seen
narr: {道|みち} の {脇|わき} に 、 {行列|ぎょうれつ} の {人|ひと} たち が {待|ま}って いる 。 {顔|かお} は {笑|わら}って いる が 、 {目|め} が {細|ほそ}い 。 {狐|きつね} の {目|め} だ 。 || At the roadside the procession waits. Their faces smile, but their eyes are narrow: fox eyes.
?(comp) comp: {並|なら}び{順|じゅん} が {分|わ}からなくて 、 {困|こま}って いる みたい だ 。 || They seem stuck: nobody knows the order to walk in.

@scene hall.w2.f3_first
!set hall_w2_f3_seen
narr: {赤|あか}い {鳥居|とりい} の {向|む}こう に 、 {小|ちい}さな お{宮|みや} 。 {台|だい} の {上|うえ} に 、 {盃|さかずき} が {一|ひと}つ {置|お}いて ある 。 || Beyond a red torii, a small shrine. A single cup has been set out on a table.
?(comp=nao) comp: {式|しき} の {前|まえ} に 、 {借|か}りた {物|もの} を {返|かえ}さない と な 。 {貸|か}し{借|か}り は {大事|だいじ} だ 。 || Before the ceremony, the borrowed things go back. Lending and borrowing matter.
?(comp=mio) comp: {子供|こども} が 、 {傘|かさ} を {抱|かか}えて {泣|な}いてる …… 。 || A child is crying, hugging an umbrella…
?(comp=ren) comp: {式|しき} は 、 {盃|さかずき} を {交|か}わして {終|お}わります 。 {誰|だれ} から {誰|だれ} へ 、 {順番|じゅんばん} が ある の です 。 || The ceremony ends with the cup shared. From whom to whom: there's an order.
?(comp=suzu) comp: いよいよ {本番|ほんばん} ね 。 {小道具|こどうぐ} の {返却|へんきゃく} から 。 {舞台|ぶたい} の {基本|きほん} よ 。 || The real performance at last. Props returned first: the basics of the stage.

@scene hall.w2.bench1
!hook hall_station w2_b1

@scene hall.w2.bench2
!hook hall_station w2_b2

@scene hall.w2.bench3
!hook hall_station w2_b3

@scene hall.w2.spring
narr: {古|ふる}い {井戸|いど} 。 {雨水|あまみず} が {澄|す}んで いる 。 || An old well, the rainwater clear in it.
!hook hall_station w2_sp
@scene hall.w2.cups_after
narr: {盃|さかずき} が 、 {台|だい} の {上|うえ} で {光|ひか}って いる 。 || The cup gleams on the table.
`;
  // ---- t1: the story room ----------------------------------------------------------------------------------------------
  const F_PANELS = ['はれて いる のに 、 あめ が ふって きた', 'むら の ひと は 『 きつね の よめいり だ 』 と いって 、 と を しめた', 'サヨ だけ が 、 はなよめ に かさ を かして あげた', 'つぎ の あさ 、 サヨ の いえ の まえ に 、 おれい の くり が おいて あった'];
  // (inside the narration's quotation marks a quotation within takes 『』)
  const nest = (x) => x.replace(/「/g, '『').replace(/」/g, '』');
  const E_PANELS = [TALE.P1, TALE.P2, TALE.P3, TALE.P4].map(nest);
  const PANEL_EN = ['Though the sun was shining, it began to rain.', 'The villagers said, "It\'s a fox\'s wedding," and shut their doors.', 'Only Sayo lent the bride her umbrella.', 'The next morning, chestnuts had been left in thanks in front of Sayo\'s house.'];
  out += '\n@scene hall.w2.t1' + K.taskTrial({ w: W, k: 0, t: 't1',
    intro: ['narr: {雨宿|あまやど}り の {小屋|こや} に 、 {絵巻|えまき} が {掛|か}けて ある 。 || A picture scroll hangs in the rain shelter.']
      .concat(...[0, 1, 2, 3].map((i) => ['?(' + L.EF + ') narr: 「 ' + F_PANELS[i] + ' 。 」 || "' + PANEL_EN[i] + '"', '?(' + L.NOTF + ') narr: 「 ' + E_PANELS[i] + ' 。 」 || "' + PANEL_EN[i] + '"']),
      ['narr: {雨|あめ} の しずく が {落|お}ちて 、 {絵|え} の {順番|じゅんばん} が {乱|みだ}れた 。 || Raindrops fall on it, and the pictures slip out of order.']),
    task: 'hall.w2.story',
    after: ['narr: {絵巻|えまき} が 、 {元|もと} の {順番|じゅんばん} に {戻|もど}った 。 || The scroll is back in its order.', '!challenge hall.w2.story_q',
      '?(comp=nao) comp: {傘|かさ} {一本|いっぽん} で 、 {栗|くり} {一籠|ひとかご} か 。 {貸|か}し{借|か}り の {帳尻|ちょうじり} が 、 {合|あ}う {話|はなし} だ な 。 || One umbrella, one basket of chestnuts. A tale where the accounts balance.',
      '?(comp=mio) comp: {戸|と} を {閉|し}めない で 、 {傘|かさ} を {貸|か}す 。 …… {私|わたし} も 、 そういう {人|ひと} で いたい 。 || Not shutting the door: lending the umbrella. …That\'s the kind of person I want to be.',
      '?(comp=ren) comp: お{礼|れい} を {置|お}いて {行|い}く の は 、 {顔|かお} を {見|み}せない {礼儀|れいぎ} です 。 {狐|きつね} らしい です ね 。 || Leaving the thanks and going: a courtesy that doesn\'t show its face. Very like a fox.',
      '?(comp=suzu) comp: {帳簿|ちょうぼ} {的|てき} に は 、 {傘|かさ} が {貸|か}し で 、 {栗|くり} が お{返|かえ}し 。 {完璧|かんぺき} な {幕切|まくぎ}れ ね 。 || In the ledger: the umbrella the loan, the chestnuts the repayment. A perfect curtain.'],
    later: 'narr: {絵|え} は 、 {後|あと} で {並|なら}べ{直|なお}せる 。 || You can put the pictures in order later.',
    done: 'narr: {絵巻|えまき} は 、 {元|もと} の {順番|じゅんばん} で {掛|か}かって いる 。 || The scroll hangs in its proper order.' });

  // ---- t2: the gifts and their tags ------------------------------------------------------------------------------------
  // the tags: F in kana, E with kanji, I and A as a gift tag is really written (より for "from", 様 for "to")
  const TAG = {
    0: { red: ['はなよめ から はなむこ へ', '{花嫁|はなよめ} から {花婿|はなむこ} へ', '{花嫁|はなよめ} より {花婿|はなむこ} {様|さま} へ', 'From the bride, to the groom.', 'groom'],
      white: ['はなむこ から はなよめ の はは へ', '{花婿|はなむこ} から {花嫁|はなよめ} の {母|はは} へ', '{花婿|はなむこ} より {花嫁|はなよめ} の お{母|かあ}{様|さま} へ', 'From the groom, to the bride\'s mother.', 'mother'],
      chestnut: ['むら から なこうど へ', '{村|むら} から {仲人|なこうど} へ', '{村|むら} {一同|いちどう} より {仲人|なこうど} {様|さま} へ', 'From the village, to the go-between.', 'toku'] },
    1: { red: ['はなむこ から なこうど へ', '{花婿|はなむこ} から {仲人|なこうど} へ', '{花婿|はなむこ} より {仲人|なこうど} {様|さま} へ', 'From the groom, to the go-between.', 'toku'],
      white: ['はなよめ から はなむこ へ', '{花嫁|はなよめ} から {花婿|はなむこ} へ', '{花嫁|はなよめ} より {花婿|はなむこ} {様|さま} へ', 'From the bride, to the groom.', 'groom'],
      chestnut: ['むら から はなよめ の はは へ', '{村|むら} から {花嫁|はなよめ} の {母|はは} へ', '{村|むら} {一同|いちどう} より {花嫁|はなよめ} の お{母|かあ}{様|さま} へ', 'From the village, to the bride\'s mother.', 'mother'] },
  };
  const GIFT = { red: ['{赤|あか}い {包|つつ}み', 'a red bundle', 'the red bundle'], white: ['{白|しろ}い {箱|はこ}', 'a white box', 'the white box'], chestnut: ['{栗|くり} の {籠|かご}', 'a basket of chestnuts', 'the basket of chestnuts'] };
  const TRAY = { groom: ['{花婿|はなむこ} の {家|いえ} の {台|だい}', 'the groom\'s family\'s tray'], mother: ['{花嫁|はなよめ} の {母|はは} の {台|だい}', 'the bride\'s mother\'s tray'], toku: ['{仲人|なこうど} の {台|だい}', 'the go-between\'s tray'] };
  const HOLD = (g) => 'xp_hall_w2_f0_hold_' + g, PUT = (g) => 'xp_hall_w2_f0_put_' + g;
  for (const g of Object.keys(GIFT)) {
    out += `
@scene hall.w2.g_${g}
narr: ${GIFT[g][0]} 。 {札|ふだ} が {付|つ}いて いる 。 || ${GIFT[g][1][0].toUpperCase() + GIFT[g][1].slice(1)}, with a tag on it.
`;
    for (const p of [0, 1]) {
      const tg = TAG[p][g];
      out += `?(${both(L.EF, 'hall.w2.pat=' + p)}) narr: 「 ${tg[0]} 」 || "${tg[3]}"
?(${both(L.E, 'hall.w2.pat=' + p)}) narr: 「 ${tg[1]} 」 || "${tg[3]}"
?(${both(L.IA, 'hall.w2.pat=' + p)}) narr: 「 ${tg[2]} 」 || "${tg[3]}"
`;
    }
    out += `!unset ${Object.keys(GIFT).map(HOLD).join(' ')}
!set ${HOLD(g)}
narr: ${GIFT[g][0]} を {持|も}った 。 || You pick up ${GIFT[g][1]}.
`;
  }
  for (const t of Object.keys(TRAY)) {
    out += `
@scene hall.w2.tray_${t}
narr: ${TRAY[t][0]} 。 || ${TRAY[t][1][0].toUpperCase() + TRAY[t][1].slice(1)}.
`;
    out += Object.keys(GIFT).map((g) => `!if ${HOLD(g)} -> h_${g}\n`).join('') + '!end\n';
    for (const g of Object.keys(GIFT)) {
      const right = [0, 1].filter((p) => TAG[p][g][4] === t);
      out += `:h_${g}\n` + right.map((p) => `!if hall.w2.pat=${p} -> put_${g}\n`).join('') +
        `narr: ${GIFT[g][0]} は 、 ここ で は ない よう だ 。 {札|ふだ} を もう {一度|いちど} {読|よ}もう 。 || ${GIFT[g][2][0].toUpperCase() + GIFT[g][2].slice(1)} doesn't seem to belong here. Read the tag again.\n!end\n` +
        `:put_${g}\nnarr: ${GIFT[g][0]} を ${TRAY[t][0]} に {置|お}いた 。 || You set ${GIFT[g][2]} on ${TRAY[t][1]}.\n!unset ${HOLD(g)}\n!set ${PUT(g)}\n` +
        `!if ${Object.keys(GIFT).map(PUT).join('&')} -> all\n!refresh\n!end\n`;
    }
    out += `:all
narr: {三|みっ}つ の {贈|おく}り{物|もの} が 、 {正|ただ}しい {台|だい} に {揃|そろ}った 。 || The three gifts are each on the right tray.
?(comp) comp: {誰|だれ} から 、 {誰|だれ} へ 。 {札|ふだ} の {字|じ} {一|ひと}つ で 、 {行|い}き{先|さき} が {変|か}わる ん だ ね 。 || From whom, to whom. One word on a tag, and the gift goes somewhere else.
${K.mark(W, 0, 't2')}
`;
  }

  // ---- t3: the go-between's cards and her stone ----------------------------------------------------------------------
  const CE = {
    0: { F: ['The bride gave the groom chestnuts.', 'Sayo received chestnuts from the bride.', 'Toku gave Konta to the lantern.', 'Gin received an umbrella from Toku.'],
      E: ['The bride gave the groom chestnuts.', 'Sayo received chestnuts from the bride.', 'Toku gave Konta to the lantern.', 'Gin received an umbrella from Toku.'],
      I: ['My sister gave me an umbrella.', 'Toku gave my little brother chestnuts.', 'I "gave-toward-me" Sayo a cup.', 'Sayo gave us a lantern.'],
      A: ['Sayo kindly lent me an umbrella.', 'I lent Konta an umbrella, as a kindness.', 'I "kindly-toward-me" showed Toku the way.', 'I had the bride tie my hair.'] },
    1: { F: ['Gin gave Kozue a flower.', 'Konta received chestnuts from Toku.', 'The bride borrowed an umbrella from Sayo.', 'Toku received from Gin the lantern (in the wrong order).'],
      E: ['Gin gave Kozue a flower.', 'Konta received chestnuts from Toku.', 'The bride borrowed an umbrella from Sayo.', 'Toku received from Gin the lantern (in the wrong order).'],
      I: ['A friend gave me a letter.', 'The teacher gave my little sister a book.', 'The bride "gave-toward-me" the groom chestnuts.', 'A villager gave me an umbrella.'],
      A: ['Konta kindly showed me the way.', 'I had the groom pass the cup.', 'Toku "did-as-a-favour-outward" listening to me.', 'I carried the bride\'s luggage for her.'] },
  };
  out += '\n@scene hall.w2.t3' + K.taskTrial({ w: W, k: 0, t: 't3',
    intro: ['narr: {仲人|なこうど} の {石|いし} に 、 {字|じ} が {刻|きざ}んで ある 。 「 {四|よん} {枚|まい} の {札|ふだ} の うち 、 {一枚|いちまい} だけ が {間違|まちが}って いる 。 」 || Carved on the go-between\'s stone: "Of the four cards, one alone is wrong."'],
    task: { 0: 'hall.w2.counter0', 1: 'hall.w2.counter1' },
    after: ['narr: {間違|まちが}った {札|ふだ} が 、 {風|かぜ} に {飛|と}んで いった 。 || The wrong card blows away on the wind.', '?(comp) comp: {仲人|なこうど} は 、 {誰|だれ} が {誰|だれ} に 、 を {間違|まちが}えたら {仕事|しごと} に ならない から ね 。 || A go-between who mixes up who gives to whom is out of work.'],
    later: 'narr: {札|ふだ} を {一枚|いちまい} ずつ {読|よ}んで から 、 また {来|こ}よう 。 || Read the cards one by one, then come back.',
    done: 'narr: {石|いし} の {字|じ} は 、 もう {何|なに} も {問|と}わない 。 || The carving asks nothing more.' });
  for (let i = 0; i < 4; i++) {
    out += `\n@scene hall.w2.card${i + 1}\nnarr: {仲人|なこうど} の {練習|れんしゅう} の {札|ふだ} 。 || One of the go-between's practice cards.\n`;
    for (const p of [0, 1]) for (const tier of ['F', 'E', 'I', 'A']) out += `?(${both(L[tier], 'hall.w2.pat=' + p)}) narr: 「 ${C.hallW2Cards[p][tier][i][0]} 」 || "${CE[p][tier][i]}"\n`;
  }

  // ---- t4: the procession set in order ---------------------------------------------------------------------------------
  const ORD = { 0: ['bearer', 'toku', 'kozue', 'gin', 'porter'], 1: ['toku', 'bearer', 'gin', 'kozue', 'porter'] };
  // (the lantern-bearer and the porter they/them, Toku and Kozue she/her, Gin he/him)
  const ROLE = { bearer: ['{提灯持|ちょうちんも}ち', 'the lantern-bearer', 'hall_bearer', 'They take their'], toku: ['{仲人|なこうど}', 'the go-between', 'hall_toku', 'She takes her'], kozue: ['{花嫁|はなよめ}', 'the bride', 'hall_kozue', 'She takes her'], gin: ['{花婿|はなむこ}', 'the groom', 'hall_gin', 'He takes his'], porter: ['{荷物持|にもつも}ち', 'the porter', 'hall_porter', 'They take their'] };
  const CARD = {
    0: ['せんとう は ちょうちんもち 。 その うしろ に なこうど 。 なこうど の うしろ に はなよめ 。 はなよめ の うしろ に はなむこ 。 いちばん うしろ は にもつもち 。',
      '{先頭|せんとう} は {提灯持|ちょうちんも}ち 。 その {後|うし}ろ に {仲人|なこうど} 。 {仲人|なこうど} の {後|うし}ろ に {花嫁|はなよめ} 。 {花嫁|はなよめ} の {後|うし}ろ に {花婿|はなむこ} 。 {一番|いちばん} {後|うし}ろ は {荷物持|にもつも}ち 。',
      '{荷物持|にもつも}ち が {一番|いちばん} {後|うし}ろ 。 {花婿|はなむこ} は {荷物持|にもつも}ち の {前|まえ} 、 {花嫁|はなよめ} は {花婿|はなむこ} の {前|まえ} 。 {仲人|なこうど} は {花嫁|はなよめ} の {前|まえ} で 、 {先頭|せんとう} は {提灯持|ちょうちんも}ち 。',
      'At the front, the lantern-bearer. Behind them, the go-between. Behind the go-between, the bride. Behind the bride, the groom. Last of all, the porter.',
      'The porter at the very back. The groom in front of the porter, the bride in front of the groom. The go-between in front of the bride, and at the front, the lantern-bearer.'],
    1: ['せんとう は なこうど 。 なこうど の うしろ に ちょうちんもち 。 ちょうちんもち の うしろ に はなむこ 。 はなむこ の うしろ に はなよめ 。 いちばん うしろ は にもつもち 。',
      '{先頭|せんとう} は {仲人|なこうど} 。 {仲人|なこうど} の {後|うし}ろ に {提灯持|ちょうちんも}ち 。 {提灯持|ちょうちんも}ち の {後|うし}ろ に {花婿|はなむこ} 。 {花婿|はなむこ} の {後|うし}ろ に {花嫁|はなよめ} 。 {一番|いちばん} {後|うし}ろ は {荷物持|にもつも}ち 。',
      '{荷物持|にもつも}ち が {一番|いちばん} {後|うし}ろ 。 {花嫁|はなよめ} は {荷物持|にもつも}ち の {前|まえ} 、 {花婿|はなむこ} は {花嫁|はなよめ} の {前|まえ} 。 {提灯持|ちょうちんも}ち は {花婿|はなむこ} の {前|まえ} で 、 {先頭|せんとう} は {仲人|なこうど} 。',
      'At the front, the go-between. Behind the go-between, the lantern-bearer. Behind the lantern-bearer, the groom. Behind the groom, the bride. Last of all, the porter.',
      'The porter at the very back. The bride in front of the porter, the groom in front of the bride. The lantern-bearer in front of the groom, and at the front, the go-between.'],
  };
  out += `
@scene hall.w2.t4_card
narr: {行列|ぎょうれつ} の {並|なら}び{順|じゅん} を {書|か}いた {札|ふだ} 。 || A card with the procession's order on it.
`;
  for (const p of [0, 1]) out += `?(${both(L.EF, 'hall.w2.pat=' + p)}) narr: 「 ${CARD[p][0]} 」 || "${CARD[p][3]}"
?(${both(L.E, 'hall.w2.pat=' + p)}) narr: 「 ${CARD[p][1]} 」 || "${CARD[p][3]}"
?(${both(L.IA, 'hall.w2.pat=' + p)}) narr: 「 ${CARD[p][2]} 」 || "${CARD[p][4]}"
`;
  out += `?(comp&!hall.w2.t4) comp: {先頭|せんとう} から {順番|じゅんばん} に 、 {声|こえ} を かけて いこう 。 || Let's call them out in order, from the front.
`;
  const SENT = (r) => 'xp_hall_w2_f1_sent_' + r, AT = (r, i) => 'xp_hall_w2_f1_at_' + r + '_' + i, STEP = (i) => 'xp_hall_w2_f1_s' + i;
  const resetAll = '!unset ' + ORD[0].map(SENT).concat([1, 2, 3, 4].map(STEP)).concat(...ORD[0].map((r) => [1, 2, 3, 4, 5].map((i) => AT(r, i)))).join(' ');
  const SAYS = { bearer: '{提灯|ちょうちん} は {持|も}ちました 。 いつ {出|で}ましょう か 。 || I have the lantern. When shall I set off?', toku: 'さて 、 わたし は どこ を {歩|ある}けば いい の かね 。 || Now, where am I to walk?', kozue: '…… わたし は 、 {誰|だれ} の {後|うし}ろ を {歩|ある}けば いい の でしょう 。 || …Whom should I walk behind?', gin: '{花嫁|はなよめ} の {前|まえ} か 、 {後|うし}ろ か 。 {札|ふだ} に は {何|なん} と ？ || In front of the bride, or behind? What does the card say?', porter: '{荷物|にもつ} が {重|おも}くて 。 {早|はや}く {並|なら}びたい もん だ 。 || The luggage is heavy. I\'d like to get in line.' };
  for (const r of ORD[0]) {
    out += `
@scene hall.w2.l4_${r}
!faceplayer ${ROLE[r][2]}
!if hall.w2.t4 -> placed
${ROLE[r][2]}: ${SAYS[r]}
!if hall.w2.pat=1 -> p1
`;
    for (const p of [0, 1]) {
      const i = ORD[p].indexOf(r) + 1;
      out += (p === 1 ? ':p1\n' : '') + (i > 1 ? `!if !${STEP(i - 1)} -> wrong\n` : '') +
        `narr: ${ROLE[r][0]} に {声|こえ} を かけた 。 ${ROLE[r][0]} が 、 {道|みち} の {上|うえ} の {自分|じぶん} の {場所|ばしょ} に {立|た}った 。 || You call ${ROLE[r][1]} forward. ${ROLE[r][3]} place on the road.\n` +
        `!set ${SENT(r)} ${AT(r, i)}${i < 5 ? ' ' + STEP(i) : ''}\n` + (i === 5 ? '!goto all\n' : '!refresh\n!end\n');
    }
    out += `:wrong
narr: ${ROLE[r][0]} が {前|まえ} に {出|で}る と 、 {行列|ぎょうれつ} が ざわついた 。 「 {順番|じゅんばん} が {違|ちが}う よ 」 と 、 {皆|みな} が {元|もと} の {場所|ばしょ} に {戻|もど}って しまった 。 || As ${ROLE[r][1]} steps out, the procession stirs. "That's not the order," someone says, and they all drift back to where they were.
?(comp) comp: {札|ふだ} を もう {一度|いちど} {読|よ}もう 。 {誰|だれ} の {後|うし}ろ に {誰|だれ} 、 か 。 || Let's read the card again. Who walks behind whom.
${resetAll}
!refresh
!end
:all
narr: {行列|ぎょうれつ} が {揃|そろ}った 。 {提灯|ちょうちん} の {明|あか}かり が 、 {雨|あめ} の {中|なか} を {静|しず}か に {進|すす}み{始|はじ}める 。 || The procession stands complete. The lanterns' light begins to move quietly through the rain.
${K.mark(W, 1, 't4')}
!end
:placed
narr: {行列|ぎょうれつ} の {中|なか} で 、 {自分|じぶん} の {番|ばん} を {待|ま}って いる 。 || They wait in their place in the procession.
`;
  }
  out += `
@scene hall.w2.l4_placed
narr: {行列|ぎょうれつ} の {中|なか} で 、 {自分|じぶん} の {番|ばん} を {待|ま}って いる 。 || They wait in their place in the procession.

# ---- t5: foxfire in the rain ---------------------------------------------------------------------------------------
@scene hall.w2.t5
narr: {青|あお}い {火|ひ} が 、 {雨|あめ} に {溶|と}ける よう に {消|き}えた 。 || The blue flames fade, as if melting into the rain.
${K.mark(W, 1, 't5')}

# ---- t6: Sayo's seat at the feast (the list in your companion's hands; alone, Toku reads it) ------------------------
@scene hall.w2.t6
!if hall.w2.t6 -> done
!if xp_hall_w2_f1_asked -> told
narr: {机|つくえ} の {上|うえ} に 、 {宴|うたげ} の {席|せき} の {紙|かみ} 。 {細|こま}かい {字|じ} で 、 {名前|なまえ} が びっしり {書|か}いて ある 。 || On the desk, the feast's seating list, packed with names in tiny writing.
?(comp=nao) comp: {名前|なまえ} の {一覧|いちらん} か 。 {任|まか}せて くれ 。 {誰|だれ} を {探|さが}す ？ || A list of names. Leave it to me. Who are we looking for?
?(comp=mio) comp: {私|わたし} が {読|よ}む わ 。 {誰|だれ} の {席|せき} を {知|し}りたい の ？ || I'll read it. Whose seat do you want to know?
?(comp=ren) comp: {私|わたし} が {読|よ}みましょう 。 {誰|だれ} の {席|せき} です か 。 || I'll read it. Whose seat is it?
?(comp=suzu) comp: {座席表|ざせきひょう} なら {任|まか}せて 。 {一座|いちざ} の {興行|こうぎょう} で {毎晩|まいばん} {作|つく}って た から 。 {誰|だれ} の ？ || Leave seating plans to me. I made one every night for the troupe's shows. Whose?
?(!comp) hall_toku: {席|せき} の {紙|かみ} は 、 わたし が {読|よ}もう 。 {誰|だれ} の {席|せき} だい ？ || I'll read the list. Whose seat is it?
!hook hall_challenge hall.w2.ask
!if var._res=0 -> later
!set xp_hall_w2_f1_asked
:told
?(${both(L.EF, 'hall.w2.pat=0')}) narr: 「 サヨ の せき は 、 はなよめ の となり 。 」 || "Sayo's seat is next to the bride."
?(${both(L.E, 'hall.w2.pat=0')}) narr: 「 サヨ さん の {席|せき} は 、 {花嫁|はなよめ} の {隣|となり} です 。 」 || "Sayo's seat is next to the bride."
?(${both(L.IA, 'hall.w2.pat=0')}) narr: 「 サヨ さま の お{席|せき} は 、 {花嫁|はなよめ} の お{隣|となり} で ございます 。 」 || "Miss Sayo is to be seated beside the bride."
?(${both(L.EF, 'hall.w2.pat=1')}) narr: 「 サヨ の せき は 、 はなむこ の むかい 。 」 || "Sayo's seat is opposite the groom."
?(${both(L.E, 'hall.w2.pat=1')}) narr: 「 サヨ さん の {席|せき} は 、 {花婿|はなむこ} の {向|む}かい です 。 」 || "Sayo's seat is opposite the groom."
?(${both(L.IA, 'hall.w2.pat=1')}) narr: 「 サヨ さま の お{席|せき} は 、 {花婿|はなむこ} の お{向|む}かい で ございます 。 」 || "Miss Sayo is to be seated opposite the groom."
!end
:later
narr: {席|せき} の {紙|かみ} は 、 {机|つくえ} に {戻|もど}した 。 || You put the seating list back on the desk.
!end
:done
narr: サヨ の {名札|なふだ} が 、 {正|ただ}しい {席|せき} に {置|お}いて ある 。 || Sayo's name card is at the right seat.
`;
  for (const [seat, pat, where] of [['bride', 0, ['{花嫁|はなよめ} の {席|せき} の {隣|となり}', 'beside the bride\'s place']], ['groom', 1, ['{花婿|はなむこ} の {席|せき} の {向|む}かい', 'opposite the groom\'s place']]]) out += `
@scene hall.w2.t6_${seat}
!if hall.w2.t6 -> done
narr: ${where[0]} の {席|せき} 。 || The seat ${where[1]}.
!if !xp_hall_w2_f1_asked -> empty
!if hall.w2.pat=${pat} -> right
narr: {席|せき} の {紙|かみ} の {話|はなし} と 、 {違|ちが}う {場所|ばしょ} の よう だ 。 || This doesn't seem to be the place the list gave.
?(comp) comp: {紙|かみ} の {言葉|ことば} 、 もう {一度|いちど} {言|い}おう か ？ || Shall I say what the list said again?
!end
:right
narr: サヨ の {名札|なふだ} を 、 {席|せき} に {置|お}いた 。 || You set Sayo's name card at the place.
?(comp) comp: {傘|かさ} を {貸|か}した {人|ひと} が 、 {一番|いちばん} いい {席|せき} に {座|すわ}る 。 {正|ただ}しい {並|なら}び だ ね 。 || The one who lent the umbrella sits in the best seat. The right arrangement.
${K.mark(W, 1, 't6')}
!end
:empty
narr: {名札|なふだ} は 、 まだ {置|お}いて いない 。 || No name card has been set here yet.
!end
:done
narr: {名札|なふだ} が {置|お}いて ある 。 || A name card is set here.
`;
  // ---- t7: the riddle stone -------------------------------------------------------------------------------------------
  out += '\n@scene hall.w2.t7' + K.taskTrial({ w: W, k: 1, t: 't7',
    intro: ['narr: {苔|こけ} むした {石|いし} に 、 {字|じ} が {彫|ほ}って ある 。 「 {解|と}けた {者|もの} は 、 {一度|いちど} だけ 、 {帰|かえ}って また {来|く}る こと が できる 。 」 || Words cut into a mossy stone: "Whoever solves this may once go home and come back."'],
    task: 'hall.w2.riddle',
    after: ['narr: {石|いし} の {字|じ} が 、 {雨|あめ} に {濡|ぬ}れて {光|ひか}った 。 || The carving shines, wet with rain.'],
    later: 'narr: {答|こた}え は 、 {急|いそ}がなくて いい 。 || There\'s no hurry for the answer.',
    done: 'narr: {石|いし} は 、 {答|こた}え を {覚|おぼ}えて いる 。 || The stone remembers the answer.' });

  // ---- t8: the borrowed things, back to their owners ------------------------------------------------------------------
  const NOTE = {
    0: [['サヨ は はなよめ に かさ を かした 。', 'サヨ は {花嫁|はなよめ} に {傘|かさ} を {貸|か}した 。', 'Sayo lent the bride an umbrella.'],
      ['ギン は トク から ちょうちん を かりた 。', 'ギン は トク から {提灯|ちょうちん} を {借|か}りた 。', 'Gin borrowed a lantern from Toku.'],
      ['トク は コンタ の いえ から さかずき を かりた 。', 'トク は コンタ の {家|いえ} から {盃|さかずき} を {借|か}りた 。', 'Toku borrowed a cup from Konta\'s family.']],
    1: [['サヨ は コンタ の いえ から かさ を かりた 。', 'サヨ は コンタ の {家|いえ} から {傘|かさ} を {借|か}りた 。', 'Sayo borrowed an umbrella from Konta\'s family.'],
      ['トク は サヨ から ちょうちん を かりた 。', 'トク は サヨ から {提灯|ちょうちん} を {借|か}りた 。', 'Toku borrowed a lantern from Sayo.'],
      ['コンタ の いえ は トク から さかずき を かりた 。', 'コンタ の {家|いえ} は トク から {盃|さかずき} を {借|か}りた 。', 'Konta\'s family borrowed a cup from Toku.']],
  };
  const OWNER = { 0: { umbrella: 'sayo', lantern: 'toku', cup: 'konta' }, 1: { umbrella: 'konta', lantern: 'sayo', cup: 'toku' } };
  const THING = { umbrella: ['{傘|かさ}', 'the umbrella'], lantern: ['{提灯|ちょうちん}', 'the lantern'], cup: ['{盃|さかずき}', 'the cup'] };
  const DOOR = { sayo: ['サヨ の {家|いえ}', 'Sayo\'s house'], konta: ['コンタ の {家|いえ}', 'Konta\'s family\'s house'], toku: ['{仲人|なこうど} の {家|いえ}', 'the go-between\'s house'] };
  out += `
@scene hall.w2.t8_notes
narr: お{宮|みや} の {帳面|ちょうめん} 。 {借|か}りた {物|もの} が {書|か}いて ある 。 「 {式|しき} の {前|まえ} に 、 {持|も}ち{主|ぬし} に {返|かえ}す こと 。 」 || The shrine's ledger of things borrowed: "Return them to their owners before the ceremony."
`;
  for (const p of [0, 1]) for (const n of NOTE[p]) out += `?(${both(L.EF, 'hall.w2.pat=' + p)}) narr: 「 ${n[0]} 」 || "${n[2]}"\n?(${both(L.NOTF, 'hall.w2.pat=' + p)}) narr: 「 ${n[1]} 」 || "${n[2]}"\n`;
  out += `?(comp&!hall.w2.t8) comp: {貸|か}した {人|ひと} に {返|かえ}す 。 {借|か}りた {人|ひと} じゃ ない よ 。 || Back to whoever lent it. Not whoever borrowed it.\n`;
  const H8 = (x) => 'xp_hall_w2_f2_hold_' + x, B8 = (x) => 'xp_hall_w2_f2_back_' + x;
  for (const x of Object.keys(THING)) out += `
@scene hall.w2.th_${x}
!unset ${Object.keys(THING).map(H8).join(' ')}
!set ${H8(x)}
narr: ${THING[x][0]} を {持|も}った 。 {持|も}ち{主|ぬし} に {返|かえ}そう 。 || You pick up ${THING[x][1]}, to take back to its owner.
`;
  for (const d of Object.keys(DOOR)) {
    out += `
@scene hall.w2.door_${d}
narr: ${DOOR[d][0]} の {戸口|とぐち} 。 || The door of ${DOOR[d][1]}.
${Object.keys(THING).map((x) => `!if ${H8(x)} -> h_${x}`).join('\n')}
!end
`;
    for (const x of Object.keys(THING)) {
      const right = [0, 1].filter((p) => OWNER[p][x] === d);
      out += `:h_${x}\n` + right.map((p) => `!if hall.w2.pat=${p} -> back_${x}\n`).join('') +
        `narr: ${THING[x][0]} の {持|も}ち{主|ぬし} は 、 ここ で は ない よう だ 。 {帳面|ちょうめん} を もう {一度|いちど} {読|よ}もう 。 || ${THING[x][1][0].toUpperCase() + THING[x][1].slice(1)} doesn't belong here, it seems. Read the ledger again.\n!end\n` +
        `:back_${x}\nnarr: ${THING[x][0]} を {返|かえ}した 。 「 ありがとう 」 と 、 {戸|と} の {向|む}こう から {声|こえ} が した 。 || You return ${THING[x][1]}. "Thank you," says a voice behind the door.\n!unset ${H8(x)}\n!set ${B8(x)}\n` +
        `!if ${Object.keys(THING).map(B8).join('&')} -> all\n!refresh\n!end\n`;
    }
    out += `:all
narr: {借|か}りた {物|もの} が 、 {全部|ぜんぶ} {持|も}ち{主|ぬし} の {所|ところ} に {戻|もど}った 。 || Every borrowed thing is back with its owner.
${K.mark(W, 2, 't8')}
`;
  }
  out += `
# ---- t9: Konta ------------------------------------------------------------------------------------------------------
@scene hall.w2.t9
!faceplayer hall_konta
hall_konta: …… {来|こ}ない で ！ この {傘|かさ} は 、 {誰|だれ} に も あげない ！ || …Don't come near! I'm not giving this umbrella to anyone!
!encounter hall.w2.konta
!if var._enc=given -> given
hall_konta: …… {雨|あめ} 、 やまなければ いい のに 。 || …I wish the rain would never stop.
!end
:given
hall_konta: {姉|ねえ}ちゃん に 、 あげて くる 。 {雨|あめ} の {中|なか} 、 {濡|ぬ}れない よう に 。 || I'll go and give it to my sister. So she doesn't get wet in the rain.
${K.mark(W, 2, 't9')}

@scene hall.w2.konta_after
!faceplayer hall_konta_after
!if hall.w2.t10 -> done
hall_konta: {姉|ねえ}ちゃん が 、 {傘|かさ} を {持|も}って くれた 。 …… {僕|ぼく} が あげた {傘|かさ} だ よ 。 || My sister's carrying the umbrella. …The one I gave her.
!end
:done
hall_konta: {姉|ねえ}ちゃん 、 {時々|ときどき} {帰|かえ}って くる って 。 {雨|あめ} の {日|ひ} に 。 || My sister says she'll come home sometimes. On rainy days.

# ---- t10: the cup passed round -----------------------------------------------------------------------------------------
@scene hall.w2.t10
!if !hall.w2.t8 -> wait
!if !hall.w2.t9 -> wait
narr: {花嫁|はなよめ} と {花婿|はなむこ} が 、 {台|だい} の {前|まえ} に {並|なら}んだ 。 トク が {盃|さかずき} を {手|て} に {取|と}る 。 || The bride and groom stand side by side at the table. Toku takes up the cup.
!encounter hall.w2.cups
!if var._res=0 -> later
!set xp_hall_w2_f2_t10
!hook hall_trial w2 t10
!if var._res=1 -> finale
!refresh
!end
:finale
!call hall.w2.end
!end
:wait
narr: {台|だい} の {前|まえ} に は 、 まだ {誰|だれ} も いない 。 {借|か}りた {物|もの} が {戻|もど}り 、 コンタ が {泣|な}き{止|や}む まで 、 {式|しき} は {始|はじ}まらない よう だ 。 || Nobody is at the table yet. The ceremony won't begin, it seems, until the borrowed things are back and Konta has stopped crying.
!end
:later
narr: {盃|さかずき} は 、 {台|だい} の {上|うえ} で {待|ま}って いる 。 || The cup waits on the table.

# ---- the tale's end ----------------------------------------------------------------------------------------------------
@scene hall.w2.end
!sequence hall.w2 begin
!shot tale
narr: {雨|あめ} が {止|や}んだ 。 {行列|ぎょうれつ} の {提灯|ちょうちん} が 、 {鳥居|とりい} の {奥|おく} へ {一|ひと}つ ずつ {消|き}えて いく 。 || The rain stops. One by one the procession's lanterns vanish beyond the torii.
hall_kozue: {傘|かさ} を {貸|か}して くれた {人|ひと} の こと 、 {忘|わす}れません 。 {弟|おとうと} の こと も 、 よろしく 。 || I won't forget the one who lent me an umbrella. Look after my little brother for me.
narr: {次|つぎ} の {朝|あさ} 、 サヨ の {家|いえ} の {前|まえ} に 、 {栗|くり} の {籠|かご} が {置|お}いて あった 。 {札|ふだ} に は 、 {小|ちい}さな {狐|きつね} の {足跡|あしあと} 。 || The next morning a basket of chestnuts sits at Sayo's door. On its tag, a small fox's footprint.
?(comp=nao) comp: {差出人|さしだしにん} の {名前|なまえ} の {代|か}わり に 、 {足跡|あしあと} か 。 {粋|いき} だ な 。 || A footprint instead of the sender's name. Stylish.
?(comp=mio) comp[happy]: {誰|だれ} が {誰|だれ} に 、 {何|なに} を 。 {全部|ぜんぶ} {分|わ}かる と 、 {優|やさ}しい {話|はなし} だった のね 。 || Who gave what to whom. Once you know all of it, it was a gentle tale.
?(comp=ren) comp: {灯|ひ} が {二|ふた}つ 、 {戻|もど}りました 。 {借|か}りた {物|もの} を {返|かえ}す の も 、 {灯|ひ} を {守|まも}る の と {同|おな}じ です ね 。 || Two lights back. Returning what you borrowed is a kind of lamp-keeping too.
?(comp=suzu) comp: {第|だい}{二幕|にまく} 、 {幕|まく} ！ {貸|か}し{借|か}り は 、 {全部|ぜんぶ} {返|かえ}した 。 {拍手|はくしゅ} ！ || End of act two! Every loan paid back. Applause!
!sequence hall.w2 end
narr: {雨上|あまあ}がり の {光|ひかり} が {畳|たた}まれる よう に {小|ちい}さく なって 、 {気|き}が {付|つ}く と 、 {館|やかた} の {囲炉裏|いろり} の {前|まえ} に いた 。 || The after-rain light folds small, and when you look up you are by the hall's hearth.
!set hall_w2_done
!hook hall_finish
`;
  RB.script.add(out);
})(RB.content);
