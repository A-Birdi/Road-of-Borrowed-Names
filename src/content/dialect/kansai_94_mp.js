/* Suzu's Kansai-ben: Manybridge, Chapter 4 (expansion P09). Blockprint Row, Playhouse Row, the festival.
 * Format and rules: src/lang/85_dialect.js, docs/dialect/suzu_kansai.md.
 * "=" the standard line as authored (the key: its Japanese); ">" the Kansai version. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.dialect.add('kansai', `
@ mp/20_scenes_print [mp.arrive]
= {刷|す}り{物|もの} の {通|とお}り が 、 {真|ま}っ{白|しろ} …… 。 {芝居|しばい} の {番付|ばんづけ} も 、 ここ で {刷|す}る の よ 。 || Blockprint Row, gone white… This is where the playbills are printed, too.
> {刷|す}り{物|もの} の {通|とお}り が 、 {真|ま}っ{白|しろ} や …… 。 {芝居|しばい} の {番付|ばんづけ} も 、 ここ で {刷|す}る ねん で 。 || Blockprint Row, all gone white… This is where the playbills get printed, y'know.
@ mp/20_scenes_print [mp.sobe_first]
= {番付|ばんづけ} が {刷|す}れない と 、 {芝居小屋|しばいごや} も {困|こま}る わ ね 。 || If the playbills can't be printed, the playhouse is in trouble too.
> {番付|ばんづけ} が {刷|す}れへん と 、 {芝居小屋|しばいごや} も {困|こま}る わ な 。 || If the playbills can't be printed, the playhouse is in trouble too.
= {川開|かわびら}き ！ {花火|はなび} の {上|あ}がる 、 あの お{祭|まつ}り ね 。 || The Opening of the River! The festival with the fireworks.
> {川開|かわびら}き ！ {花火|はなび} の {上|あ}がる 、 あの お{祭|まつ}り や な 。 || The Opening of the River! The one with the fireworks.
@ mp/20_scenes_print [mp.oldest_block]
= ツル さん の {台詞|せりふ} と 、 そっくり よ 。 {何百年|なんびゃくねん} も {前|まえ} の {台本|だいほん} に 、 {同|おな}じ {台詞|せりふ} が ある みたい 。 || Word for word what Tsuru said. As if a script from hundreds of years ago had the same line.
> ツル さん の {台詞|せりふ} と 、 そっくり や 。 {何百年|なんびゃくねん} も {前|まえ} の {台本|だいほん} に 、 {同|おな}じ {台詞|せりふ} が ある みたい や わ 。 || Word for word what Tsuru said. Like a script from hundreds of years back had the same line.
@ mp/20_scenes_print [mp.tonic_bill]
= {口上|こうじょう} が うまい わ ね 。 {役者|やくしゃ} に {向|む}いてる わ 。 || Smooth patter. He'd make a fine actor.
> {口上|こうじょう} が うまい な あ 。 {役者|やくしゃ} に {向|む}いてる わ 。 || Smooth patter, that. He'd make a fine actor.
@ mp/20_scenes_print [mp.tokube]
= {何|なん} でも {治|なお}る は 、 {何|なに} も {治|なお}らない と {同|おな}じ かも ね 。 || "Cures everything" might be the same as "cures nothing".
> {何|なん} でも {治|なお}る は 、 {何|なに} も {治|なお}らへん と {同|おな}じ かも な 。 || "Cures everything" might be the same as "cures nothing", mind.
@ mp/21_scenes_stage [mp.playhouse_first]
= …… {芝居小屋|しばいごや} の {匂|にお}い 。 {木|き} と 、 {白粉|おしろい} と 、 {埃|ほこり} 。 {久|ひさ}しぶり ね 。 || …The smell of a playhouse. Wood, face powder, dust. It's been a while.
> …… {芝居小屋|しばいごや} の {匂|にお}い や 。 {木|き} と 、 {白粉|おしろい} と 、 {埃|ほこり} 。 {久|ひさ}しぶり や わ 。 || …The smell of a playhouse. Wood, face powder, dust. Been a while.
@ mp/21_scenes_stage [mp.manbe_first]
= {役者|やくしゃ} から {役|やく} を {取|と}る なんて 、 {一番|いちばん} {残酷|ざんこく} な こと よ 。 …… {黙|だま}って いられない わ 。 || Taking an actor's part away is the cruellest thing there is. …I can't keep quiet about this.
> {役者|やくしゃ} から {役|やく} を {取|と}る やなんて 、 {一番|いちばん} {残酷|ざんこく} な こと や で 。 …… {黙|だま}ってられへん わ 。 || Taking an actor's part away, that's the cruellest thing there is. …I can't keep quiet about this.
@ mp/21_scenes_stage [mp.rehearsal]
= {鉛筆|えんぴつ} で {書|か}き{込|こ}んだ {名前|なまえ} は 、 {消|き}えて も また {書|か}ける わ 。 {役者|やくしゃ} は 、 そう やって {生|い}きて きた の よ 。 || A name pencilled in can be written again if it fades. That's how actors have always lived.
> {鉛筆|えんぴつ} で {書|か}き{込|こ}んだ {名前|なまえ} は 、 {消|き}えて も また {書|か}ける やん 。 {役者|やくしゃ} は 、 そう やって {生|い}きて きた ねん で 。 || A name pencilled in can be written again if it fades. That's how actors have always lived, see.
@ mp/21_scenes_stage [mp.manbe_under]
= {奈落|ならく} …… {舞台|ぶたい} の {下|した} の 、 {役者|やくしゃ} が {怖|こわ}がる {場所|ばしょ} よ 。 {一緒|いっしょ} なら 、 {平気|へいき} 。 || The Understage… the place under the stage that actors are afraid of. With you, I'll be fine.
> {奈落|ならく} …… {舞台|ぶたい} の {下|した} の 、 {役者|やくしゃ} が {怖|こわ}がる {場所|ばしょ} や 。 {一緒|いっしょ} やったら 、 {平気|へいき} や 。 || The Understage… the place under the stage actors are scared of. With you, I'm fine.
@ mp/21_scenes_stage [mp.stagedoor]
= …… あら 。 {懐|なつ}かしい 。 わたし 、 こんな に {小|ちい}さい {字|じ} だった の ね 。 || …Oh. How it takes me back. My name was this small.
> …… あら 。 {懐|なつ}かしい わ あ 。 うち 、 こんな に {小|ちい}さい {字|じ} やった ん や な 。 || …Oh. Takes me back. My name was this small, eh.
= …… {後|あと} で {読|よ}む わ 。 {今|いま} は {芝居|しばい} の {方|ほう} が {大事|だいじ} 。 || …I'll read it later. The play matters more just now.
> …… {後|あと} で {読|よ}む わ 。 {今|いま} は {芝居|しばい} の {方|ほう} が {大事|だいじ} や 。 || …I'll read it later. The play matters more right now.
= {一言|ひとこと} だけ 、 {残|のこ}して いく わ 。 「スズ は {元気|げんき} です 。 {心配|しんぱい} しないで 。」 …… これ で いい の 。 || I'll leave just a line. "Suzu is well. Don't worry." …That will do.
> {一言|ひとこと} だけ 、 {残|のこ}して いく わ 。 「スズ は {元気|げんき} です 。 {心配|しんぱい} しないで 。」 …… これ で ええ ねん 。 || I'll leave just a line. "Suzu is well. Don't worry." …That'll do.
@ mp/21_scenes_stage [mp.genta]
= {漫才|まんざい} ？ …… ふふ 。 わたし が ボケ で 、 この {人|ひと} が ツッコミ なら 、 {出|で}て あげる わ 。 || A double act? …Heh. If I'm the funny one and this one plays it straight, I'll go on.
> {漫才|まんざい} ？ …… ふふ 。 うち が ボケ で 、 この {人|ひと} が ツッコミ やったら 、 {出|で}たる わ 。 || A double act? …Heh. If I'm the funny one and this one plays it straight, I'll go on.
@ mp/21_scenes_stage [mp.manzai]
= はい 、 どうも どうも ！ {今日|きょう} は いい {天気|てんき} です ね 。 だから 、 {傘|かさ} を {三本|さんぼん} {持|も}って {来|き}ました ！ || Hello, hello! Lovely weather today. So I brought three umbrellas!
> はい 、 どうも どうも ！ {今日|きょう} は ええ {天気|てんき} や ね 。 せやから 、 {傘|かさ} を {三本|さんぼん} {持|も}って {来|き}ました ！ || Hello, hello! Lovely weather today, innit. So I brought three umbrellas!
= わたし 、 {毎朝|まいあさ} {走|はし}って います 。 …… {夢|ゆめ} の {中|なか} で 。 || I go for a run every morning. …In my dreams.
> うち 、 {毎朝|まいあさ} {走|はし}ってる ねん 。 …… {夢|ゆめ} の {中|なか} で 。 || I go for a run every morning. …In my dreams.
= {昨日|きのう} は ね 、 {箸|はし} を {渡|わた}って 、 {橋|はし} で ご{飯|はん} を {食|た}べました 。 || Yesterday I crossed the chopsticks and ate my rice with a bridge.
> {昨日|きのう} は な 、 {箸|はし} を {渡|わた}って 、 {橋|はし} で ご{飯|はん} {食|た}べた ねん 。 || Yesterday, see, I crossed the chopsticks and ate my rice with a bridge.
= …… ありがとう 、 {相方|あいかた} 。 {久|ひさ}しぶり に 、 {舞台|ぶたい} で {笑|わら}った わ 。 {間|ま} の {取|と}り{方|かた} 、 {悪|わる}く ない わ よ 。 || …Thank you, partner. It's been a long time since I laughed on a stage. Your timing's not bad at all.
> …… おおきに 、 {相方|あいかた} 。 {久|ひさ}しぶり に 、 {舞台|ぶたい} で {笑|わら}った わ 。 {間|ま} の {取|と}り{方|かた} 、 {悪|わる}く ない で 。 || …Thanks, partner. Been a long time since I laughed on a stage. Your timing's not bad at all.
@ mp/21_scenes_stage [mp.saku_first]
= {名前|なまえ} が なくて も 、 {台詞|せりふ} は {体|からだ} が {覚|おぼ}えて いる わ 。 {一緒|いっしょ} に 、 {読|よ}んで みましょう 。 || Your body remembers the lines, even without the name. Let's read them together.
> {名前|なまえ} が なくて も 、 {台詞|せりふ} は {体|からだ} が {覚|おぼ}えてる で 。 {一緒|いっしょ} に 、 {読|よ}んで みよ か 。 || Your body remembers the lines, even without the name. Shall we read them together?
@ mp/22_scenes_fest [mp.tomi_tasks]
= {舞台|ぶたい} の {演出|えんしゅつ} と {同|おな}じ ね 。 {町|まち} {全体|ぜんたい} が {舞台|ぶたい} よ 。 || It's like directing a show. The whole city's the stage.
> {舞台|ぶたい} の {演出|えんしゅつ} と {同|おな}じ や な 。 {町|まち} {全体|ぜんたい} が {舞台|ぶたい} や で 。 || It's like directing a show. The whole city's the stage.
@ mp/22_scenes_fest [mp.fest_eve]
= {浴衣|ゆかた} は {衣装|いしょう} と {違|ちが}って 、 {役|やく} が ない の 。 {今夜|こんや} は 、 ただ の わたし 。 || A yukata isn't a costume: it comes with no part. Tonight I'm just me.
> {浴衣|ゆかた} は {衣装|いしょう} と {違|ちが}って 、 {役|やく} が あらへん ねん 。 {今夜|こんや} は 、 ただ の うち や 。 || A yukata's not a costume: there's no part with it. Tonight I'm just me.
@ mp/22_scenes_fest [mp.fest_night]
= {幕|まく} が {上|あ}がった わ ね 。 {今夜|こんや} は 、 わたし たち も お{客|きゃく} よ 。 || The curtain's up. Tonight we're the audience too.
> {幕|まく} が {上|あ}がった な 。 {今夜|こんや} は 、 うちら も お{客|きゃく} や で 。 || The curtain's up. Tonight we're the audience too.
@ mp/22_scenes_fest [mp.fireworks]
= {川開|かわびら}き の {花火|はなび} 。 {昔|むかし} は 、 {舞台|ぶたい} の {袖|そで} から {見|み}て いた の 。 {客席|きゃくせき} から {見|み}る の は 、 {初|はじ}めて かも 。 || The Opening's fireworks. I used to watch them from the wings. This might be my first time watching from the audience.
> {川開|かわびら}き の {花火|はなび} や 。 {昔|むかし} は 、 {舞台|ぶたい} の {袖|そで} から {見|み}てた ん よ 。 {客席|きゃくせき} から {見|み}る の は 、 {初|はじ}めて かも しれへん 。 || The Opening's fireworks. I used to watch them from the wings. Might be my first time from the audience.
= {奈落|ならく} で 、 わたし 、 {本気|ほんき} で {怒|おこ}って いた わ 。 {知|し}らない {役者|やくしゃ} たち の ため に 。 || In the Understage I was truly angry. For actors I don't even know.
> {奈落|ならく} で 、 うち 、 {本気|ほんき} で {怒|おこ}ってた わ 。 {知|し}らん {役者|やくしゃ} たち の ため に 。 || Down in the Understage I was truly angry. For actors I don't even know.
= …… {自分|じぶん} の {手紙|てがみ} は 、 まだ {読|よ}んで も いない のに 。 || …When I haven't even read my own letter yet.
> …… {自分|じぶん} の {手紙|てがみ} は 、 まだ {読|よ}んで も へん のに な 。 || …When I haven't even read my own letter yet.
= …… {芝居|しばい} が {好|す}き だから 、 か 。 そう ね 。 まだ 、 {好|す}き みたい 。 || …Because I love the theatre, you mean. Yes. It seems I still do.
> …… {芝居|しばい} が {好|す}き や から 、 か 。 せや な 。 まだ 、 {好|す}き みたい や わ 。 || …Because I love the theatre, you mean. Aye. Seems I still do.
= …… うん 。 {幕|まく} が {下|お}りたら 、 {読|よ}む わ 。 {今夜|こんや} は まだ 、 {花火|はなび} の {番|ばん} 。 || …Mm. I'll read it after the curtain. Tonight is still the fireworks' turn.
> …… うん 。 {幕|まく} が {下|お}りたら 、 {読|よ}む わ 。 {今夜|こんや} は まだ 、 {花火|はなび} の {番|ばん} や 。 || …Mm. I'll read it after the curtain. Tonight is still the fireworks' turn.
= お{礼|れい} は {要|い}らない わ 。 {相方|あいかた} でしょう ？ || No thanks needed. We're partners, aren't we?
> お{礼|れい} なんか {要|い}らん わ 。 {相方|あいかた} やろ ？ || No thanks needed. We're partners, aren't we?
@ mp/22_scenes_fest [mp.chapter_end]
= {次|つぎ} の {幕|まく} は 、 {北|きた} ね 。 {浴衣|ゆかた} は {返|かえ}した けど 、 {花火|はなび} の {音|おと} は まだ {耳|みみ} に {残|のこ}って いる わ 。 || The next act is in the north, then. I gave the yukata back, but I can still hear the fireworks.
> {次|つぎ} の {幕|まく} は 、 {北|きた} や な 。 {浴衣|ゆかた} は {返|かえ}した けど 、 {花火|はなび} の {音|おと} が まだ {耳|みみ} に {残|のこ}ってる わ 。 || The next act's in the north, then. I gave the yukata back, but I can still hear the fireworks.
@ company [mem.fireworks.keep]
= {川開|かわびら}き の {夜|よる} 。 {袖|そで} じゃ なくて 、 {客席|きゃくせき} から {花火|はなび} を {見|み}た の 。 あなた の {隣|となり} で 。 || The night of the Opening. I watched the fireworks from the audience, not the wings. Next to you.
> {川開|かわびら}き の {夜|よる} 。 {袖|そで} や のうて 、 {客席|きゃくせき} から {花火|はなび} を {見|み}た ん よ 。 あんた の {隣|となり} で 。 || The night of the Opening. I watched the fireworks from the audience, not the wings. Next to you.
@ mp/24_scenes_side [mp.shinobu_first]
= {番付|ばんづけ} に {名前|なまえ} の ない {役者|やくしゃ} と {同|おな}じ ね 。 {舞台|ぶたい} に は {立|た}って いる のに 。 || Like an actor left off the playbill. On stage all the same.
> {番付|ばんづけ} に {名前|なまえ} の あらへん {役者|やくしゃ} と {一緒|いっしょ} や 。 {舞台|ぶたい} に は {立|た}ってる のに な 。 || Like an actor left off the playbill. On stage all the same.
@ mp/23_scenes_under [mp.under_arrive]
= {奈落|ならく} …… 。 {子供|こども} の {頃|ころ} 、 ここ に {落|お}ちる {夢|ゆめ} を よく {見|み}た わ 。 {今日|きょう} は 、 {自分|じぶん} で {下|お}りて きた の ね 。 || The Understage… As a child I used to dream of falling down here. Today I came down on my own.
> {奈落|ならく} …… 。 {子供|こども} の {頃|ころ} 、 ここ に {落|お}ちる {夢|ゆめ} を よう {見|み}た わ 。 {今日|きょう} は 、 {自分|じぶん} で {下|お}りて きた ん や な 。 || The Understage… As a kid I used to dream of falling down here. Today I came down on my own.
@ mp/23_scenes_under [mp.ikutsuka]
= {早替|はやが}わり の {衣装|いしょう} は ね 、 {結|むす}び{目|め} を いくつか {一度|いちど} に {解|ほど}く の 。 {選|えら}んだ {所|ところ} だけ 。 || A quick-change costume, you know: you undo a few of its ties at once. Just the ones you choose.
> {早替|はやが}わり の {衣装|いしょう} は な 、 {結|むす}び{目|め} を いくつか {一度|いちど} に {解|ほど}く ねん 。 {選|えら}んだ {所|ところ} だけ や 。 || A quick-change costume, see: you undo a few of its ties at once. Just the ones you pick.
@ mp/23_scenes_under [mp.kuroko_meet]
= {黒子|くろこ} は 、 {見|み}えて も {見|み}えない ふり を する の が {礼儀|れいぎ} よ 。 …… でも 、 ここ は {舞台|ぶたい} じゃ ない わ 。 || With a kuroko, it's good manners to pretend you can't see them. …But this isn't the stage.
> {黒子|くろこ} は 、 {見|み}えて も {見|み}えへん ふり を する の が {礼儀|れいぎ} や で 。 …… せやけど 、 ここ は {舞台|ぶたい} と ちゃう わ 。 || With a kuroko, it's manners to act like you can't see them. …But this ain't the stage.
@ mp/23_scenes_under [mp.bottom_arrive]
= きっかけ だけ の {芝居|しばい} なんて 、 {人形|にんぎょう} {芝居|しばい} より {冷|つめ}たい わ 。 {役者|やくしゃ} に {名前|なまえ} を {返|かえ}しなさい ！ || A play of nothing but cues is colder than a puppet show. Give the actors back their names!
> きっかけ だけ の {芝居|しばい} なんか 、 {人形|にんぎょう} {芝居|しばい} より {冷|つめ}たい わ 。 {役者|やくしゃ} に {名前|なまえ} を {返|かえ}し ！ || A play of nothing but cues is colder than a puppet show. Give the actors back their names!
@ mp/23_scenes_under [mp.boss_won]
= カーテンコール よ ！ {一人|ひとり} {残|のこ}らず 、 {名前|なまえ} を {呼|よ}ばれて ！ || Curtain call! Every last one, called by name!
> カーテンコール や ！ {一人|ひとり} {残|のこ}らず 、 {名前|なまえ} を {呼|よ}ばれて ！ || Curtain call! Every last one, called by name!
@ mp/22_scenes_fest [mp.manbe_after]
= そう 。 {小|ちい}さい {字|じ} の {役者|やくしゃ} も 、 {役者|やくしゃ} よ 。 || Yes. An actor in small letters is still an actor.
> せや 。 {小|ちい}さい {字|じ} の {役者|やくしゃ} も 、 {役者|やくしゃ} や で 。 || Aye. An actor in small letters is still an actor.
`, 'kansai_94_mp.js');
