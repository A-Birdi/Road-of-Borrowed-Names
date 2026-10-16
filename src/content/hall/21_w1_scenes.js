/* The Hall of a Hundred Tales, wing 1, The Lamp at the Crossroads: the scenes (expansion P15; plan 04_DUNGEONS.md D9;
 * maps in 10_maps.js, tasks and encounters in 15_w1_learning.js). Each trial sets its floor's own flag
 * (xp_hall_w1_f<k>_t<n>, cleared if the floor starts again) and tells the Hall (hall_trial), which counts the floor
 * once every trial on it is done. What a trial shows follows the level its task is set at: the journey's profile, or
 * one up on the Grow route (`EFF` below). The pattern fixed when the wing was first entered (hall.w1.pat) chooses the
 * versions. Otami (she/her) is the tale's lamp-keeper; Genza (he/him) the pilgrim; the traveller and the lost child
 * they/them. Suzu's lines have Kansai versions (src/content/dialect/kansai_99_hall.js). */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  // the level a task in this wing is set at: the profile, or one up on the Grow route (Advanced stays Advanced)
  const G = 'hall.w1.route=grow';
  const EFF = { F: 'prof=F&!' + G, E: 'prof=E&!' + G + '|prof=F&' + G, I: 'prof=I&!' + G + '|prof=E&' + G, A: 'prof=A|prof=I&' + G };
  const EF = EFF.F, NOTF = 'prof>=E|' + G;
  // a condition joined to every alternative of another (conditions have no grouping: & binds tighter than |)
  const both = (a, b) => a.split('|').map((x) => x + '&' + b).join('|');
  // the plaques in English (as written: the odd one is translated as it stands, so the English never gives it away)
  const FE0 = ['Turn right at the corner, please.', 'Please cross the bridge.', 'Please turn the left.', 'Please go straight along this road.'];
  const FE1 = ['Turn left at the second corner, please.', 'Please cross to the river.', 'Please turn right.', 'Please climb the slope.'];
  const PLAQUE_EN = {
    0: { F: FE0, E: FE0, I: ['Turn the corner and you see the temple.', 'Cross the bridge and you reach the village.', 'Turn right and please stop.', 'Go straight and there is a river.'],
      A: ['Climb the slope and the teahouse at the pass comes into view.', 'Past the lantern, the road splits in two.', 'Reach the fork and please choose the left.', 'Come out at the river and the ferry landing is right there.'] },
    1: { F: FE1, E: FE1, I: ['Go along this road and you come out at the bridge.', 'Turn left and there is a lantern.', 'Reach the temple and please ring the bell.', 'Go down the slope and you see the village.'],
      A: ['Go north through the crossroads and you come out at the pass.', 'Past the first lantern, the sky opens out.', 'Reach the village entrance and please call out.', 'Cross the river and the wind turns cold.'] },
  };

  let out = `
@scene hall.w1.f1_first
!set hall_w1_f1_seen
narr: {紙|かみ} の {戸|と} を {抜|ぬ}ける と 、 {夕暮|ゆうぐ}れ の {山道|やまみち} だった 。 {風|かぜ} に {草|くさ} が {鳴|な}って いる 。 {館|やかた} の {中|なか} に いた はず なのに 。 || Through the paper screen: a hill road at dusk. Grass rustling in the wind. You were inside the hall a moment ago.
narr: {道|みち} の {先|さき} に 、 {四|よ}つ{辻|つじ} 。 {灯|ひ} の {届|とど}く {所|ところ} の {外|そと} は 、 {何|なに} も {見|み}えない 。 || Ahead, a crossroads. Beyond the reach of the light, nothing can be seen.
?(comp=nao) comp: {話|はなし} の {中|なか} に {入|はい}った の か 。 …… {道|みち} は {四|よっ}つ 。 {迷|まよ}い{甲斐|がい} が ある な 。 || We've walked into the tale. …Four roads. Plenty of room to get lost.
?(comp=mio) comp[worry]: {外|そと} が {真|ま}っ{暗|くら} …… 。 {灯|ひ} から {離|はな}れない で いましょう ね 。 || It's pitch dark out there… Let's stay close to the light.
?(comp=ren) comp[think]: {灯籠|とうろう} の {灯|ひ} の {中|なか} に 、 {一|ひと}つ の {話|はなし} 。 {灯守|ひもり} の {習|なら}い {通|どお}り です 。 || One tale inside one lantern's light. Just as the keepers taught.
?(comp=suzu) comp: {幕|まく} が {上|あ}がった ね 。 {第|だい}{一幕|いちまく} 、 {夕暮|ゆうぐ}れ の {辻|つじ} 。 || The curtain's up. Act one: the crossroads at dusk.

@scene hall.w1.f2_first
!set hall_w1_f2_seen
narr: {石段|いしだん} の {上|うえ} は 、 {灯籠|とうろう} の {並|なら}ぶ {道|みち} だった 。 {道|みち} は {何度|なんど} も {分|わ}かれて 、 {霧|きり} の {中|なか} へ {消|き}えて いく 。 || Up the steps, a road lined with stone lanterns. It forks again and again and vanishes into the mist.
?(comp&comp!=ren) comp: {札|ふだ} が ある 。 {先|さき} に {読|よ}んで から 、 {歩|ある}こう 。 || There's a card. Let's read it before we walk.
?(comp=ren) comp: {札|ふだ} が あります 。 {先|さき} に {読|よ}んで から 、 {歩|ある}きましょう 。 || There's a card. Let's read it before we walk.

@scene hall.w1.f3_first
!set hall_w1_f3_seen
narr: {夜|よる} に なって いた 。 {辻|つじ} の {真|ま}ん{中|なか} に 、 {大|おお}きな {灯籠|とうろう} が {立|た}って いる 。 {火|ひ} は {消|き}えて いる 。 || Night has fallen. A great lamp stands in the middle of the crossroads. Its fire is out.
narr: {周|まわ}り に 、 {小|ちい}さな {灯籠|とうろう} が {四|よっ}つ 。 {入|い}り{口|ぐち} の {近|ちか}く に 、 {古|ふる}い {札|ふだ} 。 || Round it, four small lamps. Near the way in, an old note on a post.
?(comp=nao) comp: {話|はなし} の {灯籠|とうろう} だ 。 {番|ばん} を して いた {人|ひと} は 、 もう いない らしい 。 || The lamp from the tale. Whoever kept it seems to be gone.
?(comp=mio) comp: {消|き}えて いる …… 。 でも 、 {油|あぶら} の {匂|にお}い は {新|あたら}しい 。 {誰|だれ} か が 、 {用意|ようい} して いった のね 。 || Dark… But the oil smells fresh. Someone left it ready.
?(comp=ren) comp: {灯|ひ} を {戻|もど}す {場所|ばしょ} です 。 {札|ふだ} を {読|よ}んで 、 {順番|じゅんばん} {通|どお}り に 。 || This is where the light goes back. We read the note, and do it in order.
?(comp=suzu) comp: {最後|さいご} の {幕|まく} ね 。 {主役|しゅやく} の {灯籠|とうろう} が 、 {出番|でばん} を {待|ま}って いる 。 || The last act. The star lamp is waiting for its cue.

@scene hall.w1.bench1
!hook hall_station w1_b1
@scene hall.w1.bench2
!hook hall_station w1_b2
@scene hall.w1.bench3
!hook hall_station w1_b3
@scene hall.w1.spring
narr: {古|ふる}い {井戸|いど} 。 {冷|つめ}たい {水|みず} が {汲|く}める 。 || An old well. You can draw cold water.
!hook hall_station w1_sp

@scene hall.w1.great_after
narr: {辻|つじ} の {灯籠|とうろう} が 、 {四|よっ}つ の {道|みち} を {照|て}らして いる 。 || The crossroads lamp lights all four roads.

# ---- t1: the story room ------------------------------------------------------------------------------------------
@scene hall.w1.t1
!if hall.w1.t1 -> done
narr: {小屋|こや} の {奥|おく} に 、 {絵巻|えまき} が {掛|か}けて ある 。 {四|よっ}つ の {絵|え} に 、 {一|ひと}つ の {話|はなし} 。 || At the back of the shelter hangs a picture scroll: one tale in four pictures.
?(${EF}) narr: 「 むかし 、 やま の つじ に 、 とうろう が ひとつ たって いた 。 」 || "Long ago, a single lamp stood at a crossroads in the hills."
?(${NOTF}) narr: 「 {昔|むかし} 、 {山|やま} の {辻|つじ} に 、 {灯籠|とうろう} が {一|ひと}つ {立|た}って いた 。 」 || "Long ago, a single lamp stood at a crossroads in the hills."
?(${EF}) narr: 「 とうろう の ばん を して いた の は 、 みみ の とおい おばあさん だった 。 」 || "The one who kept the lamp was an old woman who was hard of hearing."
?(${NOTF}) narr: 「 {灯籠|とうろう} の {番|ばん} を して いた の は 、 {耳|みみ} の {遠|とお}い おばあさん だった 。 」 || "The one who kept the lamp was an old woman who was hard of hearing."
?(${EF}) narr: 「 たびびと が みち を きく と 、 おばあさん は いつも 『 もう いちど 、 いって ください 』 と いった 。 」 || "When travellers asked the way, she always said, 'Please say it again.'"
?(${NOTF}) narr: 「 {旅人|たびびと} が {道|みち} を {聞|き}く と 、 おばあさん は いつも 『 もう {一度|いちど} 、 {言|い}って ください 』 と {言|い}った 。 」 || "When travellers asked the way, she always said, 'Please say it again.'"
?(${EF}) narr: 「 にど きいた たびびと は 、 ひとり も みち に まよわなかった 。 」 || "Not one traveller who asked twice ever lost the way."
?(${NOTF}) narr: 「 {二度|にど} {聞|き}いた {旅人|たびびと} は 、 {一人|ひとり} も {道|みち} に {迷|まよ}わなかった 。 」 || "Not one traveller who asked twice ever lost the way."
narr: {風|かぜ} が {吹|ふ}いて 、 {絵|え} の {順番|じゅんばん} が {乱|みだ}れた 。 || A gust of wind, and the pictures fall out of order.
!hook hall_challenge hall.w1.story
!if var._res=0 -> later
narr: {絵巻|えまき} が 、 {元|もと} の {順番|じゅんばん} に {戻|もど}った 。 || The scroll is back in its order.
!challenge hall.w1.story_q
?(comp=nao) comp: {二度|にど} {聞|き}け 、 か 。 {届|とど}け{先|さき} を {確|たし}かめる の と {同|おな}じ だ 。 || Ask twice. Same as checking an address before you deliver.
?(comp=mio) comp: {聞|き}き{返|かえ}す の って 、 {恥|は}ずかしい と {思|おも}って た 。 …… {違|ちが}う のね 。 || I used to think asking again was embarrassing. …It isn't, is it.
?(comp=ren) comp: {師匠|ししょう} も 、 {同|おな}じ こと を {言|い}って いました 。 「 {聞|き}こえない 、 と {言|い}える {人|ひと} は 、 {迷|まよ}わない 」 。 || My teacher said the same: "Someone who can say 'I didn't hear' never gets lost."
?(comp=suzu) comp: {台詞|せりふ} も {同|おな}じ よ 。 {聞|き}こえなかったら 、 {聞|き}き{返|かえ}す 。 {黙|だま}って {演|や}る の が 、 {一番|いちばん} {危|あぶ}ない 。 || Same with lines. If you didn't catch it, ask. Carrying on in silence is the riskiest thing.
!set xp_hall_w1_f0_t1
!hook hall_trial w1 t1
!refresh
!end
:later
narr: {絵|え} は 、 {後|あと} で {並|なら}べ{直|なお}せる 。 || You can put the pictures in order later.
!end
:done
narr: {絵巻|えまき} は 、 {元|もと} の {順番|じゅんばん} で {掛|か}かって いる 。 || The scroll hangs in its proper order.

# ---- t2: the signpost and the traveller --------------------------------------------------------------------------
@scene hall.w1.t2_sign
narr: {道|みち}しるべ 。 {四|よっ}つ の {腕|うで} に 、 {字|じ} が {書|か}いて ある 。 || The signpost. Each of its four arms has words on it.
?(${EF}) narr: きた ： やま 。 ひがし ： てら 。 みなみ ： かわ 。 にし ： むら 。 || North: the mountain. East: the temple. South: the river. West: the village.
?(${NOTF}) narr: {北|きた} ： {山|やま} 。 {東|ひがし} ： {寺|てら} 。 {南|みなみ} ： {川|かわ} 。 {西|にし} ： {村|むら} 。 || North: the mountain. East: the temple. South: the river. West: the village.

@scene hall.w1.t2
!faceplayer hall_traveller
?(hall.w1.pat=0) hall_traveller: すみません 。 お{寺|てら} は 、 どちら です か 。 || Excuse me. Which way is the temple?
?(hall.w1.pat=1) hall_traveller: すみません 。 {村|むら} は 、 どちら です か 。 || Excuse me. Which way is the village?
?(comp&!seen.hall.w1.t2_sign&comp!=ren) comp: {道|みち}しるべ が すぐ そこ に ある 。 {見|み}て から {答|こた}えて も いい ね 。 || The signpost is right there. We could look before we answer.
?(comp=ren&!seen.hall.w1.t2_sign) comp: {道|みち}しるべ が すぐ そこ に あります 。 {見|み}て から {答|こた}えて も いい です ね 。 || The signpost is right there. We could look before we answer.
!if hall.w1.pat=1 -> p1
!hook hall_challenge hall.w1.sign0
!goto after
:p1
!hook hall_challenge hall.w1.sign1
:after
!if var._res=0 -> later
hall_traveller: ありがとう ございます 。 {助|たす}かりました 。 || Thank you. That's a great help.
?(hall.w1.pat=0) narr: {旅|たび}の{人|ひと} は {頭|あたま} を {下|さ}げて 、 {東|ひがし} の {道|みち} を {歩|ある}いて {行|い}った 。 || The traveller bows and walks off down the east road.
?(hall.w1.pat=1) narr: {旅|たび}の{人|ひと} は {頭|あたま} を {下|さ}げて 、 {西|にし} の {道|みち} を {歩|ある}いて {行|い}った 。 || The traveller bows and walks off down the west road.
!set xp_hall_w1_f0_t2
!hook hall_trial w1 t2
!refresh
!end
:later
hall_traveller: {分|わ}かったら 、 {教|おし}えて ください 。 ここ で {待|ま}って います 。 || If you work it out, let me know. I'll wait here.

# ---- t3: the plaques and the judge's stone -------------------------------------------------------------------------
@scene hall.w1.t3
!if hall.w1.t3 -> done
narr: {石|いし} に {刻|きざ}んで ある 。 「 {四|よっ}つ の {札|ふだ} の うち 、 {一|ひと}つ だけ 、 {決|き}まり を {破|やぶ}って いる 。 」 || Carved in the stone: "Of the four plaques, one alone breaks the rule."
!if hall.w1.pat=1 -> p1
!hook hall_challenge hall.w1.counter0
!goto after
:p1
!hook hall_challenge hall.w1.counter1
:after
!if var._res=0 -> later
narr: {決|き}まり を {破|やぶ}った {札|ふだ} の {字|じ} が 、 {薄|うす}く {消|き}えて いった 。 || The words on the plaque that broke the rule fade away.
?(comp&comp!=ren) comp: {正|ただ}しい {三|みっ}つ が ある から 、 {違|ちが}う {一|ひと}つ が {分|わ}かる ん だ ね 。 || It's because three are right that the odd one shows.
?(comp=ren) comp: {正|ただ}しい {三|みっ}つ が ある から 、 {違|ちが}う {一|ひと}つ が {分|わ}かる ん です ね 。 || It's because three are right that the odd one shows.
!set xp_hall_w1_f0_t3
!hook hall_trial w1 t3
!refresh
!end
:later
narr: {札|ふだ} を {一|ひと}つ ずつ {読|よ}んで から 、 また {来|こ}よう 。 || Read the plaques one by one, then come back.
!end
:done
narr: {石|いし} の {字|じ} は 、 もう {何|なに} も {問|と}わない 。 || The carving asks nothing more.

`;
  // the four plaques, each at the level the task is set and in the wing's pattern (the sentences are the task's own)
  for (let i = 0; i < 4; i++) {
    out += `
@scene hall.w1.plaque${i + 1}
narr: {石|いし} の {札|ふだ} 。 || A stone plaque.
`;
    for (const pat of [0, 1]) for (const tier of ['F', 'E', 'I', 'A']) {
      const row = C.hallW1Plaques[pat][tier][i];
      out += `?(${both(EFF[tier], 'hall.w1.pat=' + pat)}) narr: 「 ${row[0]} 」 || "${PLAQUE_EN[pat][tier][i]}"\n`;
    }
  }
  out += `
# ---- t4: the route card and the lanterns at the roads' ends --------------------------------------------------------
@scene hall.w1.t4_card
narr: {札|ふだ} に {道順|みちじゅん} が {書|か}いて ある 。 || The card gives directions.
?(${both(EF, 'hall.w1.pat=0')}) narr: 「 まっすぐ いって 、 ふたつめ の かど を ひだり に まがって ください 。 つきあたり の とうろう に 、 ひ を つけて ください 。 」 || "Go straight, and turn left at the second corner. Light the lantern at the end of that road."
?(${both(NOTF, 'hall.w1.pat=0')}) narr: 「 まっすぐ {行|い}って 、 {二|ふた}つ{目|め} の {角|かど} を {左|ひだり} に {曲|ま}がって ください 。 {突|つ}き{当|あ}たり の {灯籠|とうろう} に 、 {火|ひ} を {点|つ}けて ください 。 」 || "Go straight, and turn left at the second corner. Light the lantern at the end of that road."
?(${both(EF, 'hall.w1.pat=1')}) narr: 「 まっすぐ いって 、 ひとつめ の かど を みぎ に まがって ください 。 つきあたり の とうろう に 、 ひ を つけて ください 。 」 || "Go straight, and turn right at the first corner. Light the lantern at the end of that road."
?(${both(NOTF, 'hall.w1.pat=1')}) narr: 「 まっすぐ {行|い}って 、 {一|ひと}つ{目|め} の {角|かど} を {右|みぎ} に {曲|ま}がって ください 。 {突|つ}き{当|あ}たり の {灯籠|とうろう} に 、 {火|ひ} を {点|つ}けて ください 。 」 || "Go straight, and turn right at the first corner. Light the lantern at the end of that road."
?(comp&!hall.w1.t4&comp!=ren) comp: {角|かど} を {数|かぞ}えながら {行|い}こう 。 || Let's count the corners as we go.
?(comp=ren&!hall.w1.t4) comp: {角|かど} を {数|かぞ}えながら {行|い}きましょう 。 || Let's count the corners as we go.
`;
  // the lanterns at the ends of the three crossings: the card's one takes a flame (west end of the middle crossing in
  // pattern 0, east end of the first crossing in pattern 1)
  const TARGET = { 0: 'w13', 1: 'e20' };
  for (const k of Object.keys(C.hallW1Ends || {})) {
    const pats = Object.keys(TARGET).filter((p) => TARGET[p] === k);
    out += `
@scene hall.w1.l4_${k}
!if xp_hall_w1_f1_lamp_${k} -> lit
!if hall.w1.t4 -> other
${pats.map((p) => `!if hall.w1.pat=${p} -> right`).join('\n')}
narr: {灯籠|とうろう} に {火|ひ} を {近|ちか}づけて も 、 {入|はい}らない 。 {札|ふだ} の {灯籠|とうろう} では ない よう だ 。 || You hold a flame to the lantern, but it won't take. This doesn't seem to be the one on the card.
?(comp&comp!=ren) comp: {角|かど} を {数|かぞ}え{直|なお}して みよう か 。 {入|い}り{口|ぐち} から 、 もう {一度|いちど} 。 || Shall we count the corners again? From the way in, once more.
?(comp=ren) comp: {角|かど} を {数|かぞ}え{直|なお}して みましょう か 。 {入|い}り{口|ぐち} から 、 もう {一度|いちど} 。 || Shall we count the corners again? From the way in, once more.
!end
:right
narr: {火|ひ} が {入|はい}った 。 {灯籠|とうろう} の {窓|まど} が 、 {温|あたた}かく {光|ひか}る 。 || The flame takes. The lantern's window glows warm.
!set xp_hall_w1_f1_lamp_${k} xp_hall_w1_f1_t4
!hook hall_trial w1 t4
!refresh
!end
:lit
narr: {灯籠|とうろう} が {灯|とも}って いる 。 || The lantern is lit.
!end
:other
narr: {札|ふだ} の {灯籠|とうろう} に は 、 もう {火|ひ} が {入|はい}って いる 。 || The lantern on the card is already lit.
`;
  }
  out += `
# ---- t5: the stray lanterns in the mist ----------------------------------------------------------------------------
@scene hall.w1.t5
narr: {霧|きり} が {少|すこ}し {晴|は}れた 。 {提灯|ちょうちん} は 、 {道|みち} の {脇|わき} に {静|しず}か に {落|お}ちて いる 。 || The mist thins a little. The lanterns lie quietly at the roadside.
!set xp_hall_w1_f1_t5
!hook hall_trial w1 t5
!refresh

# ---- t6: the map in your companion's hands (alone: the lamp holds it) ---------------------------------------------
@scene hall.w1.t6
!if hall.w1.t6 -> done
!if xp_hall_w1_f1_asked -> told
narr: {石|いし} の {台|だい} の {上|うえ} に 、 {古|ふる}い {地図|ちず} が {一枚|いちまい} 。 || On the stone table, an old map.
?(comp) narr: {相棒|あいぼう} が {地図|ちず} を {手|て} に {取|と}った 。 {字|じ} が {小|ちい}さくて 、 {二人|ふたり} で は {覗|のぞ}けない 。 || Your companion picks it up. The writing is small; there's no room for two to look.
?(comp=nao) comp: {地図|ちず} は {任|まか}せて くれ 。 {読|よ}む の は {仕事|しごと} だ 。 {何|なに} を {探|さが}す ？ || Leave the map to me. Reading them's my job. What are we looking for?
?(comp=mio) comp: {私|わたし} が {持|も}つ わ 。 {何|なに} を {探|さが}せば いい か 、 {言|い}って 。 || I'll hold it. Tell me what to look for.
?(comp=ren) comp: {私|わたし} が {持|も}ちます 。 {灯守|ひもり} の {地図|ちず} は 、 {読|よ}み{慣|な}れて います 。 {何|なに} を {知|し}りたい です か 。 || I'll hold it. I'm used to keepers' maps. What do you want to know?
?(comp=suzu) comp: {私|わたし} が {持|も}つ よ 。 {帳面|ちょうめん} {読|よ}み なら {得意|とくい} 。 {何|なに} が {知|し}りたい ？ || I'll hold it. Reading small print is my strong suit. What do you want to know?
?(!comp) narr: {地図|ちず} に {触|ふ}れよう と する と 、 {灯籠|とうろう} の {声|こえ} が した 。 || As you reach for the map, the lamp's voice speaks.
?(!comp) hall_lamp: {地図|ちず} は 、 わたし が {読|よ}もう 。 {何|なに} を {知|し}りたい ？ || I'll read the map. What would you know?
!hook hall_challenge hall.w1.ask
!if var._res=0 -> later
!set xp_hall_w1_f1_asked
:told
?(${both(EF, 'hall.w1.pat=0')}) narr: 「 いずみ は 、 ちず の みぎうえ 。 みち の そと の 、 くさ の なか 。 」 || "The spring is at the top right of the map. Off the road, in the grass."
?(${both(EFF.E, 'hall.w1.pat=0')}) narr: 「 {泉|いずみ} は 、 {地図|ちず} の {右上|みぎうえ} 。 {道|みち} の {外|そと} の 、 {草|くさ} の {中|なか} 。 」 || "The spring is at the top right of the map. Off the road, in the grass."
?(${both(EFF.I + '|' + EFF.A, 'hall.w1.pat=0')}) narr: 「 {泉|いずみ} は 、 {北東|ほくとう} の {外|はず}れ 。 {道|みち} から {離|はな}れた {草|くさ} の {中|なか} に ある 。 」 || "The spring is at the north-east edge, in the grass off the road."
?(${both(EF, 'hall.w1.pat=1')}) narr: 「 いずみ は 、 ちず の ひだりした 。 みち の そと の 、 くさ の なか 。 」 || "The spring is at the bottom left of the map. Off the road, in the grass."
?(${both(EFF.E, 'hall.w1.pat=1')}) narr: 「 {泉|いずみ} は 、 {地図|ちず} の {左下|ひだりした} 。 {道|みち} の {外|そと} の 、 {草|くさ} の {中|なか} 。 」 || "The spring is at the bottom left of the map. Off the road, in the grass."
?(${both(EFF.I + '|' + EFF.A, 'hall.w1.pat=1')}) narr: 「 {泉|いずみ} は 、 {南西|なんせい} の {外|はず}れ 。 {道|みち} から {離|はな}れた {草|くさ} の {中|なか} に ある 。 」 || "The spring is at the south-west edge, in the grass off the road."
!end
:later
narr: {地図|ちず} は 、 {台|だい} の {上|うえ} に {戻|もど}した 。 || You put the map back on the table.
!end
:done
narr: {地図|ちず} の {泉|いずみ} に 、 {小|ちい}さな {印|しるし} が {付|つ}いて いる 。 || A little mark has been made at the spring on the map.
`;
  for (const [k, pat] of [['ne', 0], ['sw', 1]]) out += `
@scene hall.w1.t6_${k}
!if hall.w1.t6 -> done
!if !xp_hall_w1_f1_asked -> stone
!if hall.w1.pat=${pat} -> found
narr: {石|いし} を {動|うご}かして も 、 {乾|かわ}いた {土|つち} だけ 。 {地図|ちず} の {話|はなし} と 、 {場所|ばしょ} が {違|ちが}う よう だ 。 || You move the stone: only dry earth. This doesn't seem to be where the map said.
?(comp&comp!=ren) comp: {地図|ちず} の {言葉|ことば} 、 もう {一度|いちど} {言|い}おう か ？ || Shall I say what the map said again?
?(comp=ren) comp: {地図|ちず} を 、 もう {一度|いちど} {読|よ}みましょう か 。 || Shall I read the map again?
!end
:found
narr: {石|いし} の {下|した} から 、 {水|みず} が {湧|わ}き{出|だ}した 。 {小|ちい}さな {泉|いずみ} 。 || Water wells up from under the stone. A little spring.
?(comp&comp!=ren) comp: {地図|ちず} の {通|とお}り だ 。 {読|よ}んで 、 {歩|ある}いて 、 {見|み}つけた 。 || Just as the map said. Read it, walked it, found it.
?(comp=ren) comp: {地図|ちず} の {通|とお}り です 。 {読|よ}んで 、 {歩|ある}いて 、 {見|み}つけました 。 || Just as the map said. Read it, walked it, found it.
!set xp_hall_w1_f1_t6
!hook hall_trial w1 t6
!refresh
!end
:stone
narr: {苔|こけ} の {生|は}えた {石|いし} 。 || A mossy stone.
!end
:done
narr: {石|いし} の {脇|わき} から 、 {水|みず} が {静|しず}か に {湧|わ}いて いる 。 || Water wells quietly beside the stone.
`;
  out += `
# ---- t7: the riddle stone (a reprieve) -----------------------------------------------------------------------------
@scene hall.w1.t7
!if hall.w1.t7 -> done
narr: {古|ふる}い {石|いし} に 、 {字|じ} が {彫|ほ}って ある 。 「 {解|と}けた {者|もの} は 、 {一度|いちど} だけ 、 {帰|かえ}って また {来|く}る こと が できる 。 」 || Words cut into an old stone: "Whoever solves this may once go home and come back."
!hook hall_challenge hall.w1.riddle
!if var._res=0 -> later
narr: {石|いし} の {字|じ} が 、 {温|あたた}かく {光|ひか}った 。 || The carving glows warm.
!set xp_hall_w1_f1_t7
!hook hall_trial w1 t7
!refresh
!end
:later
narr: {答|こた}え は 、 {急|いそ}がなくて いい 。 || There's no hurry for the answer.
!end
:done
narr: {石|いし} は 、 {答|こた}え を {覚|おぼ}えて いる 。 || The stone remembers the answer.

# ---- t8: Otami's note and the four lamps ---------------------------------------------------------------------------
@scene hall.w1.t8_note
narr: オタミ の {札|ふだ} 。 {灯|ひ} を {点|つ}ける {順番|じゅんばん} が {書|か}いて ある 。 || Otami's note: the order in which to light the lamps.
?(${both(EF, 'hall.w1.pat=0')}) narr: 「 いち 、 いりぐち から みて 、 しょうめん の とうろう 。 に 、 その みぎ の とうろう 。 さん 、 いちばん てまえ の とうろう 。 よん 、 のこり の とうろう 。 」 || "One: seen from the way in, the lamp straight ahead. Two: the one to its right. Three: the nearest one. Four: the one left."
?(${both(NOTF, 'hall.w1.pat=0')}) narr: 「 {一|いち} 、 {入|い}り{口|ぐち} から {見|み}て 、 {正面|しょうめん} の {灯籠|とうろう} 。 {二|に} 、 その {右|みぎ} の {灯籠|とうろう} 。 {三|さん} 、 {一番|いちばん} {手前|てまえ} の {灯籠|とうろう} 。 {四|よん} 、 {残|のこ}り の {灯籠|とうろう} 。 」 || "One: seen from the way in, the lamp straight ahead. Two: the one to its right. Three: the nearest one. Four: the one left."
?(${both(EF, 'hall.w1.pat=1')}) narr: 「 いち 、 ひだり の とうろう 。 に 、 その むかい の とうろう 。 さん 、 いりぐち に いちばん ちかい とうろう 。 よん 、 のこり の とうろう 。 」 || "One: the lamp on the left. Two: the one opposite it. Three: the one nearest the way in. Four: the one left."
?(${both(NOTF, 'hall.w1.pat=1')}) narr: 「 {一|いち} 、 {左|ひだり} の {灯籠|とうろう} 。 {二|に} 、 その {向|む}かい の {灯籠|とうろう} 。 {三|さん} 、 {入|い}り{口|ぐち} に {一番|いちばん} {近|ちか}い {灯籠|とうろう} 。 {四|よん} 、 {残|のこ}り の {灯籠|とうろう} 。 」 || "One: the lamp on the left. Two: the one opposite it. Three: the one nearest the way in. Four: the one left."
`;
  // each lamp's place in Otami's order, by pattern (seen from the way in at the south)
  const ORDER8 = { 0: ['N', 'E', 'S', 'W'], 1: ['W', 'E', 'S', 'N'] };
  const ALL8 = ['N', 'E', 'S', 'W'];
  const reset8 = '!unset xp_hall_w1_f2_s1 xp_hall_w1_f2_s2 xp_hall_w1_f2_s3 ' + ALL8.map((d) => 'xp_hall_w1_f2_lit_' + d).join(' ');
  for (const d of ALL8) {
    out += `
@scene hall.w1.l8_${d}
!if hall.w1.t8 -> lit
!if xp_hall_w1_f2_lit_${d} -> lit
!if hall.w1.pat=1 -> p1
`;
    for (const p of [0, 1]) {
      const i = ORDER8[p].indexOf(d) + 1;
      out += (p === 1 ? ':p1\n' : '') + (i > 1 ? `!if !xp_hall_w1_f2_s${i - 1} -> wrong\n` : '') +
        `narr: {灯籠|とうろう} に {火|ひ} が {入|はい}った 。 || The lamp takes the flame.\n!set xp_hall_w1_f2_lit_${d}${i < 4 ? ' xp_hall_w1_f2_s' + i : ''}\n` +
        (i === 4 ? '!goto all\n' : '!refresh\n!end\n');
    }
    out += `:wrong
narr: {火|ひ} が {一瞬|いっしゅん} {燃|も}え{上|あ}がって 、 {消|き}えた 。 {点|つ}いて いた {灯籠|とうろう} も 、 {全部|ぜんぶ} {消|き}えて しまった 。 || The flame flares for a moment and dies, and every lamp that was lit goes out with it.
?(comp&comp!=ren) comp: {順番|じゅんばん} が {違|ちが}った みたい だ 。 {札|ふだ} を もう {一度|いちど} {読|よ}もう 。 || Wrong order, it seems. Let's read the note again.
?(comp=ren) comp: {順番|じゅんばん} が {違|ちが}った よう です 。 {札|ふだ} を もう {一度|いちど} {読|よ}みましょう 。 || Wrong order, it seems. Let's read the note again.
${reset8}
!refresh
!end
:all
narr: {四|よっ}つ の {灯籠|とうろう} が 、 {揃|そろ}って {灯|とも}った 。 {真|ま}ん{中|なか} の {大|おお}きな {灯籠|とうろう} の {芯|しん} が 、 かすか に {赤|あか}く なる 。 || All four lamps are lit together. The wick of the great lamp in the middle glows faintly red.
!set xp_hall_w1_f2_t8
!hook hall_trial w1 t8
!refresh
!end
:lit
narr: {灯籠|とうろう} が {灯|とも}って いる 。 || The lamp is lit.
`;
  }
  out += `
# ---- t9: Genza -----------------------------------------------------------------------------------------------------
@scene hall.w1.t9
!faceplayer hall_genza
hall_genza: …… {何|なん} だ 。 {道|みち} なら {知|し}って いる 。 {聞|き}く {必要|ひつよう} は ない 。 || …What is it? I know the way. No need to ask anyone.
!encounter hall.w1.pilgrim
!if var._enc=together -> together
hall_genza: {峠|とうげ} は 、 あの {木|き} の {向|む}こう だ 。 …… {多分|たぶん} な 。 || The pass is past that tree. …Probably.
!end
:together
hall_genza: {灯籠|とうろう} まで 、 {一緒|いっしょ} に {歩|ある}く か 。 {年寄|としよ}り の {足|あし} だ 、 {待|ま}って くれ よ 。 || Walk to the lamp together, then. Old legs: you'll have to wait for me.
!set xp_hall_w1_f2_t9
!hook hall_trial w1 t9
!refresh

@scene hall.w1.genza_after
!faceplayer hall_genza_lamp
!if hall.w1.t10 -> lit
hall_genza: {女房|にょうぼう} は 、 ここ で {二度|にど} {聞|き}いた そう だ 。 …… {俺|おれ} は 、 {一度|いちど} も {聞|き}いた こと が ない 。 || My wife asked twice, here, she said. …I've never asked anyone even once.
!end
:lit
hall_genza: {明|あか}るい な 。 …… {今度|こんど} {道|みち} が {分|わ}からなく なったら 、 {聞|き}いて みる よ 。 {二度|にど} な 。 || Bright, isn't it. …Next time I don't know the way, I'll ask. Twice.

# ---- t10: the lamp relit -------------------------------------------------------------------------------------------
@scene hall.w1.t10
!if !hall.w1.t8 -> wait
!if !hall.w1.t9 -> wait
narr: {大|おお}きな {灯籠|とうろう} 。 {台|だい} に 、 オタミ の {札|ふだ} が {挟|はさ}まって いる 。 {道|みち} の {四方|しほう} から 、 {旅人|たびびと} の {足音|あしおと} が {近|ちか}づいて くる 。 || The great lamp. Otami's note is tucked into its base. From all four roads, travellers' footsteps draw near.
!encounter hall.w1.great
!if var._res=0 -> later
!set xp_hall_w1_f2_t10
!hook hall_trial w1 t10
!if var._res=1 -> finale
!refresh
!end
:finale
!call hall.w1.end
!end
:wait
narr: {大|おお}きな {灯籠|とうろう} は 、 まだ {冷|つめ}たい 。 {周|まわ}り の {四|よっ}つ の {灯|ひ} と 、 {西|にし} の {道|みち} の {巡礼|じゅんれい} が 、 {先|さき} の よう だ 。 || The great lamp is still cold. The four lamps round it, and the pilgrim on the west road, seem to come first.
!end
:later
narr: {灯籠|とうろう} は 、 {待|ま}って くれる 。 || The lamp will wait.

# ---- the tale's end ------------------------------------------------------------------------------------------------
@scene hall.w1.end
!fade out
!sequence hall.w1 begin
!shot tale
narr: {最後|さいご} の {旅人|たびびと} が 、 {北|きた} の {道|みち} に {消|き}えた 。 {灯籠|とうろう} の {火|ひ} が 、 {一度|いちど} 、 {大|おお}きく {揺|ゆ}れる 。 || The last traveller disappears up the north road. The lamp's flame sways once, high.
hall_lamp: もう {一度|いちど} 、 {言|い}って ください 。 …… ええ 、 {聞|き}こえました よ 。 ありがとう 。 || Please say it again. …Yes, I heard you. Thank you.
?(hall.w1.t9) hall_genza: …… {女房|にょうぼう} が {言|い}って いた {声|こえ} だ 。 {二度|にど} {聞|き}け 、 と 。 || …That's the voice my wife spoke of. Ask twice, she said.
?(comp=nao) comp: {届|とど}いた な 。 {全部|ぜんぶ} 、 {正|ただ}しい {宛先|あてさき} に 。 …… {聞|き}き{返|かえ}した から だ 。 || Delivered. Every one to the right address. …Because we asked back.
?(comp=mio) comp[happy]: {分|わ}からない とき に 、 {分|わ}からない と {言|い}える 。 それ だけ で 、 {誰|だれ} も {迷|まよ}わない のね 。 || Saying "I don't understand" when you don't. That alone, and nobody gets lost.
?(comp=ren) comp: {灯|ひ} が {一|ひと}つ 、 {戻|もど}りました 。 {百|ひゃく} の うち の 、 {一|ひと}つ 。 {悪|わる}く ない {始|はじ}まり です 。 || One light back. One of a hundred. Not a bad beginning.
?(comp=suzu) comp: {第|だい}{一幕|いちまく} 、 {幕|まく} ！ {聞|き}き{返|かえ}す {勇気|ゆうき} の {話|はなし} 。 {拍手|はくしゅ} を どうぞ 。 || End of act one! A tale about the courage to ask again. Applause, please.
!sequence hall.w1 end
narr: {灯|ひ} の {光|ひかり} が {畳|たた}まれる よう に {小|ちい}さく なって 、 {気|き}が {付|つ}く と 、 {館|やかた} の {囲炉裏|いろり} の {前|まえ} に いた 。 || The lamplight folds small, and when you look up you are by the hall's hearth.
!set hall_w1_done
!hook hall_finish
!fade in
`;
  RB.script.add(out);
})(RB.content);
