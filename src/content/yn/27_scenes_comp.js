/* Steamhollow, Chapter 11: the companions (expansion P13g; 14_COMPANIONS.md §3–5; 10_STORY.md §8; sealed S4, S14).
 *
 * The evening after the Kettle settles, the valley's disagreement becomes each companion's own (yn.evening):
 *   Mio   her crossroads: Kikue, retiring, offers her the springs' dispensary while they tend Oshige, a ridge woman the
 *         raging water overcame; the night apart ("I'm fine. Go to bed."); at dawn by the terrace footbath she takes
 *         the oldest scrap out of her jar (Kikue's letter of years ago), writes her answer on the back, and apologises
 *         for shutting you out. The road, for now: you wait for her on useless days too.
 *   Suzu  her crossroads: the troupe's show at the little theatre; Koume offers the old act back; the night apart; the
 *         inn's garden in the dark (crickets, frogs), her apology and her reasons; the next morning, the books shown
 *         openly to the troupe (the unfinished matter): hurt, then grateful; Koume laughs first. They part as friends.
 *   Nao   a short quarrel over the mediation (split it by the clock and go; saying yes to everyone isn't helping), and
 *         making up the same evening at the town footbath: apologies both ways (C16), sore feet, sitting still.
 *   Ren   a short quarrel over the mediation (the oldest agreement, exactly as it was), and making up the same evening
 *         among the valley's lanterns with Toki: apologies both ways (C16); the oldest name and the newest on one lamp.
 * A quarrel never lowers Bond; making up is a Bond event (yn:makeup), as are the crossroads, the nights apart and the
 * walk. After the mediation, the town out in yukata (yn.walk): a walk, a quiet confession, and the one earlier romance
 * moment C-67 allows, holding hands only, always the player's choice, answered as a romantic moment or as the closest
 * of friends, both warm, Bond the same either way; then the vow (yn.end).
 * Suzu's lines have Kansai versions (kansai_99_yn.js). */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  for (const id of ['yn.upper', 'yn.lower']) {
    const m = C.maps[id];
    if (m) m.onEnter = (m.onEnter || []).concat([{ scene: 'yn.evening', if: 'yn_evening&!yn_eve_started' }]);
  }
  // Suzu's books, the morning after her night apart: the troupe is leaving
  const lo = C.maps['yn.lower'];
  if (lo) lo.onEnter = lo.onEnter.concat([{ scene: 'yn.suzu_books', if: 'comp=suzu&yn_suzu_back&!yn_suzu_books' }]);
  // Ren among the lanterns, with Toki, the evening of the quarrel
  const up = C.maps['yn.upper'];
  const toki = up && up.npcs.find((n) => n.id === 'yn_toki');
  if (toki) toki.talk.unshift({ if: 'yn_ren_quarrel&!yn_ren_madeup', scene: 'yn.ren_lanterns' });
})(RB.content);

