/* The Hall of a Hundred Tales, wing 8, Three Witnesses at the Inn: the scenes (expansion P15; plan 04_DUNGEONS.md D9;
 * maps in 32_w8_maps.js, tasks and encounters in 33_w8_learning.js). Each trial sets its floor's own flag and tells
 * the Hall; what a trial shows follows the level its task is set at (the profile, or one up on the Grow route); the
 * pattern (hall.w8.pat) chooses the accounts on the slips, which accounts hold at the witnesses' places, the road in
 * Hisa's note and the prints' places. Omatsu and Saki she/her, Tōsuke, Gonroku and Kichibei he/him, Hisa they/them.
 * Suzu's lines have Kansai versions (src/content/dialect/kansai_99_hall.js). */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const K = C.hallKit, W = 'w8', L = K.lv(W), both = L.both;
  const TALE = C.hallW8Tale, FT = C.hallW8TaleF;
  const nest = (x) => x.replace(/「/g, '『').replace(/」/g, '』');
  const cap = (x) => x[0].toUpperCase() + x.slice(1);
  const LV = (fn) => [0, 1].flatMap((p) => ['F', 'E', 'I', 'A'].map((t) => fn(p, t))).join('');
  const LV3 = (fn) => [0, 1].flatMap((p) => [['EF', 0], ['E', 1], ['IA', 2]].map(([t, i]) => fn(p, t, i))).join('');
  const LVN3 = (fn) => [['EF', 0], ['E', 1], ['IA', 2]].map(([t, i]) => fn(t, i)).join('');
  let out = `
@scene hall.w8.f1_first
!set hall_w8_f1_seen
narr: {紙|かみ} の {戸|と} を {抜|ぬ}ける と 、 {雪|ゆき} に {埋|う}もれた {街道|かいどう} の {宿|やど} だった 。 {窓|まど} に {灯|ひ} が {点|つ}いて いる のに 、 {中|なか} は {妙|みょう} に {静|しず}か だ 。 || Through the paper screen: an inn on the old highway, buried in snow. Its windows are lit, but inside it is strangely quiet.
?(comp=nao) comp: {宿|やど} で {物|もの} が {無|な}くなる と 、 {一晩|ひとばん} で {話|はなし} が {三倍|さんばい} に なる 。 {配達|はいたつ} で {何度|なんど} も {見|み}た 。 || When something goes missing at an inn, the story triples overnight. I've seen it on my rounds a dozen times.
?(comp=mio) comp: {何|なに} か あった みたい ね 。 {皆|みな} 、 {顔|かお} が {強張|こわば}って いる わ 。 || Something seems to have happened. Everyone's faces are tight.
?(comp=ren) comp: {雪|ゆき} の {夜|よる} の {宿|やど} は 、 {灯|ひ} が {一番|いちばん} {大事|だいじ} な {場所|ばしょ} です 。 …… {何|なに} か {失|な}くした {人|ひと} の {顔|かお} が {見|み}えます 。 || A snowbound inn is where light matters most. …I can see the faces of people who've lost something.
?(comp=suzu) comp: {第|だい}{八幕|はちまく} は 、 {推理|すいり} の {芝居|しばい} ね 。 {証人|しょうにん} が {三人|さんにん} 、 {話|はなし} が {三|みっ}つ 。 {面白|おもしろ}く なり そう 。 || Act eight: a detective play. Three witnesses, three stories. This should be good.
?(!comp) narr: {雪|ゆき} を {踏|ふ}む {自分|じぶん} の {足音|あしおと} だけ が 、 {大|おお}きく {聞|き}こえる 。 || Only your own footsteps in the snow sound loud.

@scene hall.w8.f2_first
!set hall_w8_f2_seen
narr: {宿|やど} の {裏|うら} の {庭|にわ} 。 {夜|よる} の {間|あいだ} に {積|つ}もった {雪|ゆき} に 、 {誰|だれ} か が {歩|ある}いた {跡|あと} が {残|のこ}って いる 。 || The yard behind the inn. In the snow that fell overnight, someone's tracks remain.
?(comp) comp: {証人|しょうにん} が {立|た}って いた {場所|ばしょ} に {行|い}けば 、 {本当|ほんとう} に {見|み}えた か 、 {聞|き}こえた か 、 {確|たし}かめられる ね 。 || If we go to where each witness was, we can check whether they really could have seen or heard it.

@scene hall.w8.f3_first
!set hall_w8_f3_seen
narr: {朝|あさ} の {座敷|ざしき} 。 {開|あ}けた {障子|しょうじ} の {向|む}こう 、 {雪|ゆき} の {庭|にわ} に {足跡|あしあと} が {四|よっ}つ {並|なら}んで いる 。 {火鉢|ひばち} の {側|そば} で 、 サキ と ゴンロク が {睨|にら}み{合|あ}って いる 。 || The morning room. Beyond the open doors, four sets of prints cross the snowy garden. By the brazier, Saki and Gonroku are glaring at each other.
?(comp=nao) comp: {朝|あさ} から {喧嘩|けんか} か 。 {寝不足|ねぶそく} の {顔|かお} だ な 、 {二人|ふたり} と も 。 || Quarrelling first thing. They both look short on sleep.
?(comp=mio) comp: {足跡|あしあと} は 、 {嘘|うそ} を つかない わ 。 {人|ひと} の {話|はなし} より 、 {先|さき} に {見|み}て みましょう 。 || Footprints don't lie. Let's look at them before we listen to anyone.
?(comp=ren) comp: {雪|ゆき} は 、 {夜|よる} の {間|あいだ} の こと を {全部|ぜんぶ} {覚|おぼ}えて います 。 {読|よ}み{方|かた} さえ {分|わ}かれば 。 || The snow remembers everything that happened in the night, if you know how to read it.
?(comp=suzu) comp: {大詰|おおづ}め の {前|まえ} の {言|い}い{争|あらそ}い 。 {推理|すいり} {劇|げき} の {定番|ていばん} よ 。 || An argument before the final scene. Every whodunit has one.

@scene hall.w8.bench1
!hook hall_station w8_b1

@scene hall.w8.bench2
!hook hall_station w8_b2

@scene hall.w8.bench3
!hook hall_station w8_b3

@scene hall.w8.spring
narr: {裏庭|うらにわ} の {井戸|いど} 。 {釣瓶|つるべ} の {縄|なわ} に 、 {霜|しも} が {付|つ}いて いる 。 || The back-yard well. There is frost on the bucket rope.
!hook hall_station w8_sp

@scene hall.w8.omatsu
!faceplayer hall_omatsu
!if hall.w8.t2 -> done
hall_omatsu: {十年|じゅうねん} {預|あず}かって いた {箱|はこ} が 、 {一晩|ひとばん} で {消|き}えました 。 {皆|みな} の {話|はなし} を {紙|かみ} に {書|か}いた けれど 、 {見|み}た {話|はなし} と {聞|き}いた {話|はなし} が 、 ごちゃまぜ で 。 {分|わ}けて もらえます か 。 || A box I'd kept for ten years has vanished overnight. I wrote down what everyone said, but what they saw and what they only heard are all jumbled. Would you sort them?
!end
:done
hall_omatsu: {見|み}た こと 、 {聞|き}こえた こと 、 {聞|き}いた {話|はなし} 、 {思|おも}った こと 。 {分|わ}ける と 、 {少|すこ}し {見|み}えて きます ね 。 || What was seen, what was heard, what was told, what was guessed. Sorted, it starts to make sense.

@scene hall.w8.omatsu2
!faceplayer hall_omatsu2
hall_omatsu: {箱|はこ} の {置|お}いて あった {床|とこ} の {間|ま} に 、 {紙|かみ} が {一枚|いちまい} 。 {孫|まご} の ヒサ の {字|じ} です 。 {私|わたし} の {目|め} で は 、 もう {細|こま}かい {字|じ} が {読|よ}めなくて 。 || Where the box stood in the alcove, there's a sheet of paper. My grandchild Hisa's hand. My eyes can't manage small writing any more.

@scene hall.w8.omatsu3
!faceplayer hall_omatsu3
!if hall.w8.t10 -> done
hall_omatsu: {宿|やど} の {帳面|ちょうめん} に 、 {昨夜|ゆうべ} の こと を {書|か}き{残|のこ}して おきたい の です 。 {本当|ほんとう} の こと だけ を 。 || I want to set down last night in the inn's ledger. Only what's true.
!end
:done
hall_omatsu: {帳面|ちょうめん} に は 、 {見|み}た こと と {聞|き}いた こと が 、 {分|わ}けて {書|か}いて あります 。 {十年|じゅうねん} {後|ご} に {読|よ}んで も 、 {分|わ}かる よう に 。 || The ledger keeps what was seen and what was heard apart, so that it will still make sense in ten years.
`;

  // ---- t1: the story room ----------------------------------------------------------------------------------------------
  const E_PANELS = [TALE.P1, TALE.P2, TALE.P3, TALE.P4].map(nest);
  const F_PANELS = FT.map(nest);
  const PANEL_EN = ['One snowy night, a box left in safekeeping vanished from the inn on the pass.', 'The maid said, "I saw a shadow"; the pedlar said, "I heard footsteps."', 'The old guest said, "It seems to be a fox\'s doing."', 'Putting the three accounts together, a single set of small footprints came into view.'];
  out += '\n@scene hall.w8.t1' + K.taskTrial({ w: W, k: 0, t: 't1',
    intro: ['narr: {奥|おく} の {部屋|へや} に 、 {絵巻|えまき} が {掛|か}けて ある 。 || A picture scroll hangs in the back room.']
      .concat(...[0, 1, 2, 3].map((i) => ['?(' + L.EF + ') narr: 「 ' + F_PANELS[i] + ' 。 」 || "' + PANEL_EN[i] + '"', '?(' + L.NOTF + ') narr: 「 ' + E_PANELS[i] + ' 。 」 || "' + PANEL_EN[i] + '"']),
      ['narr: {戸|と} の {隙間|すきま} から {雪|ゆき} {風|かぜ} が {吹|ふ}き{込|こ}んで 、 {絵|え} の {順番|じゅんばん} が {乱|みだ}れた 。 || A snowy draught blows in through the door, and the pictures slip out of order.']),
    task: 'hall.w8.story',
    after: ['narr: {絵巻|えまき} が 、 {元|もと} の {順番|じゅんばん} に {戻|もど}った 。 || The scroll is back in its order.', '!challenge hall.w8.story_q',
      '?(comp=nao) comp: {一人|ひとり} の {話|はなし} だけ を {信|しん}じる と 、 {間違|まちが}える 。 {三人|さんにん} {分|ぶん} を {並|なら}べて 、 {初|はじ}めて {見|み}える 。 || Believe one account alone and you go wrong. Lay all three side by side, and it shows.',
      '?(comp=mio) comp: {見|み}た 、 {聞|き}こえた 、 らしい 。 {同|おな}じ {夜|よる} の {話|はなし} でも 、 {確|たし}かさ が {全然|ぜんぜん} {違|ちが}う のね 。 || Saw, heard, seems. The same night, but how sure each one is couldn\'t be more different.',
      '?(comp=ren) comp: {狐|きつね} の {話|はなし} が 、 {一番|いちばん} {大|おお}きな {声|こえ} でした ね 。 {一番|いちばん} {確|たし}か で は ない のに 。 || The fox story was the loudest, wasn\'t it. Though it was the least certain.',
      '?(comp=suzu) comp: {証人|しょうにん} が {三人|さんにん} 、 {誰|だれ} も {嘘|うそ} は ついて ない 。 でも {誰|だれ} も {全部|ぜんぶ} は {知|し}らない 。 {上手|じょうず} な {脚本|きゃくほん} ね 。 || Three witnesses, none of them lying, none of them knowing it all. Clever writing.'],
    later: 'narr: {絵|え} は 、 {後|あと} で {並|なら}べ{直|なお}せる 。 || You can put the pictures in order later.',
    done: 'narr: {絵巻|えまき} は 、 {元|もと} の {順番|じゅんばん} で {掛|か}かって いる 。 || The scroll hangs in its proper order.' });

  // ---- t2: what each witness said, sorted by how they know it ------------------------------------------------------------------
  const KIND = { seen: ['{見|み}た こと', 'what was seen'], heard: ['{聞|き}こえた こと', 'what was heard'], told: ['{人|ひと} から {聞|き}いた こと', 'what someone was told'], guess: ['{思|おも}った こと', 'what was only guessed'] };
  const SLIP = {
    0: {
      s1: ['seen', 'サキ ： 「 だいどころ から 、 ちいさい かげ を みた 。 」', 'サキ ： 「 {台所|だいどころ} から 、 {小|ちい}さい {影|かげ} を {見|み}ました 。 」', 'サキ ： 「 {台所|だいどころ} の {窓|まど} から 、 {床|とこ} の {間|ま} の {前|まえ} を {通|とお}る {小|ちい}さな {影|かげ} が 、 {確|たし}か に {見|み}えました 。 」', 'Saki: "From the kitchen, I saw a small shadow."'],
      s2: ['heard', 'トウスケ ： 「 かいだん で 、 あしおと が きこえた 。 」', 'トウスケ ： 「 {階段|かいだん} で 、 {足音|あしおと} が {聞|き}こえた 。 」', 'トウスケ ： 「 {夜中|よなか} に 、 {階段|かいだん} が きしむ {音|おと} が {二度|にど} 、 {聞|き}こえた ん だ 。 」', 'Tōsuke: "I heard footsteps on the stairs."'],
      s3: ['told', 'ゴンロク ： 「 むら の ひと に よる と 、 この へん に きつね が でる そう だ 。 」', 'ゴンロク ： 「 {村|むら} の {人|ひと} に よる と 、 この {辺|へん} に は {狐|きつね} が {出|で}る そう だ 。 」', 'ゴンロク ： 「 {村|むら} の {者|もの} の {話|はなし} で は 、 この {辺|あた}り に は {昔|むかし} から {狐|きつね} が {出|で}る と の こと じゃ 。 」', 'Gonroku: "The villagers say foxes come round here."'],
      s4: ['guess', 'ゴンロク ： 「 きつね が もって いった の かも しれない 。 」', 'ゴンロク ： 「 {狐|きつね} が {持|も}って いった の かも しれない 。 」', 'ゴンロク ： 「 どう やら 、 {狐|きつね} の {仕業|しわざ} らしい の う 。 」', 'Gonroku: "Maybe a fox took it."'],
      s5: ['seen', 'オマツ ： 「 ねる まえ に 、 はこ は とこのま に あった 。 みた よ 。 」', 'オマツ ： 「 {寝|ね}る {前|まえ} に 、 {箱|はこ} は {床|とこ} の {間|ま} に ありました 。 この {目|め} で {見|み}ました 。 」', 'オマツ ： 「 {休|やす}む {前|まえ} に {見|み}{回|まわ}った とき 、 {箱|はこ} は {確|たし}か に {床|とこ} の {間|ま} に ありました 。 」', 'Omatsu: "Before bed, the box was in the alcove. I saw it."'] },
    1: {
      s1: ['heard', 'サキ ： 「 うら の と が あく おと が きこえた 。 」', 'サキ ： 「 {裏|うら} の {戸|と} が {開|あ}く {音|おと} が {聞|き}こえました 。 」', 'サキ ： 「 {明|あ}け{方|がた} 、 {裏|うら} の {戸|と} が そっと {開|あ}く {音|おと} が 、 {確|たし}か に {聞|き}こえました 。 」', 'Saki: "I heard the back door open."'],
      s2: ['seen', 'トウスケ ： 「 にわ に 、 ちいさい あしあと を みた 。 」', 'トウスケ ： 「 {庭|にわ} に 、 {小|ちい}さい {足跡|あしあと} を {見|み}た 。 」', 'トウスケ ： 「 {朝|あさ} 、 {雪|ゆき} の {庭|にわ} に {小|ちい}さな {足跡|あしあと} が {続|つづ}いて いる の を 、 この {目|め} で {見|み}た 。 」', 'Tōsuke: "I saw small footprints in the yard."'],
      s3: ['told', 'サキ ： 「 おかみさん が 、 はこ は だいじ だ って いって た 。 」', 'サキ ： 「 おかみ さん が 、 {箱|はこ} は {大事|だいじ} な {物|もの} だ と {言|い}って いました 。 」', 'サキ ： 「 おかみ さん から 、 あの {箱|はこ} は {人|ひと} から の {預|あず}かり{物|もの} だ と {聞|き}いて います 。 」', 'Saki: "The landlady told me the box is precious."'],
      s4: ['told', 'ゴンロク ： 「 きのう 、 となり の むら に たびびと が きた そう だ 。 」', 'ゴンロク ： 「 {昨日|きのう} 、 {隣|となり} の {村|むら} に {旅人|たびびと} が {来|き}た そう だ 。 」', 'ゴンロク ： 「 {行商人|ぎょうしょうにん} の {話|はなし} に よる と 、 {昨日|きのう} {隣村|となりむら} に {年寄|としよ}り の {旅人|たびびと} が {着|つ}いた と の こと じゃ 。 」', 'Gonroku: "They say a traveller came to the next village yesterday."'],
      s5: ['guess', 'トウスケ ： 「 こども が もって いった みたい だ 。 」', 'トウスケ ： 「 {子供|こども} が {持|も}って いった みたい だ 。 」', 'トウスケ ： 「 あの {足跡|あしあと} の {大|おお}きさ から する と 、 {子供|こども} が {持|も}ち{出|だ}した よう だ な 。 」', 'Tōsuke: "It looks as if a child took it."'] },
  };
  const SLIPS = ['s1', 's2', 's3', 's4', 's5'];
  const HOLDS = (s) => 'xp_hall_w8_f0_hold_' + s, PUT = (s) => 'xp_hall_w8_f0_put_' + s;
  for (const sl of SLIPS) {
    out += `
@scene hall.w8.${sl}
narr: オマツ が {書|か}いた {紙|かみ} 。 || A slip in Omatsu's hand.
`;
    out += LV3((p, t, i) => `?(${both(L[t], 'hall.w8.pat=' + p)}) narr: 「 ${nest(SLIP[p][sl][i + 1])} 」 || "${SLIP[p][sl][4]}"\n`);
    out += `!unset ${SLIPS.map(HOLDS).join(' ')}
!set ${HOLDS(sl)}
narr: {紙|かみ} を {手|て} に {取|と}った 。 || You pick up the slip.
`;
  }
  for (const k of Object.keys(KIND)) {
    const ok = [0, 1].flatMap((p) => SLIPS.filter((sl) => SLIP[p][sl][0] === k).map((sl) => [p, sl]));
    out += `
@scene hall.w8.to_${k}
narr: {箱|はこ} に 「 ${KIND[k][0]} 」 と {書|か}いて ある 。 || A tray marked "${KIND[k][1]}".
${ok.map(([p, sl]) => '!if hall.w8.pat=' + p + '&' + HOLDS(sl) + ' -> ok_' + sl + '_' + p).join('\n')}
!if ${SLIPS.map(HOLDS).join('|')} -> no
!end
:no
narr: {入|い}れよう と して 、 {手|て} を {止|と}めた 。 この {言|い}い{方|かた} は 、 この {箱|はこ} に は {合|あ}わない 。 || You go to put it in, and stop. The way it is said doesn't fit this tray.
!end
`;
    for (const [p, sl] of ok) out += `:ok_${sl}_${p}
narr: {紙|かみ} を 「 ${KIND[k][0]} 」 の {箱|はこ} に {入|い}れた 。 || You put the slip in the tray for ${KIND[k][1]}.
!unset ${HOLDS(sl)}
!set ${PUT(sl)}
!goto check
`;
    out += `:check
!if ${SLIPS.map(PUT).join('&')} -> all
!refresh
!end
:all
narr: {五枚|ごまい} の {紙|かみ} が 、 {四|よっ}つ の {箱|はこ} に {分|わ}けられた 。 || The five slips are sorted into the four trays.
?(comp) comp: {見|み}た 、 {聞|き}こえた 、 {聞|き}いた 、 {思|おも}った 。 {分|わ}けて みる と 、 {狐|きつね} の {話|はなし} は {一枚|いちまい} も 「 {見|み}た 」 に {入|はい}って いない ね 。 || Seen, heard, told, guessed. Sorted, not one slip about the fox is in "seen".
${K.mark(W, 0, 't2')}
!end
`;
  }

  // ---- t3: the inn's scrolls ---------------------------------------------------------------------------------------------------
  const CE = {
    0: { F: ['It might rain tomorrow.', 'That person is probably a teacher.', 'Probably, certainly, (they) will come.', 'The clouds are dark, so it might rain.'],
      E: ['This cake looks delicious.', 'It looks like rain.', 'Teacher-sou da (a form that doesn\'t exist).', 'I hear it will rain tomorrow.'],
      I: ['The lights are off. It seems nobody is home.', 'They left at three, so they should have arrived by now.', 'The ground outside the window is wet. It seems to have rained.', 'When I tasted it, it looked delicious.'],
      A: ['These prints must be a child\'s.', 'According to the letter, they arrive next week.', 'It isn\'t certain, but the culprit must be him.', 'Rumour has it a fox appears.'] },
    1: { F: ['I may have caught a cold.', 'It will probably be fine tomorrow.', 'Surely, probably, (they) will come.', 'The sky is red, so it will probably be fine tomorrow.'],
      E: ['A face about to burst into tears.', 'I hear the countryside is quiet.', '(Looking at the cover) I hear this book is interesting.', 'I hear it will clear up in the afternoon.'],
      I: ['It seems nobody is here.', 'The key should be on the desk.', 'It seems he isn\'t coming.', 'My name, it seems, is Tanaka.'],
      A: ['According to the inn, it is to snow tomorrow.', 'With this much evidence, it must be him.', 'The doctor says it will heal in a week.', 'I am told I had a fever yesterday.'] },
  };
  out += '\n@scene hall.w8.t3' + K.taskTrial({ w: W, k: 0, t: 't3',
    intro: ['narr: {廊下|ろうか} の {掛|か}け{軸|じく} に 、 {四|よっ}つ の {言葉|ことば} 。 {一番|いちばん} {奥|おく} の {軸|じく} に は 、 「 {一|ひと}つ だけ が {間違|まちが}って いる 。 」 と ある 。 || Four sayings on the corridor\'s hanging scrolls. The last scroll reads: "One alone is wrong."'],
    task: { 0: 'hall.w8.counter0', 1: 'hall.w8.counter1' },
    after: ['narr: {間違|まちが}った {言葉|ことば} の {墨|すみ} が 、 すうっと {薄|うす}れて {消|き}えた 。 || The ink of the wrong saying fades away.', '?(comp) comp: どれ だけ {確|たし}か か を {言|い}い{間違|まちが}える と 、 {話|はなし} が {全部|ぜんぶ} {信用|しんよう} できなく なる から ね 。 || Get how sure you are wrong, and nobody can trust any of it.'],
    later: 'narr: {言葉|ことば} を {一|ひと}つ ずつ {読|よ}んで から 、 また {来|こ}よう 。 || Read the sayings one by one, then come back.',
    done: 'narr: {掛|か}け{軸|じく} は 、 もう {何|なに} も {問|と}わない 。 || The scrolls ask nothing more.' });
  for (let i = 0; i < 4; i++) {
    out += `\n@scene hall.w8.card${i + 1}\nnarr: {古|ふる}い {掛|か}け{軸|じく} 。 {言葉|ことば} が {書|か}いて ある 。 || An old hanging scroll, with a saying on it.\n`;
    out += LV((p, t) => `?(${both(L[t], 'hall.w8.pat=' + p)}) narr: 「 ${nest(C.hallW8Cards[p][t][i][0])} 」 || "${CE[p][t][i]}"\n`);
  }

  // ---- t4: the witnesses' places --------------------------------------------------------------------------------------------------
  const CLAIM = {
    kitchen: ['サキ ： 「 だいどころ の まど から 、 とこのま の まえ を とおる かげ を みた 。 」', 'サキ ： 「 {台所|だいどころ} の {窓|まど} から 、 {床|とこ} の {間|ま} の {前|まえ} を {通|とお}る {影|かげ} を {見|み}ました 。 」', 'サキ ： 「 {台所|だいどころ} の {窓|まど} から 、 {床|とこ} の {間|ま} の {前|まえ} を {横切|よこぎ}る {影|かげ} が 、 {確|たし}か に {見|み}えました 。 」', 'Saki: "From the kitchen window I saw a shadow pass in front of the alcove."'],
    stairs: ['トウスケ ： 「 かいだん が 、 ぎしぎし なる おと が きこえた 。 」', 'トウスケ ： 「 {階段|かいだん} が ぎしぎし {鳴|な}る {音|おと} が {聞|き}こえた 。 」', 'トウスケ ： 「 {夜中|よなか} に 、 {階段|かいだん} の きしむ {音|おと} が {二度|にど} {聞|き}こえた ん だ 。 」', 'Tōsuke: "I heard the stairs creak."'],
    backdoor: ['オマツ ： 「 ねる まえ に 、 うら の と に かんぬき を かけた 。 そと から は 、 だれ も はいれない 。 」', 'オマツ ： 「 {寝|ね}る {前|まえ} に 、 {裏|うら} の {戸|と} に {閂|かんぬき} を {掛|か}けました 。 {外|そと} から は 、 {誰|だれ} も {入|はい}れない はず です 。 」', 'オマツ ： 「 {休|やす}む {前|まえ} に {裏|うら} の {戸|と} に {閂|かんぬき} を {掛|か}けました から 、 {外|そと} から {入|はい}れた {者|もの} は いない はず です 。 」', 'Omatsu: "Before bed I barred the back door, so nobody can have got in from outside."'],
  };
  const SEE = {
    kitchen: { 0: ['{台所|だいどころ} の {窓|まど} から {覗|のぞ}く と 、 {襖|ふすま} が {開|あ}いて いて 、 {床|とこ} の {間|ま} が よく {見|み}える 。', 'From the kitchen window, the sliding doors are open and the alcove is in plain view.'], 1: ['{台所|だいどころ} の {窓|まど} から {覗|のぞ}く と 、 {廊下|ろうか} の {灯|ひ} の {向|む}こう に 、 {床|とこ} の {間|ま} が {見|み}える 。', 'From the kitchen window, past the corridor lamp, you can see the alcove.'] },
    stairs: { 0: ['{階段|かいだん} に {乗|の}る と 、 ぎしっ と {大|おお}きな {音|おと} が した 。', 'You step on the stairs: a loud creak.'], 1: ['{階段|かいだん} に {乗|の}って も 、 {音|おと} は {少|すこ}し も しない 。 {張|は}り{替|か}えた ばかり の {板|いた} だ 。', 'You step on the stairs: not a sound. The boards are new.'] },
    backdoor: { 0: ['{裏|うら} の {戸|と} の {閂|かんぬき} は 、 {折|お}れて いて {掛|か}からない 。', 'The back door\'s bar is broken; it won\'t hold.'], 1: ['{閂|かんぬき} は しっかり して いる 。 {内側|うちがわ} から しか {外|はず}せない 。', 'The bar is sound. It can only be lifted from inside.'] },
  };
  const HOLDSUP = { 0: { kitchen: true, stairs: true, backdoor: false }, 1: { kitchen: true, stairs: false, backdoor: true } };
  const SPOTS = ['kitchen', 'stairs', 'backdoor'];
  const JUDGED = (s) => 'xp_hall_w8_f1_judged_' + s;
  for (const sp of SPOTS) {
    out += `
@scene hall.w8.p_${sp}
!if ${JUDGED(sp)} -> done
`;
    out += LVN3((t, i) => `?(${L[t]}) narr: 「 ${nest(CLAIM[sp][i])} 」 || "${CLAIM[sp][3]}"\n`);
    out += [0, 1].map((p) => `?(hall.w8.pat=${p}) narr: ${SEE[sp][p][0]} || ${SEE[sp][p][1]}\n`).join('');
    out += `!choice
* この {証言|しょうげん} は 、 あり{得|え}る || This account could be true. -> holds
* この {証言|しょうげん} に は 、 {無理|むり} が ある || This account can't be right. -> cannot
:holds
${[0, 1].filter((p) => HOLDSUP[p][sp]).map((p) => '!if hall.w8.pat=' + p + ' -> right').join('\n')}
!goto wrong
:cannot
${[0, 1].filter((p) => !HOLDSUP[p][sp]).map((p) => '!if hall.w8.pat=' + p + ' -> right').join('\n')}
:wrong
narr: もう {一度|いちど} 、 ここ から {見|み}える もの 、 {聞|き}こえる もの を {確|たし}かめよう 。 || Check once more what can be seen and heard from here.
!end
:right
narr: {証言|しょうげん} と 、 ここ で {確|たし}かめた こと が 、 {帳面|ちょうめん} に {並|なら}んだ 。 || The account and what you found here go side by side in your notes.
!set ${JUDGED(sp)}
!if ${SPOTS.map(JUDGED).join('&')} -> all
!refresh
!end
:all
narr: {三|みっ}つ の {証言|しょうげん} を 、 {全部|ぜんぶ} {確|たし}かめた 。 || All three accounts are checked.
?(comp) comp: {本人|ほんにん} が {確|たし}か だ と {思|おも}って いて も 、 {場所|ばしょ} を {見|み}る と {違|ちが}う こと も ある 。 {嘘|うそ} じゃ なくて 、 {思|おも}い{込|こ}み だ ね 。 || Even when someone is sure, the place itself can show otherwise. Not a lie: a mistaken belief.
${K.mark(W, 1, 't4')}
!end
:done
narr: この {証言|しょうげん} は 、 もう {確|たし}かめた 。 || You've already checked this account.
`;
  }

  // ---- t5: the snow fox -------------------------------------------------------------------------------------------------------------
  out += `
@scene hall.w8.t5
narr: {狐|きつね} の {去|さ}った {跡|あと} に は 、 {足跡|あしあと} が {一|ひと}つ も {残|のこ}って いない 。 {雪|ゆき} の {上|うえ} の {小|ちい}さな {足跡|あしあと} は 、 {狐|きつね} の もの で は ない 。 || Where the fox went, not a single print remains. The small prints in the snow are not a fox's.
${K.mark(W, 1, 't5')}
`;

  // ---- t6: Hisa's note and the road it points to (in your companion's hands; alone, Omatsu has it read) ---------------------------
  const TOLD = {
    0: { F: 'となり の むら に 、 はこ の ひと が いる って きいた 。 とどけて くる 。', E: '{隣|となり} の {村|むら} に 、 {箱|はこ} の {人|ひと} が いる って {聞|き}いた 。 {届|とど}けて くる ね 。', I: '{箱|はこ} を {預|あず}けた {人|ひと} が 、 {隣|となり} の {村|むら} に {来|き}て いる そう だ 。 {届|とど}けて きます 。', A: '{行商人|ぎょうしょうにん} の {話|はなし} に よる と 、 {箱|はこ} の {持|も}ち{主|ぬし} は {隣村|となりむら} に {着|つ}いた と の こと 。 {届|とど}けて まいります 。', en: 'Hisa\'s note: they heard the box\'s owner is in the next village, and have gone to take it to them.' },
    1: { F: 'はこ の ひと は 、 とうげ の ちゃや に いる みたい 。 とどけて くる 。', E: '{箱|はこ} の {人|ひと} は 、 {峠|とうげ} の {茶屋|ちゃや} に いる みたい 。 {届|とど}けて くる ね 。', I: '{箱|はこ} を {預|あず}けた {人|ひと} は 、 {峠|とうげ} の {茶屋|ちゃや} に いる らしい 。 {届|とど}けて きます 。', A: '{茶屋|ちゃや} の {灯|ひ} が {一晩中|ひとばんじゅう} {点|つ}いて いた から 、 {持|も}ち{主|ぬし} は {峠|とうげ} の {茶屋|ちゃや} に いる に {違|ちが}いない 。 {届|とど}けて まいります 。', en: 'Hisa\'s note: the box\'s owner seems to be at the teahouse on the pass, and Hisa has gone to take it there.' },
  };
  out += `
@scene hall.w8.t6
!if hall.w8.t6 -> done
!if xp_hall_w8_f1_asked -> told
narr: {箱|はこ} の {置|お}いて あった {所|ところ} に 、 {小|ちい}さな {字|じ} の {書|か}き{置|お}き 。 {雪|ゆき} {解|ど}け の {水|みず} で 、 {半分|はんぶん} {滲|にじ}んで いる 。 || Where the box stood, a note in small writing, half run with snowmelt.
?(comp=nao) comp: {子供|こども} の {字|じ} だ な 。 {読|よ}める よ 。 {何|なに} を {知|し}りたい ？ || A child's hand. I can read it. What do you want to know?
?(comp=mio) comp: {私|わたし} が {読|よ}む わ 。 {滲|にじ}んで いて も 、 {大丈夫|だいじょうぶ} 。 {何|なに} を {調|しら}べる ？ || I'll read it. Smudged is fine. What are we looking for?
?(comp=ren) comp: {私|わたし} が {読|よ}みましょう 。 {何|なに} を {知|し}りたい です か ？ || I'll read it. What would you like to know?
?(comp=suzu) comp: {子供|こども} の {字|じ} は 、 {子役|こやく} の {台本|だいほん} で {慣|な}れてる わ 。 {任|まか}せて 。 {何|なに} を {探|さが}す ？ || I'm used to children's writing from the child actors' scripts. Leave it to me. What am I looking for?
?(!comp) hall_omatsu: ヒサ の {字|じ} です 。 {一緒|いっしょ} に {読|よ}んで ください 。 {何|なに} が {知|し}りたい です か ？ || It's Hisa's writing. Read it with me. What would you like to know?
!hook hall_challenge hall.w8.ask
!if var._res=0 -> later
!set xp_hall_w8_f1_asked
:told
`;
  out += LV((p, t) => `?(${both(L[t], 'hall.w8.pat=' + p)}) narr: 「 ${TOLD[p][t]} 」 || "${TOLD[p].en}"\n`);
  out += `!end
:later
narr: {書|か}き{置|お}き を 、 {元|もと} の {所|ところ} に {戻|もど}した 。 || You put the note back where it was.
!end
:done
narr: {書|か}き{置|お}き は 、 {畳|たた}んで しまって ある 。 || The note has been folded and put away.
`;
  const ROAD = { east: ['{隣|となり} の {村|むら} へ {続|つづ}く {東|ひがし} の {道|みち}', 'the east road to the next village', 0], west: ['{峠|とうげ} の {茶屋|ちゃや} へ {上|のぼ}る {西|にし} の {道|みち}', 'the west road up to the pass teahouse', 1], shrine: ['{山|やま} の {祠|ほこら} へ {続|つづ}く {北|きた} の {道|みち}', 'the north path to the mountain shrine', -1] };
  for (const r of Object.keys(ROAD)) {
    out += `
@scene hall.w8.r_${r}
!if hall.w8.t6 -> done
narr: ${ROAD[r][0]} 。 || ${cap(ROAD[r][1])}.
!if !xp_hall_w8_f1_asked -> unknown
${ROAD[r][2] >= 0 ? '!if hall.w8.pat=' + ROAD[r][2] + ' -> right\n' : ''}narr: ヒサ の {書|か}き{置|お}き の {行|ゆ}き{先|さき} は 、 こっち で は ない よう だ 。 || Hisa's note doesn't seem to point this way.
?(comp) comp: {書|か}き{置|お}き の {言葉|ことば} 、 もう {一度|いちど} {言|い}おう か ？ || Shall I say what the note said again?
!end
${ROAD[r][2] >= 0 ? `:right
narr: {雪|ゆき} の {上|うえ} に 、 {小|ちい}さな {足跡|あしあと} が こっち へ {続|つづ}いて いる 。 ヒサ が {帰|かえ}り に {迷|まよ}わない よう 、 {道|みち} の {入|い}り{口|ぐち} に {提灯|ちょうちん} を {掛|か}けた 。 || In the snow, small footprints lead this way. You hang a lantern at the head of the road, so Hisa won't lose the way back.
?(comp) comp: 「 そう だ 」 も 「 らしい 」 も 、 {人|ひと} から {聞|き}いた {話|はなし} 。 でも 、 ヒサ は それ を {信|しん}じて {歩|ある}いて いった ん だ ね 。 || Whether it's そうだ or らしい, it's something Hisa heard. And Hisa trusted it, and walked.
${K.mark(W, 1, 't6')}
!end
` : ''}:unknown
narr: ヒサ が どこ へ {行|い}った の か 、 まだ {分|わ}からない 。 {先|さき} に {書|か}き{置|お}き を {読|よ}もう 。 || You don't know yet where Hisa went. Read the note first.
!end
:done
narr: ${ROAD[r][0]} 。 {雪|ゆき} が {静|しず}か に {降|ふ}って いる 。 || ${cap(ROAD[r][1])}. Snow is falling quietly.
`;
  }

  // ---- t7: the riddle stone ----------------------------------------------------------------------------------------------------
  out += '\n@scene hall.w8.t7' + K.taskTrial({ w: W, k: 1, t: 't7',
    intro: ['narr: {雪|ゆき} を {被|かぶ}った {石|いし} に 、 {字|じ} が {彫|ほ}って ある 。 「 {解|と}けた {者|もの} は 、 {一度|いちど} だけ 、 {帰|かえ}って また {来|く}る こと が できる 。 」 || Words cut into a snow-capped stone: "Whoever solves this may once go home and come back."'],
    task: 'hall.w8.riddle',
    after: ['narr: {石|いし} の {上|うえ} の {雪|ゆき} が 、 さらさら と {落|お}ちた 。 || The snow on the stone slides off with a whisper.'],
    later: 'narr: {答|こた}え は 、 {急|いそ}がなくて いい 。 || There\'s no hurry for the answer.',
    done: 'narr: {石|いし} は 、 {答|こた}え を {覚|おぼ}えて いる 。 || The stone remembers the answer.' });

  // ---- t8: the footprints in the snow --------------------------------------------------------------------------------------------
  const WEAR = { tosuke: 'boots', gonroku: 'geta', saki: 'zori', hisa: 'sandals' };
  const WHO = { tosuke: ['トウスケ', 'Tōsuke'], gonroku: ['ゴンロク', 'Gonroku'], saki: ['サキ', 'Saki'], hisa: ['ヒサ', 'Hisa'] };
  const PRINT = { boots: ['{大|おお}きな {藁|わら} の {長靴|ながぐつ} の {跡|あと}', 'the prints of big straw boots'], geta: ['{下駄|げた} の {歯|は} の {跡|あと}', 'the marks of geta teeth'], sandals: ['{小|ちい}さな {草鞋|わらじ} の {跡|あと}', 'the prints of small straw sandals'], zori: ['{草履|ぞうり} の {跡|あと}', 'the prints of zōri'] };
  const PRINTK = { 0: { pr1: 'boots', pr2: 'geta', pr3: 'sandals', pr4: 'zori' }, 1: { pr1: 'zori', pr2: 'sandals', pr3: 'boots', pr4: 'geta' } };
  const EVID = {
    tosuke: ['トウスケ さん は 、 わら の ながぐつ を はいて いた 。 サキ が みた 。', 'トウスケ さん は {藁|わら} の {長靴|ながぐつ} を {履|は}いて いた 。 サキ が {見|み}た そう だ 。', '{今朝|けさ} 、 トウスケ さん が {藁|わら} の {長靴|ながぐつ} を {履|は}いて いる の を 、 サキ が {見|み}た と の こと 。', 'Tōsuke was wearing straw boots: Saki saw him.'],
    gonroku: ['ゴンロク さん は 、 げた を はいて いる らしい 。 ろうか で おと が した 。', 'ゴンロク さん は {下駄|げた} を {履|は}いて いる らしい 。 {廊下|ろうか} で カラコロ と {音|おと} が した 。', '{廊下|ろうか} で カラコロ と {下駄|げた} の {音|おと} が した から 、 ゴンロク さん は {下駄|げた} の よう だ 。', 'Gonroku seems to wear geta: they clattered in the corridor.'],
    saki: ['サキ は 、 ぞうり で ゆき かき を した 。', 'サキ は 、 {草履|ぞうり} で {雪|ゆき} かき を した そう だ 。', 'おかみ さん の {話|はなし} で は 、 サキ は {草履|ぞうり} の まま {雪|ゆき} かき を した と の こと 。', 'Saki cleared the snow in zōri, the landlady says.'],
    hisa: ['こども の わらじ は 、 ちいさい はず 。', '{子供|こども} の {草鞋|わらじ} は 、 {小|ちい}さい はず だ 。', 'ヒサ は まだ {子供|こども} だ から 、 {草鞋|わらじ} の {跡|あと} は {小|ちい}さい に {違|ちが}いない 。', 'A child\'s straw sandals should leave small prints.'],
  };
  const HOLDN = (w) => 'xp_hall_w8_f2_hold_' + w, NAMED = (w) => 'xp_hall_w8_f2_named_' + w, PRN = (pr) => 'xp_hall_w8_f2_print_' + pr;
  const PRS = ['pr1', 'pr2', 'pr3', 'pr4'];
  out += `
@scene hall.w8.t8_board
narr: {座敷|ざしき} の {板|いた} に 、 {皆|みな} の {履|は}き{物|もの} に ついて の {話|はなし} が {貼|は}って ある 。 || On the board in the morning room, notes on everyone's footwear are pinned up.
`;
  for (const w of Object.keys(EVID)) out += LVN3((t, i) => `?(${L[t]}) narr: 「 ${EVID[w][i]} 」 || "${EVID[w][3]}"\n`);
  out += `?(comp&!hall.w8.t8) comp: {名札|なふだ} を 、 {合|あ}う {足跡|あしあと} に {置|お}いて いこう 。 || Let's set each name tag by the prints that match.
`;
  for (const w of Object.keys(WHO)) out += `
@scene hall.w8.tag_${w}
!unset ${Object.keys(WHO).map(HOLDN).join(' ')}
!set ${HOLDN(w)}
narr: 「 ${WHO[w][0]} 」 の {名札|なふだ} を {取|と}った 。 || You take the name tag "${WHO[w][1]}".
`;
  for (const pr of PRS) {
    out += `
@scene hall.w8.${pr}
`;
    out += [0, 1].map((p) => `?(hall.w8.pat=${p}) narr: ${PRINT[PRINTK[p][pr]][0]} 。 || ${cap(PRINT[PRINTK[p][pr]][1])}.\n`).join('');
    out += `!if ${PRN(pr)} -> done
!if ${Object.keys(WHO).map(HOLDN).join('|')} -> try
!end
:try
`;
    const rights = [0, 1].map((p) => { const w = Object.keys(WEAR).find((x) => WEAR[x] === PRINTK[p][pr]); return [p, w]; });
    out += rights.map(([p, w]) => `!if hall.w8.pat=${p}&${HOLDN(w)} -> r_${w}`).join('\n') + '\n';
    out += `narr: {名札|なふだ} を {置|お}こう と して 、 {手|て} を {止|と}めた 。 {板|いた} の {話|はなし} と 、 {跡|あと} が {合|あ}わない 。 || You go to set the tag down, and stop. The prints don't match what the board says.
!end
`;
    for (const w of [...new Set(rights.map((r) => r[1]))]) out += `:r_${w}
narr: 「 ${WHO[w][0]} 」 の {名札|なふだ} を 、 {跡|あと} の {横|よこ} に {置|お}いた 。 || You set "${WHO[w][1]}" beside the prints.
!unset ${HOLDN(w)}
!set ${NAMED(w)} ${PRN(pr)}
!goto check
`;
    out += `:check
!if ${PRS.map(PRN).join('&')} -> all
!refresh
!end
:all
narr: {四|よっ}つ の {足跡|あしあと} に 、 {四|よっ}つ の {名前|なまえ} 。 {小|ちい}さな {草鞋|わらじ} の {跡|あと} は 、 {裏|うら} の {戸|と} から {出|で}て 、 {道|みち} の {方|ほう} へ {続|つづ}いて いる 。 || Four sets of prints, four names. The small sandal prints lead out of the back door and away down the road.
?(comp) comp: {見|み}た {話|はなし} 、 {聞|き}こえた {話|はなし} 、 {聞|き}いた {話|はなし} 。 {全部|ぜんぶ} {合|あ}わせる と 、 {雪|ゆき} の {上|うえ} で {一|ひと}つ に なった ね 。 || What was seen, heard and told: put together, it all comes to one thing in the snow.
${K.mark(W, 2, 't8')}
!end
:done
narr: {跡|あと} の {横|よこ} に 、 {名札|なふだ} が {置|お}いて ある 。 || A name tag sits beside the prints.
`;
  }

  // ---- t9: Saki and Gonroku --------------------------------------------------------------------------------------------------
  out += `
@scene hall.w8.t9
!if hall.w8.t9 -> after
hall_gonroku: {狐|きつね} じゃ 。 {昔|むかし} から 、 {物|もの} が {消|き}えれば {狐|きつね} と {決|き}まって おる 。 || A fox. Since time out of mind, when a thing goes missing, it's a fox.
hall_saki: {狐|きつね} なんか じゃ ありません ！ {私|わたし} は 、 {見|み}た ん です 。 || It was no fox! I saw it.
!encounter hall.w8.quarrel
!if var._enc=agreed -> agreed
narr: ゴンロク は {部屋|へや} へ {戻|もど}って しまった 。 サキ は 、 {火鉢|ひばち} の {灰|はい} を {黙|だま}って {掻|か}いて いる 。 || Gonroku has gone back to his room. Saki rakes the brazier ash in silence.
!end
:agreed
hall_saki: …… ゴンロク さん 、 {大|おお}きな {声|こえ} を {出|だ}して 、 すみません でした 。 || …Gonroku-san, I'm sorry I raised my voice.
hall_gonroku: いや 、 わし も {見|み}て も おらん こと を {言|い}い{過|す}ぎた 。 || No, I said too much about something I never saw.
${K.mark(W, 2, 't9')}
!end
:after
hall_saki: {小|ちい}さな {影|かげ} 。 {今|いま} {思|おも}えば 、 ヒサ の {背丈|せたけ} でした 。 || A small shadow. Thinking back, it was just Hisa's height.
`;

  // ---- t10: the record of the night -------------------------------------------------------------------------------------------------
  out += `
@scene hall.w8.t10
!if hall.w8.t10 -> after
!if !hall.w8.t8 -> wait
!if !hall.w8.t9 -> wait
narr: {宿|やど} の {帳面|ちょうめん} 。 オマツ が {筆|ふで} を {取|と}って 、 {待|ま}って いる 。 || The inn's ledger. Omatsu has the brush in hand, waiting.
!encounter hall.w8.record
!if var._res=0 -> later
!set xp_hall_w8_f2_t10
!hook hall_trial w8 t10
!if var._res=1 -> finale
!refresh
!end
:finale
!call hall.w8.end
!end
:wait
narr: {帳面|ちょうめん} に {書|か}く に は 、 まだ {早|はや}い よう だ 。 || It seems too soon to write anything in the ledger.
?(!hall.w8.t8) narr: {庭|にわ} の {足跡|あしあと} が 、 まだ {誰|だれ} の もの か {分|わ}かって いない 。 || Nobody yet knows whose prints are in the garden.
?(!hall.w8.t9) narr: サキ と ゴンロク が 、 まだ {睨|にら}み{合|あ}って いる 。 || Saki and Gonroku are still glaring at each other.
!end
:later
narr: オマツ が 、 {筆|ふで} を {持|も}った まま {待|ま}って いる 。 || Omatsu waits, brush in hand.
!end
:after
narr: {帳面|ちょうめん} の {墨|すみ} は 、 もう {乾|かわ}いて いる 。 || The ink in the ledger is already dry.

@scene hall.w8.end
!sequence hall.w8 begin
!shot tale
narr: {朝日|あさひ} の {中|なか} を 、 ヒサ が {帰|かえ}って きた 。 {隣|となり} に は 、 {箱|はこ} を {抱|かか}えた {年寄|としよ}り の {旅人|たびびと} が いる 。 || Hisa comes back through the morning sun. Beside them is an old traveller with the box in his arms.
hall_kichibei: {十年|じゅうねん} {前|まえ} に {預|あず}けた {箱|はこ} を 、 この {子|こ} が {届|とど}けて くれた 。 {中|なか} の {手紙|てがみ} は 、 この {宿|やど} へ の お{礼|れい} だ 。 {戻|もど}ったら {渡|わた}す つもり だった 。 || This child brought me the box I left here ten years ago. The letter inside is my thanks to this inn. I meant to hand it over when I came back.
hall_hisa: {誰|だれ} も {聞|き}かなかった から 、 {言|い}わなかった 。 …… ごめん なさい 。 || Nobody asked, so I didn't say. …Sorry.
?(comp=nao) comp: {見|み}た 、 {聞|き}いた 、 {聞|き}かされた 。 {手紙|てがみ} に その {三|みっ}つ を {分|わ}けて {書|か}く {人|ひと} は 、 {信用|しんよう} できる 。 || Saw, heard, was told. Someone who keeps those three apart in a letter can be trusted.
?(comp=mio) comp[happy]: らしい 、 そう だ 、 に {違|ちが}いない 。 {言葉|ことば} {一|ひと}つ で 、 どの くらい {確|たし}か か まで {伝|つた}わる のね 。 || Seems, I hear, must be. One word, and it carries how sure you are.
?(comp=ren) comp: {灯|ひ} が {八|やっ}つ 、 {戻|もど}りました 。 {残|のこ}り は 、 {二|ふた}つ です 。 || Eight lights back. Two to go.
?(comp=suzu) comp: {第|だい}{八幕|はちまく} 、 {幕|まく} ！ {犯人|はんにん} の いない {推理|すいり} {劇|げき} 、 {案外|あんがい} {悪|わる}く ない わ 。 || End of act eight! A whodunit with no culprit. Not bad at all.
!sequence hall.w8 end
narr: {朝|あさ} の {雪|ゆき} {明|あ}かり が {畳|たた}まれる よう に {薄|うす}れて 、 {気|き}が {付|つ}く と 、 {館|やかた} の {囲炉裏|いろり} の {前|まえ} に いた 。 || The morning snowlight folds away, and when you look up you are by the hall's hearth.
!set hall_w8_done
!hook hall_finish
`;

  RB.script.add(out);
})(RB.content);
