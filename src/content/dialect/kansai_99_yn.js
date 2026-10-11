/* Suzu's Kansai-ben: Steamhollow, Chapter 11 of a twelve-chapter journey (expansion P13). The call, the inns and baths,
   * the town, the vents and the Kettle, the mediation, her crossroads with the troupe, the night apart, the books shown
   * openly, the walk and the side stories. Format and rules: src/lang/85_dialect.js, docs/dialect/suzu_kansai.md.
   * "=" the standard line as authored (the key: its Japanese); ">" the Kansai version. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.dialect.add('kansai', `
@ yn/yn.call [yn.call]
= {湯治場|とうじば} ！ {揉|も}め{事|ごと} {付|つ}き なんて 、 {芝居|しばい} の {筋書|すじが}き みたい ね 。 {行|い}きましょ 。 || A spa town! With a quarrel thrown in. It's like the outline of a play. Let's go.
> {湯治場|とうじば} ！ {揉|も}め{事|ごと} {付|つ}き なんて 、 {芝居|しばい} の {筋書|すじが}き みたい や な 。 {行|い}こ 。 || A spa town! With a quarrel thrown in. It's like the outline of a play. Let's go.
@ yn/yn.call [yn.call]
= …… {一座|いちざ} ？ || …A troupe?
> =
@ yn/yn.descent_first [yn.descent_first]
= {客席|きゃくせき} の ない {舞台|ぶたい} みたい 。 …… {下|した} の {賑|にぎ}やか な {方|ほう} へ {行|い}きましょ 。 || Like a stage with no audience. …Let's head for the lively part below.
> {客席|きゃくせき} の ない {舞台|ぶたい} みたい や 。 …… {下|した} の {賑|にぎ}やか な {方|ほう} へ {行|い}こ 。 || Like a stage with no audience. …Let's head for the lively part below.
@ yn/yn.yasuke_road [yn.yasuke_road]
= {声|こえ} が {出|で}る {所|ところ} へ {行|い}きましょ 。 {下|した} の {谷|たに} は 、 きっと うるさい わ よ 。 || Let's go where voices work. The valley down there will be noisy, I'm sure.
> {声|こえ} が {出|で}る {所|ところ} へ {行|い}こ 。 {下|した} の {谷|たに} は 、 きっと うるさい で 。 || Let's go where voices work. The valley down there will be noisy, I'm sure.
@ yn/yn.arrive [yn.arrive]
= いい {町|まち} ！ {呼|よ}び{込|こ}み の {声|こえ} が 、 {一座|いちざ} の {口上|こうじょう} より {大|おお}きい わ 。 || What a town! The touts are louder than a troupe's opening patter.
> ええ {町|まち} ！ {呼|よ}び{込|こ}み の {声|こえ} が 、 {一座|いちざ} の {口上|こうじょう} より {大|おお}きい わ 。 || What a town! The touts are louder than a troupe's opening patter.
@ yn/yn.rokubei_first [yn.rokubei_first]
= {満員|まんいん} の {宿|やど} の {帳場|ちょうば} なら 、 {私|わたし} の {得意|とくい} よ 。 {帳面|ちょうめん} は 、 {任|まか}せて 。 || A full house's front desk is my kind of place. Leave the books to me.
> {満員|まんいん} の {宿|やど} の {帳場|ちょうば} なら 、 {私|わたし} の {得意|とくい} や で 。 {帳面|ちょうめん} は 、 {任|まか}せとき 。 || A full house's front desk is my kind of place. Leave the books to me.
@ yn/yn.kami_first [yn.kami_first]
= 「{満室|まんしつ} で ございまして 」 の {後|あと} に 、 {何|なに} も {続|つづ}かない の が 、 {老舗|しにせ} の {断|ことわ}り{方|かた} よ 。 {覚|おぼ}えて おいて 。 || "We are fully booked…" and then nothing after it: that's how an old house says no. Remember it.
> 「{満室|まんしつ} で ございまして 」 の {後|あと} に 、 {何|なに} も {続|つづ}かへん の が 、 {老舗|しにせ} の {断|ことわ}り{方|かた} や 。 {覚|おぼ}えとき 。 || "We are fully booked…" and then nothing after it: that's how an old house says no. Remember it.
@ yn/yn.oritsu_first [yn.oritsu_first]
= {完璧|かんぺき} な {敬語|けいご} で 、 {相手|あいて} の {宿|やど} を {刺|さ}す 。 {見事|みごと} な {台詞回|せりふまわ}し ね 。 || Running the other house through in perfect honorifics. Beautifully delivered.
> {完璧|かんぺき} な {敬語|けいご} で 、 {相手|あいて} の {宿|やど} を {刺|さ}す 。 {見事|みごと} な {台詞回|せりふまわ}し や な 。 || Running the other house through in perfect honorifics. Beautifully delivered.
@ yn/yn.rooms_start [yn.rooms_start]
= {帳面|ちょうめん} の {仕事|しごと} ね 。 …… ふふ 、 {血|ち} が {騒|さわ}ぐ わ 。 || Ledger work. …Heh. It stirs the blood.
> {帳面|ちょうめん} の {仕事|しごと} や な 。 …… ふふ 、 {血|ち} が {騒|さわ}ぐ わ 。 || Ledger work. …Heh. It stirs the blood.
@ yn/yn.bath_scene [yn.bath_scene]
= ああ …… {極楽|ごくらく} 、 {極楽|ごくらく} 。 {一度|いちど} {言|い}って みたかった の 。 || Ahh… paradise, paradise. I always wanted to say that.
> ああ …… {極楽|ごくらく} 、 {極楽|ごくらく} 。 {一回|いっかい} {言|い}うて みたかった ねん 。 || Ahh… paradise, paradise. I always wanted to say that.
@ yn/yn.bath_beat [yn.bath_beat]
= …… ここ の {湯|ゆ} に 、 ギンノジョウ が {来|き}て いる って {噂|うわさ} 、 {聞|き}いた ？ {八百橋|やおばし} の {芝居町|しばいまち} の 、 {伝説|でんせつ} の {喜劇|きげき} {役者|やくしゃ} よ 。 || …Have you heard the rumour that Ginnojō takes these waters? The legendary comic actor of Manybridge's Playhouse Row.
> …… ここ の {湯|ゆ} に 、 ギンノジョウ が {来|き}てる って {噂|うわさ} 、 {聞|き}いた ？ {八百橋|やおばし} の {芝居町|しばいまち} の 、 {伝説|でんせつ} の {喜劇|きげき} {役者|やくしゃ} や で 。 || …Have you heard the rumour that Ginnojō takes these waters? The legendary comic actor of Manybridge's Playhouse Row.
@ yn/yn.bath_beat [yn.bath_beat]
= {十六|じゅうろく} の {時|とき} 、 {彼|かれ} の {間|ま} の {取|と}り{方|かた} を 、 {毎晩|まいばん} {真似|まね} した の 。 {一座|いちざ} の {皆|みな} に 、 {似|に}て ない って {笑|わら}われた けど 。 || When I was sixteen I copied his timing every night. Everyone in the troupe laughed and said it was nothing like him.
> {十六|じゅうろく} の {時|とき} 、 {彼|かれ} の {間|ま} の {取|と}り{方|かた} を 、 {毎晩|まいばん} {真似|まね} した ねん 。 {一座|いちざ} の {皆|みな} に 、 {似|に}て へん って {笑|わら}われた けど 。 || When I was sixteen I copied his timing every night. Everyone in the troupe laughed and said it was nothing like him.
@ yn/yn.bath_beat [yn.bath_beat]
= もし {会|あ}えたら …… {何|なに} {言|い}おう 。 {湯|ゆ} の {中|なか} で {台詞|せりふ} を {考|かんが}える の 、 {初|はじ}めて よ 。 || If I meet him… what would I say? First time I've ever worked out lines in a bath.
> もし {会|あ}えたら …… {何|なに} {言|い}お 。 {湯|ゆ} の {中|なか} で {台詞|せりふ} を {考|かんが}える の 、 {初|はじ}めて や 。 || If I meet him… what would I say? First time I've ever worked out lines in a bath.
@ yn/yn.shimo_first [yn.shimo_first]
= こっち は {大衆演劇|たいしゅうえんげき} の {楽屋|がくや} みたい 。 {好|す}き よ 。 || This one's like the dressing room of a popular theatre. I like it.
> こっち は {大衆演劇|たいしゅうえんげき} の {楽屋|がくや} みたい や 。 {好|す}き や で 。 || This one's like the dressing room of a popular theatre. I like it.
@ yn/yn.tahei_first [yn.tahei_first]
= {土間|どま} に {六人|ろくにん} 、 {無料|むりょう} で 。 …… {口|くち} は {悪|わる}い けど 、 いい {座長|ざちょう} ね 、 この {人|ひと} 。 || Six on the floor, free of charge. …Rough tongue, but he'd make a good troupe master.
> {土間|どま} に {六人|ろくにん} 、 {無料|むりょう} で 。 …… {口|くち} は {悪|わる}い けど 、 ええ {座長|ざちょう} や な 、 この {人|ひと} 。 || Six on the floor, free of charge. …Rough tongue, but he'd make a good troupe master.
@ yn/yn.onatsu [yn.onatsu]
= {噂話|うわさばなし} の {出所|でどころ} は 、 いつも {屋台|やたい} よ ね 。 || Gossip always comes from the stalls, doesn't it.
> {噂話|うわさばなし} の {出所|でどころ} は 、 いつも {屋台|やたい} や な 。 || Gossip always comes from the stalls, doesn't it.
@ yn/yn.tsuneji [yn.tsuneji]
= {拍手|はくしゅ} も {音|おと} よ 。 {谷|たに} で 、 {大|おお}きい の を {聞|き}かせて あげたい わ 。 || Applause is a sound too. I'd like them to hear a big round of it here.
> {拍手|はくしゅ} も {音|おと} や で 。 {谷|たに} で 、 {大|おお}きい の を {聞|き}かせて あげたい わ 。 || Applause is a sound too. I'd like them to hear a big round of it here.
@ yn/yn.tama [yn.tama]
= {一|ひと}つ {百文|ひゃくもん} で {売|う}れる わ よ 、 これ 。 …… {冗談|じょうだん} よ 。 {配|くば}りましょう 。 || These would sell for a hundred mon apiece. …Joking. Let's hand them out.
> {一|ひと}つ {百文|ひゃくもん} で {売|う}れる で 、 これ 。 …… {冗談|じょうだん} や 。 {配|くば}ろ 。 || These would sell for a hundred mon apiece. …Joking. Let's hand them out.
@ yn/yn.bridge_quarrel [yn.bridge_quarrel]
= {幕|まく} を {下|お}ろして ！ {二人|ふたり} と も 、 {客席|きゃくせき} を {見|み}なさい よ 。 {皆|みんな} 、 {怖|こわ}がって いる わ 。 || Bring the curtain down! Both of you, look at your audience. Everyone's frightened.
> {幕|まく} を {下|お}ろして ！ {二人|ふたり} と も 、 {客席|きゃくせき} を {見|み}て 。 {皆|みんな} 、 {怖|こわ}がってる やん 。 || Bring the curtain down! Both of you, look at your audience. Everyone's frightened.
@ yn/yn.guild_after_quarrel [yn.guild_after_quarrel]
= {奈落|ならく} へ {降|お}りる の ね 。 {芝居小屋|しばいごや} の {下|した} なら 、 {慣|な}れて いる わ 。 || Down into the pit, then. I'm used to the space under a stage.
> {奈落|ならく} へ {降|お}りる ん や な 。 {芝居小屋|しばいごや} の {下|した} なら 、 {慣|な}れてる わ 。 || Down into the pit, then. I'm used to the space under a stage.
@ yn/yn.playhouse_first [yn.playhouse_first]
= …… {嘘|うそ} 。 あの {幟|のぼり} 。 あれ は …… {私|わたし} の {一座|いちざ} よ 。 || …No. That banner. That's… my troupe.
> …… {嘘|うそ} や 。 あの {幟|のぼり} 。 あれ は …… {私|わたし} の {一座|いちざ} や 。 || …No. That banner. That's… my troupe.
@ yn/yn.troupe_baskets [yn.troupe_baskets]
= …… {十六|じゅうろく} の {時|とき} の {番付|ばんづけ} 。 {私|わたし} の {名前|なまえ} 、 こんな {下|した} の {方|ほう} に 。 || …The playbill from when I was sixteen. My name, all the way down here.
> =
@ yn/yn.north_first [yn.north_first]
= {客席|きゃくせき} が {空|から} に なって いく みたい 。 …… でも 、 {舞台|ぶたい} は まだ {終|お}わって ない わ 。 || Like the seats emptying one by one. …But the play isn't over yet.
> {客席|きゃくせき} が {空|から} に なって いく みたい や 。 …… でも 、 {舞台|ぶたい} は まだ {終|お}わって へん で 。 || Like the seats emptying one by one. …But the play isn't over yet.
@ yn/yn.vents1_first [yn.vents1_first]
= {舞台|ぶたい} の {煙|けむり} の {仕掛|しか}け と {同|おな}じ ね 。 どこ か を {開|あ}ければ 、 どこ か が {煙|けむ}る 。 || Like the smoke effects under a stage. Open one somewhere, and somewhere else fills with smoke.
> {舞台|ぶたい} の {煙|けむり} の {仕掛|しか}け と {同|おな}じ や な 。 どこ か を {開|あ}けたら 、 どこ か が {煙|けむ}る 。 || Like the smoke effects under a stage. Open one somewhere, and somewhere else fills with smoke.
@ yn/yn.float [yn.float]
= {犯人|はんにん} は {泥|どろ} ！ {推理|すいり} {劇|げき} なら 、 {客|きゃく} が {怒|おこ}る {結末|けつまつ} ね 。 || The culprit was mud! In a mystery play the audience would be furious.
> {犯人|はんにん} は {泥|どろ} ！ {推理|すいり} {劇|げき} やったら 、 {客|きゃく} が {怒|おこ}る {結末|けつまつ} や な 。 || The culprit was mud! In a mystery play the audience would be furious.
@ yn/yn.kettle [yn.kettle]
= {上|うえ} から は {罵声|ばせい} 、 {横|よこ} から は {無言|むごん} 。 …… {最悪|さいあく} の {客席|きゃくせき} ね 。 {震|ふる}える わ よ 。 || Jeers from above, dead silence from the side. …The worst audience there is. Of course it's shaking.
> {上|うえ} から は {罵声|ばせい} 、 {横|よこ} から は {無言|むごん} 。 …… {最悪|さいあく} の {客席|きゃくせき} や な 。 そら {震|ふる}える わ 。 || Jeers from above, dead silence from the side. …The worst audience there is. Of course it's shaking.
@ yn/yn.mediation_start [yn.mediation_start]
= {幕|まく} が {上|あ}がる わ 。 {台本|だいほん} は ない けど 、 {客|きゃく} は {本気|ほんき} よ 。 || Curtain up. There's no script, but the audience means it.
> {幕|まく} が {上|あ}がる で 。 {台本|だいほん} は あらへん けど 、 {客|きゃく} は {本気|ほんき} や 。 || Curtain up. There's no script, but the audience means it.
@ yn/yn.zentai [yn.zentai]
= {一座|いちざ} {全体|ぜんたい} で {一|ひと}つ の {芝居|しばい} 。 {舞台|ぶたい} の {基本|きほん} よ 。 || The whole company, one play. That's stagecraft one-oh-one.
> {一座|いちざ} {全体|ぜんたい} で {一|ひと}つ の {芝居|しばい} 。 {舞台|ぶたい} の {基本|きほん} や で 。 || The whole company, one play. That's stagecraft one-oh-one.
@ yn/yn.end [yn.end]
= {最後|さいご} の {幕|まく} ね 。 …… {相方|あいかた} が いる なら 、 どんな {客席|きゃくせき} でも {立|た}てる わ 。 {行|い}きましょ 。 || The last act, then. …With a partner, I can stand up in front of any house. Let's go.
> {最後|さいご} の {幕|まく} や な 。 …… {相方|あいかた} が おる なら 、 どんな {客席|きゃくせき} でも {立|た}てる わ 。 {行|い}こ 。 || The last act, then. …With a partner, I can stand up in front of any house. Let's go.
@ yn/yn.bunkichi [yn.bunkichi]
= {台詞|せりふ} が {戻|もど}った {役者|やくしゃ} の {顔|かお} ね 。 {見|み}れば {分|わ}かる わ 。 || That's the face of an actor who's got his lines back. I'd know it anywhere.
> {台詞|せりふ} が {戻|もど}った {役者|やくしゃ} の {顔|かお} や な 。 {見|み}たら {分|わ}かる わ 。 || That's the face of an actor who's got his lines back. I'd know it anywhere.
@ yn/yn.kume_plan [yn.kume_plan]
= {張|は}り{合|あ}い で {腕|うで} が {上|あ}がる なら 、 {結構|けっこう} な {喧嘩|けんか} ね 。 || If rivalry improves the cooking, that's a fine sort of quarrel.
> {張|は}り{合|あ}い で {腕|うで} が {上|あ}がる なら 、 {結構|けっこう} な {喧嘩|けんか} や な 。 || If rivalry improves the cooking, that's a fine sort of quarrel.
@ yn/yn.ginnojo [yn.ginnojo]
= …… {嘘|うそ} 。 ギンノジョウ さん 。 {本物|ほんもの} 。 || …No way. Ginnojō. The real one.
> …… {嘘|うそ} や 。 ギンノジョウ さん 。 {本物|ほんもの} や 。 || …No way. Ginnojō. The real one.
@ yn/yn.ginnojo [yn.ginnojo]
= {十六|じゅうろく} の {時|とき} 、 {毎晩|まいばん} {真似|まね} しました 。 {間|ま} の {取|と}り{方|かた} を 。 …… {似|に}て ない って 、 {皆|みんな} に {言|い}われました けど 。 || When I was sixteen I copied you every night. Your timing. …Everyone said it was nothing like.
> =
@ yn/yn.ginnojo [yn.ginnojo]
= {喜|よろこ}んで ！ …… {一生|いっしょう} の {自慢|じまん} に する わ 。 || With pleasure! …I'll boast about this for the rest of my life.
> {喜|よろこ}んで ！ …… {一生|いっしょう} の {自慢|じまん} に する わ 。 || With pleasure! …I'll boast about this for the rest of my life.
@ yn/yn.onatsu_line [yn.onatsu_line]
= …… {違|ちが}う {気|き} が する 。 {落|お}ち に なって ない もの 。 {古|ふる}い {番付|ばんづけ} が あれば …… 。 || …I don't think that's right. It's not a punchline. If only there were an old playbill…
> …… ちゃう {気|き} が する 。 {落|お}ち に なって へん もん 。 {古|ふる}い {番付|ばんづけ} が あったら …… 。 || …I don't think that's right. It's not a punchline. If only there were an old playbill…
@ yn/yn.story [yn.story]
= {妹|いもうと} が {一番|いちばん} の {役者|やくしゃ} ね 。 {台詞|せりふ} {一|ひと}つ なし で 、 {話|はなし} を {動|うご}かした わ 。 || The sister's the best actor in it. Not a single line, and she moved the whole story.
> {妹|いもうと} が {一番|いちばん} の {役者|やくしゃ} や な 。 {台詞|せりふ} {一|ひと}つ なし で 、 {話|はなし} を {動|うご}かした わ 。 || The sister's the best actor in it. Not a single line, and she moved the whole story.
@ yn/yn.koume_suzu [yn.koume_suzu]
= …… うん 。 {行|い}く 。 || …Yes. I'll come.
> …… うん 。 {行|い}く わ 。 || …Yes. I'll come.
@ yn/yn.suzu_evening [yn.suzu_evening]
= …… {今夜|こんや} {一晩|ひとばん} 、 {時間|じかん} を ちょうだい 。 || …Give me tonight.
> =
@ yn/yn.suzu_evening [yn.suzu_evening]
= $name 。 {先|さき} に {寝|ね}て て 。 {私|わたし} 、 {少|すこ}し {風|かぜ} に {当|あ}たって くる から 。 || $name. Go to bed. I'm going to get some air.
> $name 。 {先|さき} に {寝|ね}とき 。 {私|わたし} 、 ちょっと {風|かぜ} に {当|あ}たって くる さかい 。 || $name. Go to bed. I'm going to get some air.
@ yn/yn.suzu_garden [yn.suzu_garden]
= …… {見|み}つかっちゃった 。 {寝|ね}て て って {言|い}った のに 。 || …Caught. I told you to go to sleep.
> …… {見|み}つかってもうた 。 {寝|ね}とき って {言|い}うた のに 。 || …Caught. I told you to go to sleep.
@ yn/yn.suzu_garden [yn.suzu_garden]
= ごめんね 。 {心配|しんぱい} させて 。 {笑|わら}って {誤魔化|ごまか}す の 、 {今夜|こんや} は {上手|うま}く できなかった 。 || I'm sorry I worried you. Tonight I couldn't laugh it off the way I usually do.
> ごめんな 。 {心配|しんぱい} させて 。 {笑|わら}って {誤魔化|ごまか}す の 、 {今夜|こんや} は {上手|うま}い こと でけへん かった 。 || I'm sorry I worried you. Tonight I couldn't laugh it off the way I usually do.
@ yn/yn.suzu_garden [yn.suzu_garden]
= あの {一座|いちざ} は 、 {私|わたし} の {家|いえ} だった 。 {十六|じゅうろく} で {初|はじ}めて {台詞|せりふ} を もらって 、 コウメ と {二人|ふたり} で {漫才|まんざい} を して 。 {笑|わら}い {声|ごえ} が 、 {毎晩|まいばん} {帰|かえ}る {場所|ばしょ} だった 。 || That troupe was my home. At sixteen I got my first lines, and Koume and I did our double act. The laughter was where I came home to, every night.
> あの {一座|いちざ} は 、 {私|わたし} の {家|いえ} やった 。 {十六|じゅうろく} で {初|はじ}めて {台詞|せりふ} を もろて 、 コウメ と {二人|ふたり} で {漫才|まんざい} を して 。 {笑|わら}い {声|ごえ} が 、 {毎晩|まいばん} {帰|かえ}る {場所|ばしょ} やった ねん 。 || That troupe was my home. At sixteen I got my first lines, and Koume and I did our double act. The laughter was where I came home to, every night.
@ yn/yn.suzu_garden [yn.suzu_garden]
= {戻|もど}れば 、 {全部|ぜんぶ} {戻|もど}って くる 。 …… それ を 、 {一晩|ひとばん} だけ {想像|そうぞう} したかった の 。 {断|ことわ}る {前|まえ} に 、 ちゃんと 。 || If I went back, I'd have all of it again. …I wanted one night just to imagine it. Properly, before I say no.
> {戻|もど}ったら 、 {全部|ぜんぶ} {戻|もど}って くる 。 …… それ を 、 {一晩|ひとばん} だけ {想像|そうぞう} したかった ねん 。 {断|ことわ}る {前|まえ} に 、 ちゃんと 。 || If I went back, I'd have all of it again. …I wanted one night just to imagine it. Properly, before I say no.
@ yn/yn.suzu_garden [yn.suzu_garden]
= うん 。 {断|ことわ}る 。 …… {次|つぎ} の {幕|まく} の {相方|あいかた} は 、 もう {決|き}めて ある から 。 || Yes. I'm saying no. …I've already chosen my partner for the next act.
> うん 。 {断|ことわ}る 。 …… {次|つぎ} の {幕|まく} の {相方|あいかた} は 、 もう {決|き}めてる さかい 。 || Yes. I'm saying no. …I've already chosen my partner for the next act.
@ yn/yn.suzu_garden [yn.suzu_garden]
= …… ありがと 。 そう {言|い}って くれる {人|ひと} だ から 、 {離|はな}れられない の よ 。 || …Thanks. It's because you'd say that, that I can't leave.
> …… おおきに 。 そう {言|い}うて くれる {人|ひと} や から 、 {離|はな}れられへん ねん 。 || …Thanks. It's because you'd say that, that I can't leave.
@ yn/yn.suzu_garden [yn.suzu_garden]
= {元手|もとで} が かかり{過|す}ぎてる の 。 ここ まで の {旅|たび} 、 ぜんぶ {投資|とうし} よ 。 {今|いま} {降|お}りたら 、 {大損|おおぞん} 。 || The investment's too great. This whole journey's been an investment. Get off now and I'd lose everything.
> {元手|もとで} が かかり{過|す}ぎてる ねん 。 ここ まで の {旅|たび} 、 ぜんぶ {投資|とうし} や 。 {今|いま} {降|お}りたら 、 {大損|おおぞん} や 。 || The investment's too great. This whole journey's been an investment. Get off now and I'd lose everything.
@ yn/yn.suzu_garden [yn.suzu_garden]
= {明日|あした} の {朝|あさ} 、 {一座|いちざ} に {会|あ}い に {行|い}く 。 {見|み}せなきゃ いけない もの が ある の 。 …… {付|つ}いて {来|き}て くれる ？ || In the morning I'll go and see the troupe. There's something I have to show them. …Will you come with me?
> {明日|あした} の {朝|あさ} 、 {一座|いちざ} に {会|あ}い に {行|い}く 。 {見|み}せな あかん もん が ある ねん 。 …… {付|つ}いて {来|き}て くれる ？ || In the morning I'll go and see the troupe. There's something I have to show them. …Will you come with me?
@ yn/yn.suzu_books [yn.suzu_books]
= {十年|じゅうねん} 、 {一座|いちざ} の {帳面|ちょうめん} を {付|つ}けて きた 。 {誰|だれ} に も {見|み}せなかった 。 {見|み}せない の が 、 {自慢|じまん} だった 。 || I kept the troupe's books for ten years. I never showed them to anyone. I was proud nobody ever saw them.
> {十年|じゅうねん} 、 {一座|いちざ} の {帳面|ちょうめん} を {付|つ}けて きた 。 {誰|だれ} に も {見|み}せへん かった 。 {見|み}せへん の が 、 {自慢|じまん} やった 。 || I kept the troupe's books for ten years. I never showed them to anyone. I was proud nobody ever saw them.
@ yn/yn.suzu_books [yn.suzu_books]
= {帳尻|ちょうじり} は {合|あ}って いる って 、 {皆|みんな} に {言|い}って きた 。 {本当|ほんとう} は 、 {足|た}りない {分|ぶん} を 、 {私|わたし} の {取|と}り{分|ぶん} から {埋|う}めて いた の 。 {嵐|あらし} の {後|あと} に {残|のこ}った の も 、 {町|まち} ごと の {借金|しゃっきん} を {返|かえ}す ため 。 || I told everyone the books balanced. In truth I was covering the shortfall from my own share. When I stayed behind after the storm, it was to pay off the debts town by town.
> {帳尻|ちょうじり} は {合|お}うてる って 、 {皆|みんな} に {言|い}うて きた 。 ほんま は 、 {足|た}りへん {分|ぶん} を 、 {私|わたし} の {取|と}り{分|ぶん} から {埋|う}めてた ねん 。 {嵐|あらし} の {後|あと} に {残|のこ}った の も 、 {町|まち} ごと の {借金|しゃっきん} を {返|かえ}す ため や 。 || I told everyone the books balanced. In truth I was covering the shortfall from my own share. When I stayed behind after the storm, it was to pay off the debts town by town.
@ yn/yn.suzu_books [yn.suzu_books]
= ごめん 。 {新|あたら}しい {相方|あいかた} が 、 もう {隣|となり} に いる の 。 {今度|こんど} 、 {二人|ふたり} の {芸|げい} を {見|み}に {来|き}て 。 || Sorry. My new partner's right here beside me. Come and see our act some time.
> ごめん 。 {新|あたら}しい {相方|あいかた} が 、 もう {隣|となり} に おる ねん 。 {今度|こんど} 、 {二人|ふたり} の {芸|げい} を {見|み}に {来|き}て な 。 || Sorry. My new partner's right here beside me. Come and see our act some time.
@ yn/yn.walk [yn.walk]
= {浴衣|ゆかた} で {橋|はし} の {上|うえ} 。 {芝居|しばい} なら 、 ここ で {花火|はなび} が {上|あ}がる ところ よ 。 || A bridge, in yukata. In a play, this is where the fireworks go up.
> {浴衣|ゆかた} で {橋|はし} の {上|うえ} 。 {芝居|しばい} やったら 、 ここ で {花火|はなび} が {上|あ}がる ところ や で 。 || A bridge, in yukata. In a play, this is where the fireworks go up.
@ yn/yn.walk [yn.walk]
= …… ずるい わ ね 。 {台詞|せりふ} を {考|かんが}える {暇|ひま} も くれない で 。 …… うん 。 このまま が いい 。 || …That's not fair. You didn't even give me time to think of a line. …Yes. Like this is good.
> …… ずるい わ 。 {台詞|せりふ} を {考|かんが}える {暇|ひま} も くれへん で 。 …… うん 。 このまま が ええ 。 || …That's not fair. You didn't even give me time to think of a line. …Yes. Like this is good.
@ yn/yn.walk [yn.walk]
= {相方|あいかた} は {並|なら}んで {立|た}つ もの よ 。 {舞台|ぶたい} でも 、 {道|みち} でも 。 || Partners stand side by side. On stage, and on the road.
> {相方|あいかた} は {並|なら}んで {立|た}つ もん や 。 {舞台|ぶたい} でも 、 {道|みち} でも 。 || Partners stand side by side. On stage, and on the road.
@ yn/yn.confess [yn.confess]
= ねえ 。 {一座|いちざ} に {戻|もど}らない って {決|き}めた の 、 {後悔|こうかい} して ない わ よ 。 {元手|もとで} が かかり{過|す}ぎてる って {言|い}った けど 。 …… {本当|ほんとう} は 、 {一緒|いっしょ} に {舞台|ぶたい} に {立|た}ちたい {人|ひと} に 、 {久|ひさ}しぶり に {会|あ}えた から よ 。 || Listen. I don't regret deciding not to go back to the troupe. I said the investment was too great. …The truth is, it's the first time in ages I've met someone I want to share a stage with.
> なあ 。 {一座|いちざ} に {戻|もど}らへん って {決|き}めた の 、 {後悔|こうかい} して へん で 。 {元手|もとで} が かかり{過|す}ぎてる って {言|い}うた けど 。 …… ほんま は 、 {一緒|いっしょ} に {舞台|ぶたい} に {立|た}ちたい {人|ひと} に 、 {久|ひさ}しぶり に {会|お}うた から や 。 || Listen. I don't regret deciding not to go back to the troupe. I said the investment was too great. …The truth is, it's the first time in ages I've met someone I want to share a stage with.
@ yn/company [company.mem.yn_garden.keep]
= {元手|もとで} が かかり{過|す}ぎてる って {言|い}った けど 、 {本当|ほんとう} は {一緒|いっしょ} に {立|た}ちたかった だけ よ 。 || I said the investment was too great. Really, I just wanted to stand on a stage with you.
> {元手|もとで} が かかり{過|す}ぎてる って {言|い}うた けど 、 ほんま は {一緒|いっしょ} に {立|た}ちたかった だけ や 。 || I said the investment was too great. Really, I just wanted to stand on a stage with you.
`, 'yn');
