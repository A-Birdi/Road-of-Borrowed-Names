/* Chapter 2 companion banter (talk to your companion in Saltglass and the
 * Drowned Archive). Five scenes per companion, gated by story progress. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
@scene sg.b_nao_labels
comp: …… {笑|わら}う な よ 。 {書|か}き{直|なお}した {宛名|あてな} の {札|ふだ} 、 {全部|ぜんぶ} {取|と}って ある ん だ 。 || …Don't laugh. I've kept every address label I ever had to rewrite.
pc: {全部|ぜんぶ} ？ || Every one?
comp: {雨|あめ} で {滲|にじ}んだ やつ 、 {破|やぶ}れた やつ 。 {書|か}き{直|なお}した {方|ほう} じゃ なくて 、 {元|もと} の {方|ほう} を 。 {誰|だれ} か が {一生懸命|いっしょうけんめい} {書|か}いた {字|じ} を {捨|す}てる の は 、 {嫌|いや} で さ 。 || The rain-smudged ones, the torn ones. Not the copies I made — the originals. I hate throwing away writing someone worked hard on.
comp[smirk]: {鞄|かばん} が {重|おも}い の は 、 その せい 。 …… {他|ほか} の {理由|りゆう} も ある けど な 。 || That's why my bag's so heavy. …Among other reasons.

@scene sg.b_nao_exits
comp: この {宿|やど} 、 {出口|でぐち} が {二|ふた}つ ある 。 {表|おもて} と 、 {台所|だいどころ} の {裏|うら} 。 || This inn has two exits. The front, and out the back through the kitchen.
pc: いつも {出口|でぐち} を {数|かぞ}えてる よ ね 。 || You're always counting exits.
comp: {配達人|はいたつにん} は 、 {犬|いぬ} に {追|お}われる こと が ある ん だ よ 。 {本当|ほんとう} に 。 {三回|さんかい} ある 。 || Couriers get chased by dogs. Really. Three times.
comp[smirk]: {四回目|よんかいめ} は ない 。 {出口|でぐち} を {数|かぞ}える よう に なって から は な 。 || There hasn't been a fourth. Not since I started counting exits.

@scene sg.b_nao_isamu
comp: {丘|おか} の {上|うえ} の 、 {西|にし} の {家|いえ} 。 …… {気|き} に なる なら 、 {寄|よ}って も いい 。 {中|なか} に は {誰|だれ} も いない けど な 。 || The house up the hill on the west side. …If it bothers you, we can stop by. No one's inside, though.
pc: {知|し}り{合|あ}い の {家|いえ} ？ || Someone you know?
comp[closed]: {配達先|はいたつさき} だった 。 それ だけ 。 || It was on my round. That's all.

@scene sg.b_nao_archive
comp: {届|とど}かなかった {手紙|てがみ} の {墓場|はかば} 、 か 。 {配達人|はいたつにん} に とって は 、 {最悪|さいあく} の {場所|ばしょ} だ な 。 || A graveyard for letters that never arrived. The worst place in the world for a courier.
comp[think]: …… でも 、 {少|すこ}し {分|わ}かる 。 {届|とど}ける の が {怖|こわ}い {手紙|てがみ} は 、 {棚|たな} に {置|お}いて おきたく なる 。 || …But I understand it a little. With a letter you're afraid to deliver, you want to leave it on a shelf.

@scene sg.b_nao_after
comp: {次|つぎ} は {灰実|はいみ} の {里|さと} か 。 {果物|くだもの} の {配達|はいたつ} で 、 {何度|なんど} か {行|い}った 。 {坂|さか} が {多|おお}い ぞ 。 || Cinder Orchard next. I've been a few times delivering fruit. Lots of hills.
comp: …… {灯落|ひおち} は 、 もっと {先|さき} だ 。 {分|わ}かってる 。 || …Lanternfall's further on. I know.

@scene sg.b_mio_labels
comp: ラベル が {勝手|かって} に {変|か}わる の 、 {薬屋|くすりや} に とって は {一番|いちばん} {怖|こわ}い こと なの 。 || Labels changing by themselves is the most frightening thing there is for an apothecary.
comp[worry]: {咳止|せきど}め と {眠|ねむ}り{薬|ぐすり} を {間違|まちが}えたら …… 。 {瓶|びん} に {焼|や}き{印|いん} を {入|い}れよう かな 。 || Mix up cough syrup and a sleeping draught and… Maybe I should brand my bottles.
pc: ガラス に {焼|や}き{印|いん} は {難|むずか}しい よ 。 || Branding glass is hard.
comp[smile]: {知|し}ってる 。 アサヒ さん に {相談|そうだん} して みる 。 || I know. I'll ask Asahi about it.

@scene sg.b_mio_fish
comp: {干物|ひもの} の {匂|にお}い 。 …… {母|はは} は {毎年|まいとし} 、 {潮硝子|しおがらす} から {干物|ひもの} を {取|と}り{寄|よ}せて いた の 。 || The smell of dried fish. …Every year my mother had dried fish sent from Saltglass.
comp: {病気|びょうき} に なって から も 、 {干物|ひもの} だけ は おいしい って 。 わたし の {薬|くすり} より 、 {効|き}いた かも 。 || Even after she fell ill, she said the dried fish still tasted good. It probably did her more good than my medicine.
comp[smile]: {一枚|いちまい} {買|か}って いこう かな 。 …… {鞄|かばん} が {臭|くさ}く なる って 、 {誰|だれ} か に {言|い}われ そう 。 || Maybe I'll buy one. …Someone's bound to tell me my bag will stink.

@scene sg.b_mio_temper
comp[shy]: …… さっき の 、 {言|い}い{過|す}ぎた かな 。 {飴|あめ} の {話|はなし} 。 || …Did I go too far back there? The sweeties thing.
pc: ゲンゾウ さん 、 ちょっと {嬉|うれ}しそう だった よ 。 || Genzō looked rather pleased, actually.
comp[angry]: {子|こ}ども {扱|あつか}い される の が 、 {一番|いちばん} {嫌|きら}い なの 。 {薬|くすり} を {調合|ちょうごう} して {十五年|じゅうごねん} よ 。 {飴|あめ} って 。 {飴|あめ} って ！ || Being treated like a child is the thing I hate most. Fifteen years mixing medicines. "Sweeties." Sweeties!
comp[laugh]: …… ふう 。 {膝|ひざ} の {湿布|しっぷ} 、 {置|お}いて こよう 。 || …Phew. I'll go and leave him a poultice for those knees.

@scene sg.b_mio_archive
comp[worry]: {全部|ぜんぶ} 、 {誰|だれ} か が {誰|だれ} か に {書|か}いた {手紙|てがみ} なん だ よ ね 。 || Every one of these is a letter someone wrote to someone.
comp: {片付|かたづ}けたい 。 {宛先|あてさき} ごと に {分|わ}けて 、 {届|とど}けたい 。 …… {変|へん} な {癖|くせ} だ よ ね 。 || I want to tidy them. Sort them by address and deliver them. …A strange habit, I know.
pc: この {書庫|しょこ} も 、 {片付|かたづ}けて いる つもり なん だろう ね 。 || This archive probably thinks it's tidying too.
comp[think]: …… うん 。 {片付|かたづ}ける の と 、 {仕舞|しま}い{込|こ}む の は 、 {違|ちが}う 。 {気|き}を つける 。 || …Yes. Tidying and hiding away aren't the same thing. I'll be careful.

@scene sg.b_mio_after
comp: ねぇ 、 $name 。 わたし 、 {今日|きょう} {一回|いっかい} だけ 「いいえ 」 って {言|い}えた の 。 || Hey, $name. Today I managed to say "no". Just once.
pc: {誰|だれ} に ？ || To whom?
comp[smile]: タマエ さん が 、 {干物|ひもの} を {十枚|じゅうまい} くれよう と した から 。 「{三枚|さんまい} で {十分|じゅうぶん} です 」 って 。 …… {大進歩|だいしんぽ} でしょう ？ || Tamae tried to give me ten dried fish. I said, "Three is plenty." …Huge progress, right?

@scene sg.b_ren_lanterns
comp: {港|みなと} の {灯籠|とうろう} は 、 {灯|ひ} の {道|みち} の {灯籠|とうろう} と {形|かたち} が {違|ちが}います 。 {笠|かさ} が {低|ひく}い 。 {潮風|しおかぜ} で {火|ひ} が {消|き}えない よう に 。 || The harbour lanterns are shaped differently from the lantern-road ones. The shades sit lower, so the sea wind can't blow the flame out.
comp[smile]: {土地|とち} ごと に 、 {灯|ひ} の {守|まも}り{方|かた} が ある 。 {記録|きろく} して おきます 。 || Every place has its own way of keeping a flame. I'll make a record.
pc: {記録|きろく} 、 {何冊目|なんさつめ} ？ || Which volume are you on?
comp: {十七冊目|じゅうななさつめ} です 。 {一冊目|いっさつめ} は 、 {師匠|ししょう} の {字|じ} で {始|はじ}まって います 。 || The seventeenth. The first begins in my master's handwriting.

@scene sg.b_ren_puns
comp: $name 。 {港|みなと} に ちなんだ {冗談|じょうだん} を 、 {一|ひと}つ {考|かんが}えました 。 || $name. I've thought of a joke fit for a harbour.
pc: …… どうぞ 。 || …Go on.
comp: 「{灯台下暗|とうだいもとくら}し 」 。 {灯台|とうだい} の {下|した} は {暗|くら}い 。 {近|ちか}く の こと ほど {見|み}えない 、 と いう {意味|いみ} です 。 || "Tōdai moto kurashi" — it's darkest at the foot of the tōdai: the nearer something is, the harder it is to see.
comp: ただし 、 この {言葉|ことば} の {灯台|とうだい} は {海|うみ} の {灯台|とうだい} では なく 、 {昔|むかし} の {油|あぶら} の {明|あ}かり を {載|の}せる {台|だい} の こと です 。 …… {冗談|じょうだん} の はず が 、 {豆知識|まめちしき} に なって しまいました 。 || Though the tōdai in this saying isn't a lighthouse at all — it's the old stand that held an oil lamp. …It was meant to be a joke and turned into trivia.

@scene sg.b_ren_directions
comp[shy]: {打|う}ち{明|あ}けます と 、 {私|わたし} は {入|い}り{江|え} の {方角|ほうがく} を 、 まだ {分|わ}かって いません 。 || I confess I still don't know which direction the cove is.
pc: {東|ひがし} だ よ 。 || It's east.
comp: {東|ひがし} 。 {日|ひ} の {昇|のぼ}る ほう 。 …… {今|いま} は {昼|ひる} です 。 {日|ひ} は {真上|まうえ} です 。 || East. Where the sun rises. …It's noon. The sun is directly overhead.
comp[smile]: {灯|ひ} の {道|みち} が あれば 、 {迷|まよ}いません 。 {灯守|ひもり} が {灯|ひ} を {守|まも}る の は 、 {自分|じぶん} の ため でも ある の です 。 || Give me a lantern road and I never get lost. Keepers tend the lights partly for their own sake.

@scene sg.b_ren_archive
comp: {灯|あか}り の {色|いろ} が 、 {灯守|ひもり} の {灯|ひ} と {同|おな}じ です 。 {誰|だれ} か が 、 {灯守|ひもり} の {作法|さほう} で {灯|とも}して いる 。 || The lamplight is the same colour as a keeper's flame. Someone lit these the way keepers are taught.
comp[worry]: {師匠|ししょう} も 、 この {色|いろ} の {灯|ひ} を {灯|とも}して いました 。 …… {顔|かお} は {思|おも}い{出|だ}せない のに 、 {灯|ひ} の {色|いろ} は {覚|おぼ}えて いる 。 {変|へん} です ね 。 || My master lit flames this colour too. …I can't recall the face, but I remember the colour of the flame. Strange, isn't it.

@scene sg.b_ren_after
comp: {北|きた} の {道|みち} の {灯籠|とうろう} 、 {名前|なまえ} が {戻|もど}って いました 。 {灯守|ひもり} と して は 、 {一安心|ひとあんしん} です 。 || The lantern at the fork has its name back. As a keeper, I'm relieved.
comp: {次|つぎ} の {町|まち} まで は 、 {灯|ひ} が {続|つづ}いて いる はず です 。 {迷|まよ}いません 。 {今度|こんど} こそ 。 || The road to the next town should be lit all the way. I won't get lost. Not this time.
pc: {前|まえ} も そう {言|い}ってた よ 。 || You said that last time.
comp[shy]: {記録|きろく} に は 、 {残|のこ}って いません 。 || There's no record of that.

@scene sg.b_suzu_accounts
comp: {旅|たび} の {費用|ひよう} 、 {付|つ}けてる ？ {宿代|やどだい} 、 {食事|しょくじ} 、 {渡|わた}し{船|ぶね} 。 || Are you keeping track of our travel costs? Lodging, meals, ferries.
pc: {付|つ}けて ない 。 || No.
comp[surprise]: {信|しん}じられない ！ …… {貸|か}して 。 {今日|きょう} から あたし が {付|つ}ける 。 {銅貨|どうか} {一枚|いちまい} {単位|たんい} で 。 || Unbelievable! …Hand it over. From today I'm keeping the accounts. To the last copper.
comp[smirk]: {意外|いがい} ？ {芸人|げいにん} は ね 、 {数字|すうじ} に {強|つよ}く ない と {生|い}きて いけない の よ 。 || Surprised? A performer who's bad with numbers doesn't last.

@scene sg.b_suzu_debt
comp: タマエ さん ！ {三年|さんねん} {前|まえ} の {銅貨|どうか} {三枚|さんまい} 、 {利子|りし} を つけて {返|かえ}しに {来|き}た わ 。 || Tamae! I've come to pay back those three coppers from three years ago. With interest.
tamae[surprise]: …… あんた 、 あの {時|とき} の {旅芸人|たびげいにん} かい ！ {忘|わす}れてた よ 。 || …You're that travelling performer! I'd forgotten all about it.
comp[smile]: あたし は {忘|わす}れない の 。 {借|か}り は ね 。 || I don't forget. Not debts.
tamae[laugh]: {変|か}わった {人|ひと} だ ねぇ ！ {利子|りし} は いらない よ 。 {代|か}わり に 、 {今夜|こんや} {一曲|いっきょく} やって おくれ 。 || What an odd one you are! Keep the interest. Sing us a song tonight instead.

@scene sg.b_suzu_lies
comp: ワタル くん の {嘘|うそ} 、 {悪|わる}い {嘘|うそ} だった と {思|おも}う ？ || Do you think Wataru's lie was a bad lie?
pc: {人|ひと} が {危|あぶ}なかった 。 {悪|わる}い {嘘|うそ} だ よ 。 || People were in danger. It was a bad one.
comp[closed]: そう ね 。 …… じゃあ 、 {誰|だれ} も {危|あぶ}なく ない {嘘|うそ} なら ？ {誰|だれ} か を {笑|わら}わせる ため の 、 {泣|な}かせない ため の {嘘|うそ} なら ？ || Yes. …Then what about a lie that puts no one in danger? One told to make someone smile — to keep them from crying?
comp[smile]: …… {答|こた}え なくて いい わ 。 {今|いま} の は 、 {稽古|けいこ} の {台詞|せりふ} 。 || …You don't have to answer. That was just a line I'm rehearsing.

@scene sg.b_suzu_archive
comp: {紙|かみ} の {鶴|つる} 、 {折|お}り{方|かた} が {上手|じょうず} ね 。 {一座|いちざ} の {子|こ} たち に {教|おし}えた こと が ある の 。 {千羽|せんば} {折|お}ったら {願|ねが}い が {叶|かな}う って 。 || Those cranes are nicely folded. I taught the troupe's children once. Fold a thousand and your wish comes true, I told them.
comp[closed]: …… {嘘|うそ} じゃ ない わ よ 。 {叶|かな}う {気|き} が する 、 って いう の は {本当|ほんとう} だ から 。 || …That wasn't a lie. It's true that it feels like it will.

@scene sg.b_suzu_after
comp: {次|つぎ} は {灰実|はいみ} の {里|さと} ね 。 {祭|まつ}り の {舞台|ぶたい} が ある {町|まち} よ 。 {前|まえ} は {毎年|まいとし} {出|で}てた 。 || Cinder Orchard next. The town with the festival stage. I used to perform there every year.
pc: {今|いま} は ？ || And now?
comp[smile]: …… {久|ひさ}しぶり に 、 {出|で}て みよう かな 。 {客席|きゃくせき} に 、 {会|あ}わなきゃ いけない {人|ひと} が いる の 。 || …Maybe it's time I did again. There's someone in the audience I need to face.
`, 'ch2/25_banter');

(function (C) {
  'use strict';
  const B = (comp, map, cond, scene) => C.banter.push({ comp, map, if: cond, scene });
  B('nao', 'sg.*', 'quest.sg_main<=3', 'sg.b_nao_labels');
  B('nao', 'sg.inn', null, 'sg.b_nao_exits');
  B('nao', 'sg.harbor', '!sg_nao_isamu&quest.sg_main>=1', 'sg.b_nao_isamu');
  B('nao', 'sg.da_*', null, 'sg.b_nao_archive');
  B('nao', 'sg.*', 'sg_boss_done', 'sg.b_nao_after');
  B('mio', 'sg.*', 'quest.sg_main<=3', 'sg.b_mio_labels');
  B('mio', 'sg.harbor', null, 'sg.b_mio_fish');
  B('mio', 'sg.lighthouse', 'seen.sg.genzo_grump', 'sg.b_mio_temper');
  B('mio', 'sg.da_*', null, 'sg.b_mio_archive');
  B('mio', 'sg.*', 'sg_boss_done', 'sg.b_mio_after');
  B('ren', 'sg.harbor', null, 'sg.b_ren_lanterns');
  B('ren', 'sg.*', 'quest.sg_main>=2', 'sg.b_ren_puns');
  B('ren', 'sg.*', 'quest.sg_cove>=1', 'sg.b_ren_directions');
  B('ren', 'sg.da_*', null, 'sg.b_ren_archive');
  B('ren', 'sg.*', 'sg_boss_done', 'sg.b_ren_after');
  B('suzu', 'sg.*', 'quest.sg_main<=3', 'sg.b_suzu_accounts');
  B('suzu', 'sg.inn', null, 'sg.b_suzu_debt');
  B('suzu', 'sg.*', 'sg_wataru_resolved', 'sg.b_suzu_lies');
  B('suzu', 'sg.da_*', null, 'sg.b_suzu_archive');
  B('suzu', 'sg.*', 'sg_boss_done', 'sg.b_suzu_after');
})(RB.content);
