/* Steamhollow, Chapter 11: the call, the way down and the arrival (expansion P13; docs/future/work/P13_STEAMHOLLOW.md).
 * After the Cloudroad, the first letter to come up the restored relay from the valley side: Rokubei, head of the
 * bath-keepers, writes to "the travellers who gave the Cloudroad its voice back". Jinpachi brings it to whichever
 * station (or the Pass, or Lanternfall's street) the party is next in. The valley's people have dug the way down out of
 * the snow from below. The Steaming Slope, a newcomer from a village above who cannot say why he came (S15: the
 * mountain above is soundless); the upper town, loud and full; Rokubei at the footbath, the quarrel told in short.
 * Companion lines for all four; Suzu's have Kansai versions (kansai_99_yn.js). */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  // the runner, wherever the party next is on the Cloudroad (a station or the Pass) or in Lanternfall's street
  const where = (C.cloudroad && C.cloudroad.STATIONS ? C.cloudroad.STATIONS : []).map((id) => [id, 5, 14]).concat([['cr.summit', 5, 12], ['lf.town', 6, 18]]);
  for (const [id, x, y] of where) {
    const m = C.maps[id];
    if (!m) continue;
    m.npcs.push({ id: 'cr_jinpachi', x, y, dir: 'up', if: 'ed>=2&cr_done&!yn_called', talk: 'yn.call' });
    m.onEnter = (m.onEnter || []).concat([{ scene: 'yn.call', if: 'ed>=2&cr_done&!yn_called' }]);
  }
})(RB.content);

