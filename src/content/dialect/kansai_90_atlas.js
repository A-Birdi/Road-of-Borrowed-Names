/* Suzu's Kansai-ben: The Unwritten Atlas.
 * Format and rules: src/lang/85_dialect.js, docs/dialect/suzu_kansai.md.
 * "=" the standard line as authored (the key: its Japanese); ">" the Kansai version. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.dialect.add('kansai', `
@ zz_atlas_decor:5 [at.decor_ferry]
= {前|まえ} の {看板|かんばん} は 、 {字|じ} が {消|き}えて いた よね 。 || The old sign had lost its letters, hadn't it?
> {前|まえ} の {看板|かんばん} は 、 {字|じ} が {消|き}えてた やんな 。 || The old sign had lost its letters, hadn't it?
@ zz_atlas_decor:12 [at.decor_mark200]
= {雪|ゆき} が {降|ふ}って も 、 これ なら {迷|まよ}わない ね 。 || Even in snow, nobody will get lost now.
> {雪|ゆき} が {降|ふ}って も 、 これ やったら {迷|まよ}わへん な 。 || Even in snow, nobody'll get lost now.
@ zz_atlas_decor:20 [at.decor_tags]
= {字|じ} が {戻|もど}る と 、 {荷物|にもつ} も {帰|かえ}れる んだ ね 。 || When the letters come back, the cargo can go home too.
> {字|じ} が {戻|もど}ったら 、 {荷物|にもつ} も {帰|かえ}れる ん や な 。 || When the letters come back, the cargo can go home too.
@ zz_atlas_decor:34 [at.decor_lantern]
= {去年|きょねん} は 、 なかった {村|むら} だ ね 。 || That village wasn't there last year.
> {去年|きょねん} は 、 なかった {村|むら} や な 。 || That village wasn't there last year.
@ atlas/scenes:8 [atlas.intro.first]
= {毎回|まいかい} {筋書|すじが}き が {違|ちが}う {舞台|ぶたい} ？ {最高|さいこう} じゃない 。 || A stage where the script changes every night? That's the best kind.
> {毎回|まいかい} {筋書|すじが}き が ちゃう {舞台|ぶたい} ？ {最高|さいこう} やん 。 || A stage where the script changes every night? Now that's the best kind.
@ atlas/scenes:19 [atlas.intro.again]
= さあ 、 {開演|かいえん} ！ || Curtain up!
> さあ 、 {開演|かいえん} や ！ || Curtain up!
@ atlas/scenes:30 [atlas.intro.go]
= さあ 、 {出発|しゅっぱつ} ！ || And we're off!
> さあ 、 {出発|しゅっぱつ} や ！ || And we're off!
@ atlas/scenes:43 [atlas.room.threshold]
= {幕|まく} が {上|あ}がる {前|まえ} の {舞台|ぶたい} みたい 。 わくわく する ね 。 || Like a stage before the curtain goes up. Exciting, isn't it?
> {幕|まく} が {上|あ}がる {前|まえ} の {舞台|ぶたい} みたい 。 わくわく する な 。 || Like a stage before the curtain goes up. Exciting, ain't it?
@ atlas/scenes:74 [atlas.room.grove]
= {観客|かんきゃく} が {待|ま}ってる 。 {出番|でばん} だ よ 。 || The audience is waiting. You're on.
> {観客|かんきゃく} が {待|ま}ってる 。 {出番|でばん} や で 。 || The audience is waiting. You're on.
@ atlas/scenes:106 [atlas.room.pool]
= {鏡|かがみ} の {前|まえ} で {稽古|けいこ} する と 、 よく こう なる の 。 …… ならない か 。 || When I rehearse in front of a mirror this always happens. …No, it doesn't.
> {鏡|かがみ} の {前|まえ} で {稽古|けいこ} したら 、 よう こう なる ねん 。 …… ならへん か 。 || When I rehearse in front of a mirror this always happens. …Nah, it doesn't.
@ atlas/scenes:115 [atlas.room.climax]
= クライマックス だ ね 。 {台詞|せりふ} 、 {忘|わす}れない で よ 。 || The climax. Don't forget your lines.
> クライマックス や な 。 {台詞|せりふ} 、 {忘|わす}れたら あかん で 。 || The climax. Don't you go forgetting your lines.
@ atlas/scenes:163 [atlas.camp]
= {今日|きょう} の {出費|しゅっぴ} 、 つけて おく ね 。 {焚|た}き{木|ぎ} {三本|さんぼん} 、 {笑|わら}い {二回|にかい} 。 || I'll note down today's expenses. Three sticks of firewood, two laughs.
> {今日|きょう} の {出費|しゅっぴ} 、 つけとく な 。 {焚|た}き{木|ぎ} {三本|さんぼん} 、 {笑|わら}い {二回|にかい} 。 || I'll note down today's expenses. Three sticks of firewood, two laughs.
@ atlas/scenes:164 [atlas.camp]
= {嘘|うそ} の ない {旅|たび} って 、 {思|おも}った より {楽|らく} だ ね 。 {荷物|にもつ} が {軽|かる}い 。 || Travelling without lies is easier than I thought. Lighter luggage.
> {嘘|うそ} の ない {旅|たび} って 、 {思|おも}うた より {楽|らく} や な 。 {荷物|にもつ} が {軽|かる}い わ 。 || Travelling without lies is easier than I figured. Lighter luggage.
@ atlas/scenes:165 [atlas.camp]
= ねえ 、 {火|ひ} の {前|まえ} で {一曲|いっきょく} どう ？ …… {冗談|じょうだん} 。 {半分|はんぶん} は ね 。 || Hey, how about a song by the fire? …Joking. Half joking.
> なあ 、 {火|ひ} の {前|まえ} で {一曲|いっきょく} どう ？ …… {冗談|じょうだん} や 。 {半分|はんぶん} は な 。 || Hey, how about a song by the fire? …Kidding. Half kidding.
@ atlas/scenes:179 [atlas.camp]
= {引|ひ}き{返|かえ}す の も 、 {旅|たび} の うち だ よ 。 || Turning back is part of travelling too.
> {引|ひ}き{返|かえ}す の も 、 {旅|たび} の うち や で 。 || Turning back's part of travelling too.
@ atlas/scenes:197 [atlas.climax]
= カーテンコール は 、 {帰|かえ}って から に しよう ！ || Save the curtain call for when we're home!
> カーテンコール は 、 {帰|かえ}って から に しよ ！ || Save the curtain call for when we're home!
@ atlas/scenes:205 [atlas.climax.cartographer]
= {台本|だいほん} から {台詞|せりふ} を {消|け}したら 、 {芝居|しばい} は {終|お}わり だ よ 。 || Cut every line from the script and there's no play left.
> {台本|だいほん} から {台詞|せりふ} {消|け}したら 、 {芝居|しばい} は {終|お}わり や で 。 || Cut every line from the script and there's no play left.
@ atlas/scenes:213 [atlas.climax.bell]
= {借|か}り{物|もの} の {衣装|いしょう} で {主役|しゅやく} を {張|は}る と 、 {最後|さいご} に {困|こま}る の よ 。 || Play the lead in a borrowed costume and the last act gets awkward.
> {借|か}り{物|もの} の {衣装|いしょう} で {主役|しゅやく} を {張|は}ったら 、 {最後|さいご} に {困|こま}る ねん 。 || Play the lead in a borrowed costume and the last act gets awkward.
@ atlas/scenes:221 [atlas.climax.gate]
= {未完成|みかんせい} の {舞台|ぶたい} でも 、 {幕|まく} は {上|あ}げられる の に ね 。 || You can raise the curtain on an unfinished stage, you know.
> {未完成|みかんせい} の {舞台|ぶたい} でも 、 {幕|まく} は {上|あ}げられる のに な 。 || You can raise the curtain on an unfinished stage, y'know.
@ atlas/scenes:228 [atlas.extract.room]
= {終幕|しゅうまく} 。 {拍手|はくしゅ} は 、 {家|いえ} で もらおう 。 || Final act. We'll take our applause at home.
> {終幕|しゅうまく} 。 {拍手|はくしゅ} は 、 {家|いえ} で もらお 。 || Final act. We'll take our applause at home.
@ atlas/scenes:248 [atlas.home]
= {今日|きょう} の {公演|こうえん} は {中止|ちゅうし} ！ {明日|あした} また {幕|まく} を {上|あ}げよう 。 || Tonight's show is cancelled! We'll raise the curtain again tomorrow.
> {今日|きょう} の {公演|こうえん} は {中止|ちゅうし} ！ {明日|あした} また {幕|まく} {上|あ}げよ 。 || Tonight's show is cancelled! We'll raise the curtain again tomorrow.
@ atlas/scenes:264 [atlas.home]
= {本日|ほんじつ} の {公演|こうえん} 、 これ に て {終幕|しゅうまく} ！ || And that concludes today's performance!
> {本日|ほんじつ} の {公演|こうえん} 、 これ に て {終幕|しゅうまく} や ！ || And that concludes today's performance!
@ atlas/scenes:265 [atlas.home]
= {引|ひ}き{返|かえ}す {勇気|ゆうき} も 、 {大事|だいじ} だ よ 。 || It takes nerve to turn back, too.
> {引|ひ}き{返|かえ}す {勇気|ゆうき} も 、 {大事|だいじ} や で 。 || It takes nerve to turn back, too.
@ atlas/scenes:287 [atlas.banter.suzu1]
= {台本|だいほん} の ない {舞台|ぶたい} は {久|ひさ}しぶり 。 {即興|そっきょう} は {得意|とくい} な の 。 || A stage with no script — it's been a while. I'm good at improvising.
> {台本|だいほん} の ない {舞台|ぶたい} は {久|ひさ}しぶり や 。 {即興|そっきょう} は {得意|とくい} やねん 。 || A stage with no script — been a while. I'm good at improvising.
@ atlas/scenes:290 [atlas.banter.suzu2]
= {今日|きょう} の {旅費|りょひ} 、 {今|いま} の ところ ゼロ 。 {素晴|すば}らしい {帳簿|ちょうぼ} だ わ 。 || Travel costs so far today: zero. A beautiful ledger.
> {今日|きょう} の {旅費|りょひ} 、 {今|いま} の とこ ゼロ 。 {素晴|すば}らしい {帳簿|ちょうぼ} や わ 。 || Travel costs so far today: zero. A beautiful ledger.
@ atlas.COMP_OK.suzu[0]
= はい 、 {拍手|はくしゅ} ！ || And — applause!
> はい 、 {拍手|はくしゅ} ！ || And — applause!
@ atlas.COMP_OK.suzu[1]
= {今|いま} の 、 {客席|きゃくせき} まで {届|とど}いた よ 。 || That one carried to the back row.
> {今|いま} の 、 {客席|きゃくせき} まで {届|とど}いた で 。 || That one carried to the back row.
@ atlas.COMP_OK.suzu[2]
= {次|つぎ} の {幕|まく} へ 、 どうぞ 。 || On to the next act.
> {次|つぎ} の {幕|まく} へ 、 どうぞ 。 || On to the next act.
@ atlas.COMP_LATER.suzu
= {幕間|まくあい} だ ね 。 {少|すこ}し {休憩|きゅうけい} 。 || Intermission. A little break.
> {幕間|まくあい} や な 。 ちょっと {休憩|きゅうけい} 。 || Intermission. A little break.
@ atlas.NAME_REACT.ferry.suzu
= いい {声|こえ} ！ うち の {一座|いちざ} に {欲|ほ}しい くらい 。 || What a voice! I'd hire it for the troupe.
> ええ {声|こえ} ！ うち の {一座|いちざ} に {欲|ほ}しい くらい や 。 || What a voice! I'd hire it for the troupe.
@ atlas.NAME_REACT.mochi.suzu
= {今度|こんど} 、 {干物|ひもの} を {持|も}って {行|い}こう 。 || Next time I'm bringing it some dried fish.
> {今度|こんど} 、 {干物|ひもの} {持|も}って {行|い}こ 。 || Next time I'm bringing it some dried fish.
@ atlas.NAME_REACT.verse.suzu
= …… {二番|にばん} 、 {私|わたし} も {歌|うた}える よ 。 {今|いま} なら ね 。 || …I can sing the second verse too. Now I can.
> …… {二番|にばん} 、 うち も {歌|うた}える で 。 {今|いま} やったら な 。 || …I can sing the second verse too. Now I can.
@ atlas.NAME_REACT.shortcut.suzu
= {大人|おとな} に は {内緒|ないしょ} 。 {今|いま} も ね 。 || Secret from the grown-ups. Still.
> {大人|おとな} に は {内緒|ないしょ} や 。 {今|いま} も な 。 || Secret from the grown-ups. Still.
@ atlas.NAME_REACT.umeboshi.suzu
= {酸|す}っぱい {顔|かお} なら 、 {得意|とくい} だ よ 。 || I do a very good sour face, you know.
> {酸|す}っぱい {顔|かお} やったら 、 {得意|とくい} や で 。 || I do a real good sour face, y'know.
@ atlas.NAME_REACT.tuesday.suzu
= {毎日|まいにち} {初日|しょにち} じゃ 、 {初日|しょにち} じゃ なく なる もん ね 。 || If every night were opening night, it wouldn't be opening night.
> {毎日|まいにち} {初日|しょにち} やったら 、 {初日|しょにち} ちゃう よう に なる もん な 。 || If every night were opening night, it wouldn't be opening night.
@ atlas.NAME_REACT.umbrella.suzu
= {貸|か}し{借|か}り は 、 {帳簿|ちょうぼ} に つけて おく もの 。 || Loans go in the ledger. Always.
> {貸|か}し{借|か}り は 、 {帳簿|ちょうぼ} に つけとく もん や 。 || Loans go in the ledger. Always.
@ atlas.NAME_REACT.starcat.suzu
= {主役|しゅやく} は {猫|ねこ} だった わけ だ 。 || So the cat was the lead all along.
> {主役|しゅやく} は {猫|ねこ} やった ん や な 。 || So the cat was the lead all along.
@ atlas.NAME_REACT.tomorrow.suzu
= 「さようなら 」 は 、 {言|い}わない {方|ほう} が いい {時|とき} も ある 。 || Sometimes "goodbye" is better left unsaid.
> 「 さようなら 」 は 、 {言|い}わへん {方|ほう} が ええ {時|とき} も ある ねん 。 || Sometimes "goodbye" is better left unsaid.
@ atlas.NAME_REACT.postscript.suzu
= {台所|だいどころ} の {話|はなし} は 、 {嘘|うそ} が つけない から ね 。 || You can't lie about a kitchen.
> {台所|だいどころ} の {話|はなし} は 、 {嘘|うそ} つかれへん から な 。 || You can't lie about a kitchen.
@ atlas.RELIC_ANY.suzu
= {小道具|こどうぐ} ゲット 。 {使|つか}い{方|かた} は {任|まか}せて 。 || New prop! Leave the staging to me.
> {小道具|こどうぐ} ゲット や 。 {使|つか}い{方|かた} は {任|まか}せて 。 || New prop! Leave the staging to me.
@ atlas.RELIC_REACT.mask_suzu.suzu
= {代役|だいやく} の {面|めん} ！ {主役|しゅやく} が {倒|たお}れた {時|とき} の ため の やつ だ よ 。 || An understudy's mask! For when the lead goes down.
> {代役|だいやく} の {面|めん} ！ {主役|しゅやく} が {倒|たお}れた {時|とき} の ため の やつ や で 。 || An understudy's mask! For when the lead goes down.
@ atlas.RELIC_REACT.bell.suzu
= わたし と {同|おな}じ {名前|なまえ} だ 。 {仲良|なかよ}く しよう ね 。 || It has my name! We'll get on.
> うち と {同|おんな}じ {名前|なまえ} や 。 {仲良|なかよ}く しよ な 。 || It's got my name! We'll get on.
@ atlas.FORK_REACT.suzu
= {分|わ}かれ{道|みち} は 、 {物語|ものがたり} の いちばん {楽|たの}しい {所|ところ} ！ || A fork in the road — the best part of any story!
> {分|わ}かれ{道|みち} は 、 {物語|ものがたり} の いちばん {楽|たの}しい とこ や ！ || A fork in the road — the best part of any story!
@ atlas.TEA.suzu
= {乾杯|かんぱい} ！ …… お{茶|ちゃ} で も 、 {乾杯|かんぱい} は {乾杯|かんぱい} 。 || Cheers! …Tea still counts.
> {乾杯|かんぱい} ！ …… お{茶|ちゃ} でも 、 {乾杯|かんぱい} は {乾杯|かんぱい} や 。 || Cheers! …Tea still counts.
`, 'dialect/kansai_90_atlas');
