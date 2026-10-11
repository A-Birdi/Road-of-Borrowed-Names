/* The Cloudroad, Chapter 10: the High Pass (雲路峠), the Courier's Hut and the chapter's end (expansion P12; plan R2,
 * D1 a floor-by-floor dungeon, D2 a story dungeon's checkpoints and rest hut; the maps are in 11_pass.js).
 *   the Switchbacks   a landslide has taken a turn: round it by the goat path across the scree, and from above, lever
 *                     the log that holds it and the turn is open (a way back down for later)
 *   the Rope Bridge   its notice read (one at a time: cr.bridge_sign) before crossing; the snow shelter beyond: rest at
 *                     the stove while the firewood lasts (three bundles; restocked once the chapter is done), and the
 *                     road keeps your place there whatever the woodpile holds
 *   the Snowfield     half-buried waystones; a drift across the path, dug through
 *   the Courier's Hut what the hut shows (the seal on the letter box unbroken, the sandals by the cold hearth, the note
 *                     on the wall in Genta's own hand), then the courier himself (cr.courier, 33_creatures.js); the
 *                     letter box taken up
 *   the Pass          the cloud sea, and far down to the north-east a valley of steam (Chapter 11's, P13)
 *   the delivery      at Sakashita, to Heisuke: his uncle's letter and the money his father blamed Genta for; the
 *                     chapter's end. Sono and the coins are The Last Courier's Family (25_side.js).
 * ごとに (mod_goto) is taught by Ine at Suginoki, from the relay's own rule (C-74; called from cr.relay1).
 * Companion lines for all four; Suzu's have Kansai versions (kansai_98_cr.js). */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const M = (id) => C.maps[id];
  const npc = (mapId, id) => ((M(mapId) || {}).npcs || []).find((n) => n.id === id);
  // the letter delivered: Heisuke, at Sakashita
  npc('cr.sakashita', 'cr_heisuke').talk.unshift({ if: 'cr_message_taken&!cr_done', scene: 'cr.deliver' });
  // the slide cleared from above (the goat path brings you out just above it)
  M('cr.pass1').triggers.push({ x: 22, y: 22, w: 2, h: 2, scene: 'cr.pass1_clear', if: 'cr_slide_seen&!cr_turn_cleared' });
  // the Pass: the view the first time (the chapter ends at Sakashita, with the letter delivered)
  M('cr.summit').onEnter = [{ scene: 'cr.summit_first', if: '!cr_summit_seen' }];
})(RB.content);

