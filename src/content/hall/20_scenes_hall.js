/* The Hall of a Hundred Tales: the way in, the foyer, the hearths and lanterns (expansion P15; plan 04_DUNGEONS.md D9
 * Lore and Access). After the story Tsuru hands over the hall's key ledger, found at the bottom of her teacher's box
 * ("My teacher's teacher sat the Hundred. Nobody finishes it any more."); with it the Shuttered Hall above the Keepers'
 * Road opens. Inside: ten alcoves, each with its hearth (a checkpoint, lit the first time you reach it), its lantern
 * (relit when its tale is done) and the paper screen into the tale. The tenth, the Hundredth Tale, opens once the nine
 * are relit. Suzu's lines have Kansai versions (src/content/dialect/kansai_99_hall.js). */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  C.items.hall_ledger = { name: { en: 'The Hall\'s key ledger', jp: '{館|やかた} の {鍵帳|かぎちょう}' }, desc: { en: 'An old book of the lantern-keepers\' hall above the Keepers\' Road: the hundred tales it keeps, and the seal of whoever may open its door. Tsuru found it at the bottom of her teacher\'s box.' }, key: true };

  RB.script.add(`
@scene hall.tsuru_ledger
# Tsuru, after the story, in the Lantern Hall: the seed made good (D9 Lore). Her teacher's teacher sat the Hundred.
!faceplayer tsuru
tsuru: {帰|かえ}った かい 。 …… {座|すわ}り な 。 {話|はなし} が ある 。 || Back, are you. …Sit down. I've something to tell you.
tsuru: {灯守|ひもり} の {道|みち} の {上|うえ} に 、 {閉|と}ざされた {館|やかた} が あった だろう 。 「 {百物語|ひゃくものがたり} の {館|やかた} 」 さ 。 || Above the Keepers' Road there was a shuttered hall, wasn't there. "The Hall of a Hundred Tales".
tsuru: {師匠|ししょう} の {師匠|ししょう} は 、 あそこ で {百|ひゃく} の {話|はなし} を {終|お}えた 。 {今|いま} は もう 、 {誰|だれ} も {終|お}えられない 。 || My teacher's teacher sat the Hundred there. Nobody finishes it any more.
!gesture tsuru handover pc
tsuru: これ が 、 あの {館|やかた} の {鍵帳|かぎちょう} だ 。 {師匠|ししょう} の {箱|はこ} の {底|そこ} に あった 。 || This is that hall's key ledger. It was at the bottom of my teacher's box.
!give hall_ledger
!set hall_ledger
tsuru: {百|ひゃく} の {灯|ひ} を 、 {一|ひと}つ ずつ {戻|もど}す 。 {急|いそ}ぐ こと は ない 。 {疲|つか}れたら 、 {帰|かえ}って くれば いい 。 || A hundred lights, put back one at a time. No need to hurry. When you're tired, come home.
?(comp=nao) comp: {百|ひゃく} の {話|はなし} か 。 {一|ひと}つ ずつ なら 、 {届|とど}けられる 。 || A hundred tales. One at a time, we can deliver those.
?(comp=mio) comp[happy]: {一|ひと}つ ずつ 、 ね 。 {急|いそ}がない の なら 、 {私|わたし} も {付|つ}いて {行|い}ける 。 || One at a time. If there's no hurry, I can keep up.
?(comp=ren) comp[think]: {師匠|ししょう} の {師匠|ししょう} の {方|かた} が …… 。 {灯守|ひもり} の {館|やかた} に 、 {入|はい}れる {日|ひ} が {来|く}る と は 。 || Your teacher's teacher… I never thought the day would come when I could enter the keepers' hall.
?(comp=suzu) comp[happy]: {百物語|ひゃくものがたり} ！ {一座|いちざ} の {年寄|としよ}り に {自慢|じまん} できる わ 。 {百本|ひゃっぽん} の {芝居|しばい} を {見|み}た って 。 || A hundred tales! I can boast to the troupe's old-timers: I saw a hundred plays.

@scene hall.door_open
# The Shuttered Hall's door, with the ledger: the rope gives way.
narr: {鍵帳|かぎちょう} を {戸|と} に かざす と 、 しめ{縄|なわ} が 、 ひとりでに ほどけた 。 || You hold the key ledger up to the door, and the sacred rope unties itself.
narr: {重|おも}い {戸|と} が 、 {内側|うちがわ} へ {開|ひら}く 。 {古|ふる}い {木|き} と 、 {油|あぶら} の {匂|にお}い 。 || The heavy door swings inward. Old wood, and lamp oil.
!warp hall.foyer 1 10 right

@scene hall.foyer_first
!set hall_foyer_seen
narr: {長|なが}い {広間|ひろま} 。 {左右|さゆう} に 、 {小|ちい}さな {間|ま} が {十|とお} {並|なら}んで いる 。 どの {間|ま} に も 、 {囲炉裏|いろり} と 、 {消|き}えた {行灯|あんどん} と 、 {紙|かみ} の {戸|と} が ある 。 || A long room. Ten small alcoves face it, on either side. Each holds a hearth, a dark floor lantern, and a paper screen.
narr: {一番|いちばん} {奥|おく} に 、 {掟|おきて} を {書|か}いた {板|いた} と 、 {鍵帳|かぎちょう} を {置|お}く {台|だい} 。 || At the far end, a board with the rules written on it, and a stand for the key ledger.
?(comp=nao) comp: {十|とお} の {戸|と} か 。 {宛先|あてさき} が {十|とお} ある {手紙|てがみ} みたい だ な 。 || Ten doors. Like a letter with ten addresses.
?(comp=mio) comp[worry]: {静|しず}か …… 。 でも 、 {怖|こわ}い {静|しず}か さ じゃ ない 。 {誰|だれ} か が {片付|かたづ}けて 、 {出|で}て {行|い}った {部屋|へや} みたい 。 || So quiet… But not a frightening quiet. Like a room someone tidied before they left.
?(comp=ren) comp[think]: {灯守|ひもり} の {館|やかた} …… 。 {百|ひゃく} の {灯籠|とうろう} を 、 {一|ひと}つ ずつ {話|はなし} で {戻|もど}した 、 と {聞|き}きました 。 || The keepers' hall… They say the apprentices put back a hundred lanterns, one tale at a time.
?(comp=suzu) comp: {十|とお} の {舞台|ぶたい} と 、 {十|とお} の {幕|まく} ね 。 {一幕|ひとまく} ずつ 、 {観|み}て いこう よ 。 || Ten stages, ten curtains. Let's take them one act at a time.

@scene hall.rules
narr: {板|いた} の {掟|おきて} 。 「 {一|いち} 、 {灯|ひ} は {一|ひと}つ ずつ {戻|もど}す こと 。 {二|に} 、 {疲|つか}れたら 、 {帰|かえ}り{灯|び} で {戻|もど}る こと 。 {三|さん} 、 {分|わ}からない とき は 、 {聞|き}く こと 。 」 || The rules on the board: "One: put the lights back one at a time. Two: when you are tired, come back by the return lantern. Three: when you don't understand, ask."
?(prof=F) narr: 「 ひ は ひとつ ずつ もどす 。 つかれたら 、 かえりび で もどる 。 わからない とき は 、 きく 。 」 || "One light at a time. When tired, come back by the return lantern. When you don't understand, ask."

@scene hall.lectern
narr: {台|だい} の {上|うえ} に 、 {鍵帳|かぎちょう} を {開|ひら}いて {置|お}く 。 {十|とお} の {話|はなし} の {名前|なまえ} が {並|なら}んで いる 。 || You set the key ledger open on the stand. The names of ten tales are listed in it.
?(hall.lit=0) narr: {赤|あか}い {判|はん} は 、 まだ {一|ひと}つ も ない 。 || There is no red seal beside any of them yet.
?(hall.lit>=1&hall.lit<10) narr: {戻|もど}った {灯|ひ} の {横|よこ} に 、 {赤|あか}い {判|はん} が {押|お}して ある 。 || Beside each light put back, a red seal has been pressed.
?(hall.lit=10) narr: {十|とお} の {話|はなし} の {横|よこ} に 、 {全部|ぜんぶ} 、 {赤|あか}い {判|はん} 。 || A red seal beside all ten.

@scene hall.gate
narr: しめ{縄|なわ} が {道|みち} を {塞|ふさ}いで いる 。 この {階|かい} の {行灯|あんどん} が {全部|ぜんぶ} {灯|とも}る まで 、 {先|さき} へ は {進|すす}めない らしい 。 || A sacred rope blocks the way. It seems you can't go on until every floor lantern on this level is lit.
?(comp&comp!=ren&comp!=mio) comp: {灯|ひ} が {全部|ぜんぶ} {点|つ}いたら 、 ほどける ん だろう 。 || I expect it unties once all the lights are lit.
?(comp=mio) comp: {灯|ひ} が {全部|ぜんぶ} {点|つ}いたら 、 ほどける ん でしょう ね 。 || I expect it unties once all the lights are lit.
?(comp=ren) comp: {灯|ひ} が {全部|ぜんぶ} {点|つ}いたら 、 ほどける の でしょう 。 || I expect it unties once all the lights are lit.

@scene hall.return
narr: {帰|かえ}り{灯|び} 。 {手|て} を かざす と 、 {館|やかた} の {囲炉裏|いろり} の {火|ひ} が {見|み}える 。 || The return lantern. Hold out your hand, and you can see the fire of the hall's hearth in it.
!hook hall_return
`);

  // ---- per wing: the screen, the hearth, the lantern ---------------------------------------------------------------
  const NUM = ['', '{一|いち}', '{二|に}', '{三|さん}', '{四|よん}', '{五|ご}', '{六|ろく}', '{七|なな}', '{八|はち}', '{九|きゅう}', '{十|じゅう}'];
  const EN = ['', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'];
  let out = '';
  for (let n = 1; n <= 10; n++) {
    const w = 'w' + n, H = C.hallHearths && C.hallHearths[w];
    out += `
@scene hall.door_${w}
!if !hall.${w}.lit -> first
:card
${n === 10 ? `!if !hall.lit>=9 -> sealed
` : ''}!hook hall_card ${w}
!if var._res=0 -> later
!if var._res=2 -> held
!hook hall_enter ${w}
!end
:held
!hook hall_enter ${w} held
!end
:later
narr: {紙|かみ} の {戸|と} から 、 {手|て} を {離|はな}した 。 || You take your hand from the paper screen.
!end
:first
narr: {紙|かみ} の {戸|と} の {向|む}こう に 、 {小|ちい}さな {灯|ひ} が {一|ひと}つ {揺|ゆ}れて いる 。 {第|だい}${NUM[n]} の {灯|ひ} 。 || Beyond the paper screen a small light is wavering. The ${EN[n]} lantern.
!goto card
${n === 10 ? `:sealed
narr: {紙|かみ} の {戸|と} は {冷|つめ}たい 。 {向|む}こう に {灯|ひ} は ない 。 {九|ここの}つ の {灯|ひ} が {戻|もど}る まで 、 {百話目|ひゃくわめ} は {語|かた}られない らしい 。 || The screen is cold, and there is no light beyond it. The hundredth tale, it seems, is not told until the nine lights are back.
` : ''}
@scene hall.hearth_${w}
narr: {囲炉裏|いろり} に {手|て} を かざす 。 {灰|はい} の {下|した} に 、 まだ {火|ひ} が {残|のこ}って いる 。 || You hold your hands over the hearth. Under the ash, the fire is still alive.
${H ? `!checkpoint ${H.map} ${H.x} ${H.y} ${H.dir}` : ''}
!autosave progress

@scene hall.lantern_${w}
!if hall.${w} -> lit
narr: {第|だい}${NUM[n]} の {行灯|あんどん} 。 {消|き}えて いる 。 || The ${EN[n]} floor lantern. It is dark.
!end
:lit
narr: {第|だい}${NUM[n]} の {行灯|あんどん} が 、 {静|しず}か に {灯|とも}って いる 。 || The ${EN[n]} floor lantern burns quietly.
`;
  }
  RB.script.add(out);
})(RB.content);