RB.script.add(`
@scene yn.call
# Staged: Jinpachi comes up the road at a run, waving a letter over his head, the first one ever to come up the relay
# from beyond the pass. He reads the address out proudly; the companion answers in their own way.
# He runs up to you first (RBN-QA-108), from his place on the road or from wherever he was still going: chained after
# the Cloudroad's end he was walking to his place, 13 tiles off. No line says he came; if he cannot reach you (no free
# place within 2, or the walk runs out) he speaks from where he is, and a line said while he is off screen says so.
!set yn_called
!chapter yn
!walkto cr_jinpachi pc run max=8000
!emote cr_jinpachi !
!faceplayer cr_jinpachi
cr_jinpachi: $name さん ！ {峠|とうげ} の {向|む}こう から 、 {手紙|てがみ} です ！ {谷|たに} の {側|がわ} から {継|つ}ぎ{飛脚|びきゃく} に {乗|の}った 、 {初|はじ}めて の {便|びん} です よ ！ || $name! A letter from over the pass! The first post ever to come up the relay from the valley side!
cr_jinpachi: {宛名|あてな} は 、 ええと 、 「{雲路|くもじ} に {声|こえ} を {戻|もど}して くれた {旅|たび} の {方々|かたがた} へ 」 。 …… これ 、 {皆|みな}さん の こと です よね ！ || Addressed, um, "To the travellers who gave the Cloudroad its voice back." …That's you lot, isn't it!
narr: {手紙|てがみ} は 、 {湯気|ゆげ} で {少|すこ}し {波打|なみう}って いた 。 || The letter has gone a little wavy with steam.
narr: 「{湯守|ゆもり} の {頭|かしら} 、 ロクベエ より 。 {谷|たに} は {人|ひと} で いっぱい です 。 {宿|やど} と {宿|やど} が {揉|も}めて います 。 {湯|ゆ} が {熱|あつ}く なったり 、 {冷|つめ}たく なったり します 。 どうか 、 {下|お}りて {来|き}て ください 。」 || "From Rokubei, head of the bath-keepers. The valley is full of people. The inns are quarrelling. The spring runs hot, then cold. Please, come down."
cr_jinpachi: {谷|たに} の {人|ひと} たち が 、 {下|した} から {雪|ゆき} を {掘|ほ}って 、 {峠|とうげ} まで {道|みち} を {開|あ}けた そう です 。 {北東|ほくとう} の {下|くだ}り{道|みち} 、 もう {通|とお}れます よ ！ || The valley folk dug the snow out from below and opened the way all the way up to the pass, they say. The way down to the north-east is clear now!
?(comp=nao) comp[smirk]: {湯|ゆ} の {谷|たに} か 。 {熱|あつ}い {湯|ゆ} と 、 {足|あし} を {休|やす}める {場所|ばしょ} 。 …… {文句|もんく} は ない 。 || A valley of hot springs. Hot water and somewhere to rest my feet. …No complaints.
?(comp=mio) comp[think]: {湯|ゆ} の {谷|たに} …… キクエ さん の いる {所|ところ} です 。 {呼|よ}ばれて いる よう な {気|き} が します 。 || The valley of springs… That's where Kikue is. It feels as if I'm being called.
?(comp=ren) comp[think]: {湯気|ゆげ} の {谷|たに} の {灯|ひ} …… 。 {湯気|ゆげ} の {中|なか} で 、 {灯|ひ} は どう {見|み}える の でしょう 。 || Lamps in a valley of steam… I wonder how a lamp looks through steam.
?(comp=suzu) comp[laugh]: {湯治場|とうじば} ！ {揉|も}め{事|ごと} {付|つ}き なんて 、 {芝居|しばい} の {筋書|すじが}き みたい ね 。 {行|い}きましょ 。 || A spa town! With a quarrel thrown in. It's like the outline of a play. Let's go.
cr_jinpachi: それ と 、 {海|うみ} の {方|ほう} から {旅|たび} の {一座|いちざ} が {峠|とうげ} を {越|こ}えて 、 {谷|たに} へ {下|お}りた そう です 。 {芝居|しばい} を する と か 。 || Oh, and a troupe of travelling players came over the pass from the coast way and went down to the valley, they say. To put on a show, apparently.
?(comp=suzu) comp[surprise]: …… {一座|いちざ} ？ || …A troupe?
?(comp=suzu) narr: スズ は {笑|わら}おう と して 、 {途中|とちゅう} で {止|や}めた 。 || Suzu starts to laugh, and stops halfway.
!give yn_letter
!quest yn_main 0
!travel cr_summit
!journal {湯守|ゆもり} の ロクベエ から 、 {峠|とうげ} の {向|む}こう の {湯|ゆ}ノ{谷|たに} へ {来|き}て ほしい と {手紙|てがみ} が {来|き}た 。 {雲路峠|くもじとうげ} から {北東|ほくとう} へ {下|くだ}ろう 。 || A letter from Rokubei the bath-keeper asks you to come to Steamhollow, beyond the pass. Go down to the north-east from the Cloudroad Pass.
cr_jinpachi: {峠|とうげ} まで は 、 {駕籠|かご} も あります から ！ {雲居|くもい} まで 、 {乗|の}って って ください 。 || There's the palanquin as far as Kumoi! Ride it up.
!refresh

@scene yn.descent_first
# The way down: steam from the cracks, the smell of sulphur, the valley's noise rising. Behind and above, the pass and
# the ridge beyond it: no birds, no wind, no sound at all (S15). Nobody explains it.
!set yn_descent_seen
!quest yn_main 0
narr: {岩|いわ} の {割|わ}れ{目|め} から 、 {湯気|ゆげ} が {上|あ}がって いる 。 {卵|たまご} の よう な 、 {硫黄|いおう} の {匂|にお}い が する 。 || Steam rises from cracks in the rock. There's a smell like eggs: sulphur.
narr: {下|した} の {谷|たに} から 、 {人|ひと} の {声|こえ} 、 {下駄|げた} の {音|おと} 、 {三味線|しゃみせん} が {聞|き}こえて くる 。 || From the valley below come voices, the clack of wooden sandals, a shamisen.
!gesture pc lookroad up
narr: {振|ふ}り{返|かえ}る と 、 {峠|とうげ} の {上|うえ} の {尾根|おね} は 、 {何|なん} の {音|おと} も しない 。 {鳥|とり} も 、 {風|かぜ} も 。 || When you look back, the ridge above the pass makes no sound at all. No birds. No wind.
?(comp=nao) comp[closed]: …… {上|うえ} は 、 {静|しず}か すぎる な 。 {下|した} へ {行|い}こう 。 || …Too quiet up there. Let's go down.
?(comp=mio) comp[worry]: {尾根|おね} の {方|ほう} 、 {何|なん} だか 、 {耳|みみ} が {詰|つ}まった みたい です 。 {高|たか}い {所|ところ} の せい だけ で は ない よう な 。 || Up towards the ridge, it's as if my ears are blocked. And not only from the height, I think.
?(comp=ren) comp[worry]: {灯|ひ} の ない {尾根|おね} です ね 。 …… {音|おと} まで 、 {消|き}えて いる 。 || A ridge without a single lamp. …Even the sound has gone out.
?(comp=suzu) comp[worry]: {客席|きゃくせき} の ない {舞台|ぶたい} みたい 。 …… {下|した} の {賑|にぎ}やか な {方|ほう} へ {行|い}きましょ 。 || Like a stage with no audience. …Let's head for the lively part below.

@scene yn.descent_stone
narr: {古|ふる}い {道標|みちしるべ} 。 「{右|みぎ} 、 {雲路峠|くもじとうげ} 。 {左|ひだり} 、 {湯|ゆ}ノ{谷|たに} 。」 {湯気|ゆげ} で {文字|もじ} が {黒|くろ}く {光|ひか}って いる 。 || An old waystone: "Right, the Cloudroad Pass. Left, Steamhollow." The steam has made the letters shine black.

@scene yn.descent_view
narr: {腰掛|こしか}け から 、 {谷|たに} が {見|み}える 。 {木|き} の {宿|やど} が {斜面|しゃめん} に {重|かさ}なり 、 {赤|あか}い {橋|はし} の {上|うえ} を {浴衣|ゆかた} の {人|ひと} たち が {歩|ある}いて いる 。 {谷|たに} じゅう から {湯気|ゆげ} が {立|た}って いる 。 || From the bench you can see the valley: wooden inns stacked up the slope, people in yukata crossing a red bridge, and steam rising from everywhere.

@scene yn.yasuke_road
# A newcomer from a village up on the ridge: he can't say why he came. Only that it was too quiet to stay (S15).
!faceplayer
!set yn_yasuke_met
yn_yasuke: …… あんた たち も 、 {谷|たに} へ {下|お}りる の か 。 || …You going down to the valley too?
yn_yasuke: {俺|おれ} は 、 {尾根|おね} の {上|うえ} の {村|むら} から {来|き}た 。 {炭焼|すみや}き を して いた 。 {何|なん} で {下|お}りて {来|き}た の か 、 {自分|じぶん} で も よく {分|わ}からない ん だ 。 || I came from the village up on the ridge. I was a charcoal burner. Why I came down, I can't rightly say myself.
yn_yasuke: ただ 、 {静|しず}か すぎた 。 {人|ひと} は いる 。 でも 、 {声|こえ} が {届|とど}かない 。 {自分|じぶん} の {声|こえ} も 、 {自分|じぶん} に {聞|き}こえない 。 || Only, it was too quiet. The people are there. But voices don't carry. You can't hear your own voice.
!choice
* {谷|たに} で 、 {一緒|いっしょ} に {休|やす}みましょう 。 || Come and rest in the valley with us. -> rest
* {村|むら} の {人|ひと} たち は 、 {今|いま} も そこ に ？ || Are the villagers still up there? -> still
:rest
yn_yasuke: …… ああ 。 {下|した} は うるさい らしい 。 うるさい の が 、 {今|いま} は ありがたい 。 || …Yeah. They say it's noisy down there. Noisy sounds good right now.
!goto end
:still
yn_yasuke: {大半|たいはん} は な 。 {下|お}りよう と {言|い}って も 、 {聞|き}こえない ん だ 。 {紙|かみ} に {書|か}いて {置|お}いて きた 。 || Most of them. You tell them to come down, and they can't hear you. I left it written on paper.
:end
?(comp=nao) comp[closed]: {紙|かみ} に {書|か}いた か 。 …… それ で いい 。 {声|こえ} が {届|とど}かない なら 、 {紙|かみ} だ 。 || You wrote it down. …Right call. If your voice won't carry, use paper.
?(comp=mio) comp[worry]: よく {眠|ねむ}れて います か 。 …… {谷|たに} で 、 {診|み}て もらいましょう 。 || Are you sleeping at all? …Let's have someone look at you in the valley.
?(comp=ren) comp[think]: {声|こえ} が {届|とど}かない …… 。 {覚|おぼ}えて おきます 。 || Voices that don't carry… I'll remember that.
?(comp=suzu) comp: {声|こえ} が {出|で}る {所|ところ} へ {行|い}きましょ 。 {下|した} の {谷|たに} は 、 きっと うるさい わ よ 。 || Let's go where voices work. The valley down there will be noisy, I'm sure.

@scene yn.yasuke_idle
!faceplayer
yn_yasuke: …… {少|すこ}し {休|やす}んで から {下|お}りる 。 {下|した} の {音|おと} を 、 ここ で {聞|き}いて いたい ん だ 。 || …I'll rest a bit, then go down. I want to sit here and listen to the noise from below.

@scene yn.arrive
# The upper town: crowded, loud, warm. Rokubei at the footbath has been watching the road for days.
!set yn_arrived
!quest yn_main 1
narr: {湯|ゆ}ノ{谷|たに} 。 {狭|せま}い {道|みち} に 、 {宿|やど} が {肩|かた} を {寄|よ}せ{合|あ}って いる 。 {浴衣|ゆかた} の {人|ひと} 、 {荷物|にもつ} を {背負|せお}った {人|ひと} 、 {呼|よ}び{込|こ}み の {声|こえ} 。 || Steamhollow. Inns stand shoulder to shoulder along a narrow street. People in yukata, people with bundles on their backs, touts calling out.
narr: {下駄|げた} が {石畳|いしだたみ} を {鳴|な}らす 。 カラン 、 コロン 。 || Wooden sandals ring on the paving stones. Karan, koron.
?(comp=nao) comp[smirk]: {人|ひと} が {多|おお}すぎる 。 {出口|でぐち} は …… {三|みっ}つ か 。 よし 。 || Too many people. Exits… three. Fine.
?(comp=mio) comp[smile]: {温|あたた}かい …… 。 {体|からだ} の {芯|しん} まで 、 {湯気|ゆげ} が {入|はい}って くる みたい です 。 || Warm… It's as if the steam is getting into my bones.
?(comp=ren) comp[surprise]: {灯|ひ} が 、 {湯気|ゆげ} で {丸|まる}く {見|み}えます 。 {全部|ぜんぶ} 、 {月|つき} みたい です 。 || The lamps look round through the steam. Every one of them like a moon.
?(comp=suzu) comp[laugh]: いい {町|まち} ！ {呼|よ}び{込|こ}み の {声|こえ} が 、 {一座|いちざ} の {口上|こうじょう} より {大|おお}きい わ 。 || What a town! The touts are louder than a troupe's opening patter.
!call yn.rokubei_first

@scene yn.rokubei_first
# Rokubei, head of the bath-keepers: the quarrel in short, and the first thing they need, rooms for the newcomers.
!if yn_rokubei_met -> end
!set yn_rokubei_met
!faceplayer yn_rokubei
yn_rokubei: …… その {手紙|てがみ} 。 {継|つ}ぎ{飛脚|びきゃく} の {封|ふう} が して ある な 。 {俺|おれ} が {書|か}いた もの だ 。 || …That letter. It has the relay's seal on it. That's the one I wrote.
yn_rokubei: {湯守|ゆもり} の ロクベエ だ 。 {本当|ほんとう} に {来|き}て くれる と は な 。 {雲路|くもじ} が また {走|はし}って いる と {聞|き}いて 、 {藁|わら} に も すがる {思|おも}い で {書|か}いた ん だ 。 || Rokubei, bath-keeper. I didn't think you'd really come. I heard the Cloudroad was running again and wrote clutching at straws.
yn_rokubei: この {谷|たに} の {湯|ゆ} は 、 {一|ひと}つ の {湯元|ゆもと} から {出|で}て いる 。 それ を {上|かみ}の{湯|ゆ} と {下|しも}の{湯|ゆ} で {分|わ}ける 。 {分|わ}ける の が 、 {俺|おれ} たち {湯守|ゆもり} の {仕事|しごと} だ 。 || All the water in this valley comes from one source. The Upper House and the Lower House share it. Dividing it is our job, the bath-keepers'.
yn_rokubei: ところが 、 {山|やま} の {上|うえ} から {人|ひと} が {下|お}りて {来|く}る よう に なって 、 {宿|やど} は どこ も {満員|まんいん} だ 。 {両方|りょうほう} の {宿|やど} が 、 {相手|あいて} が {湯|ゆ} を {多|おお}く {取|と}って いる と {言|い}う 。 || But since people started coming down off the mountain, every inn is full. And each house says the other takes more of the water.
yn_rokubei: {町|まち} が {言|い}い{争|あらそ}う たび に 、 {地面|じめん} が {揺|ゆ}れて 、 {湯|ゆ} が {熱|あつ}く なったり {冷|つめ}たく なったり する 。 …… {年寄|としよ}り は 、 {釜|かま}の{主|ぬし} が {怒|おこ}って いる と {言|い}う 。 || Every time the town argues, the ground shakes and the water runs too hot, then too cold. …The old folk say the Kettle Below is angry.
!choice
* {釜|かま}の{主|ぬし} ？ || The Kettle Below? -> kettle
* {何|なに} から {手伝|てつだ}えば いい ですか 。 || Where should we start? -> start
:kettle
yn_rokubei: {湯元|ゆもと} の {下|した} に いる 、 {古|ふる}い {湯|ゆ} の {主|ぬし} だ 。 {昔話|むかしばなし} さ 。 …… {俺|おれ} も 、 {昔|むかし} は そう {思|おも}って いた 。 || The old master of the spring, who lives under the source. An old story. …I used to think so too.
:start
yn_rokubei: まず は {寝|ね}る {場所|ばしょ} だ な 。 {上|かみ}の{湯|ゆ} の {番頭|ばんとう} 、 トクゾウ が {帳場|ちょうば} で {目|め} を {回|まわ}して いる 。 {手|て} を {貸|か}して やって くれ 。 {部屋|へや} の {一|ひと}つ も {出|で}て くる かも しれん 。 || First, somewhere to sleep. Tokuzō, the Upper House's head clerk, is going round in circles at his desk. Give him a hand. A room might turn up for you too.
yn_rokubei: {俺|おれ} は {寄合所|よりあいじょ} に いる 。 {上|かみ}の{湯|ゆ} の {向|む}かい だ 。 || I'll be at the guild hall, across from the Upper House.
?(comp=nao) comp: {水|みず} の {取|と}り{合|あ}い か 。 {町|まち} の {喧嘩|けんか} で 、 {一番|いちばん} {古|ふる}くて {一番|いちばん} {長|なが}い やつ だ 。 || A fight over water. The oldest and longest kind of quarrel a town has.
?(comp=mio) comp[think]: {湯|ゆ} が {熱|あつ}すぎたり {冷|つめ}たすぎたり する の は 、 {体|からだ} の {弱|よわ}い {人|ひと} に は {危|あぶ}ない です 。 {急|いそ}ぎましょう 。 || Water that runs too hot or too cold is dangerous for anyone frail. Let's hurry.
?(comp=ren) comp[think]: {一|ひと}つ の {湯元|ゆもと} を {二|ふた}つ の {宿|やど} で 。 {古|ふる}い {決|き}まり が ある はず です ね 。 || One source, two houses. There must be an old agreement.
?(comp=suzu) comp[smirk]: {満員|まんいん} の {宿|やど} の {帳場|ちょうば} なら 、 {私|わたし} の {得意|とくい} よ 。 {帳面|ちょうめん} は 、 {任|まか}せて 。 || A full house's front desk is my kind of place. Leave the books to me.
!quest yn_main 2
!journal {湯|ゆ}ノ{谷|たに} は {満員|まんいん} で 、 {二|ふた}つ の {宿|やど} が {湯|ゆ} を {巡|めぐ}って {揉|も}めて いる 。 まず 、 {上|かみ}の{湯|ゆ} の {帳場|ちょうば} を {手伝|てつだ}おう 。 || Steamhollow is full, and the two houses are quarrelling over the water. First, help at the Upper House's front desk.
!refresh
:end

@scene yn.rokubei_idle
!faceplayer
!if quest.yn_main>=4 -> later
yn_rokubei: {部屋|へや} は {見|み}つかった か 。 {上|かみ}の{湯|ゆ} の {帳場|ちょうば} だ 。 {下|しも}の{湯|ゆ} の タヘエ の {話|はなし} も 、 {一度|いちど} {聞|き}いて やって くれ 。 || Found a room? The Upper House's desk. And go and hear Tahei out at the Lower House, too.
!end
:later
yn_rokubei: {湯守|ゆもり} は 、 {湯|ゆ} を {分|わ}ける の が {仕事|しごと} だ 。 {人|ひと} の {気持|きも}ち まで は 、 {分|わ}けられん 。 || A bath-keeper's job is dividing the water. People's feelings, we can't divide.

@scene yn.north_closed
narr: {北|きた} へ {登|のぼ}る {道|みち} 。 {上|うえ} の {村|むら} の {方|ほう} は 、 {何|なん} の {音|おと} も しない 。 || The road north climbs towards the villages above. No sound comes from that way at all.
?(!yn_done) narr: {今|いま} は 、 {谷|たに} で する こと が ある 。 || For now, there's work to do in the valley.
!move pc down 1

@scene yn.upper_board
narr: {町|まち} の {掲示板|けいじばん} 。 「{満室|まんしつ} 」 の {札|ふだ} が 、 {宿|やど} の {名前|なまえ} の {下|した} に ずらり と {並|なら}んで いる 。 || The town notice board. Under every inn's name, a row of "Full" tags.
narr: {隅|すみ} に 、 {小|ちい}さな {貼|は}り{紙|がみ} 。 「{尾根|おね} の {村|むら} の {方|ほう} 、 {湯守|ゆもり} の {寄合所|よりあいじょ} へ 。」 || In the corner, a small notice: "Anyone from the ridge villages, please come to the bath-keepers' hall."
`);