RB.script.add(`
@scene cr.goto
# C-74 (the pattern of ko.arayuru): ごとに, a Protect renewed as each creature acts, from the relay's own rule.
!if mod_goto -> end
cr_ine: {継|つ}ぎ{飛脚|びきゃく} は ね 、 {宿|しゅく} ごと に {走|はし}る {人|ひと} が {替|か}わる の 。 {一人|ひとり} で {全部|ぜんぶ} {走|はし}ったら 、 {倒|たお}れちゃう でしょ 。 || In the relay, the runner changes at every station. One person running the whole way would collapse, wouldn't they.
cr_ine: {宿|しゅく} ごと に {新|あたら}しい {足|あし} 。 {一区間|ひとくかん} ごと に {新|あたら}しい {息|いき} 。 だから {手紙|てがみ} は 、 {山|やま} を {越|こ}えられる の よ 。 || Fresh legs at every station. Fresh breath with every leg. That's how a letter gets over a mountain.
?(comp=nao) comp: …… {宿|しゅく} ごと に 、 か 。 {郵便屋|ゆうびんや} も 、 {町|まち} ごと に {受|う}け{持|も}ち が {違|ちが}う 。 {一人|ひとり} で {全部|ぜんぶ} は {背負|せお}わない 。 || …At every station. Postmen too: a different one for each town. Nobody carries all of it alone.
?(comp=mio) comp[smile]: {薬|くすり} も 、 {一回|いっかい} ごと に {量|りょう} を {決|き}めて {飲|の}みます 。 {少|すこ}し ずつ 、 {毎回|まいかい} 。 || Medicine too: a set amount every time. A little, each time.
?(comp=ren) comp[think]: {灯|ひ} も 、 {一晩|ひとばん} ごと に {芯|しん} を {切|き}ります 。 {守|まも}り も 、 {一回|いっかい} ごと に {新|あたら}しく できる かも しれません 。 || Lamps too: you trim the wick every night. A ward could be made new every time, too, perhaps.
?(comp=suzu) comp[laugh]: {一座|いちざ} も 、 {町|まち} ごと に {出|だ}し{物|もの} を {変|か}える の よ 。 {同|おな}じ {芝居|しばい} じゃ 、 {飽|あ}きられちゃう もの 。 || A troupe changes its programme with every town, too. Do the same play and they get tired of you.
!set mod_goto
!teach mod_goto
:end

@scene cr.pass1_enter
!set cr_pass1_seen
narr: {雲居|くもい} を {出|で}る と 、 {道|みち} は {九十九折|つづらお}り に なった 。 {一|ひと}つ {曲|ま}がる たび に 、 {雲|くも} が {遠|とお}く なる 。 || Beyond Kumoi the road turns into switchbacks. At every turn the clouds fall further away.
narr: {雪|ゆき} が {降|ふ}って いる 。 {峠|とうげ} は 、 まだ {見|み}えない 。 || Snow is falling. The pass is not in sight yet.
?(comp=nao) comp: {飛脚|ひきゃく} は 、 この {坂|さか} を {走|はし}って {登|のぼ}った ん だ 。 …… {信|しん}じられない な 。 || Couriers ran up this slope. …Hard to believe.
?(comp=mio) comp: {息|いき} が {苦|くる}しく なったら 、 すぐ {言|い}って ください ね 。 {高|たか}い {所|ところ} で は 、 {無理|むり} を しない の が {一番|いちばん} です 。 || Tell me straight away if you get short of breath. Up high, the best thing is not to push yourself.
?(comp=ren) comp: {曲|ま}がり{角|かど} に 、 {灯籠|とうろう} が {立|た}って います 。 {昔|むかし} の {人|ひと} は 、 {夜|よる} も ここ を {越|こ}えた ん です ね 。 || There are lanterns at the turns. People used to cross here at night, too.
?(comp=suzu) comp: {花道|はなみち} に して は 、 {長|なが}すぎる わ 。 …… {冗談|じょうだん} よ 。 {行|い}きましょ 。 || Rather long for a walkway to the stage. …Joking. Let's go.
!autosave

@scene cr.pass1_slide
!set cr_slide_seen
narr: {曲|ま}がり{角|かど} が 、 {崩|くず}れた {岩|いわ} で {埋|う}まって いる 。 {上|うえ} の {斜面|しゃめん} から {落|お}ちて きた {土砂|どしゃ} だ 。 || The turn is buried under fallen rock: a slide from the slope above.
narr: {右|みぎ} の {岩場|いわば} に 、 {獣道|けものみち} の よう な {細|ほそ}い {踏|ふ}み{跡|あと} が ある 。 {回|まわ}り{道|みち} できそう だ 。 || To the right, across the scree, a thin track like an animal path. You could go round.
?(comp=nao) comp: {回|まわ}れ 。 {土砂|どしゃ} の {上|うえ} は {歩|ある}く な 。 {足|あし} の {下|した} で {動|うご}く ぞ 。 || Go round. Don't walk on the slide. It moves under your feet.
?(comp=mio) comp: {足元|あしもと} に {気|き} を つけて 。 {捻挫|ねんざ} は 、 {山|やま} で は {一番|いちばん} {多|おお}い {怪我|けが} です 。 || Watch your footing. Sprains are the commonest injury in the mountains.
?(comp=ren) comp: {上|うえ} から {見|み}れば 、 {何|なに} が {止|と}めて いる か {分|わ}かる かも しれません 。 || From above we might see what's holding it.
?(comp=suzu) comp: {大道具|おおどうぐ} が {倒|たお}れた みたい ね 。 {裏|うら} から {回|まわ}りましょ 。 || Like a piece of scenery that's fallen over. Let's go round the back.
!move pc down 1

@scene cr.pass1_clear
narr: {上|うえ} から {見|み}る と 、 {土砂|どしゃ} は {倒|たお}れた {丸太|まるた} {一本|いっぽん} で {止|と}まって いる 。 || From above, you can see the slide is held back by a single fallen log.
!choice
* {丸太|まるた} を {外|はず}す || Lever the log free -> clear
* そのまま に して おく || Leave it as it is -> leave
:clear
!sfx reveal
narr: {丸太|まるた} を {外|はず}す と 、 {岩|いわ} が {音|おと} を {立|た}てて {斜面|しゃめん} を {転|ころ}がり{落|お}ちた 。 {曲|ま}がり{角|かど} が {通|とお}れる よう に なった 。 || You lever the log free, and the rocks go thundering down the scree. The turn is open.
?(comp=nao) comp: これ で {帰|かえ}り は {近道|ちかみち} だ 。 || That's a shorter way back down.
?(comp=mio) comp[smile]: {帰|かえ}り の {人|ひと} も 、 これ で {安心|あんしん} です ね 。 || That'll be a relief for anyone coming down, too.
?(comp=ren) comp: {道|みち} が {一|ひと}つ 、 {戻|もど}りました 。 || A way's been given back.
?(comp=suzu) comp: {幕|まく} が {開|あ}いた わ 。 || The curtain's up.
!set cr_turn_cleared
!refresh
!end
:leave
!move pc left 2

@scene cr.pass1_stone
narr: {道標|みちしるべ} 。 「{九十九折|つづらお}り 。 {急|いそ}ぐ {者|もの} ほど 、 {曲|ま}がり{角|かど} で {休|やす}め 。」 || A waystone: "The switchbacks. The more you hurry, the more you should rest at the turns."
narr: 「{九十九|つづら}」 は {数|かず} で は ない 。 つづら の {蔓|つる} の よう に {曲|ま}がりくねった {道|みち} を 、 {九十九折|つづらお}り と {言|い}う 。 {本当|ほんとう} の {言葉|ことば} だ 。 || The 九十九 here is not a number: a road that winds like a tsuzura vine is called tsuzura-ori. It's a real word.

@scene cr.pass2_enter
!set cr_pass2_seen
!var cr_wood = 3
narr: {谷|たに} を {渡|わた}る {吊|つ}り{橋|ばし} が 、 {風|かぜ} に {揺|ゆ}れて いる 。 {向|む}こう {側|がわ} に 、 {雪|ゆき} に {埋|う}もれ かけた {避難|ひなん}{小屋|ごや} が {見|み}える 。 || A rope bridge sways in the wind across the gorge. On the far side, a snow shelter, half buried.
!sfx wind
?(comp=nao) comp: {吊|つ}り{橋|ばし} か 。 …… {下|した} は {見|み}る な よ 。 || A rope bridge. …Don't look down.
?(comp=mio) comp: {小屋|こや} が ある なら 、 {休|やす}めます ね 。 {薪|まき} が {残|のこ}って いる と いい けど 。 || If there's a shelter we can rest. I hope there's firewood left.
?(comp=ren) comp: {橋|はし} の {袂|たもと} に 、 {札|ふだ} が あります 。 {先|さき} に {読|よ}みましょう 。 || There's a notice at the bridge's end. Let's read it first.
?(comp=suzu) comp: {揺|ゆ}れる {舞台|ぶたい} は {慣|な}れてる けど 、 {谷|たに} の {上|うえ} は {初|はじ}めて よ 。 || I'm used to a stage that wobbles, but not one over a gorge.
!autosave

@scene cr.bridge
narr: {橋|はし} の {袂|たもと} に 、 {古|ふる}い {札|ふだ} が {下|さ}がって いる 。 || An old notice hangs at the end of the bridge.
!challenge cr.bridge_sign
!sfx wind
narr: {札|ふだ} の とおり に 、 {一人|ひとり} ずつ {渡|わた}った 。 {板|いた} が {鳴|な}り 、 {綱|つな} が {軋|きし}む 。 {向|む}こう {岸|ぎし} に {着|つ}く と 、 {膝|ひざ} が {少|すこ}し {笑|わら}って いた 。 || As the notice says, you cross one at a time. The planks creak, the ropes groan. On the far side, your knees are shaking a little.
?(comp=nao) comp: …… {郵便|ゆうびん} の {鞄|かばん} を {背負|せお}って 、 {毎日|まいにち} これ か 。 {飛脚|ひきゃく} は {偉|えら}い な 。 || …Across this every day with a mailbag on your back. Couriers were something.
?(comp=mio) comp: {怖|こわ}かった …… 。 でも 、 {札|ふだ} の とおり に {渡|わた}れば 、 {大丈夫|だいじょうぶ} でした ね 。 || That was frightening… But crossing as the notice said, we were all right.
?(comp=ren) comp: {古|ふる}い {札|ふだ} の {言葉|ことば} が 、 {今|いま} も {人|ひと} を {守|まも}って います 。 || The old notice's words still keep people safe.
?(comp=suzu) comp: {一人|ひとり} ずつ の {花道|はなみち} 。 {揺|ゆ}れる けど 、 {見得|みえ} を {切|き}る {暇|ひま} は なかった わ 。 || A walkway for one at a time. It sways, and there wasn't a moment to strike a pose.
!set cr_bridge_crossed
!refresh

@scene cr.bridge_stone
narr: {橋|はし} の {袂|たもと} の {石|いし} 。 「{昔|むかし} 、 {此|こ}の{橋|はし} 、 {葛|かずら} に て {編|あ}む 。」 || The stone at the bridge's end: "Of old, this bridge was woven of vine."
narr: {昔|むかし} の {山|やま} の {吊|つ}り{橋|ばし} に は 、 {葛|かずら} の {蔓|つる} で {編|あ}んだ もの が あった 。 {本当|ほんとう} の {話|はなし} で 、 {今|いま} も {残|のこ}って いる {所|ところ} が ある 。 || Some mountain rope bridges were once woven from vines (kazurabashi). That's true, and a few still stand.

@scene cr.shelter
# The snow shelter's stove (D2's rest hut, limited uses): a rest while the firewood lasts; your place kept regardless.
!checkpoint
!if cr_done -> rest
!if var.cr_wood=0 -> nowood
narr: {避難|ひなん}{小屋|ごや} の {囲炉裏|いろり} 。 {薪|まき} を {一束|ひとたば} {燃|も}やせば 、 {温|あたた}まって {休|やす}める 。 || The shelter's hearth. Burn a bundle of firewood, and you can warm up and rest.
!choice
* {休|やす}む （{薪|まき} を {一束|ひとたば} {使|つか}う） || Rest (burn a bundle of firewood) -> burn
* {今|いま} は {休|やす}まない || Not now -> no
:burn
!var cr_wood - 1
:rest
!sfx lantern
!heal
narr: {火|ひ} に {当|あ}たって 、 {少|すこ}し {眠|ねむ}った 。 {体|からだ} が {温|あたた}まった 。 || You warm yourself by the fire and sleep a little. You're warm again.
?(cr_done) narr: {雲居|くもい} の {人|ひと} たち が 、 {薪|まき} を {運|はこ}び{上|あ}げて くれて いた 。 || The people of Kumoi have carried firewood up.
!end
:nowood
narr: {薪|まき} が {尽|つ}きた 。 {囲炉裏|いろり} は {冷|つめ}たい 。 それ でも 、 {風|かぜ} は {防|ふせ}げる 。 || The firewood's gone, and the hearth is cold. It still keeps the wind off.
!end
:no

@scene cr.shelter_wood
?(cr_done) narr: {薪|まき} が {高|たか}く {積|つ}んで ある 。 {雲居|くもい} の {人|ひと} たち が {運|はこ}んで くれた の だ 。 || Firewood stacked high: the people of Kumoi have brought it up.
?(!cr_done&var.cr_wood=3) narr: {薪|まき} の {束|たば} が 、 {三|みっ}つ {残|のこ}って いる 。 || Three bundles of firewood left.
?(!cr_done&var.cr_wood=2) narr: {薪|まき} の {束|たば} が 、 {二|ふた}つ {残|のこ}って いる 。 || Two bundles of firewood left.
?(!cr_done&var.cr_wood=1) narr: {薪|まき} の {束|たば} が 、 {一|ひと}つ だけ {残|のこ}って いる 。 || One bundle of firewood left.
?(!cr_done&var.cr_wood=0) narr: {薪|まき} は 、 もう ない 。 || No firewood left.

@scene cr.pass3_enter
!set cr_pass3_seen
narr: {雪原|せつげん} 。 {道|みち} は {雪|ゆき} の {下|した} に {消|き}えて 、 {半分|はんぶん} {埋|う}まった {道標|みちしるべ} だけ が 、 {点々|てんてん} と {続|つづ}いて いる 。 || A snowfield. The road has vanished under the snow; only half-buried waystones go on, one after another.
?(comp=nao) comp: {石|いし} から {石|いし} へ {歩|ある}け 。 {雪|ゆき} の {上|うえ} の {近道|ちかみち} は 、 {近道|ちかみち} じゃ ない 。 || Walk from stone to stone. A short cut across snow is no short cut.
?(comp=mio) comp: {雪|ゆき} の {照|て}り{返|かえ}し が {強|つよ}い です 。 {目|め} を {細|ほそ}めて {歩|ある}いて ください 。 || The glare off the snow is strong. Walk with your eyes narrowed.
?(comp=ren) comp: {道標|みちしるべ} が {灯|ひ} の {代|か}わり です ね 。 {一|ひと}つ ずつ {読|よ}んで {行|い}きましょう 。 || The waystones stand in for lamps up here. Let's read them one by one.
?(comp=suzu) comp: {真|ま}っ{白|しろ} な {舞台|ぶたい} 。 {足跡|あしあと} が {台本|だいほん} ね 。 || A pure white stage. Our footprints are the script.
!autosave

@scene cr.snow_stone1
narr: {雪|ゆき} から {頭|あたま} を {出|だ}した {道標|みちしるべ} 。 「{次|つぎ} の {石|いし} は 、 {窪|くぼ}み を {右|みぎ} に {下|お}りた {先|さき} 。」 || A waystone with its head above the snow: "The next stone: down to the right, past the hollow."

@scene cr.snow_stone2
narr: {道標|みちしるべ} 。 「{吹|ふ}き{溜|だ}まり に {注意|ちゅうい} 。 {雪|ゆき} が {深|ふか}ければ 、 {掘|ほ}って {進|すす}む べし 。」 || A waystone: "Beware of drifts. Where the snow is deep, dig your way through."

@scene cr.snow_stone3
narr: {道標|みちしるべ} 。 「{飛脚|ひきゃく}{小屋|ごや} 、 {近|ちか}し 。」 {字|じ} の {上|うえ} に 、 {継|つ}ぎ{飛脚|びきゃく} の {印|しるし} が {彫|ほ}って ある 。 || A waystone: "The couriers' hut, close by." Above the words, the relay's emblem is carved.

@scene cr.drift
narr: {吹|ふ}き{溜|だ}まり が 、 {道|みち} を {塞|ふさ}いで いる 。 {腰|こし} まで の {雪|ゆき} だ 。 || A drift blocks the way: snow up to your waist.
!choice
* {掘|ほ}って {進|すす}む || Dig through -> dig
* {今|いま} は やめて おく || Not now -> no
:dig
narr: {手|て} で {雪|ゆき} を {掻|か}き{分|わ}けて 、 {少|すこ}し ずつ {進|すす}んだ 。 || You dig the snow aside with your hands and work your way through, bit by bit.
?(comp=nao) comp: {貸|か}せ 。 …… {雪|ゆき} {掻|か}き は 、 {西|にし} の {町|まち} で {毎冬|まいふゆ} やった 。 || Let me. …I shovelled snow every winter in the western town.
?(comp=mio) comp: {手袋|てぶくろ} を どうぞ 。 {霜焼|しもや}け に なります から 。 || Here, gloves. You'll get chilblains otherwise.
?(comp=ren) comp: {灯守|ひもり} の {冬|ふゆ} は 、 {毎朝|まいあさ} {雪|ゆき} {掻|か}き から です 。 {任|まか}せて ください 。 || A keeper's winter starts with digging snow every morning. Leave it to me.
?(comp=suzu) comp: {雪|ゆき} の {大道具|おおどうぐ} 、 {片付|かたづ}け ます よ 。 …… {重|おも}い ！ || Clearing away the snow scenery. …Heavy!
!set cr_drift_cleared
!refresh
!end
:no

@scene cr.hut_enter
# What the hut shows, before the courier: the evidence his versions will be answered with.
!set cr_hut_seen
!quest cr_main 7
narr: {峠|とうげ} の {手前|てまえ} の {鞍部|あんぶ} に 、 {小|ちい}さな {小屋|こや} が ある 。 {飛脚|ひきゃく}{小屋|ごや} だ 。 {戸|と} が {開|あ}いて いる 。 || In the saddle below the pass stands a small hut: the couriers' hut. Its door is open.
narr: {中|なか} を {覗|のぞ}く と 、 {釘|くぎ} に {状箱|じょうばこ} が {掛|か}かって いる 。 {紐|ひも} に は 、 {継|つ}ぎ{飛脚|びきゃく} の {封|ふう} が {付|つ}いた まま だ 。 || Inside, a letter box hangs on a peg, its cord still sealed with the relay's seal.
narr: {冷|つめ}たい {炉|ろ} の {横|よこ} に 、 {草鞋|わらじ} が {一足|いっそく} 、 きちんと {揃|そろ}えて ある 。 || By the cold hearth, a pair of straw sandals, set neatly side by side.
narr: {壁|かべ} に 、 {墨|すみ} の {書|か}き{付|つ}け 。 「{雪|ゆき} {深|ふか}し 。 {晴|は}れ を {待|ま}つ 。 {便|びん} は {濡|ぬ}らさず 。 ゲンタ 」 || On the wall, a note in ink: "Snow deep. Waiting for the clear. Post kept dry. Genta."
?(comp=nao) !gesture comp lookroad up
?(comp=nao) comp: …… {封|ふう} が {切|き}れて いない 。 {飛脚|ひきゃく} は 、 {便|びん} を {捨|す}てて {逃|に}げたり しない 。 {捨|す}てる くらい なら 、 {抱|だ}いて {寝|ね}る 。 || …The seal's not broken. A courier doesn't drop the post and run. He'd sooner sleep with it in his arms.
?(comp=mio) comp: {草鞋|わらじ} を {乾|かわ}かそう と して いた ん です ね 。 {濡|ぬ}れた {足|あし} で {雪|ゆき} の {中|なか} に いたら 、 {凍傷|とうしょう} に なります から 。 || He was trying to dry his sandals. Wet feet in the snow means frostbite.
?(comp=ren) comp: {壁|かべ} の {字|じ} 、 カンベエ さん の {帳面|ちょうめん} の {字|じ} と {同|おな}じ {手|て} です 。 ゲンタ さん が {自分|じぶん} で {書|か}いた もの です 。 || The writing on the wall is the same hand as in Kanbe's ledger. Genta wrote it himself.
?(comp=suzu) comp: {舞台|ぶたい} の {小道具|こどうぐ} が 、 {全部|ぜんぶ} {揃|そろ}ってる わ 。 {誰|だれ} か が 、 {台詞|せりふ} を {忘|わす}れた まま {立|た}って いる みたい 。 || All the props are in place. As if someone's standing there having forgotten his lines.
!checkpoint
!autosave

@scene cr.courier
# The Courier Who Never Arrived (social and folklore, E8): the stations' versions told by himself, answered one by one
# with what the hut shows (cr.courier in 33_creatures.js). Staged: a straw hat, a runner's legs, snow through him.
!if cr_courier_done -> done
narr: {戸口|とぐち} に 、 {誰|だれ} か が {立|た}って いる 。 {笠|かさ} を かぶった {飛脚|ひきゃく} だ 。 {体|からだ} の {向|む}こう に 、 {雪|ゆき} が {透|す}けて {見|み}える 。 || Someone is standing in the doorway: a courier in a straw hat. You can see the snow through him.
cr_genta: …… {雲居|くもい} へ 。 {便|びん} を 、 {雲居|くもい} へ 。 {晴|は}れたら 、 {出|で}る 。 {晴|は}れたら …… 。 || …To Kumoi. The post, to Kumoi. When it clears, I go. When it clears…
cr_genta: {俺|おれ} は …… {逃|に}げた ん だった か 。 {下|した} の {宿|しゅく} で は 、 そう {言|い}って いる 。 || Did I… run off? That's what they say at the stations below.
!encounter cr.courier
!if var._res=0 -> again
!set cr_courier_done
!refresh
narr: {飛脚|ひきゃく} の {姿|すがた} は 、 もう ない 。 {戸口|とぐち} の {雪|ゆき} の {上|うえ} に 、 {状箱|じょうばこ} が {置|お}いて ある 。 || The courier is gone. On the snow by the door lies the letter box.
?(comp=nao) comp: …… {受|う}け{取|と}った 。 {継|つ}ぐ ぞ 。 || …Received. We'll take it on.
?(comp=mio) comp: {暖|あたた}かい {所|ところ} へ {行|い}けた なら 、 いい ん です けど 。 || I hope he's gone somewhere warm.
?(comp=ren) comp: ゲンタ さん 。 …… お{疲|つか}れ さま でした 。 || Genta. …Thank you for your hard work.
?(comp=suzu) comp: {長|なが}い {一人|ひとり} {芝居|しばい} だった わ ね 。 …… {拍手|はくしゅ} 。 || A long one-man show. …Applause.
!autosave
!end
:again
narr: {飛脚|ひきゃく} は 、 {雪|ゆき} の {中|なか} に {薄|うす}れて いった 。 {小屋|こや} の {前|まえ} に {立|た}てば 、 また {現|あらわ}れる だろう 。 || The courier fades into the snow. Stand before the hut again and he'll be back.
!move pc left 2
!end
:done

@scene cr.satchel
narr: {状箱|じょうばこ} を {開|あ}ける と 、 {油紙|あぶらがみ} に {包|つつ}んだ {手紙|てがみ} が {一通|いっつう} と 、 {封|ふう} を した {小|ちい}さな {財布|さいふ} が {入|はい}って いた 。 {五十年|ごじゅうねん} 、 {濡|ぬ}れて いない 。 || Inside the box: a letter wrapped in oiled paper, and a small sealed purse. Fifty years, and dry.
narr: {宛名|あてな} は 、 {薄|うす}れ かけた {字|じ} で 「{坂下宿|さかしたじゅく} 、 {弟|おとうと} へ 」 。 || The address, in fading ink: "Sakashita Station. To my younger brother."
?(comp=nao) comp: …… {坂下|さかした} の ヘイスケ さん の {親父|おやじ} さん だ 。 {兄|あに} から の {便|びん} を 、 {待|ま}って いた 。 || …Heisuke's father. He was waiting for post from his elder brother.
?(!comp=nao&cr_genta_heard) narr: {坂下|さかした} の ヘイスケ が {言|い}って いた 。 {父|ちち} の {兄|あに} が 、 {峠|とうげ} の {向|む}こう から {手紙|てがみ} を {寄越|よこ}す はず だった 、 と 。 || Heisuke at Sakashita said his father's elder brother was supposed to send a letter from over the pass.
?(!comp=nao&!cr_genta_heard) narr: {坂下宿|さかしたじゅく} で {聞|き}けば 、 {誰|だれ} の {弟|おとうと} か {分|わ}かる だろう 。 || Ask at Sakashita, and someone will know whose brother.
!give cr_message
!set cr_message_taken
!quest cr_main 8
!journal {飛脚|ひきゃく}{小屋|ごや} で 、 {最後|さいご} の {便|びん} を {受|う}け{取|と}った 。 {宛先|あてさき} は {坂下宿|さかしたじゅく} 。 ヘイスケ に {届|とど}けよう 。 || At the couriers' hut you took on the last post. It is addressed to Sakashita. Take it to Heisuke.
!autosave

@scene cr.summit_first
!set cr_summit_seen
narr: {峠|とうげ} に {出|で}た 。 {四方|しほう} が {雲|くも} の {海|うみ} だ 。 {登|のぼ}って {来|き}た {道|みち} も 、 {宿場|しゅくば} も 、 みんな {白|しろ}い {下|した} に ある 。 || You come out on the pass. Cloud sea on every side; the road you climbed and all the stations are somewhere under the white.
narr: {北東|ほくとう} の {遥|はる}か {下|した} に 、 {雲|くも} の {切|き}れ{目|め} が ある 。 {谷|たに} から 、 {白|しろ}い {湯気|ゆげ} が {何本|なんぼん} も {立|た}ち{上|のぼ}って いる 。 || Far below to the north-east there's a gap in the cloud. White steam rises from a valley in many columns.
?(comp=nao) comp: {湯気|ゆげ} …… {温泉|おんせん} か 。 {西|にし} で {聞|き}いた こと が ある 。 {湯|ゆ} の {谷|たに} の {話|はなし} 。 || Steam… Hot springs? I heard of it in the west. A valley of hot water.
?(comp=mio) comp: {湯気|ゆげ} の {谷|たに} 。 …… {薬湯|くすりゆ} の {本|ほん} で {読|よ}んだ {所|ところ} かも しれません 。 || A valley of steam. …It might be the place I read about in a book on medicinal baths.
?(comp=ren) comp: {師匠|ししょう} の {地図|ちず} に も 、 {湯気|ゆげ} の {印|しるし} が ありました 。 …… {行|い}って みる {価値|かち} は あります 。 || My master's map had a steam mark there too. …It would be worth going.
?(comp=suzu) comp: {湯治場|とうじば} ね ！ {旅|たび} の {一座|いちざ} の {憧|あこが}れ よ 。 {次|つぎ} の {幕|まく} は 、 あそこ かしら 。 || A spa! Every touring company's dream. Is that where the next act is?

@scene cr.summit_view
narr: {腰掛|こしか}け から 、 {雲|くも} の {海|うみ} が {見|み}える 。 {風|かぜ} が {雲|くも} を {動|うご}かす と 、 {下|した} の {宿場|しゅくば} の {灯|ひ} が 、 {一瞬|いっしゅん} だけ {見|み}えた 。 || From the bench you can see the cloud sea. When the wind moves the cloud, the lamps of the stations below show for a moment.
?(cr_done) narr: {宿場|しゅくば} の {灯|ひ} が 、 {下|した} から {上|うえ} まで 、 {七|なな}つ {全部|ぜんぶ} {点|つ}いて いる 。 || All seven of the stations' lamps are lit, from the bottom of the road to the top.

@scene cr.summit_stone
narr: {峠|とうげ} の {石|いし} 。 「{雲路峠|くもじとうげ} 。 {此処|ここ} より {北東|ほくとう} 、 {湯|ゆ} の {谷|たに} 。」 || The stone on the pass: "The Cloudroad Pass. From here, north-east: the valley of hot springs."
?(item.cr_pilgrimbook&!cr_pilgrim_rubbed) !call cr.pilgrim_rub

@scene cr.summit_east
?(!cr_done) narr: {北東|ほくとう} へ {下|くだ}る {道|みち} 。 {先|さき} に 、 {飛脚|ひきゃく} の {便|びん} を {届|とど}けよう 。 || The way down to the north-east. First, the courier's post needs delivering.
?(cr_done) narr: {北東|ほくとう} へ {下|くだ}る {道|みち} は 、 まだ {深|ふか}い {雪|ゆき} の {下|した} だ 。 {雪|ゆき} が {解|と}けたら 、 {湯気|ゆげ} の {谷|たに} へ {行|い}ける だろう 。 || The way down to the north-east is still deep under snow. Once it melts, the valley of steam will be within reach.
!move pc left 1

@scene cr.deliver
# The last post delivered: Heisuke's uncle's letter to his father, and the money his father blamed Genta for. The
# chapter's end follows (cr.end).
!faceplayer
cr_heisuke: …… {何|なん} だ 、 その {箱|はこ} は 。 {継|つ}ぎ{飛脚|びきゃく} の {封|ふう} …… ？ || …What's that box? The relay's seal…?
narr: {状箱|じょうばこ} を {渡|わた}す と 、 ヘイスケ は {手紙|てがみ} を {開|ひら}いて 、 {長|なが}い {間|あいだ} {黙|だま}って いた 。 || You hand him the box. Heisuke opens the letter, and for a long time says nothing.
cr_heisuke: 「{弟|おとうと} へ 。 {母|かあ}さん の {薬代|くすりだい} を 、 {飛脚|ひきゃく} に {託|たく}す 。 {春|はる} に は {帰|かえ}る 。 {兄|あに} 」 …… || "To my younger brother. I'm sending Mother's medicine money by the courier. I'll be home in spring. Your brother." …
cr_heisuke: {郵便|ゆうびん} の {金|かね} と いう の は 、 これ だった の か 。 ゲンタ は {逃|に}げた ん じゃ ない 。 {五十年|ごじゅうねん} 、 {峠|とうげ} で これ を {守|まも}って いた 。 || So this was the post money. Genta didn't run. For fifty years he kept it safe on the pass.
cr_heisuke: {親父|おやじ} は 、 {死|し}ぬ まで ゲンタ を {恨|うら}んで いた 。 {俺|おれ} も 、 {親父|おやじ} の {話|はなし} を そのまま {人|ひと} に {話|はな}して きた 。 …… {聞|き}いた {話|はなし} を 、 {見|み}た {話|はなし} の よう に な 。 || My father hated Genta till the day he died. And I've been telling his story just as he told it. …A story I heard, told as if I'd seen it.
?(comp=nao) comp: …… {届|とど}いて よかった 。 {遅|おそ}すぎる {手紙|てがみ} なんて 、 ない 。 たぶん 。 || …I'm glad it arrived. There's no such thing as a letter too late. Probably.
?(comp=mio) comp: お{母|かあ}さま の {薬代|くすりだい} …… 。 {五十年|ごじゅうねん} {前|まえ} の {薬|くすり} の {話|はなし} が 、 {今|いま} {届|とど}く なんて 。 || Your mother's medicine money… Word of medicine from fifty years ago, arriving now.
?(comp=ren) comp: {名前|なまえ} が {戻|もど}りました ね 。 {宿場|しゅくば} の {灯|ひ} と {一緒|いっしょ} に 、 ゲンタ さん の {名前|なまえ} も 。 || A name's been given back. Along with the stations' lamps, Genta's name.
?(comp=suzu) comp: {五十年|ごじゅうねん} がかり の {幕切|まくぎ}れ ね 。 …… {台本|だいほん} どおり じゃ なかった けど 、 いい {芝居|しばい} だった わ 。 || A final curtain fifty years in the making. …Not as the script had it, but a good play.
cr_heisuke: ソノ の {宿|やど} へ {行|い}って 、 {頭|あたま} を {下|さ}げて {来|こ}なければ 。 {財布|さいふ} の {金|かね} を どう する か も 、 ソノ と {決|き}める 。 …… {後|あと} で 、 {一緒|いっしょ} に {来|き}て くれる か 。 || I must go to Sono's inn and bow my head. And decide with Sono what to do with the money in the purse. …Will you come with me, later?
!take cr_message
!set cr_delivered
!call cr.end

@scene cr.end
# The chapter's end: the relay runs again; the bridge mended and the ledge cleared by the stations' people.
narr: {雲路|くもじ} の {最後|さいご} の {便|びん} は 、 {五十年|ごじゅうねん} {遅|おく}れて {届|とど}いた 。 || The Cloudroad's last post arrived fifty years late.
narr: その {夜|よる} から 、 {継|つ}ぎ{飛脚|びきゃく} が また {宿場|しゅくば} から {宿場|しゅくば} へ {走|はし}り{出|だ}した 。 {雨|あめ} で {流|なが}れた {橋|はし} も 、 {崖道|がけみち} の {大岩|おおいわ} も 、 {宿場|しゅくば} の {人|ひと} たち が {直|なお}した 。 || From that night the relay ran again, station to station. The people of the stations mended the washed-out bridge and cleared the great rock from the ledge.
!set cr_bridge_mended
!set cr_ledge_cleared
!quest cr_main done
!set cr_done
!travel cloudroad
!journal {最後|さいご} の {飛脚|ひきゃく} の {便|びん} を 、 {坂下宿|さかしたじゅく} に {届|とど}けた 。 {継|つ}ぎ{飛脚|びきゃく} が また {走|はし}って いる 。 {峠|とうげ} の {北東|ほくとう} に は 、 {湯気|ゆげ} の {谷|たに} が ある 。 || You delivered the last courier's post to Sakashita, and the relay runs again. North-east of the pass lies a valley of steam.
?(comp=mio) !call cr.mio_kikue
?(comp=ren) !call cr.ren_lit
?(comp=suzu) !call cr.suzu_reply
!toast {第十章|だいじゅっしょう} {完|かん} || Chapter 10 complete
!autosave
`);
