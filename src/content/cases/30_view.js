/* Case B — The View on the Other Side (addendum §15.3).
 * Saltglass: the sketch pinned in the lighthouse window (Genzō lends it, with
 * white chart paper to lay it on). Cinder Orchard: the artist's page in the
 * guestbook at Fusa's Inn. Snowbell: three places on the Star Stair to stop
 * and look (the stone seat, and a flat stone at each end of the lower slope).
 * The case record turns the sheet over, compares and resets it; at a
 * viewpoint you can also hold it up either way round. The views themselves
 * are worked out from where the lantern, the shrine and the bare tree stand
 * on the map (RB.content.caseView in 10_data.js). */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  RB.hooks = RB.hooks || {};
  // !hook cs_look <viewpoint>: look out; the view (from the map) is kept as an observation
  RB.hooks.cs_look = async (args) => {
    const s = RB.game.s, V = RB.content.caseView, pid = args[0], P = V.points[pid];
    if (!P) return;
    const res = RB.cases.observe(s, 'view.' + pid);
    const w = V.words(V.order(pid));
    await RB.ui.dialogue.say({ who: 'narr', jp: P.look.jp, en: P.look.en, sceneId: 'cs.view_' + pid });
    await RB.ui.dialogue.say({ who: 'narr', jp: w.jp, en: w.en, sceneId: 'cs.view_' + pid });
    if (res === 'new' && RB.cases.known(s, 'view')) await RB.ui.toast({ kind: 'note', jp: '{記録|きろく} に {書|か}き{加|くわ}えた', en: 'Added to your case record: ' + RB.content.clues['view.' + pid].title.en });
  };
  // !hook cs_holdup <viewpoint> <back|front>: hold the sketch up here, one way round.
  // var._res = 1 when it lines up with this view.
  RB.hooks.cs_holdup = async (args) => {
    const s = RB.game.s, pid = args[0], side = args[1] === 'front' ? 'front' : 'back';
    const K = RB.cases, cd = K.def('view');
    s.vars._res = 0;
    if (!K.known(s, 'view')) return;
    const r = K.rec(s, 'view');
    r.sheet = Object.assign({ side: cd.sheet.start, seen: {} }, r.sheet || {}, { side });
    K.observe(s, 'view.' + pid);
    if (cd.sheet.matches(s, side, pid)) { K.choose(s, 'view', pid); s.vars._res = 1; }
  };
})();

