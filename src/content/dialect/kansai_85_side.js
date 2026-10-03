/* Suzu's Kansai-ben: Cases, field puzzles, pets, fishing, shiritori.
 * Format and rules: src/lang/85_dialect.js, docs/dialect/suzu_kansai.md.
 * "=" the standard line as authored (the key: its Japanese); ">" the Kansai version. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.dialect.add('kansai', `
@ cases/20_parcel:13 [cs.parcel_shelf]
= {名前|なまえ} じゃ なくて 、 {役|やく} で {呼|よ}んでる の ね 。 {一座|いちざ} の {手紙|てがみ} と {同|おな}じ 。 || Addressed by the role, not the name. Like the troupe's letters.
> {名前|なまえ} や なくて 、 {役|やく} で {呼|よ}んでる ん や な 。 {一座|いちざ} の {手紙|てがみ} と {同|おんな}じ や 。 || Addressed by the role, not the name. Same as the troupe's letters.
@ cases/20_parcel:23 [cs.parcel_shelf]
= {謎|なぞ} の {小包|こづつみ} ！ {幕|まく} が {開|あ}いた わ 。 || A mystery parcel! Curtain up.
> {謎|なぞ} の {小包|こづつみ} ！ {幕|まく} が {開|あ}いた で 。 || A mystery parcel! Curtain's up.
@ cases/20_parcel:62 [cs.parcel_oldsite]
= {空|から} の {舞台|ぶたい} に 、 {花束|はなたば} は {置|お}けない わ 。 || You can't leave a bouquet on an empty stage.
> {空|から} の {舞台|ぶたい} に 、 {花束|はなたば} は {置|お}けへん わ 。 || Can't leave a bouquet on an empty stage.
@ cases/20_parcel:146 [cs.talk_parcel]
= {役|やく} は {残|のこ}って 、 {役者|やくしゃ} は {替|か}わる 。 {舞台|ぶたい} と {同|おな}じ よ 。 || The role stays and the actor changes. Just like the stage.
> {役|やく} は {残|のこ}って 、 {役者|やくしゃ} は {替|か}わる 。 {舞台|ぶたい} と {同|おんな}じ や 。 || The role stays and the actor changes. Same as the stage.
@ cases/20_parcel:152 [cs.talk_parcel]
= {何年|なんねん} も {遅|おく}れた {配達|はいたつ} ！ でも 、 {間|ま}に {合|あ}う もの も ある の よ ね 。 || A delivery years late! Some things still arrive in time, though.
> {何年|なんねん} も {遅|おく}れた {配達|はいたつ} ！ せやけど 、 {間|ま}に {合|あ}う もん も ある ねん な 。 || A delivery years late! Some things still get there in time, though, don't they.
@ cases/30_view:22 [cs.view_window]
= {舞台|ぶたい} も ね 、 {客席|きゃくせき} から と {袖|そで} から じゃ 、 {全然|ぜんぜん} {違|ちが}って {見|み}える の よ 。 || A stage looks completely different from the seats than from the wings, you know.
> {舞台|ぶたい} も な 、 {客席|きゃくせき} から と {袖|そで} から やと 、 {全然|ぜんぜん} ちゃう {感|かん}じ に {見|み}える ねん で 。 || A stage looks whole different from the seats than from the wings, y'know.
@ cases/30_view:38 [cs.view_note]
= {名前|なまえ} の {代|か}わり に {葉|は}っぱ 。 {粋|いき} な {署名|しょめい} ね 。 || A leaf instead of a name. A stylish signature.
> {名前|なまえ} の {代|か}わり に {葉|は}っぱ 。 {粋|いき} な {署名|しょめい} や な 。 || A leaf instead of a name. Now that's a stylish signature.
@ cases/30_view:75 [cs.view_seat]
= {絵|え} も 、 やっと {帰|かえ}って きた ね 。 || The picture's finally come home.
> {絵|え} も 、 やっと {帰|かえ}って きた な 。 || The picture's finally come home, too.
@ cases/30_view:144 [cs.talk_view]
= {客席|きゃくせき} から {見|み}る の と 、 {舞台|ぶたい} の {上|うえ} から {見|み}る の と 。 {左右|さゆう} が {逆|ぎゃく} に なる の よ ね 。 || From the seats, and from the stage. Left and right swap over.
> {客席|きゃくせき} から {見|み}る の と 、 {舞台|ぶたい} の {上|うえ} から {見|み}る の と 。 {左右|さゆう} が {逆|ぎゃく} に なる ねん な 。 || From the seats, and from up on the stage. Left and right swap over, y'know.
@ cases/30_view:150 [cs.talk_view]
= {裏返|うらがえ}す だけ で {正解|せいかい} ！ {一番|いちばん} {好|す}き な {種明|たねあ}かし よ 。 || Just turn it over and there's the answer! My favourite kind of reveal.
> {裏返|うらがえ}す だけ で {正解|せいかい} ！ {一番|いちばん} {好|す}き な {種明|たねあ}かし や わ 。 || Just flip it over and there's yer answer! My favourite kind of reveal.
@ pets/cat:6 [pets.cat.notice]
= ね 、 {大工|だいく} さん の {家|いえ} の {横|よこ} 。 {猫|ねこ} が {出|で}たり {入|はい}ったり してる 。 || Look, by the carpenter's house. A cat, in and out, in and out.
> なあ 、 {大工|だいく} さん の {家|いえ} の {横|よこ} 。 {猫|ねこ} が {出|で}たり {入|はい}ったり してる で 。 || Hey, by the carpenter's house. There's a cat goin' in and out, in and out.
@ pets/cat:15 [pets.cat.cat]
= {入|はい}って は {出|で}て 、 {入|はい}って は {出|で}て 。 {舞台|ぶたい} の {袖|そで} で {待|ま}ってる みたい 。 || In, out, in, out. Like waiting in the wings.
> {入|はい}って は {出|で}て 、 {入|はい}って は {出|で}て 。 {舞台|ぶたい} の {袖|そで} で {待|ま}ってる みたい や 。 || In, out, in, out. Like it's waitin' in the wings.
@ pets/cat:35 [pets.cat.cat]
= {客席|きゃくせき} が {一|ひと}つ 、 {埋|う}まった ! || One seat in the house, taken!
> {客席|きゃくせき} が {一|ひと}つ 、 {埋|う}まった で ! || One seat in the house, taken!
@ pets/cat:69 [pets.cat.screen]
= {舞台|ぶたい} {装置|そうち} 、 {固定|こてい} {完了|かんりょう} ! || Set piece secured!
> {舞台|ぶたい} {装置|そうち} 、 {固定|こてい} {完了|かんりょう} や ! || Set piece secured!
@ pets/bird:6 [pets.bird.notice]
= {岸壁|がんぺき} の {端|はし} 、 {小鳥|ことり} が {着地|ちゃくち} に {失敗|しっぱい} してる 。 {何回目|なんかいめ} かな 。 || End of the quay — a little bird fluffing its landing. How many tries is that?
> {岸壁|がんぺき} の {端|はし} で 、 {小鳥|ことり} が {着地|ちゃくち} に {失敗|しっぱい} してる わ 。 {何回目|なんかいめ} やろ な 。 || End of the quay — a little bird's fluffin' its landing. How many tries is that now?
@ pets/bird:14 [pets.bird.bird]
= {毎回|まいかい} {同|おな}じ {所|ところ} で {転|ころ}ぶ {役者|やくしゃ} みたい 。 || Like an actor who trips on the same board every night.
> {毎回|まいかい} {同|おんな}じ とこ で {転|ころ}ぶ {役者|やくしゃ} みたい や 。 || Like an actor who trips on the same board every night.
@ pets/bird:35 [pets.bird.bird]
= {最前列|さいぜんれつ} の {席|せき} 、 {確保|かくほ} ! || Front-row seat, secured!
> {最前列|さいぜんれつ} の {席|せき} 、 {確保|かくほ} や ! || Front-row seat, secured!
@ pets/bird:70 [pets.bird.post]
= {舞台|ぶたい} の {片付|かたづ}け 、 {完了|かんりょう} ! || Stage cleared!
> {舞台|ぶたい} の {片付|かたづ}け 、 {完了|かんりょう} や で ! || Stage cleared!
@ pets/dog:6 [pets.dog.notice]
= {水番|みずばん} さん の {庭|にわ} に 、 {看板|かんばん} {犬|いぬ} {発見|はっけん} 。 でも 、 {寝|ね}られない みたい 。 || Spotted: one star dog in the channel keeper's yard. But he can't get to sleep.
> {水番|みずばん} さん の {庭|にわ} に 、 {看板|かんばん} {犬|いぬ} {発見|はっけん} 。 せやけど 、 {寝|ね}られへん みたい や 。 || Spotted: one star dog in the channel keeper's yard. But he can't get to sleep, looks like.
@ pets/dog:14 [pets.dog.dog]
= {幕|まく} が {閉|し}まらない {舞台|ぶたい} みたい 。 {落|お}ち{着|つ}かない よ ね 。 || Like a stage where the curtain won't stay down. Unsettling.
> {幕|まく} が {閉|し}まらへん {舞台|ぶたい} みたい 。 {落|お}ち{着|つ}かへん よ な 。 || Like a stage where the curtain won't stay down. Can't settle, can ya.
@ pets/dog:34 [pets.dog.dog]
= {拍手|はくしゅ} の {代|か}わり に 、 しっぽ ! || Instead of applause — a tail!
> {拍手|はくしゅ} の {代|か}わり に 、 しっぽ や ! || Instead of applause — a tail!
@ pets/dog:70 [pets.dog.gate]
= {幕|まく} 、 {下|お}りました ! || Curtain down!
> =
@ pets/tanuki:6 [pets.tanuki.notice]
= {見|み}て {見|み}て 、 たぬき ! {木|き} の {下|した} で 、 {出|で}たり {入|はい}ったり 。 || Look, look — a tanuki! In and out under the trees.
> {見|み}て {見|み}て 、 たぬき や ! {木|き} の {下|した} で 、 {出|で}たり {入|はい}ったり してる 。 || Look, look — a tanuki! Goin' in and out under the trees.
@ pets/tanuki:14 [pets.tanuki.tanuki]
= {出番|でばん} の たびに {紙吹雪|かみふぶき} 。 {本人|ほんにん} は {嬉|うれ}しくない みたい 。 || Confetti at every entrance. It doesn't seem pleased.
> {出番|でばん} の たびに {紙吹雪|かみふぶき} 。 {本人|ほんにん} は {嬉|うれ}しくない みたい や けど 。 || Confetti at every entrance. It ain't too pleased about it, though.
@ pets/tanuki:32 [pets.tanuki.tanuki]
= {新人|しんじん} {役者|やくしゃ} 、 {入団|にゅうだん} {希望|きぼう} ! || A new player, hoping to join the company!
> {新人|しんじん} {役者|やくしゃ} 、 {入団|にゅうだん} {希望|きぼう} やて ! || A new player, wantin' to join the company!
@ pets/tanuki:74 [pets.tanuki.papers]
= {紙吹雪|かみふぶき} 、 {片付|かたづ}け {完了|かんりょう} ! || Confetti cleared!
> {紙吹雪|かみふぶき} 、 {片付|かたづ}け {完了|かんりょう} や ! || Confetti cleared!
@ pets/greet:112 [pets.greet.suzu.cat]
= {本日|ほんじつ} の {主役|しゅやく} 、 ご{登場|とうじょう} ! || And now, entering: the star of today's show!
> =
@ pets/greet:115 [pets.greet.suzu.cat]
= {大物|おおもの} は {拍手|はくしゅ} に {応|こた}えない 。 {分|わ}かる 。 || Stars don't bow for applause. I get it.
> {大物|おおもの} は {拍手|はくしゅ} に {応|こた}えへん 。 {分|わ}かる わ 。 || Stars don't bow for applause. I get it.
@ pets/greet:123 [pets.greet.suzu.dog]
= いち 、 に 、 さん 、 はい ! || One, two, three, go!
> =
@ pets/greet:126 [pets.greet.suzu.dog]
= {振|ふ}り{付|つ}け 、 {変|か}えた でしょ ! || You changed the choreography!
> {振|ふ}り{付|つ}け 、 {変|か}えた やろ ! || You went and changed the choreography!
@ pets/greet:134 [pets.greet.suzu.bird]
= {今|いま} の 、 {完璧|かんぺき} じゃない ? {二重唱|にじゅうしょう} 、 {決定|けってい} ! || Wait, that was perfect! A duet it is!
> {今|いま} の 、 {完璧|かんぺき} ちゃう ? {二重唱|にじゅうしょう} 、 {決定|けってい} や ! || Wait, wasn't that perfect? A duet it is!
@ pets/greet:138 [pets.greet.suzu.tanuki]
= では 、 {見得|みえ} を {切|き}ります ! || And now: the pose!
> ほな 、 {見得|みえ} を {切|き}ります ! || Well then — here's the pose!
@ pets/greet:143 [pets.greet.suzu.tanuki]
= {完璧|かんぺき} ! {看板|かんばん} {役者|やくしゃ} は あなた ね 。 || Perfect! You're the headliner.
> {完璧|かんぺき} ! {看板|かんばん} {役者|やくしゃ} は あんた や な 。 || Perfect! You're the headliner.
@ wordplay/20_reflect:88 [wp.reflect_suzu]
= さっき の しりとり 、 {楽|たの}しかった わ 。 {台本|だいほん} の ない {舞台|ぶたい} って 、 {久|ひさ}しぶり 。 あなた は どう だった ？ || That game was fun. A stage with no script — it's been a while. How was it for you?
> さっき の しりとり 、 {楽|たの}しかった わ 。 {台本|だいほん} の ない {舞台|ぶたい} って 、 {久|ひさ}しぶり や 。 あんた は どう やった ？ || That game was fun. A stage with no script — been a while. How was it for you?
@ wordplay/20_reflect:89 [wp.reflect_suzu]
= さっき の しりとり 、 {二人|ふたり} で {台本|だいほん} なし の {舞台|ぶたい} を やった みたい だった わ 。 あなた は どう だった ？ || That chain felt like the two of us putting on a show with no script. How was it for you?
> さっき の しりとり 、 {二人|ふたり} で {台本|だいほん} なし の {舞台|ぶたい} に {立|た}った みたい やった わ 。 あんた は どう やった ？ || That chain felt like the two of us puttin' on a show with no script. How was it for ya?
@ wordplay/20_reflect:96 [wp.reflect_suzu]
= {了解|りょうかい} 。 {楽屋|がくや} の {話|はなし} は また {今度|こんど} ね 。 || Understood. Backstage talk can wait for another time.
> {了解|りょうかい} 。 {楽屋|がくや} の {話|はなし} は また {今度|こんど} な 。 || Gotcha. Backstage talk can wait for another time.
@ wordplay/20_reflect:100 [wp.reflect_suzu]
= {先|さき} を {読|よ}む {人|ひと} ね 。 {即興|そっきょう} でも 、 {一番|いちばん} {大事|だいじ} なの は {間|ま} を {読|よ}む こと よ 。 || Someone who reads ahead. Even improvising, what matters most is reading the timing.
> {先|さき} を {読|よ}む {人|ひと} や な 。 {即興|そっきょう} でも 、 {一番|いちばん} {大事|だいじ} なの は {間|ま} を {読|よ}む こと や で 。 || Someone who reads ahead. Even improvisin', what matters most is readin' the timing.
@ wordplay/20_reflect:104 [wp.reflect_suzu]
= {分|わ}かる わ 。 {台詞|せりふ} が {出|で}て こない {時|とき} の あの {間|ま} 。 でも 、 {待|ま}って もらえる {舞台|ぶたい} は {悪|わる}く ない でしょ 。 || I know. That pause when your line won't come. But a stage where someone waits for you isn't so bad, is it.
> {分|わ}かる わ 。 {台詞|せりふ} が {出|で}て けえへん {時|とき} の あの {間|ま} 。 せやけど 、 {待|ま}って もらえる {舞台|ぶたい} は {悪|わる}く ない やろ 。 || I know. That pause when yer line just won't come. But a stage where somebody waits for ya ain't so bad, is it.
@ wordplay/20_reflect:108 [wp.reflect_suzu]
= …… ふふ 。 {一人|ひとり} で {光|ひかり} を {浴|あ}びる より 、 {二人|ふたり} で {分|わ}けた {方|ほう} が {楽|たの}しい の よ 。 || …Heh. Sharing the spotlight is more fun than standing in it alone.
> …… ふふ 。 {一人|ひとり} で {光|ひかり} {浴|あ}びる より 、 {二人|ふたり} で {分|わ}けた {方|ほう} が {楽|たの}しい ねん 。 || …Heh. Sharin' the spotlight's more fun than standin' in it alone.
@ wordplay/20_reflect:111 [wp.reflect_suzu]
= {主役|しゅやく} を {取|と}った の は あなた だった けど ね 。 || Though you were the one who took the lead role.
> {主役|しゅやく} {取|と}った ん は あんた やった けど な 。 || Though you were the one who took the lead.
@ wordplay/20_reflect:112 [wp.reflect_suzu]
= {勝|か}った の は {私|わたし} だけど 、 {拍手|はくしゅ} は {二人|ふたり} {分|ぶん} よ 。 || I won, but the applause is for both of us.
> {勝|か}った ん は うち やけど 、 {拍手|はくしゅ} は {二人|ふたり} {分|ぶん} や で 。 || I won, but the applause is for the both of us.
@ wordplay/20_reflect:113 [wp.reflect_suzu]
= また {幕|まく} を {開|あ}けましょう 。 {次|つぎ} の {舞台|ぶたい} も {楽|たの}しみ に してる わ 。 || Let's raise the curtain again. I'm looking forward to the next show.
> また {幕|まく} {開|あ}けよ な 。 {次|つぎ} の {舞台|ぶたい} も {楽|たの}しみ に してる わ 。 || Let's raise the curtain again, a'right? I'm lookin' forward to the next show.
@ reaction case_parcel_suzu_reasoned[0]
= {伏線|ふくせん} を ぜんぶ {回収|かいしゅう} ！ {帳簿|ちょうぼ} も {合|あ}った し 、 {気持|きも}ち いい わ 。 || Every thread tied up! And the books balance. Lovely.
> {伏線|ふくせん} 、 ぜんぶ {回収|かいしゅう} や ！ {帳簿|ちょうぼ} も {合|あ}った し 、 {気持|きも}ち ええ わ 。 || Every thread tied up! And the books balance. Feels good.
@ reaction case_parcel_suzu_early[0]
= {最後|さいご} の {幕|まく} まで {待|ま}たず に {犯人|はんにん} を {当|あ}てる {観客|かんきゃく} 、 いる の よ ね 。 あなた みたい な 。 || There's always someone in the audience who guesses before the last act. Someone like you.
> {最後|さいご} の {幕|まく} まで {待|ま}たんと {犯人|はんにん} {当|あ}てる {観客|かんきゃく} 、 いてる ねん な 。 あんた みたい な 。 || There's always somebody in the audience who guesses before the last act. Somebody like you.
@ reaction case_parcel_suzu_helped[0]
= {台本|だいほん} を {覗|のぞ}いて も 、 {舞台|ぶたい} は {舞台|ぶたい} 。 {届|とど}けた の は {本物|ほんもの} よ 。 || Peek at the script if you like; the performance is still real. That was a real delivery.
> {台本|だいほん} {覗|のぞ}いて も 、 {舞台|ぶたい} は {舞台|ぶたい} 。 {届|とど}けた ん は {本物|ほんもの} や で 。 || Peek at the script all ya like, the show's still the show. That was a real delivery.
@ reaction case_view_suzu_noticed[0]
= {袖|そで} から {見|み}た {舞台|ぶたい} と 、 {客席|きゃくせき} から {見|み}た {舞台|ぶたい} 。 {同|おな}じ {芝居|しばい} なのに ね 。 || The stage from the wings, and the stage from the seats. The same play, all the same.
> {袖|そで} から {見|み}た {舞台|ぶたい} と 、 {客席|きゃくせき} から {見|み}た {舞台|ぶたい} 。 {同|おんな}じ {芝居|しばい} やのに な 。 || The stage from the wings, and the stage from the seats. Same play, all the same.
@ reaction case_view_suzu_note[0]
= {種|たね} を {書|か}いた {紙|かみ} を 、 {宿|やど} に {置|お}いて いく {手品師|てじなし} なんて ね 。 {粋|いき} だ わ 。 || A magician who leaves the secret written down at an inn. How stylish.
> {種|たね} {書|か}いた {紙|かみ} を 、 {宿|やど} に {置|お}いて いく {手品師|てじなし} なんて な 。 {粋|いき} や わ 。 || A magician who leaves the secret written down at an inn. How stylish.
@ reaction case_view_suzu_helped[0]
= {種明|たねあ}かし を {聞|き}いて も 、 この {景色|けしき} は {色褪|いろあ}せない わ よ 。 || Knowing how the trick works doesn't make this view any less lovely.
> {種明|たねあ}かし {聞|き}いて も 、 この {景色|けしき} は {色褪|いろあ}せへん で 。 || Knowin' how the trick works don't make this view any less lovely.
@ reaction f1.suzu.screened[0]
= {幕|まく} を {閉|し}めたら 、 {看板|かんばん} が やっと {台詞|せりふ} を {最後|さいご} まで {言|い}えた わ ね 。 || Close the curtain, and the board finally gets to say its lines to the end.
> {幕|まく} {閉|し}めたら 、 {看板|かんばん} が やっと {台詞|せりふ} を {最後|さいご} まで {言|い}えた な 。 || Close the curtain, and the board finally got to say its lines all the way through.
@ reaction f1.suzu.warded[0]
= {袖|そで} で {誰|だれ} か が {幕|まく} を {押|お}さえてる {間|あいだ} に 、 {釘|くぎ} を {打|う}つ 。 {舞台|ぶたい} {裏|うら} は いつも そう よ 。 || Someone holds the curtain in the wings while someone else knocks the nail in. That's backstage for you.
> {袖|そで} で {誰|だれ} か が {幕|まく} {押|お}さえてる {間|あいだ} に 、 {釘|くぎ} {打|う}つ 。 {舞台|ぶたい} {裏|うら} は いつも そう や で 。 || Somebody holds the curtain in the wings while somebody else knocks the nail in. That's backstage for ya.
@ reaction f1.suzu.any[0]
= はい 、 {静|しず}か に なった 。 {名札|なふだ} の {皆|みな}さん 、 お{待|ま}たせ 。 || There, quiet at last. Sorry to keep you waiting, names.
> はい 、 {静|しず}か に なった わ 。 {名札|なふだ} の {皆|みな}さん 、 お{待|ま}たせ 。 || There, quiet at last. Sorry to keep y'all waitin', names.
@ reaction f2.suzu.filled[0]
= {幕|まく} が {上|あ}がる みたい に 、 {浮|う}き が {上|あ}がった ！ {水|みず} の {演出|えんしゅつ} 、 {好|す}き よ 。 || Up came the float like a curtain rising! I love a water effect.
> {幕|まく} が {上|あ}がる みたい に 、 {浮|う}き が {上|あ}がった ！ {水|みず} の {演出|えんしゅつ} 、 {好|す}き やねん 。 || Up came the float like a curtain risin'! I do love a water effect.
@ reaction f2.suzu.cranked[0]
= {幕|まく} の {綱|つな} を {引|ひ}く {係|かかり} ね 。 {止|と}め{爪|づめ} が なかったら 、 {芝居|しばい} の {途中|とちゅう} で {幕|まく} が {落|お}ちる わ 。 || The one on the curtain rope! Without the catch, the curtain would drop mid-play.
> {幕|まく} の {綱|つな} {引|ひ}く {係|かかり} や な 。 {止|と}め{爪|づめ} が なかったら 、 {芝居|しばい} の {途中|とちゅう} で {幕|まく} が {落|お}ちてまう わ 。 || The one on the curtain rope! Without the catch, the curtain'd drop mid-play.
@ reaction f2.suzu.vane[0]
= {風|かぜ} に {出演料|しゅつえんりょう} を {払|はら}わなくちゃ 。 {見事|みごと} な {脇役|わきやく} だった わ 。 || We should pay the wind a fee. What a supporting performance.
> {風|かぜ} に {出演料|しゅつえんりょう} {払|はら}わな あかん な 。 {見事|みごと} な {脇役|わきやく} やった わ 。 || We oughta pay the wind a fee. What a supportin' performance.
@ reaction f2.suzu.any[0]
= {浮|う}き さん 、 {窓|まど} で {出番|でばん} 。 || The float takes its bow at the window.
> {浮|う}き さん 、 {窓|まど} で {出番|でばん} や 。 || The float takes its bow at the window.
@ reaction f3.suzu.ordinary[0]
= {照明|しょうめい} は {横|よこ} から 。 {舞台|ぶたい} と {同|おな}じ ね 。 {真上|まうえ} から だと 、 {顔|かお} が {全部|ぜんぶ} {平|たい}ら に なる の 。 || Light from the side — same as the stage. From straight above, every face goes flat.
> {照明|しょうめい} は {横|よこ} から 。 {舞台|ぶたい} と {同|おんな}じ や な 。 {真上|まうえ} から やと 、 {顔|かお} が {全部|ぜんぶ} {平|たい}ら に なってまう ねん 。 || Light from the side — same as the stage. From straight above, every face goes flat.
@ reaction f3.suzu.woven[0]
= {石|いし} の {大道具|おおどうぐ} に 、 {言葉|ことば} の {照明|しょうめい} 。 {裏方|うらかた} {二人|ふたり} {分|ぶん} の {仕事|しごと} よ 。 || Stone for the scenery, a word for the lighting. That's two stagehands' work.
> {石|いし} の {大道具|おおどうぐ} に 、 {言葉|ことば} の {照明|しょうめい} 。 {裏方|うらかた} {二人|ふたり} {分|ぶん} の {仕事|しごと} や で 。 || Stone for the scenery, a word for the lightin'. That's two stagehands' work.
@ reaction f3.suzu.mixed[0]
= {半分|はんぶん} {本物|ほんもの} の {道具|どうぐ} 、 {半分|はんぶん} {言葉|ことば} 。 {旅|たび} の {一座|いちざ} は 、 いつも そう よ 。 || Half real props, half words. Touring companies always work like that.
> {半分|はんぶん} {本物|ほんもの} の {道具|どうぐ} 、 {半分|はんぶん} {言葉|ことば} 。 {旅|たび} の {一座|いちざ} は 、 いつも そう や 。 || Half real props, half words. Touring companies always work like that.
@ reaction f3.suzu.any[0]
= {葉|は}っぱ の {署名|しょめい} 、 {素敵|すてき} ね 。 || A leaf for a signature. Lovely.
> {葉|は}っぱ の {署名|しょめい} 、 {素敵|すてき} や な 。 || A leaf for a signature. Lovely.
@ reaction f4.suzu.flame[0]
= {雪|ゆき} の {舞台|ぶたい} に 、 {一瞬|いっしゅん} だけ {火|ひ} の {照明|しょうめい} 。 {粋|いき} ね 。 || A moment of firelight on a snowy stage. Stylish.
> {雪|ゆき} の {舞台|ぶたい} に 、 {一瞬|いっしゅん} だけ {火|ひ} の {照明|しょうめい} 。 {粋|いき} や な 。 || A moment of firelight on a snowy stage. Stylish.
@ reaction f4.suzu.cloth[0]
= {幕|まく} を {拭|ふ}いたら 、 {配役|はいやく} が {出|で}て きた わ 。 ③ {番|ばん} 、 {主役|しゅやく} おめでとう 。 || Wipe the curtain and there's the cast list. Box three, congratulations on the lead.
> {幕|まく} {拭|ふ}いたら 、 {配役|はいやく} が {出|で}て きた わ 。 ③ {番|ばん} 、 {主役|しゅやく} おめでとう 。 || Wipe the curtain and there's the cast list. Box three, congrats on the lead.
@ reaction f4.suzu.any[0]
= {雪|ゆき} の {形|かたち} の {留|と}め{具|ぐ} 、 {可愛|かわい}い 。 || A snowflake toggle. Cute.
> {雪|ゆき} の {形|かたち} の {留|と}め{具|ぐ} 、 {可愛|かわい}い な 。 || A snowflake toggle. Cute.
@ reaction f5.suzu.struck[0]
= {舞台|ぶたい} {裏|うら} の {呼|よ}び{鈴|りん} と {同|おな}じ 。 {客席|きゃくせき} に {聞|き}こえたら {大失敗|だいしっぱい} 。 {今回|こんかい} は {大成功|だいせいこう} よ 。 || Like the backstage call bell: if the audience hears it, disaster. This time, a triumph.
> {舞台|ぶたい} {裏|うら} の {呼|よ}び{鈴|りん} と {同|おんな}じ や 。 {客席|きゃくせき} に {聞|き}こえたら {大失敗|だいしっぱい} 。 {今回|こんかい} は {大成功|だいせいこう} や で 。 || Like the backstage call bell: if the audience hears it, disaster. This time, a triumph.
@ reaction f5.suzu.rung[0]
= {音|おと} の {出番|でばん} なら {私|わたし} の {出番|でばん} …… と {言|い}いたい けど 、 {今日|きょう} の {主役|しゅやく} は あなた 。 || If it's a cue for sound, it's my cue… I'd like to say. But today the lead is you.
> {音|おと} の {出番|でばん} やったら うち の {出番|でばん} …… って {言|い}いたい とこ やけど 、 {今日|きょう} の {主役|しゅやく} は あんた や 。 || If it's a cue for sound, it's my cue… I'd like to say. But today the lead's you.
@ reaction f5.suzu.any[0]
= {花|はな} の {独唱|どくしょう} 、 {聞|き}こえた ？ || Did you hear the flower's solo?
> =
@ reaction f6.suzu.rubbed[0]
= {手袋|てぶくろ} は 「 {預|あず}かり{物|もの} 」 。 {持|も}ち{主|ぬし} が {来|く}る まで 、 {帳面|ちょうめん} に {載|の}って いる 。 {好|す}き よ 、 こういう の 。 || The glove goes under Held for collection — on the books until its owner comes. I like that sort of thing.
> {手袋|てぶくろ} は 「 {預|あず}かり{物|もの} 」 。 {持|も}ち{主|ぬし} が {来|く}る まで 、 {帳面|ちょうめん} に {載|の}ってる ねん 。 {好|す}き や わ 、 こういう の 。 || The glove goes under Held for collection — on the books till its owner comes. I like that sort of thing.
@ reaction f6.suzu.lit[0]
= {光|ひかり} を {当|あ}てたら 、 {札|ふだ} が {自己紹介|じこしょうかい} を {始|はじ}めた わ ね 。 {上|のぼ}り 、 {下|くだ}り 、 {預|あず}かり 。 || Shine a light and the slips introduce themselves: going up, coming down, held.
> {光|ひかり} {当|あ}てたら 、 {札|ふだ} が {自己紹介|じこしょうかい} {始|はじ}めた わ 。 {上|のぼ}り 、 {下|くだ}り 、 {預|あず}かり 。 || Shine a light and the slips introduce themselves: goin' up, comin' down, held.
@ reaction f6.suzu.any[0]
= {帳尻|ちょうじり} が {合|あ}った わ 。 || The books balance.
> {帳尻|ちょうじり} 、 {合|あ}った で 。 || The books balance.
@ wordplay suzu.invite.1
= ねえ 、 {幕間|まくあい} に しりとり しない ？ {本気|ほんき} で {行|い}く わ よ 。 || Hey, shiritori for the interval? I'm playing for real.
> なあ 、 {幕間|まくあい} に しりとり せえへん ？ {本気|ほんき} で {行|い}く で 。 || Hey, shiritori for the interval? I'm playin' for real.
@ wordplay suzu.rules.1
= {前|まえ} の {言葉|ことば} の {最後|さいご} の {字|じ} から {始|はじ}める の 。 ん で {終|お}わったら {幕|まく} 。 {同|おな}じ {言葉|ことば} は {再演|さいえん} {禁止|きんし} よ 。 || You start from the last kana of the word before. End on ん and the curtain falls. No encores of the same word.
> {前|まえ} の {言葉|ことば} の {最後|さいご} の {字|じ} から {始|はじ}める ねん 。 ん で {終|お}わったら {幕|まく} 。 {同|おんな}じ {言葉|ことば} は {再演|さいえん} {禁止|きんし} や で 。 || You start from the last kana of the word before. End on ん and the curtain falls. No encores of the same word.
@ wordplay suzu.rules.2
= {相手|あいて} に {続|つづ}き の ない {字|じ} を {渡|わた}せたら 、 {拍手|はくしゅ} もの よ 。 || Hand your partner a kana with no follow-up, and that's worth applause.
> {相手|あいて} に {続|つづ}き の ない {字|じ} {渡|わた}せたら 、 {拍手|はくしゅ} もん や で 。 || Hand yer partner a kana with no follow-up, and that's worth applause.
@ wordplay suzu.thinking.1
= ふふ 、 {待|ま}って 。 {今|いま} いい の が {浮|う}かび そう 。 || Heh, wait. Something good is coming to me.
> ふふ 、 {待|ま}って 。 {今|いま} ええ の が {浮|う}かび そう や 。 || Heh, hang on. Somethin' good's comin' to me.
@ wordplay suzu.thinking.2
= さあ 、 {何|なに} で {返|かえ}そう かしら 。 || Now, what shall I answer with?
> さあ 、 {何|なに} で {返|かえ}したろ か な 。 || Now, what'll I hit back with?
@ wordplay suzu.move.1
= はい 、 {次|つぎ} の {場面|ばめん} ！ || And — next scene!
> ほな 、 {次|つぎ} の {場面|ばめん} ！ || Right then — next scene!
@ wordplay suzu.move.2
= どう ？ {今|いま} の {繋|つな}ぎ 、 {悪|わる}く ない でしょ 。 || Well? Not a bad transition, was it?
> どう ？ {今|いま} の {繋|つな}ぎ 、 {悪|わる}く ない やろ 。 || Well? Not a bad transition, was it?
@ wordplay suzu.move.3
= あなた の {番|ばん} よ 。 ゆっくり どうぞ 。 || Your turn. Take your time.
> あんた の {番|ばん} や で 。 ゆっくり どうぞ 。 || Yer turn. Take yer time.
@ wordplay suzu.newword.1
= {今|いま} の 、 {知|し}らない {言葉|ことば} だった ？ {札|ふだ} に {意味|いみ} が ある わ 。 || Was that one new to you? The meaning's on the slip.
> {今|いま} の 、 {知|し}らん {言葉|ことば} やった ？ {札|ふだ} に {意味|いみ} ある で 。 || Was that one new to ya? The meaning's on the slip.
@ wordplay suzu.newword.2
= {旅|たび} の {途中|とちゅう} で {覚|おぼ}えた {言葉|ことば} よ 。 || A word I picked up on tour.
> {旅|たび} の {途中|とちゅう} で {覚|おぼ}えた {言葉|ことば} や で 。 || A word I picked up on tour.
@ wordplay suzu.escape.1
= {危|あぶ}ない ！ {最後|さいご} の {一|ひと}つ で {切|き}り{抜|ぬ}けた わ 。 || Close! Got through on the very last one.
> {危|あぶ}なかった ！ {最後|さいご} の {一|ひと}つ で {切|き}り{抜|ぬ}けた わ 。 || Close one! Got through on the very last one.
@ wordplay suzu.escape.2
= {残|のこ}り {一|ひと}つ を {見|み}つける なんて 、 {見事|みごと} な {即興|そっきょう} ね 。 || Finding the very last one — a fine improvisation.
> {残|のこ}り {一|ひと}つ {見|み}つける なんて 、 {見事|みごと} な {即興|そっきょう} や な 。 || Findin' the very last one — a fine improvisation.
@ wordplay suzu.escape.3
= ふう 、 {最後|さいご} の {一|ひと}つ ！ {心臓|しんぞう} に {悪|わる}い わ 。 || Phew, the very last one! Bad for my heart.
> ふう 、 {最後|さいご} の {一|ひと}つ や ！ {心臓|しんぞう} に {悪|わる}い わ 。 || Phew, the very last one! Bad for my heart, that.
@ wordplay suzu.escape.4
= その {字|じ} 、 {最後|さいご} の {一|ひと}つ だった の よ 。 {拍手|はくしゅ} ！ || That kana was down to its last word. Applause!
> その {字|じ} 、 {最後|さいご} の {一|ひと}つ やった ん や で 。 {拍手|はくしゅ} ！ || That kana was down to its last word, y'know. Applause!
@ wordplay suzu.trap.1
= {幕|まく} よ 。 その {字|じ} の {言葉|ことば} は 、 もう {全部|ぜんぶ} {舞台|ぶたい} に {出|で}た わ 。 || Curtain. Every word for that kana has already been on stage.
> {幕|まく} や 。 その {字|じ} の {言葉|ことば} は 、 もう {全部|ぜんぶ} {舞台|ぶたい} に {出|で}た で 。 || Curtain. Every word for that kana's already been on stage.
@ wordplay suzu.trap.2
= {今回|こんかい} は {私|わたし} の {見|み}せ{場|ば} ね 。 || This time the big scene is mine.
> {今回|こんかい} は うち の {見|み}せ{場|ば} や な 。 || This time the big scene's mine.
@ wordplay suzu.win.1
= …… {続|つづ}き が ない ！ ああ 、 {悔|くや}しい 。 {見事|みごと} な {幕切|まくぎ}れ よ 。 || …No follow-up! Oh, that stings. A fine final curtain.
> …… {続|つづ}き が あらへん ！ ああ 、 {悔|くや}しい 。 {見事|みごと} な {幕切|まくぎ}れ や わ 。 || …No follow-up! Oh, that stings. A fine final curtain.
@ wordplay suzu.win.2
= {負|ま}けた わ 。 {拍手|はくしゅ} ！ …… {次|つぎ} は {取|と}り{返|かえ}す けど ね 。 || I lost. Applause! …I'll win it back next time, though.
> {負|ま}けた わ 。 {拍手|はくしゅ} ！ …… {次|つぎ} は {取|と}り{返|かえ}す けど な 。 || I lost. Applause! …I'm gonna win it back next time, though.
@ wordplay suzu.loss.1
= {私|わたし} の {勝|か}ち 。 でも 、 {途中|とちゅう} は {本当|ほんとう} に いい {勝負|しょうぶ} だった わ 。 || My win. But it was a really good contest along the way.
> うち の {勝|か}ち 。 せやけど 、 {途中|とちゅう} は ほんま に ええ {勝負|しょうぶ} やった わ 。 || My win. But it was a real good contest along the way.
@ wordplay suzu.loss.2
= {今日|きょう} の {拍手|はくしゅ} は {私|わたし} が もらう わ 。 {次|つぎ} は あなた の {番|ばん} かも ね 。 || Today's applause goes to me. Next time it might be yours.
> {今日|きょう} の {拍手|はくしゅ} は うち が もらう で 。 {次|つぎ} は あんた の {番|ばん} かも な 。 || Today's applause goes to me. Next time it might be yours.
@ wordplay suzu.loss.3
= ん で {幕|まく} ね 。 {惜|お}しい ！ {次|つぎ} の {舞台|ぶたい} で {取|と}り{返|かえ}しましょう 。 || It ended on ん. So close! Win it back at the next show.
> ん で {幕|まく} や な 。 {惜|お}しい ！ {次|つぎ} の {舞台|ぶたい} で {取|と}り{返|かえ}そ 。 || Ended on ん. So close! We'll win it back at the next show.
@ wordplay suzu.loss.4
= {降参|こうさん} ね 。 {了解|りょうかい} 。 {楽屋|がくや} で {振|ふ}り{返|かえ}り しましょう か 。 || Conceding? Understood. Shall we go over it backstage?
> {降参|こうさん} か 。 {了解|りょうかい} 。 {楽屋|がくや} で {振|ふ}り{返|かえ}り しよ か 。 || Conceding? Gotcha. Shall we go over it backstage?
@ wordplay suzu.loss.5
= ん が {来|き}ちゃった わ ね 。 でも 、 {舞台|ぶたい} は {何度|なんど} でも {開|ひら}ける わ 。 || Along came ん. But the stage can open as many times as we like.
> ん が {来|き}てもうた な 。 せやけど 、 {舞台|ぶたい} は {何度|なんど} でも {開|ひら}ける で 。 || Along came ん. But the stage can open as many times as we like.
@ wordplay suzu.loss.6
= {降参|こうさん} 、 {受|う}け{付|つ}けました 。 {次|つぎ} の {舞台|ぶたい} も {待|ま}ってる わ よ 。 || Concession received. I'll be waiting for the next show.
> {降参|こうさん} 、 {受|う}け{付|つ}けました 。 {次|つぎ} の {舞台|ぶたい} も {待|ま}ってる で 。 || Concession received. I'll be waitin' for the next show.
@ wordplay suzu.coop.1
= {最後|さいご} まで {繋|つな}がった ！ {二人|ふたり} の {舞台|ぶたい} 、 {大成功|だいせいこう} よ 。 || It held all the way! A two-person show, a great success.
> {最後|さいご} まで {繋|つな}がった ！ {二人|ふたり} の {舞台|ぶたい} 、 {大成功|だいせいこう} や ！ || It held all the way! A two-person show, and a big success!
@ wordplay suzu.coop.2
= {息|いき} が {合|あ}って た わ ね 。 {間|ま} の {取|と}り{方|かた} も 。 || We were in step. Our timing, too.
> {息|いき} が {合|あ}ってた な 。 {間|ま} の {取|と}り{方|かた} も 。 || We were in step. Our timin', too.
@ wordplay suzu.stop.1
= {今日|きょう} は ここ で お{休|やす}み 。 {続|つづ}き は また ね 。 || That's the show for today. More another time.
> {今日|きょう} は ここ で お{休|やす}み 。 {続|つづ}き は また な 。 || That's the show for today. More another time.
@ wordplay suzu.stop.2
= {幕間|まくあい} よ 。 {休|やす}む の も {舞台|ぶたい} の うち 。 || Interval. Resting's part of the show.
> {幕間|まくあい} や 。 {休|やす}む の も {舞台|ぶたい} の うち や で 。 || Interval. Restin's part of the show.
@ wordplay suzu.resume.1
= {第二幕|だいにまく} の {始|はじ}まり ！ {前|まえ} の {場面|ばめん} は {覚|おぼ}えてる わ 。 || Act two — curtain up! I remember the last scene.
> {第二幕|だいにまく} の {始|はじ}まり や ！ {前|まえ} の {場面|ばめん} は {覚|おぼ}えてる で 。 || Act two — curtain up! I remember the last scene.
@ wordplay suzu.resume.2
= お{待|ま}たせ 。 {続|つづ}き から よ 。 || Sorry to keep you. We pick up where we were.
> お{待|ま}たせ 。 {続|つづ}き から や で 。 || Sorry to keep ya. We pick up where we were.
@ wordplay suzu.firstclear.1
= この {組|く}み{合|あ}わせ で 、 あなた の {初|はじ}めて の {勝|か}ち ね 。 {帳簿|ちょうぼ} に {書|か}いて おく わ 。 || Your first win at this setting. I'll write it in the ledger.
> この {組|く}み{合|あ}わせ で 、 あんた の {初|はじ}めて の {勝|か}ち や な 。 {帳簿|ちょうぼ} に {書|か}いとく わ 。 || Yer first win at this settin'. I'll put it in the ledger.
@ fishing.remarks.suzu.first[0]
= {水辺|みずべ} の {舞台|ぶたい} 、 {開幕|かいまく} です ！ …… {静|しず}か な {舞台|ぶたい} だ けど ね 。 || The waterside stage — curtain up! …A quiet stage, mind.
> {水辺|みずべ} の {舞台|ぶたい} 、 {開幕|かいまく} や ！ …… {静|しず}か な {舞台|ぶたい} やけど な 。 || The waterside stage — curtain up! …A quiet stage, mind.
@ fishing.remarks.suzu.wait[0]
= {待|ま}つ {間|あいだ} も {芝居|しばい} の うち 。 {間|ま} って 、 {大事|だいじ} な の よ 。 || The waiting is part of the play. A good pause matters.
> {待|ま}つ {間|あいだ} も {芝居|しばい} の うち 。 {間|ま} って 、 {大事|だいじ} な ん や で 。 || The waitin's part of the play. A good pause matters.
@ fishing.remarks.suzu.wait[1]
= しー 。 {主役|しゅやく} は まだ {楽屋|がくや} に いる みたい 。 || Shh. The star still seems to be in the dressing room.
> しー 。 {主役|しゅやく} は まだ {楽屋|がくや} に いてる みたい や 。 || Shh. Seems the star's still in the dressing room.
@ fishing.remarks.suzu.catch[0]
= はい 、 {拍手|はくしゅ} ！ …… {魚|さかな} に は {聞|き}こえない けど 。 || And — applause! …Not that the fish can hear it.
> はい 、 {拍手|はくしゅ} ！ …… {魚|さかな} に は {聞|き}こえへん けど 。 || And — applause! …Not that the fish can hear it.
@ fishing.remarks.suzu.catch[1]
= {立派|りっぱ} な {登場|とうじょう} でした 。 {退場|たいじょう} は {水|みず} の {中|なか} へ 、 どうぞ 。 || A splendid entrance. Exit into the water, if you please.
> =
@ fishing.remarks.suzu.discover[0]
= {新人|しんじん} さん ね ！ {名前|なまえ} 、 {覚|おぼ}えて おかなくちゃ 。 || A newcomer! I must remember the name.
> {新人|しんじん} さん や ！ {名前|なまえ} 、 {覚|おぼ}えて おかな あかん わ 。 || A newcomer! Gotta remember the name.
@ fishing.remarks.suzu.discover[1]
= {初舞台|はつぶたい} ！ ちゃんと {記録|きろく} に {残|のこ}る わ よ 。 || A debut! It goes in the record.
> {初舞台|はつぶたい} ！ ちゃんと {記録|きろく} に {残|のこ}る で 。 || A debut! It goes in the record.
@ fishing.remarks.suzu.stop[0]
= {幕|まく} を {下|お}ろす の も 、 {演出|えんしゅつ} の うち 。 いい {終|お}わり{方|かた} よ 。 || Bringing the curtain down is part of the show. A good ending.
> {幕|まく} {下|お}ろす の も 、 {演出|えんしゅつ} の うち 。 ええ {終|お}わり{方|かた} や で 。 || Bringin' the curtain down is part of the show. A good endin'.
@ fishing.remarks.suzu.stop[1]
= ここ で {終演|しゅうえん} ね 。 また {来|き}ましょう 。 || That's the final curtain for now. Let's come again.
> ここ で {終演|しゅうえん} や な 。 また {来|こ}よ な 。 || That's the final curtain for now. Let's come back sometime.
@ fishing.remarks.suzu.survey[0]
= {三幕|さんまく} {揃|そろ}って 、 {大団円|だいだんえん} ！ ヤス さん に {見|み}せ に {行|い}こう 。 || All three acts — a grand finale! Let's go and show Yasu.
> {三幕|さんまく} {揃|そろ}って 、 {大団円|だいだんえん} ！ ヤス さん に {見|み}せ に {行|い}こ 。 || All three acts — a grand finale! Let's go show Yasu.
@ fishing.remarks.suzu.reflectAsk[0]
= {九|きゅう}{種類|しゅるい} 、 {全員|ぜんいん} {集合|しゅうごう} ！ …… ねえ 、 どう だった ？ || All nine, assembled on stage! …So, how was it?
> {九|きゅう}{種類|しゅるい} 、 {全員|ぜんいん} {集合|しゅうごう} ！ …… なあ 、 どう やった ？ || All nine, on stage together! …So, how was it?
@ fishing.remarks.suzu.reflect[0]
= {待|ま}つ {時間|じかん} は 、 {一番|いちばん} {大事|だいじ} な {間|ま} よ 。 {分|わ}かってる わ ね 。 || The waiting is the most important pause of all. You understand that.
> {待|ま}つ {時間|じかん} は 、 {一番|いちばん} {大事|だいじ} な {間|ま} や 。 {分|わ}かってる やんな 。 || The waitin' is the most important pause of all. You get that, don't ya.
@ fishing.remarks.suzu.reflect[1]
= {舞台|ぶたい} が {変|か}われば 、 {出演者|しゅつえんしゃ} も {変|か}わる 。 {当然|とうぜん} ね ！ || Change the stage and the cast changes. Naturally!
> {舞台|ぶたい} が {変|か}わったら 、 {出演者|しゅつえんしゃ} も {変|か}わる 。 {当然|とうぜん} や な ！ || Change the stage and the cast changes. Naturally!
@ fishing.remarks.suzu.reflect[2]
= …… {主役|しゅやく} を {分|わ}け{合|あ}う の 、 {悪|わる}く ない でしょ 。 || …Sharing the spotlight isn't bad, is it.
> …… {主役|しゅやく} を {分|わ}け{合|あ}う の 、 {悪|わる}く ない やろ 。 || …Sharin' the spotlight ain't bad, is it.
@ fishing.memories.outing.reply
= {静|しず}か な {舞台|ぶたい} も 、 {悪|わる}く ない わ ね 。 || A quiet stage isn't bad either.
> {静|しず}か な {舞台|ぶたい} も 、 {悪|わる}く ない な 。 || A quiet stage ain't bad either.
@ pets.meeting.cat.reply
= {初日|しょにち} から {主役|しゅやく} だ ね 。 わたし も {登場|とうじょう} の {仕方|しかた} を {練習|れんしゅう} しなきゃ 。 || A headliner from opening night. I’ll have to work on my entrances.
> {初日|しょにち} から {主役|しゅやく} や ね 。 うち も {登場|とうじょう} の {仕方|しかた} 、 {練習|れんしゅう} せな あかん わ 。 || A headliner from openin' night. I'll have to work on my entrances.
@ pets.meeting.bird.reply
= {同|おな}じ {立|た}ち{位置|いち} を {何度|なんど} も {狙|ねら}って た ね 。 {頑固|がんこ} 。 もう {好|す}き に なっちゃった 。 || It kept trying for the same spot on stage. Stubborn. I like it already.
> {同|おんな}じ {立|た}ち{位置|いち} を {何度|なんど} も {狙|ねら}ってた な 。 {頑固|がんこ} や 。 もう {好|す}き に なってもうた わ 。 || It kept tryin' for the same spot on stage. Stubborn. I like it already.
@ pets.meeting.dog.reply
= {旅|たび}の{人|ひと} を {全員|ぜんいん} {出迎|でむか}えて きた ん だ もの 。 {一度|いちど} くらい 、 {一緒|いっしょ} に {旅|たび} に {出|で}て も いい よ ね 。 || Every traveller got a welcome from him. It’s only fair somebody finally took him along for the show.
> {旅|たび}の{人|ひと} を {全員|ぜんいん} {出迎|でむか}えて きた ん や もん 。 いっぺん くらい 、 {一緒|いっしょ} に {旅|たび} に {出|で}て も ええ やんな 。 || Every traveller got a welcome from him. Only fair somebody finally took him along for the show.
@ pets.meeting.tanuki.reply
= {生|う}まれつき の {代役|だいやく} だ ね 。 {見|み}て {全部|ぜんぶ} {覚|おぼ}える 。 きっと {気|き} が {合|あ}う よ 。 || A born understudy. It learns every move by watching. We’ll get along.
> {生|う}まれつき の {代役|だいやく} や な 。 {見|み}て {全部|ぜんぶ} {覚|おぼ}える 。 きっと {気|き} {合|あ}う わ 。 || A born understudy. Learns every move just by watchin'. We'll get along, I reckon.
`, 'dialect/kansai_85_side');
