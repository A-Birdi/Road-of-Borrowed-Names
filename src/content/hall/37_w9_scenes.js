/* The Hall of a Hundred Tales, wing 9, The Crane's Return: the scenes (expansion P15; plan 04_DUNGEONS.md D9; maps in
 * 35_w9_maps.js, tasks and encounters in 36_w9_learning.js). Each trial sets its floor's own flag and tells the Hall;
 * what a trial shows follows the level its task is set at (the profile, or one up on the Grow route); the pattern
 * (hall.w9.pat) chooses the old man's words, the night at the hearth (the young woman's first night, or a later one
 * when the village head calls), what she asked of you, and the lord's order. Yosaku, Gensuke and the lord's messenger
 * he/him, Otoku and the young woman she/her, Sabu they/them. Suzu's lines have Kansai versions
 * (src/content/dialect/kansai_99_hall.js). The tale's crane shares Keeper Tsuru's name (鶴, つる); the wing never says
 * so aloud. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const K = C.hallKit, W = 'w9', L = K.lv(W), both = L.both;
  const TALE = C.hallW9Tale, FT = C.hallW9TaleF;
  const nest = (x) => x.replace(/「/g, '『').replace(/」/g, '』');
  const cap = (x) => x[0].toUpperCase() + x.slice(1);
  const LV = (fn) => [0, 1].flatMap((p) => ['F', 'E', 'I', 'A'].map((t) => fn(p, t))).join('');
  const LV3 = (fn) => [0, 1].flatMap((p) => [['EF', 0], ['E', 1], ['IA', 2]].map(([t, i]) => fn(p, t, i))).join('');
  const LVN3 = (fn) => [['EF', 0], ['E', 1], ['IA', 2]].map(([t, i]) => fn(t, i)).join('');
  let out = `
@scene hall.w9.f1_first
!set hall_w9_f1_seen
narr: {紙|かみ} の {戸|と} を {抜|ぬ}ける と 、 {雪|ゆき} に {埋|う}もれた {小|ちい}さな {村|むら} だった 。 {遠|とお}く で 、 {鶴|つる} が {一声|ひとこえ} {鳴|な}いた 。 || Through the paper screen: a small village buried in snow. Far off, a crane calls once.
?(comp=nao) comp: {村|むら} の {人|ひと} は 、 {相手|あいて} に よって {話|はな}し{方|かた} を {変|か}える 。 {配達|はいたつ} を して いる と 、 よく {分|わ}かる よ 。 || Village folk talk differently depending on who they're talking to. You notice it, delivering letters.
?(comp=mio) comp: この {話|はなし} 、 {知|し}って いる わ 。 {子供|こども} の {頃|ころ} 、 {何度|なんど} も {聞|き}いた もの 。 || I know this tale. I heard it so many times as a child.
?(comp=ren) comp: {鶴|つる} の {恩返|おんがえ}し です ね 。 {灯守|ひもり} の {間|あいだ} でも 、 よく {語|かた}られる {話|はなし} です 。 || The Crane's Return. Lantern-keepers tell this one often, too.
?(comp=suzu) comp: {第|だい}{九幕|きゅうまく} は 、 {鶴|つる} の {恩返|おんがえ}し 。 これ は {泣|な}ける {話|はなし} よ 。 || Act nine: The Crane's Return. This one's a weepie.
?(!comp) narr: {雪|ゆき} が 、 {音|おと} も なく {降|ふ}り{続|つづ}いて いる 。 || The snow falls on without a sound.

@scene hall.w9.f2_first
!set hall_w9_f2_seen
narr: {老夫婦|ろうふうふ} の {家|いえ} 。 {囲炉裏|いろり} に {火|ひ} が {入|はい}り 、 {戸口|とぐち} に は {雪|ゆき} が {吹|ふ}き{寄|よ}せて いる 。 {奥|おく} の {襖|ふすま} は 、 ぴたり と {閉|し}まって いる 。 || The old couple's house. The hearth is lit, and snow drifts against the door. At the back, a paper door is shut tight.
?(comp) comp: {囲炉裏|いろり} の {席|せき} に も 、 {決|き}まり が ある みたい だ ね 。 || Even the seats round the hearth seem to have rules.

@scene hall.w9.f3_first
!set hall_w9_f3_seen
narr: {麓|ふもと} の {町|まち} 。 {殿|との}さま の {館|やかた} の {門|もん} の {前|まえ} で 、 {使|つか}い の {者|もの} が ゲンスケ を {呼|よ}び{止|と}めて いる 。 {坂|さか} の {上|うえ} の {家|いえ} から は 、 {今日|きょう} も {機|はた} の {音|おと} が {聞|き}こえる 。 || The town at the foot of the hill. Before the lord's gate, the messenger has stopped Gensuke. From the house up the slope, the loom can be heard again today.
?(comp=nao) comp: {殿|との}さま の {注文|ちゅうもん} は 、 {門|もん} から {店|みせ} 、 {店|みせ} から {家|いえ} へ {降|お}りて くる 。 {手紙|てがみ} と {同|おな}じ だ 。 || The lord's order comes down from the gate to the shop, and from the shop to the house. Just like a letter.
?(comp=mio) comp: あの {子|こ} 、 {痩|や}せて きて いる わ 。 {心配|しんぱい} ね 。 || She's getting thin. I'm worried.
?(comp=ren) comp: {機|はた} の {音|おと} が 、 {少|すこ}し {弱|よわ}く なって いる {気|き} が します 。 || The loom sounds a little weaker, I think.
?(comp=suzu) comp: いよいよ {大詰|おおづ}め ね 。 {覗|のぞ}く か 、 {覗|のぞ}かない か 。 || The final act at last. To look, or not to look.
?(!comp) narr: {機|はた} の {音|おと} が 、 {坂|さか} の {下|した} まで {聞|き}こえて くる 。 || The sound of the loom carries all the way down the slope.

@scene hall.w9.bench1
!hook hall_station w9_b1

@scene hall.w9.bench2
!hook hall_station w9_b2

@scene hall.w9.bench3
!hook hall_station w9_b3

@scene hall.w9.spring
narr: {裏|うら} の {井戸|いど} 。 {水|みず} は {冷|つめ}たい が 、 {凍|こお}って は いない 。 || The well out the back. The water is cold, but not frozen.
!hook hall_station w9_sp

@scene hall.w9.trap
narr: {雪|ゆき} の {中|なか} に 、 {壊|こわ}れた {罠|わな} が {埋|う}もれて いる 。 {白|しろ}い {羽|はね} が {一枚|いちまい} 、 {引|ひ}っかかって いた 。 || A broken trap lies half-buried in the snow. A single white feather is caught in it.

@scene hall.w9.yosaku
!faceplayer hall_yosaku
!if hall.w9.t2 -> done
hall_yosaku: {今日|きょう} は {村|むら} の {皆|みな} に {声|こえ} を かけて {回|まわ}った ん だ が 、 {誰|だれ} に {何|なに} を {言|い}った か 、 すっかり {分|わ}からなく なって しまって な 。 {言葉|ことば} を 、 {言|い}った {相手|あいて} に {返|かえ}して くれん か 。 || I went round the whole village today with a word for everyone, and now I can't keep straight what I said to whom. Would you give my words back to the ones I said them to?
!end
:done
hall_yosaku: {相手|あいて} に よって 、 {言|い}い{方|かた} も {変|か}わる もん だ 。 || You say a thing differently, depending on who you're saying it to.

@scene hall.w9.otoku2
!faceplayer hall_otoku2
!if hall.w9.t4 -> done
hall_otoku: {囲炉裏|いろり} の {席|せき} は 、 {誰|だれ} が どこ に {座|すわ}る か {決|き}まって いる ん だ よ 。 {板|いた} に {書|か}いて ある から 、 {名札|なふだ} を {置|お}いて おくれ 。 || Everyone has their own place round the hearth. It's written on the board; would you set out the name tags?
!end
:done
hall_otoku: あの {子|こ} が {来|き}て から 、 この {家|いえ} も {明|あか}るく なった よ 。 || Since the girl came, this house has been brighter.

@scene hall.w9.envoy3
!faceplayer hall_envoy3
hall_envoy: {拙者|せっしゃ} は 、 {殿|との} の {仰|おお}せ を {伝|つた}え に {参|まい}った 。 || I have come to convey his lordship's command.

@scene hall.w9.gensuke3
!faceplayer hall_gensuke3
hall_gensuke: ヨサク さん の {所|ところ} の {布|ぬの} は 、 {都|みやこ} で も {評判|ひょうばん} です よ 。 || The cloth from Yosaku's house is the talk of the capital.
`;

  // ---- t1: the story room ----------------------------------------------------------------------------------------------
  const E_PANELS = [TALE.P1, TALE.P2, TALE.P3, TALE.P4].map(nest);
  const F_PANELS = FT.map(nest);
  const PANEL_EN = ['One snowy day, an old man freed a crane caught in a trap.', 'That night a beautiful young woman knocked at the door and bowed: "Might I stay the night?"', 'She said, "While I weave, please never look in," and wove wonderful cloth.', 'Breaking the promise, they looked: a crane was plucking her own feathers to weave the cloth.'];
  out += '\n@scene hall.w9.t1' + K.taskTrial({ w: W, k: 0, t: 't1',
    intro: ['narr: {小屋|こや} の {壁|かべ} に 、 {絵巻|えまき} が {掛|か}けて ある 。 || A picture scroll hangs on the wall of the hut.']
      .concat(...[0, 1, 2, 3].map((i) => ['?(' + L.EF + ') narr: 「 ' + F_PANELS[i] + ' 。 」 || "' + PANEL_EN[i] + '"', '?(' + L.NOTF + ') narr: 「 ' + E_PANELS[i] + ' 。 」 || "' + PANEL_EN[i] + '"']),
      ['narr: {戸|と} の {隙間|すきま} から {雪|ゆき} が {吹|ふ}き{込|こ}んで 、 {絵|え} の {順番|じゅんばん} が {乱|みだ}れた 。 || Snow blows in through the door, and the pictures slip out of order.']),
    task: 'hall.w9.story',
    after: ['narr: {絵巻|えまき} が 、 {元|もと} の {順番|じゅんばん} に {戻|もど}った 。 || The scroll is back in its order.', '!challenge hall.w9.story_q',
      '?(comp=nao) comp: {泊|と}めて ください 、 じゃ なくて 、 {泊|と}めて いただけません か 。 {知|し}らない {家|いえ} の {戸|と} を {叩|たた}く とき の {言|い}い{方|かた} だ 。 || Not "let me stay", but "might I stay". That\'s how you knock on a stranger\'s door.',
      '?(comp=mio) comp: {一|ひと}つ だけ の お{願|ねが}い 。 {守|まも}る の は 、 {簡単|かんたん} な よう で {難|むずか}しい の よ ね 。 || Just one request. Keeping it sounds easy, and isn\'t.',
      '?(comp=ren) comp: {覗|のぞ}かないで ください 。 …… {灯|ひ} も {同|おな}じ です 。 {覗|のぞ}き{込|こ}む と 、 {消|き}えて しまう {物|もの} が あります 。 || "Please don\'t look." …Lamps are the same. Some lights go out if you peer into them.',
      '?(comp=suzu) comp: {約束|やくそく} を {破|やぶ}る {場面|ばめん} 、 {毎回|まいかい} 「 やめて 」 って {言|い}いたく なる の よ ね 。 || Every time we reach the part where they break the promise, I want to shout "don\'t".'],
    later: 'narr: {絵|え} は 、 {後|あと} で {並|なら}べ{直|なお}せる 。 || You can put the pictures in order later.',
    done: 'narr: {絵巻|えまき} は 、 {元|もと} の {順番|じゅんばん} で {掛|か}かって いる 。 || The scroll hangs in its proper order.' });

  // ---- t2: whose ears? (the old man's words, each given back to the one it was said to) -----------------------------------
  // [to whom, F, E, I/A, English]: the register (and, at the lower levels, what he calls them) says who heard it
  const SLIP = {
    0: {
      s1: ['otoku', 'ばあさん 、 いま かえった よ 。 そと は すごい ゆき だ 。', 'ばあさん 、 {今|いま} {帰|かえ}った よ 。 {外|そと} は ひどい {雪|ゆき} だ 。', '{今|いま} {帰|かえ}った ぞ 。 {外|そと} は ひどい {雪|ゆき} だ 。 {火|ひ} に あたらせて くれ 。', 'I\'m back. Terrible snow out there.'],
      s2: ['gensuke', 'ゲンスケ さん 、 この ぬの は 、 いくら で かって くれます か 。', 'ゲンスケ さん 、 この {布|ぬの} 、 いくら で {買|か}って くれます か 。', 'この {布|ぬの} を 、 いくら で {引|ひ}き{取|と}って いただけます か 。', 'How much will you give me for this cloth?'],
      s3: ['envoy', 'おつかい の かた 、 ようこそ いらっしゃいました 。', 'お{使|つか}い の {方|かた} 、 ようこそ いらっしゃいました 。', '{遠|とお}い {所|ところ} を 、 わざわざ お{越|こ}し くださいまして 、 ありがとう ございます 。', 'Welcome, honoured messenger: you have come all this way.'],
      s4: ['sabu', 'サブ 、 さむく ない か ？ ほら 、 いも を おたべ 。', 'サブ 、 {寒|さむ}く ない か ？ ほら 、 {芋|いも} を お{食|た}べ 。', '{寒|さむ}かったろう 。 ほら 、 {焼|や}き{芋|いも} だ 。 {熱|あつ}い から 、 {気|き} を つけて お{食|た}べ 。', 'Aren\'t you cold? Here, have a sweet potato.'],
      s5: ['otoku', 'ばあさん 、 きょう 、 わな の つる を にがして やった よ 。', 'ばあさん 、 {今日|きょう} 、 {罠|わな} に かかった {鶴|つる} を {逃|に}がして やった よ 。', 'ばあさん 、 {聞|き}いて くれ 。 {今日|きょう} 、 {罠|わな} に かかって いた {鶴|つる} を 、 {放|はな}して やった ん だ 。', 'Listen, love: today I let a crane go that was caught in a trap.'] },
    1: {
      s1: ['gensuke', 'ゲンスケ さん 、 この ぬの を みて もらえます か 。', 'ゲンスケ さん 、 この {布|ぬの} を {見|み}て もらえます か 。', 'ごめん ください 。 この {布|ぬの} を 、 ちょっと {見|み}て いただけます か 。', 'Excuse me. Would you take a look at this cloth?'],
      s2: ['envoy', 'おつかい の かた 、 とのさま に よろしく おつたえ ください 。', 'お{使|つか}い の {方|かた} 、 {殿|との}さま に よろしく お{伝|つた}え ください 。', '{殿|との}さま に は 、 くれぐれも よろしく お{伝|つた}え くださいませ 。', 'Please give my respects to his lordship.'],
      s3: ['sabu', 'サブ 、 はしる と ころぶ ぞ 。', 'サブ 、 {走|はし}る と {転|ころ}ぶ ぞ 。', 'こら 、 {走|はし}る な 。 {雪|ゆき} で {転|ころ}んだら 、 おっかあ が {泣|な}く ぞ 。', 'Don\'t run, you\'ll fall.'],
      s4: ['otoku', 'ばあさん 、 むすめ の ぶん も 、 ごはん を たいて おくれ 。', 'ばあさん 、 {娘|むすめ} の {分|ぶん} も ご{飯|はん} を {炊|た}いて おくれ 。', '{今夜|こんや} から は 、 あの {子|こ} の {分|ぶん} も ご{飯|はん} を {炊|た}いて おくれ 。 うち の {子|こ} に しよう じゃ ない か 。', 'Cook rice for the girl too, love. Let\'s take her in as our own.'],
      s5: ['sabu', 'サブ や 、 さむい から 、 もう おうち に おかえり 。', 'サブ や 、 {寒|さむ}い から 、 もう お{家|うち} に お{帰|かえ}り 。', '{日|ひ} が {暮|く}れる 。 {寒|さむ}い から 、 もう お{家|うち} に お{帰|かえ}り 。 おっかあ が {待|ま}って いる よ 。', 'It\'s cold; run along home now.'] },
  };
  const HEAR = {
    otoku: { who: 'hall_otoku', npc: 'hall_otoku', ok: 'ああ 、 これ は うち の {人|ひと} の {言葉|ことば} だ ね 。 || Ah, that\'s my husband talking.', no: 'それ は 、 うち の {人|ひと} が わたし に {言|い}った {言葉|ことば} じゃ ない ね 。 || That\'s not something my husband said to me.',
      idle: 'うち の {人|ひと} 、 {今日|きょう} は {村|むら} じゅう で {喋|しゃべ}って きた らしい けど 、 {言葉|ことば} を {雪|ゆき} の {中|なか} に {落|お}として きた みたい で ね 。 || My husband talked to half the village today, and seems to have dropped his words in the snow on the way home.',
      after: 'ありがとう 。 {言葉|ことば} は 、 {言|い}った {相手|あいて} に {届|とど}いて こそ だ ね 。 || Thank you. Words are only words once they reach the one they were meant for.' },
    sabu: { who: 'hall_sabu', npc: 'hall_sabu', ok: 'あ 、 じいちゃん が おいら に {言|い}った やつ だ ！ || Oh, that\'s what Grandad said to me!', no: 'それ 、 おいら に {言|い}った ん じゃ ない よ 。 || He didn\'t say that to me.',
      idle: 'じいちゃん 、 {今日|きょう} は {機嫌|きげん} が いい ね 。 || Grandad\'s in a good mood today.', after: 'おいら 、 じいちゃん の {話|はなし} 、 {全部|ぜんぶ} {覚|おぼ}えて いる よ 。 || I remember everything Grandad says.' },
    gensuke: { who: 'hall_gensuke', npc: 'hall_gensuke', ok: 'ええ 、 {確|たし}か に {私|わたし} が {伺|うかが}いました 。 || Yes, that was said to me.', no: 'はて 、 そんな {言|い}い{方|かた} は 、 {私|わたし} に は なさいません でした よ 。 || Hm. He never spoke to me like that.',
      idle: '{反物|たんもの} を お{探|さが}し でしたら 、 どうぞ ご{覧|らん} ください 。 || If it\'s cloth you\'re after, please, have a look.', after: 'お{客|きゃく}さま に は 、 {丁寧|ていねい} に 。 {商|あきな}い の {基本|きほん} です 。 || Courtesy to the customer. That\'s the first rule of trade.' },
    envoy: { who: 'hall_envoy', npc: 'hall_envoy', ok: 'うむ 。 {確|たし}か に 、 {拙者|せっしゃ} が {聞|き}いた 。 || Indeed. That was said to me.', no: 'その {言葉|ことば} は 、 {拙者|せっしゃ} に {向|む}けた もの で は あるまい 。 || Those words were surely not meant for me.',
      idle: '{拙者|せっしゃ} は 、 {殿|との} の {使|つか}い で {参|まい}った 。 {用|よう} が なければ 、 {下|さ}がれ 。 || I am here on his lordship\'s business. If you have none with me, stand aside.', after: '{礼|れい} を {知|し}る {者|もの} の {村|むら} だ な 。 || A village that knows its manners.' },
  };
  const SLIPS = ['s1', 's2', 's3', 's4', 's5'];
  const HOLDS = (s) => 'xp_hall_w9_f0_hold_' + s, PUT = (s) => 'xp_hall_w9_f0_put_' + s;
  for (const sl of SLIPS) {
    out += `
@scene hall.w9.${sl}
narr: {雪|ゆき} の {上|うえ} に 、 ヨサク の {言葉|ことば} が {一|ひと}つ {落|お}ちて いる 。 || One of Yosaku's sayings lies on the snow.
`;
    out += LV3((p, t, i) => `?(${both(L[t], 'hall.w9.pat=' + p)}) narr: 「 ${nest(SLIP[p][sl][i + 1])} 」 || "${SLIP[p][sl][4]}"\n`);
    out += `!unset ${SLIPS.map(HOLDS).join(' ')}
!set ${HOLDS(sl)}
narr: {言葉|ことば} を {拾|ひろ}った 。 {誰|だれ} に {言|い}った {言葉|ことば} だろう 。 || You pick the words up. Whom were they said to?
`;
  }
  for (const h of Object.keys(HEAR)) {
    const H = HEAR[h];
    const ok = [0, 1].flatMap((p) => SLIPS.filter((sl) => SLIP[p][sl][0] === h).map((sl) => [p, sl]));
    out += `
@scene hall.w9.to_${h}
!faceplayer ${H.npc}
${ok.map(([p, sl]) => '!if hall.w9.pat=' + p + '&' + HOLDS(sl) + ' -> ok_' + sl + '_' + p).join('\n')}
!if ${SLIPS.map(HOLDS).join('|')} -> no
!if hall.w9.t2 -> idle_after
${H.who}: ${H.idle}
!end
:idle_after
${H.who}: ${H.after}
!end
:no
${H.who}: ${H.no}
!end
`;
    for (const [p, sl] of ok) out += `:ok_${sl}_${p}
${H.who}: ${H.ok}
!unset ${HOLDS(sl)}
!set ${PUT(sl)}
!goto check
`;
    out += `:check
!if ${SLIPS.map(PUT).join('&')} -> all
!refresh
!end
:all
narr: ヨサク の {言葉|ことば} が 、 {五|いつ}つ とも 、 {言|い}った {相手|あいて} に {戻|もど}った 。 || All five of Yosaku's sayings are back with the ones they were said to.
?(comp) comp: {奥|おく}さん に は {普通|ふつう} に 、 {子供|こども} に は {優|やさ}しく 、 {店|みせ} の {人|ひと} に は {丁寧|ていねい} に 、 {殿|との}さま の {使|つか}い に は うんと {丁寧|ていねい} に 。 {同|おな}じ {人|ひと} が 、 {四|よっ}つ の {話|はな}し{方|かた} を して いた ね 。 || Plain with his wife, gentle with a child, polite with the shopkeeper, very polite with the lord's man. One man, four ways of talking.
${K.mark(W, 0, 't2')}
!end
`;
  }

  // ---- t3: the prayer boards ---------------------------------------------------------------------------------------------------
  const CE = {
    0: { F: ['How do you do. I\'m Tanaka.', 'Good morning, teacher.', 'I am Mr Tanaka. (calling yourself さん)', 'I said "See you tomorrow" to a friend.'],
      E: ['Saying "Thank you for your hard work" to the master.', 'Asking a friend, "Going tomorrow?"', 'Telling your teacher, "My honoured mother is well."', 'Calling a little girl "Mii-chan".'],
      I: ['The village head has arrived.', 'I will carry your luggage.', 'Tomorrow I will honourably come to the village head\'s house. (raising yourself)', 'The master has already gone home.'],
      A: ['My teacher kindly read the letter.', 'I had the master look over my work.', 'My teacher received the favour of lending me a book. (the lender as subject of いただく)', 'Then, if I may, I will begin.'] },
    1: { F: ['Mum, I\'m home.', 'I said "This one, please" to the shopkeeper.', 'I asked a small child, "What\'s your name?"', 'I asked a grown-up I didn\'t know, "Oi, where\'s the road?"'],
      E: ['Welcome, honoured customer.', 'Good morning, master.', 'Giving your own name as "Yamada-sama".', 'Telling your little brother, "Hurry up and come!"'],
      I: ['Please, help yourself.', 'His lordship said so.', 'Honoured guest, please humbly receive it. (lowering the guest)', 'Tomorrow I will deliver it.'],
      A: ['May I ask your name?', 'With your leave, I will take today off.', 'His lordship kindly listened to me.', 'Please, by your leave, let yourself rest. (asking leave on the other\'s behalf)'] },
  };
  out += '\n@scene hall.w9.t3' + K.taskTrial({ w: W, k: 0, t: 't3',
    intro: ['narr: {社|やしろ} の {絵馬|えま} に 、 {四|よっ}つ の {言葉|ことば} 。 {端|はし} の {掛|か}け{軸|じく} に は 、 「 {一|ひと}つ だけ が {間違|まちが}って いる 。 」 と ある 。 || Four sayings on the shrine\'s prayer boards. The scroll at the end reads: "One alone is wrong."'],
    task: { 0: 'hall.w9.counter0', 1: 'hall.w9.counter1' },
    after: ['narr: {間違|まちが}った {絵馬|えま} が 、 {風|かぜ} に {揺|ゆ}れて 、 {裏返|うらがえ}った 。 || The wrong prayer board swings in the wind and turns face down.', '?(comp) comp: {言葉|ことば} は {合|あ}って いて も 、 {相手|あいて} を {間違|まちが}える と {失礼|しつれい} に なる ん だ ね 。 || The words can be right and still be rude, if they\'re aimed at the wrong person.'],
    later: 'narr: {絵馬|えま} を {一|ひと}つ ずつ {読|よ}んで から 、 また {来|こ}よう 。 || Read the boards one by one, then come back.',
    done: 'narr: {絵馬|えま} は 、 もう {何|なに} も {問|と}わない 。 || The boards ask nothing more.' });
  for (let i = 0; i < 4; i++) {
    out += `\n@scene hall.w9.card${i + 1}\nnarr: {絵馬|えま} 。 {願|ねが}い{事|ごと} の {代|か}わり に 、 {言葉|ことば} が {一|ひと}つ {書|か}いて ある 。 || A prayer board. Instead of a wish, a saying is written on it.\n`;
    out += LV((p, t) => `?(${both(L[t], 'hall.w9.pat=' + p)}) narr: 「 ${nest(C.hallW9Cards[p][t][i][0])} 」 || "${CE[p][t][i]}"\n`);
  }

  // ---- t4: the seats at the hearth -----------------------------------------------------------------------------------------------
  // The house's board says whose each seat is; the night (the pattern) says who is here: on her first night the young
  // woman is a guest and Sabu tends the fire; on a later night she is the youngest of the house and the village head
  // is the guest.
  const SEAT = { yokoza: ['{横座|よこざ}', 'the master\'s seat (yokoza)'], kyakuza: ['{客座|きゃくざ}', 'the guest\'s seat (kyakuza)'], kakaza: ['かか{座|ざ}', 'the wife\'s seat (kakaza)'], kijiri: ['{木尻|きじり}', 'the seat by the firewood (kijiri)'] };
  const PLACE = { yokoza: ['{土間|どま} を {正面|しょうめん} に {見|み}る 、 {奥|おく} の {座布団|ざぶとん}', 'the cushion at the far side, facing the earthen floor'], kyakuza: ['{床|とこ} の {間|ま} の {側|がわ} の {座布団|ざぶとん}', 'the cushion on the alcove side'], kakaza: ['{台所|だいどころ} に {近|ちか}い {座布団|ざぶとん}', 'the cushion near the kitchen'], kijiri: ['{薪|まき} の {側|そば} 、 {土間|どま} に {近|ちか}い {座布団|ざぶとん}', 'the cushion by the firewood, near the earthen floor'] };
  const RULE = {
    yokoza: ['よこざ は 、 いえ の あるじ の せき 。 どま を まっすぐ みる 、 おく の せき 。', '{横座|よこざ} は 、 {家|いえ} の {主|あるじ} の {席|せき} 。 {土間|どま} を {正面|しょうめん} に {見|み}る 、 {奥|おく} の {席|せき} だ 。', '{横座|よこざ} は {一家|いっか} の {主|あるじ} が {座|すわ}る {席|せき} で 、 {土間|どま} を {正面|しょうめん} に {見|み}る {奥|おく} に ある 。', 'Yokoza: the master of the house\'s seat, at the far side, facing the earthen floor.'],
    kyakuza: ['きゃくざ は 、 おきゃくさん の せき 。 とこのま の がわ に ある 。', '{客座|きゃくざ} は 、 お{客|きゃく}さん の {席|せき} 。 {床|とこ} の {間|ま} の {側|がわ} に ある 。', '{客座|きゃくざ} に は お{客|きゃく}さま を お{通|とお}し する 。 {床|とこ} の {間|ま} の {側|がわ} の {席|せき} だ 。', 'Kyakuza: the guest\'s seat, on the side by the alcove.'],
    kakaza: ['かかざ は 、 おかみさん の せき 。 だいどころ の がわ に ある 。', 'かか{座|ざ} は 、 おかみさん の {席|せき} 。 {台所|だいどころ} の {側|がわ} に ある 。', 'かか{座|ざ} は {主|あるじ} の {妻|つま} の {席|せき} で 、 {台所|だいどころ} に {近|ちか}い 。', 'Kakaza: the wife\'s seat, on the kitchen side.'],
    kijiri: ['きじり は 、 いちばん わかい ひと か 、 ひ の ばん を する ひと の せき 。 まき の そば に ある 。', '{木尻|きじり} は 、 {一番|いちばん} {若|わか}い {人|ひと} か 、 {火|ひ} の {番|ばん} を する {人|ひと} の {席|せき} 。 {薪|まき} の {側|そば} に ある 。', '{木尻|きじり} は {薪|まき} の {側|そば} の {席|せき} で 、 {家|いえ} で {一番|いちばん} {若|わか}い {者|もの} や 、 {火|ひ} の {番|ばん} を する {者|もの} が {座|すわ}る 。', 'Kijiri: the seat by the firewood, for the youngest of the house or whoever tends the fire.'],
  };
  const NIGHT = {
    0: ['こんや 、 しらない むすめ が 「 とめて ください 」 と きた 。 となり の サブ が 、 まき を もって きて 、 ひ の ばん を して いる 。', '{今夜|こんや} 、 {知|し}らない {娘|むすめ} が 「 {泊|と}めて ください 」 と {来|き}た 。 {隣|となり} の サブ が {薪|まき} を {持|も}って きて 、 {火|ひ} の {番|ばん} を して いる 。', '{今夜|こんや} 、 {見知|みし}らぬ {娘|むすめ} が {一夜|いちや} の {宿|やど} を {求|もと}めて {来|き}た 。 {隣|となり} の サブ は {薪|まき} を {運|はこ}んで きて 、 {火|ひ} の {番|ばん} を {買|か}って {出|で}た 。', 'Tonight a young stranger came asking for a night\'s lodging. Sabu from next door has brought firewood and is tending the fire.'],
    1: ['むすめ は 、 もう この いえ の こ に なった 。 こんや は 、 しょうや さま が ぬの を みに きた 。', '{娘|むすめ} は 、 もう この {家|いえ} の {子|こ} に なった 。 {今夜|こんや} は 、 {庄屋|しょうや}さま が {布|ぬの} を {見|み}に {来|き}た 。', '{娘|むすめ} は 、 もう この {家|いえ} の {子|こ} として {暮|く}らして いる 。 {今夜|こんや} は 、 {庄屋|しょうや}さま が {布|ぬの} を {見|み}に お{越|こ}し に なった 。', 'The young woman is one of the family now. Tonight the village head has come to see the cloth.'],
  };
  const WHO = { yosaku: ['ヨサク', 'Yosaku'], otoku: ['オトク', 'Otoku'], musume: ['{娘|むすめ}', 'the young woman'], sabu: ['サブ', 'Sabu'], shoya: ['{庄屋|しょうや}さま', 'the village head'] };
  const SEATOF = { 0: { yosaku: 'yokoza', musume: 'kyakuza', otoku: 'kakaza', sabu: 'kijiri' }, 1: { yosaku: 'yokoza', shoya: 'kyakuza', otoku: 'kakaza', musume: 'kijiri' } };
  const HOLDN = (w) => 'xp_hall_w9_f1_hold_' + w, SEATED = (w) => 'xp_hall_w9_f1_seated_' + w, SEATF = (st) => 'xp_hall_w9_f1_seat_' + st;
  const STS = Object.keys(SEAT);
  out += `
@scene hall.w9.t4_board
narr: {囲炉裏|いろり} の {側|そば} の {板|いた} に 、 {席|せき} の {決|き}まり が {書|か}いて ある 。 || On the board by the hearth, the rule of the seats is written.
`;
  for (const st of STS) out += LVN3((t, i) => `?(${L[t]}) narr: 「 ${RULE[st][i]} 」 || "${RULE[st][3]}"\n`);
  out += LV3((p, t, i) => `?(${both(L[t], 'hall.w9.pat=' + p)}) narr: 「 ${nest(NIGHT[p][i])} 」 || "${NIGHT[p][3]}"\n`);
  out += `?(comp&!hall.w9.t4) comp: {名札|なふだ} を 、 {今夜|こんや} の {席|せき} に {置|お}いて いこう 。 || Let's set each name tag on tonight's seat.
`;
  for (const w of Object.keys(WHO)) out += `
@scene hall.w9.tag_${w}
!unset ${Object.keys(WHO).map(HOLDN).join(' ')}
!set ${HOLDN(w)}
narr: 「 ${WHO[w][0]} 」 の {名札|なふだ} を {取|と}った 。 || You take the name tag "${WHO[w][1]}".
`;
  for (const st of STS) {
    out += `
@scene hall.w9.seat_${st}
narr: ${PLACE[st][0]} 。 || ${cap(PLACE[st][1])}.
!if ${SEATF(st)} -> done
!if ${Object.keys(WHO).map(HOLDN).join('|')} -> try
!end
:try
`;
    const rights = [0, 1].map((p) => [p, Object.keys(SEATOF[p]).find((w) => SEATOF[p][w] === st)]);
    out += rights.map(([p, w]) => `!if hall.w9.pat=${p}&${HOLDN(w)} -> r_${w}`).join('\n') + '\n';
    out += `narr: {名札|なふだ} を {置|お}こう と して 、 {手|て} を {止|と}めた 。 {今夜|こんや} 、 ここ は その {人|ひと} の {席|せき} で は ない 。 || You go to set the tag down, and stop. Tonight this is not their seat.
!end
`;
    for (const w of [...new Set(rights.map((r) => r[1]))]) out += `:r_${w}
narr: 「 ${WHO[w][0]} 」 の {名札|なふだ} を 、 ${SEAT[st][0]} に {置|お}いた 。 || You set "${WHO[w][1]}" on ${SEAT[st][1]}.
!unset ${HOLDN(w)}
!set ${SEATED(w)} ${SEATF(st)}
!goto check
`;
    out += `:check
!if ${STS.map(SEATF).join('&')} -> all
!refresh
!end
:all
narr: {四|よっ}つ の {席|せき} に 、 {四|よっ}つ の {名前|なまえ} 。 {囲炉裏|いろり} の {火|ひ} が 、 {皆|みな} の {顔|かお} を {照|て}らす 。 || Four seats, four names. The hearth fire lights every face.
?(comp&hall.w9.pat=0) comp: お{客|きゃく}さん は {客座|きゃくざ} 。 …… {今夜|こんや} の あの {人|ひと} は 、 まだ お{客|きゃく}さん なん だ ね 。 || The guest takes the guest's seat. …Tonight she is still a guest.
?(comp&hall.w9.pat=1) comp: {木尻|きじり} に {座|すわ}る の は 、 {家族|かぞく} に なった しるし だ ね 。 || Sitting by the firewood is a sign she has become family.
${K.mark(W, 1, 't4')}
!end
:done
narr: {座布団|ざぶとん} の {上|うえ} に 、 {名札|なふだ} が {置|お}いて ある 。 || A name tag sits on the cushion.
`;
  }

  // ---- t5: the frost at the window -----------------------------------------------------------------------------------------------
  out += `
@scene hall.w9.t5
narr: {霜|しも} の {消|き}えた {窓|まど} に 、 {外|そと} の {雪|ゆき} {明|あ}かり が {映|うつ}って いる 。 {遠|とお}く で 、 {鶴|つる} の {声|こえ} が した 。 || Where the frost was, the window shows the snowlight outside. Far off, a crane calls.
${K.mark(W, 1, 't5')}
`;

  // ---- t6: what she asked (in your companion's ears; alone, Otoku heard it) ---------------------------------------------------------
  const TOLD = {
    0: { F: 'ごはん は 、 へや の まえ に おいて ください 。 なか は 、 ぜったい に みないで ください 。', E: 'ご{飯|はん} は 、 {部屋|へや} の {前|まえ} に {置|お}いて ください 。 {中|なか} は 、 {決|けっ}して {見|み}ないで ください 。', I: 'お{食事|しょくじ} は {戸|と} の {前|まえ} に {置|お}いて いただけます か 。 {織|お}って いる {間|あいだ} は 、 {決|けっ}して {覗|のぞ}かないで ください 。', A: 'お{食事|しょくじ} は 、 {戸|と} の {前|まえ} に お{置|お}き いただけます でしょう か 。 {機|はた} を {織|お}る {間|あいだ} は 、 どうか {決|けっ}して お{覗|のぞ}き に なりません よう に 。', en: 'She asked: leave her meals outside the door, and never look in while she weaves.' },
    1: { F: 'よる の あいだ 、 いろり の ひ を けさないで ください 。 なか は 、 ぜったい に みないで ください 。', E: '{夜|よる} の {間|あいだ} 、 {囲炉裏|いろり} の {火|ひ} を {消|け}さないで ください 。 {中|なか} は 、 {決|けっ}して {見|み}ないで ください 。', I: '{部屋|へや} が {冷|ひ}えない よう に 、 {囲炉裏|いろり} の {火|ひ} を {絶|た}やさないで いただけます か 。 {中|なか} は 、 {決|けっ}して {覗|のぞ}かないで ください 。', A: '{夜通|よどお}し 、 {囲炉裏|いろり} の {火|ひ} を {絶|た}やさず に いて いただけます でしょう か 。 {機|はた} を {織|お}る {間|あいだ} は 、 どうか {決|けっ}して お{覗|のぞ}き に なりません よう に 。', en: 'She asked: keep the hearth fire going all night, and never look in while she weaves.' },
  };
  out += `
@scene hall.w9.t6
!if hall.w9.t6 -> done
!if xp_hall_w9_f1_asked -> told
narr: {奥|おく} の {部屋|へや} の {襖|ふすま} は 、 ぴたり と {閉|し}まって いる 。 {中|なか} から 、 トン トン カラリ と {機|はた} の {音|おと} が する 。 || The back room's door is shut tight. From inside comes the sound of the loom: ton, ton, karari.
narr: {娘|むすめ} は {部屋|へや} に {入|はい}る {前|まえ} に 、 {何|なに} か を {頼|たの}んで いった 。 || Before she went in, she asked something of you all.
?(comp=nao) comp: {頼|たの}み は 、 ちゃんと {聞|き}いて おいた よ 。 {何|なに} が {知|し}りたい ？ || I heard what she asked, every word. What do you want to know?
?(comp=mio) comp: {頼|たの}み なら 、 {私|わたし} が {聞|き}いた わ 。 {何|なに} を {確|たし}かめる ？ || I heard her request. What do you want to check?
?(comp=ren) comp: あの {方|かた} の {頼|たの}み は 、 {私|わたし} が {伺|うかが}いました 。 {何|なに} を お{話|はな}し しましょう か 。 || I heard what she asked. What shall I tell you?
?(comp=suzu) comp: {頼|たの}み なら 、 {私|わたし} が {聞|き}いて おいた わ 。 {何|なに} が {知|し}りたい ？ || I heard her request. What do you want to know?
?(!comp) hall_otoku: あの {子|こ} の {頼|たの}み は 、 わたし が {聞|き}いた よ 。 {何|なに} が {知|し}りたい ん だい ？ || I heard what the girl asked. What do you want to know?
!hook hall_challenge hall.w9.ask
!if var._res=0 -> later
!set xp_hall_w9_f1_asked
:told
`;
  out += LV((p, t) => `?(${both(L[t], 'hall.w9.pat=' + p)}) narr: 「 ${TOLD[p][t]} 」 || "${TOLD[p].en}"\n`);
  out += `!end
:later
narr: また {後|あと} で {聞|き}こう 。 || You'll ask later.
!end
:done
narr: {機|はた} の {音|おと} が 、 {静|しず}か に {続|つづ}いて いる 。 || The loom keeps on, quietly.
`;
  const DUTY = {
    meal: ['オトク が {用意|ようい} した 、 {娘|むすめ} の {夕飯|ゆうはん} の {膳|ぜん}', 'the supper tray Otoku has made up for the young woman', 0,
      '{膳|ぜん} を {襖|ふすま} の {前|まえ} に {置|お}いた 。 {中|なか} は {見|み}ない 。 {機|はた} の {音|おと} が {少|すこ}し だけ {止|や}んで 、 また {始|はじ}まった 。 || You set the tray down outside the door, without looking in. The loom stops for a moment, then starts again.'],
    fire: ['{囲炉裏|いろり} の {側|そば} の {薪|まき}', 'the firewood by the hearth', 1,
      '{薪|まき} を くべて 、 {火|ひ} を {大|おお}きく した 。 {襖|ふすま} の {向|む}こう で 、 {機|はた} の {音|おと} が {少|すこ}し {軽|かる}く なった 。 || You feed the fire up high. Beyond the door, the loom sounds a little lighter.'],
  };
  for (const d of Object.keys(DUTY)) {
    out += `
@scene hall.w9.d_${d}
!if hall.w9.t6 -> done
narr: ${DUTY[d][0]} 。 || ${cap(DUTY[d][1])}.
!if !xp_hall_w9_f1_asked -> unknown
!if hall.w9.pat=${DUTY[d][2]} -> right
narr: {娘|むすめ} の {頼|たの}み は 、 これ で は なかった よう だ 。 || That doesn't seem to be what she asked.
?(comp) comp: {頼|たの}み の {言葉|ことば} 、 もう {一度|いちど} {言|い}おう か ？ || Shall I say what she asked again?
!end
:right
narr: ${DUTY[d][3]}
?(comp) comp: {頼|たの}まれた こと を して 、 {頼|たの}まれて いない こと は しない 。 それ も 、 {相手|あいて} を {大事|だいじ} に する {方法|ほうほう} だ ね 。 || Doing what you're asked, and nothing you're not: that's a way of caring for someone, too.
${K.mark(W, 1, 't6')}
!end
:unknown
narr: まだ 、 {娘|むすめ} が {何|なに} を {頼|たの}んだ の か {分|わ}からない 。 {先|さき} に {聞|き}こう 。 || You don't know yet what she asked. Ask first.
!end
:done
narr: {娘|むすめ} の {頼|たの}み は 、 もう {果|は}たした 。 || You've done what she asked.
`;
  }
  out += `
@scene hall.w9.d_peek
narr: {襖|ふすま} の {紙|かみ} が 、 {一箇所|いっかしょ} {破|やぶ}れて いる 。 {覗|のぞ}けば 、 {中|なか} が {見|み}える だろう 。 || The paper of the door is torn in one place. If you looked, you could see in.
narr: {覗|のぞ}かない 。 それ が 、 {娘|むすめ} の {一番|いちばん} の {頼|たの}み だった 。 || You don't look. That was the one thing she asked above all.
?(!xp_hall_w9_f1_asked&!hall.w9.t6) narr: {他|ほか} に {何|なに} を {頼|たの}まれた の か 、 {聞|き}いて みよう 。 || Find out what else she asked.
`;

  // ---- t7: the riddle stone ----------------------------------------------------------------------------------------------------
  out += '\n@scene hall.w9.t7' + K.taskTrial({ w: W, k: 1, t: 't7',
    intro: ['narr: {庭|にわ} の {石|いし} に 、 {字|じ} が {彫|ほ}って ある 。 「 {解|と}けた {者|もの} は 、 {一度|いちど} だけ 、 {帰|かえ}って また {来|く}る こと が できる 。 」 || Words cut into a stone in the garden: "Whoever solves this may once go home and come back."'],
    task: 'hall.w9.riddle',
    after: ['narr: {石|いし} の {上|うえ} の {雪|ゆき} が 、 さらさら と {落|お}ちた 。 || The snow on the stone slides off with a whisper.'],
    later: 'narr: {答|こた}え は 、 {急|いそ}がなくて いい 。 || There\'s no hurry for the answer.',
    done: 'narr: {石|いし} は 、 {答|こた}え を {覚|おぼ}えて いる 。 || The stone remembers the answer.' });

  // ---- t8: the lord's order, passed down from the gate to the shop to the hearth ---------------------------------------------------
  // Each post: what was said to the one who passes it on, then how they should pass it on to the next listener (the
  // right register for that listener, and the order as it was given).
  const ORD = { EF: ['しんげつ まで に もう いったん', 'はる まで に にたん'], E: ['{新月|しんげつ} まで に もう {一反|いったん}', '{春|はる} まで に {二反|にたん}'] };
  ORD.IA = ORD.E;
  const ORDEN = ['one more bolt by the new moon', 'two bolts by spring'];
  const DECREE = {
    EF: (p) => 'つかい ： 「 とのさま の めいれい だ 。 ' + ORD.EF[p] + ' 、 あの ぬの を もって こい 。 」',
    E: (p) => '{使|つか}い ： 「 {殿|との}さま の ご{命令|めいれい} だ 。 ' + ORD.E[p] + ' 、 あの {布|ぬの} を {納|おさ}めよ 。 」',
    IA: (p) => '{使|つか}い ： 「 {殿|との} の {仰|おお}せ で ある 。 ' + ORD.E[p] + ' 、 かの {布|ぬの} を {納|おさ}める よう に 。 」',
  };
  // [jp by level, English, target]
  const GATE = [
    [{ EF: 'わかった 。 つたえて おく よ 。', E: '{分|わ}かった 。 {伝|つた}えて おく よ 。', IA: 'おう 、 {分|わ}かった 。 {伝|つた}えて おく 。' }, '"Right. I\'ll pass it on."', 'wrong_casual'],
    [{ EF: 'かしこまりました 。 たしか に おつたえ いたします 。', E: 'かしこまりました 。 {確|たし}か に お{伝|つた}え いたします 。', IA: 'かしこまりました 。 {確|たし}か に ヨサク に {申|もう}し{伝|つた}えます 。' }, '"Certainly, sir. I shall pass it on without fail."', 'right'],
    [{ EF: 'たしか に おつたえ に なります 。', E: '{確|たし}か に お{伝|つた}え に なります 。', IA: '{確|たし}か に ヨサク に お{伝|つた}え に なります 。' }, '"I will honourably pass it on." (raising himself)', 'wrong_self'],
  ];
  const SHOP = {
    right: { EF: (o) => 'ヨサク さん 、 とのさま が 、 ' + o + ' ほしい そう です 。', E: (o) => 'ヨサク さん 、 {殿|との}さま が 、 ' + o + ' {欲|ほ}しい そう です 。', IA: (o) => 'ヨサク さん 、 {殿|との}さま から 、 ' + o + ' お{納|おさ}め する よう に と の こと です 。' },
    rude: { EF: (o) => 'おい 、 ' + o + ' おって こい 。', E: (o) => 'おい 、 ' + o + ' {織|お}れ 。', IA: (o) => 'おい 、 {殿|との}さま の {仰|おお}せ だ 。 ' + o + ' {織|お}って こい 。' },
  };
  const HOME = {
    right: { EF: (o) => 'ばあさん 、 とのさま が 、 ' + o + ' ほしい そう だ 。', E: (o) => 'ばあさん 、 {殿|との}さま が 、 ' + o + ' {欲|ほ}しい そう だ 。', IA: (o) => 'ばあさん 、 {殿|との}さま が 、 ' + o + ' {欲|ほ}しい と さ 。' },
    stiff: { EF: (o) => 'とのさま より 、 ' + o + ' おさめる よう 、 おおせ が ございました 。', E: (o) => '{殿|との}さま より 、 ' + o + ' {納|おさ}める よう 、 {仰|おお}せ が ございました 。', IA: (o) => '{殿|との}さま より 、 ' + o + ' {納|おさ}める よう 、 {仰|おお}せ が ございました 。' },
  };
  const LVS = ['EF', 'E', 'IA'];
  const opt = (cond, jp, en, to) => `* [${cond}] ${jp} || ${en} -> ${to}\n`;
  const P2 = (t, p) => both(L[t], 'hall.w9.pat=' + p);
  const POSTF = (k) => 'xp_hall_w9_f2_post_' + k;
  out += `
@scene hall.w9.post_gate
!if hall.w9.t8 -> done
!if ${POSTF('gate')} -> passed
narr: {殿|との}さま の {館|やかた} の {門|もん} 。 {使|つか}い の {者|もの} が 、 ゲンスケ に {言|い}い{渡|わた}して いる 。 || The gate of the lord's house. The messenger is giving Gensuke his orders.
`;
  out += LV3((p, t) => `?(${P2(t, p)}) narr: 「 ${nest(DECREE[t](p))} 」 || "The messenger: 'His lordship's order: ${ORDEN[p]} of that cloth.'"\n`);
  out += `narr: ゲンスケ は 、 {何|なん} と {答|こた}える べき だろう 。 || How should Gensuke answer him?
!choice
`;
  for (const t of LVS) for (const [jp, en, to] of GATE) out += opt(L[t], jp[t], en, to);
  out += `:right
narr: ゲンスケ は {深|ふか}く {頭|あたま} を {下|さ}げた 。 {殿|との}さま の {使|つか}い に は 、 {自分|じぶん} を {低|ひく}く して {答|こた}える 。 || Gensuke bows deep. To the lord's man, you answer by making yourself low.
!set ${POSTF('gate')}
!refresh
!end
:wrong_casual
narr: その {口|くち} の {利|き}き{方|かた} で は 、 {使|つか}い の {顔|かお} が {曇|くも}る 。 {殿|との}さま の {使|つか}い に 、 {友達|ともだち} の よう に {話|はな}して は いけない 。 || Spoken like that, the messenger's face would darken. You don't talk to a lord's man as you would to a friend.
!end
:wrong_self
narr: {丁寧|ていねい} な よう で 、 {自分|じぶん} を {持|も}ち{上|あ}げて いる 。 {自分|じぶん} の する こと に は 、 {謙譲語|けんじょうご} を {使|つか}う 。 || It sounds polite, but it raises Gensuke himself. For your own doing, use humble words.
!end
:passed
narr: ゲンスケ は 、 {注文|ちゅうもん} を {帳面|ちょうめん} に {書|か}き{付|つ}けて いる 。 || Gensuke is writing the order down in his book.
!end
:done
narr: {門|もん} は {閉|し}まって いる 。 || The gate is shut.
`;
  out += `
@scene hall.w9.post_shop
!if hall.w9.t8 -> done
!if ${POSTF('shop')} -> passed
!if !${POSTF('gate')} -> early
narr: ゲンスケ の {店|みせ} 。 {町|まち} に {下|お}りて きた ヨサク に 、 ゲンスケ が {殿|との}さま の {注文|ちゅうもん} を {伝|つた}える 。 || Gensuke's shop. Yosaku has come down to town, and Gensuke passes on the lord's order.
narr: ゲンスケ は 、 ヨサク に {何|なん} と {言|い}う べき だろう 。 || What should Gensuke say to Yosaku?
!choice
`;
  for (const p of [0, 1]) for (const t of LVS) {
    out += opt(P2(t, p), SHOP.rude[t](ORD[t][p]), '"Oi. Weave me ' + ORDEN[p] + '."', 'wrong_rude');
    out += opt(P2(t, p), SHOP.right[t](ORD[t][1 - p]), '"Yosaku-san, his lordship would like ' + ORDEN[1 - p] + '."', 'wrong_what');
    out += opt(P2(t, p), SHOP.right[t](ORD[t][p]), '"Yosaku-san, his lordship would like ' + ORDEN[p] + '."', 'right');
  }
  out += `:right
narr: ヨサク は {頷|うなず}いて 、 {笠|かさ} を {被|かぶ}り{直|なお}した 。 {商|あきな}い の {相手|あいて} に は 、 です ・ ます で {丁寧|ていねい} に 。 || Yosaku nods and settles his hat. To someone you do business with: polite です and ます.
!set ${POSTF('shop')}
!refresh
!end
:wrong_rude
narr: それ で は 、 {殿|との}さま の {使|つか}い より {偉|えら}そう だ 。 {大事|だいじ} な {取引|とりひき} の {相手|あいて} に 、 その {言|い}い{方|かた} は ない 。 || That sounds grander than the lord's own messenger. You don't talk to someone you do business with like that.
!end
:wrong_what
narr: {言|い}い{方|かた} は いい が 、 {注文|ちゅうもん} が {違|ちが}う 。 {門|もん} で {聞|き}いた {話|はなし} を {思|おも}い{出|だ}そう 。 || Nicely put, but that isn't the order. Remember what was said at the gate.
!end
:early
narr: ゲンスケ は 、 まだ {殿|との}さま の {注文|ちゅうもん} を {聞|き}いて いない 。 {先|さき} に {門|もん} へ 。 || Gensuke hasn't heard the lord's order yet. The gate first.
!end
:passed
narr: ゲンスケ は 、 {次|つぎ} の {客|きゃく} に {反物|たんもの} を {広|ひろ}げて いる 。 || Gensuke is unrolling cloth for his next customer.
!end
:done
narr: ゲンスケ の {店|みせ} は 、 {今日|きょう} も {繁盛|はんじょう} して いる 。 || Gensuke's shop is busy as ever.
`;
  out += `
@scene hall.w9.post_hearth
!if hall.w9.t8 -> done
!if !${POSTF('shop')} -> early
narr: {家|いえ} の {囲炉裏|いろり} 。 {町|まち} から {戻|もど}った ヨサク が 、 オトク に {話|はな}す 。 || The hearth at home. Back from town, Yosaku tells Otoku.
narr: ヨサク は 、 オトク に {何|なん} と {言|い}う べき だろう 。 || What should Yosaku say to Otoku?
!choice
`;
  for (const p of [0, 1]) for (const t of LVS) {
    out += opt(P2(t, p), HOME.right[t](ORD[t][p]), '"Love, his lordship wants ' + ORDEN[p] + '."', 'right');
    out += opt(P2(t, p), HOME.stiff[t](ORD[t][p]), '"His lordship has graciously commanded ' + ORDEN[p] + '." (as to the lord\'s man)', 'wrong_stiff');
    out += opt(P2(t, p), HOME.right[t](ORD[t][1 - p]), '"Love, his lordship wants ' + ORDEN[1 - p] + '."', 'wrong_what');
  }
  out += `:right
narr: オトク は {黙|だま}って {聞|き}いて 、 {機|はた} の {音|おと} の する {方|ほう} を {見|み}た 。 || Otoku listens in silence, then looks towards the sound of the loom.
?(comp) comp: {同|おな}じ {注文|ちゅうもん} が 、 {門|もん} で は {仰|おお}せ 、 {店|みせ} で は ご{注文|ちゅうもん} 、 {家|いえ} で は 「 {欲|ほ}しい そう だ 」 に なった 。 {言葉|ことば} は 、 {相手|あいて} に {合|あ}わせて {着替|きが}える ん だ ね 。 || The same order was a decree at the gate, a commission at the shop and "he wants" at home. Words change their clothes to suit the listener.
${K.mark(W, 2, 't8')}
!end
:wrong_stiff
narr: オトク が {吹|ふ}き{出|だ}した 。 「 いつ から わたし に 、 そんな {口|くち} を {利|き}く よう に なった ん です か 。 」 || Otoku bursts out laughing. "Since when do you talk to me like that?"
!end
:wrong_what
narr: {言|い}い{方|かた} は いい が 、 {注文|ちゅうもん} が {違|ちが}う 。 {門|もん} で {聞|き}いた {話|はなし} を {思|おも}い{出|だ}そう 。 || That's the right way to say it, but not the order. Remember what was said at the gate.
!end
:early
narr: ヨサク は 、 まだ {町|まち} から {戻|もど}って いない 。 || Yosaku isn't back from town yet.
!end
:done
narr: {囲炉裏|いろり} の {火|ひ} が 、 ぱちぱち と {鳴|な}って いる 。 || The hearth fire crackles.
`;

  // ---- t9: Yosaku and Otoku ----------------------------------------------------------------------------------------------------
  out += `
@scene hall.w9.t9
!if hall.w9.t9 -> after
!if !hall.w9.t8 -> wait
hall_yosaku: {殿|との}さま の {仰|おお}せ だ 。 もう {一度|いちど} 、 あの {子|こ} に {織|お}って もらう しか ない 。 || It's his lordship's order. There's nothing for it but to have the girl weave once more.
hall_otoku: {何|なに} を {言|い}う ん です か 。 あの {子|こ} 、 あんなに {痩|や}せて しまって 。 || What are you saying? Look how thin she's got.
!encounter hall.w9.quarrel
!if var._enc=asked -> asked
narr: ヨサク は {薪|まき} {小屋|ごや} へ {出|で}て いった 。 オトク は 、 {囲炉裏|いろり} の {火|ひ} を {黙|だま}って {見|み}て いる 。 || Yosaku has gone out to the woodshed. Otoku watches the fire in silence.
!end
:asked
hall_yosaku: …… {娘|むすめ} に 、 {聞|き}いて みよう 。 {嫌|いや} なら 、 {断|ことわ}って いい と 。 || …We'll ask her. And if she doesn't want to, she can say no.
hall_otoku: ええ 。 {二人|ふたり} で 、 {聞|き}きましょう 。 || Yes. We'll ask her together.
${K.mark(W, 2, 't9')}
!end
:wait
narr: ヨサク と オトク は 、 {町|まち} から の {知|し}らせ を {待|ま}って いる 。 || Yosaku and Otoku are waiting for news from town.
!end
:after
hall_otoku: {頼|たの}む の と {命|めい}じる の は 、 {違|ちが}う もの です ね 。 || Asking and ordering are not the same thing, are they.
`;

  // ---- t10: the farewell -------------------------------------------------------------------------------------------------------------
  out += `
@scene hall.w9.t10
!if hall.w9.t10 -> after
!if !hall.w9.t8 -> wait
!if !hall.w9.t9 -> wait
narr: {娘|むすめ} は 「 {最後|さいご} に もう {一反|いったん} だけ 、 お{二人|ふたり} の ため に {織|お}らせて ください 」 と {言|い}って 、 {部屋|へや} に {入|はい}った 。 || The young woman said, "Let me weave just one more bolt, for the two of you," and went in.
narr: {夜明|よあ}け {前|まえ} 、 {機|はた} の {音|おと} が {止|や}んだ 。 {心配|しんぱい} に なった ヨサク が 、 {襖|ふすま} を {細|ほそ}く {開|あ}けて しまった 。 || Before dawn the loom falls silent. Worried, Yosaku slides the door open a crack.
narr: {中|なか} に いた の は 、 {羽|はね} の {抜|ぬ}けた {一羽|いちわ} の {鶴|つる} だった 。 {鶴|つる} は {娘|むすめ} の {姿|すがた} に {戻|もど}って 、 {静|しず}か に {手|て} を {突|つ}いた 。 || Inside is a crane, half her feathers gone. She becomes the young woman again and bows, hands to the floor.
!encounter hall.w9.farewell
!if var._res=0 -> later
!set xp_hall_w9_f2_t10
!hook hall_trial w9 t10
!if var._res=1 -> finale
!refresh
!end
:finale
!call hall.w9.end
!end
:wait
narr: {機|はた} の {音|おと} は 、 まだ {続|つづ}いて いる 。 || The loom is still going.
?(!hall.w9.t8) narr: {殿|との}さま の {注文|ちゅうもん} が 、 まだ {家|いえ} まで {届|とど}いて いない 。 || The lord's order has not reached the house yet.
?(!hall.w9.t9) narr: ヨサク と オトク は 、 まだ {話|はな}し{合|あ}えて いない 。 || Yosaku and Otoku haven't talked it through yet.
!end
:later
narr: {娘|むすめ} は 、 {手|て} を {突|つ}いた まま {待|ま}って いる 。 || The young woman waits, still bowing.
!end
:after
narr: {機|はた} は 、 もう {鳴|な}らない 。 || The loom is silent now.

@scene hall.w9.end
!sequence hall.w9 begin
!shot tale
narr: {鶴|つる} は 、 {最後|さいご} の {一反|いったん} を {二人|ふたり} の {前|まえ} に {置|お}いて 、 {朝|あさ} の {空|そら} へ {飛|と}び{立|た}った 。 || The crane lays the last bolt before the old couple and rises into the morning sky.
narr: {鶴|つる} は {一度|いちど} だけ {振|ふ}り{返|かえ}った 。 その {目|め} が 、 {誰|だれ} か に {似|に}て いる {気|き} が した 。 || She looks back once. Her eyes remind you of someone.
hall_sabu: ねえちゃん ！ また ね ！ || Big sister! See you!
hall_otoku: …… {達者|たっしゃ} で ね 。 || …Take care of yourself.
?(comp=nao) comp: {戻|もど}ったら 、 {葦|あし}ノ{瀬|せ} に {手紙|てがみ} でも {書|か}こう か な 。 …… なんとなく 、 {書|か}きたく なった 。 || When we're back, maybe I'll write a letter home to Reedwake. …I just feel like it, somehow.
?(comp=mio) comp[happy]: {家族|かぞく} に は {家族|かぞく} の 、 お{客|きゃく}さん に は お{客|きゃく}さん の {言葉|ことば} 。 {言葉|ことば} {一|ひと}つ で 、 {近|ちか}く も {遠|とお}く も なる のね 。 || Family words for family, guest words for guests. One word, and you're near or far.
?(comp=ren) comp: {灯|ひ} が {九|ここの}つ 、 {戻|もど}りました 。 {残|のこ}り は 、 {一|ひと}つ です 。 …… {鶴|つる} 、 です か 。 || Nine lights back. One to go. …A crane, was it.
?(comp=suzu) comp: {第|だい}{九幕|きゅうまく} 、 {幕|まく} 。 …… {泣|な}かせる {芝居|しばい} だった わ 。 || End of act nine. …That one got me.
?(!comp) narr: {雪|ゆき} の {上|うえ} に 、 {白|しろ}い {羽|はね} が {一枚|いちまい} {落|お}ちて いた 。 || A single white feather lies on the snow.
!sequence hall.w9 end
narr: {朝|あさ} の {雪|ゆき} {明|あ}かり が {畳|たた}まれる よう に {薄|うす}れて 、 {気|き}が {付|つ}く と 、 {館|やかた} の {囲炉裏|いろり} の {前|まえ} に いた 。 || The morning snowlight folds away, and when you look up you are by the hall's hearth.
!set hall_w9_done
!hook hall_finish
`;

  RB.script.add(out);
})(RB.content);
