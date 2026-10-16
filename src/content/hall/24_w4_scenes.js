/* The Hall of a Hundred Tales, wing 4, The Borrowed Umbrella: the scenes (expansion P15; plan 04_DUNGEONS.md D9; maps in
 * 13_w4_maps.js, tasks and encounters in 18_w4_learning.js). Each trial sets its floor's own flag and tells the Hall;
 * what a trial shows follows the level its task is set at (the profile, or one up on the Grow route); the pattern
 * (hall.w4.pat) chooses who needs what, the diary's year, the crossing the notice allows and the temple's rules.
 * Gosaku (he/him) is the peddler, Myōshin (she/her) the nun, the umbrella they/them; Oume and Otake she/her, Kyūbei
 * he/him, Kaede they/them. Suzu's lines have Kansai versions (src/content/dialect/kansai_99_hall.js). */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const K = C.hallKit, W = 'w4', L = K.lv(W), both = L.both;
  const TALE = C.hallW4Tale, FT = C.hallW4TaleF;
  const cap = (x) => x[0].toUpperCase() + x.slice(1);
  const LV = (fn) => [0, 1].flatMap((p) => ['F', 'E', 'I', 'A'].map((t) => fn(p, t))).join('');
  let out = `
@scene hall.w4.f1_first
!set hall_w4_f1_seen
narr: {紙|かみ} の {戸|と} を {抜|ぬ}ける と 、 {雨|あめ} の {村|むら} だった 。 {紫陽花|あじさい} が {垣根|かきね} ごと に {咲|さ}いて 、 {屋根|やね} から {雨|あま}だれ が {落|お}ちて いる 。 || Through the paper screen: a village in the rain. Hydrangeas bloom along every hedge, and rain drips from the eaves.
?(comp=nao) comp: {梅雨|つゆ} の {村|むら} か 。 {手紙|てがみ} が {濡|ぬ}れない よう に 、 {鞄|かばん} を {抱|かか}えて {歩|ある}いた もん だ 。 || A village in the rainy season. I used to walk hugging my bag so the letters wouldn't get wet.
?(comp=mio) comp: {紫陽花|あじさい} 、 きれい 。 {雨|あめ} の {日|ひ} の {方|ほう} が 、 {色|いろ} が {深|ふか}い の よ 。 || Hydrangeas. Their colour is deeper on rainy days.
?(comp=ren) comp: {雨|あめ} の {日|ひ} は 、 {灯|ひ} の {番|ばん} も {大変|たいへん} です 。 でも 、 {灯|ひ} が {一番|いちばん} {頼|たよ}られる {日|ひ} でも あります 。 || Rainy days are hard on a lamp-keeper. They're also the days a light is needed most.
?(comp=suzu) comp: {第|だい}{四幕|よんまく} は 、 {雨|あめ} の {舞台|ぶたい} ね 。 {今度|こんど} の {主役|しゅやく} は 、 {傘|かさ} そのもの らしい わ よ 。 || Act four: a rainy stage. This time the lead is the umbrella itself, I hear.
?(!comp) narr: {雨|あめ} の {音|おと} だけ が 、 {村|むら} を {包|つつ}んで いる 。 || Only the sound of rain wraps the village.

@scene hall.w4.f2_first
!set hall_w4_f2_seen
narr: {道|みち} の {先|さき} で 、 {川|かわ} が {茶色|ちゃいろ} く {溢|あふ}れて いる 。 {土手|どて} に {高札|こうさつ} が {立|た}って いる 。 || Ahead, the river runs brown and over its banks. A notice board stands on the bank.
?(comp&comp!=ren) comp: {一年|いちねん} {前|まえ} 、 ゴサク さん は ここ で {足止|あしど}め された ん だ ね 。 || A year ago, this is where Gosaku was stopped.
?(comp=ren) comp: {一年|いちねん} {前|まえ} 、 ゴサク さん は ここ で {足止|あしど}め された ん です ね 。 || A year ago, this is where Gosaku was stopped.

@scene hall.w4.f3_first
!set hall_w4_f3_seen
narr: {石段|いしだん} を {登|のぼ}る と 、 {古|ふる}い {山門|さんもん} 。 その {脇|わき} で 、 {赤|あか}い {傘|かさ} が {一本足|いっぽんあし} で {立|た}って 、 {雨|あめ} に {打|う}たれて いる 。 || Up the steps, an old temple gate. Beside it a red umbrella stands on its one leg in the rain.
?(comp=nao) comp: {傘|かさ} が …… {立|た}ってる 。 {目|め} が {一|ひと}つ ある 。 …… {見|み}なかった こと に して いい か ？ || The umbrella's… standing up. It has one eye. …Can I pretend I didn't see that?
?(comp=mio) comp: {寂|さび}しそう …… 。 {雨|あめ} に {濡|ぬ}れる {傘|かさ} なんて 、 {初|はじ}めて {見|み}た わ 。 || It looks so lonely… I've never seen an umbrella getting rained on.
?(comp=ren) comp: {長|なが}く {使|つか}われた {物|もの} に は 、 {心|こころ} が {宿|やど}る と {言|い}います 。 {本当|ほんとう} でした ね 。 || They say a heart comes to live in things used for a long time. It's true, then.
?(comp=suzu) comp: {出|で}た わ ね 、 {主役|しゅやく} が 。 {舞台|ぶたい} {袖|そで} で {拗|す}ねてる みたい だ けど 。 || There's our lead. Sulking in the wings, by the look of it.

@scene hall.w4.bench1
!hook hall_station w4_b1

@scene hall.w4.bench2
!hook hall_station w4_b2

@scene hall.w4.bench3
!hook hall_station w4_b3

@scene hall.w4.spring
narr: {雨水|あまみず} を {溜|た}めた {古|ふる}い {井戸|いど} 。 {不思議|ふしぎ} と 、 {澄|す}んで いる 。 || An old well full of rainwater, strangely clear.
!hook hall_station w4_sp

@scene hall.w4.gosaku1
!faceplayer hall_gosaku
!if hall.w4.t2 -> after
hall_gosaku: {出|で}かける {前|まえ} に 、 {近所|きんじょ} の {人|ひと} が {物|もの} を {借|か}りに {来|く}る ん です 。 {頼|たの}まれた {物|もの} を 、 {荷|に} から {貸|か}して あげて ください 。 || Before I go, the neighbours come to borrow things. Please lend them what they ask for from my pack.
hall_gosaku: {中|なか} に は 、 はっきり {言|い}わない {人|ひと} も いる 。 {何|なに} が {要|い}る の か 、 よく {聞|き}いて あげて ください 。 || Some won't say it straight out. Listen for what they need.
!end
:after
hall_gosaku: ありがとう 。 …… さて 、 あの {傘|かさ} を {追|お}いかけ なければ 。 || Thank you. …Now, I have to go after that umbrella.

@scene hall.w4.gosaku3
!faceplayer hall_gosaku3
!if hall.w4.t10 -> after
!if hall.w4.t9 -> veranda
hall_gosaku: {傘|かさ} が 、 {門|もん} の {脇|わき} に いる 。 {私|わたし} の {方|ほう} を 、 {見|み}よう と も しない 。 || The umbrella is by the gate. It won't even look my way.
!end
:veranda
hall_gosaku: ミョウシン さま が 、 {縁側|えんがわ} に いらっしゃる 。 {寺|てら} の {決|き}まり を {守|まも}って 、 {上|あ}がらせて もらおう 。 || Myōshin is on the veranda. Let's keep the temple's rules and ask to go up.
!end
:after
hall_gosaku: {来年|らいねん} の {梅雨|つゆ} も 、 {傘|かさ} を {返|かえ}しに {来|き}ます 。 {今度|こんど} は 、 {本当|ほんとう} に 。 || Next rainy season I'll come to return the umbrella again. Properly, this time.
`;

  // ---- t1: the story room ----------------------------------------------------------------------------------------------
  const E_PANELS = [TALE.P1, TALE.P2, TALE.P3, TALE.P4].map((x) => x.replace(/「/g, '『').replace(/」/g, '』'));
  const F_PANELS = FT.map((x) => x.replace(/「/g, '『').replace(/」/g, '』'));
  const PANEL_EN = ['On a stormy night, Gosaku the peddler borrowed an umbrella at the mountain temple.', '"I\'ll bring it back when the rain stops," Gosaku promised.', 'But the river flooded, and for a year Gosaku could not get back to the temple.', 'The umbrella, tired of waiting, hopped off on its one leg toward the temple by itself.'];
  out += '\n@scene hall.w4.t1' + K.taskTrial({ w: W, k: 0, t: 't1',
    intro: ['narr: ゴサク の {家|いえ} の {壁|かべ} に 、 {絵巻|えまき} が {掛|か}けて ある 。 || A picture scroll hangs on the wall of Gosaku\'s house.']
      .concat(...[0, 1, 2, 3].map((i) => ['?(' + L.EF + ') narr: 「 ' + F_PANELS[i] + ' 。 」 || "' + PANEL_EN[i] + '"', '?(' + L.NOTF + ') narr: 「 ' + E_PANELS[i] + ' 。 」 || "' + PANEL_EN[i] + '"']),
      ['narr: {雨漏|あまも}り の {雫|しずく} が {絵巻|えまき} に {落|お}ちて 、 {絵|え} の {順番|じゅんばん} が {乱|みだ}れた 。 || A drip from the leaking roof falls on the scroll, and the pictures slip out of order.']),
    task: 'hall.w4.story',
    after: ['narr: {絵巻|えまき} が 、 {元|もと} の {順番|じゅんばん} に {戻|もど}った 。 || The scroll is back in its order.', '!challenge hall.w4.story_q',
      '?(comp=nao) comp: {返|かえ}す つもり で も 、 {返|かえ}せない こと は ある 。 {配達|はいたつ} も 、 {同|おな}じ だ 。 || You can mean to bring something back and still not manage it. Deliveries are the same.',
      '?(comp=mio) comp: {傘|かさ} に は 、 ゴサク さん の {事情|じじょう} が {分|わ}からなかった の ね 。 …… {待|ま}つ {方|ほう} も 、 つらい わ 。 || The umbrella couldn\'t know what had happened to Gosaku. …Waiting is hard too.',
      '?(comp=ren) comp: {約束|やくそく} は 、 {守|まも}る つもり が あって も 、 {川|かわ} に {流|なが}される こと が あります 。 || Even a promise you mean to keep can be washed away by a river.',
      '?(comp=suzu) comp: {小道具|こどうぐ} が {勝手|かって} に {帰|かえ}る なんて 、 {一座|いちざ} なら {大騒|おおさわ}ぎ よ 。 || A prop going home by itself? The troupe would be in uproar.'],
    later: 'narr: {絵|え} は 、 {後|あと} で {並|なら}べ{直|なお}せる 。 || You can put the pictures in order later.',
    done: 'narr: {絵巻|えまき} は 、 {元|もと} の {順番|じゅんばん} で {掛|か}かって いる 。 || The scroll hangs in its proper order.' });

  // ---- t2: the neighbours' requests ------------------------------------------------------------------------------------
  const ITEM = { mino: ['{蓑|みの}', 'the straw raincoat'], towel: ['{手|て}ぬぐい', 'the hand towel'], lamp: ['{提灯|ちょうちん}', 'the lantern'], sandals: ['{草鞋|わらじ}', 'the straw sandals'] };
  const NEEDS = { 0: { oume: 'mino', otake: 'towel', kyubei: 'lamp', kaede: 'sandals' }, 1: { oume: 'sandals', otake: 'lamp', kyubei: 'towel', kaede: 'mino' } };
  const WHO = { oume: ['hall_oume', 'Oume', 'her', 'オウメ'], otake: ['hall_otake', 'Otake', 'her', 'オタケ'], kyubei: ['hall_kyubei', 'Kyūbei', 'him', 'キュウベエ'], kaede: ['hall_kaede', 'Kaede', 'them', 'カエデ'] };
  const REQ = {
    mino: { F: ['みの を かして ください 。', 'Please lend me the straw raincoat.'], E: ['{畑|はたけ} に {出|で}る ので 、 {蓑|みの} を {貸|か}して もらえます か 。', 'I\'m going out to the fields; could you lend me a straw raincoat?'],
      I: ['これ から {畑|はたけ} に {出|で}る ん です が 、 {両手|りょうて} を {使|つか}う ので 、 {傘|かさ} は ちょっと …… 。', 'I\'m off to the fields now, but I\'ll need both hands, so an umbrella\'s no good…'],
      A: ['{畑|はたけ} {仕事|しごと} で {両手|りょうて} が ふさがります もの で 、 {傘|かさ} の {代|か}わり に {着|き}られる {物|もの} が あれば 、 {助|たす}かる の です が 。', 'Both my hands are taken with the field work, so if there were something I could wear instead of an umbrella, it would be a great help.'] },
    towel: { F: ['てぬぐい を かして ください 。', 'Please lend me the hand towel.'], E: ['{髪|かみ} が {濡|ぬ}れて しまった ので 、 {手|て}ぬぐい を {貸|か}して もらえます か 。', 'My hair\'s got wet; could you lend me a hand towel?'],
      I: ['{雨|あめ} で 、 {子供|こども} の {頭|あたま} が びしょびしょ で …… 。 {拭|ふ}く {物|もの} が ある と {助|たす}かる ん です けど 。', 'The rain\'s soaked the little one\'s head… Something to dry it with would help.'],
      A: ['{恐|おそ}れ{入|い}ります が 、 {濡|ぬ}れた {髪|かみ} を {拭|ふ}く {物|もの} を 、 {一|ひと}つ お{借|か}り できません でしょう か 。', 'I\'m sorry to trouble you, but might I borrow something to dry wet hair with?'] },
    lamp: { F: ['ちょうちん を かして ください 。', 'Please lend me the lantern.'], E: ['{帰|かえ}り {道|みち} が {暗|くら}い ので 、 {提灯|ちょうちん} を {貸|か}して もらえます か 。', 'The way home is dark; could you lend me a lantern?'],
      I: ['{家|いえ} まで {帰|かえ}りたい ん です が 、 {道|みち} が {暗|くら}くて 、 {足元|あしもと} が {見|み}えない ん です よ 。', 'I want to get home, but the road\'s so dark I can\'t see my feet.'],
      A: ['{日|ひ} も {暮|く}れて まいりました し 、 {足元|あしもと} を {照|て}らす {物|もの} を お{借|か}り できません か 。', 'It is getting dark; might I borrow something to light my way?'] },
    sandals: { F: ['わらじ を かして ください 。', 'Please lend me the straw sandals.'], E: ['{紐|ひも} が {切|き}れた ので 、 {草鞋|わらじ} を {貸|か}して もらえます か 。', 'My strap has snapped; could you lend me some straw sandals?'],
      I: ['{歩|ある}いて いたら 、 {紐|ひも} が {切|き}れて しまって …… 。 {裸足|はだし} で は 、 {山道|やまみち} は {無理|むり} です ね 。', 'My strap snapped while I was walking… I can\'t do the mountain path barefoot.'],
      A: ['{紐|ひも} が {切|き}れて しまいまして 。 {履|は}く {物|もの} を {一足|いっそく} 、 お{借|か}り できれば 、 {大変|たいへん} {助|たす}かります 。', 'My strap has broken. If I could borrow something to wear on my feet, I would be most grateful.'] },
  };
  const HOLD = (i) => 'xp_hall_w4_f0_hold_' + i, GAVE = (i) => 'xp_hall_w4_f0_gave_' + i, SERVED = (w) => 'xp_hall_w4_f0_served_' + w;
  for (const i of Object.keys(ITEM)) out += `
@scene hall.w4.i_${i}
!if ${HOLD(i)} -> holding
!unset ${Object.keys(ITEM).map(HOLD).join(' ')}
!set ${HOLD(i)}
narr: ゴサク の {荷|に} から 、 ${ITEM[i][0]} を {手|て} に {取|と}った 。 || You take ${ITEM[i][1]} from Gosaku's pack.
!end
:holding
narr: ${ITEM[i][0]} を {持|も}って いる 。 || You are holding ${ITEM[i][1]}.
`;
  for (const w of Object.keys(WHO)) {
    const [id, name, obj, nameJp] = WHO[w];
    out += `
@scene hall.w4.n_${w}
!faceplayer ${id}
!if ${SERVED(w)} -> done
`;
    out += LV((p, t) => `?(${both(L[t], 'hall.w4.pat=' + p)}) ${id}: 「 ${REQ[NEEDS[p][w]][t][0]} 」 || "${REQ[NEEDS[p][w]][t][1]}"\n`);
    out += `!if hall.w4.pat=1 -> p1
!if ${HOLD(NEEDS[0][w])} -> give0
!goto other
:p1
!if ${HOLD(NEEDS[1][w])} -> give1
:other
!if ${Object.keys(ITEM).map(HOLD).join('|')} -> wrong
!end
:wrong
narr: ${nameJp} が {首|くび} を {傾|かし}げた 。 「 ええ と …… それ じゃ なくて 。 」 || ${name} tilts ${obj === 'them' ? 'their' : obj === 'her' ? 'her' : 'his'} head. "Um… not that."
?(comp&comp!=ren) comp: {何|なに} を {頼|たの}んで いた か 、 もう {一度|いちど} {聞|き}いて みよう 。 || Let's hear again what they were asking for.
?(comp=ren) comp: {何|なに} を {頼|たの}んで いた か 、 もう {一度|いちど} {聞|き}いて みましょう 。 || Let's hear again what they were asking for.
!end
`;
    for (const p of [0, 1]) {
      const it = NEEDS[p][w];
      out += `:give${p}
narr: ${ITEM[it][0]} を {渡|わた}した 。 「 {助|たす}かります ！ 」 || You hand over ${ITEM[it][1]}. "That's just what I needed!"
!unset ${Object.keys(ITEM).map(HOLD).join(' ')}
!set ${SERVED(w)} ${GAVE(it)}
!goto check
`;
    }
    out += `:check
!if ${Object.keys(WHO).map(SERVED).join('&')} -> all
!refresh
!end
:all
narr: {近所|きんじょ} の {人|ひと} たち は 、 {皆|みな} {借|か}りた {物|もの} を {持|も}って {帰|かえ}って いった 。 || The neighbours have all gone home with what they borrowed.
?(comp&comp!=ren) comp: はっきり {言|い}わない {頼|たの}み も 、 {聞|き}けば {分|わ}かる もの だ ね 。 || Even a request nobody says outright makes sense once you listen.
?(comp=ren) comp: はっきり {言|い}わない {頼|たの}み も 、 {聞|き}けば {分|わ}かる もの です ね 。 || Even a request nobody says outright makes sense once you listen.
${K.mark(W, 0, 't2')}
!end
:done
${id}: ありがとう 。 {大事|だいじ} に {使|つか}います 。 || Thank you. I'll take good care of it.
`;
  }

  // ---- t3: the peddler's cards and their stone -----------------------------------------------------------------------------
  const CE = {
    0: { F: ['Please lend me the umbrella.', 'May I wait here?', 'Please lend(-dictionary) me the straw raincoat.', 'Please shut the window.'],
      E: ['Please open the window.', 'May I take(-dictionary) a picture?', 'Please don\'t come in.', 'May I sit here?'],
      I: ['I intend to go to the temple tomorrow.', 'I\'m thinking of returning the umbrella.', 'I meant to return it, but the river flooded.', 'Tomorrow, I "believe I went" to the temple.'],
      A: ['May I (humbly) borrow the umbrella?', 'Would you let me wait a little?', 'May I (humbly) ask your name?', 'Would you "humbly lend" me the umbrella?'] },
    1: { F: ['Please lend me the lantern.', 'May I rest here?', 'May I open(-dictionary) the window?', 'Please be quiet.'],
      E: ['Please wash your hands.', 'Please don\'t take your shoes off.', 'Running here "is good-is"?', 'May I open the window?'],
      I: ['I intend to come next year too.', 'I thought I would apologise.', 'I intend "let\'s return" the umbrella.', 'I intend not to go.'],
      A: ['Could you explain?', 'Could you wait a moment?', 'May I (humbly) look?', 'May I "honourably look"?'] },
  };
  out += '\n@scene hall.w4.t3' + K.taskTrial({ w: W, k: 0, t: 't3',
    intro: ['narr: {行商人|ぎょうしょうにん} の {心得|こころえ} を {刻|きざ}んだ {石|いし} 。 「 {四|よん} {枚|まい} の {札|ふだ} の うち 、 {一枚|いちまい} だけ が {間違|まちが}って いる 。 」 || A stone carved with the peddler\'s rules of trade: "Of the four cards, one alone is wrong."'],
    task: { 0: 'hall.w4.counter0', 1: 'hall.w4.counter1' },
    after: ['narr: {間違|まちが}った {札|ふだ} が 、 {雨|あめ} に {溶|と}けて {消|き}えた 。 || The wrong card melts away in the rain.', '?(comp&comp!=ren) comp: {頼|たの}み {方|かた} を {間違|まちが}えたら 、 {商売|しょうばい} に ならない から ね 。 || Ask the wrong way and there\'s no trade at all.', '?(comp=ren) comp: {頼|たの}み {方|かた} を {間違|まちが}えたら 、 {商売|しょうばい} に なりません から ね 。 || Ask the wrong way and there\'s no trade at all.'],
    later: 'narr: {札|ふだ} を {一枚|いちまい} ずつ {読|よ}んで から 、 また {来|こ}よう 。 || Read the cards one by one, then come back.',
    done: 'narr: {石|いし} の {字|じ} は 、 もう {何|なに} も {問|と}わない 。 || The carving asks nothing more.' });
  for (let i = 0; i < 4; i++) {
    out += `\n@scene hall.w4.card${i + 1}\nnarr: {行商人|ぎょうしょうにん} の {札|ふだ} 。 || One of the peddler's cards.\n`;
    out += LV((p, t) => `?(${both(L[t], 'hall.w4.pat=' + p)}) narr: 「 ${C.hallW4Cards[p][t][i][0]} 」 || "${CE[p][t][i]}"\n`);
  }

  // ---- t4: Gosaku's diary, followed the way he really went ---------------------------------------------------------------
  const RIGHT = { 0: { f1: 'bank', f2: 'woods', f3: 'ferry' }, 1: { f1: 'bridge', f2: 'teahouse', f3: 'hut' } };
  const WAY = { bridge: ['{橋|はし} へ の {道|みち}', 'the way to the bridge'], bank: ['{土手|どて} の {道|みち}', 'the path along the bank'], teahouse: ['{茶屋|ちゃや} へ の {道|みち}', 'the way to the teahouse'], woods: ['{林|はやし} を {抜|ぬ}ける {道|みち}', 'the way through the woods'], ferry: ['{渡|わた}し{場|ば} へ の {道|みち}', 'the way to the ferry landing'], hut: ['{川上|かわかみ} の {小屋|こや} へ の {道|みち}', 'the way to the hut upstream'] };
  const DIARY = {
    0: {
      F: ['はし を わたる つもり だった 。 でも 、 はし が ながされて いた 。 それで 、 どて を あるいた 。', 'ちゃや で やすもう と おもった 。 でも 、 しまって いた 。 それで 、 はやし を ぬけた 。', 'わたしば に いく つもり だった 。 そして 、 ほんとう に わたしば に ついた 。'],
      E: ['{橋|はし} を {渡|わた}る つもり だった が 、 {橋|はし} が {流|なが}されて いた 。 それで 、 {土手|どて} を {歩|ある}いた 。', '{茶屋|ちゃや} で {休|やす}もう と {思|おも}った が 、 {閉|し}まって いた 。 それで 、 {林|はやし} を {抜|ぬ}けた 。', '{渡|わた}し{場|ば} に {行|い}く つもり だった 。 そして 、 {本当|ほんとう} に {渡|わた}し{場|ば} に {着|つ}いた 。'],
      IA: ['{橋|はし} を {渡|わた}ろう と した ところ 、 {橋|はし} は もう {流|なが}されて いた 。 {仕方|しかた} なく 、 {土手|どて} を {歩|ある}く こと に した 。', '{茶屋|ちゃや} で {一休|ひとやす}み する つもり で いた が 、 {戸|と} が {閉|し}まって いた ので 、 その まま {林|はやし} を {抜|ぬ}けた 。', '{渡|わた}し{場|ば} へ {行|い}く つもり で 、 {迷|まよ}わず {渡|わた}し{場|ば} へ {着|つ}いた 。'],
      en: ['I meant to cross the bridge, but it had been washed away. So I walked along the bank.', 'I thought I\'d rest at the teahouse, but it was shut. So I went on through the woods.', 'I meant to go to the ferry landing, and I really did reach it.'] },
    1: {
      F: ['どて を あるく つもり だった 。 でも 、 みず が きて いた 。 それで 、 はし を わたった 。', 'はやし を ぬけよう と おもった 。 でも 、 くらくて こわかった 。 それで 、 ちゃや で よる を あかした 。', 'わたしば に いく つもり だった 。 でも 、 ふね が なかった 。 それで 、 かわかみ の こや へ いった 。'],
      E: ['{土手|どて} を {歩|ある}く つもり だった が 、 {水|みず} が {来|き}て いた 。 それで 、 {橋|はし} を {渡|わた}った 。', '{林|はやし} を {抜|ぬ}けよう と {思|おも}った が 、 {暗|くら}くて {怖|こわ}かった 。 それで 、 {茶屋|ちゃや} で {夜|よる} を {明|あ}かした 。', '{渡|わた}し{場|ば} に {行|い}く つもり だった が 、 {舟|ふね} が なかった 。 それで 、 {川上|かわかみ} の {小屋|こや} へ {行|い}った 。'],
      IA: ['{土手|どて} を {行|い}く つもり だった の に 、 {水|みず} が {上|あ}がって きた ので 、 {橋|はし} を {渡|わた}る しか なかった 。', '{林|はやし} を {抜|ぬ}けよう と した が 、 {暗|くら}くて {足|あし} が {止|と}まり 、 {茶屋|ちゃや} で {夜|よる} を {明|あ}かす こと に した 。', '{渡|わた}し{場|ば} を {目指|めざ}して いた が 、 {舟|ふね} が {出|で}て いない と {聞|き}いて 、 {川上|かわかみ} の {小屋|こや} へ {回|まわ}った 。'],
      en: ['I meant to walk along the bank, but the water had come up. So I crossed the bridge.', 'I thought I\'d go through the woods, but it was dark and frightening. So I spent the night at the teahouse.', 'I meant to go to the ferry landing, but there was no boat. So I went to the hut upstream.'] },
  };
  out += `
@scene hall.w4.t4_diary
narr: {雨|あめ} に {濡|ぬ}れない よう に {包|つつ}まれた 、 ゴサク の {古|ふる}い {日記|にっき} 。 {一年|いちねん} {前|まえ} の {頁|ページ} が {開|ひら}いて ある 。 || Gosaku's old diary, wrapped against the rain, open at a page from a year ago.
`;
  for (const p of [0, 1]) for (let k = 0; k < 3; k++) out += `?(${both(L.EF, 'hall.w4.pat=' + p)}) narr: 「 ${DIARY[p].F[k]} 」 || "${DIARY[p].en[k]}"
?(${both(L.E, 'hall.w4.pat=' + p)}) narr: 「 ${DIARY[p].E[k]} 」 || "${DIARY[p].en[k]}"
?(${both(L.IA, 'hall.w4.pat=' + p)}) narr: 「 ${DIARY[p].IA[k]} 」 || "${DIARY[p].en[k]}"
`;
  out += `?(comp&!hall.w4.t4&comp!=ren) comp: {行|い}く つもり だった {道|みち} じゃ なくて 、 {本当|ほんとう} に {行|い}った {道|みち} を {辿|たど}ろう 。 || Not the way he meant to go: the way he really went.\n?(comp=ren&!hall.w4.t4) comp: {行|い}く つもり だった {道|みち} で は なく 、 {本当|ほんとう} に {行|い}った {道|みち} を {辿|たど}りましょう 。 || Not the way he meant to go: the way he really went.\n`;
  const STEP = (k) => 'xp_hall_w4_f1_s' + k;
  const reset4 = '!unset ' + [1, 2, 3].map(STEP).join(' ');
  const FORK = { f1: ['bridge', 'bank'], f2: ['teahouse', 'woods'], f3: ['ferry', 'hut'] };
  Object.keys(FORK).forEach((f, idx) => {
    const k = idx + 1;
    for (const w of FORK[f]) {
      const right = [0, 1].filter((p) => RIGHT[p][f] === w);
      out += `
@scene hall.w4.${f}_${w}
!if hall.w4.t4 -> done
narr: {道|みち} が {分|わ}かれて いる 。 ${WAY[w][0]} 。 || The path forks: ${WAY[w][1]}.
${k > 1 ? '!if !' + STEP(k - 1) + ' -> early\n' : ''}${right.map((p) => '!if hall.w4.pat=' + p + ' -> right').join('\n')}
narr: ゴサク の {足跡|あしあと} は 、 この {道|みち} に は ない よう だ 。 {日記|にっき} を {初|はじ}め から もう {一度|いちど} {読|よ}もう 。 || Gosaku's footprints don't seem to go this way. Read the diary again from the start.
${reset4}
!refresh
!end
:right
narr: {泥|どろ} の {中|なか} に 、 {古|ふる}い {草鞋|わらじ} の {跡|あと} が {残|のこ}って いる 。 || In the mud, the marks of old straw sandals.
!set ${STEP(k)}
${k === 3 ? `narr: {道|みち} の {終|お}わり で 、 {泥|どろ} に {埋|う}もれた {笠|かさ} を {見|み}つけた 。 ゴサク が {一年|いちねん} {前|まえ} に {落|お}とした {物|もの} だ 。 || At the end of the way you find a hat half buried in the mud: the one Gosaku dropped a year ago.
?(comp&comp!=ren) comp: {行|い}く つもり の {道|みち} と 、 {本当|ほんとう} に {行|い}った {道|みち} 。 {一年|いちねん} {前|まえ} の ゴサク さん に 、 {追|お}い{付|つ}いた ね 。 || The way he meant and the way he went. We've caught up with Gosaku as he was a year ago.
?(comp=ren) comp: {行|い}く つもり の {道|みち} と 、 {本当|ほんとう} に {行|い}った {道|みち} 。 {一年|いちねん} {前|まえ} の ゴサク さん に 、 {追|お}い{付|つ}きました ね 。 || The way he meant and the way he went. We've caught up with Gosaku as he was a year ago.
${K.mark(W, 1, 't4')}` : '!refresh'}
!end
${k > 1 ? ':early\nnarr: {日記|にっき} の {頁|ページ} は 、 まだ ここ まで {来|き}て いない 。 {最初|さいしょ} の {分|わ}かれ{道|みち} から だ 。 || The diary hasn\'t got this far yet. Start from the first fork.\n!end\n' : ''}:done
narr: ${WAY[w][0]} 。 もう {辿|たど}り{終|お}えた 。 || ${cap(WAY[w][1])}. You have followed it already.
`;
    }
  });

  // ---- t5: the reeds -------------------------------------------------------------------------------------------------------
  out += `
@scene hall.w4.t5
narr: {葦|あし} が {大人|おとな}しく なって 、 {水|みず} の {中|なか} で {静|しず}か に {揺|ゆ}れて いる 。 || The reeds grow quiet and sway gently in the water.
${K.mark(W, 1, 't5')}
`;

  // ---- t6: the river notice and the crossing it allows (in your companion's hands; alone, Gosaku reads it) -------------
  const ALLOW = { 0: 'ford', 1: 'boat' };
  const NOTICE = {
    0: { F: 'きょう は 、 はし を わたって は いけない 。 ふね も だめ 。 あさせ は わたって も いい 。', E: '{今日|きょう} は 、 {橋|はし} を {渡|わた}って は いけない 。 {舟|ふね} も {出|で}ない 。 {浅瀬|あさせ} は {渡|わた}って も よい 。', I: '{本日|ほんじつ} 、 {橋|はし} は {通|とお}れない 。 {舟|ふね} も {出|だ}せない 。 {浅瀬|あさせ} なら 、 {渡|わた}って {構|かま}わない 。', A: '{本日|ほんじつ} 、 {橋|はし} の {通行|つうこう} を {禁|きん}ずる 。 {舟|ふね} の {渡|わた}し も {止|と}める 。 {浅瀬|あさせ} に {限|かぎ}り 、 {渡|わた}る こと を {許|ゆる}す 。', en: 'Today the bridge may not be crossed, and no boats go. The ford may be crossed.' },
    1: { F: 'きょう は 、 はし を わたって は いけない 。 あさせ も だめ 。 ふね なら わたって も いい 。', E: '{今日|きょう} は 、 {橋|はし} を {渡|わた}って は いけない 。 {浅瀬|あさせ} も {深|ふか}すぎる 。 {舟|ふね} なら {渡|わた}って も よい 。', I: '{本日|ほんじつ} 、 {橋|はし} は {通|とお}れない 。 {浅瀬|あさせ} も {危|あぶ}ない ので {渡|わた}って は ならない 。 {舟|ふね} なら {構|かま}わない 。', A: '{本日|ほんじつ} 、 {橋|はし} の {通行|つうこう} を {禁|きん}ずる 。 {浅瀬|あさせ} を {歩|ある}いて {渡|わた}る こと も {禁|きん}ずる 。 {舟|ふね} に {限|かぎ}り 、 {渡|わた}る こと を {許|ゆる}す 。', en: 'Today the bridge may not be crossed, and the ford is too deep. Crossing by boat is allowed.' },
  };
  out += `
@scene hall.w4.t6
!if hall.w4.t6 -> done
!if xp_hall_w4_f1_asked -> told
narr: {土手|どて} の {高札|こうさつ} 。 {雨|あめ} で {墨|すみ} が {滲|にじ}んで 、 {細|こま}かい {字|じ} が {読|よ}み にくい 。 || The notice board on the bank. The rain has blurred the ink, and the small writing is hard to read.
?(comp=nao) comp: {滲|にじ}んだ {字|じ} なら 、 {任|まか}せて くれ 。 {雨|あめ} の {日|ひ} の {宛名|あてな} で {慣|な}れてる 。 {何|なに} を {読|よ}む ？ || Leave blurred writing to me. Rainy-day addresses taught me. What am I reading for?
?(comp=mio) comp: {私|わたし} が {読|よ}む わ 。 {濡|ぬ}れた {薬|くすり} の {袋|ふくろ} より は 、 ましよ 。 {何|なに} が {知|し}りたい の ？ || I'll read it. Better than a wet medicine packet. What do you want to know?
?(comp=ren) comp: {高札|こうさつ} は 、 {灯守|ひもり} も よく {読|よ}みます 。 {私|わたし} が {読|よ}みましょう 。 {何|なに} を ？ || Lamp-keepers read notice boards often. I'll read it. What for?
?(comp=suzu) comp: {張|は}り{紙|がみ} を {読|よ}む の は 、 {旅回|たびまわ}り の {基本|きほん} よ 。 {任|まか}せて 。 {何|なに} を {見|み}る ？ || Reading posted notices is basic touring. Leave it to me. What am I looking for?
?(!comp) hall_gosaku: {高札|こうさつ} なら 、 {私|わたし} が {読|よ}みましょう 。 {一年|いちねん} {前|まえ} に も 、 {読|よ}みました から 。 {何|なに} を {知|し}りたい ん です か 。 || I'll read the notice. I read one here a year ago too. What do you want to know?
!hook hall_challenge hall.w4.ask
!if var._res=0 -> later
!set xp_hall_w4_f1_asked
:told
`;
  out += LV((p, t) => `?(${both(L[t], 'hall.w4.pat=' + p)}) narr: 「 ${NOTICE[p][t]} 」 || "${NOTICE[p].en}"\n`);
  out += `!end
:later
narr: {高札|こうさつ} は 、 {雨|あめ} の {中|なか} に {立|た}った まま だ 。 || The notice stands in the rain.
!end
:done
narr: {高札|こうさつ} の {言|い}う 通り 、 {渡|わた}る {道|みち} は {決|き}まった 。 || The way across is settled, as the notice says.
`.replace('{言|い}う 通り', '{言|い}う {通|とお}り');
  const CROSSING = { bridge: ['{橋|はし}', 'the bridge'], ford: ['{浅瀬|あさせ}', 'the ford'], boat: ['{渡|わた}し{舟|ぶね}', 'the ferry boat'] };
  for (const c of Object.keys(CROSSING)) {
    const right = [0, 1].filter((p) => ALLOW[p] === c);
    out += `
@scene hall.w4.x_${c}
!if hall.w4.t6 -> done
narr: ${CROSSING[c][0]} 。 {向|む}こう {岸|ぎし} に 、 {山寺|やまでら} の {道|みち} が {見|み}える 。 || ${cap(CROSSING[c][1])}. On the far bank, the path to the mountain temple.
!if !xp_hall_w4_f1_asked -> unknown
${right.map((p) => '!if hall.w4.pat=' + p + ' -> right').join('\n')}
narr: {高札|こうさつ} に よる と 、 {今日|きょう} は ここ を {渡|わた}って は いけない 。 || By the notice, this may not be crossed today.
?(comp&comp!=ren) comp: {高札|こうさつ} の {言葉|ことば} 、 もう {一度|いちど} {言|い}おう か ？ || Shall I say the notice's words again?
?(comp=ren) comp: {高札|こうさつ} を 、 もう {一度|いちど} {読|よ}みましょう か 。 || Shall I read the notice again?
!end
:right
narr: {高札|こうさつ} の {許|ゆる}す ${CROSSING[c][0]} に 、 ゴサク の {杖|つえ} を {目印|めじるし} に {立|た}てた 。 ゴサク が {後|あと} から {来|き}て も 、 {迷|まよ}わない 。 || You plant Gosaku's staff as a marker by ${CROSSING[c][1]}, the crossing the notice allows. Gosaku, coming behind, won't lose the way.
?(comp&comp!=ren) comp: {渡|わた}って も いい {所|ところ} から 、 {渡|わた}る 。 {一年|いちねん} {前|まえ} の ゴサク さん も 、 そう したかった だろう ね 。 || We cross where crossing is allowed. Gosaku would have wanted to, a year ago.
?(comp=ren) comp: {渡|わた}って も いい {所|ところ} から 、 {渡|わた}る 。 {一年|いちねん} {前|まえ} の ゴサク さん も 、 そう したかった でしょう ね 。 || We cross where crossing is allowed. Gosaku would have wanted to, a year ago.
${K.mark(W, 1, 't6')}
!end
:unknown
narr: ここ を {渡|わた}って も いい の か 、 まだ {分|わ}からない 。 {高札|こうさつ} を {読|よ}んで もらおう 。 || You don't know yet whether you may cross here. Have the notice read first.
!end
:done
narr: ${CROSSING[c][0]} 。 || ${cap(CROSSING[c][1])}.
`;
  }

  // ---- t7: the riddle stone ----------------------------------------------------------------------------------------------------
  out += '\n@scene hall.w4.t7' + K.taskTrial({ w: W, k: 1, t: 't7',
    intro: ['narr: {苔|こけ} むした {石|いし} に 、 {字|じ} が {彫|ほ}って ある 。 「 {解|と}けた {者|もの} は 、 {一度|いちど} だけ 、 {帰|かえ}って また {来|く}る こと が できる 。 」 || Words cut into a mossy stone: "Whoever solves this may once go home and come back."'],
    task: 'hall.w4.riddle',
    after: ['narr: {石|いし} の {字|じ} が 、 {雨|あめ} に {洗|あら}われて {光|ひか}った 。 || The carving shines, washed by the rain.'],
    later: 'narr: {答|こた}え は 、 {急|いそ}がなくて いい 。 || There\'s no hurry for the answer.',
    done: 'narr: {石|いし} は 、 {答|こた}え を {覚|おぼ}えて いる 。 || The stone remembers the answer.' });

  // ---- t8: the temple's rules (what you must, may and must not do) -------------------------------------------------------------
  const RULES = {
    0: { F: 'て を あらって から 、 ほんどう に はいって ください 。 かね を ならさないで ください 。 はきもの は ぬがなくて も いい です 。',
      E: '{手|て} を {洗|あら}って から 、 {本堂|ほんどう} に {入|はい}らなければ ならない 。 {鐘|かね} を {鳴|な}らして は いけない 。 {履物|はきもの} は {脱|ぬ}がなくて も いい 。',
      I: '{本堂|ほんどう} に は 、 {手|て} を {清|きよ}めて から で ない と {入|はい}れない 。 {鐘|かね} に は {触|さわ}らない よう に 。 {履物|はきもの} は 、 その まま で {構|かま}わない 。',
      A: '{本堂|ほんどう} へ は 、 {手水|ちょうず} を {済|す}ませて から {参|まい}る こと 。 {鐘|かね} を {撞|つ}く べからず 。 {履物|はきもの} は {脱|ぬ}ぐ に {及|およ}ばず 。',
      en: 'Wash your hands before entering the main hall. Do not ring the bell. You need not take off your sandals.' },
    1: { F: 'かね は 、 いちど だけ ならして も いい です 。 はきもの を ぬいで から 、 ほんどう に はいって ください 。 て は あらわなくて も いい です 。',
      E: '{鐘|かね} は 、 {一度|いちど} だけ {鳴|な}らして も いい 。 {履物|はきもの} を {脱|ぬ}いで から 、 {本堂|ほんどう} に {入|はい}らなければ ならない 。 {手水|ちょうず} は {使|つか}わなくて も いい 。',
      I: '{鐘|かね} は 、 {一度|いちど} なら {鳴|な}らして {構|かま}わない 。 {履物|はきもの} を {脱|ぬ}がず に {本堂|ほんどう} へ {上|あ}がって は いけない 。 {手水|ちょうず} は 、 {水|みず} が {濁|にご}って いる ので {使|つか}わなくて よい 。',
      A: '{鐘|かね} は {一度|いちど} に {限|かぎ}り {許|ゆる}す 。 {本堂|ほんどう} へ は {履物|はきもの} を {脱|ぬ}いで {上|あ}がる べし 。 {手水|ちょうず} は {用|もち}いず とも よし 。',
      en: 'You may ring the bell, once only. Take off your sandals before entering the main hall. You need not use the water basin.' },
  };
  const WASHED = 'xp_hall_w4_f2_washed', RANG = 'xp_hall_w4_f2_rang', SHOES = 'xp_hall_w4_f2_shoes';
  out += `
@scene hall.w4.t8_rules
narr: {山門|さんもん} の {内側|うちがわ} に 、 {寺|てら} の {決|き}まり が {書|か}いて ある 。 || Inside the gate, the temple's rules for visitors.
`;
  out += LV((p, t) => `?(${both(L[t], 'hall.w4.pat=' + p)}) narr: 「 ${RULES[p][t]} 」 || "${RULES[p].en}"\n`);
  out += `?(comp&!hall.w4.t8&comp!=ren) comp: どれ が {決|き}まり で 、 どれ が しなくて いい こと か 、 よく {見|み}て から {上|あ}がろう 。 || Let's look properly at what's a rule and what we needn't do before we go up.
?(comp=ren&!hall.w4.t8) comp: どれ が {決|き}まり で 、 どれ が しなくて いい こと か 、 よく {見|み}て から {上|あ}がりましょう 。 || Let's look properly at what's a rule and what we needn't do before we go up.
!if hall.w4.t8 -> kept
!end
:kept
narr: {決|き}まり を {守|まも}って 、 {本堂|ほんどう} に {上|あ}がった 。 || You kept the rules and went up into the hall.

@scene hall.w4.r_basin
!if hall.w4.t8 -> done
narr: {石|いし} の {手水鉢|ちょうずばち} 。 || The stone water basin.
!if hall.w4.pat=1 -> p1
narr: {手|て} を {洗|あら}い 、 {口|くち} を {漱|すす}いだ 。 {決|き}まり の {通|とお}り だ 。 || You rinse your hands and mouth, as the rules ask.
!set ${WASHED}
!end
:p1
narr: {決|き}まり に よる と 、 {使|つか}わなくて も いい 。 {水|みず} は {洪水|こうずい} で {濁|にご}って いる 。 || By the rules, there's no need: the flood has muddied the water.
!end
:done
narr: {手水鉢|ちょうずばち} に 、 {雨|あめ} が {落|お}ちて いる 。 || Rain falls into the basin.

@scene hall.w4.r_bell
!if hall.w4.t8 -> done
narr: {境内|けいだい} の {鐘|かね} 。 || The temple bell.
!if hall.w4.pat=1 -> p1
narr: {決|き}まり に よる と 、 {鳴|な}らして は いけない 。 {綱|つな} に は {触|さわ}らず に おいた 。 || The rules say not to ring it. You leave the rope alone.
!end
:p1
!if ${RANG} -> once
narr: {鐘|かね} を {一度|いちど} だけ {鳴|な}らした 。 {音|おと} が 、 {雨|あめ} の {谷|たに} に {広|ひろ}がって いく 。 || You ring the bell once. Its voice spreads out over the rainy valley.
!set ${RANG}
!end
:once
narr: {一度|いちど} だけ 、 と {決|き}まり に ある 。 もう {鳴|な}らさない で おこう 。 || Once only, the rules say. Better not ring it again.
!end
:done
narr: {鐘|かね} は 、 {静|しず}か に {下|さ}がって いる 。 || The bell hangs quiet.

@scene hall.w4.r_stone
!if hall.w4.t8 -> done
narr: {縁側|えんがわ} の {前|まえ} の {沓脱石|くつぬぎいし} 。 || The stone before the veranda where sandals are left.
!if hall.w4.pat=1 -> p1
narr: {決|き}まり に よる と 、 {履物|はきもの} は {脱|ぬ}がなくて も いい 。 その まま に した 。 || By the rules, you need not take off your sandals. You leave them on.
!end
:p1
narr: {草鞋|わらじ} を {脱|ぬ}いで 、 {石|いし} の {上|うえ} に {揃|そろ}えた 。 || You step out of your sandals and set them side by side on the stone.
!set ${SHOES}
!end
:done
narr: {草鞋|わらじ} が 、 {石|いし} の {上|うえ} に {揃|そろ}えて ある 。 || Sandals sit side by side on the stone.

@scene hall.w4.r_door
!if hall.w4.t8 -> done
narr: {本堂|ほんどう} の {戸|と} 。 || The door of the main hall.
!if hall.w4.pat=1 -> p1
!if !${WASHED} -> need0
!goto enter
:p1
!if !${SHOES} -> need1
:enter
narr: {決|き}まり を {守|まも}って 、 {本堂|ほんどう} に {上|あ}がった 。 {中|なか} は 、 {線香|せんこう} と {古|ふる}い {雨|あめ} の {匂|にお}い が した 。 || Keeping the rules, you step up into the main hall. Inside it smells of incense and old rain.
?(comp&comp!=ren) comp: {全部|ぜんぶ} 、 {決|き}まり の {通|とお}り 。 これ なら 、 {誰|だれ} に も {叱|しか}られない ね 。 || All by the rules. Nobody can scold us now.
?(comp=ren) comp: {全部|ぜんぶ} 、 {決|き}まり の {通|とお}り 。 これ なら 、 {誰|だれ} に も {叱|しか}られません ね 。 || All by the rules. Nobody can scold us now.
${K.mark(W, 2, 't8')}
!end
:need0
narr: {決|き}まり に よる と 、 {手|て} を {洗|あら}って から で なければ {入|はい}れない 。 || By the rules, you can't go in before washing your hands.
!end
:need1
narr: {決|き}まり に よる と 、 {履物|はきもの} を {脱|ぬ}いで から で なければ {上|あ}がれない 。 || By the rules, you can't go up before taking off your sandals.
!end
:done
narr: {本堂|ほんどう} の {戸|と} は 、 {開|あ}いて いる 。 || The door of the hall stands open.
`;

  // ---- t9: the umbrella at the gate ---------------------------------------------------------------------------------------------
  out += `
@scene hall.w4.t9
!faceplayer hall_karakasa
hall_karakasa: …… {放|ほう}って おいて 。 {僕|ぼく} は 、 もう {誰|だれ} の {傘|かさ} で も ない 。 || …Leave me alone. I'm nobody's umbrella any more.
!encounter hall.w4.kasa
!if var._enc=understood -> understood
narr: …… ぽつ 、 ぽつ 。 {雨|あめ} の {音|おと} だけ が 、 {返事|へんじ} の よう に {続|つづ}いて いる 。 || …Drip, drip. Only the rain answers, on and on.
!end
:understood
hall_karakasa: {返|かえ}す つもり 、 だった ん だ 。 …… {縁側|えんがわ} で 、 {待|ま}ってる 。 || He meant to bring me back. …I'll wait on the veranda.
${K.mark(W, 2, 't9')}

@scene hall.w4.kasa_after
!faceplayer hall_karakasa_after
!if hall.w4.t10 -> done
hall_karakasa: ゴサク が {来|く}る まで 、 ここ で {待|ま}つ 。 {今度|こんど} は 、 {一年|いちねん} も {待|ま}たない よ 。 || I'll wait here till Gosaku comes. Not a whole year this time.
!end
:done
hall_karakasa: {来年|らいねん} の {梅雨|つゆ} に 、 また {会|あ}おう 。 || See you next rainy season.
`;

  // ---- t10: the umbrella returned --------------------------------------------------------------------------------------------
  out += `
@scene hall.w4.t10
!faceplayer hall_myoshin
!if hall.w4.t10 -> after
!if !hall.w4.t8 -> wait
!if !hall.w4.t9 -> wait
narr: ゴサク が {縁側|えんがわ} の {前|まえ} に {立|た}った 。 {傘|かさ} が 、 その {隣|となり} で {一本足|いっぽんあし} を {揃|そろ}えて いる 。 || Gosaku stands before the veranda. The umbrella stands beside him on its one leg, very straight.
!encounter hall.w4.return
!if var._res=0 -> later
!set xp_hall_w4_f2_t10
!hook hall_trial w4 t10
!if var._res=1 -> finale
!refresh
!end
:finale
!call hall.w4.end
!end
:wait
hall_myoshin: {雨|あめ} の {中|なか} を 、 よく {来|き}ました ね 。 || You've come a long way in the rain.
?(!hall.w4.t8) narr: ミョウシン は 、 {山門|さんもん} の {決|き}まり の {札|ふだ} を 、 {目|め} で {示|しめ}した 。 || Myōshin glances toward the rules board by the gate.
?(!hall.w4.t9) narr: ミョウシン は 、 {門|もん} の {方|ほう} を {見|み}て いる 。 {赤|あか}い {傘|かさ} が 、 まだ {雨|あめ} の {中|なか} に {立|た}って いる 。 || Myōshin is looking toward the gate, where a red umbrella still stands in the rain.
!end
:later
narr: ゴサク は 、 {傘|かさ} を {持|も}った まま 、 {言葉|ことば} を {探|さが}して いる 。 || Gosaku stands holding the umbrella, searching for words.
!end
:after
hall_myoshin: {来年|らいねん} も 、 {返|かえ}しに {来|き}て ください ね 。 {傘|かさ} が {楽|たの}しみ に して います から 。 || Come and return it next year too. The umbrella will be looking forward to it.

# ---- the tale's end ----------------------------------------------------------------------------------------------------
@scene hall.w4.end
!fade out
!sequence hall.w4 begin
!shot tale
narr: {雨|あめ} の {中|なか} を 、 ゴサク が {帰|かえ}って いく 。 {頭|あたま} の {上|うえ} で 、 {赤|あか}い {傘|かさ} が {誇|ほこ}らしげ に {開|ひら}いて いる 。 || Gosaku goes home through the rain, the red umbrella open proudly over his head.
hall_myoshin: {貸|か}した {物|もの} は 、 {返|かえ}って くる と {嬉|うれ}しい 。 {返|かえ}って こなくて も 、 {待|ま}つ の は {悪|わる}く ない 。 || It's good when something lent comes back. Even when it doesn't, waiting isn't so bad.
?(comp=nao) comp: {一年|いちねん} {遅|おく}れ の {配達|はいたつ} か 。 …… {届|とど}いた なら 、 それ で いい 。 || A delivery a year late. …If it arrived, that's enough.
?(comp=mio) comp[happy]: {貸|か}した {人|ひと} も 、 {借|か}りた {人|ひと} も 、 {相手|あいて} の こと を {思|おも}って いた のね 。 || The one who lent and the one who borrowed were both thinking of each other.
?(comp=ren) comp: {灯|ひ} が {四|よっ}つ 、 {戻|もど}りました 。 {借|か}りた {物|もの} も 、 {返|かえ}す つもり の {心|こころ} も 、 {灯|ひ} の よう な もの です ね 。 || Four lights back. A borrowed thing and the will to return it are something like a light too.
?(comp=suzu) comp: {第|だい}{四幕|よんまく} 、 {幕|まく} ！ {主役|しゅやく} の {傘|かさ} に 、 {大|おお}きな {拍手|はくしゅ} を ！ || End of act four! A big hand for our lead, the umbrella!
!sequence hall.w4 end
narr: {雨|あめ} の {音|おと} が {畳|たた}まれる よう に {遠|とお}く なって 、 {気|き}が {付|つ}く と 、 {館|やかた} の {囲炉裏|いろり} の {前|まえ} に いた 。 || The sound of the rain folds away into the distance, and when you look up you are by the hall's hearth.
!set hall_w4_done
!hook hall_finish
!fade in
`;
  RB.script.add(out);
})(RB.content);
