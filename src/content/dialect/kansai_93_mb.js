/* Suzu's Kansai-ben: Manybridge, Chapter 3 (expansion P08). A city that talks the way she does.
 * Format and rules: src/lang/85_dialect.js, docs/dialect/suzu_kansai.md.
 * "=" the standard line as authored (the key: its Japanese); ">" the Kansai version. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.dialect.add('kansai', `
@ mb/20_scenes_arrive [mb.ferry_tetsu]
= {八百橋|やおばし} ！ {芝居|しばい} と お{祭|まつ}り の {町|まち} よ 。 …… {迷子|まいご} に なる の は 、 {舟|ふね} だけ に して ほしい わ ね 。 || Manybridge! A city of theatre and festivals. …Let's hope it's only the boats that get lost.
> {八百橋|やおばし} ！ {芝居|しばい} と お{祭|まつ}り の {町|まち} や で 。 …… {迷子|まいご} に なる の は 、 {舟|ふね} だけ に して ほしい わ 。 || Manybridge! Town of theatre and festivals. …Here's hopin' it's only the boats that get lost.
@ mb/20_scenes_arrive [mb.north_washed]
= {北|きた} が だめ なら 、 {東|ひがし} よ 。 {道|みち} は {一|ひと}つ じゃ ない わ 。 || If north's no good, then east. There's more than one road.
> {北|きた} が あかん なら 、 {東|ひがし} や 。 {道|みち} は {一|ひと}つ や ない で 。 || If north's no good, then east. There's more than one road, y'know.
@ mb/20_scenes_arrive [mb.arrive]
= {着|つ}いた わ よ 、 {八百橋|やおばし} ！ …… {町|まち} は {賑|にぎ}やか な のに 、 {橋|はし} が {黙|だま}って いる の ね 。 || Here we are, Manybridge! …The city's as loud as ever, but the bridges have gone quiet.
> {着|つ}いた で 、 {八百橋|やおばし} ！ …… {町|まち} は {賑|にぎ}やか や のに 、 {橋|はし} が {黙|だま}って もうてる ねん な 。 || Here we are, Manybridge! …Town's loud as ever, but the bridges have gone quiet.
@ mb/20_scenes_arrive [mb.exchange_first]
= {大声|おおごえ} の {掛|か}け{合|あ}い 、 {懐|なつ}かしい わ 。 …… でも 、 {今日|きょう} の は {芝居|しばい} じゃ ない みたい ね 。 || Shouting matches — how nostalgic. …But today's isn't a play, by the look of it.
> {大声|おおごえ} の {掛|か}け{合|あ}い 、 {懐|なつ}かしい わ あ 。 …… せやけど 、 {今日|きょう} の は {芝居|しばい} や ない みたい や な 。 || Shoutin' matches — takes me back. …Mind you, today's ain't a play, by the look of it.
@ mb/21_scenes_main [mb.fujiko_first]
= {三度|さんど} も {消|き}える {米|こめ} 、 {手品|てじな} なら {大当|おおあ}たり だけど ね 。 || Rice that vanishes three times over — as a magic act, it'd be a hit.
> {三度|さんど} も {消|き}える {米|こめ} 、 {手品|てじな} やったら {大当|おおあ}たり や けど な 。 || Rice that vanishes three times over — as a magic act, it'd be a smash.
@ mb/21_scenes_main [mb.route_table]
= 「{言|い}われた {通|とお}り に しか {行|い}かない 」 。 {台本|だいほん} {通|どお}り の {役者|やくしゃ} みたい ね 。 || "Only where it's told." Like an actor who sticks to the script.
> 「{言|い}われた {通|とお}り に しか {行|い}かへん 」 。 {台本|だいほん} {通|どお}り の {役者|やくしゃ} みたい や な 。 || "Only goes where it's told." Like an actor who sticks to the script.
@ mb/21_scenes_main [mb.route_table]
= {舞台|ぶたい} でも 、 {役者|やくしゃ} それぞれ に {合|あ}う {台詞|せりふ} が ある の よ 。 {守|まも}る の も 、 {一人|ひとり} ずつ {合|あ}わせれば いい わ 。 || On stage, every actor has the lines that suit them. Protecting can be fitted one at a time too.
> {舞台|ぶたい} でも 、 {役者|やくしゃ} それぞれ に {合|あ}う {台詞|せりふ} が ある ねん 。 {守|まも}る の も 、 {一人|ひとり} ずつ {合|あ}わせたら ええ ねん 。 || On stage, every actor's got the lines that suit 'em. Protecting can be fitted one at a time too.
@ mb/21_scenes_main [mb.sen_dispute]
= {舞台|ぶたい} でも ね 、 {間|ま} が {一番|いちばん} {難|むずか}しい の 。 {何|なに} も {言|い}わない で {待|ま}つ と 、 {相手|あいて} が {本音|ほんね} を {言|い}う こと が ある わ 。 || On stage, the pause is the hardest thing. Wait without saying anything, and sometimes the other person says what they really mean.
> {舞台|ぶたい} でも な 、 {間|ま} が {一番|いちばん} {難|むずか}しい ねん 。 {何|なん} も {言|い}わんと {待|ま}って たら 、 {相手|あいて} が {本音|ほんね} {言|い}う こと が ある ねん で 。 || On stage, see, the pause is the hardest bit. Say nothin' and wait, and sometimes the other one says what they really mean.
@ mb/21_scenes_main [mb.dispute_after]
= {一番|いちばん} {古|ふる}い {名前|なまえ} を {知|し}ってる の は 、 {一番|いちばん} {古|ふる}い {人|ひと} か 、 {一番|いちばん} {古|ふる}い {紙|かみ} ね 。 || Whoever knows the oldest name: the oldest person, or the oldest paper.
> {一番|いちばん} {古|ふる}い {名前|なまえ} {知|し}ってる ん は 、 {一番|いちばん} {古|ふる}い {人|ひと} か 、 {一番|いちばん} {古|ふる}い {紙|かみ} や な 。 || Whoever knows the oldest name: the oldest person, or the oldest paper.
@ mb/21_scenes_main [mb.uno_evening]
= {行|い}きましょう 。 …… {大|おお}きな {声|こえ} で {呼|よ}ぶ の は 、 {私|わたし} の {得意|とくい} よ 。 || Let's go. …Calling out loud is my speciality.
> {行|い}こ 。 …… {大|おお}きい {声|こえ} で {呼|よ}ぶ の は 、 うち の {得意|とくい} や で 。 || Let's go. …Callin' out loud's my speciality.
@ mb/21_scenes_main [mb.ichi_found]
= {泣|な}かなかった の ね 。 {立派|りっぱ} な {役者|やくしゃ} よ 。 {帰|かえ}ったら 、 {拍手|はくしゅ} して あげる 。 || You didn't cry. A fine performer. When we get home, I'll give you a round of applause.
> {泣|な}かへん かった ん や な 。 {立派|りっぱ} な {役者|やくしゃ} や で 。 {帰|かえ}ったら 、 {拍手|はくしゅ} したる わ 。 || You didn't cry. A proper performer. When we get home, I'll give you a round of applause.
@ mb/21_scenes_main [mb.morning_after]
= …… {笑|わら}って {済|す}む {話|はなし} じゃ なく なった わ ね 。 {一番|いちばん} の {橋|はし} 、 {名前|なまえ} を {返|かえ}して もらいましょう 。 || …This isn't something to laugh off any more. Let's get the first bridge its name back.
> …… {笑|わら}って {済|す}む {話|はなし} や なくなった な 。 {一番|いちばん} の {橋|はし} 、 {名前|なまえ} {返|かえ}して もらお 。 || …This ain't somethin' to laugh off any more. Let's get the first bridge its name back.
@ mb/22_scenes_side [mb.noodle_done]
= {赤|あか} と {青|あお} の {二枚看板|にまいかんばん} 。 お{祭|まつ}り の {目玉|めだま} に なる わ よ 。 || Red and blue, a double bill. They'll be the talk of the festival.
> {赤|あか} と {青|あお} の {二枚看板|にまいかんばん} 。 お{祭|まつ}り の {目玉|めだま} に なる で 。 || Red and blue, a double bill. They'll be the talk of the festival, mark me.
@ mb/22_scenes_side [mb.lc_inside]
= {六十年|ろくじゅうねん} の {幕間|まくあい} ね 。 {次|つぎ} の {幕|まく} 、 {始|はじ}めましょう 。 || A sixty-year interval. Let's start the next act.
> {六十年|ろくじゅうねん} の {幕間|まくあい} や な 。 {次|つぎ} の {幕|まく} 、 {始|はじ}めよ か 。 || A sixty-year interval. Shall we start the next act?
`, 'kansai_93_mb.js');

RB.dialect.add('kansai', `
@ mb/23_scenes_under [mb.under_arrive]
= {舞台|ぶたい} の {奈落|ならく} みたい ね 。 …… {観客|かんきゃく} が {水|みず} だけ って いう の が 、 {寂|さび}しい けど 。 || Like the pit under a stage. …Only, the audience is all water, which is a bit lonely.
> {舞台|ぶたい} の {奈落|ならく} みたい や な 。 …… {観客|かんきゃく} が {水|みず} だけ って いう の が 、 {寂|さび}しい けど 。 || Like the pit under a stage. …Only the audience is all water, which is a bit lonely.
@ mb/23_scenes_under [mb.firstbridge_arrive]
= {役|やく} の {名前|なまえ} を {忘|わす}れた {役者|やくしゃ} は 、 {舞台|ぶたい} に {立|た}てない の よ 。 {思|おも}い{出|だ}させて あげましょう 。 || An actor who's forgotten their part's name can't go on. Let's help it remember.
> {役|やく} の {名前|なまえ} {忘|わす}れた {役者|やくしゃ} は 、 {舞台|ぶたい} に {立|た}たれへん ねん 。 {思|おも}い{出|だ}さして あげよ 。 || An actor who's forgotten their part's name can't go on, see. Let's help it remember.
@ mb/23_scenes_under [mb.bridge_named]
= {名台詞|めいぜりふ} は 、 {名前|なまえ} {一|ひと}つ で {十分|じゅうぶん} ね 。 {幕|まく} ！ || The best line was just a name. Curtain!
> {名台詞|めいぜりふ} は 、 {名前|なまえ} {一|ひと}つ で {十分|じゅうぶん} や な 。 {幕|まく} ！ || The best line was just a name. Curtain!
@ mb/23_scenes_under [mb.chapter_end]
= {刷|す}り{物|もの} の {通|とお}り 、 {版木|はんぎ} の {町|まち} 。 {川上|かわかみ} ね 。 {次|つぎ} の {幕|まく} は 、 そこ よ 。 || Blockprint Row, upriver. That's where the next act is.
> {刷|す}り{物|もの} の {通|とお}り 、 {版木|はんぎ} の {町|まち} 。 {川上|かわかみ} や な 。 {次|つぎ} の {幕|まく} は 、 そこ や で 。 || Blockprint Row, upriver. That's where the next act is, mark me.
`, 'kansai_93_mb.js (the Undercroft)');
