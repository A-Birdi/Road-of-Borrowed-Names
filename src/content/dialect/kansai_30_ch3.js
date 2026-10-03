/* Suzu's Kansai-ben: Chapter 3 — Cinder Orchard (her own story).
 * Format and rules: src/lang/85_dialect.js, docs/dialect/suzu_kansai.md.
 * "=" the standard line as authored (the key: its Japanese); ">" the Kansai version. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.dialect.add('kansai', `
@ ch3/road:14 [co.arrive]
= さあ さあ 、 お{立|た}ち{会|あ}い ！ {柿|かき} に ガラス に {秋祭|あきまつ}り 。 {舞台|ぶたい} が {一番|いちばん} {映|は}える {里|さと} …… と 、 {聞|き}いた こと が ある わ 。 || Roll up, roll up! Persimmons, glass and an autumn festival — the finest stage west of the mountains… or so I've heard.
> さあ さあ 、 お{立|た}ち{会|あ}い ！ {柿|かき} に ガラス に {秋祭|あきまつ}り 。 {舞台|ぶたい} が {一番|いちばん} {映|は}える {里|さと} …… って 、 {聞|き}いた こと ある ねん 。 || Roll up, roll up! Persimmons, glass and an autumn festival — the finest stage west of the mountains… or so I've heard tell.
@ ch3/road:15 [co.arrive]
= …… {聞|き}いた だけ よ 。 ほんと に 。 || …Only heard. Really.
> …… {聞|き}いた だけ や で 。 ほんま に 。 || …Only heard, mind. Honest.
@ ch3/road:28 [co.road_marker]
= …… {昔|むかし} は 、 きれい に {刈|か}って あった のに 。 || …It used to be cut so neatly.
> …… {昔|むかし} は 、 きれい に {刈|か}って あった のに な 。 || …It used to be cut so neat.
@ ch3/road:30 [co.road_marker]
= ん ？ {火除|ひよ}け って 、 {普通|ふつう} そう でしょ 、 って {話|はなし} 。 || Hm? I just mean that's what firebreaks are normally like.
> ん ？ {火除|ひよ}け って 、 {普通|ふつう} そう やろ 、 って {話|はなし} や 。 || Hm? I just mean that's how firebreaks normally look, that's all.
@ ch3/road:42 [co.road_north]
= {雪鈴|ゆきすず} へ は 、 {祭|まつ}り の {後|あと} で ね 。 …… {後|あと} で 。 || Snowbell after the festival. …After.
> {雪鈴|ゆきすず} へ は 、 {祭|まつ}り の {後|あと} で な 。 …… {後|あと} で 。 || Snowbell after the festival. …After.
@ ch3/village-main:12 [co.village_first]
= …… || …
> = || …
@ ch3/village-main:13 [co.village_first]
= {素敵|すてき} ね 。 {完璧|かんぺき} な {歴史|れきし} 。 {拍手|はくしゅ} 。 || How lovely. A perfect history. Applause.
> {素敵|すてき} や な 。 {完璧|かんぺき} な {歴史|れきし} 。 {拍手|はくしゅ} 。 || Real lovely. A perfect history. Applause.
@ ch3/village-main:29 [co.suspect]
= …… ねえ 、 $name 。 || …Hey, $name.
> …… なあ 、 $name 。 || …Hey, $name.
@ ch3/village-main:30 [co.suspect]
= {私|わたし} 、 {嘘|うそ} の {上手|じょうず} な {人|ひと} を たくさん {知|し}ってる の 。 {自分|じぶん} も {含|ふく}めて ね 。 この {里|さと} は {嘘|うそ} を ついてる ん じゃ ない 。 {嘘|うそ} を {信|しん}じてる 。 || I know a lot of good liars. Myself included. This village isn't lying. It believes the lie.
> うち 、 {嘘|うそ} の {上手|じょうず} な {人|ひと} を ぎょうさん {知|し}ってる ねん 。 {自分|じぶん} も {含|ふく}めて な 。 この {里|さと} は {嘘|うそ} を ついてる ん ちゃう 。 {嘘|うそ} を {信|しん}じてる ねん 。 || I know a whole lot of good liars. Myself included. This village isn't lying. It believes the lie.
@ ch3/hall:33 [co.tokiwa_intro]
= {字|じ} が {汚|きたな}い {年|とし} 、 ちょっと {見|み}たい わ 。 || I'd quite like to see the badly written years.
> {字|じ} が {汚|きたな}い {年|とし} 、 ちょっと {見|み}たい わ 。 || I'd kinda like to see the badly written years.
@ ch3/hall:53 [co.chronicle]
= …… {見習|みなら}い の {頃|ころ} 、 か 。 || …When he was an apprentice, hm.
> …… {見習|みなら}い の {頃|ころ} 、 か 。 || …Back when he was an apprentice, huh.
@ ch3/hall:58 [co.chronicle]
= {年寄|としよ}り に {聞|き}こう 。 {体|からだ} が {覚|おぼ}えてる こと って 、 ある から 。 ウメ さん 、 ゴロウ さん 、 イサオ さん 。 || Let's ask the old ones. Bodies remember things. Ume, Gorō, Isao.
> {年寄|としよ}り に {聞|き}こう 。 {体|からだ} が {覚|おぼ}えてる こと って 、 ある から な 。 ウメ さん 、 ゴロウ さん 、 イサオ さん 。 || Let's ask the old folks. Bodies remember things. Ume, Gorō, Isao.
@ ch3/hall:121 [co.tokiwa_confront]
= {一幕|ひとまく} ずつ なら 、 どんな {筋|すじ} でも {通|とお}る わ 。 {通|とお}し {稽古|げいこ} を したら 、 {穴|あな} が {見|み}える の よ 。 || Scene by scene, any plot makes sense. Run the whole play through and you see the holes.
> {一幕|ひとまく} ずつ やったら 、 どんな {筋|すじ} でも {通|とお}る わ 。 {通|とお}し {稽古|げいこ} したら 、 {穴|あな} が {見|み}える ねん 。 || Scene by scene, any plot makes sense. Run the whole play through and the holes show up.
@ ch3/hall:150 [co.tokiwa_page]
= {笑|わら}う の は {私|わたし} の {仕事|しごと} だ けど 、 {今日|きょう} は お{休|やす}み 。 || Laughing is my job, but I'm taking today off.
> {笑|わら}う の は うち の {仕事|しごと} や けど 、 {今日|きょう} は お{休|やす}み や 。 || Laughing's my job, but I'm taking today off.
@ ch3/hall:155 [co.tokiwa_page]
= …… その {前|まえ} に 、 {少|すこ}し だけ {時間|じかん} を ちょうだい 。 {行|い}く ところ が ある の 。 || …Before that, give me a little time. There's somewhere I need to go.
> …… その {前|まえ} に 、 ちょっと だけ {時間|じかん} ちょうだい 。 {行|い}く とこ が ある ねん 。 || …Before that, give me a little time. There's somewhere I gotta go.
@ ch3/gate:15 [co.tamotsu_gate]
= {幕|まく} が {上|あ}がった わ 。 …… {行|い}こう 。 || Curtain's up. …Let's go.
> {幕|まく} が {上|あ}がった わ 。 …… {行|い}こ 。 || Curtain's up. …Let's go.
@ ch3/gate:24 [co.upper_locked]
= …… {上|うえ} は 、 {今|いま} は いい わ 。 || …Not up there. Not yet.
> …… {上|うえ} は 、 {今|いま} は ええ わ 。 || …Not up there. Not yet.
@ ch3/return:5 [co.kiln_return]
= $name 。 {頁|ページ} は トキワ さん に {渡|わた}して 。 でも 、 {広場|ひろば} で {読|よ}み{上|あ}げられる {前|まえ} に …… ヒロ に は 、 {私|わたし} から {言|い}いたい 。 || $name. Give the page to Tokiwa. But before it's read out in the square… I want Hiro to hear it from me.
> $name 。 {頁|ページ} は トキワ さん に {渡|わた}して 。 せやけど 、 {広場|ひろば} で {読|よ}み{上|あ}げられる {前|まえ} に …… ヒロ に は 、 うち から {言|い}いたい ねん 。 || $name. Give the page to Tokiwa. But before it's read out in the square… I want Hiro to hear it from me.
@ ch3/return:6 [co.kiln_return]
= {母親|ははおや} の {死|し} を 、 {記録|きろく} の {読|よ}み{上|あ}げ で {知|し}る なんて 。 {誰|だれ} に も そんな {思|おも}い は させたく ない 。 || Learning of your mother's death from a public reading. Nobody should have to go through that.
> {母親|ははおや} の {死|し} を 、 {記録|きろく} の {読|よ}み{上|あ}げ で {知|し}る なんて 。 {誰|だれ} に も そんな {思|おも}い は させたない 。 || Learning of your mother's death from a public reading. Nobody should have to go through that.
@ ch3/upper:9 [co.upper_enter]
= …… ここ まで は 、 {来|こ}なかった 。 あの {夜|よる} は 。 || …I never came this far up. Not that night.
> …… ここ まで は 、 {来|こ}んかった 。 あの {夜|よる} は 。 || …I never came this far up. Not that night.
@ ch3/upper:18 [co.upper_stone]
= {石|いし} は {黙|だま}って {残|のこ}る 、 か 。 …… {私|わたし} と {逆|ぎゃく} ね 。 よく {喋|しゃべ}って 、 {残|のこ}らない 。 || Stone stays silent and remains. …The opposite of me. I talk a lot and never stay.
> {石|いし} は {黙|だま}って {残|のこ}る 、 か 。 …… うち と {逆|ぎゃく} や な 。 よう {喋|しゃべ}って 、 {残|のこ}らへん 。 || Stone stays quiet and stays put. …The opposite of me. I talk a blue streak and never stay.
@ ch3/upper:26 [co.upper_wall]
= {舞台|ぶたい} の {大道具|おおどうぐ} と {同|おな}じ よ 。 {名前|なまえ} を {呼|よ}んで あげる と 、 {立|た}つ の 。 …… たぶん 。 || Same as stage sets. Call them by name and they stand up. …Probably.
> {舞台|ぶたい} の {大道具|おおどうぐ} と {一緒|いっしょ} や 。 {名前|なまえ} を {呼|よ}んだら 、 {立|た}つ ねん 。 …… たぶん な 。 || Same as stage sets. Call 'em by name and they stand right up. …Probably.
@ ch3/upper:35 [co.upper_wall]
= {重|おも}し に なる {言葉|ことば} 、 {一|ひと}つ {増|ふ}えた わ ね 。 {風|かぜ} が {来|き}たら 、 {石|いし} 。 || One more word with weight to it. When the wind comes: stone.
> {重|おも}し に なる {言葉|ことば} 、 {一|ひと}つ {増|ふ}えた な 。 {風|かぜ} が {来|き}たら 、 {石|いし} や 。 || One more word with some weight to it. When the wind comes: stone.
@ ch3/upper:47 [co.ashband]
= …… {土|つち} は 、 {覚|おぼ}えてた の ね 。 || …The soil remembered.
> …… {土|つち} は 、 {覚|おぼ}えてた ん や な 。 || …The soil remembered.
@ ch3/upper:56 [co.ashband]
= {足元|あしもと} を {固|かた}める {言葉|ことば} ね 。 {今|いま} の {私|わたし} に {一番|いちばん} {必要|ひつよう} かも 。 || A word for firm footing. Maybe the one I need most right now.
> {足元|あしもと} を {固|かた}める {言葉|ことば} や な 。 {今|いま} の うち が {一番|いちばん} {要|い}る もん かも 。 || A word for firm footing. Maybe just what I need most right now.
@ ch3/oldworks:9 [co.oldworks_enter]
= {下|した} から {見|み}た 。 この {通|とお}り が 、 {全部|ぜんぶ} {赤|あか}かった 。 || I saw it from below. This whole row, red.
> {下|した} から {見|み}てん 。 この {通|とお}り が 、 {全部|ぜんぶ} {赤|あか}かった 。 || I saw it from below. This whole row, red.
@ ch3/oldworks:16 [co.works_sign]
= …… トモエ さん 。 {名前|なまえ} 、 {初|はじ}めて {知|し}った 。 {二十年|にじゅうねん} も {経|た}って 。 || …Tomoe. I never knew her name. Twenty years, and I never knew.
> …… トモエ さん 。 {名前|なまえ} 、 {初|はじ}めて {知|し}った 。 {二十年|にじゅうねん} も {経|た}って 。 || …Tomoe. First time I ever knew her name. Twenty years on.
@ ch3/oldworks:41 [co.kiln_seal]
= {熱|あつ}い {舞台|ぶたい} に は 、 {冷|つめ}たい {客|きゃく} が {一番|いちばん} {効|き}く の よ 。 …… {冗談|じょうだん} じゃ なくて 、 {氷|こおり} が {要|い}る わ 。 || Nothing kills a hot show like a cold audience. …Not a joke: we need ice.
> {熱|あつ}い {舞台|ぶたい} に は 、 {冷|つめ}たい {客|きゃく} が {一番|いちばん} {効|き}く ねん 。 …… {冗談|じょうだん} ちゃう で 、 {氷|こおり} が {要|い}る わ 。 || Nothing cools a hot show like a cold audience. …I'm not joking: we need ice.
@ ch3/oldworks:54 [co.kiln_seal]
= {幕|まく} が {開|あ}いた わ 。 {第二幕|だいにまく} 、 {窯|かま} の {中|なか} 。 || Curtain up. Act two: inside the kiln.
> {幕|まく} が {開|あ}いた わ 。 {第二幕|だいにまく} 、 {窯|かま} の {中|なか} や 。 || Curtain up. Act two: inside the kiln.
@ ch3/oldworks:65 [co.shortcut_open]
= {楽屋|がくや} {口|ぐち} ね 。 {終|お}わったら 、 ここ から {帰|かえ}れる 。 || The stage door. When it's over, we can slip out this way.
> {楽屋|がくや} {口|ぐち} や な 。 {終|お}わったら 、 ここ から {帰|かえ}れる で 。 || The stage door. When it's over, we can slip out this way.
@ ch3/ice:8 [co.ice_enter]
= {楽屋|がくや} みたい 。 {本番|ほんばん} {前|まえ} の 、 {一番|いちばん} {静|しず}か な {時間|じかん} 。 || Like a dressing room. The quietest moment before curtain.
> {楽屋|がくや} みたい や 。 {本番|ほんばん} {前|まえ} の 、 {一番|いちばん} {静|しず}か な {時間|じかん} 。 || Like a dressing room. The quietest moment before curtain.
@ ch3/ice:19 [co.ice_block]
= {溶|と}ける に {溶|と}けられない 、 か 。 …… {分|わ}かる わ 。 || Can't melt, even if it wanted to. …I know the feeling.
> {溶|と}ける に {溶|と}けられへん 、 か 。 …… {分|わ}かる わ 。 || Can't melt, even if it wanted to. …I know that feeling.
@ ch3/ice:28 [co.ice_block]
= {氷|こおり} って 、 {冷|つめ}たい {顔|かお} して 、 {実|じつ} は {熱|ねつ} を {引|ひ}き{受|う}けて くれる の よ ね 。 …… {誰|だれ} か に {似|に}てる 。 || Ice looks cold, but really it takes the heat on itself. …Reminds me of someone.
> {氷|こおり} って 、 {冷|つめ}たい {顔|かお} して 、 ほんま は {熱|ねつ} を {引|ひ}き{受|う}けて くれる ねん な 。 …… {誰|だれ} か に {似|に}てる わ 。 || Ice looks all cold, but really it takes the heat on itself. …Reminds me of somebody.
@ ch3/kiln:9 [co.kiln_enter]
= {客席|きゃくせき} が {暑|あつ}すぎる {芝居|しばい} は 、 {大体|だいたい} {短|みじか}い の 。 …… {短|みじか}く {終|お}わらせよう 。 || Plays with overheated audiences are usually short ones. …Let's keep this short.
> {客席|きゃくせき} が {暑|あつ}すぎる {芝居|しばい} は 、 {大体|だいたい} {短|みじか}い ねん 。 …… {短|みじか}く {終|お}わらせよう 。 || Plays with an overheated audience are usually short ones. …Let's keep this one short.
@ ch3/kiln:41 [co.tablet_count]
= {台本|だいほん} の {頁|ページ} が {揃|そろ}った わ 。 {順番|じゅんばん} を {間違|まちが}えたら 、 {喜劇|きげき} に なっちゃう 。 || All the script pages. Get them in the wrong order and it turns into a comedy.
> {台本|だいほん} の {頁|ページ} が {揃|そろ}った わ 。 {順番|じゅんばん} {間違|まちが}えたら 、 {喜劇|きげき} に なってまう で 。 || All the script pages are here. Get 'em in the wrong order and it turns into a comedy.
@ ch3/kiln:58 [co.kiln_wall]
= {書|か}き{足|た}しって 、 {大抵|たいてい} {誰|だれ} か が {一度|いちど} {失敗|しっぱい} した {後|あと} に {書|か}く もの よ ね 。 || Notes in the margin usually get written after someone's made the mistake once.
> {書|か}き{足|た}しって 、 {大抵|たいてい} {誰|だれ} か が いっぺん {失敗|しっぱい} した {後|あと} に {書|か}く もん や な 。 || Notes in the margin usually get written after somebody's made the mistake once.
@ ch3/core:9 [co.warden_fight]
= {舞台|ぶたい} の {真|ま}ん{中|なか} に {出|で}て きた わ ね 。 …… さあ 、 {主役|しゅやく} の {登場|とうじょう} よ 。 {熱|あつ}く なったら 、 {冷|ひ}やして あげて 。 || Stepped right out to centre stage. …Here comes the lead. When it heats up, cool it down.
> {舞台|ぶたい} の {真|ま}ん{中|なか} に {出|で}て きた な 。 …… さあ 、 {主役|しゅやく} の {登場|とうじょう} や 。 {熱|あつ}く なったら 、 {冷|ひ}やしたって 。 || Stepped right out to centre stage. …Here comes the lead. When it heats up, cool it down.
@ ch3/core:17 [co.warden_fight]
= …… {開|あ}いた わ よ 。 あなた の おかげ で 、 {下|した} は {助|たす}かった 。 || …It opened. Thanks to you, the village below was saved.
> …… {開|あ}いた で 。 あんた の おかげ で 、 {下|した} は {助|たす}かった 。 || …It opened. Thanks to you, the village below was saved.
@ ch3/core:28 [co.core_lantern]
= …… ヒロ に 、 {渡|わた}そう 。 {私|わたし} の {口|くち} から じゃ なくて 、 これ が {先|さき} に {話|はな}して くれる かも 。 || …Let's give it to Hiro. Maybe this can speak before I do.
> …… ヒロ に 、 {渡|わた}そう 。 うち の {口|くち} から や なくて 、 これ が {先|さき} に {話|はな}して くれる かも しれへん 。 || …Let's give it to Hiro. Maybe this can do the talking before I do.
@ ch3/core:52 [co.core_page]
= …… {頭|あたま} に {巻|ま}いて おき な 、 か 。 {帰|かえ}ろう 、 $name 。 {言|い}わなきゃ いけない こと が ある 。 || …Tie this round your head, hm. Let's go back, $name. There's something I have to say.
> …… {頭|あたま} に {巻|ま}いて おき な 、 か 。 {帰|かえ}ろ 、 $name 。 {言|い}わな あかん こと が ある ねん 。 || …Tie this round your head, huh. Let's head back, $name. There's something I've gotta say.
@ ch3/people-square:54 [co.kotaro]
= {呪|のろ}われる わ よ 。 {一生|いっしょう} 、 {甘酒|あまざけ} が {一杯|いっぱい} まで に なる {呪|のろ}い 。 || Oh, you'd be cursed. Cursed to one cup of amazake for the rest of your life.
> {呪|のろ}われる で 。 {一生|いっしょう} 、 {甘酒|あまざけ} が {一杯|いっぱい} まで に なる {呪|のろ}い や 。 || Oh, you'd be cursed. Cursed to one cup of amazake for the rest of your days.
@ ch3/people-square:70 [co.kotaro]
= {台本|だいほん} を {書|か}き{換|か}える {役者|やくしゃ} ね 。 {気持|きも}ち は {分|わ}かる けど 、 {座長|ざちょう} に {怒|おこ}られる やつ よ 。 || An actor rewriting the script mid-show. I understand the urge, but the director will have your head.
> {台本|だいほん} を {書|か}き{換|か}える {役者|やくしゃ} や な 。 {気持|きも}ち は {分|わ}かる けど 、 {座長|ざちょう} に {怒|おこ}られる やつ や で 。 || An actor rewriting the script mid-show. I get the urge, but the director'll have your hide.
@ ch3/people-square:112 [co.goro]
= …… {聞|き}こえた わ 。 {下|した} まで 。 {一晩中|ひとばんじゅう} 。 || …I heard it. All the way down. All night.
> …… {聞|き}こえた で 。 {下|した} まで 。 {一晩中|ひとばんじゅう} 。 || …I heard it. All the way down. All night.
@ ch3/people-square:164 [co.bell_ring]
= …… {同|おな}じ {顔|かお} だった 。 あの {夜|よる} と 。 || …The same faces. Just like that night.
> …… {同|おんな}じ {顔|かお} やった 。 あの {夜|よる} と 。 || …The same faces. Just like that night.
@ ch3/people-square:221 [co.heita]
= {目|め} を {閉|と}じて {考|かんが}える の 、 {私|わたし} も {得意|とくい} よ 。 {客席|きゃくせき} で よく やる わ 。 || I'm good at thinking with my eyes shut too. I do it in audiences all the time.
> {目|め} {閉|と}じて {考|かんが}える の 、 うち も {得意|とくい} や で 。 {客席|きゃくせき} で よう やる わ 。 || I'm good at thinking with my eyes shut too. Do it in audiences all the time.
@ ch3/props-square:10 [co.seat]
= {椅子|いす} って 、 {空|から} だと {目立|めだ}つ よ ね 。 {舞台|ぶたい} でも そう 。 …… {次|つぎ} 、 {行|い}こう 。 || Empty chairs do stand out. Same on stage. …Let's move on.
> {椅子|いす} って 、 {空|から} やと {目立|めだ}つ よ な 。 {舞台|ぶたい} でも そう や 。 …… {次|つぎ} 、 {行|い}こ 。 || An empty chair sure stands out. Same on stage. …Let's move on.
@ ch3/props-square:24 [co.buckets]
= {昔|むかし} は 、 {全部|ぜんぶ} {濡|ぬ}れてた わ 。 …… {雨|あめ} の {日|ひ} に {見|み}た の 。 たぶん 。 || They used to be wet, all of them. …I saw them on a rainy day. Probably.
> {昔|むかし} は 、 {全部|ぜんぶ} {濡|ぬ}れてた わ 。 …… {雨|あめ} の {日|ひ} に {見|み}てん 。 たぶん 。 || They used to be wet, every one. …I saw 'em on a rainy day. Probably.
@ ch3/props-square:36 [co.channel_marker]
= …… ここ を 、 {子|こ}ども たち が {下|お}りて きた の 。 || …The children came down this way.
> …… ここ を 、 {子|こ}ども たち が {下|お}りて きた ん や 。 || …The children came down this way.
@ ch3/props-square:38 [co.channel_marker]
= …… って 、 {芝居|しばい} なら {言|い}う ところ よ ね 。 ほら 、 {行|い}こう 。 || …Is what I'd say if this were a play. Come on, let's go.
> …… って 、 {芝居|しばい} やったら {言|い}う とこ や な 。 ほら 、 {行|い}こ 。 || …Is what I'd say if this were a play. Come on, let's go.
@ ch3/end:62 [co.assembly]
= …… {拍手|はくしゅ} は 、 しない で おく わ 。 これ は {舞台|ぶたい} じゃ ない から 。 || …I won't applaud. This isn't a stage.
> …… {拍手|はくしゅ} は 、 せえへん で おく わ 。 これ は {舞台|ぶたい} ちゃう から 。 || …I won't applaud. This isn't a stage.
@ ch3/end:87 [co.festival_begin]
= {隣|となり} の {席|せき} 、 {予約|よやく} が {入|はい}ってる の 。 …… {後|あと} で ね 。 {先|さき} に {一周|いっしゅう} して きて 。 || I've a reserved seat — next door to Hiro's. …Later. Go and walk round first.
> {隣|となり} の {席|せき} 、 {予約|よやく} が {入|はい}ってる ねん 。 …… {後|あと} で な 。 {先|さき} に {一周|いっしゅう} して きて 。 || I've got a reserved seat — right next to Hiro's. …Later. Go walk round first.
@ ch3/end:125 [co.reflection]
= …… ここ から だと 、 ヒロ の {席|せき} が よく {見|み}える わ 。 {火屋|ほや} が {一|ひと}つ 、 {灯|とも}ってる 。 || …You can see Hiro's seat from here. One globe, lit.
> …… ここ から やと 、 ヒロ の {席|せき} が よう {見|み}える わ 。 {火屋|ほや} が {一|ひと}つ 、 {灯|とも}ってる 。 || …You can see Hiro's seat real well from here. One globe, lit.
@ ch3/end:126 [co.reflection]
= {帳簿|ちょうぼ} 、 {見|み}る ？ 「 {一部|いちぶ} {返済|へんさい} 」 。 …… {線|せん} を {引|ひ}かない {借|か}り も ある の ね 。 {初|はじ}めて {知|し}った 。 || Want to see my book? "Paid in part." …Some debts you don't cross out. I didn't know that.
> {帳簿|ちょうぼ} 、 {見|み}る ？ 「 {一部|いちぶ} {返済|へんさい} 」 。 …… {線|せん} を {引|ひ}かへん {借|か}り も ある ん や な 。 {初|はじ}めて {知|し}った わ 。 || Wanna see my book? "Paid in part." …Some debts you don't cross out. Never knew that.
@ ch3/end:127 [co.reflection]
= ちなみに 、 {次|つぎ} の {頁|ページ} に は あなた の {名前|なまえ} も ある の よ 。 「 $name ── {観客|かんきゃく} {一名|いちめい} 。 {最後|さいご} まで {席|せき} を {立|た}たず 」 。 || By the way, your name's on the next page. "$name — audience of one. Stayed in their seat to the end."
> ちなみに 、 {次|つぎ} の {頁|ページ} に は あんた の {名前|なまえ} も ある ねん で 。 「 $name ── {観客|かんきゃく} {一名|いちめい} 。 {最後|さいご} まで {席|せき} を {立|た}たず 」 。 || By the way, your name's on the next page. "$name — audience of one. Stayed in their seat to the end."
@ ch3/end:128 [co.reflection]
= …… ありがとう 。 これ は {冗談|じょうだん} じゃ ない わ 。 || …Thank you. That one isn't a joke.
> …… ありがとう 。 これ は {冗談|じょうだん} ちゃう で 。 || …Thank you. That one's no joke.
@ ch3/end:134 [co.reflection]
= {預|あず}かる って 、 {返|かえ}す {約束|やくそく} の {言葉|ことば} の はず な のに ね 。 {返|かえ}して もらい に {行|い}こう 。 {全部|ぜんぶ} 。 || "Keeping" something is supposed to mean you'll give it back. Let's go and get it all back.
> {預|あず}かる って 、 {返|かえ}す {約束|やくそく} の {言葉|ことば} の はず や のに な 。 {返|かえ}して もらい に {行|い}こ 。 {全部|ぜんぶ} や 。 || "Keeping" something's supposed to mean you'll give it back. Let's go get it all back. Every bit.
@ ch3/end:175 [co.lookout_base]
= …… {鳴|な}った の よ 。 {昔|むかし} 。 {一晩中|ひとばんじゅう} 。 || …It rang, once. Long ago. All night.
> …… {鳴|な}った ん や 。 {昔|むかし} 。 {一晩中|ひとばんじゅう} 。 || …It rang, once. Long ago. All night.
@ ch3/people-workshops:31 [co.hiro_first]
= {素敵|すてき} な {火屋|ほや} 。 {舞台|ぶたい} の {明|あ}かり に {欲|ほ}しい くらい 。 || Lovely globes. I'd want them for stage lights.
> {素敵|すてき} な {火屋|ほや} 。 {舞台|ぶたい} の {明|あ}かり に {欲|ほ}しい くらい や 。 || Lovely globes. I'd want 'em for stage lights.
@ ch3/people-workshops:40 [co.beam]
= …… {重|おも}そう な {梁|はり} ね 。 {下|した} に {誰|だれ} か いたら 、 {大変|たいへん} ね 。 || …Heavy-looking beam. It'd be terrible if someone were underneath.
> …… {重|おも}そう な {梁|はり} や な 。 {下|した} に {誰|だれ} か おったら 、 えらい こと や 。 || …Heavy-looking beam. It'd be awful if somebody was underneath.
@ ch3/people-workshops:85 [co.isao]
= …… トモエ 。 || …Tomoe.
> = || …Tomoe.
@ ch3/people-workshops:111 [co.hiro_after]
= {利子|りし} は 、 {取|と}らない で よ ？ || No interest, I hope?
> {利子|りし} は 、 {取|と}らへん よ な ？ || You won't charge interest, right?
@ ch3/people-workshops:176 [co.inn_tea]
= …… {私|わたし} の じゃ ない わ よ 。 {今日|きょう} は 。 || …Not mine. Not today.
> …… うち の ちゃう で 。 {今日|きょう} は な 。 || …Not mine. Not today.
@ ch3/people-workshops:227 [co.nao_cameo]
= ナオ ！ {相変|あいか}わらず {出口|でぐち} {側|がわ} に {立|た}ってる の ね 。 || Nao! Still standing by the exit, I see.
> ナオ ！ {相変|あいか}わらず {出口|でぐち} {側|がわ} に {立|た}ってる ん や な 。 || Nao! Still standing by the exit, I see.
@ ch3/pottery:36 [co.nobu]
= ちゃんと {帳簿|ちょうぼ} に {書|か}いて おく わ 。 「 ノブ さん から {湯呑|ゆの}み {一|ひと}つ 。 {返済|へんさい} {不要|ふよう} 」 。 || I'll note it in my book. "One cup from Nobu. No repayment needed."
> ちゃんと {帳簿|ちょうぼ} に {書|か}いとく わ 。 「 ノブ さん から {湯呑|ゆの}み {一|ひと}つ 。 {返済|へんさい} {不要|ふよう} 」 。 || I'll note it in my book. "One cup from Nobu. No repayment needed."
@ ch3/terraces:11 [co.hist_check]
= {三人|さんにん} の {台詞|せりふ} が 、 {同|おな}じ {場面|ばめん} を {指|さ}してる 。 …… {記録堂|きろくどう} へ 。 {植|う}え{付|つ}け{帳|ちょう} と {窯|かま} の {帳面|ちょうめん} を {持|も}って 。 || Three people's lines, all pointing to the same scene. …To the Chronicle Hall, with the planting book and the kiln ledger.
> {三人|さんにん} の {台詞|せりふ} が 、 {同|おんな}じ {場面|ばめん} を {指|さ}してる 。 …… {記録堂|きろくどう} へ 。 {植|う}え{付|つ}け{帳|ちょう} と {窯|かま} の {帳面|ちょうめん} {持|も}って 。 || Three folks' lines, all pointing at the same scene. …To the Chronicle Hall, with the planting book and the kiln ledger.
@ ch3/terraces:40 [co.ume]
= …… {水路|すいろ} の {下|した} で 、 {子|こ}ども を {数|かぞ}えて いた {人|ひと} たち が いた でしょう 。 …… {旅芸人|たびげいにん} の 。 || …There were people at the bottom of the channel, counting the children as they came, weren't there. …Travelling players.
> …… {水路|すいろ} の {下|した} で 、 {子|こ}ども を {数|かぞ}えてた {人|ひと} たち が いてた でしょう 。 …… {旅芸人|たびげいにん} の 。 || …There were people at the bottom of the channel, counting the children as they came, weren't there. …Travelling players.
@ ch3/terraces:56 [co.ume_first]
= …… {雨|あめ} の {日|ひ} の 、 けむり の におい 。 || …The smell of smoke on a rainy day.
> = || …The smell of smoke on a rainy day.
@ ch3/terraces:127 [co.signpost]
= 「 {火除|ひよ}け{道|みち} 」 。 …… {消|け}された {名前|なまえ} の {中|なか} で 、 {一番|いちばん} {大事|だいじ} な の が {戻|もど}った わ ね 。 || "Firebreak path." …Of all the erased names, the most important one came back.
> 「 {火除|ひよ}け{道|みち} 」 。 …… {消|け}された {名前|なまえ} の {中|なか} で 、 {一番|いちばん} {大事|だいじ} な ん が {戻|もど}った な 。 || "Firebreak path." …Of all the erased names, the one that matters most came back.
@ ch3/terraces:153 [co.goat]
= …… {座長|ざちょう} ？ {座長|ざちょう} じゃ ない ！ ここ に いた の ？ || …Director? It's the Director! So this is where you ended up?
> …… {座長|ざちょう} ？ {座長|ざちょう} やん ！ ここ に おった ん ？ || …Director? Well, if it ain't the Director! So this is where you got to?
@ ch3/terraces:155 [co.goat]
= {一座|いちざ} の ヤギ よ 。 {座長|ざちょう} が {自分|じぶん} より {言|い}う こと を {聞|き}かない から って 、 {座長|ざちょう} って {名前|なまえ} を {付|つ}けた の 。 {幕|まく} を {食|た}べる の が {得意|とくい} で ね 。 || It's the troupe's goat. The real director named it that, because it listened to him even less than he did. Its speciality was eating the curtain.
> {一座|いちざ} の ヤギ や で 。 {座長|ざちょう} が 、 {自分|じぶん} より {言|い}う こと {聞|き}かへん から って 、 {座長|ざちょう} って {名前|なまえ} {付|つ}けた ん や 。 {幕|まく} {食|た}べる の が {得意|とくい} で な 。 || It's the troupe's goat. The real director named it that, 'cause it listened to him even less than he did. Its specialty was eating the curtain.
@ ch3/terraces:156 [co.goat]
= …… {柿|かき} の {葉|は} の {方|ほう} が {美味|おい}しい って {顔|かお} ね 。 {良|よ}い {引退|いんたい} {先|さき} を {見|み}つけた わ ね 、 {座長|ざちょう} 。 || …You look like you've decided persimmon leaves beat curtains. You found a fine place to retire, Director.
> …… {柿|かき} の {葉|は} の {方|ほう} が {美味|おい}しい って {顔|かお} や な 。 ええ {引退|いんたい} {先|さき} {見|み}つけた やん 、 {座長|ざちょう} 。 || …You've got the look of a goat who's decided persimmon leaves beat curtains. Found yourself a fine place to retire, Director.
@ ch3/suzu:9 [co.suzu_night]
= あら 、 {眠|ねむ}れない の ？ {私|わたし} も 。 {枕|まくら} が {変|か}わる と ダメ な の よ 。 {旅芸人|たびげいにん} の くせ に 。 || Oh, can't sleep? Me neither. A new pillow always gets me. And me a travelling performer.
> あら 、 {眠|ねむ}られへん の ？ うち も 。 {枕|まくら} が {変|か}わる と あかん ねん 。 {旅芸人|たびげいにん} の くせ に な 。 || Oh, can't sleep? Me neither. A new pillow always does me in. And me a travelling performer.
@ ch3/suzu:11 [co.suzu_night]
= {来|き}た こと ？ ある ある 。 {百回|ひゃっかい} くらい 。 {柿|かき} を {食|た}べ に 。 || Been here? Oh, loads. A hundred times. For the persimmons.
> {来|き}た こと ？ ある ある 。 {百回|ひゃっかい} くらい 。 {柿|かき} {食|た}べ に 。 || Been here before? Oh, loads. A hundred times. For the persimmons.
@ ch3/suzu:13 [co.suzu_night]
= …… {一回|いっかい} だけ 。 {二十年前|にじゅうねんまえ} 。 {一座|いちざ} で 、 {秋祭|あきまつ}り の {舞台|ぶたい} に {立|た}つ はず だった 。 {私|わたし} は {十六|じゅうろく} で 、 {初|はじ}めて {台詞|せりふ} を もらった {年|とし} 。 || …Once. Twenty years ago. With the troupe — we were booked for the autumn festival. I was sixteen. The first year I had lines of my own.
> …… {一回|いっかい} だけ 。 {二十年前|にじゅうねんまえ} 。 {一座|いちざ} で 、 {秋祭|あきまつ}り の {舞台|ぶたい} に {立|た}つ はず やった 。 うち は {十六|じゅうろく} で 、 {初|はじ}めて {台詞|せりふ} を もろた {年|とし} や 。 || …Just once. Twenty years ago. The troupe was booked for the autumn festival. I was sixteen. The first year I had lines of my own.
@ ch3/suzu:14 [co.suzu_night]
= {前|まえ} の {晩|ばん} に 、 {火事|かじ} が あった 。 {上|うえ} の {段|だん} が {燃|も}えた 。 {私|わたし} たち の {天幕|てんまく} は {水路|すいろ} の {下|した} に あって 、 {下|お}りて くる {子|こ}ども たち を {数|かぞ}えて いた 。 || The night before, there was a fire. The upper terraces burned. Our tents were at the bottom of the channel, and we counted the children as they came down.
> {前|まえ} の {晩|ばん} に 、 {火事|かじ} が あってん 。 {上|うえ} の {段|だん} が {燃|も}えた 。 うちら の {天幕|てんまく} は {水路|すいろ} の {下|した} に あって 、 {下|お}りて くる {子|こ}ども たち を {数|かぞ}えてた ん や 。 || The night before, there was a fire. The upper terraces burned. Our tents were at the bottom of the channel, and we counted the children as they came down.
@ ch3/suzu:16 [co.suzu_night]
= {私|わたし} たち は {次|つぎ} の {朝|あさ} に {発|た}った から 。 {静寂|しじま} が {来|き}た の は 、 たぶん {冬|ふゆ} 。 {私|わたし} だけ 、 {取|と}られ {損|そこ}ねた の ね 。 || We left the next morning. I think the Hush came that winter. I'm the one it missed.
> うちら は {次|つぎ} の {朝|あさ} に {発|た}った から 。 {静寂|しじま} が {来|き}た ん は 、 たぶん {冬|ふゆ} や 。 うち だけ 、 {取|と}られ {損|そこ}ねた ん や な 。 || We left the next morning. I reckon the Hush came that winter. I'm the one it missed.
@ ch3/suzu:17 [co.suzu_night]
= その {朝|あさ} 、 {小|ちい}さな {男|おとこ} の {子|こ} が {私|わたし} の リボン を {引|ひ}っ{張|ぱ}って 、 「 お{母|かあ}さん は どこ ？ 」 って {聞|き}いた の 。 || That morning a little boy tugged at my ribbon and asked me, "Where's my mum?"
> その {朝|あさ} 、 {小|ちい}さな {男|おとこ} の {子|こ} が うち の リボン {引|ひ}っ{張|ぱ}って 、 「 お{母|かあ}さん は どこ ？ 」 って {聞|き}いてん 。 || That morning a little boy tugged at my ribbon and asked me, "Where's my mum?"
@ ch3/suzu:18 [co.suzu_night]
= {私|わたし} は {知|し}ってた 。 {窯|かま} の {人|ひと} で 、 {上|うえ} へ {行|い}った まま {戻|もど}らなかった 。 || I knew. She worked the kiln. She went up the hill and didn't come back.
> うち は {知|し}ってた 。 {窯|かま} の {人|ひと} で 、 {上|うえ} へ {行|い}った まま {戻|もど}って けえへんかった 。 || I knew. She worked the kiln. She went up the hill and never came back down.
@ ch3/suzu:19 [co.suzu_night]
= {私|わたし} は {言|い}った 。 「 お{母|かあ}さん は {一座|いちざ} と {一緒|いっしょ} に {先|さき} へ {行|い}った の 。 {春|はる} に なったら {帰|かえ}って くる よ 」 って 。 || I told him: "Your mum's gone on ahead with the troupe. She'll be back when spring comes."
> うち は {言|い}うた 。 「 お{母|かあ}さん は {一座|いちざ} と {一緒|いっしょ} に {先|さき} へ {行|い}った ん や で 。 {春|はる} に なったら {帰|かえ}って くる で 」 って 。 || I told him: "Your mum's gone on ahead with the troupe. She'll be back when spring comes."
@ ch3/suzu:20 [co.suzu_night]
= …… {台詞|せりふ} の {稽古|けいこ} より 、 ずっと {上手|じょうず} に {言|い}えた 。 || …I delivered it far better than any line I'd rehearsed.
> …… {台詞|せりふ} の {稽古|けいこ} より 、 ずっと {上手|じょうず} に {言|い}えた わ 。 || …I delivered it better than any line I ever rehearsed.
@ ch3/suzu:22 [co.suzu_night]
= ヒロ 。 {広場|ひろば} の {空|あ}いた {席|せき} 。 {毎年|まいとし} {誰|だれ} か の ため に {空|あ}けて ある って 、 サヨ さん が {言|い}ってた でしょ 。 || Hiro. The empty seat in the square. Sayo said someone keeps it free every year, didn't she.
> ヒロ 。 {広場|ひろば} の {空|あ}いた {席|せき} 。 {毎年|まいとし} {誰|だれ} か の ため に {空|あ}けて ある って 、 サヨ さん が {言|い}わはった やろ 。 || Hiro. The empty seat in the square. Sayo said somebody keeps it free every year, didn't she.
@ ch3/suzu:24 [co.suzu_night]
= {私|わたし} ね 、 {借|か}り は {全部|ぜんぶ} {書|か}いて おく の 。 {宿代|やどだい} 、 {傘|かさ} 、 {貸|か}して もらった {針|はり} {一本|いっぽん} まで 。 {返|かえ}したら {線|せん} を {引|ひ}く 。 || I write down every debt, you know. Lodgings, umbrellas, a single needle someone lent me. When I pay, I cross it out.
> うち な 、 {借|か}り は {全部|ぜんぶ} {書|か}いとく ねん 。 {宿代|やどだい} 、 {傘|かさ} 、 {貸|か}して もろた {針|はり} {一本|いっぽん} まで 。 {返|かえ}したら {線|せん} {引|ひ}く 。 || I write down every debt, y'know. Lodgings, umbrellas, a single needle somebody lent me. When I pay up, I cross it out.
@ ch3/suzu:25 [co.suzu_night]
= {線|せん} が {引|ひ}けて ない の は 、 これ だけ 。 || This is the only one I've never crossed out.
> {線|せん} が {引|ひ}けてへん の は 、 これ だけ や 。 || This is the only one I've never crossed out.
@ ch3/suzu:27 [co.suzu_night]
= {何年|なんねん} か して 、 {手紙|てがみ} を {書|か}いた こと が ある 。 {本当|ほんとう} の こと を 。 でも {封|ふう} を する {前|まえ} に 、 {字|じ} が {全部|ぜんぶ} {白|しろ}く {消|き}えた 。 || A few years later I wrote him a letter. The truth. But before I could seal it, every word faded to white.
> {何年|なんねん} か して 、 {手紙|てがみ} {書|か}いた こと ある ねん 。 ほんま の こと を 。 せやけど {封|ふう} する {前|まえ} に 、 {字|じ} が {全部|ぜんぶ} {白|しろ}く {消|き}えて もうた 。 || A few years on, I wrote him a letter. The truth. But before I could seal it, every word faded to white.
@ ch3/suzu:28 [co.suzu_night]
= {嘘|うそ} は {残|のこ}って 、 {本当|ほんとう} は {消|き}える 。 {皮肉|ひにく} でしょ ？ あの {夜|よる} の こと で 、 {静寂|しじま} が {取|と}らなかった の は 、 {私|わたし} の {嘘|うそ} だけ 。 {痛|いた}い ところ が {一|ひと}つ も ない から 。 || The lie stays; the truth fades. Ironic, isn't it? Of everything about that night, the only thing the Hush didn't take was my lie. There's nothing in it that hurts.
> {嘘|うそ} は {残|のこ}って 、 ほんま は {消|き}える 。 {皮肉|ひにく} やろ ？ あの {夜|よる} の こと で 、 {静寂|しじま} が {取|と}らへんかった ん は 、 うち の {嘘|うそ} だけ 。 {痛|いた}い とこ が {一|ひと}つ も あらへん から 。 || The lie stays; the truth fades. Ironic, huh? Of everything about that night, the only thing the Hush didn't take was my lie. There's nothing in it that hurts.
@ ch3/suzu:33 [co.suzu_night]
= …… {里|さと} が {火事|かじ} を {思|おも}い{出|だ}せば 、 {本当|ほんとう} の こと も {字|じ} に {残|のこ}る 。 そう いう こと ね 。 || …If the village remembers the fire, the truth will stay on the page too. That's what you mean.
> …… {里|さと} が {火事|かじ} を {思|おも}い{出|だ}したら 、 ほんま の こと も {字|じ} に {残|のこ}る 。 そう いう こと や な 。 || …If the village remembers the fire, the truth'll stay on the page too. That's what you mean.
@ ch3/suzu:36 [co.suzu_night]
= {優|やさ}しい の ね 。 でも それ 、 {二十年前|にじゅうねんまえ} の {私|わたし} と {同|おな}じ {台詞|せりふ} よ 。 || You're kind. But that's exactly the line I gave myself twenty years ago.
> {優|やさ}しい な 。 せやけど それ 、 {二十年前|にじゅうねんまえ} の うち と {同|おんな}じ {台詞|せりふ} や で 。 || You're kind. But that's the very same line I gave myself twenty years ago.
@ ch3/suzu:39 [co.suzu_night]
= {火事|かじ} を {取|と}り{戻|もど}す の を 、 {手伝|てつだ}う わ 。 {全部|ぜんぶ} {終|お}わったら 、 {言|い}う 。 {今度|こんど} は {字|じ} が {消|き}えない よう に 。 || I'll help you bring the fire back. And when it's done, I'll tell him. So that this time the words don't fade.
> {火事|かじ} を {取|と}り{戻|もど}す の 、 {手伝|てつだ}う わ 。 {全部|ぜんぶ} {終|お}わったら 、 {言|い}う 。 {今度|こんど} は {字|じ} が {消|き}えへん よう に 。 || I'll help you bring the fire back. And when it's done, I'll tell him. So this time the words don't fade.
@ ch3/suzu:40 [co.suzu_night]
= …… その {前|まえ} に 、 ヒロ が {今|いま} {何|なに} を {信|しん}じてる か 、 {確|たし}かめたい 。 {付|つ}いて {来|き}て くれる ？ {観客|かんきゃく} が いる と 、 {私|わたし} 、 {強|つよ}い の 。 || …Before that, I want to know what Hiro believes now. Will you come? I'm braver with an audience.
> …… その {前|まえ} に 、 ヒロ が {今|いま} {何|なに} を {信|しん}じてる か 、 {確|たし}かめたい ねん 。 {付|つ}いて {来|き}て くれる ？ {観客|かんきゃく} が おったら 、 うち 、 {強|つよ}い ねん 。 || …Before that, I wanna know what Hiro believes now. Will you come along? I'm braver with an audience.
@ ch3/suzu:59 [co.suzu_ask]
= …… {素敵|すてき} な {習|なら}わし ね 。 ありがとう 、 {話|はな}して くれて 。 || …It's a lovely custom. Thank you for telling us.
> …… {素敵|すてき} な {習|なら}わし です ね 。 ありがとう 、 {話|はな}して くれはって 。 || …It's a lovely custom. Thank you for telling us.
@ ch3/suzu:61 [co.suzu_ask]
= {旅芸人|たびげいにん} の {顔|かお} は 、 みんな どこ か で {見|み}た {顔|かお} よ 。 || Every travelling performer has a face you've seen somewhere.
> {旅芸人|たびげいにん} の {顔|かお} は 、 みんな どこ か で {見|み}た {顔|かお} や で 。 || Every travelling performer's got a face you've seen somewhere.
@ ch3/suzu:63 [co.suzu_ask]
= …… リボン だけ {覚|おぼ}えてる 、 か 。 {私|わたし} も {同|おな}じ よ 。 あの {子|こ} の {顔|かお} より 、 {引|ひ}っ{張|ぱ}られた リボン の {感|かん}じ の {方|ほう} を {覚|おぼ}えてる 。 || …He remembers only the ribbon. Same for me. I remember the tug on the ribbon better than his face.
> …… リボン だけ {覚|おぼ}えてる 、 か 。 うち も {同|おんな}じ や 。 あの {子|こ} の {顔|かお} より 、 {引|ひ}っ{張|ぱ}られた リボン の {感|かん}じ の {方|ほう} を {覚|おぼ}えてる 。 || …He remembers only the ribbon. Same for me. I remember the tug on the ribbon better than his face.
@ ch3/suzu:64 [co.suzu_ask]
= {今|いま} {言|い}って も 、 {火事|かじ} ごと {頭|あたま} から {滑|すべ}り{落|お}ちる だけ 。 {窯|かま} が {記録|きろく} を {返|かえ}して から に する わ 。 || If I told him now, it'd slide off his mind with the rest of the fire. I'll wait until the kiln gives its record back.
> {今|いま} {言|い}うて も 、 {火事|かじ} ごと {頭|あたま} から {滑|すべ}り{落|お}ちる だけ や 。 {窯|かま} が {記録|きろく} {返|かえ}して から に する わ 。 || If I told him now, it'd just slide off his mind with the rest of the fire. I'll wait till the kiln gives its record back.
@ ch3/suzu:70 [co.suzu_c_square]
= …… あら ！ $name ！ {葦|あし}ノ{瀬|せ} {以来|いらい} ね 。 {世|よ} の {中|なか} って 、 {舞台|ぶたい} が {狭|せま}い わ 。 || …Well! $name! Not since Reedwake. What a small stage the world is.
> …… あら ！ $name ！ {葦|あし}ノ{瀬|せ} {以来|いらい} や な 。 {世|よ} の {中|なか} って 、 {舞台|ぶたい} が {狭|せま}い わ 。 || …Well! $name! Not since Reedwake. What a small stage the world is.
@ ch3/suzu:71 [co.suzu_c_square]
= ナオ も 。 {相変|あいか}わらず {出口|でぐち} ばかり {見|み}てる の ね 。 || And Nao. Still watching the exits, I see.
> ナオ も 。 {相変|あいか}わらず {出口|でぐち} ばっかり {見|み}てる ん や な 。 || And Nao. Still watching the exits, I see.
@ ch3/suzu:73 [co.suzu_c_square]
= ミオ も ！ {薬箱|くすりばこ} 、 {今日|きょう} も {重|おも}そう ね 。 || Mio too! Your medicine box looks as heavy as ever.
> ミオ も ！ {薬箱|くすりばこ} 、 {今日|きょう} も {重|おも}そう や な 。 || Mio too! That medicine box looks as heavy as ever.
@ ch3/suzu:75 [co.suzu_c_square]
= レン まで 。 {道|みち} に {迷|まよ}わず に {来|こ}られた の ？ {奇跡|きせき} ね 。 || Even Ren. You made it here without getting lost? A miracle.
> レン まで 。 {道|みち} に {迷|まよ}わんと {来|こ}られた ん ？ {奇跡|きせき} や な 。 || Even Ren. You made it here without getting lost? It's a miracle.
@ ch3/suzu:78 [co.suzu_c_square]
= {呼|よ}ばれて ない けど 、 {呼|よ}ばれた こと に した の 。 サヨ さん に {手紙|てがみ} を {出|だ}したら 、 {舞台|ぶたい} を {一枠|ひとわく} くれた わ 。 || Nobody invited me, so I invited myself. I wrote to Sayo and she gave me a slot on the stage.
> {呼|よ}ばれてへん けど 、 {呼|よ}ばれた こと に した ん や 。 サヨ さん に {手紙|てがみ} {出|だ}したら 、 {舞台|ぶたい} を {一枠|ひとわく} くれはった わ 。 || Nobody invited me, so I invited myself. Wrote to Sayo and she gave me a slot on the stage.
@ ch3/suzu:79 [co.suzu_c_square]
= …… ねえ 、 ガラス {職人|しょくにん} の ヒロ って {人|ひと} 、 どこ で {働|はたら}いてる か {知|し}ってる ？ || …Say, do you know where a glassblower called Hiro works?
> …… なあ 、 ガラス {職人|しょくにん} の ヒロ って {人|ひと} 、 どこ で {働|はたら}いてはる か {知|し}ってる ？ || …Say, you know where a glassblower called Hiro works?
@ ch3/suzu:81 [co.suzu_c_square]
= {知|し}り{合|あ}い …… じゃ ない わ 。 {向|む}こう は {私|わたし} を {覚|おぼ}えて ない もの 。 || Know him… no. He wouldn't remember me.
> {知|し}り{合|あ}い …… ちゃう わ 。 {向|む}こう は うち の こと {覚|おぼ}えてへん もん 。 || Know him… no. He wouldn't remember me.
@ ch3/suzu:82 [co.suzu_c_square]
= …… {夜|よる} は フサ さん の {宿|やど} に いる から 。 {暇|ひま} が あったら {来|き}て 。 {観客|かんきゃく} が {一人|ひとり} {欲|ほ}しい の 。 || …I'm staying at Fusa's inn. If you've a moment this evening, come by. I need an audience of one.
> …… {夜|よる} は フサ さん の {宿|やど} に おる から 。 {暇|ひま} が あったら {来|き}て 。 {観客|かんきゃく} が {一人|ひとり} {欲|ほ}しい ねん 。 || …I'm at Fusa's inn. If you've got a moment this evening, come by. I need an audience of one.
@ ch3/suzu:87 [co.suzu_c_square]
= {夜|よる} は フサ さん の {宿|やど} よ 。 {待|ま}ってる 。 …… {急|いそ}がなくて いい けど 。 || I'm at Fusa's inn in the evenings. I'll be waiting. …No hurry, though.
> {夜|よる} は フサ さん の {宿|やど} や で 。 {待|ま}ってる 。 …… {急|いそ}がん で ええ けど な 。 || I'm at Fusa's inn evenings. I'll be waiting. …No hurry, mind.
@ ch3/suzu:90 [co.suzu_c_inn]
= {来|き}て くれた 。 {座|すわ}って 。 {甘酒|あまざけ} 、 {奢|おご}る わ 。 {帳簿|ちょうぼ} に は {書|か}かない で おいて あげる 。 || You came. Sit. The amazake's on me — and I won't even write it in my book.
> {来|き}て くれた ん や 。 {座|すわ}って 。 {甘酒|あまざけ} 、 {奢|おご}る わ 。 {帳簿|ちょうぼ} に も {書|か}かへん で 。 || You came. Sit. The amazake's on me — and I won't even write it in my book.
@ ch3/suzu:91 [co.suzu_c_inn]
= {二十年前|にじゅうねんまえ} 、 {一座|いちざ} で この {里|さと} の {秋祭|あきまつ}り に {来|き}た の 。 {前|まえ} の {晩|ばん} に {火事|かじ} が あって …… {上|うえ} の {段|だん} が {燃|も}えた 。 || Twenty years ago I came here with my troupe for the festival. The night before, there was a fire… the upper terraces burned.
> {二十年前|にじゅうねんまえ} 、 {一座|いちざ} で この {里|さと} の {秋祭|あきまつ}り に {来|き}てん 。 {前|まえ} の {晩|ばん} に {火事|かじ} が あって …… {上|うえ} の {段|だん} が {燃|も}えた 。 || Twenty years ago I came here with my troupe for the festival. The night before, there was a fire… the upper terraces burned.
@ ch3/suzu:95 [co.suzu_c_inn]
= {私|わたし} は {次|つぎ} の {朝|あさ} に {里|さと} を {出|で}た から 、 {全部|ぜんぶ} {覚|おぼ}えてる 。 {窯|かま} の {女|おんな} の {人|ひと} が {上|うえ} へ {行|い}って 、 {戻|もど}らなかった こと も 。 || I left the next morning, so I remember all of it. Including the woman from the kiln who went up the hill and never came back.
> うち は {次|つぎ} の {朝|あさ} に {里|さと} を {出|で}た から 、 {全部|ぜんぶ} {覚|おぼ}えてる 。 {窯|かま} の {女|おんな} の {人|ひと} が {上|うえ} へ {行|い}って 、 {戻|もど}って けえへんかった こと も 。 || I left the next morning, so I remember all of it. The woman from the kiln who went up the hill and never came back, too.
@ ch3/suzu:96 [co.suzu_c_inn]
= その {人|ひと} の {息子|むすこ} に 、 {私|わたし} 、 {嘘|うそ} を ついた の 。 「 お{母|かあ}さん は {一座|いちざ} と {先|さき} へ {行|い}った 。 {春|はる} に {帰|かえ}って くる 」 って 。 || I lied to her son. I told him, "Your mum's gone on ahead with the troupe. She'll be back in spring."
> その {人|ひと} の {息子|むすこ} に 、 うち 、 {嘘|うそ} ついてん 。 「 お{母|かあ}さん は {一座|いちざ} と {先|さき} へ {行|い}った 。 {春|はる} に {帰|かえ}って くる 」 って 。 || I lied to her son. Told him, "Your mum's gone on ahead with the troupe. She'll be back in spring."
@ ch3/suzu:97 [co.suzu_c_inn]
= その {子|こ} が ヒロ 。 {広場|ひろば} の {空|あ}いた {席|せき} の 。 || That boy is Hiro. The one with the empty seat in the square.
> その {子|こ} が ヒロ や 。 {広場|ひろば} の {空|あ}いた {席|せき} の 。 || That boy is Hiro. The one with the empty seat in the square.
@ ch3/suzu:99 [co.suzu_c_inn]
= {手紙|てがみ} で {返|かえ}そう と した こと も ある 。 {字|じ} が {白|しろ}く {消|き}えた わ 。 {嘘|うそ} だけ が {残|のこ}る の 。 {痛|いた}く ない から 。 || I tried to pay it by letter once. The words faded white. Only the lie stays — it doesn't hurt anyone, you see.
> {手紙|てがみ} で {返|かえ}そう と した こと も ある ねん 。 {字|じ} が {白|しろ}く {消|き}えた わ 。 {嘘|うそ} だけ が {残|のこ}る ねん 。 {痛|いた}く ない から 。 || Tried to pay it back by letter once. The words faded white. Only the lie stays — 'cause it doesn't hurt anybody.
@ ch3/suzu:100 [co.suzu_c_inn]
= …… お{願|ねが}い が ある の 。 ヒロ が {今|いま} 、 あの {席|せき} を どう {思|おも}ってる か 、 {聞|き}いて きて くれない ？ {私|わたし} が {聞|き}く と 、 {顔|かお} に {出|で}ちゃう から 。 || …I've a favour to ask. Would you find out what Hiro thinks about that seat now? If I ask, it'll show on my face.
> …… お{願|ねが}い が ある ねん 。 ヒロ が {今|いま} 、 あの {席|せき} を どない {思|おも}うてる か 、 {聞|き}いて きて くれへん ？ うち が {聞|き}いたら 、 {顔|かお} に {出|で}てまう から 。 || …I've got a favour to ask. Would you find out how Hiro feels about that seat now? If I ask, it'll show on my face.
@ ch3/suzu:107 [co.suzu_c_wait]
= {急|いそ}がなくて いい わ 。 {二十年|にじゅうねん} {待|ま}たせた ん だ もの 。 {数日|すうじつ} くらい 。 || No rush. I've kept him waiting twenty years. What's a few days.
> {急|いそ}がん で ええ よ 。 {二十年|にじゅうねん} {待|ま}たせた ん や もん 。 {数日|すうじつ} くらい 。 || No rush. I've kept him waiting twenty years. What's a few days.
@ ch3/suzu:111 [co.suzu_c_wait]
= …… そう 。 {私|わたし} も 、 あの {子|こ} の {顔|かお} より 、 リボン を {引|ひ}っ{張|ぱ}られた {感|かん}じ の {方|ほう} を {覚|おぼ}えてる 。 || …I see. Same for me. I remember the tug on the ribbon better than his face.
> …… そう か 。 うち も 、 あの {子|こ} の {顔|かお} より 、 リボン {引|ひ}っ{張|ぱ}られた {感|かん}じ の {方|ほう} を {覚|おぼ}えてる 。 || …I see. Same for me. I remember the tug on the ribbon better than his face.
@ ch3/suzu:112 [co.suzu_c_wait]
= {今|いま} {言|い}って も 、 {火事|かじ} ごと {頭|あたま} から {滑|すべ}り{落|お}ちる だけ ね 。 {窯|かま} の {記録|きろく} が {戻|もど}ったら …… その {時|とき} に {言|い}う 。 {約束|やくそく} する わ 。 {帳簿|ちょうぼ} に {書|か}いて おく 。 || If I told him now, it'd slide off his mind along with the fire. When the kiln's record comes back… I'll tell him then. I promise. I'll write it in my book.
> {今|いま} {言|い}うて も 、 {火事|かじ} ごと {頭|あたま} から {滑|すべ}り{落|お}ちる だけ や な 。 {窯|かま} の {記録|きろく} が {戻|もど}ったら …… その {時|とき} に {言|い}う 。 {約束|やくそく} する わ 。 {帳簿|ちょうぼ} に {書|か}いとく 。 || If I told him now, it'd just slide off his mind along with the fire. When the kiln's record comes back… I'll tell him then. I promise. I'll write it in my book.
@ ch3/suzu:119 [co.suzu_truth]
= …… {入|はい}る {前|まえ} に 、 {一|ひと}つ だけ {手伝|てつだ}って 。 {最初|さいしょ} の {一言|ひとこと} 。 {台詞|せりふ} は {得意|とくい} な の 。 {本当|ほんとう} の {台詞|せりふ} {以外|いがい} は 。 || …Before we go in, help me with one thing. The first line. I'm good with lines. Just not true ones.
> …… {入|はい}る {前|まえ} に 、 {一|ひと}つ だけ {手伝|てつだ}って 。 {最初|さいしょ} の {一言|ひとこと} 。 {台詞|せりふ} は {得意|とくい} やねん 。 ほんま の {台詞|せりふ} {以外|いがい} は な 。 || …Before we go in, help me with one thing. The first line. I'm good with lines. Just not the true ones.
@ ch3/suzu:123 [co.suzu_truth]
= {大丈夫|だいじょうぶ} 。 {手|て} は {止|と}めない で 。 その {方|ほう} が 、 {私|わたし} も {言|い}い やすい 。 || That's fine. Don't stop. It's easier for me that way too.
> {大丈夫|だいじょうぶ} 。 {手|て} は そのまま {動|うご}かしてて 。 その {方|ほう} が 、 うち も {言|い}い やすい ねん 。 || It's all right. Don't stop working. It's easier for me that way too.
@ ch3/suzu:124 [co.suzu_truth]
= ヒロ 。 {赤|あか}い リボン の {姉|ねえ}ちゃん を {覚|おぼ}えてる 、 って {言|い}った よ ね 。 || Hiro. You said you remember a girl with a red ribbon.
> ヒロ 。 {赤|あか}い リボン の {姉|ねえ}ちゃん {覚|おぼ}えてる 、 って {言|い}うた よ な 。 || Hiro. You said you remember a girl with a red ribbon.
@ ch3/suzu:127 [co.suzu_truth]
= {色|いろ} は {落|お}ちた けど 、 {物持|ものも}ち は いい の 。 {借|か}り も ね 。 …… ごめん 。 {冗談|じょうだん} で {逃|に}げる の は 、 ここ まで に する 。 || The colour's gone, but I keep things. Debts too. …Sorry. That's the last joke I'll hide behind.
> {色|いろ} は {落|お}ちた けど 、 {物持|ものも}ち は ええ ねん 。 {借|か}り も な 。 …… ごめん 。 {冗談|じょうだん} で {逃|に}げる の は 、 ここ まで に する 。 || The colour's gone, but I hang on to things. Debts too. …Sorry. That's the last joke I hide behind.
@ ch3/suzu:128 [co.suzu_truth]
= あの {朝|あさ} 、 {私|わたし} は {嘘|うそ} を ついた 。 || That morning, I lied to you.
> あの {朝|あさ} 、 うち は {嘘|うそ} ついてん 。 || That morning, I lied to you.
@ ch3/suzu:129 [co.suzu_truth]
= {君|きみ} の お{母|かあ}さん は 、 {一座|いちざ} と {一緒|いっしょ} に {行|い}って ない 。 {前|まえ} の {晩|ばん} の {火事|かじ} で 、 {亡|な}くなった の 。 {上|うえ} の {水門|すいもん} を {開|あ}け に {行|い}って 、 {戻|もど}らなかった 。 || Your mother didn't go with the troupe. She died in the fire the night before. She went up to open the top water gate, and she didn't come back.
> あんた の お{母|かあ}さん は 、 {一座|いちざ} と {一緒|いっしょ} に {行|い}ってへん 。 {前|まえ} の {晩|ばん} の {火事|かじ} で 、 {亡|な}くなった ん や 。 {上|うえ} の {水門|すいもん} を {開|あ}け に {行|い}って 、 {戻|もど}って けえへんかった 。 || Your mother never went with the troupe. She died in the fire the night before. She went up to open the top water gate, and she didn't come back.
@ ch3/suzu:130 [co.suzu_truth]
= {私|わたし} は それ を {知|し}って いて 、 {春|はる} に {帰|かえ}る って {言|い}った 。 {慰|なぐさ}め の つもり だった 。 でも それ は 、 {君|きみ} から {泣|な}く {時間|じかん} を {取|と}り{上|あ}げた 。 || I knew, and I told you she'd be back in spring. I meant it as comfort. But it took away your time to cry.
> うち は それ を {知|し}ってて 、 {春|はる} に {帰|かえ}る って {言|い}うた 。 {慰|なぐさ}め の つもり やった 。 せやけど それ は 、 あんた から {泣|な}く {時間|じかん} を {取|と}り{上|あ}げて もうた 。 || I knew, and I told you she'd be back in spring. I meant it as comfort. But it took away your time to cry.
@ ch3/suzu:140 [co.suzu_truth]
= …… うん 。 || …Yes.
> = || …Yeah.
@ ch3/suzu:144 [co.suzu_truth]
= …… {帳簿|ちょうぼ} に 、 {書|か}いて いい ？ || …Can I write that in my book?
> …… {帳簿|ちょうぼ} に 、 {書|か}いて も ええ ？ || …Can I write that in my book?
@ ch3/suzu:163 [co.suzu_truth]
= …… $name 。 ありがとう 。 {客席|きゃくせき} に いて くれて 。 || …$name. Thank you. For staying in your seat.
> …… $name 。 ありがとう 。 {客席|きゃくせき} に いて くれて 。 || …$name. Thank you. For staying in your seat.
@ ch3/suzu:178 [co.suzu_truth]
= …… {先|さき} に 、 {話|はな}して おく わ ね 。 {二十年前|にじゅうねんまえ} 、 {私|わたし} は {一座|いちざ} で この {里|さと} に いた 。 {火事|かじ} の {次|つぎ} の {朝|あさ} 、 {小|ちい}さな {男|おとこ} の {子|こ} に {嘘|うそ} を ついた 。 お{母|かあ}さん は {一座|いちざ} と {先|さき} へ {行|い}った 、 {春|はる} に {帰|かえ}る 、 って 。 || …Let me tell you first. Twenty years ago I was here with a troupe. The morning after the fire, I lied to a little boy. I told him his mother had gone ahead with the troupe and would be back in spring.
> …… {先|さき} に 、 {話|はな}しとく わ な 。 {二十年前|にじゅうねんまえ} 、 うち は {一座|いちざ} で この {里|さと} に おってん 。 {火事|かじ} の {次|つぎ} の {朝|あさ} 、 {小|ちい}さな {男|おとこ} の {子|こ} に {嘘|うそ} ついた 。 お{母|かあ}さん は {一座|いちざ} と {先|さき} へ {行|い}った 、 {春|はる} に {帰|かえ}る 、 って 。 || …Let me tell you first. Twenty years ago I was here with a troupe. The morning after the fire, I lied to a little boy. Told him his mother had gone ahead with the troupe and would be back come spring.
@ ch3/suzu:179 [co.suzu_truth]
= その {子|こ} が ヒロ 。 {帳簿|ちょうぼ} に 、 {二十年|にじゅうねん} {線|せん} を {引|ひ}けない {借|か}り が ある の 。 {今日|きょう} 、 {返|かえ}す 。 || That boy is Hiro. There's a debt in my book I haven't been able to cross out for twenty years. Today I pay it.
> その {子|こ} が ヒロ や 。 {帳簿|ちょうぼ} に 、 {二十年|にじゅうねん} {線|せん} が {引|ひ}かれへん {借|か}り が ある ねん 。 {今日|きょう} 、 {返|かえ}す 。 || That boy is Hiro. There's a debt in my book I haven't been able to cross out for twenty years. Today I pay it.
@ ch3/suzu:185 [co.suzu_c_after]
= {明日|あした} 、 {発|た}つ わ 。 {次|つぎ} の {町|まち} で 、 {次|つぎ} の {舞台|ぶたい} 。 …… {来年|らいねん} の {秋|あき} は 、 {予定|よてい} が {入|はい}ってる の 。 {隣|となり} の {席|せき} に ね 。 || I'm off tomorrow. Next town, next stage. …Next autumn I'm booked, though. The seat next door.
> {明日|あした} 、 {発|た}つ わ 。 {次|つぎ} の {町|まち} で 、 {次|つぎ} の {舞台|ぶたい} 。 …… {来年|らいねん} の {秋|あき} は 、 {予定|よてい} が {入|はい}ってる ねん 。 {隣|となり} の {席|せき} に な 。 || I'm off tomorrow. Next town, next stage. …Next autumn I'm booked, though. The seat next door.
@ ch3/suzu:186 [co.suzu_c_after]
= {帳簿|ちょうぼ} の {最後|さいご} の {頁|ページ} 、 {見|み}る ？ 「 {一部|いちぶ} {返済|へんさい} 」 。 {線|せん} を {引|ひ}かない {借|か}り が ある なんて 、 {知|し}らなかった 。 || Want to see the last page of my book? "Paid in part." I never knew there were debts you don't cross out.
> {帳簿|ちょうぼ} の {最後|さいご} の {頁|ページ} 、 {見|み}る ？ 「 {一部|いちぶ} {返済|へんさい} 」 。 {線|せん} {引|ひ}かへん {借|か}り が ある なんて 、 {知|し}らんかった わ 。 || Wanna see the last page of my book? "Paid in part." Never knew there were debts you don't cross out.
@ ch3/suzu:187 [co.suzu_c_after]
= ナオ 。 あなた の {鞄|かばん} の {底|そこ} の {手紙|てがみ} 、 {重|おも}そう ね 。 …… {私|わたし} が {言|い}える {立場|たちば} じゃ ない けど 。 || Nao. The letter at the bottom of your bag looks heavy. …Not that I'm one to talk.
> ナオ 。 あんた の {鞄|かばん} の {底|そこ} の {手紙|てがみ} 、 {重|おも}そう や な 。 …… うち が {言|い}える {立場|たちば} ちゃう けど 。 || Nao. That letter at the bottom of your bag looks heavy. …Not that I'm one to talk.
@ ch3/suzu:191 [co.suzu_c_post]
= あら 、 $name ！ {今年|ことし} も {返済|へんさい} に {来|き}た の 。 {残|のこ}り 、 {十八回|じゅうはっかい} 。 {利子|りし} は {柿|かき} で {払|はら}ってる わ 。 || Oh, $name! Here to make this year's payment. Eighteen to go. I'm paying the interest in persimmons.
> あら 、 $name ！ {今年|ことし} も {返済|へんさい} に {来|き}た ん や 。 {残|のこ}り 、 {十八回|じゅうはっかい} 。 {利子|りし} は {柿|かき} で {払|はら}ってる ねん 。 || Oh, $name! Here to make this year's payment. Eighteen to go. I'm paying the interest in persimmons.
@ ch3/suzu:192 [co.suzu_c_post]
= {灯落|ひおち} で 、 {番人|ばんにん} さん が {皆|みな} の {前|まえ} に {立|た}った ん です って ね 。 {観客|かんきゃく} の {前|まえ} に {立|た}つ の は 、 {怖|こわ}い の よ 。 {私|わたし} は {知|し}ってる 。 || I heard the keeper stood before everyone in Lanternfall. Standing in front of an audience is frightening. I'd know.
> {灯落|ひおち} で 、 {番人|ばんにん} さん が {皆|みな} の {前|まえ} に {立|た}ちはった ん やて な 。 {観客|かんきゃく} の {前|まえ} に {立|た}つ の は 、 {怖|こわ}い ねん で 。 うち は {知|し}ってる 。 || I heard the keeper stood up in front of everybody in Lanternfall. Standing before an audience is scary, y'know. I'd know.
@ ch3/suzu:193 [co.suzu_c_post]
= {番人|ばんにん} さん は 、 {山|やま} で {書庫|しょこ} を {守|まも}ってる の よ ね 。 {誰|だれ} か が {見|み}て いて くれる の は 、 {悪|わる}く ない こと よ 。 {観客|かんきゃく} が いれば 、 {人|ひと} は {逃|に}げない から 。 || The keeper's minding the archive in the mountains, isn't it. Having someone watch you isn't a bad thing. With an audience, people don't run.
> {番人|ばんにん} さん は 、 {山|やま} で {書庫|しょこ} を {守|まも}ってはる ん やろ 。 {誰|だれ} か が {見|み}てて くれる の は 、 {悪|わる}い こと ちゃう で 。 {観客|かんきゃく} が おったら 、 {人|ひと} は {逃|に}げへん から 。 || The keeper's minding the archive up in the mountains, right? Having somebody watch you isn't a bad thing. With an audience, folks don't run.
@ ch3/suzu:196 [co.fest_suzu_c]
= {次|つぎ} が {私|わたし} の {番|ばん} な の 。 {二十年前|にじゅうねんまえ} に {踊|おど}る はず だった {演目|えんもく} 。 {台詞|せりふ} は {三|みっ}つ だけ 。 {全部|ぜんぶ} 、 {本当|ほんとう} の こと よ 。 || I'm on next. The piece I was meant to dance twenty years ago. Only three lines. All of them true.
> {次|つぎ} が うち の {番|ばん} やねん 。 {二十年前|にじゅうねんまえ} に {踊|おど}る はず やった {演目|えんもく} 。 {台詞|せりふ} は {三|みっ}つ だけ 。 {全部|ぜんぶ} 、 ほんま の こと や で 。 || I'm on next. The piece I was meant to dance twenty years ago. Only three lines. Every one of 'em true.
@ ch3/suzu:197 [co.fest_suzu_c]
= {見|み}て て 。 {観客|かんきゃく} {一名|いちめい} 、 {最後|さいご} まで {席|せき} を {立|た}たず に ね 。 || Watch me. Audience of one, stay in your seat to the end.
> {見|み}てて な 。 {観客|かんきゃく} {一名|いちめい} 、 {最後|さいご} まで {席|せき} を {立|た}たんと な 。 || Watch me, now. Audience of one — stay in your seat to the end.
@ ch3/festival:32 [co.fest_hiro]
= {分|わ}かってる わ よ 。 {帳簿|ちょうぼ} {通|どお}り に ね 。 || I know, I know. By the book.
> {分|わ}かってる って 。 {帳簿|ちょうぼ} {通|どお}り に な 。 || I know, I know. By the book.
@ ch3/banter:76 [co.b_suzu1]
= この {里|さと} の {舞台|ぶたい} 、 {見|み}た ？ {板|いた} が {新|あたら}しい の よ 。 {良|よ}い {音|おと} が しそう 。 {踏|ふ}んで みたい わ 。 || Have you seen the stage here? New boards. It'll sound lovely. I'd like to stamp on it.
> この {里|さと} の {舞台|ぶたい} 、 {見|み}た ？ {板|いた} が {新|あたら}しい ねん 。 ええ {音|おと} しそう や わ 。 {踏|ふ}んで みたい わ 。 || You seen the stage here? Brand-new boards. Bet they sound lovely. I'd love to stamp on 'em.
@ ch3/banter:78 [co.b_suzu1]
= …… {今|いま} は いい 。 {客席|きゃくせき} で {見|み}る {方|ほう} が {好|す}き な の 。 {嘘|うそ} よ 。 …… {嘘|うそ} じゃ ない かも 。 || …Not now. I prefer watching from the audience. That's a lie. …Maybe not a lie.
> …… {今|いま} は ええ 。 {客席|きゃくせき} で {見|み}る {方|ほう} が {好|す}き やねん 。 {嘘|うそ} や で 。 …… {嘘|うそ} ちゃう かも 。 || …Not now. I'd rather watch from the seats. That's a lie. …Maybe not a lie.
@ ch3/banter:81 [co.b_suzu2]
= {私|わたし} の {帳簿|ちょうぼ} 、 {気|き} に なる ？ {潮硝子|しおがらす} の {宿|やど} に {二泊|にはく} {分|ぶん} 、 ナオ に {鉛筆|えんぴつ} {一本|いっぽん} 、 ミオ に {頭痛|ずつう} {薬|ぐすり} {一包|ひとつつみ} 。 || Curious about my account book? Two nights at an inn in Saltglass, one pencil to Nao, a packet of headache powder to Mio.
> うち の {帳簿|ちょうぼ} 、 {気|き} に なる ？ {潮硝子|しおがらす} の {宿|やど} に {二泊|にはく} {分|ぶん} 、 ナオ に {鉛筆|えんぴつ} {一本|いっぽん} 、 ミオ に {頭痛|ずつう} {薬|ぐすり} {一包|ひとつつみ} 。 || Curious about my account book? Two nights at an inn in Saltglass, one pencil to Nao, a packet of headache powder to Mio.
@ ch3/banter:82 [co.b_suzu2]
= {借|か}り を {書|か}いて おく と 、 {自分|じぶん} が {誰|だれ} に {世話|せわ} に なった か {忘|わす}れない の 。 {旅芸人|たびげいにん} は 、 {忘|わす}れられる {側|がわ} だ から 。 せめて {自分|じぶん} は {忘|わす}れない よう に 。 || If I write down my debts, I never forget who looked after me. Travelling players are the ones who get forgotten. So I, at least, try not to forget.
> {借|か}り を {書|か}いとく と 、 {自分|じぶん} が {誰|だれ} に {世話|せわ} に なった か {忘|わす}れへん ねん 。 {旅芸人|たびげいにん} は 、 {忘|わす}れられる {側|がわ} や から 。 せめて {自分|じぶん} は {忘|わす}れへん よう に な 。 || If I write down my debts, I never forget who looked after me. Travelling players are the ones who get forgotten. So I, at least, try not to forget.
@ ch3/banter:85 [co.b_suzu3]
= {熱|あつ}い ！ {化粧|けしょう} が {流|なが}れる ！ …… して ない けど 。 {気分|きぶん} の {問題|もんだい} よ 。 || Hot! My make-up's running! …I'm not wearing any. It's the principle.
> {熱|あつ}い ！ {化粧|けしょう} が {流|なが}れる ！ …… してへん けど 。 {気分|きぶん} の {問題|もんだい} や 。 || Hot! My make-up's running! …I'm not wearing any. It's the principle of the thing.
@ ch3/banter:86 [co.b_suzu3]
= …… あの {夜|よる} 、 {下|した} から {見|み}てた の 。 {上|うえ} が {赤|あか}く {光|ひか}って 、 {鐘|かね} が {鳴|な}り{止|や}まなくて 。 {誰|だれ} か が 、 {火|ひ} の {方|ほう} へ {上|のぼ}って いく の が {見|み}えた 。 || …That night I watched from below. The hill glowing red, the bell that wouldn't stop. And someone climbing up towards the fire.
> …… あの {夜|よる} 、 {下|した} から {見|み}ててん 。 {上|うえ} が {赤|あか}く {光|ひか}って 、 {鐘|かね} が {鳴|な}り{止|や}まへん 。 {誰|だれ} か が 、 {火|ひ} の {方|ほう} へ {上|のぼ}って いく の が {見|み}えた 。 || …That night I watched from below. The hill glowing red, the bell that wouldn't stop. And somebody climbing up towards the fire.
@ ch3/banter:87 [co.b_suzu3]
= {今|いま} {思|おも}えば 、 あれ が トモエ さん だった の ね 。 || Now I think about it, that must have been Tomoe.
> {今|いま} {思|おも}うたら 、 あれ が トモエ さん やった ん や な 。 || Thinking back now, that must've been Tomoe.
@ ch3/banter:91 [co.b_suzu4]
= …… {手|て} が {震|ふる}えてる の 。 {初日|しょにち} の {幕|まく} が {上|あ}がる {前|まえ} より 、 ずっと 。 || …My hands are shaking. Much worse than before any opening night.
> …… {手|て} が {震|ふる}えてる ねん 。 {初日|しょにち} の {幕|まく} が {上|あ}がる {前|まえ} より 、 ずっと 。 || …My hands are shaking. Way worse than before any opening night.
@ ch3/banter:92 [co.b_suzu4]
= でも 、 {逃|に}げない わ 。 {観客|かんきゃく} が いる もの 。 || But I won't run. I've got an audience.
> せやけど 、 {逃|に}げへん で 。 {観客|かんきゃく} が おる もん 。 || But I won't run. I've got an audience.
@ ch3/banter:95 [co.b_suzu4]
= 「 {一部|いちぶ} {返済|へんさい} 」 。 …… {変|へん} な の 。 {全部|ぜんぶ} {返|かえ}した とき より 、 {軽|かる}い {気|き} が する 。 || "Paid in part." …Funny. It feels lighter than paying in full ever did.
> 「 {一部|いちぶ} {返済|へんさい} 」 。 …… {変|へん} な の 。 {全部|ぜんぶ} {返|かえ}した とき より 、 {軽|かる}い {気|き} が する ねん 。 || "Paid in part." …Funny thing. Feels lighter than paying in full ever did.
@ ch3/banter:96 [co.b_suzu4]
= {残|のこ}り {十九回|じゅうきゅうかい} 。 {毎年|まいとし} {秋|あき} に 、 {灰実|はいみ} に {来|く}る {理由|りゆう} が できた わ 。 || Nineteen to go. Now I've a reason to come to Cinder Orchard every autumn.
> {残|のこ}り {十九回|じゅうきゅうかい} 。 {毎年|まいとし} {秋|あき} に 、 {灰実|はいみ} に {来|く}る {理由|りゆう} が できた わ 。 || Nineteen to go. Now I've got a reason to come to Cinder Orchard every autumn.
@ ch3/banter:99 [co.b_suzu5]
= ね 、 $name 。 {帳簿|ちょうぼ} の {新|あたら}しい {頁|ページ} に 、 あなた の {名前|なまえ} を {書|か}いた の 。 {何|なに} を {借|か}りた か は …… {内緒|ないしょ} 。 || Hey, $name. I've written your name on a new page in my book. What I owe you is… a secret.
> なあ 、 $name 。 {帳簿|ちょうぼ} の {新|あたら}しい {頁|ページ} に 、 あんた の {名前|なまえ} {書|か}いた ん や 。 {何|なに} を {借|か}りた か は …… {内緒|ないしょ} 。 || Hey, $name. I wrote your name on a new page in my book. What I owe you is… a secret.
@ ch3/banter:100 [co.b_suzu5]
= {返|かえ}す {時|とき} に {教|おし}える わ 。 {返|かえ}せる か どう か は 、 {分|わ}から ない けど ね 。 || I'll tell you when I pay it back. Whether I ever can is another matter.
> {返|かえ}す {時|とき} に {教|おし}えたる わ 。 {返|かえ}せる か どう か は 、 {分|わ}からん けど な 。 || I'll tell you when I pay it back. Whether I ever can is another matter.
`, 'dialect/kansai_30_ch3');
