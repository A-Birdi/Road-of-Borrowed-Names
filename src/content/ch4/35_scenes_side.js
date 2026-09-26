/* Chapter 4 side quests (prop scenes) and companion banter. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
@scene sb.goat_note
!if quest.sb_goats>=2 -> read
!if quest.sb_goats -> note
narr: {柱|はしら} に 、 {紙|かみ} が {一枚|いちまい} {留|と}めて ある 。 {若|わか}い {人|ひと} の {丸|まる}い {字|じ} だ 。 「 テツジ {伯父|おじ} さん へ 」 。 || A sheet of paper is pinned to the post, in a young person's round handwriting: "To Uncle Tetsuji".
narr: {人|ひと} {宛|あ}て の {書|か}き{置|お}き だ 。 {今|いま} は {読|よ}まない で おこう 。 || It's a note for someone else. You leave it be for now.
!end
:note
narr: {柱|はしら} の {書|か}き{置|お}き 。 「 テツジ {伯父|おじ} さん へ 」 。 テツジ に {頼|たの}まれた の だ から 、 {読|よ}んで も いい だろう 。 || The note on the post: "To Uncle Tetsuji". Tetsuji asked you to look into it, so reading it should be all right.
!challenge sb.c_goat_note
!if var._res=0 -> end
!quest sb_goats 2
?(comp=nao) comp[smirk]: {増|ふ}えた {二頭|にとう} は 、 {迷子|まいご} じゃ なくて {新入|しんい}り だった わけ だ 。 || So the extra two weren't strays. They were newcomers.
?(comp=mio) comp[smile]: {生|う}まれた ばかり …… ！ {母|はは} ヤギ の {具合|ぐあい} も {見|み}て おきたい です ね 。 || Newborns…! I'd like to check on the mother too.
?(comp=ren) comp: {数|かず} の {合|あ}わない {記録|きろく} に は 、 {必|かなら}ず {理由|りゆう} が あります 。 {今回|こんかい} は 、 {良|よ}い {理由|りゆう} でした 。 || When the numbers in a record don't add up, there's always a reason. This time, a good one.
?(comp=suzu) comp[laugh]: {帳簿|ちょうぼ} の {誤差|ごさ} が 、 {出産|しゅっさん} ！ {最高|さいこう} の {決算|けっさん} だ よ 。 || The discrepancy in the books is a birth! Best balance sheet ever.
!end
:read
narr: 「 {夜中|よなか} に モモ が {子|こ}ヤギ を {二匹|にひき} {産|う}みました 。 {二匹|にひき} とも {元気|げんき} です 。 」 {何度|なんど} {読|よ}んで も 、 いい {知|し}らせ だ 。 || "In the night Momo gave birth to two kids. Both are healthy." However many times you read it, it's good news.

@scene sb.sculpt_goat
narr: {雪|ゆき} の ヤギ 。 {寝|ね}そべって いる 。 {角|つの} は {一本|いっぽん} {折|お}れて 、 {足元|あしもと} に {落|お}ちて いる 。 {目|め} は {炭|すみ} 。 || A snow goat, lying down. One horn has broken off and lies at its feet. Its eyes are bits of charcoal.
narr: {札|ふだ} 「 カンタ 。 {寝|ね}て いる ヤギ 。 {角|つの} が {二本|にほん} 。 {目|め} は {炭|すみ} 。 」 || The card: "Kanta. A goat, lying down. Two horns. Charcoal eyes."
?(!quest.sb_snow) narr: {誰|だれ} か の {作品|さくひん} らしい 。 || Someone's handiwork, it seems.

@scene sb.sculpt_obs
narr: {雪|ゆき} の {天文台|てんもんだい} 。 {丸|まる}い {屋根|やね} の {上|うえ} に 、 {赤|あか}い {木|き} の {実|み} が {一|ひと}つ {載|の}って いる 。 {入|い}り{口|ぐち} は {小枝|こえだ} で {描|か}いて ある 。 || A snow observatory. A single red berry sits on top of the round roof. The door is drawn with a twig.
narr: {札|ふだ} 「 チヨ 。 {天文台|てんもんだい} 。 {屋根|やね} は {丸|まる}い 。 {上|うえ} に {赤|あか}い {灯|あか}り 。 {入|い}り{口|ぐち} は {一|ひと}つ 。 」 || The card: "Chiyo. The observatory. Round roof. A red lamp on top. One door."

@scene sb.sculpt_fox
narr: {雪|ゆき} の キツネ 。 {座|すわ}って 、 {横|よこ} を {向|む}いて いる 。 {尻尾|しっぽ} は {細|ほそ}く 、 {短|みじか}い 。 {耳|みみ} は {二|ふた}つ 。 || A snow fox, sitting, facing sideways. Its tail is thin and short. Two ears.
narr: {札|ふだ} 「 ロクタ 。 {座|すわ}って いる キツネ 。 {尻尾|しっぽ} は {体|からだ} より {大|おお}きい 。 」 || The card: "Rokuta. A fox, sitting. Its tail is bigger than its body."
?(comp=suzu) comp: {誇張|こちょう} は {芸|げい} の {基本|きほん} だ けど 、 {札|ふだ} に {書|か}く と {証拠|しょうこ} が {残|のこ}る ね 。 || Exaggeration is the basis of all performance — but write it on a card and there's evidence.
`, 'ch4/side');

RB.script.add(`
@scene sb.bn_nao1
comp: {雪鈴|ゆきすず} の {郵便|ゆうびん}{箱|ばこ} 、 {見|み}た か 。 「 {次|つぎ} の {集荷|しゅうか} ： {雪|ゆき} {解|ど}け の あと 」 。 …… {正直|しょうじき} で いい 。 {来|こ}ない もの を {来|く}る と {書|か}く より 、 ずっと いい 。 || Did you see Snowbell's postbox? "Next collection: after the thaw." …Honest. Much better than writing that something's coming when it isn't.

@scene sb.bn_nao2
comp: ヤギ って の は 、 {数|かぞ}え{間違|まちが}える と {増|ふ}える し 、 {目|め} を {離|はな}す と {減|へ}る 。 {郵便|ゆうびん} と {同|おな}じ だ 。 || Goats multiply when you miscount them and disappear when you look away. Same as mail.

@scene sb.bn_nao3
comp: {寒|さむ}い の は {平気|へいき} だ 。 {平気|へいき} じゃ ない の は 、 {手袋|てぶくろ} を したまま {字|じ} を {書|か}く こと だ な 。 {宛名|あてな} が {全部|ぜんぶ} 、 {酔|よ}っ{払|ぱら}い の {字|じ} に なる 。 || The cold I can handle. What I can't handle is writing with gloves on. Every address comes out like a drunk wrote it.

@scene sb.bn_nao4
comp: {石段|いしだん} の {柱|はしら} の {刻|きざ}み{目|め} 、 {覚|おぼ}えてる か 。 {十五|じゅうご} で {止|と}まってた 。 {下|した} に {行|い}った {子|こ} の {背|せ} は 、 もう {誰|だれ} も {測|はか}って ない 。 …… {灯落|ひおち} で 、 {会|あ}えたら いい な 。 || Remember the notches on the stair post? They stopped at fifteen. Nobody's measured the girl who went down the mountain since. …Hope we find her in Lanternfall.

@scene sb.bn_nao5
comp: {次|つぎ} は {灯落|ひおち} だ 。 …… {鞄|かばん} が {急|きゅう} に {重|おも}く なった {気|き} が する 。 {気|き}の せい だ 。 {気|き}の せい 。 || Lanternfall next. …Feels like my bag just got heavier. My imagination. Just my imagination.

@scene sb.bn_mio1
comp: {雪国|ゆきぐに} の {人|ひと} は 、 しょうが{湯|ゆ} に {蜂蜜|はちみつ} を {入|い}れる んです って 。 {作|つく}り{方|かた} 、 ヤエ さん に {聞|き}いて おかなきゃ 。 …… ラベル は {何|なん} て {書|か}こう かな 。 || People in snow country put honey in their ginger tea. I must ask Yae how she makes it. …What should I write on the label?

@scene sb.bn_mio2
comp[worry]: {指先|ゆびさき} が {白|しろ}く なったら 、 すぐ {言|い}って ね 。 {凍傷|とうしょう} は 、 {痛|いた}く なる {前|まえ} が {一番|いちばん} {危|あぶ}ない の 。 …… {脅|おど}してる わけ じゃ ない のよ 。 {本当|ほんとう} の こと だ から 。 || If your fingertips go white, tell me straight away. Frostbite is most dangerous before it starts to hurt. …I'm not trying to scare you. It's just true.

@scene sb.bn_mio3
comp[smile]: カンタ くん たち の {雪像|せつぞう} 、 {見|み}た ？ {札|ふだ} まで {書|か}いて ある の 。 {子|こ}ども の ころ の わたし と {同|おな}じ 。 {何|なん} に でも ラベル を {貼|は}ってた 。 {猫|ねこ} に も 。 || Did you see Kanta and the others' snow sculptures? They even wrote cards for them. Just like me as a child. I labelled everything. Even the cat.

@scene sb.bn_mio4
comp[think]: {灯落|ひおち} の {人|ひと} たち は 、 「 かしこまりました 」 しか {言|い}わない …… 。 {断|ことわ}れない の って 、 {外|そと} から {見|み}る と 、 こんな に {怖|こわ}い んです ね 。 || The people of Lanternfall only say "certainly"… Being unable to refuse — seen from outside, it's frightening, isn't it.

@scene sb.bn_mio5
comp[smile]: ホシノ さん の {膝|ひざ} の {薬|くすり} 、 ヤエ さん に {預|あず}けて きた わ 。 {飲|の}み{方|かた} を {三回|さんかい} {説明|せつめい} したら 、 「 もう {覚|おぼ}えた 」 って {怒|おこ}られちゃった 。 || I left some medicine for Hoshino's knees with Yae. I explained how to take it three times and she snapped, "I've got it already."

@scene sb.bn_ren1
comp: {雪|ゆき} の {上|うえ} で は 、 {道|みち} が {全部|ぜんぶ} {同|おな}じ に {見|み}えます 。 …… わたし に とって は 、 {雪|ゆき} が {無|な}くて も そう です が 。 || On snow, every road looks the same. …To me they do without snow as well.

@scene sb.bn_ren2
comp: {灯|あか}り の {笠|かさ} に {人|ひと} の {名前|なまえ} を {書|か}く 。 {灯守|ひもり} の {古|ふる}い {記録|きろく} に も 、 {例|れい} は {少|すく}ない です 。 {道|みち} の {名前|なまえ} で は なく 、 {待|ま}って いる {相手|あいて} の {名前|なまえ} 。 …… {美|うつく}しい {違反|いはん} です 。 || Writing a person's name on a lamp shade. There are few examples even in the old keepers' records. Not the name of a road — the name of the one you're waiting for. …A beautiful breach of the rules.

@scene sb.bn_ren3
comp: {鼓星|つづみぼし} は {冬|ふゆ} の {南|みなみ} 。 {師匠|ししょう} は 、 {道|みち} に {迷|まよ}ったら {星|ほし} を {見|み}ろ 、 と {言|い}いました 。 わたし は {星|ほし} を {見|み}て 、 {星|ほし} の {名前|なまえ} は {全部|ぜんぶ} {言|い}えて 、 それ でも {迷|まよ}いました 。 || The Drum Stars stand in the southern winter sky. My teacher said, when lost, look at the stars. I looked, I could name every one, and I was still lost.

@scene sb.bn_ren4
comp[think]: {似顔絵|にがおえ} の {人|ひと} の {外套|がいとう} 、 {継|つ}ぎ{接|は}ぎ だらけ でした ね 。 …… わたし の {外套|がいとう} も 、 {継|つ}ぎ{接|は}ぎ だらけ です 。 {真似|まね} を した の か 、 {偶然|ぐうぜん} か 。 {覚|おぼ}えて いない の が 、 {一番|いちばん} {悔|くや}しい 。 || The coat in the sketch was covered in patches. …So is mine. Did I copy it, or is it chance? Not remembering is what galls me most.

@scene sb.bn_ren5
comp[smile]: {雪鈴|ゆきすず} の {石段|いしだん} の {灯|あか}り 、 {全部|ぜんぶ} {名前|なまえ} が {戻|もど}って いました 。 {記録|きろく} に {写|うつ}して おきます 。 {帰|かえ}り に {迷|まよ}わない よう に 。 …… {冗談|じょうだん} では ありません 。 || Every lantern on Snowbell's stair has its name back. I'll copy them into the records. So I don't get lost on the way back. …That isn't a joke.

@scene sb.bn_suzu1
comp: {鐘|かね} の {音|おと} が 、 {昔|むかし} と {同|おな}じ だった 。 {一座|いちざ} で {来|き}た とき 、 {開演|かいえん} の {合図|あいず} に {借|か}りた の 。 {三回|さんかい} {鳴|な}らしたら 、 ヤギ が {全部|ぜんぶ} {帰|かえ}って きて {大騒|おおさわ}ぎ 。 …… なるほど ね 、 {今|いま} わかった 。 || The bell sounds just like it used to. When I came with the troupe we borrowed it to announce the show. Rang it three times and every goat in the place came home — uproar. …Ah. Now I understand why.

@scene sb.bn_suzu2
comp: {寒|さむ}い {所|ところ} の お{客|きゃく} は 、 {笑|わら}う の が {遅|おそ}い の 。 {口|くち} が {凍|こお}ってる から 。 でも 、 {笑|わら}ったら {長|なが}い 。 {雪鈴|ゆきすず} は 、 そういう {客席|きゃくせき} 。 || Audiences in cold places laugh late. Their mouths are frozen. But once they laugh, they laugh for ages. Snowbell's that kind of house.

@scene sb.bn_suzu3
comp[smirk]: ヤエ さん の {品書|しなが}き 、 「 ツケ は {春|はる} まで 」 。 {雪鈴|ゆきすず} の {人|ひと} は 、 {春|はる} が {来|く}る って {信|しん}じてる んだ ね 。 {帳簿|ちょうぼ} に {書|か}ける ぐらい に 。 || Yae's menu: "Tabs settled in spring." Snowbell people believe spring will come. Enough to write it in the books.

@scene sb.bn_suzu4
comp: ロクタ の キツネ 、 {尻尾|しっぽ} が {大|おお}きかった って {言|い}い{張|は}ってた でしょ 。 あれ 、 {嘘|うそ} じゃ ない よ 。 {昨日|きのう} は {本当|ほんとう} に {大|おお}きかった の 。 {嘘|うそ} と {誇張|こちょう} と {風|かぜ} の せい 。 {見分|みわ}ける の は 、 {難|むずか}しい ね 。 || Rokuta insisted his fox's tail was bigger, remember? He wasn't lying. It really was bigger yesterday. A lie, an exaggeration, or the wind — hard to tell apart.

@scene sb.bn_suzu5
comp[think]: {灯落|ひおち} で は 、 {誰|だれ} も 「 いいえ 」 って {言|い}わない らしい 。 {冗談|じょうだん} の {落|お}ち に も 「 いいえ 」 は {要|い}る のに ね 。 …… {困|こま}った {町|まち} だ 。 {笑|わら}わせ {甲斐|がい} が ありそう 。 || In Lanternfall, apparently nobody says "no". Even a joke needs a "no" for the punchline. …Troublesome town. Should be worth making them laugh.
`, 'ch4/banter');

(function (C) {
  'use strict';
  const B = (comp, scene, cond) => C.banter.push({ comp, map: 'sb.*', if: cond, scene });
  B('nao', 'sb.bn_nao1', '!sb_storm'); B('nao', 'sb.bn_nao2', 'quest.sb_goats'); B('nao', 'sb.bn_nao3', 'sb_morning&!sb_lamp_lit');
  B('nao', 'sb.bn_nao4', 'seen.sb.path_bench'); B('nao', 'sb.bn_nao5', 'sb_lamp_lit');
  B('mio', 'sb.bn_mio1', '!sb_storm'); B('mio', 'sb.bn_mio2', 'sb_morning&!sb_lamp_lit'); B('mio', 'sb.bn_mio3', 'quest.sb_snow');
  B('mio', 'sb.bn_mio4', 'sb_akari_ordered'); B('mio', 'sb.bn_mio5', 'sb_lamp_lit');
  B('ren', 'sb.bn_ren1', null); B('ren', 'sb.bn_ren2', 'quest.sb_lamp>=1'); B('ren', 'sb.bn_ren3', 'sb_dial1');
  B('ren', 'sb.bn_ren4', 'sb_ren_ushio1'); B('ren', 'sb.bn_ren5', 'sb_lamp_lit');
  B('suzu', 'sb.bn_suzu1', 'quest.sb_bell'); B('suzu', 'sb.bn_suzu2', null); B('suzu', 'sb.bn_suzu3', 'seen.sb.inn_menu');
  B('suzu', 'sb.bn_suzu4', 'quest.sb_snow=done'); B('suzu', 'sb.bn_suzu5', 'sb_lamp_lit');
})(RB.content);