RB.script.add(`
@scene yn.evening
# Dusk after the Kettle: the lanterns come on; each companion's evening.
!set yn_eve_started
!ambience dusk
narr: {谷|たに} に {夕暮|ゆうぐ}れ が {来|き}た 。 {提灯|ちょうちん} が {一|ひと}つ 、 また {一|ひと}つ と {点|つ}いて いく 。 {湯|ゆ} は 、 ちょうど いい {熱|あつ}さ に {戻|もど}った 。 || Dusk comes down into the valley. The lanterns come on one by one. The water is back to just the right heat.
!if comp=mio -> mio
!if comp=suzu -> suzu
!if comp=nao -> nao
!if comp=ren -> ren
!set yn_eve_done
!end
:mio
!call yn.mio_evening
!end
:suzu
!call yn.suzu_evening
!end
:nao
!call yn.nao_evening
!end
:ren
!call yn.ren_evening

@scene yn.mio_evening
# Mio's crossroads (S14): Oshige, overcome when the water ran hot; Kikue and Mio tend her; Kikue's offer.
!faceplayer yn_toki
yn_toki: {薬処|くすりどころ} の キクエ さん が 、 ミオ さん を {呼|よ}んで いる の ！ {尾根|おね} の おばあさん が 、 {湯|ゆ} が {熱|あつ}く なった {時|とき} に {倒|たお}れて …… 。 || Kikue at the dispensary is asking for Mio! An old woman from the ridge collapsed when the water ran hot…
mio[surprise]: {行|い}きます ！ || I'm coming!
!warp yn.dispensary 4 5 up
narr: {布団|ふとん} の {上|うえ} に 、 オシゲ が {横|よこ} に なって いる 。 {顔|かお} が {赤|あか}く 、 {息|いき} が {浅|あさ}い 。 || Oshige lies on the futon, her face flushed, her breathing shallow.
yn_kikue: {湯|ゆ} あたり よ 。 {体|からだ} を {冷|ひ}やして 、 {水|みず} を {少|すこ}し ずつ 。 …… ミオ ちゃん 、 {手|て} を {貸|か}して 。 || Overcome by the heat. Cool her down and give her water a little at a time. …Mio, lend me a hand.
mio[closed]: はい 。 {脇|わき} と {首|くび} を {冷|ひ}やします 。 {水|みず} に は {塩|しお} を ひとつまみ 。 || Yes. I'll cool her underarms and neck. A pinch of salt in the water.
narr: {二人|ふたり} は {言葉|ことば} {少|すく}な に 、 {同|おな}じ {手|て} の {動|うご}き で オシゲ の {世話|せわ} を した 。 || The two of them tend Oshige with few words, their hands moving the same way.
yn_kikue: …… お{母|かあ}さん と {同|おな}じ {手|て} を して いる わ 。 || …You have your mother's hands.
yn_kikue: ミオ ちゃん 。 {私|わたし} は 、 {今年|ことし} で この {店|みせ} を {閉|し}める つもり だった の 。 {目|め} も {手|て} も 、 {年|とし} だ から 。 || Mio. I meant to close this shop this year. My eyes and hands are getting old.
yn_kikue: でも 、 あなた が {継|つ}いで くれる なら 。 {湯|ゆ}ノ{谷|たに} の {薬処|くすりどころ} は 、 {皆|みんな} に {頼|たよ}りに される 。 {落|お}ち{着|つ}いて {暮|く}らせる 。 …… {考|かんが}えて みて くれない ？ || But if you'd take it on… Steamhollow's dispensary: everyone relies on it. You could settle here. …Won't you think about it?
narr: ミオ は {何|なに} も {言|い}わず 、 オシゲ の {額|ひたい} の {手拭|てぬぐ}い を {替|か}えた 。 || Mio says nothing, and changes the cloth on Oshige's forehead.
mio[closed]: …… $name さん 。 {私|わたし} は {大丈夫|だいじょうぶ} です 。 {今夜|こんや} は 、 ここ に います 。 {先|さき} に {休|やす}んで ください 。 || …$name. I'm fine. I'll stay here tonight. Please, go and rest.
!choice
* {待|ま}って いる から 。 || I'll be waiting. -> wait
* {何|なに} か あったら 、 {呼|よ}んで 。 || Call me if you need anything. -> call
:wait
mio[closed]: …… {待|ま}たなくて いい です 。 {大丈夫|だいじょうぶ} です から 。 || …You needn't wait. I'm fine.
!goto out
:call
mio[closed]: {大丈夫|だいじょうぶ} です 。 {本当|ほんとう} に 。 || I'm fine. Really.
:out
!set yn_mio_night
!set yn_apart
!hook co_bond yn:crossroads
!hook comp_away night
narr: {薬処|くすりどころ} の {戸|と} が 、 {静|しず}か に {閉|し}まった 。 || The dispensary door closes quietly behind you.
!journal ミオ は {薬処|くすりどころ} に {残|のこ}った 。 キクエ さん に 、 {店|みせ} を {継|つ}がない か と {言|い}われた の だ 。 {今夜|こんや} は {町|まち} で {過|す}ごし 、 {階段|かいだん} の {下|した} の {部屋|へや} で {休|やす}もう 。 || Mio stayed at the dispensary: Kikue asked her to take it on. Spend the evening in town, then rest in the room under the stairs.

@scene yn.mio_sleep
narr: {布団|ふとん} に {入|はい}って も 、 なかなか {眠|ねむ}れなかった 。 {窓|まど} の {外|そと} で 、 {湯気|ゆげ} が {静|しず}か に {流|なが}れて いく 。 || Even under the covers, sleep is slow to come. Outside the window, the steam drifts quietly by.
!fade out 600
!heal
!fade in 600
narr: {夜明|よあ}け 。 ミオ は {帰|かえ}って いない 。 {帳場|ちょうば} の オキヨ が 、 「{棚田|たなだ} の {方|ほう} へ {歩|ある}いて {行|い}かれました よ 」 と {教|おし}えて くれた 。 || Dawn. Mio isn't back. Okiyo at the desk tells you, "She walked off towards the terraces."
!warp yn.terraces 24 13 right
!call yn.mio_dawn

@scene yn.mio_dawn
# Dawn at the terrace footbath (14_COMPANIONS §5: frogs in the paddies below, a steam vent, a bamboo spout ticking
# into a basin). The oldest scrap in the jar, answered at last; the apology; the road, for now.
!if yn_mio_back -> end
!ambience dawn
!sfx crickets
!hook comp_back
!unset yn_apart
narr: {棚田|たなだ} の {上|うえ} の {足湯|あしゆ} に 、 ミオ が {座|すわ}って いる 。 {下|した} の {田|た} で {蛙|かえる} が {鳴|な}き 、 {筧|かけい} から {湯|ゆ} が ポタン と {落|お}ちる 。 || Mio is sitting at the footbath above the terraces. Frogs are calling in the paddies below; spring water drips from the bamboo spout. Plip.
mio[tired]: …… オシゲ さん 、 {熱|ねつ} が {下|さ}がりました 。 {朝|あさ} まで に は 、 {話|はな}せる よう に なって 。 || …Oshige's fever has gone down. By morning she was able to talk.
narr: ミオ の {膝|ひざ} の {上|うえ} に 、 {札|ふだ} の ない {瓶|びん} が ある 。 {中|なか} から 、 {一番|いちばん} {古|ふる}い {紙切|かみき}れ を {取|と}り{出|だ}した 。 || On Mio's lap is the jar with no label. She takes out the oldest scrap of paper inside.
mio[closed]: {母|はは} が {亡|な}くなった {後|あと} 、 キクエ さん から {来|き}た {手紙|てがみ} です 。 「{湯|ゆ}ノ{谷|たに} へ {学|まな}び に いらっしゃい 。」 …… {葦|あし}ノ{瀬|せ} は {私|わたし} が いないと {困|こま}る 。 でも 、 キクエ さん は {優|やさ}しかった 。 {行|い}く と も {行|い}かない と も 、 {言|い}えなかった 。 || It's the letter Kikue sent after my mother died. "Come to Steamhollow and learn." …Reedwake needed me. But Kikue had been so kind. I couldn't say I'd go, and I couldn't say I wouldn't.
mio[closed]: {昨日|きのう} 、 「{店|みせ} を {継|つ}いで 」 と {言|い}われて 、 {初|はじ}めて {分|わ}かった ん です 。 {私|わたし} は 、 {役|やく}に {立|た}つ から {好|す}かれて いる の が 、 {一番|いちばん} {怖|こわ}かった 。 ここ なら 、 {一生|いっしょう} {役|やく}に {立|た}てる 。 …… だから 、 {怖|こわ}かった 。 || Yesterday, when she asked me to take on the shop, I finally understood. What I was most afraid of was being liked only because I'm useful. Here I could be useful for the rest of my life. …That's why it frightened me.
narr: ミオ は {筆|ふで} を {取|と}り 、 {古|ふる}い {手紙|てがみ} の {裏|うら} に 、 ゆっくり と {書|か}いた 。 || Mio takes up a brush and writes, slowly, on the back of the old letter.
mio: 「キクエ さん へ 。 いつか 、 {学|まな}び に {来|き}ます 。 {住|す}み に は {来|き}ません 。 {今|いま} は 、 {道|みち} を {行|い}きます 。 ミオ 」 || "Dear Kikue. One day I'll come and learn. Not to stay. For now, I'm taking the road. Mio."
mio[sad]: …… {昨夜|ゆうべ} は 、 ごめんなさい 。 「{大丈夫|だいじょうぶ} 」 と {言|い}って 、 {扉|とびら} を {閉|し}めました 。 {一人|ひとり} で {決|き}めたかった 。 でも 、 {待|ま}たせる {必要|ひつよう} は なかった 。 || …I'm sorry about last night. I said "I'm fine" and shut the door on you. I wanted to decide by myself. But there was no need to keep you waiting.
!choice
* {役|やく}に {立|た}たない {日|ひ} も 、 {待|ま}って いる よ 。 || I'll wait for you on useless days too. -> useless
* {謝|あやま}らなくて いい 。 {帰|かえ}って {来|き}て くれた から 。 || No need to apologise. You came back. -> back
:useless
mio[surprise]: …… {役|やく}に {立|た}たない {日|ひ} も 。 || …On useless days too.
mio[smile]: その {言葉|ことば} 、 {瓶|びん} に は {入|い}れません 。 ちゃんと {札|ふだ} を {付|つ}けて 、 {棚|たな} の {一番|いちばん} {前|まえ} に {置|お}きます 。 || I won't put those words in the jar. I'll label them properly and put them at the very front of the shelf.
!goto end2
:back
mio[smile]: …… はい 。 {帰|かえ}って {来|き}ました 。 {次|つぎ} は 、 {閉|し}める {前|まえ} に 、 {一言|ひとこと} {言|い}います 。 || …Yes. I came back. Next time, before I shut a door, I'll say so.
:end2
narr: {筧|かけい} から 、 また {湯|ゆ} が ポタン と {落|お}ちた 。 {田|た} の {蛙|かえる} が 、 {一斉|いっせい} に {黙|だま}って 、 また {鳴|な}き{始|はじ}めた 。 || Another drop falls from the spout. The frogs in the paddies fall silent all at once, then start up again.
!set yn_mio_back
!set yn_mio_crossroads
!set yn_eve_done
!hook co_bond yn:night
!hook co_remember together yn_footbath
:end

@scene yn.suzu_evening
# Suzu's crossroads (S14): the troupe's show; Koume and the old act.
!warp yn.playhouse 8 7 up
narr: {芝居小屋|しばいごや} は {満員|まんいん} だ 。 {尾根|おね} から {来|き}た {人|ひと} たち も 、 {土間|どま} に {座|すわ}って いる 。 || The little theatre is packed. The people from the ridge are sitting on the floor too.
narr: {舞台|ぶたい} の コウメ が 、 {扇|おうぎ} を {落|お}とす {芸|げい} で {大笑|おおわら}い を {取|と}った 。 {客席|きゃくせき} の {一番|いちばん} {後|うし}ろ で 、 スズ が {小|ちい}さく {笑|わら}った 。 || On stage Koume gets a huge laugh with a dropped-fan routine. At the very back, Suzu laughs quietly.
narr: {芝居|しばい} が {終|お}わる と 、 コウメ が {真|ま}っ{直|す}ぐ に {歩|ある}いて {来|き}た 。 || When the show ends, Koume walks straight over.
yn_koume: …… {手紙|てがみ} 、 {届|とど}いた よ 。 {雲路|くもじ} の {飛脚|ひきゃく} が 、 {一言一句|いちごんいっく} {変|か}えず に 、 って {言|い}って た 。 || …Your letter came. The Cloudroad's runner said, not one word changed.
yn_koume: だから {来|き}た の 。 {峠|とうげ} を {越|こ}えて 。 …… スズ 、 {戻|もど}って {来|き}て 。 {二人|ふたり} の {芸|げい} 、 まだ {誰|だれ} も {代|か}わり が できない の 。 || That's why we came. Over the pass. …Suzu, come back. Our act, the two of us. Nobody's been able to take your place.
yn_shinza: {座|ざ} の {席|せき} は 、 {空|あ}けて ある 。 {明日|あした} {出|で}る {時|とき} に 、 {一緒|いっしょ} に {来|く}れば いい 。 || Your place in the company is kept open. Come with us when we leave tomorrow.
suzu[closed]: …… {今夜|こんや} {一晩|ひとばん} 、 {時間|じかん} を ちょうだい 。 || …Give me tonight.
suzu[closed]: $name 。 {先|さき} に {寝|ね}て て 。 {私|わたし} 、 {少|すこ}し {風|かぜ} に {当|あ}たって くる から 。 || $name. Go to bed. I'm going to get some air.
!set yn_suzu_crossroads
!set yn_suzu_night
!set yn_apart
!hook co_bond yn:crossroads
!hook comp_away night
!journal スズ の {一座|いちざ} が 、 {湯|ゆ}ノ{谷|たに} に {来|き}て いた 。 コウメ に {昔|むかし} の {芸|げい} に {戻|もど}って と {言|い}われ 、 スズ は {一人|ひとり} で {出|で}て {行|い}った 。 {階段|かいだん} の {下|した} の {部屋|へや} で {休|やす}もう 。 || Suzu's troupe is in Steamhollow. Koume asked her to come back to their old act, and Suzu went out alone. Rest in the room under the stairs.

@scene yn.suzu_garden
# Suzu's night apart (14_COMPANIONS §5): the inn's back garden in the dark, bell crickets and frogs; her apology, and why.
!ambience night
!sfx crickets
narr: {眠|ねむ}れず に 、 {宿|やど} の {裏庭|うらにわ} へ {出|で}た 。 {鈴虫|すずむし} が {鳴|な}き 、 {池|いけ} で {蛙|かえる} が {答|こた}えて いる 。 || Unable to sleep, you step out into the inn's back garden. Bell crickets sing, and frogs answer from the pond.
!hook comp_back
!unset yn_apart
narr: {庭石|にわいし} の {上|うえ} に 、 スズ が {膝|ひざ} を {抱|かか}えて {座|すわ}って いた 。 || Suzu is sitting on a garden stone, hugging her knees.
suzu[laugh]: …… {見|み}つかっちゃった 。 {寝|ね}て て って {言|い}った のに 。 || …Caught. I told you to go to sleep.
suzu[sad]: ごめんね 。 {心配|しんぱい} させて 。 {笑|わら}って {誤魔化|ごまか}す の 、 {今夜|こんや} は {上手|うま}く できなかった 。 || I'm sorry I worried you. Tonight I couldn't laugh it off the way I usually do.
suzu[closed]: あの {一座|いちざ} は 、 {私|わたし} の {家|いえ} だった 。 {十六|じゅうろく} で {初|はじ}めて {台詞|せりふ} を もらって 、 コウメ と {二人|ふたり} で {漫才|まんざい} を して 。 {笑|わら}い {声|ごえ} が 、 {毎晩|まいばん} {帰|かえ}る {場所|ばしょ} だった 。 || That troupe was my home. At sixteen I got my first lines, and Koume and I did our double act. The laughter was where I came home to, every night.
suzu[closed]: {戻|もど}れば 、 {全部|ぜんぶ} {戻|もど}って くる 。 …… それ を 、 {一晩|ひとばん} だけ {想像|そうぞう} したかった の 。 {断|ことわ}る {前|まえ} に 、 ちゃんと 。 || If I went back, I'd have all of it again. …I wanted one night just to imagine it. Properly, before I say no.
!choice
* {断|ことわ}る の ？ || You're saying no? -> no
* {戻|もど}りたい なら 、 {止|と}めない よ 。 || If you want to go back, I won't stop you. -> free
:no
suzu[smile]: うん 。 {断|ことわ}る 。 …… {次|つぎ} の {幕|まく} の {相方|あいかた} は 、 もう {決|き}めて ある から 。 || Yes. I'm saying no. …I've already chosen my partner for the next act.
!goto end2
:free
suzu[smile]: …… ありがと 。 そう {言|い}って くれる {人|ひと} だ から 、 {離|はな}れられない の よ 。 || …Thanks. It's because you'd say that, that I can't leave.
:end2
suzu[laugh]: {元手|もとで} が かかり{過|す}ぎてる の 。 ここ まで の {旅|たび} 、 ぜんぶ {投資|とうし} よ 。 {今|いま} {降|お}りたら 、 {大損|おおぞん} 。 || The investment's too great. This whole journey's been an investment. Get off now and I'd lose everything.
narr: {鈴虫|すずむし} の {声|こえ} が 、 {二人|ふたり} の {間|あいだ} を {通|とお}って いった 。 || The crickets' song passes between the two of you.
suzu: {明日|あした} の {朝|あさ} 、 {一座|いちざ} に {会|あ}い に {行|い}く 。 {見|み}せなきゃ いけない もの が ある の 。 …… {付|つ}いて {来|き}て くれる ？ || In the morning I'll go and see the troupe. There's something I have to show them. …Will you come with me?
!set yn_suzu_back
!set yn_eve_done
!hook co_bond yn:night
!hook co_remember together yn_garden

@scene yn.suzu_books
# Suzu's unfinished matter (S14): for years she covered the troupe's losses from her own share and told everyone the
# books balanced. She shows them the books, openly. Hurt, then grateful; Koume laughs first; friends.
!set yn_suzu_books
!warp yn.playhouse 8 7 up
narr: {一座|いちざ} は 、 {出発|しゅっぱつ} の {支度|したく} を して いた 。 スズ は 、 {古|ふる}い {帳面|ちょうめん} を {机|つくえ} の {上|うえ} に {置|お}いた 。 || The troupe is packing to leave. Suzu sets an old account book down on the table.
suzu[closed]: {十年|じゅうねん} 、 {一座|いちざ} の {帳面|ちょうめん} を {付|つ}けて きた 。 {誰|だれ} に も {見|み}せなかった 。 {見|み}せない の が 、 {自慢|じまん} だった 。 || I kept the troupe's books for ten years. I never showed them to anyone. I was proud nobody ever saw them.
suzu[closed]: {帳尻|ちょうじり} は {合|あ}って いる って 、 {皆|みんな} に {言|い}って きた 。 {本当|ほんとう} は 、 {足|た}りない {分|ぶん} を 、 {私|わたし} の {取|と}り{分|ぶん} から {埋|う}めて いた の 。 {嵐|あらし} の {後|あと} に {残|のこ}った の も 、 {町|まち} ごと の {借金|しゃっきん} を {返|かえ}す ため 。 || I told everyone the books balanced. In truth I was covering the shortfall from my own share. When I stayed behind after the storm, it was to pay off the debts town by town.
yn_shinza: …… なぜ {言|い}わなかった 。 {一人|ひとり} で {背負|せお}う もの じゃ ない だろう 。 || …Why didn't you tell us? That's not a load for one person.
narr: {誰|だれ} も 、 しばらく {何|なに} も {言|い}わなかった 。 || For a while nobody says anything.
yn_koume: …… ぷっ 。 || …Pfft.
yn_koume: スズ らしい ！ {台本|だいほん} の ない {所|ところ} で 、 {一番|いちばん} {大|おお}きな {芝居|しばい} してる ん だ から ！ || That's so Suzu! Pulling off the biggest act of all where there wasn't even a script!
narr: コウメ が {笑|わら}い{出|だ}す と 、 {一座|いちざ} の {皆|みな} が {泣|な}き {笑|わら}い に なった 。 || When Koume starts laughing, the whole troupe ends up laughing and crying at once.
yn_koume: {帳面|ちょうめん} は 、 これ から {三人|さんにん} で {付|つ}ける 。 {借金|しゃっきん} は 、 {一座|いちざ} {全員|ぜんいん} で {返|かえ}す 。 …… {相方|あいかた} の {話|はなし} は 、 {断|ことわ}られた けど ね 。 || From now on three of us keep the books. The debts, the whole company pays back. …Even if you turned down my offer of the act.
suzu[laugh]: ごめん 。 {新|あたら}しい {相方|あいかた} が 、 もう {隣|となり} に いる の 。 {今度|こんど} 、 {二人|ふたり} の {芸|げい} を {見|み}に {来|き}て 。 || Sorry. My new partner's right here beside me. Come and see our act some time.
yn_koume: {必|かなら}ず 。 {道|みち} の どこ か で 、 また ね 。 || Without fail. Somewhere on the road, see you again.
!hook co_bond yn:settled

@scene yn.nao_evening
# Nao's quarrel over the mediation (10_STORY §8): impatient with ceremony; saying yes to everyone isn't helping.
narr: {部屋|へや} に {戻|もど}る と 、 ナオ が {窓|まど} の {外|そと} の {提灯|ちょうちん} を {見|み}て いた 。 || Back in the room, Nao is looking out of the window at the lanterns.
nao[closed]: {明日|あした} 、 {全員|ぜんいん} を {座|すわ}らせて 、 {全員|ぜんいん} の {話|はなし} を {聞|き}く の か 。 || Tomorrow you're going to sit them all down and listen to every one of them?
nao: {時計|とけい} は {直|なお}った 。 {半日|はんにち} ずつ {分|わ}けて 、 {明日|あした} の {朝|あさ} {出|で}れば いい 。 {全員|ぜんいん} に {口|くち} を {出|だ}させたら 、 {誰|だれ} も {何|なに} も {得|え}ない ぞ 。 || The clock's fixed. Split it half a day each and we leave in the morning. Let everyone have their say and nobody gets anything.
!choice
* {全員|ぜんいん} の {話|はなし} を {聞|き}きたい 。 || I want to hear all of them. -> hear
* {時計|とけい} だけ で は 、 {尾根|おね} の {人|ひと} たち が {困|こま}る 。 || The clock alone leaves the ridge folk out. -> ridge
:hear
nao[angry]: {全員|ぜんいん} に 「はい 」 と {言|い}う の は 、 {助|たす}ける こと じゃ ない 。 {俺|おれ} は それ を 、 {遠回|とおまわ}り して {覚|おぼ}えた ん だ 。 || Saying yes to everyone isn't helping. I learned that the long way round.
!goto out
:ridge
nao[angry]: {分|わ}かってる 。 だが 、 {全部|ぜんぶ} を {背負|せお}う の は 、 お{前|まえ} の {仕事|しごと} じゃ ない 。 {全員|ぜんいん} に 「はい 」 と {言|い}う の は 、 {助|たす}ける こと じゃ ない 。 || I know. But carrying all of it isn't your job. Saying yes to everyone isn't helping.
:out
nao[angry]: …… {勝手|かって} に しろ 。 || …Do as you like.
narr: ナオ は {戸|と} を {開|あ}けて 、 {外|そと} へ {出|で}て {行|い}った 。 || Nao slides the door open and goes out.
!set yn_nao_quarrel
!hook comp_away quarrel
!journal ナオ と {言|い}い{争|あらそ}って しまった 。 ナオ は {外|そと} へ {出|で}て {行|い}った 。 {町|まち} の {足湯|あしゆ} の {方|ほう} へ {行|い}った らしい 。 || You quarrelled with Nao, and Nao went out. Towards the town footbath, it seems.

@scene yn.nao_footbath
# Making up the same evening (C16): apologies both ways; a courier's sore feet; finally sitting still.
!hook comp_back
narr: {足湯|あしゆ} の {端|はし} に 、 ナオ が {座|すわ}って いた 。 {浴衣|ゆかた} の {裾|すそ} を {捲|まく}って 、 {足|あし} を {湯|ゆ} に {入|い}れて いる 。 || Nao is sitting at the end of the footbath, yukata hitched up, feet in the water.
nao[closed]: …… {来|く}る と {思|おも}った 。 || …Thought you'd come.
nao[closed]: さっき は 、 {言|い}い{過|す}ぎた 。 {悪|わる}かった 。 || What I said back there, I went too far. I'm sorry.
!choice
* {私|わたし} も 、 ごめん 。 {話|はなし} を {最後|さいご} まで {聞|き}かなかった 。 || I'm sorry too. I didn't hear you out. -> me
* こちら こそ 、 すみません でした 。 || I'm the one who should apologise. -> polite
:me
nao[smirk]: …… お{互|たが}い さま か 。 || …Even, then.
!goto feet
:polite
nao[smirk]: {丁寧|ていねい} に {謝|あやま}る な よ 。 {余計|よけい} に {居心地|いごこち} が {悪|わる}い 。 || Don't apologise so politely. Makes it more awkward.
:feet
nao: {足|あし} が 、 {痛|いた}かった ん だ 。 {雲路|くもじ} から ずっと 。 {痛|いた}い まま {走|はし}る の は {慣|な}れてる 。 だから 、 {座|すわ}る の が {下手|へた} だ 。 || My feet hurt. All the way from the Cloudroad. I'm used to running on sore feet. So I'm bad at sitting down.
nao[closed]: {全員|ぜんいん} の {話|はなし} を {聞|き}く って の は 、 {座|すわ}って {待|ま}つ って こと だ 。 …… {俺|おれ} が {一番|いちばん} {苦手|にがて} な こと を 、 お{前|まえ} は やろう と して いた 。 それ が 、 {腹|はら} が {立|た}った ん だ と {思|おも}う 。 || Hearing everyone out means sitting and waiting. …You were about to do the thing I'm worst at. I think that's what made me angry.
nao[smile]: {明日|あした} 、 {座|すわ}って {聞|き}け 。 {俺|おれ} も {座|すわ}る 。 {足|あし} を {湯|ゆ} に {入|い}れた まま な 。 || Tomorrow, sit and listen. I'll sit too. With my feet in hot water.
!set yn_nao_madeup
!set yn_eve_done
!hook co_bond yn:makeup
!hook co_remember together yn_footbath

@scene yn.ren_evening
# Ren's quarrel over the mediation: the oldest agreement, exactly as it was ("When lost, go back to the oldest name").
narr: {寄合所|よりあいじょ} の {前|まえ} で 、 レン が {湯分|ゆわ}け の {模型|もけい} の {字|じ} を {写|うつ}して いた 。 || Outside the guild hall, Ren is copying the characters from the divider's model.
ren: 「{湯|ゆ} は {一|ひと}つ 、 {宿|やど} は {二|ふた}つ 」 。 {明日|あした} は 、 この {古|ふる}い {決|き}まり を そのまま {戻|もど}しましょう 。 {迷|まよ}ったら 、 {一番|いちばん} {古|ふる}い {名前|なまえ} に {戻|もど}る 。 {灯守|ひもり} の {教|おし}え です 。 || "One spring, two houses." Tomorrow, let's restore the old agreement exactly as it was. When lost, go back to the oldest name. That's what keepers are taught.
!choice
* でも 、 {古|ふる}い {決|き}まり に は 、 {尾根|おね} の {人|ひと} たち が いない 。 || But the old agreement has no place for the ridge folk. -> ridge
* {谷|たに} は 、 もう {昔|むかし} と {同|おな}じ じゃ ない 。 || The valley isn't what it was. -> changed
:ridge
ren[angry]: …… {古|ふる}い {決|き}まり を 、 {軽|かる}く {見|み}ないで ください 。 それ しか {残|のこ}って いない {人|ひと} も いる ん です ！ || …Don't make light of old agreements. For some people, that's all they have left!
!goto out
:changed
ren[angry]: {変|か}わった から 、 {古|ふる}い もの を {捨|す}てる ん です か 。 {灯守|ひもり} は 、 それ を {一番|いちばん} {見|み}て きました ！ || So because things have changed, we throw the old away? That's exactly what keepers have watched happen, again and again!
:out
narr: レン は {筆|ふで} を {置|お}いて 、 {提灯|ちょうちん} を {点|つ}けて {回|まわ}る トキ の {方|ほう} へ {歩|ある}いて {行|い}った 。 || Ren puts down the brush and walks off towards Toki, who is going round lighting the lanterns.
!set yn_ren_quarrel
!hook comp_away quarrel
!journal レン と {言|い}い{争|あらそ}って しまった 。 レン は 、 {提灯|ちょうちん} を {点|つ}けて いる トキ の {所|ところ} へ {行|い}った 。 || You quarrelled with Ren, who went off to where Toki is lighting the lanterns.

@scene yn.ren_lanterns
# Making up the same evening among the valley's lanterns (C16; R3: Ren, the valley's lanterns).
!hook comp_back
narr: レン が 、 トキ の {隣|となり} で {提灯|ちょうちん} に {火|ひ} を {入|い}れて いた 。 {一|ひと}つ {点|つ}ける たび に 、 {通|とお}り の {名前|なまえ} を {小|ちい}さく {呼|よ}んで いる 。 || Ren is beside Toki, lighting lanterns. With each one, Ren quietly says the name of the street.
ren[closed]: …… すみません でした 。 {言|い}い{方|かた} が きつかった です 。 || …I'm sorry. I spoke too harshly.
!choice
* こちら こそ 、 ごめんなさい 。 {大事|だいじ} な こと を {軽|かる}く {言|い}った 。 || I'm sorry too. I spoke lightly about something that matters. -> me
* {私|わたし} も {言|い}い{過|す}ぎた 。 ごめん 。 || I went too far as well. Sorry. -> me
:me
ren[smile]: …… トキ さん の {提灯|ちょうちん} を {見|み}て いて 、 {分|わ}かりました 。 {古|ふる}い {提灯|ちょうちん} に 、 {新|あたら}しい {通|とお}り の {名前|なまえ} が {書|か}いて ある 。 {両方|りょうほう} で 、 {一|ひと}つ の {灯|ひ} です 。 || …Watching Toki's lanterns, I understood. Old lanterns with the new streets' names on them. Both together make one light.
ren: {一番|いちばん} {古|ふる}い {名前|なまえ} に {戻|もど}る の は 、 {迷|まよ}った {時|とき} です 。 {谷|たに} は 、 {迷|まよ}って いる ん じゃ ない 。 {増|ふ}えた ん です ね 。 || You go back to the oldest name when you're lost. The valley isn't lost. It's grown.
ren[laugh]: {明日|あした} の {取|と}り{決|き}め に 、 {古|ふる}い {時計|とけい} と 、 {新|あたら}しい {湯|ゆ} を 。 …… {私|わたし} が {道|みち} を {間違|まちが}えない {限|かぎ}り 、 {寄合所|よりあいじょ} まで {行|い}けます 。 || In tomorrow's agreement: the old clock, and a new bath. …Provided I don't take a wrong turn, I'll make it to the hall.
!set yn_ren_madeup
!set yn_eve_done
!hook co_bond yn:makeup
!hook co_remember together yn_lanterns

@scene yn.walk
# The evening after the mediation: the town out in yukata; a walk with the companion; a quiet confession; the one
# earlier romance moment (C-63, C-67): holding hands only, the player's choice, answered as romance or as the closest
# of friends, the companion's consent in their own voice, both warm, Bond the same either way. Then the vow (yn.end).
!ambience dusk
narr: その {晩|ばん} 、 {谷|たに} じゅう の {人|ひと} が {浴衣|ゆかた} で {外|そと} に {出|で}た 。 {赤|あか}い {橋|はし} の {上|うえ} を 、 {下駄|げた} の {音|おと} が {行|い}き{来|き} する 。 || That evening the whole valley is out in yukata. The clack of sandals goes back and forth across the red bridge.
?(comp=nao) comp[smirk]: {浴衣|ゆかた} は {走|はし}れない な 。 …… {今夜|こんや} は 、 {走|はし}らなくて いい か 。 || Can't run in a yukata. …Tonight I don't have to.
?(comp=mio) comp[shy]: {浴衣|ゆかた} 、 {左|ひだり} が {上|うえ} です よ 。 …… はい 、 {大丈夫|だいじょうぶ} 。 {似合|にあ}って います 。 || Left over right with a yukata. …There, all right. It suits you.
?(comp=ren) comp[laugh]: {浴衣|ゆかた} の {帯|おび} の {結|むす}び{方|かた} を 、 {三回|さんかい} {間違|まちが}えました 。 {道|みち} より は 、 {少|すく}ない です 。 || I tied my yukata sash wrong three times. Fewer than I take wrong turns.
?(comp=suzu) comp[laugh]: {浴衣|ゆかた} で {橋|はし} の {上|うえ} 。 {芝居|しばい} なら 、 ここ で {花火|はなび} が {上|あ}がる ところ よ 。 || A bridge, in yukata. In a play, this is where the fireworks go up.
!call yn.confess
!if comp=none -> vow
narr: {人込|ひとご}み の {中|なか} で 、 {手|て} と {手|て} が 、 {一度|いちど} {触|ふ}れた 。 || In the crowd, your hands brush once.
!choice
* {手|て} を つなぐ || Take their hand -> hand
* {並|なら}んで {歩|ある}く 。 {一番|いちばん} {親|した}しい {友|とも} と して || Walk on side by side, as the closest of friends -> side
:hand
!set yn_hand
?(comp=nao) comp[shy]: …… {手|て} 、 {冷|つめ}たい な 。 …… いい よ 。 {人込|ひとご}み を {抜|ぬ}ける まで じゃ なくて も 。 || …Your hand's cold. …It's all right. Not just until we're through the crowd.
?(comp=mio) comp[shy]: …… はい 。 {私|わたし} も 、 そう したかった です 。 {離|はな}さないで ください ね 。 {迷子|まいご} に なる と {困|こま}ります から 。 || …Yes. I wanted to as well. Don't let go. It would be terrible to get separated.
?(comp=ren) comp[shy]: …… {迷|まよ}わない よう に 、 です ね 。 いえ 、 それ だけ じゃ ない です 。 …… {嬉|うれ}しい です 。 || …So I don't get lost, is it? No. Not only that. …I'm glad.
?(comp=suzu) comp[shy]: …… ずるい わ ね 。 {台詞|せりふ} を {考|かんが}える {暇|ひま} も くれない で 。 …… うん 。 このまま が いい 。 || …That's not fair. You didn't even give me time to think of a line. …Yes. Like this is good.
!goto vow
:side
!set yn_side
?(comp=nao) comp[smile]: …… ああ 。 それ が {一番|いちばん} {歩|ある}きやすい 。 {隣|となり} に いろ よ 。 || …Yeah. That's the easiest way to walk. Stay beside me.
?(comp=mio) comp[smile]: はい 。 {隣|となり} に いて くれる の が 、 {一番|いちばん} {安心|あんしん} します 。 || Yes. Having you beside me is what makes me feel safest.
?(comp=ren) comp[smile]: {並|なら}んで {歩|ある}けば 、 {迷|まよ}いません 。 …… {一番|いちばん} の {友|とも} が {隣|となり} に いれば 。 || Side by side, I won't get lost. …Not with my best friend beside me.
?(comp=suzu) comp[laugh]: {相方|あいかた} は {並|なら}んで {立|た}つ もの よ 。 {舞台|ぶたい} でも 、 {道|みち} でも 。 || Partners stand side by side. On stage, and on the road.
:vow
!hook co_bond yn:walk
!call yn.end

@scene yn.confess
# The quiet confession, one per companion.
?(comp=nao) comp[closed]: …… {一|ひと}つ {言|い}って おく 。 {道|みち} が {怖|こわ}い と {思|おも}った こと は ない 。 でも 、 あの {尾根|おね} の {上|うえ} は 、 {怖|こわ}い 。 {次|つぎ} の {手紙|てがみ} が ない {場所|ばしょ} だ から だ 。 || …One thing. I've never once been afraid of a road. But up past that ridge scares me. Because it's a place where there's no next letter.
?(comp=mio) comp[closed]: {役|やく}に {立|た}つ から {一緒|いっしょ} に いる の か な 、 って 、 ずっと {思|おも}って いました 。 でも 、 {昨夜|ゆうべ} 、 {何|なに} も {治|なお}す もの が ない のに 、 {待|ま}って いて くれた 。 …… もう 、 {思|おも}いません 。 || I always wondered if you kept me around because I'm useful. But last night you waited for me, with nothing to cure. …I won't wonder any more.
?(comp=ren) comp[closed]: {見習|みなら}い の {頃|ころ} 、 {迷|まよ}って 、 {灯|ひ} を {一|ひと}つ {消|け}して しまった {夢|ゆめ} を 、 {今|いま} でも {見|み}ます 。 …… {今夜|こんや} は 、 {全部|ぜんぶ} の {灯|ひ} が {点|つ}いて いて 、 {一度|いちど} も {思|おも}い{出|だ}しません でした 。 || I still dream of the lamp that went out when I got lost as an apprentice. …Tonight, with every lamp lit, I didn't think of it once.
?(comp=suzu) comp[closed]: ねえ 。 {一座|いちざ} に {戻|もど}らない って {決|き}めた の 、 {後悔|こうかい} して ない わ よ 。 {元手|もとで} が かかり{過|す}ぎてる って {言|い}った けど 。 …… {本当|ほんとう} は 、 {一緒|いっしょ} に {舞台|ぶたい} に {立|た}ちたい {人|ひと} に 、 {久|ひさ}しぶり に {会|あ}えた から よ 。 || Listen. I don't regret deciding not to go back to the troupe. I said the investment was too great. …The truth is, it's the first time in ages I've met someone I want to share a stage with.
`);