RB.script.add(`
@scene cs.view_window
!if case.view -> lent
narr: {窓|まど} に 、 {薄|うす}い {紙|かみ} の {絵|え} が {留|と}めて ある 。 {外|そと} の {光|ひかり} が {透|す}けて 、 {鉛筆|えんぴつ} の {線|せん} が {浮|う}かんで {見|み}える 。 || A sketch on thin paper is pinned in the window. The light outside shines through it and the pencil lines seem to float.
narr: {左|ひだり} から 、 {枯|か}れ{木|き} 、 {小|ちい}さな {祠|ほこら} 、 {柱|はしら} の {上|うえ} の {灯|あか}り 。 {雪|ゆき} の {斜面|しゃめん} らしい 。 || From left to right: a bare tree, a little shrine, a lamp on a post. A snowy slope, by the look of it.
!hook case_clue view.sketch
genzo: {旅|たび} の {絵描|えか}き が {置|お}いて いった ん だ 。 {北|きた} の {道|みち} の 、 {座|すわ}って {休|やす}む {場所|ばしょ} から {描|か}いた …… と {言|い}って いた か な 。 || A travelling artist left it. Drew it from somewhere on the road north where you sit and rest… or so I think she said.
genzo[think]: だが 、 どこ の {景色|けしき} とも {合|あ}わん 。 {俺|おれ} は {北|きた} の {道|みち} を {何度|なんど} も {歩|ある}いた が な 。 || Doesn't match anywhere, though. And I've walked the road north plenty of times.
!hook case_clue view.genzo
!choice
* {貸|か}して ください || May I borrow it? -> lend
* {見|み}る だけ に する || Just look -> end
:lend
genzo: {持|も}って いけ 。 {描|か}かれた {場所|ばしょ} が {分|わ}かったら 、 そこ に {返|かえ}して やれ 。 {絵|え} の ほう が {喜|よろこ}ぶ 。 || Take it. If you find where it was drawn, give it back to the place. The picture'll like that better.
genzo: それ と 、 これ 。 {海図|かいず} の {白|しろ}い {紙|かみ} だ 。 {下|した} に {敷|し}けば 、 よく {見|み}える 。 || And this: white chart paper. Lay it underneath and you'll see it better.
!give cs_sketch
!set cs_view_backing
!hook case_open view
?(comp=nao) comp: {描|か}いた {人|ひと} の {名前|なまえ} も {場所|ばしょ} も ない {絵|え} か 。 {宛名|あてな} の ない {手紙|てがみ} みたい だ な 。 || No name, no place. Like a letter with no address.
?(comp=mio) comp: {紙|かみ} が とても {薄|うす}い です ね 。 {破|やぶ}らない よう に 、 {気|き} を つけます 。 || The paper's so thin. I'll be careful not to tear it.
?(comp=ren) comp: {景色|けしき} は 、 {見|み}る {場所|ばしょ} で {変|か}わります 。 {灯|ひ} の {道|みち} も 、 {上|のぼ}り と {下|くだ}り で は {別|べつ} の {道|みち} です から 。 || A view changes with where you stand. Even a lantern road is a different road going up than coming down.
?(comp=suzu) comp: {舞台|ぶたい} も ね 、 {客席|きゃくせき} から と {袖|そで} から じゃ 、 {全然|ぜんぜん} {違|ちが}って {見|み}える の よ 。 || A stage looks completely different from the seats than from the wings, you know.
!choice
* {記録|きろく} を {見|み}る || Look at the case record -> page
* {先|さき} へ {進|すす}む || Carry on -> end
:page
!hook case_page view
!end
:lent
narr: {窓|まど} に は 、 {絵|え} を {留|と}めて いた {小|ちい}さな {穴|あな} だけ が {残|のこ}って いる 。 || Only the pinholes where the sketch hung are left in the window.
?(case.view=done) genzo[smile]: {星|ほし} の {石段|いしだん} か 。 {上|のぼ}った こと は なかった な 。 {膝|ひざ} が {許|ゆる}せば 、 {一度|いちど} {座|すわ}って みる か 。 || The Star Stair, eh. Never been up it. If my knees allow, maybe I'll go and sit there once.

@scene cs.view_note
narr: {宿|やど} の {客|きゃく} が {書|か}き{残|のこ}す {帳面|ちょうめん} 。 {古|ふる}い {頁|ページ} に 、 {丁寧|ていねい} な {字|じ} で {書|か}いた もの が ある 。 || The inn's guestbook, where travellers leave a few lines. On an old page, something in a careful hand.
narr: 「 {薄|うす}い {紙|かみ} に {描|か}いて います 。 {表|おもて} の {隅|すみ} に 、 {葉|は} の {印|しるし} を {押|お}します 。 {軸|じく} は {左|ひだり} 。 」 || "I draw on thin paper. In a front corner I press my leaf mark, stem to the left."
narr: 「 {裏|うら} から {見|み}る と 、 {軸|じく} は {右|みぎ} を {向|む}いて 、 へこんで {見|み}えます 。 」 {名前|なまえ} の {代|か}わり に 、 {小|ちい}さな {葉|は} の {絵|え} 。 || "From the back, the stem points right, and the mark looks sunken." Instead of a name, a little drawing of a leaf.
!hook case_clue view.note
?(comp=suzu) comp[smile]: {名前|なまえ} の {代|か}わり に {葉|は}っぱ 。 {粋|いき} な {署名|しょめい} ね 。 || A leaf instead of a name. A stylish signature.
!if !case.view -> end
!choice
* {記録|きろく} を {見|み}る || Look at the case record -> page
* {閉|と}じる || Close the book -> end
:page
!hook case_page view

@scene cs.view_seat
!call sb.path_bench
!choice
* しばらく {座|すわ}って {眺|なが}める || Sit and look out a while -> look
* [item.cs_sketch&case.view=open] {絵|え} を {窓|まど} に {貼|は}って あった とおり に かざす || Hold up the sketch as it hung in the window -> back
* [item.cs_sketch&case.view=open] {絵|え} を {裏返|うらがえ}して かざす || Hold up the sketch turned over -> front
* [item.cs_sketch&case.view=done&!cs_view_framed] {絵|え} を ここ に {残|のこ}す || Leave the sketch here, where it was drawn -> frame
* {先|さき} へ {進|すす}む || Move on -> end
:look
!hook cs_look seat
!end
:back
!hook cs_holdup seat back
!if var._res=1 -> match
narr: {絵|え} と {景色|けしき} は 、 {重|かさ}ならない 。 {灯|あか}り と {祠|ほこら} と {枯|か}れ{木|き} の {並|なら}び が {違|ちが}う 。 || The sketch and the view don't line up: the lantern, the shrine and the bare tree are in a different order.
!end
:front
!hook cs_holdup seat front
!if var._res=1 -> match
narr: {絵|え} と {景色|けしき} は 、 {重|かさ}ならない 。 {灯|あか}り と {祠|ほこら} と {枯|か}れ{木|き} の {並|なら}び が {違|ちが}う 。 || The sketch and the view don't line up: the lantern, the shrine and the bare tree are in a different order.
!end
:match
!call cs.view_solved
!end
:frame
!take cs_sketch
!set cs_view_framed
!sfx discover
narr: {腰掛|こしか}け の {横|よこ} の {柱|はしら} に 、 {小|ちい}さな {額|がく} を {作|つく}って {絵|え} を {納|おさ}めた 。 {表|おもて} を {景色|けしき} の ほう へ {向|む}けて 。 || On the post beside the seat you set the sketch in a small frame, its face turned towards the view.
?(comp) comp[smile]: {絵|え} も 、 やっと {帰|かえ}って きた ね 。 || The picture's finally come home.

@scene cs.view_west
narr: {雪|ゆき} を {払|はら}った {平|たい}らな {石|いし} 。 {誰|だれ} か が ここ に {立|た}って 、 {景色|けしき} を {見|み}る らしい 。 || A flat stone, swept clear of snow. Someone seems to stand here to look at the view.
!choice
* {景色|けしき} を {見|み}る || Look out -> look
* [item.cs_sketch&case.view=open] {絵|え} を {窓|まど} に {貼|は}って あった とおり に かざす || Hold up the sketch as it hung in the window -> back
* [item.cs_sketch&case.view=open] {絵|え} を {裏返|うらがえ}して かざす || Hold up the sketch turned over -> front
* {先|さき} へ {進|すす}む || Move on -> end
:look
!hook cs_look west
!end
:back
!hook cs_holdup west back
!if var._res=1 -> match
narr: {絵|え} と {景色|けしき} は 、 {重|かさ}ならない 。 {灯|あか}り と {祠|ほこら} と {枯|か}れ{木|き} の {並|なら}び が {違|ちが}う 。 || The sketch and the view don't line up: the lantern, the shrine and the bare tree are in a different order.
!end
:front
!hook cs_holdup west front
!if var._res=1 -> match
narr: {絵|え} と {景色|けしき} は 、 {重|かさ}ならない 。 {灯|あか}り と {祠|ほこら} と {枯|か}れ{木|き} の {並|なら}び が {違|ちが}う 。 || The sketch and the view don't line up: the lantern, the shrine and the bare tree are in a different order.
!end
:match
!call cs.view_solved

@scene cs.view_east
narr: {雪|ゆき} を {払|はら}った {平|たい}らな {石|いし} 。 {下|した} の {道|みち} が よく {見|み}える 。 || A flat stone, swept clear of snow. You can see the lower path well from here.
!choice
* {景色|けしき} を {見|み}る || Look out -> look
* [item.cs_sketch&case.view=open] {絵|え} を {窓|まど} に {貼|は}って あった とおり に かざす || Hold up the sketch as it hung in the window -> back
* [item.cs_sketch&case.view=open] {絵|え} を {裏返|うらがえ}して かざす || Hold up the sketch turned over -> front
* {先|さき} へ {進|すす}む || Move on -> end
:look
!hook cs_look east
!end
:back
!hook cs_holdup east back
!if var._res=1 -> match
narr: {絵|え} と {景色|けしき} は 、 {重|かさ}ならない 。 {灯|あか}り と {祠|ほこら} と {枯|か}れ{木|き} の {並|なら}び が {違|ちが}う 。 || The sketch and the view don't line up: the lantern, the shrine and the bare tree are in a different order.
!end
:front
!hook cs_holdup east front
!if var._res=1 -> match
narr: {絵|え} と {景色|けしき} は 、 {重|かさ}ならない 。 {灯|あか}り と {祠|ほこら} と {枯|か}れ{木|き} の {並|なら}び が {違|ちが}う 。 || The sketch and the view don't line up: the lantern, the shrine and the bare tree are in a different order.
!end
:match
!call cs.view_solved

@scene cs.view_solved
!hook case_resolve view
!if var._res=0 -> end
!sfx discover
narr: {裏返|うらがえ}した {絵|え} の {灯|あか}り 、 {祠|ほこら} 、 {枯|か}れ{木|き} が 、 {石段|いしだん} の {下|した} の {腰掛|こしか}け から {見上|みあ}げた {景色|けしき} に ぴたり と {重|かさ}なった 。 || Turned over, the sketch's lantern, shrine and bare tree line up exactly with the view up the stair from the stone seat at its foot.
narr: {絵|え} は 、 {表|おもて} を ガラス に {向|む}けて {窓|まど} に {貼|は}られて いた の だ 。 {部屋|へや} から {見|み}えて いた の は 、 ずっと {裏|うら} だった 。 || It had been pinned with its face to the glass. From inside the room, everyone had only ever seen the back.
narr: {小|ちい}さな カード に 、 {絵|え} を {写|うつ}した 。 {裏返|うらがえ}す と 、 もう {一|ひと}つ の {見|み}え{方|かた} に なる 。 || You trace it onto a small card. Turn the card over, and there is the other way of seeing it.
!quest cs_view done
!hook case_react view
?(!cs_view_framed) narr: {元|もと} の {絵|え} は 、 {描|か}かれた {場所|ばしょ} に {返|かえ}して も いい 。 {石段|いしだん} の {下|した} の {腰掛|こしか}け に 。 || The original could go back to where it was drawn, if you like: the stone seat at the foot of the stair.
!autosave

@scene cs.view_frame
narr: {腰掛|こしか}け の {横|よこ} の {小|ちい}さな {額|がく} 。 {旅|たび} の {絵描|えか}き の {絵|え} が 、 {表|おもて} を {景色|けしき} に {向|む}けて {納|おさ}まって いる 。 || A small frame by the stone seat. The travelling artist's sketch sits in it, its face turned towards the view.
narr: {絵|え} の {中|なか} の {灯|あか}り と 、 {本物|ほんもの} の {灯|あか}り が 、 {同|おな}じ ところ に ある 。 || The lantern in the sketch and the real one stand in the same place.

@scene cs.talk_view
!if case.view=done -> done
?(comp=nao) comp[think]: {宛名|あてな} を {裏|うら} から {読|よ}んだ こと が ある 。 {封筒|ふうとう} が {透|す}けて て な 。 …… {字|じ} が {全部|ぜんぶ} {逆|ぎゃく} だった 。 || I once read an address from the back — the envelope was thin. …Every letter was the wrong way round.
?(comp=mio) comp: {薬|くすり} の {包|つつ}み も 、 {表|おもて} と {裏|うら} を {間違|まちが}える と 、 {全然|ぜんぜん} {違|ちが}う {字|じ} に {見|み}える んです 。 || Medicine wrappers too — get the front and back mixed up and the writing looks like something else entirely.
?(comp=ren) comp: {景色|けしき} が {合|あ}わない の は 、 {景色|けしき} の せい では ない かも しれません 。 {見|み}て いる {側|がわ} の せい かも 。 || Maybe the view doesn't match because of how we're looking, not because of the view.
?(comp=suzu) comp: {客席|きゃくせき} から {見|み}る の と 、 {舞台|ぶたい} の {上|うえ} から {見|み}る の と 。 {左右|さゆう} が {逆|ぎゃく} に なる の よ ね 。 || From the seats, and from the stage. Left and right swap over.
!end
:done
?(comp=nao) comp[smile]: {窓|まど} の {絵|え} 、 {何年|なんねん} も {裏|うら} を {向|む}いて た ん だ な 。 {誰|だれ} も {気|き}づかない まま 。 || That picture faced the wrong way for years. Nobody noticed.
?(comp=mio) comp[smile]: あの {腰掛|こしか}け 、 アカリ さん の {背|せ} の {印|しるし} が ある {柱|はしら} の そば でした ね 。 {景色|けしき} も 、 {人|ひと} も 、 {覚|おぼ}えて いる {場所|ばしょ} 。 || That seat was by the post with Akari's height marks. A place that remembers a view and people too.
?(comp=ren) comp: {裏|うら} から {見|み}て いた の は 、 {私|わたし} たち の ほう でした 。 …… {良|よ}い {教訓|きょうくん} です 。 {方角|ほうがく} の {苦手|にがて} な {私|わたし} に は 、 {特|とく}に 。 || We were the ones looking from the back. …A good lesson. Especially for someone as bad with directions as me.
?(comp=suzu) comp[laugh]: {裏返|うらがえ}す だけ で {正解|せいかい} ！ {一番|いちばん} {好|す}き な {種明|たねあ}かし よ 。 || Just turn it over and there's the answer! My favourite kind of reveal.
`, 'cases/30_view');
