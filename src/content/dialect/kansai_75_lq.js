/* Suzu's Kansai-ben: The long roads (Koharuno, the fare).
 * Format and rules: src/lang/85_dialect.js, docs/dialect/suzu_kansai.md.
 * "=" the standard line as authored (the key: its Japanese); ">" the Kansai version. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.dialect.add('kansai', `
@ lq/30_fare:17 [lq.fare_koji]
= {未払|みばら}い が {一件|いっけん} 。 {帳簿|ちょうぼ} の {話|はなし} なら 、 {私|わたし} の {得意|とくい} {分野|ぶんや} だ よ 。 || One outstanding payment. If it's a matter of accounts, that's my speciality.
> {未払|みばら}い が {一件|いっけん} 。 {帳簿|ちょうぼ} の {話|はなし} やったら 、 うち の {得意|とくい} {分野|ぶんや} や で 。 || One outstanding payment. If it's a matter of accounts, that's right up my alley.
@ lq/30_fare:38 [lq.fare_book]
= {判子|はんこ} が {借用書|しゃくようしょ} の {代|か}わり か 。 {貸|か}した {方|ほう} は {三十年|さんじゅうねん} {待|ま}った 。 {利子|りし} は …… {言|い}わない で おこう 。 || So the seal stands in for an IOU. The lender waited thirty years. The interest… let's not.
> {判子|はんこ} が {借用書|しゃくようしょ} の {代|か}わり か 。 {貸|か}した {方|ほう} は {三十年|さんじゅうねん} {待|ま}った 。 {利子|りし} は …… {言|い}わんとこ 。 || So the seal stands in for an IOU. The lender waited thirty years. The interest… let's not go there.
@ lq/30_fare:62 [lq.fare_tamae]
= この {宿|やど} は 、 {借|か}り を {気長|きなが} に {待|ま}って くれる ん だ よ ね 。 {私|わたし} も {知|し}ってる 。 || This inn is very patient about debts. I should know.
> この {宿|やど} は 、 {借|か}り を {気長|きなが} に {待|ま}って くれはる ねん な 。 うち も {知|し}ってる 。 || This inn's real patient about debts. I oughta know.
@ lq/30_fare:75 [lq.fare_fusa]
= {帳簿|ちょうぼ} に {書|か}かない {借|か}り も ある 。 {一番|いちばん} {重|おも}い やつ だ よ 。 || Some debts never go in the books. They're the heaviest kind.
> {帳簿|ちょうぼ} に {書|か}かへん {借|か}り も ある 。 {一番|いちばん} {重|おも}い やつ や で 。 || Some debts never go in the books. They're the heaviest kind.
@ lq/30_fare:84 [lq.chigusa_idle]
= {舞台|ぶたい} の {前|まえ} に {一杯|いっぱい} 、 {欲|ほ}しい {味|あじ} だ ね 。 || The sort of cup you want before a show.
> {舞台|ぶたい} の {前|まえ} に {一杯|いっぱい} 、 {欲|ほ}しい {味|あじ} や な 。 || The sort of cup you want before a show.
@ lq/30_fare:112 [lq.fare_chigusa]
= {私|わたし} は ね 、 {借|か}り を {全部|ぜんぶ} {帳面|ちょうめん} に {付|つ}けてる 。 {遅|おく}れて {返|かえ}した {借|か}り は 、 {返|かえ}さなかった {借|か}り より ずっと {軽|かる}い よ 。 …… {持|も}ち{続|つづ}けた もの は 、 {重|おも}く なる ばかり だ から 。 || I keep every debt I owe in a notebook. A debt paid late weighs far less than one never paid. …Things you keep carrying only get heavier.
> うち は な 、 {借|か}り を {全部|ぜんぶ} {帳面|ちょうめん} に {付|つ}けてる ねん 。 {遅|おく}れて {返|かえ}した {借|か}り は 、 {返|かえ}さへんかった {借|か}り より ずっと {軽|かる}い で 。 …… {持|も}ち{続|つづ}けた もん は 、 {重|おも}く なる ばっかり や から 。 || I keep every debt I owe in a notebook. A debt paid late weighs a whole lot less than one never paid. …Things you keep carrying only get heavier.
@ lq/30_fare:131 [lq.fare_chigusa]
= {舞台|ぶたい} の {袖|そで} で {出番|でばん} を {待|ま}つ の は 、 もう おしまい 。 {次|つぎ} の {戦|たたか}い から 、 {出|で}る べき {時|とき} は {自分|じぶん} で {出|で}る よ 。 {合図|あいず} は いらない 。 || No more waiting in the wings for my cue. From the next fight, when it's time to step out, I'll step out on my own. No signal needed.
> {舞台|ぶたい} の {袖|そで} で {出番|でばん} {待|ま}つ の は 、 もう おしまい や 。 {次|つぎ} の {戦|たたか}い から 、 {出|で}る べき {時|とき} は {自分|じぶん} で {出|で}る で 。 {合図|あいず} は いらん 。 || No more waiting in the wings for my cue. From the next fight on, when it's time to step out, I'll step out on my own. No signal needed.
@ lq/30_fare:167 [lq.fare_pay]
= {帳尻|ちょうじり} が {合|あ}った ！ {三十年|さんじゅうねん} {越|ご}し の {決算|けっさん} だ よ 。 || The books balance! A reckoning thirty years in the making.
> {帳尻|ちょうじり} が {合|あ}った ！ {三十年|さんじゅうねん} {越|ご}し の {決算|けっさん} や で 。 || The books balance! A reckoning thirty years in the making.
@ lq/30_fare:188 [lq.fare_gull]
= {借|か}り を {返|かえ}した {人|ひと} の {顔|かお} って 、 {舞台|ぶたい} を {降|お}りた {役者|やくしゃ} と {同|おな}じ だ よ 。 {疲|つか}れて 、 {軽|かる}くて 、 ちょっと {寂|さび}しい 。 || Someone who's just paid off a debt has the same face as an actor coming off stage. Tired, light, and a little lonely.
> {借|か}り を {返|かえ}した {人|ひと} の {顔|かお} って 、 {舞台|ぶたい} を {降|お}りた {役者|やくしゃ} と {同|おんな}じ や で 。 {疲|つか}れて 、 {軽|かる}くて 、 ちょっと {寂|さび}しい 。 || Somebody who's just paid off a debt has the same face as an actor coming off stage. Tired, light, and a little lonesome.
@ lq/40_road:11 [lq.road_lantern]
= {誰|だれ} も {台詞|せりふ} を {覚|おぼ}えて いない {芝居|しばい} の {舞台|ぶたい} だ ね 。 || A stage for a play nobody remembers the lines to.
> {誰|だれ} も {台詞|せりふ} {覚|おぼ}えてへん {芝居|しばい} の {舞台|ぶたい} や な 。 || A stage for a play nobody remembers the lines to.
@ lq/40_road:26 [lq.road_loops]
= {舞台|ぶたい} の {袖|そで} に {入|はい}ったら 、 {反対|はんたい} の {袖|そで} から {出|で}て きた 。 {古|ふる}い {手品|てじな} だ よ 。 || Walk off into the wings and come back on from the other side. It's an old trick.
> {舞台|ぶたい} の {袖|そで} に {入|はい}ったら 、 {反対|はんたい} の {袖|そで} から {出|で}て きた 。 {古|ふる}い {手品|てじな} や で 。 || Walk off into the wings and come right back on from the other side. Oldest trick in the book.
@ lq/40_road:45 [lq.road_yasu1]
= {名前|なまえ} は {忘|わす}れて も 、 {柿|かき} の {味|あじ} は {覚|おぼ}えてる 。 {舌|した} の {方|ほう} が {物覚|ものおぼ}え が いい ね 。 || He's forgotten the name but not the taste. His tongue has the better memory.
> {名前|なまえ} は {忘|わす}れて も 、 {柿|かき} の {味|あじ} は {覚|おぼ}えてはる 。 {舌|した} の {方|ほう} が {物覚|ものおぼ}え が ええ な 。 || He's forgotten the name but not the taste. His tongue's got the better memory.
@ lq/40_road:67 [lq.road_tetsu]
= {逃|に}げる {時|とき} に {持|も}って いく もの で 、 その {人|ひと} が {分|わ}かる って {言|い}う よ ね 。 {枝|えだ} か あ 。 || They say what people take when they run tells you who they are. Branches, huh.
> {逃|に}げる {時|とき} に {持|も}って いく もん で 、 その {人|ひと} が {分|わ}かる って {言|い}う やん 。 {枝|えだ} か あ 。 || They say what folks take when they run tells you who they are. Branches, huh.
@ lq/40_road:84 [lq.road_ume]
= {借|か}りた {名前|なまえ} で {生|い}き{延|の}びて きた わけ だ 。 {芸名|げいめい} みたい な もん だ ね 。 || So it's lived on under a borrowed name. Like a stage name.
> {借|か}りた {名前|なまえ} で {生|い}き{延|の}びて きた わけ や 。 {芸名|げいめい} みたい な もん や な 。 || So it's lived on under a borrowed name. Like a stage name.
@ lq/40_road:100 [lq.road_yasu2]
= いい {台詞|せりふ} だった 。 {三十年|さんじゅうねん} {待|ま}った {甲斐|かい} が ある よ 。 || That was a good line. Worth thirty years of waiting.
> ええ {台詞|せりふ} やった 。 {三十年|さんじゅうねん} {待|ま}った {甲斐|かい} が ある わ 。 || That was a good line. Worth thirty years of waiting.
@ lq/40_road:121 [lq.road_write]
= {二枚|にまい}{看板|かんばん} って やつ だ ね ！ …… {真面目|まじめ} に {言|い}う と 、 {戦|たたか}い で あんた が {狙|ねら}われたら 、 {客|きゃく} の {目|め} は {私|わたし} が {引|ひ}き{受|う}ける 。 {二人|ふたり} で {一組|ひとくみ} の {芸|げい} だ から ね 。 || A double bill! …Seriously, though: if something takes aim at you in a fight, I'll draw the audience's eye. We're a two-person act.
> {二枚|にまい}{看板|かんばん} って やつ や な ！ …… {真面目|まじめ} に {言|い}う と 、 {戦|たたか}い で あんた が {狙|ねら}われたら 、 {客|きゃく} の {目|め} は うち が {引|ひ}き{受|う}ける 。 {二人|ふたり} で {一組|ひとくみ} の {芸|げい} や から な 。 || A double bill! …Seriously, though: if something takes aim at you in a fight, I'll draw the audience's eye. We're a two-person act.
@ lq/40_road:146 [lq.kh_arrive]
= {幕|まく} が {上|あ}がった 。 {役者|やくしゃ} は まだ いない けど 、 {舞台|ぶたい} は ずっと {待|ま}ってた ね 。 || The curtain's up. No actors yet — but the stage has been waiting all along.
> {幕|まく} が {上|あ}がった 。 {役者|やくしゃ} は まだ おらん けど 、 {舞台|ぶたい} は ずっと {待|ま}ってた ん や な 。 || The curtain's up. No actors yet — but the stage has been waiting all along.
@ lq/40_road:159 [lq.kh_tree]
= {十二|じゅうに} の {次|つぎ} は 、 {本人|ほんにん} に {刻|きざ}んで もらわない と ね 。 || After twelve — she'll have to come and carve the next one herself.
> {十二|じゅうに} の {次|つぎ} は 、 {本人|ほんにん} に {刻|きざ}んで もらわな あかん な 。 || After twelve — she'll have to come carve the next one herself.
@ lq/40_road:168 [lq.kh_stone]
= {出演者|しゅつえんしゃ} {一覧|いちらん} だ ね 。 {誰|だれ} も {抜|ぬ}けてない 。 || A cast list. Nobody left out.
> {出演者|しゅつえんしゃ} {一覧|いちらん} や な 。 {誰|だれ} も {抜|ぬ}けてへん 。 || A cast list. Nobody left out.
@ lq/40_road:197 [lq.kh_chest]
= {似合|にあ}う {似合|にあ}う 。 {柿|かき} の {村|むら} の {衣装|いしょう} だ ね 。 || Suits you. A costume from the persimmon village.
> {似合|にあ}う {似合|にあ}う 。 {柿|かき} の {村|むら} の {衣装|いしょう} や な 。 || Suits you. A costume from the persimmon village.
@ lq/40_road:212 [lq.kayo_idle]
= {笑|わら}ってる けど 、 {目|め} は {遠|とお}く を {見|み}てた ね 。 || She's smiling, but her eyes were somewhere far away.
> {笑|わら}ってはる けど 、 {目|め} は {遠|とお}く を {見|み}てた な 。 || She's smiling, but her eyes were somewhere far away.
@ lq/40_road:229 [lq.road_kayo_certainly]
= {台詞|せりふ} の {言|い}い{方|かた} が {違|ちが}う 。 あれ は 「 いいえ 」 の {顔|かお} だ よ 。 || The line reading's wrong. That was a "no" face.
> {台詞|せりふ} の {言|い}い{方|かた} が ちゃう 。 あれ は 「 いいえ 」 の {顔|かお} や で 。 || The line reading's off. That was a "no" face.
@ lq/40_road:249 [lq.road_kayo]
= {誰|だれ} も いない {舞台|ぶたい} に {立|た}つ の は {怖|こわ}い よ ね 。 でも 、 {立|た}った {瞬間|しゅんかん} に 、 そこ は もう {誰|だれ} も いない {舞台|ぶたい} じゃ なく なる ん だ よ 。 || Standing on an empty stage is frightening. But the moment you step onto it, it isn't empty anymore.
> {誰|だれ} も おらん {舞台|ぶたい} に {立|た}つ の は {怖|こわ}い よ な 。 せやけど 、 {立|た}った {瞬間|しゅんかん} に 、 そこ は もう {誰|だれ} も おらん {舞台|ぶたい} ちゃう ねん で 。 || Standing on an empty stage is scary. But the moment you step onto it, it ain't empty anymore.
@ lq/40_road:273 [lq.road_home]
= {初日|しょにち} の {幕|まく} が {上|あ}がった ね 。 {客|きゃく} は {鳥|とり} と {私|わたし} たち だけ だ けど 。 …… {悪|わる}く ない {初日|しょにち} だ よ 。 || Opening night. The audience is us and the birds. …Not a bad opening night.
> {初日|しょにち} の {幕|まく} が {上|あ}がった な 。 {客|きゃく} は {鳥|とり} と うちら だけ や けど 。 …… {悪|わる}く ない {初日|しょにち} や で 。 || Opening night. The audience is us and the birds. …Not a bad opening night.
@ lq/50_letters:30 [lq.b_suzu]
= {柿|かき} って ね 、 {渋|しぶ}い うち に {採|と}って {干|ほ}す と 、 {甘|あま}く なる んだって 。 {人|ひと} も そう なら いい けど 。 …… {私|わたし} ？ まだ {干|ほ}し{中|ちゅう} 。 || They say if you pick persimmons while they're still bitter and dry them, they turn sweet. Wouldn't it be nice if people worked that way. …Me? Still drying.
> {柿|かき} って な 、 {渋|しぶ}い うち に {採|と}って {干|ほ}したら 、 {甘|あま}く なる ねん って 。 {人|ひと} も そう やったら ええ のに 。 …… うち ？ まだ {干|ほ}し{中|ちゅう} や 。 || They say if you pick persimmons while they're still bitter and dry 'em, they turn sweet. Wouldn't it be nice if folks worked that way. …Me? Still drying.
`, 'dialect/kansai_75_lq');
