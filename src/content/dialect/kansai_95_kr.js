/* Suzu's Kansai-ben: the Keepers' Road, Chapter 7 (expansion P10). The road, the lodge, the cave and the vigil.
 * Format and rules: src/lang/85_dialect.js, docs/dialect/suzu_kansai.md.
 * "=" the standard line as authored (the key: its Japanese); ">" the Kansai version. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.dialect.add('kansai', `
@ kr/road [kr.hayate_road]
= {遠回|とおまわ}り も 、 {旅|たび} の うち よ 。 || The long way round is part of the trip too.
> {遠回|とおまわ}り も 、 {旅|たび} の うち や で 。 || The long way round is part of the trip too.
@ kr/road [kr.arrive]
= {暗|くら}い {花道|はなみち} ね 。 …… {誰|だれ} か が 、 {灯|あか}り を {入|い}れ{忘|わす}れた みたい 。 || A dark runway. …As if someone forgot to bring the lights up.
> {暗|くら}い {花道|はなみち} や な 。 …… {誰|だれ} か が 、 {灯|あか}り {入|い}れ{忘|わす}れた みたい や 。 || A dark runway. …As if someone forgot to bring the lights up.
@ kr/road [kr.toro_foot]
= {一|ひと}つ {目|め} の {灯|あか}り 、 {入|はい}りました ！ {幕|まく} が {開|あ}いた わ 。 || First light up! The curtain's open.
> {一|ひと}つ {目|め} の {灯|あか}り 、 {入|はい}りました ！ {幕|まく} が {開|あ}いた で 。 || First light up! The curtain's open.
@ kr/road [kr.fox_arrive]
= {子供|こども} の {歌|うた} って 、 {古|ふる}い {話|はなし} が {残|のこ}って いる こと が ある の よ 。 {覚|おぼ}えて おこう 。 || Children's songs sometimes keep old stories in them. Let's remember it.
> {子供|こども} の {歌|うた} って 、 {古|ふる}い {話|はなし} が {残|のこ}ってる こと が ある ねん 。 {覚|おぼ}えとこ 。 || Children's songs sometimes keep old stories in them. Let's remember it.
@ kr/road [kr.toro_fox]
= {化|ば}かされた みたい に きれい ね 。 {狐|きつね} の {灯|あか}り って 、 {出来過|できす}ぎ よ 。 || Pretty enough to be a fox's trick. A fox's light — it's almost too good.
> {化|ば}かされた みたい に きれい や な 。 {狐|きつね} の {灯|あか}り って 、 {出来過|できす}ぎ や わ 。 || Pretty enough to be a fox's trick. A fox's light — it's almost too good.
@ kr/lodge [kr.juzo_first]
= {石|いし} の {台本|だいほん} ね 。 {一行|いちぎょう} {抜|ぬ}けて たら 、 {芝居|しばい} は {止|と}まる わ よ 。 || A script in stone. Miss one line and the play stops.
> {石|いし} の {台本|だいほん} や な 。 {一行|いちぎょう} {抜|ぬ}けてたら 、 {芝居|しばい} は {止|と}まる で 。 || A script in stone. Miss one line and the play stops.
@ kr/lodge [kr.kikyo_first]
= {語|かた}り の {同業|どうぎょう} ね ！ {舞台|ぶたい} は {違|ちが}う けど 、 {話|はなし} は {合|あ}い そう 。 || A fellow teller! Different stage, but I think we'll get on.
> {語|かた}り の {同業|どうぎょう} や ！ {舞台|ぶたい} は ちゃう けど 、 {話|はなし} は {合|あ}い そう や 。 || A fellow teller! Different stage, but I think we'll get on.
@ kr/lodge [kr.lodge_arrive]
= {客席|きゃくせき} の ない {舞台|ぶたい} に 、 {灯|あか}り が {一|ひと}つ 。 …… いい {絵|え} に なる わ 。 || One light on a stage with no audience. …Quite a picture.
> {客席|きゃくせき} の ない {舞台|ぶたい} に 、 {灯|あか}り が {一|ひと}つ 。 …… ええ {絵|え} に なる わ 。 || One light on a stage with no audience. …Quite a picture.
@ kr/lodge [kr.subete]
= {舞台|ぶたい} の {上|うえ} は 、 {全員|ぜんいん} で {一|ひと}つ よ 。 すべて を {守|まも}る 、 {気|き}に {入|い}った わ 。 || On stage, the whole company is one. Protect everyone: I like it.
> {舞台|ぶたい} の {上|うえ} は 、 {全員|ぜんいん} で {一|ひと}つ や 。 すべて を {守|まも}る 、 {気|き}に {入|い}った わ 。 || On stage, the whole company is one. Protect everyone: I like it.
@ kr/lodge [kr.kikyo_lodge]
= {分|わ}かる わ 。 {狐|きつね} が {出|で}る と 、 {客席|きゃくせき} が {沸|わ}く の よ 。 || I know just what she means. Bring on a fox and the house goes wild.
> {分|わ}かる わ 。 {狐|きつね} が {出|で}る と 、 {客席|きゃくせき} が {沸|わ}く ねん 。 || I know just what she means. Bring on a fox and the house goes wild.
@ kr/lodge [kr.hall_first]
= {幕|まく} が {下|お}りた まま の {小屋|こや} ね 。 …… {何|なん} の {芝居|しばい} を して いた の かしら 。 || A theatre with its curtain left down. …I wonder what they used to play here.
> {幕|まく} が {下|お}りた まま の {小屋|こや} や な 。 …… {何|なん} の {芝居|しばい} を してた ん やろ 。 || A theatre with its curtain left down. …I wonder what they used to play here.
@ kr/lodge [kr.chapter_end]
= {百年|ひゃくねん} {続|つづ}いた {芝居|しばい} にも 、 {千秋楽|せんしゅうらく} は ある の よ 。 || Even a play that's run a hundred years has a closing night.
> {百年|ひゃくねん} {続|つづ}いた {芝居|しばい} にも 、 {千秋楽|せんしゅうらく} は ある ねん で 。 || Even a play that's run a hundred years has a closing night.
@ kr/lodge [kr.chapter_end]
= {幕|まく} を {下|お}ろし に {行|い}きましょう 。 …… {今度|こんど} は 、 {私|わたし} たち の {手|て} で 。 || Let's go and bring the curtain down. …With our own hands, this time.
> {幕|まく} を {下|お}ろし に {行|い}きましょ 。 …… {今度|こんど} は 、 うちら の {手|て} で 。 || Let's go and bring the curtain down. …With our own hands, this time.
@ kr/vigil [kr.rite]
= {歌|うた} は {節|ふし} が {大事|だいじ} 。 {順番|じゅんばん} より {響|ひび}き よ 。 {歌|うた} の {身|み} に も なって あげて 。 || A song cares about the tune. The sound matters more than the order. Spare a thought for the song.
> {歌|うた} は {節|ふし} が {大事|だいじ} や 。 {順番|じゅんばん} より {響|ひび}き や で 。 {歌|うた} の {身|み} に も なって あげて 。 || A song cares about the tune. The sound matters more than the order. Spare a thought for the song.
@ kr/vigil [kr.cave_deadend]
= {鐘|かね} は {幕|まく} {切|ぎ}れ の {合図|あいず} 。 {途中|とちゅう} で {鳴|な}らしたら 、 {芝居|しばい} は {終|お}わっちゃう わ 。 || The bell is the curtain. Ring it in the middle and the play's over.
> {鐘|かね} は {幕|まく} {切|ぎ}れ の {合図|あいず} や 。 {途中|とちゅう} で {鳴|な}らしたら 、 {芝居|しばい} は {終|お}わってまう で 。 || The bell is the curtain. Ring it in the middle and the play's over.
@ kr/vigil [kr.registers]
= {三|みっ}つ の {台本|だいほん} が あって 、 {一番|いちばん} {楽|らく} な の が {勝|か}った の ね 。 …… {黙|だま}って いる の が 、 {一番|いちばん} {楽|らく} だ もの 。 || Three scripts, and the easiest one won. …Keeping quiet is always easiest.
> {三|みっ}つ の {台本|だいほん} が あって 、 {一番|いちばん} {楽|らく} な の が {勝|か}った ん や な 。 …… {黙|だま}ってる の が 、 {一番|いちばん} {楽|らく} や もん 。 || Three scripts, and the easiest one won. …Keeping quiet is always easiest.
@ kr/side [kr.cache_spot]
= {子供|こども} の {歌|うた} が {宝|たから} の {地図|ちず} 。 {芝居|しばい} に したい くらい ね 。 || A children's song as a treasure map. I'd put it on the stage.
> {子供|こども} の {歌|うた} が {宝|たから} の {地図|ちず} 。 {芝居|しばい} に したい くらい や わ 。 || A children's song as a treasure map. I'd put it on the stage.
@ kr/company [kr.suzu_evening]
= さあ 。 {雲|くも} の {上|うえ} かも ね 。 {役者|やくしゃ} は {風|かぜ} {任|まか}せ よ 。 || Who knows? Up in the clouds, maybe. Actors go where the wind blows.
> さあ なあ 。 {雲|くも} の {上|うえ} かも な 。 {役者|やくしゃ} は {風|かぜ} {任|まか}せ や 。 || Who knows? Up in the clouds, maybe. Actors go where the wind blows.
@ kr/company [kr.suzu_evening]
= …… {人|ひと} の {懐|ふところ} を {覗|のぞ}く の は 、 {野暮|やぼ} よ 。 {客|きゃく} は {舞台|ぶたい} を {見|み}て いれば いい の 。 || …Peering into someone's robe is bad manners. The audience should keep its eyes on the stage.
> …… {人|ひと} の {懐|ふところ} {覗|のぞ}く の は 、 {野暮|やぼ} や で 。 {客|きゃく} は {舞台|ぶたい} {見|み}とったら ええ ねん 。 || …Peering into someone's robe is bad manners. The audience should keep its eyes on the stage.
@ kr/company [kr.makeup]
= …… さっき は 、 {悪|わる}かった わ 。 {野暮|やぼ} なんて 、 {言|い}う つもり じゃ なかった の 。 {手紙|てがみ} は 、 まだ {怖|こわ}くて {開|ひら}けない だけ 。 || …Sorry about earlier. I didn't mean to call you rude. It's only that I'm still too scared to answer the letter.
> …… さっき は 、 {悪|わる}かった な 。 {野暮|やぼ} なんて 、 {言|い}う つもり ちゃうかった ん や 。 {手紙|てがみ} は 、 まだ {怖|こわ}くて {開|ひら}けへん だけ や 。 || …Sorry about earlier. I didn't mean to call you rude. It's only that I'm still too scared to answer the letter.
@ kr/company [kr.makeup]
= …… ありがと 。 {相方|あいかた} が あなた で よかった わ 。 || …Thanks. I'm glad you're my partner.
> …… ありがと 。 {相方|あいかた} が あんた で よかった わ 。 || …Thanks. I'm glad you're my partner.
@ kr/company [kr.makeup]
= こちら こそ 。 …… ほら 、 これ で {両成敗|りょうせいばい} ね 。 || Me too. …There, that's both of us at fault, fair and square.
> こっち こそ 。 …… ほな 、 これ で {両成敗|りょうせいばい} や な 。 || Me too. …There, that's both of us at fault, fair and square.
@ kr/company [kr.makeup]
= {殿様|とのさま} か ！ …… もう 、 {笑|わら}っちゃった じゃ ない 。 {仲直|なかなお}り よ 。 || Who are you, a feudal lord? …Now look, you've made me laugh. We're friends again.
> {殿様|とのさま} か ！ …… もう 、 {笑|わら}ってもうた や ない か 。 {仲直|なかなお}り や 。 || Who are you, a feudal lord? …Now look, you've made me laugh. We're friends again.
`, 'kansai_95_kr.js');
